> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/cQKpKvsSVEtcH7E-YHcGMw)

今天来分享一个比较有意思的图片 hover 效果，如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLRtmltolqCbDePdz144BzvRBkUGCLaXUy3QZVHUJ2ArUUuC6udia6xffLNmIibnmjpiczTgaIJDby9g/640?wx_fmt=gif)Kapture 2023-05-13 at 23.51.16

> 案例来源于 https://codepen.io/t_afif/details/abRWELR[1]，略有修改

仔细观察，这个效果主要有两个要点

1.  图片被切割成多个矩形
    
2.  每个矩形会旋转 90 度
    

那么，这个是如何实现的呢？花几分钟时间一起看看吧

一、分割的矩形
-------

假设`HTML`是这样的，很简单，就一个图片

```
<img src="xxx.jpg" alt="xxx">
```

然后，我们需要一个变量，来控制分割的数量，比如`2`表示`2*2`，这里可以用 CSS 变量

```
img{  --n: 4; /*横纵分割的数量*/}
```

那么，如何来切割呢？

提到**切割**，可以想到**镂空**，进而可以想到**遮罩**（CSS Mask）。关于遮罩，这个技巧非常实用，之前在多篇文章中都有用到

*   [CSS 如何实现羽化效果？](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247486560&idx=1&sn=0b46e57c42eb40e1e052f32748050ca2&chksm=97c66fafa0b1e6b988019f8dd85c236ccd5ee90de64d538b701712e6ba466e21086a188e7cec&scene=21#wechat_redirect)[2]
    
*   [别用图片了，CSS 遮罩合成实现带圆角的环形 loading 动画](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487209&idx=1&sn=48042103f1fc1b8c1cdba4cd7efbff77&chksm=97c66d26a0b1e430fb6711e1d0aaf052ee55e00a63b9100bff9582267446c5870585c3e0f51e&scene=21#wechat_redirect) [3]
    
*   [CSS mask 实现鼠标跟随镂空效果](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484774&idx=1&sn=4871821a1576f233e6a1a3d54f36ea15&chksm=97c666a9a0b1efbfb046886dd34a936dcca0250c80427a0f812eee4b82464fd5f9c3ab4de25d&scene=21#wechat_redirect) [4]
    
*   [CSS 实现 Chrome 标签栏的技巧](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484411&idx=1&sn=0ccba952f97381e58bc2149279fac58e&chksm=97c66034a0b1e922a48f0dc9ff37f43a8464bdf4e34efe6ee4002a7512da727b861d584aeb84&scene=21#wechat_redirect) [5]
    
*   [CSS 实现优惠券的技巧](http://mp.weixin.qq.com/s?__biz=MzU4MzUzODc3Nw==&mid=2247484348&idx=1&sn=7a7d135d1f60d1bd8cc218c4813574ff&chksm=fda6c28acad14b9c1af961585fba9598a37121396f79f7ff4c1f5793033420ba658597ceeb53&scene=21#wechat_redirect) [6]
    

原理很简单，**最终效果只显示不透明的部分，透明部分将不可见，半透明类推**，例如

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144BzvNbMkJpAVLgo9yG9C3LRD3h3qxTicof7CGppmSw0gVY4TqU67S9uuyqQ/640?wx_fmt=png)image-20230514003121232

在这里，我们可以通过类似背景平铺的方式，来将一个完整的图片切割成`n*n`个矩形，如下

```
img{  --n: 4;  -webkit-mask: radial-gradient(black, transparent);  -webkit-mask-size: calc(100% / var(--n)) calc(100% / var(--n));}
```

这里用了一个径向渐变做了遮罩图片，遮罩尺寸是`100% / var(--n)`，刚好将完整的图片分成了`n*n`份，效果如下，分别是`2*2`和`4*4`的效果

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144Bzv78MNmx6ClTicEXxXtZQX7VjOKFsRibaCS1tGMMBrsZhCnkGgK16yicHvQ/640?wx_fmt=png)image-20230514002213657

这就是分割的原理了

二、旋转的矩形
-------

那么，问题来了，这里是背景层，并没有`rotate`这样的属性，如何让一个矩形旋转呢？或者说，如何绘制一个倾斜的矩形呢？

下面就来一步一步实现。

> 由于遮罩和背景的语法基本一致，为了方便调试，可以先用背景代替

大家都知道，线性渐变是可以设置角度的，为了计算方便，我们可以用 CSS 变量来表示

```
div{  --r: 45deg;  background: linear-gradient(var(--r), red, orange)}
```

这样可以得到一个`45deg`的渐变

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144BzvibUYrxia79BWGHazzv1JKmibvuNXkvlEKeo1Tz2wdQic0XbWKbIfibMiceUw/640?wx_fmt=png)image-20230514005613500

然后，我们可以将这个渐变改成透明→纯色→透明的渐变

```
div{  --r: 45deg;  background: linear-gradient(var(--r), transparent 5%, orange 0 95%, transparent 0)}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144BzvWGw9mibK5qXSuY5FQibqdaJWKibYZ9PXkK3rJSVehPxicYUZTjYWRdS3Pw/640?wx_fmt=png)image-20230514010411999

为了计算方便，可以将**透明的比例**用 CSS 变量来表示

```
div{  --r: 45deg;  --d: 30%;  background: linear-gradient(var(--r), transparent var(--d), orange 0 calc(100% - var(--d)), transparent 0)}
```

下面是`30%`的效果

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144Bzvs5uNxPfJsXBJo8iaJG19COmKtRVia5sElOZ9H4xN6awMMBrmSFiaI4ggQ/640?wx_fmt=png)image-20230514010700684

接下来，用同样的方式绘制和这个垂直的图形，也就是角度相差`90deg`

```
div{  --r: 45deg;  --d: 30%;  background: linear-gradient(var(--r), transparent var(--d), orange 0 calc(100% - var(--d)), transparent 0),    linear-gradient(calc(var(--r) + 90deg), transparent var(--d), red 0 calc(100% - var(--d)), transparent 0),}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144BzvoUr4FW5PXVic7bmlDRkKgpy4WonEvGnUd6HRicycp5SzvFAaXCxIGUHQ/640?wx_fmt=png)image-20230514011045132

注意观察，两个**重叠的部分**不就是一个旋转`45deg`的矩形吗？如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144Bzv47TPZcChIDyOZQwujbtoKL3EHicdsI3wcicQs8C2frLHgY45frMAj6tA/640?wx_fmt=png)image-20230514011432213

可以任意改变角度

```
div{  --deg: 15deg}
```

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144BzviaP07bCtwghbwum0cY7CZkN4W67dEK9nTwG565YrkFegX5AUVD7Qtqw/640?wx_fmt=png)image-20230514011628619

下面改变背景尺寸，变成`4*4`的效果

```
div{  background-size: 50% 50%}
```

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144Bzvwicrh0kBnkBNE8fXbsWVRhQqMD5PaP9nooxQD3avhRNEY9SPXgSzicdw/640?wx_fmt=png)image-20230514011752631

是不是和我们想要的效果有点相似呢？下面将背景用做遮罩

```
img{  --r: 30deg;  --d: 30%;  -webkit-mask:    linear-gradient(var(--r), transparent var(--d),red 0 calc(100% - var(--d)), transparent 0),    linear-gradient(calc(var(--r) + 90deg), transparent var(--d), red 0 calc(100% - var(--d)), transparent 0);  -webkit-mask-size: calc(100%/var(--n)) calc(100%/var(--n));}
```

变成了这样

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144Bzvj0icNXFF2HV2jydQPILce7QdicjnKWXrq3icOF3q8HoFLmVvfWw08esew/640?wx_fmt=png)image-20230514012303091

是不是很凌乱？这是因为现在的遮罩还是直接叠加的，并不是只显示重叠部分，可以设置遮罩合成`mask-composite`，也就是将图形进行布尔运算，得出我们想要的图形，这里简单介绍一下

> mask-composite - CSS: Cascading Style Sheets | MDN (mozilla.org)[7]

```
/* Keyword values */mask-composite: add; /* 叠加（默认） */mask-composite: subtract; /* 减去，排除掉上层的区域 */mask-composite: intersect; /* 相交，只显示重合的地方 */mask-composite: exclude; /* 排除，只显示不重合的地方 */
```

相信在很多图形设计软件中都见到类似的操作（下面是 photoshop）

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144BzvDoaf57ohSbZMgHl73IicD0xnrMoAT6xOib7Zk11zKcSG7XRYUa2TsYjA/640?wx_fmt=png)image-20230514111827144

这些是标准属性，Chrome 还不支持，可以用带前缀的属性 -webkit-mask-composite[8] ，但是值和上面这些不同，非常多，主要有这些

```
-webkit-mask-composite: clear; /*清除，不显示任何遮罩*/-webkit-mask-composite: copy; /*只显示上方遮罩，不显示下方遮罩*/-webkit-mask-composite: source-over; /*叠加，两者都显示*/-webkit-mask-composite: source-in; /*只显示重合的地方*/-webkit-mask-composite: source-out; /*只显示上方遮罩，重合的地方不显示*/-webkit-mask-composite: source-atop;-webkit-mask-composite: destination-over; /*叠加，两者都显示*/-webkit-mask-composite: destination-in; /*只显示重合的地方*/-webkit-mask-composite: destination-out;/*只显示下方遮罩，重合的地方不显示*/-webkit-mask-composite: destination-atop;-webkit-mask-composite: xor; /*只显示不重合的地方*/
```

回到这里，我们想要得到两者重叠的部分，所以可以

```
-webkit-mask-composite: source-in;
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLRtmltolqCbDePdz144BzvkaNiaFB68nODz4ZWYNoiaPPkpKwot6DSEKqhz6ga2qWs0icib4ic6ahOqSg/640?wx_fmt=gif)Kapture 2023-05-14 at 11.22.46

三、动画
----

最后就是动画了。

我们需要在`hover`的时候，将矩形旋转`90deg`，可以直接改变`--r`这个变量

```
img{  --r: 0deg;}img:hover{  --r: 90deg;  transition: 0.5s;}
```

但是，仅仅这样是没有动画的，因为`--r`并不是一个合法的、可以过渡的属性

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLRtmltolqCbDePdz144Bzvs3ZrQt9Y6RZ5qwn5ccNeSzNK6FtFmjWLKVDwNTkHEc6Bo8E2n5MJvg/640?wx_fmt=gif)Kapture 2023-05-14 at 11.39.08

这时可以用到 CSS @property[9]。可以让任意变量像颜色一样进行支持过渡和动画

```
@property --r {   syntax: "<angle>";   initial-value: 0deg;   inherits: false;}
```

现在就有过渡效果了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLRtmltolqCbDePdz144BzvSdPCMxNBVwYjejQ3DamMOdFUicVOCH2RaicyiaEgErDpTQII9gibwwId3A/640?wx_fmt=gif)Kapture 2023-05-14 at 11.43.12

现在还有一个问题，空隙太大了，还需要改变`--d`的大小，起始点应该是`0%`，在中间`45deg`时最大，也就是 0%→20%→0%，可以用`animation`实现

```
@keyframes d {  0%,100%{    --d: 0%  }  50%{    --d: 20%  }}img:hover{  --r: 90deg;  transition: 0.5s;  animation: d .5s;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLRtmltolqCbDePdz144BzvAbibxbl9NwYQiahEpqibMnecD29D1Y4JvrRiagEZzcoYyEPyRWNZrX12zA/640?wx_fmt=gif)Kapture 2023-05-14 at 11.47.46

当然还可以将这个过渡和动画写在一个动画里

```
@keyframes r {  0%{    --d: 0%  }  100%{    --d: 0%;    --r: 90deg  }  50%{    --d: 20%  }}img:hover{  animation: r .5s;}
```

这样也能实现相同的效果，下面分别是`2*2`、`4*4`、`6*6`的效果

```
<img src="xxx.jpg" alt="xxx" style="--n:2"><img src="xxx.jpg" alt="xxx" style="--n:4"><img src="xxx.jpg" alt="xxx" style="--n:6">
```

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtLRtmltolqCbDePdz144BzvaX7FZSf9JRIZp0vb6Qu0gJAxX6R5cmTwhHn0Q9fUUS7efz4rqSDxXA/640?wx_fmt=gif)

Kapture 2023-05-14 at 11.59.52

完整代码可以查看以下任意链接：

*   CSS img hover (juejin.cn)[10]
    
*   CSS img hover (runjs.work)[11]
    
*   CSS img hover (codepen.io)[12]
    

四、总结和说明
-------

以上就是实现的全部过程了，代码其实不多，其实主要难点在于旋转矩形的绘制，整体实现其实并不困难，难点其实是创意，可惜的是平时接触的还是太少😥。下面总结一下实现要点：

1.  提到**切割**，可以想到**镂空**，进而可以想到**遮罩**
    
2.  分割成`n*n`块，其实就是遮罩背景的平铺
    
3.  旋转的矩形其实就是两个互相垂直的线性渐变重叠而成
    
4.  CSS 变量的过渡动画需要用到`CSS @property` 特性
    

兼容性其实就取决于`CSS @property`了，这是`CSS Houdini`的一部分，目前只有 Chrome 和 Safari 支持。

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtLRtmltolqCbDePdz144Bzv9CV6kSFg2cUcKDRw4TenvS00nMbSjrlibeMOewxTftNyZLSzwbLwAibA/640?wx_fmt=png)image-20230514122319663

最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发❤❤❤

### 参考资料

[1]

https://codepen.io/t_afif/details/abRWELR: _https://codepen.io/t_afif/details/abRWELR_

[2]

CSS 如何实现羽化效果？: _https://juejin.cn/post/7176094306124431421_

[3]

别用图片了，CSS 遮罩合成实现带圆角的环形 loading 动画: _https://juejin.cn/post/7217731969307328571_

[4]

CSS mask 实现鼠标跟随镂空效果: _https://juejin.cn/post/7033188994641100831_

[5]

CSS 实现 Chrome 标签栏的技巧: _https://juejin.cn/post/6986827061461516324_

[6]

CSS 实现优惠券的技巧 : _https://juejin.cn/post/6945023989555134494_

[7]

mask-composite - CSS: Cascading Style Sheets | MDN (mozilla.org): _https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FCSS%2Fmask-composite_

[8]

-webkit-mask-composite: _https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FCSS%2F-webkit-mask-composite_

[9]

CSS @property: _https://developer.mozilla.org/zh-CN/docs/Web/CSS/@property_

[10]

CSS img hover (juejin.cn): _https://code.juejin.cn/pen/7232884497778704440_

[11]

CSS img hover (runjs.work): _https://runjs.work/projects/a1f43973537d4e05_

[12]

CSS img hover (codepen.io): _https://codepen.io/xboxyan/pen/vYVaNNp_