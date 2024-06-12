> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/d8Nc_14zG5VYdflEMbTg1A)

  

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

写在前面

这是 Vue3 源码分析的第三篇，与响应式系统中调度执行有关，其中 **computed**、**watch** 等核心功能都离不开它，可见其重要程度。

除了实现可调度性，我们还会借助它来实现 vue 中一个非常重要的功能，**批量更新**或者叫**异步更新**

多次修改数据 (例如自身 num10 次)，只进行一次页面渲染（页面只会渲染最后一次 num10）。

1.  [面试官：Vue3 响应式系统都不会写，还敢说精通？](http://mp.weixin.qq.com/s?__biz=MzI4ODYzOTk1OQ==&mid=2247490287&idx=1&sn=4c7ff6b49da0312c30b8ac006ea7c415&chksm=ec3a0457db4d8d4189ef72ffc4674b05511c115c79cdd348c0183ab78182581c8541bdc0bbc0&scene=21#wechat_redirect)
    
2.  [面试官：你觉得 Vue 的响应式系统仅仅是一个 Proxy？](http://mp.weixin.qq.com/s?__biz=MzI4ODYzOTk1OQ==&mid=2247489156&idx=1&sn=4e7eff3ea084bbeec3529bf7796ce687&chksm=ec3a083cdb4d812aa33ad50392463eb387a4d556005cff5ce5db9b860b8aaaacd3013f549cb9&scene=21#wechat_redirect)
    

什么是调度执行？
--------

**什么是调度执行？**

> 指的是响应式数据发生变化出发副作用函数重新执行时，我们有能力去决定副作用函数的**执行时机**、**次数**和**方式**。

来看个例子

```
const state = reactive({
  num: 1
})

effect(() => {
  console.log('num', state.num)
})

state.num++

console.log('end')



```

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM04sYtxMVD5LiajZf970uFatE5LBVXF15kjB0Ev9IwXVayxvGYPKr6LwUxLLOU8qneaYOmO9suxh30A/640?wx_fmt=png)

如果我们想要它按照这个顺序书序呢？

```
1
end
2



```

你可能会说，我调换一下代码顺序就好了哇！！！

```
const state = reactive({
  num: 1
})

effect(() => {
  console.log('num', state.num)
})

console.log('end')

state.num++


```

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM04sYtxMVD5LiajZf970uFatENb8yyH0ay1TTLsIV9lWoiatYm13uZzodKib9yA7HLITe0qmUgk8nE4UQ/640?wx_fmt=png)

淫才啊！😄 瞬间就解决了问题。不过看起来这不是我们想要最终答案。

我们想要通过实现可调度性来解决这个问题。

如何实现可调度？
--------

我们从结果出发来思考如何实现可调度的特性。

```
const state = reactive({
  num: 1
})

effect(() => {
  console.log(state.num)
}, {
  // 注意这里，假如num发生变化的时候执行的是scheduler函数
  // 那么end将会被先执行，因为我们用setTimeout包裹了一层fn
  scheduler (fn) {
    // 异步执行
    setTimeout(() => {
      fn()
    }, 0)
  }
})

state.num++

console.log('end')


```

看到这里也许你已经明白了，我们将通过 **scheduler** 来自主控制副作用函数的执行时机。

在这之前，执行`state.num++`之后，`console.log(state.num)`将会被马上执行，而添加 scheduler 后，num 发生变化后将执行 scheduler 中的逻辑。

**源码实现**

虽然可调度性在 Vue 中非常重要，但实现这个机制却非常简单，我们甚至只要增加两行代码就可以搞定。

**第一行代码**

```
// 增加options参数
const effect = function (fn, options = {}) {
  const effectFn = () => {
   // ....
  }
  // ...
  // 将options参数挂在effectFn上，便于effectFn执行时可以读取到scheduler
  effectFn.options = options
}


```

**第二行代码**

```
function trigger(target, key) {
// ...

  effectsToRun.forEach((effectFn) => {
    // 当指定了scheduler时，将执行scheduler而不是注册的副作用函数effectFn
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}


```

是不是简单到离谱？

批量更新 & 异步更新
-----------

来看段诡异的代码，请问 num 会被执行多少次？100 还是 101？

```
const state = reactive({
  num: 1
})

effect(() => {
  console.log('num', state.num)
})

let count = 100

while (count--) {
  state.num++
}


```

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM04sYtxMVD5LiajZf970uFatEoVFhovJyA3PXfW3nCSQFTx4ggzdbsK2oBIf64PuUTdoNcWJEbmlNPA/640?wx_fmt=png)

对于页面渲染来说 1 到 101 中间的 2~100 仅仅只是过程，并不是最终的结果，处于性能考虑 Vue 只会渲染最后一次的 101。

**Vue 是如何做到的呢？**

利用可调度性，再加点**事件循环**的知识，我们就可以做到这件事。

1.  num 的每次变化都会导致 scheduler 的执行，并将注册好的副作用函数存入 jobQueue 队列，因为 Set 本身的去重性质，最终只会存在一个 fn
    
2.  利用 Promise 微任务的特性，当 num 被更改 100 次之后同步代码全部执行结束后，then 回调将会被执行，此时 num 已经是 101，而 jobQueue 中也只有一个 fn，所以最终只会打印一次 101
    

```
 const state = reactive({
  num: 1
})

const jobQueue = new Set()
const p = Promise.resolve()
let isFlushing = false

const flushJob = () => {
  if (isFlushing) {
    return
  }

  isFlushing = true
  // 微任务
  p.then(() => {
    jobQueue.forEach((job) => job())
  }).finally(() => {
    // 结束后充值设置为false
    isFlushing = false
  })
}

effect(() => {
  console.log('num', state.num)
}, {
  scheduler (fn) {
    // 每次数据发生变化都往队列中添加副作用函数
    jobQueue.add(fn)
    // 并尝试刷新job，但是一个微任务只会在事件循环中执行一次，所以哪怕num变化了100次，最后也只会执行一次副作用函数
    flushJob()
  }
})

let count = 100

while (count--) {
  state.num++
}



```

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM04sYtxMVD5LiajZf970uFatE9LI6nsXaC8ISBLNx2Ug8rwQUMnROmaib6InW1BDibowicu2bKL9A4cUDw/640?wx_fmt=png)

结尾
--

最近在阅读**霍春阳**大佬的 **《Vue.js 技术设计与实现》**，本文的内容主要来源于这本书，强烈推荐对 Vue 底层实现感兴趣的同学阅读。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```