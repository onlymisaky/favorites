> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/x5tcWAvPGGI4wbCFMYnXug)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCVWddNdkUibG1uJ5GL2Waktov2HSPNPoryGobH19R4SliaFeOibwkHBr6MlNOjwLVecibRibaqk8dshayQ/640?wx_fmt=jpeg)

> 时至今日，React Hooks 已在 React 生态中大放异彩，席卷了几乎所有的 React 应用。而其又与 Function Component 以及 Fiber 架构几近天作之合，在当下，我们好像毫无拒绝它的道理。  

诚然，Hooks 解决了 React Mixins 这个老大难的问题，但从它各种奇怪的使用体验上来说，我认为现阶段的 Hooks 并不是一个好的抽象。

红脸太常见，也来唱个黑脸，本文将站在一个「挑刺儿」的视角，聊聊我眼中的 React Hooks ~

「奇怪的」规矩
-------

React 官方制定了一些 Hooks 书写规范用来规避 Bug，但这也恰恰暴露了它存在的问题。

命名
--

Hooks 并非普通函数，我们一般用`use`开头命名，以便与其他函数区分。

但相应地，这也破坏了函数命名的语义。固定的`use`前缀使 Hooks 很难命名，你既为`useGetState`这样的命名感到困惑，也无法理解`useTitle`到底是怎么个`use`法儿。

> “
> 
> 相比较而言，以`_`开头的私有成员变量和`$`尾缀的流，则没有类似的困扰。当然，这只是使用习惯上的差异，并不是什么大问题。
> 
> ”

调用时序
----

在使用`useState`的时候，你有没有过这样的疑惑：`useState`虽然每次`render()` 都会调用，但却可以为我保持住 State，如果我写了很多个，那它怎么知道我想要的是什么 State 呢？

```
const [name, setName] = useState('xiaoming')console.log('some sentences')const [age, setAge] = useState(18)
```

两次`useState`只有参数上的区别，而且也没有语义上的区分（我们仅仅是给返回值赋予了语义），站在 `useState`的视角，React 怎么知道我什么时候想要`name`而什么时候又想要`age`的呢？

> “
> 
> 以上面的示例代码来看，为什么第 1 行的`useState`会返回字符串`name`，而第 3 行会返回数字`age`呢? 毕竟看起来，我们只是「平平无奇」地调用了两次`useState`而已。
> 
> ”

答案是「时序」。`useState`的调用时序决定了结果，也就是，第一次的`useState`「保存」了 `name` 的状态，而第二次「保存」了`age`的状态。

```
// Class Component 中通过字面量声明与更新 State，无一致性问题this.setState({  name: 'xiaoming',  // State 字面量 `name`,`age`  age: 18,})
```

React 简单粗暴地用「时序」决定了这一切（背后的数据结构是链表），这也导致 Hooks 对调用时序的严格要求。也就是要避免所有的分支结构，不能让 Hooks 「时有时无」。

```
// ❌ 典型错误if (some) {  const [name, setName] = useState('xiaoming')}
```

这种要求完全依赖开发者的经验抑或是 Lint，而站在一般第三方 Lib 的角度看，这种要求调用时序的 API 设计是极为罕见的，非常反直觉。

最理想的 API 封装应当是给开发者认知负担最小的。好比封装一个纯函数`add()`，不论开发者是在什么环境调用、在多么深的层级调用、用什么样的调用时序，只要传入的参数符合要求，它就可以正常运作，简单而纯粹。

```
function add(a: number, b: number) {  return a + b}function outer() {  const m = 123;  setTimeout(() => {    request('xx').then((n) => {      const result = add(m, n)         // 符合直觉的调用：无环境要求    })  }, 1e3)}
```

可以说「React 确实没办法让 Hooks 不要求环境」，但也不能否认这种方式的怪异。

类似的情况在`redux-saga`里也有，开发者很容易写出下面这种「符合直觉」的代码，而且怎么也「看」不出有问题。

```
import { call } from 'redux-saga/effects'function* fetch() {  setTimeout(function* () {    const user = yield call(fetchUser)    console.log('hi', user)                  // 不会执行到这儿  }, 1e3)}
```

`yield call()`在 Generator 里调用，看起来真的很「合理」。但实际上，`function*`需要 Generator 执行环境，而`call`也需要`redux-saga`的执行环境。双重要求之下，实例代码自然无法正常运行。

useRef 的「排除万难」
--------------

从本义上来说，`useRef`其实是 Class Component 时代`React.createRef()`的等价替代。

官方文档 [1] 中最开始的示例代码可以佐证这一点（如下所示，有删减）：

```
function TextInputWithFocusButton() {  const inputEl = useRef(null);  return (    <input ref={inputEl} type="text" />  );}
```

但因为其实现特殊，也常作他用。

React Hooks 源码中，`useRef`仅在 Mount 时期初始化对象，而 Update 时期返回 Mount 时期的结果（`memoizedState`）。这意味着一次完整的生命周期中，`useRef` 保留的引用始终不会改变。

![](https://mmbiz.qpic.cn/mmbiz_jpg/CBxTibNZG9mENZL9WGibmN8TlUiaj6rm0wiaUQg2icWTdf0Lw8JhicAsbrYoKc7qiavNzSItBt8uuBG8W26GUKYZy9vSQ/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/CBxTibNZG9mENZL9WGibmN8TlUiaj6rm0wiaYCeCZtV1r64LjEAwqlKFznFYrwbQCBviavBMv5lumW4icmh4BVUnhWww/640?wx_fmt=jpeg)

而这一特点却让它成为了 Hooks 闭包救星。

「遇事不决，useRef ！」（`useRef`存在许多滥用的情况，本文不多赘述）

每一个 Function 的执行都有与之相应的 Scope，对于面向对象来说，`this`引用即是连接了所有 Scope 的 Context（当然前提是在同一个 Class 下）。

```
class Runner {  runCount = 0  run() {    console.log('run')    this.runCount += 1  }  xrun() {    this.run()    this.run()    this.run()  }  output() {    this.xrun()    // 即便是「间接调用」`run`，这里「仍然」能获取 `run` 的执行信息    console.log(this.runCount) // 3  }}
```

在 React Hooks 中，每一次的 Render 由彼时的 State 决定，Render 完成 Context 即刷新。优雅的 UI 渲染，干净而利落。

但`useRef`多少违背了设计者的初衷， `useRef`可以横跨多次 Render 生成的 Scope，它能保留下已执行的渲染逻辑，却也能使已渲染的 Context 得不到释放，威力无穷却也作恶多端。

而如果说 `this`引用是面向对象中最主要的副作用，那么 `useRef`亦同。从这一点来说，拥有 `useRef`写法的 Function Component 注定难以达成「函数式」。

小心使用
----

有缺陷的生命周期
--------

### 构造时

Class Component 和 Function Component 之间还有一个很大的「Bug」，Class Component 仅实例化一次后续仅执行 `render()` ，而 Function Component 却是在不断执行自身。

这导致 Function Component 相较 Class Component 实际缺失了对应的`constructor`构造时。当然如果你有办法只让 Function 里的某段逻辑只执行一遍，倒是也可以模拟出`constructor`。

```
// 比如使用 useRef 来构造function useConstructor(callback) {  const init = useRef(true)  if (init.current) {    callback()    init.current = false  }}
```

> “
> 
> 生命周期而言， `constructor` 不能类同 `useEffect` ，如果实际节点渲染时长较长，二者会有很大时差。
> 
> ”

也就是说，Class Component 和 Function Component 的生命周期 API 并不能完全一一对应，这是一个很引发错误的地方。

### 设计混乱的 useEffect

在了解`useEffect`的基本用法后，加上对其字面意思的理解（监听副作用），你会误以为它等同于 Watcher。

```
useEffect(() => {
  // watch 到 `a` 的变化
  doSomething4A()
}, [a])
```

但很快你就会发现不对劲，如果变量`a`未能触发 re-render，监听并不会生效。也就是说，实际还是应该用于监听 State 的变化，即`useStateEffect`。但参数`deps`却并未限制仅输入 State。如果不是为了某些特殊动作，很难不让人认为是设计缺陷。

```
const [a] = useState(0)
const [b] = useState(0)

useEffect(() => {
    // 假定此处为 `a` 的监听
}, [a])

useEffect(() => {
    // 假定此处为 `b` 的监听
  // 实际即便 `b` 未变化也并未监听 `a`，但此处仍然因为会因为 `a` 变化而执行
}, [b, Date.now()])        // 因为 Date.now() 每次都是新的值
```

`useStateEffect`的理解也并不到位，因为`useEffect`实际还负责了 Mount 的监听，你需要用「空依赖」来区分 Mount 和 Update。

```
useEffect(onMount, [])
```

单一 API 支持的能力越多，也意味着其设计越混乱。复杂的功能不仅考验开发者的记忆，也难于理解，更容易因错误理解而引发故障。

useCallback
-----------

### 性能问题?

在 Class Component 中我们常常把函数绑在`this`上，保持其的唯一引用，以减少子组件不必要的重渲染。

```
class App {  constructor() {    // 方法一    this.onClick = this.onClick.bind(this)  }  onClick() {    console.log('I am `onClick`')  }  // 方法二  onChange = () => {}  render() {    return (      <Sub onClick={this.onClick} onChange={this.onChange} />    )  }}
```

在 Function Component 中对应的方案即 `useCallback` ：

```
// ✅ 有效优化function App() {  const onClick = useCallback(() => {    console.log('I am `onClick`')  }, [])  return (<Sub onClick={onClick} />)}// ❌ 错误示范，`onClick` 在每次 Render 中都是全新的，<Sub> 会因此重渲染function App() {  // ... some states  const onClick = () => {    console.log('I am `onClick`')  }  return (<Sub onClick={onClick} />)}
```

`useCallback`可以在多次重渲染中仍然保持函数的引用， 第`2`行的`onClick`也始终是同一个，从而避免了子组件`<Sub>`的重渲染。

`useCallback`源码其实也很简单：

![](https://mmbiz.qpic.cn/mmbiz_jpg/CBxTibNZG9mENZL9WGibmN8TlUiaj6rm0wiaSEZfjZAxpGnKhv4jibJTLlR0wkLicuXQYuB77rCkU9IrRTyYud0rSlZw/640?wx_fmt=jpeg)

Mount 时期仅保存 `callback` 及其依赖数组

![](https://mmbiz.qpic.cn/mmbiz_jpg/CBxTibNZG9mENZL9WGibmN8TlUiaj6rm0wiaaKms8pibeEfyAkXIgfJRnh5njtUrD9lYmAH84k8prwlNwEFnom6XBKA/640?wx_fmt=jpeg)

Update 时期判断如果依赖数组一致，则返回上次的 `callback`

顺便再看看`useMemo` 的实现，其实它与 `useCallback` 的区别仅仅是多一步 Invoke：

![](https://mmbiz.qpic.cn/mmbiz_jpg/CBxTibNZG9mENZL9WGibmN8TlUiaj6rm0wia8meIbTtz0rkLvhbCOjVZbw4kgDKatqtMgmicdA1p960ia2Tenzt9k5JQ/640?wx_fmt=jpeg)

### 无限套娃✓[2]

相比较未使用`useCallback`带来的性能问题，真正麻烦的是`useCallback`带来的引用依赖问题。

```
// 当你决定引入 `useCallback` 来解决重复渲染问题function App() {  // 请求 A 所需要的参数  const [a1, setA1] = useState('')  const [a2, setA2] = useState('')  // 请求 B 所需要的参数  const [b1, setB1] = useState('')  const [b2, setB2] = useState('')  // 请求 A，并处理返回结果  const reqA = useCallback(() => {    requestA(a1, a2)  }, [a1, a2])  // 请求 A、B，并处理返回结果  const reqB = useCallback(() => {    reqA()                                           // `reqA`的引用始终是最开始的那个，    requestB(b1, b2)                       // 当`a1`,`a2`变化后`reqB`中的`reqA`其实是过时的。  }, [b1, b2])                   // 当然，把`reqA`加到`reqB`的依赖数组里不就好了？                                                             // 但你在调用`reqA`这个函数的时候，                                                                 // 你怎么知道「应该」要加到依赖数组里呢？  return (    <>      <Comp onClick={reqA}></Comp>      <Comp onClick={reqB}></Comp>    </>  )}
```

从上面示例可以看到，当`useCallback`之前存在依赖关系时，它们的引用维护也变得复杂。调用某个函数时要小心翼翼，你需要考虑它有没有引用过时的问题，如有遗漏又没有将其加入依赖数组，就会产生 Bug。

Use-Universal
-------------

Hooks 百花齐放的时期诞生了许多工具库，仅`ahooks` 就有 62 个自定义 Hooks，真可谓「万物皆可 `use`」~ 真的有必要封装这么多 Hooks 吗？又或者说我们真的需要这么多 Hooks 吗？

合理封装？
-----

尽管在 React 文档中，官方也建议封装自定义 Hooks 提高逻辑的复用性。但我觉得这也要看情况，并不是所有的生命周期都有必要封装成 Hooks。

```
// 1. 封装前function App() {  useEffect(() => {           // `useEffect` 参数不能是 async function    (async () => {      await Promise.all([fetchA(), fetchB()])      await postC()    })()  }, [])  return (<div>123</div>)}// --------------------------------------------------// 2. 自定义 Hooksfunction App() {  useABC()  return (<div>123</div>)}function useABC() {  useEffect(() => {    (async () => {      await Promise.all([fetchA(), fetchB()])      await postC()    })()  }, [])}// --------------------------------------------------// 3. 传统封装function App() {  useEffect(() => {    requestABC()  }, [])  return (<div>123</div>)}async function requestABC() {  await Promise.all([fetchA(), fetchB()])  await postC()}
```

在上面的代码中，对生命周期中的逻辑封装为 Hook`useABC`反而使其耦合了生命周期回调，降低了复用性。即便我们的封装中不包含任何 Hooks，在调用时也仅仅是包一层`useEffect`而已，不算费事，而且让这段逻辑也可以在 Hooks 以外的地方使用。

如果自定义 Hooks 中使用到的`useEffect`和`useState`总次数不超过 2 次，真的应该想一想这个 Hook 的必要性了，是否可以不封装。

简单来说，Hook 要么「挂靠生命周期」要么「处理 State」，否则就没必要。

重复调用
----

Hook 调用很「反直觉」的就是它会随重渲染而不停调用，这要求 Hook 开发者要对这种反复调用有一定预期。

正如上文示例，对请求的封装，很容易依赖`useEffect`，毕竟挂靠了生命周期就能确定请求不会反复调。

```
function useFetchUser(userInfo) {  const [user, setUser] = useState(null)  useEffect(() => {    fetch(userInfo).then(setUser)  }, [])  return user}
```

但，`useEffect`真的合适吗？这个时机如果是`DidMount`，那执行的时机还是比较晚的，毕竟如果渲染结构复杂、层级过深，`DidMount`就会很迟。

比如，`ul`中渲染了 2000 个 `li`：

```
function App() {  const start = Date.now()  useEffect(() => {    console.log('elapsed:', Date.now() - start, 'ms')  }, [])  return (    <ul>      {Array.from({ length: 2e3 }).map((_, i) => (<li key={i}>{i}</li>))}    </ul>  )}// output// elapsed: 242 ms
```

那不挂靠生命周期，而使用状态驱动呢？似乎是个好主意，如果状态有变更，就重新获取数据，好像很合理。

```
useEffect(() => {  fetch(userInfo).then(setUser)}, [userInfo])                   // 请求参数变化时，重新获取数据
```

但初次执行时机仍然不理想，还是在`DidMount`。

```
let start = 0let f = falsefunction App() {  const [id, setId] = useState('123')  const renderStart = Date.now()  useEffect(() => {    const now = Date.now()    console.log('elapsed from start:', now - start, 'ms')    console.log('elapsed from render:', now - renderStart, 'ms')  }, [id])                       // 此处监听 `id` 的变化  if (!f) {    f = true    start = Date.now()    setTimeout(() => {      setId('456')    }, 10)  }  return null}// output// elapsed from start: 57 ms// elapsed from render: 57 ms// elapsed from start: 67 ms// elapsed from render: 1 ms
```

这也是上文为什么说`useEffect`设计混乱，你把它当做 State Watcher 的时候，其实它还暗含了「初次执行在`DidMount`」的逻辑。从字面意思`Effect`来看，这个逻辑才是副作用吧。。。

状态驱动的封装除了调用时机以外，其实还有别的问题：

```
function App() {  const user = useFetchUser({          // 乍一看似乎没什么问题    name: 'zhang',    age: 20,  })  return (<div>{user?.name}</div>)}
```

实际上，组件重渲染会导致请求入参重新计算 -> 字面量声明的对象每次都是全新的 -> `useFetchUser`因此不停请求 -> 请求变更了 Hook 内的 State `user` -> 外层组件`<App>`重渲染。

这是一个死循环！

当然，你可以用`Immutable`来解决同一参数重复请求的问题。

```
useEffect(() => {
  // xxxx
}, [ Immutable.Map(userInfo) ])
```

但总的看来，封装 Hooks 远远不止是变更了你代码的组织形式而已。比如做数据请求，你可能因此而走上状态驱动的道路，同时，你也要解决状态驱动随之带来的新麻烦。

为了 Mixin ？
----------

其实，Mixin 的能力也并非 Hooks 一家独占，我们完全可以使用 Decorator 封装一套 Mixin 机制。也就是说， Hooks 不能依仗 Mixin 能力去力排众议。

```
const HelloMixin = {  componentDidMount() {    console.log('Hello,')  }}function mixin(Mixin) {  return function (constructor) {    return class extends constructor {      componentDidMount() {        Mixin.componentDidMount()        super.componentDidMount()      }    }  }}@mixin(HelloMixin)class Test extends React.PureComponent {  componentDidMount() {    console.log('I am Test')  }  render() {    return null  }}render(<Test />) // output: Hello, \n I am Test
```

不过 Hooks 的组装能力更强一些，也容易嵌套使用。但需要警惕层数较深的 Hooks，很可能在某个你不知道的角落就潜伏着一个有隐患的`useEffect`。

小结
--

*   本文没有鼓吹 Class Component 拒绝使用 React Hooks 的意思，反而是希望通过细致地比对二者，从而更深入理解 Hooks。
    
*   React Hooks 的各种奇怪之处，也正是潜在症结之所在。
    
*   在 Hooks 之前，Function Component 都是 Stateless 的，小巧、可靠但功能有限。Hooks 为 Function Component 赋予了 State 能力并提供了生命周期，使 Function Component 的大规模使用成为了可能。
    
*   Hooks 的「优雅」来自向函数式的致敬，但`useRef` 的滥用让 Hooks 离「优雅」相去甚远。
    
*   大规模实践 React Hooks 仍然有诸多问题，无论是从语义理解抑或是封装的必要性。
    
*   创新不易，期待 React 官方之后会有更好的设计吧。
    

> “
> 
> 原文链接：https://zhuanlan.zhihu.com/p/455317250?utm_source=ZHShareTargetIDMore&utm_medium=social&utm_oi=28389876432896
> 
> ”

### 参考资料

[1]

官方文档: _https://link.zhihu.com/?target=https%3A//reactjs.org/docs/hooks-reference.html%23useref_

[2]

✓: _https://link.zhihu.com/?target=https%3A//www.alt-codes.net/check-mark-symbols.php_

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

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

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)