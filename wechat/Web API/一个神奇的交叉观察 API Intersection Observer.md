> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fu6VqPfWn7mB7evopnDeLA)

前言
==

前端开发肯定离不开判断一个元素是否能被用户看见，然后再基于此进行一些交互。

> 过去，要检测一个元素是否可见或者两个元素是否相交并不容易，很多解决办法不可靠或性能很差。然而，随着互联网的发展，这种需求却与日俱增，比如，下面这些情况都需要用到相交检测：
> 
> *   图片懒加载——当图片滚动到可见时才进行加载
>     
> *   内容无限滚动——也就是用户滚动到接近内容底部时直接加载更多，而无需用户操作翻页，给用户一种网页可以无限滚动的错觉
>     
> *   检测广告的曝光情况——为了计算广告收益，需要知道广告元素的曝光情况
>     
> *   在用户看见某个区域时执行任务或播放动画
>     
> 
> 过去，相交检测通常要用到事件监听，并且需要频繁调用 `Element.getBoundingClientRect()` 方法以获取相关元素的边界信息。事件监听和调用 `Element.getBoundingClientRect()`  都是在主线程上运行，因此频繁触发、调用可能会造成性能问题。这种检测方法极其怪异且不优雅。

上面这一段话来自 `MDN` ，中心思想就是现在判断一个元素是否能被用户看见的使用场景越来越多，监听 `scroll` 事件以及通过 `Element.getBoundingClientRect()` 获取节点位置的方式，又麻烦又不好用，那么怎么办呢。于是就有了今天的内容 **Intersection Observer API**。

Intersection Observer API 是什么
=============================

我们需要观察的元素被称为 **目标元素 (target)**，设备视窗或者其他指定的元素视口的边界框我们称它为 **根元素** (**root**)，或者简称为 **根** 。

`Intersection Observer API` 翻译过来叫做 **“交叉观察器”**，因为判断元素是否可见（**通常情况下**）的本质就是判断目标元素和根元素是不是产生了 **交叉区域** 。

为什么是通常情况下，因为当我们 `css` 设置了 `opacity: 0`，`visibility: hidden` 或者 `用其他的元素覆盖目标元素` 的时候，对于视图来说是不可见的，但对于交叉观察器来说是可见的。这里可能有点抽象，大家只需记住，交叉观察器只关心 **目标元素** 和 **根元素** 是否有 **交叉区域**， 而不管视觉上能不能看见这个元素。当然如果设置了 `display：none`，那么交叉观察器就不会生效了，其实也很好理解，因为元素已经不存在了，那么也就监测不到了。

> 一句话总结：**Intersection Observer API** 提供了一种异步检测目标元素与祖先元素或 **viewport** 相交情况变化的方法。 -- MDN

现在不懂没关系，咱们接着往下看，看完自然就明白了。

Intersection Observer API 怎么玩
=============================

生成观察器
-----

```
// 调用构造函数 IntersectionObserver 生成观察器const myObserver = new IntersectionObserver(callback, options);  复制代码
```

首先调用浏览器原生构造函数 `IntersectionObserver` ，构造函数的返回值是一个 **观察器实例** 。

构造函数 `IntersectionObserver` 接收两个参数

*   **callback：** 可见性发生变化时触发的回调函数
    
*   **options：** 配置对象（可选，不传时会使用默认配置）
    

### 构造函数接收的参数 options

为了方便理解，我们先看第二个参数 `options` 。一个可以用来配置观察器实例的对象，那么这个配置对象都包含哪些属性呢？

*   **root：** 设置目标元素的根元素，也就是我们用来判断元素是否可见的区域，必须是目标元素的父级元素，如果不指定的话，则使用浏览器视窗，也就是 `document`。
    
*   **rootMargin：** 一个在计算交叉值时添加至根的边界中的一组偏移量，类型为字符串 `(string)`  ，可以有效的缩小或扩大根的判定范围从而满足计算需要。语法大致和 CSS 中 `margin` 属性等同，默认值 `“0px 0px 0px 0px”` ，如果有指定 `root` 参数，则 `rootMargin` 也可以使用百分比来取值。
    
*   **threshold：** 介于 `0` 和 `1` 之间的数字，指示触发前应可见的百分比。也可以是一个数字数组，以创建多个触发点，也被称之为 **阈值**。如果构造器未传入值, 则默认值为 `0` 。
    
*   **trackVisibility：** 一个布尔值，指示当前观察器是否将跟踪目标可见性的更改，默认为 `false` ，注意，此处的可见性并非指目标元素和根元素是否相交，而是指视图上是否可见，这个我们之前就已经分析过了，如果此值设置为 `false` 或不设置，那么回调函数参数中 `IntersectionObserverEntry` 的 `isVisible` 属性将永远返回 `false` 。
    
*   **delay：** 一个数字，也就是回调函数执行的延迟时间（毫秒）。如果 `trackVisibility` 设置为 `true`，则此值必须至少设置为 `100` ，否则会报错（但是这里我也只是亲测出来的，并不知道为什么会设计成这样，如果有大佬了解请指教一下）。
    

### 构造函数接收的参数 callback

当元素可见比例超过指定阈值后，会调用一个回调函数，此回调函数接受两个参数：存放 `IntersectionObserverEntry` 对象的数组和观察器实例 (可选)。

```
((doc) => {  //回调函数  const callback = (entries, observer) => {    console.log('🚀🚀~ 执行了一次callback');    console.log('🚀🚀~ entries:', entries);    console.log('🚀🚀~ observer:', observer);  };  //配置对象  const options = {};  //创建观察器  const myObserver = new IntersectionObserver(callback, options);  //获取目标元素  const target = doc.querySelector(".target")  //开始监听目标元素  myObserver.observe(target);})(document)
```

我们把这两个参数打印出来看一下，可以看到，第一个参数是一个数组，每一项都是一个目标元素对应的 `IntersectionObserverEntry`对象，第二个参数是观察器实例对象 `IntersectionObserver` 。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79mWXxicN4g8mQJftHDjoTDNZhYjZ7taicn6DGEWNQ5GJDcenibcaX01FDQ/640?wx_fmt=jpeg)

#### 什么是 IntersectionObserverEntry 对象

展开 `IntersectionObserverEntry` 看一下都有什么。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79nLk25ZXY2lZbz3LXb6tF9oibtPp1FDTPGhsI2ibNknLI4e6XDnqLGzjg/640?wx_fmt=jpeg)

*   **boundingClientRect：** 一个对象，包含目标元素的 `getBoundingClientRect()` 方法的返回值。
    
*   **intersectionRatio：** 一个对象，包含目标元素与根元素交叉区域 `getBoundingClientRect()` 的返回值。
    
*   **intersectionRect：** 目标元素的可见比例，即 `intersectionRect` 占 `boundingClientRect` 的比例，完全可见时为 `1` ，完全不可见时小于等于 `0` 。
    
*   **isIntersecting：** 返回一个布尔值，如果目标元素与根元素相交，则返回 `true` ，如果 `isIntersecting` 是 `true`，则 `target` 元素至少已经达到 `thresholds` 属性值当中规定的其中一个阈值，如果是 `false`，`target` 元素不在给定的阈值范围内可见。
    
*   **isVisible：** 这个看字面意思应该是 **“是否可见”** ，如果要让这个属性生效，那么在使用构造函数生成观察器实例的时候，传入的 `options` 参数必须配置 `trackVisibility` 为 `true`，并且 `delay` 设置为大于 `100` ，否则该属性将永远返回 `false` 。
    
*   **rootBounds：** 一个对象，包含根元素的 `getBoundingClientRect()` 方法的返回值。
    
*   **target：：** 被观察的目标元素，是一个 `DOM` 节点。在观察者包含多个目标的情况下，这是确定哪个目标元素触发了此相交更改的简便方法。
    
*   **time：** 该属性提供从 **首次创建观察者** 到 **触发此交集改变** 的时间（以毫秒为单位）。通过这种方式，你可以跟踪观察器达到特定阈值所花费的时间。即使稍后将目标再次滚动到视图中，此属性也会提供新的时间。这可用于跟踪目标元素进入和离开根元素的时间，以及两个阈值触发的间隔时间。
    

这里再看一下 **boundingClientRect** ，**intersectionRatio** ， **rootBounds** 三个属性展开的内容都有什么。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79mCbFINic5SbLND5ib1Xjj4ytRlwQGjE7EV1LfSxK2zKC47b7Epq0CllQ/640?wx_fmt=jpeg)

*   **bottom：** 元素下边距离页面上边的距离
    
*   **left：** 元素左边距离页面左边的距离
    
*   **right：** 元素右边距离页面左边的距离
    
*   **top：** 元素上边距离页面上边的距离
    
*   **width：** 元素的宽
    
*   **height：** 元素的高
    
*   **x：** 等同于 `left`，元素左边距离页面左边的距离
    
*   **y：** 等同于 `top`，元素上边距离页面上边的距离
    

用一张图来展示一下这几个属性，特别需要注意的是 `right` 和 `bottom` ，跟我们平时写 `css` 的 `position` 那个不一样 。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79k7FWLUichicuEnDQ19licopy1vtPczxHfxZjYIoNWicCKyCmNB9V9P8B6A/640?wx_fmt=jpeg)

#### 那么第二个参数 IntersectionObserver 观察器实例对象都有什么呢

别着急，接着往下看，实例属性部分。

观察器实例属性
-------

上面留了一个坑，回调函数的第二个参数 `IntersectionObserver` 观察器实例对象都有什么呢？我们把实例对象打印出来看一下

```
((doc) => {  //回调函数  const callback = () => {};  //配置对象  const options = {};  //创建观察器  const myObserver = new IntersectionObserver(callback, options);  //获取目标元素  const target = doc.querySelector(".target")  //开始监听目标元素  myObserver.observe(target);  console.log('🚀🚀~ myObserver:', myObserver);})(document)
```

![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79NrAIPgrEbauto0o2nTcIJzmtOzYic0oA7c2YpLEer3sFbJo1gbXCMiaA/640?wx_fmt=jpeg)可以看到，我们的观察器实例上面包含如下属性

*   **root**
    
*   **rootMargin**
    
*   **thresholds**
    
*   **trackVisibility**
    
*   **delay**
    

是不是特别眼熟，没错，就是我们创建观察者实例的时候，传入的 `options` 对象，只不过 `options` 对象是可选的，观察器实例的属性就使用我们传入的 `options` 对象，如果没传就使用默认值，唯一不同的是，`options` 中 的属性 `threshold` 是单数，而我们实例获取到的 `thresholds` 是复数。

值得注意的是，这里的所有属性都是 **只读** 的，也就是说一旦观察器被创建，则 **无法** 更改其配置，所以一个给定的观察者对象只能用来监听可见区域的特定变化值。

接下来我们就通过代码结合动图演示一下这些属性

```
((doc) => {  let n = 0  //获取目标元素  const target = doc.querySelector(".target")  //获取根元素  const root = doc.querySelector(".out-container")  //回调函数  const callback = (entries, observer) => {    n++    console.log(`🚀🚀~ 执行了 ${n} 次callback`);    console.log('🚀🚀~ entries:', entries);    console.log('🚀🚀~ observer:', observer);  };  //配置对象  const options = {    root: root,    rootMargin: '0px 0px 0px 0px',    threshold: [0.5],    trackVisibility: true,    delay: 100  };  //创建观察器  const myObserver = new IntersectionObserver(callback, options);  //开始监听目标元素  myObserver.observe(target);  console.log('🚀🚀~ myObserver:', myObserver);})(document)
```

**root** 这个没什么说的，就是设置指定节点为根元素![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79y6nS0iawM2qB6bMmO3bPsoSvOq6ib50jjy1qPG3FXtoecgIjpc3EDiaYg/640?wx_fmt=jpeg) **rootMargin** 我们把 `rootMargin` 修改为 `'50px 50px 50px 50px'`，可以看到，我们的目标元素还没有露出来的时候回调函数就已经执行了，也就是说目标元素距离根元素还有 `50px` 的 `margin` 时，观察器就认为是发生了交叉。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79mGcds6h7UlZiakX6ATrhsnM3PFp8H6e6I6CSsgjw5GpUZBkMOtS6X4A/640?wx_fmt=jpeg)**thresholds** 我们把 `threshold` 修改为 `[0.1, 0.3, 0.5, 0.8, 1]`, 可以看到，回调函数触发了多次，也就是说当交叉区域的百分比，每达到指定的阈值时都会触发一次回调函数。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79eNCX5xM0bSSEDB4MSaEGOdVY47mdiapdbaFt1djj8xRxvJaboibHwD2w/640?wx_fmt=jpeg)

> 注意 `Intersection Observer API` 无法提供重叠的像素个数或者具体哪个像素重叠，他的更常见的使用方式是——当两个元素相交比例在 `N%` 左右时，触发回调，以执行某些逻辑。 -- MDN

**trackVisibility** 修改 `trackVisibility` 为 `true` ，可以看到， `isVisible` 属性值为 `true` 。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79qnLKjeWib3pRKF7SecGOZAtrtF8lRro4TjD88DIhliceibrdFIgibzyu8Q/640?wx_fmt=jpeg)修改 `css` 属性 为 `opacity: 0`，可以看到，虽然我们蓝色小方块并没有出现在视图中，但是回调函数已经执行了，并且 `isVisible` 属性值为 `false` 而 `isIntersecting` 值为 `true` 。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79icZrHxsuSBr8d22ibTQvecZu8xNPiaUJ9n0pNBBNkKBQiaFXgaeMClibQuA/640?wx_fmt=jpeg)**delay** 回调函数延迟触发，我们修改 `delay` 为 `3000`，可以看到 `log` 是 `3000ms` 以后才输出的。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79VcP51TNVPg8SSiaSDIicjsH7WkVWRdaQ6sruJ0hSNliab9oIS2FWG0ZibA/640?wx_fmt=jpeg)

观察器实例方法
-------

通过此段代码来演示观察器实例方法，为了方便演示，我添加了几个对应的按钮。

```
((doc) => {  let n = 0  //获取目标元素  const target1 = doc.querySelector(".target1")  const target2 = doc.querySelector(".target2")  //添加几个按钮方便操作  const observe = doc.querySelector(".observe")  const unobserve = doc.querySelector(".unobserve")  const disconnect = doc.querySelector(".disconnect")  observe.addEventListener('click', () => myObserver.observe(target1))  unobserve.addEventListener('click', () => myObserver.unobserve(target1))  disconnect.addEventListener('click', () => myObserver.disconnect())  //获取根元素  const root = doc.querySelector(".out-container")  //回调函数  const callback = (entries, observer) => {    n++    console.log(`🚀🚀~ 执行了 ${n} 次callback`);    console.log('🚀🚀~ entries:', entries);    console.log('🚀🚀~ observer:', observer);  };  //配置对象  const options = {    root: root,    rootMargin: '0px 0px 0px 0px',    threshold: [0.1, 0.2, 0.3, 0.5],    trackVisibility: true,    delay: 100  };  //创建观察器  const myObserver = new IntersectionObserver(callback, options);  //开始监听目标元素  myObserver.observe(target2);  console.log('🚀🚀~ myObserver:', myObserver);})(document)
```

### observe

```
const myObserver = new IntersectionObserver(callback, options); myObserver.observe(target);
```

接受一个目标元素作为参数。很好理解，当我们创建完观察器实例后，要手动的调用 `observe` 方法来通知它开始监测目标元素。

**可以在同一个观察者对象中配置监听多个目标元素**

`target2` 元素是通过代码自动监测的，而 `target1` 则是我们在点击了 `observe` 按钮之后开始监测的。通过动图可以看到，当我单击 `observe` 按钮后，我们的 `entries` 数组里面就包含了两条数据，前文中说到，可以通过 `target` 属性来判断是哪个目标元素。

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79Dap9lLcI40J15PR5aAhFQchw59LEBwyAB5aMI3xEX6MYFYsBo8348A/640?wx_fmt=gif)

### unobserve  

```
const myObserver = new IntersectionObserver(callback, options); myObserver.observe(target); myObserver.unobserve(target)复制代码
```

接收一个目标元素作为参数，当我们不想监听某个元素的时候，需要手动调用 `unobserve` 方法来停止监听指定目标元素。通过动图可以发现，当我们点击 `unobserve` 按钮后，由两条数据变成了一条数据，说明 `target1` 已经不再接受监测了。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79FLk4V4XKVjL8MOTGcnqZVBKeibmg8yLra0EqKDdzSlGibQzHn7DSl2rA/640?wx_fmt=jpeg)

### disconnect

```
const myObserver = new IntersectionObserver(callback, options); myObserver.disconnect()
```

当我们不想监测任何一个目标元素时，我们需要手动调用 `disconnect` 方法停止监听工作。通过动图可以看到，当我们点击 `disconnect` 按钮后，控制台不再输出 `log` ，说明监听工作已经停止，可以通过 `observe` 再次开启监听工作。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79cibuJX2o63wG8jnTta8wg6WYpswu6o4SM24yfB39ibFfw9TzabqIuIag/640?wx_fmt=jpeg)

### takeRecords

返回所有观察目标的 `IntersectionObserverEntry` 对象数组，应用场景较少。

当观察到交互动作发生时，回调函数并不会立即执行，而是在空闲时期使用 `requestIdleCallback` 来异步执行回调函数，但是也提供了同步调用的 `takeRecords` 方法。

如果异步的回调先执行了，那么当我们调用同步的 `takeRecords` 方法时会返回空数组。同理，如果已经通过 `takeRecords` 获取了所有的观察者实例，那么回调函数就不会被执行了。

注意事项
====

构造函数 IntersectionObserver 配置的回调函数都在哪些情况下被调用?
--------------------------------------------

构造函数 `IntersectionObserver` 配置的回调函数，在以下情况发生时可能会被调用

*   当目标（**target**）元素与根（**root**）元素发生交集的时候执行。
    
*   两个元素的相交部分大小发生变化时。
    
*   `Observer` 第一次监听目标元素的时候。
    

```
((doc) => {  //回调函数  const callback = () => {    console.log('🚀🚀~ 执行了一次callback');  };  //配置对象  const options = {};  //观察器实例  const myObserver = new IntersectionObserver(callback, options);  //目标元素  const target = doc.querySelector("#target")  //开始观察  myObserver.observe(target);})(document)
```

可以看到，无论目标元素是否与根元素相交，当我们第一次监听目标元素的时候，回调函数都会触发一次，所以不要直接在回调函数里写逻辑代码，尽量通过 `isIntersecting` 或者 `intersectionRect` 进行判断之后再执行逻辑代码。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79QEZR6QstpbMKCyNt1dZEB1ScT2eoRGbhM37FVY4df3Mk9yWbrkibZtw/640?wx_fmt=jpeg)

页面的可见性如何监测
----------

页面的可见性可以通过`document.visibilityState`或者`document.hidden`获得。页面可见性的变化可以通过`document.visibilitychange`来监听。

可见性和交叉观察
--------

当 `css` 设置了`opacity: 0`，`visibility: hidden` 以及 `用其他的元素覆盖目标元素` ，都不会影响交叉观察器的监测，也就是都不会影响 `isIntersecting` 属性的结果，但是会影响 `isVisible` 属性的结果， 如果元素设置了 `display：none` 就不会被检测了。当然影响元素可视性的属性不止上述这些，还包括`position`，`margin`，`clip` 等等等等... 就靠小伙伴们自行发掘了

交集的计算
-----

所有区域均被 `Intersection Observer API` 当做一个 **矩形** 看待。如果元素是不规则的图形也将会被看成一个包含元素所有区域的最小矩形，相似的，如果元素发生的交集部分不是一个矩形，那么也会被看作是一个包含他所有交集区域的最小矩形。

我怎么知道目标元素来自视口的上方还是下方
--------------------

目标元素滚动的方向也是可以判断的，原理是根元素的 `entry.rootBounds.y` 是固定不变的 ，所以我们只需要计算 `entry.boundingClientRect.y` 与 `entry.rootBounds.y` 的大小，当回调函数触发的时候，我们记录下当时的位置，如果 `entry.boundingClientRect.y < entry.rootBounds.y`，说明是在视口下方，那么当下一次目标元素可见的时候，我们就知道目标元素时来自视口下方的，反之亦然。

```
let wasAbove = false;function callback(entries, observer) {    entries.forEach(entry => {        const isAbove = entry.boundingClientRect.y < entry.rootBounds.y;        if (entry.isIntersecting) {            if (wasAbove) {                // Comes from top            }        }        wasAbove = isAbove;    });}
```

应用场景
====

介绍完基础知识，总得来几个实例 (**演示代码采用 VUE3.0**)，当然实际场景要比这复杂的多，如何在自己的工作学习中应用，还是要靠小伙伴们多多开动聪明的大脑~

数据列表无限滚动
--------

```
<template>  <div class="box">    <div class="vbody"         v-for='item in list'         :key='item'>内容区域{{item}}</div>    <div class="reference"         ref='reference'></div>  </div></template><script lang='ts'>import { defineComponent, onMounted, reactive, ref } from 'vue'export default defineComponent({  name: '',  setup() {    const reference = ref(null)    const list = reactive([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])    onMounted(() => {      let n = 10      //回调函数      const callback = (entries) => {        const myEntry = entries[0]        if (myEntry.isIntersecting) {          console.log(`🚀🚀~ 触发了无线滚动,开始模拟请求数据 ${n}`)          n++          list.push(n)        }      }      //配置对象      const options = {        root: null,        rootMargin: '0px 0px 0px 0px',        threshold: [0, 1],        trackVisibility: true,        delay: 100,      }      //观察器实例      const myObserver = new IntersectionObserver(callback, options)      //开始观察      myObserver.observe(reference.value)    })    return { reference, list }  },})</script><style>* {  margin: 0;  padding: 0;  box-sizing: border-box;}.reference {  width: 100%;  visibility: hidden;}.vbody {  width: 100%;  height: 200px;  background-color: red;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 200px;  margin: 10px 0;}</style>
```

我们只需要在底部添加一个参考元素，当参考元素可见时，就向后台请求数据，就可以实现无线滚动的效果了。![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79QgahOU6o1pCGUfciaMADOy27DibsH7vemCNwezHmDI93CbcNK8GvcMuQ/640?wx_fmt=gif)

图片预加载
-----

```
<template>  <div class="box">    <div class="vbody">内容区域</div>    <div class="vbody">内容区域</div>    <div class="header"         ref='header'>      <img :src="url">    </div>    <div class="vbody">内容区域</div>  </div></template><script lang='ts'>import { defineComponent, onMounted, ref } from 'vue'export default defineComponent({  name: '',  setup() {    const header = ref(null)    const url = ref('')    onMounted(() => {      //回调函数      const callback = (entries) => {        const myEntry = entries[0]        if (myEntry.isIntersecting) {          console.log('🚀🚀~ 预加载图片开始')          url.value =            '//img10.360buyimg.com/imgzone/jfs/t1/197235/15/2956/67824/6115e076Ede17a418/d1350d4d5e52ef50.jpg'        }      }      //配置对象      const options = {        root: null,        rootMargin: '200px 200px 200px 200px',        threshold: [0],        trackVisibility: true,        delay: 100,      }      //观察器实例      const myObserver = new IntersectionObserver(callback, options)      //开始观察      myObserver.observe(header.value)    })    return { header, url }  },})</script><style>* {  margin: 0;  padding: 0;  box-sizing: border-box;}.box {}.header {  width: 100%;  height: 400px;  background-color: blue;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 400px;}.header img {  width: 100%;  height: 100%;}.reference {  width: 100%;  visibility: hidden;}.vbody {  width: 100%;  height: 800px;  background-color: red;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 800px;  margin: 10px 0;}</style>
```

利用 `options` 的 `rootMargin`属性，可以在图片即将进入可视区域的时间进行图片的加载，即避免了提前请求大量图片造成的性能问题，也避免了图片进入窗口才加载已经来不及的问题。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79bN40OOficMiaLk75NJrKm6J54ibbA69e4g8I9SPtsbffK1Hickib4BPY7WQ/640?wx_fmt=jpeg)

吸顶
--

```
<template>  <div class="box">    <div class="reference"         ref='reference'></div>    <div class="header"         ref='header'>吸顶区域</div>    <div class="vbody">内容区域</div>    <div class="vbody">内容区域</div>    <div class="vbody">内容区域</div>  </div></template><script lang='ts'>import { defineComponent, onMounted, ref } from 'vue'export default defineComponent({  name: '',  setup() {    const header = ref(null)    const reference = ref(null)    onMounted(() => {      //回调函数      const callback = (entries) => {        const myEntry = entries[0]        if (!myEntry.isIntersecting) {          console.log('🚀🚀~ 触发了吸顶')          header.value.style.position = 'fixed'          header.value.style.top = '0px'        } else {          console.log('🚀🚀~ 取消吸顶')          header.value.style.position = 'relative'        }      }      //配置对象      const options = {        root: null,        rootMargin: '0px 0px 0px 0px',        threshold: [0, 1],        trackVisibility: true,        delay: 100,      }      //观察器实例      const myObserver = new IntersectionObserver(callback, options)      //开始观察      myObserver.observe(reference.value)    })    return { reference, header }  },})</script><style>* {  margin: 0;  padding: 0;  box-sizing: border-box;}.header {  width: 100%;  height: 100px;  background-color: blue;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 100px;}.reference {  width: 100%;  visibility: hidden;}.vbody {  width: 100%;  height: 800px;  background-color: red;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 800px;  margin: 10px 0;}</style>
```

思路就是利用一个参考元素作为交叉观察器观察的对象，当参考元素可见的时候，取消吸顶区域的 `fixed` 属性，否则添加 `fixed` 属性，吸底稍微复杂一点，但是道理差不多，留给小伙伴们自行研究吧 ~ ~。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79k6qffTqSHricaGicEexCWwMaFh8buRcomXlg3vGbic04VnlWOowUlpT7w/640?wx_fmt=jpeg)

埋点上报
----

```
<template>  <div class="box">    <div class="vbody">内容区域</div>    <div class="vbody">内容区域</div>    <div class="header"         ref='header'>埋点区域</div>    <div class="vbody">内容区域</div>  </div></template><script lang='ts'>import { defineComponent, onMounted, ref } from 'vue'export default defineComponent({  name: '',  setup() {    const header = ref(null)    onMounted(() => {      //回调函数      const callback = (entries) => {        const myEntry = entries[0]        if (myEntry.isIntersecting) {          console.log('🚀🚀~ 触发了埋点')        }      }      //配置对象      const options = {        root: null,        rootMargin: '0px 0px 0px 0px',        threshold: [0.5],        trackVisibility: true,        delay: 100,      }      //观察器实例      const myObserver = new IntersectionObserver(callback, options)      //开始观察      myObserver.observe(header.value)    })    return { header }  },})</script><style>* {  margin: 0;  padding: 0;  box-sizing: border-box;}.header {  width: 100%;  height: 400px;  background-color: blue;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 400px;}.vbody {  width: 100%;  height: 800px;  background-color: red;  color: aliceblue;  font-size: 40px;  text-align: center;  line-height: 800px;  margin: 10px 0;}</style>
```

通常情况下，我们统计一个元素是否被用户有效的看到，并不是元素刚出现就触发埋点，而是元素进入可是区域一定比例才可以，我们可以配置 `options` 的 `threshold` 为 `0.5`。![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc795BWhj9jbAdCLVGcWwft9Wl9q6XiaTiaibDibDBRmQgQE4O7sHjEtVRBYeg/640?wx_fmt=jpeg)

等等等等。。。。

这个 `api` 可以说是非常强大了，可玩性也是极高，大家自由发挥 ~ ~

兼容性
===

![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc791vaNqF3h4SboCvCMhBPC4yfBuV3PuUegh8DwgqxMibiaedaNYqCJmBTg/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz/lP9iauFI73zibBiao6tMT2mzaia9LmpEuc79JAv6IZc3Z9ydibDlw8odQTIOZyX93Ssblg8vNBNBVYWjjbWgc7GqxPQ/640?wx_fmt=jpeg)为什么有两张兼容性的图呢？因为 **trackVisibility** 和 **delay** 两个属性是属于 `IntersectionObserver V2` 的。所以小伙伴们在用的时候一定要注意兼容性。当然也有兼容解决方案，那就是 `intersection-observer-polyfill`

参考资料
----

**[1] Can I Use:**

https://caniuse.com/?search=IntersectionObserver%20

**[2] MDN Intersection Observer:**

https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver

**[3] IntersectionObserver API 使用教程:**

https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html

**[4] intersection-observer-polyfill:**

https://www.npmjs.com/package/intersection-observer-polyfill