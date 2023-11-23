> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RX8R-5o6RgPCgm9jsIzuGg)

大厂技术  高级前端  Node 进阶

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

一、前言
====

为什么有这篇文章？当时有人问我下面这个点击`button`，网页应该变成什么样？ 注意他们的`key`是相同的

```
import React, { useState } from "react";

function Demo2() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((i) => i + 1)}>点击Count+1</button>
      <h3 key={count}>大{count}</h3>
      <h2 key={count}>舌{count}</h2>
      <h1 key={count}>头{count}</h1>
    </div>
  );
}

export default Demo2;
复制代码


```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo6JYibQWHYBhyO6THbnElnEmybGicUoIPhyEQeCicdQ14EjiaHJJRpEpTfA/640?wx_fmt=other) 我去看了 7km 老师的博客 [1] 收集到了答案

**答案和你想象的一样吗？？不一样就继续往下看看呗！！！结尾有`答案`滴**

二、前置概念
======

react 框架可以用来表示，输入状态 —> 吐出 ui。

```
const ui = fn(state)
复制代码


```

### react 架构是什么？

可以分为如下三层：

1.  scheduler（调度器）：用来分发优先级更高的任务。
    
2.  **render 阶段（协调器）**：找出哪些节点发生了变化，并且给相应的 fiber 打上标签。
    
3.  commit 阶段（渲染器）：将打好标签的节点渲染到视图上。遍历 effectList 执行对应的 dom 操作或部分生命周期
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo3TicONuqIUa2iaImsIIjaCPOKdaAc5OpKLefRwicbICxOHvBF3HdCPNibg/640?wx_fmt=other)流程图 (36).jpg

1.  输入: 将每一次更新 (如: 新增, 删除, 修改节点之后) 视为一次更新需求(目的是要更新 DOM 节点).
    
2.  注册调度任务: react-reconciler 收到更新需求之后, 并不会立即构造 fiber 树, 而是去调度中心 scheduler 注册一个新任务 task, 即把更新需求转换成一个 task.
    
3.  执行调度任务 (输出): 调度中心 scheduler 通过任务调度循环来执行 task
    

1.  fiber 构造循环是 task 的实现环节之一, 循环完成之后会构造出最新的 fiber 树.
    
2.  commitRoot 是 task 的实现环节之二, 把最新的 fiber 树最终渲染到页面上, task 完成.
    

主干逻辑就是输入到输出这一条链路, 为了更好的性能 (如批量更新, 可中断渲染等功能), react 在输入到输出的链路上做了很多优化策略, 任务调度循环和 fiber 构造循环相互配合就可以实现可中断渲染.

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufojqMwjbJX4zJDV2LEd9EkmbeecryRJria6ic6FFgTthib4Zic9aKfWKANag/640?wx_fmt=other)流程图 (39).jpg

### ReactElement, Fiber, DOM 三者的关系

上面我们大概提及了一下 react 的架构和更新的粗略流程，考虑到本文的重点是 Render 阶段发生了啥，接下来上重量级嘉宾 JSX,ReactElement, Fiber, DOM。以下面这个 jsx 代码为例，讲解三者的关系

```
function Test() {
  const [showName, setShowName] = useState(true);
  return (
    <div>
      <div>今天肯德基疯狂星期八，和我一起玩彩虹六？</div>
      <ul>
        <li>抱枕一号</li>
        {showName && <li>抱枕二号</li>}
      </ul>
      <div
        onClick={() => {
          setShowName(false);
        }}
      >
        点击让高启强少一个小弟
      </div>
    </div>
  );
}
复制代码


```

`createElement源码`

所有采用`JSX`语法书写的节点, 都会被编译器转换, 最终会以`React.createElement(...)`的方式, 创建出来一个与之对应的`ReactElement`对象.

这也是为什么在每个使用`JSX`的 JS 文件中，你必须显式的声明 `import React from 'react';`(17 版本后不需要）否则在运行时该模块内就会报未定义变量 React 的错误。

#### ReactElement 数据结构和内存结构（结合上面 jsx 示例代码）

##### 数据结构

```
export type ReactElement = {
  // 用于辨别ReactElement对象形式
  $$typeof: any,

  // 内部属性
  type: any, // 表明其种类
  key: any,
  ref: any,
  props: any,

  // ReactFiber 记录创建本对象的Fiber节点, 还未与Fiber树关联之前, 该属性为null
  _owner: any,

  // __DEV__ dev环境下的一些额外信息, 如文件路径, 文件名, 行列信息等
  _store: {validated: boolean, ...},
  _self: React$Element<any>,
  _shadowChildren: any,
  _source: Source,
};
复制代码


```

##### 内存结构

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoBPsia4CuX2SQIG1kuGB9ia68WXicfwNgREqBWSiaJBliblCWZgCkPMJ5qfg/640?wx_fmt=other)流程图 (21).jpg

#### Fiber 对象数据结构

##### 数据结构

```
export type Fiber = {|
  tag: WorkTag,
  key: null | string, // 和ReactElement组件的 key 一致.
  elementType: any,//一般来讲和ReactElement组件的 type 一致 比如div ul
  type: any, // 一般来讲和fiber.elementType一致. 一些特殊情形下, 比如在开发环境下为了兼容热更新
  stateNode: any, // 真实DOM是谁
  return: Fiber | null, //爹是谁
  child: Fiber | null, //孩子是谁
  sibling: Fiber | null, //兄弟是谁
  index: number, 
  ref:
    | null
    | (((handle: mixed) => void) & { _stringRef: ?string, ... })
    | RefObject, //指向在ReactElement组件上设置的 ref
  pendingProps: any, // 从`ReactElement`对象传入的 props. 用于和`fiber.memoizedProps`比较可以得出属性是否变动
  memoizedProps: any, // 上一次生成子节点时用到的属性, 生成子节点之后保持在内存中
  updateQueue: mixed, // 存储state更新的队列, 当前节点的state改动之后, 都会创建一个update对象添加到这个队列中.
  memoizedState: any, // 用于输出的state, 最终渲染所使用的state
  dependencies: Dependencies | null, // 该fiber节点所依赖的(contexts, events)等
  mode: TypeOfMode, // 二进制位Bitfield,继承至父节点,影响本fiber节点及其子树中所有节点. 与react应用的运行模式有关(有ConcurrentMode, BlockingMode, NoMode等选项).

  // 优先级相关
  lanes: Lanes, // 本fiber节点的优先级
  childLanes: Lanes, // 子节点的优先级
  alternate: Fiber | null, // 双fiber缓存 指向内存中的另一个fiber, 每个被更新过fiber节点在内存中都是成对出现(current和workInProgress)
|};
复制代码


```

##### 内存结构

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo1Iz6tPDuaxibkvJo0KmhM01DD06ndtYQSwLU77SYcMLP2GYdrDXo44g/640?wx_fmt=other)流程图 (22).jpg

#### ReactElement, Fiber, DOM 三者的关系

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoiczXUSynHbYmePw8cxpCM5tcZVEiaymCcHhjrQ7B154ibRCOM9k8I4R6g/640?wx_fmt=other)流程图 (23).jpg

### React 的启动过程发生了啥

接下来介绍的都是当前稳定版`legacy` 模式

```
ReactDOM.render(<App />, document.getElementById('root'), dom => {});
复制代码


```

在没有进入`render`阶段（`react-reconciler`包）之前,`reactElement(<App/>)`和 DOM 对象`div#root`之间没有关联。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoGMVCExib1LqIUY8ZHxwOMWMH7FIuOQ4OywGwRtmVvGlPeChEnQwPs1A/640?wx_fmt=other)流程图 (33).jpg

在 react 初始化的时候，会创建三个全局对象，在三个对象创建完毕的时候，react 初始化完毕。

1.  `ReactDOMRoot对象`
    

1.  属于`react-dom`包，该对象暴露有 render,unmount 方法, 通过调用该实例的`ReactDOM.render`方法, 可以引导 react 应用的启动.
    

3.  `fiberRoot对象`
    

1.  属于`react-reconciler`包, 在运行过程中的全局上下文, 保存 fiber 构建过程中所依赖的全局状态，
    
2.  其大部分实例变量用来存储`fiber构造循环`过程的各种状态，react 应用内部, 可以根据这些实例变量的值, 控制执行逻辑。
    

5.  `HostRootFiber对象`
    

1.  属于`react-reconciler`包，这是 react 应用中的第一个 Fiber 对象, 是 Fiber 树的根节点, 节点的类型是`HostRoot`.
    

这 3 个对象是 react 体系得以运行的基本保障, 除非卸载整个应用，否则不会再销毁

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoiaXiajQnrTo9OkG4vVzWiavJ9HsBvv45vAY1vtTa5ZK8NuRuvrPL6qcvA/640?wx_fmt=other)流程图 (34).jpg

此刻内存中各个对象的引用情况表示出来，此时`reactElement(<App/>)`还是独立在外的, 还没有和目前创建的 3 个全局对象关联起来

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufonrcRkQjFtnKAa6Lf7a45DfNGsK7egYJPvXgEUlEIrMGRibImicOXaaug/640?wx_fmt=other)流程图 (35).jpg

到此为止, `react`内部经过一系列运转, 完成了初始化。

三、render 阶段发生了啥
===============

**以下所有示例按照下面的代码 请注意**

```
class App extends React.Component {
state = {
  list: ['A', 'B', 'C'],
};
onChange = () => {
   this.setState({ list: ['C', 'A', 'X'] });
};
componentDidMount() {
  console.log(`App Mount`);
}
render() {
  return (
    <>
      <Header key='d' />
      <button key='e'>change</button>
      <div class key='f'>
      {this.state.list.map(item => (
         <p key={item}>{item}</p>
       ))}
      </div>
    </>
  );
 }
}

class Header extends React.PureComponent {
render() {
   return (
   <>
    <h1>title</h1>
    <h2>title2</h2>
   </>
  );
 }
}
复制代码


```

#### 双缓冲 fiber 技术

在上文我们梳理了`ReactElement, Fiber, DOM三者的关系`, `fiber树`的构造过程, 就是把`ReactElement`转换成`fiber树`的过程. 但是在这个过程中, 内存里会同时存在 2 棵`fiber树`:

*   其一: 代表当前界面的`fiber`树 (已经被展示出来, 挂载到`fiberRoot.current`上). 如果是初次构造 (`初始化渲染`), 页面还没有渲染, 此时界面对应的 fiber 树为空 (`fiberRoot.current = null`).
    
*   其二: 正在构造的`fiber`树 (即将展示出来, 挂载到`HostRootFiber.alternate`上, 正在构造的节点称为`workInProgress`). 当构造完成之后, 重新渲染页面, 最后切换`fiberRoot.current = workInProgress`, 使得`fiberRoot.current`重新指向代表当前界面的`fiber`树.
    

#### React 入口初始化内存情况

在进入`react-reconciler`包之前, 也就是还没`render`时, 内存状态图如下，和上面启动过程的图对应:

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoNhN0F9ibQ3Rx9xvSTl2SOKeW6pBXEWtRCUEiaZyic4tLDWeXaotRr4nEg/640?wx_fmt=other)流程图 (24).jpg

#### fiber 树构造方式

1.  初次创建: 在`React`应用首次启动时, 界面还没有渲染, 此时并不会进入对比过程, 相当于直接构造一棵全新的树.
    
2.  对比更新: `React`应用启动后, 界面已经渲染. 如果再次发生更新, 创建`新fiber`之前需要和`旧fiber`进行对比. 最后构造的 fiber 树有可能是全新的, 也可能是部分更新的.
    

在深度优先遍历中, **每个**`fiber`节点都会经历 2 个阶段:

1.  探寻阶段 `beginWork`
    
2.  回溯阶段 `completeWork`
    

#### `beginWork`探寻阶段发生了什么源码地址 [2]

1.  创建节点：根据 `ReactElement`对象创建所有的`fiber`节点, 最终构造出 fiber 树形结构 (设置`return`和`sibling`指针)
    
2.  给节点打标签：设置`fiber.flags`(二进制形式变量, 用来标记 fiber 节点 的增, 删, 改状态, 等待`completeWork`阶段处理)
    
3.  设置真实 DOM 的局部状态：设置`fiber.stateNode`局部状态 (如 Class 类型节点: `fiber.stateNode=new Class()`)
    

#### `completeWork`回溯阶段发生了什么源码地址 [3]

1.  调用`completeWork`
    

1.  给`fiber`节点 (tag=HostComponent, HostText) 创建 DOM 实例, 设置`fiber.stateNode`局部状态 (如`tag=HostComponent, HostText`节点: fiber.stateNode 指向这个 DOM 实例).
    
2.  为 DOM 节点设置属性, 绑定事件 (`合成事件原理`).
    
3.  设置`fiber.flags`标记
    

3.  把当前 `fiber` 对象的副作用队列 (`firstEffect`和`lastEffect`) 添加到父节点的副作用队列之后, 更新父节点的`firstEffect`和`lastEffect`指针.
    
4.  识别`beginWork`阶段设置的`fiber.flags`, 判断当前 `fiber` 是否有副作用 (增, 删, 改), 如果有, 需要将当前 `fiber` 加入到父节点的`effects`队列, 等待`commit`阶段处理.
    

#### 初次创建

这有一个动画 具体如果想看流程图可以点击 [4]

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo3tIFeux9Yh1d8qWknUa8FPgFQHj7FULQ7QtbAiaEeohWHicOibRWNDrqw/640?wx_fmt=other)初始化 fiber.gif

下面标注了生成时期的 `beginWork` 和 `completeWork` 执行过程

```
  // 将最新的fiber树挂载到root.finishedWork节点上 下面绿色粗线表示指针
  const finishedWork: Fiber = (root.current.alternate: any);
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  // 进入commit阶段
  commitRoot(root);
复制代码


```

动画演示了初次创建`fiber树`的全部过程, 跟踪了创建过程中内存引用的变化情况. `fiber树构造循环`负责构造新的`fiber`树, 构造过程中同时标记`fiber.flags`, 最终把所有被标记的`fiber`节点收集到一个副作用队列中, 这个副作用队列被挂载到根节点上 (`HostRootFiber.alternate.firstEffect`). 此时的`fiber树`和与之对应的`DOM节点`都还在内存当中, 等待`commitRoot`阶段进行渲染

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoYVPAKIL4Wke3kjpeypticgYTvYciauiaUHRRbkWq4A2eOsB8jN0C4m3ng/640?wx_fmt=other)流程图 (32).jpg

#### 对比更新的时候发生了什么

###### 1. 优化原则

1.  只对**同级节点**进行对比，如果 DOM 节点跨层级移动，则 react 不会复用
    

*   我们可以从同级的节点数量将 Diff 分为两类：
    
    ```
    - 当newChild类型为JSX对象、number、string，代表同级只有一个节点
    - 当newChild类型为Array，同级有多个节点
    
    
    ```
    

3.  不同类型的元素会产出不同的结构，会销毁老的结构，创建新的结构
    
4.  可以通过 key 标示移动的元素
    
5.  类型一致的节点才有继续 diff 的必要性
    

*   `单节点`对应演示, 可以去浏览器的`Elements`->`Properties`查看
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufotiaAsibp9U9YMKwFyRpBDgjYkgl07UppVGcQfj97ZhJa0cJZb3tEc0cw/640?wx_fmt=other)单节点. jpg

*   `多节点`对应演示
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo2cfDzQs2NonqtCxXCZxoVlGGSedqowwrJmpWgbkeC4tDsASXD8AX7w/640?wx_fmt=other) image.png

##### diff 算法介绍

1. **单节点**

1.  如果是新增节点, 直接新建 fiber, 没有多余的逻辑
    
2.  如果是对比更新
    

*   如果`key`和`type`都相同，则复用
    
*   否则新建
    

单节点的逻辑比较简明, 源码 [5]

2. 多节点

1.  多节点一般会存在两轮遍历，第一轮寻找公共序列，第二轮遍历剩余非公共序列
    
2.  **第一次循环** 源码 [6]
    

*   `key`不同导致不可复用，立即跳出整个遍历，**第一轮遍历结束。**
    
*   `key`相同`type`不同导致不可复用，会将`oldFiber`标记为`DELETION`，并继续遍历
    

4.  如果`newChildren`遍历完（即`i === newChildren.length - 1`）或者`oldFiber`遍历完（即`oldFiber.sibling === null`），跳出遍历，**第一轮遍历结束。**
    
5.  `let i = 0`，遍历`newChildren`，将`newChildren[i]`与`oldFiber`比较，判断`DOM节点`是否可复用。
    
6.  如果可复用，`i++`，继续比较`newChildren[i]`与`oldFiber.sibling`，可以复用则继续遍历。
    
7.  如果不可复用，分两种情况：
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoPhqZIE0f7vjJXRqKib0lht4ZnpXCHBRSDOXcnXibncicqqcBA35DUKqPQ/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoibbJe9ucRyQcHHCWzBokCU6ldbW0coW7DQxq1CPlcutUhaDrZ6cOTMg/640?wx_fmt=other)image.png

1.  **第二次循环**: 遍历剩余`非公共`序列, 优先复用 oldFiber 序列中的节点。
    

*   如果`newChildren`与`oldFiber`同时遍历完，diff 结束
    
*   如果 `newChildren`没遍历完，`oldFiber`遍历完，意味着没有可以复用的节点了，遍历剩下的`newChildren`为生成的`workInProgress fiber`依次标记`Placement`。
    
*   如果`newChildren`遍历完，`oldFiber`没遍历完，意味着有节点被删除了，需要遍历剩下的`oldFiber`，依次标记`Deletion`。
    
*   如果`newChildren`与`oldFiber`都没遍历完 `(重点)`源码 [7]
    
    ```
    - 先去`声明map数据结构`，遍历一遍老节点，把老fiber的key做映射 \{元素的key：老的fiber节点\}，
    - 继续遍历新`jsx`，如果`map`有`key`，会把`key`从`map`中删除，说明可以复用，把当前节点标记为`更新`。新地位高的不动，新地位低的动（中间插入链表比链表屁股插入费劲）所以地位低的动动。
    - `lastPlaceIndex`指针，指向最后一个不需要动的老节点的`key`。每次新jsx复用到节点，`lastPlaceIndex`会指向老节点的最后一个成功复用的老`fiber`节点。如果新复用的节点key小于`lastPlaceIndex`，说明老`fiber`节点的顺序在新`jsx`之前，需要挪动位置接到新`jsx`节点后面。
    - 如果`jsx`没有复用的老`fiber`，直接插入新的
    - `map`中只剩还没被复用的节点，等着新的`jsx`数组遍历完，`map`里面的`fiber`节点全部设置为删除
    
    
    ```
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoGr9AoUy3U9NIqdRwoESSN2kjKOBziaGVBsbKJK7Kw6K4kC1LLKBkpKA/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufoGr9AoUy3U9NIqdRwoESSN2kjKOBziaGVBsbKJK7Kw6K4kC1LLKBkpKA/640?wx_fmt=other)image.png

**下面动画展示了 fiber 的对比更新过程** 每一张流程图链接 [8]

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo0GviajZrZv1FF61S8AI0vic5brEia67OiaZibXibNyQQBqUuM7H0ica8o99iag/640?wx_fmt=other)fiber 对比更新. gif![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufouYib5F62z1xnaxYB750S6ibgdhxkNNicbme6HNW6l5HZrS6aFtCTMm65A/640?wx_fmt=other) 流程图 (28).jpg

四、检验学习成果
========

为什么网页会变成那个样子？

```
import React, { useState } from "react";

function Demo2() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount((i) => i + 1)}>点击Count+1</button>
      <h3 key={count}>大{count}</h3>
      <h2 key={count}>舌{count}</h2>
      <h1 key={count}>头{count}</h1>
    </div>
  );
}

export default Demo2;
复制代码


```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo3O56UMkXSmyDGxdmtNibfFiaUCfcjSibQukxvSXSfDGLvl7fpbbzcC7aQ/640?wx_fmt=other)流程图 (29).jpg![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufo6tH14L9ESrkRK0gR9LmJYoC5p8dDI7KngJGr1RMgcTQVm1LBCDB3Pw/640?wx_fmt=other) 流程图 (30).jpg![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufophKS7fKKDI5nXFmdOCoIV5ePhsPNGz1jBml18JG5zFRCyEHRtwLdzw/640?wx_fmt=other) 流程图 (38).jpg![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq7ofrM7aFavCfwF4FeSufohLyHdxhrdcV4U8tCiaMuCcxjv1MzicMicyon9zib4oOVBR6GWia5KgsL1pQ/640?wx_fmt=other)image.png

五、参考
====

7km：7kms.github.io/react-illus…[9]

冴羽：juejin.cn/post/716098…[10]

卡颂：react.iamkasong.com/preparation…[11]

xiaochen1024.com/article\_ite…[12]

如果有错误的话欢迎大家帮忙指正嗷！！！强烈推荐 7km 的图解 react！ 谢谢大家～～～～

关于本文  

作者：抱枕同学

https://juejin.cn/post/7202085514400038969

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波

```