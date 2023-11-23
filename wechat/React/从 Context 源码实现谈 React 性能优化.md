> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/I2oxqvxkcYHeiiRI_QUoJg)

学完这篇文章，你会收获：

1.  了解`Context`的实现原理
    
2.  源码层面掌握`React`组件的`render`时机，从而写出高性能的`React`组件
    
3.  源码层面了解`shouldComponentUpdate`、`React.memo`、`PureComponent`等性能优化手段的实现
    

我会尽量将文章写的通俗易懂。但是，要完全理解文章内容，需要你掌握这些前置知识：

1.  `Fiber`架构的大体工作流程
    
2.  `优先级`与`更新`在`React`源码中的意义
    

如果你还不具备前置知识，可以先阅读 React 技术揭秘 [1]**（点击阅读原文）**

组件 render 的时机
=============

`Context`的实现与组件的`render`息息相关。在讲解其实现前，我们先来了解`render`的时机。

换句话说，`组件`在什么时候`render`？

这个问题的答案，已经在 [React 组件到底什么时候 render 啊](https://mp.weixin.qq.com/s?__biz=MzU0MDg4NDY2Mg==&mid=2247484376&idx=1&sn=0edb7c9857ba4603dfc410d5aaafe878&chksm=fb332801cc44a1173f705fa67ff5d3ea2788ed1df6765e9760b0936375b7acf38d5503f73f9a&token=583298442&lang=zh_CN&scene=21#wechat_redirect)聊过。在这里再概括下：

在`React`中，每当触发`更新`（比如调用`this.setState`、`useState`），会为组件创建对应的`fiber`节点。

`fiber`节点互相链接形成一棵`Fiber`树。

有 2 种方式创建`fiber`节点：

1.  `bailout`，即复用前一次更新该组件对应的`fiber`节点作为本次更新的`fiber`节点。
    
2.  `render`，经过 diff 算法后生成一个新`fiber`节点。组件的`render`（比如`ClassComponent`的`render`方法调用、`FunctionComponent`的执行）就发生在这一步。
    

经常有同学问：`React`每次更新都会重新生成一棵`Fiber`树，性能不会差么？

`React`性能确实不算很棒。但如你所见，`Fiber`树生成过程中并不是所有组件都会`render`，有些满足优化条件的组件会走`bailout`逻辑。

比如，对于如下 Demo：

```
function Son() {  console.log('child render!');  return <div>Son</div>;}function Parent(props) {  const [count, setCount] = React.useState(0);  return (    <div onClick={() => {setCount(count + 1)}}>      count:{count}      {props.children}    </div>  );}function App() {  return (    <Parent>      <Son/>    </Parent>  );}const rootEl = document.querySelector("#root");ReactDOM.render(<App/>, rootEl);
```

在线 Demo 地址 [2]

点击`Parent`组件的`div`子组件，触发更新，但是`child render!`并不会打印。

这是因为`Son`组件会进入`bailout`逻辑。

bailout 的条件
===========

要进入`bailout`逻辑，需同时满足 4 个条件：

1.  `oldProps === newProps`
    

即本次更新的`props`全等于上次更新的`props`。

注意这里是全等比较。

我们知道组件`render`会返回`JSX`，`JSX`是`React.createElement`的语法糖。

所以`render`的返回结果实际上是`React.createElement`的执行结果，即一个包含`props`属性的对象。

即使本次更新与上次更新`props`中每一项参数都没有变化，但是本次更新是`React.createElement`的执行结果，是一个全新的`props`引用，所以`oldProps !== newProps`。

2.  `context value`没有变化
    

我们知道在当前`React`版本中，同时存在新老两种`context`，这里指老版本`context`。

3.  `workInProgress.type === current.type`
    

更新前后`fiber.type`不变，比如`div`没变为`p`。

4.  `!includesSomeLane(renderLanes, updateLanes) ？`
    

当前`fiber`上是否存在`更新`，如果存在那么`更新`的`优先级`是否和本次整棵`Fiber`树调度的`优先级`一致？

如果一致代表该组件上存在更新，需要走`render`逻辑。

`bailout`的优化还不止如此。如果一棵`fiber`子树所有节点都没有更新，即使所有子孙`fiber`都走`bailout`逻辑，还是有遍历的成本。

所以，在`bailout`中，会检查该`fiber`的所有子孙`fiber`是否满足条件 4（该检查时间复杂度`O(1)`）。

如果所有子孙`fiber`本次都没有更新需要执行，则`bailout`会直接返回`null`。整棵子树都被跳过。

不会`bailout`也不会`render`，就像不存在一样。对应的 DOM 不会产生任何变化。

老 Context API 的实现
=================

现在我们大体了解了`render`的时机。有了这个概念，就能理解`Context`API 是如何实现的，以及为什么被重构。

我们先看被废弃的老`Context`API 的实现。

`Fiber`树的生成过程是通过遍历实现的可中断递归，所以分为递和归 2 个阶段。

`Context`对应数据会保存在栈中。

在递阶段，`Context`不断入栈。所以`Concumer`可以通过`Context栈`向上找到对应的`context value`。

在归阶段，`Context`不断出栈。

那么老`Context`API 为什么被废弃呢？因为他没法和`shouldComponentUpdate`或`Memo`等性能优化手段配合。

shouldComponentUpdate 的实现
-------------------------

要探究更深层的原因，我们需要了解`shouldComponentUpdate`的原理，后文简称其为`SCU`。

使用`SCU`是为了减少不必要的`render`，换句话说：让本该`render`的组件走`bailout`逻辑。

刚才我们介绍了`bailout`需要满足的条件。那么`SCU`是作用于这 4 个条件的哪个呢？

显然是第一条：`oldProps === newProps`

当使用`shouldComponentUpdate`，这个组件`bailout`的条件会产生变化：

-- `oldProps === newProps`

++ `SCU === false`

同理，使用`PureComponenet`和`React.memo`时，`bailout`的条件也会产生变化：

-- `oldProps === newProps`

++ `浅比较oldProps与newsProps相等`

回到老`Context`API。

当这些性能优化手段：

*   使组件命中`bailout`逻辑
    
*   同时如果组件的子树都满足`bailout`的条件 4
    

那么该`fiber`子树不会再继续遍历生成。

换言之，不会再经历`Context`的入栈、出栈。

这种情况下，即使`context value`变化，子孙组件也没法检测到。

新 Context API 的实现
=================

知道老`Context`API 的缺陷，我们再来看新`Context`API 是如何实现的。

当通过：

```
ctx = React.createContext();
```

创建`context`实例后，需要使用`Provider`提供`value`，使用`Consumer`或`useContext`订阅`value`。

如：

```
ctx = React.createContext();const NumProvider = ({children}) => {  const [num, add] = useState(0);  return (    <Ctx.Provider value={num}>      <button onClick={() => add(num + 1)}>add</button>      {children}    </Ctx.Provider>  )}
```

使用：

```
const Child = () => {  const {num} = useContext(Ctx);  return <p>{num}</p>}
```

当遍历组件生成对应`fiber`时，遍历到`Ctx.Provider`组件，`Ctx.Provider`内部会判断`context value`是否变化。

如果`context value`变化，`Ctx.Provider`内部会执行一次向下深度优先遍历子树的操作，寻找与该`Provider`配套的`Consumer`。

在上文的例子中会最终找到`useContext(Ctx)`的`Child`组件对应的`fiber`，并为该`fiber`触发一次更新。

注意这里的实现非常巧妙：

一般`更新`是由组件调用触发更新的方法产生。比如上文的`NumProvider`组件，点击`button`调用`add`会触发一次`更新`。

触发`更新`的本质是为了让组件创建对应`fiber`时不满足`bailout`条件 4：

`!includesSomeLane(renderLanes, updateLanes) ？`

从而进入`render`逻辑。

在这里，`Ctx.Provider`中`context value`变化，`Ctx.Provider`向下找到消费`context value`的组件`Child`，为其`fiber`触发一次更新。

则`Child`对应`fiber`就不满足条件 4。

这就解决了老`Context`API 的问题：

由于`Child`对应`fiber`不满足条件 4，所以从`Ctx.Provider`到`Child`，这棵子树没法满足：

> !! 子树中所有子孙节点都满足条件 4

所以即使遍历中途有组件进入`bailout`逻辑，也不会返回`null`，即不会无视这棵子树的遍历。

最终遍历进行到`Child`，由于其不满足条件 4，会进入`render`逻辑，调用组件对应函数。

```
const Child = () => {  const {num} = useContext(Ctx);  return <p>{num}</p>}
```

在函数调用中会调用`useContext`从`Context`栈中找到对应更新后的`context value`并返回。

总结
==

`React`性能一大关键在于：减少不必要的`render`。

从上文我们看到，本质就是让组件满足 4 个条件，从而进入`bailout`逻辑。

而`Context`API 本质是让`Consumer`组件不满足条件 4。

我们也知道了，`React`虽然每次都会遍历整棵树，但会有`bailout`的优化逻辑，不是所有组件都会`render`。

极端情况下，甚至某些子树会被跳过遍历（`bailout`返回`null`）。

### 参考资料

[1]

React 技术揭秘: _http://react.iamkasong.com/_

[2]

在线 Demo 地址: _https://codesandbox.io/s/quirky-chaplygin-5bx67?file=/src/App.js_

送你一本源码学习指南

加入专业 React 进阶群![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQxNrPh7FwNylBx0k9PpYzVnHpMZgPlkxsVJrOianRy5uniacAlceHn24IY8NibOYkqPiaE6oJBQtfHVA/640?wx_fmt=png)