> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CgLVbKBz6ZyJJ3OxTij7rQ)

> React 知命境第 41 篇，原创第 154 篇

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFIaRSOp3RiaBdkicX0JoOQhvx2eIWKg21wrudjI3hTss3vJY6whF8YB33kuh5UdmoAqAH9ys38rlIQ/640?wx_fmt=png&from=appmsg)

在 React 源码中，`scheduleUpdateOnFiber` 是所有任务的唯一入口方法。我们前面分析 useState 的实现原理章节中，我们可以清晰的知道，当我们调用 dispatchSetState 时，最终会调用该入口方法。

**scheduleUpdateOnFiber** 主要用于触发一个 Fiber 节点上的调度更新任务，该函数里主要有两个核心逻辑

```
// Mark that the root has a pending update.// 标记 root 上有一个更新任务markRootUpdated(root, lane, eventTime);ensureRootIsScheduled(root, eventTime);
```

markRootUpdated 的逻辑如下，简单了解一下即可。

```
export function markRootUpdated(  root: FiberRoot,  updateLane: Lane,  eventTime: number,) {  // 设置本次更新的优先级  root.pendingLanes |= updateLane;  // 重置 root 应用根节点的优先级  if (updateLane !== IdleLane) {      // 由 Suspence 而挂起的 update 对应的 lane 集合    root.suspendedLanes = NoLanes;     // 由请求成功，Suspence 取消挂起的 update 对应的 Lane 集合    root.pingedLanes = NoLanes;   }  const eventTimes = root.eventTimes;  const index = laneToIndex(updateLane);  eventTimes[index] = eventTime;}
```

**ensureRootIsScheduled** 的主要目的要确保 root 根节点被调度。在该逻辑中，会根据 `root.pendingLanes` 信息计算出本次更新的 Lanes: nextLanes

```
const nextLanes = getNextLanes(  root,  root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,);
```

然后根据 `nextLanes` 计算出本批次集合中优先级最高的 Lane，作为本地任务的优先级。

```
// We use the highest priority lane to represent the priority of the callback.const newCallbackPriority = getHighestPriorityLane(nextLanes);
```

后续的逻辑就是取出当前已存在的调度优先级，与 `newCallbackPriority` 进行对比，根据对比结果来执行不同的更新方法。当该值等于 `SyncLane` 时，表示为同步更新。

> 同步优先级例如点击事件。

然后会判断是否支持微任务更新，如果不支持最后会执行 **scheduleCallback**

```
if (newCallbackPriority === SyncLane) {  if (supportsMicrotasks) {    // Flush the queue in a microtask.    if (__DEV__ && ReactCurrentActQueue.current !== null) {      // Inside `act`, use our internal `act` queue so that these get flushed      // at the end of the current scope even when using the sync version      // of `act`.      ReactCurrentActQueue.current.push(flushSyncCallbacks);    } else {      scheduleMicrotask(() => {        // In Safari, appending an iframe forces microtasks to run.        // https://github.com/facebook/react/issues/22459        // We don't support running callbacks in the middle of render        // or commit so we need to check against that.        if (          (executionContext & (RenderContext | CommitContext)) ===          NoContext        ) {          // Note that this would still prematurely flush the callbacks          // if this happens outside render or commit phase (e.g. in an event).          flushSyncCallbacks();        }      });    }  } else {    // Flush the queue in an Immediate task.    scheduleCallback(ImmediateSchedulerPriority, flushSyncCallbacks);  }}
```

**scheduleSyncCallback** 的逻辑，也就是同步任务的调度非常简单，就是将执行同步任务的回调添加到一个同步队列 `syncQueue` 中。

```
export function scheduleSyncCallback(callback: SchedulerCallback) {  // Push this callback into an internal queue. We'll flush these either in  // the next tick, or earlier if something calls `flushSyncCallbackQueue`.  if (syncQueue === null) {    syncQueue = [callback];  } else {    // Push onto existing queue. Don't need to schedule a callback because    // we already scheduled one when we created the queue.    syncQueue.push(callback);  }}
```

这里的 callback 是之前传入的 `performSyncWorkOnRoot`，这是用来执行同步更新任务的方法。他的逻辑主要包括

1、调用 `renderRootSync`，该方法会执行 `workLoopSync`，最后生成 Fiber true

2、将创建完成的 `Fiber tree` 挂载到 root 节点上

3、最后调用 `commitRoot`，进入 `commit` 阶段修改真实 DOM

```
function performSyncWorkOnRoot(root) {  ...  let exitStatus = renderRootSync(root, lanes);    ...  root.finishedWork = finishedWork;  root.finishedLanes = lanes;  commitRoot(    root,    workInProgressRootRecoverableErrors,    workInProgressTransitions,  );  ensureRootIsScheduled(root, now());  return null;}
```

`workLoopSync` 的逻辑也非常简单，如下

```
function workLoopSync() {  // Already timed out, so perform work without checking if we need to yield.  while (workInProgress !== null) {    performUnitOfWork(workInProgress);  }}
```

在 `performUnitOfWork` 中，会调用 `beginWork` 方法开始创建 Fiber 节点。

```
var next = beginWork(  current,   unitOfWork,   subtreeRenderLanes);
```

0
-

**总结**

同步更新的过程比较简单，从 `scheduleUpdateOnFiber` 到 `beginWork` 这中间的流程里，大多数逻辑都在进行各种不同情况的判断，因此源码看上去比较吃力，实际逻辑并不是很重要，简单了解即可，重要的是 `beginWork` 创建 Fiber 节点的方法，这跟我们之前文章里提到过的优化策略是一致的

> **「React 知命境」** 是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册，点击下方标签可阅读其他文章。欢迎关注我的公众号，我会持续更新。[购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。赞赏之后也能看到 React 哲学的全部内容