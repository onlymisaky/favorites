> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/e0ibggrhNdr_ZAGvxxok2Q)

大厂技术  坚持周更  精选好文
================

本文为来自 **字节跳动 - 国际化电商 - S 项目** 的文章，已授权 ELab 发布。

webpack 是当前使用较多的一个打包工具，将众多代码组织到一起使得在浏览器下可以正常运行，下面以打包为目的，实现一个简易版 webpack，支持单入口文件的打包，不涉及插件、分包等。

前置知识
====

举个🌰，先来看看下面这个 demo，例子很简单，一个 index.js，里面引用了一个文件 a.js，a.js 内部引入了 b.js，通过 webpack 最简单的配置，将 index.js 文件作为入口进行打包。

来看看打包后的内容是怎样的

```
// index.jsrequire('./a.js');console.log('entry load');// a.jsrequire("./b.js");const a = 1;console.log("a load");module.exports = a;// b.jsconsole.log("b load");const b = 1;module.exports = b;
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKes50iaVEngyWN5pmFyETeiciaXXPnAd1eXo9qNcKt7GxFxiag2q7EqtRGOvsbgiaf8szdmaosIfY4kA/640?wx_fmt=png)

可以看到打包产物是一个立即执行函数，函数初始先定义了多个 module，每个 module 是实际代码中被 require 的文件内容，同时由于浏览器不支持 require 方法，webpack 内部自行实现了一个 __webpack__require__，并将代码中的 require 全部替换为该函数（从打包结果可看出）。

在 **webpack__require** 定义之后，便开始执行入口文件，同时可以看出，webpack 的打包过程便是通过入口文件，将直接依赖和间接依赖以 module 的形式组织到一起，并通过自行实现的 require 实现模块的同步加载。

了解了打包产物后，便可以开始实现简易版的 webpack ，最终打包产物与 webpack 保持一致。

初始化参数
=====

根据 Node 接口 | webpack 中文文档 [1] 可以知道，webpack node api 对外暴露出了 webpack 方法，通过调用 webpack 方法传入配置，返回 compiler 对象，compiler 对象包含 run 方法可执行编译，即

```
const webpack = require('webpack'); // 引用 webpackconst compiler = webpack(options); // 传入配置生成 compiler 对象compiler.run((err, stats) => {  // 执行编译, 传入回调});
```

因此，首先需要实现一个 webpack 方法，同时该方法支持传入 webpack 配置，返回 compiler 实例，webpack 官方支持了以 cli 的形式运行 webpack 命令和指定参数、配置文件，这一部分暂时简单实现，我们暴露出一个方法，方法接收用户的配置。

```
// mini-webpack/core/index.jsfunction webpack() {  // 创建compiler对象  const compiler = new Compiler(options);}module.exports = webpack;
```

如上，实现了一个 webpack 方法，可传入一个 options 参数，包括用户指定的打包入口 entry、output 等。

```
webpack({    entry: './index.js',    output: {        path: path.resolve(__dirname, "dist"),        filename: "[name].js",    },    module: {        rules: []    }})
```

编译
==

上面已经实现了 webpack 配置的传入，compiler 的创建，接下来还需要实现 Compiler 类，该类内部暴露一个 run 方法，用于执行编译。

首先需要明确编译过程需要做的事情。

1.  读取入口文件，将入口文件交给匹配的 loader 处理，返回处理后的代码
    

2.  开始编译 loader 处理完的代码
    

3.  若代码中依赖了其他文件，则对 require 函数替换为 webpack 自行实现的 __**webpack__require__**, 保存该文件的处理结果，同时让其他文件回到第 1 步进行处理，不断循环。
    

4.  编译结束后，每个文件都有其对应的处理结果，将这些文件的编译结果从初始的入口文件开始组织到一起。
    

入口文件 loader 处理
--------------

读取入口文件，将入口文件交给 匹配的 loader 处理

```
// mini-webpack compiler.jsconst fs = require('fs');class Compiler {  constructor(options) {    this.options = options || {};        // 保存编译过程编译的 module    this.modules = new Set();  }  run(callback) {    const entryChunk = this.build(path.join(process.cwd(), this.options.entry));  }  build(modulePath) {    let originCode = fs.readFileSync(modulePath);    originCode = this.dealWidthLoader(modulePath, originCode.toString());    return this.dealDependencies(originCode, modulePath);  }  // 将源码交给匹配的 loader 处理  dealWidthLoader(modulePath, originCode) {    [...this.options.module.rules].reverse().forEach(item => {        if (item.test(modulePath)) {            const loaders = [...item.use].reverse();            loaders.forEach(loader => originCode = loader(originCode))        }    })    return originCode  }}module.exports = Compiler;
```

入口文件处理
------

这里需要开始处理入口文件的依赖，将其 require 转换成 自定义的 __webpack_require__，同时将其依赖收集起来，后续需要不断递归处理其直接依赖和间接依赖，这里用到了 babel 进行处理。

```
// 调用 webpack 处理依赖的代码  dealDependencies(code, modulePath) {        const fullPath = path.relative(process.cwd(), modulePath);    // 创建模块对象    const module = {      id: fullPath,      dependencies: [] // 该模块所依赖模块绝对路径地址    };    // 处理 require 语句，同时记录依赖了哪些文件    const ast = parser.parse(code, {      sourceType: "module",      ast: true,    });    // 深度优先 遍历语法Tree    traverse(ast, {      CallExpression: (nodePath) => {        const node = nodePath.node;        if (node.callee.name === "require") {                // 获得依赖的路径          const requirePath = node.arguments[0].value;                      const moduleDirName = path.dirname(modulePath);          const fullPath = path.relative(path.join(moduleDirName, requirePath), requirePath);                              // 替换 require 语句为 webpack 自定义的 require 方法          node.callee = t.identifier("__webpack_require__");          // 将依赖的路径修改成以当前路行为基准          node.arguments = [t.stringLiteral(fullPath)];          const exitModule = [...this.modules].find(item => item.id === fullPath)          // 该文件可能已经被处理过，这里判断一下          if (!exitModule) {            // 记录下当前处理的文件所依赖的文件（后续需逐一处理）            module.dependencies.push(fullPath);          }        }      },    });    // 根据新的 ast 生成代码    const { code: compilerCode } = generator(ast);    // 保存处理后的代码    module._source = compilerCode;    // 返回当前模块对象    return module;  }
```

依赖处理
----

到这里为止便处理完了入口文件，但是在处理文件过程，还收集了入口文件依赖的其他文件未处理，因此，在 dealDependencies 尾部，加入以下代码

```
// 调用 webpack 处理依赖的代码  dealDependencies(code, modulePath) {    ...    ...    ...    // 为当前模块挂载新的生成的代码    module._source = compilerCode;        // 递归处理其依赖    module.dependencies.forEach((dependency) => {      const depModule = this.build(dependency);            // 同时保存下编译过的依赖      this.modules.add(depModule);    });        ...    ...    ...        // 返回当前模块对象    return module;  }
```

Chunk
-----

在上面的步骤中，已经处理了入口文件、依赖文件，但目前它们还是分散开来，在 webpack 中，是支持多个入口，每个入口是一个 chunk，这个 chunk 将包含入口文件及其依赖的 module

```
// mini-webpack compiler.jsconst fs = require('fs');class Compiler {  constructor(options) {    this.options = options || {};        // 保存编译过程编译的 module    this.modules = new Set();  }  run(callback) {    const entryModule = this.build(path.join(process.cwd(), this.options.entry));    const entryChunk = this.buildChunk("entry", entryModule);  }    build(modulePath) {  }  // 将源码交给匹配的 loader 处理  dealWidthLoader(modulePath, originCode) {  }  // 调用 webpack 处理依赖的代码  dealDependencies(code, modulePath) {      }  buildChunk(entryName, entryModule) {    return {      name: entryName,      // 入口文件编译结果      entryModule: entryModule,      // 所有直接依赖和间接依赖编译结果      modules: this.modules,    };  }}module.exports = Compiler;
```

文件生成
====

至此我们已经将入口文件和其所依赖的所有文件编译完成，现在需要将编译后的代码生成对应的文件。

根据最上面利用官方 webpack 打包出来的产物，保留其基本结构，将构造的 chunk 内部的 entryModule 的 source 以及 modules 的 souce 替换进去，并根据初始配置的 output 生成对应文件。

```
// mini-webpack compiler.jsconst fs = require('fs');class Compiler {  constructor(options) {    this.options = options || {};        // 保存编译过程编译的 module，下面会讲解到    this.modules = new Set();  }  run(callback) {    const entryModule = this.build(path.join(process.cwd(), this.options.entry));    const entryChunk = this.buildChunk("entry", entryModule);    this.generateFile(entryChunk);  }    build(modulePath) {  }  // 将源码交给匹配的 loader 处理  dealWidthLoader(modulePath, originCode) {  }  // 调用 webpack 处理依赖的代码  dealDependencies(code, modulePath) {      }  buildChunk(entryName, entryModule) {  }    generateFile(entryChunk) {      // 获取打包后的代码    const code = this.getCode(entryChunk);    if (!fs.existsSync(this.options.output.path)) {      fs.mkdirSync(this.options.output.path);    }        // 写入文件    fs.writeFileSync(      path.join(        this.options.output.path,        this.options.output.filename.replace("[name]", entryChunk.name)      ),      code    );  }  getCode(entryChunk) {    return `      (() => {      // webpackBootstrap      var __webpack_modules__ = {        ${entryChunk.modules.map(module => `            "${module.id}": (module, __unused_webpack_exports, __webpack_require__) => {            ${module._source}          }        `).join(',')}      };      var __webpack_module_cache__ = {};      function __webpack_require__(moduleId) {        // Check if module is in cache        var cachedModule = __webpack_module_cache__[moduleId];        if (cachedModule !== undefined) {          return cachedModule.exports;        }        // Create a new module (and put it into the cache)        var module = (__webpack_module_cache__[moduleId] = {          exports: {},        });        // Execute the module function        __webpack_modules__[moduleId](          module,          module.exports,          __webpack_require__        );        // Return the exports of the module        return module.exports;      }      var __webpack_exports__ = {};      // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.      (() => {       ${entryChunk.entryModule._source};      })();    })()    `;  }}module.exports = Compiler;
```

试试在浏览器下跑一下生成的代码

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKes50iaVEngyWN5pmFyETetBtkLBrONPIYLmSu9MHuEoLrJElEe6Oibl6qtlzH62Xr65AHP7t8LicQ/640?wx_fmt=png)

符合预期，至此便完成了一个极简的 webpack，针对单入口文件进行打包。当然真正的 webpack 远非如此简单，这里仅仅只是实现其一个打包思路。

❤️ 谢谢支持
-------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 分享、点赞、收藏 三连哦~。

欢迎关注公众号 **ELab 团队** 收货大厂一手好文章~

> *   字节跳动校 / 社招内推码: **WWCM1TA**
>     
> *   投递链接: **https://job.toutiao.com/s/rj1fwQW**
>     
> 
> 可凭内推码投递 **字节跳动 - 国际化电商 - S 项目 团队** 相关岗位哦~

### 参考资料

[1]

Node 接口 | webpack 中文文档: _https://webpack.docschina.org/api/node/#webpack_

- END -