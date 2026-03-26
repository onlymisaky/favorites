> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Lbad9bo59cKkMk8WNaXcGA)

> 本文适合对前端使用到的设计模式感兴趣的小伙伴阅读

欢迎关注**前端早茶**，与广东靓仔携手共同进阶～

一、什么是设计模式？
----------

设计模式是一套被反复使用、多数人知晓、经过分类编目的、代码设计经验的总结。它是为了可重用代码，让代码更容易的被他人理解并保证代码的可靠性。

    设计模式实际上是 “拿来主义” 在软件领域的贯彻实践，它是一套现成的工具，拿来即用。下面来看一下设计模式的设计原则。

二、设计几个原则
--------

    单一职责原则、开放封闭原则、里式替换原则、接口隔离原则 、依赖反转原则 、最少知识原则

下面我们一起来看看几种在前端领域常见的设计模式：

单例模式、工厂模式、策略模式、代理模式、适配器模式、观察者模式 / 发布 - 订阅模式

  

三、常见的设计模式及实际案例
--------------

单例模式
----

**1. 什么是单例模式？**

单例模式 （Singleton Pattern）又称为单体模式，保证一个类只有一个实例，并提供一个访问它的全局访问点。也就是说，第二次使用同一个类创建新对象的时候，应该得到与第一次创建的对象完全相同的对象。

  

**Vue 中的单例模式**

  

（1）Element UI

Element UI 是使用 Vue 开发的一个前端 UI 框架。ElementUI 中的全屏 Loading 蒙层调用有两种形式：

●指令形式：Vue.use(Loading.directive)

●服务形式：Vue.prototype.$loading = service

指令形式注册的使用方式 ：

```
<div :v-loading.fullscreen="true">...</div>；
```

服务形式注册的使用方式 ：

```
this.$loading({ fullscreen: true });
```

用服务方式使用全屏 Loading 是单例的，即在前一个全屏 Loading 关闭前再次调用全屏 Loading，并不会创建一个新的 Loading 实例，而是返回现有全屏 Loading 的实例。

下面是 ElementUI 实现全屏 Loading 的源码：

```
import Vue from 'vue'import loadingVue from './loading.vue'const LoadingConstructor = Vue.extend(loadingVue)let fullscreenLoadingconst Loading = (options = {}) => {    if (options.fullscreen && fullscreenLoading) {        return fullscreenLoading    }    let instance = new LoadingConstructor({        el: document.createElement('div'),        data: options    })    if (options.fullscreen) {        fullscreenLoading = instance    }    return instance}export default Loading
```

这里的单例是 fullscreenLoading，是存放在闭包中的，如果用户传的 options 的 fullscreen 为 true 且已经创建了单例，则直接返回之前创建的单例，如果之前没有创建过，则创建单例并赋值给闭包中的 fullscreenLoading 后返回新创建的单例实例。

#### （2）Vuex

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。Vuex，它们都实现了一个全局的 Store 用于存储应用的所有状态。这个 Store 的实现，正是单例模式的典型应用。

  
Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。至此它便作为一个 “唯一数据源 (SSOT)” 而存在。这也意味着，每个应用将仅仅包含一个 store 实例。单一状态树让我们能够直接地定位任一特定的状态片段，在调试的过程中也能轻易地取得整个当前应用状态的快照。 ——Vuex 官方文档

```
// 安装vuex插件Vue.use(Vuex)// 将store注入到Vue实例中new Vue({    el: '#app',    store})
```

通过调用 Vue.use() 方法，安装了 Vuex 插件。Vuex 插件是一个对象，它在内部实现了一个 install 方法，这个方法会在插件安装时被调用，从而把 Store 注入到 Vue 实例里去。也就是说每 install 一次，都会尝试给 Vue 实例注入一个 Store。

```
let Vue // 这个Vue的作用和楼上的instance作用一样...export function install (_Vue) {  // 判断传入的Vue实例对象是否已经被install过Vuex插件（是否有了唯一的state）  if (Vue && _Vue === Vue) {    if (process.env.NODE_ENV !== 'production') {      console.error(        '[vuex] already installed. Vue.use(Vuex) should be called only once.'      )    }    return  }  // 若没有，则为这个Vue实例对象install一个唯一的Vuex  Vue = _Vue  // 将Vuex的初始化逻辑写进Vue的钩子函数里  applyMixin(Vue)}
```

可以保证一个 Vue 实例（即一个 Vue 应用）只会被 install 一次 Vuex 插件，所以每个 Vue 实例只会拥有一个全局的 Store。

工厂模式
----

**1. 什么是工厂模式？**

工厂模式就是根据不用的输入返回不同的实例，一般用来创建同一类对象，它的主要思想就是将对象的创建与对象的实现分离。  
在创建对象时，不暴露具体的逻辑，而是将逻辑封装在函数中，那么这个函数就可以被视为一个工厂。工厂模式根据抽象程度的不同可以分为：简单工厂、工厂方法、抽象工厂。

  

 **Vue 中的工厂模式**

  

（1）VNode

和原生的 document.createElement 类似，Vue 这种具有虚拟 DOM 树（Virtual Dom Tree）机制的框架在生成虚拟 DOM 的时候，提供了 createElement 方法用来生成 VNode，用来作为真实 DOM 节点的映射：

```
createElement('h3', { class: 'main-title' }, [    createElement('img', { class: 'avatar', attrs: { src: '../avatar.jpg' } }),    createElement('p', { class: 'user-desc' }, 'hello world')])
```

createElement 函数结构大概如下：

```
class Vnode (tag, data, children) { ... }function createElement(tag, data, children) {      return new Vnode(tag, data, children)}
```

  

（2）vue-route

在 Vue 在路由创建模式中，也多次用到了工厂模式：

```
export default class VueRouter {    constructor(options) {        this.mode = mode    // 路由模式                switch (mode) {           // 简单工厂            case 'history':       // history 方式                this.history = new HTML5History(this, options.base)                break            case 'hash':          // hash 方式                this.history = new HashHistory(this, options.base, this.fallback)                break            case 'abstract':      // abstract 方式                this.history = new AbstractHistory(this, options.base)                break            default:                // ... 初始化失败报错        }    }}
```

mode 是路由创建的模式，这里有三种 History、Hash、Abstract，其中，History 是 H5 的路由方式，Hash 是路由中带 # 的路由方式，Abstract 代表非浏览器环境中路由方式，比如 Node、weex 等；this.history 用来保存路由实例，vue-router 中使用了工厂模式的思想来获得响应路由控制类的实例。

策略模式
----

**1. 什么是策略模式？**

策略模式 （Strategy Pattern）又称政策模式，其定义一系列的算法，把它们一个个封装起来，并且使它们可以互相替换。封装的策略算法一般是独立的，策略模式根据输入来调整采用哪个算法。关键是策略的实现和使用分离。

  

**策略模式的实际应用**

  

（1）表格 formatter

  

Element UI 的表格控件的 Column 接受一个 formatter 参数，用来格式化内容，其类型为函数，并且还可以接受几个特定参数，像这样：Function(row, column, cellValue, index)。

以文件大小转化为例，后端经常会直接传 bit 单位的文件大小，那么前端需要根据后端的数据，根据需求转化为自己需要的单位的文件大小，比如 KB/MB。

  

首先实现文件计算的算法：

```
export const StrategyMap = {    // Strategy 1: 将文件大小（bit）转化为 KB     bitToKB: val => {        const num = Number(val)        return isNaN(num) ? val : (num / 1024).toFixed(0) + 'KB'    },    // Strategy 2: 将文件大小（bit）转化为 MB     bitToMB: val => {        const num = Number(val)        return isNaN(num) ? val : (num / 1024 / 1024).toFixed(1) + 'MB'    }}// Context: 生成el表单 formatter const strategyContext = function(type, rowKey){   return function(row, column, cellValue, index){      StrategyMap[type](row[rowKey])  }}export default strategyContext
```

在组件中直接使用：

```
<template>    <el-table :data="tableData">        <el-table-column prop="date" label="日期"></el-table-column>        <el-table-column prop="name" label="文件名"></el-table-column>        <!-- 直接调用 strategyContext -->        <el-table-column prop="sizeKb" label="文件大小(KB)"                         :formatter='strategyContext("bitToKB", "sizeKb")'>        </el-table-column>        <el-table-column prop="sizeMb" label="附件大小(MB)"                         :formatter='strategyContext("bitToMB", "sizeMb")'>        </el-table-column>    </el-table></template><script type='text/javascript'>    import strategyContext from './strategyContext.js'        export default {        name: 'ElTableDemo',        data() {            return {                strategyContext,                tableData: [                    { date: '2019-05-02', name: '文件1', sizeKb: 1234, sizeMb: 1234426 },                    { date: '2019-05-04', name: '文件2', sizeKb: 4213, sizeMb: 8636152 }]            }        }    }</script><style scoped></style>
```

  

运行结果如下图

![](https://mmbiz.qpic.cn/mmbiz_png/ic5A4V8PX4Plc3WI6cgbTrdBOqfwZc8EHRvff9r9FZAdZOhaIKTOy347OpWia5S5gfj0yRZ7pBUhR4tlQrCatsdg/640?wx_fmt=png)

  

（2）表单验证

除了表格中的 formatter 之外，策略模式也经常用在表单验证的场景。Element UI 的 Form 表单 具有表单验证功能，用来校验用户输入的表单内容。实际需求中表单验证项一般会比较复杂，所以需要给每个表单项增加 validator 自定义校验方法。

  

实现通用的表单验证方法：

```
// src/utils/validates.js// 姓名校验 由2-10位汉字组成 export function validateUsername(str) {    const reg = /^[\u4e00-\u9fa5]{2,10}$/    return reg.test(str)}// 手机号校验 由以1开头的11位数字组成  export function validateMobile(str) {    const reg = /^1\d{10}$/    return reg.test(str)}// 邮箱校验 export function validateEmail(str) {    const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/    return reg.test(str)}
```

增加一个柯里化方法，用来生成表单验证函数：

```
// src/utils/index.jsimport * as Validates from './validates.js'// 生成表格自定义校验函数 export const formValidateGene = (key, msg) => (rule, value, cb) => {    if (Validates[key](value)) {        cb()    } else {        cb(new Error(msg))    }}
```

具体使用：  

```
<template>    <el-form ref="ruleForm"             label-width="100px"             class="demo-ruleForm"             :rules="rules"             :model="ruleForm">                <el-form-item label="用户名" prop="username">            <el-input v-model="ruleForm.username"></el-input>        </el-form-item>                <el-form-item label="手机号" prop="mobile">            <el-input v-model="ruleForm.mobile"></el-input>        </el-form-item>                <el-form-item label="邮箱" prop="email">            <el-input v-model="ruleForm.email"></el-input>        </el-form-item>    </el-form></template><script type='text/javascript'>    import * as Utils from '../utils'        export default {        name: 'ElTableDemo',        data() {            return {                ruleForm: { pass: '', checkPass: '', age: '' },                rules: {                    username: [{                        validator: Utils.formValidateGene('validateUsername', '姓名由2-10位汉字组成'),                        trigger: 'blur'                    }],                    mobile: [{                        validator: Utils.formValidateGene('validateMobile', '手机号由以1开头的11位数字组成'),                        trigger: 'blur'                    }],                    email: [{                        validator: Utils.formValidateGene('validateEmail', '不是正确的邮箱格式'),                        trigger: 'blur'                    }]                }            }        }    }</script>
```

效果如图：  

![](https://mmbiz.qpic.cn/mmbiz_png/ic5A4V8PX4Plc3WI6cgbTrdBOqfwZc8EH4BeLKsnluJL7oUq9bLa6SicOic3vHtrROsm82YyaB8cmg5LdgbSOyssg/640?wx_fmt=png)

代理模式
----

**1. 什么是代理模式？**

代理模式 （Proxy Pattern）又称委托模式，它为目标对象创造了一个代理对象，以控制对目标对象的访问。  
代理模式把代理对象插入到访问者和目标对象之间，从而为访问者对目标对象的访问引入一定的间接性。正是这种间接性，给了代理对象很多操作空间，比如在调用目标对象前和调用后进行一些预操作和后操作，从而实现新的功能或者扩展目标的功能。

  

**代理模式在实战中的应用**

  

（1）拦截器

在项目中经常使用 Axios 的实例来进行 HTTP 的请求，使用拦截器 interceptor 可以提前对 request 请求和 response 返回进行一些预处理，比如：  
1、request 请求头的设置，和 Cookie 信息的设置；  
2、权限信息的预处理，常见的比如验权操作或者 Token 验证；  
3、数据格式的格式化，比如对组件绑定的 Date 类型的数据在请求前进行一些格式约定好的序列化操作；  
4、空字段的格式预处理，根据后端进行一些过滤操作；  
5、response 的一些通用报错处理，比如使用 Message 控件抛出错误；

除了 HTTP 相关的拦截器之外，还有路由跳转的拦截器，可以进行一些路由跳转的预处理等操作。

（2）前端框架的数据响应式化

Vue 2.x 中通过 Object.defineProperty 来劫持各个属性的 setter/getter，在数据变动时，通过发布 - 订阅模式发布消息给订阅者，触发相应的监听回调，从而实现数据的响应式化，也就是数据到视图的双向绑定。  
为什么 Vue 2.x 到 3.x 要从 Object.defineProperty 改用 Proxy 呢，是因为前者的一些局限性，导致的以下缺陷：  
1 无法监听利用索引直接设置数组的一个项，例如：vm.items[indexOfItem] = newValue；  
2 无法监听数组的长度的修改，例如：vm.items.length = newLength；  
3 无法监听 ES6 的 Set、WeakSet、Map、WeakMap 的变化；  
4 无法监听 Class 类型的数据；  
5 无法监听对象属性的新加或者删除；

适配器模式
-----

**1. 什么是适配器模式？**

适配器模式（Adapter Pattern）又称包装器模式，将一个类（对象）的接口（方法、属性）转化为用户需要的另一个接口，解决类（对象）之间接口不兼容的问题。  
主要功能是进行转换匹配，目的是复用已有的功能，而不是来实现新的接口。也就是说，访问者需要的功能应该是已经实现好了的，不需要适配器模式来实现，适配器模式主要是负责把不兼容的接口转换成访问者期望的格式而已。

  

**适配器的实际案例**

（1）Vue 计算属性

  

Vue 中的计算属性也是一个适配器模式的实例，以官网的例子为例：

```
<template>    <div id="example">        <p>Original message: "{{ message }}"</p>  <!-- Hello -->        <p>Computed reversed message: "{{ reversedMessage }}"</p>  <!-- olleH -->    </div></template><script type='text/javascript'>    export default {        name: 'demo',        data() {            return {                message: 'Hello'            }        },        computed: {            reversedMessage: function() {                return this.message.split('').reverse().join('')            }        }    }</script>
```

对原有数据并没有改变，只改变了原有数据的表现形式。

  

（2） 源码中的适配器模式

Axios 的用来发送请求的 adapter 本质上是封装浏览器提供的 API XMLHttpRequest。

```
module.exports = function xhrAdapter(config) {    return new Promise(function dispatchXhrRequest(resolve, reject) {        var requestData = config.data        var requestHeaders = config.headers                var request = new XMLHttpRequest()                // 初始化一个请求        request.open(config.method.toUpperCase(),          buildURL(config.url, config.params, config.paramsSerializer), true)                // 设置最大超时时间        request.timeout = config.timeout                // readyState 属性发生变化时的回调        request.onreadystatechange = function handleLoad() { ... }                // 浏览器请求退出时的回调        request.onabort = function handleAbort() { ... }                // 当请求报错时的回调        request.onerror = function handleError() { ... }                // 当请求超时调用的回调        request.ontimeout = function handleTimeout() { ... }                // 设置HTTP请求头的值        if ('setRequestHeader' in request) {            request.setRequestHeader(key, val)        }                // 跨域的请求是否应该使用证书        if (config.withCredentials) {            request.withCredentials = true        }                // 响应类型        if (config.responseType) {            request.responseType = config.responseType        }                // 发送请求        request.send(requestData)    })}
```

这个模块主要是对请求头、请求配置和一些回调的设置，并没有对原生的 API 有改动，所以也可以在其他地方正常使用。这个适配器可以看作是对 XMLHttpRequest 的适配，是用户对 Axios 调用层到原生 XMLHttpRequest 这个 API 之间的适配层。

观察者模式 / 发布 - 订阅模式
-----------------

**1. 什么是观察者模式？**

观察者模式（Observer Pattern）定义了一种一对多的关系，让多个订阅者对象同时监听某一个发布者，或者叫主题对象，这个主题对象的状态发生变化时就会通知所有订阅自己的订阅者对象，使得它们能够自动更新自己。

  

2**. 什么是发布 - 订阅模式？**

其实它是发布订阅模式的一个别名，但两者又有所不同。这个别名非常形象地诠释了观察者模式里两个核心的角色要素——发布者和订阅者。

**发布 - 订阅模式有一个调度中心**

![](https://mmbiz.qpic.cn/mmbiz_png/ic5A4V8PX4Plc3WI6cgbTrdBOqfwZc8EHMhicMSiawfhIGk7Mqh8V5F9lMrvO1y2j1JpVdwbjsC3NkkVShIo6GLVg/640?wx_fmt=png)

观察者模式是由具体目标调度的，而发布 - 订阅模式是统一由调度中心调的

**Vue 中的发布 - 订阅模式**

  

（1）EventBus

  

在 Vue 中有一套事件机制，其中一个用法是 EventBus。可以使用 EventBus 来解决组件间的数据通信问题。

#### 1. 创建事件中心管理组件之间的通信

```
// event-bus.jsimport Vue from 'vue'export const EventBus = new Vue()
```

#### 2. 发送事件

```
<template>  <div>    <first-com></first-com>    <second-com></second-com>  </div></template><script>import firstCom from './firstCom.vue'import secondCom from './secondCom.vue'export default {  components: { firstCom, secondCom }}</script>
```

firstCom 组件中发送事件：

```
<template>  <div>    <button @click="add">加法</button>      </div></template><script>import {EventBus} from './event-bus.js' // 引入事件中心export default {  data(){    return{      num:0    }  },  methods:{    add(){      EventBus.$emit('addition', {        num:this.num++      })    }  }}</script>
```

#### 3. 接收事件

在 secondCom 组件中发送事件：

```
<template>  <div>求和: {{count}}</div></template><script>import { EventBus } from './event-bus.js'export default {  data() {    return {      count: 0    }  },  mounted() {    EventBus.$on('addition', param => {      this.count = this.count + param.num;    })  }}</script>
```

  

（2）Vue 源码

发布 - 订阅模式在源码中应用很多，比如双向绑定机制的场景

![](https://mmbiz.qpic.cn/mmbiz_png/ic5A4V8PX4Plc3WI6cgbTrdBOqfwZc8EHh82zibSIXDcG4uVBcFSPibiaIHy0SDGZw48lOTzUQfaZuw96fiany49ddw/640?wx_fmt=png)

响应式化大致就是使用 Object.defineProperty 把数据转为 getter/setter，并为每个数据添加一个订阅者列表的过程。这个列表是 getter 闭包中的属性，将会记录所有依赖这个数据的组件。也就是说，响应式化后的数据相当于发布者。

每个组件都对应一个 Watcher 订阅者。当每个组件的渲染函数被执行时，都会将本组件的 Watcher 放到自己所依赖的响应式数据的订阅者列表里，这就相当于完成了订阅，一般这个过程被称为依赖收集（Dependency Collect）。  
组件渲染函数执行的结果是生成虚拟 DOM 树（Virtual DOM Tree），这个树生成后将被映射为浏览器上的真实的 DOM 树，也就是用户所看到的页面视图。  
当响应式数据发生变化的时候，也就是触发了 setter 时，setter 会负责通知（Notify）该数据的订阅者列表里的 Watcher，Watcher 会触发组件重渲染（Trigger re-render）来更新（update）视图。

Vue 的源码：

```
// src/core/observer/index.js 响应式化过程Object.defineProperty(obj, key, {    enumerable: true,    configurable: true,    get: function reactiveGetter() {        // ...        const value = getter ? getter.call(obj) : val // 如果原本对象拥有getter方法则执行        dep.depend()                     // 进行依赖收集，dep.addSub        return value    },    set: function reactiveSetter(newVal) {        // ...        if (setter) { setter.call(obj, newVal) }    // 如果原本对象拥有setter方法则执行        dep.notify()               // 如果发生变更，则通知更新    }})
```

  

本文转载自：https://www.cnblogs.com/cczlovexw/p/16899624.html

  

![](https://mmbiz.qpic.cn/mmbiz_png/D7MJlTPSSr6Oa72xMxnt7RPsQtO1D57IAib9HJAvDCTkxtAqwY6KZACpmdKNmDicNjb0hKiaicZIx1F1gnibbJ0Zmmw/640?wx_fmt=png)

面试题库推荐

  [百度某部门面试原题](http://mp.weixin.qq.com/s?__biz=Mzg3ODAyNDI0OQ==&mid=2247488042&idx=1&sn=38beca082c6c15d8c34337c341d939a2&chksm=cf1b517cf86cd86a48d1bde5372e24c16d2d78a432ac04f0a475a98f555534dec8ab4a1cb5cb&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_png/US10Gcd0tQHPicsvHJNw24sa8QTMZOa4ugfmq6V4LP0EcOfPvPX541nslney3MMhdw4uJzygunTfAtu4NRFaicDQ/640?wx_fmt=png)

  [某中型公司面试原题](http://mp.weixin.qq.com/s?__biz=Mzg3ODAyNDI0OQ==&mid=2247488114&idx=1&sn=40c3e2bff905b73e9a2363de1f30d881&chksm=cf1b5124f86cd832729a482db52c8b403a0f6f263dd90b49308dd59a209f7981c7bcfdb87682&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_png/6aVaON9Kibf6ouXic7Uuc3Q22Yho6GQp2ESgu6l68tycQYQPPAZtZiajdeiaHghFg8N5GlWNX8k28VYPbh1JK31Mgw/640?wx_fmt=png)

  [【精品】前端知识梳理](http://mp.weixin.qq.com/s?__biz=Mzg3ODAyNDI0OQ==&mid=2247487802&idx=1&sn=63d278fedf65f1453bc29de8fd2a6f24&chksm=cf1b526cf86cdb7aa1522b58b542601491a64a38330d1f0eaecc5ec87c122047eabb8b6df1ed&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_png/6aVaON9Kibf6ouXic7Uuc3Q22Yho6GQp2ESgu6l68tycQYQPPAZtZiajdeiaHghFg8N5GlWNX8k28VYPbh1JK31Mgw/640?wx_fmt=png)

四、最后
----

通过学习这些应用在前端的常见设计模式，可以加深我们的理解。在平时对代码进行封装的时候，可以多多参考这些例子。

****关注我，一起携手进阶****

看完文章后记得**点下赞**或者**在看**