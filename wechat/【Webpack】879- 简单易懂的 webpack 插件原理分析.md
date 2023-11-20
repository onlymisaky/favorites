> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/07a7nSdR_S_ZHusMUwqdfA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCUbN1pqN60R6s3e54Z3x9icUBfsQ39qtYbBkTbNZeSrPuCquz1Ztt9eBmqcAEEOpAdlzPXDJ5icdASg/640?wx_fmt=jpeg)

*   本文作者：lzg9527
    
*   本文链接：juejin.cn/post/6901210575162834958
    

在 webpack 中，专注于处理 webpack 在编译过程中的某个特定的任务的功能模块，可以称为插件。它和 `loader` 有以下区别：  

1.  `loader` 是一个转换器，将 A 文件进行编译成 B 文件，比如：将 `A.less` 转换为 `A.css`，单纯的文件转换过程。webpack 自身只支持 js 和 json 这两种格式的文件，对于其他文件需要通过 `loader` 将其转换为 commonJS 规范的文件后，webpack 才能解析到。
    
2.  `plugin` 是一个扩展器，它丰富了 webpack 本身，针对是 `loader` 结束后，webpack 打包的整个过程，它并不直接操作文件，而是基于事件机制工作，会监听 webpack 打包过程中的某些节点，执行广泛的任务。
    

### plugin 的特征

webpack 插件有以下特征

*   是一个独立的模块。
    
*   模块对外暴露一个 js 函数。
    
*   函数的原型 `(prototype)` 上定义了一个注入 `compiler` 对象的 `apply` 方法。
    
*   `apply` 函数中需要有通过 `compiler` 对象挂载的 webpack 事件钩子，钩子的回调中能拿到当前编译的 `compilation` 对象，如果是异步编译插件的话可以拿到回调 callback。
    
*   完成自定义子编译流程并处理 `complition` 对象的内部数据。
    
*   如果异步编译插件的话，数据处理完成后执行 callback 回调。
    

```
class HelloPlugin {  // 在构造函数中获取用户给该插件传入的配置  constructor(options) {}  // Webpack 会调用 HelloPlugin 实例的 apply 方法给插件实例传入 compiler 对象  apply(compiler) {    // 在emit阶段插入钩子函数，用于特定时机处理额外的逻辑；    compiler.hooks.emit.tap('HelloPlugin', (compilation) => {      // 在功能流程完成后可以调用 webpack 提供的回调函数；    })    // 如果事件是异步的，会带两个参数，第二个参数为回调函数，    compiler.plugin('emit', function (compilation, callback) {      // 处理完毕后执行 callback 以通知 Webpack      // 如果不执行 callback，运行流程将会一直卡在这不往下执行      callback()    })  }}module.exports = HelloPlugin
```

1.  webpack 读取配置的过程中会先执行 `new HelloPlugin(options)` 初始化一个 `HelloPlugin` 获得其实例。
    
2.  初始化 `compiler` 对象后调用 `HelloPlugin.apply(compiler)` 给插件实例传入 compiler 对象。
    
3.  插件实例在获取到 `compiler` 对象后，就可以通过 `compiler.plugin` (事件名称, 回调函数) 监听到 Webpack 广播出来的事件。并且可以通过 `compiler` 对象去操作 Webpack。
    

### 事件流机制

webpack 本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是 `Tapable`。

Webpack 的 `Tapable` 事件流机制保证了插件的有序性，将各个插件串联起来， Webpack 在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条 webapck 机制中，去改变 webapck 的运作，使得整个系统扩展性良好。

`Tapable` 也是一个小型的 library，是 Webpack 的一个核心工具。类似于 node 中的 events 库，核心原理就是一个`订阅发布模式`。作用是提供类似的插件接口。方法如下：

```
//  广播事件compiler.apply('event-name', params)compilation.apply('event-name', params)// 监听事件compiler.plugin('event-name', function (params) {})compilation.plugin('event-name', function (params) {})
```

我们来看下 Tapable

```
function Tapable() {  this._plugins = {}}//发布name消息Tapable.prototype.applyPlugins = function applyPlugins(name) {  if (!this._plugins[name]) return  var args = Array.prototype.slice.call(arguments, 1)  var plugins = this._plugins[name]  for (var i = 0; i < plugins.length; i++) {    plugins[i].apply(this, args)  }}// fn订阅name消息Tapable.prototype.plugin = function plugin(name, fn) {  if (!this._plugins[name]) {    this._plugins[name] = [fn]  } else {    this._plugins[name].push(fn)  }}//给定一个插件数组，对其中的每一个插件调用插件自身的apply方法注册插件Tapable.prototype.apply = function apply() {  for (var i = 0; i < arguments.length; i++) {    arguments[i].apply(this)  }}
```

`Tapable` 为 webpack 提供了统一的插件接口（钩子）类型定义，它是 webpack 的核心功能库。webpack 中目前有十种 hooks，在 Tapable 源码中可以看到，他们是：

```
exports.SyncHook = require('./SyncHook')exports.SyncBailHook = require('./SyncBailHook')exports.SyncWaterfallHook = require('./SyncWaterfallHook')exports.SyncLoopHook = require('./SyncLoopHook')exports.AsyncParallelHook = require('./AsyncParallelHook')exports.AsyncParallelBailHook = require('./AsyncParallelBailHook')exports.AsyncSeriesHook = require('./AsyncSeriesHook')exports.AsyncSeriesBailHook = require('./AsyncSeriesBailHook')exports.AsyncSeriesLoopHook = require('./AsyncSeriesLoopHook')exports.AsyncSeriesWaterfallHook = require('./AsyncSeriesWaterfallHook')
```

`Tapable` 还统一暴露了三个方法给插件，用于注入不同类型的自定义构建行为：

*   tap：可以注册同步钩子和异步钩子。
    
*   tapAsync：回调方式注册异步钩子。
    
*   tapPromise：Promise 方式注册异步钩子。
    

webpack 里的几个非常重要的对象，`Compiler`, `Compilation` 和 `JavascriptParser` 都继承了 `Tapable` 类，它们身上挂着丰富的钩子。

### 编写一个插件

一个 webpack 插件由以下组成：

*   一个 JavaScript 命名函数。
    
*   在插件函数的 prototype 上定义一个 apply 方法。
    
*   指定一个绑定到 webpack 自身的事件钩子。
    
*   处理 webpack 内部实例的特定数据。
    
*   功能完成后调用 webpack 提供的回调。
    

下面实现一个最简单的插件

```
class WebpackPlugin1 {  constructor(options) {    this.options = options  }  apply(compiler) {    compiler.hooks.done.tap('MYWebpackPlugin', () => {      console.log(this.options)    })  }}module.exports = WebpackPlugin1
```

然后在 webpack 的配置中注册使用就行，只需要在 `webpack.config.js` 里引入并实例化就可以了：

```
const WebpackPlugin1 = require('./src/plugin/plugin1')module.exports = {  entry: {    index: path.join(__dirname, '/src/main.js'),  },  output: {    path: path.join(__dirname, '/dist'),    filename: 'index.js',  },  plugins: [new WebpackPlugin1({ msg: 'hello world' })],}
```

此时我们执行一下 `npm run build` 就能看到效果了

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib2B6wZSFRyouRiaFIWfbicLia15RHVFaNNwVmVMiczwibPIFGH1Dv1RUvjew8Rb6Om8BCvwItCtuibZ035Q/640?wx_fmt=png)

### Compiler 对象 （负责编译）

`Compiler` 对象包含了当前运行 Webpack 的配置，包括 `entry`、`output`、`loaders` 等配置，这个对象在启动 Webpack 时被实例化，而且是全局唯一的。`Plugin` 可以通过该对象获取到 Webpack 的配置信息进行处理。

compiler 上暴露的一些常用的钩子：

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib2B6wZSFRyouRiaFIWfbicLia1O0nRHCIkatZiaY7oy7GTjVaf2vCEsdhUxy0RdZ4cianPYlr8oib1eznPw/640?wx_fmt=png)

下面来举个例子

```
class WebpackPlugin2 {  constructor(options) {    this.options = options  }  apply(compiler) {    compiler.hooks.run.tap('run', () => {      console.log('开始编译...')    })    compiler.hooks.compile.tap('compile', () => {      console.log('compile')    })    compiler.hooks.done.tap('compilation', () => {      console.log('compilation')    })  }}module.exports = WebpackPlugin2
```

此时我们执行一下 `npm run build` 就能看到效果了

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib2B6wZSFRyouRiaFIWfbicLia1MrZtwP9ticatPlwxOHucPtPhMM80seuDkGt2VArBV0QMwIjkJLic65YQ/640?wx_fmt=png)

有一些编译插件中的步骤是异步的，这样就需要额外传入一个 callback 回调函数，并且在插件运行结束时执行这个回调函数

```
class WebpackPlugin2 {  constructor(options) {    this.options = options  }  apply(compiler) {    compiler.hooks.beforeCompile.tapAsync('compilation', (compilation, cb) => {      setTimeout(() => {        console.log('编译中...')        cb()      }, 1000)    })  }}module.exports = WebpackPlugin2
```

### Compilation 对象

`Compilation` 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 `compilation`，从而生成一组新的编译资源。一个 `Compilation` 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息，简单来讲就是把本次打包编译的内容存到内存里。`Compilation` 对象也提供了插件需要自定义功能的回调，以供插件做自定义处理时选择使用拓展。

简单来说，`Compilation` 的职责就是构建模块和 Chunk，并利用插件优化构建过程。

`Compiler` 代表了整个 Webpack 从启动到关闭的生命周期，而 `Compilation` 只是代表了一次新的编译，只要文件有改动，`compilation` 就会被重新创建。

`Compilation` 上暴露的一些常用的钩子：

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib2B6wZSFRyouRiaFIWfbicLia1oXiasOpTrgqtA9rHficibfC0lUPNDJ6iaGKoLvx4fqSK4RCn3nYL8u1WDA/640?wx_fmt=png)

`Compiler` 和 `Compilation` 的区别

*   `Compiler` 代表了整个 Webpack 从启动到关闭的生命周期
    
*   `Compilation` 只是代表了一次新的编译，只要文件有改动，`compilation` 就会被重新创建。
    

### 手写插件 1：文件清单

在每次 webpack 打包之后，自动产生一个一个 markdown 文件清单，记录打包之后的文件夹 dist 里所有的文件的一些信息。

思路：

1. 通过 `compiler.hooks.emit.tapAsync()` 来触发生成资源到 output 目录之前的钩子 2. 通过 `compilation.assets` 获取文件数量 3. 定义 markdown 文件的内容，将文件信息写入 markdown 文件内  
4. 给 dist 文件夹里添加一个资源名称为 fileListName 的变量  
5. 写入资源的内容和文件大小  
6. 执行回调，让 webpack 继续执行

```
class FileListPlugin {  constructor(options) {    // 获取插件配置项    this.filename = options && options.filename ? options.filename : 'FILELIST.md'  }  apply(compiler) {    // 注册 compiler 上的 emit 钩子    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, cb) => {      // 通过 compilation.assets 获取文件数量      let len = Object.keys(compilation.assets).length      // 添加统计信息      let content = `# ${len} file${len > 1 ? 's' : ''} emitted by webpack\n\n`      // 通过 compilation.assets 获取文件名列表      for (let filename in compilation.assets) {        content += `- ${filename}\n`      }      // 往 compilation.assets 中添加清单文件      compilation.assets[this.filename] = {        // 写入新文件的内容        source: function () {          return content        },        // 新文件大小（给 webapck 输出展示用）        size: function () {          return content.length        },      }      // 执行回调，让 webpack 继续执行      cb()    })  }}module.exports = FileListPlugin
```

### 手写插件 2：去除注释

开发一个插件能够去除打包后代码的注释，这样我们的 `bundle.js` 将更容易阅读

思路：

1. 通过 `compiler.hooks.emit.tap()` 来触发生成文件后的钩子  
2. 通过 `compilation.assets` 拿到生产后的文件，然后去遍历各个文件  
3. 通过 `.source()` 获取构建产物的文本，然后用正则去 replace 调注释的代码  
4. 更新构建产物对象  
5. 执行回调，让 webpack 继续执行

```
class RemoveCommentPlugin {  constructor(options) {    this.options = options  }  apply(compiler) {    // 去除注释正则    const reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)|(\/\*\*\*\*\*\*\/)/g    compiler.hooks.emit.tap('RemoveComment', (compilation) => {      // 遍历构建产物，.assets中包含构建产物的文件名      Object.keys(compilation.assets).forEach((item) => {        // .source()是获取构建产物的文本        let content = compilation.assets[item].source()        content = content.replace(reg, function (word) {          // 去除注释后的文本          return /^\/{2,}/.test(word) || /^\/\*!/.test(word) || /^\/\*{3,}\//.test(word) ? '' : word        })        // 更新构建产物对象        compilation.assets[item] = {          source: () => content,          size: () => content.length,        }      })    })  }}module.exports = RemoveCommentPlugin
```

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 100[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 100+ 篇原创文章