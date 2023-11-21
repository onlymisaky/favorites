> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/y4ByEI9SVoNHA3NIbXC5Ow)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCV2SP3tWwgwMRYmgMWFEW5N3s64j6ibHZJCqrmOymxSZpRbBiascHHGMhZ8MPzoLPJ8uz8GhUIKYiadQ/640?wx_fmt=jpeg)

前言
==

> webpack 5 是 2020 年发布的，webpack 4 是 2018 年发布的，在 webpack 4 之上也做出了挺多的改变，比如，添加了 cache 的支持，模块联邦新玩意......

持久性缓存来提高构建性能
============

在 webpack 5 之前，webpack 是没有提供持久化缓存，我们开发的时候需要使用类似 **cache-loader** 来做缓存方面的处理。

在 webpack 4 中：

```
module.exports = {  module: {    rules: [      {        test: /.ext$/,        use: ['cache-loader', ...loaders],        include: path.resolve('src'),      },    ],  },};
```

在 webpack 5 中

在 webpack 5 中自身也加入了持久化缓存，缓存生成的 webpack 模块和 chunk，来改善构建速度。cache 会在开发 模式被设置成 type: 'memory' 而且在 生产 模式 中被禁用。

```
module.exports = {  cache: {    type: 'filesystem',  },};
```

> **cache.type** 有两个值 **memory ｜ filesystem**memory 表示会将打包生成的资源存放于内存中。filesystem 表示开启了文件系统缓存。

更好的 hash 算法
===========

这里指的就是访问 web 页面时的浏览器缓存，我们也知道，之前有 **hash** **chunckhash** **contenthash** 在 webpack 5 中，把 **hash** 改成了 **fullhash**。

首先，我们介绍一下这几个 hash 值有什么不一样。

hash/fullhash
-------------

hash/fullhash 是根据打包中的所有文件计算出来的 hash 值，在一次打包中，所有的资源出口文件的 filename 获得的 [hash] 都是一样的。

chunckhash
----------

chunckhash 顾名思义是根据打包过程中当前 chunck 计算出来的 hash 值。

contenthash
-----------

contenthash 顾名思义是根据打包时的内容计算出的 hash 值。

> 当然，这么看好像，看不出啥问题，不就是把一个 hash 改成 fullhash 而已嘛？dang dang dang 然不是，我们就来扒扒看，直接上实战，喵喵有啥不一样。

我们先设定 webpack 的设置如下
-------------------

```
const path = require('path');module.exports = {  mode: 'production',  entry: {    index: './index.js'  },  output: {    path: path.resolve(__dirname, './dist'),    filename: '[contenthash].js',  },}
```

这里是要打包的 index.js 的内容
--------------------

```
const num = 1;console.log('这里是输出', num);
```

这是添加注释和修改变量后的 index.js 的内容
--------------------------

```
const str = 1;//这里是输出console.log('这里是输出', str);
```

webpack 4 打包
------------

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKBFFWygHF955A6sFqvql4XOOHksMbZvnEc2IS5MqIq7vsOUibECsGIVA/640?wx_fmt=other)

我们可以看到这里的 hash 值为 _e8510378c5f44d16af40_ 。

**这里是添加注释和修改变量后打包后的结果**

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKJaQNnNyD2HmSCGv3yDzib2F4Qh7ia0CuMKCAzelnicFuxUxgRiaWNQhWSg/640?wx_fmt=other)

我们可以看到这里的 hash 值为 _2c719bba27df586bf8f2_ 。

webpack 5 打包
------------

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jK8VVrPXm4DHpQF5vFBGFBoXejk2avvco9WWGtpKNEu4IsMpxwibENKeg/640?wx_fmt=other)

我们可以看到这里的 hash 值为 _d1bc13ae7e7dc828a64f_ 。

**这里是添加注释和修改变量后打包后的结果**

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKzYdaRv26ezQP1EW8ibic1Mt1QWoA4FLBSA0hYLoojwTibTM09zI1gAJcg/640?wx_fmt=other)

我们可以看到这里的 hash 值为 _d1bc13ae7e7dc828a64f_ 。

总结
--

> 我们可以明显看出，webpack 4 对于添加注释和修改变量其实，是会影响它的一个 **contenthash** 值的计算，如果是 webpack 5 的话，就不会影响。

Tree Shaking 的改进
================

> tree shaking 是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码 (dead-code)。它依赖于 ES2015 模块语法的 静态结构 特性，例如 import 和 export。

既然 webpack 4 都有这个功能，那么随着 webpack 5 的升级，又有什么不一样的地方呢？

我们来建立一个三个文件，**index.js、a.js、b.js**

```
// a.jsconst name = 'zhangSan';const age = 18;export { name, age };
```

```
// b.jsimport * as data from './a';export { data };
```

```
// index.jsimport * as common from './b';// 我们可以看到只是使用了 age，而没有使用 nameconsole.log(common.data.age);
```

webpack 4 打包结果
--------------

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKJM9ufwRwXGQgmc4RsnBrVjaqhxpX1s3e57gGtzr6zJsQeSKriaFDTHQ/640?wx_fmt=other)

但是我们打包出来的结果，却是连 name 也打包进去。

webpack 5 打包结果
--------------

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKFiaxMCBEPWenDqGY7l6sXPDH8AWicOuF2mvmlD9U4xOyUicMCXMxoBg9A/640?wx_fmt=other)

简直完美秒杀。

总结
--

> 当然，在 webpack 4 中，Tree Shaking 对嵌套的导出模块未使用代码无法很好进行 Tree Shaking，当然我们也可以借助一些 plugin 来实现，但是到了 webpack 5 得到了很大的改进。

模块联邦（Module Federation）
=======================

> Webpack5 模块联邦让 Webpack 达到了线上 Runtime 的效果，让代码直接在项目间利用 CDN 直接共享，不再需要本地安装 Npm 包、构建再发布了！

容器项目
----

```
//这里是容器的webpack模块联邦设置【也就是在该组件使用】new ModuleFederationPlugin({  name: 'react1',  library: { type: 'var', name: 'react1' },  remotes: {    RemoteComponent: 'RemoteComponent'  },}),
```

```
// 在html引入<script src="http://localhost:3001/remoteEntry.js"></script>
```

```
// 这里是它的代码import React, { Fragment } from 'react';import ReactDOM from 'react-dom';const Button = React.lazy(() => import('RemoteComponent/Button'));function App() {  function onClick() {    console.log('这里是远程组件触发的');  }  return (    <div>      <h1>这里是测试模块联邦的项目</h1>      <React.Suspense fallback='努力加载中💪...'>        <Button onClick={onClick} content='content'></Button>      </React.Suspense>    </div>  );}
```

远程组件项目
------

```
// 提供远程组件的项目webpack模块联邦设置new ModuleFederationPlugin({  name: 'RemoteComponent',  library: { type: 'var', name: 'RemoteComponent' },  // 使用此远程组件加载的文件名称  filename: 'remoteEntry.js',  exposes: {  //此处提供了一个Button组件    './Button': './src/components/Button',  },}),
```

```
// 这是远程button组件import React from 'react';export default function Button({ content, onClick = () => {} }) {  return (    <button onClick={onClick}>{ content }</button>  )}
```

实际效果
----

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKiaPuXC0uVZM5hDHldquXYWKBuyEnMJSWCscFYQ1XicdHPOybTg85XorQ/640?wx_fmt=other)

我们可以看到，点击按钮，成功触发 onClick 事件。

Asset Modules
=============

> Asset Modules 通常被翻译为资源模块，它指的是图片和字体等这一类型文件模块，它们无须使用额外的预处理器，webpack 通过一些配置就可以完成对它们的解析。

在 webpack 5 之前，没有内置资源模块，所以，我们通常使用，**file-loader** **url-loader** **raw-loader** 之类的 loader 去处理。

```
// 在webpack5中，可以直接使用内置的资源模块就行了module.exports = {// ...  module: {    rules: [{      test: /\.jpg$/,      type: 'asset/resource'    }]  }}
```

```
// 在webpack 4就需要使用 file-loader 之类的loadermodule.exports = {  module: {    rules: [      {        test: /.(png|jpg|gif)$/,        use: [          {            loader: 'file-loader',            options: {}          }        ]      }    ]  }}
```

> Asset Modules 它的值有四种，asset/resource（对应 file-loader）、asset/inline（对应 url-loader）、asset/source（对应 raw-loader）、asset。

结束
==

当然，webpack 5 的改变不止这些，比如，还有 不再为 Node.js 模块自动引用 polyfill、也内置了 terser 进行代码压缩......

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)