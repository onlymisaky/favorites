> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/IIZEStWYLz8N9ncLXPRJNw)

`webpack` 是我们现阶段要掌握的重要的打包工具之一，我们知道 `webpack` 会递归的构建依赖关系图，其中包含应用程序的每个模块，然后将这些模块打包成一个或者多个 `bundle`。

那么`webpack` 打包后的代码是怎样的呢？是怎么将各个 `bundle`连接在一起的？模块与模块之间的关系是怎么处理的？动态 `import()` 的时候又是怎样的呢？

本文让我们一步步来揭开 `webpack` 打包后代码的神秘面纱

准备工作
----

创建一个文件，并初始化

```
mkdir learn-webpack-output<br style="visibility: visible;">cd learn-webpack-output<br style="visibility: visible;">npm init -y <br style="visibility: visible;">yarn add webpack webpack-cli -D<br style="visibility: visible;">
```

根目录中新建一个文件 `webpack.config.js`，这个是 `webpack` 默认的配置文件

```
const path = require('path');module.exports = {  mode: 'development', // 可以设置为 production  // 执行的入口文件  entry: './src/index.js',  output: {    // 输出的文件名    filename: 'bundle.js',    // 输出文件都放在 dist     path: path.resolve(__dirname, './dist')  },  // 为了更加方便查看输出  devtool: 'cheap-source-map'}
```

然后我们回到 `package.json` 文件中，在 `npm script` 中添加启动 `webpack` 配置的命令

```
"scripts": {  "test": "echo \"Error: no test specified\" && exit 1",  "build": "webpack"}
```

新建一个 `src`文件夹，新增 `index.js` 文件和 `sayHello` 文件

```
// src/index.jsimport sayHello from './sayHello';console.log(sayHello, sayHello('Gopal'));
```

```
// src/sayHello.jsfunction sayHello(name) {  return `Hello ${name}`;}export default sayHello;
```

一切准备完毕，执行 `yarn build`

分析主流程
-----

看输出文件，这里不放具体的代码，有点占篇幅，可以点击这里查看 [1]

### 其实就是一个 IIFE

莫慌，我们一点点拆分开看，其实总体的文件就是一个 `IIFE`——立即执行函数。

```
(function(modules) { // webpackBootstrap // The module cache var installedModules = {}; function __webpack_require__(moduleId) {    // ...省略细节 } // 入口文件 return __webpack_require__(__webpack_require__.s = "./src/index.js");})({ "./src/index.js": (function(module, __webpack_exports__, __webpack_require__) {}),  "./src/sayHello.js": (function(module, __webpack_exports__, __webpack_require__) {})});
```

函数的入参 `modules` 是一个对象，对象的 `key` 就是每个 `js` 模块的相对路径，`value` 就是一个函数（我们下面称之为**模块函数**）。`IIFE` 会先 `require` 入口模块。即上面就是 `./src/index.js`：

```
// 入口文件return __webpack_require__(__webpack_require__.s = "./src/index.js");
```

然后入口模块会在执行时 `require` 其他模块例如 `./src/sayHello.js"`以下为简化后的代码，从而不断的加载所依赖的模块，形成依赖树，比如如下的**模块函数**中就引用了其他的文件 `sayHello.js`

```
{"./src/index.js": (function(module, __webpack_exports__, __webpack_require__) {     __webpack_require__.r(__webpack_exports__);   var _sayHello__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/sayHello.js");    console.log(_sayHello__WEBPACK_IMPORTED_MODULE_0__["default"],    Object(_sayHello__WEBPACK_IMPORTED_MODULE_0__["default"])('Gopal'));  })}
```

### 重要的实现机制——`__webpack_require__`

这里去 `require` 其他模块的函数主要是 `__webpack_require__` 。接下来主要介绍一下 `__webpack_require__` 这个函数

```
// 缓存模块使用  var installedModules = {};  // The require function  // 模拟模块的加载，webpack 实现的 require  function __webpack_require__(moduleId) {    // Check if module is in cache    // 检查模块是否在缓存中，有则直接从缓存中获取    if(installedModules[moduleId]) {      return installedModules[moduleId].exports;    }    // Create a new module (and put it into the cache)    // 没有则创建并放入缓存中，其中 key 值就是模块 Id,也就是上面所说的文件路径    var module = installedModules[moduleId] = {      i: moduleId, // Module ID      l: false, // 是否已经执行      exports: {}    };    // Execute the module function    // 执行模块函数，挂载到 module.exports 上。this 指向 module.exports    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);    // Flag the module as loaded    // 标记这个 module 已经被加载    module.l = true;    // Return the exports of the module    // module.exports通过在执行module的时候，作为参数存进去，然后会保存module中暴露给外界的接口，如函数、变量等    return module.exports;  }
```

第一步，`webpack` 这里做了一层优化，通过对象 `installedModules` 进行缓存，检查模块是否在缓存中，有则直接从缓存中获取，没有则创建并放入缓存中，其中 `key` 值就是模块 `Id`，也就是上面所说的文件路径

第二步，然后执行**模块函数**，将 `module`, `module.exports`, `__webpack_require__` 作为参数传递，并把模块的函数调用对象指向 `module.exports`，保证模块中的 `this` 指向永远指向当前的模块。

第三步，最后返回加载的模块，调用方直接调用即可。

所以**这个`__webpack_require__`就是来加载一个模块，并在最后返回模块 `module.exports` 变量**

### webpack 是如何支持 ESM 的

可能大家已经发现，我上面的写法是 `ESM` 的写法，对于模块化的一些方案的了解，可以看看我的另外一篇文章【面试说】Javascript 中的 CJS, AMD, UMD 和 ESM 是什么？[2]

我们重新看回**模块函数**

```
{"./src/index.js": (function(module, __webpack_exports__, __webpack_require__) {     __webpack_require__.r(__webpack_exports__);   var _sayHello__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/sayHello.js");    console.log(_sayHello__WEBPACK_IMPORTED_MODULE_0__["default"],    Object(_sayHello__WEBPACK_IMPORTED_MODULE_0__["default"])('Gopal'));  })}
```

我们看看 `__webpack_require__.r` 函数

```
__webpack_require__.r = function(exports) { object.defineProperty(exports, '__esModule', { value: true });};
```

就是为 `__webpack_exports__` 添加一个属性 `__esModule`，值为 `true`

再看一个 `__webpack_require__.n` 的实现

```
// getDefaultExport function for compatibility with non-harmony modules__webpack_require__.n = function(module) {  var getter = module && module.__esModule ?    function getDefault() { return module['default']; } :    function getModuleExports() { return module; };  __webpack_require__.d(getter, 'a', getter);  return getter;};
```

`__webpack_require__.n`会判断 module 是否为 es 模块，当`__esModule`为 true 的时候，标识 module 为 es 模块，默认返回`module.default`，否则返回`module`。

最后看 `__webpack_require__.d`，主要的工作就是将上面的 `getter` 函数绑定到 exports 中的属性 a 的 `getter` 上

```
// define getter function for harmony exports__webpack_require__.d = function(exports, name, getter) { if(!__webpack_require__.o(exports, name)) {  Object.defineProperty(exports, name, {   configurable: false,   enumerable: true,   get: getter  }); }};
```

我们最后再看会 `sayHello.js` 打包后的**模块函数**，可以看到这里的导出是 `__webpack_exports__["default"]` ，实际上就是 `__webpack_require__.n` 做了一层包装来实现的，其实也可以看出，实际上 `webpack` 是可以支持 `CommonJS` 和 `ES Module` 一起混用的

```
"./src/sayHello.js":  /*! exports provided: default */ (function(module, __webpack_exports__, __webpack_require__) {  "use strict";  __webpack_require__.r(__webpack_exports__);  function sayHello(name) {    return `Hello ${name}`;  }  /* harmony default export */ __webpack_exports__["default"] = (sayHello); })
```

目前为止，我们大致知道了 `webpack` 打包出来的文件是怎么作用的了，接下来我们分析下代码分离的一种特殊场景——动态导入

动态导入
----

代码分离是 `webpack` 中最引人注目的特性之一。此特性能够把代码分离到不同的 `bundle` 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 `bundle`，以及控制资源加载优先级，如果使用合理，会极大影响加载时间。

常见的代码分割有以下几种方法：

*   **入口起点**：使用 `entry`[3] 配置手动地分离代码。
    
*   **防止重复**：使用 Entry dependencies[4] 或者 `SplitChunksPlugin`[5] 去重和分离 chunk。
    
*   **动态导入**：通过模块的内联函数调用来分离代码。
    

本文我们主要看看动态导入，我们在 `src` 下面新建一个文件 `another.js`

```
function Another() {  return 'Hi, I am Another Module';}export { Another };
```

修改 `index.js`

```
import sayHello from './sayHello';console.log(sayHello, sayHello('Gopal'));// 单纯为了演示，就是有条件的时候才去动态加载if (true) {  import('./Another.js').then(res => console.log(res))}
```

我们来看下打包出来的内容，忽略 .map 文件，可以看到多出一个 `0.bundle.js` 文件，这个我们称它为动态加载的 `chunk`，`bundle.js` 我们称为主 `chunk`

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSpg5XC2pGXtlAk7tCsYoxpMwwicytPXSbQlia7YRfKbvoP0lckZdFhNiajibb3UumnazBgu8Vc6mdE0ww/640?wx_fmt=png)

输出的代码的话，主 `chunk` 看这里 [6]，动态加载的 `chunk` 看这里 [7] ，下面是针对这两份代码的分析

### 主 chunk 分析

我们先来看看主 `chunk`

内容多了很多，我们来细看一下：

首先我们注意到，我们动态导入的地方编译后变成了以下，这是看起来就像是一个异步加载的函数

```
if (true) {  __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./Another.js */ "./src/Another.js")).then(res => console.log(res))}
```

所以我们来看 `__webpack_require__.e` 这个函数的实现

#### `__webpack_require__.e` ——使用 JSONP 动态加载

```
// 已加载的chunk缓存var installedChunks = {  "main": 0};// ...__webpack_require__.e = function requireEnsure(chunkId) {  // promises 队列，等待多个异步 chunk 都加载完成才执行回调  var promises = [];  // JSONP chunk loading for javascript  var installedChunkData = installedChunks[chunkId];  // 0 代表已经 installed  if(installedChunkData !== 0) { // 0 means "already installed".    // a Promise means "currently loading".    // 目标chunk正在加载，则将 promise push到 promises 数组    if(installedChunkData) {      promises.push(installedChunkData[2]);    } else {      // setup Promise in chunk cache      // 利用Promise去异步加载目标chunk      var promise = new Promise(function(resolve, reject) {        // 设置 installedChunks[chunkId]        installedChunkData = installedChunks[chunkId] = [resolve, reject];      });      // i设置chunk加载的三种状态并缓存在 installedChunks 中，防止chunk重复加载      // nstalledChunks[chunkId]  = [resolve, reject, promise]      promises.push(installedChunkData[2] = promise);      // start chunk loading      // 使用 JSONP      var head = document.getElementsByTagName('head')[0];      var script = document.createElement('script');      script.charset = 'utf-8';      script.timeout = 120;      if (__webpack_require__.nc) {        script.setAttribute("nonce", __webpack_require__.nc);      }      // 获取目标chunk的地址，__webpack_require__.p 表示设置的publicPath，默认为空串      script.src = __webpack_require__.p + "" + chunkId + ".bundle.js";      // 请求超时的时候直接调用方法结束，时间为 120 s      var timeout = setTimeout(function(){        onScriptComplete({ type: 'timeout', target: script });      }, 120000);      script.onerror = script.onload = onScriptComplete;      // 设置加载完成或者错误的回调      function onScriptComplete(event) {        // avoid mem leaks in IE.        // 防止 IE 内存泄露        script.onerror = script.onload = null;        clearTimeout(timeout);        var chunk = installedChunks[chunkId];        // 如果为 0 则表示已加载，主要逻辑看 webpackJsonpCallback 函数        if(chunk !== 0) {          if(chunk) {            var errorType = event && (event.type === 'load' ? 'missing' : event.type);            var realSrc = event && event.target && event.target.src;            var error = new Error('Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')');            error.type = errorType;            error.request = realSrc;            chunk[1](error "1");          }          installedChunks[chunkId] = undefined;        }      };      head.appendChild(script);    }  }  return Promise.all(promises);};
```

*   可以看出将 `import()` 转换成模拟 `JSONP` 去加载动态加载的 `chunk` 文件
    
*   设置 `chunk` 加载的三种状态并缓存在`installedChunks`中，防止 chunk 重复加载。这些状态的改变会在 `webpackJsonpCallback` 中提到
    
    ```
    // 设置 installedChunks[chunkId]installedChunkData = installedChunks[chunkId] = [resolve, reject];
    ```
    

*   `installedChunks[chunkId]`为`0`，代表该 `chunk` 已经加载完毕
    
*   `installedChunks[chunkId]`为`undefined`，代表该 `chunk` 加载失败、加载超时、从未加载过
    
*   `installedChunks[chunkId]`为`Promise`对象，代表该 `chunk` 正在加载
    

看完`__webpack_require__.e`，我们知道的是，我们通过 JSONP 去动态引入 `chunk` 文件，并根据引入的结果状态进行处理，那么我们怎么知道引入之后的状态呢？我们来看异步加载的 `chunk` 是怎样的

### 异步 Chunk

```
// window["webpackJsonp"] 实际上是一个数组，向中添加一个元素。这个元素也是一个数组，其中数组的第一个元素是chunkId，第二个对象，跟传入到 IIFE 中的参数一样(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{  /***/ "./src/Another.js":  /***/ (function(module, __webpack_exports__, __webpack_require__) {    "use strict";  __webpack_require__.r(__webpack_exports__);  /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Another", function() { return Another; });  function Another() {    return 'Hi, I am Another Module';  }  /***/ })    }]);  //# sourceMappingURL=0.bundle.js.map
```

主要做的事情就是往一个数组 `window['webpackJsonp']` 中塞入一个元素，这个元素也是一个数组，其中数组的第一个元素是 `chunkId`，第二个对象，跟主 `chunk` 中 IIFE 传入的参数类似。关键是这个 `window['webpackJsonp']` 在哪里会用到呢？我们回到主 `chunk` 中。在 `return __webpack_require__(__webpack_require__.s = "./src/index.js");` 进入入口之前还有一段

```
var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];// 保存原始的 Array.prototype.push 方法var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);// 将 push 方法的实现修改为 webpackJsonpCallback// 这样我们在异步 chunk 中执行的 window['webpackJsonp'].push 其实是 webpackJsonpCallback 函数。jsonpArray.push = webpackJsonpCallback;jsonpArray = jsonpArray.slice();// 对已在数组中的元素依次执行webpackJsonpCallback方法for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);var parentJsonpFunction = oldJsonpFunction;
```

`jsonpArray` 就是 `window["webpackJsonp"]` ，重点看下面这一句代码，当执行 `push` 方法的时候，就会执行 `webpackJsonpCallback`，相当于做了一层劫持，也就是执行完 push 操作的时候就会调用这个函数

```
jsonpArray.push = webpackJsonpCallback;
```

#### webpackJsonpCallback ——加载完动态 chunk 之后的回调

我们再来看看 `webpackJsonpCallback` 函数，这里的入参就是动态加载的 `chunk` 的 `window['webpackJsonp']` push 进去的参数。

```
var installedChunks = {  "main": 0}; function webpackJsonpCallback(data) {  // window["webpackJsonp"] 中的第一个参数——即[0]  var chunkIds = data[0];  // 对应的模块详细信息，详见打包出来的 chunk 模块中的 push 进 window["webpackJsonp"] 中的第二个参数  var moreModules = data[1];  // add "moreModules" to the modules object,  // then flag all "chunkIds" as loaded and fire callback  var moduleId, chunkId, i = 0, resolves = [];  for(;i < chunkIds.length; i++) {    chunkId = chunkIds[i];    // 所以此处是找到那些未加载完的chunk，他们的value还是[resolve, reject, promise]    // 这个可以看 __webpack_require__.e 中设置的状态    // 表示正在执行的chunk，加入到 resolves 数组中    if(installedChunks[chunkId]) {      resolves.push(installedChunks[chunkId][0]);    }    // 标记成已经执行完    installedChunks[chunkId] = 0;  }  // 挨个将异步 chunk 中的 module 加入主 chunk 的 modules 数组中  for(moduleId in moreModules) {    if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {      modules[moduleId] = moreModules[moduleId];    }  }  // parentJsonpFunction: 原始的数组 push 方法，将 data 加入 window["webpackJsonp"] 数组。  if(parentJsonpFunction) parentJsonpFunction(data);  // 等到 while 循环结束后，__webpack_require__.e 的返回值 Promise 得到 resolve  // 执行 resolove  while(resolves.length) {    resolves.shift()();  }};
```

当我们 `JSONP` 去加载异步 `chunk` 完成之后，就会去执行 `window["webpackJsonp"] || []).push`，也就是 `webpackJsonpCallback`。主要有以下几步

*   遍历要加载的 chunkIds，找到未执行完的 chunk，并加入到 resolves 中
    

```
for(;i < chunkIds.length; i++) {  chunkId = chunkIds[i];  // 所以此处是找到那些未加载完的chunk，他们的value还是[resolve, reject, promise]  // 这个可以看 __webpack_require__.e 中设置的状态  // 表示正在执行的chunk，加入到 resolves 数组中  if(installedChunks[chunkId]) {    resolves.push(installedChunks[chunkId][0]);  }  // 标记成已经执行完  installedChunks[chunkId] = 0;}
```

*   这里未执行的是非 0 状态，执行完就设置为 0
    
*   `installedChunks[chunkId][0]` 实际上就是 Promise 构造函数中的 resolve
    
    ```
    // __webpack_require__.e var promise = new Promise(function(resolve, reject) { installedChunkData = installedChunks[chunkId] = [resolve, reject];});
    ```
    
*   挨个将异步 `chunk` 中的 `module` 加入主 `chunk` 的 `modules` 数组中
    
*   原始的数组 `push` 方法，将 `data` 加入 `window["webpackJsonp"]` 数组
    
*   执行各个 `resolves` 方法，告诉 `__webpack_require__.e` 中回调函数的状态
    

只有当这个方法执行完成的时候，我们才知道 `JSONP` 成功与否，也就是`script.onload/onerror` 会在 `webpackJsonpCallback` 之后执行。所以 `onload/onerror` 其实是用来检查 `webpackJsonpCallback` 的完成度：有没有将 `installedChunks` 中对应的 `chunk` 值设为 0

### 动态导入小结

大致的流程如下图所示

![](https://mmbiz.qpic.cn/mmbiz_png/miaoCwsXzJSpg5XC2pGXtlAk7tCsYoxpMMib1zibSrX1RX3UoeylrE0h9vGp6WyGVkXcDGrVUMMfkb1odLrYSHKIQ/640?wx_fmt=png)流程图

总结
--

本篇文章分析了 `webpack` 打包主流程以及和动态加载情况下输出代码，总结如下

*   总体的文件就是一个 `IIFE`——立即执行函数
    
*   `webpack` 会对加载过的文件进行缓存，从而优化性能
    
*   主要是通过 `__webpack_require__`来模拟 `import` 一个模块，并在最后返回模块 `export` 的变量
    
*   `webpack` 是如何支持 `ES Module` 的
    
*   动态加载 `import()` 的实现主要是使用 `JSONP` 动态加载模块，并通过 `webpackJsonpCallback` 判断加载的结果
    

参考
--

*   分析 webpack 打包后的文件 [8]
    
*   webpack 打包产物代码分析 [9]
    
*   『Webpack 系列』—— 路由懒加载的原理 [10]
    

### 参考资料

[1]

这里查看: _https://github.com/GpingFeng/learn-webpack/blob/main/output/main.js_

[2]

【面试说】Javascript 中的 CJS, AMD, UMD 和 ESM 是什么？: _https://juejin.cn/post/6935973925004247077?utm_source=gold_browser_extension#heading-0_

[3]

`entry`: _https://webpack.docschina.org/configuration/entry-context_

[4]

Entry dependencies: _https://webpack.docschina.org/configuration/entry-context/#dependencies_

[5]

`SplitChunksPlugin`: _https://webpack.docschina.org/plugins/split-chunks-plugin_

[6]

这里: _https://github.com/GpingFeng/learn-webpack/blob/main/output/bundle.js_

[7]

这里: _https://github.com/GpingFeng/learn-webpack/blob/main/output/0.bundle.js_

[8]

分析 webpack 打包后的文件: _https://juejin.cn/post/6844903492063068167_

[9]

webpack 打包产物代码分析: _https://hellogithub2014.github.io/2019/01/02/webpack-bundle-code-analysis/_

[10]

『Webpack 系列』—— 路由懒加载的原理: _https://juejin.cn/post/6844904180285456398_

❤️爱心三连击  

```
程序员成长指北
```