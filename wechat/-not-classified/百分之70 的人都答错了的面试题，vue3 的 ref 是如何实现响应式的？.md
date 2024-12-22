> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iN8euOWLNu2H7_lAyab86w)

大家好，我是欧阳，又跟大家见面啦！  
欧阳建了一个高质量 vue 源码交流群，扫描文末的二维码加欧阳微信，拉你进群。

前言
==

最近在我的`vue源码交流群`有位面试官分享了一道他的面试题：**vue3 的 ref 是如何实现响应式的？**下面有不少小伙伴回答的是`Proxy`，**其实这些小伙伴只回答对了一半**。![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFurs298SGqgic03Mb5j39UNmtib7BU29oEwC6jFvJEwpvIHjH4TFMVju0jdOjuKL6sfU1ibaxwIQIfBw/640?wx_fmt=png&from=appmsg)

*   当 ref 接收的是一个对象时确实是依靠`Proxy`去实现响应式的。
    
*   但是 ref 还可以接收 `string`、`number` 或 `boolean` 这样的原始类型，当是原始类型时，响应式就不是依靠`Proxy`去实现的，而是在`value`属性的`getter`和`setter`方法中去实现的响应式。
    

本文将通过 debug 的方式带你搞清楚当 ref 接收的是对象和原始类型时，分别是如何实现响应式的。注：本文中使用的 vue 版本为`3.4.19`。

看个 demo
=======

还是老套路，我们来搞个 demo，`index.vue`文件代码如下：

```
<template>  <div>    <p>count的值为：{{ count }}</p>    <p>user.count的值为：{{ user.count }}</p>    <button @click="count++">count++</button>    <button @click="user.count++">user.count++</button>  </div></template><script setup lang="ts">import { ref } from "vue";const count = ref(0);const user = ref({  count: 0,});</script>
```

在上面的 demo 中我们有两个 ref 变量，`count`变量接收的是原始类型，他的值是数字 0。

`count`变量渲染在 template 的 p 标签中，并且在 button 的 click 事件中会`count++`。

`user`变量接收的是对象，对象有个`count`属性。

同样`user.count`也渲染在另外一个 p 标签上，并且在另外一个 button 的 click 事件中会`user.count++`。

接下来我将通过 debug 的方式带你搞清楚，分别点击`count++`和`user.count++`按钮时是如何实现响应式的。

开始打断点
=====

第一步从哪里开始下手打断点呢？

既然是要搞清楚 ref 是如何实现响应式的，那么当然是给 ref 打断点吖，所以我们的第一个断点是打在`const count = ref(0);`代码处。这行代码是运行时代码，是跑在浏览器中的。

要在浏览器中打断点，需要在浏览器的 source 面板中打开`index.vue`文件，然后才能给代码打上断点。

那么第二个问题来了，如何在 source 面板中找到我们这里的`index.vue`文件呢？

很简单，像是在 vscode 中一样使用`command+p`（windows 中应该是 control+p）就可以唤起一个输入框。在输入框里面输入`index.vue`，然后点击回车就可以在 source 面板中打开`index.vue`文件。如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFurs298SGqgic03Mb5j39UNmGOtBqs9t4VubDOjoDCv7VbfoxFS1TVhviarNQ4zjocviccPkx7IpAocQ/640?wx_fmt=png&from=appmsg)

然后我们就可以在浏览器中给`const count = ref(0);`处打上断点了。

`RefImpl`类
==========

刷新页面此时断点将会停留在`const count = ref(0);`代码处，让断点走进`ref`函数中。在我们这个场景中简化后的`ref`函数代码如下：

```
function ref(value) {  return createRef(value, false);}
```

可以看到在`ref`函数中实际是直接调用了`createRef`函数。

接着将断点走进`createRef`函数，在我们这个场景中简化后的`createRef`函数代码如下：

```
function createRef(rawValue, shallow) {  return new RefImpl(rawValue, shallow);}
```

从上面的代码可以看到实际是调用`RefImpl`类 new 了一个对象，传入的第一个参数是`rawValue`，也就是 ref 绑定的变量值，这个值可以是原始类型，也可以是对象、数组等。

接着将断点走进`RefImpl`类中，在我们这个场景中简化后的`RefImpl`类代码如下：

```
class RefImpl {  private _value: T  private _rawValue: T  constructor(value) {    this._rawValue = toRaw(value);    this._value = toReactive(value);  }  get value() {    trackRefValue(this);    return this._value;  }  set value(newVal) {    newVal = toRaw(newVal);    if (hasChanged(newVal, this._rawValue)) {      this._rawValue = newVal;      this._value = toReactive(newVal);      triggerRefValue(this, 4, newVal);    }  }}
```

从上面的代码可以看到`RefImpl`类由三部分组成：`constructor`构造函数、`value`属性的`getter`方法、`value`属性的`setter`方法。

`RefImpl`类的`constructor`构造函数
----------------------------

`constructor`构造函数中的代码很简单，如下：

```
constructor(value) {  this._rawValue = toRaw(value);  this._value = toReactive(value);}
```

在构造函数中首先会将`toRaw(value)`的值赋值给`_rawValue`属性中，这个`toRaw`函数是 vue 暴露出来的一个 API，他的作用是根据一个 Vue 创建的代理返回其原始对象。因为`ref`函数不光能够接受普通的对象和原始类型，而且还能接受一个 ref 对象，所以这里需要使用`toRaw(value)`拿到原始值存到`_rawValue`属性中。

接着在构造函数中会执行`toReactive(value)`函数，将其执行结果赋值给`_value`属性。`toReactive`函数看名字你应该也猜出来了，如果接收的 value 是原始类型，那么就直接返回 value。如果接收的 value 不是原始类型（比如对象），那么就返回一个 value 转换后的响应式对象。这个`toReactive`函数我们在下面会讲。

`_rawValue`属性和`_value`属性都是`RefImpl`类的私有属性，用于在`RefImpl`类中使用的，而暴露出去的也只有`value`属性。

经过`constructor`构造函数的处理后，分别给两个私有属性赋值了：

*   `_rawValue`中存的是 ref 绑定的值的原始值。
    
*   如果 ref 绑定的是原始类型，比如数字 0，那么`_value`属性中存的就是数字 0。
    
    如果 ref 绑定的是一个对象，那么`_value`属性中存的就是绑定的对象转换后的响应式对象。
    

`RefImpl`类的`value`属性的`getter`方法
-------------------------------

我们接着来看`value`属性的`getter`方法，代码如下：

```
get value() {  trackRefValue(this);  return this._value;}
```

当我们对 ref 的 value 属性进行读操作时就会走到`getter`方法中。

我们知道 template 经过编译后会变成 render 函数，执行 render 函数会生成虚拟 DOM，然后由虚拟 DOM 生成真实 DOM。

在执行 render 函数期间会对`count`变量进行读操作，所以此时会触发`count`变量的`value`属性对应的`getter`方法。

在`getter`方法中会调用`trackRefValue`函数进行依赖收集，由于此时是在执行 render 函数期间，所以收集的依赖就是 render 函数。

最后在`getter`方法中会 return 返回`_value`私有属性。

`RefImpl`类的`value`属性的`setter`方法
-------------------------------

我们接着来看`value`属性的`setter`方法，代码如下：

```
set value(newVal) {  newVal = toRaw(newVal);  if (hasChanged(newVal, this._rawValue)) {    this._rawValue = newVal;    this._value = toReactive(newVal);    triggerRefValue(this, 4, newVal);  }}
```

当我们对 ref 的 value 的属性进行写操作时就会走到`setter`方法中，比如点击`count++`按钮，就会对`count`的值进行`+1`，触发写操作走到`setter`方法中。

给`setter`方法打个断点，点击`count++`按钮，此时断点将会走到`setter`方法中。初始化`count`的值为 0，此时点击按钮后新的`count`值为 1，所以在`setter`方法中接收的`newVal`的值为 1。如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFurs298SGqgic03Mb5j39UNmThpme9ibBycSSzmuwr2NV4odMs0LEtXJicofUzPxZhU8AU03SeQmBgYA/640?wx_fmt=png&from=appmsg)

从上图中可以看到新的值`newVal`的值为 1，旧的值`this._rawValue`的值为 0。然后使用`if (hasChanged(newVal, this._rawValue))`判断新的值和旧的值是否相等，`hasChanged`的代码也很简单，如下：

```
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
```

`Object.is`方法大家平时可能用的比较少，作用也是判断两个值是否相等。和`==`的区别为`Object.is`不会进行强制转换，其他的区别大家可以参看 mdn 上的文档。

使用`hasChanged`函数判断到新的值和旧的值不相等时就会走到 if 语句里面，首先会执行`this._rawValue = newVal`将私有属性`_rawValue`的值更新为最新值。接着就是执行`this._value = toReactive(newVal)`将私有属性`_value`的值更新为最新值。

最后就是执行`triggerRefValue`函数触发收集的依赖，前面我们讲过了在执行 render 函数期间由于对`count`变量进行读操作。触发了`getter`方法，在`getter`方法中将 render 函数作为依赖进行收集了。

所以此时执行`triggerRefValue`函数时会将收集的依赖全部取出来执行一遍，由于 render 函数也是被收集的依赖，所以 render 函数会重新执行。重新执行 render 函数时从`count`变量中取出的值就是新值 1，接着就是生成虚拟 DOM，然后将虚拟 DOM 挂载到真实 DOM 上，最终在页面上`count`变量绑定的值已经更新为 1 了。

看到这里你是不是以为关于 ref 实现响应式已经完啦？

我们来看 demo 中的第二个例子，`user`对象，回顾一下在 template 和 script 中关于`user`对象的代码如下：

```
<template>  <div>    <p>user.count的值为：{{ user.count }}</p>    <button @click="user.count++">user.count++</button>  </div></template><script setup lang="ts">import { ref } from "vue";const user = ref({  count: 0,});</script>
```

在 button 按钮的 click 事件中执行的是：`user.count++`，前面我们讲过了对 ref 的 value 属性进行写操作会走到`setter`方法中。但是我们这里 ref 绑定的是一个对象，点击按钮时也不是对`user.value`属性进行写操作，而是对`user.value.count`属性进行写操作。所以在这里点击按钮不会走到`setter`方法中，当然也不会重新执行收集的依赖。

那么当 ref 绑定的是对象时，我们改变对象的某个属性时又是怎么做到响应式更新的呢？

这种情况就要用到`Proxy`了，还记得我们前面讲过的`RefImpl`类的`constructor`构造函数吗？代码如下：

```
class RefImpl {  private _value: T  private _rawValue: T  constructor(value) {    this._rawValue = toRaw(value);    this._value = toReactive(value);  }}
```

其实就是这个`toReactive`函数在起作用。

`Proxy`实现响应式
============

还是同样的套路，这次我们给绑定对象的名为`user`的 ref 打个断点，刷新页面代码停留在断点中。还是和前面的流程一样最终断点走到`RefImpl`类的构造函数中，当代码执行到`this._value = toReactive(value)`时将断点走进`toReactive`函数。代码如下：

```
const toReactive = (value) => (isObject(value) ? reactive(value) : value);
```

在`toReactive`函数中判断了如果当前的`value`是对象，就返回`reactive(value)`，否则就直接返回 value。这个`reactive`函数你应该很熟悉，他会返回一个对象的响应式代理。因为`reactive`不接收 number 这种原始类型，所以这里才会判断`value`是否是对象。

我们接着将断点走进`reactive`函数，看看他是如何返回一个响应式对象的，在我们这个场景中简化后的`reactive`函数代码如下：

```
function reactive(target) {  return createReactiveObject(    target,    false,    mutableHandlers,    mutableCollectionHandlers,    reactiveMap  );}
```

从上面的代码可以看到在`reactive`函数中是直接返回了`createReactiveObject`函数的调用，第三个参数是`mutableHandlers`。从名字你可能猜到了，他是一个 Proxy 对象的处理器对象，后面会讲。

接着将断点走进`createReactiveObject`函数，在我们这个场景中简化后的代码如下：

```
function createReactiveObject(  target,  isReadonly2,  baseHandlers,  collectionHandlers,  proxyMap) {  const proxy = new Proxy(target, baseHandlers);  return proxy;}
```

在上面的代码中我们终于看到了大名鼎鼎的`Proxy`了，这里 new 了一个`Proxy`对象。new 的时候传入的第一个参数是`target`，这个`target`就是我们一路传进来的 ref 绑定的对象。第二个参数为`baseHandlers`，是一个 Proxy 对象的处理器对象。这个`baseHandlers`是调用`createReactiveObject`时传入的第三个参数，也就是我们前面讲过的`mutableHandlers`对象。

在这里最终将 Proxy 代理的对象进行返回，我们这个 demo 中 ref 绑定的是一个名为`user`的对象，经过前面讲过函数的层层 return 后，`user.value`的值就是这里 return 返回的`proxy`对象。

当我们对`user.value`响应式对象的属性进行读操作时，就会触发这里 Proxy 的 get 拦截。

当我们对`user.value`响应式对象的属性进行写操作时，就会触发这里 Proxy 的 set 拦截。

`get`和`set`拦截的代码就在`mutableHandlers`对象中。

`Proxy`的`set`和`get`拦截
---------------------

在源码中使用搜一下`mutableHandlers`对象，看到他的代码是这样的，如下：

```
const mutableHandlers = new MutableReactiveHandler();
```

从上面的代码可以看到`mutableHandlers`对象是使用`MutableReactiveHandler`类 new 出来的一个对象。

我们接着来看`MutableReactiveHandler`类，在我们这个场景中简化后的代码如下：

```
class MutableReactiveHandler extends BaseReactiveHandler {  set(target, key, value, receiver) {    let oldValue = target[key];    const result = Reflect.set(target, key, value, receiver);    if (target === toRaw(receiver)) {      if (hasChanged(value, oldValue)) {        trigger(target, "set", key, value, oldValue);      }    }    return result;  }}
```

在上面的代码中我们看到了`set`拦截了，但是没有看到`get`拦截。

`MutableReactiveHandler`类是继承了`BaseReactiveHandler`类，我们来看看`BaseReactiveHandler`类，在我们这个场景中简化后的`BaseReactiveHandler`类代码如下：

```
class BaseReactiveHandler {  get(target, key, receiver) {    const res = Reflect.get(target, key, receiver);    track(target, "get", key);    return res;  }}
```

在`BaseReactiveHandler`类中我们找到了`get`拦截，当我们对 Proxy 代理返回的对象的属性进行读操作时就会走到`get`拦截中。

前面讲过了经过层层 return 后`user.value`的值就是这里的`proxy`响应式对象，而我们在 template 中使用`user.count`将其渲染到 p 标签上，在 template 中读取`user.count`，实际就是在读取`user.value.count`的值。

同样的 template 经过编译后会变成 render 函数，执行 render 函数会生成虚拟 DOM，然后将虚拟 DOM 转换为真实 DOM 渲染到浏览器上。在执行 render 函数期间会对`user.value.count`进行读操作，所以会触发`BaseReactiveHandler`这里的`get`拦截。

在`get`拦截中会执行`track(target, "get", key)`函数，执行后会将当前 render 函数作为依赖进行收集。到这里依赖收集的部分讲完啦，剩下的就是依赖触发的部分。

我们接着来看`MutableReactiveHandler`，他是继承了`BaseReactiveHandler`。在`BaseReactiveHandler`中有个`get`拦截，而在`MutableReactiveHandler`中有个`set`拦截。

当我们点击`user.count++`按钮时，会对`user.value.count`进行写操作。由于对`count`属性进行了写操作，所以就会走到`set`拦截中，`set`拦截代码如下：

```
class MutableReactiveHandler extends BaseReactiveHandler {  set(target, key, value, receiver) {    let oldValue = target[key];    const result = Reflect.set(target, key, value, receiver);    if (target === toRaw(receiver)) {      if (hasChanged(value, oldValue)) {        trigger(target, "set", key, value, oldValue);      }    }    return result;  }}
```

我们先来看看`set`拦截接收的 4 个参数，第一个参数为`target`，也就是我们 proxy 代理前的原始对象。第二个参数为`key`，进行写操作的属性，在我们这里`key`的值就是字符串`count`。第三个参数是新的属性值。

第四个参数`receiver`一般情况下是 Proxy 返回的代理响应式对象。这里为什么会说是一般是呢？看一下 MDN 上面的解释你应该就能明白了：

> 假设有一段代码执行 `obj.name = "jen"`， `obj` 不是一个 proxy，且自身不含 `name` 属性，但是它的原型链上有一个 proxy，那么，那个 proxy 的 `set()` 处理器会被调用，而此时，`obj` 会作为 receiver 参数传进来。

接着来看`set`拦截函数中的内容，首先`let oldValue = target[key]`拿到旧的属性值，然后使用`Reflect.set(target, key, value, receiver)`

在`Proxy`中一般都是搭配`Reflect`进行使用，在`Proxy`的`get`拦截中使用`Reflect.get`，在`Proxy`的`set`拦截中使用`Reflect.set`。

这样做有几个好处，在 set 拦截中我们要 return 一个布尔值表示属性赋值是否成功。如果使用传统的`obj[key] = value`的形式我们是不知道赋值是否成功的，而使用`Reflect.set`会返回一个结果表示给对象的属性赋值是否成功。在 set 拦截中直接将`Reflect.set`的结果进行 return 即可。

还有一个好处是如果不搭配使用可能会出现`this`指向不对的问题。

前面我们讲过了`receiver`可能不是 Proxy 返回的代理响应式对象，所以这里需要使用`if (target === toRaw(receiver))`进行判断。

接着就是使用`if (hasChanged(value, oldValue))`进行判断新的值和旧的值是否相等，如果不相等就执行`trigger(target, "set", key, value, oldValue)`。

这个`trigger`函数就是用于依赖触发，会将收集的依赖全部取出来执行一遍，由于 render 函数也是被收集的依赖，所以 render 函数会重新执行。重新执行 render 函数时从`user.value.count`属性中取出的值就是新值 1，接着就是生成虚拟 DOM，然后将虚拟 DOM 挂载到真实 DOM 上，最终在页面上`user.value.count`属性绑定的值已经更新为 1 了。

这就是当 ref 绑定的是一个对象时，是如何使用 Proxy 去实现响应式的过程。

看到这里有的小伙伴可能会有一个疑问，为什么 ref 使用`RefImpl`类去实现，而不是统一使用`Proxy`去代理一个拥有`value`属性的普通对象呢？比如下面这种：

```
const proxy = new Proxy(  {    value: target,  },  baseHandlers);
```

如果是上面这样做那么就不需要使用`RefImpl`类了，全部统一成 Proxy 去使用响应式了。

但是上面的做法有个问题，就是使用者可以使用`delete proxy.value`将`proxy`对象的`value`属性给删除了。而使用`RefImpl`类的方式去实现就不能使用`delete`的方法去将`value`属性给删除了。

总结
==

这篇文章我们讲了`ref`是如何实现响应式的，主要分为两种情况：ref 接收的是 number 这种原始类型、ref 接收的是对象这种非原始类型。

*   当 ref 接收的是 number 这种原始类型时是依靠`RefImpl`类的`value`属性的`getter`和`setter`方法中去实现的响应式。
    
    当我们对 ref 的 value 属性进行读操作时会触发 value 的`getter`方法进行依赖收集。
    
    当我们对 ref 的 value 属性进行写操作时会进行依赖触发，重新执行 render 函数，达到响应式的目的。
    
*   当 ref 接收的是对象这种非原始类型时，会调用`reactive`方法将 ref 的 value 属性转换成一个由`Proxy`实现的响应式对象。
    
    当我们对 ref 的 value 属性对象的某个属性进行读操作时会触发`Proxy`的 get 拦截进行依赖收集。
    
    当我们对 ref 的 value 属性对象的某个属性进行写操作时会触发`Proxy`的 set 拦截进行依赖触发，然后重新执行 render 函数，达到响应式的目的。
    

最后我们讲了为什么 ref 不统一使用`Proxy`去代理一个有`value`属性的普通对象去实现响应式，而是要多搞个`RefImpl`类。

因为如果使用`Proxy`去代理的有 value 属性的普通的对象，可以使用`delete proxy.value`将`proxy`对象的`value`属性给删除了。而使用`RefImpl`类的方式去实现就不能使用`delete`的方法去将`value`属性给删除了。

长按图片加欧阳微信，拉你进欧阳的高质量 vue 源码交流群，群里可谓是藏龙卧虎。  

![](https://mmbiz.qpic.cn/mmbiz_jpg/8hhrUONQpFvj3tceZOHVCHAt7YibzKNqW9WZBLQYMugDqbp2ibfS4Dzcj8yXKgZCzHKK5dT3HMRKnticwibd0eyxvw/640?wx_fmt=jpeg&from=appmsg)

关注公众号，发送消息：

666，领取欧阳研究 vue 源码过程中收集的源码资料。欧阳写文章有时也会参考这些资料，同时让你的朋友圈多一位对 vue 有深入理解的人。

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本公众号星标，看完文章后记得点下赞或者在看，谢谢各位！