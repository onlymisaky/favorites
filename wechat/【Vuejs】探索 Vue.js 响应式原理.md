> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/hBQbEyoRuTL34L-EsCeEOA)

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdwiakMPsA9hicq1P2eKSiaINCZonD7jN3dHK2G8AciaRJw9Zf1Xfl6LuRKQ/640?wx_fmt=png)

提到 “响应式” 三个字，大家立刻想到啥？响应式布局？响应式编程？

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdIMhntylBTg4JbIbJGUAgxLjoM3NScEVpFrCIR2ssL8FribemO4HlWJw/640?wx_fmt=png)从字面意思可以看出，具有 “响应式” 特征的事物会根据条件变化，使得目标自动作出对应变化。比如在 “响应式布局” 中，页面根据不同设备尺寸自动显示不同样式。

Vue.js 中的响应式也是一样，当数据发生变化后，使用到该数据的视图耶会相应进行自动更新。

接下来我根据个人理解，和大家一起探索下 Vue.js 中的响应式原理，如有错误，欢迎指点😺~~

一、Vue.js 响应式的使用
---------------

现在有个很简单的需求，点击页面中 “leo” 文本后，文本内容修改为 “你好，前端自习课”。

我们可以直接操作 DOM，来完成这个需求：

```
<span id="name">leo</span>
```

```
const node = document.querySelector('#name')node.innerText = '你好，前端自习课';
```

实现起来比较简单，当我们需要修改的数据有很多时（比如相同数据被多处引用），这样的操作将变得复杂。

既然说到 Vue.js，我们就来看看 Vue.js 怎么实现上面需求：

```
<template>
  <div id="app">
    <span @click="setName">{{ name }}</span>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      name: "leo",
    };
  },
  methods: {
    setName() {
      this.name = "你好，前端自习课";
    },
  },
};
</script>
```

观察上面代码，我们**通过改变数据，来自动更新视图**。当我们有多个地方引用这个 `name` 时，视图都会自动更新。

```
<template>
  <div id="app">
    <span @click="setName">{{ name }}</span>
    <span>{{ name }}</span>
    <span>{{ name }}</span>
    <span>{{ name }}</span>
  </div>
</template>
```

当我们使用目前主流的前端框架 Vue.js 和 React 开发业务时，**只需关注页面数据如何变化，因为数据变化后，视图也会自动更新**，这让我们从繁杂的 DOM 操作中解脱出来，提高开发效率。

二、回顾观察者模式
---------

前面反复提到 “**通过改变数据，来自动更新视图**”，换个说法就是 “**数据改变后，使用该数据的地方被动发生响应，更新视图**”。

是不是有种熟悉的感觉？数据无需关注自身被多少对象引用，只需在数据变化时，通知到引用的对象即可，引用的对象作出响应。恩，有种观察者模式的味道？

> 关于观察者模式，可阅读我之前写的[《图解设计模式之观察者模式（TypeScript）》](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458456667&idx=1&sn=af54438be99d8a48e562f5f98aa37a74&chksm=b1c2327286b5bb64263fbd768d6b6fdcaf7208ed8b126562f74414926474f8af0f8423ac0894&scene=21#wechat_redirect)。

### 1. 观察者模式流程

观察者模式表示一种 “**一对多**” 的关系，n 个观察者关注 1 个被观察者，被观察者可以主动通知所有观察者。接下图：

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpd1ouoOe4OoQGs5FQ5hib83CicfAiaF32ddW8KC1oiculd4uictWMf49hqNOw/640?wx_fmt=png)在这张图中，粉丝想及时收到 “前端自习课” 最新文章，只需关注即可，“前端自习课”有新文章，会主动推送给每个粉丝。该过程中，“前端自习课”是被观察者，每位 “粉丝” 是观察者。

### 2. 观察者模式核心

观察者模式核心组成包括：n 个观察者和 1 个被观察者。这里实现一个简单观察者模式：

#### 2.1 定义接口

```
// 观察目标接口interface ISubject {    addObserver: (observer: Observer) => void; // 添加观察者    removeObserver: (observer: Observer) => void; // 移除观察者    notify: () => void; // 通知观察者}// 观察者接口interface IObserver {    update: () => void;}
```

#### 2.2 实现被观察者类

```
// 实现被观察者类class Subject implements ISubject {    private observers: IObserver[] = [];    public addObserver(observer: IObserver): void {        this.observers.push(observer);    }    public removeObserver(observer: IObserver): void {        const idx: number = this.observers.indexOf(observer);        ~idx && this.observers.splice(idx, 1);    }    public notify(): void {        this.observers.forEach(observer => {            observer.update();        });    }}
```

#### 2.3 实现观察者类

```
// 实现观察者类class Observer implements IObserver {    constructor(private name: string) { }    update(): void {        console.log(`${this.name} has been notified.`);    }}
```

#### 2.4 测试代码

```
function useObserver(){    const subject: ISubject = new Subject();    const Leo = new Observer("Leo");    const Robin = new Observer("Robin");    const Pual = new Observer("Pual");    subject.addObserver(Leo);    subject.addObserver(Robin);    subject.addObserver(Pual);    subject.notify();    subject.removeObserver(Pual);    subject.notify();}useObserver();// [LOG]: "Leo has been notified." // [LOG]: "Robin has been notified." // [LOG]: "Pual has been notified." // [LOG]: "Leo has been notified." // [LOG]: "Robin has been notified."
```

三、回顾 Object.defineProperty()
----------------------------

Vue.js 的数据响应式原理是基于 JS 标准内置对象方法 `Object.defineProperty()` 方法来实现，该方法不兼容 IE8 和 FF22 及以下版本浏览器，这也是为什么 Vue.js 只能在这些版本之上的浏览器中才能运行的原因。

理解 `Object.defineProperty()` 对我们理解 Vue.js 响应式原理**非常重要**。

> Vue.js 3 使用 `proxy` 方法实现响应式，两者类似，我们只需搞懂`Object.defineProperty()` ， `proxy` 也就差不多理解了。

### 1. 概念介绍

`Object.defineProperty()` 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象。 语法如下：

```
Object.defineProperty(obj, prop, descriptor)
```

*   入参说明：
    

`obj` ：要定义属性的**源对象**；`prop` ：要定义或修改的**属性名称**或 **Symbol**；`descriptor` ：要定义或修改的**属性描述符**，包括 `configurable`、`enumerable`、`value`、`writable`、`get`、`set`，具体的可以去参阅文档；

*   出参说明：
    

修改后的源对象。

举个简单🌰例子：

```
const leo = {};Object.defineProperty(leo, 'age', {     value: 18,    writable: false})console.log(leo.age); // 18leo.age = 22;console.log(leo.age); // 22
```

### 2. 实现 getter/setter

我们知道 `Object.defineProperty()` 方法第三个参数是属性描述符（`descriptor`），支持设置 `get` 和 `set` 描述符：

*   `get` 描述符：当**访问该属性**时，会调用此函数，默认值为 `undefined` ；
    
*   `set` 描述符：当**修改该属性**时，会调用此函数，默认值为 `undefined` 。
    

> 一旦对象拥有了 getter/setter 方法，我们可以简单将该对象称为响应式对象。

这两个操作符为我们提供拦截数据进行操作的可能性，修改前面示例，添加 getter/setter 方法：

```
let leo = {}, age = 18;Object.defineProperty(leo, 'age', {     get(){        // to do something       console.log('监听到请求数据');        return age;    },    set(newAge){        // to do something       console.log('监听到修改数据');        age = newAge > age ? age : newAge    }})leo.age = 20;  // 监听到修改数据console.log(leo.age); // 监听到请求数据  // 18leo.age = 10;  // 监听到修改数据console.log(leo.age); // 监听到请求数据  // 10
```

访问 `leo` 对象的 `age` 属性，会通过 `get` 描述符处理，而修改 `age` 属性，则会通过 `set` 描述符处理。

四、实现简单的数据响应式
------------

通过前面两个小节，我们复习了 “观察者模式” 和“`Object.defineProperty()`” 方法，这两个知识点在 Vue.js 响应式原理中非常重要。

接下来我们来实现一个很简单的数据响应式变化，需求如下：点击 “更新数据” 按钮，文本更新。

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdOJLDQxttHDAaNk3q2QmusxaicOwmz3XShgFcZTQt3Mf0AfyeiavZRdVw/640?wx_fmt=png)

接下来我们将实现三个类：

*   `Dep` 被观察者类，用来生成被观察者；
    
*   `Watcher` 观察者类，用来生成观察者；
    
*   `Observer` 类，**将普通数据转换为响应式数据，从而实现响应式对象**。
    

用一张图来描述三者之间关系，现在看不懂没关系，这小节看完可以再回顾这张图：![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdc4RRqf7EJzolwopHPu7dicWWPTl2xvpHsN7NibpZb42CZzGaUgbhmFTQ/640?wx_fmt=png)

### 1. 实现精简观察者模式

这里参照前面复习 “观察者模式” 的示例，做下精简：

```
// 实现被观察者类class Dep {    constructor() {        this.subs = [];    }    addSub(watcher) {        this.subs.push(watcher);    }    notify(data) {        this.subs.forEach(sub => sub.update(data));    }}// 实现观察者类class Watcher {    constructor(cb) {        this.cb = cb;    }    update(data) {        this.cb(data);    }}
```

Vue.js 响应式原理中，**观察者模式起到非常重要的作用**。其中：

*   `Dep` 被观察者类，提供用来收集观察者（ `addSub` ）方法和通知观察者（ `notify` ）方法；
    
*   `Watcher` 观察者类，实例化时支持传入回调（ `cb` ）方法，并提供更新（ `update` ）方法；
    
*     
    

### 2. 实现生成响应式的类

这一步需要实现 `Observer` 类，核心是通过 `Object.defineProperty()` 方法为对象的每个属性设置 getter/setter，目的是**将普通数据转换为响应式数据，从而实现响应式对象**。

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdUbibha5qM8ZO9forBIIWia7NYu8wMJOAECzzeCibXodQKNj0pCoPMTJAw/640?wx_fmt=png)

这里**以最简单的单层对象为例**（下一节会介绍深层对象），如：

```
let initData = {    text: '你好，前端自习课',    desc: '每日清晨，享受一篇前端优秀文章。'};
```

接下来实现 `Observer` 类：

```
// 实现响应式类（最简单单层的对象，暂不考虑深层对象）class Observer {    constructor (node, data) {        this.defineReactive(node, data)    }    // 实现数据劫持（核心方法）    // 遍历 data 中所有的数据，都添加上 getter 和 setter 方法    defineReactive(vm, obj) {        //每一个属性都重新定义get、set        for(let key in obj){            let value = obj[key]， dep = new Dep();            Object.defineProperty(obj, key, {                enumerable: true,                configurable: true,                get() {                    // 创建观察者                    let watcher = new Watcher(v => vm.innerText = v);                    dep.addSub(watcher);                    return value;                },                set(newValue) {                    value = newValue;                    // 通知所有观察者                    dep.notify(newValue);                }            })        }    }}
```

上面代码的核心是 `defineReactive` 方法，它遍历原始对象中每个属性，为每个属性实例化一个被观察者（`Dep`），然后分别调用 `Object.defineProperty()` 方法，为每个属性添加 getter/setter。

*   访问数据时，getter 执行依赖收集（即添加观察者），通过实例化 `Watcher` 创建一个观察者，并执行被观察者的 `addSub()` 方法添加一个观察者；
    
*   修改数据时，setter 执行派发更新（即通知观察者），通过调用被观察者的 `notify()` 方法通知所有观察者，执行观察者 `update()` 方法。
    

### 3. 测试代码

为了方便观察数据变化，我们为 “更新数据” 按钮绑定点击事件来修改数据：

```
<div id="app"></div><button id="update">更新数据</button>
```

测试代码如下：

```
// 初始化测试数据let initData = {    text: '你好，前端自习课',    desc: '每日清晨，享受一篇前端优秀文章。'};const app = document.querySelector('#app');// 步骤1：为测试数据转换为响应式对象new Observer(app, initData);// 步骤2：初始化页面文本内容app.innerText = initData.text;// 步骤3：绑定按钮事件，点击触发测试document.querySelector('#update').addEventListener('click', function(){    initData.text = `我们必须经常保持旧的记忆和新的希望。`;    console.log(`当前时间：${new Date().toLocaleString()}`)})
```

测试代码中，核心在于通过实例化 `Observer`，将测试数据转换为响应式数据，然后模拟数据变化，来观察视图变化。 每次点击 “更新数据” 按钮，在控制台中都能看到 “数据发生变化！” 的提示，说明我们已经能通过 setter 观察到数据的变化情况。![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpderUrONaQR16epBia74tibJFVYFogROwX3HbtAibvictGhCy8IM9aia8un1w/640?wx_fmt=png)

当然，你还可以在控制台手动修改 `initData` 对象中的 `text` 属性，来体验响应式变化~~![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdFBJSQQzbFU0TxN7ic8nbXR3J8lt1HJIiarqCIicnnqG3c1GT7ibMwib9lTw/640?wx_fmt=png)

到这里，我们实现了非常简单的数据响应式变化，当然 Vue.js 肯定没有这么简单，这个先理解，下一节看 Vue.js 响应式原理，思路就会清晰很多。

> 这部分代码，我已经放到我的 Github，地址：https://github.com/pingan8787/Leo-JavaScript/blob/master/Cute-Gist/Vue/Basics-Reactive-Demo.js

可以再回顾下这张图，对整个过程会更清晰：

![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdc4RRqf7EJzolwopHPu7dicWWPTl2xvpHsN7NibpZb42CZzGaUgbhmFTQ/640?wx_fmt=png)

五、Vue.js 响应式实现
--------------

> 本节代码：https://github.com/pingan8787/Leo-JavaScript/blob/master/Cute-Gist/Vue/leo-vue-reactive/

这里大家可以再回顾下下面这张官网经典的图，思考下前面讲的示例。![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpd2vJRTR80IJ6Q33SH9vTiaXdM8GeaicB8PatGpib0jbYcWDhhXDDqR2Iww/640?wx_fmt=png)

（图片来自：https://cn.vuejs.org/v2/guide/reactivity.html）

上一节实现了简单的数据响应式，接下来继续通过完善该示例，实现一个简单的 Vue.js 响应式，测试代码如下：

```
// index.jsconst vm = new Vue({    el: '#app',    data(){        return {            text: '你好，前端自习课',            desc: '每日清晨，享受一篇前端优秀文章。'        }    }});
```

是不是很有内味了，下面是我们最终实现后项目目录：

```
- mini-reactive
 / index.html   // 入口 HTML 文件
  / index.js     // 入口 JS 文件
  / observer.js  // 实现响应式，将数据转换为响应式对象
  / watcher.js   // 实现观察者和被观察者（依赖收集者）
  / vue.js       // 实现 Vue 类作为主入口类
  / compile.js   // 实现编译模版功能
```

知道每一个文件功能以后，接下来将每一步串联起来。

### 1. 实现入口文件

我们首先实现入口文件，包括 `index.html` / `index.js`  2 个简单文件，用来方便接下来的测试。

#### 1.1 index.html

```
<!DOCTYPE html><html lang="en"><head>    <script src="./vue.js"></script>    <script src="./observer.js"></script>    <script src="./compile.js"></script>    <script src="./watcher.js"></script></head><body>    <div id="app">{{text}}</div>    <button id="update">更新数据</button>    <script src="./index.js"></script></body></html>
```

#### 1.2 index.js

```
"use strict";const vm = new Vue({    el: '#app',    data(){        return {            text: '你好，前端自习课',            desc: '每日清晨，享受一篇前端优秀文章。'        }    }});console.log(vm.$data.text)vm.$data.text = '页面数据更新成功！'; // 模拟数据变化console.log(vm.$data.text)
```

### 2. 实现核心入口 vue.js

`vue.js` 文件是我们实现的整个响应式的入口文件，暴露一个 `Vue` 类，并挂载全局。

```
class Vue {    constructor (options = {}) {        this.$el = options.el;        this.$data = options.data();        this.$methods = options.methods;        // [核心流程]将普通 data 对象转换为响应式对象        new Observer(this.$data);        if (this.$el) {            // [核心流程]将解析模板的内容            new Compile(this.$el, this)        }    }}window.Vue = Vue;
```

`Vue` 类入参为一个配置项 `option` ，使用起来跟 Vue.js 一样，包括 `$el` 挂载点、 `$data` 数据对象和 `$methods` 方法列表（本文不详细介绍）。

通过实例化 `Oberser` 类，将普通 data 对象转换为响应式对象，然后判断是否传入 `el` 参数，存在时，则实例化 `Compile` 类，解析模版内容。

总结下 `Vue` 这个类工作流程 ：![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdsastoanIuPt6dHMZKdD5FxxsLQcXUnI8w0EoqianqpxEtYm6FFAywkQ/640?wx_fmt=png)

### 3. 实现 observer.js

observer.js 文件实现了 `Observer` 类，用来将普通对象转换为响应式对象：

```
class Observer {    constructor (data) {        this.data = data;        this.walk(data);    }    // [核心方法]将 data 对象转换为响应式对象，为每个 data 属性设置 getter 和 setter 方法    walk (data) {        if (typeof data !== 'object') return data;        Object.keys(data).forEach( key => {            this.defineReactive(data, key, data[key])        })    }    // [核心方法]实现数据劫持    defineReactive (obj, key, value) {        this.walk(value);  // [核心过程]遍历 walk 方法，处理深层对象。        const dep = new Dep();        Object.defineProperty(obj, key, {            enumerable: true,            configurable: true,            get () {                console.log('[getter]方法执行')                Dep.target &&  dep.addSub(Dep.target);                return value            },            set (newValue) {                console.log('[setter]方法执行')                if (value === newValue) return;                // [核心过程]当设置的新值 newValue 为对象，则继续通过 walk 方法将其转换为响应式对象                if (typeof newValue === 'object') this.walk(newValue);                value = newValue;                dep.notify(); // [核心过程]执行被观察者通知方法，通知所有观察者执行 update 更新            }        })    }}
```

相比较第四节实现的 `Observer` 类，这里做了调整：

*   增加 `walk` 核心方法，用来遍历对象每个属性，分别调用数据劫持方法（ `defineReactive()` ）；
    
*   在 `defineReactive()` 的 getter 中，判断 `Dep.target` 存在才添加观察者，下一节会详细介绍 `Dep.target`；
    
*   在 `defineReactive()` 的 setter 中，判断当前新值（ `newValue` ）是否为对象，如果是，则直接调用 `this.walk()` 方法将当前对象再次转为响应式对象，**处理深层对象**。
    

通过改善后的 `Observer` 类，我们就可以实现**将单层或深层嵌套的普通对象转换为响应式对象**。

### 4. 实现 watcher.js

这里实现了 `Dep` 被观察者类（依赖收集者）和 `Watcher` 观察者类。

```
class Dep {    constructor() {        this.subs = [];    }    addSub(watcher) {        this.subs.push(watcher);    }    notify(data) {        this.subs.forEach(sub => sub.update(data));    }}class Watcher {    constructor (vm, key, cb) {        this.vm = vm;   // vm：表示当前实例        this.key = key; // key：表示当前操作的数据名称        this.cb = cb;   // cb：表示数据发生改变之后的回调        Dep.target = this; // 全局唯一        this.oldValue = this.vm.$data[key]; // 保存变化的数据作为旧值，后续做判断是否更新        Dep.target = null;    }        update () {        console.log(`数据发生变化！`);        let oldValue = this.oldValue;        let newValue = this.vm.$data[this.key];        if (oldValue != newValue) {  // 比较新旧值，发生变化才执行回调            this.cb(newValue, oldValue);        };    }}
```

相比较第四节实现的 `Watcher`  类，这里做了调整：

*   在构造函数中，增加 `Dep.target` 值操作；
    
*   在构造函数中，增加 `oldValue` 变量，保存变化的数据作为旧值，后续做为判断是否更新的依据；
    
*   在 `update()` 方法中，增加当前操作对象 `key` 对应值的新旧值比较，如果不同，才执行回调。
    

`Dep.target` 是**当前全局唯一的订阅者**，因为同一时间只允许一个订阅者被处理。`target` 指**当前正在处理的目标订阅者**，当前订阅者处理完就赋值为 `null` 。这里 `Dep.target` 会在 `defineReactive()` 的 getter 中使用到。

通过改善后的 `Watcher` 类，我们操作当前操作对象 `key` 对应值的时候，可以在数据有变化的情况才执行回调，减少资源浪费。

### 4. 实现 compile.js

compile.js 实现了 Vue.js 的模版编译，如将 HTML 中的 `{{text}}` 模版转换为具体变量的值。

compile.js 介绍内容较多，考虑到篇幅问题，并且本文核心介绍响应式原理，所以这里就暂时不介绍 compile.js 的实现，在学习的朋友可以到我 Github 上下载该文件直接下载使用即可，地址：https://github.com/pingan8787/Leo-JavaScript/blob/master/Cute-Gist/Vue/leo-vue-reactive/compile.js

### 5. 测试代码

到这里，我们已经将第四节的 demo 改造成简易版 Vue.js 响应式，接下来打开 index.html 看看效果：![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdGk5ZHicg4Lib2LyibZ2Nbt0YtHAnfYDSShuLZ0VpKsfsYlXezyv8tbEfw/640?wx_fmt=png)

当 index.js 中执行到：

```
vm.$data.text = '我们必须经常保持旧的记忆和新的希望。';
```

页面便发生更新，页面显示的文本内容从 “**你好，前端自习课**” 更新成 “**我们必须经常保持旧的记忆和新的希望。**”。

到这里，我们的简易版 Vue.js 响应式原理实现好了，能跟着文章看到这里的朋友，给你点个大大的赞👍![](https://mmbiz.qpic.cn/mmbiz_png/dy9CXeZLlCUenf0nfYZEiclLVFDmoFwpdTgql9yeU6KTyvQ4hZqVT9rXTchK9vGYBgqS9Qumz9lLOIm0NLUaqJw/640?wx_fmt=png)

六、总结
----

本文首先通过回顾观察者模式和 `Object.defineProperty()` 方法，介绍 Vue.js 响应式原理的核心知识点，然后带大家通过一个简单示例实现简单响应式，最后通过改造这个简单响应式的示例，实现一个简单 Vue.js 响应式原理的示例。

相信看完本文的朋友，对 Vue.js 的响应式原理的理解会更深刻，希望大家理清思路，再好好回味下~

参考资料
----

1.  官方文档 - 深入响应式原理
    
2.  《浅谈 Vue 响应式原理》
    
3.  《Vue 的数据响应式原理》
    

关于奇舞精选
------

《奇舞精选》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 Ecma 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。