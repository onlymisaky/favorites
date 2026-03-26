> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/M5IlrUFsVoeIV6OJeiJ_ag)

![](http://mmbiz.qpic.cn/mmbiz_gif/AAQtmjCc74DZeqm2Rc4qc7ocVLZVd8FOASKicbMfKsaziasqIDXGPt8yR8anxPO3NCF4a4DkYCACam4oNAOBmSbA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

**目录**

一、引言

二、就差一个程序员了

    1. 从需求到代码

    2. 从规划到执行

三、现有问题

四、协作流程

    1. 反馈循环

    2. 流程对比

五、场景应用

    1. 现状分析

    2. 改动方案

    3. 影响评估

六、小结

**一**

**引言**

很高兴与大家分享现阶段 Cursor 在我的工作中的使用体验。首先是预期管理，本篇文章不会分享 x 个你可能不知道的小技巧，也不会让你拥有无需自行编码的能力，同时不涉及 Cursor 工程化方面内容。仅仅是围绕个人开发流程中的已有问题，分享如何使用 Cursor 来提升这部分的开发体验，在工作中持续保持好的节奏和状态。

TL;DR

*   列举 Cursor 的错误预期
    
*   相比过去的开发流程，使用 Cursor 后的变化
    
*   Cursor 在现状分析、方案设计和影响评估中的收益
    

二

**就差一个程序员了**

最近团队在大力推广 Cursor AI，随着几个版本迭代体验下来，其精准的自动补全深得我心，具体可以体现在 Tab 键的使用率已逐渐高于 Command + C/V。既然这么懂我，那么能否更进一步，根据 PRD 直接输出代码呢？

**从需求到代码**

Cursor 能够理解代码上下文，从而根据简短的描述生成符合上下文的代码，于是我尝试直接将 PRD 提供给 Cursor 来生成代码：

```
PRD → Cursor → Code（一步到位）
```

几个需求尝试下来，总的来说分为两类问题：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CXzpOIrKkp9u939vrzxcrTGVTyqzjic67D5viaZgWMosjI4CzNPDeRh3A/640?wx_fmt=jpeg&from=appmsg)

这就像你去理发店，希望 Tony 老师稍微剪短一点，结果却被剪得稍微短了点。而这需要我们在开始之前对齐认知，补充描述和参照。在这个前置阶段，即使发现对方理解有偏差，也还能及时纠正。俗称 “对齐颗粒度”。

**从规划到执行**

Cursor 产出的代码由它所接收的上下文决定，如果没有准确描述需求意图，它会通过推断做出假设，导致产出不准确。因此我们在使用 Cursor 时，关键在于区分开发过程中的**规划阶段**和**执行阶段**。在这个分层的视角下，不管是自身的关注点还是 AI 的角色定位都变得更加清晰：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CcVSKrVzPjprV6nzntwvI4Ciaow6nw8tS6tEoyzKJxzOupa6UjtetQYQ/640?wx_fmt=jpeg&from=appmsg)

Cursor 在这个过程中，不应该被视为开发者的替代品，而是一面能够放大开发者能力的镜子：

*   对于**已知**的部分，Cursor 可以加速实现，减少重复劳动。
    
*   对于**未知**的部分，Cursor 可以协助探索，但不能替代开发者的判断。
    

在理解了 AI 的角色后，我们需要重构目前的开发工作流，让 AI 成为真正有效的助手。最关键的转变是：**不再试图让 AI 替代开发流程中的任何环节，而是让它协助完成每个环节。**这意味着不是把 PRD 扔给 AI，等待完整代码，而是和 AI 一起理解 PRD 和代码现状，**共同设计方案，明确步骤，然后分步实现。**

三

**现有问题**

作为前端开发，我们的日常工作流程中大多围绕需求文档进行代码产出。这需要介于

1.  **我们对业务需求的理解。**
    
2.  **对所属业务和项目现状的认知。**
    
3.  **从而进行方案设计和决策，整理思路将复杂问题分解成可执行的粒度。**
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5C04Ze4zsw1rd0qPWogeaHKejNVvtQMSSzvkAGSajOYtZcxqG8pDYbCA/640?wx_fmt=jpeg&from=appmsg)

但同时，这导致我们不得不面临着一个矛盾：**方案设计对效率的影响。一方面，方案设计是保证质量的必要环节；另一方面，生成和维护这些产物又会显著降低开发效率。尤其是在快速迭代的项目需求中，这种矛盾更为突出。**

有时即使是一个小需求，可能也需要经过大量前置分析，才能进入开发。举个例子，以下是某个小需求的前端方案截图，通过不同的颜色区分了各流程的占比。从图中可以看出，各模块中绿色和蓝色所对应的「现状分析」和「改动方案」后占据了主要的篇幅，与相应的时间占用成正比。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CFxXOLlSND7vicuHufU1ErVndL5P1QibGlj9VttLdefoUlicLTBVL9dhZw/640?wx_fmt=png&from=appmsg)

前端方案中的各环节分布

传统的解决方案通常是：

*   模板化方案设计，减少重复工作。
    
*   简化方案设计，减少不必要的细节描述。
    
*   提高团队熟练度，使得方案设计生成更加高效。
    

作为附加项，现在我们能在这些基础上借助 Cursor 进一步提升效能。

四

**协作流程**

**反馈循环**

在协作时，关键在于对 Cursor 补充上下文，并对 Cursor 提供的结论进行人工核验，两者构成反馈循环。前者是希望 Cursor 知道，后者是需要我们自己知道，从而保障产出的结果符合预期。

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CLicTUbNDza3YdarItAfqpEmNjHSadiaWCLicNtSFO7akibriaHGNoM8E8cg/640?wx_fmt=jpeg&from=appmsg)

整体的 Cursor 协作流程分为规划和执行两个阶段。**规划阶段专注于产出方案，执行阶段根据方案产出代码，两者交替执行。**

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CqlPxgTbKS08FrMqNWTbjISxDeb6JxNDSnDVHqviaGgvicTGt7h15hXpg/640?wx_fmt=jpeg&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CaGJM1BpHQ4FkMolBYSTL9RtxNj27tJbRdK402grCYmSiajIAvbgVzWg/640?wx_fmt=jpeg&from=appmsg)

**流程对比**

相较于以往，在使用 Cursor 后的工作模式差异如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CL1vxYsPvOyhwvFYibayWRJCURq2O5oUXFMVhTibBEXNeweib06tQUEiapg/640?wx_fmt=jpeg&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5Ct7ibWTbChMKKs1JM8CvddqfxiacqaoiaV9wyzQbR5UNHWmOwUnxnR5F5w/640?wx_fmt=jpeg&from=appmsg)

乍一看使用 Curosr 后流程更加繁琐，而实际上也确实如此。

所以这里更推荐换一个心态来看待流程上的变化，不必为了使用工具而使用。过去我们面向 Google / GitHub / Stack Overflow 编程也并不是因为我们为了搜索而搜索，是因为在具体开发中遇到了不明确的信息需要确认，现在这个角色可以渐进地由 Cursor 替代，比起搜索引擎，Cursor 能充分地根据项目现状分析出更贴切的答案，如同行车的导航和选购的得物，为此不必有太多的心理负担。

五

**场景应用**

重新回到在需求开发工作中的问题，占据我代码之外的主要工作是 “现状分析”、“改动方案” 和“影响评估”，因此主要分享这三个场景中的 Cursor 使用体验。

关于提示词，可根据实际需要使用 notepads 或 rules 降低单次使用成本。

**现状分析**

在需求开发过程中，我们时常会接触到陌生的业务模块，如何理解现状往往是最耗时也最容易被忽视的部分。如果对现状不够了解，当需求相对复杂或者项目本身存在较多的历史债务时，我们很难输出符合预期的方案，更难以保证最终代码的质量。对于新接手项目的开发者而言，这一阶段常常伴随着无数次的 "代码考古" 和 "问询前人"。

Cursor 离代码上下文更近，我们可以在它的协助下抽丝剥茧，快速了解业务主线。这是一个学习的过程，当知道的越多，在后续的设计和开发中就越能正确地引导 Cursor。

具体可以从需求的目标改动点开始，梳理其所属功能和实现方式，包含交互流程、数据管理和条件渲染等：

```
业务需求
    ├── 1. 功能
    │   ├── 2. 实现 
    │   ... └── 3. 字段
    ...
```

<table><tbody><tr><td data-colwidth="10.0000%" width="10.0000%"><section><p>目标</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><p>了解业务功能</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><p>了解代码实现</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><p>了解字段依赖</p></section></td></tr><tr><td data-colwidth="10.0000%" width="10.0000%"><section><p>提示词参考</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><p>当前功能如何运作，用户交互有哪些路径，具体数据流向是怎样的，请整理成 mermaid 时序图。</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><p>当前代码如何组织，核心模块有哪些，组件间如何通信，梳理组件关系图。</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><p>梳理当前表单字段的显隐关系、联动逻辑以及数据源。</p></section></td></tr><tr><td data-colwidth="10.0000%" width="10.0000%"><section><p>效果</p></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><section><p>输出所属功能中的角色和角色之间的交互方式，能快速掌握业务模块的大体脉络。</p></section><section><section nodeleaf=""><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CAzsPJC2AuKDiclaiaoLwRkGWax80NeU9QRThCvwhUMLjjcuvL3ObAF0g/640?wx_fmt=png&amp;from=appmsg"></section></section></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><section><p>输出组件职责和组件间的关系，以便在投入开发前以组件模块维度确定改动范围。</p></section><section><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CiaXNHTiar3EXqMdxDibr1X6YA4Ewujia12OFiaKJicv1QfibtXLUxkPFPzVvw/640?wx_fmt=png&amp;from=appmsg" style="width: auto;"></section></section></section></td><td data-colwidth="30.0000%" width="30.0000%"><section><section><p>能直观地呈现表单字段间的联动说明。</p></section><section><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5C1IiaIE030qGwnRTJNJcpP5QCRwO5M2oxNXc61wHJ6KkeaQwD5tfkG6A/640?wx_fmt=png&amp;from=appmsg" style="width: auto;"></section></section></section></td></tr></tbody></table>

通过对上述三个层面的不断往复，Cursor 提供的直观输入能帮助我们摆脱掉一知半解的状态，消除不确定性也就消除了焦虑。

**改动方案**

在了解了现状后，开始面向需求进行改动方案设计。

在问答中，Cursor 倾向于直接满足表面的需求，但可能会忽略一些深层的系统设计考虑。当遇到复杂的问题时，建议先让 Cursor 分析问题本身，而不是直接要求它给出解决方案。通过引导它进行更全面的思考，能防止 Cursor 胡编乱造，确保它理解需求，同时也能暴露自身的思考局限，减少返工。具体做法可以先提示 “在我让你写代码之前不要生成代码” 以及 “先逐步分析需求再说明你打算怎么做”；

另一方面，由于 Cursor 背后 LLM 的 Context Window 存在上下文长度限制，意味着 Cursor 跟我们一样都存在 “短期记忆”，这体现在当对话超出范围后，Cursor 会在输出方案和代码时，遗忘此前的要求和结论，造成不准确。因此，为了将短期记忆转换成长期记忆，需要我们对复杂任务进行必要的拆解，每次只专注于单个粒度下的问答，当确认方案后，再让 Cursor 汇总并记录到外置文档，以便在后续的对话中补充上下文（也可以借助 @Summarized Composers 实现）。在面对下一个任务时，开启新的会话进行问答，多轮下来形成由不同模块组装而成的方案设计。

这样一来，在生成代码阶段，Cursor 所需要面对的只是局部复杂度中的改动，这能很大程度上减缓我们在代码审核和验证上的投入成本。Cursor 也能始终保持在长度限制范围内，面对精炼后的方案设计进行决策和产出。

因此在整体流程上：

1. 拆解需求，缩小关注范围

2. 明确目标，清晰表达需求描述

*   Cursor 提供方案
    
*   检查是否有理解偏差，并不断调整提示
    
*   在确认方案后，最终由 Cursor 汇总成果
    

3. 渐进开发，分模块由 Cursor 生成代码，及时验证效果和审核代码

提示词参考：

*   方案设计
    

```
我们先探讨方案，在我让你写代码之前不要生成代码
如果此处要加个 xxx 该怎么做，请先逐步分析需求
在想明白后向我说明为什么要这么设计
```

*   代码产出，在功能之外，留意识别边界场景以及控制影响面
    

```
在写代码时遵循最小改动原则，避免影响原先的功能
即使识别到历史问题也不要自行优化，可以先告知我问题描述和对当前需求的影响，不要直接改跟本次需求无关的代码
```

**影响评估**

除去开发之前的方案耗时，在完成开发后，我们所要解决的是如何保障自测质量的问题。对于研发而言，需要关注的是在这个需求迭代内，改动点所关联的调用链路，而在这个路径依赖下不断冒泡所涉及到的具体功能就是影响面。

因此可以从两个方面提高自测可信度

*   自下而上：基于改动代码和依赖项进行白盒测试，这需要研发自身投入必要的时间进行代码审核；
    
*   自上而下：识别改动最终涉及到的页面和功能进行黑盒测试，逐个回归和确认功能是否符合预期。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CxjZrebHSZfCdu8iagdHIjz1fkp19ftEwCOVxXZMyC3TFTwAg8TQjosg/640?wx_fmt=jpeg&from=appmsg)

借助 Cursor 可以很低成本地分析改动，并按需产出测试用例，通过 @git 指令让 Cursor 参与到对当前功能分支或具体 commit 的评估：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CFm5c5IvwSGibK07FfkQo2DYG0sQmwHKgmUsCkgh473qwldqq2t78Xlg/640?wx_fmt=png&from=appmsg)

<table><tbody><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>目标</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>代码审查</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>功能验证</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>提示词</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>@git 逐个文件分析并总结改动点，评估是否引入了新的问题。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>@git 基于代码变更输出自测用例清单。&nbsp;<br></p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>效果</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><section><p>在列举出每个文件的改动意图后，会告知潜在问题和修改意见。</p></section></section><section><section nodeleaf=""><img class="" src="https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5C7EialgBMVpARKibjW0IMpryHeZeP3Sv3zgU7kzbeh3nKjsM3D99v1M7Q/640?wx_fmt=png&amp;from=appmsg"></section></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><section><p>围绕改动，生成新旧功能在不同场景中的测试用例。</p></section></section><section><section nodeleaf=""><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5CIzPej0FSyXAGG4rMdjshzb0v4a5t6iaBYlk2MaxWrUDWUC7H7lXbicgQ/640?wx_fmt=png&amp;from=appmsg"></section></section></section></td></tr></tbody></table>

六

**小结**

过去，成为一名优秀开发者需要经历漫长的积累：从反复查阅文档、在搜索引擎中筛选有效信息，到系统掌握编程语言、算法与网络原理，每一步都在构建扎实的「知识护城河」。而 AI 时代颠覆了这一逻辑 —— 当大模型能快速生成代码、解析技术方案时，开发者的核心能力似乎从 “记忆与执行” 转向成了“正确地提问，让 AI 提供答案”。

客观来看，AI 降低了信息获取的门槛，能更快地落地想法、验证思路。不变的是，好的答案源于好的问题，而提出好问题依旧需要积累专业领域下的知识，知道的越清楚才能在提问时描述得越清晰。

所有事都有吃力不讨好的部分，随着 Cursor 等 AI 工具在工程中的应用，我们可以逐渐将这部分职能分配出去，利用我们的知识储备，描述问题，引导过程，审核结果。工具的使用始终是为了节省人类体力和脑力的开销，从而在提升体验的同时提升生产力，以更充沛的精力聚焦在工作成果和个人成长上。

**往期回顾**

[1.](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538355&idx=1&sn=9b67aef240411de3423aef55e222f82f&scene=21#wechat_redirect)[得物 iOS 启动优化之 Building Closure](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538355&idx=1&sn=9b67aef240411de3423aef55e222f82f&scene=21#wechat_redirect)

[2.](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538314&idx=1&sn=a1f2d25a7a11fd50b543c6591317fd41&scene=21#wechat_redirect)[分布式数据一致性场景与方案处理分析｜得物技术](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538314&idx=1&sn=a1f2d25a7a11fd50b543c6591317fd41&scene=21#wechat_redirect)

[3.](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538302&idx=1&sn=f85057dbe21821f68f9d9cd3b72fb8cb&scene=21#wechat_redirect)[从对话到自主行动：AI 应用如何从 Chat 进化为 Agent？开源项目源码深度揭秘｜得物技术](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538302&idx=1&sn=f85057dbe21821f68f9d9cd3b72fb8cb&scene=21#wechat_redirect)

[4.](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538265&idx=1&sn=46126305e017551fce1c548a0d482d52&scene=21#wechat_redirect)[得物技术部算法项目管理实践分享](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538265&idx=1&sn=46126305e017551fce1c548a0d482d52&scene=21#wechat_redirect)

[5.](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538263&idx=1&sn=78e7e307da19e903656c2de2afb96dc9&scene=21#wechat_redirect)[商家域稳定性建设之原理探索｜得物技术](https://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247538263&idx=1&sn=78e7e307da19e903656c2de2afb96dc9&scene=21#wechat_redirect)

文 / 魏命名

关注得物技术，每周一、三更新技术干货

要是觉得文章对你有帮助的话，欢迎评论转发点赞～

未经得物技术许可严禁转载，否则依法追究法律责任。

“

**扫码添加小助手微信**

如有任何疑问，或想要了解更多技术资讯，请添加小助手微信：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CicWNcQh7WwaVdmp3UCKW5C636meoOeicsibhC1aco9MaI9mliccLUc3F3bIibNzBFGdblvF7hANSoNaA/640?wx_fmt=jpeg&from=appmsg)