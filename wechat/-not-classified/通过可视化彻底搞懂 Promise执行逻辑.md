> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0sXqMulMiHmtJXl48r3Uww)

JavaScript 中的 Promise 一开始可能会让人感到有些难以理解，但是如果我们能够理解其内部的工作原理，就会发现它们其实是非常易于掌握的。

在这篇博客文章中，我们将深入探讨 Promise 的一些内部机制，并探索它们是如何使得 JavaScript 能够执行非阻塞的异步任务。

一种创建 Promise 的方式是使用 new Promise 构造函数，它接收一个执行函数，该函数带有 resolve 和 reject 参数。

```
 new Promise((resolve, reject) => {  
    // TODO(Lydia): Some async stuff here  
 });
```

当 Promise 构造函数被调用时，会发生以下几件事情：

*   创建一个 Promise 对象。这个 Promise 对象包含几个内部槽，包括 `[[PromiseState]]`、`[[PromiseResult]]`、`[[PromiseIsHandled]]`、`[[PromiseFulfillReactions]]` 和 `[[PromiseRejectReactions]]`。
    
*   创建一个 Promise 能力记录。这个记录 “封装” 了 Promise，并增加了额外的功能来 resolve 或 reject promise。这些功能可控制 promise 的最终 `[[PromiseState]]` 和 `[[PromiseResult]]` ，并启动异步任务。
    

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

我们可以通过调用 resolve 来解决这个 Promise，这是通过执行函数可以实现的。当我们调用 resolve 时：

*   `[[PromiseState]]` 被设置为 “已实现”（fulfilled）。
    
*   `[[PromiseResult]]` 被设置为我们传递给 resolve 的值，在这种情况下是 “完成！”（Done!）。
    

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

调用 reject 时的过程类似，现在 `[[PromiseState]]` 被设置为 “已拒绝”（rejected），并且 `[[PromiseResult]]` 被设置为我们传递给 reject 的值，这是 “失败！”（Fail!）。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

当然很好。但是，使用函数来改变对象内部属性有什么特别的呢？

答案就在与我们目前跳过的两个内部槽相关的行为中：`[[PromiseFulfillReactions]]` 和 `[[PromiseRejectReactions]]`。

`[[PromiseFulfillReactions]]` 字段包含 Promise Reactions。这是一个通过将 then 处理程序链接到 Promise 而创建的对象。

此 Promise Reaction 包含一个 `[[Handler]]` 属性，其中包含我们传递给它的回调。当 promise resolve 时，该处理程序会被添加到微任务队列中，并可访问 promise 解析时的值。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:06

0/0

00:00/00:06 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0600:06_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0b2ekuaayaaacyalfkyyoftfavodbrkqadaa.f10002.mp4?dis_k=a87a6a861d1dc6cb50eff200e4fdbc6b&dis_t=1721958261&play_scene=10120&auth_info=cJvV8ZAKQC4alamB9HgTcyZP&auth_key=4d2c37ed98be1d8fbdcb1ad1693a2af0&auth_info=cOW/8qAIQC4aydPbln0TZix1Zw02HB05XzVra00CZGZPeWdjQCVbY20EXX9sER5GOH8=&auth_key=e1f79fa259bab9d09f0cdb5dc403ecf1&vid=wxv_3410897476784570374&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

当 promise 解析时，这个处理程序接收到 `[[PromiseResult]]` 的值作为其参数，然后将其推送到 Microtask Queue 微任务队列。

这就是 promise 的异步部分发挥作用的地方！

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:19

0/0

00:00/00:19 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:1900:19_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc354abaaaatyak55qyk5tfb36dcdxqaeaa.f10002.mp4?dis_k=72ce982c40e23f2f572d785947f859b5&dis_t=1721958261&play_scene=10120&auth_info=eve00vsKHHlAwf7X/iwXfH9F&auth_key=8548e2f41744dca1d9e003d7c700060a&auth_info=etaR0+4KHHlAnYSNnCkXaXV/MghiSEtpD2Rva0pVZjdFfG4yQyUHNDdQCilmRRpJYXU=&auth_key=13c4eb4be161ed7e2a0e6b85b65036f7&vid=wxv_3410898252193939459&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

> 微任务队列是事件循环（event loop）中的一个专门队列。当调用栈（Call Stack）为空时，事件循环首先处理微任务队列中等待的任务，然后再处理来自常规任务队列（也称为 “回调队列” 或 “宏任务队列”）的任务。
> 
> 如果你想了解更多，可以查看我的事件循环视频！

类似地，我们可以通过链式 catch 来创建一个 Promise Reaction 记录来处理 Promise Reject。当 Promise 被拒绝时，这个回调会被添加到微任务队列。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:06

0/0

00:00/00:06 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0600:06_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc3leaa6aaazaalclyyobtfawodb5mqadya.f10002.mp4?dis_k=eb57f26ac2892b97f35a384a6e98b0e1&dis_t=1721958261&play_scene=10120&auth_info=epX/lsJSHC5JxvqFrnpFI3VB&auth_key=7f610c7a85b783635b56a00ee7ed1d73&auth_info=euuPjYZUHC5JmoDfzH9FNn97MF9gFUBoC28+OE5SYzNFfTYwEXoHYz5XDns2E0gWa3E=&auth_key=69489c1c90130988a87b61008345ddf1&vid=wxv_3410898782874058757&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

到目前为止，我们只是在执行函数内直接调用 resolve 或 reject。虽然这是可能的，但它并没有充分利用 Promise 的全部功能（和主要目的）！

在大多数情况下，我们希望在稍后的某个时间点（通常是异步任务完成时）进行 resolve 或 reject。

异步任务在主线程之外执行，例如读取文件（如 fs.readFile）、提出网络请求（如 https.get 或 XMLHttpRequest），或者像定时器（setTimeout）这样简单的任务。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

当这些任务在未来某个未知的时间点完成时，我们可以使用此类异步操作通常提供的回调功能，要么使用异步任务返回的数据进行 resolve，要么在发生错误时进行 reject。

为了直观地说明这一点，让我们一步步来执行。为了让这个演示简单但仍然真实，我们将使用 setTimeout 来添加一些异步行为。

```
 new Promise((resolve) => {  
     setTimeout(() => resolve('Done!'), 100);  
 }).then(result => console.log(result))
```

首先，将 new Promise 构造函数添加到调用栈，并创建 Promise 对象。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:05

0/0

00:00/00:05 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0500:05_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc334aacaaadmal7jiyaztfbx6dahpqaaia.f10002.mp4?dis_k=f7e3a49fef26e0d09264a77b2847e52f&dis_t=1721958261&play_scene=10120&auth_info=dbe6jf9bEylMka2G+ypBJHNO&auth_key=66f6f2bc9a02df91f6c90e08411cd649&auth_info=dcjj5P1eEylMzdfcmS9BMXl0N1k0H08/WTI5Z09RNmFKfjU0THcIZDsAWXhjQ0wRbX4=&auth_key=7eb390fb7591622855bb3ac9fc197dc2&vid=wxv_3410899642756710403&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

然后，执行函数被执行。在函数体的第一行，我们调用了 setTimeout，并将其添加到调用堆栈中。

setTimeout 负责在 Timers Web API 中调度计时器，延迟时间为 100 毫秒，之后我们传递给 setTimeout 的回调将被推送到任务队列。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:05

0/0

00:00/00:05 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0500:05_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc364abaaaaaiak5qyylftfb56dcd3qaeaa.f10002.mp4?dis_k=0b9a566eee16e8a4b88ae1b9fe776469&dis_t=1721958261&play_scene=10120&auth_info=c6f8w4ZfE3pNlfLQrnYTcHFB&auth_key=2df30f3a6b0357462a8311661eaa9536&auth_info=c573gNZZE3pNyYiKzHMTZXt7NFk3HE8/UTc9PEVfY2VMK25gEXQINzoEBi42Hx5Fb3E=&auth_key=2171b9277fdcf2868e6b358c740ea36c&vid=wxv_3410900460713099265&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

> 这里的异步行为与 setTimeout 有关，与 promise 无关。我在这里展示这个是为了展示承诺的常见用法 —— 在一些延迟后解决一个 promise。
> 
> 然而，延迟本身并不是由 promise 引起的。promise 被设计为与异步操作一起工作，但这些异步操作可以来自不同的来源，如定时器或网络请求。

在定时器和构造函数从调用栈中弹出后，引擎遇到了 then。

then 被添加到调用栈，并创建了一个 Promise Reaction 记录，该处理程序就是我们作为回调传递给 then 处理程序的代码。

由于 `[[PromiseState]]` 仍然是 “挂起”（pending），这个 Promise Reaction 记录会被添加到 `[[PromiseFulfillReactions]]` 列表中。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:08

0/0

00:00/00:08 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0800:08_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc3oaabaaaakyak6aqymbtfa4gdcbyaaeaa.f10002.mp4?dis_k=eb93fa15b0808aa846a0d5432cff087c&dis_t=1721958261&play_scene=10120&auth_info=d6nz980LQnxBlKiFrnZBIyZG&auth_key=d8f8d7f8df3cfeb360a7f35f89ab7186&auth_info=d/76gMYNQnxByNLfzHNBNix8ZF5iFUliCDcxaksGMmRIfWQ0FyVZMTYFXHs2H0wWOHY=&auth_key=41078bb9cc9495f7bef89d8e666895e3&vid=wxv_3410901279340576776&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

100 毫秒过后，setTimeout 回调被推送到任务队列。

脚本已经运行完毕，因此调用栈为空，这意味着该任务现在是从 Task Queue 中取出放到 Call Stack 上，它调用了 resolve。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:05

0/0

00:00/00:05 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0500:05_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc324aa6aaavqalbuyypftfbv6db7lqadya.f10002.mp4?dis_k=677b23231b2bcac6723fe6e5a8c7deb1&dis_t=1721958261&play_scene=10120&auth_info=dIGfzr8PEygcwfrW+3gQd3RF&auth_key=230eadf01ff04fec09c52a32df991edd&auth_info=dJLJrP0JEygcnYCMmX0QYn5/Yg0wHxs5CDU/aU9UZGVLLGJnTCAIZWtQDihjER1CanU=&auth_key=379ed232c83d04c8f9d0e5c28f7e58b7&vid=wxv_3410902716845998083&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

调用 resolve 将 `[[PromiseState]]` 设置为 “fulfilled”，将 `[[PromiseResult]]` 设置为 “Done!”，并与 Promise Reaction 处理程序相关的代码被添加到 Microtask Queue 中。

resolve 和回调从调用栈中弹出。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:08

0/0

00:00/00:08 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0800:08_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc3fiabaaaau4ak6mqymftfakwdcavaaeaa.f10002.mp4?dis_k=91fbb565cd9ffe2e26a98d47752d4e3d&dis_t=1721958261&play_scene=10120&auth_info=JprF3Z5eQHgckK/Z/SkQJ3JB&auth_key=95e628a32db8f29fa08d5167c3cf262d&auth_info=Jtv2yctcQHgczNWDnywQMnh7ZF82FB88DGRsbEsGOzgZfWAxQXFbNWsBWydlQB0SbHE=&auth_key=d54a2fd8d1d0ab86a79f0c65983d821d&vid=wxv_3410903006622072834&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

由于调用栈为空，事件循环首先检查微任务队列，那里 then 处理程序的回调正在等待。

回调现在被添加到调用栈，并记录 result 的值，即 [[PromiseResult]] 的值；字符串 'Done!'。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:05

0/0

00:00/00:05 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:0500:05_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc34uabaaaapqak65iyibtfbzodcdsqaeaa.f10002.mp4?dis_k=c28c0a3ac24ef847d8a818c746138573&dis_t=1721958261&play_scene=10120&auth_info=er69yaVZF3RMlPiD/ncRdSZE&auth_key=f3eb156fa3241b01b2f36677b026029b&auth_info=eqWY/eJeF3RMyILZnHIRYCx+MF9gGRw8UWI+OkUGOjFFKmAyQnIMOTsFDH1mHhxAOHQ=&auth_key=e6cb7ab202c3bb33a8997f80b7932134&vid=wxv_3410903207680229377&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

一旦回调执行完毕并从调用栈中弹出，程序就完成了！

除了创建一个 Promise Reaction 之外，then 还返回一个 Promise。这意味着我们可以将多个 then 链接在一起，例如：

```
 new Promise((resolve) => {  
     resolve(1);  
 })  
     .then(result => result * 2)  
     .then(result => result * 2)  
     .then(result => console.log(result));
```

执行这段代码时，在调用 Promise 构造函数时会创建一个 Promise 对象。之后，每当引擎遇到 then 时，就会创建一个 Promise Reaction 记录和一个 Promise Object。

在这两种情况下，then 的回调都将接收到的 `[[PromiseResult]]` 值乘以 2。then 的 `[[PromiseResult]]` 被设置为计算的结果，这个结果又被下一个 then 的处理程序使用。

 已关注  关注  重播  分享   赞    关闭**观看更多**更多

_退出全屏_[](javascript:;)_切换到竖屏全屏__退出全屏_前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)[](javascript:;)分享视频，时长00:23

0/0

00:00/00:23 切换到横屏模式 继续播放进度条，百分之0[播放](javascript:;)00:00/00:2300:23_全屏_

倍速播放中 [0.5倍](javascript:;) [0.75倍](javascript:;) [1.0倍](javascript:;) [1.5倍](javascript:;) [2.0倍](javascript:;) [超清](javascript:;) [流畅](javascript:;) <video src="https://mpvideo.qpic.cn/0bc3nuaa6aaay4alb3yypbtfa3odb5wqadya.f10002.mp4?dis_k=7df86691185fc17a45364e7639fe82c8&dis_t=1721958261&play_scene=10120&auth_info=J6jf5KgMQXRLwPPXqClKc3FO&auth_key=935b12357607ffa28051ed50285b97a9&auth_info=J96rjbYOQXRLnImNyixKZnt0YA1qGB85WGFoakhUNDQYfmE1TSVaOTxRBykwQEdGb34=&auth_key=49316fe49c41bd72165c6e064dc20b03&vid=wxv_3410903494620954625&format_id=10002&support_redirect=0&mmversion=false" control></video>

继续观看

通过可视化彻底搞懂 Promise执行逻辑

观看更多转载,通过可视化彻底搞懂 Promise执行逻辑前端瓶子君已关注分享点赞在看已同步到看一看[写下你的评论](javascript:;)

[视频详情](javascript:;)

最终，结果被记录下来。由于我们没有显式地返回一个值，所以最后一个 then promise 的 `[[PromiseResult]]` 是未定义的，这意味着它隐式地返回了未定义的值。

当然，使用数字并不是最现实的场景。相反，您可能希望逐步改变 promise 的结果，就像逐步改变图片的外观一样。

例如，您可能希望采取一系列增量的步骤，通过操作（如调整大小、应用滤镜、添加水印等）来改变图像的外观。

```
 function loadImage(src) {  
     return new Promise((resolve, reject) => {  
         const img = new Image();  
         img.onload = () => resolve(img);  
         img.onerror = reject;  
         img.src = src;  
     });  
 }  
 loadImage(src)  
     .then(image => resizeImage(image))  
     .then(image => applyGrayscaleFilter(image))  
     .then(image => addWatermark(image))
```

这类型的任务通常涉及异步操作，这使得 promise 成为以非阻塞方式管理这些操作的良好选择。

#### 结论

长话短说，Promise 只是具有一些额外功能来改变其内部状态的对象。

Promises 最酷的地方在于，如果通过 then 或 catch 附加了处理程序，就可以触发异步操作。由于处理程序被推送到微任务队列，因此可以以非阻塞的方式处理最终结果。这样就能更轻松地处理错误、将多个操作连锁在一起，并使代码更具可读性和可维护性！

Promise 虽然是一个基础概念，对每个 JavaScript 开发人员来说都很重要。如果您有兴趣了解更多，async/await 语法（承诺的语法糖）等其他特性以及 Async Generators（异步生成器）等特性将为异步代码的使用提供更多方法。

关于本文  
译者：@飘飘  
作者：@Lydia Hallie  
原文：https://www.lydiahallie.com/blog/promise-execution