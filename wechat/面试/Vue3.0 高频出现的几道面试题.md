> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Vkcd81bjT-p78-J9ddgnMg)

![](https://mmbiz.qpic.cn/mmbiz_png/AObYw7yOvU4zUlqrjjhcU8eiaXRYHGKDapvzG1v0hvedQhK2gX8kK6Vab1FLRwDQxBFKwBMoOgvia3Ilw1BZKaFw/640?wx_fmt=png)

### 1. Vue 3.0 性能提升主要是通过哪几方面体现的？

#### 1. 响应式系统提升

vue2 在初始化的时候，对 data 中的每个属性使用 definepropery 调用 getter 和 setter 使之变为响应式对象。如果属性值为对象，还会递归调用 defineproperty 使之变为响应式对象。

vue3 使用 proxy 对象重写响应式。proxy 的性能本来比 defineproperty 好，proxy 可以拦截属性的访问、赋值、删除等操作，不需要初始化的时候遍历所有属性，另外有多层属性嵌套的话，只有访问某个属性的时候，才会递归处理下一级的属性。

#### 优势：

*   可以监听动态新增的属性；
    
*   可以监听删除的属性 ；
    
*   可以监听数组的索引和 length 属性；
    

#### 2. 编译优化

优化编译和重写虚拟 dom，让首次渲染和更新 dom 性能有更大的提升 vue2 通过标记静态根节点, 优化 diff 算法 vue3 标记和提升所有静态根节点, diff 的时候只比较动态节点内容

Fragments, 模板里面不用创建唯一根节点, 可以直接放同级标签和文本内容

#### 静态提升

patch flag, 跳过静态节点, 直接对比动态节点, 缓存事件处理函数

#### 3. 源码体积的优化

vue3 移除了一些不常用的 api，例如：inline-template、filter 等 使用 tree-shaking

2. Composition Api 与 Vue 2.x 使用的 Options Api 有什么区别？
---------------------------------------------------

#### Options Api

包含一个描述组件选项（data、methods、props 等）的对象 options；

API 开发复杂组件，同一个功能逻辑的代码被拆分到不同选项 ；

使用 mixin 重用公用代码，也有问题：命名冲突，数据来源不清晰；

#### composition Api

vue3 新增的一组 api，它是基于函数的 api，可以更灵活的组织组件的逻辑。

解决 options api 在大型项目中，options api 不好拆分和重用的问题。

3. Proxy 相对于 Object.defineProperty
----------------------------------

有哪些优点？

proxy 的性能本来比 defineproperty 好，proxy 可以拦截属性的访问、赋值、删除等操作，不需要初始化的时候遍历所有属性，另外有多层属性嵌套的话，只有访问某个属性的时候，才会递归处理下一级的属性。

*   可以 * 监听数组变化
    
*   可以劫持整个对象
    
*   操作时不是对原对象操作, 是 new Proxy 返回的一个新对象
    
*   可以劫持的操作有 13 种
    

4. Vue 3.0 在编译方面有哪些优化？
----------------------

vue.js 3.x 中标记和提升所有的静态节点，diff 的时候只需要对比动态节点内容；

#### Fragments（升级 vetur 插件):

template 中不需要唯一根节点，可以直接放文本或者同级标签

静态提升 (hoistStatic), 当使用 hoistStatic 时, 所有静态的节点都被提升到 render 方法之外. 只会在应用启动的时候被创建一次, 之后使用只需要应用提取的静态节点，随着每次的渲染被不停的复用。

patch flag, 在动态标签末尾加上相应的标记, 只能带 patchFlag 的节点才被认为是动态的元素, 会被追踪属性的修改, 能快速的找到动态节点, 而不用逐个逐层遍历，提高了虚拟 dom diff 的性能。

缓存事件处理函数 cacheHandler, 避免每次触发都要重新生成全新的 function 去更新之前的函数 tree shaking 通过摇树优化核心库体积, 减少不必要的代码量

5.  Vue.js 3.0 响应式系统的实现原理？
--------------------------

#### 1. reactive

设置对象为响应式对象。接收一个参数，判断这参数是否是对象。不是对象则直接返回这个参数，不做响应式处理。创建拦截器 handerler，设置 get/set/deleteproperty。

#### get

*   收集依赖（track）；
    
*   如果当前 key 的值是对象，则为当前 key 的对
    
*   象创建拦截器 handler, 设置 get/set/deleteProperty；
    

如果当前的 key 的值不是对象，则返回当前 key 的值。

#### set

设置的新值和老值不相等时，更新为新值，并触发更新（trigger）。

deleteProperty 当前对象有这个 key 的时候，删除这个 key 并触发更新（trigger）。

#### 2. effect

接收一个函数作为参数。作用是：访问响应式对象属性时去收集依赖

#### 3. track

#### 接收两个参数：target 和 key

－如果没有 activeEffect，则说明没有创建 effect 依赖

－如果有 activeEffect，则去判断 WeakMap 集合中是否有 target 属性

－WeakMap 集合中没有 target 属性，则 set(target, (depsMap = new Map()))

－WeakMap 集合中有 target 属性，则判断 target 属性的 map 值的 depsMap 中是否有 key 属性

－depsMap 中没有 key 属性，则 set(key, (dep = new Set())) －depsMap 中有 key 属性，则添加这个 activeEffect

#### 4.trigger

判断 WeakMap 中是否有 target 属性，WeakMap 中有 target 属性，则判断 target 属性的 map 值中是否有 key 属性，有的话循环触发收集的 effect()。

作者：大唐荣华

blog.csdn.net/weixin_40599109/article/details/110938941

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

![](https://mmbiz.qpic.cn/mmbiz_gif/bwG40XYiaOKmibEL4rxRMd1XEbhsGicGUHAkkLAic8NcbuXRibfqgHian9Ckl9dbRPzP72SoHTe9qDqzhWYRSJT2DQUg/640?wx_fmt=gif)

》》面试官也在看的前端面试资料《《

“在看和转发” 就是最大的支持