> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/N57ZftNgdznsmEK9LLcdqQ)

前言
--

上周突然发现自己的自己站点的图片全都 403 了，之前还是好好的，图片咋就全都访问不了呢？由于我每次发文章都是先发了掘金，然后再从掘金拷贝到我自己的站点，这样我就不用在自己的站点去上传图片了，非常方便。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6iahDNCQs1XPSyZZ0TZ0Jgxwle5MiaMMNCChSibrTLRM7H7KibrDfJb7rJWnd0VF5Rh5mfNibUU23VIpQ/640?wx_fmt=png)

啥也没干，图片咋就 403 了呢？估计又是整了什么开源节流，降本增效吧，说白了就是大家都用他站点的图片导致流量费用蹭蹭蹭的往上涨，人家肯定不愿意了，这下给图片都加上防盗了，非自己的站点全都给你返回 403.

防盗原理
----

是不是很好奇这些图片防盗是怎么做的？

我们可以自己来实现一下这个场景：不受信任的域名访问我服务器上的图片资源全都返回 403

### 准备几个域名

这里没有域名也不用担心，我们可以直接本地模拟就行了，比如我这里使用`SwitchHosts`给本地添加的三个域名并且都指向我们的本地 IP

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6iahDNCQs1XPSyZZ0TZ0Jgxo6mqfufzkJQuMC7NdHuqQOhu4H2bgFmsyaH6XabibdvzG2KfmtdrRicg/640?wx_fmt=png)

这样的话这三个域名都能够访问我们的本地服务了。

### 服务端逻辑

#### 静态资源目录

这里就用之前的`nest`服务来做演示，之前我们在这个服务上指定了静态资源目录

```
app.useStaticAssets(join(__dirname, '../static'), {  prefix: '/static',}); // 静态资源
```

前端访问图片

```
<img class="my_img" src="http://nanjiu.com:3000/static/sy.jpg" />
```

这里是使用`nanjiu.com`代理域名来访问的，图片能够正常访问

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6iahDNCQs1XPSyZZ0TZ0JgxTLqQEukj3mnL97LfjUicn6dgcI0adsrTx6Cas3zVFU5LCELtPVc5Ufw/640?wx_fmt=png)

防盗中间件

这里我们可以来实现一个全局中间件用来处理图片的访问，当访问域名不在我们信任的白名单内直接给他返回 403

```
// 白名单const whiteList = ['nanjiu.com', 'fenanjiu.com'] // 图片防盗中间件function imgMiddleware(req, res, next) {  console.log('--req', req.headers)    // 获取资源类型  const type = req.headers.accept || ''  if(!type.includes('image')) {    // 不是图片资源，直接放行    next()    return  }  const referer = req.headers.referer || ''  // 获取referer的域名  const { hostname } = url.parse(referer, true)  if(referer && whiteList.includes(hostname) || !referer) {    // 访问域名在白名单内，放行 !referer表示直接访问图片(比如浏览器地址栏输入图片地址)    res.status(200)    next()   }else {    // 访问域名不在白名单内，返回403    res.status(403)    res.send('逮到你了，又来偷我图片是吧！')  }  }
```

这里需要注意的是，全局中间件在使用时一定要在`useStaticAssets`之前

```
async function bootstrap() {  const app = await NestFactory.create<NestExpressApplication>(AppModule);    app.setGlobalPrefix('api'); // 全局路由前缀  app.use(cors()); // 允许跨域  app.use(json({ limit: '10mb' })); // 允许上传大文件  app.use(urlencoded({ extended: true, limit: '10mb' })); // 允许上传大文件  app.use(imgMiddleware) // 图片防盗中间件  app.useStaticAssets(join(__dirname, '../static'), {    prefix: '/static',  }); // 静态资源    await app.listen(3000);  console.log(`Application is running on: ${await app.getUrl()}`);}bootstrap();
```

这上面的代码中我们可以看到，现在受信任的域名就只有`nanjiu.com`和`fenanjiu.com`

当前端页面使用`sy.com`这个域名去访问`nanjiu.com`域名下的图片时，此时应该是会进入防盗逻辑，返回 403

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6iahDNCQs1XPSyZZ0TZ0JgxfGg3gatuZb3gWGuw8Qkq4t4IURictRpZAnR0UHtje4iatWr5I1CkhcIA/640?wx_fmt=png)

并且送他一句

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6iahDNCQs1XPSyZZ0TZ0JgxqDkSd79MiaAic7IGNmaWoKQqeGES0PqXLSa0e29penHicvACMKkbYkjHA/640?wx_fmt=png)

Referer
-------

从上面我们实现的防盗原理来看，这其中最关键的就是`referer`，那么这个`referer`到底是什么呢？为什么可以用它来做图片防盗

### Referer 是什么

MDN 解释如下：

> ❝
> 
> **「`Referer`」** 请求头包含了当前请求页面的来源页面的地址，即表示当前页面是通过此来源页面里的链接进入的。服务端一般使用 `Referer` 请求头识别访问来源，可能会以此进行统计分析、日志记录以及缓存优化等。
> 
> ❞

从这里我们就大概能知道**「图片防盗」**的原理了，服务端可以通过请求头中的`Referer`来识别访问来源，然后判断应不应该给你返回图片

`Referer`这个单词实际上是`Referrer`的错误拼写，这其实是个历史原因，在早期 HTTP 规范当中就存在的拼写错误，后面为了向下兼容，所以将错就错。

拼写错误只有 `Request Headers` 的 `Referer`，在其他地方比如`General Headers`、 `JavaScript` 及 `DOM` 上，都是正确的拼写。

### Referrer-Policy

> ❝
> 
> **「`Referrer-Policy`」** 首部用来监管哪些访问来源信息——会在 `Referer` 中发送——应该被包含在生成的请求当中。
> 
> ❞

它其实是用来控制 Referer 返回的具体内容的

它有以下属性值：

*   **「no-referrer：」**整个 `Referer` 首部会被移除。访问来源信息不随着请求一起发送。
    
*   **「no-referrer-when-downgrade（默认值）：」**在没有指定任何策略的情况下用户代理的默认行为。在同等安全级别的情况下，引用页面的地址会被发送 (HTTPS->HTTPS)，但是在降级的情况下不会被发送 (HTTPS->HTTP)。
    
*   **「origin：」**在任何情况下，仅发送文件的源作为引用地址。例如 `https://example.com/page.html` 会将 `https://example.com/ 作为引用地址`。
    
*   **「origin-when-cross-origin：」**对于同源的请求，会发送完整的 URL 作为引用地址，但是对于非同源请求仅发送文件的源。
    
*   **「same-origin：」**对于同源的请求会发送引用地址，但是对于非同源请求则不发送引用地址信息。
    
*   **「strict-origin：」**在同等安全级别的情况下，发送文件的源作为引用地址 (HTTPS->HTTPS)，但是在降级的情况下不会发送 (HTTPS->HTTP)。
    
*   **「strict-origin-when-cross-origin：」**对于同源的请求，会发送完整的 URL 作为引用地址；在同等安全级别的情况下，发送文件的源作为引用地址 (HTTPS->HTTPS)；在降级的情况下不发送此首部 (HTTPS->HTTP)。
    
*   **「unsafe-url：」**无论是同源请求还是非同源请求，都发送完整的 URL（移除参数信息之后）作为引用地址。
    

这么多`referrer`策略，我们怎么使用呢？

### 使用

#### meta 标签

我们可以用一个 name 为 `referrer` 的`meta`元素为整个文档设置 `referrer` 策略

```
<meta >
```

我的个人站点就是使用该方法来解决图片访问 403 问题的，但需要注意的是，如果你为页面设置了`no-referrer`策略会导致页面上所有的请求都不会发送`referer`，使用时需要自己权衡利弊。

#### rel 属性

可以在`a`、`area`、`link`标签上通过`rel`属性来单独指定`referrer`的策略

```
<a href="xxx" rel="noreferrer">新地址</a>
```

#### referrerpolicy 属性

可以在`a`、`area`、`link`、`img`、`iframe`、`script`标签上通过`referrerpolicy`属性来单独指定`referrer`策略

```
<img class="my_img" referrerpolicy="no-referrer" src="http://nanjiu.com:3000/static/sy.jpg" />
```

比如上面例子中的这张图片我们加上`referrerpolicy="no-referrer"`再去访问，页面还是在`sy.com`这个域名下面

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6iahDNCQs1XPSyZZ0TZ0JgxPichr1W0VsfQ9kk1U4mrcEGDAlurIGn4lwwu7RCqpgvy3pfe95lgMaA/640?wx_fmt=png)

可以看到请求头中没有携带`referer`，所以它就能够躲过图片防盗逻辑。

#### Headers 请求头

也可以更改 HTTP 头信息中的 Referer-Policy 值。比如你使用的是 Nginx，则可以设置 add_headers 设置请求头。

```
add_header Referrer-Policy "no-referrer";
```

Headers 请求头和其它页面元素属性同时存在时，确定元素的有效策略时的优先顺序是：

1.  元素级策略
    
2.  页面级策略
    
3.  浏览器默认
    

**「如果这篇文章有帮助到你，❤️关注 + 点赞❤️鼓励一下作者，文章公众号首发，关注 `前端南玖` 第一时间获取最新文章～」**