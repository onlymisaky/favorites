> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kDaDUhyo6r4MqtPA1xnI3Q)

👀 最新、最有用的 AI 编程姿势，总来自「知识药丸」

昨天刷到一篇关于 Claude Code 的爆款教程。

作者 @affaanmustafa 用了 10 个月 Claude Code，还拿了 Anthropic 黑客松的冠军。文章写得特别实在——全是干货，没有废话。

读完之后我花了一整天时间消化，配合官方文档把每个概念都啃了一遍。现在想把学到的东西整理出来，顺便帮自己理清思路。

这不是翻译，是学习笔记。

我会用自己的理解重新组织内容，补充一些背景知识，删掉我觉得不重要的细节。如果你想看原文，建议直接去看，写得比我好多了。

好了，开始正题。

[《贾杰的 AI 编程秘籍》](https://mp.weixin.qq.com/s?__biz=MzIwMTM5MTM1NA==&mid=2649474437&idx=1&sn=4ae1516afc0ec71b7638dd79daaae2cb&scene=21#wechat_redirect)付费合集，共 10 篇，现已完结。30 元交个朋友，学不到真东西找我退钱；）

以及我的墨问合集《100 个思维碎片》，1 块钱 100 篇，与你探讨一些有意思的话题（文末有订阅方式

### Claude Code 是什么?

你以为是个代码补全工具。

**大错特错**。

Claude Code 不是 Copilot，不是 Cursor 里的那个 AI 助手。它是一个**通用计算机自动化框架**，恰好很擅长写代码而已。

只要能用命令行做的事，它都能做:

*   • 操作文件系统
    
*   • 调用 API
    
*   • 管理数据库
    
*   • 控制浏览器
    
*   • 运行测试
    
*   • 执行部署
    

把它想象成《钢铁侠》里的贾维斯。你说一句话，它就去执行一系列操作，然后告诉你结果。

关键是: **这套系统完全可定制**。

你可以教它新技能、设定自动化规则、甚至创建专门的子代理来处理特定任务。这就是为什么 Claude Code 有那么多配置项——Skills、Hooks、Subagents、MCP......

我们一个个拆解。

### 最基础的配置: CLAUDE.md

如果只能配一个文件，就配这个。

#### 它的作用

`CLAUDE.md` 放在项目根目录，是 Claude 的 "记忆"。

每次对话开始，Claude 都会读它。里面写什么，它就 "知道" 什么。

简单吧? 但威力巨大。

#### 应该写什么?

**三类信息:**

1.  1. **语义层**: 项目用途、架构思路、核心概念
    
2.  2. **操作层**: 目录结构、构建命令、依赖关系  
    
3.  3. **规范层**: 代码风格、命名约定、团队习惯
    

举个例子:

```
# 项目概述这是一个 SaaS 产品的后台管理系统。# 技术栈React 18 + TypeScript + Tailwind CSS后端 API 在另一个仓库，这里只做前端# 代码规范- 组件文件用 PascalCase:UserProfile.tsx- 工具函数用 camelCase:formatDate.ts  - 禁止使用 var，只用 const/let- 每个组件必须写 PropTypes 注释# 构建命令npm run dev    # 开发服务器npm test       # 跑测试npm run build  # 生产构建
```

#### 个人项目 vs 团队项目

个人项目，我随便写，想到什么加什么。

团队项目，这个文件就是**项目宪法**。

原作者提到有团队把这文件维护到 25KB。不是浪费，是投资——写得越清楚，Claude 问的废话越少。

P.S. 子目录也可以有 `CLAUDE.md`，会追加到根配置，不会覆盖。

### MCP: 连接外部世界

MCP 是 Model Context Protocol 的缩写。

听起来很高大上? 其实就是**让 Claude 能调用外部工具的标准接口**。

#### 一个类比

你见过 USB-C 接口吧?

以前每个设备都要单独的数据线——手机一根，平板一根，笔记本又一根。现在统一成 USB-C，一根线搞定所有设备。

MCP 就是 "AI 版的 USB-C"。

以前每个数据源都要写单独的集成代码。现在只要实现 MCP 协议，Claude 就能用统一的方式访问: GitHub、Slack、数据库、Vercel、Railway......

#### 实际例子

假设你想让 Claude 访问 Supabase 数据库:

```
{  "supabase": {    "command": "npx"，    "args": [      "-y"，      "@supabase/mcp-server-supabase@latest"，      "--project-ref=YOUR_REF"    ]  }}
```

配好之后，Claude 就能直接查数据库，读表结构，不需要你手动导出粘贴。

爽。

#### 致命陷阱: 上下文爆炸

这里有个大坑。

每个 MCP 服务的**定义**会占用上下文窗口。你配了 20 个 MCP，即使只启用 5 个，那 15 个的定义也在吃你的 tokens。

**结果?**  
200k 的上下文窗口，可能只剩 70k 能用。

原作者给的经验法则:

*   • 配置 20-30 个 MCP
    
*   • 每次只启用 **5-6 个**
    
*   • 活跃工具总数控制在 **80 个以内**
    

用 `/plugins` 可以看当前启用了哪些，手动关掉暂时不需要的。

我的做法是在项目配置里用 `disabledMcpServers` 明确禁用，只开当前项目真正要用的。

**记住: MCP 很强大，但要克制。**

### Skills: 按需加载的知识库

这是我最喜欢的设计。

#### 核心思路

Skills 是一种**只在需要时才加载的文档**。

平时不占用你的上下文，当 Claude 判断需要时才会读取。就像《黑客帝国》里给尼奥灌输功夫——"我需要学直升机驾驶"，刷一下，会了。

#### 目录结构

```
~/.claude/skills/  pdf-handler/    SKILL.md  security-review/    SKILL.md  tdd-workflow/    SKILL.md
```

#### 一个例子

假设你想教 Claude 如何处理 PDF:

```
# PDF 处理## 何时使用用户要读取、提取或修改 PDF 时## 工具选择Python:用 PyPDF2Node.js:用 pdf-parse## 示例代码\`\`\`pythonimport PyPDF2def extract_pdf_text(path):    with open(path， 'rb') as f:        reader = PyPDF2.PdfReader(f)        return "".join(p.extract_text() for p in reader.pages)\`\`\`## 注意事项- 检查是否加密- 大文件要分页处理
```

当 Claude 遇到 PDF 任务，它会自动加载这个 Skill，按你的指示操作。

**Skills vs MCP:**  
MCP 是外部工具连接，Skills 是内部知识文档。能用 Skills 解决的，就别装 MCP。

### Slash Commands: 保存下来的 Prompt

Commands 就是快捷键。

输入 `/` 就能看到所有可用命令。

```
~/.claude/commands/  refactor-clean.md   # 清理死代码  tdd.md              # 启动 TDD 流程  test-coverage.md    # 检查测试覆盖率
```

#### 链式调用

Commands 可以串联:

```
/test-coverage /refactor-clean
```

先检查覆盖率，再清理代码。

原作者有个命令叫 `/hookify`，用对话的方式创建 Hook 配置，不用手写 JSON。这思路我偷学了。

### Subagents: 独立上下文的专业代理

Subagent 是运行在**独立上下文**中的子代理。

#### 为什么需要?

想象一个场景:

你让 Claude 做个复杂任务。它要搜文档、试错、调试...... 这些过程都会占用主对话的上下文窗口。

等它搞完，你的上下文已经被 "探索性垃圾" 塞满了。

Subagent 的价值: **把脏活累活扔给它，只要结果**。

#### 上下文节省有多夸张?

假设一个任务需要:

*   • X tokens 的输入
    
*   • Y tokens 的工作过程  
    
*   • Z tokens 的最终结果
    

在主对话做 N 个任务 = `(X + Y + Z) × N` tokens

用 Subagent 做 = 主对话只保留 `Z × N` tokens

**差距是指数级的。**

#### 配置示例

```
---name: security-reviewerdescription: 安全审查专家，只读不写tools: Read， Grep， BashdisallowedTools: Write， Edit---你是安全专家，负责审查代码漏洞。重点检查:- SQL 注入- XSS 漏洞- 硬编码密钥- 危险依赖你只能读和分析，不能修改代码。
```

#### 两种用法

1.  1. **自动触发**:Claude 自己判断要不要用  
    
2.  2. **手动指定**:"用 security-reviewer 检查这段代码"
    

#### 一个争议

原文提到有人 (Shrivu Shankar) 认为自定义 Subagents 太脆弱，更推荐用 Claude 内置的 `Task(...)` 让主 Agent 自己决定如何委派。

我的看法: **看场景**。

明确、重复的专项任务 (测试、审查)，用自定义 Subagent。灵活、探索性的任务，让主 Agent 自己 fork。

### Hooks: 确定性自动化

Hooks 是在特定事件触发的自动脚本。

这是**对抗概率性的武器**。

#### 为什么需要?

Claude 是概率模型。

你不能指望它每次都 "记得" 做某件事。比如编辑 TypeScript 文件后自动格式化——靠 Claude 记住? 不靠谱。

用 Hook，一次配置，永久生效。

#### Hook 类型

<table><thead><tr><th><section>类型</section></th><th><section>触发时机</section></th><th><section>能否阻断</section></th></tr></thead><tbody><tr><td><strong>PreToolUse</strong></td><td><section>工具执行前</section></td><td><section>✅</section></td></tr><tr><td><strong>PostToolUse</strong></td><td><section>工具执行后</section></td><td><section>❌</section></td></tr><tr><td><strong>Stop</strong></td><td><section>响应完成时</section></td><td><section>❌</section></td></tr><tr><td><strong>Notification</strong></td><td><section>权限请求时</section></td><td><section>✅</section></td></tr></tbody></table>

能阻断的 Hook 通过 `exit 2` 来拦截操作。

#### 实战: 禁止危险命令

```
{  "PreToolUse": [{    "matcher": "Bash && rm -rf"，    "hooks": [{      "type": "command"，      "command": "echo '🚨 危险操作已拦截' >&2; exit 2"    }]  }]}
```

任何 `rm -rf` 都会被拦下。

#### 实战: 自动格式化

```
{  "PostToolUse": [{    "matcher": "Edit && \\.tsx?$"，    "hooks": [{      "type": "command"，      "command": "prettier --write $FILE_PATH"    }]  }]}
```

编辑 TypeScript 文件后自动格式化。

#### 实战: tmux 提醒

```
{  "PreToolUse": [{    "matcher": "Bash && (npm|cargo|pytest)"，    "hooks": [{      "type": "command"，      "command": "[ -z \"$TMUX\" ] && echo '[提醒] 建议在 tmux 中运行' >&2"    }]  }]}
```

长时间任务如果不在 tmux 会话，就提醒你。

太贴心了。

### Plugins: 打包分发

Plugin 是把 Skills、Commands、Subagents、Hooks、MCP 打包成一个可分发单元。

#### 为什么需要?

如果你想分享配置给团队:

传统方式——"把这个文件放这里，那个文件放那里......"  
Plugin 方式——一行命令搞定

```
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep
```

然后在 Claude 里 `/plugins`，找到市场，点击安装。

#### 我常用的几个

*   • **hookify**: 对话式创建 Hooks
    
*   • **mgrep**: 支持网页搜索的强化版 grep
    
*   • **typescript-lsp**:TypeScript 语言服务器
    
*   • **code-review**:PR 自动审查
    

记住原则: **装很多，用很少**。

我装了 14 个插件，但每次只启用 5-6 个。

### 实用技巧

这部分是原文的 "隐藏彩蛋"。

#### 键盘快捷键

*   • `Ctrl+U`: 删整行 (别再狂按退格了)
    
*   • `!`: 快速执行 bash 命令
    
*   • `@`: 搜索文件
    
*   • `/`: 触发斜杠命令
    
*   • `Tab`: 切换 "思考过程" 显示
    
*   • `Esc Esc`: 打断 Claude
    

#### Fork 对话

`/fork` 可以把对话分叉，处理不重叠的并行任务。

改 Bug 时突然想写新功能? 别混着做，fork 一个新分支。

#### Git Worktrees

并行任务会修改同一个文件? 用 Git Worktrees:

```
git worktree add ../feature-branch feature-branch
```

两个 Claude 实例同时工作，互不干扰。

#### tmux 监控

Claude 跑长任务时，用 tmux 查看日志:

```
tmux new -s dev# Claude 在这里跑命令# 你可以 detach 去干别的tmux attach -t dev  # 随时回来看
```

#### mgrep 支持网页搜索

这个太强了:

```
mgrep "React 19 新特性"  # 本地搜索mgrep --web "Next.js 15 变化"  # 网页搜索
```

相当于给 Claude 加了 "联网搜索代码" 能力。

### 编辑器选择

Claude Code 是命令行工具，但配合编辑器体验更好。

#### 原作者用 Zed

理由:

*   • **Agent Panel**: 实时显示 Claude 在改哪些文件
    
*   • **快**:Rust 编写，秒开
    
*   • **CMD+Shift+R**: 命令面板，快速调用自定义命令
    
*   • **资源占用低**: 不会和 Claude 抢 CPU
    

#### 工作流

```
左半屏:Terminal 跑 Claude Code右半屏:Zed 编辑器开启 Auto-save用 Ctrl+G 跳转到 Claude 正在编辑的文件
```

VSCode 和 Cursor 也都支持，选你顺手的就行。

### 上下文窗口管理

这是**最容易踩的坑**。

原文反复强调这一点，我深有体会。

#### 问题

Claude 的上下文窗口是有限的 (200k tokens)。

但这个数字会被 "隐形消耗":

*   • MCP 工具定义: 几百到几千 tokens
    
*   • Skills 内容: 几千 tokens  
    
*   • 历史对话: 几万 tokens
    

不注意的话，**实际可用的可能只剩 70k**。

#### 黄金法则

1.  1. 只启用当前需要的 MCP
    
2.  2. 工具总数控制在 80 个以下
    
3.  3. 长对话定期 `/compact`
    
4.  4. 用 Subagents 隔离探索性工作
    
5.  5. 监控 statusline 的上下文百分比
    

配置 statusline 显示上下文使用率:

```
user@dir | branch* | ctx: 45% | sonnet-4 | 14:32
```

看到 ctx 接近 80% 就要警惕了。

### 原作者的完整配置

他的配置结构:

```
~/.claude/  rules/          # 规范文档    security.md    coding-style.md    testing.md  skills/         # 技能库    pdf-handler/    tdd-workflow/  commands/       # 快捷命令    refactor-clean.md    hookify.md  agents/         # 子代理    security-reviewer.md    test-writer.md  hooks.json      # 自动化规则
```

#### 核心 Hooks

```
{  "PreToolUse": [    // 拦截危险命令    {"matcher": "Bash && rm -rf"， "hooks": [...]}，    // tmux 提醒    {"matcher": "Bash && (npm|cargo)"， "hooks": [...]}  ]，  "PostToolUse": [    // 自动格式化    {"matcher": "Edit && \\.tsx?$"， "hooks": [...]}，    // TypeScript 检查    {"matcher": "Edit && \\.ts"， "hooks": [...]}  ]，  "Stop": [    // 检查 console.log    {"matcher": "*"， "hooks": [...]}  ]}
```

#### MCP 配置

配了 14 个 MCP，但每个项目只启用 5-6 个:

```
{  "github": {...}，  "supabase": {...}，  "memory": {...}，  "vercel": {...}，  "railway": {...}  // 其他的通过 disabledMcpServers 禁用}
```

### 我的理解

读完这篇文章，我最大的收获是:**Claude Code 是一个生态系统，不是一个工具**。

核心思路:

1.  1. **CLAUDE.md 建立项目记忆**
    
2.  2. **MCP 连接外部世界** (但要克制)
    
3.  3. **Skills 教会专业知识** (按需加载)
    
4.  4. **Commands 固化高频操作**
    
5.  5. **Subagents 隔离专项任务** (保护主上下文)
    
6.  6. **Hooks 自动化确定性流程** (对抗概率性)
    
7.  7. **Plugins 分享和复用配置**
    

最重要的: **上下文窗口是最宝贵的资源**。

配置时要像管理内存一样管理它——只加载必要的，定期清理，合理委派。

好了，笔记整理完了。

接下来就是实践了。

### 参考资料

*   • 原文链接 - @affaanmustafa 的完整教程
    
*   • Claude Code 官方文档
    
*   • Model Context Protocol
    
*   • awesome-claude-code - 社区资源
    

 坚持创作不易，求个一键三连，谢谢你～❤️

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/hM5HtkzgLYavuT0httVEXU5P2UurAYUsicKSLSSKPZmiaqVaYWiaYlErmU6Pibs5uOHYxDkvuu8m2PNkuYEGIWrYiaw/640?wx_fmt=jpeg&from=appmsg&watermark=1#imgIndex=0)

以及「AI Coding 技术交流群」，联系 ayqywx 我拉你进群，共同交流学习～