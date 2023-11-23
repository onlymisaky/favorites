> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s?__biz=Mzg2MDU4MzU3Nw==&mid=2247494990&idx=1&sn=e284f4782a2e38aff64105becb315223&chksm=ce268eb8f95107ae0ebf52132dad5b5af679f466a88a224c4d01e1f19695e0ba3a4070bfacfb&scene=21#wechat_redirect)

图片资源，在我们的业务中可谓是占据了非常大头的一环，尤其是其对带宽的消耗是十分巨大的。

对图片的性能优化及体验优化在今天就显得尤为重要。本文，就将从各个方面阐述，在各种新特性满头飞的今天，我们可以如何尽可能的对我们的图片资源，进行性能优化及体验优化。

图片类型的选取及 Picture 标签的使用
----------------------

首先，从图片的类型上而言，除了常见的 PNG-8/PNG-24，JPEG，GIF 之外，我们更多的关注另外几个较新的图片格式：

*   WebP
    
*   JPEG XL
    
*   AVIF
    

首先，通过一张表格，快速过一下这几个图片，我们将从图片类型、透明通道、动画、编解码性能、压缩算法、颜色支持、内存占用、兼容性方面，对比它们：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">图片类型</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Alpha 通道</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">动画</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">编解码性能</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">压缩算法</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">颜色支持</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">内存占用</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">兼容性</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">GIF</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">较高</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">无损压缩</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">索引色 (256)</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本一致</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">ALL</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">PNG-8/PNG-24</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">较高</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">无损压缩</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">索引色 (256)\ 直接色</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本一致</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">ALL</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">JPEG</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">较高</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">有损压缩</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">直接色</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本一致</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">ALL</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">WebP</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">编解码性能差（低配设备更为显著）</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">有损压缩 \ 无损压缩</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">直接色</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本一致</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">高版本 Chrome\Opera\Android</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">JPEG XL</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">编解码性能优于 WebP</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">有损压缩 \ 无损压缩</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">直接色</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本一致</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">部分高版本 Chrome\Opera\Firefox\Edge</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">AVIF</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">编解码性能优于 WebP，低于 JPEG XL</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">有损压缩 \ 无损压缩</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">直接色</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">基本一致</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">高版本 Chrome\Opera\Android\Edge</td></tr></tbody></table>

首先，了解了解上述的一些参数含义：

*   Alpha 通道：图片是否支持透明的特性
    

> 当然，需要指出的是，Alpha 没有透明度的意思，不代表透明度。opacity 和 transparency 才和透明度有关，前者是不透明度，后者是透明度。比如 css 中的「opacity: 0.5」就是设定元素有 50% 的不透明度。后来 Alvy Ray Smith 提出每个像素再增加一个 Alpha 通道，取值为 0 到 1，用来储存这个像素是否对图片有「贡献」，0 代表透明、1 代表不透明。也就是说，「Alpha 通道」储存一个值，其外在表现是「透明度」，Alpha 和透明度没啥关系

*   动画：很好理解，图片是否支持多帧率动态图片，类似于 GIF
    
*   编解码性能：图像的解码与编码。这个很关键，很多人对待图片容易忽视图片的编解码性能，解码图像主要从图像文件中读出图像数据，而编码则是将图像数据写入图像文件。解码与编码的过程正好相反。而这两者的性能耗时会影响我们页面的的展示性能。
    
*   压缩算法：该图片格式是否支持压缩，支持的话，图片的压缩又会分为无损压缩与有损压缩
    

> **有损压缩算法**是一种数据压缩方法，经过此方法压缩、解压的数据会与原始数据不同但是非常接近。原理是借由将次要的信息数据舍弃，牺牲一些质量来减少数据量、提高压缩比**无损压缩**指数据经过压缩后，信息不受损失，还能完全恢复到压缩前的原样。无损压缩通常用于严格要求 “经过压缩、解压缩的数据必须与原始数据一致” 的场合。

*   颜色支持：会分为索引色与直接色，在过去，为了节省存储空间，并非所有图片都能支持所有颜色值，因此存在索引色这种优化方式。
    

> **索引颜色**是一种以有限的方式管理数字图像颜色的技术，以节省计算机内存和文件存储，同时加速显示刷新和文件传输。即用一个数字来代表（索引）一种颜色，在存储图片的时候，存储一个数字的组合，同时存储数字到图片颜色的映射。这种方式只能存储有限种颜色。索引色常见有 1 位（即黑白），8 位（即灰阶 / 256 色），16 位（即高彩），24 位（即真彩），30/36/48 位（即全彩）。**直接色**使用四个数字来代表一种颜色，这四个数字分别代表这个颜色中红色、绿色、蓝色以及透明度（即 RGBA）。现在流行的显示设备可以在这四个维度分别支持 256 种变化，所以直接色可以表示 2 的 32 次方种颜色。

*   内存占用：图片对内存资源的占用
    
*   兼容性：影响图片格式能否大规模推广的核心要素之一
    

### WebP vs JPEG XL vs AVIF: JPEG 替代之战

因为传统的 PNG-8/PNG-24，JPEG，GIF 各自或多或少都存在一些问题，近些年来它们的替代方案之争也愈演愈烈，核心领跑者可能是 **WebP**、**JPEG XL**、**AVIF**。

再简单了解了解它们：

#### WebP

WebP 最初由 Google 在 2010 年 9 月发布，其特性总结如下：

1.  可以同时提供无损 / 有损压缩（像 JPEG 一样）和支持透明度（像 PNG 一样）的图片文件格式
    
2.  支持动画效果（像 GIF 一样）
    
3.  WebP 主要优势在于有损编码，其无损编码的性能和压缩比表现一般
    
4.  WebP 的缺点在于其编解码性能不是特别理想
    
5.  在兼容性方面，除了 IE，基本已经得到了全系列浏览器支持
    

对于复杂的图像（比如照片）来说，WebP 无损编码表现并不好，但有损编码表现却非常棒。相近质量的图片解码速度 WebP 相距 JPEG 也已经相差不大了，而文件压缩比却能提升不少。

下图是我之前还在 TX 的时候做的一个测试对比：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuAnuzhncsZE7qghwY8xpAoBCc3xOMO5kwz2QsKyanF9LhDvYnsL8ONSg/640?wx_fmt=png)

加载同样张数的 JPEG 与 WebP 的耗时对比：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuABzg6LibSB0IibCFJ2EO4OdgsAtD5P3EcMRknxS3kE6rAbJvFJ62ONiaIQ/640?wx_fmt=png)

对于 WebP 图片格式，简单做个总结：

1.  目前 WebP 与 JPEG 相比较，据资料考证，编码速度慢 10 倍，解码速度慢 1.5 倍
    
2.  WebP 虽然会增加额外的解码时间，但由于大幅减少了文件体积，缩短了加载的时间，大页面图片量较多的场景下，页面的渲染速度是有较大加快的
    
3.  目前而言，是 WebP、JPEG XL、AVIF 三者中兼容性最好的
    

截止至（2023-02-05）的兼容性图：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuAZvQPmAJ1IjBbBReAvwKX3JR9JVAicIiaNlwn5PpiaY23dKvEW2ib3bEanw/640?wx_fmt=png)

#### JPEG XL

JPEG XL 由联合图像专家组（开发原始 JPEG 标准的同一组织）于 2021 年发布，旨在成为传统 JPEG 的长期替代品。作为一种免版税的开源标准，JPEG XL 的创建者希望其格式的开放性能够吸引网络开发人员采用该标准，该格式的扩展名为 `.jxl`，JXL 核心比特流于 2021 年 1 月冻结，文件格式于 2021 年 4 月定稿。：

> JPEG XL 中的 X 指 2000 年以来的多个 JPEG 标准的名称：JPEG XT[1]、JPEG XR[2]、JPEG XS[3]，而 L 表示'long-term'，表示 “长期”。创建这种格式是为替换旧的 JPEG 文件格式 [4]，并使用足够长的时间。

其主要特点有：

*   与传统图像格式（例如 JPEG、GIF 和 PNG）相比，有着更佳的效率与更丰富的功能
    
*   全面支持广色域和 HDR，支持 Alpha 通道，支持多帧（也就是动画支持）
    
*   有损压缩时：相同的视觉质量，比 JPEG 小约 60％。
    
*   无损压缩时：比 PNG 减小约 35％（对于 HDR，减小 50％）。
    
*   支持无损 JPEG 转码，减小约 20％ 文件大小。
    
*   渐进式解码，专为支持不同显示分辨率的响应式加载
    
*   开源免费：具有使用三条款版 BSD 许可证 [5] 的开源 [6] 参考实现的免版税格式
    

看看同一张图片，相同质量下的大小表现：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuAdIaeADbkkoHy1haLatZUJtyiaogRibOa4kIvrxGreXXbzs0evLH5bdXw/640?wx_fmt=png)

> 数据来源：技术周刊 2021-04-15：2021 最值得期待的新技术 JPEG XL[7]

JPEG XL 是目前而言，最有可能全面替代传统图片格式（Gif、PNG、JPEG）的下一代标准，当然，在今天，需要看看其兼容性：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuA02EibdvLibfdaFI4n2G8bvONtf2r9GN2MKpJzqLibkdTyfyicib6nULnsBw/640?wx_fmt=png)

好吧，目前的兼容有点离谱。Chrome 从 91 版本开始已经实验室性质支持了 `.jxl` 格式的图片，需要通过 `--enable-features=JXL` 配置开启。

#### AVIF

最后，我们再来看看 AVIF 格式图片。

AVIF 是由开放媒体联盟 (AOM) 开发并于 2019 年发布的另一种最新图像格式。该格式基于 AV1 视频编解码器，源自视频帧。其特点如下：

*   同样的，与传统图像格式（例如 JPEG、GIF 和 PNG）相比，有着更佳的效率与更丰富的功能
    
*   支持 Alpha 通道，支持动态图像 [8] 和动画 [9]
    
*   支持有损、无损压缩。AVIF 文件在低保真有损图像压缩方面表现出色（比 JPEG XL 更优）。压缩的 AVIF 图像保留了很高的图片质量，避免了恼人的压缩伪影等问题
    
*   相对而言，AVIF 的解码和编码速度不如 JPEG XL，它不支持渐进式渲染
    
*   最后，再看看兼容性，目前（2023-02-05）它的兼容性介于 WebP 与 JPEG XL 之间
    

看看 CaniUse 的数据：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuAjykUB2icBqURmJmGX4JIT1nHCdINwdYSZM1HdFm7h5deKFNlasketPw/640?wx_fmt=png)

下图是 WebP vs JPEG XL vs AVIF 三者在图片解码上的性能表现：

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNJy97p6ficCL05ad6yd0KOuAnBuDMFuyCfdBgE9TKtjJaQEia8rwa9mMBusib5rMxic8ssszrI2FR5rxQ/640?wx_fmt=png)

> 图片来源于：Encode.su -- JPEG XL vs. AVIF[10]

可以看到，对于解码性能的对比，**JPEG XL** > **AVIF** > **WebP**。

### 图片格式总结

总结一下，WebP、AVIF 和 JPEG XL 都是浏览器不广泛支持的新型图像格式。虽然 WebP、AVIF 已经存在很长时间，但到今天，影响它们大规模使用的依旧是兼容问题。

JPEG XL 作为它们三者中的佼佼者，虽然目前没有得到任何浏览的完全支持。但是其功能特性是三者中最为强大的，将被视为未来的图片标准格式推进。

虽然 JPEG XL 等新型图片格式未得到任何浏览器的完全支持，但是在新版本的 Chrome、Firefox 和 Edge Chromium，可以使用配置标志启用对应图像格式，配合 HTML 的 `Picture` 标签，我们还是可以一定程度上对我们的图片进行格式选择上的优化的。

这，就可以引出我们要说的第二部分 -- HTML Picture 标签的使用。

### Picture 元素的使用

HTML5 规范新增了 Picture Element。那么 `<picture>` 元素的作用是什么呢？

`<picture>` 元素通过包含零或多个 `<source>` 元素和一个 `<img>` 元素来为不同的显示 / 设备场景提供图像版本。浏览器会选择最匹配的子 `<source>` 元素，如果没有匹配的，就选择 `<img>` 元素的 src 属性中的 URL。然后，所选图像呈现在 `<img>` 元素占据的空间中。

什么意思呢？怎么使用 `<picture>` 元素呢？

假设，没有 `<picture>` ，只有 `<img>` 元素，我们想尽可能在支持一些现代图片格式的浏览器上使用类似于上述我们提到的 WebP、AVIF 和 JPEG XL  等图片格式，而不支持的浏览器回退使用常规的 JPEG、PNG 等。没错，**就是一种渐进增强的思想**，该怎么办呢？

只能是 JavaScript 去写对应的逻辑，通过 JS 脚本进行特性查询，动态赋值给 `<img>` 的 src。

我们来看看对应的语法：

```
<picture>  <!-- 可能是一些对兼容性有要求的，但是性能表现更好的现代图片格式-->  <source src="image.avif" type="image/avif">  <source src="image.jxl" type="image/jxl">  <source src="image.webp" type="image/webp">   <!-- 最终的兜底方案-->  <img src="image.jpg" type="image/jpeg"></picture>
```

而有了 `<picture>` 后，浏览器将原生支持上述的一些列操作，简而言之，`<picture>` 元素的作用：

1.  通过 `<source>` 给出一系列对兼容性有所要求的现代图片格式选项
    
2.  通过 `<img>` 给出兜底的高兼容性图片格式选项
    
3.  浏览器通过对给出的图片格式做特性检测，要决定加载哪个 URL，user agent 检查每个 `<source>` 的 srcset、media 和 type 属性，来选择最匹配页面当前布局、显示设备特征等的兼容图像。
    
4.  最终，所选图像呈现在 `<img>` 元素占据的空间中
    

总结
--

总结一下，本文对常见的图片格式以及最新的几种未被大规模兼容的图片格式进行的对比，它们分别是：

*   PNG-8/PNG-24
    
*   JPEG
    
*   GIF
    
*   WebP
    
*   JPEG XL
    
*   AVIF
    

其后，着重介绍了 3 种现代图片格式：WebP、JPEG XL、AVIF。相对于 JPEG 等传统格式，它们在色彩表现、动画支持、是否支持无损有损压缩、压损比率、编解码性能上有着更进一步的提升，正在成为下一阶段 Web 图像的标准。

最后，介绍了 `<picture>` 元素，借助它，我们能更好的实现图片的渐进增强。

当然，本文只是**现代图片性能优化及体验优化指南**的第一篇，后续将给大家带来图片在：

*   如何适配不同的屏幕尺寸及 DPR
    
*   使用 `aspect-ratio` 实现图片资源的比例固定及调整
    
*   `<img>` 图片与背景图片的取舍
    
*   懒加载 / 异步图像解码方案
    
*   可访问性以及图片资源的容错及错误处理
    

等相关知识的介绍，感兴趣的可以提前关注。

最后
--

OK，本文到此结束，希望本文对你有所帮助 :)

如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。

### 参考资料

[1]

JPEG XT: _https://zh.wikipedia.org/wiki/JPEG_XT_

[2]

JPEG XR: _https://zh.wikipedia.org/wiki/JPEG_XR_

[3]

JPEG XS: _https://zh.wikipedia.org/w/index.php?title=JPEG_XS&action=edit&redlink=1_

[4]

旧的 JPEG 文件格式: _https://zh.wikipedia.org/wiki/JPEG_

[5]

BSD 许可证: _https://zh.wikipedia.org/wiki/BSD%E8%AE%B8%E5%8F%AF%E8%AF%81_

[6]

开源: _https://zh.wikipedia.org/wiki/%E5%BC%80%E6%BA%90_

[7]

技术周刊 2021-04-15：2021 最值得期待的新技术 JPEG XL: _https://juejin.cn/post/6952704304557850661_

[8]

动态图像: _https://zh.wikipedia.org/wiki/%E5%8A%A8%E6%80%81%E5%9B%BE%E5%BD%A2_

[9]

动画: _https://zh.wikipedia.org/wiki/%E5%8B%95%E7%95%AB_

[10]

Encode.su -- JPEG XL vs. AVIF: _https://encode.su/threads/3397-JPEG-XL-vs-AVIF/page9_

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 

如果觉得还不错，欢迎点赞、收藏、转发❤❤