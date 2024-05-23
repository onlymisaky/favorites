> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/U-UWD86NHcuHTEgwqkuqqQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dpywUgwyVlGCHUOiaM9fWZNXV8xjSxf9MLSeCdpQLNzhC9fjNAh6Wb1g/640?wx_fmt=jpeg&from=appmsg)

先预警一下，完全消化本文内容有点难。੯‧̀͡ ζྀི

*   **useDeferredValue 解决真实场景问题的案例**
    
*   **useDeferredValue 基础知识**
    
*   **复杂案例渲染过程分析**
    
*   **useDeferredValue 底层执行原理分析**
    
*   **重新分析取消请求案例**
    

全文共 **5104** 字，阅读需要花费 10 分钟。

**useDeferredValue**，一个出了很久，但是我几乎没咋在实践中用到过的超冷门 hook。它有多冷门呢，我之前甚至都觉得没必要介绍它。

直到前几天，一个粉丝给了我重要的思路，我才认识到它的威力，逐渐深入了解之后发现它简直就是一个宝藏 hook，说它是为了 Suspense 量身订做的都不为过。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dzmBTOUicMQmP4YIpNEoDNl2iaQmdw9vib17umxUW64LVACiaEhibHjzRTkg/640?wx_fmt=png&from=appmsg)

原来我一直都小瞧了它....

它的存在，直接补齐了 React 19 新架构思维最佳实践的最后一块短板。

正因为认识到了它的重要性，所以我迫不及待的想把它分享给大家。

1
-

**遇到了一个问题**

如图所示，在之前的案例中，我想要实现这样一个功能：当我快速在输入框中输入内容时，我希望请求能自动发生，并且请求发生时，之前存在的列表不能被替换为 Loading 组件。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dUlLE1icKjdGBx1BZRtFEickSeLbqe2HHYmMEibOQLLAbfq4NicbRPp0Rwg/640?wx_fmt=gif&from=appmsg)

此时，我使用 `useTransition` 勉强实现了该功能。主要代码如下

```
export default function Index() {  const [api, setApi] = useState(postApi)  const [isPending, startTransition] = useTransition()  function __inputChange() {    startTransition(() => {      api.cancel()      setApi(postApi())    })  }  ....
```

```
<Suspense fallback={<div>loading...</div>}>  <List api={api} isPending={isPending} /></Suspense>
```

```
const List = ({api, isPending}) => {  const posts = use(api)    return (    <ul className='_04_list' style={{opacity: isPending ? 0.5 : 1}}>      {posts.map((post) => (        <div key={post.id} className='_04_item'>          <h2>{post.title}</h2>          <p>{post.body}</p>        </div>      ))}    </ul>  )}
```

useTransition 能够阻止 Suspense 在请求发生时，渲染 fallback 中的 Loading 组件，并且，`isPending` 也能表示请求正在发生，因此，我把 isPending 传入到子组件中，那么我们就可以在子组件中自定义请求状态。

这基本达到了我想要的交互效果。

但是一个严重的问题是，我每次输入，都会发送一个请求，当我快速输入时，我希望通过**取消上一次还没完成的请求**的方式来优化交互效果。useTransition 并不支持我这样做。

核心原因是因为 useTransition 的任务会排队依次执行，当我想要在下一个任务开始时，取消上一个请求时，上一个任务已经执行完了。因此 `api.cancel()` 虽然成功执行了，但是并起不到取消请求的效果，它执行时，已经没有未完成的请求了。

useTransition 无法取消请求。我思考了很久，也没摸索出来一个合适的方案。因此之前我只能使用防抖来做这个优化。

```
const [api, setApi] = useState(postApi)const [isPending, startTransition] = useTransition()const timer = useRef(null)function __inputChange() {  clearTimeout(timer.current)  timer.current = setTimeout(() => {    startTransition(() => {      api.cancel()      setApi(postApi())    })  }, 300)  }...
```

但是很显然，这不是很优雅，因为防抖实际上和 useTransition 有类似的作用，用了防抖之后，useTransition 在这里的存在就变得有点尴尬了。

意外之喜的是，有大佬级别的粉丝在评论区给我提供了一个非常优雅的解决思路。那就是利用 useDeferredValue

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dzmBTOUicMQmP4YIpNEoDNl2iaQmdw9vib17umxUW64LVACiaEhibHjzRTkg/640?wx_fmt=png&from=appmsg)

按照粉丝的思路，我把代码改造如下

```
export default function Index() {  const [api, setApi] = useState(postApi)  const deferred = useDeferredValue(api)  function __inputChange(e) {    api.cancel()    setApi(postApi())  }  ...
```

```
<Suspense fallback={<div>loading...</div>}>  <List api={deferred} isPending={api !== deferred} /></Suspense>
```

验证之后发现，我靠，成了！

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dLTJNoKVYPicrH7eZf8icK4Nl1TmL2yTq1D5OZuqsCMaAXicDtyyxCKmqg/640?wx_fmt=gif&from=appmsg)

肃然起敬！！！！

在保证了代码优雅的情况之下，轻松实现了我理想中的效果。useDeferredValue 直接补齐了 React 19 异步开发中，最佳实践的最后一块短板!

代码就这么几行，但是要理解 useDeferredValue，可能就要花点时间了。我们一起来学习一下

2
-

**useDeferredValue 基础**

useDeferredValue 是一个可以推迟 UI 更新的 hook。这句话理解起来有点困难。需要我稍微给各位道友解读一下

在正常情况下，一个 state 的变化，会导致 UI 发生变化。例如下面这个案例

```
function Index() {  const [counter, setCounter] = useState(0)  function __clickHanler() {    setCounter(counter + 1)  }  return (    <div>      <div id='tips'>基础案例，state 递增</div>      <button onClick={__clickHanler}>counter++</button>      <div class>counter: {counter}</div>      <div class>counter: {counter}</div>    </div>  )}
```

这里需要注意的是，状态 `counter` 被两个元素使用，因此，这两个元素的更改，实际上是**一个任务**。他们必定会同时响应 counter 的变化。

但是这个时候，我们可以利用 useDeferredValue，把他们拆分成两个任务。

```
function Index() {  const [counter, setCounter] = useState(0)  const deferred = useDeferredValue(counter)  function __clickHanler() {    setCounter(counter + 1)  }  return (    <div>      <div id='tips'>基础案例，state 递增</div>      <button onClick={__clickHanler}>counter++</button>      <div class>        counter: {counter}      </div>      <div class>        counter: {deferred}      </div>    </div>  )}
```

注意看，我们使用 counter 作为 useDeferredValue 的初始值，并将其返回值替换第二个元素

```
const deferred = useDeferredValue(counter)
```

```
<div class>  counter: {deferred}</div>
```

此时，第二个元素的更新，就不再与第一个元素同步。它更新的优先级被降低。这个时候它的执行在理论上是可以被更高的优先级插队和中断的。

但是由于渲染都太短了，我们肉眼无法区分出来两个任务已经被分开了，因此我们把第二个元素重构成一个子组件，并模拟成一个耗时组件。此时我们就能明显看出区别来。

```
<Expensive counter={deferred} />
```

```
const Expensive = ({counter}) => {  const start = performance.now()  while (performance.now() - start < 200) {}  return (    <div class>Deferred: {counter}</div>  )}
```

演示效果如下。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dPdMgxaSJEh6zKkU0F6ZG2ToBjib3B0gSGD9Smc2vfTlDRZicuoZ7JFTA/640?wx_fmt=gif&from=appmsg)

因此，我们可以利用 useDeferredValue 推迟 UI 的更新。将对应任务的优先级降低，使其可以被插队与中断。

3
-

**复杂案例分析**

在这里，我们要更加清楚的理解任务和渲染任务，才能对案例的分析更加的精准。以上一个例子的 `Expensive` 组件为例。

状态变化时，diff 会发生，Expensive 函数本身作为 diff 过程的一部分，它必定也会执行，但是这里我们注意，它对应的渲染任务，却是可以被阻止执行的。

例如在上面的例子中，当我快速点击按钮递增时，Expensive 组件不会依次递增。效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dqSchde0wVicA6xlrjW9HCgcia6H6xfstuMVM27a1SCnicibPFrpKBtNdNw/640?wx_fmt=gif&from=appmsg)

我们发现，Expensive 组件的渲染直接从 0 变成了 7.

这是因为作为一个耗时任务，又被标记了低优先级，因此它的渲染任务不停的被优先级更高的 counter 中断并放弃。因此直接从 0 变成了 7.

但是此时我们也发现另外一个情况，那就是 counter 直接对应的高优先级执行也没有那么流畅，这是为什么呢？其实很简单，因为在我们的模拟案例中，并没有把耗时定位在渲染上。这可能和实践情况会不太一样。我们把耗时写在了 Expensive 函数里，而这个函数每次都会执行，它的执行阻塞了渲染。

```
const Expensive = ({counter}) => {  const start = performance.now()  while (performance.now() - start < 200) {}  return (    <div class>Deferred: {counter}</div>  )}
```

> ✓
> 
> 所以这里我们一定要区分开渲染任务和 Expensive 函数，他们是不同的，UI 渲染是一个异步任务，而 Expensive 函数是同步执行的。useDeferredValue 推迟的是 UI 渲染任务。因此，我们需要特别注意的是，不要在同步逻辑上执行过多的耗时任务。

但是我们可以通过任务拆分的方式，把执行耗时时间分散到更多的子组件中去，这样 React 就可以利用任务中断的机制，在不阻塞渲染的情况下，中断低优先级的任务。

借用官网的一个复杂案例来跟大家演示。

```
function SlowList({ text }) {  // Log once. The actual slowdown is inside SlowItem.  console.log('[ARTIFICIALLY SLOW] Rendering 250 <SlowItem />');  let items = [];  for (let i = 0; i < 250; i++) {    items.push(<SlowItem key={i} text={text} />);  }  return (    <ul class>      {items}    </ul>  );}function SlowItem({ text }) {  let startTime = performance.now();  while (performance.now() - startTime < 1) {    // Do nothing for 1 ms per item to emulate extremely slow code  }  return (    <li class>      Text: {text}    </li>  )}
```

此时我们注意观察，不要错漏这个细节。slowList 中包含了 250 个子组件。每个子组件都渲染 1ms，那么整个组件渲染就需要耗时至少 250ms.

在父组件中，我们把 deferred 传递给 SlowList

```
<SlowList text={deferred} />
```

那么此时表示，slowList 的任务是低优先级。counter 对应的任务可以中断它的执行。当我快速点击时，执行效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHTcOsPzg7e9mGUAeXVDO2dzV5tDibKakFMN2yZ8z6VMkFeNMKOJoL661DpTiazicG1sSPBqicgZtSccw/640?wx_fmt=gif&from=appmsg)

此时一个很明显的区别就是，counter 的 UI 变化变得更加流畅了。这是因为耗时被拆分到了多个子组件中，React 就有机会中断这些函数的执行，并执行优先级更高的任务，以确保高优先级任务的流畅。

如果你没有使用 React Compiler，你需要使用 memo 手动缓存 `SlowList`。

```
const SlowList = memo(function SlowList({ text }) {  // ...});
```

useDefferdValue 会首先使用旧值传递给组件。

```
<SlowList text={deferred} />
```

因此，当 counter 发生变化时，deferred 依然是旧值，那么此时，如果我们使用 memo 包裹，SlowList 的 props 就没有发生变化，我们可以跳过此次针对 SlowList 的更新。

这跟 React 的性能优化策略有关。

4
-

**运行原理**

看了上面两个例子，肯定还是有一部分人会觉得很懵，不要急，接下来我们把运行原理分析一下，整个情况就清晰了。

useDeferredValue 会尝试将 UI 任务更新两次。

第一次，会给子组件传递旧值。此时 `SlowList` 接收到的 props 会与上一次完全相同。如果结合了 React.memo，那么该组件就不会重新渲染。该组件可以重复使用之前的渲染结果

> ✓
> 
> Compiler 编译之后不需要 memo

此时，高优先级的任务渲染会发生，渲染完成之后，将会开始第二次渲染。此时，将会传入刚才更新之后的新值。对于 `SlowList` 而言，props 发生了变化，整个组件会重新渲染。

我们通常会将已经非常明确的耗时任务标记为 deferred，因此，这些任务都被视为低优先级。当重要的高优先级更新已经完成，低优先级任务在第二次渲染时尝试更新...

在它第二次更新的过程中，如果又有新的高优先级任务进来，那么 React 就会中断并放弃第二次更新，去执行高优先级的任务。

> i
> 
> > > 注意：是中断，并放弃这次更新，所以表现出来的结果就是，中间会漏掉许多任务的执行

这样的运行机制有一个非常重要的好处。

那就是，如果你的电脑性能足够强悍，那么第二次的更新可能会快速完成，高优先级的任务来不及中断，那么我们的页面响应就是非常理想的。

但是如果我们的电脑性能比较差，第二次更新还没完成，新的高优先级任务又来了，那么就可以通过中断的方式，降级处理，保证重要 UI 的流畅，放弃低优先级任务。

> ✓
> 
> 在不同性能的设备上，有不同的反应，这个是跟防抖、节流的最重要的区别

5
-

**重新分析取消请求案例**

那我们回过头来，分析一下最开始的那个案例，重新看一眼代码

```
export default function Index() {  const [api, setApi] = useState(postApi)  const deferred = useDeferredValue(api)  function __inputChange(e) {    api.cancel()    setApi(postApi())  }  ...
```

```
<Suspense fallback={<div>loading...</div>}>  <List api={deferred} isPending={api !== deferred} /></Suspense>
```

这里我们将 api 做为 state，当 api 被重新赋值时，List 会经历两次更新。

首先点击事件触发，请求立即发生。api 被改变。触发组件更新。

第一次更新时，deferred 使用旧值传参，此时对于 List 而言，api 没有发生变化。因此，利用这个机制，我们可以阻止 Suspense 直接渲染成 fallback.

在 Suspense 包裹之下，只有当接口请求成功之后，deferred 的第二次更新才会发生，因此，在这个过程中，如果我们快速进行第二次点击，可以直接取消上一次请求，让第二次更新来不及执行。此时新的请求发生。

> ✓
> 
> 这里要结合 Suspense 的执行机制来理解

6
-

**总结**

这种场景的最佳实践代码非常的简洁和优雅。写起来也很舒服，性能也非常强悍。但是理解起来会比较困难。因此想要做到灵活运用，还需要多多消化。

但是，等你彻底掌握它之后，你就会发现 React 19 在异步交互上真的太优雅了。这样的开发体验，是依赖 useEffect 完全比不了的。

后续的分享中，我将会继续为大家分享 React Action 的设计核心思维与具体使用。

> ✓
> 
> 顶尖前端都在关注我，就差你啦，戳左下角
> 
> 成为 React 高手，[推荐阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)