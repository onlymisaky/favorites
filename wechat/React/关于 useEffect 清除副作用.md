> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_SrKv_k1UethNThEpUiZmQ)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibqtzdmRRTD6Fibm7Ir3USoGSsGhORUJbzdicsF3j5Wl9cM5J459J67aGZAql8POCibVP4wehvE4IVzg/640?wx_fmt=png)

交代背景
----

一切起因皆是因为下面这段代码而起，大家可以先上个眼，后面会细说，线上地址戳 👉 `codesandbox` (https://codesandbox.io/s/useeffectzhi-nan-krlz2v?file=/src/App.js)

`import React, { useState, useEffect } from 'react'  
function Article({ id }) {  
  const [article, setArticle] = useState(null)  
    
  useEffect(() => {  
    let didCancel = false  
    console.log('effect', didCancel)  
    async function fetchData() {  
      console.log('setArticle begin', didCancel)  
      new Promise((resolve) => {  
        setTimeout(() => {  
          resolve(id)  
        }, id);  
      }).then(article => {  
        // 快速点击 Add id 的 button，这里 didCancel 为什么会打印 true  
        console.log('setArticle end', didCancel, article)  
        // if (!didCancel) { // 把这一行代码注释就会出现错误覆盖状态值的情况  
          setArticle(article)  
        // }  
      })  
    }  
    console.log('fetchData begin', didCancel)  
    fetchData()  
    console.log('fetchData end', didCancel)  
    return () => {  
      didCancel = true  
      console.log('clear', didCancel)  
    }  
  }, [id])  
  return <div>{article}</div>  
}  
function App() {  
  const [id, setId] = useState(5000)  
  function handleClick() {  
    setId(id-1000)  
  }  
  return (  
    <>  
      <button onClick={handleClick}>add id</button>  
      <Article id={id}/>  
    </>  
  );  
}  
export default App;  
`

关键代码是在 useEffect 中通过清除副作用函数来修改 didCancel 的值，再根据 didCancel 的值来判断是否立马执行 setState 的操作，其实就是为了解决 `竞态` 的情况。

> 竞态，就是在混合了 async/await 和自顶向下数据流的代码中（props 和 state 可能会在 async 函数调用过程中发生改变），出现错误覆盖状态值的情况

例如上面的例子，我们快速点击两次 button 后，在页面上我们会先看到 `3000` ，再看到 `4000` 的结果，这就是因为状态为 `4000` 的先执行，但是更晚返回，所以会覆盖上一次的状态，所以我们最后看到的是 `4000` 。

接下来，我们先看两个前菜，`纯函数`和`副作用`

前菜一：纯函数
-------

在程序设计中，若一个函数符合以下要求，则它可以被认为是纯函数：

*   此函数在相同的输入值时，需产生相同的输出。函数的`输出`和输入值以外的其他隐藏信息或状态无关
    
*   此函数不能有语义上可观察的函数`副作用`
    

例如如下函数，接收两个入参，并且返回两个入参之和的值，并且没有使用外部的信息或状态

```
function add(a,b) {  const total = a + b  return total}console.log(add(1, 3))
```

再看另外一个例子：

```
let a = 2function add(b) {  const total = a + b  return total}console.log(add(1, 3))
```

上面这个函数也不是纯函数，因为`a`的值可能在外部被改变，从而导致`add`函数的返回值不一样。

前菜二：副作用
-------

副作用指的是函数在执行过程中，除了返回可能的函数值之外，还对主调用函数产生附加的影响。

例如：修改了全局变量、修改了传入的参数、甚至是 console.log()， ajax 操作，直接修改 DOM，计时器函数，其他异步操作，其他会对外部产生影响的操作都是算作副作用。

```
let a = 2function add() {  a = 3}console.log(add())
```

我们运行上面的`add`函数，外部的变量`a`的值发生了改变，这就产生了副作用

> Tips：console.log 也被称为副作用是因为它们会向控制台打印日志，控制台存在于函数外部

主菜：useEffect 清除副作用函数
--------------------

### 什么时候执行清除函数

我们知道，如果在 useEffect 函数中返回一个函数，这个函数就是`清除副作用函数`，它会在组件销毁的时候执行，但是其实，它会在组件每次重新渲染时执行，并且先执行清除上一个 effect 的副作用。

思考下面的代码：

```
useEffect(() => {  ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);  return () => {    ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);  };});
```

假如第一次渲染的时候 props 是 {id: 10}，第二次渲染的时候是 { id: 20 }。你可能会认为发生了下面这些事：

*   React 清除了 `{id: 10}`的 effect
    
*   React 渲染`{id: 20}`的 UI
    
*   React 运行`{id: 20}`的 effect
    

（事实并不是这样）

React 只会在`浏览器绘制`后运行 effects。这使得你的应用更流畅因为大多数 effects 并不会阻塞屏幕的更新。Effect 的清除同样被延迟了，上一次的 effect 会在重新渲染后被清除：

*   React 渲染`{id: 20}`的 UI
    
*   浏览器绘制，在屏幕上看到`{id: 20}`的 UI
    
*   React 清除`{id: 10}`的 effect
    
*   React 运行`{id: 20}`的 effect
    

这里就会出现让大家迷惑的点，如果清除上一次的 effect 发生在 props 变成`{id: 20}`之后，那它为什么还能拿到旧的`{id: 10}`

> 因为 React 组件内的每一个函数（包括事件处理函数，effects，定时器或者 API 调用等等）会捕获定义它们的那次渲染中的 props 和 state

所以，effect 的清除并不会读取最新的 props，它只能读取到定义它的那次渲染中的 props 值

### 什么时候需要使用清除函数

假如我们有一个 React 组件来获取和展示数据。如果我们的组件在我们的 Promise 解决之前卸载，useEffect 将尝试更新状态（在卸载的组件上）并发送如下所示的错误：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibqtzdmRRTD6Fibm7Ir3USoGicjianbUbOd1L3Z3tcSicQCmxw5tlwf66btu7FrmHqnfaDaEgfW6DVTVQ/640?wx_fmt=png)

Warning Error  

比如这个例子：

```
import React, { useState, useEffect } from 'react'function Child() {  const [state, setState] = useState(null)  const onClick = () => setState('foo')   useEffect(() => {    setTimeout(() => {      setState('foo123')    }, 5000);  }, [state])  return (    <>      {        state      }      <button onClick={onClick}> child Change </button>    </>  );}function App() {  const [status, setStatus] = useState(false)  return (    <>      <button onClick={() => setStatus(!status)}> toggle </button>      {        status && <Child />      }    </>  );}export default App;
```

先点击`toggle`按钮让`child`组件显示，再点击`child change`按钮，然后立马点击`toggle`按钮让`child`组件销毁，等待几秒后就会报上述的错误了。为了修复这个错误，我们需要使用清理功能来解决它。

清除函数通常用于`取消所有订阅`以及`取消获取请求`。

回到最开始的 🌰
---------

### 分析

回到我们最开始的例子，把注释掉的代码放开，就有了下面的分析。

第一次渲染后

```
function Article() {  ...  useEffect(() => {    let didCancel = false    async function fetchData() {      new Promise((resolve) => {        setTimeout(() => {          resolve(id)        }, id);      }).then(article => {        if (!didCancel) {          setArticle(article)        }      })    }    fetchData()  }, [5000])  return () => {    // 清除本次渲染副作用，给它编号 NO1，这里有个隐藏信息，此时这个函数内，还未执行前 didCancel = false    didCancel = true  }}// 等待 5s 后，页面显示 5000，
```

可以在`console.log('setArticle end', didCancel, article)`这行代码上打上断点，我们可以更直观的分析接下来的操作 👉 快速点击两次`button`

```
/**    第一次点击，在页面绘制完成后，执行 useEffect    首先执行上一次的清除函数，即函数 NO1，NO1 将上一次 effect 闭包内的 didCancel 设置为了 true*/function Article() {  ...  useEffect(() => {    let didCancel = false    async function fetchData() {      new Promise((resolve) => {        setTimeout(() => { // setTimeout1          resolve(id)        }, id);      }).then(article => {        if (!didCancel) {          setArticle(article)        }      })    }    fetchData()  }, [4000])  return () => {    // 清除本次渲染副作用，给它编号 NO2，这里有个隐藏信息，此时这个函数内作用域中的 didCancel = false    didCancel = true  }}
```

从`DevTools`中可以看到：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibqtzdmRRTD6Fibm7Ir3USoGhw9El1sH2wHPlnCdGiaXnIMOBAIcSvBqvY9ibP4vtkbqqZps7DHdm3vA/640?wx_fmt=png)image.png

```
/**    第二次点击，在页面绘制完成后，执行 useEffect    首先执行上一次的清除函数，即函数 NO2，NO2 将上一次 effect 闭包内的 didCancel 设置为了 true*/function Article() {  ...  useEffect(() => {    let didCancel = false    async function fetchData() {      new Promise((resolve) => {        setTimeout(() => { // setTimeout2          resolve(id)        }, id);      }).then(article => {        if (!didCancel) {          setArticle(article)        }      })    }    fetchData()  }, [3000])  return () => {    // 清除本次渲染副作用，给它编号 NO3，这里有个隐藏信息，此时这个函数内作用域中的 didCancel = false    didCancel = true  }}
```

从`DevTools`中可以看到：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibqtzdmRRTD6Fibm7Ir3USoGNSo9MMxgD7BiaOX0gF7R0Sm2ccQ6mHkvx0WOHvfuGPQp54VibzwQW8rQ/640?wx_fmt=png)image.png

### 结论

第二次点击后，setTimeout2 先执行完，此时 didCancel 值为 false，所以会执行`setArticle`的操作，页面展示`3000`，为什么这里的 didCancel 为 false 呢，因为此时 NO2 的清除函数没有执行，它会在组件下一次重新渲染，或者组件卸载时执行。

再等待差不多 1s 后，setTimeout2 执行完，此时 didCancel 的值被 NO2 的清除函数设置为了 true，所以它不会执行`setArticle`的操作。这样就不会出现，先看到`4000`然后再变成`3000`的情况。

### 解决竞态的方法

#### 自定义 Hook

我们可以把上面通过维护一个布尔值来解决`竞态`的方式，写成一个自定义 Hook

```
// custom hookfunction useRaceConditions(fetchFn, deps) {  useEffect(() => {    let isCurrent = true    const cleanEffect = fetchFn(() => isCurrent)    return () => {      isCurrent = !isCurrent      // 如果 fetchFn 返回了函数，则在清除时执行      cleanEffect && cleanEffect()    }  }, deps)}// 上面的 Demo 代码就可以改成function Article({ id }) {  const [article, setArticle] = useState(null)    useRaceConditions((isCurrent) => {    async function fetchData() {      new Promise((resolve) => {        setTimeout(() => {          resolve(id)        }, id);      }).then(article => {        if (isCurrent()) {          setArticle(article)        }      })    }    fetchData()  }, [id])  return <div>{article}</div>}
```

#### AbortController

`AbortController`接口表示一个控制器对象，允许你根据需求中止一个或多个 Web 请求。`AbortController.abort()`能够中止`fetch`请求及任何响应体的消费和流。

我们先使用`AbortController`构造函数创建一个控制器，然后使用`AbortController.signal`熟悉获取其关联`AbortSignal`对象的引用。

当一个`fetch reuqest`初始化，我们把`AbortSignal`作为一个选项传递到请求对象，这将`signal`和`controller`与这个`fetch request`相关联，然后允许我们通过调用`AbortController.abort()`中止请求

```
function Article({ id }) {  const [article, setArticle] = useState(null)    useEffect(() => {    const controller = new AbortController()    let signal = controller.signal    async function fetchData() {      try {        const response = await fetch('https://autumnfish.cn/search?keywords=%E5%AD%A4%E5%8B%87%E8%80%85', {signal})        const newData = await response.json()        setArticle(id)      } catch (error) {        if (error.name === 'AbortError') {          console.log('Handling error thrown by aborting request')        }      }    }    fetchData()    return () => {      controller.abort()    }  }, [id])  return <div>{article}</div>}
```

#### Axios  CancelToken

axios 中使用 cancel token 取消请求。可以使用`CancelToken.source`工厂方法创建`cancel token`

```
function Article({ id }) {  const [article, setArticle] = useState(null)    useEffect(() => {    const CancelToken = axios.CancelToken    const source = CancelToken.source()    async function fetchData() {      try {        await axios.get('https://autumnfish.cn/search?keywords=%E5%AD%A4%E5%8B%87%E8%80%85', {          cancelToken: source.token        })        setArticle(id)      } catch (error) {        if (axios.isCancel(error)) {          console.log('Request canceled', error.message)        } else {          console.log('其他错误')        }      }    }    fetchData()    return () => {      source.cancel()    }  }, [id])  return <div>{article}</div>}
```

甜品：useEffect 请求数据的方式
--------------------

### 使用 async/await 获取数据

```
// 有同学想在组件挂在时请求初始化数据，可能就会用下面的写法function App() {    const [data, setData] = useState()    useEffect(async () => {        const result = await axios('/api/getData')                setData(result.data)    })}
```

但是我们会发现，在控制台中有警告信息：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibqtzdmRRTD6Fibm7Ir3USoGnxeMnuiaDVmibiaf1h3JmJ2CosIsbcYhRytBedy9AdDRPmfZM9M4VoYUw/640?wx_fmt=png)image.png

意思就是在 useEffect 中不能直接使用 async，因为 async 函数声明定义一个异步函数，该函数默认会返回一个隐式 Promise，但是，在 effect hook 中我们应该不返回任何内容或者返回一个清除函数。所以我们可以改成下面这样

```
function App() {    const [data, setData] = useState()    useEffect(() => {        const fetchData = async () => {          const result = await axios(            '/api/getData',          );          setData(result.data);        };        fetchData();    })}
```

### 准确告诉 React 你的依赖项

```
function Greeting({ name }) {  const [counter, setCounter] = useState(0);  useEffect(() => {    document.title = 'Hello, ' + name;  });  return (    <h1 class>      Hello, {name}      <button onClick={() => setCounter(counter + 1)}>Increment</button>    </h1>  );}
```

我们每次点击 button 使 counter+1 的时候，effect hook 都会执行，这是没必要的，我们可以将`name`加到 effect 的依赖数组中，相当于告诉 React，当我`name`的值变化时，你帮我执行 effect 中的函数。

如果我们在依赖中添加所有 effect 中用到的组件内的值，有时效果也不太理想。比如：

```
useEffect(() => {    const id = setInterval(() => {        setCount(count+1)    }, 1000)    return () => clearInterval(id)}, [count])
```

虽然，每次 count 变化时会触发 effect 执行，但是每次执行时定时器会重新创建，效果不是最理想。我们添加`count`依赖，是因在`setCount`调用中用到了`count`，其他地方并没有用到`count`，所以我们可以将`setCount`的调用改成函数形式，让`setCount`在每次定时器更新时，自己就能拿到当前的`count`值。所以在 effect 依赖数组中，我们可以踢掉`count`

```
useEffect(() => {    const id = setInterval(() => {        setCount(count => count+1)    }, 1000)    return () => clearInterval(id)}, [])
```

### 解耦来自 Actions 的更新

我们修改上面的例子让它包含两个状态：`count`和`step`

```
function Counter() {  const [count, setCount] = useState(0);  const [step, setStep] = useState(1);  useEffect(() => {    const id = setInterval(() => {      setCount(c => c + step);        }, 1000);    return () => clearInterval(id);  }, [step]);  return (    <>      <h1>{count}</h1>      <input value={step} onChange={e => setStep(Number(e.target.value))} />    </>  );}
```

此时，我们修改`step`又会重启定时器，因为它是依赖性之一。假如我们不想在`step`改变后重启定时器呢，该如何从 effect 中移除对`step`的依赖。

当你想更新一个状态，并且这个状态更新依赖于另一个状态的时候，在例子中就是`count`依赖`step`，我们可以用`useReducer`去替换它们

```
function Counter() {  const [state, dispatch] = useReducer(reducer, initState)  const { count, step } = state    const initState = {      count: 0,      step: 1  }    function reducer(state, action) {      const { count, step } = state      switch (action.type) {          case 'tick':              return { count: count + step, step }          case 'step':              return { count, step: action.step }          default:              throw new Error()      }  }  useEffect(() => {    const id = setInterval(() => {      dispatch({ type: 'tick' })       }, 1000);    return () => clearInterval(id);  }, [dispatch]);    return (    <>      <h1>{count}</h1>      <input value={step} onChange={e => setStep(Number(e.target.value))} />    </>  );}
```

上面代码中将`dispatch`作为 effect 依赖不会每次都触发 effect 的执行，因为 React 会保证`dispatch`在组件的声明周期内保持不变，所以不会重新创建定时器。

> 你可以从依赖中去除`dispatch`，`setState`，`useRef`包裹的值，因为 React 会确保它们是静态的

相比于直接在 effect 里面读取状态，它`dispatch`了一个`action`来描述发生了什么，这使得我们的 effect 和 step 状态解耦。我们的 effect 不再关心怎么更新状态，它只负责告诉我们发生了什么。更新的逻辑全都交由`reducer`去统一处理

> 当你 dispatch 的时候，React 只是记住了 action，它会在下一次渲染中再次调用 reducer，所以 reducer 可以访问到组件中最新的`props`

总结
--

本文从一段实例代码为切入点，引入`useEffect`清除函数，介绍了它的执行顺序，以及为什么需要清除函数，由此分析了实例代码中的解决竞态的方法，最后讨论`useEffect`种常见请求数据的方法。

主要是想帮助大家重新理解和认识`useEffect`，以及在`useEffect`中请求数据需要注意的地方，如上述内容有错误，请不吝指出。

  

参考链接
----

https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController

https://zh.wikipedia.org/wiki/%E7%BA%AF%E5%87%BD%E6%95%B0

https://zh.wikipedia.org/wiki/%E5%89%AF%E4%BD%9C%E7%94%A8_(%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%A7%91%E5%AD%A6)

https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/