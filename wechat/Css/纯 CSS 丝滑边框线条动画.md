> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kzI9OOcCIKfVstus1rpQ-A)

![](https://mmbiz.qpic.cn/mmbiz_gif/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAA8TVj4k2tHPnicQXIIiavGq795JMfjyEYg5JcapHqNGK7ibv0tcp1HhibjQ/640?wx_fmt=gif&from=appmsg)

在这个网站（minimal-portfolio-swart.vercel.app）发现一个不错的交互效果，用户体验效果很不错。如上图所示，这个卡片上有一根白色的线条围绕着卡片移动，且在线条的卡片内部跟随这一块模糊阴影，特别是在线条经过卡片圆角部分有特别丝滑的感觉。

今天的文章就来解析如何实现这种效果，文末附源码预览地址。根据示例图片分析需要实现的功能点如下：

*   线条跟随卡片边框匀速移动
    
*   线条内部对应有模糊阴影
    
*   圆角部分丝滑动画
    

这里为什么单独说明圆角部分是因为这块需要特殊处理，请看后面的文章。

### 思考

看到这个效果首先感觉是丝滑，沿着边框移动的动画元素如果是根据当前边框实时计算而来的话，那么难度和算法会劝退很多人。

需要换一种思路，本质移动的线条元素和边框并没有关系，而是一个元素沿着边框移动，线条和卡片内部的阴影就是一个元素，通过某种透视的方式产生了这种效果。

### 透视

通过透视的方式实现一个边框效果，我们可以用 2 个盒子嵌套，父级设置 1 像素的 padding，如下代码简单的实现一个边框效果。

```
.outer {  width: 400px;  height: 200px;  margin: 100px;  background: rgb(54, 224, 202);  padding: 1px;  position: relative;}.inner {  background: rgb(99, 99, 99);  width: 100%;  height: 100%;}
```

效果图：

![](https://mmbiz.qpic.cn/mmbiz_png/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAACWL0yWyTljQoPBGQ2jU25Hc2LlzcNdUTaKWic0bxQ18UbnwTABmAlxg/640?wx_fmt=png&from=appmsg)

然后增加一个子元素作为移动的元素，这个元素基于父级定位在边框位置，由于动画是沿着卡片内部四周移动，要确保在每一条边上的透出的长度保持一致，所有创建的这个子元素是一个正方形。

```
.moving-element {    position: absolute;    top: 0;    left: 0;    width: 80px;    height: 80px;    background: #fff;    animation: moveAround 8s linear infinite;}
```

并对这个元素增加简单的`animation`动画，沿着内边框移动。

这个动画需要注意的一个点是要使元素在移动的过程中保持匀速的动画，需要计算每个关键帧之间的距离，并根据这些距离来调整每个关键帧的百分比。这样可以确保元素在每个时间段内移动的距离与时间成正比，从而实现真正的匀速移动。

这里我们以上面的卡片举例，其宽度为 400px，高度为 200px，元素沿矩形的边框移动。

*   计算总路径长度：总长度 = 2 (宽度 + 高度) = 2 (400px + 200px) = 1200px
    
*   计算每段所占的时间比例：水平边所占比例 = 400px / 1200px = 1/3 ≈ 33.33%，垂直边所占比例 = 200px / 1200px = 1/6 ≈ 16.67%
    

动画代码如下：

```
@keyframes moveAround {    0%, 100% {        top: 0px;        left: 0px;    }    33.33% {        top: 0px;        left: calc(100% - 80px);    }    50% {        top: calc(100% - 80px);        left: calc(100% - 80px);    }    83.33% {        top: calc(100% - 80px);        left: 0px;    }}
```

最终完成的简单版动画效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAABDvxZYYlJLXHTTWziczqMP3e1vytoelkycfphZRVNZ41UOCeJrHBlibA/640?wx_fmt=gif&from=appmsg)

这里为了方便大家看增加了透明度展示内部移动的元素，若去掉透明度则只有边框上的一根线。

### 边框效果处理

仔细看上面的图可以发现在边框尽头时的过渡效果不好，瞬间从一条边切换到另一条边。首先还原网站的效果，增加边框圆角，然后将内部移动的元素通过圆角变成一个圆形，这时候还需要同步调整内部元素的定位和动画移动时设置的定位，保证内部圆形的中心和边框的一致。

增加圆角处理：

```
.outer {  border-radius: 20px;}.inner {  border-radius: 20px;}.moving-element {  border-radius: 40px;  /* 圆心和边框一致 */  transform: translate(-40px, -40px);}
```

调整动画过程中的定位：

```
@keyframes moveAround {    0%, 100% {        top: 0px;        left: 0px;    }    33.33% {        top: 0px;        left: 100%;    }    50% {        top: 100%;        left: 100%;    }    83.33% {        top: 100%;        left: 0px;    }}
```

此时的动画效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAASmodh6A1SSn7icib3VjCC1MXzibufsAxEicJOlCRDrDjFWjeJ9z3ic8cGJA/640?wx_fmt=gif&from=appmsg)

此时的边框位置动画已经很接近网站的效果，进一步观察在图中的效果可以发现在边框角落的位置有一点卡顿的感觉，这是因为边框位置我们设置了圆角，但是元素移动的轨迹是直角，导致视觉上停顿了一下。这里我们需要进一步优化`animation`。设置圆角后内部动画元素移动的点应该从 4 个变成 8 个，且对应的位置需要和圆角的大小一一对应才能保障流畅的动画效果。

如下所示黑色圆点是到四个顶点的动画坐标，新的绿色圆点是基于圆角后的动画移动坐标。

![](https://mmbiz.qpic.cn/mmbiz_png/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAAHXuL7MUOQfjiadSg22JdtT5BkiaU5YteYGRiaPsicdK9L814knZO3riaNibw/640?wx_fmt=png&from=appmsg)

基于上面的动画百分比算法计算出最新的比例及坐标代码如下：

```
@keyframes moveAround {  0% { left: 40px; top: 0px; }  28.93% { left: 360px; top: 0px; }   33.99% { left: 400px; top: 40px; }   44.82% { left: 400px; top: 160px; }  49.88% { left: 360px; top: 200px; }   78.81% { left: 40px; top: 200px; }  83.87% { left: 0px; top: 160px; }   94.70% { left: 0px; top: 40px; }   100% { left: 40px; top: 0px; } }
```

这里的动画需要注意的是圆角部分绿色按钮之间的动画距离需要使用使用勾股定理计算。比如右上角的两个点之间的计算方式是：

> 从 (360, 0) 到 (400, 40) = √((400-360)² + (40-0)²) = √(1600 + 1600) = √3200 ≈ 56.57px

此时的动画效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAAv7IoO1icQgvSDKqzWel517RDEUibrsmF8s0iaqBGu1pV6I7gYcogC2Z0Q/640?wx_fmt=gif&from=appmsg)

### 模糊阴影

现在就差最后的阴影部分还未实现，仔细观察移动的线条并不是全实心纯色，而是有渐变的效果，目前移动的元素是一个正方形，设置背景色为径向渐变即可，修改背景色的代码如下：

```
background-image: radial-gradient(#fff 40%,transparent 80%);
```

![](https://mmbiz.qpic.cn/mmbiz_png/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAA91AlNKCXo1aNd8cdtLqKJM9RN9603Sgeib5pSsGo1y9MbGVIRsUuujA/640?wx_fmt=png&from=appmsg)

现在还需要将内部的渐变进一步模糊，注意这里仅仅是模糊元素背后的背景，不能影响卡片上面其他的元素内容展示。这里我们使用`backdrop-filter`设置`blur`模糊效果。

> CSS 属性 backdrop-filter 用于在元素后面的区域上应用图形效果（如模糊或颜色偏移）。这个属性可以让你对元素背后的背景进行处理，而不影响元素本身的前景内容。

![](https://mmbiz.qpic.cn/mmbiz_png/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAAhfjiarqhkBwcAOnBAFZ9TDgibondoRddqlNy494FyH18pibzicaWWMIhJw/640?wx_fmt=png&from=appmsg)

最后进一步调整颜色还原网站的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAAibsvNEJhIByEb8f25nbazeRmibLCjBzhlUIJuRIibNTJlDUxq5bmoCR3Q/640?wx_fmt=gif&from=appmsg)

这个效果不仅可以做卡片展示，作为按钮的背景效果也很不错：

![](https://mmbiz.qpic.cn/mmbiz_gif/f0eLpDCYMyicLTbdIvu0LCqYM6YZtJGAAh3JI1osVlOsdHb6A5jICVBp28AGpia67b4q5iaEdqKeWtMdmEp4soWTg/640?wx_fmt=gif&from=appmsg)

### 最后

到此整体的代码实现过程就结束了，完整还原的网站的动画效果。这是一个对用户体验很不错的卡片效果，原网站实现的部分细节不一样，整体实现原理差不多，基于两个元素的 1 像素间距透出移动的线条，配合使用`backdrop-filter`设置纯背景模糊效果，有兴趣的可以尝试看看。

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)  

`点赞`和`在看`是最大的支持 ⬇️❤️⬇️