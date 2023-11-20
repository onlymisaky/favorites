> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qDq3Lyo1zazUhuc3opC-gg)

**CSRF 攻击** 是前端领域常见的安全问题，概念方面不再赘述，可以参考维基百科。对于这些概念，包括名词定义、攻击方式、解决方案等估计大家都看过不少，但留下印象总是很模糊，要动手操作一番才能加深印象并能真正理解，所以我决定动手实现一个 CSRF 的攻击场景，并通过演示的方式讲解 CSRF 的防范手段。

*   CSRF 攻击流程
    
*   CSRF 模拟攻击
    
*   CSRF 防范方法
    

CSRF 攻击流程
---------

假设用户先通过 bank.com/auth 访问银行网站 A 的授权接口，通过认证后拿到 A 返回的 cookie: userId=ce032b305a9bc1ce0b0dd2a，接着携带 cookie 访问 bank.com/transfer?number=15000&to=Bob 银行 A 的转账接口转给 Bob 15000 元，然后 A 返回 success 表示转账成功。

钓鱼网站 B(hack.com) 通过邮件或者广告等方式引诱小明访问，并返回给小明恶意的 HTML 攻击代码，HTML 中会包含发往银行 A 的敏感操作：bank.com/transfer?number=150000&to=Jack ，此时浏览器会携带 A 的 cookie 发送请求，A 拿到请求后，只通过 cookie 判断是个合法操作，于是在小明不知情的情况下，账户里 150000 元被转给了 Jack，即恶意攻击者。

这样就完成了一次基本的 CSRF 攻击。

CSRF 攻击流程图如下：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXzVReApMvdSwaXxyzNhhr8ibBE3ngAuaibL0Pd0XtqXWIGlAh4lFibhD0A/640?wx_fmt=png)

如果现在看不懂没关系，可以看完演示再回头看此图就会恍然大悟了。

CSRF 模拟攻击
---------

首先通过 express 搭建后端，以模拟 CSRF 攻击。

启动银行 A 的服务器，端口 3001，包含 3 个接口：

```
app.use('/', indexRouter);app.use('/auth', authRouter);app.use('/transfer', transferRouter);
```

authRouter:

```
router.get('/', function(req, res, next) {  res.cookie('userId', 'ce032b305a9bc1ce0b0dd2a', { expires: new Date(Date.now() + 900000) })  res.end('ok')});
```

transferRouter：

```
router.get('/', function(req, res, next) {  const { query } = req;  const { userId } = req.cookies;  if(userId){    res.send({      status: 'transfer success',      transfer: query.number    })  }else{    res.send({      status: 'error',      transfer: ''    })  }});
```

使用 ejs 提供银行转账页面：

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta >  <title>    <%= title %>  </title></head><body>  <h2>    转账  </h2>  <script>    const h2 = document.querySelector('h2');    h2.addEventListener('click', () => {      fetch('/transfer?number=15000&to=Bob').then(res => {        console.log(res.json());      })    })  </script></body></html>
```

假设钓鱼网站 B 提供的恶意代码为：

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http://bank.com/transfer?number=150000&to=Jack" frameborder="0"></iframe></div>  <script>  </script></body></html>
```

并将其启动在 3002 端口，再通过 Whistle 进行域名映射，因为两者都是 Localhost 域名，而 Cookie 不区分端口，所以需要区分域名。

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXKmdIgVPt64giaMWW2XLmbAicQkzJkN8mVbPQ8eJhCyqZGO830q8nPfXQ/640?wx_fmt=png)

首先打开 Firefox 浏览器 (暂时不用 Chrome)，访问银行 A 的 /auth 获得授权：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXdYfPwib3H2qyUia1ANagJicPu2L3jice545e2RCf8qqv0pOaVfO3spW6dA/640?wx_fmt=png)

然后通过点击**转账**按钮发送请求 http://bank.com/transfer?number=15000&to=Bob 进行转账操作：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXRgbT4ba5WsicK8EGBWejv5KgrwF2Xyhua6ClkrVWagQPrNvtC5nSpNw/640?wx_fmt=png)

用户收到诱惑进入了 hack 网站，hack 网站首页有一个发往银行 A 的请求 http://bank.com/transfer?number=150000&to=Jack , 这个请求可以放在 iframe、img、script 等的 src 里面。

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXIzibLWia7VfokpsIMYDZL2WqC6JCtJvpfjwfteegiavSqfEtAicBmrTR3A/640?wx_fmt=png)

可以看到请求携带 cookie，并成功转账，这样一次 CSRF 攻击就完成了。当然这是一次简单的 GET 请求的攻击，POST 请求攻击可以通过自动提交表单实现，比如：

```
<form action="bank.com/transfer" method=POST>    <input type="hidden"  /></form><script> document.forms[0].submit(); </script>
```

从上面可以看出，CSRF 攻击主要特点是：

1.  发生在第三方域名 (hack.com)。
    
2.  攻击者只能使用 cookie 而拿不到具体的 cookie。
    

针对以上特点，我们就能进行对应的防范了。

CSRF 防范方法
---------

CSRF 防范方法通常有以下几种：

1.  阻止不同域的访问
    

1.  同源检测。
    
2.  Samesite Cookie。
    

3.  提交时要求附加本域才能获取的信息。
    

1.  添加 CSRF Token。
    
2.  双重 Cookie 验证。
    

### 同源检测 - 通过 Origin 和 Referer 确定来源域名

针对第一个特点进行域名检查，HTTP 请求时会携带这两个 Header，用于标记来源域名，如果请求来源不是本域，直接进行拦截。

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXlJibxqeXpu6fJHdQRZ8FW5utpnFZTCHx9H8dTOIANadJvSjia8vmozDA/640?wx_fmt=png)

但是这两个 Header 也是可以不携带的，所以我们的策略是校验如果两个 Header 不存在或者存在但不是本域则阻拦。

修改 transferRouter 代码如下：

```
const csrfGuard = require('../middleware/csrfGuard')/* GET users listing. */router.get('/', csrfGuard, function(req, res, next) {  const { query } = req;  const { userId } = req.cookies;  if(userId){    res.send({      status: 'transfer success',      transfer: query.number    })  }else{    next()  }});router.get('/', function(req, res, next) {  res.send({    status: 'error',    transfer: ''  })});
```

csrfGuard.js:

```
module.exports = function(req, res, next){  const [Referer, Origin] = [req.get('Referer'), req.get('Origin')]  if(Referer && Referer.indexOf('bank.com') > 0){    next();  }  else if(Origin && Origin.indexOf('bank.com') > 0){    next();  }else{    next('route')  }}
```

验证：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXiaO77jicqhauYicMhXJPficiac0JL1f38H4jkjC4TPcPktDFSB8vaYRVodQ/640?wx_fmt=png)

### Samesite Cookie

在敏感 cookie 上携带属性 Samesite：Strict 或 Lax，可以避免在第三方不同域网站上携带 cookie，具体原因可以参考阮一峰老师的 Cookie 的 SameSite 属性。

```
// authRouter.jsrouter.get('/', function(req, res, next) {  res  .cookie('userId', 'ce032b305a9bc1ce0b0dd2a', { expires: new Date(Date.now() + 900000), sameSite: 'lax' })  res.end('ok')});
```

查看 bank.com cookie:

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXX4yv4IWQUD5vYgyw5ia5o36aQpyKsqyiayhktWogNhkBkXEkW5lPwiamdQ/640?wx_fmt=png)

再次访问 hack.com，发现转账链接并未携带 cookie：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXbdQrkiaEBNTkVqaAVRdqAr8FRzmKIlOfyqwIRHlSprwFDlHrkwaaJFQ/640?wx_fmt=png)

这样就达到了防范的目的，兼容性 目前来看还可以，虽然没有达到完美覆盖，但大部分浏览器也都支持了

> PS: 前面之所以没有使用 Chrome 浏览器做实验，是因为从 Chrome 80 版本起，Samesite 被默认设置为了 Lax，而 Firefox 仍然为 None。

### 添加 CSRF Token

首先服务器生成一个动态的 token，传给用户，用户再次提交或者请求敏感操作时，携带此 token，服务端校验通过才返回正确结果。

改写 indexRouter，使其返回 token 给页面：

```
var express = require("express");var router = express.Router();const jwt = require("jsonwebtoken");router.get("/", function (req, res, next) {    res.render("index", { title: "Express", token: jwt.sign({      username: 'ming'    }, 'key', {      expiresIn: '1d'    }) });});module.exports = router;
```

前端页面：

```
// index.ejs<body>  <h2>    转账  </h2>  <span id='token' data-token=<%= token %>></span>  <script>    const h2 = document.querySelector('h2');    const tokenElem = document.querySelector('#token');    const token = tokenElem.dataset.token;    h2.addEventListener('click', () => {      fetch('/transfer?number=15000&to=Bob&token=' + token).then(res=>{        console.log(res.json());      })    })  </script></body>
```

将 transferRouter 的验证中间件改成 token 验证：

```
const tokenVerify = require('../middleware/tokenVerify')router.get('/', tokenVerify, function(req, res, next) {  const { query } = req;  const { userId } = req.cookies;  if(userId){    res.send({      status: 'transfer success',      transfer: query.number    })  }else{    next()  }});
```

JWT 验证：

```
const jwt = require("jsonwebtoken");module.exports = function(req, res, next){  const { token } = req.query;  jwt.verify(token,'key', (err, decode)=> {    if(err){      next('route')    }else{      console.log(decode);      next()    }  })}
```

携带 token 正常访问成功：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXRehOj3AtACJHicY7UWGmiaqqQTqOGj7fWHI2kQuIug68SDEtycy9Q2gQ/640?wx_fmt=png)

钓鱼网站拿不到 token 所以攻击失败：

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXXiaO77jicqhauYicMhXJPficiac0JL1f38H4jkjC4TPcPktDFSB8vaYRVodQ/640?wx_fmt=png)

以上为加深理解而写的代码，而在生产环境中，node 可以使用 csurf 中间件来防御 csrf 攻击

### 双重 Cookie 验证

设置一个专用 cookie，因为攻击者拿不到 cookie，所以将 cookie 种到域名的同时，访问敏感操作也需要携带，攻击者带不上 cookie，就达到了防范的目的。

```
// authRouter.jsconst randomString = require('random-string');/* GET users listing. */router.get('/', function(req, res, next) {  res  .cookie('userId', 'ce032b305a9bc1ce0b0dd2a', { expires: new Date(Date.now() + 900000) })  .cookie('csrfcookie', randomString(), { expires: new Date(Date.now() + 900000) })  res.end('ok')});
```

bank.com 银行转账页面：

```
<script>    const h2 = document.querySelector('h2');    const csrfcookie = getCookie('csrfcookie')    h2.addEventListener('click', () => {      fetch('/transfer?number=15000&to=Bob&csrfcookie=' + csrfcookie).then(res => {        console.log(res.json());      })    })  </script>
```

验证中间件：

```
// doubleCookie.js module.exports = function(req, res, next){  const queryCsrfCookie = req.query.csrfcookie  const realCsrfCookie = req.cookies.csrfcookie;  console.log(queryCsrfCookie, realCsrfCookie);  if(queryCsrfCookie === realCsrfCookie){    next()  }else{    next('route')  }}
```

银行 bank.com:

![](https://mmbiz.qpic.cn/mmbiz_png/SM05zvmibH7KMMEiaf2ribSfRDkm3qEvzXX7CJMrymIdsxwc3JnKOygSru2RektqeIia3WVRhMV9p5dmYt3ZOulnhA/640?wx_fmt=png)

而 hack.com 拿不到 csrfcookie 所以验证不通过。

这个方法也是很有效的，比如请求库 axios 就是用的这种方式。

总结
--

到这里大家是不是已经明白了 CSRF 攻击的原因所在，并可以提出针对性的解决方案了呢，防范关键其实就是防止其他人冒充你去做只有你能做的敏感操作，与此同时希望大家对于这类抽象性的问题可以自己动手敲一下，模拟一遍，用造重复轮子的方法去理解，动手比动眼管用的多。

以上过程和代码仅仅为帮助学习并做演示使用，如果用于生产力还是需要更成熟的解决方案。

关于奇舞精选
------

《奇舞精选》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 Ecma 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib5ST16cnaTqgmpl8hmO590b8zMmucDKiaETYcibwhw5nhuuQB00IjicrBlTaChiauBuGiaWnkL5HFic8Ribw/640?wx_fmt=png)