> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GpgSddxCQxgibQV0IQCa4Q)

写过原生 **Canvas** 的朋友都懂：

*   **API 低级到怀疑人生**——画个带圆角的矩形就要 `20` 行起步，`缩放`、`拖拽`、`层级管理`全靠自己实现。
    
*   **节点一多直接 PPT**——超过 `5000` 个元素，页面卡成幻灯片。
    

于是，我们一边掉头发，一边默念：**“有没有一款库，写得少、跑得快、文档还是中文？”**

什么是 LeaferJS
------------

**LeaferJS** 是一款**高性能、模块化、开源的 Canvas 2D 渲染引擎**，专注于提供**高性能、可交互、可缩放矢量图形**的绘图能力。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTibghyzicKLh2qDdc5Pp6LVeH9bBIo2mndqg8xXwcqJrHhya5U5f8b2qQ/640?wx_fmt=png&from=appmsg#imgIndex=0)

它采用**场景图（Scene Graph）架构**，支持**响应式布局、事件系统、动画、滤镜、遮罩、路径、图像、文本、滚动视图、缩放、拖拽、节点嵌套、分组**等丰富功能。

LeaferJS 的核心优势
--------------

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmT4s5y2R5vONPHmib2XfsRXM1TVDc691mHOn1K2RJKkoOAslEg4SuCudA/640?wx_fmt=gif&from=appmsg#imgIndex=1)![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTEJqNiaNUYAhVh3lN1kmib9gTVtw06X8U4YOhV7NcwokUJEWicqhKGv5jw/640?wx_fmt=png&from=appmsg#imgIndex=2)

### 高效绘图

*   **生成图片、短视频、印刷品**：支持导出 `PNG`、`JPEG`、`PDF`、`SVG` 等多种格式，满足印刷级品质需求。
    
*   **Flex 自动布局、中心绘制**：内置 `Flex` 布局，支持中心绘制，后端可批量生成图片。
    
*   **渐变、内外阴影、裁剪、遮罩、擦除**：支持线性渐变、径向渐变、内外阴影、裁剪、遮罩、擦除等高级绘图功能。
    

### UI 交互

*   **开发小游戏、互动应用、组态软件**：支持跨平台交互事件、手势，`CSS` 交互状态、光标。
    
*   **动画、状态、过渡、精灵**：支持帧动画、状态过渡、精灵图、箭头、连线等交互元素。
    

### 图形编辑

*   **开发裁剪、图片、图形编辑器**：提供丰富的图形编辑功能，高可定制。
    
*   **标尺、视窗控制、滚动条**：支持标尺、视窗控制、滚动条等编辑器必备功能。
    

### 性能巨兽

**LeaferJS** 最最核心的一点就是性能至上，和目前市面上比较流行的 **Canvas** 库对比：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTibtjlx1K1Kxb98AnnZYvcdc3gOcZhZDJQKMN7VHUEibbkjygpGePZPgw/640?wx_fmt=png&from=appmsg#imgIndex=3)![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTRTmz7wblBO0YGiaTAWOKC3dap6pbibxU5mNt8QrHoFuW39ib9WQ9pgo0w/640?wx_fmt=png&from=appmsg#imgIndex=4)

如何快速上手
------

```
# 1. 创建项目npm create leafer@latest my-canvascd my-canvasnpm inpm run dev
```

```
// 2. 写代码（index.ts）import { Leafer, Rect } from'leafer-ui'const leafer = new Leafer({ view: window })const rect = new Rect({    x: 100,    y: 100,    width: 200,    height: 200,    fill: '#32cd79',    cornerRadius: [50, 80, 0, 80],    draggable: true})leafer.add(rect)
```

浏览器访问 `http://localhost:5173`——**圆角矩形已可拖拽**！

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTrwVayseKrHWE1aXLyqQK1SNKpt9clqx8c5Ps7Gq0ibicZVb4KxozibZeA/640?wx_fmt=gif&from=appmsg#imgIndex=5)

想加 1 万个？直接 `for` 循环，**依旧丝滑**。

使用场景
----

*   **在线设计工具**——海报、名片、电商 banner，**导出 4K PDF 秒级完成**。
    
*   **数据可视化**——物联网组态、拓扑图、百万点折线图，**放大 20 倍依旧清晰**。
    
*   **在线白板**——教学、会议、脑图，**无限画布 + 实时协作**。
    
*   **无代码搭建**——拖拽生成页面，**JSON 一键转 Canvas 应用**。
    
*   **小游戏 / 动画**——跑酷、拼图、营销活动，**帧率稳 60，包体小一半**。
    

优秀案例展示
------

**基于 Leafer + vue3 实现画板**。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTQ5zicG2HMP2Vf8zqNRd7rDGyRusGjbYsLw1RGJYBjmalnXT9kyOHWjg/640?wx_fmt=png&from=appmsg#imgIndex=6)

*   **Github 地址**：`https://github.com/WHSnhcZDYRZC/drawingBoard`
    

**fly-cut 在线视频剪辑工具**。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmT3X9PWvalDzlZBPcODf7eMKiaGchlh2lwbQwXWkkibanYriccnt0kNeqfQ/640?wx_fmt=png&from=appmsg#imgIndex=7)

*   **Github 地址**：`https://github.com/x007xyz/flycut`
    

**基于 LeaferJS 的贪吃蛇小游戏**。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmT2AHiam1tzCmkRs2oI37auOFvN9wlcib5xedsXmy4PtmVPAetNFL16tIg/640?wx_fmt=png&from=appmsg#imgIndex=8)

*   **Github 地址**：`https://github.com/yh4922/leafer-greedy-snake`
    

**一款美观且功能强大的在线设计工具，具备海报设计和图片编辑功能，基于 leafer.js 的开源版**。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTcibp9bUwRnDnluThkUsIpMxSOU4td3AonltFy6qzvibB2c4g69iaOO4aw/640?wx_fmt=png&from=appmsg#imgIndex=9)

*   **Github 地址**：`https://github.com/more-strive/tuhigh`
    

**更多优秀案例，可以移步官网**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrHUYbtTgUlOk80wHDZmNmTIykZG3bUiaCdIVYxNl3brpwfBKj2O42eBmKpZX9hVeObrPClicEFUp5g/640?wx_fmt=png&from=appmsg#imgIndex=10)

*   **官网地址**：`https://www.leaferjs.com/`
    

让 “国产” 成为“首选”
-------------

**LeaferJS** 不是又一个 “国产替代”，而是**直接把 Canvas 的性能与体验拉到 Next Level**。  
它让开发者第一次敢在提案里写：**“前端百万节点实时交互，没问题。”**  
如果你受够了原生 Canvas 的笨拙，也踩腻了国外库的深坑，**不妨试试 LeaferJS**  

*   **LeaferJS 官网地址**：`https://www.leaferjs.com/`