> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/LUyHgdaByxZuDyCfSxolIA)

![](https://mmbiz.qpic.cn/mmbiz_gif/oQ0houcyEichryx0I4XcC8f097TToXicE0DPLxGO4mkoUjaGKMvRcblOweUIBicKviba9h8PAlicKyc5N8lW76W4Bjw/640?wx_fmt=gif&from=appmsg#imgIndex=0)

本文作者：咸鱼，TRAE 开发者用户

Agent 正在经历从 “聊天机器人” 到“得力干将”的进化，而 **Skills** 正是这场进化的关键催化剂。

你是否曾被 Agent 的 “不听话”、“执行乱” 和“工具荒”搞得焦头烂额？

本文将带你一文弄懂 **Skills** ——这个让 Agent 变得可靠、可控、可复用的 “高级技能包”。

我们将从 Skills 是什么、如何工作，一路聊到怎样写好一个 Skills，并为你推荐实用的社区资源，带领大家在 TRAE 中实际使用 Skills 落地一个场景。

无论你是开发者还是普通用户，都能在这里找到让你的 Agent “开窍” 的秘诀。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0bkj7LZ89anseUF2XTU8RbKBtycITB9l370WGHnn1opur9ibapOKMWUQ/640?wx_fmt=png&from=appmsg#imgIndex=1)

**你是否也经历过或者正在经历这样的 “Agent 调教” 崩溃时刻？**

*   **规则失效：**在 Agent.md 里写下千言万语，Agent 却视若无睹，完全 “已读不回”。
    
*   **执行失控：**精心打磨了无数 Prompt，Agent 执行起来依旧像无头苍蝇，混乱无序。
    
*   **工具迷失：**明明集成了强大的 MCP 工具库，Agent 却两手一摊说 “没工具”，让人摸不着头脑。
    

如果这些场景让你感同身受，别急着放弃。**终结这场混乱的答案，可能就是 Skills。**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0Dr9licibMt8fSrrdxFVU1KZQgnf6iar8s43elaRf46SF3TctFjCg7qojw/640?wx_fmt=png&from=appmsg#imgIndex=2)

**什么是 Skills**

“Skills” 这个概念最早由 Anthropic 公司提出，作为其大模型 Claude 的一种能力扩展机制。简单来说，它允许用户为 Claude 添加自定义的功能和工具。随着这套做法越来越成熟，并被社区广泛接受，Skills 如今已成为大多数 Agent 开发工具和 IDE 都支持的一种标准扩展规范。

![](https://mmbiz.qpic.cn/mmbiz_jpg/oQ0houcyEichryx0I4XcC8f097TToXicE0zUiatTtMdpcORz1Z3vu13ccy3Y5ekjJpqnlBTA6Qs7LrFJzhSfMibJJw/640?wx_fmt=jpeg&from=appmsg#imgIndex=3)

一个 Skills 通常以一个文件夹的形式存在，里面主要装着三样东西：**一份说明书（SKILL.md）、一堆操作脚本（Script）、以及一些参考资料（Reference）。**

<table><tbody><tr><td data-colwidth="30.0000%" width="30.0000%"><section><section><p><strong>内容</strong></p></section></section></td><td data-colwidth="70.0000%" width="70.0000%"><section><section><p><strong>作用</strong></p></section></section></td></tr><tr><td data-colwidth="30.0000%" width="30.0000%"><section><section><p><strong>SKILL.md</strong></p></section></section></td><td data-colwidth="70.0000%" width="70.0000%"><section><p>通过自然语言描述清楚（使用场景、使用方式、使用步骤、及注意事项等上下文补充信息）</p></section></td></tr><tr><td data-colwidth="30.0000%" width="30.0000%"><section><section><p><strong>Script 脚本</strong></p></section></section></td><td data-colwidth="70.0000%" width="70.0000%"><section><section><p>Agent 可以执行的具体脚本代码</p></section></section></td></tr><tr><td data-colwidth="30.0000%" width="30.0000%"><section><section><p><strong>Reference 引用</strong></p></section></section></td><td data-colwidth="70.0000%" width="70.0000%"><section><section><p>参考文档，引用的模板，相关关联上下文的文件信息</p></section></section></td></tr></tbody></table>

你可以把一个 Skill 想象成一个打包好的 “技能包”。它把完成某个特定任务所需的**领域知识、操作流程、要用到的工****具、以及最佳实践**全都封装在了一起。当 AI 面对相应请求时，就能像一位经验丰富的专家那样，有条不紊地自主执行。

**一句话总结：**要是把 Agent 比作一个有很大潜力的大脑，那 **Skills 就像是给这个大脑的一套套能反复用的 “高级武功秘籍”。**有了它，Agent 能从一个 “什么都略知一二” 的通才，变成在特定领域 “什么都擅长” 的专家。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0iaJQWnYc2P6G2Sq9j3GSKZHTWacyIX96IiaBzaNiaExY23d97XK06y0wA/640?wx_fmt=png&from=appmsg#imgIndex=4)

**Skill 原理介绍**

📚 官方解释：

https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

**Skill 的架构原理：渐进式加载**

Skill 的设计很巧妙，它运行在一个沙盒环境里，这个环境允许大模型访问文件系统和执行 _**bash**_ 命令（可以理解为一种电脑操作指令）。在这个环境里，一个个 Skill 就像一个个文件夹。Agent 就像一个熟悉电脑操作的人，通过命令行来读取文件、执行脚本，然后利用结果去完成你交代的任务。这种 “按需取用” 的架构，让 Skill 成为一个既强大又高效的“工具箱”。

为了平衡效果和效率，Skill 设计了一套聪明的三层分级加载机制：

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0X3zBfiavibzL9ZgmBujpC15LKqqrVu8yTgpV24ZMYFQ51vDc6WoHibWPg/640?wx_fmt=png&from=appmsg#imgIndex=5)

<table><tbody><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>级别</strong></p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>加载时机</strong></p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p><strong>Token 消耗</strong></p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p><strong>内容</strong></p></section></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>1 级：元数据</strong></p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p>始终（启动时）</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p>每个技能<br></p><p>约 100 Token</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p>YAML 前置元数据中的名称和描述</p></section></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>2 级：说明文档</strong></p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p>技能触发时</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p>低于&nbsp;<br></p><p>5000 Token</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p>SKILL.md 正文（包含操作指南和指导说明）</p></section></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>3 级及以上：资源</strong></p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p>按需</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><p>几乎无限制</p></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><p>通过 bash 执行的捆绑文件（内容不加载到上下文）</p></section></td></tr></tbody></table>

**Level 1：元数据（始终加载）**

元数据就像是 Skill 的 “名片”，里面有名称（**_name_**）和描述（**_description_**），是用 YAML 格式来定义的。Claude 在启动的时候，会把所有已经安装的 Skill 的元数据都加载进来，这样它就能知道每个 Skill 有什么用、什么时候该用。因为元数据很轻量，所以你可以安装很多 Skill，不用担心把上下文占满。

**Level 2：说明文档（触发时加载）**

**_SKILL.md_** 文件的正文就是说明文档，里面有工作流程、最佳实践和操作指南。只有用户的请求和 Skills 元数据里的描述相符时，Claude 才会用 **_bash_** 指令读取这份文档，把内容加载到上下文里。这种 “触发式加载” 能保证只有相关的详细指令才会消耗 Token。

**Level 3：资源与代码（按需加载）**

Skills 还能打包一些更深入的资源，比如更详细的说明文档（**_FORMS.md_**）、可执行脚本（**_.py_**）或者参考资料（像 API 文档、数据库结构等）。Claude 只有在需要的时候，才会通过 **_bash_** 去读取或执行这些文件，而且脚本代码本身不会进入上下文。这样一来，Skills 就能捆绑大量信息，几乎不会增加额外的上下文成本。

**Skills 的调用逻辑：从理解意图到稳定执行**

那么，Agent 是如何智能地选择并执行一个 Skill 的呢？整个过程就像一位经验丰富的助理在处理工作：

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0FcXRicjPhNiahGVIRAQKGeicnAoibol67ibWDkn5buhOQapbporkuz0VTOg/640?wx_fmt=png&from=appmsg#imgIndex=6)

1.  **意图匹配（找到对的人）：**Agent 首先聆听你的需求，然后快速扫一眼自己手头所有 Skill 的 “名片夹”（元数据），寻找最匹配的那一张。
    
2.  **读取手册（看懂怎么干）：**找到合适的 Skills 后，Agent 会像模像样地翻开它的 “操作手册”（**_SKILL.md_**），仔细研究详细的执行步骤和注意事项。
    
3.  **按需执行（动手开干）：**根据手册的指引，Agent 开始工作。如果需要，它会随时从 “工具箱” 里拿出脚本或工具来完成具体操作。
    
4.  **反馈结果（事毕复命）：**任务完成后，Agent 向你汇报最终结果，或者在遇到困难时，及时向你请教。
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE02oTx8orSPD3ucaEUaJSibYDQgLzqlvOEZIJEqXfSx1CFCMm4U749EDQ/640?wx_fmt=png&from=appmsg#imgIndex=7)

**Skills  vs.  其他概念的区别**

为了更清晰地理解 Skills 的独特价值，我们不妨把它和另外两个容易混淆的概念——**快捷指令（Command）**和**原子工具（MCP）**——放在一起做个对比。用一个厨房的例子就很好懂了：

![](https://mmbiz.qpic.cn/mmbiz_jpg/oQ0houcyEichryx0I4XcC8f097TToXicE02TvV6MJBvBIPFGnqtibzvbtxzWXUd6RiaJa8ROZru3ibGQvsDRxmXdmlQ/640?wx_fmt=jpeg&from=appmsg#imgIndex=8)

<table><tbody><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>概念</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>好比是……</strong></p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p><strong>核心特点</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>适用场景</strong></p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>斜杠命令</strong></p><p><strong>Command</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>微波炉上的<strong> “指定按钮”</strong>（如：<em><strong>/ 解冻</strong></em>、<strong><em>/ 爆米花</em></strong>）</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p>由<strong>用户主动触发</strong>的、固定的、单一功能的命令。简单直接，但不够智能和灵活。</p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>作为主动复用 prompt 的快捷方式，让用户快速复用模板 prompt</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>模型上下文协议</strong></p><p><strong>MCP</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>厨房里的<strong> “单一厨具”</strong>（如：一把刀、一个烤箱）</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><section><p>为 AI 提供调用<strong>外部 API&nbsp;</strong>或脚本的基础能力。模型知道有这个工具，但不知道具体在什么菜谱里、什么步骤下使用，以及怎么更好的使用。</p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>通过标准协议链接外部系统获取信息或完成任务</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>技能</strong></p><p><strong>Skills</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>一本完整的<strong> “菜谱”</strong>（如：“如何制作法式焗蜗牛”）</p></section></section></td><td data-colwidth="35.0000%" width="35.0000%"><section><p>由<strong>模型根据任务自动匹配和驱动。</strong>它定义了制作这道菜（完成这个任务）需要用到哪些厨具（原子工具）、遵循哪些步骤、注意什么火候（最佳实践），是<strong>流程化、场景化</strong>的。</p></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><p>由模型驱动意图理解，通过渐进式加载补充上下文，并根据 SOP 完成指定任务</p></section></td></tr></tbody></table>

我们也列举了几个大家容易混淆的其他功能，一起来对比看看。

<table><tbody><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>概念</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>核心特点</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>适用场景</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p><strong>易混淆点</strong></p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>rules&nbsp;</strong></p><p><strong>规则</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>通常通过 agent.md 或者 project_rules 文件维护，内容基本与项目绑定</p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>主要专注于和项目强相关的场景</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>在无 Skills 的时候部分场景通过，在 rules 文件手动维护索引和文件 summary 的方式实现项目里的不同场景复用不同规则。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>Agent</strong></p><p><strong>智能体</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>通常搭配相关 prompt 和对应的 tools use 打包使用，普遍用于多 agent 系统中</p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>专用型场景使用 agent 可以更加符合场景需要</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>在 Skills + subagent 的场景中也能实现多 agent 调度的的逻辑</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>Memory</strong></p><p><strong>记忆</strong></p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>由模型主动或被动从用户对话中提炼关键上下文以进行记录</p></section></section></td><td data-colwidth="20.0000%" width="20.0000%"><section><section><p>日常开发过程中潜移默化的记录，对用户干扰性不大</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><p>Memory 生成的内容可能类似于 rules 或者 Skills 通常明确了使用场景的 memory 可以被手动迁移到 rules 或者 Skills 中</p></section></td></tr></tbody></table>

📚 官方博客解释：

https://claude.com/blog/skills-explained

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0zaIqubIDCx4X4CicXrh7Sx4ndjZoicwLUMgiaRtibYibzqMsRdO3UGPibicZg/640?wx_fmt=png&from=appmsg#imgIndex=9)

**什么是好的 Skills：从 “能用” 到“好用”**

**Good Skills vs Bad Skills**

<table><tbody><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>评判维度</strong></p></section></section></td><td data-colwidth="60.0000%" width="60.0000%"><section><section><p><strong>Good Skills</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>Bad Skills</strong></p></section></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>单一职责原则</strong></p></section></section></td><td data-colwidth="60.0000%" width="60.0000%"><section><section><p><strong>每个 Skill 只做一件事，且把它做好。</strong>例如，可以分解为三个独立的&nbsp;<em><strong>Skill：query_data</strong></em>、<strong><em>generate_chart</em></strong>、<strong><em>send_email</em></strong>。</p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>一个 Skill 试图做太多事，比如 “既负责数据查询，又负责图表生成，还负责邮件发送”。</p></section></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>描述清晰度</strong></p></section></section></td><td data-colwidth="60.0000%" width="60.0000%"><section><p><strong>描述清晰、具体，使用自然语言</strong>，明确说明输入、输出和核心功能。例如：“根据用户提供的城市名和日期范围，查询并返回该城市的天气数据。”</p></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>描述模糊，充满技术术语，智能体难以理解。例如：“一个用于数据处理的工具。”</p></section></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><p><strong>参数设计</strong></p></section></td><td data-colwidth="60.0000%" width="60.0000%"><section><p>参数精简、命名语义化（如&nbsp;<strong><em>city_name</em></strong>，<strong><em>&nbsp;date_range</em></strong>），并为每个参数提供清晰的描述和示例。明确使用 Skill 需要的参数如何获取，以及参数如何使用。</p></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><p>参数过多、命名不规范（如&nbsp;<strong><em>arg1</em></strong>，&nbsp;<strong><em>p2</em></strong>），缺少详细的注释说明。</p></section></td></tr><tr><td data-colwidth="15.0000%" width="15.0000%"><section><p><strong>可组合性</strong></p></section></td><td data-colwidth="60.0000%" width="60.0000%"><section><p>设计时就考虑到了<strong>可组合性</strong>，其输出可以作为其他 Skill 的输入，方便构建更复杂的任务流（Workflow），可以尝试通过单一职责完成原子 Skill 的开发，并通过某项具体任务 SOP Skill 完成协调。</p></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><p>设计上是 “一锤子买卖”，难以与其他 Skill 联动。</p></section></td></tr></tbody></table>

**如何写好 Skills**

1.  **原子性（Atomicity）：**坚持单一职责，让每个 Skill 都像一块积木，小而美，专注于解决一个具体问题，便于日后的复用和组合。
    
2.  **给例子（Few-Shot Prompting）：****这是最关键的一点**，与其费尽口舌解释，不如直接给出几个清晰的输入输出示例。榜样的力量是无穷的，模型能通过具体例子，秒懂你想要的格式、风格和行为。
    
3.  **立规矩（Structured Instructions）：**
    

**1) 定角色：**给它一个明确的专家人设，比如 “你现在是一个资深的市场分析师”。

**2) 拆步骤：**把任务流程拆解成一步步的具体指令，引导它 “思考”。

**3) 画红线：**明确告诉它 “不能做什么”，防止它天马行空地 “幻觉”

4.  **造接口（Interface Design）：**像设计软件 API 一样，明确定义 Skill 的输入参数和输出格式（比如固定输出 JSON 或 Markdown）。这让你的 Skill 可以被其他程序稳定调用和集成。
    

5.  **勤复盘（Iterative Refinement）：**把 Skills 当作一个产品来迭代。在实际使用中留心那些不尽如人意的 “Bad Case”，然后把它们变成新的规则或反例，补充到你的 Skills 定义里，让它持续进化，越来越聪明、越来越靠谱。
    

📚 一些官方最佳实践指南

https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0Uz86BqBEibv2x2buJIeJlib36ewZsQ71kuAjlvX1wAT6r7ld1ficC9qQQ/640?wx_fmt=png&from=appmsg#imgIndex=10)

**社区热门 Skills 推荐**

刚开始接触 Skills，不知从何下手？不妨从社区沉淀的这些热门 Skills 开始，寻找灵感，或直接在你的工作流中复用它们。

**Claude 官方提供的 Skills**

📚 官方 Skills 仓库

https://github.com/anthropics/skills

学习 Claude 官方的 Skills 仓库可以帮助我们最快的了解 Skills 的最佳实践，便于我们沉淀出自己的 Skills。

**如何快速使用官方 Skills？**

大多数官方 Skills 都能直接下载，或者通过 Git 克隆到本地。在 TRAE 等工具里，一般只需把这些 Skills 的文件夹放到指定的 **_Skills_** 目录，接着重启或刷新 Agent，它就会自动识别并加载这些新能力。具体操作可参考工具的使用文档。

更多细节可参考下面这部分内容：**如何在 TRAE 里快速用起来**

**Claude 官方提供的 Skills 列表**

<table><tbody><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>Skills 名称</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p><strong>Skills 说明</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p><strong>适用场景</strong></p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>algorithmic-art</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>使用 p5.js 创建生成艺术，支持种子随机性、流场和粒子系统。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于通过代码生成艺术、流场或粒子系统等场景。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>artifacts-builder</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>使用 React、Tailwind CSS 和 shadcn/ui 等现代前端技术，构建复杂的多组件 claude.ai HTML 制品。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于需要状态管理、路由或复杂 UI 组件的场景。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>brand-guidelines</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>将 Anthropic 官方品牌颜色和版式应用于各类制品。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><p>适用于需要遵循公司品牌或设计规范的视觉格式化任务。</p></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>canvas-design</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>使用设计哲学创建 PNG 和 PDF 格式的视觉艺术作品，如海报或设计图。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于需要原创视觉设计的场景，避免版权问题。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>document-Skills/docx</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>支持 docx 文件的创建、编辑与分析，包括追踪修订、添加评论、保留格式和文本提取。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于处理专业的 Word 文档。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>document-Skills/pdf</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>提供全面的 PDF 操作工具集，支持文本与表格提取、创建新 PDF、合并 / 拆分文档及处理表单。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于需要以编程方式处理、生成或分析 PDF 的场景。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>document-Skills/pptx</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>支持 pptx 文件的创建、编辑与分析，包括处理布局、模板、图表和自动生成幻灯片。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于各类演示文稿处理任务。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>document-Skills/xlsx</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>支持 xlsx 等电子表格文件的创建、编辑与分析，包括公式、格式化、数据分析和可视化。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于需要处理电子表格数据的各类任务。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>frontend-design</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>创建具有独特性和生产级别质量的前端界面。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于构建避免通用 AI 审美的、视觉效果突出的 Web 组件、页面或应用。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>internal-comms</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>辅助撰写各类内部沟通文档，如状态报告、领导层更新、公司通讯和常见问题解答。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于需要遵循公司内部沟通规范的写作任务。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>mcp-builder</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>指导创建高质量的 MCP （Model Context Protocol） 服务器，使语言模型能与外部服务和 API 交互。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于 Python （FastMCP） 或 Node/TypeScript （MCP SDK） 环境。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>Skills-creator</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>指导创建或更新能扩展 Claude 能力的 Skills，包括添加专业知识、工作流或工具集成。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于为 Claude 开发新能力的场景。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>slack-gif-creator</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>创建针对 Slack 优化的动画 GIF，提供尺寸验证和动画。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于为 Slack 创建符合其大小限制的动画 GIF 或表情。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>template-Skills</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>作为一个基础模板，用于创建新 Skills 的起点。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>/</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>theme-factory</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>提供 10 种预设主题或动态生成自定义主题，为各类制品（如幻灯片、文档）提供样式。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于需要对产出物进行专业视觉风格化的场景。</p></section></section></td></tr><tr><td data-colwidth="20.0000%" width="20.0000%"><section><section><p><strong>webapp-testing</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>使用 Playwright 与本地 Web 应用进行交互和测试，支持验证前端功能、调试 UI 行为和捕获浏览器日志。</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p>适用于 webapp AI 自动化测试场景</p></section></section></td></tr></tbody></table>

**社区其他最佳实践**

<table><tbody><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>分类</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>项目名称</strong></p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><p><strong>链接</strong></p></section></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>Github 社区 Awesome</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>一些 Skills 的最佳实践集合</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><ul><li><p>https://github.com/ComposioHQ/awesome-claude-Skills</p></li><li><p>https://github.com/travisvn/awesome-claude-Skills</p></li><li><p>https://github.com/libukai/awesome-agent-Skills</p></li></ul></section></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>非常全面的 Skills 分发市场</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>Skillsmp</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><p>https://Skillsmp.com/zh</p></section></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>使用工具将文档或网页转为 Skills</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>Skills_Seekers</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><p>https://github.com/yusufkaraaslan/Skills_Seekers</p></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>使用 Claude 进行学术创作</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>claude-scientific-writer</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><p>https://github.com/K-Dense-AI/claude-scientific-writer</p></section></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>你的专家级工作伙伴</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>superpowers</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><p>https://github.com/obra/superpowers</p></section></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>你的随身设计师</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>ui-Skillsls</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><p>https://www.ui-Skills.com/</p></section></section></td></tr><tr><td data-colwidth="25.0000%" width="25.0000%"><section><section><p><strong>快速复刻设计风格</strong></p></section></section></td><td data-colwidth="25.0000%" width="25.0000%"><section><section><p>ui-ux-pro-max-Skills</p></section></section></td><td data-colwidth="50.0000%" width="50.0000%"><section><section><p>https://ui-ux-pro-max-Skills.nextlevelbuilder.io/</p></section></section></td></tr></tbody></table>

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE08JPa6tmkiarbObeKlT5OWUx1nU9CKwUibucpwv9CQjhNph3WO6AgKrHw/640?wx_fmt=png&from=appmsg#imgIndex=11)

**如何在 TRAE 里快速使用**

理论说再多，不如亲手一试。我们先讲一下如何在 TRAE SOLO 中创建并应用一个 Skill 并以基于飞书文档的 Spec Coding 为例讲解一下如何利用 Skills 快速解决一个实际问题。

**Skill 创建**

**方式一：设置中直接创建**

TRAE 支持在设置页面可以快速创建一个 Skill

按下快捷键 Cmd +/ Ctrl + 通过快捷键打开设置面板。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0DQNYGYyjX1rgO5eHGpU8WcMCicUfiauNrAQKwSXoqmapicOkb5xA6Nv4A/640?wx_fmt=png&from=appmsg#imgIndex=12)

在设置面板左侧找到「规则技能」选项

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0J8cHZ6VSXYaOGlH9dt49XibT8REyXeZBGVib5zD5FDiciaR6dlCaw944Yg/640?wx_fmt=png&from=appmsg#imgIndex=13)

找到技能板块，点击右侧的「创建」按钮。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE07WD7q2Bc4OUBQx2TpeaMBelVNVdZYnAClribRCWxpJdI0uNwSvJbHWQ/640?wx_fmt=png&from=appmsg#imgIndex=14)

你会看到一个简洁的创建界面，包含三要素：**Skill 名称、Skill 描述、Skill 主体**。我们以创建一个 “按规范提交 git commit” 的 Skill 为例，填入相应内容后点击「确认」即可。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0g80iaJ4xwmJyROx52qXuDoqmvKt669iaDOds3h7VVic6AZJTRAsaqMicaQ/640?wx_fmt=png&from=appmsg#imgIndex=15)

填入我们需要的内容「确认」即可

**方式二：直接解析 SKILL.md**

在当前项目目录下，新增目录.**_trae/Skills/xxx_** 导入你需要文件夹，和 TRAE 进行对话，即可使用。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0DsPQshdHWL3f6DUe9vpernVon8sGMIPHyXJCCyicfDgfSXFRJV1iaHmg/640?wx_fmt=png&from=appmsg#imgIndex=16)

可以在「设置 - 规则技能」中看到已经成功导入

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0KjgAibNibRempic1Mr9tBk3g7icRNib4eazjF5Cqj86GMFRicbxgZO1MmFSQ/640?wx_fmt=png&from=appmsg#imgIndex=17)

**方式三：在对话中创建**

目前 TRAE 中内置了 Skills-creator Skills ，你可以在对话中直接和 TRAE 要求创建需要的 Skills

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0MaUx7O09ibtYFeotEc8P6hj1hV15392vWibKS70KpUvOFibq3Oq3oe1yQ/640?wx_fmt=png&from=appmsg#imgIndex=18)

**Skill 使用**

在 TRAE 里使用技能很容易，你加载好需要的技能后，只需在对话框中用日常语言说明你的需求就行。

*   例如，输入 “帮我设计一个有科技感的登录页面”，系统就会自动调用“frontend-design” 技能。
    
*   例如，输入 “帮我提取这个 PDF 里的所有表格”，系统会自动调用“document-Skills/pdf” 技能。
    
*   例如，输入 “帮我把这片技术文档转为飞书文档”，系统会自动调用“using-feishu-doc” 技能。
    

系统会自动分析你的需求，加载技能文档，还会一步步指导你完成任务！

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0ZnzUNVuUiakTXz44F3SFtCuaf82CvicOn1aPQRf5IDGsC6dIyjYYbnbA/640?wx_fmt=png&from=appmsg#imgIndex=19)

**实践场景举例**

还记得引言里提到的那些问题吗？比如说，项目规则文件（**_project_rules_**）有字符数量的限制；又或者，就算你在根规则文件里明确写好了 “在什么情况下读取哪个文件”，Agent 在执行任务时也不会按照要求来做。

这些问题的根本原因是，**规则（Rules）对于 Agent 而言是固定不变的**，它会在任务开始时就把所有规则一次性加载到上下文中，这样既占用空间，又不够灵活。而 **技能（Skill）采用的是 “逐步加载” 的动态方式**，刚好可以解决这个问题。所以，我们可以把之前那些复杂的规则场景，重新拆分成一个个独立的技能。

**接下来，我们通过一个基于飞书文档的 “Spec Coding” 简单流程，来实际操作一下如何用技能解决问题。**

**什么是 Spec Coding？**

Spec Coding 提倡 “先思考后行动”，也就是通过详细定义可以执行的需求规范（Specification）来推动 AI 开发。它的流程包含“需求分析、技术设计、任务拆解” 的文档编写过程，最后让 AI 根据规范来完成编码。这种一步步的工作流程能保证每一步都有依据，实现从需求到代码的准确转化。

**让我来分析一下这个场景**

上面提到将开发过程划分为四个关键阶段，所以要完成 “需求分析、技术设计、任务拆解” 的飞书文档撰写，还有最终的代码实现。为此，我们需要不同的技能来满足不同场景下的文档编写需求，并且要教会 Agent 如何使用飞书工具进行创作协同。

**下面我们就一起完成上面提到的 Skills 的设计实现。**

**多角色专家 Skills**

通过实现多角色 Skills 通过创建多个交付物过程文档，约束后续的编码，为编码提供足够且明确的上下文，每个 Skill 专注完成一件事

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE039L0ic0oYIA9b00wv5l1CjngRo0ayYdgcv1NXSVG8DdWTyCVM2HuCmw/640?wx_fmt=png&from=appmsg#imgIndex=20)

*   **下面让我们进一步详细设计**
    

<table><tbody><tr><td data-colwidth="5.0000%" width="5.0000%"><section><section><p><strong>序号</strong></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p><strong>角色名称</strong></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p><strong>Skills 标识</strong></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p><strong>主导思维</strong></p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p><strong>输入</strong></p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><p><strong>职责</strong></p></section></section></td><td data-colwidth="10.0200%" width="10.0200%"><section><section><p><strong>交付物</strong></p></section></section></td></tr><tr><td data-colwidth="5.0000%" width="5.0000%"><section><section><p><strong>1</strong></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>需求分析师</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>requirement-analyst</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>产品思维</p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p>用户模糊的一句话需求、草图</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><ul><li><p>澄清挖掘：识别模糊点，主动提问</p></li><li><p>边界定义：明确 Scope（做什么 / 不做什么）</p></li><li><p>场景细化：梳理 User Stories 和 Edge Cases</p></li></ul></section></section></td><td data-colwidth="10.0200%" width="10.0200%"><section><section><p>REQUIREMENT.md</p></section></section></td></tr><tr><td data-colwidth="5.0000%" width="5.0000%"><section><section><p><strong>2</strong></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>技术架构师</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>system-architect</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>工程思维</p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p>REQUIREMENT.md</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><ul><li><p>技术选型：确定框架、库、工具链&nbsp;</p></li><li><p>数据建模：设计 Schema、State、API Spec&nbsp;</p></li><li><p>模块设计：划分组件层级、核心类图</p></li></ul></section></section></td><td data-colwidth="10.0200%" width="10.0200%"><section><section><p>DESIGN.md</p></section></section></td></tr><tr><td data-colwidth="5.0000%" width="5.0000%"><section><section><p><b>3</b></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>任务规划师</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><p>task-planner</p></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><p>项目管理思维</p></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><p>REQUIREMENT.md + DESIGN.md</p></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><ul><li><p>颗粒度控制：拆解为 &lt; 15min 的原子任务&nbsp;</p></li><li><p>依赖排序：规划开发顺序（类型→Mock→组件）&nbsp;</p></li><li><p>验证标准：设定 Definition of Done</p></li></ul></section></td><td data-colwidth="10.0200%" width="10.0200%"><section><p>TODO.md</p></section></td></tr><tr><td data-colwidth="5.0000%" width="5.0000%"><section><section><p><strong>4</strong></p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>规范执行者</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>spec-coder</p></section></section></td><td data-colwidth="10.0000%" width="10.0000%"><section><section><p>编程思维</p></section></section></td><td data-colwidth="15.0000%" width="15.0000%"><section><section><p>TODO.md + DESIGN.md</p></section></section></td><td data-colwidth="40.0000%" width="40.0000%"><section><section><ul><li><p>严格执行：遵循设计文档的命名与结构</p></li><li><p>变更管理：遇阻回滚设计，不擅自修改逻辑</p></li><li><p>自我验证：完成任务即进行测试</p></li></ul></section></section></td><td data-colwidth="10.0200%" width="10.0200%"><section><section><p>高质量代码</p></section></section></td></tr></tbody></table>

按照上述的表格我们就可以大致明确我们需要的 Skills 该如何实现了。

*   本次只作为一个例子大家可以参考上面创建 Skill 的教程自己完成一下这个多角色 Skills 的创建和调试，当然正如上面所述好的 Skill 需要在实践中逐渐优化并通过场景调用不断进行优化的
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0veUmIQoNiaLJiaDNbt3Zicp86X9QrYkHqQcKC9ZsnaOlaQoDxv2EZJb1A/640?wx_fmt=png&from=appmsg#imgIndex=21)

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0Vpuia1pIHU5JAy3dOmVY6Zm5QxWYwIMYGAfnAb2GS2M52hia3gRfpicUw/640?wx_fmt=png&from=appmsg#imgIndex=22)

**飞书文档使用 Skill**

飞书文档的格式是 markdown 的超集，**我们 Skill 的目的则是教会 Agent 飞书文档的语法**，便于 Agent 写出符合格式的 md 文件。并通过约束 Agent 行为，**充分利用飞书文档的评论的读写完成多人协作审阅的过程**，用户通过在飞书文档评论完成相关建议的提出，Agent 重新阅读文档和评论，根据建议进一步优化文档，**实现文档协作工作流。**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0wpetz3KBP9XWhTfQJbS4bSlcL7PicWuSAsiauMe8nJslYK7AO5DV32QQ/640?wx_fmt=png&from=appmsg#imgIndex=23)

**Spec Coding Skill**

上面我们实现了多个角色 Skills 和一个功能 Skill，但实际使用时，还需要有一个能统筹全局的技能，来实现分工协作。把上述多个技能组合起来，告诉智能体（agent）整体的规格编码（spec coding）流程，完成工具技能和角色技能的组合与调度。

如此我们就能快速搭建一个规格编码工作流程，完成基础开发。当然也可以参考上面的逻辑，用技能来重新复刻社区里的规格编码实践（如 SpecKit、OpenSpec 等）。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0SXIu7aibhhicJIlBqUMcg4xyaSyaV8mhOMtaciack0RdMm8QPic6wNr6fg/640?wx_fmt=png&from=appmsg#imgIndex=24)

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0byr9Fkh6yeEQqT1cKbtOZtJHXw9NF2Riahe1mb9lHLVWOy5uqeLwo2w/640?wx_fmt=png&from=appmsg#imgIndex=25)

**总结**

上述场景提到了两种不同风格的 Skill（角色型，工具型），利用 **Skill 的动态加载机制**（取代固定规则的一次性加载方式），完成了复杂场景下的任务分解；通过 **不同角色技能的分工协作**（避免 Agent 什么都做导致执行混乱）；尝试借助**飞书文档形成协作闭环**（打通人机交互的最后一步），有效解决了 Agent “不听话、执行乱、工具少” 的问题，让 AI 从 “对话助手” 真正转变为 “可信赖的实干家”，实现从需求提出到代码产出的高效、精准、协作式交付。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0NtpVP0GqqrzgVdaNAgQxGd8IE0GplM3jjnfASaAicDgIAo5dtCQM3PQ/640?wx_fmt=png&from=appmsg#imgIndex=26)

**Q & A | 一些常见问题**

**为什么我写的 Skills 不生效，或者效果不符合预期？**

**那十有八九是你的 “名片”（****_Description_****）没写好。**

记住，Agent 是通过读取 Skills 的 _**Description**_ 来判断 “什么时候该用哪个 Skill” 的。要是你的描述写得含糊不清、太专业或者太简单，Agent 就很难明白你的意思，自然在需要的时候就不会调用这个 Skill。所以，**用大白话写的清晰、准确的** **_Description_****，对 Skill 能否起作用至关重要。**

**使用 Skills 的效果，会受到我选择的大语言模型（LLM）的影响吗？**

**会有影响，不过影响的方面不一样。**

*   **一个更强大的模型，主要影响 “挑选” 和“安排”技能的能力。** 它能更准确地明白你的真实想法，然后从一堆技能里挑出最适合的一个或几个来解决问题。它的优势体现在制定策略方面。
    
*   **而技能本身，决定了具体任务执行的 “最低水平” 和“稳定性”。** 一旦某个技能被选中，它里面设定好的流程和代码是固定的，会稳定地运行。所以，技能编写得好不好，直接决定了具体任务能不能出色完成。。
    

**Skills 是不是万能的？有什么它不擅长做的事情吗？**

**当然不是万能的。**Skills 的主要优势是**处理那些流程明确、边界清晰的任务。**在下面这些情况中，它可能就不是最好的选择了：

*   **需要高度创造力的任务：**像写一首饱含情感的诗，或者设计一个全新的品牌标志。这类工作更需要大模型本身的 “灵感”。
    
*   **需要实时、动态做决策的复杂策略游戏：**比如在变化极快的金融市场中做交易决策。
    
*   **单纯的知识问答或开放式闲聊：**如果你只是想问 “文艺复兴三杰是谁？”，直接问大模型就可以，不用动用 Skills 这个 “大杀器”。
    

**我发现一个社区的 Skills 很好用，但我可以修改它以适应我的特殊需求吗？**

**当然可以，我们强烈建议你这么做！**

大多数共享的 Skill 都支持用户 “Fork”（也就是 “复制一份”）并进行二次开发。你可以把通用的 Skill 当作模板，在自己的工作空间里复制一份，然后修改里面的逻辑或参数，以适应你自己的业务需求。这对整个生态的共建和知识复用很重要。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0NRKXsxp8diaF6pIauV92WzERkn7tcmb8hfR2tTlDnEN7HLoNLJmURiaA/640?wx_fmt=png&from=appmsg#imgIndex=27)

**结语｜让 Agent 成为你真正的 “行动派”**

Skill 的出现，为 AI 从 “对话式助手” 转变为 “可信赖的执行者” 搭建了关键的技术桥梁。它用结构化的方法把领域知识、操作流程和工具调用逻辑封装起来，解决了 Agent 规则失效、执行失控的混乱问题，让 AI 的能力输出变得可以控制、值得信赖且高效。

Skill 的核心价值在于：

*   **精准实际痛点：**通过巧妙的三级加载机制（元数据→说明文档→资源）平衡上下文效率与功能深度，在功能深度和上下文效率之间找到了一个绝佳的平衡点，既避免了宝贵 Token 的浪费，又确保了任务执行的精准性，实现了 Agent 上下文的动态加载能力。
    
*   **生态赋能，降低门槛：**无论是官方还是社区，都提供了丰富的资源（如 Claude 官方仓库、SkillsMP 市场等），让普通用户也能轻松站在巨人的肩膀上，快速复用各种成熟的能力。
    

虽然 Skill 不是万能的，但它在 “确定性流程任务” 上的优势无可替代。未来，随着 AI 模型能力的提升与 Skill 生态的进一步完善，我们有望看到更多跨领域、可组合的 Skill 出现——**让 AI 从 “样样懂一点” 的通才，真正进化为 “事事做得好” 的专家协作伙伴。**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0bkj7LZ89anseUF2XTU8RbKBtycITB9l370WGHnn1opur9ibapOKMWUQ/640?wx_fmt=png&from=appmsg#imgIndex=28)

**不妨从今天开始，尝试创建你的第一个 Skill：将你最擅长的领域经验封装成可复用的能力，让 AI 成为你延伸专业价值的放大器。**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEichryx0I4XcC8f097TToXicE0WBrLC6TvLjYTCsCS2jkUdPIb0XSIuYNVKhtKha3vBBRZwfYPZr7hUQ/640?wx_fmt=png&from=appmsg#imgIndex=29)