> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3PisjKT3ZJSN5J91tPFX3w)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCWjZkmHmnkf1HT6sh26T2fVK3R2jHSQodsD6D6UJzUbOHe8Lc5IooaNRQFsaFmvykbwgRnKbKe3nQ/640?wx_fmt=jpeg)

**一、简介**
--------

Loading 几乎是每个应用都会用到的一个组件。很多组件库都会提供相应的 Loading 组件，但是有的时候我们可能需要自定义 Loading 效果，掌握 Loading 组件制作的基础知识将变得非常必要。Loading 主要就是一个旋转的圆环，而旋转部分则比较简单，直接通过 CSS 动画即可实现，所以关键部分就是得到 Loading 的圆环。

**二、通过 border-radius 绘制圆环**
---------------------------

我们通常让一个元素变成圆形是先将一个元素设置为长和宽相等的正方形，然后给这个元素设置一个 border-radius 值为 50%。需要注意的是，border-radius: 50% 是让整个正方形元素都变成圆形，即包括边框和内容区。所以我们可以通过控制元素边框和内容区的大小，将元素的内容区域作为内圆，将元素的边框区域作为外圆，从而绘制出一个圆环。

```
<div class="loading-css"></div>
```

```
.loading-css {
    width: 50px; /*先将loading区域变成正方形*/
    height: 50px;
    display: inline-block; /*将loading区域变成行内元素，防止旋转的时候，100%宽度都在旋转*/
    border: 3px solid #f3f3f3; /*设置四周边框大小，并将颜色设置为浅白色*/
    border-top: 3px solid red; /*将上边框颜色设置为红色高亮，以便旋转的时候能够看到旋转的效果*/
    border-radius: 50%; /*将边框和内容区域都变成圆形*/
}
```

  

此时效果如下:  

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwibIZvibLG7KGMyLbicj7rpDiaNNFpoqVNNMW0ibmxoMVdSS10nTrbQ0cUibg/640?wx_fmt=png)

  
圆环效果已经出来了，接下来让圆环旋转起来即可，如:

  

```
@keyframes loading-360 {
    0% {
        transform: rotate(0deg); /*动画起始的时候旋转了0度*/
    }
    100% {
        transform: rotate(360deg); /*动画结束的时候旋转了360度*/
    }
}
.loading-css { /*在之前的CSS中加上动画效果即可*/
    animation: loading-360 0.8s infinite linear; /*给圆环添加旋转360度的动画，并且是无限次*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJw5ZK0fhd87aYdQr8HRFdRRXAtgGibXXPkyB7VnRAyLUacyvDGwV4vWKg/640?wx_fmt=gif)

**二、通过 svg 来绘制圆环**
------------------

SVG 意为可缩放矢量图形（Scalable Vector Graphics），其使用 XML 格式定义图像，<circle> 标签可用来创建一个圆，同时外面必须嵌套一个 <svg> 标签。

```
<svg viewBox="0 0 50 50" class="loading-svg">
    <circle cx="25" cy="25" r="20" fill="none" class="path"></circle>
</svg>
```

  

```
.loading-svg {
    width: 50px; /*设置svg显示区域大小*/
    height: 50px;
}
```

**<svg> 标签的 width 和 height 设置的是 svg 图形可显示区域大小。而 viewBox 表示的是截取图形的区域，因为矢量图的绘制区域可以是无限大的，具体绘制在哪里根据具体的设置而定**，比如上面的 circle 就绘制在圆心坐标为 (25,25)，半径为 20 的圆形区域中，而 viewBox 设置为 0 0 50 50，表示截图区域为左上角坐标为(0, 0)，右下角坐标为(50,50) 的矩形区域内，即**会截取这个区域内的矢量图，然后将截取的矢量图放到 svg 的可显示区域内，同时会根据 svg 可显示区域的大小等比例进行缩放，但是截取的图片必须在 svg 可显示区域内完整显示。**

  
假如，现在讲 svg 的大小设置为 60px，如:

  

```
.loading-svg {
    width: 60px; /*设置svg显示区域大小*/
    height: 60px;
}
```

如上分析，viewBox 截图区域中，绘制的圆的圆心正好在截图区域的中心，所以截图区域四周边框与绘制的圆之间有 5px 的距离，而圆的半径为 20px，所以比例为 1:4，现在将 svg 显示区域变为 60px，所以也需要将截图区域等比例放大并占满整个 svg 显示区域，截图区域经过拉伸后，圆心位置变为了 (30,30)，即半径变为了 30，按 1:4 比例，半径变为 24，外围变为了 6，所以整个圆也会跟着变大。

需要注意的时候，<cicle> 绘制的圆目前是看不到的，因为没有给画笔设置上颜色，如:

```
.path {
    stroke: #409eff; /*给画笔设置一个颜色*/
    stroke-width: 2; /*设置线条的宽度*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwyMfZibR8THiapluyibQj1ibs2Zicy0lIca626actwG3KBJz5qc1nvtAajCA/640?wx_fmt=png)

  
此时可以看到绘制出的圆环了。为了给圆环添加转动效果，我们需要绘制带缺口的圆环，后面通过改变缺口的位置大小来实现转动效果，如:

  

```
.path {
    stroke-dasharray: 95, 126; /*设置实线长95，虚线长126*/
    stroke-dashoffset: 0; /*设置虚线的偏移位置*/
}
```

```
// 0%
{
    stroke-dasharray: 1, 126; /*实线部分1，虚线部分126*/
    stroke-dashoffset: 0; /*前面1/126显示实线，后面125显示空白*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwe9iclGvYe48HlfArz7SwezB0O5CLIM1le6zAb0QBRiaTurt2qFQCZp8w/640?wx_fmt=png)

  
如图所示，圆环的绘制起点是在水平方向最右边的那个点，然后进行顺时针绘制。因为该圆环的周长为 2_3.14_20=125.6，约等于 126，stroke-dasharray 设置了实线 (可见部分) 长为 95，约等于圆的 3/4，所以只能绘制到圆环的最高点位置，接下来是 126 的虚线，但是圆环周长只有 126，所以只能显示 31 的虚线。可以看做是一根无限循环的水平线条，实线 (-221,0)--- 虚线 (-126,0)--- 目前起点为 (0,0)--- 实线 (95,0)--- 虚线 (221,0)--- 实线 (316,0)，然后让水平线的起点 (0,0) 位置与圆环的起点位置重合，水平线顺时针沿着圆环绕即可，随着 stroke-dashoffset 起点位置的偏移，左侧的 (-126,0) 的虚线就可以慢慢显示出来。当 stroke-dashoffset 值为负数的时候，上面的线往右拉，当 stroke-dashoffset 值为正数的时候，下面的线往右拉。

  

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJw8ibrHzJDLiaetQgER93hmxRfNynj3WFqCZlvLUWoG2Fr3ufuBdQZQiazw/640?wx_fmt=png)

  

  

接下来就是添加圆环的转动效果，分别设置三个动画状态，如:

  

```
// 50%
{
    stroke-dasharray: 95, 126; /*实线部分95，虚线部分126*/
    stroke-dashoffset: -31px; /*顺时针偏移31/126，即前31/126显示空白，后面3/4显示线条*/
}
```

  

从圆环最右边作为起点绘制 1 个像素的距离的实线，接下来绘制 126 像素的虚线 (空白)，因为圆周长为 126，所以剩余部分全部为空白，如图所示，

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwibfVxLr0DOicytbNkFNzTSZx2HSQKWwuARpM8j20StSPfTibKI6Tm7reg/640?wx_fmt=png)

  

```
// 100%
{
    stroke-dasharray: 6, 120; /*实线部分6，虚线部分120*/
    stroke-dashoffset: -120px; /*最后顺时针偏移120/126，即前120/126显示空白，后面6点显示线条部分*/
}
```

  

从圆环的最右边作为起点，并且顺时针移动 31 像素，即圆环的 1/4，所以实线起点变为了圆环的最底部，实线长度为 95 像素，即圆环的 3/4，如图所示，

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwwnibbqNlN2IX8f69oNyKgMHLEVZicxSUtrUdMX4d8ic1qxQSy7q4dcusA/640?wx_fmt=png)

  

  

```
.path {
    animation: loading-dash 1.5s ease-in-out infinite;
}
@keyframes loading-dash {
    0% {
        stroke-dasharray: 1, 126; /*实线部分1，虚线部分126*/
        stroke-dashoffset: 0; /*前面1/126显示实线，后面125显示空白*/
    }

    50% {
        stroke-dasharray: 95, 126; /*实线部分95，虚线部分126*/
        stroke-dashoffset: -31px /*顺时针偏移31/126，即前31/126显示空白，后面3/4显示线条*/
    }

    to {
        stroke-dasharray: 6, 120; /*实线部分6，虚线部分120*/
        stroke-dashoffset: -120px; /*最后顺时针偏移120/126，即前120/126显示空白，后面6点显示线条部分*/
    }
}
```

  

从圆环的最右边作为起点，并且顺时针移动 120 像素，所以实线长度仅剩下 6 像素了，如图所示，  

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwJ5JjCaLaGVDg5uyRO6tRSQdoAFO8PUh6H2ib0I1Itqg88BicMPJsJm5g/640?wx_fmt=png)

  
给圆环加上动画效果，如:

  

```
.loading-svg {
    width: 50px; /*设置svg显示区域大小*/
    height: 50px;
    animation: loading-rotate 1.5s infinite ease-in-out; /*给svg也加上一个旋转动画*/
}
@keyframes loading-rotate {
    to {
        transform: rotate(1turn); // 旋转1圈
    }
}
```

  

![](https://mmbiz.qpic.cn/mmbiz_gif/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwYtdRGWLhXyGIyicy7qbuFRH0X0l7vZQPQQUh7WT4bTH7YLulcsFOYrw/640?wx_fmt=gif)

  
为了让 Loading 动画更加生动细腻，我们还可以给 svg 标签也加上一个旋转动画，如:

```
<link rel="stylesheet" href="icon/iconfont.css">
<style>
.icon-loading {
    display: inline-block; /*需要设置为行内块元素动画才会生效*/
    font-size: 56px; 
    color: grey;
}
.icon-loading::before {
    content: "\e65b"; /*显示字体图内容，值为\unicode*/
}
</style>
<i class="icon-loading iconfont"></i>
<!--或者-->
<i class="iconfont"></i><!--值为&#xunicode-->
```

  

![](https://mmbiz.qpic.cn/mmbiz_gif/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwILD0GQ2dUp9reUy6dPAueXhWcTqJLRcuYuZibONJMr9XJ5oIlTeTEmA/640?wx_fmt=gif)

**三、通过 iconfont 字体图标**
----------------------

我们可以直接通过 iconfont 字体图标代替圆环的绘制，直接以字体的形式显示出圆环，然后给其加上旋转动画即可，如：  
我们可以在 iconfont 网站上下载喜欢的 Loading 图案。字体图标下载后，将解压后的内容拷贝到项目中，并引入其中的 iconfont.css 到页面中，给要显示字体图标的元素加上 iconfont 类样式，字体图标会有一个对应的 unicode 编码，通过::before 设置 content 为该 unicode 编码即可显示对应的字体图标了，或者直接在 unicode 码前加上 \&#x，并作为元素内容。  

  

```
.icon-loading {
    animation: rotating 2s infinite linear;
}
@keyframes rotating {
    0% {
        transform: rotate(0deg) /*动画起始位置为旋转0度*/
    }

    to {
        transform: rotate(1turn) /*动画结束位置为旋转1圈*/
    }
}
```

  

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwg89T1R8sibAOunENK3jZF4zpYSDTmcVpoN7AuIibia2wcEQ5W4FZhwGxA/640?wx_fmt=png)

  
接下来让字体图标旋转起来即可，如:

  

```
.icon-loading {
    animation: rotating 2s infinite linear;
}
@keyframes rotating {
    0% {
        transform: rotate(0deg) /*动画起始位置为旋转0度*/
    }
    to {
        transform: rotate(1turn) /*动画结束位置为旋转1圈*/
    }
}
```

  

![](https://mmbiz.qpic.cn/mmbiz_gif/qkxhvoHGVKBZ4ZlaJdURCU7EmqhvoZJwvMkugMmQJPbicz8d70DLqGqv1cnQclO21rOflPCgqmAk1t1roiaB3Bfw/640?wx_fmt=gif)

> 作者：JS_Even_JS  
> 链接：https://segmentfault.com/a/1190000038692080

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 120[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 120+ 篇原创文章