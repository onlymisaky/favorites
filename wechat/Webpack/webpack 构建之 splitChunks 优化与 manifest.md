> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6SlVV7nfBrBg1TBMfQQ_wQ)

1 背景
====

相信对于每个刚接触构建的同学来说， webpack 都是难以跨越的一道坎，它凭着抽象的概念、“言简意赅” 的文档，难倒了一众英雄好汉。

由于自己平时从零手写 webpack 配置的机会比较少，所以对 webpack 里的一些配置不都是特别清楚。

最近的一个需求需要给页面资源增加 md5 版本号，我正好借着这个机会，把项目里的 webpack 配置都重新梳理了一遍。

本文对于基本的配置概念（如 entry 、 output 等）就不一一赘述了，着重介绍的是 **splitChunks** 和 **manifest** 两部分内容。

2 基本概念
======

要理解 `splitChunks` ，先要理解几个基本概念，module 、 chunk 和 bundle ：

*   **module**：每个 import 引入的文件就是一个模块（也就是直接手写的代码）。
    
*   **chunk**：当 module 源文件传到 webpack 进行打包时，webpack 会根据文件引用关系生成 chunk（也就是 module 在 webpack 处理时是 chunk）。
    
*   **bundle**：是对 chunk 进行压缩等处理后的产出（也就是打包后可以直接运行的文件）。
    

网上有一张图对这几个概念解释的很好 ：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9hG1OgmQObKjR5IgNjicJClhy8kBdCvsiaHmquyVKMkrrWicsc1pnebkHg/640?wx_fmt=png)

chunk 有三种：

1.  项目入口（ entry ）；
    
2.  import 动态引入的代码；
    
3.  通过 `splitChunks` 拆分出来的代码。
    

3 splitChunks 介绍  

===================

`splitChunks` 顾名思义就是用来拆分包的，将满足拆分规则的构建内容抽出来单独打包，从而达到抽离公共模块，减少重复打包的目的。

`splitChunks` 中的配置项用来确定具体的拆分规则，其中的 `cacheGroups` 配置项必须**同时满足其下的所有条件**才能生效。

webpack5 中 `splictChunks` 的默认配置为：

```
module.exports = {  //...optimization: {    splitChunks: {      chunks: 'async',      // 内容超过了minSize的值，才会进行打包      minSize: 20000,      // 确保拆分后剩余的最小 chunk 体积超过此项的值，防止出现大小为0的模块      minRemainingSize: 0,      minChunks: 1,      maxAsyncRequests: 30,      maxInitialRequests: 30,      // 超过这个值就会进行强制分包处理，无视minRemainingSize,maxAsyncRequests，maxInitialRequests      enforceSizeThreshold: 50000,      cacheGroups: {        vendors: {          test: /[\\/]node_modules[\\/]/,          priority: -10,          // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块          reuseExistingChunk: true,        },        default: {          minChunks: 2,          priority: -20,          reuseExistingChunk: true,        },      },    },  },};
```

容易理解的配置已经注释好了，下面将介绍没有注释部分的作用。

3.1 chunks
----------

可配置值有 `all`、 `async` 、 `initial` ，默认值是 `async` 。

我们先看一个例子，再介绍不同值的作用。

下面是 entry1.js ，其中动态引入了 page1.js ，观察默认配置下的打包结果。（注意：需要自行配置 Babel 解析 React 语法）

entry1.js

```
import React from'react';import ReactDom from'react-dom';const App = () => {    let Page1 = null;    import('./page1.js').then(comp => {        Page1 = comp;    });    return (        <div>            <div>App</div>            <Page1></Page1>        </div>    )}ReactDOM.render(<App />, document.getElementById('root'))
```

page1.js

```
import _ from'lodash';import React from'react';const Page1 = () => {    return (        <div>            <div>Page1</div>        </div>    )}exportdefault Page1;
```

打包结果：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9ynxEIQENLoRyia80XZh1q0V5PtbWWLaOOXUVWt4U2Aw0A4GrKvynOcw/640?wx_fmt=png)

我们来分析一下打包结果：

main.js 为入口文件，上面提到入口文件会单独拆成一个 chunk ，没有问题。

page1_js.js ，为动态加载的文件，上面提到动态加载的文件会单独拆成一个 chunk ，也没有问题。

剩下的是 page1.js 引入的 loadsh 这个第三方库的抽离，与 `cacheGroups` 的配置有关，后面介绍到 `cacheGroups` 就明白了。

那么问题来了，为什么 page1.js 引入的 loadsh 被抽离出来了，而 page1.js 与 entry1.js 都引入的 react 却没有呢？

这就是 **`chunks: “async”` 起的作用**， `async` 代表异步，也就是**异步加载进来的包才会校验分包规则**，进行分包抽离。

*   lodash 是 page1.js 中引入的，而 page1.js 是动态加载的，所以 loadsh 就可以进入分包规则的校验，并抽离出来，生成 vendors-xxxlodash.js 包。
    
*   react 不是异步加载进来的，所以不能去校验分包规则，不能进行分包抽离。
    

现在明白了 `chunks: “async”` 的作用，那么相信 `all` 和 `initial` 也能很快理解。

**`initial` 表示只从入口模块进行拆分**。

**`all` 表示入口模块和异步加载的模块都要进行拆分**。

现在我们把 chunks 改为 `initial` 来验证一下：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9IoQiamFW3Ya3M4cDiap1YfyRS7xlPnW5DVxrNyGEgORF8gFCwDPgPjMg/640?wx_fmt=png)

果然，只有 entry1.js 处引入的 react-dom 被抽离出来，同理，`all` 的作用就不再展示了。  

3.2 cacheGroups
---------------

**`cacheGroups` 是 `splitChunks` 的核心配置，`splitChunks` 里的配置相当于是 `cacheGroups` 里每一项的默认值，而 `splitChunks` 会根据 `cacheGroups` 的配置去拆分模块。**

`cacheGroups` 里可以定义每种类型包的抽离规则，比如默认的 vendor 包，`test` 值为 `node_modules`，意为只匹配 node_modules 的内容，即只打包第三方库，所以 vendor 包就是抽离的第三方库。

这里就可以解释上面打包出来的 vendors-loadsh ，满足了 vendors 的默认配置，属于第三方库，且至少被引用一次。

同理，default 则是抽离用户自定义的公共模块。

下面我们来看下 `cacheGroups` 里重要的配置项。

### 3.2.1 minChunks

**模块的重复调用次数大于等于 `minChunks` 值时，就会满足这项拆包条件**，但只看入口模块导入的，不看动态加载模块中导入的，即使设置 `chunks` 为 `all` 。

下面我们来看个例子：

分别在 entry1.js 和 entry2.js 中都引入本地的 jquery.js 文件，page1.js 不变。

entry1.js

```
import React from'react';import ReactDom from'react-dom';import $ from'./jquery';console.log($);const App = () => {    let Page1 = null;    import('./page1.js').then(comp => {        Page1 = comp;    });    return (        <div>            <div>App</div>            <Page1></Page1>        </div>    )}ReactDOM.render(<App />, document.getElementById('root'))
```

entry2.js

```
import React from'react';import ReactDOM from'react-dom';import $ from'./jquery';const App = () => {  console.log($)  return (    <div>      <div>entry2</div>    </div>  )}ReactDOM.render(<App />, document.getElementById('root'))
```

打包后的结果：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9Zhk7wLstYO9vydlT8aIehN1IUBYvd6L90GQcQNRvIXibDPhxN0NuDrA/640?wx_fmt=png)

entry1.js 和 entry2.js 都引入了 jquery，所以 jquery 引用次数为 2，满足 default 分包项的 `minChunks` 值，所以 jquery 被抽离出来了。

为了排除 page1.js 中引入的 jquery 影响，现在入口文件只留下 entry1.js，单独打包 entry1.js 看看。

打包结果：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww96T7fWFHATWbBPnV8zYtTUQibSd7sX5icE1TAALjG2sDZicgAWdkB47x3w/640?wx_fmt=png)

可以看到，虽然 entry1.js 和其动态加载的 page1.js 都引入了 jquery ，但是并没有分离出 jquery 的 chunk 包，所以 `minChunks` 不会将动态加载模块中引入的模块算进来。

### 3.2.2 priority

从上面一个打包结果来看，为什么 react-dom 也满足 default 的规则，却生成的是 vendors-node_modules_react-dom 而不是 default-react_dom 呢？

其实就是这个 `priority` 属性的作用，用于规定拆包规则的优先级，当某个 chunk 都满足几个拆包规则时，就会根据优先级判断，当优先级相同时，就进最先定义的规则。

3.3 maxInitialRequests
----------------------

表示为入口文件的最大并行请求数，用于限制分包数量，当分包数量过多时，发起的请求过多反而得不偿失。

请求的定义：

*   入口文件本身算一个请求；
    
*   入口文件动态加载的模块不算在内；
    
*   通过 runtimeChunk 拆分出来的 runtime 文件不算在内；
    
*   只算 js 文件，css 文件不算在内；
    
*   如果同时有两个模块满足 `cacheGroups` 的拆分规则，但 `maxInitialRequests` 只允许再拆分一个，那么会拆出体积更大的那个模块。
    

下面通过三个入口文件来举例（`maxInitialRequests` 设置为 `3`，**注意默认配置项 `enforceSizeThreshold`**，当包的体积超过其值，就**会无视 `maxInitialRequests` 等项**，把它配大点进行测试）。

entry1.js

```
import React from'react';import ReactDOM from'react-dom';import $ from'./jquery';const App = () => {  console.log($)  return (    <div>      <div>entry2</div>    </div>  )}ReactDOM.render(<App />, document.getElementById('root'))
```

entry2.js

```
import React from'react';import ReactDom from'react-dom';import $ from'./jquery';import Orgchart from'./orgchart';console.log($);const App = () => {    let Page1 = null;    import('./page1.js').then(comp => {        Page1 = comp;    });    return (        <div>            <div>App</div>            <Page1></Page1>        </div>    )}ReactDOM.render(<App />, document.getElementById('root'))
```

entry3.js

```
import React from'react';import ReactDom from'react-dom';import $ from'./jquery';const App = () => {  console.log($)  return (    <div>      <div>entry2</div>    </div>  )}ReactDOM.render(<App />, document.getElementById('root'))
```

打包结果：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9o442bicRWFicMSiaZQxvOqYns4k6va8ialjTLGLzDiabTadDJP50jNwicPgQ/640?wx_fmt=png)

下面来分析一下打包结果：  

entry1.js、entry2.js、entry3.js 和 page1.js，作为单独的 chunk 没有问题。

vendors-loadsh 和 vendors-react-dom 作为第三方库，满足 `minChunks=1`，作为单独的 chunk 也没有问题。

我们的 **orgchart 也是被引入了两次的，应该在 default 规则中被抽离出来，但是只有 jquery 被 default 抽离出来了**，其中就是 `maxInitialRequests` 的作用。

分析一下 entry1.js 的并发请求数量：

1.  请求自身文件；
    
2.  请求 react-dom；
    
3.  请求 jquery；
    
4.  请求 orgchart；
    

4 个请求，超过了 `maxInitialRequests` 的限制，所以需要砍掉一个请求，而 react-dom 的优先级高于 jquery 和 orgchart，则只从 jquery 和 orgchart 中考虑。

因为 jquery 体积更大，所以 webpack 抽离了 jquery，把 orgchart.js 放入自己的文件里。

包依赖关系图如下，可以看到 orgchart.js 分别存在于 entry1.js 和 entry3.js 中，并没有被抽离出来：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9tBXS2qs3icziccrSyAgFjDYPaAqu3eP9XTl9iaXnosG7ibqPg6YqHwYedQ/640?wx_fmt=png)

把 maxInitialRequests 设置为 4 后，可以看到打包结果中出现了 orgchart 的单独 chunk 包：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9usKfaEhVGvibbla4JagYciblnLyw9jFHrBHGZ3MfywTa6rOEnP7NCxxQ/640?wx_fmt=png)

3.4 maxAsyncRequests
--------------------

类似 3.3 的 `maxInitialRequests`，用于限制拆分数量。

`maxInitialRequests` 是用于**限制入口处的并发请求**，而 `maxAsyncRequests` 则是用于**限制异步模块内部的并行最大请求数**。

并发请求的定义：

*   import 文件本身算一个请求；
    
*   只算 js 文件、css 文件不算在内；
    
*   如果同时有两个模块满足 `cacheGroups` 的规则需要拆分，但 `maxAsyncRequests` 只允许拆分一个时，那么会拆出体积更大的那个模块。
    

比如 3.3 中的例子，只会看 page1.js 里 import 的并发请求数，这里就不重复举例子了。

4. manifest
===========

在一次需求中，由于缓存问题，新修改的页面发布后，用户不清除缓存的话，无法获得新页面，所以需要给其页面资源增加 md5 版本号。

乍一看，挺简单的嘛，不就是打包时 filename 增加一个 `contenthash` 嘛，但仔细一看项目结构，项目 A 自己并不生成页面资源，它的页面资源是引用项目 B 打包出来的 js 文件。

也就是说要在一个项目中，导入另一个项目带有 hash 值的文件，那每次打包的 hash 值都不同，我们怎么知道要请求的文件的 hash 值呢？

这时候就需要 `manifest` 了，它**能记录原文件名与其加了 hash 值后的映射**，利用它就可以准确请求加了 hash 值后的文件啦。

可以使用 webpack-manifest-plugin 来生成 manifest.json 文件，文件内容如下：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvkK1FOT8MJaaNkbOBeaww9laW0DbNXbXvf2gSTrUjicEicvK9lL1lEEW9vGYXyZ21AeFRASceAMibzQ/640?wx_fmt=png)

5. 总结
=====

通过亲手去试验一个个 demo，即使难如 webpack 也熟悉了很多，之后再接触到 webpack 的配置也不会那么恐惧了。

当害怕使用某一项技术的时候，正说明自己对它不熟悉，不了解，更需要付出更多的时间去熟悉、理解它。等再次遇见这个难点时，如果你不再害怕，反而因为可以大展身手而兴奋的话，那么恭喜你已经克服它了。

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsUS8uDeYgQE2E3ga5vf4XrvOOm2gpZEicrI9iaeJL0yNS9F3FxhlLia1fO9OicoAvdDWIVbjqHZw53IA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)