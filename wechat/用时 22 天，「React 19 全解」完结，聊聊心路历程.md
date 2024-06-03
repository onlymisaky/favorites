> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2UUGanUePTSpv-xknMUBBA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgP0hs7kYtIjBjcDg4NTic501GErFVsMUlyps93rq2vQ5H9hPSXyZpmZDA/640?wx_fmt=png&from=appmsg)

初次接触 React 19 的新特性时候，其实我非常懵，一篇官方文档的改动博客，并不能让我完全感受到这些新出的更改与 hook 有什么独特之处。

因此我花了一些时间去使用这些 hook，然后才猛然感受到 React 19 的独特魅力。在人机交互上，**这是一次巨大的进步。**

> ✓
> 
> 在以往的常规交互中，我们使用 Loading 样式作为页面的初始形态，但是当接口请求非常快的时候，Loading 的出现并快速消失并不是最友好的交互方式。因此，许多人提出了一种新的交互理念：那就是**先请求接口，再渲染页面**。而不是在渲染页面的逻辑中请求接口。

之前的交互方式如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPQqquI3KJRc5Ot1M5dicZl6ZUTqlvibsFnY9Qaia31icltO0rZ0FVwhk08g/640?wx_fmt=gif&from=appmsg)

新的交互方式如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPUbiaibG1mU3RZLusVTrcn1Nex4VrTww0rjV3LzNysA16N4ibfHibSXfojw/640?wx_fmt=gif&from=appmsg)

`当接口响应速度非常快时`，新的交互方式带来的用户体验提升明显是非常大的。并且这种交互方式在 iOS 上得到了广泛的应用。

但是在 React 项目中，这样的交互方式却很难普及。一个根本的原因就在于，**代码很难有效组织**。在之前组件化思维的指导下，我们很容易会想到，当前页面的数据，应该归属于当前页面。但是新的交互方式则要求数据请求的行为在页面实例化之前执行。那么数据的归属就必须要前置。

**请求行为和数据脱离于页面本身，是造成代码不好组织的根本原因。**

**除此之外，我们还需要花费额外的精力去控制组件实例的渲染时机，需要确保它在接口请求成功之后执行。这也是造成代码组织困难的原因之一。**

React 19 非常完美的解决了这个问题。在并发模式的基座之上，合理的结合 `use`、`Suspense`、`useTransition`、`useDeferredValue`，我们可以在保证代码非常简洁的情况下，轻松做到这样的人机交互。

因此，在这个层面上而言，React 19 必然会带来开发方式的变革。

当然，个别道友可能还无法理解我说的交互方式的提升，但是我们可以从代码层面上感受到变化：最直观的体现就是，我们可以不用在异步的逻辑中，使用 useEffect 了。与此同时，`Suspense`、`useTransition`、`useDeferredValue` 这些在 React 18 中比较小众的 api，将会成为主流。

基于这个原因，从一开始，我就对 React 19 充满了期待。随着学习的不断深入，我不断在多个实践场景中印证了自己的想法。连续一个月的深耕，也让我自身对 React 19 的使用与体验有了深厚的积累。

1
-

**写作感受**

写这本书的过程与之前写其他的书籍感受很不一样。因为在写这本小册之前，我也并没有非常了解 React 19 的深意。更多的是带着一种架构层面的最佳实践的猜想在思考。

因此，写作的过程，其实也是我自己不断学习和进步的过程。在这个过程中，我从群里许多大佬的探讨中获得了灵感，以及在文章评论区的讨论过程中获得了更多更好的方案。

还有一个不太一样的地方是，在写作初期，就有几位字节大佬以及远在海外工作的大佬，给我提供了比较丰富完整的真实交互场景。也是在探索 React 19 是否能完整实现这些场景的过程中，我找到了**最佳实践**。我把部分场景简化成了 demo 写在了文章中。

> ✓
> 
> 非常感谢他们

实际上这种开荒的过程非常有意思。

如果我只是停留在，学会一个 hook 的基础语法就完事的层面的话，其实我也无法快速感受到这些 hook 对于开发方式的改变带来的实际意义。我可能需要经历更长的时间才能 get 到原来应该这样做。

因此「React 19 全解」这本小册的独特意义在于，它完整的记录了我的进步过程，以及思考过程。它也代表了我这接近一月的学习成果。为了让道友们能够感受到这种过程，我也有意设计了一些非最佳实践的用法并改进它们。

2
-

**RN 将会变得更加出彩**

实际上，我们刚才提到的新的交互方案，在移动端会有更加亮眼的表现。因此可以预见的是，在 React 19 的加持之下，React Native 将会变得更加受欢迎。

在国内，关于 React Native 探讨并不算多。许多人在做跨端方案的技术选型时，还对 React Native 停留在性能表现不太好的那个层面。

然而实际上，React Native 针对性能问题，早已经历大量的重构升级工作，无论是新的 JavaScript 引擎 Hermes，还是新的底层架构 JSI，都极大的提高了 React Native 的性能表现。

在国外，React Native 依然是最热门的跨端方案。随着 React 19 的发布，以及目前国外热度非常高的 React Native IDE 的发布，React Native 将会迎来一次新的热潮。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPPskbaK43tkv2BNc6ZTbWvmDnCqQJlChVibDBibF4S3nFhVicadd576EVg/640?wx_fmt=png&from=appmsg)

2
-

**数据**

在公众号后台，每一篇文章都有比较详细的用户画像数据，由于 React19 是一个新东西，因此对新知识保持关注的人群我们可以笼统的认为这些人可以代表在行业里比较活跃的人。我们可以从这些数据中分析出来一些行情的真实情况。

例如，男女比例，女生只占了可怜的 5% 左右。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgP3dCldz6Yzzr8pFhk1uJ47dqM3GJOxky1AWQZskicy0eaMQNYMribE63w/640?wx_fmt=png&from=appmsg)

还有地域分布情况。可以看出，最卷的地方还是集中在广东、北京、上海、浙江、四川。也能侧面说明这些地区的工作机会应该是最多的

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPTFHY7xm1HsWnj6icSkyCURa8nj9kibOTykDNEgwQ2ibWKMIU2FYJz5ULg/640?wx_fmt=png&from=appmsg)

从年龄分布可以看出，年轻人的学习积极性是最高的。但是依然有大量的 35+ 的人对新知识保持了积极的热情。可以一定程度上说明这些 35+ 的人还在从事前端工作。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPZJYDTqBqiawQiaQt2K5fKjLN3nwjllBZpNJfcH5icmTKKsl1olbW7xRicQ/640?wx_fmt=png&from=appmsg)

还有一些其他比较有意思的数据。关注 React 19 的这些人中，使用 iPhone 手机的占了绝大部分，比 Android 手机的用户要多很多。

而 Android 手机中，小米又占了绝大部分，华为手机用户占比非常小。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPjVMztYubD9bd3yQbAaet1tNEFLL0pG0TgOsG4POXCA78TKYeZQEmgA/640?wx_fmt=jpeg&from=appmsg)

但是有意思的是，关注前端的用户群体中，Android 和 iPhone 用户是五五开的。因此从这个数据上可以得出简单粗暴的结论，大概率 React 相关的工作，平均薪资在前端开发中会略高一些。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPtw2co1RFRhgm1hGF0PNC0Mgb9LHagFP9kJmTSsN2M9TVKMTMfB6JaQ/640?wx_fmt=png&from=appmsg)

> i
> 
> > > 数据报表都来自于近期我个人公众号后台的真实数据

3
-

**恶意**

因为写的文章是公布在网上的，因此，不可避免的会遇到很多恶意。有的人甚至非常过分，追着后台私信不停的骂，我真的是服了。

**文章被抄袭**

一个比较离谱的是有个别读者，把我的文章，用 GPT 翻译成英文，然后跑去 medium 搞成会员文章...

**对 React 的厌恶**

有的人在评论或者私信骂我的语言中，明显表达了对 React 的厌恶。他们的观念里，认为 React 这么垃圾的东西，搁着可劲吹，就不能学点先进的东西吗？

React 明明代表了落后...

我都懒得解释了，自便吧。

**对于新知识的抗拒**

有的人是觉得又出新的东西，表现出来比较明显的抗拒情绪。然后连带着我把我也怼进去了。

事实上，有新的东西出来，说明是要解决新的问题。如果在你的工作环境中，你觉得这不是问题，那实际上本来也没必要学新的东西。

因此，我并非推崇所有人都对新知识保持热情。因为可能对有的人来说，时机未到。如果你哪一天看到了问题，再把它当成解决方案学习就行了。

但是有的人并不能正确看待这个问题，他对于自己的落后是比较焦虑的，因此他学习新知识的初衷就不对，如果担心自己跟不上，学得没有别人快，自然会不希望新知识的出现。

**对于行业未来的焦虑**

我从他们有些人的恶意中，能感受到一种对于行业未来的焦虑。他们觉得前端都要消亡了，还费劲学这些新知识干啥。**赶紧考虑转行才是正途。**

有个别哥们，怼了我之后，还希望我多分享一点副业相关的东西。真是对我寄予厚望！！

首先我必须明确表明，我并非没有帮助别人发展副业，这件事情我一直在做。但是，我也并不赞同程序员随意发展副业。因为大多数人，**在主业和副业上，根本分不清主次。**

**副业的意思，就是投入次要精力，在空闲时间去做的事情**。但是很多人发展副业，是抱着把副业做大做强的心态去搞的，因此他们会在这个期间投入大量的精力，甚至于主业都不管不顾了，他还会从心里认为，主业耽误了副业的发展，对打扰他的领导、同事报以恶意。

很自然的，最终也会导致主业搞得一团糟。

> ✓
> 
> 最搞笑的是，他们还会以此为结论，出来给周围的人说，你看吧，我又失业了，给别人打工果然没前途... 还是得搞自己的事业才有前途

事实上，大多数情况下，主业上取得稳定收入和一定的成绩，远比副业要容易得多。

对于大多数人来说，无论行情怎么样，给别人打工，依然是最靠谱，最稳定、最高的收入渠道。

> !
> 
> > 这些都是前辈们血淋淋的教训啊

很多时候，发展副业，更多的是一种机遇。比如我有一个学生，因为英语非常好，在外企混得风生水起。这个时候，有许多其他的同学想进外企，我就可以牵线搭桥，让他帮忙教一教英语。这样他的副业自然就做起来了，成功转型为专门帮助程序员进入外企的 1V1 私教老师。但是有的人可能只看到了他副业做得好，这个时候，可别忽略了他在主业上也取得了非常不错的成绩，积极争取内部晋升，并且得到了一个不错的结果。

4
-

**总结**

「React 19 全解」 这本小册，被收录在我的个人小程序「前端码易」中，可**长期免费阅读**。目录如下

> ✓
> 
> 赞赏本文任意金额，可获得所有的案例源码，加我好友 `icanmeetu`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPYS5qT4RZ67pQU94xuh6gYgcKbTqEeGC8JVCNH88VhbKnckEqFdT1Yw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPSfzomxibKn4U68GdRGLpVo8FINkbpzicVwrwkW1ciayoetTmQFFvT7tPA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEiboGdLUpXnKHsMceg1cFgPEynxeI23ia2boCAl5dWdyQdv5KyYEpficIcNWZlFnT9ia0fQiaeyYGPZIw/640?wx_fmt=png&from=appmsg)