> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/uKPag8uNQ_h37kJ-tnwuPw)

大厂技术  高级前端  Node 进阶

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

什么是 EventBus
------------

EventBus 事件总线是发布订阅设计模式的应用。多个模块 `module1`，`module2`，`module3`都订阅了事件 `EventA` ，然后我们在 `module4` 中通过事件总线发布事件 `EventA` ，事件总线会通知所有订阅者`module1`，`module2`，`module3`，它们收到消息会执行对应函数逻辑，注意这里通知的时候还可以传递 `extraArgs` 参数。

看一下 `EventBus` 的原理图可能更好理解

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZWgSTcsT0P0mfqteufh59GzhPMNV3diaCvuqT3NGQh4huZswrjJib41qJ1yex0k1eTTAcS7MiaHbicqww/640?wx_fmt=png)image.png

面试：手写实现一个 EventBus
------------------

答这道题可以考虑用循序渐进的方式，先实现一个基础版本的 `EventBus` ，然后不断升级完善。

### 基础版本实现

实现核心思路点：

1.  创建一个 `eventMap` 集合用来存储事件，`key` 为 事件名称，`value` 位事件数组列表
    
2.  订阅功能：实现一个`subscribe`订阅函数
    
3.  发布功能：实现一个`emit`发布函数
    

基础版代码实现：

```
class EventBus{    constructor(){        // 用来存储发布订阅事件的集合        this.eventMap = {}    }    /**     *      * @param {事件名称} eventName      * @param {事件函数} funCallback      */     subscribe(eventName,funCallback){        // 判断是否订阅过         if(!Reflect.has(this.eventMap,eventName)){            Reflect.set(this.eventMap,eventName,[])         }         this.eventMap[eventName].push(funCallback);     }    /**     * 发布事件     * @param {事件名称} eventName      * @returns      */     emit(eventName){        if(!Reflect.has(this.eventMap,eventName)){            console.warn(`从未订阅过此事件${eventName}`);            return         }        const callbackList = this.eventMap[eventName];        if(callbackList.length === 0){            console.warn(`事件${eventName}无函数可执行`)            return         }        if(this.eventMap[eventName].length){            for (const fun of this.eventMap[eventName]) {                fun.call(this)            }        }     }}const eventBus = new EventBus();const fun1 = function(){    console.log('11111');}const fun2 = function(){    console.log(222222);}eventBus.subscribe('testName',fun1);eventBus.subscribe('testName',fun2);eventBus.subscribe('testName2',fun2)eventBus.emit('testName');
```

### 升级一（发布函数调用增加参数, 增加最大订阅数量限制）

基于基础版本，升级一新增的功能

1.  发布函数时，需要传递一些额外参数，怎么实现？
    
2.  可以限制每个监听函数的最大数量，怎么实现？
    

> 这个版本都是实现所有的 `eventName`有一个相同的最大订阅数量，那如果每一个事件的最大订阅数量不一样，怎么搞，速录 是不是可以使用 `Reflect` 对对象定一个一个元数据，提供个思路感兴趣小伙伴自己实现下。

代码实现

```
class UpgradeEventBus{    constructor(maxListeners){        // 用来存储发布订阅事件的集合        this.eventMap = {}        this.maxListeners = maxListeners || Infinity; // 基于基础版本的变化    }    /**     *      * @param {事件名称} eventName      * @param {事件函数} funCallback      */     subscribe(eventName,funCallback){        // 判断是否订阅过         if(!Reflect.has(this.eventMap,eventName)){            Reflect.set(this.eventMap,eventName,[])         }         this.eventMap[eventName].push(funCallback);     }    /**     * 发布事件     * @param {事件名称} eventName      * @param {事件执行额外参数} args     * @returns      */     emit(eventName,...args){ // 基于基础版本的变化(增加了第二个参数)        if(!Reflect.has(this.eventMap,eventName)){            console.warn(`从未订阅过此事件${eventName}`);            return         }        const callbackList = this.eventMap[eventName];        if(this.maxListeners !== Infinity && this.eventMap[eventName].length >= this.maxListeners){            console.warn(`该事件${eventName}超过了最大监听数`); // 基于基础版本的变化        }        if(callbackList.length === 0){            console.warn(`事件${eventName}无函数可执行`)            return         }        if(this.eventMap[eventName].length){            for (const fun of this.eventMap[eventName]) {                fun.call(this,...args)            }        }     }}const eventBus = new UpgradeEventBus(20);const fun1 = function(){    console.log('打印额外参数',...arguments); // 打印额外参数 额外参数二娃    console.log('11111');}const fun2 = function(){    console.log(222222);}eventBus.subscribe('testName',fun1);eventBus.subscribe('testName',fun2);eventBus.subscribe('testName2',fun2)eventBus.emit('testName','额外参数二娃');
```

### 升级二 (增加取消订阅 / 清空事件 / 订阅一次功能)

#### 清空事件功能

清空事件功能实现，比较简单，一种是`clear`, 根据事件名称来清空；另一种是清空整个事件。只需要增加两个函数即可

```
/**   * 清空某个事件名称下所有回调函数   * @param {事件名称} eventName   * @returns   */  clear(eventName) {    if (!eventName) {      console.warn(`需提供要被清除的事件名称${eventName}`);      return;    }    // delete this.eventMap[eventName];    Reflect.deleteProperty(this.eventMap, eventName);  }  /**   * 清空事件监听函数   */  clearAll() {    this.eventMap = {};  }
```

#### 取消订阅功能

原有的存储结构不能满足取消订阅功能，原有结构 `{key:value(value是数组结构)}`，需要变更为 `{key:{id1:value1,id2:value2,id3:value3}}` , 这样取消订阅可以根据每一个函数对应的 `id` 去取消 (因根据 `id` 取消，要保证 id 的唯一性)，本文代码实现时，保证 `id` 唯一性，通过自增的方式实现，声明了一个 `callbackId` 。 这里的结构变化可能看一下原理图更清晰

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZWgSTcsT0P0mfqteufh59Gzue6dRMvBd2LCGTvzWIZQMLc2sLsPSnM3JvHkLCXRV1Ykia9lnKgxh6g/640?wx_fmt=png)image.png

具体修改和代码实现如下

```
class UpgradeEventBus2 {  constructor(maxListeners) {    // 用来存储发布订阅事件的集合    this.eventMap = {};    this.maxListeners = maxListeners || Infinity;    this.callbackId = 0;  }  /**   *   * @param {事件名称} eventName   * @param {事件函数} funCallback   */  subscribe(eventName, funCallback) {    // 判断是否订阅过    if (!Reflect.has(this.eventMap, eventName)) {      Reflect.set(this.eventMap, eventName, {});    }    // 判断是否超过了最大监听数    if (      this.maxListeners !== Infinity &&      Object.keys(this.eventMap[eventName]).length >= this.maxListeners    ) {      console.warn(`该事件${eventName}超过了最大监听数`);    }    // 以下原始订阅部分要做修改，因为存储结构从普通对象调整    // ====> 修改前代码    // this.eventMap[eventName].push(funCallback);    // ====> 修改后代码    const thisCallbackId = this.callbackId ++;    this.eventMap[eventName][thisCallbackId] = funCallback;    // 用于取消订阅的函数    const unSubscribe = ()=>{        // 根据 callbackId 取消订阅对应的 funCallback        delete this.eventMap[eventName][thisCallbackId];        // 如果一个事件下的 funCallback 为空，清掉 eventName        if(Object.keys(this.eventMap[eventName]).length === 0){            delete this.eventMap[eventName]        }    }    return {        unSubscribe    }  }  /**   * 发布事件   * @param {事件名称} eventName   * @param {事件执行额外参数} args   * @returns   */  emit(eventName, ...args) {    if (!Reflect.has(this.eventMap, eventName)) {      console.warn(`从未订阅过此事件${eventName}`);      return;    }    const callbackList = this.eventMap[eventName];    // 因eventMap 结构变化后，一下发布调用函数部分会有变化    // ====> 改动前    // if (callbackList.length === 0) {    //   console.warn(`该事件${eventName}下无可执行的订阅者`);    //   return;    // }    // if (this.eventMap[eventName].length) {    //   for (const fun of this.eventMap[eventName]) {    //     fun.call(this, ...args);    //   }    // }    // ====> 改动后    if(Object.keys(callbackList).length === 0){        console.warn(`该事件${eventName}下无可执行的订阅者`);        return;    }    for (const callback of Object.values(callbackList)) {        callback()    }  }  /**   * 清空某个事件名称下所有回调函数   * @param {事件名称} eventName   * @returns   */  clear(eventName) {    if (!eventName) {      console.warn(`需提供要被清除的事件名称${eventName}`);      return;    }    // delete this.eventMap[eventName];    Reflect.deleteProperty(this.eventMap, eventName);  }  /**   * 清空事件监听函数   */  clearAll() {    this.eventMap = {};  }}const eventBus = new UpgradeEventBus2(20);const fun1 = function () {  console.log("打印额外参数", ...arguments); // 打印额外参数 额外参数二娃  console.log("11111");};const fun2 = function () {  console.log(222222);};eventBus.subscribe("testName", fun1);const { unSubscribe } = eventBus.subscribe("testName", fun2);unSubscribe();// 取消订阅fun2eventBus.emit("testName", "额外参数二娃");
```

#### 只订阅一次功能

只可订阅一次功能的实现思路，不改变原有的 `subscribe` 函数，新提供一个`subscribeOne`函数, `callbackId` 中增加一个 `one` 前缀，订阅后仍然存储到 `eventMap`结构中。那怎么做到只订阅一次呢？在 `emit`发布里面做文章，发布时判断如果是`one`前缀的 `id`，说明只执行一次就可以，然后从 `eventMap`中删除掉

具体代码实现如下:

*   增加了 `subscribeOne` 函数
    
*   修改了 `emit` 函数
    

```
subscribeOne(evenName,callback){        if(!this.eventSet[evenName]){            this.eventSet[evenName] = {};        }        const theCallbackId = 'one' + this.callbackId++;        this.eventSet[evenName][theCallbackId] = callback;         // 取消订阅(这种订阅取消，只能通过)         const unSubscribe = ()=>{            // 根据callbackId去取消订阅对应的callback            delete this.eventSet[eventName][theCallbackId]             // 如果一个事件下的callback为空，直接清掉eventName            if(Object.keys(this.eventSet[evenName]).length === 0){                delete this.eventSet[eventName]            }        }        return unSubscribe    } emit(eventName, ...args) {      if (!Reflect.has(this.eventMap, eventName)) {        console.warn(`从未订阅过此事件${eventName}`);        return;      }      const callbackList = this.eventMap[eventName];      // 因eventMap 结构变化后，一下发布调用函数部分会有变化      // ====> 改动前      // if (callbackList.length === 0) {      //   console.warn(`该事件${eventName}下无可执行的订阅者`);      //   return;      // }        // if (this.eventMap[eventName].length) {      //   for (const fun of this.eventMap[eventName]) {      //     fun.call(this, ...args);      //   }      // }      // ====> 改动后      if(Object.keys(callbackList).length === 0){          console.warn(`该事件${eventName}下无可执行的订阅者`);          return;      }      // ====> 改动前      // for (const callback of Object.values(callbackList)) {      //     callback()      // }            // ====> 改动后      for (const [id, callback] in Object.entries(callbackList)) {        callback();        // 如果是只执行一次的订阅者 判断只订阅一次的回调函数要删除        if(id.startsWith('one')){            delete callbackList[id];        }    }}
```

将这段代码补充到前面第 `2`点就 `js`版本的 `EventBus` 就比较完善了。

### 升级三 (改造为 TypeScript 版本)

`TypeScript` 就不多说了，直接将上面的 `js` 代码转换为 `ts`，直接上代码。

```
type EventCallback = (...args: any[]) => void;interface UnsubscribeFunction {  (): void;}class UpgradeEventBus2 {  private eventMap: Record<string, Record<string, EventCallback>> = {};  private maxListeners: number;  private callbackId: number = 0;  constructor(maxListeners: number = Infinity) {    this.maxListeners = maxListeners;  }  subscribe(eventName: string, funCallback: EventCallback): UnsubscribeFunction {    if (!this.eventMap[eventName]) {      this.eventMap[eventName] = {};    }    if (      this.maxListeners !== Infinity &&      Object.keys(this.eventMap[eventName]).length >= this.maxListeners    ) {      console.warn(`该事件 ${eventName} 超过了最大监听数`);    }    const thisCallbackId = String(this.callbackId++);    this.eventMap[eventName][thisCallbackId] = funCallback;    return () => {      delete this.eventMap[eventName][thisCallbackId];      if (Object.keys(this.eventMap[eventName]).length === 0) {        delete this.eventMap[eventName];      }    };  }  emit(eventName: string, ...args: any[]): void {    const callbackList = this.eventMap[eventName];    if (!callbackList) {      console.warn(`从未订阅过此事件 ${eventName}`);      return;    }    for (const [id, callback] of Object.entries(callbackList)) {      callback(...args);      if (id.startsWith('one')) {        delete callbackList[id];      }    }  }  clear(eventName: string): void {    if (!eventName) {      console.warn(`需提供要被清除的事件名称 ${eventName}`);      return;    }    Reflect.deleteProperty(this.eventMap, eventName);  }  clearAll(): void {    this.eventMap = {};  }  subscribeOne(eventName: string, callback: EventCallback): UnsubscribeFunction {    if (!this.eventMap[eventName]) {      this.eventMap[eventName] = {};    }    const theCallbackId = 'one' + String(this.callbackId++);    this.eventMap[eventName][theCallbackId] = callback;    return () => {      delete this.eventMap[eventName][theCallbackId];      if (Object.keys(this.eventMap[eventName]).length === 0) {        delete this.eventMap[eventName];      }    };  }}export default UpgradeEventBus2;
```

### 升级四 (EventBus 支持链式调用设计模式)

如果想让你的 `EventBus`支持链式调用 (`职责链设计模式`)，那么取消订阅的功能就不能放到订阅函数中返回了，否则无法做到完全支持链式调用，这里我就不全部改造了，链式调用可以在每个方法调用后返回当前对象的**引用**。

举一个函数的例子:

```
clear(eventName: string): UpgradeEventBus2 {    if (!eventName) {      console.warn(`需提供要被清除的事件名称 ${eventName}`);      return this;    }    Reflect.deleteProperty(this.eventMap, eventName);    return this; // Return the current instance for chaining  }
```

发布订阅应用场景
--------

> 目前篇幅已经很长了，我把应用场景实战代码讲解部分单独再开一篇文章, 先了解一下可以有这些场景，感兴趣的同学可以先自己实现学习下。

1.`Mobx` 实现`Mobx` 的实现中，依赖搜集  被观察者变时触发所有依赖全部执行一遍，都是依赖发布订阅，这里后面会单独出一篇文章讲解。

> 这里突然产生一点需 = 想法，所有的知识之间都是相通的，是在看 Mobx 实现过程。

2.  表单保存校验功能
    
3.  当组件层级较深时，数据通信
    
4.  `Node.js` 中 `EventEmitter` 模块
    

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```