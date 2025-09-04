> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/McMrZIB3GfTESDKEwNJ0Zg)

开头
--

兄弟们，今天给大家整点干货！用 Node.js 调 ChatGPT API 搞个流式聊天效果，就跟官方那个一样一个字一个字往外蹦，贼拉简单！

这里用 sse。(chatgpt 设置 stream 为 true 即可。)

讲一下这里为啥用 sse：

第 1，**简单**：只要 http 响应头 和 前端用`EventSource`api 就可以。相对比 websocket，还要心跳机制和一些连接管理那些。

第 2，**不要浪费**：前端不需要频繁向后端发请求，sse 单向的就够用了。

### 准备

**安装 Node.js**（版本 16 以上就行）

开个 chatgpt 号，开通 api 调用权限。

### 代码

1.  前端代码（index.html）
    

```
<html><body>  <!-- 聊天界面 -->  <div id="answer"></div>  <input id="input" placeholder="输入问题">  <button onclick="send()">发送</button>  <script>    const inputElem = document.getElementById('input');    const answerElem = document.getElementById('answer');    // 发送问题到后端    function send() {      const prompt = inputElem.value.trim();      if (!prompt) return;            answerElem.textContent = ''; // 清空回答区域      exec(prompt); // 执行请求      inputElem.value = ''; // 清空输入框    }    // 使用EventSource建立流式连接    function exec(prompt) {      const url = new URL('/chat', location.href);      url.searchParams.set('prompt', prompt); // 设置问题参数      const es = new EventSource(url); // 创建SSE连接            es.onmessage = (event) => {        const data = event.data;        if (data === '[DONE]') {  // 流结束标记          es.close();          return;        }        const chunk = JSON.parse(data);        const content = chunk.choices[0].delta.content;                if (content) {          answerElem.textContent += content; // 追加内容到回答区域        }      };    }  </script></body></html>
```

1.  后端代码（server.js）
    

```
import { createServer } from'http'import OpenAI from'openai'import { createReadStream } from'fs'// 初始化 OpenAI 客户端const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY,})const port = 3001createServer(async (req, res) => {const url = new URL(req.url!, 'file:///')const query = Object.fromEntries(url.searchParams.entries())// 根路径，返回 index.htmlif (url.pathname === '/') {    createReadStream('./index.html').pipe(res)    return  }// /chat 路径，处理聊天请求if (url.pathname === '/chat') {    const prompt = query.prompt || ''    if (prompt.trim() === '') {      res.end('query prompt is required')      return    }    // 调用 OpenAI API 获取流式聊天数据    const gptStream = await openai.chat.completions.create({      model: 'gpt-3.5-turbo',      messages: [{ role: 'user', content: prompt }],      max_tokens: 100,      stream: true,    })    // 设置响应头为 SSE 格式    res.writeHead(200, { 'Content-Type': 'text/event-stream' })    forawait (const chunk of gptStream) {      res.write(`data: ${JSON.stringify(chunk)}\n\n`) // 实时推送数据    }    req.on('close', () => {      console.log('req close...')    })    return  }// 其他路径返回默认信息  res.end('other route')}).listen(port)console.log(`Server running at http://localhost:${port}/`)
```

### 跑起来

**环境**：

*   Node.js
    
*   npm 或 yarn
    
*   OpenAI API 密钥
    

**目录结构**：

```
/my-project  |-- server.js  |-- index.html  |-- .env  |-- node_modules/  |-- package.json  |-- package-lock.json
```

**env 文件**：

后台给的，去复制写上去就好了。

```
OPENAI_API_KEY=你的OpenAI API
```

**装依赖**:

```
npm i openai
```

**跑起来**：

```
node server.js
```

服务器启动后，我们可以访问 http://localhost:3001/[1] 来查看聊天效果。在浏览器输入问题，点击发送，等待一会儿，你会看到实时返回的答案。答案会一块一块地显示出来，模拟了 ChatGPT 自己的流式效果。

**放到服务器上**：

买服务器，国内受限，买个外国的服务器，按量付费，自己玩玩，配置低也没关系。把代码部署上去，我一般是在服务器上装宝塔跑。

**开端口**:

最后主要要开通一下端口 3001。

服务器安全组里一般就是，开放 3001 端口。

完结
--

sse 是啥，sse 是`server-sent event`，叫它实时推送吧。openai 的 chatgpt 本身就有这个一个个字蹦出来的效果，只要加个`stream: true`这样子在它给出的 api 里面去配置一下就好了。

前端就用`onmessage`去收，然后拼接。前后端打个配合。

就这么简单！1 分钟就能搞个自己的 AI 聊天窗口，自己去做套壳 ChatGPT。

作者：curdcv_po

https://juejin.cn/post/7494364958031020095