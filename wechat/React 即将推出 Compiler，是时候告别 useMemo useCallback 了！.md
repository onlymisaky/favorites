> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iNkxFOa18k9wG6RbGYvQMQ)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

最近，React 团队在他们的官方博客发表了一篇文章，介绍了从上个大版本发布，到 2024 年 2 月团队的一些工作内容。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTvB02356pJIhn6LEjq6jJmbxZ5icVftsDzaHS4iceaT7yGTzeaWcT3vf4QibCMQsFAf46M1nP45gp0g/640?wx_fmt=png&from=appmsg)

其中最让我惊喜的就是 `React Compiler` 了。

众所周知，大家在介绍 `React` 的时候总会说它是一个重运行时的框架，因为它本身在编译时并不会做很多针对于渲染的优化动作。

这让开发者在开发阶段拥有了很多的灵活性，`React` 给我们提供了诸如 `useMemo/useCallback` 这样的 API ，把运行时优化的手段交给到了开发者手上。但这同样也给开发者带来了极大的心智负担，

虽然用好 `React` 可以让你的应用拥有极致的性能表现，但是事实上用好 `React` 远比我们想象中的要困难。

反观 `Vue.js` 这样的框架就不一样了，大家都说 `Vue` 相比 `React` 上手更简单，更适合初学者，主要就是因为它没有这么多的弯弯绕绕，很多优化事项能在编译时做就在编译时做了。

这次  `React` 推出 `Compiler` 可能要打破大家的这个常规认知了。

React 官方博客是这样描述它的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTvB02356pJIhn6LEjq6jJmaRW1hYMOicBO7DA10kGXiancz6Z0qLibzGibgxjnoDZX9icTHWDib4icadoeg/640?wx_fmt=png&from=appmsg)

> 当状态变化时，`React` 有时可能会过度渲染。自 `React` 问世以来，我们针对这类情况的解决方案一直是手动缓存。在我们当前的 `API` 中，这意味着应用 `useMemo`、`useCallback` 和 `memo` 这些 `API`，手动微调 `React` 在状态变更时的渲染范围。但是，手动缓存更像是一种妥协。它让我们的代码变得混乱，容易出错，而且需要额外的工作去保持最新。

> 手动缓存虽然是一个合理的妥协，但我们并不满意。我们更加希望的是，当状态变化时，`React` 自动渲染 `UI` 的正确部分，而无需妨碍 `React` 的核心思维模型。我们相信，`React` 的方法 —— UI 作为一个简单的状态函数，具有标准的 `JavaScript` 值和习惯用法 —— 是 `React` 对许多开发者来说易于上手的关键因素。这就是为何我们投资建造一个优化 `React` 的编译器。

`React Compiler` 现在并不是一个初步想法，它已经在 `instagram.com` 的生产环境中提供支持了。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/e5Dzv8p9XdTvB02356pJIhn6LEjq6jJmgUbdpH2xjg5ibH3ZicWxNbniaHASpoGaGhW3mY0EBGm6fqb1cMtgeSibQQ/640?wx_fmt=jpeg&from=appmsg)

在去年 `React` 团队的一场演讲中，已经对它进行了介绍，只不过当时它的名字叫做 `React Forget` ，目前更名为 `React Compiler` 。

`React Compiler` 基于 `Babel` 插件实现，它实际会做的事情，你可以简单这样理解：

它会把我们常见的 `React` 代码转换成每个钩子依赖、组件上的属性，以及组件本身都被缓存的代码，比如下面这段代码：

```
const Component = () => {  const onSubmit = () => {};  const onMount = () => {};  useEffect(() => {    onMount();  }, [onMount]);  return <Form onSubmit={onSubmit} />;};
```

在底层，它的行为就相当于 `onSubmit` 和 `onMount` 都被 `useCallback` 包裹上了，而 `Form` 被 `React.memo` 包裹上了：

```
const FormMemo = React.memo(Form);const Component = () => {  const onSubmit = useCallback(() => {}, []);  const onMount = useCallback(() => {}, []);  useEffect(() => {    onMount();  }, [onMount]);  return <FormMemo onSubmit={onSubmit} />;};
```

当然，`Compiler` 实际做的事情要比这个 `Demo` 要复杂的多。

想了解更详细的讲解，你可以看这个视频：https://www.youtube.com/watch?v=qOQClO3g8-Y

当前的版本中，如果一个父组件重新渲染，那么在其内部渲染的每个组件也会重新渲染。

```
// 如果 Parent 重新渲染const Parent = () => {  // Child 也会重新渲染  return <Child />;};
```

理想的状态是，只有当子组件的 `props` 改变时，子组件才会重新渲染。

使用 `React Compiler` 时，一切都在底层进行了缓存，这个理想状态就变成了事实。

在开发中，我们经常会使用一些性能优化的技巧，比如 "向下移动状态" 或 "将组件作为子组件传递"，可以减少重新渲染。我通常建议在折腾 `useCallback` 和 `memo` 之前先试试这些技巧，因为在 React 中正确地缓存状态非常难。

例如，在这段代码中：

```
const Component = () => {  const [isOpen, setIsOpen] = useState(false);  return (    <>      <Button onClick={() => setIsOpen(true)}>        open dialog      </Button>      {isOpen && <ModalDialog />}      <VerySlowComponent />    </>  );};
```

每次打开对话框时，`VerySlowComponent` 都会重新渲染，导致对话框打开时有延迟。如果我们把打开对话框的状态封装在一个组件中，像这样：

```
const ButtonWithDialog = () => {  const [isOpen, setIsOpen] = useState(false);  return (    <>      <Button onClick={() => setIsOpen(true)}>        open dialog      </Button>      {isOpen && <ModalDialog />}    </>  );};const Component = () => {  return (    <>      <ButtonWithDialog />      <VerySlowComponent />    </>  );};
```

我们基本上摆脱了 `VerySlowComponent` 不必要的重新渲染，而不用缓存任何东西。

当 `React Compiler` 投入使用时，这些场景将不再对性能有任何影响，也不会再有任何重新渲染。

自然的，之前一直在困扰大家的 `useMemo` 和 `useCallback` 将一去不复返了...

`Andrew Clark` 在 `Twitter` 上表示，`React Compiler` 预计在今年年底发布，另外 React 还会带来一些新的改变：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTvB02356pJIhn6LEjq6jJmriaPwOOicrGPwD3xsNBQfnCIvmFyB15CkU4LHLLNKNF6FicbpiapqX0RgQ/640?wx_fmt=png&from=appmsg)

*   `useMemo`、`useCallback`、`memo` → React Compiler 将自动处理和优化组件的重渲染和回调函数的生成，使这些函数将成为过去。
    
*   `forwardRef` → 引用 (`ref`) 将被视为一个普通的 `props`，你可以像处理其他 `props` 一样处理它，无需额外的 `forwardRef` 函数。
    
*   `React.lazy` → 用于代码分割的 `React.lazy` 也将被新的 RSC（React Server Component）和 promise-as-child 替代，这将对异步组件加载提供更好的支持。
    
*   `useContext` → 你只需使用 `use(Context)`，就可以直接获取到 Context 的值，大大简化了 Context 的使用。
    
*   `throw promise` → 你可以直接使用 `use(promise)`，让异步操作变得更加简单，无需再显式地去抛出和捕获 Promise。
    
*   `<Context.Provider>` → 你只需使用 `<Context>`，而不再需要 `<Context.Provider>`，这将使 Context 的提供者更容易使用和管理。
    

最后
--

大家觉得 React 即将发布的这些新特性怎么样？欢迎在评论区留言。

参考：

*   https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024
    
*   https://www.youtube.com/watch?v=qOQClO3g8-Y
    
*   https://twitter.com/acdlite/status/1758229889595977824
    
*   https://www.developerway.com/posts/react-compiler-soon
    

抖音前端架构团队目前放出不少新的 HC ，又看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持⬇️❤️⬇️