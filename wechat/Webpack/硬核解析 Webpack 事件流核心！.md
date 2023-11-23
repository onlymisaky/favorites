> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vjvObaCvmGugj3Mmwxmayw)

一、Tapable 介绍
============

Tapable 是 Webpack 整个生命周期及其插件机制的事件流实现，它提供了多种形式的发布订阅模式的 API，我们可以利用它来注册自定义事件，并在不同的时机去触发。

Tapable 对外提供了如下几种钩子（Hooks）：

```
const { SyncHook, SyncBailHook, SyncWaterfallHook, SyncLoopHook, AsyncParallelHook, AsyncParallelBailHook, AsyncSeriesHook, AsyncSeriesBailHook, AsyncSeriesWaterfallHook } = require("tapable");
```

每个钩子拥有自己专属的事件执行机制和触发时机，Webpack 正是利用它们，在不同的编译阶段来调用各插件回调，从而影响编译结果。

本文来自全栈修仙源码交流群 **VaJoy** 大佬，他会逐步介绍每个钩子，并分析其源码实现。本文内容偏硬核，建议读者分时间耐心阅读。

另外，本文各模块的代码放在 Github 上，推荐大家下载后配合本文一同食用，遇到不理解的地方可以打断点调试，学起来会很快。

> https://github.com/VaJoy/tapable-analysis

二、SyncHook 的基础实现
================

2.1 介绍
------

`SyncHook` 是 Tapable 所提供的最简单的钩子，它是一个同步钩子。

> 本小节的内容会比较长，因为会介绍到很多钩子们共用的方法。学习完 `SyncHook` 钩子的实现，再去分析其它钩子的源码会轻松很多。

初始化 `SyncHook` 后，可以通过调用实例的 `tap` 方法来注册事件，调用 `call` 方法按注册顺序来执行回调：

```
// 初始化同步钩子const hook = new SyncHook(["contry", "city", "people"]);// 注册/订阅事件hook.tap('event-1', (contry, city, people) => {    console.log('event-1:', contry, city, people)})hook.tap('event-2', (contry, city, people) => {    console.log('event-2:', contry, city, people)})// 执行订阅事件回调// 钩子上目前注册了 2 个回调，它们会按顺序被触发hook.call('China', 'Shenzhen', 'VJ')hook.tap('event-3', (contry, city, people) => {    console.log('event-3:', contry, city, people)})hook.tap('event-4', (contry, city, people) => {    console.log('event-4:', contry, city, people)})// 执行订阅事件回调// 钩子上目前注册了 4 个回调，它们会按顺序被触发hook.call('USA', 'NYC', 'Trump')/****** 下方为输出 ******/event-1: China Shenzhen VJevent-2: China Shenzhen VJevent-1: USA NYC Trumpevent-2: USA NYC Trumpevent-3: USA NYC Trumpevent-4: USA NYC Trump
```

这里顺便说一下，**tap** 在英文中有 “窃听” 的意思，用它作为订阅事件的方法名，还挺形象和俏皮。

2.2 代码实现
--------

### 2.2.1 SyncHook.js

`SyncHook` 模块的源码（简略版）如下：

```
/** @file SyncHook.js **/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class SyncHookCodeFactory extends HookCodeFactory { content({ onError, onDone, rethrowIfPossible }) {  return this.callTapsSeries({   onError: (i, err) => onError(err),   onDone,   rethrowIfPossible  }); }}const factory = new SyncHookCodeFactory();const COMPILE = function(options) { factory.setup(this, options); return factory.create(options);};function SyncHook(args = [], name = undefined) { const hook = new Hook(args, name); hook.compile = COMPILE; return hook;}module.exports = SyncHook;
```

这段代码理解起来还是很轻松的，`SyncHook` 实例化后其实就是一个 `Hook` 类的实例对象，并带上了一个自定义的 `compile` 方法。顾名思义，可以猜测 `compile` 方法是最终调用 `call` 时所执行的接口。

我们先不分析 `compile` 的实现，就带着对它的猜想，来看看 `Hook` 类的实现。

### 2.2.2 Hook 类

```
/** @file Hook.js **/const CALL_DELEGATE = function(...args) { this.call = this._createCall("sync"); return this.call(...args);};class Hook { constructor(args = [], name = undefined) {  this._args = args;  this.name = name;  this.taps = [];  this.call = CALL_DELEGATE;  // call 方法                this._call = CALL_DELEGATE; } _createCall(type) {  return this.compile({   taps: this.taps,   args: this._args,   type: type  }); } _tap(type, options, fn) {  if (typeof options === "string") {   options = {    name: options.trim()   };  }  options = Object.assign({ type, fn }, options);  this._insert(options); } tap(options, fn) {   // tap 方法  this._tap("sync", options, fn); }        _resetCompilation() {  this.call = this._call; } _insert(item) {  this._resetCompilation();                let i = this.taps.length;  this.taps[i] = item; }}
```

为了方便阅读，上方我只保留了 `SyncHook` 钩子相关的代码。这里需要知道的是，其中带下划线的方法如 `_tap`、`_resetCompilation`、`_insert` 等都属于各钩子公用的内部方法，而像 `tap`、`call` 方法是 `SyncHook` 钩子专有的方法。

我们综合梳理一下 `SyncHook` 调用 `tap` 和 `call` 的逻辑。

**⑴ tap 的流程**

继续以前方示例代码为例子：

```
hook.tap('event-1', (contry, city, people) => {    console.log('event-1:', contry, city, people)})
```

`hook.tap` 的执行流程大致如下：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V3mLtjLmibWIInYyV0GeYqiaN6XRBRB9RAk4VqAW3ro7c5wuCfxx2GUB1D1gQ9s2lzkW11lKHprny1Q/640?wx_fmt=png)

它会先在 `_tap` 方法里构建配置项 `options` 对象：

```
// options 格式{ type: 'sync', fn: callbackFunction, name: 'event-1' }
```

再将 `options` 传递给 `_insert` 方法，该方法做了两件事：

*   调用 `this._resetCompilation()` 重置 `this.call`；
    
*   发布订阅模式的常规操作，提供一个数组（`this.taps`）用于订阅收集，把 `options` 放入该数组。
    

之所以需要重置 `this.call` 方法，是因为 `this.call` 执行时会重写自己：

```
this.call = function CALL_DELEGATE(...args) { this.call = this._createCall("sync");  // overwrite this.call return this.call(...args);};
```

所以为了让 `hook.tap` 之后可以正常调用 `hook.call`，需要重新赋值 `this.call`，避免它被调用一次就不能再正常执行了。

**⑵ call 的流程**

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V3mLtjLmibWIInYyV0GeYqiaNadVnoggibOyLRU7ClQxegnMFzxJU0X0kGr6Dr8zkThFTfY6BVRANoAw/640?wx_fmt=png)

`this.call` 一开始就重写了自己：

```
this.call = this._createCall("sync");
```

通过 `this._createCall` 的实现可以知道，`this.call` 被重写为 `this.compile` 的返回值：

```
_createCall(type) {  return this.compile({   taps: this.taps,   interceptors: this.interceptors,   args: this._args,   type: type  }); }
```

这也验证了前面对于 `compile` 的猜想 —— `SyncHook.js` 中定义的 `compile` 方法是在 `call` 调用时执行的。我们回过头来看它的实现：

```
/** @file SyncHook.js **/const HookCodeFactory = require("./HookCodeFactory");class SyncHookCodeFactory extends HookCodeFactory { content({ onError, onDone, rethrowIfPossible }) {  return this.callTapsSeries({   onError: (i, err) => onError(err),   onDone,   rethrowIfPossible  }); }}const factory = new SyncHookCodeFactory();// compile 方法const COMPILE = function(options) { factory.setup(this, options); return factory.create(options);};
```

`compile` 定义的方法中分别调用了 `SyncHookCodeFactory` 实例的 `setup` 和 `create` 方法，它们都是从父类 `HookCodeFactory` 继承过来的。

### 2.2.3 HookCodeFactory 类

`HookCodeFactory` 的内容相对较多，不过没关系，我们暂时只看当前 `hook.call` 执行流程相关的代码段即可：

```
/**** @file HookCodeFactory.js ****/class HookCodeFactory { constructor(config) {  this.config = config;  this.options = undefined;  this._args = undefined; }        setup(instance, options) {  instance._x = options.taps.map(t => t.fn);  // 注册的事件回调数组 }        create(options) {  this.init(options);  let fn;  switch (this.options.type) {   case "sync":    fn = new Function(     this.args(),     '"use strict";\n' +     this.content({  // content 是在 SyncHook.js 中定义的      onError: err => `throw ${err};\n`,      onResult: result => `return ${result};\n`,      resultReturns: true,      onDone: () => "",     })    );    break;  }  this.deinit();  return fn; }        init(options) {  // 方便在 HookCodeFactory 内部获取 options 和用户入参  this.options = options;  this._args = options.args.slice(); } deinit() {  // 移除 init 的处理  this.options = undefined;  this._args = undefined; }        args() {  // 返回参数字符串  let allArgs = this._args;  if (allArgs.length === 0) {   return "";  } else {   return allArgs.join(", ");  } }}
```

可以看到 `setup` 方法会将当前已注册事件的回调统一放到数组 `this._x` 中，后续要触发所有订阅事件回调，只需要按顺序执行 `this._x` 即可。

而 `create` 则通过 `new Function(args, functionString)` 构造了一个函数，该函数最终由被重写的 `call` 触发。

所以这里我们只需要再确认下 `this.content` 方法执行后的返回值，就能知道最终 `call` 方法所执行的函数是什么。

回看前面的代码，`content` 是在 `SyncHook.js` 中定义的：

```
/**** @file SyncHook.js ****/class SyncHookCodeFactory extends HookCodeFactory { content({ onDone }) {  return this.callTapsSeries({  // 实际上是 this.callTapsSeries 的调用   onDone  }); }}
```

顺藤摸瓜，我们回 `HookCodeFactory.js` 接着看 `this.callTapsSeries` 的实现：

```
/**** @file HookCodeFactory.js ****/ callTapsSeries({  onDone, }) {                if (this.options.taps.length === 0) return onDone();  let code = "";  let current = onDone;  // () => ''                // 倒序遍历  for (let j = this.options.taps.length - 1; j >= 0; j--) {   const content = this.callTap(j, {    onDone: current,   });   current = () => content;  }  code += current();  return code; }                callTap(tapIndex, { onDone }) {  let code = "";  let hasTapCached = false;  code += `var _fn${tapIndex} = _x[${tapIndex}];\n`;  const tap = this.options.taps[tapIndex];  switch (tap.type) {   case "sync":    code += `_fn${tapIndex}(${this.args()});\n`;    if (onDone) {                                        // onDone() 会返回上一次存储的 code     code += onDone();    }    break;  }  return code; }
```

`callTap` 方法每次执行会生成和返回单个订阅事件执行代码字符串，例如：

```
var _fn0 = _x[0];_fn0(contry, city, people);
```

`callTapsSeries` 会遍历订阅数组并逐次调用 `callTap`，最后将全部订阅事件的执行代码字符串拼接起来。

理解 `callTapsSeries` 方法的关键点，是理解 `current` 变量在每次迭代前后的变化。

假设存在 4 个订阅事件，则 `current` 的变化如下：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">遍历次序</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">遍历索引</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">current 初始值</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">current 结束值</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">第 1 次</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">3</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>onDone</code>，即 <code>()=&gt;""</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[3]代码段"</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">第 2 次</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">2</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[3]代码段"</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[2]代码段 + _x[3]代码段"</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">第 3 次</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">1</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[2]代码段 + _x[3]代码段"</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[1]代码段 + _x[2]代码段 + _x[3]代码段"</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">第 4 次</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">0</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[1]代码段 + _x[2]代码段 + _x[3]代码段"</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>() =&gt; "_x[0]代码段 + _x[1]代码段 + _x[2]代码段 + _x[3]代码段"</code></td></tr></tbody></table>

因此最后直接拼接 `content()` 就能得到完整的代码字符串。

> 顺便我们也可以知道，`onDone` 参数是为了在遍历开始时，作为 `current` 的默认值使用的。

**示例：**

每次用户调用 `syncHook.call` 时，`callTapsSeries` 生成的函数片段字符串：

```
// 外部调用const hook = new SyncHook(["contry", "city", "people"]);hook.tap('event-1', (contry, city, people) => {    // 略...})hook.tap('event-2', (contry, city, people) => {    // 略...})hook.call('China', 'Shenzhen', 'VJ')// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];_fn0(contry, city, people);var _fn1 = _x[1];_fn1(contry, city, people);
```

最终在 `create` 方法中通过 `new Function` 创建为常规函数供 `call` 调用：

```
function(contry, city, people) {    "use strict";    var _x = this._x;    var _fn0 = _x[0];    _fn0(contry, city, people);    var _fn1 = _x[1];    _fn1(contry, city, people);}
```

执行后， `this._x` 里的事件回调会按顺序逐个执行。

三、SyncBailHook 的基础实现
====================

3.1 介绍
------

`SyncBailHook` 也是一个同步钩子，不同于 `SyncHook` 的地方是，如果某个订阅事件的回调函数返回了非 `undefined` 的值，那么会中断该钩子后续其它订阅回调的调用：

```
const { SyncBailHook } = require('tapable');// 初始化钩子const hook = new SyncBailHook(["contry", "city", "people"]);// 订阅事件hook.tap('event-1', (contry, city, people) => {    console.log('event-1:', contry, city, people)})hook.tap('event-2', (contry, city, people) => {    console.log('event-2:', contry, city, people);    return null;  // 设置了非 undefined 的返回值})// 因为 event-2 设置了返回值，所以后续的 event-3、event-4 都不会执行hook.tap('event-3', (contry, city, people) => {    console.log('event-3:', contry, city, people)})hook.tap('event-4', (contry, city, people) => {    console.log('event-4:', contry, city, people)})// 执行订阅回调hook.call('USA', 'NYC', 'Trump')/****** 下方为输出 ******/event-1: USA NYC Trumpevent-2: USA NYC Trump
```

在上方示例中，因为 `event-2` 的回调返回了 `null`，故中断了后续其它订阅回调的执行。

3.2 代码实现
--------

`SyncBailHook` 的入口模块为 `SyncBailHook.js`，它相对于前一节的 `SyncHook.js` 而言，只是多了一个 `content/callTapsSeries` 方法的 `onResult` 传参：

```
/**** @file SyncBailHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class SyncBailHookCodeFactory extends HookCodeFactory { content({ onDone, onResult }) {  // 新增 onResult  return this.callTapsSeries({   onDone,  // () => ''                        // 新增 onResult   onResult: (i, result, next) =>    `if(${result} !== undefined) {\n${onResult(     result    )};\n} else {\n${next()}}\n`,  }); }}// ...略function SyncBailHook(args = [], name = undefined) {        // ...略}module.exports = SyncBailHook;
```

> `onXXXX` 都是模板参数，它们执行后都会返回模板字符串，用于在 `callTap` 方法里拼接函数代码段。

我们需要在调用 `this.content` 和 `this.callTapsSeries` 的地方分别做点修改，让它们利用这个新增的模板参数，来实现 `SyncBailHook` 的功能。

**⑴ content 调用处的改动**

```
/**** @file HookCodeFactory.js ****/ create(options) {  this.init(options);  let fn;  switch (this.options.type) {   case "sync":    fn = new Function(     this.args(),     '"use strict";\n' +     this.header() +     this.content({      onDone: () => "",                                                // 新增属性      onResult: result => `return ${result};\n`,     })    );    break;  }  this.deinit();  return fn; }
```

这里的实现，其实等同于 `SyncBailHookCodeFactory` 调用 `content` 时不传 `onResult` 的简易处理：

```
class SyncBailHookCodeFactory extends HookCodeFactory { content({ onDone }) {  // 注意这里不传 onResult 了  return this.callTapsSeries({   onDone,  //  () => ""   onResult: (i, result, next) =>    `if(${result} !== undefined) {\n     return result    ;\n} else {\n${next()}}\n`,  }); }}
```

**⑵ this.callTapsSeries 调用处的改动**

在 2.2.3 小节末尾，我们知道 `this.callTapsSeries` 中最关键的实现，是利用了 `current` 的变化和传递，来实现各订阅事件回调执行代码字符串的拼接。

对于 `SyncBailHook` 的需求，我们可以利用 `onResult` 把 `current()` 的模板包起来（把 `onResult` 的第三个参数设为 `current` 即可）：

```
/**** @file HookCodeFactory.js ****/ callTapsSeries({  onDone,  onResult // 新增 }) {  if (this.options.taps.length === 0) return onDone();  let code = "";  let current = onDone;  for (let j = this.options.taps.length - 1; j >= 0; j--) {   const content = this.callTap(j, {    onDone: !onResult && current,  // 如果存在 onResult 则设为 false    // 新增 onResult 传参，把 current 包起来    onResult:     onResult &&     (result => {                                                return onResult(j, result, current);     }),   });   current = () => content;  }  code += current();  return code; }                callTap(tapIndex, { onDone, onResult }) {  // 新增 onResult 参数  let code = "";  code += `var _fn${tapIndex} = _x[${tapIndex}];\n`;  const tap = this.options.taps[tapIndex];  switch (tap.type) {   case "sync":    if (onResult) {  // 新增     code += `var _result${tapIndex} = _fn${tapIndex}(${this.args()});\n`;    } else {     code += `_fn${tapIndex}(${this.args()});\n`;    }        if (onResult) {  // 新增     code += onResult(`_result${tapIndex}`);    }                                                                // 对 SyncBailHook 来说 onDone=false    if (onDone) {     code += onDone();    }    break;  }  return code; }
```

这样每次执行 `callTap` 时，我们都能获得如下模板：

```
// 假设 I 为遍历索引var _fnI = _x[I];var _resultI = _fnI(...args);if(_resultI !== undefined) {    return _resultI;} else {    [current() 返回的模板，即前一次迭代生成的代码段]}
```

**示例**

每次用户调用 `syncBailHook.call` 时，`callTapsSeries` 生成的函数片段字符串：

```
// 外部调用const hook = new SyncBailHook(["contry", "city", "people"]);hook.tap('event-1', (contry, city, people) => {    // 略...})hook.tap('event-2', (contry, city, people) => {    // 略...})hook.tap('event-3', (contry, city, people) => {    // 略...})hook.tap('event-4', (contry, city, people) => {    // 略...})hook.call('USA', 'NYC', 'Trump')// callTapsSeries 生成的函数片段字符串：    var _fn0 = _x[0];    var _result0 = _fn0(contry, city, people);    if (_result0 !== undefined) {        return _result0;        ;    } else {        var _fn1 = _x[1];        var _result1 = _fn1(contry, city, people);        if (_result1 !== undefined) {            return _result1;            ;        } else {            var _fn2 = _x[2];            var _result2 = _fn2(contry, city, people);            if (_result2 !== undefined) {                return _result2;                ;            } else {                var _fn3 = _x[3];                var _result3 = _fn3(contry, city, people);                if (_result3 !== undefined) {                    return _result3;                    ;                } else {                }            }        }    }
```

四、SyncWaterfallHook
===================

4.1 介绍
------

`SyncWaterfallHook` 依旧为同步钩子，不过它会把前一个订阅回调所返回的内容，作为第一个参数传递给后续的订阅回调：

```
const SyncWaterfallHook = require('./SyncWaterfallHook.js');const hook = new SyncWaterfallHook(["contry", "city", "people"]);hook.tap('event-1', (contry, city, people) => {    console.log('event-1:', contry, city, people)})hook.tap('event-2', (contry, city, people) => {    console.log('event-2:', contry, city, people);    return 'The United State';  // 设置了返回值})hook.tap('event-3', (contry, city, people) => {    console.log('event-3:', contry, city, people)})hook.tap('event-4', (contry, city, people) => {    console.log('event-4:', contry, city, people)})hook.call('USA', 'NYC', 'Trump')/****** 下方为输出 ******/event-1: USA NYC Trumpevent-2: USA NYC Trumpevent-3: The United State NYC Trumpevent-4: The United State NYC Trump
```

4.2 代码实现
--------

通过前面两节，我们知道了让订阅事件回调按钩子逻辑来执行的原理，不外乎是通过传入 `onXXXX` 的模板参数，来生成 `hook.call` 最终调用的函数代码。

`SyncWaterfallHook` 的实现也非常简单，只需要调整 `onDone` 和 `onResult` 两个模板参数即可：

```
/**** @file SyncWaterfallHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class SyncWaterfallHookCodeFactory extends HookCodeFactory { content({ onResult }) {  return this.callTapsSeries({   onResult: (i, result, next) => {  // 修改点    let code = "";    code += `if(${result} !== undefined) {\n`;    code += `${this._args[0]} = ${result};\n`;    code += `}\n`;    code += next();    return code;   },   onDone: () => onResult(this._args[0]),  // 修改点  }); }}// ...略function SyncWaterfallHook(args = [], name = undefined) { // ...略}module.exports = SyncWaterfallHook;
```

`onDone` 为订阅对象数组遍历时的初始化模板函数，执行后会生成 `return ${this._args[0]};\n` 字符串。

`onResult` 为订阅对象数组遍历时的非初始化模板函数，会判断上一个订阅回调返回值是否非 `undefined`，是则将 `syncWaterfallHook.call` 的第一个参数改为此返回值，再拼接上一次遍历生成的模板内容。

**示例**

每次用户调用 `syncWaterfallHook.call` 时，`callTapsSeries` 生成的函数片段字符串：

```
// 外部调用const SyncWaterfallHook = require('./SyncWaterfallHook.js');const hook = new SyncWaterfallHook(["contry", "city", "people"]);hook.tap('event-1', (contry, city, people) => {    // 略...})hook.tap('event-2', (contry, city, people) => {    // 略...})hook.tap('event-3', (contry, city, people) => {    // 略...})hook.tap('event-4', (contry, city, people) => {    // 略...})hook.call('USA', 'NYC', 'Trump')// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];var _result0 = _fn0(contry, city, people);if(_result0 !== undefined) {    contry = _result0;}var _fn1 = _x[1];var _result1 = _fn1(contry, city, people);if(_result1 !== undefined) {    contry = _result1;}var _fn2 = _x[2];var _result2 = _fn2(contry, city, people);if(_result2 !== undefined) {    contry = _result2;}var _fn3 = _x[3];var _result3 = _fn3(contry, city, people);if(_result3 !== undefined) {    contry = _result3;}return contry;
```

五、SyncLoopHook
==============

5.1 介绍
------

这是最后一个同步钩子了，`SyncLoopHook` 表示如果存在某个订阅事件回调返回了非 `undefined` 的值，则全部订阅事件回调从头执行：

```
const hook = new SyncLoopHook([]);let count = 1;hook.tap('event-1', () => {    console.log('event-1')})hook.tap('event-2', () => {    console.log('event-2, count:', count);    if (count++ !== 3) {        return true;    }})hook.tap('event-3', () => {    console.log('event-3');})hook.call()/****** 下方为输出 ******/event-1event-2, count: 1event-1event-2, count: 2event-1event-2, count: 3event-3
```

5.2 代码实现
--------

`SyncLoopHook` “从头执行全部回调” 的逻辑比较特殊，旧的方法已经无法满足该需求，所以 Tapable 为其新开了一个 `callTapsLooping` 方法来处理：

```
/**** @file SyncLoopHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class SyncLoopHookCodeFactory extends HookCodeFactory { content({ onDone }) {  // this.callTapsLooping 为新增方法  return this.callTapsLooping({   onDone  }); }}// 略...function SyncLoopHook(args = [], name = undefined) { // 略...}module.exports = SyncLoopHook;
```

我们看下 `callTapsLooping` 方法的实现：

```
/**** @file HookCodeFactory.js ****/ // 新增 callTapsLooping 方法 callTapsLooping({  onDone, }) {  if (this.options.taps.length === 0) return onDone();  let code = "";  code += "var _loop;\n";  code += "do {\n";  code += "_loop = false;\n";  code += this.callTapsSeries({   onResult: (i, result, next) => {    let code = "";    code += `if(${result} !== undefined) {\n`;    code += "_loop = true;\n";    code += `} else {\n`;    code += next();    code += `}\n`;    return code;   },   onDone,  // () => ''  });  code += "} while(_loop);\n";  return code; }
```

可以看到，`callTapsLooping` 在模板的外层包了个 `do while` 循环：

```
var _loop;do {    _loop = false;    ${ callTapsSeries 生成的模板 }} while(_loop)
```

这里的后续逻辑很好猜测：`callTapsSeries` 生成的模板，只需要判断订阅回调返回值是否为 `undefined`，然后修改 `_loop` 即可。

而 `callTapsLooping` 传入 `callTapsSeries` 的 `onResult` 参数完善了此块逻辑：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V3mLtjLmibWIInYyV0GeYqiaNAodbr0om1oTMoicEuC4M2FMUjSSbgXosx9AmFsY1hNSanTAWp5cQMAQ/640?wx_fmt=png)

**示例**

每次用户调用 `syncLoopHook.call` 时，`callTapsLooping` 生成的函数片段字符串：

```
// 外部调用const SyncLoopHook = require('./SyncLoopHook.js');const hook = new SyncLoopHook([]);let count = 1;hook.tap('event-1', () => {    // 略...})hook.tap('event-2', () => {    // 略...})hook.tap('event-3', () => {    // 略...})hook.call()// callTapsLooping 生成的函数片段字符串：var _loop;do {    _loop = false;    var _fn0 = _x[0];    var _result0 = _fn0();    if (_result0 !== undefined) {        _loop = true;    } else {        var _fn1 = _x[1];        var _result1 = _fn1();        if (_result1 !== undefined) {            _loop = true;        } else {            var _fn2 = _x[2];            var _result2 = _fn2();            if (_result2 !== undefined) {                _loop = true;            } else {            }        }    }} while (_loop);
```

六、AsyncSeriesHook
=================

6.1 介绍
------

我们已经介绍完了 Tapable 的同步钩子，接下来逐个介绍 Tapable 中异步相关的几个钩子，首先介绍最简单的 `AsyncSeriesHook`。

`AsyncSeriesHook` 表示一个异步串行的钩子，可以通过 `hook.tapAsync` 或 `hook.tapPromise` 方法，来注册异步的事件回调。

这些订阅事件的回调依旧是逐个执行，即必须等到上一个异步回调通知钩子它已经执行完毕了，才能开始下一个异步回调：

```
// 初始化异步串行钩子const hook = new AsyncSeriesHook(['passenger']);// 使用 tapAsync 订阅事件hook.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    setTimeout(callback, 2000);})// 使用 tapPromise 订阅事件hook.tapPromise('Back to Shenzhen', (passenger) => {    console.log(`${passenger} is now comming back to Shenzhen...`);    return new Promise((resolve) => {        setTimeout(resolve, 3000);    });})// 执行订阅回调hook.callAsync('VJ', () => { console.log('Done!') });console.log('Starts here...');/****** 下方为输出 ******/VJ is on the way to Beijing...Starts here...VJ is now comming back to Shenzhen...Done!
```

对于使用 `hook.tapAsync` 来订阅事件的异步回调，可以通过执行最后一个参数来通知钩子 “我已经执行完毕，可以接着执行后面的回调了”；

对于使用 `hook.tapPromise` 来订阅事件的异步回调，需要返回一个 `Promise`，当其状态为 `resolve` 时，钩子才会开始执行后续其它订阅回调。

另外需要留意下，`AsyncSeriesHook` 钩子使用新的 `hook.callAsync` 来执行订阅回调（而不再是 `hook.call`），且支持传入回调（最后一个参数），在全部订阅事件执行完毕后触发。

6.2 代码实现
--------

首先是 `AsyncSeriesHook` 模块的代码，结构和 `SyncHook` 是基本一样的：

```
/**** @file AsyncSeriesHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class AsyncSeriesHookCodeFactory extends HookCodeFactory { content({ onDone, onError }) {  // 新增 onError  return this.callTapsSeries({                        // 新增 onError，处理异步回调中的错误   onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),   onDone  }); }}// 略...function AsyncSeriesHook(args = [], name = undefined) { // 略...}module.exports = AsyncSeriesHook;
```

> 这里我们新增了 `onError` 方法来处理异步回调中的错误。

`AsyncSeriesHook` 钩子实现的关键点，是对其几个专用方法 `hook.tapAsync`、`hook.tapPromise` 和 `hook.callAsync` 的实现，我们先到 `Hook.js` 中查看它们的定义：

```
/**** @file Hook.js ****/const CALL_DELEGATE = function (...args) {    this.call = this._createCall("sync");    return this.call(...args);};// 新增const CALL_ASYNC_DELEGATE = function(...args) { this.callAsync = this._createCall("async"); return this.callAsync(...args);};class Hook {    constructor(args = [], name = undefined) {        this._args = args;        this.name = name;        this.taps = [];        this.call = CALL_DELEGATE;        this._call = CALL_DELEGATE;        this._callAsync = CALL_ASYNC_DELEGATE;  // 新增 this.callAsync = CALL_ASYNC_DELEGATE;  // 新增    }    tap(options, fn) {        this._tap("sync", options, fn);    }    // 新增 tapAsync    tapAsync(options, fn) {        this._tap("async", options, fn);    }    // 新增 tapPromise    tapPromise(options, fn) {        this._tap("promise", options, fn);    }    _resetCompilation() {        this.call = this._call;        this.callAsync = this._callAsync;  // 新增    }    // ...略}module.exports = Hook;
```

可以看到这几个新增的方法所调用的接口跟之前的 `hoo.tap`、`hook.call` 一致，只是把订阅对象信息的 `type` 标记为 `async/promise` 罢了。

我们继续到 `HookCodeFactory` 查阅 `hook.callAsync` 的处理：

```
/**** @file HookCodeFactory.js ****/class HookCodeFactory {        // ...略        create(options) {  this.init(options);  let fn;  switch (this.options.type) {   case "sync":    fn = new Function(     this.args(),     '"use strict";\n' +     this.header() +     this.content({      onDone: () => "",      onResult: result => `return ${result};\n`,     })    );    break;   // 新增 async 类型处理(hook.callAsync)   case "async":    fn = new Function(     this.args({      after: "_callback"     }),     '"use strict";\n' +     this.header() +     this.content({      onError: err => `_callback(${err});\n`,                                                onResult: result => `_callback(null, ${result});\n`,      onDone: () => "_callback();\n"     })    );    break;  }  this.deinit();  return fn; }        callTapsSeries({  onDone,                onResult,  onError, // 新增 onError }) {  // ...略  for (let j = this.options.taps.length - 1; j >= 0; j--) {   const content = this.callTap(j, {    onError: error => onError(j, error, current, doneBreak),  // 新增 onError    // ...略   });   // ...略  }  // ...略  return code; }        args({ before, after } = {}) {  // 新增 before, after 参数  let allArgs = this._args;  if (before) allArgs = [before].concat(allArgs);  // 新增  if (after) allArgs = allArgs.concat(after);  // 新增  if (allArgs.length === 0) {   return "";  } else {   return allArgs.join(", ");  } }}
```

如同 `hook.call` 一样，`hook.callAsync` 执行时，先调用的是 `create` 方法里 `case "async"` 的代码块。

从传入 `this.content` 的参数可以猜测到，`hook.callAsync` 的函数模板里，会使用 Node **Error First** 异步回调的格式来书写相应逻辑：

```
function callback(err, nextAsyncFunc) {    if (err) {        // 错误处理    } else {        nextAsyncFunc && nextAsyncFunc(callback)    }};
```

另外留意 `this.args` 方法的改动 —— 在返回用户入参字符串的同时，可以通过传入 `before/after`，往返回的字符串前后再多插一个自定义参数。这也是为何 `hook.callAsync` 相较同步钩子的 `hook.call`，可以多传入一个可执行的回调参数的原因。

我们接着看 `callTap` 方法里新增的对 `tapAsync` 和 `tapPromise` 订阅回调的模板处理逻辑。

**⑴ 生成 tapAsync 订阅回调模板**

```
/**** @file HookCodeFactory.js ****/class HookCodeFactory {        // ...略        callTap(tapIndex, { onError, onResult, onDone }) {            let code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;            const tap = this.options.taps[tapIndex];            switch (tap.type) {   case "sync":                        // ...略                        // 新增 async 类型处理（通过 hook.tapAsync 订阅的回调模板处理）   case "async":    let cbCode = `(function(_err${tapIndex}) {\n`;    cbCode += `if(_err${tapIndex}) {\n`;    cbCode += onError(`_err${tapIndex}`);    cbCode += "} else {\n";    if (onDone) {     cbCode += onDone();    }    cbCode += "}\n";    cbCode += "})";    code += `_fn${tapIndex}(${this.args({     after: cbCode    })});\n`;    break;            }        }}
```

该代码段会生成如下模板：

```
// 假设遍历索引 tapIndex 为 Ivar _fnI = _x[I];_fnI(passenger, function(_errI) {    if(_errI) {        _callback(_errI);    } else {        ${ 前一次遍历的模板 }    }});
```

即生成了一个 Error First 的异步回调嵌套模板。

留意模板中的 `_callback` 是最终在 `create` 方法中，通过 `new Function` 时传入的形参，代表用户传入 `hook.callAsync` 的回调参数（最后一个参数，在报错或全部订阅事件结束时候触发）：

```
fn = new Function(    this.args({        after: "_callback"    }),    this.header() + this.content(...));
```

**示例**

用户调用 `asyncSeriesHook.call` 时，`callTapsSeries` 生成的函数片段字符串：

```
// 外部调用const hook = new AsyncSeriesHook(['passenger']);hook.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    setTimeout(callback, 1000);})hook.tapAsync('Fly to Shanghai', (passenger, callback) => {    console.log(`${passenger} is on the way to Shanghai...`);    setTimeout(callback, 2000);})hook.callAsync('VJ', () => {});// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];_fn0(passenger, (function (_err0) {    if (_err0) {        _callback(_err0);    } else {        var _fn1 = _x[1];        _fn1(passenger, (function (_err1) {            if (_err1) {                _callback(_err1);            } else {                _callback();            }        }));    }}));
```

**⑵ 生成 tapPromise 订阅回调模板**

分析完 `hook.tapAsync` 方式订阅的回调的模板生成方式，我们来看下 `hook.tapPromise` 是如何生成模板的：

```
/**** @file HookCodeFactory.js ****/class HookCodeFactory {        // ...略        callTap(tapIndex, { onError, onResult, onDone }) {            let code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;            const tap = this.options.taps[tapIndex];            switch (tap.type) {   case "sync":                        // ...略   case "async":   // ...略                        // 新增 async 类型处理（通过 hook.tapPromise 订阅的回调模板处理）   case "promise":    code += `var _hasResult${tapIndex} = false;\n`;    code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args()});\n`;    code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`;    code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`;    code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`;    code += `_hasResult${tapIndex} = true;\n`;    if (onDone) {     code += onDone();    }    code += `}), function(_err${tapIndex}) {\n`;    code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`;    code += onError(`_err${tapIndex}`);    code += "});\n";    break;            }        }}
```

该代码段会生成如下模板：

```
// 假设遍历索引 tapIndex 为 Ivar _fnI = _x[I];var _hasResultI = false;var _promiseI = _fnI(passenger);if (!_promiseI || !_promiseI.then)    throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promiseI + ')');_promise1.then((function (_resultI) {    _hasResultI = true;    ${ 上一次遍历生成的模板 }}), function (_errI) {    if (_hasResultI) throw _errI;    _callback(_errI);});
```

该模板利用了 `Promise.then` 的能力来决定下一个订阅回调的执行时机：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V3mLtjLmibWIInYyV0GeYqiaNwqpccdiad0TmKotLpsriaNjJFSl30IIKSNCbXq51NENwzCVohbiaBEPMA/640?wx_fmt=png)

**示例**

用户调用 `asyncSeriesHook.callAsync` 时，`callTapsSeries` 生成的函数片段字符串：

```
// 外部调用const hook = new AsyncSeriesHook(['passenger']);hook.tapPromise('Fly to Tokyo', (passenger) => {    // 略...})hook.tapPromise('Back to Shenzhen', (passenger) => {    // 略...})hook.callAsync('VJ', () => {});// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];var _hasResult0 = false;var _promise0 = _fn0(passenger);if (!_promise0 || !_promise0.then)    throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise0 + ')');_promise0.then((function (_result0) {    _hasResult0 = true;    var _fn1 = _x[1];    var _hasResult1 = false;    var _promise1 = _fn1(passenger);    if (!_promise1 || !_promise1.then)        throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')');    _promise1.then((function (_result1) {        _hasResult1 = true;        _callback();    }), function (_err1) {        if (_hasResult1) throw _err1;        _callback(_err1);    });}), function (_err0) {    if (_hasResult0) throw _err0;    _callback(_err0);});
```

七、AsyncSeriesBailHook
=====================

7.1 介绍
------

`AsyncSeriesBailHook` 和 `AsyncSeriesHook` 的表现基本一致，不过会判断订阅事件回调的返回值是否为 `undefined`，如果非 `undefined` 会中断后续订阅回调的执行：

```
const hook1 = new AsyncSeriesBailHook(['passenger']);hook1.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    setTimeout(() => {        callback(true);  // 设置了返回值    }, 2000);})hook1.tapAsync('Fly to Shanghai', (passenger, callback) => {    console.log(`${passenger} is on the way to Shanghai...`);    setTimeout(callback, 2000);})hook1.callAsync('Jay', () => { console.log('Hook1 has been Done!') });const hook2 = new AsyncSeriesBailHook(['passenger']);hook2.tapPromise('Fly to Tokyo', (passenger) => {    console.log(`${passenger} is taking off to Tokyo...`);    return new Promise((resolve) => {        setTimeout(() => {            resolve(true);  // 设置了返回值        }, 1000);    });})hook2.tapPromise('Back to Shenzhen', (passenger) => {    console.log(`${passenger} is now comming back to Shenzhen...`);    return new Promise((resolve) => {        setTimeout(resolve, 2000);    });})hook2.callAsync('VJ', () => { console.log('Hook2 has been Done!') });/****** 下方为输出 ******/Jay is on the way to Beijing...VJ is taking off to Tokyo...Hook2 has been Done!Hook1 has been Done!
```

7.2 代码实现
--------

回顾第三节 `SyncBailHook` 的实现我们可以得知，它相较 `SyncHook` 而言只是新增了一个 `onResult` 来进一步处理模板逻辑。

`AsyncSeriesBailHook` 的实现也是如此，只需要在 `AsyncSeriesHook` 的基础上添加一个 `onResult`，对上一个订阅回调返回值进行判断即可：

```
/**** @file AsyncSeriesBailHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class AsyncSeriesBailHookCodeFactory extends HookCodeFactory { content({ onDone, onError, onResult }) {  // 新增 onResult  return this.callTapsSeries({   onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),   // 新增 onResult   onResult: (i, result, next) =>    `if(${result} !== undefined) {\n${onResult(     result    )}\n} else {\n${next()}}\n`,   onDone  }); }}// ...略function AsyncSeriesBailHook(args = [], name = undefined) { // ...略}module.exports = AsyncSeriesBailHook;
```

然后是模板拼接处的修改：

```
/**** @file HookCodeFactory.js ****/ callTap(tapIndex, { onError, onDone, onResult }) {                // 备注 - 这里 onResult 传进来后的值为：                // result => `if(${result} !== undefined) {\n${onResult(result)}\n} else {\n${next()}}\n`  let code = "";  code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;  const tap = this.options.taps[tapIndex];  switch (tap.type) {   case "sync":    // ...略   case "async":    let cbCode = "";    if (onResult)  // 新增     cbCode += `(function(_err${tapIndex}, _result${tapIndex}) {\n`;    else cbCode += `(function(_err${tapIndex}) {\n`;    cbCode += `if(_err${tapIndex}) {\n`;    cbCode += onError(`_err${tapIndex}`);    cbCode += "} else {\n";    if (onResult) {  // 新增     cbCode += onResult(`_result${tapIndex}`);    }    if (onDone) {     cbCode += onDone();    }    cbCode += "}\n";    cbCode += "})";    code += `_fn${tapIndex}(${this.args({     after: cbCode    })});\n`;    break;   case "promise":    code += `var _hasResult${tapIndex} = false;\n`;    code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args()});\n`;    code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`;    code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`;    code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`;    code += `_hasResult${tapIndex} = true;\n`;    if (onResult) {  // 新增     code += onResult(`_result${tapIndex}`);    }    if (onDone) {     code += onDone();    }    code += `}), function(_err${tapIndex}) {\n`;    code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`;    code += onError(`_err${tapIndex}`);    code += "});\n";    break;  }  return code; }
```

我们在下方的示例中，看看模板发生了哪些改动。

**示例**

用户调用 `asyncSeriesBailHook.callAsync` 时，`callTapsSeries` 生成的函数片段字符串：

⑴ `hook.tapAsync` 订阅回调对应模板：

```
// 外部调用const AsyncSeriesBailHook = require('./AsyncSeriesBailHook.js');const hook1 = new AsyncSeriesBailHook(['passenger']);hook1.tapAsync('Fly to Beijing', (passenger, callback) => {    // 略...})hook1.tapAsync('Fly to Shanghai', (passenger, callback) => {    // 略...})hook1.callAsync('Jay', () => {});// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];_fn0(passenger, function (_err0, _result0) {  // 新增 _result0    if (_err0) {        _callback(_err0);    } else {        if (_result0 !== undefined) {  // 新增判断            _callback(null, _result0);        } else {            var _fn1 = _x[1];            _fn1(passenger, function (_err1, _result1) {  // 新增 _result1                if (_err1) {                    _callback(_err1);                } else {                    if (_result1 !== undefined) {  // 新增判断                        _callback(null, _result1);                    } else {                        _callback();                    }                }            });        }    }});
```

⑵ `hook.tapPromise` 订阅回调对应模板：

```
// 外部调用const hook2 = new AsyncSeriesBailHook(['passenger']);hook2.tapPromise('Fly to Tokyo', (passenger) => {    console.log(`${passenger} is taking off to Tokyo...`);    return new Promise((resolve) => {        setTimeout(() => {            resolve(true);  // 设置了返回值        }, 1000);    });})hook2.tapPromise('Back to Shenzhen', (passenger) => {    console.log(`${passenger} is now comming back to Shenzhen...`);    return new Promise((resolve) => {        setTimeout(resolve, 2000);    });})hook2.callAsync('VJ', () => { console.log('Hook2 has been Done!') });// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];var _hasResult0 = false;var _promise0 = _fn0(passenger);if (!_promise0 || !_promise0.then)    throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise0 + ')');_promise0.then((function (_result0) {    _hasResult0 = true;    if (_result0 !== undefined) {  // 新增判断        _callback(null, _result0);    } else {        var _fn1 = _x[1];        var _hasResult1 = false;        var _promise1 = _fn1(passenger);        if (!_promise1 || !_promise1.then)            throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')');        _promise1.then((function (_result1) {            _hasResult1 = true;            if (_result1 !== undefined) {  // 新增判断                _callback(null, _result1);            } else {                _callback();            }        }), function (_err1) {            if (_hasResult1) throw _err1;            _callback(_err1);        });    }}), function (_err0) {    if (_hasResult0) throw _err0;    _callback(_err0);});
```

具体变更点见代码中的注释。

Tapable 中的模板拼接乍一看挺复杂，但它的实现，肯定是先思考最终成型的模板应该长怎样，再根据需求在 `callTap` 方法中添加对应逻辑。因此，通过最终的模板来反推功能的实现，也是一种理解 Tapable 源码的方式。

八、AsyncSeriesWaterfallHook
==========================

8.1 介绍
------

`AsyncSeriesWaterfallHook` 也是异步串行的钩子，不过在执行时，上一个订阅回调的返回值会传递给下一个订阅回调，并覆盖掉新订阅回调的第一个参数：

```
const hook = new AsyncSeriesWaterfallHook(['passenger']);hook.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    callback(null, 2000);  // 这里要留意使用 Error First 的写法})hook.tapPromise('Fly to Tokyo', (time) => {    console.log(`Take off to Tokyo after ${time} ms.`);    return new Promise((resolve) => {        setTimeout(() => {            resolve(1000);        }, time);    });})hook.tapAsync('Fly to Shanghai', (time, callback) => {    console.log(`Take off to Shanghai after ${time} ms.`);    setTimeout(callback, time);})hook.callAsync('VJ', () => { console.log('Hook has been Done!') });
```

8.2 代码实现
--------

和 4.2 小节 `SyncWaterfallHook` 的实现一样，`AsyncSeriesWaterfallHook` 可以通过修改 `onResult` 和 `onDone` 方式来实现：

```
/**** @file AsyncSeriesWaterfallHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class AsyncSeriesWaterfallHookCodeFactory extends HookCodeFactory { content({ onDone, onError, onResult }) {  return this.callTapsSeries({   onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),   // 修改 onResult   onResult: (i, result, next) => {    let code = "";    code += `if(${result} !== undefined) {\n`;    code += `${this._args[0]} = ${result};\n`;    code += `}\n`;    code += next();    return code;   },   // 修改 onResult   onDone: () => onResult(this._args[0])  }); }}// ...略module.exports = AsyncSeriesWaterfallHook;
```

**示例**

用户调用 `asyncSeriesWaterfallHook.callAsync` 时，`callTapsSeries` 生成的函数片段字符串：

```
// 外部调用hook.tapAsync('Fly to Beijing', (passenger, callback) => {    // 略...})hook.tapPromise('Fly to Tokyo', (time) => {    // 略...})hook.tapAsync('Fly to Shanghai', (time, callback) => {    // 略...})hook.callAsync('VJ', () => {});// callTapsSeries 生成的函数片段字符串：var _fn0 = _x[0];_fn0(passenger, (function (_err0, _result0) {    if (_err0) {        _callback(_err0);    } else {        if (_result0 !== undefined) {  // 新增            passenger = _result0;        }        var _fn1 = _x[1];        var _hasResult1 = false;        var _promise1 = _fn1(passenger);        if (!_promise1 || !_promise1.then)            throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')');        _promise1.then((function (_result1) {            _hasResult1 = true;            if (_result1 !== undefined) {  // 新增                passenger = _result1;            }            var _fn2 = _x[2];            _fn2(passenger, (function (_err2, _result2) {                if (_err2) {                    _callback(_err2);                } else {                    if (_result2 !== undefined) {  // 新增                        passenger = _result2;                    }                    _callback(null, passenger);                }            }));        }), function (_err1) {            if (_hasResult1) throw _err1;            _callback(_err1);        });    }}));
```

九、AsyncParallelHook
===================

9.1 介绍
------

`AsyncParallelHook` 是一个异步并行的钩子，全部订阅回调都会同时并行触发：

```
const hook = new AsyncParallelHook(['passenger']);hook.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    setTimeout(() => {        console.log('[Beijing] Arrived');        callback()    }, 2000);})hook.tapPromise('Fly to Tokyo', (passenger) => {    console.log(`${passenger} is on the way to Tokyo...`);    return new Promise((resolve) => {        setTimeout(() => {            console.log('[Tokyo] Arrived');            resolve();        }, 1000);    });})hook.tapAsync('Fly to Shanghai', (passenger, callback) => {    console.log(`${passenger} is on the way to Shanghai...`);    callback()})hook.callAsync('VJ', () => { console.log('Hook has been Done!') });/****** 下方为输出 ******/VJ is on the way to Beijing...VJ is on the way to Tokyo...VJ is on the way to Shanghai...[Tokyo] Arrived[Beijing] ArrivedHook has been Done!
```

9.2 代码实现
--------

如同 `SyncsLoopHook` 钩子需要新增 `this.callTapsLooping` 方法，在 `this.callTapsSeries` 外头多套一层模板来实现具体需求。

这次的 `AsyncParallelHook` 钩子也需要新增一个 `this.callTapsParallel` 方法实现并行能力，但会摒弃串行的 `this.callTapsSeries` 接口，改而直接调用 `callTap`：

```
/**** @file AsyncParallelHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class AsyncParallelHookCodeFactory extends HookCodeFactory { content({ onError, onDone }) {  // 新增 this.callTapsParallel 方法  return this.callTapsParallel({   onError: (i, err, done, doneBreak) => onError(err) + doneBreak(true),   onDone  }); }}// ...略module.exports = AsyncParallelHook;
```

`this.callTapsParallel` 的具体实现：

```
/**** @file HookCodeFactory.js ****/callTapsParallel({    onError,    onResult,    onDone}) {    if (this.options.taps.length <= 1) {        return this.callTapsSeries({            onError,            onResult,            onDone        });    }    let code = "";    code += "do {\n";    code += `var _counter = ${this.options.taps.length};\n`;    if (onDone) {        code += "var _done = (function() {\n";        code += onDone();        code += "});\n";    }    for (let i = 0; i < this.options.taps.length; i++) {        const done = () => {            if (onDone) return "if(--_counter === 0) _done();\n";            else return "--_counter;";        };        const doneBreak = skipDone => {            if (skipDone || !onDone) return "_counter = 0;\n";            else return "_counter = 0;\n_done();\n";        };        code += "if(_counter <= 0) break;\n";        code += this.callTap(i, {            onError: error => {                let code = "";                code += "if(_counter > 0) {\n";                code += onError(i, error, done, doneBreak);                code += "}\n";                return code;            },            onResult:                onResult &&                (result => {                    let code = "";                    code += "if(_counter > 0) {\n";                    code += onResult(i, result, done, doneBreak);                    code += "}\n";                    return code;                }),            onDone:                !onResult &&                (() => {                    return done();                })        });    }    code += "} while(false);\n";    return code;}
```

`callTapsParallel` 新增的模板会遍历订阅对象，然后逐个扔给 `callTap` 生成单个订阅回调的模板，再将它们拼接起来同步执行：

```
do {  // 形成闭包，避免 const/let 变量提升到外部    _fn0(...);    _fn1(...);    ...    _fnN(...);} while(false)
```

另外新增了计数器变量 `_counter`，初始化值为订阅对象数量，每次执行完单个订阅回调会自减一，订阅回调可以通过它判断自己是否最后一个回调（如果是则执行用户传入 `hook.callAsync` 的 “事件终止” 回调）。

**示例**

用户调用 `asyncSeriesHook.callAsync` 时，`callTapsParallel` 生成的函数片段字符串：

```
// 外部调用const hook = new AsyncParallelHook(['passenger']);hook.tapAsync('Fly to Beijing', (passenger, callback) => {    // 略...})hook.tapPromise('Fly to Tokyo', (passenger) => {    // 略...})hook.tapAsync('Fly to Shanghai', (passenger, callback) => {    // 略...})hook.callAsync('VJ', () => {});// callTapsParallel 生成的函数片段字符串：do {    var _counter = 3;    var _done = (function () {        _callback();    });    if (_counter <= 0) break;    var _fn0 = _x[0];    _fn0(passenger, (function (_err0) {        if (_err0) {            if (_counter > 0) {                _callback(_err0);                _counter = 0;            }        } else {            if (--_counter === 0) _done();        }    }));    if (_counter <= 0) break;    var _fn1 = _x[1];    var _hasResult1 = false;    var _promise1 = _fn1(passenger);    if (!_promise1 || !_promise1.then)        throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')');    _promise1.then((function (_result1) {        _hasResult1 = true;        if (--_counter === 0) _done();    }), function (_err1) {        if (_hasResult1) throw _err1;        if (_counter > 0) {            _callback(_err1);            _counter = 0;        }    });    if (_counter <= 0) break;    var _fn2 = _x[2];    _fn2(passenger, (function (_err2) {        if (_err2) {            if (_counter > 0) {                _callback(_err2);                _counter = 0;            }        } else {            if (--_counter === 0) _done();        }    }));} while (false);
```

十、AsyncParallelBailHook
=======================

10.1 介绍
-------

`AsyncParallelBailHook` 和 `AsyncParallelHook` 基本一致，但如果前一个订阅回调返回了非 `undefined` 的值，会中断后续其它订阅回调的执行，并触发用户传入 `hook.callAsync` 的 “事件终止” 回调：

```
hook.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    // 注意这里不走异步处理，直接调用 callback    callback(null, true)})hook.tapPromise('Fly to Tokyo', (passenger) => {    // 执行前发现上个订阅回调返回了 true，故不会执行    console.log(`${passenger} is on the way to Tokyo...`);    return new Promise((resolve) => {        console.log('[Tokyo] Arrived');        resolve(true);    });})hook.callAsync('VJ', () => { console.log('Hook has been Done!') });/****** 下方为输出 ******/VJ  is on the way to Beijing...Hook has been Done!
```

如果一个**异步的**订阅回调会返回非 `undefined` 的值，但在它返回前，其它并行执行的订阅回调会照常执行不受影响。这种情况唯一受影响的，是 “事件终止” 回调的执行位置：

```
const hook = new AsyncParallelBailHook(['passenger']);hook.tapAsync('Fly to Beijing', (passenger, callback) => {    console.log(`${passenger} is on the way to Beijing...`);    setTimeout(() => {        console.log('[Beijing] Arrived');        callback(null, true)    }, 500);})hook.tapPromise('Fly to Tokyo', (passenger) => {    console.log(`${passenger} is on the way to Tokyo...`);    return new Promise((resolve) => {        setTimeout(() => {            console.log('[Tokyo] Arrived');            resolve(true);        }, 2000);    });})hook.tapAsync('Fly to Shanghai', (passenger, callback) => {    console.log(`${passenger} is on the way to Shanghai...`);    setTimeout(() => {        console.log('[Shanghai] Arrived');        callback()    }, 1000);})hook.callAsync('VJ', () => { console.log('Hook has been Done!') });/****** 下方为输出 ******/VJ is on the way to Beijing...VJ is on the way to Tokyo...VJ is on the way to Shanghai...[Beijing] ArrivedHook has been Done!  // “事件终止”回调打印的内容[Shanghai] Arrived[Tokyo] Arrived
```

可以看到 “事件终止” 回调会在 `Fly to Beijing` 订阅回调结束后触发，因为该订阅回调返回了 `true`。另外因为该回调是异步的，所以其它的订阅回调会照常被并发执行。

10.2 代码实现
---------

`AsyncParallelBailHook` 的实现比较粗暴直接，是在 `AsyncParallelBailHook.js` 里定义 `content` 的方法中，在模板前面新增一段内容：

```
/**** @file AsyncParallelBailHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class AsyncParallelBailHookCodeFactory extends HookCodeFactory { content({ onError, onResult, onDone }) {  let code = "";  code += `var _results = new Array(${this.options.taps.length});\n`;  code += "var _checkDone = function() {\n";  code += "for(var i = 0; i < _results.length; i++) {\n";  code += "var item = _results[i];\n";  code += "if(item === undefined) return false;\n";  code += "if(item.result !== undefined) {\n";  code += onResult("item.result");  code += "return true;\n";  code += "}\n";  code += "if(item.error) {\n";  code += onError("item.error");  code += "return true;\n";  code += "}\n";  code += "}\n";  code += "return false;\n";  code += "}\n";  code += this.callTapsParallel({   onError: (i, err, done, doneBreak) => {    let code = "";    code += `if(${i} < _results.length && ((_results.length = ${i +     1}), (_results[${i}] = { error: ${err} }), _checkDone())) {\n`;    code += doneBreak(true);    code += "} else {\n";    code += done();    code += "}\n";    return code;   },   onResult: (i, result, done, doneBreak) => {    let code = "";    code += `if(${i} < _results.length && (${result} !== undefined && (_results.length = ${i +     1}), (_results[${i}] = { result: ${result} }), _checkDone())) {\n`;    code += doneBreak(true);    code += "} else {\n";    code += done();    code += "}\n";    return code;   },   onTap: (i, run, done, doneBreak) => {    let code = "";    if (i > 0) {     code += `if(${i} >= _results.length) {\n`;     code += done();     code += "} else {\n";    }    code += run();    if (i > 0) code += "}\n";    return code;   },   onDone  });  return code; }}// ...略module.exports = AsyncParallelBailHook;
```

留意这里的 `onTap` 参数，它可传递给 `this.callTapsParallel` 来灵活处理 `callTap` 方法生成的模板：

```
/**** @file HookCodeFactory.js ****/callTapsParallel({    onError,    onResult,    onDone,    onTap = (i, run) => run()  // 新增}) {    // 略...    for (let i = 0; i < this.options.taps.length; i++) {        // 略...        // 新增改动，调用 this.callTap 的地方使用 onTap 包起来        code += onTap(            i,            () =>                this.callTap(i, {                    // 略...                }),            done,            doneBreak        );    }    // 略...    return code;}
```

`content` 方法为模板新增了一个 `_results` 数组用于存储订阅回调的执行信息（返回值和错误）；还新增一个 `_checkDone` 方法，通过遍历 `_results` 来检查事件是否应该结束 —— 若发现某个订阅回调执行出错，或者返回了非 `undefined` 值，`_checkDone` 方法会返回 `true` 并执行用户传入的 “事件终止” 回调）。

每个订阅回调执行后，会把其执行信息写入 `_results` 数组并执行 `_checkDone()`。

**示例**

用户调用 `asyncParallelBailHook.callAsync` 时，`content` 方法生成的函数片段字符串：

```
// 外部调用hook.tapAsync('Fly to Beijing', (passenger, callback) => {    // 略...})hook.tapPromise('Fly to Tokyo', () => {    // 略...})hook.callAsync('VJ', () => {});// content 方法生成的函数片段字符串：var _results = new Array(2);var _checkDone = function () {    for (var i = 0; i < _results.length; i++) {        var item = _results[i];        if (item === undefined) return false;        if (item.result !== undefined) {            _callback(null, item.result);            return true;        }        if (item.error) {            _callback(item.error);            return true;        }    }    return false;}do {    var _counter = 2;    var _done = (function () {        _callback();    });    if (_counter <= 0) break;    var _fn0 = _x[0];    _fn0(passenger, (function (_err0, _result0) {        if (_err0) {            if (_counter > 0) {                if (0 < _results.length && ((_results.length = 1), (_results[0] = { error: _err0 }), _checkDone())) {                    _counter = 0;                } else {                    if (--_counter === 0) _done();                }            }        } else {            if (_counter > 0) {                if (0 < _results.length && (_result0 !== undefined && (_results.length = 1), (_results[0] = { result: _result0 }), _checkDone())) {                    _counter = 0;                } else {                    if (--_counter === 0) _done();                }            }        }    }));    if (_counter <= 0) break;    if (1 >= _results.length) {        if (--_counter === 0) _done();    } else {        var _fn1 = _x[1];        var _hasResult1 = false;        var _promise1 = _fn1(passenger);        if (!_promise1 || !_promise1.then)            throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')');        _promise1.then((function (_result1) {            _hasResult1 = true;            if (_counter > 0) {                if (1 < _results.length && (_result1 !== undefined && (_results.length = 2), (_results[1] = { result: _result1 }), _checkDone())) {                    _counter = 0;                } else {                    if (--_counter === 0) _done();                }            }        }), function (_err1) {            if (_hasResult1) throw _err1;            if (_counter > 0) {                if (1 < _results.length && ((_results.length = 2), (_results[1] = { error: _err1 }), _checkDone())) {                    _counter = 0;                } else {                    if (--_counter === 0) _done();                }            }        });    }} while (false);
```

十一、AsyncSeriesLoopHook
======================

11.1 介绍
-------

`AsyncSeriesLoopHook` 是 Tapable 不对外暴露的隐藏钩子，但它并不神秘 —— 它和第 5 节所介绍的 `SyncLoopHook` 的表现一致，订阅回调都是按顺序串行执行的（前一个订阅回调执行完了才会开始执行下一个回调），若有回调返回了非 `undefined` 的值，会中断进度从头开始整个流程。区别只是在 `AsyncSeriesLoopHook` 里被执行的订阅回调是异步的：

```
const hook = new AsyncSeriesLoopHook([]);let count = 1;hook.tapAsync('event-1', (callback) => {    console.log('event-1 starts...');    setTimeout(() => {        console.log('event-1 done');        callback()    }, 500);})hook.tapPromise('event-2', () => {    return new Promise((resolve) => {        console.log('event-2 starts...');        setTimeout(() => {            console.log('event-2 done, count:', count);            if (count++ !== 3) {                resolve(true)            } else {                resolve()            }        }, 1000);    });})hook.tapAsync('event-3', (callback) => {    console.log('event-3 starts...');    setTimeout(() => {        console.log('event-3 done');        callback()    }, 2000);})hook.callAsync(() => { console.log('Hook has been Done!') });/****** 下方为输出 ******/event-1 starts...event-1 doneevent-2 starts...event-2 done, count: 1event-1 starts...event-1 doneevent-2 starts...event-2 done, count: 2event-1 starts...event-1 doneevent-2 starts...event-2 done, count: 3event-3 starts...event-3 doneHook has been Done!
```

11.2 代码实现
---------

`AsyncSeriesLoopHook` 模块和 `SyncLoopHook` 模块基本是一样的，都使用了 `this.callTapsLooping` 接口来实现串行执行、循环执行的能力：

```
/**** @file AsyncSeriesLoopHook.js ****/const Hook = require("./Hook");const HookCodeFactory = require("./HookCodeFactory");class AsyncSeriesLoopHookCodeFactory extends HookCodeFactory { content({ onError, onDone }) {  return this.callTapsLooping({   onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),   onDone  }); }}// 略...module.exports = AsyncSeriesLoopHook;
```

但目前 `this.callTapsLooping` 接口只能处理同步的订阅回调，为了让其可以处理异步的订阅回调，需要加一点改动：

```
/**** @file HookCodeFactory.js ****/callTapsLooping({ onError, onDone }) {  // 新增 onError    if (this.options.taps.length === 0) return onDone();    const syncOnly = this.options.taps.every(t => t.type === "sync");  // 新增    let code = "";    if (!syncOnly) {  // 新增        code += "var _looper = (function() {\n";        code += "var _loopAsync = false;\n";    }    code += "var _loop;\n";    code += "do {\n";    code += "_loop = false;\n";    code += this.callTapsSeries({        onError,        onResult: (i, result, next, doneBreak) => {            let code = "";            code += `if(${result} !== undefined) {\n`;            code += "_loop = true;\n";            if (!syncOnly) code += "if(_loopAsync) _looper();\n";  // 新增            code += doneBreak(true);            code += `} else {\n`;            code += next();            code += `}\n`;            return code;        },        onDone    });    code += "} while(_loop);\n";    if (!syncOnly) {  // 新增        code += "_loopAsync = true;\n";        code += "});\n";        code += "_looper();\n";    }    return code;}
```

这里的改动相当于在最外层包了一个 `_looper` 函数方便在异步的订阅回调返回了非 `undefined` 的时候，来递归调用自己实现循环。

> `SyncLoopHook` 的那套 `do-while` 只适合同步的订阅回调，因为如果遇上异步的订阅回调，等它执行完毕时 `do-while` 已经执行结束了，无法再循环。

**示例**

用户调用 `asyncSeriesLoopHook.callAsync` 时，`callTapsLooping` 生成的函数片段字符串：

```
// 外部调用 const hook = new AsyncSeriesLoopHook([]);hook.tapAsync('event-1', (callback) => {    // 略...})hook.tapPromise('event-2', () => {    // 略...})hook.tapAsync('event-3', (callback) => {    // 略...})hook.callAsync(() => { console.log('Hook has been Done!') });// callTapsLooping 生成的函数片段字符串：var _looper = (function () {    var _loopAsync = false;    var _loop;    do {        _loop = false;        var _fn0 = _x[0];        _fn0((function (_err0, _result0) {            if (_err0) {                _callback(_err0);            } else {                if (_result0 !== undefined) {                    _loop = true;  // 没有意义，因为回调是异步的，while 已经结束了                    if (_loopAsync) _looper();  // 需要调用 _looper 来重新执行                } else {                    var _fn1 = _x[1];                    var _hasResult1 = false;                    var _promise1 = _fn1();                    if (!_promise1 || !_promise1.then)                        throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise1 + ')');                    _promise1.then((function (_result1) {                        _hasResult1 = true;                        if (_result1 !== undefined) {                            _loop = true;                            if (_loopAsync) _looper();                        } else {                            _callback();                        }                    }), function (_err1) {                        if (_hasResult1) throw _err1;                        _callback(_err1);                    });                }            }        }));    } while (_loop);    _loopAsync = true;});_looper();
```

十二、拦截器
======

12.1 介绍
-------

终于介绍完了 Tappable 的全部钩子的基础实现，我们可以开始考虑提升一下钩子的更多能力，首先让钩子们支持拦截的功能。

Tappable 中的所有钩子都支持设置拦截器，可以在钩子执行的各阶段进行拦截。主要的拦截接口有如下几个：

*   **register**：订阅前触发拦截，调用 `hook.intercept` 方法时执行拦截回调。当前钩子有多少个订阅事件就会执行多少次 register 拦截回调，可以在该拦截回调里修改订阅者信息。
    
*   **call**：用户调用 `hook.call/callAsync` 时触发，在订阅事件的回调执行前执行，参数为用户传参。只会触发一次。
    
*   **loop**：loop 类型钩子每次循环起始时触发（排在 call 拦截器后面），参数为用户传参。循环几次就会触发几次。
    
*   **tap**：调用 `hook.call/callAsync` 时触发，在订阅事件的回调执行前执行（排在 call 和 loop 拦截器后面），参数为订阅者信息。有多个订阅回调就会执行多次。
    
*   **error**：调用 `hook.call/callAsync` 时触发，拦截时机为执行订阅回调出错时，参数为错误对象。
    
*   **done**：调用 `hook.call/callAsync` 时触发，拦截时机为全部订阅回调执行完毕的时候（排在用户传入的 “事件终止” 回调前面），没有参数。
    

**拦截器示例 - 同步订阅回调：**

```
const { SyncHook } = require('tapable');// 初始化同步钩子const hook = new SyncHook(["contry", "city", "people"]);// 设置拦截器hook.intercept({  // 订阅前触发  register: (options) => {    console.log(`[register-intercept] ${options.name} is going registering...`);    // 修改订阅者信息    if (options.name === 'event-2') {        options.name = 'event-intercepted';        options.fn = (contry, city, people) => {            console.log('event-intercepted:', contry, city, people)        };    }        return options;  // 订阅者的信息会变成修改后的  },  // call 方法调用时触发  call: (...args) => {    console.log('[call-intercept]', args);  },  // 调用订阅事件回调前触发  tap: (options) => {    console.log('[tap-intercept]', options);  },});// 注册事件hook.tap('event-1', (contry, city, people) => {    console.log('event-1:', contry, city, people)})hook.tap('event-2', (contry, city, people) => {    console.log('event-2:', contry, city, people)})// 执行事件hook.call('China', 'Shenzhen', 'VJ')/****** 下方为输出 ******/[register-intercept] event-1 is going registering...[register-intercept] event-2 is going registering...[call-intercept] [ 'China', 'Shenzhen', 'VJ' ][tap-intercept] { type: 'sync', fn: [Function (anonymous)], name: 'event-1' }event-1: China Shenzhen VJ[tap-intercept] { type: 'sync', fn: [Function (anonymous)], name: 'event-intercepted' }event-intercepted: China Shenzhen VJHook is done.
```

**拦截器示例 - 异步订阅回调：**

```
const hook = new AsyncSeriesLoopHook(['name', 'country']);hook.intercept({    // 订阅前触发    register: (options) => {        console.log(`[register-intercept] ${options.name} is going registering...`);        // 修改订阅者信息        if (options.name === 'event-1') {            const oldFn = options.fn;            options.fn = (...args) => {                args[1] = 'USA';                oldFn(...args);            }        }        return options;  // 订阅者的信息会变成修改后的    },    // call 方法调用时触发    call(...args) {        console.log('[call-intercept]', args);    },    // 调用订阅事件回调前触发    tap(options) {        console.log('[tap-intercept]', options);    },    loop(...args) {        console.log('[loop-intercept]', args);    },    done() {        console.log('[done-intercept] Last interceptor.')    }});let count = 1;hook.tapAsync('event-1', (name, country, callback) => {    console.log(`event-1 starts..., the country of ${name} is ${country}.`);    setTimeout(() => {        console.log('event-1 done');        callback()    }, 500);})hook.tapPromise('event-2', () => {    return new Promise((resolve) => {        console.log('event-2 starts...');        setTimeout(() => {            console.log('event-2 done, count:', count);            if (count++ !== 2) {                resolve(true)            } else {                resolve()            }        }, 1000);    });})hook.tapAsync('event-3', (name, country, callback) => {    console.log('event-3 starts...');    setTimeout(() => {        console.log('event-3 done');        callback()    }, 2000);})hook.callAsync('Trump', 'China', () => { console.log('Hook has been done!'); });/****** 下方为输出 ******/[register-intercept] event-1 is going registering...[register-intercept] event-2 is going registering...[register-intercept] event-3 is going registering...[call-intercept] [ 'Trump', 'China' ][loop-intercept] [ 'Trump', 'China' ][tap-intercept] { type: 'async', fn: [Function (anonymous)], name: 'event-1' }event-1 starts..., the country of Trump is USA.event-1 done[tap-intercept] { type: 'promise', fn: [Function (anonymous)], name: 'event-2' }event-2 starts...event-2 done, count: 1[loop-intercept] [ 'Trump', 'China' ][tap-intercept] { type: 'async', fn: [Function (anonymous)], name: 'event-1' }event-1 starts..., the country of Trump is USA.event-1 done[tap-intercept] { type: 'promise', fn: [Function (anonymous)], name: 'event-2' }event-2 starts...event-2 done, count: 2[tap-intercept] { type: 'async', fn: [Function (anonymous)], name: 'event-3' }event-3 starts...event-3 done[done-intercept] Last interceptor.Hook has been done!
```

拦截器还支持多个配置，会依次执行：

```
const hook = new AsyncSeriesLoopHook(['name', 'country']);// 配置第一个拦截器hook.intercept({    register: (options) => {        console.log(`[register-intercept-1] ${options.name} is going registering...`);        return options;    },    tap() {        console.log('[tap-intercept-1]');    },    done() {        console.log('[done-intercept-1] Last interceptor.')    }});// 配置第二个拦截器hook.intercept({    register: (options) => {        console.log(`[register-intercept-2] ${options.name} is going registering...`);        return options;    },    tap() {        console.log('[tap-intercept-2]');    },    done() {        console.log('[done-intercept-2] Last interceptor.')    }});hook.tapAsync('event-1', (name, country, callback) => {    console.log(`event-1 starts..., the country of ${name} is ${country}.`);    setTimeout(() => {        console.log('event-1 done');        callback()    }, 500);})hook.tapAsync('event-2', (name, country, callback) => {    console.log('event-2 starts...');    setTimeout(() => {        console.log('event-2 done');        callback()    }, 1000);})hook.callAsync('VJ', 'China', () => { console.log('Hook has been done!'); });/****** 下方为输出 ******/[register-intercept-1] event-1 is going registering...[register-intercept-2] event-1 is going registering...[register-intercept-1] event-2 is going registering...[register-intercept-2] event-2 is going registering...[tap-intercept-1][tap-intercept-2]event-1 starts..., the country of VJ is China.event-1 done[tap-intercept-1][tap-intercept-2]event-2 starts...event-2 done[done-intercept-1] Last interceptor.[done-intercept-2] Last interceptor.Hook has been done!
```

拦截器是个很有意思的功能，是各工具 “生命周期” 的底层钩子，我们来看下 Tapable 中是如何实现拦截器的。

12.2 代码实现
---------

### 12.2.1 intercept 入口和 register 拦截器

首先要实现的自然是 `hook.intercept` 的接口，我们需要回到 `Hook.js` 中添加该方法，并新增一个数组来存放拦截器配置：

```
/**** @file Hook.js ****/class Hook { constructor(args = [], name = undefined) {        this._args = args;        this.name = name;        this.taps = [];        this.interceptors = [];  // 新增，用于存放拦截器        this.call = CALL_DELEGATE;        this._call = CALL_DELEGATE;        this._callAsync = CALL_ASYNC_DELEGATE;        this.callAsync = CALL_ASYNC_DELEGATE;    }    _createCall(type) {        return this.compile({            taps: this.taps,            args: this._args,            type: type,            interceptors: this.interceptors  // 新增，传递给 HookCodeFactory        });    }    intercept(interceptor) {  // 新增 intercept 接口        this._resetCompilation();        this.interceptors.push(Object.assign({}, interceptor));        if (interceptor.register) {            for (let i = 0; i < this.taps.length; i++) {                // 执行 register 拦截器，用返回值替换订阅对象信息                this.taps[i] = interceptor.register(this.taps[i]);            }        }    }}
```

在用户注册拦截器的时候（调用 `hook.intercept`），会将拦截器配置对象存入数组 `this.interceptors`，然后遍历订阅事件对象，逐个触发 register 拦截器，并用拦截回调的返回值来替换订阅对象信息。这也是为何我们可以在 register 拦截阶段直接修改订阅对象信息。

### 12.2.2 call、error、done 拦截器

我们都知道 Tapable 是通过模板拼接来完成其全部能力的，拦截器的实现方式也不例外。

试想一下，我们可以通过存储于 `this.interceptors` 的数组里获取到拦截器配置，自然也可以在需要拦截的地方，将 `this.interceptors[n].interceptorName()` 字符串嵌入模板对应位置，最终执行模板函数时，就会在适当的时间点执行对应的拦截回调。

例如在 `HookCodeFactory.js` 中，我们可以新增一个 `contentWithInterceptors` 方法，在调用 `this.content` 前触发  call 拦截器，并修改传入 `this.content` 的 `onError` 和 `onDone` 模板，让它们在执行时分别先触发 error 拦截器和 done 拦截器：

```
/**** @file HookCodeFactory.js ****/contentWithInterceptors(options) {    if (this.options.interceptors.length > 0) {        const onError = options.onError;        const onResult = options.onResult;        const onDone = options.onDone;        let code = "";        for (let i = 0; i < this.options.interceptors.length; i++) {            const interceptor = this.options.interceptors[i];            if (interceptor.call) {                code += `${this.getInterceptor(i)}.call(${this.args()});\n`;            }        }        code += this.content(            Object.assign(options, {                onError:                    onError &&                    (err => {                        let code = "";                        for (let i = 0; i < this.options.interceptors.length; i++) {                            const interceptor = this.options.interceptors[i];                            if (interceptor.error) {                                code += `${this.getInterceptor(i)}.error(${err});\n`;                            }                        }                        code += onError(err);                        return code;                    }),                onResult,                onDone:                    onDone &&                    (() => {                        let code = "";                        for (let i = 0; i < this.options.interceptors.length; i++) {                            const interceptor = this.options.interceptors[i];                            if (interceptor.done) {                                code += `${this.getInterceptor(i)}.done();\n`;                            }                        }                        code += onDone();                        return code;                    })            })        );        return code;    } else {        return this.content(options);    }}getInterceptor(idx) {    return `_interceptors[${idx}]`;}
```

将 `create` 方法中调用 `content` 的地方改为 `contentWithInterceptors`：

```
/**** @file HookCodeFactory.js ****/create(options) {    this.init(options);    let fn;    switch (this.options.type) {        case "sync":            fn = new Function(                this.args(),                '"use strict";\n' +                this.header() +                this.contentWithInterceptors({  // 修改                    onDone: () => "",                    onResult: result => `return ${result};\n`,                })            );            break;        case "async":            fn = new Function(                this.args({                    after: "_callback"                }),                '"use strict";\n' +                this.header() +                this.contentWithInterceptors({  // 修改                    onError: err => `_callback(${err});\n`,                    onResult: result => `_callback(null, ${result});\n`,                    onDone: () => "_callback();\n"                })            );            break;    }    this.deinit();    return fn;}header() {    let code = "";    code += "var _x = this._x;\n";    if (this.options.interceptors.length > 0) {  // 新增        code += "var _taps = this.taps;\n";        code += "var _interceptors = this.interceptors;\n";    }    return code;}
```

### 12.2.3 tap 拦截器

tap 拦截器是在 `callTap` 开始执行时触发的，它的实现很简单：

```
/**** @file HookCodeFactory.js ****/callTap(tapIndex, { onError, onDone, onResult }) {    let code = "";    let hasTapCached = false;  // 新增    for (let i = 0; i < this.options.interceptors.length; i++) {  // 新增        const interceptor = this.options.interceptors[i];        if (interceptor.tap) {            if (!hasTapCached) {                code += `var _tap${tapIndex} = ${this.getTap(tapIndex)};\n`;                hasTapCached = true;            }            code += `${this.getInterceptor(i)}.tap(_tap${tapIndex});\n`;        }    }    code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;    const tap = this.options.taps[tapIndex];    switch (tap.type) {        // 略...    }    return code;}
```

它会生成这样的模板内容：

```
// 假设遍历索引为 I，且有两个拦截器配置对象var _tapI = tapOptionsI;_interceptors[0].tap(_tapI)_interceptors[1].tap(_tapI)
```

### 12.2.4 loop 拦截器

loop 拦截器只需要在 `callTapsLooping` 的 `do-while` 模板开头插入拦截代码即可：

```
/**** @file HookCodeFactory.js ****/callTapsLooping({ onError, onDone }) {    // 略...    code += "var _loop;\n";    code += "do {\n";    code += "_loop = false;\n";    for (let i = 0; i < this.options.interceptors.length; i++) {  // 新增        const interceptor = this.options.interceptors[i];        if (interceptor.loop) {            code += `${this.getInterceptor(i)}.loop(${this.args()});\n`;        }    }    code += this.callTapsSeries({...});    // 略...    return code;}
```

至此 Tapable 中的几个拦截器就这么被实现了，没想象中的复杂对吧？

十三、HookMap
==========

13.1 介绍
-------

`HookMap` 是 Tapable 的一个辅助类（helper），利用它可以更好地封装我们的各种钩子：

```
const keyedHook = new HookMap(key => new SyncHook(["desc"]));// 创建名为“webpack”的钩子，并订阅“Plugin-A”和“Plugin-B”事件const webpackHook = keyedHook.for("webpack");webpackHook.tap("Plugin-A", (desc) => { console.log("Plugin-A", desc) });webpackHook.tap("Plugin-B", (desc) => { console.log("Plugin-B", desc) });// 创建名为“babel”的钩子，并订阅“Plugin-C”事件keyedHook.for("babel").tap("Plugin-C", (desc) => { console.log("Plugin-C", desc) });function getHook(hookName) {    // 获取指定名称的钩子    return keyedHook.get(hookName);}function callHook(hookName, desc) {    const hook = getHook(hookName);    if(hook !== undefined) {        const call = hook.call || hook.callAsync;        call.bind(hook)(desc);    }}callHook('webpack', "It's on Webpack plugins processing")module.exports.getHook = getHook;module.exports.callHook = callHook;/****** 下方为输出 Plugin-A It's on Webpack plugins processingPlugin-B It's on Webpack plugins processing******/
```

13.2 代码实现
---------

`HookMap` 使用了 `this._factory` 来存储用户在初始化时传入的钩子构造函数（钩子工厂），后续用户调用 `hookMap.for` 时会通过该构造函数生成指定类型的钩子，并以钩子名称为 key 存入一个 `Map` 对象，后续如果需要获取该钩子，从 `Map` 对象查找它的名称即可：

```
/**** @file HookMap.js ****/const util = require("util");class HookMap { constructor(factory, name = undefined) {  this._map = new Map();  this.name = name;  this._factory = factory; } get(key) {  return this._map.get(key); } for(key) {  const hook = this.get(key);  if (hook !== undefined) {   return hook;  // 支持链式调用  }  let newHook = this._factory(key);  this._map.set(key, newHook);  return newHook;  // 支持链式调用 }}module.exports = HookMap;
```

留意 `for` 的开头会先判断是否已经构建了该名称的钩子，如果是则直接返回。

我们就这样完成了 `HookMap` 的基础能力，可见它就是一个语法糖，实现相对简单。

另外 `HookMap` 支持一个名为 **factory** 的拦截器，它可以修改 `HookMap` 的钩子构造函数（`this._factory`），对新建的钩子会生效：

```
const keyedHook = new HookMap(() => new SyncHook(["desc"]));keyedHook.for("webpack").tap("Plugin-A", (desc) => { console.log("Plugin-A-phase-1", desc) });// 配置拦截器，更换新的钩子类型keyedHook.intercept({    factory: (key) => {        console.log(`[intercept] New hook: ${key}.`)        return new SyncBailHook(["desc"]);    }});// 已有名为 webpack 的钩子，拦截器不会影响，它依旧是 SyncHook 钩子keyedHook.for("webpack").tap("Plugin-A", (desc) => {    console.log("Plugin-A-phase-2", desc);    return true;});keyedHook.for("webpack").tap("Plugin-B", (desc) => {    console.log("Plugin-B", desc);});// 新的钩子，类型为拦截器替换掉的 SyncBailHookkeyedHook.for("babel").tap("Plugin-C", (desc) => {    console.log("Plugin-C-phase-1", desc);    return true;});keyedHook.for("babel").tap("Plugin-C", (desc) => {    console.log("Plugin-C-phase-2", desc);});function getHook(hookName) {    return keyedHook.get(hookName);}function callHook(hookName, desc) {    const hook = getHook(hookName);    if (hook !== undefined) {        const call = hook.call || hook.callAsync;        call.bind(hook)(desc);    }}callHook('webpack', "It's on Webpack plugins processing");callHook('babel', "It's on Webpack plugins processing");/****** 下方为输出 [intercept] New hook: babel.Plugin-A-phase-1 It's on Webpack plugins processingPlugin-A-phase-2 It's on Webpack plugins processingPlugin-B It's on Webpack plugins processingPlugin-C-phase-1 It's on Webpack plugins processing******/
```

它的实现也很简单，这里不再赘述：

```
/**** @file HookMap.js ****/const defaultFactory = (key, hook) => hook;class HookMap { constructor(factory, name = undefined) {  this._map = new Map();  this.name = name;  this._factory = factory;  this._interceptors = [];  // 新增 } get(key) {  return this._map.get(key); } for(key) {  const hook = this.get(key);  if (hook !== undefined) {   return hook;  // 如果已有同名钩子，拦截器不会生效  }  let newHook = this._factory(key);                                // 新增  const interceptors = this._interceptors;                // 新增  for (let i = 0; i < interceptors.length; i++) {   newHook = interceptors[i].factory(key, newHook);  }  this._map.set(key, newHook);  return newHook; }        // 新增 intercept(interceptor) {  this._interceptors.push(   Object.assign(    {     factory: defaultFactory    },    interceptor   )  ); }}module.exports = HookMap;
```

十四、MultiHook
============

这是最后一个要介绍的 `Tapable` 的模块了，它也是一个语法糖，方便你批量操作多个钩子：

```
const MultiHook = require('./lib/MultiHook');const SyncHook = require('./lib/SyncHook');const SyncBailHook = require('./lib/SyncBailHook.js');const hook1 = new SyncHook(["contry", "city", "people"]);const hook2 = new SyncBailHook(["contry", "city", "people"]);const hooks = new MultiHook([hook1, hook2]);hooks.tap('multiHook-event', (contry, city, people) => {    console.log('multiHook-event-1:', contry, city, people);    return true;})hooks.tap('multiHook-event', (contry, city, people) => {    console.log('multiHook-event-2:', contry, city, people);    return true;})hook1.call('China', 'Shenzhen', 'VJ');hook2.call('USA', 'NYC', 'Joey');/****** 下方为输出 multiHook-event-1: China Shenzhen VJmultiHook-event-2: China Shenzhen VJmultiHook-event-1: USA NYC Joey******/
```

其实现非常简单，只是一个普通的封装模块，将传入的钩子们存在 `this.hooks` 中，在调用内部方法的时候通过 `for of` 来遍历钩子和执行对应接口：

```
/**** @file HookMap.js ****/class MultiHook { constructor(hooks, name = undefined) {  this.hooks = hooks;  this.name = name; } tap(options, fn) {  for (const hook of this.hooks) {   hook.tap(options, fn);  } } tapAsync(options, fn) {  for (const hook of this.hooks) {   hook.tapAsync(options, fn);  } } tapPromise(options, fn) {  for (const hook of this.hooks) {   hook.tapPromise(options, fn);  } } intercept(interceptor) {  for (const hook of this.hooks) {   hook.intercept(interceptor);  } }}module.exports = MultiHook;
```

十五、小结
=====

以上就是全部关于 Tapable 的分析了，从中我们了解到了 Tapable 的实现是基于模板的拼接，这是个很有创意的形式，有点像搭积木，把各钩子的订阅回调按相关逻辑一层层搭建成型，这其实不是很轻松的事情。

在掌握了 Tapable 各种钩子、拦截器的执行流程和实现之后，也相信你会对 Webpack 的工作流程有了更进一步的了解，毕竟 Webpack 的工作流程不外乎就是将各个插件串联起来，而 Tapable 帮忙实现了这一事件流机制。

另外这么长的文章应该存在一些错别字或语病，欢迎大家评论指出，我再一一修改。

最后感谢大家能耐心读完本文，希望你们能有所收获，共勉~