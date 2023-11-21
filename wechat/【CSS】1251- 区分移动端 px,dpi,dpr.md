> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PwulLAb5h7ONkjcIaOFFZw)

  
前言
-----

移动端开发的时候，我们拿到的 `UI设计稿` 通常都是 `640px` 或者是 `750px` , 明明我们的 `设备视口宽度` 是设计稿的 `一半` , 这是为什么呢？

经常听到设计同学说，你这图片在 `苹果手机上看有点糊啊` ，为什么我们开发的时候图片显示正常，到了 `真机` 就不一样了呢？

带着这两个问题，我们来学学本章移动端的一些 `概念` 吧

设备像素（dpi）
---------

> ❝
> 
> 设备像素（Device Pixels，简写 DP）：又称 `物理像素` ，是设备能控制显示的 `最小单位` ，我们可以把它看做显示器上的一个点。我们常说的 1920x1080 像素分辨率就是用的 `设备像素单位`
> 
> ❞

注意设备像素表示屏幕上可以铺多少个点点，而不是一个绝对长度单位（例如`in`,`mm`），因为我的点点和你的点点大小不一样

了解了 `设备像素概念` , 回过头来想想我们 `750px` 的 UI 设计稿，它的 `单位` 跟我们平时网页布局中的 `CSS单位` 一致吗?

答案是否定的，实际上 UI 设计稿的像素就是设备像素，它是按照设备像素来的

分辨率
---

> ❝
> 
> 分辨率（Resolution）也是一个物理概念，`含义要看对谁`
> 
> ❞

*   对于屏幕，`分辨率一般表示屏幕上显示的物理像素总和`。比如，我们说 iPhone6 屏幕分辨率是`750x1334px`
    
*   对于图像，概念等同于图像尺寸、图像大小、像素尺寸 等等。比如，我们说`20x20px`的 icon
    

其实严格来说，图像分辨率的单位是 ppi（Pixels Per Inch），对于一个图片文件，其像素尺寸是一定的，可能含有来自相机的 meta 信息，比如分辨率`200ppi`，该值只是个建议值，图片显示出来我们看到的尺寸由屏幕像素密度决定，像素密度越高，图片看起来越小

### 设备独立像素 (density-independent pixel)

**「设备独立像素」**(也叫密度无关像素)，可以认为是计算机坐标系统中得一个点，这个点代表一个可以由程序使用的虚拟像素 (比如: `css像素` )，有时我们也说成是**「逻辑像素」**

在 CSS 规范中，长度单位可以分为绝对单位和相对单位。`px`是一个 `相对单位` ，相对的是 `设备像素（Device Pixels）` 。比如 iPhone5 使用的是 Retina 视网膜屏幕，用`2x2`的 Device Pixel 代表`1x1`的 CSS Pixel，所以设备像素数为`640x1136px`，而 CSS 逻辑像素数为`320x568px`

所以，1 个 CSS 像素在不同设备上可能对应不同的物理像素数，这个比值是设备的属性（Device Pixel Ratio，设备像素比）

设备像素比（dpr）
----------

设备像素比缩写为 DPR 或者 DPPX，如下：

*   Device Pixel Ratio: Number of device pixels per CSS Pixel
    
*   Dots Per Pixel: the amount of device pixels per CSS pixel (e.g. in Retina displays this will be 2).
    

一般我们说 DPR，wiki 定义：

> ❝
> 
> Device pixel ratio, the ratio between physical pixels and logical pixels used by cascading style sheets (CSS): other names for it are “CSS Pixel Ratio” and “dppx”
> 
> ❞

所以，设备像素比表示 1 个 CSS 像素（宽度）等于几个物理像素（宽度）：

```
DPR = 物理像素数 / 逻辑像素数 // 在某一方向上，x方向或者y方向
```

比如：iPhone6 的 `dpr为2` ，物理像素 750（x 轴）, 则它的逻辑像素为 375

也就是说，1 个逻辑像素，在 x 轴和 y 轴方向，都需要 2 个物理像素来显示，则如图：

![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSSAAbONH5icIRzpgHsgNH8zQGqwvpRLl465k8a9td2CTbUCCabTSajeU2FRy7RpUTibUCe4RR7c1ZQ/640?wx_fmt=png)

所以 `dpr=2` 时，1 个 CSS 像素由 4 个物理像素点组成（也可以这样理解 `320x568px:``640x1136px = 1:4` ）

注意 DPR 不是单位，而是一个属性名，比如在浏览器中通过`window.devicePixelRatio`获取屏幕的 DPR

为什么 iPhone6 为标准的设计稿是 750px，而不是 375px ?
--------------------------------------

目前来说，都是以 iphone6 设计稿去适配各种机型，所以讨论暂时考虑 iphone 机型，至于怎么做适配，后续章节会讨论到

上一章节我们讲过，布局视口跟理想视口的一致的时候，用户看到的效果最佳，以 iphone6 来说，他的视口宽度为 375px，视口的像素单位是逻辑像素 ，我们知道 UI 设计稿的的像素单位就是按照 `设备像素来的` , 所以按照 DPR 为 2 换算成物理像素为 `750px` ，显然没问题（PS:DPR 为 1 或者为 3 的，通常处理都是取为 2，折中处理，适应各种机型）

举个例子：

以一张 `icon` 来说，理论上，1 个 `位图像素` 对应于 1 个 `物理像素` ，图片才能得到完美清晰的展示，那么假设 375px 设计稿的 icon 为 4040px，要渲染在 `dpr为2` 的 Retina 屏上，显然不能做到 1 个位图像素对应一个物理像素，这时候就会 `模糊` ，解决方式就是使用 `二倍图` 8080px

![](https://mmbiz.qpic.cn/mmbiz_png/ygUAW1Il7aSSAAbONH5icIRzpgHsgNH8z0b2qtGibb5X3SGbOYReic8WFRyHFU1LhnuRfmXsQh9lM2PGzWccjICLA/640?wx_fmt=png)

那么一开始就用 `750px` ，切下来的图是不是可以直接适配 Retina 屏（这也解释了为什么视觉稿的画布大小要 ×2），当然了 `375px` 也行, 不过此时我们处理 375px 设计稿的时候，认为这个单位是逻辑像素，但是有些情况却不能按逻辑像素去处理， `比如图片` ，这时候得需要设计提供 ·`二倍图` , 当然我们在 375px 设计稿量 `细边框` 的高度的时候，注意不要惯性觉得是 1px 长度，也有可能是 `0.5px` , 因为是 `375px的设计稿`