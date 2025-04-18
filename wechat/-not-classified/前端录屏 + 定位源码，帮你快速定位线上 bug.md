> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bSy3-Nxg4Kifo4piyIVQKQ)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
--

如何快速定位线上 bug，是多数开发者都会遇到的难题

web-see[1] 前端监控方案，提供了 **前端录屏 + 定位源码** 方式，让 bug 无处藏身

这是前端监控的第二篇，该篇讲解如何实现错误还原功能，第一篇 从 0 到 1 搭建前端监控平台，面试必备的亮点项目（已开源）[2] 没有看过的小伙伴，建议先了解下

最终效果
----

在监控后台，通过报错信息列表，可以查看具体报错的源码，以及报错时的录屏回放

效果演示：

录屏记录了用户的所有操作，红色的线代表了鼠标的移动轨迹

定位源码
----

前端项目发布上线，代码一般都会进行压缩、混淆、甚至加密，当线上代码报错时，很难定位到具体的源码

SourceMap 完美解决了代码反解的问题，项目在打包时，除了生成最终 `XXX.js` 文件外，还会额外生成一个 `XXX.js.map` 的文件

.map 文件里包含了原始代码及其映射信息，可以利用它反解出报错信息的源码

### SourceMap 文件

先了解下 SourceMap 的基本内容

例如 `app.a2a3ceec.js` 代码如下：

```
var add=function(x, y){return x+y;};
//# sourceMappingURL=app.a2a3ceec.js.map
复制代码


```

其中 sourceMappingURL 用来说明该文件对应的 map 文件

对应的 `app.a2a3ceec.js.map` 代码如下：

```
 {
  version: 3,
// SourceMap标准版本,最新的为3

file: "js/app.a2a3ceec.js",
// 转换后的文件名

sourceRoot: "",
// 转换前的文件所在目录，如果与转换前的文件在同一目录，该项为空

sources: [
    // 转换前的文件，该项是一个数组，表示可能存在多个文件合并

    "webpack://web-see-demo/./src/App.vue",

    "webpack://web-see-demo/./src/main.js",
  ],
names: [],
// 转换前的所有变量名和属性名

sourcesContent: [
    // 原始文件内容

    "const add = (x,y) => {\n  return x+y;\n}",
  ],

// 所有映射点

mappings:
    "AAAA,IAAM,GAAG,GAAG,UAAC,CAAQ,EAAC,CAAQ;IAC5B,OAAO,CAAC,GAAC,CAAC,CAAC;AACb,CAAC,CAAA",
};


```

其中 sources 和 sourcesContent 是关键字段，下文的还原示例中将用到

### source-map-js 库

代码还原，这里主要使用 source-map-js[3] 库，下面介绍下如何使用

示例代码：

```
   import sourceMap from"source-map-js";

/**
  * findCodeBySourceMap用于获取map文件对应的源代码
  * @param { string } fileName .map文件名称
  * @param { number } line 发生错误的行号
  * @param { number } column 发生错误的列号
  * @param { function } 回调函数，返回对应的源码
  */

const findCodeBySourceMap =async ({ fileName, line, column }, callback) => {

// loadSourceMap 用于获取服务器上 .map 的文件内容

let sourceData = await loadSourceMap(fileName);

let { sourcesContent, sources } = sourceData;

// SourceMapConsumer实例表示一个已解析的源映射

// 可以通过在生成的源中给它一个文件位置来查询有关原始文件位置的信息

let consumer = await sourceMap.SourceMapConsumer.create(sourceData);

// 输入错误的发生行和列，可以得到源码对应原始文件、行和列信息

let result = consumer.originalPositionFor({
    line,
    column,
  });

// 从sourcesContent得到具体的源码信息

let code = sourcesContent[sources.indexOf(result.source)];

  callback(code);
  };

```

source-map 的还原流程：

1、从服务器获取指定. map 的文件内容

2、new 一个 SourceMapConsumer 的实例，表示一个已解析的源映射，给它一个文件位置来查询有关原始文件位置的信息

3、输入报错发生的行和列，可以得到源码对应原始文件名、行和列信息

4、从源文件的 sourcesContent 字段中，获取对应的源码信息

接下来的重点就变为：如何获取报错发生的原始文件名、行和列信息

### error-stack-parser 库

通过第一篇文章的介绍，我们知道可以通过多种方式来捕获报错

比如 error 事件、unhandledrejection 事件、vue 中通过 Vue.config.errorHander、react 中通过 componentDidCatch

为了消除各浏览器的差异，使用 error-stack-parser[5] 库来提取给定错误的原始文件名、行和列信息

示例代码：

```
  import ErrorStackParser from "error-stack-parser";

ErrorStackParser.parse(new Error("BOOM"));  

// 返回值 StackFrame 堆栈列表
[ StackFrame({functionName:'foo', args: [], fileName: 'path/to/file.js', lineNumber: 35, columnNumber: 79, 
  isNative: false, isEval: false, isConstructor: true,}),

StackFrame(...  and so on ...) ]


```

这里简单说明下 JS 堆栈列表

堆栈示例：

```
functionc() {
try {var bar = baz;thrownewError()  } catch (e) {console.log(e.stack);  }}functionb() {  c();}functiona() {  b();}a();复制代码


```

上述代码中会在执行到 c 函数的时候报错，调用栈为 a -> b -> c，如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OuG2lqVSjACcNibJe6ODIkDoPEwenxianyA7C0aicFJtAuVQ5fItjTOb4w/640?wx_fmt=other)stack.png

一般我们只需要定位到 c 函数的堆栈信息，所以使用 error-stack-parser 库的时候，只取 StackFrame 数组中的第一个元素

最终代码：

```
import ErrorStackParser from'error-stack-parser';

// 取StackFrame数组中的第一个元素
let stackFrame = ErrorStackParser.parse(error)[0];
// 获取对应的原始文件名、行和列信息，并上报
let { fileName, columnNumber, lineNumber } = stackFrame;
复制代码


```

### 示例演示

下载 web-see-demo[6] 安装并运行

1）点击 **js 错误** 按钮，会执行 HomeView.vue 文件中的 codeErr 方法

codeErr 的源码为：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1O7zJkFM5ia3EEjfYCBplMpv19QHDKdwoMjsgrwPc6AFib52uegvX5ps8g/640?wx_fmt=other)codeErr.png

2）Vue.config.errorHander 中捕获到报错信息为：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OhTFdtNkXnicbfE2ok41sCfEl1PsSl2tRLZO4OqodP76EKJpzBL6OjSw/640?wx_fmt=other)length.png

3）使用 ErrorStackParser.parse 解析后的 stackFrame 为：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OJ6aGpK0phBQbO7dAgRkBzYCicMqu4CZ39msmCkzIticK2IFu5hdnY9xQ/640?wx_fmt=other)stackFrame.png

4）经过 consumer.originalPositionFor 还原后的 result 结果为：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OkQNTyOOibpbceqelcxT4UBiaiaibvPslwgDBqFjiaAu5pqxPUpZiac3ejxJw/640?wx_fmt=other)result.png

5）最终拿到的源码：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1O1oQfa5UHM9q6WIa6qX3PgBgPYvmjVeNmetQebaibGo7ygCTkQJTy4eQ/640?wx_fmt=other)code.png

### 流程总结

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OMdXmtl1hlY1eqibCicZh2TdvpgTHiaibGDpPODrACl2LmBCnsShM0j9kyw/640?wx_fmt=other)sourcemap.png

如上图所示，定位源码流程总结：

1、项目中引入监控 SDK，打包后将 js 文件发布到服务器上

2、将 .map 文件放到指定的地址，统一存储

3、当线上代码报错时，利用 error-stack-parser 获取具体原始文件名、行和列信息，并上报

4、利用 source-map 从 .map 文件中得到对应的源码并展示

前端录屏
----

web-see 监控通过 rrweb[7] 提供了前端录屏的功能

### rrweb 使用

先介绍下在 vue 中如何使用

录制示例：

```
import { record } from'rrweb';// events存储录屏信息let events = [];// record 用于记录 `DOM` 中的所有变更rrweb.record({  emit(event, isCheckout) {// isCheckout 是一个标识，告诉你重新制作了快照if (isCheckout) {      events.push([]);    }    events.push(event);  },recordCanvas: true, // 记录 canvas 内容checkoutEveryNms: 10 * 1000, // 每10s重新制作快照checkoutEveryNth: 200, // 每 200 个 event 重新制作快照});复制代码


```

播放示例：

```
<template>
  <divref='player'>
  </div>
</template>
<script>import rrwebPlayer from'rrweb-player';import'rrweb-player/dist/style.css';exportdefault {   mounted() {// 将记录的变更按照对应的时间一一重放new rrwebPlayer(        {target: this.$refs.player, // 回放所需要的HTML元素data: { events }        },        {UNSAFE_replayCanvas: true// 回放 canvas 内容        }     )   }}</script>
复制代码


```

### rrweb 原理浅析

rrweb 主要由 `rrweb` 、 `rrweb-player` 和 `rrweb-snapshot` 三个库组成：

1）rrweb：提供了 record 和 replay 两个方法；record 方法用来记录页面上 DOM 的变化，replay 方法支持根据时间戳去还原 DOM 的变化

2）rrweb-player：基于 svelte 模板实现，为 rrweb 提供了回放的 GUI 工具，支持暂停、倍速播放、拖拽时间轴等功能。内部调用了 rrweb 的提供的 replay 等方法

3）rrweb-snapshot：包括 snapshot 和 rebuilding 两大特性，snapshot 用来序列化 DOM 为增量快照，rebuilding 负责将增量快照还原为 DOM

rrweb 整体流程：

1）rrweb 在录制时会首先进行首屏 DOM 快照，遍历整个页面的 DOM 树，转换为 JSON 结构数据，使用增量快照的处理方式，通过 `mutationObserver` 获取 DOM 增量变化，同步转换为 JSON 数据进行存储

2）整个录制的过程会生成 unique id，来确定增量数据所对应的 DOM 节点，通过 timestamp 保证回放顺序。

3） 回放时，会创建一个 iframe 作为承载事件回放的容器，针对首屏 DOM 快照进行重建，在遍历 JSON 的同时，根据序列化后的节点数据构建出实际的 DOM 节点

4）rrweb 可以监听的用户行为包括：鼠标移动，鼠标交互，页面滚动，视窗变化、用户输入等，通过添加相应的监听事件来实现

### 压缩数据

如果一直录屏，数据量是巨大的

实测下来，录制 10s 的时长，数据大小约为 8M 左右（页面的不同复杂度、用户不同操作的频率都会造成大小不一样）

数据如果不经过压缩，直接传给后端，面对大量的用户，需要非常高的带宽做支持。还好，rrweb 官方提供了数据压缩函数 [8]

基于 packFn 的单数据压缩，在录制时可以作为 `packFn` 传入

```
rrweb.record({
  emit(event) {},
  packFn: rrweb.pack,
});
复制代码


```

回放时，需要传入 rrweb.unpack 作为 `unpackFn` 传入

```
const replayer = new rrweb.Replayer(events, {
  unpackFn: rrweb.unpack,
});
复制代码


```

但是官方提供的压缩方式，是对每个 event 数据单独进行压缩，压缩比不高。实测下来，压缩比在 70% 左右，比如原来 8M 的数据，压缩后为 2.4M 左右

官方更加推荐将多个 event 批量一次性压缩，这样压缩效果更好

web-see 内部使用 **pako.js[9]、js-base64[10]** 相结合的压缩方式，实测下来，压缩比为 85% 以上，原来 8M 的数据，压缩后为 1.2M 左右

压缩代码示例：

```
import pako from'pako';import { Base64 } from'js-base64';// 压缩exportfunctionzip(data) {if (!data) return data;// 判断数据是否需要转为JSONconst dataJson = typeof data !== 'string' && typeof data !== 'number' ? JSON.stringify(data) : data;// 使用Base64.encode处理字符编码，兼容中文const str = Base64.encode(dataJson);let binaryString = pako.gzip(str);let arr = Array.from(binaryString);let s = '';  arr.forEach((item) => {    s += String.fromCharCode(item);  });return Base64.btoa(s);}复制代码


```

解压代码示例：

```
import { Base64 } from 'js-base64';
import pako from 'pako';// 解压export function unzip(b64Data) {  let strData = Base64.atob(b64Data);  let charData = strData.split('').map(function (x) {    return x.charCodeAt(0);  });  let binData = new Uint8Array(charData);  let data = pako.ungzip(binData);  // ↓切片处理数据，防止内存溢出报错↓  let str = '';  const chunk = 8 * 1024;  let i;  for (i = 0; i < data.length / chunk; i++) {    str += String.fromCharCode.apply(null, data.slice(i * chunk, (i + 1) * chunk));  }  str += String.fromCharCode.apply(null, data.slice(i * chunk));  // ↑切片处理数据，防止内存溢出报错↑  const unzipStr = Base64.decode(str);  let result = '';  // 对象或数组进行JSON转换  try {    result = JSON.parse(unzipStr);  } catch (error) {    if (/Unexpected token o in JSON at position 0/.test(error)) {      // 如果没有转换成功，代表值为基本数据，直接赋值      result = unzipStr;    }  }  return result;}复制代码


```

### 何时上报录屏数据

一般关注的是，页面报错的时候用户做了哪些操作，所以目前只把报错前 10s 的录屏上报到服务端

如何只上报报错时的录屏信息呢 ？

1）window 上设置 hasError、recordScreenId 变量，hasError 用来判断某段时间代码是否报错；recordScreenId 用来记录此次录屏的 id

2）当页面发出报错需要上报时，判断是否开启了录屏，如果开启了，将 hasError 设为 true，同时将 window 上的 recordScreenId，存储到此次上报信息的 data 中

3）rrweb 设置 10s 重新制作快照的频率，每次重置录屏时，判断 hasError 是否为 true（即这段时间内是否发生报错），有的话将这次的录屏信息上报，并重置录屏信息和 recordScreenId，作为下次录屏使用

4）后台报错列表，从本次报错报的 data 中取出 recordScreenId 来播放录屏

录屏的代码示例：

```
handleScreen() {
 try {  // 存储录屏信息  let events = [];  record({    emit(event, isCheckout) {      if (isCheckout) {        // 此段时间内发生错误，上报录屏信息        if (_support.hasError) {          let recordScreenId = _support.recordScreenId;          // 重置recordScreenId，作为下次使用          _support.recordScreenId = generateUUID();          transportData.send({            type: EVENTTYPES.RECORDSCREEN,            recordScreenId,            time: getTimestamp(),            status: STATUS_CODE.OK,            events: zip(events)          });          events = [];          _support.hasError = false;        } else {          // 不上报，清空录屏          events = [];          _support.recordScreenId = generateUUID();        }      }      events.push(event);    },    recordCanvas: true,    // 默认每10s重新制作快照    checkoutEveryNms: 1000 * options.recordScreentime  });复制代码


```

### 遗留问题，在线求解

按照官方的 canvas 配置，验证下来，rrweb 还是不支持 canvas 的录制，比如使用 echarts 画图，图形区域的录屏显示是空白的

官方配置 [11] 如下：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OGTVomyVblC5F7z4qE9MN13pialsquwuOlShmrXhCyApyVgADf980mVA/640?wx_fmt=other)Canvas.png

测试 demo[12] 如下：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1Op1vCr2jj7AgT4lsb9drkibAhrD3125vHxZdx8uqNJoKzV9Vmp3s9nicA/640?wx_fmt=other)echart.png

录屏回放，图形这块区域是空白的：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqz6mZhm0EIKrgL7FyRhv1OIoEeIbODQ3r9ctD0dCVhjcbONDXBja8iaBfBZlzOOiakibEfBGFJRHP3w/640?wx_fmt=other)canvas.gif

这块有研究的小伙们麻烦指导下，问题出在哪里，感谢 😘

总结
--

前端录屏 + 定位源码，是目前比较流行的错误还原方式，对于快速定位线上 bug 大有裨益

这两篇文章只是关于前端监控的入门级介绍，其中可以深挖的点还有很多，欢迎小伙们多多讨论与交流 💕

> 作者：海阔_天空
> 
> https://juejin.cn/post/7173596154297810957

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```