> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/z8eHikdt4zo7KhhumsZZLQ)

【文末送书】

React 从 v15 升级到 v16 后重构了整个架构，v16 及以上版本一直沿用新架构，重构的主要原因在于：**旧架构无法实现 Time Slice。**

![](https://mmbiz.qpic.cn/mmbiz_png/JaFvPvvA2J1Clvz4XjNkCCVBtkQpCltfeUCXf9ZIy5iabeyU9OpE347LBN0rHfLxDmwibicgY4DKcwdFhQYbJkicNQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

  

**0****1**

  

****新旧架构介绍****

**React15 架构可以分为两部分：**

*   Reconciler（协调器）——VDOM 的实现，负责根据自变量变化计算出 UI 变化。
    
*   Renderer（渲染器）——负责将 UI 变化渲染到宿主环境中。
    

在 Reconciler 中，mount 的组件会调用 mountComponent，update 的组件会调用 updateComponent，这两个方法都会递归更新子组件，更新流程一旦开始，中途无法中断。

基于这个原因，React16 重构了架构。重构后的架构一直沿用至今，可以分为 3 部分：  

*   Scheduler（调度器）——调度任务的优先级，高优先级任务优先进入 Reconciler。
    
*   Reconciler（协调器）——VDOM 的实现，负责根据自变量变化计算出 UI 变化。
    
*   Renderer（渲染器）——负责将 UI 变化渲染到宿主环境中。
    

在新架构中，Reconciler 中的更新流程从递归变成了 “可中断的循环过程”。每次循环都会调用 shouldYield 判断当前 Time Slice 是否有剩余时间，没有剩余时间则暂停更新流程，将主线程交给渲染流水线，等待下一个宏任务再继续执行，这就是 Time Slice 的实现原理：

```
function workLoopConcurrent() { 
// 一直执行任务，直到任务执行完或中断
while (workInProgress !== null && !shouldYield()) { 
 performUnitOfWork(workInProgress); 
 } 
}
```

shouldYield 方法如下：

```
function shouldYield() { 
// 当前时间是否大于过期时间
// 其中 deadline = getCurrentTime() + yieldInterval 
// yieldInterval 为调度器预设的时间间隔，默认为 5ms 
return getCurrentTime() >= deadline; 
}
```

过期时间 deadline 在任务执行时被更新为 “当前时间 + 时间间隔”，时间间隔默认为 5ms，这也是图 2-3 中每个 Time Slice 宏任务的时间长度是 5ms 左右的原因。

当 Scheduler 将调度后的任务交给 Reconciler 后，Reconciler 最终会为 VDOM 元素标记各种副作用 flags，比如：

```
// 代表插入或移动元素
export const Placement = 0b00000000000000000000000010; 
// 代表更新元素
export const Update = 0b00000000000000000000000100; 
// 代表删除元素
export const Deletion = 0b00000000000000000000001000;
```

Scheduler 与 Reconciler 的工作都在内存中进行。只有当 Reconciler 完成工作后，工作流程才会进入 Renderer。

Renderer 根据 “Reconciler 为 VDOM 元素标记的各种 flags” 执行对应操作，比如，如上三个 flags 在浏览器宿主环境中对应三种 DOM 操作。

下面的示例 1 演示了上述三个模块如何配合工作：count 默认值为 0，每次点击按钮执行 count++，UL 中三个 LI 的内容分别为 “1、2、3 乘以 count 的结果”。

**示例 1：**

```
export default () => { 
const [count, updateCount] = useState(0); 
return ( 
<ul>
<button onClick={() => updateCount(count + 1)}>乘以{count}</button>
<li>{1 * count}</li>
<li>{2 * count}</li>
<li>{3 * count}</li>
</ul>
 ) 
}
```

对应工作流程如图 1 所示。

虚线框中的工作流程随时可能由于以下原因被中断：

 有其他更高优先级任务需要先执行；

 当前 Time Slice 没有剩余时间；

 发生错误。

![](https://mmbiz.qpic.cn/mmbiz_png/PW0wIHxgg3mYI2agiaPElKSc8u5Vv9r5SfbjeHv6puSJjWgdtIckT6YyOlibzibrnoKSxbPfTMibeLaFu1Licice6Nlg/640?wx_fmt=png)

图 1  新 React 架构工作流程示例

由于虚线框内的工作都在内存中进行，不会更新宿主环境 UI，因此即使工作流程反复中断，用户也不会看到 “更新不完全的 UI”。

![](https://mmbiz.qpic.cn/mmbiz_png/JaFvPvvA2J1Clvz4XjNkCCVBtkQpCltfeUCXf9ZIy5iabeyU9OpE347LBN0rHfLxDmwibicgY4DKcwdFhQYbJkicNQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

  

**0****2**

  

********主打特性的迭代********

随着 React 架构的重构，上层主打特性也随之迭代。**按照 “主打特性” 划分，React 大体经历了四个发展时期：**

（1）Sync（同步）；

（2）Async Mode（异步模式）；

（3）Concurrent Mode（并发模式）；

（4）Concurrent Feature（并发特性）

其中，旧架构对应同步时期。异步模式、并发模式、并发特性三个时期与新架构相关。本节主要讲解异步模式、并发模式、并发特性的演进过程。

之前曾提到 “CPU 瓶颈” 与“I/O 瓶颈”，React 并不是同时解决这两个问题的。首先解决的是 “CPU 瓶颈”，解决方式是“架构重构”。重构后 Reconciler 的工作流程从“同步” 变为“异步、可中断”。正因如此，这一时期的 React 被称为 Async Mode。

单一更新的工作流程变为 “异步、可中断” 并不能完全突破“I/O 瓶颈”，解决问题的关键在于“使多个更新的工作流程并发执行”。所以，React 继续迭代为 Concurrent Mode（并发模式）。在 React 中，Concurrent（并发）概念的意义是“使多个更新的工作流程可以并发执行”。

以上便是从 Sync 到 Async Mode 再到 Concurrent Mode 的演进过程。下一节将讲解从 Concurrent Mode 到 Concurrent Feature 的演进过程。

![](https://mmbiz.qpic.cn/mmbiz_png/JaFvPvvA2J1Clvz4XjNkCCVBtkQpCltfeUCXf9ZIy5iabeyU9OpE347LBN0rHfLxDmwibicgY4DKcwdFhQYbJkicNQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

  

**0****3**

  

****************渐进升级策略的迭代****************

从最初的版本到 v18 版本，React 有多少个版本？从架构角度进行概括，**所有 React 版本一定属于如下四种情况之一。**

情况 1：旧架构（v15 及之前版本属于这种情况）。

情况 2：新架构，未开启并发更新，与情况 1 行为一致（v16、v17 默认属于这种情况）。

情况 3：新架构，未开启并发更新，但是启用了一些新功能（比如 AutomaticBatching）。

情况 4：新架构，已开启并发更新。

React 团队希望：使用旧版本的开发者可以逐步升级到新版本，即从情况 1、2、3 向情况 4 升级。但是升级过程中存在较大阻力，因为在情况 4 下，React 的一些行为与情况 1、2、3 不同。比如以下三个生命周期函数在情况 4 的 React 下是 “不安全的”：

*   componentWillMount
    
*   componentWillReceiveProps
    
*   componentWillUpdate
    

**强制升级可能造成代码不兼容。**为了使 React 的新旧版本之间实现平滑过渡，React 团队采用了 “渐进升级” 方案。该方案的第一步是规范代码。v16.3 新增了 StrictMode，针对开发者编写的 “不符合并发更新规范的代码” 给出提示，逐步引导开发者编写规范代码。比如，使用上述 “不安全的” 生命周期函数时会产生如图 2 所示的报错信息。

![](https://mmbiz.qpic.cn/mmbiz_png/PW0wIHxgg3mYI2agiaPElKSc8u5Vv9r5SeVQ4lLYJUPNz6rITcBmfeplKZ85DONYXELiaVVMeKC00jx7ibC6ecnibQ/640?wx_fmt=png)

图 2 StrictMode 下使用不安全生命周期函数报错

下一步，React 团队允许 “不同情况的 React” 在同一个页面共存，借此使 “情况 4 的 React” 逐步渗透至原有项目中。具体做法是提供了以下三种开发模式：

1.  Legacy 模式，通过 ReactDOM.render(<App />, rootNode) 创建的应用遵循该模式。默认关闭 StrictMode，表现同情况 2。
    
2.  Blocking 模式 通过 ReactDOM.createBlockingRoot(rootNode).render(<App />) 创建的应用遵循该模式，作为从 Legacy 向 Concurrent 过渡的中间模式，默认开启 StrictMode，表现同情况 3。
    
3.  Concurrent 模式，通过 ReactDOM.createRoot(rootNode).render(<App />) 创建的应用遵循该模式，默认开启 StrictMode，表现同情况 4。
    

**三种开发模式支持特性对比如图 3 所示**

![](https://mmbiz.qpic.cn/mmbiz_png/PW0wIHxgg3mYI2agiaPElKSc8u5Vv9r5Sz1I2eGlKFufKOg6b1U5ibsh7719pz11vFPnas6dHxVj2vnfZ3X9gNXA/640?wx_fmt=png)

图 3 三种开发模式支持特性对比

为了使不同模式的应用可以在同一个页面内工作，需要对一些底层实现进行调整。比如：调整之前，大多数事件会统一冒泡到 HTML 元素，调整后则冒泡到 “应用所在根元素”。这些调整工作发生在 v17，所以 **v17 也被称作 “为开启并发更新做铺垫” 的“垫脚石”版本。**

2021 年 6 月 8 日，v18 工作组成立。在与社区进行大量沟通后，React 团队意识到当前的 “渐进升级” 策略存在两方面问题。首先，由于模式影响的是整个应用，因此无法在同一个应用中完成渐进升级。举例说明，开发者将应用中 ReactDOM.render 改为 ReactDOM.createBlockingRoot，从 Legacy 模式切换到 Blocking 模式，会自动开启 StrictMode。此时，整个应用的 “并发不兼容警告” 都会上报，开发者需要修复整个应用中的不兼容代码。从这个角度看，“渐进升级”的目的并没有达到。

其次，React 团队发现：开发者从新架构中获益，主要是由于使用了并发特性，并发特性指 “开启并发更新后才能使用的那些 React 为了解决 CPU 瓶颈、I/O 瓶颈而设计的特性”，比如：

*   useDeferredValue
    
*   useTransition
    

所以，React 团队提出新的渐进升级策略——开发者仍可以在默认情况下使用同步更新，在使用并发特性后再开启并发更新。

在 v18 中运行示例 2 所示代码，由于 updateCount 在 startTransition 的回调函数中执行（使用了并发特性），因此 updateCount 会触发并发更新。如果 updateCount 没有在 startTransition 的回调函数中执行，那么 updateCount 将触发默认的同步更新。

**示例 2：**

```
const App = () => { 
const [count, updateCount] = useState(0); 
const [isPending, startTransition] = useTransition(); 
const onClick = () => { 
// 使用了并发特性 useTransition 
 startTransition(() => { 
// 本次更新是并发更新
 updateCount((count) => count + 1); 
 }); 
 }; 
return <h3 onClick={onClick}>{count}</h3>; 
};
```

> 读者可以调试在线示例中这两种情况的调用栈火焰图，根据火焰图中观察到的 “是否开启 Time Slice” 来区分 “是否是并发更新”。

**所以，React 在 v18 中不再提供三种开发模式，而是以 “是否使用并发特性” 作为 “是否开启并发更新” 的依据。**

具体来说，开发者在 v18 中统一使用 ReactDOM.createRoot 创建应用。当不使用并发特性时，表现如情况 3。使用并发特性后，表现如情况 4。

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2iajg0eicHDgKacj8ibQTANjgcavibH1alhEKmLC5iberiajOf3ONCIP5aXibsTIaIiatr7ic5m75A8Pykw0Q/640?wx_fmt=jpeg)

**扫码查看本书详情！**

**现在购买立享 5 折优惠！**

**本文节选自卡颂的新书《**React 设计原理**》**，基于 React18，从理念、架构、实现三个层面解构`React`。

这本书存在两条脉络：

*   抽象层级逐渐降低
    
*   实现越来越复杂的模块
    

对于前者，本书的抽象层级会逐渐从理念到架构，最后到实现，每一层都屏蔽前一层的影响。

这也是为什么`ReactDOM.createRoot`这个初始化`API`会放到第六章再讲解 —— 在这个具体`API`的背后，是他的理念与架构。

对于后者，本书会从 0 实现与`react`相关的 6 个模块，最后我们会一起在`React`源码内实现一个新的原生`Hook`。

![](https://mmbiz.qpic.cn/mmbiz_jpg/PW0wIHxgg3mYI2agiaPElKSc8u5Vv9r5Sasib9icXlUQk4NsGg2NgS7C4ciapq0OR4ByeZzJuiazPoiabA6f8c9icNicMA/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2iajg0eicHDgKacj8ibQTANjgySuwhyiaElib8K4xGFD4viaGJrgtotwibHSj0dfAOfTEhAkWh52UR7L36g/640?wx_fmt=jpeg)

**扫码查看本书详情！**

**现在购买立享 5 折优惠！**

```
包邮送书

关注本公众号后，在后台回复 react 获取抽奖二维码，扫描即可参与！

为了方便兑奖，可以先添加阿宝哥微信哦

本次活动的开奖日期为：2023-01-13 19：00

中奖者请在 24 小时内填写收件地址，否则中奖无效。
```