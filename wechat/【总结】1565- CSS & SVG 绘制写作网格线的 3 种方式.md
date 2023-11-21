> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/KAQIDAPozVrCZaaUGjURyw)

- 最近有同事问我这样一个问题：需要绘制一个自适应文本的写作网格线，设计稿是这样的

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3K0BGzt0fEG5Ir1gTCzfm8NobRAdOfMZMHwZoWyicQONyqcKibtVrAlpsQ/640?wx_fmt=jpeg)

写作网格

其实就是一行行虚线，要求如下

1.  虚线的纵向间隔要跟随行高自适应，确保文本在每一栏虚线上
    
2.  虚线后面的背景是动态的，可以是纯色，可以是渐变，也可以是图片
    

绘制这样的虚线，看似容易，其实暗藏玄机，下面一起看看有哪些实现方式吧

一、纯色背景下的虚线
----------

首先来看这种简单情况，大可以通过两层渐变覆盖的方式实现。

假设文本行高是`2`，先绘制水平方向的

```
body{  background: linear-gradient(#666 1px,transparent 0) 0 -1px/100% 2em;}
```

注意，这里的背景尺寸是`100% 2em`，高度跟随文字行高，所以高度是`2em`，效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KALS49lCkwKC5IbzOyJlibPTqdo8SgqLxyG7FoNcfIhEWibNs98TumELQ/640?wx_fmt=jpeg)

image-20230107123706296

然后，绘制纵向的实线，盖在上面，为了区分，先用一个浅红色来代替

```
body{  background: linear-gradient(to right, #ffdbdb 4px,transparent 0) 0 -4px/8px 100%,  /*垂直*/    linear-gradient(#666 1px,transparent 0) 0 -1px/100% 2em; /*水平*/}
```

这样就绘制了一个垂直平铺，间隔为`4px`的虚线，效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KIQ6cu6rVEvxssXI8fMrDvpD9F5bViakfVZg9v89vBMJ6SUZicT7rAiabQ/640?wx_fmt=jpeg)

image-20230107124100696

应该比较好理解吧，就是两个方向上的渐变叠加

然后，将这个红色改成和底色相同的颜色就行了，比如这里是白色

```
body{  background: linear-gradient(to right, #fff 4px,transparent 0) 0 -4px/8px 100%,  /*垂直*/    linear-gradient(#666 1px,transparent 0) 0 -1px/100% 2em; /*水平*/}
```

这样就实现了纯色下的虚线网格，效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KNPicKlm0mnJZyx8uzkz7LstIQELZiasaIa6AMXia7pJQdMUrn3wc7vLdQ/640?wx_fmt=jpeg)

image-20230107124753657

二、渐变背景下的虚线
----------

如果不是纯色，而是渐变的呢？假设有一个这样的背景

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KHiciat62VcafGaEicN7sx06qY0ppmWvt7R4YgxDaG03iauVGX5wBt5icuJw/640?wx_fmt=jpeg)

image-20230107132634345

如果直接用前面的方式，可能就变成了这样

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3Kdk5AuabKhJD4CDYkwdFGBqwGw8Fu1ZibFqVvslgv7RZ8ZP18f2goO6Q/640?wx_fmt=jpeg)

image-20230107132719347

白色直接把背后的渐变背景也覆盖了。

那如何解决这个问题呢？

像这种叠加混合的情况一般都会想到混合模式，没错，这里也可以通过混合模式简单处理。要用混合模式，必须要让这两层背景处于不同的容器中，然后使用`mix-blend-mode`

```
html{  background: linear-gradient(45deg, #f5ffc0, #fff);}body{  font-size: 20px;  background: linear-gradient(to right, #fff 4px,transparent 0) 0 -4px/8px 100%, linear-gradient(#666 1px,transparent 0) 0 -1px/100% 2em;  mix-blend-mode: darken;}
```

这里使用了混合模式中的`darken`，这种模式可以去除白色部分，保留其他，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3Kbct4o3nJP55ibs39llWT5kvibxibzazSsTphZmMjpsBic4W4uxDNtOk8Ew/640?wx_fmt=gif)

Kapture 2023-01-07 at 13.34.39

完整代码可以查看以下任意链接

*   CSS dot line mix-blend-mode (juejin.cn)[1]
    
*   CSS dot line mix-blend-mode (codepen.io)[2]
    
*   CSS dot line mix-blend-mode (runjs.work)[3]
    

三、通过锥形渐变绘制
----------

下面再介绍一个比较硬核的绘制方式：锥形渐变（conic-gradient）[4]

为什么说比较硬核呢？因为这种方式绘制出来的图形就是完完全全的虚线，也没有混合模式的诸多限制。

首先我们从图形上分析，找到最小的重复单元，如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3Km454mY5RRI3Gic5VSdsbMzaHedWuEOprY84uqxk8LHX7RNqX9ib8RYYQ/640?wx_fmt=jpeg)

image-20230107134840168

找到了，就是这个，其实就是这个位于左上角的矩形，那么，如何通过锥形渐变来绘制呢？

> **注意：**有同学可能会奇怪，这样一个矩形线性渐变不是可以很轻松的实现吗？确实可以，但是只能实现一个，无法平铺

看着好像不沾边，下面带你一步步演变

首先是最原始的语法

```
div{  background: conic-gradient(#666, transparent);}
```

这是一个从透明到灰色的渐变，效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KrZW7N4AltIIAHdnv1dQf2bDwfMFg8ByqcVhkZOQYATibTBh5KFoqTibQ/640?wx_fmt=jpeg)

image-20230107135715745

这才是锥形渐变的样子！

然后，我们可以将渐变的分界线调整一下

```
div{  background: conic-gradient(#666 90deg, transparent 0deg);}
```

这样就变成了一个边界分明的正方形

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KGOFb5z9oRwlQZ5pQBbNCZLxjTfBXCibVKL53RVUibjOz5dJryicCvUmNA/640?wx_fmt=jpeg)

image-20230107135837729

然后改变起始角度，通过`from`关键词

```
div{  background: conic-gradient(from 270deg, #666 90deg, transparent 0deg);}
```

这样起始角度就会从`270deg`的地方开始，如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KCRibtT5AlByXazooo2PfAnDJBezpv1OlTTm3jCyco2iahW55kOPeOC3g/640?wx_fmt=jpeg)

image-20230107140009058

接着，改变中心点的位置，默认是水平垂直居中的，我们要改到左上角，需要用到`at`关键词

```
div{  background: conic-gradient(from 270deg at 40px 10px, #666 90deg, transparent 0deg);}
```

这里改成了左上角`40px,10px`的地方，如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3Kiba6TMBHvRWu81gCt7iajZ4vJNa8XuCKveCmwqhMGT5GrJC1qicHPoQjQ/640?wx_fmt=jpeg)

image-20230107140245521

最后，改变背景的尺寸，默认是宽高`100%`的，我们要改成实际需要的大小

```
div{  background: conic-gradient(from 270deg at 40px 10px, #666 90deg, transparent 0deg);  background-size: 80px 90px;}
```

这样就会自动平铺展开，如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3K4JibPyB8sL4p2S8zEcmZffhvSLgRF3IH0zgvTMexkNiciaUcYdBVTpwsA/640?wx_fmt=jpeg)

image-20230107140552737

原理就是这样，实际上的虚线比较小，应该是`4px 1px`，所以实际应用应该是这样

```
div{  background: conic-gradient(from 270deg at 4px 1px, #666 90deg, transparent 0deg);  background-size: 8px 2em;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KNRMxFTiaLhrBNqTpoiaSzRaVx2zp3sqf3e4bmYUpM3roRlRCG6FQVkeg/640?wx_fmt=jpeg)

image-20230107140858395

完整代码可以查看以下任意链接

*   CSS dot-line conic-gradient (juejin.cn)[5]
    
*   CSS dot-line conic-gradient (codepen.io)[6]
    
*   CSS dot-line conic-gradient (runjs.work)[7]
    

四、动态 SVG 背景绘制
-------------

最后再来介绍一个实现起来最容易的方式，就是 “切图”。

但是，这种 “切图” 不同于一般的切图，因为这个尺寸是动态的，要跟随文字的行高变化而变化，所以需要采取一定的“手段”。

首先在绘图软件中绘制这样一个图形，例如下面是`figma`中绘制的

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KwGERyZQpmIb2ey3kEoy00CEcVvicu0YoFibAYczh2fln5ke0rOBgMLYQ/640?wx_fmt=jpeg)

image-20230107142419873

外面的宽高无所谓，随便设置。可以得到这样一段`SVG`

```
<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">  <rect width="10" height="10" fill="none"/>  <rect width="5" height="1" fill="#D9D9D9"/></svg>
```

然后，我们将这个`svg`转换成内联 `CSS`格式

> 推荐张鑫旭老师的在线转换工具：SVG 在线压缩合并工具 [8]

直接用到背景上

```
body{  font-size: 20px;  background: url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h10v10H0z'/%3E%3Cpath fill='%23D9D9D9' d='M0 0h5v1H0z'/%3E%3C/svg%3E") 0 0/10px 2em;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KmLZdNKteqEODcvzRBe6X3s6dwiaXsbic7MYa1E8nZp30bvad8CMp10ibA/640?wx_fmt=jpeg)

image-20230107144335422

为啥这里的虚线都错位了呢？

这也是 `SVG`不同于常规图片的一点，在外部背景尺寸超过`viewbox`尺寸后，`SVG` 画布会整体缩放，但是具体的元素并不会，具体表现是这样的

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3K1ib4rvJoN3wkQhichg0CpGbf0UVCP37VAQaHKKohtAVx0ASEn8bkxczQ/640?wx_fmt=jpeg)

image-20230107144631500

那么，有没有办法在画布缩放的时候，里面的元素仍然位于左上角呢？就像这样

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KiagkWcUEn1gicOicf4ib3U0d7sUsuh9HuwRHxTpKN2MdAb2AG97XibtoCBQ/640?wx_fmt=png)image-20230107150206234

当然也是可以的，只需要将`viewbox`改为`0 0 100% 100%`就行了，或者干脆删除（默认就是 100%），`SVG`的宽高也要改成`100%`，如下

```
<svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">  <rect width="10" height="10" fill="none"/>  <rect width="5" height="1" fill="#D9D9D9"/></svg>
```

这样一来，不管背景尺寸如何变化，内部的虚线位置都不受影响，效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KmTb83TADJQVKql4RcyjYwVWEkN3aicnqvGmneo5r1yrLgKYK0FtNicKA/640?wx_fmt=jpeg)

image-20230107150539926

完整代码可以查看以下任意链接

*   svg dot-line (juejin.cn)[9]
    
*   svg dot-line (codepen.io)[10]
    
*   svg dot-line (runjs.work)[11]
    

除了上面这种方式，还可以换一种思路，让默认的虚线是居中的，这样在放大后也是居中的，如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQrm4CibEJFnpDDiaCQaxt3KgmsVTHZD08iaHgW16w8xTBRiaaHKN03B2Y8M7Lq76Z4c7pmVbwoLiaW9g/640?wx_fmt=jpeg)

image-20230107152928704

这样在不改变`viewbox`的情况下也能实现相同的效果，有兴趣的小伙伴可以下去试一试

五、总结一下优缺点
---------

以上共介绍了 3 种完全不同的绘制虚线的方式，原理各不相同，也有各自的优缺点，下面总结一下

**CSS 渐变混合模式**的优点在于实现思路比较简单，很容易想到，纯色背景优先推荐，缺点是混合模式有一些局限性，比如在黑色背景下可能需要换一种模式了

**CSS 锥形渐变**的优点在于代码实现简单，不受结构限制，缺点是有点不好理解，还有就是兼容性稍微差一些

**SVG 自适应背景**的优点在于使用简单，基本等同于 “切图”，缺点是需要掌握 SVG 的特性，而且无法直接通过 CSS 改变颜色，只能换图

综合来讲，如果兼容性没有要求，首推第 2 种方式，其次是 SVG 方式，最后才是混合模式

这几种方式你学会了吗？最后，如果觉得还不错，对你有帮助的话，欢迎**点赞、收藏、转发❤❤❤**

### 参考资料

[1]

**CSS dot line mix-blend-mode (juejin.cn):** _https://code.juejin.cn/pen/7185780439276060730_

[2]

**CSS dot line mix-blend-mode (codepen.io):** _https://codepen.io/xboxyan/pen/ExpNBPr_

[3]

**CSS dot line mix-blend-mode (runjs.work):** _https://runjs.work/projects/a0ec6e9e89f943a2_

[4]

**锥形渐变（conic-gradient）:** _https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient_

[5]

**CSS dot-line conic-gradient (juejin.cn):** _https://code.juejin.cn/pen/7185788769595818042_

[6]

**CSS dot-line conic-gradient (codepen.io):** _https://codepen.io/xboxyan/pen/GRBNbEN_

[7]

**CSS dot-line conic-gradient (runjs.work):** _https://runjs.work/projects/dc01e87b2c62426b_

[8]

**SVG 在线压缩合并工具:** _https://www.zhangxinxu.com/sp/svgo/_

[9]

**svg dot-line (juejin.cn):** _https://code.juejin.cn/pen/7185803705722077219_

[10]

**svg dot-line (codepen.io):** _https://codepen.io/xboxyan/pen/eYjBwxa_

[11]

**svg dot-line (runjs.work):** _https://runjs.work/projects/c725bbf1830743b6_

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)