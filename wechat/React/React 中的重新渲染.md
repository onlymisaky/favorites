> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ADx8PuNvg4xVVLBeh265kw)

![](https://mmbiz.qpic.cn/mmbiz_gif/QRibyjewM1ICYYia2SLwuMNiar6aVaCbibwOd04ozAmkHqia4Th9QMRcT51vflz5MoJic1Trw6SGVbgeDbtMZbEfnBHg/640?wx_fmt=gif)

缘起
==

`React` 重新渲染，指的是在类函数中，会重新执行 `render` 函数，类似 `Flutter` 中的 `build` 函数，函数组件中，会重新执行这个函数

`React` 组件在组件的状态 `state` 或者组件的属性 `props` 改变的时候，会重新渲染，条件简单，但是实际上稍不注意，会引起灾难性的重新渲染

类组件
===

为什么拿类组件先说，怎么说呢，更好理解？还有前几年比较流行的一些常见面试题

> `React` 中的 `setState` 什么时候是同步的，什么时候是异步的

> `React` `setState` 怎么获取最新的 `state`

> 以下代码的输出值是什么，页面展示是怎么变化的

```
test = () => {    // s1 = 1    const { s1 } = this.state;    this.setState({ s1: s1 + 1});    this.setState({ s1: s1 + 1});    this.setState({ s1: s1 + 1});    console.log(s1)  };  render() {    return (      <div>        <button onClick={this.test}>按钮</button>        <div>{this.state.s1}</div>      </div>    );  }
```

> 看到这些类型的面试问题，熟悉 `React` 事务机制的你一定能答出来，毕竟不难嘛，哈？你不知道 `React` 的事务机制？百度 | 谷歌 | 360 | 搜狗 | 必应 React 事务机制

`React` 合成事件
------------

在 `React` 组件触发的事件会被冒泡到 `document`(在 `react v17` 中是 `react` 挂载的节点，例如 document.querySelector('#app'))，然后 `React` 按照触发路径上收集事件回调，分发事件。

*   这里是不是突发奇想，如果禁用了，在触发事件的节点，通过原生事件禁止事件冒泡，是不是 `React` 事件就没法触发了？确实是这样，没法冒泡了，`React` 都没法收集事件和分发事件了，注意这个冒泡不是 `React` 合成事件的冒泡。
    
*   发散一下还能想到的另外一个点，`React` ，就算是在合成捕获阶段触发的事件，依旧在原生冒泡事件触发之后
    

```
reactEventCallback = () => {  // s1 s2 s3 都是 1  const { s1, s2, s3 } = this.state;  this.setState({ s1: s1 + 1 });  this.setState({ s2: s2 + 1 });  this.setState({ s3: s3 + 1 });  console.log('after setState s1:', this.state.s1);  // 这里依旧输出 1， 页面展示 2，页面仅重新渲染一次};<button  onClick={this.reactEventCallback}  onClickCapture={this.reactEventCallbackCapture}>  React Event</button><div>  S1: {s1} S2: {s2} S3: {s3}</div>
```

定时器回调后触发 `setState`
-------------------

定时器回调执行 `setState` 是同步的，可以在执行 `setState` 之后直接获取，最新的值，例如下面代码

```
timerCallback = () => {  setTimeout(() => {    // s1 s2 s3 都是 1    const { s1, s2, s3 } = this.state;    this.setState({ s1: s1 + 1 });    console.log('after setState s1:', this.state.s1);    // 输出 2 页面渲染 3 次    this.setState({ s2: s2 + 1 });    this.setState({ s3: s3 + 1 });  });};
```

异步函数后调触发 `setState`
-------------------

异步函数回调执行 `setState` 是同步的，可以在执行 `setState` 之后直接获取，最新的值，例如下面代码

```
asyncCallback = () => {  Promise.resolve().then(() => {    // s1 s2 s3 都是 1    const { s1, s2, s3 } = this.state;    this.setState({ s1: s1 + 1 });    console.log('after setState s1:', this.state.s1);    // 输出 2 页面渲染 3 次    this.setState({ s2: s2 + 1 });    this.setState({ s3: s3 + 1 });  });};
```

原生事件触发
------

原生事件同样不受 `React` 事务机制影响，所以 `setState` 表现也是同步的

```
componentDidMount() {  const btn1 = document.getElementById('native-event');  btn1?.addEventListener('click', this.nativeCallback);}nativeCallback = () => {  // s1 s2 s3 都是 1  const { s1, s2, s3 } = this.state;  this.setState({ s1: s1 + 1 });  console.log('after setState s1:', this.state.s1);  // 输出 2 页面渲染 3 次  this.setState({ s2: s2 + 1 });  this.setState({ s3: s3 + 1 });};<button id="native-event">Native Event</button>
```

`setState` 修改不参与渲染的属性
---------------------

`setState` 调用就会引起就会组件重新渲染，即使这个状态没有参与页面渲染，所以，请不要把非渲染属性放 `state` 里面，即使放了 `state`，也请不要通过 `setState` 去修改这个状态，直接调用 `this.state.xxx = xxx` 就好，这种不参与渲染的属性，直接挂在 `this` 上就好，参考下图

```
// s1 s2 s3 为渲染的属性，s4 非渲染属性state = {  s1: 1,  s2: 1,  s3: 1,  s4: 1,};s5 = 1;changeNotUsedState = () => {  const { s4 } = this.state;  this.setState({ s4: s4 + 1 });  // 页面会重新渲染  // 页面不会重新渲染  this.state.s4 = 2;  this.s5 = 2;};<div>  S1: {s1} S2: {s2} S3: {s3}</div>;
```

只是调用 `setState`，页面会不会重新渲染
-------------------------

几种情况，分别是：

*   直接调用 `setState`，无参数
    
*   `setState`，新 `state` 和老 `state` 完全一致，也就是同样的 `state`
    

```
sameState = () => {  const { s1 } = this.state;  this.setState({ s1 });  // 页面会重新渲染};noParams = () => {  this.setState({});  // 页面会重新渲染};
```

这两种情况，处理起来和普通的修改状态的 `setState` 一致，都会引起重新渲染的

多次渲染的问题
-------

为什么要提上面这些，仔细看，这里提到了很多次渲染的 `3` 次，比较契合我们日常写代码的，异步函数回调，毕竟在定时器回调或者给组件绑定原生事件（没事找事是吧？），挺少这么做的吧，但是异步回调就很多了，比如网络请求啥的，改变个 `state` 还是挺常见的，但是渲染多次，就是不行！不过利用 `setState` 实际上是传一个新对象合并机制，可以把变化的属性合并在新的对象里面，一次性提交全部变更，就不用调用多次 `setState` 了

```
asyncCallbackMerge = () => {  Promise.resolve().then(() => {    const { s1, s2, s3 } = this.state;    this.setState({ s1: s1 + 1, s2: s2 + 1, s3: s3 + 1 });    console.log('after setState s1:', this.state.s1);    // 输出 2 页面渲染1次  });};
```

这样就可以在非 `React` 的事务流中避开多次渲染的问题

测试代码
----

```
import React from 'react';interface State {  s1: number;  s2: number;  s3: number;  s4: number;}// eslint-disable-next-line @iceworks/best-practices/recommend-functional-componentexport default class TestClass extends React.Component<any, State> {  renderTime: number;  constructor(props: any) {    super(props);    this.renderTime = 0;    this.state = {      s1: 1,      s2: 1,      s3: 1,      s4: 1,    };  }  componentDidMount() {    const btn1 = document.getElementById('native-event');    const btn2 = document.getElementById('native-event-async');    btn1?.addEventListener('click', this.nativeCallback);    btn2?.addEventListener('click', this.nativeCallbackMerge);  }  changeNotUsedState = () => {    const { s4 } = this.state;    this.setState({ s4: s4 + 1 });  };  reactEventCallback = () => {    const { s1, s2, s3 } = this.state;    this.setState({ s1: s1 + 1 });    this.setState({ s2: s2 + 1 });    this.setState({ s3: s3 + 1 });    console.log('after setState s1:', this.state.s1);  };  timerCallback = () => {    setTimeout(() => {      const { s1, s2, s3 } = this.state;      this.setState({ s1: s1 + 1 });      console.log('after setState s1:', this.state.s1);      this.setState({ s2: s2 + 1 });      this.setState({ s3: s3 + 1 });    });  };  asyncCallback = () => {    Promise.resolve().then(() => {      const { s1, s2, s3 } = this.state;      this.setState({ s1: s1 + 1 });      console.log('after setState s1:', this.state.s1);      this.setState({ s2: s2 + 1 });      this.setState({ s3: s3 + 1 });    });  };  nativeCallback = () => {    const { s1, s2, s3 } = this.state;    this.setState({ s1: s1 + 1 });    console.log('after setState s1:', this.state.s1);    this.setState({ s2: s2 + 1 });    this.setState({ s3: s3 + 1 });  };  timerCallbackMerge = () => {    setTimeout(() => {      const { s1, s2, s3 } = this.state;      this.setState({ s1: s1 + 1, s2: s2 + 1, s3: s3 + 1 });      console.log('after setState s1:', this.state.s1);    });  };  asyncCallbackMerge = () => {    Promise.resolve().then(() => {      const { s1, s2, s3 } = this.state;      this.setState({ s1: s1 + 1, s2: s2 + 1, s3: s3 + 1 });      console.log('after setState s1:', this.state.s1);    });  };  nativeCallbackMerge = () => {    const { s1, s2, s3 } = this.state;    this.setState({ s1: s1 + 1, s2: s2 + 1, s3: s3 + 1 });    console.log('after setState s1:', this.state.s1);  };  sameState = () => {    const { s1, s2, s3 } = this.state;    this.setState({ s1 });    this.setState({ s2 });    this.setState({ s3 });    console.log('after setState s1:', this.state.s1);  };  withoutParams = () => {    this.setState({});  };  render() {    console.log('renderTime', ++this.renderTime);    const { s1, s2, s3 } = this.state;    return (      <div class>        <button onClick={this.reactEventCallback}>React Event</button>        <button onClick={this.timerCallback}>Timer Callback</button>        <button onClick={this.asyncCallback}>Async Callback</button>        <button id="native-event">Native Event</button>        <button onClick={this.timerCallbackMerge}>Timer Callback Merge</button>        <button onClick={this.asyncCallbackMerge}>Async Callback Merge</button>        <button id="native-event-async">Native Event Merge</button>        <button onClick={this.changeNotUsedState}>Change Not Used State</button>        <button onClick={this.sameState}>React Event Set Same State</button>        <button onClick={this.withoutParams}>          React Event SetState Without Params        </button>        <div>          S1: {s1} S2: {s2} S3: {s3}        </div>      </div>    );  }}
```

函数组件
====

函数组件重新渲染的条件也和类组件一样，组件的属性 `Props` 和组件的状态 `State` 有修改的时候，会触发组件重新渲染，所以类组件存在的问题，函数组件同样也存在，而且因为函数组件的 `state` 不是一个对象，情况就更糟糕

`React` 合成事件
------------

```
const reactEventCallback = () => {  // S1 S2 S3 都是 1  setS1((i) => i + 1);  setS2((i) => i + 1);  setS3((i) => i + 1);  // 页面只会渲染一次， S1 S2 S3 都是 2};
```

定时器回调
-----

```
const timerCallback = () => {  setTimeout(() => {    // S1 S2 S3 都是 1    setS1((i) => i + 1);    setS2((i) => i + 1);    setS3((i) => i + 1);    // 页面只会渲染三次， S1 S2 S3 都是 2  });};
```

异步函数回调
------

```
const asyncCallback = () => {  Promise.resolve().then(() => {    // S1 S2 S3 都是 1    setS1((i) => i + 1);    setS2((i) => i + 1);    setS3((i) => i + 1);    // 页面只会渲染三次， S1 S2 S3 都是 2  });};
```

原生事件
----

```
useEffect(() => {  const handler = () => {    // S1 S2 S3 都是 1    setS1((i) => i + 1);    setS2((i) => i + 1);    setS3((i) => i + 1);    // 页面只会渲染三次， S1 S2 S3 都是 2  };  containerRef.current?.addEventListener('click', handler);  return () => containerRef.current?.removeEventListener('click', handler);}, []);
```

更新没使用的状态
--------

```
const [s4, setS4] = useState<number>(1);const unuseState = () => {  setS4((s) => s + 1);  // s4 === 2 页面渲染一次 S4 页面上没用到};
```

总结
--

以上的全部情况，在 `React Hook` 中表现的情况和类组件表现完全一致，没有任何差别，但是也有表现不一致的地方

不同的情况 设置同样的 `State`
-------------------

在 `React Hook` 中设置同样的 `State`，并不会引起重新渲染，这点和类组件不一样，但是这个不一定的，引用 `React` 官方文档说法

> 如果你更新 State Hook 后的 state 与当前的 state 相同时，React 将跳过子组件的渲染并且不会触发 effect 的执行。（React 使用 Object.is 比较算法 来比较 state。）

> 需要注意的是，React 可能仍需要在跳过渲染前渲染该组件。不过由于 React 不会对组件树的 “深层” 节点进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用 useMemo 来进行优化。

官方稳定有提到，新旧 `State` 浅比较完全一致是不会重新渲染的，但是有可能还是会导致重新渲染

```
// React Hookconst sameState = () => {  setS1((i) => i);  setS2((i) => i);  setS3((i) => i);  console.log(renderTimeRef.current);  // 页面并不会重新渲染};// 类组件中sameState = () => {  const { s1, s2, s3 } = this.state;  this.setState({ s1 });  this.setState({ s2 });  this.setState({ s3 });  console.log('after setState s1:', this.state.s1);  // 页面会重新渲染};
```

这个特性存在，有些时候想要获取最新的 `state`，又不想给某个函数添加 `state` 依赖或者给 `state` 添加一个 `useRef`，可以通过这个函数去或者这个 `state` 的最新值

```
const sameState = () => {  setS1((i) => {    const latestS1 = i;    // latestS1 是当前 S1 最新的值，可以在这里处理一些和 S1 相关的逻辑    return latestS1;  });};
```

`React Hook` 中避免多次渲染
--------------------

`React Hook` 中 `state` 并不是一个对象，所以不会自动合并更新对象，那怎么解决这个异步函数之后多次 `setState` 重新渲染的问题？

### 将全部 `state` 合并成一个对象

```
const [state, setState] = useState({ s1: 1, s2: 1, s3: 1 });setState((prevState) => {  setTimeout(() => {    const { s1, s2, s3 } = prevState;    return { ...prevState, s1: s1 + 1, s2: s2 + 1, s3: s3 + 1 };  });});
```

参考类的的 `this.state` 是个对象的方法，把全部的 `state` 合并在一个组件里面，然后需要更新某个属性的时候，直接调用 `setState` 即可，和类组件的操作完全一致，这是一种方案

### 使用 `useReducer`

虽然这个 `hook` 的存在感确实低，但是多状态的组件用这个来替代 `useState` 确实不错

```
const initialState = { s1: 1, s2: 1, s3: 1 };function reducer(state, action) {  switch (action.type) {    case 'update':      return { s1: state.s1 + 1, s2: state.s2 + 1, s3: state.s3 + 1 };    default:      return state;  }}const [reducerState, dispatch] = useReducer(reducer, initialState);const reducerDispatch = () => {  setTimeout(() => {    dispatch({ type: 'update' });  });};
```

具体的用法不展开了，用起来和 `redux` 差别不大

### 状态直接用 `Ref` 声明，需要更新的时候调用更新的函数（不推荐）

```
// S4 不参与渲染const [s4, setS4] = useState<number>(1);// update 就是 useReducer 的 dispatch，调用就更更新页面，比定义一个不渲染的 state 好多了const [, update] = useReducer((c) => c + 1, 0);const state1Ref = useRef(1);const state2Ref = useRef(1);const unRefSetState = () => {  // 优先更新 ref 的值  state1Ref.current += 1;  state2Ref.current += 1;  setS4((i) => i + 1);};const unRefSetState = () => {  // 优先更新 ref 的值  state1Ref.current += 1;  state2Ref.current += 1;  update();};<div>  state1Ref: {state1Ref.current} state2Ref: {state2Ref.current}</div>;
```

这样做，把真正渲染的 `state` 放到了 `ref` 里面，这样有个好处，就是函数里面不用声明这个 `state` 的依赖了，但是坏处非常多，更新的时候必须说动调用 `update`，同时把 `ref` 用来渲染也比较奇怪

自定义 `Hook`
----------

自定义 `Hook` 如果在组件中使用，任何自定义 `Hook` 中的状态改变，都会引起组件重新渲染，包括组件中没用到的，但是定义在自定义 `Hook` 中的状态

简单的例子，下面的自定义 `hook`，有 `id` 和 `data` 两个状态， `id` 甚至都没有导出，但是 `id` 改变的时候，还是会导致引用这个 `Hook` 的组件重新渲染

```
// 一个简单的自定义 Hook，用来请求数据const useDate = () => {  const [id, setid] = useState<number>(0);  const [data, setData] = useState<any>(null);  useEffect(() => {    fetch('请求数据的 URL')      .then((r) => r.json())      .then((r) => {        // 组件重新渲染        setid((i) => i + 1);        // 组件再次重新渲染        setData(r);      });  }, []);  return data;};// 在组件中使用，即使只导出了 data，但是 id 变化，同时也会导致组件重新渲染，所以组件在获取到数据的时候，组件会重新渲染两次const data = useDate();
```

测试代码
----

```
// use-data.tsconst useDate = () => {  const [id, setid] = useState<number>(0);  const [data, setData] = useState<any>(null);  useEffect(() => {    fetch('数据请求地址')      .then((r) => r.json())      .then((r) => {        setid((i) => i + 1);        setData(r);      });  }, []);  return data;};import { useEffect, useReducer, useRef, useState } from 'react';import useDate from './use-data';const initialState = { s1: 1, s2: 1, s3: 1 };function reducer(state, action) {  switch (action.type) {    case 'update':      return { s1: state.s1 + 1, s2: state.s2 + 1, s3: state.s3 + 1 };    default:      return state;  }}const TestHook = () => {  const renderTimeRef = useRef<number>(0);  const [s1, setS1] = useState<number>(1);  const [s2, setS2] = useState<number>(1);  const [s3, setS3] = useState<number>(1);  const [s4, setS4] = useState<number>(1);  const [, update] = useReducer((c) => c + 1, 0);  const state1Ref = useRef(1);  const state2Ref = useRef(1);  const data = useDate();  const [state, setState] = useState({ s1: 1, s2: 1, s3: 1 });  const [reducerState, dispatch] = useReducer(reducer, initialState);  const containerRef = useRef<HTMLButtonElement>(null);  const reactEventCallback = () => {    setS1((i) => i + 1);    setS2((i) => i + 1);    setS3((i) => i + 1);  };  const timerCallback = () => {    setTimeout(() => {      setS1((i) => i + 1);      setS2((i) => i + 1);      setS3((i) => i + 1);    });  };  const asyncCallback = () => {    Promise.resolve().then(() => {      setS1((i) => i + 1);      setS2((i) => i + 1);      setS3((i) => i + 1);    });  };  const unuseState = () => {    setS4((i) => i + 1);  };  const unRefSetState = () => {    state1Ref.current += 1;    state2Ref.current += 1;    setS4((i) => i + 1);  };  const unRefReducer = () => {    state1Ref.current += 1;    state2Ref.current += 1;    update();  };  const sameState = () => {    setS1((i) => i);    setS2((i) => i);    setS3((i) => i);    console.log(renderTimeRef.current);  };  const mergeObjectSetState = () => {    setTimeout(() => {      setState((prevState) => {        const { s1: prevS1, s2: prevS2, s3: prevS3 } = prevState;        return { ...prevState, s1: prevS1 + 1, s2: prevS2 + 1, s3: prevS3 + 1 };      });    });  };  const reducerDispatch = () => {    setTimeout(() => {      dispatch({ type: 'update' });    });  };  useEffect(() => {    const handler = () => {      setS1((i) => i + 1);      setS2((i) => i + 1);      setS3((i) => i + 1);    };    containerRef.current?.addEventListener('click', handler);    return () => containerRef.current?.removeEventListener('click', handler);  }, []);  console.log('render Time Hook', ++renderTimeRef.current);  console.log('data', data);  return (    <div class>      <button onClick={reactEventCallback}>React Event</button>      <button onClick={timerCallback}>Timer Callback</button>      <button onClick={asyncCallback}>Async Callback</button>      <button id="native-event" ref={containerRef}>        Native Event      </button>      <button onClick={unuseState}>Unuse State</button>      <button onClick={sameState}>Same State</button>      <button onClick={mergeObjectSetState}>Merge State Into an Object</button>      <button onClick={reducerDispatch}>Reducer Dispatch</button>      <button onClick={unRefSetState}>useRef As State With useState</button>      <button onClick={unRefSetState}>useRef As State With useReducer</button>      <div>        S1: {s1} S2: {s2} S3: {s3}      </div>      <div>        Merge Object S1: {state.s1} S2: {state.s2} S3: {state.s3}      </div>      <div>        reducerState Object S1: {reducerState.s1} S2: {reducerState.s2} S3:{' '}        {reducerState.s3}      </div>      <div>        state1Ref: {state1Ref.current} state2Ref: {state2Ref.current}      </div>    </div>  );};export default TestHook;
```

规则记不住怎么办？
=========

上面罗列了一大堆情况，但是这些规则难免会记不住，`React` 事务机制导致的两种完全截然不然的重新渲染机制，确实让人觉得有点恶心，`React` 官方也注意到了，既然在事务流的中 `setState` 可以合并，那不在 `React` 事务流的回调，能不能也合并，答案是可以的，`React` 官方其实在 `React V18` 中， `setState` 能做到合并，即使在异步回调或者定时器回调或者原生事件绑定中，可以把测试代码直接丢 `React V18` 的环境中尝试，就算是上面列出的会多次渲染的场景，也不会重新渲染多次

具体可以看下这个地址

Automatic batching for fewer renders in React 18[1]

但是，有了 `React V18` 最好也记录一下以上的规则，对于减少渲染次数还是很有帮助的

### 参考资料

[1]

Automatic batching for fewer renders in React 18: _https://github.com/reactwg/react-18/discussions/21_

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDBm4B6OB8j6tlVYWmMOnt5aQhtrbM4MpRUpUdicelh6B3JJtjCD3yRhffTM8cGGzn2PfLodhx4x6g/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/QRibyjewM1IDBm4B6OB8j6tlVYWmMOnt5HAj7UAwHh5ibSN0yOMn7tpMbu7XydA98uWMA086MvqxuFmPibJgU2Pdg/640?wx_fmt=png)