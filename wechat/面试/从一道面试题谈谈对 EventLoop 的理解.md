> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3WLuVR4NWnDUOsVQuTSYJw)

> 作者：前端自学驿站，原文链接：https://juejin.im/post/6868849475008331783

前言
--

因为掘金改版之后对于字数有了一定的限制（亲测了下在 12500 字左右，所以看到标题还有几万字长文的标题一定是在唬你的😂）文章美化排版之后字数超出了限制所以打算将后面的部分单独拎出来写, 这样也更好的写出相对比较深入的一点的内容, 对于`【前端体系】`这类文章内容一定是包括但不限于标题的，我会尽可能的拓展、深入、以写出高质量的好文章。

> 在线卑微，如果觉得这篇文章对你有帮助的话欢迎大家点个赞👻

从一道题引出对 Event Loop 的思考
----------------------

对于 Event Loop(事件轮询）所涉及的知识概念太多了，如果上来就讲一大堆概念性的东西太枯燥且从一开始就是按照我的思路来走的，所以我打算换一种方式来写这篇文章，你先按照你之前对于 Event Loop(事件轮询) 的理解来解这道题，我在后面写出我从 Event Loop 的理解思考这题的方式。两种不同的理解、想法、互相碰撞，我可能有理解不对的，你也可能有之前忽略的一些知识点，我们

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvZCJWbArD5t8LavGgCsG4YQt0nH9ibicUoKhEqWsorVmvsd2aFfaZwjpQ/640?wx_fmt=png)

不好意思放错了😅，这张图

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBv6I1Nm66jGNPsiaQicpx2mo9QfqntoYeLeGticd91J3goCOTOoRyMeic0Rg/640?wx_fmt=png)

### 题目

```
console.log('script start');setTimeout(() => {  console.log('北歌');}, 1 * 2000);Promise.resolve().then(function() {  console.log('promise1');}).then(function() {  console.log('promise2');});async function foo() {  await bar()  console.log('async1 end')}foo()async function errorFunc () {  try {    await Promise.reject('error!!!')  } catch(e) {    console.log(e)  }  console.log('async1');  return Promise.resolve('async1 success')}errorFunc().then(res => console.log(res))function bar() {  console.log('async2 end') }console.log('script end');
```

好了，可以暂时不往下翻，先按照自己的理解来解下这道题。

* * *

* * *

* * *

-----------------------------------------------------------------------  我是分割线 -----------------------------------------------------------------------

* * *

* * *

* * *

相信这道题肯定难不倒大家，但是大家是按照什么样的方式来解出这道题的呢？其实这道题考察你了很多知识点，下面我将用我的理解来说说对这道题的思考。水平有限、有任何问题欢迎评论区指出。

JS 的运行机制
--------

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvrGc3ARKFBY3jmkSAhdfrc9mhGLPD3enlA8KMWxJazpVrNjCQnrSOqw/640?wx_fmt=png)

先来解释上图中出现的几个单词所要表达的含义。

Heap(堆)、Stack(栈)、Queue(队列)、Event Loop(事件轮询)

### 程序中的堆栈队列

**Heap(堆)**

堆， 是一种动态存储结构，是利用完全二叉树维护的一组数据，堆分为两种，一种为**最大堆**，一种为**最小堆**，将根节点最大的堆叫做**最大堆**或**大根堆**，根节点最小的堆叫做**最小堆**或**小根堆**。堆是**线性数据结构**，相当于**一维数组**，有唯一后继。

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvbL3luDHNRSkFzpkET4JibQqmuK3D8an4XWtdshfbM7CjcQWyEXD42ibA/640?wx_fmt=png)

**栈（Stack）**

栈在程序中的设定是限定仅在表尾进行插入或删除操作的线性表。栈是一种数据结构，它按照**后进先出** (`LIFO: last-in-first-out`) 的原则存储数据，先进入的数据被压入栈底，最后的数据在栈顶，需要读数据的时候从栈顶开始弹出数据。栈是只能在某一端插入和删除的特殊线性表。

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvKkstskFTkqje9loYUGxEV4oeuCLUPbUvnO1aJM2mHwbtBOro5s4Mww/640?wx_fmt=png)

**队列（Queue**）

队列特殊之处在于它只允许在表的前端（`front`）进行删除操作，而在表的后端（`rear`）进行插入操作，和栈一样，队列是一种操作受限制的线性表。进行插入操作的端称为队尾，进行删除操作的端称为队头。 队列中没有元素时，称为**空队列**。

队列的数据元素又称为队列元素。在队列中插入一个队列元素称为入队，从队列中删除一个队列元素称为出队。因为队列只允许在一端插入，在另一端删除，所以只有最早进入队列的元素才能最先从队列中删除，故队列又称为**先进先出**（`FIFO: first-in-first-out`）

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvReObVtNuxVeKVkiasM5ZXWpAgV5nBmniaHBbLSFoSckPksu5OJMZ0EQw/640?wx_fmt=png)

### js 中的堆栈队列

下面我解释下 **JavaScript 语言**中的堆、栈、队列。

**堆**

堆， 动态分配的内存，大小不定也不会自动释放，存放**引用类型**，指那些可能由多个值构成的对象，保存在堆内存中，包含引用类型的变量，实际上保存的不是变量本身，而是指向该对象的指针。可以简单理解为存储代码块。

堆的作用：存储引用类型值的数据

```
let obj = {    name: '北歌'，    puslic: '前端自学驿站'}let func = () => {    console.log('hello world')}
```

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvAGrTPBkGZ88top3qpsrmz8M2cFXoC1BZsyyISiaibdickuKReIn0op1Jw/640?wx_fmt=png)

**栈**

js 中的栈准确来将应该叫调用栈 (EC Stack)，会自动分配内存空间，会自动释放，存放**基本类型**，简单的数据段，占据固定大小的空间。

栈的作用：存储基本类型值，还有一个很要的作用。**提供代码执行的环境**

**队列**

js 中的队列可以叫做**任务队列**或**异步队列**，任务队列里存放各种异步操作所注册的回调，里面分为两种任务类型，宏任务 (`macroTask`) 和微任务 (`microTask`)。

好，下面可以回到正题上来了。

### 为什么会出现 Event Loop

总所周知 JS 是一门单线程的非阻塞脚本语言，Event Loop 就是为了解决 JS 异步编程的一种解决方案。

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvHIgjZJP0WLgn807jLoaaNBlib8b0WeHE6JXJbBWyghLvwiaqXVLneAQQ/640?wx_fmt=png)

### JS 为什么是单线程语言，那它是怎么实现异步编程 (非阻塞) 运行的

第一个问题：JavaScript 的诞生就是为了处理浏览器网页的交互（DOM 操作的处理、UI 动画等),  设计成单线程的原因就是不想让浏览器变得太复杂，因为多线程需要共享资源、且有可能修改彼此的运行结果（两个线程修改了同一个 DOM 节点就会产生不必要的麻烦），这对于一种网页脚本语言来说这就太复杂了。

第二个问题：JavaScript 是单线程的但它所运行的宿主环境—浏览器是多线程，浏览器提供了各种线程供 Event Loop 调度来协调 JS 单线程运行时不会阻塞。

### 小结

先总结一波个人对于 JS 运行机制的理解：

> 代码执行开启一个全局调用栈 (主栈) 提供代码运行的环境，在执行过程中同步任务的代码立即执行，遇到异步任务将异步的回调注册到任务队列中，等待同步代码执行完毕查看异步是否完成，如果完成将当前异步任务的回调拿到主栈中执行

进程和线程
-----

进程：进程是 CPU 资源分配的最小单位 (是能拥有资源和独立运行的最小单位)

线程：线程是 CPU 调度的最小单位 (线程是建立在进程的基础上的一次程序运行单位)

对于进程和线程并没有确切统一的描述，可以简单的理解：

> 比如一个应用程序: 如 QQ、浏览器启动时会开启一个进程，而该进程可以有多个线程来进行资源调度和分配，达到运行程序的作用。
> 
> 更通俗的话讲：打开 QQ 应用程序开启了进程来运行程序 (QQ), 有多个线程来进行资源调度和分配(多个线程来分配打开 QQ 所占用的运存)，达到运行程序(QQ) 的作用.

用操作系统来作个例子：

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvibOa2ibCicq4jDkf8jiaoUxL5OuaYyYU5icu7voficxIKtCKNuWTG0e68IMQ/640?wx_fmt=png)

> 线程依赖进程，一个进程可以有一个或者多个线程，但是线程只能是属于一个进程。

### JS 的单线程

js 的单线程指的是 javaScript 引擎只有一个线程

单线程就意味着，所有任务需要排队，前一个任务结束，才会执行后一个任务。如果前一个任务耗时很长，后一个任务就不得不一直等着。js 引擎执行异步代码而不用等待，是因有为有任务队列和事件轮询。

*   任务队列：任务队列是一个先进先出的队列，它里面存放着各种任务回调。
    
*   事件轮询：事件轮询是指主线程重复从任务队列中取任务、执行任务的过程。
    

### 浏览器的多线程

1.  GUI 渲染线程
    

*   绘制页面，解析 HTML、CSS，构建 DOM 树，布局和绘制等
    
*   页面重绘和回流
    
*   与 JS 引擎线程互斥，也就是所谓的 JS 执行阻塞页面更新
    

3.  JS 引擎线程
    

*   负责 JS 脚本代码的执行
    
*   负责准执行准备好待执行的事件，即定时器计数结束，或异步请求成功并正确返回的事件
    
*   与 GUI 渲染线程互斥，执行时间过长将阻塞页面的渲染
    

5.  事件触发线程
    

*   负责将准备好的事件交给 JS 引擎线程执行
    
*   多个事件加入任务队列的时候需要排队等待 (JS 的单线程)
    

7.  定时器触发线程
    

*   负责执行异步的定时器类的事件，如 setTimeout、setInterval
    
*   定时器到时间之后把注册的回调加到任务队列的队尾
    

9.  HTTP 请求线程
    

*   负责执行异步请求
    
*   主线程执行代码遇到异步请求的时候会把函数交给该线程处理，当监听到状态变更事件，如果有回调函数，该线程会把回调函数加入到任务队列的队尾等待执行
    

Event Loop
----------

呼，终于回到正题了！

对于事件轮询上面其实已经解释的很清楚了：

> 事件轮询就是解决 javaScript 单线程对于异步操作的一些缺陷，让 javaScript 做到既是**单线程**，又绝对**不会阻塞**的核心机制，是用来协调各种事件、用户交互、脚本执行、UI 渲染、网络请求等的一种机制。

### 浏览器中的 Eveent Loop 执行顺序

Processing model[1] 规范定义了`Eveent Loop`的循环过程：

一个 Eveent Loop 只要存在，就会不断执行下边的步骤：

*   1. 在 tasks(任务) 队列中选择最老的一个 task, 用户代理可以选择任何 task 队列，如果没有可选的任务，则跳到下边的 microtasks 步骤。
    
*   2. 将上边选择的 task 设置为正在运行的 task[2]。
    
*   3.Run: 运行被选择的 task。
    
*   4. 将 Eveent Loop 的 currently running task[3] 变为 null。
    
*   5. 从 task 队列里移除前边运行的 task。
    
*   6.Microtasks: 执行 microtasks 任务检查点 [4]。（也就是执行 microtasks 队列里的任务）
    
*   7. 更新渲染（Update the rendering）：可以简单理解为浏览器渲染...
    
*   8. 如果这是一个 worker event loop，但是没有任务在 task 队列中，并且 WorkerGlobalScope[5] 对象的 closing 标识为 true，则销毁 Eveent Loop，中止这些步骤，然后进行定义在 Web workers[6] 章节的 run a worker[7]。
    
*   9. 返回到第一步。
    

Eveent Loopp 会不断循环上面的步骤，概括说来：

*   `Eveent Loop`会不断循环的去取`tasks`队列的中最老的一个 task(可以理解为宏任务）推入栈中执行，并在当次循环里依次执行并清空`microtask`队列里的任务。
    
*   执行完`microtask`队列里的任务，有**可能**会渲染更新。（浏览器很聪明，在一帧以内的多次 dom 变动浏览器不会立即响应，而是会积攒变动以最高 60HZ(大约 16.7ms 每帧) 的频率更新视图）
    

### 宏任务和微任务优先问题

> 在任务对列 (queue) 中注册的异步回调又分为两种类型，宏任务和微任务。我们为了方便理解可以认为在任务队列中有宏任务队列和微任务队列。宏任务队列有多个，微任务只有一个

*   宏任务 (macro Task)
    

*   script(整体代码)
    
*   setTimeout/setInterval
    
*   setImmediate(Node 环境)
    
*   UI 渲染
    
*   requestAnimationFrame
    
*   ....
    

*   微任务 (micro Task)
    

*   Promise 的 then()、catch()、finally() 里面的回调
    
*   process.nextTick(Node 环境）
    
*   ...
    

个人理解的执行顺序：

1.  代码从开始执行调用一个全局执行栈，script 标签作为宏任务执行
    
2.  执行过程中同步代码立即执行，异步代码放到任务队列中，任务队列存放有两种类型的异步任务，宏任务队列，微任务队列。
    
3.  同步代码执行完毕也就意味着第一个宏任务执行完毕 (script)
    

*   1、先查看任务队列中的微任务队列是否存在宏任务执行过程中所产生的微任务
    
    1-1、有的话就将微任务队列中的所有微任务清空
    
    2-2、微任务执行过程中所产生的微任务放到微任务队列中，在此次执行中一并清空
    
*   2、如果没有再看看宏任务队列中有没有宏任务，有的话执行，没有的话事件轮询第一波结束
    
    2-1、执行过程中所产生的微任务放到微任务队列
    
    2-2、完成宏任务之后执行清空微任务队列的代码
    

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvrFIPQPwhzaEF69vbdB91pkg1vrEtLgd5QjMEOVf0UoxZicibb3SRgCFQ/640?wx_fmt=png)

> 所以是宏任务优先，在宏任务执行完毕之后才会来一次性清空任务队列中的所有微任务。

### 解题分析过程

将最开始的那道题搬下来

```
// => 代码一执行就开始执行了一个宏任务-宏0console.log('script start'); setTimeout(() => { // 宏 1  console.log('北歌');}, 1 * 2000);Promise.resolve()    .then(function() { // 微1-1      console.log('promise1');    })    .then(function() { // 微1-4 => 这个then中的会等待上一个then执行完成之后得到其状态才会向Queue注册状态对应的回调，假设上一个then中主动抛错且没有捕获，那就注册的是这个then中的第二个回调了。      console.log('promise2');     });async function foo() {  await bar() // => await(promise的语法糖)，会异步等待获取其返回值  // => 后面的代码可以理解为放到异步队列微任务中。 这里可以保留疑问后面会详细说  console.log('async1 end') // 微1-2}foo()function bar() {  console.log('async2 end') }async function errorFunc () {  try {    await Promise.reject('error!!!')  } catch(e) {      // => 从这后面开始所有的代码可以理解为放到异步队列微任务中    console.log(e)  // 微1-3  }  console.log('async1');  return Promise.resolve('async1 success')}errorFunc().then(res => console.log(res)) // 微1-5console.log('script end');
```

上面代码对于 Promise 的用法我就不多讲了, 在后面我会写关于 Promise 源码解析的文章。

注意一点就是 Promise.then().then()，在注册异步任务的时候，第二个 then 中的回调是依赖第一个 then 中回调的结果的，如果执行没有异常才会在该异步任务执行完毕之后注册状态对应的回调

#### 第一次执行

全局一个宏任务执行, 输出同步代码。挂载宏 1、微 1-1、微 1-2、微 1-3、微 1-4。1 - 表示属于第一次轮询

```
run: script start、 async2 end、script end
```

#### 第二次执行

同步代码执行完毕，开始执行异步任务中的微任务队列中的代码。

**微任务队列：只有一个队列且会在当前轮询一次清空**

```
run: 执行微1-1: promise1 执行微1-2: async1 end 执行微1-3: error!!!、async1 。当前异步回调执行完毕才Promise.resolve('async1 success')，然后注册then()中的成功的回调-微1-5 执行微1-4: promise2    执行刚刚注册的微1-5: async1 success
```

**到这第一波轮询结束**

#### 第三次执行

开启第二波轮询：执行宏 1

```
run: '北歌'
```

到这。整个轮询结束。

> 其实相对难以理解的也就是微任务，对于微任务也就是上面说的只有一个队列会在**此次**轮询中一次清空 (包括**此次**执行过程中所产生的微任务)。

举个栗子🌰

你去堂食排队打菜，原本你计划今天只吃两个菜 (微任务队列中只注册了两个回调)，在打菜的过程中你看到你最喜欢吃的红烧肉 (微任务执行的过程中遇到的新的微任务)，你肯定得再加个菜 (将微任务加入到微任务队列)

打怪进阶
----

通过上面的讲解现在可以刷几道题来看看自己撑握的怎么样了。

### 黄金题

```
console.log('1');setTimeout(() => {  console.log('2');  Promise.resolve().then(() => {    console.log('3');  })  new Promise((resolve) => {    console.log('4');    resolve();  }).then(() => {    console.log('5')  })})Promise.reject().then(() => {  console.log('13');}, () => {  console.log('12');})new Promise((resolve) => {  console.log('7');  resolve();}).then(() => {  console.log('8')})setTimeout(() => {  console.log('9');  Promise.resolve().then(() => {    console.log('10');  })  new Promise((resolve) => {    console.log('11');    resolve();  }).then(() => {    console.log('12')  })})
```

### 砖石题

```
new Promise((resolve, reject) => {    console.log(1)    resolve()  })  .then(() => {    console.log(2)    new Promise((resolve, reject) => {        console.log(3)        setTimeout(() => {          reject();        }, 3 * 1000);        resolve()    })      .then(() => {        console.log(4)        new Promise((resolve, reject) => {            console.log(5)            resolve();          })          .then(() => {            console.log(7)          })          .then(() => {            console.log(9)          })      })      .then(() => {        console.log(8)      })  })  .then(() => {    console.log(6)  })
```

### 王者题

```
Promise.resolve()  .then(() => {    console.log('promise1');    return new Promise((resolve, reject) => {        setTimeout(() => {          console.log('timer2')          resolve()        }, 0)    })      .then(async () => {        await foo();        return new Error('error1')      })      .then((ret) => {        setTimeout(() => {          console.log(ret);          Promise.resolve()          .then(() => {            return new Error('error!!!')          })          .then(res => {            console.log("then: ", res)          })          .catch(err => {            console.log("catch: ", err)          })        }, 1 * 3000)      }, err => {        console.log(err);      })      .finally((res) => {        console.log(res);        throw new Error('error2')      })      .then((res) => {        console.log(res);      }, err => {        console.log(err);      })  })  .then(() => {    console.log('promise2');  })function foo() {  setTimeout(() => {     console.log('async1');  }, 2 * 1000);}setTimeout(() => {  console.log('timer1')  Promise.resolve()    .then(() => {      console.log('promise3')    })}, 0)console.log('start');
```

### 荣耀王者

下面让我们来一起做最后这道题。

```
async function async1() {  console.log('async1 start');  new Promise((resolve, reject) => {    try {      throw new Error('error1')    } catch(e) {      console.log(e);    }    setTimeout(() => { // 宏3      resolve('promise4')    }, 3 * 1000);  })    .then((res) => { // 微3-1      console.log(res);    }, err => {      console.log(err);    })    .finally(res => { // 微3-2 // TODO注3      console.log(res);    })  console.log(await async2()); // TODO-注1  console.log('async1 end'); // 微1-1 // TODO-注2}function async2() {  console.log('async2');  return new Promise((resolve) => {    setTimeout(() => { // 宏4      resolve(2)    }, 1 * 3000);  })}console.log('script start');setTimeout(() => { // 宏2  console.log('setTimeout');}, 0)async1();new Promise((resolve) => {  console.log('promise1');  resolve();})  .then(() => { // 微1-2    console.log('promise2');    return new Promise((resolve) => {      resolve()    })      .then(() => { // 微1-3        console.log('then 1-1')      })  })  .then(() => { // 微1-4    console.log('promise3');  })console.log('script end');
```

#### 规定

现在为了方便大家理解，请记住一下规定：

*   分析以每次轮询做为分析，同步代码块是直接输出结果的
    
*   异步任务代码块中，红色表示宏任务，绿色表示微任务
    
*   `微1-`表示第一次轮询中的微任务队列中的所有微任务，`微2-`表示第二次，以此类推
    

#### 第一次轮询

script 标签 (宏 0) 执行

输出同步代码：

```
script start -> async1 start -> error1 -> async2 -> promise1 -> script end
```

挂载异步任务:

```
-() => { // 宏2-  console.log('setTimeout');-}-() => { // 宏3-  resolve('promise4')-}-() => { // 宏4-  resolve(2)-}+() => { // 微1-1+  console.log('promise2');+  return new Promise((resolve) => {+  resolve()+}
```

同步代码完毕的同时第一个宏任务也执行完毕，开始清空异步任务中的微任务队列：

```
微1-1: promise2 -> 微1-2: then 1-1 -> 微1-3: promise3
```

执行微任务中所产生新的微任务, 放到微任务队列中，该微任务也会在此次轮询中被清空:

```
+() => { // 微1-2+  console.log('then 1-1')+}+() => { // 微1-3+  console.log('promise3');+}
```

执行微任务过程中所产生的宏任务放到新宏任务队列中：

```
本次微任务执行没有产生新的宏任务
```

**注 1**

> 这里得说一下，很多人认为 await 将代码同步化的意思，其实 await 是 Promise 的语法糖，内部的实现也是依靠 Promise, 其诞生也就是为了优化 promise 的 then 链写法，用同步的方式编写异步代码，让代码看起来更简洁明了 await 的真实意思是 async wait(异步等待的意思)await 表达式相当于调用后面返回 promise 的 then 方法，异步（等待）获取其返回值。即 await<==>promise.then
> 
> 这里的 async2 函数返回的 Promise 中开启了一个宏任务，await 异步等待需要等待宏任务执行才能获取其返回值，也就是说宏任务不执行 await 表达式就压根不能调用 Promise 的 then 方法

**注 2**

> 前面说过 await 表达式后面的代码可以简单理解为放入到微任务中，但是前面 await 表达式压根就没有获取异步等待的结果这后面的代码从跳出当前执行栈后就压根没有挂载到异步任务中，有些教程说的 await 表达式后面的代码可以看成微任务队列的第一个这种说法是错误的！

此次轮询结束输出结果有：

```
script start -> async1 start -> error1 -> async2 -> promise1 -> script end微1-1: promise2 -> 微1-2: then 1-1 -> 微1-3: promise3
```

#### 第二次轮询

上面第一波轮询结束，开启第二波轮询

执行第二个宏任务队列 (宏任务队列只存放一个宏任务)：

```
宏2：setTimeout
```

宏任务执行完毕没有产生新的微任务，也没有产生新的宏任务。第二次轮询结束

此次轮询结束输出结果有：

```
宏2：setTimeout
```

#### 第三次轮询

执行第三个宏任务队列 (宏任务队列只存放一个宏任务)：

```
宏任务本身没有输出啥，不过确定了下Promise的状态并传递了个'promise4'给下一个then中的成功回调
```

宏任务执行过程中产生的新的微任务放到微任务队列:

```
+(res) => { // 微3-1+  console.log(res);+}
```

宏任务执行完毕开始清空异步任务中的微任务队列：

```
微3-1: promise4 -> 微3-2: undefined
```

执行微任务中所产生新的微任务, 放到微任务队列中，该微任务也会在此次轮询中被清空:

```
+res => { // 微3-2 // TODO注3+  console.log(res);+}
```

执行微任务过程中所产生的宏任务放到新宏任务队列中：

```
本次微任务执行没有产生新的宏任务
```

此次轮询结束输出结果有：

```
微3-1: promise4 -> 微3-2: undefined
```

**注 3**

> 前面说过 promise.finally() 也是微任务，finally 可以理解为不管 promise 的状态是成功或失败都要执行我。但是我不接受任何结果。因此 finally 接受不到返回值 res 为 undefined

#### 第四次轮询

执行第四个宏任务队列 (宏任务队列只存放一个宏任务)：

```
宏任务本身没有输出啥，不过确定了下Promise的状态并传递了个2给下一个then中的成功回调
```

宏任务执行过程中产生的新的微任务放到微任务队列:

上面说过 await => Promise.then(), 上面宏任务执行完毕确定了 promise 状态可以去获取异步等待的结果。相当于这样：Promise.then((res) => {return res}) 而 await 表达式后面的代码相当于在**异步等待获取结果后**放到微任务队列中相当于这样：Promise.then((res) => {return res}).finally(() => {}), 只有在 await 表达式前面获取到结果后才会在代码挂在到异步队列中

可以做个实验将上面异步等待定时器的值设定为更长时间，这个时候 await 表达式后面的代码是不为响应的，只有获取到了异步等待的结果，才会响应。

```
+(res) => {return res} // 微4-1+() => {async1 end} // 微4-2
```

宏任务执行完毕开始清空异步任务中的微任务队列：

```
微4-1: 2 -> 微4-2: async1 end
```

执行微任务中所产生新的微任务, 放到微任务队列中，该微任务也会在此次轮询中被清空:

```
本次微任务执行没有产生新的微任务
```

执行微任务过程中所产生的宏任务放到新宏任务队列中：

```
本次微任务执行没有产生新的宏任务
```

此次轮询结束输出结果有：

```
微4-1: 2 -> 微4-2: async1 end
```

#### 所有轮询完毕之后的完整结果

```
script start -> async1 start -> error1 -> async2 -> promise1 -> script end微1-1: promise2 -> 微1-2: then 1-1 -> 微1-3: promise3宏2：setTimeout微3-1: promise4 -> 微3-2: undefined微4-1: 2 -> 微4-2: async1 end
```

如果你四道题全对的话，那么恭喜你。

![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45RNOM0sYAw5Z625dLlcsBvAia9GrRAmN3r0601KMlbJmECSibkNKaDUBvMiclK3QNbZWxrB0ianHtEWA/640?wx_fmt=png)

写在最后
====

对于【前端体系】这系列的文章我是抱着很认真，很想写好的心态的，但毕竟我还是前端小白 & 写作新人，如果文章中有那块写的不太好或有问题欢迎大家指出，我也会在后面的文章不停修改。也希望自己进步的同时能跟你们一起成长。喜欢我文章的朋友们也可以关注一下

我会很感激第一批关注我的人。**此时，年轻的我和你，轻装上阵；而后，富裕的你和我，满载而归。**

系列文章
----

【前端体系】从地基开始打造一座万丈高楼 [8]

参考文章
----

深入理解 JavaScript Event Loop[9]

### 参考资料

[1]

Processing model: _https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model_

[2]

正在运行的 task: _https://html.spec.whatwg.org/multipage/webappapis.html#currently-running-task_

[3]

currently running task: _https://html.spec.whatwg.org/multipage/webappapis.html#currently-running-task_

[4]

microtasks 任务检查点: _https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint_

[5]

WorkerGlobalScope: _https://html.spec.whatwg.org/multipage/workers.html#workerglobalscope_

[6]

Web workers: _https://html.spec.whatwg.org/multipage/workers.html#workers_

[7]

run a worker: _https://html.spec.whatwg.org/multipage/workers.html#run-a-worker_

[8]

【前端体系】从地基开始打造一座万丈高楼: _https://juejin.im/post/6867784542338416648#comment_

[9]

深入理解 JavaScript Event Loop: _https://zhuanlan.zhihu.com/p/34229323_

交流讨论
----

```
欢迎关注「前端瓶子君」，回复「交流」加入前端交流群！
回复「算法」，你可以每天学习一道大厂算法编程题（阿里、腾讯、百度、字节等等）或 leetcode，瓶子君都会在第二天解答哟！
另外，每周还有手写源码题，瓶子君也会解答哟！
》》面试官也在看的算法资料《《
“在看和转发”就是最大的支持

```