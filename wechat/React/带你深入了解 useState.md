> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nYX8Lnj7uwGHAeL5rEnRRg)

### **为什么 react 16 之前的函数组件没有状态？**

众所周知，函数组件在 react 16 之前是没有状态的，组件状态只能通过 `props` 进行传递。

写两个简单的组件，一个类组件和一个函数组件：

```
const App = () =><span>123</span>;class App1 extends React.Component {  constructor(props) {    super(props);    this.state = {      a: 1,    }  }  render() {    return (<p>312</p>)  }}
```

用 babel 编译 `App1`，`App1` 编译之后就是一个函数组件。

```
// 伪代码var App1 = /*#__PURE__*/function (_React$Component) {  _inherits(App1, _React$Component);  var _super = _createSuper(App1);  function App1(props) {    var _this;    _classCallCheck(this, App1);    _this = _super.call(this, props);    _this.state = {      a: 1    };    return _this;  }  _createClass(App1, [{    key: "render",    value: function render() {      return/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {        children: "312"      });    }  }]);  return App1;}(React.Component);
```

那为什么函数组件没有状态呢？函数组件和类组件的区别在于原型上是否有 `render` 这一方法。react 渲染时，调用类组件的 `render` 方法。而函数组件的 `render` 就是函数本身，执行完之后，内部的变量就会被销毁，当`组件重新渲染`时，无法获取到之前的状态。而类组件与函数组件不同，在第一次渲染时，会生成一个类组件的实例，渲染调用的是 render 方法。重新渲染时，会获取到类组件的实例引用，在不同的生命周期调用类组件对应的方法。

通过类组件和函数组件的渲染之后的数据结构来看，两者之间也没有区别。![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCvzRbhbTFzicE01jRj6EVicJsM3vbZXjXAhicuzm3BzUQXyOHu79yEULXdxcibMD2wdJvSHzDicE0wvQBA/640?wx_fmt=jpeg)

### **为什么 react 16 之后函数组件有状态？**

众所周知，react 16 做的最大改动就是 fiber。为了适配 fiber，节点（`fiber node`）的数据结构做了很大的改动。修改一下 `App` 这个组件，在页面渲染，得到下图的 `fiber node` 数据结构：

```
const App = () => {  const [a, setA] = React.useState(0);  const [b, setB] = React.useState(1);  return<span>123</span>};
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCvzRbhbTFzicE01jRj6EVicJs522L3L30zurrz2oVfeEO39cwa51buOGGNaPzEjzhu8oFDuyhdibLUxQ/640?wx_fmt=jpeg)（左边是函数组件，右边是类组件)

### **react 如何知道当前的状态属于哪个组件？**

所有的函数组件状态都是通过 useState 进行注入，是如何做到识别到对应组件的呢？

在 react 的 `render` 流程中打个断点，可以看到函数组件有一个特殊的 `render` 方法 `renderWithHooks`。方法有 6 个参数：`current`、`workInProgress`、`component`、 `props`、`secondArg`、`nextRenderExpirationTime`。

```
current: 当前正在页面渲染的node，如果是第一次渲染，则为空workInProgress: 新的node，用于下一次页面的渲染更新component: node对应的组件props: 组件的propssecondArg: 不清楚...，不影响后续文章阅读nextRenderExpirationTime: fiber渲染的过期时间
```

在执行 `renderWithHooks` 的时候，会用变量 `currentlyRenderingFiber$1` 记录当前的 `fiber node`。于是在执行函数组件的时候，`useState` 方法就能拿到到当前 `node` 的状态。将状态插入到对应 `node` 的 `memoizedState` 字段中。同时返回的触发 `state` 改变的方法因为闭包，在执行变更时，也知道是哪个 `fiber node`。相应源码：

```
function mountState(initialState) {  // 获取hook状态  var hook = mountWorkInProgressHook();  if (typeof initialState === 'function') {    // $FlowFixMe: Flow doesn't like mixed types    initialState = initialState();  }  hook.memoizedState = hook.baseState = initialState;  var queue = hook.queue = {    pending: null,    dispatch: null,    lastRenderedReducer: basicStateReducer,    lastRenderedState: initialState  };  // 绑定当前node和更新队列  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);  return [hook.memoizedState, dispatch];}
```

> `renderWithHooks` 只用于函数组件的渲染。

从 `memoizeState` 字段的值看出，函数组件和类组件的 `state` 存储的数据结构不一样了。类组件是简单的数据对象，而函数组件是单向链表。

```
interface State {    memoizedState: state数据，和baseState值相同,  baseState: state数据,  baseQueue: 本次更新之前没执行完的queue,  next: 下一个state,  queue: {    pending: 更新state数据（这个数据是一个对象，里面有数据，还有其他key用于做其他事情。）,    dispatch: setState方法本身,    lastRenderedReducer: useReducer用得上,    lastRenderedState: 上次渲染的State.memoizedState数据,  }}
```

### **调用 setA 方法，发生了什么？**

在说更新组件 `state` 之前，先看下组件挂载的流程。![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCvzRbhbTFzicE01jRj6EVicJsoecu1XCxIGm8icXfibv3U3vSZjxpx1jnQuHhLhIwtoDGBeneDrtz4V3g/640?wx_fmt=jpeg)

调用 `useState` 的时候，会利用 `currentlyRenderingFiber$1` 拿到当前组件的 `fiber node`，并挂载数据到节点上的 `memoizedState` 的字段上。这样函数组件就有了状态。

```
// reactfunction useState(initialState) {  var dispatcher = resolveDispatcher();  return dispatcher.useState(initialState);}function resolveDispatcher() {  // ReactCurrentDispatcher 的值是react-dom注入的，后续会讲。  var dispatcher = ReactCurrentDispatcher.current;  if (!(dispatcher !== null)) {    {      throwError( "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://fb.me/react-invalid-hook-call for tips about how to debug and fix this problem." );    }  }  return dispatcher;}// react-dom 会根据当前组件的状态注入不同的useState实现方法，这里可以先忽略。useState: function (initialState) {  currentHookNameInDev = 'useState';  mountHookTypesDev();  var prevDispatcher = ReactCurrentDispatcher.current;  ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV;  try {  // 挂载state    return mountState(initialState);  } finally {    ReactCurrentDispatcher.current = prevDispatcher;  }},function mountState(initialState) {  // 生成hook初始化数据，挂到fiber node节点上  var hook = mountWorkInProgressHook();  if (typeof initialState === 'function') {    // $FlowFixMe: Flow doesn't like mixed types    initialState = initialState();  }  hook.memoizedState = hook.baseState = initialState;  var queue = hook.queue = {    pending: null,    dispatch: null,    lastRenderedReducer: basicStateReducer,    lastRenderedState: initialState  };  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);  return [hook.memoizedState, dispatch];}function mountWorkInProgressHook() {  var hook = {    memoizedState: null,    baseState: null,    baseQueue: null,    queue: null,    next: null  };  if (workInProgressHook === null) {    // node节点的memoizedState指向第一个hooks    currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;  } else {    // 上一个hooks的next，等于当前hooks，同时把当前workInProgressHook，等于当前hooks    workInProgressHook = workInProgressHook.next = hook;  }  return workInProgressHook;}
```

`useState` 还会返回对应的 `state` 和修改 `state` 的方法。修改 `state` 的方法 `dispatchAction` 绑定了当前的 `fiber node`，同时还有当前更新状态的 `action queue`。

```
// 这里删除了部分无关代码function dispatchAction(fiber, queue, action) {  // 这些都是用于Fiber Reconciler，在这里不用太在意  var currentTime = requestCurrentTimeForUpdate();  var suspenseConfig = requestCurrentSuspenseConfig();  var expirationTime = computeExpirationForFiber(currentTime, fiber, suspenseConfig);  var update = {    expirationTime: expirationTime,    suspenseConfig: suspenseConfig,    action: action,    eagerReducer: null,    eagerState: null,    next: null  };  {    update.priority = getCurrentPriorityLevel();  }  // pending 是当前state是否有未更新的任务（比如多次调用更新state的方法）  var pending = queue.pending;  // queue是一个循环链表  if (pending === null) {    update.next = update;  } else {    update.next = pending.next;    pending.next = update;  }  queue.pending = update;  var alternate = fiber.alternate;  if (fiber === currentlyRenderingFiber$1 || alternate !== null && alternate === currentlyRenderingFiber$1) {    // Reconciler 计算是否还有时间渲染，省略  } else {    // 此处省略很多代码    // 标记当前fiber node需要重新计算。    scheduleWork(fiber, expirationTime);  }}
```

从上面代码可以看到，当调用 `setA` 方法更新组件 state 的时候，会生成需要更新的数据，包装好数据结构之后，推到 `state` 中的 `queue` 中。

`scheduleWork` 会触发 react 更新，这样组件需要重新渲染。整体的流程和初次挂载的时候基本一致，但是从 `mountState` 方法体的实现来看，组件渲染是使用 `initialState`。这样肯定是有问题的。

```
function mountState(initialState) {  // 挂载state  var hook = mountWorkInProgressHook();  if (typeof initialState === 'function') {    initialState = initialState();  }  // state的初始值是initialState，也就是组件传入的值  hook.memoizedState = hook.baseState = initialState;  var queue = hook.queue = {    pending: null,    dispatch: null,    lastRenderedReducer: basicStateReducer,    lastRenderedState: initialState  };  var dispatch = queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber$1, queue);  return [hook.memoizedState, dispatch];}
```

从此可以推断，在前置步骤中，肯定有标示当前组件不是初次挂载，需要替换 `useState` 的实现方法。于是在 `renderWithHooks` 中找到了答案。

> 为了方便理解，简单说一下，react 有两个比较关键的数据 current，workInProgress，分别代表当前页面渲染的 fiber node，触发更新之后计算差别的 fiber node。全部计算完成之后，current 就会指向 workInProgress，用于渲染。

```
// 这里删除部分无关代码// current 当前页面上组件对应的fiber node// workInProgress 当前重新渲染对应的fiber node// Component 函数方法体// ...function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderExpirationTime) {  // currentlyRenderingFiber$1 是当前正在渲染的组件，后续渲染流程会从改变量获取state  currentlyRenderingFiber$1 = workInProgress;  workInProgress.memoizedState = null;  workInProgress.updateQueue = null;  workInProgress.expirationTime = NoWork; // The following should have already been reset  // currentHook = null;  // workInProgressHook = null;  // didScheduleRenderPhaseUpdate = false;  // TODO Warn if no hooks are used at all during mount, then some are used during update.  // Currently we will identify the update render as a mount because memoizedState === null.  // This is tricky because it's valid for certain types of components (e.g. React.lazy)  // Using memoizedState to differentiate between mount/update only works if at least one stateful hook is used.  // Non-stateful hooks (e.g. context) don't get added to memoizedState,  // so memoizedState would be null during updates and mounts.  {    // 如果当前current不为null，且有state，说明当前组件是更新，需要执行的更新state，否则就是初次挂载。    if (current !== null && current.memoizedState !== null) {      ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;    } elseif (hookTypesDev !== null) {      // This dispatcher handles an edge case where a component is updating,      // but no stateful hooks have been used.      // We want to match the production code behavior (which will use HooksDispatcherOnMount),      // but with the extra DEV validation to ensure hooks ordering hasn't changed.      // This dispatcher does that.      ReactCurrentDispatcher.current = HooksDispatcherOnMountWithHookTypesInDEV;    } else {      ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;    }  }  // 往后省略}
```

在 `renderWithHooks` 方法中，会修改 `ReactCurrentDispatcher`，也就导致了 `useState` 对应的方法体不一样。`HooksDispatcherOnUpdateInDEV` 中的 `useState` 方法调用是 `updateState`。这个方法会忽略 `initState`，选择从 `fiber node` 的 `state` 中去获取当前状态。

```
useState: function (initialState) {  currentHookNameInDev = 'useState';  updateHookTypesDev();  var prevDispatcher = ReactCurrentDispatcher.current;  ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;  try {    return updateState(initialState);  } finally {    ReactCurrentDispatcher.current = prevDispatcher;  }},function updateState(initialState) {  return updateReducer(basicStateReducer);}function updateReducer(reducer, initialArg, init) {  // 根据之前的state初始化新的state结构，具体方法在下面  var hook = updateWorkInProgressHook();  // 当前更新state的队列  var queue = hook.queue;  queue.lastRenderedReducer = reducer;  var current = currentHook; // The last rebase update that is NOT part of the base state.  var baseQueue = current.baseQueue; // The last pending update that hasn't been processed yet.  var pendingQueue = queue.pending;  if (pendingQueue !== null) {    // We have new updates that haven't been processed yet.    // We'll add them to the base queue.    if (baseQueue !== null) {      // Merge the pending queue and the base queue.      var baseFirst = baseQueue.next;      var pendingFirst = pendingQueue.next;      baseQueue.next = pendingFirst;      pendingQueue.next = baseFirst;    }    current.baseQueue = baseQueue = pendingQueue;    queue.pending = null;  }  if (baseQueue !== null) {    // We have a queue to process.    var first = baseQueue.next;    var newState = current.baseState;    var newBaseState = null;    var newBaseQueueFirst = null;    var newBaseQueueLast = null;    var update = first;    do {      // fiber Reconciler 的内容，省略      } else {        // This update does have sufficient priority.        if (newBaseQueueLast !== null) {          var _clone = {            expirationTime: Sync,            // This update is going to be committed so we never want uncommit it.            suspenseConfig: update.suspenseConfig,            action: update.action,            eagerReducer: update.eagerReducer,            eagerState: update.eagerState,            next: null          };          newBaseQueueLast = newBaseQueueLast.next = _clone;        } // Mark the event time of this update as relevant to this render pass.        // TODO: This should ideally use the true event time of this update rather than        // its priority which is a derived and not reverseable value.        // TODO: We should skip this update if it was already committed but currently        // we have no way of detecting the difference between a committed and suspended        // update here.        markRenderEventTimeAndConfig(updateExpirationTime, update.suspenseConfig); // Process this update.        if (update.eagerReducer === reducer) {          // If this update was processed eagerly, and its reducer matches the          // current reducer, we can use the eagerly computed state.          newState = update.eagerState;        } else {                  // 执行状态更新，reducer是个包装函数：typeof action === 'function' ? action(state) : action;          var action = update.action;          newState = reducer(newState, action);        }      }      update = update.next;    } while (update !== null && update !== first);    if (newBaseQueueLast === null) {      newBaseState = newState;    } else {      newBaseQueueLast.next = newBaseQueueFirst;    } // Mark that the fiber performed work, but only if the new state is    // different from the current state.    if (!objectIs(newState, hook.memoizedState)) {      markWorkInProgressReceivedUpdate();    }    hook.memoizedState = newState;    hook.baseState = newBaseState;    hook.baseQueue = newBaseQueueLast;    queue.lastRenderedState = newState;  }  var dispatch = queue.dispatch;  return [hook.memoizedState, dispatch];}function updateWorkInProgressHook() {  var nextCurrentHook;  // 当前  if (currentHook === null) {    // alternate 指向的是当前页面渲染组件对应fiber node    var current = currentlyRenderingFiber$1.alternate;    if (current !== null) {      nextCurrentHook = current.memoizedState;    } else {      nextCurrentHook = null;    }  } else {    nextCurrentHook = currentHook.next;  }  var nextWorkInProgressHook;  if (workInProgressHook === null) {    nextWorkInProgressHook = currentlyRenderingFiber$1.memoizedState;  } else {    nextWorkInProgressHook = workInProgressHook.next;  }  if (nextWorkInProgressHook !== null) {    // There's already a work-in-progress. Reuse it.    workInProgressHook = nextWorkInProgressHook;    nextWorkInProgressHook = workInProgressHook.next;    currentHook = nextCurrentHook;  } else {    // Clone from the current hook.    if (!(nextCurrentHook !== null)) {      {        throwError( "Rendered more hooks than during the previous render." );      }    }    currentHook = nextCurrentHook;    var newHook = {      memoizedState: currentHook.memoizedState,      baseState: currentHook.baseState,      baseQueue: currentHook.baseQueue,      queue: currentHook.queue,      next: null    };    if (workInProgressHook === null) {           // 第一个hook currentlyRenderingFiber$1.memoizedState = workInProgressHook = newHook;    } else {      // 下一个hooks，关联前一个hooks      workInProgressHook = workInProgressHook.next = newHook;    }  }  return workInProgressHook;}
```

至此，调用 `setA` 方法，react 内部做了什么就比较清晰了。`setA` 会在当前 `state` 的 `queue` 里面插入一个 `update action`，并通知 react，当前有组件状态需要更新。在更新的时候，`useState` 的方法体和初始挂载的方法体不一样，更新的时候时候会忽略 `useState` 传递的 `initState`，从节点数据的 `baseState` 中获取初始数据，并一步步执行 `queue` 里的 `update action`，直至 queue 队列为空，或者 queue 执行完。

### **为什么有时候函数组件获取的状态不是实时的？**

```
const App3 = () => {  const [num, setNum] = React.useState(0);  const add = () => {    setTimeout(() => {      setNum(num + 1);    }, 1000);  };  return (    <>      <div>{num}</div>      <button onClick={add}>add</button>    </>  );}
```

在一秒内点击按钮，无论点击多少次，最终页面返回都会是 `1`。原因：setTimeout 闭包了当前状态 `num`，在执行 `update state` 的时候，对应的 baseState 其实一直没有更新，仍然是旧的，也就是 `0`，所以多次点击，仍然是 `0 + 1 = 1`。修改的方式就是传入的参数变为函数，这样 react 在执行 `queue` 的时候，会传递上一步的 `state` 值到当前函数中。

```
setNum((state) => state + 1);
```

### **为什么 useState 不能在判断语句中声明？**

react 官网有这么一段话：![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCvzRbhbTFzicE01jRj6EVicJsZJ7lkT2wagCvZg0zL8xpAeDt1wTBicTEHr3z5spqGICCnlUDee1kNvQ/640?wx_fmt=jpeg)

参考我们上面说的，多个 `state` 之间通过 `next` 进行关联，假设有 3 个 `state`，A、B、C。如果 B 在判断语句中，那么就会就会出现 A，B 的状态能够及时更新，但是 C 不会更新。因为调用 2 次 `useState`，只会更新两次 state，在 state 的链表中，A.next->B，B.next->C，那么就只会更新了 A、B，C 不会更新，导致一些不可预知的问题。

### **为什么 state 要用链表关联起来？**

这个问题我也没有想到答案，能解析的通的，感觉只有：是为了万物皆（纯）函数吧。

> 因为按照我的理解，其实是可以保持和类组件一样的状态管理。state 还是一个对象，都通过调用一个方法来进行更新。这样和类组件反倒保持了统一，更好理解。

### **结语**

通过解读源码的形式去理解 `useState` 执行过程，能够加深对 react 函数组件状态更新的理解。不足或者有错的地方，欢迎指出。

> 上文的解析，都是建立在 react@16，reac-dom@16 的基础上。

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCvzRbhbTFzicE01jRj6EVicJsxQUn5Trn9UianTEmpjOMTXv0Xf9lnG0Hsu2dbiabxoxxP8SicwNxkvI8w/640?wx_fmt=png)