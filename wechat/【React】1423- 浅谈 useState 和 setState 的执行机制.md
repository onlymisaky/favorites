> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sIrsRViBEOWt247RUyk6rA)

React 中的 useState 和 setState 的执行机制
==================================

`useState` 和 `setState` 在`React`开发过程中 使用很频繁，但很多人都停留在简单的使用阶段，并没有正在了解它们的执行机制，例如：**「它们是同步的还是异步的？」** 正因为没有理解它们，才致使开发过程中会碰到一些出乎意料的 bug。本文将带大家了解它们的特性。

**「它们是同步的还是异步的？」**

`setState`和 `useState` 只在**「合成事件」**如`onClick`等和**「钩子函数」**包括`componentDidMount`、`useEffect`等中是 “异步” 的，在原生事件和 `setTimeout`、`Promise.resolve().then` 中都是同步的。

这里的 “异步” 并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是**「合成事件」**和**「钩子函数」**的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形式了所谓的 “异步”。

**「批量更新优化」**也是建立在 “异步”（合成事件、钩子函数）之上的，在原生事件和`setTimeout`、`Promise.resolve().then` 中不会批量更新，在 “异步” 中如果对同一个值进行多次修改，批量更新策略会对其进行覆盖，取最后一次的执行, 类似于`Object.assin`的机制，如果是同时修改多个不同的变量的值，比如改变了 a 的值又改变了 b 的值，在更新时会对其进行合并批量更新，结果只会产生一次`render`。

假如在一个**「合成事件」**中，循环调用了`setState`方法`n`次，如果 React 没有优化，当前组件就要被渲染`n`次，这对性能来说是很大的浪费。所以，React 为了性能原因，对调用多次`setState`方法合并为一个来执行。当执行`setState`的时候，`state`中的数据并不会马上更新。

光怎么说肯定不容易理解，我们来通过几个案例来说明吧。

**「同步和异步情况下，连续执行两个 useState」** 示例

```
function Component() {  const [a, setA] = useState(1)  const [b, setB] = useState('b')  console.log('render')  function handleClickWithPromise() {    Promise.resolve().then(() => {      setA((a) => a + 1)      setB('bb')    })  }  function handleClickWithoutPromise() {    setA((a) => a + 1)    setB('bb')  }  return (    <Fragment>      <button onClick={handleClickWithPromise}>        {a}-{b} 异步执行      </button>      <button onClick={handleClickWithoutPromise}>        {a}-{b} 同步执行      </button>    </Fragment>  )}
```

**「同步和异步情况下，连续执行两个 useState」** 示例

```
function Component() {  const [a, setA] = useState(1)  const [b, setB] = useState('b')  console.log('render')  function handleClickWithPromise() {    Promise.resolve().then(() => {      setA((a) => a + 1)      setB('bb')    })  }  function handleClickWithoutPromise() {    setA((a) => a + 1)    setB('bb')  }  return (    <Fragment>      <button onClick={handleClickWithPromise}>        {a}-{b} 异步执行      </button>      <button onClick={handleClickWithoutPromise}>        {a}-{b} 同步执行      </button>    </Fragment>  )}
```

*   当点击`同步执行`按钮时，只重新 `render` 了一次
    
*   当点击`异步执行`按钮时，`render` 了两次
    

**「同步和异步情况下，连续执行两次同一个 useState」** 示例

```
function Component() {  const [a, setA] = useState(1)  console.log('a', a)  function handleClickWithPromise() {    Promise.resolve().then(() => {      setA((a) => a + 1)      setA((a) => a + 1)    })  }  function handleClickWithoutPromise() {    setA((a) => a + 1)    setA((a) => a + 1)  }  return (    <Fragment>      <button onClick={handleClickWithPromise}>{a} 异步执行</button>      <button onClick={handleClickWithoutPromise}>{a} 同步执行</button>    </Fragment>  )}
```

*   当点击`同步执行`按钮时，两次 `setA` 都执行，但合并 `render` 了一次，打印 3
    
*   当点击`异步执行`按钮时，两次 `setA` 各自 `render` 一次，分别打印 2，3
    

**「同步和异步情况下，连续执行两个 setState」** 示例

```
class Component extends React.Component {  constructor(props) {    super(props)    this.state = {      a: 1,      b: 'b',    }  }  handleClickWithPromise = () => {    Promise.resolve().then(() => {      this.setState({...this.state, a: 'aa'})      this.setState({...this.state, b: 'bb'})    })  }  handleClickWithoutPromise = () => {    this.setState({...this.state, a: 'aa'})    this.setState({...this.state, b: 'bb'})  }  render() {    console.log('render')    return (      <Fragment>        <button onClick={this.handleClickWithPromise}>异步执行</button>        <button onClick={this.handleClickWithoutPromise}>同步执行</button>      </Fragment>    )  }}
```

*   当点击`同步执行`按钮时，只重新 `render` 了一次
    
*   当点击`异步执行`按钮时，`render` 了两次
    

**「同步和异步情况下，连续执行两次同一个 setState」** 示例

```
class Component extends React.Component {  constructor(props) {    super(props)    this.state = {      a: 1,    }  }  handleClickWithPromise = () => {    Promise.resolve().then(() => {      this.setState({a: this.state.a + 1})      this.setState({a: this.state.a + 1})    })  }  handleClickWithoutPromise = () => {    this.setState({a: this.state.a + 1})    this.setState({a: this.state.a + 1})  }  render() {    console.log('a', this.state.a)    return (      <Fragment>        <button onClick={this.handleClickWithPromise}>异步执行</button>        <button onClick={this.handleClickWithoutPromise}>同步执行</button>      </Fragment>    )  }}
```

*   当点击`同步执行`按钮时，两次 `setState` 合并，只执行了最后一次，打印 2
    
*   当点击`异步执行`按钮时，两次 `setState` 各自 `render` 一次，分别打印 2，3
    

至此，大家应该明白它们什么时候是同步，什么时候是异步了吧。

我们再来看下面这个栗子：

```
function App() {  const [count, setCount] = useState(0);  console.log('1：', count);  return (    <div>      <p>App:You clicked {count} times</p>      <button onClick={() => {        setCount(count + 1);        console.log('2：', count);      }}>        Click me      </button>    </div>  )}
```

点击一次按钮输出的是

```
1：1
2： 0
```

那么问题来了，为什么在`setCount`之后输出的是`2：0`而不是`2：1`

因为 function state 保存的是快照，class state 保存的是最新值。这么说可能还会不太理解，我们看看下面这栗子：

```
class App extends Component {  constructor(props) {    super(props)    this.state = {      count: 0    }  }    render() {    const { count } = this.state;    console.log(count);    return (      <div>      <p>You clicked {count} times</p>      <button onClick={() => {        setTimeout(() => {          this.setState({count: count + 1});          console.log('this.state.count = ', this.state.count);          console.log('count = ', count);        }, 1000)      }}>        Click me      </button>    </div>    )  }}
```

点击一次按钮输出的是

```
this.state.count =  1
count =  0
```

所以实际上`this.state`已经更新，只是因为`setTimeout`的闭包影响`count`保存的还是原先的值。

那么当我们快速的点击三次时又会发送什么呢？

你会发现输出结果是：

```
this.state.count =  1
count =  0
this.state.count =  1
count =  0
this.state.count =  1
count =  0
```

显示的是`You clicked 1 times`。同样也是因为`setTimeout`闭包的影响，三次`this.setState({count: count + 1});`

相当于三次`this.setState({count: 0 + 1});`，那么如果我们想按照正常情况加 3 该怎么办呢？

在 class 组件里我们可以做如下修改：

```
this.setState({count: this.state.count + 1});
```

class 组件里面可以通过 `this.state` 引用到 `count`，所以每次 `setTimeout` 的时候都能通过引用拿到上一次的最新 `count`，所以点击多少次最后就加了多少。

在 function component 里面每次更新都是重新执行当前函数，也就是说 `setTimeout` 里面读取到的 `count` 是通过闭包获取的，而这个 `count` 实际上只是初始值，并不是上次执行完成后的最新值，所以最后只加了 1 次。

`setState`和`setCount`方法除了传入值外还可以传入一个返回值的函数，用这种方法我们就可以实现正常的情况了：

```
this.setState((preState) => ({    ...preState, count: preState.count + 1}));// orsetCount((count) => count + 1);
```

或许你会想，如果模仿类组件里面的 `this.state`，我们用一个引用来保存 `count` 不就好了吗？没错，这样是可以解决，只是这个引用该怎么写呢？我在 `state` 里面设置一个对象好不好？就像下面这样：

```
const [state, setState] = useState({ count: 0 })
```

答案是不行，因为即使 `state` 是个对象，但每次更新的时候，要传一个新的引用进去，这样的引用依然是没有意义。

```
setState({ count: state.count + 1 })
```

想要解决这个问题，那就涉及到另一个新的 Hook 方法 —— `useRef`。`useRef` 是一个对象，它拥有一个 `current` 属性，并且不管函数组件执行多少次，而 `useRef` 返回的对象永远都是原来那一个。

**「参数」**

*   React useState 和 setState 到底是同步还是异步呢？- 掘金 (juejin.cn)
    

  

往期回顾

  

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[3 分钟掌握 Node.js 版本的区别](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467578&idx=1&sn=c13257ab0adbd070ad748b9ad2277806&chksm=b1c21cd386b595c5cec50d1026651851f30fe339da10c7da81dabd56f5cb6e75c15b297ca1a5&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)