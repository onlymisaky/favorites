> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WwabyGng-NO-kJPHI2V-Qw)

在项目中，经常会碰到背景色不确定的场景，为了让内容文字足够清晰可见，文字和背景之间需要有足够的对比度。换句话说，**当背景是深色时，文字为白色，当背景是浅色时，文字为黑色**，就像这样：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSSsKCuUGj3f0WkJZKPH62fUgQf7tfteicgibr7Nc8gDeJg8GzEjibq9JFA/640?wx_fmt=jpeg)image-20221226102604970

通常这种情况，大家可能会通过 js 去计算背景色的深浅度（灰度），算法是公开的，如果已知颜色的`RGB`值，那么可以通过以下方式得到颜色灰度

```
luma = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255
```

这样可以得到一个`0~1`之间的范围值，可以根据需求，设定一个阈值，超过表示为浅色，否则为深色。

原理就是这样，这里就不多介绍了。

那么，纯 CSS 也能实现这样的效果吗？当然可以，而且实现更简单，一起看看吧

一、CSS 滤镜实现
----------

实现这个效果需要用到 CSS 滤镜。

假设有 `HTML` 是这样的

```
<div class="box">  <span class="txt">前端侦探</span></div>
```

因为要使用滤镜对文字单独处理，所以需要额外一层标签。

然后，容器和文字用同一种颜色表示，目的是**让文字颜色和背景相关联**，可以通过`currentColor`实现

```
.box{  color: #ffeb3b;  background-color: currentColor;}
```

接下来可以想一下，**如何让彩色文字变成黑白**？

提到黑白，可以想到灰度滤镜（`grayscale`），相信大家前几天都用到过，这样可以将彩色的文字转换成灰色

```
.text{  filter: grayscale(1)}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSqgiaVlZSaW8kicxVFlaQj3hRfvUmQGibeVe74mMBGRBeN80yQaXbZQibqw/640?wx_fmt=jpeg)image-20221224165239122

这样文字颜色由原来的黄绿色变成了浅灰色。

但是，**这种灰色在现在这种背景下太难看清**了，我们需要的是纯正的黑色或者白色，现在只是灰色，如何 **“加强”** 一下呢？

这时，我们可以用到对比度滤镜（`contrast`），在前面的基础上再叠加一层

```
.text{  filter: grayscale(1) contrast(999)}
```

这里的对比度给的比较大，这样就会极大的增强对比度，**黑的更黑，白的更白，如果是浅灰，那就变成白色，如果是深灰，那就变成黑色**，效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSedPaG7Cic6eqzQuIymRu4xoaCm2IIdIZB3wK07PXuWLLITbnbdF4UWg/640?wx_fmt=jpeg)image-20221224165207221

这样能还不太明显，我们把背景色换一下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSX2Ck6jiaqViandsib3yRfvZymJAHjdjPGX00g0lxbNVD1nMvY9Spz4oiag/640?wx_fmt=jpeg)image-20221224155024179

最后，还差一步，由于前面的操作是将原有颜色经过滤镜转换成了和自身相对应的白色或者黑色，但是是相反的，所以需要用到反转滤镜（`invert`），**颠倒黑白**

```
.text{  filter: grayscale(1) contrast(999) invert(1)}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSI0aWS2cVND8qTXoBhrupr6FUMnoZ4zyaWpcIcd5hovfxrocCAhsb8g/640?wx_fmt=jpeg)image-20221224155446675

下面用一张图来表示转换过程

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSwl4dicI2zcRdV8Jpicd8cQE3AARQQO0Wiay4IQYtVKvVCleQE80gKyFnw/640?wx_fmt=jpeg)image-20221224165935410

下面是任意颜色的适配效果，还是挺完美的

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSuaIibm1oggOv5epvPKT5EeTNqHgen7MqBRnsH9ricbbs9PcaWp4EPhGg/640?wx_fmt=gif)

Kapture 2022-12-23 at 14.43.29

代码很简单，就这么一行

```
.text{  filter: grayscale(1) contrast(999) invert(1)}
```

完整代码可以查看以下任意链接

*   CSS auto-color (juejin.cn)[1]
    
*   CSS auto-color (codepen.io)[2]
    
*   CSS auto-color (runjs.work)[3]
    

二、CSS 其他思路
----------

除了上面这种方式，还可以通过 CSS 变量来实现，要复杂一些。

这里简单介绍一下实现思路

1.  将颜色`RGB`值拆分成 3 个独立的 CSS 变量
    
2.  通过灰度算法，用 CSS 计算函数算出灰度
    
3.  用得到的灰度和阈值做差值，通过`hsl`模式转换成纯黑和纯白
    

有兴趣的可以参考张鑫旭老师的这篇文章：CSS 前景背景自动配色技术简介 [4]，可以看到，整体实现和 js 逻辑几乎是一致的，下面是完整实现

> 另外可以参考之前这篇文章：[**CSS 变量自动变色技术**](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484975&idx=1&sn=6b254c61413be18105518a85c88dde85&chksm=97c665e0a0b1ecf649e6901b4bf6eb296108275725e4724be3090ed9507ffb0c6f0919d079f3&scene=21#wechat_redirect)

```
:root {  /* 定义RGB变量 */  --red: 44;  --green: 135;  --blue: 255;  /* 文字颜色变色的临界值，建议0.5~0.6 */  --threshold: 0.5;}.btn {  /* 按钮背景色就是基本背景色 */  background: rgb(var(--red), var(--green), var(--blue));  /**    * 使用sRGB Luma方法计算灰度（可以看成亮度）   * 算法为：   * lightness = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255  */  --r: calc(var(--red) * 0.2126);  --g: calc(var(--green) * 0.7152);  --b: calc(var(--blue) * 0.0722);  --sum: calc(var(--r) + var(--g) + var(--b));  --lightness: calc(var(--sum) / 255);    /* 设置颜色 */  color: hsl(0, 0%, calc((var(--lightness) - var(--threshold)) * -999999%));}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSyhz2JiclbvFCKMwT7MZ9ssW4UWkVfDggz0XRuzWP9GL0nnxzcibIHwog/640?wx_fmt=gif)auto-color-button.gif (228×225) (zhangxinxu.com)

相比前面的实现而言，实现更加灵活，可以少一层标签。

另外，CSS 正在起草一个颜色对比函数`color-contrast`，可以从几个颜色中自动选择对比度最高的那个，实现是这样的

```
.text-contrast-primary {  color: color-contrast(var(--theme-primary) vs white, black);}
```

不过，现在还没有任何浏览器支持。

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSsdqFhfiaWvX5fZJpvM17sbBs5rDrYlNon7zr6HhQUgWCrrNaMibDmEibg/640?wx_fmt=jpeg)image-20221224174008923

如果将来支持了，这将是终极解决方案。

三、优缺点总结
-------

总的来说，在`color-contrast`函数支持之前，我更推荐 CSS 滤镜方式，有以下几点好处

1.  代码简洁，就一行代码，3 个滤镜
    
2.  对颜色格式无任何要求，无需转换成 `RGB`模式
    
3.  无需了解颜色算法，对设计更为友好
    

当然，也是存在一些缺点

1.  需要单独一层标签，使用场景可能有限制
    
2.  对颜色敏感度较高，不然无从下手
    
3.  颜色转换有限制，最终只能是黑白，其他颜色就无能为力了
    

下面来回顾一下用到的 3 个滤镜，总结一下

1.  灰度滤镜（`grayscale`），可以将彩色的文字转换成灰色
    
2.  对比度滤镜（`contrast`），可以极大的增强对比度，黑的更黑，白的更白，如果是浅灰，那就变成白色，如果是深灰，那就变成黑色
    
3.  反转滤镜（`invert`），可以翻转颜色，颠倒黑白
    

重新体会颜色转换过程

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtKmn6wDtG9JSbDYFWdJ6WlSwl4dicI2zcRdV8Jpicd8cQE3AARQQO0Wiay4IQYtVKvVCleQE80gKyFnw/640?wx_fmt=jpeg)image-20221224165935410

你记住了吗？最后，如果觉得还不错，对你有帮助的话，欢迎**点赞、收藏、转发❤❤❤**

### 参考资料

[1]

**CSS auto-color (juejin.cn):** _https://code.juejin.cn/pen/7180639403566448698_

[2]

**CSS auto-color (codepen.io):** _https://codepen.io/xboxyan/pen/bGjVbGj_

[3]

**CSS auto-color (runjs.work):** _https://runjs.work/projects/bb844abe80da401d_

[4]

**CSS 前景背景自动配色技术简介:** _https://www.zhangxinxu.com/wordpress/2018/11/css-background-color-font-auto-match/_