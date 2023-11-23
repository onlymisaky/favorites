> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ivMqSMwPJV4KJ2awvydz9Q)

**本文为译文，采用意译。**  

`CSS` 大约有两百个属性。很多属性都是相互关联的，理清楚每一个属性细节是不可能的。所以，本文分享一些有用的 `CSS` 小技巧，方便开发者和设计师参考。

### 1. 打字效果

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6QO1G5jUUSeZyCn5mpBfmbmKOiaudqa9A9kSGxxeHCDiakbYePwib21MjQ/640?wx_fmt=other)Typing-effect-for-text.gif

网页设计变得越来越有创意。在 `CSS` 动画的协调下，你的网页会像活的一样。在这个例子中，我们将使用 `animation` 和 `@keyframes` 属性去实现打字效果。

具体来说，在这个演示中，我们通过 `steps()` 属性来实现分割文本的效果。首先，你必须指定 `step()` 中传入的数量，在这个例子中就是文本的长度。

接着，第二步，我们使用 `@keyframes` 去声明什么时候开始执行动画。

> 如果你在文本 `Typing effect for text` 后面添加内容，而不改变 `step()` 中的数字，将不会产生这种效果。

这种效果并不是特别新鲜。然而，很多开发者却使用 `JavaScript` 库去实现，而不是使用 `CSS`。

代码片段

### 2. 透明图片阴影效果

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6bu4HdmEZUVricrylKksv3YN3rwKpL9xTh7gJ52jLNj80GBwxibogicvkA/640?wx_fmt=other)Shadow-for-transparent-images.png

你是否使用过 `box-shadow` 为透明的图片添加阴影，却让其看起来像添加了一个边框一样？然而解决方案是使用 `drop-shadow`。

`drop-shadow` 的工作方式是，其遵循给给定图片的 `Alpha` 通道。因此阴影是基于图片的内部形状，而不是显示在图片外面。

代码片段

### 3. 自定义 Cursor

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6GpV0g4x5kUfXJMgjnW3mibZU7dxIxtwNoiaREth6JNe7P6Qu25FwTCRQ/640?wx_fmt=other)Set-a-custom-cursor-with-CSS.gif

你不需要强迫你站点访问者使用独特的光标。至少，不是出于用户体验的目的。不过，关于 `cursor` 属性要说明的是，它可以让你展示图片，这相当于以照片的格式显示提示信息。

一些用户案例，包括比较两个不同的照片，你无需在视图窗口渲染这些照片。比如：`cursor` 属性可以用在你的设计中，节省空间。因为你可以在特定的 `div` 元素中锁定特定的光标，所以在此 `div` 这外可以无效。

> 目前尝试对图片的大小有限制，读者可以自行更改验证

代码片段

### 4. 使用 attr() 展示 tooltip

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6Ie0gztvdQlp1q5BxjyacoTXbAEFWX36pqFkVZz7SicCK54RmgLZ4D9g/640?wx_fmt=other)CSS-tooltip-using-attr-property.gif

`attr()` 属性是我最近发现的，且是最得意的发现。我本打算为我的站点添加 `tooltip` 的功能，但是发现需要引入一个插件，这就引入了不必要的东西，让我的站点看起来臃肿。感谢的是，可以使用 `attr()` 来避免这种情况。

`attr()` 属性工作的方式很简单，我逐步解析一下：

*   我们使用 `tooltip class` 去标志哪个元素需要展示 `tooltip` 信息。然后为该元素添加你喜欢的样式，这个方便演示，我们使用了 `dotted border-bottom` 的样式。
    
*   接下来，我们创建一个 `:before` 伪元素，它将包含内容 `content`，指向特定的 `attr()`。这里指 `attr(tooltip-data)`。
    
*   接着，我们会创建一个 `:hover` 伪类，当用户鼠标移动道元素上时，它将设置 `opacity` 为 `1`。
    

此外，你可以包含自定义的样式。这取决于你设定的 `tooltp` 的数据，你也许需要调整其宽度或者边距。一旦你设定了 `tooptip-data arrt()` 类，你可以在你设计的其他部分应用。代码片段

### 5. 纯 CSS 实现核算清单

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6nUM6ZRsFugEtcsWJhBXAhTfwOZ6dno7lhEayibCtHGtGwJUOBCJcHsg/640?wx_fmt=other)Item-Checklist-with-CSS.gif

正如我开头所说的，`CSS` 正逐步成熟。这个动态清单的演示就是一个很好的例子。

我们使用 `checkbox` 输入类型，加上一个 `:checked` 伪类。当 `:checked` 返回 `true` 的情况时，我们使用 `transform` 属性更改状态。

你可以使用这种方法实现各种目标。比如，当用户点点击指定的复选框时候，切花到隐藏其内容。在输入 `input` 类型的单选和复选框使用，当然，这也可以应用到 `<option>` 和 `<select>` 元素。

代码片段

### 6. 使用 `:is()` 和 `:where()` 添加元素样式

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6LGG8AI5dVKUDPuH5ooduxGGBV75eY0f4NXSZicH6fdyLCXznFrc48Rw/640?wx_fmt=other)CSS-is-and-where-properties.png

现代 `CSS` 框架运行的一种方式是通过使用**条件逻辑选择器**。换言之，`:is()` 和 `:where()` 属性可以用于同时设置多种设计元素的样式。但是，更重要的是，你可以使用这些属性去查询你需单独处理的元素。

下面的 `CSS` 片段是一个小案例，你可以通过 `MDN` 学习更多关于 `:is()` 和 `:where()` 的内容。

代码片段

### 7. 使用关键帧实现手风琴下拉效果

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6E9CZ7ZDLwb9BzO7HPuVH88yC9MibwHeDB173ySk8uX6hEOdam9gcuzw/640?wx_fmt=other)Accordion-dropdown-using-keyframes.gif

`JavaScript` 库，比如 `jQuery, Cash` 等，即使你想使用一个简单的缩放功能，你都要整个引入。幸运的是，很多 `CSS` 技巧能够避免这种引入。比如下面的手风琴片段代码。

如果你认真看下当下 `web` 设计的趋势，你会发现在登陆页面就会发现手风琴这种设计效果。这是一种简缩内容的方式，以节省设计空间。常见问题解答，产品功能，使用提示等功能，都可以放在手风琴内实现。下面是纯 `CSS` 代码片段对其的实践。

代码片段

### 8. 侧边栏的 Hover 效果

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU69ibK2TMkGeXeiawBezwjadm2W1YrEqkFbPU1uzkrziaUIaydcRskZI4qg/640?wx_fmt=other)Hover-effect-sidebar.gif

有没有可以使用 `CSS` 就可以实现一个动态 `Hover` 效果的侧边栏呢？当然，这得多亏 `transform` 和 `:hover` 属性。

为了兼容性，我在多种移动端中进行测试，感觉还不错。虽然这种效果在桌面中使用比在移动端中使用顺畅。

在这个练习案例中，使用 `position: sticky;` 创建一个吸附的侧边栏，其工作的效果良好。

代码片段

### 9. 使用 first-letter 实现首字母大写

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU6ZvvlElUec79iaEhRALVsdNgzhunlUb9Qe8VQzYjxuz1QZ93ohwBuIQg/640?wx_fmt=other)letter-dropcap-using-css.png

在 `CSS` 中，可以选择确定的 `first-of-type` 元素。在这个例子中，我们使用 `::first-letter` 伪类去实现首字母大写的效果。这个类可以让我们更自由的添加样式。所以，你可以调整大写字母的样式以符合你的站点设计风格。

说到这个属性，你可以使用它干很多事。当特定元素在页面中第一次出现，我们可以使用 `first-of-type` 单独进行添加样式。但是，正如下面代码展示，尽管元素已经出现过，你依然可以使用在多个元素上。

代码片段

### 10. 使用 ::before 添加按钮的图标

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlicbQm56emLmZcaf0rzIwU63PSMnxTOCGvcN7TKzQdlicc3raRibTDERFJvK4oXgDvIH4sXguCpicypw/640?wx_fmt=other)Add-an-icon-before-buttons-using-CSS.png

每当我需要链接到外部其他资源的时候，我都会使用自定义的按钮来实现。准确来说，是一个添加图标的按钮。简单的谷歌搜索，你会发现很多 `button generators` ，但是我对可以随时使用的通用解决方案更感兴趣。

所以，为了实现这个目标，我为特定按钮创建了一个 `:before` 伪元素。需要声明的是，代码片段中的 `content:"\0000a0";` 是 `&nbsp;` 的 `Unicode` 转义。

你可以通过宽高属性来调整图标的尺寸，以更好适应按钮样式。

代码片段

最重要的一点，这些 `CSS` 技巧凸显了不使用 `JavaScript` 来实现功能的潜力。你可以使用上面这些小技巧，应用在你的设计上。事实上，很多这样的例子可以混合使用，以创作自由风格的设计。

当然，这还需要更大的进步空间。我不建议单纯的这些小技巧就低估了框架和库的使用。。

但是，不需要写冗长的 `JavaScript` 函数，通过 `CSS` 来实现设计的效果正走在路上。

原文：10 Useful CSS Tricks for Front-end Developers[2]

【完】✅

关于本文  

作者：Jimmy
========

https://juejin.cn/post/7089997204252786702

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 「在看」，让更多的人也能看到这篇内容

2、关注官网 https://muyiy.cn，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 「加群」 ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《  

  

```
最后不要忘了点赞呦！

祝 2022 年暴富！暴美！暴瘦！
```