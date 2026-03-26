> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/HhjDQgK8FcPiy5BEfZ7lYQ)

前言
--

前端中的库很多，开发这些库的作者会尽可能的覆盖到大家在业务中千奇百怪的需求，但是总有无法预料到的，所以优秀的库就需要提供一种机制，让开发者可以干预插件中间的一些环节，从而完成自己的一些需求。

本文将从`koa`、`axios`、`vuex`和`redux`的实现来教你怎么编写属于自己的插件机制。

*   对于新手来说：  
    本文能让你搞明白神秘的插件和拦截器到底是什么东西。
    
*   对于老手来说：  
    在你写的开源框架中也加入拦截器或者插件机制，让它变得更加强大吧！
    

axios
-----

首先我们模拟一个简单的 axios，这里不涉及请求的逻辑，只是简单的返回一个 Promise，可以通过 config 中的 error 参数控制 Promise 的状态。

axios 的拦截器机制用流程图来表示其实就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyZ86Ud17ibku2TUptWl6pkQL4QDf4HLLCj8ic60FyiarZTq3kYdVCVgZwdzyzltRxAia495tv1vgNibibFQ/640?wx_fmt=png)流程图

```
const axios = config => {  if (config.error) {    return Promise.reject({      error: "error in axios"    });  } else {    return Promise.resolve({      ...config,      result: config.result    });  }};
```

如果传入的 config 中有 error 参数，就返回一个 rejected 的 promise，反之则返回 resolved 的 promise。

先简单看一下 axios 官方提供的拦截器示例：

```
axios.interceptors.request.use(  function(config) {    // 在发送请求之前做些什么    return config;  },  function(error) {    // 对请求错误做些什么    return Promise.reject(error);  });// 添加响应拦截器axios.interceptors.response.use(  function(response) {    // 对响应数据做点什么    return response;  },  function(error) {    // 对响应错误做点什么    return Promise.reject(error);  });
```

可以看出，不管是 request 还是 response 的拦截器，都会接受两个函数作为参数，一个是用来处理正常流程，一个是处理失败流程，这让人想到了什么？

没错，`promise.then`接受的同样也是这两个参数。

axios 内部正是利用了 promise 的这个机制，把 use 传入的两个函数作为一个`intercetpor`，每一个`intercetpor`都有`resolved`和`rejected`两个方法。

```
// 把axios.interceptors.response.use(func1, func2)// 在内部存储为{    resolved: func1,    rejected: func2}
```

接下来简单实现一下，这里我们简化一下，把`axios.interceptor.request.use`转为`axios.useRequestInterceptor`来简单实现：

```
// 先构造一个对象 存放拦截器axios.interceptors = {  request: [],  response: []};// 注册请求拦截器axios.useRequestInterceptor = (resolved, rejected) => {  axios.interceptors.request.push({ resolved, rejected });};// 注册响应拦截器axios.useResponseInterceptor = (resolved, rejected) => {  axios.interceptors.response.push({ resolved, rejected });};// 运行拦截器axios.run = config => {  const chain = [    {      resolved: axios,      rejected: undefined    }  ];  // 把请求拦截器往数组头部推  axios.interceptors.request.forEach(interceptor => {    chain.unshift(interceptor);  });  // 把响应拦截器往数组尾部推  axios.interceptors.response.forEach(interceptor => {    chain.push(interceptor);  });  // 把config也包装成一个promise  let promise = Promise.resolve(config);  // 暴力while循环解忧愁  // 利用promise.then的能力递归执行所有的拦截器  while (chain.length) {    const { resolved, rejected } = chain.shift();    promise = promise.then(resolved, rejected);  }  // 最后暴露给用户的就是响应拦截器处理过后的promise  return promise;};
```

从`axios.run`这个函数看运行时的机制，首先构造一个`chain`作为 promise 链，并且把正常的请求也就是我们的请求参数 axios 也构造为一个拦截器的结构，接下来

*   把 request 的 interceptor 给 unshift 到`chain`顶部
    
*   把 response 的 interceptor 给 push 到`chain`尾部
    

以这样一段调用代码为例：

```
// 请求拦截器1axios.useRequestInterceptor(resolved1, rejected1);// 请求拦截器2axios.useRequestInterceptor(resolved2, rejected2);// 响应拦截器1axios.useResponseInterceptor(resolved1, rejected1);// 响应拦截器axios.useResponseInterceptor(resolved2, rejected2);
```

这样子构造出来的 promise 链就是这样的`chain`结构：

```
[    请求拦截器2，// ↓config    请求拦截器1，// ↓config    axios请求核心方法, // ↓response    响应拦截器1, // ↓response    响应拦截器// ↓response]
```

至于为什么 requestInterceptor 的顺序是反过来的，仔细看看代码就知道 XD。

有了这个`chain`之后，只需要一句简短的代码：

```
let promise = Promise.resolve(config);while (chain.length) {  const { resolved, rejected } = chain.shift();  promise = promise.then(resolved, rejected);}return promise;
```

promise 就会把这个链从上而下的执行了。

以这样的一段测试代码为例：

```
axios.useRequestInterceptor(config => {  return {    ...config,    extraParams1: "extraParams1"  };});axios.useRequestInterceptor(config => {  return {    ...config,    extraParams2: "extraParams2"  };});axios.useResponseInterceptor(  resp => {    const {      extraParams1,      extraParams2,      result: { code, message }    } = resp;    return `${extraParams1} ${extraParams2} ${message}`;  },  error => {    console.log("error", error);  });
```

1.  成功的调用
    

在成功的调用下输出 `result1: extraParams1 extraParams2 message1`

```
(async function() {  const result = await axios.run({    message: "message1"  });  console.log("result1: ", result);})();
```

2.  失败的调用
    

```
(async function() {  const result = await axios.run({    error: true  });  console.log("result3: ", result);})();
```

在失败的调用下，则进入响应拦截器的 rejected 分支：

首先打印出拦截器定义的错误日志：  
`error { error: 'error in axios' }`

然后由于失败的拦截器

```
error => {  console.log('error', error)},
```

没有返回任何东西，打印出`result3: undefined`

可以看出，axios 的拦截器是非常灵活的，可以在请求阶段任意的修改 config，也可以在响应阶段对 response 做各种处理，这也是因为用户对于请求数据的需求就是非常灵活的，没有必要干涉用户的自由度。

vuex
----

vuex 提供了一个 api 用来在 action 被调用前后插入一些逻辑：

https://vuex.vuejs.org/zh/api/#subscribeaction

```
store.subscribeAction({  before: (action, state) => {    console.log(`before action ${action.type}`);  },  after: (action, state) => {    console.log(`after action ${action.type}`);  }});
```

其实这有点像 AOP（面向切面编程）的编程思想。

在调用`store.dispatch({ type: 'add' })`的时候，会在执行前后打印出日志

```
before action add
add
after action add
```

来简单实现一下：

```
import {  Actions,  ActionSubscribers,  ActionSubscriber,  ActionArguments} from "./vuex.type";class Vuex {  state = {};  action = {};  _actionSubscribers = [];  constructor({ state, action }) {    this.state = state;    this.action = action;    this._actionSubscribers = [];  }  dispatch(action) {    // action前置监听器    this._actionSubscribers.forEach(sub => sub.before(action, this.state));    const { type, payload } = action;    // 执行action    this.action[type](this.state, payload).then(() => {      // action后置监听器      this._actionSubscribers.forEach(sub => sub.after(action, this.state));    });  }  subscribeAction(subscriber) {    // 把监听者推进数组    this._actionSubscribers.push(subscriber);  }}const store = new Vuex({  state: {    count: 0  },  action: {    async add(state, payload) {      state.count += payload;    }  }});store.subscribeAction({  before: (action, state) => {    console.log(`before action ${action.type}, before count is ${state.count}`);  },  after: (action, state) => {    console.log(`after action ${action.type},  after count is ${state.count}`);  }});store.dispatch({  type: "add",  payload: 2});
```

此时控制台会打印如下内容：

```
before action add, before count is 0after action add, after count is 2
```

轻松实现了日志功能。

当然 Vuex 在实现插件功能的时候，选择性的将 type payload 和 state 暴露给外部，而不再提供进一步的修改能力，这也是框架内部的一种权衡，当然我们可以对 state 进行直接修改，但是不可避免的会得到 Vuex 内部的警告，因为在 Vuex 中，所有 state 的修改都应该通过 mutations 来进行，但是 Vuex 没有选择把 commit 也暴露出来，这也约束了插件的能力。

redux
-----

想要理解 redux 中的中间件机制，需要先理解一个方法：`compose`

```
function compose(...funcs: Function[]) {  return funcs.reduce((a, b) => (...args: any) => a(b(...args)));}
```

简单理解的话，就是`compose(fn1, fn2, fn3) (...args) = > fn1(fn2(fn3(...args)))`  
它是一种高阶聚合函数，相当于把 fn3 先执行，然后把结果传给 fn2 再执行，再把结果交给 fn1 去执行。

有了这个前置知识，就可以很轻易的实现 redux 的中间件机制了。

虽然 redux 源码里写的很少，各种高阶函数各种柯里化，但是抽丝剥茧以后，redux 中间件的机制可以用一句话来解释：

**把 dispatch 这个方法不断用高阶函数包装，最后返回一个强化过后的 dispatch**

以 logMiddleware 为例，这个 middleware 接受原始的 redux dispatch，返回的是

```
const typeLogMiddleware = dispatch => {  // 返回的其实还是一个结构相同的dispatch，接受的参数也相同  // 只是把原始的dispatch包在里面了而已。  return ({ type, ...args }) => {    console.log(`type is ${type}`);    return dispatch({ type, ...args });  };};
```

有了这个思路，就来实现这个 mini-redux 吧：

```
function compose(...funcs) {  return funcs.reduce((a, b) => (...args) => a(b(...args)));}function createStore(reducer, middlewares) {  let currentState;  function dispatch(action) {    currentState = reducer(currentState, action);  }  function getState() {    return currentState;  }  // 初始化一个随意的dispatch，要求外部在type匹配不到的时候返回初始状态  // 在这个dispatch后 currentState就有值了。  dispatch({ type: "INIT" });  let enhancedDispatch = dispatch;  // 如果第二个参数传入了middlewares  if (middlewares) {    // 用compose把middlewares包装成一个函数    // 让dis    enhancedDispatch = compose(...middlewares)(dispatch);  }  return {    dispatch: enhancedDispatch,    getState  };}
```

接着写两个中间件

```
// 使用const otherDummyMiddleware = dispatch => {  // 返回一个新的dispatch  return action => {    console.log(`type in dummy is ${type}`);    return dispatch(action);  };};// 这个dispatch其实是otherDummyMiddleware执行后返回otherDummyDispatchconst typeLogMiddleware = dispatch => {  // 返回一个新的dispatch  return ({ type, ...args }) => {    console.log(`type is ${type}`);    return dispatch({ type, ...args });  };};// 中间件从右往左执行。const counterStore = createStore(counterReducer, [  typeLogMiddleware,  otherDummyMiddleware]);console.log(counterStore.getState().count);counterStore.dispatch({ type: "add", payload: 2 });console.log(counterStore.getState().count);// 输出：// 0// type is add// type in dummy is add// 2
```

koa
---

koa 的洋葱模型想必各位都听说过，这种灵活的中间件机制也让 koa 变得非常强大，本文也会实现一个简单的洋葱中间件机制。参考（umi-request 的中间件机制）

![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyZ86Ud17ibku2TUptWl6pkQLSBXPYr91iaYqIQPjjhQFrPiaN6VxXQPvJaZ22R9iapQqwhx7QJdricpv1Q/640?wx_fmt=png)洋葱圈

对应这张图来看，洋葱的每一个圈就是一个中间件，它即可以掌管请求进入，也可以掌管响应返回。

它和 redux 的中间件机制有点类似，本质上都是高阶函数的嵌套，外层的中间件嵌套着内层的中间件，这种机制的好处是可以自己控制中间件的能力（外层的中间件可以影响内层的请求和响应阶段，内层的中间件只能影响外层的响应阶段）

首先我们写出`Koa`这个类

```
class Koa {  constructor() {    this.middlewares = [];  }  use(middleware) {    this.middlewares.push(middleware);  }  start({ req }) {    const composed = composeMiddlewares(this.middlewares);    const ctx = { req, res: undefined };    return composed(ctx);  }}
```

这里的 use 就是简单的把中间件推入中间件队列中，那核心就是怎样去把这些中间件组合起来了，下面看`composeMiddlewares`方法：

```
function composeMiddlewares(middlewares) {  return function wrapMiddlewares(ctx) {    // 记录当前运行的middleware的下标    let index = -1;    function dispatch(i) {      // index向后移动      index = i;      // 找出数组中存放的相应的中间件      const fn = middlewares[i];      // 最后一个中间件调用next 也不会报错      if (!fn) {        return Promise.resolve();      }      return Promise.resolve(        fn(          // 继续传递ctx          ctx,          // next方法，允许进入下一个中间件。          () => dispatch(i + 1)        )      );    }    // 开始运行第一个中间件    return dispatch(0);  };}
```

简单来说 dispatch(n) 对应着第 n 个中间件的执行，而 dispatch(n) 又拥有执行 dispatch(n + 1) 的权力，

所以在真正运行的时候，中间件并不是在平级的运行，而是嵌套的高阶函数：

dispatch(0) 包含着 dispatch(1)，而 dispatch(1) 又包含着 dispatch(2) 在这个模式下，我们很容易联想到`try catch`的机制，它可以 catch 住函数以及函数内部继续调用的函数的所有`error`。

那么我们的第一个中间件就可以做一个错误处理中间件：

```
// 最外层 管控全局错误app.use(async (ctx, next) => {  try {    // 这里的next包含了第二层以及第三层的运行    await next();  } catch (error) {    console.log(`[koa error]: ${error.message}`);  }});
```

在这个错误处理中间件中，我们把 next 包裹在 try catch 中运行，调用了 next 后会进入第二层的中间件：

```
// 第二层 日志中间件app.use(async (ctx, next) => {  const { req } = ctx;  console.log(`req is ${JSON.stringify(req)}`);  await next();  // next过后已经能拿到第三层写进ctx的数据了  console.log(`res is ${JSON.stringify(ctx.res)}`);});
```

在第二层中间件的 next 调用后，进入第三层，业务逻辑处理中间件

```
// 第三层 核心服务中间件// 在真实场景中 这一层一般用来构造真正需要返回的数据 写入ctx中app.use(async (ctx, next) => {  const { req } = ctx;  console.log(`calculating the res of ${req}...`);  const res = {    code: 200,    result: `req ${req} success`  };  // 写入ctx  ctx.res = res;  await next();});
```

在这一层把 res 写入 ctx 后，函数出栈，又会回到第二层中间件的`await next()`后面

```
console.log(`req is ${JSON.stringify(req)}`);await next();// <- 回到这里console.log(`res is ${JSON.stringify(ctx.res)}`);
```

这时候日志中间件就可以拿到`ctx.res`的值了。

想要测试错误处理中间件 就在最后加入这个中间件

```
// 用来测试全局错误中间件// 注释掉这一个中间件 服务才能正常响应app.use(async (ctx, next) => {  throw new Error("oops! error!");});
```

最后要调用启动函数：

```
app.start({ req: "ssh" });
```

控制台打印出结果：

```
req is "ssh"calculating the res of ssh...res is {"code":200,"result":"req ssh success"}
```

总结
--

1.  `axios` 把用户注册的每个拦截器构造成一个 promise.then 所接受的参数，在运行时把所有的拦截器按照一个 promise 链的形式以此执行。
    

*   在发送到服务端之前，config 已经是请求拦截器处理过后的结果
    
*   服务器响应结果后，response 会经过响应拦截器，最后用户拿到的就是处理过后的结果了。
    

2.  `vuex`的实现最为简单，就是提供了两个回调函数，vuex 内部在合适的时机去调用（我个人感觉大部分的库提供这样的机制也足够了）。
    
3.  `redux`的源码里写的最复杂最绕，它的中间件机制本质上就是用高阶函数不断的把 dispatch 包装再包装，形成套娃。本文实现的已经是精简了 n 倍以后的结果了，不过复杂的实现也是为了很多权衡和考量，Dan 对于闭包和高阶函数的运用已经炉火纯青了，只是外人去看源码有点头秃...
    
4.  `koa`的洋葱模型实现的很精妙，和 redux 有相似之处，但是在源码理解和使用上个人感觉更优于 redux 的中间件。
    

中间件机制其实是非框架强相关的，请求库一样可以加入 koa 的洋葱中间件机制（如 umi-request），不同的框架可能适合不同的中间件机制，这还是取决于你编写的框架想要解决什么问题，想给用户什么样的自由度。

希望看了这篇文章的你，能对于前端库中的中间件机制有进一步的了解，进而为你自己的前端库加入合适的中间件能力。

本文所写的代码都整理在这个仓库里了：  
https://github.com/sl1673495/tiny-middlewares

代码是使用 ts 编写的，js 版本的代码在 js 文件夹内，各位可以按自己的需求来看。

支持
--

如果你觉得这篇内容对你挺有启发，我想邀请你帮我三个小忙：  

1.  点个「**在看**」，让更多的人也能看到这篇内容（喜欢不点在看，都是耍流氓 -_-）
    
2.  关注我的官网 **https://**m******uyiy.cn**，让我们成为长期关系
    
3.  关注公众号「**高级前端进阶**」，公众号后台回复「面试题」 送你高级前端面试题
    

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)

》》面试官都在用的题库，快来看看《《