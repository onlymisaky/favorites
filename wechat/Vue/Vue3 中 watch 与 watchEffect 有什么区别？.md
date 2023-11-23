> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Xyqm1GRBJJW3cIe17-pIuw)

大厂技术  高级前端  Node 进阶
===================

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流

> 作者：Anthony Fu
> 
> 原文：https://www.zhihu.com/question/462378193/answer/1916657458

你可以认为他们是同一个功能的两种不同形态，底层的实现是一样的。

*   `watch`- 显式指定依赖源，依赖源更新时执行回调函数
    
*   `watchEffect` - 自动收集依赖源，依赖源更新时重新执行自身
    

响应式依赖收集
-------

首先先需要了解一下 Vue 3 的响应式 [1] 是怎么工作的。我想很多文章都详细的讲过这个部分了，这里就简单带过一下。这里有个简化版的 `ref` 的实现：

```
const ref = (initialValue) => {  let _value = initialValue  return {    get value() {      track(this, 'value') // 收集依赖      return _value    },    set value() {      _value = value      trigger(this, 'value') // 触发依赖    }  }}
```

访问数据时，`track` 被呼叫并记录下访问了的字段。而当写入数据时，`trigger` 被呼叫并触发之前所依赖了这个字段所绑定事件更新（即 `effect` - `computed`, `watch`, `watchEffect` 底层都是 `effect`），他们会被记录在一个全局的 WeakMap 中，这里就不展开了，感兴趣可以去看源码。

```
const counter = ref(1)console.log(counter.value) // `track()` 被呼叫counter.value = 2 // `trigger()` 被呼叫
```

当我们需要函数里的依赖时，只需要记录函数执行的过程中 `track()`被呼叫的次数（和对应的对象与字段）即可。例如：

```
const counter = ref(1)function foo() {  console.log(counter.value)}function collectDeps() {  startTracking()  foo() // 在这个过程中，counter 被收集  stopTracking()}
```

这样便可以知道 `foo` 这个函数依赖了 `counter`。

Watch
-----

一个 generalised 的 `watch` API 应该是这样的（其他类似直接接受 ref 或者 reactive 作为参数的其实都是糖）

```
watch(  () => { /* 依赖源收集函数 */ },  () => { /* 依赖源改变时的回调函数 */ })
```

这里的依赖源函数只会执行一次，回调函数会在每次依赖源改变的时候触发，但是并不对回调函数进行依赖收集。也就是说，依赖源和回调函数之间并不一定要有直接关系。

WatchEffect
-----------

`watchEffect` 相当于将 `watch` 的依赖源和回调函数合并，当任何你有用到的响应式依赖更新时，该回调函数便会重新执行。不同于 `watch`，`watchEffect` 的回调函数会被立即执行（即 `{ immediate: true }`）

```
watchEffect(  () => { /* 依赖源同时是回调函数 */ })
```

以下两种用法在行为上基本等价

```
watchEffect(  () => console.log(counter.value))watch(  () => counter.value,  () => console.log(counter.value),  { immediate: true })
```

与 `watch` 不同的一点是，在 `watchEffect` 中依赖源会被重复执行，动态新增加的依赖也会被收集，例如

```
const counter = ref(0)const enabled = ref(false)watchEffect(() => {  if (enabled.value)    console.log(counter.value)})// (以下忽略 nextTick)// watchEffect 会被立即执行，因为 “enabled“ 为 false, 此时仅收集到 “enabled“ 依赖counter.value += 1 // 无反应enabled.value = true // Effect 触发，控制台出 "1"counter.value += 1 // “counter“ 被作为新的依赖被收集，控制台出 "2"enabled.value = false // 函数被重新执行，无输出counter.value += 1 // 函数被重新执行，无输出 (虽然 counter 已经没有用了，但是作为依赖还是会触发函数）
```

顺带一提，`[computed](https://www.zhihu.com/search?q=computed&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A1916657458%7D "computed")` 其实类似一个带输出的同步版本的 `watchEffect`。

什么时候用什么？
--------

推荐在大部分时候用 `watch` 显式的指定依赖以避免不必要的重复触发，也避免在后续代码修改或重构时不小心引入新的依赖。`watchEffect` 适用于一些逻辑相对简单，依赖源和逻辑强相关的场景（或者懒惰的场景 ）。

如果对这个主题感兴趣的话，也可以参考我的博文 [2]，教你如何手写 Watch (英文)

### 参考资料

[1]

响应式: https://www.zhihu.com/search?q=%E5%93%8D%E5%BA%94%E5%BC%8F&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A1916657458%7D

[2]

博文: https://antfu.me/posts/watch-with-reactivity

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波

```