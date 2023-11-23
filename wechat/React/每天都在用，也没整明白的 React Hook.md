> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wpJvXYf4Q3jFQEEpICtoSg)

**动手点关注  
**

**![](https://mmbiz.qpic.cn/mmbiz_gif/JaFvPvvA2J063TNzibibGfI89U9UaWNPqYGUFNRVJ1TkA4Bv0Ew946EkhX4dNibLx6ZK9E4ibdtqH01ZGs9a4gvo4w/640?wx_fmt=gif)**

**干货不迷路**

useState
========

**useState** 可以说是我们日常最常用的 hook 之一了，在实际使用过程中，有一些简单的小技巧能帮助你提升性能 & 减少出 bug 的概率。

*   使用 **惰性初始值** (https://reactjs.org/docs/hooks-reference.html#lazy-initial-state）
    

通常我们会使用以下的方式初始化 state。

```
const [state, useState] = useState(0);
```

对于简单的初始值，这样做完全没有任何性能问题，但如果初始值是根据复杂计算得出来的，我们这么写就会产生性能问题。

```
const initalState = heavyCompute(() => { /* do some heavy compute here*/});const [state,useState] = useState(initalState);
```

相信你已经发现这里的问题了，对于 useState 的初始值，我们只需要计算一次，但是根据 React Function Component 的渲染逻辑，在每一次 render 的时候，都会重新调用该函数，因此 initalState 在每次 render 时都会被重新计算，哪怕它只在第一次渲染的时候被用到，这无疑会造成严重过的性能问题，我们可以通过 useState 的惰性初始值来解决这个问题。

```
// 这样初始值就只会被计算一次了const [state,useState] = useState(() => heavyCompute(() => { /* do some heavy compute here*/}););
```

> 不要把只需要计算一次的的东西直接放在函数组件内部顶层 block 中。

*   使用 函数式更新 (https://zh-hans.reactjs.org/docs/hooks-reference.html#functional-updates)
    

当我们想更新 state 的时候，我们通常会这样调用 setState。

```
const [state,setState] = useState(0);setState(state + 1);// next render// state = 1
```

看上去没有任何问题，我们来看看另外一个 case。

```
const Demo: FC = () => {  const [state,setState] = useState(0);  useEffect(() => {    setTimeout(() => setState(state + 1), 3000);  },[]);  return <div onClick={() => setState(state + 1)}>{state}</div>;};
```

点击 div，我们可以看到计数器增加，那么 3 秒过后，计数器的值会是几呢？

**答案是 1**

这是一个非常反直觉的结果，原因在于第一次运行函数时，state 的值为 0，而 setTimeout 中的回调函数捕获了第一次运行 Demo 函数时 state 的值，也就是 0，所以 setState(state + 1) 执行后 state 的值变成了 1，哪怕当前 state 值已经不是 0 了。

让我们通过**函数式更新**修复这个问题。

```
const Demo: FC = () => {  const [state,setState] = useState(0);  useEffect(() => {    setTimeout(() => setState(prev => prev + 1), 3000);  },[]);  return <div onClick={() => setState(prev => prev + 1)}>{state}</div>;};
```

> 让我们再运行一次程序试试，这次 3 秒后，state 并没有变成 1，而是增加了 1。

直接在 setState 中依赖 state 计算新的 state 在异步执行的函数中会由于 js 闭包捕获得到预期外的结果，此时可以使用 setState(prev => getNewState(prev)) 函数式更新来解决。

*   使用 **useImmer** (https://github.com/immerjs/use-immer) 替代 **useState**。
    

相信很多同学听过 immer.js 这个库，简单来说就是基于 proxy 拦截 getter 和 setter 的能力，让我们可以很方便的通过修改对象本身，创建新的对象，那么这有什么用呢？我们知道，React 通过 Object.is 函数比较 props，也就是说对于引用一致的对象，react 是不会刷新视图的，这也是为什么我们不能直接修改调用 useState 得到的 state 来更新视图，而是要通过 setState 刷新视图，通常，为了方便，我们会使用 es6 的 spread 运算符构造新的对象（浅拷贝）。

```
const [state,setState] = useState({   a: 1,   b: {     c: [1,2]     d: 2   },});setState({    ...state,    b: {        ...state.b,        c: [...state.b.c, 3],    },})
```

我相信你已经发现问题了，对于嵌套层级多的对象，使用 spread 构造新的对象写起来心智负担很大，也不易于维护，这时候聪明的你肯定想到了，我直接 deepClone，修改后再 setState 不就完事了。

```
const [state,setState] = useState({   a: 1,   b: {     c: [1,2]     d: 2   },});const newState = deepClone(state);newState.b.c.push(3);setState(newState);
```

这样就完全没有心智负担的问题了，程序也运作良好，然而，这不是没有代价的，且不说 deepClone 本身对于嵌套层级复杂的对象就非常耗时，同时因为整个对象都是 deepClone 过来的，而不是浅拷贝，react 认为整个大对象都变了，这时候使用到对象里的引用值的组件也都会刷新，哪怕这两个引用前后值根本没有变化。

**有没有两全其美的方法呢？**

当然是用的，这里就要用到我们提到的 immer.js 了。

```
const [state,setState] = useState({   a: 1,   b: {     c: [1,2]     d: 2   },});setState(produce(state, draft => {  draft.b.c.push(3);}))
```

这里我们可以看到，即使用了 deepClone 没有心智负担的写法，同时 immer 只会改变写部分的引用 （也就是所谓的 “**Copy On Write**”），其余没用变动的部分引用保持不变，react 会跳过这部分的更新，这样我们就同时获得了简易的写法和良好的性能。

事实上，我们还可以使用 **useImmer** 这个语法糖来进一步简化调用方式。

```
const [state,setState] = useImmer({   a: 1,   b: {     c: [1,2]     d: 2   },});setState(prev => {  prev.b.c.push(3);}))
```

可以看到，使用 **useImmer** 之后，setState 几乎跟原生的 useState 提供的函数式更新 api 一模一样，只不过，你可以在 setState 内直接修改对象生成新的 state ，同时 useImmer 还对普通的 setState 用法做了兼容，你也可以直接在 setState 内返回新的 state，完全没有心智负担。

useEffect
=========

前面讲了 **useState**，那么还有一个开发过程中最常用的就是 **useEffect** 了，接下来来聊聊我的日常使用过程中 **useEffect** 的坑吧。

*   在 **useEffect** 中调用 **setState**
    

在很多情况下，我们可能会写出这样的代码

```
// dep1和dep2分别是两个独立的stateuseEffect(() => {    setDep2(compute(dep1))},[dep1])
```

咋一眼看上去没有任何问题，dep1 这个 state 变动的时候我更新一下 dep2 的值，然而这其实是一种反模式，我们可能会习惯性的把 useEffect 当成一个 watch 来用，但每次我们 setState 过后，函数组件又会重新执行一遍，useEffect 也会重新跑一遍，这里你肯定会想，那不是成死循环了，但其实不然，useEffect 提供的第二个参数允许我们传递依赖项，在依赖项不变的情况下会跳过 effect 执行，这才让我们的代码可以正常运行。

所以到这里，聪明的你肯定已经发现问题了么？

要是我 dep 数组写的不对，那不是有可能出现无限循环？

在实际开发过程中，如此高的心智负担必然不利于代码的维护，因此我们来聊一聊什么是 effect，setState 又该在哪里调用，我们来看一个图：

![](https://mmbiz.qpic.cn/mmbiz_png/5EcwYhllQOgpbSpicjl3nTicZxzFMeCJbavyRFhUP8iaJV5pHM1fkHrEOXSQw9mU59ib9iacRPW4fDXJ3D5whNrajMw/640?wx_fmt=png)

这里的 input / output 部分即 IO，也就是副作用，Input 产生一些值，而中间的纯函数对 Input 做一些转换，最终生成一堆数据，通过 output driver 执行副作用，也就是渲染，修改标题等操作，对应到 React 中，我们可以这样理解。

所有使用 hook 得到的状态即为 input 副作用产生的值。

function 组件函数本身是中间转换的纯函数。

React.render 函数作为 driver 负责读取转换好之后的值，并且执行渲染这个副作用 （其它的副作用在 **useEffect** 和 **useLayoutEffect** 中执行 ）。

基于以上的心智模型，我们可以得出这么几个结论：

*   不要直接在函数顶层 block 中调用 setState 或者执行其它副作用的操作！
    

（提醒一下，直接在函数顶层 block 中调用 setState，if 条件一下没写好，组件就挂了）

*   所有组件内部状态的转换都应该归于纯函数中，不要把 **useEffect** 当成 **watch** 来用。
    

我们可以使用这种方式计算新的 state。

```
const Demo = () => {    const [dep1,setDep1] = useState(0);    const dep2 = compute(dep1);}
```

(注意这里并没有使用 **useMemo** )

> 在 React 中，每次渲染都会重新调用函数，因此直接写在函数体内的自然就是 compute state ，在没有**严重性能问题**的情况下不推荐使用 useMemo， 依赖项写错了**容易出 bug**。

*   尽可能在 event 中执行 setState，以确保可预测的 state 变化，例如：
    

*   onClick 事件
    
*   Promise
    
*   setTimeout
    
*   setInterval
    
*   ...
    

*   依赖项为空数组的 useEffect 中，可以放心调用 setState。
    

```
useEffect(() => {    const timer = setInterval(() => { setState(newState) },1000)    return () => clearInterval(timer);,[]);
```

*   **不要同时使用一堆依赖项 & 多个 useEffect !!!**
    

如果你写过以下的代码：

```
useEffect(() => {    // do something and set some state    // setDep3     // setDep4},[dep1,dep2])useEffect(() => {    // do something and set some state},[dep3,dep4])
```

这样的代码非常容易造成循环依赖的问题，而且一旦出了问题，非常难排查很解决，整个 state 的更新很难预测，相关的 state 更新如果建议一次更新 （可以考虑使用 **useReducer** 并且在可能的情况下，尽量将状态更新放到事件而不是 useEffect 里）。

useContext
==========

在多个组件共享状态以及要向深层组件传递状态时，我们通常会使用 **useContext** 这个 hook 和 **createContext** 搭配，也就是下面这样：

```
const Context = React.createContext();const App = () => {    const sharedState = useState({});    return <Context.Provider value={sharedState} >        <A />        <B />    </Context.Provider>}const A = () => {    const [state,setState] = useContext(Context);    return <div onClick={() => {setState(prev => ({...prev, a: prev.a+1}))}}>{state.a}</div>}const B = () => {    const [state,setState] = useContext(Context);    return <div onClick={() => {setState(prev => ({...prev, b: prev.b+1}))}}>{state.b}</div>}
```

这也是 React 官方推荐的共享状态的方式，然而在需要共享状态的组件非常多的情况下，这有着严重的性能问题，在上述例子里，哪怕 A 组件只更新 state.a，并没有用到 state.b，B 组件更新 state.b 的时候 A 组件也会刷新，在组件非常多的情况下，就卡死了，用户体验非常不好。好在这个地方有很多种方法可以解决这个问题，这里我要推荐最简单的一种，也就是 react-tracked (https://react-tracked.js.org/) 这个库，它拥有和 useContext 差不多的 api，但基于 proxy 和组件内部的 useForceUpdate 做到了自动化的追踪，可以精准更新每个组件，不会出现修改大的 state，所有组件都刷新的情况。

```
import { useState } from 'react';import { createContainer } from 'react-tracked';// 声明const initialState = {  count: 0,  text: 'hello',};const useMyState = () => useState(initialState);export const { Provider: SharedStateProvider, useTracked: useSharedState } =  createContainer(useMyState);  // 使用const Counter = () => {  const [state, setState] = useSharedState();  const increment = () => {    setState((prev) => ({ ...prev, count: prev.count + 1 }));  };  return (    <div>      {state.count}      <button onClick={increment}>+1</button>    </div>  );};
```

useCallback
===========

一个很常见的误区是为了心理上的性能提升把函数通通使用 useCallback 包裹，在大多数情况下，javascript 创建一个函数的开销是很小的，哪怕每次渲染都重新创建，也不会有太大的性能损耗，真正的性能损耗在于，很多时候 callback 函数是组件 props 的一部分，因为每次渲染的时候都会重新创建 callback 导致函数引用不同，所以触发了组件的重渲染。然而一旦函数使用 useCallback 包裹，则要面对声明依赖项的问题，对于一个内部捕获了很多 state 的函数，写依赖项非常容易写错，因此引发 bug。所以，在大多数场景下，我们应该只在需要维持函数引用的情况下使用 useCallback，例如下面这个例子：

```
const [userText, setUserText] = useState("");const handleUserKeyPress = useCallback(event => {    // do something here}, []);useEffect(() => {    window.addEventListener("keydown", handleUserKeyPress);    return () => {        window.removeEventListener("keydown", handleUserKeyPress);    };}, [handleUserKeyPress]);  return (      <div>          {userText}      </div>  );
```

这里我们需要在组件卸载的时候移除 event listener callback，因此需要保持 event handler 的引用，所以这里需要使用 useCallback 来保持引用不变。

然而一旦我们使用 useCallback，我们又会面临声明依赖项的问题，这里我们可以使用 **ahook** 中的 useMemoizedFn (https://ahooks.js.org/zh-CN/hooks/use-memoized-fn) 的方式，既能保持引用，又不用声明依赖项。

```
const [state, setState] = useState('');// func 地址永远不会变化const func = useMemoizedFn(() => {  console.log(state);});
```

是不是觉得很神奇，为什么不用声明依赖项也能保持函数引用不变，而内部的变量又可以捕获最新的 state，实际上，这个 hook 的实现异常的简单，我们只需要用到 **useRef** 和 **useMemo**。

```
/*  param: fn  fn每次进来都是新建，引用会变化  fnRef.current = fn  fnRef每次持有的都是新的fn，捕获了最新的闭包变量   memoizeFn.current只会被初始化一次  memoizeFn.current指向的函数每次会去调fnRef.current，这样每次都能用fnRef里的新的fn  这样memoizedFn函数地址不变，同时也捕获了最新的闭包变量  */  function useMemoizedFn(fn) {      const fnRef = useRef(fn);      fnRef.current = useMemo(() => fn, [fn]);      const memoizedFn = useRef<T>();      if (!memoizedFn.current) {        memoizedFn.current = function (...args) {          return fnRef.current.apply(this, args);          }      }      return memoizedFn.current;}
```

> 所有需要用到 **useCallback** 的地方都可以用 **useMemoizedFn** 代替。

memo & useMemo
==============

对于需要优化渲染性能的场景，我们可以使用 memo 和 useMemo，通常用法如下：

```
const MyComponent = React.memo(function MyComponent(props) {  /* 使用 props 渲染 */});function Parent({ a, b }) {  // Only re-rendered if `a` changes:  const child1 = useMemo(() => <Child1 a={a} />, [a]);  // Only re-rendered if `b` changes:  const child2 = useMemo(() => <Child2 b={b} />, [b]);  return (    <>      {child1}      {child2}    </>  )}
```

考虑到 **useMemo** 需要声明依赖项，而 **memo** 不需要，会自动对所有 props 进行浅比较 (Object.is)，因此大多数场景下，我们可以结合上面提到的 **useImmer** 以及 **useMemoizedFn** 保持对象和函数的引用不变，以此减少不必要的渲染，对于 **Context** 共享的数据，我们可以使用 **react-tracked** 进行精准渲染，这些库的好处是不需要声明依赖项，能减小维护成本和心智负担，对于剩下的没法 cover 的场景，我们再使用 useMemo 进行更细粒度的渲染控制。

useReducer
==========

相对于上文中提到的这些 hook，useReducer 是我们日常开发过程中很少会用到的一个 hook （因为大部分需要 flux 这样架构的软件一般都直接上状态管理库了）。

但是，我们可以思考一下，在很多场景下，我们真的需要额外的状态管理库么？

我们来看一下下面的这个例子：

```
const Demo = () => {    const [state,setState] = {      isRunning: false,      time: 0    };    const idRef = useRef(0);    useEffect(() => {        idRef.current = setInterval(() => setState({ ...state,time: state.time + 1 }),1000);        return () => clearInterval(idRef.current);    },[]);        return <div>      {state.time}      <button onClick={() => setState({...state,isRunning: true}))}>        Start      </button>      <button onClick={() => setState({ ...state,isRunning: false })}>        Stop      </button>      <button onClick={() => setState({ isRunning: false, time: 0 })}>        Reset      </button>    </div>}
```

这是一个非常简单的计数器例子，虽说运作良好，但是却反映了一个问题，当我们需要同时操作一系列相关的 state 时，在不借助外部状态管理库的情况下，随着程序的规模变大，函数组件内部可能会充斥着非常多的 setState 一系列 state 的操作，这样视图就和实际逻辑耦合起来了，代码变得难以维护，但其实我们不一定需要使用外部的状态管理库解决这个问题，很多时候 useReducer 就能帮我们搞定这个问题，我们尝试用 useReducer 重写一下这个逻辑。

我们先写一个 reducer 的纯函数：

> 如果看到这里，你已经忘记了 reducer 之类的概念，我们来复习一下吧。 reducer 通常是一个纯函数，它接受一个 action 和一个 payload，当然还有上一次的 state, 基于这三者，reducer 计算出 next state，就是这么简单。

```
function reducer(state, action) {  switch (action.type) {    case 'start':      return { ...state, isRunning: true };    case 'stop':      return { ...state, isRunning: false };    case 'reset':      return { isRunning: false, time: 0 };    case 'tick':      return { ...state, time: state.time + 1 };    default:      throw new Error();  }}
```

我们再来定义一下初始状态以及 action 类型：

```
const initialState = {  isRunning: false,  time: 0};// The start action object{ type: 'start' }// The stop action object{ type: 'stop' }// The reset action object{ type: 'reset' }// The tick action object{ type: 'tick' }
```

接下来只要用 useReducer 把他们组合起来就行了：

```
function Stopwatch() {  const [state, dispatch] = useReducer(reducer, initialState);  const idRef = useRef(0);  useEffect(() => {    if (!state.isRunning) {       return;     }    idRef.current = setInterval(() => dispatch({type: 'tick'}), 1000);    return () => {      clearInterval(idRef.current);      idRef.current = 0;    };  }, [state.isRunning]);    return (    <div>      {state.time}s      <button onClick={() => dispatch({ type: 'start' })}>        Start      </button>      <button onClick={() => dispatch({ type: 'stop' })}>        Stop      </button>      <button onClick={() => dispatch({ type: 'reset' })}>        Reset      </button>    </div>  );}
```

这样我们就把 reducer 这个状态的变更逻辑从组件中抽离出去了，代码看起来清晰易懂，维护起来也方便多了。

> Q: reducer 是个纯函数，如果我需要获取异步数据呢？
> 
> A: 可以使用 use-reducer-async (https://github.com/dai-shi/use-reducer-async) 这个库，只要引入一个极小的包，就能拥有 effect 的能力。

```
import { useReducerAsync } from "use-reducer-async";const initialState = {  sleeping: false,};const reducer = (state, action) => {  switch (action.type) {    case 'START_SLEEP': return { ...state, sleeping: true };    case 'END_SLEEP': return { ...state, sleeping: false };    default: throw new Error('no such action type');  }};  const asyncActionHandlers = {  SLEEP: ({ dispatch }) => async (action) => {    dispatch({ type: 'START_SLEEP' });    await new Promise(r => setTimeout(r, action.ms));    dispatch({ type: 'END_SLEEP' });  },};  const Component = () => {  const [state, dispatch] = useReducerAsync(reducer, initialState, asyncActionHandlers);  return (    <div>      <span>{state.sleeping ? 'Sleeping' : 'Idle'}</span>      <button type="button" onClick={() => dispatch({ type: 'SLEEP', ms: 1000 })}>Click</button>    </div>  );};
```

结语
==

React Hook 心智负担真的很重，希望 react-forget  (https://zhuanlan.zhihu.com/p/443807113) 能早日 production ready。