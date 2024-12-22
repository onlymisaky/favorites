> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fdFXXEkTfJVWogl9y8nTuA)

前言
--

> ❝
> 
> 最近因为一些原因对 useCallback 有了一些新的认知，然后遇到一个朋友说他面试的时候被问到如何实现一个倒计时的 hooks 的时候，想到了这个问题，突然的茅塞顿开，对 react 中的 hooks 有了新的了解，所以有了这篇文章，记录一下我个人的想法。
> 
> ❞

在学习一些开源的库的时候，很容易发现开源库中 `hooks` 里面会写很多的 `ref` 来存储`hooks`的参数。

使用了 `ref` 之后，使用变量的地方就需要 `.current` 才能拿到变量的值，这比我直接使用变量肯定是变得麻烦了。对于有代码洁癖的人来说，这肯定是很别扭的。

但是在开源库的 `hooks` 中频繁的使用了 `ref`，这肯定不是一个毫无原因的点，那么究竟是什么原因，让开源库也不得不使用 `.current` 去获取变量呢？

`useCallback`
-------------

先跑个题，什么时候我们需要使用 `useCallback` 呢？

每个人肯定有每个人心中的答案，我来讲讲我的心路历程吧。

### 第一阶段 - 这是个啥

刚开始学`react`的时候，写函数式组件，我们定义函数的时候，肯定是不会有意识的吧这个函数使用 `useCallback` 包裹。就这样写了一段时间的代码。

突然有一天我们遇到了一个问题，`useEffect`无限调用，找了半天原因，原来是我们还不是很清楚`useEffect`依赖的概念，把使用到的所有的变量一股脑的塞到了依赖数组里面，碰巧，我们这次的依赖数组里面有一个函数，在`react`每一次渲染的时候，函数都被重新创建了，导致我们的依赖每一次都是新的，然后就触发了无限调用。

百度了一圈，原来使用 `useCallback` 缓存一下这个函数就可以了，这样`useEffect`中的依赖就不会每一次都是一个新值了。

**「小总结：」** 在这个阶段，我们第一次使用 `useCallback` ，了解到了它可以缓存一个函数。

### 第二阶段 - 可以缓存

可以缓存就遇到了两个点

1.  缓存是吧，不会每一次都重新创建是吧，这样是不是性能就能提高了！那我把我所有用到的函数都使用 `useCallback`缓存一下。
    
2.  `react` 每一次`render`的时候会导致子组件重新渲染，使用`memo`可以缓存这个子组件，然后传给子组件的函数也需要缓存才行，所以我在父组件中定义函数的时候图方便，一股脑的都使用 `useCallback`缓存。
    

**「小总结：」** 在这里我们错误的认为了缓存就能够帮助我们做一些性能优化的事情，但是因为还不清楚根本的原因，导致我们很容易就滥用 `useCallback`

### 第三阶段 - 缓存不一定是好事

在这个阶段，写`react`也有一段时间了，我们了解到处处缓存其实还不如不缓存，因为缓存的开销不一定就比每一次重新创建函数的开销要小。

在这里肯定也是看了很多介绍 `useCallback`的文章了，推荐一下下面的文章

how-to-use-memo-use-callback，这个是全英文的，掘金有翻译这篇文章的，「好文翻译」。

**「小总结：」** 到这里我们就大概的意识到了，处处使用`useCallback`可能并不是我们想象的那样，对正确的使用`useCallback`有了一定的了解

### 总结

那么究竟在何时应该使用`useCallback`呢？

1.  我们知道 `react` 在父组件更新的时候，会对子组件进行全量的更新，我们可以使用 `memo`对子组件进行缓存，在更新的时候浅层的比较一下`props`，如果`props`没有变化，就不会更新子组件，那如果`props`中有函数，我们就需要使用 `useCallback`缓存一下这个父组件传给子组件的函数。
    
2.  我们的`useEffect`中可能会有依赖函数的场景，这个时候就需要使用`useCallback`缓存一下函数，避免`useEffect`的无限调用
    

是不是就这两点呢？那肯定不是呀，不然就和我这篇文章的标题联系不起来了吗。

针对`useEffect`这个`hooks`补充一点`react`官方文档里面有提到，建议我们使用自定义的 hooks 封装 useEffect。

3.  那使用`useCallback`的第三个场景就出现了，就是我们在自定义`hooks`需要返回函数的时候，建议使用 `useCallback`缓存一下，因为我们不知道用户拿我们返回的函数去干什么，万一他给加到他的`useEffect`的依赖里面不就出问题了嘛。
    

一个自定义`hook`的案例
--------------

> ❝
> 
> 实现一个倒计时 `hooks`
> 
> ❞

### 需求介绍

我们先简单的实现一个倒计时的功能，就模仿我们常见的发短息验证码的功能。页面效果

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2DZBfI9wKjGyAgZ9gIaQVv8VoU6dZP45tQH9gHlkticMw0rrAPGKX3GEQ/640?wx_fmt=gif)  

`app.jsx`中

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2Ddw6334uhDqXBwU4YzCDwS1kvpcpeiaLxObjOxZzqoQNbZ8dzAzcocBw/640?wx_fmt=png)`MessageBtn.jsx`中

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2Duyico6mhp3hBaX7B31Fyg3MLg32RJ6k1S4MN5kZm6atoxudSKx9gKHw/640?wx_fmt=png)功能比较简单，按钮点击的时候创建了一个定时器，然后时间到了就清除这个定时器。

现在把 `MessageBtn` 中倒计时的逻辑写到一个自定义的`hooks`里面。

### `useCountdown`

把上面的一些逻辑抽取一下，`useCountdown`主要接受一个倒计时的时长，返回当前时间的状态，以及一个开始倒计时的函数

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2DZKrv1kPAL1HcegAjPSCPnI6Mkz3o8WXbtGzic3wXReHphZVgEo9GIcg/640?wx_fmt=png)  

这里的`start`函数用了`useCallback`，因为我们不能保证用户的使用场景会不会出问题，所以我们包一下

### 升级 `useCountdown`

现在我们期望`useCountdown`支持两个函数，一个是在倒计时的时候调用，一个是在倒计时结束的时候调用

预期的使用是这样的，通过一个配置对象传入 `countdownCallBack`函数和`onEnd`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2DDwdV1Q22h8fGedoX2WvWJvhBS8KIqYkvsghkW430GqulH5e3LmO48Q/640?wx_fmt=png)  

改造 `useCountdown`

1.  然后我们这里`count`定义 0 有点歧义，0 不能准确的知道是一开始的 0 还是倒计时结束的 0，所以还需要加一个标志位来表示当前是结束的 0
    
2.  使用 `useEffect`监听`count`的变化，变化的时候触发对应的方法
    

实现如下， 新增了红框的内容

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2DsU6iceUO0h783zpFr7ed3Xic3rKutjbfh8gJJxZQROOXdt1fPpaHT89g/640?wx_fmt=png)  

### 提出问题

那么，现在就有一个很严重的问题，`onEnd`和 `countdownCallBack`这两个函数是外部传入的，我们要不要把他放到我们自定义`hook`的`useEffect`依赖项里面呢

我们不能保证外部传入的变量一定是一个被`useCallback`包裹的函数，那么肯定就不能放到`useEffect`依赖项里面。

如何解决这个问题呢？

答案就是使用`useRef`。(兜兜转转这么久才点题 `(╥╯^╰╥)`)

用之前我们可以看一下成熟的方案是什么

比如`ahooks`里面的 useLatest 和 useMemoizedFn 的实现

*   `useLatest` 源码
    

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2DbA11iaoKqf0AoCRfY9I15QdcibrSsBkdnkO06gm3kicsXK7F4QGUgIczg/640?wx_fmt=png)  

*   `useMemoizedFn` 源码，主要看圈起来的地方就好了，本质也是用`useRef`记录传入的内容
    

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2D5HKmYT0AeqBdGPDubadJcdm816icCc8gNVF65y4DfBrkibkFuLrQsjJQ/640?wx_fmt=png)  

ok，我们使用一下 `useLatest`  改造一下我们的`useCountdown`，变动点被红框圈起来了

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvxREiaET7VB0uTrxXic7eT2DUcQib2SllfVW0hnZRwfUE11Hs2hY64QZClVFpEjxqP925UW6ibDYicFCQ/640?wx_fmt=png)  

总结
--

其实这篇文章的核心点有两个

1.  带着大家重新的学习了一下`useCallback`的使用场景。(`useMemo`类似)
    
2.  编写自定义`hooks`时候，我们需要注意一下外部传入的参数，以及我们返回给用户的返回值，核心点是决不相信外部传入的内容，以及绝对要给用户一个可靠的返回值。