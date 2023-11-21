> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WisEGFz2yn_ZeekViofMnA)

将多个文件合并为一个文件，常见的场景是类似于大文件分片上传，事先根据一定的文件大小拆分为多个小文件上传到服务端，最后服务端在合并起来。

怎么合并？一种简单的办法是使用 fs.readFile 读取，fs.writeFile 追加写入，这种方式是将文件数据先读入应用内存再写入，不是很推荐，Node.js 本身提供了 Stream 模块可以更好的处理这种场景。

在 Stream 中合并文件之前一个比较常用的 API 是 pipe，但是这个 API 对于错误处理不是很友好，一不小心还能搞出文件句柄内存泄漏问题。

本文先介绍 pipe 方法的使用及什么情况下会遇到文件句柄的内存泄漏问题，之后再分别介绍 Stream 合并的两种实现模式。

pipe VS pipeline
----------------

### pipe

创建一个可读流 readable 和一个可写流 writeable，通过管道 pipe 将可写流绑定到可读流，一个简单的 Stream 操作就完成了。

```
const fs = require('fs');const readable = fs.createReadStream('./test1.txt');const writeable = fs.createWriteStream('./test2.txt');readable.pipe(writeable);
```

pipe 方法的两个参数：

*   destination：是一个可写流对象，也就是一个数据写入的目标对象，例如，上面我们创建的 writeable 就是一个可写流对象
    
*   options：
    

*   end：读取结束时终止写入流，默认值是 true
    

```
readable.pipe(destination[, options])
```

**默认情况下我们是不需要手动调用写入流的 end 方法关闭的**。

现在我们改一下，**设置 end 为 false 写入的目标流将会一直处于打开状态，** 此时就需要监听可读流的 end 事件，结束之后手动调用可写流的 end 方法结束（**为什么要这样做？下文 Stream 串行合并会再用到这一特性**）。

```
// readable.pipe(writeable);readable.pipe(writeable, {  end: false,});readable.on('end', function() {  writeable.end('结束');});
```

还需要注意一点**如果可读流期间发生什么错误，则写入的目标流将不会关闭**，例如：process.stderr 和 process.stdout 可写流在 Nodejs 进程退出前将永远不会关闭，所以**需要监听错误事件，手动关闭可写流，防止内存泄漏**。

**Linux 下一切皆文件**，为了测试，在创建可读流时，你可以不创建 test1.txt 文件，让可读流自动触发 error 事件并且将 writeable 的 close 方法注释掉，通过 linux 命令 `ls -l /proc/${pid}/fd` 查看 error 和非 error 前后的文件句柄变化。

```
readable.on('error', function(err) {  console.log('error', err);  // writeable.close();});console.log(process.pid); // 打印进程 IDsetInterval(function(){}, 5000) // 让程序不中断，进程不退出
```

以下为触发 error 错误下 test2.txt 这个文件 fd 将会一直打开，除非进程退出，所以重要的事情再说一遍，**如果使用 pipe 一定要做好错误监听手动关闭每个写入流**，以防止 “**内存泄漏**”。

```
...
l-wx------ 1 root root 64 Apr 10 15:47 19 -> /root/study/test2.txt
...
```

**注意，Mac 下没有 /proc 文件，可通过 docker 测试**。不想开两个终端的，也可以在程序 setInterval 定时器函数里使用 child_process 模块的 exec 函数执行 `ls -l /proc/${process.pid}/fd` 命令。

```
const { exec } = require('child_process');setInterval(function(){  exec(`ls -l /proc/${process.pid}/fd`, (error, stdout, stderr) => {    console.log(`stdout: \n`, stdout);  })}, 5000) // 让程序不中断，进程不退出
```

### pipeline

Stream 模块的一个新 API pipeline 方法，添加于 Node.js v10.0，Promise 风格需要 Node.js  v15.0+ 支持。相比较于 pipe 方法增加了错误处理机制，当管道中的某个流发生错误，它会自动处理并释放掉相应的资源。

```
try {  await pipeline(    readable,    writable  );  console.log('Pipeline succeeded.');} catch (err) {  console.log('error', err);}
```

串行模式 Stream 合并
--------------

使用 pipe 方法实现串行模式的流合并，根据前面讲的，设置可读流的 **end 为 false 保持写入流一直处于打开状态，直到所有的可读流结束（待合并的文件完成后），我们再将可写流给关闭。**

*   streamMerge 函数为入口函数
    
*   streamMergeRecursive 函数递归调用合并文件
    

```
const fs = require('fs');const path = require('path');/** * Stream 合并 * @param { String } sourceFileDirectory 源文件目录 * @param { String } targetFile 目标文件 */function streamMerge(sourceFileDirectory, targetFile) {  const scripts =  fs.readdirSync(path.resolve(__dirname, sourceFileDirectory)); // 获取源文件目录下的所有文件  const fileWriteStream = fs.createWriteStream(path.resolve(__dirname, targetFile)); // 创建一个可写流  // fs.readdir 读取出来的结果，根据具体的规则做下排序，防止因为顺序不对导致最终合并之后的文件无效。    return streamMergeRecursive(scripts, fileWriteStream, sourceFileDirectory);}/** * Stream 合并的递归调用 * @param { Array } scripts * @param { Stream } fileWriteStream */function streamMergeRecursive(scripts=[], fileWriteStream, sourceFileDirectory) {  // 递归到尾部情况判断  if (!scripts.length) {    return fileWriteStream.end("console.log('Stream 合并完成')"); // 最后关闭可写流，防止内存泄漏  }  const currentFile = path.resolve(__dirname, sourceFileDirectory, scripts.shift());  const currentReadStream = fs.createReadStream(currentFile); // 获取当前的可读流  currentReadStream.pipe(fileWriteStream, { end: false });  currentReadStream.on('end', function() {    streamMergeRecursive(scripts, fileWriteStream, sourceFileDirectory);  });  currentReadStream.on('error', function(error) { // 监听错误事件，关闭可写流，防止内存泄漏    console.error(error);    fileWriteStream.close();  });}streamMerge('./files', './file.js');
```

并发模式 Stream 合并
--------------

**流合并也是可以采用并发模式的，核心是通过可写流的 start、end 属性控制**。

start 有点类似于数据库查询的 skip，在**计算时要求文件分块的下标必须是 0、1、2... 这样的规则**，这种方式可以不用关注每一个流分块在文件中的存储顺序，也可以将可读流传输至可写流的指定位置。

例如，有一个大文件 dec47b76e3220432100a1155eff7f402（文件 md5 后的 hash 值） 根据 chunkSize（1048576）拆分为 3 个小文件。

```
/chunks
└── dec47b76e3220432100a1155eff7f402-1048576
    ├── dec47b76e3220432100a1155eff7f402-0
    ├── dec47b76e3220432100a1155eff7f402-1
    └── dec47b76e3220432100a1155eff7f402-2
```

并发模式的 Stream 合并代码实现如下：

```
/** * Stream concurrent merge * @param {String} sourceFileDirectory * @param {String} targetFile * @param {Number} chunkSize */export const streamConcurrentMerge = async (sourceFileDirectory, targetFile, chunkSize) => {  const filenames = await fs.readdir(sourceFileDirectory);    await Promise.all(filenames.map(filename => {    const index = filename.split('-').pop();    const start = index * chunkSize;    const end = (index + 1) * chunkSize;    return pipeline(      createReadStream(path.join(sourceFileDirectory, filename)),      createWriteStream(targetFile, {        start,        end,      })    );  }))}
```

总结
--

使用 pipe 时错误处理是件需要注意的事情，特别是出现这种情况 `readable.pipe(a).pipe(b).pipe(writable)`其中任何一个流关闭或出错都会导致整个管道停止工作，这个时候就要销毁所有的流，这种复杂的处理起来极其麻烦，**推荐使用 stream API pipeline 处理，或使用社区 NPM 库** pump。

将多个文件合并为一个文件，使用流的方式有两种：

*   **第一种是串行模式依次读取每个文件的内容，通过 pipe 方法写入可写流，直到最后一个文件读取完成关闭写入流**。
    
*   **另一种是并发模式，核心实现是利用写入流的 start、end 属性将可读流传输至可写流的指定位置，上面的实现还可以在优化，比如控制下并发的数量**。
    
      
    

- END -

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4Ioibu7XTJR1ABzARKoLxyWEWeIV6HJRII2GK1ntnCkVIqjY852gntBd5Q/640?wx_fmt=gif)

**敬请关注「Nodejs 技术栈」微信公众号，期望与志同道合的你一起打造优质 “Nodejs 技术栈” 交流群，一起互相学习进步！可长按下方二维码添加【五月君】个人微信备注 “Node” 邀请入群。**

![](https://mmbiz.qpic.cn/mmbiz_png/zPkNS9m6iatLmT5coKbicuqENgoc3Pz4QWwtrEoP2RU2thicCJHaKNmJ23Hh9jYvicpVgiauY6NxNaZ59D6svw1Qskg/640?wx_fmt=png)