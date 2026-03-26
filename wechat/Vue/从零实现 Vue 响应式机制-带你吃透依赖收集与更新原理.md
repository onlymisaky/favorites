> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jyAtpDi6paKLCXr-bwWimA)

一、为什么需要响应式？
-----------

通过电商网站购物车案例，演示传统 DOM 操作 vs Vue 自动更新的效率对比：

```
<!-- 传统方式 --><div id="cart">数量：0</div><button onclick="updateCart()">+1</button><script>let count = 0function updateCart() {    count++    document.getElementById('cart').innerText = `数量：${count}`}</script><!-- Vue 方式 --><template>    <div>数量：{{ count }}</div>    <button @click="count++">+1</button></template>
```

二、响应式系统架构全景
-----------

### Vue2 响应式系统架构

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDu9nbp9p6ZMCRMiawpjsSia7ny0DKZRBJrMDukEFiaHaUiaQH6ZK08RVichEfo1iccRpxrWp3ibUlluHnsQ/640?wx_fmt=png&from=appmsg#imgIndex=0)

  

#### ** 核心流程说明 **

1.  **数据劫持（初始化阶段）**
    

*   当组件声明数据（`data()` 返回的对象）时，Vue2 通过 `Object.defineProperty` 遍历对象的每个属性，为其定义 `getter` 和 `setter`。
    
*   **目的**：拦截属性的访问（读）和修改（写），分别用于依赖收集和派发更新。
    

3.  **依赖收集（读操作触发）**
    

*   当模板或计算属性中访问数据属性（如 `{{ msg }}`）时，会触发属性的 `getter`。
    
*   此时，Vue2 会将当前正在渲染的组件的 `Watcher`（称为 `activeWatcher`）收集到该属性对应的 `dep`（依赖集合）中。
    
*   **关键点**：每个属性对应一个 `dep`，每个 `dep` 存储所有依赖该属性的 `Watcher`。
    

5.  **派发更新（写操作触发）**
    

*   当属性值被修改时，触发 `setter`，此时 Vue2 会遍历该属性的 `dep` 列表，通知所有 `Watcher` 执行 `update` 方法。
    
*   `Watcher` 的 `update` 方法会将组件标记为需要重新渲染，并通过虚拟 DOM 的 diff 算法更新真实 DOM。
    

7.  **关键角色**
    

*   **Watcher**：与组件渲染函数绑定的监听器，负责在数据变化时触发组件更新。
    
*   **dep**：每个属性的依赖集合，本质是一个 `Set`，存储所有依赖该属性的 `Watcher`。
    

### Vue3 响应式系统架构

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDu9nbp9p6ZMCRMiawpjsSia7t8f7O0KYAzPJxUibjRJmztY81pG8OhFrHDGKHBrhAKgIQg4VKGicyZ4w/640?wx_fmt=png&from=appmsg#imgIndex=1)

  

### ** 核心流程解析 **

1.  **响应式对象创建**
    

*   通过 `reactive`、`ref`等 API 创建响应式对象，本质是用 `Proxy` 代理目标对象。
    
*   **`Proxy` 拦截范围**：包括属性`访问`、`修改`、`删除`等操作。
    

3.  **依赖收集（`track` 过程）**
    

> 当访问响应式对象的属性（触发 `get` 拦截）时，调用 `track` 函数收集依赖：

*   **`activeEffect`**：全局变量，记录当前正在执行的副作用函数（如组件的渲染函数、`watch` 回调、计算属性的 getter 等）。
    
*   其核心目标是：**将 “当前活跃的副作用函数” 与“被访问的属性”建立依赖关系。**
    
*   **`targetMap`**：结构如下：
    

*   `target`：被代理的响应式对象。
    
*   `key`：对象的属性名。
    
*   `effects`：依赖该属性的 `effect` 集合（避免重复收集）。
    

```
targetMap = {  target1: {    count: Set([effect1, effect2])  }}
```

1.  **派发更新（`trigger` 过程）**
    

> 当修改响应式对象的属性（触发 `set` 拦截）时，调用 `trigger` 函数触发更新：

*   从 `targetMap` 中获取该属性对应的所有 `effect`。
    
*   通过 **调度器（`scheduler`）**  批量处理 `effect` 的执行，避免频繁更新导致性能损耗。
    
*   **调度机制**：默认将 `effect` 加入微任务队列（基于 `Promise.then` 或 `queueMicrotask`），在同一事件循环末尾合并执行。
    

三 minVue
--------

基于 vue2 写了一个小小的 demo，只支持单模版 ({{test}}) 和 v-model 的处理

### 1. 依赖管理器 `Dep`

```
class Dep {constructor() {    this.subs = []; // 当前属性对应的所有 Watcher 实例  }  addSub(sub) {    this.subs.push(sub); // 收集依赖  }  notify() {    this.subs.forEach(sub => sub.update()); // 通知所有依赖更新  }}Dep.target = null; // 当前被收集的 Watcher
```

### 2. 观察者 `Watcher`

```
class Watcher {constructor(data, key, cb) {    this.data = data;    this.key = key;    this.cb = cb;    Dep.target = this; // 当前 watcher 设为全局 target    this.value = data[key]; // 触发 getter，从而添加到 dep.subs    Dep.target = null;  }  update() {    const newVal = this.data[this.key];    if (newVal !== this.value) {      this.value = newVal;      this.cb(newVal); // 执行视图更新逻辑    }  }}
```

### 3. 响应式系统 `observe`

```
observe(data) {  if (!data || typeof data !== 'object') return;Object.keys(data).forEach(key => {    let value = data[key];    const dep = new Dep();    Object.defineProperty(data, key, {      get() {        if (Dep.target) {          dep.addSub(Dep.target);        }        return value;      },      set(newVal) {        if (newVal !== value) {          value = newVal;          dep.notify();        }      }    });    this.observe(value); // 递归子对象  });}
```

### 4. 模版编译器

```
compile() {  const el = document.querySelector(this.$options.el);this.compileNode(el);}compileNode(node) {if (node.nodeType === 1) {    Array.from(node.attributes).forEach(attr => {      if (attr.name === 'v-model') {        this.bindModel(node, attr.value);      }    });    node.childNodes.forEach(child =>this.compileNode(child));  } elseif (node.nodeType === 3) {    this.bindText(node);  }}
```

### 5. 处理 `bindText` 与 `bindModel`

`bindText`：绑定插值表达式

```
bindText(node) {  const regex = /\{\{(.*?)\}\}/g;  const matches = node.textContent.match(regex);  if (matches) {    const key = matches[0].slice(2, -2).trim();    node.textContent = this._data[key];    new Watcher(this._data, key, (newVal) => {      node.textContent = newVal;    });  }}
```

`bindModel`：绑定输入框 v-model

```
bindModel(node, key) {  node.value = this._data[key];  node.addEventListener('input', (e) => {    this._data[key] = e.target.value;  });  new Watcher(this._data, key, (newVal) => {    node.value = newVal;  });}
```

### 完整代码

```
<!DOCTYPE html><html><head><title>MiniVue Demo</title></head><body><!-- 示例模板 --><div id="app">    <input v-model="message">    <p>{{ message }}</p>    <p>{{ status }}</p>    <div>Counter: {{ counter }}</div></div><script>// ================================================================================// 依赖管理器 (Dep)// 功能：管理某个数据属性的所有 Watcher，当数据变化时通知所有 Watcher 更新// ================================================================================class Dep {constructor() {    this.subs = []; // 存储所有依赖（即 Watcher 实例）  }// 添加依赖（Watcher）  addSub(sub) {    this.subs.push(sub);  }// 通知所有依赖更新  notify() {    this.subs.forEach(sub => sub.update());  }}// 全局变量，用于暂存当前正在处理的 WatcherDep.target = null;// ================================================================================// 观察者 (Watcher)// 功能：连接数据和视图，当数据变化时触发回调函数更新视图// ================================================================================class Watcher {constructor(data, key, cb) {    this.data = data;    this.key = key;    this.cb = cb;    // 触发getter，将当前 Watcher 实例添加到 Dep 中    Dep.target = this;    this.value = data[key];    Dep.target = null;  }// 更新函数  update() {    const newVal = this.data[this.key];    if (newVal !== this.value) {      this.value = newVal;      this.cb(newVal); // 调用回调函数更新视图    }  }}// ================================================================================// 核心 MiniVue 类// ================================================================================class MiniVue {constructor(options) {    this.$options = options;       // 用户传入的配置项    this._data = options.data();   // 初始化数据（注意：data 是函数）    this.observe(this._data);      // 将数据变为响应式    this.compile();                // 编译模板  }// ------------------------------------------------------------------------------// 响应式系统：通过 Object.defineProperty 实现数据劫持// ------------------------------------------------------------------------------  observe(data) {    if (!data || typeof data !== 'object') return;    Object.keys(data).forEach(key => {      let value = data[key];      const dep = new Dep(); // 每个属性对应一个 Dep 实例      // 劫持属性的 getter/setter      Object.defineProperty(data, key, {        get() {          // 收集依赖：如果有 Watcher 正在读取此属性，将其添加到 Dep 中          if (Dep.target) {            dep.addSub(Dep.target);          }          return value;        },        set(newVal) {          if (newVal === value) return;          value = newVal;          dep.notify(); // 数据变化时通知所有 Watcher 更新        }      });      // 递归处理嵌套对象      this.observe(value);    });  }// ------------------------------------------------------------------------------// 模板编译：解析 DOM 中的指令和插值表达式// ------------------------------------------------------------------------------  compile() {    const el = document.querySelector(this.$options.el);    this.compileNode(el);  }  compileNode(node) {    // 处理元素节点（如 div、input）    if (node.nodeType === 1) {      // 解析指令（只处理 v-model）      console.log(Array.from(node.attributes), 'node.attributes');      Array.from(node.attributes).forEach(attr => {        if (attr.name === 'v-model') {          this.bindModel(node, attr.value);        }      });      // 递归处理子节点      node.childNodes.forEach(child =>this.compileNode(child));    // 处理文本节点（如 {{ message }}）    } elseif (node.nodeType === 3) {      this.bindText(node);    }  }// 绑定文本插值（{{ ... }}）  bindText(node) {    const regex = /\{\{(.*?)\}\}/g;    const matches = node.textContent.match(regex);    // 不处理复杂表达式，只处理简单的 {{ message }}    if (matches) {      const key = matches[0].slice(2, -2).trim(); // 提取属性名（如 "message"）      // 初始化文本内容      node.textContent = this._data[key];            // 创建 Watcher，当数据变化时更新文本      new Watcher(this._data, key, (newVal) => {        node.textContent = newVal;      });    }  }// 绑定 v-model 指令（双向绑定）  bindModel(node, key) {    // 初始化输入框的值    node.value = this._data[key];        // 监听 input 事件，更新数据    node.addEventListener('input', (e) => {      this._data[key] = e.target.value;    });        // 创建 Watcher，当数据变化时更新输入框的值    new Watcher(this._data, key, (newVal) => {      node.value = newVal;    });  }}// ================================================================================// 使用示例// ================================================================================const app = new MiniVue({el: '#app', // 挂载目标data: () => ({    message: 'Hello miniVue!',    status: 'I am sad',    counter: 0  })});// 测试：修改数据，观察视图是否更新setTimeout(() => {  app._data.status = 'I am happy';}, 2000);setInterval(() => {  app._data.counter++;}, 1000);  </script></body></html>
```

小小测试了一下，v-model 和定时器触发对应依赖导致页面更新都是没有问题的

  

-END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg#imgIndex=2)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1#imgIndex=3)