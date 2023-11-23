> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/VUdtcuQ5cdJZNisthBlAgw)

（给程序员的那些事加星标）

> 转自：掘金 -CodingStartup 起码课

> 在这里也特别声明一下，这个教学里用到的图片素材都是由 Apple 网站中获取，图片版权归 Apple 所有，这里只用作教学演示用途，大家千万不要将这些图片用于真实的网页中。

HTML 的部分
--------

打开 CodePen 编辑器，在 HTML 的部份加入标题。由于它有一个副标题，所以我会用 `<p>` 标签去装着它。然后加入一个 `<div>`，`id` 名为 `iphone`，里面新增两个 `<div>`，`id` 分别是 `hardware` 和 `ui`；`hardware` 会用来显示 iPhone 的机身和边框，而 `ui` 则会显示画面里面的内容。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9tCdO2116ggqcicVs63veSjfm7ozp8ny6qJnY6Z8Eo8zK4bK4TI5JyvA/640?wx_fmt=png)

CSS 的部分
-------

先定义一些 CSS，让我们更加清楚知道在做什么。加入 `:root` 选择器，定义一些变量和样式：

*   `--device-width` 是 `770px`
    
*   `--device-height` 是 `1336px`
    
*   `--ui-width` 是 `640px`
    
*   基础文字大小是 `15px`
    

然后加入 `#iphone` 选择器，设定 `position` 是 `relative`，宽度和高度的值从变量中获取。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9DRk8InUcasZwl0LauluPsqTpOGDHhoKB0WibOJM6J3n9CZb31ffTM6Q/640?wx_fmt=png)

再加入 `#hardware` 选择器，设定宽度和高度是 `100%`，然后背景图片，载入 iPhone 的机身图片，为了支援 Retina Display 高清屏幕，这张图片的尺寸是两倍大小，所以设定 `background-size`，宽度和高度同样等于变量的设定值。

好了，在这里想介绍一个图片遮罩的 CSS 属性，大家会发现现在 iPhone 的四周，圆型边框背后有个黑色背景：

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9GrUQLRhLcXQXkaDSIicict9X6xL5DjpbQXJ78NWqzcjh8m0C3t0AkXPQ/640?wx_fmt=png)

而我发现 Apple 特地准备了一张遮罩图片，画出了 iPhone 的外型，用白色填充，而圆型边框的四周是透明的：

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9kFk38wNqRqZEpbv4eXKT9LBT8HOvEUMHUBEJ1gy4s4HdCiaRnkj6rpg/640?wx_fmt=png)

我们可以通过 `mask-image` 这个属性将遮罩图片套用上去。由于这个 CSS 属性还在试验阶段，所以要加上 `-webkit` 前缀的版本，与背景图片一样，图片是两倍大小，所以同样需要将遮罩的大小设定一下，将 `mask-size` 设定为变量的值，并且加上 `-webkit` 前缀的版本。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9j5cyXoS9eKW4vUIbOykSY4UsyfM0XeeiaUPEOyXicgGDEjZzpSxb3qVg/640?wx_fmt=png)

现在可以看到遮罩已经成功套用上，iPhone 的黑色背景不见了。至于为何 Apple 不直接将 iPhone 图片的背景设定为透明？我估计是为了优化图片的大小，因为透明底的图片需要用到 PNG 格式，而这么大张的彩色 PNG 图片容量上比起 JPG 会大不少，所以 Apple 就采用了高压缩比的 JPG 格式作为 iPhone 图片，再准备一张只有单色的 PNG 图片来做遮罩，这样的确可以省下不少网络频宽。

好了，介绍完这个属性，可以加入 `body` 选择器，将背景颜色设定为黑色，`margin` 设定为 `0`，然后将网页的内容上下左右置中：

*   `display` 设定为 `flex`
    
*   `flex-direction` 设定为 `column`
    
*   `justify-content` 设定为 `center`
    
*   `align-items` 设定为 `center`
    
*   `min-height` 设定为 `100vh`
    

字体设定为 `Helvetica`，再加入一些 `padding`，设定上下是 `4rem`，左右是 `0`。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9lrnwWbMZRQpsPIqyX9wprhIu4EDQraNAhVlPgfgr2GeCPC6TnGBFoQ/640?wx_fmt=png)

再设定一下标题的样式，加入 `h2` 选择器，文字颜色设定为灰色，`text-align` 设定为 `center` 将它置中，文字大小设定为 `4.5rem`，文字粗度是 `600`。然后 `margin` 设定为上下 `6rem`，左右 `0`。

加入 `h2 p` 选择器，设定副标题的样式，`margin` 设定为 `0`，文字颜色设定为白色就可以了。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9ic9Pl7NIrPJJxXmDHeYiaYib6H6cBnwGm8IYaTrYNialPibyxEzqHP1IUSA/640?wx_fmt=png)

框架大置上设定好了，下一步就设定 iPhone 画面的内容。

在 `#ui` 里面加入一张图片，是画面顶部的 UI，然后就是每一行资料的图片，我会用 `<ul>` 列表去建构它，加入 `<li>`，内容是一张图片，总共有 7 行。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9jYsaHm5iaMEyWibyFWh4tUC5MH3LP8oM2Ez10TTwGHJGBIf881UBvGug/640?wx_fmt=png)

回到 CSS 的部份，加入 `#ui` 选择器，`position` 设定为 `absolute`，`top` 设定为 `0`。然后要将它左右置中，先将 `left` 设定为 `50%`，再将 `transform` 设定为 `translateX(-50%)` 就可以了。

加入 `#ui .top-ui` 选择器，设定顶部 UI 图片的定位。`display` 设定为 `block`，宽度从变量中获取，高度是 `auto`，然后 `margin`，设定上方是 `70px`，左右是 `auto`，下方是 `0`。再加一点 `padding-bottom`，设定为 `30px`，以及一条下边框线。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9pxKmSY3jXUgc4uMRVepLsuoiccLOsamMQMDN0ZaW7O9eV73NZ40eP4A/640?wx_fmt=png)

来到列表的部份，加入 `#ui ul` 选择器，将 `list-style` 设定为 `none`，取消列表的样式，`margin` 和 `padding` 设定为 `0`。

再设定里面的图片的样式，加入 `#ui ul li img` 选择器，设定 `display` 是 `block`，宽度从变量中获取，高度是 `auto`，`margin` 设定为上下 `10px`，左右 `auto`。`padding-bottom` 是 `10px`，然后再加一条下边框线。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM91ZVZwN9QJcBw0czxQAvjkficYZTnVoC6WflXpvKusvlSs20ILzKl4cA/640?wx_fmt=png)

现在界面基本上已设定好了，接下来处理动画的部份。

动画的部分
-----

我们先了解一下这个动画的原理，它是在页面卷动的时候，一行一行的由大至小滑入至列表中，先试试在 CSS 中将效果实现出来。

加入 `#ui ul li img:hover` 选择器，设定 `transform` 为 `scale(1.8)`，然后 `opacity` 设定为 `0`。在 `#ui ul li img` 选择器内加入 `transition: .25s transform ease-in-out;`，现在试试将游标移至其中一行，就可以实现将图片由放大至缩小，回到列表中的效果。

![](https://mmbiz.qpic.cn/mmbiz_gif/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9eI1HLxxZCDXicb08ibkovQ5Yknbgsf9gw8WZonZWHSiaiaBmYdcAvXkCMw/640?wx_fmt=gif)

再加一些位移，例如 `translateY()` 设定为 `-60px`，效果大致上是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9KHUUkdAYlenqiccibKoA1icHXkNZbgQ4hwl3PD6cLBj3WU4ocxS4iaQlqw/640?wx_fmt=gif)

不过这个动画并不是由游标触发，是随着页面卷动时触发，并且可以通过卷动控制动画的进度，所以我会通过 JavaScript 计算目前页面卷动了多少，然后再设定对应行数的 `transform` 和 `opacity`。

为了简化 JavaScript 对 CSS 样式的设定，我想先在 CSS 这边做一个设定值，用来控制一行动画的进度。

先将 `hover` 和 `transition` 的设定值移除，然后在 HTML 里面，在第一个 `li` 那里加入 `style`，设定 `--progress` 是 `0.5`：

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9Ibt4mhah43iaZqUC2WG97LBLwXMVqSoQUhHPEWyydhuabpJeSdmS6zg/640?wx_fmt=png)

`--progress` 是我自己定义的 CSS 变量，我想在它的设定值为 `0` 时将 `scale()` 设定为 `1.8`，以及 `opacity` 设定为 `0`；而在它的设定值为 `1` 的时候，将 `scale()` 设定为 `1`，`opacity` 设定为 `1`。做到像是一个动画的开关的功能，那么我们在 JavaScript 那边，只需要调整这个 `--progress` 就可以控制动画。

在 `#ui ul li img` 里面，加入 `transform`，先设定 `scale()`，将 `1.8` 减去 `0.8 * var(--progress)`，这样在 `--progress` 为 `1` 的时候，`scale` 就是 `1`；而 `--progress` 为 `0` 的时候，`scale` 就是 `1.8` 了。

再来 `translateY()`，将 `-60px` 乘以 `1 \- var(--progress)`，这样在 `--progress` 为 `1` 时，`translateY` 就是 `0`；而 `--progress` 为 `0` 的时候，`translateY` 就是 `-60px`。

再将 `opacity` 直接设定为 `--progress` 的值，`0` 的时候会将它隐藏，`1` 的时候它就会显示。试试调整一下 `--progress` 的值，大家就可以看到这个设定值的具体作用了。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9FGFiaFIBjfic65o2quOYHxic56DMsnFr34YZibHaXdAmmRnvPLDvvvBKXw/640?wx_fmt=png)

然后将 `<li>` 上的设定值移除，在 `#ui ul` 里将 `--progress` 初始化为 `0` 就可以了。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9V86Kmmh8WNLiaeHIyAT9Z5B5ic3qVD7BWWyo0baOPznEU5PBIctT9kZw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9BNibg5UFnp6jq2G5iaF93c7oGQC1EzUbI6Zk6W2qWqTyL7KVREkCD2xA/640?wx_fmt=png)

JavaScript 的部分
--------------

最后，就是用 JavaScript 控制动画。

首先定义一个名为 `rows` 的常量，将每一个 `<li>` 获取回来，再定义一个名为 `html` 的常量，赋值为 `document.documentElement`，因为稍后会有几次引用 `document.documentElement` 的。

加入 `document.addEventListener`，监听 `scroll` 页面卷动，定义一个变量，`scrolled` 等于 `html.scrollTop` 除以 `html.scrollHeight` 减去 `html.clientHeight`。

这样会得出一个由 `0` 至 `1` 之间的值，页面卷动到最顶时是 `0`，卷动到最底时是 `1`。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9gFB0Zgqwa11v1ia1Ce4BeYQat8S1ics6iaVTxnQD8loOwSM7v2rELLWCg/640?wx_fmt=png)

接下来要将每一个 `<li>`，一个接着一个，将 `--progress` 设定为 `1`。

新增一个 `for of` 回圈，将每一个 `<li>` 获取出来，由于动画是一个接着一个，而页面卷动了多少可以经由 `scrolled` 获取，所以我们要计算每一个 `<li>` 在 `0` 至 `1` 之间的所属区间。

定义一个名为 `total` 的变量，将 `1` 除以 `<li>` 的总数，然后计算两个值，一个是 `start`，将 `total` 乘以 `index`，另一个是 `end`，将 `total` 乘以 `index` 加 `1`，通过 `console.log()`，将每一个 `<li>` 的区间输出一下看看。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9IdibSLoGHRyrgfiaId9EIW7BlkPAL36IINj3UibRaUqMFAmoC8sM7zKRw/640?wx_fmt=png)

有了这些资料，我们可以计算每一个 `<li>` 的 `--progress` 的值了。定义变量 `progress`，将 `scrolled` 减 `start` 除以 `end` 减 `start`；然后如果 `progress` 大于等于 `1` 的话，将 `progress` 设定为 `1`；少于等于 `0` 的话，就设定为 `0`。

最后，将 `progress` 的值通过 `setProperty` 设定到 `<li>` 上。

![](https://mmbiz.qpic.cn/mmbiz_png/zPh0erYjkib0w2JsByBQsBGyXRYKa3YM9lfYvpDIuia0Fd9nmB8ZHHPIOkuL7uiczwEwCYgicMKsEUibesaUESF4S4Q/640?wx_fmt=png)

我们来看看这个案例的完成效果
--------------

[视频详情](javascript:;)

以上，就是今集要介绍的全部内容。  

这个案例的源代码在：https://codepen.io/stevenlei/pen/ExydYqp

- EOF -

推荐阅读  点击标题可跳转

1、[一次关于 Vue 的自我模拟面试](http://mp.weixin.qq.com/s?__biz=MjM5OTA1MDUyMA==&mid=2655458468&idx=4&sn=13e75c28337ddf960f2ed12cd57e7fd0&chksm=bd72d8d38a0551c520a91f34fc77d7451266560d2ca4b3598876170430035c03e833670bc319&scene=21#wechat_redirect)

2、[基于 Vue 的前端架构，我做了这 15 点](http://mp.weixin.qq.com/s?__biz=MjM5OTA1MDUyMA==&mid=2655457576&idx=4&sn=6d1d5c5abe2aad644bd1a49f6a8629b0&chksm=bd72dd5f8a05544975b14a82f8cf3f1838bfee591b05dd4ad3b4ca74f70854795e8309316b90&scene=21#wechat_redirect)

3、[分享 8 个非常实用的 Vue 自定义指令](http://mp.weixin.qq.com/s?__biz=MjM5OTA1MDUyMA==&mid=2655457518&idx=4&sn=9fe808ff99169ee9b1da9efb8c29e1fc&chksm=bd72dc998a05558f97224fd80dcd4cf1e7edc098541d1637b8ac683da5b053b60c889c995886&scene=21#wechat_redirect)

关注「程序员的那些事」加星标，不错过圈内事  

![](https://mmbiz.qpic.cn/mmbiz_png/2A8tXicCG8ylBdiap3J3SwP0ianxOhYKCBYY75PlXmINda18ybIrkfxbRT4jhBBtSu3k1qbwdHUArhNOIKsnQgJMg/640?wx_fmt=jpeg)

点赞和在看就是最大的支持❤️