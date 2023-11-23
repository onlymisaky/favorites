> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RNdScPu6RawLZ0J_UhbKMA)

点击上方 全栈前端精选，关注公众号  

回复【1】，加入前端群

在 React 项目中，因为事件处理程序总是需要写 `try/catch`，不胜其烦。

虽然可以丢给`window.onerror`或者 `window.addEventListener("error")`去处理，但是对**错误细节的捕获**以及**错误的补偿**是极其不友好的。

于是基于 ES 标准的装饰器，出了一个事件处理程序的捕获方案，详情参见前篇 React，优雅的捕获异常 。

评论区有掘友吐槽，都啥年代，还写`Class`？, `Hooks` 666 啊。

掘友说的对，我要跟上时代的步伐, 要支持`Hooks`, `getter`等等。

补充一下
----

**最初仅仅是为了捕获和处理事件程序的异常，实际上是可以用于任何 Class 的方法上的**。

问题回顾
----

React，优雅的捕获异常 **方案存在的问题:**

1.  抽象不够  
    获取选项, 错误处理函数完全可以分离，变成通用方法。
    
2.  同步方法经过转换后会变为异步方法。  
    所以理论上，要区分同步和异步方案。
    
3.  错误处理函数再异常怎么办
    
4.  功能局限
    

我们来一一解决。

一览风姿
----

我们捕获的范围：

1.  Class 的静态同步方法
    
2.  Class 的静态异步方法
    
3.  Class 的同步方法
    
4.  Class 的异步方法
    
5.  Class 的同步属性赋值方法
    
6.  Class 的异步属性赋值方法
    
7.  Class 的 getter 方法
    
8.  Hooks 方法
    

getter 这里是不是很类似 `vue`的 计算值，所以以后别说我大 React 没有计算属性，哈哈。

来来来，一览其风采：

先看看 Class 组件的

```
interface State {    price: number;    count: number;}export default class ClassT extends BaseComponent<{}, State> {    constructor(props) {        super(props);        this.state = {            price: 100,            count: 1        }        this.onIncrease = this.onIncrease.bind(this);        this.onDecrease = this.onDecrease.bind(this);    }    componentDidMount() {        ClassT.printSomething();        ClassT.asyncPrintSomething();        this.doSomethings();        this.asyncDoSomethings();    }    @catchMethod({ message: "printSomething error", toast: true })    static printSomething() {        throw new CatchError("printSomething error: 主动抛出");        console.log("printSomething:", Date.now());    }    @catchMethod({ message: "asyncPrintSomething error", toast: true })    static async asyncPrintSomething() {        const { run } = delay(1000);        await run();        throw new CatchError("asyncPrintSomething error: 主动抛出");        console.log("asyncPrintSomething:", Date.now());    }    @catchGetter({ message: "计算价格失败", toast: true })    get totalPrice() {        const { price, count } = this.state;        // throw new Error("A");        return price * count;    }    @catchMethod("增加数量失败")    async onIncrease() {        const { run } = delay(1000);        await run();        this.setState({            count: this.state.count + 1        })    }    @catchMethod("减少数量失败")    onDecrease() {        this.setState({            count: this.state.count - 1        })    }    @catchInitializer({ message: "catchInitializer error", toast: true })    doSomethings = () => {        console.log("do some things");        throw new CatchError("catchInitializer error: 主动抛出");    }    @catchInitializer({ message: "catchInitializer async error", toast: true })    asyncDoSomethings = async () => {        const { run } = delay(1000);        await run();        throw new CatchError("catchInitializer async error: 主动抛出");    }    render() {        const { onIncrease, onDecrease } = this;        const totalPrice = this.totalPrice;        return <div style={{            padding: "150px",            lineHeight: "30px",            fontSize: "20px"        }}>            <div>价格：{this.state.price}</div>            <div>数量：1</div>            <div>                <button onClick={onIncrease}>增加数量</button>                <button onClick={onDecrease}>减少数量</button>            </div>            <div>{totalPrice}</div>        </div>    }}复制代码
```

再看看函数式组件，就是大家关注的 Hooks, 包装出`useCatch`，底层是基于 useMemo

```
const HooksTestView: React.FC<Props> = function (props) {    const [count, setCount] = useState(0);        const doSomething  = useCatch(async function(){        console.log("doSomething: begin");        throw new CatchError("doSomething error")        console.log("doSomething: end");    }, [], {        toast: true    })    const onClick = useCatch(async (ev) => {        console.log(ev.target);        setCount(count + 1);        doSomething();        const d = delay(3000, () => {            setCount(count => count + 1);            console.log()        });        console.log("delay begin:", Date.now())        await d.run();        console.log("delay end:", Date.now())        console.log("TestView", this);        (d as any).xxx.xxx.x.x.x.x.x.x.x.x.x.x.x        // throw new CatchError("自定义的异常，你知道不")    },        [count],        {            message: "I am so sorry",            toast: true        });    return <div>        <div><button onClick={onClick}>点我</button></div>        <div>{count}</div>    </div>}export default React.memo(HooksTestView);复制代码
```

我们一览风采之后，先看看我们做了哪些优化，为什么要说优化呢。因为优化之前的代码之后，代码的可读性，复用性，可扩展性大幅增强。

优化
--

### 封装 getOptions 方法

```
// options类型白名单const W_TYPES = ["string", "object"];export function getOptions(options: string | CatchOptions) {    const type = typeof options;    let opt: CatchOptions;        if (options == null || !W_TYPES.includes(type)) { // null 或者 不是字符串或者对象        opt = DEFAULT_ERRPR_CATCH_OPTIONS;    } else if (typeof options === "string") {  // 字符串        opt = {            ...DEFAULT_ERRPR_CATCH_OPTIONS,            message: options || DEFAULT_ERRPR_CATCH_OPTIONS.message,        }    } else { // 有效的对象        opt = { ...DEFAULT_ERRPR_CATCH_OPTIONS, ...options }    }    return opt;}复制代码
```

### 定义默认处理函数

```
/** *  * @param err 默认的错误处理函数 * @param options  */function defaultErrorHanlder(err: any, options: CatchOptions) {    const message = err.message || options.message;    console.error("defaultErrorHanlder:", message, err);}复制代码
```

### 区分同步方法和异步方法

```
export function observerHandler(fn: AnyFunction, context: any, callback: ErrorHandler) {    return async function (...args: any[]) {        try {            const r = await fn.call(context || this, ...args);            return r;        } catch (err) {            callback(err);        }    };}export function observerSyncHandler(fn: AnyFunction, context: any, callback: ErrorHandler) {    return function (...args: any[]) {        try {            const r = fn.call(context || this, ...args);            return r;        } catch (err) {            callback(err);        }    };}复制代码
```

### 具备多级选项定义能力

```
export default function createErrorCatch(handler: ErrorHandlerWithOptions, baseOptions: CatchOptions = DEFAULT_ERRPR_CATCH_OPTIONS) {    return {        catchMethod(options: CatchOptions | string = DEFAULT_ERRPR_CATCH_OPTIONS) {            return catchMethod({ ...baseOptions, ...getOptions(options) }, handler)        }       }}复制代码
```

### 自定义错误处理函数

```
export function commonErrorHandler(error: any, options: CatchOptions) {        try{        let message: string;        if (error.__type__ == "__CATCH_ERROR__") {            error = error as CatchError;            const mOpt = { ...options, ...(error.options || {}) };            message = error.message || mOpt.message ;            if (mOpt.log) {                console.error("asyncMethodCatch:", message , error);            }            if (mOpt.report) {                // TODO::            }            if (mOpt.toast) {                Toast.error(message);            }        } else {            message = options.message ||  error.message;            console.error("asyncMethodCatch:", message, error);            if (options.toast) {                Toast.error(message);            }        }    }catch(err){        console.error("commonErrorHandler error:", err);    }}const errorCatchInstance = createErrorCatch(commonErrorHandler);export const catchMethod = errorCatchInstance.catchMethod; 复制代码
```

增强
--

### 支持 getter

先看一下`catchGetter`的使用

```
class Test {    constructor(props) {        super(props);        this.state = {            price: 100,            count: 1        }        this.onClick = this.onClick.bind(this);    }    @catchGetter({ message: "计算价格失败", toast: true })    get totalPrice() {        const { price, count } = this.state;        throw new Error("A");        return price * count;    }          render() {           const totalPrice = this.totalPrice;        return <div>            <div>价格：{this.state.price}</div>            <div>数量：1</div>            <div>{totalPrice}</div>        </div>    }    }复制代码
```

实现

```
/** * class {  get method(){} } * @param options  * @param hanlder  * @returns  */export function catchGetter(options: string | CatchOptions = DEFAULT_ERRPR_CATCH_OPTIONS, hanlder: ErrorHandlerWithOptions = defaultErrorHanlder) {    let opt: CatchOptions = getOptions(options);    return function (_target: any, _name: string, descriptor: PropertyDescriptor) {        const { constructor } = _target;        const { get: oldFn } = descriptor;        defineProperty(descriptor, "get", {            value: function () {                // Class.prototype.key lookup                // Someone accesses the property directly on the prototype on which it is                // actually defined on, i.e. Class.prototype.hasOwnProperty(key)                if (this === _target) {                    return oldFn();                }                // Class.prototype.key lookup                // Someone accesses the property directly on a prototype but it was found                // up the chain, not defined directly on it                // i.e. Class.prototype.hasOwnProperty(key) == false && key in Class.prototype                if (                    this.constructor !== constructor &&                    getPrototypeOf(this).constructor === constructor                ) {                    return oldFn();                }                const boundFn = observerSyncHandler(oldFn, this, function (error: Error) {                    hanlder(error, opt)                });                (boundFn as any)._bound = true;                            return boundFn();            }        });        return descriptor;    }}复制代码
```

### 支持属性定义和赋值

这个需要 babel 的支持，详情可以参见 babel-plugin-proposal-class-properties

demo 可以参见 class-error-catch

```
class Test{    @catchInitializer("nono")    doSomethings = ()=> {        console.log("do some things");    }}复制代码
```

实现

```
export function catchInitializer(options: string | CatchOptions = DEFAULT_ERRPR_CATCH_OPTIONS, hanlder: ErrorHandlerWithOptions = defaultErrorHanlder){    const opt: CatchOptions = getOptions(options);     return function (_target: any, _name: string, descriptor: any) {        console.log("debug....");        const initValue = descriptor.initializer();        if (typeof initValue !== "function") {            return descriptor;        }        descriptor.initializer = function() {            initValue.bound = true;            return observerSyncHandler(initValue, this, function (error: Error) {                hanlder(error, opt)            });        };        return descriptor;    }}复制代码
```

### 支持 Hooks

使用

```
const TestView: React.FC<Props> = function (props) {    const [count, setCount] = useState(0);        const doSomething  = useCatch(async function(){        console.log("doSomething: begin");        throw new CatchError("doSomething error")        console.log("doSomething: end");    }, [], {        toast: true    })    const onClick = useCatch(async (ev) => {        console.log(ev.target);        setCount(count + 1);        doSomething();        const d = delay(3000, () => {            setCount(count => count + 1);            console.log()        });        console.log("delay begin:", Date.now())        await d.run();                console.log("delay end:", Date.now())        console.log("TestView", this)        throw new CatchError("自定义的异常，你知道不")    },        [count],        {            message: "I am so sorry",            toast: true        });    return <div>        <div><button onClick={onClick}>点我</button></div>        <div>{count}</div>    </div>}export default React.memo(TestView);复制代码
```

实现: 其基本原理就是利用 `useMemo`和之前封装的`observerHandler`, 寥寥几行代码就实现了。

```
export function useCatch<T extends (...args: any[]) => any>(callback: T, deps: DependencyList, options: CatchOptions =DEFAULT_ERRPR_CATCH_OPTIONS): T {        const opt =  useMemo( ()=> getOptions(options), [options]);        const fn = useMemo((..._args: any[]) => {        const proxy = observerHandler(callback, undefined, function (error: Error) {            commonErrorHandler(error, opt)        });        return proxy;    }, [callback, deps, opt]) as T;    return fn;}复制代码
```

这里你可能会问啥，你只是实现了方法的异常捕获啊，我的`useEffect`, `useCallbak`, `useLayout`等等，你就不管呢？

其实到这里，基本两条思路

1.  基于 useCatch 分离定义的方法
    
2.  针对每一个 Hook 再写一个`useXXX`
    

到这里，我想，已经难不倒各位了。

我这里只是提供了一种思路，一种看起来不复杂，可行的思路。

关于源码
----

因为目前代码是直接跑在我们的实际项目上的，还没时间去独立的把代码分离到一个独立的项目。想要全部源码的同学可以联系我。

之后会把全部源码，示例独立出来。

后续
--

我想肯定有人会问，你用`Object.defineProperty`，out 了，你看`vue`都用`Proxy`来实现了。

是的，Proxy 固然强大，但是要具体情况具体对待，这里我想到有两点 Proxy 还真不如 `Object.defineProperty` 和 装饰器。

1. 兼容性  
2. 灵活度

后续：

1.  支持直接捕获整个 Class
    
2.  通过实用修复相关的问题
    
3.  独立代码和示例，封装为库
    
4.  尝试使用`Proxy`实现
    

具备类似功能的库
--------

*   catch-decorator
    

仅仅捕获方法，处理比较初级

*   catch-decorator-ts
    

同上

*   catch-error-decorator
    

通过 `AsyncFunction`判断，提供失败后的默认返回值。

*   auto-inject-async-catch-loader
    

主要捕获异步方法，原理是 webpack loader, 遍历 AST. 其他 async-catch-loader,babel-plugin-promise-catcher 等原理类似。

写在最后
----

**写作不易，如果觉得还不错， 一赞一评，就是我最大的动力。**

> babel-plugin-proposal-class-properties)  
> setpublicclassfields

关于本文  

来源：云的世界
=======

https://juejin.cn/post/6976414994107727909