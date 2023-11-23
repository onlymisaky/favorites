> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tQu_9cfOJHj1rcjpVPuCnA)

前不久，在网上看到这么一张非常有趣的图：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaX1SlNg0c10gqNShnya8Xa0dn3dvXwEx31ER7OJpgEN3P1IMsLTtPiaMQ/640?wx_fmt=gif)

想必很多同学都看到这张图，是一个开发小哥被一个日间 / 黑夜模式切换按钮效果逼疯的视频。

其最终效果大致如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXKcmgaw8F8GWC6Yw5Yt7rSTMwFZP6Gtz4E5T9cmnKA9Ecs7q1CDP5kg/640?wx_fmt=gif)

原完整代码在这里：Night && Day Toggle ☀️/🌙 \[Completed It!\][1]（_https://codepen.io/jh3y/pen/LYgjpYZ_）

原效果用了大量 HTML 标签，大量 SVG 元素以及 350 行的 CSS 完成的上述效果。

而本文，我们将尝试优化一下代码，尝试仅仅使用一个标签，完成上述效果。

当然，首先，我们需要一个标签：

```
<div></div>
```

接下来，在单个标签内，我们一步一步来实现这个效果。

拟态阴影
----

先把整个按钮的形状确定下来，我们需要这样一个整体的拟物形状：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXTKFdKamBUT6vdBdaRMZPZZVorgIftqYiax93DZs3yJrLMOw8ZibzambQ/640?wx_fmt=png)

可以看到，这个造型非常的立体。这里的核心是 -- **利用阴影，构建拟态效果**。

怎么操作呢？其原理就在于，使用两组阴影，使用两个相反的方向，使用两组对比明显的颜色值，来实现凹凸效果。

我们需要使用盒子的内阴影实现。

看个例子：

```
<div>浮雕阴影</div><div>浮雕阴影</div>
```

```
div {    width: 120px;    height: 120px;    background: #e9ecef;    color: #333;    box-shadow:        7px 7px 12px rgba(0, 0, 0, .4),        -7px -7px 12px rgba(255, 255, 255, .9);}div:nth-child(2) {    box-shadow:        inset -7px -7px 12px rgba(255, 255, 255, .9),        inset 7px 7px 12px rgba(0, 0, 0, .4);}
```

这样，就可以得到拟态风格的按钮，如下图所示，左凸右凹：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXvfuytCkukA1kPEu03rC4I3wNzyjJcsQbkT289su2RuyKh3t4icnWO8w/640?wx_fmt=png)

借鉴这个方式，我们很快就能得到整个按钮的外形代码：

```
body {    width: 100%;    height: 100%;    background: #d9deea;}div {    width: 220px;    height: 90px;    border-radius: 90px;    box-shadow:         0 -3px 4px #999,        inset 0 3px 5px #333,        0 4px 4px #ffe,        inset 0 -3px 5px #ddd;}
```

这样，整个外框就实现了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXTKFdKamBUT6vdBdaRMZPZZVorgIftqYiax93DZs3yJrLMOw8ZibzambQ/640?wx_fmt=png)

日间模式的实现
-------

好，接下来，我们来实现日间模式，其整个效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXHwZjssKt6ib614eKZaF1R3xYarUj7WbTA7zicS7Fc2qc8jeqbmSAVNgw/640?wx_fmt=png)

仔细观察上述图形，除了外框外，主要还有几大部分：

1.  一个圆形太阳
    
2.  太阳的光晕
    
3.  云朵效果
    

发现了吗？它们都是**圆形**！而在 CSS 中，能够利用单个属性构建多个圆形的方式有非常多种：

1.  `box-shadow`
    
2.  `filter: drop-shadow()`
    
3.  background 渐变
    

并且，上面我们只使用了 div 本身，**还有两个伪元素没有使用**。我们需要充分把这两个伪元素利用起来。这里，我们这样分工一下：

1.  伪元素 `::before`: 用于实现太阳本身
    
2.  伪元素 `::after`：用于实现太阳的光晕及云朵效果
    

我们一步一步来。

### 利用伪元素 `::before`: 实现太阳本身

这个还是非常好理解的，直接上代码：

```
div::before {    content: "";    position: absolute;    width: 75px;    height: 75px;    border-radius: 50%;    background: #e9cb50;    inset: 7.5px;    box-shadow:         0 0 5px #333,        inset 2px 2px 3px #f8f4e4,        inset -2px -2px 3px #665613;}
```

核心就是利用伪元素，再生成一个圆，再添加相应的阴影即可，效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXpb5wTj6icWOXsZNdpOMRUNWRbooSQw0dTuxHOBDuBpa5Odh7rtqv06Q/640?wx_fmt=png)

### 利用伪元素 `::after`: 实现太阳的光晕及云朵效果

注意！这里是本文最为关键的地方。如何利用剩下一个伪元素实现太阳的光晕及云朵效果？

这里就需要利用到 `box-shadow` 可以复制自身的技巧。在非常多篇的文章中也有反复提到过。

譬如，当我们想实现一朵云朵，像是这样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXJYuPl7DeF10GBwZnYN7r0zpG8ibNSEVColdic8Oy14fjNrHdH6n3Pv4Q/640?wx_fmt=png)

使用 box-shadow 即可轻松实现：

```
<div></div>
```

```
div{  width:100px;  height:100px;  margin:50px auto;  background:#999;  border-radius:50%;  box-shadow:    120px 0px 0 -10px #999,    95px 20px 0 0px #999,    30px 30px 0 -10px #999,    90px -20px 0 0px #999,    40px -40px 0 0px #999;}
```

通过动图，感受一下是什么意思：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXjA6jTntnUPAEW77kA1Pa4BXk5ddsBzyR2esQwR9l2z5e4dG96wwO2A/640?wx_fmt=gif)

嘿，这个云朵不是和我们效果中的云朵非常类似吗？只需要调整一些位置，利用 `overflow: hidden` 裁剪掉多余部分即可。

光圈其实也是同理，这里，利用 `::after` 伪元素，生成一个圆，利用多重 `box-shadow`，生成光晕和云朵！

代码如下：

```
&::after {    content: "";    position: absolute;    width: 70px;    height: 70px;    inset: 10px;    border-radius: 50%;    box-shadow:         10px 60px 0 10px #fff,        65px 60px 0 5px #fff,        95px 70px 0 10px #fff,        135px 45px 0 5px #fff,        170px 35px 0 10px #fff,        195px -5px 0 10px #fff,        -10px 0 0 50px rgba(255, 255, 255, .2),        15px 0 0 50px rgba(255, 255, 255, .15),        40px 0 0 50px rgba(255, 255, 255, .21),        10px 40px 0 10px #abc1d9,        70px 35px 0 10px #abc1d9,        95px 40px 0 10px #abc1d9,        135px 20px 0 10px #abc1d9,        155px 15px 0 10px #abc1d9,        190px -20px 0 10px #abc1d9;}
```

其核心，或者说费时间的地方在于调整每个 `box-shadow` 的位置和颜色，这样，我们就得到了完整的日间效果图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXTCrk0WzuKqag0Lgg2ayiaTCv2lqDOT52236vpiah4uuaRD90YjPia3icXg/640?wx_fmt=png)

夜间模式的实现
-------

实现完日间效果，接下来，我们就需要实现夜间效果。其效果图如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXx7tgOcKsAdJBptkF9nXvrNbozVDwliax9ygteINTdaicRLAAgnOyOZ6g/640?wx_fmt=png)

为了实现最终的点击切换，我们可以把夜间效果下，按钮的样式，写在一个新的 class 内，这样，后面只需要在点击的过程中，去切换这个 class 即可。

```
<div class="active"></div>
```

```
div.active{    ...}
```

如上所示，我们接下来的工作就是寻找日间、夜间的差异点，将代码填入上述的 `div.active` 即可。

首先，太阳变成了月亮，位置进行了移动，颜色进行了变化，并且月亮上多出了一些陨石坑，当然，其本质还是圆形。

这些修改都非常简单，还是在原来的 `::before` 基础上修改即可：

```
div.active{    &::before {        translate: 130px;        background:             radial-gradient(circle at 50% 20px, #939aa5, #939aa5 6.5px, transparent 7px, transparent),            radial-gradient(circle at 35% 45px, #939aa5, #939aa5 11.5px, transparent 12px, transparent),            radial-gradient(circle at 72% 50px, #939aa5, #939aa5 8.5px, transparent 9px, transparent),            radial-gradient(#cbcdda, #cbcdda);    }}
```

这里是非常好修改的，利用 `radila-gradient()`，也就是多重渐变，我们可以轻松的在一个元素内完成背景加上陨石坑的代码：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXMcT5UqTGMINFVqZvECbIiaibicFXnrnMicln3CPMQbQSoBynibOG1CcvAkA/640?wx_fmt=png)

继续，夜间模式下，月亮也有光圈，代码是可以复用的，并且夜间模式没有了云朵，取而代之是星星。

星星看起来有点复杂，我们待会处理，这里仅仅需要把云朵部分的阴影颜色，设置为 `transparent` 即可。

```
div.active {  &::after {        transform: translate(130px);        box-shadow:             10px 60px 0 10px transparent,            65px 60px 0 5px transparent,            95px 70px 0 10px transparent,            135px 45px 0 5px transparent,            170px 35px 0 10px transparent,            195px -5px 0 10px transparent,            10px 0 0 50px rgba(255, 255, 255, .2),            -15px 0 0 50px rgba(255, 255, 255, .15),            -40px 0 0 50px rgba(255, 255, 255, .21),            10px 40px 0 10px transparent,            70px 35px 0 10px transparent,            95px 40px 0 10px transparent,            135px 20px 0 10px transparent,            155px 15px 0 10px transparent,            190px -20px 0 10px transparent;    }}
```

效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXf9ibvpH7pZ1PSpGAJITR8pPcem7nVhqJq8h7BpgNAM16ia2Kia7vnSibng/640?wx_fmt=png)

为什么这里不是去掉云朵的代码，而是把云朵部分的阴影颜色，设置为 `transparent` 呢？这样做的原因是能够在切换过程中，得到更好的动画效果。

好！到这里，只剩下夜间模式下的星星和背景了，背景是非常好解决的，主要是星星，看原效果的动图，每一颗星星是带有棱角的，而这种不规则图案，确实是 CSS 最棘手的问题。

到这里，无奈退而求其次，考虑使用小圆点模拟星星效果。（没想到效果其实也很不错！）

那这个问题又变成了和月亮与陨石坑类似的问题了，都是圆形，那就非常好解决。

最终，考虑在 `div` 本身的背景之上，设置一个大背景 `background-size: 200% 100%`，这样，一半是日间的背景，一半是夜间的背景，在切换的过程中，只需要改变 `background-position` 即可。

这样一来，代码如下：

```
div {    background:             radial-gradient(circle at 18% 20px, #fff, #fff 6px, transparent 7px, transparent),            radial-gradient(circle at 35% 45px, #fff, #fff 1px, transparent 2px, transparent),            radial-gradient(circle at 10% 70px, #fff, #fff 2.5px, transparent 3.5px, transparent),            radial-gradient(circle at 25% 15px, #fff, #fff 3px, transparent 4px, transparent),            radial-gradient(circle at 15% 50px, #fff, #fff 1.5px, transparent 2.5px, transparent),            radial-gradient(circle at 30% 75px, #fff, #fff 5px, transparent 6px, transparent),            radial-gradient(circle at 5% 30px, #fff, #fff 0.5px, transparent 1.5px, transparent),            radial-gradient(circle at 25% 60px, #fff, #fff 0.5px, transparent 1.5px, transparent),            radial-gradient(circle at 7% 35px, #fff, #fff 0.5px, transparent 1.5px, transparent),            linear-gradient(90deg, #2b303e, #2b303e 50%, #5a81b4 50%, #5a81b4);    background-repeat: no-repeat;    background-size: 200% 100%;    background-position: 100% 0;}div.active {    background-position: 0 0;}
```

这样，夜间效果也就完美实现了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaX9622o4OE6P0zYPFpyYpbhPe51hJDe1xx8Id3SaQcFVIQkk9iaMF9PxQ/640?wx_fmt=png)

添加过渡效果以及切换效果
------------

最后，只需要加上一些过渡效果以及点击切换时，元素样式类名变化的 JavaScript 代码即可。

完整的整个效果，代码如下：

```
<div id="g-btn"></div>
```

```
body {    background: #d9deea;}div {    position: relative;    width: 220px;    height: 90px;    background:             radial-gradient(circle at 18% 20px, #fff, #fff 6px, transparent 7px, transparent),            radial-gradient(circle at 35% 45px, #fff, #fff 1px, transparent 2px, transparent),            radial-gradient(circle at 10% 70px, #fff, #fff 2.5px, transparent 3.5px, transparent),            radial-gradient(circle at 25% 15px, #fff, #fff 3px, transparent 4px, transparent),            radial-gradient(circle at 15% 50px, #fff, #fff 1.5px, transparent 2.5px, transparent),            radial-gradient(circle at 30% 75px, #fff, #fff 5px, transparent 6px, transparent),            radial-gradient(circle at 5% 30px, #fff, #fff 0.5px, transparent 1.5px, transparent),            radial-gradient(circle at 25% 60px, #fff, #fff 0.5px, transparent 1.5px, transparent),            radial-gradient(circle at 7% 35px, #fff, #fff 0.5px, transparent 1.5px, transparent),            linear-gradient(90deg, #2b303e, #2b303e 50%, #5a81b4 50%, #5a81b4);    background-repeat: no-repeat;    background-size: 200% 100%;    background-position: 100% 0;    border-radius: 90px;    box-shadow:         0 -3px 4px #999,        inset 0 3px 5px #333,        0 4px 4px #ffe,        inset 0 -3px 5px #ddd;    cursor: pointer;    overflow: hidden;    transition: .5s all;    &::before,    &::after {        content: "";        position: absolute;        transition: .5s all;    }    &::before {        width: 75px;        height: 75px;        border-radius: 50%;        background: #e9cb50;        inset: 7.5px;        box-shadow:             0 0 5px #333,            inset 2px 2px 3px #f8f4e4,            inset -2px -2px 3px #665613;        z-index: 1;    }    &::after {        width: 70px;        height: 70px;        inset: 10px;        border-radius: 50%;        box-shadow:             10px 60px 0 10px #fff,            65px 60px 0 5px #fff,            95px 70px 0 10px #fff,            135px 45px 0 5px #fff,            170px 35px 0 10px #fff,            195px -5px 0 10px #fff,            -10px 0 0 50px rgba(255, 255, 255, .2),            15px 0 0 50px rgba(255, 255, 255, .15),            40px 0 0 50px rgba(255, 255, 255, .21),            10px 40px 0 10px #abc1d9,            70px 35px 0 10px #abc1d9,            95px 40px 0 10px #abc1d9,            135px 20px 0 10px #abc1d9,            155px 15px 0 10px #abc1d9,            190px -20px 0 10px #abc1d9;    }}div:hover::before {    filter: contrast(90%) brightness(110%);    scale: 1.05;}div.active {    background-position: 0 0;        &::before {        translate: 130px;        background:             radial-gradient(circle at 50% 20px, #939aa5, #939aa5 6.5px, transparent 7px, transparent),            radial-gradient(circle at 35% 45px, #939aa5, #939aa5 11.5px, transparent 12px, transparent),            radial-gradient(circle at 72% 50px, #939aa5, #939aa5 8.5px, transparent 9px, transparent),            radial-gradient(#cbcdda, #cbcdda);    }    &::after {        transform: translate(130px);        box-shadow:             10px 60px 0 10px transparent,            65px 60px 0 5px transparent,            95px 70px 0 10px transparent,            135px 45px 0 5px transparent,            170px 35px 0 10px transparent,            195px -5px 0 10px transparent,            10px 0 0 50px rgba(255, 255, 255, .2),            -15px 0 0 50px rgba(255, 255, 255, .15),            -40px 0 0 50px rgba(255, 255, 255, .21),            10px 40px 0 10px transparent,            70px 35px 0 10px transparent,            95px 40px 0 10px transparent,            135px 20px 0 10px transparent,            155px 15px 0 10px transparent,            190px -20px 0 10px transparent;    }}
```

```
const btn = document.querySelector('#g-btn');btn.addEventListener('click', (e) => {    btn.setAttribute('class', btn.getAttribute("class") === "active" ? "" : "active");});
```

来看看最终效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJoEZaBeV95ln7JhdtVn6iaXXPSEyTnuEPD5CDHbNFia5gibjicyzfe5KgPJJ9MicgMLguFz5atP1aa9eA/640?wx_fmt=gif)

是不是基本上还原了原效果？这里我们仅仅使用了一个标签，核心配合了 `box-shadow` 以及背景渐变完成了整个按钮效果。

完整的代码，你可以戳这里 CodePen Demo -- Single Div BTN Toggle Effect[2]（_https://codepen.io/Chokcoco/pen/QWJWqBv_）

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNDvxh93JHfZD80m7GhBmGicoYpnLCanxmxvpVm4ACYNms63xnCgKt1Py5rvMCEDkWebYCTpfDVBq7g/640?wx_fmt=gif)

**彦祖，亦菲，点个****「在看」**吧