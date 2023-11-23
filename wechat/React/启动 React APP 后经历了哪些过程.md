> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ow0VHA9TJgcXqIHQYEmeIA)

> 本文作者为 360 奇舞团前端开发工程师

前言
--

> 本文中使用的`React`版本为 18，在摘取代码的过程中删减了部分代码，具体以源代码为准。

在`React 18`里，通过`ReactDOM.createRoot`创建根节点。并且通过调用原型链上的`render`来渲染。 本文主要是从以下两个方法来介绍展开。

```
import React from 'react';import ReactDOM from 'react-dom/client';import App from './App.tsx';ReactDOM.createRoot(document.getElementById('root')).render(  <React.StrictMode>    <App />  </React.StrictMode>);
```

一、createRoot()
--------------

`createRoot`这个方法主要是用来创建`FiberRoot`（全局唯一，保存全局状态）和`RootFiber`(是应用里的第一个 fiber 对象)，并将其关系关联起来。主要有以下过程：

1.  校验`container`有效性，以及处理`options`参数
    
2.  创建`FiberRoot`和`rootFiber`，并关联起来
    
3.  事件代理
    
4.  返回`ReactDOMRoot`实例
    

```
function createRoot(  container: Element | Document | DocumentFragment,  options?: CreateRootOptions,): RootType {  // 校验合法性，以及处理options参数，此处省略  if (!isValidContainer(container)) {    //...  }  // 调用 createFiberRoot，创建FiberRoot和rootFiber，并关联关系，最终返回FiberRoot。FiberRoot.current = rootFiber; rootFiber.stateNode = FiberRoot;  const root = createContainer(    container,    ConcurrentRoot,    null,    isStrictMode,    concurrentUpdatesByDefaultOverride,    identifierPrefix,    onRecoverableError,    transitionCallbacks,  );    // 标记container和rootFiber关系  container['__reactContainer$' + randomKey] = root.current  markContainerAsRoot(root.current, container);     const rootContainerElement: Document | Element | DocumentFragment =    container.nodeType === COMMENT_NODE      ? (container.parentNode: any)      : container;    listenToAllSupportedEvents(rootContainerElement); // 事件代理  // 实例化，挂载render，unmount方法  return new ReactDOMRoot(root); // this._internalRoot = root;}
```

### 关系结构示意图

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAvZzhH8xHnnHV9AeDfvSkttXh8F9wXGAIicO7Xlpwg5HF6v8iceribB9FOlkV7qHIk2xtHHIoufR2ew/640?wx_fmt=png)image.png

二、render()
----------

`render`主要是通过调用`updateContainer`，将组件渲染在页面上。

```
ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(  children: ReactNodeList,): void {  const root = this._internalRoot;  if (root === null) {    throw new Error('Cannot update an unmounted root.');  }  updateContainer(children, root, null, null);};
```

### updateContainer

`updateContainer`主要执行了以下步骤：

1.  获取当前时间`eventTime`和任务优先级`lane`，调用`createUpdate`生成`update`;
    
2.  执行`enqueueUpdate`将更新添加到更新队列里，并返回`FiberRoot`;
    
3.  `scheduleUpdateOnFiber` 调度更新;
    

```
function updateContainer(  element: ReactNodeList,  container: OpaqueRoot,  parentComponent: ?React$Component<any, any>,  callback: ?Function,): Lane {  const current = container.current; // rootFiber  const eventTime = requestEventTime(); // 更新触发时间  const lane = requestUpdateLane(current); // 获取任务优先级  // ... context 处理   // 创建update：{eventTime, lane, tag: UpdateState // 更新类型, payload: null, callback: null, next: null, // 下一个更新}  const update = createUpdate(eventTime, lane);   update.payload = {element}; // element首次渲染时为App  callback = callback === undefined ? null : callback;  if (callback !== null) {    update.callback = callback;  }  const root = enqueueUpdate(current, update, lane); // 将update添加到concurrentQueues队列里，返回 FiberRoot  if (root !== null) {    scheduleUpdateOnFiber(root, current, lane, eventTime); // 调度    entangleTransitions(root, current, lane);  }  return lane;}
```

### 调度阶段

#### 调度入口：scheduleUpdateOnFiber

主要有以下过程：

1.  在`root`上标记更新
    
2.  通过执行`ensureRootIsScheduled`来调度任务
    

```
function scheduleUpdateOnFiber(  root: FiberRoot,  fiber: Fiber,  lane: Lane,  eventTime: number,) {  markRootUpdated(root, lane, eventTime); // 在root上标记更新   // root.pendingLanes |= lane; 将update的lane放到root.pendingLanes  // 设置lane对应事件时间 root.eventTimes[laneToIndex(lane)] = eventTime;  if (    (executionContext & RenderContext) !== NoLanes &&    root === workInProgressRoot  ) {     // 更新是在渲染阶段调度提示错误 ...  } else { // 正常更新    // ...    ensureRootIsScheduled(root, eventTime); // 调度任务    // ...  }}
```

#### 调度优先级：ensureRootIsScheduled

该函数用于调度任务，一个 root 只能有一个任务在执行

1.  设置任务的过期时间，有过期任务加入到`expiredLanes`中
    
2.  获取下一个要处理的优先级，没有要执行的则退出
    
3.  判断优先级相等则复用，否则取消当前执行的任务，重新调度。
    

```
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {  const existingCallbackNode = root.callbackNode; // 正在执行的任务  // 遍历root.pendingLanes，没有过期时间设置root.expirationTimes，有过期时间判断是否过期，是则加入到root.expiredLanes中  markStarvedLanesAsExpired(root, currentTime);  // 过期时间设置 root.expirationTimes = currentTime+t(普通任务5000ms，用户输入250ms);    // 获取要处理的下一个lanes  const nextLanes = getNextLanes(    root,    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,  );    // 没有要执行的lanes  if (nextLanes === NoLanes) {    if (existingCallbackNode !== null) {      // 取消正在执行的任务      cancelCallback(existingCallbackNode);    }    root.callbackNode = null;    root.callbackPriority = NoLane;    return;  }  const newCallbackPriority = getHighestPriorityLane(nextLanes); // 获取最高优先级的lane  const existingCallbackPriority = root.callbackPriority;  // 优先级相等复用已有的任务  if (    existingCallbackPriority === newCallbackPriority &&    !(      __DEV__ &&      ReactCurrentActQueue.current !== null &&      existingCallbackNode !== fakeActCallbackNode    )  ) {    return;  }  // 优先级变化，取消正在执行的任务，重新调度  if (existingCallbackNode != null) {    cancelCallback(existingCallbackNode);  }  let newCallbackNode; // 注册调度任务  // 同步任务，不可中断  // 1. 调用scheduleSyncCallback将任务添加到队列syncQueue里；  // 2. 创建微任务，调用flushSyncCallbacks，遍历syncQueue队列执行performSyncWorkOnRoot，清空队列；  if (newCallbackPriority === SyncLane) {    if (root.tag === LegacyRoot) {      scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root));    } else {      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));    }    if (supportsMicrotasks) {      // 支持微任务        scheduleMicrotask(() => {          if (            (executionContext & (RenderContext | CommitContext)) ===            NoContext          ) {            flushSyncCallbacks();          }        });    } else {      scheduleCallback(ImmediateSchedulerPriority, flushSyncCallbacks);    }    newCallbackNode = null;  } else {    let schedulerPriorityLevel;    switch (lanesToEventPriority(nextLanes)) {      // ...      case DefaultEventPriority:        schedulerPriorityLevel = NormalSchedulerPriority;        break;      default:        schedulerPriorityLevel = NormalSchedulerPriority;        break;    }    // 非同步任务，可中断    // 1. 维护了两个队列 timerQueue taskQueue    // 2. 通过requestHostCallback开启宏任务执行任务    newCallbackNode = scheduleCallback(      schedulerPriorityLevel,      performConcurrentWorkOnRoot.bind(null, root),    );  }  root.callbackPriority = newCallbackPriority;  root.callbackNode = newCallbackNode;}
```

#### 调度任务 scheduleSyncCallback or scheduleCallback

*   `scheduleSyncCallback` 只有一个队列，将任务添加到队列里。按照顺序同步执行，不能中断。
    

```
function scheduleSyncCallback(callback: SchedulerCallback) { // callback =》performSyncWorkOnRoot  if (syncQueue === null) {    syncQueue = [callback];  } else {    syncQueue.push(callback);  }}
```

*   `scheduleCallback` 有两个队列（小顶堆），`timerQueue`存放未就绪的任务，`taskQueue`存放已就绪任务。每次循环，判断`timerQueue`里是否有可执行任务，并将其移动到`taskQueue`中，然后从`taskQueue`中取出任务执行。
    

```
function unstable_scheduleCallback(priorityLevel, callback, options) {  // ... startTime timeout expirationTime 等初始化  var newTask = { // 新的调度任务    id: taskIdCounter++,    callback, // render时为performConcurrentWorkOnRoot.bind(null, root),    priorityLevel,    startTime, // getCurrentTime()    expirationTime, // startTime + timeout(根据priorityLevel,-1、250、1073741823、10000、5000、)    sortIndex: -1, // startTime > currentTime ? startTime: expirationTime,  };  // 按照是否过期将任务推到队列timerQueue或者taskQueue里  if (startTime > currentTime) {    newTask.sortIndex = startTime;    push(timerQueue, newTask);    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {      if (isHostTimeoutScheduled) {        cancelHostTimeout(); // 取消当前的timeout      } else {        isHostTimeoutScheduled = true;      }      // 本质上是从timerQueue去取可以执行的任务放到taskQueue里，然后执行requestHostCallback      requestHostTimeout(handleTimeout, startTime - currentTime);    }  } else {    newTask.sortIndex = expirationTime;    push(taskQueue, newTask);        // 调度任务    if (!isHostCallbackScheduled && !isPerformingWork) {      isHostCallbackScheduled = true;      requestHostCallback(flushWork); // 设置isMessageLoopRunning，开启宏任务【schedulePerformWorkUntilDeadline】（优先级：setImmediate > MessageChannel > setTimeout）执行 performWorkUntilDeadline()    }  }  return newTask;}
```

> 这里要注意下，一直以来都认为是`MessageChannel`优先级大于`setTimeout`，但在浏览器打印之后发现事实相反。这个原因是 chrome 在某次更新里修改了二者的优先级顺序。想了解更多可以查看这篇文章：聊聊浏览器宏任务的优先级 - 掘金

#### 执行任务 performWorkUntilDeadline

当监听到`MessageChannel message`的时候，执行该方法。通过调用`scheduledHostCallback`(即`flushWork->workLoop`返回的) 结果，判断是否还有任务，若有则开启下一个宏任务。

```
const performWorkUntilDeadline = () => {  if (scheduledHostCallback !== null) {    const currentTime = getCurrentTime();    startTime = currentTime;    const hasTimeRemaining = true;    let hasMoreWork = true;    try {      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime); // scheduledHostCallback = flushWork ->workLoop    } finally {      if (hasMoreWork) {        schedulePerformWorkUntilDeadline(); // 开启下一个宏任务MessageChannel，执行 performWorkUntilDeadline()      } else {        isMessageLoopRunning = false;        scheduledHostCallback = null;      }    }  } else {    isMessageLoopRunning = false;  }  needsPaint = false;};
```

#### workLoop

从`taskQueue`取出任务执行`task.callback`即（`performConcurrentWorkOnRoot`）。如果`callback`返回的是函数，则表示任务被中断。否则任务执行完毕，则弹出该任务。

```
function workLoop(hasTimeRemaining, initialTime) {  let currentTime = initialTime;  advanceTimers(currentTime); // 将 timerQueue里到时间执行的定时任务移动到 taskQueue 里  currentTask = peek(taskQueue); // 从 taskQueue 取任务  while (    currentTask !== null &&    !(enableSchedulerDebugging && isSchedulerPaused)  ) {    // 任务未过期并且任务被中断    if (      currentTask.expirationTime > currentTime &&      (!hasTimeRemaining || shouldYieldToHost())    ) {      break;    }    const callback = currentTask.callback; // 在scheduleCallback接受的第二个参数：performConcurrentWorkOnRoot    if (typeof callback === 'function') {      currentTask.callback = null;      currentPriorityLevel = currentTask.priorityLevel;      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;      // 如果返回是函数，则代表要重新执行；      const continuationCallback = callback(didUserCallbackTimeout);      currentTime = getCurrentTime();      if (typeof continuationCallback === 'function') {        // 任务暂停重新赋值callback        currentTask.callback = continuationCallback;      } else {        // 任务完成弹出        if (currentTask === peek(taskQueue)) {          pop(taskQueue);        }      }      advanceTimers(currentTime); // 每次执行完，去timerQueue查看有没有到时间的任务    } else {      pop(taskQueue); // 弹出该任务    }    currentTask = peek(taskQueue);  }  // 返回给外部判断是否还有任务需要执行，即performWorkUntilDeadline里面的hasMoreWork  if (currentTask !== null) {    return true;  } else {    // taskQueue里面没有任务了，从timerQueue取任务    const firstTimer = peek(timerQueue);    if (firstTimer !== null) {      // 目的将timerQueue里的任务，移动到taskQueue里执行      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);    }    return false;  }}
```

### Render 阶段

> 这里 render 不是实际的 dom render，而是 fiber 树的构建阶段。

#### Render 入口

*   performSyncWorkOnRoot: 同步更新 =》 renderRootSync =》 workLoopSync
    
*   performConcurrentWorkOnRoot: 异步更新 =》 renderRootConcurrent =》 workLoopConcurrent
    

二者的区别主要是是否调用`shouldYield`，判断是否中断循环。

render 之后就进入了 commit 阶段。

```
function performConcurrentWorkOnRoot(root, didTimeout) {  currentEventTime = NoTimestamp;  currentEventTransitionLane = NoLanes;  const originalCallbackNode = root.callbackNode;  const didFlushPassiveEffects = flushPassiveEffects();  if (didFlushPassiveEffects) {   // ...  }  let lanes = getNextLanes(    root,    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,  );  if (lanes === NoLanes) {    return null;  }  // 判断是否有用户输入、过期任务打断，需要同步渲染  const shouldTimeSlice =    !includesBlockingLane(root, lanes) &&    !includesExpiredLane(root, lanes) &&    (disableSchedulerTimeoutInWorkLoop || !didTimeout);   // renderRootConcurrent｜renderRootSync里都会调用prepareFreshStack：构建新的workInProgress树  let exitStatus = shouldTimeSlice    ? renderRootConcurrent(root, lanes)    : renderRootSync(root, lanes);  // render执行完成或抛出异常  if (exitStatus !== RootInProgress) {    if (exitStatus === RootErrored) {    }    if (exitStatus === RootFatalErrored) {    }    if (exitStatus === RootDidNotComplete) {      markRootSuspended(root, lanes);    } else {      // render完成      const renderWasConcurrent = !includesBlockingLane(root, lanes);      const finishedWork: Fiber = (root.current.alternate: any);      if (        renderWasConcurrent &&        !isRenderConsistentWithExternalStores(finishedWork)      ) {        exitStatus = renderRootSync(root, lanes);        if (exitStatus === RootErrored) {        }        if (exitStatus === RootFatalErrored) {        }      }      // 将新的fiber树赋值给root.finishedWork      root.finishedWork = finishedWork;      root.finishedLanes = lanes;            // 进入commit阶段->调用 commitRoot-> commitRootImpl;      // commitRootImpl 执行完成之后会清空重置root.callbackNode和root.callbackPriority；以及重置workInProgressRoot、workInProgress、workInProgressRootRenderLanes。      finishConcurrentRender(root, exitStatus, lanes);     }  }  ensureRootIsScheduled(root, now()); // 退出前检测，是否有其他更新，需要发起调度  if (root.callbackNode === originalCallbackNode) { // 没有改变，说明任务被中断，返回function，等待调用    return performConcurrentWorkOnRoot.bind(null, root);  }  return null;}
```

#### 是否可中断循环

workLoopSync 和 workLoopConcurrent

*   共同点：用于构建 fiber 树，`workInProgress`从根开始，遍历创建 fiber 节点。
    
*   区别是：`workLoopConcurrent`里面增加了`shouldYield`判断。
    

```
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

#### 递归阶段 performUnitOfWork

> 遍历过程：从 rootFiber 向下采用深度优先遍历，当遍历到叶子节点时（递），然后会进入到归阶段，即遍历该节点的兄弟节点，如果没有兄弟节点则返回父节点。然后进行递归的交错执行。

*   递阶段 `beginWork`: 创建或复用 fiber 节点。diff 过程在此发生；
    
*   归阶段 `completeWork`: 由下至上根据 fiber 创建或复用真实节点，并赋值给`fiber.stateNode`；
    

```
function performUnitOfWork(unitOfWork: Fiber): void { // unitOfWork即workInProgress，指向下一个节点  const current = unitOfWork.alternate;  let next;  next = beginWork(current, unitOfWork, renderLanes);   unitOfWork.memoizedProps = unitOfWork.pendingProps;  if (next === null) {    // 遍历到叶子节点后，开始归阶段，并创建dom节点    completeUnitOfWork(unitOfWork);  } else {    workInProgress = next; // workInProgress指向next  }  ReactCurrentOwner.current = null;}
```

#### 递归后的新的 fiber 树

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAvZzhH8xHnnHV9AeDfvSkt6R1KKsRB3UrGN3Bwn1fg9VFyVficsPOCSDb7JLLnRynlN5ogvhiclAvA/640?wx_fmt=png)image.png

### Commit 阶段

通过`commitRoot`进入`commit`阶段。此阶段是同步执行的，不可中断。接下来经历了三个过程：

1.  before mutation 阶段（执行 DOM 操作前）：处理 DOM 节点渲染 / 删除后的 focus、blur 逻辑；调用 getSnapshotBeforeUpdate 生命周期钩子；调度 useEffect。
    
2.  mutation 阶段（执行 DOM 操作）：DOM 插入、更新、删除
    
3.  layout 阶段（执行 DOM 操作后）：调用类组件的 `componentDidMount、componentDidUpdate、setState` 的回调函数；或函数组件的`useLayoutEffect`的`create`函数；更新`ref`。
    

### 页面渲染结果

```
import { useState } from 'react';

export default function Count() {
  const [num, setNum] = useState(1);
  const onClick = () => {
    setNum(num + 1);
  };
  return (
    <div>
      num is {num}
      <button onClick={onClick}>点击+1</button>
    </div>
  );
}

function List() {
  const arr = [1, 2, 3];
  return (
    <ul>
      {arr.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <div>
      <Count />
      <List />
    </div>
  );
}

export default App;
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAvZzhH8xHnnHV9AeDfvSktN63RHeL4PeBkfibwOc8sqyVPlHkiaCeXWVMRYncmBahc9HjCRkHMxBzg/640?wx_fmt=png)image.png

参考文章
----

[1] React _https://github.com/facebook/react_  
[2] React 技术揭秘 _https://react.iamkasong.com/_  
[3] 图解 React _https://7km.top/main/macro-structure/_  
[4] 聊聊浏览器宏任务的优先级 _https://juejin.cn/post/7202211586676064315_

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)