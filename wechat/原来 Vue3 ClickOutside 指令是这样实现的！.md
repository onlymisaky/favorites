> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/a-xV6LmOW77eLF1mP7sbHg)

当我们在开发一些组件的时候，比如下拉框或者一些模态框等组件，我们希望在点击元素之外的时候就能够把相应的元素收起来或者隐藏；这看似十分简单的需求，其实隐藏着很多的判断逻辑和代码技巧在里面，笔者就结合这几天阅读 element-plus 和 naive-ui-admin 源码的经验，总结分享自己的一些经验和想法。  

在学习源码之前，我们先进行铺垫一下，了解一下简单几个工具函数的使用，方便后续理解。

> ❝
> 
> 本文应该是全网最深入的对自定义指令 ClickOutside 的解读，文章内容较长，觉得有所收获的记得点赞关注收藏，一键三连。
> 
> ❞

工具函数
====

首先是 on 和 off 函数，在 naive-ui-admin 中用来给函数注册绑定和解除绑定事件

```
export function on(  element: Element | HTMLElement | Document | Window,  event: string,  handler: EventListenerOrEventListenerObject): void {  if (element && event && handler) {    element.addEventListener(event, handler, false);  }}export function off(  element: Element | HTMLElement | Document | Window,  event: string,  handler: Fn): void {  if (element && event && handler) {    element.removeEventListener(event, handler, false);  }}
```

比如在给元素绑定事件时，也可以很方便的使用，看起来也比较简洁：

```
const domClick = (ev) => {    // ...}on(el, 'click', domClick)off(el, 'click', domClick)
```

这里扩展一下，利用 on 和 off 函数组合，我们还能扩展出 once 函数，用来注册一次性的事件：

```
export function once(el: HTMLElement, event: string, fn: EventListener): void {  const listener = function (this: any, ...args: unknown[]) {    if (fn) {      fn.apply(this, args);    }    off(el, event, listener);  };  on(el, event, listener);}
```

在这里，我们并不是直接将 fn 函数绑定到元素上，而是巧妙的在函数内部定义了`listener`函数绑定在 el 元素上，再在`listener`函数触发后，在其内部执行一次 fn 函数后再进行解绑操作。

自定义指令
=====

在 vue 中有很多 v-if、v-show、v-model 等常用内置的指令可以使用，同时我们可以很方便灵活的封装自己的指令，来满足特定的业务需求和场景；我们在 setup 一文中介绍了如何定义和引入定义好的指令，指令对象中我们可以使用如下七个声明周期的钩子函数：

*   created：在绑定元素的 attribute 前
    
*   beforeMount：在元素被插入到 DOM 前调用
    
*   mounted：绑定元素的父组件及子节点都挂载完成后调用
    
*   beforeUpdate：绑定元素的父组件更新前调用
    
*   updated：绑定元素的父组件所有及子节点更新完成后
    
*   beforeUnmount：绑定元素的父组件卸载前调用
    
*   unmounted：绑定元素的父组件卸载后调用
    

> ❝
> 
> 注意没有 beforeCreate 函数。
> 
> ❞

钩子函数看似比较多，其实常见常用的也就是 mounted、updated 和 beforeUnmount，在生命周期开始、中间和结束时做一些处理，钩子函数常见的写法如下：

```
const myDirective = {  mounted(el, binding, vnode, prevVnode) {    // ...  },}
```

这里我们重点看下钩子函数传入的两个参数：el 和 binding；el 很明显就是绑定指令的 dom 元素，而 binding 就比较有趣了，它里面含有各种绑定的数据，它本身是一个对象，把它打印出来，我们看到它有以下属性：

*   value：value 就是我们传入到指令中的数据。
    
*   arg：传递给指令的参数。
    
*   dir：指令对象。
    
*   instance：使用指令的组件对象，非 dom。
    
*   modifiers：由修饰符构成的对象。
    
*   oldValue：之前的值。
    

比如我们写了一个自定义指令：

```
<div v-click-outside:foo.stop.front="'hello'"></div>
```

那么我们打印出来的 binding 对象就会像是这样的：

```
{  arg: "foo",  dir: { mounted:f, beforeUnmount:f },  instance: Proxy(Object),  modifiers: { stop: true, front: true },  oldValue: undefined,  value: 'hello'}
```

通过这个案例我们就能很清楚每个参数的作用，oldValue 一般在 update 的时候会用到；而我们最常用的就是`value`值了，这里的 value 值不仅仅局限于普通的数值，还可以传入对象或者函数进行执行，我们在下面会看到。

动态参数指令
------

这里还要额外介绍一下指令的`arg`属性，利用这个指令属性，我们还可以玩出很多花样来；在上面的例子中，`v-click-outside:foo`这样的写法，指令参数 arg 的值就是确定的 foo。

在 vue3 的官方文档上就给出了这样一个场景，我们将一个 div，通过固定布局 fix 的方式固定再页面一侧，但是需要改变它的位置，虽然我们可以通过 value 传入对象的方式解决，却不是很友好，通过动态 arg 的方式我们就可以把这个需求给轻松实现了；

```
<template>
<div>
  <div class="fixed" v-fixed:[direction]="200"></div>
  <div @click="changeDirection">改变方向</div>
</div>
</template>
<script setup>
import vFixed from '@/directives/fixed'
const direction = ref('left')

const changeDirection = () => {
  direction.value = 'right'
}
</script>
```

通过`v-fixed:[direction]`的方式，我们给 arg 参数传入了 left 的值；点击按钮我们希望切换值：

```
const fixed = {  mounted(el, binding) {    const s = binding.arg || 'left'    el.style[s] = (binding.value || 200) + 'px'  },  updated(el, binding) {    const s = binding.arg || 'left'    el.style = ''    el.style[s] = (binding.value || 200) + 'px'  },  beforeUnmount() {},}export default fixed
```

这样我们就实现的动态指令参数的切换；除此之外，我们还可以给 arg 传入数组等复杂的数据。

简易版实现
=====

好了，上面的工具函数和钩子函数的介绍铺垫完了，我们对自定义指令也有了一定的了解；我们从最简单的功能开始，来看下如何实现一个简易版本的 ClickOutside。

```
import { on, off } from '@/utils/domUtils'const clickOutside = {  mounted(el, binding) {    function eventHandler(e) {      // 对el和binding进行处理，判断是否触发value函数    }    el.__click_outside__ = eventHandler    on(document, 'click', eventHandler)  },  beforeUnmount(el) {    if(typeof el.__click_outside__ === 'function'){      off(document, 'click', el.__click_outside__)    }  },}export default clickOutside
```

我们在指令挂载的时候，给 document 定义并且绑定了一个`eventHandler`处理函数，并且挂载到元素的__click_outside__属性，方便在卸载的时候进行事件取消绑定。

> ❝
> 
> eventHandler 函数只能放到指令中定义，否则获取不到 el 和 binding。
> 
> ❞

在使用 clickOutside 的时候，我们给 value 传入绑定函数，因此`binding.value`的值接收到的其实是一个函数：

```
<template>
 <div v-click-outside="onClickOutside">
 </div>
</template>
<script setup>
const onClickOutside = () => {
  // ..
}
</script>
```

我们在上面定义的 eventHandler 函数也是点击事件的触发函数，判断事件的 target 是否包含在 el 节点中，如果不在的话就执行 binding.value 函数。

```
{  mounted(el, binding) {    function eventHandler(e) {      if (el.contains(e.target) || el === e.target) {        return false      }      // 触发binding.value      if (binding.value && typeof binding.value === 'function') {        binding.value(e)      }    }  }}
```

这里用到了一个`contains`函数，它返回一个布尔值，用来判断某一节点是否是另一个节点的子节点，我们看下 MDN 文档上的解释：

> ❝
> 
> contains() 方法返回一个布尔值，表示一个节点是否是给定节点的后代，即该节点本身、其直接子节点（childNodes）、子节点的直接子节点等。
> 
> ❞

需要注意的是，由于`contains`会将节点本身判断返回 true，这不是我们想要的结果，因此我们还要显示加一下`el === e.target`的判断过滤条件。

因此最终的指令就是这样的：

```
import { on , off } from '@/utils/domUtils'const clickOutside = {  mounted(el, binding) {    function eventHandler(e) {      if (el.contains(e.target) || el === e.target) {        return false      }      if (binding.value && typeof binding.value === 'function') {        binding.value(e)      }    }    el.__click_outside__ = eventHandler    on(document, 'click', eventHandler)  },  beforeUnmount(el) {    if(typeof el.__click_outside__ === 'function'){      off(document, 'click', el.__click_outside__)    }  },}export default clickOutside
```

简易版优化
-----

我们继续对这个简易版的函数进行优化，我们发现，每次指令初始化和移除时给 document 绑定事件很麻烦；如果把 document 的绑定事件放到外面来，只绑定一次，不就减少了每次绑定和解绑的繁琐了么。

```
on(document, 'click', (e) => {  // ...})const clickOutside = {  mounted(el, binding) {    // ...  }}
```

那么，接下来的问题就来到了，怎么能够在 click 事件中能够执行每个指令中定义的 eventHandler 函数，从而判断出 binding.value 函数是否需要触发执行呢？

没错，我们可以定义一个数组，来收集所有指令的 eventHandler 函数，点击时统一执行；不过数组带来的问题是最后解绑时不容易去找到每个 el 对应的 eventHandler 函数。

不过这里我们更加巧妙的定义了一个 Map 对象，由于我们的 eventHandler 函数和 el 是一一对用关系，利用 Map 对象的键值可以存储任何数据的特性加持：

```
const nodeList = new Map()on(document, 'click', (e) => {  for (const fn of nodeList.values()) {    fn(e)  }})const clickOutside = {  mounted(el, binding) {    function eventHandler(e) {      // ...    }    nodeList.set(el, eventHandler)  },  beforeUnmount(el) {    nodeList.delete(el)  },}
```

我们将 eventHandler 收集到 nodeList 中，document 点击时触发每个 eventHandler，再在 eventHandler 内部去判断 bind.value 是否需要触发。

简易版升级优化
-------

虽然是简易版，不过我们还可以对它再再进行优化；我们发现 naive-ui-admin 的源码 clickOutside.ts 中，并没有注册 click 事件，而是注册了 mouseup/mousedown 事件，这是为什么呢？我们在 MDN 中关于 click/mouseup/mousedown 事件找到了原话，是这样说的：

> ❝
> 
> 当定点设备的按钮（通常是`鼠标的主键`）在一个元素上被按下和放开时，click 事件就会被触发。
> 
> ❞

> ❝
> 
> mouseup/mousedown 事件在`定点设备（如鼠标或触摸板）`按钮在元素内按下时，会在该元素上触发。
> 
> ❞

因此，总结下来就是，click 事件只是由鼠标的左键触发，而 mouseup/mousedown 事件是由任意定点设备触发的，比如鼠标的右键或者中间的滚轮键，都是可以触发的。

> ❝
> 
> 点击 dom 元素，三个事件的触发顺序是：mousedown、mouseup、click。
> 
> ❞

上面得出的结论，我们可以在 VueUse 中同时得到验证；如果我们使用 VueUse 的 onClickOutside，我们会发现它只有在鼠标左键时才会触发；而 element-plus 则是三键同时可以触发。

打开 VueUse 源码中我们就会发现他注册的就是 click 事件：

```
const cleanup = [    useEventListener(window, 'click', listener, { passive: true, capture }),    // 省略其他代码]cleanup.forEach(fn => fn())
```

因此知道了三个事件的区别，回到我们的简易版本，我们就可以进行升级了；首先将 click 事件进行改写，分成 mousedown 和 mouseup，不过这两个事件都有对应的事件对象 e，我们先存一个下来，在 eventHandler 里面再对两个事件对象进行判断。

```
let startClickon(document, 'mousedown', (e) => {  startClick = e})on(document, 'mouseup', (e) => {  for (const fn of nodeList.values()) {    fn(e, startClick)  }})
```

eventHandler 也接收的不是 click 的 ev 对象了，而是 mousedown/mouseup 的：

```
function eventHandler(mouseup, mousedown) {  if (    el.contains(mouseup.target) ||    el === mouseup.target ||    el.contains(mousedown.target) ||    el === mousedown.target  ) {    return false  }  if (binding.value && typeof binding.value === 'function') {    binding.value()  }}
```

这样我们的简易函数就升级完成了，也能同时支持左中右键的事件了。

源码实现逻辑
======

经过上面的简易版本的迭代升级，相信大家对 ClickOutside 整体的实现过程和原理应该有了一定的了解，基本也已经把源码讲了七七八八了；我们就来看下它的源码中还有哪些逻辑，无非是判断的更加全面一些，下面主要以 naive-ui-admin 源码中的 clickOutside.ts 为主。

首先我们看下它主要的代码结构：

```
import { on } from '@/utils/domUtils';const nodeList = new Map();let startClick: MouseEvent;on(document, 'mousedown', (e: MouseEvent) => (startClick = e));on(document, 'mouseup', (e: MouseEvent) => {  for (const { documentHandler } of nodeList.values()) {    documentHandler(e, startClick);  }});function createDocumentHandler(el, binding) {  return function (mouseup, mousedown) {    // ..  }}const ClickOutside: ObjectDirective = {  beforeMount(el, binding) {    nodeList.set(el, {      documentHandler: createDocumentHandler(el, binding),      bindingFn: binding.value,    });  },  updated(el, binding) {    nodeList.set(el, {      documentHandler: createDocumentHandler(el, binding),      bindingFn: binding.value,    });  },  unmounted(el) {    nodeList.delete(el);  },};export default ClickOutside;
```

我们发现除了 createDocumentHandler 这个函数之外，其他的功能在上面简易版里都已经实现了；由于我们的 handler 函数中需要用到 el 和 binding，这里的`createDocumentHandler`作用是创建一个匿名闭包 handler 函数，将 handler 函数存储到 nodeList，就能引用 el 和 binding 了。

因此我们重点来看下这个 createDocumentHandler 做了哪些事情，首先他接收了指令中的 el 和 binding 两个参数，它返回的匿名函数是在 mouseup 事件中被调用的，接收了 mouseup 和 mousedown 两个事件对象。

我们继续看创建出来的 documentHandler 函数中做了哪些的处理，它里面主要有 6 个判断的 flag，只要符合下面 6 个条件之一，即返回 true，就`不触发binding.value`函数：

```
return function (mouseup, mousedown) {  // ...  if (    isBound ||    isTargetExists ||    isContainedByEl ||    isSelf ||    isTargetExcluded ||    isContainedByPopper  ) {    return;  }  binding.value();}
```

那么这六个条件是什么呢？我们逐一来解读；前两个判断是完整性判断，第一个检验条件是检查 binding 或 binding.instance 是否存在，不存在 isBound 为 true；第二个检验条件是 mouseup/mousedown 的触发目标元素 target 是否都存在。

```
const mouseUpTarget = mouseup.target as Node;const mouseDownTarget = mousedown.target as Node;// 判断一const isBound = !binding || !binding.instance;// 判断二const isTargetExists = !mouseUpTarget || !mouseDownTarget;
```

第三第四个判断就是元素判断了，和我们的简易版本就有点类似，isContainedByEl 判断 mouseUpTarget 和 mouseDownTarget 是否在 el 元素中，如果在则为 true；isSelf 则是判断触发元素是否是 el 自身。

```
// 判断三const isContainedByEl = el.contains(mouseUpTarget) || el.contains(mouseDownTarget);// 判断四const isSelf = el === mouseUpTarget;
```

第五第六个判断是特殊情况的判断，判断五是事件的 target 是否被 excludes 中的元素包含，如果是，isTargetExcluded 为 true。

```
// 判断五const isTargetExcluded =  (excludes.length && excludes.some((item) => item?.contains(mouseUpTarget))) ||  (excludes.length && excludes.includes(mouseDownTarget as HTMLElement));const popperRef = (  binding.instance as ComponentPublicInstance<{    popperRef: Nullable<HTMLElement>;  }>).popperRef;// 判断六const isContainedByPopper =  popperRef && (popperRef.contains(mouseUpTarget) || popperRef.contains(mouseDownTarget));
```

这里我们重点来讲一下 excludes 过滤数组的用法，正常情况下都是将绑定元素 el 下的 dom 节点判断过滤，但是还有些情况下，我们需要在点击时额外过滤其他的节点（这种特殊的情况，我们在下面一篇文章会看到）；这个时候就要用到 excludes 数组了，那它是怎么来的呢？在创建 documentHandler 的时候，我们就从这个动态参数指令 arg 中拼了这个数组：

```
function createDocumentHandler(el, binding) {  let excludes = [];  if (Array.isArray(binding.arg)) {    excludes = binding.arg;  } else {    excludes.push(binding.arg);  }  // 其他判断条件}
```

那么结合上面的动态参数指令，我们就可以使用一下这个 exclude 来额外添加过滤的 dom：

```
<template>
  <div v-click-outside:[excludeDom]="clickOut"></div>
</template>
<script setup>
const excludeDom = ref([])
const clickOut = () => {}

onMounted(() => {
  excludeDom.value.push(document.querySelector(".some-class"));
});
</script>
```

总结
==

本文总结了 vue3 下 ClickOutside 的实现逻辑，从工具函数封装，到自定义指令的学习，再到源码的深入学习；虽然 ClickOutside 的整体逻辑并不是很复杂，但是刚开始笔者阅读源码的时候，很难理解其中的一些用法；尤其是在事件的注册，为什么不用 click，而是使用 mouseup/mousedown 两个事件组合；经过深入的思考和对比，才慢慢理解作者的用意。