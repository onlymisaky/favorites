> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/z_c6-hlEdTgfGyY-oyZhIw)

![](https://mmbiz.qpic.cn/mmbiz_gif/oQ0houcyEiciacib9yWgG46XdrGWdISqhoA7TJAmYhXwibwyn1jxg4sa9kpvRxvJM4iaBHC2Z1eamT72IFbQKW4ibICg/640?wx_fmt=gif&from=appmsg#imgIndex=0)

本文作者

Amber，TRAE 产品运营

李健，TRAE 开发者用户

想全面了解 Skills 功能，也欢迎阅读上一篇文章：[一文读懂 Skills｜从概念到实操的完整指南](https://mp.weixin.qq.com/s?__biz=MzkxMTY4NTAyNQ==&mid=2247504906&idx=1&sn=3ded275d061cec5592bad151a30b6206&scene=21#wechat_redirect)

上一篇文章我们已经系统梳理了 Skills 的原理和操作。发布后我们收到了许多 TRAE 友的反馈，希望能有一份更适合新手快速上手的入门手册，我们继续来讲一讲。

本文从更贴近日常使用的视角出发，帮助你继续理解什么是 Skills，厘清在众多功能中何时应选择 Skills、哪些典型场景尤其适合使用 Skills，以及一份结构规范、易复用的 Skills 应当如何编写。最后，我们还会通过一个简洁明了的示例，直观展示 Skills 的实际输出效果，帮助初学者也能快速理解并应用。快来看看吧！

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAAW4yfwO7BzhWqMiaGDEypvMJB6hLLN8bxNbyjvicdiaTibax5knBJxWsxQ/640?wx_fmt=png&from=appmsg#imgIndex=1)

**Skills 是什么**

大家最常看到的是「一句话解释 Skills 」，但今天我们换个角度，从 AI 的两个核心概念——Agent 和 MCP——说起，来聊聊为什么 Skills 的出现是必不可少的。

**为什么需要 Agent ？**

要理解 Agent（智能体），我们可以先和传统的软件开发模式做个对比。

在传统的项目开发中，比如我们要搭建一个电商平台，通常需要明确划分出用户模块、商品模块、订单模块等固定单元。这些模块的交互流程是预先设计好的，非常严格。如果我们想在开发完成后增加一个 “购物车” 功能，就必须中断并修改原有的代码流程，将购物车模块嵌入到订单模块之前。这种对业务逻辑的调整，往往意味着对代码的大规模重构。

那么，如果让 Agent 来搭建一个电商平台，它会怎么做呢？Agent 不会纠结于平台应该由哪些具体模块组成，它只关心一件事：当用户输入 “我要买一个商品” 的指令后，能否最终实现 “成功付款买到商品” 这个目标。至于中间的过程是用了 Java 还是 Python，商品信息是存在数据库里还是 Excel 表格里，订单是用系统处理还是用飞书多维表格来管理——这些实现细节，Agent 并不在乎。

所以，为什么需要 Agent？**因为在今天这个业务需求越来越多样化、动态化的时代，我们更关心目标是否达成，而不是实现目标的具体方式和技术细节。** Agent 正是为这种面向目标的任务而生。

**为什么需要 MCP ？**

回到我们传统的电商平台开发。在开发过程中，我们常常需要集成一些第三方服务，比如手机短信验证、人脸识别、微信支付或者物流信息查询。这些功能并非由我们的电商平台独立完成，而是通过调用第三方服务的 API 来实现的。通常，这些 API 都有明确的授权和调用规则。

那么，Agent 是否也能调用这些 API 呢？当然可以。但如果 Agent 的工作方式并非完全基于代码，又要如何实现人脸识别这类复杂功能呢？这时，MCP 就应运而生了。**你可以把 MCP（Model Context Protocol）理解为一种专门为 AI 设计的 “API”，它让 AI 能够像传统软件一样，调用和使用各种外部服务的能力。**

**为什么需要 Skills？**

在理解了 Agent 和 MCP 之后，我们再来看一下 Skills。

对 AI 来说，除了可以通过 MCP 来使用别人的能力之外，我们还可以把一些重复性的工作打包出来，变成大家都能用的工具包，这样就大大的减少了我们编码的复杂性，功能不再全部丢给我们自己从头到尾写一遍了，那这个工具包就是 Skills。

举个例子，假设我们需要在应用里做一个文件上传功能。我们当然可以自己从头开始写代码，但如果自己不擅长界面设计，做出来的上传组件可能会很难看，需要花费大量时间去调整样式。但如果这时候，有另一位擅长前后端开发的工程师，已经做了一个功能完善、界面美观的文件上传组件，并把它作为 Skill 分享了出来，我们是不是就可以直接拿来用，而不用在我们不擅长的领域里反复挣扎了呢？

这正是 Skill 的核心价值所在。

**理解三个功能的定位**

*   **Agent：**是面向目标的**执行者**。你给它一个目标（比如 “我要买商品”），它就会自主规划流程、选择工具去完成，不再受限于传统的模块化开发思维。
    
*   **MCP：**是 AI 用来调用外部能力的**通讯器**。它就像传统项目中的第三方 API，让 Agent 能够接入并使用支付、识别等外部服务。
    
*   **Skills：**是可供重复使用的**能力包**。无论是 “发送邮件” 还是“文件上传”，这些成熟的功能都可以被封装成 Skill，让 Agent 和 MCP 能像使用工具一样直接调用，避免重复造轮子。
    

简单来说，Skills **通过固定的规则和标准化的能力，来保证输出结果的稳定和一致。**

再举个例子：

假设你要搭建一个网站，需要一个完整的用户系统。你可以直接使用现成的 “用户鉴权 Skill” 来快速接入登录验证功能，再用 “手机验证码注册 Skill” 来搞定注册流程。

这就是 Skills 带来的便利。想象一下，未来社区里有成千上万个公开分享的 Skills，我们可以即取即用，开发工作将变得前所未有的便捷和高效。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAPUceug3YCIos0RKZ4x6pW74NvaPjMIfjbTT0H0HKViayXu0NQ4xX3eQ/640?wx_fmt=png&from=appmsg#imgIndex=2)

**什么时候该用 Skills**

任何新功能都不是万金油，我们应该在合适的场景使用它。当你需要一个**可以被重复使用、并按需自动调用**的能力时，Skills 就是你的最佳选择。

在创建 Skills 之前，不妨先问自己两个问题：**这件事未来会重复做吗？用一套标准化的指令来完成，效果会不会更好？**

**适合用 Skills 的场景**

*   **高频重复的操作：**同一个指令你已经手动输入过很多次。
    
*   **要求输出一致：**需要跨越多次对话，始终保持相同的输出风格、格式或标准。
    
*   **固定的工作流程：**有一套明确的多步骤工作流程需要严格执行。
    
*   **沉淀专业知识：**想把团队的最佳实践，如**代码规范、品牌指南、测试流程、数据分析方法**等，固化下来，让 AI 也能掌握。
    

**场景举例**

**场景一：稳定输出高质量结果**

如果你需要智能体每次都按你的标准输出，例如统一设计规范、执行团队标准、保持品牌一致性、确保代码符合约定等场景其实都很适合。

与其指望智能体 “记住” 你的偏好，不如把要求打包成 Skills，变成一个专业技能包，让输出结果稳定可控。

[视频详情](javascript:;)

示例：用 ux-designer Skills 生成线框图：

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAuicPEHj0m8e5NWcXhTRS7xTlgcDlDrbbXDydV7L5ZdR2mbaxF6rOQWQ/640?wx_fmt=png&from=appmsg#imgIndex=5)

**场景三：沉淀与共享 Skills**

Skill 不仅仅是提升个人效率的工具，更是将专业能力规模化、与团队共享的绝佳方式。

*   **流程共享：**把成熟的工作流程封装成 Skill，团队成员无需再反复沟通流程细节，直接调用即可。
    
*   **规范统一：**将团队的设计规范、代码规范或品牌指南制作成 Skill，确保整个团队的输出风格一致。
    
*   **社区生态：**你可以在社区中发现、构建并共享你的 Skill，让优秀的能力跨越不同的使用者和场景，不断复用和传承。
    

**Skills 和其他功能怎么选？**

在 TRAE 中，有多种方式可以引导 AI 更好地理解你的意图。那么，在 Skill 和其他功能之间，我们应该如何选择呢？

**Prompt vs Skills**

Prompt（提示词）是一次性的指令。如果你发现自己为了同一个目的，反复输入了三遍以上的 Prompt，那就应该考虑将它沉淀为一个 Skill 了。

**Rules vs Skills**

Rules（规则）是全局生效的，一旦设置，它会在整个对话过程中持续占用 AI 的 “注意力”（上下文窗口）。

如果你的 Rules 文件变得越来越臃肿，不妨把其中与具体工作流程相关的指令迁移到 Skill 中。Rules 里只保留一些轻量级的、全局性的偏好设置，比如你喜欢的代码风格、沟通语言等。

**Context vs Skills**

Context（上下文）通常指的是在 Workspace（工作空间）内共享的知识库或文档。AI 在对话开始时就会读取这些内容，并同样会占用上下文窗口。

相比之下，Skill 是结构化的、可执行的指令，只在被需要时**主动触发**。因此，Skill 更适合用来封装可复用的工作流程和行为指令，而 Context 更适合提供背景信息和知识参考。

**SOLO Sub Agent vs Skills**

Sub Agent（子智能体）可以看作是一个专注于特定领域的 “专职员工”，而 Skills 则是一个可随处迁移的 “能力包”，能够被不同的智能体、在不同的场景下复用。

如果你发现多个不同的 Sub Agent 都需要某一项同样的能力，那么最好的做法就是将这项能力抽象成一个 Skill，供所有智能体按需调用。

**总结一下：**

*   **Rules、Context 和 Sub Agent** 的指令通常会**持续占用**宝贵的上下文窗口。
    
*   **Skills** 则是**按需加载**，不仅节省了资源（Token），也让 AI 的每一次行动都更加专注和高效。
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoARxkY4N7TqXo4zs2EicCQNqowNiauUB9mge4erILo3VaFh6icSQTPgibwlQ/640?wx_fmt=png&from=appmsg#imgIndex=6)

**Skills 的编写结构**

一个 Skill 到底长什么样？

从本质上讲，一个 Skill 就是一个包含了 _**SKILL.md**_ 文件的文件夹。这个 **_SKILL.md_** 文件是用 Markdown 格式编写的，它就像一份 “使用说明书”，告诉 AI 这个 Skill 是用来做什么的、应该如何使用。

由于 Skill 采用标准的 **Markdown** 格式，因此无论是创建、阅读还是分享，都非常方便。

标准文件结构（**唯一必需****的是** **_Skill.md_** **文件****，****其他都是****可选****的****，根据你的 Skill 需要来决定。)**

```
your-Skill/
├── Skill.md          # 必需：智能体的核心指令
├── examples/         # 可选：输入/输出示例
│   ├── input.md
│   └── output.md
├── templates/        # 可选：可复用的模板
│   └── component.tsx
└── resources/        # 可选：参考文件、运行脚本或素材
    └── style-guide.md
```

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoArkJn9libSIw2HGk9mwNXpsngXp5mP6MoQ3tSnXfN8rJaibZhU7gRLajQ/640?wx_fmt=png&from=appmsg#imgIndex=7)

**在 TRAE 中使用 Skills**

**使用 Skills 的黄金法则是****「先跑起来，再慢慢优化」****。你的第一个版本不需要追求完美。**

*   **第 1 步：** 先创建一个只包含核心功能的基础版本。
    
*   **第 2 步：**用一个真实的任务来测试它。
    
*   **第 3 步：** 观察输出结果，看看哪里不尽如人意。
    
*   **第 4 步：** 针对发现的问题，优化和补充你的指令。
    
*   **第 5 步：** 重复以上步骤，不断迭代。
    

**请记住：一个好用的 Skill，一定是在实际使用中反复打磨出来的。先让它能用，再追求好用。**

你可以选择导入他人的 Skill 或者自己创建一个 Skill，当然你导入了他人的 Skill 也可以根据自己的实际需求进行修改。

**导入社区 Agent Skills**

TRAE 的 Skills 功能基于开放的 Agent Skills 标准构建，这意味着它完全兼容社区生态。你可以从 GitHub 等代码托管平台上找到海量的现成 Skill，直接下载并导入使用。

**导入步骤：**

1.  从社区找到你需要的 Skill（比如 Example Agent Skills：https://github.com/anthropics/skills）
    
2.  下载包含 **_Skill.md_** 的文件夹
    
3.  在 TRAE 中导入：设置 → 规则和技能 → 技能 → 创建
    

你可以直接使用已有的 Skills，也可以根据自己的需求修改。

**创建你自己的 Skills**

一个 Skill 由以下几部分组成：

*   **名称：**为你的 Skill 起一个清晰易懂的名字。
    
*   **描述：**简单说明这个 Skill 是做什么的，以及在什么情况下应该使用它。
    
*   **指令（可选）：**如果任务比较复杂，可以在这里提供详细的、分步骤的指令。
    

就这么简单。对于一些简单的任务，一个 Skill 甚至只需要名称和描述就足够了。**只有当你的工作流需要特定的步骤或输出格式时，才需要逐步添加更详细的指令。**

**方式一：在对话中创建 Skills**

最简单的方式是直接和 TRAE 对话。描述你的需求，AI 会帮你生成 Skill。

比如：

*   "创建一个 Skill，帮我检查代码的性能问题"
    
*   "做一个生成 CSS 组件的 Skill，要符合我们的品牌规范"
    
*   "建一个 Skill，用来规范我的数据分析报告"
    

[视频详情](javascript:;)

**方式二：手动创建 Skills**

如果你想要添加更详细的工作流、指令及工具调用，可以用 Markdown 格式手动编写 Skill。

**基础** **_Skill.md_** **模板：**

```
---
name: Skill 名称
description: 简要描述这个 Skill 的功能和使用场景

---

# Skill 名称

## Description
一句话说明这个 Skill 干什么。

## When to Use
触发这个 Skill 的条件。

## Instructions
清晰的分步说明，告诉 TRAE 智能体具体怎么做。

## Examples (Optional)
输入/输出示例，展示预期效果。
```

**如何调用你的 Skills**

一共有两种方式调用：

**方式一：显性调用**

显性调用，就是直接在你的指令中明确告诉 AI 使用哪一个 Skill。这种方式可以让你精准地控制 AI 的行为，确保输出结果的稳定性。

**示例：**

*   “用 **_codemap_** Skill 总结一下这个代码分支做了哪些修改。”
    
*   “请使用 **_Frontend Design_** Skill 来构建这个 UI 组件。”
    
*   “用 **_CSV_** Skill 帮我处理一下这个数据集。”
    

当你明确知道应该使用哪个 Skill，并且希望得到稳定、可预期的结果时，推荐使用显性调用。

**方式二：隐性调用**

隐性调用，则完全依赖 AI 的自主判断。AI 会根据你当前的任务描述，以及每个 Skill 中 “何时使用（When to Use）” 的描述，来自动决定是否以及调用哪个 Skill。

例如，假设你创建了一个名为 **_Code Review_** 的 Skill，并在其中定义了触发条件是 “当用户请求代码反馈时”。那么，当你向 AI 提出以下问题时：

*   “你觉得这个函数写得怎么样？”
    
*   “帮我 review 一下这个合并请求（PR）。”
    
*   “这段代码有什么潜在的问题吗？”
    

AI 会自动识别出你的意图，并调用 **_Code Review_** Skill 来回答你的问题，整个过程无需你手动指定。

**如何选择「显性」还是「隐性」**

*   **当任务复杂、关键或需要高度稳定的输出时，建议采用显性调用。**
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAibvx5T2dtSibOYVOSOI49LJewSfDQmHdZxA9TrBOKdLja2o3nDdpuPibQ/640?wx_fmt=png&from=appmsg#imgIndex=8)

**一起来实操**

我们以创建一个 “多彩输出” 的 Skill 为例。

该技能主要是为了能够让 AI 在回复的时候，根据内容情况，修改内容的颜色，便于我们直接就看到关键点等，功能比较简单，先让大家感受一下 Skill 的魅力。

操作版本：TRAE 中国版

**1. 在 TRAE 中打开 Skills 创建面板**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAIgmKAsY2Is53IiaHVHS7MIgmo3WyHlcjYseCwpfb9R0icGiaJKQ5AgboA/640?wx_fmt=png&from=appmsg#imgIndex=9)

**2. 创建我所需要的 Skills**

*   **技能名称：**就是你的技能叫什么名字，将来调用的技能你就能看到这个技能被调用了。
    
*   **描述：**就是你的这个技能的一些说明，做什么的，有什么用等等。
    
*   **指令：**这个是最重要的地方，就是技能怎么实现的地方。
    

如果你不太清楚指令该如何写，这里有一个小技巧：你可以先把写好了技能名称和描述的界面截图，然后将图片发给一个能够识别图片的多模态模型（如 Doubao-Seed-Coder），并对它说**「你好，我想制作一个 Skill，名称和描述如图片所示，但我不擅长写指令，你来帮我写一下吧」。**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAz6JU38qJ3Ve2eEjSCP178wE8a01Lzn8EvhSkO1TlKKmA3A0g6A4X2w/640?wx_fmt=png&from=appmsg#imgIndex=10)

**3. 查看创建的 Skills**

创建完成后，我们回到文件目录。你会发现在根目录下的 **_.trae_** 文件夹里，系统自动创建了一个 **_skills_** 目录，并在其中生成了一个名为 “多彩输出” 的子目录。这个子目录里包含一个 **_SKILL.md_** 文件。**这个文件的内容，正是由我们刚刚填写的技能名称、描述和指令生成的。**

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAZ0Np8bzE8lLXZOWktO5j7AibbsXwukjv3P1qYpoqba3eRtgeaAuNpBg/640?wx_fmt=png&from=appmsg#imgIndex=11)

下面是本次创建的 SKILL.md 文件内容，可以看到里面包括：

*   **_name_** 字段，就是我们填的技能名称。
    
*   **_description_** 字段，就是我们填的描述。
    
*   而其他的部分就是我们填写的指令（**_Command_**）。
    

**上下滑动查看完整内容**

```
---
name: 多彩输出
description: 用多种颜色来包装AI回复的内容，通过颜色来区分内容的重要度，一眼就知道回复的关键点在哪里。
---
# 多彩输出
多彩输出技能可以将AI回复的内容用不同颜色进行包装，通过颜色来区分内容的重要度，帮助您快速识别回复中的关键点。
## 触发方式
该技能支持自然语言触发，您可以使用以下方式触发多彩输出功能：
- 请用多彩颜色回复
- 多彩输出
- 用颜色回复
- 多彩颜色
- 彩色输出
当您使用以上自然语言表达时，AI会自动以多彩颜色的方式回复您的内容。
## 使用场景
1. **阅读长回复时**：通过颜色区分重要信息，快速抓住回复的核心内容
2. **学习新知识时**：用不同颜色标记不同类型的信息，提高学习效率
3. **工作汇报时**：突出关键数据和结论，使汇报更专业、更易理解
4. **日常交流时**：增加回复的视觉吸引力，提升沟通体验
## 输出解释
技能会根据内容的类型和重要度，自动为不同部分添加颜色：
- <span style="color: #FF5733;">红色</span> - 用于强调重要信息和警告
- <span style="color: #33FF57;">绿色</span> - 用于显示成功或正面信息
- <span style="color: #3357FF;">蓝色</span> - 用于显示一般提示或链接
- <span style="color: #FF33A8;">粉色</span> - 用于显示特殊说明
- <span style="color: #FFC300;">黄色</span> - 用于显示注意事项
## 示例
### 示例1：触发多彩输出
**触发方式**：输入`请用多彩颜色回复`
**AI回复**：
在<span style="color: #3357FF;">Python</span>中，可以使用<span style="color: #FF5733;">requests</span>库来发送<span style="color: #33FF57;">HTTP请求</span>。首先需要<span style="color: #FFC300;">安装requests库</span>，然后<span style="color: #3357FF;">导入并使用get方法</span>。
### 示例2：带问题的多彩输出
**触发方式**：输入`请用多彩颜色回复 Python的requests库如何使用？`
**AI回复**：
要使用<span style="color: #3357FF;">Python</span>的<span style="color: #FF5733;">requests</span>库，首先需要<span style="color: #FFC300;">安装</span>它：<span style="color: #33FF57;">pip install requests</span>。然后可以<span style="color: #FFC300;">导入</span>并使用它发送各种<span style="color: #3357FF;">HTTP请求</span>。
## 实现方式

该技能直接通过AI的回复模板实现多彩输出，无需执行外部Python脚本。当您使用自然语言触发短语后，AI会自动在回复内容中添加HTML颜色标签，使不同类型的信息显示不同的颜色。
```

到这里为止，一个技能就创建好了，这个技能比较简单，所以一个 SKILL.md 就能解决问题。

如果你的 Skill 功能比较复杂，光靠一个 **_SKILL.md_** 文件无法实现时，我们同样可以求助 AI。

例如，假设我们需要创建一个 “语音播报” 的 Skill。我们可以告诉 AI：“我希望这个 Skill 能够直接播报 AI 回复的内容”。AI 会自动检查我们创建的“语音播报” Skill，如果发现它只是一个空架子，就会开始帮助我们补充实现功能的代码和指令。接下来，我们只需要在 AI 的协助下不断调试，直到功能完善。

**4. 使用创建的 Skills**

现在，让我们新建一个对话，来试试刚刚创建的 Skill 的效果吧。可以看到，AI 的输出完全遵循了我们在 Skill 中定义的规则。

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAcNzJ451R8aQPk8wf9B7A2AyQCAxh9KmIxeCN5YlxstBEMuiaYo3Gy3A/640?wx_fmt=png&from=appmsg#imgIndex=12)

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoANZrFM3QwVNZCJf3KvicjPNqoTZZ5YJNwBlzn18w18XqObezMqhMKByg/640?wx_fmt=png&from=appmsg#imgIndex=13)

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAZhsb3pInkpO2eyEibKK0s5kmmIEPuzJQmlGf0d9korqldt7a6gsNnYA/640?wx_fmt=png&from=appmsg#imgIndex=14)

**总结**

希望这个简单的例子，能让你直观地感受到 Skills 的魅力。

我们依旧在针对 Skills 功能进行迭代更新，新版本功能正在灰度中，敬请期待～

一些社区资料：

*   官方博客解释 Skill 概念：
    
    https://claude.com/blog/skills-explained
    
*   Claude 官方实践指南：
    
    https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices
    
*   Claude 官方 Skills 仓库 https://github.com/anthropics/skills
    

![](https://mmbiz.qpic.cn/mmbiz_png/oQ0houcyEiciacib9yWgG46XdrGWdISqhoAx5gIYhBqMFV8nxDYocleOzbJ6T8ny29uXgKtyPtibbj9vQrJUE9a4Ow/640?wx_fmt=png&from=appmsg#imgIndex=15)