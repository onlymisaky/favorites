> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/OjpzmJDII1jy3ZSuc6eOGA)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

今天继续来聊  `Cookie` ，`Chrome` 已经在 `1.4` 号开启了三方 `Cookie` 的 `1%` 禁用灰度：

[Chrome 三方 Cookie 禁用已正式开始！](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499749&idx=1&sn=8044aa1baa71e6177c417715a942e578&chksm=c2e10acef59683d821ffd92eaacf6356d792d6e9fef1ebc2d205b1f1af1852f600da152fb738&token=1123116890&lang=zh_CN&scene=21#wechat_redirect)

不少小伙伴反馈已经命中了这个灰度，因为时间比较急，很多网站来不及改造，很多网站的正常功能在这个灰度策略下受到了影响。

在前面的文章中我们提到，对于一些还没来得及改造完的网站，`Chrome` 提供了一种便捷的方式来让命中灰度的用户手动关闭这个策略：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdQr45W04IOW5xRBd1uBLDeiccO7bvURiaAePtQibW4HxedpEezaibfxOa39icI1gPfDMAApNDQeYDa6TmA/640?wx_fmt=png&from=appmsg)

这个开关点击后可以允许指定域名继续使用三方 `Cookie` ，但是这个期限只有 90 天。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdQr45W04IOW5xRBd1uBLDeicWyx81WSUoEiaTicFsrXLonMpOoV2hwXhzmtudu3JQ4jocDc0y4wgDYHw/640?wx_fmt=png&from=appmsg)

所以，如果大家的网站最近没有时间进行这些改造，大家可以在运行时来提示用户手动关闭三方 `Cookie` 的禁用策略。

那么问题来了，并不是所有用户都命中了这个策略，当前只有 `1%` ，我们可能给所有的用户都添加这个提示，所以我们如何在运行时检测用户是否命中了三方 `Cookie` 的灰度策略呢？

```
function checkCookie(){    var cookieEnabled = navigator.cookieEnabled;    if (!cookieEnabled){         document.cookie = "testcookie";         cookieEnabled = document.cookie.indexOf("testcookie")!=-1;    }    return cookieEnabled || showCookieFail();}function showCookieFail(){  // do something here}checkCookie();
```

上面的代码片段可用于检查 `Cookie` 是否启用，但是对三方 `Cookie` 的检查就无能为力了，三方 `Cookie` 禁用的情况下还是会返回 `true`。

我能想到的并且一直有效的方法就是添加一个外部（三方）的 `iFrame`，让它来检测 `iFrame` 内部是否可以访问到 `Cookie`，并且会将 `Cookie` 的可用状态通知给父应用。

虽然这听起来挺奇怪的，我们好像无法直接通过 `iFrame` 调用父页面的功能。但是我们可以使用 `Message Event` 来进行父子应用之间的通信，通过这个我们可以基于 `URL` 向其他浏览器发送消息，在我们现在这种情况下，我们可以从 `iFrame` 向可能在不同域上的父应用发送消息。

首先，我们在 `iFrame` 内添加一个立即执行函数。在这个函数中，我们添加一个消息事件监听器，这个监听器会在从父级应用程序调用时触发。当被调用时，它首先会验证请求，然后调用 `checkCookiesEnable` 函数来检查 `Cookie` 的状态并返回结果。然后，我们通过 `parent.postMessage()` 方法向父应用发送一条消息；在 `iFrame` 中，`parent` 是一个隐含的对象。

```
<!doctype html><html><head></head><body>    <script>        const checkCookiesEnable = () => {            let isCookieEnabled = (window.navigator.cookieEnabled) ? true : false;            if (typeof window.navigator.cookieEnabled == "undefined" && !isCookieEnabled) {                // 尝试设置一个测试cookie                document.cookie = "testcookie";                // 检查cookie是否已设置                isCookieEnabled = (document.cookie.indexOf("testcookie") != -1) ? true : false;            }            return isCookieEnabled;        }        // 监听消息事件，响应从父窗口传来的消息        (function () {            window.addEventListener('message', event => {                try {                    let data = JSON.parse(event.data)                    if (data['test'] !== 'cookie')                        return                    let result = checkCookiesEnable();                    // 将结果通过消息事件发送到父窗口                    parent.postMessage(JSON.stringify({                        'result': result                    }), event.origin);                }                catch (e) {                    console.error(e)                }            });        })();    </script></body></html>
```

在这里，我们将添加一个消息事件处理程序，然后在插入任何第三方脚本之前插入我们的 `iFrame`。一旦 `iFrame` 加载完毕，我们将通过 `frame.contentWindow` 对象向我们的 `iFrame` 发送 `postMessage`，使用 `"*"` 允许 `postMessage` 任何来源（不同的域）。

然后，`iFrame` 内部的函数检查`iFrame` 的 `Cookie` 状态并发送一个消息，该消息被我们的 `messagehandler` 拦截。检查消息是否由 `iFrame` 发送，事件现在将保存来自 `iFrame` 内的 `checkCookieEnable` 函数结果的响应。

下面是一个示例函数，它接受 iframeUri 和一个回调函数，在收到结果后将被调用。

```
const cookieTest = (iFrameUri, callBack) => {    let messageHandler = (event) => {        // 在这里检查受信任的来源        const data = JSON.parse(event.data);        callBack(data['result']);        window.removeEventListener('message', messageHandler);        document.body.removeChild(frame);    };    // 监听消息事件，响应从 iframe 窗口传来的消息    window.addEventListener('message', messageHandler);    // 创建并添加一个隐藏的 iframe 元素    const frame = document.createElement('iframe');    frame.src = iFrameUri;    frame.sandbox = "allow-scripts allow-same-origin";    frame.style = `display:none`;    frame.onload = (e) => {        // 向 iframe 发送一个消息，请求检查 cookie 的情况        frame.contentWindow.postMessage(JSON.stringify({ 'test': 'cookie' }), '*');    };    document.body.appendChild(frame);};export default cookieTest;
```

你可以直接把上面的代码片段放入你的网站中，并提供一个回调函数来为用户呈现适当的消息。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdQr45W04IOW5xRBd1uBLDeicBiagE95sKVU96Xia0Nbz2OT9uAsn5dBBjWKIrRQ8AqXvFLXHibUG6qAMA/640?wx_fmt=png&from=appmsg)

现在，我们可以成功地在运行时检测到用户的第三方 `Cookie` 是否已启用了！

最后
--

抖音前端架构团队目前放出不少新的 HC ，又看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️