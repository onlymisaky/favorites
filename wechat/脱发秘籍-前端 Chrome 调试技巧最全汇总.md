> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aB3w-O9ZPbC8v8kTCKrOeA)

> 作者：安木夕
> 
> 原文：https://juejin.cn/post/7248118049584316472

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksu4ibSQhErNiaYRP70tYlO15CMNJbIfuU9WMyn5lIZlicSZicVTa9updXnQ/640?wx_fmt=jpeg)

注：本文测试、截图均为 Edge 浏览器（内核是 Chromium），浏览器内核可了解《有哪些浏览器 / 内核？[1]》

00、基础操作汇总
---------

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;"><strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">操作类型</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;"><strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">快捷键 / 说明</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">切换浏览器标签</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">🔸&nbsp;<code>Ctrl+1到8</code>切换到对应序号的浏览器标签 🔸&nbsp;<code>Ctrl+PgUp/PgDn</code>标签页左右切换</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">浏览器全屏</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>F11</code>&nbsp;(<code>⌘ + shift + F</code>&nbsp;Mac)</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">打开调试模式</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">🔸&nbsp;<code>F12</code>，<code>Ctrl + Shift + I</code>&nbsp;(Windows) 或<code>&nbsp;Cmd + Opt + I</code>&nbsp;(Mac) 🔸 页面右键菜单 “检查”，浏览器菜单 “开发者工具”</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">切换调试工具位置（下面、右边）</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>ctrl + shift + D</code>&nbsp;(<code>⌘ + shift + D</code>&nbsp;Mac)</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">切换 DevTools 的面板标签</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>ctrl + [</code>&nbsp;和&nbsp;<code>ctrl + ]</code>左右切换调试工具面板</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">内容搜索查找</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>Ctrl+F</code>：元素、控制台、源代码、网络都支持搜索查找</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">使用命令 Command 面板</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>Ctrl] + [Shift] + [P]</code>&nbsp;（Mac：<code>&nbsp;[⌘] + [Shift]+ [P]</code>） 类似 VSCode 的命令面板，有大量的隐藏功能，可以在这里搜索使用</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">复制元素</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">🔸 元素面板：选中元素》<code>Ctrl+C</code>&nbsp;🔸 元素面板：选中元素》右键菜单》复制元素 🔸&nbsp;<code>copy($0)</code>&nbsp;控制台中代码复制当前选中元素</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">控制台：快速访问当前元素'$0'</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>$0</code>代表在元素面板中选中元素，<code>$1</code>是上一个，支持到<code>$4</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">控制台：全局<code>copy</code>方法</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">复制任何对象到剪切板，<code>copy(window.location)</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">控制台：queryObjects(Type)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">查询指定类型（构造器）的对象实例有哪些</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">控制台：保存堆栈信息 (Stack trace)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">报错信息可以右键另存为文件，保存完整堆栈信息</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">控制台：<code>$</code>、<code>$$</code>查询 Dom 元素</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">-&nbsp;<code>$</code>&nbsp;=&nbsp;<code>document.querySelector</code>&nbsp;-&nbsp;<code>$$</code>&nbsp;=&nbsp;<code>document.querySelectorAll</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">Store as global（存储为全局变量）</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">🔸 控制台（右键）：把一个对象设置为全局变量，自动命名为<code>temp*</code>&nbsp;🔸 元素面板（右键）：把一个元素设置全局变量，同上</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">元素：<code>h</code>快速隐藏、显示该元素</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">选中元素，按下<code>h</code>快速隐藏、显示该元素。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">元素：移动元素</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">🔸 鼠标拖动到任意位置 🔸 上下移动，<code>[ctrl] + [⬆]</code>&nbsp;/&nbsp;<code>[ctrl] + [⬇]</code>&nbsp;（<code>[⌘] + [⬆] / [⌘] + [⬇]</code>on Mac）</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><br></td></tr></tbody></table>

**🔸Store as global（存储为全局变量）**：类似 copy 方法，将一个对象保存为全局变量，变量命名依次为`temp1`、`temp2`。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksSibmlHVibXejUW33y0oP2F7crQfqlibRQDpicLnlk8A4qpAKGzicI2RRYSw/640?wx_fmt=jpeg)image.png

**🔸保存堆栈信息 (Stack trace)**：错误堆栈信息另存为文件，保存完整堆栈信息。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksbekcOCKOiaOxKGwqkvByWvEBj8KiaCvHBvFP5S6X8RpibcLSaRMpFllmg/640?wx_fmt=jpeg)image.png

**🔸Command 面板**：同 VSCode 的命令面板，可以找到调试工具的所有的（隐藏）功能。`Ctrl] + [Shift] + [P]`（Mac： `[⌘] + [Shift]+ [P]`）

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkscicG1SicuX6eIcGGzgyNn1Sfv5T2AR0icTyV0Xq2PvBGaA3Kb8nHYmYqA/640?wx_fmt=jpeg)image.png

*   **设置主题**：打开 Command 面板，搜索 “主题”，可以切换多种主题
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksic7E9K46D6vwKRpYuJpTRdfpw8kIBWottfUuYzu9KxB219zzv1iatriaw/640?wx_fmt=jpeg) image.png

*   **分析代码的覆盖率**：打开 Command 面板，如下图搜索 “覆盖”，分析首次页面加载过程中哪些代码执行了，那些没有执行，输出一个报告。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksCyaKCXH4S8hy126Plfl5Yqv7jvIj6iaDibUft5RFibkibI9A7H6UACnuibQ/640?wx_fmt=jpeg)image.png

选择文件可进一步查看代码的使用分析，红色 = 尚未执行，青蓝色 = 至少执行了一次。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkshToCHDwHW0QQOxFJlVxJgXuT9H1hy3unOria7ySokmeIxXhTibFQQTWA/640?wx_fmt=jpeg)image.png

**🔸元素截图**：输出指定元素的截图，包含隐藏滚动的内容，这个功能挺好用的。

*   通过 Command 面板：搜索 “截图”，全屏截图、指定节点截图。
    
*   元素面板中，选中元素》右键菜单》“捕获节点屏幕截图”。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksEFmiaY79icRzZaQ9oUkk26xzAuGP77dy7jhQG9ibxhWe02rzx4snFma2g/640?wx_fmt=jpeg)image.png

01、元素面板（Element）
----------------

可以自由调试 DOM、CSS 样式，使用评率级高：⭐⭐⭐⭐⭐。

*   **DOM 树**：左侧为 DOM 元素树，支持多种操作，如编辑、删除、新增、复制 DOM 元素，更多可查看右键菜单。
    
*   **样式**：选中元素的样式，可编辑、添加 CSS 样式，实时预览。
    
*   **已计算**：选中元素计算的样式值。
    
*   **布局**：grid 布局、flex 布局调试。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksqyQBSaj4Q0tUcx1icNX7U3l2s8nA7J2Hfm8VOibwTIqknE1ibjQ9zYkGw/640?wx_fmt=jpeg)image

### 1.1、CSS 可视化编辑器

可视化的颜色、贝塞尔曲线、阴影编辑器，所见即所得，挺好用！

*   **颜色编辑器**：只要是颜色属性，都可以点击色块按钮可视化编辑颜色，支持拖动设置颜色、取色、设置对比度。
    
*   **Grid、Flex 布局编辑器**：当使用弹性布局 Grid、Flex 时，支持可视化编辑布局对齐方式。
    
*   **阴影编辑器**：阴影`shadow`属性上，会出现编辑器按钮，可视化编辑阴影效果。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkslKuvYPYLcibm4WM5F1qqhAWp4eibGZBE5qtg9ibDY5nHzVpRWZVvmNFVQ/640?wx_fmt=jpeg)image.png

*   **贝塞尔曲线编辑器**：在动画`transition`、`animation`中会用到贝塞尔曲线函数（缓动函数）。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksBrFibHTx9jyY4TicER55TrAZMicnWwV2jrxR0kPLdYDiaeiaJ12QSF5l9Fw/640?wx_fmt=jpeg)image.png

### 1.2、强制激活伪类

强制激活元素的伪类效果。

*   选择 Dom 节点右键 “强制状态”。
    
*   如下图 CSS 样式中 “切换元素状态”。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkszr8ztNnB1acTwmyQCQS7sicQ8cunHNIJkzAibKiahlSC6AyGPrtjaud2w/640?wx_fmt=jpeg)image.png

### 1.3、DOM 断点

选中 DOM 元素，右键设置中断点，可以在元素更改（JS 代码修改 DOM）时触发断点。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkse0muleeTVUvzjwD1US1uibleahjlgYGibmSLDYMHOaBnvzib3AE3uPyog/640?wx_fmt=jpeg)image.png

添加后可以在源代码中查看到已添加的 DOM 断点，或者元素面板中的 “DOM 断点”。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMks0SSdHL2mFsj9dNSUG8LRCqaBPSgTmdmjvF1I8OhqOk9sWkSib6cqYsA/640?wx_fmt=jpeg)image.png

02、控制台面板（Console）
-----------------

主要功能就是调试 JavaScript 代码，是比较常用的调试工具，使用评率很高：⭐⭐⭐⭐⭐。

*   **运行代码**：可执行任意 JS 代码，包括调用页面已有的 JS 对象、函数。
    
*   **console 输出**：代码中的 Console、异常错误都会在这里输出。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksrQibIx8ich0etjaibj5GjmghqoNz71HwaiaGa2epWu8xfV5nffJ58DETwQ/640?wx_fmt=jpeg)image.png

### 2.1、console 函数

用 console 函数输出变量，是比较常用的调试技巧，console 的常用函数：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;">**console**<sup>[2]</sup><strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);"> 函数</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;"><strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">说明</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">log</strong>(str)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">控制台输出一条消息</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">error</strong>(str);</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">打印一条错误信息，类似的还有<code>info</code>、<code>warn</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">table</strong>(data [, columns])</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">将数据以表格的形式显示，很实用，data 为数组或对象，第二个参数（数组）可指定输出的列</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">dir</strong>(object)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">树形方式打印对象，特别是 DOM 对象非常实用</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">assert</strong>(false, 'false')</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">断言输出，为<code>false</code>才会输出</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">trace</strong>()</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">输出当前位置的执行堆栈，用断点会更实用一些。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">time</strong>(label)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">计时器，可用来计算耗时（毫秒），三个函数配合使用：<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">time</strong>(开始计时) &gt;&nbsp;<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">timeLog</strong>(计时) &gt;&nbsp;<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">timeEnd</strong>(结束)</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">console.<strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">clear</strong>()</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">清空控制台，并输出 Console was cleared。</td></tr></tbody></table>

```
console.log('log');console.info('info');console.warn('warn');console.error('error');console.table(["sam", "egan", "kettle"])throw new Error('出错了！！！')
```

控制台输出效果，右侧链接为对应 JS 代码的链接。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksTpRNY9chT8vL8rKTM8y0OPrO7EDZB0rXZGrXP03crTtmQnr2ONfBCQ/640?wx_fmt=jpeg)image.png

用`console.time()`来计算代码的耗时，参数为计时器命名。

```
function sum(n) {    let sum = 0;    for (i = 1; i <= n; i++) {        let u = {name: 'sam', age: i}        sum += i;    }    return sum}// 计算一个函数的耗时console.time('sum') // 开始计时const total = sum(100000);console.timeLog('sum');  // 计时：sum: 4.43994140625 msconst total2 = sum(1000);console.timeEnd('sum');  // 计时：sum: 5.0419921875 msconsole.log({total});  //{total: 5000050000}
```

### 2.2、增强 log：真实用！

```
const x = 100, y = 200;console.log(x, y); // 100 200console.log({x, y}); // {x: 100, y: 200}console.table({x, y});
```

如上代码，经常我们会输出一些变量值，如果直接输出值，则不知道值对应的变量。这时可以用字面量对象，输出的可读性立马就提升了，再加上`console.table`就更完美了。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksOSY22BljzRymeVF3rgiaYLVVn6ODmiaRFoWVWZo90yWQK9741RXQ6IKg/640?wx_fmt=jpeg)image.png

### 2.3、自定义 log 样式：占位符

`console`函数支持的占位符：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;">占位符</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>%c</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">CSS 样式占位符，值就是 CSS 样式，如下示例，可用来自定义 log 的样式</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>%o</code>&nbsp;or&nbsp;<code>%O</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">打印 JavaScript 对象。在审阅器点击对象名字可展开更多对象的信息。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>%d</code>&nbsp;or&nbsp;<code>%i</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">打印整数。支持数字格式化。例如，console.log("Foo %.2d", 1.1) 会输出有先导 0 的两位有效数字：Foo 01。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>%s</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">打印字符串。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><code>%f</code></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">打印浮点数。支持格式化，比如 console.log("Foo %.2f", 1.1) 会输出两位小数：Foo 1.10</td></tr></tbody></table>

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksBHanKfKkUcf1Wpn1tf1icvfXnNqfBahSyVzNn2yxviaLGEGMW0ulksCA/640?wx_fmt=jpeg)image.png

### 2.4、监听函数

通过如下（调试工具）的全局函数可监听一个函数、事件的执行。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;">函数</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: left; font-size: 14px; min-width: 85px;">说明</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">monitor</strong>(function)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">监听一个函数，当被监听函数执行的时候，会打印被调用信息</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><strong data-style="line-height: 1.75em; color: rgb(74, 74, 74);">monitorEvents</strong>&nbsp;(event)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">监听一个事件，当事件被触发时打印触发事件日志</td></tr></tbody></table>

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkspySB5icWTPWQ4EEN4gyYBw5ibIz6VWTxbBibQ8zGwnedibsQROTibTwrplQ/640?wx_fmt=jpeg) image.png

### 2.5、监听变量：活动表达式

一个不错的小功能，点击下图中的眼睛图标，相当于添加了一个动态表达式，然后实时监控（显示）该表达式的值。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksGWf7ME3yh87op5xpjCqI7QItHR7KyByP2pHnpHzpj3GlJVtESbz5hQ/640?wx_fmt=jpeg)image.png

03、源代码面板（Sources）
-----------------

顾名思义，管理网页所有的源代码文件，包括 JS、CSS、图片等资源，经常就是在这里断点调试 JS 代码，使用评率中：⭐⭐⭐⭐。

在调试模式下可以查看（鼠标悬浮在变量上）变量值、上下文作用域、函数调用堆栈信息。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksN8X8ianTfIzIicF3zFKVicWjaTNKF48eIJIbSKdfO7SkjXGxqLIAJeP6g/640?wx_fmt=jpeg)image

*   **① 页面资源目录**：页面涉及的所有资源（树）。
    
*   **② 源代码**：文件源代码，可以在这里添加断点调试 JS 代码，如果想编辑在线 JS 代码，也是可以的，详见后文。
    
*   **③ Debug 工具栏**：断点调试的操作工具，可以控制暂停、继续、单步... 执行代码。
    
*   **④ 断点调试器**：这里包含多个断点调试器：
    

> *   **监视（Watch）**：可添加对变量的监视。
>     
> *   **断点（Breakpoints）**：所有添加的断点，可在这里编辑、删除管理。
>     
> *   **作用域（Scope）**：当前代码上下文的作用域，含闭包。
>     
> *   **调用堆栈（Call Stack**）：当前函数的调用堆栈，推荐参考《JavaScript 函数 (2) 原理 {深入} 执行上下文 [3]》。
>     
> *   **XHR / 提取断点**：可以在这里添加对 AJAX 请求（XHR、Fetch）的断点，添加 URL 地址即可。
>     
> *   **DOM 断点**：在元素页面添加的 DOM 断点会在这里显示。
>     

### 3.1、断点调试

如下图，在源代码行号位置添加断点。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksvS8W8PNCTskBetqJ76IqnAGbbHgJHxsPz0jAHm2FqJS8zvhFOYuIrg/640?wx_fmt=jpeg)image.png

*   **添加断点（Add breakpoint）**：添加一个普通断点，最左侧行号处，点击添加断点，或者右键菜单。
    

也可以在 JS 代码中设置断点，关键字：`debugger`

```
debugger // 会在这里断点console.log('debugger')
```

*   **添加条件断点（Add conditional breakpoint）**：添加一个条件断点，符合条件断点才会生效，条件可使用当前代码上下文中的变量。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkso2ebA4V9ygggtSURPmiaWrGcYQLGmI6ibJ6TV7Xia0iaE3M4iaBlKwSVGSA/640?wx_fmt=jpeg)image.png

*   **添加记录点（Add logpoint）**：添加一个日志打印，打印当前代码环境的变量，非常方便，不用在源码下添加`console`了。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMks1Msmnd33VJxTrcUJho5pIW1VbiaLnQpjduxiaRiaDMbZl5aJ4Ue7CYCKA/640?wx_fmt=jpeg)image.png

### 3.2、调试线上代码：本地工作区

如果是线上的环境，能不能直接修改源代码（JS、CSS）调试呢？—— 可以的。思路就是创建本地的 JS 副本，页面加载本地的 JS 文件，就可以在本地 JS 文件上修改了。

**① 创建本地工作目录**：

*   如下图，源代码下面找到 “覆盖（Override）”。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksSpMlm9JrHD82u9hzpv6pztZpzZRI5Jm896hHarxibCyzuXmYvib0M82g/640?wx_fmt=jpeg)image.png

*   然后点击 “选择替代文件夹”，添加一个本地空的文件夹，作为本地工作目录。
    
*   添加后要注意要确认授权。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMks2qGVmNYia5HtKALl2HNpNhbu3wnNQ9oicGibwC7WmZ9SibJfyB2UMbVJYQ/640?wx_fmt=jpeg)image.png

**② 创建源代码的本地副本**：选择需要修改的源代码右键 “保存以备替代”，就会在本地目录创建副本文件，网页使用本地的 JS 文件。

*   创建的本地副本，可以在 “覆盖” 下看到，也可以在本地文件夹下看到。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksQib4BDX1uAEwiclMEz24T8ukh6FxqP9RvicBTwLQlXwEKkTywKW8X40icg/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMkspticPciczeneb9fD9h18hibib6ExGxhDTmayfv2eibcS9IUiaZ7rrNfLLvOQ/640?wx_fmt=jpeg)

**③ 编辑代码**：该 JS 文件就可以直接在源代码中编辑修改了，实时生效。

*   CSS、HTML、JavaScript 都支持。
    
*   可以在浏览器的源代码中修改，也可以本地其他工具中打开编辑。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksmRI6pkV8UXLYvseC9m0QkicCklicA8a77lricKunHUjI8WFXV16vPua7w/640?wx_fmt=jpeg)image.png

04、网络面板（Network）
----------------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksskzHPN3icuX4aptBRIbIjNWiamvXv5eiaIB3tKQRSz6YqImcbA8JqdcNw/640?wx_fmt=jpeg)image

工具栏中两个比较实用的小功能：禁用缓存、模拟弱网环境。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMks68flnBZiaLHTxjnmpicxlEnjxddT3OD2Y9mzH12DqMVtevicsjTHutHEA/640?wx_fmt=jpeg)image.png

点击请求的资源项，可以查看详细的请求、响应数据，常用于服务端接口的联调。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksVQVcof8EsJiadrSkA4ic0Ltg7ZPh6rEX1WjdT3RpicyJqaQN5KFRjbcJw/640?wx_fmt=jpeg)image

还可以编辑参数，重新发起请求

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksoQkOlWKMMpRiaxn5g1jZgrZcN9hDyibADSXN3glnmnBdiafaTJoicRCD7Q/640?wx_fmt=jpeg)image.png

05、性能面板（Performance）
--------------------

先录制，后分析，分析网络、CPU、内存、渲染 FPS 帧率，用于定位、解决页面性能问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksmicxdxHwCqcc6JBib33b87T9XOzBVwkT6bo6f3dbhlFJhG2X6GDuYzwQ/640?wx_fmt=jpeg)image

> **🚩特别提示**：调试性能建议在**无恒模式**下进行，尽量避浏览器插件的影响。包括其他异常 Bug 的调试，也要考虑浏览器插件问题，之前就遇到过类似问题，页面上一个 Bug 怎么也复现不了，几经波折才发现是测试机上的油猴插件的影响。

**🔸性能监视器**（Performance monitor）面板可以**实时**的监控页面性能参数。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMksV7KH49QxcsLr4Xk9UXJIdsFW1yvZZTO6fS27NMibZhtQKeicMMpP3m7A/640?wx_fmt=jpeg)image.png

**🔸Lighthouse**，这个就很厉害了，对页面进行综合分析，包括性能、PWA（Progressive WebApp，渐进式 Web 应用）、SEO、无障碍访问等，分析完后产出报告，给出得分，还给出了页面改进建议。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqVafdNQV9gIU4oxFHyhDMks82tia3VkQ0aElPJRKiacMOq39PibU8Nvv6Edic23S002ibVk4XWQNJ7bDWg/640?wx_fmt=jpeg)image.png

参考资料
----

*   掘金小册：你不知道的 Chrome 调试技巧 [4] ，开源版 [5]
    
*   掘金小册：前端开发调试之 PC 端调试 [6]
    
*   前端必须知道的开发调试知识. pptx[7]
    
*   有哪些浏览器 / 内核？[8]
    
*   JavaScript 函数 (2) 原理 {深入} 执行上下文 [9]
    

### 参考资料

[1]

https://www.yuque.com/kanding/ktech/fh36v0: https://link.juejin.cn?target=https%3A%2F%2Fwww.yuque.com%2Fkanding%2Fktech%2Ffh36v0

[2]

https://developer.mozilla.org/zh-CN/docs/Web/API/Console: https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FConsole

[3]

https://www.yuque.com/kanding/ktech/jsfunctoin2#cuhoC: https://link.juejin.cn?target=https%3A%2F%2Fwww.yuque.com%2Fkanding%2Fktech%2Fjsfunctoin2%23cuhoC

[4]

https://juejin.cn/book/6844733783166418958: https://juejin.cn/book/6844733783166418958

[5]

https://dendoink.github.io/daydream/docs/chrome-tricks/index: https://link.juejin.cn?target=https%3A%2F%2Fdendoink.github.io%2Fdaydream%2Fdocs%2Fchrome-tricks%2Findex

[6]

https://juejin.cn/course/bytetech/7180922988034785336/section/7181029728822755385: https://juejin.cn/course/bytetech/7180922988034785336/section/7181029728822755385

[7]

https://bytedance.feishu.cn/file/boxcnAGLgshQ1EKi7ACwx4WI9vc: https://bytedance.feishu.cn/file/boxcnAGLgshQ1EKi7ACwx4WI9vc

[8]

https://www.yuque.com/kanding/ktech/fh36v0: https://link.juejin.cn?target=https%3A%2F%2Fwww.yuque.com%2Fkanding%2Fktech%2Ffh36v0

[9]

https://www.yuque.com/kanding/ktech/jsfunctoin2#cuhoC: https://link.juejin.cn?target=https%3A%2F%2Fwww.yuque.com%2Fkanding%2Fktech%2Fjsfunctoin2%23cuhoC