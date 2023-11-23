> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tD4Dz1jDr9r-bnQjomWqZA)

**您好，如果喜欢我的文章，可以关注我的公众号[「量子前端」](https://mp.weixin.qq.com/s?__biz=Mzg4NTk4MjI3NA==&mid=2247483762&idx=1&sn=ec6dc22adeadad8b58cf67c4f3457275&chksm=cfa1d45ff8d65d4937bd7c3076642b1f57691b226a9c6b453a729b014939c7709cf6a4845eb3&token=1905047246&lang=zh_CN&scene=21#wechat_redirect)，将不定期关注推送前端好文~**

Effect 数据结构
===========

顾名思义，`React`底层在函数式组件的`Fiber`节点设计中带入了`hooks`链表的概念（`memorizedState`），在此变量上专门存储每一个函数式组件对应的链表。

而对于副作用（`useEffect` or `useLayoutEffect`）来说，对应其`hook`类型就是`Effect`。

单个的 effect 对象包括以下几个属性：

*   create: 传入`useEffect` or `useLayoutEffect`函数的第一个参数，即回调函数；
    
*   destroy: 回调函数 return 的函数，在该 effect 销毁的时候执行，渲染阶段为`undefined`；
    
*   deps: 依赖项，改变重新执行副作用；
    
*   next: 指向下一个`effect`；
    
*   tag: effect 的类型，区分是`useEffect`还是`useLayoutEffect`；
    

单纯看这些字段，和平时使用层面来联想还是很通俗易懂的，这里还是补充一下`hooks`链表的概念，有如下的例子：

```
const Hello = () => {    const [ text, setText ] = useState('hello')    useEffect(() => {        console.log('effect1')        return () => {            console.log('destory1');        }    })    useLayoutEffect(() => {        console.log('effect2')        return () => {            console.log('destory2');        }    })    return <div>effect</div>}
```

挂载到`Hello`组件`fiber`上`memoizedState`如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/IlE1Y2rl1uYQvvvd8gHp6uQoPGBiaIjBCR9DMGqxbtMegRrHESGdKXVeUYTUZ79eia4gZELfWGnJOyvhblib3F2fA/640?wx_fmt=png)image.png

可以看到，打印出来结果和组件中声明`hook`的顺序是一样的，不难看出这是一个链表，这也是为什么`react hook`要求`hook`的使用不能放在条件分支语句中的原因，如果第一次`mount`走的是 A 情况，第二次`updateMount`走的是 B 情况，就会出现`hooks`链表混乱的情况，保证官方范式是比较重要的原因。

Hook
====

从上图的例子中可以看到，`memorizedState`的值会根据不同`hook`来决定。

*   使用`useState`时，`memorizedState`对应是`string`（hello）；
    
*   使用`useEffect`和`useLayoutEffect`，对应的是`Effect`；
    

`Hook`类型如下：

```
export type Hook = {     memoizedState: any, // Hook 自身维护的状态     baseQueue: any,    baseState: any,    queue: UpdateQueue<any, any> | null, // Hook 自身维护的更新队列     next: Hook | null, // next 指向下一个 Hook };
```

创建副作用流程
=======

基于上面的数据结构，对于 use（Layout）Effect 来说，React 做的事情就是

*   render 阶段：函数组件开始渲染的时候，创建出对应的 hook 链表挂载到`workInProgress`的`memoizedState`上，并创建 effect 链表，也就是挂载到对应的`fiber`节点上，但是基于上次和本次依赖项的比较结果， 创建的 effect 是有差异的。这一点暂且可以理解为：依赖项有变化，`effect`可以被处理，否则不会被处理。
    
*   commit 阶段：异步调度`useEffect`或者同步处理`useLayoutEffect`的`effect`。等到`commit`阶段完成后，更新应用到页面上之后，开始处理`useEffect`产生的`effect`，或是直接处理`commit`阶段同步执行阻塞页面更新的`useLayoutEffect`产生的`effect`。
    

第二点提到了一个重点，就是 useEffect 和 useLayoutEffect 的执行时机不一样，前者被异步调度，当页面渲染完成后再去执行，不会阻塞页面渲染。后者是在 commit 阶段新的 DOM 准备完成，但还未渲染到屏幕之前，同步执行。

创建 effect 链表
============

`useEffect`的工作是在`currentlyRenderingFiber`加载当前的`hook`，具体流程就是判断当前`fiber`是否已经存在`hook`（就是判断`fiber.memoizedState`），存在的话则创建一个`effect hook`到链表的最后，也就是`.next`，没有的话则创建一个`memoizedState`。

先看一下创建一个`Effect`的入口函数：

```
function mountEffect(    create: () => (() => void) | void,    deps: Array<mixed> | void | null): void {    return mountEffectImpl(        UpdateEffect | PassiveEffect,        HookPassive,        create,        deps,    );};
```

可以看到本质上是调用了`mountEffectImpl`函数，传了上一节所说的`Effect type`中的字段，这里有个问题，为什么`destroy`没传呢？获取上一次`effect`的`destroy`函数，也就是`useEffect`回调中`return`的函数，在创建阶段是第一次，所以为`undefined`。

**这里看一下创建阶段调用的`mountEffectImpl`函数：**

```
function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {  // 创建hook对象  const hook = mountWorkInProgressHook();  // 获取依赖  const nextDeps = deps === undefined ? null : deps;  // 为fiber打上副作用的effectTag  currentlyRenderingFiber.flags |= fiberFlags;  // 创建effect链表，挂载到hook的memoizedState上和fiber的updateQueue  hook.memoizedState = pushEffect(    HookHasEffect | hookFlags,    create,    undefined,    nextDeps,  );}
```

接下来我们都知道，`React`或`Vue`都是状态改变导致页面重渲染，而`useEffect` or `useLayoutEffect`都会会根据`deps`变化重新执行，所以猜都猜得到，在更新时调用的`updateEffectImpl`函数，对比`mountEffectImpl`函数多出来的一部分内容其实就是对比上一次的`Effect`的依赖变化，以及执行上一次`Effect`中的`destroy`部分内容~ 代码如下：

```
function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {  const hook = updateWorkInProgressHook();  const nextDeps = deps === undefined ? null : deps;  let destroy = undefined;  if (currentHook !== null) {    // 从currentHook中获取上一次的effect    const prevEffect = currentHook.memoizedState;    // 获取上一次effect的destory函数，也就是useEffect回调中return的函数    destroy = prevEffect.destroy;    if (nextDeps !== null) {      const prevDeps = prevEffect.deps;      // 比较前后依赖，push一个不带HookHasEffect的effect      if (areHookInputsEqual(nextDeps, prevDeps)) {        pushEffect(hookFlags, create, destroy, nextDeps);        return;      }    }  }  currentlyRenderingFiber.flags |= fiberFlags;  // 如果前后依赖有变，在effect的tag中加入HookHasEffect  // 并将新的effect更新到hook.memoizedState上  hook.memoizedState = pushEffect(    HookHasEffect | hookFlags,    create,    destroy,    nextDeps,  );}
```

可以看到在`mountEffectImpl`和`updateEffectImpl`中，最后的结果走向都是`pushEffect`函数，它的工作很纯粹，就是创建出`effect`对象，把对象挂到链表中。

**`pushEffect`代码如下：**

```
function pushEffect(tag, create, destroy, deps) {  // 创建effect对象  const effect: Effect = {    tag,    create,    destroy,    deps,    // Circular    next: (null: any),  };  // 从workInProgress节点上获取到updateQueue，为构建链表做准备  let componentUpdateQueue: null | FunctionComponentUpdateQueue = (currentlyRenderingFiber.updateQueue: any);  if (componentUpdateQueue === null) {    // 如果updateQueue为空，把effect放到链表中，和它自己形成闭环    componentUpdateQueue = createFunctionComponentUpdateQueue();    // 将updateQueue赋值给WIP节点的updateQueue，实现effect链表的挂载    currentlyRenderingFiber.updateQueue = (componentUpdateQueue: any);    componentUpdateQueue.lastEffect = effect.next = effect;  } else {    // updateQueue不为空，将effect接到链表的后边    const lastEffect = componentUpdateQueue.lastEffect;    if (lastEffect === null) {      componentUpdateQueue.lastEffect = effect.next = effect;    } else {      const firstEffect = lastEffect.next;      lastEffect.next = effect;      effect.next = firstEffect;      componentUpdateQueue.lastEffect = effect;    }  }  return effect;}
```

这里的主要逻辑其实就是本节开头所说的，区分两种情况，链表为空或链表存在的情况，值得一提的是这里的`updateQueue`是一个环形链表。

以上，就是`effect`链表的构建过程。我们可以看到，`effect`对象创建出来最终会以两种形式放到两个地方：单个的`effect`，放到`hook.memorizedState`上；环状的`effect`链表，放到`fiber`节点的`updateQueue`中。两者各有用途，前者的`effect`会作为上次更新的`effect`，为本次创建`effect`对象提供参照（对比依赖项数组），后者的`effect`链表会作为最终被执行的主体，带到`commit`阶段处理。

提交阶段
====

commitRoot
----------

当我们完成更新，进入提交重渲染视图时，主要在`commitRoot`函数中执行，而在这之前创建`Effect`以及插入到`hooks`链表中，`useEffect`和`useLayoutEffect`其实做的都是一样的，也是共用的，在提交阶段，我们会看出两者执行时机不同的实现点。

```
// src/react-reconciler/src/ReactFiberWorkLoop.jsfunction commitRoot(root) {  // 已经完成构建的fiber，上面会包括hook信息  const { finishedWork } = root;  // 如果存在useEffect或者useLayoutEffect  if ((finishedWork.flags & Passive) !== NoFlags) {    if (!rootDoesHavePassiveEffect) {      rootDoesHavePassiveEffect = true;      // 开启下一个宏任务      requestIdleCallback(flushPassiveEffect);    }  }  console.log('start commit.');    // 判断自己身上有没有副作用  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;  // 如果自己的副作用或者子节点有副作用就进行DOM操作  if (rootHasEffect) {    // 当DOM执行变更之后    console.log('DOM执行完毕');    commitMutationEffectsOnFiber(finishedWork, root);    // 执行layout Effect    console.log('开始执行layoutEffect');    commitLayoutEffects(finishedWork, root);    if (rootDoesHavePassiveEffect) {      rootDoesHavePassiveEffect = false;      rootWithPendingPassiveEffects = root;    }  }  // 等DOM变更之后，更改root中current的指向  root.current = finishedWork;}
```

这里的`rootDoesHavePassiveEffect`是核心判断点，还记得`Effect`类型中的`tag`参数吗？就是依靠这个参数来标识区分`useEffect`和`useLayoutEffect`的。

`rootDoesHavePassiveEffect === false`，则执行宏任务，将`Effect`副作用推入宏任务执行栈中。我们可以简单理解成`useEffect`的回调函数包装在了`requestIdleCallback`中去异步执行，根据`fiber`的知识接下来会去走浏览器当前帧是否有空余时间来判断副作用函数的执行时机。

继续往下走，如果`rootHasEffect === true`，代表有副作用，如果是`useEffect`，副作用已经在上面进入宏任务队列了，所以如果是`useLayoutEffect`，就会在这个条件中去执行，所以在这里我们可以理解到那一句 "useEffect 和 useLayoutEffect 的区别是，前者会异步执行副作用函数不会阻塞页面更新，后者会立即执行副作用函数，会阻塞页面更新，不适合写入复杂逻辑。" 的原因了。

结尾
==

`useEffect`与`useLayoutEffect`十分相似，就连签名都一样，不同之处就在于前者会在浏览器绘制后延迟执行，而后者会在所有 DOM 变更之后同步调用`effect`，希望你看到这里，可以对于这个结论的来源有一定的了解和学习，希望可以帮到你~

**如果喜欢我的文章，可以关注我的公众号[「量子前端」](https://mp.weixin.qq.com/s?__biz=Mzg4NTk4MjI3NA==&mid=2247483762&idx=1&sn=ec6dc22adeadad8b58cf67c4f3457275&chksm=cfa1d45ff8d65d4937bd7c3076642b1f57691b226a9c6b453a729b014939c7709cf6a4845eb3&token=1905047246&lang=zh_CN&scene=21#wechat_redirect)，将不定期关注推送前端好文~**