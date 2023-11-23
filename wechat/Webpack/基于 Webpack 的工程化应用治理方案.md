> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/83-i4NQoy5fNi0kMqwyfKQ)

点击上方 前端瓶子君，关注公众号  

回复算法，加入前端编程面试算法每日一题群

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQTRRxkjzCIbRDfKI9AJZLaSMXxPCdv1xkhXsoDrfhFFa0T3ucj5SrxBI7PIKACMFfwIqjmX1ia2dZg/640?wx_fmt=jpeg)

> 当前市面上大部分前端应用都是基于 webpack 进行构建，而随着应用日益庞大，webpack 应用就会出现构建速度慢，构建结果体积大等一系列问题。

### 1.webpack 应用治理应该从哪个方向入手？

随着应用的不断迭代，webpack 应用最常见的两个问题就是：

1.  构建速度慢
    
2.  构建体积大
    

有一个很简单的划分方式，就是以构建（build）为分界线，分成前向治理和后向治理：

*   前向治理：提升构建速度
    
*   后向治理：保证构建结果质量
    

我们的治理方向，就是围绕前向治理和后向治理。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQTRRxkjzCIbRDfKI9AJZLaSXVoFbkBicvpicYNHIbjXBqtxfLG4cUEE2fpHFXBoPJmLn56QkNwict8ew/640?wx_fmt=png)

* * *

### 2. 前向治理包含哪些内容？

前向治理的核心概念，就是一个字 `快` ，目的就是提升构建速度，市面上大部分 webpack 优化文章都是这一类提升构建速度的文章，所以这里就简单介绍一些不错的实践

#### 2.1 利用 SMP 采集 webpack 数据指标

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQTRRxkjzCIbRDfKI9AJZLaSYlSB4nTpQ2SWvaIhSjCTWicpuzMOYsSscRmpmOI4IB7dnTPjwZbopqA/640?wx_fmt=png)

数据先行，通过 speed-measure-webpack-plugin[1] 采集性能指标，可以得到 webpack 在整个编译过程中在 loader、plugin 上花费的时间，基于该数据可以专项的进行优化和治理。

#### 2.2 开启缓存

如果通过 SMP 分析得知在 loader 编译过程耗时较多，那么可以在核心 loader，例如 babel-loader 中添加缓存。

```
{  loader: 'babel-loader',    options: {      cacheDirectory: true    }}复制代码
```

#### 2.3 开启 happyPack 多线程编译

如果通过 SMP 分析得知在 loader 编译过程耗时较多，还可以通过使用 happyPack[2]，开启多线程编译，提升开发效率。

#### 2.4 使用 dll 技术

dll 可以简单理解成提前打包，例如 lodash、echarts 等大型 npm 包，可以通过 dll 将其提前打包好，这样在业务开发过程中就不用再重复去打包了，可以大幅缩减打包时间。

#### 2.5 升级到 webpack5

webpack5 利用 `持久缓存` 来提高构建性能，或许升级 webpack 后，前述的各种优化，都将成为历史。

* * *

### 3. 后向治理包含哪些内容？

后向治理主要保证构建结果的质量

#### 3.1 可视化分析构建结果

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQTRRxkjzCIbRDfKI9AJZLaSVj15s3JHxzeKOTeBO0sSmU1DzRFuXVWuHM8OyWhyvicEoKJVslXvsZA/640?wx_fmt=png)

很常见的就是 webpack-bundle-analyzeer[3]，提供打包结果的可视化展示，如上图给予的决策帮助是：

1.  是否需要按需加载
    
2.  是否需要提取公共代码
    
3.  是否需要制定 cacheGroup 的策略
    

#### 3.2 清理 deadcode

业务开发过程中，随着业务迭代，经常有些文件、模块及代码被废弃，这些废弃代码随着时间推移，将逐渐变为历史包袱，所以针对构建后结果，我们要做的就是清理其中的 deadcode。

前面 webpack-bundle-analyzeer 虽然是最常用的插件，但依旧有一些缺陷：

##### 3.2.1. 体积超小的 deadcode 模块引用，无法被准确识别

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQTRRxkjzCIbRDfKI9AJZLaS2nfqicGeE69g1ic6bB9pbpAbYGhFE7ftdd2C2EppJvL2SLTUcV0QNKgA/640?wx_fmt=png)

例如上图：

*   lodash 体积大一下子就能被发现，就会意识到重复引用或者是未使用
    
*   但 deadcode 模块 c 体积很小，即便被 chunk1、chunk2 都引用了，也不一定能立刻发现，很容易被带到线上
    
*   而且这种 deadcode 也无法通过 splitchunk 来进行优化，因为 splitchunk 根据引用次数提取公共代码，无法分辨是否是废弃代码，所以对模块 c.js 这种的 deadcode 就无力了
    

##### 3.2.2. tree-sharking 只保留有用的代码，但 deadcode 还在那里

tree-sharking 大家都了解，摇掉不需要的代码，做为最终的输出结果，但反过来说，这些废弃代码依旧在本地真实不虚的存在着。

所以如何能准确的清理掉 deadcode 呢？这就需要通过 webpack 的 `统计信息(stats)` 来进行更细节的分析

#### 3.3 统计信息 (stats)

stats[4] 是通过 webpack 编译源文件时，生成的包含有关于模块的统计数据的 JSON 文件，这些统计数据不仅可以帮助开发者来分析应用的依赖图表，还可以优化编译的速度。

```
webpack --profile --json > compilation-stats.json
复制代码
```

通过上述全局命令即可输出统计信息, 例如：

```
{  "version": "1.4.13", // Version of webpack used for the compilation  "hash": "11593e3b3ac85436984a", // Compilation specific hash  "time": 2469, // Compilation time in milliseconds  "filteredModules": 0, // A count of excluded modules when `exclude` is passed to the `toJson` method  "assetsByChunkName": {    // Chunk name to emitted asset(s) mapping    "main": "web.js?h=11593e3b3ac85436984a",    "named-chunk": "named-chunk.web.js",    "other-chunk": [      "other-chunk.js",      "other-chunk.css"    ]  },  "assets": [    // A list of asset objects  ],  "chunks": [    // A list of chunk objects  ],  "modules": [    // A list of module objects  ],  "errors": [    // A list of error strings  ],  "warnings": [    // A list of warning strings  ]}复制代码
```

*   modules：表示 module 的集合
    

*   module：webpack 依赖树中的真实模块
    

*   chunks：表示 chunk 的集合
    

*   chunk：包含 entry 入口、异步加载模块、代码分割（code spliting）后的代码块
    

通过对 modules 和 chunks 加以分析，就可以得到 webpack 完整的依赖关系，从而梳理出废弃文件及废弃代码，同时也可以根据业务形态进行定制。

#### 3.4 webpack-deadcode-plugin

前面提到分析 stats.json，但因为是原始数据，数据量比较大，有一定处理和清洗成本，所以可以使用开源的 webpack-deadcode-plugin[5] 这个插件

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQTRRxkjzCIbRDfKI9AJZLaSmUg8YgR28oDF4osNo3YByiaaCz5N0xvic9mUssyu0pkz3mRJwIz2aUzA/640?wx_fmt=png)

通过 webpack-deadcode-plugin，可以快速筛选出：

1.  未使用的文件
    
2.  未使用的已暴露变量
    

#### 3.5 结合 eslint、tslint 进行治理

lint 可以快速的扫描出未使用的变量，这能够极大的提升我们的 deadcode 清理效率。

1.  首先通过 lint 对未使用变量进行清理
    
2.  再通过 webpack-deadcode-plugin 再扫描出未使用文件和未使用的导出变量
    

顿时整个应用干干净净，舒舒服服！

* * *

### 参考

#### 1. speed-measure-webpack-plugin[6]

#### 2. happyPack[7]

#### 3. webpack-bundle-analyzeer[8]

#### 4. stats[9]

#### 5. webpack-deadcode-plugin[10]

关于本文  

来源：百命
=====

https://juejin.cn/post/6844904033434468359

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

 》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持