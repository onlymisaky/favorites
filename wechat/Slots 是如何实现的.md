> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1UmnH7VKlYJ9iTTXlzuAnA)

今天主要分析 Vue.js 中常用的 Slots 功能是如何设计和实现的。本文将分为**普通插槽**、**作用域插槽**以及 Vue.js 2.6.x 版本的 **v-slot 语法**三部分进行讨论。

本文属于进阶内容，如果有还不懂 Slots 用法的同学，建议先移步 Vue.js 官网进行学习。

1 普通插槽
------

首先举一个 Slots 使用的简单例子。

```
<template>  <div class="slot-demo">    <slot>this is slot default content text.</slot>  </div></template>
```

直接在页面上渲染这个组件，效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCud2WSDtSwKviclWRHhBib3tCOzzo0wXKJU01YgAMz6mN9ovFjVias2iaCwSv4Uq9LWcibUH5FbO0us1ibA/640?wx_fmt=png)

接着，我们对 Slots 里的内容进行覆盖。

`<slot-demo>this is slot custom content.</slot-demo>`

重新渲染后，效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCud2WSDtSwKviclWRHhBib3tCFRAjM9hnOBpEVlN93cQlupEqClibYLZdAQL3InKsdlvI04HtCVlVoPQ/640?wx_fmt=png)

Slots 的用法大家肯定都很清楚了，那么这背后 Vue.js 执行了怎样的逻辑呢？接下来我们一起看看 Vue.js 底层对 Slots 的具体实现。

### **1.1** `**vm.$slots**`

首先看看 Vue.js 的 Component 接口上对 `$slots` 属性的定义。

`$slots: { [key: string]: Array<VNode> };`

多的咱不说，咱直接在控制台打印一下上面例子中的 `$slots` ：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCud2WSDtSwKviclWRHhBib3tCtQ56vylQhBUHaNiaGU45iaLhSNXOOpY1iaAmaTVvd0HEicBRoqBrNzxoQg/640?wx_fmt=png)

接下来讲解 Slots 内容渲染以及转换成上图对象的过程。

### **1.2** `**renderSlot**`

看完了具体实例中 Slots 渲染后的 `vm.$slots` 对象，我们来解析一下 `renderSlot` 这块的逻辑，首先我们先看看 `renderSlot` 函数的参数都有哪些：

```
export function renderSlot (  name: string, // 插槽名 slotName  fallback: ?Array<VNode>, // 插槽默认内容生成的 vnode 数组  props: ?Object, // props 对象  bindObject: ?Object // v-bind 绑定对象): ?Array<VNode> {}
```

这里我们先不看 scoped-slot 的逻辑，只看普通 slot 的逻辑：

```
const slotNodes = this.$slots[name]nodes = slotNodes || fallbackreturn nodes
```

这里拿到`this.$slots[name]`的值后做了一个空值判断，若存在则直接返回其对应的 vnode 数组，否则返回 fallback 。

### **1.3** `**resolveSlots**`

看到这，很多人可能不知道 `this.$slots` 在哪定义的，解释这个之前，我们要先了解另外一个方法 `resolveSlots` 。

```
export function resolveSlots (  children: ?Array<VNode>, // 父节点的 children  context: ?Component // 父节点的上下文，即父组件的 vm 实例): { [key: string]: Array<VNode> } {}
```

看完 `resolveSlots` 的定义后我们接着往后看其中的具体逻辑。

这里先定义了一个 `slots` 的空对象，如果 参数`children` 不存在，直接返回。

```
const slots = {}if (!children) {  return slots}
```

如果存在，则对 `children` 进行遍历操作。

```
for (let i = 0, l = children.length; i < l; i++) {  const child = children[i]  const data = child.data    // 如果 data.slot 存在，将插槽名称当做 key，child 当做值直接添加到 slots 中去  if ((child.context === context || child.fnContext === context) &&    data && data.slot != null  ) {    const name = data.slot    const slot = (slots[name] || (slots[name] = []))    // child 的 tag 为 template 标签的情况    if (child.tag === 'template') {      slot.push.apply(slot, child.children || [])    } else {      slot.push(child)    }      // 如果 data.slot 不存在，则直接将 child 丢到 slots.default 中去  } else {    (slots.default || (slots.default = [])).push(child)  }}
```

`slots` 获取到值后，会过滤掉只包含空白字符的属性，然后返回。

```
// ignore slots that contains only whitespacefor (const name in slots) {  if (slots[name].every(isWhitespace)) {    delete slots[name]  }}return slots
```

```
// isWhitespace 相关逻辑function isWhitespace (node: VNode): boolean {  return (node.isComment && !node.asyncFactory) || node.text === ' '}
```

### **1.4** `**initRender**`

上文解释了 `slots` 变量的初始化和赋值过程。接下来介绍的 `initRender` 方法对 `vm.$slots` 进行了初始化的过程。

```
//  src/core/instance/render.js const options = vm.$optionsconst parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent treeconst renderContext = parentVnode && parentVnode.contextvm.$slots = resolveSlots(options._renderChildren, renderContext)genSlot()
```

看完上面的代码，肯定有人会问：你这不就只是拿到了一个对象么，怎么把其中的内容给解析出来呢？

### **1.5** `**genSlot**`

别急，我们接着就来把 Slots 解析的相关逻辑过一过，话不多说，咱直接上代码：

```
function genSlot (el: ASTElement, state: CodegenState): string {  const slotName = el.slotName || '"default"' // 取 slotName，若无，则直接命名为 'default'  const children = genChildren(el, state) // 对 children 进行 generate 操作  let res = `_t(${slotName}${children ? `,${children}` : ''}`  const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}` // 将 attrs 转换成对象形式  const bind = el.attrsMap['v-bind'] // 获取 slot 上的 v-bind 属性    // 若 attrs 或者 bind 属性存在但是 children 却木得，直接赋值第二参数为 null  if ((attrs || bind) && !children) {    res += `,null`  }    // 若 attrs 存在，则将 attrs 作为 `_t()` 的第三个参数(普通插槽的逻辑处理)  if (attrs) {    res += `,${attrs}`  }    // 若 bind 存在，这时如果 attrs 存在，则 bind 作为第三个参数，否则 bind 作为第四个参数(scoped-slot 的逻辑处理)  if (bind) {    res += `${attrs ? '' : ',null'},${bind}`  }  return res + ')'}
```

上面的 `slotName` 在 `processSlot` 函数中进行了赋值，并且 父组件编译阶段用到的 `slotTarget` 也在这里进行了处理。

```
// src/compiler/parser/index.jsfunction processSlot (el) {  if (el.tag === 'slot') {    // 直接获取 attr 里面 name 的值    el.slotName = getBindingAttr(el, 'name')    // ...  }  // ...  const slotTarget = getBindingAttr(el, 'slot')  if (slotTarget) {    // 如果 slotTarget 存在则直接取命名插槽的 slot 值，否则直接为 'default'    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget    if (el.tag !== 'template' && !el.slotScope) {      addAttr(el, 'slot', slotTarget)    }  }}
```

随即在 `genData` 函数中使用 `slotTarget` 进行 `data` 的数据拼接。

```
if (el.slotTarget && !el.slotScope) {  data += `slot:${el.slotTarget},`}
```

此时父组件将生成以下代码：

```
with(this) {  return _c('div', [    _c('slot-demo'),    {      attrs: { slot: 'default' },      slot: 'default'    },    [ _v('this is slot custom content.') ]  ])}
```

然后当 `el.tag` 为 `slot` 的情况，直接执行 `genSlot` 函数：

```
else if (el.tag === 'slot') {  return genSlot(el, state)}
```

按照我们举出的例子，子组件最终会生成以下代码：

```
with(this) {  // _c => createElement ; _t => renderSlot ; _v => createTextVNode  return _c(    'div',    {      staticClass: 'slot-demo'    },    [ _t('default', [ _v('this is slot default content text.') ]) ]  )}
```

2 作用域插槽
-------

上面我们已经了解到 Vue.js 对于普通的 Slots 是如何进行处理和转换的。接下来我们来分析下作用域插槽的实现逻辑。

### **2.1** `**vm.$scopedSlots**`

老规矩，先看看 Vue.js 的 Component 接口上对 `$scopedSlots` 属性的定义。

```
$scopedSlots: { [key: string]: () => VNodeChildren };
```

其中的 `VNodeChildren` 定义如下：

```
declare type VNodeChildren = Array<?VNode | string | VNodeChildren> | string;
```

先来个相关的例子：

```
<template>  <div class="slot-demo">    <slot text="this is a slot demo , " :msg="msg"></slot>  </div></template><script>export default {  name: 'SlotDemo',  data () {    return {      msg: 'this is scoped slot content.'    }  }}</script>
```

然后进行使用：

```
<template>  <div class="parent-slot">    <slot-demo>      <template slot-scope="scope">        <p>{{ scope.text }}</p>        <p>{{ scope.msg }}</p>      </template>    </slot-demo>  </div></template>
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCud2WSDtSwKviclWRHhBib3tCKvJIxhtWCaTaoPSdvZ3VlNy9yNNnVc8bQ3ib6A9Ric1V5k1licnAP3P7Q/640?wx_fmt=png)

从例子中我们能看出用法，子组件的 `slot` 标签上绑定 `text` 以及 `:msg` 属性。然后父组件在使用插槽用 `slot-scope` 属性去读取插槽属性对应的值。

### **2.2** `**processSlot**`

提及一下 `processSlot` 函数对于 `slot-scope` 的处理逻辑：

```
let slotScopeif (el.tag === 'template') {    slotScope = getAndRemoveAttr(el, 'scope')  // 兼容 2.5 以前版本 slot scope 的用法(这块有个警告，我直接忽略掉了)    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')} else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {    el.slotScope = slotScope }
```

从上面的代码我们能看出，Vue.js 直接读取 `slot-scope` 属性并赋值给 AST 抽象语法树的 `slotScope` 属性，而拥有 `slotScope` 属性的节点，会直接以**插槽名称 name 为 key**、**本身为 value** 的对象形式挂载在父节点的 `scopedSlots` 属性上。

```
else if (element.slotScope) {     currentParent.plain = false    const name = element.slotTarget || '"default"'    (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element}
```

然后在 `renderMixin` 函数中对 `vm.$scopedSlots` 进行了如下赋值：

```
// src/core/instance/render.jsif (_parentVnode) {  vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject}
```

然后 `genData` 函数里会进行以下逻辑处理：

```
if (el.scopedSlots) {  data += `${genScopedSlots(el, el.scopedSlots, state)},`}
```

### **2.3** `**genScopedSlots & genScopedSlot**`

紧接着我们来看看 `genScopedSlots` 函数中的逻辑：

```
function genScopedSlots (  slots: { [key: string]: ASTElement },  state: CodegenState): string {  // 对 el.scopedSlots 对象进行遍历，执行 genScopedSlot，且将结果用逗号进行拼接  // _u => resolveScopedSlots (具体逻辑下面一个小节进行分析)  return `scopedSlots:_u([${    Object.keys(slots).map(key => {      return genScopedSlot(key, slots[key], state)    }).join(',')  }])`}
```

然后我们再来看看 `genScopedSlot` 函数是如何生成 render function 字符串的：

```
function genScopedSlot (  key: string,  el: ASTElement,  state: CodegenState): string {  if (el.for && !el.forProcessed) {    return genForScopedSlot(key, el, state)  }  // 函数参数为标签上 slot-scope 属性对应的值 (getAndRemoveAttr(el, 'slot-scope'))  const fn = `function(${String(el.slotScope)}){` +    `return ${el.tag === 'template'      ? el.if        ? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`        : genChildren(el, state) || 'undefined'      : genElement(el, state)    }}`  // key 为插槽名称，fn 为生成的函数代码  return `{key:${key},fn:${fn}}`}
```

我们把上面例子的 `$scopedSlots` 在控制台打印一下，结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCud2WSDtSwKviclWRHhBib3tCoQvkWkfKlUA1HMc6ULmT3qfIxVHRwRYibvT2dX6IVF5lR5RyZu8pNFQ/640?wx_fmt=png)

上面例子中父组件最终会生成如下代码：

```
with(this){  // _c => createElement ; _u => resolveScopedSlots  // _v => createTextVNode ; _s => toString  return _c('div',    { staticClass: 'parent-slot' },    [_c('slot-demo',      { scopedSlots: _u([        {          key: 'default',          fn: function(scope) {            return [              _c('p', [ _v(_s(scope.text)) ]),              _c('p', [ _v(_s(scope.msg)) ])            ]          }        }])      }    )]  )}
```

### **2.4** `**renderSlot(slot-scope) & renderSlot**`

上面我们提及对于插槽渲染逻辑的时候忽略了 `slot-scope` 的相关逻辑，这里我们来看看这部分内容：

```
export function renderSlot (  name: string,  fallback: ?Array<VNode>,  props: ?Object,  bindObject: ?Object): ?Array<VNode> {  const scopedSlotFn = this.$scopedSlots[name]  let nodes  if (scopedSlotFn) { // scoped slot    props = props || {}    // ...    nodes = scopedSlotFn(props) || fallback  } // ... return nodes}resolveScopedSlots()
```

这里 `renderHelps` 函数里面的 `_u` ，即 `resolveScopedSlots`，其逻辑如下：

```
export function resolveScopedSlots (  fns: ScopedSlotsData, // Array<{ key: string, fn: Function } | ScopedSlotsData>  res?: Object): { [key: string]: Function } {  res = res || {}  // 遍历 fns 数组，生成一个 `key 为插槽名称，value 为函数` 的对象  for (let i = 0; i < fns.length; i++) {    if (Array.isArray(fns[i])) {      resolveScopedSlots(fns[i], res)    } else {      res[fns[i].key] = fns[i].fn    }  }  return res}
```

`genSlot` 函数上面我已经讲解过，要看请往上翻阅。结合我们的例子，子组件则会生成以下代码：

```
with(this) {  return _c(    'div',    {      staticClass: 'slot-demo'    },    [      _t('default', null, { text: 'this is a slot demo , ', msg: msg })    ]  )}
```

到目前为止，对于普通插槽和作用域插槽已经谈的差不多了。接下来，我们将一起看看 Vue.js 2.6.x 版本的 `v-slot` 语法。

3 v-slot
--------

### 3.1 基本用法

Vue.js 2.6.x 已经出来有一段时间了，其中对于插槽这块则是放弃了作用域插槽推荐写法，直接改成了 `v-slot` 指令形式的推荐写法，当然这只是个语法糖而已。

在看具体实现逻辑前，我们先通过一个例子来先了解下其基本用法：

```
<template>  <div class="slot-demo">    <slot ></slot>  </div></template><script>export default {  name: 'SlotDemo',  data () {    return {      msg: 'this is scoped slot content.'    }  }}</script>
```

然后：

```
<template>  <slot-demo>    <template v-slot:demo>this is custom slot.</template>    <template v-slot="scope">      <p>{{ scope.text }}{{ scope.msg }}</p>    </template>  </slot-demo></template>
```

### 3.2 相同与区别

#### **3.2.1** `**$slots & $scopedSlots**`

`$slots` 这块逻辑没变，还是沿用的以前的代码：

```
// $slotsconst options = vm.$optionsconst parentVnode = vm.$vnode = options._parentVnodeconst renderContext = parentVnode && parentVnode.contextvm.$slots = resolveSlots(options._renderChildren, renderContext)$scopedSlots 这块则进行了改造，执行了 normalizeScopedSlots() 并接收其返回值为 $scopedSlots 的值if (_parentVnode) {  vm.$scopedSlots = normalizeScopedSlots(    _parentVnode.data.scopedSlots,    vm.$slots,    vm.$scopedSlots  )}
```

接着，我们来会一会 `normalizeScopedSlots` ，首先我们先看看它的定义：

```
export function normalizeScopedSlots (  slots: { [key: string]: Function } | void,  // 某节点 data 属性上 scopedSlots  normalSlots: { [key: string]: Array<VNode> }, // 当前节点下的普通插槽  prevSlots?: { [key: string]: Function } | void // 当前节点下的特殊插槽): any {}
```

首先，如果 `slots` 不存在，则直接返回一个空对象 `{}` ：

```
if (!slots) {  res = {}}
```

若 `prevSlots` 存在，且满足系列条件的情况，则直接返回 `prevSlots` ：

```
const hasNormalSlots = Object.keys(normalSlots).length > 0 // 是否拥有普通插槽const isStable = slots ? !!slots.$stable : !hasNormalSlots // slots 上的 $stable 值const key = slots && slots.$key // slots 上的 $key 值else if (  isStable &&  prevSlots &&  prevSlots !== emptyObject &&  key === prevSlots.$key && // slots $key 值与 prevSlots $key 相等  !hasNormalSlots && // slots 中没有普通插槽  !prevSlots.$hasNormal // prevSlots 中没有普通插槽) {  return prevSlots}
```

注：这里的 `key` , `hasNormal` , `$stable` 是直接使用 Vue.js 内部对 `Object.defineProperty` 封装好的 `def` 方法进行赋值的。

```
def(res, '$stable', isStable)def(res, '$key', key)def(res, '$hasNormal', hasNormalSlots)// 否则，则对 slots 对象进行遍历，操作 normalSlots ，赋值给 key 为 key，value 为 normalizeScopedSlot 返回的函数 的对象 reslet reselse {  res = {}  for (const key in slots) {    if (slots[key] && key[0] !== '$') {      res[key] = normalizeScopedSlot(normalSlots, key, slots[key])    }  }}
```

随后再次对 `normalSlots` 进行遍历，若 `normalSlots` 中的 `key` 在 `res` 找不到对应的 `key`，则直接进行 `proxyNormalSlot` 代理操作，将 `normalSlots` 中的 `slot` 挂载到 `res` 对象上。

```
for (const key in normalSlots) {  if (!(key in res)) {    res[key] = proxyNormalSlot(normalSlots, key)  }}function proxyNormalSlot(slots, key) {  return () => slots[key]}
```

接着，我们看看 `normalizeScopedSlot` 函数都做了些什么事情。该方法接收三个参数，第一个参数为 `normalSlots` ，第二个参数为 `key` ，第三个参数为 `fn`。

```
function normalizeScopedSlot(normalSlots, key, fn) {  const normalized = function () {    // 若参数为多个，则直接使用 arguments 作为 fn 的参数，否则直接传空对象作为 fn 的参数    let res = arguments.length ? fn.apply(null, arguments) : fn({})    // fn 执行返回的 res 不是数组，则是单 vnode 的情况，赋值为 [res] 即可    // 否则执行 normalizeChildren 操作，这块主要对针对 slot 中存在 v-for 操作    res = res && typeof res === 'object' && !Array.isArray(res)      ? [res] // single vnode      : normalizeChildren(res)    return res && (      res.length === 0 ||      (res.length === 1 && res[0].isComment) // slot 上 v-if 相关处理    ) ? undefined      : res  }  // v-slot 语法糖处理  if (fn.proxy) {    Object.defineProperty(normalSlots, key, {      get: normalized,      enumerable: true,      configurable: true    })  }  return normalized}
```

#### **3.2.2 renderSlot**

这块逻辑处理其实和之前是一样的，只是删除了一些警告的代码而已。这点这里就不展开叙述了。

#### 3.2.3 processSlot

首先，这里解析 `slot` 的方法名从 `processSlot` 变成了 `processSlotContent` ，但其实前面的逻辑和以前是一样的。只是新增了一些对于 v-slot 的逻辑处理，下面我们就来捋捋这块。过具体逻辑前，我们先看一些相关的正则和方法。

1.  **相关正则 & functions**
    

```
// dynamicArgRE 动态参数匹配const dynamicArgRE = /^\[.*\]$/ // 匹配到 '[]' 则为 true，如 '[ item ]'// slotRE 匹配 v-slot 语法相关正则const slotRE = /^v-slot(:|$)|^#/ // 匹配到 'v-slot' 或 'v-slot:' 则为 true// getAndRemoveAttrByRegex 通过正则匹配绑定的 attr 值export function getAndRemoveAttrByRegex (  el: ASTElement,  name: RegExp // ) {  const list = el.attrsList // attrsList 类型为 Array<ASTAttr>  // 对 attrsList 进行遍历，若有满足 RegExp 的则直接返回当前对应的 attr  // 若参数 name 传进来的是 slotRE = /^v-slot(:|$)|^#/  // 那么匹配到 'v-slot' 或者 'v-slot:xxx' 则会返回其对应的 attr  for (let i = 0, l = list.length; i < l; i++) {    const attr = list[i]    if (name.test(attr.name)) {      list.splice(i, 1)      return attr    }  }}ASTAttr 接口定义declare type ASTAttr = {  name: string;  value: any;  dynamic?: boolean;  start?: number;  end?: number};// createASTElement 创建 ASTElementexport function createASTElement (  tag: string, // 标签名  attrs: Array<ASTAttr>, // attrs 数组  parent: ASTElement | void // 父节点): ASTElement {  return {    type: 1,    tag,    attrsList: attrs,    attrsMap: makeAttrsMap(attrs),    rawAttrsMap: {},    parent,    children: []  }}// getSlotName 获取 slotNamefunction getSlotName (binding) {  // 'v-slot:item' 匹配获取到 'item'  let name = binding.name.replace(slotRE, '')  if (!name) {    if (binding.name[0] !== '#') {      name = 'default'    } else if (process.env.NODE_ENV !== 'production') {      warn(        `v-slot shorthand syntax requires a slot name.`,        binding      )    }  }  // 返回一个 key 包含 name，dynamic 的对象  // 'v-slot:[item]' 匹配然后 replace 后获取到 name = '[item]'  // 进而进行动态参数进行匹配 dynamicArgRE.test(name) 结果为 true  return dynamicArgRE.test(name)    ? { name: name.slice(1, -1), dynamic: true } // 截取变量，如 '[item]' 截取后变成 'item'    : { name: `"${name}"`, dynamic: false }}
```

2.  `**processSlotContent**`
    

这里我们先看看 Slots 对于 template 是如何处理的：

```
if (el.tag === 'template') {  // 匹配绑定在 template 上的 v-slot 指令，这里会匹配到对应 v-slot 的 attr(类型为 ASTAttr)  const slotBinding = getAndRemoveAttrByRegex(el, slotRE)  // 若 slotBinding 存在，则继续进行 slotName 的正则匹配  // 随即将匹配出来的 name 赋值给 slotTarget，dynamic 赋值给 slotTargetDynamic  // slotScope 赋值为 slotBinding.value 或者 '_empty_'  if (slotBinding) {    const { name, dynamic } = getSlotName(slotBinding)    el.slotTarget = name    el.slotTargetDynamic = dynamic    el.slotScope = slotBinding.value || emptySlotScopeToken  }}
```

如果不是 template，而是绑定在 component 上的话，对于 `**v-slot**` 指令和 `**slotName**`的匹配操作是一样的，不同点在于这里需要将组件的 children 添加到其默认插槽中去。

```
else {  // v-slot on component 表示默认插槽  const slotBinding = getAndRemoveAttrByRegex(el, slotRE)  // 将组件的 children 添加到其默认插槽中去  if (slotBinding) {    // 获取当前组件的 scopedSlots    const slots = el.scopedSlots || (el.scopedSlots = {})    // 匹配拿到 slotBinding 中 name，dynamic 的值    const { name, dynamic } = getSlotName(slotBinding)    // 获取 slots 中 key 对应匹配出来 name 的 slot    // 然后再其下面创建一个标签名为 template 的 ASTElement，attrs 为空数组，parent 为当前节点    const slotContainer = slots[name] = createASTElement('template', [], el)    // 这里 name、dynamic 统一赋值给 slotContainer 的 slotTarget、slotTargetDynamic，而不是 el    slotContainer.slotTarget = name    slotContainer.slotTargetDynamic = dynamic    // 将当前节点的 children 添加到 slotContainer 的 children 属性中    slotContainer.children = el.children.filter((c: any) => {      if (!c.slotScope) {        c.parent = slotContainer        return true      }    })    slotContainer.slotScope = slotBinding.value || emptySlotScopeToken    // 清空当前节点的 children    el.children = []    el.plain = false  }}
```

这样处理后我们就可以直接在父组件上面直接使用 `**v-slot**` 指令去获取 Slots 绑定的值。

举个官方例子：

```
Default slot with text<foo>  <template slot-scope="{ msg }">    {{ msg }}  </template></foo><foo v-slot="{ msg }">  {{ msg }}</foo>Default slot with element<foo>  <div slot-scope="{ msg }">    {{ msg }}  </div></foo><foo v-slot="{ msg }">  <div>    {{ msg }}  </div></foo>
```

#### **3.2.4** `**genSlot**`

在这块逻辑也没发生本质性的改变，唯一一个改变就是为了支持 `**v-slot**` 动态参数做了些改变，具体如下：

```
// oldconst attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`// new// attrs、dynamicAttrs 进行 concat 操作，并执行 genProps 将其转换成对应的 generate 字符串const attrs = el.attrs || el.dynamicAttrs    ? genProps(        (el.attrs || []).concat(el.dynamicAttrs || []).map(attr => ({          // slot props are camelized          name: camelize(attr.name),          value: attr.value,          dynamic: attr.dynamic        }))     )    : null
```

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCud2WSDtSwKviclWRHhBib3tCFcHtF7LvLoPotfzgicicfBj6JqAjxicYwel7uMhwZJicMP7UL8VXBSMRibQ/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)