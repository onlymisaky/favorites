> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FxeXNAFuOrVBV-GK__nh6g)

在上一篇[哔哩哔哩面试官：你可以手写 Vue2 的响应式原理吗？](http://mp.weixin.qq.com/s?__biz=MzU2MzM2NzU0NA==&mid=2247489147&idx=1&sn=ec6091e97487d3a86659ebdcfb675479&chksm=fc5a0d6ccb2d847afd5c74f69fc3c5761b5cd57300bafc8744e1c834abb771b58a80baca7b71&scene=21#wechat_redirect)中，我们已经了解了`Vue2`中的响应式原理并且动手实现了其核心逻辑。但是`Vue2`的响应式原理是存在一些缺点的：

*   默认会递归、消耗较大
    
*   数组响应化需要额外实现
    
*   新增 / 删除属性属性无法监听
    
*   Map、Set、Class 等无法响应式，修改语法有限制
    

而`Vue3`使用`ES6`的`Proxy`特性来解决上面这些问题，本篇文章我将带大家深入了解`Vue3`的响应式原理并在最后通过`Proxy`实现其核心逻辑。

在开始分析之前，我们先来看一下什么是 `Proxy`?

什么是 Proxy?
----------

`ES6` 中我们看到了一个让人耳目一新的属性——`Proxy`。我们先看一下概念：

> “
> 
> 通过调用 `new Proxy()` ，你可以创建一个代理用来替代另一个对象 (被称为目标)，这个代理对目标对象进行了虚拟，因此该代理与该目标对象表面上可以被当作同一个对象来对待。代理允许你拦截在目标对象上的底层操作，而这原本是 `JS` 引擎的内部能力。

`Proxy` 顾名思义，就是代理的意思，这是一个能让我们随意操控对象的特性。当我们通过 `Proxy` 去对一个对象进行代理之后，我们将得到一个和被代理对象几乎完全一样的对象，并且可以对这个对象进行完全的监控。

什么叫完全监控？`Proxy` 所带来的，是对底层操作的拦截。前面我们在实现对对象监听时使用了 `Object.defineProperty`，这个其实是 `JS` 提供给我们的高级操作，也就是通过底层封装之后暴露出来的方法。`Proxy` 的强大之处在于，我们可以直接拦截对代理对象的底层操作。这样我们相当于从一个对象的底层操作开始实现对它的监听。

那么`Proxy`相比`Object.defineProperty`都有哪些优势呢？

Proxy 的优势
---------

*   `Proxy` 可以直接监听对象而非属性；
    
*   `Proxy` 可以直接监听数组的变化；
    
*   `Proxy` 有多达 13 种拦截方法, 不限于 `apply`、`ownKeys`、`deleteProperty`、`has` 等等是 `Object.defineProperty` 不具备的；
    
*   `Proxy` 返回的是一个新对象, 我们可以只操作新的对象达到目的, 而 `Object.defineProperty` 只能遍历对象属性直接修改；
    
*   `Proxy` 作为新标准将受到浏览器厂商重点持续的性能优化，也就是传说中的新标准的性能红利。
    

对`Proxy`有了大致的了解后，下面我就来分析一下`Vue3`的响应式原理

响应式原理
-----

这里放一张我之前整理的关于`Vue3`响应式的流程图：

![](https://mmbiz.qpic.cn/mmbiz_png/LNrWl4n5XIIkTaOkWxPQAqQ5UjRgWvnLvPPoD0wmmTXt7ZdWZRSbEo5mf1e8hWQReodCZQg1XXHU4ven55bfqQ/640?wx_fmt=png)

我们来梳理一下流程：

1、通过`state = reactive(target)`来定义响应式数据（这里基于`Proxy`实现）

2、通过 `effect`声明依赖响应式数据的函数`cb` ( 例如视图渲染函数`render`函数)，并执行`cb`函数，执行过程中，会触发响应式数据 `getter`

3、在响应式数据 `getter`中进行 `track`依赖收集：存储响应式数据与更新函数 cb 的映射关系，存储于`targetMap`

4、当变更响应式数据时，触发`trigger`，根据`targetMap`找到关联的`cb`并执行

> “
> 
> `targetMap`的结构为：`{target: {key: [fn1,fn2]}}`

手写实现
----

看下我们都要实现哪些核心函数：

*   `reactive`：响应式核心方法，用于建立数据响应式
    
*   `effect`：声明响应函数 cb，将回调函数保存起来备用，立即执行一次回调函数触发它里面一些响应数据的 getter
    
*   `track`：依赖收集，存储响应式数据与更新函数 cb 的映射关系
    
*   `trigger`：触发更新：根据映射关系，执行 cb
    

### 建立数据响应式（`reactive`函数）

```
// 判断是不是对象function isObject(val) {  return typeof val === "object" && val !== null;}function hasOwn(target, key) {  return target.hasOwnProperty[key];}// WeakMap: 弱引用映射表// 原对象 : 代理过的对象let toProxy = new WeakMap();// 代理过的对象:原对象let toRaw = new WeakMap();// 响应式核心方法function reactive(target) {  // 创建响应式对象  return createReactiveObject(target);}function createReactiveObject(target) {  // 如果当前不是对象，直接返回即可  if (!isObject(target)) {    return target;  }  // 如果已经代理过了，就直接返回代理过的结果  let proxy = toProxy.get(target);  if (proxy) {    return proxy;  }  // 防止代理过的对象再次被代理  if (toRaw.has(target)) {    return target;  }  let baseHandler = {    get(target, key, receiver) {      // Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。      let res = Reflect.get(target, key, receiver);      // 收集依赖/订阅 把当前的key和effect做映射关系      track(target, key);      // 在get取值的时候才去判断该值是否是一个对象，如果是则递归（这里相比于Vue2中的默认递归，其实是一种优化）      return isObject(res) ? reactive(res) : res;    },    set(target, key, value, receiver) {      // 这里需要区分是新增属性还是修改属性      let hasKey = hasOwn(target, key);      let oldVal = target[key];      let res = Reflect.set(target, key, value, receiver);      if (!hasKey) {        console.log("新增属性");        trigger(target, "add", key);      } else if (oldVal !== value) {        console.log("修改属性");        trigger(target, "set", key);      }      return res;    },    deleteProperty(target, key) {      let res = Reflect.deleteProperty(target, key);      return res;    },  };  let observed = new Proxy(target, baseHandler);  toProxy.set(target, observed);  toRaw.set(observed, target);  return observed;}
```

### 依赖收集

其实就是建立响应数据 key 和更新函数之间的对应关系，用法如下：

```
let obj = reactive({ name: "cosen" });effect(() => {  console.log(obj.name);});obj.name = "senlin";obj.name = "senlin1";
```

要实现这部分功能，我们需要完成上面提到的三个方法：

*   `effect`
    
*   `track`
    
*   `trigger`
    

首先，我们来梳理一下`effect`需要实现什么功能。

经过前面的`reactive()`方法，我们已经能够拿到一个响应式的数据对象了，每次`get`和`set`操作都能够被拦截。

`effect()`方法需要实现的功能就是：`每当我们修改数据的时候，都能够触发传入effect的回调函数执行`。

> “
> 
> `effect()`方法的回调函数要想在数据发生变化后能够执行，必须返回一个响应式的`effect()`函数，所以`effect()`内部会返回一个响应式的`effect`。

来看下`effect`方法的实现：

```
// 响应式 副作用function effect(fn) {  const rxEffect = function () {    try {      // 捕获异常      // 运行fn并将effect保存起来      activeEffectStacks.push(rxEffect);      return fn();    } finally {      activeEffectStacks.pop();    }  };  // 默认应该先执行一次  rxEffect();  // 返回响应函数  return rxEffect;}
```

此时数据发生变化还无法通知`effect`的回调函数执行，因为`reactive`和`effect`还未关联起来，也就是说还没有进行依赖收集，所以接下来需要进行依赖收集。

到这里我们需要思考两个问题：

1、什么时候收集依赖？

2、如何收集依赖，如何保存依赖？

首先第一个问题：什么时候收集依赖？我们需要在取值的时候开始收集依赖，而这对应于在`Proxy的handlers的get中进行取值`，也就是在上面的`createReactiveObject`方法中的：

```
get(target, key, receiver) {  // Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。  let res = Reflect.get(target, key, receiver);  // 收集依赖/订阅 把当前的key和effect做映射关系+  track(target, key);  // 在get取值的时候才去判断该值是否是一个对象，如果是则递归（这里相比于Vue2中的默认递归，其实是一种优化）  return isObject(res) ? reactive(res) : res;},
```

对应触发依赖的执行是在`Proxy的handlers的get中`：

```
set(target, key, value, receiver) {  // 这里需要区分是新增属性还是修改属性  let hasKey = hasOwn(target, key);  let oldVal = target[key];  let res = Reflect.set(target, key, value, receiver);  if (!hasKey) {    console.log("新增属性");+    trigger(target, "add", key);  } else if (oldVal !== value) {    console.log("修改属性");+    trigger(target, "set", key);  }  return res;},
```

然后是第二个问题：如何收集依赖，如何保存依赖？这个其实我有在上面的流程图中标注：

```
{target: {key: [fn1,fn2]}}
```

这里解释一下：首先依赖是一个一个的`effect`函数，我们可以通过`Set`集合进行存储，而这个 Set 集合肯定是要和对象的某个`key`进行对应，即哪些`effect`依赖了对象中某个`key`对应的值，这个对应关系可以通过一个`Map`对象进行保存。即：

```
targetMap: WeakMap{    target:Map{        key: Set[cb1,cb2...]    }}
```

当我们取值的时候，首先通过该`target`对象从全局的`WeakMap`对象中取出对应的`depsMap`对象，然后根据修改的`key`获取到对应的`dep依赖集合对象`，然后将当前`effect`放入到`dep依赖集合`中，完成依赖的收集。其实这里对应的就是`track`方法：

```
function track(target, key) {  // 拿出栈顶函数  let effect = activeEffectStacks[activeEffectStacks.length - 1];  //  if (effect) {    // 获取target对应依赖表    let depsMap = targetsMap.get(target);    if (!depsMap) {      targetsMap.set(target, (depsMap = new Map()));    }    // 获取key对应的响应函数集    let deps = depsMap.get(key);    // 动态创建依赖关系    if (!deps) {      depsMap.set(key, (deps = new Set()));    }    if (!deps.has(effect)) {      deps.add(effect);    }  }}
```

当我们修改值的时候会触发依赖更新，也是通过`target`对象从全局的`WeakMap`对象中取出对应的`depMap`对象，然后根据修改的`key`取出对应的`dep依赖集合`，并遍历该集合中的所有`effect`，并执行`effect`。对应就是`trigger`方法：

```
function trigger(target, type, key) {  let depsMap = targetsMap.get(target);  if (depsMap) {    let deps = depsMap.get(key);    if (deps) {      // 将当前key对应的effect依次执行      deps.forEach((effect) => {        effect();      });    }  }}
```

完整代码
----

这里整合一下代码，并在最后通过一个`demo`来测试一下：

```
/** * Vue3 响应式原理 * */// 判断是不是对象function isObject(val) {  return typeof val === "object" && val !== null;}function hasOwn(target, key) {  return target.hasOwnProperty[key];}// WeakMap: 弱引用映射表// 原对象 : 代理过的对象let toProxy = new WeakMap();// 代理过的对象:原对象let toRaw = new WeakMap();// 响应式核心方法function reactive(target) {  // 创建响应式对象  return createReactiveObject(target);}function createReactiveObject(target) {  // 如果当前不是对象，直接返回即可  if (!isObject(target)) {    return target;  }  // 如果已经代理过了，就直接返回代理过的结果  let proxy = toProxy.get(target);  if (proxy) {    return proxy;  }  // 防止代理过的对象再次被代理  if (toRaw.has(target)) {    return target;  }  let baseHandler = {    get(target, key, receiver) {      // Reflect 是一个内置的对象，它提供拦截 JavaScript 操作的方法。这些方法与proxy handlers的方法相同。      let res = Reflect.get(target, key, receiver);      // 收集依赖/订阅 把当前的key和effect做映射关系      track(target, key);      // 在get取值的时候才去判断该值是否是一个对象，如果是则递归（这里相比于Vue2中的默认递归，其实是一种优化）      return isObject(res) ? reactive(res) : res;    },    set(target, key, value, receiver) {      // 这里需要区分是新增属性还是修改属性      let hasKey = hasOwn(target, key);      let oldVal = target[key];      let res = Reflect.set(target, key, value, receiver);      if (!hasKey) {        console.log("新增属性");        trigger(target, "add", key);      } else if (oldVal !== value) {        console.log("修改属性");        trigger(target, "set", key);      }      return res;    },    deleteProperty(target, key) {      let res = Reflect.deleteProperty(target, key);      return res;    },  };  let observed = new Proxy(target, baseHandler);  toProxy.set(target, observed);  toRaw.set(observed, target);  return observed;}// 栈 先进后出 {name:[effect]}let activeEffectStacks = [];let targetsMap = new WeakMap();// 如果target中的key发生变化了，就执行数组里的方法function track(target, key) {  // 拿出栈顶函数  let effect = activeEffectStacks[activeEffectStacks.length - 1];  if (effect) {    // 获取target对应依赖表    let depsMap = targetsMap.get(target);    if (!depsMap) {      targetsMap.set(target, (depsMap = new Map()));    }    // 获取key对应的响应函数集    let deps = depsMap.get(key);    // 动态创建依赖关系    if (!deps) {      depsMap.set(key, (deps = new Set()));    }    if (!deps.has(effect)) {      deps.add(effect);    }  }}function trigger(target, type, key) {  let depsMap = targetsMap.get(target);  if (depsMap) {    let deps = depsMap.get(key);    if (deps) {      // 将当前key对应的effect依次执行      deps.forEach((effect) => {        effect();      });    }  }}// 响应式 副作用function effect(fn) {  const rxEffect = function () {    try {      // 捕获异常      // 运行fn并将effect保存起来      activeEffectStacks.push(rxEffect);      return fn();    } finally {      activeEffectStacks.pop();    }  };  // 默认应该先执行一次  rxEffect();  // 返回响应函数  return rxEffect;}let obj = reactive({ name: "cosen" });effect(() => {  console.log(obj.name);});obj.name = "senlin";obj.name = "senlin";
```

顺便贴下运行的结果：![](https://mmbiz.qpic.cn/mmbiz_png/LNrWl4n5XIIkTaOkWxPQAqQ5UjRgWvnLEDw8NLN3ERIoxo6wGCyprOmD7J0xaJaoYMv87RkYic0W1T1n32rlELA/640?wx_fmt=png)

我们能看到虽然执行了两次的`obj.name = "senlin"`操作，但执行结果却只执行了一次，这个与代码中定义的`toProxy`和`toRaw`是有关的：

*   `toProxy`：存储`原对象`到`代理过的对象`的映射关系，如果已经代理过了，就直接返回代理过的结果
    
*   `toRaw`存储`代理过的对`到`原对象`的映射关系，防止代理过的对象再次被代理。
    

总结
--

ok，到这里，我基本把`Vue3`中关于响应式以及依赖收集的相关原理和大家梳理了一遍，也自己手动实现了一个简易的`伪代码`。

本文只是简单的用`伪代码`的形式做了演示，关于具体实现细节，如果你想更深入的了解，大家可以直接去查看 Vue3 响应式部分的源码 [1]。

### 参考资料

[1]

Vue3 响应式部分的源码: _https://github.com/vuejs/vue-next/tree/master/packages/reactivity_