> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qzdS4M0LykLaLWGIqjAytw)

终于有大佬把 React 复杂的流程可视化出来了，让我们来看看效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/iagNW4Zy9CyZ9eypNuaVksYGlYicTAjWoRjqMWU8KrEU4n7A2EymXfDlKg5gmvzv9UM2FCEx4a6cDqNnbWTaXsAg/640?wx_fmt=gif&from=appmsg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyZ9eypNuaVksYGlYicTAjWoRLmDR0fohxMrVqUy6MZ7BLoqIVAWkcqV4cQGukcicvqADcQq12drHlDA/640?wx_fmt=png&from=appmsg)

体验这个功能的网址：https://jser.pro/ddir/rie

**下面是作者关于这个功能的介绍**：

* * *

我为什么创建它？
--------

当我在 2021 年首次深入探索 React 时，我为自己绘制了一些图表 [1] 来帮助理解 React 的内部结构，下面是其中之一。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyZ9eypNuaVksYGlYicTAjWoRKZibrhmN2YCicsqDf8q2Q4ar737nGmXoic2dTY1to2NJAj3qFic2sm8Awg/640?wx_fmt=png&from=appmsg)React 内部结构图

显然，这需要大量的手动工作，而且它只是个静态图片，如果我们能自动可视化 React 的内部结构而且让它动起来，是不是更好？我心中有这个可视化工具的想法已经很久了，后来我动手实现了。

如何使用它？
------

RIE（React 内部结构探索器）[2] 的用户界面应该是很直观的，基本上你可以：

1.  选择 React 版本（目前支持 18.3.1 和 19-rc）
    
2.  编辑你的代码或选择内置代码片段
    
3.  点击 “运行” 按钮来检查 React 的内部结构
    
4.  交互预览，并查看内部更新。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyZ9eypNuaVksYGlYicTAjWoROKX8Teia2luVibwBtU5oYcVacI1U7kibSchY6POhO28MlZM1yojXYQjXg/640?wx_fmt=png&from=appmsg)React Internals Explorer 介绍图

例如，你可以选择 “Suspense - multi throw” 代码片段，看看 React@19 和 React@18 是如何处理不同的。

也许观看我的快速介绍视频 [3] 会更简单。😳

下一步。
----

RIE（React 内部结构探索器）[4] 仍处于早期阶段，作为 DDIR（深入探索 React）[5] 的配套应用程序，我将尝试覆盖更多流程并使其更加易用。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/iagNW4Zy9CyZ9eypNuaVksYGlYicTAjWoRjRnBrHSenMBibehw6t0JU8o22fLmmt4kmGDxbJSyB7K2Cexiclz3eLUA/640?wx_fmt=jpeg&from=appmsg)React 源码深度解析系列封面图

想了解更多关于 React 的内部工作原理吗？可以看看 - **深入探索 React 内部结构**！

点击访问系列 [6]

* * *

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！

参考资料

[1]

图表: _https://github.com/JSerZANP/react-source-code-walkthrough-en/blob/main/memo/_

[2]

RIE（React 内部结构探索器）: _https://jser.pro/ddir/rie_

[3]

快速介绍视频: _https://youtu.be/qIlfTZxb8_0_

[4]

RIE（React 内部结构探索器）: _https://jser.pro/ddir/rie_

[5]

DDIR（深入探索 React）: _https://jser.pro/ddir_

[6]

点击访问系列: _https://jser.dev/series/react-source-code-walkthrough_