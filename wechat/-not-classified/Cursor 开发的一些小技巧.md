> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/5Qa3pYy1Ntt4LC5pui_UAg)

Plan -> Act
===========

避免 Cursor 一上来就无脑改代码，可以让它先输出自己的修改计划，等用户确认后再执行修改。

从 Plan Mode -> Act Mode：

```
---description: when you handle each requestglobs: *alwaysApply: false---You have two modes of operation:1. Plan mode - You will work with the user to define a plan, you will gather all the information you need to make the changes but will not make any changes2. Act mode - You will make changes to the codebase based on the plan- You start in plan mode and will not move to act mode until the plan is approved by the user.- You will print `# Mode: PLAN` when in plan mode and ` Mode: ACT` when in act mode at the beginning of each response.- Unless the user explicity asks you to move to act mode, by typing `ACT` you will stay in plan mode.- You will move back to plan mode after every response and when the user types `PLAN`.- If the user asks you to take an action while in plan mode you will remind them that you are in plan mode and that they need to approve the plan first.- When in plan mode always output the full updated plan in every response.
```

Memory MCP 记忆上下文
================

在使用 Cursor 的过程中，由于一开始没有对规则想的大而全，他经常会改出一些不合理的代码，这个时候我就会对他做限制，比如 “不允许修改其他的逻辑” 这种。

虽然接下来几次对话他记住了这个这个要求，但过一会儿他又忘了。有时候在我给他提新要求的时候，他又忘了之前的要求，在不断地叠要求的时候，他会越来越离谱，最后会直接摆烂。。

尝试记录 Markdown
-------------

为了解决这个问题，我尝试了很多种办法，最开始尝试过提供一条 rule，这个 rule 内容如下：

```
---description: when you handle each requestglobs: *alwaysApply: true---1. Before you start any work, you must create a temp.md file in the .docs directory. The markdown file structure is as follows:# <Create a title based on user input>## rule## plan## Conversation Summary2. Every conversation between you and the user must be summarized and updated in the conversation summary of temp.md3. If it is a user-proposed requirement or rule, it must be updated in the rules of temp.md (very important!!)4. Each request must be strictly executed according to the rules of the temp.md file
```

这个 rule 的大概意思就是在开始之前，你要在 .docs 目录下面创建一个 temp.md 文件，然后将用户所有的要求和对话上下文都存入到这个 markdown 文件里面。

如果你开始下一次会话，那就一定要先从 temp.md 里面读取用户的要求。

这个理想是很美好的，但实践了一天下来，发现他经常就不会去读我的 markdown 文件，更不会去往里面更新，形同虚设。

尝试 MCP
------

后来在网上发现了这个 MCP，可以基于知识图谱做本地持久化的。

https://github.com/modelcontextprotocol/servers/tree/main/src/memory

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHHrbhUqUyvia59HT3fPb6sGfkBMzfJGWBhibm0cBHwAdnD8qohxXmI83KP1iccIIQfumCW8AEk24M6fQ/640?wx_fmt=png&from=appmsg)

于是我就尝试了一下这个 MCP，用法比较简单。在 cursor settings 的 MCP 这里新增一个 MCP Server，然后编辑一下。

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHHrbhUqUyvia59HT3fPb6sGfQiakmqgWMv9nFuEnlV6Kow23K0LiatnZI3BLRzVtj5gRyYVKodKZf2nw/640?wx_fmt=png&from=appmsg)

创建了一个 mcp.json 文件出来，文件内容如下：

```
{  "mcpServers": {    "memory": {      "command": "npx",      "args": [        "-y",        "@modelcontextprotocol/server-memory"      ],      "env": {        "MEMORY_FILE_PATH": "xxxx/memory.json"      }    }  }}
```

这里的 MCP Server 算安装好了（观察一下左上角如果是个绿点，那就是好了。如果是红点，那就不行），那接下来怎么去使用呢？从 README 上看有点儿抽象，他给了一个例子：

```
Follow these steps for each interaction:1. User Identification:   - You should assume that you are interacting with default_user   - If you have not identified default_user, proactively try to do so.2. Memory Retrieval:   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph   - Always refer to your knowledge graph as your "memory"3. Memory   - While conversing with the user, be attentive to any new information that falls into these categories:     a) Basic Identity (age, gender, location, job title, education level, etc.)     b) Behaviors (interests, habits, etc.)     c) Preferences (communication style, preferred language, etc.)     d) Goals (goals, targets, aspirations, etc.)     e) Relationships (personal and professional relationships up to 3 degrees of separation)4. Memory Update:   - If any new information was gathered during the interaction, update your memory as follows:     a) Create entities for recurring organizations, people, and significant events     b) Connect them to the current entities using relations     b) Store facts about them as observations
```

大概意思应该就是把这个当成 rule，让 cursor 去理解上下文后调用 memory 的 create_entities、create_relations、add_observations 等接口。

上面这个 rule 不太适用于开发场景，于是我做了一些修改，最终的 rule 如下：

```
---description: memoryglobs: *alwaysApply: true---Follow these steps for each interaction:1. User identification:- You should assume you are interacting with the default_user- If you have not yet identified the default_user, proactively attempt to do so.2. Memory retrieval:- Always start the chat with "Remember..." and retrieve all relevant information from the knowledge graph- Always refer to the knowledge graph as "memory"3. Memory- When talking to users, please remember to create entities for the following information:| information | entityType | description | example || --- | --- | --- | --- || User Requirements | userRequirements | record the requirements actively proposed by the user | implement the user login function || Confirmation point | confirmationPoint | store the content that the user explicitly approves | confirm to use JWT authentication || Rejection record | rejectionRecord | record the options denied by the user | refuse to use localStorage to store tokens || Code snippet | codeSnippet | save the generated results accepted by the user for subsequent association |  || Session | session | a session with the user |  || User | user | User info | default\_user |- When talking to users, please remember to establish relationships for the following information| relations | from | to | example || --- | --- | --- | --- || HAS\_REQUIREMENT | session | userRequirements | session A contains the requirement "user login must support third-party authorization" || CONFIRMS | user | confirmationPoint | the user confirms in session B that "the backend API return format is { code: number, data: T }" || REJECTS | user | rejectionRecord | the user rejected "using any type" in session C, and the reason was "strict type checking is required" || LINKS\_TO | userRequirements | codeSnippet | the requirement "implement login function" is linked to the generated auth.ts file |4. Memory update:- If any new information is collected during the interaction, update the memory as follows:a) Create entities for user requirements, confirmation points, rejection records, code snippetsb) Connect them to the current entity using relationshipsb) Store facts about them as observations
```

大概意思就是创建下面这几种实体，建立这几种关系：

![](https://mmbiz.qpic.cn/mmbiz_png/VgnGRVJVoHHrbhUqUyvia59HT3fPb6sGfMvlc5hGnS5cBgo2Nh9S0KM4jyduR0PPuj6zkBNLKaL91UeYrUun6icA/640?wx_fmt=png&from=appmsg)

如果你需要新开 Chat，也可以让 AI 从 memory 里面读取知识图谱，继续之前的工作。

PS：最新的 Cursor 似乎有 bug，rule 经常会不生效，就算设置了 alwaysApply 也没用，所以 markdown 方案不可行估计就是因为这个