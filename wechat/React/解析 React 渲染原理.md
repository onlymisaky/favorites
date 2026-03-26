> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gKu_LsHvAYnXIw018q8SLg)

> 本文作者为 360 奇舞团前端开发工程师

简介
--

当我们使用 React 框架编写代码时，无论是组件的更新、状态的改变，还是父子组件之间的交互，都会涉及到 React 的渲染流程。你可能会有以下疑问：

*   组件渲染的具体流程是什么？
    
*   引起组件重新渲染的因素有哪些？
    
*   React.memo、useMemo 和 useCallback 等优化手段的原理是什么？如何合理使用它们？
    

带着这些疑问，让我们开始探索 React 的渲染过程吧。

一、渲染过程
------

### 初次渲染

首先，我们定义一个函数组件：

```
function Home() {  return (    <>      <h1>Home</h1>      <p>这是一个函数组件</p>    </>  );}export default Home;
```

当页面初次渲染时，React 会先创建一个根节点，用来绑定组件：

```
const root = createRoot(document.getElementById('root'))
```

接下来，会使用 root 函数渲染具体的组件：

```
root.render(<App />)
```

由于我在`App`组件中引入了`Home`组件，React 调用 Home 函数，得到这段 JSX:

```
<>
  <h1>Home</h1>
  <p>这是一个函数组件</p>
</>
```

React 会把 JSX 转换为虚拟 DOM，用 JavaScript 对象的方式描述 DOM 元素，具体如下：

```
{  type: React.Fragment,  props: {    children: [      { type: "h1", props: { children: "Home" } },      { type: "p", props: { children: "这是一个函数组件" } }    ]  },}
```

首次渲染时，React 会将虚拟 DOM 转换为真实 DOM，最终得到结果：

```
<div id="root">  <h1>Home</h1>  <p>这是一个函数组件</p></div>
```

#### 1. 为什么 Home 组件的元素要放在 <></> 里？

Home 组件是用 JSX 编写的，浏览器无法直接识别。React 的构建工具（例如 Babel 或者 Vite）会把 JSX 编译为 JavaScript 代码。如果我把 Home 组件的代码改为：

```
function Home() {  return (      <h1>Home</h1>      <p>这是一个函数组件</p>  );}
```

运行代码，就会产生报错：Adjacent JSX elements must be wrapped in an enclosing tag.

因为编译结果是：

```
function Home() {  return (    React.createElement("h1", null, "Home"),    React.createElement("p", null, "这是一个函数组件")  );}
```

而在 JS 中，函数只能返回一个值。所以如果要在一个组件中渲染多个元素，需要把它们放在一个公共的容器中。

### 更新渲染

React 的运行机制可以用一个函数表示：`view = f(state)` ，`view`表示页面，`state`表示数据。在初次渲染后，state 更新会引起组件的重新渲染，并且只有 state 可以引发重新渲染。当一个组件重新渲染时，它的所有子组件也会重新渲染。例如下面这段代码：

```
import { useState } from 'react'function Content(props: { num: number }) {  console.log('Content组件渲染')  const { num } = props  return <div>{num}</div>}function Home() {  console.log('Home组件渲染')  const [num, setNum] = useState(0)  return (    <>      <Content num={num} />      <button onClick={() => setNum(num + 1)}>修改</button>    </>  )}function App() {  return (    <>      <Home />    </>  )}export default App
```

当我点击 Home 组件中的按钮时，num 的状态会发生改变，从而使得 Home 组件重新渲染，观察控制台，发现它的子组件 Content 也渲染了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoTCWt8iaxXIg2ZehzCYUNSzwduzW4AwKdibVZrlbvAiacTa4brgoPm3frzQ/640?wx_fmt=gif&from=appmsg)图 1

#### 1. 父组件的重新渲染，为什么会引起子组件的渲染？

通过示例代码，我们可以观察到，当 Home 组件的 state 被修改后，也引发了 Content 组件的重新渲染。是因为 Content 的 props 变化引起的吗？我们可以给 Home 组件添加一个不使用 props 的子组件，以验证这个结论是否正确。

```
import { useState } from 'react'function Content(props: { num: number }) {  console.log('Content组件渲染')  const { num } = props  return <div>{num}</div>}function Test() {  console.log('Test组件渲染')  return <div>Test</div>}function Home() {  console.log('Home组件渲染')  const [num, setNum] = useState(0)  return (    <>      <Content num={num} />      <Test />      <button onClick={() => setNum(num + 1)}>修改</button>    </>  )}function App() {  return (    <>      <Home />    </>  )}export default App
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoTPiawBfUWnm5BmEqNfEF68iaT1xg4JgicDQD2L1u4wic1qZgjmEdwnXtp4A/640?wx_fmt=gif&from=appmsg)图 2

可以看出，子组件的重新渲染与是否使用 props 无关。那么问题来了，Test 组件的数据并没有改变，为什么还要重新渲染它呢？因为 React 无法保证 Test 组件是否使用了变化的 state。例如 Test 组件使用了一个随机数，这种情况下，即使 Test 组件没有使用 props，也需要重新渲染。

```
function Test() {  console.log('Test组件渲染')  const randomNumber = Math.random();   return (    <>      <div>Test</div>      <div>随机数：{randomNumber}</div>    </>  )}
```

二、如何避免不必要的渲染？
-------------

### 1. React.memo

如果我们想优化应用，只让 props 值变化的组件重新渲染，可以使用 React.memo 。具体用法如下：

```
const MemoizedComponent = React.memo(Test);
```

当把 Test 组件用`React.memo`包裹后，相当于开启了 React 的记忆功能。React 在初次渲染后会记住当前组件的返回值，当父组件重新渲染时，如果传递过来的 props 值没有改变，该组件就无需重新渲染。

重新运行代码，会发现 Test 组件不会重新渲染了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoT6qmgnt1p8hxhM3euD21GkhyOCyXmOMkb5WvrxPdbwpkiaWWqCwk4tPQ/640?wx_fmt=gif&from=appmsg)图 3

你可能会想，为什么要手动开启 React 的记忆功能呢？默认只更新 props 改变的子组件，岂不是更有利于网站的性能？

需要说明的是，当我们使用 Reac.memo 后，React 每次渲染前，都会比较 props 值是否发生了变化，假设一个父组件拥有许多子组件，那么在每次渲染该组件时，要单独对比每个子组件的 props 值是否更新。此外，React 还需记住每个组件的返回值。因此，虽然节省了重新渲染的开销，但在无形中也增加了许多负担。所以 React 并没有默认开启这一策略。

### 2. useMemo 和 useCallback

我们再看一段示例代码：

```
import { useState } from "react";import React from "react";function Home(props: { arr: string[] }) {  console.log("Home组件渲染");  const { arr } = props;  return (    <>      <h1>home</h1>      <ul>        {arr.map((item, index) => (          <li key={index}>{item}</li>        ))}      </ul>    </>  );}const MemoizedHome = React.memo(Home);function App() {  console.log("App组件渲染");  const arr = ['one', 'two', 'three', 'four', 'five'];  const [num, setNum] = useState(0);  return (    <>      <MemoizedHome arr={arr} />      <div>{num}</div>      <button onClick={() => setNum(num + 1)}>修改数字</button>    </>  );}export default App;
```

在这段代码中，使用`React.memo()`缓存了`Home`组件的返回值，该组件通过 props 接收了一个从父组件传递过来的数组。当我们点击按钮，修改 num 的值后，按道理 Home 不会重新渲染。但结果却是：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoTAu1LEg1tlR7NqReMVISrT1b6Tl5PnldYKLVZRibWka438uEHibenKF8w/640?wx_fmt=gif&from=appmsg)图 4

为什么`React.memo()`失效了呢？我们先来看一段 JavaScript 代码：

```
function createArr() {  const arr = ["one", "two", "three", "four", "five"];  return arr;}let res1 = createArr();let res2 = createArr();console.log(res1 === res2); // false
```

可以看出同一个函数返回的数组并不相同。因为使用`===`比较 2 个对象时，对比的并不是它们的值，而是引用地址。每当我们调用`createArr`函数时，都会创建一个新的数组实例，这个数组会被分配到不同的内存地址。即使这些数组的值完全相同，它们仍然是不同的对象。

而 React 中的组件本质上是一个 JavaScript 函数，当渲染组件时，其实是在调用函数，因此在组件中定义的所有东西都会被重新创建一遍。回到示例代码，每当 App 组件重新渲染时，都会创建一个新的数组，Home 组件从 props 拿到的也是新数据，所以它才会重新刷新。为了避免 Home 组件无谓的渲染，我们可以使用`useMemo`来避免该问题。

#### useMemo

在下面的代码中，我把数组用`useMemo`包裹了起来：

```
function App() {  console.log("App组件渲染");  const arr = useMemo(() => ["one", "two", "three", "four", "five"], []);  const [num, setNum] = useState(0);  return (    <>      <MemoizedHome arr={arr} />      <div>{num}</div>      <button onClick={() => setNum(num + 1)}>修改数字</button>    </>  );}export default App;
```

再次点击按钮，发现 Home 组件不会重新渲染了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoTfqOZxHafE7nnJUS2ePFuyEmXInUA4aZg72vsdh3a9HbFfAmZiay2cgA/640?wx_fmt=gif&from=appmsg)图 5

`useMemo`可以接受 2 个参数，第 1 个参数是函数，第 2 个参数是一个依赖项数组，在组件首次渲染时，React 会把 useMemo 的返回值记录下来，此后在组件重新渲染时，都会使用之前记录的返回值，除非依赖项发生变化。

#### useCallback

与`useMemo`功能类似的一个 Hook 是`useCallback`，它可以用来缓存函数。在组件中，我们会定义许多函数，有时需要把某些函数传递给子组件，如果不对函数进行缓存，也可能导致子组件进行无谓的重新渲染。因为子组件在比较传递过来的函数时，也是通过比较引用地址的。

```
import { useState } from "react";import React from "react";function Home(props: { onClick: () => void }) {  console.log("Home组件渲染");  const { onClick } = props;  return (    <>      <button style={{ marginTop: "10px" }} onClick={onClick}>        点击      </button>    </>  );}const MemoizedHome = React.memo(Home);function App() {  console.log("App组件渲染");  const [count, setCount] = useState(0);  const handleClick = () => {    console.log("点击按钮了");  }  return (    <div>      <div>        <p>Count: {count}</p>        <button onClick={() => setCount(count + 1)}>增加</button>      </div>      <MemoizedHome onClick={handleClick} />    </div>  );}export default App
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoTib7EFHz92XxbVunsianrdbZcwAicY0KX4B2UwpvJTkJtb3Bzz0HHL5oxg/640?wx_fmt=gif&from=appmsg)图 6

通过把传递给子组件的函数缓存到`useCallback`中，可以避免子组件的频繁渲染。

```
function App() {  console.log("App组件渲染");  const [count, setCount] = useState(0);  const handleClick = useCallback(() => {    console.log("点击按钮了");  }, []);  return (    <div>      <div>        <p>Count: {count}</p>        <button onClick={() => setCount(count + 1)}>增加</button>      </div>      <MemoizedHome onClick={handleClick} />    </div>  );}export default App
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEBq2CdxTTEA2rxzx4iagHJoTp0FHDD0T5wUVeE5XZ3D9lBkdicKYANa1Uy0qL6Q1FWaoPwoylX75PiaA/640?wx_fmt=gif&from=appmsg)图 7

#### 何时使用这两个 hooks？

`useMemo` 常用于缓存复杂计算的结果，以避免重复计算；`useCallback` 用于缓存函数实例，适合在将回调函数传递给子组件时使用，以避免子组件的无意义渲染。在平时开发中，不需要把每一个对象或函数都用这些 hooks 包裹，因为 React 本身有很多优化措施。当网站性能出现问题，或者子组件渲染过多时，可以考虑使用这些 hooks 进行优化。

总结
--

React 在渲染组件时，首先会执行函数组件，生成一个虚拟 DOM 树，以描述组件的结构；接着会将其与旧的虚拟 DOM 树对比，找到需要更新的部分，修改页面。只有 state 的改变会引起组件的重新渲染，并且它的所有子组件也会重新渲染。如果想优化这一过程，可以使用`React.memo`，`useMemo`或者`useCallback`，这 3 种方法分别对应不同的场景。深入理解 React 的渲染原理，有助于我们快速定位性能瓶颈，解决复杂场景中的问题。

- END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

 ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)