> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BB_Sk03m8e17aQZrVfv7HA)

在 CSS 中，其实存在各种各样的函数。具体分为：  

*   Transform functions[1]
    
*   Math functions[2]
    
*   Filter functions[3]
    
*   Color functions[4]
    
*   Image functions[5]
    
*   Counter functions[6]
    
*   Font functions[7]
    
*   Shape functions[8]
    
*   Reference functions[9]
    
*   CSS grid functions[10]
    

本文，将具体介绍其中的 CSS 数学函数（Math functions）中，已经被浏览器大规模支持的 4 个：

*   calc()
    
*   min()
    
*   max()
    
*   clamp()
    

为什么说是被浏览器大规模支持的？因为除了这 4 个目前已经得到大规模支持的数学函数外，其实规范 CSS Values and Units Module Level 4[11] 已经定义了诸如三角函数相关 `sin()`、`cos()`、`tan()` 等，指数函数相关 `pow()`、`sqrt()` 等等数学函数，只是目前都处于实验室阶段，还没有浏览器支持它们，需要给时间一点时间。

Calc()
------

calc() 此 CSS[12] 函数允许在声明 CSS 属性值时执行一些计算。

语法类似于

```
{    width: calc(100% - 80px);}
```

一些需要注意的点：

*   `+` 和 `-` 运算符的两边必须要有空白字符。比如，`calc(50% -8px)` 会被解析成为一个无效的表达式，必须写成`calc(8px + -50%)`
    
*   `*` 和 `/` 这两个运算符前后不需要空白字符，但如果考虑到统一性，仍然推荐加上空白符
    
*   用 0 作除数会使 HTML 解析器抛出异常
    
*   涉及自动布局和固定布局的表格中的表列、表列组、表行、表行组和表单元格的宽度和高度百分比的数学表达式，auto 可视为已指定。
    
*   calc() 函数支持嵌套，但支持的方式是：把被嵌套的 calc() 函数全当成普通的括号。（所以，函数内直接用括号就好了。）
    
*   calc() 支持与 CSS 变量混合使用
    

看一个最常见的例子，页面结构如下：

```
<div class="g-container">    <div class="g-content">Content</div>    <div class="g-footer">Footer</div></div>
```

页面的 `g-footer` 高为 80px，我们希望不管页面多长，`g-content` 部分都可以占满剩余空间，像是这样：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNKkgHQveeGGnmD9LBAKb5szia0gZrZ8UEljKLPvOlY3k9ppZfic3CJdvJ0vKc12xseAkSdDzM8DERXg/640?wx_fmt=png)

这种布局使用 flex 的弹性布局可以轻松实现，当然，也可以使用 `calc()` 实现：

```
.g-container {    height: 100vh;}.g-content {    height: calc(100vh - 80px);}.g-footer {    height: 80px;}
```

下面罗列一些 Calc() 的进阶技巧。

### Calc 中的加减法与乘除法的差异

注意，calc() 中的加减法与乘除法的差异：

```
{    font-size: calc(1rem + 10px);    width: calc(100px + 10%);}
```

可以看到，加减法两边的操作数都是需要单位的，而乘除法，需要一个无单位数，仅仅表示一个倍率：

```
{    width: calc(100% / 7);    animation-delay: calc(1s * 3);}
```

### Calc 的嵌套

calc() 函数是可以嵌套使用的，像是这样：

```
{  width: calc(100vw - calc(100% - 64px));}
```

此时，内部的 calc() 函数可以退化写成一个括号即可 ()，所以上述代码等价于：

```
{  width: calc(100vw - (100% - 64px));}
```

**也就是嵌套内的 calc()，calc 几个函数字符可以省略**。

### Calc 内不同单位的混合运算

calc() 支持不同单位的混合运算，对于长度，只要是属于长度相关的单位都可以进行混合运算，包含这些：

*   px
    
*   %
    
*   em
    
*   rem
    
*   in
    
*   mm
    
*   cm
    
*   pt
    
*   pc
    
*   ex
    
*   ch
    
*   vh
    
*   vw
    
*   vmin
    
*   vmax
    

这里有一个有意思的点，运算肯定是消耗性能的，早年间，有这样一段 CSS 代码，可以直接让 Chrome 浏览器崩溃 Crash：

```
<div></div>
```

CSS 样式如下：

```
div {  --initial-level-0: calc(1vh + 1% + 1px + 1em + 1vw + 1cm);  --level-1: calc(var(--initial-level-0) + var(--initial-level-0));  --level-2: calc(var(--level-1) + var(--level-1));  --level-3: calc(var(--level-2) + var(--level-2));  --level-4: calc(var(--level-3) + var(--level-3));  --level-5: calc(var(--level-4) + var(--level-4));  --level-6: calc(var(--level-5) + var(--level-5));  --level-7: calc(var(--level-6) + var(--level-6));  --level-8: calc(var(--level-7) + var(--level-7));  --level-9: calc(var(--level-8) + var(--level-8));  --level-10: calc(var(--level-9) + var(--level-9));  --level-11: calc(var(--level-10) + var(--level-10));  --level-12: calc(var(--level-11) + var(--level-11));  --level-13: calc(var(--level-12) + var(--level-12));  --level-14: calc(var(--level-13) + var(--level-13));  --level-15: calc(var(--level-14) + var(--level-14));  --level-16: calc(var(--level-15) + var(--level-15));  --level-17: calc(var(--level-16) + var(--level-16));  --level-18: calc(var(--level-17) + var(--level-17));  --level-19: calc(var(--level-18) + var(--level-18));  --level-20: calc(var(--level-19) + var(--level-19));  --level-21: calc(var(--level-20) + var(--level-20));  --level-22: calc(var(--level-21) + var(--level-21));  --level-23: calc(var(--level-22) + var(--level-22));  --level-24: calc(var(--level-23) + var(--level-23));  --level-25: calc(var(--level-24) + var(--level-24));  --level-26: calc(var(--level-25) + var(--level-25));  --level-27: calc(var(--level-26) + var(--level-26));  --level-28: calc(var(--level-27) + var(--level-27));  --level-29: calc(var(--level-28) + var(--level-28));  --level-30: calc(var(--level-29) + var(--level-29));  --level-final: calc(var(--level-30) + 1px);    border-width: var(--level-final);                                     border-style: solid;}
```

可以看到，从 `--level-1` 到 `--level-30`，每次的运算量都是成倍的增长，最终到 `--level-final` 变量，展开将有 2^30 = **1073741824** 个 `--initial-level-0` 表达式的内容。

并且，每个 `--initial-level-0` 表达式的内容 -- `calc(1vh + 1% + 1px + 1em + 1vw + 1cm)`，在浏览器解析的时候，也已经足够复杂。

混合在一起，就导致了浏览器的 BOOM（Chrome 70 之前的版本），为了能看到效果，我们将上述样式赋给某个元素被 hover 的时候，得到如下效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNKkgHQveeGGnmD9LBAKb5szwibviavg5PlYESggibLerdicVYAOoqFwvW6gOf1lphs1icInuCeoGgtniaFg/640?wx_fmt=gif)css-crash

当然，这个 BUG 目前已经被修复了，我们也可以通过这个小 DEMO 了解到，一是 calc 是可以进行不同单位的混合运算的，另外一个就是注意具体使用的时候如果计算量巨大，可能会导致性能上较大的消耗。

当然，**不要**将长度单位和非长度单位混合使用，像是这样：

```
{    animation-delay: calc(1s + 1px);}
```

### Calc 搭配 CSS 自定义变量使用

calc() 函数非常重要的一个特性就是能够搭配 CSS 自定义以及 CSS @property 变量一起使用。

最简单的一个 DEMO：

```
:root {    --width: 10px;}div {    width: calc(var(--width));}
```

当然，这样看上去，根本看不出这样的写法的作用，好像没有什么意义。实际应用场景中，会比上述的 DEMO 要稍微复杂一些。

假设我们要实现这样一个 loading 动画效果，一开始只有 3 个球：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNKkgHQveeGGnmD9LBAKb5sz4fiaOUaOnXlda9XpUrGWuWTKDhYoiaOatBeN688Yibw7cysx4PLFUibKZQ/640?wx_fmt=gif)

可能的写法是这样，我们给 3 个球都添加同一个旋转动画，然后分别控制他们的 `animation-delay`：

```
<div class="g-container">    <div class="g-item"></div>    <div class="g-item"></div>    <div class="g-item"></div></div>
```

```
.item:nth-child(1) {    animation: rotate 3s infinite linear;}.item:nth-child(2) {    animation: rotate 3s infinite -1s linear;}.item:nth-child(3) {    animation: rotate 3s infinite -2s linear;}
```

如果有一天，这个动画需要扩展成 5 个球的话，像是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/SMw0rcHsoNKkgHQveeGGnmD9LBAKb5szowd6ePMC3qQuT7Kx8TkCTSnm5GdzBLXKibs2hI2rZicA1t9Qzyh2su4A/640?wx_fmt=gif)

我们就不得已，得去既添加 HTML，又修改 CSS。而如果借助 Calc 和 CSS 变量，这个场景就可以稍微简化一下。  

假设只有 3 个球：

```
<div class="g-container">    <div class="g-item" style="--delay: 0"></div>    <div class="g-item" style="--delay: 1"></div>    <div class="g-item" style="--delay: 2"></div></div>
```

我们通过 HTML 的 Style 标签，传入 `--delay` 变量，在 CSS 中直接使用它们：

```
.g-item {    animation: rotate 3s infinite linear;    animation-delay: calc(var(--delay) * -1s);}@keyframes rotate {    to {        transform: rotate(360deg);    }}
```

而当动画修改成 5 个球时，我们就不需要修改 CSS，直接修改 HTML 即可，像是这样：

```
<div class="g-container">    <div class="g-item" style="--delay: 0"></div>    <div class="g-item" style="--delay: 0.6"></div>    <div class="g-item" style="--delay: 1.2"></div>    <div class="g-item" style="--delay: 1.8"></div>    <div class="g-item" style="--delay: 2.4"></div></div>
```

核心的 CSS 还是这一句，不需要做任何修改：

```
{    animation-delay: calc(var(--delay) * -1s);}
```

完整的 DEMO，你可以戳这里：CodePen Demo -- Calc & CSS Variable Demo[13]

### calc 搭配自定义变量时候的默认值

还是上述的 Loading 动画效果，如果我的 HTML 标签中，有一个标签忘记填充 `--delay` 的值了，那会发生什么？

像是这样：

```
<div class="g-container">    <div class="g-item" style="--delay: 0"></div>    <div class="g-item" style="--delay: 0.6"></div>    <div class="g-item"></div>    <div class="g-item" style="--delay: 1.8"></div>    <div class="g-item" style="--delay: 2.4"></div></div>
```

```
{    animation-delay: calc(var(--delay) * -1s);}
```

由于 HTML 标签没有传入 `--delay` 的值，并且在 CSS 中向上查找也没找到对应的值，此时，`animation-delay: calc(var(--delay) * -1s)` 这一句其实是无效的，相当于 `animation-delay: 0`，效果也就是少了个球的效果：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNKkgHQveeGGnmD9LBAKb5szLeiaia8sbYcq4DGp2KpPn6gR1Z3LqGhQK5HyCHHyPUqr9aDWFibcQL0AA/640?wx_fmt=png)

所以，基于这种情况，可以利用 CSS 自定义变量 `var()` 的 fallback 机制：

```
{    // (--delay, 1) 中的 1 是个容错机制    animation-delay: calc(var(--delay, 1) * -1s);}
```

此时，如果没有读取到任何 `--delay` 值，就会使用默认的 1 与 `-1s` 进行运算。

### Calc 字符串拼接

很多人在使用 CSS 的时候，会尝试字符串的拼接，像是这样：

```
<div style="--url: 'bsBD1I.png'"></div>
```

```
:root {    --urlA: 'url(https://s1.ax1x.com/2022/03/07/';    --urlB: ')';}div {    width: 400px;    height: 400px;    background-image: calc(var(--urlA) + var(--url) + var(--urlB));}
```

这里想利用 `calc(var(--urlA) + var(--url) + var(--urlB))` 拼出完整的在 `background-image` 中可使用的 URL `url(https://s1.ax1x.com/2022/03/07/bsBD1I.png)`。

然而，这是不被允许的（无法实现的）。**calc 的没有字符串拼接的能力**。

唯一可能完成字符串拼接的是在元素的伪元素的  `content` 属性中。但是也不是利用 calc。

来看这样一个例子，这是**错误**的：

```
:root {    --stringA: '123';    --stringB: '456';    --stringC: '789';}div::before {    content: calc(var(--stringA) + var(--stringB) + var(--stringC));}
```

此时，不需要 calc，直接使用自定义变量相加即可。

因此，**正确**的写法：

```
:root {    --stringA: '123';    --stringB: '456';    --stringC: '789';}div::before {    content: var(--stringA) + var(--stringB) + var(--stringC);}
```

此时，内容可以正常展示：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNKkgHQveeGGnmD9LBAKb5szVLu3OnRf61RzNOj9fN4gjwWmOzMxTz53TribibrhNbASrJjlibtoE4I2A/640?wx_fmt=png)

再强调一下，**calc 的没有字符串拼接的能力**，如下的使用方式都是无法被识别的错误语法：  

```
.el::before {  // 不支持字符串拼接  content: calc("My " + "counter");}.el::before {  // 更不支持字符串乘法  content: calc("String Repeat 3 times" * 3);}
```

最后
--

本文是**现代 CSS 解决方案**系列文章的第二篇，首发公众号，希望通过一些更易理解的语言、更直观的 DEMO，讲述在如今如何更好的使用 CSS 去提升我们网站的体验，去提高我们的技巧。

好了，本文到此结束，希望对你有所帮助:)

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

参考资料  

[1]

Transform functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#transform_functions_

[2]

Math functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#math_functions_

[3]

Filter functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#filter_functions_

[4]

Color functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#color_functions_

[5]

Image functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#image_functions_

[6]

Counter functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#counter_functions_

[7]

Font functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#font_functions_

[8]

Shape functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#shape_functions_

[9]

Reference functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#reference_functions_

[10]

CSS grid functions: _https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions#css_grid_functions_

[11]

CSS Values and Units Module Level 4: _https://drafts.csswg.org/css-values/#math_

[12]

CSS: _https://developer.mozilla.org/zh-CN/docs/Web/CSS_

[13]

CodePen Demo -- Calc & CSS Variable Demo: _https://codepen.io/Chokcoco/pen/OJzarJL_

iCSS，不止于 CSS，如果你也对各种新奇有趣的前端（CSS）知识感兴趣，欢迎关注 。同时如果你有任何想法疑问，或者也想入群参与大前端技术讨论，围观答疑解惑，共同成长进步，可以关注公众号**加我微信，拉你入群**：

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！