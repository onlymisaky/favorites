> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BVSwRL1bXiLbBghukNQTNA)

之前在沸点看到一个哥们提出一个问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrDH0PRXVgT63VEQ3HXF7NGQsibY7znAYgtQejjl6RO8Lssw7qLhkwVjWuv715yicUdcqw99VDFvxrg/640?wx_fmt=other)image.png

这个问题非常有意思，我一看到就想了很多可以回复的答案，但是评论区太窄，就直接开一篇文章来写了。

审题
--

JS 发起的请求可以暂停吗？这一句话当中有两个概念需要明确，一是什么样的状态才能称之为 `暂停`？二是 `JS 发起的请求` 是什么？

怎么样才算暂停？
========

`暂停` 全称暂时停止，在已开始未结束的过程中临时停止可以称之为暂停，意味着这个过程可以在某个时间点截断然后在另一个时间点重新续上。

请求应该是什么？
========

这里得先介绍一下 **TCP/IP 网络模型**， 网络模型自上而下分为 应用层、传输层、网络层和网络接口层。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrDH0PRXVgT63VEQ3HXF7NGSibYIDSxor6yG5oNoUJXiabpYe4AAqH9icv9q2v6Md2PLuOQfljib0oqxg/640?wx_fmt=other)image.png

上图表示的意思是，每次网络传输，应用数据在发送至目标前都需要通过网络模型一层一层的包装，就像寄快递一样，把要寄的物品先打包好登记一下大小，再装在盒子里登记一下目的地，然后再装到车上，最后送往目的地。

`请求(Request)` 这个概念就可以理解为客户端通过若干次数据网络传输，将单份数据完整发给服务端的行为，而针对某次请求服务端往客户端发送的答复数据则可以称之为 `响应(Response)`。

理论上应用层的协议可以通过类似于标记数据包序列号等等一系列手段来实现暂停机制。但是 TCP 协议**并不支持**，TCP 协议的数据传输是流式的，数据被视为一连串的字节流。客户端发送的数据会被拆分成多个 TCP 段（TCP segments），而这些段在网络中是独立传输的，无法直接控制每个 TCP 段的传输，因此也无法实现暂停请求或者暂停响应的功能。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrDH0PRXVgT63VEQ3HXF7NGafVTWlicOiaFibvLQzBbibeBr3A5yn9Mvds6Ia98ZWlukXP9PvYTPEeG0w/640?wx_fmt=other)image.png

解答提问
====

如果请求是指网络模型中的一次请求传输，那理所当然是不可能暂停的。

来看看提问者的使用场景 —— `JS 发起的请求`，那么可以认为问题当中的请求，应该是指在 JS 运行时中发起的 `XMLHttpRequest` 或者是 `fetch` 请求，而请求既然已经发起，那问的自然就是 **响应是否能够被暂停** 。

我们都知道像大文件分片上传、以及分片下载之类的功能本质上是将分片顺序定好之后按顺序请求，然后就可以通过中断顺序并记录中断点来实现暂停重传的机制，而单个请求并不具备这样的环境。

### 用 JS 实现 ” 假暂停” 机制

虽然不能真正意义上实现暂停请求，但是我们其实可以模拟一个 **假暂停** 的功能，在前端的业务场景上，数据不是收到就可以直接打在客户脸上的（什么光速打击），前端开发者需要对这些数据进行处理之后渲染在界面上，如果我们能在请求发起之前增加一个控制器，在请求回来时，如果控制器为暂停状态则不处理数据，等待控制器恢复后再进行处理，是不是也能到达到目的？让我们试着实现一下。

假如我们使用 `fetch` 来请求。我们可以设计一个控制器 `Promise` 和请求放在一起用 `Promise.all` 包裹，当 `fetch` 完成时判断这个控制器的暂停状态，如果没有被暂停，则控制器也直接 resolve，同时整个 `Promise.all` 也 resolve 抛出。

```
function _request () {  return new Promise<number>((res) => setTimeout(() => {    res(123)  }, 3000))}// 原本想使用 class extends Promise 来实现// 结果一直出现这个问题 https://github.com/nodejs/node/issues/13678function createPauseControllerPromise () {  const result = {    isPause: false,    resolveWhenResume: false,    resolve (value?: any) {},    pause () {      this.isPause = true    },    resume () {      if (!this.isPause) return      this.isPause = false      if (this.resolveWhenResume) {          this.resolve()      }    },    promise: Promise.resolve()  }  const promise = new Promise<void>((res) => {    result.resolve = res  })  result.promise = promise  return result}function requestWithPauseControl <T extends () => Promise<any>>(request: T) {  const controller = createPauseControllerPromise()    const controlRequest = request().then((data) => {      if (!controller.isPause) controller.resolve()      return data  }).finally(() => {      controller.resolveWhenResume = true  })    const result = Promise.all([controlRequest, controller.promise]).then(data => {      controller.resolve()      return data[0]  });    (result as any).pause = controller.pause.bind(controller);  (result as any).resume = controller.resume.bind(controller);    return result as ReturnType<T> & { pause: () => void, resume: () => void }}
```

### 用法

我们可以通过调用 `requestWithPauseControl(_request)` 来替代调用 `_request` 使用，通过返回的 `pause` 和 `resume` 方法控制暂停和继续。

```
const result = requestWithPauseControl(_request).then((data) => {    console.log(data)})if (Math.random() > 0.5) { result.pause() }setTimeout(() => {    result.resume()}, 4000)
```

补充  

有些同学错误的认为网络请求和响应是绝对不可以暂停的，我特意在文章前面提到了有关数据传输的内容，并且挂了一句 “理论上应用层的协议可以通过类似于标记数据包序列号等等一系列手段来实现暂停机制”，这句话的意思是，如果你魔改 HTTP 或者自己设计实现一个应用层协议（例如像 socket、vmess 这些协议），只要双端支持该协议，是可以实现请求暂停或者响应暂停的，而且这不会影响到 TCP 连接，但是实现暂停机制需要对各种场景和 TCP 策略兜底才能有较好的可靠性。

例如，提供一类控制报文用于控制传输暂停，首先需要对所有数据包的序列号标记顺序，当需要暂停时，发送该序列号的暂停报文给接收端，接收端收到暂停报文就将已接收数据包的块标记返回给发送端等等（这和分片上传机制一样）。

最后
==

以上就是本篇文章分享的全部内容了。

这里是 Xekin（/zi:kin/）。喜欢的掘友们可以点赞关注点个收藏~

最近摸鱼时间比较多，写了一些奇奇怪怪有用但又不是特别有用的工具，不过还是非常有意思的，之后会一一写文章分享出来，感谢各位支持。

关于本文  

作者：xekin

https://juejin.cn/post/7260742402397863992

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 「在看」，让更多的人也能看到这篇内容

2、关注官网 https://muyiy.cn，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 「加群」 ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《  

```
最后不要忘了点赞呦！

```