> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RlEQD9JeU3lU08PXuht6jw)

现代 `CSS` 强大的令人难以置信。这次我们来用 `CSS` 实现一个全功能的滑动输入器，也就是各大组件库都有的`slider`，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZctQPIVPI9Vic4TvtCRO4vsfJgCtwMHHyqQNK99LZo4b3ZOqZFIdHcR8w/640?wx_fmt=gif&from=appmsg)

还可以改变一下样式，像这样

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcFicdiao862y5EhaIlgwFFKQQZkxWDXWkx3fZE258pxARQP8pTxVINe6Q/640?wx_fmt=gif&from=appmsg)

特别是在拖动时，`tooltip`还能跟随拖动的方向和速度呈现不同的倾斜角度，这些是如何通过`CSS`实现的呢？一起来看看吧~

一、自定义 input range
-----------------

首先来看滑动输入器的最原始形态

```
<input type="range">
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcpcCdicdZ8MPos1nOVhiaB3aBE2z80icyhpAk4wqE5xkUmlv18st2ztic8w/640?wx_fmt=png&from=appmsg)

要自定义样式，一般要修改这几个伪元素

```
::-webkit-slider-container{  /*容器*/}::-webkit-slider-runnable-track{  /*轨道*/}::-webkit-slider-thumb{  /*手柄*/}
```

这里可以很轻松的改变轨道的宽高，拖拽手柄的大小等等

```
[type="range"] {    -webkit-appearance: none;    appearance: none;    margin: 0;    outline: 0;    background-color: transparent;    width: 400px;    overflow: hidden;    height: 20px;}[type="range"]::-webkit-slider-runnable-track {    height: 4px;    background: #eee;    border-radius: 4px;}[type="range"]::-webkit-slider-thumb {    -webkit-appearance: none;    appearance: none;    width: 20px;    height: 20px;    border-radius: 50%;    background-color: #9747FF;    transform: translateY(-50%);    margin-top: 2px;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZczMFupV7yMEMTN6amibEGric9Fjt8Zv1gE6B5mWUvPmNlNWoDt9Wx90icA/640?wx_fmt=png&from=appmsg)

相信大家很容易做到这一步，因为只需要自定义这几个伪元素就行了。

这里还有一个难点，就是左边滑过的区域，如何也自定义颜色呢？毕竟没有专门的选择器（Firefox 有，这里主要讨论 Chrome），接下来请继续看

二、自定义滑过区域的颜色
------------

在之前，曾经通过`border-image`实现过类似的效果，主要原理是`border-image`可以在绘制元素之外，在拖拽手柄左侧绘制一个足够长的条条就行了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07Zc8MMoWJnpMtOD4SObnPJPxzDicHicw4m13qJF19l3N5PNGuVqibiaUAt0yg/640?wx_fmt=gif&from=appmsg)

不过这种实现有一个局限，由于是通过超出隐藏的方式裁剪掉多出的部分，使得滑动条边缘是 “一刀切” 的，无法实现圆角

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07Zc3FTYX7zEVJd0nPYYQyC2TjqskXjJnr4hXu7M8LWBkG2MIrIjImAYfA/640?wx_fmt=png&from=appmsg)

回到这里，可以想想，要实现自定义左边滑过区域的样式，本质是需要知道当前的滑动进度，假设进度是`--progress`，那么轨道滑过区域的背景色可以这样来表示

```
[type="range"]::-webkit-slider-runnable-track {    height: 4px;    background: linear-gradient(#9747FF 0 0) 0 0/calc(var(--progress) * 1%) 100% no-repeat #eee;    border-radius: 4px;}
```

那么，如何实时获取这个进度呢？

在以往，可以借助 `JS`实时更新这样一个自定义变量，这也是目前最好的实现方式

而现在，有了更好的方式来彻底实现这样一个功能，那就是滚动驱动动画。

> [CSS 滚动驱动动画终于正式支持了~](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487775&idx=1&sn=54d09243e36c7d5470982d4237bf8303&chksm=97c672d0a0b1fbc6676ce29a16e13f186689e253d0d7c1454fb95c8d9530b7d443468b94ad4b&scene=21#wechat_redirect)

有些同学可能无法理解，这里又没有滚动，怎么会和这个特性有关呢？别急，滚动驱动有两种类型，一个是 `scroll()`、还有一个是`view()`，我们这里要用到的就是`view()`，其实也就是利用这一点来监听元素在视区的位置。

具体怎么做呢？

首先，通过`@property`定义一个`CSS`变量，整数类型

```
@property --progress {    syntax: "<integer>";    initial-value: 0;    inherits: true;}
```

然后定一个动画，从`0`到`100`就行了，表示进度

```
@keyframes slider {    to {        --progress: 100;    }}
```

由于是需要监听拖拽手柄，也就是`::-webkit-slider-thumb` 的位置，所以要给这个伪元素添加`view-timeline`，但是我们需要通过`::-webkit-slider-thumb`改变父级轨道`::-webkit-slider-runnable-track`的样式，所以需要用到`time-scope`（可以跨层级关联），具体实现如下

```
[type="range"]{    timeline-scope: --slider;    animation: slider linear 3s reverse;    animation-timeline: --slider;    }[type="range"]::-webkit-slider-thumb {    /**/    view-timeline: --slider inline;}
```

这样一来，拖拽手柄的位置就通过动画实时映射到了`input` 上，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcWYC0HsO6NuEmuEHOtRbrsdBDFvhjpuMe3wnl9ETLomc5DNCxicLOtUw/640?wx_fmt=gif&from=appmsg)

这样就是实现了自定义滑动区域的样式，是不是非常神奇？

三、实时显示滑动进度
----------

由于前面实现了`--progress`的实时变化，现在展示出来就比较容易了，需要用`CSS`计数器

为了方便表示，我们可以单独用一个标签来展示进度，结构如下

```
<label class="slider">  <input type="range">  <output class="tooltip"></output></label>
```

然后将`--progress`通过伪元素呈现出来

```
.tooltip::before{  content: counter(num);  counter-reset: num var(--progress);}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07Zc0G7ynqc6CmbtT4GANz8nL33a1s7wFibicftfbVz3Leoej2xEle6libmtA/640?wx_fmt=gif&from=appmsg)

数字已经可以正常显示了，但是有个问题，起始点不对，不是`0`和`100`，我们把拖拽手柄透明度降低，可以看到进度其实是这样的

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07Zc9KI2sAoIeAPBzEbZSAlCPyHwAHzKEdPjphIcqgg1VTiaicrQS8YmCPIw/640?wx_fmt=gif&from=appmsg)

这是由于默认的`animation-range`是`cover`，除了这种方式，还有其他几种方式

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcTU3y6ib2VLiaia49UbibLMKvn3wTibEpWRZl6UTll7s2n9Dls0zJW0xSx8w/640?wx_fmt=png&from=appmsg)

很明显，我们这里应该需要`contain`，因为滑块是始终在轨道内的

```
.slider{    position: relative;    timeline-scope: --slider;    animation: slider linear 3s reverse;    animation-timeline: --slider;    animation-range: contain; /*设置animation-range*/}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcwWHaA2WJgsbQ4GDiaF75CGp7xA4BtwS45goMBv5C7fernxSaajQbib3w/640?wx_fmt=gif&from=appmsg)

这样进度就正常了

四、tooltip 自动跟随滑块
----------------

首先美化一下，小三角可以用另一个伪元素实现

```
.tooltip{  position: absolute;  margin: 0 0 20px;  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);  font-size: 14px;  border-radius: 4px;  padding: 10px;  color: #f0f0f0;  background-color: #333;  transform-origin: center bottom;  filter: drop-shadow(4px 4px 4px rgba(50, 50, 50, 0.3));}.tooltip::after{  content: "";  position: absolute;  top: 100%;  left: 50%;  margin-left: -5px;  border-width: 5px;  border-style: solid;  border-color: black transparent transparent transparent;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcPlIcgK3tjnegaaUfO7KicrRhSDhOLrIfp22YM8StxS2qweXcamgNRuQ/640?wx_fmt=png&from=appmsg)

那么，如何让这个`tooltip`自动跟随滑块呢？

一种方式是直接通过`--progress`来计算`left`值

```
.tooltip{  position: absolute;  left: calc(var(--progress) * 1%);}
```

不过这种计算是有偏差的，这是因为定位是相对于轨道位置的，而不是滑块中心

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcBtR83u4QlsgfQPtJBW6qCmJeSAicyqmNgQSBGFhcyRcic8yBpPq5qF3A/640?wx_fmt=gif&from=appmsg)

为了修复这个问题，我们可以给`input`一个负的`margin`

```
[type="range"] {    /*  */    margin: 0 -10px;}
```

这样就可以了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcF4dSQ30Noz1ibT1crIbDNFHb4Zpibff6eUEYSBAS2Xf9vyX3iak1mqeew/640?wx_fmt=gif&from=appmsg)

不过这样还有有尺寸方面的问题的，如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcVUsdNK7FaOPnwWObuslk0yasVfm1SIoXA8AMfNysP55twSkCZBliapw/640?wx_fmt=png&from=appmsg)

除了这种方式，还可以用锚点定位的方式实现，有兴趣可以参考之前这篇文章：[CSS 锚点定位终于来了！](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247489682&idx=1&sn=c580aedbca1aede16eee6204771b52f2&chksm=97c67b5da0b1f24bd143bb18c7d615a843b39f3a964d99485b16a3b3795a14b32516bb63d4db&scene=21#wechat_redirect)

实现非常简单，只需要给滑块一个`anchor-name`

```
[type="range"]::-webkit-slider-thumb {    /**/    anchor-name: --thumb;}
```

然后给`tooltip`设置锚点定位

```
.tooltip{  position: absolute;  position-anchor: --thumb;  inset-area: top;}
```

这样就完美实现了，也不用担心定位偏差的问题

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcF4dSQ30Noz1ibT1crIbDNFHb4Zpibff6eUEYSBAS2Xf9vyX3iak1mqeew/640?wx_fmt=gif&from=appmsg)

五、自动跟随拖拽方向
----------

还有最后一个效果，可以自动跟随拖拽方向，这是如何实现的呢？其实在之前这篇文章中有详细讲解

> [纯 CSS 检测滚动的速度和方向](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247489589&idx=1&sn=062542b715059b093e4e7c6cc7f67d88&chksm=97c67bfaa0b1f2ecdfc4e564ddb22c2e18048b776a0d48dc2c3afc451de3a8b585a5d24026f3&scene=21#wechat_redirect)

具体原理可以回顾这篇文章，这里简单介绍一下

重新定义一个`CSS`变量

```
@property --progress2 {    syntax: "<integer>";    initial-value: 0;    inherits: true;}
```

然后给这个变量设置为`--progress`，但是要给一个过渡时间

```
.tooltip{  --progress2: var(--progress);  transition: --progress2 .1s ease-out;}
```

由于有过渡时间，所以这两个变量就会有一个差值，类似于这样

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcMV5377LicVTwia36FuxYLVYvoIliccFE106p7CPzq1yScrCtplDTXAicmg/640?wx_fmt=gif&from=appmsg)

根据这个差值，我们不就可以知道拖动方向和速度了吗，然后给一个旋转角度

```
.tooltip{  transform-origin: center bottom;  rotate: calc((var(--progress2) - var(--progress))*2deg);}
```

这样就实现了文章开头所示效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZctQPIVPI9Vic4TvtCRO4vsfJgCtwMHHyqQNK99LZo4b3ZOqZFIdHcR8w/640?wx_fmt=gif&from=appmsg)

完整代码可以查看以下链接

*   CSS slider (juejin.cn)[1]
    
*   CSS slider (codepen.io)[2]
    

还可以改变一下样式

```
[type="range"]::-webkit-slider-runnable-track {    height: 20px;    background: linear-gradient(#9747FF 0 0) 0 0/calc(var(--progress) * 1% + 20px * (50 - var(--progress))/100) 100% no-repeat #eee;    border-radius: 24px;}[type="range"]::-webkit-slider-thumb {    -webkit-appearance: none;    appearance: none;    width: 20px;    height: 20px;    border-radius: 50%;    background-color: #fff;    border: 3px solid #9747FF;    view-timeline: --slider inline;    anchor-name: --thumb;}
```

这样可以得到下面的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKoyxQZQ8Wibgxy4ZSicv07ZcFicdiao862y5EhaIlgwFFKQQZkxWDXWkx3fZE258pxARQP8pTxVINe6Q/640?wx_fmt=gif&from=appmsg)

完整代码可以查看以下链接

*   CSS custom slider (juejin.cn)[3]
    
*   CSS custom slider (codepen.io)[4]
    

六、兼容性和总结
--------

这个实现主要依赖于滚动驱动动画，所以兼容性要求`Chrome 115+`，如果需要`tooltip`的锚点定位，则需要`Chrome 125+`，下面总结一下

1.  `Chrome` 没有专门的选择器来自定义滑过区域的样式
    
2.  通过`border-image`可以自定义滑过区域的样式，但是不能实现圆角
    
3.  滚动驱动动画的视图滚动可以监听滑块的位置
    
4.  通过`CSS`变量和滚动驱动动画可以将实时进度传递给轨道，从而通过线性渐变绘制滑过区域颜色
    
5.  借助`CSS`计数器和伪元素可以将`CSS`变量显示在页面
    

当然，不兼容的浏览器也可以采用回退措施，比如不支持滚动驱动动画，我们可以用 JS 来动态赋值`--progress`变量，不支持锚定定位，我们可以用绝对定位，配合`left`也能实现，虽然复杂一点，但也是现阶段比较好的处理方式了，剩下的就交给时间吧。

[1]CSS slider (juejin.cn)： _https://code.juejin.cn/pen/7409224431194603574_

[2]CSS slider (codepen.io)： _https://codepen.io/xboxyan/pen/eYwxxdQ_

[3]CSS custom slider (juejin.cn)： _https://code.juejin.cn/pen/7415566353493000219_

[4]CSS custom slider (codepen.io)： _https://codepen.io/xboxyan/pen/OJeddWm_