> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MP_Q5dzWSTto9qzsXb9C3w)

本篇文章会列举 react 的所有常见面试问题. 并附上详细解答. 如果你想更深入的了解底层原理, 可到文末的建议阅读中查找.

问题列表
----

*   高阶组件 (HOC) , render props 以及 hook 的对比和用处.
    
*   虚拟 DOM 是什么?
    
*   react diff 原理, 如何从 O(n^3) 变成 O(n)
    

*   为什么要使用 key , 有什么好处?
    

*   jsx 的原理
    

*   自定义的 React 组件为何必须大写
    

*   setState 什么时候是同步, 什么时候是异步?
    
*   React 如何实现自己的事件机制？
    

*   React 事件和原生事件有什么区别
    

*   聊一聊 fiber 架构
    
*   React 事件中为什么要绑定 this 或者 要用箭头函数, 他们有什么区别
    

> 如果以上的问题你都懂的话, 那么你可以关闭这个网页了.

#### 一. 高阶组件 (HOC) , render props 以及 hook 的对比和用处.

详细的内容请见另一篇文章:  [面试官: 谈一谈 HOC、Render props、Hooks](http://mp.weixin.qq.com/s?__biz=MzA3MjkwNTM1Mw==&mid=2649139131&idx=1&sn=3a2e9a5ae7dd3099943e01d69c980a61&chksm=8705205db072a94b3e21380876b072240efd2b08f5af85d8ddfe8725960fe11372c308e17c59&scene=21#wechat_redirect)

#### 二. 虚拟 DOM 是什么?

在 React 中, React 会先将代码转换成一个 JS 对象, 然后再将这个 JS 对象转换成真正的 DOM. 这个 JS 对象就是所谓的虚拟 DOM.

它可以让我们无须关注 DOM 操作, 只需要开心地编写数据, 状态即可.

#### 三. react diff 原理, 如何从 O(n^3) 变成 O(n)

*   为什么是 O(n^3) ?
    

从一棵树转化为另外一棵树, 直观的方式是用动态规划，通过这种记忆化搜索减少时间复杂度。由于树是一种递归的数据结构，因此最简单的树的比较算法是递归处理。确切地说，树的最小距离编辑算法的时间复杂度是 O(n^2m(1+logmn)), 我们假设 m 与 n 同阶， 就会变成 O(n^3)。

推荐阅读 (为什么是 O(n^3))[1]:

*   react diff 原理
    

简单的来讲, react 它只比较同一层, 一旦不一样, 就删除. 这样子每一个节点只会比较一次, 所以算法就变成了 O(n).

对于同一层的一组子节点. 他们有可能顺序发生变化, 但是内容没有变化. react 根据 key 值来进行区分, 一旦 key 值相同, 就直接返回之前的组件, 不重新创建.

这也是为什么渲染数组的时候, 没有加 key 值或者出现重复 key 值会出现一些奇奇怪怪的 bug . 

除了 key , 还提供了选择性子树渲染。开发人员可以重写 shouldComponentUpdate 提高 diff 的性能。

推荐阅读 (diff 原理)[2]

#### 四. jsx 的原理

```
<div>Hello ConardLi</div>
```

实际上, babel 帮我们将这个语法转换成

```
React.createElement('div', null, `Hello ConardLi`)
```

##### 自定义组件必须大写的原因.

babel 在编译的过程中会判断 JSX 组件的首字母, 如果是小写, 则为原生 DOM 标签, 就编译成字符串. 如果是大写, 则认为是自定义组件. 编译成对象.

##### 为什么以下代码会报错?

```
return (<a></a><a></a>)
```

同样的, 因为我们是按照 React.createElement() 来创建组件, 所以只能有一个根节点. 如果你想要使用 2 个平行的节点, 可以用 <></> 来包裹. <></> 会被编译成 <React.Fragment/>. 

babel 转译如下:![](https://mmbiz.qpic.cn/mmbiz_png/ZWVxrQ7G0WTCibmkfzlhDlvdn6c5jWz184Gp7P7045dzc6GnVapgZ1J4pTadshKYfHexrE37nOuR06tibOXY5BAw/640?wx_fmt=png)

自己动手玩一下转换, 加深印象吧~

babel 转换 [3]

#### 五. setState 什么时候是同步, 什么时候是异步?

这里的 “异步” 不是说异步代码实现. 而是说 react 会先收集变更, 然后再进行统一的更新.

setState 在原生事件和 setTimeout 中都是同步的. 在合成事件和钩子函数中是异步的.

在 setState 中, 会根据一个 isBatchingUpdates 判断是直接更新还是稍后更新, 它的默认值是 false. 但是 React 在调用事件处理函数之前会先调用 batchedUpdates 这个函数, batchedUpdates 函数 会将 isBatchingUpdates 设置为 true. 因此, 由 react 控制的事件处理过程, 就变成了异步 (批量更新).

#### 六.  React 里面的事件机制.

我们先看看 冒泡捕获 的经典图:

![](https://mmbiz.qpic.cn/mmbiz_png/ZWVxrQ7G0WTCibmkfzlhDlvdn6c5jWz189abwwrY4A2Bu7lOpM59YYicYuMQaJXthWUbcLWUSDvSBLc9a82r3YZQ/640?wx_fmt=png)在组件挂载的阶段, 根据组件生命的 react 事件, 给 document 添加事件 addEventListener, 并添加统一的事件处理函数 dispatchEvent.

将所有的事件和事件类型以及 react 组件进行关联, 将这个关系保存在一个 map 里. 当事件触发的时候, 首先生成合成事件, 根据组件 id 和事件类型找到对应的事件函数, 模拟捕获流程, 然后依次触发对应的函数.

> 如果原生事件使用 stopPropagation 阻止了冒泡, 那么合成事件也被阻止了.

##### React 事件机制跟原生事件有什么区别

1.  React 的事件使用驼峰命名, 跟原生的全部小写做区分.
    
2.  不能通过 return false 来阻止默认行为, 必须明确调用 preventDefault 去阻止浏览器的默认响应.
    

推荐阅读 (动画浅析 React 事件系统和源码)[4]

#### 七. 什么是 React Fiber

背景: 由于浏览器它将 GUI 描绘，时间器处理，事件处理，JS 执行，远程资源加载统统放在一起。如果执行 js 的更新， 占用了太久的进程就会导致浏览器的动画没办法执行，或者 input 响应比较慢。

react fiber 使用了 2 个核心解决思想:

*   让渲染有优先级
    
*   可中断
    

React Fiber 将虚拟 DOM 的更新过程划分两个阶段，reconciler 调和阶段与 commit 阶段. 看下图:![](https://mmbiz.qpic.cn/mmbiz_png/ZWVxrQ7G0WTCibmkfzlhDlvdn6c5jWz18qyibQibjeGHFxZPryu9g0zNfmz28ChL70e4icNDd5lleMDsLG4Y5GC6Og/640?wx_fmt=png) 一次更新过程会分为很多个分片完成, 所以可能一个任务还没有执行完, 就被另一个优先级更高的更新过程打断, 这时候, 低优先级的工作就完全作废, 然后等待机会重头到来.

###### 调度的过程

requestIdleCallback![](https://mmbiz.qpic.cn/mmbiz_png/ZWVxrQ7G0WTCibmkfzlhDlvdn6c5jWz18XyMXlAHKhLZwegElw13MZMHWV7ghhZKrCjeqqkOVI66kPau5UaKonw/640?wx_fmt=png)

首先 react 会根据任务的优先级去分配各自的过期时间 expriationTime . requestIdleCallback 在每一帧的多余时间 (黄色的区域) 调用. 调用 channel.port1.onmessage , 先去判断当前时间是否小于下一帧时间, 如果小于则代表我们有空余时间去执行任务, 如果大于就去执行过期任务, 如果任务没过期. 这个任务就被丢到下一帧执行了.

> 由于 requestIdleCallback 的兼容性问题, react 自己实现了一个 requestIdleCallback

推荐阅读 (司徒正美 React Fiber 架构)[5]

#### 八. React 事件中为什么要绑定 this 或者要用箭头函数?

事实上, 这并不算是 react 的问题, 而是 this 的问题. 但是也是 react 中经常出现的问题. 因此也讲一下

```
<button type="button" onClick={this.handleClick}>Click Me</button>
```

这里的 this . 当事件被触发且调用时, 因为 this 是在运行中进行绑定的. his 的值会回退到默认绑定，即值为 undefined，这是因为类声明和原型方法是以严格模式运行。

我们可以使用 bind 绑定到组件实例上. 而不用担心它的上下文.

因为箭头函数中的 this 指向的是定义时的 this，而不是执行时的 this. 所以箭头函数同样也可以解决.

最后
--

### 

```
关注「前端加加」, 第一时间获取优质文章. 




```

参考资料

[1]

推荐阅读 (为什么是 O(n^3)): _https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/151#issuecomment-510311760_

[2]

推荐阅读 (diff 原理): _https://www.infoq.cn/article/react-dom-diff_

[3]

babel 转换: _https://babeljs.io/repl_

[4]

推荐阅读 (动画浅析 React 事件系统和源码): _https://www.lzane.com/tech/react-event-system-and-source-code/index.html_

[5]

推荐阅读 (司徒正美 React Fiber 架构): _https://zhuanlan.zhihu.com/p/37095662_