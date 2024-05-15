> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PDo69mFIU3HVuBqqcLBuUA)

1.  **一、**异步更新更舒适的交互方式
    
2.  **二、**useTransition 概念解读
    
3.  **三、**Suspense 结合 useTransition 使用
    
4.  **四、**新交互下，input 框**实时请求**的难点与最佳实践
    

本文主要内容如上，全文共 **2463** 字，阅读预计用时 3 分钟。

1
-

**更舒适的交互**

先来看一下我们想要实现的交互效果，如图所示。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tia2r0tCibm5CuuibbrIfbaUQe83x4gR07cc7jnZUia7G2A3nPSwejUSMjVw/640?wx_fmt=gif&from=appmsg)

我们在前面学习了 Suspense。Suspense 的 fallback 与子组件内容的显示是一个互斥关系。因此，当我们在请求过程中，需要显示 Loading 时，内容就会被隐藏掉。

```
<Suspense fallback={<Loading />}>  <Albums /></Suspense>
```

之前我们实现的交互效果如下。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tia2z6NOhJgFvW0aibPibQyzGYTaxl0gyp8l9ZAsyNDNxIWT1HZ9TPrpRzg/640?wx_fmt=gif&from=appmsg)

这种交互效果其实还可以，**但是许多对交互有更高要求的团队，不会接受这样的页面大幅度抖动的交互。**

例如在 antd 的 `Table` 组件中，它们选择的方案是在列表组件上覆盖了一个 `Loading`，此时的 Loading 效果与列表并非是一个互斥关系。这样的交互体验要比用 `Loading` 整体替换掉表格要好很多。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tiaCiaem27ickDR112CWqtdZw9cd7XyOJiaqibQegknicLDXbOoElznj2Z6bkQ/640?wx_fmt=gif&from=appmsg)

所以，在目前学习阶段，我们面临的一个困惑就是，在使用 `Suspense + use` 来完成功能的同时，又如何优雅的做到这种非互斥的交互效果呢？

我们想要的最佳交互效果氛围两个阶段。

**1、** 初始化阶段，渲染 Suspense `fallback` 对应的组件。此时内部还没有办法显示，我们可以放置一个 Loading 或者骨架屏组件。

**2、** 更新阶段，我们希望阻止 `fallback` 的出现。直接在 Suspense 子组件内部处理更新阶段的 loading。这样就可以确保更新阶段，子组件内容与更新 loading 共存。

但是以目前学习到的知识点，肯定还做不到这样的效果，因此我们要引入新的概念：**useTransition**

2
-

**useTransition 概念解读**

`useTransition` 是 React 专门为并发模式提供的一个基础 hook，它能够帮助我们在不阻塞 UI 渲染的情况下更新状态。意思就是说，我们可以借助 `useTransition` 将任务的优先级调得比 I/O 的响应低一些。

```
const [isPending, startTransition] = useTransition()
```

`useTransition` 的调用不需要参数，他的执行返回两个参数

**1、isPending**：是否还存在等待处理的 `transition`，表示被降低优先级的更新任务还没有处理完成

**2、**：**startTransition**：标记任务的优先级为 `transition`，该优先级低于正常任务更新。它的用法如下，我们会将更新任务在它的回调函数中执行

```
function TabContainer() {  const [isPending, startTransition] = useTransition();  const [tab, setTab] = useState('about');  function selectTab(nextTab) {    startTransition(() => {      setTab(nextTab);    });  }  // ……}
```

在优先级的排序中，被 `startTransition` 标记的任务比 Suspense fallback 更高一些。因此，我们可以利用这个特性，来避免 fallback 的渲染，当 startTransition 标记的任务执行完成，请求已经完成，此时 fallback 也就得不到渲染的机会了。

> 这里需要注意的是，标记的任务指的不是 `setState` ，而是对应的 UI 渲染任务，传递给 startTransition 的回调函数必须是同步函数

我们可以正常这样使用

```
startTransition(() => {  // ✅ 在调用 startTransition 中更新状态  setPage('/about');});
```

但是不能在回调函数中使用异步调用。这样会导致并发模式的任务排序出现问题。

```
startTransition(() => {  // ❌ 在调用 startTransition 后更新状态  setTimeout(() => {    setPage('/about');  }, 1000);});
```

但是，我们可以把 `startTransition` 传递给 `setTimeout`

```
setTimeout(() => {  startTransition(() => {    // ✅ 在调用 startTransition 中更新状态    setPage('/about');  });}, 1000);
```

```
startTransition(async () => {  await someAsyncFunction();  // ❌ 在调用 startTransition 后更新状态  setPage('/about');});
```

```
await someAsyncFunction();startTransition(() => {  // ✅ 在调用 startTransition 中更新状态  setPage('/about');});
```

3
-

**Suspense + useTransition**

现在基于前面的知识点，我们来着手解决我们自己案例中的交互体验的提升。先来回顾一下之前的代码。

```
export default function Index() {  const [api, setApi] = useState(getApi)  function __clickToGetMessage() {    setApi(getApi())  }    return (    <div>      <div id='tips'>点击按钮获取一条新的数据</div>      <button onClick={__clickToGetMessage} disabled={isPending}>获取数据</button>      <div class>        <Suspense fallback={<div>loading...</div>}>          <Item api={api} isPending={isPending} />        </Suspense>      </div>    </div>  )}
```

在这个基础之上，我们只需要引入 `useTransition` 的使用即可。

```
export default function Index() {  const [api, setApi] = useState(getApi)  const [isPending, startTransition] = useTransition()  function __clickToGetMessage() {    startTransition(() => {      setApi(getApi())    })  }    ...}
```

`setApi` 所引发的任务更新被标记为 `transition`，他的优先级比 fallback 更高，因此此时我们需要等待 `setApi` 执行完成。`isPending` 表示是否还有待处理的 `transition` 任务，在这个案例中，他可以表示请求正在发生，作用与 `loading` 完全一致。

因此，我们可以将 `isPending` 传递给子组件，在子组件内部通过 `isPending` 来设计 loading UI。我们这里将组件的透明度调低。

```
<Item api={api} isPending={isPending} />
```

```
const Item = (props) => {  const {isPending, api} = props  const joke = use(api)  return (    <div       className='a_value'       style={{opacity: isPending ? 0.5 : 1}}    >{joke.value}</div>  )}
```

最终的演示效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tia2r0tCibm5CuuibbrIfbaUQe83x4gR07cc7jnZUia7G2A3nPSwejUSMjVw/640?wx_fmt=gif&from=appmsg)

> `loading...` 字样的出现表示初始化时请求接口。整体变浅表示更新时请求接口。完整的达到了我们的诉求。

4
-

**input 中的实时请求**

我们可以利用同样的方式，在搜索快速输入时做到这个交互。每一个字符的变化，在之前的尝试中，我们都会请求一次接口。因此之前的交互如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tia1RKhy0Iev9MFuYgrkHy14Xibg9ibDqc5qckiaFOuYPNuzn8J5xiaUp3iaicQ/640?wx_fmt=gif&from=appmsg)

我们希望如果列表已经显示过一次，那么在搜索过程中，列表就显示旧值，而不用切换到 fallback 的 Loading 组件。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tiawokG970plDoddXtYpwykzlsL7vu70OyTfmybGzm7N0OvwrviangaaJw/640?wx_fmt=gif&from=appmsg)

代码的调整与上面的案例几乎一样，如下：

```
export default function Index() {  const [api, setApi] = useState(postApi)  const [isPending, startTransition] = useTransition()  function __inputChange() {    startTransition(() => {      api.cancel()      setApi(postApi())    })  }  ....
```

但是，我们注意观察交互动画，当我们输入完之后，过了很长一段时间，`isPending` 状态才发生变化。也就是说，在这很长的时间里，一直有 `transition` 任务在执行。为什么会发生这种事情呢？然后我们观察了一下 `network` 面板，发现每一个请求都发生了。取消请求的代码并没有生效。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tiaFz8AoAx3lx5JxeET1nkurB3ibR9DQMvsAqAIiagiaOGYB4ib2GgWqGxWjQ/640?wx_fmt=png&from=appmsg)

这个时候我们在官方文档中看到，`useTransition` 并不会中断网络请求。目前我暂时也还没有找到一个比较好的方式，在结合了 `useTransition` 的情况下去优雅的取消请求。

> 希望评论区能出现大佬找到更好的方案。

因此，我选择了使用防抖的思路来避免多次请求的发生。代码改造如下：

```
const [api, setApi] = useState(postApi)const [isPending, startTransition] = useTransition()const timer = useRef(21)function __inputChange() {  clearTimeout(timer.current)  timer.current = setTimeout(() => {    startTransition(() => {      api.cancel()      setApi(postApi())    })  }, 300)  }...
```

最终交互效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tiaOvOUDag3J4VMSicEthsdsk9FojulUenzX5lUQGDgOlXD5djUkBD1oZg/640?wx_fmt=gif&from=appmsg)

当然，在官方文档中，也提到了，如果我们期望在交互过程中减少冗余请求的发生，我们可以继续使用**防抖 / 节流**来解决问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcELLibDZia8FlicicGSlvt7s1tiaVOhBrkQIiaMfbgCMicgklO0xEAHaRkicr61DbBe6ibGmy8SxOYZsQOvkTw/640?wx_fmt=png&from=appmsg)

5
-

**end**

我一直有在试图优化文章的阅读体验。例如我多次调整文章排版细节。以及给每一个演示案例都写上比较规范的样式，至少看上去不那么原始，虽然这会花费更多的时间去创作。

在这篇文章的最前面，我新增了一个大标题，用于提前分享本文有什么主要内容，但是我并不确认这种方式对于阅读体验是否有所提升，你可以在在评论区给我一些反馈。

除此之外，对于提高文章阅读体验，如果你有其他更好的建议，也可以在评论区反馈给我。

* * *

本文将会收录至：前端码易

要成为 React 高手，[推荐阅读 `React 哲学`](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)