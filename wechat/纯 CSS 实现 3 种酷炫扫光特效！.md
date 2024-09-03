> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CaMKgC4EwBGkmsGK9yh0hA)

在日常开发中，为了强调凸显某些文本或者元素，会加一些扫光动效，起到吸引眼球的效果，比如文本的

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTt0pb27yfRVFjgy3V5zibUean1ToCPjV0TQgkyNzr8sgYSMruoYNQc4g/640?wx_fmt=gif&from=appmsg)

或者是一个卡片容器，里面可能是图片或者文本或者任意元素

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcT8Q4seVhRFH8j30GlibuQ6TCfdHM0KyGfquVu4h6ZLzWguCZbBNicxN1Q/640?wx_fmt=gif&from=appmsg)

除此之外，还有那种不规则的图片，比如奖品图案

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTp8pqevRSmtmkIP0xiaagdj5WPlGBicI6YFcwESj7gvSsOF2nyKQX7MwA/640?wx_fmt=gif&from=appmsg)

这些是如何实现的呢？一起看看吧

一、CSS 扫光的原理
-----------

`CSS`扫光动画的原理很简单，就是一个普通的、从左到右的、无限循环的位移动画

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtI49YyRVc2vr00pueImOpcTq1Ue9lCO3icibtIQ3Ad337WSPH51JXdFxicrLtakJA3Ne3ibAhibXKTbdNg/640?wx_fmt=png&from=appmsg)

位移动画可以选择`transform`或者改变`background-position`都行。

至于扫光，我们只需要绘制一条斜向上`45deg`的线性渐变就可以了，示意如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtI49YyRVc2vr00pueImOpcTWZN7iaEell8IibP3YfESEHjFuKGhOwu907nialENVADTP3laW8kfrBmMw/640?wx_fmt=png&from=appmsg)

用`CSS`实现就是

```
background: linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255, 255, 255, 0.7), rgba(255,255,255,0) 60%);
```

准备工作做好了，下面看 3 种不同场景的实现

二、文本扫光
------

首先来看文本扫光。

由于扫光在文本内部，所以需要将这个渐变作为文本的颜色。文本渐变色，可以用`backgrond-clip:text`来实现，假设`HTML`是这样的

```
<h1 class="shark-txt">前端侦探</h1>
```

为了让效果看起来更加明显，我们用一个比较粗的字体

```
h1{  font-size: 60px;  font-family: "RZGFDHDHJ";  font-weight: normal;  color: #9747FF;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtI49YyRVc2vr00pueImOpcTljZAFjvefNoqhvYenbibSg18Lxg3PCWVNVskSqw7icvjZ3eRQWewkL7g/640?wx_fmt=png&from=appmsg)

现在我们通过`background-clip`来添加扫光，由于是裁剪背景，所以需要将当前文本颜色设置透明，建议通过`-webkit-text-fill-color: transparent`来设置，这样可以保留文本原有颜色，好处是其他地方，比如`background-color`可以直接使用原有文本颜色`currentColor`，具体实现如下

```
.shark-txt{  -webkit-text-fill-color: transparent;  background: linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255, 255, 255, 0.7), rgba(255,255,255,0) 60%) -100%/50% no-repeat currentColor;  -webkit-background-clip: text;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtI49YyRVc2vr00pueImOpcT9CsjIHjGX7TnGXrRbVNFxJdTuH9JBfYACPy9pPgC6tYJX9AVyqVqTA/640?wx_fmt=png&from=appmsg)

最后就是让这个扫光动起来了。

由于是在文本内部，所以这里可以通过改变`background-position`来实现扫光动画了，动画很简单，如下

```
@keyframes shark-txt {  form{    background-position: -100%;  }  to {    background-position: 200%;  }}
```

但是这样做没有动画效果，完全不会动。

这是因为背景默认尺寸是`100%`，根据背景偏移百分比的计算规则，当背景尺寸等于容器尺寸时，百分比完全失效，具体规则如下

> 给定背景图像位置的百分比偏移量是相对于容器的。值 0% 表示背景图像的左（或上）边界与容器的相应左（或上）边界对齐，或者说图像的 0% 标记将位于容器的 0% 标记上。值为 100% 表示背景图像的 _右_（或 _下_）边界与容器的 _右_（或 _下_）边界对齐，或者说图像的 100% 标记将位于容器的 100% 标记上。因此 50% 的值表示水平或垂直居中背景图像，因为图像的 50% 将位于容器的 50% 标记处。类似的，`background-position: 25% 75%` 表示图像上的左侧 25% 和顶部 75% 的位置将放置在距容器左侧 25% 和距容器顶部 75% 的容器位置。
> 
> https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-position

```
(container width - image width) * (position x%) = (x offset value)(container height - image height) * (position y%) = (y offset value)
```

所以这种情况下，我们可以手动改小一点背景尺寸，比如`50%`

```
.shark-txt {    -webkit-text-fill-color: transparent;    background: linear-gradient(45deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 60%) -100% / 50% no-repeat currentColor;    -webkit-background-clip: text;    animation: shark-txt 2s infinite;}
```

这样就能完美实现文本扫光效果了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTt0pb27yfRVFjgy3V5zibUean1ToCPjV0TQgkyNzr8sgYSMruoYNQc4g/640?wx_fmt=gif&from=appmsg)

三、卡片容器扫光
--------

还有一种比较常见的是容器内的扫光动效，通常是在一个圆角矩形的容器里。

像这种情况下就不能直接用背景渐变了，因为会被容器内的其他元素覆盖。所以我们需要创建一个伪元素，然后通过改变伪元素的位移来实现扫光动画了。

假设有一个容器，容器内有一张图片，`HTML`如下

```
<div class="shark-wrap card">    <img src="https://imgservices-1252317822.image.myqcloud.com/coco/b11272023/ececa9a5.7y0amw.jpg"></div>
```

简单修饰一下

```
.card{  width: 300px;  border-radius: 8px;  background-color: #FFE8A3;}.card img{  display: block;  width: 100%;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtI49YyRVc2vr00pueImOpcTibRticTSwS6FSZB6SGnicre6LlMfBcMWUu4zj3xQ82KfNUaUfKYnBVXuw/640?wx_fmt=png&from=appmsg)

下面通过伪元素来创建一个扫光层，设置位移动画

```
.shark-wrap::after{  content: '';  position: absolute;  inset: -20%;  background: linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(255, 255, 255, 0.7), rgba(255,255,255,0) 60%);  animation: shark-wrap 2s infinite;  transform: translateX(-100%);}@keyframes shark-wrap {  to {    transform: translateX(100%);  }}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTMOw8roalZic3g3yn32s9cf8oPZGPupZvfNYbtaOD96h9ibpRuUVyoTcA/640?wx_fmt=gif&from=appmsg)

最后直接超出隐藏就行了

```
.shark-wrap{  overflow: hidden;}
```

最终效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTKdwndqzErRocRkqsX3652VKsricibkgsia6icEZFqEqx3Sg8VUQK48Ilxg/640?wx_fmt=gif&from=appmsg)

也适合那种圆形头像

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTVCdw9eiclY0CvCs4r9pe9xu6yFsicco7GicasFpWknmemcqJNBYLMBwFA/640?wx_fmt=gif&from=appmsg)

四、不规则图片扫光
---------

其实前面两种情况已经适合大部分场景了，其实还有一种情况，就是那种不规则的图片扫光。这种图片无法直接通过`overflow:hidden`去隐藏多余部分，比如这样

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTP2XQicJVXlwEOXuQp49zYVmwyHgd8XGpadSBH2nGCBYqbgMP2qOQS7g/640?wx_fmt=gif&from=appmsg)

很明显在图片之外的地方也出现了扫光，无法做到扫光在图形的 "内部"。

那么，有没有办法根据图片的外形去裁剪呢？当然也是有办法的，这里需要用到`CSS mask`遮罩。

简单来说，就是直接将该图片作为遮罩图片，这样只有形状内的部分可见，形状外的直接被裁剪了

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtI49YyRVc2vr00pueImOpcTjRAvwPZbPGfUqFNv3jXYs5RNrpia5FDjlGcpKxxZdoRIccuTtyw25IA/640?wx_fmt=png&from=appmsg)

在上一种场景的情况下，只需要在此基础之上，添加一个完全相同的 `mask`遮罩就行了

```
<div class="shark-wrap" style="-webkit-mask: url(https://imgservices-1252317822.image.myqcloud.com/coco/s09252023/3af9e8de.00uqxe.png) 0 0/100%">  <img class="logo" src="https://imgservices-1252317822.image.myqcloud.com/coco/s09252023/3af9e8de.00uqxe.png"></div>
```

这样就可以把扫光多余的部分裁剪掉了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTp8pqevRSmtmkIP0xiaagdj5WPlGBicI6YFcwESj7gvSsOF2nyKQX7MwA/640?wx_fmt=gif&from=appmsg)

换张图也能很好适配

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtI49YyRVc2vr00pueImOpcTfPkn3RUaBtpFSBfvIKWdLZSib8uSXD7USg5ic4a5jdjnYpPDt72LRcAA/640?wx_fmt=gif&from=appmsg)

以上所有 demo 可以查看以下链接

*   CSS shark animation (codepen.io)[1]
    
*   CSS shark animation (juejin.cn)[2]
    

五、总结一下
------

以上就本文的全部内容了，共介绍了 3 种不同的扫光场景，你学到了吗？下面总结一下重点

1.  扫光样式本身可以直接用线性渐变绘制而成
    
2.  扫光动画原理很简单，就是一个水平的位移动画
    
3.  文本扫光动画需要通过改变`background-postion`实现
    
4.  当背景尺寸等于容器尺寸时，设置`background-postion`百分比无效
    
5.  普通容器的扫光效果需要借助伪元素实现，因为如果使用背景会被容器内的元素覆盖
    
6.  普通容器的扫光动画可以直接用`transfrom`实现
    
7.  使用`overflow:hidden`裁剪容器外的部分
    
8.  不规则图片的扫光效果无法直接根据形状裁剪
    
9.  借助`CSS mask`可以根据图片本身裁剪掉扫光多余部分
    

对了，这个属于常规需求，只是普通的动画效果，没有兼容性限制，放心使用，除了本文的样式，还可以根据需求改变扫光的大小，角度，颜色等，这个就看具体需求了。

[1]CSS shark animation (codepen.io)： _https://codepen.io/xboxyan/pen/KKLLZOE_

[2]CSS shark animation (juejin.cn)： _https://code.juejin.cn/pen/7385810378132815882_