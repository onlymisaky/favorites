> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_voGhm3NJ8fyxoOgxooW0g)

大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复 1，加入高级前段交流

前言
==

前段时间由于要实现 H5 移动端拉取微信卡包并同步卡包数据的功能，于是在项目中引入了 **` 微信 JS-SDK（jweixin）`**[1] 相关包实现功能，但也由此让我对其产生了好奇心，于是打算好好了解下相关的内容，通过查阅相关资料发现这其实属于 **`JSBridge`** 的一种实现方式。

因此，只要了解 **`JSBridge`** 就能明白 **`微信 JS-SDK`** 是怎么一回事。

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQQD0eGxrpBKGRRibhslhF8uGgG3Zgabg9Oddq4lysH5EJaibIfqVUwDrgxAgiaXQ6k2ib1wz1JOfCYtYQ/640?wx_fmt=other)66A4AF0E.jpg

为什么需要 JSBridge？
===============

相信大多数人都有相同的经历，第一次了解到关于 **`JSBridge`** 都是从 **`微信 JS-SDK（WeiXinJSBridge）`** 开始，当然如果你从事的是 **`Hybrid 应用`** 或 **`React-Native`** 开发的话相信你自然（应该、会）很了解。

其实 **`JSBridge`** 早就出现并被实际应用了，如早前桌面应用的消息推送等，而在移动端盛行的时代已经越来越需要 **`JSBridge`**，因为我们期望移动端（`Hybrid 应用` 或 `React-Native`）能做更多的事情，其中包括使用 **客户端原生功能** 提供更好的 交互 和 服务 等。

然而 **JavaScript** 并不能直接调用和它不同语言（如 Java、C/C++ 等）提供的功能特性，因此需要一个中间层去实现 **JavaScript** 与 **其他语言** 间的一个相互协作，这里通过一个 `Node` 架构来进行说明。

Node 架构
-------

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQQD0eGxrpBKGRRibhslhF8uGlzlia15nzzpYibbYY5D9GiaNhqJbSote4Hju6FnUheWAdMG8Mniax69dTw/640?wx_fmt=other)

**核心内容如下：**

*   **顶层 Node Api**
    

*   提供 http 模块、流模块、fs 文件模块等等，**`可以通过 JavaScript 直接调用`**
    

*   **中间层 Node Bindings**
    

*   主要是使 JavaScript 和 C/C++ 进行通信，原因是 JavaScript 无法直接调用 C/C++ 的库（libuv），需要一个中间的桥梁，node 中提供了很多 binding，这些称为 **`Node bindings`**
    

*   **底层 V8 + libuv**
    

*   v8 负责解释、执行顶层的 JavaScript 代码
    
*   libuv 负责提供 I/O 相关的操作，其主要语言是 **`C/C++`** 语言，其目的就是实现一个 **跨平台（如 Windows、Linux 等）的异步 I/O 库**，它直接与操作系统进行交互
    

这里不难发现 **`Node Bindings`** 就有点类似 **`JSBridge`** 的功能，所以 **JSBridge** 本身是一个很简单的东西，其更多的是 **一种形式、一种思想**。

为什么叫 JSBridge？
==============

Stack Overflow 联合创始人 **`Jeff Atwood`** 在 2007 年的博客《The Principle of Least Power[2]》中认为 **“任何可以使用 JavaScript 来编写的应用，并最终也会由 JavaScript 编写”**，后来 JavaScript 的发展确实非常惊人，现在我们可以基于 JavaScript 来做各种事情，比如 网页、APP、小程序、后端等，并且各种相关的生态越来越丰富。

作为 Web 技术逻辑核心的 `JavaScript` 自然而然就需要承担与 **其他技术** 进行『**桥接**』的职责，而且任何一个 **移动操作系统** 中都会包含 运行 **JavaScript** 的容器环境，例如 **`WebView`、`JSCore`** 等，这就意味着 运行 JavaScript 不用像运行其他语言时需要额外添加相应的运行环境。

> **`JSBridge`** 应用在国内真正流行起来则是因为 **微信** 的出现，当时微信的一个主要功能就是可以在网页中通过 `JSBridge` 来实现 **内容分享**。

JSBridge 能做什么？
==============

举个最常见的前端和后端的例子，后端只提供了一个查找接口，但是没有提供更新接口，那么对于前端来讲就是再想实现更新接口，也是没有任何法子的！

同样的，JSBridge 能做什么得看原生端给 JavaScript 提供调用 Native 什么功能的接口，比如通过 **`微信 JS-SDK`** 网页开发者可借助微信使用 **拍照、选图、语音、位置** 等手机系统的能力，同时可以直接使用 **微信分享、扫一扫、卡券、支付** 等微信特有的能力。

**`JSBridge`** 作为 **`JavaScript`** 与 **`Native`** 之间的一个 **桥梁**，表面上看是允许 JavaScript 调用 Native 的功能，但其核心是建立 **Native** 和 **非 Native** 间消息 **双向通信** 通道。

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQQD0eGxrpBKGRRibhslhF8uGn7Sgk56GomnicrgSYEslzkwTzicqeicSEfWyfwYcib70QJJ3Yqsexofq6g/640?wx_fmt=other)

**双向通信的通道**：

*   JavaScript 向 Native 发送消息:
    

*   调用 Native 功能
    
*   通知 Native 当前 JavaScript 的相关状态等
    

*   Native 向 JavaScript 发送消息:
    

*   回溯调用结果
    
*   消息推送
    
*   通知 JavaScript 当前 Native 的状态等
    

JSBridge 是如何实现的？
================

JavaScript 的运行需要 JS 引擎的支持，包括 `Chrome V8`、`Firefox SpiderMonkey`、`Safari JavaScriptCore` 等，总之 **JavaScript 运行环境** 是和 **原生运行环境** 是天然隔离的，因此，在 **JSBridge** 的设计中我们可以把它 **类比** 成 **JSONP** 的流程：

*   客户端通过 `JavaScript` 定义一个回调函数，如: `function callback(res) {...}`，并把这个回调函数的名称以参数的形式发送给服务端
    
*   服务端获取到 `callback` 并携带对应的返回数据，以 `JS` 脚本形式返回给客户端
    
*   客户端接收并执行对应的 `JS` 脚本即可
    

**JSBridge** 实现 JavaScript 调用的方式有两种，如下：

*   `JavaScript` 调用 `Native`
    
*   `Native` 调用 `JavaScript`
    

在开始分析具体内容之前，还是有必要了解一下前置知识 **WebView**。

WebView 是什么？
------------

**WebView** 是 原生系统 用于 `移动端 APP` 嵌入 `Web` 的技术，方式是内置了一款高性能 **webkit** 内核浏览器，一般会在 SDK 中封装为一个 `WebView` 组件。

`WebView` 具有一般 `View` 的属性和设置外，还对 `url` 进行请求、页面加载、渲染、页面交互进行增强处理，提供更强大的功能。

**WebView 的优势** 在于当需要 **更新页面布局** 或 **业务逻辑发生变更** 时，能够更便捷的提供 APP 更新：

*   对于 **`WebView`** 而言只需要修改前端部分的 **`Html、Css、JavaScript`** 等，通知用户端进行刷新即可
    
*   对于 **`Native`** 而言需要修改前端内容后，再进行打包升级，重新发布，通知用户下载更新，安装后才可以使用最新的内容
    

### 微信小程序中的 WebView

小程序的主要开发语言是 **`JavaScript`** ，其中 **逻辑层** 和 **渲染层** 是分开的，分别运行在不同的线程中，而其中的渲染层就是运行在 **`WebView`** 上：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">运行环境</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">逻辑层</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">渲染层</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">iOS</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">JavaScriptCore</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">WKWebView</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">安卓</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">V8</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">chromium 定制内核</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">小程序开发者工具</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">NWJS</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Chrome WebView</td></tr></tbody></table>

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQQD0eGxrpBKGRRibhslhF8uGzQCddzLaRhe8kIULeoP5HHnrnjqBtOwDy71VphA2qsVHvZgWDcDj4w/640?wx_fmt=other)6F98DD16.jpg

**在开发过程中遇到的一个 `坑点` 就是**：

*   在真机中，需要实现同一域名下不同子路径的应用实现数据交互（纯前端操作，不涉及接口），由于同域名且是基于同一个页面进行跳转的（当然只是看起来是），而且这个数据是 **临时数据**，因此觉得使用 **`sessionStorage`** 实现数据交互是很合适的
    
*   实际上从 **A 应用** 跳转到 **B 应用** 中却无法获取对应的数据，而这是因为 **sessionStorage** 是基于当前窗口的会话级的数据存储，**移动端浏览器** 或 **微信内置浏览器** 中在跳转新页面时，可能打开的是一个新的 **WebView**，这就相当于我们在浏览器中的一个新窗口中进行存储，因此是没办法读取在之前的窗口中存储的数据
    

JavaScript 调用 Native — 实现方案一
----------------------------

通过 JavaScript 调用 Native 的方式，又会分为：

*   **注入 API**
    
*   **劫持 URL Scheme**
    
*   **弹窗拦截**
    

### 【 注入 API 】

**核心原理**：

*   通过 `WebView` 提供的接口，向 `JavaScript` 的上下文（`window`）中注入 对象 或者 方法
    
*   允许 `JavaScript` 进行调用时，直接执行相应的 `Native` 代码逻辑，实现 `JavaScript` 调用 `Native`
    

这里不通过 `iOS` 的 `UIWebView` 和 `WKWebView` 注入方式来介绍了，感兴趣可以自行查找资料，咱们这里直接通过 ** 微信 JS-SDK**[3] 来看看。

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQQD0eGxrpBKGRRibhslhF8uGXrDQ3ggRRyTMicLEAREicch4OrTicAgSGCiav0kuQxg37MbcibqPYs3bVqA/640?wx_fmt=other)6A9DCAFF.gif

当通过 **`<script src="https://res2.wx.qq.com/open/js/jweixin-1.4.0.js"></script>`** 的方式引入 **`JS-SDK`** 之后，就可以在页面中使用和 **微信相关的 API**，例如：

```
// 微信授权window.wx.config(wechatConfig)// 授权回调window.wx.ready(function () {...})// 异常处理window.wx.error(function (err) {...})// 拉起微信卡包window.wx.invoke('chooseInvoice', invokeConf, function (res) {...})复制代码
```

如果通过其内部编译打包后的代码（**简化版**）来看的话，其实不难发现：

*   **其中的 `this`（即参数 `e`）此时就是指向全局的 `window` 对象**
    
*   **在代码中使用的 `window.wx` 实际上是 `e.jWeixin` 也是其中定义的 `N` 对象**
    
*   **而在 `N` 对象中定义的各种方法实际上又是通过 `e.WeixinJSBridge` 上的方法来实际执行的**
    
*   **`e.WeixinJSBridge` 就是由 微信内置浏览器 向 `window` 对象中注入 `WeiXinJsBridge` 接口实现的**
    

```
!(function (e, n) {  'function' == typeof define && (define.amd || define.cmd)    ? define(function () {        return n(e)      })    : n(e, !0)})(this, function (e, n) {   ...   function i(n, i, t) {    e.WeixinJSBridge      ? WeixinJSBridge.invoke(n, o(i), function (e) {          c(n, e, t)        })      : u(n, t)   }      if (!e.jWeixin) {        var N = {        config(){          i(...)        },        ready(){},        error(){},        ...    }        return (      S.addEventListener(        'error',callback1,        !0      ),      S.addEventListener(        'load',callback2,        !0      ),      n && (e.wx = e.jWeixin = N),      N    )  }})复制代码
```

### 【 劫持 URL Scheme 】

#### URL Scheme 是什么？

`URL Scheme` 是一种特殊的 `URL`，一般用于在 `Web` 端唤醒 `App`（或是跳转到 `App` 的某个页面），它能方便的实现 `App` 间互相调用（例如 QQ 和 微信 相互分享讯息）。

`URL Scheme` 的形式和 `普通 URL`（如：**`https://www.baidu.com`**）相似，主要区别是 `protocol` 和 `host` 一般是对应 `APP` 自定义的。

通常当 `App` 被安装后会在系统上注册一个 **`自定义的 URL Scheme`**，比如 `weixin://` 这种，所以我们在手机浏览器里面访问这个 `scheme` 地址，系统就会唤起对应的 `App`。

例如，当在浏览器中访问 `weixin://` 时，浏览器就会询问你是否需要打开对应的 `APP`:

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQQD0eGxrpBKGRRibhslhF8uGowlmkUIG1wVObK7SNPOetJJrBlKF03EGj1acicuQmIvZjUwgibXaQSLQ/640?wx_fmt=other)

#### 劫持原理

`Web` 端通过某种方式（如 `iframe.src`）发送 `URL Scheme` 请求，之后 `Native` 拦截到请求并根据 `URL Scheme` 和 **`携带的参数`** 进行对应操作。

例如，对于谷歌浏览器可以通过 `chrome://version/、chrome://chrome-urls/、chrome://settings/` 定位到不同的页面内容，**假设** 跳转到谷歌的设置页并期望当前搜索引擎改为百度，可以这样设计 `chrome://settings/engine?changeTo=baidu&callbak=callback_id`:

*   谷歌客户端可以拦截这个请求，去解析对应参数 `changeTo` 来修改默认引擎
    
*   然后通过 `WebView` 上面的 `callbacks` 对象来根据 `callback_id` 进行回调
    

以上只是一个假设哈，并不是说真的可以这样去针对谷歌浏览器进行修改，当然它要是真的支持也不是不可以。

> 是不是感觉确实和 **`JSONP`** 的流程很相似呀 ~ ~

### 【 弹窗拦截 】

弹窗拦截核心：**利用弹窗会触发 `WebView` 相应事件来实现的**。

一般是在通过拦截 `Prompt、Confirm、Alert` 等方法，然后解析它们传递过来的消息，但这种方法存在的缺陷就是 `iOS` 中的 `UIWebView` 不支持，而且 `iOS` 中的 `WKWebView` 又有更好的 `scriptMessageHandler`，因此很难统一。

Native 调用 JavaScript — 实现方案二
----------------------------

`Native` 调用 `JavaScript` 的方式本质就是 **执行拼接 `JavaScript` 字符串**，这就好比我们通过 `eval()` 函数来执行 `JavaScript` 字符串形式的代码一样，不同的系统也有相应的方法执行 `JavaScript` 脚本。

### Android

在 `Android` 中需要根据版本来区分：

*   安卓 4.4 之前的版本使用 `loadUrl()`
    
    ```
    webView.loadUrl("javascript:foo()")复制代码
    ```
    

*   `loadUrl()` 不能获取 `JavaScript` 执行后的结果，这种方式更像在 `<a href="javascript:void(0)">` 的 `href` 属性中编写的 `JavaScript` 代码
    

*   安卓 4.4 以上版本使用 `evaluateJavascript()`
    
    ```
    webView.evaluateJavascript("javascript:foo()", null);复制代码
    ```
    

### IOS

在 `IOS` 中需要根据不同的 `WebView` 进行区分：

*   `UIWebView` 中通常使用 `stringByEvaluatingJavaScriptFromString`
    
    ```
    results = [self.webView stringByEvaluatingJavaScriptFromString:"foo()"];复制代码
    ```
    
*   `WKWebView` 中通常使用 `evaluateJavaScript`
    
    ```
    [self.webView evaluateJavaScript:@"document.body.offsetHeight;" completionHandler:^(id _Nullable response, NSError * _Nullable error) {  // 获取返回值}];复制代码
    ```
    

最后
==

以上通过 `微信 JS-SDK` 到 `JSBridge` 的一个简单介绍，大家现在应该不至于认为 `JSBridge` 是一个高大上、深不可测的东西了，毕竟其核心思想是清晰明了的，而且本质上还是需要强依赖于原生端的具体实现。

**希望本文对你有所帮助！！！**

作者：熊的猫
======

https://juejin.cn/post/7199297355748458551

*   ### 
    
    前端 社群  
    
      
    
      
    
    下方加 Nealyang 好友回复「 加群」即可。
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N4k0zoSSTiaUeicvTRStJYYmGWa6YpNqicxibYmM4oSD8oWs9X8b9DfK3CpUmGMWzIriaiaOf1L59t9nGA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
    如果你觉得这篇内容对你有帮助，我想请你帮我 2 个小忙：  
    
    1. 点个「在看」，让更多人也能看到这篇文章