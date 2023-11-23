> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9MCmf_iTYrMXvzBdVcPYow)

痛点
==

我们的主项目代码库目前已经有 **2800** **多**个组件。数千个组件构成几十个路由页面。

无论是新同学或者是老同学，在定位问题或者是开发页面的时候寻找对应的源代码都相当痛苦。搜文案？搜 class？都发现有大量的重复。针对这个问题我调研了下业内相对应的解决方案。发现目前已经有一些工具或者 npm 包解决这个问题，本文就和大家分享下。

解决方案
====

方案一：chrome React Developer Tools 插件
-----------------------------------

_https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?utm_source=ext_app_menu_

### 推荐指数：🌟

不快！

### 使用方式

1.  打开 chrome devTools -> 选择 Components -> 选择 vscode 打开。
    

> 可以通过自定义协议的方式打开更多编辑器

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq85a6yVHIjHexePMtsTQ50OWZjQbeDFG4144K3z7r1EibOM1zziarzCoAw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq82uABrMoBJ48jyOhFe6NQEupZTiaVzHf65a6VlicntFnWjP1XNgmTj2Uw/640?wx_fmt=png&from=appmsg)

2.  选择需要打开的组件 -> 点击 open in editor（大大的箭头我找入口找了好久）。
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8nIr4AGLb6uicbVUibf6BNlWEBKcCEgsXlt8zWcP8wCNNzEZGw3tylBSA/640?wx_fmt=png&from=appmsg)

### 演示

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8fiaJmic2vQ1m2TEyPh7KG9X38JODfZmeNXy42lBWLkNQMJoia3320jQFA/640?wx_fmt=gif&from=appmsg)

### 优点

*   无需修改代码，安装即用；
    
*   可以顺便看看组件参数；
    

### 缺点

*   操作路径复杂，需要打开控制台 - 定位组件 - 点击打开；
    
*   在大型项目中经常出现加载中 / 加载失败 / 超时等问题。极度不稳定；
    

方案二：chrome 插件
-------------

### 推荐指数：🌟🌟🌟

虽然这种方式基本满足要求，但是作为提效工具要满足快准狠。

相关插件：React Inspector，locatorjs(可以手动选择无法定位的层级)。

### 使用方式

安装后使用对应快捷键触发，选择需要打开的组件即可打开。

### 演示

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8oJgTYfp5wGdDQ9JITb6WDOEDwRPH9CwDMrUzjbIhXicgU4nAeB2ibqEg/640?wx_fmt=gif&from=appmsg)

### 优点

*   无需修改代码，安装即用；
    
*   操作简单；
    

### 缺点

*   依靠 react 代码生成在 fiber 节点的 **_debugSource** 属性实现。无该属性则无法打开定位；
    
*   针对一些特殊写法定位不准确，在组件内直接返回另一个组件的的编写方式下情况更明显；
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8FbG2ibkcWbo8knhAmnaxnvQO7HKcicJu92ew5R09TeYE7WSXsYJXjIVQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8HibvLHjy8MtFVicyibTQJRRV9DwMibTibSUSnaJAFxIVc1Siap3JKPZEQRTg/640?wx_fmt=png&from=appmsg)

方案三：react-dev-inspector npm 包实现
-------------------------------

### 推荐指数：🌟🌟🌟🌟🌟

一次操作幸福一生！

### 代码接入

React-dev-inspector 官网有详细接入步骤。但是我在接入过程中遇到一些坑点。这里总结下我的接入方式，可以避免一些问题。

1.  安装 @react-dev-inspector/babel-plugin 和 react-dev-inspector。
    

```
npm i -D @react-dev-inspector/babel-plugin react-dev-inspector
```

2.  在 .babelrc 中添加 babel 插件。
    

```
{  "plugins": ["@react-dev-inspector/babel-plugin"]}
```

3.  在 React-dev-inspector 中有两种调起编辑器的方式。一种是浏览器 schema 直接调起，另外一种是 node 服务调起。
    

下面我们先看 schema 调起：

> schema 调起比较简单；node 中间件服务调起基于 react-dev-utils 提供的调起方法，能调起更多种类的编辑器。
> 
> react-dev-utils 调起代码：_https://github.com/facebook/create-react-app/blob/main/packages/react-dev-utils/launchEditor.js#L29_

#### 服务中间件调起（React-dev-inspector 包默认调起方式）

不推荐！

*   在业务根组件代码中引入调起组件。
    

```
import { Inspector } from 'react-dev-inspector';// 调起组件<Inspector />
```

*   安装中间件服务。
    

```
npm i -D @react-dev-inspector/middleware
```

*   devServer 加入中间件。
    

```
const { launchEditorMiddleware } = require('@react-dev-inspector/middleware')// webpack 5module.exports = {  ...  devServer: {    setupMiddlewares(middlewares) {      middlewares.unshift(launchEditorMiddleware)      return middlewares    },  },}// webpack 4module.exports = {  ...  devServer: {    before: (app, server, compiler) => {      app.use(launchEditorMiddleware)    },  },}
```

> react-dev-inspector 默认打包注入的路径是相对路径。再通过 node 中间件服务调起拼接路径。当代码路径和 devServer 不在同一个目录下（在微前端项目中存在子应用在不同的代码库），这种方式会出现调起失败。因为拼接的路径是接收请求处理的 node 服务的**工作目录**。如果子应用不在这个路径下，则会失败。针对这种场景可以采用 schema 调起解决。

#### schema 调起

*   将当前应用目录添加到全局变量
    

```
//webpack.config.jsvar webpack = require('webpack');module.exports = {    ...    plugins: [        new webpack.DefinePlugin({            'process.env.CWD': JSON.stringify(process.cwd()),        })    ]};
```

*   自定义调起组件逻辑。
    

```
import React from 'react';import { Inspector } from 'react-dev-inspector';import {    gotoVSCode,    gotoWebStorm} from 'react-dev-inspector/lib/Inspector/utils/editor';const InspectorPlugin = () => {    if (process.env.NODE_ENV === 'development') {        return (            <Inspector                onInspectElement={({ codeInfo }) => {                    // 拼接工作目录                    if (codeInfo.absolutePath === undefined) {                        codeInfo.absolutePath = `${process.env.CWD}/${codeInfo.relativePath}`;                        delete codeInfo.relativePath;                    }                    // 调起vscode                    gotoVSCode(codeInfo);                    // 调起WebStorm                    // gotoWebStorm(codeInfo);                }}            />        );    }    return null;};export default InspectorPlugin;
```

*   在业务根组件代码中引入调起组件。
    

```
import InspectorWrapper from '...';<InspectorWrapper />
```

4.  使用快捷键选择组件打开编辑器。
    

### 演示

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8cfm0LcUHvnSictacIm7dEaQ9JoKL4Sp2HnVLMYswwBWcKxRO1vghBJQ/640?wx_fmt=gif&from=appmsg)

### 优点

*   解决了上述两种方案的缺点。调起速度快，任何节点都可以调起；
    

### 缺点

*   需要代码接入；
    
*   打包时长较长 (待解决)（电脑性能较差可以选择第二个方案的 locatorjs 插件）；
    

插件下载地址
======

locatorjs：_https://chrome.google.com/webstore/detail/locatorjs/npbfdllefekhdplbkdigpncggmojpefi_

React Inspector：_https://chrome.google.com/webstore/detail/react-inspector/gkkcgbepkkhfnnjolcaggogkjodmlpkh_

参考文档
====

react-dev-inspector 官网：_https://github.com/zthxxx/react-dev-inspector_

加入我们
====

「营销科学」致力于帮助品牌生意长期科学增长，通过科学的诊断、洞察、优化和度量，将品牌的人群、内容、触点和商品变得可量化、可沉淀、可优化，通过分所各类资产的变化和流转，帮助品牌做营销决策，实现在充满不确定性的大环境下，提升营销效率和和增长确定性。

营销科学前端团队负责字节跳动旗下的数字化商业增长引擎「巨量云图」&「巨量算数」平台功能开发、易用性改进、数据可视化和前端工程优化，为用户提供更好的产品体验。我们的主要技术栈有 React、TypeScript、NodeJS、Taro 等。

点击左下角 " 阅读读原文 " 或扫描下方二维码，我们期待你的加入!

![](https://mmbiz.qpic.cn/mmbiz_jpg/lP9iauFI73z8ytxxicGTr1a5UlpPiaVYLq8CbEY54cYuDBlc0jAFzSfIw3Re9iaBUtcjRhmkepHCB6zrjxpZ6icJVPg/640?wx_fmt=jpeg&from=appmsg)

团队 base 北京

广告前端研发工程师 - 云图：_https://job.toutiao.com/s/iR59cmc9_

点击上方关注

![](https://mmbiz.qpic.cn/mmbiz_gif/JaFvPvvA2J3MKYVlmXC32WtRJEYsPM9zbyZQtPicnOVfKibj5PuaiarJibbQgR5WWf52x1FicLIhiaweLvCoqia0TGibqg/640?wx_fmt=gif)

  

我们下期再见