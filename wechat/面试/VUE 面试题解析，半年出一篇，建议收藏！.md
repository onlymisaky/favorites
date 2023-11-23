> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CrfgtDSutz99TLDuHY0qGQ)

本文作者：开课吧大圣

图文编辑：开三金

**“VUE 面试题深入解析”**

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsic7sOAzuuBYvnUlsCjsRicO2glKRSpMzllxWMeJtgCFqWlYG6JU9FXUZg/640?wx_fmt=png)

**你对 VUEX 的使用及理解**

简单说一说 vuex 使用及其理解？

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicttzFicvxxTOX6Q34AELgZQAYHiboibMDLVwTmsLhBfuk1pA4AOtyG87rw/640?wx_fmt=png)

此题考查基本能力，能说出用法只能 60 分。更重要的是对 vuex 设计理念和实现原理的解读。

回答策略：

1、首先给 vuex 下一个定义

2、vuex 解决了哪些问题，解读理念

3、什么时候我们需要 vuex

4、你的具体用法

5、简述原理，提升层级

**首先是官网定义：**  

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。

它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

Vuex 也集成到 Vue 的官方调试工具 devtools extension。

提供了诸如零配置的 time-travel 调试、状态快照导入导出等高级调试功能。

**回答范例：**

vuex 是 vue 专用的状态管理库。

它以全局方式集中管理应用的状态，并且可以保证状态变更的可预测性。

vuex 主要解决的问题是多组件之间状态共享的问题，利用各种组件通信方式，我们虽然能够做到状态共享。

但是往往需要在多个组件之间保持状态的一致性，这种模式很容易出现问题，也会使程序逻辑变得复杂。

vuex 通过把组件的共享状态抽取出来，以全局单例模式管理。

这样任何组件都能用一致的方式获取和修改状态。

响应式的数据也能够保证简洁的单向数据流动，我们的代码将变得更结构化且易维护。

vuex 并非必须的，它帮我们管理共享状态，但却带来更多的概念和框架。

如果我们不打算开发大型单页应用或者我们的应用并没有大量全局的状态需要维护，完全没有使用 vuex 的必要。

一个简单的 store 模式就足够了。反之，Vuex 将会成为自然而然的选择。

引用 Redux 的作者 Dan Abramov 的话说就是：

Flux 架构就像眼镜：您自会知道什么时候需要它。

我在使用 vuex 过程中有如下理解：

首先是对核心概念的理解和运用，将全局状态放入 state 对象中，它本身一棵状态树，组件中使用 store 实例的 state 访问这些状态；

然后有配套的 mutation 方法修改这些状态，并且只能用 mutation 修改状态，在组件中调用 commit 方法提交 mutation；

如果应用中有异步操作或者复杂逻辑组合，我们需要编写 action，执行结束如果有状态修改仍然需要提交 mutation，组件中调用这些 action 使用 dispatch 方法派发。

最后是模块化，通过 modules 选项组织拆分出去的各个子模块，在访问状态时注意添加子模块的名称；

如果子模块有设置 namespace，那么在提交 mutation 和派发 action 时还需要额外的命名空间前缀。

vuex 在实现单项数据流时需要做到数据的响应式。

通过源码的学习发现是借用了 vue 的数据响应化特性实现的。

它会利用 Vue 将 state 作为 data 对其进行响应化处理，从而使得这些状态发生变化时，能够导致组件重新渲染。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicVyr76BqaacpjlIrPLujFguY4MNvTgCEgE2HXjGSJzoibJG8UfTePxTQ/640?wx_fmt=png)

**VUE 中组件之间的通讯方式**

vue 是组件化开发框架，所以对于 vue 应用来说组件间的数据通信非常重要。

此题主要考查大家 vue 基本功，对于 vue 基础 api 运用熟练度。

另外一些边界知识如：

provide/inject/$attrs/$listeners

这就提现了面试者的广度。

下面是一个组件通信方式总结，共 8 种：

**props**

**$emit/$on**

**$children/$parent**

**$attrs/$listeners**

**ref**

**$root**

**eventbus**

**vuex**

我们可以根据：

**组件之间关系，讨论组件通信，这样回答最为清晰有效**

**父子组件之间通信：**

props

$emit/$on

$parent / $children

ref

$attrs / $listeners

**兄弟组件：**

$parent

$root

eventbus

vuex

**跨层级关系：**

eventbus

vuex

provide/inject

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsic3Qc4mZXaz5HHbwD4iaMYTw3Fkia9FuZ6KCJ83wbRibMia5fgibicwCbT5KVQ/640?wx_fmt=png)

**vue-router 如何保护指定路由安全**

此题是考查项目实践能力，项目中基本都有路由守卫的需求，保护指定路由考查的就是这个知识点。

**答题整体思路：**

阐述 vue-router 中路由保护策略

描述具体实现方式

简单说一下它们是怎么生效的

**回答范例：**

vue-router 中保护路由安全通常使用导航守卫来做。

通过设置路由导航钩子函数的方式添加守卫函数。

在里面判断用户的登录状态和权限，从而达到保护指定路由的目的。

具体实现有几个层级：

全局前置守卫 beforeEach、路由独享守卫 beforeEnter 或组件内守卫 beforeRo-uteEnter。

以全局守卫为例来说，可以使用 router.beforeEach((to,from,next)=>{}) 方式设置守卫。

每次路由导航时，都会执行该守卫，从而检查当前用户是否可以继续导航。

通过给 next 函数传递多种参数达到不同的目的，比如如果禁止用户继续导航可以传递 next(false)。

正常放行可以不传递参数，传递 path 字符串可以重定向到一个新的地址等等。

这些钩子函数之所以能够生效，也和 vue-router 工作方式有关。

像 beforeEach 只是注册一个 hook，当路由发生变化。

router 准备导航之前会批量执行这些 hooks，并且把目标路由 to，当前路由 from。

以及后续处理函数 next 传递给我们设置的 hook。  

**可能的追问：**

能不能说说全局守卫、路由独享守卫和组件内守卫区别？

作用范围：

组件实例的获取

beforeRouteEnter(to,from,next) {

next(vm => {

})

}

**名称 / 数量 / 顺序**

▶导航被触发。

▶在失活的组件里调用离开守卫。

▶调用全局的 beforeEach 守卫。

▶在重用的组件里调用 beforeRouteUpdate 守卫 (2.2+)。

▶在路由配置里调用 beforeEnter。

▶解析异步路由组件。

▶在被激活的组件里调用 beforeRouteEnter。

▶调用全局的 beforeResolve 守卫 (2.5+)。

▶导航被确认。

▶调用全局的 afterEach 钩子。

▶触发 DOM 更新。

▶用创建好的实例调用 beforeRouteEnter 守卫中传给 next 的回调函数。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicJABo1wsiaxZ6t1ZPJfwx2O8l5ab8Eicymicg6QiahWw02V0hs1OhMyNKTw/640?wx_fmt=png)

**你知道 nextTick 吗**

这道题考查大家对 vue 异步更新队列的理解，有一定深度，如果能够很好回答此题，对面试效果有极大帮助。

**答题思路：**

▶nextTick 是啥？下一个定义

▶为什么需要它呢？用异步更新队列实现原理解释

▶我再什么地方用它呢？抓抓头，想想你在平时开发中使用它的地方

▶下面介绍一下如何使用 nextTick

▶最后能说出源码实现就会显得你格外优秀

**先看看官方定义：**

Vue.nextTick([callback, context] )

在下次 DOM 更新循环结束之后执行延迟回调。

在修改数据之后立即使用这个方法，获取更新后的 DOM。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsick4Fapw2yWZON05ObficHaSh40KnAm4nJyS8nZAh2GVv7BRfKicFIiaVkQ/640?wx_fmt=png)

**回答范例：**

nextTick 是 Vue 提供的一个全局 API。

由于 vue 的异步更新策略导致我们对数据的修改不会立刻体现在 dom 变化上。

此时如果想要立即获取更新后的 dom 状态，就需要使用这个方法。

Vue 在更新 DOM 时是异步执行的。

只要侦听到数据变化，Vue 将开启一个队列，并缓冲在同一事件循环中发生的所有数据变更。

如果同一个 watcher 被多次触发，只会被推入到队列中一次。

这种在缓冲时去除重复数据对于避免不必要的计算和 DOM 操作是非常重要的。

nextTick 方法会在队列中加入一个回调函数，确保该函数在前面的 dom 操作完成后才调用。

所以当我们想在修改数据后立即看到 dom 执行结果就需要用到 nextTick 方法。

比如，我在干什么的时候就会使用 nextTick，传一个回调函数进去，在里面执行 dom 操作即可。

我也有简单了解 nextTick 实现，它会在 callbacks 里面加入我们传入的函数。

然后用 timerFunc 异步方式调用它们，首选的异步方式会是 Promise。

这让我明白了为什么可以在 nextTick 中看到 dom 操作结果。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicSZ3mhbU3zHovgHhl3XfzKOmrbZAEfKn63a5llLn11XibwicardjtMNjQ/640?wx_fmt=png)

**说一说你对 vue 响应式理解**

烂大街的问题，但却不是每个人都能回答到位。

因为如果你只是看看别人写的网文，通常没什么底气，也经不住面试官推敲。

但像我们这样即看过源码还造过轮子的，回答这个问题就会比较有底气。

**答题思路：**

啥是响应式？

为什么 vue 需要响应式？

它能给我们带来什么好处？

vue 的响应式是怎么实现的？有哪些优缺点？

vue3 中的响应式的新变化

**回答范例：**

所谓数据响应式就是能够使数据变化可以被检测并对这种变化做出响应的机制。

mvvm 框架中要解决的一个核心问题是连接数据层和视图层，通过数据驱动应用，数据变化，视图更新。

要做到这点的就需要对数据做响应式处理，这样一旦数据发生变化就可以立即做出更新处理。

以 vue 为例说明，通过数据响应式加上虚拟 DOM 和 patch 算法。

可以使我们只需要操作数据，完全不用接触繁琐的 dom 操作，从而大大提升开发效率，降低开发难度。

vue2 中的数据响应式会根据数据类型来做不同处理。

如果是对象则采用 Object.defineProperty() 的方式定义数据拦截；

当数据被访问或发生变化时，我们感知并作出响应；

如果是数组则通过覆盖该数组原型的方法，扩展它的 7 个变更方法，使这些方法可以额外的做更新通知，从而作出响应。

这种机制很好的解决了数据响应化的问题，但在实际使用中也存在一些缺点：

比如初始化时的递归遍历会造成性能损失；

新增或删除属性时需要用户使用 Vue.set/delete 这样特殊的 api 才能生效；

对于 es6 中新产生的 Map、Set 这些数据结构不支持等问题。

为了解决这些问题，vue3 重新编写了这一部分的实现：

利用 ES6 的 Proxy 机制代理要响应化的数据，它有很多好处，编程体验是一致的，不需要使用特殊 api。

初始化性能和内存消耗都得到了大幅改善；

另外由于响应化的实现代码抽取为独立的 reactivity 包。

使得我们可以更灵活的使用它，我们甚至不需要引入 vue 都可以体验。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicvpsZicLVMvzWyB2iboyFSvPPicEHnRibNhThMhMqas84eU9zk5MPFxtiaYA/640?wx_fmt=png)

**如何扩展某个 Vue 组件**

此题属于实践题，着重考察大家对 vue 常用 api 使用熟练度，答题时不仅要列出这些解决方案，同时最好说出他们异同。

**答题思路：**

按照逻辑扩展和内容扩展来列举，逻辑扩展有：

mixins、extends、composition api；

内容扩展有 slots；

分别说出他们使用使用方法、场景差异和问题。

作为扩展，还可以说说 vue3 中新引入的 composition api 带来的变化

**回答范例：**

1、常见的组件扩展方法有：mixins，slots，extends 等

2、混入 mixins 是分发 Vue 组件中可复用功能的非常灵活的方式。混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被混入该组件本身的选项。

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicCTeMOfiaLVB6lxIibrgAE483IiaF2hzWhak0su8EtR7KAzx9xqWYMyWtA/640?wx_fmt=png)

3、插槽主要用于 vue 组件中的内容分发，也可以用于组件扩展。

子组件 Child

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicBqBj5R7MFXficv7113wFXJicjl3kHbDwtSFF6nKJqWL385DxFNeNiaHaA/640?wx_fmt=png)

父组件 Parent

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsicRYG4E9O4llAFecLhkK9G5RQYtLVdcy9VML5VPtCH1sia5JAcoeBxBCA/640?wx_fmt=png)

如果要精确分发到不同位置可以使用具名插槽，如果要使用子组件中的数据可以使用作用域插槽。

4、组件选项中还有一个不太常用的选项 extends，也可以起到扩展组件的目的

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsiciaKbNqrF7ibnKvdRL0h4tYdDge2e3tmvc4rDjSPTvqCddOGhZr99eqzA/640?wx_fmt=png)

5、混入的数据和方法不能明确判断来源且可能和当前组件内变量产生命名冲突。

vue3 中引入的 composition api，可以很好解决这些问题。

利用独立出来的响应式模块可以很方便的编写独立逻辑并提供响应式的数据。

然后在 setup 选项中有机组合使用。

例如：

![图片](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRYY0ypIkjeGZAEdajHALsic7P4FCWIcSpTtwu7gLpXGqM0tptRdhLuCqamSto3HCbf87fOVva20lw/640?wx_fmt=png)

在文章的结尾，村长还准备了几道思考题，希望能帮助到同学们巩固知识。

**思考题：**

▶你项目中的路由守卫是怎么做的？

▶前后端路由一样吗？

▶前端路由是用什么方式实现的？

▶你前面提到的 next 方法是怎么实现的？

▶Vue.extend 方法你用过吗？它能用来做组件扩展吗？

最后
--

欢迎关注「前端瓶子君」，回复「交流」加入前端交流群！  

欢迎关注「前端瓶子君」，回复「算法」自动加入，从 0 到 1 构建完整的数据结构与算法体系！

另外，每周还有手写源码题，瓶子君也会解答哟！

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持