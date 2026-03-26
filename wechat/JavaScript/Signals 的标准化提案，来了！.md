> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ujWFplzUb7nCunvCpqaW9Q)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

在前端开发领域，状态管理总是一个绕不开的话题。随着 Web 应用程序越来越复杂，对于高效且可靠的状态管理解决方案的需求也水涨船高。2022 年，`JavaScript` 世界中出现了一个新概念：`Signals` ，这个概念一度被大家炒作为前端状态管理的未来。

最近，`Rob Eisenberg` 以及 `Daniel Ehrenberg` 正式公开发布了 `Signals` 的 `TC39` 标准化草案，目前处于 `Stage0` 阶段，并且也推出了符合规范的 `polyfill` 。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/e5Dzv8p9XdTvB02356pJIhn6LEjq6jJmTZN5hVO2Nzeb5VvKDuUVQodWbWrScdMicbcKRnQfcrcJdVzqePszbTg/640?wx_fmt=png&from=appmsg)

为啥需要 Signals？
-------------

`Signals` 是一种用于 `JavaScript` 应用的响应式状态管理机制，设计它的初衷就是为了简化并优化数据的响应式更新能力。`Signal` 本身就像是一个数据的容器，当它存储的数据改变时，依赖于这个 `Signal` 的计算函数或者副作用可以自动更新。

每个 `Signal` 都可以视为一个数值的来源。当这个值发生变化时，`Signal` 确保所有依赖于它的状态（也可能是其他 `Signal`）能够得到通知并相应地更新，形成了一个依赖图。这种机制下的状态管理方式就很清晰，因为数据的流向是单项的，并且有迹可循。

在现代 `Web` 应用中，我们经常需要同步更新多个部分的 `UI` 来对数据的变化做出响应。传统的解决方案，比如事件监听和回调，在大型应用中相当难维护。而如 `React` 这样的库或框架虽然提供了一些解决方案，但每个框架都有自己的状态管理模式，这在不同项目之间共享和转换时就会很迷惑。

另一个问题是不同的状态管理系统之间难以协同工作。一个标准化的 `Signals` 机制能够提供一个框架无关的标准，无论我们使用哪个库或框架，状态的管理和传递都能遵循同样的模式。

所以，如果 `Signals` 真的走向了标准化，相当于统一了前端各大框架的状态管理方式，这还是相当有意义的。

Signals 的优势
-----------

1.  **反应式编程的简化**：通过使用 `Signals`，开发者可以更直观地创建和管理状态，而不需要深入了解复杂的响应式系统内部机制。
    
2.  **自动化的状态追踪和更新**：当你更新了某个 `Signal` 值，所有依赖这个值的函数和表达式都将自动重新计算，不需要手动调用更新函数。
    
3.  **高效的性能表现**：`Signals` 通常采用延迟计算 (`lazy evaluation`) 和缓存 (`memoization`)，这意味着只有当数据被使用时才会计算，并且如果依赖没有改变，就不会重复计算，从而减少不必要的计算开销。
    
4.  **跨框架的统一性**：提出这个提案的目标是制定关于如何使用 `Signals` 的通用标准，这将有利于不同的前端框架之间的兼容性，提高协同开发的效率。
    

Signals 的简单用法
-------------

`Signal` 的 `API` 设计非常简洁，下面我们创建一个简单的例子：

```
const counter = new Signal.State(0);
```

给这个 `Signal` 赋值和取值：

```
// 读取Signal值console.log(counter.get()); // 输出：0// 改变Signal值counter.set(1);console.log(counter.get()); // 输出：1
```

上述代码通过 `get()` 和 `set()` 方法提供了对 `Signal` 值的访问和修改。

你也可以创建依赖于其他 `Signal` 状态的计算型 `Signals`，也叫作 `Signal.Computed` 。这种 `Signals` 可以跟踪其他 `Signal` 的状态并提供一个新的计算值。

```
// 创建一个基于 counter Signal 的计算型 Signalconst isEven = new Signal.Computed(() => (counter.get() & 1) === 0);
```

计算型 `Signals` 不需要手动设置新的值，因为它们的值是根据其他 `Signals` 的状态动态计算得出的。

`Signals` 采用所谓的 `“推后拉”` 模型：`“推”` 阶段，在 `Signal` 变为 `“脏”`（即其值发生了改变）时，会递归地把 `“脏”` 状态传递到依赖它的所有 `Signals` 上，所有潜在的重新计算都被推迟，直到显式地请求某个 `Signal` 的值。

```
// 更新 counter Signal，并同时更新依赖的计算型 Signalscounter.set(17);console.log(isEven.get()); // 输出：false
```

每次调用 `get()` 方法时，如果 `Signal` 状态是 “脏” 的，那么就会在内部检查它所有的依赖项。如果任何依赖项已经改变，它会自动重新计算并返回新的值。这种延迟计算和缓存的组合带来了几个主要优点：

1.  自动化跟踪：消除了手动更新的管理复杂性，增强了响应式编程能力。
    
2.  性能优化：仅当必要时才计算值，避免了不必要的计算和更新。
    
3.  避免不一致：确保在相应的 `UI` 渲染或任何依赖性评估中，状态是同步更新的。
    
4.  易于集成：可以轻松地将 `Signals` 集成到各种 `JavaScript` 库和框架中。
    

我们还可以基于这个 `Signal` 编写更多的计算函数：

```
const parity = new Signal.Computed(() => isEven.get() ? "even" : "odd");counter.set(17);console.log(parity.get()); // odd
```

当状态变更时，我们通知 `UI` 进行渲染：

```
effect(() => element.innerText = parity.get());
```

Signals 标准化草案
-------------

下面是最新公开的 `Signals TC39` 提案的类型提示，大家可以窥探一下 `API` 的整体设计，但是本提案还处于相当早期的阶段，API 在未来还有可能发生比较大的变化。

```
interface Signal<T> {  // 获取信号的值  get(): T;}namespace Signal {    // 一个可读写的信号    class State<T> implements Signal<T> {        // 创建一个初始值为t的状态信号        constructor(t: T, options?: SignalOptions<T>);        // 设置状态信号的值为t        set(t: T): void;    }    // 一个基于其他信号的公式信号    class Computed<T> implements Signal<T> {        // 创建一个信号，它的值由回调函数的返回值决定。        // 回调函数中的this指向这个公式信号本身。        constructor(cb: (this: Computed<T>) => T, options?: SignalOptions<T>);    }    // 这个命名空间包括一些“高级”功能，通常情况下最好是留给框架的作者而不是应用程序开发者使用。    // 类似于`crypto.subtle`    namespace subtle {        // 运行一个回调函数，并在该函数中停用所有的跟踪        function untrack<T>(cb: () => T): T;        // 如果存在，获取当前正在跟踪任何信号读取的公式信号        function currentComputed(): Computed | null;        // 返回一个有序的信号列表，这些信号是公式信号在上次计算中引用的所有信号。        // 对于Watcher对象，列出它正在监视的信号集。        function introspectSources(s: Computed | Watcher): (State | Computed)[];        // 返回包含此信号的Watcher对象，加上读取此信号的所有公式信号（如果这个公式信号正在（递归）被监视的话）。        function introspectSinks(s: State | Computed): (Computed | Watcher)[];        // 如果此信号是“活动”状态，即它被一个Watcher对象监视，或它被一个正在（递归）活动监视的公式信号读取。        function hasSinks(s: State | Computed): boolean;        // 如果此信号是“响应式”的，即它依赖于其他某些信号。若一个公式信号没有源信号（即hasSources为false），它总是返回相同的常量。        function hasSources(s: Computed | Watcher): boolean;        class Watcher {            // 当Watcher的一个（递归的）源信号被写入时，调用这个回调函数，            // 如果自上次`watch`调用以来还没有被调用的话。            // 在通知期间，不得读取或写入任何信号。            constructor(notify: (this: Watcher) => void);            // 添加这些信号到Watcher的集合中，设置Watcher在其任何一个信号集中的信号（或其依赖项）变化时，            // 运行它的通知回调函数。也可以不带参数调用，仅重置“已通知”状态，这样可以再次触发通知回调函数。            watch(...s: Signal[]): void;            // 从观察集中移除这些信号（例如，对于已经处理过的effect）。            unwatch(...s: Signal[]): void;            // 返回Watcher集合中仍然是“脏”的源信号集，或者是有一个“脏”或等待中且尚未重新评估的源信号的公式信号。            getPending(): Signal[];        }        // 用于观察启动监视和停止监视的钩子        var watched: Symbol;        var unwatched: Symbol;    }    interface Options<T> {        // 自定义比较函数，用于比较旧值和新值是否相同。默认值：Object.is。        // 信号对象本身作为this值传入，以供上下文使用。        equals?: (this: Signal<T>, t: T, t2: T) => boolean;        // 当isWatched变为true时（之前为false）的回调函数        [Signal.subtle.watched]?: (this: Signal<T>) => void;        // 每当isWatched变为false时（之前为true）的回调函数        [Signal.subtle.unwatched]?: (this: Signal<T>) => void;    }}
```

Signals 在实际开发中的用法
-----------------

目前，很多流行的组件库和渲染框架已经在使用 `Signals` 了。假设你是一个想要基于 `Signals` 创建库的开发者，或者想要在这些原始状况上构建应用状态层的开发者。那么，代码会长啥样呢？

前面我们通过 `Signal.State()` 解释 `Signals` 的基础知识时，我们已经了解了一些内容。如果不通过框架的 API 间接使用的话，`Signal.Computed()、Signal.State()` 是开发者需要使用的两个主要 API。它们可以单独使用来表示独立的响应式状态和计算，也可以与其他 `JavaScript` 结构（例如类）结合使用。下面是一个使用 `Signals` 来表示其内部状态的 `Counter` 类：

```
export class Counter {  #value = new Signal.State(0);  get value() {    return this.#value.get();  }  increment() {    this.#value.set(this.#value.get() + 1);  }  decrement() {    if (this.#value.get() > 0) {      this.#value.set(this.#value.get() - 1);    }  }}const c = new Counter();c.increment();console.log(c.value);
```

`Signals` 还非常方便与装饰器结合使用，我们可以创建一个 `@signal` 装饰器，将 `getter、setter` 转换为 `Signals`，如下所示：

```
export function signal(target) {  const { get } = target;  return {    get() {      return get.call(this).get();    },    set(value) {      get.call(this).set(value);    },    init(value) {      return new Signal.State(value);    },  };}
```

然后我们可以使用它来减少模版代码并提高 `Counter` 类的可读性，如下所示：

```
export class Counter {  @signal accessor #value = 0;  get value() {    return this.#value;  }  increment() {    this.#value++;  }  decrement() {    if (this.#value > 0) {      this.#value--;    }  }}
```

这就是 `Signals` 的一个最基础的使用示例了，使用了两个最简单的 `API`。

下面我们再看一个使用更高级的 `Signal.subtle.Watcher` API 来创建一个对任务队列进行批量更新的示例，这种代码在通用库和框架中很常见：

```
let needsEnqueue = true;// 创建一个新的 Watcher 实例const w = new Signal.subtle.Watcher(() => {  if (needsEnqueue) {    needsEnqueue = false;    // 将 processPending 函数添加到微任务队列中    queueMicrotask(processPending);  }});// processPending 函数的定义function processPending() {  needsEnqueue = true;      // 遍历 Watcher 的 Pending 队列中的每一个信号  for (const s of w.getPending()) {    // 获取每一个信号的值    s.get();  }  // 开始监听这个 Watcher  w.watch();}// effect 函数的定义export function effect(callback) {  let cleanup;    // 创建一个新的 Computed 实例  const computed = new Signal.Computed(() => {    // 如果 cleanup 是一个函数，执行这个函数    typeof cleanup === "function" && cleanup();    // 将 callback 的运行结果赋值给 cleanup    cleanup = callback();  });    // 开始监听这个 Computed 实例  w.watch(computed);  // 获取 Computed 实例的值  computed.get();    return () => {    // 停止监听这个 Computed 实例    w.unwatch(computed);    // 如果 cleanup 是一个函数，执行这个函数    typeof cleanup === "function" && cleanup();  };}
```

在这段代码中，`needsEnqueue` 用于决定是否将 `processPending` 函数添加到微任务队列中。在 `effect` 函数中创建一个 `Computed` 实例并监听它，当 `Computed` 中的值改变时，执行 `callback()` 函数，并清理上一次的副作用。当不再需要这个 `effect` 时，可以调用返回的函数来移除监听并清理副作用。

`Signals` 的用法还有很多，其他的就靠大家自己去探索了。

有关 Signals 的一些热门问题
------------------

提案中也描述了开发者们提出的关于 `Signals` 的一系列问题，下面是我挑出来的一些热门问题：

**Q：既然 `Signals` 在 `2022` 年刚开始流行，现在标准化有关 `Signals` 的东西是不是有点急了？我们是否应该给它们更多的时间来演进？**

A：当前 Web 框架中 `Signal` 的状态已经是 10 多年不断发展的结果了。近年来，几乎所有 Web 框架都在接近一个非常相似的 `Signals` 核心模型。这个提案是多个 Web 框架核心贡献者之间的共享设计的结果，并且不会在没有该领域专家群体在各种环境中的验证的情况下提前推向标准化。

**Q：`Signal API` 是供应用开发者直接使用，还是由框架封装后使用？**

A：尽管应用开发者可以直接使用这个 `API`（至少是非 `Signal.subtle` 命名空间中的部分），但 `API` 本身的设计是优先为库 / 框架作者的需求考虑的。在实践中，通过框架使用 `Signals` 通常是最佳选择，通常框架的内部才会关注更复杂的特性（例如，`Watcher，untrack`），以及管理所有权和销毁（例如，判断何时应该将 `signals` 添加到 `watcher` 中或从中移除），和安排渲染到 `DOM` 。

**Q：`Signals` 是否与虚拟 `DOM（VDOM）`协同，还是直接与底层的 `HTML DOM` 交互？**

A：`Signals` 是独立于渲染技术的。现有的使用类似 `Signal` 结构的 `JavaScript` 框架已与虚拟 `DOM` （例如，`Preact`）、原生 `DOM` （例如，`Solid` ）以及两者的组合（例如，`Vue` ）集成在一起。内置的 `Signals` 也将能够做到。

**Q：`Signals`是否适用于 SSR、Hydration 和 Resumability？**

A：是的，`Qwik`已经很好地使用了 `Signals` 来提供这些属性，其他框架也开发了其他处理 `Hydration` 的成熟方法，有着不同的权衡和考虑。我们认为，可以使用 `State` 和 `Computed signal Hook`一起来模拟 `Qwik` 的 `Resumability Signals`，未来会提供相关示例代码。

**Q：`Signals` 是否像 `React` 那样支持单向数据流？**

A：是的，`Signals` 是单向数据流的一种机制。基于 `Signal` 的 `UI` 框架允许你将视图表示为模型的函数（模型中包含 `Signals`）。状态和计算 `Signals` 构成的图结构在构建时是无环的。复现和 `React` 一样的模式在 `Signals` 中也是可能的！，例如，`useEffect` 中的 `setState` 相当于 `Signal` 中的使用 `Watcher` 来安排对 `State signal` 的写操作。

**Q：`Signals` 与像 `Redux` 这样的状态管理系统有什么关系？`Signals`是否鼓励非结构化状态？**

A：`Signals` 可以有效地构成类似存储的状态管理抽象基础。在很多框架中常见的是基于 `Proxy` 对象来实现，其内部属性使用 `Signals` 来表示，例如，`Vue` 的响应式系统 `reactive()`，或者 `Solid` 框架的 `stores`。这些框架都允许在特定应用程序中正确的抽象级别上灵活地对状态进行分组。

**Q：目前有哪些能力是 `Signals` 能够满足，但 `Proxy` 无法处理的？**

A: `Proxy` 必须包裹一个对象。它们无法用于拦截对基本数据类型，如数字、字符串或符号的属性访问 / 赋值，以下是 `Signals` 可以做到，但 `Proxy` 做不到的例子：

```
new Proxy(0, { ... }) // ❌ TypeError: Cannot create proxy with a non-object as target or handlernew Signal.State(0); // ✅
```

Signals Polill
--------------

如果你已经迫不及待的想要在项目里试试 `Signals` 了，可以先尝试使用这个 `Polyfill`：

https://github.com/proposal-signals/proposal-signals/tree/main/packages/signal-polyfill

> 由于提案还在早期阶段，API 设计有可能在未来发生变化，建议不要在生产环境中使用。

最后
--

了解更多：

*   https://github.com/proposal-signals/proposal-signals
    
*   https://eisenbergeffect.medium.com/a-tc39-proposal-for-signals-f0bedd37a335
    

抖音前端架构团队目前放出不少新的 HC ，又看起会的小伙伴可以看看这篇文章：[抖音前端架构团队正在寻找人才！ FE/Client/Server/QA](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247499434&idx=1&sn=8c7497876efc458dca19b6f6a27cadd4&chksm=c2e10b81f5968297533fcfced9ebad6eba072f6436bf040eaa8920256577258ef1077d1f122a&token=1091255868&lang=zh_CN&scene=21#wechat_redirect)

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

`点赞`和`在看`是最大的支持 ⬇️❤️⬇️