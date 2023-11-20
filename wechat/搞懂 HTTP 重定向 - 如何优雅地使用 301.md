> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zT702RLcq6gkCpQ3Nc_1jw)

> 最近一段时间，连续遇到了两次跟重定向相关的问题，本着知己知彼百战百胜的态度，我决定深入了解一下，顺便跟大家分享一下。

作为前端开发，大家对重定向一定不陌生，不就是永久重定向和临时重定向嘛，谁还不知道呢 😂。

那么大家是否知道永久重定向和临时重定向的区别呢？如果不小心设置了永久重定向该如何取消呢？如何优雅地使用重定向呢？接下来就让我们来一探究竟吧。

URL 重定向，能够将多个 URL 指向同一个页面，这一技术有着多种用途。在 HTTP 中有一个专门的响应，叫做 HTTP 重定向，也就是所有 3 开头的响应（这个相信大家都背过）。

除了 HTTP 重定向，还有其他方式能够进行重定向，本文也会介绍。

内容较长，我们先看一下本文的内容架构：

1.  HTTP 重定向详解
    
2.  其他类型的重定向方式
    
3.  重定向的使用场景
    
4.  如何优雅地使用 301
    

1. HTTP 重定向
-----------

在 HTTP 中，服务器可以通过返回一个重定向响应来进行重定向。这个重定向响应有一个以 3 开头的状态码 ，并且有一个 `Location` 头字段 表示要重定向到的位置。

浏览器接收到这个重定向之后，会立即加载 `Location` 中指定的 URL。通常这一过程耗时极端，用户基本注意不到这个过程。

重定向过程如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib5iajUbys3RYibzCJybOgh7pI0icr1sgqPsJ0jf6ibfj1PH5x6YyWy6jtkA23qz3tdLnuoVGrn9nAQw4g/640?wx_fmt=png)重定向过程

### 1.1 重定向状态码及含义

前面提到，重定向相关的状态码都是以 3 开头的，主要有以下 9 种状态码：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">状态码</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">状态短语</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">状态含义</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">300</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Multiple Choices</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">当请求的 URL 对应有多个资源时（如同一个 HTML 的不同语言的版本），返回这个代码时，可以返回一个可选列表，这样用户可以自行选择。通过 <code>Location</code> 头字段可以自定首选内容。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">301</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Moved Permanetly</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">当前请求的资源已被移除时使用，响应的 <code>Location</code> 头字段会提供资源现在的 URL。直接使用 GET 方法发起新情求。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">302</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Found</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">与 301 类似，但客户端只应该将 <code>Location</code> 返回的 URL 当做临时资源来使用，将来请求时，还是用老的 URL。直接使用 GET 方法发起新情求。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">303</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">See Other</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">用于在 PUT 或者 POST 请求之后进行重定向，这样在结果页就不会再次触发重定向了。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">304</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Not Modified</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">资源未修改，表示本地缓存仍然可用。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">305</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Use Proxy</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">用来表示必须通过一个代理来访问资源，代理的位置有 <code>Location</code> 头字段给出</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">306</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Switch Proxy</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">在最新版的规范中，306 状态码已经不再被使用。最初是指 “后续请求应使用指定的代理”。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">307</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Temporary Redirect</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">与 302 类似，但是使用原请求方法发起新情求。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">308</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Permanent Redirect</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">与 301 类似，但是使用原请求方法发起新情求。</td></tr></tbody></table>

总共有 9 个与重定向相关的状态码，其中 301/302/304 都比较常见，305/306 使用较少，本文不做介绍（其实我也不懂，也没用过 😂）。这 9 种状态码可以分成 3 大类，分别是：永久重定向、临时重定向以及特殊重定向。

### 1.2 永久重定向类

301 和 308 都属于永久重定向。永久重定向意味着原始 URL 不再可用，替换成了一个新的内容。所以**搜索引擎、聚合内容阅读器以及其他爬虫识别这两个状态码时，会更新旧 URL 的资源**。

**划重点**：这个就是永久重定向和临时重定向的区别。

> 规范中，301 本来不允许改变请求方法，但是已有的浏览器厂商都使用了 GET 方法进行新的请求。所以创建了 308 用来处理需要使用非 GET 进行重定向的场景。

### 1.3 临时重定向类

302/303/307 都属于临时重定向。有时，当原有资源因为一些不可预测的原因而临时无法访问时，可以通过临时重定向的方式将请求转移到另一个地方。搜索引擎和爬虫不应该记住这个临时的连接。

此外，临时重定向还可以用来在创建、修改和删除时展示临时的进度页，这里通常使用 303。

> 302 和 307 的关系类似于 301 和 308，参见上文。

### 1.4 特殊重定向类

除此之外，300/304/305/306 可以归属到特殊重定向类。这里重点说一下 304，304 是 HTTP 缓存中的一个重要内容，表示资源未修改，相当于将资源重定向到本地缓存。

关于 HTTP 缓存的详细内容，可以查看这篇文章：浏览器缓存策略之扫盲篇

2. 其他类型的重定向方式
-------------

HTTP 是最简易使用的重定向方式，但是有些时候我们并不能够操作服务端。好在，除了 HTTP 重定向外，还有两种方式：通过`<meta>`进行 HTML 重定向和通过 DOM 的 JS 重定向。

### 2.1 HTML 重定向

如下代码所示，我们可以通过在`<meta>`元素上设置`http-equiv="Refresh`可以实现页面的重定向。

```
<head>  <meta http-equiv="Refresh" content="0; URL=https://example.com/"></head>复制代码
```

`content`属性需要以数字开头，表示多少秒之后重定向到指定页面。通常我们设置为 0。

> 注意，这一方式只适用于 HTML

### 2.2 JavaScript 重定向

这个大家都用过，使用`window.location`可以重定向页面。这个方法很常见，不过多做介绍。

> 当然，这一方式只在 JavaScript 的客户端执行环境有效。

上述所介绍的三种重定向方式中，按照优先级顺序如下：HTTP > HTML > JavaScript。这和我们所知道的文件的请求处理顺序一致，不过多解释。

3. 重定向的使用场景
-----------

不同类别的重定向有不同的使用场景，大致可以分为以下几类：

*   **网站别名**：通常情况下，对于一个资源，我们只有一个 URL，但有些特殊情况下，资源会存在多个 URL，这个时候就需要用到重定向。
    

*   提高网站的可达率：比如 `www.example.com` 和 `example.com`都可以访问到指定网站。
    
*   迁移到新的站点：因为某些原因旧站点被废弃，但仍然希望之前已经存在的连接和收藏书签能够生效，这是可以使用重定向。
    
*   强制跳转 HTTPS：当我们的网站支持 HTTPS 时，通常会强制使用 HTTPS，所以访问 HTTP 时需要做重定向跳转。
    

*   **保证已有链接可用**：站点的维护是一个长时间的过程，有时，我们在进行重构时，会对一些链接或路由进行调整，这时候我们内部的 URL 可以修改，但是对于已在被外部引用了的链接却无法修改。为了保证这部分的链接可用，我们通常需要设置重定向。
    
*   **对于危险操作进行重定向**：类似编辑删除等危险操作，为了避免用户刷新时重复触发危险操作，我们可以将其重定向到临时的进度展示页，比如使用 303。对于耗时较长的请求也可以这么处理。
    

4. 如何优雅地使用 301
--------------

有些时候，我们对于永久重定向的理解并不够，在仓促之中使用了 301 永久重定向时就会遇到这样的一个坑，那就是不管我们怎么重新设置，（有些）浏览器都仍然使用最开始设置的 301 永久重定向。

这时，我们的用户甚至是我们自己的状态大概是这样的：

> 网站：忍法 - 永久重定向之术 用户 & 我们：我是谁？我在哪？我该怎么回去？

往往在错误配置了 301 之后，我们需要面临的问题就是取消最初的 301？

然而，很不幸的是，似乎并没有好的办法能够快速的清除用户端已经使用过的错误 301 重定向。

如果用户足够聪明的话，还可以让用户按照我们的说明进行处理。

所以最好的做法是能够搞懂并优雅地使用 301，这样才能避免这一问题。

下面，我们先来复现问题，然后再解释问题。

### 4.1 准备：使用 Nginx 配置 301 永久重定向

在 Nginx 中，我们可以创建一个 server 块来指定所有内容都进行重定向：

```
server { listen 80; server_name example.com; return 301 $scheme://www.example.com$request_uri;}复制代码
```

也可以通过`rewrite`指令指定目录和页面进行重定向：

```
rewrite ^/images/(.*)$ https://images.example.com/$1 redirect;rewrite ^/images/(.*)$ https://images.example.com/$1 permanent;复制代码
```

> 对于其他 web 服务器，可以参考 MDN 或者网上的其他教程进行配置。

比如我准备了下面这样一个 `nginx.conf` 文件。

```
server {  listen 80;  server_name redirect.example.com;  root /your-path/web-redirect;  location /original-page {    # 下面是两种重定向方式，为了测试使用，启用一个即可    # 永久重定向    rewrite ^/original-page http://redirect.example.com/301 permanent;    # # 临时重定向    # rewrite ^/original-page http://redirect.example.com/302 redirect;  }  location /301 {    try_files $uri /301.html$is_args$args;  }  location /302 {    try_files $uri /302.html$is_args$args;  }}复制代码
```

> 301.html/302.html 自行准备即可，内容自己能区分出来就行。

现在我们假设不小心将初始页面永久重定向到了 301 页面，现在想取消这一行为，临时重定向到 302 页面。

1.  先开启永久重定向的规则，在浏览器访问`http://redirect.example.com/original-page`，会发现重定向到了 301。
    
2.  关闭永久重定向规则，开启临时重定向，再次访问初始页面，看看是否重定向到了 302 页面。
    

至此，我们会发现，301 之后，浏览器会记住第一次的 301，忽略之后的其他重定向。那这样到底是为什么呢？

### 4.2 浏览器会缓存 “301” 永久重定向

这所以会这样，这是因为浏览器会缓存 “301” 永久重定向。

经不完全测试，各浏览器的缓存情况如下：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;"><br></th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">是否缓存</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">重启是否清除</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">时间改为 1 年后是否失效</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">5 年后</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Chrome</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">是</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">未清除</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">未失效</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">未失效</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">FireFox</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">是</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">未清除</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">未失效</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">未失效</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">Safari</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">是</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">清除</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">失效</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">失效</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">IE</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">--(没测)</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">--</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">--</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">--</td></tr></tbody></table>

可以看出除了 Safari 重启 / 修改时间之后，能够使用新的重定向，Chrome/Firefox 都会无限期的缓存 301 重定向。

在 FireFox 中我们也可以简单验证下，输入`about:cache`，在磁盘缓存中可以找到相关的缓存项。如下：

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib5iajUbys3RYibzCJybOgh7pIBPeTXgklJ88JMmaaGC1PlTXyice7UIxZSXwwWSKrkBoxWsTxmRmoJ4Q/640?wx_fmt=png)FireFox 中的 301 缓存内容

浏览器为什么会缓存 301 重定向呢？其实，HTTP RFC 中规定 301 是一个可缓存的响应，所以浏览器会根据响应中的 HTTP 缓存头进行缓存。**如果我们没有提供明确的缓存头，浏览器就会默认永久缓存 301 响应，因为 301 是永久重定向的意思。**

这里笔者偷懒没有测试 IE，但是鉴于有浏览器 (Chrome/Firefox) 会无限期缓存 301 重定向，那么我们就需要试着去解决这一问题 —— 如何清除 301 重定向缓存。

### 4.3 如何清除 301 重定向缓存

> 内心戏：不是说没法清除吗？这怎么介绍了。我：别急，先看完。

既然是缓存行为，那么我们就可以通过常规的缓存清理方式来处理，包括但不限于以下几种方式：

*   控制台禁用缓存
    
*   清除历史记录
    
*   Network 面板清除缓存
    

这里大家可以自行尝试以下，如果不行的话，记得多试 1-2 遍就行（至于为什么要多试，我也很奇怪，有的时候就是清两遍就好了）。

如果大家验证了上面的几种清除方式，就会发现确实是行之有效的。那为什么我会说没有很好地方式去清除呢？

大家细想，当我们将错误的 301 请求发布到线上环境了，并且影响了数以万计的用户时，我们要怎么通知并教会用户按照我们的方式去清除缓存呢？当然，**清除历史记录算是最便捷的方式了**，如果真的不行遇到了这种情况，那就通知用户这么清除吧 😂。

### 4.4 优雅地使用 301

为了避免上面需要清除的情况，最好的做法是优雅地使用 301。

前面解释浏览器为什么会缓存 301 重定向时，已经隐晦地提到了这一方法。

既然浏览器认为这是一个可以缓存的资源，并且我们可以通过缓存头来控制。那么在使用 301 时，我们将其设置为不缓存就可以了。比如设置 `Cache-Control: no-store` 或 `Cache-Control: no-cache`。

```
location /original-page {+ add_header Cache-Control no-store;  # 永久重定向  rewrite ^/original-page http://redirect.example.com/301 permanent;  # 临时重定向  # rewrite ^/original-page http://redirect.example.com/302 redirect;}复制代码
```

这样设置之后，如果我们再将重定向切换成 302，会发现浏览器不会缓存 301 了，新的重定向可以立即生效了。

总结
--

以上就是重定向相关的内容。301 使用需谨慎，一定要设缓存头 😂。

### 参考资料

[1]

维基百科 - HTTP 状态码: _https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81_

[2]

MDN - Redirections in HTTP: _https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections_

[3]

浏览器将 HTTP 301 缓存多长时间？: _https://qastack.cn/programming/9130422/how-long-do-browsers-cache-http-301s_

[4]

浏览器对 301 重定向的缓存: _https://juejin.cn/post/6844904045614743560_

[5]

Chromium - Feature Request: I need a way to clear the 301 redirect cache: _https://bugs.chromium.org/p/chromium/issues/detail?id=633023&can=1&q=clear%20301%20redirects&colspec=ID%20Pri%20M%20Stars%20ReleaseBlock%20Component%20Status%20Owner%20Summary%20OS%20Modified_

关于奇舞周刊
------

《奇舞周刊》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6j9X9s2kibfaicBLmIm6dUBqymVmiaKqGFEPn0G3VyVnqQjvognHq4cMibayW2400j4OyEtdz5fkMbmA/640?wx_fmt=jpeg)