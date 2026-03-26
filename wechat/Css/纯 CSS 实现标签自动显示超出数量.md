> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TF6SWCKSFryeF1QOzi4d8g)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言

看到这个就想起游戏标签的场景。介绍了如何使用纯 CSS 实现在标签溢出容器时自动显示超出数量的功能，通过 CSS 计数器和滚动驱动动画技术，实现了在标签数量超出容器宽度时，自动计算并显示隐藏标签的数量。

现代 CSS 强大的令人难以置信。

这次我们来用 CSS 实现这样一个功能：有多个宽度不同的标签水平排列，当外层宽度不足时，会提示超出的数量，演示效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZqicMXwYR2SF6IibibNUrgR3Z6kb9hA07LUAE9D4F2Tu9n2H01nIEyPuFg/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

如果让我用 JavaScript 来实现估计都有点折腾，毕竟宽度都是动态的，要监听各部分的尺寸变化，包括标签的位置和外层的宽度，总之不是一两行代码就能搞定的。

现如今，纯 CSS 也能完美的实现这样的效果，而且比 JS 实现更加简单，一起来看看吧

#### 一、CSS 实现思路

很多时候，CSS 并没有直接的实现方式，需要 “绕” 点弯路，将需求拆分成很多小点，然后逐一突破。

回到本文这里，其实有几个问题需要考虑：

*   CSS 如何动态累计数字？
    
*   CSS 如何知道哪些元素在容器之外？
    
*   CSS 如何区分是否溢出（显示数量）
    

那么第一点，CSS 有没有什么方式可以统计数量呢？

没错，相信很多小伙伴已经猜到了，就是利用 CSS 计数器，示意如下

```
 counter-reset: num var(--num);
 counter-increment: num;
 ::after{
     content: "+"counter(num);
 }

```

然后是第二点，CSS 有什么方式可以知道元素是出去了还是在视野之内呢？

如果是用 JS 来判断的话，最稳妥的方式应该 Intersection Observer（交叉观察者），相信很多同学都用过，这个在图片懒加载非常有用。

那么，CSS 中有什么类似的呢？没错，还是之前提到过的 CSS 滚动驱动动画。

不过这里用到的是视图进度，也就是关注的是元素自身位置，元素进入到容器范围之内就会触发动画，非常类似 JS 中的 Intersection Observer

```
 tag{
   animation: appear;
   animation-timeline: view(inline);
   animation-range: contain;
 }
 @keyframes appear{
   to {
     background-color: #9747FF;
   }
 }

```

好了，关键原理就这些了，我们需要做的就是想办法将计数器和元素进出容器范围关联起来就行了，接着往下看

#### 二、CSS 计数器

利用 CSS 计数器，我们可以很轻松的统计元素的数量。

先简单布局一下文章开头的例子，HTML 如下所示

```
 <div class="con">
   <a class="tag">HTML</a>
   <a class="tag">CSS</a>
   <a class="tag">JavaScript</a>
   <a class="tag">Flutter</a>
   <a class="tag">Vue</a>
   <a class="tag">React</a>
   <a class="tag">Svelte</a>
 </div>
 <span class="num"></span><!--用来计数的标签-->

```

然后美化一下

```
 .con{
   display: flex;
   gap: 5px;
   padding: 5px;
   overflow: hidden;
 }
 .tag{
   padding: .2em .5em;
   background-color: #c49ef5;
   color: #fff;
   border-radius: 4px;
   animation: appear;
 }
 .num::after{
   content: "+0";
   padding: .2em .5em;
   background-color: #FFE8A3;
   color: #191919;
   border-radius: 4px;
 }

```

这样就得到了水平排列的 tag 布局（超出隐藏），后面跟一个数字

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85Ar2PbEseD4JUkJ8bicIcIgo5EBBMGHWHO5JQd7r1C6KuoSFvFAtCVSXQ/640?wx_fmt=png&from=appmsg)

现在我们定义一个计数器，然后通过每个 tag 进行累计，有多个 tag 相当于多少次累加，最后在`::after` 中显示出来

```
 .con{
   counter-reset: num;  /*计数器初始值，默认为0*/
 }
 .tag{
   counter-increment: num; /*计数器增量值，默认为1*/
 }
 .num::after{
   content: "+"counter(num);
 }

```

默认计数器的起始值是 0，每次累计是 1，所以这里最后得到了 7，这样就能实时统计元素的数量了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85A9nuVE5eOCyuCicDIQ2TSu3hicFYV1S9iayPeuSg4cx1C0mG0WAMc2HQ0A/640?wx_fmt=png&from=appmsg)

当然，我们也可以自定义这些默认值，比如

```
 .con{
   counter-reset: num 10;
 }
 .tag{
   counter-increment: num -1;
 }

```

这种情况下，起始值是 10，增量值是 - 1，所以最后得到了 3，如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85Am01xhqwwct7g6RNIKK3CFhWBGbWEv9icRKa7iaRVDAxhFHibcvmSibIMhg/640?wx_fmt=png&from=appmsg)

那么，该如何统计容器之外的标签数量呢？

#### 三、CSS 滚动驱动动画

这里我们要利用 CSS 视图进度时间轴，也就是观察元素自身的位置，在进入到容器范围之内执行动画。

拿上面这个例子，我们给标签添加一个动画，让标签在进入到容器之内时变个颜色，实现如下

```
 .tag{
   animation: appear;
   animation-timeline: view(inline);
 }
 @keyframes appear{
   to {
     background-color: #4d47ff;
   }
 }

```

由于是水平方向，所以这里需要设置 view (inline) ，效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZ5ZWoG33xIODKnIlab1wthTckM5FUiaymPUuVeiaZzUQiceATRMFTv621g/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

好像不是很明显？这是因为动画是在整个视区内过渡的，我们可以改变动画时间线的区间 animation-range，让这个动画在进出的一瞬间就变化

```
 .tag{
   animation: appear;
   animation-timeline: view(inline);
   animation-range: contain;
 }
 @keyframes appear{
   from,to {
     background-color: #4d47ff;
   }
 }

```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZjQCHC4Vlmszc4N7S6EnPqNAKWurQbNoicwcdqcuUXIUzx1Z1ZKkCugg/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

那么，这个效果和前面的计数器有什么关联呢？

从效果上来看，在视区内会执行一个动画，如果在这个动画中加入计数器的累加会怎么样呢？先去除原先的累加器

```
 .tag{
   /* counter-increment: num; */
 }
 @keyframes appear{
   from,to {
     background-color: #4d47ff;
     counter-increment: num;
   }
 }

```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZU38ReFojSoG11eaf2nR13N0TmLdCLqUL70g7kXNk7OKq3Grj45A7MQ/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

可以看到计数器已经生效了，不过现在统计的在可视区内标签的数量。而我们要统计的是可视区外的数量，好像反过来了，如何实现呢？

这里有两种思路。

第一种，用总数减去可视区内的数量，不就行了吗？由于现在动画是针对可视区内的，我们可以给计数器设置一个初始值，就是总量，然后动画中给累加值设置为 - 1，就相当于减去当前数量了，实现如下

```
 .con{
     counter-reset: num 7;
 }
 @keyframes appear{
   from,to {
     background-color: #4d47ff;
     counter-increment: num -1;
   }
 }

```

这样就完美统计出了可视区外的数量了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZFD0b1RQvFktQTh05gbia0BOnx4b1YHxht7ofcOiaiaibsrx6cJe5L86ib6A/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

还有一种方式，我觉得更加巧妙，需要反向思考。原理是重置当前的累加值，比如默认情况下，正常累加，进入可视范围，把累加值设置为 0，不就相当于可视区外的正常累加了吗？

```
 .tag{
   counter-increment: num;
 }
 @keyframes appear{
   from,to {
     background-color: #4d47ff;
     counter-increment: num 0;
   }
 }

```

同样能达到相同的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZFD0b1RQvFktQTh05gbia0BOnx4b1YHxht7ofcOiaiaibsrx6cJe5L86ib6A/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

现在基本已经达到我们需要的效果了

#### 四、其他细节修正

首先是，在超出范围时，需要在边缘出添加一个半透明蒙层，这样体验效果会更好。

半透明蒙层很好实现，只需要添加一个水平渐变的 mask 遮罩就行了

```
 .con{
   -webkit-mask: linear-gradient(to right, #fff calc(100% - 30px), transparent);
 }

```

效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85AnGsdibOZMxkUXOnjtq0ErBSPH7SKvszvaB4PQalhmSVclOII7n9yzng/640?wx_fmt=png&from=appmsg)

那么，如何在没有超出时，不出现这个遮罩呢？

利用 CSS 滚动驱动动画，可以检测容器是否可滚动，也就是是否超出。所以我们只需要将遮罩放在滚动驱动动画里就行了，关键实现如下

```
 .con{
   animation: check;
   animation-timeline: scroll(x self);
 }
 @keyframes check{
   from,to {
     -webkit-mask: linear-gradient(to right, #fff calc(100% - 30px), transparent);
   }
 }

```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZGCRxf8k4fxc45XFiboepWhWWlwZ4IQMmzWb8l7ia7y5hMKJka5RBiaEDQ/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

还有一个问题，希望在没有超出的时候不显示后面的数量。

关于这个，我本来是打算用样式查询来实现，但是遇到了一个问题，由于样式查询只能匹配到子元素，所以不得不将显示数量的标签放到. con 容器内。但是这样一来，mask 遮罩就会出现问题，就像这样

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85AmjOVoPxbygNAFAazyoZiconCX8NUficweqKJ2xOhK3BrqrTy7pja3pAg/640?wx_fmt=png&from=appmsg)

遮罩层连同数量标签一起被裁剪了！

于是又想出了另一种方案，这个在以前的布局中其实用到的更多，那就是负 margin。

实现很简单，给标签容器一个的负 margin-right，这样，右边的数量就会被左边的标签盖住，比如

```
 .con{
   margin-right: -20px;
 }

```

效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85AfbJY4Xkj9Ue3q9w14J7gNeibyN4lYzj1TJCHQQ9vJQk3JnbMkiake4ug/640?wx_fmt=png&from=appmsg)

是不是已经被盖住一部分了？我们继续向左偏移

```
 .con{
   margin-right: -50px;
 }

```

这样就完全看不到右边的数量了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevhR6WRDWhDZFoOELB4Wg85A9H9UxbFxUGj5pOia57YOTY3txf8WstCyIWGiaJ7N8kqgNrEyz6rcuCicw/640?wx_fmt=png&from=appmsg)

那么，如何在超出时显示数量呢？这里就体现出负 margin 的好处了，可以借助前一个元素来隐藏后一个元素，在这里，我们直接在前面的动画中还原 margin 就行了

```
 .con{
   animation: check;
   animation-timeline: scroll(x self);
 }
 @keyframes check{
   from,to {
     -webkit-mask: linear-gradient(to right, #fff calc(100% - 30px), transparent);
     margin-right: 0;
   }
 }

```

这样就完美实现了文章开头所示效果了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtIibmThnjEokvr8UZlTCJpMZqicMXwYR2SF6IibibNUrgR3Z6kb9hA07LUAE9D4F2Tu9n2H01nIEyPuFg/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

访问以下链接来体验真实效果（Chrome115+）:https://codepen.io/xboxyan/pen/rNbYpZV

#### 五、总结一下

以上就是本文的全部内容了，不知道你学会了吗？下面总结一下实现重点：

*   很多时候，CSS 并没有直接的实现方式，需要 “绕” 点弯路
    
*   CSS 计数器可以实现数字累加
    
*   CSS 滚动驱动动画可以检测元素是否在可视范围之内
    
*   CSS 滚动驱动动画还能检测元素是否内容超出
    
*   计数累加器可以放在滚动驱动动画中，这样在动画触发时也就相当于计数器生效了，这样就能统计可视区的标签数量了
    
*   样式查询只能匹配到子元素，但是用子元素会受到 mask 遮罩的影响
    
*   负 margin 可以借助前一个元素来隐藏后一个元素
    

*   Node 社群
    

*   ```
    我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。
    
    ```
    

*   最后不要忘了点个赞再走噢![](https://res.wx.qq.com/t/wx_fed/we-emoji/res/v1.3.10/assets/Expression/Expression_64@2x.png)