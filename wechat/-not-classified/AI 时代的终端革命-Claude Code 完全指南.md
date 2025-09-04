> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/23-HkZOylhVA7DzkYKYL5w)

> 本文作者系 360 奇舞团前端开发工程师

简介
--

Claude Code 是 Anthropic 推出的命令行界面（CLI）工具，专为开发者设计，让 Claude AI 融入日常开发工作流。它不是聊天窗口，也不是新的 IDE，而是运行在你熟悉的终端环境中，能理解项目结构、执行操作并提出建议。

无论是新手还是资深开发者，Claude Code 都值得尝试。它的主要优势在于：

1.  **原生终端集成**  
    直接在终端中使用，无需额外插件或界面，能完成代码生成、调试、执行命令等操作。
    
2.  **自定义斜杠命令**  
    把常用任务封装成一键命令，自动化重复流程，大幅节省时间。
    
3.  **Sub-Agents 多角色协作**  
    支持多个具备不同职责和权限的子代理，由主 Agent 统一协调，适合复杂任务。
    
4.  **强大的项目控制与个性化配置**  
    命令白名单限制执行范围；Proxy 支持私有代理；Hooks 插件机制；MCP 扩展。
    
5.  **SDK 与系统集成**  
    除了交互式命令，还提供 SDK，方便非交互式调用和深度定制。
    

Claude Code 的定位是成为开发者的智能伙伴，既能深入代码执行环境，又能灵活扩展与集成。

国内使用
----

参照以下步骤即可快速开始使用 Claude Code：

1.  确保安装了 Node.js 18 或更高版本。若没有，请参考 Node 官网完成安装。
    
2.  使用 npm 全局安装 claude 终端命令。
    
    ```
    npm install -g @anthropic-ai/claude-code
    ```
    
3.  新建终端，输入 claude 即可开启使用。
    

由于我没有登录也没付费它会提示输入`/login`登录：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKJetfM8Kb0hVvHvw25EGCribcDtyb0S43wyC1L7WKNUXiccIYnjSNR8Sg/640?wx_fmt=png&from=appmsg#imgIndex=0)

输入后会让你根据选择去订阅或充值。![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKebOjMa11PDjYS3nx3YSct1d6IgiaZ95DlG4bPU7DIxMWhlTqw5OfXEg/640?wx_fmt=png&from=appmsg#imgIndex=1)

由于 Claude 的限制，国内注册其账号及充值都比较困难。虽然有许多人通过代理使用 Claude code 或借助代理商去购买或充值的，但其中风险只能自己控制与评估，且存在被封禁或限制使用的可能，比如 anyrouter。

那么国内如何使用呢？推荐两种方法：

### 1. 使用 Kimi

月之暗面 Moonshot AI 提供了对 Claude Code 内部 API 输入输出的兼容。因此可以在 Moonshot AI 开放平台申请`key`并进行配置：

```
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic" && export ANTHROPIC_AUTH_TOKEN="sk-******"
```

输入上述环境变量之后，终端输入 claude 便可以正常使用。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKCJMztt9WmnYHY63WDfHHPjyfNjCiac83lM4Vqh75Cfiaicb5mdk456QDg/640?wx_fmt=png&from=appmsg#imgIndex=2)

### 2. 搭建 claude-code-proxy

fuergaosi233/claude-code-proxy 是一个 github 开源的 python 项目，非常好用。基于此项目可以配置任何与 OpenAI 兼容的 API，来使用 Claude code。

项目本地运行与配置：

1.  下载后安装依赖：`uv sync`
    
2.  配置：`cp .env.example .env`，修改`.env`文件使用 OpenAI 兼容的 API。示例：
    
    ```
    OPENAI_API_KEY="sk-your-openai-key"OPENAI_BASE_URL="https://api.openai.com/v1"BIG_MODEL="gpt-4o" # 对应claude code 中的 'claude-3-opus'模型MIDDLE_MODEL="gpt-4o" # 对应'claude-sonnet-4'模型SMALL_MODEL="gpt-4o-mini" # 对应'claude-3.5-haiku'模型
    ```
    
3.  启动运行在本地 8082 端口的服务：`uv run claude-code-proxy`
    
4.  配置环境变量：
    
    ```
    export ANTHROPIC_BASE_URL="http://localhost:8082" export ANTHROPIC_AUTH_TOKEN="anything" # 随便什么都行，只是为避免出现/login提示
    ```
    
5.  终端输入 claude 便可直接使用。
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmK8PH49c9pdVEujzBFLoPZnNOBsIL1dfLe8jGQ9ibTKOa6nyXISFjDW3Q/640?wx_fmt=png&from=appmsg#imgIndex=3)
    

Claude Code 的功能
---------------

Claude Code 本身是一个强大的 Agent，它可以创建任务列表，调用工具，协调多个 Sub - Agent 完成用户的任务。

它提供了多种强大的工具，可以根据任务需要灵活调度：

*   创建和管理结构化任务列表：`TodoWrite`
    
*   文件操作:`Edit`、`MultiEdit`、`Read`、`LS`、`Grep`、`write`等
    
*   执行终端命令：`Bash`
    
*   运行 Sub-Agent 来处理复杂的多步骤任务：`Task`
    
*   网页搜索和信息获取: `WebFetch`、`WebSearch`
    

使用终端命令`cd`到工作目录下，运行`claude`根据提示与之对话即可，不必像`Cursor`一样添加上下文，`claude`会根据需要读取您的文件，收集此次任务所需的上下信息。 任务示例：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmK4yMPbPKUgYjTBjBbtos8dgE09PA8SOTibEnsnGvicB4usvxuGyOFINhg/640?wx_fmt=png&from=appmsg#imgIndex=4)

Claude 会自己找到正确的文件，并且更改和编辑时也会请求相应的权限批准。如果选择第 2 点，则当前会话进行期间，遇到文件编辑便不再请求权限。

权限配置
----

权限配置的核心目标是：**在自动化效率与系统安全之间找到平衡**。是否需要在关键步骤停下来由人为确认，或是否允许某些命令直接运行。

可以使用 `claude --dangerously-skip-permissions` 跳过所有权限检查，让 Claude 不间断地工作直到完成，而不是监督 Claude。这对于修复 `lint` 错误或生成样板代码等工作流效果很好。不过让 Claude 运行任意命令是有风险的，可能导致数据丢失、系统损坏，甚至数据泄露（例如，通过提示注入攻击）。为了最小化这些风险，最好在没有互联网访问的容器中使用 `--dangerously-skip-permissions`。比如使用 Docker Dev Containers 遵循这个风险规避方案实现。

你也可以手动编辑项目级`.claude/settings.json` 或用户级 `~/.claude.json`配置文件来配置权限，示例：

```
{  "skipPermissions": false,  "allowedTools": ["read", "write"],        // 只允许读写文件（不允许运行 shell）  "allowCommands": ["node ./scripts/setup.js"],   "denyCommands": ["rm -rf /", "curl http://*"]}
```

*   `skipPermissions`：是否跳过逐步确认（`true` = 跳过）。
    
*   `allowedTools`：允许 Claude 使用的工具清单（例如 `bash`, `filesystem`, `network` 等，具体字段名视实现）。
    
*   `allowCommands`/`denyCommands`：用白名单或黑名单明确允许或禁止的具体命令（尽量用白名单）。
    

启动 Claude Code 后也可使用 `/permissions` 命令添加或删除允许的工具，这些修改也会同步到 json 文件中：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKTTdZOzTqGq0o1hwyvxL2W76O500ZBicMiasousQGkfibUkHuAOEibTpaNA/640?wx_fmt=png&from=appmsg#imgIndex=5)![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKeXsfJd4WCb3ewHyiak3z4Mj7iaA6YUEsJAmtflnZiaYDR6K9edccX5zTg/640?wx_fmt=png&from=appmsg#imgIndex=6)

记忆管理
----

Claude Code 通过读取名为 `CLAUDE.md` 的记忆文件，在不同会话中保留我们的项目约定、提示模板、编码风格等，实现跨会话的知识延续。Claude Code 提供了三种记忆，他们存储在不同的目录下；启动 Claude 时，会自动读取这些文件，企业级记忆最先加载，其次是项目级，再到用户级，层层叠加构建上下文。

如果希望 Claude 记住项目上下文、编码规范等，就启用记忆功能。交互式窗口输入 `#` 即可触发记忆的创建。 ![image-20250807185848421](/Users/wally_qin/Library/Application Support/typora-user-images/image-20250807185848421.png)

项目级和用户级`CLAUDE.md`位于不同的位置，可以根据需要自行选择。

通过`/memory`可以编辑和查看记忆。比如将通过 `#` 创建的记忆：请始终使用中文回复我，编辑为：`请始终使用中文并始终保持幽默的语气回复我的消息`。然后再次问答，效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmK0m9dOvn6J8dZvemzwoOZ4j7YicpeXg3SVb8ibC8lz8SHfkO48ciaOYlSQ/640?wx_fmt=png&from=appmsg#imgIndex=7)

`CLAUDE.md` 文件也可以使用 `@path/to/import` 语法导入其他文件，相对路径和绝对路径都是允许的。示例：

```
查看 @README 了解项目概述，查看 @package.json 了解此项目可用的 npm 命令。
```

如果需要设置一个 CLAUDE.md 文件来存储重要的项目信息、约定和常用命令。可以直接使用 ：`/init`，它可以快速了解代码库的结构，并为我们自动创建一个项目相关的 CLAUDE.md 文件。

自定义斜杠命令
-------

自定义斜杠命令是 Claude Code 支持的一种快捷操作机制，可以将常用的提示语（prompt）写成 Markdown 文件，存放在特定目录，Claude Code 会自动识别并把它们当作可调用的命令。适合于 **重复执行、结构固定的工作流程**

命令按作用域（项目级或用户级）进行组织，并通过目录结构支持命名空间管理。

**存放位置**：

*   项目级命令：放在项目目录里的 `.claude/commands/`，调用方式如 `/project:命令名`；
    
*   用户级命令：放到用户的主目录下 `~/.claude/commands/`，调用方式如 `/user:命令名`；
    

**目录结构命名：**

*   可用子目录形成分层命名，如 `.claude/commands/posts/new.md` 对应调用 `/project:posts:new`
    

**参数传入**：

*   使用 `$ARGUMENTS` 占位符来把命令后的参数注入提示内容中。示例 `/project:posts:new` 命令:
    
    ```
    创建一篇文章，标题为 $ARGUMENTS：# 文章要求1. 生成符合kebab-case格式的文件名（使用今日日期：YYYY-MM-DD-标题.md）2. 使用Hugo命令创建新内容文件：`hugo new content`3. 更新前言部分以包含    - 唬人的标题    - 今日日期    - 描述内容4. 告诉我如何在本地运行网站以便预览的命令# 偏好设置：文章风趣幽默、通俗易懂。
    ```
    
    调用：`/project:posts:new 介绍下GPT 5`。`介绍下GPT 5` 会自动替换 `$ARGUMENTS`并生成提示词要求的文章。
    

**进阶用法**：

*   支持在 Markdown 正文前部分声明 `allowed-tools`（允许用的工具）、`description`、`argument-hint`、`model` 等；
    
*   还可以在命令中用 `!` 执行 Bash 命令、用 `@` 引用文件内容，增强命令的自动化能力。
    

<table><thead><tr><th><section>前置元数据</section></th><th><section>用途</section></th><th><section>默认值</section></th></tr></thead><tbody><tr><td><code>allowed-tools</code></td><td><section>命令可以使用的工具列表</section></td><td><section>从对话中继承</section></td></tr><tr><td><code>argument-hint</code></td><td><section>斜杠命令期望的参数。此提示在用户自动完成斜杠命令时显示给用户。参数占位提示。</section></td><td><section>无</section></td></tr><tr><td><code>description</code></td><td><section>命令的简要描述</section></td><td><section>使用提示的第一行</section></td></tr><tr><td><code>model</code></td><td><code>opus</code><section>、<code>sonnet</code>、<code>haiku</code>&nbsp;或特定的模型字符串</section></td><td><section>从对话中继承</section></td></tr></tbody></table>

示例：

```
---allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)argument-hint: [message]description: 创建 git 提交model: haiku---## 上下文- 当前 git 状态：!`git status`- 当前 git 差异（已暂存和未暂存的更改）：!`git diff HEAD`- 当前分支：!`git branch --show-current`- 最近的提交：!`git log --oneline -10`## 您的任务基于上述更改，创建单个 git 提交。
```

当然也可以使用 @`@path/to/import` 语法导入文件。

```
echo "审查 @src/utils/helpers.js 中的实现" > `.claude/commands/custom.md
```

斜杠命令这种方式本质上将常用 prompt “工程化”：变成文件，可复用、可版本控制、可分享。尤其适合团队协作中的 “标准操作”。

自定义 Subagents
-------------

**Subagents（子代理）是 Claude Code 中的 “专用小助手”——每个子代理有独立的系统提示（system prompt）、独立的上下文窗口和可定制的工具权限，用来处理特定类型的任务或领域问题。** 这让主对话保持高层次目标不被细节污染，同时把复杂或重复的工作交给专门配置的子代理去做。

当有以下场景时，可以考虑 Subagents：

*   **复杂任务需要分工时**：例如代码审查、调试、数据分析、单元测试自动修复等，可以把每项子任务交给专门子代理并行或顺序处理，降低主上下文压力。
    
*   **需要稳定、可复用的专家行为时**：把团队的 “最佳实践 / 检查清单” 写进子代理的系统提示，可保证输出一致性。
    
*   **想把重复流程工程化、放入项目版本控制时**：子代理文件可放到项目中，与代码一起管理，易于共享与审计
    

创建 Subagents：

1.  使用 Claude 内置的命令：`/agents`；
    
2.  项目中手动创建文件夹并写子代理文件：`.claude/agents/your-agent.md`
    
3.  用户目录文件夹下手动编写 `~/.claude/agents/your-agent.md`；
    

文件路径与优先级

1.  项目级：`.claude/agents/*.md`（项目内可复用，优先）
    
2.  用户级：`~/.claude/agents/*.md`（跨项目可用，优先级低）。
    

使用`/agents`时，你只需描述 agent 和什么时候用，然后会由 claude 引导你并通过模型快速为你生成 Subagent 的 md 文件：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmK9VImaQj1nbOoF2V2jwmAf0VQPOk5ic700nfpm6VjYXibRnq2IChicMHew/640?wx_fmt=png&from=appmsg#imgIndex=8)

接下来会让你选择你的 Agent 要用的工具:![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKu0wia2c9wwUU0eqyRy6C1YZMcnh1PvUTeQOBDNX5BePxqyX09icsoVWg/640?wx_fmt=png&from=appmsg#imgIndex=9)

选择`Show advanced options`则会更加详细的选择 Claude 内置的工具：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmK113zww4SKUEnaxuxTJugtvG0TjEt6TxgG9JEOa5mt3lawD7Aqhgtqg/640?wx_fmt=png&from=appmsg#imgIndex=10)

选择完毕、点击`continue`，会进入第 5、6 步选择模型和 Agent 终端的颜色。![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKIqggs24kGDQTiaKWuliaOyOPKvxfQyb6FbianT3Co9Ey4Y7EK6aK5k6bg/640?wx_fmt=png&from=appmsg#imgIndex=11)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKnL0JiaV9GA1v8AMTBddOEUPAUo7QAnGicn2d7sw1Y3X0b9GtIBAk7qaQ/640?wx_fmt=png&from=appmsg#imgIndex=12)

最终生成的 Agent，位于当前项目目录下：`.claude/agents/product-prd-expert.md`

```
---name: product-prd-expertdescription: Use this agent when you need to create comprehensive, professional product requirement documents (PRDs) based on user specifications. This agent specializes in translating high-level product ideas into detailed, actionable PRDs that engineering teams can implement. Examples: - User says '我想做一个社交APP，让用户可以分享短视频' → 使用product-prd-expert生成完整的短视频社交APP需求文档 - User mentions '需要为新的支付功能写PRD' → 使用product-prd-expert创建支付功能的产品需求文档 - After discussing a new feature idea, user says '把这个整理成正式的PRD' → 使用product-prd-expert将讨论内容转化为结构化PRDtools: Grep, LS, Glob, Edit, MultiEdit, Write, NotebookEditmodel: sonnetcolor: red---You are a senior product manager with 10+ years of experience at top-tier tech companies like Google, Amazon, and ByteDance. You excel at creating comprehensive, engineering-ready product requirement documents that balance user needs with technical feasibility......
```

*   `name`：小写、连字符，做为调用标识。
    
*   `description`：用于自动或主动匹配任务时的说明（写得越明确，自动委派越可靠）。
    
*   `tools`：列出允许该子代理使用的工具（可选；若省略则继承主线程的所有工具）。
    

当你使用 Claude 时输入的需求命中`product-prd-expert`时便会调用 Task 工具，执行 Agent。也可以显示调用，比如：使用`product-prd-expert`来生成产品需求。![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKLWtbpD0jG5NCjPYYlZM3shIDmx06YUPBZDoj8VvgwcyaIscLBZ0cEg/640?wx_fmt=png&from=appmsg#imgIndex=13)

基本命令
----

Claude 终端使用时常用的命令：

<table><thead><tr><th><section>命令</section></th><th><section>功能</section></th><th><section>示例</section></th></tr></thead><tbody><tr><td><code>claude</code></td><td><section>启动交互模式</section></td><td><code>claude</code></td></tr><tr><td><code>claude "query"</code></td><td><section>运行一次性任务</section></td><td><code>claude "fix the build error"</code></td></tr><tr><td><code>claude -p "query"</code></td><td><section>运行一次性查询，然后退出</section></td><td><code>claude -p "explain this function"</code></td></tr><tr><td><code>claude -c</code></td><td><section>继续最近的对话</section></td><td><code>claude -c</code></td></tr><tr><td><code>claude -r</code></td><td><section>恢复之前的对话</section></td><td><code>claude -r</code></td></tr><tr><td><code>claude commit</code></td><td><section>创建 Git 提交</section></td><td><code>claude commit</code></td></tr><tr><td><code>/clear</code></td><td><section>清除对话历史</section></td><td><code>&gt; /clear</code></td></tr><tr><td><code>/help</code></td><td><section>显示可用命令</section></td><td><code>&gt; /help</code></td></tr><tr><td><code>exit</code><section>&nbsp;或 Ctrl+C</section></td><td><section>退出 Claude Code</section></td><td><code>&gt; exit</code></td></tr></tbody></table>

自定义钩子
-----

Claude Code hooks 是用户定义的 shell 命令，在 Claude Code 生命周期的各个时间点执行。Hooks 提供对 Claude Code 行为的确定性控制，确保某些操作总是发生，而不是依赖 LLM 选择运行它们。

hooks 的示例用例包括：

*   **通知**：自定义当 Claude Code 等待您输入或请求运行权限时的通知方式
    
*   **自动格式化**：每次文件编辑后，在. ts 文件上运行 prettier，在. go 文件上运行 gofmt 等操作。
    
*   **日志记录**：追踪并统计所有执行的命令，以确保合规性或进行调试。
    
*   **反馈**：当 Claude Code 生成的代码不符合代码库规范时，提供自动化反馈。
    
*   **自定义权限**：阻止对生产文件或敏感目录的修改。
    

通过将这些规则编码为钩子而非提示词指令，可以将建议转化为应用级代码，确保每次预期运行时都能自动执行。

### Hook Events

Claude Code 提供了多个在工作流不同节点执行的钩子事件：

*   **PreToolUse**：工具调用前执行（可阻止调用）
    
*   **PostToolUse**：在工具调用完成后运行
    
*   **UserPromptSubmit**：用户提交提示词后、Claude 处理前执行
    
*   **Notification**：Claude Code 发送通知时执行
    
*   **Stop**：当 Claude Code 完成响应时运行
    
*   **Subagent Stop**：当子代理任务完成时运行
    
*   **PreCompact**：在 Claude Code 即将运行压缩操作之前运行
    
*   **SessionStart**：当 Claude Code 启动新会话或恢复现有会话时运行
    

每个事件会接收不同的数据，并能以不同方式控制 Claude 的行为。

### 使用

当你需要自定义钩子，实现对 Claude code 行为的确定性控制时，运行 `/hooks` ：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKxKz4HIuVgcFkf8jgia5adrADC7RSE7w6GN1rYJ4Bbx3cWZMLylrLUFg/640?wx_fmt=png&from=appmsg#imgIndex=14)

当我们我们 Enter 确认后，会输出如下内容进行提示：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKl8GiazYibEA5G43qOicYIrKUEqYYVu1rmBrAyz5fhfNq5MhcDlENjickbg/640?wx_fmt=png&from=appmsg#imgIndex=15)

> Hooks（钩子）是在 Claude 代码处理过程中**注册执行的 Shell 命令**。详见 hooks 文档
> 
> *   每个钩子事件都有独立的输入输出行为
>     
> *   每个事件可注册多个并行执行的钩子
>     
> *   对 / hooks 目录外部的钩子进行任何修改都需要重启服务
>     
> *   超时时间：60 秒
>     
> 
> ⚠ 严重安全警告 - 使用风险自负 : Hooks 会在未经确认的情况下，以你完整的用户权限执行任意 shell 命令。
> 
> *   你需要 **独自承担** 确保 hooks 安全可靠的责任
>     
> *   Hooks 可以修改、删除或访问你的用户账户能够访问的 **任何文件**
>     
> *   恶意或编写不当的 hooks 可能导致 **不可逆的数据丢失或系统损坏**
>     
> *   Anthropic **不提供任何担保**，并且对因使用 hooks 导致的任何损失 **不承担任何责任**
>     
> *   仅使用来自可信来源的 hooks，以防止数据泄露
>     
> *   在继续之前，请仔细阅读 hooks 文档
>     

这里我们选择 Hook `Notification`事件

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKRibjwicdibMB40AMnC3QLiafCVqbMQmt3X2H42TibUN237F2Nj4OKQkTyqw/640?wx_fmt=png&from=appmsg#imgIndex=16)![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKicgLajIBHC7p8SENeLGLiaSic7icborON5ibz3hIKMSVUOicOhYlCia2HqD7Q/640?wx_fmt=png&from=appmsg#imgIndex=17)

输入 shell 命令：`osascript -e 'display alert "Claude Code 通知我了" message "等待输入..."'` 和之前的斜杠命令和 Sub-Agent 一样钩子也会保存到代表不同级别的目录下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKcTGYrNHYdSG3DPZZaVVnOvhtgb62cITjrBuynXxH8d8gpfPic7rdWibA/640?wx_fmt=png&from=appmsg#imgIndex=18)

选择`local`后项目的`.claude`目录下会出现`settings.local.json`内容如下：

```
{  "hooks": {    "Notification": [      {        "matcher": "",        "hooks": [          {            "type": "command",            "command": "osascript -e 'display alert \"Claude Code 通知我了\" message \"等待输入...\"'"          }        ]      }    ]  }}
```

然后按照要求我们需要重启`Claude Code`重启后，在其运行`claude`会提示：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKsF3JBWk9hXVkmKBeswqoaicY8GxgGrFTcOU2GlYLib5GWU6icjYhHaekw/640?wx_fmt=png&from=appmsg#imgIndex=19)

选择`Yes`启用。当 Claude Code 运行时。`Notification`会在以下情况发送：

*   当 Claude 需要获取您的工具使用权限时。例如："Claude 需要获取您使用 Bash 的权限"
    
*   当提示输入框处于空闲状态超过 60 秒时。"Claude 正在等待您的输入"
    

使用效果如下：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAL2ia2wnfRMVicaBQVSTnRmKm7XaXSE5WDNQq9eiajcK9YtgHDNZhvwgkKAMmJZB9recSia2u3QYC8rA/640?wx_fmt=png&from=appmsg#imgIndex=20)

如果想指定`Notification`的输入字段比如`message`进行动态消息弹框显示该如何？首先需要查看 hooks 文档 找到`Notifcation`的入参：

```
{  "session_id": "71283a48-3ec1-4851-8493-adc0f7bb489b",  "transcript_path": "/Users/wally_qin/.claude/projects/-Users-wally-qin-Desktop-eruaka-temp-TEST/71283a48-3ec1-4851-8493-adc0f7bb489b.jsonl",  "cwd": "/Users/wally_qin/Desktop/eruaka_temp/TEST",  "hook_event_name": "Notification",  "message": "Claude needs your permission to use Update"}
```

你也可以简单配置：`python3 -c "import json, sys, os; data=json.load(sys.stdin); out=os.path.expanduser('~/Desktop/data.json'); json.dump(data, open(out,'w'), indent=2, ensure_ascii=False)"`查看每种事件的入参。

我需要弹框时展示`message`，钩子只支持 shell 命令，上述的入参数会作为标准输入：`sys.stdin` 。因此我需要使用`jq`提取 json 字段进行动态显示，最终 shell 命令如下：

```
msg=$(jq -r '.message'); osascript -e "display alert \"Claude Code 通知我了\" message \"$msg\""
```

### Hook MCP 工具

Claude Code 钩子与模型上下文协议（MCP）工具无缝协作。当 MCP 服务器提供工具时，它们以特殊的命名模式出现，您可以在钩子中匹配。

MCP 工具遵循模式 `mcp__<server>__<tool>`，例如：

*   `mcp__memory__create_entities` - Memory 服务器的创建实体工具
    
*   `mcp__filesystem__read_file` - Filesystem 服务器的读取文件工具
    
*   `mcp__github__search_repositories` - GitHub 服务器的搜索工具
    

配置示例如下：

```
{  "hooks": {    "PreToolUse": [      {        "matcher": "mcp__memory__.*",        "hooks": [          {            "type": "command",            "command": "echo 'Memory operation initiated' >> ~/mcp-operations.log"          }        ]      },      {        "matcher": "mcp__.*__write.*",        "hooks": [          {            "type": "command",            "command": "/home/user/scripts/validate-mcp-write.py"          }        ]      }    ]  }}
```

MCP 工具使用
--------

Claude Code 可以通过 Model Context Protocol (MCP) 连接到数百个外部工具和数据源。

### 添加本地 stdio 服务器

```
# 基本语法claude mcp add <name> <command> [args...]# 实际示例：添加 Airtable 服务器claude mcp add airtable --env AIRTABLE_API_KEY=YOUR_KEY \  -- npx -y airtable-mcp-server   #直接运行的本地MCP
```

> **理解 ”—” 参数：**`--`（双破折号）将 Claude 自己的 CLI 标志与传递给 MCP 服务器的命令和参数分开。`--` 之前的所有内容都是 Claude 的选项（如 `--env`、`--scope`），`--` 之后的所有内容都是运行 MCP 服务器的实际命令。
> 
> 例如：
> 
> *   `claude mcp add myserver -- npx server` → 运行 `npx server`
>     
> *   `claude mcp add myserver --env KEY=value -- python server.py --port 8080` → 在环境中使用 `KEY=value` 运行 `python server.py --port 8080`
>     
> 
> 这可以防止 Claude 的标志与服务器标志之间的冲突。

### 添加远程 SSE 服务器

SSE（服务器发送事件）服务器提供实时流连接。许多云服务使用此功能进行实时更新。

```
# 基本语法claude mcp add --transport sse <name> <url># 实际示例：连接到 Linearclaude mcp add --transport sse linear https://mcp.linear.app/sse# 带身份验证标头的示例claude mcp add --transport sse private-api https://api.company.com/mcp \  --header "X-API-Key: your-key-here"
```

### 添加远程 HTTP 服务器

HTTP 服务器使用标准的请求 / 响应模式。大多数 REST API 和 Web 服务使用此传输方式。

```
# 基本语法claude mcp add --transport http <name> <url># 实际示例：连接到 Notionclaude mcp add --transport http notion https://mcp.notion.com/mcp# 带 Bearer 令牌的示例claude mcp add --transport http secure-api https://api.example.com/mcp \  --header "Authorization: Bearer your-token"
```

### 管理 MCP 服务

```
# 列出所有配置的服务器claude mcp list# 获取特定服务器的详细信息claude mcp get github# 删除服务器claude mcp remove github# （在 Claude Code 中）检查服务器状态/mcp
```

**提示：**

*   使用 `--scope` 标志指定配置存储位置：
    

*   local（默认）：仅在当前项目中可用（在旧版本中称为 project）
    
*   project：通过 **.mcp.json** 文件与项目中的每个人共享
    
*   user：在所有项目中可用（在旧版本中称为 global）
    

*   使用 `--env` 标志设置环境变量（例如，--env KEY=value）
    
*   使用 `MCP_TIMEOUT` 环境变量配置 `MCP` 服务器启动超时（例如，MCP_TIMEOUT=10000 claude 设置 10 秒超时）
    
*   使用 `/mcp` 与需要 OAuth 2.0 身份验证的远程服务器进行身份验证
    

### 安装范围

安装范围使用`--scope`来指定。默认为本地`local`范围；

*   **本地范围**：个人服务器、实验性配置或特定于一个项目的敏感凭据。存储在项目特定用户设置中。这些服务器是私有的，只有在当前项目目录中工作时才可访问。
    

```
# 添加本地范围的服务器（默认）claude mcp add my-private-server /path/to/server# 明确指定本地范围claude mcp add my-private-server --scope local /path/to/server
```

*   **项目范围**：团队共享服务器、项目特定工具或协作所需的服务。存储在项目根目录的 `.mcp.json` 文件中来实现团队协作。
    

```
# 添加项目范围的服务器claude mcp add shared-server --scope project /path/to/server
```

*   **用户范围**：多个项目需要的个人实用程序、开发工具或经常使用的服务
    

```
# 添加用户服务器claude mcp add my-user-server --scope user /path/to/server
```

### `.mcp.json` 中的环境变量扩展

Claude Code 支持在 `.mcp.json` 文件中进行环境变量扩展，允许团队共享配置，同时保持机器特定路径和 API 密钥等敏感值的灵活性。

**支持的语法：**

*   `${VAR}` - 扩展为环境变量 `VAR` 的值
    
*   `${VAR:-default}` - 如果设置了 `VAR` 则扩展为 `VAR`，否则使用 `default`
    

**扩展位置：** 环境变量可以在以下位置扩展：

*   `command` - 服务器可执行文件路径
    
*   `args` - 命令行参数
    
*   `env` - 传递给服务器的环境变量
    
*   `url` - 用于 SSE/HTTP 服务器类型
    
*   `headers` - 用于 SSE/HTTP 服务器身份验证
    

带变量扩展的实例：

```
{  "mcpServers": {    "api-server": {      "type": "sse",      "url": "${API_BASE_URL:-https://api.example.com}/mcp",      "headers": {        "Authorization": "Bearer ${API_KEY}"      }    }  }}
```

Claude Code SDK 集成
------------------

Claude Code SDK 允许从应用程序中以非交互模式集成 Claude Code。本质上 SDK 只是封装了非交互式的终端命令。目前 SDK 支持 TypeScript 和 Python。

在集成对应的 SDK 之前，需要按照要求进行环境和 Claude Code 的安装：

1.  确保`Node.js 18+`，安装 Claude Code
    
    ```
    npm install -g @anthropic-ai/claude-code
    ```
    
2.  设置环境变量的两种方式：
    

*   `export ANTHROPIC_API_KEY="your-api-key-here"`
    
*   代码中使用：`os.environ['ANTHROPIC_API_KEY'] = "your-api-key-here"`
    

使用 Python 集成 Claude Code SDK 的基本示例：

```
import asynciofrom claude_code_sdk import (    AssistantMessage,    ClaudeCodeOptions,    ClaudeSDKClient,    UserMessage,)async def interact_with_claude():    # 配置客户端选项    options = ClaudeCodeOptions(        model="claude-3-5-sonnet-20241022",        system_prompt="你是一个专业的软件开发助手",        allowed_tools=["Bash", "Glob", "Grep", "LS", "Read", "Edit"],        continue_conversation=True,        permission_mode="acceptEdits"    )        # 创建客户端实例    async with ClaudeSDKClient(options=options) as client:        # 发送消息给Claude        await client.query("帮我检查项目中的潜在bug")                # 接收和处理响应        async for message in client.receive_messages():            if isinstance(message, AssistantMessage):                print(f"Claude: {message.content}")# 运行异步函数if __name__ == "__main__":    asyncio.run(interact_with_claude())
```

`ClaudeCodeOptions`部分参数说明：

*   `continue_conversation`：当 `continue_conversation`为 True 时，Claude 将会继续会话，并记住之前的上下文。单次与多轮对话。
    
*   `resume`：恢复是执行不同的会话切换的。恢复到某个历史的会话并继续。适合中断的会话恢复执行。
    

总结
--

Claude Code 代表了 AI 辅助编程工具的新发展方向，它通过将强大的 Claude AI 模型与开发者熟悉的命令行环境相结合，为技术工作提供了前所未有的便利。无论是在代码生成、调试还是项目管理方面，Claude Code 都能显著提高开发效率。

虽然在国内使用可能存在一定的门槛，但通过合适的途径仍然可以享受到这一强大工具带来的好处。随着 AI 技术的不断发展，像 Claude Code 这样的工具将在未来的软件开发中扮演越来越重要的角色。

参考
--

1.  Claude Code 官方文档 - https://docs.anthropic.com/en/docs/claude-code/
    
2.  Siddharth Bharath 的 Claude Code 完全指南 - https://www.siddharthbharath.com/claude-code-the-complete-guide/
    
3.  Fuszti 的 Claude Code 设置指南 - https://fuszti.com/claude-code-setup-guide-2025/
    
4.  Claude Code 常见工作流程 - https://docs.anthropic.com/en/docs/claude-code/common-workflows
    
5.  Claude Code SDK 文档 - https://docs.anthropic.com/en/docs/claude-code/sdk
    
6.  企业代理设置 - https://docs.anthropic.com/en/docs/claude-code/corporate-proxy
    

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=21)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=22)