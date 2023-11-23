> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/OHbzuqUl3tL1YlpLOgEkvA)

一起进步🚀)" data-from="0" data-is_biz_ban="0" data-origin_num="20" data-isban="0" data-biz_account_status="0" data-index="0" class="mp_common_widget">

阅读完本文，你将会知道：

> *   什么是核心 Web 指标，它包含哪些指标？
>     
> *   什么是 FID，它是做什么的？
>     
> *   什么是 INP，它又是做什么的，它为什么会替代 FID？
>     
> *   如何优化 INP 指标？
>     
> *   INP 有什么局限？
>     

在进入正文前，先来看看什么是核心 Web 指标。

核心 Web 指标
---------

核心 Web 指标（Core Web Vitals，CWV）是一组 Web 性能指标。Google 推出它的目的是帮助开发人员关注对优秀的用户体验至关重要的指标。

目前包含 3 组指标：

*   LCP，Largest Contentful Paint，最大内容绘制：是`加载性能`指标。
    
*   FID，First Input Delay，首次输入延时，是`交互体验`指标。
    
*   CLS，Cumulative Layout Shift，累计布局偏移，是`视觉稳定性`指标。
    

关注的交互体验的一个重要方面是响应性，也就是网页对用户交互作出快速反应的能力。

FID 是目前度量网页响应性的一个核心指标。

FID 的诞生以及局限
-----------

FID，First Input Delay，即**首次输入延时**。

输入延时是指从用户第一次与页面交互（例如点击屏幕、用鼠标点击或按键）到交互的事件回调开始运行的时间段。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4UmbR5N4Flf57eRq04y3wxcp1YX5qJB7tPNic4sHyxSV4x8gfVOG8ZuBQ/640?wx_fmt=png)

### 新的方式衡量用户体验

2020 年当 FID 作为核心 Web 指标被引入时，为开发者提供了一种新的方式来衡量真实用户体验的响应性。

与 FID 类似的指标有 TBT 和 TTI。不同的是，TBT 和 TTI 属于加载性能指标，只是近似地衡量页面的互动性。

> *   TBT，Total Blocking Time，总阻塞时间。它的值等于 TTI（可交互时间）减去 FCP（首次绘制）。
>     
> *   TTI，Time To Interactive，首次可交互时间。
>     

而 FID 直接衡量的是用户体验，属于交互体验指标。

一个页面它的 TBT 或 TTI 可能高，加载慢。但根据真实用户与页面交互的方式。FID 指标仍然可能低，页面会被认为是具有响应性的。

### FID 的局限性

虽然 FID 确实改善了衡量页面响应性的方法，但 FID 也有一些局限性。它的名称本质上暴露了两个局限：

*   `首次`：FID 只上报用户第一次与页面交互的响应性。虽然 “第一印象” 很重要，但第一次并不一定代表整个页面生命周期。
    
*   `输入延时`：FID 只测量首次交互的输入延时，即交互开始到事件开始处理这段时间，而事件处理和渲染的耗时，这部分时间是没有被度量的。
    

### 使用 PerformanceObserver 计算 FID

我们可以使用 PerformanceObserver API 计算 FID。

下面是一段简化代码，能帮助我们理解如何计算 FID，完整代码可参考：onFID[1]

```
const observer = new PerformanceObserver((entryList) => {  const firstInput = entryList.getEntries()[0];    const firstInputDelay = firstInput.processingStart - firstInput.startTime;    // 上报 FID});// 只监听首次输入// buffered 设置为 true，可以获取到在 PerformanceObserver 创建之前发生的所有 "first-input" 事件。observer.observe({ type: 'first-input', buffered: true });
```

INP，更好的响应性度量指标
--------------

FID 的这些局限，使得 Google 致力于探索一个更好的响应性度量指标。

2022 年 5 月，INP 诞生了。

INP，Interaction to Next Paint，`从交互到下一次绘制的延时`。它与 FID 一样，属于交互体验指标。

### 能更全面地度量网站响应性体验

Chrome 的使用数据显示，用户在页面上花费的时间有 90% 是在页面加载之后，因此，在测量整个页面生命周期的响应度是非常重要的，这就是 INP 诞生的原因。

它不仅仅测量首次交互，而是所有交互延时。除了输入延时，还包括事件处理时长，渲染延时。它的目标是确保从用户开始交互到下一帧绘制的时间尽可能短，以满足用户进行的所有或大多数交互。

它的上报值是整个页面生命周期中最慢的交互延时（取 98%，忽略异常值）。通常来说，一个拥有良好用户体验的网站，它的 INP 应该不超过 200 ms，如果在 200ms - 500ms 之间，则需要改进，大于 500ms，代表页面响应性很差。为了确保大多数用户都能达到这个目标，我们可以观测 75 分位的 INP。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4UAptp5tVq29V0nOpALQGZRrzt1vBtxicnib8lLDcBnmwVVS756wnGCQOw/640?wx_fmt=png)

同时，从 chrome-ux-report[2]，我们可以看到，93% 的网站在移动设备上具有不错的 FID，

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4UjXrMVT64LAg8n0VPDcfia4jkSEj5178HjAicF80ncuV0kSueiaBfHFBDQ/640?wx_fmt=png)

但只有 65% 的网站在移动设备上具有不错的 INP。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4Uibw78IDh9v9IdFNDNOI0eQbkgXbHWm7dqfAY0SKCmNDACXTvA6pibG9Q/640?wx_fmt=png)

INP 代表的是更准确的网站响应性体验。

### 即将取代 FID

到 23 年 5 月前，INP 还只是一个实验性（`Experimantal`）的指标。

经过了社区的不断验证和反馈，现在，INP 变成了一个待定（`Pending`）的核心 Web 指标。

为什么是 Pending 呢？

其目的是为了让相关生态有时间进行调整，比如一些测量工具的 API 字段，需要从 `experimental_interaction_to_next_paint` 更新为 `interaction_to_next_paint`。

INP 即将在 2024 年 3 月正式成为一个稳定（`Stable`）的核心 Web 指标，彻底取代 FID。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4U3tA6EygFNk0mjQUBJicYraq8tXgrXZia55l2HdNmfG3jBNVutM9hlveA/640?wx_fmt=png)

到那时，INP 将同 LCP 和 CLS 一起，成为的核心 Web 指标。

### 使用 PerformanceObserver 计算 INP

我们也可以使用 PerformanceObserver API 计算 INP。

下面是一段简化代码，能帮助我们理解如何计算 INP，完整代码可参考：onINP[3]

```
let maxDuration = 0;const observer = new PerformanceObserver(entryList => {  const entries = entryList.getEntries();  entries.forEach(entry => {    // 一些不支持的浏览器没有 interactionId，比如 firefox    if (!entry.interactionId) return;         if (entry.duration > maxDuration) {      // 找到了更长的 INP 值      maxDuration = entry.duration;    }  });  const inp = maxDuration;    // 上报 INP});observer.observe({   type: 'event',  durationThreshold: 16,  buffered: true });
```

我们可以使用 Lighthouse，WebPagetest 等工具来度量网页的 INP。

优化 INP
------

从上面的代码中我们可以看到收集到的 INP 的值是 `entry.duration`。那么这个值是怎么计算出来的呢？

先来看看一次交互是怎么组成的，一次交互可分为 3 个阶段：

1.  输入延时（`Input Delay`）= 交互事件回调开始运行时 - 用户发起与页面的交互时，FID 度量的就是这段时间。
    
2.  事件处理（`Processing Time`）= 事件回调运行完成时 - 事件回调运行开始时
    
3.  渲染延时（`Presentation Delay`）= 浏览器显示包含交互的可视结果的下一帧渲染时 - 事件回调运行完成时
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4UrK2kL7uyDNrRHBmAPT1pURgl108YOW3tpfV5uOEog7qib4QjDBnHCpA/640?wx_fmt=png)所以这三个阶段的总和就是总的交互延时。

```
duration = Input Delay + Processing Time + Presentation Delay
```

每一个阶段都会在总的交互延时中占有一定的时间，因此优化交互延时，需要让每一部分的时间尽可能的短。

### 减少输入延时

每个交互都以一定量的输入延时开始。

一些输入延时是不可避免的，比如操作系统识别输入事件并将其传递给浏览器总是需要一些时间。但一些输入延时是可以避免的。

1.  避免反复执行的定时器占用主线程工作
    

JavaScript 中有两个常用的定时器可能导致输入延时：setTimeout 和 setInterval。

*   setTimeout 本身并没有问题，甚至有助于避免 long task。但是，如果在 timeout 后的回调运行时，用户刚好在尝试与页面交互，就可能导致输入延时。应该避免 setTimeout 循环或递归地执行，让其行为变得像 setInterval，同时应该注意确保在它的回调里不会执行过多的工作。
    
*   而 setInterval 在一个 interval 时间间隔上运行回调，因此更有可能阻碍交互。
    

2.  避免 longt task
    

在交互过程中，如果执行的 task 过长，阻塞了主线程时，就会增加输入延时。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4UsYpAptAqLJ18iaQHLgKhXUmyQhQ30fWckugGsKGgWiaoeRSYacBxPUSQ/640?wx_fmt=png)所以，应该尽量减少一项 task 中的工作量，在主线程上做尽可能少的工作，还可以通过分解 long task 来提高对用户输入的响应能力。

3.  注意交互重叠（interaction overlap）
    

这是优化 INP 的一个特别具有挑战性的部分。交互重叠指的是，当在用户首次完成交互后，有机会渲染包含该交互可视结果时，又产生了新的交互。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4Ub9JibwG8x5ibgDCiabYBURvpiaaxkEicyKWZiagNKiafkCM5Zn7ESHyqmu19A/640?wx_fmt=png)交互重叠的来源很简单，可能是用户在短时间内进行了多次交互，比如用户输入表单字段时。如果在输入完成后要进行的交互开销很大，一个常见的场景是会发送网络请求到后端。

面对这种场景我们可以使用 debounce 限制在事件回调在时间段内执行的次数，也可以取消掉上次发出的请求，这样主线程就不用处理那么多的事件回调。

另一个交互重叠增加输入延时的场景是昂贵的动画。因为这会触发很多的 requestAnimationFrame 阻塞交互。我们应该尽可能地使用 CSS 动画，并且使用合成层动画，让动画运行在 GPU 和合成器线程上，而不是主线程。

### 优化事件回调

输入延时只是 INP 测量的第一部分。还需要确保响应用户交互而运行的事件回调可以尽快完成。

1.  优化 long task
    

提高事件处理速度，尽快让出主线程。

2.  建立正确的输入优先级
    

通对不同类型的输入进行分类，建立优先级顺序，例如首选输入、次要输入和可等待输入。

首选输入应该尽可能快地得到响应，而次要输入和可等待输入可以稍后处理。

比如 React 18 新引入的 API `useDeferredValue` 和 `useTransition` 就是用来做这个的，让 value 的更新和回调的执行不阻塞 UI。

3.  避免布局抖动
    

布局抖动，又叫强制同步布局，是一种渲染问题，会造成性能瓶颈。

问题产生的原因就是在同一个任务中，更新了样式，然后立即使用 JavaScript 读取这些新样式，让浏览器被迫做同步的布局工作。

### 减少渲染延时

交互的渲染延时表示从交互的事件回调运行完成到浏览器能够绘制下一帧显示结果的时间段。

1.  减小 DOM 当 DOM 很小时，渲染工作完成的会比较快。可以采取一些办法减小 DOM 的大小，比如使用虚拟列表来避免 DOM 过大，但这样的方法可能效果有限。
    
2.  使用 `content-visibility` 属性延时渲染视口外的元素
    

> https://mp.weixin.qq.com/s/o9lpl7CTwcbjM0q3QMRLTg

这个 CSS 属性可以控制元素在接近视口时才会被渲染，目前还属于实验性属性，在一些浏览器上还不兼容。但确实能有效减少渲染延时，改善 INP。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/K0dLoicpO1icdMtF18hAQe36Fbm1zdKic4U9CXUr8rX7jG1ZibX7Hn4EiaP6MIAsdhPQsZK3Pq6vhC6iaN1UsSa8iaSqg/640?wx_fmt=png)

INP 的局限
-------

INP 度量的是用户在页面上操作全程的响应性能，更贴近用户实际执行时的体验，但同时也有一些局限。

### SPA 的路由跳转，也算作「交互」

在单页应用（SPA）中，路由的跳转，也会被算作「交互」，而不是「导航」。

而用户对于两种不同的行为有着不同的预期，对于「导航」而言一般用户可以忍受超过比普通点击更长的延迟。

### SPA 跨页面上报

这其实是目前 Web 指标的通病。同一个应用不同页面的 INP 会混在一起上报，但可能在使用过程中某个页面其实 INP 是比较小的，或者上报时的 INP 是之前使用的页面而不是上报的页面导致的。

总结
--

INP 是一个新的核心 Web 指标，将在 2024 年 3 月变成 Stable 状态，替代 FID。

它度量页面生命周期的所有交互延时，评估的分数能更贴近用户实际使用时的体验，但同时也有一些局限。

一个新的响应性标准已经建立，对许多人来说，这可能是一条漫长而陌生的道路。

尽早地了解即将到来的变化可以让我们有更多的时间准备来迎接它。

不要等到 INP 成为了 Stable 指标，再去优化它，从现在起，Just Do It。

一起进步🚀)" data-from="0" data-is_biz_ban="0" data-origin_num="20" data-isban="0" data-biz_account_status="0" data-index="1" class="mp_common_widget">

参考
--

*   https://docs.google.com/presentation/d/1thCizKqUxpP7hxmy1m_lrTX7bHz71-zrOipgSUn5wN8/edit#slide=id.g12a9ead5670_2_86
    
*   https://web.dev/inp-cwv/
    
*   https://web.dev/inp/
    
*   https://web.dev/optimize-inp/
    
*   https://web.dev/optimize-input-delay/
    
*   https://web.dev/optimize-long-tasks/
    
*   https://web.dev/dom-size-and-interactivity/
    

### 参考资料

[1]

onFID: https://github.com/GoogleChrome/web-vitals/blob/main/src/onFID.ts

[2]

chrome-ux-report: https://httparchive.org/reports/chrome-ux-report

[3]

onINP: https://github.com/GoogleChrome/web-vitals/blob/main/src/onINP.ts