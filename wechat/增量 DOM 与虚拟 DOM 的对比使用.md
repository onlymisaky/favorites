> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/u_5oDiu1Fk2feNS0REizog)

关注 前端瓶子君，回复 “交流”

加入我们一起学习，天天进步

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQlv5NReBs4pyVdHE28JER268L1aYpibxnWtO2VdeicXVlRgrb1dvTewNLlpYAbWicGuBVoaWZrpxCRQ/640?wx_fmt=jpeg)

如果你熟悉 React，你大概听说过虚拟 DOM 的概念。React 受欢迎的主要原因之一就是通过虚拟 DOM 提高用户界面性能。  

然而，当 Angular 在 2019 年发布他们新的渲染器 Angular Ivy 时，很多人想知道为什么他们选择了增量 DOM 而不用虚拟 DOM。尽管如此，Angular 还是坚持这个想法。所以你可能会想，为什么 Angular 一开始就使用增量 DOM，并且还在继续使用。请跟随本文一探究竟。

首先，让我们从虚拟 DOM 开始，了解它是如何工作的。

#### 虚拟 DOM 的工作方式

虚拟 DOM 的主要概念是在内存中保留 UI 的虚拟表示，并使用协调（reconciliation）过程将其与真实 DOM 同步。该过程包括三个主要步骤：

*   当用户 UI 发生变化时，将整个用户 UI 渲染到虚拟 DOM 中。
    
*   计算之前虚拟 DOM 和当前虚拟 DOM 表示形式之间的差异。
    
*   根据变化差异更新真实 DOM。
    

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviaU6WqVw8GVVYbJ2oXicDOvvGlIAbuS1B2mhvwYeiahBAodneCxFVfxRjX2MzOWg3ZXfbJyyuSD2e8g/640?wx_fmt=png)

现在你已经对虚拟 DOM 有了一个基本的了解，接下来让我们来深入了解一下增量 DOM。

#### 增量 DOM 的工作方式

增量 DOM 通过使用真实 DOM 来定位代码更改，带来了一种比虚拟 DOM 更简单的方法。因此，内存中不会有任何真实 DOM 的虚拟表示来计算差异，真实 DOM 仅用于与新 DOM 树进行差异比较。

增量 DOM 概念背后的主要思想是将每个组件编译成一组指令。然后，这些指令用于创建 DOM 树并对其进行更改。

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviaU6WqVw8GVVYbJ2oXicDOvvMQAF7eIo9ao2icC2EJpzWYCAecfoJGKaaMWht4mOcASX6ZXIHUicQaQQ/640?wx_fmt=png)

#### 增量 DOM 如此特别的原因

看完上面的解释后，你一定已经得出结论，认为增量 DOM 要简单得多。这还不是全部。

> 增量 DOM 的真正优点是它优化了内存的使用。

当涉及到手机这类低内存容量的设备时，这种优化变得非常有用。而且，优化内存使用不是一件容易的事情。此外，应用程序的内存使用完全取决于包的大小和内存使用。

让我们看看增量 DOM 是如何帮助我们减少包的大小以及降低内存使用的。

##### 1. 增量 DOM 拥有 Tree Shaking 特性

Tree Shaking 不是什么新事物，它是指在编译目标代码时移除上下文中未引用代码的过程。

增量 DOM 充分利用了这一点，因为它使用了基于指令的方法。如前所述，增量 DOM 在编译之前将每个组件编译成一组指令，这有助于识别未使用的指令。因此，它们可以在编译时进行删除操作。

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviaU6WqVw8GVVYbJ2oXicDOvvzghT9vY6jfQ4HDOUDvUYxR3YZzVyyTHHibViaYG06UDicoib7BamErnD0A/640?wx_fmt=png)

虚拟 DOM 不能够 Tree Shaking，因为它使用解释器，并且没有办法在编译时识别未使用的代码。

##### 2. 减少内存使用

如果你明白虚拟 DOM 和增量 DOM 的主要区别，你就应该已经知道这背后的秘密了。

与虚拟 DOM 不同，增量 DOM 在重新呈现应用程序 UI 时不会生成真实 DOM 的副本。此外，如果应用程序 UI 没有变化，增量 DOM 就不会分配任何内存。大多数情况下，我们都是在没有任何重大修改的情况下重新呈现应用程序 UI。因此，按照这种方法可以极大地节省设备的内存使用。

![](https://mmbiz.qpic.cn/mmbiz_png/meG6Vo0MeviaU6WqVw8GVVYbJ2oXicDOvvKrTdlq3wnFWbe5KHy4l6NziaUvml0v8uicP68r6ibicAbdtg8RaWmB6IKg/640?wx_fmt=png)

增量 DOM 似乎有一个减少虚拟 DOM 内存占用的解决方案。但是你可能想知道为什么其他框架不使用它？

##### 这里存在一个权衡

虽然增量 DOM 通过按照更有效的方法来计算差异，从而减少了内存使用，但是该方法比虚拟 DOM 更耗时。

> 因此，在选择使用增量 DOM 和虚拟 DOM 时，会对运行速度和内存使用之间进行权衡。

#### 最终思考

在这两种文档对象模型（DOM）中，虚拟 DOM 长期以来一直处于领先地位。可以说 “虚拟 DOM 之所以流行是因为 React 流行”，另一方面 React 主要得益于这个虚拟 DOM 的特性。

因此，很明显虚拟 DOM 提供的速度和性能提升有助于 React 与其它框架竞争。

##### 虚拟 DOM 的优缺点

让我们看一下虚拟 DOM 的一些主要优点：

*   高效的 diff 算法。
    
*   简单且有助于提升性能。
    
*   没有 React 也能使用。
    
*   轻量。
    
*   允许构建应用程序且不考虑状态转换。
    

> 虽然虚拟 DOM 快速高效，但有一个缺点：

这个区分过程（diffing process）确实减少了真实 DOM 的工作量。但它需要将当前的虚拟 DOM 状态与之前的状态进行比较，以识别变化。为了更好地理解这一点，让我们举一个小的 React 代码示例：

```
function WelcomeMessage(props) {
return(
<div class>
Welcome{props.name}
</div>
);
}
```

假设 props.name 的初始值是 Chameera ，后来改成了 Reader。整个代码中唯一的变化就是 props，不需要改变 DOM 节点或者比较 `<div>` 标签内部的属性。然而，使用 diff 算法，有必要检查所有步骤来识别变化。

我们在开发过程中可以看到大量这样的微小变化，比较用户 UI 中的每个元素无疑是一种开销。这可以被认为是虚拟 DOM 的主要缺点之一。

然而，增量 DOM 为这个大量内存使用问题提供了一个解决方案。

##### 增量 DOM 的优缺点

正如我前面提到的，增量 DOM 通过使用真实 DOM 跟踪变化，提供了一个减少虚拟 DOM 内存消耗的解决方案。这种方法大大降低了计算开销，也优化了应用程序的内存使用。

所以，这是使用增量 DOM 相对于虚拟 DOM 的主要优势，我们可以列出增量 DOM 的其他优点：

*   易于与许多其他框架结合使用。
    
*   简单的 API 使其成为强大的目标模板引擎。
    
*   适合基于移动设备的应用程序。
    

在大多数情况下，增量 DOM 不如虚拟 DOM 运行快。

虽然增量 DOM 带来了减少内存使用的解决方案，但是该解决方案影响了增量 DOM 的速度，因为增量 DOM 的差异计算比虚拟 DOM 方法耗费更多时间。因此，我们可以认为这是使用增量 DOM 的主要缺点。

这两种 DOM 各有特色，我们不能只说虚拟 DOM 更好，或者增量 DOM 更好。然而，我可以肯定地说，虚拟 DOM 和增量 DOM 都是很好的选项，它们可以毫无问题地处理动态 DOM 更新。

以上就是本文全部内容，感谢大家阅读！

关于本文 译者：@前端 zenblo 译文：https://github.com/xitu/gold-miner/blob/master/article/2020/incremental-vs-virtual-dom.md 作者：@Chameera Dulanga 原文：https://blog.bitsrc.io/incremental-vs-virtual-dom-eb7157e43dca

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

欢迎关注「前端瓶子君」，回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持