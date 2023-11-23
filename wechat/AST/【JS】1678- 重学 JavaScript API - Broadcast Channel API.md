> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ub_O8WfzO_BdHaaFhmE34g)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCWnaGCicobYJVQ6ZbQibydGG4bHxhQFZdbueec6VWY0zTJKpeIokYFYHmLxV1qf964bd30Dof9gmvbw/640?wx_fmt=jpeg)

当我们网页需要在不同的浏览器窗口之间共享数据时，可能需要使用 WebSocket 或 WebRTC 等技术。但是，这些技术会过于复杂。而浏览器自带的 Broadcast Channel API[1] 可以让我们轻松地在不同浏览器窗口之间共享数据，而无需使用复杂的技术。

本文将介绍 Broadcast Channel API 的基本和高级使用方法，并提供示例代码来帮助读者更好地理解和使用该 API。

🏝 什么是 Broadcast Channel API？
-----------------------------

Broadcast Channel API 是一个浏览器 Web API，它允许我们创建一个**「能够将数据广播给多个文档或浏览器窗口的通道」**。通过该通道实现不同浏览器窗口之间的数据共享。我们可以向该频道发送消息，其他窗口则可以监听该频道以接收消息。

🎨 如何使用 Broadcast Channel API？
------------------------------

### 基础使用方法

使用 Broadcast Channel API 的基本方法非常简单。我们只需要创建一个 `BroadcastChannel` 实例，并使用 `postMessage()` 方法向该频道发送消息。以下是一个简单的例子：

```
// 创建一个名为 "my_channel" 的广播频道const myChannel = new BroadcastChannel("my_channel");// 向该频道发送消息myChannel.postMessage("Hello world!");
```

然后在其他窗口中监听该频道，以接收来自该频道的消息。以下是一个简单的例子：

```
// 监听名为 "my_channel" 的广播频道const myChannel = new BroadcastChannel("my_channel");// 监听该频道并处理消息myChannel.onmessage = function (event) {  console.log(event.data);};
```

BroadcastChannel 实例还提供了一些其他的方法和事件，例如 `close()` 方法和 `close` 事件。详细介绍可以在 MDN Web Docs[2] 上查看完整文档。

### 高级使用方法

Broadcast Channel API 还提供了一些高级使用方法，例如使用 `ArrayBuffer` 和 `Transferable Objects` 传递大型数据，使用 `MessageEvent.source` 属性来识别消息的来源，以及使用 `MessageEvent.ports` 属性通过 `postMessage()` 方法传递通信通道。 以下是一个使用 `ArrayBuffer` 和 `Transferable Objects` 传递数据的例子：

```
// 创建一个名为 "my_channel" 的广播频道const myChannel = new BroadcastChannel("my_channel");// 创建一个 ArrayBuffer，其中包含您要发送的数据const buffer = new ArrayBuffer(1024);// 向该频道发送包含 ArrayBuffer 的消息myChannel.postMessage(buffer, [buffer]);
```

然后在其他窗口中接收该消息，并从 `MessageEvent.data` 属性中获取 `ArrayBuffer`：

```
// 监听名为 "my_channel" 的广播频道const myChannel = new BroadcastChannel("my_channel");// 监听该频道并处理消息myChannel.onmessage = function (event) {  const buffer = event.data;  // ...};
```

Broadcast Channel API 还提供了其他高级用法，详细请查看文档。

🧭 兼容性情况
--------

Broadcast Channel API 兼容性良好，可以在大多数现代浏览器中使用。具体如下：

*   Chrome 54+ ✅
    
*   Firefox 38+ ✅
    
*   Safari 10+ ✅
    
*   Opera 41+ ✅
    
*   Edge 16+ ✅
    
*   iOS Safari 10.0-10.2+ ✅
    
*   Android Browser 67+ ✅
    
*   Chrome for Android 59+ ✅
    

⚠️ 需要注意的是，Broadcast Channel API 目前还不支持 Internet Explorer 浏览器。如果你的网站需要支持 IE 浏览器，可能需要使用其他技术或库来实现数据共享。

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCWnaGCicobYJVQ6ZbQibydGG4omJc8pcgoBrHJ6xbSDBDdRibgdWicYXWrORs016trq2wIxQB3xzNFLicQ/640?wx_fmt=png)

详细兼容性情况可以在 Can I Use[3] 网站上查看。

📋 Broadcast Channel API 优缺点
----------------------------

其优点有以下几个 🍇：

1.  **「传递数据」**：提供了一种可靠的方法，使独立的 JavaScript 应用程序在同一浏览器同一站点内传递数据。
    
2.  **「传输速度快」**：以高速连接，提供更快的数据传输速度。
    
3.  **「实时性」**：提供了实时，低延迟的数据传输。
    
4.  **「可靠性」**：能够在小的数据包丢失或意外丢失时进行恢复。
    

不过，Broadcast Channel API 也存在以下缺点：

1.  **「仅限同源」**：Broadcast Channel API 只能在同一浏览器同一站点内进行通信。这意味着，虽然不同的站点可以在同一浏览器内打开，但无法使用 Broadcast Channel API 进行通信。
    
2.  **「受浏览器支持限制」**：与大多数 Web API 一样，Broadcast Channel API 受到不同浏览器和平台的支持和兼容性限制。
    
3.  **「需要共性的 API 使用」**：不同的 JavaScript 应用程序需要知道如何使用 Broadcast Channel API 来共享数据。如果开发人员没有必要的知识，那么 API 就可能不如预期地使用。
    

👍 实际开发案例
---------

接下来举一个实际开发案例。**「案例需求」**：使用了 Broadcast Channel API 将相同来源的不同浏览器选项卡之间的消息广播到其他选项卡。所有选项卡都将显示同样的结果，并且如果有任何一种选项卡更改了结果，则其他选项卡也会显示更改后的结果。 实现代码如下：

```
<!DOCTYPE html><html>  <head>    <title>Broadcast Channel Example</title>  </head>  <body>    <h2>Broadcast Channel Example</h2>    <div id="result">Result: <span></span></div>    <script>      // Create a new Broadcast Channel with name      const channel = new BroadcastChannel("resultChannel");      const resultEl = document.querySelector("#result span");      // Option 1 Base      // Listen for messages from the channel      channel.onmessage = (e) => {        resultEl.innerText = e.data;      };      // Option 2 - Using addEventListener      // channel.addEventListener('message', e => {      //    resultEl.innerText = e.data;      // });      // Listen for changes on the input      const inputEl = document.createElement("input");      inputEl.type = "text";      inputEl.addEventListener("input", (e) => {        const val = e.target.value;        // Broadcast the change to other tabs        channel.postMessage(val);        resultEl.innerText = val;      });      // Insert the input element      document.body.appendChild(inputEl);    </script>  </body></html>
```

在上面示例代码中，我们创建了一个名为 `resultChannel` 的 Broadcast Channel ，并使用 `channel.postMessage()` 函数向所有浏览器选项卡广播输入框更改的值。 当有一种选项卡更改结果时，所有选项卡都会显示更改后的结果。 此外，我们还演示了两种不同的监听消息的方法（`onmessage`和`addEventListener`）以及如何将消息发送到 Broadcast Channel 中。

🍭 仓库推荐
-------

推荐几个基于 Broadcast Channel API 封装的 Github 开源项目：

1.  **「broadcast-channel[4]」** - 该项目是一个简单易用的 Broadcast Channel API 封装，拥有 1500+ ⭐️。
    
2.  **「react-broadcast-channel[5]」** - 该项目是一个 React 应用程序的 Broadcast Channel API 封装，拥有 1300+ ⭐️。
    

🎯 总结和建议
--------

Broadcast Channel API 是一种 Web API，能够**「方便地在不同浏览器窗口之间共享数据」**。希望本文能够帮助读者更好地使用该 API。

### Reference

[1]

Broadcast Channel API: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel

[2]

MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel

[3]

Can I Use: https://caniuse.com/broadcastchannel

[4]

broadcast-channel: https://github.com/pubkey/broadcast-channel

[5]

react-broadcast-channel: https://github.com/ReactTraining/react-broadcast

  

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

回复 “**加群**”，一起学习进步