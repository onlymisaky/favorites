> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eQcmuP9OgQNBRwy1yIc1CA)

> 本文为翻译  
> 本文译者为 360 奇舞团前端开发工程师  
> 原文标题：New Viewport Units  
> 原文作者：Ahmad Shadeed  
> 原文地址：https://ishadeed.com/article/new-viewport-units/

自 2012 年以来，我们一直在使用 CSS viewport 单位。它们对于帮助我们根据视口宽度或高度调整元素大小很有用。

然而，在移动设备上使用 vh 单位是有问题的。原因是视口大小不包括浏览器的地址栏 UI。

为了解决这个问题，我们现在有了新的视口单位。让我们在这篇文章中了解一下它们。

CSS Viewport 单位
---------------

例如，当我们需要根据视口大小调整元素的大小时。视口单位为 vw、vh、vmin 和 vmax。

考虑下图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHDRcNLxtYbPgORo1DEsia0DC6kqkNt1yIGia2UOyXABQkCu3Sx0b8OwnA/640?wx_fmt=png)

值 50vw 的意思是：给元素一个等于视口宽度 50% 的宽度。

问题
--

当使用 100vh 调整元素大小以占据移动端视口的全部高度时，它将大于顶部和底部栏之间的空间。这种情况会发生在滚动时缩小 UI 的浏览器中，例如 Android 上的 Safari 或 Chrome。

下图显示了每个移动浏览器的顶部和底部 UI 是如何不同的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHH9iaG1M6pXeyib55crlmHWusuWMyG25WV2KF72O6zmicrARvIlwuHrbcw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHNiafCrbYoROF9UYqApSicBnbFcmy1FTANMICrT6s1J3Y2VV5z18kVHyg/640?wx_fmt=png)

假设我们有一个充满整个屏幕的加载视图。

```
/* 我知道我们可以使用bottom: 0代替height: 100vh，但这里是故意突出这个问题。 */.loading-wrapper {  position: fixed;  left: 0;  right: 0;  top: 0;  height: 100vh;  display: grid;  place-items: center;}
```

考虑下图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbH4TBSiccSUO9hjbnBehKxohuCErfYJuMsvSL03P61uVNLLsUq98Fb57g/640?wx_fmt=png)

加载图标在 CSS 中居中，但从视觉上看，它看起来稍微位于底部。为什么会发生这种情况？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHH4xddzl7GO6jQic4kNx4Jd5lmnxiaLwjACAxX2fYKsowa4qCJ8tJmibdw/640?wx_fmt=png)

对于浏览器来说，height: 100vh 意味着元素将填充视口高度，但它不会动态的计算值。这意味着底部地址栏和工具栏不会被计算。

因此，我们期望 100vh 等于从视口顶部到地址栏 UI 顶部。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbH4w5jXVoEMqh0QD1YGKcH1FQ6ZiaqEv2DPZqOa7fvGMVozSlbaibJa0LA/640?wx_fmt=png)

当我们向下滚动时，地址栏 UI 将缩小其尺寸。这很好，因为它为用户提供了更多的垂直空间来浏览页面。与此同时，它也在某种程度上破坏了 UI。

在下图中，当地址栏可见时，垂直空间的中心不符合预期。滚动时，看起来不错。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbH0wagEYjxbnrBdtzppAibofcA6kicvwgzNm4b3e1lmUiaJ0d6iaZWPyZj2A/640?wx_fmt=png)

注意我是如何突出显示不可见区域的。当向下滚动时，它变得可见。如何在 CSS 中处理这个问题?

小、大和动态视口单位
----------

为了解决这个问题，CSS 工作组同意采用一组新的单位：svh、lvh 和 dvh。它们分别代表小视口、大视口和动态视口。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHQaMOWIzjYs0425UPJXXZXlupyvpZ5n3kXh4icn6218j5PId9trsiarpw/640?wx_fmt=png)

### 小视口

svh 表示地址栏 UI 尚未缩小尺寸时的视口高度。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHMt0TlNLtHB7F2NQsSkH72SRjK2ic0U27PiaCPs9y22ibwGfrfJ0dIYSvg/640?wx_fmt=png)

### 大视口

lvh 表示地址栏 UI 缩小尺寸后的视口高度。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHqXjUBXKiaxSwHwOWhOAazCAl1MXT2tBGlHoXcMWH29fFYbWOwCz2cKg/640?wx_fmt=png)

### 动态视口

从名字上看，这个单位是动态的。这意味着它将根据地址栏 UI 是否缩小而使用小的、中间的和大的单位。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHGml3J0gU1DtybwcUZzr1KmuFibtw3DhlsLMzxLdhAHicLemIc6yjcaug/640?wx_fmt=png)

在初始滚动期间，动态视口单位将随着浏览器 UI 的收缩而改变。这是一个展示动态视口变化的视频:

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzECIKzoeloscQm82kVmdfUbHRcibtXfQbwtVmFcFaYg4wHCv2YtVm8teB7lH80zcbmiadn8wM8e4CdAw/640?wx_fmt=gif)

用例和示例
-----

### 具有粘性页眉和页脚的弹窗

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHqKGhjm3t3zTqiaqxct83M5e2psKKNuHbdg0JlMiaf20ricAM2bzZCCL2w/640?wx_fmt=png)

在这个例子中，我们有一个带有粘性页眉和页脚的弹窗。如果内容足够长，中间部分应该滚动。

考虑以下 CSS:

```
.modal {  position: fixed;  top: 0;  left: 0;  right: 0;  height: 100vh;}
```

使用 100vh 将使弹窗的底部部分不可见。在示例中，这意味着页脚将不可见，这将破坏用户体验。

以下是 iOS 上传统和新视口单位的表现:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHMhovaqUpWrE1JfMKVcEiaZrFPoAKqIibk133w60ic8Pw1F4BFQ10kjDwg/640?wx_fmt=png)

.. 加上 Android 上的 Chrome 和 Firefox：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHsE9ia4oKyxXo4trMS74jjMYfzNMLcCyLZuorTb2SricygqTNuBMFpT3Q/640?wx_fmt=png)

为了解决这个问题，我们可以使用 svh 或 dvh 单位。

这是一个视频，显示了 dvh 和 vh 之间的差异。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzECIKzoeloscQm82kVmdfUbHKxg7NbdKqGI11xW097M6JYfGCughz2J31t53CrU44XKa7cKlZHPUfg/640?wx_fmt=gif)

### 主页横幅

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHzrXjH2CbJyVU2OpCRCB7ofPk30Npmu3Sp6icqfgrRicSbGEwo63zcE3A/640?wx_fmt=png)

这是一种常见的情况，我们需要使主页横幅的高度等于整个视口高度减去标题高度。在这种情况下，使用传统的 vh 在 iOS Safari、Firefox 和 Android 版 Chrome 等会在滚动时缩小 UI 的浏览器中会失败。

首先，我们需要确保标题高度是固定的。我为此使用了 min-height。

```
:root {  --header-height: 60px;}.site-header {  position: sticky;  top: 0;  min-height: var(--header-height, initial);}
```

之后，我将 min-height 添加到主页横幅并使用 calc()。

```
.hero {  min-height: calc(100svh - var(--header-height));}
```

使用 vh 时，装饰元素（紫色）根本不可见。事实上，如果你仔细观察，你会发现它模糊的显示在 iOS Safari 中的地址栏 UI 下方，而在 Android 浏览器中则被裁剪掉了。

以下是 Safari iOS 上 svh 和 vh 的比较。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHyx8WwR8LpkDuBgjL9axTd3I7zqDobYHwH57FY4qJ4WEPIAE0VYQZXA/640?wx_fmt=png)

.. 加上 Android 上的 Chrome 和 Firefox：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbH9q1EGbIDia9plXF3m9cERpxzagByXr4X5H9iaWH3LdH97tRh7WNubpFQ/640?wx_fmt=png)

请观看以下视频并找出使用 svh 和 vh 之间的区别。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzECIKzoeloscQm82kVmdfUbHaGaRwMX3bU559lPz6mxNnCoZdbUvyzTSmUL2O8GVLc0yTxaZVRk1WA/640?wx_fmt=gif)

在这种情况下，使用 svh 就可以解决问题。

是否可以将 Dvh 设置为默认单位？
------------------

起初，答案是 “是的，为什么不呢？”。然后我想，dvh 值会随着你滚动而改变，所以当它用于诸如 font-size 之类的东西时，可能会产生一种令人困惑的体验。

```
h1 {  font-size: calc(1rem + 5dvh);}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHOXjH1ThOUqSVmBl559LpFROQck2vMcQvAQW8Bw5Mn0uOyaHnzgNbtQ/640?wx_fmt=png)

观看以下视频，注意地址栏 UI 缩小后字体大小如何变化：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzECIKzoeloscQm82kVmdfUbHoricdlPXrbf7eiaG5IT2Sh8CnZticic5JRtBicqILp3oWtXetdf3icibc6gnQ/640?wx_fmt=gif)

Demo

小心使用 Dvh 视口单位
-------------

动态视口单位可能会影响页面的性能，因为浏览器需要花费大量工作来重新计算用户向上或向下滚动的样式。

我没有机会进行密集的性能测试，但使用时我会小心。我希望我能有时间在这里更新这一点。

新视口单位有用的其他地方
------------

这些新的视口单位可能不仅仅适用于移动浏览器。事实上，你现在可以在电视上浏览网页。谁知道电视上会出现哪种浏览器，其 UI 会在滚动时发生变化，从而调整视口的大小？

例如，以下是在 Android TV 上查看的主页横幅示例：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzECIKzoeloscQm82kVmdfUbHluRyXYI1doiaxEDnXVyk8RlA9b6j7zA0Kww68CffPOnCm10wbXegdCw/640?wx_fmt=png)

效果很好，即是动态 UI 也能继续生效。