> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [juejin.cn](https://juejin.cn/post/7264208575973605431)

React 在构建用户界面整体遵循函数式的编程理念, 即固定的输入有固定的输出, 尤其是在推出函数式组件之后，更加强化了组件纯函数的理念。但实际业务中编写的组件不免要产生请求数据、订阅事件、手动操作 DOM 这些副作用 `effect`，这样难免让函数组件变得不那么纯, 于是 React 提供 useEffect 和 useLayoutEffect 这样的 hook, 给开发者提供专门管理副作用的方式。

那么这篇文章我们就从 effect 的数据结构开始

数据结构
====

在之前的一篇文章中就已经讲解到, 对于函数组件来说, 其 fiber 上的 memorizedState 专门用来存储 hooks 链表, 每一个 hook 对应链表中的每一个元素, 最终与其他的 effect 链表形成环形链表。

单个的 `effect` 对象包括以下几个属性, 其中在代码中有如下定义:

```
const effect: Effect = {
  tag,
  create,
  destroy,
  deps,
  // Circular
  next: (null: any),
};
```

这里对每个属性详细讲解一下:

*   create: 传入 useEffect 函数的第一个参数, 即回调函数;
*   destroy: 回调函数 return 的函数, 在该 effect 销毁的时候执行;
*   deps: 依赖项;
*   next: 指向下一个 effect(影响);
*   tag: effect(影响) 的类型, 区分是 useEffect 还是 useLayoutEffect;

假设在我们的应用程序下面有如下代码:

```
import React, { useEffect, useState, useLayoutEffect } from "react";

const App = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(1);
  };
  useEffect(() => {
    console.log(1);
  }, []);

  useLayoutEffect(() => {
    console.log(3);
  }, [3]);

  useEffect(() => {
    console.log(2);
  }, [count]);

  return <div>1</div>;
};

export default App;
```

挂载到它 fiber 上 memorizedState 的 hooks(钩) 链表如下结构:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1c325b9fa594e86aa9ab3518f0499d9~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

最终形成了一个这样的 effect 链表链表结构:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a2b01e520c1455a9275a616ff3d6e6b~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

调用 useEffect, 最后会产生 effect(影响) 链表, 这个链表不仅保存在 fiber.memoizedState 的 hooks(钩) 链表中, 还会存在 fiber.updateQueue 中, 本次更新的 updateQueue, 它会在本次更新的 commit(提交) 阶段中被处理。

流程概述
====

在 React 中, useEffect 和 useLayoutEffect 分为两个阶段: render 阶段和 commit 阶段。这两个阶段分别发生在组件的渲染过程中, 以确保正确地处理副作用

*   render 阶段: 函数组件开始渲染的时候, 创建出对应的 hook 链表挂载到 workInProgress 的 memoizedState 上, 并创建 effect 链表, 但是基于上次和本次依赖项的比较结果;
*   commit(提交) 阶段: 异步调度 useEffect,layout(布局) 阶段同步处理 useLayoutEffect 的 effect(影响), 也就是在浏览器进行布局 layout(布局) 和回执 paint 之前同步执行。等到 commit(提交) 阶段完成, 更新应用到页面上之后, 开始处理 useEffect 产生的 effect(影响);

两者的区别是 useEffect 不会阻塞 DOM 的更新, useLayoutEffect 在 DOM 更新前同步触发，会阻塞 DOM 的更新。

调用 useEffect 的完整流程
==================

在 React 的 hook 架构中, 每个 hook 函数都会有两个生命阶段:

*   mount(挂载) 阶段;
*   update(更新) 阶段;

mount(挂载) 阶段
------------

mount(挂载) 阶段, 调用 useState 和 useLayoutEffect 这个 hook(钩),React(反应) 内部会调用 mountEffect 和, 代码如下图所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8e408e39d6b4925a3057dabd1738cd5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

### mountEffectImpl

接下来我们看看 mountEffect 这个函数, 具体代码如下所示:

```
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
): void {
  debugger;
  if (
    __DEV__ &&
    enableStrictEffects &&
    (currentlyRenderingFiber.mode & StrictEffectsMode) !== NoMode
  ) {
    return mountEffectImpl(
      MountPassiveDevEffect | PassiveEffect | PassiveStaticEffect,
      HookPassive,
      create,
      deps
    );
  } else {
    return mountEffectImpl(
      PassiveEffect | PassiveStaticEffect,
      HookPassive,
      create,
      deps
    );
  }
}
```

首先我们来看看这个函数接收的参数是个怎么样的类型, 如下图所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9c361c8a90641ad89a1c36db303b3d7~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

它的第一个参数就是一个 create 函数, 就是我们在使用 useEffect 中传入的第一个回调函数, 也就是 create 函数。而第二个参数就是我们传进去的依赖数组。

在这个函数里面也就是根据不同的类型调用不同的 mountEffectImpl 函数。

### mountEffectImpl

mountEffectImpl 该函数的具体代码如下所示:

```
function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps
  );
}
```

在这里的第一个参数中 fiberFlags 用于表示不同的组件状态和需要进行的操作，帮助 React 在组件树上进行高效的更新和渲染。

紧接着调用 mountWorkInProgressHook 开始创建 hook, 如果它是第一次调用, 它的值为 null。只有调用过一次 hook 函数后, 它才不为 null。

所以这个阶段为创建 hook 阶段, 接下来进入创建 effect 阶段。

值得注意的是,`pushEffect` 函数的第三个参数是 destroy 函数, 它是 create 函数的返回值, 在 mount 阶段, 它被被赋值为 undefined。

当组件 mount 阶段之后, create 函数就一定会执行, 而 destroy 函数通常在 create 函数的返回值中提供, 用于执行副作用的清理操作。在 create 函数中返回一个函数, 这个函数会在组件卸载或下一次渲染之前被调用, 用于清理之前创建的副作用。

### pushEffect

该函数是 React 用于管理组件中的副作用 Effects 的函数。在 React 中, 副作用指的是在组件渲染时产生的一些操作, 比如订阅事件、数据获取、DOM 操作等。React 使用这个函数来将副作用相关的信息组织成链表, 并将其连接到组件的 Fiber 节点上。

接下来我们看看这个函数的完整代码, 如下所示:

```
function pushEffect(tag, create, destroy, deps) {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    // Circular
    next: (null: any),
  };
  let componentUpdateQueue: null | FunctionComponentUpdateQueue =
    (currentlyRenderingFiber.updateQueue: any);
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
```

首先它接收四个参数, 它们分别是:

*   tag: 一个标志位, 用于标识副作用的类型;
*   create: 一个函数, 用于执行副作用。通常是 useEffect 中传递的副作用函数;
*   destroy: 一个函数, 用于执行清理操作。通常是 useEffect 中传递的返回函数的清理函数;
*   deps: 一个数组, 表示副作用的依赖项。用于指定在哪些依赖项发生变化时, 重新运行副作用函数;

该函数主要的逻辑有以下几个方面:

*   首先, 根据传入的参数创建一个 Effect 对象, 并设置其 tag、create、destroy 和 deps 属性;
*   获取当前渲染的组件对应的更新队列 componentUpdateQueue, 它主要用于存储组件的更新状态和副作用;
*   如果当前组件的更新队列为空, 说明当前组件是首次渲染，需要创建一个新的更新队列, 并将 componentUpdateQueue 设置为它。同时, 将 effect 添加到 componentUpdateQueue 的 lastEffect 中, 形成一个单节点的链表;
*   如果当前组件的更新队列不为空, 说明当前组件已经渲染过, 此时需要将 effect 添加到已有的链表中。具体做法是将 effect 添加到 lastEffect 的后面, 形成一个新的链表节点;
*   返回 effect(影响);

在这里我们可以看出 componentUpdateQueue 和 effect(影响) 是存储的内容是基本一致的:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d4578ab7113041d8b96e484ce3968815~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

等该函数调用结束, 最终又返回 mountEffectImpl 函数中, 将所返回的 effect(影响) 赋值给 hook(钩).memoizedState:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0cde7ab254a74965bdcf7196f80c7e0d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

当你到这里把整个流程走完成之后, 整个时候 hook 函数已经被创建起来了, 在当前的 workInProgress 上已经构建完成了, 我们把目光放回到一个古老函数中:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b128e8c7aba408c80194e538a51e0b2~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

currentlyRenderingFiber 就是当前正在创建的 fiber 树, 我们看看它是怎么样的结果, 我们现在我们的项目中定义以下组件:

```
import React, { useEffect, useState, useLayoutEffect } from "react";

const App = () => {
  useEffect(() => {
    console.log("a");
  }, ["a"]);

  useEffect(() => {
    console.log("b");
  }, ["b"]);

  useEffect(() => {
    console.log("c");
  }, ["c"]);

  return <div>1</div>;
};

export default App;
```

在 currentlyRenderingFiber.memorizedState 中它是一个单链表结构, 对应着每一个 hook(钩) 函数: ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/328212c4d6f94e708283ead5d24ccc35~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

每一个 hook(钩) 函数中的 memorizedState 又 updateQueue 中的 update(更新) 对象有相关联:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3c85da7859d4ea6bb9bda2f0f45c9b1~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

在 update(更新) 对象中 指向的是 effect(影响) 链表中的最后一个节点, 而该节点就是 currentlyRenderingFiber.memorizedState 中的最后一个 hook(钩) 链表。

整个 `<App />` 组件函数最终形成的数据结构有如下图所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9164483e7ec4400b2d88f4ea9721b4c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

那么问题来了, 既然有了 memorized 存储的单向 hooks 链表, 为什么 updateQueue 也存储一个循环链表？

在 Fiber 树中，memorized 存储的是一个单向 hooks 链表，而 updateQueue 存储的是一个循环链表。这样设计的原因是为了在处理异步更新和批量更新时提供更好的性能和灵活性。

首先，memorized 单向 hooks 链表用于存储组件的当前状态和数据，它记录了每个 useState 或者 useReducer 的值。这个链表的顺序是固定的，每个 hook 在链表中都有一个唯一的位置。

然而，updateQueue 循环链表则用于存储组件的更新操作。由于组件可以多次触发更新，并且每次更新可能会包含多个状态的改变，使用一个循环链表可以方便地记录和管理这些更新操作。循环链表可以按照顺序追踪更新的发生，并且可以很方便地进行添加、删除和遍历操作。

此外，循环链表的设计还符合 React 的更新机制。在 React 更新过程中，会根据更新的优先级来处理不同类型的更新。通过循环链表，React 可以按照优先级顺序依次处理更新，从而提高更新的效率。

综上所述，memorized 单向 hooks 链表用于存储组件状态和数据的快照，而 updateQueue 循环链表用于存储组件的更新操作，这两种链表的设计相互配合，提供了高效和灵活的状态管理和更新机制。

update(更新) 阶段
-------------

当组件进行更新时, 会调用该函数进行更新:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a501932454746c2a44c2e32af090df7~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

而该函数实际上又是调用另外一个函数, 如下图所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2fb32bde2913450a8ab4f651b9deda01~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

在这个函数里, 我们将进入 update 阶段的真正的处理。

### updateEffectImpl

该函数的具体代码如下所示:

```
function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }

  currentlyRenderingFiber.flags |= fiberFlags;

  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps
  );
}
```

既然有了源代码了, 那么接下来我们在我们的项目中定义以下代码, 如下所示:

```
import React, { useEffect, useState, useLayoutEffect } from "react";

const App = () => {
  const [state, setState] = useState(0);
  useEffect(() => {
    console.log("a");
  }, ["a"]);

  useEffect(() => {
    console.log("b");
  }, ["b"]);

  useEffect(() => {
    console.log("c");
  }, ["c"]);

  return (
    <div>
      <h1>{state}</h1>
      <button onClick={() => setState(state + 1)}>点击</button>
    </div>
  );
};

export default App;
```

这段代码和之前的不同的是我们定义了一个 setState 函数用于触发 useEffect 的更新, 因为当状态发生变化的时候会触发 useEffect 函数的执行。

在这个例子中, 当我们点击了 button 按钮的时候, 就会触发 updateEffectImpl, 该函数的主要流程有以下几个方面:

*   调用 `updateWorkInProgressHook()` 取上一个渲染周期的 hook 链中找到与当前位置编号对应的旧 hook 对象并返回赋值给 hook;
    
*   将传入的依赖数组 deps 转换成 null 或者具体的依赖数组;
    
*   初始化 destroy(摧毁) 变量, 赋值为 undefined;
    
*   `if(currentHook !== null)` 如果为 true, 则表明有旧的 hook, 即当前正在更新的 hook, 则检查是否存在依赖项 deps 变化并检查依赖项是否为 null;
    
*   通过 prevEffect.deps 获取之前保存的旧依赖项, 并赋值给 nextDeps;
    
    ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/feffd0eb56f540239cc15aef20f2e6f3~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)
    
*   `if(areHookInputsEqual(nextDeps, prevDeps))` 检查新旧依赖项是否相等, 如果相等, 则不需要重新创建副作用, 直接复用旧的副作用, 并返回;
    
    ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31b249d21cac44f58d442957cde7ee2a~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)
    
*   最后如果依赖项有变化或之前没有 hook, 则将新副作用添加到 hook 中。也就是调用 `hook.memoizedState = pushEffect(...)`;
    

这个函数的作用是在 React 组件更新时, 根据依赖项 deps 的变化来管理 hook 函数的副作用的创建和复用。如果依赖项没有变化, 将复用旧的副作用, 否则创建新的副作用, 并在需要时执行旧副作用的清理操作。

小结一下, 在 useEffect 的 mount 阶段, useEffect 的 create 函数是一定执行的。而在 update 阶段, useEffect 阶段的 create 阶段是只有在依赖项发生了变化的时候才会发生变化才会被执行。

处理 Effect(影响) 回调
----------------

react(反应) 在 commit(提交) 阶段, 它又分为三个小阶段: before mutation、mutation、layout(布局)。

其中具体操作 dom 的阶段是 mutation, 操作 dom 之前是 before mutation, 而操作 dom 之后是 layout(布局)。

layout 阶段在操作 dom 之后, 所以这个阶段是能拿到 dom 的，ref 更新是在这个阶段, useLayoutEffect 回调函数的执行也是在这个阶段。

### commitRoot

在开始之前, 我们先来捋清一下这个流程, 首先, 整个 commit 阶段的入口函数为 `commitRoot`, 而在该函数中调用 commitRootImpl 进入 commit(提交) 阶段:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37cebafb4f06479bb4113cae23a3675c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

而在该函数中, 又循环调用 flushPassiveEffects 函数, 如下代码所示:

```
do {
  flushPassiveEffects();
} while (rootWithPendingPassiveEffects !== null);
```

这个函数主要用于处理副作用的。最终会遍历 effect(影响) 链表执行每个 effect(影响) 的 create(创建) 和 destroy(摧毁) 函数。并执行 flushPassiveEffectsImpl 方法, 对于 flushPassiveEffectsImpl，它主要做了两件事情:

1.  调用 useEffect 的销毁函数;
2.  调用 useEffect 的回调函数;

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41641b3f8eda4140abb455f8b50b1487~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

这三个阶段都在这里调用, 如下图所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63bac26b91ae4ff29cf7e17eabaab2d6~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

### Before Mutation

进入到 commitBeforeMutationEffects 函数中, 这时候该函数主要的作用还是调用 commitBeforeMutationEffects_begin 函数, 到了这里就是真正的处理的时候了, 如下代码所示:

```
function commitBeforeMutationEffects_begin() {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    if (enableCreateEventHandleAPI) {
      const deletions = fiber.deletions;
      if (deletions !== null) {
        for (let i = 0; i < deletions.length; i++) {
          const deletion = deletions[i];
          commitBeforeMutationEffectsDeletion(deletion);
        }
      }
    }

    const child = fiber.child;
    if (
      (fiber.subtreeFlags & BeforeMutationMask) !== NoFlags &&
      child !== null
    ) {
      child.return = fiber;
      nextEffect = child;
    } else {
      commitBeforeMutationEffects_complete();
    }
  }
}
```

commitBeforeMutationEffects_begin 函数它主要用于处理事件和删除操作, 并确保在进行 DOM 修改之前正确应用这些副作用。这个也就是我们之前所说的 `before mutation` 阶段。

在 Commit 阶段的不同子阶段中, React 会逐步将更新应用到实际 DOM 中, 完成组件的更新和渲染过程。

其中调用 commitBeforeMutationEffects_complete() 函数表示该子阶段处理完成。这个函数主要做的事情是进入一个循环, 该循环讲一直执行直到 `nextEffect` 为 null, 也就是遍历完成所有待处理的 `Fiber` 节点。

调用 `commitBeforeMutationEffectsOnFiber(fiber)` 函数处理特定 Fiber 节点上的操作, 如果出现错误，它会捕获并处理错误，然后继续处理下一个节点或兄弟节点，最终完成提交阶段的准备工作。

### mutation 阶段

这是 commit 三个子阶段中的第二个阶段, 也就是 mutation 阶段, 在这个阶段, React 在这个阶段对 DOM 进行了更新操作。

在该函数中实际上调用的是 commitMutationEffectsOnFiber 函数:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c352862a05fe4f64b30d4f0f6844ad86~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

commitMutationEffectsOnFiber 的核心实现为不同类型的 fiber 进行不同的处理, 但有一些公共的逻辑会执行, 它们分别是做删除和插入操作:

*   recursivelyTraverseMutationEffects: 执行删除操作;
*   commitReconciliationEffects: 执行插入操作;

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59fb77de94b942cb887c2e8df0eed60d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

#### recursivelyTraverseMutationEffects 执行删除操作

这个方法中主要做的事情是处理删除工作, 它会读取 fiber 上的 deletions 数组, 对要删除的 fiber 进行操作。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4525a13d5c62426b8d8328b877f7e2d8~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

而该函数中, 又是调用另外一个函数, 这个函数就是做的一些核心操作了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/011b32fe3f5a4dcc90bcbdc55a8677ec~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

##### 删除操作详解

进入到 commitDeletionEffectsOnFiber 函数中, 说明我们进入到了真正的删除操作了, 首先我们来看看这个函数大体。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39fcb8dd504442c687a66c2b21bf66b0~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

它主要做的事情是跟着不同的 `deletedFiber.tag` 也就是不同的组件类型去做不同的删除操作。

###### 原生组件

执行原生组件会执行两个 switch 的 case, 如下代码所示:

```
function commitDeletionEffectsOnFiber(
  finishedRoot: FiberRoot,
  nearestMountedAncestor: Fiber,
  deletedFiber: Fiber
) {
  switch (deletedFiber.tag) {
    case HostComponent: {
      if (!offscreenSubtreeWasHidden) {
        safelyDetachRef(deletedFiber, nearestMountedAncestor);
      }
    }
    case HostText: {
      if (supportsMutation) {
        const prevHostParent = hostParent;
        const prevHostParentIsContainer = hostParentIsContainer;
        hostParent = null;
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;

        if (hostParent !== null) {
          if (hostParentIsContainer) {
            removeChildFromContainer(
              ((hostParent: any): Container),
              (deletedFiber.stateNode: Instance | TextInstance)
            );
          } else {
            removeChild(
              ((hostParent: any): Instance),
              (deletedFiber.stateNode: Instance | TextInstance)
            );
          }
        }
      } else {
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber
        );
      }
      return;
    }
  }
}
```

在开始之前, 我们先来了解一下 HostComponent 和 case HostText 的区别, 如下代码所示:

```
<div>
  Hello, <span>world</span>
</div>
```

在上述 JSX 代码中，React 将会创建一个树状结构，其中包含了以下几个节点：

*   一个 HostComponent 节点表示外层的 `<div>` 元素;
*   一个 HostText 节点表示文本内容 `Hello,` ;
*   一个 HostComponent 节点表示 `<span>` 元素;
*   另一个 HostText 节点表示文本内容 `world`;

对于这些组件, 也就是原生组件, 当 React 执行删除操作的时候, 会有以下过程:

1.  首先将绑定的 ref 值为 null;
2.  递归对它的子 fiber 进行删除操作;
3.  最终从 DOM 树中删除对应的 DOM;

###### 类组件

对于类组件, 也就是代码里面对应的 ClassComponent, 具体代码如下所示:

```
function commitDeletionEffectsOnFiber(
  finishedRoot: FiberRoot,
  nearestMountedAncestor: Fiber,
  deletedFiber: Fiber
) {
  switch (deletedFiber.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      if (!offscreenSubtreeWasHidden) {
        const updateQueue: FunctionComponentUpdateQueue | null = (deletedFiber.updateQueue: any);
        if (updateQueue !== null) {
          const lastEffect = updateQueue.lastEffect;
          if (lastEffect !== null) {
            const firstEffect = lastEffect.next;

            let effect = firstEffect;
            do {
              const {destroy, tag} = effect;
              if (destroy !== undefined) {
                if ((tag & HookInsertion) !== NoHookEffect) {
                  safelyCallDestroy(
                    deletedFiber,
                    nearestMountedAncestor,
                    destroy,
                  );
                } else if ((tag & HookLayout) !== NoHookEffect) {
                  if (enableSchedulingProfiler) {
                    markComponentLayoutEffectUnmountStarted(deletedFiber);
                  }

                  if (
                    enableProfilerTimer &&
                    enableProfilerCommitHooks &&
                    deletedFiber.mode & ProfileMode
                  ) {
                    startLayoutEffectTimer();
                    safelyCallDestroy(
                      deletedFiber,
                      nearestMountedAncestor,
                      destroy,
                    );
                    recordLayoutEffectDuration(deletedFiber);
                  } else {
                    safelyCallDestroy(
                      deletedFiber,
                      nearestMountedAncestor,
                      destroy,
                    );
                  }

                  if (enableSchedulingProfiler) {
                    markComponentLayoutEffectUnmountStopped();
                  }
                }
              }
              effect = effect.next;
            } while (effect !== firstEffect);
          }
        }
      }

      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber,
      );
      return;
    }
}
```

这段代码主要的操作有以下几个方面:

1.  调用 safelyDetachRef 函数, 移除 ref 引用;
2.  检查该类组件实例是否定义了 componentWillUnmount 生命周期方法。如果定义了, 则调用 safelyCallComponentWillUnmount 函数, 安全地执行 componentWillUnmount 方法;
3.  递归处理 fiber 子阶段进行删除操作;

###### 函数组件

对于类组件, 也就是代码里面对应的 FunctionComponent、ForwardRef、MemoComponent、SimpleMemoComponent, 具体代码如下所示:

```
function commitDeletionEffectsOnFiber(
  finishedRoot: FiberRoot,
  nearestMountedAncestor: Fiber,
  deletedFiber: Fiber
) {
  switch (deletedFiber.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      if (!offscreenSubtreeWasHidden) {
        const updateQueue: FunctionComponentUpdateQueue | null =
          (deletedFiber.updateQueue: any);
        if (updateQueue !== null) {
          const lastEffect = updateQueue.lastEffect;
          if (lastEffect !== null) {
            const firstEffect = lastEffect.next;

            let effect = firstEffect;
            do {
              const { destroy, tag } = effect;
              if (destroy !== undefined) {
                if ((tag & HookInsertion) !== NoHookEffect) {
                  safelyCallDestroy(
                    deletedFiber,
                    nearestMountedAncestor,
                    destroy
                  );
                } else if ((tag & HookLayout) !== NoHookEffect) {
                  if (enableSchedulingProfiler) {
                    markComponentLayoutEffectUnmountStarted(deletedFiber);
                  }

                  if (
                    enableProfilerTimer &&
                    enableProfilerCommitHooks &&
                    deletedFiber.mode & ProfileMode
                  ) {
                    startLayoutEffectTimer();
                    safelyCallDestroy(
                      deletedFiber,
                      nearestMountedAncestor,
                      destroy
                    );
                    recordLayoutEffectDuration(deletedFiber);
                  } else {
                    safelyCallDestroy(
                      deletedFiber,
                      nearestMountedAncestor,
                      destroy
                    );
                  }

                  if (enableSchedulingProfiler) {
                    markComponentLayoutEffectUnmountStopped();
                  }
                }
              }
              effect = effect.next;
            } while (effect !== firstEffect);
          }
        }
      }

      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      return;
    }
  }
}
```

这里主要做的事情是遍历它的 updateQueue 队列, 并通过 effect 的 tag 来识别类型来决定是否调用 destroy 方法。

对 useInsertionEffect 和 useLayoutEffect，调用它们的 destroy(摧毁) 方法。destroy(摧毁) 就是执行 useInsertionEffect / useLayoutEffect 的回调函数所返回的函数。useEffect 则跳过，不调用 destroy(摧毁) 方法。

最后还是递归子 fiber 进行删除操作。

#### commitReconciliationEffects 执行插入操作

完成删除逻辑后，接着就是调用 commitReconciliationEffects，这个方法负责往真实 DOM 树中插入 DOM 节点。

完整代码如下所示:

```
function commitReconciliationEffects(finishedWork: Fiber) {
  /**
   * 如果此 fiber 要执行插入操作的话
   */
  const flags = finishedWork.flags;
  if (flags & Placement) {
    try {
      // 进行插入操作,也就是把此 fiber 对应的真实 DOM 节点添加到父真实 DOM 节点上
      commitPlacement(finishedWork);
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }

    // 把 flags 里的 placement 删除
    finishedWork.flags &= ~Placement;
  }
  if (flags & Hydrating) {
    finishedWork.flags &= ~Hydrating;
  }
}
```

#### 更新操作

对于前面中说到的原生组件, 后面还有一段逻辑需要执行, 如下所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d72dabb3b275432f8ecd365c15fdb1b4~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

首先检查 flags 是否包含 Update 标志位, 如果存在, 表示当前 fiber 需要进行属性更新操作。

获取当前 HostComponent 节点的实例 `instance`, 即对应的真实 DOM 元素是否存在, 如果存在获取当前节点的新属性 newProps 和旧属性 oldProps。

然后将当前节点的实例 instance(实例)、属性更新的有效载荷 updatePayload、节点类型 type、旧属性 oldProps、新属性 newProps 和当前节点的更新队列 finishedWork 作为参数传递给 commitUpdate 函数。

该函数完整代码如下所示, 很简单, 也就调用两个函数:

```
export function commitUpdate(
  domElement: Instance,
  updatePayload: Array<mixed>,
  type: string,
  oldProps: Props,
  newProps: Props,
  internalInstanceHandle: Object
): void {
  // Apply the diff to the DOM node.
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
  // Update the props handle so that we know which props are the ones with
  // with current event handlers.
  updateFiberProps(domElement, newProps);
}
```

这个函数的主要作用是在 React 的提交阶段，将更新后的属性应用到真实的 DOM 元素上，以确保虚拟 DOM 更新与实际的 DOM 同步。它执行了以下两个主要任务:

1.  调用 updateProperties 函数, 将属性更新应用到 DOM 阶段上:
    *   domElement 是要更新的真实 DOM 元素;
    *   updatePayload 是属性更新的有效载荷，其中包含了实际变化的属性信息;
    *   type 是 DOM 元素的类型;
    *   oldProps 是之前的属性;
    *   newProps 是更新后的属性;
    *   此函数通过将 updatePayload 中的属性变化应用到 domElement 上, 实现了属性的更新;

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf46392fd2e54dcaaafa50399eabda5d~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

2.  调用 updateFiberProps 函数，更新保存在 React(反应) Fiber 节点上的属性信息:
    *   domElement 是要更新的真实 DOM 元素;
    *   newProps 是更新后的属性;
    *   此函数将更新后的属性信息保存在 React Fiber 节点的属性上, 以便在后续的更新中使用;

总的来说，这个函数负责在提交阶段将虚拟 DOM 更新的属性变化应用到真实的 DOM 元素上，并更新 React Fiber 节点中的属性信息，以确保虚拟 DOM 和实际 DOM 之间保持同步。这是 React 在提交阶段执行的一部分，用于将虚拟 DOM 的属性变化映射到实际的 DOM 中。

### layout(布局) 阶段

这个阶段进入第三阶段, 也就是 DOM 变更后, 它会有以下调用顺序 `commitLayoutEffects -> commitLayoutEffects_begin`, 那么接下来我们看看该函数主要做的事情有什么, 如下代码所示:

```
function commitLayoutEffects_begin(
  subtreeRoot: Fiber,
  root: FiberRoot,
  committedLanes: Lanes
) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const firstChild = fiber.child;

    if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
      firstChild.return = fiber;
      nextEffect = firstChild;
    } else {
      commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes);
    }
  }
}
```

> 该函数省略了一个 if 判断, 主要判断该组件是否属于 keep-alive 组件, 但是目前还没有提供相关 API, 这里暂时不做讲解。

该函数主要用于在提交阶段执行布局效果 layout effects, 即处理组件布局相关的操作。它会遍历 fiber 树中的节点, 根据不同的条件来执行不同的布局操作。以下是代码的主要作用:

1.  遍历 fiber 树中的节点, 从 nextEffect 开始，直到遍历完所有的节点;
2.  如果当前 fiber 节点有子节点 firstChild 不为 null, 且其 subtreeFlags 中包含布局标志 LayoutMask, 则将第一个子节点的 return 指向当前 fiber, 将 nextEffect 指向第一个子节点，继续遍历子树的布局效果;
3.  如果当前 fiber 节点没有子节点或者没有布局标志, 执行 commitLayoutMountEffects_complete 函数，完成该节点的布局操作;

commitLayoutMountEffects_complete 函数主要做的事情就是对于每个 fiber 节点, 检查其 flags 是否包含布局标志 LayoutMask:

*   如果包含, 表示该节点需要执行布局效果, 即进行组件的布局操作;
*   获取当前节点的备份 current, 用于比较和更新布局效果;
*   调用 commitLayoutEffectOnFiber 函数, 执行当前节点的布局效果操作;
*   在布局操作期间, 可能会捕获并处理布局阶段的错误

在 commitLayoutEffectOnFiber 函数中依然是根据不同的组件类型调用不同的方法, 先来看看类组件的:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b36eb3b211994176a0987f7e923889c0~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

会在这个阶段调用 `componentDidMount` 生命周期方法。

在函数组件中, 会调用 commitHookEffectListMount 函数, 该函数主要实现如下所示:

```
function commitHookEffectListMount(flags: HookFlags, finishedWork: Fiber) {
  const updateQueue: FunctionComponentUpdateQueue | null =
    (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        if (enableSchedulingProfiler) {
          if ((flags & HookPassive) !== NoHookEffect) {
            markComponentPassiveEffectMountStarted(finishedWork);
          } else if ((flags & HookLayout) !== NoHookEffect) {
            markComponentLayoutEffectMountStarted(finishedWork);
          }
        }
        // Mount
        const create = effect.create;

        effect.destroy = create();

        if (enableSchedulingProfiler) {
          if ((flags & HookPassive) !== NoHookEffect) {
            markComponentPassiveEffectMountStopped();
          } else if ((flags & HookLayout) !== NoHookEffect) {
            markComponentLayoutEffectMountStopped();
          }
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

该函数的主要用于组件挂载阶段执行 hook effects 的操作。它会遍历 Hook 链表, 对每个 Hook 效果进行相应的操作, 包括创建和执行清理操作。以下是这个函数的主要作用:

1.  获取 finishedWork 中的更新队列 updateQueue, 该队列保存了组件的 Hook(钩) 效果;
    
    ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b1a02e852a614f6ebc1ea949f789c6cb~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)
    
2.  从更新队列中获取最后一个 Hook(钩) 效果 lastEffect，并从中获得第一个 Hook(钩) 效果 firstEffect;
    
3.  循环遍历每个 Hook 效果，检查其标志 tag 是否与传入的 flags 匹配，即是否需要执行当前操作;
    
4.  如果需要执行当前操作，则根据 Hook 的类型执行相应的操作:
    
    *   如果是被标记为 HookPassive 的效果, 表示 passively 进行的 Hook(钩) 效果，会进行 passively 渲染。
        
        > PassiveEffect 是一种副作用标志，用于表示在组件的生命周期中执行的副作用类型。副作用是指在组件渲染期间可能执行的操作，例如订阅、取消订阅、数据获取等。而 PassiveEffect 表示一种被动的、不会触发组件重新渲染的副作用。这意味着在执行这种副作用时，React 不会因为副作用的执行而重新渲染组件。这对于性能优化非常有用，因为它允许开发人员在不影响渲染性能的情况下执行副作用操作。
        
    *   如果是被标记为 HookLayout 的效果，表示布局相关的 Hook 效果，会执行布局操作;
        
    *   调用 create() 创建 Hook 效果，并将返回的清理函数存储到 effect.destroy 中, 这个 `create()` 函数也就是我们使用 `useEffect` 中传入的第一个回调函数了, 会在这个阶段执行。
        
5.  循环遍历完所有的 Hook 效果后，完成组件的挂载阶段的 Hook 效果操作；
    

这个函数在组件挂载阶段负责执行 Hook 效果的相关操作，包括创建效果和执行清理操作。这是 React Hooks 在组件生命周期中的一部分，用于处理 Hook 效果的创建、执行和清理工作，确保 Hook 效果在组件挂载期间正确地工作。

useEffect
---------

现在我们再回到 useEffect 这个 hook, 它不在同步的 commit 阶段中执行, 它是异步的, 被 Scheduler 异步调度了, 如下代码所示:

```
scheduleCallback(NormalSchedulerPriority, () => {
  flushPassiveEffects();

  return null;
});
```

在这个函数里, 先执行所有 useEffect 的 destroy 方法，然后才执行所有 useEffect 的 create 方法。并保持顺序是先子后父。 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14cbf8b8e3f44543950639514a35432c~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

所以整个 commit 阶段有如下流程图所示:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75845ea8d0964ab9a3d7f760c5bf5173~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

useLayoutEffect 的同步执行
=====================

useLayoutEffect 这个 hook(钩) 在执行的时候，也是先调用 `destroy()`，再执行 `create()`。和 useEffect 不同的是前者在 mutation 阶段执行，后者在 layout(布局) 阶段执行。

与 useEffect 不同的是，它不用数组去存储销毁和创建函数，而是直接操作 fiber.updateQueue。

卸载上一次的 effect(影响)，发生在 mutation 阶段:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87f69ce24c334e8a8b5ed9ca218c9b02~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85e6cedef1124202be9a812c581e9ca0~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

执行本次的 effect 创建，发生在 layout 阶段:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc1b427c5d4d4288bfa3878b74f5c566~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bc0aacb35154f2e869341f3a1b4de16~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp)

参考文章
====

*   [全网最新，最全面，也是最深入剖析 useEffect() 原理的文章, 没有之一](https://juejin.cn/post/7224764099187720250#heading-32 "https://juejin.cn/post/7224764099187720250#heading-32")
*   [理解 React(反应) 的 commit(提交) 阶段](https://juejin.cn/post/7177932043219632183#heading-9 "https://juejin.cn/post/7177932043219632183#heading-9")
*   [梳理 useEffect 和 useLayoutEffect 的原理与区别](https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000039087645 "https://segmentfault.com/a/1190000039087645")

总结
==

useEffect 和 useLayoutEffect 都用于在组件渲染完成后执行副作用操作，但它们的触发时机和执行顺序不同。它们共用一套结构来存储 effect 链表。

整体流程上都是先在 render 阶段，生成 effect，并将它们拼接成链表，存到 fiber.updateQueue 上, 这些 effect 表示在组件渲染后需要执行的副作用操作，如数据获取、订阅事件等, 最终带到 commit 阶段被处理。

useEffect 生成的 effect 会进入 Scheduler 调度, 在浏览器空闲时异步执行, 不会阻塞渲染, 这样可以避免影响用户界面的响应性。

useLayoutEffect 生成的 effect 会在浏览器 layout 阶段之前同步执行, 这可能会阻塞渲染, 因此需要谨慎使用, 以避免性能问题

最后分享两个我的两个开源项目, 它们分别是:

*   [前端脚手架 create(创建)-neat(整洁)](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxun082%2Fcreate-neat "https://github.com/xun082/create-neat")
*   [在线代码协同编辑器](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fxun082%2Fonline-cooperative-edit "https://github.com/xun082/online-cooperative-edit")

这两个项目都会一直维护的, 如果你也喜欢, 欢迎 star 🥰🥰🥰