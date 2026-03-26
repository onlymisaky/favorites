> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jfXQgAR6Su8yvwgc24g-Lw)

JavaScript 异步原理
---------------

对于 FEer 来说，JavaScript 是单线程，同一时间只能执行一个任务，这种模式的好处是实现起来比较简单，执行环境相对单纯；坏处是只要有一个任务耗时很长，后面的任务都必须排队等着，会拖延整个程序的执行。常见的浏览器无响应（假死），往往就是因为某一段 JavaScript 代码长时间运行（比如死循环），导致整个页面卡在这个地方，其他任务无法执行。对于计算类型的任务，需要使用到 CPU，就只能等待任务执行完毕；但是对于很多时候 CPU 都是闲着的，比如在执行 IO 操作（输入输出），ajax 请求，文件读写等，这些操作 CPU 完全可以不管 IO 操作，可以继续往下执行其他任务。异步机制就是为了解决这个问题，这种机制在 JavaScript 内部采用的`事件循环`机制（**Event Loop**）。

> **JavaScript 是单线程，同一时间只能执行一个任务。**
> 
> 当然，在浏览器上还是有可以开启多个线程的解决方案 **Web Worker**，但是它只能执行计算类的操作，无法操作 DOM。

### 事件循环

一个事件循环，有一个 Event 的队列（所有发生的 event 都存储在这里——下图中称为`任务队列`Task Queue）。还有一个`Event Loop`，它不断地将这些 event 从队列中取出，并调用事件中的回调（call stack 会执行所有的回调）。API 是用于处理异步函数的 API，比如说处理等待来自客户端或 server 的响应，读取本地文件，定时器 settimeout 等。

在此流程中，所有 function call 首先进入 call stack，然后通过 API 执行异步任务。当异步任务完成后，callback 进入任务队列，然后再次进入 call stack。当任务执行完之后，event loop 会再次去 task queue 重复上面的流程。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFaiald0XJ5qs8X6RctAazwKY9LAmujqO1NEhgh5XgaAtpt4GHTYVcFAA/640?wx_fmt=png)

#### 任务类型

> 上面提到了任务队列，在浏览器中，主要分成两种任务：宏任务、微任务。
> 
> 它们都是通过调用浏览器提供的 API 产生。
> 
> 以下把浏览器和 Nodejs 中能够生成异步任务的 api 都列出来。

**宏任务（macrotask）**

*   setTimeout
    
*   setInterval
    
*   setImmediate (Node 独有)
    
*   requestAnimationFrame (浏览器独有)
    
*   I/O
    
*   UI rendering (浏览器独有)
    

**微任务（microtask）**

*   process.nextTick (Node 独有)
    
*   Promise
    
*   Object.observe
    
*   MutationObserver
    

#### 事件循环流程图

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFFzibXM5W27sUyuIKJmLklFiaEzOaJeTLTuGtSTsmOLZoible8R4v9qhZQ/640?wx_fmt=png)

一个事件循环完整执行过程，可以参考《带你了解事件循环机制 (Event Loop)》[1]。

JavaScript 异步编程
---------------

浏览器中 JavaScript 异步编程的发展可以分为四个阶段

1.  回调函数
    
2.  Promise
    
3.  Generator
    
4.  async/await
    

### 回调函数

> 回调函数非常简单容易理解和实现，缺点不利于代码的维护和阅读，各个部分之间高度耦合，还会造成回调地狱。

以实现红绿灯为例

```
function red() {    console.log('red')}function green() {    console.log('green')}function yellow() {    console.log('yellow')}const light = (timer, light, callback) => {    setTimout(() => {        switch(light) {            case 'red': red(); break;            case 'green': green(); break;            case 'yellow': yellow(); break;        }        callback()    }, timer)}const work = () => {    task(3000, 'red', () => {        task(1000, 'green', () => {            task(2000, 'yellow', work)        })    })}work()
```

### Promise

> Promise 是为了解决回调地狱才被提出来的，它允许将传统的嵌套回调函数写法转化为链式调用。

```
const promiseLight = (timer, light) => {  return new Promise((resolve, reject) => {    setTimeout(() => {      switch (light) {        case 'red': red(); break;        case 'green': green(); break;        case 'yellow': yellow(); break;      }      resolve()    }, timer)  })}const work = () => {  promiseLight(3000, 'red')    .then(() => promiseLight(1000, 'green'))    .then(() => promiseLight(2000, 'yellow'))    .then(work)}
```

### Generator

> Generator 函数可以暂停执行和恢复执行，同时它还具备两个特性：函数体内的数据转换和错误处理机制。相信很多同学在实际工作中，很少用到 generator，但是了解他可以让我们实现很多有趣的功能。详细介绍可以参考《什么是 JavaScript generator 以及如何使用它们》[2] 和《Generator 函数的含义与用法》[3] 两篇文章。

```
const generator = function *() {  yield promiseLight(3000, 'red')  yield promiseLight(1000, 'green')  yield promiseLight(2000, 'yellow')  yield generator()}const generatorObj = generator()generatorObj.next()generatorObj.next()generatorObj.next()
```

### async/await

> 这种语法能够让我们以写同步代码的习惯来编程异步代码。Generator 实际就是 asyc 函数的语法糖。
> 
> 想更深入学些 async/await 用法，可以参考《async 函数的含义和用法》[4]

```
const asyncTask = async () => {  await promiseLight(3000, 'red')  await promiseLight(1000, 'green')  await promiseLight(2000, 'yellow')}asyncTask()
```

浏览器与 Nodejs 中的异同
----------------

**Node11.0.0（不包括 Nodejs 11）** 以前的版本，Node 和浏览器的异步流程存在一些细节上的差异。

Nodejs 11.0.0.0 以前的版本一次事件循环：

执行完一个**主队列中的所有任务**后，再执行微任务队列中的任务

> Node 的任务队列总共 6 个：包括 4 个主队列（main queue）和两个中间队列（intermediate queue）
> 
> 具体介绍可以参看《[翻译]Node 事件循环系列——2、Timer 、Immediate 和 nextTick》[5] 以及《The Node.js Event Loop, Timers, and process.nextTick()》[6]。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFetq0sibSbMjibEDIyWUQ5yfib5d0ibo1qdEUic3ickaV5ib224SOG1mN6iaYMg/640?wx_fmt=png)

Nodejs 11.0.0 以后的版本一次事件循环和浏览器一样：

执行完主队列中的一个任务后，立即执行微任务队列中所有任务，然后再执行主任务队列中下一个任务

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFic6YEXBpc8Dx8DLfKJYH4IWV90gVYWQ7McicYPql0YXXYCI9Vib9qyRng/640?wx_fmt=png)

举一个小例子

```
setTimeout(() => {  console.log("计时任务1")  new Promise((resolve, reject) => {    resolve();  }).then(() => {    console.log("微任务1")  })}, 1000);setTimeout(() => {  console.log("计时任务2")  new Promise((resolve, reject) => {    resolve();  }).then(() => {    console.log("微任务2")  })}, 1000);
```

在 Nodejs11 之前版本运行结果

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFlMZOyy9gvXMx6J73hQoQWgy7DBH95eFrDcp0BCIbC7icQeCR4QibNuow/640?wx_fmt=png)

在 Nodejs11 之后版本运行结果

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFCxvVQEHDE6ibiaibdaqL7Iic1seyOeia9xZPFZtPCRv7pgPYDtqckdYFO9g/640?wx_fmt=png)

异步编程的 BadCase
-------------

在实际开发过程中，无论是进行前端需求开发，还是 Nodejs 功能开发，都使用`async/await`语法，它给开发带来了巨大的便利，但是，如果对 JS 异步机制不够熟悉，就会导致使用错误，最终引发功能 bug，有时候还极其难以定位。

下面通过实际例子来进行讲解。

### 异步函数串行执行

有时候需要在同一个函数中调用多个异步函数，但是被调用的异步函数之间并没有前后依赖关系，本来可以并行执行，比如多个异步接口请求；使用 async/await 写法就很容易写成串行执行。如下例子

```
function sleep(time) {  return new Promise((resolve) => setTimeout(resolve, time));}async function main() {  const start = console.time('async');  await sleep(1000);  await sleep(2000);  const end = console.timeEnd('async');}// 以上输出3s
```

**解决方法**

对于在同一个执行栈中执行的异步函数，如果它们之间没有依赖关系，可以使用 Promise.all() 进行并行执行；或者不带 await 先执行函数，再 await 异步函数返回的 promise。

```
function sleep(time) {  return new Promise((resolve) => setTimeout(resolve, time));}// 方式一async function main() {  const start = console.time('async');  await Promise.all([sleep(1000), sleep(2000)]);  const end = console.timeEnd('async');}// 方式二async function main() {  const start = console.time('async');  const promise1 = sleep(1000);  const promise2 = sleep(2000);  const s1 = await promise1;  const s2 = await promise2;  const end = console.timeEnd('async');}//以上输出2s
```

### 无法捕获错误

使用 Promise 用法，只能通过. catch 的方式捕获在 promise 内发生的异常，try/catch 无法捕获；而 async/await 语法则需要使用 try/catch 进行捕获。

有些情况下，即使使用了 try/catch 将 async 函数体包起来，但还是会无法捕获错误。

```
async function err() {  throw "error"}async function main() {  try {    return err();  } catch (err) {    console.log(err);  }}main();
```

为了方便，直接将 async 函数返回，这种情况，err 函数发生异常，则异常无法被捕获。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9nsZj5INI8dx15O06eZQoFV9fegpT5JZsPO2J07icK7elmh7Y3L0O3aOgktraQiaQIcPN0IVooA6hg/640?wx_fmt=png)

应该尽可能避免直接在 async 函数中直接返回没有 await 的异步函数；以上可以通过两种方式解决。

1.  在 async 函数体内使用 await 等待所有异步函数执行
    

```
async function main() {  try {    const res =  await err();    return res;  } catch (err) {    console.log(err);  }}
```

2.  在 main 函数体外使用 catch 捕获异常
    

```
async function main() {  try {    return err();  } catch (err) {    console.log(err);  }}main().catch(err => {    console.log(err);})
```

此外，可以使用`await-to-js`库进行捕获，其用法类似 Go 语言的错误处理。

```
async function main() {  try {    const [err, res] = await to(err());    return err();  } catch (err) {    console.log(err);  }}
```

这个库的源码也非常简单，感兴趣的参看 scopsy/await-to-js[7]。

### 同步思维编写异步代码

在使用 async/await 编写代码时，可能比较容易被它 "骗了"，因为 async/await 声称可以以同步的写法来编写异步代码。在实现一些比较复杂的功能时，会很容易忽略异步场景的问题。

例如，前端页面需要实现一个任务功能，点击任务按钮（假设有 2 个任务按钮），会先去请求接口获取数据，然后修改页面颜色。

按钮 A，修改页面为红色；按钮 B，修改页面为蓝色；

预期的效果是，页面颜色应该是最后一次点击任务按钮所对应的颜色。

```
async function taskA() {  return new Promise((resolve) => {    setTimeout(() => {      changePageColor('red')      resolve()    }, 500);  })}async function taskB() {  return new Promise((resolve) => {    setTimeout(() => {      changePageColor('blue')      resolve()    }, 1000);  })}function changePageColor(color) {  console.log(color);}async function executeTask(task) {  await task()}//第一次点击任务按钮BexecuteTask(taskB);//第二次点击任务按钮AexecuteTask(taskA);
```

以上代码，模拟先点击按钮 B，再点击按钮 A，按钮 A 请求先于按钮 B 返回，如果按照同步思维进行实现，可能的实现代码如上。最终的结果是，页面先变成红色，然后变成蓝色；而预期页面的最终颜色应该是红色。

以上问题需要考虑到异步操作完成时间的不可预知性，需要考虑不同异步操作对同一个数据所产生的影响。可以使用锁的思路解决以上问题。在执行改变页面颜色之前，先判断当前锁的类型是否和任务对应锁的类型相等，如果相当，才执行改变颜色，否则，不执行。

```
let workingLock = false;async function taskA() {  return new Promise((resolve) => {    workingLock = 'red';    setTimeout(() => {      if (workingLock === 'red') {        changePageColor('red')      }      resolve()    }, 500);  })}async function taskB() {  return new Promise((resolve) => {    workingLock = 'blue'    setTimeout(() => {      if (workingLock === 'blue') {        changePageColor('blue')      }      resolve()    }, 1000);  })}function changePageColor(color) {  console.log(color);}async function executeTask(task) {  await task();}executeTask(taskB);executeTask(taskA);
```

### 

点击上方关注

![](https://mmbiz.qpic.cn/mmbiz_gif/JaFvPvvA2J3MKYVlmXC32WtRJEYsPM9zbyZQtPicnOVfKibj5PuaiarJibbQgR5WWf52x1FicLIhiaweLvCoqia0TGibqg/640?wx_fmt=gif)

  

我们下期再见

  

  

参考资料

[1]

《带你了解事件循环机制 (Event Loop)》: _https://blog.csdn.net/weixin_52092151/article/details/119788483_

[2]

《什么是 JavaScript generator 以及如何使用它们》: _https://zhuanlan.zhihu.com/p/45599048_

[3]

《Generator 函数的含义与用法》: _https://www.ruanyifeng.com/blog/2015/04/generator.html_

[4]

《async 函数的含义和用法》: _https://www.ruanyifeng.com/blog/2015/05/async.html_

[5]

《[翻译]Node 事件循环系列——2、Timer 、Immediate 和 nextTick》: _https://zhuanlan.zhihu.com/p/87579819_

[6]

《The Node.js Event Loop, Timers, and process.nextTick()》: _https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/_

[7]

scopsy/await-to-js: _https://github.com/scopsy/await-to-js/blob/master/src/await-to-js.ts_