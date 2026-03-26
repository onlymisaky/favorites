> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3U7CvmMpbp8Llm-Tpe5tZA)

> 作者：rorry 
> 
> https://juejin.cn/post/7470354312508260386

本文主角是 Signal，浅谈一下前端框架响应式设计，希望和大家一起多多交流，有错误之处还请指正。先从下面这张图开始

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6JyibO6O0AAX7JSM5MIB0KJqZtic6oL54CjML7QicyZF3gn8DBwW6F0jaNyyA/640?wx_fmt=other&from=appmsg)

这是最新公开的 Signals TC39 提案内容，当前的草案基于 Angular、Bubble、Ember、FAST、MobX、Preact、Qwik、RxJS、Solid、Starbeam、Svelte、Vue、Wiz 等的作者 / 维护者的设计意见。

为什么提议 Singal 成为 Web 标准，我们接着往下看

一、前言
----

我们聊它之前，先来聊一聊前端的框架演进、响应式产生契机，以及响应式的几种方案

<table><thead><tr><th><section>阶段</section></th><th><section>代表</section></th><th><section>描述</section></th></tr></thead><tbody><tr><td><section>HTML/CSS/JS 时代</section></td><td><section>原生 JS</section></td><td><section>在早期，前端开发主要依赖于 HTML、CSS 和 JavaScript 这三种基础技术。开发者需要手动编写大量代码来实现页面的布局和功能。</section></td></tr><tr><td><section>jQuery 时代</section></td><td><section>jQuery</section></td><td><section>随着 jQuery 的出现，前端开发变得更加简便，它简化了 DOM 操作和 Ajax 交互，大大提升了开发效率。</section></td></tr><tr><td><section>MVC 框架</section></td><td><section>Backbone.js、Ember.js</section></td><td><section>随着单页应用（SPA）的流行，出现了如 Backbone.js、Ember.js 等前端 MVC 框架，它们帮助开发者更好地组织代码，分离视图、数据和逻辑。</section></td></tr><tr><td><section>三分天下</section></td><td><section>React、Vue.js 和 Angular</section></td><td><section>以 React、 Vue.js 和 Angular 为代表的现代前端框架，将组件化理念广泛推广和应用，使得代码重用和模块管理变得更加容易。这些框架通常提供了数据绑定、状态管理和虚拟 DOM 等高级功能。</section></td></tr><tr><td><section>新兴框架</section></td><td><section>Svelte、Solidjs、Qwik 等新兴框架</section></td><td><section>近几年也诞生了一些后起之秀，如 Svelte、Solidjs、Qwik 等框架，整个前端框架，呈现百家争鸣的状态。</section></td></tr></tbody></table>

随着框架演进，我们从写法上发生了变化：

从最早的原生开发到早期的 Jquery，使用 命令式的代码 实现页面的更新

```
$("ul li").click(function() {})let li = $("<li>我是一个li</li>");$("ul").append(li);
```

到现在我们通过声明式的代码，通过数据的更新，去触发页面的更新

```
<template>	<ul>  	<li @click="handleClick" v-for="item in list">{{ item }}<li>  <ul><template>const handleClick = (item) => { console.log(item) };const list = [];list.push('我是一个li');
```

我们从命令式的写法，转为了声明式的写法，是框架帮助我们通过组件化的方式，让开发者通过描述 UI 的状态来构建用户界面，而无需手动操作 DOM。**我们通过声明式的写法，直接改变数据，就想要实现页面的更新，这时候响应式机制就出现了。**

目前来看，一个现代的框架，核心逻辑大多是通过写声明式的 UI，通过响应式机制来实现页面的更新，响应式机制是框架的核心，它定义了数据与 DOM 的交互方式，还决定了框架的性能上限，下面就来谈一谈前端的常见的几种响应式机制

二、前端框架响应式几种方案
-------------

### 2.1 脏检查

又称脏数据检测，通过新旧值的对比，来决定是否更新页面

代表： Angular2

```
@Component({  selector: 'app-counter',  template: `    <span>Count: {{ count }} </span>    <button (click)="increase()">Increase</button>  `,})export class Counter {  count = 0;  increase() {    this.count++;  }}
```

从代码上看，点击事件中，直接更新类的属性值，实现页面更新。这种没有任何设定，就可以实现页面响应式更新，这是依靠 Angular 内部依赖 zone.js 提供的变更检测的能力：

Zone.js 变更检测时机：

只要发生了异步操作 (Events, Timer, XHR)，Angular 就会认为有状态可能发生变化了，然后就会进行变更检测。

*   Events:：click，mouseover，mouseout，keyup，keydown 等浏览器事件；
    
*   Timer：setTimeout、setInterval；
    
*   XHR：各类请求等。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6JyibibWxIgYDJ8c7xHBtfQOKDTokkNZlJ7v4GjDpaPGhzx5icCGaH49zNBCA/640?wx_fmt=other&from=appmsg)

Angular onPush 策略：

1.  组件 props 有变更时更新（有点像 react 的 memo）
    
2.  手动调用方法更新
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6JyibYZht2XicItjaHWaux01NY2xMibmdOObIKIxIvdl1WHSmBWVWSY4LWyKA/640?wx_fmt=other&from=appmsg)

playground：https://danielwiehl.github.io/edu-angular-change-detection/

这种全局自动变更检测带来的开发体验其实是最棒的 (更符合面向对象编程直觉，直接更新类属性值，页面发生变化)，但同时也存在下面这几个问题：

1.  性能问题：全局变更检测策略每次都要从根组件向所有子组件检测，性能不好，虽然也提供了 OnPush 策略优化性能。随着应用越来越大，性能问题就变得重要，这种变更检查无法做更细粒度的视图更新
    
2.  无法扩展：zone.js 是一个黑盒，几乎无法扩展，还需要不断的维护浏览器新的 API，如果使用了一些第三方库，频繁绑定浏览器事件容易出现性能问题
    
3.  应用体积：另外 zone.js 增加构建体积（xxx）和运行时间
    

### 2.2 useState

代表：React

```
export function Counter() {  const [count, setCount] = useState(0);  function increase() {    setCount(count + 1);  }  return (    <div>      <span>Count: {count}</span>      <button onClick={increase}>Increase</button>    </div>  );}
```

从代码上看，我们需要依赖 useState ，手动调用 setCount

执行 setCount 方法后，会触发组件的 render 方法，只要组件执行了 setCount 函数都会触发当前组件及子组件的重新渲染，相比于脏检查，把自动的变更检测改为了手动调用 setCount，变更范围从所有子组件变为当前组件及子组件

这种响应式机制，同样存在性能问题，虽然 react 通过 memo 、filber 等机制有所优化，但是这增加了开发者使用成本，同时仍无法做到细粒度的视图更新。

### 2.3 Signal

代表：Vue、Solid、Preact、Qwik、Angular 17、Svelte 5.0(runes)

使用样例，以 solidj.js 为例：

```
export function Counter() {  const [count, setCount] = createSignal(0);  function increase() {    setCount(count() + 1);  }  return (    <div>      <span>Count: {count()}</span>      <button onClick={increase}>Increase</button>    </div>  );}
```

为什么如此多的框架，都选择了 Signal ？

三、Why signal?
-------------

### 3.1 什么是 signal ？

它是一个在访问时（getter）跟踪依赖、在变更时（setter）触发副作用的值容器。

它最早可以追溯到十多年前的 Knockout observables 和 Meteor Tracker 等实现。

它和 useState 之间的主要区别在于 useSignal 返回一个 getter 和一个 setter，而 useState 返回一个 value 和一个 setter。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6Jyibd47Tt2icyMbdLiapSrezlswDhWpsUickcxDeAsxxZRC0t4LNjSt4bQ37A/640?wx_fmt=other&from=appmsg)  

接下来我们通过一个简易版的实现，再深入了解一下 Signal。

### 3.2 简易版 signal 实现

我们看下下面的代码：

```
const [count, setCount] = createSignal(0);console.log(count()); // 0setCount(count() + 1);console.log(count()); // 1
```

从上面代码可以看出，核心是 createSignal 这个函数，创建了一个响应式数据，并返回的响应式数据的 getter、setter

第一步，实现值容器：

```
// createSignal 创建了一个值容器（闭包），返回 getter、setter，实现值的获取和修改export function createSignal(initialValue) {    letvalue = initialValue;   // 获取 Signal value    function get() {        returnvalue;    }   // 修改 Signal value    function set (newValue) {        value = newValue;    }    return [get, set];}
```

很简单，现在我们已经实现了值容器，返回了一个 getter 和 setter ，拥有了创建一个 Signal 的能力。

目前还缺少一些能力：访问时（getter）跟踪依赖、在变更时（setter）触发副作用，增加这样的能力，需要另一个概念 Effects（副作用），响应式数据创建好后，而 Effects 的作用就是消费响应式数据的。我们引入 createEffect 函数，来消费响应式数据：

```
const [count, setCount] = createSignal(0);// 通过 createEffect 包裹的函数，当 count 发生变化时，会自动执行，打印当前 count valuecreateEffect(() => {  console.log('count is', count());});
```

> vue 中的 watch、wathEffect、computed 以及模板更新，也是基于 Effects

第二步，实现访问时（getter）跟踪依赖、在变更时（setter）触发副作用：

```
let current;export function createSignal(initialValue) {    let value = initialValue;    const subscribers = []; // 存储当前 signal 的依赖列表    function get() {        subscribers.push(current); // 跟踪依赖        return value;    }    function set (newValue) {        value = newValue;        subscribers.forEach(sub => sub()); // 触发副作用    }    return [get, set];}export function createEffect(fn) {    current = fn;    fn();// fn 执行 会访问 get 函数，get 函数将 fn 放入依赖列表    current = null;}/***------------ 使用 createSignal---------------**/const [count, setCount] = createSignal(0);createEffect(() => {    console.log(count()); // 执行 get ()，把副作用放入 subscribers});setCount(100); // 执行 set()，执行 subscribers 里所有副作用
```

至此，一个简易版的 signal 实现完了。

流程图：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6JyibRKspzk1LSFAkh2of95iafoVR0iceiaAic83WtILTpKZDcQUp1qcgx9ia4bA/640?wx_fmt=other&from=appmsg)

总结：

1.  createEffect 执行时，会将 current 指向 createEffect 包裹的副作用函数 fn
    
2.  同时，createEffect 执行会调用 fn()， fn 包含了对 count() 的访问，则会触发 get 函数执行
    
3.  getter 函数执行时，会将 current 放入依赖列表，即将副作用函数 fn 放入了依赖列表
    
4.  每次调用 setter 函数时，会触发副作用函数的执行，最终到页面的更新。
    

### 3.3 Signal 的优势

#### 3.3.1 更好的性能

1.  自动追踪依赖，实现细粒度更新
    

对于前端组件开发，不需要更新整个组件，结合更新策略，当依赖项变化时，可以自动追踪到，更新视图或组件内部状态，对视图而言可以带来细粒度的视图更新，提升页面性能。我们都知道 React 在状态发生变化的时候，会重新渲染整个组件，使用 useMemo 可以减少渲染，但一旦判断需要更新，都至少会重新渲染整个组件，Singal 在这一项优势，也是很多框架选择它的原因，当然 Singal 还有很多其他的优势。

1.  惰性求值，减少计算
    

惰性求值是指 Signals 只有在被实际使用时才会被监听和更新，依赖项发生变化时也不会立即求值。这种机制可以显著提高性能，因为它避免了不必要的计算和更新。例如，在 SolidJS 中，createSignal 创建的信号只有在被访问时才会触发依赖追踪和更新

```
import { createSignal, onCleanup } from"solid-js";import { render } from"solid-js/web";const App = () => {const [count, setCount] = createSignal(0);const timer = setInterval(() => setCount(count() + 1), 1000);  onCleanup(() => clearInterval(timer));return<div>{count()}</div>;};render(() =><App />, document.getElementById("app"));
```

在这个例子中，count 信号只有在被访问时才会触发更新，而不是每次 setCount 被调用时都更新

1.  记忆化
    

缓存其最后一个值，以便依赖关系没有变化的计算不需要重新评估，无论访问多少次

#### 3.3.2 更好的开发体验

1.  Signal 可以感知上下文环境，减少了编码心智负担
    

在 React 中，useEffect 在使用时需要指明依赖的状态:

```
useEffect(() => {  // ...state1, state2变化后的逻辑}, [state1, state2])
```

如采用 Signal 实现，能感知到自己在 useEffect 上下文环境，可以自动建立两者之间的联系。

1.  减少开发者性能优化的心智负担
    

使用 Signal 的框架通常能获得不错的运行时性能。所以不需要额外的性能优化 API。反观 React、Angular(17 版本之前)，开发者如果遇到性能问题，需要手动调用性能优化 API（比如 React.memo、useMemo、PureComponent，Angular 的 OnPush）。

#### 3.3.3 更广的适用范围

Signal 就是一个普通的 JS 对象，可以在任何地方使用 Signal，不局限于组件内部，直接绑定 JS Level 的 Signal 状态。

### 3.4 和 Vue ref 有什么不同？

看下作者怎么说，链接

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6JyibZGqib4Qo4yqFWOJt6WRqblpXjiamicrtr6saYVysbxElAqn1s9iaooZV8g/640?wx_fmt=other&from=appmsg)

我们也能从下面这张图得到答案，这是 vue2 的响应式原理图，vue3 中通过 proxy 做代理，整体流程也差不多。和 Signal 相比都是访问时跟踪依赖、在变更时触发副作用的值容器。从根本上说，Signal 是与 Vue 中的 ref 相同的响应性基础类型，换句话说，Vue ref 也是 signal。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zPh0erYjkib1dlHISbIZngBLy9qej6JyibBmfC3Qdm00qmgxJ1a9Djxb4ro0wXZ4bj0QCfFCXrTwS6LDz81M391g/640?wx_fmt=other&from=appmsg)

不过整体来看，有一些设计上的差异：

1.  API 风格不同：
    

*   ()  比 .value 略微省事，但更新值却更冗长；
    
*   没有 ref 解包：总是需要通过 () 来访问值，这使得值的访问在任何地方都是一致的。这也意味着你可以将原始信号作为组件的参数传递下去。
    

```
const state = ref({ count: 1 })console.log(state.value); // 访问值state.value.count = 2 // 更新值state.value = { count: 2 } // 更新值
```

Solid.js:

```
const [count, setCount] = createSignal({ count: 1 })exportfunction Counter() {const [count, setCount] = createSignal({ count: 1 })console.log(count()); // 访问值  setCount({    count: count().count + 1  }) // 更新值return (    <div>      <child count={count}></child>    </div>  );}
```

\2.  不会深层递归地转为响应式，类似与 vue  的 shallowRef，只有对 .value 的访问是响应式的。signal setter 会更新整个对象

```
const state = shallowRef({ count: 1 })// 不会触发更改state.value.count = 2// 会触发更改state.value = { count: 2 }// signal setter 更新整个对象const [count, setCount] = createSignal({ count: 1 })setCount({  count: count().count + 1})
```

在 Vue 中利用 shallowRef 可以实现相同效果的 Signal API 链接：

```
import { shallowRef, triggerRef } from 'vue'export function createSignal(value, options) {  const r = shallowRef(value)  const get = () => r.value  const set = (v) => {    r.value = typeof v === 'function' ? v(r.value) : v    if (options?.equals === false) triggerRef(r)  }  return [get, set]}
```

四、未来趋势
------

在文章开头，signal 成为了标准化提案，不出意外，未来也会成为前端响应式的 web 标准。下面是我认为的两大趋势：

### 4.1 细粒度的视图更新

在 Angular 17 版本，已经正式使用 Signals 作为其响应式机制，优化其渲染更新。

另外再来看看 Svelte。

2019 年 4 月，Svelte 团队发布了一篇 Svelte 3: Rethinking reactivity，文章介绍了 Svelte3 采用编译器实现响应式，即在代码编译阶段确定响应依赖关系，来替代旧版的语法。

旧版语法：

```
const { count } = this.get();function increment() {  this.set({    count: count + 1  });}
```

svelte3 语法：

```
let count = 0;function increment() {	count += 1;}
```

依靠于 svelte 编译检测能力，会大致编译为以下内容：

```
count += 1;$$invalidate('count', count);
```

抛弃了类似 React setState 的语法，Svelte3 Compiler 会吧把赋值的代码通通使用  $$invalidate  包裹起来，每次 increment 函数触发，会触发 invalidate 函数，通过检测标记需要更新的组件，再由统一的队列去更新。Svelte3 响应式更新是也是组件级别的。

有趣的是，在 2023 年 9 月，Svelte 团队又发布了一篇文章：Introducing runes，这篇文章的主题是 Rethinking 'rethinking reactivity'，再次重新思考，他们肯定了 Knockout 一直在做正确的事情，在 Svelte5 将引入了 runes，而这正是基于 Signal 实现。在 SIgnal 的加持下，Svelte5 的速度快得惊人。

### 4.2 无虚拟 DOM

近一两年有不同的声音，觉得虚拟 DOM 反而是渲染性能的累赘，所以也出了一些无虚拟 DOM 的框架，比如 Svelte 和 SolidJS，**也正是因为基于框架的细粒度更新的能力，无虚拟 DOM 变得更加从容。**

Vue Vapor

Vue 由于使用了虚拟 DOM，Vue 目前依靠编译器来实现类似的优化， 编译器可以静态分析模板并在生成的代码中留下标记，使得运行时尽可能地走捷径。Vue 也在探索一种新的受 Solid 启发的编译策略 (Vapor Mode)，它不依赖于虚拟 DOM，而是更多地利用 Vue 的内置响应性系统。

仓库地址： https://github.com/vuejs/core-vapor

在线体验：vapor-repl.netlify.app/

五、结语
----

随着前端技术的不断演进，响应式机制已经成为现代前端框架不可或缺的一部分。从最初的命令式代码到现在的声明式编程，从脏检查到 `useState`，再到如今的 `Signal`，每一步都在推动前端开发向着更高性能、更佳开发体验的方向发展。特别是 `Signal` 的出现，不仅带来了细粒度的视图更新和惰性求值的优势，还极大地简化了开发者的编码工作，提高了应用的性能。

希望本文能帮助你更好地理解前端响应式机制及其未来的发展趋势。如果你有任何问题或建议，欢迎留言讨论，让我们一起探索前端技术的无限可能！

推荐阅读  点击标题可跳转

1、[CSS view()：JavaScript 滚动动画的终结](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651622341&idx=1&sn=5dc03b73d6864264f842bcd7c4865a10&scene=21#wechat_redirect)

2、[实现 Vue3 响应式系统核心 - MVP 模型](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651619600&idx=2&sn=a9ad43d69637956aa08047f579436958&scene=21#wechat_redirect)

3、[细说 Vue 响应式原理的 10 个细节！](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651617424&idx=2&sn=79184da55f6bec9c648f73c3e61b0cff&scene=21#wechat_redirect)