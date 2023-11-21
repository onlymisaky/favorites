> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/K-Kt3tUwILyedvYw-w8ZSQ)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxZxEZfAsLSbVzSq9cNTNfia8S8nnrX75BC78ag4GxV868pypPibUQbIqw/640?wx_fmt=jpeg)

今天跟大家来分享几个实用的 `Devtools` 技巧。

1. 编辑并重新发送网络请求
--------------

在 Web 开发中，我们可能要频繁调试网页上的请求，可能我们需要改动一个很小的参数，然后被迫重启一遍项目或者等待热更新，其实使用 `Devtools` 的重新发送请求的功能会很方便。

`Edge` 和 `Firefox` 的 `Devtools` 都提供了编辑并重新发送网络请求的功能（`Chrome` 在最近的版本中也在尝试提供类似的能力，不过只能覆盖 `Header` ，体验并不是很好）

比如，在 `Edge` 中，我们可以选中某个请求，右键点击 “编辑并重新发送”

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxPCZNlQKpcHyYsDSNz4bFoHwGwrlBHb4oibp2XkCaicib0phOvqqORcn4A/640?wx_fmt=png)

随后会帮我们打开 “网络控制台” 面板，我们可以在其中随便更改 `Query、Headers、Body` 等内容：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0Wx0KWxp5vgtnh4TQiaLhuyuDUYqepr6SAtz6CVS2IFJn5ViaRNIFP5G7NA/640?wx_fmt=png)

如果我们只需要重新发送服务端请求，也可以直接在 `Chrome` 或 `Edge` 的 `DevTools` 中点击 `Replay XHR` ，注意这个功能只能对 `XHR` 请求使用，不适用于 `Fetch` 或其他请求。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxVUGTmXYjzZXtx2pnDnn8Yy9yp3iaXQ426Rz0uAtI9cD9WPks0qcHQKQ/640?wx_fmt=png)

2. 禁用调试语句
---------

有些网站会故意使用 `debugger` 语句来禁止你调试，只要 `DevTools` 关闭，这个语句就没有效果，但是只要你打开它，`DevTools` 就会暂停网站的主线程。

当你打开 `Devtools` 时，可能会进入一个超长的 `debugger` 循环。这时候你会怎么办？疯狂点击继续来跳过所有短点？那下次刷新网页还会进入这些断点。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxAt6HOMRAux6iaNc51PdSREiczVePPiaELgqwgLWmDJxUYibzd9q6Ju7bMg/640?wx_fmt=png)

遇到这种情况，我们可以直接在有断点的这一行右键，点击 `Never pause here` ，然后刷新网页，你会发现这个断点再也不会生效了。

3. 下载页面上的所有图片
-------------

这个技巧并不限定于任何浏览器，只要可以执行 `JavaScript`，就可以在任何地方运行。如果要下载网页上的所有图片，可以打开 `Devtools` 工具，粘贴以下代码，然后按 `Enter`：

```
$$('img').forEach(async (img) => { try {   const src = img.src;   // Fetch the image as a blob.   const fetchResponse = await fetch(src);   const blob = await fetchResponse.blob();   const mimeType = blob.type;   // Figure out a name for it from the src and the mime-type.   const start = src.lastIndexOf('/') + 1;   const end = src.indexOf('.', start);   let name = src.substring(start, end === -1 ? undefined : end);   name = name.replace(/[^a-zA-Z0-9]+/g, '-');   name += '.' + mimeType.substring(mimeType.lastIndexOf('/') + 1);   // Download the blob using a <a> element.   const a = document.createElement('a');   a.setAttribute('href', URL.createObjectURL(blob));   a.setAttribute('download', name);   a.click(); } catch (e) {}});
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxR9NLjl2EEu5eGydd2SCWX57MicyQ8WfX1dZVicSDTGFVre8cdWr4D4Gw/640?wx_fmt=png)

注意 ：有的网页会下载失败，可能是网页上的 CSP 策略阻止了。

如果你可能经常会用到这个功能，可以把它粘贴到 `Sources` 下的 `Snoppets` 下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxQnicibic7JUTibx8FLkGsvR1SDh1VrBYQggkIdNB37g1DADoV3w8RfUfOg/640?wx_fmt=png)

4. 网页的 3D 视图
------------

当我们编写好网页的 `HTML` 和 `CSS` 后，浏览器会对代码进行解析、解释和转换，然后将其转换为各种树结构，包括 DOM 树、合成层、堆栈上下文树等等。

这些数据结构就代表了正在运行的网页的内部内存表示，但有的时候它们可能没有按照我们的预期工作，`Edge` 的 `Devtools` 提供了一个可以以多种方式展示 3D 可视化网页的工具。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0Wx1a3sXmShk7yLq0b1g8ZdhQFSia2vFtJFUp74yqx2e3Eib0Vku6FMMkRQ/640?wx_fmt=png)

我们可以在 Devtools 中找到 3D 视图面板，然后打开它：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxJ8ANd3BMkha62ResBwmYTXBkLT50xpLMqPicrox9Nw27Xswe5p5Xssg/640?wx_fmt=png)

在 3D 视图工具中，在三种不同模式之间进行选择：`Z-Index`、`DOM` 和 `Composited Layers`。我们可以使用鼠标光标随意平移、旋转或缩放 `3D` 场景。

`Z-Index` 模式可以帮助我们轻松的了解哪些元素正在堆叠上下文以及哪些元素位于 z 轴上。

`DOM` 模式可用于查看 `DOM` 树的深度或查找视口之外的元素。

`Composited Layers` 可以示浏览器渲染引擎创建的所有不同图层。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxON2ibSLibkicMUibWZkmTZiaHMxT4BWHK4kLlhPU2W9sIhBpDuaicaawiaIdw/640?wx_fmt=png)

`Safari` 和 `Chrome` 的 `Devtools` 也有一个显示合成图层的 `Layers` 视图，不过功能上就不如 `Edge` 的强大了。

5. 禁用事件侦听器
----------

事件侦听器有的时候也会妨碍网页的调试。如果我们正在排查某个特定的问题，但每次移动鼠标或使用键盘时，都会触发不相关的事件侦听器，这可能会让我们很难专注的排查问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxAHVlH0YxUSy47ewicqheaaFNxRB5lBmYOzHE5bWhosodeDUgSjVfJDw/640?wx_fmt=png)

首先我们在 `Element` 选项卡找到并选中相应的元素，然后点击右侧的 `Event Listeners` 选项卡，找到我们想要删除的事件，然后点击 `Remove` 即可（在 `Chrome` 和 `Edge` 的操作相同）。

6. 切换 Devtoos 语言
----------------

一般情况下 `Devtools` 都会继承操作系统当前选择的默认语言，但是 `Devtoos` 上的翻译有时候真的挺别扭的，在 `Safari` 、 `Chrome` 或 `Edge` 中，我们都可以在 `Devtoos` 的设置中随意切换目标语言，如果你也觉得翻译过来的中文比较别扭，还是建议直接使用英文版

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0Wx8CeA2HuS3icuOCLs9thVw2yCXyvIC8WQ6vvmLDrGkZjP2BVaPVDgPyw/640?wx_fmt=png)

但是，在 `Firefox` 中，`DevTools` 始终会与浏览器的语言匹配，所以如果你想使用法语版的 `DevTools`，必须要单独下载一个法语版的 `Firefox`。

7. 调整 Devtoos 大小
----------------

不知道大家是不是像我一样，觉得 `DevTools` 中的文本和按钮太小，使用起来很不舒服。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxZEXpuldWSeibuIElObReFsMmibtucUfogvZeXibQHncicQJWmZcynUYcxw/640?wx_fmt=png)

实际上，`DevTools UI` 也是可以随意放大和缩小的。`DevTools` 的用户界面其实也是使用 `HTML、CSS` 和 `JavaScript` 构建的，这意味着它也是由浏览器渲染的 Web 界面。就像浏览器中的任何其他网页内容一样，你可以使用和键盘快捷键 `Ctrl+、Ctrl-`（或 `macOS` 上的 `Cmd+、Cmd-`）来放大或缩小它。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxkgsFrBRfriaBkibq5O4ouvBjyMExcoicuMiaiamVKu6iaibJ3LWP1BwWxia1Ow/640?wx_fmt=png)

8. 测量网页上的任意距离
-------------

有时候可能我们希望快速测量网页上某个区域的大小或两个物体之间的距离。当然，我们可以直接使用 `DevTools` 来获取任何选定元素的大小。但有时，我们需要测量可能与页面上的任何元素不匹配的任意距离。一个好的方法就是使用 `Firefox` 的测量工具。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0WxfM9PdnHA0c3iaYsu1usPEGQAM1fDPGWib1jOeSCicepdpkDayuXcGTZdg/640?wx_fmt=png)

我们可以在 `Setting` 中 找到 `Measure a portion of the page` 并启用它。然后，在网页的任何部分，我们都可以使用测量工具来进行任意测距。

9. 查看代码覆盖率
----------

想要让网页快速渲染给用户的方法之一是确保它只会加载真正需要的 `JavaScript` 和 `CSS` 依赖。当今复杂的 `Web` 应用程序经常会加载大量的代码，但是有可能只会需要一小部分代码来渲染当前的页面和功能。

在基于 `Chromium` 的浏览器中，我们可以使用 `Coverage` 工具来识别代码的哪些部分未使用。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0Wxd2bV74huPmsmeo92frpYrfOKB1jpJW87vUMwU9dHIGtia2BxGo9Kt7g/640?wx_fmt=png)

打开 `Coverage` 工具，我们可以使用命令菜单作为快捷方式：按 `Ctrl+Shift+P`（或 `macOS` 上的 `Cmd+Shift+P` ），输入 “`coverage`”，然后 `Enter`）。点击开始检测后，会重新刷新页面，并展示覆盖率报告，打开文件后它可以告诉我们具体哪些代码部分未使用。

10. 更改视频的播放速度
-------------

通常，网页视频都会给我们提供灵活的视频控制按钮，包括加快或减慢速度的方法，但如果你遇到了无法或者难以控制的视频，我们可以直接使用 `DevTools` 通过 `JavaScript` 进行控制。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdT2Gya4GKZfdOCr1Lh9f0Wx3DZUYzUEymstpehBzFK7qLOvAJSYAo8vOpeNWtxicibfNXMtuXMVoN0w/640?wx_fmt=png)

打开开发工具，选中我们要控制的 `<video>` 元素，然后输入以下内容：`$0.playbackRate = 10` ，并按 `Enter` 执行。你会发现，视频的播放速度已经发生变化了。我们还可以使用控制视频的其他方法：

*   `$0.pause()` 暂停视频；
    
*   `$0.play()` 继续播放视频；
    
*   `$0.loop = true` 循环重复播放视频。
    

最后
--

大家觉得哪个最实用？欢迎在评论区留言！

参考：

*   https://devtoolstips.org/
    
*   https://www.smashingmagazine.com/2023/06/popular-devtools-tips/
    
*   https://devtoolstips.org/tips/en/zoom-devtools-content/
    
*   https://devtoolstips.org/tips/en/list-used-fonts/
    
*   https://devtoolstips.org/tips/en/change-video-playback-rate/
    
*   https://devtoolstips.org/tips/en/disable-event-listeners/
    
*   https://devtoolstips.org/tips/en/see-the-page-in-3d/
    

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️