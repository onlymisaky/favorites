> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9ZNSqRPlEi1vnxc-YQlpUg)

昨天发了一篇文章，[分享了 Recoil 停止更新的情况](https://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247531772&idx=1&sn=7467b566571dab1c414938f5ff0fafe4&scene=21#wechat_redirect)，并推荐了当前热门的 React 状态管理工具 Zustand。文章发布后，评论区不少同学表示 Jotai 在使用体验上更胜一筹。鉴于此，今天就来看看主流 React 状态管理库的使用方式，看看哪个更合你意！

总览
--

不得不承认，React 生态系统实在是太丰富了，仅状态管理这一领域就提供了诸多选项，且持续有新工具涌现。当前，React 状态管理的主流库包括 Redux、Zustand、MobX、Recoil、Jotai 等。其中，Redux 以遥遥领先的下载量独占鳌头，不过其增长速度有所放缓；而 Zustand 则紧随其后，尤其在近两年展现出迅猛的增长势头，成为不可忽视的力量。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EO58xpw5UMPibpWOVI5wzzpZV30v6ibRcbzehyHpaVbibyn6ILzBVTrI9BNgdplBOKia50upwoibyWvYX4HzibXibCFtA/640?wx_fmt=png&from=appmsg)

Redux
-----

### 特点

Redux 是一个老牌的全局状态管理库，它的核心思想如下：

*   **单一数据源**：整个应用的状态被存储在一个单一的对象树中，即 `store`。这使得状态的管理和调试变得更加简单和直观。
    
*   **状态是只读的**：在 Redux 里，不能直接去修改 `store` 中的状态。所有的状态变更都必须通过触发特定的动作（`action`）来发起请求。这种方式确保了状态的变化是可追踪的，避免了直接修改状态带来的问题。
    
*   **使用纯函数来执行修改**：Reducer 是一个纯函数，它接受当前状态和一个 `action` 作为参数，并返回新的状态。Reducer 不会修改传入的状态，而是返回一个新的状态对象。这种设计使得状态更新逻辑是可预测的，并且易于测试和维护。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/EO58xpw5UMPibpWOVI5wzzpZV30v6ibRcbJYc1LZqiaUgVsh8Jol3VX4gYWsricnUvkNOIuOsjFyHczyZ4O5G1icWtQ/640?wx_fmt=png&from=appmsg)

### 基本使用

1.  **创建 Action（动作）**
    

*   **定义：** Action 是一个普通的 JavaScript 对象，用于描述应用中发生了什么事情，也就是表明想要对状态进行何种改变。它就像是一个指令，告知 Redux 系统接下来需要执行的操作任务。
    
*   **结构：** 每个 Action 通常都包含一个必须的`type`属性，其值为一个字符串，用于唯一标识这个动作的类型，让 Reducer 能够根据这个类型来判断该如何处理该动作。除此之外，还可以根据具体需求在 Action 对象中携带其他的数据（通常放在`payload`属性中），这些数据就是执行对应操作所需要的具体信息。
    

```
// actions.jsexport const INCREMENT = 'INCREMENT';export const DECREMENT = 'DECREMENT';export const increment = () => ({ type: INCREMENT });export const decrement = () => ({ type: DECREMENT });
```

2.  **创建 Reducer：** Reducer 是一个纯函数，它接收两个参数：当前的整个状态树（作为第一个参数）以及一个 Action（作为第二个参数），然后根据 Action 的类型（通过`type`属性来判断）来决定如何更新状态，并返回一个新的状态。
    

```
// actions.jsexport const INCREMENT = 'INCREMENT';export const DECREMENT = 'DECREMENT';export const increment = () => ({ type: INCREMENT });export const decrement = () => ({ type: DECREMENT });
```

3.  **创建 Store（状态容器）**：Store 是整个 Redux 架构的核心，它把状态（State）、Reducer 函数以及一些用于订阅状态变化的方法等都整合在一起，是整个应用状态的存储中心和管理枢纽。创建 Store 时需要传入一个根 Reducer：
    

```
// reducer.jsimport { INCREMENT, DECREMENT } from './actions';const initialState = {  count: 0};function counterReducer(state = initialState, action) {  switch (action.type) {    case INCREMENT:      return { ...state, count: state.count + 1 };    case DECREMENT:      return { ...state, count: state.count - 1 };    default:      return state;  }}export default counterReducer;
```

4.  **在 React 组件中使用 Redux**：使用 `Provider` 组件将 store 提供给整个 React 应用，并使用 `useSelector` 和 `useDispatch` 钩子来访问和更新状态：
    

```
// reducer.jsimport { INCREMENT, DECREMENT } from './actions';const initialState = {  count: 0};function counterReducer(state = initialState, action) {  switch (action.type) {    case INCREMENT:      return { ...state, count: state.count + 1 };    case DECREMENT:      return { ...state, count: state.count - 1 };    default:      return state;  }}export default counterReducer;
```

### 缺点

*   **过于复杂：** 对于小型项目或者简单应用来说，Redux 可能显得过于复杂。它的概念（如 action、reducer、store）和工作流程需要一定的时间去理解和掌握。
    
*   **代码冗余**：Redux 需要编写大量的模板代码，包括定义 actions、reducers 和配置 store，这可能会增加开发的初始成本。
    
*   **异步处理复杂：** Redux 默认只支持同步处理，处理异步操作需要使用中间件，如 `redux-thunk` 或 `redux-saga`。这些中间件虽然强大，但增加了代码的复杂性和学习成本。
    

Zustand
-------

### 特点

Zustand 是一个轻量级状态管理库，专为 React 应用设计。它提供了简单直观的 API，旨在减少样板代码，并且易于集成和使用。其特点如下：

*   **简洁性**：Zustand 的设计理念是保持极简主义，通过简单的 API 和最小化的配置来实现高效的状态管理。
    
*   **基于 Hooks**：它完全依赖于 React 的 Hooks 机制，允许开发者以声明式的方式订阅状态变化并触发更新。
    
*   **无特定立场**：Zustand 不强制任何特定的设计模式或结构，给予开发者最大的灵活性。
    
*   **单一数据源**：尽管 Zustand 支持多个独立的 store，但每个 store 内部仍然遵循单一数据源的原则，即所有状态都集中存储在一个地方。
    
*   **模块化状态切片**：状态可以被分割成不同的切片（slices），每个切片负责一部分应用逻辑，便于管理和维护。
    
*   **异步支持**：Zustand 可以轻松处理异步操作，允许在 store 中定义异步函数来执行如 API 请求等任务。
    

### 基本使用

1.  **创建 Store**：在 Zustand 中，Store 是通过`create`函数创建的。每个 Store 都包含状态和处理状态的函数。
    

```
// store.jsimport { createStore } from 'redux';import counterReducer from './reducer';const store = createStore(counterReducer);export default store;
```

`create`函数接受一个回调函数，该回调函数接受一个`set`函数作为参数，用于更新状态。在这个回调函数中，定义了一个`count`状态和两个更新函数`increment`和`decrement`。

2.  **使用 Store**：在组件中，可以使用自定义的 Hooks（上面的`useStore`）来获取状态和更新函数，并在组件中使用它们。
    

```
// store.jsimport { createStore } from 'redux';import counterReducer from './reducer';const store = createStore(counterReducer);export default store;
```

3.  订阅特定状态片段如果有一个包含多个状态的 store，但在组件中只需要订阅其中一个状态，可以通过解构赋值从`useStore`返回的完整状态对象中提取需要的状态。Zustand 的智能选择器功能允许这样做，而不会导致不必要的重新渲染。
    

```
// App.jsimport React from 'react';import { Provider, useSelector, useDispatch } from 'react-redux';import store from './store';import { increment, decrement } from './actions';function Counter() {  const count = useSelector((state) => state.count);  const dispatch = useDispatch();  return (    <div>      <p>Count: {count}</p>      <button onClick={() => dispatch(increment())}>Increment</button>      <button onClick={() => dispatch(decrement())}>Decrement</button>    </div>  );}function App() {  return (    <Provider store={store}>      <Counter />    </Provider>  );}export default App;
```

在组件中，如果只想订阅`count`状态，可以这样做：

```
// App.jsimport React from 'react';import { Provider, useSelector, useDispatch } from 'react-redux';import store from './store';import { increment, decrement } from './actions';function Counter() {  const count = useSelector((state) => state.count);  const dispatch = useDispatch();  return (    <div>      <p>Count: {count}</p>      <button onClick={() => dispatch(increment())}>Increment</button>      <button onClick={() => dispatch(decrement())}>Decrement</button>    </div>  );}function App() {  return (    <Provider store={store}>      <Counter />    </Provider>  );}export default App;
```

Mobx
----

### 特点

MobX 是一个简单、可扩展的状态管理库。它通过**透明的函数响应式编程**使得状态管理变得简单和高效。其核心思想如下：

*   **可观察对象**：MobX 通过 `observable` 装饰器将数据标记为可观察的，当这些数据发生变化时，依赖于这些数据的组件会自动更新。
    
*   **计算属性**：计算属性是基于可观察状态的派生值，它们会自动更新以反映基础状态的变化。
    
*   **响应式函数**：用于修改可观察状态的函数，MobX 会自动追踪这些函数中的状态读写操作，并通知相关的观察者进行更新。
    
*   **自动依赖追踪**：MobX 会自动追踪代码中对可观察状态的访问，建立起一个依赖关系图，当可观察状态发生变化时，会通知所有依赖于该状态的观察者进行更新
    

### 基本使用

1.  **创建 Store：** Store 是存储应用状态的地方，并提供修改这些状态的方法。MobX 提供了多种方式来定义可观察的状态和操作这些状态的动作。
    

*   使用 `makeAutoObservabl`：这是最推荐的方式，因为它避免了使用装饰器（Babel 插件等），简化了代码。
    

```
import { create } from 'zustand';const useStore = create((set) => ({  count: 0, // 初始状态  increment: () => set((state) => ({ count: state.count + 1 })), // 增加count的函数  decrement: () => set((state) => ({ count: state.count - 1 })), // 减少count的函数}));
```

2.  **在函数组件中使用 Store**：对于函数组件，可以使用 `useObserver` Hook 来确保组件能够响应可观察对象的变化。如果你需要在组件内部创建局部的可观察状态，则可以使用 `useLocalStore`。
    

*   **使用全局 Store** (`counterStore`)
    

```
import { create } from 'zustand';const useStore = create((set) => ({  count: 0, // 初始状态  increment: () => set((state) => ({ count: state.count + 1 })), // 增加count的函数  decrement: () => set((state) => ({ count: state.count - 1 })), // 减少count的函数}));
```

*   **使用局部 Store** (`useLocalStore`)：如果需要创建局部可观察状态，可以这样做：
    

```
import React from 'react';import { useStore } from './store';function Counter() {  const { count, increment, decrement } = useStore();    return (    <div>      <p>Count: {count}</p>      <button onClick={increment}>Increment</button>      <button onClick={decrement}>Decrement</button>    </div>  );}
```

> 注意：通常情况下，应该尽量使用全局 `store`，除非有明确的理由需要局部状态。

3.  **在类组件中使用 Store**：对于类组件，可以使用 `observer` 高阶组件（HOC）来将组件与 MobX 的状态管理连接起来。`observer` 会自动检测组件中使用的可观察对象，并且当这些对象发生变化时，会重新渲染组件。
    

```
import React from 'react';import { useStore } from './store';function Counter() {  const { count, increment, decrement } = useStore();    return (    <div>      <p>Count: {count}</p>      <button onClick={increment}>Increment</button>      <button onClick={decrement}>Decrement</button>    </div>  );}
```

4.  **使用计算属性和反应：** 除了直接操作状态外，MobX 还提供了 `computed` 和 `reaction` 等功能，用于基于现有状态派生新值或监听状态变化并执行副作用。
    

*   **计算属性** (`computed`)
    

```
// store.jsimport { create } from 'zustand'; const useStore = create((set) => ({  count: 0,  name: 'Zustand Store',  increment: () => set((state) => ({ count: state.count + 1 })),  setName: (newName) => set({ name: newName }),})); export default useStore;
```

*   **反应** (`reaction`)
    

```
// store.jsimport { create } from 'zustand'; const useStore = create((set) => ({  count: 0,  name: 'Zustand Store',  increment: () => set((state) => ({ count: state.count + 1 })),  setName: (newName) => set({ name: newName }),})); export default useStore;
```

Recoil
------

### 特点

Recoil 是由 Facebook 开发的一个用于 React 状态管理库，目前已停止维护。它旨在提供一种简单、高效的方式来管理组件间共享的状态。其核心思想如下：

*   **原子状态**：Recoil 将状态划分为原子，每个原子是一个独立的状态片段，可以被任何 React 组件访问和订阅。
    
*   **选择器**：选择器是基于原子状态派生的状态，通过纯函数来计算。它们可以同步或异步地转换状态。类似于 Redux 中的 reducer 或 MobX 中的 computed 属性。
    
*   **细粒度依赖跟踪**：Recoil 内置了高效的依赖跟踪机制，只有当组件实际依赖的状态发生变化时才会触发重新渲染。
    
*   **单向数据流与响应式更新** Recoil 遵循单向数据流原则，组件通过订阅原子或选择器来获取状态，当有事件触发状态更新时，状态的变化会沿着数据流从原子、选择器流向订阅它们的组件，触发组件重新渲染，从而更新 UI。
    

### 基本使用

1.  **创建 Atom 和 Selector：**
    

*   **原子创建：** 定义一个 atom 来表示应用中的某个状态片段。
    

```
// MyComponent.jsimport React from 'react';import useStore from './store';function MyComponent() {  const { count } = useStore((state) => ({ count: state.count }));  return (    <div>      <p>Count: {count}</p>    </div>  );}export default MyComponent;
```

*   **创建 Selector**：定义一个 selector 来计算派生状态或执行异步操作。
    

```
// MyComponent.jsimport React from 'react';import useStore from './store';function MyComponent() {  const { count } = useStore((state) => ({ count: state.count }));  return (    <div>      <p>Count: {count}</p>    </div>  );}export default MyComponent;
```

2.  **使用 Atom 和 Selector**：
    

*   在组件中使用 `useRecoilState` Hook 来获取原子状态并更新（适用于读写原子状态的场景）。
    

```
import { makeAutoObservable } from 'mobx';class CounterStore {  count = 0;  constructor() {    makeAutoObservable(this);  }  increment = () => {    this.count++;  };  decrement = () => {    this.count--;  };}// 创建全局 store 实例const counterStore = new CounterStore();export default counterStore;
```

*   在组件中使用 `useRecoilValue` Hook 仅获取原子或选择器的值（适用于只读场景）：
    

```
import { makeAutoObservable } from 'mobx';class CounterStore {  count = 0;  constructor() {    makeAutoObservable(this);  }  increment = () => {    this.count++;  };  decrement = () => {    this.count--;  };}// 创建全局 store 实例const counterStore = new CounterStore();export default counterStore;
```

*   使用 `useSetRecoilState` Hook 仅获取更新原子状态的函数（适用于只写场景）：
    

```
import React from 'react';import { useObserver } from 'mobx-react';import counterStore from './CounterStore';const Counter = () => {  return useObserver(() => (    <div>      <p>Count: {counterStore.count}</p>      <button onClick={() => counterStore.increment()}>Increment</button>      <button onClick={() => counterStore.decrement()}>Decrement</button>    </div>  ));};export default Counter;
```

Jotai
-----

### 特点

Jotai 是一个轻量级且灵活的 React 状态管理库，采用原子化状态管理模型。它受到了 Recoil 的启发，旨在提供一种简单而直观的方式来管理 React 中的状态。其核心思想：

*   **原子化状态管理**：Jotai 使用原子作为状态的基本单位。每个原子代表一个独立的状态片段，可以被多个组件共享和访问。
    
*   **组合性**：通过组合 atoms 和选择器，可以构建复杂的、依赖于其他状态的状态逻辑。这种组合性使得状态管理更加模块化和灵活。
    
*   **细粒度依赖跟踪**：Jotai 内置了高效的依赖跟踪机制，只有当组件实际依赖的状态发生变化时才会触发重新渲染。
    

### 基本使用

1.  **创建 Atom**：
    

*   **简单原子创建**：定义一个 atom 来表示应用中的某个状态片段。
    

```
import React from 'react';import { useObserver } from 'mobx-react';import counterStore from './CounterStore';const Counter = () => {  return useObserver(() => (    <div>      <p>Count: {counterStore.count}</p>      <button onClick={() => counterStore.increment()}>Increment</button>      <button onClick={() => counterStore.decrement()}>Decrement</button>    </div>  ));};export default Counter;
```

*   **派生原子创建**（基于已有原子进行计算等）
    

```
import React from 'react';import { useObserver, useLocalStore } from 'mobx-react';const Counter = () => {  const store = useLocalStore(() => ({    count: 0,    increment: () => {      this.count++;    },    decrement: () => {      this.count--;    }  }));  return useObserver(() => (    <div>      <p>Count: {store.count}</p>      <button onClick={store.increment}>Increment</button>      <button onClick={store.decrement}>Decrement</button>    </div>  ));};export default Counter;
```

2.  **使用 Atom**：
    

*   使用 `useAtom` Hook 获取和更新原子状态（适用于读写原子状态场景）：
    

```
import React from 'react';import { useObserver, useLocalStore } from 'mobx-react';const Counter = () => {  const store = useLocalStore(() => ({    count: 0,    increment: () => {      this.count++;    },    decrement: () => {      this.count--;    }  }));  return useObserver(() => (    <div>      <p>Count: {store.count}</p>      <button onClick={store.increment}>Increment</button>      <button onClick={store.decrement}>Decrement</button>    </div>  ));};export default Counter;
```

*   使用 `useAtomValue` Hook 仅获取原子状态（适用于只读场景）：
    

```
import React from 'react';import { observer } from 'mobx-react';import counterStore from './CounterStore'; // 确保路径正确class Counter extends React.Component {  handleIncrement = () => {    counterStore.increment();  };  handleDecrement = () => {    counterStore.decrement();  };  render() {    return (      <div>        <p>Count: {counterStore.count}</p>        <button onClick={this.handleIncrement}>Increment</button>        <button onClick={this.handleDecrement}>Decrement</button>      </div>    );  }}export default observer(Counter);
```

*   使用 `useSetAtom` Hook 仅获取更新原子状态的函数（适用于只写场景）：
    

```
import React from 'react';import { observer } from 'mobx-react';import counterStore from './CounterStore'; // 确保路径正确class Counter extends React.Component {  handleIncrement = () => {    counterStore.increment();  };  handleDecrement = () => {    counterStore.decrement();  };  render() {    return (      <div>        <p>Count: {counterStore.count}</p>        <button onClick={this.handleIncrement}>Increment</button>        <button onClick={this.handleDecrement}>Decrement</button>      </div>    );  }}export default observer(Counter);
```