> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/NLJlcdhMcPPgrS8KrnmQ9A)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHr6cr6Yr0SicphAT6G3HzezBxV3ZTOZsWKhLibSyG7a6ovQwUeBEkGweQ/640?wx_fmt=png)

来源：Aaaaaaaaaaayou  

https://juejin.im/post/6863083643427979271

> 说明：本文结论均基于 React 16.13.1 得出，若有出入请参考对应版本源码

几个题目
====

我们先来看几个题目，如果你都能很确定的说出结果，那么这篇文章就不用看了。

点击 `BUTTON` 打印的结果是：

题目一：

```
export default class App extends React.Component {  innerClick = () => {    console.log('A: react inner click.')  }  outerClick = () => {    console.log('B: react outer click.')  }  componentDidMount() {    document.getElementById('outer').addEventListener('click', () => {      console.log('C: native outer click')    })    document.getElementById('inner').addEventListener('click', () => {      console.log('D: native inner click')    })  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

答案：D C A B

题目二：

```
export default class App extends React.Component {  innerClick = (e) => {    console.log('A: react inner click.')    e.stopPropagation()  }  outerClick = () => {    console.log('B: react outer click.')  }  componentDidMount() {    document.getElementById('outer').addEventListener('click', () => {      console.log('C: native outer click')    })    document.getElementById('inner').addEventListener('click', () => {      console.log('D: native inner click')    })  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

答案：D C A

题目三：

```
export default class extends React.Component {  constructor(props) {    super(props)    document.addEventListener('click', () => {      console.log('C: native document click')    })  }  innerClick = () => {    console.log('A: react inner click.')  }  outerClick = () => {    console.log('B: react outer click.')  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

答案：C A B

题目四：

```
export default class extends React.Component {  constructor(props) {    super(props)    document.addEventListener('click', () => {      console.log('C: native document click')    })  }  innerClick = (e) => {    console.log('A: react inner click.')    e.nativeEvent.stopImmediatePropagation()  }  outerClick = () => {    console.log('B: react outer click.')  }  componentDidMount() {    document.addEventListener('click', () => {      console.log('D: native document click')    })  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

答案：C A B

你全都答对了吗？

DOM 事件
======

首先，我们先简单地复习下 DOM 事件的相关知识点：

1.  事件委托。React 利用了事件委托，将事件都绑定在 document 之上。
    
2.  DOM 事件模型。分成捕获、目标、冒泡阶段。
    

事件委托
----

如下所示，我们想监听 `li` 标签上的点击事件，但是我们不把事件绑定在 `li` 上，而是绑定在它的父元素上，通过 `e.target` 来获取当前点击的目标元素，这种做法就是事件委托。通过事件委托我们可以减少页面中的事件监听函数，提升性能。

```
<ul>  <li>1</li>  <li>2</li>  <li>3</li></ul><script>  const $ul = document.querySelector('ul')  $ul.addEventListener('click', (e) => {    console.log(e.target.innerText)  })</script>
```

DOM 事件模型
--------

我们知道 DOM 事件分为三个阶段：捕获、目标、冒泡。我们通过几个例子来说明其工作流程：

例一：

```
<div id="id">  <button id="btn">Button</button></div><script>  const $div = document.querySelector('#id')  const $btn = document.querySelector('#btn')  document.addEventListener('click', () => {    console.log('document click')  })  $div.addEventListener('click', (e) => {    console.log('div click 1')  })  $div.addEventListener('click', (e) => {    console.log('div click 2')  })  $div.addEventListener('click', (e) => {    console.log('div click 3')  })  $btn.addEventListener('click', () => {    console.log('button click')  })</script>
```

我们知道， `addEventListener` 第三个参数是指定是否在捕获阶段触发事件相应函数，默认 `false`，所以上面的事件均在冒泡阶段触发。事件触发的顺序是从下至上，同一个元素上的事件按照绑定的顺序执行，如下图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHN9m7EmJwcUbvEhQZoTNDLTB746blmJ7X01gmWhicj8OibRHG4P5FIFCw/640?wx_fmt=png)

所以结果是：

```
button click
div click 1
div click 2
div click 3
document click
```

例二：

```
<div id="id">  <button id="btn">Button</button></div><script>  const $div = document.querySelector('#id')  const $btn = document.querySelector('#btn')  document.addEventListener('click', () => {    console.log('document click')  })  $div.addEventListener('click', (e) => {    console.log('div click 1')  })  $div.addEventListener('click', (e) => {    e.stopPropagation()    console.log('div click 2')  })  $div.addEventListener('click', (e) => {    console.log('div click 3')  })  $btn.addEventListener('click', () => {    console.log('button click')  })</script>
```

这里新加了一句 `e.stopPropagation()`，其作用是阻止事件扩散，所以 `document` 上的事件监听函数就不会执行了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyH4CaiaXBtJnEnK1HLHBV1FqnPHXOicicZic6h1qSLESMvN5wiaLnIj5NIibDg/640?wx_fmt=png)

例三：

```
<div id="id">  <button id="btn">Button</button></div><script>  const $div = document.querySelector('#id')  const $btn = document.querySelector('#btn')  document.addEventListener('click', () => {    console.log('document click')  })  $div.addEventListener('click', (e) => {    console.log('div click 1')  })  $div.addEventListener(    'click',    (e) => {      console.log('div click 2')    },    true  )  $div.addEventListener(    'click',    (e) => {      console.log('div click 3')    },    true  )  $btn.addEventListener('click', () => {    console.log('button click')  })</script>
```

这里把 `div` 的两个事件监听函数绑定在捕获阶段。当事件触发的时候会先执行捕获阶段的监听函数，执行顺序是从上而下，相同元素上仍然按照绑定顺序执行。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHfdcAGb0LAoyUQ1NYYc9pWpxX7W4EULASg13PryZlAmwLUvTvlPoS5A/640?wx_fmt=png)

所以结果是：

```
div click 2
div click 3
button click
div click 1
document click
```

例四：

```
<div id="id">  <button id="btn">Button</button></div><script>  const $div = document.querySelector('#id')  const $btn = document.querySelector('#btn')  document.addEventListener('click', () => {    console.log('document click')  })  $div.addEventListener('click', (e) => {    console.log('div click 1')  })  $div.addEventListener(    'click',    (e) => {      e.stopImmediatePropagation()      console.log('div click 2')    },    true  )  $div.addEventListener(    'click',    () => {      console.log('div click 3')    },    true  )  $btn.addEventListener('click', () => {    console.log('button click')  })</script>
```

这里新增了 `e.stopImmediatePropagation()`，该方法是加强版的 `stopPropagation`，不仅可以阻止向其他元素扩散，也可以在本元素内部阻止扩散。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHvNaJIQM9ichAvbMHrfny24N7OoYzoobn53w60gY3kz5pG3ciamx3hyvA/640?wx_fmt=png)

React 事件系统
==========

回顾了下 DOM 事件的知识点后我们进入正题，首先我们看 React 事件绑定是怎么做的。

React 事件绑定
----------

首先，我们知道 React 利用了事件委托机制，将所有事件绑定到了 `document` 之上（17 版本有变动）。具体到代码，可以查看 `react-reconciler/src/ReactFiberCompleteWork.old.js` 文件：

```
...// 通过 FiberNode 创建真实 DOM// 这里已经执行过类组件的 constructor 方法，但是还没有执行 componentDidMountconst instance = createInstance(  type,  newProps,  rootContainerInstance,  currentHostContext,  workInProgress)...if (  // 该方法最终会进行事件绑定  finalizeInitialChildren(    instance,    type,    newProps,    rootContainerInstance,    currentHostContext  )) {  ...}
```

其中 `finalizeInitialChildren` 最终会调用 `react-dom/src/events/EventListener.js` 文件中的 `addEventBubbleListener`：

```
export function addEventBubbleListener(  target: EventTarget,  eventType: string,  listener: Function): Function {  target.addEventListener(eventType, listener, false)  return listener}
```

注意， `constructor` 函数在事件绑定前就执行了，而 `componentDidMount` 则在事件绑定之后才执行。

事件触发
----

我们用下面的例子来体会事件触发的流程：

```
export default class App extends React.Component {  innerClick = () => {    console.log('A: react inner click.')  }  outerClick = () => {    console.log('B: react outer click.')  }  render() {    return (      <div id='outer' onClickCapture={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

当事件在 `document` 上触发的时候，我们可以拿到原生事件对象 `NativeEvent`，通过 `target` 可以访问到当前点击的 `DOM` 元素 `button`，通过其属性 `__reactFiber$*****`（***** 表示随机数）可以获取 `button` 所对应的 `FiberNode`。

同时，React 还会利用 `NativeEvent` 来生成 `SyntheticEvent`，其中 `SyntheticEvent` 有几个重要的属性值得关注下：

1.  nativeEvent，指向 `NativeEvent`。
    
2.  _dispatchListeners，存储要执行的事件监听函数。
    
3.  _dispatchInstances，存储要执行的事件监听函数所属的 `FiberNode` 对象。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHqzHO5SxTbqSxibp6uQYl3AdyXASM7sT1BEIYdQHnYiccG0Omwfc2jqvQ/640?wx_fmt=png)

接下来就会分捕获和冒泡两个阶段来收集要执行的事件监听函数：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyH4SPkVnXlsBa8xpFP71pFCIf6WWgecdIPW0cr0bWqbMssvefIKJkXqA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHQFOX1Mib9q4XmicI9HFvMQb2iakxazuZOnDciawqLB18pxbV8zpS5ewz1A/640?wx_fmt=png)

最后，按照顺序执行 `_dispatchListeners` 中的方法，并通过 `_dispatchInstances` 中的 `FiberNode` 来得到 `currentTarget`。

```
export function executeDispatch(event, listener, inst) {  const type = event.type || 'unknown-event'  event.currentTarget = getNodeFromInstance(inst)  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event)  event.currentTarget = null}/** * Standard/simple iteration through an event's collected dispatches. */export function executeDispatchesInOrder(event) {  const dispatchListeners = event._dispatchListeners  const dispatchInstances = event._dispatchInstances  if (__DEV__) {    validateEventDispatches(event)  }  if (Array.isArray(dispatchListeners)) {    for (let i = 0; i < dispatchListeners.length; i++) {      if (event.isPropagationStopped()) {        break      }      // Listeners and Instances are two parallel arrays that are always in sync.      executeDispatch(event, dispatchListeners[i], dispatchInstances[i])    }  } else if (dispatchListeners) {    executeDispatch(event, dispatchListeners, dispatchInstances)  }  event._dispatchListeners = null  event._dispatchInstances = null}
```

注意到 `event.isPropagationStopped()`，该方法是检查当前是否要阻止扩散，假设我们在某个事件监听函数中调用 `e.stopPropagation()`，则会执行下面的代码：

```
function functionThatReturnsTrue() {  return true;}...  stopPropagation: function() {    const event = this.nativeEvent;    if (!event) {      return;    }    if (event.stopPropagation) {      event.stopPropagation();    } else if (typeof event.cancelBubble !== 'unknown') {      // The ChangeEventPlugin registers a "propertychange" event for      // IE. This event does not support bubbling or cancelling, and      // any references to cancelBubble throw "Member not found".  A      // typeof check of "unknown" circumvents this issue (and is also      // IE specific).      event.cancelBubble = true;    }    this.isPropagationStopped = functionThatReturnsTrue;  }...
```

这样，`_dispatchListeners` 数组中后面的函数就都不会执行了，从而实现了阻止事件扩散的功能。

题目解答
====

最后，让我们来对文章开头的题目做一个解答。

题目一：

```
export default class App extends React.Component {  innerClick = () => {    console.log('A: react inner click.')  }  outerClick = (e) => {    console.log('B: react outer click.')  }  componentDidMount() {    document.getElementById('outer').addEventListener('click', () => {      console.log('C: native outer click')    })    document.getElementById('inner').addEventListener('click', () => {      console.log('D: native inner click')    })  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHV3eu55A61ojficpsZbnRJWbUiayvD5aPfczXNostVrXbPPAicicnLSUFzA/640?wx_fmt=png)

事件模型可以简化为上图，其中 A B 在一个框中表示他们属于同一个事件监听函数中的不同子函数。根据事件冒泡机制，答案为：D C A B

题目二：

```
export default class App extends React.Component {  innerClick = () => {    console.log('A: react inner click.')    e.stopPropagation()  }  outerClick = (e) => {    console.log('B: react outer click.')  }  componentDidMount() {    document.getElementById('outer').addEventListener('click', () => {      console.log('C: native outer click')    })    document.getElementById('inner').addEventListener('click', () => {      console.log('D: native inner click')    })  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHXkRrVobVlX3vhtU9WHPuT1ibET52ibLEnGtcZWTuDxJJjGYfU13hXRWA/640?wx_fmt=png)

调用了 `stopPropagation`，所以 B 不打印，答案为：D C A

题目三：

```
export default class extends React.Component {  constructor(props) {    super(props)    document.addEventListener('click', () => {      console.log('C: native document click')    })  }  innerClick = (e) => {    console.log('A: react inner click.')  }  outerClick = () => {    console.log('B: react outer click.')  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHK8YW8a4VKSRz1bmxgYGmicOKozSicPdaPCB6X8krfN2EnQ3Njdu7Bblw/640?wx_fmt=png)

`constructor` 函数先于 React 事件绑定，所以答案为：C A B

题目四：

```
export default class extends React.Component {  constructor(props) {    super(props)    document.addEventListener('click', () => {      console.log('C: native document click')    })  }  innerClick = (e) => {    console.log('A: react inner click.')    e.nativeEvent.stopImmediatePropagation()  }  outerClick = () => {    console.log('B: react outer click.')  }  componentDidMount() {    document.addEventListener('click', () => {      console.log('D: native document click')    })  }  render() {    return (      <div id='outer' onClick={this.outerClick}>        <button id='inner' onClick={this.innerClick}>          BUTTON        </button>      </div>    )  }}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrGVVticbjfdq3jQEMn1lSyHpr7PElFGf0iceI3dZXu3jIUFgQIoSia8A3VNvRO9ibdavB0enlEOibtPhw/640?wx_fmt=png)

调用原生事件上的 `stopImmediatePropagation`，会阻止事件在本元素中继续扩散，所以答案为：C A B

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)

》》面试官都在用的题库，快来看看《《