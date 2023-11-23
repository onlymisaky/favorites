> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/H3ZiMCid0zvXS6O-em69kw)

  

> 本文作者为 360 奇舞团前端开发工程师

一、前言
----

以往，如果提到渐变色，你是不是会马上觉得实现起来很麻烦，很复杂，拓展性也得不到保证呢？不要担心，这篇文章会介绍给你一些实现方法。不仅可以直接使用，还能开阔你的思路，相信能使你做出更多更出色的美丽图形。

二、前端支持的渐变色类型
------------

首先，了解下目前前端能够支持的渐变色类型。

### 1 线性渐变（Linear gradient）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDE1jHM7ibOnplhxrehZHESBX9RjaDJA8Kyxn9VtbXhFvgQfkQkb2JZ0AQ/640?wx_fmt=png)

### 2 径向渐变（Radial gradient）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEEK007LrLKiajW6KibAX3Xr7nMPBApYzm2oISJARKC1iaoBwwannvIGTbw/640?wx_fmt=png)

### 3 角向渐变（Conic gradient）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDErmRrwrax1K9iarBCJGOQo3OBRWoHyp7icJYQLgywbEJcQ3TVpz2slY9g/640?wx_fmt=png)

#### 4 多重渐变（Repeating gradient）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEO5pXw6LqzmZicWZUeM62P78CIFg4ylnehk7nqKiaKnjQicOM2WyLRiaJdw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEevRRl9vPb1GEWBwibWXJTonoBjUe4mxwlACz9XZWYlnScsnwSrYuV0Q/640?wx_fmt=png)

三、css 中的渐变色
-----------

### 1. 定义

> `<gradient>`是 CSS 数据类型 `<image>` 中的一种，用于表现两种或多种颜色的过渡转变。[1]

在浏览器渲染的时候，`<gradient>` 被解析为图形，所以它可以应用在 background-image、border-image、list-style-image、mask 等能够使用图片的 CSS 属性上。

### 2. 渐变色函数

css 渐变色本质是由 css 函数生成的渐变色图片。渐变色函数有：linear-gradient() radial-gradient() conic-gradient() repeating-linear-gradient() repeating-radial-gradient() repeating-conic-gradient()

使用方法举例：

```
.test {  background: linear-gradient(#e66465, #9198e5);}
```

### 3. 能够支持渐变色的属性

根据定义我们知道，能支持 `<image>` 数据类型的属性，才能够支持渐变色。

以下是支持 `<image>` 数据类型的 Css 属性列表：

*   background-image
    
*   border-image
    
*   list-style-image
    
*   mask-image
    
*   filter
    
*   shape-image-threshold
    

#### 4 实例

下面总结列举一些渐变色的实现。

#### 4.1 渐变色背景

`background-image` 应用于容器的背景色渐变。

```
.bg {  width: 100px;  height: 100px;  background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5))}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEWp39AgF9OwpSnHQHXE9dhuTSK0iaic6D82vAb8gcdq7CCe7nYBb7kgnQ/640?wx_fmt=png)

#### 4.2 渐变色直角边框

直角边框的渐变可以使用 `border-image` 来实现。

```
.border {  width: 100px;  height: 100px;  border-width: 10px;  border-style: solid;  border-image-source: linear-gradient(0deg, rgb(25, 25, 209) 0%, rgb(255, 0, 220) 97.9381%);  border-image-slice: 10;}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDENSBiagnzia0u0Wta7aHUCiamB9nr7PK3EGcdLrdficmWtZ3IglRcnFQRQw/640?wx_fmt=png)

这里有些难理解的是属性 `border-image-slice` 。它的使用方法确实很复杂，这里我们只需要明白，它的一个重要作用是防止图片失真，并且记住通常把它设置的和 `border-width` 一样就可以了。

这种方法只能实现直角边框的渐变，因为此时的 `border-radius` 属性无效。圆角边框的渐变需要采用别的方法实现。

#### 4.3 渐变色圆角边框

这种方法会使用 `mask` 属性，原理是：1、先用 `background` 设置背景色渐变；2、再用 `mask` 制作一个遮罩，露出边框部分；3、然后将遮罩和背景重叠，露出背景的渐变色，模拟出边框；4、最后使用 `border-radius` 属性控制圆角的大小；5、使用 `padding` 控制边框的粗细。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDExKqRn6icFnCyRicsria9NhVROSSEXguU76INtqeIIHOFXf7libXg0k1SNA/640?wx_fmt=png)

```
.box {  position: absolute;  inset: 0;  width: 200px;  height: 200px;}.box::before {  content: "";  position: absolute;  inset: 0;  background:linear-gradient(45deg,red,blue);   -webkit-mask-image:       linear-gradient(#fff 0 0),       linear-gradient(#fff 0 0);  -webkit-mask-clip:     content-box,    border-box;  -webkit-mask-composite: xor;          mask-composite: exclude;   padding: 10px;   border-radius: 50px;}
```

说明：

1.  使用伪类选择器目的是防止 `.box` 的内容被剪切。
    
2.  `background` 设置背景渐变色。
    
3.  `border-radius` 控制圆角大小。
    
4.  `mask-image` 设置两个遮罩层。
    
5.  `mask-clip` 对遮罩层进行剪切，第一个遮罩层覆盖内容框 `content-box`，第二个遮罩层覆盖 border 框 `border-box` , 也就是包括 padding 的部分。
    
6.  `mask-composite` 将两个遮罩层混合剪切。由于浏览器的差异使用了前缀属性，但两个属性值的意思都是遮罩排除，也就是后面遮罩重合的地方排除，当做透明处理。
    
7.  边框的宽度则使用 `padding` 进行控制。
    

#### 4.4 渐变色虚线边框

使用 `border-image` 实现渐变色边框的另一个问题是无法实现渐变色虚线边框。

将要介绍的这个方案的优点是拓展性很好。缺点则是有些复杂。

先来看一下效果以及代码：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEVhzLdLxePjDdibrB8KfxyibfJPf9uK8U4JEoqzbYWWCopRLicjnJGty4g/640?wx_fmt=png)

```
.box {  position: absolute;  inset: 0;  width: 200px;  height: 200px;}.box::before {  content: "";  position: absolute;  inset: 0;  background: linear-gradient(45deg, gold, purple, cyan, deeppink);  mask: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='57' ry='57' stroke='black' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");  border-radius: 57px;}
```

这里的复杂点是需要一个 svg 图片做遮罩。渐变色还是通过遮罩露出的背景颜色。

svg 是可以作为 css 图片使用的。它本身可以绘制虚线，支持圆角等，并且虚线的长度、宽度，容器的圆角都可以调节尺寸。

步骤如下：

1.  `background` 设置需要的渐变色；
    
2.  `mask` 设置 svg 图片作为遮罩；
    
3.  `rx='57' ry='57'` 控制圆角的尺寸；
    
4.  `stroke-width='4'` 控制线条宽度；
    
5.  `stroke-dasharray` 控制虚线形状。
    

#### 4.5 渐变色文字

文字的渐变色是靠背景色的文字剪切 `background-clip: text` 来实现的。需要把文字的原本颜色 `color` 设置为 `transparent`。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEfG4whCZouK1pDzsYKUgDg8BQQ7DPpJ6LbL268hYKiba0ALxiccBliclag/640?wx_fmt=png)

```
.text {  color: transparent;  background-image: linear-gradient(45deg, gold, purple, cyan, deeppink);  -webkit-background-clip: text;          background-clip: text;}
```

#### 4.6 带阴影的渐变色文字

如果直接使用 `text-shadow` 实现文字阴影会出现阴影浮在文字上边的问题。这是因为渐变色文字是背景色实现的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEyQjgfsLnCSskA07HO75SzDbpJDrmnx86ONh2YFEkMyokp7RslagSSA/640?wx_fmt=png)

所以阴影需要改用 `filter` 属性实现。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEdqobeQQeZiaHJjomWEz1mQ6HiaZhZSrIRpvZrct1JttJCiaHibPThUnbBw/640?wx_fmt=png)

```
.text {  color: transparent;  background-image: linear-gradient(45deg, gold, purple, cyan, deeppink);  -webkit-background-clip: text;          background-clip: text;    filter: drop-shadow(#0ff 10px 10px 5px);}
```

#### 4.7 省略号代替超出文本框的渐变色文字

由于不是使用的 `text` 实现的文字，`textOverflow: ellipsis` 也会导致无效。这里有个很不常用的属性值，可以帮助我们完成效果。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAdYWviavOazfCxj6X2j9CDEmhtdtdJcalXAgZCbFmdzKYficBOb24IQqiaicyOA0tTeib4PGf0F7RBYCQ/640?wx_fmt=png)

```
.text {  width: 500px;  height: auto;  color: transparent;  background-image: radial-gradient(rgb(44, 234, 218) 15.4639%, rgb(0, 59, 255) 99.4845%);  -webkit-background-clip: text;  display: -webkit-box;   -webkit-box-orient: vertical;  -webkit-line-clamp: 2;}
```

说明：

1.  `-webkit-box` 将对象作为弹性伸缩盒子模型显示。
    
2.  `-webkit-box-orient: vertical` 从上到下垂直排列子元素。
    

结语
--

怎么样，结合了 `svg` 、`mask` 、 `filter` 的渐变色，是不是一下子变得强大起来，并充满各种可能性。你是不是也受到了一些启发，脑中迸发出许多想法了呢？欢迎感兴趣的朋友们一起讨论。

### 参考资料

[1]

渐变: _https://developer.mozilla.org/en-US/docs/Web/CSS/gradient_

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)