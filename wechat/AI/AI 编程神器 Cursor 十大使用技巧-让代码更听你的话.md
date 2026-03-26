> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/X7cI-yScBrqUvMXd_S1PWQ)

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95PPum3MHrbQtfJ4pe2VicykyMXzlMLtibmCZAYNePicBs0GWibxoIt6yyX4OB2c2vRPZcEj71nbibKacg/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_gif/VY8SELNGe96srmm5CxquJGSP4BbZA8IDLUj8l7F3tzrm8VuILsgUPDciaDLtvQx78DbkrhAqOJicxze5ZUO5ZLNg/640?wx_fmt=gif&wxfrom=5&wx_lazy=1&tp=webp)

👉目录

  

1 “聊天式” 编程已经到来

2 Cursor 引领新的编程范式

3 如虎添翼：MCP 的到来

4 Cursor 十大使用小技巧

5 Cursor 团队的一些观点

6 Cursor 与心流

7 写在最后

AI 辅助编程已经是一个不可逆的潮流趋势，不能高效使用 AI 工具为己所用的程序员将很快被时代抛在后面。本文作者基于自己过去半年对 Cursor 的深度体验，撰写了本文，让你的代码更听话，实现极致心流体验。

  

关注腾讯云开发者，一手技术干货提前解锁👇

  

  

  

01
==

  

  

“聊天式” 编程已经到来

在 2023 年 1 月，四位麻省理工学院（MIT）本科生创立的 AI 编程工具 Cursor 横空出世，以 “重新定义软件开发流程” 的革新理念迅速崛起 。团队提出了 **“优秀的工程技术比算力更重要”** 的理念，不管是猜你所想的 “tab、tab、tab”，还是一键添加多种类型的 “上下文” 或是无所不能的 Agent 模式，真正意义上诠释了什么是你的专属私人编程助理，Cursor 的出现，可以说标志着 **“聊天式”** 编程的到来。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTavZnib2vIjExxng8ibl6icogSkMxGV7VX7eCtibdR5esJcNpBK3MtLYFZFg/640?wx_fmt=png&from=appmsg)

和传统的编程模式相比，“聊天式” 编程有三大核心突破：

*   **通过 “自然语言” 写代码**
    

从一开始的机器语言到汇编再到现在的高级语言，可以说计算机语言就演变本质上是从硬件到认知的不断抽象，Cursor 的出现无疑是打开了高级语言迈向自然语言的大门。想想看：高级语言帮你屏蔽掉了汇编语言的复杂度，依次类推自然语言的终态也将会帮你屏蔽掉高级语言，这是一个振奋人心的事，这意味只要你懂得 “说话”，你就懂得编程！人人都是编程大师！

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTasDqqum1IoNBNH2dz7YIicibz1fjbaOqeWIMApIFu0hmI6zvhdRDe9nNg/640?wx_fmt=png&from=appmsg)

当然从目前的技术看来，还是在使用高级到自然语言的过渡阶段，但这也相当的炸裂，你 Code 的过程不再是你一个人在战斗，而是好像有一位耐心的智者站时时刻刻站在你后面，和你一起讨论、解决问题，他不仅可以快速验证你的想法，更有趣的是很多时候可以给你更多的思路，让你有更阔的视野，正如 Cursor 创始人所言：**“我们不是在教 AI 写代码，而是让它成为人类创造力的延伸。”** 在这种新范式下，我们的注意力讲会从 **"如何写代码"** 转移到 **"解决什么问题"**，**AI 会逼迫你 “想清楚、说清楚”。清晰的表达将会成为一种稀缺的生产力。**

*   **追求：以判断力的速度迭代**
    

以下是我用 Cursor 搭建一个本地数独小游戏，整个过程用了 **16s，16s！**而我的 prompt 仅仅是：**“给我写一个数独游戏，使用 js 语言”** Cursor 的 Agent 模式自动帮我写好代码，本地运行，让 “想法” 秒级别的体验的感觉妙不可言。Cursor 真正做到了及时反馈。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTahCRxVJRgzAVTzCAC726MN74UxLhSiaIibt4njLaU6W9RHFp7NTHJiajJQ/640?wx_fmt=png&from=appmsg)

*   **模糊了边界，你可以成为你想成为的人！**
    

Cursor 逐渐**模糊**掉产品经理、设计师和程序员之间的界限，**可以预见的将来也会改变这些岗位的设立逻辑和开发团队的组织方式。**Cursor 客观上磨平了各个角色之间的技术壁垒，让 “想法” 不再受限于某类资源，Cursor 把编程的门槛拉到了一个足够低的程度。

更有趣的事，它正在让更多人有机会参与到软件创造中去，体会编程的乐趣。网上报道一个 8 岁的孩子用了 45 分钟，完成了一个聊天小程序。另外 Cursor 让我最惊艳的地方就是无感知迁移，整个过程用了不到 10 分钟，体验感拉满，产品价值杠杠的。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaribyILJDxfMtgfWVOaY7jUdHPtlf3klLq69PGbJDkKLYfhzic6kKdjVQ/640?wx_fmt=png&from=appmsg)

  

  

02
==

  

  

Cursor 引领新的编程范式

本小节讲介绍：如何巧妙的使用 Cursor 完成一些复杂任务。

####    **2.1 Cursor 四大件**

首先我们需要了解 Cursor 为我们在不同的场景提供了不同能力支持，从简单场景到复杂场景一次是：Tab、Inline chat、Ask 以及 Agent。（ps：Ask 对应老版本的 Chat；Agent 对应老版本的 Composer，更详细的内容可见：https://www.cursor.com/ ）

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTakJyNXUsOtNHkGGDg5a57u43iahyCibibFCbpHIWGjypbOL2VQHWlibWknA/640?wx_fmt=png&from=appmsg)

下面我们重点要分析一下，Cursor 到底改变了传统编程的什么环节，我们也好重点发力。我们在面对一个复杂任务时都可以拆为以下四步：确认目标、确认方案、开发以及验证。Cursor 的到来最大的改变就是：在需求阶段的表达方式，即如何与 AI 沟通。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTadsR3icbq9bBiaLxcol5MEoa9wzgKCzPnwDIZXtILoBn4yKs6mGO2Uk0A/640?wx_fmt=png&from=appmsg)

####    **2.2 从 “想清楚” 到 “说清楚”**

AI 很强，他像是一个无所不能的大师，**但是他不知道你脑子里到底想要什么。**很多时候，我们会遇到如下场景，那有可能就是 “沟通” 出了问题。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTanbcdemfwYv4wsianrQ1Yo1HNI0PUczSiclkotta8WzVkEuIwtYnmWaiag/640?wx_fmt=png&from=appmsg)

在《真需求》一书中提到：**83% 的用户投诉并非源于产品缺陷**，而是需求理解偏差。当我们说的不能表达真正想做的事时，耶稣来了也搞不定，所以我们需要把事情先说清楚，这里有一些常用的套路，核心的原则就是：**结构化表达 + 足够的上下文，**最直接结构化表达就是你在描述需求的时候使用尽量使用 markdown 格式，这种格式天然的就会对内容 **“分块”**，AI 更容易理解；另一个就是足够的上下文，大多数场景，你可以使用 **“人设 + 任务 + 上下文 + 案例 + 方案”** 的组合，结合一下就是把这些变成 markdown 的内容给 AI，可以试试效果。

**让 AI 逼迫你思考：反向费曼学习法**

在使用 AI 时候，**他往往倾向于直接满足你的表面需求，但可能会忽略一些深层需求内涵。**所以好的模式不是你直接去提问，而是让 AI 引导你思考！

我记得小学的时候，学习奥数，类似 “鸡兔同笼”“牛吃草” 的问题，我爸每次给我辅导完题目，都会问我：你懂了吗？明天去给你隔壁叔叔家的孩子也讲一遍，看能讲清楚不？哪个时候我就意识到了，很多时候你以为你懂的东西，其实都不懂，而且有很多疑问。

我们把这种模式迁移一下，那对于 AI 来说，当你提出了一个问题，想想：他真的懂了吗？让 AI 反述一遍，你听听如何？但是光这个就够了吗，不够，你还需要让 AI 具有质疑精神，让他对你的问题提出质疑，而不是全盘接受！反向逼迫你去思考什么是 “真需求” 让 AI 变成你思维的“延展”。我把这种模式称之为：**反向费曼学习法。**

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaWlkBbYR5CquhXEnjAf3Dkic1qGyFxzceCLKsviboZrOfBuyhgDFeibk2Q/640?wx_fmt=png&from=appmsg)

####    **2.3 分而治之 + 小步验证**

当我们定义好了 “问题”，自然就到了方案以及落实，《领域驱动设计》中讲到了一个解决问题的通用模式：分而治之。（ps：[《当中台过气，微服务回归单体，DDD 的意义何在？》](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247673327&idx=1&sn=b7929415293628ff28d2cfd41ade952a&scene=21#wechat_redirect)），再难的问题，也可以拆分为无数个简单的小问题，把每个小问题解决好了，大的问题也不是问题了。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaPPsEmia57bRiatFicAykReKa2uwhLzo0sMtNpehkBCtqCk8eStzddP8xg/640?wx_fmt=png&from=appmsg)

我们依旧可以延用这个模式，当一个问题来临时，先使用上述的方式进行**需求澄清 + 疑点确认，**然后我们可以先使用 Cursor 的 Ask 模式先让 AI 给出不同的解决方案以及优劣，“阿步思考法”告诉我们方案都是 “各种资源” 的权衡，这个选择的工作，需要我们去做，而不是 AI，AI 的优势是他懂得多懂的广，但是他很难了解全部上下文，换句话说：人去权衡其实就是变相的在补充上下文。

接下来就是方案的拆分，没错，还是让 AI 去拆分，拆分成 AI 可以执行步骤，这里有一个小技巧就是要把拆分的结果记录到 Notepad 中（Cursor 提供的轻量化记录工具）记下来的目的一个是给自己看，帮自己理清思路（对于生成级别代码，你必须知道方案的思路）也方便后续在此基础上做调整，另一个是作为上下文给到 Agent 模式，Notepad 在两种模式之间起到了很好的桥梁作用。

在 Agent 模式执行的时候，我们需要按照直接的拆分任务并且逐步执行、逐步验证，切记不要一次生成几千行代码，再验证，不然可能会越改越乱。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaRkj8PZW4parA5yKa7libJBwXBhT7TYVXVDXGkrcwn10iaZcro2ByA2vA/640?wx_fmt=png&from=appmsg)

  

  

03
==

  

  

如虎添翼：MCP 的到来

####    **3.1 MCP 是什么？**

简单的说，MCP（Model Context Protocol）就是 AI 与外部世界的 “万能连接器”，让 AI 有了眼睛和手臂，网上有一张很经典的图，如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaV4icLqfBYLU5fsuTLTCiaGuJXv62mO3dPNErXSDrqxzQMpvImKbMMsGA/640?wx_fmt=png&from=appmsg)

不过有朋友肯定会问：访问外部资源貌似也不是什么新鲜事吧，应该早都有了吧？是的，早就有了，但是 MCP 真正的价值在于：统一了标准，不用再重复造轮子。在过去每个软件都需要为 AI 单独开发接口，效率低且成本高昂。而 MCP 的出现，解决了这一痛点。

在 MCP 的加持上，让 AI 不仅有了更大的上下文，也让闭环操作性上了一个大的台阶。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaxOYMgXEJvQ3xHsib6WiaBpKESbtzPBTVDqbrr4l4AFPtbbS1iclvK5MQA/640?wx_fmt=png&from=appmsg)

####    **3.2 MCP 能做什么呢？**

**扭转数据流，把人解放了出来**

假如现在有一个这样的场景：**统计数据库中，符合某些条件的数据。**如何没有 MCP 之前你会怎么做呢？我想你会从数据库导出数据，再手动的粘贴到 prompt 中；看起来貌似也不复杂，那如果有一千万数据呢，如果数据分布在不同的节点呢？事情就变得复杂了。

而有了 MCP 之后，交互模式发生了本质的变化，人不用再做 “数据粘合剂”，各个数据孤单被 MCP 连接起来，AI 有了自动探索“上下文” 的能力。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaZ7EucrGMycicIXvBk6o58D2yFfd1kE5nn6hgtcaedZAnKmX0KvFOOrw/640?wx_fmt=png&from=appmsg)

**打不过就加入：工具类产品提供 MCP 能力将成为趋势**

AI 生态发展发展令人震惊，传统的工具类服务如果只停留在页面 + API 的形式已经已经远远不够，**应该把自身溶于到 AI 生态中，**提供 MCP 能力将成为趋势。

  

  

04
==

  

  

Cursor 十大使用小技巧

####    **4.1 技巧一：终端对话（超级好用）**

你再也不用因为忘记了 linux 命令而苦恼，直接 command+k ，使用自然语言去描述命令行（ps：你可以在本地开一个 Cursor 的项目专门操作本地终端）。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTa4K2AEibJ9QyYmaBD4cRDYamOzv28xMggPXElzZqS15ZuFF6L78bkkKA/640?wx_fmt=png&from=appmsg)

####    **4.2 技巧二：历史代码生成注释**

使用 command+k，为历史代码快速生成注释。（ps：相比 Ask 模式速度极快）。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTawVY6diblFSIs7lumbLownlWynhxAicyiaDoWEXAC9nV43gicmiaSzs7MiaZg/640?wx_fmt=png&from=appmsg)

####    **4.3 技巧三：一键生成 commit message 信息**

再也不用去想：我的代码改了什么？现在一键帮你生成提交信息。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaHJh9FvFWichCRRNVo17Zicsjy0F5e2kzPmvxaibdckS9ibJ8ShQAoTGNgQ/640?wx_fmt=png&from=appmsg)

####    **4.4 技巧四：接手项目，快速可视化了解项目架构**

使用 Ask 模式给你整理出项目的架构图，输出 Mermaid 语法的文本。

粘贴到看图文本工具：https://mermaid.live/ ，快速了解项目。

####    **4.5 技巧五：巧用 Notepad 记录关键思路**

使用 notepad 记录重要上下文，使用 @即可。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaBmyXAj05pthUXMGzQ8yNCVbhXKQUC6ic8YUzMj69pCt5kBuicFooJcNA/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaopnG9hQ6LojCEmiceB95X4YMKXNM9icZDOSKITMxeJnAxPIE3iatvnb9w/640?wx_fmt=png&from=appmsg)

####    **4.6 技巧六：@Git 找出代码漏洞**

遇到代码 MR 的时候可以先对比一下与主干代码的差异，检查是否有问题，或者当你 MR 后代码发生了问题，都可以使用 @Git。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTahGVl1NW2Y7vI8TKibPNRRzGrBsswPLt8OomDjiaMxibrw3z8Al6icgmqlg/640?wx_fmt=png&from=appmsg)

####    **4.7 技巧七：使用 checkpoint 一键回滚**

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaVOUicKJMTWtiaDpPqXuzv9k0e761mJE4nZicZM6icTFLesMiaS5wobrZxmw/640?wx_fmt=png&from=appmsg)

####    **4.8 技巧八：设置你的专属提示词**

在 Cursor Rules 里设置你的专属提示词，网上有很多，可以自行查找。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTaGg4pmZUMfAicqEgqWfroKvVdjtmg5OFH8XE99zcMbHbhbAXxCRYM1MQ/640?wx_fmt=png&from=appmsg)

####    **4.9 技巧九：拖拽式 添加上小文**

再也不用去一个一个寻找目录去添加上下文了，在目录中直接按猪目标文件，拖进对话框即可。

####    **4.10 技巧十：@web**

使用联网功能，快速获取最新的信息。

####    **带货环节**

Cursor 虽好，但费用也挺高。有没有一款 AI 代码神器，既好用，又免费，还更加 local 倾听中国开发者声音？这里我们举贤不避亲地推荐腾讯云 AI 代码助手。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95PPum3MHrbQtfJ4pe2VicykQwH4yV33iaNXVfwZpqd3OmdQrRshIibpESec1VoYObPPQmxQH76gN9Mw/640?wx_fmt=png&from=appmsg)

腾讯 85% 工程师都在用，编码时间缩短超 40%，代码生成准确率提升 30%+！

可以免费帮你读 / 写 / 审代码及查 BUG。

内置满血版 DeepSeek R1，精通超 200 语言，累计服务数十万开发者用户，数千家企业团队，和多款国民级产品。

在 VSCode、Jetbrains IDEs、VS、Xcode 及微信开发者工具、CloudStudio 等 IDE 扩展插件中搜「腾讯云 AI 代码助手」即可安装。

官网地址：https://copilot.tencent.com/

  

  

05
==

  

  

Cursor 团队的一些观点

内容来自：https://lexfridman.com/cursor-team-transcript ，其中比较有趣的几点：

1.  未来工程师是人机混合体，人类创造力 + AI 能力 > 最佳纯 AI 系统。
    
2.  创造力、系统设计能力和做出权衡决策的能力将变得更加重要。
    
3.  更高层次的抽象:
    
    程序员可能会更多地在更高层次的抽象上工作，如伪代码。
    
    AI 可以将这些高层次指令转换为实际的、可执行的代码。
    
4.  灵活的抽象层级:
    
    未来的编程环境可能允许在不同抽象层级间自由切换。
    
    例如，可以在伪代码级别编辑，然后下钻到具体的实现细节。
    
5.  好的编程工具应该通过行为预测，而不仅仅是自然语言，例如强大的 tab。
    

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTa7xiaP3WzJIbCJqh8YLw76gECCdXB18HXSSvW82vSJ4fbW4ib5DhJqsiaA/640?wx_fmt=png&from=appmsg)

  

  

06
==

  

  

Cursor 与心流

“心流” 一词是由匈牙利心理学家米哈里 · 契克森米哈伊在 1975 年提出的概念，指一种**幸福的最优体验。**他在《心流》一书中提到人获得 “心流” 的三个核心条件，Cursor 的到来和三点完美的契合在一起，code 将会成为一件可以带给你幸福的事！

*   **明确的目标**
    
    如上文所说，使用好 AI 的前提是想清楚、说清楚，这就天然的在思考任务的过程是明确自己的目标。
    
*   **即时反馈**
    
    无论是 Cursor 的 AI 代码补全和自然语言对话功能（如⌘+K 唤醒）能提供毫秒级响应，或者是秒级别的 Agent 能力，都可以持续给予你正反馈，让你的想法立马实现。
    
*   **挑战与能力匹配。**
    
    在完成任务中，AI 可以帮助你更好的理解需求并自动处理底层复杂性，让你聚焦于创造性调整，既避免因任务太简单而厌倦，又防止因难度过高而焦虑，给进入心流状态，变的更加轻松。
    

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95dLp59UC5nj3VkRjVM4QTa9Ccmka8LMsoicQew7uficm814gIN7146icA6MKvzu6TroXjbX7so4G6ibA/640?wx_fmt=png&from=appmsg)

  

  

07
==

  

  

写在最后

新的时代，对于软件价值理解，可能有新的定义：

软件价值 =  创新  ×**（需求清晰度 × AI 理解度）**× 工程实现效率。

最后也祝愿大家，可以享受编程的乐趣，获得心流。

-End-

原创作者｜吕昊俣

感谢你读到这里，不如关注一下？👇

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95PPum3MHrbQtfJ4pe2VicykhEXeefa2QK33Y2Sx176SeQmkm4avmoRlComjAaeibU4ezUqpymDFJRQ/640?wx_fmt=png&from=appmsg)

📢📢Cursor 快速上手教程，点击下方图片得到答案！👇

![](https://mmbiz.qpic.cn/mmbiz_jpg/VY8SELNGe95PPum3MHrbQtfJ4pe2VicykzjTwpOaMTsWwswA1JDiaELoAd4XEFjcWcXKJMBcqtyBLYpHG50wzGhw/640?wx_fmt=jpeg&from=appmsg)

📢📢对 DeepSeek 的技术原理、部署教程、应用实践感兴趣的小伙伴，也可以扫下方二维码加入腾讯云官方 DeepSeek 交流群，不定时输出鹅厂大佬的实战教学！

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe97x6xQKSuQx2Vp1oXu5fJsRJaSvcia4Pia8MU09jWD61XpibMhicGrRNYDqdbztWFP1cOr8Dh6dWsSDuA/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

  

 ![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe975eiakGydXqTICibuXvLhyqN5sicc7ia7Cvb8nJGK2gjavrfIIYr5oicm20W8hFPvUdSm8UTzzWiaFco9Q/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)  

**对于 AI 工具，你有什么好的实践？**欢迎评论留言。我们将选取 1 则优质的评论，送出腾讯云定制文件袋套装 1 个（见下图）。4 月 3 日中午 12 点开奖。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96Ad6VYX3tia1sGJkFMibI6902he72w3I4NqAf7H4Qx1zKv1zA4hGdpxicibSono28YAsjFbSalxRADBg/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

  

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe979Bb4KNoEWxibDp8V9LPhyjmg15G7AJUBPjic4zgPw1IDPaOHDQqDNbBsWOSBqtgpeC2dvoO9EdZBQ/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

[![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe97Gl4IjT7zvFIZ2V0mxKlP9bv5WDtwfWaCX55FvNMYKTpwWpUakgRIibAQ9icyGOfZol40zhBvkpzrw/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247688068&idx=1&sn=4a7216b948c7e2ec5aa4c869cb41359d&scene=21#wechat_redirect)

[![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95edia0l8fYyFS2BevUiaExOfAiayX4ibfQpZhcPsy25bze5m3IS6LWayAbhLibqpgItdalpCQiav3Ev2RA/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247688316&idx=1&sn=163ceb7c773a4d097ae3a0790ffc4b3f&scene=21#wechat_redirect)

[![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe97Gl4IjT7zvFIZ2V0mxKlP9QMmFkA2I5ILuDrJibAafbMIk3Nec1u1SHnCY7KD0Z13icOmOaYfQiahYg/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)](https://mp.weixin.qq.com/s?__biz=MzI2NDU4OTExOQ==&mid=2247688195&idx=1&sn=a2ba7737825e9a82d816323338a21b88&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe95pIHzoPYoZUNPtqXgYG2leyAEPyBgtFj1bicKH2q8vBHl26kibm7XraVgicePtlYEiat23Y5uV7lcAIA/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)