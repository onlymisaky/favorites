> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/utL7boalUB4etRxzVDKprQ)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCUOYCxUdSOKzdLNFtxqLvia0B07BoqpG0jjnXFkXfylicgpsSd41KXz61JElXXia9JeGjsaafYQiboLQg/640?wx_fmt=jpeg)

*   本文作者：李永宁
    
*   本文链接：https://juejin.cn/post/6859569958742196237
    

某大厂面试题

_面试官_，问：

> `import moduleName from 'xxModule'`和`import('xxModule')`经过`webpack`编译打包后最终变成了什么？在浏览器中是怎么运行的？

_求职者_，答：

> 嗯。。。，不好意思，我只知道`import`可以用来加载模块，然后第二个`import`一般用在需要懒加载的地方，其它的就不知道了

这两个语句我们应该经常能看到，第一个`import`就不用说了，可以说现在的前端项目随处可见，第二个`import`可以在需要懒加载的地方看到，比如`vue-router`的懒加载配置，但是大家好像却从来都没太深究过这个东西。

`前奏`

`import`是`es module`提供的一个加载模块的方法，目前主流的浏览器也都支持，像现在比较火的`vite`就是利用了浏览器原生支持`import`的能力来实现的，当然它还有一个`server`端使用`koa`实现的。

_我们都知道`webpack`的打包过程大概流程是这样的：_

> *   合并`webpack.config.js`和命令行传递的参数，形成最终的配置
>     
> *   解析配置，得到`entry`入口
>     
> *   读取入口文件内容，通过`@babel/parse`将入口内容（code）转换成`ast`
>     
> *   通过`@babel/traverse`遍历`ast`得到模块的各个依赖
>     
> *   通过`@babel/core`（实际的转换工作是由`@babel/preset-env`来完成的）将`ast`转换成`es5 code`
>     
> *   通过循环伪递归的方式拿到所有模块的所有依赖并都转换成`es5`
>     

从以上内容可以看出来，最终的代码中肯定是没有`import`语句的，因为`es5`就没有`import`；那么我们从哪去找答案呢？有两个地方，一是`webpack`源码，二是打包后的文件，对于今天的问题而言，后者更简单直接一些。

项目

现在我们来建一个测试项目

初始化项目

```
mkdir webpack-bundle-analysis && cd webpack-bundle-analysis && npm init -y && npm i webpack webpack-cli -D
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGenBKDoVQ5jgnnq2p0ibzFrqEp2UiciciaQicVxqUG8EP1RDibKMicxpCXvibhQ/640?wx_fmt=png)

webpack.config.js
-----------------

```
const path = require('path')module.exports = {  entry: './src/index.js',  // 为了利于分析打包后的代码，这里选择开发模式  mode: 'development',  output: {    path: path.resolve(__dirname, './dist'),    filename: 'main.js'  }}
```

写代码，/src
--------

**/src/index.js**

```
/** * 入口文件，引入 print 方法，并执行 * 定义了一个 button 方法，为页面添加一个按钮，并为按钮设置了一个 onclick 事件，负责动态引入一个文件 */import { print } from './num.js'print()function button () {  const button = document.createElement('button')  const text = document.createTextNode('click me')  button.appendChild(text)  button.onclick = e => import('./info.js').then(res => {    console.log(res.log)  })  return button}document.body.appendChild(button())
```

**/src/num.js**

```
import { tmpPrint } from './tmp.js'export function print () {  tmpPrint()   console.log('我是 num.js 的 print 方法')}
```

**/src/tmp.js**

```
export function tmpPrint () {  console.log('tmp.js print')}
```

**/src/info.js**

```
export const log = "log info"
```

打包
--

项目根目录执行

```
npx webpack<br style="max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGpCL09twiaaMm1cFiaHWzHKIa62lQ8J9Noe6IaKmCLTiahhKR81t4ypfhg/640?wx_fmt=png)

会看到多了一个 dist 目录，且看输出结果，`main.js`大家肯定都知道是什么，这个是我们在`webpack.config.js`中配置的输出的文件名，但是`0.main.js`呢？这是什么？我们也没配置，可以先想一下，之后我们从代码中找答案

模版文件
----

新建`/dist/index.html`文件，并引入打包后的`main.js`

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta ></script></body></html>
```

在浏览器打开 index.html
-----------------

**Network**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGCVibT54wKqqVahnJgolrDk0DXdOqDaicoCyoCoPBicpJ19WM3HH2a8TbA/640?wx_fmt=png)

**Console**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGx88Dkbtict22icJHyibervaibDfibwBicE7A2zicRNriaibqlqDuGxVuxwj7FBg/640?wx_fmt=png)

**Elements**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGldEDVlxPgoTgtDniaiam5V6j3pFl6CHaPYLiaqbKPIAAYicZ0eDxH5hFjA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG2n6CicdLtdNjSgLJr4GaNaJ8PIUYyhEzf9nfpRImBTQ3TwHaCt0M8gw/640?wx_fmt=png)

可以看到`index.html`加载以后资源加载以及代码的执行情况，会发现我们写的代码中的同步逻辑均已执行，接下来看看异步逻辑（点击按钮），这里为了效果，点击之前分别清空了`Network`和`Console`两个标签的内容

**Network**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG0lzIwfv0WhZBP9ARbSUQJia1M0iaj9YqLV9WicKPfia8EF4SHXicRNNTic1w/640?wx_fmt=png)

**Console**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGWLibsKIBfETVibWGucE7mUsicVqWcgibcpZWkibCicvp4YsREJFlZTG9huLw/640?wx_fmt=png)

**Elements**

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGQ4ib8glYTPkDHEmLib1EF4YIHtUL66Dq5fHNKibMq0ibJ0p9vEHdibdCwqg/640?wx_fmt=png)

大家注意看信息，点击按钮以后发生了什么？从表面看似乎是这样的：

> 点击按钮，在`html`中动态添加了一个`script`标签，引入了一个文件（`0.main.js`），然后发送两个一个`http`请求进行资源加载，加载成功以后在控制台输出一段日志。

> 到这里其实有一部分的答案已经出来，`import('xxModule`)`，它提供了一种懒加载的机制，动态往`html`中添加`script` 标签，然后加载资源并执行，那具体是怎么做的呢？

好了，现象我们也看完了，接下来我们去源码中找答案

源码分析

我们一步一步来拆解打包后的代码

首先，我们将打包后的代码进行折叠，如下

```
(function (modules) {  // xxxx})({  // xxx})
```

这段代码是不是很熟悉？就是一个自执行函数

**函数参数**

```
(function (modules) {  // xxxx})({    // src/index.js 模块    "./src/index.js":      (function (module, __webpack_exports__, __webpack_require__) {        "use strict";        __webpack_require__.r(__webpack_exports__);        var _num_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/num.js");        Object(_num_js__WEBPACK_IMPORTED_MODULE_0__["print"])()        function button() {          const button = document.createElement('button')          const text = document.createTextNode('click me')          button.appendChild(text)          button.onclick = e => __webpack_require__.e(0)            .then(__webpack_require__.bind(null, "./src/info.js"))            .then(res => {              console.log(res.log)            })          return button        }        document.body.appendChild(button())        //# sourceURL=webpack:///./src/index.js?");      }),    // ./src/num.js 模块    "./src/num.js":      (function (module, __webpack_exports__, __webpack_require__) {        "use strict";        __webpack_require__.r(__webpack_exports__);        __webpack_require__.d(__webpack_exports__, "print", function () { return print; });        var _tmp_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/tmp.js");        function print() {          Object(_tmp_js__WEBPACK_IMPORTED_MODULE_0__["tmpPrint"])()          console.log('我是 num.js 的 print 方法')        }        //# sourceURL=webpack:///./src/num.js?");      }),    // /src/tmp.js 模块    "./src/tmp.js":      (function (module, __webpack_exports__, __webpack_require__) {        "use strict";        // eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"tmpPrint\", function() { return tmpPrint; });\nfunction tmpPrint () {\n  console.log('tmp.js print')\n}\n\n//# sourceURL=webpack:///./src/tmp.js?");        __webpack_require__.r(__webpack_exports__);        __webpack_require__.d(          __webpack_exports__,          "tmpPrint",          function () {            return tmpPrint;          });        function tmpPrint() {          console.log('tmp.js print')        }        //# sourceURL=webpack:///./src/tmp.js?");      })})
```

看到这里有没有很熟悉，再回想一下`webpack`的打包过程，会发现，`webpack`将所有的`import moduleName from 'xxModule'`都变成了一个`Map`对象，`key`为文件路径，`value`为一个可执行的函数，而函数内容其实就是模块中导出的内容，当然，模块自己也被`webpack`做了一些处理，接着往下进行。

从打包后`Map`对象中能找到我们代码中的各个模块，以及模块的内容，但是也多了很多不属于我们编写的代码，比如以`__webpack_require__`开头的代码，这些又是什么呢？其实是`webpack`自定义的一些方法，我们接着往下阅读

**函数体**

> 以下内容为打包后的完整代码，做了一定的格式化，关键地方都写了详细的注释，阅读时搜索 “入口位置” 开始一步一步的阅读，如果有碰到难以理解的地方可配合单步调试

```
/** * modules = { *  './src/index.js': function () {}, *  './src/num.js': function () {}, *  './src/tmp.js': function () {} * } */(function (modules) { // webpackBootstrap  /**   * install a JSONP callback for chunk loading   * 模块加载成功，更改缓存中的模块状态，并且执行模块内容   * @param {*} data = [   *  [chunkId],   *  {   *    './src/info.js': function () {}   *  }   * ]   */  function webpackJsonpCallback(data) {    var chunkIds = data[0];    var moreModules = data[1];    // add "moreModules" to the modules object,    // then flag all "chunkIds" as loaded and fire callback    var moduleId, chunkId, i = 0, resolves = [];    for (; i < chunkIds.length; i++) {      chunkId = chunkIds[i];      if (Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {        resolves.push(installedChunks[chunkId][0]);      }      // 这里将模块的加载状态改为了 0，表示加载完成      installedChunks[chunkId] = 0;    }    for (moduleId in moreModules) {      if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {        // 执行模块代码        modules[moduleId] = moreModules[moduleId];      }    }    if (parentJsonpFunction) parentJsonpFunction(data);    while (resolves.length) {      resolves.shift()();    }  };  // The module cache, 模块缓存，类似于 commonJS 的 require 缓存机制，只不过这里的 key 是相对路径  var installedModules = {};  /**   * 定义 chunk 的加载情况，比如 main = 0 是已加载   * object to store loaded and loading chunks   * undefined = chunk not loaded   * null = chunk preloaded/prefetched   * Promise = chunk loading   * 0 = chunk loaded   */  var installedChunks = {    "main": 0  };  // script path function， 返回需要动态加载的 chunk 的路径  function jsonpScriptSrc(chunkId) {    return __webpack_require__.p + "" + chunkId + ".main.js"  }  /**   * The require function   * 接收一个 moduleId，其实就是一个模块相对路径，然后查缓存（没有则添加缓存），   * 然后执行模块代码，返回模块运行后的 module.exports   * 一句话总结就是 加载指定模块然后执行，返回执行结果（module.exports)   *    * __webpack_require__(__webpack_require__.s = "./src/index.js")   */  function __webpack_require__(moduleId) {    // Check if module is in cache    if (installedModules[moduleId]) {      return installedModules[moduleId].exports;    }    /**     * Create a new module (and put it into the cache)     *      * // 示例     * module = installedModules['./src/index.js'] = {     *  i: './src/index.js',     *  l: false,     *  exports: {}     * }     */    var module = installedModules[moduleId] = {      i: moduleId,      l: false,      exports: {}    };    /**     * Execute the module function     * modules['./src/index.js'] is a function     */    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);    // Flag the module as loaded    module.l = true;    // Return the exports of the module    return module.exports;  }  // This file contains only the entry chunk.  // The chunk loading function for additional chunks  /**   *    */  __webpack_require__.e = function requireEnsure(chunkId) {    var promises = [];    // JSONP chunk loading for javascript    // 从缓存中找该模块    var installedChunkData = installedChunks[chunkId];        // 0 means "already installed".    if (installedChunkData !== 0) {             // 说明模块没有安装      // a Promise means "currently loading".      if (installedChunkData) {        promises.push(installedChunkData[2]);      } else {        // setup Promise in chunk cache        var promise = new Promise(function (resolve, reject) {          installedChunkData = installedChunks[chunkId] = [resolve, reject];        });        promises.push(installedChunkData[2] = promise);        // start chunk loading, create script element        var script = document.createElement('script');        var onScriptComplete;        script.charset = 'utf-8';        // 设置超时时间        script.timeout = 120;        if (__webpack_require__.nc) {          script.setAttribute("nonce", __webpack_require__.nc);        }        // script.src = __webpack_public_path__ + chunkId + main.js, 即模块路径        script.src = jsonpScriptSrc(chunkId);        // create error before stack unwound to get useful stacktrace later        var error = new Error();        // 加载结果处理函数        onScriptComplete = function (event) {          // avoid mem leaks in IE.          script.onerror = script.onload = null;          clearTimeout(timeout);          var chunk = installedChunks[chunkId];          if (chunk !== 0) {            // chunk 状态不为 0 ，说明加载出问题了            if (chunk) {              var errorType = event && (event.type === 'load' ? 'missing' : event.type);              var realSrc = event && event.target && event.target.src;              error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';              error.name = 'ChunkLoadError';              error.type = errorType;              error.request = realSrc;              chunk[1](error);            }            installedChunks[chunkId] = undefined;          }        };        // 超时定时器，超时以后执行        var timeout = setTimeout(function () {          onScriptComplete({ type: 'timeout', target: script });        }, 120000);        // 加载出错或者加载成功的处理函数        script.onerror = script.onload = onScriptComplete;        // 将 script 标签添加到 head 标签尾部        document.head.appendChild(script);      }    }    return Promise.all(promises);  };  // expose the modules object (__webpack_modules__)  __webpack_require__.m = modules;  // expose the module cache  __webpack_require__.c = installedModules;  /**   * define getter function for harmony exports   * @param {*} exports = {}   * @param {*} name = 模块名   * @param {*} getter => 模块函数   *    * 在 exports 对象上定义一个 key value，key 为模块名称，value 为模块的可执行函数   * exports = {   *  moduleName: module function   * }    */  __webpack_require__.d = function (exports, name, getter) {    if (!__webpack_require__.o(exports, name)) {      Object.defineProperty(exports, name, { enumerable: true, get: getter });    }  };  /**   * define __esModule on exports   * @param {*} exports = {}   *    * exports = {   *  __esModule: true   * }   */  __webpack_require__.r = function (exports) {    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {      Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });    }    Object.defineProperty(exports, '__esModule', { value: true });  };  // create a fake namespace object  // mode & 1: value is a module id, require it  // mode & 2: merge all properties of value into the ns  // mode & 4: return value when already ns object  // mode & 8|1: behave like require  __webpack_require__.t = function (value, mode) {    if (mode & 1) value = __webpack_require__(value);    if (mode & 8) return value;    if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;    var ns = Object.create(null);    __webpack_require__.r(ns);    Object.defineProperty(ns, 'default', { enumerable: true, value: value });    if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));    return ns;  };  // getDefaultExport function for compatibility with non-harmony modules  __webpack_require__.n = function (module) {    var getter = module && module.__esModule ?      function getDefault() { return module['default']; } :      function getModuleExports() { return module; };    __webpack_require__.d(getter, 'a', getter);    return getter;  };  // Object.prototype.hasOwnProperty.call  __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };  // __webpack_public_path__  __webpack_require__.p = "";  // on error function for async loading  __webpack_require__.oe = function (err) { console.error(err); throw err; };    /**   * 通过全局属性存储异步加载的资源项，打包文件首次加载时如果属性值不为空，则说明已经有资源被加载了，   * 将这些资源同步到installedChunks对象中，避免资源重复加载，当然也是这句导致微应用框架single-spa中的所有子应用导出的   * 包名需要唯一，否则一旦异步的重名模块存在，重名的后续模块不会被加载，且显示的资源是第一个加载的重名模块，   * 也就是所谓的JS全局作用域的污染   *   * 其实上面说的这个问题，webpack官网已经提到了   * https://webpack.docschina.org/configuration/output/#outputjsonpfunction   */  var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];  var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);  jsonpArray.push = webpackJsonpCallback;  jsonpArray = jsonpArray.slice();  for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);  var parentJsonpFunction = oldJsonpFunction;  /**   * 入口位置   * Load entry module and return exports   */  return __webpack_require__(__webpack_require__.s = "./src/index.js");})  ({    // 代码中所有的 import moduleName from 'xxModule' 变成了以下的 Map 对象    // /src/index.js 模块    "./src/index.js":      /**       * @param module = {       *  i: './src/index.js',       *  l: false,       *  exports: {}       *        * @param __webpack_exports__ = module.exports = {}       *        * @param __webpack_require__ => 自定义的 require 函数，加载指定模块，并执行模块代码，返回执行结果       *        */      (function (module, __webpack_exports__, __webpack_require__) {        "use strict";        /**         *          * define __esModule on exports         * __webpack_exports = module.exports = {         *  __esModule: true         * }         */        __webpack_require__.r(__webpack_exports__);        // 加载 ./src/num.js 模块        var _num_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/num.js");        Object(_num_js__WEBPACK_IMPORTED_MODULE_0__["print"])()        function button() {          const button = document.createElement('button')          const text = document.createTextNode('click me')          button.appendChild(text)          /**           * 异步执行部分           */          button.onclick = e => __webpack_require__.e(0)            // 模块异步加载完成后，开始执行模块内容 => window["webpackJsonp"].push = window["webpackJsonp"].push = function (data) {}            .then(__webpack_require__.bind(null, "./src/info.js"))            .then(res => {              console.log(res.log)            })          return button        }        document.body.appendChild(button())        //# sourceURL=webpack:///./src/index.js?");      }),    // /src/num.js 模块    "./src/num.js":       /**       * @param module = {       *  i: './src/num.js',       *  l: false,       *  exports: {}       *        * @param __webpack_exports__ = module.exports = {}       *        * @param __webpack_require__ => 自定义的 require 函数，加载指定模块，并执行模块代码，返回执行结果       *        */      (function (module, __webpack_exports__, __webpack_require__) {        "use strict";         /**         *          * define __esModule on exports         * __webpack_exports = module.exports = {         *  __esModule: true         * }         */        __webpack_require__.r(__webpack_exports__);        /**         * module.exports = {         *  __esModule: true,         *  print         * }         */        __webpack_require__.d(__webpack_exports__, "print", function () { return print; });        // 加载 ./src/tmp.js 模块        var _tmp_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/tmp.js");        function print() {          Object(_tmp_js__WEBPACK_IMPORTED_MODULE_0__["tmpPrint"])()          console.log('我是 num.js 的 print 方法')        }        //# sourceURL=webpack:///./src/num.js?");      }),    // /src/tmp.js 模块    "./src/tmp.js":      /**       * @param module = {       *  i: './src/num.js',       *  l: false,       *  exports: {}       *        * @param __webpack_exports__ = module.exports = {}       *        * @param __webpack_require__ => 自定义的 require 函数，加载指定模块，并执行模块代码，返回执行结果       *        */      (function (module, __webpack_exports__, __webpack_require__) {        "use strict";         /**         *          * define __esModule on exports         * __webpack_exports = module.exports = {         *  __esModule: true         * }         */        __webpack_require__.r(__webpack_exports__);        /**         * module.exports = {         *  __esModule: true,         *  tmpPrint         * }         */        __webpack_require__.d(__webpack_exports__, "tmpPrint", function () { return tmpPrint; });        function tmpPrint() {          console.log('tmp.js print')        }        //# sourceURL=webpack:///./src/tmp.js?");      })  });
```

总结

经过以上内容的学习，相比对于一开始的问题，答案呼之欲出了吧。

_面试官_，问：

> `import moduleName from 'xxModule'`和`import('xxModule')`经过`webpack`编译打包后最终变成了什么？在浏览器中是怎么运行的？

_求职者_，答：

> `import`经过`webpack`打包以后变成一些`Map`对象，`key`为模块路径，`value`为模块的可执行函数；

> 代码加载到浏览器以后从入口模块开始执行，其中执行的过程中，最重要的就是`webpack`定义的`__webpack_require__`函数，负责实际的模块加载并执行这些模块内容，返回执行结果，其实就是读取`Map`对象，然后执行相应的函数；

> 当然其中的异步方法（import('xxModule')）比较特殊一些，它会单独打成一个包，采用动态加载的方式，具体过程：当用户触发其加载的动作时，会动态的在`head`标签中创建一个`script`标签，然后发送一个`http`请求，加载模块，模块加载完成以后自动执行其中的代码，主要的工作有两个，更改缓存中模块的状态，另一个就是执行模块代码。

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 100[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 100+ 篇原创文章