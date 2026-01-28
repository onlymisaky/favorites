> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/5wnWmR7XJQ_fqkeJ2a0_uw)

01 背景
-----

### 被忽视的 “隐形时间杀手”

在现代互联网企业的软件交付链路中，我们往往过于关注架构的复杂度、算法的优劣、页面的渲染性能（FCP/LCP），却极容易忽视那些夹杂在开发流程缝隙中的 “微小损耗”。

这就好比一辆 F1 赛车，引擎再强劲，如果进站换胎的时间由于螺丝刀不顺手而慢了 2 秒，最终的比赛结果可能就是天壤之别。对于前端开发者而言，“埋点校验” 就是那个不顺手的螺丝刀。

让我们还原一个极其真实的场景，这个场景可能每天都在成千上万个工位上发生： 你需要开发一个电商大促的落地页。需求文档里不仅有复杂的 UI 交互，还密密麻麻地列出了 50 个埋点需求：

*   “Banner 曝光上报”
    
*   “商品卡片点击上报，需携带 SKU、SPU、RankId”
    
*   “商品列表曝光、弹窗点击曝光、展示曝光上报等”
    
*   “用户滚动深度上报”
    
*   ……
    

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdazADfLmS0KCEYzy4HicrsF0HwEnk1C9RCWA8HsFiarRnRpSZNJEJDdicpA/640?wx_fmt=png&from=appmsg#imgIndex=0) 日常埋点需求

当你熬夜写完业务代码，准备提测前，你必须确保这 50 个埋点一个不错。因为在数据驱动的逻辑下，代码跑通只是及格，数据对齐才是满分。* 如果埋点错了，运营拿到的数据就是不实的，后续的所有转化分析、漏斗模型都将建立在虚假的基石之上。

### 开发者的一百种 “崩溃”

于是，你开始了痛苦的校验流程。 你熟练地按下 F12，打开 Chrome DevTools，切换到 Network 面板。 你刷新页面，看着 Waterfall 瀑布流瞬间涌出几百个请求。 图片、JS、CSS、字体文件、XHR 接口、WebSocket 心跳…… 它们混杂在一起。你眯着眼睛，试图在其中找到那几个 `gif` 请求或者 `sendBeacon` 调用。

**崩溃瞬间 A：大海捞针** 你输入了过滤关键词 `lego` 或者 `mark-p`。列表变少了，但依然有几十个。你必须一个一个点开，查看 Headers，查看 Payload。Payload 可能是压缩过的 JSON 字符串，你得复制出来，打开一个新的 Tab，访问 `JSON.cn`，粘贴，格式化，然后肉眼比对 `section_id` 是不是 `10086`。

![](https://mmbiz.qpic.cn/mmbiz_gif/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDda1sLuGwKn39wHuBibHAU1pvCojGfycBicaqCzMjf9XM4CicjU2NAMO7Y9Q/640?wx_fmt=gif&from=appmsg#imgIndex=1)Network 面板

**崩溃瞬间 B：稍纵即逝** 你需要验证 “点击跳转” 的埋点。你清空了 Network，点击了按钮。页面跳转了。 就在跳转的一瞬间，你看到了埋点请求闪了一下。但是，随着新页面的加载，Network 面板被瞬间清空（除非你记得勾选 Preserve log，但即使勾选了，新页面的请求也会迅速把旧请求淹没）。 你不得不重新来过，把手速练得像电竞选手一样，试图在跳转前的那几百毫秒内截获数据。

![](https://mmbiz.qpic.cn/mmbiz_gif/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaxSTx0HT3ibIxDy7ZzZOCL2NF1StfVJsAHrxvfdhLuNptvl3cmJykAeQ/640?wx_fmt=gif&from=appmsg#imgIndex=2)跳转页面后数据无法持久化

**崩溃瞬间 C：参数黑盒** 产品经理跑过来问：“为什么这个字段是空的？” 你看着那堆乱码一样的编码参数，心里只有一句话：我怎么知道它是原本就空，还是传输过程丢了？

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdanR0lD3pHnRLF0QBvglSor9LmAvGFf7bXTU8ib99oSjUsTkib2yO04bHw/640?wx_fmt=png&from=appmsg#imgIndex=3)背景痛点

### 问题的本质：认知负荷过载

根据我们的内部效能统计，一个资深前端开发在处理 “埋点自测” 这一环节时，平均每个埋点需要消耗 3 到 5 分钟。这不仅是时间的浪费，更是认知资源（Cognitive Resources）的剧烈消耗。 每一次切换窗口、每一次复制粘贴、每一次在混乱的列表中聚焦眼神，都在打断开发者的“心流”（Flow）。当你从 JSON 格式化网站切回 IDE 时，你可能已经忘了刚才想改的那行代码在哪里。

这就是我们启动 zzChromeTools 项目的初衷。我们不是为了造轮子而造轮子，而是为了把开发者从低效的、重复的、高认知负荷的劳动中解放出来。

02 现状
-----

在决定开发自研工具之前，我们必须回答一个问题：市面上已有的工具，真的不够用吗？

我们对业内主流的网络调试方案进行了深度调研，包括浏览器原生工具、代理抓包工具以及第三方插件。结论是：它们都很强大，但在 “埋点校验” 这个垂直细分领域，它们都存在着严重的“信噪比”（Signal-to-Noise Ratio）过低的问题。

### Chrome DevTools Network 面板：全能选手的软肋

Chrome 的 Network 面板是所有前端开发者的 “母语”。它的优势在于原生、零成本、信息全。 但“信息全” 恰恰是它的软肋。

*   无差别对待： 它平等地展示每一个 HTTP 请求。对于浏览器来说，加载一张图片和上报一条埋点数据，本质上没有区别。但在业务逻辑上，埋点数据的重要性远高于静态资源。在 Network 面板中，核心信号（埋点）被海量的噪音（静态资源）淹没了。
    
*   缺乏语义化： Network 面板只展示 HTTP 协议层面的信息（Status, Type, Size）。它不懂你的业务。它不知道 `section_id` 是什么，它无法帮你高亮显示 “错误的参数”。
    
*   上下文易失： 虽然有 Preserve log，但在多页面跳转、SPA 路由切换的复杂场景下，日志的管理依然非常混乱。
    

### Charles / Fiddler / Whistle：重型武器的杀鸡用牛刀

Charles、Fiddler 以及 Whistle 是抓包界的神器。它们支持强大的断点、重写、HTTPS 解密。 但是，用它们来查埋点，太重了。

*   配置成本高： 你需要安装证书、配置系统代理、设置手机 WiFi 代理。对于仅仅想在 PC 浏览器上快速看一眼埋点的场景，这个启动成本太高。
    
*   数据隔离差： 开启系统代理后，你电脑上所有软件的网络请求（QQ、微信、系统更新）都会涌入 Charles。你依然需要花费大量精力去写 Include/Exclude 规则来过滤。
    
*   视觉交互差： 它们的 JSON 解析能力虽然有，但往往也是通用的树状结构，无法针对特定的埋点字段进行定制化展示。
    

### 现有的埋点插件（OmniBug 等）

市面上也有一些优秀的埋点插件，如 OmniBug。它们确实解决了部分问题。 但它们的局限性在于：

*   适配性问题： 往往只适配 Adobe Analytics、Google Analytics 等国际通用标准。对于国内大厂自研的埋点 SDK（往往有自定义的加密协议、特殊的字段结构），它们无能为力。
    
*   功能单一： 仅仅展示数据，缺乏与本地开发环境的联动（如 Whistle 代理控制）。
    

**总结：** 现有的工具链存在一个巨大的真空地带。 我们需要一款轻量级（无需配置代理）、定制化（懂内部业务逻辑）、高信噪比（自动降噪）且持久化（不怕页面刷新）的浏览器扩展。 这就是 zzChromeTools 的定位。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaDf9HLmfIp4ibfic3AmMcZDRcBEX1tfwO61aDX9CWVosefKkaLyPS7uyA/640?wx_fmt=png&from=appmsg#imgIndex=4)多渠道优点对比

03 难点
-----

当我们立项并准备动手开发时，恰逢 Chrome 扩展生态迎来了一次史无前例的 “大地震”——Manifest V3 (MV3) 的强制推行。

如果您关注过浏览器技术，就会知道，Google 宣布在 2024 年逐步停止对 Manifest V2 (MV2) 的支持。这意味着，我们开发的新工具必须，也只能基于 MV3 架构。

从 MV2 到 MV3，不是简单的版本号 +1，而是底层安全模型和进程模型的范式转移（Paradigm Shift）。对于插件开发者来说，这简直是一场 “灾难” 般的挑战。

### 难点一：“隔离世界” 的铁壁铜墙

在浏览器扩展的架构中，存在一个核心概念叫 “隔离世界”（Isolated World）。

*   页面脚本（Page Script）： 也就是你的业务代码，运行在主世界（Main World）。
    
*   内容脚本（Content Script）： 插件注入到页面的代码，运行在隔离世界。
    

在 MV2 时代，虽然两者 JS 环境隔离，但 Content Script 对 DOM 的访问权限非常大，且通过简单的 `<script>` 标签注入就能轻松打破隔离，直接访问页面全局变量。

但在 MV3 中，Google 为了安全（防止插件窃取用户数据），极大地收紧了权限。 我们的需求是：拦截页面发出的 `navigator.sendBeacon` 请求。 业务代码调用的是 `window.navigator.sendBeacon`。如果我们只是在 Content Script 里重写这个函数，是完全没用的。因为业务代码运行在主世界，它看不到隔离世界的修改。 如何合法地、安全地穿透这层 “次元壁”，去监听主世界的 API 调用？ 这是第一个技术拦路虎。

### 难点二：Service Worker 的 “嗜睡症”

MV3 做出的最大改变，就是移除了 MV2 中常驻后台的 `Background Page`，取而代之的是 `Service Worker`。

*   Background Page (MV2)： 就像一个 7x24 小时运行的后台服务器。你可以在里面存变量，它永远都在。
    
*   Service Worker (MV3)： 它是瞬态（Ephemeral）的。它是事件驱动的。当没有事件发生时（比如几分钟没操作），浏览器会强制杀掉这个 Service Worker 进程以节省内存。
    

这意味着什么？ 这意味着如果你在 Background 里用一个全局变量 `let logs = []` 来存埋点数据，只要你去上个厕所回来，Service Worker 可能就重启了，你的数据全丢了！ 对于一个需要长时间记录日志的工具来说，这种 “健忘” 的特性是致命的。如何在一个无状态的、随时可能死亡的进程中保持数据的连续性？这是第二个难点。

### 难点三：通信链路的迷宫

数据产生在页面（Page），拦截在脚本（Script），处理在后台（Service Worker），展示在面板（DevTools Panel）。 这就涉及到了 4 个完全独立的上下文 之间的通信。 MV3 废除了很多阻塞式的 API，强制使用异步通信。 特别是 `Service Worker` 到 `DevTools Panel` 的通信。由于 Service Worker 是被动的，而 DevTools 是用户主动查看的，如何建立一个高效的、低延迟的管道？ 传统的 `chrome.runtime.connect` 长连接在 MV3 的 Service Worker 中变得非常脆弱（容易断连）。

面对这些由 MV3 带来的 “降维打击”，我们没有退路，只能在架构设计上进行深度突围。

04 业内方案
-------

在详细介绍我们的方案之前，有必要看看针对类似问题，业内同行们通常是如何解决的，以及为什么我们没有采用这些方案。

### 方案 A：`declarativeNetRequest` (DNR)

MV3 引入了 `declarativeNetRequest` API，旨在取代 MV2 强大的 `webRequest` API（这也是广告拦截插件最受伤的地方）。

*   **原理：** 通过配置 JSON 规则，告诉浏览器 “阻断” 或“修改”某些请求。
    
*   **优点：** 性能好，隐私安全。
    
*   **缺点：****能力太弱。** DNR 主要用于拦截和修改 Headers，它**无法读取请求体（Request Body）**。 对于埋点校验来说，最重要的就是 Payload（埋点参数）。如果读不到 Body，这个方案就毫无意义。所以，DNR 方案 PASS。
    

### 方案 B：重写 XHR / Fetch 原型

这是传统的 “Hook” 方案。

*   **原理：** 劫持 `XMLHttpRequest.prototype.open` 和 `window.fetch`。
    
*   **缺点：**
    

1.  **覆盖不全：** 现代埋点 SDK 大多使用 `navigator.sendBeacon` 进行上报，因为它在页面卸载时更可靠。劫持 XHR/Fetch 无法捕获 Beacon 请求。
    
2.  **侵入性风险：** 如果处理不好，容易破坏原有的业务逻辑，甚至导致死循环。
    

### 方案 C：Debugger Protocol

*   **原理：** 使用 `chrome.debugger` API，像 DevTools 一样 attach 到页面上。
    
*   **优点：** 权限极大，可以看到一切网络请求。
    
*   **缺点：****用户体验极差。** 当插件 attach debugger 时，浏览器顶部会出现一个黄色的警告条：“xxx 插件正在调试此浏览器”，这会给用户带来极大的不安全感。而且，一个页面只能被一个 debugger attach，这会与真正的 DevTools 冲突。
    

**综上所述：** 现有的标准 API 要么拿不到数据（DNR），要么体验太差（Debugger）。我们必须寻找一条 “少有人走的路”——**基于主世界注入的 AOP 旁路捕获模式**。

05 我的方案
-------

本章节将深入代码细节，为您展示 **zzChromeTools** 的核心架构。我们将整个系统拆解为三个核心模块：**主世界注入模块**、**旁路通信模块**、**数据持久化模块**。

### 架构总览

我们的核心设计思想是：**“特洛伊木马”**。 既然外部拦截困难，那我们就进入内部。通过 MV3 的新特性，将一段经过精心设计的 “探针代码” 直接投放到页面的 JS 引擎中，在数据发出的源头进行截获，然后通过安全的隧道传输出去。

整体架构如下图所示：

```
┌─────────────────────────────────────────────────────────────────┐│  页面主世界 (Main World)                                          ││  ┌─────────────────────────────────────────────────────────────┐││  │ navigator.sendBeacon (被 Hook)                               │││  │         ↓                                                    │││  │ window.postMessage({ source: "my-ext-beacon", url, data })  │││  └─────────────────────────────────────────────────────────────┘│└─────────────────────────────────────────────────────────────────┘                              ↓ postMessage┌─────────────────────────────────────────────────────────────────┐│  Content Script (隔离世界) - mark-p.ts                           ││  ┌─────────────────────────────────────────────────────────────┐││  │ window.addEventListener("message", ...)                      │││  │ 过滤 source === "my-ext-beacon"                              │││  │ 解析数据 → 组装 PingRecord                                    │││  │         ↓                                                    │││  │ sendToBackground({ name: "store-record", body: record })    │││  └─────────────────────────────────────────────────────────────┘│└─────────────────────────────────────────────────────────────────┘                              ↓ Plasmo Messaging┌─────────────────────────────────────────────────────────────────┐│  Background Service Worker                                       ││  ┌─────────────────────────────────────────────────────────────┐││  │ messages/store-record.ts  → pingRecords.unshift(record)     │││  │ messages/get-records.ts   → res.send(pingRecords)           │││  │                                                              │││  │ pingRecords: PingRecord[] (内存数组)                         │││  └─────────────────────────────────────────────────────────────┘│└─────────────────────────────────────────────────────────────────┘                              ↑ 每 800ms 轮询┌─────────────────────────────────────────────────────────────────┐│  DevTools Panel - SpmTools/index.tsx                             ││  ┌─────────────────────────────────────────────────────────────┐││  │ setInterval(fetchRecords, 800)                               │││  │ sendToBackground({ name: "get-records" })                    │││  │         ↓                                                    │││  │ Ant Design Table 渲染数据                                    │││  └─────────────────────────────────────────────────────────────┘│└─────────────────────────────────────────────────────────────────┘
```

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaobhCjWeLgM8JBN6VYxv9gLr6fmPsyG5utdRicvO8yWkOrWBfQxq8WHw/640?wx_fmt=png&from=appmsg#imgIndex=5)整体架构![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdar3whVCMgDLjwGKbUONSJ3YibxcAx9FKuREkVnFmLXUGGcQMlQG23UtQ/640?wx_fmt=png&from=appmsg#imgIndex=6)时序图

### 核心突破：`world: 'MAIN'` 的妙用

在 MV3 中，`chrome.scripting.executeScript` API 增加了一个不起眼但至关重要的属性：`world`。 通过设置 `world: 'MAIN'`，我们可以合法地打破 Content Script 与 Page Script 之间的隔离。

**代码实战：** 在 `background/index.ts` 中，我们监听页面的加载，并注入脚本：

```
// src/background/index.ts/** * 这段函数将被注入到"主世界"执行。 * 只能写成纯函数形式，或外联文件：此处内联更简单。 */function overrideSendBeaconInMain() {const originalSendBeacon = navigator.sendBeacon  navigator.sendBeacon = function (url, data) {    if (      typeof url === "string" &&      url.includes("lego.example.com/page/mark-p")  // 埋点上报域名    ) {      // 把埋点请求的 url、data 通过 window.postMessage 抛给页面      window.postMessage({ source: "my-ext-beacon", url, data }, "*")    }    return originalSendBeacon.apply(this, arguments)  }// 标记监控状态，供 DevTools 检测window.__is_spm_monitor_open__ = true}/** * 注入脚本到指定 tab 的主世界 */asyncfunction injectSendBeaconOverride(tabId: number) {console.log("[BG] Injecting overrideSendBeaconInMain into tab =>", tabId)try {    await chrome.scripting.executeScript({      target: { tabId },      world: "MAIN",  // 核心魔法：指定代码在主世界执行      func: overrideSendBeaconInMain    })  } catch (err) {    console.error("[BG] Failed to inject script =>", err)  }}
```

这段代码的价值在于，它利用了 MV3 的官方能力，无需像 MV2 那样往 DOM 里插入丑陋的 `<script>` 标签，既干净又隐蔽。

### 注入时机控制：在页面 JS 执行前完成拦截

注入时机至关重要。如果注入太晚，页面的埋点 SDK 可能已经缓存了原生 `sendBeacon` 的引用，我们的 Hook 就无法生效。

```
// src/background/index.ts// 监听 tab 更新，在 loading 状态时注入chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {// 如果没有 URL，直接跳过if (!tab.url) return// 只针对特定站点const isTargetSite = tab.url.includes("example.com")// 如果是进入 loading 状态 且是我们目标站点if (changeInfo.status === "loading" && isTargetSite) {    // 根据配置决定是否自动清空历史数据    if (baseConfig.baseConfig.automaticallyEmpty) {      pingRecords.splice(0, pingRecords.length)    }    // 根据配置决定注入策略    if (baseConfig.baseConfig.alwaysInjectedOnRefresh) {      // 始终注入模式      await injectSendBeaconOverride(tabId)    } elseif (baseConfig.baseConfig.injectSpmScriptOnNextRefresh) {      // 仅下一次刷新时注入      await injectSendBeaconOverride(tabId)      baseConfig.baseConfig.injectSpmScriptOnNextRefresh = false    }  }})
```

**技术要点解析：**

1.  **loading 状态注入**：`changeInfo.status === "loading"` 确保我们在页面 JS 执行前完成注入
    
2.  **灵活的注入策略**：支持 "始终注入" 和 "下次刷新注入" 两种模式
    
3.  **自动清空选项**：可配置每次刷新时自动清空历史埋点数据
    

### 核心逻辑：AOP 旁路捕获（Bypass Capture）

注入成功后，`spyOnSendBeacon` 函数会在页面上下文中执行。这里我们使用了 AOP（面向切面编程）的思想。

我们不修改业务逻辑，只是在业务逻辑执行的 “切面” 上插了一根管子。

**关键安全原则：**

1.  **保存原生引用**：防止死循环
    
2.  **透传返回值**：`sendBeacon` 返回 `boolean` 表示是否入队成功，必须正确返回
    
3.  **使用 `apply` 保持 this 指向**：确保原生方法正常工作 **
    

```
function overrideSendBeaconInMain() {  const originalSendBeacon = navigator.sendBeacon  navigator.sendBeacon = function (url, data) {    if (typeof url === "string" && url.includes("lego.example.com/page/mark-p")) {      window.postMessage({ source: "my-ext-beacon", url, data }, "*")    }    // 必须使用 apply 保持 this 指向，并返回原函数的执行结果    return originalSendBeacon.apply(this, arguments)  }}
```

### 通信隧道：跨越四层维度的接力

数据被捕获后，需要经历一场 “长征” 才能到达开发者眼前的面板。

#### Step 1: Main World -> Content Script (postMessage)

Content Script 运行在隔离世界，但可以监听主世界发出的 `postMessage`：

```
// src/contents/mark-p.tsimport type { PlasmoCSConfig } from"plasmo"import { v4 } from"uuid"import { sendToBackground } from"@plasmohq/messaging"// Plasmo 配置：在所有页面上运行，尽早注入exportconst config: PlasmoCSConfig = {matches: ["<all_urls>"],run_at: "document_start"// 避免 "runtime not available" 错误// 缺省 world => "ISOLATED"（隔离世界）}// 定义埋点数据结构interface PingRecord {id: stringtime: stringpagetype: stringactiontype: stringsectionId: stringsortId: stringsortName: stringfullData: any}// 监听 window.postMessagewindow.addEventListener("message", (ev) => {// 严格校验 source，防止恶意网页伪造数据if (!ev.data || ev.data.source !== "my-ext-beacon") {    return  }const { url, data } = ev.data// 解析 data（可能是 JSON 字符串）let parsedBody: anytry {    parsedBody = JSON.parse(typeof data === "string" ? data : "")  } catch {    parsedBody = data  }// 组装一个 PingRecord，提取关键业务字段const newRecord: PingRecord = {    id: v4(),  // 使用 UUID 保证唯一性    time: newDate().toLocaleTimeString(),    pagetype: parsedBody?.pagetype || "",    actiontype: parsedBody?.actiontype || "",    sectionId: parsedBody?.backup?.sectionId || "",    sortId: parsedBody?.backup?.sortId || "",    sortName: parsedBody?.backup?.sortName || "",    fullData: parsedBody  // 保留完整数据供调试  }// 把记录发给 background  sendToBackground({    name: "store-record",    body: newRecord  })})
```

#### Step 2: Content Script -> Service Worker (Plasmo Messaging)

我们使用 Plasmo 框架提供的消息系统，它封装了 `chrome.runtime.sendMessage` 并提供了更好的类型支持：

```
// src/background/messages/store-record.tsimporttype { PlasmoMessaging } from"@plasmohq/messaging"import { pingRecords, type PingRecord } from"../pingRecord"/** 接收 content-script 发送过来的新埋点，把它存进 pingRecords */const handler: PlasmoMessaging.MessageHandler = async (req, res) => {const newRecord = req.body as PingRecord// 支持清空操作if (req.body === "clear") {    pingRecords.splice(0, pingRecords.length)  } else {    // 在顶部插入（新数据在前）    pingRecords.unshift(newRecord)  }  res.send("ok")}exportdefault handler
```

#### Step 3: Service Worker 的内存管理

```
// src/background/pingRecord.tsexportinterface PingRecord {  id: string  time: string  pagetype: string  actiontype: string  sectionId: string  sortId: string  sortName: string  fullData: any}/** 全局只在内存中保存，刷新/重启后会丢失 */exportconst pingRecords: PingRecord[] = []
```

#### Step 4: Service Worker -> DevTools Panel (轮询策略)

这是最关键的设计决策。我们没有选择长连接（`connect`），而是选择了**短轮询（Polling）**：

```
// src/components/panels/SpmTools/index.tsximport { sendToBackground } from"@plasmohq/messaging"useEffect(() => {let intervalId: numberfunction fetchRecords() {    // 获取埋点记录    sendToBackground<PingRecord[]>({      name: "get-records"    }).then((res) => {      if (Array.isArray(res)) {        setRecords(res)        // 更新过滤器选项...      }    })    // 检查监控状态    chrome.devtools.inspectedWindow.eval(      "window.__is_spm_monitor_open__",      (result: boolean, isException) => {        if (!isException) {          setIsSpmMonitorOpen(result)        }      }    )  }  fetchRecords()  // 先拉一次// 每 800ms 轮询一次  intervalId = window.setInterval(() => {    fetchRecords()  }, 800)return() => clearInterval(intervalId)}, [])
```

消息处理器极其简洁：

```
// src/background/messages/get-records.tsimport type { PlasmoMessaging } from "@plasmohq/messaging"import { pingRecords } from "../pingRecord"const handler: PlasmoMessaging.MessageHandler = async (req, res) => {  // 直接把内存中保存的埋点列表返回  res.send(pingRecords)}export default handler
```

DevTools Panel 打开时，每隔 **800ms** 调用一次 `chrome.runtime.sendMessage({ action: "get_records" })`。 Service Worker 收到请求，返回 `pingRecords`，并清空已发送的记录（或保留根据需求）。

**为什么是轮询？**

1.  **对抗 Service Worker 休眠：** 轮询是无状态的。即使 SW 休眠了，下一次轮询请求会自动唤醒它。
    
2.  **简单可靠：** 避免了复杂的连接断开重连逻辑。
    
3.  **性能无损：** 800ms 的频率对于现代 CPU 来说，负载几乎为 0。且数据只是内存读取，延迟在纳秒级。
    

### 辅助：基于 Plasmo 的工程化实践

我们引入了 **Plasmo** 框架来构建整个插件。Plasmo 被称为 "浏览器插件领域的 Next.js"。它提供了：

*   **热重载（HMR）**：开发时修改代码无需重新加载扩展
    
*   **React 支持**：使用 Ant Design 构建 DevTools 面板 UI
    
*   **TypeScript 开箱即用**：完整的类型支持
    
*   **消息系统封装**：`@plasmohq/messaging` 简化了跨上下文通信
    

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaAYhibfTpicHRjTu0uriazqb1NnYWakfJ0H5D0V6xDyEXYyggr0NOPfVgw/640?wx_fmt=png&from=appmsg#imgIndex=7)为什么使用 Plasmo

### 实际使用体验

**使用流程**

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaO0T1NtSDW9IUNBBS4T6r8bNNIms8GZr7n6UZOal8Oxia3Cr5NmEhkew/640?wx_fmt=png&from=appmsg#imgIndex=8)快速开始流程

**开启控制台面板 -> 选择 zzChromeTools**

![](https://mmbiz.qpic.cn/mmbiz_gif/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdap0FUSdtiaNYpykSRwSpdET6OV0kbphwEGTC9GKa4T8DHWfQmicciaZoWw/640?wx_fmt=gif&from=appmsg#imgIndex=9)流程 1

**根据需求勾选能力**

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDda83fr8Y0XLht1LUAEjUf5ouV9TqmkxIcnqoN1nwkVUafDALlk4C8JuQ/640?wx_fmt=png&from=appmsg#imgIndex=10)流程 2

**在页面上触发埋点**

![](https://mmbiz.qpic.cn/mmbiz_gif/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaCiaiamQT9ZXB4Opk6Z12A3exulftJpEnWIKWJRPdfn7XVfL7bolD5Fgg/640?wx_fmt=gif&from=appmsg#imgIndex=11)流程 3

**筛选数据 / 清空数据**

![](https://mmbiz.qpic.cn/mmbiz_gif/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaR46GqokZibrOL4I2ibuOT99WES8n7Sv5rGm7k49z2ichKKFwXic9am0dJw/640?wx_fmt=gif&from=appmsg#imgIndex=12)流程 4

**时效对比**

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDda3Wm7BwA7YCgfy37utFibP2ExbX1UOQGsIYNSH45eUTlaGLEibhKsWxeQ/640?wx_fmt=png&from=appmsg#imgIndex=13)时效对比

06 价值
-----

**zzChromeTools** 不仅仅是一个代码的堆砌，它代表了我们对前端工程化的深度思考。我们将它的价值概括为三个维度：

### 时间维度的价值

*   **旧流程：** 查找（1min）+ 解析（1min）+ 验证（1min）= **3 分钟 / 个**。
    
*   **新流程：** 打开面板，自动高亮 = **5 秒 / 个**。 如果一个项目有 50 个埋点，我们直接节省了 **2.5 小时** 的纯垃圾时间。对于一个 10 人的前端团队，一年节省的工时成本是非常可观的。
    

### 心理维度的价值

这无法用 KPI 衡量，但最为重要。 工具的 “顺手程度” 直接影响开发者的幸福感。当工具能够像呼吸一样自然时，开发者可以将宝贵的注意力（Attention）集中在业务逻辑和架构设计上，而不是被琐事打断。 **我们消灭了 “噪音”，留下了 “信号”。** 这种清爽的调试体验，能让开发者在面对繁琐的埋点需求时，少一分焦虑，多一分从容。

### 资产维度的价值

这个插件的架构本身就是一份宝贵的技术资产。

*   它验证了 MV3 架构下复杂通信的可行性。
    
*   它提供了一套标准化的 “主世界注入” 模板，未来可以扩展用于其他场景（如性能监控 SDK 的调试、AB Test 标记的查看等）。
    

### What's more

zzChromeTools 除了埋点校验之外，还有如下小工具用于提效前端开发：

1.  **常用工程跳转 / 二维码**
    

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdau2fSKa9gmYNX1BPjkYTTibmrQGRGm5ZYu1yUicysw8tTgSjKRWTPoXVQ/640?wx_fmt=png&from=appmsg#imgIndex=14)
----------------------------------------------------------------------------------------------------------------------------------------------------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaR8lWaYfYx1bcHZNrybapeJQWeXUIvTzyAyuEEibN1ESQiaRFibFCy1Xpg/640?wx_fmt=png&from=appmsg#imgIndex=15)命中工程链接时，展示工程子页面

**Whistle 代理一键切换**

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaQKcRZzWEJUjf1QgHUicJPRPQia0MDs1Fv9V7RlHiaSfIvuCZN9pMKN5HA/640?wx_fmt=png&from=appmsg#imgIndex=16)*Whistle 代理一键切换

**一键分析当前页面字体**

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdadH0qqAoZme8YMMnqah6tTu6p1jmkD5siae4M8p0FNrkjqZzbAsErU8w/640?wx_fmt=png&from=appmsg#imgIndex=17)一键分析当前页面字体

**JSON 层级查找工具**

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibvUFLd5OgaBg7iaWAKgJDdaAXzARlIDKJQwd4BLRgc8a2c0q4eUgZ9w5pIRlKCVavIWg66VdJFg5g/640?wx_fmt=png&from=appmsg#imgIndex=18)JSON 层级查找工具

07 结论与未来展望
----------

开发 **zzChromeTools** 的过程，是我们不满于低效的现状，但不通过抱怨来发泄，而是通过技术手段去改变它的体现。

### 未来 Roadmap

虽然目前的版本已经解决了 80% 的痛点，但我们仍有更宏大的计划：

1.  **持久化存储升级：** 引入 `IndexedDB`，彻底解决 Service Worker 重启可能导致极端情况下数据丢失的问题，支持保存几天的埋点历史，方便回溯。
    
2.  **全协议覆盖：** 除了 `sendBeacon`，还将 Hook `XMLHttpRequest` 和 `fetch`，实现对所有类型上报的无死角覆盖。
    
3.  **自动化测试集成：** 探索暴露 API 给 Puppeteer/Playwright，让自动化测试脚本也能读取插件捕获的埋点数据，实现埋点回归的自动化。
    

### 结语

Chrome MV3 是一堵墙，但技术不仅能砌墙，也能架桥。 通过对底层原理的深入挖掘，我们证明了即使在最严格的安全限制下，依然可以打造出极致的开发者工具。 希望本文能给你带来两方面的收获：一是关于 Chrome 插件开发的硬核知识，二是一种 “不凑合、不妥协” 的极客精神。

**拒绝无效加班，从打磨手中的武器开始。**

想了解更多转转公司的业务实践，点击关注下方的公众号吧！