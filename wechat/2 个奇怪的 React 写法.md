> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fhX_npH4OwWMPkbN6ha13g)

大家好，我卡颂。  

虽然`React`官网用大量篇幅介绍最佳实践，但因`JSX`语法的灵活性，所以总是会出现奇奇怪怪的`React`写法。

本文介绍 2 种奇怪（但在某些场景下有意义）的`React`写法。也欢迎大家在评论区讨论你遇到过的奇怪写法。

ref 的奇怪用法
---------

这是一段初看让人很困惑的代码：

```
function App() {  const [dom, setDOM] = useState(null);   return <div ref={setDOM}></div>;}
```

让我们来分析下它的作用。

首先，`ref`有两种形式（曾经有 3 种）：

1.  形如`{current: T}`的数据结构
    
2.  回调函数形式，会在`ref`更新、销毁时触发
    

例子中的`setDOM`是`useState`的`dispatch`方法，也有两种调用形式：

1.  直接传递更新后的值，比如`setDOM(xxx)`
    
2.  传递更新状态的方法，比如`setDOM(oldDOM => return /* 一些处理逻辑 */)`
    

在例子中，虽然反常，但`ref`的第二种形式和`dispatch`的第二种形式确实是契合的。

也就是说，在例子中传递给`ref`的`setDOM`方法，会在**「div 对应 DOM」**更新、销毁时执行，那么`dom`状态中保存的就是**「div 对应 DOM」**的最新值。

这么做一定程度上实现了**「感知 DOM 的实时变化」**，这是单纯使用`ref`无法具有的能力。

useMemo 的奇怪用法
-------------

通常我们认为`useMemo`用来缓存变量`props`，`useCallback`用来缓存函数`props`。

但在实际项目中，如果想通过**「缓存 props」**的方式达到子组件性能优化的目的，需要同时保证：

*   所有传给子组件的`props`的引用都不变（比如通过`useMemo`）
    
*   子组件使用`React.memo`
    

类似这样：

```
function App({todos, tab}) {    const visibleTodos = useMemo(      () => filterTodos(todos, tab),    [todos, tab]);        return <Todo data={visibleTodos}/>;}// 为了达到Todo性能优化的目的const Todo = React.memo(({data}) => {  // ...省略逻辑})
```

既然`useMemo`可以缓存变量，为什么不直接缓存组件的返回值呢？类似这样：

```
function App({todos, tab}) {  const visibleTodos = useMemo(      () => filterTodos(todos, tab),  [todos, tab]);    return useMemo(() => <Todo data={visibleTodos}/>, [visibleTodos])}function Todo({data}) {  return <p>{data}</p>;}
```

如此，需要性能优化的子组件不再需要手动包裹`React.memo`，只有当`useMemo`依赖变化后子组件才会重新`render`。

总结
--

除了这两种奇怪的写法外，你还遇到哪些奇怪的`React`写法呢？

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNDvxh93JHfZD80m7GhBmGicoYpnLCanxmxvpVm4ACYNms63xnCgKt1Py5rvMCEDkWebYCTpfDVBq7g/640?wx_fmt=gif)

**彦祖，亦菲，点个****「在看」**吧