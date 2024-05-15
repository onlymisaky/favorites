> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Y7koJGkabYEBHH1tQlLzzQ)

> 介绍一个 **CSS** 实用技巧  

一直以来，`CSS` 都无法很好的检测出一段文本是否溢出。但这又是一个非常普遍的需求，比如多行文本展开，展开按钮只有在文本溢出的时候才出现

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlF8wiaiaDfmQRR3ojDhNJ5sOjrF6Ehk4OkhFX0G3mIpsicxpy1s1GMdw1bw/640?wx_fmt=png&from=appmsg)

由于无法直接`CSS`判断，这使得不得不借助 `JavaScript`或者`CSS`奇技淫巧来实现，之前提到了不下于 3 种不同的思路来解决这个问题，在以下这些文章中都有提到

*   [dom 获取不到？试试 CSS 动画监听元素渲染吧](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247488972&idx=1&sn=af3627319295b984c362fd25805ddb7e&chksm=97c67603a0b1ff15ae8675f1ab20b87cd98cb619ac61540eca7b4cafdd65f539626e7fe6dca5&scene=21#wechat_redirect)
    
*   [尝试借助 CSS @container 实现多行文本展开收起](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247488723&idx=1&sn=8376aee095e38cb26bc4946ed2519869&chksm=97c6771ca0b1fe0ac7cd68f11dd0a2b1f36c2cb2b449e4f4117bf764c00336af655afd265059&scene=21#wechat_redirect)
    
*   [突发奇想！借助 CSS 自定义彩色字体来实现多行文本展开收起](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487165&idx=1&sn=0f3453887f04567a07ddcbeeaa7c5d8d&chksm=97c66d72a0b1e46425f57fcdd070f48101d6491a2e96864b1cecfef1e6adfd059af4172f9f7c&scene=21#wechat_redirect)
    
*   [CSS 实现多行文本 “展开收起”](http://mp.weixin.qq.com/s?__biz=MzU4MzUzODc3Nw==&mid=2247484409&idx=1&sn=16867c8fd111b6e5c18b5740015d9397&chksm=fda6c2cfcad14bd99bec298d3dd2acf8e919192dc06dde2f60f38c6beb3702f3f7ceb9ca3b50&scene=21#wechat_redirect)
    
*   [CSS 文本超出提示效果](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247486979&idx=1&sn=33baac8afc1a614b826be5e4ec1a223f&chksm=ce256df5f952e4e372f002d234f8e1332b16440f16d86c60b161a3883a161af133370bfaec5f&scene=21#wechat_redirect)
    

有兴趣的可以回顾一下，还是挺有意思的

时代在进步，`CSS`也在不断推出新特性，现在，`CSS`终于可以完美的解决这个问题了，也就是可以准确无误地判断文本是否溢出了，一起看看吧

一、CSS 滚动驱动动画
------------

要实现文本溢出检测，需要用到两个新特性

1.  CSS 滚动驱动动画
    
2.  CSS 样式查询
    

为什么是这两个呢？听我慢慢分析。

首先我们想一想，在 `JS`中是如何判断是否溢出的？很简单

```
dom.scrollHeight > dom.offsetHeight;
```

其实也就是表示这个容器是 “可滚动” 的，因为滚动高度超过了可视高度

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFCWb0uATa4APMe8Rpdo013DUW93tYXJdNEZH7ksq7utFQUk2icEnCgicw/640?wx_fmt=png&from=appmsg)

回到 `CSS` 这里，有没有办法区分呢？答案就是`CSS`滚动驱动动画

> 关于 CSS 滚动驱动动画，可以先回顾这篇文章：[CSS 滚动驱动动画终于正式支持了~](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487775&idx=1&sn=54d09243e36c7d5470982d4237bf8303&chksm=97c672d0a0b1fbc6676ce29a16e13f186689e253d0d7c1454fb95c8d9530b7d443468b94ad4b&scene=21#wechat_redirect) 

假设有这样一个布局，就两段文本

```
<div class="txt">  欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。</div><div class="txt">  欢迎关注前端侦探</div>
```

稍微修饰一下，给个高度，让文本可以超出滚动

```
.txt{  height: 4em;  padding: 8px;  outline: 1px dashed #9747FF;  font-family: cursive;  border-radius: 4px;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFuRBkljQPzf4gNet0bf98qlBqDVxfhjxZOlvvcvrBlDkzicfrIjoVCeQ/640?wx_fmt=png&from=appmsg)

左边是可以滚动的，右边是不能滚动的。

现在，我们给左边加一个滚动驱动动画，在滚动时慢慢改变文本的颜色

```
.txt{  animation: check 1s;  animation-timeline: scroll(self);}@keyframes check{  to {    color: #9747FF;  }}
```

注意这个`scroll(self)`，`self`表示监听自身滚动，默认是最近的祖先滚动容器，效果是这样的

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFGErVSWOLqwvYxXX0KazLUpHDU3J2IrMAyPl8WGV0ecWhf05Sa8ibl3Q/640?wx_fmt=gif&from=appmsg)

可以看到随着滚动，左边文本的颜色也慢慢变化了

接着激进一点，我们在动画中把起始点都设置成一样，这样还没开始滚动就自动变色了

```
@keyframes check{  from,to {     /*动画起始点设置成相同*/    color: #9747FF;  }}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFsVcNCV15ibb0PbNqTEFtJXHcz1ZnIWOfsWrJELz4KiaGSTI8xKuuOSfg/640?wx_fmt=png&from=appmsg)

这样即使还没开始滚动，也能提前知道是否可滚动了

然后，我们可以设置超出隐藏，也就是让滚动容器 “不能滚动”

```
.txt{  overflow: hidden;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFsVcNCV15ibb0PbNqTEFtJXHcz1ZnIWOfsWrJELz4KiaGSTI8xKuuOSfg/640?wx_fmt=png&from=appmsg)

也就是说这种情况下，`CSS`滚动驱动动画仍然可以被触发。尝试了一下，只要不是`overflow:visible`，`CSS`都认为是 “可滚动” 的，即 “溢出” 状态。

最后，我们将文本设置成超出显示省略号

```
.txt{  display: -webkit-box;  -webkit-box-orient: vertical;  -webkit-line-clamp: 3;  overflow: hidden;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFZqDaxGoibc6uD9wQVzB2a8lhKqQOmCSHgbDYicOfSLId9vKWj4AqPVwQ/640?wx_fmt=png&from=appmsg)

是不是有点能区分文本是否溢出了？至少目前从文本颜色可以很好判断

当然，仅仅这样是不够，还需要更加自由，比如在超出时可以控制其他标签的状态，这就需要用到 CSS 样式查询了

二、CSS 样式查询
----------

下面介绍一下`CSS`样式查询。

> @container - CSS: Cascading Style Sheets | MDN (mozilla.org)[1]

CSS 样式查询是容器查询的一部分，从名称也可以看出，它可以查询元素的样式，进而设置额外的样式。

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFRlG5CaJz6f9N1ssr2HCPjYKHV2icK7W35K84CTBpkctR8HcKrMtiaqAg/640?wx_fmt=png&from=appmsg)

比如，我们要查询颜色为红色的容器，然后给子元素设置背景色为黑色，可以这样

```
<style>  div{    color:red;  }  @container style(color: red) {    p {      background: black;    }	}</style><div>  <p>      </p></div>
```

有人可能会有疑问，为啥要设置子元素，直接设置本身不好吗？其实是为了避免冲突，假设查询到了`color:red`，然后你又设置了`color:yellow`，那浏览器该如何渲染呢？有点死循环了。所以为了避免这种情况，所有容器查询都只能设置子元素样式。

不过这种写法目前还不支持，仅支持`CSS`变量的写法，类似于这样

```
<style>  div{    --color:red;  }  @container style(--color: red) {    p {      background: black;    }	}</style><div>  <p>      </p></div>
```

回到前面的例子，我们可以给文本加一个`CSS`变量，就叫做 `--trunc`吧，表示截断

```
.txt{  --trunc: false;}
```

然后在滚动驱动动画中改变这个变量

```
@keyframes check{  from,to {     /*动画起始点设置成相同*/    color: #9747FF;    --trunc: true;  }}
```

这样一来，滚动驱动动画执行的时候，这个变量也被赋值了。

最后我们就可以查询这个样式，给子元素设置样式了，这里我们就用伪元素代替

```
@container style(--trunc: true) {  .txt::after{    content: '';    position: absolute;    inset: 2px;    border: 1px solid red;  }}
```

这段代码表示当查询到`--trunc: true`的条件时，设置相应的样式，这里是画了一个红色的边框，效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFrLPovxPAYI0OlydiaR4e5lpia8dNseh4vdHSricFzHBNTcicQgGM8q8iaWA/640?wx_fmt=png&from=appmsg)

是不是非常容易？

你也可以查看以下在线链接（注意兼容性，需要 `Chrome 115+`，以下相同）：

*   CSS animation-timeline + @ container style (codepen.io)[2]
    
*   CSS animation-timeline + @ container style (juejin.cn)[3]
    

有了这个作为区分，可做的事情就比较多了，下面来看几个例子

三、CSS 多行文本展开收起
--------------

这已经是第四次用不同方式来实现这个效果了，前几次的实现可以参考文章开头部分。

这次来看新的实现方式。

首先还是把之前的结构拿过来，这些结构是为了实现右下角的 “展开” 按钮必不可少的，如果不太清楚是如何布局的，建议好好回顾一下之前这篇文章：CSS 实现多行文本 “展开收起”[4]

```
<div class="text-wrap">  <div class="text-content">    <label class="expand"><input type="checkbox" hidden></label>    欢迎关注前端侦探，这里有一些有趣的、你可能不知道的HTML、CSS、JS小技巧技巧。  </div></div>
```

相关 `CSS` 如下

```
.text-wrap{  display: flex;  position: relative;  width: 300px;  padding: 8px;  outline: 1px dashed #9747FF;  border-radius: 4px;  line-height: 1.5;  text-align: justify;  font-family: cursive;}.expand{  font-size: 80%;  padding: .2em .5em;  background-color: #9747FF;  color: #fff;  border-radius: 4px;  cursor: pointer;  float: right;  clear: both;}.expand::after{  content: '展开';}.text-content{  display: -webkit-box;  -webkit-box-orient: vertical;  -webkit-line-clamp: 3;  overflow: hidden;}.text-content::before{  content: '';  float: right;  height: calc(100% - 24px);}.text-wrap:has(:checked) .text-content{  -webkit-line-clamp: 999;}.text-wrap:has(:checked) .expand::after{  content: '收起';}
```

这时的效果是这样的

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFM9p7rtic0821K0v5Bafq4o8qANkUY1GWpiaZVicInC9rz8QbuYxZ8f7kA/640?wx_fmt=png&from=appmsg)

通过上一节的原理，我们通过滚动驱动动画来判断是否溢出，并使用`CSS`变量作为标识，然后利用样式查询来控制展开按钮的显示状态，关键实现如下

```
.expand{	/**/  display: none;}.text-content{  --trunc: false;  animation: check 1s;  animation-timeline: scroll(self);}@keyframes check{  from,to {    --trunc: true;  }}@container style(--trunc: true) {  .expand{    display: initial;  }}
```

展开按钮默认是隐藏的，这样只有在文本溢出的时候才出现，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFI18R8mCe5kTH9cr6y75FnkGfhcsKEnicjJ3XyZ181pKY58MPEGiaqoUQ/640?wx_fmt=gif&from=appmsg)

效果出来了，不过在点击展开后按钮也跟着消失了。这是因为展开后，`CSS`检测出这时没有溢出，所以样式查询里的语句就不生效了，自然也就回到了之前的隐藏状态。

要解决这个问题也很简单，在展开的时候始终显示按钮就行了, 用`:checked`可以判断是否展开

```
.text-wrap:has(:checked) .expand{  display: initial;}
```

这样就正常了，完美！

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFbVPqvgCprl5yDPNlnTfrNDshmz8VcMvOrFicS6Pf4kXmSaG9wt9lzbw/640?wx_fmt=gif&from=appmsg)

CSS 方式的好处是监控是实时的，比如手动改变容器的宽度，也会自动显示或者隐藏这个按钮

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFOW8VQhe1T5VZOV9ruzq2jF4Dk0mUGXV5DEzSz9EXpYk4YO15A7Yjibw/640?wx_fmt=gif&from=appmsg)

完整 demo 可以查看以下在线链接（ `Chrome 115+`）：

*   CSS container style expand (codepen.io)[5]
    
*   CSS container style expand (juejin.cn)[6]
    

四、CSS 文本超出时显示 tooltips
----------------------

还有一个比较常见的需求，就是希望在文本出现省略号时，鼠标`hover`有`tooltips`提示，就像这样

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFtBBAsTl9pAK81tBAPf761FnH3PfWucWTLvSRuFE5jWNgdro0TCK8gA/640?wx_fmt=gif&from=appmsg)

原理和上面几乎一致，我们一步步来看

首先还是结构，没什么特别的

```
<div class="txt" data-title="这是一段可以自动出现tooltip的文本">  这是一段可以自动出现tooltip的文本</div>
```

这里加了一个`data-title`，是用来显示气泡的，通过伪元素`content`获取属性内容

```
.txt{  overflow: hidden;  white-space: nowrap;  text-overflow: ellipsis;  padding: 8px;  outline: 1px dashed #9747FF;  font-family: cursive;  border-radius: 4px;}.txt::after{  content: attr(data-title);  position: absolute;  top: 0;  width: fit-content;  left: 50%;  margin: auto;  transform: translate(-50%,-100%);  background-color: rgba(0,0,0,.6);  padding: .3em 1em;  border-radius: 4px;  color: #fff;  opacity: 0;  visibility: hidden;  transition: .2s .1s;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFjsP2uF8oWZOABYpOb27QCRjb6V6RBv8mzI3urAic1NwL9w9f19afJaQ/640?wx_fmt=png&from=appmsg)

目前是没有任何提示的。

下面加上`CSS`溢出检测，在检测到溢出时`hover`生效。仍然是相同的代码，添加一个滚动驱动动画，然后样式查询

```
.txt{  --trunc: false;  animation: check 1s;  animation-timeline: scroll(x self);}@keyframes check{  from,to {    --trunc: true;  }}@container style(--trunc: true) {  .txt:hover::after{    opacity: 1;    visibility: visible;  }}
```

注意，这里的`scroll(x self)`，加了一个`x`，因为这时的文本是横向溢出的，所以需要加上滚动驱动轴（默认是垂直方向）

另外，由于超出隐藏，所以`tooltip`需要一个新的父级，不然就被裁掉了

```
<div class="wrap">  <div class="txt" data-title="这是一段可以自动出现tooltip的文本">    这是一段可以自动出现tooltip的文本  </div></div>
```

```
.wrap{  position: relative;}
```

这样就能实现文本超出时显示 tooltips

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtILsg4PGPSeZYJwDQ7CvKlFtBBAsTl9pAK81tBAPf761FnH3PfWucWTLvSRuFE5jWNgdro0TCK8gA/640?wx_fmt=gif&from=appmsg)

完整 demo 可以查看以下在线链接（ `Chrome 115+`）：

*   CSS container style tooltip (codepen.io)[7]
    
*   CSS container style tooltip (juejin.cn)[8]
    

五、最后总结一下
--------

CSS 就是这么神奇，将两个几乎不相关的特性组合起来，就能实现完全不一样的功能，这可是在其他语言中做不到的，简单回顾一下 CSS 检测代码

```
.content{  --trunc: false;  animation: check 1s;  animation-timeline: scroll(x self); /*注意溢出方向*/}@keyframes check{  from,to {    --trunc: true; /*滚动驱动动画*/  }}/*查询溢出状态*/@container style(--trunc: true) { 	}
```

是不是非常容易，几乎是无侵入式的，下面总结一下本文重点

1.  要实现文本溢出检测，需要用到两个新特性，CSS 滚动驱动动画和 CSS 样式查询
    
2.  CSS 滚动驱动动画可以检测出容器是否可滚动，也就是溢出，即使是在超出隐藏的情况下
    
3.  CSS 样式查询可以查询到 CSS 变量的变化，从而设置不同的样式
    
4.  借助 CSS 滚动驱动动画和 CSS 样式查询，可以很轻松的实现文本溢出检测
    
5.  两个实例：CSS 多行文本展开收起和 CSS 文本超出时显示 tooltips
    

当然除了以上一些案例，还可以做的事情很多，比如以前有写一篇判断指定高度后就显示折叠按钮，也可以用这种方式来实现，几乎所有与溢出相关的交互都可以纯 CSS 完成。

至于兼容性，目前仅支持 `chrome 115+`，还是需要多等等，多多关注，说不定哪一天就能用上了呢，比如 5 年前推出的`CSS scroll snap`，现在几乎可以愉快使用了，再也无需`swiper.js`这样的库了。最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发 ❤❤❤

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQU4sjVF2flyxuQypSVkBlHDoUReEpkRJvXAibEskibiaRZAaj7nsbrLQllUBqxfXTAUfQ2HQX1Bz0Q/640?wx_fmt=jpeg)

[1]@container - CSS: Cascading Style Sheets | MDN (mozilla.org)： _https://developer.mozilla.org/en-US/docs/Web/CSS/@container_

[2]CSS animation-timeline + @ container style (codepen.io)： _https://codepen.io/xboxyan/pen/jORrXBe_

[3]CSS animation-timeline + @ container style (juejin.cn)： _https://code.juejin.cn/pen/7346120235966267427_

[4]CSS 实现多行文本 “展开收起”： _https://juejin.cn/post/6963904955262435336_

[5]CSS container style expand (codepen.io)： _https://codepen.io/xboxyan/pen/qBwaaWW_

[6]CSS container style expand (juejin.cn)： _https://code.juejin.cn/pen/7346120018578374694_

[7]CSS container style tooltip (codepen.io)： _https://codepen.io/xboxyan/pen/oNOzzYb_

[8]CSS container style tooltip (juejin.cn)： _https://code.juejin.cn/pen/7346125496281333814_