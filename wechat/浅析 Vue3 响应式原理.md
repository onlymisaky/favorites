> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ylf8E2hYzYpBtXxl4NakRg)

  

> 本文作者为 360 技术中台效能工程部的前端开发工程师

Proxy
-----

Vue3 的响应式原理依赖了 Proxy 这个核心 API，通过 Proxy 可以劫持对象的某些操作。

```
const obj = { a: 1 };const p = new Proxy(obj, {  get(target, property, receiver) {    console.log("get");    return Reflect.get(target, property, receiver);  },  set(target, property, value, receiver) {    console.log("set");    return Reflect.set(target, property, receiver);  },  has(target, prop) {    console.log("has");    return Reflect.has(target, prop);  },  deleteProperty(target, prop) {    console.log("deleteProperty");    return Reflect.deleteProperty(target, prop);  },});p.a; // 输出 --> getp.a = 2; // 输出 --> set"a" in p; // 输出 --> hasdelete p.a; // 输出 --> deleteProperty
```

如上例子，我们用 Proxy 代理了 Obj 对象的属性访问、属性赋值、in 操作符、delete 的操作，并进行 console.log 输出。

Reflect
-------

Reflect 是与 Proxy 搭配使用的一个 API，当我们劫持了某些操作时，如果需要再把这些操作反射回去，那么就需要 Reflect 这个 API。

由于我们拦截了对象的操作，所以这些操作该有的功能都丧失了，例如，访问属性 p.a 应该得到 a 属性的值，但此时却不会有任何结果，如果我们还想拥有拦截之前的功能，那我们就需要用 Reflect 反射回去。

```
const obj = { a: 1 };const p = new Proxy(obj, {  get(target, property, receiver) {    console.log("get");    return Reflect.get(target, property, receiver);  },  set(target, property, value, receiver) {    console.log("set");    return Reflect.set(target, property, receiver);  },  has(target, prop) {    console.log("has");    return Reflect.has(target, prop);  },  deleteProperty(target, prop) {    console.log("deleteProperty");    return Reflect.deleteProperty(target, prop);  },});
```

举个例子
----

以下全文我们都会通过这个例子来讲述 Vue3 响应式的原理。

```
<div id="app"></div><script>  // 创建一个响应式对象  const state = reactive({ counter: 1 });  // 立即运行一个函数，当响应式对象的属性发生改变时重新执行。  effect(() => {    document.querySelector("#app").innerHTML = state.counter;  });  // 2s 后视图更新  setTimeout(() => {    state.counter += 1;  }, 2000);</script>
```

我们用 reactive 创建了一个响应式对象 state，并调用了 effect 方法，该方法接受一个副作用函数，effect 的执行会立即调用副作用函数，并将 state.counter 赋值给 #app.innerHTML；两秒后，state.counter += 1，此时，effect 的副作用函数会重新执行，页面也会变成 2.

内部的执行过程大概如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECkt2Vn6f73fJUHbKh9pqkwduhZyibx3XxmlJzcBbeEJDBRdT33lpXqlChXXia0DWSSMenx17VzYIvg/640?wx_fmt=png)

1.  调用 reactive() 返回一个 Proxy 代理对象，并劫持对象的 get 与 set 操作
    
2.  调用 effect() 方法时，会访问属性 state.counter，此时会触发 proxy 的 get 操作。
    
3.  get 方法会调用 track() 进行依赖收集；建立一个对象（state）、属性（counter）、effect 副作用函数的依赖关系；
    
4.  set 方法会调用 trigger() 进行依赖更新；通过对象（state）与属性（coutner）找到对应的 effect 副作用函数，然后重新执行。
    

reactive
--------

reactive 会返回如下一个 Proxy 对象

```
const reactive = (target) => {  return new Proxy(target, {    get(target, key, receiver) {      const res = Reflect.get(target, key, receiver);      track(target, key); // 收集依赖      if (isObject(res)) {        // 如果当前获取的属性值是一个对象，则继续将为此对象创建 Proxy 代理        return reactive(res);      }      return res;    },    set(target, key, value, receiver) {      Reflect.set(target, key, value, receiver);      trigger(target, key); // 依赖更新    },  });};
```

effect
------

```
let activeEffect;function effect(fn) {  const _effect = function reactiveEffect() {    activeEffect = _effect;    fn();  };  _effect();}
```

首先定义全局的 activeEffect，它永远指向当前正在执行的 effect 副作用函数。effect 为 fn 创建一个内部的副作用函数，然后立即执行，此时会触发对象的 get 操作，调用 track() 方法。

```
effect(() => {  // effect 的立即执行会访问 state.counter，触发了对象的 get 操作。  document.querySelector("#app").innerHTML = state.counter;});
```

track
-----

track 会建立一个 对象（state） => 属性（counter） => effect 的一个依赖关系

```
const targetMap = new WeakMap();function track(target, key) {  if (!activeEffect) {    return;  }  let depsMap = targetMap.get(target);  if (!depsMap) {    targetMap.set(target, (depsMap = new Map()));  }  let dep = depsMap.get(key);  if (!dep) {    depsMap.set(key, (dep = new Set()));  }  if (!dep.has(activeEffect)) {    dep.add(activeEffect);  }}
```

执行完成成后我们得到一个如下的数据结构：

```
[ // map 集合  {    key: {counter: 1} // state 对象,    value: [ // map 集合      {        key: "counter",        value: [ // set          function reactiveEffect() {} // effect 副作用函数        ],      }    ],  },];
```

注意：当我们调用 effect 时，会将当前的副作用函数赋值给全局的 activeEffect，所以此时我们可以正确关联其依赖。

trigger
-------

当我们给 state.counter 赋值的时候就会触发代理对象的 set 操作，从而调用 trigger 方法

```
setTimeout(() => {  // 给 counter 属性赋值会触发 set 操作  state.counter += 1;}, 2000);
```

```
function trigger(target, key) {  const depsMap = targetMap.get(target);  if (!depsMap) return;  const effects = depsMap.get(key);  effects && effects.forEach((effect) => effect());}
```

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)