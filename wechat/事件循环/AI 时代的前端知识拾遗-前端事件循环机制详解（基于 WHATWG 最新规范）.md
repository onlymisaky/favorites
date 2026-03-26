> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nqSOjM251FqLGx7z6_PX0w)

### 引言

最近，我在部门校招生面试中发现，许多候选人更注重 UI 开发与前端框架的使用，却忽略了 JavaScript 的核心机制。虽然我不赞成死记硬背面试 “八股文”，但如果对前端基础知识只懂皮毛，就很难让人相信你能在工作中写出清晰、可维护的代码。即便在 AI 辅助编程盛行的时代，掌握这些基础机制依然价值连城——至少能帮助你审视 AI 生成的代码是否合规、是否存在隐患。本文将基于 `WHATWG` 的 `HTML Living Standard`，结合浏览器与 V8 引擎的实现视角，对 JavaScript 运行时的 **事件循环（Event Loop）机制** 进行补充与深入解析。

事件循环是 JavaScript 运行时的核心调度器，它决定了脚本执行、异步回调、定时器、浏览器渲染、事件处理等任务的顺序。理解这一机制，不仅能帮助你开发性能更优、响应更流畅的前端应用，还能揭示浏览器与 V8 引擎之间的协同工作原理。

#### 一、浏览器多进程架构与渲染主线程

现代浏览器（例如 Chrome）采用了多进程架构。当用户打开一个标签页时，浏览器会为该页面创建一个 **渲染进程（Renderer Process）**。

在这个进程中，最关键的部分是 **渲染主线程（Main Thread）**，它负责：

*   解析 HTML 与 CSS；
    
*   计算样式 (style) 与布局 (layout)；
    
*   执行脚本（JavaScript 引擎 V8 在此运行）；
    
*   处理用户交互、事件监听、定时器回调；
    
*   绘制及更新页面 (`paint/repaint`)；
    

渲染主线程遵循单线程模型：任意时刻只有一个任务在执行。如果脚本执行耗时太久，就会阻塞页面渲染或用户交互。为缓解这一问题，浏览器引入了 **事件循环（Event Loop）** 机制，它将所有待处理任务有序排队和调度，从而保证主线程能够高效运转。

#### **二、事件循环的总体模型**

在 `WHATWG` 的 `HTML Standard` 中，事件循环的关键描述包括：

> “An event loop has one or more task queues. Each task queue is a set of tasks. The microtask queue is not a task queue.”

换言之，事件循环由两类核心结构组成：

1.  **任务队列 (Task Queues)**
    
    在浏览器环境中，所有任务（如脚本执行、定时器到期、网络响应、用户输入）都被放入任务队列。不同类型的任务可以属于不同的任务队列（例如定时器队列、用户交互队列、网络回调队列等）。
    
2.  **微任务队列 (Microtask Queue)**
    
    这是一个独立的 FIFO（先进先出）队列，用于调度微任务 (`microtasks`) —— 这些任务必须在当前任务结束后、下一个任务开始前立即执行。典型的来源包括 `Promise.then/catch/finally` 回调、`queueMicrotask()` 以及 `MutationObserver` 等。
    

基于此，事件循环的基本流程可概括为：

1.  从任务队列中选择一个可执行的任务 (Task)。
    
2.  执行该任务的回调或脚本。
    
3.  当前任务结束后，检查微任务队列，如存在则立即执行直到队列为空。
    
4.  如有必要，浏览器进行渲染更新或调用 `requestAnimationFrame` 回调。
    
5.  返回步骤 1，进入下一轮循环。
    

需要补充说明的是：在 `WHATWG` 的模型中，并没有 “宏任务 (`macrotask`)” 这一术语；“宏任务” 只是开发者社区的习惯用法，用来指代任务队列 (`task`) 中的各类任务。

#### 三、异步机制与 Task 调度

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAmg6jc0czaE1ArvriaK9Pn8ngnj1ialwarMmeWHLXPQZNP54n2h8xsDIK3uxXaOMD4SKILGzlibnLDg/640?wx_fmt=png&from=appmsg#imgIndex=0)截屏 2025-10-23 15.59.25

当浏览器遇到不能立即完成的操作（如 `setTimeout`、网络请求或事件监听）时，主线程不会阻塞等待，而是将这些操作委托给其他系统线程或浏览器组件处理。一旦异步条件满足（例如定时器到期、网络响应返回或用户点击事件发生），浏览器会将对应的回调封装为一个任务对象，入队进入相应的任务队列。事件循环机制随后择机取出并执行这些任务。

这种调度方式带来了几大好处：

*   避免主线程被长时间阻塞；
    
*   不同任务类型之间实现良好的隔离；
    
*   UI 渲染能够在任务之间得到穿插，从而交互更流畅。
    

以下示例直观展示：

```
console.log('start');setTimeout(() => console.log('timer done'), 0);console.log('end');
```

输出顺序为：

> start end timer done

原因在于：`setTimeout` 的回调被放入任务队列中，需要等待当前脚本（视为一个 `task`）执行完毕后，事件循环才会取出并执行定时器回调。

#### 四、Microtask Queue 与优先级

微任务 (`microtasks`) 是在当前任务结束后、下一轮任务开始前必须被处理的 “高优先级” 回调。`WHATWG` 规范中明确规定：浏览器在每个任务（`task`）结束后，必须执行一次微任务检查点 (`microtask checkpoint`)，将微任务队列中的所有任务执行完毕后，才可进入下一任务。

下面这个示例说明了微任务的执行时机：

```
console.log('A');Promise.resolve().then(() => console.log('B'));console.log('C');
```

输出结果：

> A
> 
> C
> 
> B

这是因为 `Promise.then` 回调被加入微任务队列，在当前任务（整个 script）结束后、进入下一任务前立即执行。

如果在执行微任务过程中又添加了新的微任务，那么这些新任务也会排队执行，直到微任务队列清空：

```
Promise.resolve().then(() => { console.log('X'); Promise.resolve().then(() => console.log('Y'));});console.log('Z');
```

输出顺序：Z → X → Y。

> 说明：微任务严格按 FIFO 执行，且在返回事件循环 (转向下一 task) 之前，必须将微任务队列完全清空。

**注意**

任务没有优先级，在消息队列中先进先出，但**消息队列是有优先级的**。根据规范最新解释:

*   每个任务都有⼀个任务类型，同⼀个类型的任务必须在⼀个队列，不同类型的任务可以分属于不同的队列。
    
*   在⼀次事件循环中，浏览器可以根据实际情况从不同的队列中取出任务执⾏。
    

浏览器必须准备好⼀个微队列，**微队列中的任务优先所有其他任务执⾏**。

#### 五、浏览器内部实现视角

以 `Chrome` 为例，事件循环在渲染进程的主线程中运行。主线程通过组件如 `MessageLoop`、`Scheduler、TaskRunner` 来维持一个持续的循环结构：

1.  从各个任务队列（`Timers`、`Network`、`User Input`、`IPC` 等）收集 `task`;
    
2.  取出一个 task 执行（如 JS 脚本或回调）;
    
3.  调用 V8 引擎执行 JavaScript;
    
4.  执行完后 触发 V8 的微任务检查点，执行微队列中的任务;
    
5.  渲染引擎（Blink）进行样式计算与绘制;
    
6.  继续下一 任务。
    

这与 `WHATWG` 的 `Event Loop` 算法高度一致，只是实现层面由 `Chromium` 的 `Scheduler` 和 `TaskRunner` 组件具体负责。

#### 六、V8 引擎中的微任务队列实现

在 V8 内部，微任务队列由 `MicrotaskQueue` 类实现。当脚本调用 `Promise.resolve().then(fn)` 或 `queueMicrotask(fn)` 时，

V8 会将 `fn` 封装为一个 Job 对象，放入当前 `microtask` 队列。每当宿主（浏览器）执行一个 task 结束时，V8 会触发`PerformMicrotaskCheckpoint();`方法，该函数不断从 `microtask` 队列中取出任务去执行，直到队列为空。

因此可以归纳为：

*   微任务队列的创建与管理由 V8 完成；
    
*   检查点 (`checkpoint`) 的触发时机由宿主环境（浏览器）控制；
    
*   在非浏览器环境（如 `Node.js`）中，也存在类似机制，但还额外引入了 `process.nextTick` 队列，其优先级甚至高于普通微任务。
    

> “在 Node.js 环境中，事件循环模型与浏览器相似，但其微任务机制略有不同：
> 
> Node.js 在每个阶段结束后（如 timers、poll、check）执行 `nextTick` 队列和 `microtask` 队列，`process.nextTick` 的优先级甚至高于 Promise 微任务。”

#### 七、Task 队列类型与执行策略

根据 `WHATWG` 规范，浏览器可维护多个任务队列，事件循环算法允许在这些队列中按实现定义方式选择任务。以 Chrome 为例，常见的任务来源包括：

*   **微任务队列**：⽤户存放需要最快执⾏的任务，优先级「最⾼」
    

*   **延时任务队列（Timers）**：`setTimeout` 与 `setInterval` 回调
    
*   **用户交互任务队列（User Interaction）**：鼠标、键盘等事件回调
    
*   **网络任务队列（Network）**：请求响应回调
    
*   **渲染任务队列（Render）**：布局与绘制相关任务
    

浏览器会根据页面的可见性、用户操作、功耗策略等，动态调整从哪个队列取任务执行，从而优化响应速度与资源消耗。

#### 八、渲染时机与事件循环的关系

渲染 (`Paint`) 并不是每次执行完一个 `task` 就立即触发。`WHATWG` 的规范中表述：浏览器 “可以” 在任务之间或合适的时机进行渲染。

通常情况下，浏览器以约 16 ms 一次 (对应 60 FPS) 的刷新节奏去触发渲染机会。因此：

*   如果一个 task 占用主线程时间过长（例如死循环或大量同步计算），就会阻塞渲染更新。
    
*   在一个 task 内多次修改 DOM，只有在该 task 结束后、并在微任务、渲染逻辑之间切换时，才会把更新反映到屏幕上。
    

下面是一个典型的任务 + 微任务 + 渲染时机示例：

```
console.log('start');setTimeout(() => { console.log('timeout task');}, 0);queueMicrotask(() => console.log('microtask 1'));Promise.resolve().then(() => console.log('microtask 2'));console.log('end');
```

执行结果：

> start end microtask 1 microtask 2 timeout task

解释如下：当前脚本是一个 `task`，执行同步代码 `start` 和 `end`。期间注册的微任务 (来自`queueMicrotask` 与 `Promise.then`) 会加入微任务队列。该 `task` 结束后，立即执行微任务队列中的任务。微任务执行完毕后，事件循环才能取出下一 task （即 `setTimeout` 的回调）进行执行。

#### 总结

*   事件循环 (`Event Loop`) 是浏览器调度脚本与回调的核心机制。
    
*   `WHATWG` 规范定义的结构为：** 多个任务队列 (`Task Queues`) + 一个微任务队列 (`Microtask Queue`)**。
    
*   浏览器每轮循环流程大致为：取一个 task → 执行 → 微任务检查点 (执行全部 `microtasks`) → 渲染更新（若有）→ 下一轮循环。
    
*   在 V8 内部，`microtask` 队列由引擎管理，而何时触发由宿主环境控制。
    
*   在 `WHATWG` 的模型中，并无 “宏任务 (`macrotask`)”这一正式术语；开发者使用的 “宏任务” 通常指任务队列中的任务。
    
*   掌握事件循环机制能够帮助你在异步编程中游刃有余，从容应对复杂场景，并提升前端代码的性能、稳定性与可维护性。
    

**参考文献**

1.  WHATWG HTML Living Standard – 8.1 Event loops
    
2.  V8 Design Docs – Microtask Queue Implementation
    
3.  Chromium Source – MessageLoop and TaskRunner
    

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=1)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=2)