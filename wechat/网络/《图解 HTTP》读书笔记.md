> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/X6WghDK10KFrImjvNITofg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIAdW938V7xHLFSz6q0IgMZRcHtlNl3mxhicX8l5FN1qFybK79KvpFhoOw/640?wx_fmt=jpeg)

来源：莫得盐

https://juejin.cn/user/2066737590183837

_本文部分内容摘抄于《图解 HTTP》，就不一一使用引用标记了。_

HTTP 的诞生
========

1989 年 3 月，互联网还只属于少数人。在这一互联网的黎明期，HTTP 诞生了。

CERN（欧洲核子研究组织）的蒂姆 · 伯纳斯 - 李（Tim Berners-Lee）博士提出了一种能让远隔两地的研究者们共享知识的设想。最初设想的基本理念是：借助多文档之间相互关联形成的超文本（HyperText），连成可相互参阅的 WWW（World Wide Web，万维网）。

现在已提出了 3 项 WWW 构建技术，分别是：把 SGML（Standard Generalized MarkupLanguage，标准通用标记语言）作为页面的文本标记语言的 HTML（HyperText MarkupLanguage，超文本标记语言）；作为文档传递协议的 HTTP；指定文档所在地址的 URL（UniformResource Locator，统一资源定位符）。

WWW 这一名称，是 Web 浏览器当年用来浏览超文本的客户端应用程序时的名称，现在则用来表示这一系列的集合，也可简称为 Web。

TCP/IP 协议簇
==========

关于 TCP/IP 有两种认知：

1.  TCP/IP 是指 TCP 和 IP 这两种协议
    
2.  TCP/IP 是在 IP 协议的通信过程中，使用到的协议族的统称
    

TCP/IP 分层管理
-----------

由上至下分别是：

1.  应用层，比如：FTP（File Transfer Protocol，文件传输协议、 DNS（Domain Name System，域名系统、 HTTP
    
2.  传输层，比如：TCP（Transmission Control Protocol，传输控制协议）和 UDP（User Data Protocol，用户数据报协议）
    
3.  网络层（又名网络互连层），比如：IP（Internet Protocol，网际协议）
    
4.  链路层（又名数据链路层，网络接口层），用来处理连接网络的硬件部分，比如：操作系统、硬件的设备驱动、网卡、光纤
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIAhljvGkcibibjgbSlA7n7mwgUmKkneT1iaO8DMicz45RUAGnGx4Hw9q5QuQ/640?wx_fmt=png)

IP
--

属于网络层的 IP 协议负责传输数据包，几乎所有使用网络的系统都会用到 IP 协议。IP 协议传输数据需要各种条件，其中最重要的两个就是：

1.  IP 地址，是指节点被分配到的地址，非特殊网络该地址会周期性改变（分配）。
    
2.  MAC 地址，是网卡指代的固定地址。
    

### ARP 协议

IP 间的通信依赖 MAC 地址，ARP 协议就是关联 IP 和 MAC 地址的，他能通过 IP 地址在局域网内查找关联的 MAC 地址，然后进行网络通信。更多 ARP 信息见 ARP 协议详解

TCP
---

TCP 是传输层通信协议， 它提供**面向连接的**、**可靠的**、**字节流服务**。

*   可靠，是指能够把数据准确可靠地传给对方
    
*   字节流服务（Byte Stream Service），是指为了方便传输，将大块数据分割成以报文段（segment）为单位的数据包进行管理
    

### 三次握手

为了确保传输可靠，TCP 需要先建立连接，建立连接时则采用三次握手（three-way handshaking）策略来确定连接可靠。三次握手过程如下：

1.  第一次握手
    

*   发送端：向接收端发送带有 SYN 标记的数据包
    
*   接收端：接收带 SYN 的数据包
    

3.  第二次握手
    

*   接收端：向发送端发送带有 SYN 和 ACK 标记的数据包
    
*   发送端：接收数据包并验证 SYN 标记是否正确
    

5.  第三次握手
    

*   发送端：向接收端发送带有 ACK 标记的数据包
    
*   接收端：接收数据包并验证 ACK 标记是否正确
    

以上四步未发生异常，则连接建立。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIApHL9st7WkZpmSNgxic613ib5ARCyj6M2Or0OwnXGCtfYO5riaibUWLN9cw/640?wx_fmt=png)

为什么是三次握手呢？因为建立可靠连接需要保证发送端和接收端都拥有**发送能力**和**接收能力**

1.  第一次握手
    

*   接收端接收到 SYN，知道**发送端拥有发送能力**
    

3.  第二次握手
    

*   发送端接收到 ACK，知道**接收端有发送能力**
    
*   发送端验证 SYN，知道**接收端有接收能力**
    

5.  第三次握手
    

*   接收端验证 ACK，知**发送端有接收能力**
    

如上，能保证链接可靠的最少握手次数是三次，所以 TCP 就有三次握手策略。

### 四次挥手

TCP 断开连接采用四次挥手的策略：

1.  第一次挥手
    

*   发送端：向接收端发送带 FIN 标记的数据包，表示想要断开连接
    
*   接收端：接收数据包并暂存 FIN
    

3.  第二次挥手
    

*   接收端：向发送端发送带 ACK 标记的数据包，表示已经收到要断开连接的请求，但不会立即断开
    
*   发送端：接受数据包并暂存 ACK
    

5.  第三次挥手
    

*   接收端：向发送端发送带 FIN 标记的数据包，表示我准备好要断开了
    
*   发送端：接受数据包并验证 FIN
    

7.  第四次挥手
    

*   发送端：向接收端发送带 ACK 标记的数据包，表示那你可以断开了
    
*   接收端：接收数据包并验证 ACK，没有问题接收端就可以断开连接、回收端口了，接收端进入 TIMED_WAIT 阶段，等待两个 MSL(Max Segment LifeTime) 时间
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIAnrWMic4lFHy364IeNWlwhyfpJibQlAvqGiapvjsKWZg8jbrHMVK4lUNEA/640?wx_fmt=png)

注：Max Segment LifeTime 报文最大生存时间由平台决定，Windows 是 120s，Linux 是 60s

在四次挥手过程中有两个比较重要的阶段需要解释下：

*   CLOSE_WAIT: 为什么接收端需要 CLOSE_WAIT 阶段，而不是直接返回 FIN 呢，因为接收端可能还有一些请求未返回，所以需要时间把他们都返回再关闭连接。
    
*   TIME_WAIT：为什么发送端需要 TIME_WAIT 阶段呢，有两个原因：
    

1.  在发送 ACK 后，可能由于网络抖动等原因 ACK 包并不能正常抵达接收端，接收端超时后会重复第三次握手（发 FIN 给发送端），所以发送端第一次接收到 FIN 时不能直接关闭连接，如果直接关闭可能会导致接收端状态不正常，造成资源浪费
    
2.  HTTP/2 可能存在正常应答迟于 FIN 到达接收端的情况，所以发送 ACK 后还需等待一段时间，保证数据流正常
    

另外可能有人会疑惑为什么要等待两个 MSL 时间，这个其实并没有标准答案，因为这只是像缓存超时时间一样的配置（可以等待两个也可以等待一个，都不影响 TCP 挥手策略的原理），如果一定要硬答，那只是策略决定要等待两个 MSL 时间。

### TCP 和 UDP 的区别

UDP（User Data Protocol，用户数据报协议）是一种**无连接的**、**不可靠的**、用户数据报服务协议。所以机制区别是：

1.  TCP 有连接，UDP 无连接
    

*   UDP 资源占用更少
    

3.  TCP 可靠（需维持状态），UDP 不可靠
    

*   UDP 包更小
    
*   UDP 不保证顺序
    
*   UDP 会丢包
    

了解更多：TCP 与 UDP 区别详解

DNS
---

DNS（Domain Name System）服务是和 HTTP 协议一样位于应用层的协议，它提供域名到 IP 地址之间的解析服务。

之所以需要 DNS 服务，是因为我们通常很难记住一长串数字组成的 IP ，而要记住字母组合而成的域名就要容易得很多（比如 google.com），当我们访问域名时 DNS 服务会把域名转换为目标 IP 实现通信。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIAeb0bDb7xuLoNsJJIAQgccOk28e9ExwtwSyuqkqPJNLs5OH1XFJ4ojQ/640?wx_fmt=png)

### 浏览器输入域名到返回 IP 地址的过程

1.  解析 URL
    
2.  DNS 查询，查询优先级如下（如果匹配到解析结果就不在继续往下查询）：
    

1.  查询浏览器 DNS 缓存 `chrome://net-internals/#dns`
    
2.  查询本地 hosts 文件 `/etc/hosts`
    
3.  查询本地 DNS 服务器
    
4.  查询上级 DNS 服务器
    

HTTP
====

HTTP 协议和 TCP/IP 协议族内的其他众多的协议相同，用于客户端和服务器之间的通信。其中请求访问文本或图像等资源的一端称为**客户端**，而提供资源响应的一端称为**服务端**。

HTTP 本身不保存状态，即无状态（stateless）协议。虽然我们经常使用一些机制（比如 Cookie、Session）来帮助 HTTP 协议保持状态，但这不属于协议本身，而是独立的解决方案。

报文构成
----

### 请求报文

HTTP 协议的请求报文是由请求方法、请求 URI、协议版本、可选的请求首部字段和内容实体构成的。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIA5UUXksnTvSfkKiciaRgEsWJp2zQYDz3rFz013A2PsCc1iazUbr98ChLdg/640?wx_fmt=png)

### 响应报文

HTTP 协议的响应报文基本上由协议版本、状态码、用以解释状态码的原因短语、可选的响应首部字段以及实体主体构成。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIABnaxCHHvmPYFJ6Sa48gCudib2tIItb1FHSPCz15fXeyMF7wB1fpJjlg/640?wx_fmt=png)

keep-alive
----------

HTTP 协议的初始版本中，每进行一次 HTTP 通信就要断开一次 TCP 连接，这在请求频率高时造成大量的通信开销。所以 HTTP/1.1 应用了（HTTP Persistent Connections，也称为 HTTPkeep-alive 或 HTTP connection reuse）的方法，只要任意一端没有明确提出断开连接，**则保持 TCP 连接状态**。

状态码
---

状态码的职责是当客户端向服务器端发送请求时，描述返回的请求结果。借助状态码，用户可以知道服务器端是正常处理了请求，还是出现了错误。

*   2xx 成功
    
*   3xx 重定向
    

1.  301 Moved Permanently，永久性重定向，表示请求的资源已被分配了新的 URI ，以后应该请求新的 URI
    
2.  302 Not Found，临时性重定向，表示资源已被分配了新的 URI，本次应请求新的 URI
    
3.  303 See Other，临时重定向，但和 302 不同的是，303 希望用户本次请求新的 URI 时使用 GET 方法
    
4.  304 Not Modified，资源未变动，表示可直接使用客户端的缓存
    

*   4xx 客户端错误
    

1.  400 Bad Request，表示请求报文中存在语法错误
    
2.  401 Unauthorized，该状态码表示发送的请求需要有通过 HTTP 认证（BASIC 认证、DIGEST 认证）的认证信息，若之前已进行过 1 次请求，则表示用户认证失败。
    
3.  403 Forbidden，表示对请求资源的访问被服务器拒绝
    
4.  404 Not Found，表示服务器上无法找到请求的资源
    

*   5xx 服务端错误
    

1.  500 Internal Server Error，表示服务器端在执行请求时发生了错误
    
2.  503 Service Unavailable，表示服务器暂时处于超负载或正在进行停机维护，现在无法处理请求
    

HTTP/2
------

HTTP/2 在 HTTP 的基础上主要有如下优化：

1.  首部压缩，压缩 HTTP 标头字段减少网络资源占用
    
2.  多路复用，避免队头阻塞（HTTP/1 传输是基于串行的请求 - 应答的模式，队头的请求处理过慢会阻塞它之后的请求，HTTP/2 消息分解为独立的帧，交错发送，然后在另一端重新组装）
    
3.  请求优先级，避免高优先级请求被阻塞
    
4.  服务器推送，更灵活的数据传输方式
    

为了实现这些优化，HTTP/2 在原本的 HTTP 结构上添加了一个二进制分帧层，该成将**数据流**分割为更小的**消息**和**帧**，并采用二进制格式对它们编码。

*   数据流：已建立的连接内的双向字节流，可以承载一条或多条消息，一个 TCP 连接上可以有多个双向数据流，每个数据流都有唯一的标识符和可选的优先级信息
    
*   消息：指请求或响应，每条消息包含一个或多个帧
    
*   帧：HTTP/2 通信的最小单位，每个帧都包含帧头，至少也会标识出当前帧所属的数据流
    

了解更多

HTTPS
=====

由于 HTTP 协议在安全上存在如下隐患：

*   通信使用明文，内容可能会被窃听
    
*   不验证通信方的身份，因此有可能遭遇伪装
    
*   无法证明报文的完整性，所以有可能已遭篡改
    

为了防止内容被**窃听**、**伪装**和**篡改**，HTTP 协议披上了 SSL 这件大衣，这也就成了 HTTPS 协议。所以 HTTPS 并非是应用层的一种新协议，只是 HTTP 通信接口部分用 SSL（Secure Socket Layer）和 TLS（Transport LayerSecurity）协议代替，原本 HTTP 直接和 TCP 通信，当使用 SSL 时，则演变成先和 SSL 通信，再由 SSL 和 TCP 通信。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIAQ7tAK2Fbqiaicia7tMaliaGQS6VuKAfCBoQdEpdicugclYtVCfR1YMmnovQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIAicNKBGfH0VfaSLTfMdfRu3lvQlCxyibFg2HZNiapbdHnUJBEuRPMSTZpg/640?wx_fmt=png)

加密
--

HTTPS 的加密采用对称加密和非对称加密两种方式：

*   其中密钥采用非对称加密，保证客户端和服务端都持有相同的公共密钥
    
*   数据包采用这个公共密钥进行加密
    

详细步骤如下：

1.  客户端向请求 https （服务器的 443 端口）
    
2.  服务端把诸如证书颁发机构、过期时间、非对称公钥等信息发送给客户端（服务端必须有一套数字证书）
    
3.  客户端接收证书信息
    

1.  通过证书信息向 CA 机构验证证书
    
2.  产生对称公钥
    
3.  使用非对称公钥加密对称公钥
    
4.  把加密后的对称公钥发送给服务端
    
5.  服务端接加密后的对称公钥后，使用非对称私钥对其进行解密（此时客户端和服务端拥有同一个对称公钥了）
    

5.  然后开始实际请求，客户端通过对称公钥加密请求，服务端接收请求后通过对称公钥解密
    
6.  服务端返回对称公钥加密后的数据，客户端接收数据后使用对称公钥解密，获得真实数据
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYxoHcR9XeXsnJ8aKibZPIA6z5YGk98BPWP8jHB0piczK3Cn2a3VQbtOjju3nbia9yqnBX1QgHKqAag/640?wx_fmt=png)

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

欢迎关注「前端瓶子君」，回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持