> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mXE6AHHH2nmctCQnS8x22A)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日一题群

面试官也在看的前端面试资料

px
--

绝对长度单位，根据维基百科解释：它是图像显示的基本单元，既不是一个确定的物理量，也不是一个点或者小方块，而是一个抽象概念。很多时候，px 也常被称为 CSS 像素，在 PC 中，通常认为 1px 的真实长度是固定的

**那 px 真的是一个设备无关，跟长度单位米和分米一样是固定大小的吗？**

> 一个像素表示了计算机屏幕所能显示的最小区域，像素分为两种类型：
> 
> *   CSS 像素：为 Web 开发者提供，在 CSS 中使用的一个抽象单位
>     
> *   物理像素：只与设备的硬件密度有关，任何设备的物理像素都是固定的
>     
> 
> 转换关系：CSS 像素 = 物理像素／分辨率
> 
> 假设 PC 端：750 * 1134 的视觉稿：1 CSS 像素 = 物理像素／分辨率 = 750 ／ 980 =0.76
> 
> 假设移动端（iphone6 为例），分辨率为 375 * 667：1 CSS 像素 = 物理像素 ／分辨率 = 750 ／ 375 = 2
> 
> 所以 PC 端，一个 CSS 像素可以用 0.76 个物理像素来表示，而 iphone6 中 一个 CSS 像素表示了 2 个物理像素。此外不同的移动设备分辨率不同，也就是 1 个 CSS 像素可以表示的物理像素是不同的

注意，当浏览器页面缩放时，px 并不能跟随变大。当前网页的布局就会被打破。

rpx
---

*   rpx 是微信小程序独有的、解决屏幕自适应的尺寸单位
    
*   可以根据屏幕宽度进行自适应，不论大小屏幕，规定屏幕宽为 750rpx
    
*   通过 rpx 设置元素和字体的大小，小程序在不同尺寸的屏幕下，可以实现自动适配
    

**rpx 和 px 之间的区别：**

*   在普通网页开发中，最常用的像素单位是 px
    
*   在小程序开发中，推荐使用 rpx 这种响应式的像素单位进行开发
    

设计师在出设计稿的时候，出的都是二倍图，也就是说如果在这个设计稿上有一个宽高为 200px 的盒子，那么它最终画到页面上实际上是一个宽高为 100px 的盒子，那么再换算成 rpx 需要乘以 2 ，就又变成了 200rpx ，跟设计稿上的数字是一样的，所以我们可以保持数字不变，直接将单位 px 替换成 rpx

em
--

相对长度单位，em 是相对于当前元素的父元素的 `font-size` 进行计算, 如果当前元素未设置则相对于浏览器的默认字体尺寸。

```
<div class="a">A    <div class="b">B        <div class="c">C</div>    </div></div><style> .a{ font-size:16px;} .b{ font-size:2em;} /* 相当于32px */ .c{ font-size:1em;} /* 相当于32px */</style>
```

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnYpe1yY7ZibwMuFPhN8SEicXXDLs6dk4ibM88JvX8Cu3KNA6Y3wibSv9ricJrmj0YDI29jY6ia6QicbhCKA/640?wx_fmt=png)

rem
---

相对长度单位，CSS3 新增的一个相对单位，rem 是相对于根元素（html）的 `font-size` 进行计算，rem 不仅可设置字体大小，也可以设置元素宽高属性。

```
<div class="a">A    <div class="b">B        <div class="c">C</div>    </div></div>  <style>    html{ font-size:16px;}    .a{ font-size:3rem;} /* 相当于48px */    .b{ font-size:2rem;} /* 相当于32px */    .c{ font-size:1rem;} /* 相当于16px */</style>
```

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnYpe1yY7ZibwMuFPhN8SEicX58gM1ibIXmZbHiaAD007QGDlkUVJhwskmKTwut6J5OL7dTltesSHVljg/640?wx_fmt=png)

**px 与 rem 的区别：**

*   px 对于只需要适配少量设备，且分辨率对页面影响不大的，使用 px 即可， px 设置更为精准 。
    
*   随着 rem 在众多的浏览器都得到支持，有需要考虑到对多设备，多分辨率的自适应，无疑这时候 rem 是最合适的（如：移动端的开发）。
    

vw/vh
-----

CSS3 特性 vh 和 vw：

*   vh 相对于视窗的高度，视窗高度是 100vh
    
*   vw 相对于视窗的宽度，视窗宽度是 100vw
    

这里是视窗指的是浏览器内部的可视区域大小，即 window.innerWidth/window.innerHeight 大小，不包含任务栏标题栏以及底部工具栏的浏览器区域大小。

百分比
---

通常认为子元素的百分比完全相对于直接父元素：

```
<div class="a">    <div class="b"></div></div><style>    .a{ width:200px; height:100px; background-color: aqua; }     .b{ width:50%; height:50%; background-color: blueviolet; }</style>
```

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnYpe1yY7ZibwMuFPhN8SEicXOPSROHzqa0R7KchltLmRP9S0zCiaGvUsMPAMQPUeAzqiaPKibiaT9CZXKA/640?wx_fmt=png)

需要注意的是，如果设置了 top、margin、padding 等：

*   子元素的 top 和 bottom 如果设置百分比，则相对于直接非 static 定位 (默认定位) 的父元素的高度
    
*   子元素的 left 和 right 如果设置百分比，则相对于直接非 static 定位 (默认定位的) 父元素的宽度
    
*   子元素的 padding/margin 如果设置百分比，不论是垂直方向或者是水平方向，都相对于直接父亲元素的 padding/margin ，而与父元素的 height 无关。
    

px、rpx、em、rem 、vw/vh、百分比的区别？
----------------------------

*   px：绝对长度单位，来描述一个元素的宽高以及定位信息
    
*   rpx：微信小程序独有的、解决屏幕自适应的尺寸单位
    
*   em：相对单位，基准点为父节点字体的大小，如果自身定义了 font-size 按自身来计算（浏览器默认 16px）em 作为字体单位，相对于父元素字体大小；em 作为行高单位时，相对于自身字体大小，整个页面内 1em 不是一个固定的值。
    
*   rem：相对单位，可理解为”root em”，相对根节点 html 的字体大小来计算，CSS3 新加属性，rem 作用于非根元素时，相对于根元素字体大小；rem 作用于根元素字体大小时，相对于其出初始字体大小。rem 布局的本质是等比缩放，一般是基于宽度，试想一下如果 UE 图能够等比缩放，那该多么美好啊
    
*   vw/vh：viewpoint width / viewpoint height，vw 相对于视窗的宽度，vh 相对于视窗的高度，1vw 等于视窗宽度的 1%
    
*   百分比：1% 对不同属性有不同的含义。font-size: 200% 和 font-size: 2em 一样，表示字体大小是默认（继承自父亲）字体大小的 2 倍。line-height: 200% 表示行高是自己字体大小的 2 倍。width: 100% 表示自己 content 的宽度等于父亲 content 宽度的 1 倍。
    

https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/511

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

号内回复：

「**网络**」，自动获取三分钟学前端网络篇小书（90 + 页）

「**JS**」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「**算法**」，自动获取 github 2.9k+ 的前端算法小书

「**面试**」，自动获取 github 23.2k+ 的前端面试小书

「**简历**」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的