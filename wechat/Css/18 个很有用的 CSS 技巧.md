> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/oBTQbHoCO39LaR39lTgx4g)

今天来分享 18 个鲜为人知但很有用的 CSS 技巧！

图片文字环绕
------

`shape-outside` 是一个允许设置形状的 CSS 属性。它还有助于定义文本流动的区域：

```
.any-shape {  width: 300px;  float: left;  shape-outside: circle(50%);}
```

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKF5GANogJpbdnkWxf8KtF3dRFuVQhLKw0nVjQH71jJLMibic4K4cddr4mA/640?wx_fmt=png)

**shape-outside** 属性定义了一个可以是非矩形的形状，相邻的内联内容应围绕该形状进行包装。默认情况下，内联内容包围其边距框; `shape-outside`提供了一种自定义此包装的方法，可以将文本包装在复杂对象周围而不是简单的框中。

:where() 简化代码
-------------

当对多个元素应用相同的样式时，CSS 可能如下：

```
.parent div,.parent .title,.parent #article {  color: red;}
```

这样代码看起来可读性不是很好，`:where()` 伪类这时就派上用场了。**:where()** 伪类函数接受**选择器列表**作为它的参数，将会选择所有能被该选择器列表中任何一条规则选中的元素。

上面的代码使用`:where()`就可以这么写：

```
.parent :where(div, .title, #article) {  color: red;}
```

代码是不是看起来简洁了很多？

实现平滑滚动
------

可以使用 CSS 的`scroll-behavior`属性来实现在网页上进行平滑滚动，而无需编写复杂的 JavaScript 或使用插件。可以用于页面锚点之间的滚动或者返回顶部等功能。

```
html {  scroll-behavior: smooth;}
```

当用户手动导航或者 CSSOM scrolling API 触发滚动操作时，CSS 属性 **scroll-behavior** 为一个滚动框指定滚动行为，其他任何的滚动，例如那些由于用户行为而产生的滚动，不受这个属性的影响。在根元素中指定这个属性时，它反而适用于视窗。当该属性的值为`smooth`时就可以实现页面的平滑滚动。

背景混合模式
------

在 CSS 中可以使用 `background-blend-mode` 来实现元素背景的混合：

```
.blend-1 {  background-image: url(https://duomly.nyc3.digitaloceanspaces.com/articles/coding/alps-lake.jpg);  width: 100vw;  height: 500px;  background-size: cover;} .blend-2 {  background-image: url(https://duomly.nyc3.digitaloceanspaces.com/articles/coding/alps-lake.jpg);  width: 100vw;  height: 500px;  background-color: #20126f;  background-size: cover;  background-blend-mode: overlay;}
```

实现的效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFIK3F3Mk3ibrS2kGHsEWL0fPaZ9FNvDdicSIAicN5chsJfVibyQTtGvBlCQ/640?wx_fmt=png)

上面的图片是单纯的一张图片背景，下面的图片是背景图片和背景颜色混合而成的。`background-blend-mode` 属性就用于定义了背景层的混合模式（图片与颜色）。支持的背景混合模式：正常 | 乘法 | 屏幕 | 叠加 | 变暗 | 变亮 | 颜色减淡 | 饱和度 | 颜色 | 亮度；

图像填充文字效果
--------

要想实现图像填充文字效果，可以设置 `background-clip: text` 以使文字背景作为整个区域的背景，文字之外的区域将被裁掉。配合透明的文字颜色，就可以实现图像填充文字效果了：

```
h1 {  background-image: url('./flower.jpg');  background-clip: text;  -webkit-background-clip: text;  color: transparent;  background-color: white;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFfQniaHGI44vCCcok0uqicZzqxZO5sUpt1uS331O3zJYJgFADbQhA6B8Q/640?wx_fmt=png)注意，在使用此技术时可以指定一个背景颜色来作为后备值，以防图像因为某种原因而无法加载。

文字描边效果
------

在 CSS 中可以使用 text-stroke 属性使文本更易读，它会向文本添加轮廓效果。

```
h1 { color: #fff; font-size: 80px;  -webkit-text-stroke: 2px crimson;  text-stroke: 2px crimson;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFRRPFgw6eAhouz7P7JTAQH3KSMM4E0ME1G4ny3icf84qOCiaryHyDhPTQ/640?wx_fmt=png)注意，`text-stroke` 属性值中有两部分，第一部分是文字描边的宽度，第二部分是文字描边的颜色。

将文本设为大写或小写
----------

大写或小写字母可以不必在 HTML 中设置。可以在 CSS 中使用`text-transform`熟悉来强制任何文本为大写或小写。

```
/* 大写 */.upper {  text-transform: uppercase;}/* 小写 */.lower {  text-transform: lowercase;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKF5pZeIiaLwpogZsicubVTGETkRcLFDLbucRoTOfvTicd8DjL3lzOxdqicsg/640?wx_fmt=png)

`text-transform` 属性专门用于控制文本的大小写，当值为`uppercase`时会将文本转为大写，当值为`capitalize`时会将文本转化为小写，当值为`capitalize`时会将每个单词以大写字母开头。

暂停 / 播放伪类
---------

使用 `:paused` 伪类可以为处于暂停状态的媒体元素设置样式，那自然就还有 `:playing` 伪类，它可以为处于播放状态的媒体元素设置样式。

```
video:paused {  opacity: 0.6;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFmSUmmRdTicDwCXYqcq7jR1iaTED2icHOU8qpbmxBx7Cdg73o9heHpP8fg/640?wx_fmt=gif)

需要注意，目前仅 Safari 支持该伪类`:paused`：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFPO6dQiaK7XZD0iaEiaWKULolpiasichI89CjfD7YRPrU9wVOoU96fZsHYQg/640?wx_fmt=png)

毛玻璃特效
-----

可以使用 CSS 中的 `backdrop-filter` 属性来实现毛玻璃特效：

```
.login {  backdrop-filter: blur(5px);}
```

实现效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFfcNdEZ8zUDW3fCK5GfgsLbNN8fsopsB1ibm8mgRL43gUWo25CPI3KzA/640?wx_fmt=png)

**backdrop-filter** 属性可以为一个元素后面区域添加图形效果（如模糊或颜色偏移）。因为它适用于元素背后的所有元素，为了看到效果，必须使元素或其背景至少部分透明。

自定义光标
-----

我们可以通 CSS 中的`cursor`属性来自定义光标的样式，只需要指定自定义光标的图片路径即可：

```
body{     cursor: url("path-to-image.png"), auto;}
```

除此之外， `cursor`还内置了很多鼠标样式供我们选择：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFCufc2a6NXEZQN48mjxnxEibunrI4hiaTvibkeNokhia6PwXq2Y4XVo4ibZg/640?wx_fmt=png)

文本强调效果
------

可以使用 `text-emphasis` 属性将强调标记应用于文本元素。可以指定包括表情符号在内的任何字符串作为强调标记。

```
h1 {  text-emphasis: "⭐️";}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFvlL1lu92y4ibCjmorxg38DEdcxwfK8BzbQcfpJQSibdAibU5cMsssH9Fg/640?wx_fmt=png)注意，`text-emphasis` 是一个简写属性，用于在一个声明中设置 `text-emphasis-style` 和 `text-emphasis-color`。强调装饰符的字号是主文字内容字号的一半，例如假设文字是`20px`，则上方的强调字符的大小是`10px`。

更写书写方向
------

通常我们常见的网页文字是从左向右布局的，在 CSS 中可以使用 `writing-mode` 属性来指定文本在网页上的布局方式，即水平或垂直。该属性有多个属性值：

*   `horizontal-tb`：水平方向自上而下的书写方式。即 left-right-top-bottom
    
*   `vertical-rl`：垂直方向自右而左的书写方式。即 top-bottom-right-left
    
*   `vertical-lr`：垂直方向内内容从上到下，水平方向从左到右
    
*   `sideways-rl`：内容垂直方向从上到下排列
    
*   `sideways-lr`：内容垂直方向从下到上排列
    

```
h1 {  writing-mode: sideways-lr;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFsbODQrxFbiad8iaMLSawH7XMa1ibvuDKTVW1aXUGlrBmW7xqnzJnicPib0Q/640?wx_fmt=png)

悬停缩放效果
------

```
.img-container {   height: 250px;   width: 250px;   overflow: hidden;}.img-container img {   height: 100%;   width: 100%;   object-fit: cover;    transition: transform 200m ease-in; } img:hover {   transform: scale(1.2); }
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFKaH9MELba6jpNqfgSAJiaNGypialicpkY2DWWWlycibZS1fRln7j6hC7Mw/640?wx_fmt=gif)`transform` 属性应用于元素的 2D 或 3D 转换。这个属性允许将元素旋转，缩放，移动，倾斜等。当值为 scale 就可以实现元素的 2D 缩放转换。

裁剪各种形状
------

可以使用 `clip-path` 属性来创建各种有趣的视觉效果，例如将元素剪裁成自定义形状，如三角形或六边形。

```
div {  height: 150px;  width: 150px;  background-color: crimson;}
```

三角形如下：

```
clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
```

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFSdQArLkan5g5XbYPcpeq5c0oXGnl3fwdpJNrknib93JhYKyjSIBRMwg/640?wx_fmt=png)六边形如下：

```
clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
```

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFEoXx1bicfIXwyAvWWzfrvSlBfbvfPVhU4ZSlnVEqIWUFOYbBDn2I7hg/640?wx_fmt=png)可以使用 `clip-path` 在线工具在制作各种图形：https://bennettfeely.com/clippy/

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFecjeTicGviaALAZwSDhxSiauMkacxZyua8kgibOQWcgyVX2Hdb8K2TPCnQ/640?wx_fmt=png)

检测属性支持
------

在 CSS 中可以使用 `@support` 规则来检测对 CSS 特性的支持：

```
@supports (accent-color: #74992e) {  blockquote {    color: crimson;  }}
```

如果支持该属性将运行内容定义的样式。

可选项样式
-----

在 CSS 中可以使用 `:optional` 伪类来设置没有 `required` 属性的表单字段的样式，例如 `input`、`select` 和 `textarea`。

```
*:optional{  background-color: green;}
```

实现首字下沉
------

我们可以使用`::first-letter`来实现文本首字母的下沉：

```
p.texts:first-letter {  font-size: 200%;  color: #8A2BE2;}
```

`:first-letter`选择器用来指定元素第一个字母的样式，它仅适用于在块级元素中。效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMPriahV7fgFT37NiagUiczUNKFIKlJ3kVe1uzZBx3VP1U2ibCsqhmm3tVLIxHXBqNhl9KUvjytJdIGC4A/640?wx_fmt=png)

实现正方形
-----

我们可以通过 CSS 中的纵横比来实现一个正方形，这样只需要设置一个宽度即可：

```
.square {  background: #8A2BE2;  width: 25rem;  aspect-ratio: 1/1;}
```

`aspect-ratio` 媒体属性可以用来测试视口的宽高比。当然上述例子比较简单，来看看 MDN 中给出的纵横比的示例：

```
/* 最小宽高比 */@media (min-aspect-ratio: 8/5) {  div {    background: #9af; /* blue */  }}/* 最大宽高比 */@media (max-aspect-ratio: 3/2) {  div {    background: #9ff;  /* cyan */  }}/* 明确的宽高比, 放在最下部防止同时满足条件时的覆盖*/@media (aspect-ratio: 1/1) {  div {    background: #f9a; /* red */  }}
```

这里通过媒体查询在页面视口不同纵横比时，显示不同的背景颜色。

### 往期推荐

[盘点九大最流行的 npm 包，最高周下载量 2 亿 +](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247512817&idx=1&sn=777df4e2c8725e6637e5f2edce82d2c0&chksm=fc7efcaacb0975bce3df2899bfcd9b88d5f32ecc78bc908f0021f57f64407a29cd50218a5e11&scene=21#wechat_redirect)

[CSS 容器查询获得主流浏览器支持，是什么？怎么用？](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247512799&idx=1&sn=13397c4d2e9b50f58995cdad209e2dfd&chksm=fc7efc84cb097592bc3230e3f1d0fab5a339e091e1a6ad8014da5848a16236a2d8c6b7e53bba&scene=21#wechat_redirect)

[掌握 JavaScript 中的迭代器和生成器](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247512799&idx=2&sn=f89379b07a3e971fbe3f3e37b3de679e&chksm=fc7efc84cb097592a149689eb121c735611c22eba0fb2c6686e01953b61a51e0590aaac55042&scene=21#wechat_redirect)

[超有趣的 Vue 开源实战项目](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247512714&idx=1&sn=3ba57a4ea59db518ea732f7e13a63cea&chksm=fc7efcd1cb0975c7c027c296fe38fb573e9d0e57ba99b37c30e7fddd2c564f9f537567a1efcf&scene=21#wechat_redirect)

[2023 年最新最全 VSCode 插件推荐！](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247512575&idx=1&sn=1ddffcc9b376a71f6cec0377cca40aa2&chksm=fc7effa4cb0976b2b82ca70fd62669b0f9bff4fcc071c3f01dbd7a6b0eb0ea97140f8610f2c0&scene=21#wechat_redirect)

[前端框架的未来：useSignal()](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247512386&idx=1&sn=7fd49904ef0a314f9cf0eaf109fa68f2&chksm=fc7eff19cb09760f22ef6170a8e176979f484ee5cc242172ac77847637c16f2ca01b93a5978f&scene=21#wechat_redirect)