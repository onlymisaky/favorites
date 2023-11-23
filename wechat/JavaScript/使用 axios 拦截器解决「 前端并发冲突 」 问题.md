> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nsMx50GjnjOQFG2UHI3rXw)

大厂技术  高级前端  Node 进阶

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

背景
==

`并发冲突问题`， 是日常开发中一个比较常见的问题。

不同用户在较短时间间隔内变更数据，或者某一个用户进行的重复提交操作都可能导致并发冲突。

并发场景在开发和测试阶段难以排查全面，出现线上 bug 以后定位困难，因此做好并发控制是前后端开发过程中都需要重视的问题。

对于同一用户短时间内重复提交数据的问题，前端通常可以先做一层拦截。

本文将讨论前端如何利用 axios 的拦截器过滤重复请求，解决并发冲突。

一般的处理方式 — 每次发请求添加 loading
-------------------------

在尝试 axios 拦截器之前，先看看我们之前业务是怎么处理并发冲突问题的：

每次用户操作页面上的控件（输入框、按钮等），向后端发送请求的时候，都给页面对应的控件添加 loading 效果，提示正在进行数据加载，同时也阻止 loading 效果结束前用户继续操作控件。

这是最直接有效的方式，如果你们前端团队成员足够细心耐心，拥有良好的编码习惯，这样就可以解决大部分用户不小心重复提交带来的并发问题了。

更优的解决方案：axios 拦截器统一处理
---------------------

项目中需要前端限制并发的场景这么多，我们当然要思考更优更省事的方案。

既然是在每次发送请求的时候进行并发控制，那如果能重新封装下发请求的公共函数，统一处理重复请求实现自动拦截，就可以大大简化我们的业务代码。

项目使用的 `axios` 库来发送 `http` 请求，`axios` 官方为我们提供了丰富的 API，我们来看看拦截请求需要用到的两个核心 API:

### 1. `interceptors`

拦截器包括请求拦截器和响应拦截器，可以在请求发送前或者响应后进行拦截处理，用法如下：

```
// 添加请求拦截器axios.interceptors.request.use(function (config) {  // 在发送请求之前做些什么  return config;}, function (error) {  // 对请求错误做些什么  return Promise.reject(error);});// 添加响应拦截器axios.interceptors.response.use(function (response) {    // 对响应数据做点什么    return response;  }, function (error) {    // 对响应错误做点什么    return Promise.reject(error);  });
```

### 2. `cancel token`:

调用 `cancel token API` 可以取消请求。

官网提供了两种方式来构建 `cancel token`，我们采用这种方式：

通过传递一个 `executor` 函数到 `CancelToken` 的构造函数来创建 `cancel token`，方便在上面的请求拦截器中检测到重复请求可以立即执行:

```
const CancelToken = axios.CancelToken;let cancel;axios.get('/user/12345', {  cancelToken: new CancelToken(function executor(c) {    // executor 函数接收一个 cancel 函数作为参数    cancel = c;  })});// cancel the requestcancel();
```

**本文提供的思路就是利用 `axios interceptors API` 拦截请求，检测是否有多个相同的请求同时处于 pending 状态，如果有就调用 `cancel token API` 取消重复的请求。**

假如用户重复点击按钮，先后提交了 A 和 B 这两个完全相同（考虑请求路径、方法、参数）的请求，我们可以从以下几种拦截方案中选择其一：

*   取消 A 请求，只发出 B 请求
    
*   取消 B 请求，只发出 A 请求
    
*   取消 B 请求，只发出 A 请求，把收到的 A 请求的返回结果也作为 B 请求的返回结果
    

第三种方案需要做监听处理增加了复杂性，结合我们实际的业务需求，最后采用了第二种方案来实现，即：

**只发第一个请求。在 A 请求还处于 pending 状态时，后发的所有与 A 重复的请求都取消，实际只发出 A 请求，直到 A 请求结束（成功 / 失败）才停止对这个请求的拦截。**

具体实现
----

1.  存储所有 pending 状态的请求
    

首先我们要将项目中所有的 pending 状态的请求存储在一个变量中，叫它 `pendingRequests`，

可以通过把 `axios` 封装为一个单例模式的类，或者定义全局变量，来保证 `pendingRequests` 变量在每次发送请求前都可以访问，并检查是否为重复的请求。

```
let pendingRequests = new Map()
```

把每个请求的方法、url 和参数组合成一个字符串，作为标识该请求的唯一 key，同时也是 `pendingRequests` 对象的 key:

```
const requestKey = `${config.url}/${JSON.stringify(config.params)}/${JSON.stringify(config.data)}&request_type=${config.method}`;
```

帮助理解的小 tips:

*   定义 `pendingRequests` 为 map 对象的目的是为了方便我们查询它是否包含某个 key，以及添加和删除 key。添加 key 时，对应的 value 可以设置用户自定义的一些功能参数，后面扩展功能的时候会用到。
    
*   `config` 是 `axios` 拦截器中的参数，包含当前请求的信息
    

2.  在请求发出前检查当前请求是否重复
    
    在请求拦截器中，生成上面的 `requestKey`，检查 `pendingRequests` 对象中是否包含当前请求的 `requestKey`
    

*   有：说明是重复的请求，cancel 掉当前请求
    
*   没有：把 `requestKey` 添加到 `pendingRequests` 对象中
    

因为后面的响应拦截器中还要用到当前请求的 `requestKey`，为了避免踩坑，最好不要再次生成。

在这一步就把 `requestKey` 存回 `axios` 拦截器的 `config` 参数中，后面可以直接在响应拦截器中通过 `response.config.requestKey` 取到。

代码示例：

```
// 请求拦截器axios.interceptors.request.use(  (config) => {    if (pendingRequests.has(requestKey)) {      config.cancelToken = new axios.CancelToken((cancel) => {        // cancel 函数的参数会作为 promise 的 error 被捕获        cancel(`重复的请求被主动拦截: ${requestKey}`);      });    } else {      pendingRequests.set(requestKey, config);      config.requestKey = requestKey;    }    return config;  },  (error) => {    // 这里出现错误可能是网络波动造成的，清空 pendingRequests 对象    pendingRequests.clear();    return Promise.reject(error);  });
```

3.  在请求返回后维护 `pendingRequests` 对象
    

如果请求顺利走到了响应拦截器这一步，说明这个请求已经结束了 pending 状态，那我们要把它从 `pendingRequests` 中除名：

```
axios.interceptors.response.use((response) => {  const requestKey = response.config.requestKey;  pendingRequests.delete(requestKey);  return Promise.resolve(response);}, (error) => {  if (axios.isCancel(error)) {    console.warn(error);    return Promise.reject(error);  }  pendingRequests.clear();  return Promise.reject(error);})
```

4.  需要清空 `pendingRequests` 对象的场景
    

遇到网络波动或者超时等情况造成请求错误时，需要清空原来存储的所有 pending 状态的请求记录，在上面演示的代码已经作了注释说明。

此外，页面切换时也需要清空之前缓存的 `pendingRequests` 对象，可以利用 `Vue Router` 的 `beforeEach` 钩子：

```
router.beforeEach((to, from, next) => {
  request.clearRequestList();
  next();
});
```

功能扩展
----

1.  统一处理接口报错提示
    

与后端约定好接口返回数据的格式，对接口报错的情况，可以统一在响应拦截器中添加 toast 给用户提示，

对于特殊的不需要报错的接口，可以设置一个参数存入 `axios` 拦截器的 `config` 参数中，过滤掉报错提示:

```
// 接口返回 retcode 不为 0 时需要报错，请求设置了 noError 为 true 则这个接口不报错 if (  response.data.retcode &&  !response.config.noError) {  if (response.data.message) {    Vue.prototype.$message({      showClose: true,      message: response.data.message,      type: 'error',    });  }  return Promise.reject(response.data);}
```

2.  发送请求时给控件添加 loading 效果
    

上面利用 `axios interceptors` 过滤重复请求时，可以在控制台抛出信息给开发者提示，在这个基础上如果能给页面上操作的控件添加 loading 效果就会对用户更友好。

常见的 ui 组件库都有提供 loading 服务，可以指定页面上需要添加 loading 效果的控件。下面是以 `element UI` 为例的示例代码：

```
// 给 loadingTarget 对应的控件添加 loading 效果，储存 loadingService 实例addLoading(config) {  if (!document.querySelector(config.loadingTarget)) return;  config.loadingService = Loading.service({    target: config.loadingTarget,  });}// 调用 loadingService 实例的 close 方法关闭对应元素的 loading 效果closeLoading(config) {  config.loadingService && config.loadingService.close();}
```

与上面过滤报错方式类似，发请求的时候将元素的 class name 或 id 存入 `axios` 拦截器的 `config` 参数中，

在请求拦截器中调用 `addLoading` 方法, 响应拦截器中调用 `closeLoading` 方法，就可以实现在请求 pending 过程中指定控件（如 button） loading，请求结束后控件自动取消 loading 效果。

3.  支持多个拦截器组合使用
    

简单看下 `axios interceptors` 部分实现源码可以理解，它支持定义多个 `interceptors`，所以只要我们定义的 `interceptors` 符合   `Promise.then` 链式调用的规范，还可以添加更多功能:

```
this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {  chain.unshift(interceptor.fulfilled, interceptor.rejected);});this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {  chain.push(interceptor.fulfilled, interceptor.rejected);});while (chain.length) {  promise = promise.then(chain.shift(), chain.shift());}
```

总结
==

并发问题很常见，处理起来又相对繁琐，前端解决并发冲突时，可以利用 `axios` 拦截器统一处理重复请求，简化业务代码。

同时 `axios` 拦截器支持更多应用，本文提供了部分常用扩展功能的实现，感兴趣的同学可以继续挖掘补充拦截器的其他用法。

今天的内容就这么多，希望对你有帮助。

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```