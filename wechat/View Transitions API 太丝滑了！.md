> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Z-jq291L8L8WgIZiBGbVLA)

在原生 APP 中，我们经常会看到那种丝滑又舒适的页面切换动画，比如这样

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1HfianJvmTm9bCK9ShMyoR2pYcoTBQf4aGvwWzgU7wIDrkyYch9K9Mzw/640?wx_fmt=gif)

Android 里一般称之为共享元素（shareElement）动画，也就是动画前后有一个（或多个）相同的元素，起到前后过渡的效果，可以很清楚的看到元素的变化过程，而并不是简单的消失和出现。

现在，web 中（**Chrome 111+**）也迎来了这样一个特性，叫做视图转换动画 View Transitions[1]，又称 “转场动画”，也能很轻松的实现这类效果，一起了解一下吧

一、快速认识 View Transition
----------------------

先从一个简单的例子来认识一下。

比如，下面有一个网格列表

```
<div class="list" id="list">  <div class="item">1</div>  <div class="item">2</div>  <div class="item">3</div>  <div class="item">4</div>  <div class="item">5</div>  <div class="item">6</div>  <div class="item">7</div>  <div class="item">8</div>  <div class="item">9</div>  <div class="item">10</div></div>
```

简单修饰后如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1LkEw8r4hxibIO64aPXpThPicgpFXMJPJkvo91WAL3yMMf9mPjT5D3J4w/640?wx_fmt=png)

然后我们实现一个简单交互，点击每个元素，元素就会被删除

```
list.addEventListener('click', function(ev){  if (ev.target.className === 'item') {    ev.target.remove()  }})
```

可以得到这样的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1QMJqjdK7k7ehMkqlZgkYKSNMM0edWoquFssN3sRic2CohTMANuWicu8g/640?wx_fmt=gif)

功能正常，就是有点太过生硬了  

现在轮到 `View Transitions` 出场了！我们只需要在改变状态的地方添加`document.startViewTransition`，如下

```
list.addEventListener('click', function(ev){  if (ev.target.className === 'item') {    document.startViewTransition(() => { // 开始视图变换      ev.target.remove()    });  }})
```

当然为了兼容不支持的浏览器，可以做一下判断

```
list.addEventListener('click', function(ev){  if (document.startViewTransition) { // 如果支持就视图变换    document.startViewTransition(() => { // 开始视图变换      ev.target.remove()    });  } else { // 不支持就执行原来的逻辑    ev.target.remove()  }})
```

现在效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1nLiaMtOaV0zNGLHoQyCpiacZnCssAK8CXv2nVnllLbRnwThNwkNiaicDaQ/640?wx_fmt=gif)

删除前后现在有一个淡入淡出的效果了，也就是默认的动画效果，我们可以把这个动画时长设置大一点，如下

```
::view-transition-old(root), /* 旧视图*/::view-transition-new(root) { /* 新视图*/  animation-duration: 2s;}
```

这两个伪元素我们后面再做介绍，先看效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1QV6rvz4XGGjNofog7quCJtiappuibYwIS0TE8yET6ZrnTY6biadqcpgaQ/640?wx_fmt=gif)

是不是明显感觉过渡变慢了许多？

但是这种动画还是不够舒服，是一种整体的变化，看不出删除前后元素的位置变化。

接下来我们给每个元素指定一个标识，用来标记变化前后的状态，为了方便控制，可以借助 CSS 变量

```
<div class="list" id="list">  <div class="item" style="--i: a1">1</div>  <div class="item" style="--i: a2">2</div>  <div class="item" style="--i: a3">3</div>  <div class="item" style="--i: a4">4</div>  <div class="item" style="--i: a5">5</div>  <div class="item" style="--i: a6">6</div>  <div class="item" style="--i: a7">7</div>  <div class="item" style="--i: a8">8</div>  <div class="item" style="--i: a9">9</div>  <div class="item" style="--i: a10">10</div></div>
```

这里通过`view-transition-name`来设置名称

```
.item{  view-transition-name: var(--i);}
```

然后可以得到这样的效果，每个元素在变化前后会自动找到之前的位置，并且平滑的移动过去，如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1ib6xaFnSVfOjdqicSPbBlk2Zlhe6DuPib5x9A9qj9INDpWqSo8oL1GhKA/640?wx_fmt=gif)

完整代码可以查看

*   view-transition sort (juejin.cn)[2]
    
*   view-transition sort (codepen.io)[3]
    

是不是非常丝滑？这就是 `View Transitions` 的魅力！

二、View Transition 的核心概念
-----------------------

为啥仅仅加了一点点代码就是实现了如此顺畅的动画呢？为啥浏览器可以知道前后的元素位置关系呢？这里简单介绍一下变化原理。

整个 `JS` 部分只有一行核心代码，也就是`document.startViewTransition`，表示开始视图变换

```
document.startViewTransition(() => {  // 变化操作});
```

整个过程包括 3 部分

1.  调用`document.startViewTransition`，浏览器会捕捉当前页面的状态，类似于实时截图，或者 “快照”
    
2.  执行实际的 dom 变化，再次记录变化后的页面状态（截图）
    
3.  触发两者的过渡动画，包括透明度、位移等变化，也可以自定义 CSS 动画
    

下面是一个示意图

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1lzAZ0icDX0bWjXoTlw4NKxHVUfLibPrQt97WdiauDyQuZdTgmSjxzg5yw/640?wx_fmt=png)

在动画执行的过程中，还会在页面根节点自动创建以下伪元素

```
::view-transition└─ ::view-transition-group(root)   └─ ::view-transition-image-pair(root)      ├─ ::view-transition-old(root)      └─ ::view-transition-new(root)
```

下面是控制台的截图

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1ia21AWzJAgibjoxPwIErpFs9BPr2nIeD51kZdmfCWH1CVl6tzxyWLRwQ/640?wx_fmt=png)

其中，`::view-transition-old`表示**「旧视图」**的状态，也就是变化之前的截图，`::view-transition-new`表示**「新视图」**的状态，也就是变化之后的截图。

默认情况下，整个页面`root`都会作为一个状态，也就是上面的`::view-transition-group(root)`，在切换前后会执行淡入淡出动画，如下

```
:root::view-transition-new(root) {  animation-name: -ua-view-transition-fade-in; /*淡入动画*/}:root::view-transition-old(root) {  animation-name: -ua-view-transition-fade-out; /*淡出动画*/}
```

这也是为什么在使用了`document.startViewTransition`后整个页面会有淡入淡出的效果了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1QV6rvz4XGGjNofog7quCJtiappuibYwIS0TE8yET6ZrnTY6biadqcpgaQ/640?wx_fmt=gif)

为了让每个元素都有自己的过渡状态，这里需要给每个元素都指定名称

```
.item{  view-transition-name: item-1;}
```

这样指定名称后，每个名称都会创建一个`::view-transition-group`，表示独立的分组

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1mGgVvfL3icTtazBWCmjmjHibqXxTHdc2O9vyoCRkFPMSohPBteO96OqQ/640?wx_fmt=png)

这样在变化前后`view-transition-name`相同的部分就会一一自动执行过渡动画了，以第 4、5 个元素为例（在 3 删除以后）

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1aDYu9Nvuia44mUXvBudNyIia3E80qPxRdRDeVctJShjY4rvK7R2swjrQ/640?wx_fmt=png)

最后就会得到这样的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1ib6xaFnSVfOjdqicSPbBlk2Zlhe6DuPib5x9A9qj9INDpWqSo8oL1GhKA/640?wx_fmt=gif)

核心概念就这些了，下面再来看几个例子

三、不同元素之间的过渡
-----------

视图变化其实和元素是否相同没有关联，有关联的只有`view-transition-name`，浏览器是根据`view-transition-name`寻找的，也就是相同名称的元素在前后会有一个过渡动画。

比如下面这样一个例子

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1tTGKqA8yb5VJI4ickLSiaWC9kwnVzRoqS1N87510ywDVhew6y91cmurw/640?wx_fmt=gif)

每个按钮在打开弹窗时，都可以清楚的看到弹窗是从哪里出现的，如何实现这样的效果呢？

从本质上看，其实就是**「按钮到弹窗的视图变换」**，按照前面讲到的，可能会想到给前后加上相同的`view-transition-name`，下面是`HTML`结构

```
<div class="bnt-group" id="group">  <button>按钮1</button>  <button>按钮2</button>  <button>按钮3</button></div><dialog id="dialog">  <form method="dialog">    我是弹窗    <button>关闭</button>  </form></dialog>
```

尝试一下

```
button,dialog{  view-transition-name: dialog;}
```

然后添加点击打开弹窗事件

```
group.addEventListener('click', function(ev){  if (ev.target.tagName === 'BUTTON') {    if (document.startViewTransition) {      document.startViewTransition(() => {        dialog.showModal()      });    } else {      dialog.showModal()    }  }})
```

这样会有什么问题吗？运行如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1bia9FpG679HgHdbA2GormoicrjOh07BRgVRGicjyMdFELn15ZQYTFLgbg/640?wx_fmt=png)

很明显报错了，意思就是一个页面中不能有相同的`view-transition-name`。严格来讲，是**「不能同时出现」**，如果其他元素都是隐藏的，只有一个是显示的，也没有问题。其实仔细想一下，也很好理解，如果同时有两个相同的名称，并且都可见，最后变换的时候该以哪一个为准呢？

所以，在这种情况下，正确的做法应该是动态设置`view-transition-name`，比如默认不给按钮添加名称，只有在点击的时候才添加，然后在变换结束之后再移除按钮的`view-transition-name`，实现如下

```
group.addEventListener('click', function(ev){  if (ev.target.tagName === 'BUTTON') {    ev.target.style.viewTransitionName = 'dialog' // 动态添加 viewTransitionName    if (document.startViewTransition) {      document.startViewTransition(() => {        ev.target.style.viewTransitionName = '' // 结束后移除 viewTransitionName        dialog.showModal()      });    } else {      dialog.showModal()    }  }})
```

这样就实现了动态缩放的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1x3wYH7cKzfKicciaer7GAY9o3Xl3UxY8PmvYhxzt5MAWyxcBicOSUx2jQ/640?wx_fmt=gif)

大致已经实现想要的效果，不过还有一个小问题，我们把速度放慢一点（把动画时长设置长一点）

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1CufFhIC4iahkMu1tn1x7SqZydGnz0wCQibbiaeZj6zevTHtja7t4KZvbw/640?wx_fmt=gif)

可以清楚的看到，原本的按钮先放大到了弹窗大小，然后逐渐消失。这个过程是我们不需要的，有没有办法去掉呢？

当然也是可以的！原本的按钮其实就是旧视图，也就是点击之前的截图，我们只需要将这个视图隐藏起来就行了

```
::view-transition-old(dialog) {  display: none;}
```

这样就完美实现了从哪里点击就从哪里打开的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1tTGKqA8yb5VJI4ickLSiaWC9kwnVzRoqS1N87510ywDVhew6y91cmurw/640?wx_fmt=gif)

完整代码可以查看：  

*   view-transition-dialog (juejin.cn)[4]
    
*   view-transition-dialog (codepen.io)[5]
    

四、自定义过渡动画
---------

通过前面的例子可以看出，默认情况下，视图转换动画是一种淡入淡出的动画，然后还有如果位置、大小不同，也会平滑过渡。

除此之外，我们还可以手动指定过渡动画。比如下面这个例子

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd16IiceaUMIicmXBCefGvh0x65QQK1Ihoor4ZZf5pUGso5JIhzCkHwnP2Q/640?wx_fmt=gif)

这是一个黑暗模式的简易模型，实现也非常简单，准备两套主题，这里用`color-scheme`实现  

> 有关 color-scheme 的更多详情可以参考这篇文章：[CSS color-scheme 和夜间模式（直接跳转）](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247485452&idx=1&sn=91fa021727e8ceabef47a3d43de58bee&chksm=97c66bc3a0b1e2d5b5aa0bf754a174d5a1ca3cff41c1155fd29e99aea79a669f55e70a5eded1&scene=21#wechat_redirect)

```
.dark{  color-scheme: dark;}
```

然后通过点击动态给`html`切换`dark`类名

```
btn.addEventListener('click', function(ev){  document.documentElement.classList.toggle('dark')})
```

这样就得到了主题切换效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd179VJAcZpicl5OCpPINCTms7ClfHyRWW0k8icGCCfskXjyh2xAwVLLALg/640?wx_fmt=gif)

接着，我们添加视图转换动画

```
btn.addEventListener('click', function(ev){  if (document.startViewTransition) {    document.startViewTransition(() => {      document.documentElement.classList.toggle('dark')    });  } else {    document.documentElement.classList.toggle('dark')  }})
```

这样就得到了一个默认的淡入淡出的切换效果（为了方便观察，将动画时长延长了）

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1FDjibfqdWD8iceicc1II3gftNMQAr5vBye09rNeHvek6Sdakv1ece3zPA/640?wx_fmt=gif)

你可以把前后变化想象成是两张截图的变化，如果要实现点击出现圆形裁剪动画，其实就是在新视图上执行一个裁剪动画，由于是完全重叠的，所以看着像是一种穿透扩散的效果

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1Az2lNLLv8wShfMZWb6tVRFXK52TaYjQzavehhsGvPd7pic8MrT5EuYQ/640?wx_fmt=png)

动画很简单，就是一个`clip-path`动画

```
@keyframes clip {  from {    clip-path: circle(0%);  }  to{    clip-path: circle(100%);  }}
```

我们把这个动画放在`::view-transition-new`中

```
::view-transition-new(root) {  /* mix-blend-mode: normal; */  animation: clip .5s ease-in;  /* animation-duration: 2s; */}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1iaceQRJ5GU2xBKzFCwuwvkqbEg6WpRiap42mCQ6qvFLPZwmfLfQlu3Ng/640?wx_fmt=gif)

是不是还有点奇怪？这是因为默认的一些样式导致，包括原有的淡出效果，还有混合模式

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1GsDyZZGLIUL7NT6tmG2CK6VJZiaP9iaggfA98oyZ7wKGOgJghcxsIRibA/640?wx_fmt=png)

所以还需要去除这些影响

```
::view-transition-old(root) {  animation: none;}::view-transition-new(root) {  mix-blend-mode: normal;  animation: clip .5s ease-in;}
```

当然你可以把鼠标点击的位置传递到页面根节点

```
btn.addEventListener('click', function(ev){  document.documentElement.style.setProperty('--x', ev.clientX + 'px')  document.documentElement.style.setProperty('--y', ev.clientY + 'px')  if (document.startViewTransition) {    document.startViewTransition(() => {      document.documentElement.classList.toggle('dark')    });  } else {    document.documentElement.classList.toggle('dark')  }})
```

动画里直接通过 CSS 变量获取

```
@keyframes clip {  from {    clip-path: circle(0% at var(--x) var(--y));  }  to{    clip-path: circle(100% at var(--x) var(--y));  }}
```

这样就实现了完美的扩散切换效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd16IiceaUMIicmXBCefGvh0x65QQK1Ihoor4ZZf5pUGso5JIhzCkHwnP2Q/640?wx_fmt=gif)

完整代码可以查看：

*   view transition theme change - (juejin.cn)[6]
    
*   view transition theme change (codepen.io)[7]
    

五、其他案例
------

找了几个有趣的例子

只要涉及到前后过渡变化的，都可以考虑用这个特性，例如下面的拖拽排序

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1LIgHz5Sias7hePOcSVQGIfbjXgh6Lc2wWCpNgkM9L9sZiaYv0hZdhJiaA/640?wx_fmt=gif)

> https://codepen.io/argyleink/pen/rNQZbLr

再比如这样一个数字过渡动画

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1ILlS9FibPBvwJeDnEID8H96s05KbIwfsJ21PWq2nkXA6BM6U0C0VlCA/640?wx_fmt=gif)

> https://codepen.io/argyleink/pen/jOQKdeW

还有类似于 APP 的转场动画（多页面跳转）

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKEDV3iaSZs6a1QUKEfU6vd1F8Dibnw6F7S7JtWkmENFNX1tHZc9Mtwp9l1AWyQ4j272WtSXu7BINjA/640?wx_fmt=gif)

> https://simple-set-demos.glitch.me/6-expanding-image/

五、总结和说明
-------

总的来说，原生的视图转换动画可以很轻松的实现两种状态的过渡，让 web 也能实现媲美原生 APP 的动画体验，下面再来回顾一下整个变化过程：

1.  调用`document.startViewTransition`，浏览器会捕捉当前页面的状态，类似于实时截图，或者 “快照”
    
2.  执行实际的 dom 变化，再次记录变化后的页面状态（截图）
    
3.  触发两者的过渡动画，包括透明度、位移等变化，也可以自定义 CSS 动画
    
4.  默认情况下是整个页面的淡入淡出变化
    
5.  `::view-transition-old`表示**「旧视图」**的状态，也就是变化之前的截图，`::view-transition-new`表示**「新视图」**的状态，也就是变化之后的截图。
    
6.  如果需要指定具体元素的变化，可以给该元素指定`view-transition-name`
    
7.  前后变化不一定要同一元素，浏览器是根据`view-transition-name`寻找的
    
8.  同一时间页面上不能出现两个相同`view-transition-name`的元素，不然视图变化会失效
    

另外，视图转换动画应该作为一种**「体验增强」**的功能，而非必要功能，在使用动画时其实拖慢了页面打开或者更新的速度，并且在动画过程中，页面是完全 “冻结” 的，做不了任何事情，因此需要衡量好动画的时间，如果页面本身就很慢就更不要使用这些动画了。

[1]View Transitions： _https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API_

[2]view-transition sort (juejin.cn)： _https://code.juejin.cn/pen/7268263402853072931_

[3]view-transition sort (codepen.io)： _https://codepen.io/xboxyan/pen/BavBevP_

[4]view-transition-dialog (juejin.cn)： _https://code.juejin.cn/pen/7268262983178911779_

[5]view-transition-dialog (codepen.io)： _https://codepen.io/xboxyan/pen/WNLeBgY_

[6]view transition theme change - (juejin.cn)： _https://code.juejin.cn/pen/7268257573277532219_

[7]view transition theme change (codepen.io)： _https://codepen.io/xboxyan/pen/poqzmLY_