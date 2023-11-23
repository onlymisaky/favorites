> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/M8Ew7xKStiGEnhGgCq5YPA)

HTTP 缓存，对于前端的性能优化方面来讲，是非常关键的，从缓存中读取数据和直接向服务器请求数据，完全就是一个在天上，一个在地下。  

我们最熟悉的是 HTTP 服务器响应返回状态码 304，304 代表表示告诉浏览器，本地有缓存数据，可直接从本地获取，无需从服务器获取浪费时间。

至于为什么被缓存，如何命中缓存以及缓存什么时候生效的，我们却很少在实际开发中去了解。今天小鹿借助动画形式来从根上理解 HTTP 缓存机制及原理。

为什么会有缓存？

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/FEmQgMwfXVsSb099Msr61XWFegcWtRPvVD50JPq3fkLB5afjIcPyyiaWstxpWy2nb2ibExWYicpFHv89ibEr0Q77GA/640?wx_fmt=png)

  

单纯的从计算机角度去说，比较抽象，咱们看一个实际的例子。比如，我们通常喜欢把没看完的书放在书架上，而看完以及没有看的书放在箱子中保存。

如果我们把所有的书保存在箱子中，每次看书都要去箱子中找，所以非常麻烦和耗时 (这里的箱子，可以想象成服务器)。

当我们开始看新书时，第一次从箱子中取出，看了一半，然后我们直接放到书架上，当下次再看书的时候，直接从书架中取出，这里的书架，就是我们下边要讲到的缓存（一个缓存仓库）。

缓存的 “龟” 则

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/FEmQgMwfXVsSb099Msr61XWFegcWtRPvVD50JPq3fkLB5afjIcPyyiaWstxpWy2nb2ibExWYicpFHv89ibEr0Q77GA/640?wx_fmt=png)

  

当浏览器发出请求到数据请求回来的过程，就像是上述中的取书过程。

浏览器在加载资源时，根据请求头的 Expires 和 Cache-control 判断是否命中强缓存，是则直接从缓存读取资源，不会发请求到服务器。

如果没有命中强缓存，浏览器一定会发送一个请求到服务器，通过 Last-Modified 和 Etag 验证资源是否命中协商缓存，如果命中，服务器会将这个请求返回，但是不会返回这个资源的数据，依然是从缓存中读取资源。

如果前面两者都没有命中，直接从服务器加载资源。

动画演示

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/FEmQgMwfXVsSb099Msr61XWFegcWtRPvVD50JPq3fkLB5afjIcPyyiaWstxpWy2nb2ibExWYicpFHv89ibEr0Q77GA/640?wx_fmt=png)

  

![图片](https://mmbiz.qpic.cn/mmbiz_gif/PBvaiaq3IUfpNafBp38Uc8an9GgsuhXqMZAxY8yIbQMPbUjmEVTK1smGY8OltibQ0wjypVwY9HXtuMiaicvFgKBlWQ/640?wx_fmt=gif)

HTTP 缓存分类

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/FEmQgMwfXVsSb099Msr61XWFegcWtRPvVD50JPq3fkLB5afjIcPyyiaWstxpWy2nb2ibExWYicpFHv89ibEr0Q77GA/640?wx_fmt=png)

  

上述讲到，HTTP 是有 “龟” 则的，根据浏览器是否向服务器发起请求来分为**强缓存和协商缓存**。

_**1、**_**强缓存**

强缓存的意思就是不向服务器发起请求的缓存，也就是本地强制缓存。浏览器想要获取特定数据的时候，首先会检查一下本地的缓存是否存在该数据，如果存在，就直接在本地获取了，如果不存在，就向服务器所要该数据。

详细请求过程如下动画所示:

![图片](https://mmbiz.qpic.cn/mmbiz_gif/PBvaiaq3IUfpNafBp38Uc8an9GgsuhXqMlW0opEvNESWclV5OlmJMd0q60ibCmGb4PsG7Ewrm1ib9hjdyOCGpjeUQ/640?wx_fmt=gif)

![图片](https://mmbiz.qpic.cn/mmbiz_gif/PBvaiaq3IUfpNafBp38Uc8an9GgsuhXqM0qDpmia77MvBmsWcGibQNIiah0UUoyarmRAh8LibA8CmpfLPZKZBcKbB0w/640?wx_fmt=gif)

那么问题来了，如果我们想使用强缓存，那怎么判断缓存数据什么时候失效呢？

当浏览器向服务器请求数据的时候，服务器会将数据和缓存的规则返回，在响应头的 header 中，有两个字段 Expires 和 Cache-Control。

**Expires**

```
1expires: Wed, 11 Sep 2019 16:12:18 GMT
```

在响应头中 Expires 字段的意思是，当前返回数据的缓存到期时间戳。当浏览器在进行请求的时候，会那浏览器本地的时候和这个时间做对比，判断资源是否过期。

但是上述存在一个问题就是，如果我手动改变了电脑的时间，那么就会出现问题，这也是 HTTP1.0 中存在的问题。

**Cache-Control**

为了解决这个问题，在 HTTP1.1 中增加了 Cache-Control 这个字段。

```
1Cache-Control:max-age=7200
```

服务器和客户端说，这个资源缓存只可以存在 7200 秒，在这个时间段之内，你就可以在缓存获取资源。

如果 Expire 和 Cache-control 两者同时出现，则以 Cache-control 为主

除此之外，cache-control 还有其他字段可以使用。

```
1cache-control: max-age=3600, s-maxage=31536000
```

*   **Public**：只要为资源设置了 public，那么它既可以被浏览器缓存，也可以被代理服务器缓存；
    
*   **Private(默认值)**：则该资源只能被浏览器缓存。
    
*   **no-stor****e：**不使用任何缓存，直接向服务器发起请求。
    
*   **no-cache：**绕开浏览器缓存（每次发起请求不会询问浏览器缓存），而是直接向服务器确认该缓存是够过期。
    

_**2、**_**协商缓存**

浏览器第一次请求数据时，服务器会将缓存标识与数据一起返回给客户端，客户端将二者备份至缓存数据库中。

  
再次请求数据时，客户端将备份的缓存标识发送给服务器，服务器根据缓存标识进行判断，判断成功后，返回 304 状态码，通知客户端比较成功，可以使用缓存数据。

![图片](https://mmbiz.qpic.cn/mmbiz_gif/PBvaiaq3IUfpNafBp38Uc8an9GgsuhXqMiaiapy8hTCDZNxFVN4icicY6adCO2hicfNDPhdvh5XLCe86I39BkMDTe0wQ/640?wx_fmt=gif)

![图片](https://mmbiz.qpic.cn/mmbiz_gif/PBvaiaq3IUfpNafBp38Uc8an9GgsuhXqM5HicOpfMd1gt63o23gZNvLC8WVgTDicwVqvD2CN0UlKRo7MefRxporEg/640?wx_fmt=gif)

```
1// 命中缓存的响应字段2Request Method:GET3Status Code: 304 Not Modified
```

怎么来识别协商缓存的？主要通过报文头部 header 中的 Last-Modified，If-Modified-Since 以及 ETag、If-None-Match 字段来进行识别。

**Last-Modified** 

Last-Modified 字段的意思是服务器资源的最后修改时间。第一次请求服务器，服务器的头部字段可增加这个字段，用于设置协商缓存。

```
1Last-Modified: Fri, 27 Oct 2017 06:35:57 GMT
```

当浏览器再次发起请求的时候，首部字段增加 If-Modified-Since 本地时间戳字段发给服务器。

```
1If-Modified-Since: Fri, 27 Oct 2017 06:35:57 GMT
```

服务端接收到请求之后，就拿 If-Modified-Since 字段值和本身的过期时间对比。

如果请求头中的这个值小于最后修改时间，返回的 304 响应，让其在本地浏览器缓存取出数据。如果时间过期，并在 Response Headers 中添加新的 Last-Modified 值返回给浏览器。

但是 Last-Modified 存在一个局限性，有以下两种情况：

不该请求，还会请求。编辑了文件，文件内容没有变，但是服务器确认为我们改动了文件，所以重新设置了缓存时间，当做新请求返回给浏览器。

该请求，反而没有请求。修改文件速度很快，快过 If-Modified-Since 字段时间差的检测，文件虽然改动了，但是并没有重新生成新的资源。

**ETag**

ETag 代表的意思是标识字符串。由于上述 Last-Modified 字段存在的缺陷，所以在 HTTP / 1.1  我们对资源进行内容编码，只要内容被改变，这个编码就不同。

和上述请求原理一样，浏览器首次发起请求，然后服务器在响应头返回一个标识字符串。

```
1ETag: W/"2a3b-1602480f459"
```

浏览器再次发起请求，携带一个值相同的字符串。

```
1If-None-Match: W/"2a3b-1602480f459"
```

服务端接收到该字符串就会作对比，如果相同，则让其读取本地缓存，否则，将新的资源返回给浏览器端。

缓存位置

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/FEmQgMwfXVsSb099Msr61XWFegcWtRPvVD50JPq3fkLB5afjIcPyyiaWstxpWy2nb2ibExWYicpFHv89ibEr0Q77GA/640?wx_fmt=png)

  

缓存的位置按照获取资源请求优先级，缓存位置依次如下：

*   Memory Cache（内存缓存）
    
*   Service Worker（离线缓存）
    
*   Disk Cache（磁盘缓存）
    
*   Push Cache（推送缓存）
    

**Memory Cache**

Memory 为内存缓存，是浏览器最先尝试命中的缓存，也是响应最快的缓存。但是存活时间最短的，当进程结束后，tab 标签关闭后，缓存就不存在了。

![图片](https://mmbiz.qpic.cn/mmbiz_png/PBvaiaq3IUfpNafBp38Uc8an9GgsuhXqM8AjLx4blNJ1zPicqJB5YOA0y89oQz385c9ia1ComRY9Rd3r8EkacYTZA/640?wx_fmt=png)

因为内存空间比较小，通常较小的资源放在内存缓存中，比如 base64 图片等资源。

**Service Worker**

Service Worker 是一种独立于主线程之外的 Javascript 线程。它脱离于浏览器窗体，因此无法直接访问 DOM。

可以帮我们实现离线缓存、消息推送和网络代理等功能。

**Disk Cache**

内存的优先性，导致大文件不能缓存到内存中，那么磁盘缓存则不同。虽然存储效率比内存缓存慢，但是存储容量和存储市场有优势。

**Push Cache**

它是最后一道缓存命中，属于 HTTP2 的内容。如果感兴趣的同学，可以先去了解了解。

### **❤️ 看完三件事**

如果你觉得这篇内容对你挺有启发，我想邀请你帮我三个小忙：

1.  点个「**在看**」，让更多的人也能看到这篇内容（喜欢不点在看，都是耍流氓 -_-）
    
2.  关注我的官网 **https://**m******uyiy.cn**，让我们成为长期关系
    
3.  关注公众号「**高级前端进阶**」，公众号后台回复「**面试题**」 送你高级前端面试题，回复「**加群**」加入面试互助交流群
    

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)

》》面试官都在用的题库，快来看看《《