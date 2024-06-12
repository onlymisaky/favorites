> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/15bg0E2rqr8BEZId_YlJbQ)

前言
--

Chrome 扩展（通常也叫插件）也是软件程序，使用 Web（HTML, CSS, and JavaScript）技术栈开发。允许用户自定义 Chrome 浏览体验。开发者可以通过增加特效或功能来优化体验。例如：效率工具、信息聚合等等。你可以在 Chrome 应用商店 查看各种各样的扩展。比如一些翻译扩展、JSON 格式化扩展等等都极大提高了我们开发或工作效率。本文旨在帮助大家了解 Chrome 扩展开发的基本概念、开发流程。并最终开发一个背景颜色提取的扩展来加深 Chrome 扩展的印象。本文基于 Manifest V3，大部分内容翻译自 https://developer.chrome.com/docs/extensions/mv3/。最终我们要实现的扩展功能如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXB7RtSEMPaskZ5WzKFZXbcVfbnO93cRnp9Sw4w0ibMPt8thyW2vwU8ibDg/640?wx_fmt=gif)

基本概念
----

### Manifest

扩展的 manifest 是唯一必须的文件，且文件名必须是 `manifest.json`。manifest 必须放在扩展程序的根目录，它记录了重要的 metadata、资源定义、权限声明并标识了哪些文件运行在后台和页面上。

### Service Worker

扩展的 Service Worker 用户处理和监听 **浏览器** 事件。比如跳转到一个新页面、书签移除、tab 关闭等。它可以使用所有的 Chrome API，但是不能直接和网页交互（和网页交互需要 Content Scripts）。

### Content Scripts

Content Script 可以在网页上下文中执行 JavaScript。也可以读取和修改它们注入页面的 DOM。Content Script 只能使用部分 Chrome API。其余的可以通过 Service Worker 间接访问。

### Popup 和 Pages

扩展可以包含多种 HTML 文件，比如弹窗、页面选项等，这些页面都可以访问 Chrome API。

开发一个简单扩展
--------

下面我们来开发一个 **Hello Extensions **的简单扩展**。**

### 创建 manifest.json 文件

创建一个新的目录，在目录下创建一个名为 `manifest.json` 的文件。

```
mkdir hello_extensioncd hello_extensiontouch manifest.json
```

在 `manifest.json` 中加入以下代码：

```
{  "manifest_version": 3,  "name": "Hello Extensions",  "description": "Base Level Extension",  "version": "1.0",  "action": {    "default_popup": "hello.html",    "default_icon": "hello_extensions.png"  }}
```

上面的 JSON 文件描述了扩展的功能和配置，比如 action 中描述了在 Chrome 中需要显示的扩展的图标以及点击图标后弹出的页面。可以在这里 下载 图标到你的目录下，然后把名字改为 `manifest.json` 中配置的 `default_icon`。

### 创建 html 文件

上面的 action 中还配置了一个 `default_popup`，接下来我们创建一个名为 `hello.html` 的文件并加入如下代码。

```
<html>  <body>    <h1>Hello Extensions</h1>  </body></html>
```

### 加载扩展

在开发模式下加载未打包的扩展。

*   在 Chrome 浏览器地址栏中输入 `chrome://extensions`。也可以通过下图的两种方式打开。
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBfk1MQT5G1e9j7kkD51fqcGV81p32yaRWoEpFLCnFvFQiceFdjdBeSgA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBiaYFOTXqMHFBN8ORXQWibCGs6qBD7AkNTMfwtwX4zYdv0WGKbHUWyo8g/640?wx_fmt=png)

*   打开开发者模式
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBxkSyKQF1fFkDRH9ibS8SDbUWWKseThGGGc1XzBSGYID7EfdL3WuzuWw/640?wx_fmt=png) image.png

*   点击加载已解压的扩展程序
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBmoazG6DpY1TElybDeMjXzt2dFic6PrVzv5xB4XwtNYEicZVt9pQg2IoQ/640?wx_fmt=png)选择我们的文件夹![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBWq3IfiaDJoKstmq4B7fWM9O2TLjtelPUM6BaWHULUG7qJOmGMMIqI7w/640?wx_fmt=png)完成之后即可在扩展页面显示出来![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBW92nXdLRmawSj1g3LiczG9PDAWTbVsJHXuCZLXyqFG4FmxSzk8fprOw/640?wx_fmt=png)

### 固定扩展

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBKojfN2nLr3Aoibxib4pOQKZJI3lG7eCfWuyNdibatsBzWsKyq0KJUTrlw/640?wx_fmt=png)点击固定，我们的扩展就可以在工具栏显示了。然后我们点击 icon，就可以弹出对应的页面了。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXB6XzqicsaR0arZRCvGLr1RhDoBaqRPDVmhXoxxQhofckhQK2RzXmEHvg/640?wx_fmt=png)

### 重新加载扩展

我们回到代码，修改扩展的名字为 “Hello Extensions of the world!”

```
{  "manifest_version": 3,  "name": "Hello Extensions of the world!",  ...}
```

保存之后，回到扩展页面，点击刷新，可以看到，名字已经改变。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBmY5lgR13QtKmiaoIibnvNnsyj8aIE6MJ5rlkKwP3anjbEkF7Q5VUkRWg/640?wx_fmt=png)那么每次改动都需要重新加载扩展吗？可以参考下表。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>扩展组件</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>是否需要重新加载</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">The manifest</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Yes</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Service worker</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Yes</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Content Scripts</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Yes (plus the host page)</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">The popup</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">No</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Options page</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">No</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Other extension HTML pages</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">No</td></tr></tbody></table>

### 查看控制台日志以及错误

#### Console logs

在开发过程中，你可以通过浏览器控制台日志调试代码。在之前的代码中加入 `<script src="popup.js"></script>`

```
<html>  <body>    <h1>Hello Extensions</h1>    <script src="popup.js"></script>  </body></html>
```

创建一个名为 `popup.js` 的文件并加入如下代码：

```
console.log("This is a popup!")
```

接下来：

1.  刷新扩展
    
2.  打开 popup
    
3.  右键 popup
    
4.  选择 Inspect（检查）
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBgE6IfuwEp6hf2gQ3gD5dDibAuP4BxdsiaA50GibRnxLBVf9SlicGYA7sbA/640?wx_fmt=png)image.png

5.  在开发者工具中切换到 Console tab。
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBXlSALs8F30HNFPfokfNkfPI6FprNfQaeVzqiaBx0XlwxvQtsVAhgI4g/640?wx_fmt=png)image.png

#### Error logs

下面我们修改 `popup.js`，去掉一个引号

```
console.log("This is a popup!) // ❌ 错误代码
```

刷新之后，然后再点击打开扩展，可以看到错误按钮出现。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBU7auLDBAJp5gOZI9K6VypCUE5gDYhqjm2CdRUoSwEUnia8ic6quoBUtA/640?wx_fmt=png)点击错误按钮，可以查看具体错误信息。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBoSuL3fthtYSAdsMz8tDmkVrRxF6Hf1U4O3EB5WEQjp3KiaLvib54objQ/640?wx_fmt=png)

### 扩展工程结构

扩展工程结构可以有多种方式，但是 `manifest.json` 文件必须位于根目录，下面是一种结构实例。![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBGbngdeL2YKnxeSicQ6JGibMXZ0bOnEyNmu7VM0TxnNILEbVa8KOkYuHQ/640?wx_fmt=png)

Content Script
--------------

Content Script 运行在网页的上下文环境中，通过标准的 DOM，Content Script 可以读取浏览器访问页面的细节，也可以对其进行修改，还可以把这些信息传递给父扩展。

### 理解 Content Script 的能力

Content Script 可以直接使用一部分 chrome API，比如：

*   i18n
    
*   storage
    
*   runtime:
    

*   connect
    
*   getManifest
    
*   getURL
    
*   id
    
*   onConnect
    
*   onMessage
    
*   sendMessage
    

使用其他的可以通过发送消息的方式实现。Content Script 可以在将扩展里的文件声明为 Web Accessible Resources 后访问这些文件。 Content Script 运行在一个独立的环境里，它可以对其所在的 JavaScript 环境进行修改，而不与页面或其他扩展的 Content Script 发生冲突。

```
<html>  <button id="mybutton">click me</button>  <script>    var greeting = "hello, ";    var button = document.getElementById("mybutton");    button.person_name = "Bob";    button.addEventListener(      "click",      () => alert(greeting + button.person_name + "."),      false    );  </script></html>
```

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBcgwnC82fX93FnbYxINAOKCC2bicYgWfVXtGSCjxXhVv81zgGJvfO5BQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBMnia8npD4JY0fS64CC6ntNgnro7PC581TibOCAclywAmQXDxGX0Hr00g/640?wx_fmt=png)

### Content Script 注入

Content Script 注入有三种方式，分别是静态声明、动态声明、编程注入。 静态声明比较简单，只需要在 manifest.json 文件的 `content_scripts`进行配置即可。注意需要指定 `matches` 字段以指明需要再哪些页面运行 Content Script 脚本。

```
"content_scripts": [   {     "matches": ["https://*.google.com/*"],     "css": ["styles.css"],     "js": ["content-script.js"]   } ],
```

动态声明主要使用场景是 `matches` 不明确时使用。编程注入是需要响应事件或一些特定场合使用，我们最终的例子使用的是静态声明。

Service Worker
--------------

Chrome 扩展是基于事件的程序，用于修改或增强 Chrome 浏览器的浏览体验。事件是由浏览器触发的，比如导航到一个新页面，删除一个书签或关闭一个标签（tab）。扩展通过 Service Worker 中的脚本监听这些事件。然后执行特定的指令。 Service Worker 需要时被加载，休眠时被卸载。比如：

*   扩展第一次安装或更新到一个新的版本
    
*   一个扩展事件被触发
    
*   Content Script 或其他扩展发送了消息
    

Service Worker 被加载后，只要有事件 Service Worker 就会保持在运行状态。一旦空闲了 30 秒，浏览器就会停止它。 Service Worker 保持休眠状态，直到有它监听的事件发生，这时它会执行相应的事件监听器，然后空闲、卸载。

Service Worker 的日志在这里查看![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBzwJNmfyfQW55a0JFibicdnGziand7GVFB5l3Rdyd8icv06clgeTpqkNHJg/640?wx_fmt=png)

### 注册 Service Worker

```
"background": {    "service_worker": "background.js"  },
```

### 初始化扩展

```
chrome.runtime.onInstalled.addListener(function (details) {  console.log("onInstalled event has been triggered with details: ", details);  // 检查安装、更新或卸载的原因  if (details.reason == "install") {    // 在安装扩展时执行的代码  } else if (details.reason == "update") {    // 在更新扩展时执行的代码  } else if (details.reason == "uninstall") {    // 在卸载扩展时执行的代码  }});
```

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBryJdlqMuSSuqmAXxsGromdHmS0ZOHFbHb7X8oKYENCoibKCmoibck9BA/640?wx_fmt=png)image.png

### 设置监听

```
/** * 注意需要声明权限 */chrome.bookmarks.onCreated.addListener(function (id, bookmark) {  console.log(    "Bookmark created with title: " +      bookmark.title +      " and url: " +      bookmark.url  );});
```

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBWNlShMBro9RfKwGVxElI7r0haAOfBUedgNMDOkevnMpobhtx8950iaQ/640?wx_fmt=png)image.png

### 过滤事件

```
/** * 注意需要声明 webNavigation 权限 */chrome.webNavigation.onCompleted.addListener(() => {  console.info("The user has loaded my favorite website!");});
```

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEABwCm7cSGpehAg8ib5dWOXBW1UZrxxncMnv8ZndRjdbHxQfLaRVrckibt9Q00aqlrNiaZeicuT6SmNSg/640?wx_fmt=png)未过滤时所有的事件都会打印。不同的事件对应不同的功能，需要选择合适的事件来进行监听。

Service Worker 与 Content Script 通信
----------------------------------

点击扩展 tab 的事件我们可以通过 `chrome.tabs.sendMessage`，并在 Content Script 中注册 `chrome.runtime.onMessage.addListener` 接收。

颜色提取扩展开发
--------

基于上面的知识点，我们要实现如下功能： 1、导航栏点击扩展按钮弹出一个显示详情的面板 2、在当前页面鼠标点击页面的元素，在弹出的面板上显示对应的背景色 3、点击复制按钮可以复制当前元素背景色

这里我们只列出核心代码如下：

### manifet 配置

```
{  "manifest_version": 3,  "name": "EasyColor",  "description": "Chrome extension for obtaining color in an easy way",  "version": "0.0.1",  "action": {    "default_icon": "images/icon-48.png"  },  "icons": {    "16": "images/icon-16.png",    "32": "images/icon-32.png",    "48": "images/icon-48.png",    "128": "images/icon-128.png"  },  "background": {    "service_worker": "background.js"  },  "content_scripts": [    {      "matches": ["http://*/*", "https://*/*"],      "css": ["css/styles.css"],      "js": ["scripts/content.js"],      "run_at": "document_start"    }  ],  "web_accessible_resources": [    {      "resources": ["/pages/panel.html"],      "matches": ["http://*/*", "https://*/*"]    }  ]}
```

### 导航栏点击扩展按钮弹出一个显示面板

首先在 `service_worker` 中，我们定义一个 background.js，用于监听扩展点击事件，并发送给 content_scripts。

```
chrome.action.onClicked.addListener(function (tab) {  //open pages  chrome.tabs.sendMessage(tab.id, {    action: "EVENT_PANEL_OPEN",  });});
```

在 content_scripts 中监听 `EVENT_PANEL_OPEN` 事件并在当前页面增加一个 iframe 用来显示面板。

```
chrome.runtime.onMessage.addListener((req, sender, sendResp) => {  const data = req;  if (data.action === "EVENT_PANEL_OPEN") {    let easyPanel = document.getElementById(easyPanelId);    if (easyPanel == null) {      easyPanel = document.createElement("iframe");      easyPanel.id = easyPanelId;      easyPanel.src = chrome.runtime.getURL("../pages/panel.html");      easyPanel.style.width = "100%";      easyPanel.style.height = "100%";      easyPanel.style.borderRadius = "20px";      easyPanel.style.border = "none";      const container = document.createElement("div");      container.id = easyContainerId;      container.style.width = "200px";      container.style.height = "250px";      container.style.position = "fixed";      container.style.top = "10px";      container.style.right = "10px";      container.style.zIndex = "10000";      container.style.boxShadow = "3px 2px 22px 1px rgba(0, 0, 0, 0.24)";      container.style.borderRadius = "20px";      container.appendChild(easyPanel);      document.body.appendChild(container);    }    document.addEventListener("mousemove", handleMouseMove);    document.addEventListener(      "click",      function (e) {        e.stopPropagation();        e.preventDefault();        return false;      },      true    );  }});
```

### 点击显示对应颜色

在 content_scripts 中加入点击事件，获取当前元素背景颜色，然后传递给 iframe 进行显示。

```
document.addEventListener("mousedown", function (e) {  let easyPanel = document.getElementById(easyPanelId);  if (easyPanel == null) {    return;  }  const cpStyle = window.getComputedStyle(e.target);  easyPanel.contentWindow.postMessage(    {      type: "computedStyle",      data: JSON.stringify({        color: cpStyle.color,        backgroundColor: cpStyle.backgroundColor,      }),    },    "*"  );});
```

以上就是我们实现的元素颜色选择插件的核心代码，更多细节可以参考：https://github.com/yangpeng7/ChromeExtensionBestPractice

参考资源
----

https://developer.chrome.com/docs/extensions/mv3/

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)