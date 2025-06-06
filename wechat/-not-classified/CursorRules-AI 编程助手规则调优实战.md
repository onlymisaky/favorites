> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/pTCgfZwlM6jIfikuGv_ohw)

![](https://mmbiz.qpic.cn/mmbiz_gif/33P2FdAnju9cLcib00YV66gYq2V6Fhm7YTHlzZdFwfnCtxyBCvgiaicG65n8du0mUYunHZIaBKohjsBxA4sgrPSjQ/640?wx_fmt=gif&wxfrom=5&wx_lazy=1&tp=webp)

  

  

本文深入解析了如何通过 CursorRules 对 AI 编程助手进行精细化管理，使其更好地适应项目需求与团队规范。从基础概念到高级技巧，文章全面介绍了 CursorRules 的结构、配置方法及最佳实践，并探讨了其在提升代码质量、协作效率以及个性化体验方面的巨大价值。无论你是初学者还是进阶用户，都能从中找到 “调教”AI 助手的实用指南和灵感。

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5RkRoYd65guD5FtbNgFoz71Fzyp1yc7WklYCvES93U4NELnJf4lFzgw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

引言：我的 AI 队友，有时像 "猪队友"？

嘿，各位程序员们！自从有了 Cursor 这种 AI 神器，写代码是不是感觉像开了挂？嗖嗖的，效率倍儿增！但有时候吧，这位 AI 队友是不是也有点 "放飞自我"？比如，你明明想让它改个 Bug，它却热情洋溢地帮你重构了半个项目；或者，你强调了八百遍要用 Tab 缩进，它偏偏跟你杠上了，坚持用空格... 这感觉，就像带了个天赋异禀但有点 "野" 的新人，潜力巨大，但得好好 "调教"。

这时候，CursorRules 闪亮登场！它可不是简单的配置文件，更像是你给 AI 助手量身定做的 "行为规范手册"，或者说是孙悟空头上的那个 "紧箍咒"——当然，咱这是友好的、为了高效合作的 "咒"。通过 CursorRules，你可以明确告诉 AI："在我这儿，得按我的规矩来！" 从最初一个孤零零的 .cursorrules 文件，到现在更灵活、更强大的 .cursor/rules/ 目录结构，CursorRules 也在不断进化，让我们能更精细地 "驯服" 这头潜力无限的 AI 猛兽。这篇指南，就是要带你深入探索 CursorRules 的十八般武艺，从入门到精通，让你和 AI 的协作丝滑流畅，告别 "猪队友" 时刻！

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8QKUdN61cMK37CuCzBibrWpyMD8cEkibb5Fc8ZzUjlOGLwz31ibXce4icM8hwKSsPLJk0jiaohLLat59Q/640?wx_fmt=png&from=appmsg&watermark=1)

```
# .cursor/rules/general.mdc (或者旧的 .cursorrules 文件)
## 通用礼节 (General Etiquette)
- 优先保证代码简洁易懂。
- 别搞过度设计，简单实用就好。
- 给我解释代码的时候，说人话，别拽专业术语。
## Code Style Basics
- 缩进用 2 个空格，拜托了！
- 文件末尾必须有一个空行。
- 函数名用小驼峰命名法 (camelCase)。
```

**▐** **这 "规矩" 到底是啥玩意儿？**

想象一下，你是个大导演，你的 AI 助手就是那个演技炸裂但偶尔即兴发挥过头的明星演员。CursorRules 就是你给这位演员的 "剧本补充说明" 和 "导演阐述"。它告诉演员："这场戏，你得这么演：语气要稳重，台词不能改，走位往这边……" 具体到代码世界，CursorRules 就是你给 AI 的一系列指令，告诉它：

*   项目背景板 (Project Context): "咱这项目用的是 React + TypeScript，后端是 Node.js，UI 库是 Ant Design，记住了啊！"
    
*   行为小贴士 (Behavioral Nudges): "生成代码注释要用 JSDoc 格式。" "遇到错误先别急着改，先分析根本原因。"
    
*   纠错小黑板 (Error Correction Board): "上次让你用 lodash 你搞错了，记住，导入要用 import _ from'lodash'; 这种方式。"
    
*   团队风向标 (Team Style Guide): "我们团队统一用 Prettier 格式化，缩进 2 空格，看到不一样的给我改过来！"
    

简单说，CursorRules 就是让 AI 更懂你、更懂项目、更符合团队规范的 "说明书"。[1, 4]

**▐**  **全局 VS 项目："家规" 与 "游戏规则"**

写规矩的地方有两个，就像家里的 "家规" 和棋牌室里的 "特定游戏规则"：

*   **全局规则 (Global Rules):** 这就是你的 "家规"，写在 Cursor 的设置里 (`Settings > General > Rules for AI`)。这里的规矩对你所有的项目都生效。比如，"无论干啥，优先考虑代码可读性" 这种普适原则，放这儿就挺好。但缺点是，它不够具体，没法针对某个项目的特殊要求。
    
*   **项目特定规则 (Project-Specific Rules):** 这就是 "游戏规则"，只在当前项目里有效，能覆盖全局规则里的某些条款。以前是在项目根目录放一个 .cursorrules 文件，简单粗暴。但现在，Cursor 更推荐用新的方式（老方法未来可能不支持了哦）：在项目根目录下创建一个 .cursor 文件夹，然后在里面再建个 rules 文件夹，最后把你的规则分门别类写在不同的 .mdc 文件里，比如 python.mdc 管 Python 的事，react.mdc 管 React 的事。[8] 这就像你把工具箱里的螺丝刀、扳手、锤子分门别类放在不同的小格子里，找起来是不是方便多了？
    

**优先级 (Priority):** 一般来说，项目特定规则的 "威力" 更大。如果全局规则说 "用 4 空格缩进"，但当前项目的规则文件里写了 "用 2 空格缩进"，那 AI 在这个项目里就会听项目规则的。当然，你得在全局设置里勾选 "包含 .cursorrules 文件"（或者类似的新选项）来启用项目规则。[5]

**▐**  **新手起步：写几条简单的试试水 (3. Getting Started: Dip Your Toes with Some Simple Rules)**

刚开始别把自己搞太复杂。试试用大白话写几条基本规则，就当跟 AI 聊天呢：[4]

```
.
├── .cursor/
│   └── rules/
│       ├── general.mdc       # 通用规则 (Always on)
│       ├── python.mdc        # Python 相关 (Loads for .py files)
│       ├── react.mdc         # React 相关 (Loads for .jsx, .tsx files)
│       ├── database.mdc      # 数据库操作相关 (Maybe always on or specific types)
│       └── git.mdc           # Git 提交规范 (Always on?)
├── src/
│   └── ...
└── requirements.txt
```

**小贴士 (Tips):**

**具体点儿: "用合适的缩进" 就不如 "用 2 个空格缩进" 来得明确。[4]**

**说人话: 就用自然语言写，AI 能看懂。[4]**

**抓重点: 把最重要的规矩写在前面。[4]**

**多试试: 用着用着你就会发现哪里还需要加规矩，随时更新就好。[4]**

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5Mcf2mWYYibJt6RwM7zgbBS247KgYR9yVeZewdqR7qYwa7Rp0eCKm7JA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

**高手进阶——结构化你的 "规矩"，精准打击！**

**▐** **告别大杂烩：拥抱 .cursor/rules/ 新结构**

前面提到了，现在推荐用 .cursor/rules/ 目录来管理你的规则文件。这可不只是换个地方放文件那么简单，好处多多：[8]

*   **模块化 (Modularity): 每个 .mdc 文件可以专注于一个特定领域（比如 Python 规范、React 组件写法、Git 提交信息格式等）。**
    
*   **清晰明了 (Clarity): 查找和修改特定规则变得更容易，不用在一大堆文字里大海捞针。**
    
*   **按需加载 (On-Demand Loading): 结合后面要讲的 RuleType，可以实现只在需要时加载相关规则，更高效。**
    

想象一下，你的项目像个大厨房，.cursorrules 文件就像一个乱糟糟的抽屉，里面塞满了各种厨具。而 .cursor/rules/ 目录就像一个分类清晰的橱柜系统，刀具、锅碗、调料各有归属，井井有条。

**例子 (Example Structure):**

```
---
RuleType: Always
---
# general.mdc
# 这个规则文件将始终被加载
你是一个乐于助人且有点幽默感的 AI 编程助手。
项目技术栈: Python (Flask), PostgreSQL, React, Tailwind CSS
```

**▐** **指哪打哪：玩转规则类型 (RuleType)**

光把规则分文件还不够，我们还得告诉 Cursor 什么时候用哪些规则。这时候 RuleType 就派上用场了（这个配置通常写在 .mdc 文件的开头，用类似 YAML front matter 的格式）。[8]

*   `Always`**: 这类规则是 "万金油"，无论你打开什么文件，它都默默生效。适合放项目总体介绍、通用编码哲学、Git 规范这种 "普世价值"。**
    
*   `Auto Attached`**: 这类规则是 "专科医生"，只有当你打开特定类型的文件时，它才会被激活。比如，你可以设置 python.mdc 只在编辑 .py 文件时加载，react.mdc 只在编辑 .jsx 或 .tsx 文件时加载。这能确保 AI 在处理特定语言或框架时，能得到最相关的指导，同时也避免了不相关规则的干扰。**
    

**配置示例 (Configuration Example in .mdc):**

```
---
RuleType: Auto Attached
FileTypes: ["*.py"]
---
# python.mdc
# 只有在打开 .py 文件时加载
Python 版本是 3.10。请使用 f-string 进行字符串格式化。
遵循 PEP 8 规范，特别是每行不超过 79 个字符的建议（虽然我知道这很难）。
```

```
# 实验性规则 (Experimental Rule)
当你被要求修复一个 Bug 时，请遵循以下步骤：
1.  **理解问题 (Understand):** 仔细阅读 Bug 描述和相关代码，复述你对问题的理解。
2.  **分析原因 (Analyze):** 提出至少两种可能的根本原因。
3.  **制定计划 (Plan):** 描述你打算如何验证这些原因，并给出修复方案。
4.  **请求确认 (Confirm):** 在动手修改前，向我确认你的计划。
5.  **执行修复 (Execute):** 实施修复。
6.  **解释说明 (Explain):** 解释你做了哪些修改以及为什么。
```

**工作流程图 (Workflow Diagram - Mermaid):**

![](https://mmbiz.qpic.cn/mmbiz_jpg/33P2FdAnju8QKUdN61cMK37CuCzBibrWpfVO4I6l78VPrk2x7vSfkicgpT5RWPbqqicLRI4q9qYpB6WmzM0mYtdfQ/640?wx_fmt=jpeg&from=appmsg&watermark=1)

这个图大概意思就是：打开一个 .py 文件？好的，把通用规则 (`general.mdc`) 和 Python 专属规则 (`python.mdc`) 都给 AI 看。打开 .jsx 文件？那就通用规则加 React 规则。其他文件？就只看通用规则。这样是不是很智能？

**▐** **不止代码风格：喂给 AI 更深度的 "料"**

CursorRules 的强大之处在于，它不光能管代码风格这种 "表面功夫"，更能给 AI 提供深层次的项目理解力。就像你要让演员演好一个角色，光告诉他 "要帅" 是不够的，你得给他看剧本、讲人物小传、分析角色内心世界。[1, 5]

*   **技术栈与架构 "全家桶" (The Full Tech Stack & Architecture Meal): 别只说用了啥语言框架，可以提一提关键的设计模式（比如 "我们这里重度使用策略模式"）、重要的架构决策（"数据库读写分离，注意区分"）、核心库的特定用法（" 处理日期必须用** `dayjs`，别用 `moment`"）。
    
*   **领域知识 "扫盲" (Domain Knowledge "Crash Course"): 如果你的项目涉及特定行业（比如金融、医疗），用几句话给 AI 科普一下核心业务概念、常用术语缩写。这样 AI 生成的代码和注释才能更 "行内"。比如："在这个电商项目里，SKU 指的是最小存货单位，和 SPU（标准化产品单元）不同，别搞混了。"**
    
*   **"踩坑实录" 与 "经验分享" (Pitfall Diary & Experience Sharing): 这就是 .cursorrules 文件里提到的 Lessons 部分的精髓！把你或团队踩过的坑、总结出的经验教训、特定库的 workarounds 都写进去。比如：" 注意！这个第三方 API 有个 bug，查询时** `page` 参数从 0 开始而不是 1。" " 处理用户上传的图片，一定要先压缩再存储，用这个 `compress_image` 函数。" 这能有效避免 AI 重蹈覆辙。[1]
    
*   **工具链与环境 "备忘录" (Toolchain & Environment "Memo"): 提一下项目用的构建工具 (Webpack/Vite)、包管理器 (npm/yarn/pnpm)、测试框架 (Jest/Pytest)、代码检查工具 (ESLint/Flake8) 等，以及它们的重要配置。比如："ESLint 配置了不允许** `console.log`，调试时请用 `debugger`。"
    

给 AI 的 "料" 越足，它就越能像个真正的资深队友一样思考和行动。

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5ud5n7myibIvZHIq1ia9W8uwXJ6Z8LkILkKw5wgGVF0sfhcMcrnZhzkaw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

融会贯通——最佳实践与独门绝技

**▐** **写好 "规矩" 的武林秘籍**

想让你的 CursorRules 发挥最大威力？光知道怎么写还不够，得讲究策略和技巧：[4, 8]

1.  **持续进化，拒绝僵化 (Iterate, Don't Stagnate): 你的项目在变，团队规范在变，你对 AI 的期望也在变。所以，别把规则写死，要定期回顾、测试、优化。发现 AI 哪里做得不好，或者有了新想法，就去更新你的 .mdc 文件。把它当成一个活的文档。**
    
2.  **松紧适度，方为大师 (Balance Guidance and Freedom): 规矩太松，AI 可能还是乱跑；规矩太死，又可能扼杀它的创造力，或者在遇到规则没覆盖到的新情况时束手无策。要找到那个平衡点：给出明确的核心原则和底线，但在具体实现上留有一定的灵活性。**
    
3.  **"少说多做"，上示例！ ("Show, Don't Just Tell" – Use Examples!): 空泛的描述不如一个具体的例子来得直接。想让 AI 遵循某种代码模式？贴一小段你期望的代码片段。想让它按特定格式写注释？给个 JSDoc 的例子。**
    
4.  **保持队形，别内讧 (Consistency is Key): 检查你的规则，确保它们内部以及不同规则文件之间没有自相矛盾的地方。比如，一个文件里说用单引号，另一个文件里说用双引号，AI 就懵了。**
    
5.  **纳入版本控制，利于协作 (Version Control for the Win): 把 .cursor/rules/ 目录加到你的 Git 仓库里！这样不仅能追踪规则的修改历史，还能方便团队成员共享、讨论和维护同一套标准。这对于团队协作至关重要。**
    
6.  **团队布道，达成共识 (Team Buy-in and Standardization): 如果是团队项目，光你自己用一套规则还不够。要和团队成员沟通，共同制定或采纳一套 CursorRules 标准，并确保大家都理解并愿意遵守。可以指定专人维护，或者定期开会讨论更新。**
    

**▐** **给 AI 开 "外挂"：`@Docs` 的神秘力量**

有时候，光靠规则里的文字还不够，AI 可能需要参考更详尽的外部资料，比如项目的 README、某个库的官方文档、甚至是一篇解释复杂算法的 PDF 论文。这时候，Cursor 的 `@Docs` 功能就派上用场了！[1, 3]

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8QKUdN61cMK37CuCzBibrWpR3u5zpdq7KAdINyzOnPBAGhC3m9uWqNtPGuyiaggfqgwVEGRuGP0ePQ/640?wx_fmt=png&from=appmsg&watermark=1)

它的工作流程大概是这样：

1.  **准备 "教材" (Prepare the "Textbook"): 如果是 PDF，先用工具（比如 Marker [3]）把它转换成 Markdown 格式。如果是网页文档，复制关键内容。如果是代码仓库，可以提取 README 或其他关键的 Markdown 文件。**
    
2.  **上传到 "云书架" (Upload to the "Cloud Bookshelf"): 把准备好的 Markdown 内容粘贴到一个公开的 GitHub Gist 里。[3] Gist 就像一个简单的代码片段分享服务。**
    
3.  **在 Cursor 里 "登记入学" (Register it in Cursor): 在 Cursor 里找到添加文档的功能（通常在聊天框输入** `@Docs` 会有提示），选择 "添加新文档"，给它起个名字，把 Gist 的链接（通常是 HTTPS 克隆链接）粘贴进去，然后让 Cursor 索引它。[3]
    
4.  **在规则或提问中 "召唤" (Summon it in Rules or Prompts): 现在，你可以在 CursorRules 文件里，或者直接在聊天提问时，使用** `@Doc <你起的名字>` 来引用这份文档了！[3] 比如，你可以在规则里写：" 生成用户认证相关代码时，请务必参考 `@Doc AuthGuide` 文档里的流程。"或者直接问："`@Doc MyAPISpec`，根据这份文档，给我写一个调用 `/users/{id}` 端点的函数。"
    

这样一来，AI 就能利用这些外部知识库，提供更精准、更符合项目实际的帮助了。是不是很酷？

**▐** **让 AI 学会 "思考"：探索 "计划 - 执行" 模式**

这部分稍微有点超前，更像是对未来可能性的一种探索。社区里有些大神（比如 `devin.cursorrules` [10]）在尝试通过 CursorRules 引导 AI 进行更复杂的任务规划和执行，有点像让 AI 具备初步的 "计划 - 执行" 能力。

想象一下，你不是直接告诉 AI "修复这个 Bug"，而是在规则里定义一个大致的 "Debug 工作流"：

```
# 实验性规则 (Experimental Rule)
当你被要求修复一个 Bug 时，请遵循以下步骤：
1.  **理解问题 (Understand):** 仔细阅读 Bug 描述和相关代码，复述你对问题的理解。
2.  **分析原因 (Analyze):** 提出至少两种可能的根本原因。
3.  **制定计划 (Plan):** 描述你打算如何验证这些原因，并给出修复方案。
4.  **请求确认 (Confirm):** 在动手修改前，向我确认你的计划。
5.  **执行修复 (Execute):** 实施修复。
6.  **解释说明 (Explain):** 解释你做了哪些修改以及为什么。
```

这种方式尝试引导 AI 像人类开发者一样，更有条理地解决复杂问题。当然，目前这更多的是一种提示工程（Prompt Engineering）的延伸，效果依赖于 AI 模型的理解能力和规则的巧妙设计，还不算是 Cursor 的标准功能，但它展示了 CursorRules 的巨大潜力——不仅仅是约束，更是赋能！[1]

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5eCtYVkmJr6K9ZSYaRZ6ebU19xwib5ZYLtDk1AFAsPNRAkK6J4TJjLaw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

江湖路远——社区资源与未来展望

**▐** **独乐乐不如众乐乐：拥抱社区力量**

写 CursorRules 遇到瓶颈？想看看别人是怎么玩的？别担心，你不是一个人在战斗！Cursor 社区非常活跃，有很多地方可以找到灵感和帮助：[4, 7]

*   **Cursor 官方论坛 (Cursor Community Forum): 这是宝藏库！有专门的板块讨论和分享 .cursorrules 文件和新的 .cursor/rules/ 用法。你能找到各种项目的规则示例，从 Web 开发到数据科学，应有尽有。[2, 9, 11]**
    
*   **GitHub: 直接在 GitHub 搜索** `cursorrules` 或者包含 .cursor/rules/ 的项目，你会发现很多开发者公开了他们的规则配置，是非常好的学习材料。[6]
    
*   **博客和教程网站 (Blogs and Tutorial Sites): 像 Cursor 101 [4] 或者一些技术博客（比如 Learn Blockchain 上的文章 [1]）也会分享 CursorRules 的使用技巧和最佳实践。**
    

多看看别人的实践，借鉴好的点子，然后结合自己的项目需求进行改造。也别忘了把你觉得写得不错的规则分享出来，互相学习，共同进步嘛！

**▐** **未来可期：CursorRules 的星辰大海**

CursorRules 作为连接人与 AI 的桥梁，其潜力远未完全发掘。我们可以畅想一下未来的可能性：

*   **更智能的规则逻辑 (Smarter Rule Logic): 也许未来规则能支持条件判断（if/else），或者能根据项目上下文动态调整优先级？**
    
*   **更丰富的规则类型 (Richer Rule Types): 除了** `Always` 和 `Auto Attached`，会不会有更细粒度的触发方式？比如基于函数签名、代码复杂度等？
    
*   **与工具链更深度集成 (Deeper Toolchain Integration): 规则能否直接调用 Linter 进行检查，或者根据测试框架的输出来调整行为？**
    

不管未来如何，CursorRules 已经在改变我们与 AI 协作的方式。它让我们从被动接受 AI 的建议，转向主动引导和塑造 AI 的行为，使 AI 真正成为我们可控、可靠、高效的编程伙伴。

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5CzczGLPQOcdou3FWaqibqVYrYC7MMVyloDaAnM7sQXicrTKANsWYXwog/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

结语：给你的 AI 装上 "导航"，出发！

好了，关于 CursorRules 的深度游就到这里了。希望这趟旅程让你对如何 "调教" 你的 AI 助手有了更深的理解和更多的骚操作思路。

精通 CursorRules 的核心价值是什么？

*   **效率起飞 (Efficiency Takes Off): 减少 AI 的 "废话" 和 "跑偏"，让它更快、更准地给到你想要的东西。**
    
*   **质量保障 (Quality Assurance): 确保 AI 生成的代码符合项目规范和团队标准，减少后续修改成本。**
    
*   **体验定制 (Customized Experience): 把 AI 调教成最懂你的那个 "它"，让编程体验更顺心。**
    

别犹豫了，现在就动手，打开你的项目，开始捣鼓你的 .cursor/rules/ 目录吧！从简单的规则开始，不断迭代，你会发现，那个曾经有点 "野" 的 AI 队友，也能变成配合默契的 "神队友"。记住，持续学习，关注社区，你的 AI 调教之旅，才刚刚开始！祝编码愉快！

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5ibBdQV0nVXicyxBznmwreAKcTzDlbYsiaB2vC1ygO11TMiaYgGbicqjOUDg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

参考资料

1.  最大化 Cursor 使用：高级提示、Cursor 规则与工具集成 - 登链社区 (learnblockchain.cn) - https://learnblockchain.cn/article/11065
    
2.  Good examples of .cursorrules file? - Discussion - Cursor - Community Forum -https://forum.cursor.com/t/good-examples-of-cursorrules-file/4346
    
3.  最大化 Cursor 使用：高级提示、Cursor 规则与工具集成 (PDF/Gist 部分) - 登链社区 (learnblockchain.cn) - https://learnblockchain.cn/article/11065
    
4.  Cursor Rules: Customizing AI Behavior for Personalized Coding - Cursor 101 -https://cursor101.com/article/cursor-rules-customizing-ai-behavior
    
5.  Cursor Rules: Customizing AI Behavior (全局 / 项目规则部分) - Cursor 101 - https://cursor101.com/article/cursor-rules-customizing-ai-behavior
    
6.  GitHub 搜索结果 (例如 kinopeee/cursorrules) - https://github.com/kinopeee/cursorrules (作为社区示例来源的代表)
    
7.  Cursor Rules: Customizing AI Behavior (社区资源部分) - Cursor 101 - https://cursor101.com/article/cursor-rules-customizing-ai-behavior
    
8.  Cursor Rules 最佳实践总结 - 53AI 知识库 - https://www.53ai.com/news/finetuning/2025032489061.html
    
9.  How to create a good cursor rule for our project? - Discussion - Cursor - Community Forum -https://forum.cursor.com/t/how-to-create-a-good-cursor-rule-for-our-project/18247
    
10.  devin.cursorrules GitHub 仓库 - https://github.com/grapeot/devin.cursorrules/blob/master/.cursorrules
    
11.  Definitive Rules - Discussion - Cursor - Community Forum -https://forum.cursor.com/t/definitive-rules/45282
    

![](https://mmbiz.qpic.cn/mmbiz_png/33P2FdAnju8X1wEorjS3bDLnHiar4vtV5Pyric8r6KkETewnhiaKGFw4fw2B1GgNiaSd7W99P1Qozs8GEe3jLibxKpg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

团队介绍

本文作者驿诚，来自淘天集团 - 营销 & 交易技术团队。本团队承担淘天电商全链路交易技术攻坚，致力于通过技术创新推动业务增长与用户体验升级。过去一年主导了多个高价值项目，包括：支撑 618、双 11、春晚等亿级流量洪峰、构建业界领先的全网价格力体系、承接淘宝全面接入微信支付、搭建集团最大的 AI 创新平台 - ideaLAB，支撑淘宝秒杀等创新业务的高速增长。

加入我们，你将在 “技术 + 业务” 双重战场开挂：

*   参与世界级分布式交易系统、实时计算引擎、高并发架构设计与优化
    
*   深入交易支付、营销等核心电商业务场景，用代码直接撬动万亿级 GMV
    
*   业界领先的数据驱动业务实践，用数据科学驱动业务精细化运营带来业务增量
    
*   深度探索 AI 技术在价格决策、用户体验、研发范式等场景的创新应用（如集团内最大 AI 创新平台 ideaLAB），玩转 AIGC / 大模型创新落地
    
*   深入关键业务场景，在电商大促、交易营销体系、终端体验、质量效能、数据科学等核心领域释放技术影响力
    

**¤** **拓展阅读** **¤**

  

[3DXR 技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565944923443904512#wechat_redirect) | [终端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1533906991218294785#wechat_redirect) | [音视频技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1592015847500414978#wechat_redirect)

[服务端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1539610690070642689#wechat_redirect) | [技术质量](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565883875634397185#wechat_redirect) | [数据算法](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1522425612282494977#wechat_redirect)