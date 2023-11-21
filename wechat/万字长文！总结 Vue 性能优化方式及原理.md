> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TeJaj06C_7b3ZhBvW3NBJw)

### 前言

我们在使用 Vue 或其他框架的日常开发中，或多或少的都会遇到一些性能问题，尽管 Vue 内部已经帮助我们做了许多优化，但是还是有些问题是需要我们主动去避免的。我在我的日常开中，以及网上各种大佬的文章中总结了一些容易产生性能问题的场景以及针对这些问题优化的技巧，这篇文章就来探讨下，希望对你有所帮助。

### 使用`v-slot:slotName`，而不是`slot="slotName"`

`v-slot`是 2.6 新增的语法，具体可查看: Vue2.6，2.6 发布已经是快两年前的事情了，但是现在仍然有不少人仍然在使用`slot="slotName"`这个语法。虽然这两个语法都能达到相同的效果，但是内部的逻辑确实不一样的，下面来看下这两种方式有什么不同之处。

我们先来看下这两种语法分别会被编译成什么：

使用新的写法，对于父组件中的以下模板：

```
<child><br style="visibility: visible;">  <template v-slot:name>{{name}}</template><br style="visibility: visible;"></child><br style="visibility: visible;">复制代码<br style="visibility: visible;">
```

会被编译成：

```
function render() {  with (this) {    return _c('child', {      scopedSlots: _u([        {          key: 'name',          fn: function () {            return [_v(_s(name))]          },          proxy: true        }      ])    })  }}复制代码
```

使用旧的写法，对于以下模板：

```
<child>  <template slot="name">{{name}}</template></child>复制代码
```

会被编译成：

```
function render() {  with (this) {    return _c(      'child',      [        _c(          'template',          {            slot: 'name'          },          [_v(_s(name))]        )      ],    )  }}复制代码
```

通过编译后的代码可以发现，**旧的写法是将插槽内容作为 children 渲染的，会在父组件的渲染函数中创建，插槽内容的依赖会被父组件收集（name 的 dep 收集到父组件的渲染 watcher），而新的写法将插槽内容放在了 scopedSlots 中，会在子组件的渲染函数中调用，插槽内容的依赖会被子组件收集（name 的 dep 收集到子组件的渲染 watcher）**，最终导致的结果就是：当我们修改 name 这个属性时，旧的写法是调用父组件的更新（调用父组件的渲染 watcher），然后在父组件更新过程中调用子组件更新（prePatch => updateChildComponent），而新的写法则是直接调用子组件的更新（调用子组件的渲染 watcher）。

这样一来，旧的写法在更新时就多了一个父组件更新的过程，而新的写法由于直接更新子组件，就会更加高效，性能更好，所以推荐始终使用`v-slot:slotName`语法。

### 使用计算属性

这一点已经被提及很多次了，计算属性最大的一个特点就是它是可以被缓存的，这个缓存指的是只要它的依赖的不发生改变，它就不会被重新求值，再次访问时会直接拿到缓存的值，在做一些复杂的计算时，可以极大提升性能。可以看以下代码：

```
<template>  <div>{{superCount}}</div></template><script>  export default {    data() {      return {        count: 1      }    },    computed: {      superCount() {        let superCount = this.count        // 假设这里有个复杂的计算        for (let i = 0; i < 10000; i++) {          superCount++        }        return superCount      }    }  }</script>复制代码
```

这个例子中，在 created、mounted 以及模板中都访问了 superCount 属性，这三次访问中，实际上只有第一次即`created`时才会对 superCount 求值，由于 count 属性并未改变，其余两次都是直接返回缓存的 value，对于计算属性更加详细的介绍可以看我之前写的文章：Vue computed 是如何实现的？。

### 使用函数式组件

对于某些组件，如果我们只是用来显示一些数据，不需要管理状态，监听数据等，那么就可以用函数式组件。函数式组件是无状态的，无实例的，在初始化时不需要初始化状态，不需要创建实例，也不需要去处理生命周期等，相比有状态组件，会更加轻量，同时性能也更好。具体的函数式组件使用方式可参考官方文档：函数式组件

我们可以写一个简单的 demo 来验证下这个优化：

```
// UserProfile.vue<template>  <div class="user-profile">{{ name }}</div></template><script>  export default {    props: ['name'],    data() {      return {}    },    methods: {}  }</script><style scoped></style>// App.vue<template>  <div id="app">    <UserProfile v-for="item in list" :key="item" : />  </div></template><script>  import UserProfile from './components/UserProfile'  export default {    name: 'App',    components: { UserProfile },    data() {      return {        list: Array(500)          .fill(null)          .map((_, idx) => 'Test' + idx)      }    },    beforeMount() {      this.start = Date.now()    },    mounted() {      console.log('用时:', Date.now() - this.start)    }  }</script><style></style>复制代码
```

UserProfile 这个组件只渲染了 props 的 name，然后在 App.vue 中调用 500 次，统计从 beforeMount 到 mounted 的耗时，即为 500 个子组件（UserProfile）初始化的耗时。

经过我多次尝试后，发现耗时一直在 30ms 左右，那么现在我们再把改成 UserProfile 改成函数式组件：

```
<template functional>  <div class="user-profile">{{ props.name }}</div></template>复制代码
```

此时再经过多次尝试后，初始化的耗时一直在 10-15ms，这些足以说明函数式组件比有状态组件有着更好的性能。

### 结合场景使用 v-show 和 v-if

以下是两个使用 v-show 和 v-if 的模板

```
<template>  <div>    <UserProfile :user="user1" v-if="visible" />    <button @click="visible = !visible">toggle</button>  </div></template>复制代码
```

```
<template>  <div>    <UserProfile :user="user1" v-show="visible" />    <button @click="visible = !visible">toggle</button>  </div></template>复制代码
```

这两者的作用都是用来控制某些组件或 DOM 的显示 / 隐藏，在讨论它们的性能差异之前，先来分析下这两者有何不同。其中，v-if 的模板会被编译成：

```
function render() {  with (this) {    return _c(      'div',      [        visible          ? _c('UserProfile', {              attrs: {                user: user1              }            })          : _e(),        _c(          'button',          {            on: {              click: function ($event) {                visible = !visible              }            }          },          [_v('toggle')]        )      ],    )  }}复制代码
```

可以看到，v-if 的部分被转换成了一个三元表达式，visible 为 true 时，创建一个 UserProfile 的 vnode，否则创建一个空 vnode，在 patch 的时候，新旧节点不一样，就会移除旧的节点或创建新的节点，这样的话`UserProfile`也会跟着创建 / 销毁。如果`UserProfile`组件里有很多 DOM，或者要执行很多初始化 / 销毁逻辑，那么随着 visible 的切换，势必会浪费掉很多性能。这个时候就可以用 v-show 进行优化，我们来看下 v-show 编译后的代码：

```
function render() {  with (this) {    return _c(      'div',      [        _c('UserProfile', {          directives: [            {              name: 'show',              rawName: 'v-show',              value: visible,              expression: 'visible'            }          ],          attrs: {            user: user1          }        }),        _c(          'button',          {            on: {              click: function ($event) {                visible = !visible              }            }          },          [_v('toggle')]        )      ],    )  }}复制代码
```

`v-show`被编译成了`directives`，实际上，v-show 是一个 Vue 内部的指令，在这个指令的代码中，主要执行了以下逻辑：

```
el.style.display = value ? el.__vOriginalDisplay : 'none'复制代码
```

它其实是通过切换元素的 display 属性来控制的，和 v-if 相比，不需要在 patch 阶段创建 / 移除节点，只是根据`v-show`上绑定的值来控制 DOM 元素的`style.display`属性，在频繁切换的场景下就可以节省很多性能。

但是并不是说`v-show`可以在任何情况下都替换`v-if`，如果初始值是`false`时，`v-if`并不会创建隐藏的节点，但是`v-show`会创建，并通过设置`style.display='none'`来隐藏，虽然外表看上去这个 DOM 都是被隐藏的，但是`v-show`已经完整的走了一遍创建的流程，造成了性能的浪费。

所以，`v-if`的优势体现在初始化时，`v-show`体现在更新时，当然并不是要求你绝对按照这个方式来，比如某些组件初始化时会请求数据，而你想先隐藏组件，然后在显示时能立刻看到数据，这时候就可以用`v-show`，又或者你想每次显示这个组件时都是最新的数据，那么你就可以用`v-if`，所以我们要结合具体业务场景去选一个合适的方式。

### 使用 keep-alive

在动态组件的场景下：

```
<template>  <div>    <component :is="currentComponent" />  </div></template>复制代码
```

这个时候有多个组件来回切换，`currentComponent`每变一次，相关的组件就会销毁 / 创建一次，如果这些组件比较复杂的话，就会造成一定的性能压力，其实我们可以使用 keep-alive 将这些组件缓存起来：

```
<template>  <div>    <keep-alive>      <component :is="currentComponent" />    </keep-alive>  </div></template>复制代码
```

`keep-alive`的作用就是将它包裹的组件在第一次渲染后就缓存起来，下次需要时就直接从缓存里面取，避免了不必要的性能浪费，在讨论上个问题时，说的是`v-show`初始时性能压力大，因为它要创建所有的组件，其实可以用`keep-alive`优化下：

```
<template>  <div>    <keep-alive>      <UserProfileA v-if="visible" />      <UserProfileB v-else />    </keep-alive>  </div></template>复制代码
```

这样的话，初始化时不会渲染`UserProfileB`组件，当切换`visible`时，才会渲染`UserProfileB`组件，同时被`keep-alive`缓存下来，频繁切换时，由于是直接从缓存中取，所以会节省很多性能，所以这种方式在初始化和更新时都有较好的性能。

但是`keep-alive`并不是没有缺点，组件被缓存时会占用内存，属于空间和时间上的取舍，在实际开发中要根据场景选择合适的方式。

### 避免 v-for 和 v-if 同时使用

这一点是 Vue 官方的风格指南中明确指出的一点：Vue 风格指南

如以下模板：

```
<ul>  <li v-for="user in users" v-if="user.isActive" :key="user.id">    {{ user.name }}  </li></ul>复制代码
```

会被编译成：

```
// 简化版function render() {  return _c(    'ul',    this.users.map((user) => {      return user.isActive        ? _c(            'li',            {              key: user.id            },            [_v(_s(user.name))]          )        : _e()    }),  )}复制代码
```

可以看到，这里是先遍历（v-for），再判断（v-if），这里有个问题就是：如果你有一万条数据，其中只有 100 条是`isActive`状态的，你只希望显示这 100 条，但是实际在渲染时，每一次渲染，这一万条数据都会被遍历一遍。比如你在这个组件内的其他地方改变了某个响应式数据时，会触发重新渲染，调用渲染函数，调用渲染函数时，就会执行到上面的代码，从而将这一万条数据遍历一遍，即使你的`users`没有发生任何改变。

为了避免这个问题，在此场景下你可以用计算属性代替：

```
<template>  <div>    <ul>      <li v-for="user in activeUsers" :key="user.id">{{ user.name }}</li>    </ul>  </div></template><script>  export default {    // ...    computed: {      activeUsers() {        return this.users.filter((user) => user.isActive)      }    }  }</script>复制代码
```

这样只会在`users`发生改变时才会执行这段遍历的逻辑，和之前相比，避免了不必要的性能浪费。

### 始终为 v-for 添加 key，并且不要将 index 作为的 key

这一点是 Vue 风格指南中明确指出的一点，同时也是面试时常问的一点，很多人都习惯的将 index 作为 key，这样其实是不太好的，index 作为 key 时，将会让 diff 算法产生错误的判断，从而带来一些性能问题，你可以看下 ssh 大佬的文章，深入分析下，为什么 Vue 中不要用 index 作为 key。在这里我也通过一个例子来简单说明下当 index 作为 key 时是如何影响性能的。

看下这个例子：

```
const Item = {  name: 'Item',  props: ['message', 'color'],  render(h) {    debugger    console.log('执行了Item的render')    return h('div', { style: { color: this.color } }, [this.message])  }}new Vue({  name: 'Parent',  template: `  <div @click="reverse" class="list">    <Item      v-for="(item,index) in list"      :key="item.id"      :message="item.message"      :color="item.color"    />  </div>`,  components: { Item },  data() {    return {      list: [        { id: 'a', color: '#f00', message: 'a' },        { id: 'b', color: '#0f0', message: 'b' }      ]    }  },  methods: {    reverse() {      this.list.reverse()    }  }}).$mount('#app')复制代码
```

这里有一个 list，会渲染出来`a b`，点击后会执行`reverse`方法将这个 list 颠倒下顺序，你可以将这个例子复制下来，在自己的电脑上看下效果。

我们先来分析用`id`作为 key 时，点击时会发生什么，

由于 list 发生了改变，会触发`Parent`组件的重新渲染，拿到新的`vnode`，和旧的`vnode`去执行`patch`，我们主要关心的就是`patch`过程中的`updateChildren`逻辑，`updateChildren`就是对新旧两个`children`执行`diff`算法，使尽可能地对节点进行复用，对于我们这个例子而言，此时`旧的children`是：

```
;[  {    tag: 'Item',    key: 'a',    propsData: {      color: '#f00',      message: '红色'    }  },  {    tag: 'Item',    key: 'b',    propsData: {      color: '#0f0',      message: '绿色'    }  }]复制代码
```

执行`reverse`后的`新的children`是：

```
;[  {    tag: 'Item',    key: 'b',    propsData: {      color: '#0f0',      message: '绿色'    }  },  {    tag: 'Item',    key: 'a',    propsData: {      color: '#f00',      message: '红色'    }  }]复制代码
```

此时执行`updateChildren`，`updateChildren`会对新旧两组 children 节点的循环进行对比：

```
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {  if (isUndef(oldStartVnode)) {    oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left  } else if (isUndef(oldEndVnode)) {    oldEndVnode = oldCh[--oldEndIdx]  } else if (sameVnode(oldStartVnode, newStartVnode)) {    // 对新旧节点执行patchVnode    // 移动指针  } else if (sameVnode(oldEndVnode, newEndVnode)) {    // 对新旧节点执行patchVnode    // 移动指针  } else if (sameVnode(oldStartVnode, newEndVnode)) {    // 对新旧节点执行patchVnode    // 移动oldStartVnode节点    // 移动指针  } else if (sameVnode(oldEndVnode, newStartVnode)) {    // 对新旧节点执行patchVnode    // 移动oldEndVnode节点    // 移动指针  } else {    //...  }}复制代码
```

通过`sameVnode`判断两个节点是相同节点的话，就会执行相应的逻辑：

```
function sameVnode(a, b) {  return (    a.key === b.key &&    ((a.tag === b.tag &&      a.isComment === b.isComment &&      isDef(a.data) === isDef(b.data) &&      sameInputType(a, b)) ||      (isTrue(a.isAsyncPlaceholder) &&        a.asyncFactory === b.asyncFactory &&        isUndef(b.asyncFactory.error)))  )}复制代码
```

`sameVnode`主要就是通过 key 去判断，由于我们颠倒了 list 的顺序，所以第一轮对比中：`sameVnode(oldStartVnode, newEndVnode)`成立，即旧的首节点和新的尾节点是同一个节点，此时会执行`patchVnode`逻辑，`patchVnode`中会执行`prePatch`，`prePatch`中会更新 props，此时我们的两个节点的`propsData`是相同的，都为`{color: '#0f0',message: '绿色'}`，这样的话`Item`组件的 props 就不会更新，`Item`也不会重新渲染。再回到`updateChildren`中，会继续执行`"移动oldStartVnode节点"`的操作，将 DOM 元素。移动到正确位置，其他节点对比也是同样的流程。

可以发现，在整个流程中，**只是移动了节点，并没有触发 Item 组件的重新渲染**，这样实现了节点的复用。

我们再来看下使用`index`作为 key 的情况，使用`index`时，`旧的children`是：

```
;[  {    tag: 'Item',    key: 0,    propsData: {      color: '#f00',      message: '红色'    }  },  {    tag: 'Item',    key: 1,    propsData: {      color: '#0f0',      message: '绿色'    }  }]复制代码
```

执行`reverse`后的`新的children`是：

```
;[  {    tag: 'Item',    key: 0,    propsData: {      color: '#0f0',      message: '绿色'    }  },  {    tag: 'Item',    key: 1,    propsData: {      color: '#f00',      message: '红色'    }  }]复制代码
```

这里和`id`作为 key 时的节点就有所不同了，虽然我们把 list 顺序颠倒了，但是 key 的顺序却没变，在`updateChildren`时`sameVnode(oldStartVnode, newStartVnode)`将会成立，即旧的首节点和新的首节点相同，此时执行`patchVnode -> prePatch -> 更新props`，这个时候旧的 propsData 是`{color: '#f00',message: '红色'}`，新的 propsData 是`{color: '#0f0',message: '绿色'}`，更新过后，Item 的 props 将会发生改变，**会触发 Item 组件的重新渲染**。

这就是 index 作为 key 和 id 作为 key 时的区别，**id 作为 key 时，仅仅是移动了节点，并没有触发 Item 的重新渲染。index 作为 key 时，触发了 Item 的重新渲染**，可想而知，当 Item 是一个复杂的组件时，必然会引起性能问题。

上面的流程比较复杂，涉及的也比较多，可以拆开写好几篇文章，有些地方我只是简略的说了一下，如果你不是很明白的话，你可以把上面的例子复制下来，在自己的电脑上调式，我在 Item 的渲染函数中加了打印日志和 debugger，你可以分别用 id 和 index 作为 key 尝试下，你会发现 id 作为 key 时，Item 的渲染函数没有执行，但是 index 作为 key 时，Item 的渲染函数执行了，这就是这两种方式的区别。

### 延迟渲染

延迟渲染就是分批渲染，假设我们某个页面里有一些组件在初始化时需要执行复杂的逻辑：

```
<template>
  <div>
    <!-- Heavy组件初始化时需要执行很复杂的逻辑，执行大量计算 -->
    <Heavy1 />
    <Heavy2 />
    <Heavy3 />
    <Heavy4 />
  </div>
</template>
复制代码
```

这将会占用很长时间，导致帧数下降、卡顿，其实可以使用分批渲染的方式来进行优化，就是先渲染一部分，再渲染另一部分：

参考黄轶老师揭秘 Vue.js 九个性能优化技巧中的代码：

```
<template>  <div>    <Heavy v-if="defer(1)" />    <Heavy v-if="defer(2)" />    <Heavy v-if="defer(3)" />    <Heavy v-if="defer(4)" />  </div></template><script>export default {  data() {    return {      displayPriority: 0    }  },  mounted() {    this.runDisplayPriority()  },  methods: {    runDisplayPriority() {      const step = () => {        requestAnimationFrame(() => {          this.displayPriority++          if (this.displayPriority < 10) {            step()          }        })      }      step()    },    defer(priority) {      return this.displayPriority >= priority    }  }}</script>复制代码
```

其实原理很简单，主要是维护`displayPriority`变量，通过`requestAnimationFrame`在每一帧渲染时自增，然后我们就可以在组件上通过`v-if="defer(n)"`使`displayPriority`增加到某一值时再渲染，这样就可以避免 js 执行时间过长导致的卡顿问题了。

### 使用非响应式数据

在 Vue 组件初始化数据时，会递归遍历在 data 中定义的每一条数据，通过`Object.defineProperty`将数据改成响应式，这就意味着如果 data 中的数据量很大的话，在初始化时将会使用很长的时间去执行`Object.defineProperty`, 也就会带来性能问题，这个时候我们可以强制使数据变为非响应式，从而节省时间，看下这个例子：

```
<template>  <div>    <ul>      <li v-for="item in heavyData" :key="item.id">{{ item.name }}</li>    </ul>  </div></template><script>// 一万条数据const heavyData = Array(10000)  .fill(null)  .map((_, idx) => ({ name: 'test', message: 'test', id: idx }))export default {  data() {    return {      heavyData: heavyData    }  },  beforeCreate() {    this.start = Date.now()  },  created() {    console.log(Date.now() - this.start)  }}</script>复制代码
```

`heavyData`中有一万条数据，这里统计了下从`beforeCreate`到`created`经历的时间，对于这个例子而言，这个时间基本上就是初始化数据的时间。

我在我个人的电脑上多次测试，这个时间一直在`40-50ms`，然后我们通过`Object.freeze()`方法，将`heavyData`变为非响应式的再试下：

```
//...data() {  return {    heavyData: Object.freeze(heavyData)  }}//...复制代码
```

改完之后再试下，初始化数据的时间变成了`0-1ms`，快了有`40ms`，这`40ms`都是递归遍历`heavyData`执行`Object.defineProperty`的时间。

那么，为什么`Object.freeze()`会有这样的效果呢？对某一对象使用`Object.freeze()`后，将不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。

而 Vue 在将数据改造成响应式之前有个判断：

```
export function observe(value, asRootData) {  // ...省略其他逻辑  if (    shouldObserve &&    !isServerRendering() &&    (Array.isArray(value) || isPlainObject(value)) &&    Object.isExtensible(value) &&    !value._isVue  ) {    ob = new Observer(value)  }  // ...省略其他逻辑}复制代码
```

这个判断条件中有一个`Object.isExtensible(value)`，这个方法是判断一个对象是否是可扩展的，由于我们使用了`Object.freeze()`，这里肯定就返回了`false`，所以就跳过了下面的过程，自然就省了很多时间。

实际上，不止初始化数据时有影响，你可以用上面的例子统计下从`created`到`mounted`所用的时间，在我的电脑上不使用`Object.freeze()`时，这个时间是`60-70ms`，使用`Object.freeze()`后降到了`40-50ms`，这是因为在渲染函数中读取`heavyData`中的数据时，会执行到通过`Object.defineProperty`定义的`getter`方法，Vue 在这里做了一些收集依赖的处理，肯定就会占用一些时间，由于使用了`Object.freeze()`后的数据是非响应式的，没有了收集依赖的过程，自然也就节省了性能。

> 由于访问响应式数据会走到自定义 getter 中并收集依赖，所以平时使用时要避免频繁访问响应式数据，比如在遍历之前先将这个数据存在局部变量中，尤其是在计算属性、渲染函数中使用，关于这一点更具体的说明，你可以看黄奕老师的这篇文章：Local variables

但是这样做也不是没有任何问题的，这样会导致`heavyData`下的数据都不是响应式数据，你对这些数据使用`computed`、`watch`等都不会产生效果，不过通常来说这种大量的数据都是展示用的，如果你有特殊的需求，你可以只对这种数据的某一层使用`Object.freeze()`，同时配合使用上文中的延迟渲染、函数式组件等，可以极大提升性能。

### 模板编译和渲染函数、JSX 的性能差异

Vue 项目不仅可以使用 SFC 的方式开发，也可以使用渲染函数或 JSX 开发，很多人认为仅仅是只是开发方式不同，却不知这些开发方式之间也有性能差异，甚至差异很大，这一节我就找些例子来说明下，希望你以后在选择开发方式时有更多衡量的标准。

其实 Vue2 模板编译中的性能优化不多，Vue3 中有很多，Vue3 通过编译和运行时结合的方式提升了很大的性能，但是由于本篇文章讲的是 Vue2 的性能优化，并且 Vue2 现在还是有很多人在使用，所以我就挑 Vue2 模板编译中的一点来说下。

#### 静态节点

下面这个模板：

```
<div>你好！ <span>Hello</span></div>
复制代码
```

会被编译成：

```
function render() {  with (this) {    return _m(0)  }}复制代码
```

可以看到和普通的渲染函数是有些不一样的，下面我们来看下为什么会编译成这样的代码。

Vue 的编译会经过`optimize`过程，这个过程中会标记静态节点，具体内容可以看黄奕老师写的这个文档：Vue2 编译 - optimize 标记静态节点。

在`codegen`阶段判断到静态节点的标记会走到`genStatic`的分支：

```
function genStatic(el, state) {  el.staticProcessed = true  const originalPreState = state.pre  if (el.pre) {    state.pre = el.pre  }  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)  state.pre = originalPreState  return `_m(${state.staticRenderFns.length - 1}${    el.staticInFor ? ',true' : ''  })`}复制代码
```

这里就是生成代码的关键逻辑，这里会把渲染函数保存在`staticRenderFns`里，然后拿到当前值的下标生成`_m`函数，这就是为什么我们会得到`_m(0)`。

这个`_m`其实是`renderStatic`的缩写：

```
export function renderStatic(index, isInFor) {  const cached = this._staticTrees || (this._staticTrees = [])  let tree = cached[index]  if (tree && !isInFor) {    return tree  }  tree = cached[index] = this.$options.staticRenderFns[index].call(    this._renderProxy,    null,    this  )  markStatic(tree, `__static__${index}`, false)  return tree}function markStatic(tree, key) {  if (Array.isArray(tree)) {    for (let i = 0; i < tree.length; i++) {      if (tree[i] && typeof tree[i] !== 'string') {        markStaticNode(tree[i], `${key}_${i}`, isOnce)      }    }  } else {    markStaticNode(tree, key, isOnce)  }}function markStaticNode(node, key, isOnce) {  node.isStatic = true  node.key = key  node.isOnce = isOnce}复制代码
```

`renderStatic`的内部实现比较简单，先是获取到组件实例的`_staticTrees`，如果没有就创建一个，然后尝试从`_staticTrees`上获取之前缓存的节点，获取到的话就直接返回，否则就从`staticRenderFns`上获取到对应的渲染函数执行并将结果缓存到`_staticTrees`上，这样下次再进入这个函数时就会直接从缓存上返回结果。

拿到节点后还会通过`markStatic`将节点打上`isStatic`等标记，标记为`isStatic`的节点会直接跳过`patchVnode`阶段，因为静态节点是不会变的，所以也没必要 patch，跳过 patch 可以节省性能。

通过编译和运行时结合的方式，可以帮助我们很好的提升应用性能，这是渲染函数 / JSX 很难达到的，当然不是说不能用 JSX，相比于模板，JSX 更加灵活，两者有各自的使用场景。在这里写这些是希望能给你提供一些技术选型的标准。

> Vue2 的编译优化除了静态节点，还有插槽，createElement 等。

#### Vue3 的模板编译优化

相比于 Vue2，Vue3 中的模板编译优化更加突出，性能提升的更多，由于涉及的比较多，本篇文章写不下，如果你感兴趣的话你可以看看这些文章：Vue3 Compiler 优化细节，如何手写高性能渲染函数，[聊聊 Vue.js 3.0 的模板编译优化](https://mp.weixin.qq.com/s?__biz=MzIxNDc4MjEzNw==&mid=2247484247&idx=1&sn=d10b28de9e0a739ce427c6104a213e60&scene=21#wechat_redirect)，以及尤雨溪的解读视频：Vue 之父尤雨溪深度解读 Vue3.0 的开发思路，以后我也会单独写一些文章分析 Vue3 的模板编译优化。

### 总结

希望你能通过这篇文章了解一些常见的 Vue 性能优化方式并理解其背后的原理，在日常开发中不仅要能写出代码，还要能知道这样写的好处 / 坏处是什么，避免写出容易产生性能问题的代码。

这篇文章的内容并不是全部的优化方式。除了文章涉及的这些，还有打包优化、异步加载，懒加载等等。性能优化并不是一下子就完成的，需要你结合项目分析出性能瓶颈，找到问题并解决，在这个过程中，你肯定能发掘出更多优化方式。

最后，这篇文章写了很长时间，花费了很多精力，如果你觉得对你有帮助的话，麻烦点个赞⭐，支持下，感谢！

### 相关推荐

以下是本文有参考或者相关的文章：

1.  还在看那些老掉牙的性能优化文章么？这些最新性能指标了解下
    
2.  揭秘 Vue.js 九个性能优化技巧
    
3.  Vue 应用性能优化指南
    
4.  为什么 Vue 中不要用 index 作为 key？（diff 算法详解）
    
5.  Vue2 编译 - optimize 标记静态节点
    
6.  Vue3 Compiler 优化细节，如何手写高性能渲染函数
    
7.  Vue2.6 针对插槽的性能优化
    
8.  [聊聊 Vue.js 3.0 的模板编译优化](https://mp.weixin.qq.com/s?__biz=MzIxNDc4MjEzNw==&mid=2247484247&idx=1&sn=d10b28de9e0a739ce427c6104a213e60&scene=21#wechat_redirect)
    
9.  「前端进阶」高性能渲染十万条数据 (时间分片)
    
10.  Vue 之父尤雨溪深度解读 Vue3.0 的开发思路
    

以下是可以实时查看编译结果的工具：

1.  Vue2 Template Explorer
    
2.  Vue3 Template Explorer