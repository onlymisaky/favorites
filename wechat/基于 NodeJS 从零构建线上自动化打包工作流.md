> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6619NcJjuPQsZhmikDZ-Og)

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacCWgFv8veQG419bwTbOnEdM7iaaZLxkYVUB3RUByDzBF1sBTB3C5XreVw/640?wx_fmt=png)

往期回顾
----

*   [在线 IDE 开发入门之从零实现一个在线代码编辑器](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247484960&idx=1&sn=a66317acb9cf4e4479af5e958e1ba286&chksm=fc531fdbcb2496cdbfded5a7de4ead698c87b64a3ecde070f8fc64a646cec0c615e4cb6bd818&scene=21#wechat_redirect)
    
*   [基于 React+Koa 实现一个 h5 页面可视化编辑器－Dooring](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247484899&idx=1&sn=6201740a33fc93f10b00d8ac20442971&chksm=fc531c18cb24950eb96f7226993ab86f2f19e3a7eb75c08faeeab9b872f0cd9c748b099a2f12&scene=21#wechat_redirect)
    
*   [深度剖析 github star 数 15.1k 的开源项目 redux-thunk](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247484871&idx=1&sn=d7706d9b7e2f75218d904926a55a2d17&chksm=fc531c3ccb24952a159c9fe38300658c43807c28d51ed525d7c8f1160c7116e89651e99ac740&scene=21#wechat_redirect)
    
*   [TS 核心知识点总结及项目实战案例分析](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247484847&idx=1&sn=d588860f98ed547f056cc89756cb6dd6&chksm=fc531c54cb249542ee4f58ed740f428bb9860428c54ba7251ad91e8a5e3345aed57932ee5091&scene=21#wechat_redirect)
    

前言  

-----

NodeJS 在前端领域正扮演着越越重要的地位，它不仅可以让前端工作者使用 javascript 编写后端代码，还能方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动，非阻塞 I/O 模型而得以轻量和高效，非常适合在分布式设备上运行数据密集型的实时应用。

所以作为一名优秀的前端工程师，非常有必要了解和掌握 Node.js。笔者接下来将通过对 H5-Dooring 项目中的实时在线下载代码功能来带大家掌握如何从零构建线上自动化打包工作流。

你将收获
----

*   设计一款在线工作流的基本思路
    
*   nodejs 常用 API 的使用
    
*   nodejs 如何使用父子进程
    
*   使用 child_process 的 exec 实现解析并执行命令行指令
    
*   socket.io 实现消息实时推送
    
*   使用 jszip 实现服务端压缩文件并支持前端下载 zip 包
    

正文
--

我们都用过诸如 gulp，webpack 之类的自动化工具，他们能很方便的帮我们打包编译代码，并以一种相对优雅的方式编写我们的工程代码。但是我们仔细思考之后就能发现， 这些产物的背后都是靠 nodejs 和 babel 做底层支持。我们无非就是设计一种架构模式，通过 babel 的加载器和 nodejs 的服务能力，将代码由 JS - AST - JS 的过程（这里忽略 css 和插件处理）。

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacC9c6VMNwnKmaXiaddCN1iagfR9JoDoO7lQx7TvaF9C3KU7A9DicjnBVUpw/640?wx_fmt=png)

在吹完牛逼之后，我们开始介绍如何设计一款在线工作流。

### **1. 设计一款在线工作流的基本思路**

在线工作流是个泛指，其实任何产品线都有属于自己特色的工作流，但最终还是要回归业务。所以笔者在这里专门介绍一下 H5-Dooring 的实时下载代码的在线工作流。我们看看下面的设计流程：

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacC81QIbqecGdXk2QUPUxia5PSQMgrjSte8JG9oHexBHAv38nebY9oqUdQ/640?wx_fmt=png)

以上就是我们需要做的在线实时打包下载代码的工作流，由于 nodejs 是单线程的，为了不阻塞进程我们可以采用父子进程通信的方式和异步模型来处理复杂耗时任务，为了通知用户任务的完成状况， 我们可以用 socket 做双向通信。在当前的场景下就是代码编译压缩完成之后，通知给浏览器，以便浏览器显示下载状态弹窗。一共有三种状态：进行中，已完成，失败。对应如下图所示界面：

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacCcoXaXKvskSwM7YE0YpDzlff0bzXQAyTQqicbbfvjJFZVUkV2DMYl0AA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacCnusaPC2kViarfCSH6UAW8lphp08uyo1tRaxYGcic2YchAPMicOZ6Jicdmg/640?wx_fmt=png)

至于为什么没有出现下载失败的状态，不要问我，问就是没有失败过（完了，找虐了）。

以上就是 H5-Dooring 实时编译下载的工作流设计，至于线上更多的实际需求，我们也可以参考以上设计去实现，接下来笔者来具体介绍实现过程。

### **2. nodejs 如何使用父子进程**

我们要想实现一个自动化工作流, 要考虑的一个关键问题就是任务的执行时机以及以何种方式执行. 因为用户下载代码之前需要等 H5 页面打包编译压缩完成之后才能下载, 而这个过程需要一定的时间（8-30s）, 所以我们可以认定它为一个耗时任务.

当我们使用 nodejs 作为后台服务器时, 由于 nodejs 本身是单线程的, 所以当用户请求传入 nodejs 时, nodejs 不得不等待这个 "耗时任务" 完成才能进行其他请求的处理, 这样将会导致页面其他请求需要等待该任务执行结束才能继续进行, 所以为了更好的用户体验和流畅的响应, 我们不得不考虑多进程处理. 好在 nodejs 设计支持子进程, 我们可以把耗时任务放入子进程中来处理, 当子进程处理完成之后再通知主进程. 整个流程如下图所示:

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacC2WSHgVaM6XTeeCxJ9ATxPzoUaa8oK7xF30FclDhFClYHYdVS3tgkvA/640?wx_fmt=png)

nodejs 有 3 种创建子进程的方式，这里笔者简单介绍一下 fork 的方式。使用方式如下：

```
// child.js
function computedTotal(arr, cb) {
    // 耗时计算任务
}

// 与主进程通信
// 监听主进程信号
process.on('message', (msg) => {
  computedTotal(bigDataArr, (flag) => {
    // 向主进程发送完成信号
    process.send(flag);
  })
});

// main.js
const { fork } = require('child_process');

app.use(async (ctx, next) => {
  if(ctx.url === '/fetch') {
    const data = ctx.request.body;
    // 通知子进程开始执行任务,并传入数据
    const res = await createPromisefork('./child.js', data)
  }
  // 创建异步线程
  function createPromisefork(childUrl, data) {
    // 加载子进程
    const res = fork(childUrl)
    // 通知子进程开始work
    data && res.send(data)
    return new Promise(reslove => {
        res.on('message', f => {
            reslove(f)
        })
    })
  }
  
  await next()
})

复制代码
```

在 H5-Dooring 线上打包的工作流中，我们会用到 child_process 的 exec 方法，来解析并执行命令行指令。至于父子进程的更多应用，大家可以自行探索。

### **3. 使用 child_process 的 exec 实现解析并执行命令行指令**

在上面介绍的 dooring 工作流中，我们知道为了实现实时打包，我们需要一个 H5 Template 项目，作为打包的母版，当用户点击下载时，会将页面的 json schema 数据传给 node 服务器， node 服务器再将 json schema 进行数据清洗最后生成 template.json 文件并移动到 H5 Template 母版中，此时母版拿到数据源并进行打包编译，最后生成可执行文件。

以上的过程很关键， 这里笔者画个大致的流程图：

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt01149DFaAJYHuYI6gfUBkGtiacClvRMq77iaM0PrQaF6jOLe61l0Nhz14g51yWrVhibb2AU1eVPUhGkHEjA/640?wx_fmt=png)

为了实现以上过程，我们需要两个关键环节：

1.  将用户配置的数据进行处理并生成 json 文件，然后移动到 H5 Template 母版中
    
2.  在母版中自动执行打包编译脚本
    

第一个环节很好实现，我们只需要用 nodejs 的 fs 模块生成文件到指定目录即可，这里笔者重点介绍第二个环节的实现。

当我们将 json 数据生成到 H5 Template 中之后，就可以进行打包了，但是这个过程需要自动化的去处理，不能像我们之前启动项目一样，手动执行 npm start 或者 yarn start。我们需要程序自动帮我们执行这个命令行指令，笔者在查 nodejs API 突然发现了 child_process 的 exec 方法，可以用来解析指令，这个刚好能实现我们的需求，所以我们开始实现它。代码如下：

```
import { exec } from 'child_process'
const outWorkDir = resolve(__dirname, '../h5_landing')
const fid = uuid(8, 16)
const cmdStr = `cd ${outWorkDir} && yarn build ${fid}`

// ...exec相关代码
const filePath = resolve(__dirname, '../h5_landing/src/assets/config.json')
const res = WF(filePath, data)

exec(cmdStr, function(err,stdout,stderr){
  if(err) {
    // 错误处理
  } else {
    // 成功处理
  }
})

复制代码
```

以上代码我们不难理解，我们只需要定义好打包的指令字符串（方式和命令行操作几乎一致），然后传入给 exec 的第一个参数，他就会帮我们解析字符串并执行对应的命令行指令。在执行完成之后，我们可以根据回调函数（第二个参数）里的参数值来判断执行结果。整个过程是异步的，所以我们不用担心阻塞问题，为了实时反馈进度，我们可以用 socket 来将进度信息推送到浏览器端。

### **4. socket.io 实现消息实时推送**

在上面介绍的 exec 实现解析并执行命令行指令 中还有一些细节可以优化，比如代码执行进程的反馈，执行状态的反馈。因为我们用的是异步编程，所以请求不会一直等待，如果不采取任何优化措施，用户是不可能知道何时代码打包编译完成， 也不知道代码是否编译失败，所以这个时候会采取几种常用的放案：

*   客户端请求长轮询
    
*   postmessage 消息推送
    
*   websocket 双向通信
    

很明显使用 websocket 双向通信会更适合本项目。这里我们直接使用社区比较火的 socket.io. 由于官网上有很多使用介绍，这里笔者就不一一说明了。我们直接看业务里的代码使用：

```
// node端
exec(cmdStr, function(err,stdout,stderr){
  if(err) {
    console.log('api error:'+stderr);
    io.emit('htmlFail', { result: 'error', message: stderr })
  } else {
    io.emit('htmlSuccess', { result: dest, message: stderr })
  }
})

// 浏览器端
const socket = io(serverUrl);
// ...省略其他业务代码
useEffect(() => {
  socket.on('connect', function(){
    console.log('connect')
  });
  socket.on('htmlFail', function(data){
    // ...
  });
  socket.on('disconnect', function(e){
    console.log('disconnect', e)
  });
}, [])

复制代码
```

这样我们就能实现服务器任务流的状态实时反馈给浏览器端了。

### **5. 使用 jszip 实现服务端压缩文件并支持前端下载 zip 包**

实现前端下载功能其实也很简单，因为用户配置的 H5 项目包含了各种资源，比如 css，js，html，image，所以为了提高下载性能和便捷性我们需要把整个网站打包，生成一个 zip 文件供用户下载。原理就是使用 jszip 将目录压缩，然后返回压缩后的路径给到前端，前端采用 a 标签进行下载。至于如何实现目录遍历压缩和遍历读取目录， 这里笔者就不说了，感兴趣的可以参考笔者其他的 nodejs 的文章。

### **6. 总结**

以上教程笔者已经集成到 H5-Dooring 中，对于一些更复杂的交互功能，通过合理的设计也是可以实现的，大家可以自行探索研究。

最后
--

如果想学习更多 H5 游戏, webpack，node，gulp，css3，javascript，nodeJS，canvas 数据可视化等前端知识和实战，欢迎在《趣谈前端》一起学习讨论，共同探索前端的边界。

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)  

[从零搭建全栈可视化大屏制作平台 V6.Dooring](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247489810&idx=1&sn=2663938569c4d361acae076bce9a9bf5&chksm=fc5300e9cb2489ff48db614f03093d71a81669bc6e0ccdf88b10af4a899b86ce59c6c95198b5&scene=21#wechat_redirect)  

[从零设计可视化大屏搭建引擎](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247489467&idx=1&sn=be4b2a7f92f1c62e66432158212aee78&chksm=fc530e40cb248756193998c50b2e5e75de96dbde98170f871faa7e6ea043a50f87b7fc4468cf&scene=21#wechat_redirect)

[Dooring 可视化搭建平台数据源设计剖析](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247487877&idx=2&sn=770ff16d69d3e7ac2bbcd78e97ab8f32&chksm=fc53087ecb2481685451a50e892fa889781788ca16a4ce689ec7f7fff1ae99c91ac8b82a160d&scene=21#wechat_redirect)  

[可视化搭建的一些思考和实践](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247487950&idx=1&sn=e674a2f9379b9c9b8a149498a50c17f8&chksm=fc530835cb2481233acc7ac2c856b30c7698dd9d2aec1514b5c2fa4165bc2728f7b261c4938f&scene=21#wechat_redirect)  

[基于 Koa + React + TS 从零开发全栈文档编辑器 (进阶实战](http://mp.weixin.qq.com/s?__biz=MzU2Mzk1NzkwOA==&mid=2247486910&idx=2&sn=7ce865dd8a8f6769439f0e8eebb72212&chksm=fc531445cb249d534a7d8a362ad40d26bc90f2d2e867385768ee19575e32826fcbe419fcbe0b&scene=21#wechat_redirect)

点个在看你最好看