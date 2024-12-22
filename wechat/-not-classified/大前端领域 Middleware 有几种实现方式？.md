> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/C8Pi1RwZHcpwB1yUhFftUQ)

### 一、前言  

Middleware（中间件）本意是指位于服务器的操作系统之上，管理计算资源和网络通信的一种通用独立的系统软件服务程序。分布式应用软件借助这种软件在不同的技术之间共享资源。而在大前端领域，Middleware 的含义则简单得多，一般指提供通用独立功能的`数据处理函数`。典型的 Middleware 包括日志记录、数据叠加和错误处理等。本文将横向对比大前端领域内各大框架的 Middleware 使用场景和实现原理，包括`Express`, `Koa`, `Redux`和`Axios`。

### 二、大前端领域的 Middleware

这里说的大前端领域自然就包括了服务器端和客户端了。最早提出 Middleware 概念的是`Express`, 随后由原班人马打造的`Koa`不但沿用了 Middleware 的架构设计，还更加彻底的把自己定义为`中间件框架`。

> Expressive HTTP middleware framework for node.js

在客户端领域，`Redux`也引入了 Middleware 的概念，方便独立功能的函数对 Action 进行处理。`Axios`虽然没有中间件，但其`拦截器`的用法却跟中间件十分相似，也顺便拉进来一起比较。下面的表格横向比较了几个框架的中间件或类中间件的使用方式。

<table data-tool="mdnice编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">框架</th><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">use 注册</th><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">next 调度</th><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">compose 编排</th><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">处理对象</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Express</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">N</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">req &amp; res</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Koa</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">ctx</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Redux</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">N</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">action</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Axios</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Y</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">N</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">N</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">config/data</td></tr></tbody></table>

下面我们一起来拆解这些框架的内部实现方式。

### 三、Express

#### 3.1 用法

```
app.use(function logMethod(req, res, next) {  console.log('Request Type:', req.method)  next()})
```

`Express`的 Middleware 有多种层级的注册方式，在此以应用层级的中间件为例子。这里看到 2 个关键字，`use`和`next`。`Express`通过`use`注册，`next`触发下一中间件执行的方式，奠定了中间件架构的标准用法。

#### 3.2 原理

原理部分会对源码做极端的精简，只保留核心。

##### Middleware 注册（use）

```
var stack = [];function use(fn) {  stack.push(fn);}
```

##### Middleware 调度（next）

```
function handle(req, res) {  var idx = 0;  next();  function next() {    var fn = stack[idx++];    fn(req, res, next)  }}
```

当请求到达的时候，会触发`handle`方法。接着`next`函数从队列中顺序取出 Middleware 并执行。

### 四、Koa

#### 4.1 用法

```
app.use(async (ctx, next) => {  const start = Date.now();  await next();  const ms = Date.now() - start;  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);});
```

跟`Express`相比，`Koa`的 Middleware 注册跟路由无关，所有的请求都会经过注册的中间件。同时`Koa`与生俱来支持`async/await`异步编程模式，代码风格更加简洁。至于洋葱模型什么的大家都清楚，就不废话了。

#### 4.2 原理

##### Middleware 注册（use）

```
var middleware = [];function use(fn) {  middleware.push(fn);}
```

##### Middleware 编排（koa-compose）

```
function compose (middleware) {  return function (context, next) {    let index = -1    return dispatch(0)    function dispatch (i) {      index = i      let fn = middleware[i]      // middleware执行完的后续操作，结合koa的源码，这里的next=undefined      if (i === middleware.length) fn = next      if (!fn) return Promise.resolve()      try {        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));      } catch (err) {        return Promise.reject(err)      }    }  }}
```

跟`Express`类似，`Koa`的 Middleware 也是顺序执行的，通过`dispatch`函数来控制。代码的编写模式也很像：`调用dispatch/next -> 定义dispatch/next -> dispatch/next作为回调递归调用`。这里有个地方要注意下，对于 Middleware 来说，它们的`await next()`实际上就是`await dispatch(i)`。当执行到最后一个 Middleware 的时候，会触发条件`if (i === middleware.length) fn = next`，这里的`next`是`undefined`，会触发条`if (!fn) return Promise.resolve()`，继续执行最后一个 Middleware `await next()`后面的代码，也是洋葱模型由内往外执行的时间点。

### 五、Redux

`Redux`是我所知的第一个将 Middleware 概念应用到客户端的前端框架，它的源码处处体现出函数式编程的思想，让人眼前一亮。

#### 5.1 用法

```
const logger = store => next => action => {  console.info('dispatching', action)  let result = next(action)  console.log('next state', store.getState())  return result}const crashReporter = store => next => action => {  try {    return next(action)  } catch (err) {    console.error('Caught an exception!', err)  }}const store = createStore(appReducer, applyMiddleware(logger, crashReporter))
```

`Redux`中间件的参数做过柯里化，`store`是`applyMiddleware`内部传进来的，`next`是`compose`后传进来的，`action`是`dispatch`传进来的。这里的设计确实十分巧妙，下面我们结合源码来进行分析。

#### 5.2 原理

##### Middleware 编排（applyMiddleware）

```
export default function applyMiddleware(...middlewares) {  return (createStore) => (reducer, preloadedState) => {    const store = createStore(reducer, preloadedState)    let dispatch = store.dispatch    let chain = []    const middlewareAPI = {      getState: store.getState,      dispatch: (action) => dispatch(action)    }    // 先执行一遍middleware，把第一个参数store传进去    chain = middlewares.map(middleware => middleware(middlewareAPI))    // 传入原始的dispatch    dispatch = compose(...chain)(store.dispatch)    return {      ...store,      dispatch    }  }}
```

这里`compose`的返回值又重新赋值给`dispatch`，说明我们在应用内调用的`dispatch`并不是`store`自带的，而是经过 Middleware 处理的升级版。

##### Middleware 编排（compose）

```
function compose (...funcs) {  if (funcs.length === 0) {    return arg => arg  }  if (funcs.length === 1) {    return funcs[0]  }  return funcs.reduce((a, b) => (...args) => a(b(...args)))}
```

`compose`的核心代码只有一行，像套娃一样的将 Middleware 一层一层的套起来，最底层的`args`就是`store.dispatch`。

### 六、Axios

`Axios`中没有 Middleware 的概念，但却有类似功能的拦截器 (interceptors)，本质上都是在数据处理链路的 2 点之间，提供独立的、配置化的、可叠加的额外功能。

#### 6.1 用法

```
// 请求拦截器axios.interceptors.request.use(function (config) {  config.headers.token = 'added by interceptor';  return config;});// 响应拦截器axios.interceptors.response.use(function (data) {  data.data = data.data + ' - modified by interceptor';  return data;});
```

`Axios`的 interceptors 分请求和响应 2 种，注册后会自动按注册的顺序执行，无需像其他框架一样要手动调用`next()`。

#### 6.2 原理

##### interceptors 注册（use）

```
function Axios(instanceConfig) {  this.defaults = instanceConfig;  this.interceptors = {    request: new InterceptorManager(),    response: new InterceptorManager()  };}function InterceptorManager() {  this.handlers = [];}InterceptorManager.prototype.use = function use(fulfilled, rejected) {  this.handlers.push({    fulfilled: fulfilled,    rejected: rejected  });  return this.handlers.length - 1;};
```

可以看到`Axios`内部会维护 2 个 interceptors，它们有独立的 handlers 数组。`use`就是往数组添加元素而已，跟其它框架不同的是这里的数组元素不是一个函数，而是一个对象，包含`fulfilled`和`rejected` 2 个属性。第二个参数不传的时候`rejected`就是 undefined。

##### 任务编排

```
// 精简后的代码Axios.prototype.request = function request(config) {  config = mergeConfig(this.defaults, config);  // 成对的添加元素  var requestInterceptorChain = [];  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);  });    var responseInterceptorChain = [];  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);  });    var chain = [dispatchRequest, undefined];    Array.prototype.unshift.apply(chain, requestInterceptorChain);  chain.concat(responseInterceptorChain);    promise = Promise.resolve(config);  while (chain.length) {    promise = promise.then(chain.shift(), chain.shift());  }  return promise;}
```

这里通过 promise 的链式调用，将 interceptors 串联了起来，执行顺序是：`requestInterceptorChain` -> `chain` -> `responseInterceptorChain`。这里有一个默认的约定，chain 里的元素都是按照`[fulfilled1, rejected1, fulfilled2, rejected2]`这种模式排列的，所以注册 interceptors 的时候如果没有提供第二个参数，也会有一个默认值 undefined。

### 七、各框架的横向对比

看了各大框架的 Middleware 实现方式之后，我们可以总结出以下几个特点：

*   Middleware 机制既可以用于服务器端也可以用于客户端
    
*   Middleware 机制本质上是向框架使用者开放数据处理链路上的一个或多个点，增强框架的数据处理能力
    
*   绝大多数的 Middleware 都是不依赖于具体业务的可复用的功能
    
*   多个 Middleware 可以组合起来实现复杂功能
    

我们再来总结一下各大框架中间件系统实现方式的精髓：

<table data-tool="mdnice编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">框架</th><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240);">实现方式</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Express</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">递归调用<code>next</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Koa</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">递归调用<code>dispatch</code></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Redux</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;"><code>Array.reduce</code>实现函数嵌套</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;">Axios</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left;"><code>promise.then</code>链式调用</td></tr></tbody></table>

这里面最精妙也是最难理解的就是`Array.reduce`这种形式，需要反复的推敲。`promise.then`链式调用的任务编排方法也十分巧妙，前面处理完的数据会自动传给下一个`then`。递归调用的形式则最好理解，`Koa`在`Express`实现的基础上天然支持异步调用，更符合服务器端场景。

### 八、总结

本文从使用方式入手，结合源码讲解了各大前端框架中 Middleware 的实现方式，横向对比了他们之间的异同。当中的递归调用、函数嵌套和 promise 链式调用的技巧非常值得我们借鉴学习。

如果你对 Axios 拦截器机制和洋葱模型感兴趣的话，可以阅读以下两篇文章：

*    [77.9K 的 Axios 项目有哪些值得借鉴的地方](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247486544&idx=1&sn=70b610d286d1ecd44b53a1f128a3669f&chksm=ea47ad08dd30241e02d9656040f225313a203f26c9f3f5c32da7b51f46a2882c378a030d5df9&scene=21#wechat_redirect)  
    
*   [如何更好地理解中间件和洋葱模型](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247486886&idx=1&sn=63bffec358b77986558e868d1adc2183&chksm=ea47acfedd3025e857447b8497b56484acb9c9f2c7cea57481648c3f75c4c9eee8a3972e1a80&scene=21#wechat_redirect)