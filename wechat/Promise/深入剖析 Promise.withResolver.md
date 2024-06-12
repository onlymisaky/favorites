> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RhmidhqXk8IvZeRLWJV8xw)

> 本文译者为 360 奇舞团前端开发工程师
> 
> 原文标题：ECMAScript 2024 feature: Promise.withResolvers()
> 
> 原文作者：Dr. Axel Rauschmayer
> 
> 原文地址：https://2ality.com/2024/05/proposal-promise-with-resolvers.html#why-not-promise-deferred

本文将着重探讨 ECMAScript 2024 年的新特性之一 -- "Promise.withResolvers"（由 Peter Klecha 提出）。该特性提供了一种直接创建 Promise 的新方法，可替代 new Promise(...)。

1. new Promise(...) – 构造函数模式
----------------------------

在使用 Promise.withResolvers() 之前，只有一种方法可以直接创建 Promise - 通过以下模式：

```
const promise = new Promise(<br style="visibility: visible;">  (resolve, reject) => {<br style="visibility: visible;">    // ---<br style="visibility: visible;">  }<br style="visibility: visible;">);<br style="visibility: visible;">
```

之所以这样做，根据 JavaScript 的 Promise API 设计团队的 Domenic Denicola 的说法是因为：

*   我之所以称其为 "揭示型构造器模式"，是因为 Promise 构造器正在揭示其内部功能，但仅限于向构造相关 Promise 的代码揭示。resolve 或 reject promise 的能力只透露给其构造者，关键是不会透露给使用 promise 的。因此任何人，如果我们将 p 移交给另一个消费者，例如
    

     doThingsWith(p)；

那么我们就可以确保，这个消费者不会扰乱构造函数向我们透露的任何内部信息。这有别于在 p 上放置任何人都可以调用的 resolve 和 reject。

> 举例来说，让我们将基于回调的函数转换为基于许诺的函数（注意，Node.js 确实有一个完整的基于许诺的 API，即 node:fs/promises）。

以下代码展示了使用基于回调的函数 fs.readFile() 的场景：

```
import * as fs from 'node:fs';fs.readFile('some-file.txt', 'utf-8', (error, result) => {  if (error !== null) {    console.error(error);    return;  }  assert.equal(    result,    'Content of some-file.txt'  );});
```

接下来让我们实现一个基于 Promise 的 fs.readFile() 版本：

```
import * as fs from 'node:fs';function readFileAsync(filePath, encoding) {  return new Promise(    (resolve, reject) => {      fs.readFile(filePath, encoding, (error, result) => {        if (error !== null) {          reject(error);          return;        }        resolve(result);      });    }  );}assert.equal(  await readFileAsync('some-file.txt', 'utf-8'),  'Content of some-file.txt');
```

2. Promise.withResolvers()
--------------------------

揭示构造器模式的一个限制是，settlement 函数 resolve 和 reject 不能离开 Promise 构造器回调，也不能与 Promise 分开使用。通过以下静态工厂可以解决这个问题：

```
const { promise, resolve, reject } = Promise.withResolvers();、
```

适用工厂函数就会像是下面这样：

```
{  const { promise, resolve, reject } = Promise.withResolvers();  resolve('fulfilled');  assert.equal(    await promise,    'fulfilled'  );}{  const { promise, resolve, reject } = Promise.withResolvers();  reject('rejected');  try {    await promise;  } catch (err) {    assert.equal(err, 'rejected');  }}
```

### 2.1 实现

我们可以如下实现 Promise.withResolvers()：

```
function promiseWithResolvers() {  let resolve;  let reject;  const promise = new Promise(    (res, rej) => {      // Executed synchronously!      resolve = res;      reject = rej;    });  return {promise, resolve, reject};}
```

该提案指出了有多少代码库实现了这一功能（这也是为什么现在将其内置到语言中确实是一个好消息）：React、Vue、Axios、TypeScript、Vite、Deno 标准库。

### 3. promise 化基于回调的函数

让我们重温一下之前实现的函数 readFileAsync()。使用新的 API，我们可以将其编写如下：

```
import * as fs from 'node:fs';function readFileAsync(filePath, encoding) {  const { promise, resolve, reject } = Promise.withResolvers();  fs.readFile(filePath, encoding, (error, result) => {    if (error !== null) {      reject(error);      return;    }    resolve(result);  });  return promise;}
```

这段代码与我们使用 Promise 构造函数时的代码大致相同。让我们继续讨论构造函数无法处理的用例。

4. 单元素队列
--------

```
class OneElementQueue {  #promise = null;  #resolve = null;  constructor() {    const { promise, resolve } = Promise.withResolvers();    this.#promise = promise;    this.#resolve = resolve;  }  get() {    return this.#promise;  }  put(value) {    this.#resolve(value);  }}{ // Putting before getting  const queue = new OneElementQueue();  queue.put('one');  assert.equal(    await queue.get(),    'one'  );}{ // Getting before putting  const queue = new OneElementQueue();  setTimeout(    // Runs after `await` pauses the current execution context    () => queue.put('two'),    0  );  assert.equal(    await queue.get(),    'two'  );}
```

5. 具有任意容量的队列
------------

PromiseQueue 是一个潜在的无限队列：

*   .get() 会阻塞，直到有一个值可用。
    
*   .put(value) 是非阻塞的 该代码是对基于 SES 的分布式安全 JavaScript 沙箱 Endo 软件包 stream 中函数 makeQueue() 的轻微重写。请查看该软件包，了解更多使用 makePromiseKit() 的代码，它等同于 Promise.withResolvers()。
    

```
class PromiseQueue {  #frontPromise;  #backResolve;  constructor() {    const { promise, resolve } = Promise.withResolvers();    this.#frontPromise = promise;    this.#backResolve = resolve;  }  put(value) {    const { resolve, promise } = Promise.withResolvers();    // By resolving, we add another (pending) element    // to the end of the queue    this.#backResolve({ value, promise });    this.#backResolve = resolve;  }  get() {    return this.#frontPromise.then(      (next) => {        this.#frontPromise = next.promise;        return next.value;      }    );  }}{ // Putting before getting  const queue = new PromiseQueue();  queue.put('one');  queue.put('two');    assert.equal(    await queue.get(),    'one'  );  assert.equal(    await queue.get(),    'two'  );}{ // Getting before putting  const queue = new PromiseQueue();  setTimeout(    // Runs after `await` pauses the current execution context    () => {      queue.put('one');      queue.put('two');    },    0  );  assert.equal(    await queue.get(),    'one'  );  assert.equal(    await queue.get(),    'two'  );}
```

每个队列元素都是 {value, promise} 的 Promise：

value 是存储在队列元素中的值。promise 是下一个（可能 pending 的）队列元素。队列的前面和后面：

前面是第一个队列元素（一个 Promise）。后面是最后一个（pending！）队列元素的 resolve 函数。

### 6. 可异步迭代的队列

```
class AsyncIterQueue {  #frontPromise;  #backResolve;  constructor() {    const { promise, resolve } = Promise.withResolvers();    this.#frontPromise = promise;    this.#backResolve = resolve;  }  put(value) {    if (this.#backResolve === null) {      throw new Error('Queue is closed');    }    const { resolve, promise } = Promise.withResolvers();    this.#backResolve({ done: false, value, promise });    this.#backResolve = resolve;  }  close() {    this.#backResolve(      { done: true, value: undefined, promise: null }    );    this.#backResolve = null;  }  next() {    if (this.#frontPromise === null) {      return Promise.resolve({done: true});    }    return this.#frontPromise.then(      (next) => {        this.#frontPromise = next.promise;        return {value: next.value, done: next.done};      }    );  }  [Symbol.asyncIterator]() {    return this;  }}{ // Putting before async iteration  const queue = new AsyncIterQueue();  queue.put('one');  queue.put('two');  queue.close();  assert.deepEqual(    await Array.fromAsync(queue),    ['one', 'two']  );}{ // Async iteration before putting  const queue = new AsyncIterQueue();  setTimeout(    // Runs after `await` pauses the current execution context    () => {      queue.put('one');      queue.put('two');      queue.close();    },    0  );  assert.deepEqual(    await Array.fromAsync(queue),    ['one', 'two']  );}
```

与之前的实现相比，变化不大：

方法 .next() 和 .Symbol.asyncIterator 是 AsyncIterable 接口的声名和实现。队列元素现在是 {value, done, promise} 的 Promise。.close()通过向队列添加最后一个元素，让我们可以关闭队列：{done: true, value: undefined, promise: null }

### 7. 常见问题

*   7.1 为什么不使用 Promise.deferred()（或 Promise.defer()）？
    

只有了解 Promises 历史的人才能理解 "deferred" 这个名称：这是 jQuery 的 "Promise API" 中使用的名称。如果你是 JavaScript 的新手，这个名字对你来说没有任何意义。

*   7.2 为什么使用 "resolvers" 而不是 "settlers" 这个名称？
    

通过 resolve() 解析 Promise 只意味着确定了它的 "命运"：

*   它可以解决 Promise 的问题：
    

```
const {promise, resolve} = Promise.withResolvers()；
resolve(123); // 解决了`promise`。
```

*   但它也可能将 Promise 的状态锁定为另一个 Promise 的状态。而后一个 Promise 可能永远处于 pending 状态（永远无法 settle）：
    

```
const {promise, resolve} = Promise.withResolvers()；
resolve(new Promise(() => {}); // `promise` is forever pending
```

因此，resolve 和 reject 通常只能解析 Promise，而不会 settle。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDDojEibDDibp04FBEU9gC3cFe6hw1lSbCDucAzaHZxQl7f4ortkdkDtuEqWNuhiccKutF9Oru8Pzyyg/640?wx_fmt=png&from=appmsg)

[图片来源：proposal-promise-with-resolvers:issues[1]]

此外，ECMAScript 规范将 resolve 和 reject 命名为 "resolving functions"。

### 参考资料

[1]

https://github.com/tc39/proposal-promise-with-resolvers/issues/2#issuecomment-1554692517: _https://github.com/tc39/proposal-promise-with-resolvers/issues/2#issuecomment-1554692517_

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)