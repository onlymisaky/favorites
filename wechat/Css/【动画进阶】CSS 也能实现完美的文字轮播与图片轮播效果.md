> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/pMz867TWL7P3lIAPTvZAvw)

今天，分享一个实际业务中能够用得上的动画技巧。

**巧用逐帧动画，配合补间动画实现一个无限循环的轮播效果**，像是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDRbnvA7TgJEd3xnrlOGZpdoV0rl5B5dzH8haNcDMtF54pvRoIZQjdmw/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

看到上述示意图，有同学不禁会发问，这不是个非常简单的位移动画么？

我们来简单分析分析，从表面上看，确实好像只有元素的 `transform: translate()` 在位移，**但是注意**，这里有两个难点：

1.  这是个无限轮播的效果，我们的动画需要支持任意多个元素的无限轮播切换
    
2.  因为是轮播，所以，运行到最后一个的时候，需要动画切到第一个元素
    

到这里，你可以暂停思考一下，如果有 20 个元素，需要进行类似的无限轮播播报，使用 CSS 实现，你会怎么去做呢？

逐帧动画控制整体切换
----------

首先，我需要利用到逐帧动画效果，也被称为**步骤缓动函数**，利用的是 `animation-timing-function` 中，的 steps，语法如下：

```
{    /* Keyword values */    animation-timing-function: step-start;    animation-timing-function: step-end;    /* Function values */    animation-timing-function: steps(6, start)    animation-timing-function: steps(4, end);}
```

如果你对 `steps` 的语法还不是特别了解，强烈建议你先看看我的这篇文章 -- [深入浅出 CSS 动画](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247489771&idx=1&sn=438d07689194d0f9d553c261e7e04abb&chksm=ce257b1df952f20bc3d90cd9ee43b949dca0853635bf90df89581c88a907b1fe3d155c867e2e&scene=21#wechat_redirect) [1]，它对理解本文起着至关重要的作用。

好的，还是文章以开头的例子，假设我们存在这样 HTML 结构：

```
<div class="g-container">  <ul>    <li>Lorem ipsum 1111111</li>    <li>Lorem ipsum 2222222</li>    <li>Lorem ipsum 3333333</li>    <li>Lorem ipsum 4444444</li>    <li>Lorem ipsum 5555555</li>    <li>Lorem ipsum 6666666</li>  </ul></div>
```

首先，我们实现这样一个简单的布局：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDeBIZ3nW4uibRDsowcHmsvFh9g8yOaBIssUPYCEFicGajqlRwpru75a4A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在这里，要实现轮播效果，并且是任意个数，我们可以借助 `animation-timing-function: steps()`：

```
:root {  // 轮播的个数  --s: 6;  // 单个 li 容器的高度  --h: 36;  // 单次动画的时长  --speed: 1.5s;}.g-container {  width: 300px;  height: calc(var(--h) * 1px);}ul {  display: flex;  flex-direction: column;  animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;}ul li {  width: 100%;}@keyframes move {  0% {    transform: translate(0, 0);  }  100% {    transform: translate(0, calc(var(--s) * var(--h) * -1px));  }}
```

别看到上述有几个 CSS 变量就慌了，其实很好理解：

1.  `calc(var(--speed) * var(--s))`：单次动画的耗时 * 轮播的个数，也就是总动画时长
    
2.  `steps(var(--s))` 就是逐帧动画的帧数，这里也就是 `steps(6)`，很好理解
    
3.  `calc(var(--s) * var(--h) * -1px))` 单个 li 容器的高度 * 轮播的个数，其实就是 ul 的总体高度，用于设置逐帧动画的终点值
    

上述的效果，实际如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDpibLtGr1BVSy4UwbOaDs5D8lqU4AnC39EgCyuub7oFvhedJPFeG9Vzg/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

如果给容器添加上 `overflow: hidden`，就是这样的效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLD47M0kZ2gN7ftjX0BlbqHvyzcTq223Wd8OIicB0xAn4lrI0QPkmXic5Cw/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

这样，我们就得到了整体的结构，至少，整个效果是循环的。

但是由于只是逐帧动画，所以只能看到切换，但是每一帧之间，没有过渡动画效果。所以，接下来，我们还得引入补间动画。

利用补间动画实现两组数据间的切换
----------------

我们需要利用补间动画，实现动态的切换效果。

这一步，其实也非常简单，我们要做的，就是将一组数据，利用 `transform`，从状态 A 位移到 状态 B。

单独拿出一个来演示的话，大致的代码如下：

```
<div class="g-container">  <ul style="--s: 6">    <li>Lorem ipsum 1111111</li>    <li>Lorem ipsum 2222222</li>    <li>Lorem ipsum 3333333</li>    <li>Lorem ipsum 4444444</li>    <li>Lorem ipsum 5555555</li>    <li>Lorem ipsum 6666666</li>  </ul></div>
```

```
:root {  --h: 36;  --speed: 1.2s;}ul li {  height: 36px;  animation: liMove calc(var(--speed)) infinite;}@keyframes liMove {  0% {    transform: translate(0, 0);  }  80%,  100%  {    transform: translate(0, -36px);  }}
```

非常简单的一个动画：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDjKaoohmpxdXGIXInIWC3f9kpqIbibSnUFxjbLNyqEcaGzrWEHKh2GTg/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)bgg1

基于上述效果，我们如果把一开始提到的 **逐帧动画** 和这里这个 **补间动画** 结合一下，ul 的整体移动，和 li 的 单个移动叠在在一起：

```
:root {  // 轮播的个数  --s: 6;  // 单个 li 容器的高度  --h: 36;  // 单次动画的时长  --speed: 1.5s;}.g-container {  width: 300px;  height: calc(var(--h) * 1px);}ul {  display: flex;  flex-direction: column;  animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;}ul li {  width: 100%;  animation: liMove calc(var(--speed)) infinite;}@keyframes move {  0% {    transform: translate(0, 0);  }  100% {    transform: translate(0, calc(var(--s) * var(--h) * -1px));  }}@keyframes liMove {  0% {    transform: translate(0, 0);  }  80%,  100%  {    transform: translate(0, calc(var(--h) * -1px));  }}
```

就能得到这样一个效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLD2TBl87lBrCHvpbuhaFB78cibYoMicy8VAHhFic7qerdAaiaUJkNkSz12qw/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

Wow，神奇的化学反应产生了！基于 **逐帧动画** 和 **补间动画** 的结合，我们几乎实现了一个轮播效果。

当然，有一点瑕疵，可以看到，最后一组数据，是从第六组数据 transform 移动向了一组空数据：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDjymmFA3RjlXzZiciaXRjJB5WgYricUicjmee27DqAB7f2ac2dmliakhq87A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 末尾填充头部第一组数据

实际开发过轮播的同学肯定知道，这里，其实也很好处理，我们只需要在末尾，补一组头部的第一个数据即可：

改造下我们的 HTML：

```
<div class="g-container">  <ul>    <li>Lorem ipsum 1111111</li>    <li>Lorem ipsum 2222222</li>    <li>Lorem ipsum 3333333</li>    <li>Lorem ipsum 4444444</li>    <li>Lorem ipsum 5555555</li>    <li>Lorem ipsum 6666666</li>    <!--末尾补一个首条数据-->    <li>Lorem ipsum 1111111</li>  </ul></div>
```

这样，我们再看看效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDse7jKrYhhI6CP6NwtuPPg2QInhPTG1rAIfm3duGeiavxhnG2yt9PPRA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

Beautiful！如果你还有所疑惑，我们给容器加上 `overflow: hidden`，实际效果如下，通过额外添加的最后一组数据，我们的整个动画刚好完美的衔接上，一个完美的轮播效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDRbnvA7TgJEd3xnrlOGZpdoV0rl5B5dzH8haNcDMtF54pvRoIZQjdmw/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

完整的代码，你可以戳这里：CodePen Demo -- Vertical Infinity Loop[2]

### 横向无限轮播

当然，实现了竖直方向的轮播，横向的效果也是一样的。

并且，我们可以通过在 HTML 结构中，通过 style 内填写 CSS 变量值，传入实际的 li 个数，以达到根据不同 li 个数适配不同动画：

```
<div class="g-container">  <ul style="--s: 6">    <li>Lorem ipsum 1111111</li>    <li>Lorem ipsum 2222222</li>    <li>Lorem ipsum 3333333</li>    <li>Lorem ipsum 4444444</li>    <li>Lorem ipsum 5555555</li>    <li>Lorem ipsum 6666666</li>    <!--末尾补一个首尾数据-->    <li>Lorem ipsum 1111111</li>  </ul></div>
```

整个动画的 CSS 代码基本是一致的，我们只需要改变两个动画的 `transform` 值，从竖直位移，改成水平位移即可：

```
:root {  --w: 300;  --speed: 1.5s;}.g-container {  width: calc(--w * 1px);  overflow: hidden;}ul {  display: flex;  flex-wrap: nowrap;   animation: move calc(var(--speed) * var(--s)) steps(var(--s)) infinite;}ul li {  flex-shrink: 0;  width: 100%;  height: 100%;  animation: liMove calc(var(--speed)) infinite;}@keyframes move {  0% {    transform: translate(0, 0);  }  100% {    transform: translate(calc(var(--s) * var(--w) * -1px), 0);  }}@keyframes liMove {  0% {    transform: translate(0, 0);  }  80%,  100%  {    transform: translate(calc(var(--w) * -1px), 0);  }}
```

这样，我们就轻松的转化为了横向的效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDGZAicwKGIBZ88BGVb7wzEMwLULSd3AoAqjPcFVdc3W7HKbu7RNWibSDA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

完整的代码，你可以戳这里：CodePen Demo -- Horizontal Infinity Loop[3]

轮播图？不在话下
--------

OK，上面的只是文字版的轮播，那如果是图片呢？

没问题，方法都是一样的。基于上述的代码，我们可以轻松地将它修改一下后得到图片版的轮播效果。

代码都是一样的，就不再列出来，直接看看效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNIIRun4a3U1LEfbicUU5xrLDs8Ztav9rnt2VcR4Uic23m4azqnwYSVCZxwkqfg7yfd16cFI5eITAC2g/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

完整的代码，你可以戳这里：CodePen Demo -- Horizontal Image Infinity Loop[4]  

掌握了这个技巧之后，你可以将它运用在非常多只需要简化版的轮播效果之上。

再简单总结一下，非常有意思的技巧：

1.  利用 **逐帧动画**，实现整体的轮播的循环效果
    
2.  利用 **补间动画**，实现具体的 * _状态 A_ 向 **状态 B** 的动画效果
    
3.  **逐帧动画** 配合 **补间动画** 构成整体轮播的效果
    
4.  通过向 HTML 结构末尾补充一组头部数据，实现整体动画的衔接
    
5.  通过 HTML 元素的 style 标签，利用 CSS 变量，填入实际的参与循环的 DOM 个数，可以实现 JavaScript 与 CSS 的打通
    

最后
--

OK，本文到此结束，希望本文对你有所帮助 :)

更多精彩 CSS 技术文章汇总在我的 Github -- iCSS[5] ，持续更新，欢迎点个 star 订阅收藏。

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

### 参考资料

[1]

深入浅出 CSS 动画: _https://github.com/chokcoco/iCSS/issues/141_

[2]

CodePen Demo -- Vertical Infinity Loop: _https://codepen.io/Chokcoco/pen/RwQVByx_

[3]

CodePen Demo -- Horizontal Infinity Loop: _https://codepen.io/Chokcoco/pen/JjpNBXY_

[4]

CodePen Demo -- Horizontal Image Infinity Loop: _https://codepen.io/Chokcoco/pen/GRQvqgq_

[5]

Github -- iCSS: _https://github.com/chokcoco/iCSS_

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

`点赞`和`在看`是最大的支持 ⬇️❤️⬇️