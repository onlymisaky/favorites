> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ni_O5Z415Qvspt04BHtliA)

在之前，我们有些过这么一篇文章 - [使用 CSS 轻松实现高频出现的各类奇形怪状按钮](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247489206&idx=1&sn=6de219c468c1eda68ee8a0dd450949bb&chksm=ce257540f952fc562d8423224022f4eab9ef8871448dca561bcbe2fa3c068d82a84c41651244&scene=21#wechat_redirect) [1]。

里面包含了如下这些图形：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasiaXxvdO8EYn8YnXkbwicrFM1YYTd1lXibr3vOM01VlbsDsicia8UbfVCCicw/640?wx_fmt=png&from=appmsg)

接下来几篇文章中，将在上述基础上，额外补充一些在日常设计稿中，常见的，可能出现的更为复杂的几个按钮，本文，我们来尝试实现这个造型：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsask2SkhcKNM8dRF7u3w8yXsF7EicqkzCn9Zyr15RbLAoH3nyicGeicLibNOQ/640?wx_fmt=png&from=appmsg)

不镂空的内凹圆角按钮
----------

在文章开头的贴图中，其实是有和这个按钮非常类似的造型：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/SMw0rcHsoNIhPAJzZbceymntSklNnsasj1rFgicmpyRg73m4q8jiabdsxPcNcB5jBibJCGW0RxjhSZUicBt9d9Qmkg/640?wx_fmt=jpeg)

此造型如果内部无需镂空，整体还是比较简单的，利用 `background: radial-gradient()` 径向渐变或者 `mask`，都能比较轻松的实现。

我们快速回顾一下，看这样一个简单的例子：

```
<div></div>
```

```
div {    background-image: radial-gradient(circle at 100% 100%, transparent 0, transparent 12px, #2179f5 12px);}
```

可以得到这样一个图形：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasocjJdpat6icjW3RdRoMhBa8cdfqoTeCCY3htqpBIMPBxsmic2zeo2KhQ/640?wx_fmt=png&from=appmsg)

所以，只需控制下 `background-size`，在 4 个角实现 4 个这样的图形即可：

```
<div class="inset-circle">inset-circle</div>
```

```
&.inset-circle {    background-size: 70% 70%;    background-image: radial-gradient(            circle at 100% 100%,            transparent 0,            transparent 12px,            #2179f5 13px        ),        radial-gradient(            circle at 0 0,            transparent 0,            transparent 12px,            #2179f5 13px        ),        radial-gradient(            circle at 100% 0,            transparent 0,            transparent 12px,            #2179f5 13px        ),        radial-gradient(            circle at 0 100%,            transparent 0,            transparent 12px,            #2179f5 13px        );    background-repeat: no-repeat;    background-position: right bottom, left top, right top, left bottom;}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasGeKrddw0SGo28a65NjYFeDuOKNx1P79ibW7ON1qJZuem7nyEfiaPy73Q/640?wx_fmt=png&from=appmsg)

### 借助 mask 实现渐变的内切圆角按钮

如果背景色要求渐变怎么办呢？

假设我们有一张矩形背景图案，我们只需要使用 `mask` 实现一层遮罩，利用 `mask` 的特性，把 4 个角给遮住即可。

`mask` 的代码和上述的圆角切角代码非常类似，简单改造下即可得到渐变的内切圆角按钮：

```
<div class="mask-inset-circle">inset-circle</div>
```

```
.mask-inset-circle {    background: linear-gradient(45deg, #2179f5, #e91e63);    mask: radial-gradient(            circle at 100% 100%,            transparent 0,            transparent 12px,            #2179f5 13px        ),        radial-gradient(            circle at 0 0,            transparent 0,            transparent 12px,            #2179f5 13px        ),        radial-gradient(            circle at 100% 0,            transparent 0,            transparent 12px,            #2179f5 13px        ),        radial-gradient(            circle at 0 100%,            transparent 0,            transparent 12px,            #2179f5 13px        );    mask-repeat: no-repeat;    mask-position: right bottom, left top, right top, left bottom;    mask-size: 70% 70%;}
```

这样，我们就得到了这样一个图形：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasPqdKWcqZxXnnJ80XgMVDwOCNiaHRD17IEJYKPRa6juCzMJU8oNiczXoA/640?wx_fmt=png&from=appmsg)

不镂空的内凹圆角边框
----------

但是，如果要求内部是整体镂空，只展示**内凹圆角边框**，整个复杂度一下就上来了。

上面的方法以及不适用了，原因在于很难利用 `mask` 制造一个不规则的内凹圆角形状进行裁剪，因此，我们必须另辟蹊径。

### 渐变偏移技巧

在 [CSS 高阶小技巧 - 角向渐变的妙用！](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247495286&idx=1&sn=310cd84dc71581894f4728e6701a8b52&chksm=ce268d80f9510496cf1dffc9b33e52f998161d37f57245adc171c69ce4feb8a8d3501695c324&scene=21#wechat_redirect)[2] 一文中，我们介绍了渐变一个非常有意思的偏移技巧：

举个例子，下面是角向渐变 `conic-gradient()` 的简单介绍：

```
{    background: conic-gradient(deeppink, yellowgreen);}
```

从渐变的圆心、渐变起始角度以及渐变方向上来说，是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasX5ibcia5Asu2xX4vJwoyMECIYzIprfHsCINgQzpNmI61GuUSGZPOaUMQ/640?wx_fmt=png&from=appmsg)

划重点：

从图中可以看到，角向渐变的起始圆心点、起始角度和渐变方向为：

1.  起始点是图形中心，
    
2.  默认渐变角度 0deg 是从上方垂直于圆心的
    
3.  渐变方向以顺时针方向绕中心实现
    

当然，我们也可以控制角向渐变的**起始角度**以及**角向渐变的圆心**。

稍微改一下上述代码：

```
{    background: conic-gradient(from 270deg at 50px 50px, deeppink, yellowgreen);}
```

效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasXwV0MibGf5Uibn8j6NboPdv7YsMcB72WVFNmdOk4jHu3fylrNia3ez3IQ/640?wx_fmt=png&from=appmsg)

我们改变了**起始角度**以及**角向渐变的圆心**：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsas8SZCIyjEzyLnhBG5oYjVIaTupd9U7GTtNjGEtFPSBMtGdaPhrPicMVg/640?wx_fmt=png&from=appmsg)

了解了这个之后。我们基于上述的图形，重新绘制一个图形：

```
div {    margin: auto;    width: 200px;    height: 200px;    background: conic-gradient(from 270deg at 50px 50px, deeppink 0%, deeppink 90deg, transparent 90deg, transparent  360deg);    border: 1px solid #000;}
```

效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsas8SZCIyjEzyLnhBG5oYjVIaTupd9U7GTtNjGEtFPSBMtGdaPhrPicMVg/640?wx_fmt=png&from=appmsg)

**起始角度**以及**角向渐变的圆心**没有改变，但是只让前 90deg 的图形为粉色，而后 270deg 的图形，设置为了透明色。

我们利用角向渐变，在图像内部，又实现了一个小的矩形！

接下来，我们再给上述图形，增加一个 `background-position: -25px, -25px`：

```
div {    margin: auto;    width: 200px;    height: 200px;    background: conic-gradient(from 270deg at 50px 50px, deeppink 0%, deeppink 90deg, transparent 90deg, transparent  360deg);    background-position: -25px -25px;    border: 1px solid #000;}
```

这样，我们就神奇的得到了这样一个图形：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasYgXWlJuotfdK3MKf7bsPia9jCwgibic1vibiap1BT4yibSCMjtbknT0P2D2g/640?wx_fmt=png&from=appmsg)

为什么会有这样一种现象？如果我们在代码中加入 `background-repeat: no-repeat`：

```
div {    width: 200px;    height: 200px;    background: conic-gradient(from 270deg at 50px 50px, deeppink 0%, deeppink 90deg, transparent 90deg, transparent  360deg);    background-position: -25px -25px;    background-repeat: no-repeat;    border: 1px solid #000;}
```

那么就只会剩下左上角一个角：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasLqPs8DnmibLIIZjGTkc3HiaLw2tk8O2ozI4TKyJicTYI0Lhvs5HUhbctw/640?wx_fmt=png&from=appmsg)

因此，这里实际上利用了渐变图形默认会 repeat 的特性，实际上是这么个意思：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasQ40vfqhcwoSgnv6p9F2caVzrRe0Rg4YiaibM4AFtUwxSL78B8q1MhxWw/640?wx_fmt=png&from=appmsg)

**理解了这张图，也就理解了整个技巧的核心所在**！

### 利用径向渐变实现圆环偏移

掌握了上述渐变的偏移技巧后，我们将上述的角向渐变的案例，移植到径向渐变。

首先，我们利用径向渐变，实现一个小圆环：

```
<div></div>
```

```
div {    width: 300px;    height: 120px;    border: 1px solid #ddd;    background: radial-gradient(30px at 30px 30px, transparent calc(98% - 5px),#000 calc(100% - 5px) 98%, transparent);}
```

解释一下，上述渐变语句的含义是在 `30px 30px` 处，实现一个半径为 `30px` 的径向渐变，渐变颜色为透明到黑色到透明，因此可以得到一个圆环：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasDEibTm1SOuVtxaCl0znWH4WHxPrjW6tCYnKibhhFIX9r1F7WHpOL2iaIg/640?wx_fmt=png&from=appmsg)

> 为了方便大家看清楚 div 整体大小，利用 `border: 1px solid #ddd` 展示了整个 div 的轮廓，下图开始隐藏 border

然后，利用上述的技巧，我们让渐变图形，整体偏移 `-30px -30px`，也就是让径向渐变图形的圆心，处于 div 的左上角 `0 0` 坐标处。

```
div {    width: 300px;    height: 120px;    border: 1px solid #ddd;    background: radial-gradient(30px at 30px 30px, transparent calc(98% - 5px),#000 calc(100% - 5px) 98%, transparent);    background-position: -30px -30px;}
```

此时，图形就变成了这样（下图去掉了 border）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsasoxsPRycjImbq8FeHMVk60HXt3h6OLM7VuWeeHkuHTcTsRMzoyguEicA/640?wx_fmt=png&from=appmsg)

到这，大家应该能恍然大悟了吧。剩下的工作就比较简单了，我们只需要利用多重线性渐变，把剩余的线条补充出来即可，整个图形完整的代码如下：

```
div {    width: 300px;    height: 120px;    background:         radial-gradient(30px at 30px 30px, transparent calc(98% - 5px),#ff2287 calc(100% - 5px) 98%, transparent),        linear-gradient(#ff2287, #ff2287),        linear-gradient(#ff2287, #ff2287),        linear-gradient(#ff2287, #ff2287),        linear-gradient(#ff2287, #ff2287);    background-position:         -30px -30px,         29px 0, 29px 100%, // 两条横边        0 29px, 100% 29px; // 两条纵边    background-size:         100% 100%,         calc(100% - 58px) 5px, calc(100% - 58px) 5px,         5px calc(100% - 58px), 5px calc(100% - 58px);    background-repeat:         repeat,         no-repeat, no-repeat,         no-repeat, no-repeat;}
```

这样，我们就成功得到了我们想要的不镂空的内凹圆角边框：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsask2SkhcKNM8dRF7u3w8yXsF7EicqkzCn9Zyr15RbLAoH3nyicGeicLibNOQ/640?wx_fmt=png&from=appmsg)

当然，我们肯定是需要不同边框大小、颜色的各种不镂空的内凹圆角边框，我们利用 CSS 变量再进行一下封装：

```
.g-custom {        background:         radial-gradient(var(--border_radius) at var(--border_radius) var(--border_radius), transparent calc(97% - var(--border_width)),var(--color) calc(100% - var(--border_width)) 98%, transparent),        linear-gradient(var(--color), var(--color)),        linear-gradient(var(--color), var(--color)),        linear-gradient(var(--color), var(--color)),        linear-gradient(var(--color), var(--color));    background-position:         calc(-1 * var(--border_radius)) calc(-1 * var(--border_radius)),         calc(var(--border_radius) - 1px) 0, calc(var(--border_radius) - 1px) 100%, // 两条横边        0 calc(var(--border_radius) - 1px), 100% calc(var(--border_radius) - 1px); // 两条纵边    background-size:         100% 100%,         calc(100% - calc(var(--border_radius) * 2 - 2px)) var(--border_width), calc(100% - calc(var(--border_radius) * 2 - 2px)) var(--border_width),         var(--border_width) calc(100% - calc(var(--border_radius) * 2 - 2px)), var(--border_width) calc(100% - calc(var(--border_radius) * 2 - 2px));    background-repeat:         repeat,         no-repeat, no-repeat,         no-repeat, no-repeat;}.g-custom-1 {    width: 200px;    height: 120px;    --color: #6678ff;    --border_radius: 15px;    --border_width: 1px;}.g-custom-2 {    width: 240px;    height: 160px;    --color: #448800;    --border_radius: 35px;    --border_width: 3px;}.g-custom-3 {    width: 180px;    height: 180px;    --color: #df73a0;    --border_radius: 40px;    --border_width: 6px;}
```

这样，控制三个 CSS 变量，就可以得到各种不同样式的边框了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNIhPAJzZbceymntSklNnsas4PMCchAWicibD7C7adxQkkRqERtM5nyiaoUjwiaQFcibn8nNePWqeB0pk2g/640?wx_fmt=png&from=appmsg)

完整的代码，你可以戳这里：CodePen Demo -- 内凹角边框 & inner-corner-border[3]

怎么样，一个非常有技巧性的 CSS 图形，你 Get 到了吗？

最后
--

好了，本文到此结束，希望本文对你有所帮助 :)

更多精彩 CSS 技术文章汇总在我的 Github -- iCSS[4] ，持续更新，欢迎点个 star 订阅收藏。

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

参考资料

[1]

使用 CSS 轻松实现高频出现的各类奇形怪状按钮: _https://github.com/chokcoco/iCSS/issues/152_

[2]

CSS 高阶小技巧 - 角向渐变的妙用！: _https://github.com/chokcoco/iCSS/issues/227_

[3]

CodePen Demo -- 内凹角边框 & inner-corner-border: _https://codepen.io/Chokcoco/pen/dyxEoGM?editors=1100_

[4]

Github -- iCSS: _https://github.com/chokcoco/iCSS_

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)

如果觉得还不错，欢迎点赞、收藏、转发❤❤