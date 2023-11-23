> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WUVVpEoXdhVOlwtjgpLX5A)

> 今天的文章来得晚了一点，就是为了等这个视频，给我们自己的大会做个小推广～
> 
> 腾讯 TWeb 前端技术大会，将于 10 月 24 日 9 点正式举办！线上直播票限时优惠进行中，请点击下方视频内链接报名参会，了解业界领先技术方向与实践，一起跟大厂技术大咖交流～

**1. 引言**  

============

在使用 `React` 之前，不知道小伙伴们有没有遇到过 `更新卡顿` 的问题，如下为 `React` 应用更新时的火焰图，JS 执行 287 ms 后，渲染任务才开始（25.4ms）。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbQ6BFxoxtWcmBJJuFBA8D8RSAnP6EJplJBMiaibeWXkibj2uIZ2VdNpaBQ/640?wx_fmt=png)

主流浏览器刷新频率为 `60Hz`，即每 16.6ms 浏览器刷新一次，每 16.6ms 要完成 JS 执行、重绘重排。而 JS 线程和 GUI 线程是互斥的，在浏览器的一帧里（16.6ms）JS 脚本执行和页面渲染是同步执行的，一旦 JS 脚本执行时间过长，页面就会出现掉帧卡顿。

为了减少 JS 脚本执行的时长，`React` 重写了架构来解决卡顿问题。

**2. React 架构重写**
=================

**2.1. React16 之前的架构**
----------------------

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbb6trLa8ic9bjwPNTg6fBzibNY4sibIzmJ94B33b5AkCx6alYqcjG1XWlw/640?wx_fmt=png)  

（图摘自 React Conf 2017 Lin Clack 的  Live）

*   **reconciler**：调和（也叫协调）器。协调可以理解为：将以虚拟形式存在的 VDOM 与真实 DOM 同步的一个过程（React 官方对 reconciler 的解释更偏向于源码角度）。所以协调器的一个核心就是 diff，`React15` 的协调也叫栈调和（Stack reconciler）。
    
*   **renderer**：渲染器。`React` 组件发生更新时，调和器通知渲染器将变化的 VDOM 重新渲染到页面。
    

**2.2. React16 架构（Fiber 架构）**
-----------------------------

`React16` 重写架构解决卡顿问题。

上文提到，JS 线程和 GUI 线程是互斥的，所以在浏览器的一帧里（16.6ms）JS 脚本执行和页面渲染是同步执行的，一旦 JS 脚本执行时间过长，页面就会出现掉帧卡顿。

而 `React15` 组件的挂载和更新都采用递归更新，一旦 vDOM 嵌套层次很深，页面就会出现比较严重的卡顿。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbYOxKcRPib1ewflu9PcyMFtlmibVeKPQCWRTvdWaKpeibtBZjS5y1DnABQ/640?wx_fmt=png)

（同步渲染，图摘自 React Conf 2017 Lin Clack 的 Live）

**那如何解决这个问题呢？**

有篇文章 《理解 React Fiber & Concurrent Mode》 通过类比 `HTTP` 队头阻塞，很好地解释了解决这个问题的原理。

`HTTP` 队头阻塞的根本原因在于，`HTTP` 基于 `请求-响应` 的模型，在同一个 TCP 长连接中，前面的请求没有得到响应，后面的请求就会被阻塞。`HTTP/2` 提出了通过 `二进制分帧` 来解决这个问题，原来 Headers + Body 的 `HTTP` 报文格式，被拆分成一个个的二进制帧，这些帧在 TCP 管道里没有先后顺序，服务器接收到的帧可以是乱序的，因此就解决了排队等待导致的阻塞问题。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbHdsO3mXmiccxZYz4KOOkhHGzau9QNR4TfG9ZuLu7ib9jb4NhLNL25bzQ/640?wx_fmt=png)

`React` 的卡顿问题和 `HTTP` 队头阻塞问题的本质是一样的，无法简单地通过提高 CPU 计算速度来解决。解决这个问题的答案，就是在浏览器每一帧的时间里，预留出来一部分给 JS 线程（从 源码 可以看到预留的时间是 `5ms`）。

```
// react/packages/scheduler/src/forks/SchedulerHostConfig.default.js// Scheduler periodically yields in case there is other work on the main// thread, like user events. By default, it yields multiple times per frame.// It does not attempt to align with frame boundaries, since most tasks don't// need to be frame aligned; for those that do, use requestAnimationFrame.let yieldInterval = 5;
```

如果预留的时间用完了，JS 线程还没执行完，那么 JS 线程就会被中断阻塞，GUI 渲染线程获得执行权，这一帧执行完了，`React` 则继续被中断的任务。其实，浏览器已经实现了这一个 API，参见 requestIdleCallback。由于兼容性等原因，`React` 实现一套自己的 Polyfill ，这就是 `Scheduler（调度器）`，一起组成了 `React16` 的新架构：

*   **Scheduler**：调度器。
    
*   **Reconciler**：协调器。由 `Stack Reconciler` 变成 `Fiber Reconciler`。
    
*   **Renderer**：渲染器。
    

`React16` 的 Reconciler 和 Renderer 也不再像 `React15` 一样交替工作，原因很简单，中断更新会带来一个问题 —— 渲染不完全。所以 `React16` 的解决方法是给 VDOM 打标记，然后统一更新，具体流程如下：

1.  Scheduler 发现浏览器有空闲时间，把更新任务交给 Reconciler；
    
2.  Reconciler 给需要变化的组件打上 `增/删/更新` 的 Tag（ReactSideEffectTags）；
    
3.  当所有组件都打上标记后，才会交给 Renderer 处理。
    

**费这么多时间重写架构就只是为了提升运行时性能吗？**

duck 不必，其实 `Concurrent Mode` 才是架构重写的源动力，也是 `React` 未来的发展方向。在这个架构基础下，也会有更多的基于 `Concurrent Mode` 的上层应用产生。

**3. Concurrent Mode**
======================

**3.1 模式介绍**
------------

根据 官网 的介绍我们了解到：

**Concurrent Mode 是什么？**

`Concurrent Mode` 是 `React` 的一组新功能。可帮助应用保持响应，并根据用户的设备性能和网速进行适当地调整。

**Concurrent Mode 的特性？**

*   可以控制渲染流程，可中断 JS 执行，把控制权交还给浏览器。
    
*   并发，引入优先级调度算法，可以并发执行多个更新任务。
    
*   将人机交互的研究成果投入实际的应用当中。
    

所谓的人机交互研究成果，举个例子，对于不同的 UI 交互，人们对于它的 “忍受度 “ 还是有比较大的差别，比如点击和页面跳转，可以忍受稍长时间的等待，但对于文本输入之类的交互，就需要比较比较快的响应。很明显，这两种交互在 UI 的渲染过程中应该有优先级，`React` 作为 UI 框架，期望通过 `Concurrent Mode` 将这种优先级的判断给完美地解决掉。

**3.2 尝试**
----------

demo 尝试

对比一下同步更新和异步更新，在快速输入时候的性能表现。

**同步更新**

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbkapBaAe89ronmyRTg4nacHUicWAwRG2UozRYClPyeIdAVRias8YQod6A/640?wx_fmt=gif)

**异步更新**

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtb37Rqsla8skjybAszwM7c4pm6repSW5B5j7F6qNxTn7OkoKVLNZ62yg/640?wx_fmt=gif)

**结论**：同步更新有明显的输入卡顿，异步更新有比较好的响应速度。

**demo 有个小细节**

demo 使用的是 `16.8.3` 版本的 `React`，我们上面提到 `React16` 做了架构调整，已经从底层支持 `Concurrent Mode` 了，但是并没有开启 `Concurrent Mode`。目前只有实验版的 `React` 才会开启 `Concurrent Mode` 的新特性。

```
"react": "16.8.3"
```

所以在代码里手动调度了一下。

```
// 后面会提到 scheduleCallback 这个函数import { unstable_scheduleCallback } from"scheduler";const handleChange = e => {  switch (strategy) {    case"async":      unstable_scheduleCallback(() => {          this.setState({ value });      });  }}
```

**4. Concurrent Mode 原理**
=========================

自底向上了解 `Concurrent Mode` 原理。

上面提到过 `React16` 架构重写的源动力是 `Concurrent Mode`，相较于 `React15`，新增了 `Scheduler` 调度器，`Reconciler` 由 `Stack Reconciler` 变成 `Fiber Reconciler`。

这一小部分介绍 `React` 是如何从架构层面，即 `Scheduler` 和 `Reconciler` 支持 `Concurrent Mode` 的特性的。通过这一部分的学习，希望你对上面提到的 `Concurrent Mode` 是什么、 `Concurrent Mode` 的特性会有更深层次的理解。

**4.1. 概览**
-----------

`Scheduler` 请求调度，等待浏览器有空闲时间通知 `Reconciler` 执行任务。

此次任务分配的时间切片用完了则中断，线程控制权交还浏览器。

‍![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtb9usMnNxdF4b2u77OkCCLgcFWuxG6Jltiaic16rsMUbkSnZmGceOMeezw/640?wx_fmt=png)

**4.2. 时间切片**
-------------

### **4.2.1. Scheduler —— 调度**

`React` 为了解决卡顿问题，将更新任务作为时间切片来执行，因此需要一个机制来调度切片，浏览器原生提供了 requestIdelCallback API。

```
function task(deadline) {  while (true) {    if (!deadline.timeRemaining) {      requestIdleCallback(task);      // 主动退出循环，将控制权交还浏览器      break;    }  };}requestIdleCallback(task);
```

但是考虑到 `requestIdelCallback` 的兼容性等问题，`React` 做了一个 Polyfill 代替 `requestIdelCallback`，这其实就是 `Scheduler`，值得一提的是，`Scheduler` 是独立于 `React` 的一个库。

在一帧里 JS 的执行顺序，只有 `requestIdelCallback` 是在浏览器重绘重排之后。退而求其次，我们选择宏任务来代替，`setTimeout` 是我们最熟悉的宏任务调度函数，但有一个 api 要比它执行顺序靠前，即 MessageChannel。当浏览器不兼容时，再降级使用 `setTimeout`。

所以 上述提到的 api 的执行顺序如下：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbA6SS2yVj18s2FPzPOHe2wLG3ssHxHFFdrOlsvhdJGJGHxjia3SBVJnQ/640?wx_fmt=png)

### **4.2.2. 切片标准**

默认 `5ms`（源码），之后会依据系统 `fps` 来进行调整（源码）。

```
const forceFrameRate = (fps) => {  if (fps < 0 || fps > 125) {    return;  }  if (fps > 0) {    yieldInterval = Math.floor(1000 / fps);  } else {    yieldInterval = 5;  }};
```

**4.3. Reconciler 改造**
----------------------

有了 `Scheduler` 的调度能力，我们可以将任务拆分成很多个切片执行，这样我们就能中断长任务，去做一些更高优先级的任务。中断机制最重要的是考虑现场保护和现场还原，`React15` 的 `Stack Reconciler` 是用栈递归来做更新任务，会让现场保护变得特别复杂，所以从 `React16` 开始引入了 `Fiber` 模型。

`Fiber Reconciler` 相比较于 `Stack Reconciler` 做了哪些改变呢？

### **4.3.1. 数据结构改造**

新增 `Fiber` 数据结构。

`Fiber Reconciler` 在 `diff` 时，会依据 VDOM 的信息生成 Fiber 树。

原本基于 VDOM 的递归，就变成基于 Fiber 节点的迭代，同时 Fiber 节点在内存中保存了需要处理的上下文信息，可以很方便地中断和恢复。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbdOhQxiauP1pbpjGUP6Ygz1Cz7ckMWWicrzK2oIUjZrTNnRXspFumn0zA/640?wx_fmt=png)

备注：VDOM 其实一直都存在，只不过是 `diff` 的过程新增了一个 Fiber 树的结构。

### **4.3.2. 生命周期（阶段）改造**

`React15` 的更新过程是一边 `diff`，一边提交。

引入时间切片后，一边 `diff` 一边提交的模式显然不再适用。`React16` 则把更新过程拆成两部分 —— 协调阶段和提交阶段。

**协调阶段**

协调阶段（diff 阶段）会找出所有节点变更，例如节点新增、删除、属性变更等等（副作用），**只有这个阶段可以被中断**。

```
static getDerivedStateFromProps()shouldComponentUpdate()Render()
```

**提交阶段**

提交阶段将节点变更一次性渲染到页面，这个阶段不可中断。因为这个阶段的生命周期里可能会做一些带 `副作用` 的操作，如果中断了，可能会重复执行，带来一些意想不到的 bug。

```
getSnapshotBeforeUpdate()<br style="line-height: 1.6 !important;">componentDidMount()<br style="line-height: 1.6 !important;">componentDidUpdate()<br style="line-height: 1.6 !important;">componentWillUnmount()
```

**4.4. 优先级模型**
--------------

`Concurrent Mode` 模式下的更新是异步可中断的更新，除了时间片用完，还有一种中断的可能：正在更新的任务被中断，转而开始一次新的更新。我们可以说后一次的更新打断了正在执行的更新，这就是优先级的概念：后一次任务的优先级更高，打断了正在执行的更低优先级的任务。

### **4.4.1. expirationTime 模型**

`Scheduler` 除了拥有 `requestIdelCallback` 的能力，还提供了多种优先级供调度选择。

```
ImmediatePriority:<br style="line-height: 1.6 !important;">UserBlockingPriority:<br style="line-height: 1.6 !important;">NormalPriority:<br style="line-height: 1.6 !important;">LowPriority:<br style="line-height: 1.6 !important;">IdlePriority:
```

`Scheduler` 提供了两个重要的 api：

*   **runWithPriority**：优先级调度的函数，`React` 内部所有需要优先级调度的都会用到；
    
*   **scheduleCallback**：不同的是可以传一个优先级参数，根据任务优先级的大小先后执行（模拟 `requestIdelCallback`）。
    

这里的优先级表示啥呢？

指任务的**过期时间（expirationTime）**，也就是：

*   过期时间越短，优先级越高
    
*   随着时间推移，当前时间越接近过期时间，优先级变高
    
*   某个任务的过期时间比当前时间短，表示已经过期，需要立即执行（可能会发生中断）
    

### **4.4.2. Lane (s) 模型**

**Lane (s) 模型**是从源码角度来定义的。官方的定义详见 React v17.0 rc 版本发布，发布里提到的” 改进启发式更新算法 “其实就是替换了优先级模型 - Lane (s) 模型，可见 PR。

**expirationTime 模型**，用过期时间来标识优先级大小对于我们来说有很小的心智成本，但是这种优先级模型仅适合于纯 CPU 的中断恢复，无法区分 CPU 和 IO 任务的优先级，Lane (s) 模型应运而生。

**Lane** 是什么？看下面的赛车车道，`React` 优先级寻道的过程就像是赛车竞赛时在争抢赛道。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbaDTdYpZATpAfQic8OE9xDRtQ3nY4K3hic111tMdKiaO6icvCeEbcMgiaqKQ/640?wx_fmt=png)

这是 `Fiber Reconciler` 中定义的赛道类型：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbEZjoJD0Vla36ynGbUnDQ9B0d264GcaIaPPJZTdJWBjzBAGe3l7caPg/640?wx_fmt=png)

*   其中 Lane (s) 表示优先级区间，31 个 bit，每一个 bit 都表示一个优先级，如果有多个 bit 则表示这一类型支持批处理，各种类型的区间不会重合（除了 `NonIdleLanes`）；
    
*   其中 `InputDiscreteLanes` 表示” 用户交互 “触发的更新所拥有的优先级区间，`SyncLane` 表示同步更新，`DefaultLanes` 表示异步请求后更新；
    

`React` 的每一次 `update`，都会获得如下的优先级之一：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbT04CsmzqIvjcNlxibsKHzXDo6ib6mO8YmHWuZ0o1IH2pQ584GZYicfXOQ/640?wx_fmt=png)

比如，点击事件获得 `InputDiscreteLanePriority`，对应优先级区间 `InputDiscreteLanes`；异步请求获得 `DefaultLanePriority`，对应优先级区间 `DefaultLanes`。

我们就以” 点击事件 “作为 case，了解它的寻道逻辑。

*   触发点击事件，此次 update 获得 `InputDiscreteLanePriority` 优先级；
    
*   `InputDiscreteLanePriority` 对应 `InputDiscreteLanes` 赛道，该赛道包含倒数第 4、5 个位置；
    
*   如果第 5 个位置被占用则测试第 4 个，两个都满的话就降级到 `InputContinuousLanePriority` 赛道寻找。
    

**Lane(s)** 模型相较于 **expirationTimes** 模型更加地细粒度化，可扩展性也更强，也就很好地解决了 CPU 任务和 IO 任务的优先级区分问题。

**5. Concurrent Mode 的更多可能**
============================

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtby5oB7V2JG9NpOK80czWsxpUPIghq34Lr6ZzLMDCYwvhIz4cuskLqiag/640?wx_fmt=png)

上面说了一堆都是在分析 `Concurrent Mode` 模式在 CPU 上的表现以及原理。然而它的能力远不止这些， `Concurrent Mode` 模式下还提供了很多的 API，可能会是未来 `React` 的一种开发模式。

**6. 展望 React18**
=================

`React17` 被业界称作是 “垫脚石” 版本，其最主要的变化就是 `Concurrent Mode`（Change Log）。

React18 发布公告

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbUNsB0WUHTAraePXfCYs0ffXzqFo7tvUQ2zQgz4icSoq2xNToplKvb0A/640?wx_fmt=png)

`Concurrent Mode`的特性将会采用渐进式升级的策略，而不是我们熟悉的 "all-or-nothing"。

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtASWS2KK5DOaHjiasJGHBtbWasmOGFQWxTMick0cZQV0I22KYYsibOePGnL2M4DIseRKA249wtE3ziag/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)