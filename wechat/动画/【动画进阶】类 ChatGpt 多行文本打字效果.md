> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/A_7bVwF64rO4gj5naRvyEg)

今天我们来学习一个有意思的多行文本输入打字效果，像是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSq6SnO6yPbKNo0Lw8w9tUEwAzDKsUdgKkLE7A1LYUuw8Q5dNfavERKTg/640?wx_fmt=gif&from=appmsg)

这个效果其实本身并非特别困难，实现的方式也很多，在本文中，**「我们更多的会聚焦于整个多行打字效果最后的动态光标的实现」**。

也就是如何在文本不断变长，在不确定行数的情况下，让文字的最末行右侧处，一直有一个不断闪烁的光标效果：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqEkrTU0Ls67w1AMekDWIuyPvIUgedM7xGpFY2w7QFymxoJyPDibz2z8w/640?wx_fmt=png&from=appmsg)

单行文本打字效果
--------

在此之前，我们快速看一个之前在 [【Web 动画】科技感十足的暗黑字符雨动画](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247487816&idx=1&sn=c8b3d2908320f127d5ff5f8320e97e96&chksm=ce2572bef952fba89cdd43e8540a3ca82b2c383be835e3cc65d6a39b56c18d11b554120bfb4d&scene=21#wechat_redirect) （https://github.com/chokcoco/iCSS/issues/129）分享过的，非常简单的单行打字效果动画。

在这里的单行打字效果，其核心就是就是让字符一个一个的出现，像是这样：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqxm0WqUDLLgocmibJ8UlUGMHjhNQ1BNwSHLfeyKTSAzcht2A1fRM0XjA/640?wx_fmt=gif&from=appmsg)纯 CSS 实现文字输入效果

这里借助了 animation 的 `steps` 的特性实现，也就是逐帧动画。

从左向右和从上向下原理是一样的，以从左向右为例，假设我们有 26 个英文字符，我们已知 26 个英文字符组成的字符串的长度，那么我们只需要设定一个动画，让它的宽度变化从 `0 - 100%` 经历 26 帧即可，配合 `overflow: hidden`，steps 的每一帧即可展出一个字符。

当然，这里需要利用一些小技巧，我们如何通过字符的数量知道字符串的长度呢？

划重点：**「通过等宽字体的特性，配合 CSS 中的 `ch` 单位」**。

> ❝
> 
> 如果不了解什么是等宽字体族，可以看看我的这篇文章 -- 《[你该知道的字体 font-family](http://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247484626&idx=1&sn=10e2b367f3eac3847d7fceb3a24dfcdf&chksm=ce256724f952ee32474b9f287a4b9bd8c0ae1e9c5632f5353fd10ce8913195271e0df2939eda&scene=21#wechat_redirect)》（https://github.com/chokcoco/iCSS/issues/6）。
> 
> ❞

CSS 中，`ch` 单位表示数字 “0” 的宽度。如果字体恰巧又是等宽字体，即每个字符的宽度是一样的，此时 `ch` 就能变成每个英文字符的宽度，那么 `26ch` 其实也就是整个字符串的长度。

利用这个特性，配合 animation 的 `steps`，我们可以轻松的利用 CSS 实现打字动画效果：

```
<h1>Pure CSS Typing animation.</h1>
```

```
h1 {    font-family: monospace;    width: 26ch;    white-space: nowrap;    overflow: hidden;    animation: typing 3s steps(26, end);}@keyframes typing {    0{        width: 0;    }    100% {        width: 26ch;     }}
```

就可以得到如下结果啦：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqxm0WqUDLLgocmibJ8UlUGMHjhNQ1BNwSHLfeyKTSAzcht2A1fRM0XjA/640?wx_fmt=gif&from=appmsg)纯 CSS 实现文字输入效果

完整的代码你可以戳这里：

CodePen Demo -- 纯 CSS 实现文字输入效果（https://codepen.io/Chokcoco/pen/WXGoGB）

### 上述单行文本打字效果局限

当然，上述效果一开始已经写死了最终的文本。这一块，我们实际中可能是通过 Javascript 不断的赋值新内容。

不过，即便去除掉文本内容生成的方式这个因素，上述看似美好的动画效果，还有几个弊端。

1.  **「限制了等宽字体」**，这其实就是非常大的一个问题，正常的页面，其实用的肯定都不是等宽字体，常见的衬线与非衬线字体，都不是等宽字体。
    
2.  **「限制了单行文本」**，实际效果，类似于 GPT 吐答案这种，单行内容肯定是无法满足的，我们需要有一种光标效果能适配多行文本的方式。
    

巧用 background 实现多行光标效果
----------------------

好，那接下来，我们尝试换一种思路实现一个适配单行和多行的文本打字效果。

首先，我们将文本内容的生成，替换成使用 Javascript 生成：

```
<p id="content"></p>
```

```
const text = 'Lorem ipsum dolor sit amet consectetur adipisicing elit......';const contentElement = document.getElementById('content');let index = 0;function addNextCharacter() {  if (index < text.length) {    contentElement.textContent += text[index];    index++;    setTimeout(addNextCharacter, Math.random() * 150 + 30);  }}addNextCharacter();
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqeCNIibEYT5m8ubJrWjDLrpUCMcx0PgBLF1oFgjsB5X46VfDm8mK3Ygg/640?wx_fmt=gif&from=appmsg)

接下来，我们核心需要实现的就是**「任意行数下动态光标的效果」**。

也就是最开始的这个效果，文字最后的光标效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSq6SnO6yPbKNo0Lw8w9tUEwAzDKsUdgKkLE7A1LYUuw8Q5dNfavERKTg/640?wx_fmt=gif&from=appmsg)

读到这里，暂停 10 秒，思考一下如果让你来实现，会用什么方式实现？能用什么方式实现？有没有低成本快速能实现的奇技淫巧？

这里，我们可以使用行内元素的 background 渐变实现。

复习一下，之前我们讲过很多次是 background 在`display: inline` 和 `display: block` 下的不同表现。

其核心现象就是 `display: inline` 内联元素的 `background` 展现形式与 `display: block` 块级元素（或者 `inline-block`、`flex`、`grid`）不一致。

简单看个例子：

```
<p>Lorem .....</p><a>Lorem .....</a>
```

这里需要注意，`<p>` 元素是**「块级元素」**，而 `<a>` 是**「内联元素」**。

我们给它们统一添加上一个从绿色到蓝色的渐变背景色：

```
p, a {
  background: linear-gradient(90deg, blue, green);
}
```

看看效果：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqPdtsoS5bmEVHDkalCicEwoFaNVs2fOMGPBm7tQqWEZQmCw9VoRflHJQ/640?wx_fmt=png&from=appmsg)

什么意思呢？区别很明显，块级元素的背景整体是一个渐变整体，而内联元素的每一行都是会有不一样的效果，整体连起来串联成一个整体。

基于上述的 Demo，我们可以给它们添加一个 `background-size` 的动画。像是这样：

```
<p>Lorem .....</p><a>Lorem .....</a>
```

```
p, a {    color: #000;    background: linear-gradient(90deg, blue, green);    background-size: 100% 100%;    background-repeat: no-repeat;    transition: all 1s linear;}p:hover ,a:hover {    background-size: 0 100%;}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqxFsFgY7dxTEqR1kZ0rFzNuqs5sicLiaQbXvEGQwTia2iaNenowED849ibBQ/640?wx_fmt=gif&from=appmsg)

> ❝
> 
> 完整代码戳这里：CodePen Demo -- background & display Animation DEMO（https://codepen.io/Chokcoco/pen/PoBPbOB）
> 
> ❞

就可以得到这样不同的动画，可以看到，在 `display: inline` 的 `<a>` 标签下，动画效果是以行为单位进行变换的。

针对这个特性，我们将我们的文本容器，改为 `display: inline`，然后给他设置一个特殊的背景，前 `100% - 2px` 宽度为一个颜色，最后 `2px` 为一个颜色。

我们继续改造一下我们上述的 DEMO：

```
<p id="content"></p>
```

```
p {    display: inline;    background: linear-gradient(90deg, #fc0, #fc0 calc(100% - 2px), #f00 calc(100% - 2px), #f00);}
```

其中核心的背景代码 `background: linear-gradient(90deg, #fc0, #fc0 calc(100% - 2px), #f00 calc(100% - 2px), #f00)` 表达的含义就是前 `100% - 2px` 宽度为橙色，最后 `2px` 为红色。

看看，此时整个的效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqCbdad2eZoTwaLTg4jTdRYCzYmqJicbtcQdfFrohXvm0vDf0clVAhRIQ/640?wx_fmt=gif&from=appmsg)

好好理解一下：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSqR21Gbz3PbrKNOvYbjkrCQ9jzZwJcf2zhWylic01oMFE8ib4aRYUY0mTA/640?wx_fmt=png&from=appmsg)

基于上述这个效果：

1.  我们只需要把前 `100% - 2px` 宽度的橙色，设置为透明
    
2.  最后 2px 的红色，设置成 `#000` 黑色到 `transparent` 透明的动态变化
    

完整的 CSS 代码如下：

```
:root {    --pointerColor: #000;}p {    display: inline;    background: linear-gradient(90deg, transparent, transparent calc(100% - 2px), var(--pointerColor) calc(100% - 2px), var(--pointerColor));    animation: colorChange .8s linear infinite;    padding-right: 4px;}@keyframes colorChange {    0%, 50% {        --pointerColor: #000;    }    50%, 100% {        --pointerColor: transparent;    }}
```

如此一来，我们就成功的实现了**「任意行数下动态光标的效果」**。得到了最初的完整效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvAggiahmiasxjicZXRtsr3HSq6SnO6yPbKNo0Lw8w9tUEwAzDKsUdgKkLE7A1LYUuw8Q5dNfavERKTg/640?wx_fmt=gif&from=appmsg)

整个 DEMO 的完整代码，你可以戳这里了解：CodePen Demo -- 多行打字效果（https://codepen.io/Chokcoco/pen/zYXLYVN）

**「整个方案的核心，在于理解如何利用内联元素的 background，巧妙的实现动态光标效果，需要好好理解其中的奥妙」**。

当然，实现这个动态光标的方式还有很多，譬如，我们只需要用一个宽度为 `2px` 的 `<span>` 元素，插入到元素的最尾部，实现 `#000` 黑色到 `transparent` 透明的动态变化。

只是文中这种方式，我认为是元素最少，且最为巧妙的方式。

最后
--

好了，本文到此结束，希望本文对你有所帮助 :)

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)  

`点赞`和`在看`是最大的支持 ⬇️❤️⬇️