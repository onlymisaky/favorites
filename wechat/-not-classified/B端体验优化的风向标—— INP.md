> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tjMCBnLfCz0gWDncjLIbKA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群




```

对于一些特别复杂的交互，快速呈现一些初始视觉反馈作为用户提示正在发生某些事情非常重要，下次绘制的时间是执行此操作的最早机会

因此，`INP` 的目的不是测量交互的所有最终效果，而是测量下一次绘制被组织的时间。通过延迟视觉反馈，可能会给用户留下页面没有响应他们的操作的印象

`INP` 的目标就是确保对于用户进行的大多数交互，从用户发起交互到下一帧的的时间尽可能短

在下面的 `gif` 中，右侧的示例给出了手风琴正在打开的即时视觉反馈。它还演示了糟糕的响应能力如何导致对输入的多次意外响应，因为用户认为体验被破坏了。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

在左侧，长任务（`long task`）阻碍了手风琴的打开，这会导致用户多次点击，从而展示出来的行为并不能达到用户的理想状态，所以主线程开始处理时，它会处理延迟的输入，导致打开关闭的执行效果出现问题

本文会解释一下 INP 的工作原理、如何衡量它、并指出相应的改进方案

INP
---

### 什么是 INP

`INP`（`Interaction to Next Paint (INP)`）是一个待定的核心 `web` 重要指标。**「将于 2024 年 3 月取代首次输入延迟 (`FID`)」**。`INP` 使用来自 `Event Timing API` 数据响应评估能力

通过观察用户访问页面的整个生命周期中发生的所有单击、敲击和键盘交互的延迟来评估页面对用户交互的整体响应能力。最终的 `INP` 值是观察到的最长相互作用，忽略异常值。

如果交互导致页面没有响应时，用户体验就会很差。`INP` 观察用户与页面进行的所有交互的延迟，并报告所有（或几乎所有）交互都低于的单个值。低 `INP` 意味着页面始终能够快速响应所有（或绝大多数）用户交互

`Chrome` 使用数据显示，用户在页面上花费的时间有 `90%` 是在加载后花费的，因此，仔细测量整个页面生命周期的响应能力非常重要。这就是 `INP` 指标评估的内容

### INP 的计算方式

`INP` 的主要计算方式是通过观察与页面进行的所有交互计算的，大部分情况下，最差延迟的交互则为 `INP`。

对于一些存在大量交互的页面，随机的故障可能会导致出现异常高的交互，交互越多，这种情况发生的可能性就越大

为了解决这个问题并更好的衡量这些类型页面的实际响应能力，我们忽略每 `50` 次交互中的一个最高交互，当然，大部分页面体验没有超过 `50` 次交互，因此将报告最差的交互

然后像其他指标一样报告所有页面浏览量第 `75%` 的数据，这样进一步消除了异常值，以给出绝大多数用户体验或更好的值

### INP 的满意分数范围

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

  

*   `INP` 小于等于 `200ms` 表示页面响应效果良好
    
*   `INP` 大于 `200ms` 小于 `500ms` 表示页面的响应能力需要改进
    
*   `INP` 大于 `500ms` 意味着页面响应能力较差
    

### 互动行为有哪些

下图描述了交互的生命周期，在事件处理程序开始运行之前发生输入延迟，这可能是由主线程上的长任务 (`long task`) 等因素造成的

交互的事件处理程序随后运行，在下一帧出现之前就会出现延迟

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

`INP` 主要关心的交互类型：

*   鼠标行为
    
*   触摸屏行为
    
*   物理键盘或屏幕上的键行为
    

> 悬停和滚动不计入 `INP`，然而使用键盘滚动 (空格、上下翻页等) 涉及按键，这可能会触发 `INP` 测量的其他事件。由此产生的任何滚动都不计入 `INP` 的计算方式

大部分的交互发现在主页面或 `iframe` 中，比如点击播放视频，最终用户将不知道 `iframe` 中是否包含内容，所以需要 `iframe` 中的 `INP` 来衡量嵌入 `iframe` 也页面的用户体验。

> `javascript` 无法直接访问 `iframe` 内容，因此可能无法测量 `iframe` 中的 `INP`，这将显示为 `CrUX` 和 `RUM` 之间的不同

交互的行为可能有事件组成：

`click` 的 `keydown`、`keypress` 和 `keyup`；

`tap` 的 `pointerup` 和 `pointerdown`；

交互中持续时间最长的事件被认为交互的延迟

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

上图中描述多事件交互：

*   按下鼠标，第一部分交互开始
    
*   在鼠标松开之前，会完成一次绘制，显示一个帧
    
*   鼠标松开之后，必须在下一帧绘制之前运行另一系列的事件
    

`INP` 是在用户离开页面时计算的，结果是一个单独的值，该值代表了页面在整个生命周期中的总体响应性

低 `INP` 意味着页面能够快速的响应用户输入

### INP 与首次输入延迟（FID）有何不同

`INP` 考虑所有的页面交互，`FID` 只考虑第一次交互

**「`FID` 只关心第一个交互的输入延迟，而不关心运行事件处理程序所需的时间，也不关心呈现下一帧的延迟」**

考虑到 `FID` 也是一个负载响应性指标，大概的原理就是如果在加载阶段与页面进行的第一次交互几乎没有可察觉的输入延迟，那么页面的用户体验就是不错的

**「`INP` 不仅仅是关心第一印象」**

通过对所有相互作用进行抽样，可以全面评估用户行为反馈，使 `INP` 成为比 `FID` 更全面的总体反应性指标

### 什么场景下可能获取不到 INP

页面可能不返回 `INP` 值，发生这种情况的原因大概有以下几种：

*   页面被加载，但用户从未点击、轻敲或按下键盘上的任何一个键
    
*   页面被加载，但用户使用不涉及点击、轻敲或使用键盘手势与页面进行交互。
    
    例如：滚动或悬停在元素上不会影响 `INP` 的计算方式
    
*   也没有机器人访问：爬虫、没有编写脚本与页面交互的无头浏览器
    

如何衡量 INP
--------

`INP` 可以使用工具或者在实际业务中进行测量，在实际项目当中收集数据时，我们需要捕获以下提供交互缓慢的背景信息：

*   `INP` 值：这些值的分布将决定页面是否满足 INP 阈值
    
*   页面 `INP` 的选择器字符串：通过记录元素选择器字符串，我们将确切地知道哪些元素负责交互
    
*   页面交互的加载状态，即 `INP`：在一个行为到另外一个行为的过程中，可能会有很多的页面交互变化，这时页面从用户行为到绘制完成并呈现在用户的眼中会经历很多个阶段，这时我们就应该了解到是否需要进行优化
    
*   交互的 `startTime`：记录交互的开始时间 (`startTime`) 可以让我们准确的知道交互在性能时间线上发生的时间
    
*   事件类型：了解到事件类型很重要，它会帮我准确的知道哪个交互事件中回调时间最长
    

当然，这是我们需要考虑的一些性能指标，但是我们并不需要重复的一直去自己实现这些性能指标的逻辑，`Chrome` 提供了很多良好的实现方案，下面我们依次介绍一下：

### 在 CrUX 当中获取 INP

`Chrome` 用户体验报告 (CrUX) 是 `web vitals` 计划的官方数据集，虽然来自 `CrUX` 的数据本身并不能为我们提供解决特定 `INP` 问题所需的全部信息，但是它可以让我们知道我们是否遇到了问题，以下是效果图展示：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### 在 PSI 中获取 INP

PageSpeed Insights 可以为 `CrUX` 数据集中包含的网站提供页面级字段数据：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### 在实际业务当中嵌入 web-vitals

`web-vitals` 是一个非常优秀的 `javascript` 第三方库，它可以查找在实际业务阶段当中交互缓慢的方法

```


javasciprt

复制代码

`import {onINP} from 'web-vitals/attribution';  
  
function sendToGoogleAnalytics ({name, value, id, attribution}) {  
  const {eventEntry, eventTarget, eventType, loadState} = attribution;  
  
  const {startTime, processingStart, processingEnd, duration, interactionId} = eventEntry;  
  
  const eventParams = {  
    // 页面 INP 的值  
    metric_inp_value: value,  
    // 页面唯一 ID，用于按 ID 分组计算总数  
    metric_id: id,  
    // 事件目标：指向负责交互的元素  
    metric_inp_event_target: eventTarget,  
    // 事件交互类型  
    metric_inp_event_type: eventType,  
    // 交互时是否加载页面，用于区分行为前和加载后的交互  
    metric_inp_load_state: loadState,  
    // 页面加载后交互发生的时间  
    metric_inp_start_time: startTime,  
    // 交互中的事件回调处理开始运行  
    metric_inp_processing_start: processingStart,  
    // 交互中的事件回调交互已完成  
    metric_inp_processing_end: processingEnd,  
    // 交互的总持续时间  
    metric_inp_duration: duration,  
    // 用 Event Timing API 分配给交互的交互 ID，可用于聚合相关事件  
    metric_inp_interaction_id: interactionId  
  };  
  
  // 发送到 Google Analytics  
  gtag('event', name, eventParams);  
}  
  
// 将报告传送给 web-vitals INP  
onINP(sendToGoogleAnalytics);  
`
```

### 使用 Web Vitals 的 Chrome 扩展

 在测试交互延迟方面花费的精力最少：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

安装完扩展后在这里可以看到，点击后展示如下内容：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

如果感觉展示时体验不太好，尤其查看 `INP` 相关数据，是需要用户操作的，这时该弹窗会关掉，这时，点击右下角设置 `ICON`，打开配置项进行设置：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

这样我们就可以很清晰的在页面当中看见相应的性能指标

> ps：由于掘金不支持视频上传，所以我把视频转成了 `gif`

由于我们还配置了控制台查看数据的选项，除页面内的浮窗外，我们可以通过控制台看到更多的数据信息：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

### 在控制台获取交互缓慢的信息

在某些情况下，扩展程序可能会被阻止，并且它也无法安装在移动设备上。如果我们想通过远程调试在物理 `Android` 设备上进行测试，后者就会出现问题

这时候我们可以用一部分代码粘贴到控制台当中，以下代码为每次交互生成与 `Web Vitals` 扩展相同的控制台输出：

```
``let worstInp = 0;  
  
const observer = new PerformanceObserver((list, obs, options) => {  
  for (let entry of list.getEntries()) {  
    if (!entry.interactionId) continue;  
  
    entry.renderTime = entry.startTime + entry.duration;  
    worstInp = Math.max(entry.duration, worstInp);  
        
    console.log('[Interaction]', entry.duration, `type: ${entry.name} interactionCount: ${performance.interactionCount}, worstInp: ${worstInp}`, entry, options);  
  }  
});  
  
observer.observe({  
  type: 'event',  
  durationThreshold: 0, // 16 minimum by spec  
  buffered: true  
});  
``
```

> 注意，这里给到的这段代码不是获取到 `INP` 的数据，而是获取到交互缓慢的信息

尾声
--

从最近的 `Chrome` 更新的内容来看，注重性能方面的更新需求也越来越多了，在这个阶段我们需要不断的更新和学会接受新的知识来填充我们的工作并运用到实际业务当中，从 `INP` 替代 `FID` 这一步也很明显的可以感觉到， `Chrome` 官方也不只是希望获取用户第一次的行为数据，而是希望可以清晰的看到用户在一整个网站内所有的行为数据，这样可以让我们更了解用户，更清楚我们的产品方向，也更利于我们更用户提供更加良好的体验效果

本篇文章更侧重于介绍什么是 `INP`、`INP` 关心的数据方向以及如何获取 `INP` 数据，未来会针对如何发现 `INP` 数据指标相关问题及解决办法作出实现

Node 社群

```


  

  

我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

```


   “分享、点赞、在看” 支持一下


```


```