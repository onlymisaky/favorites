> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iKBusl6fJcAlK_bcGO5ezQ)

> 本文作者为 360 奇舞团前端开发工程师

作为开发我们都知道，页面性能很重要，一个性能良好的页面可以给用户带来非常好的用户体验。那么，怎么能知道自己写的页面性能是好是坏呢？

`Lighthouse` 是`Chrome`提供给开发者用来测量页面性能的工具。通过`Lighthouse`，我们可以很清楚的看到页面的性能情况。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU11vK0d0FuJnhs4KkcIc5RLSXRXo7eha2cQABSUIgZsmZqJQC2jeibxDg/640?wx_fmt=png)

当前页面的性能总体得分为`96`分，是非常优异的。

这个分数是怎么得出来的？这些指标又跟分数有什么样的关系呢？让我们来一探究竟。

`Lighthouse`性能分数的计算
-------------------

上图中提到了`Lighthouse`是基于`FCP (First Contentful Paint)`、`SI (Speed Index)`、 `LCP (Largest Contentful Paint)`、 `TBT (Total Blocking Time)` 和 `CLS (Cumulative Layout Shift)`这`5`个指标来计算性能得分的。

点击 “查看计算机”，可以看到以下页面：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU1ZYRVzufeGzoY1LHsyXLkiaoSwAgRMuv0val16o7SGK5uh2fpl4YLQUw/640?wx_fmt=png)

页面中包含了性能的指标、数据 (value)、得分(Metric Score) 以及权重(Weighting)，而最终的性能得分就是这些指标分数的加权平均值。即（从上往下开始计算）：`(100*0.1 + 95*0.1 + 84*0.25 + 100 * 0.3 + 100 * 0.25) / (0.1+ 0.1+ 0.25+0.3+0.25)` 约等于 `96`(四舍五入)。

**加权平均值：** 即将各数值乘以相应的权数，然后加总求和得到总体值，再除以总的单位数。点击了解更多

指标的定义
-----

`Web`指标是`Google`开创的一项新计划，旨在为网络质量信号提供统一指导，这些信号对于提供出色的网络用户体验至关重要。

### 指标定义的框架

长久以来，网络性能都是通过`load`事件进行测量的。但是通过这个事件获取到的数据，跟实际的用户体验并不是很相符。

举个例子：服务器可以通过加载一个 “最小” 的页面来进行响应，响应完成之后，再通过异步获取主要的页面信息进行展示。通过`load`事件进行测量，性能上看起来很优秀，但是用户实际上看到页面的时候时间可能变得更长了 (因为多了一次请求)。这明显跟真实的用户体验不匹配。

为了能更准确地测量用户的网页性能体验，`Chrome`团队成员与`W3C Web`性能工作组共同合作，围绕几个关键问题构建出了指标的框架：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU172F4aNVQPJzic4MFTo4fXwkenCTsHJvN2a59hDtN7T7VFiaeib6katDtg/640?wx_fmt=png)可以根据这几个点去对指标进行定义，这些都是跟用户息息相关的。

### 指标类型

用户对性能感知相关的指标可以分为以下几类：

*   **Perceived load speed 感知加载速度：** 页面在屏幕上加载并渲染出所有视觉元素的速度。
    
*   **Load responsiveness 加载响应度：** 为了使组件对用户交互作出快速响应，页面加载和执行任何所需 JavaScript 代码的速度。
    
*   **Runtime responsiveness 运行时响应度：** 页面在加载后，对用户交互的响应速度。
    
*   **Visual stability 视觉稳定性：** 页面上的元素是否会出现让用户感到意外的偏移，并对用户交互造成潜在的干扰？
    
*   **Smoothness 平滑度：** 过渡和动画在页面状态切换的过程中是否具有稳定的帧速率和顺滑的流动性？
    

通过上述的性能指标类型表明，只用一项指标去捕获页面的所有性能特征是远远不够的。

### 核心指标

多年来，`Google` 提供了许多性能测量和性能报告工具，导致一些开发者发现大量的工具和指标令人应接不暇。

开发者想要了解的是他们提供给用户的体验质量是怎样的，并非每个人都需要成为性能专家。我们并不需要去了解所有的指标，只需要专注于一些重点的指标就可以了。

核心`Web`指标的构成会随着时间的推移而发展 。当前针对`2020`年的指标构成侧重于用户体验的三个方面——加载性能、交互性和视觉稳定性——并包括以下指标（及各指标相应的阈值）：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU1FApOicI2LE52m11ZKEN3SP9MVEynSqlKFvxk3KYPObRq6zicDq20iaxqw/640?wx_fmt=png)

这`3`个指标可以作为网站的一组通用指标，但并不是说我们只需要关注以上这几个核心指标就可以了。在某些情况下，我们将引入新指标来查漏补缺，来捕获完整的性能全貌，能够体现出你网页的真实用户体验才是最佳的指标。

其他一些重要的指标：

*   **First contentful paint 首次内容绘制 (FCP)：**测量页面从开始加载到页面内容的任何部分在屏幕上完成渲染的时间。
    
*   **Time to Interactive 可交互时间 (TTI)：**测量页面从开始加载到视觉上完成渲染、初始脚本（如果有的话）完成加载，并能够快速、可靠地响应用户输入所需的时间。
    
*   **Total blocking time 总阻塞时间 (TBT)：**测量 FCP 与 TTI 之间的总时间，这期间，主线程被阻塞的时间过长，无法作出输入响应。
    

指标阈值定义
------

### 标准

在为核心`Web`指标建立阈值时，`Chrome`团队首先确定了每个阈值必须满足的标准。

#### 高质量的用户体验

*   确保满足核心`Web`指标 "良好" 阈值的页面能够提供高质量的用户体验。
    
*   人类感知和`HCI`研究，有时会使用单个固定阈值来进行概括，但底层研究中通常会用范围值来表示，聚合和匿名`Chrome`指标数据也显示出了平滑且连续的分布。所以**指标的阈值会用范围值来表示**。
    

#### 可通过现有网络内容实现

为了确保网站所有者能够成功地优化他们的网站并满足 "良好" 阈值，我们要求这些阈值对于网络上现有的内容是可以实现的。

例如，虽然零毫秒是理想的`LCP`"良好" 阈值，并且可以带来即时加载体验，但由于网络和设备处理延迟，零毫秒的阈值实际上在大多数情况下都无法实现。因此，对于核心`Web`指标来说，零毫秒不是一个合理的`LCP`"良好" 阈值。

**"良好" 阈值**：在评估核心`Web`指标的候选 "良好" 阈值时，我们会根据`Chrome`用户体验报告`(CrUX)`中的数据验证这些阈值是否可以实现。为了确认一个阈值是可以实现的，要求目前至少有`10%`的域满足 "良好" 阈值。

**"欠佳" 阈值：** 通过确定当前只有少数域未能达到的性能水平来建立 "欠佳" 阈值。除非有 "欠佳" 阈值定义的相关研究，否则在默认情况下，性能表现最差的 `10-30%`的域将被归类为 "欠佳"。

#### 总结

如果针对某一指标有相关的用户体验研究，并且对文献中的数值范围有合理共识，那么我们会用这个范围作为输入来指导我们的阈值选取过程

在没有相关的用户体验研究的情况下，会对满足不同指标候选阈值的真实世界页面进行评估，从而确定一个能带来良好用户体验的阈值。

在评估候选阈值时，发现这些标准有时会相互冲突。而用户行为指标又显示了行为的逐渐变化，所以通常没有唯一 "正确" 的指标阈值，有时可能需要从多个合理的候选阈值中进行选择。

### 示例—— LCP (Largest Contentful Paint) 阈值标准定制

一、体验质量

米勒和卡德的研究将用户在失去注意力之前的等待时间描述为一个从大约`0.3`秒到`3` 秒的范围，也就表明我们的`LCP`"良好" 阈值应该在这个范围内。此外，考虑到目前的首次内容绘制 "良好" 阈值为`1`秒，并且最大内容绘制通常发生在首次内容绘制之后，可以进一步将`LCP`候选阈值的范围限制在`1`秒到`3`秒之间。

二、可实现性

利用 CrUX(Chrome User Experience Report) 的数据，我们可以确定网络上满足`LCP`候选 "良好" 阈值的域所占的百分比。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU13Kib71yU3kpJBWkxKHBVtaNojkreoeUjhJTQgQN7xBnw0GJn6El81aQ/640?wx_fmt=png)

只有不到`10%`的域满足`1`秒阈值，但`1.5`秒到`3`秒之间的其他所有阈值也都满足我们的要求，即至少有`10%`的域满足 "良好" 阈值，因此这些阈值仍然是有效的候选值。

为了确保所选取的阈值对于优化良好的网站始终都可实现，`Chrome`团队分析了全网表现最出色的网站的`LCP`性能，从而确定哪些阈值对于这些网站是始终都可实现的。具体来说，我们的目标是确定一个对于表现最出色的网站来说，始终可以在第`75`个百分位数实现的阈值。最终发现`1.5`秒和`2`秒的阈值并不是始终都可以实现的，而`2.5`秒的阈值是始终可以实现的。

为了确定`LCP`的 "欠佳" 阈值，我们利用`CrUX`数据来确定大多数域能够满足的阈值：![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU1hbYfMhhWErISjnuToEicn28Py2OL4nfvMQ7yFJooKibzWEYEr6vQxF2w/640?wx_fmt=png)

在阈值为`4`秒的情况下，大约`26%`的手机端域和`19%`的桌面端域将被归类为欠佳。这些百分比落在`10-30%`的目标范围内，因此，`4`秒是可接受的 "欠佳" 阈值。

因此，得出结论，对于最大内容绘制来说，`2.5`秒是一个合理的 "良好" 阈值，`4`秒是一个合理的 "欠佳" 阈值。

指标分数
----

一旦`Lighthouse`收集了性能指标（大多数以毫秒为单位报告），它就会通过查看指标值在其`Lighthouse`评分分布上的位置，将每个原始指标值转换为`0`到`100`之间的指标分数。评分分布是从`HTTP Archive`上真实网站性能数据的性能指标得出的对数正态分布。

例如，最大内容绘制`(LCP)`衡量用户何时感知到页面的最大内容可见。`LCP`的指标值表示用户启动页面加载和页面呈现其主要内容之间的持续时间。根据真实网站数据，表现最好的网站在大约`1,220`毫秒内渲染`LCP`，因此指标值映射为`99`分。

`HTTPArchive` 数据的第`25`个百分位数变为`50`分（中值控制点），第`8` 个百分位数变为`90`分（良好 / 绿色控制点）。

指标的权重
-----

性能分数是由指标的加权平均计算出来的，一般来说，权重越高的指标，对性能的得分影响就越大。

为了使用户感知的性能处于一个相对平衡的状态，权重会随着时间而改变。因为`Lighthouse`团队会定期的进行调研，根据用户的反馈来找出对用户感知的性能影响最大的因素，从而修改指标和权重。

下图为 `Lighthouse 10` 和 `Lighthouse 8`的指标及权重变化对比：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBQwPic2CCZqjf41pznMOoU1FE6VQlpYMIiakcsuyiaEJVpbZ1EI2XWDtM8hXpDeIhVSSOl5ZTt2N0xA/640?wx_fmt=png)

如果想要了解更多可以查看：web 性能指标更新记录

结束语
---

我们通过上述了解了`Lighthouse`性能得分计算背后的逻辑，没有去了解之前还不知道`Chrome`团队为了些事情做了大量的工作。通过对用户行为和感知的大量研究、实际的数据及用户反馈来定制和调整标准，有理有据，也更能反馈出实际的情况。只能说是真`Niubility`。

  

参考资料

Lighthouse performance scoring（https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/）

以用户为中心的性能指标（https://web.dev/user-centric-performance-metrics/#how-metrics-are-measured）

Web 指标（https://web.dev/vitals/#core-web-vitals）

定义核心 Web 指标阈值（https://web.dev/defining-core-web-vitals-thresholds/）

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)