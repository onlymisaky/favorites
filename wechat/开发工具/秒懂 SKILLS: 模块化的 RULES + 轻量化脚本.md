> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/cJG5iOuOTQulpZb8qDcnNA)

为什么我们需要 skills?
---------------

众所周知，在 AI 编程的语境下，`RULES` 几乎是必不可少的，人们需要在 `RULES` 中提前给 `AI` 制定规则：

1.  它是一个什么样的角色
    
2.  本工程采用了什么技术栈，它应该按什么编码规范来编码，如何组织工程代码。
    
3.  当遇上一些非常见情况时，它应该如何处理，遵循什么原则
    
4.  如何处理某些异常
    

但是，问题来了：

*   如果 RULES 太短，那它能覆盖的范围就非常有限。
    
*   如果 RULES 太长，每次会话 AI 都需要完全加载一遍它，浪费 token 倒是其次，重要的是 token 会降低 AI 的准确性提升幻觉。
    

于是，模块化【懒加载】的诉求，便血淋淋摆在人们面前了。

`SKILLS` 要解决的也正是这个痛点。

*   它允许不同的规则被注册在不同的 SKILL.md 中，只在需要的时候进行加载。
    

SKILLS 的结构
----------

要实现懒加载，有一个重要的问题需要解决：

> 大模型需要知道合适加载哪个 Skill。

因此，SKILLS 的结构笼统性来说，分为两个部分：

*   元数据: 告诉大模型我是谁，我有什么能力，什么时候应该调用我。
    
*   内容：指导大模型如何进行编程。
    

这是一个典型 SKILL.md 文件的结构：

```
---name: API公约description: 适用于当前代码库的 API 设计模式---在编写 API 接口（端点）时：- 遵循 RESTful 命名规范- 返回统一的错误格式- 包含请求参数校验
```

在头部被 `---` 包裹起来的部分就是 markdown 元数据，在这里它们被用来描述技能本身的特性。

*   name：技能的名称
    
*   description：技能的描述，有什么用，什么时候应该被加载
    

而下面具体指导编程规范的部分，则是该技能的【内容】。

一开始的时候，【内容】并不会被加载到上下文中，只加载精简过的【元数据】，这会极大地节约 token 消耗，也能降低模型幻觉。

SKILLS 放在哪？
-----------

结合 Claude Code、Trae、OpenCode 以及 Cursor 的最新文档，

#### Claude Code

位置：项目根目录 /.claude/skills/

*   结构：
    

```
ProjectRoot/└── .claude/    └── skills/        ├── skill-a/  <-- 技能名称文件夹        │   ├── SKILL.md  <-- 核心定义 (SOP & Prompts)        │   └── scripts/  <-- (可选) 对应的 Python/Node 脚本        └── skill-b/            └── SKILL.md
```

*   生效方式：Claude Code 启动时自动扫描该目录，根据 User Prompt 和 SKILL.md 中的 description 自动挂载。
    

#### OpenCode

位置：通常为 /.opencode/skills/

```
Project config: .opencode/skills/<name>/SKILL.mdGlobal config: ~/.config/opencode/skills/<name>/SKILL.mdProject Claude-compatible: .claude/skills/<name>/SKILL.mdGlobal Claude-compatible: ~/.claude/skills/<name>/SKILL.md
```

#### Cursor

位置：通常为 /.cursor/skills/

```
.cursor/└── skills/    └── deploy-app/        ├── SKILL.md        ├── scripts/        │   ├── deploy.sh        │   └── validate.py        ├── references/        │   └── REFERENCE.md        └── assets/            └── config-template.json
```

#### Trae

位置：通常为 /.trae/skills/

```
.trae/skills/├──skill-name/    ├── SKILL.md      ├── scripts    └── references
```

总的来说，各家有各家的习惯和地盘，希望后续能统一成标准吧。

有了 SKILLS，可以不要 MCP 了吗？
----------------------

绝对不可以！

它们并不是互斥的两套技术。

恰恰相反，它们是 “黄金搭档”，是底层能力 (Capabilities) 与 上层应用 (Applications) 的关系。

如果把构建 Agent 比作雇佣一个员工，那么：

*   MCP (Model Context Protocol) 是这个员工的 “手” 和 “感官”。
    

*   它定义了员工能做什么（比如：能拿杯子、能查数据库、能运行 Python 代码）。
    
*   它解决了 “怎么连接” 的问题（标准化的接口协议）。
    

*   Skills (技能 / 规则) 是这个员工的 “职业培训手册” (SOP)。
    

*   它定义了员工该怎么做（比如：看到客人来了要倒水、查库前要先鉴权、代码报错了要重试）。
    
*   它解决了 “怎么思考” 和“怎么决策”的问题（业务逻辑与流程控制）。
    

总的来说，只要把 `SKILLS` 当作模块化的 `RULES`来理解会比较容易。

但，SKILLS 除了是模块化的 RULES 外，它还有一个重要的能力：

*   它具备脚本执行能力。
    

软硬一体的 SKILLS
------------

之前的回答为了强调 “规则” 的重要性，确实简化了 Skills 的定义。实际上，完整的 Skills 是 “软硬一体” 的。

在 Claude Code 的架构中，一个 Skill 确实可以包含它私有的、本地的脚本。

### 1. 重新定义：Skills 的完整公式

纠正之前的定义，现在的公式应该是：

Skill = 🧠 业务规则 (SOP) + 🛠️ 专用脚本 (Local Scripts)

SOP (SKILL.md)：这是大脑。它告诉 AI 什么时候用、怎么用。

Scripts (/scripts/*.py)：这是随身工具包。它是为了配合这个 SOP 而存在的轻量级代码。

### 2. 为什么要允许 Skill 包含脚本？

既然有了 MCP，为什么还需要 Skill 自带脚本？

这就像：虽然工厂里有重型机床（MCP），但工人腰带上还是得挂一把螺丝刀（Skill Script）。

主要有以下三个原因：

*   A. 降低依赖 (Self-Contained) 如果你的 Skill 只是为了做一些简单的文本处理（比如 “把 xxx 格式化一下”），为此启动一个 HTTP MCP Server 太重了。 把这个逻辑写成一个 20 行的 Python 脚本放在 Skill 文件夹里，随拿随用，这才是“技能包” 的便携性。
    
*   B. 胶水逻辑 (Glue Logic) 有时候，MCP 提供的原子能力太碎了。
    

*   MCP 工具 A：get_file_list
    
*   MCP 工具 B：analyze_file
    
*   Skill 脚本：你可以写一个脚本，循环调用 A，过滤结果，然后传给 B，最后输出统计报表。
    
*   优势：你把 “循环与判断” 的计算压力从 LLM（昂贵、慢）转移到了 CPU（便宜、快）。
    

*   C. 本地文件操作 Claude Code 是在本地运行的。Skill 脚本可以直接通过 bash 访问你项目里的文件系统，这比远程 MCP Server 通过网络传输文件内容要高效得多。