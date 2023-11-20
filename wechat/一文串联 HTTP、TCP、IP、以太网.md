> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1FSYt2NR14s_zx_CJl7miA)

新的一年，伴随着奇舞团十周年的到来，我们有了一个新的名字 - **奇舞精选**。  

奇舞精选依然是由奇舞团维护的前端技术公众号。除周五外，每天向大家推荐一篇前端相关技术文章，每周五向大家推送汇总周刊内容。

在这个信息爆炸的时代，大多数平台都在想方设法争夺读者的注意力，而我们则希望用自己微薄的力量，给读者一个清爽的体验，让好文章被更多人看到，让更多的人看到自己想看的好文章。

我们心底始终有一个朴素的想法：**让每一篇有价值的文章可以帮到更多的从业者，从而能对世界产生一点点好的影响和改变。**

* * *

正文开始~

最近部门组织了一次前端性能优化交流会，大家从输入页面 URL 到最终页面展示内容这个过程提出了许多优化点。但同时发现很多同学对 HTTP 协议层的知识不能串联起来，于是整理了这篇文章，希望可以给大家带来一丝灵感。  

当我们在页面上发起一个 AJAX 请求的时候，在网络协议层面都经历了哪些内容？

```
// 发起请求fetch('https://baidu.com')// 协议层1...// 协议层2...// 协议层3....then(res=>  // 得到结果  console.log(res)})
```

如上述代码所示，我们对 `baidu.com` 发起了一个网络请求，最终在 then 方法中得到了具体的响应内容。

使用 Wireshark 抓包结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOM27eiaCiattnCddIJk66GwcTQGMRK5EOzjeibkZAZLj5QzX9ygx3t0Q1A/640?wx_fmt=png)

图中可以看到，请求 baidu.com 时，首先通过 TCP 3 次握手建立连接，然后通过 HTTP 传输内容，最后通过 TCP 4 次挥手断开连接。

真实的过程更加复杂，我们主要分析以下几点：

*   建立连接阶段
    

*   通过 IP 寻址找到目标服务器（网络层）
    
*   通过 Mac 寻址找到服务器硬件接口（数据链路层）
    
*   通过网线向服务器硬件接口传输比特信息（物理层）
    
*   DNS 域名解析（应用层）
    
*   建立 TCP 连接（传输层）
    

*   发送数据阶段
    

*   建立 SSL 安全连接（传输层）
    
*   发送 HTTP 请求（应用层）
    

建立连接阶段
------

要获取 baidu.com 的网页内容，就需要和 baidu 服务器建立连接，怎样建立这个连接呢？

1.  通过 DNS 获取 baidu 的 IP 地址。
    
2.  建立 TCP 连接。
    

### DNS 域名解析

通过 DNS 解析，我们就能找到 baidu 服务器对应的 IP 地址。

如图：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOm8ib4RnLBIARxYoJuUa0OcsHpL9DeUycf8Z2kPbKetMMjsK1YEwAlZw/640?wx_fmt=png)

经过 DNS 解析后，我们就能得到 baidu.com 的 IP 地址了：39.156.69.79 和 220.181.38.148，通常客户端会随机选中一个 IP 地址进行通信。

#### 域名的解析步骤

其实 IP 不一定要通过 DNS 解析才能获取，它通常会被客户端缓存，只有在 DNS 缓存都没有命中的时候才会请求 DNS 服务器。

判断步骤如下：

1.  判断浏览器是否有缓存 IP 地址。
    
2.  判断本机是否有缓存该 IP 地址，如：检查 Host 文件。
    
3.  判断本地域名解析服务器是否有缓存 IP 地址，如：电信，联通等运营商。
    
4.  向 DNS 根域名解析服务器，解析域名 IP 地址。
    
5.  向 DNS 二根域名解析服务器，解析域名 IP 地址。
    
6.  以此类推，最终获得 IP 地址。
    

### 建立 TCP 连接

有了 IP 地址之后，客户端和服务器端就能建立连接了，首先是建立 TCP 连接。

TCP 是一种面向连接的、**可靠的**、基于**字节流**的传输层通信协议。

在这一层，我们传输的数据会按照一个个的字节装入报文中，当报文的长度达到最大分段（MSS）时，就会发送这个报文。如果传输的报文很长，可能会被拆分成多个 TCP 报文进行传输。

TCP 报文头如下：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOqAqlN0kVibuv9pPbuzlYaib1wNFibGUb3gW3ziav8IUaCTNpPlXzia6x2hg/640?wx_fmt=png)

我们主要看以下几点：

*   源端口、目的端口。
    
*   序列号：seq，报文的唯一标识。
    
*   确认号：ack，报文的确认标识，便于确认 seq 是否已经收到。
    
*   TCP 标记：
    

*   SYN 为 1 表示这是连接请求或是连接接受请求。用于创建连接和同步序列号。
    
*   ACK 为 1 表示确认号字段有效。注意这里大写的 ACK 只是一个标记，和确认号 ack 并不相同。
    
*   FIN 为 1 表示要求释放连接。
    

*   窗口：表示发送方可以接收的字节数，即接收窗口大小，用于流量控制。
    

接下来，我们看一下 TCP 是怎样建立连接的？

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7L9icdzjNYAUiaCrjHys7vMrViaaibK6eOFLEWygx1NHfZLTB5j2bVJjX9ZSdq6mArAyy0XkYOFiaib0Htg/640?wx_fmt=png)

如图所示，建立 TCP 连接需要 3 个步骤，俗称三次握手。  

*   第一次握手：客户端向服务器端发送序列号 seq=x 的标识，表示开始建立连接。
    
*   第二次握手：服务器端回发一个 ack=x+1 的标识，表示确认收到第一次握手，同时发送自己的标识 seq=y。
    

*   客户端确认自己发出的数据能够被服务器端收到。
    

*   第三次握手：客户端发送 ack=y+1 的标识，标识确认收到第二次握手。
    

*   服务器端确认自己发出的数据能够被客户端收到。
    

经过了 3 次握手，即保证了客户端和服务器端都能正常发送和接收数据，TCP 连接也就建立成功了。

#### TCP 可靠传输原理

上文中说到，TCP 是可靠的传输，这是为什么呢？

这是因为 TCP 内部使用了 **停止等待协议 ARQ** ，它通过 **确认** 和 **重传** 机制，实现了信息的可靠传输。

例如：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibO7aX8Y9BdibiaQ7CicYHID19u5Mv5y6h33IPgd0XJrtxiae26icwMAYLEo7Q/640?wx_fmt=png)

*   客户端发送数据 M1
    
*   服务器端确认数据 M1 收到
    
*   客户端发送数据 M2
    
*   服务器端确认数据 M2 收到
    
*   依次类推 ...
    

在这期间，如果某一条数据很久都没有得到确认，客户端就会重传这条数据。这样一来，对于与每一次发送的数据，服务器端都得到了确认，即保证了数据的可靠性。

虽然 ARQ 可以满足数据可靠性，但每次只能发送和确认一个请求，效率太低了，于是就产生了连续 ARQ 协议。

**连续 ARQ 协议** 会连续发送一组数据，然后再批量等待这一组数据的确认信息，好比把单线程 ARQ 变成了多线程，大大提高了资源的利用效率。

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOgESc640pdVu5Piciav08Ytg5AxCIQdIlG4pJ5m11Hia5iaXssMtEibFb6qw/640?wx_fmt=png)

如：

*   客户端发送数据 M1、M2、M3、M4。
    
*   服务器端确认数据 M4 收到，表示 M4 及之前的数据都收到了。
    
*   客户端发送数据 M5、M6、M7、M8。
    
*   服务器端确认数据 M8 收到，表示 M8 及之前的数据都收到了。
    

在这个流程中，服务器端不需要对每一个数据都返回确认信息，而是接收到多个数据时一并确认，这个方式叫做 **累计确认**。

这里有个疑问，TCP 的每一次握手，是怎么找到目的服务器呢？

答：通过 IP 协议。

### 根据 IP 协议找到目标服务器

IP 协议的目的是实现网络层的数据转发，它通过路由器不断跳转，最终把数据成功送达目的地。

上文中的每一次 TCP 握手以及数据交互，都是通过 IP 协议去传输的。

IP 报文头如下：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7L9icdzjNYAUiaCrjHys7vMrViaD3iaRDRZ7pqZ4AawXNMx3UQGzCwibHJv2rzBRqLBnHHyDjzXW4qYKkg/640?wx_fmt=png)

我们关注以下两点就可以了：  

*   源 IP 地址
    
*   目的 IP 地址
    

发起一个 IP 请求执行流程如下：

1.  构建 IP 请求头（源 IP、目标 IP）。
    
2.  IP 协议通过算法，计算出一条通往服务器端的路径。
    
3.  发送端查询路由表，找出下一跳的 IP 地址（通常是路由器），并发送数据。
    
4.  路由器查询路由表，找出下一跳的 IP 地址，并发送数据。
    
5.  不断重复步骤 4，直到找到目的局域网。
    
6.  发送数据。
    

> 路由表存在于计算机或路由器中，由目的 IP 地址、子网掩码、下一跳地址、发送接口四部分组成。通过目的 IP 地址，即可找到下一跳的地址，进行转发。

例如：A 要向 G 发送 IP 数据。

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOPTibAXtXqquwicGqREhp55ibFYam7VTbsHtpQUibfEsyy0muJ5fEeta6sQ/640?wx_fmt=png)

具体流程如下：

*   A 生成 IP 头部（源 IP：A ，目的 IP：G）
    

*   A 查询路由表，发现下一跳为 B，于是把数据传给 B。
    

*   B 生成 IP 头部（源 IP：A ，目的 IP：G）
    

*   B 查询路由表，发现下一跳为 E，于是把数据传给 E。
    

*   E 生成 IP 头部（源 IP：A ，目的 IP：G）
    

*   E 查询路由表，发现下一跳为 G，于是把数据传给 G。
    

*   到达目的地 G。
    

你是否有疑惑，为什么 IP 会按照这条路径向 G 传输数据呢？

其实，上图中的路径并非只有一条，我们通过 ABEG 到达了目的地 G，同样也可以通过 ABCFHG 到达 G，这两种路径都能完成任务，为什么 IP 不选择 ABCFHG 这条路径呢？

这就涉及到了 IP 寻址的算法。

#### IP 寻址算法

我们可以把网络中的所有计算机都看做是一个点，计算机之间的连接看做是一条线，这些点和线就组合成了一个图。

例如：

![](https://mmbiz.qpic.cn/mmbiz_jpg/SM05zvmibH7L9icdzjNYAUiaCrjHys7vMrVHvdPlrBm8A9mfW9nqIxlVbMbQo6KZwNfqcUicPQHLFK5C3jmSo0H9gQ/640?wx_fmt=jpeg)

通过上图，我们就把复杂的网络转化成了数学问题。IP 寻址算法，其实就是图论中的最短路径的算法。  

最短路径算法在 IP 协议中有 2 种实现：

*   RIP 协议
    

*   每个节点中都保存有其他节点的位置信息（跳数和下一跳的 IP）。
    
*   通过和邻居节点进行数据交换，更新自己到目的地的最短距离，不断重复，即可得到起点到终点的最短路径。
    
*   实现简单，开销很小，适用于小型网络。
    
*   使用距离矢量算法，**确保 IP 路由跳转的次数最小**。
    
*   原理
    

*   OSPF 协议
    

*   从起始点开始，采用贪心算法的策略，每次遍历到始点距离最近且未访问过的顶点的邻接节点，直到扩展到终点为止。
    
*   适用于大型网络。
    
*   使用迪杰斯特拉算法，**确保 IP 路由跳转的速度最快**。
    
*   原理
    

通过以上两个协议，我们就能找到通往目的地的路径了。

这里抛出一个问题：IP 数据是怎样从一个路由器跳到另一个路由器呢？

答：通过以太网协议。

### 通过 Mac 寻址找到服务器硬件接口

IP 协议主要是用来寻找最优路径的，具体的传输是由以太网协议来做的。

以太网属于数据链路层，它主要负责相邻设备的通信。原理是通过查询交换机 Mac 表，找到通信双方的物理接口，进而开始通信。

以太网报文头如下：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOOloRAzcDYXgvWIKOXXTFPBxn5Tnx1h87u6u5LfxDb21FUaia71Ss6WQ/640?wx_fmt=png)

我们只用关心以下 3 个点：

*   源 Mac 地址
    
*   目的 Mac 地址
    
*   校验码 CRC：校验当前帧是否有效。
    

可以看到，以太网层都是通过 Mac 地址进行通信的，这里的 Mac 地址是哪里来的呢？

答：通过 ARP 协议。

**ARP 协议** 是一个通过解析 IP 地址来找寻 Mac 地址的协议。IP 地址转换成 Mac 地址后，就能进行以太网数据传输了。

例如：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOqoUQa4r0mM1U3wgvYPGHawp5ryMNXMorZU1T9aJItFVDtSHfCODQNg/640?wx_fmt=png)

当机器 A 向机器 C 发送数据时：

*   A 构建以太网报文（源地址：A，目的地址：C），并通过网卡发出数据帧。
    
*   数据帧到达交换机 B，交换机取出目的地址 C 的 Mac 地址。
    
*   B 查询 Mac 表，根据目的地 Mac 地址，匹配 C 的硬件接口。
    

*   如果找到 C 的硬件接口，发送数据。
    
*   如果未找到 C 的硬件接口，向 B 直连的所有机器发送广播信息找 C，找到后会把 C 记录到 Mac 表中。
    

经过上述的流程，我们就找到了目的机器的硬件接口。

通过以太网协议，我们找到了目标机器的硬件接口，接下来要怎么发送信息呢？

答：通过物理层。

### 通过网线向服务器硬件接口传输比特信息

在没有 WiFi 的年代，我们只能通过插网线来进行上网，网线其实就是物理层的设备之一。

网线可以由多种材料组成，最常见的就是光纤和电缆。

光纤和电缆的传输原理类似，都是通过两个信号来模拟二进制数据的，一个信号即为一个比特。

*   电缆中：高电位表示 1 ，低点位表示 0。
    
*   光纤中：光亮表示 1，光熄灭表示 0。
    

如：在光纤中，我们通过观察光的闪动，即可得知传输的二进制数据。

有了这些物理设备，我们就能把复杂的数据转换成光信号或者电信号进行传输了。

发送数据阶段
------

发送数据可以分为两个步骤：

*   建立安全层 SSL
    
*   发送 HTTP 请求
    

### 建立安全层 SSL

本文的案例是发送一个 HTTPS 的请求，所以在发送数据之前，会创建一个 SSL 安全层，用于数据加密。

通常的加密方法有两种：

*   非对称加密
    

*   A 有钥匙，B 没有钥匙，且他们都有一个公共的锁，B 给 A 发送数据时，都会先把数据锁起来再发送。
    
*   接收数据时，A 用钥匙解开锁，即可得到数据。除 A 以外，其他人没有钥匙，也就获取不到数据。
    
*   实现了单向通信加密。
    

*   对称加密
    

*   A、B 双方都有一把相同的钥匙和一个公共的锁，每次发送数据时，都把数据放在锁里进行发送。
    
*   接收数据时，A、B 双方就用各自的钥匙来解锁。其他人没有钥匙，也就获取不到数据。
    
*   实现了双向通信加密。
    

互联网通信是双向的，所以我们需要使用对称加密，可是，怎样才能保证通信双方都有一把相同的钥匙呢？

目前的解决方案：

*   先使用非对称加密，进行秘钥协商，让通信双方拿到相同的钥匙。
    
*   然后使用对称加密，进行加密传输。
    

秘钥协商过程如图：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibOfUCI9aN0xicYP8Kp1stmjfdzaro3NVVnDFaUciaDFibj3vn0hhj5wto1w/640?wx_fmt=png)

图中划重点：

1.  客户端发送自身支持的加密算法。
    
2.  服务器端选择一种加密算法，同时返回数字证书。
    
3.  客户端确认证书有效。
    
4.  客户端生成随机数，并使用证书中的服务器公钥加密，然后发送给服务器。
    
5.  服务器端使用私钥解密，获得随机数。
    
6.  双方使用第 2 步确定的加密算法，把随机数进行加密，即可获得相同的对称加密秘钥。
    

Ok，秘钥协商之后，我们的 SSL 安全层也就建好了。

秘钥协商时存在一个问题：

> 秘钥协商时，怎么保证是和真正的服务器在协商，而不是一个中间人呢？
> 
> 答：**数字证书**。

数字证书重点关注 2 个部分：

*   服务器公钥
    
*   数字签名
    

其中，数字签名又是由服务器公钥和证书私钥加密生成的，目的是为了防止服务器公钥被篡改。

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7L9icdzjNYAUiaCrjHys7vMrVwI6mqIECJdtwQYNjKfYnU8qIeatWmsyXSRWP8aibv1zDNcQJo8yia3dg/640?wx_fmt=png)

有了数字证书，客户端就能通过验证证书，来判断服务器是否是真正的服务器了。  

验证逻辑如下：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7L9icdzjNYAUiaCrjHys7vMrVDZicM8WzylfjreSicVhcp9zGUaf5HkzOgOgTwkb8F2sCLYaqcJcYKfyw/640?wx_fmt=png)

可以看到，数字证书通过同样的算法进行解密，如果得到相同的信息摘要，就能保证数据是有效的，如果不一致，则会验证失败，拒绝后续的请求。  

到这里为止，所有的准备工作都就绪了，接下来才是发送 HTTP 请求。

### 发送 HTTP 请求

HTTP 协议其实就是制定了一个通信规则，规定了客户端和服务器之间的通信格式。

以请求 baidu 首页为例：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7Lj72L1qjA4aJpDSCzVOiaibO0qHibtlSTZvWsou5YWpW7E1voe6aqKibhJDLsiaGdh41VoXyAq8gzbBtg/640?wx_fmt=png)

如上图所示，发起 HTTP 请求时，必须遵守以下规则：

*   请求方法（必填） `GET`
    
*   请求地址（必填） `/`
    
*   HTTP 协议版本（必填） `1.1`
    
*   其他 HTTP 头部字段（可选） `Host`、`User-Agent`、`Accept`
    
*   请求参数，放在空行后面（可选）
    

服务器响应请求时，同样遵守了 HTTP 响应规则：

*   HTTP 协议版本（必填） `1.1`
    
*   响应状态码（必填） `200`
    
*   状态码描述（必填） `OK`
    
*   其他 HTTP 头部字段（可选） `Date`、`Server`、`ETag`、`Last-Modified` 等
    
*   请求参数，放在空行后面（可选）
    

只要我们遵守这个规则，就能进行 HTTP 通信了。

到目前为止，我们已经分析完成了数据请求的所有过程，你是否都理解了呢？

思考与总结
-----

本文通过一个网络请求，对整个 HTTP、TCP、IP、以太网等协议进行了流程化分析，最后再梳理一下：

1.  请求 baidu.com。
    
2.  DNS 解析 baidu.com，得到 IP 地址。
    
3.  建立 TCP 连接。
    
4.  IP 协议通过算法，计算出一条通往服务器最优路径。
    
5.  IP 沿着路径跳转时，会通过 ARP 协议把 IP 地址转换成 Mac 地址。
    
6.  以太网通过 Mac 地址，找到通信双方的硬件接口。
    
7.  物理层通过网线作为载体，在两个硬件接口之间传输比特信号。
    
8.  TCP 连接建立完毕。
    
9.  建立 SSL 安全层。
    
10.  发送 HTTP 请求。
    

最后，如果你对此有任何想法，欢迎留言评论！

关于奇舞周刊
------

《奇舞周刊》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6j9X9s2kibfaicBLmIm6dUBqymVmiaKqGFEPn0G3VyVnqQjvognHq4cMibayW2400j4OyEtdz5fkMbmA/640?wx_fmt=jpeg)