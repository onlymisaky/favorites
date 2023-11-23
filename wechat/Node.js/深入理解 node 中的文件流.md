> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/NCe0hkeXPLb9YS1Wr-Lxtg)

为什么要使用文件流
=========

想象这样一个场景，我要处理一个 10G 的文件，但我的内存大小只有 2G，该怎么办？

我们可以分 5 次读取文件，每次只读取 2G 的数据，这样就可以解决这个问题，那么这个分段读取的过程就是流！

在 node 中 `stream` 模块封装了流的基本操作，文件流也是直接依赖的此模块，这里我们借助文件流来深入理解 `stream`

文件可读流
-----

读取文件，将文件内容一点一点的读入内存当中。

### 使用方式

我们先看一下基本的使用方式。

```
const fs = require('fs')const rs = fs.createReadStream('./w-test.js')rs.on('data', (chunk) => {  console.log(chunk)})rs.on('close', () => {  console.log('close')})
```

如上代码所示，我们通过 `fs.createStream()` 创建了一个可读流，用来读取 _w-test.js_ 文件。

当 `on('data')` 时，会自动的读取文件数据，每次默认读取 64kb 的内容，也可以通过 `highWaterMark` 参数来动态改变每次内容流程的阈值。

文件读取完毕后会自动触发 `close` 事件。

如下代码为 `createReadStream` 可以配置的参数

```
const rs = fs.createReadStream('./w-test.js', {  flags: 'r', // 文件系统表示，这里是指以可读的形式操作文件  encoding: null, // 编码方式  autoClose: false, // 读取完毕时是否自动触发 close 事件  start: 0, // 开始读取的位置  end: 2, // 结束读取的位置  highWaterMark: 2 // 每次读取的内容大小})
```

**注意：** start 跟 end 都是包含的，即 [start, end]。

其实，`fs.crateReadStream` 就是返回一个 `fs.ReadStream` 类的实例，所以上述代码就等同于：

```
const rs = new fs.ReadStream('./w-test.js', {  flags: 'r', // 文件系统表示，这里是指以可读的形式操作文件  encoding: null, // 编码方式  autoClose: false, // 读取完毕时是否自动触发 close 事件  start: 0, // 开始读取的位置  end: 2, // 结束读取的位置  highWaterMark: 2 // 每次读取的内容大小})
```

### 文件可读流的实现

了解完使用方式，那我们就应该尝试从原理上去搞定它，接下来，我们手写一个可读流。

### fs.read / fs.open

可读流的本质就是分批读取文件数据，而 `fs.read()` 方法可以控制读取文件的内容大小

```
fs.read(fd, buffer, offset, length, position, callback)
```

*   fd：要读取的文件描述符
    
*   buffer：数据要被写入的 buffer（将读取到的文件内容写入到此 buffer 内）
    
*   offset：buffer 中开始写入的偏移量（从 buffer 的第几个索引开始写入）
    
*   length：读取的字节数（从文件中读取几个字节）
    
*   postion：指定从文件中开始读取的位置（从文件的第几个字节开始读）
    
*   callback：回调函数
    
*     
    

*   err
    

*     
    

*   bytesRead：实际读取的字节数
    

读取文件需要一个文件标识符，我们应该需要使用 `fs.open` 来获取

*   path：文件路径
    
*   flags：文件系统标志，默认值：'r'。意思是要对文件进行什么操作，常见的有以下几种：
    
*     
    

*   r：打开文件用于读取
    

*     
    

*   w：打开文件用于写入
    

*     
    

*   a：打开文件用于追加
    

*   mode：文件操作权限，默认值：0o666（可读写）。
    
*   callback：回调函数。函数上携带的参数如下：
    
*     
    

*   err：如果失败，则值为错误原因
    

*     
    

*   fd（number）：文件描述符，读取、写入文件时都要用到这个值
    

#### 初始化

首先，`ReadStream` 是一个类，从表现上来看这个类可以监听事件即 `on('data')`，所以我们应该让它继承自 `EventEmitter`，如下代码：

```
class ReadStream extends EventEmitter {  constructor() {    super();  }}
```

然后我们初始化参数，并打开文件，如下代码（代码中会对关键代码作注释）：

```
class ReadStream extends EventEmitter {  constructor(path, options = {}) {    super()    // 解析参数    this.path = path    this.flags = options.flags ?? 'r'    this.encoding = options.encoding ?? 'utf8'    this.autoClose = options.autoClose ?? true    this.start = options.start ?? 0    this.end = options.end ?? undefined    this.highWaterMark = options.highWaterMark ?? 16 * 1024    // 文件的偏移量    this.offset = this.start    // 是否处于流动状态，调用 pause 或 resume 方法时会用到，下文会讲到    this.flowing = false    // 打开文件    this.open()    // 当绑定新事件时会触发 newListener    // 这里当绑定 data 事件时，自动触发文件的读取    this.on('newListener', (type) => {      if (type === 'data') {        // 标记为开始流动        this.flowing = true        // 开始读取文件        this.read()      }    })  }}
```

*   读取文件之前，我们要先打开文件，即 `this.open()`。
    
*   `on('newListener')`是 EventEmitter 的一个事件，每当我们绑定新的事件时都会触发 `newListener`，例如：当我们 `on('data')` 时，会触发 `newListener` 事件，并且 type 为'data'。
    
*   这里当我们监听到`data`事件绑定（即 `on('data')`）时，就开始读取文件即 `this.read()`，`this.read()` 是我们核心方法。
    

#### open

`open` 方法如下：

```
open() {  fs.open(this.path, this.flags, (err, fd) => {    if (err) {      // 文件打开失败触发 error 事件      this.emit('error', err)      return    }    // 记录文件标识符    this.fd = fd    // 文件打开成功后触发 open 事件    this.emit('open')  })}
```

当打开文件后记录下文件标识符，即 `this.fd`

#### read

`read` 方法如下：

```
read() {  // 由于 ```fs.open``` 是异步操作,  // 所以当调用 read 方法时，文件可能还没有打开  // 所以我们要等 open 事件触发之后，再次调用 read 方法  if (typeof this.fd !== 'number') {    this.once('open', () => this.read())    return  }  // 申请一个 highWaterMark 字节的 buffer，  // 用来存储从文件读取的内容  const buf = Buffer.alloc(this.highWaterMark)  // 开始读取文件  // 每次读取时，都记录下文件的偏移量  fs.read(this.fd, buf, 0, buf.length, this.offset, (err, bytesRead) => {    this.offset += bytesRead    // bytesRead 为实际读取的文件字节数    // 如果 bytesRead 为 0，则代表没有读取到内容，即读取完毕    if (bytesRead) {      // 每次读取都触发 data 事件      this.emit('data', buf.slice(0, bytesRead))      // 如果处于流动状态，则继续读取      // 这里当调用 pause 方法时，会将 this.flowing 置为 false      this.flowing && this.read()    } else {      // 读取完毕后触发 end 事件      this.emit('end')      // 如果可以自动关闭，则关闭文件并触发 close 事件      this.autoClose && fs.close(this.fd, () => this.emit('close'))    }  })}
```

上述每行代码都有注释，相信也不难理解，这里有几个关键点要注意一下

*   一定要等文件打开后才能开始读取文件，但是文件打开是一个异步操作，我们并不知道具体的打开完毕时间，所以，我们会在文件打开后触发一个 `on('open')` 事件，read 方法内会等 `open` 事件触发后再次重新调用 `read()`
    
*   `fs.read()` 方法之前有讲过，可以从前文回顾里看一下 _手写 fs 核心方法_
    
*   `this.flowing` 属性是用来判断是否是流动的，会用对应的 `pasue()` 方法与 `resume()` 来控制，下面我们来看一下这两个方法。
    

#### pause

```
pause() {  this.flowing =false}
```

#### resume

```
resume() {  if (!this.flowing) {    this.flowing = true    this.read()  }}
```

#### 完整代码

```
const { EventEmitter } = require('events')const fs = require('fs')class ReadStream extends EventEmitter {  constructor(path, options = {}) {    super()    this.path = path    this.flags = options.flags ?? 'r'    this.encoding = options.encoding ?? 'utf8'    this.autoClose = options.autoClose ?? true    this.start = options.start ?? 0    this.end = options.end ?? undefined    this.highWaterMark = options.highWaterMark ?? 16 * 1024    this.offset = this.start    this.flowing = false    this.open()    this.on('newListener', (type) => {      if (type === 'data') {        this.flowing = true        this.read()      }    })  }  open() {    fs.open(this.path, this.flags, (err, fd) => {      if (err) {        this.emit('error', err)        return      }      this.fd = fd      this.emit('open')    })  }  pause() {    this.flowing =false  }  resume() {    if (!this.flowing) {      this.flowing = true      this.read()    }  }  read() {    if (typeof this.fd !== 'number') {      this.once('open', () => this.read())      return    }    const buf = Buffer.alloc(this.highWaterMark)    fs.read(this.fd, buf, 0, buf.length, this.offset, (err, bytesRead) => {      this.offset += bytesRead      if (bytesRead) {        this.emit('data', buf.slice(0, bytesRead))        this.flowing && this.read()      } else {        this.emit('end')        this.autoClose && fs.close(this.fd, () => this.emit('close'))      }    })  }}
```

文件可写流
-----

顾名思义了，将内容一点一点写入到文件里去。

### fs.write

*   fd：要被写入的文件描述符
    
*   buffer：将指定 buffer 的内容写入到文件中去
    
*   offset：指定 buffer 的写入位置（从 buffer 的第 offset 个索引读取内容写入到文件中去）
    
*   length：指定要写入的字节数
    
*   position：文件的偏移量（从文件的第 position 个字节开始写入）
    

### 使用方式

```
// 使用方式 1：const ws = fs.createWriteStream('./w-test.js')// 使用方式 2：const ws = new WriteStream('./w-test.js', {  flags: 'w',  encoding: 'utf8',  autoClose: true,  highWaterMark: 2})// 写入文件const flag = ws.write('2')ws.on('drain', () => console.log('drain'))
```

*   `ws.write()` 写入文件。这里有一个返回值，代表是否已经达到最大缓存。当我们同步连续调用多次 `write()`时，并不是每次调用都立即写入文件，而是同一时间只能执行一次写入操作，所以剩下的会被写入到缓存中，等上一次写入完毕后再从缓存中依次取出执行。所以，这时就会有一个最大的缓存大小，默认为 64kb。而这里的返回值则代表是否还可以继续写入，也就是：是否达到了最大缓存。true 代表可以继续写入。
    
*   `ws.on('drain')`，如果调用`ws.write()`返回 false，则当可以继续写入数据到流时会触发'drain' 事件。
    

### 文件可写流的实现

#### 初始化

先定义 `WriteStream` 类，并继承 `EventEmitter`, 然后，初始化参数。_注意看代码注释_

```
const { EventEmitter } = require('events')const fs = require('fs')class WriteStream extends EventEmitter {  constructor(path, options = {}) {    super()    // 初始化参数    this.path = path    this.flags = options.flags ?? 'w'    this.encoding = options.encoding ?? 'utf8'    this.autoClose = options.autoClose ?? true    this.highWaterMark = options.highWaterMark ?? 16 * 1024    this.offset = 0 // 文件读取偏移量    this.cache = [] // 缓存的要被写入的内容    // 将要被写入的总长度，包括缓存中的内容长度    this.writtenLen = 0    // 是否正在执行写入操作，    // 如果正在写入，那以后的操作需放入 this.cache    this.writing = false    // 是否应该触发 drain 事件    this.needDrain = false    // 打开文件    this.open()  }}
```

#### open()

跟 ReadStream 一样的代码。

```
open() {  fs.open(this.path, this.flags, (err, fd) => {    if (err) {      this.emit('error', err)      return    }    this.fd = fd    this.emit('open')  })}
```

#### write()

执行写入操作

```
write(chunk, encoding, cb = () => {}) {  // 初始化被写入的内容  // 如果时字符串，则转为 buffer  chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)  // 计算要被写入的长度  this.writtenLen += chunk.length  // 判断是否已经超过 highWaterMark  const hasLimit = this.writtenLen >= this.highWaterMark  // 是否需要触发 drain  // 如果超过 highWaterMark，则代表需要触发  this.needDrain = hasLimit  // 如果没有正在写入的内容，则调用 _write 直接开始写入  // 否则放入 cache 中  // 写入完成后，调用 clearBuffer，从缓存中拿取最近一次内容开始写入  if (!this.writing) {    this.writing = true    this._write(chunk, () => {      cb()      this.clearBuffer()    })  } else {    this.cache.push({      chunk: chunk,      cb    })  }  return !hasLimit}// 写入操作_write(chunk, cb) {  if (typeof this.fd !== 'number') {    this.once('open', () => this._write(chunk, cb))    return  }  // 写入文件  fs.write(this.fd, chunk, 0, chunk.length, this.offset, (err, bytesWritten) => {    if (err) {      this.emit('error', err)      return    }    // 计算偏移量    this.offset += bytesWritten    // 写入完毕，则减去当前写入的长度    this.writtenLen -= bytesWritten    cb()  })}
```

1.  首先初始化要被写入的内容，只支持 buffer 跟字符串，如果是字符串则直接转为 buffer。
    
2.  计算要被写入的总长度，即 `this.writtenLen += chunk.length`
    
3.  判断是否已经超过 highWaterMark
    
4.  判断是否需要触发 drain
    
5.  判断是否已经有正在被写入的内容了，如果没有则调用 `_write()` 直接写入，如果有则放入缓存中。当 `_write()` 写入完毕后，调用 `clearBuffer()` 方法，从 `this.cache` 中取出最先被缓存的内容进行写入操作。clearBuffer 方法如下所示
    

#### clearBuffer()

```
clearBuffer() {  // 取出缓存  const data = this.cache.shift()  if (data) {    const { chunk, cb } = data    // 继续进行写入操作    this._write(chunk, () => {      cb()      this.clearBuffer()    })    return  }  // 触发 drain  this.needDrain && this.emit('drain')  // 写入完毕，将writing置为false  this.writing = false  // needDrain 置为 false  this.needDrain = false}
```

#### 完整代码

```
const { EventEmitter } = require('events')const fs = require('fs')class WriteStream extends EventEmitter {  constructor(path, options = {}) {    super()    this.path = path    this.flags = options.flags ?? 'w'    this.encoding = options.encoding ?? 'utf8'    this.autoClose = options.autoClose ?? true    this.highWaterMark = options.highWaterMark ?? 16 * 1024    this.offset = 0    this.cache = []    this.writtenLen = 0    this.writing = false    this.needDrain = false    this.open()  }  open() {    fs.open(this.path, this.flags, (err, fd) => {      if (err) {        this.emit('error', err)        return      }      this.fd = fd      this.emit('open')    })  }  clearBuffer() {    const data = this.cache.shift()    if (data) {      const { chunk, cb } = data      this._write(chunk, () => {        cb()        this.clearBuffer()      })      return    }    this.needDrain && this.emit('drain')    this.writing = false    this.needDrain = false  }  write(chunk, encoding, cb = () => {}) {    chunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)    this.writtenLen += chunk.length    const hasLimit = this.writtenLen >= this.highWaterMark    this.needDrain = hasLimit    if (!this.writing) {      this.writing = true      this._write(chunk, () => {        cb()        this.clearBuffer()      })    } else {      this.cache.push({        chunk: chunk,        cb      })    }    return !hasLimit  }  _write(chunk, cb) {    if (typeof this.fd !== 'number') {      this.once('open', () => this._write(chunk, cb))      return    }    fs.write(this.fd, chunk, 0, chunk.length, this.offset, (err, bytesWritten) => {      if (err) {        this.emit('error', err)        return      }      this.offset += bytesWritten      this.writtenLen -= bytesWritten      cb()    })  }}
```

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)