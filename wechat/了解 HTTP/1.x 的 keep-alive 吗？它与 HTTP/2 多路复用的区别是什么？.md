> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/194SJUQz-mZBtg-kLd9fhA)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

引言
--

本文分为以下三部分循序渐进走进 HTTP/1.x 的 keep-alive 与 HTTP/2 多路复用：

*   HTTP/1.x keep-alive 是什么
    
*   HTTP/2 多路复用
    
*   HTTP/1.x keep-alive 与 HTTP/2 多路复用区别
    

下面正式开始吧

HTTP/1.x keep-alive 是什么
-----------------------

在[一文走进 TCP 与 HTTP 中](http://mp.weixin.qq.com/s?__biz=Mzg2NjUxOTM2Mg==&mid=2247485689&idx=1&sn=7a838c297e787b94944a0ceb04b6b86b&chksm=ce48d8d4f93f51c2967174c9e394b1349ed33183a3a61e775fb13e99fab50f1be935448bd444&scene=21#wechat_redirect)，我们介绍过，HTTP 协议是建立在 TCP 协议上的应用层协议， HTTP 协议最初是一个非常简单的协议，通信方式也是采取简答的请求 - 应答的模式，即：客户端与服务器端的的每次请求都需要创建 TCP 连接，服务器响应后断开 TCP 连接，再请求再创建断开。

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKkY4otbWCp1H55GFxcFRe86Q4v4StO5llgjvt80VAcyou5ibXybN2ITcBsgOhMa5jGDcPhfvLLfSLQ/640?wx_fmt=png)

在 HTTP/0.9 与 早期 HTTP/1.0 中，默认的就是这种，但这种频繁的创建、断开连接无疑是极大的消耗性能

> TCP 连接的新建成本很高，因为客户端和服务器建立连接时需要 “三次握手”，发送 3 个数据包，需要 1 个 RTT；关闭连接是 “四次挥手”，4 个数据包需要 2 个 RTT，并且开始时发送速率较慢（slow start），随着网页加载的外部资源越来越多，这个问题就愈发突出了

所以 HTTP/1.0 引入了 keep-alive 长连接，HTTP/1.0 中是默认关闭的，可以通过 `Connection: keep-alive;` 开启 ，HTTP/1.1 默认是开启的，无论加没加 `Connection: keep-alive;`

所谓长连接，即在 HTTP 请求建立 TCP 连接时，请求结束，TCP 连接不断开，继续保持一段时间（timeout），在这段时间内，同一客户端向服务器发送请求都会复用该 TCP 连接，并重置 timeout 时间计数器，在接下来 timeout 时间内还可以继续复用 TCP 。这样无疑省略了反复创建和销毁 TCP 连接的损耗。

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKkY4otbWCp1H55GFxcFRe86obhic0BeK6BCTPn1dMVO2xBCibBzvbgRWQ4qTliaXK8IiaUibJFoMTFA3IA/640?wx_fmt=png)

> timeout 时间到了之后，TCP 会立即断开连接吗？
> 
> 若两小时（timeout）没有收到客户的数据，服务器就发送一个探测报文段，以后则每隔 75 秒发送一次。若一连发送 10 个探测报文段后仍无客户的响应，服务器就认为客户端出了故障，接着就关闭这个连接。
> 
> ——_摘自谢希仁《计算机网络》_

HTTP/2 多路复用
-----------

**为什么 HTTP/2 引入多路复用？**

这是因为：

*   HTTP/1.x 虽然引入了 keep-alive 长连接，但它每次请求必须等待上一次响应之后才能发起，
    
*   所以，在 HTTP/1.1 中提出了管道机制（默认不开启），下一次的请求不需要等待上一个响应来之后再发送，但这要求服务端必须按照请求发送的顺序返回响应，当顺序请求多个文件时，其中一个请求因为某种原因被阻塞时，在后面排队的所有请求也一并被阻塞，这就是队头阻塞 (Head-Of-Line Blocking)
    
*   人们采取了很多方法去解决，例如使用多个域名、引入雪碧图、将小图内联等，但都没有从根本上解决问题
    

**HTTP/2 是怎么做的喃？**

*   首先它引入了 帧（frame）和流（stream），因为 HTTP/1.x 是基于文本的，因为是文本，就导致了它必须是个整体，在传输是不可切割的，只能整体去传
    
*   既然，HTTP/2 是基于二进制流的，它就可以把 HTTP 消息分解为独立的帧，交错发送，然后在另一端通过帧中的标识重新组装，这就是多路复用
    
*   这就实现了在同一个 TCP 连接中，同一时刻可以发送多个请求和响应，且不用按照顺序一一对应，即使某个请求任务耗时严重，也不会影响到其它连接的正常执行
    

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKkY4otbWCp1H55GFxcFRe86g3UFDLnn9tEQAGudUofgJd9jFHo1a23x1T1jX1iaDQia3ibuPvs9nD12w/640?wx_fmt=png)

HTTP/1.x keep-alive 与 HTTP/2 多路复用区别
-----------------------------------

总结一下，HTTP/1.x keep-alive 与 HTTP/2 多路复用区别：

*   HTTP/1.x 是基于文本的，只能整体去传；HTTP/2 是基于二进制流的，可以分解为独立的帧，交错发送
    
*   HTTP/1.x keep-alive 必须按照请求发送的顺序返回响应；HTTP/2 多路复用不按序响应
    
*   HTTP/1.x keep-alive 为了解决队头阻塞，将同一个页面的资源分散到不同域名下，开启了多个 TCP 连接；HTTP/2 同域名下所有通信都在单个连接上完成
    
*   HTTP/1.x keep-alive 单个 TCP 连接在同一时刻只能处理一个请求（两个请求的生命周期不能重叠）；HTTP/2 单个 TCP 同一时刻可以发送多个请求和响应
    

你还知道其它的区别吗？或对文中有任何异议，欢迎提交至 https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/498 ，你的每一次反馈对我们都至关重要，感谢

如果感觉还不错，欢迎点赞与在看，你的点赞与在看都是对我们最好的支持❤️

最近开源了一个 github 仓库：百问百答，在工作中很难做到对社群问题进行立即解答，所以可以将问题提交至 https://github.com/Advanced-Frontend/Just-Now-QA ，我会在每晚花费 1 个小时左右进行处理，更多的是鼓励与欢迎更多人一起参与探讨与解答🌹

来自：https://github.com/Advanced-Frontend/Daily-Interview-Question

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持