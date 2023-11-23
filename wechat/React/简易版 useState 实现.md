> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/JyjgQDH-Fr4o-rsWPz9G3A)

点击上方 三分钟学前端，关注公众号  

回复交流，加入前端编程面试算法每日进阶群

面试官也在看的前端面试资料

基础版 useState
------------

#### 简单实现：只是数组

通过数组实现，初始化的时候，创建两个数组：`states` 与 `setters` ，设置光标 `cursor` 为 `0`

*   第一次调用 `useState` 时，创建一个 `setter` 函数放入  `setters` 中，并初始化一个 `state` 放入 `states` 中
    
*   之后每次重新渲染时，都会重置光标 `cursor` 为 `0` ，通过  `cursor` 从`states` 与 `setters` 获取 `[state, setter]` 返回
    

每次更新 `state` 时，都是通过调用 `setter` 函数修改对应的 `state` 值，这种对应关系是通过 `cursor` 闭包来实现的

看一个例子：

```
function RenderFunctionComponent() {  const [firstName, setFirstName] = useState("Rudi");  const [lastName, setLastName] = useState("Yardley");  return (    <Button onClick={() => setFirstName("Fred")}>Fred</Button>  );}
```

**1、初始化**

初始化的时候，会创建两个数组: state 和 setters，把光标的位置设为 0.

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlxhBGZ5uVvbXiaia3LLLkknIScv1WMeWtjbAJTxicc22NK6PT1npYm6DUUic69OY2K8kVOZfL2TgdD0A/640?wx_fmt=png)

  

**2、第一次渲染**

调用 useState 时，第一次渲染，会将一个 set 函数放入 setters 数组中，并且把初始 state 放入到 state 数组中.

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlxhBGZ5uVvbXiaia3LLLkknIUUo7jjMhhJTxZ1HdkeJkzfw92waf3RibfI7vlCibH1n4CsgHOYhPNBag/640?wx_fmt=png)

use2  

**3、后续渲染**

每一次重新渲染，光标都会重新设为 0，然后从对应的数组中读取状态和 set 函数

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlxhBGZ5uVvbXiaia3LLLkknIIrib4qO3a48FFicUvOxCeHnnL8OGINJ5e8z1RHlsNeuT3qD07JAiaJ8xQ/640?wx_fmt=png)

use3

示例来自：react hooks 进阶与原理

代码实现：

```
let states = []let setters = []let firstRun = truelet cursor = 0//  使用工厂模式生成一个 createSetter，通过 cursor 指定指向的是哪个 statefunction createSetter(cursor) {  return function(newVal) { // 闭包    states[cursor] = newVal  }}function useState(initVal) {  // 首次  if(firstRun) {    states.push(initVal)    setters.push(createSetter(cursor))    firstRun = false  }  let state = states[cursor]  let setter = setters[cursor]  // 光标移动到下一个位置  cursor++  // 返回  return [state, setter]}
```

使用

```
function App() {  // 每次重置 cursor  cursor = 0  return <RenderFunctionComponent />}function RenderFunctionComponent() {  const [firstName, setFirstName] = useState("Rudi");  const [lastName, setLastName] = useState("Yardley");  return (    <Button onClick={() => setFirstName("Fred")}>Fred</Button>  );}
```

进阶版 useState
------------

#### 简单实现：只是链表

在真实的 React Hooks 中，这种关系其实是通过链表实现的，首先我们需要明确以下内容：

在 React 中最多会同时存在两棵 `Fiber` 树。当前屏幕上显示内容对应的 Fiber 树称为 `current Fiber` 树，正在内存中构建的 `Fiber` 树称为 `workInProgress Fiber` 树。`current Fiber` 树中的 `Fiber` 节点被称为 `current fiber` ，`workInProgress Fiber` 树中的 `Fiber` 节点被称为 `workInProgress fiber` ，他们通过 `alternate` 属性连接。

```
// workInProgressHook 指针，指向当前 hook 对象let workInProgressHook = null// workInProgressHook fiber，这里指的是 App 组件let fiber = {  stateNode: App, // App 组件}
```

初始化阶段，react hooks 做的事情，在一个函数组件第一次渲染执行上下文过程中，每个 react hooks 执行，都会产生一个 hook 对象，并形成链表结构，绑定在 `workInProgress` 的 `memoizedState` 属性上

```
// workInProgressHook 指针，指向当前 hook 对象let workInProgressHook = null// workInProgressHook fiber，这里指的是 App 组件let fiber = {  stateNode: App, // App 组件  memoizedState: null // hooks 链表，初始为 null}// 是否是首次渲染let isMount = true
```

然后 react hooks 上的状态，绑定在当前 `hooks` 对象的 `memoizedState` 属性上。

```
// 每个 hook 对象，例如 state hook、memo hook、ref hook 等let hook = {  memoizedState: initVal, // 当前state的值，例如 useState(initVal)  action: null, // update 函数  next: null // 因为是采用链表的形式连接起来，next指向下一个 hook}
```

首次渲染时，生成 `hook` 对象，形成链表结构，绑定在 `workInProgress` 的 `memoizedState` 属性上，代码实现：

```
function useState(initVal) {  let hook  // 首次会生成 hook 对象，并形成链表结构，绑定在 workInProgress 的 memoizedState 属性上  if(isMount) {    // 生成当前 hook 对象    hook = {      memoizedState: initVal, // 当前state的值，例如 useState(initVal)      action: null, // update 函数      next: null // 因为是采用链表的形式连接起来，next指向下一个 hook    }        // 绑定在 workInProgress 的 memoizedState 属性上    if(!fiber.memoizedState) {      // 如果是第一个 hook 对象      fiber.memoizedState = hook      // 指针指向当前 hook      // workInProgressHook = hook    } else {      // 如果不是, 将 hook 追加到链尾      workInProgressHook.next = hook      // workInProgressHook 指向下一个，鸡 hook      // workInProgressHook = workInProgressHook.next    }    workInProgressHook = hook  }}
```

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlxhBGZ5uVvbXiaia3LLLkknIiaNfPTy8hS7ESlWYuzQdXtONF28f0W2muk3iaRttvNVF17Acfo8ibZP7Q/640?wx_fmt=png)img

对于一次函数组件更新，当再次执行 `hooks` 函数的时候，比如 `useState(0)` ，首先要从 `current` 的 `hooks` 中找到与当前 `workInProgressHook` ，对应的 `current hook`

```
function useState(initVal) {  let hook  // 首次会生成 hook 对象，并形成链表结构，绑定在 workInProgress 的 memoizedState 属性上  if(isMount) {    // ...  } else {    // 拿到当前的 hook    hook = workInProgressHook    // workInProgressHook 指向链表的下一个 hook    workInProgressHook = workInProgressHook.next  }}
```

接下来 `hooks` 函数执行的时候，把最新的状态更新到 `workInProgressHook` ，保证 `hooks` 状态不丢失

```
function useState(initVal) {  let hook  // 首次会生成 hook 对象，并形成链表结构，绑定在 workInProgress 的 memoizedState 属性上  if(isMount) {    // ...  } else {    // ...  }  // 状态更新，拿到 current hook，调用 action 函数，更新到最新 state  let baseState = hook.memoizedState   // 执行 update 函数  if(hook.action) {    // 更新最新值    let action = hook.action    // 如果是 setNum(num=>num+1) 形式    if(typeof action === 'function') {      baseState = action(baseState)    } else {      baseState = action    }    // 清空 action    hook.action = null  }  // 更新最新值  hook.memoizedState = baseState  // 返回最新值 baseState、dispatchAction  return [baseState, dispatchAction(hook)]}// action 函数function dispatchAction(hook) {  return function (action) {    hook.action = action  }}
```

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKlxhBGZ5uVvbXiaia3LLLkknIhicPdiatwaAYLibAYP7ajc3SZSRMYPzaZjtGTy4ANgyZhFHgribnycdAoA/640?wx_fmt=png)img

完整实现：

```
// workInProgressHook 指针，指向当前 hook 对象let workInProgressHook = null// workInProgressHook fiber，这里指的是 App 组件let fiber = {  stateNode: App, // App 组件  memoizedState: null // hooks 链表，初始为 null}// 是否是首次渲染let isMount = truefunction schedule() {  workInProgressHook = fiber.memoizedState  const app = fiber.stateNode()  isMount = false  return app}function useState(initVal) {  let hook  // 首次会生成 hook 对象，并形成链表结构，绑定在 workInProgress 的 memoizedState 属性上  if(isMount) {    // 每个 hook 对象，例如 state hook、memo hook、ref hook 等    hook = {      memoizedState: initVal, // 当前state的值，例如 useState(initVal)      action: null, // update 函数      next: null // 因为是采用链表的形式连接起来，next指向下一个 hook    }    // 绑定在 workInProgress 的 memoizedState 属性上    if(!fiber.memoizedState) {      // 如果是第一个 hook 对象      fiber.memoizedState = hook    } else {      // 如果不是, 将 hook 追加到链尾      workInProgressHook.next = hook    }    // 指针指向当前 hook，链表尾部，最新 hook    workInProgressHook = hook  } else {    // 拿到当前的 hook    hook = workInProgressHook    // workInProgressHook 指向链表的下一个 hook    workInProgressHook = workInProgressHook.next  }  // 状态更新，拿到 current hook，调用 action 函数，更新到最新 state  let baseState = hook.memoizedState  // 执行 update  if(hook.action) {    // 更新最新值    let action = hook.action    // 如果是 setNum(num=>num+1) 形式    if(typeof action === 'function') {      baseState = action(baseState)    } else {      baseState = action    }    // 清空 action    hook.action = null  }   // 更新最新值  hook.memoizedState = baseState  // 返回最新值 baseState、dispatchAction  return [baseState, dispatchAction(hook)]}// action 函数function dispatchAction(hook) {  return function (action) {    hook.action = action  }}
```

测试：

```
// 调度函数，模拟 react schedulerfunction schedule() {  workInProgressHook = fiber.memoizedState  const app = fiber.stateNode()  isMount = false  return app}function App() {  const [num, setNum] = useState(0)  return {    onClick() {      console.log('num: ', num)      setNum(num+1)    }  }}// 测试结果schedule().onClick(); // 'num: ' 0schedule().onClick(); // 'num: ' 1schedule().onClick(); // 'num: ' 2
```

优化版：useState 是如何更新的
-------------------

更近一步，其实 `useState` 有两个阶段，负责初始化的 `mountState` 与负责更新的 `updateState`，在 `mountState` 阶段会创建一个 `state` `hook.queue` 对象，保存负责更新的信息（包含 `pending`，待更新队列），以及一个负责更新的函数 `dispatchAction` （就是 `setNum` ，第三个参数就是 `queue`）

```
// 因此，实际的 hook 是这样的// 每个 hook 对象，例如 state hook、memo hook、ref hook 等let hook = {  memoizedState: initVal, // 当前state的值，例如 useState(initVal)  queue: {    pending: null  }, // update 待更新队列, 链表的形式存储  next: null // 因为是采用链表的形式连接起来，next指向下一个 hook}// 调用updateNum实际上调用这个,queue就是当前hooks对应的queue。function dispatchAction(queue, action) { // 每一个任务对应一个update  const update = {    // 更新执行的函数    action,    // 与同一个Hook的其他更新形成链表    next: null,  };  // ...}
```

每次更新的时候（`updateState`）都会创建一个 `update` 对象，里面记录了此次更新的信息，然后将此`update` 放入待更新的 `pending` 队列中，最后，`dispatchAction` 判断当前 `fiber` 没有处于更新阶段

*   如果处于渲染阶段，那么不需要我们在更新当前函数组件，只需要更新一下当前 `update` 的`expirationTime` 即可
    
*   没有处于更新阶段，获取最新的 `state` , 和上一次的 `currentState` ，进行浅比较
    
*     
    

*   如果相等，那么就退出
    
*   不相等，那么调用 `scheduleUpdateOnFiber` 调度渲染当前 `fiber`
    

实现代码就不写了，感兴趣的可以实现一下，欢迎补充

#### 参考

*   react hooks 进阶与原理
    
*   「react 进阶」一文吃透 react-hooks 原理
    
*   80 行代码实现一个简易版 useState
    
*   极简 Hooks 实现
    

最后
--

欢迎关注「三分钟学前端」，分享你我他的前端进阶，每日内容不多，有时可能 2-3 天一起

号内回复：  

「网络」，自动获取三分钟学前端网络篇小书（90 + 页）

「JS」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「算法」，自动获取 github 2.9k+ 的前端算法小书

「面试」，自动获取 github 23.2k+ 的前端面试小书

「简历」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的