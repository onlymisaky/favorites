> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wJxj5QbOHwH9cKmqU5eSQw)

![](https://mmbiz.qpic.cn/mmbiz_jpg/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7b5zn4fRUao9TB9UNYfC4yp52EaiaFP12uOPpCJlfI8noVhyM1tDolkA/640?wx_fmt=jpeg)

性能优化不单指优化一个页面的打开速度，在开发环境将一个项目的启动时间缩短使开发体验更好也属于性能优化，大文件上传时为其添加分片上传、断点续传也属于性能优化。在项目开发以及用户使用的过程中，能够让任何一个链路快一点，都可以被叫做性能优化。

本文会对 web 页面的全链路进行完整的讲解并针对每一步找到能做的性能优化点，本文的目标是极致的性能优化。

因为针对性能优化，能做的点会特别特别的多，覆盖着整个互联网的访问流程，因此此文章的内容会比较多且杂，笔者会尽量对内容进行分类讲解。

本文的大致流程为先讲理论知识，比如如何评价一个页面的性能好与不好、如果获取性能指标，如何使用各种性能相关工具，浏览器如何获取并渲染页面。笔者认为这些都是基础，只有了解了这些基础才能开始考虑如何去优化。

接下来我们会进入性能优化环节，在这个环节我会详细讲解在页面的整个流程中，哪些地方可以做哪些优化。

目录
==

*   进程与线程
    
*   输入 url 到页面展示完整过程
    

*   1. 用户输入
    
*   2. 卸载原页面并重定向到新页面
    
*   3. 处理 Service Worker
    
*   4. 网络请求
    
*   5. 服务端响应
    
*   6. 浏览器渲染详细流程
    

*   浏览器处理每一帧的流程
    
*   Chrome Performance(性能)
    

*   Chrome Performance 工具的使用
    
*   Performance API 介绍
    
*   使用 Performance API 获取性能相关指标
    

*   Coverage(覆盖率)
    
*   Lighthouse
    
*   Network(网络)
    

*   网络请求中的 Timing(时间)
    
*   网络请求的优先级
    
*   网页总资源信息
    
*   Network 配置
    

*   网络优化策略
    

*   减少 HTTP 请求数
    
*   使用 HTTP 缓存
    
*   使用 HTTP/2.0
    
*   避免重定向
    
*   使用 dns-prefetch
    
*   使用域名分片
    
*   CDN
    
*   压缩
    
*   使用 contenthash
    
*   合理使用 preload、prefetch
    

*   浏览器渲染优化策略
    

*   关键渲染路径
    
*   强制同步布局问题
    
*   如何减少重排与重绘
    

*   静态文件优化策略
    

*   图片格式
    
*   图片优化
    
*   HTML 优化
    
*   CSS 优化
    
*   JS 优化
    
*   字体优化
    

*   浏览器储存优化策略
    

*   Cookie
    
*   LocalStorage
    
*   SessionStorage
    
*   IndexDB
    

*   其他优化策略
    
*   使用 PWA 提高用户体验
    

浏览器渲染原理
=======

我们需要知道浏览器是如何渲染一个页面的，我们才能知道如何对页面进行性能优化，所以这里我们对一些基础知识进行讲解

进程与线程
-----

浏览器有多种进程，其中最主要的 5 种进程如下

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7RCCXZRGqU2kx9TGTteIuiahtAzPWdS8h18bqBlaWmlVtEtCZBa9BiahA/640?wx_fmt=png)

1.  浏览器进程 负责界面展示、用户交互、子进程管理、提供存储等
    
2.  渲染进程 每个页面都有一个单独的渲染进程，用于渲染页面，包含 webworker 线程
    
3.  网络进程 主要处理网络资源加载（HTML、CSS、JS、IMAGE、AJAX 等）
    
4.  GPU 进程 3D 绘制，提高性能
    
5.  插件进程 chrome 插件，每个插件占用一个进程
    

输入 url 到页面展示完整过程
----------------

_图 1_

![](https://mmbiz.qpic.cn/mmbiz_svg/5ZQ3V8nVdKqGHtgibsQKVRQfmEIGhI3zWr4A75MkibVgYlibaYPiaAt6qsGndzFeiaeibOESDdfBJBHZH3jWUxDpJtdDOfLW569iaQq/640?wx_fmt=svg)图 1

### 1. 用户输入

用户在`浏览器进程`输入并按下回车健后，浏览器判断用户输入的 url 是否为正确的 url，如果不是，则使用默认的搜索引擎将该关键字拼接成 url。

### 2. 卸载原页面并重定向到新页面

然后浏览器会将现有页面卸载掉并重定向到用户新输入的 url 页面，也就是图中【Process Unload Event】和【Redirect】流程。

此时浏览器会准备一个`渲染进程`用于渲染即将到来的页面，和一个`网络进程`用于发送网络请求。

### 3. 处理 Service Worker

如果当前页面注册了 Service Worker 那么它可以拦截当前网站所有的请求，进行判断是否需要向远程发送网络请求。也就是图中【Service Worker Init】与【Service Worker Fecth Event 】步骤

如果不需要发送网络请求，则取本地文件。如果需要则进行下一步。

### 4. 网络请求

> OSI 网络七层模型：物理层、数据链路层、网络层、传输层、会话层、表示层、应用层
> 
> 在实际应用中物理层、数据链路层被统称为物理层，会话层、表示层、应用层被统称为应用层，所以实际使用时通常分为 4 个层级
> 
> 【物理层】>【网络层 (IP)】>【传输层 (TCP/UDP)】>【应用层 (HTTP)】

也就是图中【HTTP Cache】、【DNS】、【TCP】、【Request】、【Response】步骤

_图 2_

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7LiaUzUyQ1JjIv6PU5QkdYGSUU4pne1OFp93XTXIhJGb1iaWpdBEdJOkA/640?wx_fmt=png)图 2

浏览器会拿着 url 通过`网络进程`进行如下步骤

1.  根据 url 查询本地是否已经有强制缓存，如果有则判断缓存是否过期，如果没过期则直接返回缓存内容，也就是图 1 中【HTTP Cache】步骤
    
2.  如果没有强制缓存或者缓存已过期，则将该请求加入队列进行排队准备发送网络请求，也就是图 2 中【正在排队】，然后进入 DNS 解析阶段，也就是图 1 中【DNS】以及图 2 中的【DNS 查找】，DNS 根据域名解析出对应的 IP 地址。(DNS 基于 UDP)。
    
3.  然后使用 IP 寻址找到对方，然后根据 IP 地址 + 端口号创建一个 TCP 连接 (三次握手)，也就是图 1 中【TCP】以及图 2 中的【初始连接】创建完成后利用 TCP 连接来传输数据。(TCP 会将数据拆分为多个数据包，进行有序传输，如果丢包会重发，TCP 的特点是可靠、有序)
    
4.  判断当前协议是否为 https，如果为 https，则进行 SSL 协商，将数据进行加密，如果为 http 协议则不进行加密 (明文传输)，也就是图 2 中的【SSL】。
    
5.  开始发送 http 请求 (请求行 / 请求头 / 请求体)，也就是图 1 中【Request】以及图 2 中的【已发送请求】。HTTP 协议有多个版本，目前使用最多的版本为 HTTP/1.1，HTTP/1.1 发送完成后默认不会断开。keep-alive 默认打开，为了下次传输数据时复用上次创建的连接。每个域名最多同时建立 6 个 TCP 连接，所以同一时间最多发生 6 个请求。
    
    HTTP 协议的各个版本特性如下：
    

*   `HTTP/0.9` 没有请求头和响应头，不区分传输的内容类型，因为当时只传输 HTML。
    
*   `HTTP/1.0` 提供了请求头和响应头，可以传输不同类型的内容数据。根据请求响应头的不同来处理不同的资源，HTTP1.0 每次发完请求都会断开 TCP 连接。有新的请求时再次创建 TCP 连接。
    
*   `HTTP/1.1` 默认开启了 keep-alive ，它能够让一个 TCP 连接中传输多个 HTTP 请求，也叫`链路复用`。但一个 TCP 连接同一时间只能发送一个 HTTP 请求，为了不阻塞多个请求，Chrome 允许创建 6 个 TCP 连接，所以在 HTTP/1.1 中，最多能够同时发送 6 个网络请求。
    
*   `HTTP/2.0` HTTP/2.0 使用同一个 TCP 连接来发送数据，他把多个请求通过二进制分贞层实现了分贞，然后把数据传输给服务器。也叫`多路复用`，多个请求复用同一个 TCP 连接。HTTP/2.0 会将所有以`:`开头的请求头做一个映射表，然后使用`hpack`进行压缩，使用这种方式会使请求头更小。服务器可主动推送数据给客户端。
    
*   `HTTP/3.0` 使用 UDP 实现，在 UDP 上一层加入一层`QUIC`协议，解决了 TCP 协议中的队头阻塞问题。
    

7.  服务器收到数据后解析 HTTP 请求 (请求行 / 请求头 / 请求体)，处理完成后生成状态码和 HTTP 响应(响应行 / 响应头 / 响应体) 后返回给客户端，也就是图 2 的【等待中】在做的事情。
    
8.  客户端接收到 HTTP 响应后根据状态码进行对应的处理，如果状态码为 304 则直接代表协商缓存生效，直接取本地的缓存文件。如果不是则下载内容。也就是图 1 中【Response】以及图 2 中的【下载内容】步骤。
    

### 5. 服务端响应

在`4.网络请求`第`6`步中，服务器收到 HTTP 请求后需要根据请求信息来进行解析，并返回给客户端想要的数据，这也就服务端响应。

服务端可以响应并返回给客户端很多种类型的资源，这里主要介绍`html`类型

目前前端处理服务端响应 html 请求主要分为 SSR 服务端渲染与 CSR 客户端渲染，CSR 就是返回一个空的 HTML 模版，然后浏览器加载 js 后通过 js 动态渲染页面。SSR 是服务端在接受到请求时事先在服务端渲染好 html 返回给客户端后，客户端再进行客户端激活。

在打开一个站点的首屏页的完整链路中，使用 SSR 服务端渲染时的速度要远大于 CSR 客户端渲染，并且 SSR 对 SEO 友好。所以对于首屏加载速度比较敏感或者需要优化 SEO 的站点来说，使用 SSR 是更好的选择。

### 6. 浏览器渲染详细流程

浏览器渲染详细流程主要在`4.网络请求`中的地`7`步。浏览器下载完`html`内容后进行解析何渲染页面的流程。

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7bib1rfNibtC2H2HULKvYjocNBUYaiae1icribKvdp2d1PGHCiaIzMHAkhasg/640?wx_fmt=png)

渲染流程分为 4 种情况，

1.  HTML 中无任何 CSS 相关标签
    
2.  CSS 相关标签在 HTML 最顶部，且在解析到内容标签（`<div />`）时已经解析完 CSS 相关标签
    
3.  CSS 相关标签在 HTML 最顶部，但在解析到内容标签（`<div />`）时 CSS 相关标签尚未解析完
    
4.  CSS 相关标签在 HTML 最底部
    

下面的流程是对上图的文字版解析。读者可将以上 4 种情况分别带入到如下的渲染流程中走一遍。就能理解浏览器的完整渲染过程了。

#### 【HTML】

浏览器收到 html 资源后先预扫描`<link />`和`<script />`并加载对应资源

#### 【HTML Parser】

对 HTML 字符串从上到下逐行解析，每解析完成一部分都会拿着解析结果进入下一步骤

#### 【DOM Tree】

_`css`相关标签跳过此步骤_

如果当前解析结果为`<div />`相关标签，则生成 DOM 树（`window.document`）后进入下一步。

如果当前解析结果为`<script />`相关标签且并且没有添加异步属性，则先停止【HTML Parser】的进行，等待`<script />`资源加载完成后，然后按照以下 2 种情况处理，当处理完成后便停止当前`<script />`标签后续步骤的执行，并继续进行新标签【HTML Parser】步骤的解析

1.  如果 HTML 从未解析到过`css`相关节点则立即执行`<script />`。(此时页面会把`<script />`之前的内容都显示在页面上)
    
2.  如果 HTML 已经解析到过`css`相关节点则等待`css`相关节点解析完成后再执行`<script />`。(在 CSS 解析完的一瞬间会触发之前所有等待 CSS 资源解析的任务，假如在解析`<script />`之前还有`<div />`的话，理论上`<div />`应该在执行`<script />`之前被绘制到页面上，但因为 Chrome 是按照贞为单位来进行元素的绘制的，如果绘制`<div />`与执行`<script />`的时间在一贞之内，则会因为在绘制`<div />`时被`js`阻塞，所以实际上需要等`js`执行完才会实际完成`<div />`的绘制)
    

#### 【Style Sheets】

_`<div />`相关标签跳过此步骤_

如果当前解析结果为`css`相关标签，则等待其 CSS 资源加载完成，同时继续进行下一行的【HTML Parser】

#### 【CSS Parser】

_`<div />`相关标签跳过此步骤_

当 CSS 资源加载完毕后，对 CSS 从上到下逐行解析

#### 【Style Rules】

_`<div />`相关标签跳过此步骤_

当 CSS 解析完毕后，生成 CSS 规则树，也叫 CSSOM，也就是`window.document.styleSheets`

#### 【Attachment】

根据 DOM 树与 CSS 规则树计算出每个节点的具体样式。

分为两种情况

##### 1. 如果当前节点为`<div />`相关节点

如果 HTML 从未解析到过`css`相关标签则使用 HTML 默认样式，如果已经解析到过`css`相关标签则阻塞等待`css`标签也完成【Attachment】步骤后才进入下一步。

##### 2. 如果当前节点为`css`相关节点

则需要根据是否在之前已经渲染过 CSS 资源中对应的 DOM 节点，如果已经渲染过则需要重绘。如果未渲染过任何相关 DOM 节点则此步骤为最后一步。

#### 【Render Tree】

生成渲染树，在此阶段已经可以将具体的某个`<div />`与对应的 CSS 样式对应起来了。有了渲染树后浏览器就能根据当前浏览器的状态计算出某个 DOM 节点的样式、大小、宽度、是否独占一行等信息。计算完成后把一些不需要显示出来的节点在渲染树中删掉。如`display: none`。

#### 【Layout】

通过渲染树进行分层（根据定位属性、透明属性、transform 属性、clip 属性等）生成图层树。

#### 【Painting】

绘制所有图层，并转交给合成线程来最最终的合并所有图层的处理。

#### 【Display】

最终生成页面并显示到浏览器上

浏览器处理每一帧的流程
-----------

浏览器在渲染完页面之后还需要不间断的处理很多内容的，比如动画、用户事件、定时器等。因此当浏览器渲染完页面后，还会在之后的每一帧到来时执行以下的流程。

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7X3LthAQA69Wu5Uq40FwztcHOh2jVPhc6u5n2ZibkuaT8e9Giah2l1LwA/640?wx_fmt=png)

*   【Input events】处理用户事件，先处理【阻塞事件 Blocking】包括`touch`和`wheel`事件，后处理【非阻塞事件 Non-blocking】包括`click`和`keypress`
    
*   【JS】处理完用户事件后执行【定时器 Timers】
    
*   【Begin frame】处理完定时器后开始进行【每帧事件 Per frame events】的处理，包括窗口大小改变、滚动、媒体查询的更改、动画事件。
    
*   【rAF】处理完帧事件后执行`requestAnimationFrame`回调函数和`IntersectionObserver`回调函数。
    
*   【Layout】然后【重新计算样式 Recalc style】、【更新布局 Update layout】、【调整 Observer 回调的大小 Resize Observer callbacks】
    
*   【Paint】然后【合成更新 Compositing update】、【Paint invalidation】、【Record】
    

Chrome 性能优化相关工具
===============

了解完浏览器渲染原理，我们还需要知道根据哪些指标才能判断一个页面性能的好坏，在 Chrome 中这些指标应该怎么获取。以及 Chrome 都为我们提供了哪些性能相关的工具，如何使用。

Chrome Performance(性能)
----------------------

Performance 既是一个 Chrome 工具，可用于性能检测。

同样又是一套 JS API，可在 Chrome 中执行。

### Chrome Performance 工具的使用

打开 Chrome 调试面板选择 **Performance**，中文版为**性能**，点击刷新按钮，Performance 会刷新并录制当前页面，然后我们就可以在面板中看到如下的各种性能相关细节。

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA73bAeDmKEJxYibfITiaWAIvfw6uSGZTIkAgibJgAIZWXxLiap9PN0mjr49w/640?wx_fmt=png)

### Performance API 介绍

js 中存在 Performance API，可用于性能检测，具体如下

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7cyFfgNZXN4X8w0HG16icout13PJDlkgdpWKXgyUS2mqjibwCtuVPsUQA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_svg/5ZQ3V8nVdKqGHtgibsQKVRQfmEIGhI3zWr4A75MkibVgYlibaYPiaAt6qsGndzFeiaeibOESDdfBJBHZH3jWUxDpJtdDOfLW569iaQq/640?wx_fmt=svg)

*   【Process Unload Event】等待上一个页面卸载。在我们输入 url 后浏览器需要卸载上一个页面的内容然后再去执行`navigationStart`导航开始。
    
*   【Redirect】浏览器卸载完上一个页面后会执行`redirectStart`然后将当前页面重定向到用户新输入的 url 页面。完成重定向后会执行`redirectEnd`
    
*   【Service Worker Init】如果当前页面注册了 Service Worker 那么执行`workerStart`对 Service Worker 进行初始化操作。
    
*   【Service Worker Fecth Event 】浏览器准备好发送请求，在发送之前会执行`fetchStart`
    
*   【HTTP Cache】如果有缓存则直接取缓存，如果没有的话则继续解析
    
*   【DNS】如果没有缓存则执行`domainLookupStart` 然后去解析 DNS，解析完会执行`domainLookupEnd`
    
*   【TCP】DNS 解析完会执行`contentStart`，然后进行 TCP 三次握手，如果是 HTTPS 则执行`secureConnectionStart`进行 SSL 协商。完成后会执行`contentEnd`。
    
*   【Request】TCP 连接创建完成后执行`requestStart`，然后开始真正的发送请求
    
*   【Response】请求被响应且首字节返回时会先执行`responseStart`，响应全部接收完毕后会执行`responseEnd`
    
*   【Processing】响应完执行`domLoading`开始加载 dom，dom 加载完毕后执行`domInteractive`，此时 dom 已经可以交互。然后执行`domContentLoadedEventStart`，当 dom 整个节点全部加载完毕并执行完`DOMContentLoaded`事件后会触发`domContentLoadedEventEnd`简称`DCL`当 dom 整个加载完成会执行`domComplete`，此时页面资源已经全部加载完毕。
    
*   【onLoad】当页面资源已经全部加载完毕后会执行`loadEventStart`，触发`window.onload`事件，`load`事件完成后会执行`loadEventEnd`。
    

### 使用 Performance API 获取性能相关指标

接下来我们来了解一下目前常用的性能指标，并且我们需要知道其中一些关键指标如何用 Performance API 获取。

#### TTFB 首字节时间

`TTFB（Time To First Byte）`: 从发送请求到数据返回第一个字节所消耗的时间

```
const { responseStart, requestStart } = performance.timingconst TTFB = responseStart - requestStart
```

#### FP 首次绘制

`FP (First Paint) 首次绘制`: 第一个像素绘制到页面上的时间

```
const paint = performance.getEntriesByType('paint')const FP = paint[0].startTime
```

#### FCP 首次内容绘制

`FCP (First Contentful Paint) 首次内容绘制` 标记浏览器渲染来自 DOM 第一位内容的时间点，该内容可能是文本、图像、SVG 甚至 元素.

```
const paint = performance.getEntriesByType('paint')const FCP = paint[1].startTime
```

#### FMP 首次有效绘制

`FMP(First Meaningful Paint) 首次有效绘制`: 例如，在 YouTube 观看页面上，主视频就是主角元素.

图片可以没加载完成，但整体的骨架已经加载完成了。

1 秒内完成 FMP 的概率超过 80%，那就代表这个网站是一个性能较好的网站

```
let FMP = 0const performanceObserverFMP = new PerformanceObserver((entryList, observer) => {  const entries = entryList.getEntries()  observer.disconnect()  FMP = entries[0].startTime})// 需要在元素中添加 elementtiming="meaningful"performanceObserverFMP.observe({ entryTypes: ['element'] })
```

#### TTI 可交互时间

`TTI (Time to Interactive) 可交互时间`: DOM 树构建完毕，可以绑定事件的时间

```
const { domInteractive, fetchStart } = performance.timingconst TTI = domInteractive - fetchStart
```

#### LCP  最大内容渲染

`LCP (Largest Contentful Paint) 最大内容渲染`: 代表在 viewport 中最大的页面元素加载的时间. LCP 的数据会通过 PerformanceEntry 对象记录, 每次出现更大的内容渲染, 则会产生一个新的 PerformanceEntry 对象.(2019 年 11 月新增)

```
let LCP = 0const performanceObserverLCP = new PerformanceObserver((entryList, observer) => {  const entries = entryList.getEntries()  observer.disconnect()  LCP = entries[entries.length - 1].startTime})performanceObserverLCP.observe({ entryTypes: ['largest-contentful-paint'] })
```

#### DCL

`DCL (DomContentloaded)`: 当 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，无需等待样式表、图像和子框架的完成加载

```
const { domContentLoadedEventEnd, fetchStart } = performance.timingconst DCL = domContentLoadedEventEnd - fetchStart
```

#### L 全部加载完毕

`L (onLoad)`, 当依赖的资源 (图片、文件等), 全部加载完毕之后才会触发

```
const { loadEventStart, fetchStart } = performance.timingconst L = loadEventStart - fetchStart
```

#### FID 首次输入延迟

`FID (First Input Delay) 首次输入延迟`: 指标衡量的是从用户首次与您的网站进行交互（即当他们单击链接，点击按钮等）到浏览器实际能够访问之间的时间

```
let FID = 0const performanceObserverFID = new PerformanceObserver((entryList, observer) => {  const entries = entryList.getEntries()  observer.disconnect()  FID = entries[0].processingStart - entries[0].startTime})performanceObserverFID.observe({ type: ['first-input'], buffered: true })
```

#### TBT 页面阻塞总时长

`TBT (Total Blocking Time) 页面阻塞总时长`: TBT 汇总所有加载过程中阻塞用户操作的时长，在 FCP 和 TTI 之间任何 long task 中阻塞部分都会被汇总

#### CLS 累积布局偏移

`CLS (Cumulative Layout Shift) 累积布局偏移`: 总结起来就是一个元素初始时和其 hidden 之间的任何时间如果元素偏移了, 则会被计算进去, 具体的计算方法可看这篇文章 https://web.dev/cls/

#### SI

`SI (Speed Index)`: 指标用于显示页面可见部分的显示速度, 单位是时间

Coverage(覆盖率)
-------------

获取代码未使用占比

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA79ibm7iaGFyj6K42zrRY9kRhBu0qrdKhNrfSLCIzO1DGQ0e4sG2ZDGN9A/640?wx_fmt=png)

Lighthouse
----------

获取性能报告并查看推荐优化项

可以在本地安装命令行工具来使用，也可以通过 Chrome 来使用。

_命令行方式使用_

```
npm install -g lighthouse
lighthouse --view https://m.baidu.com
```

_在 Chrome 中使用_

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7qE01NMIibiaXgqiadu67eCe6RpufU5XcmyfVD4ib4Dfpy2ku6bGiclZSLPw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7sga7sVSCwrw56rMbWZWfgap1ibGY2Ol599df46OG8QHDkTibn3VhFGSQ/640?wx_fmt=png)

Network(网络)
-----------

### 网络请求中的 Timing(时间)

能获取网络请求的时间消耗细节，可以根据耗时来决定优化策略。优先优化耗时最长的

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7KrWA9FoibsrxXhLJyxiamX5NE957xvxQz08tPb3WHhokgcjwkC1Dvbyg/640?wx_fmt=png)

【正在排队】网络请求队列的排队时间

【已停止】阻塞住用于处理其他事情的时间

【DNS 查找】用于 DNS 解析 IP 地址的时间

【初始连接】创建 TCP 连接时间

【SSL】用于 SSL 协商的时间

【已发送请求】用于发送请求的时间

【等待中】请求发出至接收响应的时间也可以理解为服务端处理请求的时间

【下载内容】下载响应的时间

### 网络请求的优先级

浏览器会根据资源的类型决定优先请求哪些资源，优先级高的请求能够优先被加载。

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7ibEXfUv8SA7JDLaIyiaSmySGibkLvTquoMHcNTm73WzfApxx8MjTh58Nw/640?wx_fmt=png)

右击此处勾选优先级可打开优先级功能，在请求中便可看到网络请求的优先级

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7VxpG4wtc5LSGYNuvSxtRheo7pPA2VVwhmjFxrx8VQXhI7c1jeSE42A/640?wx_fmt=png)

不同资源类型的优先级排序如下

【最高】html、style

【高】font、fetch、script

【低】image、track

### 网页总资源信息

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7PibMRqDaURSuoGH6Vxr1WlTGV922rsrL8Infibz4ic72jtmHMYn4EWfXg/640?wx_fmt=png)

【58 个请求】网页一共多少个请求

【6.9 MB 项资源】网页资源一共 6.9MB 大小

【DOMContentLoaded：454 毫秒】DOM 加载完毕的时长

【加载时间：1.02 秒】onload 完毕的时长

### Network 配置

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA70EjJcTMicUQXLoOqHPyoaFXuSAw9iazePYZEyclpu0MtYeKuCBicxHcuA/640?wx_fmt=png)

网页性能优化
======

上面我们分别讲解了进程与线程、浏览器打开一个页面的完整过程、浏览器处理每一帧时的流程、Chrome 性能相关的各种工具以及性能相关的各种指标。以上内容都掌握之后我们再考虑性能优化遍有了思路，我们在页面展示的任意一个步骤中对其进行优化都能对整个网页的展示性能产生影响。

下面列出了一个页面能优化的所有内容，读者可根据自己的业务情况结合性能工具来做适合自己的优化方式。

网络优化策略
------

### 减少 HTTP 请求数

合并 JS、合并 CSS、合理内嵌 JS 和 CSS、使用雪碧图

### 使用 HTTP 缓存

使用强制缓存可以不走网络请求，直接走本地缓存数据来加载资源。

使用协商缓存可以减少数据传输，当不需要更新数据时可通知客户端直接使用本地缓存。

### 使用 HTTP/2.0

HTTP/2.0 使用同一个 TCP 连接来发送数据，他把多个请求通过二进制分贞层实现了分贞，然后把数据传输给服务器。也叫`多路复用`，多个请求复用同一个 TCP 连接。

HTTP/2.0 会将所有以`:`开头的请求头做一个映射表，然后使用`hpack`进行压缩，使用这种方式会使请求头更小。

服务器可主动推送数据给客户端。

### 避免重定向

301、302 重定向会降低响应速度

### 使用 dns-prefetch

DNS 请求虽然占用的带宽较少，但会有很高的延迟，由其在移动端网络会更加明显。

使用 dns-prefetch 可以对网站中使用到的域名提前进行解析。提高资源加载速度。

通过 dns 预解析技术可以很好的降低延迟，在访问以图片为主的移动端网站时，使用 DNS 预解析的情意中下页面加载时间可以减少 5%。

```
<link rel="dns-prefetch" href="https://a.hagan.com/">
```

### 使用域名分片

在 HTTP/1.1 中，一个域名同时最多创建 6 个 TCP 连接，将资源放在多个域名下可提高请求的并发数

### CDN

静态资源全上 CDN，CDN 能非常有效的加快网站静态资源的访问速度。

### 压缩

gzip 压缩、html 压缩、js 压缩、css 压缩、图片压缩

### 使用 contenthash

contenthash 可以根据文件内容在文件名中加 hash，可用于浏览器缓存文件，当文件没有改变时便直接取本地缓存数据

### 合理使用 preload、prefetch

preload 预加载、prefetch 空闲时间加载

```
<link rel="preload" as="style" href="/static/style.css"><link rel="preload" as="font" href="/static/font.woff"><link rel="preload" as="script" href="/static/script.js"><link rel="prefetch" as="style" href="/static/style.css"><link rel="prefetch" as="font" href="/static/font.woff"><link rel="prefetch" as="script" href="/static/script.js">
```

两者都不会阻塞`onload`事件，`prefetch` 会在页面空闲时候再进行加载，是提前预加载之后可能要用到的资源，不一定是当前页面使用的，`preload` 预加载的是当前页面的资源。

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta >  <title>Document</title></head><body>  <article></article></body></html>
```

如上代码，预加载了 css 但并没有使用。浏览器在页面 `onload` 完成一段时间后，发现还没有引用预加载的资源时，浏览器会在控制台输出下图的提示信息

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7U5oibU6iaGicmZIuzRGvzYCyKTy00ArLVlicQRFuA5PIfqfJJZx2um7kIQ/640?wx_fmt=png)

preload 和 prefetch 可根据资源类型决定资源加载的优先级，详细优先级如代码

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta >  <!-- 最高 -->  <link rel="preload" as="style" href="./file.xxx">  <!-- 高 -->  <link rel="preload" as="font" href="./file.xxx">  <link rel="preload" as="fetch" href="./file.xxx">  <link rel="preload" as="script" href="./file.xxx">  <!-- 低 -->  <link rel="preload" as="image" href="./file.xxx">  <link rel="preload" as="track" href="./file.xxx">  <title>Document</title></head><body>  <article></article></body></html>
```

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7HzxoGrDxqcfTyAvaCohVjcO6iayKTunCKtspKk84bsl9rGicyv3vU01g/640?wx_fmt=png)

浏览器渲染优化策略
---------

### 关键渲染路径

当通过 JS 或者其他任意方式修改 DOM 后，浏览器会进入如下流程

【JS 通过 API 修改 DOM】>【计算样式】>【布局 (重排)】>【绘制 (重绘)】>【合成】

`Reflow 重排`：重排在 Chrome Performance 中叫做布局，通常添加或删除元素、修改元素大小、移动元素位置、获取位置信息都会触发页面的重排，因为重排可能会改变元素的大小位置等信息，这样的改变会影响到页面大量其它元素的大小位置信息，会耗费掉大量的性能，所以在实际应用中我们应该尽可能的减少重排

`Repaint 重绘`：重绘在 Chrome Performance 中叫做绘制，通常样式改变但没有影响位置时会触发重绘操作，重绘性能还好，但我们也需要尽量减少重绘，如果需要做一些动画，我们尽量使用 CSS3 动画，CSS3 动画只需要在初始化时绘制一次，之后的动画都不会触发重绘操作。

### 强制同步布局问题

在同一个函数内，修改元素后又获取元素的位置时会触发强制同步布局，影响渲染性能

强制同步布局会使 js 强制将【计算样式】和【布局 (重排)】操作提前到当前函数任务中，这样会导致每次运行时执行一次【计算样式】和【重排】，这样一定会影响页面渲染性能，而正常情况下【计算样式】和【重排】操作会在函数结束后统一执行。

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta ></article>  <script>    const domArticle = document.querySelector('#article')    // const { offsetTop } = domArticle    function reflow () {      const domH1 = document.createElement('h1')      domH1.innerHTML = 'h1'      domArticle.appendChild(domH1)      /**       * 强制同步布局       * 在修改元素后又获取元素的位置时会触发强制同步布局，影响渲染性能       * 解决办法是采用读写分离的原则，同一个函数内只读、只写       */      const { offsetTop } = domArticle      console.log(offsetTop)    }    window.onload = () => {      for (let i = 0; i < 10; i++) {        reflow()      }    }  </script></body></html>
```

在函数运行时执行了 10 次【计算样式】和【重排】

反复触发强制同步布局也叫**布局抖动**

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA787MQeVmu8IqP080VibO0Cb6XiblRh6g0xvu4yOGyADLRVfQHqALCtwcA/640?wx_fmt=png)

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta >
  <title>Document</title>
</head>
<body>
  <article id="article"></article>

  <script>
    const domArticle = document.querySelector('#article')
    const { offsetTop } = domArticle

    function reflow () {
      const domH1 = document.createElement('h1')
      domH1.innerHTML = 'h1'

      domArticle.appendChild(domH1)

      /**
       * 强制同步布局
       * 在修改元素后又获取元素的位置时会触发强制同步布局，影响渲染性能
       * 解决办法是采用读写分离的原则，同一个函数内只读、只写
       */
      // const { offsetTop } = domArticle
      console.log(offsetTop)
    }

    window.onload = () => {
      for (let i = 0; i < 10; i++) {
        reflow()
      }
    }
  </script>
</body>
</html>
```

我们遵循读写分离的原则，将读取位置操作放到函数外，我们可以发现就算循环插入 10 个 dom 节点，也只需要执行一次【计算样式】和【重排】。

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7V3icZzJ5hEV6PtAYR9WDXxQGRliaNcFJO5MZ4kRacPulED2hx3KOTLPQ/640?wx_fmt=png)

### 如何减少重排与重绘

1.  脱离文档流 (绝对定位、固定定位)，脱离文档流的元素进行重排不会影响到其他元素。
    
2.  图片渲染时增加宽高属性，宽高固定后，图片不会根据内容动态改变高度，便不会触发重排。
    
3.  尽量用 CSS3 动画，CSS3 动画能最大程度减少重排与重绘。
    
4.  使用`will-change: transform;`将元素独立为一个单独的图层。（定位、透明、transform、clip 都会产生独立图层）
    

静态文件优化策略
--------

### 图片格式

#### jpeg

适合色彩丰富的图、Banner 图。不适合：图形文字、图标、不支持透明度。

#### png

适合纯色、透明、图标，支持纯透明和半透明。不适合色彩丰富图片，因为无损储存会导致储存体积大于 jpeg

#### gif

适合动画、可以动的图标。支持纯透明但不支持半透明，不适合色彩丰富的图片。

埋点信息通常也会使用 gif 发送，因为 1x1 的 gif 图发送的网络请求比普通的 get 请求要小一些。

#### webp

支持纯透明和半透明，可以保证图片质量和较小的体积，适合 Chrome 和移动端浏览器。不适合其他浏览器。

#### svg

矢量格式，大小非常小，但渲染成本过高，适合小且色彩单一的图标。

### 图片优化

*   减少图片资源的尺寸和大小，节约用户流量
    
*   设置`alt="xxx"`属性，图像无法显示时会显示`alt`内容
    
*   图片懒加载， `loading="lazy"`为原生，建议使用`IntersectionObserver`自己做懒加载
    
*   不同环境加载不同尺寸和像素的图片`srcset`与`sizes`的使用。
    
*   采用渐进式加载 先加载占位图，然后加载模糊小图，最后加载真正清晰的图
    
*   使用 Base64URL 减少图片请求数
    
*   采用雪碧图合并图片，减少请求数。
    

### HTML 优化

*   语义化 HTML，代码简洁清晰，利于 SEO，便于开发维护。
    
*   减少 HTML 嵌套关系，减少 DOM 节点数量。
    
*   提前声明字符编码，让浏览器快速确定如何渲染网页内容`<html lang="en">` `<meta charset="UTF-8">`
    
*   删除多余空格、空行、注释、无用属性
    
*   减少 iframe，子 iframe 会阻塞父级的 onload 事件。可以使用 js 动态给 iframe 赋值，就能解决这个问题。
    
*   避免 table 布局
    

### CSS 优化

*   减少伪类选择器，减少选择器层数、减少通配符选择器、减少正则选择器
    
*   避免 css 表达式`background-color: expression(...)`
    
*   删除空格、空行、注释、减少无意义的单位、css 压缩
    
*   css 外链，能走缓存
    
*   添加媒体字段，只加载有效的 css 文件
    

```
<link rel="stylesheet" href="./small.css" media="screen and (max-width:600px)" /><link rel="stylesheet" href="./big.css" media="screen and (min-width:601px)"/>
```

*   使用 css `contain`属性，能控制对应元素是否根据子集元素的改变进行重排
    
*   减少`@import`使用，因为它使用串行加载
    

### JS 优化

*   通过 script 的 async、defer 属性异步加载，不阻塞 DOM 渲染
    
*   减少 DOM 操作，缓存访问过的元素。
    
*   不直接操作真实 DOM，可以先修改，然后一次性应用到 DOM 上。（虚拟 DOM、DOM 碎片节点）
    
*   使用 webworker 解决复杂运算，避免复杂运算阻塞主线程，webworker 线程位于渲染进程
    
*   图片懒加载，使用`IntersectionObserver`实现
    

```
<!DOCTYPE html><html lang="en">  <head>    <meta charset="UTF-8" />    <meta http-equiv="X-UA-Compatible" content="IE=edge" />    <meta  />    <style>      img {        height: 200px;        display: block;      }    </style>    <title>Document</title>  </head>  <body>    <img src="./loading.gif" data-src="./01.jpg" />    <img src="./loading.gif" data-src="./02.jpg" />    <img src="./loading.gif" data-src="./03.jpg" />    <img src="./loading.gif" data-src="./04.jpg" />    <img src="./loading.gif" data-src="./05.jpg" />    <img src="./loading.gif" data-src="./06.jpg" />    <img src="./loading.gif" data-src="./07.jpg" />    <img src="./loading.gif" data-src="./08.jpg" />    <img src="./loading.gif" data-src="./09.jpg" />    <img src="./loading.gif" data-src="./10.jpg" />    <script>      const intersectionObserver = new IntersectionObserver((changes) => {        changes.forEach((item, index) => {          if (item.intersectionRatio > 0) {            intersectionObserver.unobserve(item.target)            item.target.src = item.target.dataset.src          }        })      });      const domImgList = document.querySelectorAll("img");      domImgList.forEach((domImg) => intersectionObserver.observe(domImg));    </script>  </body></html>
```

*   虚拟滚动
    
*   使用`requestAnimationFrame`来做动画，使用`requestIdleCallback`来进行空闲时的任务处理
    
*   尽量避免使用 eval，性能差。
    
*   使用事件委托，能减少事件绑定个数。事件越多性能越差。
    
*   尽量使用 canvas、css3 动画。
    
*   通过 chrome 覆盖率（Coverage）工具排查代码中未使用过的代码并将其删除
    
*   通过 chrome 性能（Performance）工具查看每个函数的执行性能并优化
    

### 字体优化

FOUT(Flash of Unstyled Text）等待一段时间，如果没加载完成，先显示默认。加载 后再进行切换。

FOIT(F1ash of Invisib1e Text） 字体加载完毕后显示，加载超时降级系统字体（白 屏

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta >  <style>    @font-face {      font-family: 'hagan';      src: url('./font.ttc');      font-display: swap;      /* b1ock 35 内不显示，如果没加载完毕用默认的 */      /* swap 显示老字体 在替换*/      /* fa11back 缩短不显示时间，如果没加载完毕用默认的，和b1ock类似*      /* optional 替换可能用字体 可能不替换*/    }    article {      font-family: hagan;    }  </style>  <title>Document</title></head><body>  <article>ABC abc</article>  </body></html>
```

浏览器储存优化策略
---------

### Cookie

`cookie`在过期之前一直有效，最大储存大小为 4k，限制字段个数，不适合大量的数据储存，每次请求会携带`cookie`，主要用来做身份校验。

优化方式：

1.  需要合理设置`cookie`有效期
    
2.  根据不同子域划分`cookie`来减少`cookie`传输
    
3.  静态资源域名和`cookie`域名采用不同域名，避免静态资源请求携带`cookie`。
    

### LocalStorage

Chrome 下最多储存 5M，除非手动清除，否则一直存在。可以利用`localStorage`储存静态资源。比如储存网页的`.js`、`.css`，这样会使页面打开速度非常快。例如 https://m.baidu.com

_/index.js_

```
const name = 'hagan'function showName () {  console.log(name)}showName()
```

_/index.html_

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta ></script>  <script>    cacheFile('/index.js')    async function cacheFile (url) {      const fileContent = localStorage.getItem(url)      if (fileContent) {        eval(fileContent)      } else {        const { data } = await axios.get(url)        eval(data)        localStorage.setItem(url, data)      }    }  </script></body></html>
```

### SessionStorage

会话级别储存，可用于页面间的传值

### IndexDB

浏览器的本地数据库，大小几乎无上限

其他优化策略
------

*   关键资源个数越多，首次页面加载时间就会越长
    
*   关键资源的大小，内容越小下载时间越短。
    
*   优化白屏，合理使用内联 css、js
    
*   预渲染，打包时进行预渲染，生成静态 HTML 文件，用户访问时直接返回静态 HTML。
    
*   服务端渲染同构，加速首屏速度（耗费服务端资源），有利于 SEO 优化。首屏使用服务端渲染，后续交互使用客户端渲染。
    

使用 PWA 提高用户体验
-------------

webapp 用户体验差的一大原因是不能离线访问。用户粘性低的一大原因是无法保存入口，PWA 就是为了解决 webapp 的用户体验问题而诞生的。使用 PWA 能令站点拥有快速、可靠、安全等特性。

1.  Web App Manifest 将网站添加到电脑桌面、手机桌面，类似 Native 的体验。
    
2.  Service Worker 配合 Cache API，能做到离线缓存各种内容。
    
3.  Push API 配合 Notification API，能做到类似 Native 的消息推送与实时提醒。
    
4.  App Shell 配合 App Skeleton，能做 App 壳与骨架屏
    

参考资料
====

*   https://www.w3.org/TR/navigation-timing-2/
    

关注我的公众号，一起学习吧～
==============

![](https://mmbiz.qpic.cn/mmbiz_png/EibZvicb0pyanTibQrlYSYsNkgpCuC4nrA7ia1vicsJsp8qXpWd9PF81jD9CqKZB6Z5yia60P2V9aWbFURiaS01cY6BLA/640?wx_fmt=png)