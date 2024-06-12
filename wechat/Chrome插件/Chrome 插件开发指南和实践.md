> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qPeZZPwUGX2eRi4Q1AGfcw)

> 本文代码：_https://github.com/nyqykk/hello-extensions-react_

阅读本文你将了解到
=========

1.  Chrome 插件整体架构；
    
2.  如何开发一个 Chrome 插件（Popup 和 Devtools）；
    
3.  如何使用前端框架（React/Vue）进行开发；
    
4.  如何调试插件；
    
5.  如何使用 Puppeteer 对插件进行 E2E 测试（本地和 CI 环境）。
    

整体架构介绍
======

明确概念
----

Chrome 插件本质上就是一个特殊的 Web 页面，在这个基础上我们明确下文的称谓：

*   插件页面：指的是插件这个 Web 页面的内容；
    
*   目标页面：指的是在哪个页面打开插件，该页面就是目标页面，例如在 baidu 打开插件，baidu 此时就是目标页面；
    
*   Popup：安装插件时浏览器右上角会有一个插件图标，点击时打开的页面就是 Popup（弹窗）；
    
*   Devtools：F12 打开开发者工具后展示在最上面例如 element、network 都是 Devtools；
    
*   Tab：下方每个都是单独的 Tab，而中间高亮部分是当前停留的页面，也就是**活跃 Tab**。
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWky2BeeKOPuQ3oBCUJOMOmC9QHg70Ghu8t7aOPK47icFD4x401oD0CjC4g/640?wx_fmt=png&from=appmsg)

manifest.json
-------------

> Extensions start with their manifest and every extension requires a manifest.
> 
> 每个扩展都始于一份 manifest 描述文件并且每个扩展都需要它。
> 
> _https://developer.chrome.com/docs/extensions/mv3/manifest/_

它就类似前端项目中的 **package.json** 文件，用于描述整个插件的架构和权限，类似下面这种结构，全部字段可以看官网。

```
{  "name": "Hello Extensions", // 名称  "description": "An introductory tutorial", // 描述  "version": "1.0", // 插件的版本  "manifest_version": 3, // 清单的版本，目前都是使用 V3  // action 字段主要描述点击右上角图标弹出的页面  "action": {    "default_popup": "index.html", // 对应的入口 html 文件（Popup 在后面介绍）    "default_title": "Garfish Module",    "default_icon": {      "16": "favicon.ico",      "48": "favicon.ico",      "128": "favicon.ico"    }  },  // 当需要使用一些特殊 API 时需要在 permissions 声明权限，会提示给用户  "permissions": ["storage", "scripting"],  // 哪些域名允许使用插件  "host_permissions": ["<all_urls>"],  // 声明 background service worker 的路径，在后面介绍  "background": {    "service_worker": "background.js"  },  // 声明 content script 的入口文件路径、允许使用的域名以及执行时机  "content_scripts": [{    "js": ["content.js"],    "matches": ["<all_urls>"],    // 有 "document_start" "document_idle" "document_end" 三个值    "run_at": "document_idle"  }]}
```

content_script（内容脚本）
--------------------

> Content scripts are files that run in the context of web pages. By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits, make changes to them, and pass information to their parent extension.
> 
> 内容脚本是在**目标页面**上下文中运行的文件。通过使用标准的文档对象模型（Document Object Model，DOM），它们能够读取浏览器访问的**目标页面**的详细信息，对它们进行更改，并将信息传递给它们的父扩展。
> 
> _https://developer.chrome.com/docs/extensions/mv3/content_scripts/_

content_script 本质上就是一个 **js 文件**，它可以使用**插件特有的 API**，同时可以操作目标页面上下文中的 DOM，当你需要操作目标页面的 DOM 时可以使用它，**他的生命周期随着插件的打开和关闭而开始和结束**。

但是请注意 content_script 有自己**独立的上下文**，这就意味着它运行在类似沙盒的环境中，此时在 content_script 中修改全局变量，例如 window.a = 1 不会反映到**目标页面**中，而是修改的沙盒中的 window 变量。

service_worker（background）
--------------------------

> Events are browser triggers, such as navigating to a new page, removing a bookmark, or closing a tab. Extensions monitor these events using scripts in their background service worker, which then react with specified instructions.
> 
> 浏览器触发事件，例如导航到一个新页面，删除一个书签，或关闭一个标签。扩展使用后台 service worker 监听这些事件，并在触发时执行回调。
> 
> _https://developer.chrome.com/docs/extensions/mv3/service_workers/_

service_worker 跑在一个单独的线程，可以使用**插件特有的 API**，它本质上也是一个 js 文件，和 content_script 的区别在于:

*   service_worker 的生命周期更长，浏览器打开时开始，关闭浏览器才会结束。而 content_script 的生命周期跟随插件的打开和关闭。通常使用 service_worker 来监听用户的一些操作从而执行回调。
    
*   service_worker 不能访问目标页面的 DOM，而 content_script 可以。
    

popup（弹窗）
---------

浏览器插件右上角的小图标点开时弹出的页面称为 popup，其视图本质上是一个 Web 页面。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyI30o9ED5t4w9bricDg9RNZV0rQQRTeOeRrnTgyWm7nHhCDZ5KEp4Viaw/640?wx_fmt=png&from=appmsg)

Devtools（调试工具）
--------------

> A DevTools extension is structured like any other extension: it can have a background page, content scripts, and other items. In addition, each DevTools extension has a DevTools page, which has access to the DevTools APIs.
> 
> DevTools 扩展的结构与其他任何扩展一样：它可以有一个背景页面（service worker）、内容脚本和其他项目。此外，每个 DevTools 扩展都有一个 DevTools 页面，该页面可以访问 DevTools API。
> 
> _https://developer.chrome.com/docs/extensions/mv3/devtools/_

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyqBruTdIUhM0EHtpcdGf55omHwlOZcHCJVJqqJlc9e9AOP2cmX1ibUOA/640?wx_fmt=png&from=appmsg)

Devtools 也是插件的一种形式，不同于 popup，它有一组 chrome.devtools 独有的 API，当我们调用 chrome.devtools.panels.create 即可创建一个自定义的面板。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyzxpibRicJGUmnNlnia4l7eCLt3bTow1x54XQdnzbxP0eX2FpSPKIic14Fw/640?wx_fmt=png&from=appmsg)

```
chrome.devtools.panels.create(  // 扩展面板显示名称  "DevPanel",  // 扩展面板icon，并不展示  "panel.png",  // 扩展面板页面  "index.html",  function (panel) {    console.log("自定义面板创建成功！");  });
```

像 Vue Devtools 和 React Devtools 都是这种形式，其视图本质上就是一个 Web 页面。

通信
--

完整的通信推荐查看：_https://juejin.cn/post/7021072232461893639#heading-9_

由于 content_script 和 service worker 独立于插件页面，所以时常有消息传递的需求，基本方式：

```
// 发送方 service worker || content_scriptchrome.runtime.sendMessage(data)// 接收方 content_script || service workerchrome.runtime.onMessage.addListener(() => {})
```

但时常 content_script 会有多个，service_worker 只有一个，上述方式会通知所有的 content_script，导致出现问题，推荐指定发送到某一个 Tab 下的 content_script。

```
// 获取当前活跃 Tab（活跃 Tab 概念可以看「明确概念」部分）chrome.tabs.query({active: true}, (tabs) => {    chrome.tabs.sendMessage(tabs[0].id, response =>{    console.log("background -> content script infos have been sended");        }}
```

如何开发一个自己的插件
===========

目录结构
----

```
hello-extensions
├── background
│   └── index.js
├── index.html
├── index.js
├── manifest.json
├── package-lock.json
├── package.json
└── scripts
    └── index.js
```

配置 manifest.json
----------------

```
{  "name": "Hello Extensions",  "description" : "Base Level Extension",  "version": "1.0",  "manifest_version": 3,  "action": {    "default_title": "Hello Extensions",    "default_popup": "index.html" // 指向入口 html 文件  },  "background": {    "service_worker": "background/index.js" // 指向一个 js 文件  },  "content_scripts": [{    "matches": ["<all_urls>"],    "run_at": "document_idle",    "js": ["scripts/index.js"] // 指向一个 js 文件  }],}
```

popup 入口 html
-------------

```
<!-- index.html --><!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta ></script></body></html>
```

js 文件
-----

```
// hello-extensions/index.jsconsole.log('i am index.js in html');// hello-extensions/background/index.jsconsole.log('i am service worker');// hello-extensions/scripts/index.jsconsole.log('i am content script');
```

至此一个最简单的 popup 插件就已经完成，点击右上角图标即可打开 popup 面板。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyibgJxRFMRj7ynEHFzBecHsDe1KE8kMWWXCY6ADlbOK3rNfwbrasLZTA/640?wx_fmt=png&from=appmsg)

开发 Devtools
-----------

Devtools 比较特殊，它需要在 manifest.json 中添加 devtools_page 字段指向一个入口 html 文件，在该文件中需要引入一段 js 来创建 devtools 面板，新的目录结构如下：

```
├── background
│   └── index.js
├── devtools
│   └── index.js
├── devtools.html
├── index.html
├── index.js
├── manifest.json
├── package.json
└── scripts
    └── index.js
```

```
// manifest.json"devtools_page": "devtools.html"
```

Devtools 入口 html 文件 devtools.html 中需要引入一段 js 脚本来创建 devtools 面板。其实这个 devtools.html 个人觉得有些多余，直接指向这个 js 脚本来创建面板就可以了，而不需要这个 html 文件。

```
<!-- devtools.html --><!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta ></script></body></html>
```

```
// devtools/index.js// 创建扩展面板chrome.devtools.panels.create(  // 扩展面板显示名称  "DevPanel",  // 扩展面板icon，并不展示  "panel.png",  // 扩展面板页面  "../index.html",  function (panel) {    console.log("自定义面板创建成功！");  });
```

然后安装插件打开 F12 即可看到 Devtools 面板：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyJzK4VVHIZmSboNUqLNmCAo2CHErqiaXZQejW8ibn8a0WpEPebhhYC01Q/640?wx_fmt=png&from=appmsg)

安装
--

1.  点击 Chrome 右上角「管理扩展程序」；
    
2.  打开右上角开发者模式；
    
3.  左上角加载 hello-extensions 文件夹。
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyrn371twUprF0xOKzkts1STqvgYA8YnPnoVQf2C4agx3lYNDGJIa4qQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyNK9R2udaHZtgvibt18v9qCRZfnZIyiccCSviapKiaTDbF2Gm47aR73opUQ/640?wx_fmt=png&from=appmsg)

如何使用前端框架进行开发
============

在上述模式下开发会有什么问题
--------------

*   Dev 模式无热更新，每次修改都需要手动刷新页面；
    
*   构建时无法享受构建工具的代码压缩、分包等一系列优化；
    
*   语法不支持降级，在低版本浏览器可能会报错等。
    

所以我们需要使用熟悉的前端框架进行开发，这里以 create-react-app 举例（Vue 也差不多），创建一个 React 项目：

```
npx create-react-app hello-extensions-react
cd hello-extensions-react
npm install
npm run eject // 弹出 create-react-app 创建的模版项目的 webpack config 等配置
```

明确构建产物
------

1.  manifest.json 来描述插件整体架构和权限等；
    
2.  固定名称的 service worker、 content_script 和 devtools.js 脚本（不带 hash），因为配置在 manifest.json 中的名字是固定的（当然你可以写插件在构建过程中动态修改，这不在本文讨论范围之内）；
    
3.  可以看到上面的例子中 service worker 和 content script 其实都没有在插件页面的入口 js 中**被 import 引用**（都只是**描述在 manifest.json 中，由插件自行注入**），所以在 webpack 等构建工具打包时生成的模块依赖图中不会包含这部分，所以我们**需要单独以它们为入口文件进行打包**。
    

删除冗余部分后目录结构如下：

```
├── README.md
├── config
│   ├── env.js
│   ├── getHttpsConfig.js
│   ├── jest
│   │   ├── babelTransform.js
│   │   ├── cssTransform.js
│   │   └── fileTransform.js
│   ├── modules.js
│   ├── paths.js // 一些路径配置
│   ├── webpack
│   │   └── persistentCache
│   │       └── createEnvironmentHash.js
│   ├── webpack.config.js // webpack 配置
│   └── webpackDevServer.config.js
├── package.json
├── public
│   ├── devtools.html
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── scripts
│   ├── build.js
│   ├── start.js
│   └── test.js
└── src
    ├── App.js
    ├── background
    │   └── index.js
    ├── content_scripts
    │   └── index.js
    ├── devtools
    │   └── index.js
    └── index.js
```

修改配置
----

1.  在 public 文件夹下新增 manifest.json 文件，格式和上面「如何开发一个自己的插件」中一样；
    
2.  去掉 webpack.config.js 中生成 js 文件的 contenthash；
    
3.  以 service worker、 content_scripts 和 devtools 为入口进行**多入口打包**，同时由于 Devtools 需要一个默认的 html 页面来引入打包后的 devtools.js（参考「如何开发一个自己的插件」），所以此时还需要配置 **HtmlWebpackPlugin** 多生成一份 html 文件，同时在其中**引入 devtools.js 生成的 chunk**。
    

```
// paths.js+ devtoolsHtml: resolveApp('public/devtools.html'),+ devtools: resolveModule(resolveApp, 'src/devtools/index'),+ background: resolveModule(resolveApp, 'src/background/index'),+ content_script: resolveModule(resolveApp, 'src/content_scripts/index'),// webpack.config.js// dev 环境打包 service worker 等也没用，因为正常 web 页面中不会使用到entry: isEnvProduction ?  {    main: paths.appIndexJs,    devtools: paths.devtools,    background: paths.background,    content_script: paths.content_script  } :  {    main: paths.appIndexJs  },// 配置 HtmlWebpackPluginnew HtmlWebpackPlugin(  Object.assign(    {},    {      inject: true,      filename: 'index.html',      template: paths.appHtml,      chunks: ['main']    }  )),new HtmlWebpackPlugin(  Object.assign(    {},    {      inject: true,      filename: 'devtools.html',      template: paths.devtoolsHtml,      chunks: ['devtools']    }  )),
```

此时打包会报 eslint 的错误：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyCjicIicBcgNWwHhic6al35icichVWfF652It4P3kficKz3yXH0G0UlJt2GLw/640?wx_fmt=png&from=appmsg)

我们需要在根目录添加 .eslintrc 文件来描述当前应用的目标产物是 extensions 也就是插件产物：

```
// .eslintrc{  "env": {    "webextensions": true  }}
```

执行 npm run build 后将产物文件夹按上面「如何开发一个自己的插件」安装即可（Devtools 没出来关掉浏览器重试，比较玄学），后续就是正常的 Web 开发流程了，当然如果你想使用一些插件的 API 还是会报错的，这样只适合开发正常 Web 页面逻辑，需要调试插件独有的 API 还是需要 build 后安装再进行调试。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyd1Z2Hic0r2aPWFOS3C3FXd5I5McwaIW4DuD5ic5NT3z1MT1MhgLIHIHg/640?wx_fmt=png&from=appmsg)

如何调试插件
======

插件的调试稍微有点麻烦，分四个方面：

*   popup 的调试；
    
*   Devtools 的调试；
    
*   content_script 调试；
    
*   service worker 调试。
    

popup 页面的调试
-----------

我们右键点击右上角插件图标 -> 审查弹出内容即可进入插件的 html 页面中进行调试：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyyDjo6zRBtdggETtP66j1gQhYH1YAM0OCeMse3ib4OQefI4DhYzDNlUA/640?wx_fmt=png&from=appmsg)

Devtools 的调试
------------

F12 打开控制台，选择 Devtools 面板单独打开浏览器进行调试：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyLP0ibguJudic37ial6z2giaKiaichrPREAfc36FvnTEZxTrOcPesAicLVqHdw/640?wx_fmt=png&from=appmsg)

然后在此页面中 Mac 系统按住 **Comand + Option + i**（windows 笔者目前没有，可以自行尝试一下），即可打开 **Devtools 的 Devtools**（是的就是套娃），此时不仅可以调试自己的插件，**还可以调试默认的 element、network 等面板**，由此我们也可以得知类似 **network 这种面板其实也是上述同样的开发模式并且默认集成在 Chrome 中**。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyQKjsQ4OicUxCwaiaVY7ME0tjeuLjLHg1tQFaR2mjLo4ylDYgtjIA7hFw/640?wx_fmt=png&from=appmsg)

content_script 调试
-----------------

由于 content_script 是注入到目标页面的，所以 F12 打开目标页面的控制台即可进行调试。

service worker 调试
-----------------

进入到插件面板点击 service worker 即可进行调试：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8wExicAOVNv9KzPer1HUWkynzaGxaZ05TW02MibdPDEJvDcDAlTgRXvZmLUDJdemSarhXrMKrqWCiag/640?wx_fmt=png&from=appmsg)

如何使用 Puppeteer 进行 E2E 测试
========================

_https://github.com/puppeteer/puppeteer_

简单介绍
----

Puppeteer 是一款浏览器自动化工具，可以帮助我们**自动控制浏览器的行为**，例如打开指定 URL，点击某个 button 等行为。

如何测试
----

正常 E2E 测试需要跳转到指定 URL 然后进行测试，Chrome 插件也不例外，所以我们无非是要获取到插件页面的 URL 跳转进去再进行正常 E2E 测试即可。

首先观察插件页面的 URL 组成如下：

```
`chrome-extension://${插件id}`// 例如'chrome-extension://dmlpmahdbmhcfonakcknmkeobmopidgl'
```

所以我们的目标变成了获取插件的 id，而 Puppeteer 是支持自动安装上插件的，问题在于安装上之后如何获取 id，此时代码如下：

```
const puppeteer = require('puppeteer');async function bootstrap(options) {  const { appUrl } = options;  const extensionPath = 'xxx'; // 插件路径  const browser = await puppeteer.launch({    headless: false, // 需要配置有头模式，无头模式找不到 service worker    args: [      // 除了 extensionPath 的插件都禁用掉，避免测试被影响      `--disable-extensions-except=${extensionPath}`,      // 安装插件      `--load-extension=${extensionPath}`    ]  });  const appPage = await browser.newPage();  await appPage.goto(appUrl, { waitUntil: 'load' });  const targets = await browser.targets();  // 找到 sercice worker 即可获取到目标插件  const extensionTarget = targets.find((target) => {    return target.type() === 'service_worker'  });  // 解析目标插件 url 获得插件 id  const partialExtensionUrl = extensionTarget.url() || '';  const [, , extensionId] = partialExtensionUrl.split('/');  const extPage = await browser.newPage();  const extensionUrl = `chrome-extension://${extensionId}/index.html`;  await extPage.goto(extensionUrl, { waitUntil: 'load' });  return {    appPage,    browser,    extensionUrl,    extPage  };}bootstrap({  appUrl: 'https://www.baidu.com'})module.exports = { bootstrap };
```

其中的问题
-----

上述模式在有头模式下本地跑 E2E 测试是没问题的，因为**本地有图形化界面**，但是如果在 CI 环境**比如 Linux 环境中并没有图形化界面**，此时 headless:false 也就是有头模式会直接报错导致测试不通过，所以我们需要在没有图形化界面的环境中**模拟一套图形化界面**，这时我们就可以用到 **xvfb**。

> Xvfb 在一个没有图像设备的机器上实现了 X11 显示服务的协议。它实现了其他图形界面都有的各种接口，但并没有真正的图形界面。所以当一个程序在 Xvfb 中调用图形界面相关的操作时，这些操作都会在虚拟内存里面运行，只不过你什么都看不到而已。
> 
> _https://zhuanlan.zhihu.com/p/350944759_

简单来说就是让浏览器以为自己跑在有图形界面的系统中，从而让有头模式正常运行。

首先就需要在 CI 环境中安装 xvfb，一般我们都是配置一份 pipeline 脚本来做，例如：

```
// xxx-pipeline.yamlsteps:  - name: Configuration xvfb    commands:      - sudo apt-get update      - sudo apt-get install xvfb// 手动也可以sudo apt-get updatesudo apt-get install xvfb
```

然后调整启动测试脚本的逻辑

```
// before
node test/index.js

// after
xvfb-run node test/index.js
```

然后我们就可以愉快的发现在比如 Linux 环境下也可以跑通用例了～

✅ 至此开发一个 Chrome 插件的整个生命周期基本都已覆盖。

关于我们
====

我们是字节跳动 Web Infra - Web Solutions 团队，服务于整个公司的 Web 生态，我们的愿景是 打造世界一流的 Web 生态技术体系，为字节产品提供极致的用户体验和开发体验。

我们坚信 Web 技术是最伟大的事情之一，Web Infra 团队竭力提供更好用的工具，让 Web 开发更加容易、让开发者能收获更好的开发体验、用户收获更好的用户体验。与此同时，开源也一直是我们在长期探索的事情。

我们打造了一系列 Web 工具来提升开发效率和体验，包括但不限于：

*   基于 Rust 的 Web 构建工具 —— Rspack（_https://github.com/web-infra-dev/rspack_），旨在建设高性能前端工具链，让跨端和 Web 场景拥有 “快人一步” 的开发体验，具备极速的编译和热更新性能。
    
*   基于 Rspack 的开源方案，包括 Rsbuild（_https://github.com/web-infra-dev/rsbuild_）、Rspress（_https://github.com/web-infra-dev/rspress_） 和 Modern.js（_https://github.com/web-infra-dev/modern.js_），构成一系列开箱即用的解决方案，提供从 Web 构建、静态站点生成到全栈研发的多场景支持。
    
*   高性能 Web 解决方案，基于 Web 不止于 Web。突破传统的 WebView，与端、浏览器内核相结合，持续探索各种端性能优化方式，让开发者以极低成本享受优化能力。
    
*   现代 Web 工程体系，包括基于 React 的渐进式 Web 开发框架、基于 esbuild 的模块开发工具、monorepo 解决方案、微前端 / 微模块解决方案、构建诊断分析工具。
    

当前，这些工具在 ByteDance 内部被广泛使用和好评。同时，其中多个项目已经开源到 GitHub，与社区开发者共同建设和发展。

欢迎加入
----

欢迎志同道合的伙伴加入我们：_https://job.toutiao.com/s/iRKosMet_

![](https://mmbiz.qpic.cn/mmbiz_jpg/lP9iauFI73z8wExicAOVNv9KzPer1HUWkyNlIX8GAxk7CkLSicntaFhs7Ek6DPOOUwCQBQCaeAjFT3QiaJ2LHSibSQQ/640?wx_fmt=jpeg)

北 / 上 / 杭 / 深 / 西雅图

点击上方关注

![](https://mmbiz.qpic.cn/mmbiz_gif/JaFvPvvA2J3MKYVlmXC32WtRJEYsPM9zbyZQtPicnOVfKibj5PuaiarJibbQgR5WWf52x1FicLIhiaweLvCoqia0TGibqg/640?wx_fmt=gif)

  

我们下期再见