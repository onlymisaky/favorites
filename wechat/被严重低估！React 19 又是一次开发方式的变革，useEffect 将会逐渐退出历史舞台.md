> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Bmd1sLXyaijg60wQAt9diQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEKcF9x2vwpIJMg0a9UjdrFR3ISUSpFiaT0RA0WBP4QZN0QUVTKKdS0qJHicTvbx0p6GHx1EeSRMd6A/640?wx_fmt=png&from=appmsg)

我写这篇文章的时间是 2024.05.04，React 团队将会在 11 天之后，举办 React conf，届时 React 19 正式版应该会发布。这个时间点，距离 React 18 正式发布已经过去了整整两年。

虽然当前还没有正式发布，但是我们已经可以在 npm 上下载 React 19 beta 版本在项目中尝鲜体验。

目前写 React 19 的文章已经有很多很多了，但是，写到点子上的并不多。包括官方文档，只是简单的罗列出了它新增了一些 hook，一些特性，却并没有进一步说明这些 hook 背后所代表的含义，它们的最佳实践是什么。

以至于，在这个时间节点，期待 React 19 的人也并不是很多。

但是，我要告诉大家的是，**我们都严重低估了 React 19**。

beta 版在 npm 上可用之后，我就创建了一个项目，把 React 新增的特性都使用了一遍。如下图所示。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEKcF9x2vwpIJMg0a9UjdrFl3icWib5CvKEbfra3UVa3RD7qs5R6Fbek047oed019zBU06vMTPtlFRg/640?wx_fmt=png&from=appmsg)

我用新的开发方式，将我们在项目开发中可能会遇到的情况都实现了一遍。写完十几个案例之后，我的感受就是：

**我们的开发方式，又要迎来一次重大升级了。**因为新的 hook 真的太好用了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEKcF9x2vwpIJMg0a9UjdrFx32bknrKw8XqEIgewjHcQrdF6A2SkVZGV4Rw1Sf0mATqMF3iaicn2Krw/640?wx_fmt=png&from=appmsg)

所以我准备写一系列合集，为大家完整、详细的介绍 React 19 的新的最佳实践。在后续的文章中，我会对比新旧开发方式的区别，并详细分析新的开发方式的思考。如上图所示，相关的实践案例我已经写完，后续的二十多篇文章预计会在 React19 正式发布之前完成。大家可以保持持续关注。

我最终会将这本合集放到我的个人小程序「前端码易」中，供大家长期免费观看。写完之后，我也会直播与大家共享。

和过去的 React 版本相比，React 19 主要从如下两个方面带来了显著的提升。

01
--

**性能**

最近几年，许多其他前端框架纷纷拥抱基于 Signal 的细粒度更新，在特定场景有接近原生开发的性能体验，把前端框架的性能问题推上了风口浪尖。而 React 基于 Fiber 的 Diff 更新则自然而然的成为了最大的缺陷与短板。大量冗余 re-render 造成的性能损耗，是 React 不得不面对的挑战。

> 注：细粒度更新并非所有场景都具有明显的优势，也不要完全相信框架而忽视掌握性能优化技能的重要性

虽然 React 提供了 `memo/useMemo/useCallback` 来帮助开发者优化项目性能。但是他们的学习成本并不低，想要在项目中得心应手的使用他们更是不易。这就造成了许多团队在没有完全消化他们的情况下，对他们的使用存在滥用的情况。

在这样的背景之下，React 19 将会推出 **React Compiler**，在开发者不调整任何代码的情况下，自动优化项目性能。

React Compiler 能够帮助我们在不使用 `memo/useMemo/useCallback` 的情况下，方便的处理好项目 re-render 的问题。你的项目最终只会在需要更新的地方 re-render。

并且最重要的是，React Compiler 编译之后，你的代码并不会改变现有渲染机制，而是在已有机制下完成对项目的优化。React Compiler 的愿景非常庞大，他需要在兼顾大量老项目的情况下，做到对项目的性能优化。因此与提出一个新的解决方案相比，他的开发难度要高出很多。破坏性更新显得更加容易，但是对于开发者和大量老项目而言，这是一种严重的伤害。React Compiler 则选择了最难搞的一种更新方式。

与依赖追踪的细粒度更新不同，React Compiler 通过记忆的方式，让组件更新只发生在需要更新的组件，从而减少大量 re-render 的组件，我会在后续的章节中详细介绍他的使用原理。

> 但是请注意，React Compiler 并非全能，如果你写的代码过于灵活，无法被提前预判执行行为，那么 React Compiler 将会跳过这一部分的优化。因此好的方式是在项目中引入严格模式，在严格模式的指导下完成的开发，基本都在 React Compiler 的辐射范围之内

02
--

**开发体验**

与性能带来的提升相比，真正令我非常期待的是，React 19 将会迎来一次**开发体验的重大提升**。毕竟没有 React Compiler，我自己也能优化好我的项目性能。

开发体验的提升主要体现在，**React 19 之后，我们可能不再需要 `useEffect`** 了。

useEffect 是一个功能强大的 hook，但他又是最难驾驭的一个 hook，理解不够的开发者可能会由于滥用它而导致项目失控。包括被讨论最多的闭包问题，也往往跟它有关。其中最考验开发者水平的，是对于 useEffect 依赖项的正确处理。

React19 的 大部分更新，几乎都是围绕如何在开发中尽量不用或者少用 useEffect 来展开。在之前的项目开发中，`useEffect` 是我们处理异步问题必须使用的重要 hook 之一，他几乎存在于每一个页面组件之中。

React 19 则引入了新的 hook，让我们**处理异步开发时，不再需要** `useEffect`，从而极大的改变我们的开发方式。我会在后续的章节中，结合**大量实践案例**，一一介绍这些 API 的详细使用方法，确保每个读者都能彻底掌握他。

除此之外，React19 想要彻底改变我们在项目开发中的 UI 交互方式。因此对于 React19 而言，`Suspense、ErrorBoundary、Action` 的重要性将会变得越来越高。

`Suspense、ErrorBoundary` 虽然早在 React18 中都能够被正常使用，但是由于异步请求方案的不成熟，它们并没有被普及开，包括 React 官方文档也并没有进一步说明如何触发 `Suspense` 的回调机制。因此它们只是小范围的被一些顶尖的前端开发所使用。

```
<Suspense fallback={<div>loading...</div>}>  <List api={__api} /></Suspense>
```

React19 之后，**它们将会得到普及**。这将会进一步深化组件解释一切的开发思想。

03
--

**React Server Components**

React Server Components 是 React 在探索前端边界的又一次突破性的创举。它是一种新概念组件。我们可以在构建时运行一次组件，以提高页面的渲染速度。

**预渲染、增量渲染、流式传输**等概念对提高大型复杂项目的用户体验有非常大的帮助。好消息是，RSC 已经在 Next.js 中得到落地实践。

目前已经有大量的开发者在使用 Next.js。我们会在后续的章节中详细给大家介绍 RSC。

04
--

**新的架构思维**

React 19 之前，React 高手与普通开发者之间，开发的项目无论是从性能上、还是从代码优雅上差距都非常大。因此不同的人对于 React 的感受完全不一样。

而 React 19 则借由推出一些新的 hook，暗中传递一种**框架思维**「最佳实践」，这将会极大的拉进普通开发者与顶尖高手之间的差距。对于大多数 React 开发者而言，这会是一个极大的提升。

> 这一意图在 React 新的官方文档与 Next.js 中提现得非常明显

这一最佳实践主要围绕如何改进异步编程的开发体验而展开。在后续的章节中大家可以自行感受。我也会在后续的实践案例中弱化对 `useEffect` 的使用。

例如，当我想要实现如下效果时。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEKcF9x2vwpIJMg0a9UjdrFNJnPV3hI47rGoOBpWLFzNM5tm6nlMIOLC3DlA5aR1fywQuw4ppkKsQ/640?wx_fmt=gif&from=appmsg)

在项目开发中，新页面渲染时请求一个接口的场景非常常见。新的架构思维的开发代码如下所示。

> 该案例没有引入任何三方库

首先我们需要定义一个 API 用于请求数据。

```
const api = async () => {  const res = await fetch('https://api.chucknorris.io/jokes/random')  return res.json()}
```

然后创建一个函数组件，并执行该 api

```
export default function Index() {  const __api = api()  return (    <div>      <div id='tips'>初始化时，自动获取一条数据内容</div>      <Suspense fallback={<div>loading...</div>}>        <Item api={__api} />      </Suspense>    </div>  )}
```

最后在子组件中，获取 api 执行之后得到的数据

```
const Item = (props) => {  const joke = use(props.api)  return (    <div>      <div>{joke.value}</div>    </div>  )}
```

大家可以自行感受一下新的开发方式与以前基于 `useEffect` 请求数据有什么不同之处。

> 注意：一套成熟架构思维，不是使用一个简单的方案解决某一个问题，而是要基于这套思维去解决项目中的绝大多数场景。因此我们一定要结合大量的场景去理解一套项目架构思维。

end
---

**合集介绍**

**「React19 全解」**是 **「React 知命境」**的续集。由于公众号文章比较零散，许多读者不知道整个合集在哪里看，因此我创作了一个小程序前端码易，用于收录我创作的所有公众号文章，我将同一个合集的文章归类放入到一个目录中。以便大家分类查看。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEKcF9x2vwpIJMg0a9UjdrFZxI3HtViaIoiazmblibRt6sMRuzXA8h3CLjGLfa8nnSlqpKI3bvprNsdg/640?wx_fmt=png&from=appmsg)

大家收藏我的小程序前端码易就能随时看到合集文章。

扫码或搜索添加我的微信 `icanmeetu`，可以加入 react19 讨论群，大家一起探讨与分享 React19 的使用心得，并且后续的更新公告、直播公告、**直播录屏**都会在群里放出。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Kn1wMOibzLcEKcF9x2vwpIJMg0a9UjdrFowAVZeznoAA0n5SiaMIicwHozfjVaadiac8mgFyYn16WdD3KUXFpvCLtg/640?wx_fmt=jpeg&from=appmsg)