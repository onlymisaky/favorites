> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kMQarHURI2cRhq2KuPzntA)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XIibZ0YbvibkVKnN0MUibH8TkPX3JxliaxtGRLFibupqic5ZaqhiaxHJHVRt5y0MaGUuzicx8sDTttD0MsdeIf9Qrewb4g/640?wx_fmt=jpeg)

作者 ｜ Paul Scanlon

翻译 ｜ 核子可乐

编辑 ｜ Tina

“Signals” 专门用于管理客户端状态，而且从最近的趋势来看，其很有可能在 React 中发挥作用。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/XIibZ0YbvibkVKnN0MUibH8TkPX3JxliaxtGrwRFOMofBm0Nva4FzcdEBzsjJ1icwyvdUUSYZRvS5edgA3SWMx7dLSw/640?wx_fmt=png&from=appmsg)

就在上周，Dashi Kato（Waku 的缔造者）发布了 use-signals，一个面向 TC39 signals 的实验性 React hook，旨在演示 Signals 如何在 React 中发挥作用。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/XIibZ0YbvibkVKnN0MUibH8TkPX3JxliaxtGgeiav6sFYZiaB5udbSh60tQ79psqibLNmnMa6rKic9AOWznyVoZkb7V41w/640?wx_fmt=png&from=appmsg)

Signals 是什么？

Signals 已然经历约 10 年的发展周期，先后得到 Angular、Vue、SolidJS、Qwik 以及 Preact 等众多 JavaScript 框架的采纳，用于管理客户端状态。Signals 属于能自动跟踪其使用位置的变量。一旦 Signal 发生变更，其值就会失效，进而触发 UI 状态更新 / 重新渲染。

举例来说，这是一个名为 counter 的 Signal，其值为 0。

```
const counter = new Signal.State(0);
```

需要明确的是，Signals 与 React 的 useState 有着本质区别。useState 是 React 提供的 hook，用于管理功能组件内的状态，并允许开发者声明状态变量并更新该变量的函数。

Signals 则是事件的侦听器或者观察器，用于处理异步事件或是超出组件直接控制之外的数据变更。因此，大家会看到 Signal 声明中并没有定义 “setter” 函数。但配合 React 之后，情况将大为不同。下面来看之前的 Signal 如何在 React 中进行声明：

```
const [counter, setCounter] = useState(0);
```

Signals 的概念之所以非常有趣，就是因为 React 那 “自上而下” 的模型意味着每当有状态值发生变化时，组件树的所有后代都会重新渲染并对 UI 执行相应变更，从而保证 DOM/UI 与应用程序的状态同步。

而在使用 Signals 管理状态之后，开发者能够以更细粒度方式控制对 UI 中的哪些部分进行 “重新渲染”。但不要误会，这并不是说 Signals 比 React 方法的性能更高，只是二者的功能定位有所不同。

Signals 使用方法

如上所示，我们可以使用 new 构造函数来声明一个 Signal，例如：

```
const counter = new Signal.State(0);
```

之后，要 “get” 一个 Signal 的值，我们可以使用. get() 方法；而要 “set” 或者更新一个 Signal，我们可以使用. set() 方法。例如：

```
counter.get();
counter.set(10);
```

Signals 在 React 中如何起效？

跟之前提到的 Signals 使用方法不同，它在 React 中另有起效方式。绕过 React 的 diffing 无疑有违 React 声明式编程这一核心原则，因此 React 中的 Signals 仍将使用 VDOM，而且同样会像变更 useState 那样触发重新渲染。

那么在 React 中使用 Signals 还有何意义？其实我的第一反应也是如此，但请大家先别急，让我们一同探索 Signals 的深邃世界。

TC39 提案

如果 TC39 提案获得通过，则意味着 Signals 将在 JavaScript 中原生可用，届时我们将可以在框架之外使用 Signals。更重要的是，框架作者们理论上也能够以标准化方式实现 Signals。换言之，Signals 机制的任何改进都将令所有采用标准化方法的框架受益。而目前，大部分使用 Signals 的框架所采取的处理方式都各有细微差异。

4 月 11 日，Rob Eisenberg 宣布 TC39 提案已经进入第一阶段。这意味着该提案已被纳入 ECMAScript 的考量范围。虽然还有很多工作要做，但这项提案似乎正朝着正确的方向稳步迈进。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/XIibZ0YbvibkVKnN0MUibH8TkPX3JxliaxtGFlE570V0S2c5mY7YfYYqL9jxCib7CRj9sVyvvuicLc1xARvE337mbZ4g/640?wx_fmt=png&from=appmsg)

TC39 提案还强调了围绕不同框架特定要求的方式开发 API 的重要性。use-signals 的意义也正在于此，它在使用建议 Signals API 的同时，也仍然遵循 React 的核心设计原则。

无论 React 团队最终是否会采纳 Signals，use-signals 的出现都在一定程度上表明 Signals 确实能够在 React 中发挥作用。

Signal Utils 提案

Signals 目前仅支持原语，但也有其他 signal-utils 提案正在推进当中，努力将对象和数组引入其中。例如：

对象

```
import { SignalObject } from 'signal-utils/object';


let obj = new SignalObject({
    isLoading: true,
    error: null,
    result: null,
});
```

数组

```
import { SignalArray } from 'signal-utils/array';


let arr = new SignalArray([1, 2, 3]);
```

在 React 中使用 Signals 示例

聊了这么多，下面我们一起来看在 React 中具体如何使用 Signals。这里展示的 React 代码在 Waku 上下文中运行，默认在服务器端进行渲染，但其也能支持纯客户端组件的 “use client” 指令。

与 useState 不同的是，对 Signals 来说，新的 Signals 声明是在组件外部实现的。在以下代码片段当中，也就是名为 counter 的 const，其用于存储初始值并可以被传递至 useSignal hook。

该 count const 公开了. set() 与. get() 方法，这些方法可以在事件处理函数 handleInc 当中使用。

Signal 值的变更将触发 DOM 更新，并在 UI 中显示新的 count 值。

尤其有趣的一点是，在返回的 Jsx 当中，我们不再需要使用. get() 来访问并显示 HTML  <div/> 元素中的值。相反，现在可以直接访问 count 值。这与 Qwik 的实现略有不同，后者需要我们从 counter 处访问值，例如 counter.value。

```
'use client';


import { Signal, useSignal } from 'use-signals';


const counter = new Signal.State(0);


const UseSignalComponent = () => {
  const count = useSignal(counter);


  const handleInc = () => counter.set(counter.get() + 1);


  return (
    <>
      <div>useSignal count: {count}</div>
      <button type='button' onClick={handleInc}>
        Update count
      </button>
    </>
  );
};


export default UseSignalComponent;
```

useState 组件

为了直观比较，以下代码的业务逻辑不变、只是用 React 的 useState hook 进行编写。可以看到，二者之间几乎没有区别。

```
'use client';


import { useState } from 'react';


const UseStateComponent = () => {
  const [count, setCount] = useState(0);


  const handleInc = () => setCount(count + 1);


  return (
    <>
      <div>useState count: {count}</div>
      <button type='button' onClick={handleInc}>
        Update count
      </button>
    </>
  );
};


export default UseStateComponent;
```

混合 Signals

总结来讲，在 React 中实现 Signals 完全具备可行性。虽然 Signals 可能需要一段时间才能在 JavaScript 中获得原生身份，但我个人高度赞赏其蓬勃发展的技术社区对于全新开发方式的探索。感兴趣的朋友不妨持续关注 GitHub repo：++dai-shi/use-signals++。

**原文链接**：

https://thenewstack.io/did-signals-just-land-in-react/

_**声明：本文为 InfoQ 翻译整理，未经许可禁止转载。**_

今日好文推荐

[](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651202054&idx=1&sn=ad79075b24b0893514afb7fb57b63135&chksm=bdbbda558acc5343a05d666bca909b78ec27346d3df12b157f79dc5f5b6bc4c3cee36d8c4677&scene=21#wechat_redirect)[德国再次拥抱 Linux：数万系统从 windows 迁出，能否避开二十年前的 “坑”？](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651201822&idx=1&sn=3426e28e7320c75c51cbcd4e3a032c58&chksm=bdbbd94d8acc505b83b755476510dd7fd210cbb898b1ea0138942cd52ff0c2a605a4c3744150&scene=21#wechat_redirect)

[谷歌大裁员引发元老集体抗议：领导脑袋空空，无能的中层管理团队不断扩大](https://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651194286&idx=1&sn=f013aa5e430eefdb4ae0d3aa20d1ff24&scene=21#wechat_redirect)

[系统 bug 致百人入狱，砸了 2.8 亿元仍上云失败！二十年了，这家大企业被日本软件坑惨了](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651193111&idx=1&sn=2754f556a2b99f9ca01d24c3df353334&chksm=bdb807448acf8e52b246b47eef8e6543baaa3d8258ffe971f356561b84db070efa485ccd85a5&scene=21#wechat_redirect)

[“真男人就应该用 C 编程”！用 1000 行 C 代码手搓了一个大模型，Mac 即可运行，特斯拉前 AI 总监爆火科普 LLM](https://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651201941&idx=1&sn=a88a90030a857f25d69957eb22529e55&scene=21#wechat_redirect)

活动推荐

AICon 全球人工智能开发与应用大会 暨 大模型应用生态展将于 5 月 17 日正式开幕，本次大会主题为「智能未来，探索 AI 无限可能」。如您感兴趣，可点击「**阅读原文**」查看更多详情。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XIibZ0YbvibkWLUiaOD3kkx0bibZ5lV5jIbfDncqL2RWOC54SnDe47XWIw7rah87onyictK4E2cKV14CccdicfJNPiaNw/640?wx_fmt=other&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

今天是会议 9 折购票阶段，购票或咨询其他问题请联系票务同学：13269078023，或扫描上方二维码添加大会福利官，可领取福利资料包。