> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wZ0rqkZQ1XFbJBLG2aE7_Q)

> 本文作者为 360 奇舞团前端开发工程师

### 起因

有同事分享`webpack`的代码分割，其中提到了`SplitChunksPlugin`，对于文档上的描述大家有着不一样的理解，所以打算探究一下。

**Q：什么是 `SplitChunksPlugin`？`SplitChunksPlugin` 是用来干嘛的？**

**A: 最初，`chunks`（以及内部导入的模块）是通过内部`webpack` 图谱中的父子关系关联的。`CommonsChunkPlugin`曾被用来避免他们之间的重复依赖，但是不可能再做进一步的优化。从`webpack v4` 开始，移除了`CommonsChunkPlugin`，取而代之的是 `optimization.splitChunks`。`SplitChunksPlugin`可以去重和分离 `chunk`**

`webpack`的中文文档，对`SplitChunksPlugin`的描述是这样子的：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZsWdfPpuK4jEicWibmXxmicJldsvp7Rp3RZ10K7mAkUfkkJNda9YYvZ9BQ/640?wx_fmt=png)

针对以上的第二点描述`新的 chunk 体积大于 20kb（在进行 min+gz 之前的体积）`，有同事是这么理解的：`chunk` 大于 `20kb` 时，`webpack`会对当前的`chunk`进行拆包，一般情况下，`100kb`的包会拆成 5 个包 即 `5 * 20kb = 100kb`.  如果有并发请求的限制，`webpack`会自动把某些包合并，如并发请求数是 2 ，那么这个`100kb`的包将会被拆成 2 个，每个包的大小为`50kb`，即 `2 * 50kb = 100kb`。

而我对此表示有不同的看法：既然这个插件是用来对代码进行分割的，那么没有必要再对代码进行合并，这样子会让这个插件变得不纯粹，而且会增加插件逻辑的复杂度，所以这句话的意思应该是分割出来的新`chunk`得大于 20kb。

由于大家都不是三言两语就能被说服的，所以打算去查查资料，动动手验证一下到底是怎么一回事。

### 文档资料

#### 一、英文文档

首先为了避免中华语言博大精深，导致个人理解有偏差，我先去查看了一下英文文档，英文文档上是这么描述的：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZU1H07s2LuHSt8kmnI90wQlsNMa9wiam68NoQ5chMMwdczic8M2ib02nYA/640?wx_fmt=png)

关键词 `new chunk`：新的`chunk`，只有分离出来的才算是新的`chunk`吧，那么这句话的意思应该就是新的`chunk`将会大于`20kb`。

#### 二、社区文章

其次为了再次避免个人英文理解有偏差，到网上去翻阅了一些社区文章：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZN2547UwzRyv0zJDiaiaaGrGUyHpMz2vFYwTBR5ib8UnoAhpBRz9rn40nw/640?wx_fmt=png)

作者：前端论道 链接：https://juejin.cn/post/6844904103848443912 来源：稀土掘金

从上图中可以看到，第三方包`vue`已经超过了默认的`20kb`，直接被分割成一个单独的`2.js`的包，并不是按照`20kb`平均分成多个包。

### 动手实践

```
// index.jsimport "./a";console.log("this is index");
```

```
// a.jsimport "vue";import "react";import "jquery";import "lodash";console.log("this is a");
```

```
// webpack.config.jsconst path = require('path');module.exports = {    mode: "production",    entry: './src/index.js',    output: {        filename: '[name].js',        path: path.resolve(__dirname, 'dist'),    },    optimization: {        splitChunks: {            chunks: 'all',        },    },};
```

编译结果：![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZZpRKhicicEoySnnnnsQr1zWJibd3RM7NsVdgQ3iaGNVoiaicaKLlUAWNfIKg/640?wx_fmt=png)

从编译的结果中可以看到，除了`main.js`，仅仅多出了一个`205kb`的`46.js`。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZEJgJLpYCvGHuKUd320TgloNn0Xs4VZa6MHnBXSO4CjWEHics4Vp8BBg/640?wx_fmt=png)从上图可以看出，`vue`、`jquery`、`lodash`等一起都被打包到 `46.js` 中，并没有以`20kb`为基础平均分割成很多个`chunk`。

### 结论

`新的 chunk 体积大于 20kb（在进行 min+gz 之前的体积）`，指的是引入的依赖中，在进行`min+gz`之前的体积大于`20kb`，这个依赖将会被分割出来成为一个新的`chunk`。

### 新的疑问

到这里还没有结束，因为我还有几个疑问：

1.  `webpack`为什么要进行代码分割？
    
2.  浏览器的并发请求一般不是 4～6 个吗？为什么文章里提到的按需请求和初始请求都是小于或者等于 30？
    

#### webpack 为什么要进行代码分割？

*   前端代码体积变大，调试和上线都需要很长的编译时间，开发时修改一行代码也要重新打包整个脚本。
    
*   用户需要花额外的时间和带宽下载更大体积的脚本文件。
    

一、按需加载 首次加载只加载必要的内容，提升用户的首次加载的速度。其他的模块可以根据用户的交互进行按需加载，即用户跳转新路由或者点击的页面的时候再进行加载。

二、有效利用缓存 通过`webpack`在打包是对代码进行分割，可以有效的利用缓存：打包编译的时候，只需要编译需要更新的部分；用户访问的时候只需要下载被修改的文件即可。

**场景：**你有一个体积巨大的文件，并且只改了一行代码，用户仍然需要重新下载整个文件。但是如果你把它分为了两个文件，那么用户只需要下载那个被修改的文件，而浏览器则可以从缓存中加载另一个文件。

三、预获取 / 预加载模块

*   `prefetch`(预获取)：将来某些导航下可能需要的资源：这会生成 `<link rel="prefetch" href="login-modal-chunk.js">` 并追加到页面头部，指示着浏览器在闲置时间预取 `login-modal-chunk.js` 文件。
    
*   `preload`(预加载)：当前导航下可能需要资源 --- `preload chunk` 会在父 `chunk`加载时，以并行方式开始加载。`prefetch chunk` 会在父 `chunk` 加载结束后开始加载。--- `preload chunk` 具有中等优先级，并立即下载。`prefetch chunk` 在浏览器闲置时下载。--- `preload chunk` 会在父 `chunk` 中立即请求，用于当下时刻。`prefetch chunk` 会用于未来的某个时刻。--- 浏览器支持程度不同。
    

#### 浏览器的并发请求一般不是 4～6 个吗？为什么文章里提到的按需请求和初始请求都是小于或者等于 30？

随着`http2.0`的普及，浏览器的并发请求的限制得到了很好的解决。通过`http2.0`的多路复用，理论上可以通过一个`TCP`请求发送无数个请求。然后翻了下`webpack`代码仓库源码，发现了以下注释：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZGkYen7oD1veoS6KOV5mGRicJjGXdDXTpIAFLKJe4qtpE23fu0RsuhMA/640?wx_fmt=png)

`http2.0`支持情况：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAaMSRiayo8OfWGTJCbdicyMZ2SH1ZRo34KPfXfjTJ2DvUDRa3VKCssBcvG5vtTY4QEfawazCh2e3uw/640?wx_fmt=png)

所以在 webpack 的代码分割逻辑里，按需请求和初始请求都超过了之前浏览器对`http1.0`单个域名请求的限制。

参考文档：  
webpack 中文文档：https://webpack.docschina.org/plugins/split-chunks-plugin/#split-chunks-example-1  
webpack 英文文档：https://webpack.js.org/plugins/split-chunks-plugin/#root  
如何使用 splitChunks 精细控制代码分割：https://juejin.cn/post/6844904103848443912

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)