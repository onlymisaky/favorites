> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Z5wkiePQc4mzO5Ub4dBOcA)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言

探讨了在 JavaScript 中分解长任务的多种方法，并分析了每种方法的特点和适用场景。今日文章作者 @Alex MacArthur ，关于本文译者：前端早读课文 @飘飘  
原文：https://macarthur.me/posts/long-tasks/

有意将耗时且昂贵的任务拆分到事件循环的多个周期中执行，这是非常常见的做法。但可供选择的方法确实很多。让我们来探讨一下。

如果让一个耗时且资源消耗大的任务占用主线程，很容易破坏网站的用户体验。无论应用程序变得多复杂，事件循环一次仍然只能处理一件事。如果你的代码占用了它，其他所有操作都将处于待机状态，通常用户很快就会察觉到。

来看一个简单的例子：我们在屏幕上有一个用于递增计数的按钮，旁边还有一个大大的循环在执行一些繁重的工作。它只是在运行一个同步暂停，但假设这是你出于某种原因需要在主线程上按顺序执行的有意义的操作。

```
 <button id="button">count</button>
<div>Click count:<span id="clickCount">0</span></div>
<div>Loop count:<span id="loopCount">0</span></div>

<script>
   functionwaitSync(milliseconds){
     const start = Date.now();
     while(Date.now()- start < milliseconds){}
   }

   button.addEventListener("click",()=>{
     clickCount.innerText =Number(clickCount.innerText)+1;
   });

   const items =newArray(100).fill(null);

   for(const i of items){
     loopCount.innerText =Number(loopCount.innerText)+1;
     waitSync(50);
   }
</script>

```

运行这段代码后，界面上不会有任何视觉更新，甚至循环计数也没有。这是因为浏览器根本没有机会将内容绘制到屏幕上。无论你点击得多快，得到的结果都一样。只有当循环完全结束后，你才会得到任何反馈。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUSYn55ichQ8ASxYmgpdTU8ousGB6Vv9mrbHqg5RSMpNliaJOe3zRlW3zQ/640?wx_fmt=gif&from=appmsg)

开发工具中的火焰图证实了这一点。事件循环中的那个单一任务需要五秒钟才能完成。太糟糕了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVU9XFyGk3e9TpVy6So5kXAjTYOMjMFzOFfGpGEN6GcM3ibYwwC3ndhGBg/640?wx_fmt=png&from=appmsg)

如果你遇到过类似的情况，你就知道解决办法是将那个大任务在事件循环的多个周期中分批处理。这能让浏览器的其他部分有机会使用主线程来处理其他重要的事情，比如处理按钮点击和重绘。我们希望从这种情况转变为：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUlo0NAiapMdXruw9OicoPGNYAzB8LdicQtVa7qjIZL3s1s61seictsericWA/640?wx_fmt=png&from=appmsg)

变成这样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUZJhEQlI17L3BgFkxI3cdT2y8bRtGT1fk4yWZjataOadjDs1piafT34Q/640?wx_fmt=png&from=appmsg)

实际上，实现这一目标的方法多得惊人。我们将探讨其中的一些方法，首先从最经典的递归开始。

#### 1：`setTimeout()` + 递归

如果你在原生 [Promise](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272722&idx=1&sn=03573640596631100fa6fbbb8b764d5f&scene=21#wechat_redirect) 出现之前编写过 JavaScript 代码，那么你肯定见过类似这样的情况：一个函数在超时回调中递归地调用自身。

```
 function processItems(items, index){
   index = index ||0;
   var currentItem = items[index];

   console.log("processing item:", currentItem);

   if(index +1< items.length){
     setTimeout(function(){
       processItems(items, index +1);
     },0);
   }
}

processItems(["a","b","c","d","e","f","g","h","i","j"]);

```

即使在今天，这种方法依然可行。毕竟目标已经达成 —— 每个项目都在不同的时钟周期内处理，从而分散了工作量。看看这个火焰图中 400 毫秒的部分。我们得到的不是一项大任务，而是一堆较小的任务：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVU8ibv7vhWZLzw3PeGB4oTdpD6fUTkBICzpBJx9ia4hwRHTPDHUNRvBY4Q/640?wx_fmt=png&from=appmsg)

这样就能让用户界面保持良好且响应迅速。点击处理程序可以正常工作，浏览器也能将更新绘制到屏幕上：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVU1ghd1JK4OjYXBhlWcoaVA4fzPV4M0kTTaCts9HibI6ga9TlYt1jOmVw/640?wx_fmt=gif&from=appmsg)

但如今距离 ES6 已经过去了十年，浏览器提供了多种方式来实现同样的效果，而且借助 Promise，所有这些方式提高了使用便捷性。

#### 2: Async/Await & Timeout

这种组合使我们能够摒弃递归，并稍微简化一下：

[【第 2344 期】Javascript 是如何工作的：事件循环及异步编程的出现和 5 种更好的 async/await 编程方式](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651248200&idx=1&sn=e49f67f2c3e8a799a719b86205957a35&scene=21#wechat_redirect)

```
 <button id="button">count</button>
<div>Click count:<span id="clickCount">0</span></div>
<div>Loop count:<span id="loopCount">0</span></div>

<script>
   functionwaitSync(milliseconds){
     const start = Date.now();
     while(Date.now()- start < milliseconds){}
   }

   button.addEventListener("click",()=>{
     clickCount.innerText =Number(clickCount.innerText)+1;
   });

   (async()=>{
     const items =newArray(100).fill(null);

     for(const i of items){
       loopCount.innerText =Number(loopCount.innerText)+1;

       awaitnewPromise((resolve)=>setTimeout(resolve,0));

       waitSync(50);
     }
   })();
</script>

```

好多了。只需要一个简单的 for 循环，并等待一个 promise 解决。事件循环的节奏非常相似，有一个关键的变化，用红色标出：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVU4ESh1CicV1yuqzJpJzTVuGoDiaibfH3pgbb6Xv6DA9ZkqsGLIwhuh79kg/640?wx_fmt=png&from=appmsg)

Promise 的 `.then()` 方法总是在微任务队列中执行，在调用栈中的所有其他操作完成后进行。这几乎总是微不足道的差异，但仍值得留意。

#### 3: scheduler.postTask()

Scheduler 接口是 Chromium 浏览器相对较新的功能，旨在成为一种一流的工具，用于以更多的控制和更高的效率来安排任务。它基本上是几十年来我们一直依赖的 `setTimeout()` 的更高级版本。

[【第 1977 期】探索 React 的内在 - postMessage 和 Scheduler](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651237374&idx=2&sn=ba15a5689d9e04bc76ecd63a77bac348&scene=21#wechat_redirect)

```
 const items =newArray(100).fill(null);

for(const i of items){
   loopCount.innerText =Number(loopCount.innerText)+1;

   awaitnewPromise((resolve)=> scheduler.postTask(resolve));

   waitSync(50);
 }

```

用 `postTask()` 运行我们的循环有趣的地方在于计划任务之间的时间间隔。这是 400 毫秒火焰图的又一个片段。请注意，每个新任务在前一个任务之后执行得多么紧密。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUCKyRajdiaboMypxqeZsJaqavcU86T8tkEru1spJqDaIBjW5pxpKdX2Q/640?wx_fmt=png&from=appmsg)

默认情况下， `postTask()` 的优先级为 “用户可见”，这似乎与 `setTimeout(() => {}, 0)` 的优先级相当。输出似乎总是与代码中运行的顺序一致：

```
 setTimeout(() => console.log("setTimeout"));
 scheduler.postTask(() => console.log("postTask"));

 // setTimeout
 // postTask

```

```
 scheduler.postTask(() => console.log("postTask"));
 setTimeout(() => console.log("setTimeout"));

 // postTask
 // setTimeout

```

但与 `setTimeout()` 不同， `postTask()` 是为调度设计的，并不受超时相同限制的约束。由它安排的所有任务都会被置于任务队列的前端，防止其他任务插队并延迟执行，尤其是在以如此快速的方式排队时。

我不能肯定，但我认为由于 `postTask()` 是一台有着单一目标的高效运转的机器，火焰图反映了这一点。话虽如此，但还是有可能进一步提高用 `postTask()` 调度的任务的优先级：

```
 scheduler.postTask(() => {
   console.log("postTask");
 }, { priority: "user-blocking" });

```

“用户阻塞” 优先级旨在用于对用户在页面上的体验至关重要的任务（例如响应用户输入）。因此，可能不值得仅仅为了拆分大型工作负载而使用它。毕竟，我们试图礼貌地让出事件循环，以便其他工作能够完成。实际上，甚至可能值得通过使用 “后台” 将该优先级设置得更低：

```
 scheduler.postTask(()=>{
   console.log("postTask - background");
},{priority:"background"});

setTimeout(()=> console.log("setTimeout"));

 scheduler.postTask(()=> console.log("postTask - default"));

// setTimeout
// postTask - default
 // postTask - background

```

不幸的是，整个调度器接口存在一个缺陷：目前它在所有浏览器中的支持情况并不理想。不过，借助现有的异步 API 进行填充还是相当容易的。因此，至少会有很大一部分用户从中受益。

##### 那 requestIdleCallback () 怎么样？

如果像这样放弃优先级是好的，那么 `requestIdleCallback()` 可能会浮现在脑海中。它被设计为在出现 “空闲” 期时执行其回调函数。但它的问题是，没有技术上的保证来确定它何时或是否会运行。你可以在调用时设置一个 timeout ，但即便如此，你仍需面对这样一个事实，即 Safari 完全不支持该 API 。

除此之外，MDN 建议对于必要的工作设置超过 `requestIdleCallback()` 的超时时间，所以出于这个目的，我可能根本就不会使用它。

#### 4：`scheduler.yield()`

在调度器接口上的 `yield()` 方法比我们之前介绍的其他方法稍微特殊一些，因为它正是为这种场景而设计的。来自 MDN：

Scheduler 接口的 `yield()` 方法用于在任务执行期间让出主线程，并稍后继续执行，其后续执行被安排为优先级任务…… 这使得长时间运行的工作得以拆分，从而使浏览器保持响应。

当你第一次使用它时，这一点就变得更加清晰了。不再需要返回并解决我们自己的承诺。只需等待所提供的那个即可：

```
 const items =newArray(100).fill(null);

for(const i of items){
   loopCount.innerText =Number(loopCount.innerText)+1;

   await scheduler.yield();

   waitSync(50);
 }

```

它也让火焰图清晰了一些。注意栈中需要识别的项目少了一个。

此 API 非常出色，以至于你会情不自禁地开始在各处寻找使用它的机会。考虑一个复选框，在 change 时触发一项昂贵的任务：

```
 document
   .querySelector('input[type="checkbox"]')
   .addEventListener("change", function (e) {
     waitSync(1000);
 });

```

实际上，点击复选框会导致用户界面冻结一秒钟。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUHnqKtRTVC5dFlOgGUL5cW5STGuy6slEDkqhkA59EcQdeDQB9AsD2pg/640?wx_fmt=gif&from=appmsg)

但现在，让我们立即将控制权交给浏览器，让它有机会在点击之后更新那个用户界面。

```
 document
   .querySelector('input[type="checkbox"]')
   .addEventListener("change", async function (e) {
 +    await scheduler.yield();

     waitSync(1000);
 });

```

瞧瞧那个。简洁明快。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUUVA0wjEbIUyXQXZdbvrMTO3xAFEYpUK3YNCtib4bRS3xNk4OkDn4rmg/640?wx_fmt=gif&from=appmsg)

与调度器界面的其他部分一样，这个也缺乏稳定的浏览器支持，但仍然简单到可以通过 polyfill 来弥补：

```
 globalThis.scheduler = globalThis.scheduler || {};
 globalThis.scheduler.yield =
   globalThis.scheduler.yield ||
   (() => new Promise((r) => setTimeout(r, 0)));

```

#### 5: `requestAnimationFrame()`

`requestAnimationFrame()` API 旨在根据浏览器的重绘周期安排工作。因此，它在调度回调方面非常精确。它总是会在下一次重绘之前，这或许能解释为何此火焰图中的任务安排得如此紧凑。动画帧回调函数实际上拥有自己的 “队列”，在渲染阶段的特定时间运行，这意味着其他任务很难插队将其挤到队列的末尾。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVU3qnqctdmjq8QzhXOJ9FfQ5Ofpeq8vjpxeUc8Hrla0qCVRTLQRE0D9w/640?wx_fmt=png&from=appmsg)

然而，围绕重绘进行昂贵的工作似乎也会影响渲染效果。看看同一时间段内的帧。黄色 / 带线的部分表示 “部分呈现的帧”：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUAkmEliaSaj2QCdkwyK5s8rmcKrmiavTQia7RDjJ6gtRiaOLHPHTWDAZKnQ/640?wx_fmt=png&from=appmsg)

这种情况在其他任务拆分策略中并未出现。考虑到这一点以及动画帧回调通常只有在标签页处于活动状态时才会执行，我可能也会避开这个选项。

#### 6: `MessageChannel()`

你不会经常看到这种用法，但当你确实看到时，它通常被选作零延迟超时的一种更轻量级的替代方案。与其让浏览器排队计时器并安排回调，不如实例化一个通道并立即向其发送消息：

```
 for (const i of items){
   loopCount.innerText =Number(loopCount.innerText)+1;

   awaitnewPromise((resolve)=>{
     const channel =newMessageChannel();
     channel.port1.onmessage =resolve();
     channel.port2.postMessage(null);
   });

   waitSync(50);
 }

```

从火焰图来看，性能方面或许有话可说。每个计划任务之间的延迟时间并不长：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUiajlQNmwBzbmsKoiaaiczSX5k983GUx9oYwwgDmIrOnfgl5u02tNGtwbA/640?wx_fmt=png&from=appmsg)

不过，这种方法（主观上的）缺点在于接线太复杂。很明显，这并非其设计初衷。

#### 7: Web Workers

我们之前说过别的，但如果你能将工作从主线程中分离出来，那么毫无疑问，Web Worker 应该是你的首选。从技术上讲，你甚至不需要单独的文件来存放你的 Worker 代码：

```
 const items =newArray(100).fill(null);

const workerScript =`
   function waitSync(milliseconds) {
     const start = Date.now();
     while (Date.now() - start < milliseconds) {}
   }

   self.onmessage = function(e) {
     waitSync(50);
     self.postMessage('Process complete!');
   }
 `;

const blob =newBlob([workerScript],{type:"text/javascipt"});
const worker =newWorker(window.URL.createObjectURL(blob));

for(const i of items){
   worker.postMessage(items);

   awaitnewPromise((resolve)=>{
     worker.onmessage=function(e){
       loopCount.innerText =Number(loopCount.innerText)+1;
       resolve();
     };
   });
 }

```

只需看看当各个项目的具体工作在别处进行时，主线是多么清晰。相反，所有内容都被推到了下面的 “工人” 部分，从而为活动留出了大量空间。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/meG6Vo0MevgKslcGibtgEBiaALmfEw6zVUQFDw6TtzpgjYhfZMwpZeS3UolHxiarJyH8F2cR70zfagsmibrlNybJ0A/640?wx_fmt=png&from=appmsg)

我们一直在使用的场景要求在用户界面中体现进度，所以我们仍然将单个项目传递给工作线程并等待响应。但如果能一次性将整个项目列表传递给工作线程，那当然更好。这样能进一步减少开销。

#### 如何选择？

这里我们探讨的方法并非详尽无遗，但我认为它们很好地代表了在分解长任务时你应当考虑的各种权衡。不过，根据实际需求，我自己可能只会采用其中的一部分。

如果我能将工作从主线程中分离出来，那毫无疑问我会选择 Web Worker。它们在各浏览器中都得到了很好的支持，而且其存在的全部意义就是将工作从主线程中卸载。唯一的缺点是它们的 API 比较笨拙，但像 Workerize 和 Vite 内置的 Worker 导入这样的工具已经缓解了这个问题。

如果我需要一种极其简单的方式来拆分任务，我会选择 `scheduler.yield()` 。我不太喜欢还得为非 Chromium 用户添加 polyfill 这一点，但大多数人会从中受益，所以我愿意承担这额外的一点负担。

如果我需要对分块工作的优先级进行非常精细的控制，我会选择 `scheduler.postTask()` 。令人印象深刻的是，你可以根据自己的需求对其进行深度定制。优先级控制、延迟、取消任务等等都在这个 API 中有所涵盖，尽管和 .yield () 一样，目前它还需要进行填充。

如果浏览器的支持度和可靠性最为重要，那我就会选择 `setTimeout()` 。它是个传奇，即便有花哨的替代品出现，也不会消失。

#### 我错过了什么？

我承认其中有一些方法我从未在实际应用中使用过，所以你在这里读到的内容很有可能存在一些盲点。如果你能对这个话题进一步阐述，哪怕只是对其中某一种具体方法的见解，也请你畅所欲言。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```