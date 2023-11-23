> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/XEzrwl9Tl3SdAXWAbaaoYQ)

在实际 Web 开发过程中，总会遇到各种各样的布局。有公司同事问我这样一种布局有没有什么好的实现方式，就是一种在活动充值页非常普遍的优惠券效果，如下  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvAVLdtAHDzZMmYjee30q8eQsOtOrZXgaRTbQezlxebpU2hiaEiaO3Wiauw/640?wx_fmt=png)

还有这样的

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvp4Ep01wKibsLyfAeA6y2znlJbKyek0wHysicEpT93SKlWrQKCbibTRQCQ/640?wx_fmt=png)

考虑到各种可能出现的场景，抽象出以下几种案例，一起来看看实现吧

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvF8dia4QvCF0Iibf3yck7dPHBBKjnaMoyLVuZTEaLCXaLnxHE8TNNeRFg/640?wx_fmt=png)

一、最佳实现方式
--------

首先，碰到这类布局的最佳实现肯定是 mask 遮罩 [1]。关于遮罩，可以看一下 CSS3 Mask 安利报告 [2]。这里简单介绍一下

基本语法很简单，和 **background** 的语法基本一致

```
.content{
  -webkit-mask: '遮罩图片' ;
}
/*完整语法*/
.content{
  -webkit-mask: '遮罩图片' [position] / [size] ;
}
```

这里的遮罩图片和背景的使用方式基本一致，可以是 **PNG 图片**、**SVG 图片**、也可以是**渐变绘制**的图片，同时也支持**多图片叠加**。  

遮罩的原理很简单，**最终效果只显示不透明的部分，透明部分将不可见，半透明类推**

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvhCasctsRKL2ib5YFm3UKb2V6BS4AghO8ubauHfOicnibjnUCZ8dUt7O0Q/640?wx_fmt=png)

> 事实上，除了根据透明度（Alpha）来作为遮罩条件，还可以通过亮度（luminance）来决定，比如白色表示隐藏，黑色表示可见。不过目前只有 Firefox 支持

所以，只要能绘制以上各种形状，就可以实现了。

二、内凹圆角
------

优惠券大多有一个很明显的特点，就是**内凹圆角**。提到圆角，很容易想到 radial-gradient[3]。这个语法有点复杂，记不住没关系，可以看看张老师的这篇 10 个 demo 示例学会 CSS3 radial-gradient 径向渐变 [4]。

```
.content{
  -webkit-mask: radial-gradient(circle at left center, transparent 20px, red 20px); 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv5oT1n3loAMpWcUUFWblcQWXpET07EAoMptE9mqe9pnzxCKDc11qJwg/640?wx_fmt=png)

这样就绘制了一个半径为 20px 的透明的圆，不过代码层面还有很多优化的空间。

1. 在实现边界分明的渐变时，后面颜色的位置只需要小于等于前面颜色的位置就行了，比如 **0**2. 透明颜色可以用 **16 进制**缩写比如**#0000** 来代替**，**不透明的部分随便用一个颜色就好，我喜欢用 **red**，主要是这个单词比较短 3. 还有渐变的位置默认是居中的，所以第二个 center 可以去除，left 可以用 **0** 来表示

进一步简化就得到了

```
.content{
  -webkit-mask: radial-gradient(circle at 0, #0000 20px, red 0); 
}
```

不错，又少了好几个 B 的流量~ 可以查看在线实例 codepen 优惠券实现 1[5]  

三、优惠券效果
-------

上面是一个最基本的内凹圆角效果，现在来实现下面几种布局，比如两个半圆的，根据上面的例子，再复制一个圆不就可以了？改一下定位的方向

```
.content{
  -webkit-mask: radial-gradient(circle at 0, #0000 20px, red 0), radial-gradient(circle at right, #0000 20px, red 0); 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv6KV5MHfzboQm92NOtEyUnYSIF7nA7WwwZiatOY1skoh44Y7oDRo1eoA/640?wx_fmt=png)

这时发现一个圆都没有了。原因其实很简单，如下演示，**两层背景相互叠加，导致整块背景都成了不透明的**，所以 mask 效果表现为全部可见。

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv5yDicFtKremoNIOvniaARicxbiatI5icy9uib9joJYNxicH3cb2jk9TMLFsag/640?wx_fmt=gif)

解决方式有 2 个，分别是：

1. **把两个凹角的地方错开，这里可以通过修改尺寸和位置，同时还需要禁止平铺**

```
.content{
-webkit-mask: radial-gradient(circle at 0, #0000 20px, red 0), radial-gradient(circle at right, #0000 20px, red 0);
-webkit-mask-size: 51%; /*避免出现缝隙*/
-webkit-mask-position: 0, 100%; /*一个居左一个居右*/
-webkit-mask-repeat: no-repeat;
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv3kAMJ0bwQoHzc4cljgib6pZSwooFPMo21y8YhTxSb3ibss5dak29ccuA/640?wx_fmt=png)

动态演示如下，这样就不会互相覆盖了

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvlCPPH1gBcYJ5XU1pkgyyiacJlEYt9VsaPcCIa1kz52ckwRjgibrv3Myg/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 2

2. **使用遮罩合成** mask-composite**，这个可能不太熟悉，简单介绍一下**

标准属性下 **mask-composite** 有 4 个属性值（Firefox 支持）

```
/* Keyword values */
mask-composite: add; /* 叠加（默认） */
mask-composite: subtract; /* 减去，排除掉上层的区域 */
mask-composite: intersect; /* 相交，只显示重合的地方 */
mask-composite: exclude; /* 排除，只显示不重合的地方 */
```

这个可能有些不好理解，其实可以参考一些图形软件的形状合成操作，比如 photoshop

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvXosXg0xSwJFke4twVpTojBHZS4807ETmrMy2yEQP8wNAMoEDKiaHWiaQ/640?wx_fmt=png)

-webkit-mask-composite[6] 与标准下的值有所不同，属性值非常多，看下面

```
-webkit-mask-composite: clear; /*清除，不显示任何遮罩*/
-webkit-mask-composite: copy; /*只显示上方遮罩，不显示下方遮罩*/
-webkit-mask-composite: source-over; 
-webkit-mask-composite: source-in; /*只显示重合的地方*/
-webkit-mask-composite: source-out; /*只显示上方遮罩，重合的地方不显示*/
-webkit-mask-composite: source-atop;
-webkit-mask-composite: destination-over;
-webkit-mask-composite: destination-in; /*只显示重合的地方*/
-webkit-mask-composite: destination-out;/*只显示下方遮罩，重合的地方不显示*/
-webkit-mask-composite: destination-atop;
-webkit-mask-composite: xor; /*只显示不重合的地方*/
```

是不是一下就懵了？不用慌，可以看到上面有几个值是 **source-***，还有几个是 **destination-*** 开头的，**source 代表新内容**，也就是上面绘制的图层，**destination 代表元内容**，也就是下面绘制的图层（**在 CSS 中，前面的图层会覆盖后面的图层**），这里的属性值其实是借用了 Canvas 中的概念，具体可以查看 CanvasRenderingContext2D.globalComposite[7]  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv4JKsicvtSIHWDWKk0soDaliaK1JKgjiat4Lgeo4icmiadkBicOX0ksZfrKOw/640?wx_fmt=png)

记不住没关系，实际开发可以逐一试验 [\ 捂脸]。具体差异可以查看 codepen -webkit-mask-composite 属性值演示 [8]

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvPjXaoes0PfMYezZUkCUMddC7rGDv4syfhLIeOp1hrAZV6GymByUscQ/640?wx_fmt=gif)

了解这个属性后，上面的叠加问题就很简单了，设置**只显示重合的地方**就行了

```
.content{
  -webkit-mask: radial-gradient(circle at 0, #0000 20px, red 0), radial-gradient(circle at right, #0000 20px, red 0); 
  -webkit-mask-composite: source-in | destination-in ; /*chrome*/
  mask-composite: intersect; /*Firefox*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv3kAMJ0bwQoHzc4cljgib6pZSwooFPMo21y8YhTxSb3ibss5dak29ccuA/640?wx_fmt=png)

动态演示如下，这样只会显示**互相重合的地方**

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvxdXDnY93mySAKqbx3bkdPENZXW2xBwbAGoZrOY1BZ93ITnjGlhk5aQ/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 3[9]

2 个圆角的实现了，4 个的就很容易了，画 4 个圆就行，同样利用遮罩合成可以轻易实现

```
content{
  -webkit-mask: radial-gradient(circle at 0 0, #0000 20px, red 0), radial-gradient(circle at right 0, #0000 20px, red 0), radial-gradient(circle at 0 100%, #0000 20px, red 0), radial-gradient(circle at right 100%, #0000 20px, red 0); /*4个角落各放一个圆*/
  -webkit-mask-composite: source-in | destination-in ; /*chrome*/
  mask-composite: intersect; /*Firefox*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvyOjiay8fLXfBicqzXu3keXuT0dsvyEqxHhTeHE4P9zUEm65X82emFb0Q/640?wx_fmt=png)

可以查看在线实例 codepen 优惠券实现 4[10]

四、优惠券平铺效果
---------

上面的例子展示了 2 个圆角和 4 个圆角的效果，分别绘制了 2 个和 4 个圆，其实这是可以通过平铺来实现的，只需要一个圆就可以。实现步骤如下

1. **画一个左中的靠边的透明圆**

```
.content{
-webkit-mask: radial-gradient(circle at 20px, #0000 20px, red 0); 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvu9rjlV0z9njcBoF2Ww5pcU1j4qcrblnAX5Y1jzwC110wsnctzJZUVw/640?wx_fmt=png)

2. **向左平移自身的一半**

```
.content{
-webkit-mask: radial-gradient(circle at 20px, #0000 20px, red 0); 
-webkit-mask-position: -20px
}
/*也可以缩写为*/
.content{
-webkit-mask: radial-gradient(circle at 20px, #0000 20px, red 0) -20px; 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvRBm3t71ftOuKvnNFuhuao2XFfNhSK0HD7NPia61s3jATQWKswSbDiaZQ/640?wx_fmt=png)

效果就出来了，是不是很神奇？其实就是利用到了默认的 **repeat 特性**，这里用一张动图就能明白了

> 下面**红色边框内表示视区范围**，也就是最终的效果，这里为了演示，把视线之外的**平铺**做了半透明处理，移动表示 position 改变的过程

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvV31eHbEvo6m7TPqk6gfRo0jSVWePRib1dKwkO7ChggmPkW7JRniaXQ4A/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 5[11]

同样原理，4 个圆角也可以采用这种方式实现

```
.content{
  -webkit-mask: radial-gradient(circle at 20px 20px, #0000 20px, red 0); 
  -webkit-mask-position: -20px -20px;
}
/*也可以缩写为*/
.content{
  -webkit-mask: radial-gradient(circle at 20px 20px, #0000 20px, red 0) -20px -20px; 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvyOjiay8fLXfBicqzXu3keXuT0dsvyEqxHhTeHE4P9zUEm65X82emFb0Q/640?wx_fmt=png)

实现原理演示如下

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvAJzhF5HLOscyxCJ2bQvJHTfvEOtWausCS2ZXktqLgfRTpnQibos8oaQ/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 6[12]

6 个圆角就需要改一下平铺尺寸了。

```
.content{
  -webkit-mask: radial-gradient(circle at 20px 20px, #0000 20px, red 0); 
  -webkit-mask-position: -20px -20px;
  -webkit-mask-size: 50%;
}
/*也可以缩写为*/
.content{
  -webkit-mask: radial-gradient(circle at 20px 20px, #0000 20px, red 0) -20px -20px / 50%; 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvPTfVAXueDpId3qWkeeS8laPRhpxFrISnssVxKD05EEVlc8xAhJdC1Q/640?wx_fmt=png)

实现原理演示如下

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvb69eGYNqAudlGT319KGiccd6iaT1MQbe6TQ8tmyzRxSH1reomsJV7SDw/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 7[13]

如果继续缩小背景图的尺寸，还可以得到最后的效果

```
.content{
  -webkit-mask: radial-gradient(circle at 10px, #0000 10px, red 0); 
  -webkit-mask-position: -10px;
  -webkit-mask-size: 100% 30px;
}
/*也可以缩写为*/
.content{
  -webkit-mask: radial-gradient(circle at 20px 20px, #0000 20px, red 0) -10px / 100% 30px; 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvP29R2DZ5qnVByaB08icPFON7Y7reSictJK6Lia4SHpE7nCqKJLnOPreQQ/640?wx_fmt=png)

实现原理演示如下，其实就平铺

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvR5GLe3Y9QgG0wnbHjUGptzwHSl7pia0SxPEP4HCLPEdban4kFMxEyCA/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 8[14]

五、反向镂空叠加
--------

有些情况下可能单一的一层渐变绘制不了很复杂的图形，这就需要用到反向镂空技术了，其实就是上面提到过的**遮罩合成**，这里再运用一下

1. **先把上面的实现拿过来**

```
.content{
-webkit-mask: radial-gradient(circle at 20px 20px, #0000 20px, red 0) -20px -20px / 50%; 
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvPTfVAXueDpId3qWkeeS8laPRhpxFrISnssVxKD05EEVlc8xAhJdC1Q/640?wx_fmt=png)

1. **直接在这个基础上打一排小洞**

```
.content{
-webkit-mask: radial-gradient( circle at 50%, red 5px, #0000 0) 50% 50% / 100% 20px, radial-gradient(circle at 20px 20px, #0000 20px, red 0) -20px -20px / 50%;
-webkit-mask-composite: destination-out;
mask-composite: subtract; /*Firefox*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvgoias1hlU77fIibu5tvzrWibkuuIUH1OLRz7d8Jru0qcUNicOq6jxBnmOw/640?wx_fmt=png)

注意这里用到了 **-webkit-mask-composite: destination-out**，**表示减去，只显示下方遮罩，重合的地方不显示**

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvUb3uU5pN4ZiasFOHQ0RXicicWwfAQOLhGlklrKa3jeMGb9gCFWQlurPuA/640?wx_fmt=gif)

可以查看在线实例 codepen 优惠券实现 9[15]

也可以放在两边，改一下 **position** 就可以了

```
.content{
  -webkit-mask: radial-gradient( circle at 5px, red 5px, #0000 0) -5px 50% / 100% 20px, radial-gradient(circle at 20px 20px, #0000 20px, red 0) -20px -20px / 50%;
  -webkit-mask-composite: destination-out;
  mask-composite: subtract; /*Firefox*/
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvAGHNA3TTSYCmfmqloiaibYmBppGvy9TUF3IvmB7GMo6wbUpxhXVI7CRQ/640?wx_fmt=png)

可以查看在线实例 codepen 优惠券实现 10[16]

六、边框遮罩
------

有些同学觉得**径向渐变太复杂，实在是写不出来，能不能用图片代替呢**？其实也是可行的。这里说的边框遮罩指的是 mask-border[17], 目前还在 W3C 草案当中，不过有一个替代属性 -webkit-mask-box-image[18]

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv38BnaibYpq6RXhYmicLdpaiayb7acfPcfxZ79Rgf0Zr8eQfBkFONKVPEw/640?wx_fmt=png)

语法和概念和 border-image[19] 非常相似，关于 **border-image** 可参考这篇文章 border-image 的正确用法 [20]，这里主要了解一下用法和效果

```
.content{
  -webkit-mask-box-image: '遮罩图片' [<top> <right> <bottom> <left> <x-repeat> <y-repeat>]
}
```

比如有一张这样的图片  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xv7BMdpPlmS5ibfFlo9pv3EveCCqYlF0ibDwicibaVTDIqL66JQPjo7vKA2w/640?wx_fmt=png)

SVG 代码长这样，很多工具都可以导出来，实在不会可以直接找设计同学

```
<svg xmlns="http://www.w3.org/2000/svg" width="60.031" height="60.031" viewBox="0 0 60.031 60.031"><path d="M40 60.027H20.129A20.065 20.065 0 0 0 .065 40H0V20.127h.065A20.066 20.066 0 0 0 20.131.061v-.065H40v.065a20.065 20.065 0 0 0 20.027 20.064V40A20.063 20.063 0 0 0 40 60.027z" fill-rule="evenodd"/></svg>
```

这里需要转义一下，可借助张老师的 SVG 在线合并工具 [21]  

```
.content{
  -webkit-mask-box-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60.031' height='60.031' viewBox='0 0 60.031 60.031'%3E%3Cpath d='M40 60.027H20.129A20.065 20.065 0 0 0 .065 40H0V20.127h.065A20.066 20.066 0 0 0 20.131.061v-.065H40v.065a20.065 20.065 0 0 0 20.027 20.064V40A20.063 20.063 0 0 0 40 60.027z' fill-rule='evenodd'/%3E%3C/svg%3E") 20;
  /*这里的20表示四周保留20像素的固定区域，剩余部分平铺或者拉伸*/
}
```

然后就实现了这样一个形状，同样是自适应的  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvyOjiay8fLXfBicqzXu3keXuT0dsvyEqxHhTeHE4P9zUEm65X82emFb0Q/640?wx_fmt=png)

可以查看在线实例 codepen -webkit-mask-box-iamge 实现 1[22]

再比如有一张这样的图片

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvtRNw0zI3k0CjlzdFwqCL2MKo7rameo6lNt8VClIwOPptOpawwFkF4g/640?wx_fmt=png)

```
.content{
  -webkit-mask-box-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60.031' height='60.031' viewBox='0 0 60.031 60.031'%3E%3Cpath d='M55.186 30.158a4.965 4.965 0 0 0 4.841 4.959V40A20.063 20.063 0 0 0 40 60.027H20.129A20.065 20.065 0 0 0 .065 40H0v-4.888c.054 0 .1.016.158.016a4.973 4.973 0 1 0 0-9.945c-.054 0-.1.014-.158.015v-5.074h.065A20.066 20.066 0 0 0 20.131.058v-.065H40v.065a20.065 20.065 0 0 0 20.027 20.064v5.07a4.965 4.965 0 0 0-4.841 4.966z' fill-rule='evenodd'/%3E%3C/svg%3E") 20;
}
```

可以得到这样一个形状，两侧的半圆被拉伸了  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvO4vKbyQNeGn23QYoX6Cib0zI2M6w7b0MqLLNAfBBpfUhf94AsSD629w/640?wx_fmt=png)

这时只需要设置平铺方式 **-webkit-mask-box-image-repeat ,** 这个和 border-image-repeat[23] 是一样的概念，有以下 4 个值

```
-webkit-mask-box-image-repeat: stretch; /*拉伸(默认)，不会平铺*/
-webkit-mask-box-image-repeat: repeat; /*重复*/
-webkit-mask-box-image-repeat: round; /*重复，当不能整数次平铺时，根据情况拉伸。*/
-webkit-mask-box-image-repeat: space; /*重复，当不能整数次平铺时，会用空白间隙填充*/
```

几种平铺方式的差异如下  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvGFR6nGKAM8KsY5oEDSX1Rv3ZMKJN7NytsL3rPsWwibumpHz9BBQKnQQ/640?wx_fmt=png)

这里我们可以采用 **round** 或者 **repeat**

```
.content{
  -webkit-mask-box-image: url("...") 20;
  -webkit-mask-box-image-repeat: round;
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2lc7lsskuJx8vuZKTnVA0xvQ2esVPD5iazsXmkjJSib3aiafvXKicLRSd01WX40HY7PNOicdncOhSJicy0Q/640?wx_fmt=png)

可以查看在线实例 codepen -webkit-mask-box-iamge 实现 2[24]

七、总结和说明
-------

以上一共介绍了 12 种绘制优惠券的案例，应该可以解决掉绝大部分这类布局的问题，这里总结以下几点

1.**CSS mask** 一定是这类布局最完美的实现方式 2. 需要 **CSS radial-gradient** 绘制图形的技巧 3. 尽可能采用 **repeat** 来重复相同的元素 4. 多种形状叠加时需要灵活运用 **mask-composite**5. 也可以采用图片来代替 CSS 渐变，需要使用 **mask-border**

关于兼容性，其实不考虑 IE 都没有什么大问题，最后的 mask-border 目前只兼容 chrome 内核，移动端可放心使用

感谢阅读，希望能对日后的工作有所启发。

### References

`[1]` mask 遮罩: _https://developer.mozilla.org/zh-CN/docs/Web/CSS/mask?fileGuid=fKc3ePJfifoZewha_  
`[2]` CSS3 Mask 安利报告: _https://jelly.jd.com/article/6006b1045b6c6a01506c87bb?fileGuid=fKc3ePJfifoZewha_  
`[3]` radial-gradient: _https://developer.mozilla.org/zh-CN/docs/Web/CSS/radial-gradient()?fileGuid=fKc3ePJfifoZewha_  
`[4]` 10 个 demo 示例学会 CSS3 radial-gradient 径向渐变: _https://www.zhangxinxu.com/wordpress/2017/11/css3-radial-gradient-syntax-example/?fileGuid=fKc3ePJfifoZewha_  
`[5]` codepen 优惠券实现 1: _https://codepen.io/xboxyan/pen/BaQXQXB?fileGuid=fKc3ePJfifoZewha_  
`[6]` -webkit-mask-composite: _https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-composite?fileGuid=fKc3ePJfifoZewha_  
`[7]` CanvasRenderingContext2D.globalComposite: _https://www.canvasapi.cn/CanvasRenderingContext2D/globalCompositeOperation?fileGuid=fKc3ePJfifoZewha_  
`[8]` codepen -webkit-mask-composite 属性值演示: _https://codepen.io/xboxyan/pen/RwKbGwN?fileGuid=fKc3ePJfifoZewha_  
`[9]` codepen 优惠券实现 3: _https://codepen.io/xboxyan/pen/rNWXmbm?fileGuid=fKc3ePJfifoZewha_  
`[10]` codepen 优惠券实现 4: _https://codepen.io/xboxyan/pen/jOVgwOq?fileGuid=fKc3ePJfifoZewha_  
`[11]` codepen 优惠券实现 5: _https://codepen.io/xboxyan/pen/MWbNozQ?fileGuid=fKc3ePJfifoZewha_  
`[12]` codepen 优惠券实现 6: _https://codepen.io/xboxyan/pen/mdONMwR?fileGuid=fKc3ePJfifoZewha_  
`[13]` codepen 优惠券实现 7: _https://codepen.io/xboxyan/pen/PobMKyE?fileGuid=fKc3ePJfifoZewha_  
`[14]` codepen 优惠券实现 8: _https://codepen.io/xboxyan/pen/zYogbQJ?fileGuid=fKc3ePJfifoZewha_  
`[15]` codepen 优惠券实现 9: _https://codepen.io/xboxyan/pen/vYyoMoZ?fileGuid=fKc3ePJfifoZewha_  
`[16]` codepen 优惠券实现 10: _https://codepen.io/xboxyan/pen/BaQXeNV?fileGuid=fKc3ePJfifoZewha_  
`[17]` mask-border: _https://www.w3.org/TR/css-masking-1/#mask-borders?fileGuid=fKc3ePJfifoZewha_  
`[18]` -webkit-mask-box-image: _https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-mask-box-image?fileGuid=fKc3ePJfifoZewha_  
`[19]` border-image: _https://developer.mozilla.org/en-US/docs/Web/CSS/border-image?fileGuid=fKc3ePJfifoZewha_  
`[20]` border-image 的正确用法: _https://jelly.jd.com/article/6006b1045b6c6a01506c87bc?fileGuid=fKc3ePJfifoZewha_  
`[21]` SVG 在线合并工具: _https://www.zhangxinxu.com/sp/svgo/?fileGuid=fKc3ePJfifoZewha_  
`[22]` codepen -webkit-mask-box-iamge 实现 1: _https://codepen.io/xboxyan/pen/oNBvZmb?fileGuid=fKc3ePJfifoZewha_  
`[23]` border-image-repeat: _https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-image-repeat?fileGuid=fKc3ePJfifoZewha_  
`[24]` codepen -webkit-mask-box-iamge 实现 2: _https://codepen.io/xboxyan/pen/gOgYWej?fileGuid=fKc3ePJfifoZewha_

❤️ 爱心三连
-------

1. 如果觉得这篇文章还不错，来个**分享、点赞、在看**三连吧，让更多的人也看到～

2. 关注公众号**前端森林**，定期为你推送新鲜干货好文。

3. 特殊阶段，带好口罩，做好个人防护。