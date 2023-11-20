> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PiKXdFAqd70-CAsR-Vtmog)

点击上方蓝字，发现更多精彩

  

导语

  

  

大家都知道 React 是以数据为核心的，当状态发生改变时组件会进行更新并渲染。除了通过 React Redux、React Hook 进行状态管理外，还有像我这种小白通过 setState 进行状态修改。对于 React 的初学者来说，setState 这个 API 是再亲切不过了，同时也很好奇 setState 的更新机制，因此写了一篇文章来进行巩固总结 setState。

React 把组件看成是一个 State Machines 状态机，首先定义数值的状态 state，通过用户交互后状态发生改变，然后更新渲染 UI。也就是说更新组件的 state，然后根据新的 state 重新渲染更新用户的界面。而在编写类组件时，通常分配 state 的地方是 construtor 函数。  

刚开始热情满满学习的时候，总是从 React 官方文档开始死磕，看到 state 那一块，官方文档抛出了 “关于 setState() 你应该了解的三件事 “几个醒目的大字：

（1）不要直接修改 state （2）state 的更新可能是异步的 （3）state 的更新会被合并

啊… 那 setState 方法从哪里来？为什么 setState 是有时候是异步会不会有同步的呢？为什么多次更新 state 的值会被合并只会触发一次 render？为什么直接修改 this.state 无效？？？

带着这么多的疑问，因为刚来需求也不多，对 setState 这一块比较好奇，那我就默默 clone 了 react 源码。今天从这四个有趣的问题入手，用 setState 跟大家深入探讨 state 的更新机制，一睹 setState 的芳容。源码地址入口 (本次探讨是基于 React 16.7.0 版本，React 16.8 后加入了 Hook)。

  

  

  

  

1. setState API 从哪里来

```
Component.prototype.setState = function(partialState, callback) {
  ...
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```

setState 是挂载在组件原型上面的方法，因此用 class 方法继承 React.Component 时，setState 就会被自定义组件所继承。通过调用 this 就可以访问到挂载到组件实例对象上的 setState 方法，setState 方法从这来。

  

  

  

  

2. setState 异步更新 && 同步更新

在 react state 源码注释中有这样一句话：

```
There is no guarantee that this.state will be immediately updated, so accessing this.state after calling this method may return the old value.
```

大概意思就是说 setState 不能确保实时更新 state，但也没有明确 setState 就是异步的，只是告诉我们什么时候会触发同步操作，什么时候是异步操作。

首先要知道一点，setState 本身的执行过程是同步的，只是因为在 react 的合成事件与钩子函数中执行顺序在更新之前，所以不能直接拿到更新后的值，形成了所谓的 “异步”。异步可以避免 react 改变状态时，资源开销太大，要去等待同步代码执行完毕，使当前的 JS 代码被阻塞，这样带来不好的用户体验。

那 setState 什么时候会执行异步操作或者同步操作呢？

简单来说，由 react 引发的事件处理都是会异步更新 state，如

*   合成事件（React 自己封装的一套事件机制，如 onClick、onChange 等）
    
*   React 生命周期函数
    

而使用 react 不能控制的事件则可以实现同步更新，如

*   setTimeout 等异步操作
    
*   原生事件，如 addEventListener 等
    
*   setState 回调式的 callback
    

由上面第一部分的代码可知 setState 方法传入参数是 partialState, callback，partialState 是需要修改的 setState 对象，callback 是修改之后回调函数，如 `setState（{},()=>{}）`。我们在调用 setState 时，也就调用了 `this.updater.enqueueSetState`，updater 是通过依赖注入的方式，在组件实例化的时候注入进来的，而之后被赋值为 classComponentUpdater。而 enqueueSetState 如其名，是一个队列操作，将要变更的 state 统一插入队列，待一一处理。enqueueSetState 函数如下：

```
const classComponentUpdater = {
  isMounted,
  // inst其实就是组件实例对象的this
  enqueueSetState(inst, payload, callback) {
  //  获取当前实例上的fiber
    const fiber = getInstance(inst);
    const currentTime = requestCurrentTime();
    const expirationTime = computeExpirationForFiber(currentTime, fiber);
    const update = createUpdate(expirationTime);
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }
    flushPassiveEffects();
    //    把更新放到队列中去
    enqueueUpdate(fiber, update);
    //     进入异步渲染的核心：React Scheduler
    scheduleWork(fiber, expirationTime);
  },
  ...
}
```

注释中讲到 scheduleWork 是异步渲染的核心，正是它里面调用了 reqeustWork 函数。

```
function requestWork(root: FiberRoot, expirationTime: ExpirationTime) {
  //  根节点添加到调度任务中
  addRootToSchedule(root, expirationTime);
  if (isRendering) {
    return;
  }
  //  isBatchingUpdates默认为flase，但是react事件触发后会对它重新赋值为true
  if (isBatchingUpdates) {
  //  isUnbatchingUpdates默认也为false
    if (isUnbatchingUpdates) {
      nextFlushedRoot = root;
      nextFlushedExpirationTime = Sync;
      performWorkOnRoot(root, Sync, false);
    }
    return;
  }
  if (expirationTime === Sync) {
  //  若是isBatchingUpdates为false，则对setState进行diff渲染更新
    performSyncWork();
  } else {
    scheduleCallbackWithExpirationTime(root, expirationTime);
  }
}
```

可以看到在这个函数中有 isRendering（当 React 的组件正在渲染但还没有渲染完成的时候，isRendering 是为 true；在合成事件中为 false）和 isBatchingUpdates（默认为 false）两个变量，而这两个变量在下文分析中起到非常重要的作用。

°

2.1 交互事件里面的 setState

举个栗子：

```
this.state = {
  name:'rosie',
  age:'21',
};
handleClick(){
  this.setState({
    age: '18'
  })
  console.log(this.state.age) // 输出21
}
```

可以看到在 react 交互事件里 age 并没有同步更新。

先贴张小小的流程图：

![](https://mmbiz.qpic.cn/mmbiz_png/QgsoTuzQP2yCVaOjT3bMt4gWQxj53oIhL21yAVSHW4s29vpNtMRsN0OM1x4D6p5uNs4knpEJLtSmHgyPDMwHHg/640?wx_fmt=png)

react 有一套自己的事件合成机制，在合成事件调用时会用到 interactiveUpdates 函数。

```
function interactiveUpdates<A, B, R>(fn: (A, B) => R, a: A, b: B): R {
  if (isBatchingInteractiveUpdates) {
    return fn(a, b);
  }
  ...
  const previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates;
   //  将previousIsBatchingUpdates赋值为false
  const previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingInteractiveUpdates = true;
  isBatchingUpdates = true;
  //  关键代码块
  try {
    return fn(a, b);
  } finally {
    isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates;
    //  isBatchingUpdates变为false
    isBatchingUpdates = previousIsBatchingUpdates;
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork();
    }
  }
}
```

可以看到这个函数中执行了 `isBatchingUpdates=true`，在执行 try 代码块中的 fn 函数（指的是从 dispatchEvent 到 requestWork 整个调用栈）时，在 reqeustWork 方法中 isBatchingUpdates 被修改成了 true，而 isUnbatchingUpdates 默认为 false，所以在这里直接被 return 了。这就表示 requestWork 中 performSyncWork 函数没有被执行到，当然其他更新函数像 performWorkOnRoot 也没有被执行，因此还没被更新。但是在开始的 enqueueSetState 函数通过 `enqueueUpdate(fiber,update)`语句已经把该次更新存入到了队列当中。

```
if (isBatchingUpdates) {
  //  isUnbatchingUpdates也为false
  if (isUnbatchingUpdates) {
    nextFlushedRoot = root;
    nextFlushedExpirationTime = Sync;
    performWorkOnRoot(root, Sync, false);
  }
  return;
}
```

那么在 reqeustWork 中被 return 了，会 return 到哪里呢？从流程图看到很显然是回到了 interactiveUpdates 这个方法中。因此执行 setState 后直接 console.log 是属于 try 代码块中的执行，由于合成事件 try 代码块中执行完 state 后并没有更新（因为没有执行到 performSyncWork），因此输出还是之前的值，造成了所谓的 “异步”。

等到合成事件执行完后，就进入到了 finally，此时 isBatchingUpdates 变为 false，isRendering 也为 false，二者取反为 true 则进入到了 performSyncWork 函数，这个函数会去更新 state 并且渲染对应的 UI。

°

2.2 生命周期里的 setState

```
this.state = {
  name:'rosie',
  age:'21',
};
componentDidMount() {
  this.setState({
    age: '18' 
  })
  console.log(this.state.age) // 21
}
shouldComponentUpdate(){
  console.log("shouldComponentUpdate",this.state.age); // 21
  return true;
}
render(){
  console.log("render",this.state.age); // 18
  return{
    <div></div>
  }
}
getSnapshotBeforeUpdate(){
  console.log("getSnapshotBeforeUpdate",this.state.age); // 18
  return true;
}
componentDidUpdate(){
  console.log("componentDidUpdate",this.state.age);// 18
}
```

可以看到在 componentDidMount 输出结果仍然是以前的值。再贴个大大的流程图：

![](https://mmbiz.qpic.cn/mmbiz_png/QgsoTuzQP2yCVaOjT3bMt4gWQxj53oIhOXrsXiaa2hVVicxqsEiajic5yvcQeYTK7LQFTpWCUk7CRL3icE5BZakq3PQ/640?wx_fmt=png)

我们一般在 componentDidMount 中调用 setState，当 componentDidMount 执行的时候，此时组件还没进入更新渲染阶段，isRendering 为 true，在 reqeustWork 函数中直接被 return 掉（输出旧值最重要原因），没有执行到下面的更新函数。等执行完 componentDidMount 后才去 commitUpdateQueue 更新，导致在 componentDidMount 输出 this.state 的值还是旧值。  

采用程墨大大的图，React V16.3 后的生命周期如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/QgsoTuzQP2yCVaOjT3bMt4gWQxj53oIh7jQj5zdutiaIJb9icZEvibWAZ0MktOJ9cDoMH133wouUA77KEcaI7XGDw/640?wx_fmt=jpeg)

那么它会经过组件更新的生命周期，会触发 Component 的以下 4 个生命周期方法，并依次执行：

```
shouldComponentUpdate // 旧值
render // 更新后的值
getSnapshotBeforeUpdate // 更新后的值
componentDidUpdate // 更新后的值
```

componentDidMount 生命周期函数是在组件一挂载完之后就会执行，由新的生命周期图可以看到，当 shouldComponentUpdate 返回 true 时才会继续走下面的生命周期；如果返回了 false，生命周期被中断，虽然不调用之后的函数了，但是 state 仍然会被更新。

正是在 componentDidMount 时直接 return 掉，经过了多个生命周期 this.state 才得到更新，也就造成了所谓的 “异步”。

当然我们也不建议在 componentDidMount 中直接 setState，在 componentDidMount 中执行 setState 会导致组件在初始化的时候就触发了更新，渲染了两遍，可以尽量避免。同时也禁止在 shouldComponentUpdate 中调用 setState，因为调用 setState 会再次触发这个函数，然后这个函数又触发了 setState，然后再次触发这两个函数…… 这样会进入死循环，导致浏览器内存耗光然后崩溃。

°

2.3 setTimeOut 中的 setState

```
this.state = {
  name:'rosie',
  age:'21',
};
componentDidMount() {
  setTimeout(e => {
    this.setState({
      age: '18' 
    })
    console.log(this.state.age) // 18
  }, 0)
 }
```

我们都知道 JS 有 event loop 事件循环机制。当 script 代码被执行时，遇到操作、函数调用就会压入栈。主线程若遇到 ajax、setTimeOut 异步操作时，会交给浏览器的 webAPI 去执行，然后继续执行栈中代码直到为空。浏览器 webAPI 会在某个时间内比如 1s 后，将完成的任务返回，并排到队列中去，当栈中为空时，会去执行队列中的任务。

```
function requestWork(root: FiberRoot, expirationTime: ExpirationTime) {
  ...
  if (isBatchingUpdates) {
  ...
    return;
  }
  if (expirationTime === Sync) {
    performSyncWork();
  } else {
    scheduleCallbackWithExpirationTime(root, expirationTime);
  }
}
```

当你 try 代码块执行到 setTimeout 的时候，此时是把该异步操作丢到队列里，并没有立刻去执行，而是执行 interactiveUpdates 函数里的 finally 代码块，而 previousIsBatchingUpdates 在之前被赋值为 false，之后又赋给了 isBatchingUpdates，导致 isBatchingUpdates 变成 false。导致最后在栈中执行 setState 时，也就是执行 try 代码块中的 fn（a,b）时，进入 reqeustWork 函数中执行了 performSyncWork，也就是可以同步更新 state。

°

2.4 原生事件中的 setState

原生事件指的是非 react 合成事件，像 `addEventListener（）`或者 `document.querySelector().onclick（）`等这种绑定事件的形式。

```
this.state = {
  name:'rosie',
  age:'21',
};
handleClick = () => {
  this.setState({
    age: '18'
  })
  console.log(this.state.age) // 18
}
componentDidMount() {
  document.body.addEventListener('click', this.handleClick)
}
```

因为原生事件没有走合成过程，因此在 reqeustWork 中 isRendering 为 false，isBatchingUpdates 为 false，直接调用了 performSyncWork 去更新，所以能同步拿到更新后的 state 值。

  

  

  

  

3. setState 中的批量更新

如果每次更新 state 都走一次四个生命周期函数，并且进行 render，而 render 返回的结果会拿去做虚拟 DOM 的比较和更新，那性能可能会耗费比较大。像以下这种:

```
this.state = {
  count:0,
};
add = () => {
  for ( let i = 0; i < 10000; i++ ) {
    this.setState( { count: this.state.count + 1 } );
  }
}
```

如果每次都立马执行的，在短短的时间里，会有 10000 次的渲染，这显然对于 React 来说是较大的一个渲染性能问题。那如果我不是 10000 次，只有两次呢？

```
add = ()=>{
  this.setState({
    count: this.state.count + 1 
  });
  this.setState({
    count: this.state.count + 1 
  });
}
```

没有意外，以上代码还是只执行了一个 render，就算不是 10000 次计算，是 2 次计算，react 为了提升性能只会对最后一次的 `setState` 进行更新。

React 针对 setState 做了一些特别的优化：React 会将多个 setState 的调用合并成一个来执行，将其更新任务放到一个任务队列中去，当同步任务栈中的所有函数都被执行完毕之后，就对 state 进行批量更新。

当然你也可以用回调函数拿到每次执行后的值，此时更新不是批量的：

```
add = () => {
  this.setState((preCount)=>({
    count: preCount.count + 1 
  }));
  this.setState((preCount)=>({
    count: preCount.count + 1 
  }));
}// 输出2
```

你也可以使用 setTimeout 更新多次：

```
add = () => {
  setTimeout( _=>{
    this.setState({
      count: this.state.count + 1 
    });
  },0)
  setTimeout( _=>{
    this.setState({
      count: this.state.count + 1 
    });
  },0)
}// 输出2
```

你上面说了 setState 会进行批量更新，那为啥使用回调函数或者 setTimeout 等异步操作能拿到 2，也就是 render 了两次呢？？

首先只 render 一次即批量更新的情况，由合成事件触发时，在 reqeustWork 函数中 isBatchingUpdates 将会变成 true，isUnbatchingUpdates 为 false 则直接被 return 掉了。但是之前提到它会在开始的 enqueueSetState 函数通过 enqueueUpdate(fiber, update) 已经把该次更新存入到了队列当中，在 enqueueUpdate 函数中传入了 fiber 跟 update 两个参数。

```
 enqueueSetState(inst, payload, callback) {
    //    获取当前实例上的fiber
    const fiber = getInstance(inst);
    //    计算当前时间
    const currentTime = requestCurrentTime();
    //    计算当前fiber的到期时间，为计算优先级作准备
    const expirationTime = computeExpirationForFiber(currentTime, fiber);
    //    创建更新一个update
    const update = createUpdate(expirationTime);
    //    payload是要更新的对象
    update.payload = payload;
    //    callback回调函数
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }
    flushPassiveEffects();
    //    重点：把更新放到队列中去
    enqueueUpdate(fiber, update);
    //     进入异步渲染的核心：React Scheduler
    scheduleWork(fiber, expirationTime);
  },
```

简单提一下，为了避免更新的过程中长时间阻塞主线程，在 React 16 之后加入了 Fiber 架构，它能将整个更新任务拆分为一个个小的任务，并且能控制这些任务的执行。而 fiber 是一个工作单元，是把控这个拆分的颗粒度的数据结构。

加入 Fiber 架构后，react 在任务调度之前通过 enqueueUpdate 函数调度，里面修改了 Fiber 的 updateQueue 对象的任务，即维护了 fiber.updateQueue，最后调度会调用一个 getStateFromUpdate 方法来获取最终的 state 状态，而这个方法里面的这段代码显得尤为关键：

```
function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
  nextProps: any,
  instance: any,
): any {
  switch (update.tag) {
    ...
    case UpdateState: {
      const payload = update.payload;
      let partialState;
      //  当payload为函数类型时
      if (typeof payload === 'function') {
          ...
           partialState = payload.call(instance, prevState, nextProps);
           ...
      }
      ...
      // 重点：通过Object.assign生成一个全新的state，和未更新的部分state进行合并
      return Object.assign({}, prevState, partialState);
    }
   ...
  }
  return prevState;
}
```

看到 Object.assign 是不是很熟悉？preState 是原先的状态，partialState 是将要更新后的状态，Object.assign 就是对象合并。那么 `Object.assign({},{count:0},{count:1})`最后返回的是 {count:1} 达到了 state 的更新。

我们刚才花了一大篇幅来证明在 react 合成事件和生命周期下 state 的更新是异步的，主要体现在 interactiveUpdates 函数的 try finally 模块，在 try 模块执行时不会立刻更新，因此导致三次 setState 的 prevState 值都是 0，两次 setState 的 partialState 都是 1。执行两次 `Object.assign({},{count:0},{count:1})`最后结果不还是返回 1 吗？

因此也可以得出 state 的批量更新是建立在异步之上的，那 setTimeout 同步更新 state 就导致 state 没有批量更新，最后返回 2。

那 callBack 回调函数咋就能也返回 2 呢？我们知道 payload 的类型是 function 时，通过 `partialState=payload.call(instance,prevState,nextProps)`语句的执行，能获取执行回调函数后得到的 state，将其赋值给每次 partialState。每次回调函数都能拿到更新后的 state 值，那就是每次 partialState 都进行了更新。在进行 Object.assign 对象合并时，两次 prevState 的值都是 0，而 partialState 第一次为 1，第二次为 2，像如下这样：

```
Object.assign({}, {count:0}, {count:1});
Object.assign({}, {count:0}, {count:2});
```

也就最后返回了 2。所以如果你不想拿到 setState 批量更新后的值，直接用回调函数就好啦。

  

  

  

  

4. 直接修改 this.state 无效

```
this.state.comment = 'Hello world';
```

直接以赋值形式修改 state，不会触发组件的 render。

通过上面的分析，可以得出 setState 本质是通过一个更新队列机制实现更新的，如果不通过 setState 而直接修改 this.state，那么这个 state 不会放入状态更新队列中，也就不会 render，因此修改 state 的值必须通过 setState 来进行。

```
this.setState({
  comment: 'Hello world'
})
```

  

  

  

  

5. 小 Tips && 小总结

更新对象：

```
this.setState(preState=> ({
  obj: Object.assign({}, preState.obj, {name: 'Tom'})
}))
this.setState(preState=> ({
  obj: {...preState.obj,name:'Tom'}
}))
```

更新数组：

```
this.setState((perState)=>{
  return {arr:perState.arr.concat(1)}
})
this.setState((perState)=>{
  return {arr:[...perState.arr,1]}
})
this.setState((perState)=>{
  return {arr:perState.arr.slice(1,4)}
})
```

注意，不要使用 push、pop、shift、unshift、splice 等方法修改数组类型的状态，因为这些方法都是在原数组的基础上修改的，返回值不是新的数组，而是返回长度或者修改的数组部分等。而 concat、slice、filter 会生成一个新的数组。

> 总结：通过探讨 React state 的更新机制，更加理解了 React 深层更新的运作流程。感觉 React 还是非常的博大精深，希望以后继续探讨下去哈哈哈，欢迎大家批评指正！