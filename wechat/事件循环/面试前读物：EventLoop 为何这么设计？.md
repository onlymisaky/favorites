> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/xeTBJsW6YKld6VsNoGv_aw)

Event Loop 是 JavaScript 的基础概念，面试必问，平时也经常谈到，但是有没有想过为什么会有 Event Loop，它为什么会这样设计的呢？

今天我们就来探索下原因。

浏览器的 Event Loop
---------------

JavaScript 是用于实现网页交互逻辑的，涉及到 dom 操作，如果多个线程同时操作需要做同步互斥的处理，为了简化就设计成了单线程，但是如果单线程的话，遇到定时逻辑、网络请求又会阻塞住。怎么办呢？

可以加一层调度逻辑。把 JS 代码封装成一个个的任务，放在一个任务队列中，主线程就不断的取任务执行就好了。

每次取任务执行，都会创建新的调用栈。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VJNVoxv5uxG4icW5vdmKdbsHllrAArCuWcozrBdultw9YSSlxnEyVa5w/640?wx_fmt=png)

其中，定时器、网络请求其实都是在别的线程执行的，执行完了之后在任务队列里放个任务，告诉主线程可以继续往下执行了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VwwBqwbhLOMH8WmeSl8QKz8DLHjsk3v4BL1Pgia3FMxRDBGaYaCDIODw/640?wx_fmt=png)

因为这些异步任务是在别的线程执行完，然后通过任务队列通知下主线程，是一种事件机制，所以这个循环叫做 Event Loop。

这些在其他线程执行的异步任务包括定时器（setTimeout、setInterval），UI 渲染、网络请求（XHR 或 fetch）。

但是，现在的 Event Loop 有个严重的问题，没有优先级的概念，只是按照先后顺序来执行，那如果有高优先级的任务就得不到及时的执行了。所以，得设计一套插队机制。

那就搞一个高优先级的任务队列就好了，每执行完一个普通任务，都去把所有高优先级的任务给执行完，之后再去执行普通任务。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VJ4tHubRfictqIbHOnOR3OXQZ7vkYk7jVlXhSYUN3O6r1BhBKRYPIK0Q/640?wx_fmt=png)

有了插队机制之后，高优任务就能得到及时的执行。

这就是现在浏览器的 Event Loop。

其中普通任务叫做 MacroTask（宏任务），高优任务叫做 MicroTask（微任务）。

**宏任务包括：setTimeout、setInterval、requestAnimationFrame、Ajax、fetch、script 标签的代码。**

**微任务包括：Promise.then、MutationObserver、Object.observe。**

怎么理解宏微任务的划分呢？

定时器、网络请求这种都是在别的线程跑完之后通知主线程的普通异步逻辑，所以都是宏任务。

而高优任务的这三种也很好理解，MutationObserver 和 Object.observe 都是监听某个对象的变化的，变化是很瞬时的事情，肯定要马上响应，不然可能又变了，Promise 是组织异步流程的，异步结束调用 then 也是很高优的。

这就是浏览器里的 Event Loop 的设计：**设计 Loop 机制和 Task 队列是为了支持异步，解决逻辑执行阻塞主线程的问题，设计 MicroTask 队列的插队机制是为了解决高优任务尽早执行的问题。**

但是后来，JS 的执行环境不只是浏览器一种了，还有了 Node.js，它同样也要解决这些问题，但是它设计出来的 Event Loop 更细致一些。

Node.js 的 Event loop
--------------------

Node.js 是一个新的 JS 运行环境，它同样要支持异步逻辑，包括定时器、IO、网络请求，很明显，也可以用 Event Loop 那一套来跑。

但是呢，浏览器那套 Event Loop 就是为浏览器设计的，对于做高性能服务器来说，那种设计还是有点粗糙了。

哪里粗糙呢？

浏览器的 Event Loop 只分了两层优先级，一层是宏任务，一层是微任务。但是宏任务之间没有再划分优先级，微任务之间也没有再划分优先级。

而 Node.js 任务宏任务之间也是有优先级的，比如定时器 Timer 的逻辑就比 IO 的逻辑优先级高，因为涉及到时间，越早越准确；而 close 资源的处理逻辑优先级就很低，因为不 close 最多多占点内存等资源，影响不大。

于是就把宏任务队列拆成了五个优先级：Timers、Pending、Poll、Check、Close。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VDpKcmWapTgC9Ducn45KDdV2g3gbQdhygmJuspX4GYvfSQn7Cq0CmRA/640?wx_fmt=png)

解释一下这五种宏任务：

**Timers Callback**：涉及到时间，肯定越早执行越准确，所以这个优先级最高很容易理解。

**Pending Callback**：处理网络、IO 等异常时的回调，有的 *niux 系统会等待发生错误的上报，所以得处理下。

**Poll Callback**：处理 IO 的 data，网络的 connection，服务器主要处理的就是这个。

**Check Callback**：执行 setImmediate 的回调，特点是刚执行完 IO 之后就能回调这个。

**Close Callback**：关闭资源的回调，晚点执行影响也不到，优先级最低。

所以呢，Node.js 的 Event Loop 就是这样跑的了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VbhnqickdbicAHdeuUicDWXlf9AS0TNTFckPPUwQYzpkZ9JlwsOVtMb3bw/640?wx_fmt=png)

还有一点不同要特别注意：

**Node.js 的 Event Loop 并不是浏览器那种一次执行一个宏任务，然后执行所有的微任务，而是执行完一定数量的 Timers 宏任务，再去执行所有微任务，然后再执行一定数量的 Pending 的宏任务，然后再去执行所有微任务，剩余的 Poll、Check、Close 的宏任务也是这样。**

为什么这样呢？

其实按照优先级来看很容易理解：

假设浏览器里面的宏任务优先级是 1，所以是按照先后顺序依次执行，也就是一个宏任务，所有的微任务，再一个宏任务，再所有的微任务。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VDoSf9ex503icbvx2yBP2CKibMbGCmliaMAGHK4x6GnHfkQufONPjm6kEg/640?wx_fmt=png)

而 Node.js 的 宏任务之间也是有优先级的，所以 **Node.js 的 Event Loop 每次都是把当前优先级的所有宏任务跑完再去跑微任务，然后再跑下一个优先级的宏任务。**

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VxR29iaf1DmMfG0kgTEACzhE9NQyh5aV09xbQ6a5W9lbBzVE39J9jPrw/640?wx_fmt=png)

也就是是一定数量的 Timers 宏任务，再所有微任务，再一定数量的 Pending Callback 宏任务，再所有微任务这样。

为什么说是一定数量呢？

因为如果某个阶段宏任务太多，下个阶段就一直执行不到了，所以有个上限的限制，剩余的下个 Event Loop 再继续执行。

除了宏任务有优先级，微任务也划分了优先级，多了一个 process.nextTick 的高优先级微任务，在所有的普通微任务之前来跑。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VkkHuibKNo17qGLpM9TfSvlYIMBkOHmmK1mDAicia8I3RdaW20bJkia0FKA/640?wx_fmt=png)

所以，Node.js 的 Event Loop 的完整流程就是这样的：

*   **Timers 阶段**：执行一定数量的定时器，也就是 setTimeout、setInterval 的 callback，太多的话留到下次执行
    
*   微任务：执行所有 nextTick 的微任务，再执行其他的普通微任务
    
*   **Pending 阶段**：执行一定数量的 IO 和网络的异常回调，太多的话留到下次执行
    
*   微任务：执行所有 nextTick 的微任务，再执行其他的普通微任务
    
*   **Idle/Prepare 阶段**：内部用的一个阶段
    
*   微任务：执行所有 nextTick 的微任务，再执行其他的普通微任务
    
*   **Poll 阶段**：执行一定数量的文件的 data 回调、网络的 connection 回调，太多的话留到下次执行。**如果没有 IO 回调并且也没有 timers、check 阶段的回调要处理，就阻塞在这里等待 IO 事件**
    
*   微任务：执行所有 nextTick 的微任务，再执行其他的普通微任务
    
*   **Check 阶段**：执行一定数量的 setImmediate 的 callback，太多的话留到下次执行。
    
*   微任务：执行所有 nextTick 的微任务，再执行其他的普通微任务
    
*   **Close 阶段**：执行一定数量的 close 事件的 callback，太多的话留到下次执行。
    
*   微任务：执行所有 nextTick 的微任务，再执行其他的普通微任务
    

比起浏览器里的 Event Loop，明显复杂了很多，但是经过我们之前的分析，也能够理解：

**Node.js 对宏任务做了优先级划分，从高到低分别是 Timers、Pending、Poll、Check、Close 这 5 种，也对微任务做了划分，也就是 nextTick 的微任务和其他微任务。执行流程是先执行完当前优先级的一定数量的宏任务（剩下的留到下次循环），然后执行 process.nextTick 的微任务，再执行普通微任务，之后再执行下个优先级的一定数量的宏任务。。这样不断循环。其中还有一个 Idle/Prepare 阶段是给 Node.js 内部逻辑用的，不需要关心。**

改变了浏览器 Event Loop 里那种一次执行一个宏任务的方式，可以让高优先级的宏任务更早的得到执行，但是也设置了个上限，避免下个阶段一直得不到执行。

还有一个特别要注意的点，就是 poll 阶段：**如果执行到 poll 阶段，发现 poll 队列为空并且 timers 队列、check 队列都没有任务要执行，那么就阻塞的等在这里等 IO 事件，而不是空转。** 这点设计也是因为服务器主要是处理 IO 的，阻塞在这里可以更早的响应 IO。

完整的 Node.js 的 Event Loop 是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VJOcVia6DM6kOhRqmmqCjHV5ouPwWnjNHOVFlN3tOhx6ticz9mWDGXOoQ/640?wx_fmt=png)

对比下浏览器的 Event Loop：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaRZdRUcySmejFc7XtHkc7VoRb09NcMgP8x3FmfHsTrXiboNCaXoWx8hkRLAKs39NYd4JyIviawDPWQ/640?wx_fmt=png)

两个 JS 运行环境的 Event Loop 整体设计思路是差不多的，只不过 Node.js 的 Event Loop 对宏任务和微任务做了更细粒度的划分，也很容易理解，毕竟 Node.js 面向的环境和浏览器不同，更重要的是服务端对性能的要求会更高。

总结
--

JavaScript 最早是用于写网页交互逻辑的，为了避免多线程同时修改 dom 的同步问题，设计成了单线程，又为了解决单线程的阻塞问题，加了一层调度逻辑，也就是 Loop 循环和 Task 队列，把阻塞的逻辑放到其他线程跑，从而支持了异步。然后为了支持高优先级的任务调度，又引入了微任务队列，这就是**浏览器的 Event Loop 机制：每次执行一个宏任务，然后执行所有微任务。**

Node.js 也是一个 JS 运行环境，想支持异步同样要用 Event Loop，只不过服务端环境更复杂，对性能要求更高，所以 Node.js 对宏微任务都做了更细粒度的优先级划分：

Node.js 里划分了 5 种宏任务，分别是 Timers、Pending、Poll、Check、Close。又划分了 2 种微任务，分别是 process.nextTick 的微任务和其他的微任务。

**Node.js 的 Event Loop 流程是执行当前阶段的一定数量的宏任务（剩余的到下个循环执行），然后执行所有微任务，一共有 Timers、Pending、Idle/Prepare、Poll、Check、Close 6 个阶段。订正：11 后又改为了一个宏任务所有微任务**

其中 Idle/Prepare 阶段是 Node.js 内部用的，不用关心。

**特别要注意的是 Poll 阶段，如果执行到这里，poll 队列为空并且 timers、check 队列也为空，就一直阻塞在这里等待 IO，直到 timers、check 队列有回调再继续 loop 。**

Event Loop 是 JS 为了支持异步和任务优先级而设计的一套调度逻辑，针对浏览器、Node.js 等不同环境有不同的设计（主要是任务优先级的划分粒度不同），Node.js 面对的环境更复杂、对性能要求更高，所以 Event Loop 设计的更复杂一些。

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNAwfITg4YV29uSdjzeu5TianfNF4GxRloxGjYnDmsXeLeaiaxc3JplwWTTlaDU8tr50srgXqHe3Gr4Q/640?wx_fmt=gif)

**彦祖，点个****「在看」**吧