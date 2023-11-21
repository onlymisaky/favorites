> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4lVYGfq26ckpDds297XxXg)

> **当下圈内比较火的非 chatGPT 莫属了。**

chatGPT 回复效果
------------

相信使用过 **chatGPT** 的朋友，都会看到，当你提问一个问题时，**chatGPT** 会一字一字地给你展示出来，而不是一次性给你返回，如下图：

![](https://mmbiz.qpic.cn/mmbiz_gif/TZL4BdZpLdgDLqfnILVWRguCAUK2y1iaiaZzqpKibOKw5ic1jOesBq420ibDVGeH96fPUeSdBlmSPibDkILojt3EjtKg/640?wx_fmt=gif)

这样做的好处，我想应该是节省性能吧，并且应该也是因为 AI 需要一边学习，一边把学习到的结果返回到前端，所以需要这样持续输出

怎么实现的？
------

一开始我联想到 **Websocket**，因为它能做到跟前端建立长连接，不断向前端输送东西，但是我一打开 Network 界面，看到用的不是 Websocket，而是 **Server-sent events**

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgDLqfnILVWRguCAUK2y1iaiaeI4MbLQPAy9FxTicFzSaEuD7WfoeDRL4bBgTe9Kiav0ibu9TXQIvR3PkA/640?wx_fmt=png)

Server-sent events
------------------

一个网页获取新的数据通常需要发送一个请求到服务器，也就是向服务器请求的页面。使用 server-sent 事件，服务器可以在任何时刻向我们的 Web 页面推送数据和信息。这些被推送进来的信息可以在这个页面上作为 Events + data 的形式来处理。

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgDLqfnILVWRguCAUK2y1iaia4EUORDMe9agzDsqs98NMN62ick6ibIrVyRLwLH2zWhP5vq1whbNJvWDA/640?wx_fmt=png)

### EventSource

想要使用 Server-sent events，就不得不依赖到一个 API —— EventSource

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgDLqfnILVWRguCAUK2y1iaiaI7pgDYaLWZzMZs0XiacIIGtvZwfsxGicSP8KV4KoG00pYURMkdK9fBQA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgDLqfnILVWRguCAUK2y1iaia5NmibPJKnOXrcxWg5QSmS2t6ibWic6GgiabW0QAVSBdyu2rrV24ibDxk4GA/640?wx_fmt=png)

实现
--

接下来带大家来简单实现以下吧！

### Nodejs 起服务

Nodejs 起服务需要注意几个响应头

*   'Content-Type': 'text/event-stream'
    
*   'Connection': 'keep-alive'
    
*   'Access-Control-Allow-Origin': '*'
    

```
const http = require('http');// 将歌词变成一个数组let song = [  '我', '懒', '得', '写', '你', '谷', '搜', '到', '处', '皆', '只', '因', '你',   '太', '美', '浅', '唱', '动', '人', '说', '不', '出', '我', '试', '着', '多',   '看', '你', '一', '眼', '却', '发', '现', '我', '已', '沉', '溺', '于', '你',   '的', '镜', '头', '里', '只', '因', '你', '太', '美', '所', '以', '我', '多',   '看', '了', '一', '眼', '只', '因', '我', '太', '傻', '所', '以', '我', '放',   '不', '开', '你', '的', '手', '只', '因', '你', '太', '美', '所', '以', '我',   '做', '了', '个', '梦', '梦', '见', '你', '在', '微', '笑', '我', '在', '注',   '视', '只', '因', '你', '太', '美', '所', '以', '我', '放', '了', '你', '的',   '手', '所', '以', '我', '会', '微', '笑', '因', '为', '你', '太', '美', 'end'];http.createServer((req, res) => {  if (req.url === '/article') {    res.writeHead(200, {      // 开启 Server-sent events      'Content-Type': 'text/event-stream',      'Cache-Control': 'no-cache',      // 保持连接      'Connection': 'keep-alive',      // 允许跨域      'Access-Control-Allow-Origin': '*'    });    let index = 0;    // 模拟每隔0.5s向前端推送一次    setInterval(() => {      const s = song[index];      if (s) {        res.write(`data: ${song[index]}\n\n`);      } else {        res.write('0');      }      index++;    }, 500);  }}).listen(3000);console.log('Server running at http://localhost:3000/');
```

前端
--

```
// 建立连接const source = new EventSource('http://localhost:3000/article');let str = '';// 接收信息source.onmessage = function (e) {  if (e.data === 'end') {    // 判断end，关闭连接    source.close()  }  str += e.data  // 实时输出字符串  console.log(str)};
```

效果
--

现在我们可以去前端看效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/TZL4BdZpLdgDLqfnILVWRguCAUK2y1iaiamzMQyOLyrkNWXXh6dFIcLE6LyCarQyeX8wQVxw4Jzd47Iddc8tALzw/640?wx_fmt=gif)

我们只需要把这个字符串，实时渲染到页面上就行了，就能实现一个字一个字打出来的效果！！！！

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)