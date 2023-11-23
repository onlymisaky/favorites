> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/VguoRHJJXE90LEunkCY0bQ)

前言
--

其实，最早接触 Headless UI 是在去年，碰巧看到了一个非常前沿且优秀的组件库 ---- Chakra UI，这个组件库本身就是 Headless UI 的实践者，同时也是 CSS-IN-JS 的集大成者。

我当时看过之后，就对该理念产生了很大的兴趣，同时工作中也正好有机会实践（着手公司开源组件库大版本重构），因此对该理念也有一定的实践经验。

那么今天，也是想和大家分享介绍下这项还算前沿的技术，另一方面是也算是个人的一份技术总结，这里也希望感兴趣的小伙伴可以在评论区探讨。

契机：React Hooks 的诞生
------------------

React Hooks 可以说是 Headless UI 得以实现的基石，为什么这么说，这里我们首先聊聊 React Hooks。

### React Hooks 是什么

我们都知道，React Hooks 是在 V16.8 版本诞生了，是它让我们的函数组件真正拥有了状态。如下图，我们以数字累加这个功能举例，可以看到对于同样的功能，React Hooks 的写法相对于过去类组件的写法从代码上会减少一丢丢。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAespDTckkkiatvsIdFPx0axexb9TlpGibibKTa3177gibTU2lAj99Kick3xIQ/640?wx_fmt=png)

但仅仅是因为如此才支持它吗？

我们要知道，在 React v16.8 之前，一般情况下，普通的 UI 渲染直接使用函数组件就好，需要使用 state 或者其他副作用之类功能时，才会使用类组件。

两者分工也算合理，那么 hooks 的诞生又是为何？仅仅是为函数组件赋能吗？从使用者的角度来说，这显然说不过去，徒增了学习成本不说，还多了一个纠结选项（函数组件 vs 类组件）。

### React Hooks 的意义

所以，事情并没有那么简单。我们可以推断，对于 hooks 它肯定解决一些 “**「类组件存在的不足或痛点”」** ，这里就不卖关子，罗列 2 点：

1.  状态逻辑在组件之间难以复用
    

在过去，状态逻辑的复用往往会采用高阶组件来实现。但劣势也非常明显，需要**「在原来的组件外再包裹一层父容器。」** 导致层级冗余，甚至嵌套地狱，引来了很多吐槽点：

*   增强调试的难度
    
*   拉低运行的效率
    

相信使用 Redux 的同学都知道，为了快速状态管理到组件的注入，会使用 `connect` 对组件进行包裹，但是随着项目迭代，打开 DevTools 查看时发现 DOM 往往臃肿不堪。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeP9p141vEP0EFHKlUY6gmM4WA7m4Hj1bB3LK2LBNs7QYEK9CgiacbkmA/640?wx_fmt=png)

2.  复杂组件变得难以理解和维护
    

复杂组件本身就很复杂，但是类组件让其变得更贱难以理解和维护。比如：在一个生命周期函数中往往存在**「不相干的逻辑混杂」**在一起，或者**「一组相干的逻辑分散」**在不同的生命周期函数中，这里分别举个例子：

*   在 `componentWillReceiveProps` ** 中往往写入不相干 props 更新渲染的判断逻辑），对于一次更新，往往会有一些无效的执行，拉低执行效率
    
*   在 `componentDidMount` 中注册事件，在 `componentWillUnmount` 中卸载该事件），往往容易写出 bug 甚至忘记。
    

长期以往我们的代码只会变得糟糕难懂。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAezwucPyx8snRhSfNuytNBfnTnCD0Dtibp1VMKIyXdggmiadE0u9uCeJyA/640?wx_fmt=png)

### React Hooks 对组件开发的影响

通过 React Hooks，我们可以把组件的状态逻辑抽离成自定义 hooks，相干的逻辑放在一个 Hook 里，不相干的拆分成不同的 hook，最终在组件需要时引入，实现状态逻辑在不同组件之间复用。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeZJHjDyUMXWiaGb68jydPEwxaYNEUh1pnPexWU3G004649MPgWmPNY1w/640?wx_fmt=png)

正是因为 React Hooks 的诞生，使 Headless UI 组件在技术上成为可能，这也是它为什么最近才开始流行的原因。

什么是 HeadLess UI
---------------

### Headless UI 的定义

Headless UI 目前社区还在探索实践阶段，这里我对它做了个简单定义：Headless UI **「一套基于 React Hooks 的组件开发设计理念，强调只负责组件的状态及交互逻辑，而不管标签和样式。」** 其本质思想其实就是关注点分离：将组件的 “状态及交互逻辑” 和“UI 展示层”实现解耦。

### Headless UI 组件

从实体上看，Headless UI 组件就是一个 React Hook。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeFjx1hZsRuKZOty3FV7icqGl7DiaYI9PetUNcTMnZVcOypuQO0Cicd5cWA/640?wx_fmt=png)

从表象上来看，Headless UI 组件其实就是一个什么也不渲染的组件。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeulMRIHBkHDNoUtib3giaxHclcLurluibUgOjs7geCUVWibRvicoePTic0f5A/640?wx_fmt=png)

为什么会有 Headless UI
-----------------

那么我们为什么需要一个啥也不渲染的组件呢？

这里我们还是以数字加减这个功能举例，先思考设计实现一个数字加减器 `Counter` 组件。

### 传统版组件的设计痛点

按照传统的模式，我们可能会直接去编写导出一个名字叫 `Counter` 组件，然后使用上直接渲染它即可，对于组件的功能通过 props 设置，比如非受控初始数字值。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAe9NBPOOQS46Rh7WUCh0icIicBxxWwAicEAlCWHWICrMaBva5OtJF6cDFRA/640?wx_fmt=png)

那么这么做有什么满足不了的痛点呢？我们这里随便举个场景，然后分别来从**「组件的使用者、维护者以及服务的产品」**三个角度来分析下。

#### 使用者 - 高定制业务场景如何实现满足？

现在我们业务有这样的诉求：左右两个加减按钮要求支持长按后悬浮展示 Tooltip 提示。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeC6ELov4xWY9KAejLT68MQZhr7f9ub1PAB3Z7dhk23vLHWx3m2p6MVg/640?wx_fmt=png)

其实从产品角度这个需求很朴实，提升交互体验嘛。但是如果按照之前传统的组件设计，那就头疼了。它一整个都是组件库里面暴露出来的（假设哈），怎么去侵入到里面给加减按钮加 Tooltip 呢？

其实，对于组件这样定制业务场景的诉求，我们一般解决思路可能是这样：

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeECibWOZmb0osPkic5REDuZxS6VoiaFl1Nb1Sp1QbMGO2352IVmKXOwicOQ/640?wx_fmt=png)

随着方案越往后选择，我们的代价是越来越高的，脸上的痛苦面具也越来越明显。

#### 维护者 - **「组件」** **「API」** **「日趋复杂，功能扩展 & 向下兼容的苦恼？」**

对于维护者而言，如果要去满足这样的诉求，那么他可能会这么做。

一开始，需求比较简单，我们可以通过新增 API 动态注入要实现的功能，对于上面的诉求，我们可能会新增 `xxxButtonTooltipText` 之类的 API 来实现 Tooltip 文案的配置；

一周后，又需要加减按钮支持 Icon 自定义，我们可能会添加 `xxxButtonText` 之类的 API 来满足；

又过了 2 周，我们又想支持 Tooltip 展示方位配置，避免遮挡核心内容展示，我们可能会添加 `xxxButtonTooltipPlacement` 。。。

日复一日，组件 API 数快速扩展，最后，维护者发现实在忍受不了了，决定尝试使用 `Render Props` 设计，以此一劳永逸，于是新增了 `xxxButtonRender` 支持加减按钮自定义函数渲染。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAe1vqgONc8CnGbAk1IWLCcLklFL2l8Bdpb6sP1rlPuibbHedATJhFwQMQ/640?wx_fmt=png)

我们发现，通过这么做，一个简单的组件变得日趋复杂，不仅仅存在功能冗余实现，而且后面还要考虑功能扩展以及向下兼容，脸上的痛苦面具也逐渐明显。

另外，对于使用者，当想使用一个组件发现有几页的 API 数量时，也会浅叹一声，功能难以检索到，而且大部分可能都不需要，面对性能优化也难以入手。

#### **「产品：如何快速打造好用定制的品牌」** **「UI」** **「？」**

对于一个产品，最重要的一点就是塑造产品本身的品牌形象和产品特色。对于用户最直接接触的 UI 交互，那更是至关重要。那么**「如何快速打造好用定制的品牌 UI 呢？」**

还是以数字加减器举例，那么，它的好用可能体现在它具备较为完善且好用的能力。

*   点击加减按钮：数字加减步长
    
*   Accessibility 可访问性
    
*   数字值最大最小值控制
    
*   ... ...
    

对于它的定制，可能体现在它 UI 视图层上的差异化。如下图，仅仅是 `Counter` 这种小组件，就有五花八门的 UI 形态。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAe38xic30tkhOvAEzFxYF9IJs3RFmVnKSz2pBpZsJl8n9IlW90Scs56cw/640?wx_fmt=png)

### Headless UI 的解法

从上面的分析我们可以看到，**「UI」** **「是一个自由度非常高的玩意，而构建 UI 是一种非常品牌化和定制化的体验。」**

那么，我们能不能**「只需复用组件的交互逻辑，布局和样式完全自定义」**呢？显然，Headless UI 就是干这件事情的。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeiaO13yXCH81UqmP7ApsK6lIYde9PeB3ibNhDRyFbbsC5fDJWOyGa2iaVg/640?wx_fmt=png)

对于 Headless UI 组件，我们要做到第一件事，就是分析和抽离组件的状态以及交互逻辑。对于 `Counter` 组件，它的状态逻辑大致如下：

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAe1tOrvmicgTBIHTl9zRVVRPWNS8EoQ5AfDqibR2PkE07P8kAqto4CHUFQ/640?wx_fmt=png)

我们把这些状态逻辑收敛到一个叫 `useCounter` 的 React Hook 中。它接收用户传入的功能 API 设置，然后返回一套已处理过的全新 API。

对于用户而言，我们只需把返回的 API 赋予到想赋予的标签上，那么就得到了一个**「只带交互能力的无头组件。」**

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAenD8ovssczgw55iaibDwAMj5lPt7bicsSiaQnta4L84TEUw8I5MUWjpD04w/640?wx_fmt=png)

最后，我们结合设计稿进行 UI 还原，对编写自定义样式，最终就能实现一个全新数字加减器组件了；

另外，我们还可以将标签重新排版，然后样式改吧改吧，将按钮绝对定位一下，最终就能实现一个数字输入框组件；

除此之外，我们还可以基于它封装，比如原本的最大值表示总页数，插入到标签中间，样式再改吧改吧，就能实现了一个迷你版的分页器组件了。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAebeJTu1HB7awTH2sQyxYFbaD66P0C2rfdP1bibfiakFh67Q5hb7Qx4bDQ/640?wx_fmt=png)

可以看到，通过 Headless UI 的设计思路，我们最终产出了一个叫 `useCounter` 的 React Hook，**「通过它，我们不用关心组件最为复杂且最通用的部分 ---- 交互逻辑，而是把它交给组件维护者管理；而对于经常变化需要定制的 UI 部分完全由我们自由发挥，从而实现最大化地满足业务高定制扩展的诉求，同时，也尽可能实现代码的充分复用。」**

Headless UI 的优与劣
----------------

这里我们简单梳理下 Headless UI 的优势和劣势，以及目前建议的适用场景，方便大家做技术选型和学习。

### 优势

*   **「有极强大的」** **「UI」** **「自定义发挥空间，支持高定制扩展」**
    

可以看到 headless 的优势也非常明显，因为它更抽象，所以它拥有非常强大的**「定制扩展能力：支持标签排版、元素组合，内容插入、样式定义等等都能满足。」**

*   **「最大化代码复用，减小包体积」**
    

从上面可以看到，组件的状态逻辑可以尽可能达到最大化复用，帮助我们减小包体积，增强整体可维护性。

*   **「对单测编写友好」**
    

因为基本都是逻辑，对于事件回调、React 运行管理等都可以快速模拟实现单测编写和回归；而 UI 部分，一般容易变化，且不容易出 bug，可以避免测试。

### 劣势

*   **「对开发者能力要求高，需要较强的组件抽象设计能力」**
    

抽象层次越高，编写难度越大。对于这样 headless 组件，我们关注的组件 API 设计和交互逻辑抽离，这非常考验开发者的组件设计能力。

*   **「使用成本大，不建议简单业务场景下铺开使用」**
    

UI 层完全自定义，存在一定开发成本，因此需要评估好投入产出，对于没有特别高要求的 2b 业务的话，还是建议使用 Ant Design 这样自带 UI 规范的组件库进行开发。

Headless UI 的生态与展望
------------------

### 社区生态

关于组件，目前在国外已经有些探索和实践的案例，比如 React-Popper、React-Hook-Form、TanStack-Table，三个是组件库 “三大难”，它们 stars （均上万）和活跃度都非常高，未来基于 headless UI 设计实践的组件只会越来越多。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeiccTTro87jxITEBk5seDtib2t5TWH8tcBeSA389kxgaQucM1C13iaI0cQ/640?wx_fmt=png)

关于组件库，我目前看到的比较不错的实践就是 Chakra-UI 组件库，整个组件库采用分层架构（这里以数字输入框组件为例）：

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAenMVhgbGpsicoBzmLwEt4UIlBgCOoeNC0j1oBQ7vuUg7JooyHn0IkEnQ/640?wx_fmt=png)

*   **「底层」**使用 Headless UI 那一套模式，对外暴露相关的 React Hook，**「保证整个组件的高定制扩展的诉求能得到最大化满足。」**
    

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAebVnWHJPnxhqG4vqWhtJOhHo9zjFRZpJufiazic7x9zlyROWXQnk8DdSw/640?wx_fmt=png)

*   而**「上层」**则提供了类似于 Ant Design 这样的组件，自带默认的 UI，但不同的是每个组件都是由颗粒度更小且必要的原子组件构成，可以直接引入它们使用，这样又**「保证大部分简单或普通的场景可以快速实现并满足。」**
    

> 注意：其实一个组件拆分成多个必要的原子组件构成，其实也算是 Headless UI 的一种实践形态，把交互逻辑生效的 API 直接绑定在必要的元素标签上，然后以原子组件暴露出来，标签的排版和样式修改也完全可以由用户自定义。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeZT65qq3U4S3VcO56tUI0WLzTDKdClcFPBfrZqzRicgUxHWTDGupXhag/640?wx_fmt=png)

另外，在 React Next 2022 大会上，也有嘉宾分享介绍 Headless UI 相关的理念，整个社区目前都处在持续发酵的阶段。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAeYXQj34iaTCh5PjegCREdSRjDDbL1qIYupeaC8qjF1UlicOp9LE9ve2jg/640?wx_fmt=png)

### 未来展望

**「个人认为 Headless」** **「UI」** **「是未来 React 组件库底层的最佳实践。」**

对于组件库而言，可能大家都不需要读书借鉴了，而是都使用同一套组件的底层状态以及交互逻辑，在 UI 层以及细节上再进行品牌、场景定制化扩展。

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdQB6ne45Ke8TLpEAHFia2dAelkA193y3TeRQ7fKRFJBH8MF1ibrgUNllnwfnY6Sia1ptcTdtSicWiaaCOA/640?wx_fmt=png)

总结
--

那么，以上就是关于 headless 设计理念的全部内容。**「通过 Headless」** **「UI」** **「，我们可以快速复用组件的状态以及交互逻辑，对于布局和样式实现完全自定义」**。

另外，**「Headless」** **「UI」** **「是一个组件库设计的新思路，也是未来组件库必然的趋势」**。对于前端同学而言，学习了解它也显得尤为重要。

值得一提的是，在日常开发中，我们也可以尝试借鉴这样的思路，**「将通用状态逻辑抽离出去，方便复用，帮助我们在日常开发提效」**。比如：常见的筛选过滤、分页请求列表数据的逻辑等；甚至，我们还可以将业务逻辑同 UI 交互进行抽离，比如：在**「多端场景（Web」** **「PC」** **「端、小程序端、RN 端）复用同」**一套业务逻辑代码，实现业务逻辑复用和统一，以此大大提高我们的生产力。

参考
--

*   https://reactjs.org/docs/hooks-intro.html
    
*   https://medium.com/@nirbenyair/headless-components-in-react-and-why-i-stopped-using-ui-libraries-a8208197c268
    

> 完结。
> 
> 作者：不败花丶
> 
> Github：https://github.com/Flcwl