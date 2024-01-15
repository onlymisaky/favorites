> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/w0mBbZV4-VMBfnFRVZ6Klw)

**前言**  
在玩游戏的时候，我们必须得遵守游戏的规则，那么游戏才能够进行下去。同理我们在使用任何语言开发的时候，无一例外，都要遵守该语言的语法。在使用任何框架的时候，我们都必须遵守框架的规则。  
在 React Hooks 中，也有诸多的规则，那我们就一起来看看这些规则、技巧以及正确的使用姿势。

**请勿在循环或者条件语句中使用 hooks**  
这是个基本入门的问题了，也是 React Hooks 的首要规则，这是因为 React Hooks 是以单向循环链表的形式存储，即是有序的。循环是为了从最后一个节点移到一个节点的时候，只需通过 next 一步就可以拿到第一个节点，而不需要一层层回溯。React Hooks 的执行，分为 mount 和 update 阶段，在 mount 阶段的时候，通过 mountWorkInProgressHook() 创建各个 hooks (如 useState, useMemo, useEffect, useCallback 等)，并且将当前 hook 添加到表尾。在 update 阶段，在获取或者更新 hooks 值的时候，会先获取当前 hook 的状态，hook.memoizedState，并且是按照顺序或读写更新 hook，若在条件或者循环语句使用 hooks，那么在更新阶段，若增加或者减少了某个 hook，hooks 的数量发生变化，而 React 是按照顺序，通过 next 读取下一个 hook，则导致后面的 hooks 和挂载阶段对应不上，发生读写错值的情况，从而引发 bug。  
我们可以看看 useState 在 mount 阶段的源码：  

```
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  if (typeof initialState === 'function') {
    // $FlowFixMe: Flow doesn't like mixed types
    initialState = initialState();
  }
  hook.memoizedState = hook.baseState = initialState;
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  };
  hook.queue = queue;
  const dispatch: Dispatch<
    BasicStateAction<S>,
  > = (queue.dispatch = (dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
  ): any));
  return [hook.memoizedState, dispatch];
}
```

useCallback 在 mount 阶段的源码：  

```
function mountCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```

然后 mountWorkInProgressHook 的源码如下：  

```
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}
```

其他 hooks 的源码也是类似，以 mountWorkInProgressHook 创建当前 hooks, 并且把 hook 的数据存到 hook.memoizedState 上，而在 update 阶段，则是依次读取 hooks 链表的 memoizedState 属性来获取状态 (数据)。

React 为什么要以单向循环链表的形式存储 hooks 呢？直接以 key-value 的对象形式存储就可以在循环或者条件语句中使用 hooks 了，岂不更好？  
这是因为 react scheduler 的调度策略如此，以链表的形式存储是为了可以实现并发、可打断、可恢复、可继续执行下一个 fiber 任务。

**在使用 map 循环数组渲染列表时须指定唯一且稳定值的 key**  
在渲染列表的时候，我们须给组件或者元素分配一个唯一值的 key, key 是一个特殊的属性，不会最终加在元素上面，也无法通过 props.key 来获取，仅在 react 内部使用。react 中的 key 本质是服务于 diff 算法, 它的默认值是 null, 在 diff 算法过程中, 新旧节点是否可以复用, 首先就会判定 key 是否相同, 其后才会进行其他条件的判定（如节点类型，props），从而提升渲染性能，减少重复无效渲染。

为什么在渲染列表组件的时候，为什么不能将 index 设置为 key？  
因为显式地把 index 设为 key，和不设置 key 的效果是一样，这就所谓的就地复用原则，即 react 在 diff 的时候，如果没有 key，就会在老虚拟 DOM 树中，找到对应顺序位置的组件，然后对比组件的类型和 props 来决定是否需要重新渲染。index 作为 key，不仅会在数组发生变化的时候，造成无效多余的渲染，还可能在组件含有非受控组件 (如 input) 的时候，造成 UI 渲染错误。

例如有如下渲染组件列表：  

![](https://mmbiz.qpic.cn/mmbiz_png/3oTRmN6ciaFmjuUJ3vhVgYoQibRGS4qH8FdIncZx4J91YumicrMdkGsYVmcZ1nKdKYAC4tbOW349YpvW1nMHFgaag/640?wx_fmt=png&from=appmsg)

如果是以 index 作为 key，当数组的队首添加一条数据的时候，render 过程如下，会造成 3 次更新，1 次添加：  

![](https://mmbiz.qpic.cn/mmbiz_png/3oTRmN6ciaFmjuUJ3vhVgYoQibRGS4qH8FbGhbgmgQefd5lLeic2h9ib41X9w7HAsEe1Jvv81YoCZ4GCg8hCb7nH2Q/640?wx_fmt=png&from=appmsg)

如果是给 key 指定一个唯一且稳定的 id，则 render 过程如下，就只会发生一次添加操作，而其他组件都没有更新：  

![](https://mmbiz.qpic.cn/mmbiz_png/3oTRmN6ciaFmjuUJ3vhVgYoQibRGS4qH8FXicKmPtrmO0N40jvRuZ8pvJdLKXmeH8Y2WCM4ILc2GvUjdglEtxqOgw/640?wx_fmt=png&from=appmsg)

如果渲染列表的时候，key 重复了会怎么样？  
首先 react 会给你输出警告，告诉你 key 值应该是唯一的，以便组件在更新期间保持其标识。重复的 key 可能导致子节点被重复使用或省略，从而引发 UI bug。

**memo (useMemo, useCallback)**  
在 react 中，当我们 setState 之后，若值发生变化，则会重新 render 当前组件以及其子组件 (默认情况下)，在必要的时候，我可使用 memo (class 组件则对应 shouldComponentUpdate、PureComponent) 进行优化，来减少无效渲染。memo 是一个高阶组件，接受一个组件作为参数，并返回一个原组件为基础的新组件，而在 memo 内部，则会使用 Object.is 来遍历对比新旧 props 是否发生变化，以决定是否需要重新 render。  
在我们使用 memo 包裹子组件的时候，往往需要父组件配合使用 useMemo，useCallback 等，来缓存传给子组件 props 中的引用类型的值和方法 (function 其实也是引用类型数据的一种，useCallback 也是 useMemo 的一种特殊情况)，因为对于 react 函数组件，其本身就是个 render 函数，每次 re-render 之后，都会重新执行此函数，而每次执行的时候就会产生一个新的函数作用域，因此默认每次都会创建一个新的变量，如果是引用类型，则会造成 Object.is 返回 false，故而无法达到防止无效渲染的目的。此时我们需要在父组件传给子组件 props 的值的时候，缓存引用类型数据，来保证在依赖没有变化的情况下，始终返回同一个引用地址。

_注意：只有在组件渲染发生了性能问题的时候，例如组件内容较为复杂，render 过程比较慢，我们才使用 memo (shouldComponentUpdate、PureComponent) 进行优化，否则你会得不偿失，恰得其反，反而造成性能的下降。因为本身在遍历 props 进行对比的过程，就需要一定的执行时间，如果组件较小，re-render 的代价比对比 props 的代价更低，这时候我们就不适合使用 memo (shouldComponentUpdate)。_

useMemo、useCallback 其实就是在更新阶段的时候，对比依赖是否发生变化，若发生变化则创建新的值，若没有，则返回旧的值，useMemo 的 update 阶段源码如下：  

```
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    // Assume these are defined. If they're not, areHookInputsEqual will warn.
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

  
**useImperativeHandle (forwardRef)**  
我们会遇到这样的场景：某个组件想要暴露一些方法，来供外部组件来调用。例如我们在开发 form 表单的时候，就需要把设置表单值、重置值、提交等方法暴露给外部使用。会有如下代码：  

```
import { forwardRef } from 'react';

const Form = forwardRef(function MyForm(props, ref) {
  useImperativeHandle(ref, () => {
    return {
      // ... 你的方法 ...
    };
  }, []);
  
  return (
    <div {...props} ref={ref}>
      <input type="text" />
    </div>
  );
});
```

在组件外部，只需传入 ref 属性，即可调用 form 组件提供的方法。

**获取最新的 state**  
由于 react 中，setState 之后，是采用异步调度、批量更新的策略，导致我们无法直接获取最新的 state。在使用 class 组件的时候，我们可以通过传递第二个参数，传一个回调用函数，来让我们获取最新的 state (在 React 18 以后，就算在 class component 里面，在 setTimeout、原生事件回调里面，也是异步批量更新了)。在 hooks 里面，我目前只能通过 useEffect，把当前 state 当作依赖传入，来在 useEffect 回调函数里面获取最新的 state。  
在 setState 的时候，其实就是在调用 dispatchSetState，源码如下 (删掉了一些注释和 DEV 代码):  

```
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) 
  // 计算更新优先级
  const lane = requestUpdateLane(fiber);

  const update: Update<S, A> = {
    lane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: (null: any),
  };
  // 判断当前fiber是否正在处于更新中，若是则把当前更新进行排队
  if (isRenderPhaseUpdate(fiber)) {
    enqueueRenderPhaseUpdate(queue, update);
  } else {
    const alternate = fiber.alternate;
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      const lastRenderedReducer = queue.lastRenderedReducer;
      if (lastRenderedReducer !== null) {
        let prevDispatcher;
        try {
          const currentState: S = (queue.lastRenderedState: any);
          const eagerState = lastRenderedReducer(currentState, action);
          update.hasEagerState = true;
          update.eagerState = eagerState;
          // 若新旧状态无变化，则直接返回，啥也不干
          if (is(eagerState, currentState)) {
            enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update);
            return;
          }
        } catch (error) {
          // Suppress the error. It will throw again in the render phase.
        } finally {
          if (__DEV__) {
            ReactCurrentDispatcher.current = prevDispatcher;
          }
        }
      }
    }

    const root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    if (root !== null) {
      const eventTime = requestEventTime();
      scheduleUpdateOnFiber(root, fiber, lane, eventTime);
      entangleTransitionUpdate(root, queue, lane);
    }
  }

  markUpdateInDevTools(fiber, lane, action);
}
```

scheduleUpdateOnFiber 则是 react 内部的核心调度方法，源码如下：  

```
export function scheduleUpdateOnFiber(
  root: FiberRoot,
  fiber: Fiber,
  lane: Lane,
  eventTime: number,
) {
  checkForNestedUpdates();

  // Mark that the root has a pending update.
  markRootUpdated(root, lane, eventTime);

  if (
    (executionContext & RenderContext) !== NoLanes &&
    root === workInProgressRoot
  ) {
    warnAboutRenderPhaseUpdatesInDEV(fiber);
    // Track lanes that were updated during the render phase
    workInProgressRootRenderPhaseUpdatedLanes = mergeLanes(
      workInProgressRootRenderPhaseUpdatedLanes,
      lane,
    );
  } else {
    // This is a normal update, scheduled from outside the render phase. For
    // example, during an input event.
    if (enableUpdaterTracking) {
      if (isDevToolsPresent) {
        addFiberToLanesMap(root, fiber, lane);
      }
    }

    warnIfUpdatesNotWrappedWithActDEV(fiber);

    if (enableProfilerTimer && enableProfilerNestedUpdateScheduledHook) {
      if (
        (executionContext & CommitContext) !== NoContext &&
        root === rootCommittingMutationOrLayoutEffects
      ) {
        if (fiber.mode & ProfileMode) {
          let current = fiber;
          while (current !== null) {
            if (current.tag === Profiler) {
              const {id, onNestedUpdateScheduled} = current.memoizedProps;
              if (typeof onNestedUpdateScheduled === 'function') {
                onNestedUpdateScheduled(id);
              }
            }
            current = current.return;
          }
        }
      }
    }

    if (enableTransitionTracing) {
      const transition = ReactCurrentBatchConfig.transition;
      if (transition !== null) {
        if (transition.startTime === -1) {
          transition.startTime = now();
        }

        addTransitionToLanesMap(root, transition, lane);
      }
    }

    if (root === workInProgressRoot) {
      if (
        deferRenderPhaseUpdateToNextBatch ||
        (executionContext & RenderContext) === NoContext
      ) {
        workInProgressRootInterleavedUpdatedLanes = mergeLanes(
          workInProgressRootInterleavedUpdatedLanes,
          lane,
        );
      }
      if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
        markRootSuspended(root, workInProgressRootRenderLanes);
      }
    }

    ensureRootIsScheduled(root, eventTime);
    if (
      lane === SyncLane &&
      executionContext === NoContext &&
      (fiber.mode & ConcurrentMode) === NoMode &&
      // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
      !(__DEV__ && ReactCurrentActQueue.isBatchingLegacy)
    ) {
      resetRenderTimer();
      flushSyncCallbacksOnlyInLegacyMode();
    }
  }
}
```

我们继续追踪 ensureRootIsScheduled 方法，此源码就省略了，然后会调用 scheduleMicrotask 方法，源码如下：  

```
export const scheduleMicrotask: any =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : typeof localPromise !== 'undefined'
    ? callback =>
        localPromise
          .resolve(null)
          .then(callback)
          .catch(handleErrorInNextTick)
    : scheduleTimeout;
```

会优先使用 queueMicrotask 来添加一个微任务，此方法是一个标准的 web api，可以不借助 Promise 来往微任务队列里面添加一个任务。若当前环境不支持 queueMicrotask，则依次优先使用 Promise，setTimeout。这与 vue 的 nextTick 源码实现是基本一致的。通过以上的分析，我们可以大致了解了 react 异步批量更新的调度过程。

**useRef**  
如果我们想在 hooks 里面获同步取最新的值，那么则可以使用 useRef, 关键源码如下：  

```
function mountRef<T>(initialValue: T): {|current: T|} {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): {|current: T|} {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

可以看到，代码实现非常简单，创建一个 ref 对象，然后挂载到 hook.memoizedState, 我们在修改的时候，就是直接修改 ref.current。useRef 其实就是提供一个稳定的变量，在组件的整个生命周期都是持续存在且是同一个引用。  
_注意：修改 useRef 返回的状态不会引起 UI 的重渲染。_

为什么在 setTimeout 的回调函数里面，拿不到 useState 的最新值？  
主要有以下三点原因：  
•  react 中的 state，遵循着状态不可变的原则，在 setState 之后，不会修改原来老的 state 的值，而是把新值重新赋值给 hook.memoizedState。  
•  对于 react 函数组件，其本身就是个 render 函数，每次重渲染之后，都会重新执行此函数，而每次执行的时候就会产生一个新的函数作用域。  
•  setTimeout 的回调函数对 hook.memoizedState 形成了闭包引用，而在 setState 之后，都会重新执行组件函数，setTimeout 的回调函数会捕获在 setTimeout 被创建时的状态的快照，而不是最新的状态。

但是为什么又能获取 useRef 的最新值呢？  
useRef 本身并不能解决闭包引用的问题，但是它通过创建一个稳定的引用:

```
function mountRef<T>(initialValue: T): {|current: T|} {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}
```

mount 在整个组件生命周期，只会触发一次，因此只会创建一次。然后这也是为什么要创建一个对象，而对象上近仅创建一个 current 属性来存储数据，正是为了让开发者在整个生命周期，拿到的始终是同一个引用，可以把它想象成当前组件域下的一个全局变量了，而修改数据仅仅在这个引用上的 current 属性修改。

简单思考：为什么 vue composition api 的 setup 函数不存在闭包引用导致的 setTimeout 回调函数中拿到的是旧值呢？  
因为 setup 函数只会执行一次，返回一个 render 函数，在更新阶段，始终执行的是 render 函数，因此 setTimeout 回调函数的闭包引用中引用的是 setup 函数的状态，不会发生改变。而 react 中，整个组件函数就是一个 render 函数，所以引用的状态在每次 render 的时候都是不同的变量。这是它们的本质区别。