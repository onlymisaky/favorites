> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/O59JUnbWshJSWrV8NBL5Ng)

**1. 基本概念**
===========

**1.1. 流的历史演变**
---------------

流不是 Node.js 特有的概念。它们是几十年前在 Unix 操作系统中引入的，程序可以通过管道运算符（|）对流进行相互交互。

在基于 Unix 系统的 MacOS 以及 Linux 中都可以使用管道运算符（｜），它可以将运算符左侧进程的输出转换成右侧的输入。

在 Node 中，我们使用传统的 readFile 去读取文件的话，会将文件从头到尾都读到内存中，当所有内容都被读取完毕之后才会对加载到内存中的文件内容进行统一处理。

这样做会有两个缺点：

1.  内存方面：占用大量内存
    
2.  时间方面：需要等待数据的整个有效负载都加载完才会开始处理数据
    

为了解决上述问题，Node.js 效仿并实现了流的概念，在 Node.js 流中，一共有四种类型的流，它们都是 Node.js 中 EventEmitter 的实例：

1.  可读流（Readable Stream）
    
2.  可写流（Writable Stream）
    
3.  可读可写全双工流（Duplex Stream）
    
4.  转换流（Transform Stream）
    

为了深入学习这部分的内容，循序渐进的理解 Node.js 中流的概念，并且由于源码部分较为复杂，本人决定先从可读流开始学习这部分内容。

**1.2. 什么是流（Stream）**
---------------------

流是一种抽象的数据结构，是数据的集合，其中存储的数据类型只能为以下类型（仅针对 objectMode === false 的情况）：

*   string
    
*   Buffer
    

我们可以把流看作这些数据的集合，就像液体一样，我们先把这些液体保存在一个容器里（流的内部缓冲区 BufferList），等到相应的事件触发的时候，我们再把里面的液体倒进管道里，并通知其他人在管道的另一侧拿自己的容器来接里面的液体进行处理。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcUHY5XeTfn6x5sbdibZoXyicicrWoUUCDTzVevcjFAns8wnpJRWDVLDzkQ/640?wx_fmt=png)

**1.3. 什么是可读流（Readable Stream）**
--------------------------------

可读流是流的一种类型，它有两种模式三种状态。

两种读取模式：

1.  流动模式：数据会从底层系统读取，并通过 EventEmitter 尽快的将数据传递给所注册的事件处理程序中
    
2.  暂停模式：在这种模式下将不会读取数据，必须显示的调用 Stream.read () 方法来从流中读取数据
    

三种状态：

1.  readableFlowing === null：不会产生数据，调用 Stream.pipe ()、Stream.resume 会使其状态变为 true，开始产生数据并主动触发事件
    
2.  readableFlowing === false：此时会暂停数据的流动，但不会暂停数据的生成，因此会产生数据积压
    
3.  readableFlowing === true：正常产生和消耗数据
    

**2. 基本原理**
===========

**2.1. 内部状态定义（ReadableState）**
------------------------------

**ReadableState**

```
_readableState: ReadableState {  objectMode: false, // 操作除了string、Buffer、null之外的其他类型的数据需要把这个模式打开  highWaterMark: 16384, // 水位限制，1024 \* 16，默认16kb，超过这个限制则会停止调用\_read()读数据到buffer中  buffer: BufferList { head: null, tail: null, length: 0 }, // Buffer链表，用于保存数据  length: 0, // 整个可读流数据的大小，如果是objectMode则与buffer.length相等  pipes: [], // 保存监听了该可读流的所有管道队列  flowing: null, // 可独流的状态 null、false、true  ended: false, // 所有数据消费完毕  endEmitted: false, // 结束事件收否已发送  reading: false, // 是否正在读取数据  constructed: true, // 流在构造好之前或者失败之前，不能被销毁  sync: true, // 是否同步触发'readable'/'data'事件，或是等到下一个tick  needReadable: false, // 是否需要发送readable事件  emittedReadable: false, // readable事件发送完毕  readableListening: false, // 是否有readable监听事件  resumeScheduled: false, // 是否调用过resume方法  errorEmitted: false, // 错误事件已发送  emitClose: true, // 流销毁时，是否发送close事件  autoDestroy: true, // 自动销毁，在'end'事件触发后被调用  destroyed: false, // 流是否已经被销毁  errored: null, // 标识流是否报错  closed: false, // 流是否已经关闭  closeEmitted: false, // close事件是否已发送  defaultEncoding: 'utf8', // 默认字符编码格式  awaitDrainWriters: null, // 指向监听了'drain'事件的writer引用，类型为null、Writable、Set<Writable>  multiAwaitDrain: false, // 是否有多个writer等待drain事件   readingMore: false, // 是否可以读取更多数据  dataEmitted: false, // 数据已发送  decoder: null, // 解码器  encoding: null, // 编码器  [Symbol(kPaused)]: null},
```

**2.2. 内部数据存储实现（BufferList）**
-----------------------------

BufferList 是用于流保存内部数据的容器，它被设计为了链表的形式，一共有三个属性 head、tail 和 length。

BufferList 中的每一个节点我把它表示为了 BufferNode，里面的 Data 的类型取决于 objectMode。

这种数据结构获取头部的数据的速度快于 Array.prototype.shift()。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcI024g2Eah4fgAo8dJ8n0ACwvd5onp9N5e8CQNPVrfd9ySbP43jrkBg/640?wx_fmt=png)

### **2.2.1. 数据存储类型**

如果 objectMode === true：

那么 data 则可以为任意类型，push 的是什么数据则存储的就是什么数据。

**objectMode=true**

```
const Stream = require('stream');const readableStream = new Stream.Readable({  objectMode: true,  read() {},});readableStream.push({ name: 'lisa'});console.log(readableStream._readableState.buffer.tail);readableStream.push(true);console.log(readableStream._readableState.buffer.tail);readableStream.push('lisa');console.log(readableStream._readableState.buffer.tail);readableStream.push(666);console.log(readableStream._readableState.buffer.tail);readableStream.push(() => {});console.log(readableStream._readableState.buffer.tail);readableStream.push(Symbol(1));console.log(readableStream._readableState.buffer.tail);readableStream.push(BigInt(123))console.log(readableStream._readableState.buffer.tail);
```

运行结果：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfckRpBpKWPd49O82jr8EFB4a0sgia52yHD9PKyYHXkjSBmriaBvCKEsVRQ/640?wx_fmt=png)

如果 objectMode === false：

那么 data 只能为 string 或者 Buffer 或者 Uint8Array 。

**objectMode=false**

```
const Stream = require('stream');const readableStream = new Stream.Readable({  objectMode: false,  read() {},});readableStream.push({ name: 'lisa'});
```

运行结果：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcUTXFI3X0Z25hAHdtm9Tw3XPric1v7Wm0GW7kO6pqCcMpzib5ODsHsgoQ/640?wx_fmt=png)

### **2.2.2. 数据存储结构**

我们在控制台通过 node 命令行创建一个可读流，来观察 buffer 中数据的变化：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcvJGFje68ND6ibWv2bhicpB2RwMkvkib4p6A3u4y3w5CowiaSBO09RIPmDQ/640?wx_fmt=png)

当然在 push 数据之前我们需要实现它的 _read 方法，或者在构造函数的参数中实现 read 方法：

```
const Stream = require('stream');const readableStream = new Stream.Readable();RS._read = function(size) {}
```

或者

```
const Stream = require('stream');const readableStream = new Stream.Readable({  read(size) {}});
```

经过 readableStream.push ('abc') 操作之后，当前的 buffer 为：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcLykxr78lhK2gynyicctArzyX5dJSYPM3wJtazSD7ZwMELTljibddkdlg/640?wx_fmt=png)

可以看到目前的数据存储了，头尾存储的数据都是字符串'abc' 的 ascii 码，类型为 Buffer 类型，length 表示当前保存的数据的条数而非数据内容的大小。

### **2.2.3. 相关 API**

打印一下 BufferList 的所有方法可以得到：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfctwt1bDpdLP2pVoTMHqTq72Xyg8Vse6NMHzv244szZerJ79xwBZ3rtg/640?wx_fmt=png)

除了 join 是将 BufferList 序列化为字符串之外，其他都是对数据的存取操作。

这里就不一一讲解所有的方法了，重点讲一下其中的 consume 、_getString 和_getBuffer。

#### **2.2.3.1. consume**

源码地址：BufferList.consume

**comsume**

```
// Consumes a specified amount of bytes or characters from the buffered data.consume(n, hasStrings) {  const data = this.head.data;  if (n < data.length) {    // `slice` is the same for buffers and strings.    const slice = data.slice(0, n);    this.head.data = data.slice(n);    return slice;  }  if (n === data.length) {    // First chunk is a perfect match.    returnthis.shift();  }  // Result spans more than one buffer.  return hasStrings ? this.\_getString(n) : this.\_getBuffer(n);}
```

代码一共有三个判断条件：

1. 如果所消耗的数据的字节长度小于链表头节点存储数据的长度，则将头节点的数据取前 n 字节，并把当前头节点的数据设置为切片之后的数据

2. 如果所消耗的数据恰好等于链表头节点所存储的数据的长度，则直接返回当前头节点的数据

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcYNNzHgOMRP0NXg0PXCEPVvWHM2wdsOiaHTvxGWDiazAduNka388xNjww/640?wx_fmt=png)

3. 如果所消耗的数据的长度大于链表头节点的长度，那么会根据传入的第二个参数进行最后一次判断，判断当前的 BufferList 底层存储的是 string 还是 Buffer

#### **2.2.3.2. _getBuffer**

源码地址：BufferList._getBuffer

**comsume**

```
// Consumes a specified amount of bytes from the buffered data._getBuffer(n) {  const ret = Buffer.allocUnsafe(n);  const retLen = n;  let p = this.head;  let c = 0;  do {    const buf = p.data;    if (n > buf.length) {      TypedArrayPrototypeSet(ret, buf, retLen - n);      n -= buf.length;    } else {      if (n === buf.length) {        TypedArrayPrototypeSet(ret, buf, retLen - n);        ++c;        if (p.next)          this.head = p.next;        else          this.head = this.tail = null;      } else {       TypedArrayPrototypeSet(ret,                              newUint8Array(buf.buffer, buf.byteOffset, n),                              retLen - n);        this.head = p;        p.data = buf.slice(n);      }      break;    }    ++c;  } while ((p = p.next) !== null);  this.length -= c;  return ret;}
```

总的来说就是循环对链表中的节点进行操作，新建一个 Buffer 数组用于存储返回的数据。

首先从链表的头节点开始取数据，不断的复制到新建的 Buffer 中，直到某一个节点的数据大于等于要取的长度减去已经取得的长度。

或者说读到链表的最后一个节点后，都还没有达到要取的长度，那么就返回这个新建的 Buffer。

#### **2.2.3.3. _getString**

源码地址：BufferList._getString

**comsume**

```
// Consumes a specified amount of characters from the buffered data._getString(n) {  let ret = '';  let p = this.head;  let c = 0;  do {    const str = p.data;    if (n > str.length) {    ret += str;    n -= str.length;  } else {    if (n === str.length) {      ret += str;      ++c;      if (p.next)        this.head = p.next;      else        this.head = this.tail = null;    } else {      ret += StringPrototypeSlice(str, 0, n);      this.head = p;      p.data = StringPrototypeSlice(str, n);    }    break;    }    ++c;  } while ((p = p.next) !== null);  this.length -= c;  return ret;}
```

对于操作字符串来说和操作 Buffer 是一样的，也是循环从链表的头部开始读数据，只是进行数据的拷贝存储方面有些差异，还有就是 _getString 操作返回的数据类型是 string 类型。

**2.3. 为什么可读流是 EventEmitter 的实例？**
----------------------------------

对于这个问题而言，首先要了解什么是发布订阅模式，发布订阅模式在大多数 API 中都有重要的应用，无论是 Promise 还是 Redux，基于发布订阅模式实现的高级 API 随处可见。

它的优点在于能将事件的相关回调函数存储到队列中，然后在将来的某个时刻通知到对方去处理数据，从而做到关注点分离，生产者只管生产数据和通知消费者，而消费者则只管处理对应的事件及其对应的数据，而 Node.js 流模式刚好符合这一特点。

那么 Node.js 流是怎样实现基于 EventEmitter 创建实例的呢？

这部分源码在这儿：stream/legacy

**legacy**

```
function Stream(opts) {  EE.call(this, opts);}ObjectSetPrototypeOf(Stream.prototype, EE.prototype);ObjectSetPrototypeOf(Stream, EE);
```

然后在可读流的源码中有这么几行代码：

这部分源码在这儿：readable

**legacy**

```
ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);<br style="line-height: 1.6 !important;">ObjectSetPrototypeOf(Readable, Stream);
```

首先将 Stream 的原型对象继承自 EventEmitter，这样 Stream 的所有实例都可以访问到 EventEmitter 上的方法。

同时通过 ObjectSetPrototypeOf (Stream, EE) 将 EventEmitter 上的静态方法也继承过来，并在 Stream 的构造函数中，借用构造函数 EE 来实现所有 EventEmitter 中的属性的继承，然后在可读流里，用同样的的方法实现对 Stream 类的原型继承和静态属性继承，从而得到：

Readable.prototype.__proto__ === Stream.prototype;

Stream.prototype.__proto__ === EE.prototype

因此：

Readable.prototype.__proto__.__proto__ === EE.prototype

所以捋着可读流的原型链可以找到 EventEmitter 的原型，实现对 EventEmitter 的继承。

**2.4. 相关 API 的实现**
-------------------

这里会按照源码文档中 API 的出现顺序来展示，且仅解读其中的核心 API 实现。

注：此处仅解读 Node.js 可读流源码中所声明的函数，不包含外部引入的函数定义，同时为了减少篇幅，不会将所有代码都拷贝下来。

**Readable.prototype**

```
Stream {  destroy: [Function: destroy],  _undestroy: [Function: undestroy],  _destroy: [Function (anonymous)],  push: [Function (anonymous)],  unshift: [Function (anonymous)],  isPaused: [Function (anonymous)],  setEncoding: [Function (anonymous)],  read: [Function (anonymous)],  _read: [Function (anonymous)],  pipe: [Function (anonymous)],  unpipe: [Function (anonymous)],  on: [Function (anonymous)],  addListener: [Function (anonymous)],  removeListener: [Function (anonymous)],  off: [Function (anonymous)],  removeAllListeners: [Function (anonymous)],  resume: [Function (anonymous)],  pause: [Function (anonymous)],  wrap: [Function (anonymous)],  iterator: [Function (anonymous)],  [Symbol(nodejs.rejection)]: [Function (anonymous)],  [Symbol(Symbol.asyncIterator)]: [Function (anonymous)]}
```

### **2.4.1. push**

**readable.push**

```
Readable.prototype.push = function(chunk, encoding) {  return readableAddChunk(this, chunk, encoding, false);};
```

push 方法的主要作用就是将数据块通过触发'data' 事件传递给下游管道，或者将数据存储到自身的缓冲区中。

以下代码为相关伪代码，仅展示主流程：

**readable.push**

```
function readableAddChunk(stream, chunk, encoding, addToFront) {  const state = stream.\_readableState;  if (chunk === null) { // push null 流结束信号，之后不能再写入数据    state.reading = false;    onEofChunk(stream, state);  } elseif (!state.objectMode) { // 如果不是对象模式    if (typeof chunk === 'string') {      chunk = Buffer.from(chunk);    } elseif (chunk instanceof Buffer) { //如果是Buffer    // 处理一下编码    } elseif (Stream.\_isUint8Array(chunk)) {      chunk = Stream.\_uint8ArrayToBuffer(chunk);    } elseif (chunk != null) {      err = new ERR\_INVALID\_ARG\_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);    }  }  if (state.objectMode || (chunk && chunk.length > 0)) { // 是对象模式或者chunk是Buffer    // 这里省略几种数据的插入方式的判断    addChunk(stream, state, chunk, true);  }}function addChunk(stream, state, chunk, addToFront) {  if (state.flowing && state.length === 0 && !state.sync &&    stream.listenerCount('data') > 0) { // 如果处于流动模式，有监听data的订阅者      stream.emit('data', chunk);  } else { // 否则保存数据到缓冲区中    state.length += state.objectMode ? 1 : chunk.length;    if (addToFront) {      state.buffer.unshift(chunk);    } else {      state.buffer.push(chunk);    }  }  maybeReadMore(stream, state); // 尝试多读一点数据}
```

push 操作主要分为对 objectMode 的判断，不同的类型对传入的数据会做不同的操作：

*   objectMode === false: 将数据（chunk）转换成 Buffer
    
*   objectMode === true: 将数据原封不动的传递给下游
    

其中 addChunk 的第一个判断主要是处理 Readable 处于流动模式、有 data 监听器、并且缓冲区数据为空时的情况。

这时主要将数据 passthrough 透传给订阅了 data 事件的其他程序，否则就将数据保存到缓冲区里面。

### **2.4.2. read**

除去对边界条件的判断、流状态的判断，这个方法主要有两个操作

1.  调用用户实现的_read 方法，对执行结果进行处理
    
2.  从缓冲区 buffer 中读取数据，并触发'data' 事件
    

**readable.read**

```
// 如果read的长度大于hwm，则会重新计算hwmif (n > state.highWaterMark) {  state.highWaterMark = computeNewHighWaterMark(n);  }// 调用用户实现的\_read方法try {  const result = this.\_read(state.highWaterMark);  if (result != null) {    const then = result.then;    if (typeof then === 'function') {      then.call(        result,        nop,        function(err) {          errorOrDestroy(this, err);        });    }  }} catch (err) {  errorOrDestroy(this, err);}
```

如果说用户实现的_read 方法返回的是一个 promise，则调用这个 promise 的 then 方法，将成功和失败的回调传入，便于处理异常情况。

read 方法从缓冲区里读区数据的核心代码如下：

**readable.read**

```
function fromList(n, state) {  // nothing buffered.  if (state.length === 0)    returnnull;  let ret;  if (state.objectMode)    ret = state.buffer.shift();  elseif (!n || n >= state.length) { // 处理n为空或者大于缓冲区的长度的情况    // Read it all, truncate the list.    if (state.decoder) // 有解码器，则将结果序列化为字符串      ret = state.buffer.join('');    elseif (state.buffer.length === 1) // 只有一个数据，返回头节点数据      ret = state.buffer.first();    else// 将所有数据存储到一个Buffer中      ret = state.buffer.concat(state.length);    state.buffer.clear(); // 清空缓冲区  } else {    // 处理读取长度小于缓冲区的情况    ret = state.buffer.consume(n, state.decoder);  }  return ret;}
```

### **2.4.3. _read**

用户初始化 Readable stream 时必须实现的方法，可以在这个方法里调用 push 方法，从而持续的触发 read 方法，当我们 push null 时可以停止流的写入操作。

示例代码：

**readable._read**

```
const Stream = require('stream');const readableStream = new Stream.Readable({  read(hwm) {    this.push(String.fromCharCode(this.currentCharCode++));    if (this.currentCharCode > 122) {      this.push(null);    }  },});readableStream.currentCharCode = 97;readableStream.pipe(process.stdout);// abcdefghijklmnopqrstuvwxyz%
```

### **2.4.4. pipe（重要）**

将一个或多个 writable 流绑定到当前的 Readable 流上，并且将 Readable 流切换到流动模式。

这个方法里面有很多的事件监听句柄，这里不会一一介绍：

**readable.pipe**

```
Readable.prototype.pipe = function(dest, pipeOpts) {  const src = this;  const state = this.\_readableState;  state.pipes.push(dest); // 收集Writable流  src.on('data', ondata);  function ondata(chunk) {    const ret = dest.write(chunk);    if (ret === false) {      pause();    }  }  // Tell the dest that it's being piped to.  dest.emit('pipe', src);  // 启动流，如果流处于暂停模式  if (dest.writableNeedDrain === true) {    if (state.flowing) {      pause();    }  } elseif (!state.flowing) {    src.resume();  }  return dest;}
```

pipe 操作和 Linux 的管道操作符 '|' 非常相似，将左侧输出变为右侧输入，这个方法会将可写流收集起来进行维护，并且当可读流触发'data' 事件。

有数据流出时，就会触发可写流的写入事件，从而做到数据传递，实现像管道一样的操作。并且会自动将处于暂停模式的可读流变为流动模式。

### **2.4.5. resume**

使流从 '暂停' 模式切换到 '流动' 模式，如果设置了'readable' 事件监听，那么这个方法其实是没有效果的

**readable.resume**

```
Readable.prototype.resume = function() {  const state = this._readableState;  if (!state.flowing) {    state.flowing = !state.readableListening; // 是否处于流动模式取决于是否设置了'readable'监听句柄    resume(this, state);  }};function resume(stream, state) {  if (!state.resumeScheduled) { // 开关，使resume_方法仅在同一个Tick中调用一次    state.resumeScheduled = true;    process.nextTick(resume_, stream, state);  }}function resume_(stream, state) {  if (!state.reading) {    stream.read(0);  }  state.resumeScheduled = false;  stream.emit('resume');  flow(stream);}function flow(stream) { // 当流处于流模式该方法会不断的从buffer中读取数据，直到缓冲区为空  const state = stream._readableState;  while (state.flowing && stream.read() !== null);   // 因为这里会调用read方法，设置了'readable'事件监听器的stream，也有可能会调用read方法，  //从而导致数据不连贯（不影响data，仅影响在'readable'事件回调中调用read方法读取数据）}
```

### **2.4.6. pause**

将流从流动模式转变为暂停模式，停止触发'data' 事件，将所有的数据保存到缓冲区

**readable.pause**

```
Readable.prototype.pause = function() {  if (this._readableState.flowing !== false) {    debug('pause');    this._readableState.flowing = false;    this.emit('pause');  }  returnthis;};
```

**2.5. 使用方法与工作机制**
------------------

使用方法在 BufferList 部分已经讲过了，创建一个 Readable 实例，并实现其_read () 方法，或者在构造函数的第一个对象参数中实现 read 方法。

### **2.5.1. 工作机制**

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsSkR9VpZBuueIQD9LZsXfcriasTzZyZHTbKkfHtKj8jICOvWnnxOooFd577p7aiaDJsdSK34kNCKcg/640?wx_fmt=png)

这里只画了大致的流程，以及 Readable 流的模式转换触发条件。

其中：

*   needReadable (true): 暂停模式并且 buffer 数据 <=hwm、绑定了 readable 事件监听函数、read 数据时缓冲区没有数据或者返回数据为空
    
*   push: 如果处于流动模式，缓冲区里没有数据会触发'data' 事件；否则将数据保存到缓冲区根据 needReadable 状态触发'readable' 事件
    
*   read: 读 length=0 长度的数据时，buffer 中的数据已经到达 hwm 或者溢出需要触发'readable' 事件；从 buffer 中读取数据并触发'data' 事件
    
*   resume: 有'readable' 监听，该方法不起作用；否则将流由暂停模式转变为流动模式，并清空缓冲区里的数据
    
*   readable 触发条件：绑定了'readable' 事件并且缓冲区里有数据、push 数据时缓冲区有数据，并且 needReadable === true、读 length=0 长度的数据时，buffer 中的数据已经到达 hwm 或者溢出
    

**3. 总结**
=========

*   Node.js 为了解决内存问题和时间问题，实现了自己的流，从而可以将数据一小块一小块的读到内存里给消费者消费
    
*   流并不是 Node.js 特有的概念，它们是几十年前在 Unix 操作系统中引入的
    
*   流一共有四种类型：可读流、可写流、可读可写流、转换流，它们都继承了 EventEmiiter 的实例方法和静态方法，都是 EE 的实例
    
*   流的底层容器是基于 BufferList 的，这是一种自定义的链表实现，头尾各是一个 “指针” 指向下一个节点引用
    
*   可读流有两种模式三种状态，在流动模式下会通过 EventEmitter 将数据发送给消费者
    
*   基于流我们可以实现对数据的链式处理，并且可以装配不同的流处理函数，来实现对流的各种操作，转换成我们想要的数据
    

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsUS8uDeYgQE2E3ga5vf4XrvOOm2gpZEicrI9iaeJL0yNS9F3FxhlLia1fO9OicoAvdDWIVbjqHZw53IA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)