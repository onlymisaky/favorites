> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6ttaUcgBbMh0NYIxIdyMWA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHGzKu702Af9LjBBdgPiapLMibomLF13wuz686m5Sh3BXHZa9NnHRbEc5ibQ/640?wx_fmt=png&from=appmsg)

如果你之前在开发项目的过程中，被乐观更新的需求折磨过，那么你一定会喜欢 React 19 新出的一个相关的 hook

**useOptimistic**

它让原本实现起来比较困难的乐观更新，变得非常简单。我真的太爱它了！

本文主要跟大家分享的内容包括：

*   一、什么是乐观更新
    
*   二、乐观更新的前提条件与适用场景
    
*   三、实现乐观更新需要具备的技术条件
    
*   四、React 19 是如何实现乐观更新的
    
*   五、案例一：消息发送
    
*   六、案例二：结合 useTransition
    
*   七、案例三：点赞按钮
    

全文共 **4545** 字，阅读预计需要花费 9 分钟。

1
-

**什么是乐观更新**

乐观更新，Optimisitic Update. 一个要完整实现它并不是那么容易的需求。它通常是指在提交数据时，乐观估计请求结果，不等待真实的请求结果，而直接基于乐观结果修改页面状态的交互方式。

例如，我们在聊天软件中，发送一条消息时，当我们点击**发送**之后，消息就会立即出现在聊天界面。而不会等待发送成功之后再更新页面 UI

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHGHX9riappvBt8ZYh8Z2Tib9KyyRbgaH7dnmrBnwHquVhC3qtibS2vbfaYw/640?wx_fmt=gif&from=appmsg)

如上图所示，普通的执行过程是

发送 -> 发起请求 -> 请求成功 -> 更新 UI

乐观更新的执行过程是

发送 -> 更新 UI 并发起请求 -> 请求成功

因此，乐观更新在合适的场景下，能够更加快速的响应用户交互，在体验上更好一些。

2
-

**前提条件与适用场景**

并不是所有操作都适合使用乐观更新的交互方式。它需要一些明确的前提条件

*   1、请求成功的概率非常大，几乎不会失败
    
*   2、不涉及到频繁的，密集的 UI 变化
    
*   3、可撤回的 UI 变化
    
*   4、与服务端的反馈时间短，不是一个长期的持续的响应过程
    

例如，在聊天软件中，发送一条消息，在阅读文章时，点赞收藏按钮的交互，给文章发送一条评论，删除一条评论等都非常适合乐观更新。

3
-

**实现乐观更新需要具备的技术条件**

由于乐观更新是一种在低概率的情况下，需要撤回更新状态的交互机制，因此，我们在第一时间更新到最新状态时，需要保留上一次的更新状态以便撤回。

这样的场景与 `redux/useReducer` 需要的技术架构非常类似。因此，每一次的更新我们都可以将其设计为一次 action，通过 reducer 的方式将其合并到完整数据中去

```
interface Action {  // 操作方式  type: string,  // 乐观更新的数据结构  state: {    id: 'xxx',    text: 'xxx'  }}
```

```
// 假设 state 是一个列表reducer(state, action) {  return [...state, action.state]}
```

如果保留了上一次的更新状态，我们也可以非常方便的还原数据。

除此之外，乐观更新的数据结构是我们在客户端根据预估情况生成的，因此不能直接存储在服务端，有的数据需要按照服务端的逻辑来创建，例如一条数据包含了 `id`，那么我们就不能按照客户端的逻辑来创建 id，这个时候，需要我们**在接口请求成功之后，完整的完成一次数据的替换**。

最后，还有一个非常重要的问题。那就是更新快速重复的发生时如何处理。这是乐观更新最考验开发者技术能力的地方。

当第一次请求还没结束的时候，但是此时当乐观更新重复发生，就会引发一系列不合理的问题。因此，什么时候将 action 合并到真实数据中去，就需要反复斟酌。

这里不仅要考虑更新失败时我们应该如何处理，更需要考虑竞态的顺序问题，我们必须以 action 创建的顺序将 action 合并到数据中。

在保证顺序的这个基础之上，我们还需要考虑前面如果某个 action 迟迟得不到响应，会阻塞后面 action 的合并。因此，我们还需要设计一个合理的超时机制。

> ✓
> 
> 所以，如果我们自己来设计一套完善的乐观更新机制，对开发者开发能力的要求非常高，我们可以将其作为项目亮点在面试中去介绍

因此，显而易见的是，基于并发模式的 React，解决乐观更新这类交互问题非常的适合，接下来我们就一起来学习一下 React 19 中，针对乐观更新提出来的解决方案

4
-

**React 19 是如何实现乐观更新的**

React 19 针对乐观更新，提出了一个新的 hook，useOptimistic

> i
> 
> > > 注意，乐观更新完整的技术实现一定要结合我们刚才所提到的技术基础来理解，单独只学习一个 hook，无法构成乐观更新的完整方案

它的基础语法如下

```
const [optimisticState, addOptimistic] = useOptimistic(state, updateFn);
```

注意看，useOptimistic 接收两个参数，其实这两个参数与 `reducer` 的参数非常相似。

`state` 表示当前状态，`updateFn` 表示我们如何将新的 action 合并到 `state` 中去

```
updateFn = (currentState, value) => {  // 根据上一次状态与新的 value 合并  // merge and return new state}
```

**optimisticState** 表示合并之后的新状态。但是这里我们需要特别注意的是，它是一个临时状态，并非最终状态。通常情况下，我们会使用该临时状态渲染 UI，以便 UI 能够得到最快速的响应。

**addOptimistic** 是一次操作行为，类似于 dispatch，它会将参数传递给 `updateFn`

```
addOptimistic({a: 1})-> // 此时 value = {a: 1}updateFn = (currentState, value) => {  return [...currentState, value]}
```

因此，在使用 useOptimistic 之前，我们还需要借助 useState 创造一个状态，该状态为更新的真实状态。我们通过 useOptimistic 得到的状态是一个副本，它通过 useState 的状态来初始化，在接口请求成功之后，真实状态才会得到更新。

接下来，我们来实现一个简单的案例。

5
-

**案例一：消息发送**

我们要实现的效果如下图所示。首先明确一点，消息发送是一个异步过程，因此我们把这个过程使用 `Sending...` 字符来表示，当每条消息的 `Sending...` 消失，才表示数据更新成功。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHGpaibLQEytTzbWw03tpHE19Qyx6g6NeDjIEVegte27z6oOoqjRC3picicQ/640?wx_fmt=gif&from=appmsg)

先来考虑布局。

首先我们需要一个 form 表单来处理输入的交互

```
<form id={s.form} action={formAction}>  <input    type="text"        style={{marginLeft: '10px'}}  >Send</button></form>
```

然后我们需要一个列表来渲染输出之后的结果。根据我们之前的学习结果，该列表需要用 `useOptimistic` 返回的临时状态来处理，这样我们才能够第一时间在 UI 上看到反馈结果

```
{optimisticMessages.map((message, index) => (  <div key={index}>    {message.text}    {!!message.sending && <small> (Sending...)</small>}  </div>))}
```

再来思考状态如何设计。

首先我们需要使用 useState 来设计一个状态，用于存储真实的状态结果

```
const [messages, setMessages] = useState([]);
```

然后我们需要使用 `useOptimistic` 来设计临时状态，这里需要注意的是，我们可以把它当成一个 reducer 来看待，第一个参数表示当前状态，第二参数表示一个合并方式

```
const [optimisticMessages, addOptimisticMessage] = useOptimistic(  messages,  (state, newMessage) => [    ...state,    {      text: newMessage,      sending: true    }  ]);
```

临时状态中包含一个 sending: true，用于标识当前请求正在发生。

在 `formAction` 回调函数中，我们会调用 `addOptimisticMessage` 立即更新临时状态，并发送请求，我们提前把发送请求的接口写好

```
// actions.jsexport async function deliverMessage(message) {  await new Promise((res) => setTimeout(res, 1000));  return message;}
```

那么，`formAction` 的完整逻辑为

```
async function formAction(formData) {  let newMessage = formData.get("message")  addOptimisticMessage(newMessage);  let message = await deliverMessage(newMessage);  setMessages([...messages, {text: message}])}
```

> ✓
> 
> 请求发送成功之后，更新真实状态

这样，一个简单的乐观更新交互，我们就完成了，该案例的完整代码如下

```
import { useOptimistic, useState, useRef } from "react";import { deliverMessage } from "./actions.js";import s from './index.module.css'export default function Index() {  const [messages, setMessages] = useState([]);  const [optimisticMessages, addOptimisticMessage] = useOptimistic(    messages,    (state, newMessage) => [      ...state,      {        text: newMessage,        sending: true      }    ]  );  const form = useRef(null);  async function formAction(formData) {    let newMessage = formData.get("message")    addOptimisticMessage(newMessage);    form.current.reset();    let message = await deliverMessage(newMessage);    setMessages([...messages, {text: message}])  }  return (    <>      <form id={s.form} action={formAction} ref={form}>        <input          type="text"                    style={{marginLeft: '10px'}}        >Send</button>      </form>      {optimisticMessages.map((message, index) => (        <div key={index}>          {message.text}          {!!message.sending && <small> (Sending...)</small>}        </div>      ))}    </>  );}
```

> ✓
> 
> reset() 用于立即重置表单内容，可进行下一次输入。默认行为是接口请求成功之后才会重置

6
-

**案例二：结合 useTransition**

这样案例就完了吗？还没完，我们之前在思考乐观更新需要的技术基础时，还提到了别的问题。当一次请求的过程中，连续发送了多条消息会发生什么事情呢？

我们来演示看一下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHG6watVznoUt7JznSUARH7X9XTOrCdZR0p2gxFQichfTFwYDQvyvibsWvw/640?wx_fmt=gif&from=appmsg)

我们发现，并不是每一条消息都被成功合并到真实状态中了。最终结果是有的消息不见了。那如何解决这个问题呢？

我们可以结合 `useTransition` 来防止用户连续触发 `formAction` 的执行

```
const [isPending, startTransition] = useTransition()
```

formAction 的定义调整为：

```
async function formAction(formData) {  let newMessage = formData.get("message")  form.current.reset()  startTransition(async () => {    addOptimisticMessage(newMessage);    let message = await deliverMessage(newMessage);    setMessages((messages) => [...messages, {text: message}])  })}
```

然后使用 `isPending` 来控制输入的禁用状态

```
<form id={s.form} action={formAction} ref={form}>  <input    type="text"    Hello!"    disabled={isPending}  />  <button    type="submit"    disabled={isPending}    style={{marginLeft: '10px'}}  >Send</button></form>
```

最终演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHGqHQHqT5ukYGV7l9dep9vdJOjDp8SBMltvPUqdIuHzwRNetgqcAMmibw/640?wx_fmt=gif&from=appmsg)

> i
> 
> > > 留一个思考题给大家：很明显，这并不是最合理的交互方案。我们期望的是，连续输入依然能够发生，在这个基础之上我们可以控制好数据的合并逻辑，那么借助 react 19 的机制，我们可以如何实现呢？

7
-

**案例三：点赞按钮**

再来实现一个比较常见的点赞按钮的交互逻辑。演示效果如下图所示

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHGSa44vtu6Vicicxy3GaDibjfelrXnBR8I8801WJTZlAeibiaxT2VUeFhuhxQ/640?wx_fmt=gif&from=appmsg)

当按钮处于灰色状态时，表示用户还未点赞该文章。点击之后，变成红色，表示点赞。

当按钮处于红色状态时，表示用户已经点赞该文章。点击之后变成灰色，表示取消点赞。

解决方案与前面提到的完全一致，同时也结合了 `useTransition` ，我们就不再一一分析步骤，直接展示完整代码

```
import { useOptimistic, useState, useTransition } from "react";import { likeApi } from "./api.js";import s from './index.module.css'export default function Index() {  const [like, setLike] = useState(false);  const [optimisticLike, updateLike] = useOptimistic(    like,    (state, newState) => newState  );  const [isPending, startTransition] = useTransition()  const [end, setEnd] = useState()  function __clickHandler() {    if (isPending) return    let newState = !like;    startTransition(async () => {      updateLike(newState)      try {        let state = await likeApi(newState)        setLike(state)        setEnd(true)      } catch (e) {        setEnd(false)      }    })  }  let __cls = optimisticLike ? `${s.cen} ${s.active}` : s.cen  return (    <div>      <div className={s.star} onClick={__clickHandler}>        <div id={s.lef} className={__cls}></div>        <div id={s.c} className={__cls}></div>        <div id={s.rig} className={__cls}></div>      </div>      <div className={s.loading}>        状态：        {isPending && '请求中...'}        {!isPending && end === true && '请求成功'}        {!isPending && end === false && '请求失败'}      </div>    </div>  );}
```

在 api 的请求中，我们可以通过判断随机数的大小来模拟请求失败时的表现。

```
// api.jsexport async function likeApi(message) {  await new Promise((resolve, reject) => {    setTimeout(() => {      if (Math.random() > 0) {        resolve(message)      } else {        reject(message)      }    }, 1000)  });  return message;}
```

如下图所示，请求失败，状态重置。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHh6nkR0yV8BthJEohZZIHGquSDfIfVwxH2zS11xqODnNApZ7f7yJxc2En8nO7icGKtusjyJluUQHg/640?wx_fmt=gif&from=appmsg)

8
-

**总结**

在特定的场景中，乐观更新在交互体验上有非常大的提升，因此是我们完成 C 端项目的重要技术手段。但是如果我们自己去实现的话有一定的复杂度，好在 React 19 提供了比较简单的解决方案来帮助我们完成这个需求。我非常喜欢 useOptimistic 这个新 hook.

> ✓
> 
> 成为 React 高手，推荐[阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)