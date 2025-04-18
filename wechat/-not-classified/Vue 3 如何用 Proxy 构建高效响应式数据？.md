> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/upNj7bRK1ZuVx0wHJ1aKNg)

> 本文作者系 360 奇舞团前端开发工程师

**Proxy 的核心机制**
---------------

在 Vue 3 中，Proxy 主要用于 **拦截对象的基本操作**，包括 **属性读取（get）、修改（set）、删除（deleteProperty）** 等。这是 Vue 3 取代 Object.defineProperty 的根本原因。

**Proxy 允许拦截的操作：**

<table><thead><tr><th><strong>操作</strong></th><th><strong>作用</strong></th></tr></thead><tbody><tr><td>get(target, key, receiver)</td><td>读取属性时触发</td></tr><tr><td>set(target, key, value, receiver)</td><td>设置属性时触发</td></tr><tr><td>deleteProperty(target, key)</td><td>删除属性时触发</td></tr><tr><td>has(target, key)</td><td>判断 key 是否存在（key in obj）</td></tr><tr><td>ownKeys(target)</td><td>获取对象的所有键（Object.keys(obj)）</td></tr><tr><td>apply(target, thisArg, args)</td><td>代理函数调用</td></tr><tr><td>construct(target, args)</td><td>代理 new 操作符</td></tr></tbody></table>

**Proxy 的核心实现**
---------------

让我们通过一个 **手写 Proxy 劫持** 的例子，模拟 Vue 3 响应式数据的基本实现：

```
const handler = {  get(target, key) {    console.log(`读取属性：${key}`);    return Reflect.get(target, key);  },  set(target, key, value) {    console.log(`修改属性：${key} -> ${value}`);    return Reflect.set(target, key, value);  }};const data = { message: "Hello Vue 3" };const proxyData = new Proxy(data, handler);console.log(proxyData.message); // 读取属性：messageproxyData.message = "Updated"; // 修改属性：message -> Updated
```

**解读：**

• **Reflect.get(target, key)**：用于获取目标对象的值，等价于 target[key]。

• **Reflect.set(target, key, value)**：用于修改目标对象的值，等价于 target[key] = value。

• **Vue 3 就是基于 Proxy 设计 reactive() 来创建响应式数据。**

**Vue 3 如何基于 Proxy 构建响应式系统**
----------------------------

Vue 3 的核心响应式 API **reactive()** 就是对 Proxy 的封装，具体实现如下：

```
function reactive(target) {  if (typeof target !== "object" || target === null) {    return target;  }  return new Proxy(target, {    get(target, key, receiver) {      console.log(`访问属性：${key}`);      return Reflect.get(target, key, receiver);    },    set(target, key, value, receiver) {      console.log(`修改属性：${key} -> ${value}`);      return Reflect.set(target, key, value, receiver);    }  });}const state = reactive({ count: 0 });console.log(state.count); // 访问属性：countstate.count++; // 修改属性：count -> 1
```

**Vue 3 reactive() 实现的核心点**

1. **使用 Proxy 劫持整个对象，而不是每个属性**。

2. **支持深层次代理**（但 Vue 3 默认是惰性代理，访问时才创建嵌套对象的代理）。

3. **拦截数组和对象的方法（如 push、pop、delete）**。

**Vue 3 的依赖收集与副作用处理机制**
-----------------------

Vue 3 采用 **“响应式依赖收集 + 依赖触发”** 来完成视图更新，核心组件包括：

• **reactive()**：创建响应式数据（基于 Proxy）。

• **effect()**：收集依赖，记录哪些属性被访问。

• **trigger()**：数据变更时通知所有依赖执行。

**1. Vue 3 依赖收集的核心实现**

```
let activeEffect = null; // 当前正在执行的 effectconst targetMap = new WeakMap(); // 存储依赖function effect(fn) {  activeEffect = fn;  fn(); // 立即执行一次，收集依赖  activeEffect = null;}function track(target, key) {  if (activeEffect) {    let depsMap = targetMap.get(target);    if (!depsMap) {      depsMap = new Map();      targetMap.set(target, depsMap);    }    let deps = depsMap.get(key);    if (!deps) {      deps = new Set();      depsMap.set(key, deps);    }    deps.add(activeEffect);  }}function trigger(target, key) {  const depsMap = targetMap.get(target);  if (!depsMap) return;  const effects = depsMap.get(key);  if (effects) {    effects.forEach(fn => fn()); // 触发所有依赖  }}// 结合 Proxy 创建 Vue 3 响应式对象function reactive(target) {  return new Proxy(target, {    get(target, key, receiver) {      track(target, key); // 依赖收集      return Reflect.get(target, key, receiver);    },    set(target, key, value, receiver) {      const result = Reflect.set(target, key, value, receiver);      trigger(target, key); // 触发更新      return result;    }  });}
```

**2. Vue 3 响应式数据的完整示例**

```
const state = reactive({ count: 0 });effect(() => {  console.log(`count 更新：${state.count}`);});state.count++; // 触发更新：count 更新：1state.count = 5; // 触发更新：count 更新：5
```

**执行流程：**

1. effect(() => console.log(state.count)) 执行时，触发 get()，收集 state.count 的依赖。

2. state.count++ 触发 set()，调用 trigger() 通知所有依赖执行 effect()。

**Vue 3 Proxy 响应式系统的优化**
------------------------

**1. 依赖按需收集**

Vue 2 在初始化时遍历整个对象，而 Vue 3 只有在 **访问属性时才进行代理**，减少性能消耗。

**2. 自动清理无效依赖**

Vue 3 采用 **WeakMap + Set** 进行依赖存储，避免内存泄漏，Vue 2 需要手动管理依赖删除。

**3. 只更新受影响的组件**

Vue 3 的 trigger() 机制让每个组件只更新它所依赖的部分，避免 Vue 2 中全局重新计算的问题。

**总结**
------

Proxy 使 Vue 3 的响应式系统更高效，支持新增属性监听、数组操作拦截等。依赖追踪采用 WeakMap + Set 存储，提高性能，避免 Vue 2 的内存泄漏问题。Vue 3 采用 Lazy Proxy（惰性代理），只有访问属性时才进行代理，减少初始化开销。Vue 3 的响应式机制通过 effect() 进行自动依赖收集，让数据更新更智能、更高效。

- END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

 ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)