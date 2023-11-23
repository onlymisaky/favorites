> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0-1WE_O6BXwyi3nBnI4Brw)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EjHK6AiaujjS4vnQqjctueCfzcIiaLKbrdIqhYpmy1KD0sIlsz1QT6IvrNc2TML8JmQFibscxsicKOG9FY6IQnPb9g/640?wx_fmt=png)

React 是用 JavaScript 构建**快速响应**的大型 Web 应用程序的首选方式。

设计理念：快速响应

制约瓶颈：CPU 与 IO 瓶颈

*   当遇到大计算量的操作或者设备性能不足时页面掉帧，**导致卡顿**。
    
*   发送网络请求后，由于需要等待数据返回才能进一步操作导致不能快速响应。
    

解决方法：实现异步可中断的更新

老的 React 架构（React 15）
---------------------

React15 架构可以分为两层：

*   Reconciler（协调器）—— 负责找出变化的组件（Diff 算法）
    
*   Renderer（渲染器）—— 负责将变化的组件渲染到页面上
    

Diff 算法将上一次更新的组件和本次更新的组件做对比，被判定为需要更新的组件，会被交给渲染器进行渲染，不同的渲染器会将不同的组件渲染到不同的宿主环境的视图中

### Reconcile 协调器

**在 React 15 中采用的是 stack reconciler 解决方案**

可以通过 `this.setState` 等 API 来触发更新，每次 `update` 时，协调器就会开始它的工作

*   首先会开始 `render` 阶段的执行，**将 JSX 转化成 Fiber Virtual DOM**
    
*   接着会前后两次的 Virtual DOM 进行对比，也就是 **Diff 算法**的工作，会对变更的节点打上对应的操作类型 effectTag
    
*   在 `commit` 阶段，会找到本次更新中变化的 Virtual DOM 节点
    
*   通知 `Renderer` 渲染器**更新对应的视图**
    

### Renderer 渲染器

React 最初只是服务于 DOM，但是这之后被改编成也能同时**支持原生平台的 React Native**。因此，在 React 内部机制中引入了 “渲染器” 这个概念。

**渲染器用于管理一棵 React 树，使其根据底层平台进行不同的调用。**

*   **React DOM Renderer**：将 React 组件渲染成 DOM。它实现了全局 ReactDOMAPI，这在 npm 上作为 react-dom 包。这也可以作为单独浏览器版本使用，称为 react-dom.js，导出一个 ReactDOM 的全局对象.
    
*   **React Native Renderer**：将 React 组件渲染为 Native 视图。此渲染器在 React Native 内部使用。
    
*   **React Test Renderer**：将 React 组件渲染为 JSON 树。这用于 Jest 的快照测试特性。在 npm 上作为 react-test-renderer 包发布。另外一个官方支持的渲染器的是 react-art。它曾经是一个独立的 GitHub 仓库，但是现在我们将此加入了主源代码树。
    
*   ReactArt Renderer ：渲染到 Canvas, SVG 或 VML (IE8)
    

在每次更新发生时，**Renderer** 接到 **Reconciler** 通知，将变化的组件渲染在当前宿主环境。

React15 架构的缺点
-------------

在 `Reconciler` 阶段， 会递归的更新子组件，调用 `mount Component` 或 `update Component` 来实现，这也成为了它致命的缺点，**一旦更新无法中断**

### 递归更新的缺点

当组件的层级很深时，无法在一帧内完成更新，又没有办法中断本次更新，用户交互就会变得卡顿

在 React 15 架构中，采用同步更新的方式，`Reconciler` 和 `Renderer` 是交替工作的，只有当前一个 DOM 完成了 `renderer` 才会**进入下一个** DOM 的 `Reconciler`

在用户看来所有的 DOM 是同时更新的。

在前面说到，React 为了践行快速响应的理念，需要实现异步可中断的更新，那么基于 React 15 的架构能够实现吗？

**我们来演示一下在 React 15 架构下，如果触发更新的中断会发生什么？**

在下面的列子中，左边是更新前的页面，当我们点击时，会触发左侧数字 `count + 1`。正常情况，我们应当看到页面为 `2 3 4`。

当 2 更新为 3 后，我们中断了更新，由于 React 15 采用的是递归的更新，在上一个 DOM 完成更新之后才会开始下一个 DOM 的更新，因此就会看到右侧的页面，也就是 `2 3 3`，用户却**看不到期望的值**，也因此有了 React 16 的 Fiber 架构

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/EjHK6AiaujjS4vnQqjctueCfzcIiaLKbrdntiaqpbsxhujQibgy61micsnb5Z7dGT1NwkHKX4YtRkRQggBH20S3xFkQ/640?wx_fmt=jpeg)

新的 React 架构
-----------

在 React 16 版本中进行了一次大的重构，React 16 架构**解决了 React 15 不能支撑异步更新的问题** React16 架构可以分为三层：

*   Scheduler（调度器）—— **调度任务的优先级**，高优任务优先进入 **Reconciler**
    
*   Reconciler（协调器）—— 负责找出变化的组件
    
*   Renderer（渲染器）—— 负责将变化的组件渲染到页面上
    

可以看到，相较于 React15，React16 中新增了 **Scheduler**(调度器) 模块

在新的架构中，更新首先会被调度器处理，在调度器中会调度这些更新的优先级，更高优的更新会首先进入协调器，在本次更新的 `Reconcile` 中正在执行 Diff 算法时，**如果此时产生了更高优先级的更新，本次正在协调的更新会被中断，由于 `Scheduler` 和 `Reconcile` 都是在视图中完成的操作，因此即使更新中断，用户也不会看到更新不完整的视图**。当某次更新完成了 `Reconcile` 中的工作时，协调器会通知渲染器，本次更新有哪些组件需要执行对应的视图操作（CRUD），当渲染器完成了它的工作，调度器又会开始新一轮的调度

### Scheduler 调度器

**我们知道如果我们的应用占用较长的 js 执行时间，比如超过了设备一帧的时间，那么设备的绘制就会出现卡顿的现象。**

Scheduler 主要的功能是**时间切片和调度优先级**，react 在对比差异的时候会占用一定的 js 执行时间，Scheduler 内部借助 `MessageChannel` 实现了在浏览器绘制之前指定一个时间片，如果 react 在指定时间内没对比完，Scheduler 就会强制交出执行权给浏览器

在 Scheduler 的实现核心是，判断浏览器是否有剩余时间作为任务中断的标准，在部分浏览器中以及实现了这个 API，`requestIdle Callback`，但是 React 并没有直接使用这个 API ，**而是自行实现了一个功能更加完备的 requestIdleCallback 的 polyfill，也就是 Scheduler。**

### Reconcile 协调器

在 React 15 的 `reconcile` 协调器中，会通过递归的方式来处理虚拟 DOM ，这样导致 `Reconcile` 过程无法被中断

React 16 推行 `Fiber reconciler` 的主要目标是：

*   能够把可中断的任务切片处理。
    
*   能够调整优先级，重置并复用任务。
    
*   能够在父元素与子元素之间交错处理，以支持 React 中的布局。
    
*   能够在 `render()` 中返回多个元素。
    
*   更好地支持错误边界。
    

在 React 16 中将更新工作从递归变成了可以中断的循环过程，每次循环都会调用 shouldYield 判断当前是否有剩余时间

```
function workLoopConcurrent() {  // 判断是否中断  while (workInProgress !== null && !shouldYield()) {    workInProgress = performUnitOfWork(workInProgress);  }}
```

**那么 React 16 是如何解决更新中断时 DOM 渲染不完全的问题呢？**

在 React 16 中，Reconciler 与 Renderer **不再是交替工作**。当 Scheduler 调度器将任务交给 Reconciler 后，Reconciler **会为变化的 DOM 打上标记 effectTag**

```
export const Placement = /*             */ 0b0000000000010;export const Update = /*                */ 0b0000000000100;export const PlacementAndUpdate = /*    */ 0b0000000000110;export const Deletion = /*              */ 0b0000000001000;
```

只有再所有组件都完成了 `Reconciler` 的工作，才会统一交给 `Renderer` 渲染器进行更新渲染

### Renderer 渲染器

Renderer 会根据 Reconciler 中为虚拟 DOM 打的 tag，在 commit 阶段**同步执行**对应的 DOM 操作

同样也有多种不同的渲染器，和 React 15 中保持一致

以上就是 React 的设计理念以及新老架构的演变

参考资料
----

*   React 技术揭秘 -- React 15 架构