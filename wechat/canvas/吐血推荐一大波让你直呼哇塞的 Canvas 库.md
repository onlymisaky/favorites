> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aIR_qcncKoMkWvkTgPgGtA)

大厂技术  高级前端  Node 进阶  

======================

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

`Canvas`技术的诞生可谓是让绘图技术如虎添翼，本文将推荐一系列`Canvas图形绘制、流程图、组织图、甘特图、全景图、3D库、VR/AR、图像编辑`等方面的库，希望助你在 Canvas 绘图时寻得一把趁手的利器。  

同时，愣锤也将`Canvas`的相关资源进行的收录整理分类，更多的资源请关注 Github 项目地址 awesome-canvas。目前该库持续维护中，已收录大约`200+`的`Canvas库`，以及`资源网址、插件、书籍、博客`等资源。

图形处理库
-----

图形绘制是 Canvas 中最基本的内容，但是 Canvas 本身提供的 api 比较基础，开发起来低效。而且也缺少完整的事件系统、区域监测、缓存等等。下面让我们来看几款高效的图形处理库吧。

### Konva

简介：`Konva`是一个 HTML5 Canvas JavaScript 框架, 通过扩展 Canvas 的 2D Context 让桌面端和移动端 Canvas 支持交互性，使其支持高性能动画、过渡、节点嵌套、分层、过滤、缓存、事件处理等等。Konva 传送门

除上述之外，文档相对友好，但也仅仅是相对于同类库的文档友好那么一滴滴，社区有维护一个中文文档。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64YMEE3MBC3Fs9iaz87j1cvWnYGgGAMGUueExkgicpVqwWrGeRmvyhYYyg/640?wx_fmt=other)konva3.gif![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64xpvoUJC1fLhpqpYnvJibvXQUFAojRRaFayARyVS9dUicUevKBRf3mZGA/640?wx_fmt=other)konva2.gif

### fabric.js

简介：**「Fabric.js」**是一个可以轻松处理 HTML5 Canvas 元素的框架，使得 Canvas 元素支持**「交互式对象模型」**，同时也是一个**「SVG-to-Canvas」**和**「Canvas-to-SVG」**的解析器 fabric.js 传送门

fabricjs 是和 konva 同类型但是比 konva 更老牌的一个的 Canvas 库，目前 github 上 Star 数![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64gtNXgib0PoaeVO8PmC1nsAlYmHoWFFyITRyFiamFY505hjicEIV3ib5rBw/640?wx_fmt=other)

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64r5Dxxgkpj4uRnHByLS1zRlC575H6EJ13hYqg4frQ7qDml2J8xN3A4g/640?wx_fmt=other)fabricjs2.gif

更多示例如下图所示：

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64TEm8HtCSOYD43ZObiagqJaOvb2mTsV6zIE3rKpmp8el3L51HoKibE63Q/640?wx_fmt=other)image.png

**「更多关于 Canvas 图形处理的资源，请访问 Github 项目地址 awesome-canvas。」**

图像编辑
----

市面上图像编辑的软件有很多，像大家所熟知的`PS、sketch、axure、激萌、剪映`等等。那么如果我们想开发类似的软件，有没有可以使用的库或者参考的开源软件呢？

### miniPaint

简介：miniPaint [在线演示] - 在线版的 PS。PS 这款软件大家都不陌生，web 版本的如何呢？请看下图：

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt643pEBNJ438HX6QfhROcAVbKWxpbhevHSO5geXianGUh4QNkIMc0vecZw/640?wx_fmt=other)mini-paint.gif

### DarkroomJS

简介：DarkroomJS [在线演示] - 基于 Fabricjs 的浏览器端可扩展的图像编辑工具

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64HHFNzdXcyRNc86lSXMuMYJeqyGr3J9ydsb8ecsGtN4tHYaEJGUs4Qg/640?wx_fmt=png)

pintura-image.gif

### fabric-brush

简介：fabric-brush [在线演示] - 基于 Fabric.js 的 Canvas 笔刷工具

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64dansxal8u20mVRKUoz6W3DbCXr08kEMI5PNMcgfAKOThIe8zSYmz7w/640?wx_fmt=other)brush.gif

### fabricjs-image-editor-origin

简介：fabricjs-image-editor-origin [在线演示] - Fabricjs 图像编辑器

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64aukZANiaNScfoicqH8x3ibGGGia7RbpnpDhIbY3sThYPpxQFEohnEKUyCg/640?wx_fmt=other)fabricjs-demo.gif

### react-sketch

简介：react-sketch [在线演示] - 基于 React、Fabricjs 的素描应用

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64zypMrpswFxCvj63lpWicAsKszZCgI1ibBNhicbxqoURBaqJLNp05uDkaQ/640?wx_fmt=other)sketch.gif

### glitch-canvas

简介：glitch-canvas [在线演示] - 给画布元素添加故障效果

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt645t2tuP5hLxaKVGLpibz6dlM3HDdNz5MLZK8Ja4tvBUlOAk8iaQ5DUicWQ/640?wx_fmt=other)jpg-glitch.gif

### animockup

简介：animockup [在线演示] - 在浏览器中创建动画模型，并导出为视频或动画 GIF

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt640ZE0X21F211nzLZVKx5WxOw5uuI7RvLAWXoKpvmibFkSICiccqn4qXkA/640?wx_fmt=png)

animo.gif  

**「更多关于 Canvas 图像编辑 / 画板的资源，请访问 Github 项目地址 awesome-canvas。」**

物理引擎
----

物理引擎使用质量、速度、摩擦力和空气阻力等变量，模拟了一个近似真实的物理系统，为刚性物体赋予真实的物理效果，比如重力、旋转和碰撞等效果，让物体的行为表现的更加趋向真实。例如，守望先锋的英雄在跳起时，系统所设置的重力参数就决定了他能跳多高，下落时的速度有多快，子弹的飞行轨迹等等。

### matter.js

简介：**「matter.js」**是一个用于 Web 的 JavaScript 2D 物理引擎库 matter.js 传送门

matter.js 相较于老牌的 Box2D 引擎库更为轻量级（压缩版仅有 87 KB），并且在性能和功能方面也不逊色。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64ulQL0nrQMIHPwUc6IsxzQWibwiabJdYe5QFMwQuFGGuPvanyWOrib8hVw/640?wx_fmt=other)matter.gif![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64EmicWSvbeVpZARDwnhQuO8N7G7CT4FGYWCph0BmibCpoovqJ7RqvYD0Q/640?wx_fmt=other)matter3.gif

**「更多关于 Canvas 物理引擎的资源，请访问 Github 项目地址 awesome-canvas。」**

流程图 / 组织图 / 图编辑等
----------------

工业软件开发，一直是软件领域复杂而又重要的一环。其对技术人的要求要是更高的，下面看看有哪些可以辅助我们快速开发的库或者参考的场景吧。

### gojs

简介：**「gojs」**是一款可以非常方便的开发交互式流程图、组织结构图、设计工具、规划工具、可视化语言的 JavaScript 图表库。gojs.js 传送门

*   GoJS 用自定义模板和布局组件简化了节点、链接和分组。
    
*   给用户交互提供了许多先进的功能，如拖拽、复制、粘贴、文本编辑、工具提示、上下文菜单、自动布局、模板、数据绑定和模型、事务状态和撤销管理、调色板、概述、事件处理程序、命令和自定义操作的扩展工具系统。
    

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64z9zicM5KRa4CBOIFz4CpvuE6lShjdiaAP9VH9EQwWtT2kXcNwRCLLn8Q/640?wx_fmt=other)gojs.gif

文档中提供了大量的 demo 可供参考，基本对于常见的图编辑程序做到了全覆盖。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64PcPMY1XNiajegkiahuuzkuCPCmE2Cef8bntwpG5UMtEbHNtINjGZmcrw/640?wx_fmt=other)image.png

### butterfly

简介：butterfly [在线演示] 一个基于 JS 的数据驱动的节点式编排组件库，同时适用于 React/Vue2 组件。

*   丰富的 DEMO，开箱即用
    
*   全方位管理画布，开发者只需要更专注定制化的需求
    
*   利用 DOM/REACT/VUE 来定制元素；灵活性，可塑性，拓展性优秀
    
*   提供了中文文档，这点对英文不好的小伙伴很 Nice
    

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64KXxZFxIsxO4lHf4y8IlmibMpK7jXhUkvz9Ij6jHqUXFdzxJiak0giaticg/640?wx_fmt=other)butterfly2.gif

### wireflow

简介：wireflow [在线演示] 用户流程图实时协作工具。

*   Wireflow 有超过 100 种自定义构建图形 / 卡可供使用，涵盖了大多数 Web 元素、交互和使用案例。
    
*   Wireflow 考虑到了协作。您可以邀请您的同事和他们一起实时设计下一个项目的用户流程。
    
*   它具有内置的实时聊天功能，让您能够与您的队友进行交流，并且在您实时协作时仍然在同一个应用程序中。
    

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64yJlJzG2NWgEc5ZgCJ87HjBwSJtibBOCDNX9xjVr7SPeXMFUc0nibW0sw/640?wx_fmt=other)wireflow.gif

### flowy

简介：Flowy [在线演示] - 用于创建流程图的最小 javascript 库。使创建具有流程图功能的 WebApp 成为一项非常简单的任务。通可以在几分钟内构建自动化软件、思维导图工具或简单的编程平台。

*   响应式拖放、自动捕捉、自动滚动
    
*   块重排、删除块、自动块居中
    
*   条件捕捉、条件块移除、无依赖项
    

### Workflow Designer

简介：Workflow Designer [在线示例] - 基于 G6 和 React 的可视化流程编辑器。

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64C0lXv6IibJEgAT9vgibRd6e50j1Ccuo9kxXPQoZ5T8VbjIuX7K9z9icZg/640?wx_fmt=png)

wfd.gif

### web-pdm

简介：web-pdm [在线示例] - 用 G6 做的 ER 图工具，最终目标是想做成在线版的 powerdesigner.

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64hF3iaqic7DH2BvuRjo5zenWdKvNsT1ibwbHzxG6njBEWZ78jcd0L4bEsA/640?wx_fmt=other)xyz.gif

### X-Flowchart-Vue

简介：X-Flowchart-Vue [在线演示] - 基于 G6 和 Vue 的可视化图形编辑器。

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64kZbhWeibkkRdRLPP3w5CJaAqzww1rMmEkrzsKbqIicScEaGHPcuLoHUQ/640?wx_fmt=png)image-20211209101639120

### OrgChart

简介：OrgChart [在线演示] - 简单直接的组织图插件

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64cFCOdXqJmPIIaZ7bZZIIZ4qEze4g27k694cHpMR5bYmWhtaJJtPEHw/640?wx_fmt=png)image-20211209101609330

### welabx-g6

简介：welabx-g6 [在线示例] - 基于 G6 和 Vue 的流程图编辑器。

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64dx5sds5x9aq3yPrJMSRGRPzOxozRALgxytjtickK0FL68zXCeO8ibsYA/640?wx_fmt=png)image-20211209101556277

**「更多关于 Canvas 图编辑的资源，请访问 Github 项目地址 awesome-canvas。」**

全景图 / AR/VR
-----------

5g 的普及、虚拟现实 / 增强现实落地、元宇宙的火热...... 似乎让 Canvas 再度推上了技术的顶峰。下面让我来看看开发这些场景常见的 Canvas 库吧。

### Pannellum

简介：Pannellum [在线演示] - 轻量、免费、开源的 web 全景查看器。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64DWKu8fvC9P0QJ4CoxibGhZgrNZkb9oB2a79COuh3uGGz9kCNpkRV1rw/640?wx_fmt=other)pannelum.gif

### Panolens.js

简介：Panolens.js [在线演示] - Panolens.js 基于 Three.JS，主要研究领域是全景、虚拟现实和潜在的增强现实。

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64eWh1FbBQeWHdibQCQJprRELa2aEG1B5JfdIOj2TxctfiaOKQn62icJicpQ/640?wx_fmt=png)

panolens.gif

### JS-Cloudimage-360-View

简介：JS-Cloudimage-360-View [在线演示] 一个简单的、交互式的资源，可以用来提供您的产品的虚拟游览。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64TmmEL1ytpB0ZxPNPGAJB9Vzl1uC4TvicQW7jwnSzyUVWkwicMoicVeATw/640?wx_fmt=other)cloud-image.gif

### A-Frame

简介：A-Frame [在线演示] A-Frame 除了帮助您构建 360 度媒体播放器外，它还提供了许多附加功能。其他功能可帮助您增强网站的虚拟现实体验。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64Bia2P6wefibOuMFvfvOeaQ014AXHOicAazJaTKRSibZPicl6lFQxfy2mtTg/640?wx_fmt=other)aframe.gif

**「更多关于 Canvas 全景图 / AR/VR 的资源，请访问 Github 项目地址 awesome-canvas。」**

3D 库
----

### three.js

简介：three.js [在线演示] - 创建易于使用、轻量级、跨浏览器的通用 3d js 库。three.js 就不多介绍了，大家想必都很熟悉。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64f7c8TfV0AwDrj5fpGJu74eIk3vUibe8HF9tQ3gSV1nXbzrGhoII5ptg/640?wx_fmt=other)three.gif![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt6466hQPSCwS4hhlz9iaq93dXVp2iadHslDphzBZibiap3ichRsx6WiaLIBewlA/640?wx_fmt=other)three2.gif

### zdog

简介：zdog [在线演示] - 基于 canvas 和 SVG 设计师友好的伪 3D 引擎

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt647StzYL1ziaJOibTbzbpAwJc37lkDrRbxUEvbmnCWtqEzI7SFSTLGYwLQ/640?wx_fmt=other)zdog.gif

### seen.js

简介：seen [在线演示] - 使用 SVG 或 Canvas 渲染 3D 场景。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64lIX2g4uTEIBhJfZPQxg0ztmjVibPrP8RBiaw0FDxLgvAmeCjic4mJPSqA/640?wx_fmt=other)seen.gif

### Oimo.js

简介：Oimo.js [在线演示] - 轻量级的 JS 3D 物理引擎。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64fTOABLwDlajIiaa42ibljd2ibibduwRKLYbJDJe7savMnSkAQAT2lYibc4A/640?wx_fmt=other)oimo.gif

### phoria.js

简介：phoria.js [在线演示] - 用于在 HTML5 画布 2D 渲染器上进行简单 3D 图形和可视化的 JavaScript 库。它不使用 WebGL。适用于所有 HTML5 浏览器，包括桌面、iOS 和 Android。

![](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kjOMqlwVP1UGkVf0ia9JVt64VV4rQr9iafCXPrAicdRCnfZ6rHexWf3dN75YQ2QXCtgyzfQGtegfstiag/640?wx_fmt=other)phoria.gif

**「更多关于 Canvas 3D 的资源，请访问 Github 项目地址 awesome-canvas。」**

Node 社群  

我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js 小伙伴，如果你对 Node.js 学习感兴趣的话（后续有计划也可以），我们可以一起进行 Node.js 相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvFQgO67XibvUG5S2UMXwCghOuJvE8BFRzUXnCAfWXkU1qHld6Ly9xiarib3siaWicJWJ0U3lI8kSgD38w/640?wx_fmt=jpeg)

   **“分享、点赞、在看” 支持一波👍**