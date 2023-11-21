> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Yqc-YoYouh9WiwW7gNRj3w)

大厂技术  高级前端  Node 进阶

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

> *   原文地址：https://css-tricks.com/building-skeleton-screens-css-custom-properties/
>     
> *   原文作者：Tapas Adhikary
>     
> *   译者：阳光是 sunny
>     

1 前言
----

其实这篇文章网上已经有翻译版本，但是读起来明显是机翻的，实在是受不了，于是就用自己的理解翻译了一下

2 正文
----

项目要不要**加载 loading 状态**通常是在项目完成后才考虑的事情，当然，有时候直接就不考虑了。

开发人员的职责不只是提高性能，同时优化网络差时，请求接口缓慢导致的页面的慢渲染也是非常重要的。

3 速度的错觉
-------

随着我们对移动体验的期望的变化，我们对性能的理解也在变化。我们期望，无论当前的网络如何，web 页面都能像原生应用程序一样顺滑，一样快速响应。

**骨架屏**的出现。这个想法使得用户更有耐心，因为他们知道正在发生什么，并且在内容实际存在之前能够预测内容，那么他们会认为系统更快。这在很大程度上保持了用户等待的热情。

**骨架屏💀**

这个概念可能包括显示文本，图像或其他内容元。可以在网上可以看到骨架屏的使用已经非常广泛，Facebook，Google，Slack 等公司都在使用。

![](https://mmbiz.qpic.cn/mmbiz_png/FaeDdIfeuq69QXsE0jvV2VKQG4IJqWK0HvibIM2E4nRPGiaja4fISrmEiazdJ2YwKibV8BjYHq4ZHMDGwKvRg6g9BQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/FaeDdIfeuq69QXsE0jvV2VKQG4IJqWK0rghG8aBCWiaU9sQ4Yvp883eadotJ7zDunYwyicetiarHSRGaARibNMR8Lw/640?wx_fmt=png)

4 举个例子
------

假设你正在构建一个旅行相关的 Web 应用程序，用户可以分享他们的旅行以及推荐的地点，它的主要内容可能看起来像这样：

![](https://mmbiz.qpic.cn/mmbiz_png/FaeDdIfeuq69QXsE0jvV2VKQG4IJqWK0LLfphjRVhBdgvS2QVKO8s9dXGSLNHfibDJGt8vibq04mnnSq6d7F1E0Q/640?wx_fmt=png)

您可以将该卡片简化到其基本视觉形状（UI 组件的骨架）

![](https://mmbiz.qpic.cn/mmbiz_png/FaeDdIfeuq69QXsE0jvV2VKQG4IJqWK02eUbI2KdKgckiaUEduh4mcbicic2E8OibWia5naqr07R0Pachf0cDZtWZ3Q/640?wx_fmt=png)

每当有人从服务器请求新内容时，您可以立即开始显示骨架，同时在后台加载数据。内容准备就绪后，只需将骨架换成实际卡即可。

您可以使用图像来显示骨架，但这会引入额外的请求和数据开销。我们本身已经在这里加载了东西，所以还要去等待另一个图像先加载，这可不是一个好主意。另外图片不是响应式的，如果我们决定调整卡片的样式，我们将不得不更改骨架图像，以便它们再次匹配。😒。

一个更好的解决方案是只用 CSS 创建骨架屏。没有额外的请求，最小的开销。而且以后修改更加的方便快捷。

5CSS 中绘制骨架
----------

首先，我们需要绘制构成卡片骨架的基本形状。

我们可以通过向`background-image`属性添加不同的渐变来做到这一点。默认情况下，线性渐变从上到下运行，具有不同的颜色过渡。如果我们只定义一个色标，其余的保持透明，我们就可以绘制形状。

请记住，多个背景图像在这里堆叠在一起，因此顺序很重要。最后一个渐变定义将展示在后面，最先定义的展示在前面。

```
.skeleton {  background-repeat: no-repeat;  background-image:     /* layer 2: avatar */    /* white circle with 16px radius */    radial-gradient(circle 16px, white 99%, transparent 0),    /* layer 1: title */    /* white rectangle with 40px height */    linear-gradient(white 40px, transparent 0),    /* layer 0: card bg */    /* gray rectangle that covers whole element */    linear-gradient(gray 100%, transparent 0);}
```

这些元素通过拉伸来填充整个空间，就像常规的块级元素一样。如果我们想要改变它，我们必须为它们定义明确的尺寸。background-size 的值来设置每个图层的宽度和高度，background-size 的值的顺序保持我们使用的 background-image 顺序相同

```
.skeleton {  background-size:    32px 32px,  /* 头像 */    200px 40px,  /* 标题 */    100% 100%; /* 卡片背景 */}
```

最后一步是将元素定位在卡片上。这与 position:absolute 类似，跟它的 left 和 top 属性的值一样。例如：我们可以给头像和标题 模拟 padding：24px，以匹配真实卡片的外观。

```
.skeleton {  background-position:    24px 24px,  /* 头像 */    24px 200px, /* 标题 */    0 0;        /* 卡片背景 */}
```

6 使用自定义属性
---------

如果我们想构建一些稍微复杂一点的东西，CSS 很快就会变得混乱并且很难阅读。如果将代码交给其他开发人员，他们将不知道所有这些神奇数字的来源。维护它肯定会很糟糕。

值得庆幸的是，我们现在可以使用 CSS 自定义属性, 以更简洁、对开发人员更友好的方式来编写骨架样式。

```
.skeleton {  /*    define as separate properties  */  --card-height: 340px;  --card-padding:24px;  --card-skeleton: linear-gradient(gray var(--card-height), transparent 0);  --title-height: 32px;  --title-width: 200px;  --title-position: var(--card-padding) 180px;  --title-skeleton: linear-gradient(white var(--title-height), transparent 0);  --avatar-size: 32px;  --avatar-position: var(--card-padding) var(--card-padding);  --avatar-skeleton: radial-gradient(    circle calc(var(--avatar-size) / 2),     white 99%,     transparent 0  );  /*     now we can break the background up     into individual shapes   */  background-image:     var(--avatar-skeleton),    var(--title-skeleton),    var(--card-skeleton);  background-size:    var(--avatar-size),    var(--title-width) var(--title-height),    100% 100%;  background-position:    var(--avatar-position),    var(--title-position),    0 0;}
```

这不仅更具可读性，而且以后更改一些值也更容易。另外，我们可以使用一些变量（像 --avatar-size、--card-padding 等）来定义实际卡片的样式，并始终使其与骨架版本保持同步。

添加一个媒体查询来调整不同断点的部分骨架现在也很简单：

```
@media screen and (min-width: 47em) {  :root {    --card-padding: 32px;    --card-height: 360px;  }}
```

浏览器对自定义属性的支持很好，但不是 100%。基本上，所有现代浏览器都支持，IE/Edge 有点晚了。对于这个特定的用例，很容易使用 Sass 变量添加回退。

7 添加动画
------

为了使它更好，我们可以为我们的骨架设置动画，让它看起来更像一个加载指示器。我们需要做的就是在顶层放置一个新的渐变，然后用`@keyframes`.

这是完成骨架卡外观的完整示例：

可以查看预览：https://codepen.io/mxbck/pen/EvmLVp

```
<div class="card"></div>
```

```
/* * Variables */:root {    --card-padding: 24px;  --card-height: 340px;  --card-skeleton: linear-gradient(lightgrey var(--card-height), transparent 0);    --avatar-size: 32px;  --avatar-position: var(--card-padding) var(--card-padding);  --avatar-skeleton: radial-gradient(circle 16px at center, white 99%, transparent 0  );    --title-height: 32px;  --title-width: 200px;  --title-position: var(--card-padding) 180px;  --title-skeleton: linear-gradient(white var(--title-height), transparent 0);    --desc-line-height: 16px;  --desc-line-skeleton: linear-gradient(white var(--desc-line-height), transparent 0);  --desc-line-1-width:230px;  --desc-line-1-position: var(--card-padding) 242px;  --desc-line-2-width:180px;  --desc-line-2-position: var(--card-padding) 265px;    --footer-height: 40px;  --footer-position: 0 calc(var(--card-height) - var(--footer-height));  --footer-skeleton: linear-gradient(white var(--footer-height), transparent 0);    --blur-width: 200px;  --blur-size: var(--blur-width) calc(var(--card-height) - var(--footer-height));}/* * Card Skeleton for Loading */.card {  width: 280px; //demo  height: var(--card-height);    &:empty::after {    content:"";    display:block;    width: 100%;    height: 100%;    border-radius:6px;    box-shadow: 0 10px 45px rgba(0,0,0, .1);    background-image:      linear-gradient(        90deg,         rgba(lightgrey, 0) 0,         rgba(lightgrey, .8) 50%,         rgba(lightgrey, 0) 100%      ),                          //animation blur      var(--title-skeleton),      //title      var(--desc-line-skeleton),  //desc1      var(--desc-line-skeleton),  //desc2      var(--avatar-skeleton),     //avatar      var(--footer-skeleton),     //footer bar      var(--card-skeleton)        //card    ;    background-size:      var(--blur-size),      var(--title-width) var(--title-height),      var(--desc-line-1-width) var(--desc-line-height),      var(--desc-line-2-width) var(--desc-line-height),      var(--avatar-size) var(--avatar-size),      100% var(--footer-height),      100% 100%    ;        background-position:      -150% 0,                      //animation      var(--title-position),        //title      var(--desc-line-1-position),  //desc1      var(--desc-line-2-position),  //desc2      var(--avatar-position),       //avatar      var(--footer-position),       //footer bar      0 0                           //card    ;    background-repeat: no-repeat;    animation: loading 1.5s infinite;  }}@keyframes loading {  to {    background-position:      350% 0,              var(--title-position),        var(--desc-line-1-position),      var(--desc-line-2-position),      var(--avatar-position),      var(--footer-position),      0 0    ;  }}/*  * Demo Stuff */body {  min-height:100vh;  background-color:#FFF;  display:flex;  justify-content:center;  align-items:center;}
```

### 

Node 社群  

  

  

我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js 小伙伴，如果你对 Node.js 学习感兴趣的话（后续有计划也可以），我们可以一起进行 Node.js 相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvFQgO67XibvUG5S2UMXwCghOuJvE8BFRzUXnCAfWXkU1qHld6Ly9xiarib3siaWicJWJ0U3lI8kSgD38w/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

如果你觉得这篇内容对你有帮助，我想请你帮我 2 个小忙：  

1. 点个「在看」，让更多人也能看到这篇文章

2. 订阅官方博客 www.inode.club 让我们一起成长

点赞和在看就是最大的支持