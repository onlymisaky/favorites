> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kL1c2Khpcr-D1E-2wZe0RA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/Z6bicxIx5naLictAkPmGBSLHsmdGrWj1stFgB0YcIJ5iahSJHfDYkdJ9riaxFv2K4ShCIyQEPc7vyweKiaSGCftoPZA/640?wx_fmt=jpeg)  

CSS 是 Web 开发中不可或缺的一部分，随着 Web 技术的不断革新，CSS 也变得更加强大。CSS 的众多属性你知道了多少？具体开发中该使用什么属性才最适合恰当？如今的一些 CSS 属性可以让我们节约更多的时间。比如在 Web 布局中，现代 CSS 特性就可以更好的帮助我们快速实现如等高布局，水平垂直居中，经典的圣杯布局、宽高比例、页脚保持在底部等效果。淘系前端技术专家大漠将详细介绍一些不同的 CSS 属性来实现这些效果，希望对同学们有所帮助。

来源公众号：阿里技术

[https://mp.weixin.qq.com/s/9f4UaZWzYSJB_ZdwhS3A3A](https://mp.weixin.qq.com/s?__biz=MzIzOTU0NTQ0MA==&mid=2247497929&idx=1&sn=10ed89412711c9d2eb0792a5ca6831d9&scene=21#wechat_redirect)

**一  水平垂直居中**

如何实现水平垂直居中可以说是 CSS 面试题中的经典面试题，在多年前这个面试题给很多同学都带来了困惑，但 Flexbxo 布局模块和 CSS Grid 布局模块的到来，可以说实现水平垂直居中已是非常的容易。

Flexbox 中实现水平垂直居中

在 Flexbox 布局模块中，不管是单行还是多行，要让它们在容器中水平垂直居中都是件易事，而且方法也有多种。最常见的是在 Flex 容器上设置对齐方式，在 Flex 项目上设置 margin:auto。

先来看在 Flex 容器上设置对齐方式。

**Flex 容器和 Flex 项目上设置对齐方式**

你可能已经知道在 Flex 容器上设置 justify-content、align-items 的值为 center 时，可以让元素在 Flex 容器中达到水平垂直居中的效果。来看一个示例：

```
<!-- HTML -->
<div class="flex__container">
    <div class="flex__item"></div>
</div>

/* CSS */
.flex__container {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSkvlnWyPypo530GXQXvxww5xuIqvq3nM34abJLpQlgicft12eg8sUCEA/640?wx_fmt=png)

这种方式特别适应于让 Icon 图标在容器中水平垂直居中，不同的是在 Icon 图标容器上显示设置 display: inline-flex。比如下面这个示例：

```
<!-- HTML -->
<div class="flex__container">
    <svg> </svg>
</div>

/* CSS */
.flex__container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSfIV5oTxU6xkTpF25AGzOvKwGHoJTA2XdCB8O0NKLJNSZG7NAvN8BwQ/640?wx_fmt=png)

在这种模式之下，如果要让多个元素实现水平垂直居中的效果，那还需要加上 flex-direction: column，比如：

```
<!-- HTML -->
<div class="flex__container">
    <div class="avatar">:)</div>
    <div class="media__heading"></div>
    <div class="media__content"></div>
    <div class="action"></div>
</div>

/* CSS */
.flex__container  {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS908lUVY3yQ7rJ9PpfM1ROJdJY2YhhvQVbdoWhNbfrgMVLVlBiclgtmw/640?wx_fmt=png)

在 Flexbox 布局中，还可以像下面这样让 Flex 项目在 Flex 容器中达到水平垂直居中的效果：

```
<!-- HTML -->
<div class="flex__container">
    <div class="flex__item"></div>
</div>

/* CSS */
.flex__container {
    display: flex; // 或inline-flex
    justify-content: center;
}

.flex__item {
    align-self: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSsVPKF0h5E6oH1jDtPDHRicKpIZW9ibliahuIqhnJUNcISJ2EibmlSgwg0w/640?wx_fmt=png)

如果在 Flex 容器中有多个 Flex 项目时，该方法同样有效：

```
.flex__container {
    display: flex; // 或inline-flex
    justify-content: center;
}

.flex__container > * {
    align-self: center;
}
```

比如下面这个效果：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSroalYxFWevsNwAID55NE4hCj4U6ntSzKnRoIypAOQHngkbowPVRI4g/640?wx_fmt=png)

除此之外，还可以使用 place-content: center 让 Flex 项目实现水平垂直居中：

```
.flex__container {
    display: flex;
    place-content: center;
}

.flex__item {
    align-self: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSqu4VnBJiawY9iaqKoZMcib21ZGsiaB5hianENr6NVLQibVCvnZtoWl2dmhMg/640?wx_fmt=png)

或者换：

```
.flex__container {
    display: flex;
    place-content: center;
    place-items: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSX9vvt2nna4jGt9p0xEWlzV6yDw9CVViaAWGDUkEAt3wGZKV8ia4ORG4Q/640?wx_fmt=png)

这两种方式同样适用于 Flex 容器中有多个 Flex 项目的情景：

```
.flex__container {
    display: flex;
    flex-direction: column;
    place-content: center;
}

.flex__container > * {
    align-self: center;
}

// 或

.flex__container {
    display: flex;
    flex-direction: column;
    place-content: center;
    place-items: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSLlxAibvevU1TWux9y2ric2TVZV6uUEqUcvK8Zr2xp4Svbxviaf6aqVSwg/640?wx_fmt=png)

可能很多同学对于 place-content 和 place-items 会感到陌生。其实 place-content 是 align-content 和 justify-content 的简写属性；而 place-items 是 align-items 和 justify-items 的简写属性。即：

```
.flex__container {
    place-content: center;
    place-items: center;
}
```

等效于：

```
.flex__container {
    align-content: center;
    justify-content: center;

    align-items: center;
    justify-items: center;
}
```

虽然扩展出来有四个属性，但最终等效于：

```
.flex__container {
    display: flex;
    align-items: center;
    justify-content: center;
}

// 多行
.flex__container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
```

**在 Flex 项目上设置 margin: auto**

如果在 Flex 容器中只有一个 Flex 项目，还可以显式在 Flex 项目中显式设置 margin 的值为 auto，这样也可以让 Flex 项目在 Flex 容器中水平垂直居中。例如：

```
.flex__container {
    display: flex; // 或 inline-flex
}

.flex__item {
    margin: auto;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSgkqO1KRo3z4S41BHAmBBmpicrFCPiciaeBAcFXfia9SCjxMHIkRTrX0jXg/640?wx_fmt=png)

整个过程，你可以通过下面这个示例来体验。尝试着选中不同方向的 margin 值：

![](https://mmbiz.qpic.cn/mmbiz_gif/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSkKb6teVSW13Mck3rlralNMsic7pPZTpOXYnhqTDc89ARFSqyiaMPZb1g/640?wx_fmt=gif)

Grid 中实现水平垂直居中

CSS Grid 布局可以说是现代 Web 布局中的银弹。它也是到目前为止布局系统中唯一一个二维布局系统。

在 CSS Grid 布局中，只需要仅仅的几行代码也可以快速的帮助我们实现水平垂直居中的效果。比如下面这个示例：

```
<!-- HTML -->
<div class="grid__container">
    <div class="grid__item"></div>
</div>

/* CSS */
.grid {
    display: grid; // 或 inline-grid
    place-items: center
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSzic3bF9leYibJ5l6gmu0v8O3T9WKdqOhs04rLTJBIT8uWz68iaticmRicbQ/640?wx_fmt=png)

在 CSS Grid 布局模块中，只要显式设置了 display: grid（或 inline-grid）就会创建 Grid 容器和 Grid 项目，也会自动生成网格线，即行和列（默认为一行一列）。

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSYg3l52VaibKBMpZ6tb3EicGfbcA7WZQiaIvXx6GzPOQNdg75B6OKKc2eg/640?wx_fmt=png)

在没有显式地在 Grid 容器上设置 grid-template-columns 和 grid-template-rows，浏览器会将 Grid 容器默认设置为 Grid 内容大小：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSLHtnTIWgfBnOpyxiaCK8qrWST2Z5QextvEwGiayLp224H0kCibhbh7J6w/640?wx_fmt=png)

这种方法也适用于 CSS Grid 容器中有多个子元素（Grid 项目），比如：

```
<!-- HTML -->
<div class="grid__container">
    <div class="avatar">:)</div>
    <div class="media__heading"></div>
    <div class="media__content"></div>
    <div class="action"></div>
</div>
```

这个时候你看到的效果如下:

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSmpPvWz1lwEW3oGoPt5HTPPjibL5gYU2fcgqhqPZPNLqmq2nwllHjtNQ/640?wx_fmt=png)

而且 palce-items 适用于每个单元格。这意味着它将居中单元格的内容。比如下面这个示例：

```
<!-- HTML -->
<div class="grid__container">
    <div class="grid__item">
        <h3>Special title treatment</h3>
        <p>With supporting text below as a natural lead-in to additional content.</p>
        <div class="action">Go somewhere</div>
    </div>
</div>

/* CSS */
.grid__container {
    display: grid;
    place-items: center;
    grid-template-columns: repeat(2, 1fr);
    gap: 2vh;
}


.grid__item {
    display: grid;
    place-items: center;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSFlNC941gCehabKfafx0VyTB0svVJlBibf1zLxibaVLV6WCAr5vbklDpQ/640?wx_fmt=png)

**二  等高布局**

等高布局也是 Web 中非常常见的一种布局方式，而且实现等高布局的方案也有很多种。这里我们主要来看 Flexbox 布局模块和 Grid 布局模块给我们带来了什么样的变化。

在 Flexbox 和 Grid 布局模块中，让我们实现等高布局已经是非常的简单了，比如：

```
<!-- Flexbox -->
<flex__container>
    <flex__item></flex__item>
    <flex__item></flex__item>
    <flex__item></flex__item>
</flex__container>

/* CSS */
.flex__container {
    display: flex; // 或 inline-flex
}
```

简单地说，在容器上显式设置了 display 的值为 flex 或 inline-flex，该容器的所有子元素的高度都相等，因为容器的 align-items 的默认值为 stretch。

这个时候你看到的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS12TQwvAQ1oQ9C3dh2tGZhUZSWicDYGN8TYYITWich5F5VSCH8TXyyIww/640?wx_fmt=png)

这种方式特别适用于卡片组件中：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSwvOp1PXyHENXWPqicFbYLtJHgZv7FHLlvaDvHq9QSqCKftsR0vp5SxA/640?wx_fmt=png)

在 Grid 布局模块中类似：

```
<!-- HTML -->
<grid__container>
    <grid__item></grid__item>
    <grid__item></grid__item>
    <grid__item></grid__item>
</grid__container>

/* CSS */
.grid__container {
    display: grid;
    grid-template-columns: 20vw 1fr 20vw; /* 根据需求调整值*/
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSsYmsHZiaMH9qmFFUiaodibic9Z4L8MpKmkyOrSCicyTo2XEmZH39fcdjuiaQ/640?wx_fmt=png)

同样在一些卡片类布局中运用：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSMpIzCjp4gia707eTCHYztmq97jWTicuQIqeIN0ibb5eHF4Rs26NgkVqSQ/640?wx_fmt=png)

如果需求有所调整，比如在 Flex 项目 或 Grid 项目的子元素高度和容器高度相同。

```
<!-- HTML -->
<flex__container>
    <flex__item>
        <content></content>
    </flex__item>
</flex__container>

/* CSS */
.flex__container {
    display: flex;
}

.content {
    height: 100%
}

// 或
.grid__container {
    display: grid;
    grid-auto-flow: column;
}

.content {
    height: 100%;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSe7MxHAXRKRoL0YCUXH0uRJ2YXQusC7qhib2yDEgsic1EZ9tFYBhtkBvw/640?wx_fmt=png)

**三  Sticky Footer**

首先用下图来描述什么是 Sticky Footer 布局效果：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS8usEjg6dsOiala6rF68rwu8CT7Yy7xf6LWrGl6202mvUkAPLPEfQwMw/640?wx_fmt=png)

Sticky Footer 实现方案和等高、垂直居中一样，同样有很多种方案可以实现。

比如像下面这样的结构：

```
<!-- HTML -->
<header></header>
<main></main>
<footer></footer>
```

先来看 Flexbox 布局模块中的实现方案：

```
body {
    display: flex;
    flex-direction: column;
}

footer {
    margin-top: auto;
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSKuFprt4EdO0iafRsbMcM7GDyqx4RgWj7d0we4OsHzlFVQicvFqHWop6Q/640?wx_fmt=png)

可以尝试着在 main 区域右下角向下拖动，改变主内容区域的高度，你会发现 “当内容不足一屏时，<footer> 会在页面的最底部，当内容超出一屏时，<footer> 会自动往后延后”。

在 Flexbox 布局中，还可以在 <main> 区域上设置下面的样式，达到相等的效果：

```
body {
    display: flex;
    flex-direction: column;
}

main {
    flex: 1 0 auto;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSX3xKmiaQbOPlv2uYjN3gBwKd61wj6BPBAzia8nwZaXPE3vUbqh0vtfrQ/640?wx_fmt=png)

<main> 中的 flex: 1 0 auto 相当于是：

```
main {
    flex-grow: 1; /*容器有剩余空间时，main区域会扩展*/
    flex-shrink: 0; /*容器有不足空间时，main区域不会收缩*/
    flex-basis: auto; /*main区域高度的基准值为main内容自动高度*/
}
```

如果你想省事的话，可以在 main 上显式设置 flex-grow:1，因为 flex-shrink 和 flex-basis 的默认值为 1 和 auto。

在 CSS Grid 布局中我们可以借助 1fr 让 <main> 区域根据 Grid 容器剩余空间来做计算。

```
.grid__container {
    display: grid;
    grid-template-rows: auto 1fr auto;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS4L4pP1LLPThwR6UeqbtfQIE6Lp6EpM3UGnFicqfwkBibtmEoVoBqBDdA/640?wx_fmt=png)

**四  均分列**

在 Web 布局中，很多时候会对列做均分布局，最为常见的就是在移动端的底部 Bar，比如下图这样的一个效果：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSkShpBv6gsugPTw9jicO4TJhXecZRJB7ibfxhiaPa4aUQ1HgTEsq94vXlg/640?wx_fmt=png)

在 Flexbox 和 Grid 还没出现之前，如果希望真正的做到均分效果，可以用 100%（或 100vw）除以具体的列数。比如：

```
<!-- HTML -->
<container>
    <column></column>
    <column></column>
    <column></column>
</container>

/* CCSS */
.container {
    inline-size: 50vw;
    min-inline-size: 320px;
    display: flex-row;
}

.column {
    float: left;
    width: calc(100% / 3);
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSDTEEopibonOiaXUlguj8K1XMJxwKriab3P5KZHUT2T4Ijib88Ygu1Lfgsw/640?wx_fmt=png)

通过浏览器调试器中可以发现，现个列的宽度都是相等的：

![](https://mmbiz.qpic.cn/mmbiz_gif/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSFdRJnjWdUskX2UjIkvEUhN5ib08g01njnMbXSIHa204P9XOyqxuzibUA/640?wx_fmt=gif)

在 Flexbox 和 Grid 布局中，实现上面的效果会变得更容易地多。先来看 Flexbox 中的布局：

```
<!-- HTML -->
<flex__container>
    <flex__item></flex__item>
    <flex__item></flex__item>
    <flex__item></flex__item>
</flex__container>

/* CSS */
.flex__container {
    inline-size: 50vw;
    display: flex;
}

.flex__item {
    flex: 1;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicScUgwibbic0e162bFZbmMiacENTRhHufld3HHKTtPNgRXZTicH9MFIVWYpQ/640?wx_fmt=png)

在 Flexbox 布局模块中，当 flex 取的值是一个单值（无单位的数），比如示例中的 flex:1，它会当作显式的设置了 flex-grow: 1。浏览器计算出来的 flex：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicShicPeY6wChfRomxAFiaRUT8ljfkqd96Wz9S6BkzGCjjE80bTnRZnHjAQ/640?wx_fmt=png)

接下来看 Grid 中如何实现上例的效果：

```
<!-- HTML -->
<grid__container>
    <grid__item></grid__item>
    <grid__item></grid__item>
    <grid__item></grid__item>
</grid__container>

/* CSS */
.grid__container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /*这里的3表示具体的列数*/
}
```

最终的效果是相同的：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSlUXw5ibvTCQnRYRibEP1Wic4RRh5NHibQDdgr2yCIP0rMqDlbzkM82ZaSg/640?wx_fmt=png)

这样的布局方式也适用于其他的布局中。但不管是 Flexbox 还是 Grid 布局中，都存在一定的缺陷，当容器没有足够的空间容纳 Flex 项目（或 Grid 项目）时，Flex 项目或 Grid 项目会溢出（或隐藏，如果 Flex 容器或 Grid 容器显式设置了 overflow:hidden）：

![](https://mmbiz.qpic.cn/mmbiz_gif/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSn4Z4SWDRH0Nlep9AAKqxw6fUGFiayaukS7IQm416lgYhIpYQ4r0ofHQ/640?wx_fmt=gif)

修复这种现象最简单的方式是在 Flex 容器或 Grid 容器显式设置一个 min-width（或 min-inline-size）：

```
.flex__container {
    min-inline-size: 300px;
}
```

不过话又说回来，比如我们的 Flex 项目（或 Grid 项目）是一个卡片，每张卡片宽度是相等之外，更希望容器没有足够空间时，Flex 项目（或 Grid 项目）会自动断行排列。

我们继续通过示例向大家展示。先来看 Flexbox 实现方案：

```
.flex__container {
    display: flex;
    flex-wrap: wrap;
}

.flex__item {
    flex: 0 1 calc((100vw - 18vh) / 4); /* calc(100vw -18vh) / 4 是flex-basis的基准值 */
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSB1FJSYK5Fl6OQsZ59N0yTgAhkkNibrW5ObxHy4sciawxYGHVKvQ2hzMA/640?wx_fmt=png)

你可以尝试着调整浏览器的视窗宽度，当浏览器的视窗越来越小时，Flex 容器宽度也就会越来越小，当 Flex 容器小到没有足够的空间容纳四个 Flex 项目（就此例而言），那么 Flex 项目就会断行排列：

![](https://mmbiz.qpic.cn/mmbiz_gif/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSmIWWmwDax1ODTicb5QlstMXBGIEmD12TZn0jJMhhY2AVByErlqPXkKA/640?wx_fmt=gif)

基于该例，如果把 Flex 项目的 flex 值改成：

```
.flex__item {
    flex: 0 0 400px;
}
```

这个时候，当 Flex 容器没有足够空间时，Flex 项目会按 flex-basis: 400px 计算其宽度，Flex 容器没有足够空间时，Flex 就会断行：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSb5gwusjfrUvaic4QOqNHcygdcGuNricoXibLicNXaW0nsPTkFa9xmPsYiaw/640?wx_fmt=png)

反过来，如果 Flex 项目的值 flex 改成：

```
.flex__item {
    flex: 1 0 400px;
}
```

当 Flex 容器没有足够空间排列 Flex 项目时，Flex 项目会按 flex-basis: 400px 计算其宽度，Flex 会断行，并且同一行出现剩余空间时，Flex 项目会扩展，占满整个 Flex 容器：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSDry1Fq1cTNc53h7ATKZyEcWYclyTU9vAnZIO7bN0PSPf6c7CFUCRGw/640?wx_fmt=png)

在 Grid 中实现类似的效果要更复杂一点。可以使用 repeat() 函数，1fr 以及 auto-fit 等特性：

```
.grid__container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2vh;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS7J3MbRmVybhQCkic21dONuZfghyHicWO4odx6bVuR7zf5fIRDUXceHlw/640?wx_fmt=png)

如果你对这方面知识感兴趣的话，还可以移步阅读《Container Query Solutions with CSS Grid and Flexbox》一文。

其实在 Grid 中与 auto-fit 对比的值还有一个叫 auto-fill。但两者的差异是非常地大，用下图来描述 auto-fit 和 auto-fill 的差异：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSq5jZZOAs8aw8OiaAicYicVwxhjP34Bice9IkozYueYbYDKy0xuBSkhIz3w/640?wx_fmt=png)

另外这种方式也是到目前为止一种不需要借助 CSS 媒体查询就可以实现响应式布局效果。

**五  圣杯布局**

圣杯布局（Holy Grail Layout）) 是 Web 中典型的布局模式。看上去像下图这样：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSHibicfPs3eug3IEbfsDeXTgOufdMNu5WQ9CGbc6nDAR3jPCfDiabOXKQg/640?wx_fmt=png)

对于圣杯布局而言，HTML 结构是有一定的要求，那就是内容为先：

```
<!-- HTML -->
<header></header>
<main>
    <article></article> <!-- 主内容 -->
    <nav></nav>
    <aside></aside>
</main>
<footer></footer>
```

在这里主要还是和大家一起探讨，如何使用 Flexbox 和 Grid 布局模块来实现圣杯布局。先来看 Flexbox 实现方案：

```
body {
    width: 100vw;
    display: flex;
    flex-direction: column;
}

main {
    flex: 1;
    min-height: 0;

    display: flex;
    align-items: stretch;
    width: 100%;
}

footer {
    margin-top: auto;
}

nav {
    width: 220px;
    order: -1;
}

article {
    flex: 1;
}

aside {
    width: 220px;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSzDStKJDW3SJE7SkYsNAstqYHJKdibW8HdlnBibrh7FlQ8UR9aqnwEibKQ/640?wx_fmt=png)

通过在 nav、aside 和 article 上显式设置 order 的值，可以很好的控制这三个区域的布局顺序。比如说，希望 <aside> 在 <article> 之前排列，只需要在上面的示例基础上做一点点调整：

```
nav {
    order: 0;
}

aside {
    order: -1;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSNwHmNJFRNjn9VYeda1GgNUib4mtfqbXcDxtJ4I4tqfJ9xseQelUAXTQ/640?wx_fmt=png)

> 注意，order 的默认值为 0，值越大越排在后面！

在上例的基础上，借助 CSS 媒体对象的特性，可以很容易实现响应式的圣杯布局效果：

```
@media screen and (max-width: 800px) {
    main {
        flex-direction: column;
    }

    nav, aside {
        width: 100%;
    }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicStAgVnKhwTkZy5Jo7vLX7vySrFwtxTzxQc4P678EXPy7pMZmNlmB5PQ/640?wx_fmt=png)

尝试着拖动浏览器来改变视窗大小，你可以看到如下图的效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS8yuhUdsncic1CKuQgOJy9cOPxVUqyF9he8iapP81YibcaJCsTiblpncZpQ/640?wx_fmt=gif)

在 Grid 布局模块中，实现圣杯布局要比 Flexbox 布局模块中更容易，而且更灵活。在 CSS Grid 布局模块中，HTML 结构可以更简洁：

```
<!-- HTML -->
<body>
    <header></header>
    <main></main>
    <nav></nav>
    <aside></aside>
    <footer></footer>
</body>
```

在 CSS 方面有很多种方案可以实现圣杯布局效果。我们先来看第一种：

```
body {
    display: grid;
    grid-template: auto 1fr auto / 220px 1fr 220px;
}

header {
    grid-column: 1 / 4;
}

main {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
}

nav {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
}

aside {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
}
footer {
    grid-column: 1 / 4;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naLRC5icSwEYu8jKF5YfzwMdC2aiaic8DhjC9hkexDCa4oWIzx2IvlNPUyVV5ib1N1XNy2ial3F6qd91Iicg/640?wx_fmt=png)

上面示例采用的是网格线来给每个区域进行定位的：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS1SauO1tFE3UYia8OKq1RRWxSFLl2kW85bibicQRpFc67Dlg3X4Ka16V2Q/640?wx_fmt=png)

和 Flexbox 布局类似，在媒体查询中可以改变每个网格区域的位置：

```
@media screen and (max-width: 800px) {
    body {
        grid-template-rows: auto;
        grid-template-columns: auto;
    }

    header,
    main,
    nav,
    aside,
    footer {
        grid-column: 1 / 2;
        min-height: auto;
    }

    main {
        grid-row: 3 / 4;
        margin: 0;
    }

    nav {
        grid-row: 2 / 3;
    }

    aside {
        grid-row: 4 / 5;
    }

    footer {
        grid-row: 5 / 6;
    }
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSG8yOeriaDsBFV4K15ZFYTKEBk2Ar69cMZP69oicjTEoiamwRBIxm2vNcQ/640?wx_fmt=png)

除了 grid-template（即 grid-template-columns 和 grid-template-rows）之外，在 Grid 布局中还可以使用 grid-area 和 grid-template-areas 属性的结合，也能很方便的实现 CSS 圣杯布局。基于上面的示例上，只需要把你的 CSS 调整为：

```
body {
    display: grid;
    grid-template-areas:
        "header header header"
        "nav main aside"
        "footer footer footer";
}

header {
    grid-area: header;
}

main {
    grid-area: main;
}

nav {
    grid-area: nav;
}

aside {
    grid-area: aside;
}

footer {
    grid-area: footer;
}

@media screen and (max-width: 800px) {
    body {
        grid-template-areas:
            "header"
            "nav"
            "main"
            "aside"
            "footer";
    }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSUvg4zr4Fo1aRUU2WhWv8XceSN9Q6I0qRxgJrVtaEzWz7nrk87hzKFw/640?wx_fmt=png)

你可能发现了它们之间的差异性：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSHiaicZEIica6rOJKww4NRGlVN6ia2XslC2RmZ0XiaPaRI6eXbMIl7icDnlXw/640?wx_fmt=png)

后面这个示例中，<nav>、<main> 和 <aside> 区域宽度相等。这是因为我们示例中通过 grid-template-areas 来声明网格，在使用 grid-template-areas 创建网格时，其实也隐式的创建了网格线，只不过他和 grid-template 不同的是 grid-template 可以显式的指定网格轨道大小，而 grid-template-areas 在该示例中相当于网格轨道大小都是 1fr。

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSoEY25KzRV2XV7npkaaWNtJYCDAibYAebLB9RoZMUT0wwjLKx9FlMiaMA/640?wx_fmt=png)

如果我们希望 <main> 的区域变得更大，那么可以在 grid-template-areas 上做个调整：

```
body {
    display: grid;
    grid-template-areas:
        "header header header header header"
        "nav main main main aside"
        "footer footer footer footer footer";
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSYibubIrk0IUVyicE1mewf54HXS9LpnAxVKk3d1Zv9PaIzfEc0EBABiaTQ/640?wx_fmt=png)

这个时候网格区域的划分像下图这样：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSzCib4AUmXTib4HWg1kyAvOlHboJhtqZicwcSiacCSce9w5B8Kqg6lr6xHw/640?wx_fmt=png)

虽然在效果有所调整了，但还是均分状态。更好的解决方案是，将 grid-template-areas 和 grid-template 结合起来使用：

```
body {
    display: grid;
    grid-template-areas:
        "header header header"
        "nav main aside"
        "footer footer footer";
    grid-template-columns: 220px 1fr 220px;
    grid-template-rows: auto 1fr auto;
}

header {
    grid-area: header;
}

main {
    grid-area: main;
}

nav {
    grid-area: nav;
}

aside {
    grid-area: aside;
}

footer {
    grid-area: footer;
}

@media screen and (max-width: 800px) {
    body {
        grid-template-areas:
            "header"
            "nav"
            "main"
            "aside"
            "footer";
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr auto auto;
    }

    main {
        margin-left: 0;
        margin-right: 0;
    }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSSI1qDHqb9Dib1Pzxh62yIribyLkRaZc24deZDmCP1TmZvrF6JGf1EkLw/640?wx_fmt=png)

你可以发现，这个时候，网格线的区域的命名像下图这样：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSwV7eL9lRaJdpibmJyMzfDIycbJZNzy5g7MhmicMib3UcrDAS1VFwP58hA/640?wx_fmt=png)

**六  12 列网格布局**

12 列网格布局最早是由 960.gs 提出的网格布局系统：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSzCpLwiadp7wRz7koILSPxCInUYD1ElsB3zpoS2JqkPnokNP2VvCEaWQ/640?wx_fmt=png)

12 列网格布局在设计系统和 CSS Framework 中经常使用，比如业内经典的 Bootstrap 就采用了 12 列网格布局系统：

![](https://mmbiz.qpic.cn/mmbiz_jpg/Z6bicxIx5naLictAkPmGBSLHsmdGrWj1stDrZDDqEOPbPdLXC5dqCTXocFBGvYFiapSRK9byF57UU4hXjV3iawibkKQ/640?wx_fmt=jpeg)

在社区中也有很多在线工具，帮助我们快速构建 12 列网格系统，比如 Free CSS Grid Tools & Resources For Developers 一文中罗列的工具。

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSZFp2dyAGJzYE7WG8o1hZZRASXxz8uleIlLfuJ1ibF6zTDsElXxTR2fw/640?wx_fmt=png)

不过这里主要是想和大家一起看看在 Flexbox 和 Grid 布局模块中是如何实现 12 列的网格布局系统。

先来看 Flexbox 布局模块。12 列网格布局的 HTMl 结构一般类似于下面这样：

```
<!-- HTML -->
<flex__grid>
    <flex__row>
        <flex__item col4></flex__item col4>
        <flex__item col4></flex__item col4>
        <flex__item col4></flex__item col4>
    </flex__row>
</flex__grid>
```

注意，12 列网格中，一般同一行的列数值和刚好等于 12。比如上面的 HTML 结构，行中有三列，每列的宽度刚好四个网格宽度加两个列间距。并且在计算的时候有一套成熟的计算公式：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS7bpIjDicHgicibCoSDnyLsLUVy00WeVlkQkrbhmMOphFNXr6Xzj0qDOcQ/640?wx_fmt=png)

而且还设计上也会有所差异，比如说距离容器两侧有没有间距等：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSkibqOhDhKDakBP4e7lVVwsuELlIXATIPHu8W4YmJ9N8gcURpIvqrJCg/640?wx_fmt=png)

这些的差异对于计算公式和样式代码的设计都略有差异。我们用其中一个为例：

```
:root {
    --gutter: 10px;
    --columns: 12;
    --span: 1;
}

.flex__container {
    display: flex;
    flex-direction: column;
    padding-left: var(--gutter);
    padding-right: var(--gutter);
}

.flex__row {
    display: flex;
    margin-left: calc(var(--gutter) * -1);
    margin-right: calc(var(--gutter) * -1);
}

.flex__row + .flex__row {
    margin-top: 2vh;
}

.flex__item {
    flex: 1 1
        calc((100% / var(--columns) - var(--gutter)) * var(--span));
    margin: 0 var(--gutter);
}

.flex__item1 {
    --span: 1;
}

.flex__item2 {
    --span: 2;
}

.flex__item3 {
    --span: 3;
}

.flex__item4 {
    --span: 4;
}

.flex__item5 {
    --span: 5;
}

.flex__item6 {
    --span: 6;
}

.flex__item7 {
    --span: 7;
}

.flex__item8 {
    --span: 8;
}

.flex__item9 {
    --span: 9;
}

.flex__item10 {
    --span: 10;
}

.flex__item11 {
    --span: 11;
}

.flex__item12 {
    --span: 12;
}
```

你会看到的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSBubML98PtFfQSQ52EG5euz3XfHeIoWvv5iabnUCQtzcibvKvSWribFGCg/640?wx_fmt=png)

在该示例中采用了 CSS 自定义属性相关的特性，让整个计算变得更容易一些。

对于使用 CSS Grid 布局模块来实现 12 列网格布局，相对而言，不管是 HTML 结构还是 CSS 代码都会更简易一些。在使用 CSS Grid 布局模块实现 12 列网格布局，将会运用到 repeat()、minmax()、gap 和 fr 等特性。具体的来看一个示例吧。

```
<!-- HTML -->
<grid__container>
    <grid__item></grid__item>
</grid__container>
```

我们来看 CSS 代码：

*   使用 fr 将网格均分为相等的值，即每列宽度都是 1 个 fr；配合 repeat() 函数，即 repeat(12, 1fr) 创建了 12 列网格。
    

*   使用 gap 可以用来控制网格之间的间距。
    

*   配合 minmax() 还可以设置网格最小值。
    

具体的代码如下：

```
:root {
    --columns: 12;
    --gap: 10px;
    --span: 1;
}

.grid__container {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    grid-template-rows: 1fr;
    gap: var(--gap);
    padding-left: calc(var(--gap) / 2);
    padding-right: calc(var(--gap) / 2);
}

.grid__item {
    min-block-size: 10vh;
    grid-column: span var(--span);
}

.col1 {
    --span: 1;
}

.col2 {
    --span: 2;
}

.col3 {
    --span: 3;
}

.col4 {
    --span: 4;
}

.col5 {
    --span: 5;
}

.col6 {
    --span: 6;
}

.col7 {
    --span: 7;
}

.col8 {
    --span: 8;
}

.col9 {
    --span: 9;
}

.col10 {
    --span: 10;
}

.col11 {
    --span: 11;
}

.col12 {
    --span: 12;
}
```

你将看到的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSwCpIsrPAlzdYkibclzIibhictBT3gXA4e3wiaottmqdichXKJFRKMwNX0CQ/640?wx_fmt=png)  

就该示例而言，grid-template-columns: repeat(12, 1fr) 创建网格如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSzicRo3we7xqSjbf7pZ8ZPmBC0Tkbu579guHe9LeHaiamZMKKeBhNv5Bw/640?wx_fmt=png)

除了上述这种粗暴的方式，还可以更灵活一些，将 auto-fit、minmax() 以及 grid-auto-flow: dense 等来创建：

```
.grid__container {
    padding: 1em;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 1em;
    grid-auto-flow: dense;
}
```

对于 .grid__item 可以通过 grid-column、grid-row 来控制网格项目的位置：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicS1C2IA1xA6gCgTfaPWQFMGarH12ysiaT09o7GefS5y1cWjvg7ecFsZFw/640?wx_fmt=png)

加上 grid-auto-flow: dense 会根据 Grid 容器空间，Grid 项目会自动流到合适的位置：

![](https://mmbiz.qpic.cn/mmbiz_gif/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSweS4NNQhuTGl4mkmMsRXur5BjIuP0NmarJVIUuuMYTsKJZom8Jhlew/640?wx_fmt=gif)

这种布局对于杂志类的布局非常的适用。有关于这方面更详细的介绍可以阅读 @Keir Watson 的《Responsive Grid Magazine Layout in Just 20 Lines of CSS》一文。

**七  两端对齐**

在 Web 布局中时常碰到两端对齐的需求。在 Flexbox 布局中，时常在 Flex 容器中显式设置 justify-content 的值：

```
.flex__container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    width: 100%;
}
```

但在末尾行，如果和前面行的个数不相同（Flex 项目）就会出现下图这样的效果：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSQRF6HIzYrGcqiaibuGe8GrEXfmTLe3sKez9GCrVCY34ykicmtjrmqO14w/640?wx_fmt=png)

像上图这样的效果，并不是我们所需要的，因为我们希望在最后一行的 Flex 项目不足够排列满一行时，希望 Flex 项目一个紧挨一个的排列：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSwlSGOLIgibwtyGmlt83ZFOPG4XMuNH9mUiajLiaA34d9z4NcAq2tTlzUA/640?wx_fmt=png)

在 Flexbox 要实现上图这样的效果，只需要在 Flex 容器中添加一个伪元素：

```
.flex__container::after {
    content: "";
    display: flex;
    flex: 0 1 32vw;
}
```

注意，伪元素的 flex-basis 建议设置的和卡片的 flex-basis（或宽度）等同。这个时候你将看到像下面这样的示例：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSLic66pMbVjia6eLIibxttFGlqnU4YGLzPShJ0Eya3xFPTk5SvibA7JmcyA/640?wx_fmt=png)

不过这种方式也不是最佳的方式，当末尾行的个数不只少一个时，就会出现下图这样的效果：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSxlbbe3jH9NTX3oF7SsuVKwuKFINp679DjxCZ9ldq3o4ua5kXEHoaCQ/640?wx_fmt=png)

面对这样的场景，我们需要给 Flex 容器添加额外的空标签元素：

> 占位符元素数量 = 每行最大的列数 - 2

但是 gap 属性出现之后，要实现这样的效果就不难了：

```
body {
    padding: 1vh;
}

.flex__container {
    display: flex;
    flex-wrap: wrap;
    gap: 2vh;

    width: 100%;
}

.flex__item {
    flex: 0 1 calc((100vw - 8vh) / 4);
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSialKCLYw0VnFicXcDMGmgqsBVdxjgHmUTuEmlmx3JMm5SmhWUTMqjfcQ/640?wx_fmt=png)

注意，gap 运用在 Flexbox 中到目前为止，仅得到了 Firefox 浏览器的支持。上面的示例，使用 Firefox 浏览器，你看到的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSeVqGnIFBgFOLIiaV61xGhTBW4UGHb2LciaNGAnqWLXBzibuh6QtJteYww/640?wx_fmt=png)

在 CSS Grid 布局中，就可以直接使用 gap：

```
body {
    padding: 1vh;
}

.grid__container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1vh;
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSia5IzjQHWBQvibeKxrBY1ichldyb4rEO5p9p92JWeqd01JLCqoorGucnA/640?wx_fmt=png)  

**八  选择最佳的值**

很多时候，针对不同的场景，设计师会为我们提供不同的设计风格，比如元素大小：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSfzjamlqJJOI1fXwbGCGQQTml4pyPJxLiaJf9qhTcGfRkrxy8umflkWQ/640?wx_fmt=png)

随着 clam() 函数的到来，这一切都变得容易地多。

clam() 函数接受三个参数，即 clam(MIN, VAL, MAX)，其中 MIN 表示最小值，VAL 表示首选值，MAX 表示最大值。它们之间：

*   如果 VAL 在 MIN 和 MAX 之间，则使用 VAL 作为函数的返回值。
    
*   如果 VAL 大于 MAX，则使用 MAX 作为函数的返回值。
    
*   如果 VAL 小于 MIN，则使用 MIN 作为函数的返回值。
    

我们来看一个示例：

```
.element {
    /**
    * MIN = 100px
    * VAL = 50vw ➜ 根据视窗的宽度计算
    * MAX = 500px
    **/

    width: clamp(100px, 50vw, 500px);
}
```

比如浏览器视窗现在所处的位置是 1200px 的宽度，那么 .element 渲染的结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSb2TNWE9iaw6JLNRfFibJ3V5ea5ibAZRLMLu021BGPFgc0nK3Keou4mkvA/640?wx_fmt=png)

这个时候 .element 元素的 width 是 500px。此时，clamp(100px, 50vw, 500px) 相当于 clamp(100px, 600px, 500px)，对应的 VAL 值是 600px，大于 MAX 值，那么这个时候 clamp() 函数返回的值是 MAX，即 500px，这个时候 .element 的 width 值就是 500px（即 MAX 的值）。

如果我们把浏览器视窗缩小至 760px：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSW1mp4pmu7wefHdNLLTUvTkEeXxrTWQhIuN2nZgpqGS4FfuNZZSM91A/640?wx_fmt=png)

这个时候 .element 元素的 width 是 50vw。此时，clamp(100px, 50vw, 500px) 相当于 clamp(100px, 380px, 500px)，对应的 VAL 值是 380px，该值大于 MIN 值（100px），小于 MAX 值（500px），那么这个时候 clamp() 函数返回的值是 VAL，即 50vw，这个时候 .element 的 width 值就是 50vw（即 VAL 的值）。

如果继续将浏览器的视窗缩小至 170px：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSzkEM7rmyXYicLL0hjc5LOnib6RPPMhYXJczgNM8sZxUYD3IgtNCpfvYw/640?wx_fmt=png)

这个时候 .element 元素的 width 是 100px。此时，clamp(100px, 50vw, 500px) 相当于 clamp(100px, 85px, 500px)，对应的 VAL 值是 85px，该值小于 MIN 值（100px），那么这个时候 clamp() 函数返回的值是 MIN，即 100px，这个时候 .element 的 width 值就是 100px（即 MIN 的值）。

就该示例而言，clamp(100px, 50vw, 500px) 还可以这样来理解：

*   元素 .element 的宽度不会小于 100px（有点类似于元素设置了 min-width: 100px）。
    

*   元素 .element 的宽度不会大于 500px（有点类似于元素设置了 max-width: 500px）。
    

*   首选值 VAL 为 50vw，只有当视窗的宽度大于 200px 且小于 1000px 时才会有效，即元素 .element 的宽度为 50vw（有点类似于元素设置了 width：50vw）。
    

**九  Logo 图标的对齐**

我想你在 Web 开发中可能碰到过类似下图的这样的场景：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSNS5Lx7346YyG1agszqe536Tpa42YvGf4iaicjPa402UxibDTLfuk9eLxg/640?wx_fmt=png)

正像上图所示，Logo 图像的有大有小（宽度和高度都不一样）。面对这样的业务场景，很多时候都希望设计师能提供相同尺寸的图像。但这样势必会影响 Logo 图像的外观。

前段时间看到 @Ahmad Shadeed 专门写了一篇博文《Aligning Logo Images in CSS》，就是介绍如何实现上图这样的布局效果。

其实实现这样的布局效果，主要运用到的就是 CSS 的 object-fit 属性，而这个属性早在多年前就得到了各大主流浏览器的支持。

这里我们用一个简单的示例，来看看具体实现过程。先来看 HTML 结构：

```
<!-- HTML -->
<ul class="brands">
    <li class="brands__item">
        <a href="#">
            <img src="img/logo.png" alt="">
        </a>
    </li>
    <li> <!-- ... --> </li>
</ul>
```

居中对齐前面已经介绍过了，这里主要是看图像大小方面的处理：

```
.brands {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    grid-gap: 1rem;
}

.brands__item {
    background: #eee;
}

.brands__item a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.brands__item img {
    width: 130px;
    height: 75px;
    object-fit: contain;
}
```

这样就能实现上图的效果。你可能发现了，有些 Logo 图像带有背景颜色，如果让效果更好一些，可以把 CSS 混合模式相关的特性运用进来：

```
.brands__item img {
    width: 130px;
    height: 75px;
    object-fit: contain;
    mix-blend-mode: multiply;
}
```

这个时候，你看到的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSgamMLNBf0CN7qiasL4pbkaZNKaRL87cKnBkVr2ibVyZXUicv0QEJiaL0fQ/640?wx_fmt=png)

object-fit 除了取值 contain 之外，还有其他几个值：

![](https://mmbiz.qpic.cn/mmbiz_png/Z6bicxIx5naKyyTvoRqxFUicAtcfomMicicSIabTZvsvf7FRelhfmGFmLZmVzasYicIUUyZ7wzF1qiaaEOXl0GJHHRRQ/640?wx_fmt=png)

其实这个方案也适用于产品图片，人物头像等布局。

**小结**

文章中主要介绍了 Web 中一些布局的实现思路和具体方案。其实文章提到的效果，比如水平垂直居中、等高布局、平均分布列和 Sticky Footer 等，在 CSS 中一直有多种解决方案，只不过随着 CSS Flexbox 布局模块和 CSS Grid 布局模块的到来，实现这些效果变得更为灵活和简洁。

当然，文章中提到的只是一些最为常见的一些效果，其实在 Web 布局中，特别是 Flexbox 布局和 Grid 布局中还存在着很多有意思的东西，只不过因为篇幅的原因没有一一罗列。如果你感兴趣可以再挖掘一些出来，如果你在这方面有更好的经验或方案，欢迎在下面的评论中分享。最后希望这篇文章对你平时的工作有所帮助

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)

》》面试官都在用的题库，快来看看《《