> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iINZJRgGL6RNaHpBgQ8UnA)

>   

引言
==

相信大家对 React 都已经非常熟悉了，像 React，Vue 这样的现代前端框架已经是我们日常开发离不开的工具了，这篇文章主要是从源码的角度剖析 React 的核心渲染原理。我们将从用户编写的组件代码开始，一步一步分析 React 是如何将它们变成真实 DOM ，这个过程主要可以分成两个阶段：render 阶段和 commit 阶段。文章的核心内容也正是对这两个阶段的分析。

一、前置知识
======

声明式渲染
-----

*   『声明式渲染』，顾名思义，就是让使用者只需要**「声明或描述」**我需要渲染的东西是什么，然后就把具体的渲染工作交给机器去做，与之相对的是『命令式渲染』。
    
*   『命令式渲染』则是由用户去一步一步地命令机器下一步该怎么做。
    

举个简单的例子：

如果我们需要在网页上渲染一个有三个节点的列表，命令式的做法是手动操作 dom，首先创建一个容器节点，再利用循环每次先创建一个新节点，填充内容，然后将新节点新增到容器节点下，最后再将容器节点新增到 body 标签下：

```
const list = [1,2,3];const container = document.createElement('div');for (let i = 0; i < list.length; i ++) {    const newDom = document.createElement('div');    newDom.innerHTML = list[i];    container.appendChild(newDom);}document.body.appendChild(container);
```

而声明式的做法应该是：

```
const list = [1,2,3];const container = document.createElement('div');const Demo = () =>(<div>    {list.map((item) => <div>{item}</div>)}</div>)ReactDom.render(<Demo />, container);
```

可以看到在这个例子中，声明式写法以 HTML 语法直接告诉机器，我需要的视图应该是长这个样子，然后具体的 DOM 操作全部交由机器去完成。开发者只需要专注于业务逻辑的实现。

这便是声明式渲染。

声明式渲染是现代前端框架的比较普遍的设计思路。

JSX 和 ReactElement
------------------

相信大家最初学 React 的时候都有这样的疑问，为什么我们能够以类似 HTML 的语法编写组件，这个东西又是怎么转换成 JavaScript 语法的？答案就是 Babel。根据官网介绍，这种语法被称为 JSX，是一个 JavaScript 的语法扩展。能够被 Babel 编译成 React.createElement 方法。举个例子：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZobD84bIIGyNwibuIYPNICQ7t7SSroWmrjveQySFMb40fyoJ2vWib0Ntg/640?wx_fmt=png)

通过查阅源码我们可以看到 **「React.createElement」** 方法

```
export function createElement(type, config, children) {  let propName;  // Reserved names are extracted  const props = {};  let key = null;  let ref = null;  let self = null;  let source = null;  ...  return ReactElement(    type,    key,    ref,    self,    source,    ReactCurrentOwner.current,    props,  );}const ReactElement = function(type, key, ref, self, source, owner, props) {  const element = {    // This tag allows us to uniquely identify this as a React Element    $typeof: REACT_ELEMENT_TYPE,    // Built-in properties that belong on the element    type: type,    key: key,    ref: ref,    props: props,    // Record the component responsible for creating this element.    _owner: owner,  };  ...  return element;}
```

可以看到 React 是使用了 element 这种结构来代表一个节点，里面就只有简单的 6 个字段。我们可以看个实际的例子，下面 Count 组件对应的 element 数据结构：

```
function Count({count, onCountClick}) {  return <div onClick={() => { onCountClick()}}>  count: {count}  </div>}<Count />
```

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZD57FLxyTfPERjotWhsrvgb5s2ADXcV9nT7UohEkKdbZluK043wE8Lg/640?wx_fmt=png)

可以看到，element 结构只能反映出 jsx 节点的层级结构，而组件里的各种状态或者返回 jsx 等都是不会记录在 element 中。

目前我们知道，我们编写的 jsx 会首先被处理成 element 结构。

jsx -> element

那 React 又是如何处理 element 的，如刚刚说的，element 里包含的信息太少，只靠 element 显然是不足以映射到所有真实 DOM 的，因此我们还需要更精细的结构。

Fiber 树结构
---------

Fiber 这个单词相信大家多多少少都有听过，它是在 React 16 被引入，关于 Fiber 如何实现任务调度在这篇文章不会涉及，但是 Fiber 的引入不仅仅带来了任务调度方面的能力，整个 React 实现架构也因此重构了一遍，而我们之前经常提到的虚拟 DOM 树在新的 React 架构下被称为 Fiber 树，上面提到的每个 element 都有一个所属的 Fiber。

首先我们先看看源码中 Fiber 的构造函数：

```
function FiberNode(  tag: WorkTag,  pendingProps: mixed,  key: null | string,  mode: TypeOfMode,) {  // Instance  this.tag = tag;            // 标识节点类型，例如函数组件、类组件、普通标签等  this.key = key;  this.elementType = null;  // 标识具体 jsx 标签名  this.type = null;        // 类似 elementType  this.stateNode = null;  // 对应的真实 DOM 节点  // Fiber  this.return = null;    // 父节点  this.child = null;     // 第一个子节点  this.sibling = null;   // 第一个兄弟节点  this.index = 0;  this.ref = null;  this.pendingProps = pendingProps;  // 传入的 props  this.memoizedProps = null;      this.updateQueue = null;   // 状态更新相关  this.memoizedState = null;  this.dependencies = null;  this.mode = mode;  // Effects  this.flags = NoFlags;  this.subtreeFlags = NoFlags;  this.deletions = null;  this.lanes = NoLanes;  this.childLanes = NoLanes;  this.alternate = null;  ...}
```

可以看到 Fiber 节点中的属性很多，其中不仅仅包含了 element 相关的实例信息，还包含了组成 Fiber 树所需的一些 “指针”，组件内部的状态（memorizedState），用于操作真实 DOM 的副作用（effects）等等。

我们以上面的 Count 组件为例看一下它对应的 Fiber 结构：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZTG3xlL4OVvRnrOxY2kEGsFrI6cd9OfKQB1ic1wINtXtbKLlzvfrLxBQ/640?wx_fmt=png)

这里我们先主要介绍一下与形成 Fiber 树相关的三个属性：child, sibling 和 return。他们分别指向 Fiber 的第一个子 Fiber，下一个兄弟 Fiber 和父 Fiber。

以下面的 jsx 代码为例：

```
<App />     // App.jsx        <div>      <header>        <img />        <p>          text        </p>        <Count count={count} onCountClick={handleCLick} />      </header>    </div>    // Count.jsx<div></div>
```

最终形成的 Fiber 树结构为：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZeRo3ib6MDEYSnZWfCkuxxr1l6Z3QDzlP9nliaPrATdqPCgx5gibIMAFKg/640?wx_fmt=png)

总结一下，我们编写的 jsx 首先会形成 element ，然后在 render 过程中每个 element 都会生成对应的 Fiber，最终形成 Fiber 树。

jsx -> element -> Fiber

下面我们正式介绍一下 render 的过程，看看 Fiber 是如何生成并形成 Fiber 树的。

二、渲染（render）过程
==============

核心流程
----

通常 React 运行时会有两个 Fiber 树，一个是根据当前最新组件状态构建出来的，另一个则是上一次构建出来的 Fiber 树，当然如果是首次渲染就没有上一次的 Fiber 树，这时就只有一个了。简单来说，render 过程就是 React **「对比旧 Fiber 树和新的 element」** 然后**「为新的 element 生成新 Fiber 树」**的一个过程。

从源码中看，React 的整个核心流程开始于 **「performSyncWorkOnRoot」** 函数，在这个函数里会先后调用 **「renderRootSync」** 函数和 **「commitRoot」** 函数，它们两个就是分别就是我们上面提到的 render 和 commit 过程。来看 renderRootSync 函数，在 **「renderRootSync」** 函数里会先调用 **「prepareFreshStack」** ，从函数名字我们不难猜出它主要就是为接下来的工作做前置准备，初始化一些变量例如 workInProgress（当前正在处理的 Fiber 节点） 等，接着会调用 **「workLoopSync」** 函数。（这里仅讨论传统模式，concurrent 模式留给 Fiber 任务调度分享），而在 **「workLoopSync」** 完成之后，**「renderRootSync」** 也基本上完成了，接下来就会调用 commitRoot 进入 commit 阶段。

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZcqfD5bIKDn4l1BEXShGf6bUgmbicwH6XlcpHW85JLIGDvh83xG91RHQ/640?wx_fmt=png)

因此整个 render 过程的重点在 **「workLoopSync」** 中，从 **「workLoopSync」** 简单的函数定义里我们可以看到，这里用了一个循环来不断调用 **「performUnitOfWork」** 方法，直到 workInProgress 为 null。

```
function workLoopSync() {  // Already timed out, so perform work without checking if we need to yield.  while (workInProgress !== null) {    performUnitOfWork(workInProgress);  }}
```

而 **「performUnitOfWork」** 函数做的事情也很简单，简单来说就是为传进来的 workInProgress 生成下一个 Fiber 节点然后赋值给 workInProgress。通过不断的循环调用 **「performUnitOfWork」**，直到把所有的 Fiber 都生成出来并连接成 Fiber 树为止。

现在我们来看 **「performUnitOfWork」** 具体是如何生成 Fiber 节点的。

前面介绍 Fiber 结构的时候说过，Fiber 是 React 16 引入用于任务调度提升用户体验的，而在此之前，render 过程是递归实现的，显然递归是没有办法中断的，因此 React 需要使用循环来模拟递归过程。

**「performUnitOfWork」** 正是使用了 **「beginWork」** 和 **「completeUnitOfWork」** 来分别模拟这个 “递” 和“归”的过程。

render 过程是深度优先的遍历，**「beginWork」** 函数则会为遍历到的每个 Fiber 节点生成他的所有子 Fiber 并返回第一个子 Fiber ，这个子 Fiber 将赋值给 workInProgress，在下一轮循环继续处理，直到遍历到叶子节点，这时候就需要 “归” 了。

**「completeUnitOfWork」** 就会为叶子节点做一些处理，然后把叶子节点的兄弟节点赋值给 workInProgress 继续 “递” 操作，如果连兄弟节点也没有的话，就会往上处理父节点。

同样以上面的 Fiber 树例子来看，其中的 Fiber 节点处理顺序应该如下：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZG3zNW5iaapYTmKSTlZDNZaWSd9jlc72Mp8XqwnOk99ia2NcG8IjRN55w/640?wx_fmt=png)

beginWork
---------

在介绍概览的时候说过，React 通常会同时存在两个 Fiber 树，一个是当前视图对应的，一个则是根据最新状态正在构建中的。这两棵树的节点一一对应，我们用 current 来代表前者，我们不难发现，当首次渲染的时候，current 必然指向 null。实际上在代码中也确实都是通过这个来判断当前是首次渲染还是更新。

**「beginWork」** 的目的很简单：

*   更新当前节点（workInProgress），获取新的 children。
    
*   为新的 children 生成他们对应的 Fiber，并**「最终返回第一个子节点（child）」**。
    

在 **「beginWork」** 执行中，首先会判断当前是否是首次渲染。

*   如果是首次渲染：
    

*   则下来会根据当前正在构建的节点的组件类型做不同的处理，源码中这块逻辑使用了大量的 switch case。
    

```
switch (workInProgress.tag) {    case FunctionComponent: {      ...    }    case ClassComponent: {      ...    }    case HostRoot: {      ...    }    case HostComponent: {      ...    }    ...  }
```

*   如果非首次渲染：
    

*   React 会使用一些优化手段，而符合优化的条件则是**「当前节点对应组件的 props 和 context 没有发生变化」**并且 ** 当前节点的更新优先级不够，** 如果这两个条件均满足的话可以直接复制 current 的子节点并返回。如果不满足则同首次渲染走一样的逻辑。
    

```
if (current !== null) {    // 这里处理一些依赖    if (      enableLazyContextPropagation &&      !includesSomeLane(renderLanes, updateLanes)    ) {      const dependencies = current.dependencies;      if (dependencies !== null && checkIfContextChanged(dependencies)) {        updateLanes = mergeLanes(updateLanes, renderLanes);      }    }    const oldProps = current.memoizedProps;    const newProps = workInProgress.pendingProps;    if (      oldProps !== newProps ||      hasLegacyContextChanged() ||      // Force a re-render if the implementation changed due to hot reload:      (__DEV__ ? workInProgress.type !== current.type : false)    ) {      // 如果 props 或者 context 变了      didReceiveUpdate = true;    } else if (!includesSomeLane(renderLanes, updateLanes)) {      didReceiveUpdate = false;      // 走到这里则说明符合优化条件      switch (workInProgress.tag) {        case HostRoot:          ...          break;        case HostComponent:          ...          break;        case ClassComponent: {          ...          break;        }        case HostPortal:          ...          break;        case ContextProvider: {          ...          break;        }        ...              }      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);    } else {      ...      didReceiveUpdate = false;    }  } else {    didReceiveUpdate = false;  }
```

### 更新优化策略应用

开发过程中我们常常希望利用 React 非首次渲染的优化策略来提升性能，如下代码，B 组件是个纯展示组件且内部没有依赖任何 Demo 组件的数据，因此有些同学可能会想当然认为当 Demo 重新渲染时这个 B 组件是符合 React 优化条件的。但结果是，每次 Demo 重新渲染都会导致 B 组件重新渲染。每次渲染时 B 组件的 props 看似没发生变化，但由于 Demo 重新执行后会生成全新的 B 组件（下面会介绍），所以新旧 B 组件的 props 肯定也是不同的。

```
function App() {    return <Demo />}function Demo() {    const [v, setV] = useState();    return (        <div>            <A value={v} />            <B />        </div>      );}
```

那有什么办法可以保持住 B 组件不变吗，答案是肯定的，我们可以把 B 组件放到 Demo 组件外层，这样一来，B 组件是在 App 组件中生成并作为 props 传入 Demo 的，因为不管 Demo 组件状态怎么变化都不会影响到 App 组件，因此 App 和 B 组件就只会在首次渲染时会执行一遍，也就是说 Demo 获取到的 props.children 的引用一直都是指向同一个对象，这样一来 B 组件的 props 也就不会变化了。

```
function App() {    return <Demo>        <B />    </Demo>}function Demo(props) {    const [v, setV] = useState();    return (        <div>            <A value={v} />           {props.children}        </div>      );}
```

### 更新当前节点

通过上面的解析我们知道，当不走优化逻辑时 **「beginWork」** 使用大量的 switch...case 来分别处理不同类型的组件，下来我们以我们熟悉的 Function Component 为例。

**「核心就是通过调用函数组件，得到组件的返回的 element。」**

类似地，对于类组件，则是调用组件实例的 render 方法得到 element。

而对于我们普通的组件，例如 <div></div> ，则是直接取 props.children 即可。

```
function updateFunctionComponent(  current,  workInProgress,  Component,  nextProps: any,  renderLanes,) {  let context;  if (!disableLegacyContext) {    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);    context = getMaskedContext(workInProgress, unmaskedContext);  }  let nextChildren;  prepareToReadContext(workInProgress, renderLanes);  // 执行组件函数获取返回的 element  nextChildren = renderWithHooks(    current,    workInProgress,    Component,    nextProps,    context,    renderLanes,  );    // React DevTools reads this flag.  workInProgress.flags |= PerformedWork;  reconcileChildren(current, workInProgress, nextChildren, renderLanes);  return workInProgress.child;}
```

得到组件返回的 element(s) 之后，下一步就是为他们生成 Fiber，我们查看源码可以看到，不论是函数组件或是类组件或是普通组件，最后返回的 element(s) 都会作为参数传入到 **「reconcileChildren」** 中。

介绍 **「reconcileChildren」** 之前我们先用一张图总结一下 **「beginWork」** 的大致流程：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZ98Duf4sdxkp3WeIQj3RxQO8V1g1icVaDtkcFWhydNjPlj8vic7Via7Drg/640?wx_fmt=png)

### 生成子节点

经过上一步得到 workInProgress 的 children 之后，接下来需要为这些 children element 生成 Fiber ，这就是 **「reconcileChildFibers」** 函数做的事情，这也是我们经常提到的 diff 的过程。

这个函数里主要分两种情况处理，如果是 newChild(即 children element) 是 object 类型，则进入单节点 diff 过程（**「reconcileSingleElement」**），如果是数组类型，则进入多节点 diff 过程（**「reconcileChildrenArray」**）

```
function reconcileChildFibers(    returnFiber: Fiber,    currentFirstChild: Fiber | null,    newChild: any,    lanes: Lanes,  ): Fiber | null {    if (typeof newChild === 'object' && newChild !== null) {      switch (newChild.$typeof) {        case REACT_ELEMENT_TYPE:          return placeSingleChild(            reconcileSingleElement(              returnFiber,              currentFirstChild,              newChild,              lanes,            ),          );        ...      }      if (isArray(newChild)) {        return reconcileChildrenArray(          returnFiber,          currentFirstChild,          newChild,          lanes,        );      }      throwOnInvalidObjectType(returnFiber, newChild);    }    }
```

#### 单节点 diff

```
function reconcileSingleElement(    returnFiber: Fiber,    currentFirstChild: Fiber | null,    element: ReactElement,    lanes: Lanes,  ): Fiber {    const key = element.key;    let child = currentFirstChild;    while (child !== null) {          // 首先比较 key 是否相同      if (child.key === key) {        const elementType = element.type;        ...           // 然后比较 elementType 是否相同          if (child.elementType === elementType) {            deleteRemainingChildren(returnFiber, child.sibling);            const existing = useFiber(child, element.props);            existing.ref = coerceRef(returnFiber, child, element);            existing.return = returnFiber;            return existing;          }                // Didn't match.        deleteRemainingChildren(returnFiber, child);        break;      } else {        deleteChild(returnFiber, child);      }      // 遍历兄弟节点，看能不能找到 key 相同的节点      child = child.sibling;    }    if (element.type === REACT_FRAGMENT_TYPE) {      const created = createFiberFromFragment(        element.props.children,        returnFiber.mode,        lanes,        element.key,      );      created.return = returnFiber;      return created;    } else {      const created = createFiberFromElement(element, returnFiber.mode, lanes);      created.ref = coerceRef(returnFiber, currentFirstChild, element);      created.return = returnFiber;      return created;    }  }
```

本着尽可能复用旧节点的原则，在单节点 diff 在这里，我们会遍历旧节点，对每个遍历到的节点会做一下两个判断：

*   key 是否相同
    
*   key 相同的情况下，elementType 是否相同
    

延伸下来有三种情况：

*   如果 key 不相同，则直接调用 **「deleteChild」** 将这个 child 标记为删除，但是我们不用灰心，可能只是我们还没有找到那个对的节点，所以要继续执行`child = child.sibling;`遍历兄弟节点，直到找到那个对的节点。
    
*   如果 key 相同，elementType 相同，那就是最理想的情况，找到了可以复用的节点，直接调用 **「deleteRemainingChildren」** 把剩余的兄弟节点标记删除，然后直接复用 child 返回。
    
*   如果 key 相同，但 elementType 不同，这是最悲情的情况，我们找到了那个节点，可惜的是这个节点的 elementType 已经变了，那我们也不需要再找了，把 child 及其所有兄弟节点标记删除，跳出循环。直接创建一个新的节点。
    

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZW3MibP1ic8DK3aBwxnykcYTkQox0vu0rxIDHKCbckmSFdw22T02IG8nw/640?wx_fmt=png)

#### 多节点 diff

```
function reconcileChildrenArray(    returnFiber: Fiber,    currentFirstChild: Fiber | null,    newChildren: Array<*>,    lanes: Lanes,) {    let resultingFirstChild: Fiber | null = null;    let previousNewFiber: Fiber | null = null;    let oldFiber = currentFirstChild;    let lastPlacedIndex = 0;    let newIdx = 0;    let nextOldFiber = null;    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {        const newFiber = updateSlot(        returnFiber,        oldFiber,        newChildren[newIdx],        lanes,        );        if (newFiber === null) {          break;        }          lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);          if (previousNewFiber === null) {            resultingFirstChild = newFiber;          } else {            previousNewFiber.sibling = newFiber;          }          previousNewFiber = newFiber;          oldFiber = nextOldFiber;    }    if (newIdx === newChildren.length) {        ...    }    if (oldFiber === null) {        ...    }    for (; newIdx < newChildren.length; newIdx++) {        ...    }    return resultingFirstChild;}function updateSlot(    returnFiber: Fiber,    oldFiber: Fiber | null,    newChild: any,    lanes: Lanes,  ): Fiber | null {    const key = oldFiber !== null ? oldFiber.key : null;    ...    if (newChild.key === key) {      return updateElement(returnFiber, oldFiber, newChild, lanes);    } else {      return null;    }}
```

从源码我们可以看到，在 **「reconcileChildrenArray」** 中，出现了两个循环。

第一轮循环中逻辑如下：

1.  同时遍历 oldFiber 链和 newChildren，判断 oldFiber 和 newChild 的 key 是否相同。
    
2.  如果 key 相同。
    

1.  判断双方 elementType 是否相同。
    
2.  如果相同则复用 oldFiber 返回。
    
3.  如果不同则新建 Fiber 返回。
    

4.  如果 key 不同则直接跳出循环。
    

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZqS6bjwxTiaxicxQ0oJM8FGOoibokUbq8qTXBHS0XQjbfak4QFSZdEUojQ/640?wx_fmt=png)

可以看到第一轮循环只要碰到新旧的 key 不一样时就会跳出循环，换句话说，第一轮循环里做的事情都是基于 key 相同，主要就是「更新」的工作。

跳出循环后，要先执行两个判断

*   newChildren 已经遍历完了：这种情况说明新的 children 全都已经处理完了，只要把 oldFiber 和他所有剩余的兄弟节点删除然后返回头部的 Fiber 即可。
    
*   已经没有 oldFiber ：这种情况说明 children 有新增的节点，给这些新增的节点逐一构建 Fiber 并链接上，然后返回头部的 Fiber 即可。
    

如果以上两种情况都不是，则进入第二轮循环。

在执行第二轮循环之前，先把剩下的旧节点和他们对应的 key 或者 index 做成映射，方便查找。

第二轮循环沿用了第一轮循环的 newIdx 变量，说明第二轮循环是在第一轮循环结束的地方开始再次遍历剩下的 newChildren。

```
const existingChildren = mapRemainingChildren(returnFiber, oldFiber);    for (; newIdx < newChildren.length; newIdx++) {      const newFiber = updateFromMap(        existingChildren,        returnFiber,        newIdx,        newChildren[newIdx],        lanes,      );      if (newFiber !== null) {        if (shouldTrackSideEffects) {          if (newFiber.alternate !== null) {            existingChildren.delete(              newFiber.key === null ? newIdx : newFiber.key,            );          }        }        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);        if (previousNewFiber === null) {          resultingFirstChild = newFiber;        } else {          previousNewFiber.sibling = newFiber;        }        previousNewFiber = newFiber;      }    }            function placeChild(    newFiber: Fiber,    lastPlacedIndex: number,    newIndex: number,  ): number {    newFiber.index = newIndex;    if (!shouldTrackSideEffects) {      // Noop.      return lastPlacedIndex;    }    const current = newFiber.alternate;    if (current !== null) {      const oldIndex = current.index;      if (oldIndex < lastPlacedIndex) {        // This is a move.        newFiber.flags |= Placement;        return lastPlacedIndex;      } else {        // This item can stay in place.        return oldIndex;      }    } else {      // This is an insertion.      newFiber.flags |= Placement;      return lastPlacedIndex;    }  }
```

第二轮循环主要调用了 **「updateFromMap」** 来处理节点，在这里需要用 newChild 的 key 去 existingChildren 中找对应的 Fiber。

*   能找到 key 相同的，则说明这个节点只是位置变了，是可以复用的。
    
*   找不到 key 相同的，则说明这个节点应该是新增的。
    

不管是复用还是新增，**「updateFromMap」** 都会返回一个 newFiber，然后我们需要为这个 newFiber 更新一下它的位置（index），但是仅仅更新这个 Fiber 的 index 还不够，因为这个 Fiber 有可能是复用的，如果是复用的就意味着它已经有对应的真实 DOM 节点了，我们还需要复用它的真实 DOM，因此需要对应更新这个 Fiber 的 flag，但是真的需要对每个 Fiber 都去设置 flag 吗，我们举个例子：

```
// 旧[<div key='a' />, <div key='b' />, <div key='c' />]// 新[<div key='c' />, <div key='a' />, <div key='b' />]
```

如果按照我们刚刚说的做法，这里的 a, b, c 都会被打上 flag，这样一来，在 commit 阶段，这三个 DOM 都会被移动，可是我们知道，这里显然只需要移动一个节点即可，退一万步说我们移动两个节点也比移动所有节点要来的聪明。

其实在这个问题上主要就是我们得区分一下到底哪个节点才是移动了的，这就需要一个参照点，我们要保证在参照点左边都是已经排好顺序了的。而这个参照点就是 lastPlacedIndex。有了它，我们在遍历 newChildren 的时候可能会出现下面两种情况：

*   生成（或复用）的 Fiber 对应的老 index < lastPlacedIndex，这就说明这个 Fiber 的位置不对，因为 lastPlacedIndex 左边的应该全是已经遍历过的 newChild 生成的 Fiber。因此这个 Fiber 是需要被移动的，打上 flag。
    
*   如果 Fiber 对应的老 index >= lastPlacedIndex，那就说明这个 Fiber 的相对位置是 ok 的，可以不用移动，但是我们需要更新一下参照点，把参照点更新成这个 Fiber 对应的老 index。
    

我们举一个例子：

```
// 旧[<div key='a' />, <div key='b' />, <div key='c' />, <div key='d' />]// 新[<div key='c' />, <div key='a' />, <div key='b' />, <div key='d' />, <div key='e' />]
```

lastPlacedIndex 初始值为 0，

首先处理第一个节点 c，给节点 c 的 index 赋值为最新值 0，c.index = 0。

可以看到 c 的 oldIndex 为 2，此时 oldIndex > lastPlacedIndex，无需对 c 做移动，将 lastPlacedIndex 赋值为 2。

此时 lastPlacedIndex = 2。

然后处理节点 a，a.index = 1。

a 的 oldIndex 为 0，此时 oldIndex < lastPlacedIndex，因此需要对 a 打上 Placement 标记，lastPlacedIndex 维持不变。

此时 lastPlacedIndex 仍然等于 2。

然后处理节点 b，b.index = 2。

b 的 oldIndex 为 1，此时 oldIndex < lastPlacedIndex，需要对 b 打上 Placement 标记，将 lastPlacedIndex 维持不变。

此时 lastPlacedIndex 仍然等于 2。

然后处理节点 d，b.index = 3。

d 的 oldIndex 为 3，此时 oldIndex > lastPlacedIndex，无需对 d 做移动，将 lastPlacedIndex 赋值为 3。

此时 lastPlacedIndex = 3。

然后处理节点 e，e.index = 4。

由于 e 是新建节点，所以 e 的 oldIndex 为 0，此时 oldIndex < lastPlacedIndex，因此需要对 e 打上 Placement 标记，lastPlacedIndex 维持不变。

因此最终需要变动位置的节点是 a b e。

这里可以看到其实最高效的改动是移动 c 和 e，但是 React 的 diff 逻辑选择了固定住 c，移动 a b，因此我们平时写代码的时候尽量避免把节点从后面提到前面的操作。

为 newChildren 里的所有 element 都生成了 Fiber 并连接好之后，返回第一个 child ，至此生成子节点的步骤就完成了。

completeUnitOfWork
------------------

在核心流程里我们说到，当 beginWork 处理到叶子节点，返回 null 的时候就会调用 **「completeUnitOfWork」** 函数。

**「completeUnitOfWork」** 主要做的事情有两件：

*   处理当前节点
    
*   “归” 操作
    

### 处理当前节点

**「completeUnitOfWork」** 里主要调用了 **「completeWork」** 来处理当前节点，而在 completeWork 中则是使用了 switch...case... 来处理不同类型的节点，这里我们主要以最常见的 HostComponent 为例。分成首次渲染和非首次渲染两种情况讨论。

#### mount

当是首次渲染时，这里要做的事情主要是：

1.  创建真实 DOM。
    
2.  如果有子节点的话将子节点的真实 DOM 插入到刚刚创建的 DOM 中。
    
3.  处理真实 DOM 的 props 等。
    

```
const currentHostContext = getHostContext();// 为fiber创建对应DOM节点const instance = createInstance(    type,    newProps,    rootContainerInstance,    currentHostContext,    workInProgress,  );// 将子孙DOM节点插入刚生成的DOM节点中appendAllChildren(instance, workInProgress, false, false);// DOM节点赋值给fiber.stateNodeworkInProgress.stateNode = instance;// 处理propsif (  finalizeInitialChildren(    instance,    type,    newProps,    rootContainerInstance,    currentHostContext,  )) {  markUpdate(workInProgress);}
```

#### update

当 update 时，Fiber 节点已经存在对应 DOM 节点，所以不需要生成 DOM 节点。需要做的主要是处理 DOM 节点的 props，这里主要就是一些真实 DOM 的 onClick、onChange 等回调函数的注册，style 等，这些处理完之后的 props 也会记录到 workInProgress.updateQueue 中，并在 commit 阶段更新到 DOM 节点上。

```
if (current !== null && workInProgress.stateNode != null) {  // update的情况  updateHostComponent(    current,    workInProgress,    type,    newProps,    rootContainerInstance,  );}
```

### “归”

刚刚说到，当 **「beginWork」** 返回值为 null 的时候会进入 **「completeUnitOfWork」** 中，可是我们知道 beginWork 是深度优先的更新，也就意味着进入 **「completeUnitOfWork」** 之后必然还需要回到 beginWork 中继续处理其他的节点。

```
...    const siblingFiber = completedWork.sibling;    if (siblingFiber !== null) {      // If there is more work to do in this returnFiber, do that next.      workInProgress = siblingFiber;      return;    }    // Otherwise, return to the parent    completedWork = returnFiber;    // Update the next thing we're working on in case something throws.    workInProgress = completedWork;
```

可以看到，当处理完当前节点之后，React 会判断当前节点是否具有兄弟节点，如果有的话则将兄弟节点设置为当前的 workInProgress 回到主流程继续 **「beginWork。」**

而如果没有兄弟节点的话，就意味着同父节点下的所有子节点都已经处理完毕，则接下来就会处理他们的父节点。

大致流程就是：**「beginWork」** 执行到当前节点没有 child 的时候，进入 **「completeUnitOfWork」** 处理当前节点，处理完后如果当前节点有兄弟节点则回到 **「beginWork」** 继续处理兄弟节点，如果没有兄弟节点则继续在 **「completeUnitOfWork」** 处理当前节点的父节点，直到 “归” 到根结点上。

三、挂载过程（commitRoot）
==================

effect list
-----------

`render阶段`的一个主要工作是收集需要执行的 DOM 操作，然后交给 `commit阶段` 来处理，而这些 DOM 操作的具体类型都会保存在 Fiber 节点的 `effectTag` 属性上。

部分 DOM 操作的类型：

```
// 插入 DOMexport const Placement = /*                */ 0b00000000000010;// 更新 DOMexport const Update = /*                   */ 0b00000000000100;// 插入并更新 DOMexport const PlacementAndUpdate = /*       */ 0b00000000000110;// 删除 DOM 节点export const Deletion = /*                 */ 0b00000000001000;
```

使用二进制来表示可以方便地用位运算给 `effectTag` 带上多个副作用 (effect)，也可以方便地判断是否存在某个副作用。例如有个 fiber 节点 `effectTag` 是 `PlacementAndUpdate` (`0b00000000000110`)，可以通过按位与运算来判断是否存在`Placement`：

```
const effectTag = PlacementAndUpdate;console.log(effectTag & Placement !== 0); // => true
```

在 `commit阶段` 可以像 `render阶段` 那样遍历所有 fiber 节点找出其中的 `effectTag`，但这样效率比较低，所以在 `render阶段` 的 `completeUnitOfWork` 中会把具有 `effectTag` 的 fiber 节点连接起来，形成 `effectList` 链表。例如我们有这样的代码：

```
function App() {  const [count, setCount] = useState(0);  return (    <div onClick={() => setCount(count + 1)}>      <p>{count}</p>      <span>{count}</span>    </div>  );};
```

我们在 `performSyncWorkOnRoot` 方法的末尾的 `finishedWork` 打个断点，然后点击 div 触发一次 `setCount` 更新：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZdBtxj4noG4H336ZRK7wrGNrlECdfQgBgKyULNx91k7tpShrdQrYd6w/640?wx_fmt=png)

当 react 执行到断点这个地方时，我们在控制台打印一下 `finishedWork`：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZ1SDdzHLtwVbTBLxGJVESjibkmsCicVj4BckODYHS10HjrBAiaP284vEDg/640?wx_fmt=png)

所以此时对应的 `effectList`是：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZkicib9xzRewMzIJChicqPMVMCkUib2VvdoG4VicMbjEG4iaq0GrXOWdZxjFw/640?wx_fmt=png)

这里 `span` 和 `p` 节点有 `effectTag` 是因为 `{count}`，`div` 节点有 `effectTag` 是因为重新生成的 `onClick` 函数。

commit 阶段
---------

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZVbV90bUl3AtORE4UZMCl3SHXtDMNiagnsh95r8y65NV5egNsR7VtPdw/640?wx_fmt=png)

`render阶段`结束后，会在`performSyncWorkOnRoot()`或`finishConcurrentRender()`中把 `fiberRootNode` 传给 `commitRoot` 方法，开启 `commit阶段`。

以`performSyncWorkOnRoot`为例：

```
function performSyncWorkOnRoot(root) {    // render阶段的入口函数    renderRootSync(root, lanes);    // ...    // commitRoot函数调用    const finishedWork = root.current.alternate;    root.finishedWork = finishedWork;    root.finishedLanes = lanes;    commitRoot(root);    // ...省略代码}
```

`commit阶段`的一个主要工作就是遍历 `effectList` 并执行对应的 DOM 操作。`commit阶段`又分为三个子阶段：

*   `before mutation阶段`
    
*   `mutation阶段`
    
*   `layout阶段`
    

下面来看看 `commit阶段` 具体发生了什么。

进入 `commitRootImpl` 方法时，会先判断 `rootWithPendingPassiveEffects` 是否为 `null`，如果不为 `null` 就会执行 `flushPassiveEffects`。

```
function commitRootImpl(root, renderPriorityLevel) {  do {    flushPassiveEffects();  } while (rootWithPendingPassiveEffects !== null);  // ...}
```

`rootWithPendingPassiveEffects` 中的`PassiveEffect` 是什么意思呢？我们知道如果一个 fiber 节点的 dom 节点需要被插入到页面中，那 `fiber.effectTag` 就会带上 `Placement` effect，类似的，如果一个 FunctionComponent 有 `useEffect` 需要被执行，那它就会带上 `Passive` effect。

所以这里的意思是进入 `commitRoot` 时先判断当前是否还有未执行的 `useEffect`，如果有，就执行它，也就是说在开启新一轮的 commit 阶段时会先等待上一轮的 useEffect 执行完。这其实在官方文档里也有一些说明：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZEQic90yBMTMt7mXAKTPRgPJXDHnLYc0pibId39hiasIzNgH3lqrzFwqxg/640?wx_fmt=png)

接着会重置 `render阶段`使用到的一些全局变量：

```
function commitRootImpl(root, renderPriorityLevel) {  do {    flushPassiveEffects();  } while (rootWithPendingPassiveEffects !== null);  // ...  if (root === workInProgressRoot) {    workInProgressRoot = null;    workInProgress = null;    workInProgressRootRenderLanes = NoLanes;  }    // ...}
```

处理 `effect list`：

```
function commitRootImpl(root, renderPriorityLevel) {  // ...  let firstEffect;  if (finishedWork.effectTag > PerformedWork) {    if (finishedWork.lastEffect !== null) {      finishedWork.lastEffect.nextEffect = finishedWork;      firstEffect = finishedWork.firstEffect;    } else {      firstEffect = finishedWork;    }  } else {    firstEffect = finishedWork.firstEffect;  }    // ...}
```

上面说过 `render阶段`已经把带有 `effectTag` 的 fiber 节点连接形成一条链表了，这里再次处理 `effect list` 是因为这条链表目前只有子节点，并没有挂载根节点。如果根节点也存在 `effectTag`，那么就需要把根节点拼接到链表的末尾，形成一条完整的 `effect list`：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZHpObnnG9x6Y4W7HRVujEFXKTdsom7W9B3ib2mXeFRvRu3zPwxPVibhwg/640?wx_fmt=png)

同时上面的代码也会取出 `firstEffect`，也就是第一个需要被处理的 fiber 节点。接着判断如果存在 `firstEffect`，会将 `firstEffect 赋值给 nextEffect`，开始三个子阶段的工作。

```
function commitRootImpl(root, renderPriorityLevel) {  // ...  if (firstEffect !== null) {    nextEffect = firstEffect;        // beforeMutation 阶段：    // 执行 commitBeforeMutationEffects        // mutation 阶段：    // 执行 commitMutationEffects        // layout 阶段：    // 执行 commitLayoutEffects  }    // ...}
```

### beforeMutation 阶段

`beforeMutation阶段`会执行 `commitBeforeMutationEffects` 方法

```
function commitBeforeMutationEffects() {  while (nextEffect !== null) {    // ...        const effectTag = nextEffect.effectTag;    if ((effectTag & Snapshot) !== NoEffect) {      // ...      commitBeforeMutationEffectOnFiber(current, nextEffect);    }    // ...    nextEffect = nextEffect.nextEffect;  }}
```

#### 执行 `getSnapshotBeforeUpdate`

在`commitBeforeMutationEffects`这个方法中会遍历带有 effectTag 的 fiber 节点，如果判断有 `Snapshot` effectTag 就会调用 ClassComponent 的 `getSnapshotBeforeUpdate` 生命周期方法：

```
function commitBeforeMutationLifeCycles(  current: Fiber | null,  finishedWork: Fiber,): void {  switch (finishedWork.tag) {    case FunctionComponent:    case ForwardRef:    case SimpleMemoComponent:    case Block: {      return;    }    case ClassComponent: {      if (finishedWork.effectTag & Snapshot) {        if (current !== null) {          // ...          const snapshot = instance.getSnapshotBeforeUpdate(/** ... */);          // ...        }      }      return;    }    case HostRoot: {      // ...      return;    }    case HostComponent:    case HostText:    case HostPortal:    case IncompleteClassComponent:      // Nothing to do for these component types      return;  }}
```

#### 调度 `useEffect`

再看下 `commitBeforeMutationEffects` 的剩余部分：

```
function commitBeforeMutationEffects() {  while (nextEffect !== null) {    // ...        if ((effectTag & Passive) !== NoEffect) {      if (!rootDoesHavePassiveEffects) {        rootDoesHavePassiveEffects = true;        scheduleCallback(NormalSchedulerPriority, () => {          flushPassiveEffects();          return null;        });      }    }    nextEffect = nextEffect.nextEffect;  }}
```

上面提到 `flushPassiveEffects` 用于执行 `useEffect` 的回调函数，而这里并不会立即执行它，而是把它放在 `scheduleCallback` 的回调当中，`scheduleCallback` 方法会以一个优先级异步执行它的回调函数。

所以这段代码的意思是，如果存在 `Passive` effect，则把 `rootDoesHavePassiveEffects` 置为 true，并且调度 `flushPassiveEffects`，而整个 `commit阶段` 是**「同步执行」**的，所以 `useEffect` 的回调函数其实会在 `commit阶段`**「完成后」**再异步执行。

这也跟官方文档说的对应上了：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZJNzkdMYUDD0ghmHql8J1ia1vIpJrxQQ0UevbbkQbd9X2PkwiaT5OmkMA/640?wx_fmt=png)

#### 总结

在 `beforeMutation阶段` 会：

*   执行`getSnapshotBeforeUpdate`生命周期方法
    
*   **「调度」**`useEffect`
    

### mutation 阶段

`mutation阶段`会执行 `commitMutationEffects` 方法：

```
function commitMutationEffects(root: FiberRoot, renderPriorityLevel) {  while (nextEffect !== null) {    const effectTag = nextEffect.effectTag;        // 如果有 ContentReset，会重置文本节点    if (effectTag & ContentReset) {      commitResetTextContent(nextEffect);    }        // 如果有 Ref，会执行 ref 相关的更新    if (effectTag & Ref) {      // ...    }    const primaryEffectTag =      effectTag & (Placement | Update | Deletion | Hydrating);    switch (primaryEffectTag) {      // 如果需要插入节点，会执行 commitPlacement      case Placement: {        commitPlacement(nextEffect);        nextEffect.effectTag &= ~Placement;        break;      }      // 如果需要更新节点，会执行 commitWork      case Update: {        const current = nextEffect.alternate;        commitWork(current, nextEffect);        break;      }      // 如果需要删除节点，会执行 commitDeletion      case Deletion: {        commitDeletion(root, nextEffect, renderPriorityLevel);        break;      }      // ...    }        // 取出下一个 fiber 节点，进入下一次循环    nextEffect = nextEffect.nextEffect;  }}
```

在这个方法中会遍历带有 effectTag 的 fiber 节点，

*   如果有 `ContentReset`，会重置文本节点
    
*   如果有 `Ref`，会执行 ref 相关的操作
    
*   增删改
    

*   如果需要插入节点，会执行 `commitPlacement`
    
*   如果需要更新节点，会执行 `commitWork`
    
*   如果需要删除节点，会执行 `commitDeletion`
    
*   ...
    

#### commitPlacement

在 `commitPlacement` 方法中，会先找到距离最近的 host 类型父节点和距离最近的 host 类型兄弟节点，然后根据 host 父 fiber 节点的类型取出对应的 DOM 节点，接着根据是否 `container` 来执行 `insertOrAppendPlacementNodeIntoContainer` 或 `insertOrAppendPlacementNode`。

```
function commitPlacement(finishedWork: Fiber): void {  // 找到 host 父 fiber 节点  const parentFiber = getHostParentFiber(finishedWork);  let parent;  let isContainer;  const parentStateNode = parentFiber.stateNode;    // 根据 host 父 fiber 节点的类型，取出对应的 DOM 节点  switch (parentFiber.tag) {    case HostComponent:      parent = parentStateNode;      isContainer = false;      break;    case HostRoot:      parent = parentStateNode.containerInfo;      isContainer = true;      break;    case HostPortal:      parent = parentStateNode.containerInfo;      isContainer = true;      break;    // ...  }  // ...  // 获取 host 兄弟节点  const before = getHostSibling(finishedWork);    // 根据是否 container 来决定执行哪个方法  if (isContainer) {    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);  } else {    insertOrAppendPlacementNode(finishedWork, before, parent);  }}
```

为什么需要先找到 host 父 fiber 节点和 host 兄弟 fiber 节点？

我们知道在 DOM 中插入一个节点有两种方式：

*   `parentNode.appendChild(newNode)`
    
*   `parentNode.insertBefore(newNode, referenceNode)`
    

无论哪种方式都需要找到它的父 DOM 节点，而如果需要 `insertBefore` 则还需要找到它的兄弟 DOM 节点。

另外，为什么需要找 host 类型的父节点和兄弟节点呢？这是因为最近的父 **「fiber」** 节点不一定就是最近的父 **「DOM」** 节点，同理，最近的兄弟 **「fiber」** 节点不一样是最近的兄弟 **「DOM」** 节点。例如，我们的代码长这样：

```
function Item() {  return <p></p>}function App() {  return (    <div>      <Item />      <span></span>    </div>  );}
```

它对应的 fiber 树和 dom 树分别是：

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZ2VTErNUpp3Xp57qxVCmveBeqhsD2YcjhMUtWYias2UP8xKSogGtqzBg/640?wx_fmt=png)

可以看到， fiber 树和 don 树并不是一一对应的：

*   p 的 fiber 节点的父节点是 Item，而 p 的 dom 节点的父节点是 div
    
*   p 的 fiber 节点没有兄弟节点，而 p 的 dom 节点有个兄弟节点是 span
    

上面的`insertOrAppendPlacementNodeIntoContainer` 和 `insertOrAppendPlacementNode`做的事情差不多，都会判断是否有 `before`，如果有，则执行 `insertBefore`，没有则执行 `appendChild`：

```
function insertOrAppendPlacementNode(  node: Fiber,  before: ?Instance,  parent: Instance,): void {  // ...  if (before) {    insertBefore(parent, stateNode, before);  } else {    appendChild(parent, stateNode);  }  // ...}
```

`appendChild` 和 `insertBefore` 都来自于 `ReactFiberHostConfig`。

这里的 `ReactFiberHostConfig` 在源码里其实只是一个空壳，最终需要被特定环境的 renderer 来填充，例如在我们平常使用 ReactDOM 时，`ReactFiberHostConfig` 会被 ReactDOM 的 `ReactDOMHostConfig` 来填充：

```
export function appendChild(  parentInstance: Instance,  child: Instance | TextInstance,): void {  parentInstance.appendChild(child);}export function insertBefore(  parentInstance: Instance,  child: Instance | TextInstance,  beforeChild: Instance | TextInstance | SuspenseInstance,): void {  parentInstance.insertBefore(child, beforeChild);}
```

可以看到，其实最终就是执行 dom 节点的 `appendChild` 或 `insertBefore` 方法。

> ❝
> 
> React 仓库其他 renderer 的 `hostConfig`：
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/3xDuJ3eicibllKUUac48T5fQialaBGiamQTZqMEq6a4pNibyqW54a8YO3Mh7licnlDdVkrdliaTTQdw6W1lvXgiag1qTgw/640?wx_fmt=png)

BTW，umijs/hox(https://github.com/umijs/hox) 是一个基于 hooks 的全局状态管理工具，它跟其他基于 hooks 的状态管理工具很大的一个不同点是， hox 不需要我们手动挂载 `<Provider />` 就能直接使用 model：

```
// counterModel.jsimport { useState } from "react";import { createModel } from "hox";function useCounter() {  const [count, setCount] = useState(0);  const decrement = () => setCount(count - 1);  const increment = () => setCount(count + 1);  return {    count,    decrement,    increment  };}export default createModel(useCounter);// index.jsximport useCounterModel from "./counterModel";function App(props) {  const counter = useCounterModel();  return (    <div>      <p>{counter.count}</p>      <button onClick={counter.increment}>Increment</button>    </div>  );}
```

其实它是在调用 `createModel` 时把 hooks 的执行挂在了它自定义的一个 renderer 里，对应的 hostConfig 都是空函数，因为它并不需要执行真正的渲染，只是用来执行 hooks 而已：

```
import ReactReconciler from "react-reconciler";import { ReactElement } from "react";const hostConfig = {  now: Date.now,  getRootHostContext: () => ({}),  prepareForCommit: () => {},  resetAfterCommit: () => {},  getChildHostContext: () => ({}),  shouldSetTextContent: () => true,  createInstance: () => {},  createTextInstance: () => {},  appendInitialChild: () => {},  appendChild: () => {},  finalizeInitialChildren: () => {},  supportsMutation: true,  appendChildToContainer: () => {},  prepareUpdate: () => true,  commitUpdate: () => {},  commitTextUpdate: () => {},  removeChild: () => {}};const reconciler = ReactReconciler(hostConfig as any);export function render(reactElement: ReactElement) {  const container = reconciler.createContainer(null, false, false);  return reconciler.updateContainer(reactElement, container, null, null);}
```

#### commitWork

`commitWork` 用于更新节点。在这个方法中会根据 fiber 节点的类型进行不同的操作：

```
function commitWork(current: Fiber | null, finishedWork: Fiber): void {  switch (finishedWork.tag) {    case FunctionComponent:    case ForwardRef:    case MemoComponent:    case SimpleMemoComponent:    case Block: {      // ...      return;    }    case ClassComponent: {      return;    }    case HostComponent: {      // ...      return;    }    case HostText: {      // ...      return;    }    // case...  }}
```

对于 FunctionComponent，更新时会执行 `commitHookEffectListUnmount(``HookLayout` `| HookHasEffect, finishedWork)`：

```
function commitHookEffectListUnmount(tag: number, finishedWork: Fiber) {  const updateQueue = finishedWork.updateQueue;  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;  if (lastEffect !== null) {    const firstEffect = lastEffect.next;    let effect = firstEffect;    do {      if ((effect.tag & tag) === tag) {        const destroy = effect.destroy;        effect.destroy = undefined;        if (destroy !== undefined) {          destroy();        }      }      effect = effect.next;    } while (effect !== firstEffect);  }}
```

里面会遍历 effect list，判断 `effect.tag` 是否存在参数传入的 `tag` 类型，在这个场景里被传入 tag 参数是 `HookLayout`，也就是 `useLayoutEffect` 对应的 effect tag。所以这里的意思是遍历 effect list，如果存在 `useLayoutEffect` 的 effect tag，则执行它的销毁函数（即 `useLayoutEffect` 的回调函数的返回值）。

如果 fiber 节点的类型是 `HostComponent`，也就是 dom 节点对应的 fiber 节点，更新时会执行 `commitUpdate` 方法：

```
function commitWork(current: Fiber | null, finishedWork: Fiber): void {  switch (finishedWork.tag) {    // ...    case HostComponent: {      const instance: Instance = finishedWork.stateNode;      if (instance != null) {        // ...        const updatePayload: null | UpdatePayload = (finishedWork.updateQueue: any);        // ...        if (updatePayload !== null) {          commitUpdate(            instance,            updatePayload,            type,            oldProps,            newProps,            finishedWork,          );        }        if (enableDeprecatedFlareAPI) {          const prevListeners = oldProps.DEPRECATED_flareListeners;          const nextListeners = newProps.DEPRECATED_flareListeners;          if (prevListeners !== nextListeners) {            updateDeprecatedEventListeners(nextListeners, finishedWork, null);          }        }      }      return;    }    // ...  }}
```

`commitUpdate` 方法接收的参数中有个 `updatePayload`，它来自于 `fiber.updateQueue` 属性，对于类型为 HostComponent 的 fiber 节点来说，它的 `updateQueue` 属性是一个数组，表示这个 dom 节点的属性变更，例如一个 dom 节点在某次更新中它的 `a` 属性需要从 `react` 更新为 `vue`，`b` 属性需要从 `byte` 更新为 `dance`，那这个 dom 节点的 fiber 节点的 `updateQueue` 就长这样 `['a', 'vue', 'b', 'dance']`，也就是说第 i 项是属性 key，第 i + 1 项是属性 value。

`commitUpdate` 方法同样来自 `ReactFiberHostConfig`：

```
export function commitUpdate(  domElement: Instance,  updatePayload: Array<mixed>,  type: string,  oldProps: Props,  newProps: Props,  internalInstanceHandle: Object,): void {  // ...  updateProperties(domElement, updatePayload, type, oldProps, newProps);}
```

它最终会调用 `updateDOMProperties` 来更新 dom 属性：

```
function updateDOMProperties(  domElement: Element,  updatePayload: Array<any>,  wasCustomComponentTag: boolean,  isCustomComponentTag: boolean,): void {  for (let i = 0; i < updatePayload.length; i += 2) {    const propKey = updatePayload[i];    const propValue = updatePayload[i + 1];    if (propKey === STYLE) {      setValueForStyles(domElement, propValue);    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {      setInnerHTML(domElement, propValue);    } else if (propKey === CHILDREN) {      setTextContent(domElement, propValue);    } else {      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);    }  }}
```

这里的 `i` 和 `i + 1` 就对应着上面提到的 `updateQueue` 的数据结构，第 i 项是属性 key，第 i + 1 项是属性 value。

#### commitDeletion

`commitDeletion` 用于执行删除操作：

```
function commitDeletion(  finishedRoot: FiberRoot,  current: Fiber,  renderPriorityLevel: ReactPriorityLevel,): void {  // ...  unmountHostComponents(finishedRoot, current, renderPriorityLevel);  // ...}
```

在 `unmountHostComponents` 中核心是遍历节点调用 `commitUnmount` 方法。在这个方法中会根据 fiber 节点的类型做不同的处理。

对于 FunctionComponent，会注册它的 `useEffect` 销毁函数，其实就是把这个 effect 推进 `pendingPassiveHookEffectsUnmount` 这个数组中，便于**「后续」**取出来执行销毁函数。

```
function commitUnmount(  finishedRoot: FiberRoot,  current: Fiber,  renderPriorityLevel: ReactPriorityLevel,): void {  switch (current.tag) {    case FunctionComponent: {      // ...      enqueuePendingPassiveHookEffectUnmount(current, effect);      // ...      return;    }  }}
```

对于 ClassComponent，会执行它的 `componentWillUnmount` 方法：

```
function commitUnmount(  finishedRoot: FiberRoot,  current: Fiber,  renderPriorityLevel: ReactPriorityLevel,): void {  switch (current.tag) {    case ClassComponent: {      const instance = current.stateNode;      if (typeof instance.componentWillUnmount === 'function') {        safelyCallComponentWillUnmount(current, instance);      }      return;    }  }}
```

### layout 阶段

`layout阶段` 会执行 `commitLayoutEffects` 方法，里面核心是执行`commitLifeCycles`方法。在这个方法中会根据 fiber 节点的类型执行不同的处理。

```
function commitLifeCycles(  finishedRoot: FiberRoot,  current: Fiber | null,  finishedWork: Fiber,  committedLanes: Lanes,): void {  switch (finishedWork.tag) {    case FunctionComponent: {      commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);      schedulePassiveEffects(finishedWork);      return;    }  }}
```

对于 FunctionComponent，会把 HookLayout 这个 tag 类型传给 `commitHookEffectListMount` 方法，也就是说这里会执行 `useLayoutEffect` 的回调函数。

接着会执行 `schedulePassiveEffects` 方法：

```
function schedulePassiveEffects(finishedWork: Fiber) {  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;  if (lastEffect !== null) {    const firstEffect = lastEffect.next;    let effect = firstEffect;    do {      const {next, tag} = effect;      if (        (tag & HookPassive) !== NoHookEffect &&        (tag & HookHasEffect) !== NoHookEffect      ) {        enqueuePendingPassiveHookEffectUnmount(finishedWork, effect);        enqueuePendingPassiveHookEffectMount(finishedWork, effect);      }      effect = next;    } while (effect !== firstEffect);  }}
```

在这里会分别注册 `useEffect` 销毁函数和回调函数，其实也就是把 effect 分别推进 `pendingPassiveHookEffectsUnmount` 和 `pendingPassiveHookEffectsMount` 这两个数组中，用于**「后续」**取出来执行。

对于 ClassComponent，如果 `current` 为空，也就是这个节点是首次 render，则会执行它的 `componentDidMount` 生命周期方法，否则会执行 `componentDidUpdate` 方法：

```
function commitLifeCycles(  finishedRoot: FiberRoot,  current: Fiber | null,  finishedWork: Fiber,  committedLanes: Lanes,): void {  switch (finishedWork.tag) {    case ClassComponent: {      const instance = finishedWork.stateNode;      if (finishedWork.effectTag & Update) {        if (current === null) {          instance.componentDidMount();        } else {          instance.componentDidUpdate(            prevProps,            prevState,            instance.__reactInternalSnapshotBeforeUpdate,          );        }      }      return;    }  }}
```

commit 阶段总结
-----------

*   等待执行完上一轮渲染的 useEffect
    
*   重置一些全局变量（如：workInProgressRoot）
    
*   更新副作用列表 effect list。根节点的副作用列表是不包括自身的，如果根节点有副作用, 则需要把根节点添加到副作用列表的末尾
    
*   渲染
    

*   执行 `componentDidMount`、`componentDidUpdate`
    
*   执行 `useLayoutEffect` 的回调函数
    
*   注册 `useEffect` 的回调函数和销毁函数，等 commit 阶段结束后再异步执行
    

*   执行 DOM 增删改
    
*   执行 `useLayoutEffect` 的销毁函数
    

*   执行 `getSnapshotBeforeUpdate`
    
*   调度 `useEffect`
    

*   beforeMutation
    
*   mutation
    
*   切换当前 fiber 树（`root.current = finishedWork`），使得 `fiberRoot` 的 `current` 指向的是当前页面展示的 fiber 树。
    
*   layout