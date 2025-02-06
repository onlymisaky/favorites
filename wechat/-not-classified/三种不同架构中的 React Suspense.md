> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/hQDg7sdbhmpB-9qOTj0BAw)

React Suspense 的发展历程颇为曲折：多年间它几乎没有被使用，且被认为收效甚微，仅是呈现加载状态的一种炫酷方式。然而，随着 React 18 的推出，Suspense 提供了一整套新的优势，值得重新审视。遗憾的是，这些优势从平淡无奇到较为深奥不等，并且对应用架构的依赖性较高。接下来我们将看看当今最常见的三种渲染架构，以及 React Suspense 在其中所扮演的角色。

简要概述

*   客户端渲染：在 React.lazy 加载时显示回退状态；使用支持 suspense 的框架以声明方式处理数据加载和错误状态。
    
*   服务端渲染：上述功能 + 将服务端渲染的组件包裹在 `<Suspense />` 中，以便在客户端选择性地进行水合。
    
*   服务端组件：上述功能 + 将异步服务端组件包裹在 `<Suspense />` 中，分阶段流式传输到客户端：首先是回退状态，接着是最终内容。
    

深入探讨

### 客户端渲染

这是最基本的 React 用法。客户端请求时，服务器返回一个只包含基本 HTML 的文件，其中包含引用 JavaScript 包的 `<script>` 标签。当 JavaScript 加载并执行后，生成页面内容并填充空白的 HTML 文件。所有导航完全在客户端进行，不再向服务器发出额外请求——这引出了 Suspense 的第一个用例。由于 JavaScript 包含了生成应用任何部分所需的代码，因此文件体积可能较大。页面内容在渲染之前，必须加载、解析并执行整个 JavaScript 文件，这成为一个严重的性能瓶颈。不过，你不需要在每个页面加载所有代码。我们可以将应用拆分成多个不同的 JavaScript 包，仅在必要时将各自包发送到客户端？这就是 Suspense 和 React.lazy 的用武之地。

使用 Suspense 和 React.lazy

React.lazy 的核心功能是传入一个返回 Promise 的函数，以懒加载 React 组件，Promise 最终会解析为一个组件。大多数情况下，我们使用动态导入语法来懒加载模块：

```
const Post = lazy(() => import('./Post.ts'));


```

结合 Suspense，我们可以在导入加载期间向 React 指示渲染一个回退加载状态：

```
export default function Wrapper() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Post />
    </Suspense>
  );
}


```

如果使用了像 React Router 这样的导航库，可以通过路由对应用进行代码拆分，在各页面的 Route 组件中分别懒加载入口点。

当然，可以自行实现这种行为——在动态导入组件时渲染加载状态——但使用 Suspense 会更优雅。这也引发了一个问题：能否用 Suspense 简化所有使用 `useEffect` 完成的数据获取操作？  
在 useEffect 中使用 Suspense 进行数据获取

在进一步探讨之前，我们先来简单了解一下 `<Suspense />` 的内部机制。主要问题是：父级 `<Suspense />` 是如何知道子组件正在加载的？据我所知，只有两种方法可以让子组件改变其父组件的状态：

1.  子组件修改父组件使用的状态
    
2.  子组件抛出一个值，父组件可以捕获并处理
    

第二种方式通常表现为一个错误边界（Error Boundary），这是一个 React 组件，专门用于捕获子组件在程序崩溃时抛出的非预期错误。有趣的是，React 还将这一机制应用到了其他场景：Suspense 依赖子组件抛出一个 Promise。

简单来说，子组件会在加载时抛出一个挂起状态的 Promise，并在准备好渲染时解析。父组件会捕获该 Promise，并根据情况渲染 `fallback` 属性或子组件内容。

可以想象，设置一个支持 suspense 的数据获取工具是非常复杂的，使用一个现成的库会更加省心。

这就是说，如果你的库支持 suspense，你可以将组件包裹在 `<Suspense />` 中，指定一个回退状态，并添加一个错误边界以捕获被拒绝的 Promise，省去手动管理 `isLoading` 或 `isError` 状态的麻烦！

```
function Post() {
  // 例如，使用 React Query
  const { data } = useQuery({ suspense: true });

  // 可以假设数据已完全获取，因为在数据加载时 React 
  // 会“挂起”组件，而这段代码不会执行！
  return <div>{data}</div>;
}

export default function Wrapper() {
  return (
    <ErrorBoundary fallbackRender={<div>出错了！</div>}>
      <Suspense fallback={<div>加载中...</div>}>
        <Post />
      </Suspense>
    </ErrorBoundary>
  );
}


```

对于一些人来说，这看起来更简洁；但对另一些人而言，这可能是 “毁灭金字塔”（pyramid of doom）的早期迹象，他们更愿意自己处理加载和错误状态。无论如何，很难说 Suspense 的数据获取开启了无法手动实现的全新功能——那些功能还会陆续登场。

### 服务端渲染（Server-Side Rendering）

在服务端渲染应用中，Suspense 开启了一些非常有趣的新功能——但首先，我们需要简要了解一下水合（hydration）的基础。

在请求时，元框架（如 Next.js）通过运行相关文件中导出的组件来生成页面的 HTML，用于首次渲染。这段 HTML 会发送给用户，以便在 JavaScript 包加载时看到有意义的内容。当 JavaScript 到达时，元框架会在客户端重新运行组件，确保生成的 DOM 与服务器上生成的 HTML 相同（若不一致，通常会有警告）。此时，除了生成状态、绑定事件等 JavaScript 功能也已到位。重新在客户端运行组件的整个过程称为水合。

相比客户端渲染，服务端渲染在首次加载页面时提供了更好的用户体验，因为用户可以看到服务器生成的 HTML，而 JavaScript 包正在加载和执行中。不过，仅仅是 “看到”——没有 JavaScript 页面无法交互。问题在于，整个页面在可以交互之前都需要被水合完成！这就是 Suspense 的第三个用例：选择性水合。

通过将组件包裹在 Suspense 中，React 会将其与页面的其余部分分开水合。乍看之下，这似乎没什么用：如果所有非水合的 HTML 都同时发送到客户端，整个页面还是会一起被水合。然而，这不完全正确，原因如下：

1.  如果将多个组件包裹在 Suspense 中，React 可以根据用户当前的交互，智能决定先水合哪个部分。也就是说，React 可以优先水合页面的某部分，从而让用户先使用到一个交互控件，同时后台继续水合页面的其余部分。对处理 JavaScript 较慢的设备而言，这可以极大地提升用户体验。
    
2.  在流式传输架构中，页面的不同部分可以分开发送到客户端，这意味着某块 HTML 可以在其他部分还在服务器渲染时先发送到客户端并选择性地进行水合！
    

需要注意的是，当前的 SSR 框架并不支持选择性水合——据我所知，只有使用 `app` 目录的 Next.js 应用支持将客户端组件渲染成服务器上的 HTML 并进行选择性水合。可以查看我关于 SSR 与服务器组件的博文了解更多信息！

### 服务器组件（Server Components）

服务器组件简单来说是指在服务器上渲染为 HTML 的 React 组件，然后将其发送到客户端。听起来像是服务端渲染，但服务器组件仅在服务器端运行，永不在客户端执行。它们不能使用事件处理器、状态或 Hooks，因此本质上是非交互式的。服务器组件主要用于获取和渲染静态数据：

```
export default async function Post() {
  const data = await fetch(...)

  return <div>{data}</div>
}


```

注意这里的函数 / 组件是异步的！可以直接等待数据加载完成，然后将内容渲染为 HTML 并发送到客户端。这个方式简单优雅，但用户体验欠佳——在异步操作完成前，组件会被阻塞，用户无法看到任何内容！这种情况正是加载状态的用武之地。那么，如何为服务器组件提供一个加载状态？可以使用 Suspense。

将异步服务器组件包裹在 `<Suspense />` 中，React 会在组件获取数据时渲染并发送 `fallback` 到客户端。一旦数据加载完成，React 就会发送组件的渲染内容。这种分阶段将多块 HTML 发送到客户端的过程称为流式传输（streaming）。

```
async function Post() {
  const data = await fetch(...)

  return <div>{data}</div>
}

export default function Wrapper() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Post />
    </Suspense>
  );
}


```

### 总结

以上就是 React Suspense 在三种不同架构中的四种用例。至于是否一个 API 能够适用于如此多样的场景，留待读者自行判断，但希望本文能帮助您更好地理解这个机制。感谢阅读！