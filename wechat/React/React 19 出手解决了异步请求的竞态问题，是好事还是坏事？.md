> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3cHVJkJekEv7k5_QYbMCsw)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkongaibLMx2KmE4JtzrBcI2XKCRPVknyiaT2gXzlzqiaMzlcpCqVTRR0EGeA/640?wx_fmt=png&from=appmsg)

是的，又是竞态问题。

在客户端开发中，这是一个老生常态的问题。一个有经验的前端工程师必定是对这个问题的情况与解决方案如数家珍。**因此竞态问题也经常在面试的过程中被讨论**。

竞态问题指的是，当我们在交互过程中，由于各种原因导致同一个接口短时间之内连续发送请求，后发送的请求有可能先得到请求结果，从而导致数据渲染出现预期之外的错误。

> 有的地方也称为竞态条件

**因为防止重复执行**可以有效的解决竞态问题，因此许多时候面试官也会直接在面试中问我们如何实现防重。常用的方式就是取消上一次请求，或者设置状态让按钮不能连续点击，想必各位大佬对这些方案都已经非常熟悉，我这里就不展开细说。当然，这个问题虽然被经常讨论，但是要解决好确实需要一点技术功底。

React 19 结合 Suspense 也在竞态问题上，提出了一个自己的解决方案。我们结合新的案例来探讨一下这个问题，看完之后大家感受一下这种方式是好是坏。

00
--

**案例**

我们先来看一下本次案例要实现的交互效果。如下图所示。每次点击会新增一条数据到下方的列表中。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonOasA2EpGDkv4x77jrGe5QRW3Ix9Cyqaggh3neHMnV8KziaLQicNPnzXg/640?wx_fmt=gif&from=appmsg)

我们来实现一下这个效果，首先定义一个用于请求接口的 promise

```
const getApi = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}
```

然后和前面的案例一样，我们将每次点击的 `api` 作为状态存储起来，通过 `api` 的改变来触发更新的执行。

```
const [api, setApi] = useState(null)
```

与此同时，我们还需要一个数组作为状态来管理列表。

```
const [list, setList] = useState([])
```

有了这个数组之后，我们需要遍历这个数组渲染成 UI

```
<div class>  {list.map((item, index) => {    return <div className='item' key={item}>{item}</div>  })}</div>
```

最后需要 loading 显示的部分，我们使用 Suspense 来完成。

```
<Suspense fallback={<div>loading...</div>}>  <Item api={api} setList={setList} /></Suspense>
```

需要注意的是，我们这里把 `setList` 传递进入了子组件。这个细节需要仔细思考我的动因。

我们要考虑的问题是，当我们在 Suspense 之外，需要知道请求成功的状态和数据时，只有在 Suspense 的子组件内部才可以获取到。Suspense 子组件和外面的 Loading 是一个互斥的显示关系。

因此，我们要在子组件内部去获取请求成功的数据结果。

```
const Item = ({api, setList}) => {  const [show, setShow] = useState(true)  const joke = api ? use(api) : {value: 'nothing'}  useEffect(() => {    if (!api) return    setList((list) => {      if (!list.includes(joke.value)) {        return list.concat(joke.value)      }      return list    })    setShow(false)  }, [])  const __cls = show ? '_03_a_value show' : '_03_a_value'  return (    <div className={__cls}>{joke.value}</div>  )}
```

> 状态 show 是为了让最后一条数据在列表中显示，而不在这里显示

这里我们使用了 `useEffect` 来表示子组件渲染完成时需要执行的逻辑。注意 React 19 虽然通过很多方式大幅度弱化了 `useEffect` 的存在感，但是偶尔在合适的时候使用也是必要的。

我在合并 `list` 的过程中，添加了一个判断。

```
setList((list) => {  if (!list.includes(joke.value)) {    return list.concat(joke.value)  }  return list})
```

这个细节在真实项目开发中尤其重要。因为 React 19 严格模式之下，组件会让 `useEffect` 执行两次，以模拟生产环境的重复请求问题，因此，我这里做了一个判断方式同样的数据连续推送到数组里，从而导致线上 bug 的发生。

> 一个程序员是否经验丰富，是否成熟，都是体现在这些生产环境的细节中

完整代码如下

```
const getApi = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}export default function Index() {  const [api, setApi] = useState(null)  const [list, setList] = useState([])  function __clickToGetMessage() {    setApi(getApi())  }  return (    <div>      <div id='tips'>点击按钮新增一条数据，该数据从接口中获取</div>      <button onClick={__clickToGetMessage}>新增数据</button>      <div class>          {list.map((item, index) => {            return <div className='item' key={item}>{item}</div>          })}        </div>                <Suspense fallback={<div>loading...</div>}>          <Item api={api} setList={setList} />        </Suspense>      </div>    </div>  )}const Item = ({api, setList}) => {  const [show, setShow] = useState(true)  const joke = api ? use(api) : {value: 'nothing'}  useEffect(() => {    if (!api) return    setList((list) => {      if (!list.includes(joke.value)) {        return list.concat(joke.value)      }      return list    })    setShow(false)  }, [])  const __cls = show ? '_03_a_value show' : '_03_a_value'  return (    <div className={__cls}>{joke.value}</div>  )}
```

这样之后，我们的目标基本就完成了。接下来，我们需要观察，当我恶意重复点击按钮，会发生什么事情。

01
--

**连续点击**

恶意连续点击之前，我根据我以往的经验预测一下可能会发生什么事情。

首先，多次点击会导致多次请求，因此数组中会新增大量的数据。

其次，由于请求太密集，那么点击的先后顺序，与请求成功的先后顺序不一致，因此列表中的顺序也会与点击顺序不同。「竞态问题」

那么我们来试着操作一下，看看该案例会有什么反应。演示结果如下，新增一条数据时，我连续点击了 10 次。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonryRkibrHUX5EogGp2KoALzCPD5PbkQothtlZhxAeMh12Gb3lVanGEdQ/640?wx_fmt=gif&from=appmsg)

结果我们发现，点击期间，并没有新的数据渲染到页面上，一直是 loading 的状态。

再来看一下此时的请求情况。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonKQ3dBa0BcIQ2Lxfib5fqmc6LOa1rhsUjbZsLjEEvNT3VuMOKU2PJic6w/640?wx_fmt=gif&from=appmsg)

请求的顺序被严格控制了：上一个请求请求成功之后，下一个请求才开始发生。此时是一个串行的请求过程。

react 19 使用这种思路解决了竞态问题。与此同时，反馈到数据上，虽然前面多次的请求已经成功，但是对于组件状态来说，这个中间过程中一直有请求在发生，此时 React 认为中间的请求产生的数据为无效数据。只会把最后一个请求成功的数据作为最终的返回结果。

02
--

**是好是坏**

很显然，仅从 UI 结果上来说，这样的处理方式确实是非常合理的，我们不需要过多的干涉数据的处理，非常的轻松。但问题是，每次请求都成功发生。

当我点击 10 次，就会有 10 次请求，由于使用串行的策略来解决竞态问题，导致最后一次的请求结果需要等待很长实践才会返回。这无疑极大的降低了开发体验。

和取消上一次的请求相比，无论是从体验上，还是从效率上来说，无疑都是更差的一种方案。

因此，我们可以简单基于目前的代码，使用禁用按钮的方式，来防止重复请求。

在父组件中定义一个状态用于控制按钮的禁用状态

```
const [disabled, setDisabled] = useState(false)
```

并将其传递给按钮 button 组件的 disabled 属性。

```
<button   disabled={disabled}   onClick={__clickToGetMessage}>新增数据</button>
```

点击时，我们将其设置为 true，此时一个新的请求会发生

```
function __clickToGetMessage() {  setDisabled(true);  setApi(getApi())}
```

请求成功之后，我们在子组件的 `useEffect` 中，将其设置为 false。子组件代码调整如下

```
const Item = ({api, setList, setDisabled}) => {  const [show, setShow] = useState(true)  const joke = api ? use(api) : {value: 'nothing'}  useEffect(() => {    if (!api) return+   setDisabled(false)    setList((list) => {      if (!list.includes(joke.value)) {        return list.concat(joke.value)      }      return list    })    setShow(false)  }, [])  const __cls = show ? '_03_a_value show' : '_03_a_value'  return (    <div className={__cls}>{joke.value}</div>  )}
```

演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonrcWQ2iacoyJA3AxdN8kk83JOiaFNiaxmiaYhm0J6RTyicB1d1LhH3f1Sz3Q/640?wx_fmt=gif&from=appmsg)

这种方式也可以比较合理的解决竞态问题。

后续我们通过别的案例，再来演示通过取消上一次的接口请求方式是如何实现的。

03
--

**最后**

给大家介绍一本我写的高质量合集：**React 知命境**。这是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册。点击「前端码易」即可阅读。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHkeys7LZdzYcwaLqGcnkonIooVicrta87QPAOfLavCMkkpalEMClIWaeGG2MPWrbex7NR11vOYgsw/640?wx_fmt=png&from=appmsg)

[购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好，学习进度加倍。赞赏之后也能看到 React 哲学的全部内容与群内高质量直播录屏。