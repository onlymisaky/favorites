> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EvNUdI6AZuxJSam_jyJ-pw)

大家好，我是欧阳！

本文约`1500+`字，整篇阅读大约需要 8 分钟。

前言
==

众所周知，vue3 的 template 中使用 ref 变量无需使用`.value`。还可以在事件处理器中进行赋值操作时，无需使用`.value`就可以直接修改 ref 变量的值，比如：`<button @click="msg = 'Hello Vue3'">change msg</button>`。你猜 vue 是在编译时就已经在代码中生成了`.value`，还是运行时使用 Proxy 拦截的方式去实现的呢？注：本文中使用的 vue 版本为`3.4.19`。

看个 demo
=======

看个简单的 demo，代码如下：

```
<template>  <p>{{ msg }}</p>  <button @click="msg = 'Hello Vue3'">change msg</button></template><script setup lang="ts">import { ref } from "vue";const msg = ref("Hello World");console.log(msg.value);</script>
```

上面的代码很简单，在 script 中想要访问`msg`变量的值需要使用`msg.value`。但是在 template 中将`msg`变量渲染到 p 标签上面时就是直接使用`{{ msg }}`，在`click`的事件处理器中给`msg`变量赋新的值时也没有使用到`.value`。

然后在浏览器中找到上面这个 vue 文件编译后的样子，在之前的文章中已经讲过很多次如何在浏览器中查看编译后的 vue 文件，这篇文章就不赘述了。编译后的代码如下：

```
import {  Fragment as _Fragment,  createElementBlock as _createElementBlock,  createElementVNode as _createElementVNode,  defineComponent as _defineComponent,  openBlock as _openBlock,  toDisplayString as _toDisplayString,  ref,} from "/node_modules/.vite/deps/vue.js?v=23bfe016";const _sfc_main = _defineComponent({  __name: "index",  setup() {    const msg = ref("Hello World");    console.log(msg.value);    const __returned__ = { msg };    return __returned__;  },});function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {  return (    _openBlock(),    _createElementBlock(      _Fragment,      null,      [        _createElementVNode("p", null, _toDisplayString($setup.msg), 1),        _createElementVNode(          "button",          {            onClick:              _cache[0] ||              (_cache[0] = ($event) => ($setup.msg = "Hello Vue3")),          },          "change msg"        ),      ],      64    )  );}_sfc_main.render = _sfc_render;export default _sfc_main;
```

vue 文件编译后的代码主要分为两块：`_sfc_main`和`_sfc_render`。

*   `_sfc_main`中主要是 setup 方法，这个是 vue 的`<script setup lang="ts">`部分编译后的样子。从上面可以看到在编译后的 setup 方法中，访问`msg`变量时依然使用了`msg.value`，并且在 setup 方法中 return 了`{ msg }`对象。
    
*   `_sfc_render`就是我们熟悉的 render 函数，在 render 函数中渲染 p 标签部分的内容是：`_toDisplayString($setup.msg)`。很明显这个`toDisplayString`就是一个将输入值转换为字符串的函数，并没有处理`.value`。
    
    `$setup.msg`中的`$setup.`，我想你猜到了应该和前面这个`setup`方法中 return 的`{ msg }`对象有关，但是又不是直接使用`setup`方法中 return 的`{ msg }`对象，因为使用 setup 中的`msg`变量需要使用`.value`，在编译后的 render 函数中并**没有**帮我们自动生成一个`.value`，比如这样的代码：`$setup.msg.value`。
    
    同样的在 render 函数中，button 的 click 事件给`msg`变量赋值时**也没有**帮我们生成一个类似于这样的代码：`$setup.msg.value = "Hello Vue3"`，而是`$setup.msg = "Hello Vue3"`。
    
    从 render 函数中可以看出在 template 中使用 ref 变量无需使用`.value`，并不是编译时就已经在代码中生成了`.value`，比如`$setup.msg.value`，而是通过 Proxy 的方式去实现的。
    

render 函数
=========

在 render 函数中读和写`msg`变量都变成了`$setup.msg`，而这个`$setup`对象又是调用 render 函数时传入的第四个参数。现在我们需要搞清楚调用 render 函数时传入的第四个参数到底是什么？给 render 函数打一个断点，刷新页面，此时代码走到了断点里面，如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvJ6GoFqdibmCsd8BKXVySXmhvLQtI6m0abic7OrQ2cHTGEiaXXEqIbBy2M4IK0ZKF5ufSiasCeVDcSwg/640?wx_fmt=png&from=appmsg)

右边的 Call Stack 表示当前函数的调用链，从调用链中可以看到 render 函数是由一个名为`renderComponentRoot`的函数调用的。

点击 Call Stack 中的`renderComponentRoot`，代码会跳转到`renderComponentRoot`函数中，在我们这个场景中简化后的`renderComponentRoot`函数代码如下：

```
function renderComponentRoot(instance) {  const {    props,    data,    setupState,    render: render2,    // 省略...  } = instance;  render2.call(    thisProxy,    proxyToUse,    renderCache,    props,    setupState,    data,    ctx  );}
```

这里的`render2`也就是我们的 render 函数，由于使用了`.call`，所以调用 render 函数时传入的第四个参数为`setupState`对象。而`setupState`对象的值又是从`instance.setupState`而来的。

**通过 debug 调试 render 函数我们发现，在 render 函数中渲染`msg`变量是使用`$setup.msg`，而`$setup`对象的值是从`instance.setupState`对象上面来的。**

前面讲过了编译后的`setup`方法会返回一个包含`msg`属性的对象，而这个`$setup`对象也就是`instance.setupState`肯定是和`setup`方法返回的对象有关系的。所以接下来我们需要去 debug 调试 setup 方法搞清楚他们到底是什么关系。

setup 方法
========

将 render 函数中的断点去掉，然后给 setup 方法打一个断点。刷新页面，此时代码会走到断点中，如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvJ6GoFqdibmCsd8BKXVySXmq5VlUIyYMOSsoUm9eBqxhIMvKicurJdN75TrZ9BOG7qTGONiaUHvMDQw/640?wx_fmt=png&from=appmsg)

同理在 Call Stack 中可以看到调用 setup 方法的是`callWithErrorHandling`函数，点击 Call Stack 中的`callWithErrorHandling`，代码会跳转到`callWithErrorHandling`函数中。代码如下：

```
function callWithErrorHandling(fn, instance, type, args) {  try {    return args ? fn(...args) : fn();  } catch (err) {    handleError(err, instance, type);  }}
```

从上面可以看到在`callWithErrorHandling`函数中只是进行了错误处理，并不是我们想要找的。

`setupStatefulComponent`函数
--------------------------

从 Call Stack 中可以看到调用`callWithErrorHandling`函数的是`setupStatefulComponent`函数，点击 Call Stack 中的`setupStatefulComponent`，代码会跳转到`setupStatefulComponent`函数中。在我们这个场景中简化后的`setupStatefulComponent`函数代码如下：

```
function setupStatefulComponent(instance) {  const Component = instance.type;  const { setup } = Component;  const setupResult = callWithErrorHandling(setup, instance);  handleSetupResult(instance, setupResult);}
```

从上面的代码可以看到确实是使用`callWithErrorHandling`函数执行了 setup 方法，并且还将 setup 方法的返回值对象赋值给了`setupResult`变量。然后以`instance`（vue 实例）和`setupResult`（setup 方法的返回值）为参数，调用了`handleSetupResult`函数。

`handleSetupResult`函数
---------------------

将断点走进`handleSetupResult`函数，在我们这个场景中简化后的`handleSetupResult`函数代码如下：

```
function handleSetupResult(instance, setupResult) {  instance.setupState = proxyRefs(setupResult);}
```

我们在 render 函数中渲染`msg`变量是使用`$setup.msg`，而`$setup`对象的值是从`instance.setupState`对象上面来的。

现在我们已经找到了`instance.setupState`是在这里赋值的，它的值是`proxyRefs`函数的返回结果。

`proxyRefs`函数
-------------

将断点走进`proxyRefs`函数，代码如下：

```
function proxyRefs(objectWithRefs) {  return isReactive(objectWithRefs)    ? objectWithRefs    : new Proxy(objectWithRefs, shallowUnwrapHandlers);}
```

这个`isReactive`函数是 vue 暴露出来的一个 API，它的作用是检查一个对象是否是由 reactive() 或 shallowReactive() 创建的代理。

这里的`objectWithRefs`对象就是`setup`方法的返回值对象，通过前面我们知道`setup`方法的返回值对象就是一个普通的 js 对象，并不是 reactive 的。所以`proxyRefs`函数会返回三目运算符冒号（`:`）后面的表达式，也就是使用`Proxy`创建的`setup`方法返回值对象代理。

我们接着来看`shallowUnwrapHandlers`里面做了哪些事情，代码如下：

```
const shallowUnwrapHandlers = {  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),  set: (target, key, value, receiver) => {    const oldValue = target[key];    if (isRef(oldValue) && !isRef(value)) {      oldValue.value = value;      return true;    } else {      return Reflect.set(target, key, value, receiver);    }  },};
```

这个 handler 包含 get 和 set 方法，会对 setup 的返回值对象进行拦截。

当在 render 函数中渲染 p 标签时会去读`$setup.msg`，就会走到 get 的拦截中。在 get 方法中使用到了`Reflect.get`方法和`unref`函数。

*   `Reflect.get(target, key, receiver)`的作用是获取`target`对象的`key`属性，在我们这里就是获取 setup 返回值对象的`msg`属性，也就是我们定义的`msg`变量。并且这个`msg`变量是一个 ref。
    
*   将`Reflect.get`方法拿到的`msg`变量传给`unref`函数，这个`unref`函数同样是暴露出来的一个 API。如果参数是 ref，则返回内部值，否则返回参数本身。这是 `val = isRef(val) ? val.value : val` 计算的一个语法糖。
    
    经过`unref`函数的处理后，在 get 拦截中 return 的就是`.value`后的内容，也就是`msg.value`。
    
    **所以在 template 中使用 ref 变量无需使用`.value`，是因为在 Proxy 的 get 拦截中已经帮我们自动处理了. value。**当在 render 函数中去对 ref 变量进行赋值，比如：`<button @click="msg = 'Hello Vue3'">change msg</button>`。就会走到 set 拦截中，首先会执行`const oldValue = target[key]`。这里的 key 就是 "msg"，target 就是 setup 函数返回值对象。使用`oldValue`就是`msg`变量，是一个 ref。
    

由于我们在 click 事件中要将`msg`赋值成'Hello Vue3'字符串，所以在 set 拦截中拿到的新 value 为'Hello Vue3'字符串。

接着执行`if (isRef(oldValue) && !isRef(value))`判断，这里的`oldValue`前面已经讲过了是一个名为`msg`的 ref 变量，所以`isRef(oldValue)` 为 true。`value`为'Hello Vue3'字符串，所以! isRef(value) 也是为 true。

代码就会走进 if 判断中执行`oldValue.value = value`，也就是在执行`msg.value = 'Hello Vue3'`。

**所以在 template 中给 ref 变量赋值无需使用`.value`，是因为在 Proxy 的 set 拦截中也帮我们自动处理了`.value`。**

总结
==

整个流程图如下：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvJ6GoFqdibmCsd8BKXVySXmnyZQ0EuRzFLT9rQby59NibeIhUiavoC3s2Kf1FAP7xg0ibSHFLiaOlicSeQ/640?wx_fmt=png&from=appmsg)

在 vue3 的 template 中使用 ref 变量无需使用`.value`，是因为有个 Proxy 的 get 拦截，在 get 拦截中会自动帮我们去取 ref 变量的`.value`属性。

同样的在 template 中对 ref 变量进行赋值也无需使用`.value`，也是有个 Proxy 的 set 拦截，在 set 拦截中会自动帮我们去给 ref 变量的`.value`属性进行赋值。

关注我，给自己一个进阶 vue 的机会。加我微信回复「666」，免费领取欧阳研究 vue 源码过程中收集的源码资料。

欧阳写文章有时也会参考这些资料，同时让你的朋友圈多一位对 vue 有深入理解的人。  

![](https://mmbiz.qpic.cn/mmbiz_jpg/8hhrUONQpFvj3tceZOHVCHAt7YibzKNqW9WZBLQYMugDqbp2ibfS4Dzcj8yXKgZCzHKK5dT3HMRKnticwibd0eyxvw/640?wx_fmt=jpeg&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_gif/8hhrUONQpFvdeyMW69cMo38Wibkctm7mE3wFDNBNZkF5bAngy9JCfhBZgmLnMT3ibDxq38HnmkkhXedfC6vIEOuQ/640?wx_fmt=gif&from=appmsg)