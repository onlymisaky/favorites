> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/U75WLX49h_zaQ-rQtHwljA)

大家好，我卡颂。  

当一个`React`应用逻辑变得复杂后，**「组件 render」**花费的时间会显著增长。如果从**「组件 render」**到**「视图渲染」**期间消耗的时间过长，用户就会感知到页面卡顿。

为了解决这个问题，有两个方法：

1.  让**「组件 render」**的过程从同步变为异步，这样`render`过程页面不会卡死。这就是并发更新的原理
    
2.  减少需要`render`的组件数量，这就是常说的`React`性能优化
    

通常，对于不同类型组件，我们会采取以上不同的方法。比如，对于下面这样的有耗时逻辑的输入框，方法 1 更合适（因为并发更新能减少输入时的卡顿）：

```
function ExpensiveInput({onChange, value}) {  // 耗时的操作  const cur = performance.now();  while (performance.now() - cur < 20) {}  return <input onChange={onChange} value={value}/>;}
```

那么，能不能在整个应用层面同时兼顾这 2 种方式呢？答案是 —— 不太行。

这是因为，对于复杂应用，并发更新与性能优化通常是相悖的。就是本文要聊的 —— 并发悖论。

从性能优化聊起
-------

对于一个组件，如果希望他非必要时不`render`，需要达到的基本条件是：`props`的引用不变。

比如，下面代码中`Child`组件依赖`fn props`，由于`fn`是内联形式，所以每次`App`组件`render`时引用都会变，不利于`Child`性能优化：

```
function App() {  return <Child fn={() => {/* xxx */}}/>}
```

为了`Child`性能优化，可以将`fn`抽离出来：

```
const fn = () => {/* xxx */}function App() {  return <Child fn={fn}/>}
```

当`fn`依赖某些`props`或者`state`时，我们需要使用`useCallback`：

```
function App({a}) {  const fn = useCallback(() => a + 1, [a]);  return <Child fn={fn}/>}
```

类似的，其他类型变量需要用到`useMemo`。

也就是说，当涉及到性能优化时，`React`的代码逻辑会变得复杂（需要考虑引用变化问题）。

当应用进一步复杂，会面临更多问题，比如：

*   复杂的`useEffect`逻辑
    
*   状态如何共享
    

这些问题会与性能优化问题互相叠加，最终导致应用不仅逻辑复杂，性能也欠佳。

性能优化的解决之道
---------

好在，这些问题有个共同的解决方法 —— 状态管理。

上文我们聊到，对于性能优化，关键的问题是 —— 保持`props`引用不变。

在原生`React`中，如果`a`依赖`b`，`b`依赖`c`。那么，当`a`变化后，我们需要通过各种方法（比如`useCallback`、`useMemo`）保持`b`、`c`引用的稳定。

做这件事情本身（保持引用不变）对开发者来说就是额外的心智负担。那么，状态管理是如何解决这个问题的呢？

答案是：状态管理库自己管理所有原始状态以及派生状态。

比如：

*   在`Recoil`中，基础状态类型被称为`Atom`，其他派生状态都是基于`Atom`组合而来
    
*   在`Zustand`中，基础状态都是`create`方法创建的实例
    
*   在`Redux`中，维护了一个全局状态，对于需要用到的状态通过`selector`从中摘出来
    

这些状态管理方案都会自己维护所有的基础状态与派生状态。当开发者从状态管理库中引入状态时，就能最大限度保持`props`引用不变。

比如，下例用`Zustand`改造上面的代码。由于状态`a`和依赖`a`的`fn`都是由`Zustand`管理，所以`fn`的引用始终不变：

```
const useStore = create(set => ({  a: 0,  fn: () => set(state => ({ a: state.a + 1 })),}))function App() {  const fn = useStore(state => state.fn)  return <Child fn={fn}/>}
```

并发更新的问题
-------

现在我们知道，性能优化的通用解决途径是 —— 通过状态管理库，维护一套逻辑自洽的外部状态（这里的**「外部」**是区别于`React`自身的状态），保持引用不变。

但是，这套外部状态最终一定会转化为`React`的内部状态（再通过内部状态的变化驱动视图更新），所以就存在状态同步时机的问题。即：什么时候将外部状态与内部状态同步？

在并发更新之前的`React`中，这并不是个问题。因为更新是同步、不会被打断的。所以对于同一个外部状态，在整个更新过程中都能保持不变。

比如，在如下代码中，由于`List`组件的`render`过程不会打断，所以`list`在遍历过程中是稳定的：

```
function List() {  const list = useStore(state => state.list)  return (    <ul>      {list.map(item => <Item key={item.id} data={item}/>}    </ul>  )}
```

但是，对于开启并发更新的`React`，更新流程可能中断，不同的`Item`组件可能是在中断前后不同的宏任务中`render`，传递给他们的`data props`可能并不相同。这就导致同一次更新，同一个状态（例子中的`list`）前后不一致的情况。

这种情况被称为`tearing`（视图撕裂）。

可以发现，造成`tearing`的原因是 —— 外部状态（状态管理库维护的状态）与`React`内部状态的同步时机出问题。

这个问题在当前`React`中是很难解决的。退而求其次，为了让这些状态库能够正常使用，`React`专门出了个`hook` —— `useSyncExternalStore`。用于将状态管理库触发的更新都以同步的方式执行，这样就不会有同步时机的问题。

既然是以同步的方式执行，那肯定没法并发更新啦～～～

总结
--

实际上，凡是涉及到**「自己维护了一个外部状态」**的库（比如动画库），都涉及到状态同步的问题，很有可能无法兼容并发更新。

所以，你会更倾向下面哪种选择呢：

1.  不`care`并发更新，以前`React`怎么用，现在就怎么用
    
2.  根据项目情况，平衡并发更新与性能优化的诉求
    

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBFwjvDGsRicdUVLBRz6g7EvmDzSkW81fq9glQibfLjmfkVoCr7jFAAicgKBhicCecPXCdu0eXP4JJ2ZQ/640?wx_fmt=png)