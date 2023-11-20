> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/cAYBqBc-2YbLUApKpvjxMg)

写在前面
----

这道题目是面试中相当高频的一道题目了，但凡你简历上有写：“熟练使用`Vue`并阅读过其部分源码”，那么这道题目十有八九面试官都会去问你。

> “
> 
> 什么？你简历上不写阅读过源码，那面试官也很有可能会问你是否阅读过响应式相关的源码

还是那句歌词唱的：

```
挣不脱 逃不过<br style="visibility: visible;">眉头解不开的结<br style="visibility: visible;">命中解不开的劫<br style="visibility: visible;">
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/LNrWl4n5XIJLTpM8MaxFeoDqVU7D7pS9JGXnV4Y5fFtxaWkDzPnE28ROS0rIJ6db4jYvySksVys7bnqmpgUBuQ/640?wx_fmt=jpeg)

整体流程
----

作为一个前端的`MVVM`框架，`Vue`的基本思路和`Angular`、`React`并无二致，其核心就在于: 当数据变化时，自动去刷新页面`DOM`，这使得我们能从繁琐的`DOM`操作中解放出来，从而专心地去处理业务逻辑。

这就是`Vue`的数据双向绑定（又称响应式原理）。数据双向绑定是`Vue`最独特的特性之一。此处我们用官方的一张流程图来简要地说明一下`Vue`响应式系统的整个流程：![](https://mmbiz.qpic.cn/mmbiz/LNrWl4n5XIJLTpM8MaxFeoDqVU7D7pS9Q1U7faWOWn6ib4RV3TVicmL2dPvrq536ibibbFYciabVfsGuXZ2WtCqLp0g/640?wx_fmt=other)

在`Vue`中，每个组件实例都有相应的`watcher`实例对象，它会在组件渲染的过程中把属性记录为依赖，之后当依赖项的`setter`被调用时，会通知`watcher`重新计算，从而致使它关联的组件得以更新。

> “
> 
> 这是一个典型的观察者模式。

关键角色
----

在 Vue 数据双向绑定的实现逻辑里，有这样三个关键角色：

*   `Observer`: 它的作用是给对象的属性添加`getter`和`setter`，用于依赖收集和派发更新
    
*   `Dep`: 用于收集当前响应式对象的依赖关系, 每个响应式对象包括子对象都拥有一个`Dep`实例（里面`subs`是`Watcher`实例数组）, 当数据有变更时, 会通过`dep.notify()`通知各个`watcher`。
    
*   `Watcher`: 观察者对象 , 实例分为`渲染 watcher (render watcher)`,`计算属性 watcher (computed watcher)`,`侦听器 watcher（user watcher）`三种
    

Watcher 和 Dep 的关系
-----------------

为什么要单独拎出来一小节专门来说这个问题呢？因为大部分同学只是知道：`Vue`的响应式原理是通过`Object.defineProperty`实现的。被`Object.defineProperty`绑定过的对象，会变成「响应式」化。也就是改变这个对象的时候会触发`get`和`set`事件。

但是对于里面具体的对象依赖关系并不是很清楚，这样也就给了面试官一种：你只是背了答案，对于响应式的内部实现细节，你并不是很清楚的印象。

关于`Watcher 和 Dep 的关系`这个问题，其实刚开始我也不是很清楚，在查阅了相关资料后，才逐渐对里面的具体实现有了清晰的理解。

![](https://mmbiz.qpic.cn/mmbiz_png/LNrWl4n5XIJLTpM8MaxFeoDqVU7D7pS9ticYbU3ib5ibsUHwWHCYPRx2ysMNC6928wAfRl2iaCtibwR40HFNOcUe3rg/640?wx_fmt=png)

刚接触`Dep`这个词的同学都会比较懵: `Dep`究竟是用来做什么的呢？我们通过`defineReactive`方法将`data`中的数据进行响应式后，虽然可以监听到数据的变化了，那我们怎么处理通知视图就更新呢？

`Dep`就是帮我们`依赖管理`的。

如上图所示：一个属性可能有多个依赖，每个响应式数据都有一个`Dep`来管理它的依赖。

一段话总结原理
-------

上面说了那么多，下面我总结一下`Vue响应式`的核心设计思路：

当创建`Vue`实例时,`vue`会遍历`data`选项的属性, 利用`Object.defineProperty`为属性添加`getter`和`setter`对数据的读取进行劫持（`getter`用来依赖收集,`setter`用来派发更新）, 并且在内部追踪依赖, 在属性被访问和修改时通知变化。

每个组件实例会有相应的`watcher`实例, 会在组件渲染的过程中记录依赖的所有数据属性（进行依赖收集, 还有`computed watcher`,`user watcher`实例）, 之后依赖项被改动时,`setter`方法会通知依赖与此`data`的`watcher`实例重新计算（派发更新）, 从而使它关联的组件重新渲染。

到这里，我们已经了解了 “套路”，下面让我们用伪代码来实现一下`Vue`的响应式吧！

核心实现
----

```
/** * @name Vue数据双向绑定（响应式系统）的实现原理 */// observe方法遍历并包装对象属性function observe(target) {  // 若target是一个对象，则遍历它  if (target && typeof target === "Object") {    Object.keys(target).forEach((key) => {      // defineReactive方法会给目标属性装上“监听器”      defineReactive(target, key, target[key]);    });  }}// 定义defineReactive方法function defineReactive(target, key, val) {  const dep = new Dep();  // 属性值也可能是object类型，这种情况下需要调用observe进行递归遍历  observe(val);  // 为当前属性安装监听器  Object.defineProperty(target, key, {    // 可枚举    enumerable: true,    // 不可配置    configurable: false,    get: function () {      return val;    },    // 监听器函数    set: function (value) {      dep.notify();    },  });}class Dep {  constructor() {    this.subs = [];  }  addSub(sub) {    this.subs.push(sub);  }  notify() {    this.subs.forEach((sub) => {      sub.update();    });  }}
```