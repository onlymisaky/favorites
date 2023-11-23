> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/yCyM-0JDx5HLCctHzzjMsA)

![](https://mmbiz.qpic.cn/mmbiz_png/bf3IxiaNZpLusVatP0twyKbpeFHI34NRQBV4XngVichjEJRKJnxCbr5fCFYpd9wLMsGK328IibuXKWIAJ39yZnZicw/640?wx_fmt=png)

视频讲解

音频讲解

文字讲解

### 1、先讲结论

`border-radius` 这个 css 属性大家应该使用得非常娴熟，现实中用到的场景基本都是四个圆角一致的情况。

比如实现一个圆形按钮，其中 `border-radius` 数值有些人写为 `50%`，有些人则写成 `100%`，不过你会发现两者效果是一样的：

> 测试 HTML 代码如下：

```
<style>  .circle-btn {    color: white;    width: 100px;    height: 100px;    text-align: center;    line-height: 100px;  }</style><div class="circle-btn" style="    background: #8BC34A;    border-radius: 100%;">50%</div><div class="circle-btn" style="    background: #E91E63;    border-radius: 100%;">100%</div>
```

![](https://mmbiz.qpic.cn/mmbiz_png/bf3IxiaNZpLusVatP0twyKbpeFHI34NRQm73wur9vZzzUORT00zdZAaD6XaQw1xNSfze6mK0flTzvCGBy2OFZLw/640?wx_fmt=png)result

其实不论是 `50%` 还是 `100%`，只要将 `border-radius` 设置成 `x%`，且 `x >= 50` 都能获得和 `50%` 一样的效果。

如果不知道其中的原因，可以继续往下看。

### 2、原因分析

第 1 个知识点是 `border-radius` 的写法，最全的写法是这样的，记住这张图就行：![](https://mmbiz.qpic.cn/mmbiz_png/bf3IxiaNZpLusVatP0twyKbpeFHI34NRQ4Nxujxs1x0UiamDpC2KqsH4nPdXD6r7L5HCiaGJDqogde2EVnSKHsWqw/640?wx_fmt=png)

> 详细教程可参考《CSS Border-Radius Can Do That?》

第 2 个知识点是 `border-radius` 的标准，在`border-radius` 标准中 Overlapping Curves 章节里，有这么一段话：

![](https://mmbiz.qpic.cn/mmbiz_jpg/bf3IxiaNZpLusVatP0twyKbpeFHI34NRQEicKjYibrBdmJHGQ4ibRhM5ich3NAsjwTxPsOZj6TFVZL7GZ5Q7BB3Hw8A/640?wx_fmt=jpeg)

标准中关于曲线重叠的说明

简单翻译为：**角曲线不得重叠：当任意两个相邻边框半径的总和超过边框的长度时，UA（标准实现方）必须按比例减少所有边框半径的使用值，直到它们没有重叠**

我们知道两个前提：

*   每一条边最高可用长度也就 100%；
    
*   每一条边最多可以设置两个圆角曲线（在边的两端）
    

这两端的椭圆半轴长度设置值之和存在两者情况：

*   设置值加起来不超过 100%，那么大伙儿各自安好，互不干扰；
    
*   设置值加起来如果超过 100%，那需要按比例重新划分：比如一个设置 100%，一个设置成 300%，加起来就 400% 了（超过 100% 了） —— 那么实际上一个真正分得长度的 1/4，另一个真正分得长度的 3/4；
    

结合 **知识点 1** 和 **知识点 2** 就能得到文章最开始的结论了。

### 3、小工具 + 小练习

如果对 `border-radius` 的写法不太熟也没关系，有个在线工具可以帮你更好的理解。

另外，最近看到使用单个 div + `border-radius` 实现以下 “转动的太极图”，大伙儿可以练习一下：

![](https://mmbiz.qpic.cn/mmbiz_gif/bf3IxiaNZpLusVatP0twyKbpeFHI34NRQv8ymiaYIicDq9UOqfcicKc7c0L9aZFZaFpKicmx8YjlyxmDEDvOWNtbY7w/640?wx_fmt=gif)

用单个 div 实现太极图  

具体实现可参考以下任意一篇文章：

*   How to create a yin-yang symbol with pure CSS：使用一个 div 元素纯 CSS 实现 “阴阳” 圆形，附 源码
    
*   利用 CSS3 的 border-radius 绘制太极及爱心图案示例：使用 border-radius 绘制太极和爱心
    
*   CSS 画各种图形（五角星、吃豆人、太极图等）：更多练手的 css 项目
    

> 也可以参考我所 “抄写” 的代码

       

REFERENCE

   参考文档

*   MDN border-radius: MDN 文档
    
*   Spec border-radius: CSS3 中 border-radius 的规范
    
*   CSS Border-Radius Can Do That?：强烈推荐这篇文章（附中文译文），图文并茂，还带一个可视化工具
    
*   Fancy-Border-Radius：这个就是上一条所指的在线 border radius 工具，所见即所得的；边动手边学习，理解会快很多
    
*   秋月何时了，CSS3 border-radius 知多少？：张鑫旭教程，行文幽默，讲解清晰详细
    
*   了解 border-radius 的原理：用例子讲解 border-radius 的原理
    
*   CSS border-radius:50% 和 100% 的区别：本文主要是讨论 50% 和 100% 的设置值一样的原因
    
*   border-radius：专门生成 border-radius CSS3 代码的网站，也是所见即所得
    

关于「JSCON 专栏﹒前端 Tips」

![](https://mmbiz.qpic.cn/mmbiz_png/7QRTvkK2qC7ZaMrYWalOBlgbe0Ct7tTCpgA1OdgXLIYehib9kxCrZLVrOHu4CnZx70OJlwTS5KdHHicGZaK2PC1A/640?wx_fmt=png)

  

“**前端 Tips**” 专栏，隶属于 JSCON 专栏系列，设计初衷是快速获取前端小技巧知识，取材广泛，涵盖前端编程诸多领域。设计初衷是快速消费类知识，所以每个 tips 阅读耗时大约 5 分钟。为方便读者在不同场合阅读，每篇 tips 配有**视频**、**音频**和**文字**，挑自己喜欢方便的就行。

**欢迎大家关注我的知识专栏，更多内容等你来挖掘**

  

![](https://mmbiz.qpic.cn/mmbiz_png/7QRTvkK2qC7ZaMrYWalOBlgbe0Ct7tTCpgA1OdgXLIYehib9kxCrZLVrOHu4CnZx70OJlwTS5KdHHicGZaK2PC1A/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz/ziadDDQxbCJHZvRoFq6VQVL4HcD2qsG2Hr5mYKDzxVkpKrRNR1icic8InicFxTarnjeAPY1EwGSZqXGZq5cXMzP7RA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz/ziadDDQxbCJGDfesIJ1ialrRcQbyiapmuGh4iaiaHHTMKhDhOQTbDB8AvuslfZCthXvLricd1I5JEoBhV7NFl18Bhf6w/640?wx_fmt=png)

嘿，请问如何获取往期 tips ？

有两种方式哈：

① 在公众号内回 "**tips"** + **"期号"** 就可以。例如：回复 “**tips25**” 即可获取第 **25** 期 tips

② 前往网站：**https://boycgit.github.io/fe-program-tips，**里面提供了搜索功能

![](https://mmbiz.qpic.cn/mmbiz/ziadDDQxbCJGDfesIJ1ialrRcQbyiapmuGheGR1MQCSgxkicYNvhrQ1ZvQ4LsyMWG1dRTEZyWWgexXe6ibCT14ELMFA/640?wx_fmt=png)

  

微信中外链无法点击，完整版请点击下方的 "阅读原文"