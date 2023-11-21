> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/yGdWPOnFj9ezBVcUPBXVpg)

大厂技术  坚持周更  精选好文
================

> 「Content」：本文章简要分析 Redux & Redux 生态的原理及其实现方式。  
> 「Require」：理解本文需要一定 redux 的使用经验。  
> 「Gain」：将收获
> 
> 1.  再写 Redux，清楚地知道自己在做什么，每行代码会产生什么影响。
>     
> 2.  理解 storeEnhancer middleware 的工作原理，根据需求可以自己创造。
>     
> 3.  学习函数式范式是如何在实践中应用的大量优秀示例。
>     
> 
> 「Correction」：如有写错的地方，欢迎评论反馈

Redux 设计哲学
==========

### Single source of truth

只能存在一个唯一的全局数据源，状态和视图是一一对应关系

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIprPnMd5l8UwL8GN51vg7zdicNZQWowaFyw60t9RZkz5QLfQ0FNBuk8MP58ZaEHT4gQTE0NAMT6htg/640?wx_fmt=png)

  

Data - View Mapping

  

### State is read-only

状态是只读的，当我们需要变更它的时候，用一个新的来替换，而不是在直接在原数据上做更改。

### Changes are made with pure functions

状态更新通过一个纯函数（Reducer）完成，它接受一个描述状态如何变化的对象（Action）来生成全新的状态。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIprPnMd5l8UwL8GN51vg7zd6icoxOQz4mt22h8qucicjFHUGxia1Lu43EJBUb2iaoEH9KrB79YLTEG3iaA/640?wx_fmt=png) State Change

  
    纯函数的特点是函数输出不依赖于任何外部变量，相同的输入一定会产生相同的输出，非常稳定。使用它来进行全局状态修改，使得全局状态可以被预测。当前的状态决定于两点：1. 初始状态 2. 状态存在期间传递的 Action 序列，只要记录这两个要素，就可以还原任何一个时间点的状态，实现所谓的 “时间旅行”（Redux DevTools)

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIprPnMd5l8UwL8GN51vg7zd8eZ3CyrpO9MAVXh6sicz6icEEPEfqF5ZKibicLTNE1yiaAMicnfu5MGuNiagQ/640?wx_fmt=png)

  

Single State + Pure Function

Redux 架构
========

Redux 组件
--------

*   **state**: 全局的状态对象，唯一且不可变。
    
*   **store**: 调用 createStore 函数生成的对象，里面封入了定义在 createStore 内部用于操作全局状态的方法，用户通过这些方法使用 Redux。
    
*   **action**: 描述状态如何修改的对象，固定拥有一个 type 属性，通过 store 的 dispatch 方法提交。
    
*   **reducer**: 实际执行状态修改的纯函数，由用户定义并传入，接收来自 dispatch 的
    

action 作为参数，计算返回全新的状态，完成 state 的更新，然后执行订阅的监听函数。

*   **storeEnhancer**: createStore 的高阶函数封装，用于加强 store 的能力，redux 提供的 applyMiddleware 是官方实现的一个 storeEnhancer。
    
*   **middleware**: dispatch 的高阶函数封装，由 applyMiddleware 把原 dispatch 替换为包含 middleware 链式调用的实现。
    

Redux 构成
--------

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIprPnMd5l8UwL8GN51vg7zdNnPu01UZ4OMazubibQ8n5jK0gdlV6n0zcfj0KB9icyY5kStW14neTeCg/640?wx_fmt=png)  

Redux API 实现
============

Redux Core
----------

### createStore

    createStore 是一个大的闭包环境，里面定义了 store 本身，以及 store 的各种 api。环境内部有对如获取 state 、触发 dispatch 、改动监听等副作用操作做检测的标志，因此 reducer 被严格控制为纯函数。  
    redux 设计的所有核心思想都在这里面实现，整个文件只有三百多行，简单但重要，下面简要列出了这个闭包中实现的功能及源码解析，以加强理解。

如果有 storeEnhancer，则应用 storeEnhancer

```
if (typeof enhancer !== 'undefined') {// 类型检测if (typeof enhancer !== 'function') {...}// enhancer接受一个storeCreator返回一个storeCreator// 在应用它的时候直接把它返回的storeCreatetor执行了然后返回对应的storereturn enhancer(createStore)(reducer,preloadedState)}
```

    否则 dispatch 一个 INIT 的 action, 目的是让 reducer 产生一个初始的 state。注意这里的 INIT 是 Redux 内部定义的随机数，reducer 无法对它有明确定义的处理，而且此时的 state 可能为 undefined，故为了能够顺利完成初始化，编写 reducer 时候我们需要遵循下面的两点规则：

1.  处理未定义 type 的 action，直接返回入参的 state。
    
2.  createStore 如没有传入初始的 state，则 reducer 中必须提供默认值。
    

```
// When a store is created, an "INIT" action is dispatched so that every// reducer returns their initial state. This effectively populates// the initial state tree.dispatch({ type: ActionTypes.INIT } as A)
```

最后把闭包内定义的方法装入 store 对象并返回

```
const store = {dispatch,subscribe,getState,replaceReducer, // 不常用，故略过[$$observable]: observable // 不常用，故略过}return store;
```

下面是这些方法的实现方式

#### getState

规定不能在 reducer 里调用 getState，符合条件就返回当前状态，很清晰，不再赘述。

```
function getState(){if (isDispatching) {    ...}return currentState}
```

#### dispatch

内置的 dispatch 只提供了普通对象 Action 的支持，其余像 AsyncAction 的支持放到了 middleware 中。dispatch 做了两件事 ：

1.  调用 reducer 产生新的 state。
    
2.  调用订阅的监听函数。
    

```
/** 通过原型链判断是否是普通对象对于一个普通对象，它的原型是Object*/function isPlainObject(obj){    if (typeof obj !== 'object' || obj === null) return false    let proto = obj    // proto出循环后就是Object    while (Object.getPrototypeOf(proto) !== null) {        proto = Object.getPrototypeOf(proto)    }    return Object.getPrototypeOf(obj) === proto}function dispatch(action: A) {    // 判断一下是否是普通对象    if (!isPlainObject(action)) {        ...    }    // redux要求action中需要有个type属性    if (typeof action.type === 'undefined') {        ...    }    // reducer中不允许使用    if (isDispatching) {        ...    }    // 调用reducer产生新的state 然后替换掉当前的state    try {        isDispatching = true        currentState = currentReducer(currentState, action)    } finally {        isDispatching = false    }    // 调用订阅的监听    const listeners = (currentListeners = nextListeners)    for (let i = 0; i < listeners.length; i++) {        const listener = listeners[i]        listener()    }    return action}
```

#### subscribe

订阅状态更新，并返回取消订阅的方法。实际上只要发生 dispatch 调用，就算 reducer 不对 state 做任何改动，监听函数也一样会被触发，所以为了减少渲染，各个 UI bindings 中会在自己注册的 listener 中做 state diff 来优化性能。注意 listener 是允许副作用存在的。

```
// 把nextListeners做成currentListeners的一个切片，之后对切片做修改，替换掉currentListenersfunction ensureCanMutateNextListeners() {    if (nextListeners === currentListeners) {        nextListeners = currentListeners.slice()    }}function subscribe(listener: () => void) {    // 类型检测    if(typeof listener !== 'function'){        ...    }    // reducer 中不允许订阅    if (isDispatching) {        ...    }    let isSubscribed = true    ensureCanMutateNextListeners()    nextListeners.push(listener)    return function unsubscribe() {    // 防止重复取消订阅    if (!isSubscribed) {        return    }    // reducer中也不允许取消订阅    if (isDispatching) {        ...    }    isSubscribed = false    ensureCanMutateNextListeners()    const index = nextListeners.indexOf(listener)    nextListeners.splice(index, 1)    currentListeners = null    }}
```

### applyMiddleware

applyMiddleware 是官方实现的一个 storeEnhance，用于给 redux 提供插件能力，支持各种不同的 Action。

#### storeEnhancer

从函数签名可以看出是 createStore 的高阶函数封装。

```
type StoreEnhancer = (next: StoreCreator) => StoreCreator；
```

CreateStore 入参中只接受一个 storeEnhancer , 如果需要传入多个，则用 compose 把他们组合起来，关于高阶函数组合的执行方式下文中的 Redux Utils - compose 有说明，这对理解下面 middleware 是如何链式调用的至关重要，故请先看那一部分。

#### middleware

```
type MiddlewareAPI = { dispatch: Dispatch, getState: () => State } type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch
```

最外层函数的作用是接收 middlewareApi ，给 middleware 提供 store 的部分 api，它返回的函数参与 compose，以实现 middleware 的链式调用。

```
export default function applyMiddleware(...middlewares) {    return (createStore) =>{                         // 初始化store，拿到dispatch                         const store = createStore(reducer, preloadedState)                         // 不允许在middlware中调用dispath                         let dispatch: Dispatch = () => {                                 throw new Error(                                     'Dispatching while constructing your middleware is not allowed. ' +                     'Other middleware would not be applied to this dispatch.'                                 )                         }                         const middlewareAPI: MiddlewareAPI = {                getState: store.getState,                                 dispatch: (action, ...args) => dispatch(action, ...args)            }                        // 把api注入middlware                         const chain = middlewares.map(middleware => middleware(middlewareAPI))                 // 重点理解            // compose后传入dispatch，生成一个新的经过层层包装的dispath调用链            dispatch = compose<typeof dispatch>(...chain)(store.dispatch)            // 替换掉dispath，返回            return {                                 ...store,                                 dispatch                         }                 } }
```

再来看一个 middleware 加深理解：redux-thunk 使 redux 支持 asyncAction ，它经常被用于一些异步的场景中。

```
// 最外层是一个中间件的工厂函数，生成middleware，并向asyncAction中注入额外参数  function createThunkMiddleware(extraArgument) {       return ({ dispatch, getState }) => (next) =>         (action) => {             // 在中间件里判断action类型，如果是函数那么直接执行，链式调用在这里中断        if (typeof action === 'function') {                   return action(dispatch, getState, extraArgument);     }     // 否则继续                 return next(action);       };}
```

Redux Utils
-----------

### compose

    compose(组合) 是函数式编程范式中经常用到的一种处理，它创建一个从右到左的数据流，右边函数执行的结果作为参数传入左边。

    compose 是一个高阶函数，接受 n 个函数参数，返回一个以上述数据流执行的函数。如果参数数组也是高阶函数，那么它 compose 后的函数最终执行过程就变成了如下图所示，高阶函数数组返回的函数将是一个从左到右链式调用的过程。![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIprPnMd5l8UwL8GN51vg7zdUdesIAkTLzx7S0icVhD0yJSWK7TjbC97uNetgOHMmWPWlBz0Dkzibv9g/640?wx_fmt=png)

```
export default function compose(...funcs) {    if (funcs.length === 0) {        return (arg) => arg    }    if (funcs.length === 1) {        return funcs[0]    }    // 简单直接的compose    return funcs.reduce(        (a, b) =>            (...args: any) =>                a(b(...args))    )}
```

### combineReducers

它也是一种组合，但是是树状的组合。可以创建复杂的 Reducer，如下图![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIprPnMd5l8UwL8GN51vg7zdsu5gX2csw8TicTmJOz1uBeV0adkww2q9t4cFVH22VBtNcicsAK29RPKw/640?wx_fmt=png)  
实现的方法也较为简单，就是把 map 对象用函数包一层，返回一个 mapedReducer，下面是一个简化的实现。

```
function combineReducers(reducers){          const reducerKeys = Object.keys(reducers)          const finalReducers = {}          for (let i = 0; i < reducerKeys.length; i++) {        const key = reducerKeys[i]                  finalReducers[key] = reducers[key]    }         const finalReducerKeys = Object.keys(finalReducers)         // 组合后的reducer         return function combination(state, action){                 let hasChanged = false                 const nextState = {}                 // 遍历然后执行                 for (let i = 0; i < finalReducerKeys.length; i++) {                       const key = finalReducerKeys[i]                       const reducer = finalReducers[key]                       const previousStateForKey = state[key]                       const nextStateForKey = reducer(previousStateForKey, action)                       if (typeof nextStateForKey === 'undefined') {            ...                       }                       nextState[key] = nextStateForKey                       hasChanged = hasChanged || nextStateForKey !== previousStateForKey        }                 hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length                 return hasChanged ? nextState : state                 }         } }
```

### bindActionCreators

用 actionCreator 创建一个 Action，立即 dispatch 它

```
function bindActionCreator(actionCreator，dispatch) {       return function (this， ...args) {             return dispatch(actionCreator.apply(this, args))    }}
```

Redux UI bindings
=================

React-redux
-----------

    React-redux 是 Redux 官方实现的 React UI bindings。它提供了两种使用 Redux 的方式：HOC 和 Hooks，分别对应 Class 组件和函数式组件。我们选择它的 Hooks 实现来分析，重点关注 UI 组件是如何获取到全局状态的，以及当全局状态变更时如何通知 UI 更新。

### UI 如何获取到全局状态

1.  通过 React Context 存储全局状态
    

```
export const ReactReduxContext =   /*#__PURE__*/ React.createContext<ReactReduxContextValue | null>(null)
```

2.  把它封装成 Provider 组件
    

```
function Provider({ store, context, children }: ProviderProps) {         const Context = context || ReactReduxContext         return <Context.Provider value={contextValue}>{children}</Context.Provider>  }
```

3.  提供获取 store 的 hook: useStore
    

```
function useStore(){         const { store } = useReduxContext()!          return store }
```

### State 变更时如何通知 UI 更新

react-redux 提供了一个 hook：useSelector，这个 hook 向 redux subscribe 了一个 listener，当状态变化时被触发。它主要做下面几件事情。

> When an action is dispatched, useSelector() will do a reference comparison of the previous selector result value and the current result value. If they are different, the component will be forced to re-render. If they are the same, the component will not re-render.

4.  subscribe
    

```
const subscription = useMemo(  () => createSubscription(store),       [store, contextSub]  )     subscription.onStateChange = checkForUpdates
```

5.  state diff
    

```
function checkForUpdates() {               try {                     const newStoreState = store.getState()                     const newSelectedState = latestSelector.current!(newStoreState)                      if (equalityFn(newSelectedState, latestSelectedState.current)) {                           return                     }                      latestSelectedState.current = newSelectedState                     latestStoreState.current = newStoreState               } catch (err) {                    // we ignore all errors here, since when the component            // is re-rendered, the selectors are called again, and            // will throw again, if neither props nor store state            // changed                     latestSubscriptionCallbackError.current = err as Error               }                forceRender()        }
```

6.  re-render
    

```
const [, forceRender] = useReducer((s) => s + 1, 0)   forceRender()
```

脱离 UI bindings，如何使用 redux
-------------------------

其实只要完成上面三个步骤就能使用，下面是一个示例：

```
const App = ()=>{     const state = store.getState();     const [, forceRender] = useReducer(c=>c+1, 0);      // 订阅更新,状态变更刷新组件     useEffect(()=>{             // 组件销毁时取消订阅             return store.subscribe(()=>{                 forceRender();             });    },[]);      const onIncrement = ()=> {             store.dispatch({type: 'increment'});     };     const onDecrement = ()=> {             store.dispatch({type: 'decrement'});     }         return (<div style={{textAlign:'center', marginTop:'35%'}}>    <h1 style={{color: 'green', fontSize: '500%'}}>{state.count}</h1>    <button onClick={onDecrement} style={{marginRight: '10%'}}>decrement</button>    <button onClick={onIncrement}>increment</button>         </div>         ) }
```

小结
==

    Redux 核心部分单纯实现了它 “单一状态”、“状态不可变”、“纯函数” 的设定，非常小巧。对外暴露出 storeEnhancer 与 middleware 以在此概念上添加功能，丰富生态。redux 的发展也证明这样的设计思路使 redux 拓展性非常强。

    其中关于高阶函数的应用是我觉得非常值得借鉴的一个插件体系构建方式，不是直接设定生命周期，而是直接给予核心函数一次高阶封装，然后内部依赖 compose 完成链式调用，这可以降低外部开发者的开发心智。

    Redux 想要解决的问题是复杂状态与视图的映射难题，但 Redux 本身却没有直接实现，它只做了状态管理，然后把状态更新的监听能力暴露出去，剩下的状态缓存、状态对比、更新视图就抛给各大框架的 UI-bindings，这既在保持了自身代码的单一性、稳定性、又能给真正在视图层使用 redux 状态管理的开发者提供 “类响应式” 的 State-View 开发体验。

❤️ 谢谢支持
-------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 **分享、点赞、收藏** 三连哦~。

- END -

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEAvpoDMMDRyr6DPXbHAb7uUbWQnXrd4ZBkdfVCXKkVvOEYEmWic0W4Cu5w6NZbHniaMpbQflnLZuXbw/640?wx_fmt=png)