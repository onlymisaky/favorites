> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/usRryobwELhiHgE_q5kZ4w)

> 某一天小林去面试，面试官说问你一道经典面试题吧，从 “输入一个 URL 到页面展示中间发生了什么？”，小林一听激动了，心里暗自高兴说这道题我背过呀，然后哗啦哗啦开启了背书模式。背完之后面试官不是很满意，思路并不是很清晰呀！！！（纯属个人杜撰的小故事，切勿当真。）

> 下面就让我们来唠一唠这个小问题，有不准确的地方还望各位大佬指正。对于这个问题将从浏览器包含的进程着手，然后用用一张图来展示整体流程，最后分别从导航阶段和渲染阶段两个方面详细阐述从输入一个 URL 到页面展示中间发生的过程。

一、浏览器进程
-------

> 我们应该意识到目前浏览器处在多进程时代，包含浏览器进程、渲染进程、GPU 进程、网络进程、插件进程

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95NvN2IyfQG6BqgEfJUXX1yvvxX1KYETFD5APwicRlp9q9moUKHPt7GYQ/640?wx_fmt=jpeg)

二、整体流程
------

> 用一张图来表示整个流程，整个流程包含导航阶段和渲染阶段两大部分，其中每个具体细节所需要的进程如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95RxmKU6Kx0MX8u4Qkq34JibF0Or8hogjkAlvm3gOdgsULUvo3IJtU1Ug/640?wx_fmt=jpeg)

三、导航阶段
------

> 导航阶段主要包含**用户输入、URL 请求、准备渲染进程、提交文档**_四个部分_

### 3.1 用户输入

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95SaVBKdQXsFYCLQEkADEHaCibicCt3loqxHlScNZEV9fu2EUCzSrsOtpQ/640?wx_fmt=jpeg)

### 3.2 URL 请求过程

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95SjshGPicVpMvVUwBfPnYcPhUCxA7nyaE4FyPTyloBxm5GNS5Np0uaCQ/640?wx_fmt=jpeg)

### 3.3 准备渲染进程

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95NWaTDvmt5VCfX15vT7fgLwhsKN8oTF72MMOkDV6MNnwlW2s9Kyo2oQ/640?wx_fmt=jpeg)

### 3.4 提交文档

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95xeE45UlxuxyxjC0CxLFq3ibGSDyVEyaus0XI12yTNkVWqicBcX4qkCCg/640?wx_fmt=jpeg)

四、渲染阶段
------

> 当文档数据传输完成后将进入渲染阶段，渲染阶段主要包含构建 DOM 树、样式计算、布局阶段、分层、图层绘制、分块、栅格化操作、合成和显示。其整个渲染阶段流程如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_png/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95MibHOytB8eynE2t4I996GnbwnIibyMC3YACuo5qPeS3O9AbWCDbRpgRw/640?wx_fmt=png)

### 4.1 构建 DOM 树

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95YoQxaJrkg953EgE2d7UPBfaHbmrRqwFZkibZKs4tDxT6cibLegk4DQsA/640?wx_fmt=jpeg)

### 4.2 样式计算

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z952ZLyBcgoobPFSOfGU7JmaqRSV0zbjR42ctGf0EAuLyldyTX7unVnMQ/640?wx_fmt=jpeg)

### 4.3 布局阶段

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z951qC8J7bKLhDTEHu13rKbWppMJVYECI5rNznyyQmBgm5biaqWmicibssLA/640?wx_fmt=jpeg)

### 4.4 分层

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95viaFkI0VTicxabahsqRwp1mkxdXub2cgbpFkW59E94VV2OTpmNpaqmag/640?wx_fmt=jpeg)

### 4.5 图层绘制

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95Bm1nBE4URDZ6jFTJTD4AQqSsSIH1vGxIB3Hdib7kwR4LxsSy99RFibSg/640?wx_fmt=jpeg)

### 4.6 分块

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95Ih45MOc80DB7EtdNFjaogm4U7k0hhxBInkakiaasiawibpmdqsXibrVHkw/640?wx_fmt=jpeg)

### 4.7 栅格化操作

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z9578c8jnx3DshFibRW2LM5skWAOTb1PKQqEBhqXfic3zcLYVd3Ma4JicwAA/640?wx_fmt=jpeg)

### 4.8 合成和显示

![](https://mmbiz.qpic.cn/mmbiz_jpg/q4qrl2ddrUtx5aicWyLlzltCcyy5d7z95YhAA45IYuibprbXKOfg6ESAVK65HXYGqN8vII7z4DlkicibcKzI57Ezhg/640?wx_fmt=jpeg)参考内容 浏览器工作原理与实践_李兵

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0N1EHQBKUyQ1fxfKoHxvOj1aicVtvNnp98EXusqdIFclX6O2rM53p0d3RDIOcz9KIhhibNvnVw2LTyw/640?wx_fmt=gif)  

---------------------------------------------------------------------------------------------------------------------------------------------------

```
分享前端好文，点亮 在看 
```