> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CU9mOxVixaOann9Hu5MlXQ)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

HTTP 协议
-------

HTTP（Hyper Text Transfer Protocol）协议是**超文本传输协议**的缩写，它是从 WEB 服务器传输超文本标记语言 (HTML) 到本地浏览器的传送协议，位于 OSI 网络模型中的`应用层`

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiaDPSzibrnpfG9z8QCGUSCBiceJgutOle4Rw8pAibBe8Ulibqd4Vosbv3YpA/640?wx_fmt=png)

HTTP 是一个基于 TCP/IP 通信协议来传递数据的协议，传输的数据类型为 HTML 文件、图片文件、查询结果等。

HTTP 协议一般用于 B/S 架构。浏览器作为 HTTP 客户端通过 URL 向 HTTP 服务端即 WEB 服务器发送所有请求。

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiaMVD5xzvL6XpO35icVG9ibLDIpicv31hj8ic0COVPUasOEiaXgKSvE9E9wQg/640?wx_fmt=jpeg)

### HTTP 特点

*   HTTP 协议支持客户端 / 服务端模式，也是一种请求 / 响应模式的协议
    
*   **简单快速：** 客户向服务器请求服务时，只需传送请求方法和路径。请求方法常用的有 GET、HEAD、POST
    
*   **灵活：** HTTP 允许传输任意类型的数据对象。传输的类型由 Content-Type 加以标记。
    
*   **无连接：** 限制每次连接只处理一个请求。服务器处理完请求，并收到客户的应答后，即断开连接，但是却不利于客户端与服务器保持会话连接，为了弥补这种不足，产生了两项记录 http 状态的技术，一个叫做 Cookie, 一个叫做 Session。
    
*   **无状态：** 无状态是指协议对于事务处理没有记忆，后续处理需要前面的信息，则必须重传。
    

HTTP 中间人攻击
----------

HTTP 协议使用起来确实非常的方便，但是它存在一个致命的缺点：`不安全`。

我们知道 HTTP 协议中的报文都是以明文的方式进行传输，不做任何加密，这样会导致中间人攻击

例如：小明 JAVA 贴吧发帖，内容为 `我爱JAVA`：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiafnXcRJlI5Lw9oNvVqI69qMM5391N4RrJkE5ibY5wpPhx9PJAbVaVhjA/640?wx_fmt=png)

被中间人进行攻击，内容修改为 `我爱PHP`

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiacQP42ia2cFIkzic6DBV0jPiaic4cfibDPZ0dZCfwIqUb97MLwnibxXevPahg/640?wx_fmt=png)

服务器接收到的就是错误的信息：`我爱PHP`

除此之外，请求信息也容易被窃听截取、冒充

### 如何防止中间人攻击

既然 HTTP 是明文传输，那我们家加密不就好了

#### 对称加密

`对称加密` 很好理解，即加密和解密使用的同一个密钥，是 `对称` 的。只要保证了密钥的安全，那整个通信过程就可以说具有了机密性。

举个例子，你想要登录某网站，只要事先和它约定好使用一个对称密钥，通信过程中传输的全是用密钥加密后的密文，只有你和网站才能解密。黑客即使能够窃听，看到的也只是乱码，因为没有密钥无法解出明文，所以就实现了机密性。

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiaT92WThhic0j1dickztBlmmVXWnqIxgl2Zl2NpE8Idf91MUg52HYicwUiag/640?wx_fmt=png)

**缺点：** 这种加密方式固然很好，但是问题就在于如何让双方知道秘钥，术语叫 “密钥交换”。因为传输数据都是走的网络，如果将秘钥通过网络的方式传递的话，一旦秘钥被截获就没有加密的意义的。

#### 非对称加密

也叫公钥加密算法，它有两个密钥，一个叫 `公钥`（public key），一个叫 `私钥`（private key）。两个密钥是不同的，`不对称`，公钥可以公开给任何人使用，而私钥必须严格保密。

公钥和私钥有个特别的 `单向` 性，虽然都可以用来加密解密，但公钥加密后只能用私钥解密，反过来，私钥加密后也只能用公钥解密。

**非对称加密可以解决 `密钥交换` 的问题。网站秘密保管私钥，在网上任意分发公钥，你想要登录网站只要用公钥加密就行了，密文只能由私钥持有者才能解密。而黑客因为没有私钥，所以就无法破解密文。**

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiazxdgZLYt1OS5IAeic1ynp9n7qc8hvxDJPOKnxwSTbuGpU9Hslg4GLgA/640?wx_fmt=png)

这种加密方式就可以完美解决对称加密存在的问题。假设现在两端需要使用对称加密，那么在这之前，可以先使用非对称加密交换秘钥。

简单流程如下：首先服务端将公钥公布出去，那么客户端也就知道公钥了。接下来客户端创建一个秘钥，然后通过公钥加密并发送给服务端，服务端接收到密文以后通过私钥解密出正确的秘钥，这时候两端就都知道秘钥是什么了。

**那么这样做就是绝对安全了吗？**

中间人为了对应这种加密方法又想出了一个新的破解方案，既然拿不到 `私钥` ，我就把自己模拟成一个客户端和服务器端的结合体，

*   在 `用户->中间人` 的过程中，**中间人模拟服务器的行为** ，这样可以拿到用户请求的明文
    
*   在 `中间人->服务器` 的过程中中间人模拟客户端行为，这样可以拿到服务器响应的明文
    

这一次通信再次被中间人截获，中间人自己也伪造了一对公私钥，并将公钥发送给用户以此来窃取客户端生成的 `私钥` ，在拿到 `私钥` 之后就能轻松的进行解密了。

还是没有彻底解决中间人攻击问题，怎么办喃？接下来我们看看 HTTPS 是怎么解决通讯安全问题的。

HTTPS
-----

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiaPF6rrJuKgrH6qKfItLlpr1c09sb5bJh8ToEeRWXGFS7mLlOQ197Nmg/640?wx_fmt=png)

HTTPS 并非是应用层的一种新协议，其实是 HTTP+SSL/TLS 的简称

**HTTP 和 HTTPS 的区别：**

*   HTTP 是超文本传输协议，信息是明文传输，HTTPS 则是具有安全性的 TLS（SSL）加密传输协议
    
*   HTTP 和 HTTPS 使用的是完全不同的连接方式，用的端口也不一样，前者是 80，后者是 443
    
*   HTTP 的连接很简单，是无状态的；HTTPS 协议是由 HTTP+SSL/TLS 协议构建的可进行加密传输、身份认证的网络协议，比 HTTP 协议安全。
    

### SSL/TSL

SSL 即安全套接层（Secure Sockets Layer），在 OSI 模型中处于第 5 层（会话层），SSL 发展到 v3 时改名为 TLS（传输层安全，Transport Layer Security），正式标准化，版本号从 1.0 重新算起，所以 TLS1.0 实际上就是 SSL v3.1。

到今天 TLS 已经发展出了三个版本，分别是 2006 年的 1.1、2008 年的 1.2 和去年（2018）的 1.3。1.2 版本用的最广泛

HTTPS 通过了 HTTP 来传输信息，但是信息通过 TLS 协议进行了加密

TLS 协议位于传输层之上，应用层之下。首次进行 TLS 协议传输需要两个 RTT ，接下来可以通过 Session Resumption 减少到一个 RTT

在 TLS 中使用了两种加密技术，分别为：对称加密和非对称加密，内容传输的加密上使用的是对称加密，非对称加密只作用在证书验证阶段：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiam10fvVFgNuG8GbgLc2Dvx4YvVbbdU6tAQvD5Nqz5a1ZNDQU7eZcOPg/640?wx_fmt=png)

服务器是通过 SSL 证书来传递 `公钥`，客户端会对 SSL 证书进行验证，其中证书认证体系就是确保 `SSL` 安全的关键，接下来我们就来讲解下 `CA 认证体系` ，看看它是如何防止中间人攻击的？

### CA 认证体系

#### 权威认证机构

在 CA 认证体系中，所有的证书都是由权威机构来颁发，而权威机构的 CA 证书都是已经在操作系统中内置的，我们把这些证书称之为`CA根证书`

#### 签发证书

我们将服务器生成的公钥和站点相关信息发送给 `CA签发机构` ，再由`CA签发机构`通过服务器发送的相关信息用 `CA签发机构` 进行加签，由此得到我们应用服务器的证书，证书会对应的生成证书内容的 `签名` ，并将该 `签名` 使用 `CA签发机构` 的私钥进行加密得到 `证书指纹` ，并且与上级证书生成关系链。

这里我们把百度的证书下载下来看看：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRiaHljrNAyKCuHvUJ8Z2gxE0TdgL56vtt9CwsAnBRxDUnzphAEwhVPz4w/640?wx_fmt=png)

可以看到百度是受信于 `GlobalSign G2`，同样的 `GlobalSign G2` 是受信于`GlobalSign R1` ，当客户端 (浏览器) 做证书校验时，会一级一级的向上做检查，直到最后的 `根证书` ，如果没有问题说明`服务器证书`是可以被信任的。

#### 如何验证服务器证书

那么客户端 (浏览器) 又是如何对 `服务器证书` 做校验的呢，首先会通过层级关系找到上级证书，通过上级证书里的 `公钥` 来对服务器的 `证书指纹` 进行解密得到`签名(sign1)` ，再通过签名算法算出服务器证书的 `签名(sign2)` ，通过对比 `sign1` 和 `sign2` ，如果相等就说明证书是没有被`篡改`也不是`伪造`的。

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlmDs4r1uzu0kSbjpKMfNRialpULiaSDr2vabsGO0ATicxJy7HAazBThmvRlEg9xicrEytHphtfIAdz1w/640?wx_fmt=png)

这样通过证书的认证体系，我们就可以避免了中间人攻击从而发起拦截和修改 HTTP 通讯的报文。

使用 HTTPS 会被抓包吗？
---------------

HTTPS 的数据是加密的，常规下抓包工具代理请求后抓到的包内容是加密状态，无法直接查看。

但是，正如前文所说，浏览器只会提示安全风险，如果用户授权仍然可以继续访问网站，完成请求。因此，只要客户端是我们自己的终端，我们授权的情况下，便可以组建中间人网络，而抓包工具便是作为中间人的代理。通常 HTTPS 抓包工具的使用方法是会生成一个证书，用户需要手动把证书安装到客户端中，然后终端发起的所有请求通过该证书完成与抓包工具的交互，然后抓包工具再转发请求到服务器，最后把服务器返回的结果在控制台输出后再返回给终端，从而完成整个请求的闭环。

**既然 HTTPS 不能防抓包，那 HTTPS 有什么意义？**HTTPS 可以防止用户在不知情的情况下通信链路被监听，对于主动授信的抓包操作是不提供防护的，因为这个场景用户是已经对风险知情。要防止被抓包，需要采用应用级的安全防护，例如采用私有的对称加密，同时做好移动端的防反编译加固，防止本地算法被破解。

总结
--

我们由 HTTP 中间人攻击的来了解到 HTTP 为什么是不安全的，然后再从安全攻防谈到 HTTPS 的原理概括，最后谈一下 HTTPS 抓包问题，希望能让大家对 HTTPS 有个更深刻的了解。

#### 参考：

*   极客时间：透视 HTTP 协议
    
*   [面试官：为什么 HTTPS 是安全的](https://mp.weixin.qq.com/s?__biz=MzUzNjk5MTE1OQ==&mid=2247492443&idx=3&sn=031c430ca49764321d9303e76f2fa6b8&scene=21#wechat_redirect)
    

来自：https://github.com/Advanced-Frontend/Daily-Interview-Question

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持