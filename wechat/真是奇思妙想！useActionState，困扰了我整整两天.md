> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DccFCO1A_xeaN9cchUC9nA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHpuzaGfdB2z2EicLpaEXWwu0BGL8COUNmvsiahcq7EE6ub5vW3SBzdOTfiabmRlm42yxeGNsMGZdicmQ/640?wx_fmt=png&from=appmsg)

**useActionState.**

这个 API 给我带来了非常大的困扰。因为在使用场景上，它和 `useState` 太类似了，类似到我花了很长时间都想不通，它到底为什么需要单独存在，因为它能做的事情，useState 也能做，它到底有什么独特之处呢？

为此我郁闷了整整两天，官方文档关于它的介绍我看了一遍又一遍，实在不知道该如何下笔介绍它。前面水了好几篇文章之后，又写了好几个案例之后，才终于发现它的玄妙之处。

与此同时，学习这个 API 的时候，又被 React 官方文档在案例中使用的奇思妙想给折服了。真的厉害。

本文共包含如下三个部分

*   useActionState 的基础
    
*   我在学习 useActionState 时的困扰
    
*   原来它的作用是...
    
*   与**异步请求**结合的案例
    

全文共 **3510** 字，阅读预计花费 5 分钟。

1
-

**useActionState 基础**

**useActionState**  是一个针对 form action 进行增强的 hook，我们可以根据提交时的表单数据返回新的状态，并对其进行更新。

```
const [state, formAction] = useActionState(fn, initialState, permalink?);
```

`state` 是根据需求设计的新状态。

`formAction` 是需要传递给 form 元素 action 属性的回调函数。该回调函数的具体执行内容由 `fn` 定义

`fn` 接收当前状态和当前提交的表单对象作为参数，它执行的返回值决定了新状态的值。

```
async function increment(previousState, formData) {  return previousState + 1;}
```

`initialState` 表示状态初始化的值。初始化之后，该参数后续就不再起作用。

`permallink` 是一个 URL，主要运用于服务端，在客户端组件中不起作用。

> ✓
> 
> 学习方式：useActionState 参数比较多，因此初次学习会花费不少时间，但是我们只需要把它当成 useState 来理解，瞬间就会简单许多，就是通过 useActionState 定义了一个 state 状态

我们可以使用如下例子简单了解一下 useActionState 的运用。

```
import { useActionState } from "react";async function increment(cur, formData) {  return cur + 1;}function StatefulForm({}) {  const [state, formAction] = useActionState(increment, 0);  return (    <form>      {state}      <button formAction={formAction}>        Increment      </button>    </form>  )}
```

2
-

**我的困扰**

首先，我们要明确的一个点就是，和 useFormStatus 一样，useActionState 依然是针对 action 表单能力的一种增强。

在前面我们已经可以明确 action 的能力

*   1、我们可以在 action 回调函数中，获取到表单的所有数据
    
*   2、action 回调支持异步
    
*   3、我们可以使用 useFormStatus 在 form 元素的子组件中拿到异步请求的状态，从而更新请求中 UI 的样式
    

但是，这个时候，在提交时，如果我们还有其他的状态，需要依赖于表单数据的变化而变化，那我们应该怎么办呢？

> i
> 
> > > 这个状态，通常是表单项之外的数据

例如这个案例，我希望记录一下表单提交的次数。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHpuzaGfdB2z2EicLpaEXWwunBMkFJEys2ILf11I5w8gmGibRMTnLWK9EbO3O1GZYywcwGUae949Z8g/640?wx_fmt=gif&from=appmsg)

没错，答案就是，使用 `useState` 或 `useActionState`。

使用 useState 时，我们可以单独定一个状态用于记录提交次数，然后在 action 中提交成功之后设置状态 +1

```
const [count, setCount] = useState(0)async function action(formData) {  const id = formData.get('id')  const title = formData.get('title')  await new Promise((resolve) => {    setTimeout(() => {      onSubmit({id, title, count: 0})      resolve()    }, 300)  })  setCount(count + 1)}
```

```
<form action={action}>
```

使用 useActionState 时，我们只需要把 formAction 传递给 form 元素的 action 属性，然后在请求成功之后返回 `cur + 1`

```
async function action(cur, formData) {  const id = formData.get('id')  const title = formData.get('title')  await new Promise((resolve) => {    setTimeout(() => {      onSubmit({id, title, count: 0})      resolve()    }, 300)  })  return cur + 1}const [count, formAction] = useActionState(action, 0)
```

```
<form action={formAction}>
```

那么各位道友，问题就来了啊，既然 useState 也能根据提交的 formData 的值，来重新修改表单项之外的状态，那么，useActionState 的独特性在哪里呢？这不是多此一举吗？

这个问题困扰了我整整两天，想不通啊。补充了好几个案例，基本上 useActionState 能做到的，useState 都能做到，完全找不到它的独特之处。

我反复观看了官方文档，除了语法不同，他们还有什么地方是不一样的呢？

3
-

**破局**

无奈之下，我静下心来，仔细对比了官方文档案例中的区别。这才发现了一个细节上的不同之处。

我们注意看下面这段官方文档的案例。

```
import { useActionState } from "react";async function increment(previousState, formData) {  return previousState + 1;}function StatefulForm({}) {  const [state, formAction] = useActionState(increment, 0);  return (    <form>      {state}      <button formAction={formAction}>Increment</button>    </form>  )}
```

我发现，`increment` 的声明是写在函数组件之外的。这一刻我仿佛抓住了什么。于是我又查看了别的几个案例，发现确实是如此

例如，这个案例直接把 action 的定义放在了新的文件里。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHpuzaGfdB2z2EicLpaEXWwuCGJ1IT3F7aMn71jfWXZfeoxHgDL0o6AVhQDqCbjDAfRqMqo2NWWo3g/640?wx_fmt=png&from=appmsg)

最后一个案例也是

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHpuzaGfdB2z2EicLpaEXWwuWvYQPticDYNPyyXCOIlX4t3cftaoaj54hPzRz2icNCoEgCfKVwK2Cp8A/640?wx_fmt=png&from=appmsg)

很显然，useState 虽然能在功能上实现同样的代码，但是我们必须要在 action 中操作 state，因此就不能把 action 的定义放在函数组件之外。

**这就是他们最大的区别**

所以接下来的一个问题就是，能把 action 的声明放在函数组件之外，有什么特别的好处呢？

当然有。

在 React 19 的设计理念中，尽可能的把异步操作的代码逻辑放到组件之外去，是最重要的一个原则性问题。我们之前花了很长时间学习的 `use` 就是在践行这一原则。这样的好处就是能够极大的简化组件代码的逻辑，让代码看上去非常的整洁与干净。

除此之外，在项目结构组织上，也具有非常重要的意义。我们可以把 api 请求与异步 action 当成是同一类文件去处理，在架构上划分为同一种职能。从这个角度来说，useActionState 的价值就显得尤为重要。

接下来，我们用一个稍微复杂一点的案例来掩饰 useActionState 的正确使用。

3
-

**案例：与异步请求结合**

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHpuzaGfdB2z2EicLpaEXWwuDZSOvw86od0ibQ0MEIGa5de0ssouCCjfzDDMAfndkHOgiaeNWwSMjG3w/640?wx_fmt=gif&from=appmsg)

上图演示了我们这个案例的最终交互效果。这个例子中，我们可以学习到一个非常巧妙的运用。那就是利用 `input[type=hidden]` 的方式来接收自定义组件的 props 数据，然后利用 action 获取到 formdata 的数据参与到逻辑中的交互。

```
<input type="hidden" name='title' value={title} />
```

上面有两个块有提交按钮，我们将其封装成一个组件，使用方式如下

```
<BookItem  id='001'  title='JavaScript Core advance'  onSubmit={addToCart}/>
```

此时，我们将书籍的基本信息，通过 `props` 传入到 BookItem 组件内部。

在 BookItem 内部，我们将数据直接写入到 `input[type=hidden]` 的 value 中去

代码如下

```
function BookItem({id, title, onSubmit}) {  return (    <form action={formAction}>      <h2>book name: {title}</h2>      <input type="hidden" name='title' value={title} />      <input type="hidden" name='id' value={id} />      <div style={{marginBottom: '20px'}}>cart count: {count}</div>      <SubmitButton />    </form>  )}
```

这样，我们就可以在提交时，把传入的数据带入到 action 中去，并且页面上也不会显示。

> ✓
> 
> 这个方式非常巧妙，否则将参数从父组件传入到子组件内部的 action 还会导致代码变得复杂

在父组件中，我们定义好要显示的列表和回调函数

```
function Index() {  const [carts, setCarts] = useState([])  function addToCart(item) {    const targetItem = carts.find((cart) => cart.id === item.id)    if (targetItem) {      targetItem.count += 1      setCarts([...carts])      return    }    setCarts(carts => [...carts, item])  }  return (    <div>      <BookItem        id='001'        title='JavaScript Core advance'        onSubmit={addToCart}      />      <BookItem        id='002'        title='React19 all solution'        onSubmit={addToCart}      />      <CartList cart={carts} />    </div>  )}export default Index
```

```
import c from './cart.module.css'function CartList({cart = []}) {  return (    <div>      {cart.map((item, index) => (        <div id={c.inner} key={`cart_${index}`}>          <div>title: {item.title}</div>          <div>id: {item.id}</div>          <div>count: {item.count || 0}</div>        </div>      ))}    </div>  )}export default CartList
```

然后回到 BookItem 组件。我们补全 useActionState 的逻辑

```
function BookItem({id, title, onSubmit}) {  const [count, formAction] = useActionState(    (cur, formData) => action(cur, formData, onSubmit), 0)  return (    <form action={formAction}>      <h2>book name: {title}</h2>      <input type="hidden" name='title' value={title} />      <input type="hidden" name='id' value={id} />      <div style={{marginBottom: '20px'}}>cart count: {count}</div>      <SubmitButton />    </form>  )}
```

action 定义到函数组件外部

```
async function action(cur, formData, onSubmit) {  const id = formData.get('id')  const title = formData.get('title')  await new Promise((resolve) => {    setTimeout(() => {      onSubmit({id, title, count: cur + 1})      resolve()    }, 300)  })  return cur + 1}
```

并在 form 的子组件中，使用 useFormStatus 处理提交时的 Loading 交互。

```
function SubmitButton() {  const {pending} = useFormStatus()  return (    <button type="submit" disabled={pending}>      {pending ? 'ADD TO CART...' : 'ADD TO CART'}    </button>  )}
```

这样，一个完整的，复杂的，案例就完成了。案例结合了我们之前学过的与 action 有关的所有知识。是一个综合性很强的案例。我们可以通过这个案例去体会 React 19 form action 的设计思路和使用思路。

4
-

**总结**

单独理解 useActionState 会有点绕。因此我们在学习这个 hook 时，可以当成 useState 去快速掌握。但是同时又要注意它与 useState 的区别，以方便我们在实践中正确使用。

> ✓
> 
> 成为 React 高手，[推荐阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)