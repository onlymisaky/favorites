> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QCPVC6KGp-cpGVbj0PNRbQ)

作者： vivo 互联网前端团队 - Han Xuejian、Zhang Hao

**目录**

01. 背 景

02. 利剑一：录制回放工具

03. 利剑二：远程调试工具

04. 利剑三：WEB 多人抓包代理工具

05. 总 结

异地协作模式，给开发和测试间的问题沟通及定位带来了诸多挑战。本文从前端开发视角出发， 阐述在这过程中遇到的痛点，探索解决的思路，并在过程中成功孵化出技术工具 “前端三剑客”，文章深入解析了“前端三剑客” 技术的实现原理及应用场景。

1 分钟看图掌握核心观点👇

![](https://mmecoa.qpic.cn/sz_mmecoa_gif/4g5IMGibSxt7TzGkEFBLibNk969cjd5ekbapKHXrCOWaYjFnk2s5P4C5OPw9aEtHJbZNP8rN2thag6tkFR2tadtQ/640?wx_fmt=gif&from=appmsg#imgIndex=0)

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnQ2z3eopMRNmibLlHQ1EwO6LskfJVGIrcQg7EBZ7PD6z0W4vx1iaibHGTg/640?wx_fmt=png&from=appmsg#imgIndex=1)

_**01**_

背  景

随着公司业务的不断发展，异地协作成为一种常态，距离无疑给我们的沟通带来了很多不便，尤其是给问题反馈及解决增加了更多的成本，在这过程中我们遇到了很多**痛点**：

**痛点一：沟通效率低**

开发和测试只能通过消息或者电话进行沟通，为了将问题描述清晰，双方需要反复交流，有时还需提供录屏、截图以及抓包等信息，整个过程耗时长、效率低。

**痛点二：复现难、定位难**

经常会出现一些问题，开发在本地无法复现，需要使用特定的手机进行复现、解决。

**痛点三：抓包协作难**

分析问题时，经常需要抓包，但是目前主流的抓包工具都是 1 对 1，对于异地实时抓包不是很方便，而且分享抓包内容也比较繁琐，无法在线实时查看。

为解决这些问题，我们基于开源工具与自研技术栈，孵化出**前端三剑客**：

*   **利剑一：**录制回放工具 - 让沟通更简单
    
*   **利剑二：**远程调试工具 - 像本地调试一样调试远程机器
    
*   利剑三：WEB 多人抓包代理工具 - 在线抓包，更简单、更实时、更便捷
    

这是一套覆盖问题复现、远程调试、便捷抓包的一整套解决方案，助力开发人员快速、精准地分享解决问题。

_**02**_

利剑一：录制回放工具

2.1

**工具介绍**

对于前端开发而言，和测试沟通问题时，问的最多的几个问题：

*   你是怎么操作的？
    
*   控制台有什么报错吗？
    
*   抓个包给我看下接口请求数据吧？
    

总结归纳起来就是以下三点：

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICn1ic53XZP4EpEibeaVw0kZhhic1pHL173dY49aoCyGO7gAnrplmiaqRMsMA/640?wx_fmt=png&from=appmsg#imgIndex=2)

基于以上的述求，我们基于开源框架 rrweb，实现了从前台接入管理、后台回放管理及权限管控的一站式录制回放平台，接入简单，一键便可录制宿主信息、操作过程、接口信息、日志信息等数据。

**录制过程**

接入录制回放工具后，页面会出现一个悬浮球，用于开启和提交录制信息，录制完成后，会生成在线回放地址。录制过程如下图所示：

![](https://mmecoa.qpic.cn/sz_mmecoa_gif/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnDty0OGovdHfawNOocbXsCZATLIianNmaQWzsUBAmic4aAVoVVTtdGxaw/640?wx_fmt=gif&from=appmsg#imgIndex=3)

**回放过程**

录制成功后，后台管理系统中便能查询到该条录制信息，点击回放，可以看到该问题的操作过程，以及浏览器信息、接口信息、日志信息等数据，如下图所示：

![](https://mmecoa.qpic.cn/sz_mmecoa_gif/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnngtfmyMgJMAg7C9cu78QOsDW5w0RcOdvmhdnibwbLqoz1V0trHuicHlA/640?wx_fmt=gif&from=appmsg#imgIndex=4)

**整个操作的流程如下图：**

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICngEwll5vxzImiappTUNhTEyP1HrowWGSiaf9tO38Xw6lAYvc1NkRN9kJw/640?wx_fmt=png&from=appmsg#imgIndex=5)

2.2

**接入方式**

我们提供了一个在线 sdk，用户只需引入该 js 文件，进行初始化即可使用：

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnq56fNrfFDPKyeJ9XCicuMUCj8bGJbib1WYyT1dWedSy70EOGibMEvxAXw/640?wx_fmt=png&from=appmsg#imgIndex=6)

2.3

**实现原理**

**记录页面 DOM 变化**

录制过程：

在初始化时使用 document.cloneNode(true) 方获取页面的全量 DOM 快照，之后通过 Mutation-

Observer 监听器监控页面的各种变化，如 DOM 的增删改、鼠标移动、滚动以及页面大小调整等，当这些变化发生时，会将变化信息序列化为 JSON 格式的数据并存储起来。

回放过程：  
读取记录的 JSON 数据，解析出页面的初始快照以及各个操作事件的时间序列，根据初始快照重建页面的 DOM 树，然后按照事件的时间顺序逐步应用每个操作事件。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnj7SyQBQOonLWeP13vomtFMiakm4zSXnIW1jibNRSqX76525RkSEHjUlg/640?wx_fmt=png&from=appmsg#imgIndex=7)

**接口录制**

通过对全局 XMLHttpRequest 进行重写进行接口的拦截处理。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnEBIt39XXDEWAEZOkXOfXdjvfyUfyxd1ZX4IYyiaHricibibwq8HBLhekow/640?wx_fmt=png&from=appmsg#imgIndex=8)

**日志录制**

通过对全局 console.log 进行重写

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICn907SYlfGaXwvInPPgZ3HhHM7QL8TBGRicNJfNEicRILYZDWcYMGgEL1g/640?wx_fmt=png&from=appmsg#imgIndex=9)

2.4

**遇到的问题**

**问题 1：跨页面录制**

我们是通过在 index.html 中引入 sdk，对于单页应用，切换路由时，录制可以连贯的衔接上，但是当遇到多页面的应用时，切换页面，会重新加载 sdk，这样数据就会丢失，无法进行衔接，所以我们需要在切换页面时将录制数据存在本地，进入下一个页面时，获取这些数据进行合并，如下图：

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnqfmP3Pic5rlgC4zJj4ibib0M7mO1yeYbX38MKpqXYcyb5icOic4NwLa9F8w/640?wx_fmt=png&from=appmsg#imgIndex=10)

**问题 2：iframe 页面无法录制**

对于很多后台的项目，可能存在很多 iframe 嵌入的子项目，如果 iframe 中的内容与父页面不在同一个域下，为了能够正常录制 iframe 中的内容，需要进行跨域处理，在 iframe 的页面中也嵌入 sdk，并设置相应的跨域属性，记录数据，并通过 iframe.content-

Window.postMessage 来同步数据到主页面中。

_**03**_

利剑二：远程调试工具

3.1

**工具介绍**

远程调试工具是基于开源工具 chii 进行二次封装，相较于 vConsole,chii 让跨设备、跨网络的 Web 应用调试变得简单便捷。通过远程连接的方式，像本地数据线连接手机一样，在本地的 chrome Devtools 中进行问题定位，实现和在 chrome://inspect 中一样的设备调试效果。远程调试工具很好的解决了开发因为本地无法复现，需要测试同学手上特定机器才能复现的问题，同时可以在远程看到页面实时运行的日志、接口等信息，大大提升问题定位效率。

下面是整个操作步骤：

**第一步：**如下图，点击页面中的悬浮球，出现远程调试按钮，点击可以开启远程调试。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnbIm4Ob7NXxGcekYtWblfYqQq2v1cMP4vp6LfsAZz3ia8F959IruDdbg/640?wx_fmt=png&from=appmsg#imgIndex=11)

**第二步：**在管理平台的远程列表中可以看到所有连接的设备。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnJOMH3qucKokvjSmcNvhIpw7K2LWqPFg54QAHVKRTlYg4tcpv4zZFQA/640?wx_fmt=png&from=appmsg#imgIndex=12)

**第三步：**远程查看，点击上一步骤中的 inspect 按钮，可以进入如下调试页面。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnWTcURbSIT2apECfrHQibKTao88nQNq8ichic7Cu5G6N3M0fD2RANhWfDQ/640?wx_fmt=png&from=appmsg#imgIndex=13)

**第四步：**双向操作同步

在手机执行操作，远程界面同步发生变化，实时显示请求和日志，同样如果远程修改样式或者执行操作，手机端也会同步执行相同操作。

3.2

**接入方式**

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICn4AsRdmGibXTwNMcXFgiaeuUib9Oib5SyyowalboeeceyiaCjQYKBTUSQalQ/640?wx_fmt=png&from=appmsg#imgIndex=14)

3.3

**实现原理**

远程调试工具主要包括三个部分：**客户端**，**中转服务**，**远程调试端 (devtools)**。

它们的运转模式如下图：

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnmvzKz6VwVibLeQlaickCBvugDAunEtBypwIFuOGbJHHGnUniclbLgOySg/640?wx_fmt=png&from=appmsg#imgIndex=15)

**第一步：**启动一个 node 服务作为中转服务器，然后创建 webSocket 服务用来连接客户端和远程调试端。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICn5xXXuslpT56jfcVGbIYtu95a9MlO2n4ZetGuNHjrKA0Jann5TtXEHA/640?wx_fmt=png&from=appmsg#imgIndex=16)

**第二步：**在客户端需要调试的网页中注入 target.js 脚本，该脚本会创建 WebSocket 连接，通过订阅发布来监听 DOM、Log、Network、Css、Storage、Debug 等相关操作指令。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnEcZ6kibsFdBbvnpsooRBHuJnNLrVqk0GMxCsB68yY3icneAQDXjhNG3Q/640?wx_fmt=png&from=appmsg#imgIndex=17)

**第三步：**远程调试界面通过 CDP（Chrome DevTools Protocol）协议来和服务进行通信，当执行控制模板某项操作时，比如点击 DevTools 中的 “Elements” 面板来检查页面元素，DevTools 会通过 CDP 向服务发送一个命令，请求 DOM 树信息，服务接收到这个命令后，通过渲染进程查询具体的 DOM 信息，并将结果返回给 DevTools，DevTools 前端再将这些信息可视化呈现给开发者。

_**04**_

利剑三：WEB 多人抓包代理工具

4.1

**工具介绍**

工作中经常需要抓包、代理等操作，主流的抓包工具有：Charles、Fiddler 等，这些工具都必须安装客户端，且都是 1 对 1 的，对多人协助不是很友好。比如：开发需要获取测试同学的的抓包信息分析问题时，目前都是测试同学把报文导出来，发给开发，开发再去导入到工具里面进行分析。

在此背景下，我们就在思考，能否实现一个在线的抓包、代理平台，让大家使用方便、分享方便，降低门槛。于是就有了这款工具的诞生，工具是基于 mitmproxy 进行了二次开发，容器化部署了一套在线代理服务，只需通过浏览器就能实现抓包、代理等操作。

该在线抓包工具具备如下**优势**：

*   **简单：** 无需安装客户端，有浏览器就能使用，易上手。
    
*   **方便：** 直接在浏览器中进行抓包，而且可通过链接分享给他人。
    
*   **易用：** 支持断点、修改报文，集成了录制回放工具、远程调试工具，且支持开发、测试、线上环境任意切换。
    

4.2

**使用简介**

**设置代理**

用户可以通过手机安装的 App 扫描页面上二维码，建立连接，也可以直接在手机 WIFI 代理设置中输入固定的代理 IP 和端口号。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnD7dj6cWAw39anNERIgLMcF5M06usAN2nmWiauzgN5sTulazXFy4Je7w/640?wx_fmt=png&from=appmsg#imgIndex=18)

**抓包、代理**

代理成功后，自动跳转到抓包页面，页面中会显示当前设备，也支持新增设备，可以同时对多个设备进行抓包、代理。并且支持对报文的篡改及环境的代理。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnGhpX9Md4RJic4FbNCKibnfHWat0PxeibwUR7kLnhfL2qRWMoXcROnJ71w/640?wx_fmt=png&from=appmsg#imgIndex=19)

**工具注入**

我们还在抓包工具中集成了上面的录制回放工具和远程调试工具，只需要打开开关，便会去识别入口 html，动态注入工具的 sdk，并进行初始化，这样用户再次刷新页面时，页面中便会出现工具的悬浮球。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnPphxicVpGLRG3GO8TyP9zxURgD6DkQiabygT9zlKPs9iccXlpkWyvOQmQ/640?wx_fmt=png&from=appmsg#imgIndex=20)

**环境切换**

工作中还涉及到一个场景，在产品和 UI 验收时，由于验收环境都是在测试环境，需要配置 host，对于产品和 UI 同学来讲，环境的配置其实是比较陌生的，为了方便验收，我们提供了一键切换环境的能力。用户只需要在页面上选择自己的项目，然后开启对应的环境，这样手机环境便能切换过来。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICnVZia0SzxBnxSKJaYarQ7jrtcscdBBoJBnjtEiaec3IBnAH8mBk5yvcIg/640?wx_fmt=png&from=appmsg#imgIndex=21)

4.3

**实现原理**

在 mitmproxy 基础上，根据设备 ip 对拦截的请求进行分类，当用户查看抓包数据时，通过 ip 进行过滤，这样就可以只看到自己 ip 的抓包数据。

![](https://mmecoa.qpic.cn/sz_mmecoa_png/4g5IMGibSxt70WkBxC04iaO3CmGIXtkICny68yHrg5ibVAInp7Xb4SPcpmpBymnM8kic86YUXG6PgczSSeF0EicNfhw/640?wx_fmt=png&from=appmsg#imgIndex=22)

4.4

**问题解决**

4.4.1 如何实现 1 对 N

既然是在线抓包服务，那每个人肯定都是独立的，不能相互影响，如何让 1 个代理服务支持多人操作就成了问题。

**解决方案：**

*   用户连接代理后，代理服务器可以获取到用户的 IP 地址，根据 IP 地址分别进行分发及报文存储。
    

*   前台查询时，终端 ip 地址作为入参，便只会查询当前 ip 相关的抓包信息。
    

*   前台修改报文、环境等信息时，代理服务器会根据 ip 分别存储修改后的信息。
    

4.4.2 性能问题

多人在线抓包时，报文数据量非常大，几十万甚至上百万条，而且单条报文数据量也非常的大，包括：请求头、响应头、响应内容等等，所以如何快速查询及展示就成了问题。

**解决方案：**

*   采用虚拟滚动列表，提升页面流畅性。
    

*   优化报文结构，列表只返回固定的几个字段，等点击时再去查询报文详情。
    

*   优化后，即使上万条报文也能很快返回，用户操作也不会卡顿。
    

```
// 报文结构
[{
    "id": "ccae12b0-a4f9-4379-98df-03360b6a3912",
    "s": 200,
    "m": "POST",
    "u": "https://bbs.vivo.com.cn/",
    "z": 649,
    "b": 1742888674.46417,
    "e": 1742888674.51759
  },
  ...
]
```

_**05**_

总   结

整体回顾下，本文主要介绍了开发同学在项目中遇到的问题定位、沟通等痛点，通过对痛点的拆解和思考，孵化出三个在前端项目中提升效率的工具：

*   **录制回放**：精准还原问题出现的场景，提供分析问题所需的必要数据（环境、日志、抓包、操作过程等），提升解决问题的效率。
    

*   **远程调试**：远程直连真机进行调试，快速解决特定机型的问题。
    

*   **多人抓包**：让抓包变的更加便捷，在线即可完成，极大地提高了团队在抓包调试工作中的协作效率。
    

_希望本文采取的方案以及解决问题的思路对你能有所帮助，也欢迎在评论区一起交流讨论。_

_**END**_

猜你喜欢

*   [拥抱新一代 Web 3D 引擎，Three.js 项目快速升级 Galacean 指南](https://mp.weixin.qq.com/s?__biz=MzI4NjY4MTU5Nw==&mid=2247505531&idx=1&sn=115938f3dccfa806487d246705d35ef7&scene=21#wechat_redirect)
    
*   [微信小程序端智能项目工程化实践](https://mp.weixin.qq.com/s?__biz=MzI4NjY4MTU5Nw==&mid=2247505500&idx=1&sn=0ccc0c0ff88bca5ea265c41c1bc04285&scene=21#wechat_redirect)
    
*   [基于 three.js 的虚拟人阴影渲染优化方案](https://mp.weixin.qq.com/s?__biz=MzI4NjY4MTU5Nw==&mid=2247500185&idx=1&sn=1c960944c159925a812a354358ff1392&scene=21#wechat_redirect)