> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zDzVAjUD9syIGB0PNeMFSg)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

在 Postman 里同一个接口 “飞快”，但放到网页里就 “很慢”。本质上是两类耗时叠加不同：

*   Postman 只覆盖 “发请求 → 后端处理 → 回包”。
    
*   浏览器页面除了这段，还要承担预检、认证、下载、解析、计算、渲染、第三方脚本等一堆额外成本。
    

接下来的内容我们将判断慢在哪里 → 常见原因 → 如何定位 → 对症优化” 来展示一个系统化排查思路。

先判定：慢在网络 / 后端，还是慢在前端 / 渲染？
--------------------------

我们可以先打开浏览器的 DevTools，在 Network 里查看请求的 Timing 阶段：如果 TTFB 明显偏大，多半是后端或网络延迟；如果 Content Download 阶段耗时长，往往是响应体太大、压缩缺失或带宽不足；而如果 Finish 时间远大于 TTFB 加 Download，则通常是前端在解析或渲染时耗时。

接着可以用 Performance 面板录制，若看到大量超过 50ms 的 Long Task 或主线程被 JS 占满，就说明是前端计算问题。

总结经验：Postman 调用接口快而页面加载慢，常见原因是浏览器额外开销，例如 CORS 预检、Cookie 过大、JS 计算和第三方脚本渲染，这类情况占大多数。

常见导致 “Postman 快、页面慢” 的 12 个具体原因
-------------------------------

在排查这类问题时，哪些因素最可能导致页面变慢？我根据经验把常见原因按出现频率和影响度排序，逐一展开说明，方便我们对比不同的情况。

### CORS 预检（OPTIONS）多一跳 RTT

浏览器跨域时，如果使用了自定义请求头或非简单 Content-Type，就会多出一次 OPTIONS 预检，增加一次 RTT。

解决方案是减少自定义头、改用 “简单请求”（`GET/HEAD/POST` + `application/x-www-form-urlencoded`/`multipart/form-data`/`text/plain`）、或在服务端加 `Access-Control-Max-Age` 缓存预检、同域反向代理。

### Cookie 过大（只在浏览器自动携带）

浏览器会自动携带域下所有 Cookie，请求头因此膨胀，每次请求都要上传无用数据，而 Postman 默认不带这些。

优化方案是精简 Cookie，缩小作用域（`Path`/ 子域），将非会话信息移到 Authorization 头。

### 前端一次性处理大 JSON

数 MB 的 JSON 在浏览器端需要 `JSON.parse`、拷贝和排序聚合，会阻塞主线程；Postman 并不负责渲染。

优化方案是分页或字段裁剪，采用流式 / 增量渲染，将重计算放入 Web Worker，并使用虚拟列表。

### 串行 / N+1 请求

前端把接口串行调用，或为每个列表项单独请求，容易放大延迟。

优化方案是请求并行化，使用批量接口或后端聚合，减少瀑布式请求。

### 第三方脚本 / SDK 阻塞

埋点、广告、地图、可视化库等同步或大体积脚本会占用主线程和网络。

优化方案是脚本使用 `defer`/`async`，按需或懒加载，合理拆分和延迟非关键模块。

### 未压缩或压缩失配

响应缺少 gzip/br 压缩，或代理配置错误导致压缩失效，会拖慢下载速度。

优化方案是开启 gzip/br 压缩，确认浏览器 `Accept-Encoding` 与响应头配置一致。

### 缓存策略不当

如果响应携带 `Cache-Control: no-store`，就会每次都打后端；Service Worker 缓存策略错误也可能拖慢加载。

优化方案是合理使用 `ETag/If-None-Match`、`max-age`、`stale-while-revalidate`，必要时重置或暂时注销 Service Worker。

### 环境 / 路由差异

浏览器请求可能经过 CDN、网关或公司代理，而 Postman 是直连；或者 baseURL、DNS 不一致。

优化方案是比对请求目标地址、Host、Via/X-Forwarded-For 头，检查 DNS 与代理配置。

### HTTP/2/3 未启用或连接竞争

使用 HTTP/1.1 时，多请求会遇到队头阻塞，导致加载变慢。

优化方案是启用 HTTP/2/3，在关键域名上增加 `&lt;link rel="preconnect"&gt;` 提前建立连接。

### 前端状态管理与渲染策略

频繁 `setState`、低效 diff、大表格无虚拟化，或渲染阶段做复杂计算都会拖慢页面。

优化方案是使用 memoization、批量更新、虚拟滚动，将计算逻辑移出渲染。

### 错误重试 / 超时

请求失败后隐式重试，或超时阈值过大，也会延长整体耗时。

优化方案是在 Network 面板确认是否有重复请求，调整重试与超时策略。

### 资源型瓶颈（图片 / 字体 / 视频）

图片原图过大、无懒加载，或字体阻塞渲染，都会造成首屏卡顿。

优化方案是压缩和多尺寸适配，使用 WebP/AVIF 格式，`loading="lazy"` 懒加载，字体加 `display=swap`，关键资源用 `preload`。

如何定位问题
------

### 用 curl 对比请求耗时

在 DevTools Network 面板里找到目标请求，选择 “Copy as cURL”，然后在终端里执行并统计各阶段耗时：

```
curl 'https://juejin.cn/post/7538806888806481961' \
  -H 'Authorization: Bearer xxx' \
  -H 'Content-Type: application/json' \
  -w '\nDNS:%{time_namelookup} TCP:%{time_connect} TLS:%{time_appconnect} \
TTFB:%{time_starttransfer} TOTAL:%{time_total}\n' \
  -o /dev/null -s



```

通过对比 curl 的结果和 Postman 的表现，可以快速判断瓶颈位置：

*   如果 curl 的 TTFB/TOTAL 和 Postman 一样很快，而页面依然慢，大概率问题出在 前端解析或浏览器特有开销。
    
*   如果 curl 本身也慢，那就说明延迟来自 后端处理或网络链路。
    

### 最小可复现页：剔除 UI 干扰

在排查页面性能时，可以先搭建一个最小可复现页，只做一次请求并把结果简单输出，用来测量 `fetch`、`JSON.parse` 和渲染三个阶段的耗时：

```
<!DOCTYPE html>
<meta charset="utf-8" />
<body>
  <script>
    const url = "https://api.example.com/xxx";

    console.time("fetch");
    fetch(url, { credentials: "include" }) // 若依赖 Cookie，记得加 include
      .then((r) => {
        console.timeEnd("fetch");
        console.time("json");
        return r.json();
      })
      .then((data) => {
        console.timeEnd("json");
        console.time("render");
        const pre = document.createElement("pre");
        pre.textContent = JSON.stringify(data.slice?.(0, 50) ?? data, null, 2);
        document.body.appendChild(pre);
        console.timeEnd("render");
      })
      .catch((e) =>console.error(e));
  </script>
</body>


```

通过这种方式，可以快速判断问题属于哪一类：

*   `fetch` 慢 → 网络、后端延迟，或预检请求 / 请求头过大。
    
*   `json` 慢 → 数据体积过大或结构复杂，解析开销高。
    
*   `render` 慢 → UI 渲染或 DOM 操作成为瓶颈。
    

### 观察长任务（前端计算 / 阻塞）

在浏览器里，可以利用 `PerformanceObserver` 来捕捉 长任务（Long Task）。长任务通常是指执行时间超过 50ms 的 JavaScript 代码片段，它们会阻塞主线程，直接导致页面卡顿或交互延迟。

示例代码：

```
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    console.log("Long Task:", e.duration.toFixed(1), "ms", e);
  }
}).observe({ entryTypes: ["longtask"] });

</body>


```

通过这段脚本，你可以在控制台里实时看到哪些操作耗时过长，从而判断瓶颈是否在前端计算逻辑（例如 JSON 解析、复杂循环、DOM 操作或第三方库执行）。

### 检查是否触发 CORS 预检

在 Network 面板中查看请求是否多出了一条 OPTIONS 请求，如果有，就说明触发了 CORS 预检。此时要确认响应里是否正确返回并允许缓存，例如：

```
Access-Control-Allow-Origin: https://your.site
Access-Control-Allow-Headers: Authorization, Content-Type, ...
Access-Control-Allow-Methods: GET, POST, ...
Access-Control-Max-Age: 86400



```

如果 `Access-Control-Max-Age` 缺失或过小，浏览器会频繁重复预检，从而增加延迟。

### 对比请求头（Postman vs 浏览器）

很多情况下，Postman 请求快而页面请求慢，差异就藏在请求头里。重点检查以下字段：

*   Origin：是否跨域触发预检。
    
*   Cookie：浏览器会自动带，Postman 默认不带。
    
*   Authorization：身份验证方式是否一致。
    
*   Accept / Accept-Encoding：是否导致返回内容差异（如压缩失效）。
    
*   Content-Type / 自定义头：是否触发预检。
    
*   User-Agent：部分网关会针对不同 UA 做限流或鉴权策略。
    

### Service Worker 与缓存策略

如果页面使用了 Service Worker，它可能会带来额外的缓存逻辑或回源延迟。排查步骤：

1.  在 Application 面板里先尝试 _Unregister_ 掉 Service Worker，再测试一次请求耗时。
    
2.  对比关键响应头：
    
    ```
    *   Cache-Control：是否合理缓存。
    
    
    ```
    

*   ETag / If-None-Match：是否命中缓存。
    
*   Vary：是否导致缓存错失。
    
*   Content-Encoding：是否启用了 gzip/br 压缩。
    
*   Server-Timing：是否能看到服务端各阶段耗时。
    

对症优化清单（按层次）
-----------

### 网络 / 协议 / CDN

在网络和协议层面，首先要确保启用了 HTTP/2 或 HTTP/3 以及 TLS 会话复用，这样可以减少连接建立和队头阻塞带来的延迟。对于关键的接口域名，可以提前建连，例如在页面里加上：

```
<link rel="preconnect" href="https://api.example.com" />


```

同时，要开启 gzip 或 br 压缩，并确认中间的代理不会剥离压缩，否则大响应体会严重拖慢下载。最后，合理利用 CDN 就近与缓存策略，例如：

```
Cache-Control: public, max-age=600, stale-while-revalidate=60


```

这样浏览器就能优先使用本地或边缘缓存，大大减少重复请求和等待时间。

### CORS / 请求形态

在跨域请求时，如果带了自定义请求头或者使用了不属于 “简单请求” 的 Content-Type，就会触发 预检请求（OPTIONS），额外增加一次 RTT。能避免的情况下，应尽量使用“简单请求”，比如：

```
fetch("https://api.example.com/data", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: "id=123&,
});



```

如果业务确实需要复杂头部，也要在服务端配置合理的 `Access-Control-Max-Age`，让浏览器缓存预检结果，减少重复开销：

```
Access-Control-Allow-Origin: https://your.site
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400


```

此外，避免请求头里自动携带大量 Cookie，认证信息建议放到 Authorization 头中，例如：

```
Authorization: Bearer <token>


```

这样能显著降低请求体积和重复传输。

### API 设计

接口本身的设计也直接影响性能。如果一次接口返回数 MB 的 JSON，前端解析必然会卡顿。最佳实践是分页、字段裁剪，只返回必要数据。例如：

```
GET /api/orders?page=1&pageSize=20&fields=id,price,status



```

对于多请求场景，可以通过 批量接口 来避免 N+1 的问题：

```
POST /api/orders/batch
{
  "ids": [1001, 1002, 1003]
}


```

同时，建议在响应头里加上 `Server-Timing`，这样可以直观看到后端每个阶段的耗时，方便端到端定位：

```
Server-Timing: db;dur=53, cache;desc="hit", app;dur=120


```

### 前端实现

在前端层面，最常见的性能问题就是资源阻塞和渲染开销过大。例如大型组件或第三方库（如地图、可视化框架）不应在首屏同步加载，而是采用 懒加载：

```
import("echarts").then((echarts) => {
  // 按需加载使用
});



```

对于复杂计算，如排序、聚合或格式化数据，应放到 Web Worker 里执行，避免阻塞主线程：

```
const worker = new Worker("worker.js");
worker.postMessage(largeData);
worker.onmessage = (e) => render(e.data);



```

渲染层面，大量数据列表要用 虚拟滚动，避免一次性绘制成千上万条 DOM 节点。比如 React 可以用 `react-window` 来优化。与此同时，可以用 骨架屏 或占位符来提升用户的感知速度：

```
<div class="skeleton-card"></div>


```

最后，不要滥用深拷贝，比如 `JSON.parse(JSON.stringify(...))`，这种写法对大对象会带来严重性能问题，应使用更轻量的对象拷贝方式。

总结
--

排查接口在页面加载慢的问题，可以先看 TTFB 和 Download 阶段：TTFB 高多半是后端或网络瓶颈，Download 高则可能是响应体过大或压缩缺失。若两者都正常但页面依旧卡顿，则通常是前端解析、渲染或第三方脚本拖慢了速度。

除此之外，还要留意 CORS 预检、请求头膨胀（Cookie、自定义头） 以及 Service Worker 缓存逻辑，这些都是浏览器特有的额外开销。整体来说，Postman 快而页面慢，大多数情况都能归因到这些环节。

> 作者：Moment
> 
> 链接：
> 
> https://juejin.cn/post/7539817416609382427

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```