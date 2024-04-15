> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4S2ueFHt_auFOb6BLBNGrw)

React Context
=============

> Context 提供了一个无需为每层组件手动添加 props，就能在组件树间进行数据传递的方法。

常用 API
------

### `React.createContext`

```
const MyContext = React.createContext(defaultValue);
```

创建一个 Context 对象。当 React 渲染一个订阅了这个 Context 对象的组件，这个组件会从组件树中离自身最近的那个匹配的 `Provider` 中读取到当前的 context 值。

### `Context.Provider`

```
<MyContext.Provider value={/* 某个值 */}>
```

每个 Context 对象都会返回一个 Provider React 组件，它允许消费组件订阅 context 的变化。

Provider 接收一个 `value` 属性，传递给消费组件。一个 Provider 可以和多个消费组件有对应关系。多个 Provider 也可以嵌套使用，里层的会覆盖外层的数据。

### `useContext`

```
const store = useContext(MyContext)
```

接收一个 context 对象（`React.createContext` 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 `<MyContext.Provider>` 的 `value` prop 决定。

`当 Provider 的 value 值发生变化时，它内部的所有消费组件都会重新渲染`

了解了 API 后，我们来看一个简单的例子。

示例
--

index.js

```
const MyContext = React.createContext(null);function reducer(state, action) {  switch (action.type) {    case 'addCount': {      return {        ...state,        count: state.count + 1      }    }    case 'addNum': {      return {        ...state,        num: state.num + 1      }    }    default: return state;  }}const MyProvider = ({ children }) => {  const [store, dispatch] = useReducer(reducer, { count: 0, num: 0 })  return <MyContext.Provider value={{store, dispatch}}>{children}</MyContext.Provider>};export default () => {  return (    <MyProvider>      <ChildCount />      <ChildNum />      <Child  />    </MyProvider>  );}
```

ChildCount.js

```
export default () => {    const { state, dispatch } = React.useContext(MyContext);    console.log('re-render ChildCount', state.count)    return (      <>        <div>count is: {state.count}</div>        <button onClick={() => dispatch({ type: 'addCount' })}> AddCount </button>      </>    )}
```

ChildNum.js

```
export default () => {    const { state, dispatch } = React.useContext(MyContext);    console.log('re-render ChildNum', state.num)    return (      <>        <div>num is: {state.num}</div>        <button onClick={() => dispatch({ type: 'addNum' })}> AddNum </button>      </>    )}
```

Child.js

```
export default () => {  console.log('re-render Child')  return <div>Child</div>}
```

点击 `AddCount` 按钮，输出：

**re-render ChildCount 1**  
**re-render ChildNum 0**

点击 `AddNum` 按钮，输出：

**re-render ChildCount 1**  
**re-render ChildNum 1**

我们可以发现，`Context.Provider` 下的所有消费组件，在 `Provider.value` 变化后，都会 `re-render`

改变 `count 、num` 任意一个值，`ChildCount，ChildNum` 都会 `re-render`

针对以上 `re-render` 情况，有以下方案可以优化

优化
--

### 针对子组件做函数记忆

#### React.memo

我们如下修改所有的 Child 组件

```
export default React.memo(() => {    const { state, dispatch } = React.useContext(MyContext);    console.log('re-render ChildCount', state.count)    return (      <>        <div>count is: {state.count}</div>        <button onClick={() => dispatch({ type: 'addCount' })}> AddCount </button>      </>    )})
```

点击 `AddCount` 后发现，依然打印出  
re-render ChildCount 1  
re-render ChildNum 0  
`？？？`

我们重新认识下 `React.memo`

**React.memo 默认情况下仅仅对传入的 props 做浅比较，如果是内部自身状态更新 (useState, useContext 等)，依然会重新渲染，在上面的例子中，useContext 返回的 state 一直在变化，导致就算被 memo 包裹的组件依然触发更新了。**

#### useMemo

我们如下修改所有的 Child 组件

```
export default () => {    const { state, dispatch } = React.useContext(MyContext);    return useMemo(() => {      console.log('re-render ChildCount', state.count)      return (          <>            <div>count is: {state.count}</div>            <button onClick={() => dispatch({ type: 'addCount' })}> AddCount </button>          </>      )    }, [state.count, dispatch])}
```

点击 `addCount` 后发现，只打印出了  
**re-render ChildCount 1**

点击 `addNum` 后发现，只打印出了  
**re-render ChildNum 1**

useMemo 可以做更细粒度的缓存，我们可以在依赖数组里来管理组件是否更新

> 我们可以思考一下，有没有一种办法，不用 useMemo 也可以做到按需渲染。就像 react-redux 中 useSelector 一样实现按需渲染

### 动手实现 useSelector

我们先想一下，在上面的例子中，触发子组件`re-render`的原因是什么？

没错就是因为 `Provider.value` 的值一直在变更，那我们要想个办法让子组件感知不到 `value` 的变更，同时在 `value` 的某个值发生变更的时候，能够触发消费 `value` 的子组件 `re-render`

> 我们使用 `观察者模式` 实现

1、我们使用 `useMemo` 缓存首次的 value，让子组件感知不到 value 的变化  
2、如果 value 不变化，那子组件就不会`re-render`，此时我们需要在真正 value 变化的时候，`re-render`子组件，我们需要一个 `hooks（useSelector）` 帮助我们实现子组件 `re-render`  
3、子组件在初始化时，`useSelector` 要帮助其订阅 state 变更的回调函数，并返回最新的 state（函数内部获取前后两次的 state 做对比，不一样则强制更新组件）  
4、在 `Context.Provider` 中创建一个收集子组件订阅 state 变更回调的集合，在其内部监听 `state（value）`，如果变更则遍历集合，执行所有回调函数

基于以上，我们依次实现了`Context.Provider, useSelector, useDispatch`

#### `Context.Provider`

```
const MyProvider = ({children}) => {  const [state, dispatch] = useReducer(reducer, initState);    // ref state  const stateRef = useRef(null);  stateRef.current = state;  // ref 订阅回调数组  const subscribersRef = useRef([]);  // state 变化，遍历执行回调  useEffect(() => {    subscribersRef.current.forEach(sub => sub());  }, [state]);  // 缓存 value， 利用 ref 拿到最新的 state, subscribe 状态  const value = useMemo(    () => ({      dispatch,      subscribe: cb => {        subscribersRef.current.push(cb);        return () => {          subscribersRef.current = subscribersRef.current.filter(item => item !== cb);        };      },      getState: () => stateRef.current    }),    []  )  return <MyContext.Provider children={children} value={value} />;}
```

#### `useSelector`

```
export const useSelector = selector => {  // 强制更新  const [, forceRender] = useReducer(v => v + 1, 0);  const store = useContext(MyContext);  // 获取当前使用的 state  const selectedStateRef = useRef(null)  selectedStateRef.current = selector(store.getState());  // 对比更新回调  const checkForUpdates = useCallback(() => {    // 获取变更后的 state    const newState = selector(store.getState());    // 对比前后两次 state    if (newState !== selectedStateRef.current) forceRender({});  }, [store]);    // 订阅 state  useEffect(() => {    const subscription = store.subscribe(checkForUpdates);    return () => subscription();  }, [store, checkForUpdates]);    // 返回需要的 state  return selectedStateRef.current;}
```

#### `useDispatch`

```
export const useDispatch = () => {  const store = useContext(MyContext);  return store.dispatch}
```

我们用上面重写的 API，改写下刚开始的例子

index.js

```
export default () => {    return (      <MyProvider>        <ChildCount />        <ChildNum />        <Child />      </Provider>    );}
```

ChildCount.js

```
export default () => {    const dispatch = useDispatch();    const count = useSelector(state => state.count);    console.log('re-render ChildCount', count)    return (      <>        <div>count is: {count}</div>        <button onClick={() => dispatch({ type: 'addCount' });}> AddCount </button>      </>    )};
```

ChildNum.js

```
export default () => {    const dispatch = useDispatch();    const num = useSelector(state => state.num);    console.log('re-render ChildNum', num)    return (      <>        <div>num is: {num}</div>        <button onClick={() => dispatch({ type: 'addNum' });}> AddNum </button>      </>    )}
```

Child.js

```
export default () => {    console.log('re-render Child')    return <div>Child</div>}
```

点击`AddCount`: 只打印了 re-render ChildCount 1

点击`AddNum`: 只打印了 re-render ChildNum 1

> 以上通过对 Context 使用中的一些思考，我们简单的实现了 useSelector，实现了 Context 组件的按需渲染

总结
--

在使用 Context API 的时候，要避免不必要的`re-render`，可以使用 `useMemo` 做细粒度更新，也可以使用 `useSelector` 实现按需渲染

**这里可以看到本文的示例！**在线 demo(https://codesandbox.io/s/context-demo-modmz?file=/src/App.js)

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)