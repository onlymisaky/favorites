> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/7MR1raMmafEELiC9qTSaYQ) ![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4AfgQeb1DhBNAGwYiajhEh2VORJfo2TTibwUozJAKnhKX0azeVeibnZE4A/640?wx_fmt=png)

背景
==

最近发现项目 (基于 Vue2) 构建比较慢， 一次上线发布需要 `15` 分钟， 效率低下。

如今这个时代，`时间就是金钱，效率就是生命`。

于是这两天抽空对项目做了一次构建优化，线上 (多国家) 构建时间, 从 `10分钟` 优化到 `4分钟`, 本地单次构建时间， 从 `300秒` 优化到 `90秒`， 效果还不错。

整个过程，改造成本不大， 但是收益很可观。

今天把 `详细的改造过程` 和 相关 `技术原理` 整理出来分享给大家， 希望对大家有所帮助。

正文
==

首先看一下摆在面前的问题：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4icDWgLK69fgyhPSSicLBsCy48v0hDP371T9BODm5rXIsyHmFJPz6UTRQ/640?wx_fmt=png)WechatIMG37.png

可以明显看出：`整体构建环节耗时过长， 效率低下，影响业务的发布和回滚`。

线上构建流程：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4kz5MXLRsBIEibts5wHZicPkelnZDgx10pKfbBJrsTT2Arc5cNicS0s2Jw/640?wx_fmt=png)

其中， `Build base` 和 `Build Region` 阶段存在优化空间。

`Build base` 阶段的优化， 和运维团队沟通过， 后续会增加缓存处理。

本次主要关注 `Build Region` 阶段。

初步优化后，达到效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4jbemSP8bZCF5VzjoNyo30gmW3oe1pV6RzbCrFbq7ZR9Euag1trazIg/640?wx_fmt=png)

基本达到预期。

下面介绍这次优化的细节。

项目优化实战
------

面对耗时大这个问题，首先要做耗时数据分析。

这里引入 `SpeedMeasurePlugin`, 示例代码如下：

```
# vue.config.jsconst SpeedMeasurePlugin = require("speed-measure-webpack-plugin");configureWebpack: (config) => {  config.plugins.push(new SpeedMeasurePlugin());}
```

得到结果如下：

```
得到： SMP  ⏱  Loaderscache-loader, and vue-loader, and eslint-loader took 3 mins, 39.75 secs  module count = 1894cache-loader, and thread-loader, and babel-loader, and ts-loader, and eslint-loader took 3 mins, 35.23 secs  module count = 482cache-loader, and thread-loader, and babel-loader, and ts-loader, and cache-loader, and vue-loader took 3 mins, 16.98 secs  module count = 941cache-loader, and vue-loader, and cache-loader, and vue-loader took 3 mins, 9.005 secs  module count = 947mini-css-extract-plugin, and css-loader, and vue-loader, and postcss-loader, and sass-loader, and cache-loader, and vue-loader took 3 mins, 5.29 secs  module count = 834modules with no loaders took 1 min, 52.53 secs  module count = 3258mini-css-extract-plugin, and css-loader, and vue-loader, and postcss-loader, and cache-loader, and vue-loader took 27.29 secs  module count = 25css-loader, and vue-loader, and postcss-loader, and cache-loader, and vue-loader took 27.13 secs  module count = 25file-loader took 12.049 secs  module count = 30cache-loader, and thread-loader, and babel-loader took 11.62 secs  module count = 30url-loader took 11.51 secs  module count = 70mini-css-extract-plugin, and css-loader, and postcss-loader took 9.66 secs  module count = 8cache-loader, and thread-loader, and babel-loader, and ts-loader took 7.56 secs  module count = 3css-loader, and // ...Build complete.fetch translationsen has been saved!id has been saved!sp-MX has been saved!vi has been saved!zh-TW has been saved!zh-CN has been saved!th has been saved!$ node ./script/copy-static-asset.js✨  Done in 289.96s.
```

统计出耗时比较大的几个 loader:

```
Vue-loader 
eslint-loader
babel-loader
Ts-loader,
Thread-loader,
cache-loader
```

一般而言， 代码编译时间和`代码规模`正相关。

根据以往优化经验，`代码静态检查`可能会占据比较多时间，目光锁定在 `eslint-loader` 上。

在生产构建阶段， eslint 提示信息价值不大， 考虑在 build 阶段去除，`步骤前置`。

比如在 `commit` 的时候做检查， 或者在 `merge` 的时候加一条流水线，专门做静态检查。

给出部分示例代码：

```
image: harbor.shopeemobile.com/shopee/nodejs-base:16stages:  - cici_job:  stage: ci  allow_failure: false  only:    - merge_requests  script:    - npm i -g pnpm    - pnpm pre-build && pnpm lint && pnpm test  cache:    paths:      - node_modules    key: project
```

于此，初步确定两个优化方向:

1.  `优化构建流程`， 在生产构建阶段去除不必要的检查。
    
2.  `集成 esbuild`， 加快底层构建速度。
    

### 1. 优化构建流程

检查项目的配置发现：

```
# vue.config.jslintOnSave: true,
```

修改为：

```
# vue.config.jslintOnSave: process.env.NODE_ENV !== 'production',
```

即：生产环境的构建不做 lint 检查。

Vue 官网对此也有相关描述：https://cli.vuejs.org/zh/config/#lintonsave

再次构建， 得到如下数据：

```
SMP  ⏱  Loaderscache-loader, and vue-loader took 1 min, 34.33 secs  module count = 2841cache-loader, and thread-loader, and babel-loader, and ts-loader took 1 min, 33.56 secs  module count = 485vue-loader, and cache-loader, and thread-loader, and babel-loader, and ts-loader, and cache-loader, and vue-loader took 1 min, 31.41 secs  module count = 1882vue-loader, and mini-css-extract-plugin, and css-loader, and postcss-loader, and sass-loader, and cache-loader, and vue-loader took 1 min, 29.55 secs  module count = 1668css-loader, and vue-loader, and postcss-loader, and sass-loader, and cache-loader, and vue-loader took 1 min, 27.75 secs  module count = 834modules with no loaders took 59.89 secs  module count = 3258...Build complete.fetch translationsvi has been saved!zh-TW has been saved!en has been saved!th has been saved!sp-MX has been saved!zh-CN has been saved!id has been saved!$ node ./script/copy-static-asset.js✨  Done in 160.67s.
```

有一定提升，其他 loader 耗时数据无明显异常。

下面开始集成 esbuid。

### 集成 esbuild

这部分的工作，主要是：`集成 esbuild 插件到脚手架中`。

具体代码的修改，要看具体情况，大体分为两类：

1.  自己用 webpack 实现了打包逻辑。
    
2.  用的是 cli 自带的打包配置， 比如 vue-cli。
    

这两种方式我都会介绍，虽然`形式上有所差异`， 但是`原理都是一样的`。

核心思路如下：

```
rules: [    {        test: /\.(js|jsx|ts|tsx)$/,        loader: 'esbuild-loader',        options: {            charset: 'utf8',            loader: 'tsx',            target: 'es2015',            tsconfigRaw: require('../../tsconfig.json'),        },        exclude: /node_modules/,    },    ...]
```

```
const { ESBuildMinifyPlugin } = require('esbuild-loader');optimization: {    minimizer: [        new ESBuildMinifyPlugin({            target: 'es2015',            css: true,        }),    ],    ...}
```

具体实现上，简单区分为两类， 详细配置如下：

### 一、webpack.config.js

```
npm i -D esbuild-loader
```

#### 1. Javascript & JSX transpilation (eg. Babel)

In webpack.config.js:

```
module.exports = {    module: {      rules: [-       {-         test: /\.js$/,-         use: 'babel-loader',-       },+       {+         test: /\.js$/,+         loader: 'esbuild-loader',+         options: {+           loader: 'jsx',  // Remove this if you're not using JSX+           target: 'es2015'  // Syntax to compile to (see options below for possible values)+         }+       },        ...      ],    },  }
```

#### 2. TypeScript & TSX

In webpack.config.js:

```
module.exports = {    module: {      rules: [-       {-         test: /\.tsx?$/,-         use: 'ts-loader'-       },+       {+         test: /\.tsx?$/,+         loader: 'esbuild-loader',+         options: {+           loader: 'tsx',  // Or 'ts' if you don't need tsx+           target: 'es2015',+      tsconfigRaw: require('./tsconfig.json'), // If you have a tsconfig.json file, esbuild-loader will automatically detect it.+         }+       },        ...      ]    },  }
```

#### 3. JS Minification (eg. Terser)

esbuild 在代码压缩上，也有不错的表现：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu45a8R4ibuh7Kf6tCCawKY7MFuNlN5KB6pWE0eSTIy25CyoWImMaiaHHnQ/640?wx_fmt=png)

详细对比数据见：https://github.com/privatenumber/minification-benchmarks

In webpack.config.js:

```
+ const { ESBuildMinifyPlugin } = require('esbuild-loader')  module.exports = {    ...,+   optimization: {+     minimizer: [+       new ESBuildMinifyPlugin({+         target: 'es2015'  // Syntax to compile to (see options below for possible values)+   css: true  // Apply minification to CSS assets+       })+     ]+   },  }
```

#### 4. CSS in JS

如果你的 css 样式不导出为 css 文件， 而是通过比如'style-loader'加载的，也可以通过 esbuild 来优化。

In webpack.config.js:

```
module.exports = {    module: {      rules: [        {          test: /\.css$/i,          use: [            'style-loader',            'css-loader',+           {+             loader: 'esbuild-loader',+             options: {+               loader: 'css',+               minify: true+             }+           }          ]        }      ]    }  }
```

更多 esbuild 案例， 可以参考：https://github.com/privatenumber/esbuild-loader-examples

### 二、vue.config.js

配置比较简单，直接贴代码了：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4Pq9du9KQtRzWKnkd2iblamibwyCxSyUDM0jfsNl7vG79YuoDs4P5BNfw/640?wx_fmt=png)

```
// vue.config.jsconst { ESBuildMinifyPlugin } = require('esbuild-loader');module.exports = {  // ...  chainWebpack: (config) => {    // 使用 esbuild 编译 js 文件    const rule = config.module.rule('js');    // 清理自带的 babel-loader    rule.uses.clear();    // 添加 esbuild-loader    rule      .use('esbuild-loader')      .loader('esbuild-loader')      .options({        loader: 'ts', // 如果使用了 ts, 或者 vue 的 class 装饰器，则需要加上这个 option 配置， 否则会报错：ERROR: Unexpected "@"        target: 'es2015',        tsconfigRaw: require('./tsconfig.json')      })    // 删除底层 terser, 换用 esbuild-minimize-plugin    config.optimization.minimizers.delete('terser');    // 使用 esbuild 优化 css 压缩    config.optimization      .minimizer('esbuild')      .use(ESBuildMinifyPlugin, [{ minify: true, css: true }]);  }}
```

这一番组合拳打完，本地单次构建：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu48yZ0qaB6zj9YdzuJshEQ7u6o3uibP8XrqbwGV854Pu21bCGAQBcTjgg/640?wx_fmt=png)

效果还是比较明显的。

一次线上构建， 整体时间从 10 分钟缩短为 4 分钟。

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4VQhiafnVoSicNDyiaPvql3HqicnlzMxEuUTJ9TGG8QHAmxo3ZibxK6hyGMw/640?wx_fmt=png)

然而，开心不到两分钟，发现隔壁项目竟然可以做到 2 分钟...

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4otxyfv2iaWA8vOAmiaxibJTfvbcTrEWMJrF0XvFnzibX12udZbwOH6TGmA/640?wx_fmt=png)

这我就不服气了，同样是 esbuild , 为何你的就这么秀？

去研究了一下, 找到了原因。

1.  他们的项目是 React + TSX, 我这次优化的项目是 Vue, 在文件的处理上就需要多过一层 `vue-loader`。
    
2.  他们的项目采用了微前端， 对项目对了拆分，主项目只需要加载基座相关的代码， 子应用各自构建。需要构建的主应用代码量大大减少， 这是主要原因。
    

这种微前端的拆分方式在我之前的文章中提到过， 看兴趣的可以去看看。

你需要了解的 esbuild
--------------

第一部分主要介绍了一些实践中的细节， 基本都是配置， 没有太多有深度的内容， 这部分将介绍 更多 esbuild 原理性的内容作为补充。

去年也写过两篇相关的内容， 感兴趣的可以去看看。

1.  「 不懂就问 」esbuild 快在哪里 ?
    
2.  「 不懂就问 」webpack 打包的性能瓶颈在哪里 ？
    

本部分将从 4 个方面为大家介绍。

1.  前端遇到了什么瓶颈 & esbuild 能解决什么问题
    
2.  性能优先的设计哲学 & 与其它工具合作共赢
    
3.  esbuild 官方的定位
    
4.  畅想 esbuild 的未来
    

### 1. 前端遇到了什么瓶颈 & esbuild 能解决什么问题

#### 前端工程化的瓶颈

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4EiaCtQF8m7KAet175LkLoSh5Dlx34IdicYefQRetjVJvmgGL0frACeHg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4AreOukuXH4es0yiapvIibXc2HLD3VeCkgKQK8fRpQA7mibhI4Igc4tgdA/640?wx_fmt=png)

#### JS 之外的构建工具

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4ClG3ibJRLXdJia83EEIpO9YcIumz2ssPyHE6pnLOSqk1crp6EcddfHvw/640?wx_fmt=png)

### esbuild 解决的问题

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4SWO4gJ1icOhFmKZKicIMohg2qPzsoLGZics7OYDMP3f5JuMwkVR1K4eqQ/640?wx_fmt=png)

社区插件集

### 2. 性能优先的设计哲学 & 与其它工具合作共赢

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4qNtXPpsGqyCB80AkSuXmaQ3657RVgI2ticibOFbQicBGzolkave6nUBEQ/640?wx_fmt=png)

为何 esbuild 速度如此之快？

1.  使用了 Golang 编写，运行效率与 JS 有数量级的差距
    
2.  几乎所有的设计都以性能优先
    

#### 性能优先的设计哲学

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4hlrJ3ruZD1FwibPLtSvNcXeO384ia9HbxiaVVIE3eW9Hwb37ZlWmEdcxw/640?wx_fmt=png)

#### esbuild 整体架构

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4crjlgfiaYU4icC9xSicxGHCbvicnTQGcqoQPkjwTKWyYvibgeMz9581WX1w/640?wx_fmt=png)https://github.com/evanw/esbuild/blob/master/docs/architecture.md

详见：https://github.com/evanw/esbuild/blob/master/docs/architecture.md

如果未配置 GOMAXPROCS，在运行了大量 goroutine 的情况下，Golang 会占满全部 CPU 核数。

上图表明，除了与依赖图和 IO 相关的操作之外，所有的操作都是并行的，且不需要昂贵的序列化和拷贝成本。

可以简单理解为：由于有并行，八核 CPU 可以将编译和压缩速度提升接近八倍（不考虑其它进程开销）。

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4ZiandvFFAzFBrCcLP37nCc7oiaiaq6kmib633VtfEvjayBdRHafhjEAYog/640?wx_fmt=png)

一般来说，直接用命令行调用 esbuild 是最快的，但作为前端，我们暂时还无法避免用 Node.js 来写打包的配置。

当通过 Node.js 调用 esbuild 二进制程序时，会先 spawn 一个子进程，然后将 Node.js 的标准输入输出通过管道连接至子进程。将数据写入子进程 stdin 表示发送数据，监听 stdout 表示接收子进程的输出数据。

在 Golang 侧，如果发现了 --service 启动参数则会执行 runService，这会生成一个 channel 叫 outgoingPackets，写入到这里的数据最终会被写入到 stdout（表示发送数据），在 main loop 中从 stdin 读数据表示接收数据。

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4X6ibULApq99uEkCbDtYQOiaSfjO4AeEXFCGxSQ7RuYajsKQBiaia8gVocQ/640?wx_fmt=png)

其实 esbuild 的项目结构并不复杂，去除掉文档等一些与代码无关的东西后是这样的，遵循 Golang 标准项目结构，大概的调用链路就是 cmd -> pkg -> internal。

由于 esbuild 的功能更多一些，因此 internal 目录里面的包比 Babel 要复杂。此外 Babel 大部分的转换是基于 preset 和 plugin 做的，但 esbuild 是程序本身自带，所以扩展性差了一些。

最下面的 pkg 包是一些可以被其它 Golang 项目调用的包，开发者可以在 Golang 项目里轻松调用 esbuild API 来构建（就好比写了一个 Webpack 来调用 Babel）。

golang 内部实现一览：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu42S8LzJvK1htMrLKqcZNFtIs3aUhhu24mNYpKsllgao23xycGibxQjfg/640?wx_fmt=png)

https://dreampuf.github.io/GraphvizOnline/

```
godepgraph -s -novendor ./cmd/esbuild
```

#### 与其它工具合作共赢

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4nUwhpSXwxVia6R76mB2wqGSLeCybYLA6wRAhLQAjB4iabfM5SpOcyTBg/640?wx_fmt=png)

使用 Golang 与 Node.js 调用 esbuild 的示例（esbuild 作为其它工具流程的一部分）：

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4n7fJYlbzSTeSdfvYIbYZrFaHMLoJu5J0gRdRcq7WZp3cicbTknHf1YA/640?wx_fmt=png)

### 3. esbuild 官方的定位

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4Yz9uNFggsJlia91LhgBUwEBK2zXtsdIXxiauKMGyYwCU6PRLTYZCJong/640?wx_fmt=png)

虽然 esbuild 已经很优秀、功能比较齐全了，但作者的意思是 “探寻前端构建的另一种可能”，而不是要替代掉 Webpack 等工具。

目前看来，对于大部分项目来说，最好的做法可能还是用 esbuild-loader，将 esbuild 只作为转换器和代码压缩工具，成为流程的一部分。

esbuild 最近半年的 changelog 都是非常边缘的问题修复，加上有 Vite 背书，因此可以认为基本稳定了。

### esbuild 接入方式

1.  通过 esbuild-loader 接入
    

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4kpricu6d9LgJjB9q3Nx6YUGmqU00T6WBCDOcz7ty607pjqicWUPF6USQ/640?wx_fmt=png)

2.  直接调用 esbuild 二进制
    

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4QloDBDUECAU7yQegK3iauyVfOOQOgjeia57uiad7WUBjiclL3qPficj8aGg/640?wx_fmt=png)

3.  Umi 自带启用 esbuild 功能
    

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4SDDmRsoTsoHG1xBfZtdoV6PiaZlgMEleIQFic2MUuhjEPRziaayH7YYRg/640?wx_fmt=png)

两点结论：

1.  需要根据自己项目的情况来决定使用哪种方式来接入。
    
2.  优化效果因项目而异，因为构建速度不完全取决于 esbuild。
    

### 4. 畅想 esbuild 的未来

![](https://mmbiz.qpic.cn/mmbiz_png/pTwqLfWKewBHyzXTiadQ7ribvXAdicQEIu4NVPfgqXb811pLqGUTyhwBEJ24YEuGFUEnLticibeHZJuXgkRaW0GAH1A/640?wx_fmt=png)

结语
==

esbuild 是一个强大的工具，希望大家能充分使用起来， 为业务带来更大价值。

好了，今天的内容就这么多，希望对大家有所启发。

才疏学浅，文章若有错误，欢迎留言指出。

参考资料
====

1.  https://cli.vuejs.org/zh/config/#lintonsave
    
2.  https://esbuild.github.io/getting-started/#your-first-bundle
    
3.  https://morioh.com/p/cfd2609d744e
    
4.  https://battlehawk233.cn/post/453.html
    
5.  https://esbuild.github.io/api/#build-api
    
6.  https://webpack.docschina.org/configuration/optimization/#optimizationminimizer
    
7.  https://github.com/privatenumber/esbuild-loader