> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nNNz3EbiCafVqPakhFbpcw)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

最近发现 Chrome 团队在博客更新了一篇文章，表示 `YouTube` 要实施 `Trusted Types`（可信类型）了，要求相关插件的开发者尽快完成改造，不然插件可能就用不了了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTKYnibVHD2ZqCeQ4QLJO1x8DasiblfR7ozPmnD5vyiagyRmxB1tW2qejDhc1UBgMLe7ClAy9fscIrgQ/640?wx_fmt=png&from=appmsg)

> `Trusted Types` 要求第三方浏览器扩展程序在为 `DOM API` 赋值时使用类型化对象而不是字符串。自 2024 年 7 月 25 日起，不符合 `Trusted Types` 安全要求的浏览器扩展程序可能会在强制执行后停止运行，因此我们鼓励相应的开发者遵循 “预防基于 DOM 的跨站点脚本漏洞” 指南，以确保浏览器扩展程序与新的 `YouTube` 安全标准兼容。

其实 `Trusted Types`（可信类型）在我之前的文章里也介绍过：

[聊一下 Chrome 新增的可信类型（Trusted types）](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247490368&idx=1&sn=751df0276545503c412c5063fed8086b&chksm=c2e2ee6bf595677df01762a7b1fefb21282eff45b74d7b3c56bdd7de4b93cb56eec2da76f7f5&token=313636743&lang=zh_CN&scene=21#wechat_redirect)

不过当时它还是一个非常早期的提案，过了很久都没什么动静，我以为要凉凉了，然而最近发现 `YouTube` 这样大的站点居然都要开始实施它了，说明这个提案已经逐步走向标准化，并且开始被大家所认可了。

今天我们就继续来聊聊 `Trusted Types` ，看看 `YouTube` 为什么要求开发者做改造才能继续使用呢？

多年来，`DOM XSS` 一直是最普遍且最危险的网络安全漏洞之一。

跨站脚本攻击（`XSS`）有两种类型。一些 `XSS` 漏洞是由服务端代码不安全地拼接构成网站的 `HTML` 代码引起的。另一些则根源于客户端，即 `JavaScript` 代码将用户可控的内容传入危险函数。

为了防止服务器端 `XSS`，尽量不要通过拼接字符串的方式来生成 `HTML`。相反，使用安全的上下文自动转义模板库，并结合基于 `nonce` 的内容安全策略（`Content Security Policy`）来进一步减少漏洞。

> 基于 `nonce` 的内容安全策略（`Content Security Policy`），这个可能很多同学理解不了，其实它也是用来防护 XSS 风险的一个非常好的手段，在后面的文章里我会给大家讲解。

而浏览器现在推出的 `Trusted Types` 就是防护 `DOM` 型的 `XSS` 攻击的。

Trusted Types 的工作原理
-------------------

基于 `DOM` 的跨站脚本攻击（`DOM XSS`）一般发生在用户可控的源（如用户名或从 `URL` 片段中获取的重定向 `URL`）数据到达一个接收点时，这个接收点是一个可以执行任意 `JavaScript` 代码的函数（如 `eval()`）或属性设置器（如 `.innerHTML`）。

`Trusted Types` 的工作原理就是锁定以下风险接收函数，并且保障这些函数的调用方式，或者传入的参数一定是安全的。

脚本操作：

*   `<script src>` 和设置 `<script>` 元素的文本内容。
    

从字符串生成 HTML：

*   `innerHTML`
    
*   `outerHTML`
    
*   `insertAdjacentHTML`
    
*   `<iframe> srcdoc`
    
*   `document.write`
    
*   `document.writeln`
    
*   `DOMParser.parseFromString`
    

执行插件内容：

*   `<embed src>`
    
*   `<object data>`
    
*   `<object codebase>`
    

运行时 JavaScript 代码编译：

*   `eval`
    
*   `setTimeout`
    
*   `setInterval`
    
*   `new Function()`
    

`Trusted Types` 要求我们在将数据传递给这些接收函数之前必须要对其进行处理。

如果仅使用字符串的话就会被阻止，因为浏览器不知道数据是否可信：

❌ 危险的做法：

```
anElement.innerHTML = location.href;
```

启用 `Trusted Types` 后，浏览器会抛出一个 `TypeError`，并防止使用字符串作为 `DOM XSS` 接收点。

为了表明数据已被安全处理，需要创建一个特殊对象 —— `Trusted Type`。

✅ 安全的做法：

```
anElement.innerHTML = aTrustedHTML;
```

启用 `Trusted Types` 后，浏览器会要求这些传入的参数必须是 `TrustedHTML` 对象，另外对于其他的一些敏感接收点，还有 `TrustedScript` 和 `TrustedScriptURL` 对象。

听起来可能有点抽象，我们来举几个具体的例子，下面几种场景会被 `Trusted Types` 认为是安全的：

#### 1. 使用结构化的对象动态创建 `DOM` ，而不是使用 `innerHTML`：

```
element.textContent = '';const img = document.createElement('img');img.src = 'ConardLi.jpg';element.appendChild(img);
```

#### 2. 使用支持可信类型的三方库处理后的数据：

比如我们可以使用 `DOMPurify` 清理 `HTML` 中的危险代码：

```
import DOMPurify from 'dompurify';element.innerHTML = DOMPurify.sanitize(html, {RETURN_TRUSTED_TYPE: true});
```

> `DOMPurify` 已经支持了可信类型，并返回封装在 `TrustedHTML` 对象中的经过清理的 `HTML`，以免浏览器生成违规行为。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTKYnibVHD2ZqCeQ4QLJO1x8JbxMkpLC4v9t6DlKNkZgetDXjIY4y9hwINvWW2sAYf6mATqt7KZJtg/640?wx_fmt=png&from=appmsg)

另外，这个列表里列举了所有已经和 `Trusted Types` 集成的开源库：

https://github.com/w3c/trusted-types/wiki/Integrations

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTKYnibVHD2ZqCeQ4QLJO1x8FaXaMytWkCnVcmEuNGBCwbiaXicr7OJoyBHk2cFwYeib1LibeicDHTdCwHw/640?wx_fmt=png&from=appmsg)

#### 3. 自己创建可信类型策略

有的时候我们可能没办法移除导致违规的代码，而且也没有任何库可以用来清理危险代码，在这些情况下，我们可以自行创建可信类型对象。

```
// 检查浏览器是否支持 Trusted Types 以及是否可以创建策略if (window.trustedTypes && trustedTypes.createPolicy) {   // 创建一个名为 'myEscapePolicy' 的策略，用于转义 HTML 字符 '<'  const escapeHTMLPolicy = trustedTypes.createPolicy('myEscapePolicy', {    createHTML: string => string.replace(/\</g, '<')  });}// 使用上面定义的策略来转义 HTML 字符串const escaped = escapeHTMLPolicy.createHTML('<img src=x onerror=alert(1)>');// 验证转义后的结果是否为 TrustedHTML 实例console.log(escaped instanceof TrustedHTML);  // true// 将转义后的 HTML 安全地插入到 DOM 中el.innerHTML = escaped;  // '<img src=x onerror=alert(1)>'
```

还有一些情况，比从 `CDN` 加载第三方库时，我们无法更改违规代码。在这种情况下，可以使用默认策略：

```
if (window.trustedTypes && trustedTypes.createPolicy) { // Feature testing  trustedTypes.createPolicy('default', {    createHTML: (string, sink) => DOMPurify.sanitize(string, {RETURN_TRUSTED_TYPE: true})  });}
```

如何实施 Trusted Types？
-------------------

`Trusted Types` 目前也是基于 `CSP` 来实施的，我们可以在 `CSP` Header 中增加下面的指令：

```
Content-Security-Policy: require-trusted-types-for 'script';
```

这就表示要求网站上所有以上提到的风险函数，比如符合 `Trusted Types` 要求才能继续执行，否则就会被拦截。

这也是为什么 `YouTube` 要求广大插件开发者做相应的安全改造，因为这些插件往往有很多更改 `DOM` 的操作，如果不按照 `Trusted Types` 的要求进行改造，插件就可能挂掉。

当前，直接增加这个指令，特别是对于一些比较老的网站，可能会带来一些负面影响，我们也不确定一次性是不是可以改的全，所以一般我们会先使用 Report Only 模式进行观察：

```
Content-Security-Policy-Report-Only: require-trusted-types-for 'script'; report-uri //my-csp-endpoint.example
```

通过配置 `report-uri` 或者 `Reporting API` ，我们可以先在浏览器检测到违规行为时上报到我们提供的一个服务器，而不是直接进行拦截，上报的格式如下：

```
{"csp-report": {    "document-uri": "https://www.conardli.top",    "violated-directive": "require-trusted-types-for",    "disposition": "report",    "blocked-uri": "trusted-types-sink",    "line-number": 17,    "column-number": 17,    "source-file": "https://www.conardli.top/script.js",    "status-code": 0,    "script-sample": "Element innerHTML <img src=x"}}
```

这表示在 `https://www.conardli.top/script.js` 的第 17 行中，使用以 `<img src=x` 开头的字符串调用了 `innerHTML`。

Trusted Types 断点
----------------

为了方便开发者进行调试，`Chrome Devtools` 还专门提供了用于 `Trusted Types` 的断点：

在 `Sources` 选项卡的 `Breakpoints` 窗格中，转到 `CSP Violation Breakpoints` 部分并启用以下选项之一或同时启用这两个选项，然后执行代码：  

勾选 `Sink Violations`：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTKYnibVHD2ZqCeQ4QLJO1x8D2ZLc2XGVyDERKAABMtNm1oJXctsiat0Rwsicu03uibJy8FiaxAFVlvH9w/640?wx_fmt=png&from=appmsg)

勾选 `Policy Violations`：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTKYnibVHD2ZqCeQ4QLJO1x8ialtHiahhEhErPIJXn97Bde1G8Uy3yEuPEUmRcpUUtRoeauTVH5yr8nw/640?wx_fmt=png&from=appmsg)

Trusted Types Polifill
----------------------

`ES5 / ES6` 版本可以直接在浏览器中加载。浏览器 `polyfill` 有两种提供方式 - `api_only (light)` 和 `full`。`api_only` 定义了 `API`，我们可以用来创建策略和类型。完整版本还基于从当前文档推断的 `CSP` 策略，在 DOM 中启用类型强制。

```
<!-- API only --><script src="https://w3c.github.io/webappsec-trusted-types/dist/es5/trustedtypes.api_only.build.js"></script><script>     const p = trustedTypes.createPolicy('foo', ...)     document.body.innerHTML = p.createHTML('foo'); // works     document.body.innerHTML = 'foo'; // but this one works too (no enforcement).</script>
```

```
<!-- Full --><script src="https://w3c.github.io/webappsec-trusted-types/dist/es5/trustedtypes.build.js" data-csp="trusted-types foo bar; require-trusted-types-for 'script'"></script><script>    trustedTypes.createPolicy('foo', ...);    trustedTypes.createPolicy('unknown', ...); // throws    document.body.innerHTML = 'foo'; // throws</script>
```

在 Node.js 环境中，也提供了专门的 NPM 包：

安装：

```
$ npm install trusted-types
```

使用：

```
const tt = require('trusted-types'); // or import { trustedTypes } from 'trusted-types'
```

最后
--

参考：

*   https://github.com/w3c/trusted-types
    
*   https://web.dev/articles/trusted-types
    
*   https://developer.chrome.com/blog/trusted-types-on-youtube
    

抖音前端架构团队目前放出不少新的 HC ，又看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️