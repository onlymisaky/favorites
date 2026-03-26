> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Y7MNhOUEvLZJ7wwkEobC4g)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

引文
--

本文从以下几个方面循序渐进走进 CSRF：

*   CSRF 是什么
    
*   CSRF 常见的攻击方式与防护策略
    
*   实现一个 CSRF 攻击
    

了解 CSRF
-------

CSRF（Cross-site request forgery）跨站请求伪造，是指攻击者诱导受害者进入第三方网站，在第三方网站中，向被攻击网站发送跨站请求。利用受害者在被攻击网站已经获取的注册凭证，绕过后台的用户验证，达到冒充用户对被攻击的网站执行某项操作的目的。

攻击流程如下：

*   受害者登录 http://a.com ，并保留了登录凭证（Cookie）
    
*   攻击者引诱受害者访问了 http://b.com
    
*   http://b.com 发送了一个请求：http://a.com/act=xx 。浏览器会默认携带 http://a.com 的 Cookie。
    
*   http://a.com 接收到请求后，对请求进行验证，并确认是受害者的凭证，误以为是受害者自己发送的请求。
    
*   http://a.com 以受害者的名义执行了 act=xx。
    
*   攻击完成，攻击者在受害者不知情的情况下冒充受害者，让 http://a.com 执行了自己定义的操作。
    

一个真实的案例：用户 David 在自己邮箱内点击了黑客恶意伪装的链接。黑客在点击的链接里冒充用户 (cookie) 向 Gmail 服务器发送邮件自动转发请求，导致 David 的邮件都被自动转发到了黑客的邮箱，从而被黑客利用盗取了用户数据。

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKleYLZ7nPMfasdblE7KgBNDmyAAMVxeMWJ4A5l1veUb2bbQEQX9Q6iaDeCiaedniamEuQ2IVIxbHsmog/640?wx_fmt=png)

CSRF 常见的攻击方式与防护策略
-----------------

### 几种常见的攻击方式

*   自动发起 GET 请求的 CSRF
    
*   自动发起 POST 请求的 CSRF
    
*   引诱用户点击链接的 CSRF
    

#### 1. 自动发起 GET 请求的 CSRF

GET 类型的 CSRF 是最简单的，一般是这样：

```
<img src="http://a.com/pay?amount=10000&for=hacker" >
```

攻击者将支付的接口请求隐藏在 `img` 标签内，在加载这个标签时，浏览器会自动发起 `img` 的资源请求，`a.com` 就会收到包含受害者登录信息的一次跨域请求

如果服务器认为该请求有效的话，就会将 10000 块转移到攻击者的账户上去了

#### 2. 自动发起 POST 请求的 CSRF

这种就是表单提交：

```
<form action="http://a.com/pay" method=POST>    <input type="hidden"  /></form><script> document.forms[0].submit(); </script>
```

访问该页面后，表单会自动提交，相当于模拟用户完成了一次 POST 操作。

#### 3. 引诱用户点击链接的 CSRF

链接类型的 CSRF 并不常见，比起其他两种用户打开页面就中招的情况，这种需要用户点击链接才会触发。这种类型通常是在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招，攻击者通常会以比较夸张的词语诱骗用户点击，例如：

```
<div>  <img width=150 src=http://images.xuejuzi.cn/1612/1_161230185104_1.jpg> </img>   <a href="https://a.com/pay?amount=10000&for=hacker" taget="_blank">    点击查看更多美女  </a></div>
```

由于之前用户登录了信任的网站 A，并且保存登录状态，只要用户点击了这个超链接，则表示攻击成功

### 总结：CSRF 的产生的条件

*   目标站点一定要有 CSRF 漏洞
    
*   用户要登录过目标站点，并且在浏览器上保持有该站点的登录状态
    
*   需要用户打开一个第三方站点，可以是攻击者的站点，也可以是一些论坛
    

### 防护策略

#### 1. 利用 Cookie 的 SameSite 属性

通过上面的介绍，我们知道攻击者是利用用户的登录状态来发起 CSRF 攻击，而 Cookie 正是浏览器和服务器之间维护登录状态的一个关键数据，因此要阻止 CSRF 攻击，我们首先就要考虑在 Cookie 问题

通常 CSRF 攻击都是从第三方站点发起的，冒用受害者在被攻击网站的登录凭证，所以我们可以做以下防护：

*   如果是从第三方站点发起的请求，浏览器禁止发送某些关键 Cookie 数据到服务器
    
*   如果是同一个站点发起的请求，那么就需要保证 Cookie 数据正常发送。
    

Cookie 中的 SameSite 属性正是为了解决这个问题的，通过使用 SameSite 可以有效地降低 CSRF 攻击的风险

> SameSite 选项通常有 `Strict` 、`Lax` 和 `None` 三个值。
> 
> *   Strict：浏览器完全禁止第三方拿到 Cookie
>     
> *   Lax：相对宽松一点，在跨站点的情况下，从第三方站点的链接打开或 Get 方式的表单提交这两种方式都会携带 Cookie；除此之外，如 Post 请求、 img、iframe 等加载的 URL，都不会携带 Cookie
>     
> *   None：最宽松，在任何情况下都会发送 Cookie 数据
>     
> 
> Chrome 80.0 中将 SameSite 的默认值设为 Lax

所以，我们可以将 SameSite 设置为  `Strict` 或 `Lax` 来解决 Cookie 问题

#### 2. 利用同源策略

既然 CSRF 大多来自第三方网站，那么我们就直接禁止外域（或者不受信任的域名）对我们发起请求

那么该怎么判断请求是否来自第三方站点呢？

在 HTTP 协议中，每一个异步请求都会携带两个 Header，用于标记来源域名：

*   Referer Header：记录该请求的来源地址（含 URL 路径）
    
*   Origin Header：记录该请求的域名信息（不含 URL 路径）
    

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKleYLZ7nPMfasdblE7KgBNDt90icWdjNhHRvZvztPEIicQgBx6SSgRs3Hg3hhmZBry3Qh29nwUca3wA/640?wx_fmt=png)

服务器先判断 Origin，如果请求头中没有包含 Origin 属性，再根据实际情况判断是否使用 Referer 值，看是否是同源请求

#### 3. Token 认证

前面讲到 CSRF 的另一个特征是，攻击者无法直接窃取到用户的信息（Cookie，Header，网站内容等），仅仅是冒用 Cookie 中的信息。

所以，我们可以启用 Token 认证

*   在用户登录时，服务器生成一个 Token 返回给用户
    
*   在浏览器端向服务器发起请求时，带上 Token，服务器端验证 Token
    

实现一个 CSRF 攻击
------------

我们已经知道了 CSRF 常见的 3 种攻击方式，然后模拟攻击就很简单了，这里提供一个例子:

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKleYLZ7nPMfasdblE7KgBNDWDVJK8fgLEUia8oL7h0hBRfeFVw40IYiax6ziadQWzSrrA3HMaRlTyYlQ/640?wx_fmt=png)

攻击页面：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKleYLZ7nPMfasdblE7KgBND8w1viaibPYWQrqpylOAiawNZqq2uYDpBdZ2KTgA3nbSx0oonSEnWJ3yXw/640?wx_fmt=png)

被攻击页面：

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKleYLZ7nPMfasdblE7KgBNDc3TeRL8IlgiaQYONyBOSLOHrGicA167q31HmphUibQ3awQMqZT7pKorbg/640?wx_fmt=png)

代码：https://github.com/sisterAn/web-safe

#### 参考链接

*   极客时间：浏览器工作原理与事件
    
*   前端安全系列之二：如何防止 CSRF 攻击？：https://tech.meituan.com/2018/10/11/fe-security-csrf.html
    
*   web 安全（xss/csrf）简单攻击原理和防御方案（实战篇）：https://juejin.cn/post/6953059119561441287
    

来自：https://github.com/Advanced-Frontend/Daily-Interview-Question

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持