> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/H8emiJzYxN06Syrmn5ShOg)

前言
--

之前写过一篇文章，[《将 React 应用迁移至 Vite》](http://mp.weixin.qq.com/s?__biz=Mzg4MTcyNDY4OQ==&mid=2247487470&idx=1&sn=8b1bf7195bfdb086435da2c1b66c00cd&chksm=cf60d390f8175a8638a896e052718ea76a69ffd91a328f7fa4ee45e6920411ab9d55a85ee847&scene=21#wechat_redirect)[1] 介绍了 Vite 的优势，并且和 webpack 做对比，但 webpack5 有个很重要的功能，就是模块联邦，那么什么是模块联邦？Vite 中也可以实现吗？我们一起来探究下。

什么是模块联邦？
--------

Module Federation 中文直译为 “模块联邦”，而在 webpack 官方文档中，其实并未给出其真正含义，但给出了使用该功能的 `motivation`， 即动机，翻译成中文

> 多个独立的构建可以形成一个应用程序。这些独立的构建不会相互依赖，因此可以单独开发和部署它们。这通常被称为微前端，但并不仅限于此。

原文在这里：module-federation[2]， 并且给出了 stackblitz 在线运行链接 [3]

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84vqeLobB714uPypScfhbTw06x4NCXYYjZsYLDICtfmtPxibGg13XfBy5ZDNeZ2ptEQosGTCvic7ic1Q/640?wx_fmt=png)

这个是一个基于 `lerna` 的 `monorepo` 仓库， `app1` 和 `app2` 是并行启动的， 分别运行在 `3001` 和 `3002` 端口上。

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84vqeLobB714uPypScfhbTwLuzktuQZFIK1fDzlh5QLvEmlLrvERUMx592xamjEL1rzcph3z2XucQ/640?wx_fmt=png)

但在 `app1` 中却可以直接引用 `app2` 的组件

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84vqeLobB714uPypScfhbTwnGL55KC78I4mvsv3btOTOjgSMfk6Tuq0cUADvrTmBd6SEdNmZOGPsw/640?wx_fmt=png)

现在，直接修改 `app2` 中组件的代码，在 `app1` 中就可以同步更新。

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84vqeLobB714uPypScfhbTwJSFGC9Ir9juR8TyRZELrwpK8xI5pJKWEibq7icNAe2YnWRR4SNxIyYLw/640?wx_fmt=png)

此处需要点击下刷新按钮，因为 2 个应用启动在 2 个端口上，所以不会热更新。

结合以上，不难看出，MF 实际想要做的事，便是把多个无相互依赖、单独部署的应用合并为一个。通俗点讲，即 MF 提供了能在当前应用中加载远程服务器上应用模块的能力，这就是模块联邦（Module Federation）。

模块联邦解决了什么问题
-----------

我们要在多个应用直接实现模块共享，我们原来是怎么做的？

1.  发布 npm 组件
    

npm 是前端的优势，也是前端之痛，一个项目只依赖了 1 个 npm 包，而在 `node_modules` 却有无数个包，若是纯粹的基础组件发布 npm 包还可以，因为不常改动，若一个模块涉及业务，发布 npm 包就会变得很麻烦，比如一个常见的需求，需要给每个应用加上**客服聊天窗口**。这个聊天窗口会随着 `chat services`的改动而变化，当 `chat` 这个组件改变时，我们就会陷入 `npm 发布 ——> app 升级 npm 包 -> app 上线` 这样的轮回之中，而在现实场景中，我们会采用另一种方式。

2.  Iframe
    

Iframe 是另一种方案，可以将 chat 做一个 `iframe` 嵌入到各个应用中，这样只需要升级 chat 一个应用，其他应用都不用改动。但 iframe 也有缺点，首先使用 iframe 每次打开组件，DOM 树都会重建，所以打开速度较慢。其次 iframe 跨应用通信使用 `window.postMessage` 的方式，若应用部署在不同的域名下，使用 `postMessage` 需要控制好 `origin` 和 `source` 属性验证发件人的身份，不然可能会存在跨站点脚本漏洞。

而 MF 很好地解决了多应用模块复用的问题，相比上面的这 2 中解决方案，它的解决方式更加优雅和灵活。

如何配置模块联邦
--------

MF 引出下面两个概念：

*   Host：引用了其他应用模块的应用, 即**当前应用**
    
*   Remote：被其他应用使用模块的应用， 即**远程应用**
    

### 在 webpack 中配置

无论是当前应用还是远程应用都依赖 webpack5 中的 `ModuleFederationPlugin plugin`

作为组件提供方，需要在 `plugins` 中配置如下代码

```
const { ModuleFederationPlugin } = require('webpack').container;const path = require('path');module.exports = {  entry: './src/index',  mode: 'development',  devServer: {    static: path.join(__dirname, 'dist'),    port: 3002,  },  output: {    publicPath: 'auto',  },  plugins: [    new ModuleFederationPlugin({        // 远程组件的应用名称      name: 'app2',      // 远程组件的入口文件      filename: 'remoteEntry.js',      // 定义需要导出的组件列表      exposes: {        './App': './src/App',        './Component': './src/component',      },      // 可以被共享的模块      shared: { react: { singleton: true }, 'react-dom': { singleton: true } },    }),  ],};
```

*   `shared` 本地模块和远程模块共享的依赖。
    
*   `singleton` 表示共享作用域中共享模块使用当前的版本（默认情况下禁用）。一些库使用全局内部状态（例如 react、react-dom）。因此，对一次只能运行一个库实例是至关重要的。
    

在当前应用中，也就是作为组件的使用方，需要在 `webpack.config.js` 中配置如下代码：

```
const HtmlWebpackPlugin = require("html-webpack-plugin");const { ModuleFederationPlugin } = require("webpack").container;const path = require("path");module.exports = {  entry: "./src/index",  mode: "development",  devServer: {    static: path.join(__dirname, "dist"),    port: 3001,  },  output: {    publicPath: "auto",  },  plugins: [    new ModuleFederationPlugin({        // 当前应用名称      name: "app1",      // 远程应用加载js入口列表      remotes: {        app2: "app2@http://localhost:3002/remoteEntry.js",      },      //共享的模块      shared: {react: {singleton: true}, "react-dom": {singleton: true}},    })  ],};
```

本地模块需配置所有使用到的远端模块的依赖；远端模块需要配置对外提供的组件的依赖。

最后一步需要**将入口文件改为异步加载**。

比如原先的入口文件 `index.js`

```
import React from 'react';import ReactDOM from 'react-dom';import App from './App';ReactDOM.render(<App />, document.getElementById('root'));
```

将`index.js`要修改为异步加载

```
+ import('./bootstrap');- import React from 'react';- import ReactDOM from 'react-dom';- import App from './App';- ReactDOM.render(<App />, document.getElementById('root'));
```

重命名原先的 `index.js` 为 `bootstrap.js`

```
import React from 'react';import ReactDOM from 'react-dom';import App from './App';ReactDOM.render(<App />, document.getElementById('root'));
```

```
const RemoteApp = React.lazy(() => import("app2/App"));
```

这样在 app1 中就可以只有引用 app2 中的组件了。

### 在 vite 中配置

MF 提供的是一种加载方式，并不是 webpack 独有的，所以社区中已经提供了一个的 Vite 模块联邦方案: vite-plugin-federation[4]，这个方案基于 Vite(Rollup) 也实现了完整的模块联邦能力。

Vite 模块联邦 stackblitz 在线运行链接 [5] 打开这个示例，请按 readme 命令依次运行，由于 Vite 是按需编译，所以 app2 必须先打包启动， 2 个 App 无法同时是开发模式。

**配置步骤**

首先需要安装 `@originjs/vite-plugin-federation`

app1 当前应用：`vite.config.js`配置

```
import { defineConfig } from "vite";import react from "@vitejs/plugin-react";import federation from "@originjs/vite-plugin-federation";// https://vitejs.dev/config/export default defineConfig({  plugins: [    react(),    federation({      name: "app1",      remotes: {        app2: "http://localhost:3002/assets/remoteEntry.js",      },      shared: ["react"],    }),  ],});
```

app2 远程应用：`vite.config.js`配置

```
import { defineConfig } from "vite";import react from "@vitejs/plugin-react";import federation from "@originjs/vite-plugin-federation";// https://vitejs.dev/config/export default defineConfig({  plugins: [    react(),    federation({      name: "app2",      filename: "remoteEntry.js",      library: { type: "module" },      exposes: {        "./App": "./src/App.jsx",      },      shared: ["react"],    }),  ],});
```

我们看到这些配置同 webpack 如出一辙，稍微不同的是

remotes 对象中不需要写, `app2@`这个全局变量名称，并且 vite 打包的 `remoteEntry.js` 默认在 assets 文件夹下

```
remotes: {    app2: "http://localhost:3002/assets/remoteEntry.js",},
```

`vite-plugin-federation` 还可以和 webpack 配合使用

```
remotes: {    app2: {        external: 'http://localhost:5011/remoteEntry.js',        format: 'var',        from: 'webpack'    }}
```

官方还提供了 `systemjs`\ `esm` 和 `var` 等不同的加载方式

<table width="100%"><thead><tr data-style="border-width: 0px; border-style: initial; border-color: initial; background-color: white;"><th data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left; color: rgb(17, 24, 39); font-weight: bold; background-color: rgba(249, 250, 251, 0.75);">host</th><th data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left; color: rgb(17, 24, 39); font-weight: bold; background-color: rgba(249, 250, 251, 0.75);">remote</th><th data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left; color: rgb(17, 24, 39); font-weight: bold; background-color: rgba(249, 250, 251, 0.75);">demo</th></tr></thead><tbody><tr data-style="border-width: 0px; border-style: initial; border-color: initial; background-color: white;"><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>esm</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>esm</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;">simple-react-esm</td></tr><tr data-style="border-width: 0px; border-style: initial; border-color: initial; background-color: white;"><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>systemjs</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>systemjs</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;">vue3-demo-esm</td></tr><tr data-style="border-width: 0px; border-style: initial; border-color: initial; background-color: white;"><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>systemjs</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>webpack</code>+<code>systemjs</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;">vue3-demo-systemjs</td></tr><tr data-style="border-width: 0px; border-style: initial; border-color: initial; background-color: white;"><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>esm</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>webpack</code>+<code>var</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;">vue3-demo-webpack-esm-var</td></tr><tr data-style="border-width: 0px; border-style: initial; border-color: initial; background-color: white;"><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>rollup/vite</code>+<code>esm</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;"><code>webpack</code>+<code>esm</code></td><td data-style="border-width: 0px 0px 1px; border-top-style: initial; border-right-style: initial; border-left-style: initial; border-top-color: initial; border-right-color: initial; border-left-color: initial; border-bottom-style: solid; border-bottom-color: rgb(209, 213, 219); font-size: 16px; padding: 10px; text-align: left;">vue3-demo-webpack-esm-esm</td></tr></tbody></table>

官方还提供了 2 点 `warning`：

*   React 项目中不能使用异构组件（例如 vite 使用 webpack 的组件或者反之），因为现在还无法保证 `vite/rollup` 和 `webpack` 在打包 `commonjs` 框架时转换出 `export` 一致的 chunk，这是使用 `shared` 的先决条件
    
*   `vite` 使用 `webpack` 组件相对容易，但是 `webpack` 使用 `vite` 组件时 `vite-plugin-federation` 组件最好是 `esm` 格式，因为其他格式暂时缺少测试用例完成测试
    

模块联邦的原理
-------

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84vqeLobB714uPypScfhbTwqHkj9P63o6VRRw34OOchcMRqbFgG8iaXB6OQUEcPfOXyk9eYlo02FMg/640?wx_fmt=png)

### ‍Host 端消费 Remote 模块

![](https://mmbiz.qpic.cn/mmbiz_png/e4YNLngAJ84vqeLobB714uPypScfhbTwb8TvbYeFZ06L6aHUfVIK5nPsVWDZxRG9S7uHke1tWsELmYY2t5V4XA/640?wx_fmt=png)整体逻辑

比如 Host 端有如下代码

```
import Section from './components/Section.vue'const script = {  name: 'App',  components: {    Section,    Button: () => import('./components/Button.vue'),    RemoteButton: () => import('remote-simple/remote-simple-button'),  }}
```

编译后悔转换为如下代码

```
import __federation__ from '__federation__';import Section from './components/Section.vue'const script = {  name: 'App',  components: {    Section,    Button: () => import('./components/Button.vue'),    RemoteButton: () => __federation__.ensure("remote-simple").then((remote) => remote.get("./remote-simple-button")),  }}
```

而 `__federation__` 是一个虚拟文件，用于维护 `remotesMap`对象

```
const remotesMap = {  'remote-simple': () => import('http://localhost:5011/remoteEntry.js')}const shareScope = {  vue: { get: () => import('__rf_shareScope__${vue}') }}const initMap = {}export default {  ensure: async (remoteId) => {    const remote = await remotesMap[remoteId]()    if (!initMap[remoteId]) {      remote.init(shareScope)      initMap[remoteId] = true    }    return remote  }}
```

### Remote 端暴露模块

比如 Remote 暴露了 Button 模块

```
exposes: {  './Button': './src/components/Button.js',},
```

则会生成如下 `remoteEntry.js`

```
let moduleMap = {"./Button":()=>{return import('./button.js')},};const get =(module, getScope) => {    return moduleMap[module]();};const init =(shareScope, initScope) => {    let global = window || node;    global.__rf_var__shared= shareScope;};export { get, init };
```

`moduleMap` 维护了所有导出的 `remote` 模块对象， `init()`做一些`shareScope`初始化的工作。`get()`会根据传入的模块名动态加载模块。

此时 `remote` 端 `./button.js` 是不存在的，需要根据 exposes 配置信息将模块单独打包为 chunk，供 Host 端调用时加载。所以需要将 `remote` 端改成多入口的打包方式，Rollup 插件在 `options()`钩子，根据 `exposes` 改写 Rollup 的 `input` 配置，例如示例的 `exposes` 会生成：

```
input: {    Button: './src/components/Button.js'}
```

以上便是模块联邦的基本逻辑。

模块联邦存在问题
--------

*   CSS 样式污染问题，建议避免在 component 中使用全局样式。
    
*   模块联邦并未提供沙箱能力，可能会导致 JS 变量污染
    
*   在 vite 中， React 项目还无法将 webpack 打包的模块公用模块
    

小结
--

鉴于 MF 的能力，我们可以完全实现一个去中心化的应用：每个应用是单独部署在各自的服务器，每个应用都可以引用其他应用，也能被其他应用所引用，即每个应用可以充当 Host 的角色，亦可以作为 Remote 出现，无中心应用的概念。

本文介绍了什么是模块联邦，在模块联邦之前，前端模块共享存在着各种痛点，并且通过在线例子演示了模块联邦的配置，也介绍了`vite-plugin-federation` 插件的使用及原理，它让我们可以在 Vite 项目中也可以实现模块共享。总体而言模块联邦配置相对简单，但模块联邦想要真正落地可能需要全员推动，因为在现实开发中，存在着跨部门协作，开发人员不可能了解每个项目的 `vite.config.js` 配置，这就需要我们将所有的 `remote` 模块维护成文档，供跨团队调用。

以上就是本文全部内容，希望这篇文章对大家有所帮助，也可以参考我往期的文章或者在评论区交流你的想法和心得，欢迎一起探索前端。

参考
--

[1] 将 react 应用迁移至 Vite： _https://juejin.cn/post/7110535158863757319_

[2]module-federation： _https://webpack.js.org/concepts/module-federation/_

[3]stackblitz 在线运行链接： _https://stackblitz.com/github/webpack/webpack.js.org/tree/master/examples/module-federation?file=README.md&terminal=start&terminal=_

[4]vite-plugin-federation： _https://github.com/originjs/vite-plugin-federation_

[5]vite 模块联邦 stackblitz 在线运行链接： _https://stackblitz.com/edit/github-kyokdx?file=readme.md_