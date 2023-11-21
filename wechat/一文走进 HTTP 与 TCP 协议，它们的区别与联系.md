> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_ptTDdyH41c4Mth3FQvNlw)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

引言
--

本文从 OSI 网络分层（7 层） 开始探讨 TCP 与 HTTP 的关系，包含以下几个部分：

*   OSI 网络分层（7 层）
    
*   TCP 协议（三次握手、四次挥手）
    
*   HTTP
    
*   TCP 与 HTTP 的区别与联系
    

OSI 网络分层（7 层）
-------------

Open Systems Interconncection 开放系统互联：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmgMtqrvYVPzVWA2CKdheFHoqey9UXmYVkKSNh83OoHabBKSKfAZsExRic0icJIZnd2fM1rLVRnD0hg/640?wx_fmt=png)

1 物理层 -> 2 数据链路层 -> 3 网络层 (ip)-> 4 传输层 (tcp) -> 5 会话层 --> 6 表示层 --> 7 应用层 (http)

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;"><br></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">协议</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第七层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">应用层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">支持网络应用，应用协议仅仅是网络应用的一个组成部分，运行在不同主机上的进程则使用应用层协议进行通信。主要的协议有：<strong>http</strong>、ftp、dns、telnet、smtp、pop3 等。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第六层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">表示层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">把数据转换为合适、可理解的语法和语义</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第五层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">会话层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">维护网络中的连接状态，即保持会话和同步，有 SSL</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第四层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">传输层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">负责为信源和信宿提供应用程序进程间的数据传输服务，这一层上主要定义了两个传输协议，即传输控制协议<strong> TCP</strong> 和用户数据报协议 UDP。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第三层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">网络层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">负责将数据报独立地从信源发送到信宿，主要解决路由选择、拥塞控制和网络互联等问题。IP 在这一层</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第二层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">数据链路层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">负责将 IP 数据报封装成合适在物理网络上传输的帧格式并传输，或将从物理网络接收到的帧解封，取出 IP 数据报交给网络层。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">第一层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">物理层</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">负责将比特流在结点间传输，即负责物理传输。该层的协议既与链路有关也与传输介质有关。</td></tr></tbody></table>

HTTP 是应用层协议，而 TCP 是传输层协议，接下来我们逐一详细介绍👇

TCP
---

TCP、UDP 都是是传输层协议：

*   用户数据报协议 UDP（User Datagram Protocol）：
    

*   无连接；
    
*   尽最大努力的交付；
    
*   面向报文；
    
*   无拥塞控制；
    
*   支持一对一、一对多、多对一、多对多的交互通信；
    
*   首部开销小 (只有四个字段：源端口、目的端口、长度、检验和)。
    

*   传输控制协议 TCP（Transmission Control Protocol）：
    

*   面向连接；
    
*   每一个 TCP 连接只能是点对点的 (一对一)；
    
*   提供 **可靠交付** 服务；
    
*   提供 **全双工** 通信；
    
*   面向字节流。
    

另外，UDP 是面向报文的传输方式是应用层交给 UDP 多长的报文，UDP 发送多长的报文，即一次发送一个报文。因此，应用程序必须选择合适大小的报文

应用程序和 TCP 的交互是一次一个数据块 (大小不等)，但 TCP 把应用程序看成是一连串的无结构的字节流。TCP 有一个缓冲，当应该程序传送的数据块太长，TCP 就可以把它划分短一些再传送

当网络通信时采用 TCP 协议时，在真正的读写操作之前，客户端与服务器端之间必须建立一个连接，当读写操作完成后，双方不再需要这个连接时可以释放这个连接。连接的建立依靠 “三次握手”，而释放则需要 “四次握手”，所以每个连接的建立都是需要资源消耗和时间消耗的

### TCP 连接过程（三次握手）

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKmgMtqrvYVPzVWA2CKdheFHibtgInHDGNgW7YbtIJ6zbJnXpISrbicqMdrB85hdeuVNN3gjr3do7X6w/640?wx_fmt=jpeg)

**第一次握手**

客户端向服务端发送连接请求报文段。该报文段中包含自身的数据通讯初始序号。请求发送后，客户端便进入 SYN-SENT 状态。

**第二次握手**

服务端收到连接请求报文段后，如果同意连接，则会发送一个应答，该应答中也会包含自身的数据通讯初始序号，发送完成后便进入 SYN-RECEIVED 状态。

**第三次握手**

当客户端收到连接同意的应答后，还要向服务端发送一个确认报文。客户端发完这个报文段后便进入 ESTABLISHED 状态，服务端收到这个应答后也进入 ESTABLISHED 状态，此时连接建立成功。

**为什么需要三次握手，2 次不行吗？**

喂喂喂，我是 A，你听的到吗？B：在在在，我能听到，我是 B，你能听到我吗? A：(听到了，老子不想理你) B：喂喂喂？听不听到？我 X，对面死了，我挂了。。

如果只有 2 次的话，B 并不清楚 A 是否收到他发过去的信息。

### TCP 断开链接（四次挥手）

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKmgMtqrvYVPzVWA2CKdheFHwnotSBSugzPZ87uJFy2UbCJN2o26HdSfE0MHGgINVjrrcXFSqic9ucg/640?wx_fmt=jpeg)

**第一次挥手**

若客户端 A 认为数据发送完成，则它需要向服务端 B 发送**连接释放**请求。

**第二次挥手**

B 收到连接释放请求后，会告诉应用层要释放 TCP 链接。然后会发送 ACK 包，并进入 CLOSE_WAIT 状态，此时表明 A 到 B 的连接已经释放，不再接收 A 发的数据了。但是因为 **TCP 连接是双向的，所以 B 仍旧可以发送数据给 A**。

**第三次挥手**

B 如果此时还有没发完的数据会继续发送，完毕后会向 A 发送连接释放请求，然后 B 便进入 LAST-ACK 状态。

PS：通过延迟确认的技术（通常有时间限制，否则对方会误认为需要重传），可以将第二次和第三次握手合并，延迟 ACK 包的发送。

**第四次挥手**

A 收到释放请求后，向 B 发送确认应答，此时 A 进入 TIME-WAIT 状态。该状态会持续 2MSL（最长报文段寿命，指报文段在网络中生存的时间，超时会被抛弃） 时间，若该时间段内没有 B 的重发请求的话，就进入 CLOSED 状态。当 B 收到确认应答后，也便进入 CLOSED 状态。

HTTP
----

HTTP 是建立在 TCP 上的应用层协议，超文本传送协议。

HTTP 连接最显著的特点是客户端发送的每次请求都需要服务器回送响应，在请求结束后，会主动释放连接。从建立连接到关闭连接的过程称为 “一次连接”。

http1.0 : 客户端的每次请求都要求建立一次单独的连接，在处理完本次请求后，就自动释放连接。

http1.1 ：可以在一次连接中处理多个请求，并且多个请求可以重叠进行，不需要等待一个请求结束后就可以再发送一个新的请求

http2.0 ：支持多路复用，一个 TCP 可同时传输多个 http 请求，头部数据还做了压缩

http3.0 ：使用了 QUIC，开启多个 TCP 连接，在出现丢包的情况下，只有丢包的 TCP 等待重传，剩余的 TCP 连接还可以正常传输数据

### HTTP 特点

*   无状态：协议对客户端没有状态存储，对事物处理没有 “记忆” 能力，比如访问一个网站需要反复进行登录操作。
    
*   无连接：HTTP/1.1 之前，由于无状态特点，每次请求需要通过 TCP 三次握手四次挥手，和服务器重新建立连接。比如某个客户机在短时间多次请求同一个资源，服务器并不能区别是否已经响应过用户的请求，所以每次需要重新响应请求，需要耗费不必要的时间和流量。
    
*   基于请求和响应：基本的特性，由客户端发起请求，服务端响应。
    
*   简单快速、灵活。
    
*   通信使用明文、请求和响应不会对通信方进行确认、无法保护数据的完整性。
    

### Method

*   GET 方法请求一个指定资源的表示形式. 使用 GET 的请求应该只被用于获取数据.
    
*   HEAD 方法请求一个与 GET 请求的响应相同的响应，只返回请求头，没有响应体，多数由 JavaScript 发起
    
*   POST 方法用于将实体提交到指定的资源，通常导致状态或服务器上的副作用的更改.
    
*   PUT 方法用请求有效载荷替换目标资源的所有当前表示。
    
*   DELETE 方法删除指定的资源。
    
*   CONNECT 方法建立一个到由目标资源标识的服务器的隧道，多用于 HTTPS 和 WebSocket 。
    
*   OPTIONS 方法，预检，用于描述目标资源的通信选项。通过该请求来知道服务端是否允许跨域请求。
    
*   TRACE 方法沿着到目标资源的路径执行一个消息环回测试，多数线上服务都不支持
    
*   PATCH 方法用于对资源应用部分修改。
    

HTTP 与 TCP 区别
-------------

TCP 协议对应于传输层，而 HTTP 协议对应于应用层，从本质上来说，二者没有可比性：

*   HTTP 对应于应用层，TCP 协议对应于传输层
    
*   HTTP 协议是在 TCP 协议之上建立的，HTTP 在发起请求时通过 TCP 协议建立起连接服务器的通道，请求结束后，立即断开 TCP 连接
    
*   HTTP 是无状态的短连接，而 TCP 是有状态的长连接
    
*   TCP 是传输层协议，定义的是数据传输和连接方式的规范，HTTP 是应用层协议，定义的是传输数据的内容的规范
    

说明：从 HTTP/1.1 起，默认都开启了 Keep-Alive，保持连接特性，简单地说，当一个网页打开完成后，客户端和服务器之间用于传输 HTTP 数据的 TCP 连接不会关闭，如果客户端再次访问这个服务器上的网页，会继续使用这一条已经建立的连接 Keep-Alive 不会永久保持连接，它有一个保持时间，可以在不同的服务器软件（如 Apache）中设定这个时间。

来自：https://github.com/Advanced-Frontend/Daily-Interview-Question

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持