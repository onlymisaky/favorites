> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2b-1QMT9Kmfa4jBGFoXaEg)

1 前言
====

大家好，我是心锁，一枚 23 届准毕业生。

如果读者阅读过我其他几篇 React 相关的文章，就知道这次我是来**填坑**的了

原因是，写了两篇解读 react-hook 的文章后我发现——并不是每位同学都清楚 React 的架构，包括我在内也只是综合不同技术文章与阅读部分源码有一个了解，但是调试时真正沉淀成文章的还没有。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zibr171hg2CwSqWYgaib37hmWiaQ6wP7eqnMk5oHQYLDicfiaQHYiaD0DVOVw/640?wx_fmt=jpeg)B583B6CBE8F38DE4BCC790B448AE4848.jpg

所以这篇文章来啦～文章基于 2022 年八九月的 React 源码进行调试及阅读，将以通俗的形式揭秘 React

阅读本文，成本与收益如下

> 阅读耗时：**26min+**
> 
> 全文字数：**1w+**
> 
> 全文字符：**5.5w+**
> 
> 预期收益：**通明境 · React 架构**

本文适合有阅读 React 源码计划的初学者或者正在阅读 React 源码的工程师，我们一起形成头脑风暴。

2 认识 Fiber 节点
=============

2.1 Fiber 节点基础部分
----------------

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  // Instance  this.tag = tag;  this.key = key;  this.elementType = null;  this.type = null;  this.stateNode = null;  ...  this.ref = null;  ...}
```

Fiber 节点本身存储了一些最基本的数据，其中包括如上六项构成`Instance`，它们分别代表

*   tag：Fiber 节点对应组件的类型，包括了 Funtion、Class 等
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zmojtOJnzu2jJOGXQeVR5bqvq5aTL7khd7vpdciblpjBia7ndcpCbJlCA/640?wx_fmt=png)
    
*   key：更新 key 会强制更新 Fiber 节点
    
*   type：保存组件本身。准确来说，对于函数组件保存函数本身，对于类组件保存类本身，对于 HostComponent，也就是如原生 <div></div > 这类原生标签会保存节点名称
    
*   elementType：保存组件类型和 type 大部分情况是一样的，但是也有不一样的情况，比如`LazyComponent`
    
*   stateNode：保存 Fiber 对应的真实 DOM 节点
    
*   ref: 和 key 一样属于 base 字段
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zlFbibGn61Oic0bTYQvIIINvT64JXuLKa5T1M8qbPOobHQ5ftnZy7dichg/640?wx_fmt=png)
    

2.2 Fiber 树结构实现
---------------

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  ...  // Fiber  this.return = null;  this.child = null;  this.sibling = null;  this.index = 0; ...}
```

我们看到 Fiber 节点这四个属性，它们的含义分别是

*   return：指向父节点 Fiber
    
*   child：指向子节点 Fiber
    
*   sibling：指向右边的兄弟节点 Fiber
    

这样子一来，对于我们这里的组件，就构成了如图的 Fiber 树

```
const CountButton = () => {  const [count, setCount] = useState(0);  const handleClick = () => {    setCount(v => v + 1);  };  useEffect(() => {    console.log('Hello Mount Effect');    return () => {      console.log('Hello Unmount Effect');    };  }, []);  useEffect(() => {    console.log('Hello count Effect');  }, [count]);  return (    <>      <div>Render by state</div>      <div>{count}</div>      <button onClick={handleClick}>Add Count</button>    </>  );};function App() {  return (    <div class>        <img src={logo} class />        <CountButton/>      </header>    </div>  );}
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zAKp6BrrtsxiavnicSLQ278ZiafEDdabMIOvZLF7ZQvIqw5tibnXftVGwvg/640?wx_fmt=png)image-20220828154533980

2.3 函数式组件 &&Fiber
-----------------

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  ...  this.pendingProps = pendingProps;  this.memoizedProps = null;  this.updateQueue = null;  this.memoizedState = null;  this.dependencies = null; ...}
```

从源码上看，React 为 hook 足足腾出了五个属性专门处理在函数式组件中使用 hook 的场景。

这些个玩意儿气其实我们在前边的 hook 章节也或多或少有了解过，这里专门讲述 Fiber 节点上存储的这些结构的作用。

### 2.3.1 pendingProps

pendingProps，从 FiberNode 的构造函数看，是 mixed（可传入）进来的

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z9ribx2OQMpAPOJEDzrbFpWtA6iarDnJhCpUdRYgKDfAvChTdQ3J1mxrw/640?wx_fmt=png)image-20220829013902960

也就是说，这部分 props 可以在 Fiber 间传递，主要用于更新 / 创造新 Fiber 节点时用来传递 props

### 2.3.2 memoizedProps

`memoizedProps`和`pendingProps`的区别是什么呢？

我们知道，props 代表一个 Function 的参数，当 props 变化时 Function 也会再次执行。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zL3APukPoo5OjuyP1e7yTib3OheHHGHZlsso2PamSDsZcwAwFRykQGhg/640?wx_fmt=gif)8E0B48BD4AA1E478A961D2C5EC0ECDDB

一般来讲，`memoizedProps`会在整个渲染流程结尾部分被更新，存储 FiberNode 的 props。

而`pendingProps`一般在渲染开始时，作为新的 Props 出现

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z1QLAvbeZKLm5g1qpwAys4NnzIQ3GicR8fqIzM9XtemNfHV0hk6gnlSQ/640?wx_fmt=png)image-20220830163001997

举个更便于理解的例子，在如图的`beginWork`阶段，会对比新的 props 和旧的 props 来确定是否更新，此时比较的就是`workInProgress.pendingProps`和`current.memoizedProps`

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z1ledd80GctTxzvyQcIVZ1QX0qicAN0dnCMkOJjBD3nFGgmLevMcormQ/640?wx_fmt=png)image-20220830163509519

### 2.3.3 updateQueue

上一篇我们讲`useEffect`有讲到，`updateQueue`以如图的形式存储`useEffect`运行时生成的各个 effect

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zDxp9DbcYWhqLIuHmtuSIcI7114oicWHnIcoqT9bUw8feuTTaXv8QPEg/640?wx_fmt=png)image-20220830163738294

lastEffect 以环形链的形式存储了单个节点的所有 effect。

（当然，这里指的当然只是函数式组件）

### 2.3.4 memoizedState

在`useState`章节，我们也有讲过`memoizedState`，`memoizedState`存储了我们调用 hook 时产生的`hook`对象，目前已知除了 useContext 不会有 hook 对象产生并挂载，其他 hook 都会挂载到这里。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zoEDtcicr9DqXbWic5movZF23IsZdrasqibWwuS5wALMXbnDmbQA2EaibsQ/640?wx_fmt=png)

hook 之间以`.next`相连形成**单向**链表。

> 而 hook 调用时产生的不管是 effect(useEffect) 还是 state(useState)，都是存储在`hook.memoizedState`，体现在 Fiber 节点上，其实是存储在`hook.memoizedState.memoizedState`，注意不要混淆。

### 2.3.5 dependencies

以下是调试代码

```
const BaseContext = createContext(1);const BaseContextDemo = () => {  const {base} = useContext(BaseContext);  return <div>{base}</div>;};const CountButton = () => {  const [count, setCount] = useState(0);  const handleClick = () => {    setCount(v => v + 1);  };  useEffect(() => {    console.log('Hello Mount Effect');    return () => {      console.log('Hello Unmount Effect');    };  }, []);  useEffect(() => {    console.log('Hello count Effect');  }, [count]);  const ref = useRef();  const [base, setBase] = useState(null);  const initValue = {    base,    setBase,  };  return (    <BaseContext.Provider value={initValue}>      <div ref={ref}>        <div>Render by state</div>        <div>{count}</div>        <button onClick={handleClick}>Add Count</button>        <button onClick={() => setBase(i => ++i)}>Add Base</button>        <BaseContextDemo />      </div>    </BaseContext.Provider>  );};
```

在还没有发出的`useContext`原理中，会记载 useContext 的实现原理，剧透就是`FiberNode.dependencies`这个属性记载了组件中通过`useContext`获取到的上下文

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z6K44khnhQCnLMTSAZkMQJRAY4PqSkOnnBGk4cZyFe0H3re9PMtb8gw/640?wx_fmt=png)image-20220906231735709

从调试结果看，多个 context 也将通过`.next`相连，同时显然，这是一条**单向链表**

2.4 操作依据
--------

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  ...  // Effects  this.flags = NoFlags;  this.subtreeFlags = NoFlags;  this.deletions = null; ...}
```

我们看到这三个属性

*   deletions：待删除的子节点，render 阶段 diff 算法如果检测到 Fiber 的子节点应该被删除就会保存到这里。
    
*   flags/subtreeFlags：都是二进制形式，分别代表`Fiber`节点本身的保存的操作依据与`Fiber`节点的子树的操作依据。
    

flags 是 React 中很重要的一环，具体作用是通过二进制在每个 Fiber 节点保存其本身与子节点的 flags。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zticicbycFcicBS4hHE1HQZHGibPlhbBovzDOu19ohlibh1G33ict2vXhsyrg/640?wx_fmt=gif)

至于具体如何保存，实际上是使用了二进制的特性，举几个例子

### 2.4.1 & 运算

> 温习一下`&运算符`的规则：只有 1&1=1，其他情况为 0

```
const NoFlags = /*                      */ 0b000000000000000000000000;const PerformedWork = /*                */ 0b000000000000000000000001;const Placement = /*                    */ 0b000000000000000000000010;const Update = /*                       */ 0b000000000000000000000100;const unknownFlags=Placement;Boolean(unknownFlags & Placement) // trueBoolean(unknownFlags & Update) //false
```

React 中会用一个未知的 flags & 一个 flag，此时是在判断未知的 flags 中是否包含 flag。

之所以说是**是否包含**，我们可以看看下边的代码。

```
const NoFlags = /*                      */ 0b000000000000000000000000;const PerformedWork = /*                */ 0b000000000000000000000001;const Placement = /*                    */ 0b000000000000000000000010;const Update = /*                       */ 0b000000000000000000000100;const unknownFlags = Placement|Update; //此时=0b000000000000000000000110Boolean(unknownFlags & Placement) // trueBoolean(unknownFlags & Update) //true
```

### 2.4.2 | 运算

> 温习一下`|运算符`的规则：只有 0&0=0，其他情况为 1

上边 unknownFlags 的例子我们不难发现，react 利用了`|运算符`的特性来存储 flag

```
const unknownFlags = Placement|Update; //此时=0b000000000000000000000110
```

这样的好处是快，判断是否包含的时候，直接使用`& 运算符`，在有限的操作依据面前，使用二进制完全可以兜住所有情况。

### 2.4.3 ~ 运算

> ～运算符会把每一位取反，即 1->0，0->1

在 React 中，~ 运算符同样是常用操作

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zib7RX7feKrVUicE5x9M5rWkUzyqWQMJAQkzaGVSUYzr6q6LcH3ALxCew/640?wx_fmt=png)image-20220914115934463

那么作用是什么呢？其实也很容易从函数上下文分析出来，对于图中这个例子，react 通过`~运算符`与`&运算符`的结合，从 flags 中删除了`Placement`这个 flag。

### 2.4.4 小总结：React 中常见的操作

*   通过`unknownFlags & Placement`判断`unknownFlags`是否包含`Placement`
    
*   通过`unknownFlags |= Placement`将`Placement`合并进`unknownFlags`中
    
*   通过`unknownFlags &= ~Placement`将`Placement`从`unknownFlags`中删去
    

> 关于有哪些 flags，我们可以翻阅到`ReactFiberFlags.js`，这里会有详细 flags 的记载
> 
> ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zibAIeggL5js2A6V1yWZ2NceicJfqsQOk2TUr6Gc6oeLfI91cdsw0QbCg/640?wx_fmt=png)

2.5 双缓存树的体现
-----------

我们曾说过，React 的最基本工作原理双缓存树，这引申出了我们需要知道这种机制在 React 中的实际体现。

这需要我们找到`ReactFiber.old.js`

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) { ...  this.alternate = null; ...}
```

由此我们知道，FIberNode 上会有一个属性`alternate`，而这个属性正是我们期望的双缓存树中，里树与外树的双向指针。

正如图所见，在初次渲染中，`current===null`，所以目前仍是白屏，而`workInProgress`已经在构建

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zicqlAPBvakLdibicH8ggAMpj7iay4UQkHtPibe0HmfnlcFZSBoibKC9SiaibpA/640?wx_fmt=png)

（图误，在 renderWithHooks 才对)

而当我们再次渲染，在`renderWithHooks`断点，就可以观察到`workInProgress.alternate==current`

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zQyu5F62HVan2oCziaEDeejIcUUE8CibZTQkIIIs4XG6ewwKjialWia2ztA/640?wx_fmt=png)

2.6* 优先级相关
----------

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  ...  this.lanes = NoLanes;  this.childLanes = NoLanes; ...}
```

和 lane 有关的变量统一和调度优先级有关，暂时不涉及（因为还没看）

2.7* React devtools Profiler
----------------------------

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  ...  if (enableProfilerTimer) {    this.actualDuration = Number.NaN;    this.actualStartTime = Number.NaN;    this.selfBaseDuration = Number.NaN;    this.treeBaseDuration = Number.NaN;    this.actualDuration = 0;    this.actualStartTime = -1;    this.selfBaseDuration = 0;    this.treeBaseDuration = 0;  } ...}
```

React 并不只是`react`，react 仓库里包含了其他工程，其中就包含了我们的 react profiler 工具，在使用了 profiler 工具的情况下，react fiber 会记录一些运行时间，其实很多带有`Profiler`的判断语句都是和 Profiler 在配合。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9znCjIx0qiafnmCuQe1bhRUYu6ibwIMT1nBYWAVibGdJ0cc5Rt1ax6OCNLA/640?wx_fmt=png)image-20220914141423794

3 好好认识 hook 结构
==============

我们上边有讲到`FiberNode.memoizedState`，我们知道这里保存的是`mountWorkInProgressHook`时产生的 hook 对象

```
{  memoizedState: 0,  baseState: 0,  baseQueue: null,  queue: ???,  next:null}
```

那么 hook 的各个项指什么？

3.1 baseState 和 memoizedState
-----------------------------

其实很好理解，baseState 对应上一次的 state（effect），memoizedState 为最新的 state（effect），总之就是 hook 保存基本数据的地方。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zibbm0bibwUrLiccmRh0kj7Hb8rjVoEr4VUN3Rbqd1OuaU9aKOYf33082A/640?wx_fmt=gif)04AC316ED382266CFE0B9C1F8B358DC6

3.2 queue
---------

而 hook.queue 则是`useState、useReducer`的 dispatcher 存储的地方。

```
var queue:UpdateQueue = {    pending: null,    lanes: NoLanes,    dispatch: null,    lastRenderedReducer: reducer,    lastRenderedState: initialState  };  hook.queue = queue;  var dispatch = queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber$1, queue);
```

对于 queue 的结构，我们逐一讲解

### 3.2.1 lastRenderedState & lastRenderedReducer

*   queue.lastRenderedState 属性存储上一个 state
    
*   queue.lastRenderedReducer 属性存储 reducer 内部状态变更逻辑
    

其中`queue.lastRenderedReduce`可能不好理解，我们可以从代码中理解，且看这里

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zkbDY6bl5pmyN7IUaWxt8lMSariabgibB2hoPMWzWx3ynHdas7OfZsibuw/640?wx_fmt=png)image-20220907155356838

```
function basicStateReducer(state, action) {  // $FlowFixMe: Flow doesn't like mixed types  return typeof action === 'function' ? action(state) : action;}function mountState(initialState) {  ...  hook.memoizedState = hook.baseState = initialState;  var queue = {    pending: null,    lanes: NoLanes,    dispatch: null,    lastRenderedReducer: basicStateReducer,    lastRenderedState: initialState  };  ...}
```

这是`dispatchSetState`中的一段逻辑，处理的正是我们下边将讲述的，「不在渲染中」的处理阶段（onClick 触发 === 异步触发）。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zibYg0jx4LIaspcLRM0CkgiaAlOicaAEpyJoJ7OAPwSgibaFLeJtsg1qFlw/640?wx_fmt=png)image-20220907160421253

那这里可以看到，我们可以从`lastRenderedReducer`得到 eagerState

```
var currentState = queue.lastRenderedState;var eagerState = lastRenderedReducer(currentState, action); // Stash the eagerly computed state, and the reducer used to compute// it, on the update object. If the reducer hasn't changed by the// time we enter the render phase, then the eager state can be used// without calling the reducer again.
```

eagerState 是什么? 实际上这里是通过 lastRenderedReducer 快速获得了最近一次的 state。

react 会通过`objectIs(eagerState,currentState)`来确定是否不进行更新，这也是为什么我们更新 state 的时候要注意 state 为不可变数据，每次更新都需要更新一个新值才有效

```
if (objectIs(eagerState, currentState)) {  enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update);  return;}
```

### 3.2.2 dispatch

dispatch 属性存储状态变更函数，对应 useState、useReducer 返回值中的第二项

```
function mountState(initialState) {  var hook = mountWorkInProgressHook();  if (typeof initialState === 'function') {    initialState = initialState();  }  hook.memoizedState = hook.baseState = initialState;  var queue = {    pending: null,    lanes: NoLanes,    dispatch: null,    lastRenderedReducer: basicStateReducer,    lastRenderedState: initialState  };  hook.queue = queue;  var dispatch = queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber$1, queue);  return [hook.memoizedState, dispatch];}
```

值得注意的就是 dispatch 会通过. bind 事先注入`currentlyRenderingFiber$1, queue`两个参数，此间通过 bind 绑定的`currentlyRenderingFiber$1`，作用是判断这个更新是在 fiber 的 render 阶段还是异步触发。

> 这也给了我们一个判断 fiber 在 render 阶段的条件
> 
> ```
> function isRenderPhaseUpdate(fiber: Fiber) { const alternate = fiber.alternate; return (   fiber === currentlyRenderingFiber ||   (alternate !== null && alternate === currentlyRenderingFiber) );}
> ```

### 3.2.3 pending

pending 属性存储排队中的状态变更规则，单向环形链表结构。

在源码中，每一个规则以`Update`的结构连接

```
export type Update<S, A> = {|  lane: Lane,  action: A,  hasEagerState: boolean,  eagerState: S | null,  next: Update<S, A>,|};
```

那么我们知道了

*   eagerState 缓存上一个状态（React 称之为急迫的状态）
    
*   action 代表状态变更的规则，可以是本次要被修改的值，也可以是函数
    
*   hasEagerState 则是记录是否执行过优化逻辑
    

eagerState 在所有源码中只在这里使用，根据 React 源码，这里的优化指的是 React 会在 eagerState===currentState 的情况下，不做重渲染。如果状态更新前后没有变化，则可以略过剩下的步骤。

```
try {  var currentState = queue.lastRenderedState;  var eagerState = lastRenderedReducer(currentState, action);  update.hasEagerState = true;  update.eagerState = eagerState;  if (objectIs(eagerState, currentState)) {    enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update);    return;  }} catch (error) {} finally {  {    ReactCurrentDispatcher$1.current = prevDispatcher;  }}
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zs5SeXndqQicoa3802uG3QHc2ibsib76Vw5teh5icia84Z1fjhEwsoakSYbg/640?wx_fmt=png)image-20220909230608210

3.3 baseQueue
-------------

值得注意的是，baseQueue 的结构来自 queue.pending 而不是 queue

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zTvPvPzCOxM1uX4ttRmrJS08YguDO7s8HyA09icbzlia8sCHSWG1RvlQQ/640?wx_fmt=png)image-20220910231501779

（baseQueue 被赋值 queue.pending）

其余的大抵是没啥好说的，baseQueue 在调试中的体现我暂时并没有遇到，推测需要有比较大量的更新。

4 React 架构
==========

本章我们讲述 React 的渲染流程，将覆盖 React 的`render`阶段与`commit`阶段的概念与流程概览，不会非常深入，争取留存印象。

4.1 React 渲染关键节点
----------------

我们已经预先知道可以将 React 的渲染分成`render`阶段和`commit`阶段，也知道`render`阶段的关键函数是`beginWork`和`completeWork`，`commit`阶段的关键函数则是`commitRoot`。

在这个基础上，我们从调用堆栈中可以找到这两个阶段的起始节点。

*   render 阶段
    

我们在 beginWork 中打上断点，然后可以回溯调用堆栈找到出发点。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zM0ib2I0V2vrXXqCL399LtJ1MZGs3yibM1aVfXoSibC15LbRR1hNRE7SicQ/640?wx_fmt=gif)12B98F3540B6E694265C5D47D49495F8

从图中，我们可以知道 renderRoot 触发于`performConcurrentWorkOnRoot`

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zyRD4UM5FFz2XKGVoUUah8k8SgiaKwyelV3gTfYMmkxQ5R6DiaHq6jGdQ/640?wx_fmt=png)

除此之外，在`performSyncWorkOnRoot`中也可以走入 renderRoot

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zHBXNfRozVDIG82EjGOHSMcXk5XocSeKrxmib2HfATa1WNajibiamyNyLw/640?wx_fmt=png)image-20220911174952904

它们会根据情况走到`renderRootConcurrent`或者`renderRootSync`，这里即是 render 阶段的开始点

> 那么我们得到第一个关键节点：
> 
> *   render 阶段开始于`renderRootConcurrent`或`renderRootSync`
>     

*   commit 阶段
    

我们知道，render 阶段的尾巴是`completeWork`，commit 阶段的起步是`commitRoot`，我们尝试在这`completeWork`方法中断点，然后单步调试到`commitRoot`。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zz8ehnianN3wThbKnNm1awo7csicpZEU1WLs8UoouaElhFa2Seu10QrJA/640?wx_fmt=png)image-20220911173640119

上图是我 debug 出来的结果，`completeWork`与`commitRoot`之间的最近公共函数节点是`performSyncWorkOnRoot/performConcurrentWorkOnRoot`。

那么我们知道，`commitRoot`即是 commit 阶段的起点。

> 那么我们得到两个关键信息：
> 
> *   commit 阶段开始于`commitRoot`
>     
> *   render 阶段和 commit 阶段通过`performSyncWorkOnRoot/performConcurrentWorkOnRoot`联动
>     

### 4.1.1 小总结

*   render 阶段开始于`renderRootConcurrent`或`renderRootSync`
    
*   commit 阶段开始于`commitRoot`
    
*   render 阶段和 commit 阶段通过`performSyncWorkOnRoot/performConcurrentWorkOnRoot`联动
    

4.2 状态更新流程
----------

### 4.2.1 找到 root 节点

正常 render 的第一步，是找到当前 Fiber 的 root 节点。

以 useState 造成的渲染举例，React 会通过`enqueueConcurrentHookUpdate->getRootForUpdatedFiber`找到当前节点的 root 节点。

```
function dispatchSetState(fiber, queue, action) {  ...    var root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);    if (root !== null) {      var eventTime = requestEventTime();      scheduleUpdateOnFiber(root, fiber, lane, eventTime);      entangleTransitionUpdate(root, queue, lane);    }  ...}
```

```
function getRootForUpdatedFiber(sourceFiber) {  ...  detectUpdateOnUnmountedFiber(sourceFiber, sourceFiber);  var node = sourceFiber;  var parent = node.return;  while (parent !== null) {    detectUpdateOnUnmountedFiber(sourceFiber, node);    node = parent;    parent = node.return;  }  return node.tag === HostRoot ? node.stateNode : null;}
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zUDqdL2JYmuaZFxGb8meAF5LN8qGgYib4Ns29Anmuaicz9HGq7GV0q0lg/640?wx_fmt=png)image-20220911230326450

寻找 root 节点是一个向上不断寻找 root 节点的过程，在这个过程中 react 还会持续调用`detectUpdateOnUnmountedFiber`检查是否调用了过期的更新函数。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zcQNlH2iapss5HGK4ichqR5iaAewyI6chGxO8l4A8SbyVuFFNaGZkZlEQg/640?wx_fmt=png)image-20220911225903147

> 什么是过期的更新函数？举个例子，通过 useRef 保存了 setState 方法，但是随着组件更新 ref 中的 setState 方法并没有更新，此时由于 setState 方法本质上是通过. bind 的形式报存了函数及参数 fiber 节点，此时就会存在调用了一个已卸载组件的过期的 setState 方法。

### 4.2.2 调度同步 / 异步更新

找到 root 节点之后，那么就要进入`render流程`，这就存在一个问题。

我们上边说了，`render`阶段的触发函数是`performSyncWorkOnRoot`或`performConcurrentWorkOnRoot`，那么如何判断应该进入同步更新还是异步更新呢？

这就要走到`ensureRootIsScheduled`，`ensureRootIsScheduled`会通过判断`newCallbackPriority === SyncLane`来确定走同步 render 还是异步 render，这里涉及调度器，暂时不讲（还没看还不会）

```
function ensureRootIsScheduled(root, currentTime) {  ...  var newCallbackNode;  if (newCallbackPriority === SyncLane) {    // Special case: Sync React callbacks are scheduled on a special    // internal queue    if (root.tag === LegacyRoot) {      ...      scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root));    } else {      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));    }    ...        newCallbackNode = null;  } else {    var schedulerPriorityLevel;      ...        newCallbackNode = scheduleCallback$2(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root));  }  root.callbackPriority = newCallbackPriority;  root.callbackNode = newCallbackNode;}
```

那么可以看到，这里会有一个`scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))`或者`scheduleCallback$2(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root))`的过程。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zB4WvNWZMhjgaa7CbRtKw5MgiaRvp5k0kvW93Oib4iaRPusyAfVib3pk1DQ/640?wx_fmt=gif)CA3CC756047F3449F8F0A001D7583135

值得注意的是，同步调度这里还更复杂，react 一方面需要考虑是否是严格模式做不同的 callback

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zJtfRoRuib1atLs0kqU2jDpRspMMBexUKicMia0ibmWic5ibkflsTMkWDmBuw/640?wx_fmt=png)image-20220911234438727

（ensureRootIsScheduled 是一个很重要的函数，会 Scheduled 一起讲会比较好）

另一方面还调度了`flushSynCallbacks`，这个函数做的事情很简单，就是把 syncQueue 中的待执行任务全部执行

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z6HB7E8efDTsaVsiaxUVWGLkRh6MicPgKCQhbicZcTibw5ic0WrJJIuRQk9Q/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zyquPMZiaD2V1WibphoyF0picaYTLZNva7yEzrMfwEDSXmjhxpa7VFgmibw/640?wx_fmt=png)

### 4.2.3 render 阶段

> render 阶段分成了两个阶段，我们在状态更新流程中不讲细节，只讲明基本作用，细节请看后边的单章

经历了调度更新，会来到 render 阶段，render 阶段做了两件事。

*   `beginWork`阶段。在这个阶段 react 做的事情是从 root 递归到子叶，每次`beginWork`会对`Fiber`节点进行新建 / 复用逻辑，然后通过`reconcileChildren`将`child Fiber`挂载到`workInProgress.child`并在`child Fiber`上记录 flags，最终遍历整个 Fiber 树
    
*   `completeWork`阶段。在这个阶段，是从子叶不断向上遍历到父亲 Fiber 节点的过程，这个过程中，`completeWork`会把`workInProgress Tree`上的真实 DOM 挂载 / 更新上去。
    

那么总结来说，`beginWork`负责虚拟 DOM 节点`Fiber Node`的维护与 flag 记录，completeWork 负责真实 DOM 节点在`Fiber Node`的映射工作。

当然，这些操作只涉及节点维护，真正渲染到页面上就是 commit 阶段要负责的了

### 4.2.4 commit 阶段

commit 阶段，除了会处理一下和`hook`相关的事情之外，最主要做了就是负责把 beginWork 阶段记录的 flags 在真实 DOM 树上进行操作。

总结来说：

*   处理和`useEffect\useInsertionEffect\useLayoutEffect`相关的 hook，处理 class 组件相关的生命周期钩子
    
*   基于 flags 做真实 DOM 树操作，包括增删改，以及输入框类型节点的 focus、blur 等问题
    
*   清理一些全局变量，并确保进入下一次调度
    

4.3 render 阶段
-------------

这里是延续状态更新流程的 render 阶段。

我们在状态更新第一步就拿到了 root 节点，经过调度更新后会进入 render 阶段。

此时我们有两种走法，一种是通过`renderRootSync`来到`workLoopSync`，另一种则是通过`renderRootConcurrent`走到`workLoopConcurrent`，这两者的区别是`workLoopConcurrent`会检查浏览器是否有剩余时间片。

```
function workLoopConcurrent() {  // 执行工作，直到调度程序要求我们让步  while (workInProgress !== null && !shouldYield()) {    performUnitOfWork(workInProgress);  }}function workLoopSync() {  // 已经超时了，因此无需检查我们是否需要让步就可以执行工作  while (workInProgress !== null) {    performUnitOfWork(workInProgress);  }}
```

workLoop 做了什么呢？这就要从`performUnitOfWork(workInProgress)`说起，下边的代码是精简逻辑 (只剩下 beginWork 这部分逻辑) 过后的`performUnitOfWork`函数，可以看到`performUnitOfWork`通过`beginWork`创建了一个新的节点赋给`workInProgress`。

```
function performUnitOfWork(unitOfWork) {  var current = unitOfWork.alternate; // currentFiber  setCurrentFiber(unitOfWork); // 会将全局current变量设定为workInProgressFiber  var next = beginWork$1(current, unitOfWork, renderLanes$1); // currentFiber    resetCurrentFiber(); // 重置current变量为null  unitOfWork.memoizedProps = unitOfWork.pendingProps;  workInProgress = next;  ...}
```

### 4.3.1 beginWork

那么此处引出了 render 阶段中最重要的两个函数之一`beginWork`，beginWork 正如上边所说，这个函数的职责是返回一个 Fiber 节点，这个节点可以复用`currentFiber`也可以创建一个新的。

我们其实在【useState 原理】章节中有见过 beginWork，当时我们强调了双缓存机制，这次我们可以更细地了解一下 beginWork。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zd33tVtMjq3J5KDJHme5Rx1SrzIasiaKnhpQue6g1qicEZTJe63ezEwrQ/640?wx_fmt=jpeg)3EC7BC0E6EDF9F966E3F99EB3AEAE44A

我们提炼一下 beginWork 的核心逻辑，会发现`beginWork`通过`current!==null`来判断是否是第一次执行，这里的逻辑是如果是第一次执行，那么 Fiber 没有 mount，自然为 null。

```
function beginWork(current, workInProgress, renderLanes) {  ...  if (current !== null) {    var oldProps = current.memoizedProps;    var newProps = workInProgress.pendingProps;    if (oldProps !== newProps || hasContextChanged() || (     workInProgress.type !== current.type )) {      didReceiveUpdate = true;    } else {      var hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current, renderLanes);      if (!hasScheduledUpdateOrContext &&      (workInProgress.flags & DidCapture) === NoFlags) {        // 没有待更新的updates或者上下文信息，复用上次的Fiber节点        didReceiveUpdate = false;        return attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);      }      ...    }  } else {    didReceiveUpdate = false;  ...  }  workInProgress.lanes = NoLanes;  switch (workInProgress.tag) {    ...    case FunctionComponent:    ...    case HostComponent:    ...  }}
```

#### #1 update 复用逻辑

看到这里，react 在 update 的逻辑中，根据三个条件来判断是否复用上一次的 FIber

*   oldProps !== newProps，代表`props`是否变化
    
*   hasContextChanged()，
    
    ```
    var didPerformWorkStackCursor = createCursor(false); // Keep track of the previous context object that was on the stack.// We use this to get access to the parent context after we have already// pushed the next context provider, and now need to merge their contexts.
    ```
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z2mQIff7oxsSPqRPKYMtZnajAy7zviadoNG7n612ibd4hlJxC4lkgodog/640?wx_fmt=png)image-20220912142905277
    
*   workInProgress.type !== current.type，`fiber.type`是否变化
    

```
function beginWork(current, workInProgress, renderLanes) {  ...  if (current !== null) {    var oldProps = current.memoizedProps;    var newProps = workInProgress.pendingProps;    if (oldProps !== newProps || hasContextChanged() || (     workInProgress.type !== current.type )) {      didReceiveUpdate = true;    } else {   //此处是复用的逻辑      ...    }  } else {    didReceiveUpdate = false;  ...  } ...}
```

#### #2 mount/update 新建逻辑

不满足更新条件的话，会根据`workInProgress.tag`新建不同类型的 Fiber 节点。对于不进行 Fiber 复用到更新也会进入这个逻辑

```
switch (workInProgress.tag) {    case IndeterminateComponent:      {        return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderLanes);      }    case LazyComponent:      {        var elementType = workInProgress.elementType;        return mountLazyComponent(current, workInProgress, elementType, renderLanes);      }    case FunctionComponent:      {        var Component = workInProgress.type;        var unresolvedProps = workInProgress.pendingProps;        var resolvedProps = workInProgress.elementType === Component ? unresolvedProps : resolveDefaultProps(Component, unresolvedProps);        return updateFunctionComponent(current, workInProgress, Component, resolvedProps, renderLanes);      }    case ClassComponent:      {        var _Component = workInProgress.type;        var _unresolvedProps = workInProgress.pendingProps;        var _resolvedProps = workInProgress.elementType === _Component ? _unresolvedProps : resolveDefaultProps(_Component, _unresolvedProps);        return updateClassComponent(current, workInProgress, _Component, _resolvedProps, renderLanes);      }  ...  }
```

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zIiaIrzR3Doawib7CcyeM5DnKOG8olM9NCdGwCXmYskakJcObI2uQ7JiaQ/640?wx_fmt=gif)3FEEA7F7D362DFF7489B5CD937294085

根据我们在【useState】章节的收获，不管是 update 还是 mount 都要走到`reconcileChildren`

```
function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {  if (current === null) {    // mount时    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren, renderLanes);  } else {    // update时    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);  }}
```

这里做的事情描述起来是比较好办的，不过详细起来就涉及 diff 算法需要开单章

*   mount 时，创建新的 Child Fiber 节点
    
*   update 时，将当前组件与该组件在上次更新时对应的`Fiber`节点进行 diff 比较，将比较的结果生成新`Fiber`节点
    

当然，不管走到哪里，workInProgress 都会得到一个 child FIber

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zfVLozibXnYicPPB2GNO8IIZHQkW2Lj8jvFluibrtW9VP7gmicPkgDoQkYA/640?wx_fmt=png)

不管是`reconcileChildFibers`还是`mountChildFibers`，都是通过调用 ChildReconciler 这个函数来运行的。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zOm4QuibkTYZfUrffmhfn7fib88nKUzsuCib6xCdawuj0BgJrDWicANxYtQ/640?wx_fmt=png)image-20220912163436219

而在整个 ChildReconciler 中，我们会经常性看到如图一样的操作。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zMAIVqathqUS98JdtFz1H1ibvZ8ekv7H7vaiars2fttJGScXoAMPdgW1g/640?wx_fmt=png)image-20220912193434317

这便引出了操作依据一说，react 用`Fiber.flags`并以二进制的形式存贮了对于每个 Fiber 的操作依据，这种方式比数组更高效，可以方便地使用位运算发为`Fiber.flags`增删不同的操作依据。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zt80Mrr14jZRCL66PBJ2S2YJpCWibE82L4LfPg3iblF0haicXVeuBqqrgA/640?wx_fmt=png)image-20220912193542891

> 点击这里可以查看所有的操作类型

#### #3 diff 算法 *

标记这个知识点，下次再说

### 4.3.2 completeWork

我们持续执行 workLoop，会发现`workInProgress`从`rootFiber`持续深入到了我的调试代码中的最底层（一个 div），此时就到了 render 阶段的第二个阶段`completeWork`。

```
function performUnitOfWork(unitOfWork) {  ...  if (next === null) {    // 进入completeWork    completeUnitOfWork(unitOfWork);  } else {    ...  }  ...}
```

那么此时进入`completeUnitOfWork`，这里的**核心逻辑是 completeWork 从子节点不断访问`workInProgress.return`向上循环执行`beginWork`，如果遇到兄弟子节点，则会将 workInProgress 指向兄弟节点并返回至`performUnitOfWork`。重新执行 beginWork 到 completeWork 的整个 render 阶段。**

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z9dOkVibUyVwANQFDNSvGVQnFnXFE0eGibwtibNBlc6pLebHq3Tjur4yoA/640?wx_fmt=png)image-20220912180238796

那么 completeWork 做了什么？这里是 completeWork 的基本逻辑框架（我把 bubbleProperties 提出来方便理解每个`completeWork`都会执行这前后两条语句），做了`popTreeContext`和`bubbleProperties`。

```
function completeWork(current, workInProgress, renderLanes) {  popTreeContext(workInProgress);  switch (workInProgress.tag) {    case FunctionComponent:      ...    case HostComponent:      ...    ...  }  bubbleProperties(workInProgress);}
```

popTreeContext 是和上边 beginWork 相关的内容，这里的目的是使得正在进行的工作不处于堆栈顶部。对应 pushContext 的阶段一般在 beginWork 的 swtich 中进入的函数中都可以找到

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zTC8AaoDJjbib5xYgkCMMtuKxXpADvn12CFsrb5mAUlnrVHzibH8licRpQ/640?wx_fmt=png)

而`bubbleProperties`的核心逻辑我也提了出来，可以看到这里是做了一个层遍历，遍历了`completedWorkFiber`的所有 child，将它们的 return 赋值为`completedWorkFiber`。同时，这里也涉及了`subtreeFlags`的计算，会将子节点的操作依据冒泡到父节点。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zuokibSbzIISIdKMoA9ZhR7BPLM0ISL5lBPpAr1SV1bEoZm7Nia4iaLa8A/640?wx_fmt=gif)FA2E2BD1166CC5583D24B03D6E0E6B0A

而关于`subtreeFlags`的具体用处，在 commit 阶段，我们后边说。

```
function bubbleProperties(){  ...  var newChildLanes = NoLanes;  var subtreeFlags = NoFlags;  {      var _child = completedWork.child;      while (_child !== null) {        newChildLanes = mergeLanes(newChildLanes, mergeLanes(_child.lanes, _child.childLanes));        subtreeFlags |= _child.subtreeFlags;        subtreeFlags |= _child.flags;        _child.return = completedWork;        _child = _child.sibling;      }    }    completedWork.subtreeFlags |= subtreeFlags;   }  ...}
```

后续的话，会根据`workInProgress.tag`来走不同的逻辑，我们这里主要说 HostComponent 的逻辑，代表原生组件。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zIDFNoSqdDd8gb4NOO7exQwmiaH3kEKJGfZJM4bT1GLYSVbPvpST74qQ/640?wx_fmt=gif)9790B760B1E00F83BD11B87BB75D9B7A

下边是我提炼出来的核心逻辑，这里同样会区分`update`和`mount`。

```
function completeWork(current, workInProgress, renderLanes) {  popTreeContext(workInProgress);  switch (workInProgress.tag) {    ...    case HostComponent:{        popHostContext(workInProgress);        var type = workInProgress.type;        if (current !== null && workInProgress.stateNode != null) {          updateHostComponent$1(current, workInProgress, type, newProps);          ...        } else {          ...          var currentHostContext = getHostContext();          var rootContainerInstance = getRootHostContainer();          var instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress);          appendAllChildren(instance, workInProgress, false, false);          workInProgress.stateNode = instance;                    ...        }        bubbleProperties(workInProgress);        return null;    }    ...  }}
```

#### #1 update 时

update 时，无需生成新的 DOM 节点，所以此时要处理 props，在`updateHostComponent`中，第二部分会调用`prepareUpdate->diffProperties`获得一个 updatePayload 挂载在`workInProgress.updateQueue`上

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z9ypQFZYPun3ap0evOyckUCjIPuHUL6u9oy6cztKiaa0BdFwLl3lfPMw/640?wx_fmt=png)image-20220912202620837![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zdcnZrOLl3CW1cg2kTqvRgICGLklKJENUgbAffrExGaPARpHNfnZ2cQ/640?wx_fmt=png)image-20220912230012226

具体会处理哪些 props，我们深入到`diffProperties`就可以找到这一块的逻辑

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zniagpicHwv66Hwqa5MaKjUCYDkHJJI7c1xrUHxce8nOT6UhDOMLttblA/640?wx_fmt=png)image-20220912230843810![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zTicKMoIM7Hetib7eHc2f2fbKic7weUKcd7QUnCZwlR90mYkznmFZdtic2g/640?wx_fmt=png)

OK，那么我们回到上边所说的`updatePayload`，调试发现`updatePayload`是一个数组，数据结构体现为一个偶数为 key，奇数为 value 的数组：

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zYvxZlTwQFFic9gdAf2vL2ia0dMGdBhHWnTHiagFR9ic6LkiaJFLT2BYlsSw/640?wx_fmt=png)image-20220912231244691

到了这一步，update 流程最后会走入`markUpdate`，至此。completeWork 的 update 逻辑完毕

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zPjqHUnWib7nE6QsEWQIjnxwn1QtjeDOrPSicwZYOJzeicGEU7aL0mLzgw/640?wx_fmt=png)image-20220912231509268

#### #2 mount 时

我们此时来看 mount 时的逻辑，这里最核心的逻辑简化后其实只有几句

```
function completeWork(current, workInProgress, renderLanes) {  popTreeContext(workInProgress); ...  var currentHostContext = getHostContext();  var rootContainerInstance = getRootHostContainer(); // 获得root真实DOM    var instance = createInstance(type, newProps, rootContainerInstance, currentHostContext, workInProgress);// 创建Fiber对应的真实DOM      appendAllChildren(instance, workInProgress, false, false);//将创建的真实dom插入workInProgressFiber      workInProgress.stateNode = instance;  ...  bubbleProperties(workInProgress);  }
```

我们关注`appendAllChildren`，这里的逻辑是将新建的 instance 作为真实节点 parent，将其插入到 workInProgressFiber 的真实节点中（因为一个 Fiber 节点不一定有真实节点，所以要找到可以插入的真实节点）

```
appendAllChildren = function (parent, workInProgress, needsVisibilityToggle, isHidden) {    // We only have the top Fiber that was created but we need recurse down its    // children to find all the terminal nodes.    var node = workInProgress.child;    while (node !== null) {      if (node.tag === HostComponent || node.tag === HostText) {        appendInitialChild(parent, node.stateNode);      } else if (node.tag === HostPortal) ; else if (node.child !== null) {        node.child.return = node;        node = node.child;        continue;      }      if (node === workInProgress) {        return;      }      while (node.sibling === null) {        if (node.return === null || node.return === workInProgress) {          return;        }        node = node.return;      }      node.sibling.return = node.return;      node = node.sibling;    }  };
```

那么这里实际做的就是把真实 DOM 挂载到`workInProgressFiber`上，又由于我们上边说了，complateWork 是一个从子节点向上遍历的过程，那么遍历完毕的时候，我们就得到了一颗构建好的`workInProgress Tree`

![](https://mmbiz.qpic.cn/mmbiz_jpg/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zCnh4B2b0uLrraWEcF1Ycv5OWTluP3z8uFCa47eIXzUnO2QvRQopGvw/640?wx_fmt=jpeg)768151FDD996975166D8ED800FB15F44

那么接着，就是 commit 阶段了。

4.4 commit 阶段
-------------

首先我们要知道 commit 阶段的职责是什么。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z9uO9DfDsaRnZ8CJMO40FrlfOGJloQ2MHMKWuWAUghGGAVyC78icbzzA/640?wx_fmt=jpeg)BF43DF9506C66549A9DE61E7BFD390C2

这样的话，我们又要强调一下双缓存树了，`workInProgress`树是一颗在内存中构建的 DOM 树，`current`树则是页面正在渲染的 DOM 树。

在此基础上，render 阶段已经完成了内存中构建下一状态的`workInProgress`，那么此时 commit 阶段正应该做将`current`树与`workInProgress`树调换的工作。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zlC3bMUKKY4dPEVNWL6bVtgcVy48erERvJsBELFM9C8icJibFDNPzIGrA/640?wx_fmt=gif)27C9BA14FEC45B6C24BF60C8F18C84B6

而调换工作中，由于 render 阶段的真实 DOM 并没有更新，只是做了标记，此时会需要 commit 阶段负责把这些更新根据不同的操作标记在真实 DOM 上操作。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zsJJzMR8UPIY5K1chkekntuKl0RxRCLWYs4JCic7CicicTC9lnBLBu240Q/640?wx_fmt=gif)43885F5E1F8C7FF2B3392D297C855609

commit 阶段开始于`commitRoot`，往下就是调用`commitRootImpl`，我们会着重分析`commitRootImpl`

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zP5ria1v2rmQIfkyblXOWtOkCSE1YwxXNg1pribQuEXNbk602n95cMMQw/640?wx_fmt=png)image-20220913001550758![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zoe72dSDSxjwSZ7zZFQ0kxpnUqmePEOFYksy1D2ibwnkFFbouoicrT5kA/640?wx_fmt=png)image-20220913001951456

首先看入参，可以看到`commitRootImpl`的入参有四个，其中`root`为最基本的参数，传入的是已准备就绪的`workInProgressRootFiber`。

```
function commitRootImpl(  root: FiberRoot,  recoverableErrors: null | Array<CapturedValue<mixed>>,  transitions: Array<Transition> | null,  renderPriorityLevel: EventPriority,)
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z5PjQPYxPL33Gq7LM1NgXNZ8ctOvjiaxZOD43MxdFy0oOScmTarM5u7A/640?wx_fmt=png)image-20220913103915403

我们认为 commit 阶段可以分为三个阶段，分别代表

*   before mutation，在执行 DOM 操作前的阶段
    
*   mutation，执行 DOM 操作
    
*   layout，执行 DOM 操作之后
    

当然，在这些流程之外，commit 阶段还会处理`useEffect`这类需要在 commit 阶段执行的 hook。

### 4.4.1 Before commit start

在 commit 开始之前，即 before mutation 之前的代码可以从下边看见，它们具体做了什么我直接在代码中注释了，请看注释。

```
function commitRootImpl(
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
  renderPriorityLevel: EventPriority,
) {
  do {
		// 这里会调度未执行完的useEffect，之所以上下各有一处，一方面是和React优先级有关，一方面也和因为调度`useEffect`等hook时重新进入了render阶段重新进入到commit阶段有关。
    flushPassiveEffects();
  } while (rootWithPendingPassiveEffects !== null);

  ...
	// 和flags类似的二进制
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    throw new Error('Should not already be working.');
  }

  // finishedWork是已经处理好的workInProgressRootFiber
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  ...
  if (finishedWork === null) {
    return null;
  }
 
  //重置待commit的rootFiber，重置commit优先级
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
	...
  // commitRoot总是同步完成
  // 所以在这里清除Scheduler绑定的回调函数等变量允许绑定新的函数
  root.callbackNode = null;
  root.callbackPriority = NoLane;

  //一些优先级的计算
  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  const concurrentlyUpdatedLanes = getConcurrentlyUpdatedLanes();
  remainingLanes = mergeLanes(remainingLanes, concurrentlyUpdatedLanes);

  markRootFinished(root, remainingLanes);

  if (root === workInProgressRoot) {
    // 完成后，重置全局变量
    workInProgressRoot = null;
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
  }


  // 当finishedWork中存在PassiveMask标记时，调度useEffect
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      pendingPassiveEffectsRemainingLanes = remainingLanes;
      pendingPassiveTransitions = transitions;
      scheduleCallback(NormalSchedulerPriority, () => {
        // 这里会调度useEffect的运行，详情请看【useEffect】篇
        flushPassiveEffects();
        return null;
      });
    }
  }
    
	...
}
```

这里有一点值得注意的是，伴随着`flushPassiveEffects`的调用，在堆栈中完全可能形成多次`commit`，这是来源于`useEffect`的副作用触发了组件渲染，在这种情况下会再走一次状态更新流程（当然这期间有优化）

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zBbTmyibrSOrKv3KvibLoRoNR5BCicHkXOx3YTdmBXfq03wFzwzK6BhXOQ/640?wx_fmt=png)image-20220913163639067

### 4.4.2 BeforeMutation

commit 阶段的正式开始，在于`commitBeforeMutationEffects`这个函数，可以看到当 react 确定 subtreeFlags 或者 root.flags 上可以找到`BeforeMutationMask | MutationMask | LayoutMask | PassiveMask`时，会触发 commit 的逻辑

```
var subtreeHasEffects = (finishedWork.subtreeFlags & (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== NoFlags;  var rootHasEffect = (finishedWork.flags & (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !== NoFlags;  if (subtreeHasEffects || rootHasEffect) {    ...    var shouldFireAfterActiveInstanceBlur = commitBeforeMutationEffects(root, finishedWork);    ...  } else {    // No effects.    root.current = finishedWork;  }
```

那么我们首先来看`commitBeforeMutationEffects`，那么可以看到 commitBeforeMutationEffects 紧接着调用了`commitBeforeMutationEffects_begin`。

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z1ibfvHG1IwBCm92ibFSdD2RtYlS9BYJ5PY6ZfL7vsQAKcEMTEA86Mhow/640?wx_fmt=gif)244392FC225E2177F8435874B3A49BE3

而 commitBeforeMutationEffects_begin 做的事情是从`finishedWork`向下遍历 fiber 树，一直到遍历到某个 Fiber 节点不再有`BeforeMutationMask`标记，此时会进入`commitBeforeMutationEffects_complete`。

```
function commitBeforeMutationEffects(root, firstChild) {  // 处理焦点相关的逻辑，处理原因是因为真实DOM的增删导致可能出现的焦点变化  focusedInstanceHandle = prepareForCommit(root.containerInfo);  // nextEffect是一个全局变量，firstChild对应上方传参`finishedWork`  nextEffect = firstChild;  commitBeforeMutationEffects_begin();   // 处理Blur相关的逻辑  var shouldFire = shouldFireAfterActiveInstanceBlur;  shouldFireAfterActiveInstanceBlur = false;  focusedInstanceHandle = null;  return shouldFire;}  function commitBeforeMutationEffects_begin() {  while (nextEffect !== null) {    var fiber = nextEffect;    var child = fiber.child;    if ((fiber.subtreeFlags & BeforeMutationMask) !== NoFlags && child !== null) {      child.return = fiber;      nextEffect = child;    } else {      commitBeforeMutationEffects_complete();    }  }}
```

而`commitBeforeMutationEffects_complete`同样是做了一次遍历，这次的过程则是不断向上返回，调用过程中不断执行`commitBeforeMutationEffectsOnFiber`。

```
function commitBeforeMutationEffects_complete() {  while (nextEffect !== null) {    var fiber = nextEffect;    setCurrentFiber(fiber);    try {      commitBeforeMutationEffectsOnFiber(fiber);    } catch (error) {      captureCommitPhaseError(fiber, fiber.return, error);    }    resetCurrentFiber();    var sibling = fiber.sibling;    if (sibling !== null) {      // 注意这里，发现了嘛，和completeWork非常相似的逻辑对吧      sibling.return = fiber.return;      nextEffect = sibling;      return;    }    nextEffect = fiber.return;  }}
```

继续到`commitBeforeMutationEffectsOnFiber`，发现这里只有两个简单的内容

*   一个是对于 ClassComponent 会调用 getSnapshotBeforeUpdate
    
*   另一个则是会 HostRoot 进行`clearContainer(root.containerInfo)`
    

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zKicqSPbcoyS0yibo8xyRXFfz2TIjFB17XYXnFoARagQZ6DHgl2lyu5Pg/640?wx_fmt=png)image-20220913171907770![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zqV4thudxjQTjTx4do0d3gWvHN9ibYmUnIyK6xALeGzCqF1wu4D29DoA/640?wx_fmt=png)image-20220913171936689

#### # 小结

那么我们对 BeforeMutation 阶段进行小结，现在我们知道 React 在 BeforeMutation 主要做了两件事

*   处理真实 DOM 增删后的 `focus`、`blur`逻辑
    
*   调用 ClassComponent 的`getSnapshotBeforeUpdate`生命周期钩子
    

### 4.4.3 Mutation

commit 第二阶段，我们会进入`commitMutationEffects`->`commitMutationEffectsOnFiber`

```
if (subtreeHasEffects || rootHasEffect) {    ...    commitMutationEffects(root, finishedWork, lanes);    ...  } else {    // No effects.    root.current = finishedWork;  }
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zmyWpPGaJBE7LQXEzuLBLqgoPTCbsCaImIuXGwA6qGBFSGMiaqC60pcQ/640?wx_fmt=png)image-20220913173111382

`commitMutationEffectsOnFiber`是一个 368 行的函数，它会根据`Fiber.tag`和`Fiber.flags`走不同的 Mutation 逻辑

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9ze2l2lXsHQXZGqr4gTxb7SGW4sEzgoIQk9mBdAJ3lPzCw3sFJfXqp2Q/640?wx_fmt=png)image-20220913173553696

目前来说，除了`ScopeComponent`外的所有 Component 类型都会执行

```
recursivelyTraverseMutationEffects(root, finishedWork);
commitReconciliationEffects(finishedWork);
```

所以我们首先走入`recursivelyTraverseMutationEffects`，可以看到`recursivelyTraverseMutationEffects`主要分成两部分。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zpoKLNKudPkxxfZFff8bFL0Y4Aq3sPbickdVv95u22drVg9xgc6NR0cA/640?wx_fmt=png)839D576FEA3CCCABF59671E8FCB3ADBA

上边的部分负责从`Fiber.deletions`中取出具体的`deletions`执行`commitDeletionEffects`，后边则是向下遍历节点递归执行`commitMutationEffectsOnFiber`。

```
function recursivelyTraverseMutationEffects(root, parentFiber, lanes) {  // Deletions effects can be scheduled on any fiber type. They need to happen  // before the children effects hae fired.  var deletions = parentFiber.deletions;  if (deletions !== null) {    for (var i = 0; i < deletions.length; i++) {      var childToDelete = deletions[i];      try {        commitDeletionEffects(root, parentFiber, childToDelete);      } catch (error) {        captureCommitPhaseError(childToDelete, parentFiber, error);      }    }  }  var prevDebugFiber = getCurrentFiber();  if (parentFiber.subtreeFlags & MutationMask) {    var child = parentFiber.child;    while (child !== null) {      setCurrentFiber(child);      commitMutationEffectsOnFiber(child, root);      child = child.sibling;    }  }  setCurrentFiber(prevDebugFiber);}
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zlL753K1VJiap7MX3pw6HvyTx66Z5WicIAeCL6yU3072ktE42UVt8xCAw/640?wx_fmt=png)image-20220913231000339

我通览这部分涉及的 flags，发现会执行以下内容：

*   Update->Insertion：执行 React18 推出的新 hook，`useInsertionEffect`，会包含`destory`和`create`两个阶段
    

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zrbC77P4oBCGgQGsF7iatdFHBHE2ypE5espnmqiak87YNdlpRDGyBNgCg/640?wx_fmt=png)

*   Update->Layout：执行`useLayoutEffect`上一次执行残留的`destory`函数
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zJib4QmVReSXQ1krqxrE7GXTujxibSFuibz5RfIgscX96zQvpWybEnLz0w/640?wx_fmt=png)image-20220913232322735
    
*   Placement：
    

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zMDWqIelTGxDWhIzls8TibicU1z3fxvPUfVcK1cgJHRllzQWWhl7YHpmg/640?wx_fmt=png)image-20220913233647464

*   Deletions：删除节点
    
*   Update，more
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zcIb134jWicibXF4EUKlaT3MQj0IhO3ibiaaohpofDVYtZnT3k3UapjialOg/640?wx_fmt=png)image-20220913235058171
    
*   Hydrating ：SSR 相关，由于博主目前为止没有实践过 SSR，所以不说。
    
*   Ref：safelyDetachRef
    
*   ContentReset
    
*   Visibility
    
    ...
    

打住，有点多了！我们只关注`Update`，`Deletions`，`Placement`，并且只关注`HostComponent`

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zOKPia5oO2mCemJ8z0iczt877ibFicM463wE5Xcib9vph6dNicZFxIXbOoojw/640?wx_fmt=gif)223E85C04FF58A4406FA7DB4DC511E8D

#### #1 Update

> 关于 FunctionComponent 的 Update，做的事情其实就在上方前亮点

而对于 HostComponent，react 会执行这些内容：

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zWjBcM2qiaInBLX3U9jKW9icGlaBx9NJUTGtC6xMjBzc4dPcDXtolibXwQ/640?wx_fmt=png)image-20220913235933430

这里最核心的就是`commitUpdate`，React 会通过`updateProperties`将 DOM 属性更新到真实节点上

```
function commitUpdate(domElement, updatePayload, type, oldProps, newProps, internalInstanceHandle) {  // Apply the diff to the DOM node.  updateProperties(domElement, updatePayload, type, oldProps, newProps); // Update the props handle so that we know which props are the ones with  // with current event handlers.  updateFiberProps(domElement, newProps);}
```

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zkuPbOPTuRJ6iaYLG1AgIiajVFVLntWicdOf9KNJ1VtPTib8voQppcFoHmw/640?wx_fmt=png)image-20220914000716411![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zZayYhSph8XnSqEbqs58UHHLy6KFGRhWAGKPctcnKd3QkLFnMiaopDqA/640?wx_fmt=png)image-20220914000658640

（我们其实遇到过类似的函数⬆️）

> react 还会把这个属性也更新上去，在我这篇文章中有这个属性的应用
> 
> ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zWIw9J3V6869u6ydbJWE15HdGeyAXZveVYTgfnm8CtaM6ytj6YicF1icg/640?wx_fmt=png)

#### #2 Placement

我们只说`HostComponent`的逻辑，只有真实节点会走到这里，另外两个 tag`HostRoot`，`HostPortal`，相比 HostComponent 只是缺少了`ContextReset`的内容。

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zUZ3csfk2raS8Fb2xrxGJKVMJiawmtRibuPicl0Z83ViaMibexibiaxIyLJDpA/640?wx_fmt=png)image-20220914001322392

（如果其他类型的 tag 走到 commitPlacement 是会报错的）

那么这里其实主要就是三步：

*   获取 Fiber 节点存在 HostFiber 的父节点，并最终获得真实 DOM
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z0P3Pq3CibwKJP7Afmp0PZzZS1ia8icyibotjCwepWxxssXx2PyvDxJWgGQ/640?wx_fmt=png)image-20220914001717436![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z1PmxTyXyscBJqicgoWxu3u9KVB90HS2KEFwUMHWBoTMJChp8ClPDlibw/640?wx_fmt=png)image-20220914002256829
    
*   获取 Fiber 节点的兄弟真实 DOM 节点
    
*   insertOrAppendPlacementNodeIntoContainer，将节点插入或添加到父容器中
    

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zq3OryNN159SDDQztpTbCKibmWxhG5QIYickoLlpDkyDBLE8wyekcToSw/640?wx_fmt=png) image-20220914002533784![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zIvSIKAGvbEoczBZr9yecB7ZlyFLywwrEjFZNBibjxW2qJOiajmopDYHA/640?wx_fmt=png)image-20220914002638999

走 Placement 完毕，可以很明显看到页面渲染

![](https://mmbiz.qpic.cn/mmbiz_gif/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z1ywwIkVadYickZ8tj377YQFia3cNsKpMJHvoOTEz1ddcLZWH3OShm8qw/640?wx_fmt=gif)2022-09-14 00.32.26

（appendChildToContainer 函数涉及真实 DOM 的插入 / 添加操作）

#### #3 Deletion

deletions 是在 beginWork 的 diff 过程中获得的

*   调用被删除节点的`componentWillUnmount`生命周期钩子，从页面移除`Fiber节点`对应`DOM节点`
    

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9ztXWDfBjxbUAEHLRg8IibLJESwXSPr0OCBemxv7QBa1l5jYZmkEEAepg/640?wx_fmt=png)image-20220914003826446

*   安全解绑 ref
    

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zGHWwmiaTzeQCTjdLkLOkF8pFPR7g5VHuImDrsefb4p2bVAdhGl1t3KA/640?wx_fmt=png)image-20220914003755958

### 4.4.4 Layout

进入 layout 阶段，证明 DOM 节点已经渲染完毕了

```
//将current指向已经完成的workInProgressroot.current = finishedWork;commitLayoutEffects(finishedWork, root, lanes);
```

```
function commitLayoutEffects(finishedWork, root, committedLanes) {  inProgressLanes = committedLanes;  inProgressRoot = root;    var current = finishedWork.alternate;  commitLayoutEffectOnFiber(root, current, finishedWork, committedLanes);    inProgressLanes = null;  inProgressRoot = null;}
```

`commitLayoutEffects->commitLayoutEffectOnFiber`会按照我们熟悉的流程做递归

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zeSkY0iaN47A0zqACmouXtl09J0It308Ccwjt6hKFibibCfIVMib49biahMQ/640?wx_fmt=png)image-20220914135909948![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z9xCibVgTiaibF2dLE5VAHRrBxX50HuqxbRRo1KibK0EA1KfkjW92AicKIqQ/640?wx_fmt=png)image-20220914135920901

（commitLayoutEffectOnFiber 和 recursivelyTraverseLayoutEffects 递归调用）

我们需要关注的是`commitLayoutEffectOnFiber`中的内容

```
function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork, committedLanes) {  // When updating this function, also update reappearLayoutEffects, which does  // most of the same things when an offscreen tree goes from hidden -> visible.  var flags = finishedWork.flags;  switch (finishedWork.tag) {    case FunctionComponent:    case ForwardRef:    case SimpleMemoComponent:      {        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork, committedLanes);        //调度useLayoutEffect的create        if (flags & Update) {          commitHookLayoutEffects(finishedWork, Layout | HasEffect);        }        break;      }    case ClassComponent:      {        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork, committedLanes);        //调度componentDidUpdate、componentDidMount等class组件的生命周期钩子        if (flags & Update) {          commitClassLayoutLifecycles(finishedWork, current);        }        if (flags & Callback) {          commitClassCallbacks(finishedWork);        }        //用真实DOM更新ref        if (flags & Ref) {          safelyAttachRef(finishedWork, finishedWork.return);        }        break;      }    ...    case HostComponent:      {        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork, committedLanes);        // 这里会调度组件的docus、img的src标签        if (current === null && flags & Update) {          commitHostComponentMount(finishedWork);        }        //用真实DOM更新ref        if (flags & Ref) {          safelyAttachRef(finishedWork, finishedWork.return);        }        break;      }    ...  }}
```

此时 React 会做一些收尾的工作，正如我在给文章收尾一样，内容是比较少（水）的。

*   调度`useLayoutEffect`的开始阶段
    
*   调度 componentDidUpdate、componentDidMount 等 class 组件的生命周期钩子
    
*   真实 dom 上的 focus 处理、img 标签的 src 处理
    
*   AttachRef，获取真实 DOM，更新`ref`
    

更多内容其实都非常好理解，我推荐直接动手看。

### 4.4.5 After commit end

当然，在 layout 阶段结束后仍有一些收尾工作。

```
var rootDidHavePassiveEffects = rootDoesHavePassiveEffects; //上边执行useEffect时会标记rootDoesHavePassiveEffects=true //这里会对相关内容进行清除  if (rootDoesHavePassiveEffects) {    rootDoesHavePassiveEffects = false;    rootWithPendingPassiveEffects = root;    pendingPassiveEffectsLanes = lanes;  } else {    releaseRootPooledCache(root, remainingLanes);  }  ...  //和react-refresh-runtime相关的模块  onCommitRoot(finishedWork.stateNode, renderPriorityLevel);  ... // 确保root有一个新的调度，我想找机会试试把这句话注释  ensureRootIsScheduled(root, now()); // 一些错误处理  if (recoverableErrors !== null) {    var onRecoverableError = root.onRecoverableError;    for (var i = 0; i < recoverableErrors.length; i++) {      var recoverableError = recoverableErrors[i];      var componentStack = recoverableError.stack;      var digest = recoverableError.digest;      onRecoverableError(recoverableError.value, {        componentStack: componentStack,        digest: digest      });    }  }  if (hasUncaughtError) {    hasUncaughtError = false;    var error$1 = firstUncaughtError;    firstUncaughtError = null;    throw error$1;  } // React注释：请再次阅读，因为被动效果可能会更新它  if (includesSomeLane(pendingPassiveEffectsLanes, SyncLane) && root.tag !== LegacyRoot) {    flushPassiveEffects();  }  // 无限重渲染的计数  remainingLanes = root.pendingLanes;  if (includesSomeLane(remainingLanes, SyncLane)) {    if (root === rootWithNestedUpdates) {      nestedUpdateCount++;    } else {      nestedUpdateCount = 0;      rootWithNestedUpdates = root;    }  } else {    nestedUpdateCount = 0;  } // If layout work was scheduled, flush it now. // 执行一些同步任务，这样无需等待在下一次循环的时候进行，这里可以参考ensureRootIsScheduled  flushSyncCallbacks();  return null;
```

那么至此，commit 阶段算已经完成了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9z49rXicicQFt6EqTykKhx1AmqSf5pLNfib7ejia7aVlmsqnfjJibWsCDd5YA/640?wx_fmt=jpeg)AF0F30822F8D36A8C83A07F6E8777722

但是 React 的渲染却不能算完成，正如我一开始读源码的初衷是为了知道，我在 useEffect 里调用了更新，这个执行时机和触发渲染原理是什么情况。

到了这里我会明白，由于我们上述的各种 effect、生命周期狗子，此时完全可能再次触发更新。

而 react 也会很自然地走进一个新的 render+commit 的过程，先将触发更新的内容更新后再继续原本未更新的。

![](https://mmbiz.qpic.cn/mmbiz_jpg/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zKwoibcibNRmHtE9CJUVcGGMPicicx8kjPdXhsypnIIOP8gmiaSYWBTDc2bA/640?wx_fmt=jpeg)E1D350692AF8C9B7A98A83277B0D87C3

对于 React 来讲，会在 flushWork 执行完毕后才真正进入空闲。但是这就是后话了

![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zSW8hYJrFdQicibiaPpicvlqlicPep8V8SrHkEhVtGST5nmnxLZ08r7v544w/640?wx_fmt=png)image-20220914021943510

（flushWork 函数）

5 总结
====

不管在面试还是在生活中，都曾有人问我为什么要看 React 源码。

我刚开始是因为对于 hook 的架构感兴趣而去看的，而现在随着阅读逐渐深入，我发现阅读 react 源码一方面给了我比较强的成就感，这也是我可以坚持下来的原因。另一方面，我们真的会在阅读中体会到某些思想上的高明。

> 比如，二进制 flags、useEffect 形成的环形更新链条

阅完本文，期待你对 React18 的 Fiber 架构有了更新的认识，也理解了 React 状态更新的全流程，更期望你可以将学到的东西真实应用在自己的生活、工作中，我认为这才是读源码最重要的。

那么这里留几个关于 React 的问题，默想 3 分钟，把收获沉淀在脑海中。

*   总结一下 beginWork 和 completeWork 的工作内容
    
*   useLayoutEffect 在什么时机执行
    
*   react 是在什么时候、怎么存储、怎么应用操作依据的？
    

6 尾声
====

Hi～你好，再次认识一下，我是心锁，致力于前端开发的软件开发工程师。

这是我第一篇单字符数破 5w，字数破 1w 的文章，耗时一个月零四天。

所以**非常期待你的点赞、收藏、分析～**

后续呢，我会进行必要的切割，分多文方便阅读，同时补充更多细节，所以**非常期待你的关注**。

> *   https://github.com/GrinZero 这是我的 github，我会在上边更新脑子里突然蹦出来的主意，欢迎你的 follow，后续也会把 react 解读更新上去。
>     
> 
> ![](https://mmbiz.qpic.cn/mmbiz_png/NotWfT9YQWOQcxS4TpibxtgmON3l5ZH9zL15zMZKQNYh0IsGBibGcbIXOB7PItnN6pxA2dzGVCrZ5NFhEcdAGcKQ/640?wx_fmt=png)
> 
> (部分项目成果集合图)
> 
> *   https://juejin.cn/user/1645288319627576/posts 这是我的掘金个人主页，期待你的关注。
>