> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wrPeMoCvb9puVrMjDWrL-w)

基于 Node.js 的 MCP 协议完整实现指南：连接大模型与现实世界的桥梁
=======================================

一、MCP 协议：大模型的 "瑞士军刀" 接口
-----------------------

### 1.1 什么是 MCP？

MCP（Model Context Protocol）是专为大型语言模型设计的开放协议，它如同 AI 世界的 USB 接口标准。想象一下，当 ChatGPT 需要查询实时股价或进行复杂计算时，MCP 就是让它能 "即插即用" 调用外部工具的标准化方式。

核心优势：

*   **突破文本限制**：让 LLM 获得现实世界的数据访问能力
    
*   **统一工具接口**：不同模型（GPT/Claude 等）可共享同一套工具
    
*   **流式交互**：支持实时进度反馈（如长时间任务处理）
    

### 1.2 Function Calling vs MCP 深度对比

协议基础
----

<table><thead><tr><th><strong>对比维度</strong></th><th><strong>OpenAI Function Calling</strong></th><th><strong>MCP (Model Context Protocol)</strong></th></tr></thead><tbody><tr><td><strong>协议类型</strong></td><td><section>厂商私有协议</section></td><td><section>开放行业标准</section></td></tr><tr><td><strong>发起组织</strong></td><td><section>OpenAI</section></td><td><section>Anthropic 主导，多厂商参与</section></td></tr><tr><td><strong>标准化程度</strong></td><td><section>文档化但未开源</section></td><td><section>公开规范文档与参考实现</section></td></tr></tbody></table>

技术实现
----

<table><thead><tr><th><strong>对比维度</strong></th><th><strong>Function Calling</strong></th><th><strong>MCP</strong></th></tr></thead><tbody><tr><td><strong>通信协议</strong></td><td><section>HTTP/JSON</section></td><td><section>HTTP/JSON + SSE 流式传输</section></td></tr><tr><td><strong>工具发现机制</strong></td><td><section>客户端硬编码声明</section></td><td><section>动态发现端点 (<code>GET /discovery</code>)</section></td></tr><tr><td><strong>执行模式</strong></td><td><section>同步阻塞调用</section></td><td><section>支持同步 / 异步流式响应</section></td></tr><tr><td><strong>数据格式</strong></td><td><section>自定义 JSON 结构</section></td><td><section>基于 JSON-RPC 2.0 规范</section></td></tr><tr><td><strong>状态管理</strong></td><td><section>无原生状态跟踪</section></td><td><section>内置任务 ID 和进度跟踪</section></td></tr></tbody></table>

功能特性
----

<table><thead><tr><th><strong>对比维度</strong></th><th><strong>Function Calling</strong></th><th><strong>MCP</strong></th></tr></thead><tbody><tr><td><strong>多工具组合</strong></td><td><section>需客户端手动编排</section></td><td><section>支持工具链式调用 (Workflow)</section></td></tr><tr><td><strong>长任务支持</strong></td><td><section>依赖轮询</section></td><td><section>原生 SSE 流式进度更新仅 OpenAI 模型</section></td></tr><tr><td><strong>版本兼容</strong></td><td><section>绑定模型版本</section></td><td><section>协议版本独立 (<code>MCP-1.0</code>)</section></td></tr><tr><td><strong>工具热更新</strong></td><td><section>需重新部署模型</section></td><td><section>服务端随时更新工具</section></td></tr><tr><td><strong>权限控制</strong></td><td><section>仅 API Key 基础认证</section></td><td><section>可扩展 OAuth2.0/ACL</section></td></tr></tbody></table>

生态支持
----

<table><thead><tr><th><strong>对比维度</strong></th><th><strong>Function Calling</strong></th><th><strong>MCP</strong></th></tr></thead><tbody><tr><td><strong>模型兼容性</strong></td><td><section>OpenAI 等模型</section></td><td><section>跨模型 (Claude/GPT / 本地 LLM 等)</section></td></tr><tr><td><strong>工具复用性</strong></td><td><section>无法跨平台共享</section></td><td><section>工具可发布到公共市场</section></td></tr><tr><td><strong>开发者生态</strong></td><td><section>OpenAI 专属</section></td><td><section>多厂商工具开发者社区</section></td></tr><tr><td><strong>监控指标</strong></td><td><section>基础用量统计</section></td><td><section>丰富的 Prometheus 指标</section></td></tr></tbody></table>

性能表现
----

<table><thead><tr><th><strong>对比维度</strong></th><th><strong>Function Calling</strong></th><th><strong>MCP</strong></th></tr></thead><tbody><tr><td><strong>简单调用延迟</strong></td><td><section>200-300ms</section></td><td><section>300-500ms (含协议开销)</section></td></tr><tr><td><strong>流式响应速度</strong></td><td><section>不支持</section></td><td><section>50-100ms / 消息</section></td></tr><tr><td><strong>并发能力</strong></td><td><section>受限于模型配额</section></td><td><section>可水平扩展工具服务器</section></td></tr><tr><td><strong>缓存机制</strong></td><td><section>无内置缓存</section></td><td><section>支持响应缓存标注</section></td></tr></tbody></table>

适用场景建议
------

### 推荐使用 Function Calling ：

*   快速验证原型需求
    
*   仅需集成 2-3 个简单工具
    
*   已深度绑定 OpenAI 生态
    
*   工具调用耗时 < 3 秒
    

### 推荐使用 MCP ：

*   构建企业级工具平台
    
*   需要支持多种 LLM 模型
    
*   涉及长时间运行任务 (>5s)
    
*   要求工具热更新能力
    
*   需要细粒度权限控制
    

> **演进趋势**：行业正在从私有协议（如 Function Calling）向开放标准（如 MCP）迁移，类似从厂商专属 API 到 REST 标准的演进过程

MCP 通信协议整理
==========

目录
--

1.  MCP 协议概述
    
2.  通信方式
    
3.  消息协议
    
4.  相关协议详解
    

* * *

### 1. MCP 协议概述

MCP（Message Communication Protocol）是一种用于分布式系统和微服务架构的通信协议，旨在提供高效、可靠的消息传递和数据交换。MCP 协议支持多种通信方式，消息遵循 JSON-RPC 2.0 协议格式，适用于进程间通信、HTTP、SSE 和 WebSocket 等多种场景。

* * *

### 2. 通信方式

MCP 协议支持以下几种通信方式：

*   **进程间通信（IPC）：** 适用于同一主机上进程之间的消息传递，通常使用管道、共享内存或消息队列。
    
*   **HTTP 协议：** 基于请求 - 响应机制，适用于前后端交互和 RESTful API 调用。
    
*   **SSE（Server-Sent Events）：** 服务器单向推送协议，适用于实时更新和消息通知。
    
*   **WebSocket 协议：** 全双工通信协议，支持实时双向数据传输。
    

* * *

### 3. 消息协议

MCP 协议的消息格式遵循 **JSON-RPC 2.0** 标准，消息为 JSON 格式，具有以下特点：

*   基于 JSON 格式，轻量、易解析。
    
*   支持请求、响应和通知机制。
    
*   具备无状态和异步调用特性。
    

**示例消息格式：**

```
{  "jsonrpc": "2.0",  "method": "subtract",  "params": [42, 23],  "id": 1}
```

**响应格式：**

```
{  "jsonrpc": "2.0",  "result": 19,  "id": 1}
```

* * *

### 4. 相关协议详解

#### JSON-RPC 2.0 协议

*   轻量级远程过程调用协议，基于 JSON 数据格式。
    
*   适用于 HTTP、WebSocket 或 TCP 传输。
    
*   支持批处理和通知机制。
    

#### SSE（Server-Sent Events）协议

*   基于 HTTP 协议的单向推送机制。
    
*   服务器实时向客户端推送更新。
    
*   常用于实时数据流和通知场景。
    

#### WebSocket 协议

*   实时双向通信协议，基于 TCP 连接。
    
*   低延迟，适用于聊天应用和实时监控。
    

#### HTTP 协议

*   经典请求 - 响应机制，适合 REST API。
    
*   常用于 Web 应用前后端交互。
    

#### gRPC 协议

*   高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers。
    
*   适合微服务和实时数据传输。
    

#### MQTT 协议

*   轻量级发布 / 订阅协议，适用于物联网（IoT）。
    
*   支持低带宽和高效消息推送。
    

* * *

以上是 MCP 协议相关的通信方式和消息协议介绍。

### 1.3 MCP 现状速览

<table><thead><tr><th><section>厂商</section></th><th><section>支持情况</section></th><th><section>最新动态（2024）</section></th></tr></thead><tbody><tr><td><section>OpenAI</section></td><td><section>通过 Function Calling 兼容</section></td><td><section>正在测试原生 MCP 支持</section></td></tr><tr><td><section>Anthropic</section></td><td><section>原生集成</section></td><td><section>Claude 3 默认启用 MCP 工具市场</section></td></tr><tr><td><section>微软</section></td><td><section>Azure API 网关支持</section></td><td><section>提供 MCP 工具安全认证服务</section></td></tr></tbody></table>

二、手把手遵循 MCP 实现一个需求
------------------

### 用户提问："对比特斯拉 (TSLA) 和英伟达 (NVDA) 过去三个月的股价波动，并给出投资组合建议"

### 实现思路

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3GPT1CHiaSVtgvicjEBZqk3c2eCInlsFUrSo9BvF7tDZWZaDmvyD9hxdVaP7kFfdpEcJ361HUDXjhAjxFbcVmpTA/640?wx_fmt=png&from=appmsg)image

```
sequenceDiagram    participant 用户    participant ChatGPT    participant MCP服务端    participant 金融数据API    用户->>ChatGPT: 输入查询请求    ChatGPT->>MCP服务端: 调用stockHistory工具    MCP服务端->>金融数据API: 获取TSLA历史数据    MCP服务端->>金融数据API: 获取NVDA历史数据    MCP服务端->>ChatGPT: 返回结构化数据    ChatGPT->>MCP服务端: 调用analyzeTrend工具    MCP服务端->>ChatGPT: 流式返回分析结果    ChatGPT->>用户: 生成自然语言报告
```

### 实现拆解

> server.js 和 client.js 的代码在下面

#### 工作流程

1.  **工具注册中心**  
    像超市货架一样陈列所有可用工具，每个工具包含：
    

*   功能描述（供模型理解用途）
    
*   执行逻辑（具体的代码实现）
    
*   流式支持标记（是否支持实时进度反馈）
    

3.  **两大核心接口**
    

*   `GET /discovery`：  
    模型通过此接口查看 "货架清单"，返回示例：
    
    ```
    {  "tools": ["stockPrice", "analyzeSales"],  "protocol": "MCP-1.0"}
    ```
    
*   `POST /execute`：  
    模型实际调用工具时的入口，处理过程：
    

1.  检查请求工具是否存在
    
2.  验证参数格式
    
3.  执行工具逻辑
    
4.  返回 JSON 或流式结果
    

6.  **流式响应原理**  
    对于耗时任务（如销售数据分析）：
    

*   创建`PassThrough`可读流
    
*   分阶段推送进度信息
    
*   保持连接直到任务完成
    

#### 典型应用场景

当用户询问 "特斯拉最近三个月销售趋势如何？" 时：

1.  模型发现需要调用`analyzeSales`工具
    
2.  通过 / execute 接口触发分析
    
3.  服务端持续返回：
    
    ```
    {"progress": 30, "stage": "数据加载中..."}{"progress": 80, "stage": "生成图表..."}{"result": {...}}
    ```
    

### 2.1 server.js

```
import express from 'express';import { EventEmitter } from 'events';const app = express();app.use(express.json());// 工具注册（严格遵循MCP工具描述规范）const tools = {  stock_price: {    description: "获取实时股票价格",    parameters: {      type: "object",      properties: {        symbol: { type: "string" }      },      required: ["symbol"]    },    handler: async ({ symbol }) => {      return { price: (Math.random() * 100).toFixed(2), symbol };    }  }};// MCP发现端点（必须实现）app.post('/mcp/discover', (req, res) => {  const response = {    jsonrpc: "2.0",    result: {      protocol_version: "1.0",      tools: Object.entries(tools).map(([name, def]) => ({        name,        description: def.description,        parameters: def.parameters      }))    },    id: req.body.id || null  };  res.json(response);});// MCP调用端点（严格遵循JSON-RPC 2.0）app.post('/mcp/invoke', async (req, res) => {  const { jsonrpc, method, params, id } = req.body;  // 校验JSON-RPC版本if (jsonrpc !== "2.0") {    return res.status(400).json({      jsonrpc: "2.0",      error: { code: -32600, message: "Invalid Request" },      id    });  }  // 解析工具名（method格式：tool.{name}）  const [, toolName] = method.split('.');  const tool = tools[toolName];if (!tool) {    return res.json({      jsonrpc: "2.0",      error: { code: -32601, message: "Method not found" },      id    });  }  // 执行工具调用  try {    const result = await tool.handler(params);    res.json({ jsonrpc: "2.0", result, id });  } catch (err) {    res.json({      jsonrpc: "2.0",      error: { code: -32603, message: err.message },      id    });  }});// SSE流式端点（MCP可选扩展）app.get('/mcp/stream/:taskId', (req, res) => {  res.setHeader('Content-Type', 'text/event-stream');  const { taskId } = req.params;  // 模拟流式进度let progress = 0;  const interval = setInterval(() => {    progress += 10;    res.write(`data: ${JSON.stringify({      jsonrpc: "2.0",      method: "progress_update",      params: { taskId, progress }    })}\n\n`);    if (progress >= 100) {      clearInterval(interval);      res.write(`data: ${JSON.stringify({        jsonrpc: "2.0",        method: "task_complete",        params: { taskId, result: "Done" }      })}\n\n`);      res.end();    }  }, 300);  req.on('close', () => clearInterval(interval));});app.listen(3000, () => {  console.log('MCP Server running at http://localhost:3000');});
```

### 2.2 client.js

```
import OpenAI from 'openai';import { EventSource } from 'eventsource';const openai = new OpenAI({ apiKey: 'your-api-key' });// MCP工具描述转换器function convertToOpenAITool(mcpTool) {return {    type: "function",    function: {      name: `tool.${mcpTool.name}`,      description: mcpTool.description,      parameters: mcpTool.parameters    }  };}// 获取MCP工具列表async functiongetMCPTools() {  const response = await fetch('http://localhost:3000/mcp/discover', {    method: 'POST',    headers: { 'Content-Type': 'application/json' },    body: JSON.stringify({ jsonrpc: "2.0", method: "discover", id: 1 })  });  const { result } = await response.json();return result.tools.map(convertToOpenAITool);}// 执行MCP调用async function callMCPTool(method, params) {  const response = await fetch('http://localhost:3000/mcp/invoke', {    method: 'POST',    headers: { 'Content-Type': 'application/json' },    body: JSON.stringify({      jsonrpc: "2.0",      method,      params,      id: Math.floor(Math.random() * 1000)    })  });return (await response.json()).result;}// 主对话流程async functionmain() {  // 1. 动态获取工具列表  const tools = await getMCPTools();  // 2. 发起对话请求  const chatCompletion = await openai.chat.completions.create({    model: "gpt-4-turbo",    messages: [{ role: "user", content: "AAPL当前股价是多少？" }],    tools  });  // 3. 处理工具调用  const toolCall = chatCompletion.choices[0].message.tool_calls?.[0];if (toolCall) {    const result = await callMCPTool(      toolCall.function.name,      JSON.parse(toolCall.function.arguments)    );    // 4. 将结果返回给OpenAI    const finalCompletion = await openai.chat.completions.create({      model: "gpt-4-turbo",      messages: [        { role: "user", content: "AAPL当前股价是多少？" },        chatCompletion.choices[0].message,        {          role: "tool",          name: toolCall.function.name,          content: JSON.stringify(result)        }      ]    });    console.log(finalCompletion.choices[0].message.content);  }}main();
```

### 性能优化技巧

#### 批处理工具调用：当多个工具需要并行调用时

```
const toolPromises = toolCalls.map(call =>   fetch(MCP_SERVER, {    method: 'POST',    body: JSON.stringify({      tool: call.function.name,      params: JSON.parse(call.function.arguments)    })  }));const toolResults = await Promise.all(toolPromises);
```

#### 缓存策略：对高频工具结果进行缓存

```
import { createClient } from 'redis';const redis = createClient();await redis.connect();const cachedResult = await redis.get(`tool:${toolName}:${paramsHash}`);if (cachedResult) return JSON.parse(cachedResult);// ...执行工具调用await redis.setEx(`tool:${toolName}:${paramsHash}`, 60, JSON.stringify(result));
```

MCP 的未来展望
---------

### 技术演进路线

*   多模态扩展（2025）
    
*   支持图像生成 / 识别工具
    
*   视频处理工具规范
    
*   去中心化网络等
    

```
mermaidgraph TB    A[模型] -->|MCP调用| B[工具市场]    B --> C[区块链结算]    B --> D[信誉评分]安全增强（2024-2025）硬件级隔离（Intel SGX）联邦学习支持
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3GPT1CHiaSVtgvicjEBZqk3c2eCInlsFUricibLmAzYApsL9Vib5kyRy4bFze5ibf2ehxLpV6EIH6dIPicSPBKpOzQeEw/640?wx_fmt=png&from=appmsg)image

开发者机遇
-----

*   工具变现：通过 MCP 工具商店获得分成收入
    
*   垂直领域深耕：金融 / 医疗 / 教育等专业工具开发
    
*   中间件服务：协议转换、流量管理、安全审计
    

> "MCP 将重塑 AI 开发生态——未来三年，80% 的 AI 应用将通过类似 MCP 的协议集成外部能力"

最后
--

*   欢迎大家点赞、收藏和转发，一起打破知识壁垒
    
*   关注 `前端巅峰` ，一起专注 AI，人工智能，传统互联网，区块链等前沿技术
    
*   `AI`大爆炸的时代已来，紧追时代的风口，顶峰见