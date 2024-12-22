> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/L1kdwgXFdU8LUGn0lcAWbw)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 原文链接: https://juejin.cn/post/7351300892572745764
> 
> 作者：大码猴

在 Web 应用中，文件上传是一项常见的功能。然而，当文件体积过大时，传统的文件上传方式往往会导致页面卡顿，用户体验不佳。为了解决这一问题，我们可以利用`Web Worker`技术来进行大文件的切片上传。本文将详细介绍如何使用`Web Worker`进行大文件切片上传，并通过具体的例子来演示其实现过程。

Web Worker 简介
-------------

Web Worker 是 Web 浏览器提供的一种在后台线程中运行 JavaScript 的功能。它独立于主线程运行，可以执行计算密集型或长时间运行的任务，而不会阻塞页面的渲染和交互。通过将大文件切片上传的逻辑放在 Web Worker 中执行，我们可以充分利用浏览器的多线程能力，提高上传速度，并保持页面的流畅运行。

### Web Worker 基于 Vue 的基础用法

在 Vue 项目中配置 webpack 来使用 web-worker 涉及几个关键步骤。这主要涉及到处理 worker 文件的加载，确保它们被正确地打包和引用。以下是一个基本的配置过程：

#### 1. 安装 worker-loader

首先，你需要安装`worker-loader`，这是一个 webpack 的 loader，用于处理 worker 文件。

```
npm install --save-dev worker-loader


```

#### 2. 配置 webpack

```
module.exports = {
  publicPath: './',

  chainWebpack: config => {  
    config.module  
       .rule('worker')  
      .test(/\.worker\.js$/)  // 如果需要.worker.js后缀
      .use('worker-loader')  
      .loader('worker-loader')
      .options({ // 可以查阅worker-loader文档，根据自己的需求进行配置
       })
  }  
}


```

#### 3. 创建和使用 worker

创建一个 worker 文件，并给它一个`.worker.js`的扩展名。例如，你可以创建一个`my-worker.worker.js`文件。

```
// my-worker.worker.js  
self.onmessage = function(e) {  
  console.log('Worker: Hello World');  
  const result = doSomeWork(e.data);  
  self.postMessage(result);  
};  
  
function doSomeWork(data) {  
  // 模拟一些工作  
  return data * 2;  
}


```

在你的 Vue 组件或其他 JavaScript 文件中，你可以像下面这样创建一个 worker 实例：

```
// MyComponent.vue 或其他.js文件  
import MyWorker from './my-worker.worker.js';  
  
export default {  
  methods: {  
    startWorker() {  
      const myWorker = new MyWorker();  
  
      myWorker.onmessage = (e) => {  
        console.log('Main script: Received result', e.data);  
      };  
  
      myWorker.postMessage(100); // 发送数据给worker  
    }  
  },  
  mounted() {  
    this.startWorker();  
  }  
};


```

现在，当组件被挂载时，它将启动 worker，发送一个消息，并在收到 worker 的响应时打印结果。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwsCYm2VaU3bibo90Qloosng2Bich2D32ZEAicPvicd7BtPXtKiaMRRPLVhA1RtfT3DIL9SzuhegfNw39jw/640?wx_fmt=other&from=appmsg)image.png

> 接下来我们进行实战，利用 web-worker 的机制进行大文件切片上传

实战：实现大文件切片上传
------------

### 1. 逻辑梳理

1.  **文件切片**：使用 JavaScript 的 `Blob.prototype.slice()` 方法将大文件切分成多个切片。
    
2.  **上传切片**：使用 `axios` 或其他 HTTP 客户端库逐个上传切片。可以为每个切片生成一个唯一的标识符（例如，使用文件的哈希值和切片索引），以便后端能够正确地将它们合并。
    
3.  **客户端线程数**：获取用户 CPU 线程数量，以便最大优化上传文件速度。
    
4.  **控制上传接口的并发数量**：防止大量的请求并发导致页面卡死，设计一个线程队列，控制请求数量一直保持在 6。
    

### 2. 实现

我会在文章后面放 demo 的 GitHub 源码。

#### 1. 获取客户端线程数量

`navigator.hardwareConcurrency` 是一个只读属性，它返回用户设备的逻辑处理器内核数。

```
export const getConcurrency = () => navigator.hardwareConcurrency || 4 // 浏览器不支持就默认4核


```

#### 2. 主线程

定义和处理一些必要的常量，并且根据用户的线程数进行开启多线程 Web-worker 任务处理文件切片。

```
import { defer, createEventHandler } from 'js-hodgepodge'
import FileWorker from './files.worker'

export const getConcurrency = () => navigator.hardwareConcurrency || 4

export const handleEvent = () => createEventHandler('handleSchedule')

export const sliceFile = file => {

  const dfd = defer()
  
  const chunkSize = 1024 // 1Kb
  const thread = getConcurrency() // 线程数

  const chunks = []
  const chunkNum = Math.ceil(file.size / chunkSize) // 切片总数量

  const workerChunkCount = Math.ceil(chunkNum / thread) // 每个线程需要处理的切片数量
  let finishCount = 0;

  for (let i = 0; i < thread; i++) {

    const worker = new FileWorker()

    // 计算每个线程的开始索引和结束索引
    const startIndex = i * workerChunkCount;

    let endIndex = startIndex + workerChunkCount;

    // 防止最后一个线程结束索引大于文件的切片数量的总数量
    if (endIndex > chunkNum) {
      endIndex = chunkNum;
    }

    worker.postMessage({
      file,
      chunkSize,
      startIndex,
      endIndex,
    });

    worker.onmessage = (e) => {

      // 接收到 worker 线程返回的消息
      for (let i = startIndex; i < endIndex; i++) {

        chunks[i] = {
          ...e.data[i - startIndex],
          chunkNum,
          filename: file.name
        };

      }

      worker.terminate(); // 关闭线程

      finishCount++;

      if (finishCount === thread) {
        
        dfd.resolve({
          chunks,
          chunkNum
        });
      }
    };

  }

  return dfd
}


```

#### 3. 实现文件切片

首先，我们需要创建一个 Web Worker 脚本，用于处理文件切片和切片 hash

```
import md5 from 'js-md5'

self.onmessage = async function ({
  data: {
    file,
    chunkSize,
    startIndex,
    endIndex,
  }
}) {

  const arr = [];

  for (let i = startIndex; i < endIndex; i++) {
    arr.push(
      createChunks(file, i, chunkSize)
    );
  }
  const chunks = await Promise.all(arr)

  // 提交线程信息
  postMessage(chunks);
}

const createChunks = (
  file,
  index,
  chunkSize
) => {
  return new Promise((resolve) => {

    // 开始第几个*分片的大小
    const start = index * chunkSize;

    // 结束时start + 分片的大小
    const end = start + chunkSize;
    const fileReader = new FileReader();

    // 每个切片都通过FileReader读取为ArrayBuffer
    fileReader.onload = (e) => {

      const content = new Uint8Array(e.target.result);
      const files = file.slice(start, end);

      const md5s = md5.arrayBuffer(content)

      function arrayBufferToHex(buffer) {
        let bytes = new Uint8Array(buffer);
        let hexString = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          let hex = bytes[i].toString(16);

          hexString += hex.length === 1 ? '0' + hex : hex;
        }
        return hexString;
      }

      resolve({
        start,
        end,
        index,
        hash: arrayBufferToHex(md5s),  // 生成唯一的hash
        files,
      });
    };

    // 读取文件的分片
    fileReader.readAsArrayBuffer(file.slice(start, end));
  });
}


```

Web Worker 通过`onmessage`事件接收消息。当主线程发送消息时，这个消息会作为参数传递给`onmessage`函数。

切片`hash`处理流程：使用`FileReader`来读取文件内容。当文件分片读取完毕后，会触发`onload`这个事件, 使用`new Uint8Array(e.target.result)`将读取的 ArrayBuffer 转换为 Uint8Array，再利用`js-md5`的使用`md5.arrayBuffer(content)`计算分片的 MD5 哈希值，使用`arrayBufferToHex`函数将切片 buffer 转换为十六进制 String，当所有分片处理完毕后，将结果（即分片及其相关信息）发送`postMessage`回主线程。

#### 4. 请求池的设计与处理

我这里创建一个请求队列，并使用 Promise 来控制并发请求的数量。创建一个数组来存储待处理的请求，并使用 Promise 来控制每次只有一定数量的请求被发送。当某个请求完成时，再从队列中取出下一个请求来发送。

```
export const uploadFile = (
  chunks // 总切片
) => {
  chunks = chunks || []

  let schedule = 0 // 进度

  const { dispatch } = handleEvent()

  const requestQueue = (concurrency) => {
    concurrency = concurrency || 6
    const queue = [] // 线程池
    let current = 0

    const dequeue = () => {
      while (current < concurrency && queue.length) {
        current++;
        const requestPromiseFactory = queue.shift();
        requestPromiseFactory()
          .then(result => { // 上传成功处理
            console.log(result)

            schedule++; // 收集上传切片成功的数量

            dispatch(window, schedule);  // 事件派发，通知进度
          })
          .catch(error => { // 失败
            console.log(error)
          })
          .finally(() => {
            current--;
            dequeue();
          });
      }

    }

    return (requestPromiseFactory) => {
      queue.push(requestPromiseFactory)
      dequeue()
    }

  }

  const handleFormData = obj => {
    const formData = new FormData()

    Object
      .entries(obj)
      .forEach(([key, val]) => {
        formData.append(key, val)
      })

    return formData
  }

  const enqueue = requestQueue(6)

  for (let i = 0; i < chunks.length; i++) {

    enqueue(() => axios.post(
      '/api/upload',
      handleFormData(chunks[i]),
      {
        headers: {
          'Content-Type': 'multipart/form-data' 
        }
      }
    ))
  }

  return schedule

}


```

利用了第三方库`js-hodgepodge`的发布订阅，将上传切片成功的数量发布给主界面，得到相应的上传进度。其实这个库的`createEventHandler`方法我单独写过一篇文章，感兴趣的朋友可以看《CustomEvent 实现事件发布订阅（事件之间的通信）》[1]

#### 7. 主界面代码

```
<template>
  <div>
    <input type="file" ref="file">

    <button @click="handleUpload">提交</button>

    <p>进度：{{ progress * 100 }}%</p>
  </div>
</template>

<script>
import { sliceFile, uploadFile, handleEvent } from './file.utils'
export default {

  data() {
    return {
      progress: 0
    }
  },

  methods: {
    async handleUpload() {
      const file = this.$refs.file.files[0]
    
      if(!file) {
        return
      }

      console.time()

      const dfd = sliceFile(file)

      dfd
        .promise
        .then(({ chunks, chunkNum }) => {
          uploadFile(chunks)

          const { addEventListener } = handleEvent()

          const eject = addEventListener(window, ({ detail: schedule }) => {

            this.progress = schedule / chunkNum

            if(schedule === chunkNum) { // 上传完成，关闭事件监听
              eject()
            }
          })
        })

      console.timeEnd() 
    }
  }
}
</script>

<style>

</style>


```

#### 6. 执行响应结果打印

当执行一个大文件上传时，时间可被大大的压缩了。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwsCYm2VaU3bibo90Qloosng2KsCYfEf2rLAa9W5WYexGt8cbeWQsMOMQUGIaPMt1Iib4GJTAgsF5SIQ/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwsCYm2VaU3bibo90Qloosng2wIgZO5NO9se06ZsmSdBLsyjAnLWf3BBoPem2AiasgMByTAOLwyohubg/640?wx_fmt=other&from=appmsg)image.png

node 后端切片与组合结果

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwsCYm2VaU3bibo90Qloosng2DszhMMNC4tJRs3Y5JIhvpCTicYKUwzFMYVrWBShk6XDZNfFyzWYZCHg/640?wx_fmt=other&from=appmsg)image.png

其实整个流程比较重要的就是文件切片，和请求池的设计，具体项目细节请查看源码 github.com/LIAOJIANS/f…[2] 如果你觉得还 OK，或者对你有帮助的请给个 star 哦，感谢！或者你有更好的设计欢迎评论区讨论。

参考资料

[1]

https://juejin.cn/post/7349588906911088692: https://juejin.cn/post/7349588906911088692

[2]

https://github.com/LIAOJIANS/file-web-worker: https://github.com/LIAOJIANS/file-web-worker

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```