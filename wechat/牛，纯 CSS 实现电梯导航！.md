> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/urV7mWYBrI9JZxZtqapyXw)

我们经常会在博客、文档中看到类似这样的侧边导航目录，例如

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVccva9jmo3KowGHsrpA2LIlfyJwj4hbicmvtXMIj10KSvPV9ibKoFZ3vVg/640?wx_fmt=png&from=appmsg)

这种导航也被称为 “电梯导航”（当然可能还有其他叫法，知道是这个交互就行）。它会随着内容的滚动而自动切换当前选中态，点击任意目录也会自动滚动到对应标题，就像这样

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVccqQNE1gqDLwXUl4phtoGkdz2vsv6H4TqibdKr0e4nicMWcgTydfDEcdg/640?wx_fmt=gif&from=appmsg)

通常要实现这样一个交互肯定少不了`JS`，常规的做法是监听滚动事件，也可以用`IntersectionObserver`监听元素的滚动位置状态，下面有一篇关于用`IntersectionObserver`的实现

> 尝试使用 JS IntersectionObserver 让标题和导航联动：https://www.zhangxinxu.com/wordpress/2020/12/js-intersectionobserver-nav 

大家可能也发现了，这个交互最大的特点就是滚动，是不是也可以联想到 `CSS`滚动驱动动画呢？经过一番尝试，发现纯 `CSS`也能完美实现，而且实现更加简单（不到 10 行），下面是我复刻的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVckS7BtDAlSkuzNzZz8jpqd1LzwN346qDJfzicicibGA07vTmhevBHS4bKA/640?wx_fmt=gif&from=appmsg)

是不是非常神奇？`CSS` 还能实现这样的效果？一起看看吧

一、CSS 滚动锚定
----------

这个导航主要有两个交互：

1.  点击导航会自动滚动到页面对应位置
    
2.  页面滚动会自动切换导航选中态
    

第一条比较容易，我们可以直接用`a`标签的能力实现锚定跳转。假设`HTML`结构如下

```
<nav>  <a>一、标题一</a>  <a>二、标题二</a>  <a>三、标题三</a>  <a>四、标题四</a>  <a>五、标题五</a>  <a>六、标题六</a></nav><h1>CSS 电梯导航</h1><div class="content">  <h2>一、标题一</h2>  <section>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>  </section></div><div class="content">  <h2>二、标题二</h2>  <section>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>  </section></div><div class="content">  <h2>三、标题三</h2>  <section>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>  </section></div><div class="content">  <h2>四、标题四</h2>  <section>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>  </section></div><div class="content">  <h2>五、标题五</h2>  <section>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>  </section></div><div class="content">  <h2>六、标题六</h2>  <section>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>    <span></span>  </section></div>
```

然后简单修饰一下

```
body{  padding: 0 15px;}h2{  margin: 0;  padding: .8em 0;  scroll-margin: 20px;}nav{  position: fixed;  top: 15px;  right: 15px;  background: #fff;  padding: 10px 0;  border-radius: 4px;  overflow: hidden;}nav>a{  position: relative;  display: block;  line-height: 2;  padding: 0 15px;  font-size: 14px;  color: #191919;  text-decoration: none;}nav>a:hover{  background-color: #d5d5d54a;}section{  display: flex;  flex-wrap: wrap;  gap: 10px;}section span{  width: 30%;  height: 100px;  border-radius: 4px;  background-color: #E4CCFF;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcWZ9gQichMbagSaW32MrfVZxS4jor7fMlTknKTE0lXCDibJ13mftaAcibA/640?wx_fmt=png&from=appmsg)

然后我们只需要给`a`标签添加`href`属性，页面相对应的地方指定相同的`id`，就像这样

```
<nav>  <a href="#t1">一、标题一</a>  <a href="#t2">二、标题二</a>	...</nav><div class="content">  <h2 id="t1">一、标题一</h2>  <section>    ...  </section></div><div class="content">  <h2 id="t2">二、标题二</h2>  <section>    ...  </section></div>
```

这样点击`a`标签会自动锚点到对应位置，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcbb382VUblvq1s7B5Z2nRAFG4wV3YBRkPsaKSNaXmcze5wb5LST5Cxg/640?wx_fmt=gif&from=appmsg)

这样就能跳转了，如果你觉得有点生硬，可以加入滚动动画

```
body{  /**/  scroll-behavior: smooth;}
```

这样就平滑多了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcH8ibiam3GVpfNUQzIj4gzu0fk8EUewf72nEv13dIMbzKvgEEQ5MtW0rw/640?wx_fmt=gif&from=appmsg)

这样就实现了滚动锚定效果，还算比较容易。

下面来看如何实现滚动联动效果。

二、CSS 滚动驱动动画
------------

我们可以想一下，如果是`IntersectionObserver`该如何做呢？没错，就是监听每一块区域的出现时机，然后改变导航的状态

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVccyrOepLAkz18QjPfYpvxFxAa5nNu32zdbYDlrFOIxiciaswNVJgPLbXw/640?wx_fmt=png&from=appmsg)

刚好`CSS`滚动驱动动画中的`view-timeline`可以实现类似的效果。它可以**「监测到元素在可视区」**的情况，更多详细可以回顾之前这篇文章

> [CSS 滚动驱动动画终于正式支持了~](http://mp.weixin.qq.com/s?__biz=MzIyMDc1NTYxNg==&mid=2247487775&idx=1&sn=54d09243e36c7d5470982d4237bf8303&chksm=97c672d0a0b1fbc6676ce29a16e13f186689e253d0d7c1454fb95c8d9530b7d443468b94ad4b&scene=21#wechat_redirect) 

不过，单独依靠`view-timeline`还不行，因为默认情况下，`CSS` 滚动驱动作用范围只能影响到子元素，而我们的`dom`结构明显是分离的

```
<nav>  <a href="#t1">一、标题一</a>  <a href="#t2">二、标题二</a>	...</nav><div class="content">  <h2 id="t1">一、标题一</h2>  <section>    ...  </section></div><div class="content">  <h2 id="t2">二、标题二</h2>  <section>    ...  </section></div>
```

为了解决这个问题，我们需要用到 `CSS` 时间线范围，也就是 `timeline-scope`

> https://developer.mozilla.org/en-US/docs/Web/CSS/timeline-scope

这里简单介绍一下，假设有这样一个结构

```
<div class="content">  <div class="box animation"></div></div><div class="scroller">  <div class="long-element"></div></div>
```

这是两个元素，右边的是滚动容器，左边的是一个可以旋转的矩形

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcbhoIDFoRLa8QPzD0u4ibDEuuhmIgbiawqm2Rw5rnVJ55Qh2IOczKpAcQ/640?wx_fmt=png&from=appmsg)

我们想实现滚动右边区域时，左边矩形跟着旋转，如何实现呢？

可以给他们共同的父级，比如`body`定义一个`timeline-scope`

```
body{  timeline-scope: --myScroller;}
```

然后，滚动容器的滚动和矩形的动画就可以通过这个变量关联起来了

```
.scroller {  overflow: scroll;  scroll-timeline-name: --myScroller;  background: deeppink;}.animation {  animation: rotate-appear;  animation-timeline: --myScroller;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcQgSnO2z1Y60oBUYS3ajwEhwKByYib0N0whzibjxqfnRJdED1T5NUkm7g/640?wx_fmt=gif&from=appmsg)

这样就实现任意元素间的滚动联动。

回到这里，我们要做的事情其实很简单，给父级（body）定义多个`timeline-scope`，然后给内容区域和导航区域都绑定一个相同`CSS`变量，具体做法如下

```
<body style="timeline-scope: --t1,--t2,--t3,--t4,--t5,--t6;">  <nav>    <a href="#t1" style="--s: --t1">一、标题一</a>    <a href="#t2" style="--s: --t2;">二、标题二</a>    <a href="#t3" style="--s: --t3">三、标题三</a>    <a href="#t4" style="--s: --t4">四、标题四</a>    <a href="#t5" style="--s: --t5">五、标题五</a>    <a href="#t6" style="--s: --t6">六、标题六</a>  </nav>  <h1>CSS 电梯导航</h1>  <div class="content" style="--s: --t1">    <h2 id="t1">一、标题一</h2>    <section>      ...    </section>  </div>  <div class="content" style="--s: --t2">    <h2 id="t2">二、标题二</h2>    <section>      ...    </section>  </div>  <div class="content" style="--s: --t3">    <h2 id="t3">三、标题三</h2>    <section>      ...    </section>  </div>  <div class="content" style="--s: --t4">    <h2 id="t4">四、标题四</h2>    <section>      ...    </section>  </div>  <div class="content" style="--s: --t5">    <h2 id="t5">五、标题五</h2>    <section>      ...    </section>  </div>  <div class="content" style="--s: --t6">    <h2 id="t6">六、标题六</h2>    <section>      ...    </section>  </div>
```

然后给内容区域添加`view-timeline-name`，导航标签添加 `animation-timeline`，让这两者关联起来，也就是内容滚动时，导航的动画跟着执行，这里的动画很简单，就是改变导航链接的文字颜色和边框颜色，关键实现如下

```
.content{  view-timeline-name: var(--s);}nav>a{  /**/  animation: active;  animation-timeline: var(--s);}@keyframes active {  0%,100% {    color: #6f00ff;    border-color: #6f00ff;  }}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVc8ceguz2UODuMJQW9cStQNqre8MeRKDOzl57UO0InIibsL2NWdUk7I5Q/640?wx_fmt=gif&from=appmsg)

这样滚动联动效果基本就出来了，不过还是有些小问题，接着优化

三、CSS 滚动视区范围
------------

前面的实现其实还个小问题，右边的导航会同时选中多个

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcXpYPXgicicLe7ltpEouZvdibzaqbBricRRvzpicRJIsDSZ9y3KCQkL1OkJg/640?wx_fmt=png&from=appmsg)

很明显是因为左侧的内容同时出现了这两部分区域。

如果每一块内容高度更少，那同时选中的就更多了，就像这样

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcM60L0CJkEhFsWQT0hiaWcf8LzuSCtZvQuKzrr5GRuN51dic1ywO0gB0Q/640?wx_fmt=png&from=appmsg)

而我们需要的肯定是同一时刻只选中一个导航，你可以自己定义规则，比如后面的优先于前面的。

那`CSS`该如何实现这样的效果呢？

其实，这里需要换一种思维，上面的实现之所以会同时出现多个选中，是因为视区范围太大，是整个屏幕，所以可以同时匹配到多个内容区域。

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVctOjbgibedkJBBhe6LMO71UyoFAcF9Xtpzss8qiaRN20iagJqqsReDeiafg/640?wx_fmt=png&from=appmsg)

因此，我们可以手动的减少视区范围，一直减少成一条线，这样无论怎样滚动，都只会匹配一个区域

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcDOeYviaGrcNWRCsIPa2Aj3XClxKu3ux51bbO925IOMjCSu89rpqRmKA/640?wx_fmt=png&from=appmsg)

在这里，我们可以通过`view-timeline-inset`来手动改变视区范围，默认是`0`

比如我们希望以滚动区域中间为分割线，只要滚动到达这个点，就高亮当前导航，可以这样实现

```
.content{  view-timeline-name: var(--s);  view-timeline-inset: 50%; /*完整写法是 50% 50%*/}
```

为了方便演示，我在滚动区域中间加了一条红色的线，便于观察

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcSmlMmZjAUDia4FGW27fRL4JPYUs8Zc1DfBicQZ36VfNiaiaGvibmn3cISSw/640?wx_fmt=gif&from=appmsg)

可以很清楚的发现，只要越过这条线，导航马上触发高亮选中。

当然你也可以自己调整这个临界线，比如下面的表示在距离滚动区域底部`30%`的地方做判断

```
.content{  view-timeline-name: var(--s);  view-timeline-inset: 70% 30%; }
```

这样就实现了我们想要的效果了，你也可以访问以下在线链接查看实际效果（chrome 116+）

*   CSS 电梯导航 (codepen.io)[1]
    
*   CSS 电梯导航 (juejin.cn)[2]
    

四、兼容性和总结
--------

看似这么多，其实核心代码就这几行

```
body{  timeline-scope: --t1,--t2,--t3,--t4,--t5,--t6;}.content{  view-timeline-name: var(--s);  view-timeline-inset: 50%;}nav>a{  animation: active;  animation-timeline: var(--s);}@keyframes active {  0%,100% {    color: #6f00ff;    border-color: #6f00ff;  }}
```

包括在`HTML`中的几行自定义变量，是不是还不到 10 行？相比 `JS`实现，代码更简单，性能也更好，无需初始化，也不用等待 `dom` 加载，扩展性也强。

唯一的缺点可能是兼容性不足，由于依赖`timeline-scope`，所以必须`Chrome 116+`，完整兼容性如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIQAVkrXBz8dQl77affhIVcCmTnzsNJ0r925r3GC1Z4Y74ibYVE5Xicu6O1vCo4NdGnV01zTw9mTJSQ/640?wx_fmt=png&from=appmsg)

下面总结一下

1.  滚动锚定可以借助`a`标签和`#id`实现自动滚动跳转
    
2.  `scroll-behavior: smooth`可以实现平滑滚动
    
3.  默认情况下，CSS 滚动驱动作用范围只能影响到子元素，但是通过`timeline-scope`，可以让任意元素都可以受到滚动驱动的影响。
    
4.  利用`timeline-scope`，我们可以将每个内容的位置状态和每个导航的选中状态联动起来
    
5.  右边的导航会同时选中多个是因为左边的滚动视区太大了，可以同时包含多个内容区域
    
6.  可以用`view-timeline-inset`来手动改变视区范围，缩小成一条线，这样无论怎样滚动，都只会匹配一个区域
    
7.  兼容性还不足，目前是`Chrome 116+`
    

总的来说，`CSS`滚动驱动动画不愧是`2023`年度最强特性，可以做的事情太多了，很多 `JS`才能实现的交互都可以取代了，而且做的更好，至于兼容性，还是留给时间吧。关注我，学习更多有趣的前端新特性。最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发 ❤❤❤

[1]CSS 电梯导航 (codepen.io)： _https://codepen.io/xboxyan/pen/zYVBEWq_

[2]CSS 电梯导航 (juejin.cn)： _https://code.juejin.cn/pen/7396195867155562508_

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)  

`点赞`和`在看`是最大的支持 ⬇️❤️⬇️