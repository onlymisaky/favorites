> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AncqJJa4b-SYbsDUimCdvg)

关注公众号 程序员成长指北，回复 “加群”

加入我们一起学习，天天进步

![](https://mmbiz.qpic.cn/mmbiz_jpg/HLN2IKtpicicGmoRC2TF6yNVgiayvEDnrwPFjTtqHibwEQD0IeYg9Sx4aKHyIiaEmLWpGiaccCCj5StD7DAXhZDbOBYQ/640?wx_fmt=jpeg)

作者：Liqiuyue

链接：https://juejin.cn/post/6908264284032073736

最近面试总是会被问到这么一个问题：在使用 vue 的时候，将`for`循环中声明的变量`i`从 1 增加到 100，然后将`i`展示到页面上，页面上的`i`是从 1 跳到 100，还是会怎样？答案当然是只会显示 100，并不会有跳转的过程。

怎么可以让页面上有从 1 到 100 显示的过程呢，就是用`setTimeout`或者`Promise.then`等方法去模拟。

讲道理，如果不在 vue 里，单独运行这段程序的话，输出一定是从 1 到 100，但是为什么在 vue 中就不一样了呢？

```
for(let i=1; i<=100; i++){ console.log(i);}
```

这就涉及到 Vue 底层的异步更新原理，也要说一说`nextTick`的实现。不过在说`nextTick`之前，有必要先介绍一下 JS 的事件运行机制。

JS 运行机制
-------

众所周知，JS 是基于事件循环的**单线程**的语言。执行的步骤大致是：

1.  当代码执行时，所有同步的任务都在主线程上执行，形成一个**执行栈**；
    
2.  在主线程之外还有一个**任务队列** (task queue)，只要异步任务有了运行结果就在任务队列中放置一个事件；
    
3.  一旦**执行栈**中所有同步任务执行完毕（主线程代码执行完毕），此时主线程不会空闲而是去读取**任务队列**。此时，异步的任务就结束等待的状态被执行。
    
4.  主线程不断重复以上的步骤。
    

![](https://mmbiz.qpic.cn/mmbiz_png/HLN2IKtpicicGdY8kjxQdGD9LUbNZqGuWgALZxnJEGhiahnmYsC2kOkqKibPDquPqUUB2dJlQlQsweWIwy1nLNmMvQ/640?wx_fmt=png) 我们把主线程执行一次的过程叫一个`tick`，所以`nextTick`就是下一个`tick`的意思，也就是说用`nextTick`的场景就是我们想在下一个`tick`做一些事的时候。

所有的异步任务结果都是通过**任务队列**来调度的。而任务分为两类：宏任务 (macro task) 和微任务(micro task)。它们之间的执行规则就是每个宏任务结束后都要将所有微任务清空。常见的宏任务有`setTimeout/MessageChannel/postMessage/setImmediate`，微任务有`MutationObsever/Promise.then`。

想要透彻学习事件循环，推荐 Jake 在 JavaScript 全球开发者大会的演讲，保证讲懂！

nextTick 原理
-----------

### 派发更新

大家都知道 vue 的响应式的靠依赖收集和派发更新来实现的。在修改数组之后的派发更新过程，会触发`setter`的逻辑，执行`dep.notify()`：

```
// src/core/observer/watcher.jsclass Dep { notify() {     //subs是Watcher的实例数组     const subs = this.subs.slice()        for(let i=0, l=subs.length; i<l; i++){         subs[i].update()        }    }}
```

遍历`subs`里每一个`Watcher`实例，然后调用实例的`update`方法，下面我们来看看`update`是怎么去更新的：

```
class Watcher { update() {     ...     //各种情况判断之后        else{         queueWatcher(this)        }    }}
```

`update`执行后又走到了`queueWatcher`，那就继续去看看`queueWatcher`干啥了 (希望不要继续套娃了:

```
//queueWatcher 定义在 src/core/observer/scheduler.jsconst queue: Array<Watcher> = []let has: { [key: number]: ?true } = {}let waiting = falselet flushing = falselet index = 0export function queueWatcher(watcher: Watcher) { const id = watcher.id    //根据id是否重复做优化    if(has[id] == null){     has[id] = true        if(!flushing){         queue.push(watcher)        }else{         let i=queue.length - 1            while(i > index && queue[i].id > watcher.id){             i--            }            queue.splice(i + 1, 0, watcher)        }            if(!waiting){      waiting = true         //flushSchedulerQueue函数: Flush both queues and run the watchers         nextTick(flushSchedulerQueue)     }    }}
```

这里`queue`在 push`watcher`时是根据`id`和`flushing`做了一些优化的，并不会每次数据改变都触发`watcher`的回调，而是把这些`watcher`先添加到⼀个队列⾥，然后在`nextTick`后执⾏`flushSchedulerQueue`。

`flushSchedulerQueue`函数是保存更新事件的`queue`的一些加工，让更新可以满足 Vue 更新的生命周期。

这里也解释了为什么 for 循环不能导致页面更新，因为`for`是主线程的代码，在一开始执行数据改变就会将它 push 到`queue`里，等到`for`里的代码执行完毕后`i`的值已经变化为 100 时，这时 vue 才走到`nextTick(flushSchedulerQueue)`这一步。

### nextTick 源码

接着打开 vue2.x 的源码，目录`core/util/next-tick.js`，代码量很小，加上注释才 110 行，是比较好理解的。

```
const callbacks = []let pending = falseexport function nextTick (cb?: Function, ctx?: Object) {  let _resolve  callbacks.push(() => {    if (cb) {      try {        cb.call(ctx)      } catch (e) {        handleError(e, ctx, 'nextTick')      }    } else if (_resolve) {      _resolve(ctx)    }  })  if (!pending) {    pending = true    timerFunc()  }
```

首先将传入的回调函数`cb`（上节的`flushSchedulerQueue`）压入`callbacks`数组，最后通过`timerFunc`函数一次性解决。

```
let timerFuncif (typeof Promise !== 'undefined' && isNative(Promise)) {  const p = Promise.resolve()  timerFunc = () => {    p.then(flushCallbacks)    if (isIOS) setTimeout(noop)    }  isUsingMicroTask = true} else if (!isIE && typeof MutationObserver !== 'undefined' && (  isNative(MutationObserver) ||  // PhantomJS and iOS 7.x  MutationObserver.toString() === '[object MutationObserverConstructor]')) {  let counter = 1  const observer = new MutationObserver(flushCallbacks)  const textNode = document.createTextNode(String(counter))  observer.observe(textNode, {    characterData: true  })  timerFunc = () => {    counter = (counter + 1) % 2    textNode.data = String(counter)  }  isUsingMicroTask = true} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {  timerFunc = () => {    setImmediate(flushCallbacks)  }} else {  timerFunc = () => {    setTimeout(flushCallbacks, 0)  }}
```

`timerFunc`下面一大片`if else`是在判断不同的设备和不同情况下选用哪种特性去实现异步任务：优先检测是否原生⽀持`Promise`，不⽀持的话再去检测是否⽀持`MutationObserver`，如果都不行就只能尝试宏任务实现，首先是`setImmediate`，这是⼀个⾼版本 IE 和 Edge 才⽀持的特性，如果都不⽀持的话最后就会降级为 setTimeout 0。

这⾥使⽤`callbacks`⽽不是直接在`nextTick`中执⾏回调函数的原因是保证在同⼀个 tick 内多次执⾏`nextTick`，不会开启多个异步任务，⽽把这些异步任务都压成⼀个同步任务，在下⼀个 tick 执⾏完毕。

nextTick 使用
-----------

`nextTick`不仅是 vue 的源码文件，更是 vue 的一个全局 API。下面来看看怎么使用吧。

当设置 `vm.someData = 'new value'`，该组件不会立即重新渲染。当刷新队列时，组件会在下一个事件循环 tick 中更新。多数情况我们不需要关心这个过程，但是如果你想基于更新后的 DOM 状态来做点什么，这就可能会有些棘手。虽然 Vue.js 通常鼓励开发人员使用**数据驱动**的方式思考，避免直接接触 DOM，但是有时我们必须要这么做。为了在数据变化之后等待 Vue 完成更新 DOM，可以在数据变化之后立即使用`Vue.nextTick(callback)`。这样回调函数将在 DOM 更新完成后被调用。

官网用例：

```
<div id="example">{{message}}</div>
```

```
var vm = new Vue({  el: '#example',  data: {    message: '123'  }})vm.message = 'new message' // 更改数据vm.$el.textContent === 'new message' // falseVue.nextTick(function () {  vm.$el.textContent === 'new message' // true})
```

并且因为`$nextTick()` 返回一个 `Promise` 对象，所以也可以使用`async/await` 语法去处理事件，非常方便。

相关文章
----

1.  [分享 8 个非常实用的 Vue 自定义指令](http://mp.weixin.qq.com/s?__biz=MzAxODE4MTEzMA==&mid=2650084668&idx=1&sn=993a0bbc319fe0da8cbde87942a1c450&chksm=83db8859b4ac014fe3e25353e6e1d109e7482c0b48ad5e1c94ea50041af616c9e3fd1efed877&scene=21#wechat_redirect)  
    
2.  [Vue 这些修饰符帮我节省 20% 的开发时间](http://mp.weixin.qq.com/s?__biz=MzAxODE4MTEzMA==&mid=2650084124&idx=1&sn=34c10318a887fba274e389ad29dce1af&chksm=83db8e79b4ac076fcf41bf26d65fbab59b8c02b175ff533169ca064e80cbc1be3527a29c4cd8&scene=21#wechat_redirect)  
    
3.  [Vue 路由权限控制分析](http://mp.weixin.qq.com/s?__biz=MzAxODE4MTEzMA==&mid=2650082435&idx=1&sn=19b0a4af10b4d0a3ce35d3b42786b930&chksm=83db91e6b4ac18f078a24fa9f09041223001c1119893490d6bcd92809881d3dd2c65b2dcff2a&scene=21#wechat_redirect)  
    

最后
--

```
程序员成长指北
```

分享和在看就是最大的支持❤️