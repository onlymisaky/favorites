> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AVJzrQE_DTpNwBzwJU0NrA)

> 本文作者为 360 奇舞团前端开发工程师 Rien.

本篇文章主要记录 webpack 的一次性能优化。

### 现状

随着业务复杂度的不断增加，项目也开始变得庞大，工程模块的体积也不断增加，webpack 编译的时间也会越来越久，我们现在的项目二次编译的时间在 5s 到 6s 之间，对于我们迭代速度非常快的项目来说，二次编译时间长会导致效率非常低下。优化的手段有很多，之前项目原本已经做了很多如环境分离、并行编译等优化，本文从几个小的角度进行二次编译的优化讲解，大家也可以检查一下自己的项目能否从以下几个方面进行优化。

### 更改 source map 配置

首先，介绍一款插件 webpack.ProgressPlugin。官网给出的解释是

> The ProgressPlugin provides a way to customize how progress is reported during a compilation.

也就是说，ProgressPlugin 可以监控各个 hook 执行的进度，输出各个 hook 的名称和描述，输出构建进度。通过插件 webpack.ProgressPlugin 对 webpack 整个运行做了分析，发现耗时较长的阶段主要是生成 sourceMap 文件的阶段：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pLicL2XKQpia1iaicNcwOkWKDN9bpBOeFIZYiaEktoib52N0md7Bo6w5aVDibUA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pLdtA4fSxuAOUWeWkJGsGfTPaJEFSn3zEib0NEJfauIwHt3Z4UCfxDoGQ/640?wx_fmt=png)

通过查阅 sourcemap 的配置，发现了问题是因为 devtool 配置为 source-map 的原因。之前的同学使用 source-map 可能是因为要做一些其他的处理，需要用到源码，现在并无此需要。Webpack 支持 sourceMap20 + 种不同的方式，通过关键字组合，可以生成用于各种场景的 sourcemap。每种方式的速度和效果各不相同。效果最好的速度最慢。

在这里我贴了一张官网截图的对比图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pL49Zt8erkDSCl2ua7vQ6QNP9LCiahxW7gq0JIFVTUgXJibaJgrLC3gYQw/640?wx_fmt=png)

从上图我们可以看到 webpack 为 sourcemap 提供的一些关键字，而 sourcemap 模式都是左边介绍的关键字进行拼接构成。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pLv7a954Bs3ibVBbib4JX2AotZXesxlJxPAibemMQ69kfQoeftdEkWzSazA/640?wx_fmt=png)

上图是一些不同配置项的对比，可以看到其中一些值适用于开发环境，一些适用于生产环境。  
对于开发环境，通常希望更快速的 sourcemap，需要添加到 bundle 中以增加体积为代价，但是对于生产环境，则希望更精准的 sourcemap，需要从 bundle 中分离并独立存在。在开发环境下使用 eval-cheap-module-source-map（webpack 推荐方式）大大减少了这一阶段的耗时，同时对开发体验及错位定位影响较小。  
这里顺便提一下，生产模式我们可以使用：none，因为 SourceMap 会暴露源代码；调试是开发阶段的事情。如果对代码实在没有信心可以使用 nosources-source-map。sourcemap 里是有 sourceContent 部分的，也就是直接把源码贴在这里，这样的好处是根据文件路径查不到文件也可以映射，但这样会增加 sourcemap 的体积，也会暴露源码。加上 nosources 之后，生成的 sourcemap 就没有 sourceContent 部分了，sourcemap 文件大小会小很多，也不会暴露源码。

### Html-webpack-plugin 的升级

经过上面的优化 二次编译的时间有了较大的提升 。但是通过观察分析，发现 html-webpack-plugin 耗时不太正常，因为 html-webpack-plugin 的作用很简单，就是：使用 webpack 打包时创建一个 html 文件，并把 webpack 打包后的静态文件自动插入到这个 html 文件当中。我们已经从全量的 8 个页面改为增量单个 html 启动了耗时不应该那么久。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pL9ibuthHegKStSEuApOjRERxhd7r930nviclppla6qdgxBBYOa2yiabuqQ/640?wx_fmt=png)经过排查及 github issue 里看到，是当前插件版本有一些性能问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pLxQmvvqqCCTslRXFRYXOD10MGtV3DDJLdCCPldibRKdMbicPRCIYI8XIQ/640?wx_fmt=png)

从 v3 改为 v4 版本后 这个插件的耗时从秒级降为毫秒级。![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pLiay3Ip4ZE6S7XMFZgloj1548pGicnIM2YEAwC5Euc7Bm4JicZUORCwsyA/640?wx_fmt=png)

### ESlint-loader 去除

后续我发现在对不同文件模块进行更改时，编译时间有较大的差异，通过插件 speed-measure-webpack-plugin 对插件、loader 耗时分析发现，部分 loader 运行时间不一致，编译慢是由 eslint-loader 导致的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pL3IQWeGVBr3D5dlSWwgPPnFUrRBicIoPKRictM3ibjyF0Ee9wBfuGtP4Ow/640?wx_fmt=png)

项目之初，每个文件的代码量基于规范不会太大，在开发过程中使用 eslint-loader 进行代码规范校验，后续随着需求迭代，可能因为时间或者历史的原因，没有对单个文件的代码量做限制，导致部分功能模块代码量巨大，在开发这一块内容的时候，eslint-loader 对整个文件进行校验，耗时较长。

由于

1.  eslint 无法从根本上解决代码逻辑上的质量问题
    
2.  eslint-loader 已废弃。所以这里就把 eslint-loader 暂时去掉了。
    

通过去除 eslint-loader，在部分大文件改动时，编译时间有了较大提升。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pLeYV3K4mxqxic1Ns6uxdOoJ80UljlqlXaWib3Vr7Iia2GwT2OGaPibKtVHw/640?wx_fmt=png)

为了弥补代码规范的问题，不经过 eslint-loader 进行校验，我们可以在本地开发的时候，使用 vscode 的 eslint 插件进行代码校验，规范调整。但是这里只是口头约定，后续可以使用 git 钩子结合 eslint 在代码提交的时候做强制校验。

### 总结

经过一系列优化，最终我们得到，在改动同一大文件的基础上，二次编译时间得到了大幅度提升，改善了开发效率和体验。将近提升 3 倍。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC1ymuQHRQjIDbp4XLN59pL8MVdJJAgoojUXQOGbP3OH53TpmrVeheakrzCtaibGWESOJUa6tVx2bQ/640?wx_fmt=png)

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)