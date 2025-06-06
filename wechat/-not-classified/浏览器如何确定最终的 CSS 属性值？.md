> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/S6XPfYyfEWvbT9Eam-WeNA)

  

---

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
--

上篇文章中有提到 CSS 值的处理过程，但如果想要确定一个元素的最终样式值可以不需要这么多步。实际上我们写的任何一个标签元素无论写没写样式，它都会有一套完整的样式。理解这一点非常重要‼️

比如：一个简单的`p`标签

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbCicloLqwOxR9Zpcdx3WibmXo1AkfanBzNib6xckbeJK9R7tf2GP3M00GA/640?wx_fmt=png&from=appmsg)

打开浏览器控制台，选中元素，切换到`computed`选项，勾选`show all`，这里就能够看到元素的所有 CSS 样式，尽管你什么样式也没写，它们也是有默认值的。任何标签都是这样，只不过默认值可能不一样。

一道面试题
-----

```
<div style="color: red;">
    <p>前端</p>
    <a href="#">南玖</a>
</div>


```

很简单的一段代码，只需回答出这两个元素各自的文字颜色。

如果能够正确回答出，并知道其中的原理，OK 那么这篇文章要讲的内容你都掌握了，如果不能，那么这篇文章需要好好阅读并理解一番。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbL24TPXV0Y1IhtOdLliaVvdqaFapwUcCew5nK3ocBxfho08Vs2cMxomA/640?wx_fmt=png&from=appmsg)

答案是一红一蓝。

CSS 属性值的确定步骤
------------

要确定属性值的话，我们可以先想想 CSS 属性值都可以从哪里来？

声明值？继承？默认值？

想了想 CSS 值好像也只能从这三个地方来获取，再加上一个比较权重，我们是不是就可以确定一个 CSS 属性的值了？

ok，浏览器也确实是按这些步骤来确定 CSS 属性值的：

*   声明值：这里包含开发者自定义声明与用户代理的样式表【user agent stylesheet】（相当于浏览器默认样式表需要与默认值区分开）
    
*   比较权重：因为可能会有重复声明
    
*   继承：如果前两步还没确定值并且这个属性是可以继承的话，那么这个时候就可以使用继承值
    
*   默认值：最后如果还是无法确认值的话才会使用默认值
    

### 声明值

第一步是确认声明值，还是以上面代码为例

```
<div style="color: red;">
    <p>前端</p>
    <a href="#">南玖</a>
</div>


```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbUffeWF714HZkcGJ2oaDeFAR0MpJMDezehUGnJdg6XvlOfGanlTI8UQ/640?wx_fmt=png&from=appmsg)

  

当前`div`既有开发者自定义声明样式（红框）也有用户代理样式（蓝框），这两块都属于声明值。

### 比较权重

再把代码做点变更

```
<div style="color: red;">
    <p style="margin: 2px;">前端</p>
    <a href="#">南玖</a>
</div>


```

注意看此时`p`标签的外边距

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbK7xoNicKSgVBGeyZcF0iaS1HxAQEccNKQRdEicGQJTZKyic2FrNjqPbh3g/640?wx_fmt=png&from=appmsg)

由于开发者自定义声明样式表与用户代理样式表都有定义`margin`值，最终应用的是开发者自定义声明样式表，所以**开发者自定义声明样式表的权重要高于用户代理样式表**

如果同为开发者自定义声明的样式表有冲突，则按正常的样式权重进行比较。对比较规则不了解的同学可以查看文档

### 继承

同样还是上面的代码，我们可以看到对于`p`标签我们既没有声明他的文字颜色，用户代理样式表同样也没声明文字颜色，那么它的红色是从哪来的呢？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbWwXaoL5IsFnibJ0Y3ZhD8lXFJdwaIYEJd347RIiaQicaoHSicz7ZIqx4hg/640?wx_fmt=png&from=appmsg)

答案是继承自`div`的文字颜色，因为前两步都不能确定`p`标签的`color`属性值，而`color`又恰好是可以继承的，并且父元素又正好有定义`color`属性的值。所以此时`p`标签就会继承父元素的`color`属性，渲染成红色字体。

这里需要注意的是继承采用就近原则，与权重无关

比如：

```
<div style="color: yellow !important;">
    <div style="color: red;">
        <p style="margin: 2px;">前端</p>
        <a href="#">南玖</a>
    </div>
</div>


```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbuvLjkicHOYdcaTTxdIDBTGAvkvKiaY7ErlQMgwGusB8w57ggPxxoZNXg/640?wx_fmt=png&from=appmsg)

  

这里虽然`important`的权重更高，但最终继承的还是最近的属性值。

### 默认值

如果前三步都没能确认属性的值，则会使用默认值。

代码同上，比如还是`p`标签，我们没有自定义声明它的`font-size`，用户代理样式表也同样没有声明，它的父级元素同样没有声明，这也就说明对于`font-size`来说既没有声明值也没有继承值，那它最终渲染是按多大的字号来呈现的呢？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbic3fUdpGtV5OdiaVbc1u47ibatpBoMhCiaMctIJ1XMXzic7b2ia4oJFJns3w/640?wx_fmt=png&from=appmsg)

答案就是默认值，谷歌浏览器对于`p`标签的默认字号为 16px。

面试题解答
-----

```
<div style="color: red;">
    <p>前端</p>
    <a href="#">南玖</a>
</div>


```

  

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbL24TPXV0Y1IhtOdLliaVvdqaFapwUcCew5nK3ocBxfho08Vs2cMxomA/640?wx_fmt=png&from=appmsg)

  

`p`标签文字为红色这很好理解，因为继承自父元素的 color 值。

问题在于为什么`a`标签没有继承呢？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4b504ibxNukbksU2Qt0oiaDbrX4yNUQ96ZspRJd2n3jTPHzunxTGGuRklL8en5xYNZzmvXpGIu8r3Q/640?wx_fmt=png&from=appmsg)

因为对于`a`标签来说，虽然没有自定义声明`color`，但用户代理样式表中有声明`color`，所以会直接使用用户代理样式表中的`color`值，而不会使用继承值。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```