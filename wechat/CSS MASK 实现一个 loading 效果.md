> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-mJcVup0iY-lmwZBT12r7A)

分享一个简单的 loading 效果，如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLp5YdAq0WtzpDiaE7ibGYJsFcoIllSiaZdywWZH9OZ6ynbYOoLNNNx8Rqvw/640?wx_fmt=gif)Kapture 2023-05-20 at 15.14.39

> 本案例来源于 Temani Afif on CodePen[1]，略有修改

仔细观察，主要有两个动画

1.  小球的运动
    
2.  背景的变化
    

看似有点复杂，其实换个角度，实现要比想象的容易很多，也非常巧妙，一起看看吧

一、整体思路
------

如果按照正常的思路，可能会做两个动画，小球的动画还好，只是方位的变化，但是背景就麻烦了，除了颜色的变化，还有角度的变化，该如何实现呢？

🤔

🤔

🤔

其实换一下角度，多观察几遍，将整个视野反过来，你会发现，**小球的背景相对于整个画布是静止的**，也就是说，背景其实没有变化，**小球只是挖了一个孔，这个孔在运动**，示意效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLpOILutan4AHPHFLAeG2lsBB1BI0Leu6ozWXrN3KdjNia6VdOdMkS1OFg/640?wx_fmt=gif)Kapture 2023-05-20 at 15.36.25

提到挖孔，可以想到**遮罩**（CSS Mask）。关于遮罩，这个技巧非常实用，之前在多篇文章中都有用到

*   [一个有意思的 CSS 图片 hover 效果](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487370&idx=1&sn=dc9ca998b71ac56bdf153a14d769e575&chksm=97c66c45a0b1e553b5ed08ce881814959b04ed7d0dbf9cbcc04d05269f53ebea6430dd560314&scene=21#wechat_redirect) [2]
    
*   [CSS 如何实现羽化效果？](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247486560&idx=1&sn=0b46e57c42eb40e1e052f32748050ca2&chksm=97c66fafa0b1e6b988019f8dd85c236ccd5ee90de64d538b701712e6ba466e21086a188e7cec&scene=21#wechat_redirect)[3]
    
*   [别用图片了，CSS 遮罩合成实现带圆角的环形 loading 动画](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487209&idx=1&sn=48042103f1fc1b8c1cdba4cd7efbff77&chksm=97c66d26a0b1e430fb6711e1d0aaf052ee55e00a63b9100bff9582267446c5870585c3e0f51e&scene=21#wechat_redirect) [4]
    
*   [CSS mask 实现鼠标跟随镂空效果](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484774&idx=1&sn=4871821a1576f233e6a1a3d54f36ea15&chksm=97c666a9a0b1efbfb046886dd34a936dcca0250c80427a0f812eee4b82464fd5f9c3ab4de25d&scene=21#wechat_redirect) [5]
    
*   [CSS 实现 Chrome 标签栏的技巧](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484411&idx=1&sn=0ccba952f97381e58bc2149279fac58e&chksm=97c66034a0b1e922a48f0dc9ff37f43a8464bdf4e34efe6ee4002a7512da727b861d584aeb84&scene=21#wechat_redirect) [6]
    
*   [CSS 实现优惠券的技巧](http://mp.weixin.qq.com/s?__biz=MzU4MzUzODc3Nw==&mid=2247484348&idx=1&sn=7a7d135d1f60d1bd8cc218c4813574ff&chksm=fda6c28acad14b9c1af961585fba9598a37121396f79f7ff4c1f5793033420ba658597ceeb53&scene=21#wechat_redirect) [7]
    

所以，如果想到了这一点，下面的实现就很简单了，一个 4 种颜色的背景和一个运动的黑色遮罩

二、背景的绘制
-------

相信大家对这个背景都很熟悉，经常在 CSS 绘制三角形的时候看到这个原理图，这里同样也可以用`border`来实现

```
div{  width: 0;  border: 60px solid;  border-color: #2196F3,#F44336,#4CAF50,#FFC107}
```

这样就得到所需要的图案

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLpwVgKlCj3Pn0NNkL7VgX8HPElyZPWcWxrI29A3VXibEcTgx4icMw5VxUA/640?wx_fmt=png)image-20230520154533978

当然，除了这种方式，还可以采用**锥形渐变**来绘制

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLpj1M21PYF4jiaHGAIpccNiaBBVj8vcjwOWX90ldRE8tvFLTYzXcZPhlrA/640?wx_fmt=gif)

有关锥形渐变的技巧，可以参考之前这几篇文章

*   [锥形渐变只能画圆锥吗？conic-gradient 10 大应用举例](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487126&idx=1&sn=1a6fc2df7bb5892c5d6cbe69a9be29e1&chksm=97c66d59a0b1e44fe1e502e5c032d6aeb308a6638f7078491c36c739fc858e614bbf7e6e982c&scene=21#wechat_redirect) [8]
    
*   [纯 CSS 渐变绘制 Chrome 图标](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487327&idx=1&sn=7655c3a2aa8ef7f591563d35c1704e5f&chksm=97c66c90a0b1e5860c6d1f530496f2539bb5341f1ca8088abf7021d4837c2a84e099038311ed&scene=21#wechat_redirect) [9]
    
*   [CSS & SVG 绘制写作网格线的 3 种方式](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247486751&idx=1&sn=e6f2a26f12562a2f156eff10b69539c2&chksm=97c66ed0a0b1e7c6097b4aa4c1085b22cf48774219f2c48ac7d4fc9e014ee23970e2a9e0a574&scene=21#wechat_redirect) [10]
    
*   [CSS 实现切角效果](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484595&idx=1&sn=8fa06fa240539287879e0426f676b829&chksm=97c6677ca0b1ee6aebf738fb4d730308502611e4c83c436c95ef1272c7423bb27369ef5d4e13&scene=21#wechat_redirect) [11]
    
*   [CSS 绘制一个时钟](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247484775&idx=1&sn=a653746db2abf081c85247d04ea382c0&chksm=97c666a8a0b1efbeb80deb63c74e10efce7fb1974c3e35e62bc55eef4eff919f704396500adf&scene=21#wechat_redirect) [12]
    
*   [CSS 实现透明方格的 3 种方式](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247483866&idx=1&sn=a36ce2dabf168a8603006adf2c7f7191&chksm=97c66215a0b1eb03c7205a29d5df8f5e03c59a3ffa792e204aa00f5025bfeded4835434f0d5a&scene=21#wechat_redirect) [13]
    

实现也很简单，起始角度是`45deg`，每 `1/4`换一种颜色

```
div{  width: 120px;  height: 120px;  background: conic-gradient(from 45deg,#2196F3 25%,#F44336 0 50%,#4CAF50 0 75%,#FFC107 0);}
```

也能得到和上面完全相同的背景

三、镂空小球的绘制和运动
------------

接下来需要通过 CSS MASK 来绘制小球。很简单，就是一个从实色到透明的径向渐变。

```
div{  ...  -webkit-mask: radial-gradient(closest-side circle,#000 99%,#0000 100%) left/40px 40px no-repeat}
```

注意，这里使用了关键词`closest-side`，表示**最近的边**，好处是**可以根据背景尺寸直接控制圆的大小**，默认值是`farthest-side`，其他选项详细如下

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: center;">关键字</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: center;">描述</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;"><code>closest-side</code></td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;">渐变中心距离容器<strong data-style="color: rgb(119, 48, 152);">最近的边</strong>作为终止位置。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;"><code>closest-corner</code></td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;">渐变中心距离容器<strong data-style="color: rgb(119, 48, 152);">最近的角</strong>作为终止位置。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;"><code>farthest-side</code></td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;">渐变中心距离容器<strong data-style="color: rgb(119, 48, 152);">最远的边</strong>作为终止位置。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;"><code>farthest-corner（默认值）</code></td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px; text-align: center;">渐变中心距离容器<strong data-style="color: rgb(119, 48, 152);">最远的角</strong>作为终止位置。</td></tr></tbody></table>

当然，对于**完全对称**的容器，`closest-*` 和 `farthest-*`是完全相同的，各自的区别如下所示

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLp80aicOnTMabQXL80Z8ubmW7Fjf6B2eHhIIKyp6IQe1ial8avw10qAr0A/640?wx_fmt=png)image-20230415143458908

可以得到这样的效果，其余部分已经被裁剪掉了

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLp8boiaMAAHrB6qNQSGiaialuSXQoRhGoe9qMShSWXgEiaxUgQxrtLk8Ihmg/640?wx_fmt=png)image-20230520161625078

最后只需要改变遮罩的位置就行了，动画关键帧如下

```
@keyframes load {  25% {-webkit-mask-position: top   }  50% {-webkit-mask-position: right }  75% {-webkit-mask-position: bottom}}
```

这样就实现了文章开头的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIicNRfTJ4ia3vtiavMqAbXfLp5YdAq0WtzpDiaE7ibGYJsFcoIllSiaZdywWZH9OZ6ynbYOoLNNNx8Rqvw/640?wx_fmt=gif)Kapture 2023-05-20 at 15.14.39

完整代码如下

```
.loader {  width: 120px;   height: 120px;  background: conic-gradient(from 45deg,#2196F3 25%,#F44336 0 50%,#4CAF50 0 75%,#FFC107 0);  -webkit-mask: radial-gradient(50% 50%,#000 96%,#0000) left/35% 35% no-repeat;  animation: load 2s infinite;}@keyframes load {  25% {-webkit-mask-position: top   }  50% {-webkit-mask-position: right }  75% {-webkit-mask-position: bottom}}
```

完整代码可以查看以下任意链接：

*   CSS dot loader (juejin.cn)[14]
    
*   CSS dot loader (codepen.io)[15]
    
*   CSS dot loader (runjs.work)[16]
    

四、总结一下
------

总的来说实现非常简单，都是一些比较常规的绘制方式，但是思路却非常巧妙，通过改变 MASK 遮罩的位置来实现小球的背景位置变化，下面简单总结一下

1.  整体思路其实是背景不动，挖孔在动
    
2.  背景可以通过不同颜色的边框实现
    
3.  背景还可以通过锥形渐变实现
    
4.  圆形挖孔其实就是径向渐变的遮罩
    
5.  通过动画改变遮罩的位置
    

另外，关于锥形渐变和遮罩在本文介绍的并不多，但是引入了之前很多相关文章，有兴趣的可以回顾一下，很多非常实用的案例。

最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发❤❤❤

### 参考资料

[1]

Temani Afif on CodePen: _https://codepen.io/t_afif/details/NWyOdgv_

[2]

一个有意思的 CSS 图片 hover 效果: _https://juejin.cn/post/7233177170489688120_

[3]

CSS 如何实现羽化效果？: _https://juejin.cn/post/7176094306124431421_

[4]

别用图片了，CSS 遮罩合成实现带圆角的环形 loading 动画: _https://juejin.cn/post/7217731969307328571_

[5]

CSS mask 实现鼠标跟随镂空效果: _https://juejin.cn/post/7033188994641100831_

[6]

CSS 实现 Chrome 标签栏的技巧: _https://juejin.cn/post/6986827061461516324_

[7]

CSS 实现优惠券的技巧 : _https://juejin.cn/post/6945023989555134494_

[8]

锥形渐变只能画圆锥吗？conic-gradient 10 大应用举例: _https://juejin.cn/post/7212101184709247033_

[9]

纯 CSS 渐变绘制 Chrome 图标: _https://juejin.cn/post/7230603857033986109_

[10]

CSS & SVG 绘制写作网格线的 3 种方式: _https://juejin.cn/post/7186524908464111676_

[11]

CSS 实现切角效果: _https://juejin.cn/post/7087774534996066334_

[12]

CSS 绘制一个时钟: _https://juejin.cn/post/7090364550809124901_

[13]

CSS 实现透明方格的 3 种方式: _https://juejin.cn/post/7072175448301994020_

[14]

CSS dot loader (juejin.cn): _https://code.juejin.cn/pen/7235176585551167546_

[15]

CSS dot loader (codepen.io): _https://codepen.io/xboxyan/pen/VwEVdyR_

[16]

CSS dot loader (runjs.work): _https://runjs.work/projects/b90d34e7833849d6_