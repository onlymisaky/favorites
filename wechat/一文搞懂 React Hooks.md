> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WS8Z-8hfvhhkdTORU6P-ZQ)

一、前言

在当今的前端开发环境中，越来越多的开发者认可了 Hooks 的强大能力，并纷纷加入到 Hooks 的使用大军中：

*   2019 年 2 月，React 正式发布 v16.8 版本，引入 Hooks 能力（最新的 v18 中，还新增了 5 个 Hooks API）；
    
*   2019 年 6 月，尤雨溪提出了 Vue3 Composition API 的提案，使 Vue3 中也能够使用 Hooks；
    
*   诸如 Ant Design Pro V5 等框架以及 `Solid.js`、`Preact` 等库，都选择将 Hooks 作为主体；
    
*   很多优秀的开源项目（如 Ant Design）已经从原本的 Class 升级到使用 Hooks；
    
*   ......
    

在 React v16.8 之前，我们主要使用 Class 组件，对函数组件的使用相对较少。这主要是因为函数组件虽然简洁，但由于缺乏数据状态管理，这一致命的缺陷使得 Class 组件成为主流选择。

引入 Hooks 后，带来了一系列优势：

*   摆脱了繁琐的 `super` 传递；
    
*   消除了 Class 组件中容易引发奇怪 `this` 指向的问题；
    
*   摒弃了繁杂的生命周期方法。
    

此外，Hooks 提供了更好的状态复用。从强化组件模型的角度来看，我们可以发现自定义 Hooks 的模式与 mixin 模式更为相近。

为什么 mixin 会被废弃呢？其主要原因是 mixin 存在诸多弊端，其中一个显著的问题是引发了组件之间的耦合性增强。Mixin 模式使得组件之间共享状态和逻辑，但这也导致了一系列问题，例如：

1.  **命名冲突：** 不同组件可能会定义相同名称的 mixin，从而造成命名冲突，使代码难以维护和理解。
    
2.  **复杂性增加：** 随着 mixin 的引入，组件的复杂性呈指数增长。混合了多个 mixin 的组件往往难以追踪和调试，增加了代码维护的困难度。
    
3.  **难以追踪数据流：** 组件的状态和逻辑被分散在多个 mixin 中，使得数据流难以追踪和理解。这增加了排查错误和进行性能优化的难度。
    
4.  **组件间耦合：** 由于 mixin 的引入，组件之间的耦合性增强。一个组件可能会依赖于其他组件中定义的 mixin，导致组件之间的依赖关系错综复杂。
    
5.  **继承链问题：** mixin 使用继承链来将逻辑注入到组件中，但这会导致不可预测的继承链问题，特别是在复杂的项目中。
    

总体而言，mixin 的弊端主要表现在引入了难以管理的复杂性、命名冲突、耦合性增强等方面，因此 React 官方明确表示不建议使用 mixin，而推荐采用更灵活、可维护的 Hooks 模式。Hooks 提供了更清晰、可组合的方式来处理组件的状态和逻辑，避免了 mixin 带来的诸多问题。

React 官方在提供 Hooks API 后，并没有强制要求开发者立刻转向使用它，而是通过明确 Hooks 的优势与劣势，让开发者自行选择。这种渐进的改变让项目中的开发者可以同时使用熟悉的 Class 组件和尝试新颖的 Hooks。随着项目的逐步迭代，开发者在实践中逐渐体会到 Hooks 的优势。这种悄无声息的变革使越来越多的开发者熟悉并纷纷加入 Hooks 的行列。

二、实战演练
======

**主要演示 v16 提供的 10 种和 v18 中提供的 5 种 React Hooks API 的使用**

1. useState
-----------

**useState：** 定义变量，使其具备类组件的 `state`，让函数式组件拥有更新视图的能力。

**基本使用：**

```
const [state, setState] = useState(initData)
```

**Params：**

*   initData：默认初始值，有两种情况：函数和非函数，如果是函数，则函数的返回值作为初始值。
    

**Result：**

*   state：数据源，用于渲染`UI 层`的数据源；
    
*   setState：改变数据源的函数，可以理解为类组件的 `this.setState`。
    

**案例：**

主要介绍两种`setState`的使用方法。

```
import { useState } from "react";import { Button } from "antd";const Index = () => {  const [count, setCount] = useState(0);  return (    <>      <div>数字：{count}</div>      <Button type="primary" onClick={() => setCount(count + 1)}>        第一种方式+1      </Button>      <Button        type="primary"        style={{ marginLeft: 10 }}        onClick={() => setCount((v) => v + 1)}      >        第二种方式+1      </Button>    </>  );};export default Index;
```

**注意：** `useState` 有点类似于 `PureComponent`，它会进行一个比较浅的比较，这就导致了一个问题，如果是对象直接传入的时候，并不会实时更新，这点一定要切记。

我们做个简单的对比，比如：

```
import { useState } from "react";import { Button } from "antd";const Index = () => {  const [state, setState] = useState({ number: 0 });  const [count, setCount] = useState(0);  return (    <>      <div>数字形式：{count}</div>      <Button        type="primary"        onClick={() => {          setCount(count+1);        }}      >        点击+1      </Button>      <div>对象形式：{state.number}</div>      <Button        type="primary"        onClick={() => {          state.number++;          setState(state);        }}      >        点击+1      </Button>    </>  );};export default Index;
```

2. useEffect
------------

**useEffect：** 副作用，这个钩子成功弥补了函数式组件没有生命周期的缺陷，是我们最常用的钩子之一。

**基本使用：**

```
useEffect(()=>{     return destory}, deps)
```

**Params：**

*   callback：useEffect 的第一个入参，最终返回 `destory`，它会在下一次 callback 执行之前调用，其作用是清除上次的 callback 产生的副作用；
    
*   deps：依赖项，可选参数，是一个数组，可以有多个依赖项，通过依赖去改变，执行上一次的 callback 返回的 destory 和新的 effect 第一个参数 callback。
    

**案例：**

**模拟挂载和卸载阶段** **：**

事实上，destory 会用在组件卸载阶段上，把它当作组件卸载时执行的方法就 ok，通常用于监听 `addEventListener` 和 `removeEventListener` 上，如：

```
import { useState, useEffect } from "react";import { Button } from "antd";const Child = () => {  useEffect(() => {    console.log("挂载");    return () => {      console.log("卸载");    };  }, []);  return <div>react hooks！</div>;};const Index = () => {  const [flag, setFlag] = useState(false);  return (    <>      <Button        type="primary"        onClick={() => {          setFlag((v) => !v);        }}      >        {flag ? "卸载" : "挂载"}      </Button>      {flag && <Child />}    </>  );};export default Index;
```

**依赖变化：**

`dep`的个数决定`callback`什么时候执行，如：

```
import { useState, useEffect } from "react";import { Button } from "antd";const Index = () => {  const [number, setNumber] = useState(0);  const [count, setCount] = useState(0);  useEffect(() => {    console.log("count改变才会执行");  }, [count]);  return (    <>      <div>        number: {number} count: {count}      </div>      <Button type="primary" onClick={() => setNumber((v) => v + 1)}>        number + 1      </Button>      <Button        type="primary"        style={{ marginLeft: 10 }}        onClick={() => setCount((v) => v + 1)}      >        count + 1      </Button>    </>  );};export default Index;
```

**无限执行：**

当 useEffect 的第二个参数 deps 不存在时，会无限执行。更加准确地说，只要数据源发生变化（不限于自身中），该函数都会执行，所以请不要这么做，否则会出现不可控的现象。

```
import { useState, useEffect } from "react";import { Button } from "antd";const Index = () => {  const [count, setCount] = useState(0);  const [flag, setFlag] = useState(false);  useEffect(() => {    console.log("hello hooks！");  });  return (    <>      <Button type="primary" onClick={() => setCount((v) => v + 1)}>        数字加一：{count}      </Button>      <Button        type="primary"        style={{ marginLeft: 10 }}        onClick={() => setFlag((v) => !v)}      >        状态切换：{JSON.stringify(flag)}      </Button>    </>  );};export default Index;
```

3. useContext
-------------

**useContext：** 上下文，类似于 `Context`，其本意就是设置全局共享数据，使所有组件可跨层级实现共享。

useContext 的参数一般是由 `createContext` 创建，或者是父级上下文 `context`传递的，通过 `CountContext.Provider` 包裹的组件，才能通过 `useContext` 获取对应的值。我们可以简单理解为 `useContext` 代替 `context.Consumer` 来获取 `Provider` 中保存的 `value` 值。

**基本使用：**

```
const contextValue = useContext(context)
```

**Params：**

*   context：一般而言保存的是 context 对象。
    

**Result：**

*   contextValue：返回的数据，也就是`context`对象内保存的`value`值。
    

**案例：**

子组件 Child 和孙组件 Son，共享父组件 Index 的数据 count。

```
import { useState, createContext, useContext } from "react";import { Button } from "antd";const CountContext = createContext(-1);const Index = () => {  const [count, setCount] = useState(0);  return (    <>      <div>父组件中的count：{count}</div>      <Button type="primary" onClick={() => setCount((v) => v + 1)}>        点击+1      </Button>      <CountContext.Provider value={count}>        <Child />      </CountContext.Provider>    </>  );};const Child = () => {  const countChild = useContext(CountContext);  return (    <div style={{ marginTop: 10 }}>      子组件获取到的count: {countChild}      <Son />    </div>  );};const Son = () => {  const countSon = useContext(CountContext);  return <div style={{ marginTop: 10 }}>孙组件获取到的count: {countSon}</div>;};export default Index;
```

4. useReducer
-------------

useReducer： 功能类似于 `redux`，与 redux 最大的不同点在于它是单个组件的状态管理，组件通讯还是要通过 props。简单地说，useReducer 相当于是 useState 的升级版，用来处理复杂的 state 变化。

**基本使用：**

```
const [state, dispatch] = useReducer(    (state, action) => {},     initialArg,    init);
```

**Params：**

*   reducer：函数，可以理解为 redux 中的 reducer，最终返回的值就是新的数据源 state；
    
*   initialArg：初始默认值；
    
*   init：惰性初始化，可选值。
    

**Result：**

*   state：更新之后的数据源；
    
*   dispatch：用于派发更新的`dispatchAction`，可以认为是`useState`中的`setState`。
    

> 问：什么是惰性初始化？
> 
> 答：惰性初始化是一种延迟创建对象的手段，直到被需要的第一时间才去创建，这样做可以将用于计算 state 的逻辑提取到 reducer 外部，这也为将来对重置 state 的 action 做处理提供了便利。换句话说，如果有 `init`，就会取代 `initialArg`。

**案例：**

```
import { useReducer } from "react";import { Button } from "antd";const Index = () => {  const [count, dispatch] = useReducer((state, action) => {    switch (action?.type) {      case "add":        return state + action?.payload;      case "sub":        return state - action?.payload;      default:        return state;    }  }, 0);  return (    <>      <div>count：{count}</div>      <Button        type="primary"        onClick={() => dispatch({ type: "add", payload: 1 })}      >        加1      </Button>      <Button        type="primary"        style={{ marginLeft: 10 }}        onClick={() => dispatch({ type: "sub", payload: 1 })}      >        减1      </Button>    </>  );};export default Index;
```

**特别注意：** 在 reducer 中，如果返回的 state 和之前的 state 值相同，那么组件将不会更新。

比如这个组件是子组件，并不是组件本身，然后我们对上面的例子稍加更改，看看这个问题：

```
const Index = () => {  console.log("父组件发生更新");  ...  return (    <>        ...      <Button        type="primary"        style={{ marginLeft: 10 }}        onClick={() => dispatch({ type: "no", payload: 1 })}      >        无关按钮      </Button>      <Child count={count} />    </>  )};const Child = ({ count }) => {  console.log("子组件发生更新");  return <div>在子组件的count：{count}</div>;};
```

可以看到，当 count 无变化时，子组件并不会更新。

5. useMemo
----------

**场景：** 在每一次的状态更新中，都会让组件重新绘制，而重新绘制必然会带来不必要的性能开销，为了防止没有意义的性能开销，React Hooks 提供了 useMemo 函数。

useMemo：理念与 `memo` 相同，都是判断是否满足当前的限定条件来决定是否执行`callback` 函数。它之所以能带来提升，是因为在依赖不变的情况下，会返回相同的引用，避免子组件进行无意义的重复渲染。

**基本使用：**

```
const cacheData = useMemo(fn, deps)
```

**Params：**

*   fn：函数，函数的返回值会作为缓存值；
    
*   deps：依赖项，数组，会通过数组里的值来判断是否进行 fn 的调用，如果发生了改变，则会得到新的缓存值。
    

**Result：**

*   cacheData：更新之后的数据源，即 fn 函数的返回值，如果 deps 中的依赖值发生改变，将重新执行 fn，否则取上一次的缓存值。
    

**案例：**

```
import { useState } from "react";import { Button } from "antd";const usePow = (list) => {  return list.map((item) => {    console.log("我是usePow");    return Math.pow(item, 2);  });};const Index = () => {  const [flag, setFlag] = useState(true);  const data = usePow([1, 2, 3]);  return (    <>      <div>数字集合：{JSON.stringify(data)}</div>      <Button type="primary" onClick={() => setFlag((v) => !v)}>        状态切换{JSON.stringify(flag)}      </Button>    </>  );};export default Index;
```

从例子中来看， 按钮切换的 flag 应该与 usePow 的数据毫无关系，

可以看到，当我们点击按钮后，会打印`我是usePow`，这样就会产生开销。毫无疑问，这种开销并不是我们想要见到的结果，所以有了 `useMemo`。 并用它进行如下改造：

```
const usePow = (list) => {  return useMemo(    () =>      list.map((item) => {        console.log(1);        return Math.pow(item, 2);      }),    []  );};
```

6. useCallback
--------------

useCallback：与 useMemo 极其类似，甚至可以说一模一样，唯一不同的点在于，useMemo 返回的是值，而 useCallback 返回的是函数。

**基本使用：**

```
const resfn = useCallback(fn, deps)
```

**Params：**

*   fn：函数，函数的返回值会作为缓存值；
    
*   deps：依赖项，数组，会通过数组里的值来判断是否进行 fn 的调用，如果依赖项发生改变，则会得到新的缓存值。
    

**Result：**

*   resfn：更新之后的数据源，即 fn 函数，如果 deps 中的依赖值发生改变，将重新执行 fn，否则取上一次的函数。
    

**案例：**

```
import { useState, useCallback, memo } from "react";import { Button } from "antd";const Index = () => {  let [count, setCount] = useState(0);  let [flag, setFlag] = useState(true);  const add = useCallback(() => {    setCount(count + 1);  }, [count]);  return (    <>      <TestButton onClick={() => setCount((v) => v + 1)}>普通点击</TestButton>      <TestButton onClick={add}>useCallback点击</TestButton>      <div>数字：{count}</div>      <Button type="primary" onClick={() => setFlag((v) => !v)}>        切换{JSON.stringify(flag)}      </Button>    </>  );};const TestButton = memo(({ children, onClick = () => {} }) => {  console.log(children);  return (    <Button      type="primary"      onClick={onClick}      style={children === "useCallback点击" ? { marginLeft: 10 } : undefined}    >      {children}    </Button>  );});export default Index;
```

简要说明下，`TestButton` 里是个按钮，分别存放着有无 useCallback 包裹的函数，在父组件 Index 中有一个 flag 变量，这个变量同样与 count 无关，那么，我们切换按钮的时候，`TestButton` 会怎样执行呢？

可以看到，我们切换 flag 的时候，没有经过 useCallback 的函数会再次执行，而包裹的函数并没有执行（点击 “普通点击” 按钮的时候，useCallbak 的依赖项 count 发生了改变，所以会打印出 useCallback 点击）。

7. useRef
---------

**useRef：** 用于获取当前元素的所有属性，除此之外，还有一个高级用法：缓存数据。

**基本使用：**

```
const ref = useRef(initialValue);
```

**Params：**

*   initialValue：初始值，默认值。
    

**Result：**

*   ref：返回的一个 current 对象，这个 current 属性就是 ref 对象需要获取的内容。
    

**案例：**

```
import { useState, useRef } from "react";const Index = () => {  const scrollRef = useRef(null);  const [clientHeight, setClientHeight] = useState(0);  const [scrollTop, setScrollTop] = useState(0);  const [scrollHeight, setScrollHeight] = useState(0);  const onScroll = () => {    if (scrollRef?.current) {      let clientHeight = scrollRef?.current.clientHeight; //可视区域高度      let scrollTop = scrollRef?.current.scrollTop; //滚动条滚动高度      let scrollHeight = scrollRef?.current.scrollHeight; //滚动内容高度      setClientHeight(clientHeight);      setScrollTop(scrollTop);      setScrollHeight(scrollHeight);    }  };  return (    <>      <div>        <p>可视区域高度：{clientHeight}</p>        <p>滚动条滚动高度：{scrollTop}</p>        <p>滚动内容高度：{scrollHeight}</p>      </div>      <div        style={{ height: 200, border: "1px solid #000", overflowY: "auto" }}        ref={scrollRef}        onScroll={onScroll}      >        <div style={{ height: 2000 }}></div>      </div>    </>  );};export default Index;
```

8. useImperativeHandle
----------------------

useImperativeHandle：可以通过 ref 或 forwardRef 暴露给父组件的实例值，所谓的实例值是指值和函数。

实际上这个钩子非常有用，简单来讲，这个钩子可以让不同的模块关联起来，让父组件调用子组件的方法。

举个例子，在一个页面很复杂的时候，我们会将这个页面进行模块化，这样会分成很多个模块，有的时候我们需要在`最外层的组件上`控制其他组件的方法，希望最外层的点击事件同时执行`子组件的事件`，这时就需要 useImperativeHandle 的帮助（在不用`redux`等状态管理的情况下）。

**基本使用：**

```
useImperativeHandle(ref, createHandle, deps)
```

**Params：**

*   ref：接受 useRef 或 forwardRef 传递过来的 ref；
    
*   createHandle：处理函数，返回值作为暴露给父组件的 ref 对象；
    
*   deps：依赖项，依赖项如果更改，会形成新的 ref 对象。
    

**案例：**

**父组件是函数式组件：**

```
import { useState, useRef, useImperativeHandle } from "react";import { Button } from "antd";const Child = ({cRef}) => {  const [count, setCount] = useState(0)  useImperativeHandle(cRef, () => ({    add  }))  const add = () => {    setCount((v) => v + 1)  }  return <div>    <p>点击次数：{count}</p>    <Button onClick={() => add()}> 子组件的按钮，点击+1</Button>  </div>}const Index = () => {  const ref = useRef<any>(null)  return (    <>      <div>hello hooks！</div>      <div></div>      <Button        type="primary"        onClick={() =>  ref.current.add()}      >        父组件上的按钮，点击+1      </Button>      <Child cRef={ref} />    </>  );};export default Index;
```

**当父组件是类组件时：**

如果当前的父组件是 Class 组件，此时不能使用 useRef，而是需要用 forwardRef 来协助我们处理。

forwardRef：引用传递，是一种通过组件向子组件自动传递引用 ref 的技术。对于应用者的大多数组件来说没什么作用，但对于一些重复使用的组件，可能有用。

经过 forwardRef 包裹后，会将 props（其余参数）和 ref 拆分出来，ref 会作为第二个参数进行传递。如：

```
import { useState, useRef, useImperativeHandle, Component, forwardRef } from "react";import { Button } from "antd";const Child = (props, ref) => {  const [count, setCount] = useState(0)  useImperativeHandle(ref, () => ({    add  }))  const add = () => {    setCount((v) => v + 1)  }  return <div>    <p>点击次数：{count}</p>    <Button onClick={() => add()}> 子组件的按钮，点击+1</Button>  </div>}const ForwardChild = forwardRef(Child)class Index extends Component{  countRef = null  render(){    return   <>      <div>hello hooks！</div>      <div></div>      <Button        type="primary"        onClick={() => this.countRef.add()}      >        父组件上的按钮，点击+1      </Button>      <ForwardChild ref={node => this.countRef = node} />    </>  }}export default Index;
```

9. useLayoutEffect
------------------

**useLayoutEffect：** 与 useEffect 基本一致，不同点在于它是同步执行的。简要说明：

*   执行顺序：useLayoutEffect 是在 DOM 更新之后，浏览器绘制之前的操作，这样可以更加方便地修改 DOM，获取 DOM 信息，这样浏览器只会绘制一次，所以 useLayoutEffect 的执行顺序在 useEffect 之前；
    
*   useLayoutEffect 相当于有一层防抖效果；
    
*   useLayoutEffect 的 callback 中会阻塞浏览器绘制。
    

**基本使用：**

```
useLayoutEffect(callback,deps)
```

**案例：**

**防抖效果：**

```
import { useState, useEffect, useLayoutEffect } from "react";const Index = () => {  const [count, setCount] = useState(0);  const [count1, setCount1] = useState(0);  useEffect(() => {    if(count === 0){      setCount(10 + Math.random() * 100)    }  }, [count])  useLayoutEffect(() => {    if(count1 === 0){      setCount1(10 + Math.random() * 100)    }  }, [count1])  return (    <>      <div>hello Hooks！</div>      <div>useEffect的count:{count}</div>      <div>useLayoutEffect的count:{count1}</div>    </>  );};export default Index;
```

在这个例子中，我们分别设置 count 和 count1 两个变量，初始值都为 0，然后分别通过 useEffect 和 useLayout 控制，通过随机值来变更两个变量的值。也就是说，count 和 count1 连续变更了两次。

从结果上来看，count 要比 count1 更加抖动。

这是因为两者的执行顺序，简要分析下：

*   useEffect 执行顺序：setCount 设置 => 在 DOM 上渲染 => useEffect 回调 => setCount 设置 => 在 DOM 上渲染。
    
*   useLayoutEffect 执行顺序：setCount 设置 => useLayoutEffect 回调 => setCount 设置 => 在 DOM 上渲染。
    

可以看出，useEffect 实际进行了两次渲染，这样就可能导致浏览器再次回流和重绘，增加了性能上的损耗，从而会有闪烁突兀的感觉。

10. useDebugValue
-----------------

**useDebugValue：** 可用于在 React 开发者工具中显示自定义 Hook 的标签。这个 Hooks 目的就是检查自定义 Hooks。

**注意：** 这个标签并不推荐向每个 hook 都添加 debug 值。当它作为共享库的一部分时才最有价值。（也就是自定义 Hooks 被复用的值）。因为在一些情况下，格式化值可能是一项开销很大的操作，除非你需要检查 Hook，否则没有必要这么做。

**基本使用：**

```
useDebugValue(value, (status) => {})
```

**Params：**

*   value：判断的值；
    
*   callback：可选，这个函数只有在 Hook 被检查时才会调用，它接受 debug 值作为参数，并且会返回一个格式化的显示值。
    

**案例：**

```
function useFriendStatus(friendID) {  const [isOnline, setIsOnline] = useState(null);  // ...  // 在开发者工具中的这个 Hook 旁边显示标签    // e.g. "FriendStatus: Online"  useDebugValue(isOnline ? 'Online' : 'Offline');  return isOnline;}
```

11. useSyncExternalStore
------------------------

**useSyncExternalStore：** 会通过强制的同步状态更新，使得外部 `store` 可以支持并发读取。

**注意：** 这个 Hooks 并不是在日常开发中使用的，而是给第三方库 `redux`、`mobx` 使用的，因为在 React v18 中，主推的 Concurrent（并发）模式可能会出现状态不一致的问题（比如在 `react-redux 7.2.6` 的版本），所以官方给出 useSyncExternalStore 来解决此类问题。

简单地说，useSyncExternalStore 能够让 React 组件在 Concurrent 模式下安全、有效地读取外接数据源，在组件渲染过程中能够检测到变化，并且在数据源发生变化的时候，能够调度更新。

当读取到外部状态的变化，会触发强制更新，以此来保证结果的一致性。

**基本使用：**

```
const state = useSyncExternalStore(    subscribe,    getSnapshot,    getServerSnapshot)
```

**Params：**

*   subscribe：订阅函数，用于注册一个回调函数，当存储值发生更改时被调用。 此外，useSyncExternalStore 会通过带有记忆性的 getSnapshot 来判断数据是否发生变化，如果发生变化，那么会强制更新数据；
    
*   getSnapshot：返回当前存储值的函数。必须返回缓存的值。如果 getSnapshot 连续多次调用，则必须返回相同的确切值，除非中间有存储值更新；
    
*   getServerSnapshot：返回服务端（`hydration` 模式下）渲染期间使用的存储值的函数。
    

**Result：**

*   state：数据源，用于渲染 `UI 层`的数据源。
    

**案例：**

```
import { useSyncExternalStore } from "react";import { Button } from "antd";import { combineReducers, createStore } from "redux";const reducer = (state = 1, action) => {  switch (action.type) {    case "ADD":      return state + 1;    case "DEL":      return state - 1;    default:      return state;  }};/* 注册reducer,并创建store */const rootReducer = combineReducers({ count: reducer });const store = createStore(rootReducer, { count: 1 });const Index = () => {  //订阅  const state = useSyncExternalStore(    store.subscribe,    () => store.getState().count  );  return (    <>      <div>Hooks！</div>      <div>数据源： {state}</div>      <Button type="primary" onClick={() => store.dispatch({ type: "ADD" })}>        加1      </Button>      <Button        style={{ marginLeft: 8 }}        onClick={() => store.dispatch({ type: "DEL" })}      >        减1      </Button>    </>  );};export default Index;
```

当我们点击按钮后，会触发 store.subscribe（订阅函数），执行 getSnapshot 后得到新的 count，此时 count 发生变化，就会触发更新。

12. useTransition
-----------------

**useTransition：** 返回一个状态值表示过渡更新任务的等待状态，以及一个启动该过渡更新任务的函数。

> 问：什么是过渡更新任务？
> 
> 答：过渡任务是对比紧急更新任务所产生的。
> 
> 紧急更新任务指，输入框、按钮等任务需要在视图上立即做出响应，让用户立马能够看到效果的任务。
> 
> 但有时，更新任务不一定那么紧急，或者说需要去请求数据，导致新的状态不能够立马更新，需要一个 `loading...` 的状态，这类任务称为过渡任务。

我们再来举个比较常见的例子帮助理解紧急更新任务和过渡更新任务。

当我们有一个 `input` 输入框，这个输入框的值要维护一个很大列表（假设列表有 1w 条数据），比如说过滤、搜索等情况，这时有两种变化：

1.  input 框内的变化；
    
2.  根据 input 的值，1w 条数据的变化。
    

input 框内的变化是实时获取的，也就是受控的，此时的行为就是紧急更新任务。而这 1w 条数据的变化，就会有过滤、重新渲染的情况，此时这种行为被称为过渡更新任务。

**基本使用：**

```
const [isPending, startTransition] = useTransition();
```

**Result：**

*   isPending：布尔值，过渡状态的标志，为 true 时表示等待状态；
    
*   startTransition：可以将里面的任务变成过渡更新任务。
    

**案例：**

```
import { useState, useTransition } from "react";import { Input } from "antd";const Index = () => {  const [isPending, startTransition] = useTransition();  const [input, setInput] = useState("");  const [list, setList] = useState([]);  return (    <>      <div>Hooks！</div>      <Input        value={input}        onChange={(e) => {          setInput(e.target.value);          startTransition(() => {            const res = [];            for (let i = 0; i < 10000; i++) {              res.push(e.target.value);            }            setList(res);          });        }}      />      {isPending ? (        <div>加载中...</div>      ) : (        list.map((item, index) => <div key={index}>{item}</div>)      )}    </>  );};export default Index;
```

从上述的代码可以看到，我们通过 input 去维护了 1w 条数据，通过 isPending 的状态来控制是否展示完成。

13. useDeferredValue
--------------------

useDeferredValue：可以让状态滞后派生，与 useTransition 功能类似，推迟屏幕优先级不高的部分。

在一些场景中，渲染比较消耗性能，比如输入框。输入框的内容去调取后端服务，当用户连续输入的时候会不断地调取后端服务，其实很多的片段信息是无用的，这样会浪费服务资源， React 的响应式更新和 JS 单线程的特性也会导致其他渲染任务的卡顿。而 useDeferredValue 就是用来解决这个问题的。

> 问：useDeferredValue 和 useTransition 怎么这么相似，两者有什么异同点？
> 
> 答：useDeferredValue 和 useTransition 从本质上都是标记成了过渡更新任务，不同点在于 useDeferredValue 是将原值通过过渡任务得到新的值， 而 useTransition 是将紧急更新任务变为过渡任务。
> 
> 也就是说，useDeferredValue 用来处理数据本身，useTransition 用来处理更新函数。

**基本使用：**

```
const deferredValue = useDeferredValue(value);
```

**Params：**

*   value：接受一个可变的值，如`useState`所创建的值。
    

**Result：**

*   deferredValue：返回一个延迟状态的值。
    

**案例：**

```
import { useState, useDeferredValue } from "react";import { Input } from "antd";const getList = (key) => {  const arr = [];  for (let i = 0; i < 10000; i++) {    if (String(i).includes(key)) {      arr.push(<li key={i}>{i}</li>);    }  }  return arr;};const Index = () => {  //订阅  const [input, setInput] = useState("");  const deferredValue = useDeferredValue(input);  console.log("value：", input);  console.log("deferredValue：", deferredValue);  return (    <>      <div>Hooks！</div>      <Input value={input} onChange={(e) => setInput(e.target.value)} />      <div>        <ul>{deferredValue ? getList(deferredValue)}</ul>      </div>    </>  );};export default Index;
```

上述的功能类似于搜索，从 1w 个数中找到输入框内的数。

> 问：什么场景下使用`useDeferredValue` 和 `useTransition` ？
> 
> 答：通过上面的两个例子介绍我们知道，useDeferredValue 和 useTransition 实际上都是用来处理数据量大的数据，比如，百度输入框、散点图等，都可以使用。它们并不适用于少量数据。
> 
> 但在这里更加推荐使用 useTransition，因为 useTransition 的性能要高于 useDeferredValue，除非像一些第三方的 Hooks 库，里面没有暴露出更新的函数，而是直接返回值，这种情况下才去考虑使用 useDeferredValue。
> 
> 这两者可以说是一把双刃剑，在数据量大的时候使用会优化性能，而数据量低的时候反而会影响性能。

14. useInsertionEffect
----------------------

**useInsertionEffect：** 与 useEffect 一样，但它在所有 DOM 突变之前同步触发。

**注意：**

*   useInsertionEffect 应限于 css-in-js 库作者使用。在实际的项目中优先考虑使用 useEffect 或 useLayoutEffect 来替代；
    
*   这个钩子是为了解决 `CSS-in-JS` 在渲染中注入样式的性能问题而出现的，所以在我们日常的开发中并不会用到这个钩子，但我们要知道如何去使用它。
    

**基本使用：**

```
useInsertionEffect(callback,deps)
```

**案例：**

```
import { useInsertionEffect } from "react";const Index = () => {  useInsertionEffect(() => {    const style = document.createElement("style");    style.innerHTML = `      .css-in-js{        color: blue;      }    `;    document.head.appendChild(style);  }, []);  return (    <div>      <div class>，一起学Hooks吧！</div>    </div>  );};export default Index;
```

**执行顺序：** 在目前的版本中，React 官方共提供三种有关副作用的钩子，分别是 useEffect、useLayoutEffect 和 useInsertionEffect，我们一起来看看三者的执行顺序：

```
import { useEffect, useLayoutEffect, useInsertionEffect } from "react";const Index = () => {  useEffect(() => console.log("useEffect"), []);  useLayoutEffect(() => console.log("useLayoutEffect"), []);  useInsertionEffect(() => console.log("useInsertionEffect"), []);  return <div>，Hooks！</div>;};export default Index;
```

从效果上来看，可知三者的执行的顺序为：useInsertionEffect > useLayoutEffect > useEffect。

15. useId
---------

**useId：** 是一个用于生成横跨服务端和客户端的稳定的唯一 ID ，用于解决服务端与客户端产生 ID 不一致的问题，更重要的是保证了 React v18 的 `streaming renderer （流式渲染）`中 id 的稳定性。

这里我们简单介绍一下什么是 `streaming renderer`。

在之前的 React ssr 中，hydrate（ 与 render 相同，但作用于 ReactDOMServer 渲染的容器中 ）是整个渲染的，也就是说，无论当前模块有多大，都会一次性渲染，无法局部渲染。但这样就会有一个问题，如果这个模块过于庞大，请求数据量大，耗费时间长，这种效果并不是我们想要看到的。

于是在 React v18 上诞生出了 streaming renderer （流式渲染），也就是将整个模块进行拆分，让加载快的小模块先进行渲染，大的模块挂起，再逐步加载出大模块，就可以就解决上面的问题。

此时就有可能出现：服务端和客户端注册组件的顺序不一致的问题，所以 `useId` 就是为了解决此问题而诞生的，这样就保证了 `streaming renderer` 中 ID 的稳定性。

**基本使用：**

```
const id = useId();
```

**Result：**

*   id：生成一个服务端和客户端统一的`id`。
    

**案例：**

```
import { useId } from "react";const Index = () => {  const id = useId();  return <div id={id}>一起学Hooks吧！</div>;};export default Index;
```

三、自定义 hooks
===========

### 什么是自定义 hooks

自定义 hooks 是在`react-hooks`基础上的一个拓展，可以根据业务需要制定满足业务需要的 hooks，更注重的是逻辑单元。通过业务场景不同，我们到底需要`react-hooks`做什么，怎么样把一段逻辑封装起来，做到复用，这是自定义 hooks 产生的初衷。

### 如何设计一个自定义 hooks，设计规范

#### 逻辑 + 组件

hooks 专注的就是**逻辑复用**， 我们的项目，不仅仅停留在组件复用的层面上。hooks 让我们可以将一段通用的逻辑存封起来。将我们需要它的时候，开箱即用即可。

#### 1. 驱动条件

`hooks`本质上是一个函数。函数的执行，决定于无状态组件自身的执行上下文。每次函数的执行 (本质上就是组件的更新) 就是执行自定义`hooks`的执行，由此可见组件本身执行和 hooks 的执行如出一辙。

那么`prop`的修改,`useState,useReducer`使用是无状态组件更新条件，那么就是驱动 hooks 执行的条件。

#### 2. 通用模式

我们设计的自定义`react-hooks`应该是长的这样的。

```
const [ xxx , ... ] = useXXX(参数A,参数B...)
```

在我们在编写自定义 hooks 的时候，要**特别～特别**关注的是**传进去什么**，**返回什么**。 返回的东西是我们真正需要的。更像一个工厂，把原材料加工，最后返回我们。

#### 3. 条件限定

如果自定义 hooks 没有设计好，比如返回一个改变 state 的函数，但是没有加条件限定，就有可能造成不必要的上下文的执行，更有甚的是导致组件的循环渲染执行。

比如: 我们写一个非常简单 hooks 来**格式化数组将小写转成大写**。

```
import React , { useState } from 'react'/* 自定义hooks 用于格式化数组将小写转成大写 */function useFormatList(list){   return list.map(item=>{       return item.toUpperCase()   })}/* 父组件传过来的list = [ 'aaa' , 'bbb' , 'ccc'  ] */function index({ list }){   const [ number ,setNumber ] = useState(0)   const newList = useFormatList(list)   return <div>       <div class >          { newList.map(item=><div key={item} >{ item }</div>) }        </div>        <div class >            <div>{ number }</div>            <button onClick={()=> setNumber(number + 1) } >add</button>        </div>   </div>}export default index
```

上述问题，我们格式化父组件传递过来的`list`数组，并将小写变成大写，但是当我们点击`add`。 理想状态下数组不需要重新`format`，但是实际跟着执行`format`。无疑增加了性能开销。

**所以我们在设置自定义 hooks 的时候，一定要把条件限定 - 性能开销加进去。**

于是乎我们这样处理一下。

```
function useFormatList(list) {    return useMemo(() => list.map(item => {        return item.toUpperCase()    }), [])}
```

所以一个好用的自定义 hooks, 一定要配合`useMemo, useCallback` 等`api`一起使用。

第三方 hooks 库推荐：

ahooks 是由蚂蚁 umi 团队、淘系 ice 团队以及阿里体育团队共同建设的 React Hooks 工具库。ahooks 基于 React Hooks 的逻辑封装能力，提供了大量常见好用的 Hooks，可以极大降低代码复杂度，提升开发效率。

四、小结
====

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">hook 名称</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">功能</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useState</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">定义变量，使其具备类组件的 state, 让函数组件更新视图的能力</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useEffect</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">副作用，这个钩子成功弥补了函数式组件没有生命周期的缺陷</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useContext</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">上下文，类似于 Context, 其本意就是设置全局共享数据，使所有组件可跨层级实现共享</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useReducer</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">功能类似于 redux, 于 redux 最大的不同点是在于它是单个组件的状态管理，组件通讯还是要通过 props, 是一种 useState 的升级版，处理复杂的 state 变化</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useMemo</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">理念与 memo 相同，都是判断是否满足当前的限定条件来决定是否执行 callback 函数</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useCallback</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">与 useMemo 类似，甚至可以说一模一样，唯一不同的点在于，useMemo 返回的是值，而 useCallback 返回的函数</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useRef</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">用于获取当前元素的所有属性，除此之外，还有一个高级用法：缓存数据</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useImperativeHandle</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">可以通过 ref 或 forwardRef 暴露给父组件的实例值，所谓的实例值是指值和函数</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useLayoutEffect</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">与 useEffect 基本一致，不同点在于它是同步执行的</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useDebugValue</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">可用于在 React 开发者工具中显示自定义 hook 的标签。这个 hooks 目的就是检查自定义 hooks</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useSyncExternalStore</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">会通过强制的同步状态更新，使得外部 store 可以支持并发读取</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useTransition</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">返回一个状态值表示过渡更新任务的等待状态，以及一个启动该过渡更新任务的函数</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useDeferredValue</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">可以让状态滞后派生，与<code>useTransition</code> 类似，允许用户推迟屏幕更新优先级不分高低</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useInsertionEffect</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">与 useEffect 一样，但它在所有 DOM 突变之前同步触发</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useId</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">一个用于生成横跨服务端和客户端的稳定的唯一 ID, 用于解决了服务端与客户端产生 ID 不一致的问题</td></tr></tbody></table>

参考链接：

*   https://mp.weixin.qq.com/s/TovRZ-SsUaeLplCVSvhnpg
    
*   https://juejin.cn/post/6890738145671938062?searchId=20231102205318349AE1907161FD35C254
    
*   https://juejin.cn/post/6944863057000529933?searchId=20231102211152FB4D52BD86A7BA3B6CDE
    
*   https://juejin.cn/post/7236158655128125498