> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aU2YhgPQ5XUzrmVWRzn4EQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEicytlhXLmRbwEqV9jNdskArqfyj3uhxa3dmliaZKVLCSfsiapgL6yCU6rxsTFsyFdicvpWkb8PCplyg/640?wx_fmt=png&from=appmsg)

**有一种复杂场景 React 新手经常处理不好。**

那就是一个页面有多个模块，每个模块都有自己的数据需要请求。与此同时，可能部分模块的数据还要依赖父级的异步数据才能正常请求自己的数据。如下图所示，当我们直接访问该页面时，页面请求的数据就非常多。而且这些数据还有一定的先后依赖关系。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEicytlhXLmRbwEqV9jNdskAGZgkVbVx1dA0y52j8pFbFTQNiceVH2uiaZg9SFArTngH7vhd0BRxicAAA/640?wx_fmt=png&from=appmsg)

大概数据请求的顺序依次如下

```
1. 自动登录 -> 个人用户信息，权限信息
2. 左侧路由信息
3. 页面顶层数据
4. 页面五个模块各自的数据
```

这些接口数据依赖关系比较明确，前面的接口请求完成之后，后续的接口才能正确请求。

如果页面四个模块的接口数据相互之间没有关系，其实整个页面还会简单一些，但是很多时候复杂度往往来自于**后端的不配合**。前端与后端的沟通在一些团队经常出现问题。

有的后端不愿意配合前端页面结构修改接口，前端也沟通不下来，只能自己咬牙在混乱的接口情况下写页面，就导致了无论是组件的划分也好还是页面的复杂度也好都变得杂乱无章。从而增加了开发成本。

因此，只有在一些比较规范的团队里，页面五个模块的数据解耦做得比较好。模块之间干净简洁的依赖关系能有效降低开发难度。

> 因此许多前端比较依赖把所有接口都放在父级组件中去请求的方案，这样不管你的接口是否混乱，在前端总能处理。但是这样的结果就是页面组件的耦合变得更加严重

在 React 19 中，我们可以使用 `Suspense` 嵌套来解决这种请求之间前后依赖的方案。我们在项目中模拟了这种场景的实现。具体的演示图如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEicytlhXLmRbwEqV9jNdskAo4iaztNHNMsplk7Qz8icmqCWokZLsRzG5Ks2NFBCq7HCEeEF6KgIMUYg/640?wx_fmt=gif&from=appmsg)

1
-

**重新考虑初始化**

和之前的方案一样，我们先定义父组件的请求接口

```
const getMessage = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}
```

然后在父组件中，将 `getMessage()` 执行之后返回的 promise 作为状态存储在 `useState` 中。这样，当我点击时，只需要重新执行依次 `getMessage()` 就可以更新整个组件

```
const [  messagePromise,   setMessagePromise] = useState(null)
```

但是此时我们发现，messagePromise 并没有初始值，因此初始化时，接口并不会请求。这种情况下，有两种交互我们需要探讨。一种是通过点击按钮来初始化接口。另外一种就是组件首次渲染就要初始化接口。

我们之前的案例中，使用了取巧的方式，在函数组件之外提前获取了数据，这会导致访问任何页面该数据都会加载，因此并非合适的手段

```
// 我们之前的案例这样做是一种取巧的方式const api = getMessage()function Message() {  ...
```

但是如果我们直接把 `getMessage()` 放在组件内部执行，也存在不小的问题。因为当组件因为其他的状态发生变化需要重新执行时，此时 `getMessage()` 也会冗余的多次执行。

```
// 此时会冗余多次执行const [  messagePromise,   setMessagePromise] = useState(getMessage())
```

理想的情况是 `getMessage()` 只在组件首次渲染时执行依次，后续状态的改变就不在执行。而不需要多次执行。

我们先来考虑通过点击事件初始化接口的交互。此时我们可以先设置 `messagePrmoise` 的初始值为 null.

```
const [  messagePromise,   setMessagePromise] = useState(null)
```

不过这样做有一个小问题就是如果我将 `messagePromise` 值为 null 时传递给了子组件。那么子组件就会报错，因此我们需要特殊处理。一种方式就是在子组件内部判断

```
const MessageOutput = ({messagePromise}) => {  if (!messagePromise) return  const messageContent = use(messagePromise)
```

或者

```
// 这种写法是在需要默认显示状态时的方案const MessageOutput = ({messagePromise}) => {  const messageContent = messagePromise ? use(messagePromise) : {value: '默认值'}
```

另外一种思路就是设置一个状态，子组件基于该状态的值来是否显示。然后在点击时将其设置为 true

```
const [show, setShow] = useState(false)function __clickHandler() {  setMessagePromise(getMessage())  setShow(true)}
```

```
{show && <MessageContainer messagePromise={messagePromise} />}
```

另外一种交互思路就是初始化时就需要马上请求数据。此时我们为了确保 `getMessage()` 只执行一次，可以新增一个非 state 状态来记录组件的初始化情况。默认值为 false，初始化之后设置为 true

```
const i = useRef(false)let __api = i.current ? null : getMessage()const [  messagePromise,   setMessagePromise] = useState(null)
```

然后在 `useEffect` 中，将其设置为 true，表示组件已经初始化过了。

```
useEffect(() => {  i.current = true}, [])
```

这是利用 `useState` 的内部机制，初始化值只会赋值一次来做到的。从而我们可以放心更改后续 `__api` 的值为 null.

> 从这个细节的角度来说，函数组件多次执行的确会给开发带来一些困扰，Vue3/Solid 只执行一次的机制会更舒适一些，不过处理得当也能避免这个问题。

2
-

**Suspense 嵌套**

接下来，我们需要考虑的就是 Suspense 嵌套执行的问题就行了。这个执行起来非常简单。我们只需要将有异步请求的模块用 Suspense 包裹起来当成一个子组件。然后该子组件可以当成一个常规的子组件作为 Suspense 组件的子组件。

例如，我们声明一个子组件如下所示

```
const getApi = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}export default function Index(props) {  const api = getApi()  return (    <div>      <div id='tips'>多个 Suspense 嵌套，子组件第一部分</div>      <div class>        <div className='_05_dou1_message'>父级消息: {props.value}</div>        <Suspense fallback={<div>Loading...</div>}>          <Item api={api} />        </Suspense>      </div>    </div>  )}const Item = ({api}) => {  const joke = api ? use(api) : {value: 'nothing'}  return (    <div className='_03_a_value_update'>子级消息：{joke.value}</div>  )}
```

然后我可以将这个子组件放在 Suspense 内就可以了

```
import DouPlus1 from './Dou1'import DouPlus2 from './Dou2'
```

```
const MessageOutput = ({messagePromise}) => {  const messageContent = use(messagePromise)  return (    <div>      <p>{messageContent.value}</p>      <DouPlus1 value={messageContent.value} />      <DouPlus2 value={messageContent.value} />    </div>  )}
```

在另外一个子组件中，我们还设计了内部状态，用于实现切换按钮，来增加页面交互的复杂度。并且每次切换都会请求接口。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEicytlhXLmRbwEqV9jNdskA6gKDFpmzdKibnYDdBKCEiboyGmV3YsZQibZKbEH06R25TW0r78icn0BYlg/640?wx_fmt=gif&from=appmsg)

如果切换时，上一个接口没有请求完成，React 会自己处理好数据的先后问题。不需要我们额外考虑竞态条件的情况。完整代码如下

```
var tabs = ['首页', '视频', '探索']export default function Index() {  var r = useRef(false)  var api = r.current ? null : getApi()  const [promise, setPromise] = useState(api)  const [current, setCurrent] = useState(0)  useEffect(() => {    r.current = true  }, [])  return (    <div>      <div id='tips'>多个 Suspense 嵌套，子组件第二部分</div>      <div class>        {tabs.map((item, index) => (          <button             id='btn_05_item'             className={current == index ? 'active' : ''}            onClick={() => {              setCurrent(index)              setPromise(getApi())            }}            key={item}          >{item}</button>        ))}                <Suspense fallback={<div className='_05_a_value_item'>Loading...</div>}>          <Item api={promise} />        </Suspense>      </div>    </div>  )}const Item = ({api}) => {  const joke = use(api)  return (    <div className='_05_a_value_item'>{joke.value}</div>  )}
```

3
-

**总结**

当我们要在复杂交互的情况下使用嵌套 Suspense 来解决问题，如果我们组件划分得当、与数据依赖关系处理得当，那么代码就会相当简单。不过这对于开发者来说，会有另外一个层面的要求。那就是如何合理的处理好组件归属问题。

许多前端页面开发难度往往都是由于组件划分不合理，属性归属问题处理不够到位导致的。因此 `Suspense` 在这个层面有了一个刚需，开发者必须要具备合理划分组件的能力，否则即使使用了 `Suspense`，也依然可能导致页面一团混乱。

end
---

**最后**

给大家介绍一本我写的高质量小册：**React 知命境**。这是一本从知识体系顶层出发，理论结合实践，通俗易懂，覆盖面广的精品小册。点击「前端码易」即可阅读。

> 首页 --> 合集 --> React 知名境

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEicytlhXLmRbwEqV9jNdskAFq6fDLa40PALJIrgDq3KibKibQ7OIMy33ic8cXmJ56NdDrxfCcTCmONKA/640?wx_fmt=png&from=appmsg)

[购买 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)，或者赞赏本文 30 元，可进入 **React 付费讨论群**，学习氛围良好。进群之后可在群公告观看高质量直播录屏。