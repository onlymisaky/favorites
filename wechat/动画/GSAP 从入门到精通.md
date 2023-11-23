> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/7Uw_Z2-jyQVK29V6R2wkWg)

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bewkvG2cthnU8al0FNibnYrmD9ia5k1ibAADNbPCdH8jbYuN7pRXP1ToAlJCeEJ6JSzgHNibnUjkibFTTA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bewkvG2cthnU8al0FNibnYrmYu6YpAEJd6jk6BJ3bY7UNEr8LNgBgUByMgLx7NwllicJibHNtXDU8L6Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

总字数：4,726 | 阅读时间：13 分钟　

  

我们在网上浏览时，经常能看到很多网站，随着页面滚动条向下滑动时，有非常丰富的页面动画效果；相信很多小伙伴也都很好奇，这样的网站效果是如何做出来的。我们本文就来深入的学习一下 GSAP 这个库的用法，为后面实现酷炫的动画效果打下基础。

首先这样的滚动效果和 fullpage.js、Swiper.js 全屏翻页滚动轮播的效果是不一样的，页面元素的位置极度的依赖于滚动条的位置，因此是需要监听滚动条事件；笔者在调研了 better-scroll.js、scrollReveal.js 和 iScroll.js 等一系列插件后，发现这些插件并不能满足需求。

笔者也曾一度想过不依赖库，自己来实现类似的效果，不就是监听页面滚动么；但是想了想滚动时这么多元素的动画效果导致的性能问题以及页面 resize 后如何来重新计算也是不小的问题，于是就打消了不切实际的念头。

在扒开很多网站的源代码之后，笔者找到了一个很多网站都在用的动画库：GSAP；但是很奇怪，网站搜索这个库，我们发现它的教程非常的少，这么好用的一个动画库不应该资料这么匮乏；但是看到官网全英文的教程和有时候无法访问 demo 教程后，以及有点难理解的各种概念后，我好像知道了原因。

由于我们要实现的很多动画效果都依赖于 GSAP，因此我们先来看下 GSAP 的使用教程。

GSAP
====

首先我们要知道这个库能做什么，`The GreenSock Animation Platform (GSAP)`是一个功能十分强大的动画平台，可以帮助我们实现大部分的动画需求，构建高性能的、适用于所有主要浏览器的高性能动画；GSAP 非常的灵活，可以在任何框架上处理页面能够所有通过 js 改变的元素，不仅可以对 div 的 css 属性进行动画，还是 SVG、React、Vue、WebGL，甚至和 Threejs 一起使用。

除了 GSAP 核心库外，还有很多实用的插件，比如结合 ScrollTrigger 插件，我们可以实现非常震撼的滚动触发效果；同时也不需要担心响应式的问题，GSAP 确保项目响应迅速、高效且流畅。

动画属性
----

我们从一个简单的例子开始，先把一个`.box`元素沿着 X 轴移动 200px；

```
gsap.to('.box', { x: 200 });
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxXTlOKjyj4icDxz5pCAjPOL112KvEQRhbQp4IR9Et1bMhnXkjYAo0bxw/640?wx_fmt=gif)demo1

如果我们对`.box`元素进行元素检查，我们会发现 GSAP 实际上是不停的修改`transform`属性，直至最终停留在`transform: translate(200px, 0px)`；我们继续回到上面的代码。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vx2goHBCTARgjib0VsM8Uvud0Na8ics7Knyk3Rflt1REHQ2ic0tibEtkq5dA/640?wx_fmt=png)gsap.to

在上段代码中，我们发现这段代码包含有 3 层含义：函数、目标和变量；首先目标就是我们想要移动的元素，可以是 CSS 选择器，也可以使 dom 元素，甚至是一串数组：

```
// CSS选择器gsap.to(".box", { x: 200 });gsap.to("#box1", { x: 200 });// dom元素const box = document.querySelector(".box");gsap.to(box, { x: 200 })// 元素数组let square = document.querySelector(".square");let circle = document.querySelector(".circle");                                      gsap.to([square, circle], { x: 200 })
```

然后是函数，有四种类型的动画函数：

1.  gsap.to：最常用的动画类型，从当前状态开始。
    
2.  gsap.from：和. to 相反，从一个状态开始到当前状态。
    
3.  gsap.fromTo：可以自定义开始和结束状态。
    
4.  gsap.set：立即设置属性，没有动画效果。
    

我们直接看效果就能明白这几个函数的意义了。

```
gsap.from(".box", {  x: 300,});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxZPZmUww93z99oIPl3rDWQrCBqAicmU1P9olZlpuyOiaaJRaM69lEqZfg/640?wx_fmt=gif)demo3

```
gsap.fromTo(  ".box",  {    x: 0,    y: 0,  },  {    x: 400,    y: 50,  },);
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vxf9h7H0GcXmL6rbPHo3GLw2dxraTpO7oypwcf6N8COEfQgd19vW6p6w/640?wx_fmt=gif)demo4

```
gsap.set(".box", {  x: 400,  y: 50,});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxcAop2yhGwJ48wPiciaykRP7JEVELZBvTwGXyicIlxBfRm5mjJicIoxCGJg/640?wx_fmt=gif)demo5

最后是变量对象，这个对象可以包含的信息种类就比较丰富了，可以是想要动画的任意 CSS 属性，也可以是影响动画表现形式的特殊属性，比如 duration 持续时间、repeat 重复次数。

```
gsap.to(target, {  x: 400,  y: 50,  rotation: 180,  // 特殊属性  duration: 3,  repeat: 2});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxJFxItnYUPBBYxiaJsa3BeGMf5G5czcoqaeQqk8BMB7fRN35eYtQdUrA/640?wx_fmt=gif)demo6

GSAP 可以动画任何属性，没有确定的列表，包括 CSS 属性、自定义对象属性甚至 CSS 变量和复杂的字符串，最常见的动画属性是 transforms 和透明度。transforms 属性是动画中性能消耗最小的，可以用它来移动元素、旋转或者放大缩小，因为他们不会影响页面的布局，更不会使页面重排，因此有着较好的性能表现。

> ❝
> 
> 尽可能的使用 transforms，而不是布局属性，例如 top、left 或者 margin，有更平滑的动画体验。
> 
> ❞

我们可能比较熟悉以下的 transforms 属性：

```
transform: rotate(360deg) translateX(10px) translateY(50%);
```

GSAP 提供了下面的缩写形式，上面的 transforms 属性可以直接缩写成下面的属性（yPercent 表示百分比元素的高度）：

```
{ rotation: 360, x: 10, yPercent: 50 }
```

> ❝
> 
> GSAP 支持 CSS 属性转为小驼峰形式，例如`background-color`变成`backgroundColor`
> 
> ❞

通过上面的例子我们也发现了，默认情况下 GSAP 会给 transform 属性使用 px 和 degrees 单位，比如`{x: 10, rotation: 360}`就表示 x 轴 10px，旋转 360 度；但是我们有时候想要使用其他的单位，比如 vw，radians 或者相对单位。

```
x: 200, // 默认pxx: "+=200" // 相对值x: '40vw', // 视窗单位x: () => window.innerWidth / 2, // 函数计算  rotation: 360 // 默认角度rotation: "1.25rad" // 使用弧度单位
```

GSAP 的神奇之处在于，不仅能够对 dom 元素动画，还能够对非 dom 元素，比如 svg、js 对象等进行动画操作；对于 svg 元素，我们添加`attr属性`额外的处理一些 svg 的属性，像 width、height、fill、stroke、opacity 等。

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vx3CxZDlmRKG4vJrQjr6xdiboFfDspiccibZ0PFfVcfZ5AJUO1fiaOaoicX7g/640?wx_fmt=gif)demo8

```
gsap.to(".svgBox", {  duration: 2,  x: 100,  xPercent: -100,  // svg属性  attr: {    fill: "#8d3dae",    rx: 50,  },});
```

甚至，我们对 js 对象进行动画时，不需要任何 dom 元素，针对任意 js 对象的任意属性进行动画，onUpdate 函数用于监听动画的更新过程：

```
let obj = { myNum: 10, myColor: "red" };gsap.to(obj, {  myNum: 200,  myColor: "blue",  onUpdate: () => console.log(obj.myNum, obj.myColor)});
```

特殊属性
----

特殊属性用来调整动画的表现形式，我们在上面用到了 repeat 和 duration，下面的文档中提供了一些常用的属性：

<table><thead><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: white;"><th data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">属性名</th><th data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: white;"><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">duration</td><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">动画的持续时间（单位：秒）默认 0.5 秒</td></tr><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">delay</td><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">动画重复次数</td></tr><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: white;"><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">yoyo</td><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">布尔值，如果为 true，每次其他动画就会往相反方向运动（像 yoyo 球）默认 false</td></tr><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">stagger</td><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">每个目标动画开始之间的时间（秒）</td></tr><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: white;"><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">ease</td><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">控制动画期间的变化率，默认 "power1.out"</td></tr><tr data-style="border-color: rgb(204, 204, 204) currentcolor currentcolor; border-style: solid none none; border-width: 1px 0px 0px; background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">onComplete</td><td data-style="border-color: rgb(204, 204, 204); border-style: solid; border-width: 1px; padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">动画完成时的回调函数</td></tr></tbody></table>

`repeat属性`就是重复的次数，会让动画执行多次；需要注意的是，如果我们填一个数值 2，但实际动画的次数是 3，因此我们总结出来公式：`真实运动次数 = repeat属性 + 1`。

> ❝
> 
> 如果我们想让动画一直重复下去，使用`repeat: -1`。
> 
> ❞

repeat 一般会和`yoyo属性`一起使用，当 yoyo 为 true 时，在每次动画结束都会反向运动；需要注意的是，一个运动循环包含一个正向和反正运动，反向运动也计入运动的次数中。

```
gsap.to(".box", {  rotation: 360,  x: 300,  xPercent: -100,  duration: 2,  repeat: 2,  yoyo: true,});
```

我们这边 repeat 写的 2，实际动画中，正好是 3 次运动，1.5 次循环往复运动。

delay 也非常好理解，动画开始延迟时间，如果后面是 repeat 重复的动画，则不会有延迟了；如果我们想要为后面的任何重复运动添加延迟，可以使用`repeatDelay`属性。

```
gsap.to(".green", {  rotation: 360,  duration: 1,  delay: 1,  repeat: 1,});gsap.to(".purple", {  rotation: 360,  duration: 1,  repeat: 1,  repeatDelay: 1,});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vxa7YA55AHZ7uhUOPnF8zlIShK6IuCF30zwlo3HP8PiaKQEoAXyNF4Xhg/640?wx_fmt=gif)demo11

我们发现同样是总计 2 次的重复旋转运动，绿的 div 动画开始前有停顿，而后面的重复运动就没有停顿了；而紫色的 div 动画开始前没有停顿，在后面的每次重复运动则会有停顿，就是 repeatDelay 的作用。

ease 速度曲线也是动画效果的一部分，我们可以看到不同的速度曲线旋转效果也是不一样的。

```
gsap.to(".green", {  rotation: 360,  duration: 2,  ease: "none",});gsap.to(".purple", {  rotation: 360,  duration: 2,  ease: "bounce.out",});
```

`stagger属性`也是比较有趣的属性，我们可以利用它控制多个目标之间动画的延迟差，形成奇妙又好看的交错效果。

```
gsap.to(".box", {  duration: 0.5,  opacity: 0,  y: -100,  stagger: 0.1,  ease: "back.in",});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vxic1ad1BbaicDVu7V8VRopCcS7LCvXhLG28hycricaQzTA4u6cC29ruicibA/640?wx_fmt=gif)demo13

比如这样，让 div 交错消失的场景；或者交错动画一个阵列，只需要告诉 GSAP 有多少行列。

```
gsap.to(".box", {  scale: 0.1,  y: 30,  yoyo: true,  repeat: -1,  ease: "power1.inOut",  delay: 1,  stagger: {    amount: 1.5,    grid: "auto",    from: "center",  },});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxsFQvWvIBDoIVuqxSnWlYShy8SGmic9L2hia10icDdeT4PGPp80Ed4K8Rw/640?wx_fmt=gif)demo14

时间线 timeline
------------

我们动画经常会遇到多个对象的情况，虽然我们可以使用上面的 delay 进行简单的控制，延迟物体的动画开始时间；但是如果中间某个物体的动画执行时间突然延长了，那么其后面所有的动画时间需要进行手动进行延迟，这显得非常不方便；因此我们需要引入时间线 timeline 的概念。

> ❝
> 
> 时间线是 GSAP 最重要的概念之一
> 
> ❞

我们通过`gsap.timeline()`创建一个时间线，然后通过时间线控制每一个动画顺序执行；这样即使我们修改中间某个动画的`duration`，也不会影响后续时间线。

```
const t1 = gsap.timeline();t1.to(".green", {  x: 600,  duration: 2,});t1.to(".purple", {  x: 600,  duration: 1,});t1.to(".orange", {  x: 600,  duration: 1,});
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxVkyX56Xx8LhG3uTkx0p28O2CUcJbOuxJicbFN7Alt03LZ4xIia0PicKcg/640?wx_fmt=gif)demo15

但是如果我们想要在一个动画开始的同时，执行另一个动画，除了再额外创建一条时间线，我们可以在 to 函数后面加一些小参数来进行精确的控制。

```
const t1 = gsap.timeline();t1.to(".red", { x: 400,duration: 1 });// 在1秒开始插入动画（绝对值）t1.to(".green", { x: 400, duration: 1 }, 1);// 在上个动画的开始插入动画t1.to(".purple", { x: 400, duration: 1 }, "<");// 在最后一个动画结束后一秒插入动画t1.to(".orange", { x: 400, duration: 1 }, "+=1");
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxqLaxmjIM271icL3qNKbRXuH34pPAiav1xGntrGk0gjCp1kUYobR8aHCg/640?wx_fmt=gif)demo16

理解上面代码中的这些小参数可以帮助我们构建很多复杂精妙的动画效果，让我们能够在任意时间点来执行任意的动画效果；上面的例子乍一看可能不是那么好理解，不过没有关系，我们一点点来理解。

虽然我们上面都是以`gsap.to`来为例，但是其他的函数比如 from()、fromTo()、add() 等也都适用；需要注意的是这些参数跟在`变量对象`的后面，因此函数的代码结构如下：

> ❝
> 
> .method(target, vars, position)
> 
> ❞

我们将这些参数简单的分一下类就好理解多了，其实主要有以下几种类型：

*   绝对值：在某个绝对秒数来执行动画。
    
*   `<符`和`>符`："<" 在上个动画开始，">" 在上个动画结束。
    
*   相对符：`+=`在最后一个动画结束后，`-=`在最后一个动画结束前。
    
*   label 值：直接用某个时间点的 label 名。
    

绝对值就表示在某个绝对的秒数时执行动画，比如上面 demo 中的 green 元素，在 1 秒时执行动画；`<符号`表示在上个动画开始，比如 demo 中的 purple 元素，就和 green 元素同时执行动画；我们还可以在后面加个数值，比如：<3 和 <=3，两种表达方式的含义相同，都表示在上个动画开始后的三秒执行。

```
const t1 = gsap.timeline();t1.to(".green", { x: 400, duration: 1 })  .to(".purple", { x: 400, duration: 1 }, "<3")  .to(".orange", { x: 400, duration: 1 }, ">1");
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vx052f4XAIcicz6m0ZfLib0iaaTKeFb0Aicj3eicicZzzwK4nE8nHAsqx7nLtQ/640?wx_fmt=gif)demo17

在上面的 gif 效果中，我们看到，purple 元素是在 green 元素开始的 3 秒后才开始执行，并不是结束的 3 秒后；`>符号`则表示上个动画结束时，用法类似，这里就不再赘述了。

相对符则表示动画结束的时间点，`+=1`表示上个动画结束 1 秒后，`-=2`表示上个动画结束前 2 秒。

label 值则很好理解了，在某个时间点插入一个 label，在这个 label 前面或者后面的时间来执行，我们看下它的用法：

```
const t1 = gsap.timeline();t1.to(".green", { x: 400, duration: 1 })  .add("myLabel", 2)  .to(".purple", { x: 400, duration: 1 }, "myLabel+=1")  .to(".orange",{ x: 400, duration: 1 }, "myLabel-=1");
```

通过`gsap.add`函数，我们在 2 秒处放置了一个 myLabel 的标识，在后面使用 myLabel+=1 和 myLabel-=1 相对这个标识的时间进行控制。

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0Vx8eibVust7JkPYNMUadGgFibz3SFptCHZ9MAiaFuIyk6Ofks9WLKoFlbfQ/640?wx_fmt=gif)demo18

不同时间线中的动画可能会有相同的特殊属性，比如 repeat 和 delay 等，我们可以在时间线的创建函数中统一设置，避免重复：

```
const tl = gsap.timeline({ repeat: 1, repeatDelay: 1, yoyo: true });tl.to(".green", { rotation: 360 })  .to(".purple", { rotation: 360 })  .to(".orange", { rotation: 360 });
```

如果你发现某个属性你重复使用了很多次，比如 x、scale、duration 等，我们就可以使用`defaults属性`，任何加到 defaults 属性中的参数都会被下面的函数继承。

```
const tl = gsap.timeline({  defaults: {    scale: 1.2,    duration: 2,  },});tl.to(".green", {  x: 200,})  .to(".purple", {    x: 400,  })  .to(".orange", {    x: 600,  });
```

回调函数
----

在有些情况下，我们需要对动画的开始、过程、结束的某个时间点进行回调操作，gsap 提供了以下回调函数：

*   onComplete：动画完成时。
    
*   onStart：动画开始时
    
*   onUpdate：动画更新时。
    
*   onRepeat：动画重复时。
    
*   onReverseComplete：当动画在反转到达开始时。
    

```
gsap.to(".class", {  x: 100,   onComplete: () => console.log("the tween is complete")}// 时间线所有动画结束时调用gsap.timeline({onComplete: tlComplete});function tlComplete() {  console.log("the tl is complete");  // ...}
```

ScrollTrigger
-------------

现在我们对 gsap 的基本用法有了一定的了解，下面我们来看下插件的用法；插件可以帮助我们扩展动画的高级功能，让动画的表现更丰富；我们主要来了解 ScrollTrigger 的使用。

我们先看下 ScrollTrigger 的一个简单用法，

```
import { ScrollTrigger } from "gsap/ScrollTrigger";gsap.registerPlugin(ScrollTrigger);gsap.to(".green", {  rotation: 360,  scale: 1.5,  backgroundColor: "red",  scrollTrigger: {    trigger: ".green",    scrub: true,  },});gsap.to(".purple", {  rotation: 360,  scale: 1.5,  backgroundColor: "red",  scrollTrigger: {    trigger: ".purple",    scrub: 1,  },});
```

使用前当然要对插件进行注册了，使用`gsap.registerPlugin`将 ScrollTrigger 注册，否则我们在下面操作时会发现没有任何效果。

在 to 函数中我们新增了一个`scrollTrigger属性`，trigger 表示当前动画触发的元素，这个很好理解，我们使用当前元素；markers 是否进行标记，scrub 表示是否将动画效果链接到滚动条，随着滚动条平滑处理；如果是 false（默认），随着元素出现在视窗内，直接触发动画，如果是 true，则平滑动画，我们看下效果：

> ❝
> 
> scrub 还可以是某个具体的数值，表示延迟滚动条多少秒动画；比如这里的 1，延迟 1 秒执行动画。
> 
> ❞

我们在滚动浏览器时，可以使用 pin 属性将某个元素固定在某个位置；pin 可以是 css 选择器字符串、布尔值或者直接 dom 元素；如果是 true，则直接固定当前的动画元素；我们这里使用 pin 将 purple 元素固定起始位置：

```
gsap.to(".green", {  x: 400,  duration: 2,  scrollTrigger: {    trigger: ".green",    pin: ".purple",  },});
```

### start 和 end

start 和 end 属性用来决定滚动触发元素开始的位置，可以是字符串、数值或者函数，两者的用法类似，我们以 start 为例；start 的值默认是`"top bottom"`，它的含义是当触发物体（trigger）的顶部（top）碰到浏览器的底部（bottom）时；我们看下当开启标记 marker 时的触发位置。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bcI4cYuOgKqBb3D5Dibbd0VxD5h5cmoC6ChXm0Bsmo8zsdD7XEECFY2G7vCCS3dCNHMjnWrQdGnkzg/640?wx_fmt=png)start 和 end 默认触发位置

我们看到`scroller-start`的线就是浏览器视窗的边界线，当浏览器向下滚动时，这条线滚动到物体的`start`线时，就触发了动画效果；同样的道理，向上滚动时，当`scroll-end`的线触碰到`end`时，动画结束。

start 值看起来很怪异，不好理解，其实我们可以把它拆成两部分来看；第一个 top 值表示物体的上边界，同样的我们可以设为 bottom（物体下边界）、center（物体中间）或者具体数值（100px、80%），即控制的是物体旁边的 start 线。

第二个值表示浏览器视窗滚动触发的 scroller-start 线，bottom 表示视窗的底部，我们也设为 top 或者 center 或者数值，以及百分比（例如 80%，表示整个视窗的 80% 高度），甚至是相对位置，比如`bottom-=100px`。

### toggleClass

有些情况下，我们不想要 gsap 的动画，而是想用我们自己自定义的 css 类名来实现某些动画效果，`toggleClass属性`可以让我们在触发的元素上添加或者移除这些的类名，从它的名字也能看出来它是处理类名的；它可以是一个字符串，例如`toggleClass: "active"`，就表示要新增 / 移除的类名。

toggleClass 也可以是对象，可以在其他的元素上来新增 / 移除类名，比如：

```
toggleClass: {targets: ".my-selector", className: "active"}
```

我们可以将 ScrollTrigger 结合 timeline 创建动画。

```
const tl = gsap.timeline({  scrollTrigger: {    trigger: ".wrap",    scrub: true,  },});tl.to(".green", {  x: 200,});tl.to(".purple", {  x: 400,});
```

总结
==

本文 GSAP 所有的用法教程大致到这里就结束了，本文涉及到了一些动画方面的概念，有些不准确的地方欢迎指正；笔者也参考了官网很多 demo 和英文案例的翻译理解，工作量较大，望给个一键三连。

**更多动画案例的效果敬请点击下方的阅读原文查看。**

聊了这么多有趣的 GSAP 使用方法，你学会如何使用 GSAP 实现酷炫的动画效果了吗？关注前端壹读，更新会更快哦。

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25bdaxicBlRMxNtxMjHib4IZTQygclqnysV77ic7jRicekWrccxabFZTve9atAJ5ERQHk8lVqpg51wOuKfw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

  

此处按一下又不会怀孕  
还能经常普及一些好玩的前端知识

  

看都看完了，还不点这里试试

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bdaxicBlRMxNtxMjHib4IZTQyia4V8icC7UdVtdFTbssJvcHKwvkl5VHehicxibLeEzaBGAiarkpsN2t48ZA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)