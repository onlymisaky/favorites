> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/haiSh6_lZN87Y2W_abm4_g)

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFRt7yFtrsicWcZ0W1FmUeEkCazKrXcFmiaooZM8y8zcBNahA4xbicWC4xUqOTiaC4AKMpM4FFJWdlSXg/640?wx_fmt=png&from=appmsg)

在以往的开发思路中，初始化接口需要借助 useEffect。和最初的 class 语法相比，借助 useEffect 实现接口请求是一次代码简洁度的大幅度提升。

```
function Messages() {  var [data, setData] = useState()  useEffect(() => {    api().then(res => {      setData(res.data)    })  }, [])  ...}
```

在 React 19 中，由于 `use()` hook 的出现，让我们有机会不借助 `useEffect` 就可以简单实现初始化。代码简洁度将会进一步提升。我们来回顾一下如何做。

先定义好一个 api 请求的函数。此时我们要重新注意 `getMessage` 执行，返回的是一个 promise.

```
const getMessage = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}
```

有了这个 api 之后，我们可以直接在父组件中调用该方法。

```
var promise = getMessage()
```

由于 `getMessage` 执行返回的依然是一个 promise，因此我们可以将这个 promise 传递给子组件。在子组件中使用 use 读取 promise 中的值。

```
// 被 Suspense 包裹的子组件const res = use(api)
```

只需要这两行代码，就可以非常简单的在组件中请求接口并初始化页面了。但是我们在前面的文章中有提到过，一个新的架构思路如何不能解决所有问题，那么这个架构思路就是不成功的，我们便不能称之为架构思维。

在前面的案例中，我们确实遇到了一些更复杂的情况，并且采用了一些不太理想的方式来解决。我们来回顾一下。

一个常见的需求场景就是，我们不仅要在初始化时请求接口，并且还要在后续的交互中「点击更新、重置、下拉刷新等」请求同样的接口。此时我们刚才非常简洁的写法就变得不再适用了。一个交互案例如下图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcFRt7yFtrsicWcZ0W1FmUeEksdDcahcfaShysMeoWz8nkhqcyzPIvUK69zXwadujcIWdpL2M8rLj9g/640?wx_fmt=gif&from=appmsg)

在前面的案例中，我们巧妙的将 `promise` 作为状态存储在 `state` 中，勉强解决了这个问题。

```
var [promise, setPromise] = useState(getMessage())
```

交互事件触发时，只需要执行 `getMessage()` 并用此结果更新 promise 的值，组件就会重新请求。

```
function __clickHandler() {  setPromise(getMessage())}
```

这种用法非常高级，因为在我们的固有思维中，state 中存储的都是**可以触发更新的状态 / 数据**，而这种用法实际上是在数据外套了一层 promise，我们将数据存储在 promise 中。在保持了代码简洁性的同时，没有新增状态并且最终解决了问题。

但是，

这并不是最理想的解决方案。因为这种写法，当组件由于各种原因需要重新请求时，`getMessage()` 会冗余执行，它的执行就会请求接口，因此这种写法会造成大量的冗余请求。

为了解决这个问题，我们在前面一章的案例中，使用了一种并不简洁的方案，来防止 `getMessage()` 的冗余执行。这个思路的核心是利用 useEffect 的执行，来记录组件已经完成初始化，然后在函数组件后续的执行中，就可以阻止 getMessage 的执行。

```
var r = useRef(false)var api = r.current ? null : getMessage()const [promise, setPromise] = useState(api)const [current, setCurrent] = useState(0)useEffect(() => {  r.current = true}, [])
```

绕来绕去，`useEffect` 又回来了。很显然，这违背了我们的初衷。虽然解决了问题，但是看上去非常的别扭。

那么有没有更简单直接的、符合 React 19 开发思维的、彻底摒弃 `useEffect` 的解决方案呢？当然有。

我们需要巧妙的利用 React 语法的机制，来达到目的。

我们仔细观察一下 `getMessage` 的封装。实际上，当我们调用该方法时，请求就已经发生了。

```
const getMessage = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}
```

所以，当父组件重复执行时，`getMessage()` 也会重复执行，请求自然也会重复发送。因此，一个比较自然的思考，就是想办法让 `getMessage` 只执行一次。

调整的方式非常简单，如下所示

```
+ var [, setPromise] = useState(getMessage)- var [, setPromise] = useState(getMessage())
```

**这里就是我们这篇文章要重点给大家介绍的非常巧妙的地方**。我们借助了 `useState` 的另外一种方式来初始化。来观察一下官方文档的案例

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFRt7yFtrsicWcZ0W1FmUeEkXIwzv4774ELFL7btrae5ic88zWNibZutCN0aQpfMoS0oO1m59c5hKatg/640?wx_fmt=png&from=appmsg)

```
const [todos, setTodos] = useState(() => createTodos());
```

注意看一下这段代码，他使用一个函数来初始化 `todos`，初始化之后，`todos` 的值，为 `createTodos()` 的执行结果。这种方式初始化的结果是，`createTodos()` 只会在组建首次创建时执行一次，后续组件再 `re-render`，就不再执行了。

又由于在函数式编程中，函数是一等公民，因此，上面的代码可以简化为

```
const [todos, setTodos] = useState(createTodos);
```

所以此时，我们使用 `useState(getMessage)` 则是借用了这种语法思路，将我们的代码做到极简的方式给 state 赋值。他等价于

```
var [] = useState(() => getMessage())// 两种写法的运行结果是一致的var [] = useState(getMessage)
```

交互事件触发时代码可以保持不变。

```
function __clickHandler() {  setPromise(getMessage())}
```

**确实太帅了，一个非常小的调整，就解决了问题**。

而这种小小的巧妙调整，结合我们把 promise 存储在 state 的巧思，几乎就可以宣告 useEffect 在异步请求的实现中，可以功成身退了。当你理解了这个细节，你就应该能完全感受到 `react 19` 的强大吸引力了。也因此，我对 React19 无比期待。

极简风格的代码表现如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFRt7yFtrsicWcZ0W1FmUeEkUQMuhuUiaoymWu5V2XeGfyHS0uH6ASUTyClfIyPKWNAj5HZB18OrgHw/640?wx_fmt=png&from=appmsg)

不得不说，评论区里有高人。在上一篇文章中就有人已经提到过这种调整方向。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFRt7yFtrsicWcZ0W1FmUeEk7OTNicicUDaPSXFfUMtMewf2bvnzHb9ecPzesA97cjGreK8ciab3Q90RQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFRt7yFtrsicWcZ0W1FmUeEkUsp7X8Tw3ibxmXptl7JUUHr3dz5SaV4b33mVWDyibvl2ecBol51fjZzw/640?wx_fmt=png&from=appmsg)

有的时候，我们需要在请求时传入参数，那么写法简单调整如下

```
var [] = useState(() => getMessage(params))function __clickHandler() {  setPromise(getMessage(params))}...
```

最后总结一下，我们注意看下面两种写法：

```
// 写法一：const _api2 = new Promise((resolve) => {  resolve({ value: 29 })})
```

写法二：

```
function fetchMessage() {  return new Promise((resolve) => {    setTimeout(resolve, 1000, '***')  })}
```

当我们要直接用 use 从 promise 中获取数据时，必须是写法一这种方式。当我们把 promise 保存在 `useState` 上时，写法一与写法二都可以。

end
---

**最后**

给大家介绍一本我写的高质量小册：**React 知命境**。这是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册。点击「前端码易」即可阅读。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHghdP9QNe7S49o9FUB5BWHZBBJxNNWWtwic1aB3sOjucjKJeCWk0Srhy1r7BQfujACqe0tvtAp0icw/640?wx_fmt=png&from=appmsg)

[购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。进群之后可在群公告观看高质量直播录屏。

关注我，解锁更多前端高端技巧。