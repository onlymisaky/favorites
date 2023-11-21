> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/KnFTafpmvr7u8PUoCZwTTA)

ref 是 React 里常用的特性，我们会用它来拿到 dom 的引用。

它一般是这么用的：

函数组件里用 useRef：

```
import React, { useRef, useEffect } from "react";export default function App() {  const inputRef = useRef();  useEffect(()=> {    inputRef.current.focus();  }, []);  return <input ref={inputRef} type="text" />}
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqniazBVWlPtveKwl1ObDMn5cicR66nI37hl0QwLWMcM2ibnGLIEbkYuMWuw/640?wx_fmt=png)

class 组件里用 createRef：

```
import React from "react";export default class App  extends React.Component{  constructor() {    super();    this.inputRef = React.createRef();  }  componentDidMount() {    this.inputRef.current.focus();  }  render() {    return <input ref={this.inputRef} type="text" />  }}
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqniatOJdI5zQYBvibibpHKemNhbvoicTZcrKfl6WBryiccCEfWzLJciczfYe3Q/640?wx_fmt=png)

如果想转发 ref 给父组件，可以用 forwardRef：

```
import React, { useRef, forwardRef, useImperativeHandle, useEffect } from "react";const ForwardRefMyInput = forwardRef(  function(props, ref) {    return <input {...props} ref={ref} type="text" />  })export default function App() {  const inputRef = useRef();  useEffect(() => {    inputRef.current.focus();  }, [])  return (    <div class>      <ForwardRefMyInput ref={inputRef} />    </div>  );}
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnKWKpwAL1r9hP5CGjiaFIDKQu7j5d0lkNaRkxHzwfEs0aUDD26uYnXEw/640?wx_fmt=png)

而且还可以使用 useImperativeHandle 自定义传给父元素的 ref：

```
import React, { useRef, forwardRef, useImperativeHandle, useEffect } from "react";const ForwardRefMyInput = forwardRef(  function(props, ref) {    const inputRef = useRef();    useImperativeHandle(ref, () => {      return {        aaa() {          inputRef.current.focus();        }      }    });    return <input {...props} ref={inputRef} type="text" />  })export default function App() {  const inputRef = useRef();  useEffect(() => {    inputRef.current.aaa();  }, [])  return (    <div class>      <ForwardRefMyInput ref={inputRef} />    </div>  );}
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqn5DBCicp6VB0VUD6G750j1vMo0Lc5MeHItBxtbCLOIGsqhvRwOmY1zzw/640?wx_fmt=png)

这就是我们平时用到的所有的 ref api 了。

小结一下：

*   **函数组件里用 useRef 创建 ref 变量，然后原生标签加个 ref 属性指向它**
    
*   **类组件里用 createRef 创建 ref 变量，保存到 this，然后原生标签加个 ref 属性指向它**
    
*   **子组件的 ref 传递给父组件，使用 forwarRef 包裹子组件，然后原生标签加个 ref 属性指向传进来的 ref 参数。**
    
*   **改变 ref 传递的值，使用 useImperativeHandle，第一个参数是 ref，第二个参数是返回 ref 值的函数**
    

相信开发 React 项目，大家或多或少会用到这些 api。

那这些 ref api 的实现原理是什么呢？

下面我们就从源码来探究下：

我们通过 jsx 写的代码，最终会编译成 React.createElement 等 render function，执行之后产生 vdom：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnRrTRZEADQeC7uJ43qh66URIcSpPPBAI7fG8F6aOOANZw0UFBaPN90Q/640?wx_fmt=png)

所谓的 vdom 就是这样的节点对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnX7xKEpRxjS9ibbDCvYU1XxARVwPRmf9K5AzTzrHZkOSfFibg1iaWfkD5w/640?wx_fmt=png)

vdom 是一个 children 属性连接起来的树。

react 会先把它转成 fiber 链表：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnOwlRqCGMLkWBVJ3YvLwp6NvGguLmGSNJXREO3YOB18ibUW2kwIJnwHw/640?wx_fmt=png)

vdom 树转 fiber 链表树的过程就叫做 reconcile，这个阶段叫 render。

render 阶段会从根组件开始 reconcile，根据不同的类型做不同的处理，拿到渲染的结果之后再进行 reconcileChildren，这个过程叫做 beginWork：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnaW1QzkUxduUgYicrrrp0JsDzxkhGxwdnxBaLumkKH2xZaJylwNRDTqQ/640?wx_fmt=png)

比如函数组件渲染完产生的 vom 会继续 renconcileChildren：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqn6gF9ZTWrdbgg9lne03AKzQwmNygZ8WVt9O8X76pc5bYByGDjNNcwkw/640?wx_fmt=png)

beginWork 只负责渲染组件，然后继续渲染 children，一层层的递归。

全部渲染完之后，会递归回来，这个阶段会调用 completeWork：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnFibt9x2CODHicGgo51hDgjtMzmvaVnrbX5CiaSTibtEHQRdsibfXcJBm8SA/640?wx_fmt=png)

这个阶段会创建需要的 dom，然后记录增删改的 tag，同时也记录下需要执行的其他副作用到 effect 链表里。

之后 commit 阶段才会遍历 effect 链表根据 tag 来执行增删改 dom 等 effect。

commit 阶段也分了三个小阶段，beforeMutation、mutation、layout：

在源码里就是并排的 3 个 do while 循环：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnqA6Zmvoib9MRuQPYQZdAhmrFZGYDwn3a1EK4spQmPDJUT0B0PyicfvfA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnBv8ZUGR4kic4zBbrMnYCiabQDjhphkJN0wrTgxOh0kFyTOXkLya1YUxg/640?wx_fmt=png)

它们都是消费的同一条 effect 链表，但是每个阶段做的事情不同，所以上图里有 nextEffect = fistEffect 这一行，也就是每个阶段处理完了，就让下个阶段从头开始处理 effect。

mutation 阶段会根据标记增删改 dom，也就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnqek911tNelaEicqkwwiczjgMk5NFGNT77nZmmJrUtHNe04icP2olGYXBA/640?wx_fmt=png)

所以这个阶段叫做 mutation，它之前的一个阶段叫做 beforeMutation，而它之后的阶段叫做 layout。

小结下 react 的流程：

**通过 jsx 写的代码会编译成 render function，执行产生 vdom，也就是 React Element 对象的树。**

**react 分为 render 和 commit 两个阶段:**

**render 阶段会递归做 vdom 转 fiber，beginWork 里递归进行 reconcile、reconcileChildren，completeWork 里创建 dom，记录增删改等 tag 和其他 effect**

**commit 阶段遍历 effect 链表，做三轮处理，这三轮分别叫做 before mutation、mutation、layout，mutation 阶段会根据 tag 做 dom 增删改。**

ref 的实现同样是在这个流程里的。

首先，我们 ref 属性肯定是加在原生标签上的，比如 input、div、p 这些，所以只要看 HostComponent 的分支就可以了，HostComponent 就是原生标签。

可以看到处理原生标签的 fiber 节点时，beginWork 里会走到这个分支：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnXviauM2x9hkqF8ickjceO6AstFgl361oPltqu9ukF7KicqsV4r43cnDaQ/640?wx_fmt=png)

里面调用 markRef 打了个标记：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnA0Xic49fkl9Cz4AnSplicuDZ17N1ibKv0xj30gghp6h8oKSp4yV9fjscQ/640?wx_fmt=png)

前面说的 tag 就是指这个 flags。

在 completeWork 里，判断 flags 如果不是默认的，那就把这个 fiber 记录到父节点的 firstEffect -> nextEffect -> nextEffect 这样的链表里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnPvibO9U5SdJAhzqr3nNibefib7E1TianNuZcUN9xJNvZ9KiakibzmElbtrfw/640?wx_fmt=png)

这里记录到的是父组件的 effect 链表，那父组件又会记录到它的父组件里，这样最终就在 root fiber 里记录了完整的 effect 链表。

然后就到了 commit 阶段，开始处理这条 effect 链表：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnH6Ap5jVd9x49b54Ps8nJ1EJWkGBtMqjiarLnSo8LhXjobgLqQh8yFyA/640?wx_fmt=png)

你可以看到在 mutation 阶段，操作 dom 之前，如果有 ref 标记，也就是会用到 ref，那就会 dettachRef 清空 ref。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqn2EahvTevHQHSlHpdqDwp33DpKozsacs1wErcMCh814ROfibB6jFqbibA/640?wx_fmt=png)

之后在 layout 阶段，这时候已经操作完 dom 了，就设置新的 ref：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnibwgiblO3xAZaaC1piaB4fvpREGEml5yNfV8GR7ncs0m2ppSEavotLPpQ/640?wx_fmt=png)

ref 的元素就是在 fiber.stateNode 属性上保存的在 render 阶段就创建好了的 dom，：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnkm4cxRrB3ygkGjjFdMeGOcbf3B3hJLAOic7LlicxIP0ILXP1ZQalfqOw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqn3bHW0GE3jydRlczxtaTibTHOLGJjhzib4qI023sGGibue4hAYHoRWaHuA/640?wx_fmt=png)

这样，在代码里的 ref.current 就能拿到这个元素了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqneicT4iaSHXkPvMRZxnb2rv4cgrZobyEaTKo9Ufgz85ia8nutAYkbZ6zgA/640?wx_fmt=png)

而且我们可以发现，他只是对 ref.current 做了赋值，并不管你是用 createRef 创建的、useRef 创建的，还是自己创建的一个普通对象。

我们试验一下：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqneeM8VkSrOyqMyAQ6MuriacBM4TdENyf01F5CSs2aicicvVNYrBib0nKANQ/640?wx_fmt=png)

我创建了一个普通对象，current 属性依然被赋值为 input 元素。

那我们用 createRef、useRef 的意义是啥呢？

看下源码就知道了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqneXFXIfdoAno5G2LdY6vk4AL4jMwGRKm3ibzXiahmHsdq717yeWmlDgDA/640?wx_fmt=png)

createRef 也是创建了一个这样的对象，只不过 Object.seal 了，不能增删属性。

用自己创建的对象其实也没啥问题。

那 useRef 呢？

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnUcmWSU6RBYPbCpCExplNKUu34ibDxxFE3WqY0PJUPE4TCh6sRrABBPg/640?wx_fmt=png)

useRef 也是一样的，只不过是保存在了 fiber 节点 hook 链表元素的 memoizedState 属性上。

只是保存位置的不同，没啥很大的区别。

同样，用 forwardRef 转发的 ref 也很容易理解，只是保存的位置变了，变成了从父组件传过来的 ref：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnClib9zsYuL7X2LN7WwjmMrvwALMIYSicUNM6eM3RDDRyV2wSfVhwmh4w/640?wx_fmt=png)

那 forwardRef 是怎么实现这个 ref 转发的呢？

我们再看下源码：

forwarRef 函数其实就是创建了个专门的 React Element 类型：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqn0n71sq0Cf6s3qpXoHkCHhYKU33KETQmColvWo8HOicEdAiacV6icuJnVg/640?wx_fmt=png)

然后 beginWork 处理到这个类型的节点会做专门的处理：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnpsM4CXKD2jzf1dLbSs7GUWrOUwOdVKkv1ntuUpdUwJdGClgYzS8k2g/640?wx_fmt=png)

也就是把它的 ref 传递给函数组件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnZHMq6GYnWSq71KPCnRoArkicrfmcZdT48cJxJPqOUfogkh3otcOjIRw/640?wx_fmt=png)

渲染函数组件的时候专门留了个后门来传第二个参数：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnzfsiacXKqQowBbPIaQzbF6NAZrCTKDSNXTQnNvtwRwAfWfdia4nhALdg/640?wx_fmt=png)

所以函数组件里就可以拿到 ref 参数了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnDUm3bBX4KqnDSm07W7UpLdK6luID6DNKZtyRv9V8VnGib5KbV2PfxcA/640?wx_fmt=png)

这样就完成了 ref 从父组件到子组件的传递：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnniboPnAQdbjHQpYNemdvFGjIHbnvbqUuSTzvtyr4tMmgUGWW5IClcvw/640?wx_fmt=png)

那 useImperativeHandle 是怎么实现的修改 ref 的值呢？

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnKGICP3LQRa9iclw2e62Uv42BCunOr68IibSP8DFu8bgHGct2bOEKg3Mw/640?wx_fmt=png)

源码里可以看到 useImperativeHandle 底层就是 useEffect，只不过是回调函数是把传入的 ref 和 create 函数给 bind 到 imperativeHandleEffect 这个函数了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnHVYgdpPHicGPqCvuXBvzibjaCPRibibEk5xSq60OSbLUb9jPsKEN4qRia8A/640?wx_fmt=png)

而这个函数里就是更新 ref.current 的逻辑：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqn8BBCMiaS2HNeLfTyO9c9vUB3EnayealKEibPnjWuicQlArwicwPCGOpAPQ/640?wx_fmt=png)

在 layout 阶段会调用所有的生命周期函数，比如 class 组件的生命周期和 function 组件的 effect hook 的回调：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnFv9vDALEV5m2nkLd7AlZBgBS437A0ZkPU5mP2xj8qfvQFSOR4VeemQ/640?wx_fmt=png)

这里就调用了 useImperativeHandle 的回调：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnKiaTuJziajAyM9GSIhgsf6icicRLofIXe2baBaA25A609s2dFnfpYAU87w/640?wx_fmt=png)

更新了 ref 的值：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnaW7jH7zUaMCyichSS0X1frXeV0IMozAr61q7iavSicRHIrlqiamtGwIEbQ/640?wx_fmt=png)

hook 的 effect 和前面的处理 ref 的 effect 保存在不同的地方：

增删改 dom、处理 ref 等这些 effect 是在 fistEffect、lastEffect、nextEffect 的链表里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnkXd6UPL9by5xll2WibXPn5wB37vYHhkibtdtDYYFM9cSQaglGCN3AibtQ/640?wx_fmt=png)

而 hook 的 effect 保存在 updateQueue 里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGias8qT7yWaL6ia3esOnibYpqnJzmp1xaYpEh07MMhc4OaibIFSqSMAwdIISoeHIStKfhgendFa1Ibaog/640?wx_fmt=png)

小结下 ref 的实现原理：

**beginWork 处理到原生标签也就是 HostComponent 类型的时候，如果有 ref 属性会在 flags 里加一个标记。**

**completeWork 处理 fiber 节点的时候，flags 不是默认值的 fiber 节点会被记录到 effect 链表里，通过 firstEffect、lastEffefct、nextEffect 来记录这条链表。**

**commit 阶段会处理 effect 链表，在 mutation 阶段操作 dom 之前会清空 ref，在 layout 阶段会设置 ref，也就是把 fiber.stateNode 赋值给 ref.current。**

**react 并不关心 ref 是哪里创建的，用 createRef、useRef 创建的，或者 forwardRef 传过来的都行，甚至普通对象也可以，createRef、useRef 只是把普通对象 Object.seal 了一下。**

**forwarRef 是创建了单独的 vdom 类型，在 beginWork 处理到它的时候做了特殊处理，也就是把它的 ref 作为第二个参数传递给了函数组件，这就是它 ref 转发的原理。**

**useImperativeHandle 的底层实现就是 useEffect，只不过执行的函数是它指定的，bind 了传入的 ref 和 create 函数，这样在 layout 阶段调用 hook 的 effect 函数的时候就可以更新 ref 了。**

总结
--

我们平时会用到 createRef、useRef、forwardRef、useImperativeHandle 这些 api，而理解它们的原理需要熟悉 react 的运行流程，也就是 render（beginWork、completeWork） + commit（before mutation、mutation、layout）的流程。

从底层原理来说，更新 ref 有两种方式：

*   useImperativeHandle 通过 hook 的流程更新
    
*   ref 属性通过 effect 的方式更新
    

这两种 effect 保存的位置不一样，ref 的 effect 是记录在 fistEffect、nextEffect、lastEffect 链表里的，而 hooks 的 effect 是记录在 updateQueue 里的。

理解了 react 运行流程，包括普通 effect 的流程和 hook 的 effect 的流程，就能彻底理解 React ref 的实现原理。