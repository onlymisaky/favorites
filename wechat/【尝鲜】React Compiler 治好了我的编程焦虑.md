> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/VNH9uecS_X7FAuD48HflVA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/5DfZkPzRvGYWFEaWJ1hFF5CpYoC2ttiaEoNCTdNZpaXr5jwzm9ib1W1tgibwTHbDwpGu0jOcceYMxY6elfxjgKlNQ/640?wx_fmt=webp&from=appmsg)

React 19 和 React 编译器（此前称作 React Forget）最近一个月成为了 React 社区热议的焦点。大家都对于可能很快就不必再在 React 中纠结于记忆化技术（memoization） 的问题感到异常激动（这是件好事）。但这种说法准确吗？在未来几个月内，我们真的可以开始抛弃 `memo`、`useMemo`和`useCallback`这些概念吗？而当 React 编译器正式推出后，又会带来哪些实质性的变化？我们又应该如何学习 React 的新知识呢？

我们来深入探讨一下。

**React 19 不是 React** 编译器
=========================

让我们首先澄清一个最关键的误区：记忆化技术（Memoization）在短期内仍将是 React 开发的重要部分，因此现在还不是抛弃它的时候。需要明确的是，React 19 和 React 编译器是两件不同的事物。React 团队在他们宣布即将发布 React 19 的同一篇博文中提到了编译器，这让许多人误以为二者是相同的，误解纷纷产生。

不过，React 团队的一位成员通过一条推文对这个误解进行了澄清，他说明了 React 19 与 React Compiler 之间的区别。这条推文帮助大家理解了 React 的最新动态，避免了进一步的混淆

![](https://mmbiz.qpic.cn/mmbiz_jpg/5DfZkPzRvGYWFEaWJ1hFF5CpYoC2ttiaErevice49nqB1ZicJnhxpFfF2Q9DmMoIlmN6EM1G9e7MFfEo0C3DVSA5g/640?wx_fmt=webp&from=appmsg)

p1

在 React 19 版本中，我们期待引入多项新功能，但对于 React 编译器的推出，则需要再耐心等待一段时间。目前尚不明确具体需要等待多久，但根据 React 核心团队另一位成员的推文透露，编译器可能在本年度末前推出。这一消息让我们对 React 的未来发展充满期待。

![](https://mmbiz.qpic.cn/mmbiz_jpg/5DfZkPzRvGYWFEaWJ1hFF5CpYoC2ttiaEaib1c1LyjU551g9eXicHbLJ0AaBwuEow62ArCQJAdtzJhCx5TLJIM9hA/640?wx_fmt=webp&from=appmsg)

p2

就我个人而言，我对这个时间表持怀疑态度。如果我们看一下 React 团队成员介绍编译器及其时间表的演讲，我们正处于编译器之旅的中间位置：

![](https://mmbiz.qpic.cn/mmbiz_jpg/5DfZkPzRvGYWFEaWJ1hFF5CpYoC2ttiaE5mJ2zDB6LUVpicOlb1OVHvDEHIjMnj3QtxZq5LIvjS9hicLcpbQ6IEXw/640?wx_fmt=webp&from=appmsg)

p3

这段开发之旅始于 2021 年，已经两年了。在像 Meta 这样的庞大代码库中实施这种基础性的变革无疑是一项巨大的挑战，从时间线的中段跳跃到最终实现可能还需要再多两年的时间。

不过，谁能确切知晓呢？也许 React 团队真能在今年完成发布，那无疑是个振奋人心的好消息。根据视频中的介绍，Compiler 一个主要的能力是我们在采用它时无需修改现有代码——它将会 “即插即用”。如果 Compiler 确实能在年底前发布，那将强有力地证明这一点，我们大多数人将能够迅速、轻松地进行切换。

然而，即便 Compiler 今年发布，并且确实非常容易的使用而且无任何副作用，这并不意味着我们可以立刻忘掉 `useCallback`和 `memo` 的使用。总会有一个过渡期，在这个期间，我们最初会讨论 「如果你已经启用了 Compiler」 的情况，然后逐渐过渡到「如果你还没有迁移到 Compiler」的较为少见的情况。

从类组件转向使用 hooks 的函数组件，这一心智模式的转变我认为至少需要 3 年时间（从 2018 年起）——当所有教程、文档和博客文章都更新之后，大多数人转向了使用 hooks 的 React 版本，并且我们开始默认讨论函数组件和 hooks。即使在 6 年后的今天，我们仍然可以在不同的地方找到许多类组件。

如果对 Compiler 我们采取相似的时间线预测，那意味着我们至少在未来 3 年内还需要保持对`memo`、`useMemo`和 `useCallback` 这些知识的掌握。如果你足够幸运能够在 Compiler 一发布就迁移到一个现代化的代码库，那么你可能需要较短的时间来适应。但如果你是 React 的教学者，或者在一个迁移速度较慢、充斥着大量旧代码的大型代码库中工作，那么你可能需要更长的时间来适应。

React Compiler 带来了什么变化？
=======================

所以，React Compiler 究竟会带来什么样的改变呢？简而言之，它将实现代码的全面记忆化（memoization）处理。具体来说，React Compiler 是一个 Babel 插件，这意味着它能够自动将我们编写的标准 React 代码转化为一种新的形式。在这种形式中，无论是组件内部使用的钩子（hooks）的依赖关系，还是组件接收的属性（props），乃至组件本身，都将经过记忆化处理。这种处理方式能显著优化性能，因为它通过避免不必要的计算和渲染来提高应用的响应速度和效率。

通过这种转换，原本的 React 代码将被优化，以确保应用中的数据和组件在不必要更新时能够保持不变，从而减少性能损耗。这个过程是自动进行的，开发者不需要手动对每个组件或钩子进行记忆化操作，React Compiler 为我们智能地处理了这一切。

```
const Component = () => {const onSubmit = () => {};const onMount = () => {};useEffect(() => {    onMount();}, [onMount]);return <Form onSubmit={onSubmit} />;};
```

就像下面，`onSubmit` 和 `onMount` 函数都经过了`useCallback`的包裹处理，同时 `Form` 组件也被`React.memo`包裹

```
const FormMemo = React.memo(Form);const Component = () => {const onSubmit = useCallback(() => {}, []);const onMount = useCallback(() => {}, []);useEffect(() => {    onMount();}, [onMount]);return <FormMemo onSubmit={onSubmit} />;};
```

当然，Compiler 的工作原理并不是直接将代码转换成我们上述所描述的形式；实际上，它的操作更为复杂和先进。然而，将这种转换过程想象为函数和组件通过 `useCallback` 和 `React. memo`进行包裹，这样的思维模型有助于我们更好地理解 Compiler 的作用。

如果你对 Compiler 的具体工作机制感兴趣，我推荐你观看 React 核心团队成员介绍 Compiler 的视频。此外，如果你对为何在这些场景中使用 `useCallback` 和 `memo` 还有所疑惑，我建议你观看油管上的《the Advanced React series》 前六集，它们全面讲解了组件重新渲染和记忆化的相关知识。如果你更喜欢阅读，那么这些文档内容都是不容错过的学习资源。

对于 React 教学和学习方法来说，这种技术转变带来了一些新的考量。这意味着在理解和应用 React 的过程中，我们需要更新我们的知识库，同时也提供了一个机会去深入探索 React 的性能优化技巧，让我们能够更有效地构建和优化我们的 React 应用。

父子组件重新渲染
--------

目前，如果父组件重新渲染，则里面所有的子组件也会重新渲染

```
// 如果 Parent 重新渲染const Parent = () => {// Child 也会重新渲染return <Child />;};
```

当前，很多人坚信只有当子组件的属性（props）发生变化时，组件才会进行重新渲染。我会把这个观念称为「重新渲染神话」。实际上，在 React 的标准行为模式下，这种说法并不成立——属性的变化并不总是导致组件的重新渲染。

然而，引入 Compiler 后，情况发生了有趣的转变。得益于 Compiler 在底层实现的全面记忆化处理，这个曾被认为是神话的观念现在反倒成了 React 的常态。在未来几年，我们将会向学习者传授这样的理念：一个 React 组件仅在其状态或属性发生变化时才会重新渲染，而无论其父组件是否进行了重新渲染都不会影响到它。有时，技术的发展确实会带来一些意想不到的变化和趣味。

不再为了性能而组合
---------

以往，像 “向下移动状态” 或 “通过子组件传递” 这样的技术被广泛用于减少不必要的组件重新渲染，以此来提升应用的性能。我建议在尝试用 `useCallback` 和 `memo` 来手动优化之前，可以先考虑这些组合技术，因为在 React 中恰当地实现记忆化（即缓存组件以避免不必要的更新）是一件非常具有挑战性的事情。

比如，像下面的代码

```
const Component = () => {const [isOpen, setIsOpen] = useState(false);return (<>    <Button onClick={() => setIsOpen(true)}>        open dialog    </Button>    {isOpen && <ModalDialog />}    <VerySlowComponent /></>);};
```

由于 `ModalDialog` 组件是延迟打开的，所以 `VerySlowComponent` 会在每次 `ModalDialog` 打开时都重新渲染一次。如果我们把 state 放进 `ModalDialog` 组件内，像下面这样

```
const ButtonWithDialog = () => {const [isOpen, setIsOpen] = useState(false);return (<>    <Button onClick={() => setIsOpen(true)}>        open dialog    </Button>    {isOpen && <ModalDialog />}</>);};const Component = () => {return (<>    <ButtonWithDialog />    <VerySlowComponent /></>);};
```

通过这种方式，我们成功地避免了`VerySlowComponent`不必要的重新渲染，而且这个过程中我们甚至没有使用到任何记忆化技术。

随着 React Compiler 的推出，那些过去为了提升性能而必须采用的编码模式将不再是必需的。尽管如此，出于代码组织和关注点分离的考虑，我们可能仍会采用这些模式。但是，过去那种迫使我们将大型组件拆分为更小组件以避免不必要的重新渲染的驱动力将不复存在。在 React Compiler 的帮助下，我们的组件可以变得更加庞大而不会带来性能上的负担。

这表明，React 开发者可以在不牺牲性能的前提下，拥有更大的灵活性来组织和设计他们的组件结构。这一转变为 React 应用的开发带来了新的可能性，使得性能优化不再是开发过程中的一个繁重负担。

不再到处都是 **useMemo/useCallback**
------------------------------

自然而然，那些有时候让我们的代码变得复杂的 `useMemo` 和 `useCallback` 将会消失。这部分让我最为期待。不必再费劲穿梭于多层组件之间，只为了缓存一个 `onSubmit` 属性的回调函数。不再有那些难以阅读和调试的，互相依赖又让人费解的 `useMemo` 和 `useCallback` 链条。也不会再因为忘记缓存子组件而导致缓存失效的问题。

差异比对**和协调过程**
-------------

我们或许需要重新思考，如何向人们解释 React 中的差异比对（diffing）和协调过程（reconciliation）。目前简化说法是，当我们渲染一个组件，比如 **`<Child />`** 时，实际上我们是在创建它的一个元素对象。这个元素对象大概是下面这样

```
{"type": ...,"props": ...,// 其他 react 属性}
```

“type” 是字符串或者组件的引用

在下面的代码中

```
const Parent = () => {    return <Child />;};
```

当父组件（Parent）发生重渲染时，函数会被触发，同时`<Child />`组件的对象会被重新生成。React 会在重渲染之前和之后对这个对象进行一次浅层对比。如果这个对象的引用发生了变化，就意味着 React 需要对这个子组件树执行一次全面的差异分析。

目前，即便 `<Child />` **** 组件没有接收任何属性（props），它还是会不断地重新渲染，原因就在于`<Child />`（实际上是对 **`React.createElement`** 函数调用的简写）的结果是一个总是被重新创建的对象，因而它无法通过浅层对比的检查。

随着 React 编译器的引入，元素（Elements）、差异对比（diffing）和协调过程（reconciliation）的基本概念仍然保持不变，这是件好事。但变化的是，现在如果`<Child ****/>`组件的属性没有变化，它将返回一个已经被缓存（memoized）的对象。因此，编译器的引入实际上相当于将所有内容，包括组件元素，都使用了`useMemo` 进行了包裹和优化。

```
const Parent = () => {const child = useMemo(() => <Child />, []);return child;};
```

不过，这只是我基于目前能公开获取的有限信息所作出的一些推测，所以我的看法可能并不完全准确。不过，这些细节对我们的生产代码来说并没有太大的实际影响。

其他方面几乎和目前的情况一样。在一个组件内部创建另一个组件，这种做法仍然是一个明显的设计误区。我们还是会用 “key” 属性来识别元素或者重置状态。处理 Context 仍然是一个棘手的问题。至于数据获取或错误处理等话题，这些目前甚至还没有被纳入讨论范围。

但话说回来，我真的很期待编译器的发布。它似乎将为我们的 React 编程带来重大的改进。

写在最后
====

如果你发现这篇博文有帮助，欢迎与其他人分享。你还可以关注我，了解有关 AI、 Javascript、React 和其他 Web 开发主题的更多内容。与往常一样，如果你有任何疑问，请随时与我联系或发表评论。如果大家遇到任何问题，欢迎 联系我 [1] 或者直接微信添加 superZidan41。祝你编程愉快！