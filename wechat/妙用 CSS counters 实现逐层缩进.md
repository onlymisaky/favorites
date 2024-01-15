> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ak0xVUndVU26guQd5QYSaw)

之前使用纯 `CSS` 实现了一个树形结构，效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQH8rALPcMSwFS5bDbMibg1H55bqKJRnKbCZf1qjmtic6bX0r3Bye1W1iauw/640?wx_fmt=png&from=appmsg)

其中，展开收起是用到了原生标签`details`和`summary。`

还有一点，树形结构是逐层缩进的，是使用内边距实现的，但是这样会有点击范围的问题，**「层级越深，点击范围越小」**，如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHHT5GicmIibhiatek7ia8KmLpGTAZ4A2LVxic7LswMdCJk8vIoiaqd5j1WKBQ/640?wx_fmt=png&from=appmsg)

之前的方案是用绝对定位实现的，比较巧妙，但也有点难以理解，不过现在发现了另一种方式也能很好的实现缩进效果，一起看看吧  

一、counter() 与 counters()
------------------------

我们平时使用的一般都是`counter`，也就是计数器，比如

```
<ul>  <li></li>  <li></li>  <li></li></ul>
```

加上计数器，通常用伪元素来显示这个计数器

```
ul {  counter-reset: listCounter; /*初始化计数器*/}li {  counter-increment: listCounter; /*计数器增长*/}li::before {  content: counter(listCounter); /*计数器显示*/}
```

这就是一个最简单的计数器了，效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHPGdnyfpoIoYnQ0HtqIoLbNFsSMQMOcyBGtNdHuzmW7CIyyckJCiaADQ/640?wx_fmt=png&from=appmsg)

我们还可以改变计数器的形态，比如改成大写罗马数字（`upper-roman`）

```
li::before {  content: counter(listCounter, upper-roman);}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHDYIia0ACt28FFE8HAyKWZqTDtDia3tjomcNWNURUyGYibIH1qhXtU4fgQ/640?wx_fmt=png&from=appmsg)

有关计数器，网上的教程非常多，大家可以自行搜索

然后我们再来看`counters()`，比前面的`counter()`多了一个`s`，叫做**「嵌套计数器」**，有什么区别呢？下面来看一个例子，还是和上面一样，只是结构上复杂一些

```
<ul>  <li>    <ul>      <li></li>      <li></li>      <li></li>    </ul>  </li>  <li></li>  <li></li>  <li>    <ul>      <li></li>      <li>        <ul>          <li></li>          <li></li>          <li></li>        </ul>      </li>    </ul>  </li></ul>
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHWCsIyJvFP5C2SqzVuD6nnGlgcFIuvczQic4VDLfgq67zeiaoib4mFJPVw/640?wx_fmt=png&from=appmsg)

看着好像也不错？但是好像从计数器上看不出层级效果，我们把`counter()`换成`counters()`，注意，`counters()`要多一个参数，表示连接字符，也就是嵌套时的分隔符，如下

```
li::before {  content: counters(listCounter, '-');}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQH916MYI8RdianDe252jAqqIYxWiak90v6BoDUibJN3PV9HNnZZQwsLoCTA/640?wx_fmt=png&from=appmsg)

是不是可以非常清楚地看出每个列表的层级？下次碰到类似的需求就不需要用 `JS` 去递归生成了，直接用 `CSS` 渲染，简单高效，也不会出错。

默认`ul`是有`padding`的，我们把这个去除看看，变成了这样

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQH68lWFMzoWF15PDoG8jy19H1cDCFfYksibudBXNN98mFbmbNByWeWwFA/640?wx_fmt=png&from=appmsg)

嗯，看着这些**「长短不一」**的序号，是不是刚好可以实现树形结构的缩进呢？

二、树形结构的逐层缩进
-----------

回到文章开头，我们先去除之前的`padding-left`，会变成这样

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHGZBNM6ZSCxVFR2glwBgBuKI9icM6tZ9TeR6JbiaWMD7sCd8mZiaTdd8DA/640?wx_fmt=png&from=appmsg)

完全看不清结构关系，现在我们加上嵌套计数器

```
.tree details{    counter-reset: count;}.tree summary{    counter-increment: count;}.tree summary::before{    content: counters(count,"-");    color: red;}
```

由于结构关系，目前序号都是`1`，没关系，只需要有嵌套关系就行，效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHp17mPnzSdZDlNibgdxWbRWRQOuwHiaRFcAlibDrkebqlJX7icxQtGeBumA/640?wx_fmt=png&from=appmsg)

**是不是刚好把每个标题都挤过去了？** 然后我们把中间的连接线去除，这样可以更方便的控制缩进的宽度

```
.tree summary::before{    content: counters(count,"");    color: red;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHvLx1H6OSgemRbwX2jQGLq6qWCOv8vE9mia6nylia2m9c5M2Tk8DQ0oUA/640?wx_fmt=png&from=appmsg)

最后，我们只需要设置这个计数器的颜色为透明就行了

```
.tree summary::before{    content: counters(count,"");    color: transparent;}
```

最终效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHNiaSC8OazVWYCCicQk6ic75VCHbvAicygmeCrStoWjvvHccB9ld207Vh1Q/640?wx_fmt=png&from=appmsg)

这样做的好处是，每个树形节点都是完整的宽度，所以 可以很轻易地实现`hover`效果，而无需借助伪元素去扩大点击范围

```
.tree summary:hover{    background-color: #EEF2FF;}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtIl6J9W0icde7bSY1VywAfQHlvEjDA3OwXNrEpjQTQ7BlycLfT1fPfdTd0QFPlic6pO5V6dhpmVv7tg/640?wx_fmt=png&from=appmsg)

还可以通过修改计数器的字号来调整缩进，完整代码可以访问以下链接：

*   CSS tree counters (juejin.cn)[1]
    
*   CSS tree counters (codepen.io)[2]
    

三、总结一下
------

以上就是本文的全部内容了，主要介绍了计数器的两种形态，以及想到的一个应用场景，下面总结一下

1.  逐层缩进用内边距比较容易实现，但是会造成子元素点击区域过小的问题
    
2.  counter 表示计数器，比较常规的单层计数器，形如 1、2、3
    
3.  counters 表示嵌套计数器，在有层级嵌套时，会自动和上一层的计数器相叠加，形如 1、1-1、1-2、1-2-1
    
4.  嵌套计数器会逐层叠加，计数器的字符会逐层增加，计数器所占据的位置也会越来越大
    
5.  嵌套计数器所占据的空间刚好可以用作树形结构的缩进，将计数器的颜色设置为透明就可以了
    
6.  用计数器的好处是，每个树形节点都是完整的宽度，而无需借助伪元素去扩大点击范围
    

[1]CSS tree counters (juejin.cn)： _https://code.juejin.cn/pen/7315323581772005414_

[2]CSS tree counters (codepen.io)： _https://codepen.io/xboxyan/pen/jOJOBdr_