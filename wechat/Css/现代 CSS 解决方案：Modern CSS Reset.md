> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6ixcssZVXtRahneHutSwhg)

在早年间（其实也不是很早），写过几篇关于 CSS Reset 的文章 - reset.css 知多少 [1]。

详细描述了当时业界比较常用的，两个 CSS reset 方案：reset.css 与 Normalize.css。

以更为推荐的 Normalize.css 为例，它的核心思想是：

1.  统一了一些元素在所有浏览器下的表现，保护有用的浏览器默认样式而不是完全清零它们，让它们在各个浏览器下表现一致；
    
2.  为大部分元素提供一般化的表现；
    
3.  修复了一些浏览器的 Bug ，并且让它们在所有浏览器下保持一致性；
    
4.  通过一些巧妙的细节提升了 CSS 的可用性；
    
5.  提供了详尽的文档让开发者知道，不同元素在不同浏览器下的渲染规则；
    

如今，Normalize 已经出到了第八版 -- normalize.css V8.0.1[2]，而随之而变的是浏览器市场环境的巨大变化。

IE 已经逐渐退出历史舞台，处理各个浏览器之间巨大差异、不同兼容性问题的日子像是一去不复返了。虽然今天不同厂商在对待标准仍然存在差异，一些细节上仍旧有出入，但是我们已经不需要再像过去般大肆地对浏览器默认样式进行重置。

到今天，我们更多听到**现代 CSS 解决方案**一词。它除去页面样式最基本的呈现外，同时也关注**用户体验**与**可访问性**。这也可能是过去，我们在写 CSS 的时候比较容易忽略的环节。

Modern CSS Reset
----------------

我最近比较喜欢的一个 CSS Reset 方案，源自于 -- Modern-CSS-Reset[3]。

它的核心观点是：

1.  重置合理的默认值
    
2.  关注用户体验
    
3.  关注可访问性
    

整个 Reset 的源码比较简单：

```
/* Box sizing rules */*,*::before,*::after {  box-sizing: border-box;}/* Remove default margin */body,h1,h2,h3,h4,p,figure,blockquote,dl,dd {  margin: 0;}/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */ul[role='list'],ol[role='list'] {  list-style: none;}/* Set core root defaults */html:focus-within {  scroll-behavior: smooth;}/* Set core body defaults */body {  min-height: 100vh;  text-rendering: optimizeSpeed;  line-height: 1.5;}/* A elements that don't have a class get default styles */a:not([class]) {  text-decoration-skip-ink: auto;}/* Make images easier to work with */img,picture {  max-width: 100%;  display: block;}/* Inherit fonts for inputs and buttons */input,button,textarea,select {  font: inherit;}/* Remove all animations, transitions and smooth scroll for people that prefer not to see them */@media (prefers-reduced-motion: reduce) {  html:focus-within {   scroll-behavior: auto;  }    *,  *::before,  *::after {    animation-duration: 0.01ms !important;    animation-iteration-count: 1 !important;    transition-duration: 0.01ms !important;    scroll-behavior: auto !important;  }}
```

其中一些比较有意思的点，单看盒子模型：

```
*,*::before,*::after {  box-sizing: border-box;}
```

Normalize.css 是不推荐这么做的，大部分元素的 `box-sizing` 其实都是 `content-box`，但是，对于实际开发，全部元素都设置为 `border-box` 其实是更便于操作的一种方式。

再看看在**用户体验**及**可访问性**方面的一些做法：

```
html:focus-within {  scroll-behavior: smooth;}
```

`scroll-behavior: smooth` 意为平滑滚动，当然这里是设置给了 `html:focus-within` 伪类，而不是直接给 `html` 赋予平滑滚动，这样做的目的是只对使用键盘 `tab` 键切换焦点页面时，让页面进行平滑滚动切换，带来更好的使用体验。

如果我们设置了如下 CSS：

```
html {  scroll-behavior: smooth;}
```

可能会起到一起副作用，譬如，当我们在页面查找元素时候（使用 Ctrl + F、或者 Mac 的 Commond + F），这段 CSS 代码可能会严重延缓我们的查找速度：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNLcOz5Pb1Pe4TulHLeQaNfIPKJ8Ymwjmp7QcED5wCYvvZh7weJqImsUYJIF4YhOvDteUkVgtxz6Bw/640?wx_fmt=gif)

再看看这段代码：

```
@media (prefers-reduced-motion: reduce) {  html:focus-within {   scroll-behavior: auto;  }    *,  *::before,  *::after {    animation-duration: 0.01ms !important;    animation-iteration-count: 1 !important;    transition-duration: 0.01ms !important;    scroll-behavior: auto !important;  }}
```

我曾经在 [使用 CSS prefers-* 规范，提升网站的可访问性与健壮性](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247486891&idx=1&sn=cdb4eee73cbad89a8c1f2594e6e07738&chksm=ce256e5df952e74b87eeff4c5265f123a7109302a814885579a29527cc4776eec59082c7f87d&scene=21#wechat_redirect) [4] 介绍过 `prefers-reduced-motion`。

prefers-reduced-motion 规则查询用于减弱动画效果，除了默认规则，只有一种语法取值 `prefers-reduced-motion: reduce`，开启了该规则后，相当于告诉用户代理，希望他看到的页面，可以删除或替换掉一些会让部分视觉运动障碍者不适的动画类型。

> 规范原文：Indicates that user has notified the system that they prefer an interface that removes or replaces the types of motion-based animation that trigger discomfort for those with vestibular motion disorders.

> vestibular motion disorders 是一种视觉运动障碍患者，翻译出来是**前庭运动障碍**，是一种会导致眩晕的一类病症，譬如一个动画一秒闪烁多次，就会导致患者的不适。

使用方法，还是上面那段代码：

```
.ele {    animation: aniName 5s infinite linear;}@media (prefers-reduced-motion: reduce) {    .ele {        animation: none;    }}
```

如果我们有一些类似这样的动画：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNLcOz5Pb1Pe4TulHLeQaNfINbDkHKbnOE3uFZ1v5qKqib5KEnkicVKYFazgqDjvOIkRabTnCe7CpWbg/640?wx_fmt=gif)

在用户开启了 `prefers-reduced-motion: reduce` 时，就应该把这个动画去掉。

而上述 Reset 中的那段代码，正是用于当用户开启对应选项后，减弱页面上的所有动画效果。属于对可访问性的考虑。

结合实际环境
------

当然，结合实际环境，目前国内整体不太注重可访问性相关的内容。

而且，许多业务根本无法抛弃一些老旧浏览器，仍然需要兼容 IE 系列。

因此，对于现阶段的 Reset 方案，可以灵活搭配：

1.  如果你的业务场景仍然需要考虑一些老旧浏览器，依旧需要兼容 IE 系列，Normalize.css 的大部分功能都还是非常好的选择
    
2.  如果你的业务场景只专注于 Chrome 或者是 Chromium 内核，Normalize.css 内的许多内容其实可能是一些实际中根本不会遇到或者用上的兼容适配，可以进行必要的精简
    
3.  如果你的业务是全球化，面向的用户不仅仅在国内，你应该开始考虑更多**可访问性**相关的内容，上述的 Modern CSS Reset 可以借鉴一下
    

因此，更应该的情况是，根据实际的业务需要，吸收多个业界比较常见 / 知名的 Reset 方案形成自己业务适用的。

这里再罗列一些常见及现代 CSS Reset 方案：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Reset 方案</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">简介</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Github Stars 数</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">normalize.css<sup>[5]</sup></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">CSS Reset 的现代替代方案</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">47.1K</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">sanitize.css<sup data-style="line-height: 0; color: rgb(30, 107, 184); font-weight: bold;">[6]</sup></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">提供一致的、跨浏览器的 HTML 元素默认样式以及有用的默认样式</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">4.8K</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">reseter.css<sup>[7]</sup></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Normalize.css 和 CSS Reset 的未来替代方案</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">981</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Modern-CSS-Reset<sup data-style="line-height: 0; color: rgb(30, 107, 184); font-weight: bold;">[8]</sup></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">小而美，重置合理的默认值的现代 CSS Reset 方案</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">2.4K</td></tr></tbody></table>

你会看到，其实大家都号称自己是现代 CSS Reset 解决方案，但其实其内部做的 Reset 工作很多是我们根本用不上的。**有人喜欢小而美，有人喜欢大而全**，实际使用的时候需要具体取舍，魔改合并成适合自己的才是最好的。

最后
--

好了，本文到此结束，希望对你有帮助 :)

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

### 参考资料

[1]

reset.css 知多少: _https://github.com/chokcoco/iCSS/issues/5_

[2]

normalize.css V8.0.1: _https://github.com/necolas/normalize.css_

[3]

Modern-CSS-Reset: _https://github.com/hankchizljaw/modern-css-reset_

[4]

使用 CSS prefers-* 规范，提升网站的可访问性与健壮性: _https://github.com/chokcoco/iCSS/issues/118_

[5]

normalize.css: _https://github.com/necolas/normalize.css_

[6]

sanitize.css: _https://github.com/csstools/sanitize.css_

[7]

reseter.css: _https://github.com/resetercss/reseter.css_

[8]

Modern-CSS-Reset: _https://github.com/hankchizljaw/modern-css-reset_

[9]

Github -- iCSS: _https://github.com/chokcoco/iCSS_

iCSS，不止于 CSS，如果你也对各种新奇有趣的前端（CSS）知识感兴趣，欢迎关注 。同时如果你有任何想法疑问，或者也想入群参与大前端技术讨论，围观答疑解惑，共同成长进步，可以关注公众号**加我微信，拉你入群**：

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！