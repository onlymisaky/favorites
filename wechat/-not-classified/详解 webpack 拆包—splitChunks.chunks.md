> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eSjqU0hjAp4he8i8eKSZlA)

前言
--

今天主要讲解一下`webpack`的拆包逻辑，现在的`webpack`实际上有一套默认的拆包逻辑，这个默认配置对绝大多数用户来说非常友好。

`webpack` 将根据以下条件自动拆分 chunks：

*   新的 chunk 可以被共享，或者模块来自于 `node_modules` 文件夹
    
*   新的 chunk 体积大于 20kb（在进行 min+gz 之前的体积）
    
*   当按需加载 chunks 时，并行请求的最大数量小于或等于 30
    
*   当加载初始化页面时，并发请求的最大数量小于或等于 30
    

也就是说他的默认配置是这样的：

```
module.exports = {  //...  optimization: {    splitChunks: {      chunks: 'async',      minSize: 20000,      minRemainingSize: 0,      minChunks: 1,      maxAsyncRequests: 30,      maxInitialRequests: 30,      enforceSizeThreshold: 50000,      cacheGroups: {        defaultVendors: {          test: /[\\/]node_modules[\\/]/,          priority: -10,          reuseExistingChunk: true,        },        default: {          minChunks: 2,          priority: -20,          reuseExistingChunk: true,        },      },    },  },};
```

今天我们主要来学习一下`chunks`这个属性.

chunks
------

> ❝
> 
> **chunks** 作为`splitChunks`的一个重要属性‼️，主要是用来告知`webpack`采用什么方式来优化分离`chunks`

它的值可以是一个字符串，也可以是一个函数，当提供一个函数时，更多是用来做一些自定义控制，这个函数的返回值将决定是否包含每一个`chunk`

```
module.exports = {  //...  optimization: {    splitChunks: {      chunks(chunk) {        // exclude `my-excluded-chunk`        return chunk.name !== 'my-excluded-chunk';      },    },  },};
```

我们一般用的更多的是字符串形式，当提供一个字符串时，有效值为：`all`、`async`、`initial`

**默认值为 async**

文档上对这三个值都有介绍，但你可能不是那么容易理解，今天我们就来详聊这三个属性之间的差异

### async

首先我们来看默认值`async`

> ❝
> 
> 它表示的是只选择通过`import()`异步加载的模块来分离`chunks`

比如：

我们有两个入口文件`index.js`与`index2.js`，两个模块文件`nanjiu1.js`与`nanjiu2.js`

```
// index.jsimport NanJiu from "./nanjiu2"; // 同步加载模块import('./nanjiu1') // 异步加载模块
```

```
// index2.jsimport NanJiu from "./nanjiu2";import('./nanjiu1')
```

两个入口文件对于`nanjiu1.js`都是异步导入，对于`nanjiu2.js`都是同步导入

此时的打包结果是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia752qOPBqJBFN1lMiaIM0zOcfQUhgBHCianHmadicxtjtfUZ537UUg0I1HuU8klmUClzLicWJwyA4iagFQ/640?wx_fmt=png&from=appmsg)

**对于异步导入的模块，`webpack`会将它单独分离出来复用，而对于同步导入的模块并不会单独分离出来**

### initial

> ❝
> 
> 它表示不会将异步导入与同步导入一起处理，而是分开处理

还是上面那个例子：两个入口文件对于`nanjiu1.js`都是异步导入，对于`nanjiu2.js`都是同步导入

我们将配置改为`initial`，再来重新打包试试：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia752qOPBqJBFN1lMiaIM0zOciaYicnXEYV5wMfFEnMFT4YuHLszdia6tMVCcdia7KiaibiaKvlqQ8G46gnaibw/640?wx_fmt=png&from=appmsg)

**可以看到同步与异步的导入都被分离出来了**

这样效果到挺好，但是上面的例子我们对于`nanjiu1.js`都是异步导入，对于`nanjiu2.js`都是同步导入，如果对于同一个模块既有同步导入又有异步导入时，它会如何处理呢？🤔

```
// index.jsimport NanJiu2 from "./nanjiu2"; // 同步加载模块import NanJiu from "./nanjiu1";
```

```
// index2.jsimport NanJiu2 from "./nanjiu2";import('./nanjiu1')
```

这里我们对于`nanjiu1.js`改成了既有同步导入又有异步导入，来看看对于`initial`的打包结果是什么：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia752qOPBqJBFN1lMiaIM0zOcP1D8fSlfIST5yECyJOibykvsrvaOicpdaDnV9UxhPGNy7boKN5aTyNVg/640?wx_fmt=png&from=appmsg)

从上图中我们可以看到，单独输出的`nanjiu1.js`是`index2.js`中的异步导入，而对于`index1.js`中同步导入的`nanjiu1.js`并没有被单独分离出来。**也就是说在 `initial` 设置下，就算导入的是同一个模块，但是同步导入和异步导入是不能复用的。**

所以这种模式要慎用，因为它打包出来的包体积不是最优解

### all

对于`all`属性，`webpack`文档上也说过该属性非常强大

> ❝
> 
> 该属性表示 chunk 可以在异步和非异步 chunk 之间共享

同样还是上面的例子：

```
// index.jsimport NanJiu2 from "./nanjiu2"; // 同步加载模块import NanJiu from "./nanjiu1";
```

```
// index2.jsimport NanJiu2 from "./nanjiu2";import('./nanjiu1')
```

这里我们对于`nanjiu1.js`改成了既有同步导入又有异步导入，来看看对于`all`的打包结果是什么：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia752qOPBqJBFN1lMiaIM0zOct3tEu3NCSYaWNEJbfB97C3OjQXxRlMDEicticXrAyxOFtFC5LpgL7ZfA/640?wx_fmt=png&from=appmsg)

从上图中我们可以看到，无论是同步的导入还是异步的导入，都会被单独分离出来。所以 `all` 在 `initial` 的基础上，优化了不同导入方式下的模块复用。

总结
--

*   async：只会将异步加载的模块分离出来
    
*   initial：对于同步与异步加载的模块分开处理，也就是说对于同一个模块的同步加载与异步加载无法复用
    
*   all：无论是同步加载的模块还是异步加载的模块，都会单独分离出来
    

所以想要更好的复用公共模块，`all`的模式是最优解。