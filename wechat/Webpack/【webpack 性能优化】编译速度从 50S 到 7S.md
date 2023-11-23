> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/JdMoc1IF1iDZUb5VPJlz3Q)

本篇文章主要记录下一次 `webpack` 的一次性能优化

现状
--

随着项目不断发展壮大，组件数量开始变得越来越多，项目也开始变得庞大，`webpack` 编译的时间也会越来越久，我们现在的项目编译一次在 `40s ——70s` 之间，这是一个效率非常低下的操作。优化的手段有很多，之前项目原本已经做了很多，本文从缓存的角度进行优化讲解

以下仅介绍几种缓存相关的优化手段，包括

*   `babel-loader` 的 `cacheDirectory`
    
*   `cache-loader`
    
*   `dll` 动态链接库
    
*   `HardSourceWebpackPlugin`
    

先说结论，第一个是项目中已有的，第二第三个效果不大，第四个达到了预期的效果

> 我们的 webpack 版本：4.41.2，系统：mac os

瓶颈分析
----

优化的第一步，应该是分析目前的性能，这里我们使用 `speed-measure-webpack-plugin` 进行速度分析

```
// 安装
npm install --save-dev speed-measure-webpack-plugin
```

```
// 使用方式const SpeedMeasurePlugin = require("speed-measure-webpack-plugin"); const smp = new SpeedMeasurePlugin(); const webpackConfig = smp.wrap({  plugins: [    new MyPlugin(),    new MyOtherPlugin()  ]});
```

结果类似如下，可以看到每一个 `Loader` 以及 `Plugin` 的耗时，有了这个，我们就可以 “对症下药”

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTGUtOfJzNypmKDTm1vH4FFAAFEhzO0ZQYpvINPXIHBkrYWzl8Rz8qDg/640?wx_fmt=png)

但需要注意的是：**HardSourceWebpackPlugin 和 speed-measure-webpack-plugin 不能一起使用**，这一点让我郁闷了很久

babel-loader 的 cacheDirectory
-----------------------------

`babel-loader` 允许使用 `Babel` 和 `webpack` 转译 `JavaScript` 文件，有时候如果我们运行 `babel-loader` 很慢的话，可以考虑确保转译尽可能少的文件。你可能使用 `/\.m?js$/` 来匹配，这样有可能去转译 `node_modules` 目录或者其他不需要的源代码，导致性能下降

可以通过 `exclude` 排除掉一些不需要编译的文件。比如下面就不会去转义 `node_modules` 和 `bower_components` 文件夹下面的内容

```
module: {  rules: [    {      test: /\.m?js$/,      exclude: /(node_modules|bower_components)/,      use: {        loader: 'babel-loader',        options: {          presets: ['@babel/preset-env'],          plugins: ['@babel/plugin-proposal-object-rest-spread']        }      }    }  ]}
```

你也可以通过使用 `cacheDirectory` 选项，将 `babel-loader` 提速至少两倍。这会将转译的结果缓存到文件系统中。`cacheDirectory` 默认值为 `false`。当有设置时，指定的目录将用来缓存 `loader` 的执行结果。之后的 `webpack` 构建，将会尝试读取缓存，来避免在每次执行时，可能产生的、高性能消耗的 `Babel` 重新编译过程 (`recompilation process`)。如果设置了一个空值 `(loader: 'babel-loader?cacheDirectory')`或者 `true (loader: 'babel-loader?cacheDirectory=true')`，loader 将使用默认的缓存目录`node_modules/.cache/babel-loader`，如果在任何根目录下都没有找到 `node_modules` 目录，将会降级回退到操作系统默认的临时文件目录。

```
{  test: /\.js$/,  use: 'babel-loader?cacheDirectory',  include: [resolve('src'), resolve('test') ,resolve('node_modules/webpack-dev-server/client')]}
```

cache-loader
------------

除了 `babel-loader`, 如果我们想让其他的 `loader` 的处理结果也缓存，该怎么做呢？

答案是可以使用 `cache-loader`。在一些性能开销较大的 `loader` 之前添加 `cache-loader`，以便将结果缓存到磁盘里

安装

```
npm install --save-dev cache-loader
```

配置

```
module.exports = {  module: {    rules: [      {        test: /\.ext$/,        use: ['cache-loader', ...loaders],        include: path.resolve('src'),      },    ],  },};
```

> ⚠️ 请注意，保存和读取这些缓存文件会有一些时间开销，所以请只对性能开销较大的 loader 使用此 loader

除了默认的配置，`cache-loader` 提供了其他一些选项，详见 cache-loader[1]

dll 的缓存方案
---------

什么是 DLL？

DLL 文件为动态链接库，在一个动态链接库中可以包含给其他模块调用的函数和数据

为什么要用 DLL？

原因在于包含大量复用模块的动态链接库只需要编译一次，在之后的构建过程中被动态链接库包含的模块将不会在重新编译，而是直接使用动态链接库中的代码。由于动态链接库中大多数包含的是常用的第三方模块，例如 `Vue react、react-dom`，只要不升级这些模块的版本，动态链接库就不用重新编译

如何使用？

要完成下面三步：

*   抽离。把网页依赖的基础模块抽离出来，打包到一个个单独的动态链接库中去。一个动态链接库中可以包含多个模块
    
*   获取。当需要导入的模块存在于某个动态链接库中时，这个模块不能被再次被打包，而是去动态链接库中获取
    
*   加载。页面依赖的所有动态链接库需要被加载
    

之前使用 `DllPlugin` 和 `DllReferencePlugin` 完成，但是其配置非常复杂，而且假如更新了文件，还需要手动重新生成 dll。这里选择了 AutoDllPlugin[2]，它会自动完成以上两个插件的功能，这是 `Vue-cli` 曾经用过的一个插件

安装：

webpack 4

```
npm install --save-dev autodll-webpack-plugin
```

webpack 2 / 3

```
npm install --save-dev autodll-webpack-plugin@0.3
```

基础使用：

```
plugins: [  new HtmlWebpackPlugin({    inject: true,    template: './src/index.html',  }),  new AutoDllPlugin({    inject: true, // will inject the DLL bundles to index.html    filename: '[name].js',    entry: {      vendor: [        'react',        'react-dom'      ]    }  })]
```

### 优化前

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTMbfBP76EWic230xg0Vp3LxODrRo166jzkD2PwVmGFTqEvicqbsD0Kuow/640?wx_fmt=png)

### 优化后

第一次编译：

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTpgfRTLYXXib9Kr2gS3Sbd2Fv9J4ZbDVuyIqzQJ21FXKiauX2FDdibSIEg/640?wx_fmt=png)

第二次编译：![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTZtSdsLOIicBsB0kb3G2GiaFYhhvzHAAPa8NQvIYGoGG81dGpbY3icjZqw/640?wx_fmt=png)

优化了几 s，成效不大

之所以成效不大，是因为 `webpack4` 的性能是足够优秀的了，`Vue-cli` 也废除了这个功能

HardSourceWebpackPlugin
-----------------------

安装：

```
npm install --save-dev hard-source-webpack-plugin# oryarn add --dev hard-source-webpack-plugin
```

配置：

```
// webpack.config.jsvar HardSourceWebpackPlugin = require('hard-source-webpack-plugin');module.exports = {  context: // ...  entry: // ...  output: // ...  plugins: [    new HardSourceWebpackPlugin()  ]}
```

### 优化前

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTN3QeD3BrnWGjv1ObpWB6XdyUObJ38jcdG7ibawY6z168TTib6HvhjLow/640?wx_fmt=png)

可以看到，需要 50s

### 优化后

第一次启动

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTXnSTAq2hG6Pf2AIcSlLubFm8vyeiabKrqnqt40enh7OlBA5XgMjnMqQ/640?wx_fmt=png)

第二次启动

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSo4UbeOEQaicO3OV8KmU49hTianZftqUViaIzeDNfnraOygVlLAEIesicGzsoNTUchNXCU0EasG6Fn41g/640?wx_fmt=png)

只需要 7 s，减少了 `43 s`，速度提升百分之八十左右。优化的目的达成！

热更新速度
-----

看到 `issue` 中提到了关于热更新相关的，说是会慢一点，我利用我们的项目做了一些测试，下面是测试数据

### 优化前

js: 2443ms  1634ms 1844ms 2532ms 1443ms 1248ms

html: 1094ms 1232ms 1119ms 1490ms 1264ms

css: 1422ms 1186ms 1341ms  1562ms 1183ms

### 优化后

js: 2429ms 2436ms 2860ms 2528ms 1917ms 1487ms 1450ms 1450ms 1557ms 2198ms

html: 2855ms 1569ms 1400ms 1298ms 1204ms 1299ms 1578ms 1485ms 2028ms

css: 2035ms 1406ms 1415ms 1600ms 1773ms 1604ms

相比而言，有时候会慢了一些，但总体而言能够接受。但也有了一些影响，所以项目中提高了两个 `npm script` 命令，如果不希望开启的话，可以直接 `npm run dev:noCache`

```
"scripts": {  "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js --cache=true",  "dev:noCache": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js --cache=false"}
```

在 `build/webpack.dev.conf.js` 中

```
if (args.cache) {  devConfig = merge(devConfig, {    plugins: [new HardSourceWebpackPlugin()]  })}
```

再次强调：

**HardSourceWebpackPlugin 和 speed-measure-webpack-plugin 不能一起使用**

展望未来
----

`webpack 5` 已经发布，其中有一个很吸引人的功能——持久缓存（据说思想跟 `HardSourceWebpackPlugin` 是一致的）

通过 `cache`  缓存生成的 `webpack` 模块和`chunk`，来改善构建速度。`cache` 会在开发模式被设置成 `type: 'memory'` 而且在生产模式中被禁用

```
module.exports = {  cache: {    // 1. 将缓存类型设置为文件系统    type: 'filesystem',    buildDependencies: {      // 2. 将你的 config 添加为 buildDependency，以便在改变 config 时获得缓存无效      config: [__filename],      // 3. 如果你有其他的东西被构建依赖，你可以在这里添加它们      // 注意，webpack、加载器和所有从你的配置中引用的模块都会被自动添加    },  },};
```

总结
--

以上的探索，花费了笔者挺多的时间的，菜是原罪，还是要多积累。另外一个感慨就是前端的发展如此迅速，很多东西可能已经过时，唯有保持持续学习以及稳固基础知识才是王道

以上，希望对大家有所帮助

参考
--

*   Webpack 4 如何优雅打包缓存文件 [3]
    
*   辛辛苦苦学会的 webpack dll 配置，可能已经过时了 [4]
    
*   阔别两年，webpack 5 正式发布了！[5]
    

### 参考资料

[1]

cache-loader: _https://webpack.docschina.org/loaders/cache-loader/_

[2]

AutoDllPlugin: _https://github.com/asfktz/autodll-webpack-plugin_

[3]

Webpack 4 如何优雅打包缓存文件: _https://imweb.io/topic/5b6f224a3cb5a02f33c013ba_

[4]

辛辛苦苦学会的 webpack dll 配置，可能已经过时了: _https://juejin.im/post/6844903952140468232_

[5]

阔别两年，webpack 5 正式发布了！: _https://juejin.im/post/6882663278712094727_