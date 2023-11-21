> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1E2gOSniHjUZpii9Pm7t0g)

大家好，我是零一。前段时间我在知乎刷到这样一个提问：为什么 CSS 这么难学？

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQGTIEPeljWXAQPJF6MtrQzutnGgtG14baiardoia8Aerjs9UgUrPgDeFw/640?wx_fmt=png)知乎某用户提问

看到这个问题以后，我仔细一想，CSS 学习起来好像是挺困难的，它似乎没有像 JavaScript 那样非常系统的学习大纲，大家平时也不会用到所有的 CSS，基本上用来用去就是那么几个常用的属性，甚至就连很多培训机构的入门教学视频都也只会教你一些常用的 CSS（不然你以为一个几小时的教学视频怎么能让你快速入门 CSS 的呢？）

一般别人回答你 CSS 很好学也是因为它只用那些常用的属性，他很有可能并没有深入去了解。要夸张一点说，CSS 应该也能算作一门小小的语言了吧，深入研究进去，知识点也不少。我们如果不是专门研究 CSS 的，也没必要做到了解 CSS 的所有属性的使用以及所有后续新特性的语法，可以根据工作场景按需学习，但要保证你学习的属性足够深入~

那么我们到底该如何学习 CSS 呢？ 为此我列了一个简单的大纲，想围绕这几点大概讲一讲

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQ5xIW7hUzg43HOq4ZyZaremkfPx8eVASpRN16BY2MqZJKaVZcBBL7nA/640?wx_fmt=png)CSS 学习大纲

一、书籍、社区文章
---------

这应该是大家学习 CSS 最常见的方式了（我亦如此）。有以下几个场景：

场景一：开发中遇到「文本字数超出后以省略号 (...) 展示」的需求，打开百度搜索：`css字数过多用省略号展示`，诶~ 搜到了！`ctrl+c、ctrl+v`，学废了，完工！

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQSZDJpWI0iahKVnzJv26cyibXycSgr7g7GeRYGMu9nney3vWpicpy4EDxg/640?wx_fmt=png)搜索引擎学习法

场景二：某天早晨逛技术社区，看到一篇关于 CSS 的文章，看到标题中有个 CSS 属性叫`resize`，`resize`属性是啥，我咋没用过？点进去阅读得津津有味~ two minutes later ~ 奥，原来还有这个属性，是这么用的呀，涨姿势了！

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQycJow5halOw0dZzM3ukelib4MOo4VFl2ZnXWibJb2zVo8ibw77xQgEh9Q/640?wx_fmt=png)社区博客学习法

场景三：我决定了，我要好好学 CSS，打开购物网站搜索：`CSS书籍`，迅速下单！等书到了，开始每天翻阅学习。当然了此时又有好几种情况了，分别是：

*   就只有刚拿到书的第一天翻阅了一下，往后一直落灰
    
*   看了一部分，但又懒得动手敲代码，最终感到无趣放弃了阅读
    
*   认认真真看完了书，也跟着书上的代码敲了，做了很多笔记，最终学到了很多
    

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQXv6PQueIxX9Y3tUiaePDLs0EpDllpfNB1y90x9OPygBaiaUnnMkgSY1A/640?wx_fmt=png)

无论是上面哪几种方式，我觉得都是挺不错的，顺便再给大家推荐几个不错的学习资源

*   张鑫旭大佬的博客 [1]
    
*   大漠老师的 W3Cplus[2]
    
*   coco 大佬的 iCSS[3]
    

毕竟站在巨人的肩膀上，才是最高效的，你们可以花 1 个小时学习到大佬们花 1 天才总结出来的知识

二、记住 CSS 的数据类型
--------------

CSS 比较难学的另一个点，可能多半是因为 CSS 的属性太多了，而且每个属性的值又支持很多种写法，所以想要轻易记住每个属性的所有写法几乎是不太可能的。最近在逛博客时发现原来 CSS 也有自己的数据类型，这里引用一下张鑫旭大佬的 CSS 值类型文档大全 [4]，方便大家后续查阅

简单介绍一下 CSS 的数据类型就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQcvJibdibEoz4DK7n0KrayMGVSpgfMg8bGnQNwE4Lo24YRhs8oaPbpmAA/640?wx_fmt=png)CSS 数据类型

图中用`<>`括起来的表示一种 CSS 数据类型，介绍一下图中几个类型：

*   <number>：表示值可以是数字
    
*   <length>：表示元素的尺寸长度，例如`3px`、`33em`、`34rem`
    
*   <percentage>：表示基于父元素的百分比，例如`33%`
    
*   <number-percentage>：表示值既可以是 <number>，也可以是 <percentage>
    
*   <position>：表示元素的位置。值可以是 <length>、<percentage>、`left/right/top/bottom`
    

来看两个 CSS 属性：

*   第一个是`width`，文档会告诉你该属性支持的数据类型有 <length> 和 <percentage>，那么我们就知道该属性有以下几种写法：`width: 1px`、`width: 3rem`、`width: 33em`、`width: 33%`
    
*   第二个属性是`background-position`，文档会告诉你该属性支持的数据类型有 <position>，那么我们就知道该属性有以下几种写法：`background-position: left`、`background-position: right`、`background-position: top`、`background-position: bottom`、`background-position: 30%`、`background-position: 3rem`
    

从这个例子中我们可以看出，想要尽可能得记住更多的 CSS 属性的使用，可以从记住 CSS 数据类型（现在差不多有 40 + 种数据类型）开始，这样你每次学习新的 CSS 属性时，思路就会有所转变，如下图

没记住 CSS 数据类型的我：

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQc7p6r0KEjw8wmvxyHxr9Hb0KkOdJFS5T5xs8EkX8NvGwalgPMuK49g/640?wx_fmt=png)之前的思想

记住 CSS 数据类型的我：

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQLlt9sB6CHR9JMDIUNstRqP3oOg8DDP7Ld56mFSRsBTcdicAMhJDg5UQ/640?wx_fmt=png)现在的思想

不知道你有没有发现，如果文档只告诉你`background-position`支持 <position> 数据类型，你确定你能知道该属性的全部用法吗？你确实知道该属性支持`background-position: 3rem`这样的写法，因为你知道 <position> 数据类型包含了 <length> 数据类型，但你知道它还支持`background-position: bottom 50px right 100px;`这样的写法吗？为什么可以写四个值并且用空格隔开？这是谁告诉你的？

这就需要我们了解 CSS 的语法了，请认真看下一节

三、读懂 CSS 的语法
------------

我之前某个样式中需要用到裁剪的效果，所以准备了解一下`CSS`中的`clip-path`属性怎么使用，于是就查询了比较权威的 clip-path MDN[5]，看着看着，我就发现了这个

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQvS3cWEsh8c1upIibyIWZiaQT7oG7oZK2ZVEtdibu5oYkJIp69ZAMHJ1iaA/640?wx_fmt=png)clip-path 语法

我这才意识到我竟然连 CSS 的语法都看不懂。说实话，以前无论是初学 CSS 还是临时找一下某个 CSS 属性的用法，都是直接百度，瞬间就能找到自己想要的答案（例如菜鸟教程），而这次，我是真的傻了！ 因为本身`clip-path`这个属性就比较复杂，支持的语法也比较多，光看 MDN 给你的示例代码根本无法 Get 到这个属性所有的用法和含义（菜鸟教程就更没法全面地教你了）

于是我就顺着网线去了解了一下 CSS 的语法中的一些符号的含义，帮助我更好得理解语法

因为关于 CSS 语法符号相关的知识在 CSS 属性值定义语法 MDN[6] 上都有一篇超级详细的介绍了（建议大家一定要先看看 MDN 这篇文章！！非常通俗易懂），所以我就不多做解释了，这里只放几个汇总表格

### 属性组合符号

属性组合：表示多个属性值的书写组合情况。例如在`border: 1px solid #000`中，`1px`能否和`solid`互换位置、`#000`能否省略等等，这些都是属性的组合情况

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">符号</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">名称</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">作用</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">空格</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">并置</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">空格左右两侧的属性顺序不能互换</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">,</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">逗号 (分隔符)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">逗号两侧的属性之间必须用逗号隔开</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">/</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">斜杠 (分隔符)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">斜杠两侧的属性之间必须用斜杠隔开</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">&amp;&amp;</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"与" 组合符</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"与" 组合符两侧的属性都必须出现，但左右顺序随意</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">||</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"或" 组合符</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"或" 组合符两侧的属性至少出现一个，且左右顺序随意</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">|</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"互斥" 组合符</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"互斥" 组合符两侧的属性恰好只出现一个</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">[]</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">中括号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">中括号包住的内容表示一个整体，可以类似看成数学中的小括号 ()</td></tr></tbody></table>

### 组合符优先级

"与" 组合符、"或" 组合符、"互斥" 组合符都是为了表示属性值出现的情况，但这三者之间还有个优先级。例如`bold | thin || <length>`，其中 “或” 组合符的优先级高于 “互斥” 组合符，所以该写法等价于`bold | [thin || <length>]`

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">符号</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">名称</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">优先级（数字越大，优先级越大）</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">空格</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">并置</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">4</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">&amp;&amp;</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"与" 组合符</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">3</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">||</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"或" 组合符</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">2</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">|</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">"互斥" 组合符</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">1</td></tr></tbody></table>

### 属性重复符号

属性重复：表示某个或某些属性的出现次数。例如在`rgba(0, 0, 0, 1)`中，数字的个数能否是 3 个、最后一位能否写百分比。这有些类似于正则的重复符号

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">符号</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">名称</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">作用</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">无</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">不写符号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">默认。不写符号表示这个属性只出现一次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">+</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">加号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">加号左侧的属性或整体出现一次或多次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">?</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">问号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">问号左侧的属性或整体出现零次或一次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">*</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">星号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">星号左侧的属性或整体出现零次或一次或多次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">#</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">井号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">井号左侧的属性或整体出现一次或多次，且以逗号 (<code>,</code>) 隔开</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">{A, B}</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">大括号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">大括号左侧的属性或整体最少出现 A 次，最多出现 B 次</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">!</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">感叹号</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">感叹号左侧的整体中必须出现一个属性，即使该整体中全部属性都声明了可以出现零次</td></tr></tbody></table>

### 解读 CSS 语法

以本节`clip-path`的语法为例，我们来简单对其中某一个属性来进行解读（只会解读部分哦，因为解读全部的话篇幅会很长很长）

先看看整体的结构

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQsuFyk0WKExHoNazK5uOa20V9Qwsjmib0vOBnhia8S1OrbReicQ0p9lgzQ/640?wx_fmt=png)clip-path 的语法

一共分为四部分，顺序是从上到下的，每两个部分之间都以`where`来连接，表示的是`where`下面的部分是对上面那个部分的补充解释

①：表示的是`clip-path`这个属性支持的写法为：要不只写 <clip-source> 数据类型的值，要不就最起码从 <basic-shape> 和  <geometry-box> 这两者之间选一种类型的值来写，要不就为`none`。

②：我们得知①中的 <basic-shape> 数据类型支持的写法为：`inset()`、`circle()`、`ellipse()`、`polygon()`、`path()`这 5 个函数

③：因为我们想了解`circle()`这个函数的具体使用，所以就先只看这个了。我们得知`circle()`函数的参数支持 <shape-radius> 和 <position> 两种数据结构，且两者都是可写可不写，但如果要写 <position> ，那前面必须加一个`at`

④：首先看到 <shape-radius> 支持的属性是 <length-percentage> （这个顾名思义就是`<length>`和`<percentage>`）、`closest-side`、`farthest-side`。而 <position> 数据类型的语法看起来就比较复杂了，我们单独来分析，因为真的非常非常长，我将 <position> 格式化并美化好给你展现出来，便于你们阅读（我也建议你们如果在学习某个属性的语法时遇到这么长的语法介绍，也像我一下把它格式化一下，这样方便你们阅读和理解）

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQDN7ywDickBh4cdnvUle6ibWvrk30QucMP9sBtqTg5VZoagWQEcuHTlzg/640?wx_fmt=png)数据类型的语法

如图可得，整体分为三大部分，且这三部分是互斥关系，即这三部分只能出现一个，再根据我们前面学习的 CSS 语法的符号，就可以知道怎么使用了，因为这里支持的写法太多了，我直接列个表格吧（其实就是排列组合）！如果还有不懂的，你们可以仔细阅读一下 MDN 的语法介绍或者也可以评论区留言问我，我看到会第一时间回复！

<position> 类型支持的写法

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">第一部分</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">第二部分</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); color: rgb(62, 76, 163); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;">第三部分</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px; word-break: break-all;"><code>left</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30px top 30px</code> 或 <code>top 30px left 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30px top 30%</code> 或 <code>top 30% left 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30px bottom 30px</code> 或 <code>bottom 30px left 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>top</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30%</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30px bottom 30%</code> 或 <code>bottom 30% left 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>bottom</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>3px</code> 或 <code>3em</code> 或 <code>3rem</code> 等长度值</td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30% top 30px</code> 或 <code>top 30px left 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left top</code> 或 <code>top left</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left top</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30% top 30%</code> 或 <code>top 30% left 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left center</code> 或 <code>center left</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30% bottom 30px</code> 或 <code>bottom 30px left 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left bottom</code> 或 <code>bottom left</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left bottom</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30% bottom 30%</code> 或 <code>bottom 30% left 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30%</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30px top 30px</code> 或 <code>top 30px right 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right top</code> 或 <code>top right</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>left 30px</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30px top 30%</code> 或 <code>top 30% right 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right center</code> 或 <code>center right</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center top</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30px bottom 30px</code> 或 <code>bottom 30px right 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right bottom</code> 或 <code>bottom right</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30px bottom 30%</code> 或 <code>bottom 30% right 30px</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center bottom</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30% top 30px</code> 或 <code>top 30px right 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center 30%</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30% top 30%</code> 或 <code>top 30% right 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>center 30px</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30% bottom 30px</code> 或 <code>bottom 30px right 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right top</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30% bottom 30%</code> 或 <code>bottom 30% right 30%</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right bottom</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30%</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>right 30px</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30% top</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30% center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30% bottom</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30% 30%</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30% 30px</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30px top</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30px center</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30px bottom</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30px 30%</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><code>30px 30px</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 13px; text-align: center; letter-spacing: 0.07em; min-width: 85px;"><br></td></tr></tbody></table>

嚯！累死我了，这支持的写法也太多太多了吧！

四、多动手尝试
-------

上一节，我们在学习`clip-path`属性的语法以后，知道了我们想要的圆圈裁剪（`circle()`）的语法怎么写，那么你就真的会了吗？可能你看了 MDN 给你举的例子，知道了`circle(40%)`大致实现的效果是咋样的，如下图

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQ1SLxCTj2cDE1CHUseeHL8VuT5y32pFdJsgJIibNialRb2HjRyBG99icFQ/640?wx_fmt=png)MDN clip-path 的简单案例

如我前文说的一样，MDN 只给你列举了`circle()`这个函数最简单的写法，但我们刚刚学习了其语法，得知还有别的写法（例如`circle(40% at left)`），而且 MDN 文档也只是告诉你支持哪些语法，它也并没有明确告诉你，哪个语法的作用是怎么样的，能实现什么样的效果。

此时就需要我们自己上手尝试了

```
<!DOCTYPE html><html lang="en"><head>    <meta charset="UTF-8">    <title>尝试clip-path的circle()的使用</title>    <style>        #zero2one {            width: 100px;            height: 100px;            background-color: ;            clip-path: circle(40%);   <!-- 等会就在这一行改来改去,反复尝试！ -->        }    </style></head><body>    <div id="zero2one"></div></body></html>
```

看一下效果，嗯，跟 MDN 展示的是一样的

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQr9LZicDmziaCLRBUqf5JNf82LEaSQH6bFAO0umKkEjQfYKVdkfZAsvVA/640?wx_fmt=png)clip-path: circle(40%)

再修改一下值`clip-path: circle(60%)`，看看效果

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQbXReqduDacMXIlaOx9M6z40XVJHxj96LS250rshTokHr1sG5Vxib8HQ/640?wx_fmt=png)clip-path: circle(60%)

我似乎摸出了规律，看样子是以元素的中心为基准点，`60%`的意思就是从中心到边缘长度的 60% 为半径画一个圆，裁剪掉该圆之外的内容。这些都是 MDN 文档里没有讲到的，靠我亲手实践验证出来的。

接下来我们来试试其它的语法~

试试将值改成`clip-path: circle(40% at top)`

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQ76X8SvMFJqEPJJboDHyWm4js9h4Lfj9oJjGZ0J8VGVko2Qr0wCBIHA/640?wx_fmt=png)clip-path: circle(40% at top)

诶？很神奇！为什么会变成这个样子，我似乎还没找到什么规律，再把值改一下试试`clip-path: circle(80% at top)`

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQxgf1sh2kZwEKV70taReKVlpNXXIf732ykkZTxtIcgybdK392gGKJgQ/640?wx_fmt=png)clip-path: circle(80% at top)

看样子圆心挪到了元素最上方的中间，然后以圆心到最下面边缘长度的 80% 为半径画了个圆进行了裁剪。至此我们似乎明白了`circle()`语法中`at` 后面的`<position>`数据类型是干什么的了，大概就是用来控制裁剪时画的圆的圆心位置

剩下的时间就交给你自己来一个一个试验所有的语法了，再举个简单的例子，比如你再试一下`clip-path: circle(40% at 30px)`，你一定好奇这是啥意思，来看看效果

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQtMVcnboOPTBFrVy11FBciaohya6hTUN5Sy5efPAP1JgZkvRrJa8rcCg/640?wx_fmt=png)clip-path: circle(40% at 30px)

直观上看，整个圆向左移动了一些距离，在我们没设置`at 30px`时，圆心是在元素的中心的，而现在似乎向右偏移了，大胆猜测`at 30px`的意思是圆心的横坐标距离元素的最左侧 30px

接下来验证一下我们的猜测，继续修改其值`clip-path: circle(40% at 0)`

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQSNoCrkOSxzor5icwMbaImQjXzMq4Qr6oRB35JxmY0Tc2niceJSX7qm5w/640?wx_fmt=png)clip-path: circle(40% at 0)

很明显此时的圆心是在最左侧的中间部分，应该可以说是证明了我们刚才的猜测了，那么不妨再来验证一下纵坐标的？继续修改值`clip-path: circle(40% at 0 0)`

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQbBkW5nna0VSfkd6Gq1yJeGciaDtmtUt15bZwjERXVcFib0um8AIfmobQ/640?wx_fmt=png)clip-path: circle(40% at 0 0)

不错，非常顺利，`at 0 0`中第二个`0`的意思就是圆心纵坐标离最上方的距离为 0 的意思。那么我们此时就可以放心得得出一个结论了，对于像`30px`、`33em`这样的 <length> 数据类型的值，其对应的坐标是如图所示的

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQBtAAiba5tib9dsSSiaIGwPLkQTzmFPyR3msUYJCPPdcmM4dWXGnD21Flg/640?wx_fmt=png)坐标情况

好了，本文篇幅也已经很长了，我就不继续介绍其它语法的使用了，刚才纯粹是用来举个例子，因为本文我们本来就不是在介绍`circle()`的使用教程，感兴趣的读者可以下去自己动手实践哦~

所以实践真的很重要很重要！！MDN 文档没有给你列举每种语法对应的效果，因为每种都列出来，文档看着就很杂乱了，所以这只能靠你自己。记得张鑫旭大佬在一次直播中讲到，他所掌握的 CSS 的特性，也都是用大量的时间去动手试出来的，也不是看看啥文档就能理解的，所以你在大佬们的一篇文章中了解到的某个 CSS 属性的使用，可能是他们花费几小时甚至十几个小时研究出来的。

CSS 很多特性会有兼容性问题，因为市面上有很多家浏览器厂商，它们支持的程度各不相同，而我们平常了解 CSS 某个属性的兼容性，是这样的

查看 MDN 的某个属性的浏览器兼容性

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQwcLCcBto6Uum622rI5lDetHElfibiclfLnXQ5qpEI1iaaMyPndnRtGkMQ/640?wx_fmt=png)clip-path 的浏览器兼容性

通过 Can I Use[7] 来查找某个属性的浏览器兼容性

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQ4O7U02JmmINiabhQc4KfypVXQNODicSsaEGa4K4icriaIqho2h2lGqBGuw/640?wx_fmt=png)can i use

这些都是正确的，但有时候可能某些 CSS 属性的浏览器兼容性都无法通过这两个渠道获取到，那么该怎么办呢？手动试试每个浏览器上该属性的效果是否支持呗（鑫旭大佬说他以前也会这么干），这点我就不举例子了，大家应该能体会到

☀️ 最后
-----

其实每个 CSS 大佬都不是因为某些快捷的学习路径而成功的，他们都是靠着不断地动手尝试、记录、总结各种 CSS 的知识，也会经常用学到的 CSS 知识去做一个小 demo 用于巩固，前几个月加了大漠老师的好友，我就经常看到他朋友圈有一些 CSS 新特性的 demo 演示代码和文章（真心佩服），coco 大佬也是，也经常会发一些单纯用 CSS 实现的炫酷特效

另外，如果想要更加深入，你们还可以关注一下 CSS 的规范，这个比较权威的就是 W3C 的 CSS Working Group[8] 了，里面有很多 CSS 的规范文档

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcy00dJ053miblP49JhicOXHSQE9oHtGYyVlea78Z5IZ8cibjFzQxxa7Amdud9Agzlp1CrXlqcYTmddAg/640?wx_fmt=png)w3c css 规范

好了，再推荐几本业界公认的还算不错的书籍吧~ 例如《CSS 权威指南》、《CSS 揭秘》、《CSS 世界》、《CSS 新世界》等等...

最后对于「如何学习 CSS？」这个话题，你还有什么问题或者你觉得还不错的学习方法吗？欢迎在评论区留言讨论~

我是零一，分享技术，不止前端，喜欢就给我的文章点个赞👍🏻吧，感谢你们的支持！！

### 参考资料

[1]

张鑫旭大佬的博客: https://www.zhangxinxu.com/

[2]

W3Cplus: https://www.w3cplus.com/

[3]

iCSS: https://github.com/chokcoco/iCSS

[4]

CSS 值类型文档大全: https://www.zhangxinxu.com/wordpress/2019/11/css-value-type/

[5]

clip-path MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path

[6]

CSS 属性值定义语法 MDN: https://developer.mozilla.org/zh-CN/docs/Web/CSS/Value_definition_syntax

[7]

Can I Use: https://caniuse.com/

[8]

CSS Working Group: https://www.w3.org/Style/CSS/current-work