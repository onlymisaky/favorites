> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9t1JE0db6A4Ylbk5xblpXg)

基本介绍

### n8n 是什么？

> 工具丰富，功能强大，灵活且可扩展的自动化工作流。它允许用户通过直观的可视化窗口，组合不同的节点和服务，建立复杂的自动化工作流程，而无需编写任何程序代码 (如果你需要)。如果大家使用过 coze 应该知道，其核心理念在于提供一个基于节点的环境，让每个节点通过拖拉拽的方式连接起来，组成一个可使用的程序。

#### 市面主流的工作流平台：

<table><thead><tr><th><section>平台</section></th><th><section>AI 能力</section></th><th><section>部署类型</section></th><th><section>服务或应用</section></th><th><section>价格</section></th></tr></thead><tbody><tr><td><section>n8n</section></td><td><section>文本</section></td><td><section>私有化 / 云服务</section></td><td><section>400+</section></td><td><section>社区版免费</section></td></tr><tr><td><section>Coze</section></td><td><section>文本</section></td><td><section>云服务</section></td><td><section>？</section></td><td><section>套餐</section></td></tr><tr><td><section>Dify</section></td><td><section>图片更优</section></td><td><section>私有化 / 云服务</section></td><td><section>？</section></td><td><section>社区版免费</section></td></tr></tbody></table>

和 coze 的区别就是自主管理 LLM KEY, n8n 只负责调度管理，开源自己管理，花费还是在 API key 的调用上 (包括 ai token 和某些特定服务的资源)。coze 走的是云平台服务的管理方式。

它是开源的，支持你各种的部署方式，支持 docker 部署，支持本地部署，支持服务器端部署。甚至支持 nas 方式部署。只不过上面的一些场景需要你网络的通畅，比如连接 google。

### 使用场景

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnI3RicXgeMmTGiahso8h91NQz7zpypQL3Uibby1RhL5R4Zp1uDWV2icq9Jg/640?wx_fmt=png&from=appmsg#imgIndex=0)这是官方的一些推荐的使用场景，其实远不止这些

如果你平常使用过 coze 之类的 agent 工作流平台的话，对于学习 n8n 的成本不会很大。

如果没有使用过的话，可以先列出一张面板图片，大致的感受一下，如果你使用过低代码平台类似的产品，应该很快就能感受到它是如何使用的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnevy8pndPr38qRyURkBeHIAuOjxFjq9BdpXMc1fLN8kkp7hJP7haCgg/640?wx_fmt=png&from=appmsg#imgIndex=1)

基于拖拉拽的 ui

#### 基本的流程图

顶部的三个 tab 分别对应着编辑器，日志和评估

*   面板的中央上面可以看到整个工作流的编辑器模块。
    
*   中间 Executions Tab 是整个流的执行日志信息
    
*   上方最后一个 tab 就是评估模块，可以将你的工作流上传，会有专门的 benchmark 测试你的工作流问题，以及进行评分。
    
*   下面是整个会话信息和每一个节点的工作日志信息，报错也会在下面展示。
    
*   左下角甚至还有一个节点的预览骨架图。
    

#### 丰富的功能

*   继承了近上百种的工具节点能力，可以将你自己之前的程序或者第三方的程序，快速的加入在这个工作流里面，让你之前的所有能力可以不零散的，快速的组合起来。包括了 google 日历，google docs，Notion，Aws s3, AWS Lambda 等, 甚至还有矢量数据库这类型的工具。
    
*   同时你还可以将自己的 workflow 导出成一个 mcp 服务，供外部调用。
    

#### 清晰的节点布局

*   清晰的左中右布局，左边是输入，中间是本节点的配置，右边的节点的输出
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnGe3ENCJMTGdL9WO9Uz7iaMpLeiayey3VJX2QbA5E5yxh93W7DKW2lcpg/640?wx_fmt=png&from=appmsg#imgIndex=2)

左中右布局

#### 丰富的工具节点

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnU2uFibXkRyBTrxglsctE9EVxudReancgsorTL79lltbHYnnl1wuuHmQ/640?wx_fmt=png&from=appmsg#imgIndex=3)

工具列表

### 操作

*   工作流编辑 agent 节点的时候，如果定义了 key，相比传统上的自己记住上一个节点返回的 key，然后填写这种方式不同的是，可以直接在左侧展示出来上一个节点暴露的 key，设置可以直接拖拽使用。
    

(这种方式明显对于调试节省了大量的时间，不用验证你上一节点的 key 是否写的正确，或者层级嵌套是否正常了)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnq4yS8Rp7jbV6Isw9umnIsNqYBuzmXwibaexbXpPVg6L2Wede9SXA2xw/640?wx_fmt=png&from=appmsg#imgIndex=4)

属性拖拽

*   在每一个节点的前后，都可以加入数据转换节点，方便你对整个流程的上下游节点做转换。比如你可以更改字段名字，过滤一些字段，合并或者删除一些数据，将最新的数据交给下游。
    
*   设置你可以写一个函数 (python 或者 node)，来处理这些数据，将返回的数据用来给下游。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnhxx1DoRtWJVJXia2KX5B0PfnYQiaXtdZJUaglmgrRowYIkrkYHfp8iaibw/640?wx_fmt=png&from=appmsg#imgIndex=5)

n8n 也提供了一些现成的数据转换工具，让你直接使用

*   不仅可以跑 AI 的工作流，还可以脱离 AI，成为一项普通的任务流。也可以将 n8n 定位是一个巡检工作流，或者消息推送，定时任务等传统的研发功能。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnaOmT3qBQQRibKh90qkPxvMibicHfIBoajZI1EQ6DvHKf3bIu550Jyn40w/640?wx_fmt=png&from=appmsg#imgIndex=6)

在此你可以将输出在流里面就配置好，让其不经过 AI 而走一些 API 或者其它任务，因为其强大的扩展性和丰富的工具插件让你可以在其中写很多东西

#### AI 与函数组合

*   每个 AI Agent 的节点，都可以设置一个对应的模型，以及这个模型对应的记忆管理器，和这个模型所要绑定的工具，这个和大多数的工作流工具都差不多。
    

`当然你可以绑定多个工具，用来分别处理用户的不同需求。`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnnIgBM5T8U9ibxa7m3pTD2LzCXfRtLSLib2JiaMEkQE0KVoTEnicEgbw3ZA/640?wx_fmt=png&from=appmsg#imgIndex=7)

多种工具绑定

以上面的输入 1+1 = ？这个为例，当用户输入后，模型会自动判断应该调用哪个工具来处理本次请求。其实这就是类似 function call 的方式来让请求更加合理。

当然在每一个工具中，你需要描述这个工具是干什么的让模型可以更好的理解。同时也要描述好你的参数是什么。这就像是 mcp 调用一样。

以加法为例，当你要求输入的是一个 1,1 以逗号分隔的字符串入参的时候，大模型就会帮你拼装好，或者你想要一个 [1, 1] 的数组也是可以。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnAdkU2FpUl3Pgc3qw5kWbe7IO0ENWTxNAgGuMILF87TSKRWs4zRTapQ/640?wx_fmt=png&from=appmsg#imgIndex=8)

(需要注意的是大模型会把你的返回值作为本次节点的响应拼接)

#### 管理记忆

*   记忆的管理是任何涉及到大模型产品的共同问题，n8n 处理记忆并没有直接的工具可以使用，它只提供了一些内存数据库和 mongoDB 这类的来直接存储消息记录，并没有如何记忆管理，如何优化策略等业界比较好的方式来让记忆更加准确。
    
*   但是它提供了一些原子化的能力，比如内容的摘要管理工具，信息提取工具和向量数据库等。
    

(有 Motorhead 这种简单的记忆管理工具，但是太过简单，只是简单的存储，读取，和总结)

#### 工作流日志

*   对一个每一个工作流产品，日志调试是非常重要的一部分。它可以让我迅速的定位整个工作流的执行状态，哪一个步骤出了问题，让我们可以更加精细化的调试整个工作流。同时还可以查看整个流的上下文参数等信息，让后续的数据查看更加准确。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDuCroWFjIzB0klEttcA0nnKzpEQ7QicNh8RkY0cibvmoq7kE4d4YZzFWcvjvjicxCWRCWZMa8cicWahA/640?wx_fmt=png&from=appmsg#imgIndex=9)n8n 会在 executions 的 tab 里面记录每一次执行的快照信息和执行的每一步骤的日志

*   在企业版本里面，还可以将日志信息储存在自己的服务上面，只需要在 n8n 整体配置上加入即可。
    
*   包括一些监控与统计，在社区版里面也是没法使用的，只能是付费的企业版本里面可用。
    

### 接入外部系统

*   支持 mcp 服务，可以与任何 mcp 服务打通，无论是作为 client 还是 server。
    
*   但是推荐应该使用的是 n8n 的自有工具去解决问题。
    
*   比如使用 gmail，n8n 的自有节点支持对邮件的增删改查，甚至标记已读，未读，那你不应该再去调用 google 的 mcp 服务来完成这件事。当 n8n 没有提供对应的节点的时候，才建议使用 mcp 服务来处理。因为 n8n 强调其自有节点在准确性和效率上面都更好。
    
*   如果想要接入国内的一些服务，你可以要使用自定义工具来编写。
    

本篇只是简单的介绍了部分的功能， 其实 n8n 还有更加丰富功能可以体验，但是有个重要的前提是里面的第三方服务之类的都是需要科学上网的。

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=10)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=11)