> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/R8sGb5zCtChDlIovZX5XjA)

Largest Contentful Paint（LCP）是衡量页面加载性能的关键指标之一，它记录了页面中最大文本块或图像元素被渲染的时间。优化 LCP 可以提升用户体验，以下是一些提升 LCP 的策略：

1.  **优化关键渲染路径**：确保关键资源（如 CSS、JavaScript 和图像）尽快加载，以便浏览器可以快速渲染页面内容。
    
2.  **减少重排和重绘**：通过减少 DOM 操作和使用 CSS 属性来避免重排和重绘，可以加快页面渲染速度。
    
3.  **使用性能预算**：为网站设置性能预算，限制资源文件的大小，避免过大的文件影响页面加载。
    
4.  **延迟非关键资源加载**：使用`async`或`defer`属性加载非关键 JavaScript 文件，或者使用`lazy-loading`属性加载非视口图像，以减少对 LCP 的影响。
    
5.  **优化图像**：使用现代图像格式（如 WebP）和适当的压缩，确保图像快速加载且不影响视觉质量。
    
6.  **使用 CDN 和缓存**：通过内容分发网络（CDN）和浏览器缓存来减少资源加载时间。
    
7.  **监控和测试**：使用工具如 Google Lighthouse 来监控 LCP，并根据测试结果进行优化。
    
8.  **服务器响应时间**：优化服务器性能，减少首字节时间（Time to First Byte, TTFB），以加快资源的加载速度。
    

通过这些方法，可以有效地提升 LCP，从而改善用户在浏览网页时的感知加载速度。

今天分享这篇文章来详细谈谈如何有效地提升 LCP。

以下是正文：

* * *

### 导读

LCP 是 **Core Web Vitals** 的三个关键指标之一，Core Web Vitals 是 Google 用于评估网页用户体验的标准之一。为了获得良好的用户体验，Google 建议 LCP 时间在 2.5 秒以内。如果 LCP 超过 4 秒，则需要进行优化。

文本将详细介绍如何提升 LCP（Largest Contentful Paint），优化前端性能。

### 什么是 LCP？

**LCP (Largest Contentful Paint)** 是 **Core Web Vitals** 一个关键的 Web 性能指标，用于衡量网页的加载性能。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEEQ186zHUyC1YdpXdEgpibQ6X3jrn1rdlhQa1y5Vt4BbQ78wTXBpnkWg/640?wx_fmt=jpeg)mceclip2.webp

具体来说，LCP 是指从用户请求页面开始到页面主体内容（如大图像、视频或大块文本）完全加载并显示在视口中所需的时间。LCP 越短，用户感受到的页面加载速度就越快，这对提升用户体验和页面留存率至关重要。

为了获得良好的用户体验，Google 建议 LCP 时间在 2.5 秒以内。如果 LCP 超过 4 秒，则需要进行优化。

**Core Web Vitals** 三个关键指标中其它两个指标是 **FID（First Input Delay，首次输入延迟）** 和 **CLS（Cumulative Layout Shift，累积布局偏移）** 。优化这些指标可以提升用户体验和搜索引擎排名。

### 优化 LCP 的重要性

优化 LCP 不仅仅是为了提高网站的加载速度，还与 SEO 密切相关。Google 已将页面体验作为排名因素，LCP 是核心网页指标之一。一个优化的 LCP 时间有助于：

*   **提高搜索引擎排名**：页面加载时间快的网站往往在搜索引擎结果中排名更高。
    
*   **提升用户体验**：快速的 LCP 时间可以减少用户等待时间，提高用户满意度。
    
*   **增加页面留存率**：加载速度快的页面可以减少用户流失，尤其是在移动设备上。
    

### 关键渲染路径（Critical Rendering Path）

在介绍如何优化 LCP 前，我要先给大家介绍一下什么是 `关键渲染路径（Critical Rendering Path）`。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibE4hbPo0Z4CTwD6zHTpl2ibOFhsy8onp8k0V4iajzq14jg03zS4iahNuUEQ/640?wx_fmt=jpeg)图片 2.png

**Critical Rendering Path (CRP)** 是浏览器从接收到 HTML 文档到将网页完全呈现给用户这一过程中所需的关键步骤。CRP 主要涉及将 HTML、CSS 和 JavaScript 解析为像素并呈现在用户的屏幕上。理解 CRP 有助于优化网页性能，减少页面的首次加载时间，从而提高用户体验。

#### CRP 的关键步骤

##### HTML 解析和 DOM 树构建 (HTML Parsing and DOM Construction)

*   浏览器从服务器接收 HTML 文件并开始解析它，构建一个称为 **DOM（文档对象模型）** 的树状结构。DOM 树包含网页的内容和结构，表示 HTML 文档的层次。
    

##### CSS 解析和 CSSOM 树构建 (CSS Parsing and CSSOM Construction)

*   与 HTML 解析并行，浏览器解析所有的 CSS 文件，构建 **CSSOM（CSS 对象模型）** 树。CSSOM 树包含了所有样式规则及其关系，定义了网页的视觉展示。
    

##### 合成 Render Tree (Render Tree Construction)

*   一旦 DOM 和 CSSOM 树构建完成，浏览器将这两个树合并，生成 **Render Tree（渲染树）** 。Render Tree 只包含需要在屏幕上显示的节点，因此隐藏的元素（例如 `display: none;`）不会包含在内。这个树代表了每个节点如何被绘制在页面上。
    

##### 布局 (Layout)

*   在渲染树生成之后，浏览器计算每个节点在页面中的确切位置和大小，这个过程称为 **布局** 或 **回流 (reflow)** 。这是一个逐步的过程，因为浏览器需要考虑不同设备和屏幕尺寸的布局规则。
    

##### 绘制 (Paint)

*   布局完成后，浏览器将每个节点的样式应用于它们，并开始 **绘制 (painting)** ，将内容实际呈现到屏幕上。这个阶段涉及将渲染树的每个节点转换为屏幕上的像素。
    

##### 合成和显示 (Compositing and Display)

*   在绘制之后，浏览器将这些像素块组合成图层，并最终在屏幕上显示。这一阶段包括 GPU 加速的合成操作。
    

### LCP 的触发元素

了解`关键渲染路径`后，让我们再看看 LCP 触发元素通常是什么：

*   **图像** (`<img>` 元素)
    
*   **图片背景** (`<image>` 或 CSS `background-image`)
    
*   **块级文本元素**（如 `<div>`, `<p>`, `<h1>` 等）
    
*   **视频海报** (`<video>` 元素内的 `poster` 属性)
    

这些元素在视口内加载时，浏览器会记录它们的渲染时间，并将其中加载时间最长的元素作为 LCP。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEehxMqvgCOZtBlvEMIRK7tdJAiaib2X8jldUWxnkHRakEWjkicWextZKqA/640?wx_fmt=jpeg)屏幕截图 2024-08-23 235905.png

如图所示通过 lighthouse 分析出，我的 icons.toolkit.vue 项目页面的 LCP 元素是 H1 标签。

其实优化 LCP 关键是优化 CRP 中 LCP 的触发元素的加载速度。以下是一些指导性的优化策略：

*   **减少阻塞的 CSS 和 JavaScript:** 避免使用阻塞渲染的 CSS 和 JavaScript。可以将 CSS 放在 `<head>` 中，JavaScript 放在页面底部或使用 `async` 和 `defer` 属性。
    
*   **减少 DOM 和 CSSOM 树的复杂性:** 减少不必要的 HTML 和 CSS，尽量避免深层的嵌套结构。
    
*   **利用浏览器缓存:** 缓存静态资源，如 CSS 和 JavaScript 文件，可以减少重新加载时间。
    
*   **优化图片和其他资源:** 使用现代格式的压缩图片，减少图片的大小，并使用懒加载技术，避免加载不在视口中的图片。
    

### 如何优化 LCP？

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibECFggiaTejXH1HE2R0E1yRqaR2kPBU3Z2pB1uF4HbQycVETDH3bh2Akg/640?wx_fmt=jpeg)屏幕截图 2024-08-26 152702.jpg

在了解完 CRP 和 LCP 的触发元素后，我们已经知道优化 LCP 主要是确保关键内容尽快渲染在用户视口中，从而改善页面的加载性能。以下是一些具体的优化策略：

#### 1. 优化服务器响应时间

服务器响应时间直接影响 LCP，因为服务器需要在页面开始加载之前发送初始 HTML 文档。为了优化服务器响应时间，可以：

*   **使用内容分发网络 (CDN)** ：CDN 可以缓存网站内容，并将其分发到离用户最近的服务器，从而减少延迟。
    
*   **优化服务器配置**：确保服务器的性能能够高效处理请求，使用快速的 Web 服务器（如 Nginx 或 Apache）。
    
*   **减少后端处理时间**：优化数据库查询，减少不必要的处理逻辑，使用缓存技术（如 Redis 或 Memcached）。
    

#### 2. 加载关键资源优先

关键资源（如 CSS 和大块的主要内容）应尽可能快速加载，以避免阻塞页面的渲染。可以采取以下措施：

*   **延迟加载非关键资源**：将非关键的 JavaScript 和样式表设置为异步加载或延迟加载，以确保关键内容优先加载。
    
*   **使用 HTTP/2**：HTTP/2 可以并行加载多个资源，有效减少加载时间。
    
*   **内联关键 CSS**：将页面折叠部分（above-the-fold）的关键 CSS 直接内联到 HTML 文档中，以减少首次渲染所需的时间。
    
*   **使用 `preload` 指令**：对关键资源（如字体、重要图片）使用 `<link rel='preload'>` 标签预加载，确保这些资源快速加载和呈现。
    

#### 3. 优化图像和媒体

图像通常是影响 LCP 的主要因素，因为它们往往是页面中最大的内容。优化图像可以显著提升 LCP：

*   **压缩图像**：使用现代图像格式（如 WebP 或 AVIF），并应用适当的压缩技术，减少图像文件大小。
    
*   **设置正确的图像尺寸**：使用响应式图像 (`srcset` 和 `sizes` 属性) 根据设备尺寸加载合适的图像。
    
*   **懒加载非关键图像**：使用 `loading='lazy'` 属性延迟加载页面中不可见的图像，减少初始页面加载时间。
    

#### 4. 减少第三方脚本的影响

第三方脚本（如广告、社交媒体小部件、分析工具）可能会显著拖慢页面加载速度。优化这些脚本可以有效提升 LCP：

*   **异步加载脚本**：使用 `async` 或 `defer` 属性，避免脚本阻塞页面渲染。
    
*   **减少不必要的第三方脚本**：只加载必要的第三方服务，去除不必要的脚本。
    

##### 减少不必要的第三方脚本

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEnzaic8zzdbIMUibNhhPpibZXwq85Fia3GYRLjbSjX5x23zzDs0mhaIG6Kg/640?wx_fmt=jpeg)屏幕截图 2024-08-24 001818.png

上图是通过 Lighthouse 分析出的 js 代码的覆盖率的统计图。通过它可以知道页面中未使用的 js 资源的占比，我们可以根据统计数据，想办法尽量减少未使用 js 资源的占比。

例如 vue 项目中使用 `splitChunks` 配置处理 import 动态加载组件的方式，减少初始化项目时的 js 资源体积。

```
// 懒加载非初始化必须的组件
const CopyrightMeta = import('./components/CopyrightMeta')


```

然后就是类似 element-ui 和 lodash 之类的第三方库使用按需加载的方式仅加载需要的组件和功能函数。

#### 5. 使用浏览器缓存

利用浏览器缓存可以减少重复请求，提高页面的加载速度：

*   **设置适当的缓存头**：确保静态资源（如图像、CSS 和 JavaScript 文件）具有合适的缓存策略，以便用户在后续访问时可以直接从缓存中加载资源。
    
*   **利用服务工作线程 (Service Workers)** ：服务工作线程可以在用户的浏览器中缓存资源，从而减少后续访问时的加载时间。
    

#### 6. 优化 CSS 和字体加载

*   **最小化和压缩 CSS**：删除不必要的空格、注释和代码，并压缩 CSS 文件，减少文件大小。
    
*   **使用字体显示策略**：使用 `font-display` 属性来控制自定义字体的加载行为，避免阻塞文本渲染。
    

##### 字体显示策略

为了提升视觉效果和品牌一致性，许多网站使用自定义字体。然而，自定义字体的使用也会引发一些性能问题，比如增加网页的加载时间，导致文本闪烁或不可见。这些问题会对用户体验产生负面影响。

为了更好地控制字体加载行为，CSS 提供了 `font-display` 属性，它允许开发者指定在字体加载时，浏览器如何处理文本的显示。通过合理使用字体显示策略，可以优化网页的加载体验，确保在字体加载过程中为用户提供最佳的视觉体验。

#### font-display 的值

`font-display` 属性有多个可能的值，每个值代表一种不同的字体显示策略：

*   **auto**（默认值）
    
*   **block**
    
*   **swap**
    
*   **fallback**
    
*   **optional**
    

#### 如何选择合适的 font-display 策略？

选择合适的 `font-display` 策略取决于具体的项目需求和用户体验的优先级：

*   **快速显示文本**：如果优先考虑页面内容的快速展示，可以使用 `swap` 或 `optional`，确保在字体加载过程中文本总是可见。
    
*   **确保一致的视觉效果**：如果视觉一致性和自定义字体的使用是优先考虑的，可以选择 `block` 或 `fallback`，在字体加载后呈现自定义字体。
    
*   **性能优先**：在移动端或性能敏感的应用中，使用 `optional` 可以减少字体加载对性能的影响。
    

针对 LCP 指标具体来说就是使用 `font-display: swap;` 使浏览器在加载字体的同时立即使用后备字体呈现文本。当自定义字体加载完成后，后备字体将被替换为自定义字体，这种策略被称为 “闪烁的无样式文本”（Flash of Unstyled Text, FOUT）。

```
@font-face {
  font-family: 'IconFont';
  src: url('iconfont.woff2') format('woff2');
  font-display: swap;
}


```

**优点**: 文本始终可见，避免了空白文本的问题，提高了可读性。  
**缺点**: 字体切换可能导致短暂的视觉不一致。

### 如何测量 LCP？

要有效地优化 LCP，监控和测量是必不可少的。以下是一些工具和方法来监控 LCP：

*   **Google PageSpeed Insights**：提供对 LCP 的详细分析，并提出优化建议。
    
*   **Web Vitals 扩展**：Google Chrome 浏览器的 Web Vitals 扩展可以实时监控 LCP。
    
*   **Lighthouse**：Lighthouse 是一个开源工具，用于分析网页性能，包含对 LCP 的评估。
    
*   **Web.dev**：这是一个由 Google 提供的在线工具，用于测试网页性能，并生成优化建议。
    

LCP 是一个关键的性能指标，直接影响用户体验和 SEO。通过优化服务器响应时间、加载关键资源、优化图像、减少第三方脚本的影响、使用缓存和优化 CSS 与字体加载等措施，可以显著提升 LCP。

定期监控和优化 LCP，可以确保网站为用户提供快速、流畅的体验，并在搜索引擎排名中保持竞争力。

总结
--

虽然今天的主题聊的是前端性能优化，不过可以看出，作为前端工程师，现在的要求是越来越高了。不仅仅需要掌握前端相关的技术，还需要掌握一些后端相关的技能。在做前端性能优化时，很多时候还需要了解一些 nginx 服务器配置相关的知识，才能更加系统的优化前端性能的。

例如前端性能优化的另外一个重要手段；启用浏览器缓存，就要求需要了解如何在服务端配置启动用缓存。还有为了提高服务器的 HTTP 响应速度，需要在服务端开启 HTTP/2。这都要求前端工程师掌握一定的后端的服务器配置能力。

作者：自由的巨浪

https://juejin.cn/post/7406143794000019506