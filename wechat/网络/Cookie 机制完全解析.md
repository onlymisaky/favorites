> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Fsu0JGxNFUFK-T7ovfl5Dw)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/dy9CXeZLlCXC3wMNqqHqqOK9RGRr0pI4bOmcewZUwQ8fBPEkD2XDRRLE3NTZxlHJoKcvAm1kVoPstHbdp8tjwQ/640?wx_fmt=jpeg&from=appmsg)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群
```

先有问题再有答案
--------

1.  `为什么需要cookie`
    
2.  `cookie是什么？`
    
3.  `cookie都有哪些属性可以配置？`
    
4.  `跨域,跨站,同源,同站有什么关系?`
    
5.  `cookie是谁设置的 谁可以发送 谁可以更改？`
    
6.  `第三方cookie是什么意思`
    
7.  `浏览器禁用第三方cookie对业务有什么影响`
    
8.  `cookie与网页安全有什么关系`
    
9.  `如何解决跨域共享cookie的问题`
    
10.  `跨域无法携带Cookie & 浏览器全面禁止第三方Cookie 是一回事嘛？`
    

cookie 的背景
----------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiamWsEBqnY4Tbj8EDJXhXBTvgxbezpic22K69dRtZ3RNVNhQPwFiakyRSQ/640?wx_fmt=other&from=appmsg) HTTP 协议是无状态的 一个用户第二次请求和一个新用户第一次请求 服务端是识别不出来的，cookie 是为了让服务端记住客户端而被设计的。![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaDiaHsXdF7m4WJUWaia5GiaicsibTYdcIbWKhIrKVlrRdiblObibmwy7UYcP8g/640?wx_fmt=other&from=appmsg)

cookie 是一种存储方式
--------------

Cookie 是存储在用户 web 浏览器中的小块数据一般不超过 4k，它一般用于存储用户身份信息。  
Cookie 是由`服务端设置`在浏览器上的  
Cookie 是由`浏览器管理`的并且随着 http 请求`自动发送`的。  
Cookie 在服务端配置`允许`的前提下 可以使用`js访问操作`cookie。

既然 cookie 是一种存储方式 用来存储用户身份 我们同样可以使用其他的存储方式替代 cookie 这是完全可以的 只是需要我们自己发送和维护 毕竟 cookie 是浏览器自动发送和清理的。

cookie 的关键属性
------------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaicNQR9qVV9u3gh5ShGQpnGSgiak6bypcMsjoSgKXjsuwia4drEwibfUWVA/640?wx_fmt=other&from=appmsg)截屏 2024-04-23 下午 3.24.17.png

### name&value

属性名和属性值 cookie 中的内容信息

### domain&path

`设置了cookie的作用范围`。

*   **Domain**：指定了 Cookie 发送的主机名, 只能设置范围小于等于自己的域名范围。假如没有指定，那么默认值为当前文档访问地址中的主机部分（但是不包含子域名）。![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaEOH6lUm7icZruF9e4PTzpZGiaN8TLlEO3GwOMWDj8j7w3Gh9RkU5bMJQ/640?wx_fmt=other&from=appmsg)
    
*   **path**：指定一个 URL 路径，只有当路径匹配时，才会向服务器发送 Cookie。例如设置 “/” 这此域下所有路径都可以携带 cookie。
    

### Expires&Max-Age

设置 cookie 有效期。Expires 和 Max-Age 都存在，Max-Age 优先级更高。

*   **Expires**：设置 Cookie 的过期时间。如果不设置，Cookie 会在浏览器关闭时自动失效，称为会话 Cookie（Session Cookie）。Expires 使用的是具体的日期和时间（例如：Sat, 31 Dec 2022 23:59:59 GMT）。
    
*   **Max-Age**：设置 Cookie 在多少秒后过期。与 Expires 相比，Max-Age 是相对于当前时间的持续时间，更加灵活。max-Age > 0, 浏览器会将其持久化，即写到对应的 Cookie 文件中。当 max-Age < 0，则表示该 Cookie 只是一个会话性 Cookie。当 max-Age = 0 时，则会立即删除这个 Cookie。
    

### Secure

标记该属性的 Cookie 只应通过被 HTTPS 协议加密过的请求发送给服务端。这有助于保护数据在互联网上传输过程中不被窃取。

### HttpOnly

此属性用来帮助防止跨站脚本攻击（XSS），因为标记为 HttpOnly 的 Cookie 无法通过 JavaScript 的 Document.cookie API 访问。这意味着即使系统有 XSS 漏洞，Cookie 也不会被盗取。

### Size 与 Priority

Cookie 的大小一般为 4KB，当超出这个范围时会移除旧的 Cookie。移除时按照优先级由低到高删除。

### SameSite

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiauicAiaKicZI5wCpicYib3oibfevyKw5wp5fg1vBvxebIBQBXYSpYFt7s9EAQ/640?wx_fmt=other&from=appmsg) SameSite 属性可以让 Cookie 在跨站请求时不会被发送，从而可以阻止跨站请求伪造攻击（CSRF）。

*   Strict：Cookie 不会随着来自第三方的请求被发送
    
*   Lax：在一些第三方请求场景中发送，例如通过`a标签`链接点击到其他站点时...
    
*   None：不做限制 即使是来自第三方的请求，也会发送 Cookie，需要配合`Secure`属性一起使用。![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaY415BjpQicvC4sDF40XtZGiasRInKEgI6zhgfab85kyeW3eFK4daUknA/640?wx_fmt=other&from=appmsg)
    

**第三方 cookie**：非当前域名下的服务器设置的 cookie。例如上图中当前网页访问的是`a.test.com`网站, 请求了`a.example.com`的图片资源，`a.example.com`即为第三方。

### SameSite 改变的影响

在 `Chrome 80+` 版本中，`SameSite` 的默认属性是 `SameSite=Lax`，当 `Cookie` 没有设置 `SameSite` 属性时，将会视作 `Lax` 。如果想要指定 `Cookies` 在同站、跨站请求都被发送，那么需要明确指定 `SameSite` 为 `None`。具有 `SameSite=None` 的 `Cookie` 也必须标记为安全并通过 `HTTPS` 传送。![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaVTHkYeGqGaibibRGodnq6jXub6eYw032zIs4pdO8p1qvruME6L9Hkfcg/640?wx_fmt=other&from=appmsg)

同源 (Same-Origin)& 同站 (Same-Site)
--------------------------------

### Same-Origin

协议 (http/https)+ 主机 + 端口 三者完全保持一致。  
例如`https://juejin.cn/post/7338284106797088809#heading-9`和`https://juejin.cn/post/7355063847382810635`符合同源标准。

### Cross-Origin

Same-Origin 规则中任意不一致即跨域 具体参考 浏览器: 安全策略 [1]

### Same-Site

两个 URL 的 `eTLD+1` 相同即可，不需要考虑协议和端口。  
`eTLD` 表示有效顶级域名，注册于 Mozilla 维护的公共后缀列表（Public Suffix List）中，例如，.com、.co.uk、.github.io 等。

eTLD+1 表示，有效顶级域名 + 二级域名。  
例如：  
`test.com`和`a.test.com`同站  
`test.com`和`example.com`跨站

### 总结

1.  web 中任何请求都受到同源限制，cookie 在此基础上还会受到同站策略限制 (samesite 指定)。
    
2.  跨站一定跨域 跨域不一定跨站
    
3.  ajax 跨域请求一般有两个问题 请求能否发出去 cookie 能否携带上。
    

跨域携带 cookie 解决方案
----------------

### 通过 CORS 解决

**服务器端配置**：在服务器端设置响应头 Access-Control-Allow-Credentials 为 true，并且 Access-Control-Allow-Origin 不能为 *，必须是请求方的具体源，如 example.com。[2]

**客户端配置**：发起请求时，设置 credentials 为 include 确保请求会携带 Cookie。

### 通过代理服务器解决

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaS4D9BJ7qj6iaqiaGlIr2l8Jm4H54uUQU8Qia8Wb4HkWJ3THSGCGNaZoxg/640?wx_fmt=other&from=appmsg) 如果不是我们自己业务的服务端 无法配置更改 可以通过代理转发的方案。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiaDDcoxjHXlYCiaZZpHyiatzLO4zFOeZPOofGPQaSSfBzGnIeh4nMMGaxw/640?wx_fmt=other&from=appmsg)截屏 2024-04-23 下午 5.41.22.png

浏览器禁用第三方 cookie 解决方案
--------------------

### 设置 samesite:none

设置跨站可以传递 cookie 需要配合 Secure 一起使用。

### 使用第一方 Cookie

由主域直接设立和访问，不受第三方 Cookie 限制的影响

### 代理服务器转发

如同上面的方案一样 这个情况也同样适用

### 使用其他存储方案

cookie 的作用是存储用户标识 让服务端知道是谁在请求 我们完全可以使用其他的存储方式 例如 localStorage.

### follow 浏览器标准

例如`Partitioned`属性 设置 cookie 分区存储。它的作用是使 `第三方Cookie` 与 `第一方站点` 相绑定，通过将第三方 Cookie 的读取和写入操作限制在创建它们的相同网站的上下文中，来增强用户隐私。

**分区前 cookie 存储** ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiatFDJs482nHaumuIHTKxfMqpDicUic2XBVtjjQZciaIbUTh5csbmLnOiamA/640?wx_fmt=other&from=appmsg)

因为`a.test.com`和`a.example.com`都使用了`a.3rd.com`的资源。`a.3rd.com`可以在请求时设置 cookie。这样当同一个用户在两个网站上活动时可以被`a.3rd.com`识别到，造成隐私泄露...

**分区后 cookie 存储** ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uYTpLNQA8n06r737eqHr7ibiagMpRaayaczy2kGOGJpj4GTJas51obQax9S3yqrK958R2vtmwG5g4EA/640?wx_fmt=other&from=appmsg) 因为 cookie 的存储方式变了 用户在`a.test.com`浏览时 `a.3rd.com`设置的 cookie 包含了当前的上下文 。

当用户在`a.example.com`访问时 因为`[a.test.com,a.3rd.com]`这个 cookie 无法被访问到不会被自动发送给第三方服务器 阻止了第三方的信息采集, 增强了用户的隐私保护...

跨域无法携带 Cookie Vs 浏览器全面禁止第三方 Cookie 区别
-------------------------------------

*   **目的不同**：跨域请求默认不携带 Cookie 主要是出于安全考虑，防止跨站点请求伪造等攻击；禁止第三方 Cookie 主要是出于隐私保护考虑，防止用户跨网站被追踪。
    
*   **操作层面不同**：跨域 Cookie 的发送需要通过适当的服务器和客户端配置来实现；第三方 Cookie 的禁用是由浏览器控制，影响所有第三方来源的 Cookie。
    

这两者虽然都涉及到 Cookie 和浏览器的策略，但它们关注的重点、解决的问题和需要的配置都有所不同。

作者：某某某人

原文：https://juejin.cn/post/7360976761838960640

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下
```