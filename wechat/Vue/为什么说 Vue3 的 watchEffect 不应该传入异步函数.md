> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gqRrCQ19rhE6Vd_3BelzJA)

> 作者：水煮鱼写前端
> 
> 链接：https://juejin.cn/post/7333144462225752098

出现问题的 demo
----------

最近看了一个视频，讲了一个在 watchEffect 中使用 async 函数出现的问题 www.douyin.com/video/73275…[1] 它的业务场景是调接口获取的视频地址并播放，同时可以手动修改播放速度倍率，这其实很简单，视频里的代码我敲了一下，确实有问题，当你点击修改倍率的时候，视频播放速度并没有变化，相当于 rate 的没有被追踪到！

借着这个问题，我们来一起看看`watchEffect`的源码，来找到问题之所在。

阅读 vue3 源码
----------

### watchEffect

全局搜索一下，可以定位到，watchEffect 函数位于`packages/runtime-core/src/apiWatch.ts`这个文件里，它的代码也很简单。

```
typescript复制代码// Simple effect.export function watchEffect(  effect: WatchEffect,  options?: WatchOptionsBase): WatchStopHandle {  return doWatch(effect, null, options)  // 如果是watch  // return doWatch(source as any, cb, options)}
```

可以看出来与`watch`相比，也只是第二个参数的不同，因此可以说`doWatch`是这个整个 watch 的核心代码。

### doWatch

```
// 支持监听reactive，数组，函数（仅watchEffect）function doWatch(  source: WatchSource | WatchSource[] | WatchEffect | object,   cb: WatchCallback | null, //watch时的callback，watchEffect时为null  {    immediate,    deep,    flush,    once,    onTrack,    onTrigger,  }: WatchOptions = EMPTY_OBJ, // watch的第三个参数): WatchStopHandle {   // !cb时是watchEffect，反之是watch，后面会多次判断  // 当watch 且带有once参数，即监听一次后马上停止监听  if (cb && once) {    const _cb = cb    cb = (...args) => {      _cb(...args)      unwatch()    }  }  // deep参数将在后续支持传入数字，盲猜是监听到对象第几层  if (__DEV__ && deep !== void 0 && typeof deep === 'number') {    warn(      `watch() "deep" option with number value will be used as watch depth in future versions. ` +        `Please use a boolean instead to avoid potential breakage.`,    )  }    // 如果是watchEffect，不支持一些参数  if (__DEV__ && !cb) {    if (immediate !== undefined) {      warn(        `watch() "immediate" option is only respected when using the ` +          `watch(source, callback, options?) signature.`,      )    }    if (deep !== undefined) {      warn(        `watch() "deep" option is only respected when using the ` +          `watch(source, callback, options?) signature.`,      )    }    if (once !== undefined) {      warn(        `watch() "once" option is only respected when using the ` +          `watch(source, callback, options?) signature.`,      )    }  }    // 这个函数用于提示监听到对象不正确  const warnInvalidSource = (s: unknown) => {    warn(      `Invalid watch source: `,      s,      `A watch source can only be a getter/effect function, a ref, ` +        `a reactive object, or an array of these types.`,    )  }  // 当前组件对象，可能为null  const instance = currentInstance  // 递归获取reactive对象的keyName，用以实现深度监听  const reactiveGetter = (source: object) =>    deep === true      ? source // traverse will happen in wrapped getter below      : // for deep: false, only traverse root-level properties        traverse(source, deep === false ? 1 : undefined)  let getter: () => any // 获取监听源的函数  let forceTrigger = false // 是否强制执行一次getter  let isMultiSource = false // 是否是复合监听源  if (isRef(source)) { // 如果监听的是ref，watch(ref,cb)    getter = () => source.value    forceTrigger = isShallow(source)   } else if (isReactive(source)) { // 如果监听的是reactive，watch(reactive,cb)    getter = () => reactiveGetter(source) //递归获取监听的属性    forceTrigger = true   } else if (isArray(source)) { // 如果监听的是数组，watch([a,b],cb)    isMultiSource = true // 复合监听源     // 判断里面有没有reactive     forceTrigger = source.some(s => isReactive(s) || isShallow(s))    getter = () => //把数据源转化为数据值的getter      source.map(s => {        if (isRef(s)) {          return s.value        } else if (isReactive(s)) {          return reactiveGetter(s)        } else if (isFunction(s)) { //如果是函数就应该报错，函数不能也不需要被监听          return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER)        } else {          __DEV__ && warnInvalidSource(s) //如果这些都不是，那就直接报错        }      })  } else if (isFunction(source)) { //如果数据源是单一的function    if (cb) { // 如果是watch(fun,cn),报错      // getter with cb      getter = () =>        callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER)    } else {          // watchEffect时      getter = () => {        if (cleanup) { //如果有副作用函数，先清理副作用          cleanup()        }        //执行effect，这里封装了执行和拦截报错        return callWithAsyncErrorHandling(          source,          instance,          ErrorCodes.WATCH_CALLBACK,          [onCleanup],        )      }    }  } else {      // 错误情况    getter = NOOP    __DEV__ && warnInvalidSource(source)  }  // 2.x array mutation watch compat  // TODO:还没搞懂__COMPAT__是什么，有没有懂的给我留个言  if (__COMPAT__ && cb && !deep) {    const baseGetter = getter    getter = () => {      const val = baseGetter() //拷贝了一个监听源      if ( // 如果是数组就深度遍历        isArray(val) &&        checkCompatEnabled(DeprecationTypes.WATCH_ARRAY, instance)      ) {        traverse(val)      }      return val    }  }    // 如果是watch，拷贝一遍监听源，并遍历key  if (cb && deep) {    const baseGetter = getter    getter = () => traverse(baseGetter())  }    let cleanup: (() => void) | undefined  let onCleanup: OnCleanup = (fn: () => void) => {    cleanup = effect.onStop = () => {      callWithErrorHandling(fn, instance, ErrorCodes.WATCH_CLEANUP)      cleanup = effect.onStop = undefined    }  }  // in SSR there is no need to setup an actual effect, and it should be noop  // 在ssr，我们不能在setup里立即执行监听回调，因为有可能还在node环境里  // unless it's eager or sync flush 除非是立即执行的回调  let ssrCleanup: (() => void)[] | undefined  if (__SSR__ && isInSSRComponentSetup) {    // we will also not call the invalidate callback (+ runner is not set up)    onCleanup = NOOP    if (!cb) {      getter()    } else if (immediate) {      callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [        getter(),        isMultiSource ? [] : undefined,        onCleanup,      ])    }    if (flush === 'sync') {    // ssr时清理监听      const ctx = useSSRContext()!      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = [])    } else {      return NOOP    }  }  //设置监听的初始值，如果是复合的，那就是[{}],反之就是{}  let oldValue: any = isMultiSource    ? new Array((source as []).length).fill(INITIAL_WATCHER_VALUE)    : INITIAL_WATCHER_VALUE  // 所谓job就是一次监听执行    const job: SchedulerJob = () => {    if (!effect.active || !effect.dirty) {      return    }        if (cb) {      // 普通watch      const newValue = effect.run() //其实从这里都能看到effect总是一个同步方法      if (        deep ||        forceTrigger ||        (isMultiSource          ? (newValue as any[]).some((v, i) => hasChanged(v, oldValue[i]))          : hasChanged(newValue, oldValue)) ||        (__COMPAT__ &&          isArray(newValue) &&          isCompatEnabled(DeprecationTypes.WATCH_ARRAY, instance))      ) {        // 每次执行都先清理之前的副作用，这里表示值已经发生了改变        if (cleanup) {          cleanup()        }        // 执行一次回调        callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [          newValue,          // pass undefined as the old value when it's changed for the first time          oldValue === INITIAL_WATCHER_VALUE            ? undefined            : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE              ? []              : oldValue,          onCleanup,        ])        oldValue = newValue      }    } else {      // 这里是watchEffect      effect.run()    }  }  // important: mark the job as a watcher callback so that scheduler knows  // it is allowed to self-trigger (#1727)  job.allowRecurse = !!cb  let scheduler: EffectScheduler  if (flush === 'sync') {    scheduler = job as any // the scheduler function gets called directly  } else if (flush === 'post') {    // post指mounted之后，所以需要延迟一下执行    scheduler = () => queuePostRenderEffect(job, instance && instance.suspense)  } else {    // default: 'pre'    job.pre = true    if (instance) job.id = instance.uid    scheduler = () => queueJob(job) //二分查找去重，然后插入一个 内部维护的队列  }  // 这里正是watch核心代码，也是本文的主要内容  const effect = new ReactiveEffect(getter, NOOP, scheduler)  const scope = getCurrentScope()  // 取消监听的方法  const unwatch = () => {    effect.stop()    if (scope) {      remove(scope.effects, effect)    }  }  //dev环境下暴露两个勾子，方便调试  if (__DEV__) {    effect.onTrack = onTrack    effect.onTrigger = onTrigger  }  // initial run  // 监听的过程  if (cb) {  //如果是watch    if (immediate) {      job()    } else {      oldValue = effect.run()    }  } else if (flush === 'post') {    queuePostRenderEffect(      effect.run.bind(effect),      instance && instance.suspense,    )  } else {  //如果是watchEffect    effect.run()  }  if (__SSR__ && ssrCleanup) ssrCleanup.push(unwatch)  return unwatch}
```

### ReactiveEffect

从上面的代码，我们可以很明显的看出，`watchEffect`的关键就是`ReactiveEffect`这个类

```
// 注意这个变量export let activeEffect: ReactiveEffect | undefinedexport class ReactiveEffect<T = any> {  active = true  deps: Dep[] = [] // 依赖的  /**   * Can be attached after creation   * @internal   */  computed?: ComputedRefImpl<T>  /**   * @internal   */  allowRecurse?: boolean // 是否允许自己触发自己  // 新暴露的几个勾子，主要是在debugger时候用  onStop?: () => void  // dev only  onTrack?: (event: DebuggerEvent) => void  // dev only  onTrigger?: (event: DebuggerEvent) => void  /**   * @internal   */  _dirtyLevel = DirtyLevels.Dirty  /**   * @internal   */  _trackId = 0  /**   * @internal   */  _runnings = 0  /**   * @internal   */  _shouldSchedule = false  /**   * @internal   */  _depsLength = 0  constructor(    public fn: () => T,    public trigger: () => void,    public scheduler?: EffectScheduler,    scope?: EffectScope,  ) {    // 收集当前这个函数至当前scope依赖    recordEffectScope(this, scope)  }  // 这个dirty其实是vue内部的函数，盲猜是更新时根据这个等级去合并更新  public get dirty() {    if (this._dirtyLevel === DirtyLevels.MaybeDirty) {      pauseTracking()      for (let i = 0; i < this._depsLength; i++) {        const dep = this.deps[i]        if (dep.computed) {          triggerComputed(dep.computed)          if (this._dirtyLevel >= DirtyLevels.Dirty) {            break          }        }      }      if (this._dirtyLevel < DirtyLevels.Dirty) {        this._dirtyLevel = DirtyLevels.NotDirty      }      resetTracking()    }    return this._dirtyLevel >= DirtyLevels.Dirty  }  public set dirty(v) {    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NotDirty  }  // 主要函数，即执行这个依赖的effect函数  run() {    this._dirtyLevel = DirtyLevels.NotDirty    // 如果当前函数不执行，则先执行，这里是节流    if (!this.active) {      return this.fn()    }    // 储存旧的函数    let lastShouldTrack = shouldTrack    // 这里非常重要，把上一次执行的函数保存，然后会修改activeEffect = this    let lastEffect = activeEffect     try {      shouldTrack = true      activeEffect = this      //执行次数+1      this._runnings++      // 清理之前的副作用      preCleanupEffect(this)      return this.fn()    } finally {    //如果报错了      postCleanupEffect(this)      this._runnings--      activeEffect = lastEffect      shouldTrack = lastShouldTrack    }  }  stop() {    // 停止监听，这很好理解    if (this.active) {      preCleanupEffect(this)      postCleanupEffect(this)      this.onStop?.()      this.active = false    }  }}
```

#### activeEffect

从上面的代码阅读结束之后，我认为问题就是出现在`activeEffect`这个变量，当我们使用 async/await 时，其实 js 会把这个函数放到微任务队列里，如果此时有其他的同步 effect，可能就会覆盖你的 async/await。

因为`activeEffect`其实是个内部模块导出的全局变量，它可能会被其他的函数修改，也可能会被其他的`ReactiveEffect`所修改，这是无法追踪的，因此我们应当避免在`watchEffect`为什么不应该传入异步函数。

结语
--

### 解决方案 1

在没研究源码之前，我会尽量不使用 watchEffect 来避免这个 bug。大部分时间，url 其实只需要获取一次的

### 解决方案 2: 改为 watch

其实归根结底，这个问题就是你的依赖跟丢了，本来应该数据变化就执行函数，但是数据与执行函数的对应关系丢了。这时候我们就想到了，watch，watch 其实是一种强绑定的依赖的，是你手动维护的依赖关系，无论有没有 async/await，它都不会丢失。

参考资料

[1]

https://www.douyin.com/video/7327589377025084712: https://link.juejin.cn?target=https%3A%2F%2Fwww.douyin.com%2Fvideo%2F7327589377025084712

### 最后

  

  

如果你觉得这篇内容对你挺有启发，我想邀请你帮我个小忙：  

1.  点个「**喜欢**」或「**在看**」，让更多的人也能看到这篇内容
    
2.  我组建了个氛围非常好的前端群，里面有很多前端小伙伴，欢迎加我微信「**sherlocked_93**」拉你加群，一起交流和学习
    
3.  关注公众号「**前端下午茶**」，持续为你推送精选好文，也可以加我为好友，随时聊骚。
    

![](https://mmbiz.qpic.cn/mmbiz_png/XP4dRIhZqqX9lfzPJgCDkCDPbpxuEjSajtTicNb1Zd6PsTLu9EOplqyafiaibib0VX8oTyDzBMlxnJJ2BZ9AVic1tIA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZUCR5WEela9H9fDfYic8BAp8ib4cmuicFgACoRwORYGwkBtgUVaILLOjXtlGBnicuM5246MgketktMCg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

点个喜欢支持我吧，在看就更好了