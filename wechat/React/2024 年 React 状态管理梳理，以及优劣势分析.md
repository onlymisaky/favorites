> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gt0JkZ062S1ik3ZUUdIf5Q)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyaLwkMaD6EZaicLQu5ZGpuHbjoaXuGpz8x2JGFicEO9l2DQTKuic9qMeG3CPoiaL1zVYA8yzGbIKAWqWg/640?wx_fmt=png&from=appmsg)
==============================================================================================================================================================

概览图

我个人认为, React 状态管理库可以分为三大类:

*   **基于 reducer 的**: 需要分发 actions 来更新一个大的中心化状态 (通常称为 “单一数据源”)。这一类包括 Redux[1] 和 Zustand[2]。
    
*   **基于 atom 的**: 将状态拆分成称为 atoms 的微小数据片段, 可以通过 React 钩子对其进行读写。这一类包括 Recoil[3] 和 Jotai[4]。
    
*   **基于可变的**: 利用 proxy 创建可变数据源, 可以直接写入或主动读取。这一类候选项包括 MobX[5] 和 Valtio[6]。
    

下面让我们深入研究每一类库的优劣势。这将帮助你理解哪个库最适合你项目的需求:

1. 基于 reducer 的库
----------------

Redux 大家都觉得郭宇复杂, 不过它一直是最流行的状态管理库。

```
+---------------------+
|        Actions      |
+----------|----------+
           |
           v
+---------------------+        +---------------------+
|        Reducers     |        |       Store         |
+----------|----------+        +----------|----------+
           |                              |
           v                              v
+---------------------+        +---------------------+
|        State        |        |     Subscriptions   |
+---------------------+        +---------------------+
```

**优势:**

*   强大的状态机和时间机器。假设你所有应用状态都存在中心化状态中 (这比较少见, 因为你大部分时候都在组件中有本地状态), 则存在以下公式:`UI = React(state)`。这意味着特定状态值只会导致一个 UI, 所以你的应用在特定状态下将始终保持一致的外观。如果你在某个地方备份整个状态, 然后分发类似 `REVERT(pastState) { state = pastState }` 的更改, 你的 UI 将恢复为屏幕截图捕获的样子。
    
*   最佳的 DevTools 支持: 通过使用明确的 actions 更新状态, DevTools 可以帮助你指出状态的变化是什么, 何时如何变化的。你可以把它想象成你应用状态中的 Git 提交历史, 这不是很帅吗?
    

**劣势:**

*   样板代码: 即使是对状态的简单更改也需要大量代码改动。
    
*   学习曲线陡峭: 虽然其核心很简单, 但仅靠自己是不够的。要真正掌握 Redux, 你应该知道如何与其他库 (如 Saga、Thunk、Reselect、Immer 或 Redux Toolkit) 搭配使用。说实话, 在大多数情况下, 我在 Saga 中编写生成器时, 我只是想通过网络获取一些数据。我们这些现代 JS 开发者倾向于在日常工作中使用 async/await。
    
*   TypeScript: 尽管完全支持 TypeScript, 但大多数时候需要对 actions、reducers、selectors 和状态进行显式类型定义才能完成类型检查。其他方法可以直接支持自动类型推断。
    

2. 基于 atom 的库
-------------

它没有把整个应用状态放在一个大的中心化状态中, 而是将其拆分为多个 atom, 每个 atom 最好和原始类型或基本数据结构 (如数组和扁平对象) 一样小。然后, 如果需要, 你可以后续使用选择器将相关状态组合在一起。

```
+---------------------+
|     Atoms (State)   |
+----------|----------+
           |
           v
+---------------------+        +---------------------+
|  Selectors (Derived |        |   RecoilRoot        |
|     State)          |        +----------|----------+
+----------|----------+                   |
           v                              v
+---------------------+        +---------------------+
|    State Snapshot   |        |   React Components  |
+---------------------+        +---------------------+
```

**优势:**

*   利用 React 特性: 这是意料之中的, 因为 Recoil 和 React 都是由 Facebook 创建的。Recoil 能够与前沿的 React 特性 (如 Suspense、Transition API 和 Hooks) 配合的很好。
    
*   简单且可扩展: 仅使用 atoms 和 selectors, 你仍然可以有效地构建一个巨大的响应式应用程序状态, 同时对各个状态变化有细粒度的控制。提升状态和声明一个 atom 一样简单, 只需要将你的`useState`钩子改为`useRecoilState`。
    
*   TypeScript: 作为一个像用户关心 UI 和 UX 一样关心 DX 的开发者, 我发现 React、Recoil 和 TypeScript 是一个奇妙的组合。在我的项目中, 类型大多数时候是自动推断的。
    

**劣势:**

*   DevTools: 如果你正在寻找 Redux DevTools 的替代品, 很遗憾, 没有。
    
*   无法在组件外使用状态: 尽管 Recoil Nexus 是一个变通方法, 但这类状态管理库的设计初衷是假设所有状态使用都发生在 React 组件内。
    
*   尚不稳定: 4 年过去了, Recoil 的最新版本仍以 0 开头 (v0.7.7)。如果在你阅读这篇文章时, 上述信息已经过时, 那我会很高兴。
    

3. 基于 mutable 的库
----------------

> 提示:“mutable 的”和 “immutable” 是指数据在创建后如何改变:
> 
> *   `person.age += 1 // 可变的`
>     
> *   `person = {...person, age: person.age + 1} // 不可变的`
>     

```
+---------------------+
|     Observables     |
+----------|----------+
           |
           v
+---------------------+        +---------------------+
|   Computed Values   |        |     Actions         |
+----------|----------+        +----------|----------+
           |                              |
           v                              v
+---------------------+        +---------------------+
|   Reaction (Derived |        |    MobX Store       |
|       Value)        |        +----------|----------+
+---------------------+                   |
                                          v
                               +---------------------+
                               |   React Components  |
                               +---------------------+
```

**优势:**

*   最简单的 API: 通过允许状态直接可变, 除非你想这样做, 否则组件和状态之间不需要样板代码。
    
*   响应性与灵活性: 每当状态发生变化时, 依赖项会自动更新。这简化了你的应用逻辑并使其更易于理解。此外, 基于 proxy 的方法有助于最小化不必要的重新渲染。这也转化为平滑的性能和更响应的用户体验。
    

**劣势:**

*   太多魔法: 自动响应是一个双刃剑。异步更新中的竞争条件会导致你的应用状态陷入混乱, 并且在复杂的应用中调试状态变化流会具有挑战性。
    
*   DevTools: 似乎在我看来没有哪种替代方案具有 reducer 型方法那么好的工具支持。
    
*   不连贯的 DX: 虽然 React 详细阐述了 “不可变” 的方法, 但是在项目中混合使用 “可变” 的数据有时会让我感到不安全, 不知道应该如何更改数据。
    

最佳选择
----

同样, 你项目的最佳 React 状态管理库取决于你和你团队的具体需求和专业知识。请**不要**:

*   仅根据项目规模和复杂性选择库。因为你可能在某处听说过 X 更适合大规模项目, 而 Y 更适合较小的项目。库的作者在设计库时都考虑到了可扩展性, 你项目的可扩展性取决于你如何编写代码和使用库, 而不取决于你选择使用哪些库。
    
*   把一个库中学到的最佳实践套用到另一个库里：比如把整个应用状态放入单个 Recoil atom 中以实现 “单一数据源”，只会导致状态更新问题和性能问题。同样也不要在 Redux 中并分发多个 actions，而不是在一次提交中批量更改。
    

作者选择
----

> 简单来说: Jotai.

我个人更偏向基于原子的库, 因为上面列出的优势和我在处理异步数据获取以及使用`<Suspense>`批量加载 UI 时的无痛 DX 历史。Jotai 比 Recoil 做得更好之处在于:

*   不需要 key。命名是很困难的, 大多数时候你不会使用 Recoil 的 key。那么为什么要花时间声明它们呢? 当库可以自动为你生成 key 时。这里是 Recoil 的回答 [7]; 然而, 正如你所看到的, 大家不完全认同。
    
*   性能。一张图片胜过千言万语, 我有 4 张:
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyaLwkMaD6EZaicLQu5ZGpuHbDe5Xcs7xKCBvDAQ70oAP30ZKkFwLzWD47XGy2y6msictsWn6JGZpckw/640?wx_fmt=png&from=appmsg)

recoil:![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyaLwkMaD6EZaicLQu5ZGpuHbVTHsbKXTlH7QJ5gk8Ggw5TVTficzzibGDeibOttMRibCvbuoEF50ZrEpibg/640?wx_fmt=png&from=appmsg)

jotai:![](https://mmbiz.qpic.cn/sz_mmbiz_png/iagNW4Zy9CyaLwkMaD6EZaicLQu5ZGpuHbRpLvAAiasFL2EZSp1J0wqst6MdoyuJodGSkDdZycMZmQIcVBAZuGzAA/640?wx_fmt=png&from=appmsg)

你可能会争辩说体积上的 2 万字节差异不算太大, 但我们来看看在一款非常旧的安卓设备上运行的基准测试, 在这些设备上卡顿会非常明显。正如你所看到的, Jotai 的内部逻辑需要的总体计算更少, 这提高了我的应用的 LCP(一个重要的核心网站体验指标) 从约 2.6 秒到约 1.2 秒。尽管如此, 这个比较可能没有考虑到 Recoil 做得比 Jotai 更好的其他因素 (超出了我的知识范围)。我只想说 Jotai 团队在性能方面做的很出色。

参考来源：https://dev.to/nguyenhongphat0/react-state-management-in-2024-5e7l

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2023 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！

### 参考资料

[1]

Redux: _https://redux.js.org/_

[2]

Zustand: _https://zustand-demo.pmnd.rs/_

[3]

Recoil: _https://recoiljs.org/_

[4]

Jotai: _https://jotai.org/_

[5]

MobX: _https://mobx.js.org/_

[6]

Valtio: _https://valtio.pmnd.rs/_

[7]

Recoil 的回答: _https://github.com/facebookexperimental/Recoil/issues/378_