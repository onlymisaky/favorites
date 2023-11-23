> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CYKllpNXbv30WsjoYw7qJw)

![](https://mmbiz.qpic.cn/mmbiz_gif/cZkI8M0nbCnqFdBSZTPngyO5KHUZhk4Ar8PXzGUEG30cljwdDXM7eXjU1HEl0iamscgm9nLS4UV7KibkK7gyyKIw/640?wx_fmt=gif)

点击上方蓝字 “前端司南” 关注我

您的关注意义重大

  

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwcKH2pugFJwSuTcHBAsSTuz6pkO1awlV9JwK9wkXsNmtlAmZX2xJAVl5XUTicXmcyHicZtpZeywSCQ/640?wx_fmt=png)

原创 @前端司南  

  

前言
==

在上一篇 npm init @vitejs/app 的背后，仅是 npm CLI 的冰山一角 [1] 中，有提到我复习 **npm** 主要是从两个大方向来入手，所以这篇继续来讲讲`package.json`这部分知识，经过这轮复习，也发现了自己的很多不足，之前把常用的命令和配置玩熟了，却没关心 **npm** 已经有了更多新的玩法，而这些玩法却实实在在地在解决别人的问题。

npm 的配置还是挺多的，具体可以参考 package.json 官方文档 [2]。通读了文档之后，我略过了一些基础的配置项，总结了一些我认为比较有用的配置项。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwcKH2pugFJwSuTcHBAsSTuaaFf0djbCfDP8YWGDmwOBxct8flCHhw3sEAAXIfcfI8dgyv9vnDTgg/640?wx_fmt=png)

常用配置项
=====

files
-----

`files`定义了哪些文件应该被包括在 npm install 后的 node_modules 中。

当然，有些文件是自动暴露出来的，不管你是不是配置了`files`，比如：

*   package.json
    
*   README / CHANGELOG / LICENSE
    
*   ...
    

很多库都定义了 files，避免一些不必要的文件暴露到 node_modules 中。

vite 中是这样配置的：

```
{  "files": [ "bin", "dist", "client.d.ts" ]}
```

我之前就不知道这个配置，导致我发布的一个 npm 组件 vue-awesome-progress[3] 就暴露了源码部分，虽然这也没啥影响，本来就是开源的。但是这也增加了别人的资源下载量，也是一种浪费。所以，专业点的搞法还是加上`files`配置吧。

bin
---

bin 列出了可执行文件，表示你这个包要对外提供哪些脚本。

在这个包被 install 安装时，如果是全局安装 -g，bin 列出的可执行文件会被添加到 PATH 变量（全局可执行）；如果是局部安装，则会进入到 node_modules/.bin/ 目录下。

bin 在一些 CLI 工具中用得很频繁，比如 Vue CLI。

在开发 npm 包时，要求发布的可执行脚本要以`#!/usr/bin/env node`开头，这是为什么呢？

我查了一下，原来是为了用于指明该脚本文件要使用 node 来执行。

main, browser, module
---------------------

这三个配置对我们的影响还是挺大的。

*   `main`字段决定了别人`require('xxx')`时，引用的是哪个模块对象。在不设置`main`字段时，默认值是`index.js`。
    
*   如果你开发的包是用于浏览器端的，那么用`browser`指定入口文件是最佳的选择。
    
*   `module`则代表你开发的包支持`ESM`，并指定了一个`ESM`入口。
    

具体这三个字段怎么用，还是挺有学问的，这里推荐一篇文章 package.json 中你还不清楚的 browser，module，main 字段优先级 [4]，讲得挺细。

**长图警告！**

![](https://mmbiz.qpic.cn/mmbiz_jpg/lolOWBY1tkwcKH2pugFJwSuTcHBAsSTuDPqN0cF54gxajRKKlib85IRTuo7oibFN03Np6Z09FdxTRica48P2Uiav1g/640?wx_fmt=jpeg)

scripts
-------

`scripts`也基本上每天都用了，但是它的钩子脚本你用过吗？如果没有用过，可以试试，在组织脚本流程时非常好用！

*   **pre**：在一个 script 执行前执行，比如 prebuild，可以在打包前做一些准备工作。
    
*   **post**：在一个 script 执行后执行，比如 postbuild，可以在打包后做一些收尾工作。
    

config
------

通过`config`配置的参数`xxx`，可以在脚本中通过`npm_package_config_xxx` 的形式引用，比如`port`。

```
{  "config": {    "port": "8080"  }}
```

依赖相关
----

### dependencies

`dependencies`可以理解为生产依赖，通过`npm install --save`安装的依赖包都会进入到`dependencies`中。

### devDependencies

`devDependencies`可以理解为开发环境依赖，通常是一些工具类的包，比如 webpack, babel 等。通过`npm install --save-dev`安装的依赖包都会进入到`devDependencies`中。

但是，在结合一些构建工具使用时，我们往往会有困惑。比如我安装了一个包到`devDependencies`中，但是不小心在项目中引用了它，最后也被 webpack 打包到构建结果中了。这是怎么回事呢？

建议结合上篇文章 npm install 这一节 [5] 一起看。

### peerDependencies

> 我是 **package-a**，你装我，你就必须装我的 **peerDependencies**。

让 “调包侠” 将 **package-a 的依赖**提升到自己的`node_modules`中，这样可以在 “调包侠” 和 **package-a** 都需要同一个依赖（比如 vue）时，避免重复安装。这常见于开发组件或者库。

注意，一个 npm 包的开发者如果声明了`peerDependencies`, 开发环境下在该包目录`npm install`也不会在`node_modules`中安装这些依赖，所以往往还需要借助`devDependencies`。

举个例子，我开发一个组件，不想发布到 npm 时包含了 vue 的代码，这就需要外部提供 vue ，所以我把 vue 定义在 peerDependencies 也无可厚非。但是，在开发组件时，一般还需要本地开发环境跑一个 demo 试试效果，这时候是依赖 vue 的，所以还需要在 devDependencies 中安装 vue 。我看了下 vue-router 就是这么做的，所以我在开发自己的组件时也学会了这招。

### bundledDependencies

`bundledDependencies`跟上面的依赖都不太一样，配置上不是键值对的形式，而是一个数组。

```
{  "bundledDependencies": [    "vue",    "vue-router"  ]}
```

在运行`npm pack`时，会将对应依赖打包到`tgz`文件中。用得不多，不知道具体的细节，主要还是直接用`npm install`安装 tgz 包的场景比较少，有个概念就行。

### optionalDependencies

`optionalDependencies`用于配置可选的依赖，即使配了这个，代码里也要做好判断（保护），否则运行报错就不好玩了。

```
try {  var foo = require('foo')  var fooVersion = require('foo/package.json').version} catch (er) {  foo = null}
```

题外话
===

仔细读过`package.json`文档后，整体上还是解决了我的不少困惑，对我开发 npm 组件也提供了不少帮助。如果您想了解更多细节和实战，不妨打开我这个项目 vue-awesome-progress[3] 看看，希望对您有所帮助！

> 后台回复**思维导图**，可获取我正在整理的学习路线。

### 参考

[1]

npm init @vitejs/app 的背后，仅是 npm CLI 的冰山一角: https://juejin.cn/post/6950817077670182943

[2]

package.json 官方文档: https://docs.npmjs.com/cli/v7/configuring-npm/package-json

[3]

vue-awesome-progress: https://cumt-robin.github.io/vue-awesome-progress/

[4]

package.json 中你还不清楚的 browser，module，main 字段优先级: https://www.cnblogs.com/qianxiaox/p/14041717.html

[5]

上篇文章 npm install 这一节: https://juejin.cn/post/6950817077670182943#heading-6

  

_END_

  

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXzzPpciaorRnwicnXYBiaSzdB4Hh2ueW2a09xqAztoX9iayLyibTyoicltC7g/640?wx_fmt=png)

  

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)