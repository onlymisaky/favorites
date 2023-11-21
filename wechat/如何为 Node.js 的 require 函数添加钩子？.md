> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BFu4SouMdXFYLELRjHhUyg)

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境。早期的 Node.js 采用的是 CommonJS 模块规范，从 Node v13.2.0 版本开始正式支持 ES Modules 特性。直到 v15.3.0 版本 ES Modules 特性才稳定下来并与 NPM 生态相兼容。

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V3epBBUPEBgGEiaFCSsoCiaicYmVP3cZALeIKK0ZJiatiabC4ibDxibibFpLiaWafyyaDtqgLzV6Sj0JszFX5Q/640?wx_fmt=jpeg)

（图片来源：https://nodejs.org/api/esm.html）

本文将介绍 Node.js 中 `require` 函数的工作流程、如何让 Node.js 直接执行 ts 文件及如何正确地劫持 Node.js 的 `require` 函数，从而实现钩子的功能。接下来，我们先来介绍 `require` 函数。

### require 函数

Node.js 应用由模块组成，每个文件就是一个模块。对于 CommonJS 模块规范来说，我们通过 `require` 函数来导入模块。那么当我们使用 `require` 函数来导入模块的时候，该函数内部发生了什么？这里我们通过调用堆栈来了解一下 `require` 的过程：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V3epBBUPEBgGEiaFCSsoCiaicYDVeVGge17icGmXMGYlGkcMQ4kWK0fkiaMxVcSVrDIsSdelscEKDgutzg/640?wx_fmt=jpeg)

由上图可知，在使用 `require` 导入模块时，会调用 `Module` 对象的 `load` 方法来加载模块，该方法的实现如下所示：

```
// lib/internal/modules/cjs/loader.jsModule.prototype.load = function(filename) {  this.filename = filename;  this.paths = Module._nodeModulePaths(path.dirname(filename));  const extension = findLongestRegisteredExtension(filename);  Module._extensions[extension](this, filename);  this.loaded = true;  // 省略部分代码};
```

> 注意：本文所引用 Node.js 源码所对应的版本是 **v16.13.1**

在以上代码中，重要的两个步骤是：

*   步骤一：根据文件名找出扩展名；
    
*   步骤二：通过解析后的扩展名，在 `Module._extensions` 对象中查找匹配的加载器。
    

在 Node.js 中内置了 3 种不同的加载器，用于加载 `node`、`json` 和 `js` 文件。

**node 文件加载器**

```
// lib/internal/modules/cjs/loader.jsModule._extensions['.node'] = function(module, filename) {  return process.dlopen(module, path.toNamespacedPath(filename));};
```

**json 文件加载器**

```
// lib/internal/modules/cjs/loader.jsModule._extensions['.json'] = function(module, filename) { const content = fs.readFileSync(filename, 'utf8'); try {    module.exports = JSONParse(stripBOM(content)); } catch (err) {   err.message = filename + ': ' + err.message;   throw err; }};
```

**js 文件加载器**

```
// lib/internal/modules/cjs/loader.jsModule._extensions['.js'] = function(module, filename) {  // If already analyzed the source, then it will be cached.  const cached = cjsParseCache.get(module);  let content;  if (cached?.source) {    content = cached.source;    cached.source = undefined;  } else {    content = fs.readFileSync(filename, 'utf8');  }  // 省略部分代码  module._compile(content, filename);};
```

下面我们来分析比较重要的 **js 文件加载器**。通过观察以上代码，我们可知 `js` 加载器的核心处理流程，也可以分为两个步骤：

*   步骤一：使用 `fs.readFileSync` 方法加载 `js` 文件的内容；
    
*   步骤二：使用 `module._compile` 方法编译已加载的 `js` 代码。
    

那么了解以上的知识之后，对我们有什么用处呢？其实在了解 `require` 函数的工作流程之后，我们就可以扩展 Node.js 的加载器。比如让 Node.js 能够运行 `ts` 文件。

```
// register.jsconst fs = require("fs");const Module = require("module");const { transformSync } = require("esbuild");Module._extensions[".ts"] = function (module, filename) {  const content = fs.readFileSync(filename, "utf8");  const { code } = transformSync(content, {    sourcefile: filename,    sourcemap: "both",    loader: "ts",    format: "cjs",  });  module._compile(code, filename);};
```

在以上代码中，我们引入了内置的 `module` 模块，然后利用该模块的 `_extensions` 对象来注册我们的自定义 ts 加载器。

其实，加载器的本质就是一个函数，在该函数内部我们利用 esbuild 模块提供的 `transformSync` API 来实现 **ts -> js** 代码的转换。当完成代码转换之后，会调用 `module._compile` 方法对代码进行编译操作。

看到这里相信有的小伙伴，也想到了 Webpack 中对应的 loader，想深入学习的话，可以阅读 [多图详解，一次性搞懂 Webpack Loader](https://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247494307&idx=1&sn=cdeb4085693db5f1c314a0eb3b9e3485&scene=21#wechat_redirect) 这篇文章。

篇幅有限，具体的编译过程，我们就不展开介绍了。下面我们来看一下如何让自定义的 ts 加载器生效。要让 Node.js 能够执行 ts 代码，我们就需要在执行 ts 代码前，先完成自定义 ts 加载器的注册操作。庆幸的是，Node.js 为我们提供了模块的预加载机制：

```
$ node --help | grep preload   -r, --require=... module to preload (option can be repeated)
```

即利用 `-r, --require` 命令行配置项，我们就可以预加载指定的模块。了解完相关知识之后，我们来测试一下自定义 ts 加载器。

首先创建一个 `index.ts` 文件并输入以下内容：

```
// index.tsconst add = (a: number, b: number) => a + b;console.log("add(a, b) = ", add(3, 5));
```

然后在命令行输入以下命令：

```
$ node -r ./register.js index.ts
```

当以上命令成功运行之后，控制台会输出以下内容：

```
add(a, b) =  8
```

很明显我们自定义的 ts 文件加载器生效了，这种扩展机制还是值得我们学习的。另外，需要注意的是在 `load` 方法中，`findLongestRegisteredExtension` 函数会判断文件的扩展名是否已经注册在 `Module._extensions` 对象中，若未注册的话，默认会返回 `.js` 字符串。

```
// lib/internal/modules/cjs/loader.jsModule.prototype.load = function(filename) {  this.filename = filename;  this.paths = Module._nodeModulePaths(path.dirname(filename));  const extension = findLongestRegisteredExtension(filename);  Module._extensions[extension](this, filename);  this.loaded = true;  // 省略部分代码};
```

这就意味着只要文件中包含有效的 `js` 代码，`require` 函数就能正常加载它。比如下面的 **a.txt** 文件：

```
module.exports = "hello world";
```

看到这里相信你已经了解 `require` 函数是如何加载模块及如何自定义 Node.js 文件加载器。那么让 Node.js 支持加载 `ts`、`png` 或 `css` 等其它类型的文件，有更优雅、更简单的方案么？答案是有的，我们可以使用 pirates 这个第三方库。

### pirates 是什么

pirates 这个库让我们可以正确地劫持 Node.js 的 `require` 函数。利用这个库，我们就可以很容易扩展 Node.js 加载器的功能。

#### pirates 的用法

你可以使用 npm 来安装 pirates：

```
npm install --save pirates
```

在成功安装 pirates 这个库之后，就可以利用该模块导出提供的 `addHook` 函数来添加钩子：

```
// register.jsconst addHook = require("pirates").addHook;const revert = addHook(  (code, filename) => code.replace("@@foo", "console.log('foo');"),  { exts: [".js"] });
```

需要注意的是调用 `addHook` 之后会返回一个 `revert` 函数，用于取消对 `require` 函数的劫持操作。下面我们来验证一下 pirates 这个库是否能正常工作，首先新建一个 `index.js` 文件并输入以下内容：

```
// index.jsconsole.log("@@foo")
```

然后在命令行输入以下命令：

```
$ node -r ./register.js index.js
```

当以上命令成功运行之后，控制台会输出以下内容：

```
console.log('foo');
```

观察以上结果可知，我们通过 `addHook` 函数添加的钩子生效了。是不是觉得挺神奇的，接下来我们来分析一下 pirates 的工作原理。

### pirates 是如何工作的

pirates 底层是利用 Node.js 内置 `module` 模块提供的扩展机制来实现 `Hook` 功能。前面我们已经介绍过了，当使用 `require` 函数来加载模块时，Node.js 会根据文件的后缀名来匹配对应的加载器。

其实 pirates 的源码并不会复杂，我们来重点分析 `addHook` 函数的核心处理逻辑：

```
// src/index.jsexport function addHook(hook, opts = {}) {  let reverted = false;  const loaders = []; // 存放新的loader  const oldLoaders = []; // 存放旧的loader  let exts;  const originalJSLoader = Module._extensions['.js']; // 原始的JS Loader   const matcher = opts.matcher || null;  const ignoreNodeModules = opts.ignoreNodeModules !== false;  exts = opts.extensions || opts.exts || opts.extension || opts.ext     || ['.js'];  if (!Array.isArray(exts)) {    exts = [exts];  }  exts.forEach((ext) {     // ...   }}
```

为了提高执行效率，`addHook` 函数提供了 `matcher` 和 `ignoreNodeModules` 配置项来实现文件过滤操作。在获取到 `exts` 扩展名列表之后，就会使用新的加载器来替换已有的加载器。

```
exts.forEach((ext) => {    if (typeof ext !== 'string') {      throw new TypeError(`Invalid Extension: ${ext}`);    }    // 获取已注册的loader，若未找到，则默认使用JS Loader    const oldLoader = Module._extensions[ext] || originalJSLoader;    oldLoaders[ext] = Module._extensions[ext];    loaders[ext] = Module._extensions[ext] = function newLoader(   mod, filename) {      let compile;      if (!reverted) {        if (shouldCompile(filename, exts, matcher, ignoreNodeModules)) {          compile = mod._compile;          mod._compile = function _compile(code) {            // 这里需要恢复成原来的_compile函数，否则会出现死循环            mod._compile = compile;            // 在编译前先执行用户自定义的hook函数            const newCode = hook(code, filename);            if (typeof newCode !== 'string') {              throw new Error(HOOK_RETURNED_NOTHING_ERROR_MESSAGE);            }            return mod._compile(newCode, filename);          };        }      }      oldLoader(mod, filename);    };});
```

观察以上代码可知，在 `addHook` 函数内部是通过替换 `mod._compile` 方法来实现钩子的功能。即在调用原始的 `mod._compile` 方法进行编译前，会先调用 `hook(code, filename)` 函数来执行用户自定义的 `hook` 函数，从而对代码进行处理。

好的，至此本文的主要内容都介绍完了，在实际工作中，如果你想让 Node.js 直接执行 ts 文件，可以利用 ts-node 或 esbuild-register 这两个库。其中 esbuild-register 这个库内部就是使用了 pirates 提供的 Hook 机制来实现对应的功能。