> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/z5kAkyAzsj6erfWUQSN3UA)

> 授权转载自：https://juejin.im/post/6862206197877964807

前言
--

在性能优化上，最常见的手段就是缓存。对需要经常访问的资源进行缓存，减少请求或者是初始化的过程，从而降低时间或内存的消耗。`Vue` 为我们提供了缓存组件 `keep-alive`，它可用于路由级别或组件级别的缓存。

但其中的缓存原理你是否了解，组件缓存渲染又是如何工作。那么本文就来解析 `keep-alive` 的原理。

LRU 策略
------

在使用 `keep-alive` 时，可以添加 `prop` 属性 `include`、`exclude`、`max` 允许组件有条件的缓存。既然有限制条件，旧的组件需要删除缓存，新的组件就需要加入到最新缓存，那么要如何制定对应的策略？

LRU（Least recently used，最近最少使用）策略根据数据的历史访问记录来进行淘汰数据。LRU 策略的设计原则是，如果一个数据在最近一段时间没有被访问到，那么在将来它被访问的可能性也很小。也就是说，当限定的空间已存满数据时，应当把最久没有被访问到的数据淘汰。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQSWTBMUvtMSwgL8AHC7IZXODLdMRT0bUKytIGZgt8Le8XHWu2U5aaUnqktOm2mqFibmMbQ9iafkVWSA/640?wx_fmt=png)

1.  现在缓存最大只允许存 3 个组件，ABC 三个组件依次进入缓存，没有任何问题
    
2.  当 D 组件被访问时，内存空间不足，A 是最早进入也是最旧的组件，所以 A 组件从缓存中删除，D 组件加入到最新的位置
    
3.  当 B 组件被再次访问时，由于 B 还在缓存中，B 移动到最新的位置，其他组件相应的往后一位
    
4.  当 E 组件被访问时，内存空间不足，C 变成最久未使用的组件，C 组件从缓存中删除，E 组件加入到最新的位置
    

`keep-alive` 缓存机制便是根据 LRU 策略来设置缓存组件新鲜度，将很久未访问的组件从缓存中删除。了解完缓存机制，接下来进入源码，看看`keep-alive`组件是如何实现的。

组件实现原理
------

```
// 源码位置：src/core/components/keep-alive.jsexport default {  name: 'keep-alive',  abstract: true,  props: {    include: patternTypes,    exclude: patternTypes,    max: [String, Number]  },  created () {    this.cache = Object.create(null)    this.keys = []  },  destroyed () {    for (const key in this.cache) {      pruneCacheEntry(this.cache, key, this.keys)    }  },  mounted () {    this.$watch('include', val => {      pruneCache(this, name => matches(val, name))    })    this.$watch('exclude', val => {      pruneCache(this, name => !matches(val, name))    })  },  render () {    const slot = this.$slots.default    const vnode: VNode = getFirstComponentChild(slot)    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions    if (componentOptions) {      // check pattern      const name: ?string = getComponentName(componentOptions)      const { include, exclude } = this      if (        // not included        (include && (!name || !matches(include, name))) ||        // excluded        (exclude && name && matches(exclude, name))      ) {        return vnode      }      const { cache, keys } = this      const key: ?string = vnode.key == null        // same constructor may get registered as different local components        // so cid alone is not enough (#3269)        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')        : vnode.key      if (cache[key]) {        vnode.componentInstance = cache[key].componentInstance        // make current key freshest        remove(keys, key)        keys.push(key)      } else {        cache[key] = vnode        keys.push(key)        // prune oldest entry        if (this.max && keys.length > parseInt(this.max)) {          pruneCacheEntry(cache, keys[0], keys, this._vnode)        }      }      vnode.data.keepAlive = true    }    return vnode || (slot && slot[0])  }}
```

`kepp-alive` 实际是一个抽象组件，只对包裹的子组件做处理，并不会和子组件建立父子关系，也不会作为节点渲染到页面上。在组件开头就设置 `abstract` 为 `true`，代表该组件是一个抽象组件。

```
// 源码位置：src/core/instance/lifecycle.jsexport function initLifecycle (vm: Component) {  const options = vm.$options  // locate first non-abstract parent  let parent = options.parent  if (parent && !options.abstract) {    while (parent.$options.abstract && parent.$parent) {      parent = parent.$parent    }    parent.$children.push(vm)  }  vm.$parent = parent  // ...}
```

那么抽象组件是如何忽略这层关系的呢？在初始化阶段会调用 `initLifecycle`，里面判断父级是否为抽象组件，如果是抽象组件，就选取抽象组件的上一级作为父级，忽略与抽象组件和子组件之间的层级关系。

回到 `keep-alive` 组件，组件是没有编写 `template` 模板，而是由 `render` 函数决定渲染结果。

```
const slot = this.$slots.defaultconst vnode: VNode = getFirstComponentChild(slot)
```

如果 `keep-alive` 存在多个子元素，`keep-alive` 要求同时只有一个子元素被渲染。所以在开头会获取插槽内的子元素，调用 `getFirstComponentChild` 获取到第一个子元素的 `VNode`。

```
// check patternconst name: ?string = getComponentName(componentOptions)const { include, exclude } = thisif (  // not included  (include && (!name || !matches(include, name))) ||  // excluded  (exclude && name && matches(exclude, name))) {  return vnode}function matches (pattern: string | RegExp | Array<string>, name: string): boolean {  if (Array.isArray(pattern)) {    return pattern.indexOf(name) > -1  } else if (typeof pattern === 'string') {    return pattern.split(',').indexOf(name) > -1  } else if (isRegExp(pattern)) {    return pattern.test(name)  }  return false}
```

接着判断当前组件是否符合缓存条件，组件名与`include`不匹配或与`exclude`匹配都会直接退出并返回 `VNode`，不走缓存机制。

```
const { cache, keys } = thisconst key: ?string = vnode.key == null  // same constructor may get registered as different local components  // so cid alone is not enough (#3269)  ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')  : vnode.keyif (cache[key]) {  vnode.componentInstance = cache[key].componentInstance  // make current key freshest  remove(keys, key)  keys.push(key)} else {  cache[key] = vnode  keys.push(key)  // prune oldest entry  if (this.max && keys.length > parseInt(this.max)) {    pruneCacheEntry(cache, keys[0], keys, this._vnode)  }}vnode.data.keepAlive = true
```

匹配条件通过会进入缓存机制的逻辑，如果命中缓存，从 `cache` 中获取缓存的实例设置到当前的组件上，并调整 `key` 的位置将其放到最后。如果没命中缓存，将当前 `VNode` 缓存起来，并加入当前组件的 `key`。如果缓存组件的数量超出 `max` 的值，即缓存空间不足，则调用 `pruneCacheEntry` 将最旧的组件从缓存中删除，即 `keys[0]` 的组件。之后将组件的 `keepAlive` 标记为 `true`，表示它是被缓存的组件。

```
function pruneCacheEntry (  cache: VNodeCache,  key: string,  keys: Array<string>,  current?: VNode) {  const cached = cache[key]  if (cached && (!current || cached.tag !== current.tag)) {    cached.componentInstance.$destroy()  }  cache[key] = null  remove(keys, key)}
```

`pruneCacheEntry` 负责将组件从缓存中删除，它会调用组件 `$destroy` 方法销毁组件实例，缓存组件置空，并移除对应的 `key`。

```
mounted () {  this.$watch('include', val => {    pruneCache(this, name => matches(val, name))  })  this.$watch('exclude', val => {    pruneCache(this, name => !matches(val, name))  })}function pruneCache (keepAliveInstance: any, filter: Function) {  const { cache, keys, _vnode } = keepAliveInstance  for (const key in cache) {    const cachedNode: ?VNode = cache[key]    if (cachedNode) {      const name: ?string = getComponentName(cachedNode.componentOptions)      if (name && !filter(name)) {        pruneCacheEntry(cache, key, keys, _vnode)      }    }  }}
```

`keep-alive` 在 `mounted` 会监听 `include` 和 `exclude` 的变化，属性发生改变时调整缓存和 `keys` 的顺序，最终调用的也是 `pruneCacheEntry`。

**小结**：`cache` 用于缓存组件，`keys` 存储组件的 `key`，根据 LRU 策略来调整缓存组件。`keep-alive` 的 `render` 中最后会返回组件的 `VNode`，因此我们也可以得出一个结论，`keep-alive` 并非真的不会渲染，而是渲染的对象是包裹的子组件。

组件渲染流程
------

> 温馨提示：这部分内容需要对 `render` 和 `patch` 过程有了解

渲染过程最主要的两个过程就是 `render` 和 `patch`，在 `render` 之前还会有模板编译，`render` 函数就是模板编译后的产物，它负责构建 `VNode` 树，构建好的 `VNode` 会传递给 `patch`，`patch` 根据 `VNode` 的关系生成真实 dom 节点树。

这张图描述了 `Vue` 视图渲染的流程： ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQSWTBMUvtMSwgL8AHC7IZXOz3icD2nZv2PRZlzQZBJ2UvFv9cCas7zk5oVtZK1GicoNpquekSVRicokw/640?wx_fmt=png) 

`VNode`构建完成后，最终会被转换成真实 dom，而 `patch` 是必经的过程。为了更好的理解组件渲染的过程，假设 `keep-alive` 包括的组件有 A 和 B 两个组件，默认展示 A 组件。  

### 初始化渲染

组件在 `patch` 过程是会执行 `createComponent` 来挂载组件的，A 组件也不例外。

```
// 源码位置：src/core/vdom/patch.jsfunction createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {  let i = vnode.data  if (isDef(i)) {    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive    if (isDef(i = i.hook) && isDef(i = i.init)) {      i(vnode, false /* hydrating */)    }    // after calling the init hook, if the vnode is a child component    // it should've created a child instance and mounted it. the child    // component also has set the placeholder vnode's elm.    // in that case we can just return the element and be done.    if (isDef(vnode.componentInstance)) {      initComponent(vnode, insertedVnodeQueue)      insert(parentElm, vnode.elm, refElm)      if (isTrue(isReactivated)) {        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)      }      return true    }  }}
```

`isReactivated` 标识组件是否重新激活。在初始化渲染时，A 组件还没有初始化构造完成，`componentInstance` 还是 `undefined`。而 A 组件的 `keepAlive` 是 `true`，因为 `keep-alive` 作为父级包裹组件，会先于 A 组件挂载，也就是 `kepp-alive` 会先执行 `render` 的过程，A 组件被缓存起来，之后对插槽内第一个组件（A 组件）的 `keepAlive` 赋值为 `true`，不记得这个过程请看上面组件实现的代码。所以此时的 `isReactivated` 是 `false`。

接着会调用 `init` 函数进行组件初始化，它是组件的一个钩子函数：

```
// 源码位置：src/core/vdom/create-component.jsconst componentVNodeHooks = {  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {    if (      vnode.componentInstance &&      !vnode.componentInstance._isDestroyed &&      vnode.data.keepAlive    ) {      // kept-alive components, treat as a patch      const mountedNode: any = vnode // work around flow      componentVNodeHooks.prepatch(mountedNode, mountedNode)    } else {      const child = vnode.componentInstance = createComponentInstanceForVnode(        vnode,        activeInstance      )      child.$mount(hydrating ? vnode.elm : undefined, hydrating)    }  },  // ...}
```

`createComponentInstanceForVnode` 内会 `new Vue` 构造组件实例并赋值到 `componentInstance`，随后调用 `$mount` 挂载组件。

回 `createComponent`，继续走下面的逻辑：

```
if (isDef(vnode.componentInstance)) {  initComponent(vnode, insertedVnodeQueue)  insert(parentElm, vnode.elm, refElm)  if (isTrue(isReactivated)) {    reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)  }  return true}
```

调用 `initComponent` 将 `vnode.elm` 赋值为真实 dom，然后调用 `insert` 将组件的真实 dom 插入到父元素中。

所以在初始化渲染中，`keep-alive` 将 A 组件缓存起来，然后正常的渲染 A 组件。

### 缓存渲染

当切换到 B 组件，再切换回 A 组件时，A 组件命中缓存被重新激活。

再次经历 `patch` 过程，`keep-alive` 是根据插槽获取当前的组件，那么插槽的内容又是如何更新实现缓存?

```
const isRealElement = isDef(oldVnode.nodeType)if (!isRealElement && sameVnode(oldVnode, vnode)) {  // patch existing root node  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)}
```

非初始化渲染时，`patch` 会调用 `patchVnode` 对比新旧节点。

```
// 源码位置：src/core/vdom/patch.jsfunction patchVnode (  oldVnode,  vnode,  insertedVnodeQueue,  ownerArray,  index,  removeOnly) {  // ...  let i  const data = vnode.data  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {    i(oldVnode, vnode)  }  // ...}
```

`patchVnode` 内会调用钩子函数 `prepatch`。

```
// 源码位置：src/core/vdom/create-component.jsprepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {  const options = vnode.componentOptions  const child = vnode.componentInstance = oldVnode.componentInstance  updateChildComponent(    child,    options.propsData, // updated props    options.listeners, // updated listeners    vnode, // new parent vnode    options.children // new children  )},
```

`updateChildComponent` 就是更新的关键方法，它里面主要是更新实例的一些属性：

```
// 源码位置：src/core/instance/lifecycle.jsexport function updateChildComponent (  vm: Component,  propsData: ?Object,  listeners: ?Object,  parentVnode: MountedComponentVNode,  renderChildren: ?Array<VNode>) {  // ...  // Any static slot children from the parent may have changed during parent's  // update. Dynamic scoped slots may also have changed. In such cases, a forced  // update is necessary to ensure correctness.  const needsForceUpdate = !!(    renderChildren ||               // has new static slots    vm.$options._renderChildren ||  // has old static slots    hasDynamicScopedSlot  )    // ...    // resolve slots + force update if has children  if (needsForceUpdate) {    vm.$slots = resolveSlots(renderChildren, parentVnode.context)    vm.$forceUpdate()  }}Vue.prototype.$forceUpdate = function () {  const vm: Component = this  if (vm._watcher) {    // 这里最终会执行 vm._update(vm._render)    vm._watcher.update()  }}
```

从注释中可以看到 `needsForceUpdate` 是有插槽才会为 `true`，`keep-alive` 符合条件。首先调用 `resolveSlots` 更新 `keep-alive` 的插槽，然后调用 `$forceUpdate` 让 `keep-alive` 重新渲染，再走一遍 `render`。因为 A 组件在初始化已经缓存了，`keep-alive` 直接返回缓存好的 A 组件 `VNode`。`VNode` 准备好后，又来到了 `patch` 阶段。

```
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {  let i = vnode.data  if (isDef(i)) {    const isReactivated = isDef(vnode.componentInstance) && i.keepAlive    if (isDef(i = i.hook) && isDef(i = i.init)) {      i(vnode, false /* hydrating */)    }    // after calling the init hook, if the vnode is a child component    // it should've created a child instance and mounted it. the child    // component also has set the placeholder vnode's elm.    // in that case we can just return the element and be done.    if (isDef(vnode.componentInstance)) {      initComponent(vnode, insertedVnodeQueue)      insert(parentElm, vnode.elm, refElm)      if (isTrue(isReactivated)) {        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm)      }      return true    }  }}
```

A 组件再次经历 `createComponent` 的过程，调用 `init`。

```
const componentVNodeHooks = {  init (vnode: VNodeWithData, hydrating: boolean): ?boolean {    if (      vnode.componentInstance &&      !vnode.componentInstance._isDestroyed &&      vnode.data.keepAlive    ) {      // kept-alive components, treat as a patch      const mountedNode: any = vnode // work around flow      componentVNodeHooks.prepatch(mountedNode, mountedNode)    } else {      const child = vnode.componentInstance = createComponentInstanceForVnode(        vnode,        activeInstance      )      child.$mount(hydrating ? vnode.elm : undefined, hydrating)    }  },}
```

这时将不再走 `$mount` 的逻辑，只调用 `prepatch` 更新实例属性。所以在缓存组件被激活时，不会执行 `created` 和 `mounted` 的生命周期函数。

回到 `createComponent`，此时的 `isReactivated` 为 `true`，调用 `reactivateComponent`:

```
function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {  let i  // hack for #4339: a reactivated component with inner transition  // does not trigger because the inner node's created hooks are not called  // again. It's not ideal to involve module-specific logic in here but  // there doesn't seem to be a better way to do it.  let innerNode = vnode  while (innerNode.componentInstance) {    innerNode = innerNode.componentInstance._vnode    if (isDef(i = innerNode.data) && isDef(i = i.transition)) {      for (i = 0; i < cbs.activate.length; ++i) {        cbs.activate[i](emptyNode, innerNode)      }      insertedVnodeQueue.push(innerNode)      break    }  }  // unlike a newly created component,  // a reactivated keep-alive component doesn't insert itself  insert(parentElm, vnode.elm, refElm)}
```

最后调用 `insert` 插入组件的 dom 节点，至此缓存渲染流程完成。

**小结**：组件首次渲染时，`keep-alive` 会将组件缓存起来。等到缓存渲染时，`keep-alive` 会更新插槽内容，之后 `$forceUpdate` 重新渲染。这样在 `render` 时就获取到最新的组件，如果命中缓存则从缓存中返回 `VNode`。

总结
--

`keep-alive` 组件是抽象组件，在对应父子关系时会跳过抽象组件，它只对包裹的子组件做处理，主要是根据 LRU 策略缓存组件 `VNode`，最后在 `render` 时返回子组件的 `VNode`。缓存渲染过程会更新 `keep-alive` 插槽，重新再 `render` 一次，从缓存中读取之前的组件 `VNode` 实现状态缓存。

最后  

=====

欢迎关注「前端瓶子君」，回复「交流」加入前端交流群！  

欢迎关注「前端瓶子君」，回复「算法」自动加入，从 0 到 1 构建完整的数据结构与算法体系！

在这里（算法群），你可以每天学习一道大厂算法编程题（阿里、腾讯、百度、字节等等）或 leetcode，瓶子君都会在第二天解答哟！

另外，每周还有手写源码题，瓶子君也会解答哟！

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持