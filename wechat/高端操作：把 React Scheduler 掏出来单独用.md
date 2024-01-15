> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GlxDcdX3emvRRK2Vk8j7MA)

> React 知命境第 35 篇，原创第 142 篇

我们知道，Scheduler 是 React 提供的底层调度器。但是这个调度器具体是如何用的，可能大部分人都不太清楚了，好在 React 把内部的模块封装得都相对独立，因此，我们可以想个办法，单独把他的 Scheduler 或者 Reconciler 单独掏出来用。

1
-

**怎么掏**

在 React 的 github 仓库中，找到如下路径的文件：`./packages/scheduler/src`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFaD56KicibxDywZEp4ZbcuEvS3Bq9LSg1sNnOibue8KLcweibMSqpEnUib6licSbd8FqtOESUVq8D9go7Q/640?wx_fmt=png&from=appmsg)

这里就是 Scheduler 的全部代码，如图所示，我们可以在 forks 目录中，找到 `Scheduler.js`，这就是我们的目标文件，他引用了外部的几个小模块的内容

```
// packages/scheduler/src/forks/Scheduler.jsimport type {PriorityLevel} from '../SchedulerPriorities';import {  enableSchedulerDebugging,  enableProfiling,  enableIsInputPending,  enableIsInputPendingContinuous,  frameYieldMs,  continuousYieldMs,  maxYieldMs,  userBlockingPriorityTimeout,  lowPriorityTimeout,  normalPriorityTimeout,} from '../SchedulerFeatureFlags';import {push, pop, peek} from '../SchedulerMinHeap';// TODO: Use symbols?import {  ImmediatePriority,  UserBlockingPriority,  NormalPriority,  LowPriority,  IdlePriority,} from '../SchedulerPriorities';import {  markTaskRun,  markTaskYield,  markTaskCompleted,  markTaskCanceled,  markTaskErrored,  markSchedulerSuspended,  markSchedulerUnsuspended,  markTaskStart,  stopLoggingProfilingEvents,  startLoggingProfilingEvents,} from '../SchedulerProfiling';export type Callback = boolean => ?Callback;
```

> 这里需要注意的是，从 github 上掏出来的代码不是用 TS 写的，而是用 flow 写的，因此这里部分语法可能会报错，需要我们要自己稍作调整才能直接使用，不过改动不大

`SchedulerFeatureFlags.js` 的代码非常简单，就是定义了一些状态来区分不同的执行阶段

```
/** * Copyright (c) Meta Platforms, Inc. and affiliates. * * This source code is licensed under the MIT license found in the * LICENSE file in the root directory of this source tree. * * @flow strict */export const enableSchedulerDebugging = false;export const enableIsInputPending = false;export const enableProfiling = false;export const enableIsInputPendingContinuous = false;export const frameYieldMs = 5;export const continuousYieldMs = 50;export const maxYieldMs = 300;export const userBlockingPriorityTimeout = 250;export const normalPriorityTimeout = 5000;export const lowPriorityTimeout = 10000;
```

`SchedulerMinHeap.js` 封装了几个小顶堆的操作方法，用于优先级队列的任务管理，因此常用的操作就是 `pop、push、peek`

`SchedulerPriorities.js` 定义了几个优先级的常量

```
/** * Copyright (c) Meta Platforms, Inc. and affiliates. * * This source code is licensed under the MIT license found in the * LICENSE file in the root directory of this source tree. * * @flow strict */export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;// TODO: Use symbols?export const NoPriority = 0;export const ImmediatePriority = 1;export const UserBlockingPriority = 2;export const NormalPriority = 3;export const LowPriority = 4;export const IdlePriority = 5;
```

`SchedulerProfiling.js` 是用来分析性能的，我们在调试的时候可以用一下。一般来说都会将其关掉。

直接把这些文件复制出来，整理好，就能单独使用了。我们可以看一下 `Scheduler.js` 返回了什么方法

```
export {  ImmediatePriority as unstable_ImmediatePriority,  UserBlockingPriority as unstable_UserBlockingPriority,  NormalPriority as unstable_NormalPriority,  IdlePriority as unstable_IdlePriority,  LowPriority as unstable_LowPriority,  unstable_runWithPriority,  unstable_next,  unstable_scheduleCallback,  unstable_cancelCallback,  unstable_wrapCallback,  unstable_getCurrentPriorityLevel,  shouldYieldToHost as unstable_shouldYield,  requestPaint as unstable_requestPaint,  unstable_continueExecution,  unstable_pauseExecution,  unstable_getFirstCallbackNode,  getCurrentTime as unstable_now,  forceFrameRate as unstable_forceFrameRate,};
```

我们可以在源码中去明确这些方法的具体使用方式，然后根据你的需要选择使用即可。

2
-

**语法介绍**

我们可以使用 `unstable_scheduleCallback` 来调度任务，这个方法接收三个参数

```
function unstable_scheduleCallback(  priorityLevel: PriorityLevel,  callback: Callback,  options?: {delay: number},)
```

`priorityLevel` 需要的参数我们在上面已经定义好的，数字越小，优先级越高。

`callback` 就是我们需要被调度的任务

`options` 中，我们可以传入 delay，来进一步降低任务执行的优先级，表示延迟任务。他会进入到 `timerQueue` 队列而无法直接执行，只有在特定时机移入到了 `taskQueue` 中之后才会被执行。

`unstable_scheduleCallback` 返回一个 Task 对象，我们可以在源码中看到这个对象大概长这样

```
var newTask: Task = {  id: taskIdCounter++,  callback,  priorityLevel,  startTime,  expirationTime,  sortIndex: -1,};
```

`unstable_cancelCallback` 可以取消正在调度的任务，在源码内部内容，它通过重置 `task.callback = null` 来取消。

OK，了解了基本用法之后，我们就可以来使用它调度任务了。

3
-

**使用**

**想同优先级**

想想如下代码输出顺序如何？

```
unstable_scheduleCallback(NormalPriority, () => {  console.log(1)})unstable_scheduleCallback(NormalPriority, () => {  console.log(2)})unstable_scheduleCallback(NormalPriority, () => {  console.log(3)})unstable_scheduleCallback(NormalPriority, () => {  console.log(4)})// 输出顺序：1, 2, 3, 4
```

由于他们优先级相同，所以会按照任务创建的先后顺序来确定谁的优先级更高。因此，先创建的先执行。

**不同优先级**

现在我们调整一下优先级，思考一下代码输出顺序如何

```
unstable_scheduleCallback(LowPriority, () => {  console.log(1)})unstable_scheduleCallback(NormalPriority, () => {  console.log(2)})unstable_scheduleCallback(ImmediatePriority, () => {  console.log(3)})unstable_scheduleCallback(NormalPriority, () => {  console.log(4)})// 输出结果：3,2,4,1
```

此时优先级不同，则优先级越高的先执行。

**任务是否超时**

我们在创建任务时，会给任务添加一个 `expirationTime` 字段来表示任务执行时，是否超时。在回调函数中，可以接收一个参数来标记超时状态

```
unstable_scheduleCallback(NormalPriority, (isTimeout) => {  console.log(4)  console.log(isTimeout)})
```

他的判断标准如下

```
const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
```

`expirationTime` 的计算规则如下

```
var timeout;switch (priorityLevel) {  case ImmediatePriority:    // Times out immediately    timeout = -1;    break;  case UserBlockingPriority:    // Eventually times out    timeout = userBlockingPriorityTimeout;    break;  case IdlePriority:    // Never times out    timeout = maxSigned31BitInt;    break;  case LowPriority:    // Eventually times out    timeout = lowPriorityTimeout;    break;  case NormalPriority:  default:    // Eventually times out    timeout = normalPriorityTimeout;    break;}var expirationTime = startTime + timeout;
```

上面案例通常情况下会返回 false，但是我们可以在主线程中执行一下耗时任务，让其无法在超时时间以内执行。NormalPriority 优先级的超时时间至少是 5000ms

```
sunstable_scheduleCallback(NormalPriority, (isTimeout) => {  console.log(4)  console.log(isTimeout) // false})const currentTime = performance.now()while(performance.now() - currentTime < 5000) {}unstable_scheduleCallback(NormalPriority, (isTimeout) => {  console.log(4)  console.log(isTimeout) // true，执行时已经超时})const currentTime = performance.now()while(performance.now() - currentTime < 5000) {}
```

再来看一个例子

```
unstable_scheduleCallback(UserBlockingPriority, (isTimeout) => {  console.log(2)  console.log(isTimeout) // true})unstable_scheduleCallback(ImmediatePriority, (isTimeout) => {  console.log(3)  const currentTime = performance.now()  while(performance.now() - currentTime < 100) {}  console.log(isTimeout) // true})unstable_scheduleCallback(NormalPriority, (isTimeout) => {  console.log(4)  console.log(isTimeout) // false})const currentTime = performance.now()while(performance.now() - currentTime < 200) {}
```

此时主线程卡住 200ms，因此 3 `ImmediatePriority` 超时。此时 3 执行，又卡了 100ms，那么 2 UserBlockingPriority 对应 250ms 延迟时间，此时也超时了

**任务中断**

此时我们要声明一个任务来遍历一个数组，数组中的每一项的执行时间都比较长，声明数组如下

```
const tasks: any[] = [  ["1", 3],  ["2", 3],  ["3", 5],  ["4", 7],  ["5", 9],];
```

我们可以结合 `unstable_shouldYield` 来判断当前执行时间是否过长，然后以中断遍历过程的方式，中断任务的执行。

```
function node_task() {  console.log('开始执行任务')  var task  while(task = tasks.shift()) {    var now = performance.now()    // 卡住执行    while(performance.now() - now < task[1]) {}    console.log(task[0], '小任务执行完毕')    if (unstable_shouldYield()) {      console.log('执行超过了 5ms，中断执行')      return node_task    }  }}
```

unstable_shouldYield 是超过 5ms 就需要中断一次，此时我们发现，任务 1 与 任务 2 加起来超过了 5ms，因此 2 执行完之后，会中断一次。，后面的每个任务都比较长，因此每个任务执行完都会中断一次，所以总共会中断 4 次

调度之后，我们看看打印结果

```
unstable_scheduleCallback(NormalPriority, node_task);
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFaD56KicibxDywZEp4ZbcuEvibuHpqJweGhV5ia0yt13QHS8euUicyJUwudk7UtULhziat7vxR6LC5uDxA/640?wx_fmt=png&from=appmsg)

完整的符合预期。

**高优先级插队**

我们只需要把上面的案例稍作调整，就能做到高优先级插队。在 node_task 的执行过程中，我们利用 setTimeout 调度一个更高优先级的任务。

```
const tasks: any[] = [  ["1", 3],  ["2", 3],  ["3", 5],  ["4", 7],  ["5", 9],];function node_task() {  console.log('--开始执行任务--')  var task  while(task = tasks.shift()) {    var now = performance.now()    // 卡住执行    while(performance.now() - now < task[1]) {}    console.log(task[0], '小任务执行完毕')    if (unstable_shouldYield()) {      console.log('执行超过了 5ms，中断执行')      return node_task    }  }}unstable_scheduleCallback(NormalPriority, node_task);+ setTimeout(() => {+   unstable_scheduleCallback(ImmediatePriority, () => {+     console.log('我是高优先级插队')+  });+ }, 10)
```

执行结果如下，插队成功

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFaD56KicibxDywZEp4ZbcuEvP6hia9CkI7aic4Rv6yXpxewV8d1VgTIXzrVfdeWicHcgmC9TtJicVIpAWQ/640?wx_fmt=png&from=appmsg)

4
-

**总结**

我们可以利用这一套优先级队列的调度，解决实践中的需求。例如，在开发弹幕功能的时候，我们会想办法优先让自己发的弹幕先弹出来。或者在消息弹窗提示时，优先弹出错误警告等。

> **「React 知命境」** 是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册，点击下方标签可阅读其他文章。欢迎关注我的公众号，我会持续更新。[购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。赞赏之后也能看到 React 哲学的全部内容