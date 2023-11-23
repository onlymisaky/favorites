> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4IXmux6Qlfltop95KF6w1g)

本文是 **Vue 3.0 进阶系列** 的第五篇文章，在这篇文章中，阿宝哥将介绍 Vue 3 中的核心对象 —— `VNode`，该对象用于描述节点的信息，它的全称是虚拟节点（virtual node）。**与 “虚拟节点” 相关联的另一个概念是 “虚拟 DOM”，它是我们对由 Vue 组件树建立起来的整个 VNode 树的称呼**。通常一个 Vue 应用会以一棵嵌套的组件树的形式来组织：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V3icwafqV0wKBOpMjsjFwyLFh2UEJwCdx3XPMTzWwbVuKnB7ds0CicvKceeh29G1QzLVicM3NmMfxoPQ/640?wx_fmt=png)

（图片来源：https://v3.cn.vuejs.org/）

所以 “虚拟 DOM” 对 Vue 应用来说，是至关重要的。而 “虚拟 DOM” 又是由 `VNode` 组成的，它是 Vue 底层的核心基石。接下来，阿宝哥将带大家一起来探索 Vue 3 中与 `VNode` 相关的一些知识。

### 一、VNode 长什么样？

```
// packages/runtime-core/src/vnode.tsexport interface VNode<  HostNode = RendererNode,  HostElement = RendererElement,  ExtraProps = { [key: string]: any }> { // 省略内部的属性}
```

在 `runtime-core/src/vnode.ts` 文件中，我们找到了 `VNode` 的类型定义。通过 `VNode` 的类型定义可知，`VNode` 本质是一个对象，该对象中按照属性的作用，分为 5 大类。这里阿宝哥只详细介绍其中常见的两大类型属性 —— **内部属性** 和 **DOM 属性**：

#### 1.1 内部属性

```
__v_isVNode: true // 标识是否为VNode[ReactiveFlags.SKIP]: true // 标识VNode不是observabletype: VNodeTypes // VNode 类型props: (VNodeProps & ExtraProps) | null // 属性信息key: string | number | null // 特殊 attribute 主要用在 Vue 的虚拟 DOM 算法ref: VNodeNormalizedRef | null // 被用来给元素或子组件注册引用信息。scopeId: string | null // SFC onlychildren: VNodeNormalizedChildren // 保存子节点component: ComponentInternalInstance | null // 指向VNode对应的组件实例dirs: DirectiveBinding[] | null // 保存应用在VNode的指令信息transition: TransitionHooks<HostElement> | null // 存储过渡效果信息
```

#### 1.2 DOM 属性

```
el: HostNode | null // element anchor: HostNode | null // fragment anchortarget: HostElement | null // teleport targettargetAnchor: HostNode | null // teleport target anchorstaticCount: number // number of elements contained in a static vnode
```

#### 1.3 suspense 属性

```
suspense: SuspenseBoundary | nullssContent: VNode | nullssFallback: VNode | null
```

#### 1.4 optimization 属性

```
shapeFlag: numberpatchFlag: numberdynamicProps: string[] | nulldynamicChildren: VNode[] | null
```

#### 1.5 应用上下文属性

```
appContext: AppContext | null
```

### 二、如何创建 VNode？

要创建 `VNode` 对象的话，我们可以使用 Vue 提供的 `h` 函数。也许可以更准确地将其命名为 `createVNode()`，但由于频繁使用和简洁，它被称为 `h()` 。该函数接受三个参数：

```
// packages/runtime-core/src/h.tsexport function h(type: any, propsOrChildren?: any, children?: any): VNode {  const l = arguments.length  if (l === 2) {     if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {       // single vnode without props      if (isVNode(propsOrChildren)) {        return createVNode(type, null, [propsOrChildren])      }      // 只包含属性不含有子元素      return createVNode(type, propsOrChildren) // h('div', { id: 'foo' })    } else {      // 忽略属性      return createVNode(type, null, propsOrChildren) // h('div', ['foo'])    }  } else {    if (l > 3) {      children = Array.prototype.slice.call(arguments, 2)    } else if (l === 3 && isVNode(children)) {      children = [children]    }    return createVNode(type, propsOrChildren, children)  }}
```

观察以上代码可知， `h` 函数内部的主要处理逻辑就是根据参数个数和参数类型，执行相应处理操作，但最终都是通过调用 `createVNode` 函数来创建 `VNode` 对象。在开始介绍 `createVNode` 函数前，阿宝哥先举一些实际开发中的示例：

```
const app = createApp({ // 示例一  render: () => h('div', '我是阿宝哥')})const Comp = () => h("p", "我是阿宝哥"); // 示例二app.component('component-a', { // 示例三  template: "<p>我是阿宝哥</p>"})
```

示例一和示例二很明显都使用了 `h` 函数，**而示例三并未看到 `h` 或 `createVNode` 函数的身影**。为了一探究竟，我们需要借助 Vue 3 Template Explorer 这个在线工具来编译一下 **`"<p>我是阿宝哥</p>"`** 模板，该模板编译后的结果如下（函数模式）：

```
// https://vue-next-template-explorer.netlify.app/const _Vue = Vuereturn function render(_ctx, _cache, $props, $setup, $data, $options) {  with (_ctx) {    const { createVNode: _createVNode, openBlock: _openBlock,      createBlock: _createBlock } = _Vue    return (_openBlock(), _createBlock("p", null, "我是阿宝哥"))  }}
```

由以上编译结果可知， **`"<p>我是阿宝哥</p>"`** 模板被编译生成了一个 `render` 函数，调用该函数后会返回 `createBlock` 函数的调用结果。其中 `createBlock` 函数的实现如下所示：

```
// packages/runtime-core/src/vnode.tsexport function createBlock(  type: VNodeTypes | ClassComponent,  props?: Record<string, any> | null,  children?: any,  patchFlag?: number,  dynamicProps?: string[]): VNode {  const vnode = createVNode(    type,    props,    children,    patchFlag,    dynamicProps,    true /* isBlock: prevent a block from tracking itself */  )  // 省略部分代码  return vnode}
```

在 `createBlock` 函数内部，我们终于看到了 `createVNode` 函数的身影。顾名思义，该函数的作用就是用于创建 `VNode`，接下来我们来分析一下它。

### 三、createVNode 函数内部做了啥？

下面我们将从参数说明和逻辑说明两方面来介绍 `createVNode` 函数：

#### 3.1 参数说明

`createVNode` 被定义在 `runtime-core/src/vnode.ts` 文件中：

```
// packages/runtime-core/src/vnode.tsexport const createVNode = (__DEV__  ? createVNodeWithArgsTransform  : _createVNode) as typeof _createVNodefunction _createVNode(  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,  props: (Data & VNodeProps) | null = null,  children: unknown = null,  patchFlag: number = 0,  dynamicProps: string[] | null = null,  isBlockNode = false): VNode {  //   return vnode}
```

在分析该函数的具体代码前，我们先来看一下它的参数。该函数可以接收 6 个参数，这里阿宝哥用思维导图来重点介绍前面 2 个参数：

##### type 参数

```
// packages/runtime-core/src/vnode.tsfunction _createVNode(  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,  // 省略其他参数): VNode { ... }
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V3icwafqV0wKBOpMjsjFwyLFb7D5TlgZh7B2GloqYA6PEmz34iat4nB19PE2pa95CibIhWcOSTViaIyRw/640?wx_fmt=jpeg)

由上图可知，`type` 参数支持很多类型，比如常用的 `string`、`VNode` 和 `Component` 等。此外，也有一些陌生的面孔，比如 `Text`、`Comment` 、`Static` 和 `Fragment` 等类型，它们的定义如下：

```
// packages/runtime-core/src/vnode.tsexport const Text = Symbol(__DEV__ ? 'Text' : undefined)export const Comment = Symbol(__DEV__ ? 'Comment' : undefined)export const Static = Symbol(__DEV__ ? 'Static' : undefined)export const Fragment = (Symbol(__DEV__ ? 'Fragment' : undefined) as any) as {  __isFragment: true  new (): {    $props: VNodeProps  }}
```

那么定义那么多的类型有什么意义呢？这是因为在 `patch` 阶段，会根据不同的 `VNode` 类型来执行不同的操作：

```
// packages/runtime-core/src/renderer.tsfunction baseCreateRenderer(  options: RendererOptions,  createHydrationFns?: typeof createHydrationFunctions): any {  const patch: PatchFn = (    n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null,    isSVG = false, optimized = false  ) => {    // 省略部分代码    const { type, ref, shapeFlag } = n2    switch (type) {      case Text: // 处理文本节点        processText(n1, n2, container, anchor)        break      case Comment: // 处理注释节点        processCommentNode(n1, n2, container, anchor)        break      case Static: // 处理静态节点        if (n1 == null) {          mountStaticNode(n2, container, anchor, isSVG)        } else if (__DEV__) {          patchStaticNode(n1, n2, container, isSVG)        }        break      case Fragment: // 处理Fragment节点        processFragment(...)        break      default:        if (shapeFlag & ShapeFlags.ELEMENT) { // 元素类型          processElement(...)        } else if (shapeFlag & ShapeFlags.COMPONENT) { // 组件类型          processComponent(...)        } else if (shapeFlag & ShapeFlags.TELEPORT) { // teleport内置组件          ;(type as typeof TeleportImpl).process(...)        } else if (__FEATURE_SUSPENSE__ && shapeFlag & ShapeFlags.SUSPENSE) {          ;(type as typeof SuspenseImpl).process(...)        }    }  }}
```

介绍完 `type` 参数后，接下来我们来看 `props` 参数，具体如下图所示：

##### props 参数

```
function _createVNode(  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,  props: (Data & VNodeProps) | null = null,): VNode { ... }
```

`props` 参数的类型是联合类型，这里我们来分析 `Data & VNodeProps` 交叉类型：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V3icwafqV0wKBOpMjsjFwyLFyR2aOyiapLwlIsPtbxVTu9xBW2asLuuZSQLq2KyDezZ5ud09PIDibPbQ/640?wx_fmt=jpeg)

其中 `Data` 类型是通过 TypeScript 内置的工具类型 `Record` 来定义的：

```
export type Data = Record<string, unknown>type Record<K extends keyof any, T> = {  [P in K]: T;};
```

而 `VNodeProps` 类型是通过类型别名来定义的，除了含有 `key` 和 `ref` 属性之外，其他的属性主要是定义了与生命周期有关的钩子：

```
// packages/runtime-core/src/vnode.tsexport type VNodeProps = {  key?: string | number  ref?: VNodeRef  // vnode hooks  onVnodeBeforeMount?: VNodeMountHook | VNodeMountHook[]  onVnodeMounted?: VNodeMountHook | VNodeMountHook[]  onVnodeBeforeUpdate?: VNodeUpdateHook | VNodeUpdateHook[]  onVnodeUpdated?: VNodeUpdateHook | VNodeUpdateHook[]  onVnodeBeforeUnmount?: VNodeMountHook | VNodeMountHook[]  onVnodeUnmounted?: VNodeMountHook | VNodeMountHook[]}
```

#### 3.2 逻辑说明

`createVNode` 函数内部涉及较多的处理逻辑，这里我们只分析主要的逻辑：

```
// packages/runtime-core/src/vnode.tsfunction _createVNode(  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,  props: (Data & VNodeProps) | null = null,  children: unknown = null,  patchFlag: number = 0,  dynamicProps: string[] | null = null,  isBlockNode = false): VNode {  // 处理VNode类型，比如处理动态组件的场景：<component :is="vnode"/>  if (isVNode(type)) {    const cloned = cloneVNode(type, props, true /* mergeRef: true */)    if (children) {      normalizeChildren(cloned, children)    }    return cloned  }  // 类组件规范化处理  if (isClassComponent(type)) {    type = type.__vccOpts  }  // 类和样式规范化处理  if (props) {    // 省略相关代码  }  // 把vnode的类型信息转换为位图  const shapeFlag = isString(type)    ? ShapeFlags.ELEMENT // ELEMENT = 1    : __FEATURE_SUSPENSE__ && isSuspense(type)      ? ShapeFlags.SUSPENSE // SUSPENSE = 1 << 7,      : isTeleport(type)        ? ShapeFlags.TELEPORT // TELEPORT = 1 << 6,        : isObject(type)          ? ShapeFlags.STATEFUL_COMPONENT // STATEFUL_COMPONENT = 1 << 2,          : isFunction(type)            ? ShapeFlags.FUNCTIONAL_COMPONENT // FUNCTIONAL_COMPONENT = 1 << 1,            : 0  // 创建VNode对象  const vnode: VNode = {    __v_isVNode: true,    [ReactiveFlags.SKIP]: true,    type,    props,    // ...  }  // 子元素规范化处理  normalizeChildren(vnode, children)  return vnode}
```

介绍完 `createVNode` 函数之后，阿宝哥再来介绍另一个比较重要的函数 —— `normalizeVNode`。

### 四、如何创建规范的 VNode 对象？

`normalizeVNode` 函数的作用，用于将传入的 `child` 参数转换为规范的 `VNode` 对象。

```
// packages/runtime-core/src/vnode.tsexport function normalizeVNode(child: VNodeChild): VNode {  if (child == null || typeof child === 'boolean') { // null/undefined/boolean -> Comment    return createVNode(Comment)  } else if (isArray(child)) { // array -> Fragment    return createVNode(Fragment, null, child)  } else if (typeof child === 'object') { // VNode -> VNode or mounted VNode -> cloned VNode    return child.el === null ? child : cloneVNode(child)  } else { // primitive types：'foo' or 1    return createVNode(Text, null, String(child))  }}
```

由以上代码可知，`normalizeVNode` 函数内部会根据 `child` 参数的类型进行不同的处理：

#### 4.1 null / undefined -> Comment

```
expect(normalizeVNode(null)).toMatchObject({ type: Comment })expect(normalizeVNode(undefined)).toMatchObject({ type: Comment })
```

#### 4.2 boolean -> Comment

```
expect(normalizeVNode(true)).toMatchObject({ type: Comment })expect(normalizeVNode(false)).toMatchObject({ type: Comment })
```

#### 4.3 array -> Fragment

```
expect(normalizeVNode(['foo'])).toMatchObject({ type: Fragment })
```

#### 4.4 VNode -> VNode

```
const vnode = createVNode('div')expect(normalizeVNode(vnode)).toBe(vnode)
```

#### 4.5 mounted VNode -> cloned VNode

```
const mounted = createVNode('div')mounted.el = {}const normalized = normalizeVNode(mounted)expect(normalized).not.toBe(mounted)expect(normalized).toEqual(mounted)
```

#### 4.6 primitive types

```
expect(normalizeVNode('foo')).toMatchObject({ type: Text, children: `foo` })expect(normalizeVNode(1)).toMatchObject({ type: Text, children: `1` })
```

### 五、阿宝哥有话说

#### 5.1 如何判断是否为 VNode 对象？

```
// packages/runtime-core/src/vnode.tsexport function isVNode(value: any): value is VNode {  return value ? value.__v_isVNode === true : false}
```

在 `VNode` 对象中含有一个 `__v_isVNode` 内部属性，利用该属性可以用来判断当前对象是否为 `VNode` 对象。

#### 5.2 如何判断两个 VNode 对象的类型是否相同？

```
// packages/runtime-core/src/vnode.tsexport function isSameVNodeType(n1: VNode, n2: VNode): boolean {  // 省略__DEV__环境的处理逻辑  return n1.type === n2.type && n1.key === n2.key}
```

在 Vue 3 中，是通过比较 `VNode` 对象的 `type` 和 `key` 属性，来判断两个 VNode 对象的类型是否相同。

#### 5.3 如何快速创建某些类型的 VNode 对象？

在 Vue 3 内部提供了 `createTextVNode` 、`createCommentVNode` 和 `createStaticVNode` 函数来快速的创建文本节点、注释节点和静态节点：

##### createTextVNode

```
export function createTextVNode(text: string = ' ', flag: number = 0): VNode {  return createVNode(Text, null, text, flag)}
```

##### createCommentVNode

```
export function createCommentVNode(  text: string = '',  asBlock: boolean = false): VNode {  return asBlock    ? (openBlock(), createBlock(Comment, null, text))    : createVNode(Comment, null, text)}
```

##### createStaticVNode

```
export function createStaticVNode(  content: string,  numberOfNodes: number): VNode {  const vnode = createVNode(Static, null, content)  vnode.staticCount = numberOfNodes  return vnode}
```

本文阿宝哥主要介绍了 `VNode` 对象是什么、如何创建 `VNode` 对象及如何创建规范的 `VNode` 对象。为了让大家能够更深入地理解 `h` 和 `createVNode` 函数的相关知识，阿宝哥还从源码的角度分析了 `createVNode` 函数 。

在后续的文章中，阿宝哥将会介绍 `VNode` 在 Vue 3 内部是如何被使用的，感兴趣的小伙伴不要错过哟。

### 六、参考资源

*   Vue 3 官网 - 渲染函数
    

**聚焦全栈，专注分享 TypeScript、Web API、前端架构等技术干货。**

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V2mwZjG8T1LDomW0BIojAlLLzicDRktticyGHQwG0SoxC2vTtleOCIPBFrUia681Mnr8EmHpRxZH0aPg/640?wx_fmt=png)