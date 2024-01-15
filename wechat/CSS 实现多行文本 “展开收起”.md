> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/liPEhdAPkOmChHbU0jHYuA)

———————   Y  ·  F  ·  E   ———————

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMky2LkQDoEql8KEJ11nicsZz3KEm61wVuo2p0lyxVOicicdGuSblZl9dUw/640?wx_fmt=png)

多行文本展开收起是一个很常见的交互， 如下图演示

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMM1wS8woEauOfV1z8ej2z8lJowKk10eYNBtmU981YSfxtPBB9kfsRunQ/640?wx_fmt=gif) 实现这一类布局和交互难点主要有以下几点：

*   位于多行文本右下角的 “展开收起” 按钮
    
*   “展开”和 “收起” 两种状态的切换
    
*   当文本不超过指定行数时，不显示 “展开收起” 按钮
    

说实话，之前单独看这个布局，即使借助 JavaScript 也不是一件容易的事啊（需要计算文字宽度动态截取文本，vue-clamp[1] 就是这么做的），更别说下面的交互和判断逻辑了，不过经过我的一番琢磨，其实纯 CSS 也能完美实现的，下面就一步一步来看看如何实现吧~

一

**一、位于右下角的 “展开收起” 按钮**


==========================

很多设计同学都喜欢这样的设计，把按钮放在右下角，和文本**混合**在一起，而不是单独一行，视觉上可能更加舒适美观。先看看多行文本截断吧，这个比较简单

**1. 多行文本截断**

假设有这样一个 html 结构

```
<div class="text">
浮动元素是如何定位的
正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
</div>
```

多行文本超出省略大家应该很熟悉这个了吧，主要用到用到 **line-clamp**，关键样式如下

```
.text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMibjtDrxhnfcBX6JicEugBROM4mPM73gOianIocgt9q8tHZAPwYEjPgtKg/640?wx_fmt=png)

**2. 右下角环绕效果**

提到**文本环绕效果**，一般能想到 **浮动 float** ，没错千万不要以为浮动已经是过去式了，具体的场景还是很有用的；比如下面放一个按钮，然后设置浮动

```
<div class="text">
  <button class="btn">展开</button>
  浮动元素是如何定位的
正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
</div>
```

```
.btn {
  float: left;
  /*其他装饰样式*/
} 
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMhVr1e71pEX13OQBxUZDEkic1iaCWJhQjrGlnl6ibCGoJchWZ0otQYXnCw/640?wx_fmt=png)

如果设置右浮动

```
.btn {
  float: right;
  /*其他装饰样式*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMmuiaa55BhtGIzic4u9RqNCGWMrcMQADFPyEIuY5zXAA2fMbKQ91UhJ0Q/640?wx_fmt=png)

这时已经有了**环绕**的效果了，只是位于右上角，如何将按钮移到右下角呢？先尝试一下 **margin**

```
.btn {
  float: right;
  margin-top: 50px;
  /*其他装饰样式*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMwoBNMibg6EALZiaYa5BtGAjwVAk9cUMHHaLRwpsWRuJRhDwgsut1G8og/640?wx_fmt=png)

可以看到，虽然按钮到了右下角，但是文本却没有环绕按钮上方的空间，空出了一大截，无能为力了吗？

虽然 margin 不能解决问题，但是整个文本还是受到了浮动按钮的影响，如果有多个浮动元素会怎么样呢？这里用伪元素来 **::before** 代替

```
.text::before{
  content: '';
  float: right;
  width: 10px;
  height: 50px;/*先随便设置一个高度*/
  background: red
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMGibD4z7PhHwrvZ6Pu6AGaujhugz3wlvCFpdmwLEibCUiaNKtvvVldaRow/640?wx_fmt=png)现在按钮到了伪元素的左侧，如何移到下面呢？很简单，清除一下浮动 **clear: both;** 就可以了

```
.btn {
  float: right;
  clear: both;
  /*其他装饰样式*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMHZFQgn6Hiaia79BlURBZj3PeksicPOribeaROrqx4UmIGKe8M0mstFG3dg/640?wx_fmt=png)

可以看到，现在文本是完全环绕在右侧的两个浮动元素了，只要把红色背景的伪元素宽度设置为 0（或者不设置宽度，默认就是 0），就实现了右下角环绕的效果

```
.text::before{
  content: '';
  float: right;
  width: 0; /*设置为0，或者不设置宽度*/
  height: 50px;/*先随便设置一个高度*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMM237xrAdbAnyIDiaTcnBFvPHXCvjcerKArPf15haqYFqswMk9pCPc0eA/640?wx_fmt=jpeg)

**3. 动态高度**

上面虽然完成了右下加环绕，但是高度是固定的，如何动态设置呢？这里可以用到 calc 计算，用整个容器高度减去按钮的高度即可，如下

```
.text::before{
  content: '';
  float: right;
  width: 0;
  height: calc(100% - 24px);
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMUiaDv1ZPDTdQBibE2yPz5gke3LBzWQDFkkccDnFzjgvz3vjwgJ4tGpGA/640?wx_fmt=png)

很可惜，好像并没有什么效果，打开控制台看看，结果发现 calc(100% - 24px) 计算高度为 0

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMnSLU2Ho9paKO5xbgXnIldN7gTc3WlfgYwZgicWp4fu4oia427shvqkcw/640?wx_fmt=png)

原因其实很容易想到，就是 高度 **100% 失效** 的问题，关于这类问题网上的分析有很多，通常的解决方式是给父级指定一个高度，但是这里的高度是动态变化的，而且还有展开状态，高度更是不可预知，所以设置高度不可取。

除此之外，其实还有另一种方式，那就是利用 **flex 布局**。大概的方法就是在 **flex 布局** 的子项中，可以通过百分比来计算变化高度，具体可参考 w3.org 中关于 css-flexbox[2] 的描述

> If the flex item has **align-self: stretch**, redo layout for its contents, treating this used size as its definite cross size so that percentage-sized children can be resolved.

因此，这里需要给 .text 包裹一层，然后设置 **display: flex**

```
<div class="wrap">
  <div class="text">
    <button class="btn">展开</button>
    浮动元素是如何定位的
  正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
  </div>
</div>
```

```
.wrap{
  display: flex;
}
```

> 实践下来，display: grid 和 display: -webkit-box 同样有效，原理类似

这样下来，刚才的计算高度就生效了，改变文本的行数，同样位于右下角~

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMuHPJdpFBW0PlFh4KpUI21tKgrbzdI9gqymuXO5R8GDzQeCfquT6uIQ/640?wx_fmt=png)

除此之外，动态高度也可以采用负的 margin 来实现（性能会比 calc 略好一点）  

```
.text::before{
  content: '';
  float: right;
  width: 0;
  /*height: calc(100% - 24px);*/
  height: 100%;
  margin-bottom: -24px;
}
```

到这里，右下角环绕的效果就基本完成，省略号也是位于展开按钮之前的，完整代码可以查看 codepen 右下角多行展开环绕效果 [3]

**4. 其他浏览器的兼容处理**


---------------------

上面的实现是最完美的处理方式。原本以为兼容性没什么大问题的，毕竟只用到了文本截断和浮动，**-webkit-line-clamp** 虽然是 **-webkit-** 前缀，不过 **firefox** 也是支持的，打开一看傻了眼，**safari** 和 **firefox** 居然全乱了！

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMM8uSgqsTxWMVibGU6CQqQfF1GBwKTEiceB6VuRASNXiac8UCEe0rs5hnVA/640?wx_fmt=png)

这就有点难受了，前面那么多努力都白费了吗？不可能不管这两个，不然就只能是 demo 了，无法用于生产环境。

赶紧打开控制台看看是什么原因。一番查找，结果发现是 **display: -webkit-box**，设置该属性后，原本的文本好像变成了一整块，浮动元素也无法产生环绕效果，去掉之后浮动就正常了

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMFwt261kM6WKcibE20oicia6JR4js0hmicwNib7n5RXCgibcfM4lH0tAQj5yw/640?wx_fmt=gif)

那么问题来了：**没有 display: -webkit-box 怎么实现多行截断呢 ？**  

其实上面的努力已经实现了右下角环绕的效果，如果在知道行数的情况下设置一个最大高度，是不是也完成了多行截断呢？为了便于设置高度，可以添加一个**行高 line-height**，如果需要设置成 3 行，那高度就设置成 **line-height * 3**

```
.text {
  /*
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  */
  line-height: 1.5;
  max-height: 4.5em;
  overflow: hidden;
}
```

为了方便更好的控制行数，这里可以把常用的行数通过属性选择器独立出来（通常不会太多），如下

```
[line-clamp="1"] {
  max-height: 1.5em;
}
[line-clamp="2"] {
  max-height: 3em;
}
[line-clamp="3"] {
  max-height: 4.5em;
}
...
```

```
<!--3行-->
<div class="text" line-clamp="3">
...
</div>
<!--5行-->
<div class="text" line-clamp="5">
 ...
</div>
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMKcYIiaXXOIV1SLXh8icPgrcTgkSEoBKRtjZJ1ibkNAWNkOU4ljT9rCicKw/640?wx_fmt=png)可以看到基本上正常了，除了没有省略号，现在加上省略号吧，跟在展开按钮之前就可以了，可以用伪元素实现

```
.btn::before{
  content: '...';
  position: absolute;
  left: -10px;
  color: #333;
  transform: translateX(-100%)
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMztVM9ydxBZCJkBcPA7PFosxFwmV1kLsQZTv01GKDAnntK9qFVxeIIg/640?wx_fmt=png)

这样，**Safari** 和 **Firefox** 的兼容布局基本上就完成了，完整代码可以查看 codepen 右下角多行展开环绕效果（全兼容）[4]

一

**二、“展开” 和 “收起”  两种状态**


===========================

提到 CSS 状态切换，大家都能想到 **input type="checkbox"** 吧。这里我们也需要用到这个特性，首先加一个 **input** ，然后把之前的 **button** 换成 **label** ，并且通过 **for** 属性关联起来

```
<div class="wrap">
  <input type="checkbox" id="exp">
  <div class="text">
    <label class="btn" for="exp">展开</label>
    浮动元素是如何定位的
  正如我们前面提到的那样，当一个元素浮动之后，它会被移出正常的文档流，然后向左或者向右平移，一直平移直到碰到了所处的容器的边框，或者碰到另外一个浮动的元素。
  </div>
</div>
```

这样，在点击 **label** 的时候，实际上是点击了 **input** 元素，现在来添加两种状态，分别是只显示 3 行和不做行数限制

```
.exp:checked+.text{
  -webkit-line-clamp: 999; /*设置一个足够大的行数就可以了*/
}
```

兼容版本可以直接设置最大高度 **max-height** 为一个较大的值，或者直接设置为 **none**

```
.exp:checked+.text{
  max-height: none;
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMbxkIk9OA8vM1LFvhBtIBMR2DXegXj9ngXic6Z4bPxjEiaic7hKmPqcr7Q/640?wx_fmt=gif)这里还有一个小问题，“展开” 按钮在点击后应该变成 “收起”，如何修改呢？

有一个技巧，凡是碰到需要动态修改内容的，都可以使用伪类 **content** 生成技术，具体做法就是去除或者隐藏按钮里面的文字，采用伪元素生成

```
<label class="btn" for="exp"></label><!--去除按钮文字--
```

```
.btn::after{
  content:'展开' /*采用content生成*/
}
```

添加 **:checked** 状态

```
.exp:checked+.text .btn::after{
  content:'收起'
}
```

兼容版本由于前面的省略号是模拟出来的，不能自动隐藏，所以需要额外来处理

```
.exp:checked+.text .btn::before {
    visibility: hidden; /*在展开状态下隐藏省略号*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMM1wS8woEauOfV1z8ej2z8lJowKk10eYNBtmU981YSfxtPBB9kfsRunQ/640?wx_fmt=gif)

基本和本文开头的效果一致了，完整代码可以查看 codepen 多行展开收起交互 [5]，兼容版本可以查看 codepen 多行展开收起交互（全兼容）[6]

还有一点，如果给 **max-height** 设置一个合适的值，注意，**是合适的值**，具体原理可以参考 CSS 奇技淫巧：动态高度过渡动画 [7]，还能加上过渡动画

```
.text{
  transition: .3s max-height;
}
.exp:checked+.text{
  max-height: 200px; /*超出最大行高度就可以了*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMVGjuKmqUzQYL7tNAh1cEgc1RC58omzbQh1buetQFmzdQv3qeCsIFMA/640?wx_fmt=gif)

一

**三、文本行数的判断**


=================

上面的交互已经基本满足要求了，但是还是会有问题。比如当**文本较少时**，此时是没有发生截断，也就是没有省略号的，但是 “展开” 按钮却仍然位于右下角，如何隐藏呢？

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMiaBDpRs20ibMnksK9Au0ZNwl9aGMfsoicl5A963BiaMFvcy8vuiad8QfpYg/640?wx_fmt=png)

通常 js 的解决方式很容易，比较一下元素的 **scrollHeight** 和 **clientHeight** 即可，然后添加相对应的类名。下面是伪代码

```
if (el.scrollHeight > el.clientHeight) {
  // 文本超出了
  el.classList.add('trunk')
}
```

那么，CSS 如何实现这类判断呢？

可以肯定的是，CSS 是没有这类逻辑判断，大多数我们都需要从别的角度，采用 **“障眼法”** 来实现。比如在这个场景，当没有发生截断的时候，表示文本完全可见了，这时，如果在**文本末尾**添加一个元素（红色小方块），为了不影响原有布局，这里设置了绝对定位

```
.text::after {
    content: '';
    width: 10px;
    height: 10px;
    position: absolute;
    background: red;
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMD5adB9fqClU223l4ckDiby54erZ8BysxcibPESJZjIdgPVdOqMXYOMSw/640?wx_fmt=gif)

可以看到，这里的红色小方块是完全跟随省略号的。当省略号出现时，红色小方块必定消失，因为已经被挤下去了，这里把父级 **overflow: hidden** 暂时隐藏就能看到是什么原理了

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMT3xBOT8AJib5RkSgZBAEOlWAcSjBQjdMVgABuWO8EVUWcA0DKviaVqibA/640?wx_fmt=gif)

然后，可以把刚才这个红色的小方块设置一个**足够大的尺寸**，比如 **100% * 100%**

```
.text::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background: red;
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2nbjpNKl6iaweBIG5XNfpJZ5OtLOJ2zjRf2b1AHRkt7ibamHm9tA8diauDp5jaf3t99dshdprs2ib5Gjg/640?wx_fmt=gif)

可以看到，红色的块块把右下角的都覆盖了，现在把背景改为白色（和父级同底色），父级  **overflow: hidden** 重新加上

```
.text::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    background: #fff;
} 
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMxWujGRkK0YbwTGVl7rBwysVy3NhVNNV4uc309LiaDNGA7micXFGWIGzA/640?wx_fmt=gif)

现在看看点击展开的效果吧 

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMwZvfExNoibg0fd2CkUyycw5Tz6mdyeibHMahLicaKiaCQooKHzoBiaicZHSQ/640?wx_fmt=gif)

现在展开以后，发现按钮不见（被刚才那个伪元素所覆盖，并且也点击不了），如果希望点击以后仍然可见呢？添加一下 **:checked** 状态即可，在展开时隐藏覆盖层

```
.exp:checked+.text::after{
    visibility: hidden;
}
```

这样，就实现了在文字较少的情况下隐藏展开按钮的功能

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMMLhky4t1zvf7H4Hnkd4dwibicq9TB3lqYbiaBVPZrAbeGDkmhGUKb13lCw/640?wx_fmt=gif)

最终完整代码可以查看 codepen 多行展开收起自动隐藏 [8]，兼容版本可以查看 codepen 多行展开收起自动隐藏（全兼容）[9]

> 需要注意的是，兼容版本可以支持到 **IE 10+**（这就过分了啊，居然还支持 IE），但是由于 IE 不支持 codepen，所以测试 IE 可以自行复制在本地测试。

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lLibAGQHG2WYd2QLWjzPfMM3UibVvHibJxb46VCDsZlERONo3hpGZS4phfV8bficHxjKI471FzNqjCtg/640?wx_fmt=gif)

一


=====================================================================================================================================================

**四、总结和说明**


===============

总的来说，重点还是在**布局方面**，交互其实相对容易，整体实现的成本其实是很低的，也没有比较生僻的属性，除了布局方面 **-webkit-box** 貌似有点 bug （毕竟是 **-webkit- 内核**，火狐只是借鉴了过来，难免有些问题），幸运的是可以通过另一种方式实现多行文本截断效果，兼容性相当不错，基本上全兼容（**IE10+**），这里整理一下实现重点：

*   文本环绕效果首先考虑 **浮动 float**
    
*   **flex 布局**子元素可以通过百分比计算高度
    
*   多行文本截断还可以结合文本环绕效果用 **max-height** 模拟实现
    
*   状态切换可以借助 **checkbox**
    
*   CSS 改变文本可以采用**伪元素**生成
    
*   多利用 CSS 遮挡 **“障眼法”**
    

多行文本展开收起效果可以说是业界一个**老大难**的问题了，有很多 js 解决方案，但是感觉都不是很完美，希望这个全新思路的 CSS 解决方式能给各位带来不一样的启发，感谢阅读，欢迎点赞、收藏、转发～

**References**

_[1]_ _vue-clamp: https://justineo.github.io/vue-clamp/demo/?lang=zh&fileGuid=XtpJhGpvWxj6qcTr__[2]_ _css-flexbox: https://www.w3.org/TR/css-flexbox-1/#algo-stretch?fileGuid=XtpJhGpvWxj6qcTr__[3]_ _codepen 右下角多行展开环绕效果: https://codepen.io/xboxyan/pen/ExWaBJO?fileGuid=XtpJhGpvWxj6qcTr__[4]_ _codepen 右下角多行展开环绕效果（全兼容）: https://codepen.io/xboxyan/pen/dyvYNxr?fileGuid=XtpJhGpvWxj6qcTr__[5]_ _codepen 多行展开收起交互: https://codepen.io/xboxyan/pen/XWMbJeQ?fileGuid=XtpJhGpvWxj6qcTr__[6]_ _codepen 多行展开收起交互（全兼容）: https://codepen.io/xboxyan/pen/OJpypmR?fileGuid=XtpJhGpvWxj6qcTr__[7]_ _CSS 奇技淫巧：动态高度过渡动画: https://github.com/chokcoco/iCSS/issues/91?fileGuid=XtpJhGpvWxj6qcTr__[8]_ _codepen 多行展开收起自动隐藏: https://codepen.io/xboxyan/pen/eYvNvYK?fileGuid=XtpJhGpvWxj6qcTr__[9]_ _codepen 多行展开收起自动隐藏（全兼容）: https://codepen.io/xboxyan/pen/LYWpWzK?fileGuid=XtpJhGpvWxj6qcTr_

———————   Y  ·  F  ·  E   ———————

   本文作者：严文彬  
转载请向阅文前端团队微信公众号（id：yuewen_YFE）获取授权，并注明作者、出处和链接

欢迎大家关注我们掘金和知乎分享账户：阅文前端团队