> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/JYJGwV72_pMZWZuhUXSQ7Q)

背景
--

vue3 最新版本目前已更新至 3.5 了，很多同学经过这几年的使用，相信对 vue3 的常用 api 都已经烂熟于心了。

但每每被问到源码时，还是虽表面强装镇定，实则内心慌的一批。。。就比如我们经常使用的 reactive，很多同学最后就只会憋出一句：reactive 的原理是 proxy，然后……，就没有然后了

今天我就带着大家将 reactive 方法一撸到底。

总览
--

话不多说，直接上图，接下来将带着大家跟着这张图结合源码搞懂 reactive 的核心源码。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBbicsEjtzaLrOah8jheNibAiagwhNUkiaM9sTndMbRhuEzKsyp6sWgfbRmg/640?wx_fmt=other&from=appmsg)  

reactive
--------

上面这张图分为上中下三部分，我们一部分一部分进行拆解，首先是最上面部分，这其实就是 reactive 函数的核心代码

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBRibeDXYJE0zFCnd8iammpmGdicxHfjjfn0W7vO55f5YV5icCSjwpqy5eyA/640?wx_fmt=other&from=appmsg) 

假如我们有一个如下的 example.js 文件：

```
<script setup>
import { reactive，effect } from 'vue'
const obj = reactive({
   name: '法外狂徒张三'
})
effect(() => {
    document.getElementById('app').innerText = obj.name
})
</script>


```

当我们写下这段代码的时候，实际上是调用了 vue 中的 reactive 函数。我们可以在 vue 源码的`packages\reactivity\src\reactive.ts`中找到 reactive 函的实现：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDB02nrToKcoe3l0jILKZoibqN9hduAzuz51g6elVAVSHQo3gfRhv5EZOg/640?wx_fmt=other&from=appmsg)可以看到 reactive 函数的实现非常简单，就仅仅返回了一个`createReactiveObject`方法执行后的结果。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBvMHvwrxfXqzdnkTNsgtVXpaof6TMD9PskxcKicdcE6eNz8p7ScHlAnQ/640?wx_fmt=other&from=appmsg)

我们看到，`createReactiveObject`函数最终是会执行 new Proxy 生成一个 proxy 实例，如果不了解 Proxy 的同学可以自行去 MDN[1] 中学习，然后将这个 proxy 代理对象和 target 以键值对的方式建立联系，后续当同一个 target 对象再次执行 reactive 函数时，直接从 proxyMap 中获取，最终返回这个 proxy 代理对象。

所以，整个`reactive`函数确实只完成了一件事，那就是`生成并返回proxy代理对象`，这也是大多数同学探索 vue 实现响应式原理的终止点。

baseHandlers
------------

`reactive`函数生成的对象之所以能够实现响应式，是因为`Proxy`劫持了 target 对象的读取和写入操作，即`Proxy`的第二个参数：`baseHandlers`。接下来，进入中间部分：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBBvpibEveZ56W5dF2sibITncLbagYibniapZtW1dnOW68qibaibF4xF3ibde4w/640?wx_fmt=other&from=appmsg)

我们看看 vue 源码对`baseHandlers`的实现，进入`packages\reactivity\src\baseHandlers.ts`中我们可以看到以下代码 (不重要的代码都被我删除了)：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDB5JENqbJBKz3e2TwlxJnX9pPTMKJJibQuK953f5zIynMNic9aUPIWQywQ/640?wx_fmt=other&from=appmsg)

从`createReactiveObject`函数的参数，我们可以知道，`Proxy`构造函数中的第二个参数其实是`MutableReactiveHandler`实例，而`MutableReactiveHandler`继承了`BaseReactiveHandler`，因此该实例对象中会包含着一个`get`和`set`函数，这也是 vue 完成响应式原理的核心部分。

在`get`函数中，除了返回一个 `Reflect.get`[2] 的结果，还调用了一个`track`函数，`track`函数的实现在`packages\reactivity\src\dep.ts`中：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBlgwnWibZo8RicXsj4aict5sUdKKPAaiaMibzION9zuxBUPg0ia7daWCerGGA/640?wx_fmt=other&from=appmsg)  

`track`函数的作用是收集依赖。它最终会构造一个类型为 WeakMap[3] 的`targetMap`, 其键是我们传入的那个`target对象`，值是一个 Map[4] 类型的`depsMap`，`depsMap`中存放的才是`target对象`的`key`和`dep`的对应关系。而`dep`中存放的就是收集到的依赖。这么说起来有点绕，直接上图：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBwnRPShh53N2EiccexYzRRSE3hLTAOwGQ6Sb6tAthQjumIOenTxcIO6A/640?wx_fmt=other&from=appmsg)  

而在`set`中的`trigger`函数执行时，所有存储在`dep`中的依赖都会被挨个调用。

effect
------

我们可以看到，`dep`中的依赖是一个个的`ReactiveEffect实例`，而这个实例又是从何而来呢？这就要靠我们的`effect`函数了。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrVwQGIgzshwgqC9JLf2sDBle8Xeibpc3iaqiaMZN3JHPwSJaMlukpF6QT8sRIlsGZ3xKcMZanG3LNNg/640?wx_fmt=other&from=appmsg)`effect`函数需要传递一个函数作为参数，这个函数被称之为`副作用函数`。

在`effect`函数中，会调用一个`ReactiveEffect构造函数`生成`ReactiveEffect实例`，这个实例会作为依赖被收集。实例中有一个`run`方法，并且在`run`方法执行时会调用`effect`函数传入的参数，即，副作用函数。从而触发 proxy 代理对象中的 get 行为，将这个`ReactiveEffect实例`作为依赖收集到`dep`中

总结
--

最后总结一下 reactive 函数的执行流程：首先，当我们调用 reactive 函数并传入一个 target 对象时，reactive 内部会调用 createReactiveObject 函数生成并返回一个 proxy 代理对象。这个 proxy 代理对象中 get 方法会收集并以键值对的方式存储依赖，当改变对象的某个属性时，触发 proxy 的 set 函数，set 函数中的 trigger 函数会从之前存储的对象中循环调用所有依赖。

  

作者：啥也不会的码农

https://juejin.cn/post/7465330375663386650