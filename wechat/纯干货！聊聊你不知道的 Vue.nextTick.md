> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6a0FY5rVfqOPMRvhkCY03Q)

> 用过 Vue 的朋友多多少少都知道`$nextTick`～ 在正式讲解 nextTick 之前，我想你应该清楚知道 Vue 在更新 DOM 时是`异步`执行的，因为接下来讲解过程会结合组件更新一起讲～ 事不宜迟，我们直进主题吧（本文以 **v2.6.14** 版本的 Vue 源码进行讲解）

一、nextTick 小测试
--------------

你真的了解 nextTick 吗？来，直接上题～

```
<template>  <div id="app">    <p ref="name">{{ name }}</p>    <button @click="handleClick">修改name</button>  </div></template><script>  export default {  name: 'App',  data () {    return {      name: '井柏然'    }  },  mounted() {    console.log('mounted', this.$refs.name.innerText)  },  methods: {    handleClick () {      this.$nextTick(() => console.log('nextTick1', this.$refs.name.innerText))      this.name = 'jngboran'      console.log('sync log', this.$refs.name.innerText)      this.$nextTick(() => console.log('nextTick2', this.$refs.name.innerText))    }  }}</script>复制代码
```

请问上述代码中，当**点击**按钮 “修改 name” 时，`'nextTick1'`，`'sync log'`，`'nextTick2'`对应的`this.$refs.name.innerText`分别会输出什么？**注意**，这里打印的是 DOM 的 innerText～（文章结尾处会贴出答案）

如果此时的你有非常坚定的答案，那你可以不用继续往下看了～但如果你对自己的答案有所顾虑，那不如跟着我，接着往下看。相信你看完，不需要看到答案都能有个肯定的答案了～！

* * *

二、nextTick 源码实现
---------------

源码位于 core/util/next-tick 中。可以将其分为 4 个部分来看，直接上代码

### 1. 全局变量

`callbacks`队列、`pending`状态

```
const callbacks = [] // 存放cb的队列let pending = false // 是否马上遍历队列，执行cb的标志复制代码
```

* * *

### 2. `flushCallbacks`

遍历 callbacks 执行每个 cb

```
function flushCallbacks () {  pending = false // 注意这里，一旦执行，pending马上被重置为false  const copies = callbacks.slice(0)  callbacks.length = 0  for (let i = 0; i < copies.length; i++) {    copies[i]() // 执行每个cb  }}复制代码
```

* * *

### 3. `nextTick`的**异步**实现

根据执行环境的支持程度采用不同的异步实现策略

```
let timerFunc // nextTick异步实现fnif (typeof Promise !== 'undefined' && isNative(Promise)) {  // Promise方案  const p = Promise.resolve()  timerFunc = () => {    p.then(flushCallbacks) // 将flushCallbacks包装进Promise.then中  }  isUsingMicroTask = true} else if (!isIE && typeof MutationObserver !== 'undefined' && (  isNative(MutationObserver) ||  MutationObserver.toString() === '[object MutationObserverConstructor]')) {  // MutationObserver方案  let counter = 1  const observer = new MutationObserver(flushCallbacks) // 将flushCallbacks作为观测变化的cb  const textNode = document.createTextNode(String(counter)) // 创建文本节点  // 观测文本节点变化  observer.observe(textNode, {    characterData: true  })  // timerFunc改变文本节点的data，以触发观测的回调flushCallbacks  timerFunc = () => {     counter = (counter + 1) % 2    textNode.data = String(counter)  }  isUsingMicroTask = true} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {  // setImmediate方案  timerFunc = () => {    setImmediate(flushCallbacks)  }} else {  // 最终降级方案setTimeout  timerFunc = () => {    setTimeout(flushCallbacks, 0)  }}复制代码
```

*   这里用个真实案例加深对`MutationObserver`的理解。毕竟比起其他三种异步方案，这个应该是大家最陌生的
    
    ```
    const observer = new MutationObserver(() => console.log('观测到文本节点变化'))const textNode = document.createTextNode(String(1))observer.observe(textNode, {  characterData: true})console.log('script start')setTimeout(() => console.log('timeout1'))textNode.data = String(2) // 这里对文本节点进行值的修改console.log('script end')复制代码
    ```
    
*   知道对应的输出会是怎么样的吗？
    

1.  `script start`、`script end`会在第一轮宏任务中执行，这点没问题
    
2.  `setTimeout`会被放入下一轮宏任务执行
    
3.  `MutationObserver`是微任务，所以会在本轮宏任务后执行，所以先于`setTimeout`
    

*   结果如下图：  
    ![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMXH0TicVCj2Tic8GhqCNG8hX0Jf670SxpasECWOKl6tkgjxva2Sk4tb03Q/640?wx_fmt=other)
    

* * *

### 4. `nextTick`方法实现

`cb`、`Promise`方式

```
export function nextTick (cb?: Function, ctx?: Object) {  let _resolve  // 往全局的callbacks队列中添加cb  callbacks.push(() => {    if (cb) {      try {        cb.call(ctx)      } catch (e) {        handleError(e, ctx, 'nextTick')      }    } else if (_resolve) {      // 这里是支持Promise的写法      _resolve(ctx)    }  })  if (!pending) {    pending = true    // 执行timerFunc，在下一个Tick中执行callbacks中的所有cb    timerFunc()  }  // 对Promise的实现，这也是我们使用时可以写成nextTick.then的原因  if (!cb && typeof Promise !== 'undefined') {    return new Promise(resolve => {      _resolve = resolve    })  }}复制代码
```

*   深入细节，理解`pending`有什么用，如何运作？
    

1.  ```
    案例1，同一轮Tick中执行2次`$nextTick`，`timerFunc`只会被执行一次
    ```
    

```
this.$nextTick(() => console.log('nextTick1'))this.$nextTick(() => console.log('nextTick2'))复制代码
```

*   用图看看更直观？
    

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMXjbhVLWnqTPLFZEk2XqluYAfThGZmIc7rEyCu5OlDT5CFrv66O7qbmg/640?wx_fmt=other)tick——pending.png

* * *

三、Vue 组件的异步更新
-------------

这里如果有对 Vue **组件化**、**派发更新**不是十分了解的朋友，可以先戳这里，看图解 Vue 响应式原理 [1] 了解下 Vue 组件化和派发更新的相关内容再回来看噢～

Vue 的**异步更新** DOM 其实也是使用`nextTick`来实现的，跟我们平时使用的 $nextTick 其实是同一个～

这里我们回顾一下，当我们改变一个属性值的时候会发生什么？

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMXmk6tTlLlfk1ZZqvsgSkImlYyJfV1I7Hz1TyITLx2xvnKDglWNPciaVQ/640?wx_fmt=other)根据上图派发更新过程，我们从 watcher.update 开时讲起，以**渲染 Watcher** 为例，进入到`queueWatcher`里

### 1. `queueWatcher`做了什么？

```
// 用来存放Wathcer的队列。注意，不要跟nextTick的callbacks搞混了，都是队列，但用处不同～const queue: Array<Watcher> = []function queueWatcher (watcher: Watcher) {  const id = watcher.id // 拿到Wathcer的id，这个id每个watcher都有且全局唯一  if (has[id] == null) {    // 避免添加重复wathcer，这也是异步渲染的优化做法    has[id] = true    if (!flushing) {      queue.push(watcher)    }    if (!waiting) {      waiting = true      // 这里把flushSchedulerQueue推进nextTick的callbacks队列中      nextTick(flushSchedulerQueue)    }  }}复制代码
```

### 2. `flushSchedulerQueue`做了什么？

```
function flushSchedulerQueue () {  currentFlushTimestamp = getNow()  flushing = true  let watcher, id  // 排序保证先父后子执行更新，保证userWatcher在渲染Watcher前  queue.sort((a, b) => a.id - b.id)  // 遍历所有的需要派发更新的Watcher执行更新  for (index = 0; index < queue.length; index++) {    watcher = queue[index]    id = watcher.id    has[id] = null    // 真正执行派发更新，render -> update -> patch    watcher.run()  }}复制代码
```

*   最后，一张图搞懂组件的异步更新过程
    

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMXaibOecpUgNZ3Le3vgLfTf3YlPVickMeVUzj6ia4kh8SWvURvkEAYazwLA/640?wx_fmt=other)异步更新. png

* * *

四、回归题目本身
--------

相信经过上文对 nextTick 源码的剖析，我们已经揭开它神秘的面纱了。这时的你一定可以坚定地把答案说出来了～话不多说，我们一起核实下，看看是不是如你所想！

1.  如图所示，`mounted`时候的 innerText 是 “井柏然” 的中文![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMX9ynTicQWF3k4q9o7TA4ldIt9sLuCcqQCQM5hjxY2F6Zcjib0c6frxia1w/640?wx_fmt=other)
    
2.  接下来是点击按钮后，打印结果如图所示![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMXKbrVGl44htGicYJmFK4FhS4eAQYBRQb8stkjZEptT36yW70sIj3qNfw/640?wx_fmt=other)
    

*   没错，输出结果如下（意不意外？惊不惊喜？）
    

1.  sync log 井柏然
    
2.  nextTick1 井柏然
    
3.  nextTick2 jngboran
    

*   下面简单分析一下每个输出：
    
    ```
    this.$nextTick(() => console.log('nextTick1', this.$refs.name.innerText))this.name = 'jngboran'console.log('sync log', this.$refs.name.innerText)this.$nextTick(() => console.log('nextTick2', this.$refs.name.innerText))复制代码
    ```
    

1.  `sync log`：这个同步打印没什么好说了，相信大部分童鞋的疑问点都不在这里。如果不清楚的童鞋可以先回顾一下 EventLoop，这里不多赘述了～
    
2.  `nextTick1`：注意其虽然是放在`$nextTick`的回调中，在下一个 tick 执行，但是他的**位置**是在`this.name = 'jngboran'`的前。也就是说，他的 cb 会**比** App 组件的派发更新 (`flushSchedulerQueue`) **更先进入**队列，当`nextTick1`打印时，App 组件还未派发更新，所以拿到的还是旧的 DOM 值。
    
3.  `nextTick2`就不展开了，大家可以自行分析一下。相信大家对它应该是最肯定的，我们平时不就是这样拿到更新后的 DOM 吗？
    

*   最后来一张图加深理解
    

![](https://mmbiz.qpic.cn/mmbiz/pfCCZhlbMQRjSqvT1PAKw9II1iaaZGgMXZ4flPslvM4bDPykfUgZoudHQCGFUB5LDlXt2nDiatELIobEvjMT3hcg/640?wx_fmt=other) nextTick1.png

* * *

写在最后，nextTick 其实在 Vue 中也算是比较核心的一个东西了。因为贯穿整个 Vue 应用的组件化、响应式的派发更新与其息息相关～深入理解 nextTick 的背后实现原理，不仅能让你在**面试**的时候一展风采，更能让你在**日常开发工作**中，少走弯路少踩坑！好了，本文到这里就暂告一段落了，如果读完能让你有所收获，就帮忙点个赞吧～画图不易、创作艰辛鸭～

关于本文

作者：井柏然
======

https://juejin.cn/post/7077181211029798942

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群！领取最新最热的前端算法小书、面试小书以及海量简历模板，期待与你共进步！

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持

 》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持