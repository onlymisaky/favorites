> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bm21kTKul7_TWW0hOi0LzQ)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

常见的 HTTP 缓存首部字段有：

*   Expires：响应头，代表该资源的过期时间
    
*   Cache-Control：请求 / 响应头，缓存控制字段，精确控制缓存策略
    
*   If-Modified-Since：请求头，资源最近修改时间，由浏览器告诉服务器
    
*   Last-Modified：响应头，资源最近修改时间，由服务器告诉浏览器
    
*   Etag：响应头，资源标识，由服务器告诉浏览器
    
*   If-None-Match：请求头，缓存资源标识，由浏览器告诉服务器
    

其中， **强缓存** ：

*   Expires（HTTP/1.0）
    
*   Cache-Control（HTTP/1.1）
    

**协商缓存：**

*   Last-Modified 和 If-Modified-Since（HTTP/1.0）
    
*   ETag 和 If-None-Match（HTTP/1.1）
    

缓存过程分析
------

浏览器与服务器通信的方式为应答模式，即浏览器发起 HTTP 请求，服务器响应请求。在浏览器第一次发起请求时，会根据响应报文中 HTTP 头的缓存标识，决定是否缓存结果，如果是则将请求结果和缓存标识存入浏览器缓存中，简单的过程如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vKuSUm1wIPX1Y4DwTXWam14OPt03q2H6sk7qwtZwtgzxsot7w8x32iakg/640?wx_fmt=png)

由上图我们可以知道：

*   浏览器每次发起请求，都会先在浏览器缓存中查找该请求的结果以及缓存标识
    
*   浏览器每次从服务器端拿到返回的请求结果，都会将该结果和缓存标识存入浏览器缓存中
    

以上两点结论就是浏览器缓存机制的关键，它确保了每个请求的缓存存入与读取，只要我们再理解浏览器缓存的使用规则，那么所有的问题就迎刃而解了

本文也将围绕着这点进行详细分析。为了方便大家理解，这里我们根据是否需要向服务器重新发起 HTTP 请求将缓存过程分为两个部分，分别是：

*   **强缓存：** 向浏览器缓存查找该请求结果，并根据该结果的缓存规则来决定是否使用该缓存结果的过程
    
*   **协商缓存：** 强缓存失效后，浏览器携带缓存标识向服务器发起请求，由服务器根据缓存标识决定是否使用缓存的过程
    

强缓存（缓存控制）
---------

强缓存表示在缓存期间是否使用缓存（缓存是否有效），需不需要重新发送 HTTP 请求

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vKlvia4MhqDMV1G8ALGyhX09HWICDX5OPNXfInsbicHaQ2V1RYyyes7aPQ/640?wx_fmt=png)

控制强缓存的字段分别是 `Expires` 和 `Cache-Control` ，其中 `Cache-Control` 优先级比 `Expires` 高

### Expires（HTTP/1.0）

值为服务器返回该请求结果缓存的到期时间:

```
Expires: Wed, 22 Oct 2018 08:41:00 GMT
```

表示资源会在 Wed, 22 Oct 2018 08:41:00 GMT 后过期，需要再次请求。

并且 Expires 受限于客户端时间，如果修改了客户端时间，可能会造成缓存失效。

所以现在 HTTP/1.1 中新增了 `Cache-Control`

### Cache-Control（HTTP/1.1）

```
Cache-control: max-age=30
```

该属性值表示资源会在 30 秒后过期，需要再次请求。也就是说在 30 秒内如果再次发起该请求，则会直接使用缓存，强缓存生效。

它与 Expires 相比：

*   HTTP 响应报文中 Expires 的时间值，是一个绝对值
    
*   HTTP 响应报文中 Cache-Control 为 max-age=600 ，是相对值（解决 Expires 受限于客户端时间）
    

除了 `max-age` ，它还有以下取值：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vKyQ2ISXAkqTS4nEvHB0ibk5Vq8nn2XF0NW5d5DiaiaMx41Myq34HqXD7lA/640?wx_fmt=png)

注意下面的 `no-cache` ，资源依然会被缓存，并且这个缓存要服务器验证后才可以使用

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vKfu1jEcpKB7GLNRdmD3coHaZJLx6uuwglLT9jOXhYlyIbGYNVU41gFQ/640?wx_fmt=png)

#### max-age=0 和 no-cache 等价吗？

从规范的字面意思来说，max-age 到期是 应该 (SHOULD) 重新验证，而 no-cache 是 必须 (MUST) 重新验证。但实际情况以浏览器实现为准，大部分情况他们俩的行为还是一致的。（如果是 max-age=0, must-revalidate 就和 no-cache 等价了）

### 总结

自从 HTTP/1.1 开始，Expires 逐渐被 Cache-Control 取代。Cache-Control 是一个相对时间，即使客户端时间发生改变，相对时间也不会随之改变，这样可以保持服务器和客户端的时间一致性。而且 Cache-Control 的可配置性比较强大。

**Cache-Control 的优先级高于 Expires**，为了兼容 HTTP/1.0 和 HTTP/1.1，实际项目中两个字段我们都会设置。

协商缓存（缓存校验）
----------

如果缓存过期了:

*   没有 Cache-Control 和 Expires
    
*   Cache-Control 和 Expires 过期
    
*   设置了 no-cache
    

需要发起请求验证服务器资源是否有更新：

*   有更新，返回 200，更新缓存
    
*   无更新，返回 304，更新浏览器缓存有效期
    

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vK3l1UkYkrRvrOV5MdVgFicMwPUjMKWo9bBiawmwyfWP2Zovg615q6vGyw/640?wx_fmt=png)

### Last-Modified 和 If-Modified-Since（HTTP/1.0）

*   Last-Modified（响应头）
    
*   If-Modified-Since（请求头）
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vKqe5cd5AOaibkcxCHVQpeTIfzgrVViccuvEd7eJFfPKa4TMNhbHCOpUkw/640?wx_fmt=jpeg)

`Last-Modified` 表示本地文件最后修改日期，`If-Modified-Since` 会将 `Last-Modified` 的值发送给服务器，询问服务器在该日期后资源是否有更新，有更新的话就会将新的资源发送回来，否则返回 304 状态码。

**但是这种方式存在着一些缺点，例如：**

*   负载均衡的服务器，各个服务器生成的 Last-Modified 可能有所不同
    
*   GMT 格式有最小单位，例如，如果在一秒内有更改将不能被识别
    

### ETag 和 If-None-Match（HTTP/1.1）

为了解决上面的那个问题， HTTP/1.1 加了这组标记

*   ETag（响应头）
    
*   If-None-Match（请求头）
    

ETag 类似于文件指纹，是文件的一个唯一标识序列，当资源有变化时，Etag 就会重新生成，If-None-Match 会将当前 ETag 发送给服务器，询问该资源 ETag 是否变动，有变动的话就将新的资源发送回来。并且 ETag 优先级比 Last-Modified 高

使用 ETag 就可以精确地识别资源的变动情况，就算是秒内的更新，也会让浏览器感知，能够更有效地利用缓存

**ETag 强弱之分**

ETag 机制同时支持强校验和弱校验。它们通过 ETag 标识符的开头是否存在 “W/” 来区分，如：

```
"123456789"   -- 一个强ETag验证符W/"123456789"  -- 一个弱ETag验证符
```

强 ETag 要求资源在字节级别必须完全相符，弱 ETag 在值前有个 “W/” 标记，只要求资源在语义上没有变化，但内部可能会有部分发生了改变（例如 HTML 里的标签顺序调整，或者多了几个空格）

Vary 响应
-------

服务器通过指定 `Vary: Accept-Encoding` ，告知代理服务器，对于这个资源，需要缓存两个版本：

*   压缩
    
*   未压缩
    

这样老式浏览器和新的浏览器, 通过代理, 就分别拿到了未压缩和压缩版本的资源，避免了都拿同一个资源的尴尬。

```
Vary: Accept-Encoding, User-Agent
```

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKmB0JicEadziaTbHL2pTsl7vKhF2EPclsOInO1DmEEn6cecnuHbwY0EdJWbo9nccRgaj8FRnjU7PdhQ/640?wx_fmt=png)

如上设置，代理服务器将针对是否压缩和浏览器类型两个维度去缓存资源。如此一来，同一个 url，就能针对 PC 和 Mobile 返回不同的缓存内容。

来自：https://github.com/Advanced-Frontend/Daily-Interview-Question

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持