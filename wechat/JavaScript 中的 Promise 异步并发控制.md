> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ygdlz5_aOhfyp24Zg_Qzfw)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980HC8X81RYX3CB8lwQkkGsQjhL4OiaohwfcYxAGTzWlyCLIn1NTZgpxOYTIQyPicJheia23ug4zYq92UA/640?wx_fmt=jpeg)

前端开发或 Node.js 开发中，经常会遇到并发请求的场景，针对这些场景，我们怎么进行限制呢？

我们在开发的过程中，经常会遇到一些并发的情况，而如果并发量比较大时，需要进行限制。比如可能出现的场景：

1.  传入多个异步请求，但最多只能触发 limit 个请求；额外的功能，所有的请求都执行完后，返回成功；
    
2.  生成一个新函数，调用多次发起请求，但有并发限制；
    
3.  多个 Promise 按顺序执行，这个其实可以认为并发数限制是 1，但我们可以用另一种方式来实现；
    

、![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980E2K3psIpmIaiaFN87p0WqFAtWynJthFRC2SxArPxlAYRgMlOuzaeIxiaevxMzc3JKIZurVXy8gMmlQ/640?wx_fmt=png)

1. 多个异步请求的并发限制
--------------

有一系列的异步请求，比如爬虫抓取、后端接口请求、图片加载等场景，需要限制下并发请求的数量。这里要考虑下结果的处理，是每个请求完成后就可以了，还是要收集到所有的结果，类似于 Promise.all() 的效果。

### 1.1 递归的方式

思路大概是：首先发起 limit 个的请求，哪个完成了就递归发起下一个异步请求，所有的请求都完成后，则整体返回一个 Promise。如果不需要收集所有的数据，则不用写这个 Promise。

```
/** * 递归方式实现异步并发控制 * @param arr 所有的数据集合，如请求的url等 * @param limit 限制并发的个数 * @param iteratorFn 对每个数据的处理 */const promiseLimitByDepth = <T>(arr: T[], limit: number, iteratorFn: (item: T, urls?: T[]) => Promise<any>) => {  const { length } = arr;  const result = [];  let i = 0;  let finishedNum = 0; // 完成的个数  // 若不考虑最后数据的收集，可以不写这个Promise  return new Promise((resolve) => {    const request = async (index: number) => {      kk.show(arr[index], index);      const p = Promise.resolve().then(iteratorFn(arr[index]));      const res = await p;      result[index] = res;      finishedNum++;      if (finishedNum === length) {        resolve(result);      }      if (i < length) {        request(i);        i++;      }    };    for (; i < limit; i++) {      request(i);    }  });};
```

这里我们用 setTimeout 来模拟下异步请求。

```
const newFetch = (delay) => {  return new Promise((resolve) => {    setTimeout(() => {      resolve(delay);    }, delay);  });};
```

调用方式：

```
promiseLimitByDepth([2000, 1000, 3000, 2500, 1200, 5000, 3500, 2300], 2, (num) => {  return newFetch(num);}).then(console.log);
```

您可以查看 demo：https://www.xiabingbao.com/demos/promise-limit-depth-rfqkb2.html。在 demo 中可以看到，控制着同一时刻的请求个数，某一个请求结束后，再启动下一个请求。

上面的代码还可以用来控制图片的加载：

```
const arr = [];let i = 10;while (i--) {  arr.push(`https://www.xiabingbao.com/upload/368662d904df5cbe4.jpg?t=${Math.random()}`);}promiseLimitByDepth(arr, 2, (url) => {  return new Promise((resolve) => {    const img = new Image();    img.src = url;    // 这里暂时只考虑成功的情况    img.onload = resolve;  });}).then(console.log);
```

我们从图片加载的瀑布流里可以看到，每次最多只加载 2 张图片：

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980E2K3psIpmIaiaFN87p0WqFAK1aRqgk9OXW1vNJkAribibFeMh7YIicV1F9qaYqG6KEvj7coGQib2K9kTw/640?wx_fmt=png)每次最多只加载 2 张图片

### 1.2 循环的方式

使用循环的方式，肯定得用到 async-await 了。

```
const promiseLimitByCycle = async <T>(arr: T[], limit: number, iteratorFn: (item: T, arr?: T[]) => Promise<any>) => {  const { length } = arr;  const result: Promise<any>[] = [];  const runningList: Promise<any>[] = []; // 正在执行的异步任务  for (const url of arr) {    const p = Promise.resolve().then(iteratorFn(url)); // 转为promise    result.push(p);    // 若limit大于length，则不再进行控制，直接用Promise.all()即可    if (limit <= length) {      const e = p.then(() => {        // promise p 执行完毕时，会触发这个，这个是后执行的，先执行的是下面的push操作        const index = runningList.indexOf(e);        // 当p执行成功的时候，从runningList中删除该Promise，同时也会触发下面的Promise.race()        return runningList.splice(index, 1);      });      // promise e 是 p执行的过程，若p执行成功，则e.value就是p.then()里的return的值      runningList.push(e);      // 超过限制，则先存储起来      if (runningList.length >= limit) {        // 哪个先完成，都会触发race，然后进入下一层循环        await Promise.race(runningList);      }    }  }  // 所有的都完成了，才最后返回结果  return Promise.all(result);};
```

上面有段代码比较绕，我们再单独拿出来讲解下：

```
// Promise是可以链式调用的，then()本身返回的就是Promise// 因此e是p.then()的返回值，e自己也是Promise// e.then()什么时候执行，取决于p.then()什么执行，又再取决于p什么时候执行// const e = p.then()是同步执行的，因此先得到的变量e，再执行的p.then()里的操作// 当p执行完成后，则就执行p.then()里的操作，找出e所在的位置并进行删除// e.then()回调里的值据说splice()的返回值，其实就是e，但这里我们并不用关心他的返回值是什么const e = p.then(() => {  const index = runningList.indexOf(e);  return runningList.splice(index, 1);});runningList.push(e);// 这里监听的是runningList，即里面的某个e完成了，就会触发Promise.race()// 若e完成了，必然p也是完成了的await Promise.race(runningList);
```

这里充分用到了`Promise.all()`和`Promise.race()`的特性，来实现的。

![](https://mmbiz.qpic.cn/mmbiz_jpg/b77xA98980E2K3psIpmIaiaFN87p0WqFAfRaKbMicFdCXgRpWMlyia77fI0T8jOiamjGxWNvaQ3QB6ES0ZTtcWAfoA/640?wx_fmt=jpeg)

2. 新函数的并发限制
-----------

我们来简单描述下题目：创建返回一个新函数，在调用这个新函数产生异步请求时，有并发的限制。

```
// 创建返回一个新函数，在调用这个新函数产生异步请求时，限制并发的数量// 问，如何实现这个create方法？const createFetch = (limit) => {  return () => {};};const newFetch = createFetch(2); // 最多只能并发2个newFetch(url);newFetch(url);newFetch(url);newFetch(url);
```

这里参考了 npm 包 p-queue 的源码，并对其进行了精简。新函数 newFetch() 每次都是要返回一个 Promise 的，就看什么时候执行 resolve()，并启动下一个。

```
const createFetch = (limit) => {  let runningNum = 0; // 当前正在进行的数量  const queue = []; // 所有将要执行的任务队列  // 尝试启动下一个任务  const tryNextOne = () => {    if (queue.length === 0) {      return false;    }    if (runningNum < limit) {      // 若没有达到限制，则直接启动      const job = queue.shift();      if (!job) {        return false;      }      job();      return true;    }    return false;  };  // 返回一个新函数，新函数里直接返回一个Promise  return (url, iteratorFn) => {    return new Promise((resolve) => {      // 定义一个函数，但不立即执行      const run = async () => {        runningNum++; // 启动一个任务，数量+1        const result = await Promise.resolve(iteratorFn(url));        resolve(result);        runningNum--; // 完成一个任务，数量-1        tryNextOne(); // 启动下一个任务      };      queue.push(run); // 将所有的任务，都推送到队列中      tryNextOne(); // 启动队列中任务的入口    });  };};
```

我们用 sleep() 函数模拟下：

```
const sleep = (delay) => {  return new Promise((resolve) => {    setTimeout(() => {      resolve(delay);    }, delay);  });};const newFetch = createFetch(2);for (let i = 0; i < 10; i++) {  console.log(`${i} start`);  newFetch(i, async (i) => {    await sleep(600 + 10 * i);    return `${i}`;  }).then((i) => {    console.log(`${i} end`);  });}
```

3. 多个异步任务的顺序执行
--------------

我们其实把上面实现的一些函数，并发数量设置为 1，就是多个异步任务的顺序执行了。不过我们这里还有一些其他的方式。

### 3.1 async-wait

把所有的异步任务都放到数组中，然后用 async-wait 的方式来控制：

```
const arr = [600, 500, 400, 700, 300, 450];const asyncLoop = async (arr, iteratorFn) => {  const result = [];  for (const item of arr) {    console.log(`${item} start`);    const res = await Promise.resolve(iteratorFn(item));    console.log(`${res} end`);    result.push(res);  }  return result;};asyncLoop(arr, (item) => {  return sleep(item);});
```

### 3.2 纯 Promise

如果不使用 async-await，用 Promise 可以实现吗？

Promise 是异步的，在一个同步流程中，是无法等待这个 Promise 完成的，因此这里我用递归的方式来实现的。

```
const promiseLoop = (arr, iteratorFn) => {  const result = [];  return new Promise((allResolve) => {    const run = (index = 0) => {      if (index < arr.length) {        return new Promise((resolve) => {          const p = Promise.resolve(iteratorFn(arr[index]));          p.then((res) => {            console.log(res);            result.push(res);            resolve(res);            if (index + 1 < arr.length) {              // 上一个Promise完成后，启动下一个              run(index + 1);            } else {              // 若全部都完成了，则执行最外层的Promise              allResolve(result);            }          });        });      }    };    run();  });};
```

使用方式与上面的一样：

```
promiseLoop(arr, (item) => {  return sleep(item);}).then(console.log);
```

4. 同时请求，但按顺序输出
--------------

如并发请求一些数据，结果按照请求顺序依次输出，而且要尽可能早的输出结果。

如 a,b,c 三个请求并发请求：

*   a 需要 200ms；
    
*   b 需要 100ms；
    
*   c 需要 300ms；
    

即使 b 先完成，也得等着 a 完成输出结果后，b 再输出，c 稍后完成后，再输出 c 的结果。等所有的请求都执行完毕后，再整体按照顺序返回请求的结果。

我实现的思路是在后面的请求先完成的，则将结果先存储起来，等前面的请求完成后，再一并输出。

```
// 并发请求但顺序输出const concurrentAndSyncLog = (arr, iteratorFn) => {  const { length } = arr;  const list = new Array(length).fill({ fulfilled: false, value: null }); // fulfilled表示数据是否已准备好  let showStart = 0; // 开始输出的位置  let fulfilledNum = 0; // 完成的个数  return new Promise((resolve) => {    for (let i = 0; i < length; i++) {      const p = Promise.resolve(iteratorFn(arr[i]));      p.then((result) => {        list[i] = { fulfilled: true, value: result };        fulfilledNum++;        if (i === showStart) {          let j = showStart;          while (j < length) {            if (list[j].fulfilled) {              // 输出所有完成的数据              console.log(list[j].value);            } else {              // 当前位置的数据还没准备好，直接停止，并设置下次输出的位置              showStart = j;              break;            }            j++;          }        }        if (fulfilledNum >= length) {          resolve(list.map((item) => item.value));        }      });    }  });};
```

调用：

```
concurrentAndSyncLog([200, 100, 300], sleep).then(console.log);// 200, 100, 300// [200, 100, 300]
```

5. 总结
-----

JavaScript 中对 Promise 的异步并发的控制，更多地是考察我们对 Promise 中一些知识点的运用和和深刻理解。比如 Promise.race()，Promise.all() 等方法的使用，还有 Promise 的链式调用、等待机制等。

我们之前在之前的文章[实现 Promise 的 first 等各种变体](https://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653283525&idx=1&sn=7cf9386f8d9ae3d5aa248fb5bd782973&chksm=8b43704ebc34f958e488a8c3adf3d2e4b43903fae1f23334d2573f9cd3dfcc9ea7d6c9e59ac0&scene=21#wechat_redirect)中，也是运用了 Promise 的各种机制，来实现一些 Promise 本身不支持的功能。这篇文章希望能更加加深我们 Promise 的理解。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yfOA9oevy0kdQdJCFd1WibyibnZAdiaOgsycXHrAGUPoEZYU8OueicPkn2KQ/640?wx_fmt=png)

[2023 年最新最全的 http 网络面试题](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284995&idx=1&sn=07a7b106ece926d7b1d43e629617d3b0&chksm=8b437e08bc34f71ec5916c284a1e60b59b2c12cd8e10ed87d90b5609944a7cb3b9e1c8e9e22d&scene=21#wechat_redirect)  

[2023 年最新最全的 React 面试题](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284927&idx=1&sn=afb56f99533b7404b4fe52aea2eec154&chksm=8b437eb4bc34f7a27acf4694c6219ae4ec172b78b651e8ca4577115ac000052f7348266b28b7&scene=21#wechat_redirect)  

[打那么多算法竞赛，找工作却找了个开发岗？](http://mp.weixin.qq.com/s?__biz=MzA5ODM5NTYyMA==&mid=2653284833&idx=1&sn=d0e055db359e120bf34929141b5c940f&chksm=8b437d6abc34f47cc7ee594575ecf03993e9469538eaae686fc5da118d725d5ea294ea7fc5da&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0Nwt7qqUywpNb0He4PpaGj3yf529Acb1YkfG4Qd7ibPI86cFsibe9xbaVPMsrFOicZniabLMocx5EOC1LRQ/640?wx_fmt=jpeg)

▼我是小小的前端开发工程师，

长按识别二维码关注，与大家共同学习▼  

![](https://mmbiz.qpic.cn/mmbiz_png/b77xA98980FhicYXcqe4JKmNQX3IibTo2grYBrUjFDr754PDwjYc8MrhqYibqXiap2GQKIsaoSE4rJjawIa5GFiaW2Q/640?wx_fmt=png)