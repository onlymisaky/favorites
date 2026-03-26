> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/i_e-ZBrTkefXjU-jIXvg0Q)

前言
--

上篇文章介绍了 Vue3 响应式的两个核心 API，知道了两者的用法于区别，本文将带您深入实现其核心机制。我们将重点实现响应式数据变化时的依赖收集与触发更新功能，暂不涉及虚拟 DOM 和 diff 算法部分，视图更新将直接使用 DOM API 实现。通过这个实现，将更透彻地理解：

1.  如何建立数据与视图的响应式关联
    
2.  依赖收集的核心原理
    
3.  触发更新的执行机制
    

响应式实现方案
-------

关于响应式方案，Vue 目前一共出现过三种方案，分别是：

<table><thead><tr><th><section>方案</section></th><th><section>版本</section></th><th><section>核心缺陷</section></th></tr></thead><tbody><tr><td><section>defineProperty</section></td><td><section>Vue2</section></td><td><section>无法拦截数组操作、对象属性增删</section></td></tr><tr><td><section>Proxy + Reflect</section></td><td><section>Vue3</section></td><td><section>完美解决 Vue2 的响应式限制</section></td></tr><tr><td><section>getter/setter</section></td><td><section>ref 实现</section></td><td><section>支持基本数据类型的响应式</section></td></tr></tbody></table>

`defineProperty`是 Vue2 中使用的响应式方案，由于该 API 有挺多缺陷，Vue2 底层对此做了许多处理，比如：

*   对数组无法拦截
    
*   对象属性的新增与删除无法拦截
    

对 Vue2 响应式原理感兴趣的，可以去查看之前的这篇文章：[【Vue 源码学习】响应式原理探秘](https://mp.weixin.qq.com/s?__biz=Mzg5NDExMzU1MA==&mid=2247485332&idx=1&sn=1cb030161fc2261c87bfe26057f95ef0&scene=21#wechat_redirect)

所以 Vue3 选择了使用 Proxy 这个核心 API 与对象的 getter 与 setter，**响应式机制的主要功能就是，可以把普通的 JavaScript 对象封装成为响应式对象，拦截数据的获取和修改操作，实现依赖数据的自动化更新。**接下来我们尝试动手实现：

### reactive

reactive 是通过 ES6 中 Proxy 来实现属性拦截的，所以我们可以先来实现一下：

```
const reactive =  <T extends object>(target: T) => {    // 限制reactive只能传递引用类型，如果传递的不是引用类型，则出警告并将原始值直接返回    if (typeof target !== 'object' || target === null) {        console.warn('Reactive can only be applied to objects');        return target    }    // 返回原始值的代理对象    returnnew Proxy(target, {        get(target, key, receiver) {            const value = Reflect.get(target, key, receiver);            // 这里需要收集依赖（后面实现）            track(target, key);            // 如果值是对象，则递归调用reactive            if (typeof value === 'object' && value !== null) {                return reactive(value);             }                        return value;        },        set(target, key, value, receiver) {            const result = Reflect.set(target, key, value, receiver);            // 这里需要触发更新（后面实现）            trigger(target, key)            return result;        },    })}exportdefault reactive;
```

`Proxy`有许多拦截方法，这里我们暂时只需要拦截`get`与`set`的操作

*   get 方法中除了需要返回最新的数据，还需要收集依赖
    
*   set 方法中除了更新数据，还需要执行上面收集的依赖
    

核心架构：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia79IWlJojdFOuib1Q7rBiaIT3nlGvjicKlwn6ib9p2hib8EPacMmVkGXSqpgDnicibnbPltPzwvszqz9Vx9w/640?wx_fmt=png&from=appmsg&watermark=1#imgIndex=0)

### track（依赖收集）

接着来实现一下 track 方法，该方法的主要作用就是收集依赖，**这里可以使用 Map 去进行存储依赖关系，`Map`的 key 就是我们的代理对象，而 value 还是一个嵌套的 map，存储代理对象的每个 key 以及对应的依赖函数数组，因为每个 key 都可以有多个依赖**

结构如图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia79IWlJojdFOuib1Q7rBiaIT3htiarWm40fTxib6joudUFeZoC8GJibRQV3pUlDmrd16NMZl73ZFFZTkXA/640?wx_fmt=png&from=appmsg#imgIndex=1)

```
const targetMap = new WeakMap()exportconst track = (target: object, key: PropertyKey) => {        // 先找到target对应的依赖    let depsMap = targetMap.get(target)    if(!depsMap) {        // 如果没找到，则说明是第一次收集，需要初始化        depsMap = new Map()        targetMap.set(target, depsMap)    }    // 接着需要对代理对象的属性进行依赖收集    let deps = depsMap.get(key)    if(!deps) {        deps = new Set()    }    if (!deps.has(activeEffect) && activeEffect) {         // 防止重复注册         deps.add(activeEffect)             }    depsMap.set(key, deps)    console.log(`Tracking ${String(key)} on`, target);};
```

### trigger（更新触发）

实现完 **track** 方法后，我们再来实现一下 **trigger**，该方法的主要作用就是**从 targetMap 中，根据 target 和 key 找到对应的依赖函数集合 deps，然后遍历 deps 执行依赖函数**

```
export const trigger = (target: object, key: PropertyKey) => {    // 先找到target对应的依赖map    // console.log('----',targetMap)    const depsMap = targetMap.get(target)    if(!depsMap) return    // 再找到对应属性的依赖    const deps = depsMap.get(key)    // 如果没有依赖可执行，则返回    if(!deps) return    // 最后遍历整个依赖set分别执行    console.log('--deps', deps)    deps.forEach(effect => {        effect?.()    })};
```

### effect（副作用管理）

最后我们再来实现 effect 副作用函数，该副作用函数主要是在依赖更新的时候调用，它接受一个函数，在被调用的时候执行这个函数

在 effectFn 函数内部，把函数赋值给全局变量 activeEffect；然后执行 fn() 的时候，就会触发响应式对象的 get 函数，get 函数内部就会把 activeEffect 存储到依赖地图中，完成依赖的收集

```
let activeEffectexport const effect = (fn: () => void) => {    const effectFn = () => {        activeEffect = effectFn        fn()    }    effectFn()}
```

**关键流程**：当 effect 执行时，内部函数会访问响应式数据，触发 getter→track→将当前 effect 存入依赖集合

### 验证

响应式底层的几个核心方法都实现了，现在需要来验证是否可行，比如：通过 reactive 处理的数据，在数据更新时对应页面内容也需要更新。

由于没有写虚拟 DOM 与 diff 算法的逻辑，所以更新的操作我们直接使用 DOM API 来代替，主要是验证依赖收集与触发更新的逻辑是否符合预期

```
<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <meta >        // ts 部分先编译成js        import reactive from'./reactive/reactive.js';        import { effect } from'./reactive/effect.js'        // 通过自定义reactive创建响应式数据        const state = reactive({            count: 0,            name: '南玖'        });        // 注册副作用函数，更新视图        effect(() => {            document.querySelector('#content').innerText = `name: ${state.name} --- car数量: ${state.count}`        })        // 按钮点击操作        document.querySelector('#countBtn').addEventListener('click', () => {            // 数据更新            state.count += 1        })        console.log(state); // 0    </script></body></html>
```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/aw5KtMic7pia79IWlJojdFOuib1Q7rBiaIT3FzXMXSfjIb4uSOPYs0tWoShvla19B3ZvoOBmPqp3TU4IhGbehphiaAg/640?wx_fmt=gif&from=appmsg#imgIndex=2)

  

到这里 reactive 的响应式原理就基本实现了，我们继续来实现一下 ref 的响应式逻辑

### ref

相比`reactive`，`ref`的实现原理更简单一些，由于`ref`即可以传递基本数据类型也可以传递引用数据类型，而`Proxy`只能只能接受引用数据类型。**所以 ref 采用的是面向对象的 getter 和 setter 拦截了 value 属性的读写，这也是为什么我们 ref 数据的 需要通过. value 访问的原因**

```
import { track, trigger } from'./effect'import  reactive  from'./reactive'const ref = (v) => {    returnnew RefImpl(v)}class RefImpl {    _value    constructor(v) {        this._value = convert(v)    }    get value() {        track(this, 'value')        returnthis._value    }    set value(val) {        if(val === this._value) return        this._value = convert(val)        console.log('触发更新')        trigger(this, 'value')    }}const convert = (v) => {    return isObject(v) ? reactive(v) : v}const isObject = (v) => {    returntypeof v === 'object' && v !== null}exportdefault ref
```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/aw5KtMic7pia79IWlJojdFOuib1Q7rBiaIT3tcy4V8Db3YnrQRkt8w3hUEvVYvXiaNa3eR6ao9JyEnRWrib1OuTW40Eg/640?wx_fmt=gif&from=appmsg#imgIndex=3)

  

对于引用类型的数据，`ref`底层会去调用`reactive`进行处理

总结
--

1.  **响应式核心三角**：
    
      
      
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia79IWlJojdFOuib1Q7rBiaIT3Hf7EDfqsVLo0VENxGU5ILX6DbOCOLTJeALAo4QliaT0YxNfaaI5GwSg/640?wx_fmt=png&from=appmsg&watermark=1#imgIndex=4)
    
2.  **reactive 核心**：
    

*   基于 Proxy 的深度代理
    
*   嵌套对象自动响应化
    
*   使用 WeakMap 存储依赖关系
    

4.  **ref 核心**：
    

*   getter/setter 拦截 value 访问
    
*   基本类型与引用类型统一处理
    
*   对象类型底层自动调用 reactive
    

6.  **性能优化点**：
    

*   相同值不触发更新
    
*   WeakMap 避免内存泄漏
    
*   依赖函数精确收集