> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9hfVQtHxqoNViXCKLX7jCg)

> 本文作者为 360 奇舞团前端开发工程师 宁航

在开发大型前端项目时，往往是一个需求对应一个分支，当完成需求后，就需要将代码打包、部署。代码通常需要部署到多个环境中，这些环境包括：日常环境、测试环境、回归环境和生产环境。回归环境用于在发布前进行测试，生产环境是用户访问的版本。随着时间的推移，项目中会不断引入许多新的依赖（如第三方库、插件等）和图片资源，代码数量也会逐渐增多，从而导致构建项目更加耗时，这也意味着部署项目需要消耗更长的时间。

我负责的项目构建需要 66 秒，有时将代码部署到日常环境后，还需要临时修改重新部署；随后再依次部署到测试环境、回归环境，验证无误后，才能部署到线上环境。如果碰到要紧急上线的任务，这一过程无疑是十分费时的。因此，我决定针对项目构建时间过长的问题进行优化，以此来提高工作效率。本文将对如何优化项目构建速度进行详细介绍，具体过程如下：

一、前期准备
------

当前的构建工具有很多种，例如 Rollup、Webpack、Vite 等，在进行优化工作前，首先要明确项目使用的是哪个构建工具，我的项目是使用`Vue CLI 3`创建的，Vue CLI 在创建项目时会默认使用 Webpack 来构建项目，但在 `Vue CLI`中，默认情况下是不直接暴露 webpack 配置的，只能通过 `vue.config.js` 文件来修改配置。

其次，由于`webpack`在不断更新，新版本会增加许多优化策略，因此，还要明确项目使用的`webpack`版本，再基于这个版本，采用更有针对性的优化方法。经查询，发现`Vue CLI 3`对应`webpack4`，后续的优化方法将围绕该版本展开。

最后，我们还需要对构建过程进行详细分析，以便制定合理的优化策略。当我们运行如下命令，就会开始构建：

```
yarn build
```

`yarn build`会执行`package.json`中定义的构建脚本，在我的项目中，实际上运行了`vue-cli-service build`，该命令会进行如下操作：

**（1）检查配置文件：** `Vue CLI`首先会查找并解析项目中的配置文件`vue.config.js`，以获取构建配置和其他相关的配置信息。

**（2）代码转译和打包：** `Vue CLI`会使用`webpack`和相关的加载器（例如`babel-loader`）对项目的源代码进行转译和打包。这包括将`Vue`单文件组件转换为`JavaScript`、处理`CSS`预处理器（如`Sass`或`Less`）等。

**（3）静态资源处理：** `Vue CLI`会处理项目中的静态资源，如图片、字体等文件。这可能包括复制这些文件到输出目录，并在构建过程中引入适当的路径。

**（4）压缩和优化：** 构建过程还涉及到对输出的 JavaScript、CSS 和其他资源文件进行压缩和优化，以减小文件大小并提高应用性能。

核心步骤如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlIC4Oo7HYQvQibM0jQic34wxb8PqtRJgQ1WeJDPw8GvJtKicqhpJicJuGjKDg/640?wx_fmt=png&from=appmsg)

现在，我们可以思考下可以在哪个阶段进行优化了。“源代码打包” 是最先开始的操作，我首先想到的是这一阶段消耗的时间必然与代码体积呈正相关，即代码体积越大，需要编译的时间就越长，大致如下图所示。因此，如果能减少需要打包的代码体积，就可以节省一部分时间了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICLLVlKAu6XD6bRtbw1lgdHSA1fUfLVIwms4bSwdRRS4NMD7G9icKW2UA/640?wx_fmt=png&from=appmsg)

此外，“源代码打包” 阶段还会使用配置的 loader 对代码进行处理，在一个项目中可以配置多个 loader，例如用`vue-svg-inline-loader`将 `SVG` 文件转换为 Vue 组件中的内联 `SVG` ，用`babel-loader`来转译 js 文件。但`webpack`为单线程模式，只能依次使用每个 loader 处理代码，如果遇到耗时较长的 loader，后续 loader 就只能等待。因此，如果能找到耗时较长的 loader，让它们同时运行，也能节省一些时间。

构建时还会引入项目的图片，如果大尺寸的图片过多，也会影响构建性能。所以，我们还需要将大尺寸的图片进行替换，以提升构建速度。

针对以上 3 个优化点，我寻找了多个方案进行尝试，最终生效的方案如下图所示，后续将会对前两个方案进行详细介绍。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICptxq0iaLiaDupRibrFT9vjMkebgoZx5rCdPIh3rhZZKkRdicQoXZjmE6zQ/640?wx_fmt=png&from=appmsg)

二、提前编译第三方库
----------

### 引入 webpack-bundle-analyzer 插件分析项目体积

Webpack Bundle Analyzer 插件是一个用于分析 Webpack 打包结果的工具，它提供了一个直观的可视化界面，展示了项目打包后的文件结构，各个模块的大小、占比、依赖关系等信息。我们可以根据分析结果，针对性地优化文件大小，减少不必要的资源占用。

1.  安装
    

```
yarn add -D webpack-bundle-analyzer
```

2.  使用
    

```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;module.exports = {    configureWebpack: {        plugins: [            new BundleAnalyzerPlugin()        ]    }}
```

该插件将以树状图的形式展示项目打包后的内容, 从中可以看出每个文件的体积大小。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICrXq9RlOV7geBdEyIXVjibKCjTUS3NlgjBmoGSyWRj91iaNO8WkElxACQ/640?wx_fmt=gif&from=appmsg)

文件的体积参数有以下 3 种：

*   `stat`表示文件未压缩的原始体积
    
*   `parsed`表示文件经过插件处理后的体积，假如项目中使用了 Uglify 插件，那么 parsed 为文件压缩后的体积
    
*   `gzip`表示文件经过`gzip`压缩后的体积
    

3.  项目体积分析
    

我在项目中引入 webpack-bundle-analyzer 插件后，得到了如下的分析图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICYXW50icPggnuP7A1ibH0y5CdUVY1eIgnK9j3ycLfVRv7KDaD71FOlXlw/640?wx_fmt=png&from=appmsg)

通过观察该树状图，可知项目的总体积为 28 MB，其中 3 个最大的文件分别为 index.js（8.71 MB）, preview.js（7.5 MB）, 和 survey.js（7.45 MB）。这三个文件都引用了 element-ui、moment 等第三方库。第三方库的代码往往比较稳定，不会频繁变化。如果将这些第三方库打包成一个动态链接库，并在相关页面引入，那么在每次构建主项目时就不需要重新构建这些库了，从而使得源代码体积减少，打包速度加快。

### 使用动态链接库技术

动态链接库（Dynamic Link Library，DLL）是一种在 Windows 操作系统中常见的技术，可以用来在程序运行时加载共享的代码和资源。动态链接库中的函数、变量和资源可以被多个程序共享使用。这意味着不同的程序可以同时使用同一个动态链接库，从而减少磁盘空间和内存占用。

Webpack 提供了两个插件`DllPlugin`和`DllReferencePlugin`来配置动态链接库，`DllPlugin`用于将第三方库（例如 `Vue`、`React` 等）打包到一个或多个独立的动态链接库（`DLL`）中。`DllReferencePlugin`用于在主项目中引用预先打包好的动态链接库。以下是使用这 2 个插件的基本步骤：

1.  **创建一个用于打包第三方库的配置文件**
    

首先，在项目根目录下创建 `webpack.dll.config.js` 文件，用于配置 `DllPlugin`。

```
// 导入 path 和 webpack 模块const path = require('path');const webpack = require('webpack');// 导出配置对象module.exports = {  // 指定 webpack 模式为生产模式  mode: 'production',   // 入口配置，将需要打包的第三方库列出  entry: {    vendor: ['vue', 'vue-router', 'vuex', /* 此处可以继续添加其他第三方库 */ ]  },  // 输出配置，指定生成的动态链接库文件名称和路径  output: {    filename: '[name].dll.js', // 动态链接库文件名，[name] 表示入口名称    path: path.resolve(__dirname, 'public/dll'), // 动态链接库文件输出目录    library: '[name]' // 将动态链接库导出的内容赋值给变量名 [name]  },  // 插件配置，使用 webpack.DllPlugin 插件  plugins: [    new webpack.DllPlugin({      name: '[name]', // 全局变量名称，保持与 output.library 一致      path: path.resolve(__dirname, 'public/dll/[name].manifest.json') // 动态链接库清单文件路径    })  ]};
```

2.  **创建`npm`脚本**
    

在 `package.json` 文件中，添加一个新的 npm 脚本，用于运行上述 webpack 配置文件：

```
"scripts": {  // ...其他脚本  "dll": "webpack --config webpack.dll.config.js"}
```

运行`yarn dll`，会在`public/dll`文件夹下生产`vendor.dll.js`和`vendor.manifest.json`2 个文件。

*   `vendor.dll.js`文件文件包含了指定的第三方库（例如 `Vue`、`Vue Router`、`Vuex` 等）的代码和资源，以及这些库的导出信息。
    
*   `vendor.manifest.json` 文件是一个清单文件，记录了`vendor.dll.js`文件包含了哪些模块，以及每个模块的路径、`ID` 等信息。主项目在构建时会通过这个清单文件来确定如何引用动态链接库中的模块，以确保正确地加载和使用这些模块。
    

3.  **在 `vue.config.js` 文件引入 `DllReferencePlugin`插件**
    

在 `configureWebpack` 配置中引入 `DllReferencePlugin`：

```
// 导入 webpack 模块const webpack = require('webpack');// 导出配置对象module.exports = {  // 其他配置...  // 配置 webpack  configureWebpack: {    // 插件配置    plugins: [      // 使用 webpack.DllReferencePlugin 插件      new webpack.DllReferencePlugin({        // 指定上下文路径为当前工作目录        context: process.cwd(),        // 指定动态链接库清单文件的路径        manifest: require('./public/dll/vendor.manifest.json')      })    ]  }};
```

4.  **在`html`文件中引入`DLL`文件**
    

配置完成后，运行 yarn build 命令，得到如下结果。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICiaOBCeicbhHBfaVRUxkG4TBlrgVUPmO3IKhqgk1eQVOdlXYkc2UyicUIg/640?wx_fmt=png&from=appmsg)

从图中可以看出，项目的总体积减少到了 7.35 MB，其中 3 个最大的文件分别减少到 2.74 MB（index.js）, 1.74 MB（ preview.js）, 和 1.68 MB （survey.js）。构建时间由 66 秒缩短到了 43 秒，显著加快。

如果项目中引入了新的第三方库，则需要将该库添加到 `webpack.dll.config.js` 的 `entry` 中，并重新运行`yarn dll`即可。

三、为耗时 loader 开启多线程
------------------

### 引入 speed-measure-webpack-plugin 插件分析 loader 耗时

`speed-measure-webpack-plugin` 是一个用于测量 Webpack 打包速度的插件，包括各个阶段的耗时情况，例如初始化、加载、编译、优化、打包等；也可以分析每个 loader 和插件在打包过程中的耗时情况。这有助于我们找到影响性能的具体原因，进行针对性的优化。

1.  安装
    

```
yarn add -D speed-measure-webpack-plugin
```

2.  使用
    

我们需要创建一个 `SpeedMeasurePlugin` 的实例，并使用它来包装配置对象。

```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");const smp = new SpeedMeasurePlugin();module.exports = smp.wrap({    configureWebpack: {        plugins: [            new BundleAnalyzerPlugin()        ]    }});
```

如下图所示，运行`yarn build`后，就可以看到每个`plugin`和`loader`分别花费了多少时间。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICDsR5YfNOsUFWpwMGOmfIugFxujXG1G4xZiaSvpjZzro2qcCApznf0Mg/640?wx_fmt=png&from=appmsg)

### 使用 thread-loader 开启多线程

`thread-loader`可以将指定的 loader 放在 worker 池的子线程中运行，这样能充分利用多核 CPU 的性能，从而实现并行处理。`thread-loader` 适用于任何耗时的 loader，特别是那些需要大量计算的 loader，例如 Babel、TypeScript 等。每个 worker 是一个单独的 Node.js 进程。

在我的项目中，`babel-loader`和`vue-svg-inline-loader`耗时较多，因此我把`thread-loader` 放置到这些 loader 之前，为这些 loader 开辟了单独的线程池。具体配置如下：

```
module.exports = {  // 配置 webpack  chainWebpack: config => {    // 针对 .js 文件的规则配置    config.module      .rule('js') // 添加一个规则命名为 'js'      .test(/\.js$/) // 匹配文件后缀为 .js 的文件      .exclude // 排除特定目录      .add(/node_modules/) // 添加排除目录为 node_modules      .end()       .use('thread-loader') // 使用 thread-loader 处理 .js 文件      .loader('thread-loader') // 指定 thread-loader 作为 loader      .end()       .use('babel-loader') // 使用 babel-loader 处理 .js 文件      .loader('babel-loader') // 指定 babel-loader 作为 loader      .end()     // 针对 .vue 文件的规则配置    config.module      .rule('vue') // 添加一个规则命名为 'vue'      .use('thread-loader') // 使用 thread-loader 处理 .vue 文件      .loader('thread-loader') // 指定 thread-loader 作为 loader      .options({         workers: 2 // 指定 worker 数量为 2      })      .end()       .use('vue-loader') // 使用 vue-loader 处理 .vue 文件      .loader('vue-loader') // 指定 vue-loader 作为 loader      .end()       .use('vue-svg-inline-loader') // 使用 vue-svg-inline-loader 处理 .vue 文件      .loader('vue-svg-inline-loader') // 指定 vue-svg-inline-loader 作为 loader      .end()   }}
```

如果不配置 thread-loader，各个 loader 的加载过程如图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICuVflEue7CSwACd2qJibiaAXuV5rLcCwyCKP6oNsncCSJbj9Mo2uUpRCw/640?wx_fmt=png&from=appmsg)

为耗时 loader 开启单独线程后，加载过程如图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC9diafX6SJNAmqeHe4DBlICjjrlibBGaRrfdpRaKvYuhxpwasyWKUGbmjzJvQh5oxRuu4ZC7yFhaoA/640?wx_fmt=png&from=appmsg)

通过为耗时的 loader 开启多线程，使得项目构建时间从 43 秒减少到了 34 秒。

四、小结
----

通过使用`DllPlugin`和`DllReferencePlugin`插件将第三方库打包成动态链接库，引入`thread-loader`将耗时较长的 loader 放入单独的线程池中加载，替换项目中的大图片，使得项目构建时间从 66 秒减少到了 34 秒，总共减少 32 秒，约 48% 。

项目构建优化是需要不断尝试的，许多方案都不通用，以上 3 个优化点在本项目中起到了作用，下面我还将记录没有生效的方案，希望能为读者提供一些不同的思路，或许这些方案对你的项目有帮助。

1.  用`HardSourceWebpackPlugin`插件进行缓存
    

在优化工作开始后，我最先想到的方案是：在第一次构建时，将没有变化的模块（如第三方库）的打包结果缓存下来，后续构建时直接读取缓存，就可以节省很多时间了。经过一番查找，发现`HardSourceWebpackPlugin`插件很适合用来执行这项工作。

`Webpack`提供了`HardSourceWebpackPlugin`插件来为模块提供中间缓存。如前文所述，`Webpack`在构建时，会解析项目中的每个模块，并根据需要对其进行转换和编译。在这一过程中，该插件会把编译结果保存下来。在下一次构建时，`HardSourceWebpackPlugin`插件会比较当前的模块和缓存中的模块是否一致，如果没有变化，就直接使用缓存结果。

引入该插件后，在本地的测试时发现：第一次构建花费的时间与之前相同，后续的构建速度却显著提升。但是，由于我的项目是使用部门统一的工作台部署，每次都需要重新执行`yarn install`安装依赖，所以该插件并不能产生作用。如果你的项目不是这种工作模式，那我推荐你使用该插件。

2.  压缩代码
    

`Webpack4`默认情况下会对输出的`JavaScript`、`CSS`和其他资源文件进行压缩，但是我们还可以通过一些插件自定义压缩行为。

*   压缩 JS 代码
    

我们可以使用`terser-webpack-plugin`插件来删除空格、注释及未使用的代码，使得压缩后的代码体积更小；此外，它还支持并行压缩。

*   样式文件压缩
    

`mini-css-extract-plugin`插件可以将打包生成的`css`代码从`JavaScript bundle` 中提取出来，在多页面应用中，如果多个页面共享一些`css`样式，使用该插件可以避免重复打包这些共享的样式。此外，分离出的`css`文件也可以与`JavaScript`文件同时加载，从而提高页面加载速度。

需要注意的是插件本身也需一定的时间来加载，因此，我们还应比较引入插件的时间是否高于压缩文件后节省的时间，合理使用。

五、参考资料
------

*   **`webpack-bundle-analyzer`插件**：https://github.com/webpack-contrib/webpack-bundle-analyzer
    
*   **`speed-measure-webpack-plugin`插件**：https://github.com/stephencookdev/speed-measure-webpack-plugin
    
*   **`DllPlugin`和`DllReferencePlugin`：**https://webpack.js.org/plugins/dll-plugin/
    
*   **`thread-loader`: **https://webpack.js.org/loaders/thread-loader/
    
*   **`terser-webpack-plugin`：**https://www.npmjs.com/package/terser-webpack-plugin
    
*   **`mini-css-extract-plugin`：**https://www.npmjs.com/package/mini-css-extract-plugin
    

  

---

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)