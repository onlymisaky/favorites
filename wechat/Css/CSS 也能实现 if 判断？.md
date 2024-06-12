> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kpD8_kFSFqyEBTqLteCZvA)

今天在群里，有个小伙伴问了这么一道很有趣的问题：

1.  CSS 能否实现，容器再某个高度下是某种表现，一旦超出某个高度，则额外展示另外一些内容
    

为了简化实际效果，我们看这么一张示意效果图：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwwmvCEdIQGqQ5BDdlILBJk5gTH00uwkc2CqIUakLGKJGuUukfiaKYX6g/640?wx_fmt=gif)

可以看到，当容器高度没有超过某一个值时，没有箭头图标。反之，箭头图标出现。

这个效果在很多场景都会出现，可以算是一个高频场景，那么在今天，我们能否不使用 JavaScript，仅仅凭借 CSS 实现类似于这样的功能呢？

答案当然是可以，XBoxYan 大佬在 CSS 实现超过固定高度后出现展开折叠按钮 [1] 介绍了一种非常巧妙的**借助浮动的解法**，十分有意思，感兴趣的同学可以先行一步了解。

当然，浮动 `float` 在现如今的 CSS 世界，运用的已经非常少了。那么除了浮动，还有没有其它有意思的解法？本文我们将一起来探究探究。

方法一：借助最新的容器查询
-------------

第一种方法，非常简单，但是对兼容性有所要求。那就是使用容器查询 -- `@container` 语法。

> 容器查询在 新时代布局新特性 -- 容器查询 [2] 也详细介绍过。

简单而言，容器查询它给予了 CSS，在不改变浏览器视口宽度的前提下，只是根据容器的宽度或者高度变化，对布局做调整的能力。

基于这个场景，我们假设我们有如下的 HTML/CSS 结构：

```
<div class="g-container">    <div class="g-content">        Lorem ipsum dolor s...    </div></div>
```

```
.g-container {    position: relative;    width: 300px;    height: 300px;    resize: vertical;    overflow: hidden;    .g-content {        height: 100%;    }    .g-content::before {        content: "↑";        position: absolute;        bottom: 0px;        left: 50%;        transform: translate(-50%, 0);    }}
```

它是这么一个样式效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwOAvCp8JLR9Vic8iaZf3oZmljL3eCArVsPSmOI60FMOTCy6kI1RDLf6Xw/640?wx_fmt=png)

其中，我们给元素 `.g-content` 添加了 `resize: vertical`，让它变成了一个可以在竖直方向上通过拖动改变高度的容器，以模拟容器在不同内容的场景下，高度不一致的问题：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwt7VVlp4TJpEqUiasAc4C4FMYvuGfGIEvGXWM9wsuFiaHicia0Po2ibJNQpw/640?wx_fmt=gif)

我们通过元素的伪元素实现了箭头 ICON，并且它是一直显示在容器内的。

下面，我们通过简单的几句容器查询代码，就可以实现让箭头 ICON，只在容器高度超过特定高度的时候才出现：

```
.g-container {    container-type: size;    container-name: container;}@container container (height <= 260px) {    .g-content::before {        opacity: 0;    }}
```

简单解释一下：

1.  `.g-container` 它被用作容器查询的目标容器
    

*   `container-type` 属性指定了容器的类型为 size，表示我们将使用容器的尺寸来应用样式。
    
*   `container-name` 属性指定了容器的名称为 container，以便在后面的容器查询规则中引用。
    

2.  `@container container (height <= 260px) {}` 表示这是一个容器查询规则，在括号中的条件 `(height <= 260px)` 表示当容器的高度小于等于 `260px` 时，应用该规则下的样式
    
3.  具体规则为，如果容器的高度小于等于 `260px` 时，`.g-content` 元素的伪元素将变得透明
    

这样，我们就非常简单的实现了容器在不同高度下，ICON 元素的显示隐藏切换：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwJI5uia2ics242BiaRzBIPCTPnJpBtJLnWzCRRcw8GhibcuwSDVvoX36Iicg/640?wx_fmt=gif)

完整的代码，你可以戳这里：CodePen Demo -- flexible content[3]

当然，这个方案的唯一缺点在于，截止至今天（2023-11-11），兼容性不是那么好：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwvrB4GqzLZ2YV3LaWEFcFm2XjzrX95DotL3EZkyEGu4ReI2hhiaq6ntA/640?wx_fmt=png)

那，有没有兼容性更好的方案？当然，来我们一起来看看 `clamp` + `calc` 的方案。

方法二：`clamp` + `calc` 大显神威
-------------------------

上面效果的核心在于：

1.  如果容器的高度大于某个值，显示样式 A
    
2.  如果容器的高度小于等于某个值，显示样式 B
    

那么想想看，如果拿容器的高度减去一个固定的高度值，会发生什么？假设一下，ICON 元素的 CSS 代码如下：

```
.g-content::before {    content: "↑";    position: absolute;    left: 50%;    transform: translate(-50%, 0);    bottom: calc(100% - 200px);}
```

仔细观察 `bottom: calc(100% - 200px)`，在元素的 bottom 属性中，`100%` 表示的是容器当前的高度，因此 `calc(100% - 200px)` 的含义就代表，容器当前高度减去一个固定高度 `200px`。因此：

1.  当容器高度大于 `200px`，`calc(100% - 200px)` 表示的是一个正值
    
2.  当容器高度小于 `200px`，`calc(100% - 200px)` 表示的是一个负值
    
3.  当容器高度等于 `200px`，`calc(100% - 200px)` 表示 0
    

我们看看这种情况下，整个 ICON 的表现是如何的：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCw1syxUJSJwGAbhiavbJEduSKKSyFCnX74GxSWAZrI7Xx7gYnYCZo3FDA/640?wx_fmt=gif)

可以看到，当容器高度大于 `200px` 的时候，箭头 ICON 确实出现了，但是，**它无法一直定位在整个容器的最下方**。

有什么办法让它在出现后，一直定位在容器的最下方吗？

别忘了，CSS 中，还有几个非常有意思的数学函数：`min()`、`max()`、`clamp()`，它们可以有效限定动态值在某个范围之内！

> 不太了解的，可以看看这篇 现代 CSS 解决方案：CSS 数学函数 [4]

利用 `clamp()`，我们可以限定计算值的最大最小范围，在这个场景下，我们可以限制 `bottom` 的最大值为 `10px`：

```
.g-content::before {    // ...    bottom: clamp(-99999px, calc(100% - 200px), 10px);}
```

上面的代码 `clamp(-99999px, calc(100% - 200px), 10px)`，核心在于，如果 `calc(100% - 200px)` 的计算值大于 `10px`，它只会取值为 `10px`，利用这个技巧，我们可以在容器高度超长时，把箭头 ICON 牢牢钉在容器的下方，无论容器的高度是多少：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwl4UnePwpuXEmpiblafI9JOHWkcic9tcSluVswO6ZllThzNS0TlK4aolQ/640?wx_fmt=gif)

到此，结束了吗？显然没有。

虽然上面的代码，解决当 `calc(100% - 200px)` 的计算值大于 `10px` 的场景，但是没有解决，当 `calc(100% - 200px)` 的计算值处于 `-10px ~ 10px` 这个范围内的问题。

我们可以清楚的看到，当我们往下拖动容器变高的时候，箭头元素是逐渐慢慢向上出现，而不是突然在某一个高度下，直接出现，所以在实际使用中，会出现这种 ICON 只出现了一半的尴尬场景：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwf8dvmDMrIAhpNHQicCQHQA1HR074SZ6Zdmuib0zjPFf72OgJ1ecMb0TQ/640?wx_fmt=png)

但是，莫慌！这个问题也好解决，我们只需要给 `calc(100% - 200px)` 的计算值，乘上一个超级大的倍数即可。原因在于：

1.  当 `calc(100% - 200px)` 的计算值是负数时，我们其实不希望 ICON 出现，此时，乘上一个超级大的倍数，依然是负数，不影响效果
    
2.  当 `calc(100% - 200px)` 的计算值是正数时，为了避免 ICON 处在只漏出部分的尴尬场景，通过乘上一个超级大的倍数，让整个计算值变得非常大，但是由于又有 `clamp()` 最大值的限制，无论计算值多大，都只会取 `10px`
    

看看代码，此时，整个 `bottom` 的取值就改造成了：

```
.g-content::before {    // ...    bottom: clamp(-9999px, calc(calc(100% - 200px) * 100000), 10px);}
```

通过，将 `calc(100% - 200px)` 的值，乘上一个超大的倍数 `100000`，无论是正值还是负值，我们把计算值放大了 100000 倍。这样，整个效果就达成了我们想要的效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/SMw0rcHsoNJHXFt31FLQQJncxw5JwzCwuDCG3oBF8YlaKNSx0ngPtXERuhV7nOGI1Mqz3BEh1rycQnewq963Jg/640?wx_fmt=gif)

仔细看上图，ICON 元素从渐现，变成了瞬间出现！与上面的 `@container` 效果几乎一致，最终达成了我们想要的效果。

其核心就在于 `clamp(-9999px, calc(calc(100% - 200px) * 100000), 10px)`，一定需要好好理解这一段代码背后的逻辑。

基于此，我们就巧妙的利用 `clamp()` + `calc()` 方法，近似的实现了类似于 `if/else` 的逻辑，实在是妙不可言！

CodePen Demo -- flexible content[5]

最后
--

好了，本文到此结束，希望本文对你有所帮助 :)

更多精彩 CSS 技术文章汇总在我的 Github -- iCSS[6] ，持续更新，欢迎点个 star 订阅收藏。

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

### 参考资料

[1]

CSS 实现超过固定高度后出现展开折叠按钮: _https://juejin.cn/post/7202030221793165368?searchId=2023111021201719515AB1EBF4A44F0984_

[2]

新时代布局新特性 -- 容器查询: _https://github.com/chokcoco/iCSS/issues/201_

[3]

CodePen Demo -- flexible content: _https://codepen.io/Chokcoco/pen/ExrWKvN_

[4]

现代 CSS 解决方案：CSS 数学函数: _https://github.com/chokcoco/iCSS/issues/177_

[5]

CodePen Demo -- flexible content: _https://codepen.io/Chokcoco/pen/ExrWKvN_

[6]

Github -- iCSS: _https://github.com/chokcoco/iCSS_

如果觉得还不错，欢迎点赞、收藏、转发❤❤