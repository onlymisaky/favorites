> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/P04842cMtzNTz335CG4-jQ)

在之前的版本中，forwardRef 一直是我最爱用的 ref 之一。它在封装组件时非常有用。可是万万没想到，由于使用方式稍微麻烦了一点，在新的版本中，直接被 React 19 背刺一刀，实现同样的功能，以后可以不用它了.... forwardRef 被无情抛弃。

本文主要内容包括如下几个部分。

*   React 中的 控制反转 IOC
    
*   forwardRef 基础知识
    
*   React 19 中 ref 机制更改，forwardRef 被无情抛弃
    
*   useImperativeHandle 与 ref 的新配合
    

全文共 **3206** 字，阅读预计花费 6 分钟

1
-

**React 中的控制反转**

在面向对象编程中，IOC (Inversion of Control) 控制反转是一个非常高级的概念。它是一种设计理念，在减少对象之间的耦合关系上有非常重要的作用。

> ✓
> 
> 许多前端虽然对其有所耳闻，但说实话，能理解的并不多。甚至很对前端对解耦这个概念都是一头雾水。

IOC 的设计理念里，有三个角色，一个角色是**容器 C**，一个角色是**被控制者 B**，一个角色是**控制者 A**，许多时候，在代码开发中，控制者 A 直接去控制对象 B，会导致 B 被多次实例化而从让代码逻辑变得更加复杂。因此 IOC 的理念是让 控制者 A 失去对 B 的直接控制权，它只能与容器交互。从而将 A 与 B 的直接联系隔离开。

这样说可能会有点绕，但是呢，我们使用一个大家经常使用的代码来说明一下，你一下就能明白。

```
const ref = useRef()
```

```
<InputNumber ref={ref} />
```

```
ref.current.focus()
```

在这个案例里，我们的目标是直接获取到 input 对象，并且调用它的 `focus` 方法，让 input 获得焦点。

```
var input = document.getElementById('input')input.focus()
```

但是在模块的划分上，input 元素本身并不属于当前模块 / 组件，因此，调用 input 方法的行为，其实是属于一种混乱。除非我们不做解耦和封装。

因此，在 React 的组件封装中，并不支持直接获取到 input 的引用，而是以一种传入控制器的方式来调用它。在这个场景里:

input 对象本身是被调用者  
InputNumber 组件是容器  
ref 是控制器

当前组件利用 ref 来调用 input。从而让代码的解耦变得非常合理。可扩展性也很强。

> ✓
> 
> 注意一些概念上的区分：**控制反转是一种设计思维**，依赖注入是控制反转的一种具体实现，在 React 中，ref 也是一种控制反转的具体实现

所以不要听着别人吹控制反转就觉得牛，你可能也天天在用

2
-

**forwardRef 基础知识**

forwardRef 能够帮助 React 组件传递 ref。或者说是内部对象控制权的转移与转发。它接收一个组件作为参数

```
import { forwardRef } from 'react';function MyInput(props, ref) {  // ...}const InputNumber = forwardRef(MyInput);
```

这里需要注意的是，我们需要把 ref 放在自定义组件的参数中

```
function MyInput(props, ref) {  // ...}
```

forwardRef 返回一个可渲染的函数组件。因此，我们可以通过一个简单的案例完善上面的代码

```
function MyInput(props, ref) {  return (    <label>      {props.label}      <input ref={ref} />    </label>  );}const InputNumber = forwardRef(MyInput)
```

所以呢，在 React 的开发中，forwardRef 能够帮助我们实现更良好的解耦，这也是我一直非常喜欢使用 forwardRef 的原因。

3
-

**ref 机制更改，forwardRef 被无情抛弃**

但是，在 React 19 中，forwardRef 被直接背刺，由于 ref 传递机制的更改，我们可以不用 forwardRef 也能做到同样的事情了。

首先，在声明组件时，ref 不再独立成为一个参数，而是作为 props 属性中的一个属性。

```
function MyInput(props) {  return (    <label>      {props.label}      <input ref={props.ref} />    </label>  );}
```

其次，代码这样写了之后，就可以直接在父组件中，通过 ref 拿到 input 的控制权

```
function Index() {  const input = useRef(null)  function __clickHandler() {    input.current.focus()  }  return (    <div>      <button onClick={__clickHandler}>        点击获取焦点      </button>      <MyInput ref={input} />    </div>  )}
```

在父组件中的使用与以前一样，但是子组件由于不再需要 forwardRef，变得更加简单了。

4
-

**useImperativeHandle 与 ref 的新配合**

除了直接拿到元素对象本身就已经存在的 ref，我们还可以通过 useImperativeHandle 来自定义 ref 控制器能执行哪些方法

useImperativeHandle 接收三个参数，分别是

*   **ref:** 组件声明时传入的 ref
    
*   **createHandle:** 回调函数，需要返回 ref 引用的对象，我们也是在这里重写 ref 引用
    
*   **deps:** 依赖项数组，可选。state，props 以及内部定义的其他变量都可以作为依赖项，React 内部会使用 Object.is 来对比依赖项是否发生了变化。依赖项发生变化时，createHandle 会重新执行，ref 引用会更新。如果不传入依赖项，那么每次更新 createHandle 都会重新执行
    

在官方文档中，有这样一个案例，演示效果如图所示，当我点击按钮时，下方的 input 自动获取焦点，并且中间的滚动条滚动到最底部。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFkBcL6mW2dMvPvpgFHu2qafkibyFBkP62DaQ97VTLrz5cUfTOdqDMjwOSv7OYv4DKTm3FZ7DJZkGg/640?wx_fmt=png&from=appmsg)

我们结合新的 ref 传递机制和 useImperativeHandle 一起来分析一下这个案例应该怎么实现。

> !
> 
> > 思考时，请一定要把封装的思维带入进来，否则可能很难感受到这样做在解耦上的具体好处

首先我们先进行组件拆分，将整个内容拆分为按钮部分与信息部分，信息部分主要负责信息的展示与输入，因此页面组件大概长这样

```
<>  <button>Write a comment</button>  <Post /></>
```

我们期望点击按钮时，信息部分的输入框自动获取焦点，信息部分的信息展示区域能滚动到最底部，因此整个页面组件的代码可以表示为如下：

```
import { useRef } from 'react';import Post from './Post.js';export default function Page() {  const postRef = useRef(null);  function handleClick() {    postRef.current.scrollAndFocusAddComment();  }  return (    <>      <button onClick={handleClick}>        Write a comment      </button>      <Post ref={postRef} />    </>  );}
```

再来思考信息部分。

信息部分 Post 又分为两个部分，分别是信息展示部分与信息输入部分。此时这两个部分的 ref 要透传给 Post，并最终再次透传给页面组件。因此他们的组件结构应该长这样

```
<>  <article>    <p>Welcome to my blog!</p>  </article>  <CommentList ref={commentsRef} />  <AddComment ref={addCommentRef} /></>
```

这个时候，有一个需要考虑的点就是，有两个对象需要被控制，因此我们需要借助 useImperativeHandle 来自定义控制器，并在控制的方法中，整合他们

```
useImperativeHandle(ref, () => {  return {    scrollAndFocusAddComment() {      commentsRef.current.scrollToBottom();      addCommentRef.current.focus();    }  };}, []);
```

ref 的传递，只需要把它看成是一个普通的 props 即可，因此，`Post` 组件完整代码如下

```
const Post = ({ref}) => {  const commentsRef = useRef(null);  const addCommentRef = useRef(null);  useImperativeHandle(ref, () => {    return {      scrollAndFocusAddComment() {        commentsRef.current.scrollToBottom();        addCommentRef.current.focus();      }    };  }, []);  return (    <>      <article>        <p>Welcome to my blog!</p>      </article>      <CommentList ref={commentsRef} />      <AddComment ref={addCommentRef} />    </>  );}
```

同样的道理，我们只需要把 CommentList 与 AddComment 的 ref 传递出来就可以了。

所以信息展示部分 CommentList 组件的代码为

```
import { useRef, useImperativeHandle } from 'react';const CommentList = ({ref}) => {  const divRef = useRef(null);  useImperativeHandle(ref, () => {    return {      scrollToBottom() {        const node = divRef.current;        node.scrollTop = node.scrollHeight;      }    };  }, []);  let comments = [];  for (let i = 0; i < 50; i++) {    comments.push(<p key={i}>Comment #{i}</p>);  }  return (    <div class ref={divRef}>      {comments}    </div>  );};export default CommentList;
```

信息输入部分 AddComment 的代码为

```
function AddComment(props) {  return (    <input       placeholder="Add comment..."       ref={props.ref}     />  )};export default AddComment;
```

与之前相比，确实要简单了许多。

5
-

**总结**

如果你对封装解耦比较重视，那么你一定能明显感受到，ref 与 useImperativeHandle 的结合能发挥的想象空间远不止于此，这种方式给 React 提供了一种扩展 React 能力的重要手段，因此，当你成为 React 高手之后，你一定会非常喜欢使用它们，他们的组合能让 React 项目变得更加多样化。

> ✓
> 
> 顶尖前端都在关注我，就差你啦，戳左下角
> 
> 成为 React 高手，[推荐阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)