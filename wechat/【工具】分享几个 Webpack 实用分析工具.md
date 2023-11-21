> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aXLuX7c_li3eNbc46DHqUw)

> 全文 1500 字，阅读时长约 15 分钟。如果觉得文章有用，欢迎点赞关注，但写作实属不易，未经作者同意，禁止任何形式转载！！！❞

设想一个场景，假如需要提升 webpack 编译速度，或者优化编译产物大小，应该从何下手？别急，在采用具体手段前，可以先花点时间了解当前的编译执行情况，确定性能瓶颈，有的放矢！今天就给大家分享一些 webpack 构建过程的分析诊断方法和工具，基于这些工具，你可以：

*   了解编译产物由那些模块资源组成
    
*   了解模块之间的依赖关系
    
*   了解不同模块的编译构建速度
    
*   了解模块在最终产物的资源占比
    
*   等等
    

收集统计信息
======

Webpack 运行过程会收集各种统计信息，只需要在启动时附加 `--json` 参数即可获得：

```
npx webpack --json > stats.json
```

上述命令运行后，会在文件夹下输出 `stats.json` 文件，文件内容主要包含：

```
{  "hash": "2c0b66247db00e494ab8",  "version": "5.36.1",  "time": 81,  "builtAt": 1620401092814,  "publicPath": "",  "outputPath": "/Users/tecvan/learn-webpack/hello-world/dist",  "assetsByChunkName": { "main": ["index.js"] },  "assets": [    // ...  ],  "chunks": [    // ...  ],  "modules": [    // ...  ],  "entrypoints": {    // ...  },  "namedChunkGroups": {    // ...  },  "errors": [    // ...  ],  "errorsCount": 0,  "warnings": [    // ...  ],  "warningsCount": 0,  "children": [    // ...  ]}
```

通常，分析构建性能时主要关注如下属性：

*   **「assets」** ：编译最终输出的产物列表
    
*   **「chunks」** ：构建过程生成的 chunks 列表，数组内容包含 chunk 名称、大小、依赖关系图
    
*   **「modules」** ：本次运行触达的所有模块，数组内容包含模块的大小、所属 chunk、分析耗时、构建原因等
    
*   **「entrypoints」** ：entry 列表，包括动态引入所生产的 entry 项也会包含在这里面
    
*   **「namedChunkGroups」** ：chunks 的命名版本，内容相比于 chunks 会更精简
    
*   **「errors」** ：构建过程发生的所有错误信息
    
*   **「warnings」** ：构建过程发生的所有警告信息
    

基于这些属性，我们可以分析出模块的依赖关系、模块占比、编译耗时等信息，不过这里大致了解原理就行了，社区已经为我们提供了非常多事半功倍的分析工具。

可视化分析工具
=======

Webpack Analysis
----------------

Webpack Analysis 是 webpack 官方提供的可视化分析工具，相比于其它工具，它提供的视图更全，功能更强大，使用上只需要将上一节 `webpack --json > stats.json` 命令生成的 `stats.json` 文件拖入页面，就可以获得一系列分析视图：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEj3C4ib5GkolCWR7wE8bACzOnMbo8k127WKLPByUhaMaoFASiaHdoGVMibA/640?wx_fmt=png)

点击 **「modules/chunks/assets」** 按钮，页面会渲染出对应依赖关系图，例如点击 **「modules」**：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEjVWnxOd2qT2aMcuI0NW5dTOOJ1QCsjEKBibxTIiaJZlribys1XPUdiby7MQ/640?wx_fmt=png)

除 **「modules/chunks/assets」** 外，右上方菜单栏 **「Hints」** 还可以查看构建过程各阶段、各模块的处理耗时，可以用于分析构建的性能瓶颈：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEjYtbZtAGOXwD95wbn4MuPE0qxzzxMf3NMELVMUAAXt2aSGsMm8K5iaUg/640?wx_fmt=png)

> ❝
> 
> 不过，实测发现 **「Hints」** 还不支持 webpack 5 版本的产出，等待官方更新吧。
> 
> ❞

Webpack Analysis 提供了非常齐全的分析视角，信息几乎不失真，但这也意味着上手难度更高，信息噪音也更多，所以社区还提供了一个简化版 webpack-deps-tree，用法相似但用法更简单、信息更清晰，读者可以根据实际场景对比交叉使用。

Webpack Visualizer
------------------

Webpack Visualizer 是一个在线分析工具，同样只需要将 `stats.json` 文件拖入页面，就可以从文件夹到模块逐层看到 `bundle` 的组成：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEjnRa1ianF1uJQ2Ort7pSq2nbnAGYvLichxr7dXrbgNsCpgfurRbcpVczg/640?wx_fmt=png)

> ❝
> 
> 除了在线版本外，Webpack Visualizer 还提供了插件版本的 webpack-visualizer-plugin 工具，但是这个插件年久失修，只兼容 webpack 1.x ，所以现在几乎没有使用价值了。
> 
> ❞

此外，在线工具 Webpack Chart 也提供了类似的功能，功能重合度很高，这里就不展开讲了。

Webpack Bundle Analyzer
-----------------------

webpack-bundle-analyzer 是一个 webpack 插件，只需要简单的配置就可以在 webpack 运行结束后获得 treemap 形态的模块分布统计图，用户可以仔细对比 treemap 内容推断是否包含重复模块、不必要的模块等场景，例如：

```
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")  .BundleAnalyzerPlugin;module.exports = {  ...  plugins: [new BundleAnalyzerPlugin()],};
```

编译结束后，默认自动打开本地视图页面：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEjwb3j6QRYhQibt2zM4ibHx0bzxljlvmUkMH4RNDtdoLKFBvtAtSeUKjvw/640?wx_fmt=png)

此外，webpack-bundle-size-analyzer 也提供了类似，但是基于命令行视图的分析功能，可以基于 webpack-bundle-size-analyzer 做一些自动分析、自动预警功能。

Webpack Dashboard
-----------------

webpack-dashboard 是一个命令行可视化工具，能够在编译过程中实时展示编译进度、模块分布、产物信息等，与 webpack-bundle-size-analyzer 类似，它也只需要一些简单的改造就能运行，首先需要注册插件：

```
const DashboardPlugin = require("webpack-dashboard/plugin");module.exports = {  // ...  plugins: [new DashboardPlugin()],};
```

其次，修改 webpack 的启动方式，例如原来的启动命令可能是：

```
"scripts": {    "dev": "node index.js", # OR    "dev": "webpack-dev-server", # OR    "dev": "webpack",}
```

需要修改为：

```
"scripts": {    "dev": "webpack-dashboard -- node index.js", # OR    "dev": "webpack-dashboard -- webpack-dev-server", # OR    "dev": "webpack-dashboard -- webpack",}
```

之后，就可以在命令行看到一个漂亮的可视化界面：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEjKlej5HMLkkqPjMfSnogt8HMeJLcALyqHBecbBMyicYdIZ2QwS0zhiakg/640?wx_fmt=png)

UnusedWebpackPlugin
-------------------

最后分享 UnusedWebpackPlugin 插件，它能够根据 webpack 统计信息，反向查找出工程项目里那些文件没有被用到，我日常在各种项目重构工作中都会用到，非常实用。用法也比较简单：

```
const UnusedWebpackPlugin = require("unused-webpack-plugin");module.exports = {  // ...  plugins: [    new UnusedWebpackPlugin({      directories: [path.join(__dirname, "src")],      root: path.join(__dirname, "../"),    }),  ],};
```

示例中，directories 用于指定需要分析的文件目录；root 用于指定根路径，与输出有关。配置插件后，webpack 每次运行完毕都会输出 directories 目录中，有那些文件没有被用到：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllFcPDbzWwlyje5ab5LdOEjpxAdfqUXq9QoEF4ILACZhEkAEpTiaYKXt3j4gHMwYic0gmoS43GOfGKw/640?wx_fmt=png)

总结
==

工欲善其事，必先利其器！上面分享的工具都在解决相似的问题 —— 构建分析，只是具体的侧重点、用法、交互形态略有不同，读者可以结合实际场景，择优选用。

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 120[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 130+ 篇原创文章