> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/u7J6JQ2Wv997IJWJiuC_LA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcF2q9c67swbZzVicQsKvMAqQacIovZ83ujmokBjotDKYpKDfdaADXB2ic2NAPBLguuuOFcdPIeIycuQ/640?wx_fmt=png&from=appmsg)

本文内容梗概

*   action 支持异步回调
    
*   useFormStatus 基础知识
    
*   使用 useFormStatus 获得提交状态
    
*   案例：提交表单时禁止输入
    

全文共 **2213** 字，阅读需要花费 4 分钟

1
-

**action 支持异步回调**

一个令人振奋的特性就是，在 React19 中，action 支持传入异步回调函数。

例如如下代码

```
async function formAction(formdata) {  const title = formdata.get('title')  const content = formdata.get('content')  // 简单校验  if (!title || !content) {    return;  }  await new Promise(resolve => setTimeout(resolve, 1000))  setPosts(posts => [...posts, {title,content}])}
```

```
<form action={formAction}>  ...</form>
```

有了这个特性的支持，我们就可以非常方便的利用它来实现一些上传逻辑。不过一个小小的需求就是，点击提交之后，接口请求的过程中，我们希望按钮处于禁用状态，那应该怎么办呢？

React 19 提供了名为 `useFormStatus` 的 hook 来帮助我们做到这个事情。

2
-

**useFormStatus**

和别的 hook 不同的是，我们需要从 `react-dom` 中获取到它的引用

```
import { useFormStatus } from "react-dom";
```

useFormStatus 能够在 form 元素的子组件中，获取到表单提交时的 pending 状态和表单内容。

> ✓
> 
> 与 form 同属于一个组件，获取不到，只能是封装后的子组件才能获取到

```
const { pending, data, method, action } = useFormStatus();
```

**pending** 为 true 时，表示请求正在进行。我们可以利用这个值的变化在提交按钮上设置 Loading 样式

data 格式为 FormData，表示此次提交里表单的所有内容。

method 表示我们在提交时，所采用的请求方式，默认值为 `get`。

> ✓
> 
> 需要注意的是，提交方式并不需要通过如下方式设置，这样做会报错。

```
<form method="post"></form>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcF2q9c67swbZzVicQsKvMAqQJzr4qiaZNMGApibupfQpSILaMkPopteIrOkTDvtELuKOx41wUv20F6icA/640?wx_fmt=png&from=appmsg)

`action` 就是在 form 元素中的 action 回调函数的引用。

3
-

**案例一：提交时设置禁用按钮**

为了防止重复提交，我们希望在提交时就马上禁用按钮，等到提交完成之后再恢复按钮的点击。与此同时，我们可能还需要在 UI 交互上做出一些提示，让用户知道当前正在发送请求

交互效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcF2q9c67swbZzVicQsKvMAqQVnx9sxHmoC6sBKAFvV6rn7KptZYibCI0fHtzZ3blpXIHrL2d0BhzxcA/640?wx_fmt=gif&from=appmsg)

这里主要是针对提交按钮做的操作，因此我们需要单独将提交按钮相关的部分拿出来封装成为一个子组件，并在子组件中利用 `useFormStatus` 获取异步 action 的 pending 状态。

代码非常的简单，如下所示

```
function SubmitButton() {  const {pending} = useFormStatus()    return (    <div class>      <button        className='primary'        type='submit'        disabled={pending}      >        {pending ? 'Submitting...' : 'Submit'}      </button>          </div>  )}
```

然后在 form 元素中使用该组件即可

```
<form action={formAction} method="post">  <div class placeholder='Enter you name' />  </div>    <SubmitButton /></form>
```

4
-

**案例二：提交时禁止输入内容**

通常情况下，我们也希望在表单提交时，不允许输入内容。useFormStatus 可以很容易帮我们做到这一点。

实现非常简单，我们将某一个字段单独封装到子组件中，利用 useFormStatus 提供的 pending 状态来判断是否禁用输入，代码如下

```
function Input2({required, name}) {  const {pending} = useFormStatus()  return (    <div class>Name</div>      <input        name={name}        type="text"        placeholder='Enter you name'        disabled={pending}      />    </div>  )}
```

```
<form action={formAction}>  <div class placeholder='Enter title' />  </div>  <Input2 required name='content' />  <SubmitButton /></form>
```

5
-

**总结**

useFormStatus 是结合 action 异步请求时使用的 hook，它们是对 HTML 表单能力的增强。因此我们可以借助他们与 HTML 表单元素自身支持的特性实现更复杂的表单交互逻辑。

这里我们需要注意的是 action 与 onSubmit 的区别。onSubmit 会优先于 action 执行。并且，如果我们在 onSubmit 的回调函数中，使用了 `preventDefault`，action 回调将不会执行

```
function onSubmit(e) {  e.preventDefault()  // ...}
```

在 onSubmit 中，我们可以结合 state，通过控制数据的行为来自定义表单行为，而无需过多依赖 HTML 表单元素本身的能力。具体如何抉择大家需要根据自身项目的需求情况来定。

> ✓
> 
> 顶尖前端都在关注我，就差你啦，戳左下角
> 
> 成为 React 高手，推荐[阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)