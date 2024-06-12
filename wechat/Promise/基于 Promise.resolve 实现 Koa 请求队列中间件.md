> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jJLtbpsFPeecIt-hIxggKQ)

> 本文作者为 360 奇舞团前端工程师

前言
--

> 最近在做一个 `AIGC` 项目，后端基于 `Koa2` 实现。其中有一个需求就是调用兄弟业务线服务端 `AIGC` 能力生成图片。但由于目前兄弟业务线的 `AIGC` 项目也是处于测试阶段，能够提供的服务器资源有限，当并发请求资源无法满足时，会响应【服务器繁忙】，这样对于 `C` 端展示的我们是非常不友好的。基于当前的困境，第一想到的解决方案就是`Kafka` 或 `RabbitMQ`，但实际上对于我们目前的用户体量来说，简直就是大材小用。于是转换思路，是不是可以利用 js 模拟队列的方式解决问题呢，答案是：可以，`Promise` 的 `Resolve` 队列！

分析
--

### `Resolve` 的理解

`Promise` 的核心用法就是利用 `Resolve` 函数做链式传递。例如：

```
new Promise(resolve => {  resolve('ok')}).then(res => {  console.log(res)})// 输出结果：ok
```

通过上边的例子我们可以理解，`Resolve` 将 `Promise` 对象的状态从 `pending` 变为 `fullfilled` ，在异步操作成功时调用，并将**异步操作**的结果，作为参数传递出去。

> 核心点：**异步**

**此时抛出一个问题**：假如我把 `resolve` 回调函数都放入一个队列里，`Promise` 是不是一直处于`pending` 状态？`pending` 状态就意味着 then 函数一直处于 `waitting` 状态，直到队列中的 `resolve` 函数执行后，`then` 函数才能被执行？

### 制造阻塞的 `Promise` 函数

```
const queue = []new Promise(resolve => {  queue.push(resolve)}).then(res => {  console.log(res)})// 输出结果：Promise {<pending>}queue[0]('ok')// 输出结果：ok
```

为了佐证，直接贴图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEC3Zxib0DqicJknfETXCXbUCWtO0lE6IUiaE9brr5kbNAkNXMYK9sLDnicmI2HdH5onu9ZXpHAH7KQ3IQ/640?wx_fmt=png)image.png

### 异步转同步

`Koa2` 属于洋葱模型，当请求过来以后需要调用 `next` 函数继续穿透，而我们的需求是限流，这意味着我们要阻塞请求，此时此刻，`await`举起了双手，阻塞这种不要脸的事我在行呀！

```
const queue = []const fn = async = () => {  await new Promise(resolve => {    queue.push(resolve)  })  // ...一大波操作}// queue[0]()
```

如果 `queue[0]` 不执行，代码就会一直处于阻塞状态。那我们就可以利用 await 写一个中间件实现阻塞某些 `api` 的需求了。

```
// 阻塞所有请求，知道queue中的resolve函数被执行才会执行nextconst queue = []module.exports = function () {  return async function (ctx, next) {    await new Promise(resolve => {      queue.push(resolve)    })    await next();  };};
```

### 实现中间件

原理和思路都捋直了，那就开搞吧。话不多说，贴代码：

```
const resolveMap = {};/** * 请求队列 * @param {*} ctx * @param {*} ifer 是否是图生图 * @param {*} maxReqNumber 最大请求数量 * @returns * @description * 使用promise解决请求队列问题 * 1. 用于限制aicg的并发请求 * 2. 当文生图是，根据风格分类存储resolve，当前请求响应完成时，触发消费队列中下一个请求 * 3. 当图生图是，直接存储resolve到image风格，当前请求响应完成时，触发消费队列中下一个请求 * 4. 同时处理的请求数量不超过maxReqNumber个，否则加入队列等待。 */function requestQueue(ctx, maxReqNumber) {  const params = ctx.request.body ?? ctx.request.query ?? ctx.request.params ?? {};  const style = params.style ?? 'pruned_cgfull';  resolveMap[style] = resolveMap[style] || { list: [], processNumber: 0 };  const currentResolve = resolveMap[style];  ((currentResolve) => {    ctx.res.on('close', () => {      saveNumberMinus(currentResolve);      // 当前请求响应完成时，触发消费队列中下一个请求      if (currentResolve.list.length !== 0) {        const node = currentResolve.list.shift();        node.resolve();        currentResolve.processNumber++;      }      currentResolve = null;    });  })(currentResolve);  // 当前请求正在处理中，将resolve存储到队列中  if (currentResolve.processNumber + 1 > maxReqNumber) {    // 利用promise阻塞请求    return new Promise((resolve, reject) => {      // 当前请求正在处理中，将resolve存储到队列中      currentResolve.list.push({ resolve, reject, timeStamp: Date.now(), params });    });  } else {    currentResolve.processNumber++;    return Promise.resolve();  }}module.exports = function (options = {}) {  const { maxReqNumber = 2, apis = [] } = options;  return async function (ctx, next) {    const url = ctx.url;    if (apis.includes(url)) {      try {        await requestQueue(ctx, maxReqNumber);      } catch (error) {        console.log(error);        ctx.body = {          code: 0,          msg: error,        };        return;      }    }    await next();  };};const fiveMinutes = 5 * 60 * 1000;setInterval(() => {  Object.values(resolveMap).forEach((item) => {    const { timeStamp, resolve } = item;    if (Date.now() - timeStamp > fiveMinutes) {      resolve(); // 执行并释放请求，防止用户请求因异常积压导致一直挂起      saveNumberMinus(item);    }  });}, 5 * 60 * 1000);
```

> 这里要着重提示一点，闭包的使用。之所以使用闭包是为了保证当前请求的`close`事件触发时能够使用`currentResolve`对象。因为当前请求是放在自身对应风格的数组中，`close`时要消费下一个等待的请求，同时也不要忘了手动释放资源。

`app.js` 逻辑部分

```
const requsetQueue = require('./app/middleware/request-queue');const app = new Koa();app.use(  requsetQueue({    maxReqNumber: 1,    apis: ['/api/aigc/image', '/api/aigc/textToImage', '/api/aigc/img2img'],  }));app.listen(process.env.NODE_ENV === 'development' ? '9527' : '3000');
```

总结
--

其实基于 `Promise` 的 `Resolve` 队列，我们还可以实现一些其他的功能，比如：**前端代码中未登录状态下收集某些请求，等到登录成功后发送请求**。也希望大家一起探索和讨论 Promise 的其他解决能力的实现方案。

  

---

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)