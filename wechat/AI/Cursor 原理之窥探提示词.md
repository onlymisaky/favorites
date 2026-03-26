> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4NKYD5Q3an-y9xpV4PQ5gw)

Cursor 的 agent 模式本质上就是 VSCode（引入对话的交互） + 大模型（Claude 3.7 Sonnet 等） + tools use（读文件、写文件、搜索文件） + 提示词。

这篇文章利用 Cursor 的自定义模型来查看一下每次对话时 Cursor 自动填充的提示词。

环境准备
====

ollama
------

安装 https://ollama.com/，一个可以方便的本地运行开源大语言模型的软件。

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVXGMcvhrWiaVP8jCUjvwX5AAW1IAibkqvqjIibtaSH0t6Tc6BUfytU24icg/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyV4CIPu8n896fkp2rU6sOlKKibnKxicDqUE4IHLvawp0xZhXYAllKdEzNA/640?wx_fmt=png&from=appmsg)

安装完成之后在命令行执行 `ollama pull qwen2.5:7b`  随便拉取一个模型。

安装完之后运行该模型 `ollama run qwen2.5:7b` 。

接着就可以和 chatGPT 一样聊天了，只不过是在命令行：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyV2ZcmUoAwH7JibFlpVcZpq7rq7fFr17LT1pX3TXPqWCcRhU6RFreIO8A/640?wx_fmt=png&from=appmsg)

ollama 也会监听 11434 端口，提供了 HTTP 接口服务：

```
curl http://localhost:11434/api/generate -d '{  "model": "qwen2.5:7b",  "prompt": "用一句话介绍 Ollama"}'
```

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVGsWG9iak5s2UDu0yVxnr0QT8hfh38cq91ibEazaWZiaDNIbOicmM7AicibkA/640?wx_fmt=png&from=appmsg)

当然，现在也有很多开源的可视化工具，比如 open-webui，可以结合 ollama 直接在本地使用。

https://github.com/open-webui/open-webui

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVbeYSib8icwcy6SC95CYQ9zJALibiaZ2bEORGS6SnH5diaXIsmL5AxnIGPkw/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVoS0m8BmPX0BWCQeWWYlEiaRgOvXNgApF7sPGbIs61DwJYiaNr3xrsia0A/640?wx_fmt=png&from=appmsg)

ollama list 可以查看已经安装的所有大模型：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVQV5qQ8LLoOXddMLZXAibiae9fXFYNwRqjNev9b4TlcpHACIUY3qbj5lQ/640?wx_fmt=png&from=appmsg)

ngrok
-----

一个内网穿透工具，可以把本地运行的服务（比如 `localhost:11434`）通过一个公网地址暴露出去。

直接按照官网网站注册、安装一条龙就可以：

https://ngrok.com/

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVjIJU4uia6qJvq56zWzTpEBusUDsKuw0dt6NakaMiaPhiboOIupwxXy17g/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVC2iaMWBMSPmWe6WzEe4Ru3I462QWy4DHqYraI8UGwzOdqzMREKg3aFQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVDnEMicibuosaorMPibFpaE9AiciaAibYojiah3CJrOucfpBeDH8xOgtzUibibqg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVNGTSuydrRpEomglBIst6vLCHVe8WNsuuc1pxG2RgPXTdvt74DShv0w/640?wx_fmt=png&from=appmsg)

安装之后，先执行上边的 `ngrok config add-authtoken xxxxxxxxxxxxxx` ，接着执行 `ngrok http http://localhost:11434` 就把本地 ollama 的 HTTP 接口暴露到公网了：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVAY5JTh8ticva136WaYx0e1LWaslRnpEpchlUSiaq8EF9I40JctpgqSMQ/640?wx_fmt=png&from=appmsg)

ngrok 会提供一个新的域名给我们，用 curl 再测试一下：

```
curl https://1c9a-81-28-13-186.ngrok-free.app/api/generate -d '{  "model": "qwen2.5:7b",  "prompt": "用一句话介绍 Ollama"}'
```

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVT9aCwmIeehkiaPYkKdo8yqAia3wvrPOiaobVahEiavpIA63n72ibfBrS0kQ/640?wx_fmt=png&from=appmsg)

啥也没返回，是返回了 403：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVGO13FuEWz4k0ohiaX57EJMFU6f1FMibXQjQ719MkdpoicL2ajvCjTYDBg/640?wx_fmt=png&from=appmsg)

问下 chatGPT

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVB9bkNCx89pJzgcrEHO7xWFDp9ZoKQ0pnn2LxzKiacayK4DbibozicHXLQ/640?wx_fmt=png&from=appmsg)

ctrl+C 终止 ngrok 的运行，在命令行执行 `OLLAMA_HOST=0.0.0.0 ollama serve` 。

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVkIGia5pQGT2PXMYhic8wcw5Luau4WibD5264bzCo8U7GDGZ63h5DM79YA/640?wx_fmt=png&from=appmsg)

新开一个命令行窗口执行 `ngrok http http://localhost:11434` 

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVwicL93pF3PQfHZC6K6b4yuaNghLBKiaefuXC3vODnJVd3yViaXNZ2Ga0Q/640?wx_fmt=png&from=appmsg)

接着再在新的窗口执行 `curl` 进行测试，curl 的域名要换成大家自己生成的：

```
curl https://d7a5-81-28-13-186.ngrok-free.app/api/generate -d '{  "model": "qwen2.5:7b",  "prompt": "用一句话介绍 Ollama"}'
```

成功返回：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVRdm58aKNWK5zjL3VjV7spcWOcyHf4r2xpjtkMG4v6MBreDBtYIfPRw/640?wx_fmt=png&from=appmsg)

Cursor 配置
---------

打开 Cursor 的设置，先把其他的 model 都反选掉，再加一个 `qwen2.5:7b` 的 model，下边的 api 地址填写 ngrok 生成的域名加 /v1，API Key 随便写。

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyViaGGoRbeo5UyhDeVX7bxHALNcQI6owoOT92TWAILEBToDKk6EFpPe7A/640?wx_fmt=png&from=appmsg)

点击 Verify

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVaiaAuf6o1iaficFibF7icfLsjBcDCktNGrl1etUv8FVF6ibBD11AGkwkyddw/640?wx_fmt=png&from=appmsg)

继续点 Enable OpenAI API Key

成功开启本地模型：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVOHQfEIAaiatgLB3X26hYjcia0DiabecPKgeFcgGcibzRgBwJ2btwmJX1QA/640?wx_fmt=png&from=appmsg)

此时打开控制台显示的这个本地地址 http://127.0.0.1:4040：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyV2dvzzFA51iaB5hxsIsFnejj6Xo2wicGhoAWYibKYTOOLOGDPUvsNVAVtQ/640?wx_fmt=png&from=appmsg)

会看到刚才点击 Verify，其实 Cursor 向我们本地大模型发送了一次请求：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyV12lHmaVKq8hDeClaJBQOPHKHG6gNUZqhJGq9icbUAWyD04Kw5Daxd6w/640?wx_fmt=png&from=appmsg)

被我们成功抓取，后续与 Cursor 的对话我们就可以通过拦截轻松看到 Cursor 的提示词了。

提示词窥探
=====

普通对话
----

选择 qwen2.5:7b 模型，随便问一个问题：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVziaK0SEJZ0vAicdrhGqTIZeqW5UCFNxMyB0icO58uiahPA8iagKkicz26lUg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVOUDjPz84rSj9vK62qX1tAbPdvWyia9dmrIeOeO0LpYq2bIljuiaT1xiaQ/640?wx_fmt=png&from=appmsg)

抓一下请求：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVFhgqnvSickaxIoB9INGDyUY4ibia3voE9Q6LSkN0pNpic60s680Nle1gKQ/640?wx_fmt=png&from=appmsg)

```
{    "model": "qwen2.5:7b",    "temperature": 0,    "user": "google-oauth2|user_01JGZWXE12P5KA8Z4F5Z3V9AKT",    "messages": [        {            "role": "system",            "content": "You are a an AI coding assistant, powered by qwen2.5:7b. You operate in Cursor\n\nYou are pair programming with a USER to solve their coding task. Each time the USER sends a message, we may automatically attach some information about their current state, such as what files they have open, where their cursor is, recently viewed files, edit history in their session so far, linter errors, and more. This information may or may not be relevant to the coding task, it is up for you to decide.\n\nYour main goal is to follow the USER's instructions at each message, denoted by the <user_query> tag.\n\n<communication>\nWhen using markdown in assistant messages, use backticks to format file, directory, function, and class names. Use \\( and \\) for inline math, \\[ and \\] for block math.\n</communication>\n\n\n<search_and_reading>\nIf you are unsure about the answer to the USER's request or how to satiate their request, you should gather more information. This can be done by asking the USER for more information.\n\n\nBias towards not asking the user for help if you can find the answer yourself.\n</search_and_reading>\n\n<making_code_changes>\nThe user is likely just asking questions and not looking for edits. Only suggest edits if you are certain that the user is looking for edits.\nWhen the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:\n\n```language:path/to/file\n// ... existing code ...\n{{ edit_1 }}\n// ... existing code ...\n{{ edit_2 }}\n// ... existing code ...\n```\n\nThe user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that's okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.\n\nThese edit codeblocks are also read by a less intelligent language model, colloquially called the apply model, to update the file. To help specify the edit to the apply model, you will be very careful when generating the codeblock to not introduce ambiguity. You will specify all unchanged regions (code and comments) of the file with \"// ... existing code ...\" comment markers. This will ensure the apply model will not delete existing unchanged code or comments when editing the file. You will not mention the apply model.\n</making_code_changes>\n\n<user_info>\nThe user's OS version is darwin 24.1.0. The absolute path of the user's workspace is /Users/windliang/my-project/koa-cursor. The user's shell is /bin/zsh. \n</user_info>\n\nYou MUST use the following format when citing code regions or blocks:\n```12:15:app/components/Todo.tsx\n// ... existing code ...\n```\nThis is the ONLY acceptable format for code citations. The format is ```startLine:endLine:filepath where startLine and endLine are line numbers."        },        {            "role": "user",            "content": "<user_query>\njs 中最大的数字是多少\n</user_query>\n"        }    ],    "stream": true}
```

一段一段看一下：

```
You are a an AI coding assistant, powered by qwen2.5:7b. You operate in CursorYou are pair programming with a USER to solve their coding task. Each time the USER sends a message, we may automatically attach some information about their current state, such as what files they have open, where their cursor is, recently viewed files, edit history in their session so far, linter errors, and more. This information may or may not be relevant to the coding task, it is up for you to decide.Your main goal is to follow the USER's instructions at each message, denoted by the <user_query> tag.
```

*   明确 AI 的身份是「在 Cursor 编辑器中运行的编程助手」，不是通用型 AI。
    
*   指出用户的上下文（如打开的文件、光标、编辑历史）会自动注入，AI 自行判断是否有用。
    
*   AI 的主任务是 执行 <user_query> 的指令，不是自己 “发挥”，Cursor 把我们的输入包了 `user_query`
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVELliaVZUnydkedVicCbPdMx4KBcgeIibfsRiaxyrIpShibg9MGv4dkKxXWQ/640?wx_fmt=png&from=appmsg)
    

```
<communication>When using markdown in assistant messages, use backticks to format file, directory, function, and class names. Use \( and \) for inline math, \[ and \] for block math.</communication>
```

*   规范助手的 Markdown 输出风格，确保输出统一、清晰。
    
*   特别针对代码表达（文件、函数名）和数学表达（inline/block）做出指令。
    

```
<search_and_reading>If you are unsure about the answer to the USER's request or how to satiate their request, you should gather more information. This can be done by asking the USER for more information.Bias towards not asking the user for help if you can find the answer yourself.</search_and_reading>
```

*   指导 AI 在不确定时主动补充信息。
    
*   但更强调：如果你能解决，就不要打扰用户。
    

```
<making_code_changes>The user is likely just asking questions and not looking for edits. Only suggest edits if you are certain that the user is looking for edits.When the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:```language:path/to/file// ... existing code ...{{ edit_1 }}// ... existing code ...{{ edit_2 }}// ... existing code ...```The user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that’s okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.These edit codeblocks are also read by a less intelligent language model, colloquially called the apply model, to update the file. To help specify the edit to the apply model, you will be very careful when generating the codeblock to not introduce ambiguity. You will specify all unchanged regions (code and comments) of the file with “// … existing code …” comment markers. This will ensure the apply model will not delete existing unchanged code or comments when editing the file. You will not mention the apply model.</making_code_changes>
```

*   非常细致地规范了 AI 修改代码的方式、展示的格式、输出的内容结构。
    
*   避免不必要的 “全量重写”，只写差异（diff）片段。
    
*   为内部系统的 “apply model” 提供结构化提示（如 `// ... existing code ...`）
    

```
<user_info>The user’s OS version is darwin 24.1.0. The absolute path of the user’s workspace is /Users/windliang/my-project/koa-cursor. The user’s shell is /bin/zsh.</user_info>
```

*   提供用户本地开发环境的信息，供 AI 推断路径、命令格式、兼容性差异等。
    

```
You MUST use the following format when citing code regions or blocks:```12:15:app/components/Todo.tsx// ... existing code ...```This is the ONLY acceptable format for code citations. The format is ```startLine:endLine:filepath where startLine and endLine are line numbers."
```

*   强制约定代码片段引用格式，以供系统解析精确的文件位置。
    
*   确保编辑器和自动修改工具能知道 AI 指的是哪部分代码。
    

连续对话
----

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVrWEdAxnrKAyPv3ZLTLuXZJqeKSrIicO7LnXV1bDBkl71cPANIev6stw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVcibrNYzcCUYCLEdO3aR6tlA5FnkpF5Fibq6KDLjKbus83PHk7hSlB1qQ/640?wx_fmt=png&from=appmsg)

可以看到一个请求中会把历史问题都带着：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVcibrNYzcCUYCLEdO3aR6tlA5FnkpF5Fibq6KDLjKbus83PHk7hSlB1qQ/640?wx_fmt=png&from=appmsg)

所以如果问不想干的问题，最好新开一个窗口，防止让大模型感到困惑。

如果是同一个问题要问多次，也可以选择在原来的问题上进行编辑重新发送：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVIlnuW1wyC78451roOThzhHiatrMU3nxdicobYC3DjA0GOariaDzic01Biaw/640?wx_fmt=png&from=appmsg)

Cursor rules
------------

新建  `.cursor/rules/global.mdc` ，测试 rules

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVCInBvIe9LO4UlaplJVkR20nCmpGCcxwdQ03hc3vJHSqCqcLdF7WkzA/640?wx_fmt=png&from=appmsg)

重新问个问题：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVtSJEv5DVlokNT0DiafVk0KO5iarRqj3XwrkQckeIqIcmUC40ZqfFJQ1g/640?wx_fmt=png&from=appmsg)

请求中多了一段 <cursor_rules_context>，把我们设置的 rules 带了过去：

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVa8qI5r11ibJCWCVGsmZYksm5UPEUOOiccnYpLZuD8sgwxonCsWfkLPvA/640?wx_fmt=png&from=appmsg)

读取文件
----

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyV016nQ3AThUqWrxX4cWrgp69aNEqEu3TPfQT8pF4mjl4nbsiaGKnO5Cg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyVLzxvpgppxBQGCTsuEIyGSQ4KJePO8EEgSw4vQhxmrHpMa8RMkFcS0A/640?wx_fmt=png&from=appmsg)

按照 tag 再分段看一下：

```
<cursor_rules_context>Cursor Rules are extra documentation provided by the user to help the AI understand the codebase.Use them if they seem useful to the user’s most recent query, but do not use them if they seem unrelated.Rule Name: global.mdcDescription:总是用中文回复</cursor_rules_context>
```

之前设置的 Cursor rules。

```
<additional_data>Below are some potentially helpful/relevant pieces of information for figuring out how to respond<current_file>Path: app.jsLine: 58Line Content: console.log('openaiRouter', openaiRouter);</current_file>
```

当前选中的文件，Line  58 是因为光标在 58 行。

![](https://mmbiz.qpic.cn/mmbiz_png/KiabBhIhK9dcibK1OHr8ylmgAUhJ7ptSyViaS7iczMz2M3Y0J6U2biane5SDYKiaNlCvJpxar1knr93JSM1DuCfxcicxg/640?wx_fmt=png&from=appmsg)

把整个文件传给了 Ai。

```
</file_contents></attached_files></additional_data>
```

反标签，和前边配对。

```
<user_query>添加一个车 /test 接口，返回 hello world</user_query>
```

我们输入的内容。

总
=

所以回过头看，Cursor 的提示词没那么神秘，说白了，它只是用结构化的方式告诉大模型四个关键点：你是谁、该干啥、上下文是什么、需要注意啥。像 <user_query>、<cursor_rules_context> 这些标签，本质就像是「请求头」和「接口描述」，在每次交互里悄悄声明调用方式、参数信息，帮模型对齐语境，别跑偏、别答错。

理解了这层机制，我们就能反过来思考：模型为啥这么回？我能不能改改上下文或 prompt，让它更贴合预期。