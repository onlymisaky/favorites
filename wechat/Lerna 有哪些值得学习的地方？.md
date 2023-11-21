> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/dKwskL3PWgFUWL95OkjVOg)

前言  

-----

随着前端组件、包库等工程体系发展，业务组件和工具库关系越来越复杂，非常容易遇到仓库多，库之间互相依赖。导致维护极其困难，发包过程非常繁琐，极大程度地限制了前端同学的开发效率。

此刻，出现了一种新的项目管理方式—— Monorepo。一个仓库管理多个项目。

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBBpVopKmLXGT0wzmBhBWrwreZWBBN6b4FpsFiaasQkOyBib7kzKytichuQ/640?wx_fmt=png)

**MultiRepo** 是目前常用的项目管理方式。但有些场景是不适用的，存在问题。

*   多业务组件、互相依赖、无法复用
    
*   发包流程复杂、版本管理痛苦
    

此刻就有了 **lerna.js**

简介
--

> “
> 
> Lerna (lerna)  is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

Lerna 是一个优化基于 git + npm 的多 package 的项目管理工具。

### 有哪些项目正在使用 Ta ？

*   Vue Cli https://github.com/vuejs/vue-cli
    
*   create-react-app https://github.com/babel/babel
    
*   mint-ui  https://github.com/ElemeFE/mint-ui
    
    ......
    

知识点
---

通过阅读本文，你将会学会下图内容：

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBDiaxu4qKKpqD6LX8zTQegPRribUpMGibWe4UP4FjSm0tnEFgVic9XZ0Zcg/640?wx_fmt=png)

使用与实践
-----

### 基本指令

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBklPuicGXJujVq2X2Y1CfcOBz0glwTFNA68VE4QuicNdA7cWrhI4mhgbg/640?wx_fmt=png)

Lerna 的几个基本常用指令, 不是本文重点哦。文档在这里 (https://lerna.js.org/)。

下图是结构目录等。

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBxibm4CHLtHLSxAN3dUWgVealbOAic3UfRxuYCCiaRF6iceKgnictoFrUolQ/640?wx_fmt=png)

### 与工作区使用

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBFeZ3CtrickYEcU1ZwtYGrgsanoSZoZH92dvtpuf5RTKEjOJq18oJ8HQ/640?wx_fmt=png)

```
// package.json 添加"workspaces":[ "packages/*"]// lerna.json 添加 "useWorkspaces":true, "npmClient": "yarn", // 配置好后，所有依赖就会安装在最外层的 node_modules 中，且支持软链接方式 // npm 7.x 之后，同样支持工作区域
```

学习的过程中少不了查看实现过程和运行流程。接下来我们分析一下 Lerna 中的一些代码，希望从中你能学到许多。

原理剖析
----

我们先 Github 克隆源码 (https://github.com/lerna/lerna)

观察一下目录

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBoVMmIeGdS33q8cqo9Cc3kD7Zf8icne04QeCsOO8r3vVkibrN8NBRX4CQ/640?wx_fmt=png)

### 指令的初始化流程  

脚手架入口文件位于 **/core/lerna/cli.js**

> “
> 
> **core/lerna/cli.js  入口**

```
#!/usr/bin/env node"use strict";/* eslint-disable import/no-dynamic-require, global-require */const importLocal = require("import-local");// 判断是否处于本地包文件，下文会介绍if (importLocal(__filename)) {  require("npmlog").info("cli", "using local version of lerna");} else {// 进入真实的入口执行代码  require(".")(process.argv.slice(2)); // [node, lerna, 指令]}
```

如图一和代码入口的文件仅执行了一条判断语句 ，其目的是为了当项目的局部环境和全局环境都存在 Lerna 时优先使用局部环境下的 Lerna 代码

*   import-local 一个判断是否本地包的方法库
    
*   require(".")  是导入当前目录下的 index.js  并传入指令执行代码 ( process.argv ->  [node, lerna, 指令] )
    

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBdJSQwibNhjcAfGlaW327p8IiaUr19GzDLdIlxRqpNao9jImiakJdhvWHw/640?wx_fmt=png)

> “
> 
> **core/lerna/index.js  初始化**

```
/** 省略相同代码 */// 导入 @lerna/cli 文件 const cli = require("@lerna/cli");// ..... 省略相同指令导入// 导入 publish 指令文件const publishCmd = require("@lerna/publish/command");const pkg = require("./package.json");module.exports = main;// 最终导出方法function main(argv) {  const context = {    lernaVersion: pkg.version,  };  return cli()  // ..... 省略     .command(publishCmd)    .parse(argv, context); // 解析注入指令 & 参数(版本号) }
```

来到这个代码中，如图二和代码实际上做了这几件事

*   初始化导入包 ("@lerna/cli")—— cli 实例
    
*   导入所需要的指令文件
    
*   通过 cli 实例的 command 方法注册指令
    
*   parse(argv, context) 是执行**解析注入**指令和参数 (版本号) 将 **Cli | 指令 | 入参** 进行模块划分，无论在业务中还是开源库中，都是一种优秀的划分方式
    

> “
> 
> **core/cli/index.js  全局指令初始化**

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBGgsa94Bv5q0zDVHD5FDP9jIzlrwtaps6icTVJdSibG9HuYf3k2dYYibOg/640?wx_fmt=png)

  

```
const dedent = require("dedent"); // 去除空行const log = require("npmlog");const yargs = require("yargs/yargs");const { globalOptions } = require("@lerna/global-options");module.exports = lernaCLI;function lernaCLI(argv, cwd) {  const cli = yargs(argv, cwd);  return globalOptions(cli)    .usage("Usage: $0 <command> [options]")    .demandCommand(1, "A command is required. Pass --help to see all available commands and options.") // 期望命令个数    .recommendCommands() // 推荐命令    .strict()  // 严格模式    .fail((msg, err) => {     // ... 省略    })    .alias("h", "help") // 别名    .alias("v", "version")    .wrap(cli.terminalWidth()) // 宽高    .epilogue(dedent`      When a command fails, all logs are written to lerna-debug.log in the current working directory.      For more information, find our manual at https://github.com/lerna/lerna    `);  // 结尾}
```

查看图三全局指令初始化，我们会发现全局指令接受实例的传入，也支持指令的注册。显然这也导出了改 cli 实例（单一实例）

*   指令的注册使用了 yargs 包进行管理（yargs 不是本文重点，不赘述）
    
*   返回实例，全局指令注册 return 实例
    
*   Config 是基本的配置分组等
    
*   导出实例给 **core/lerna/index.js** 调用 我们回到  **core/lerna/index.js** 文件，使用了 **command** 方法注册指令传入了导入的指令文件。
    

> “
> 
> **commands/ 业务指令的注册**

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBdkFl8gsKfKkHjt5BuRzroJO8dE95UoeRVx2mibwiaKqxRBqRabIPpXAw/640?wx_fmt=png)

可以看到图 4 中 commands 文件包中有着所有 lerna 指令的注册文件，每个文件夹带着 command.js 和 index.js  

在 **core/lerna/index.js** 导入的都是该目录中的 **command.js** (同入口逻辑在 handler 中执行了该目录下的 index.js)

**command.js** 包括 **yargs** 的 command、aliases、describe、builder (执行前的参数操作)、handler (指令执行逻辑) 

以 list 指令举例

*   执行指令的逻辑的方法在 **index.js**
    
*   继承 Command 做 指令的初始化
    
*   父类中会在 constructor 执行 initialize 和 execute 方法
    

```
const { Command } = require("@lerna/command");const listable = require("@lerna/listable");const { output } = require("@lerna/output");const { getFilteredPackages } = require("@lerna/filter-options");module.exports = factory;function factory(argv) {  return new ListCommand(argv);}class ListCommand extends Command {  get requiresGit() {    return false;  }  initialize() {    let chain = Promise.resolve();    chain = chain.then(() => getFilteredPackages(this.packageGraph, this.execOpts, this.options));    chain = chain.then((filteredPackages) => {      this.result = listable.format(filteredPackages, this.options);    });    return chain;  }  execute() {    // piping to `wc -l` should not yield 1 when no packages matched    if (this.result.text.length) {      output(this.result.text);    }    this.logger.success(      "found",      "%d %s",      this.result.count,      this.result.count === 1 ? "package" : "packages"    );  }}module.exports.ListCommand = ListCommand;
```

> “
> 
> **core/command/index.js  所有指令的 Command Class**

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBjaObMXcVOfJFicvcyGZoRchxYA3GKP9Y7Poz5sNdXj0Zmt4ovkvPS0Q/640?wx_fmt=png)

```
const { Project } = require("@lerna/project");// 省略大部分容错 和 logclass Command {  constructor(_argv) {    const argv = cloneDeep(_argv);    // "FooCommand" => "foo"    this.name = this.constructor.name.replace(/Command$/, "").toLowerCase();    // composed commands are called from other commands, like publish -> version    this.composed = typeof argv.composed === "string" && argv.composed !== this.name;    // launch the command    let runner = new Promise((resolve, reject) => {      // run everything inside a Promise chain      // 异步链      let chain = Promise.resolve();      chain = chain.then(() => {        this.project = new Project(argv.cwd);      });      // 配置、环境初始化等      chain = chain.then(() => this.configureEnvironment());      chain = chain.then(() => this.configureOptions());      chain = chain.then(() => this.configureProperties());      chain = chain.then(() => this.configureLogging());      chain = chain.then(() => this.runValidations());      chain = chain.then(() => this.runPreparations());      // 最终执行逻辑      chain = chain.then(() => this.runCommand());      chain.then(        (result) => {          warnIfHanging();          resolve(result);        },        (err) => {          if (err.pkg) {            // Cleanly log specific package error details            logPackageError(err, this.options.stream);          } else if (err.name !== "ValidationError") {            // npmlog does some funny stuff to the stack by default,            // so pass it directly to avoid duplication.            log.error("", cleanStack(err, this.constructor.name));          }          // ValidationError does not trigger a log dump, nor do external package errors          if (err.name !== "ValidationError" && !err.pkg) {            writeLogFile(this.project.rootPath);          }          warnIfHanging();          // error code is handled by cli.fail()          reject(err);        }      );    }); // ...省略部分代码  }  runCommand() {    return Promise.resolve()     // 命令初始化      .then(() => this.initialize())      .then((proceed) => {        if (proceed !== false) {          // 指令执行          return this.execute();        }        // early exits set their own exitCode (if non-zero)      });  } // 子类不存在 时 抛出错误  initialize() {    throw new ValidationError(this.name, "initialize() needs to be implemented.");  }  execute() {    throw new ValidationError(this.name, "execute() needs to be implemented.");  }}module.exports.Command = Command;
```

在 Class 中最关心的就是 constructor 的逻辑 ，如图 5 和代码。上面写到，每个子指令类会执行 initialize 和 execute 方法。我们整理一下

*   创建 Promise.resolve() 异步 Chain。
    
*   对全局配置、参数、环境初始化
    
*   执行 runCommand 方法
    
*   **runCommand 调用** initialize 和 execute（如果子类没有将会 执行 父类抛出异常） 采用了模板模式，对子指令通逻辑统一模板化。基本的执行流程就是这样。在这个 Class 中，很巧妙地将指令的初始化、指令的执行等逻辑均注册在 Promise 的异步任务中。
    
*   指令的执行逻辑均晚于 Cli 的同步代码。（不影响 Cli 的代码执行）
    
*   所有**异常错误**都可以统一捕获 通过上面的学习，我们几乎了解了 Lerna 的 一个指令 **输入** -> **解析** -> **注册** -> **执行** -> **输出** 的流程。
    

转过头我们看下脚手架初始化的第一步的 import-local 到底做了什么？

### 脚手架的初始化流程

import-local  用于获取 npm 是否包存在本地（当前工作区域），用于判断全局安装的包如果**本地**有安装, 优先用**本地**的，在 webpack-cli 中等绝大多数 cli 中都有运用。

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyB48wQsiats1FjGzvT2s1o7vWFh9n85jPVr78QiaT70cTaPaQx36PDU3lw/640?wx_fmt=png)

  

```
const path = require('path');const resolveCwd = require('resolve-cwd');const pkgDir = require('pkg-dir');module.exports = filename => {  // '/Users/nvm/versions/node/v14.17.3/lib/node_modules/lerna' 全局文件夹  const globalDir = pkgDir.sync(path.dirname(filename));  const relativePath = path.relative(globalDir, filename); // 'cli.js'  const pkg = require(path.join(globalDir, 'package.json'));  // '/Users/Desktop/person/lerna-demo/node_modules/lerna/cli.js' // 本地文件  const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));   // '/Users/Desktop/person/lerna-demo/node_modules'  // 本地文件的 node_modules  const localNodeModules = path.join(process.cwd(), 'node_modules');   const filenameInLocalNodeModules = !path.relative(localNodeModules, filename).startsWith('..') &&    // On Windows, if `localNodeModules` and `filename` are on different partitions, `path.relative()` returns the value of `filename`, resulting in `filenameInLocalNodeModules` incorrectly becoming `true`.    path.parse(localNodeModules).root === path.parse(filename).root;  // Use `path.relative()` to detect local package installation,  // because __filename's case is inconsistent on Windows  // Can use `===` when targeting Node.js 8  // See https://github.com/nodejs/node/issues/6624  // 导入使用本地包  return !filenameInLocalNodeModules && localFile && path.relative(localFile, filename) !== '' && require(localFile);};
```

通过最后一行，可以分析出，最核心的是解析出指定的 npm 包存在全局和 npm 的文件夹、路径。进而判断是 **require()** 本地还是全局。

问题 & 对比
-------

对比和查看问题之前，我们要关注一下 **Monorepo 单仓库多项目管理的模式带来的优势。**

前端工作中你是否会遇到以下问题？

问题 1：

前端同学小明发现了在小红同学的项目中存在相同的业务逻辑

A:  我选择复制一下代码

B:  我选择封装成 npm 包多项目复用

显然 A 方式就不是解决该问题的一种选项，完全不不符合应用程序的代码设计思想。

大多数同学就会异口同声我选择 B

那么如果这个 npm 包在后续迭代过程中发现，包依赖也要随之升级发布，怎么办？

又或者业务中存在大多数这种场景，每个包没有统一管理，花绝大多数时间在包依赖之间升级发布。以及各自包的迭代。

你可能只是删除了一行代码，你却要每个依赖这个包的 npm 包全部执行一遍流程。

问题 2：

在开发中，避免不了对 npm 包的更新，当你更新过程中少不了统一的打 tag 以及当前更新的包的影响面。是小的改动，还是大版本 api 无法兼容的升级。这些操作可能都会导致开发的项目中依赖未及时更新，tag 标记错误出现问题。

### 优势 & 劣势

就目前来看，**Monorepo 解决的是，多仓库之间的依赖变更升级，批量包管理节省时间成本的事情。**

**所以在开源社区中使用这种模式的一般存在于依赖拆分包，但是彼此之间独立的项目（npm 和脚手架等等）**

但是 Lerna 的多包管理也有不足之处

*   依赖之间调试复杂
    
*   changelog 信息不完整
    
*   Lerna 本身不支持工作区概念，需要借助其他工具
    
*   CI 定制成本大
    

### 其他 **MultiRepo 方案**

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBFq16TVxBVTSE1DSWO2n1GkcAt7MiczkbvVmmZ1CH2cTQhWiaBaoE9bicw/640?wx_fmt=png)

从图中我们可以看出  

pnpm 更注重包的管理（像下载，稳定准确性等），相比之下 Lerna 更注重包的发布流程规范指定。

二者适用的场景略有不同。

拓展
--

### import-local 解析

如图六和下方代码，很显然 resolve-cwd 和 pkg-dir 是实现 import-local 的主要工具包

*   resolve-cwd 解析类似 require.Resolve () 的模块的路径，但是要从当前工作目录中解析。
    
*   pkg-dir 从根目录查找节点。js 项目或 npm 包
    

> “
> 
> resolve-cwd 中使用 resolve-from 工具包解析路径来源

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBkXhQLms6d6MeKHCRGgzI9DokWNlw3bOfz3nWreHWo7RBHuicRD8SMdg/640?wx_fmt=png)

  

```
const path = require('path');const Module = require('module');// 省略部分代码const fromFile = path.join(fromDirectory, 'noop.js'); // '/Users/Desktop/home/person/lerna-demo/noop.js'const resolveFileName = () => Module._resolveFilename(moduleId, {    id: fromFile,    filename: fromFile,    paths: Module._nodeModulePaths(fromDirectory)});
```

*   使用原生的 module 的原生的两个 Api：Module._resolveFilename 和 Module._nodeModulePaths
    
*   Module._nodeModulePaths 推断出可能存在该 node/js/json 等包文件的路径数组
    
*   而在 Module._resolveFilename 这个方法中，首先会去检查，本地模块是否有这个模块，如果有，直接返回，如果没有，继续往下查找。模块对象的属性 包含
    
*   module.id
    
*   module.filename
    
*   module.loaded
    
*   module.parent
    
*   module.children
    
*   module.paths Module 是实现 **require() 和 热加载的核心方法之一。**
    

**部分实现可以参考阮一峰老师的** require() 源码解读 (https://www.ruanyifeng.com/blog/2015/05/require.html)

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBoysgKB0Dic6Peict0vY3xgpK6ZM4KyaASXeiagkZDQOydaRhDMhgF2oew/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyB6R9XTaEGFzKBe2JwfYOQkHiawgvf1dZN0E3tGHfbKeLRjYfDqadibqLA/640?wx_fmt=png)

  

> “
> 
> pkg-dir  中使用 find-up 工具包 向上找全局包文件夹

```
const locatePath = require('locate-path');const stop = Symbol('findUp.stop');module.exports.sync = (name, options = {}) => {  let directory = path.resolve(options.cwd || '');  const {root} = path.parse(directory);  const paths = [].concat(name);  const runMatcher = locateOptions => {    if (typeof name !== 'function') {      return locatePath.sync(paths, locateOptions);    }    const foundPath = name(locateOptions.cwd);    if (typeof foundPath === 'string') {      return locatePath.sync([foundPath], locateOptions);    }    return foundPath;  };  // eslint-disable-next-line no-constant-condition  while (true) {    const foundPath = runMatcher({...options, cwd: directory});    if (foundPath === stop) {      return;    }    if (foundPath) {        return path.resolve(directory, foundPath);    }    if (directory === root) {      return;    }    directory = path.dirname(directory);  }};
```

*   全局包文件夹全的在当前执行 cwd 向上查找存在 package.json 文件
    
*   所以 locatePath.sync 接受一个查找的文件路径数组和执行的 cwd 路径
    
*   通过 while **循环直至**找到 return path.resolve(directory, foundPath);
    

### 什么是软链接

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIB80biaib74Gtdp67PRBBkQyBqoR9pBw1JMjzVKp2p4lQ0vg5Hd1ubRzgmqUdKlHH8nZFSLiaKRJvmWA/640?wx_fmt=png)

**fs.symlink(target, path[, type], callback)** Node/symlink (http://nodejs.cn/api/fs.html#fssymlinktarget-path-type-callback)

```
target <string> | <Buffer> | <URL>   // 目标文件
path <string> | <Buffer> | <URL>  // 创建软链对应的地址
type <string>
```

该 API 会创建路径为 path 的链接，该链接指向 target。type 参数仅在 Windows 上可用，在其他平台上则会被忽略。可以被设置为 `dir`、 `file` 或 `function`。如果未设置 type 参数，则 Node.js 将会自动检测 target 的类型并使用 `file` 或 `dir`。

如果 target 不存在，则将会使用'file'。Windows 上的连接点要求目标路径是绝对路径。当使用'function' 时，target 参数将会自动地标准化为绝对路径。

总结
--

*   从 Lerna 的流程设计中，我们可以发现，每个可执行的 Node 程序，Lerna 都对其进行了拆分，再合。在自己的代码设计中，相信你也会遇到杂乱的代码。此刻你是无视，还是从 “杂” -> “分” -> “合” 来整理代码
    
*   其次我们看到 Lerna 中，使用了单例来注册指令。在注册指令，又采用了面相对象和模板模式，来抽离公共的初始化逻辑。而在指令的执行过程中，全是微任务的任务执行，这都是可以学习的设计思路和设计模式。
    
*   最后其他 MultiRepo 方案对比中可以看出，工具赋予的能力都有其优劣，没有好与不好，只有更适合。
    

参考文献
----

*   Lerna 文档 (https://lerna.js.org)
    
*   阮一峰老师的 require() 源码解读 (https://www.ruanyifeng.com/blog/2015/05/require.html)