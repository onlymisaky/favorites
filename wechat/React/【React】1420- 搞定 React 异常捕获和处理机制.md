> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/yN2RHKZVjH8538Cg_SnJEw)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCWcOqkaGKCRtRCGXjIeTia2ACDoS1YnWbpeOjLELibkOgj4Mpc7sGHKicCHFykvN272of8CYeGypwEsA/640?wx_fmt=jpeg)

  

> React 异常处理最重要的目标之一就是保持浏览器的`Pause on exceptions`行为。这里你不仅能学到 React 异常捕获的知识，还能学到如何模拟 try catch

大纲
--

*   React 开发和生产环境捕获异常的实现不同
    
*   如何捕获异常，同时不吞没用户业务代码的异常
    
*   如何模拟 try catch 捕获异常
    
*   React 捕获用户所有的业务代码中的异常，除了异步代码无法捕获以外。
    
*   React 使用 handleError 处理 render 阶段用户业务代码的异常，使用 captureCommitPhaseError 处理 commit 阶段用户业务代码的异常，而事件处理函数中的业务代码异常则简单并特殊处理
    
*   render 阶段抛出的业务代码异常，会导致 React 从 ErrorBoundary 组件或者 root 节点重新开始执行。而 commit 阶段抛出的业务代码异常，会导致 React 从 root 节点重新开始调度执行！
    

前置基础知识
------

如果还不熟悉 JS 异常捕获，比如全局异常捕获，Promise 异常捕获，异步代码异常捕获。自定义事件，以及 dispatchEvent 的用法。React 错误边界等基础知识的，可以参考以下几篇短文。如果已经熟悉了，可以跳过。

*   JS 异常捕获基础 [2]
    
*   自定义事件以及 dispatchEvent 基础知识 [3]
    
*   React 错误边界 [4]
    

为什么 Dev 模式下， React 不直接使用 try catch，而是自己模拟 try catch 机制实现异常捕获？
-------------------------------------------------------------

### 开发环境的目标：保持 Pause on exceptions 的预期行为

要回答这个问题，我们先看下 React 源码中一段关于异常捕获机制的描述：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzGDvoRgn8xGibAje2sD4CkNEJhnuU18DCXhX8CIAxUcs5NE99porvhNxA/640?wx_fmt=other)exception-01.jpg

同时结合这个 issue[5] 可以知道，**React 异常处理最重要的目标之一就是保持浏览器的`Pause on exceptions`行为**。如果对`Pause on exceptions`不熟悉的，可以看这篇文章 [6]

React 将用户的所有业务代码包装在 `invokeGuardedCallback` 函数中执行，比如构造函数，生命周期方法等，这些业务代码的异常会在 invokeGuardedCallback 函数中捕获。

**这些方法内部的逻辑是用户自己实现的，并且大部分在 React 的 render 阶段调用，理论上这些方法内部所抛出的任何异常，都应该让用户自行捕获**，比如下面的代码中

```
useLayoutEffect(() => {  console.log(aaadd);}, []);复制代码
```

`useLayoutEffect`内部的逻辑是用户自己实现的，由于用户没有自己实现 try catch 捕获异常，那么理论上`useLayoutEffect`内部抛出的异常应该可以被浏览器的`Pause on exceptions`自动定位到。

在生产环境中，`invokeGuardedCallback` 使用 try catch 捕获异常，因此所有的用户代码异常都被视为已经捕获的异常，不会被`Pause on exceptions`自动定位到，当然用户也可以通过开启 `Pause On Caught Exceptions` 自动定位到被捕获的异常代码位置。

但是这并不直观，因为即使 React 已经捕获了错误，从开发者的角度来说，错误是没有捕获的 (毕竟用户没有自行捕获这个异常，而 React 作为库，不应该吞没异常)，**因此为了保持预期的 `Pause on exceptions` 行为，React 不会在 Dev 中使用 try catch**，而是使用 custom event[7] 以及 dispatchEvent[8] 模拟 try catch 的行为。

### 防止用户业务代码被第三方库吞没

根据这个 issue[9] 可以知道，React 异常捕获还有一个目标就是防止用户业务代码被其他第三方库的**异步代码**吞没。比如 react redux，redux saga 等。例如在 redux saga 中这么调用了 setState：

```
Promise.resolve()  .then(() => {    this.setState({ a: 1 });  })  .catch((err) => {    console.log(err);  });复制代码
```

如果 React 不经过 invokeguardcallback 捕获异常，那么 setState 的触发的 render 的异常将会被 promise.catch 捕获，在用户的角度看来，这个异常被吞没了。

React16 以后由于有了 invokeguardcallback 捕获异常，在异步代码中调用 setState 触发的 render 的异常不会被任何 try catch 或者 promise catch 吞没。比如：

```
<div  onClick={() => {    Promise.resolve()      .then(() => {        setCount({ a: 1 });      })      .catch((e) => {        console.log("Swallowed!", e);      });  }}>  {count}</div>复制代码
```

Promise 的 catch 虽然可以捕获异常，但是 React 还是可以照样抛出异常，控制台还是会打印 Error 信息

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzGJYeIsMzWChWFicYbhYzk9V8Rm2wDDy2dXY6dqJdUInZ6RtgULS8wFKA/640?wx_fmt=other)exception-04.jpg

```
<div  onClick={() => {    setTimeout(() => {      try {        setCount({ a: 1 });      } catch (e) {        console.log("e...", e);      }    }, 0);  }}>  {count}</div>复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzG9fUDQfwAJROAfvNIjU0Zic2K2aShicmxvPCHQvGNK81nl7jZGNXv3OXA/640?wx_fmt=other)exception-05.jpg

> 这同时也告诉我们一个道理，作为一个库工具开发者，我们不应该吞没用户的异常

### 使用 dispatchEvent 模拟 try catch，同时又能保持浏览器开发者工具 Pause on exceptions 的预期行为

dispatchEvent 能够模拟 try catch，是基于下面的特性：

*   通过 dispatchEvent 触发的事件监听器是按顺序同步执行的，具体例子可以看这里 [10]
    
*   自定义事件监听器内部抛出的异常可以被全局异常监听器监听到并且会**立即执行!!!!! 同时仍然可以被 Pause on exceptions 自动定位到**，具体例子可以看这里 [11]
    

这么说有点抽象，我们再来复习一个简单的例子：

```
<!DOCTYPE html><html lang="en">  <head>    <meta charset="utf-8" />    <title>dispatchEvent</title>    <meta      >click me</button>    </div>    <script>      window.onerror = (e) => {        console.log("全局异常监听器...", e);      };      const event = new Event("MyCustomEvent", { bubbles: true });      root.addEventListener("MyCustomEvent", function (e) {        console.log("root第一个事件监听器", e);      });      btn.addEventListener("MyCustomEvent", function (e) {        console.log("btn第一个事件监听器", e);        throw Error("btn事件监听器抛出的异常");        console.log("这一句不会被执行到，因此不会被打印");      });      btn.addEventListener("MyCustomEvent", function (e) {        console.log("btn第2个事件监听器", e);      });      console.log("开始触发自定义事件");      btn.dispatchEvent(event);      console.log("自定义事件监听函数执行完毕");    </script>  </body></html>复制代码
```

这个例子首先注册一个全局异常监听器，然后创建自定义的事件，给 btn、root 添加监听自定义事件的监听器，其中 btn 的第一个监听器抛出一个异常。最后通过 `dispatchEvent` 触发自定义事件监听器的执行。执行结果如下所示：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzGnuq5iaicibg2LJRiarEpU9ia8vlj6GstDN2LjCSkumG3TpHpjTnhv0hLESA/640?wx_fmt=other)exception-02.jpg

**从图中的执行结果可以看出，btn 的第一个事件监听器抛出的异常会立即被全局异常监听器捕获到，并立即执行。** 这个效果和 try catch 完全一致！！！同时，即使自定义事件监听器的异常被全局异常监听器捕获到了，仍然可以被`Pause on exceptions`自动定位到，这就是 React 想要的效果！！！

```
console.log("开始");try {  console.log("aaaa", dd);} catch (e) {  console.log("捕获异常...", e);}console.log("结束");复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzGlFicuUxJiaJY5aoxxF1ZOfvNMp1EibVq8KtDCnAbQFDp0Aj6Rl8MC8OfA/640?wx_fmt=other)exception-03.jpg

在开发环境中，React 将自定义事件 (fake event) **同步派发**到自定义 dom(fake dom noe) 上，并在自定义事件监听器内调用用户的回调函数，如果用户的回调函数抛出错误，则使用全局异常监听器捕获错误。这为我们提供了 try catch 的行为，而无需实际使用 try catch，又能保持浏览器 `Pause on exceptions` 的预期行为。

Dev 模式下，React 如何实现模拟 try catch 的行为
----------------------------------

在 dev 环境下，invokeGuardedCallback 的实现如下所示，这里是精简后的代码，func 是用户提供的回调函数，比如在 render 阶段，func 就是 beginWork 函数。

dev 环境下在自定义事件监听器中执行用户的回调函数，如果用户的回调函数抛出异常，则被全局的异常监听器捕获，并且立即执行全局异常监听器。可以复制下面的代码在浏览器控制台执行

```
let caughtError = null;function invokeGuardedCallback(func) {  const evt = document.createEvent("Event");  const evtType = "react-invokeguardedcallback";  const fakeNode = document.createElement("react");  function callCallback() {    fakeNode.removeEventListener(evtType, callCallback, false);    // 执行回调函数    func();  }  function handleWindowError(event) {    caughtError = event.error;  }  // 注册全局异常监听器  window.addEventListener("error", handleWindowError);  // 注册自定义事件监听器，在自定义事件中调用用户提供的回调函数  fakeNode.addEventListener(evtType, callCallback, false);  evt.initEvent(evtType, false, false);  fakeNode.dispatchEvent(evt);  // 移除全局异常监听器  window.removeEventListener("error", handleWindowError);}function render() {  console.log("render...", a);}invokeGuardedCallback(render);console.log("执行完成"); // 即使render抛出了异常，这一句代码依然会被执行复制代码
```

在生产环境下，invokeGuardedCallback 的实现如下，使用普通的 try catch 捕获用户提供的函数 func 里面的异常

```
function invokeGuardedCallbackProd(func) {  try {    func();  } catch (error) {    this.onError(error);  }}复制代码
```

React Dev 模式异常捕获及处理
-------------------

在 Dev 环境下，React 使用 `invokeGuardedCallback` 包裹几乎所有的用户业务代码，我全局搜索了一下 `invokeGuardedCallback` 函数的调用，总共有以下几个地方调用了 `invokeGuardedCallback` 函数捕获异常，涵盖了所有的用户业务代码：

*   合成事件的回调函数，将第一个错误重新抛出
    
*   类组件 componentWillUnmount 生命周期方法，避免 componentWillUnmount 中的异常阻断组件卸载。然后在 captureCommitPhaseError 中处理异常
    
*   DetachRef，释放 Ref。如果 Ref 是一个函数，在组件卸载的时候会执行 ref，用户业务代码的异常 (包括生命周期方法和 refs) 都不应该打断删除的过程，因此这些方法都会使用 `invokeGuardedCallback` 包括执行。然后 ref 中的异常会在 captureCommitPhaseError 中处理
    
*   useLayoutEffect 以及 useEffect 的清除函数以及 useEffect 的监听函数，然后使用 captureCommitPhaseError 处理异常
    
*   commit 阶段的 commitBeforeMutationEffects、commitMutationEffects、commitLayoutEffects 函数，然后使用 captureCommitPhaseError 处理异常
    
*   render 阶段的 beginWork 方法先使用 try catch 捕获异常，如果 beginWork 有异常抛出，则将 beginWork 包裹进 invokeGuardedCallback 重新执行，并重新抛出异常，然后在 handleError 方法中处理异常
    

可以看出，在 dev 环境中，我们**所有的业务代码**都被`invokeGuardedCallback`包裹并且执行，我们业务代码中的异常都会被 `invokeGuardedCallback` 捕获。除了合成事件中的异常特殊处理外，在 render 阶段调用的方法，比如构造函数，一些生命周期方法中的异常，都在`handleError`中处理。在 commit 阶段调用的方法，比如 useEffect 的监听函数等方法的异常，都在`captureCommitPhaseError`中处理。

**总的来说，React 使用 invokeGuardedCallback 捕获我们业务代码中的异常，然后在`handleError`或者`captureCommitPhaseError`处理异常**

**但是，我们也需要明白一点，并不是所有的用户业务代码中的异常都会被错误边界处理**

并不是用户的所有业务代码都能被 React 错误边界处理！！！

并不是用户的所有业务代码都能被 React 错误边界处理！！！

并不是用户的所有业务代码都能被 React 错误边界处理！！！

一般情况下，React 错误边界 [12] 能够处理大部分的用户业务代码的异常，包括 render 阶段以及 commit 阶段执行的业务代码，但是并不能捕获并处理以下的用户业务代码异常：

*   事件处理
    
*   异步代码
    
*   服务端渲染的异常
    

下面，逐一介绍合成事件异常捕获及处理、`handleError`异常处理、`captureCommitPhaseError`异常处理

### 合成事件回调函数中的异常捕获及处理

合成事件中的异常不会被 React 错误边界处理

React 会捕获合成事件中的错误，但只会将第一个重新抛出，**同时并不会在控制台打印 fiber 栈信息**，举个例子：

```
<div  onClick={() => {    console.log("b...", b);  }}>  <div    onClick={() => {      console.log("a..", a);    }}  >    click me  </div></div>复制代码
```

当我们点击'click me' 时，React 会沿着冒泡阶段调用所有的监听函数，并捕获这些错误打印出来。但是，React 只会将第一个错误 ** 重新抛出 (rethrowCaughtError)**。可以发现下图中 React 捕获了这两个监听函数中的错误并打印了出来，但 React 只会将第一个监听函数中的错误重新抛出。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzG5saq9f8NhUnmOvFRe9H5icjDicMiaG6YLEqyoyJBibNiau6jj6iciapd7mtoA/640?wx_fmt=other)exception-06.jpg

### Render 阶段异常处理：handleError 如何处理异常

handleError 只用于处理 render 阶段在`beginWork`函数中执行的用户业务代码抛出的异常，比如构造函数，类组件的 render 方法、函数组件、生命周期方法等

为了方便演示，我将`renderRootSync`的主要逻辑简化如下，这也是 React render 阶段的主要逻辑，以下代码可以直接复制在浏览器控制台运行：

```
let workInProgress = 0;let caughtError;function renderRootSync(root, lanes) {  do {    try {      workLoopSync();      break;    } catch (thrownValue) {      console.log("renderRootSync捕获了异常.....", thrownValue);      // handleError(root, thrownValue);      return;    }  } while (true);}function workLoopSync() {  while (workInProgress !== null) {    performUnitOfWork(workInProgress);  }}function performUnitOfWork(unitOfWork) {  const next = beginWork$1(unitOfWork);  if (next > 4) {    // 模拟completeUnitOfWork    // completeUnitOfWork(unitOfWork);  } else {    workInProgress = next;  }}function invokeGuardedCallback(func, arg) {  const evt = document.createEvent("Event");  const evtType = "react-invokeguardedcallback";  const fakeNode = document.createElement("react");  function callCallback() {    fakeNode.removeEventListener(evtType, callCallback, false);    func(arg);  }  function handleWindowError(event) {    caughtError = event.error;  }  window.addEventListener("error", handleWindowError);  fakeNode.addEventListener(evtType, callCallback, false);  evt.initEvent(evtType, false, false);  fakeNode.dispatchEvent(evt);  window.removeEventListener("error", handleWindowError);}function beginWork(unitOfWork) {  console.log("beginWork....", unitOfWork);  if (unitOfWork === 2) {    throw Error("unitOfWork等于2时抛出错误，模拟异常");  }  return unitOfWork + 1;}function beginWork$1(unitOfWork) {  const originalWorkInProgressCopy = unitOfWork;  try {    // 先执行一遍beginWork    return beginWork(unitOfWork);  } catch (originalError) {    // 重置unitOfWork    unitOfWork = originalWorkInProgressCopy; // assignFiberPropertiesInDEV    // 重新开始执行beginWork    invokeGuardedCallback(beginWork, unitOfWork);    // 重新抛出错误，这次抛出的错误会被handleError捕获并处理    if (caughtError) {      throw caughtError;    }  }}renderRootSync();复制代码
```

从上面代码可以看出，如果`beginWork`函数发生了异常，那么会被 try catch 捕获，并且 React 会在 catch 里面重新将 beginWork 包裹进`invokeGuardedCallback`函数中 ** 重复执行!!!**。前面说过，使用 try catch 捕获异常，会破坏浏览器的`Pause on exceptions`预期的行为，因此如果 beginWork 抛出了异常，则需要将 beginWork 包裹进`Pause on exceptions`重复执行，在`invokeGuardedCallback`抛出的异常不会被吞没

> 其实我不太明白这里为啥需要重复执行，一开始就完全可以将 beginWork 包裹进`invokeGuardedCallback`中执行，这样既能捕获异常，还能保持浏览器的预期行为，详情可以查看这个 issue[13]，有懂哥可以指教一下。

第二次执行`beginWork`时，如果抛出异常，则会被`handleError`捕获并处理，下面我们详细了解下`handleError`如何处理异常

以下面的代码为例：

```
import React from "react";import ReactDOM from "react-dom";import Counter from "./counter";import ErrorBoundary from "./error";class Home extends React.Component {  constructor(props) {    super(props);  }  render() {    return (      <ErrorBoundary>        <Counter />      </ErrorBoundary>    );  }}const Counter = () => {  const [count, setCount] = useState({});  return <div id="counter">{count}</div>;};ReactDOM.render(<Home />, document.getElementById("root"));复制代码
```

`renderRootSync`也是一个循环，这里需要注意，循环结束的条件是要么`hanleError`重新抛出异常终止函数执行，要么`workLoopSync`正常执行完成，到 break 语句退出。

```
function renderRootSync(root, lanes) {  do {    try {      workLoopSync();      break;    } catch (thrownValue) {      console.log("renderRootSync捕获了异常.....", thrownValue);      handleError(root, thrownValue);    }  } while (true);}复制代码
```

当`workLoopSync`执行的过程中发生异常时，会被`handleError`捕获。`handleError` 会从当前抛出异常的 fiber 节点开始 (这里是 div#counter 对应的 fiber 节点) 往上找到最近的错误边界组件，即 ErrorBoundary，如果不存在 ErrorBoundary 组件，则会找到 root fiber。然后 handleError 执行完成。循环继续，此时`workLoopSync`重新执行，`workLoopSync`又会从 root fiber 重新执行，这里有两种情况

*   如果存在 ErrorBoundary，那么`workLoopSync`会从 ErrorBoundary 开始执行，并渲染 ErrorBoundary 的备用 UI
    
*   如果不存在 ErrorBoundary，那么`workLoopSync`会从 root 节点开始执行，React 会直接卸载整个组件树，页面崩溃白屏。然后在 commit 阶段执行完成后将异常重新抛出，这次抛出的异常会被浏览器的 `Pause on exceptions` 捕获到
    

因此，`workLoopSync`的重复执行，要么会让页面崩溃，要么显示我们的备用 UI。

```
function handleError(root, thrownValue) {  do {    var erroredWork = workInProgress;    try {      throwException(root, erroredWork.return, erroredWork, thrownValue);      completeUnitOfWork(erroredWork);    } catch (yetAnotherThrownValue) {      // Something in the return path also threw.      continue;    }    return;  } while (true);}复制代码
```

而往上查找 ErrorBoundary 的任务就由`throwException`函数完成。throwException 主要做两件事：

*     
    

1.  调用`createCapturedValue`从当前抛出异常的 fiber 节点开始往上找出所有的 fiber 节点并收集起来，用于在控制台打印 fiber 栈，如下：
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHq8YNzHSVyTeLTn9muibnhzGicZLRRF7bQELfxiayNtVfbtfDXJPibcOK23ichviaqEgOnmLoMr5f93rLibg/640?wx_fmt=other)exception-07.jpg

*     
    

2.  while 循环负责往上找 ErrorBoundary 组件，如果找不到 ErrorBoundary 组件，则找到 root fiber 来处理异常。这里需要注意这个查找过程，只会找类组件以及 root 节点。同时，类组件需要满足实现`getDerivedStateFromError`或者`componentDidCatch`方法才能成为 ErrorBoundary
    

> 注意！！createRootErrorUpdate 创建的更新对象中，update.element 已经被重置为 null 了，因此在 workLoopSync 第二次执行时，root 的子节点是 null，这也是为啥我们页面白屏的原因。如果是找到了 ErrorBoundary 组件，createClassErrorUpdate 在创建 update 对象时，会将 getDerivedStateFromError 做为 update.payload，这样在 workLoopSync 重复执行时，render 阶段就会执行这个 getDerivedStateFromError 函数以获取 ErrorBoundary 的 state

```
function throwException(root, returnFiber, sourceFiber, value) {  sourceFiber.flags |= Incomplete; // 将当前fiber节点标记为未完成  // 由于当前fiber节点已经抛出异常，他对应的副作用链表已经没用了，需要重置  sourceFiber.firstEffect = sourceFiber.lastEffect = null;  // createCapturedValue主要的一个功能就是从发生异常的fiber节点开始，往上继续找出所有的fiber节点信息，用于在控制台  // 打印fiber栈信息  value = createCapturedValue(value, sourceFiber);  var workInProgress = returnFiber;  do {    switch (workInProgress.tag) {      case HostRoot: {        var _errorInfo = value;        workInProgress.flags |= ShouldCapture;        // 注意！！createRootErrorUpdate创建的更新对象中，update.element已经被重置为null了，因此在workLoopSync第二次执行时，root的子节点是null，这也是为啥我们页面白屏的原因        var _update = createRootErrorUpdate(workInProgress, _errorInfo, lane);        enqueueCapturedUpdate(workInProgress, _update);        return;      }      case ClassComponent:        // Capture and retry        var errorInfo = value;        var ctor = workInProgress.type;        var instance = workInProgress.stateNode;        if (          (workInProgress.flags & DidCapture) === NoFlags &&          (typeof ctor.getDerivedStateFromError === "function" ||            (instance !== null &&              typeof instance.componentDidCatch === "function"))        ) {          workInProgress.flags |= ShouldCapture;          var _update2 = createClassErrorUpdate(            workInProgress,            errorInfo,            _lane          );          enqueueCapturedUpdate(workInProgress, _update2);          return;        }        break;    }    workInProgress = workInProgress.return;  } while (workInProgress !== null);}复制代码
```

注意，`throwException`执行完成后，会调用`completeUnitOfWork`继续完成工作。此时的 completeUnitOfWork 会走 else 的逻辑，主要做几件事：

*   调用 unwindWork 恢复 context 栈信息，并且找到 ErrorBoundary 组件，如果存在 ErrorBoundary，则将当前的 fiber 返回并终止 completeUnitOfWork 函数执行。否则返回 root 节点。
    
*   往上将抛出异常的 fiber 节点的父节点都标记为 Incomplete 并调用 completeUnitOfWork 完成父节点
    

```
// 主要两个工作// 调用unwinkWork重置context，然后往上找到最近的能够处理异常的ErrorBoundary，找不到的话，那就是root节点function completeUnitOfWork(unitOfWork) {  var completedWork = unitOfWork;  do {    var current = completedWork.alternate;    var returnFiber = completedWork.return;    if ((completedWork.flags & Incomplete) === NoFlags) {    } else {      // 当前fiber没有完成，因为有异常抛出，因此需要从栈恢复      var _next = unwindWork(completedWork);      if (_next !== null) {        _next.flags &= HostEffectMask;        workInProgress = _next;        return;      }      if (returnFiber !== null) {        returnFiber.firstEffect = returnFiber.lastEffect = null;        returnFiber.flags |= Incomplete;      }    }    completedWork = returnFiber; // Update the next thing we're working on in case something throws.    workInProgress = completedWork;  } while (completedWork !== null);}复制代码
```

看到这里，需要注意一点，workLoopSync 第二次重复执行时，从哪个节点开始，也是分情况的：

*   如果没有找到 ErrorBoundary，那么从 root fiber 节点开始执行 performUnitOfWork
    
*   如果找到 ErrorBoundary 组件，那么只需要从 ErrorBoundary 组件开始执行 performUnitOfWork
    

#### handleError 总结

总的来说，handleError 用来处理 render 阶段抛出的异常，其主要目的是找到最近的能够处理异常的 ErrorBoundary 组件或者 root 节点。从当前抛出异常的节点开始，往上找，直到找到 ErrorBoundary 组件或者 root 节点。并将 cotext 恢复到 ErrorBoundary 或者 root 节点，然后重复执行 workLoopSync，第二次执行的 workLoopSync 从 ErrorBoundary 或者 root 节点开始执行 render 的过程

### commit 阶段异常处理：captureCommitPhaseError 如何处理异常

还是以上面的代码为例，这次修改一下 Couter 组件，在 useEffect 中抛出异常：

```
const Counter = () => {  const [count, setCount] = useState(0);  useEffect(() => {    console.log("use effect...", a);  });  return <div id="counter">{count}</div>;};复制代码
```

`captureCommitPhaseError`用来处理 commit 阶段抛出的异常。主要是做了以下几件事：

*   从当前抛出异常的 fiber 节点开始，往上找，找到 ErrorBoundary 组件或者 root 节点，并创建对应的 update 更新对象。
    
*   调用 `ensureRootIsScheduled` 从 root 节点开始执行。
    

> 这里可以看出，render 阶段的异常会导致 React 从 ErrorBoundary 组件或者 root 节点开始重新执行。而 commit 阶段抛出的异常会导致 React 从 root 节点重新调度执行

```
function captureCommitPhaseError(sourceFiber, error) {  var fiber = sourceFiber.return;  while (fiber !== null) {    if (fiber.tag === HostRoot) {      // captureCommitPhaseErrorOnRoot(fiber, sourceFiber, error);      return;    } else if (fiber.tag === ClassComponent) {      var ctor = fiber.type;      var instance = fiber.stateNode;      if (        typeof ctor.getDerivedStateFromError === "function" ||        typeof instance.componentDidCatch === "function"      ) {        var errorInfo = createCapturedValue(error, sourceFiber);        var update = createClassErrorUpdate(fiber, errorInfo, SyncLane);        enqueueUpdate(fiber, update);        if (root !== null) {          markRootUpdated(root, SyncLane, eventTime);          ensureRootIsScheduled(root, eventTime);        } else {        }        return;      }    }    fiber = fiber.return;  }}复制代码
```

关于本文

作者：runnerdancer
===============

https://juejin.cn/post/7128647268730667021  

  

往期回顾

  

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[3 分钟掌握 Node.js 版本的区别](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467578&idx=1&sn=c13257ab0adbd070ad748b9ad2277806&chksm=b1c21cd386b595c5cec50d1026651851f30fe339da10c7da81dabd56f5cb6e75c15b297ca1a5&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)