> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GiK39UgL1hb_EMijnIbl4A)

> 📌
> 
> 如果你喜欢我写的文章，可以把我的公众号设为**星标 🌟**，这样每次有更新就可以及时推送给你啦

* * *

大家好，我是专注于做**性能优化**的卤代烃。

做网页相关的性能优化时，需要对浏览器的底层原理有一定的了解，这样才能更好的让页面走在 happy path 上。今天我们就了解一个很少被人所知的浏览器默认性能优化方案 —— `HTML Preload Scanner`，看看它是如何优化网络资源加载速度的。

浏览器如何解析 CSS/JS 资源
-----------------

我们简单回顾一下浏览器是如何「解析」 HTML/CSS/JS/Image 等主要资源的。

HTML 作为网页入口，肯定是第一个下载的，下载后就会进入一行一行解析环节。解析到子资源的时候，就会存在这么几种经典情况：

**1.** 如果是 CSS 资源，就要停止 HTML 的解析和渲染，得等到 CSS 解析 & 执行完毕再解析渲染 HTML。

为什么要这样做？假设加载一行 CSS 就渲染一次页面，如果我们有这样的 CSS 文件：

```
/* first rule */p {  font-size: 12px;}/* ... *//* last rule */p {  font-size: 20px;}
```

解析执行第一条 CSS 规则，立马渲染，所有的字体都改成了 12px；过了 100ms，解析执行到最后一条规则，立马渲染，所有字体变成 20px。

先不说解析后就渲染的效率性能问题，这种 100ms 内字体变大变小的**闪烁问题**会带来极其糟糕的用户体验（这个官方说法叫 FOUC[1]）。

浏览器为了一定程度内解决这个问题，采用的方案就是解析 CSS 资源时，停止 HTML 后面内容的解析和渲染，等这个 CSS 资源全部解析完毕后再一并渲染。

  

**2.** 如果是没有加 async/defer 的 JS 资源，也得等 JS 解析 & 执行完毕后再解析渲染 HTML。

这个思路和 CSS 类似，因为这种 JS 资源可能会操作 DOM，所以也得等待 JS 解析执行完毕，这也是为什么有条性能优化规则是「把 JS 文件放在 Body 最后面，防止阻塞渲染」。

  

从上面可以看出，渲染这个事儿，遇到 CSS 和 JS 只能等，**但是有一个事情其实不用等，那就是子资源的「下载」**，如果你有留意的话，上面的内容我讨论的都是「解析 + 渲染」，「下载」只字未提。

这个现象浏览器工程师们早早就发现了，虽然一些「解析 + 渲染」行为是串行的，但是「下载」不是啊！浏览器可以提前下载 HTML 里能下载的内容，然后需要「解析」时可以直接拿来就用，这样就能大大提升首屏性能指标了。

这个性能优化方案就叫 HTML Preload Scanner，Webkit 在 2008 年 [2] 就引入这个技术了，可以认为这是现代浏览器的标配功能了。

HTML Preload Scanner
--------------------

接下来我们详细说一下这个功能是如何运作的。

浏览器解析 HTML 的时候，会有两个解析器：

*   一个是正式的，叫 `Primary HTML Parser`，会一行一行解析运行，遇到阻塞性资源就会停止 HTML 的解析，直至阻塞性资源加载运行完毕
    
*   另一个叫 `HTML Preload Scanner`，会直接收集当前 HTML 里所有值得下载的子资源，然后**并行下载**它们：
    

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu7RAUjY4Lbkv2Kt8oA3NMahEuVCxuqY6cu94ia3u1ibmgiaYLI6vBh5UAIzU3ILpBdia04oTlGGaOvjCA/640?wx_fmt=png&from=appmsg)Primary HTML Parser and HTML Preload Scanner

两个 HTML Parser 互相配合，就能从底层上优化网页首屏性能，带来更好的用户体验。

如何观测 `HTML Preload Scanner` 是否正常工作呢？目前各大浏览器并没有暴露此标识，作为 Web 开发者其实可以根据 Perfs 火焰图来判断。

如果一个网页命中 Pre-Scan，那么一个典型特征是，**JS/CSS/Img 等首屏子资源会在 HTML 请求结束后同时发起请求**：

![](https://mmbiz.qpic.cn/mmbiz_jpg/8MK8X2XQgu7RAUjY4Lbkv2Kt8oA3NMahLKwBP5u7nUrIWaRHAkDPKqAP6Fibg7tprialbADRVOT9DozRpAicibUTdg/640?wx_fmt=jpeg&from=appmsg)html-preload-scanner-pic

如果火焰图有上面类似的特征，一般就是命中了。

利用 Preload Scanner 提升性能
-----------------------

因为 `HTML Preload Scanner` 是个浏览器默认的功能，所以不用考虑兼容性问题。但又因为它太基础太底层了，很多人不知道这个功能，所以很难优化意识，本小结就提供一些优化建议，辅助大家使用。

### 少用 JS 动态加载脚本

`HTML Preload Scanner`，正如名字，它是一个 HTML Parser，**不负责解析 JS**。所以说，如果 HTML 里面有些类似的内联 JS 脚本：

```
<script>const scriptEl = document.createElement('script');scriptEl.src = 'test.js';document.body.appendChild(scriptEl);</script>
```

这种内联 JS 脚本会被 `HTML Preload Scanner` 直接跳过不解析的，这就会导致 test.js 不能被提前发现并下载，只能等 `Primary HTML Parser` 执行到对应位置触发 下载 / 解析 / 运行 的连招。

从上面思路出发，我们也可以想到，如果一个网页是纯 SPA 页面，所有的后续资源都依赖 main.js 加载，其实在资源加载和渲染上都会有劣势的，改造为 SSR 页面会有更好的性能表现（就是吃服务器资源）。

### 少用 CSS 加载资源

同样的道理，`HTML Preload Scanner` 也会跳过 HTML 中的内联 CSS 内容的解析。

```
<style>.lcp_img {  background-image: url("demo.png");}</style>
```

对于上面的 CSS 来说，`HTML Preload Scanner` 直接跳过不解析的，只能等 `Primary HTML Parser` 执行到这段 CSS 位置，解析才会触发 demo.png 的下载，时机的后延会带来一定的劣化。

### 灵活使用 Preload

业务代码千奇百怪，可能有些资源文件就得在 JS & CSS 里写。如果这些资源不重要，其实就不用管，如果这些资源比较重要，我们可以用曲线救国的方式，利用 `<link rel="preload" />` 标签来预加载资源：

```
<link rel="preload" href="demo.png" as="image" type="image/png" /><style>.lcp_img {  background-image: url("demo.png");}</style>
```

对于上面的案例，`HTML Preload Scanner` 虽然会跳过内联 CSS 的资源，但是会下载 preload 标记的预加载资源。

当然，这种方案的问题是，preload 会**提升**相关资源的优先级。在网速这个上限的制约下，可能会挤压其他资源的带宽，所以此方案需要做一些定量的性能分析，防止引发劣化。

### 不用 HTML CSP meta 标签

部分网页出于安全要求，会在 HTML 里加入 CSP[3] meta tag，以防止一些 XSS 攻击。

```
<head>  <meta http-equiv="Content-Security-Policy" content="default-src 'self';"></head>
```

这种安全策略在业务角度上没什么问题，但是会**彻底破坏** `HTML Preload Scanner` 的优化。

在 chromium 的源码中，有这么一段逻辑：

```
// https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/parser/html_preload_scanner.cc;l=1275;bpv=0;bpt=1// Don't preload anything if a CSP meta tag is found. We should rarely find// them here because the HTMLPreloadScanner is only used for the synchronous// parsing path.if (seen_csp_meta_tag) {  // Reset the tokenizer, to avoid re-scanning tokens that we are about to  // start parsing.  source_.Clear();  tokenizer_->Reset();  return pending_data;}
```

也就是说，一旦解析到 CSP 相关的 meta 标签，就会清理所有 Preload 的内容，Preload Scanner 彻底失效。

那么如果我们有 CSP 要求，又不想破坏 HTML Preload Scanner 优化，应该怎么做呢？这个方案就是**使用 HTTP CSP Header**。

  

我本地做了几个测试，首先是一个没有任何 CSP 内容的网页，我们可以看到 Preload Scanner 是正常工作的：

![](https://mmbiz.qpic.cn/mmbiz_jpg/8MK8X2XQgu7RAUjY4Lbkv2Kt8oA3NMahicTUpB8WibsNLtKxvKKuhfEeAslXGAlWFhKwdV4Hud1ofeEodFljJ02Q/640?wx_fmt=jpeg&from=appmsg)normal  

加上 HTML CSP meta Tag，并行下载全都变成了串行加载，首屏性能大大劣化：

```
<head>  <meta http-equiv="Content-Security-Policy" content="default-src 'self';"></head>
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/8MK8X2XQgu7RAUjY4Lbkv2Kt8oA3NMahlBomJUX7r4d4qAYBczVu3ZLOlPM3Ksf6RdCNGZxqXZtDHib6KWVHeBg/640?wx_fmt=jpeg&from=appmsg)html-csp-meta-tag  

换成 HTTP CSP Header，Preload Scanner 还是正常工作的：

```
Content-Security-Policy: default-src 'self'
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/8MK8X2XQgu7RAUjY4Lbkv2Kt8oA3NMahq2wu5ATJ2eAJLLtPWDltDE5AzmszyliaCAiavwEavmAuvqPbnnXldDDw/640?wx_fmt=jpeg&from=appmsg)http-csp-header  

所以我们可以通过 HTTP CSP Header 的方案替换 HTML CSP Meta Tag，防止 Pre-Scan 失效。

总结
--

编写 HTML Preload Scanner 友好的前端代码，可以让浏览器的资源加载走在 happy path 上，优化 Web 的整体资源加载性能。

参考内容
----

*   [web.dev]: Don't fight the browser preload scanner[4]
    
*   [stackoverflow]: Content-Security-Policy meta tag preventing preload scanner to work properly in Chrome[5]
    
*   [MDN]: Content Security Policy (CSP)[6]
    
*   [chromium]: html_preload_scanner.cc[7]
    

* * *

> 📌
> 
> 如果你喜欢我的文章，希望点赞👍 收藏 📁 在看 🌟 三连支持一下，谢谢你，这对我真的很重要！

参考资料

[1]

FOUC: _https://en.wikipedia.org/wiki/Flash_of_unstyled_content_

[2]

2008 年: _https://webkit.org/blog/166/optimizing-page-loading-in-web-browser/_

[3]

CSP: _https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP_

[4]

[web.dev]: Don't fight the browser preload scanner: _https://web.dev/articles/preload-scanner_

[5]

[stackoverflow]: Content-Security-Policy meta tag preventing preload scanner to work properly in Chrome: _https://stackoverflow.com/questions/78114535/content-security-policy-meta-tag-preventing-preload-scanner-to-work-properly-in_

[6]

[MDN]: Content Security Policy (CSP): _https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP_

[7]

[chromium]: html_preload_scanner.cc: _https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/parser/html_preload_scanner.cc_