> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_m1OWfr4CRevfWqczUbryg)

> 本文为翻译  
> 本文译者为 360 奇舞团前端开发工程师  
> 原文标题：11 New Features and Functions Arriving in CSS  
> 原文作者：Alvaro Montoro  
> 原文地址：https://dev.to/alvaromontoro/new-values-and-functions-in-css-1b9o

注：由于这些特性较新，且目前处于工作草案阶段，本文所描述的许多特性将会发生变化，并且不会在所有浏览器中都可用（部分浏览器已经可用！）

2024 年 9 月 13 日，CSS 工作组发布了 CSS 值与单位模块第 5 级（CSS Values and Units Module Level 5）的首个公开工作草案。它是上一级别的扩展，包含了一些有趣的新增内容。

不久前还难以想象的事物正在被纳入规范：随机值、在任何 CSS 属性（CSS property）中使用 HTML 元素属性（HTML attribute）作为值、能够在计算中运用顺序…… 这看起来很有前景。

这些特性中的许多都有一个共性：它们简化了 CSS 代码。以前需要多个规则或者临时拼凑（hacky）的解决方案才能实现的事情，现在可能用一两行 CSS 代码就能做到。正如我所说，看起来很有希望。以下是新变化的列表（更多细节如下）：

*   **attr() 函数的变更**：使其可用于任何 HTML 元素属性，并且可在任何 CSS 属性中使用（而不仅仅是在 content 属性中）。
    
*   **calc-size() 函数**：在计算中使用诸如 auto 或 min-content 等内在值。
    
*   **新的 first-valid() 函数**：用于避免 CSS 自定义属性出现无效值的问题。
    
*   **新的 *-mix() 函数族**：带有一种新的比率表示法。
    
*   **新的 *-progress() 函数族**：用于计算范围之间、媒体或容器内的进度比率。
    
*   **借助新的 random() 和 random-item() 函数实现随机化**：从范围或列表中返回随机值（终于实现了！）
    
*   **新的 sibling-count() 和 sibling-index() 函数**：根据顺序和数量提供整数值以进行操作。
    
*   **新的 toggle() 函数**：用于轻松地对嵌套的 HTML 元素进行样式设置，可在一组值之间循环切换样式。
    
*   **新的函数参数表示法（针对以逗号分隔值列表的参数）**：避免在 CSS 函数中因逗号分隔参数而产生歧义。
    
*   **新的 URL 修饰符**：对 url() 请求提供更多控制。
    
*   **position 类型的扩展**：允许使用与流相关的值。
    

新特性与更新
------

### attr() 函数的变更

在 CSS 中读取 HTML 元素属性并使用它并不是新鲜事。通过 attr() 函数已经可以做到这一点，但一个常见的抱怨是其功能有限，只能处理字符串并且仅在 content 属性中使用。

attr() 函数将会进行一些更新，这样任何数据类型的任何 HTML 元素属性都可以在任何 CSS 属性中使用。这将会很简单，只需指定类型，如果需要的话，还可以指定一个备用值，以防出现意外情况。

这是一个期待已久的更新，将让许多开发者感到高兴。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklaNuibOJmqNVRX8313pvXpOL6sCOFRB9ciaA1dECPHhoEKCMGw7iaw31sA/640?wx_fmt=png&from=appmsg)

### 使用 calc-size() 函数进行内在值操作

该模块还引入了一个新函数，能够安全地对内在值（auto、max-content、fit-content 等）进行操作。这一特性在 CSS 过渡（transitions）和动画（animations）中特别有用。

它还添加了新的关键字（size）以提供更多计算灵活性，使其更易于处理尺寸。

既然已经有了 calc() 函数，为什么还要一个全新的函数呢？正如文档所解释的，这样做是出于向后兼容性和实际原因（例如，在所有情况下实现平滑插值，特别是在按百分比操作时）。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklrjicTA6RIyvDss6rsibVK46e7v2jo7W8PA9faRbv0zbcX2ib7IRsfEsQg/640?wx_fmt=png&from=appmsg)

### 新的 first-valid() 函数

引入了一种新方法：first-valid()。其思路是向函数传递一个值列表；这些值将被解析，第一个有效的值将被使用。这在处理 CSS 自定义属性（也称为 CSS 变量）时将特别有用。

在使用 CSS 自定义属性时的一个问题是，在声明中，即使实际包含的值无效，它们也被视为有效值。设置备用值也无济于事，备用声明也将被忽略。

通过这种方法，我们可以通过使用 first-valid() 将所有备用声明合并为一个来简化代码。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOokll3I299mJMJNLSvoS6nL97npofJcGvjvo2GsRlGVRSyRBib4ZibM7HWtQ/640?wx_fmt=png&from=appmsg)

### 新的 *-mix() 函数族

它还引入了一个新函数 mix()，可用于简化不同的 *-mix 函数。你想要混合颜色吗？你可以使用像 color-mix(red 60%, blue) 这样的写法，或者更简单的 mix(60%, red, blue) 也可以达到同样的效果。当我们说到颜色时，我们也可以混合长度、变换函数等。

这种表示法也被扩展到其他 *-mix 函数族：

*   calc-mix()
    
*   color-mix()
    
*   cross-fade()
    
*   palette-mix()
    

如果在进度参数（第一个参数）中未指定缓动函数，则默认应用 linear。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklMvAIZq5VibTLQK4nyzRk80ak4sic9GKbotybMbmvp8DR9kNIr1tz6cMQ/640?wx_fmt=png&from=appmsg)

### 新的 *-progress() 函数族

它们表示给定值从一个起始值到另一个结束值的比例进度。结果是一个介于 0 和 1 之间的数字，可用于操作，但在与前面描述的 *-mix 函数族结合使用时将特别方便。

这个函数族中有三个函数：

*   progress()：通用的，适用于任何数学函数。
    
*   media-progress()：用于媒体特性。
    
*   content-progress()：用于容器查询。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklXeicwm8935Jm3Fxpv3ZyBSUv9IZiaicic6JRk3yNDg2KVxbXEZ56uerL9Q/640?wx_fmt=png&from=appmsg)

### CSS 中的随机化函数

有趣的设计都有一定程度的随机化，这在 CSS 中一直是缺失的。但是这个模块引入了两个新函数，它们从列表（random-item()）或范围（random()）中返回随机值。

不再需要使用临时拼凑（hacky）的技巧或依赖其他语言来实现这一点。语法也很直接且强大，还可以按选择器或元素计算随机数。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklyXEZc3NAVVFhhK3yZYpvxGAC0icmAgX45gciblGJFAI8bh2dHtXAxY3Q/640?wx_fmt=png&from=appmsg)

### 新的兄弟函数

有时你可能想要根据容器内元素的顺序来提供不同的样式。遗憾的是，在 CSS 中不能像这样使用计数器。

随着引入两个返回数字的新函数，使得可以对其进行操作，这个障碍被消除了：

*   sibling-count()：返回兄弟元素的数量。
    
*   sibling-index()：返回元素在兄弟元素列表中的位置 / 顺序。
    

不再需要在每个元素上设置自定义属性或编写带有 nth-child 的单独选择器。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOokljdzHcNQG0lIRhuGrVcqmpbwqN8jCBzOKX6lhsS4Z6UyfwKBm2HgWAw/640?wx_fmt=png&from=appmsg)

### 新的 toggle() 函数

引入了一种在嵌套元素中定义值的便捷新方法。toggle() 函数设置元素及其后代将循环使用的值，大大简化了代码。忘记那些复杂的规则或重新定义吧——所有内容都将在一行代码中完成。

例如，想象我们有一个四层嵌套的列表。我们希望奇数层有圆形标记，偶数层有方形标记。我们可以在不同层级使用 ul > li ul > li ul > li ul {…} 来实现，或者我们可以只做像 ul { list - style - type: disc, square; } 这样的操作。搞定！

关于这个函数唯一有点让人担心的是它的名字。也许只是我这么觉得，但 “toggle” 这个词有 “二元性” 的含义：开 / 关、是 / 否——两个值相互切换。toggle()函数可以有任意数量的参数，所以它被命名为 “toggle” 感觉有点奇怪。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklP5ZFds2wHcZQpQbvlNz4U9u5ib92xZAhN42libRLuibWumS22meV1A4MA/640?wx_fmt=png&from=appmsg)

### 新的函数参数表示法

你可能已经注意到的一件事是，一些新函数（例如，random() 或 toggle()）可以接受逗号分隔的值列表作为参数。

在这种情况下，我们如何区分一个参数和下一个参数呢？这就是为什么会有针对函数表示法的 “逗号升级” 提议。这意味着我们可以使用分号（;）而不是逗号（,）来明确地分隔参数。

例如，想象你想要在你的页面上有一个随机的字体系列并指定不同的选项：

*   Times, serif
    
*   Arial, sans-serif
    
*   Roboto, sans-serif
    

所有这些参数都是逗号分隔的值列表。如果我们使用逗号来分隔参数，将会是一团糟。但是使用新的表示法，很容易识别一个参数在哪里结束，下一个参数从哪里开始：

```
.random-font {     font-family: random-item(Times, serif; Arial, sans-serif; Roboto, sans-serif); }
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklUwWlbz70v9v1eyG438caibd7ncZVrbkxD4YIJGjtLFnNN70X5KUu3zQ/640?wx_fmt=png&from=appmsg)

### position 类型的扩展

CSS 已经有用于 margin、padding 和 border 的逻辑属性——这些值与文本书写方向相关，并且可能因语言而异。现在这被引入到 position 类型（不要与 position 属性混淆）。表示位置的属性（例如，background-position、object-position 等）可以指定相对于文本流和方向的值。

可以使用的新值有：

*   x-start
    
*   x-end
    
*   y-start
    
*   y-end
    
*   block-start
    
*   block-end
    
*   inline-start
    
*   inline-end
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEBk7JSn1ZXkJUbMn5GHOoklvIy5bl0lc1dsH5MWH0IIwmhgZMnyedM9d0B7bzibTM0NdcnFX7ZqIQQ/640?wx_fmt=png&from=appmsg)

### 结论

它仍处于早期阶段，并且会发生变化，但 CSS 值与单位模块第 5 级中包含的一些新特性和功能看起来非常有前景。

有些也是期待已久的！特别是在任何 CSS 属性中使用任何 HTML 元素属性的可能性。我记得很久以前就在规范中看到过这个选项。希望这是使其成为现实所需的推动。

不要忘记查看 CSS 值与单位模块第 5 级工作草案以获取更多细节和信息。如果你有任何问题或评论，请在他们的 GitHub 仓库中提交工单。愉快地（进行 CSS）实验和编码！  

- END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

 ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)