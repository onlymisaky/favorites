> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EWcnS0j0Rq2OWfg52a4WLA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkongaibLMx2KmE4JtzrBcI2XKCRPVknyiaT2gXzlzqiaMzlcpCqVTRR0EGeA/640?wx_fmt=png&from=appmsg)

接下来，我们将会以大量的实践案例来展开 React 19 新 hook 的运用。

本文模拟的实践案例为**点击按钮更新数据**。这在开发中是一个非常常见的场景。

案例完成之后的最终演示效果图如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonq0jcibREpBN7AdeyYFWskldKybcClNB06zaOMaDibx4ksOn1xTgSw7gA/640?wx_fmt=gif&from=appmsg)

我们直接用 React 19 新的开发方式来完成这个需求。

1
-

**基础实现**

首先创建一个方法用于请求数据。

```
const getApi = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}
```

这里一个非常关键的地方就在于，当我们要更新的数据时，我们不再需要设计一个 `loading` 状态去记录数据是否正在发生请求行为，因为 `Suspense` 帮助我们解决了 Loading 组件的显示问题。

与此同时，`use()` 又帮助我们解决了数据获取的问题。那么问题就来了，这个就是，好像我们也不需要设计一个状态去存储数据。那么应该怎么办呢？

这里有一个**非常巧妙**的方式，就是把**创建的 promise 作为状态值**来触发组件的重新执行。每次点击，我们都需要创建新的 promise

代码如下

```
// 记住这个初始值const [api, setApi] = useState(null)
```

这个时候，当我们点击事件执行时，则只需要执行如下代码去触发组件的更新。

```
function __clickToGetMessage() {  // 每次点击，都会创建新的 promise  setApi(getApi())}
```

`getApi()` 执行，新的请求会发生。他的执行结果，又返回了一个新的 promise.

因此，点击之后会创建的新 promise 值，api 此时就会作为状态更改触发组件的更新。

完整代码如下

```
export default function Index() {  const [api, setApi] = useState(null)  function __clickToGetMessage() {    setApi(getApi())  }  return (    <div>      <div id='tips'>点击按钮获取一条新的数据</div>      <button onClick={__clickToGetMessage}>获取数据</button>      <div class>        <Suspense fallback={<div>loading...</div>}>          <Item api={api} />        </Suspense>      </div>    </div>  )}const Item = (props) => {  if (!props.api) {    return <div>nothing</div>  }  const joke = use(props.api)  return (    <div className='a_value'>{joke.value}</div>  )}
```

案例写完之后。我们基本上就能够实现最开始截图中的交互效果了。但是现别急，还没有完。我们还需要进一步分析一下这个案例。

2
-

**案例分析**

这里我们需要注意观察两个事情。

一个是观察当前组件更新，更上层的父组件是否发生了变化。我们可以在 `App` 组件中执行一次打印。

此时可以发现，当我们重新请求时，当前组件更新，但是上层组件并不会重新执行。

我们可以出得结论：**更简洁的状态设计，有利于命中 React 默认的性能优化规则**。

> 具体的规则请在 React 知命境合集中查看。

更简洁的状态设计，也是 React 19 所倡导的开发思路。

另外一个事情，是我们要特别特别注意观察子组件 `Item` 的实现。

首先因为我们初始化时，给 `api` 赋予的默认值是 `null`。

```
// 记住这个初始值const [api, setApi] = useState(null)
```

之后，我们就将 api 传给了子组件 `Item`

```
<Item api={api} />
```

然后在 Item 组件的内部实现中，因为我们直接把 api 传给了 `use`，那么此时直接执行肯定会报错

```
const joke = use(props.api)
```

要注意的是，我们刚才说，使用 `Suspense` 会捕获子组件的异常，但是不是捕获所有异常，它只能识别 promise 的异常。因此，这里的报错会直接影响到整个页面。

所以，为了处理好初始化时传入 `api` 值为 null，我在内部实现代码逻辑中，使用了 `if` 判断该条件，然后执行了一次 `return`。我试图让 `use(null)` 得不到执行的时机。

```
const Item = (props) => {  if (!props.api) {    console.log('初始化时，api == null')    return <div>nothing</div>  }  const joke = use(props.api)  return (    <div className='a_value'>{joke.value}</div>  )}
```

那么，我的意图是否能成功呢？

我们在 return 后面插入一个 `console.log` 来观察代码的执行情况，代码如下

```
const Item = (props) => {  if (!props.api) {    console.log('初始化时，api == null')    return <div>nothing</div>  }    console.log('初始化时这里是否执行');  const joke = use(props.api)  return (    <div className='a_value'>{joke.value}</div>  )}
```

演示效果如下图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonwZGqKmkhfXNzTADPWn25KUHOZicmzIQa9nibYJvcYdFf17DVIoFLCPmg/640?wx_fmt=gif&from=appmsg)

我们发现，当我反复刷新页面，让初始化流程执行时，`return` 后面的代码并不会执行。

再然后，我们新增一点内容，比如在 `return` 后面使用一个 `useEffect`

```
const Item = (props) => {  if (!props.api) {    console.log('初始化时，api == null')    return <div>nothing</div>  }  useEffect(() => {    console.log('xxx')  }, [])  console.log('初始化时这里是否执行')  const joke = use(props.api)  return (    <div className='a_value'>{joke.value}</div>  )}
```

然后演示再看看。我们发现 `effect` 也不会执行。然后我们还可以搞点好玩的。

`Item` 代码改造如下

```
const Item = (props) => {  if (!props.api) {    const [count, setCount] = useState(0)    console.log('初始化时，api == null')    return <div onClick={() => setCount(count + 1)}>nothing, {count}</div>  }  console.log('初始化时这里是否执行')  const joke = use(props.api)  return (    <div className='a_value'>{joke.value}</div>  )}
```

注意看，我们在 if 条件判断中，单独创建了一个 `useState`，并在对应的元素上添加了一个让 `count` 递增的交互。

这段在之前版本的开发中一定会触发语法错误提示的代码。

> 最终也是能勉强运行，但是代码会疯狂报错

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonRdyjh2dy7aTxMUCLjSghK3wUhzwViaO9cIbU8je0Nj6OID05EvFzicibQ/640?wx_fmt=png&from=appmsg)

代码演示结果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonqKzIEFRnNicEu3QvLJzz7SfTxMWJOoyOkDtOHynl96ojoApayzz8Wug/640?wx_fmt=gif&from=appmsg)

然后，我继续一个骚操作，我在 if 中条件判断中，使用 `useEffect`，代码如下

```
const Item = (props) => {  if (!props.api) {    useEffect(() => {      console.log('useEffect 在 if 中执行')    }, [])    return <div>nothing</div>  }  console.log('初始化时这里是否执行')  const joke = use(props.api)  return (    <div className='a_value'>{joke.value}</div>  )}
```

也能正常执行。观察一下演示效果

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkon3PZ1veOhKyejMret7dQNkzTVMotfk8LqgAmWwDic8pO2sHW44uiatRVQ/640?wx_fmt=gif&from=appmsg)

**结论：**

很明显，`react 19` 的 hook 在底层发生了一些优化更新，我们可以不用非得把所有的 hook 都放在函数组件的最前面去执行了。

**在 React 19 中，我们可以把 hook 放到 return 之后，也可以放到条件判断中去执行。**

但是，我们一定要注意的是，并非表示我们可以随便乱写。当条件互斥时，状态之间如果存在不合理的耦合关系，依然不能正常执行。我们列举两个案例来观察这个事情。

第一个案例，我们依然在 if 中执行一个 useEffect，但是不同的是，我把在 if 之外的状态 `counter` 作为依赖项传入。

代码如下。

```
const Item = (props) => {  const [counter, setCounter] = useState(0)  if (!props.api) {    useEffect(() => {      console.log('useEffect 在 if 中执行')    }, [counter])    return <div>nothing</div>  }  console.log('初始化时这里是否执行')  const joke = use(props.api)  return (    <div className='a_value' onClick={() => setCounter(counter + 1)}>{joke.value}</div>  )}
```

此时一个很明显的问题就是，if 内部在 UI 逻辑上本和外部是互斥的关系，但是我们在状态逻辑上却相互关联。因此这个之后，代码执行就会报错，明确的告诉你这种写法不合理。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonq45g4GWBv6da3daZ0RicbiaEcMJwk7xHa6uianOLsjyx5XH4SmYYl1lGw/640?wx_fmt=png&from=appmsg)

第二个案例。我在条件判断中，定义了一个状态 `bar`，但是我并没有在 if 中 `return`，而是继续往后执行。代码如下：

```
const [counter, setCounter] = useState(0)if (counter == 0) {  const [bar, setBar] = useState('bar')  console.log('bar', bar)}const [foo, setFoo] = useState('foo')console.log('foo', foo)return (  <button onClick={() => setCounter(counter + 1)}>counter ++ foo: {foo}</button>)
```

这个现象的解释就是**我们之前在面试时经常会聊的一个话题**：为什么不能将 hook 放在条件判断中去执行。

由于在 fiber 中，是通过有序链表的方式来存储 hook 的值。因此，当随着 `counter` 递增，条件判断中的 hook 不再执行，但是它的值已经被缓存上了，后续的执行中，`foo` 就变成了第 1 个 hook，从而导致 `foo` 获取到了 `bar` 的值。

好在 react 19 对这种情况做出了明确的判断，当你这样写时，代码会明确报错终止程序的运行。所以在开发过程中我们也不用特别去区分什么情况下不能用。

3
-

**需求变动**

现在我们做一点小小的需求变动。

在之前的案例实现中，组件代码初始化时，并没有初始化请求一条数据。因此，默认渲染结果是 `nothing`

此时，我们如果希望组件首次渲染时，就一定要请求一次接口，我们的代码应该怎么改呢？

在以前版本的实现中，接口数据的触发方式不同，因此我们需要分别处理这两种触发时机。

初始化时的数据请求，我们利用 `useEffect` 来实现。

```
function PreIndex() {  const [data, setData] = useState({value: ''})  const [loading, setLoading] = useState(true)  useEffect(() => {    api().then(res => {      setData(res)      setLoading(false)    })  }, [])}
```

按钮点击事件触发时，我们通过回调函数来实现

```
function PreIndex() {  const [data, setData] = useState({value: ''})  const [loading, setLoading] = useState(true)  useEffect(() => {    api().then(res => {      setData(res)      setLoading(false)    })  }, [])  function _clickHandler() {    setLoading(true)    api().then(res => {      setData(res)      setLoading(false)    })  }  ...}
```

然而，在新的开发方式中，我们只需要在上面的案例做一个非常小的变动，那就是把 `api` 的参数使用 `getApi()` 去初始化，而不是 `null`，就可以做到了。

```
// 只需要改这一点代码const [api, setApi] = useState(getApi())
```

改完之后，演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkoneXbO9cflZQwGiaqcKdibWezke6wJQZVB4jPTRYBUhMb9BVXkCXWKFziaw/640?wx_fmt=gif&from=appmsg)

**非常的方便省事。**

当然这样写会造成冗余的接口请求执行。因此我们可以稍作调整就可以了。

> 这里需要根据需求调整，案例只做演示。

```
const _initApi = getApi()function Index() {  const [api, setApi] = useState(_initApi)  ...}
```

OK，今天的案例就介绍到这里，后续的章节我们还会继续更多的实战案例的分析。

end
---

**合集介绍**

**「React19 全解」**是 **「React 知命境」**的续集。由于公众号文章比较零散，许多读者不知道整个合集在哪里看，因此我创作了一个小程序，用于收录我创作的所有公众号文章，我将同一个合集的文章归类放入到一个目录中。以便大家分类查看。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonjIicb0rnl9Tx6z0N48CSU3t3mZicqVpHZ52ibG15j9ibkibvy2xXyFomr2w/640?wx_fmt=png&from=appmsg)

大家可以收藏我的小程序「前端码易」就能随时看到合集文章。

扫码或搜索添加我的微信 `icanmeetu`，可以加入 react19 讨论群，大家一起探讨与分享 React19 的使用心得，并且后续的更新公告、直播公告、**直播录屏**都会在群里放出。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonpDm4mIbtCiazWKb2h99IsWY6YKsOX7Oib108pAypBhXepgfCoxKqvdSg/640?wx_fmt=jpeg&from=appmsg)