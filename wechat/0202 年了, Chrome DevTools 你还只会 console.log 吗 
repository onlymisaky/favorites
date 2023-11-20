> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_1R1HuKECUwu05x7ddKOtw)

前言
==

> Chrome 开发者工具（简称 DevTools）是一套 Web 开发调试工具, 内嵌于 Google Chrome 浏览器中。DevTools 使开发者更加深入的了解浏览器内部以及他们编写的应用。通过使用 DevTools, 可以更加高效的定位页面布局问题, 设置 JavaScript 断点并且更好的理解代码优化。
> 
> 本文分享 24 个 Chrome 调试技巧和一些快捷键, 希望能帮你进一步了解 Chrome DevTools ～

调试技巧
====

1. 控制台中直接访问页面元素
---------------

在元素面板选择一个元素, 然后在控制台输入 `$0`, 就会在控制台中得到刚才选中的元素。如果页面中已经包含了 jQuery, 你也可以使用 `$($0)`来进行选择。

你也可以反过来, 在控制台输出的 DOM 元素上右键选择 Reveal in Elements Panel 来直接在 DOM 树中查看。

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXFyCyZzsUa9xCW2AHnqva3icfW1yRaHkWYrRRicibES3DxEeviaeiatzMZzQ/640?wx_fmt=gif)0

2. 访问最近的控制台结果
-------------

在控制台输入 `$_`可以获控制台最近一次的输出结果。

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXJLlzYicUDs1B9sZ1hQchWY3Yy9A9ZUz7tqLDgDXVt0usACoibLErlvTg/640?wx_fmt=gif)_

3. 访问最近选择的元素和对象
---------------

控制台会存储最近 5 个被选择的元素和对象。当你在元素面板选择一个元素或在分析器面板选择一个对象, 记录都会存储在栈中。可以使用 `$x`来操作历史栈, x 是从 0 开始计数的, 所以 `$0` 表示最近选择的元素, `$4` 表示最后选择的元素。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xX9icpdZYshrBM0nQMunDzibeMY1g9oOYSOC4NHaTTgLWHwoC0qcWKYx0A/640?wx_fmt=png)4

4. 选择元素
-------

*   `$()` - 返回满足指定 CSS 规则的第一个元素，此方法为 document.querySelector() 的简化。
    
*   `$$()` - 返回满足指定 CSS 规则的所有元素，此方法为 querySelectorAll() 的简化。
    
*   `$x()` - 返回满足指定 XPath 的所有元素。
    

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXCDlGUU74zAAw1q0A439gLiaogxibcfjT9zLWvm5Mf2Oy7u8QxPAglImw/640?wx_fmt=png)select

5. 使用 console.table
-------------------

该命令支持以表格的形式输出日志信息。打印复杂信息时尝试使用 console.table 来替代 console.log 会更加清晰。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXUEiaXRpETyIRuuda0J3HQ0EbSjwyUR8IibvO1Vc9DTMJC987sEb9gtFQ/640?wx_fmt=png)table

6. 使用 console.dir, 可简写为 dir
---------------------------

console.dir(object)/dir(object) 命令可以列出参数 object 的所有对象属性。

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXqibanicSk1H0tuWSCgIr8zSMxGnnZibck5FJibicXJAZiabFJuQrXFZ0T0zQ/640?wx_fmt=gif)dir

7. 复制 copy
----------

你可以通过 copy 方法在控制台里复制你想要的东西。

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXRJhQjTYaktAINq4N5CZbb1E0uIic366Ohsx6iaHYSIKzfPJ5z0UDYPEA/640?wx_fmt=gif)copy

8. 获取对象键值 keys(object)/values(object)
-------------------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXgls9DkBMC0qRnfvvZ96T66pGAffvxbUVso61uZp5RDV0POldyibrc2g/640?wx_fmt=png)keys_values

9. 函数监听器 monitor(function)/unmonitor(function)
----------------------------------------------

monitor(function), 当调用指定的函数时, 会将一条消息记录到控制台, 该消息指示调用时传递给该函数的函数名和参数。

使用 unmonitor(函数) 停止对指定函数的监视。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXMLoFCkjCX9nDfVIWa5qIMbLNhcoicTicwD40iaYibFTOUVjEY0Pv9E9nog/640?wx_fmt=png)monitor

10. 事件监听器 monitorEvents(object[, events])/unmonitorEvents(object[, events])
---------------------------------------------------------------------------

monitorEvents(object[, events]), 当指定的对象上发生指定的事件之一时, 事件对象将被记录到控制台。事件类型可以指定为单个事件或事件数组。

unmonitorevent (object[， events]) 停止监视指定对象和事件的事件。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXxdhotCV4Hsoqcic9zZRZO1z5slWWXAf87we4jawmibmEOCdsMhKVjcpQ/640?wx_fmt=png)monitorevents

11. 耗时监控
--------

通过调用 time() 可以开启计时器。你必须传入一个字符串参数来唯一标记这个计时器的 ID。当你要结束计时的时候可以调用 timeEnd()，并且传入指定的名字。计时结束后控制台会打印计时器的名字和具体的时间。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xX5QAm11zpo8aibdqHDkC2NQDqGhTN4UKKbma4SUicbjFPS5mh6ibvjVWXg/640?wx_fmt=png)time

12. 分析程序性能
----------

在 DevTools 窗口控制台中，调用 console.profile() 开启一个 JavaScript CPU 分析器. 结束分析器直接调用 console.profileEnd().

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xX4YkhsbguDkD7Clg3ucicj9BVCUTQZt6jaiadics0XsCLrqkiaDeTQCjONQ/640?wx_fmt=png)profile

具体的性能分析会在分析器面板中

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXKsibsHlJVm0EysfGu2GPRQ5023WYPW1u0S7FuC6QBz76dJdQtCOfDSg/640?wx_fmt=png)profile_1

13. 统计表达式执行次数
-------------

count() 方法用于统计表达式被执行的次数, 它接受一个字符串参数用于标记不同的记号。如果两次传入相同的字符串, 该方法就会累积计数。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXQWXbSGADRWJTwX2Gsl07pPFnAerDrznvSYt0M8GntbswP8XuwEwvgw/640?wx_fmt=png)count

14. 清空控制台历史记录
-------------

可以通过下面的方式清空控制台历史:

*   在控制台右键，或者按下 Ctrl 并单击鼠标，选择 Clear Console。
    
*   在脚本窗口输入 clear() 执行。
    
*   在 JavaScript 脚本中调用 console.clear()。
    
*   使用快捷键 Cmd + K (Mac) Ctrl + L (Windows and Linux)。
    

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXj5sTMmFmzcpyicl7AsjLWEu1rkSg3XZMcibTdibNicH5BIZiaDTaNYvfxmA/640?wx_fmt=gif)clear

15. 异步操作
--------

async/await 使得异步操作变得更加容易和可读。唯一的问题在于 await 需要在 async 函数中使用。Chrome DevTools 支持直接使用 await。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXSDd8eJc0ppyVCzbtuE6PWRYpzHq36hRkWweFmOac4nVmnKiayI7chxw/640?wx_fmt=png)await

16. debugger 断点
---------------

有时候我们需要打断点进行单步调试, 一般会选择在浏览器控制台直接打断点, 但这样还需要先去 Sources 里面找到源码, 然后再找到需要打断点的那行代码, 比较麻烦。

使用 debugger 关键词, 我们可以直接在源码中定义断点, 方便很多。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXrM03RiayxIBGwsVd8z9tasBxGxIPOnCeIvB0p8AGQtp4ibS2sv1CEEkA/640?wx_fmt=png)debugger

17. 截图
------

我们经常需要截图, Chrome DevTools 提供了 4 种截图方式, 基本覆盖了我们的需求场景, 快捷键 ctrl+shift+p , 打开 Command Menu, 输入 screenshot, 可以看到以下 4 个选项:

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXQlHxr5JUicqTtmZXkickSKaefHDvaq6VsK7jmeXD8DKmKibErQibl8JZ4g/640?wx_fmt=png)screenshot

去试试吧, 很香!

18. 切换主题
--------

Chrome 提供了 亮 & 暗 两种主题, 当你视觉疲劳的时候, 可以 switch 哦, 快捷键 ctrl+shift+p , 打开 Command Menu, 输入 theme , 即可选择切换

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXvztm9nmia3JhicSBG6vSIuniaHTxMP86fdhLXGwJmSqyLvoLOI0SA5TicA/640?wx_fmt=gif)theme

19. 复制 Fetch
------------

在 Network 标签下的所有的请求, 都可以复制为一个完整的 Fetch 请求的代码。

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXF6sgJwhSPsl0f72ic6ceibPzx3vPPKJOKzRyEibHphibbJ3zgYHLoQsibdQ/640?wx_fmt=gif)copy-fetch

20. 重写 Overrides
----------------

在 Chrome DevTools 上调试 css 或 JavaScript 时, 修改的属性值在重新刷新页面时, 所有的修改都会被重置。

如果你想把修改的值保存下来, 刷新页面的时候不会被重置, 那就看看下面这个特性（Overrides）吧。Overrides 默认是关闭的, 需要手动开启, 开启的步骤如下。

开启的操作:

打开 Chrome DevTools 的 Sources 标签页  
选择 Overrides 子标签  
选择 + Select folder for overrides, 来为 Overrides 设置一个保存重写属性的目录

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xX3auR241QTL13sUk4ndsMIpNiayKKuQAAGuT8iaLTlFiaN1yiaU801srNQw/640?wx_fmt=png)overrides

21. 实时表达式 Live Expression
-------------------------

从 chrome70 起, 我们可以在控制台上方可以放一个动态表达式, 用于实时监控它的值。Live Expression 的执行频率是 250 毫秒。

点击 "Create Live Expression" 眼睛图标, 打开动态表达式界面, 输入要监控的表达式

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXxEfJD2EoBdnthaS6yYLzseaIsBF0NSF8UD5kTBEhFha0kofdT7a6AA/640?wx_fmt=gif)live_expression

22. 检查动画
--------

Chrome DevTools 动画检查器有两个主要用途。

*   检查动画。您希望慢速播放、重播或检查动画组的源代码。
    
*   修改动画。您希望修改动画组的时间、延迟、持续时间或关键帧偏移。当前不支持编辑贝塞尔曲线和关键帧。
    

动画检查器支持 CSS 动画、CSS 过渡和网络动画。当前不支持 requestAnimationFrame 动画。

快捷键 ctrl+shift+p , 打开 Command Menu, 键入 Drawer: Show Animations。

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXoNmIibtLrGmvicmxnheCfKz0g9qnQ61XLQeh9N0J5kZfgfzarPenia4Gg/640?wx_fmt=gif)animations

23. 滚动到视图区域 Scroll into view
----------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xXwXeeDMw7MCdibOba38b5QbwicMEYsSOnwUjhP9HGOWVicP9icMYOSlOicfQ/640?wx_fmt=png)scrollintoview

24. 工作区编辑文件 Edit Files With Workspaces
--------------------------------------

工作空间使您能够将在 Chrome Devtools 中进行的更改保存到计算机上相同文件的本地副本。

进入 Sources Menu, Filesystem 下 点击 Add folder to workspace 添加要同步的工作目录

![](https://mmbiz.qpic.cn/mmbiz_gif/C527icpHV4sc2O1ib4Q8Su38QZO0stP6xX9k1syfD5HU3dictSEALSDfpic9w4Tswr0zfd1UACZfQO1LA3bTIibKy8g/640?wx_fmt=gif)workspaces

快捷键
===

访问 DevTools
-----------

<table width="753"><thead><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">访问 DevTools</th><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">Windows</th><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">Mac</th></tr></thead><tbody><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">打开 Developer Tools (上一次停靠菜单)</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">F12、Ctrl + Shift + I</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Opt + I</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">打开 / 切换检查元素模式和浏览器窗口</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + Shift + C</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + C</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">打开 Developer Tools 并聚焦到控制台</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + Shift + J</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Opt + J</td></tr></tbody></table>

全局键盘快捷键
-------

下列键盘快捷键可以在所有 DevTools 面板中使用:

<table width="753"><thead><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">全局键盘快捷键</th><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">Windows</th><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">Mac</th></tr></thead><tbody><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">下一个面板</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + ]</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + ]</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">上一个面板</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + [</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + [</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">更改 DevTools 停靠位置</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + Shift + D</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + D</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">打开 Device Mode</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + Shift + M</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + M</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">切换控制台</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Esc</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Esc</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">刷新页面</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">F5、Ctrl + R</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + R</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">刷新忽略缓存内容的页面</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + F5、Ctrl + Shift + R</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + R</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">在当前文件或面板中搜索文本</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + F</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + F</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">在所有源中搜索文本</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + Shift + F</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Opt + F</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">按文件名搜索（除了在 Timeline 上）</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + O、Ctrl + P</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + O、Cmd + P</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">放大（焦点在 DevTools 中时）</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + +</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + +</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">缩小</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + -</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + -</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">恢复默认文本大小</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + 0</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + 0</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">打开 command 菜单</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + Shift + P</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + Shift + P</td></tr></tbody></table>

控制台
---

<table width="753"><thead><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">控制台快捷键</th><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">Windows</th><th data-style="box-sizing: border-box; padding: 0.5em 1em; text-align: center; border-top-width: 1px; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; background-color: rgb(240, 240, 240);">Mac</th></tr></thead><tbody><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">上一个命令 / 行</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">向上键</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">向上键</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">下一个命令 / 行</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">向下键</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">向下键</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">聚焦到控制台</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + `</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + `</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">清除控制台</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Ctrl + L</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Cmd + K</td></tr><tr data-style="box-sizing: border-box; font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">多行输入</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Shift + Enter</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Shift + Enter</td></tr><tr data-style="box-sizing: border-box; background-color: rgb(248, 248, 248); font-size: inherit; color: inherit; line-height: inherit; border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204);"><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">执行</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Enter</td><td data-style="box-sizing: border-box; padding: 0.5em 1em; border-color: rgb(204, 204, 204); color: inherit; line-height: inherit; font-size: 1em; text-align: center;">Return</td></tr></tbody></table>