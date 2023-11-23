> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mQyl3baPRvEI_34kT1Us_g)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9vk3JG3fibzhicpNibAJQiaajNJpSRMtGqkfnypJagDhudYicByfNTUbA95ZiahD5cqxxLOqWjg8iaPs0Cg/640?wx_fmt=png)

在开始今天的文章之前，大家不妨先想一下触发 `React` 组件 `re-render` 的原因有哪些，或者说什么时候 `React` 组件会发生 `re-render` 。

先说结论：

*   状态变化
    
*   父组件 `re-render`
    
*   `Context` 变化
    
*   `Hooks` 变化
    

> ❝
> 
> 这里有个误解：`props` 变化也会导致 `re-render`。  
> 其实不会的，`props` 的变化往上追溯是因为父组件的 `state` 变化导致父组件 `re-render`，从而引起了子组件的 `re-render`，与 `props` 是否变化无关的。只有那些使用了 `React.memo` 和 `useMemo` 的组件，`props` 的变化才会触发组件的 `re-render`。
> 
> ❞

针对上述造成 `re-render` 的原因，又该通过怎样的策略优化呢？感兴趣的朋友可以看这篇文章：React re-renders guide: everything, all at once。

接下来开始我们今天的主题：如何优雅的使用 `React Context`。上面我们提到了 `Context` 的变化也会触发组件的 `re-render`，那 `React Context` 又是怎么工作呢？先简单介绍一下 `Context` 的工作原理。

Context 的工作原理
-------------

> ❝
> 
> `Context` 是 `React` 提供的一种直接访问祖先节点上的状态的方法，从而避免了多级组件层层传递 `props` 的频繁操作。
> 
> ❞

### 创建 Context

通过 `React.createContext` 创建 `Context` 对象

```
export function createContext(  defaultValue) {  const context = {    $$typeof: REACT_CONTEXT_TYPE,    _currentValue: defaultValue,     _currentValue2: defaultValue,     _threadCount: 0,    Provider: (null: any),    Consumer: (null: any),  };  context.Provider = {    $$typeof: REACT_PROVIDER_TYPE,    _context: context,  };  context.Consumer = context;  return context;}
```

`React.createContext` 的核心逻辑：

1.  将初始值存储在 `context._currentValue`
    
2.  创建 `Context.Provider` 和 `Context.Consumer` 对应的 `ReactElement` 对象
    

在 `fiber` 树渲染时，通过不同的 `workInProgress.tag` 处理 `Context.Provider` 和 `Context.Consumer` 类型的节点。

主要看下针对 `Context.Provider` 的处理逻辑：

```
function updateContextProvider(  current: Fiber | null,  workInProgress: Fiber,  renderLanes: Lanes,) {  const providerType = workInProgress.type;  const context = providerType._context;    const newProps = workInProgress.pendingProps;  const oldProps = workInProgress.memoizedProps;    const newValue = newProps.value;  pushProvider(workInProgress, context, newValue);  if (oldProps !== null) {    // 更新 context 的核心逻辑  }  const newChildren = newProps.children;  reconcileChildren(current, workInProgress, newChildren, renderLanes);  return workInProgress.child;}
```

### 消费 Context

在 `React` 中提供了 3 种消费 `Context` 的方式

1.  直接使用 `Context.Consumer` 组件（也就是上面 `createContext` 时创建的 `Consumer`）
    
2.  类组件中，可以通过静态属性 `contextType` 消费 `Context`
    
3.  函数组件中，可以通过 `useContext` 消费 `Context`
    

这三种方式内部都会调用 `prepareToReadContext` 和 `readContext` 处理 `Context`。`prepareToReadContext` 中主要是重置全局变量为`readContext` 做准备。

接下来主要看下`readContext` ：

```
export function readContext<T>(  context: ReactContext<T>,  observedBits: void | number | boolean,): T {  const contextItem = {    context: ((context: any): ReactContext<mixed>),    observedBits: resolvedObservedBits,    next: null,  };  if (lastContextDependency === null) {    lastContextDependency = contextItem;    currentlyRenderingFiber.dependencies = {      lanes: NoLanes,      firstContext: contextItem,      responders: null,    };  } else {    lastContextDependency = lastContextDependency.next = contextItem;  }  // 2. 返回 currentValue  return isPrimaryRenderer ? context._currentValue : context._currentValue2;}
```

`readContext`的核心逻辑：

1.  构建 `contextItem` 并添加到 `workInProgress.dependencies` 链表（`contextItem` 中保存了对当前 `context` 的引用，这样在后续更新时，就可以判断当前 `fiber` 是否依赖了 `context` ，从而判断是否需要 `re-render`）
    
2.  返回对应 `context` 的 `_currentValue` 值
    

### 更新 Context

当触发 `Context.Provider` 的 `re-render` 时，重新走 `updateContextProvider` 中更新的逻辑：

```
function updateContextProvider(  current: Fiber | null,  workInProgress: Fiber,  renderLanes: Lanes,) {  // ...  // 更新逻辑  if (oldProps !== null) {      const oldValue = oldProps.value;      if (is(oldValue, newValue)) {        // 1. value 未发生变化时，直接走 bailout 逻辑        if (          oldProps.children === newProps.children &&          !hasLegacyContextChanged()        ) {          return bailoutOnAlreadyFinishedWork(            current,            workInProgress,            renderLanes,          );        }      } else {        // 2. value 变更时，走更新逻辑        propagateContextChange(workInProgress, context, renderLanes);      }  //...}
```

接下来看下 `propagateContextChange` (核心逻辑在 `propagateContextChange_eager` 中) 的逻辑：

```
function propagateContextChange_eager < T > (    workInProgress: Fiber,    context: ReactContext < T > ,    renderLanes: Lanes,): void {    let fiber = workInProgress.child;    if (fiber !== null) {        fiber.return = workInProgress;    }    // 从子节点开始匹配是否存在消费了当前 Context 的节点    while (fiber !== null) {        let nextFiber;        const list = fiber.dependencies;        if (list !== null) {            nextFiber = fiber.child;            let dependency = list.firstContext;            while (dependency !== null) {                // 1. 判断 fiber 节点的 context 和当前 context 是否匹配                if (dependency.context === context) {                    // 2. 匹配时，给当前节点调度一个更新任务                    if (fiber.tag === ClassComponent) {}                    fiber.lanes = mergeLanes(fiber.lanes, renderLanes);                    const alternate = fiber.alternate;                    if (alternate !== null) {                        alternate.lanes = mergeLanes(alternate.lanes, renderLanes);                    }                    // 3. 向上标记 childLanes                    scheduleContextWorkOnParentPath(                        fiber.return,                        renderLanes,                        workInProgress,                    );                    list.lanes = mergeLanes(list.lanes, renderLanes);                    break;                }                dependency = dependency.next;            }        } else if (fiber.tag === ContextProvider) {} else if (fiber.tag === DehydratedFragment) {} else {}        // ...        fiber = nextFiber;    }}
```

核心逻辑：

1.  从 `ContextProvider` 的节点出发，向下查找所有 `fiber.dependencies` 依赖当前 `Context` 的节点
    
2.  找到消费节点时，从当前节点出发，向上回溯标记父节点 `fiber.childLanes`，标识其子节点需要更新，从而保证了所有消费了该 `Context` 的子节点都会被重新渲染，实现了 `Context` 的更新
    

总结
--

1.  在消费阶段，消费者通过 `readContext` 获取最新状态，并通过 `fiber.dependencies` 关联当前 `Context`
    
2.  在更新阶段，从 `ContextProvider` 节点出发查找所有消费了该 `context` 的节点
    

如何避免 Context 引起的 re-render
--------------------------

> ❝
> 
> 从上面分析 `Context` 的整个工作流程，我们可以知道当 `ContextProvider` 接收到 `value` 变化时就会找到所有消费了该 `Context` 的组件进行 `re-render`，若 `ContextProvider` 的 `value` 是一个对象时，即使没有使用到发生变化的 `value` 的组件也会造成多次不必要的 `re-render`。
> 
> ❞

那我们怎么做优化呢？直接说方案：

1.  将 `ContextProvider` 的值做 `memoize` 处理
    
2.  对数据和 `API` 做拆分（或者说是将 `getter`（`state`）和 `setter`（`API`）做拆分）
    
3.  对数据做拆分（细粒度拆分）
    
4.  `Context Selector`
    

具体的 `case` 可参考上述提到的优化文章：React re-renders guide: everything, all at once。

接下来开始我们今天的重点：`Context Selector`。开始之前先来个 case1：

```
import React, { useState } from "react";const StateContext = React.createContext(null);const StateProvider = ({ children }) => { console.log("StateProvider render");  const [count1, setCount1] = useState(1); const [count2, setCount2] = useState(1); return (  <StateContext.Provider    value={{ count1, setCount1, count2, setCount2 }}>   {children}  </StateContext.Provider> );};const Counter1 = () => { console.log("count1 render");  const { count1, setCount1 } = React.useContext(StateContext); return (  <>   <div>Count1: {count1}</div>   <button     onClick={() => setCount1((n) => n + 1)}>setCount1</button> </>);};const Counter2 = () => { console.log("count2 render");  const { count2, setCount2 } = React.useContext(StateContext);  return (  <>   <div>Count2: {count2}</div>   <button onClick={() => setCount2((n) => n + 1)}>setCount2</button>  </> );};const App = () => { return (  <StateProvider>   <Counter1 />   <Counter2 />  </StateProvider> );};export default App;
```

> ❝
> 
> 开发环境记得关闭 StrictMode 模式，否则每次 `re-render` 都会走两遍。具体使用方式和 StrictMode 的意义可参考官方文档。
> 
> ❞

通过上面的 `case`，我们会发现在 `count1` 触发更新时，即使 `Counter2` 没有使用 `count1` 也会进行 `re-render`。这是因为 `count1` 的更新会引起 `StateProvider` 的 `re-render`，从而会导致 `StateProvider` 的 `value` 生成全新的对象，触发 `ContextProvider` 的 `re-render`，找到当前 `Context` 的所有消费者进行 `re-render`。

如何做到只有使用到 `Context` 的 `value` 改变才触发组件的 `re-render` 呢？社区有一个对应的解决方案 dai-shi/use-context-selector: React useContextSelector hook in userland。

接下来我们改造一下上述的 case2：

```
import React, { useState } from 'react';import { createContext, useContextSelector } from 'use-context-selector';const context = createContext(null);const Counter1 = () => {  const count1 = useContextSelector(context, v => v[0].count1);  const setState = useContextSelector(context, v => v[1]);  const increment = () => setState(s => ({    ...s,    count1: s.count1 + 1,  }));  return (    <div>      <span>Count1: {count1}</span>      <button type="button" onClick={increment}>+1</button>      {Math.random()}    </div>  );};const Counter2 = () => {  const count2 = useContextSelector(context, v => v[0].count2);  const setState = useContextSelector(context, v => v[1]);  const increment = () => setState(s => ({    ...s,    count2: s.count2 + 1,  }));  return (    <div>      <span>Count2: {count2}</span>      <button type="button" onClick={increment}>+1</button>      {Math.random()}    </div>  );};const StateProvider = ({ children }) => (  <context.Provider value={useState({ count1: 0, count2: 0 })}>    {children}  </context.Provider>);const App = () => (  <StateProvider>    <Counter1 />    <Counter2 />  </StateProvider>);export default App
```

> ❝
> 
> 这时候问题来了，不是说好精准渲染的吗？怎么还是都会进行 `re-render`。  
> 解决方案：将 `react` 改为 `v17` 版本（v17 对应的 case3），后面我们再说具体原因（只想说好坑..）。
> 
> ❞

use-context-selector
--------------------

接下来我们主要分析下 `createContext` 和 `useContextSelector` 都做了什么（官方还有其他的 API ，感兴趣的朋友可以自行查看，核心还是这两个 `API`）。

### createContext

简化一下，只看核心逻辑：

```
import { createElement, useLayoutEffect, useRef, createContext as createContextOrig } from 'react'const CONTEXT_VALUE = Symbol();const ORIGINAL_PROVIDER = Symbol();const createProvider = (  ProviderOrig) => {  const ContextProvider = ({ value, children }) => {    const valueRef = useRef(value);    const contextValue = useRef();        if (!contextValue.current) {      const listeners = new Set();      contextValue.current = {        [CONTEXT_VALUE]: {          /* "v"alue     */ v: valueRef,          /* "l"isteners */ l: listeners,        },      };    }    useLayoutEffect(() => {      valueRef.current = value;  contextValue.current[CONTEXT_VALUE].l.forEach((listener) => {          listener({ v: value });        });    }, [value]);        return createElement(ProviderOrig, { value: contextValue.current }, children);  };  return ContextProvider;};export function createContext(defaultValue) {  const context = createContextOrig({    [CONTEXT_VALUE]: {      /* "v"alue     */ v: { current: defaultValue },      /* "l"isteners */ l: new Set(),    },  });  context[ORIGINAL_PROVIDER] = context.Provider;  context.Provider = createProvider(context.Provider);  delete context.Consumer; // no support for Consumer  return context;}
```

对原始的 `createContext` 包一层，同时为了避免 `value` 的意外更新造成消费者的不必要 `re-render` ，将传递给原始的 `createContext` 的 `value` 通过 `uesRef` 进行存储，这样在 `React` 内部对比新旧 `value` 值时就不会再操作 `re-render`（后续 `value` 改变后派发更新时就需要通过 `listener` 进行 `re-render` 了），最后返回包裹后的 `createContext` 给用户使用。

### useContextSelector

接下来看下简化后的 `useContextSelector` ：

```
export function useContextSelector(context, selector) { const contextValue = useContextOrig(context)[CONTEXT_VALUE]; const { /* "v"alue */ v: { current: value }, /* "l"isteners */ l: listeners } = contextValue;  const selected = selector(value); const [state, dispatch] = useReducer(  (prev, action) => {   if ("v" in action) {    if (Object.is(prev[0], action.v)) {     return prev; // do not update    }    const nextSelected = selector(action.v);    if (Object.is(prev[1], nextSelected)) {     return prev; // do not update    }    return [action.v, nextSelected];   }  },  [value, selected] );  useLayoutEffect(() => {  listeners.add(dispatch);  return () => {   listeners.delete(dispatch);  };  }, [listeners]);  return state[1];}
```

核心逻辑：

1.  每次渲染时，通过 `selector` 和 `value` 获取最新的 `selected`
    
2.  同时将 `useReducer` 对应的 `dispatch` 添加到 `listeners`
    
3.  当 `value` 改变时，就会执行 `listeners` 中收集到 `dispatch` 函数，从而在触发 `reducer` 内部逻辑，通过对比 `value` 和 `selected` 是否有变化，来决定是否触发当前组件的 `re-render`
    

### 在 react v18 下的 bug

回到上面的 `case` 在 `react v18` 的表现和在原始 `Context` 的表现几乎一样，每次都会触发所有消费者的 `re-render`。再看 `use-context-selector` 内部是通过 `useReducer` 返回的 `dispatch` 函数派发组件更新的。

接下来再看下 `useReducer` 在 `react v18` 和 `v17` 版本到底有什么不一样呢？  
看个简单的 `case`：

```
import React, { useReducer } from "react";const initialState = 0;const reducer = (state, action) => { switch (action) {  case "increment":   return state;  default:   return state; }};export const App = () => { console.log("UseReducer Render"); const [count, dispatch] = useReducer(reducer, initialState);  return (  <div>   <div>Count = {count}</div>   <button onClick={() => dispatch("increment")}>Inacrement</button>  </div> );};
```

简单描述下：多次点击按钮`「Inacrement」`，在 `react` 的 `v17` 和 `v18` 版本分别会有什么表现？

先说结论：

*   `v17`：只有首次渲染会触发 `App` 组件的 `render`，后续点击将不再触发 `re-render`
    
*   `v18`：每次都会触发 `App` 组件的 `re-render`（即使状态没有实质性的变化也会触发 `re-render`）
    

> ❝
> 
> 这就要说到【`eager state` 策略】了，在 `React` 内部针对多次触发更新，而最后状态并不会发生实质性变化的情况，组件是没有必要渲染的，提前就可以中断更新了。
> 
> ❞

也就是说 `useReducer` 内部是有做一定的性能优化的，而这优化会存在一些 `bug`，最后 `React` 团队也在 `v18` 后移除了该优化策略（注：`useState` 还是保留该优化），详细可看该相关 PR Remove usereducer eager bailout。当然该 PR 在社区也存在一些讨论（Bug: useReducer and same state in React 18），毕竟无实质性的状态变更也会触发 `re-render`，对性能还是有一定影响的。

回归到 `useContextSelector` ，无优化版本的 `useReducer` 又是如何每次都触发组件 `re-render` 呢？

具体原因：在上面 `useReducer` 中，是通过 `Object.is` 判断 `value` 是否发生了实质性变化，若没有，就返回旧的状态，在 `v17` 有优化策略下，就不会再去调度更新任务了，而在 `v18` 没有优化策略的情况下，每次都会调度新的更新任务，从而引发组件的 `re-render`。

### 通过 useSyncExternalStore 优化

通过分析知道造成 `re-render` 的原因是使用了 `useReducer`，那就不再依赖该 `hook`，使用 `react v18` 新的 hook useSyncExternalStore 来实现 `useContextSelector`（优化后的 case4）。

```
export function useContextSelector(context, selector) { const contextValue = useContextOrig(context)[CONTEXT_VALUE]; const { /* "v"alue */ v: { current: value }, /* "l"isteners */ l: listeners } = contextValue;  const lastSnapshot = useRef(selector(value)); const subscribe = useCallback(  (callback) => {   listeners.add(callback);   return () => {    listeners.delete(callback);   };  },  [listeners] );  const getSnapshot = () => {  const {  /* "v"alue */ v: { current: value }  } = contextValue;    const nextSnapshot = selector(value);  lastSnapshot.current = nextSnapshot;  return nextSnapshot; };  return useSyncExternalStore(subscribe, getSnapshot);}
```

实现思路：

1.  收集订阅函数 `subscribe` 的 `callback`（即 `useSyncExternalStore` 内部的 `handleStoreChange` ）
    
2.  当 `value` 发生变化时，触发 `listeners` 收集到的 `callback` ，也就是执行 handleStoreChange 函数，通过 `getSnapshot` 获取新旧值，并通过 `Object.is` 进行对比，判断当前组件是否需要更新，从而实现了 `useContextSelector` 的精确更新
    

当然除了 `useReducer` 对应的性能问题，`use-context-selector` 还存在其他的性能，感兴趣的朋友可以查看这篇文章从 0 实现 use-context-selector。同时，`use-context-selector` 也是存在一些限制，比如说不支持 `Class` 组件、不支持 `Consumer` …

> ❝
> 
> 针对上述文章中，作者提到的问题二和问题三，个人认为这并不是 `use-context-selector` 的问题，而是 `React` 底层自身带来的问题。  
> 比如说：问题二，`React` 组件是否 `re-render` 跟是否使用了状态是没有关系的，而是和是否触发了更新状态的 `dispatch` 有关，如果一定要和状态绑定一起，那不就是 `Vue` 了吗。  
> 对于问题三，同样是 `React` 底层的优化策略处理并没有做到极致这样。
> 
> ❞

总结
--

回到 `React Context` 工作原理来看，只要有消费者订阅了该 `Context`，在该 `Context` 发生变化时就会触达所有的消费者。也就是说整个工作流程都是以 `Context` 为中心的，那只要把 `Context` 拆分的粒度足够小就不会带来额外的渲染负担。但是这样又会带来其他问题：`ContextProvider` 会嵌套多层，同时对于粒度的把握对开发者来说又会带来一定的心智负担。

从另一条路出发：`Selector` 机制，通过选择需要的状态从而规避掉无关的状态改变时带来的渲染开销。除了社区提到的 use-context-selector ，`React` 团队也有一个相应的 `RFC` 方案 RFC: Context selectors，不过这个 `RFC` 从 19 年开始目前还处于持续更新阶段。

最后，对于 `React Context` 的使用，个人推荐：**「不频繁更改的全局状态（比如说：自定义主题、账户信息、权限信息等）可以合理使用 `Context`，而对于其他频繁修改的全局状态可以通过其他数据流方式维护，可以更好的避免不必要的 `re-render` 开销」**。

参考
--

1.  https://www.developerway.com/posts/react-re-renders-guide
    
2.  https://react.dev/reference/react/StrictMode#enabling-strict-mode-for-entire-app
    
3.  https://github.com/dai-shi/use-context-selector
    
4.  https://github.com/facebook/react/pull/22445
    
5.  https://github.com/facebook/react/issues/24596
    
6.  https://react.dev/reference/react/useSyncExternalStore
    
7.  https://juejin.cn/post/7197972831795380279
    
8.  https://github.com/reactjs/rfcs/pull/119
    
9.  case1：https://codesandbox.io/s/serverless-frost-9ryw2x?file=/src/App.js
    
10.  case2：https://codesandbox.io/s/use-context-selector-vvs93q?file=/src/App.js
    
11.  case3：https://codesandbox.io/s/elegant-montalcini-nkrvlh?file=/src/App.js
    
12.  case4：https://codesandbox.io/s/use-context-selector-smsft3?file=/src/App.js
    

想了解更多转转公司的业务实践，点击关注下方的公众号吧！