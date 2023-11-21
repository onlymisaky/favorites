> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Do1ZqwMxlCXWsEqGrSDiDg)

> 作者：丁楠。我不生产代码，我是代码的搬运工。

背景
--

1.  公司的云 his 静态项目代码量巨大，依赖的 npm 包大概有 100 个，打包一次大概要 14 分钟
    
2.  自研的 hammer 工具的本地打包虽然能提升部署时间，但是依赖开发的手动操作
    
3.  用来存放本地构建产物的服务器容量满了，所以为了正常使用本地打包功能，还得定期去清理服务器上的老文件，不够方便
    
      
    

解决思路
----

1.  node 版本提升 8.x -> 12.x![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL01oqwljlkL1Yn5n51ZF2PIlqQsjGJpZv19yvShGibCTflPcFavbEpmkE3A7jib8683oia9QRyeAVFZHA/640?wx_fmt=png)
    
2.  利用 webpack5 的持久化缓存提升构建效率![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL01oqwljlkL1Yn5n51ZF2PIlb7xboGxuGPibkwU4PEfktSUDK3Un6AP6g8a2qo4BlpFFr9krEbKAQUg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL01oqwljlkL1Yn5n51ZF2PIlalfXyoAUuJvvdtcP1qbqeDYFibQic18cO65T4XBpegeHKVcg4qjtuRRw/640?wx_fmt=png)速度大幅度提升，快了 7 倍。
    
3.  使用基于 rust 开发的 swc 替代 babel，测试的构建速度提升一分钟半左右，因生态不成熟，不能上生产。
    

关键代码
----

```
module.exports = {... cache: {    // 将缓存类型设置为文件系统,默认是memory    type: 'filesystem',    buildDependencies: {      // 更改配置文件时，重新缓存      config: [__filename]    }  },  optimization: {    // 值为"single"会创建一个在所有生成chunk之间共享的运行时文件    runtimeChunk: 'single',    moduleIds: 'deterministic',  },}
```

> webpack 在入口 chunk 中，包含了某些 boilerplate(引导模板)，特别是 runtime 和 manifest。这些代码如果不被单独抽离会导致即使没有代码改动，打包出来的文件名仍然会改变，导致无法命中缓存。webpack4 中使用 HashedModuleIdsPlugin 来生成 hash 值作为模块 id，在 webpack5 中已经不需要了，moduleIds: 'deterministic', 是用来保证模块的 id 不会随着解析顺序的变化而变化，生产环境默认开启。

缓存的方式 (从构建层面来讲)
---------------

### webpack V4

*   cache-loader：建议在开销较大的 loader 前加，比如 babel-loader、vue-loader 等；
    
*   dll：对不经常改变版本的依赖（react、lodash），单独生成动态链接库（bundle），提高构建速度，需要 DllPlugin 、DllReferencePlugin 搭配使用，通过引用 dll 的 manifest 文件来把依赖的名称映射到模块的 id 上，之后再在需要的时候通过内置的 `__webpack_require__` 函数来 require 他们，推荐在开发模式下使用
    

### webpack V5

*   文件系统缓存，配置方式见上面的关键代码，作用是将`Webpack`运行时存在于内存中的那些缓存，不是 loader 的产物，更不是 dll, 根据 Webpack 运行环境的不同，在 dev 开发时依旧使用`MemoryCachePlugin`，而在 build 时使用`IdleFileCachePlugin`。dev/build 的二次编译速度会远超 cache-loader
    

一些原理浅谈
------

> Webpack 5 令人期待的持久缓存优化了整个构建流程，原理依然还是那一套：当检测到某个文件变化时，根据依赖关系，只对依赖树上相关的文件进行编译，从而大幅提高了构建速度。官方经过测试，16000 个模块组成的单页应用，速度竟然可以提高 98%！其中值得注意的是持久缓存会将缓存存储到磁盘。

对于一个持续化构建过程来说，第一次构建是一次全量构建，然后它会将相关产物序列化缓存在磁盘中 (serialize)。后续构建具体流程可以依赖于上一次的缓存进行：读取磁盘缓存 -> 校验模块 -> 解封模块内容。因为模块之间的关系并不会被显式缓存，因此模块之间的关系仍然需要在每次构建过程中被校验，这个校验过程和正常的 webpack 进行分析依赖关系时的逻辑是完全一致的。

对于 resolver 的缓存同样可以持久化缓存起来，一旦 resolver 缓存经过校验后发现准确匹配，就可以用于快速寻找依赖关系。如果 resolver 缓存校验失败的情况，将会直接执行 resolver 的常规构建逻辑。

### 缓存的安全性设计

#### unsafeCache

在 webpack 4.x 的构建过程中基于 timestamp 比对策略的一种 cache 方式，它有两个维度，resolve（解析器）的 unsafeCache 和 module（模块）的 unsafeCache。如果同时开启，那么从入口文件开始，webpack 通过 resolve 规则解析所有的依赖文件，将模块之间的依赖关系和解析后的文件内容保存起来，并存储依赖的最后变更时间（timestamp），一旦发现相同引用，返回缓存。

而 webpack 5.x 版本已经放弃了这种缓存策略，默认只针对开启 cache 选项并且是 node_modules 下的依赖才开启 unsafeCache，判断是否有文件系统序列化后的文件信息来判断是否需要重新构建。

#### safeCache

模块间的依赖关系被基于内容对比的算法（contentHash）被记录下来，并存入到`ModulGraph`的 class 中的 weakmap，相比于依赖时间戳的方式更可靠。

### 缓存的容量限制

除了需要考虑缓存的安全性，缓存的容量限制也不能忽视，缓存不可能无限叠加，这里就涉及到经典的 LRU cache 算法（Least Recently Used 最近最少使用）。![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL01oqwljlkL1Yn5n51ZF2PIltYQGK4Zv2vUBYUNGlG19CVje2mYpqXibb9sjewuloURM1fRT7CnoWlA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL01oqwljlkL1Yn5n51ZF2PIlJw0FabvvmbicQmEbKSgwcpEib9Aicm6oT1jOlABuTlBTYGTAF0GPXN9lQ/640?wx_fmt=png)

*   单向链表 添加、删除节点 O(1)，查找 O(n)
    
*   双向链表加哈希表结合体 O(1)
    

#### LRU 分析

当存在热点数据时，LRU 的效率很好，但偶发性的、周期性的批量操作会导致 LRU 命中率急剧下降，缓存污染情况比较严重。

#### LRU 算法的改进方案

redis 使用的改进算法 LIRS、LRU-K 等，感兴趣的同学自行查阅

`别忘记对我素质三连，点赞、关注、评论^_^`

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