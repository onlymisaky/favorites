> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FCpJZnZCGgpWsi3XhvfwvA)

一、前言  

**Webpack** 一直都是有些人的心魔，不清楚原理是什么，不知道怎么去配置，只会基本的 API 使用。它就像一个黑盒，让部分开发者对它望而生畏。

而本节最大的作用，就是帮大家一点一点的消灭心魔。

大家之所以认为 **Webpack** 复杂，很大程度上是因为它依附着一套庞大的生态系统。**其实 Webpack 的核心流程远没有我们想象中那么复杂**，甚至只需百来行代码就能完整复刻出来。

因此在学习过程中，我们应**注重学习它本身的设计思想**，不管是它的 `Plugin 系统`还是 `Loader 系统`，**都是建立于这套核心思想之上**。所谓万变不离其宗，一通百通。

在本文中，我将会从 Webpack 的整体流程出发，通篇采用**结论先行、自顶向下**的方式进行讲解。在涉及到原理性的知识时，尽量采用图文的方式辅以理解，`注重实现思路`，`注重设计思想`。

文中所涉及到的代码均放到个人 github 仓库中：https://github.com/noBaldAaa/hand-webpack

二、基本使用
------

> 初始化项目：

```
npm init  //初始化一个项目yarn add webpack //安装项目依赖
```

安装完依赖后，根据以下目录结构来添加对应的目录和文件：

```
├── node_modules├── package-lock.json├── package.json├── webpack.config.js #配置文件├── debugger.js #测试文件└── src # 源码目录     |── index.js     |── name.js     └── age.js
```

**webpack.config.js**

```
const path = require("path");module.exports = {  mode: "development", //防止代码被压缩  entry: "./src/index.js", //入口文件  output: {    path: path.resolve(__dirname, "dist"),    filename: "[name].js",  },  devtool: "source-map", //防止干扰源文件};
```

**src/index.js（`本文不讨论CommonJS 和 ES Module之间的引用关系，以CommonJS为准`）**

```
const name = require("./name");const age = require("./age");console.log("entry文件打印作者信息", name, age);
```

**src/name.js**

```
module.exports = "不要秃头啊";
```

**src/age.js**

```
module.exports = "99";
```

**文件依赖关系：**

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iachRGKAVAJYZo5DoHuMzouWfc4dCddZQbjCZXsibMDcP80lcR857swEw/640?wx_fmt=other)

Webpack 本质上是一个函数，它接受一个配置信息作为参数，执行后返回一个 compiler 对象，调用 `compiler` 对象中的 run 方法就会启动编译。`run` 方法接受一个回调，可以用来查看编译过程中的错误信息或编译信息。

**debugger.js**

```
// const { webpack } = require("./webpack.js"); //后面自己手写const { webpack } = require("webpack");const webpackOptions = require("./webpack.config.js");const compiler = webpack(webpackOptions);//开始编译compiler.run((err, stats) => {  console.log(err);  console.log(    stats.toJson({      assets: true, //打印本次编译产出的资源      chunks: true, //打印本次编译产出的代码块      modules: true, //打印本次编译产出的模块    })  );});
```

执行打包命令：

```
node ./debugger.js
```

得到产出文件 **dist/main.js**（先暂停三十秒读一读下面代码，命名经优化）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaEicdHGdXeUoiabf6RQjrgxyIZjeDDc8Zp0H12Bkt4s97Tyz6uDBB8iaqQ/640?wx_fmt=other)

运行该文件，得到结果：

```
entry文件打印作者信息 不要秃头啊 99
```

三、核心思想
------

我们先来分析一下源代码和构建产物之间的关系：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2ia0KiaLFJox3gHzhYudE7qGdsb1qeZF8zm9WPJQXhnGR7UgH9e2yRNy6w/640?wx_fmt=other)

从图中可以看出，入口文件（`src/index.js`）被包裹在最后的立即执行函数中，而它所依赖的模块（`src/name.js`、`src/age.js`）则被放进了 `modules` 对象中（`modules` 用于存放**入口文件的依赖模块**，`key 值为依赖模块路径，value 值为依赖模块源代码`）。

`require` 函数是 **web 环境下** 加载模块的方法（ `require` 原本是 **node 环境** 中内置的方法，浏览器并不认识 `require`，所以这里需要手动实现一下），它接受模块的路径为参数，返回模块导出的内容。

要想弄清楚 Webpack 原理，那么核心问题就变成了：如何将左边的源代码转换成 **dist/main.js** 文件？

* * *

> 核心思想：

*   第一步：首先，根据配置信息（`webpack.config.js`）找到入口文件（`src/index.js`）
    
*   第二步：找到入口文件所依赖的模块，并收集关键信息：比如`路径、源代码、它所依赖的模块`等：
    
    ```
    var modules = [{  id: "./src/name.js",//路径  dependencies: [], //所依赖的模块  source: 'module.exports = "不要秃头啊";', //源代码},{  id: "./src/age.js",  dependencies: [],   source: 'module.exports = "99";',},{  id: "./src/index.js",  dependencies: ["./src/name.js", "./src/age.js"],   source:    'const name = require("./src/name.js");\n' +    'const age = require("./src/age.js");\n' +    'console.log("entry文件打印作者信息", name, age);',},];
    ```
    
*   第三步：根据上一步得到的信息，生成最终输出到硬盘中的文件（dist）：包括 modules 对象、require 模版代码、入口执行文件等
    

在这过程中，由于浏览器并不认识除 `html、js、css` 以外的文件格式，所以我们还需要对源文件进行转换 —— **`Loader 系统`**。

**Loader 系统** 本质上就是接收资源文件，并对其进行转换，最终输出转换后的文件：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaxiaacicw9MzTy2cemdTxAFYGHhXRLhYMFyCnndJhMO8Ewnricbe1hxJaQ/640?wx_fmt=other)

除此之外，打包过程中也有一些特定的时机需要处理，比如：

*   在打包前需要校验用户传过来的参数，判断格式是否符合要求
    
*   在打包过程中，需要知道哪些模块可以忽略编译，直接引用 cdn 链接
    
*   在编译完成后，需要将输出的内容插入到 html 文件中
    
*   在输出到硬盘前，需要先清空 dist 文件夹
    
*   ......
    

这个时候需要一个可插拔的设计，方便给社区提供可扩展的接口 —— **`Plugin 系统`**。

**Plugin 系统** 本质上就是一种事件流的机制，到了固定的时间节点就广播特定的事件，用户可以在事件内执行特定的逻辑，类似于生命周期：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaV99Wu3ZicAj9GDNJKXZEppO8mozqibsLpZOSttJ8Y57qS7Dw75z7w5og/640?wx_fmt=other)

这些设计也都是根据使用场景来的，只有理清需求后我们才能更好的理解它的设计思想。

四、架构设计
------

在理清楚核心思想后，剩下的就是对其进行一步步拆解。

上面提到，我们需要建立一套事件流的机制来管控整个打包过程，大致可以分为三个阶段：

*   打包开始前的准备工作
    
*   打包过程中（也就是编译阶段）
    
*   打包结束后（包含打包成功和打包失败）
    

这其中又以编译阶段最为复杂，另外还考虑到一个场景：watch mode[1]（当文件变化时，将重新进行编译），因此这里最好将编译阶段（也就是下文中的`compilation`）单独解耦出来。

在 **Webpack** 源码中，`compiler` 就像是一个大管家，它就代表上面说的三个阶段，在它上面挂载着各种生命周期函数，而 `compilation` 就像专管伙食的厨师，专门负责编译相关的工作，也就是`打包过程中`这个阶段。画个图帮助大家理解：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2ia0X9pGW335Zw2sJkicYfuGaTBZVsjHPZ9dAW3wlyXbjVvATbgf5BM99Q/640?wx_fmt=other)

大致架构定下后，那现在应该如何实现这套事件流呢？

这时候就需要借助 **Tapable** 了！它是一个类似于 Node.js 中的 **EventEmitter** 的库，但**更专注于自定义事件的触发和处理**。通过 Tapable 我们可以注册自定义事件，然后在适当的时机去执行自定义事件。

类比到 `Vue` 和 `React` 框架中的生命周期函数，它们就是到了固定的时间节点就执行对应的生命周期，`tapable` 做的事情就和这个差不多，我们可以通过它先注册一系列的生命周期函数，然后在合适的时间点执行。

example 🌰：

```
const { SyncHook } = require("tapable"); //这是一个同步钩子//第一步：实例化钩子函数，可以在这里定义形参const syncHook = new SyncHook(["author", "age"]);//第二步：注册事件1syncHook.tap("监听器1", (name, age) => {  console.log("监听器1:", name, age);});//第二步：注册事件2syncHook.tap("监听器2", (name) => {  console.log("监听器2", name);});//第三步：注册事件3syncHook.tap("监听器3", (name) => {  console.log("监听器3", name);});//第三步：触发事件，这里传的是实参，会被每一个注册函数接收到syncHook.call("不要秃头啊", "99");
```

运行上面这段代码，得到结果：

```
监听器1 不要秃头啊 99
监听器2 不要秃头啊
监听器3 不要秃头啊
```

在 Webpack 中，就是通过 `tapable` 在 `comiler` 和 `compilation` 上像这样挂载着一系列`生命周期 Hook`，它就像是一座桥梁，贯穿着整个构建过程：

```
class Compiler {  constructor() {    //它内部提供了很多钩子    this.hooks = {      run: new SyncHook(), //会在编译刚开始的时候触发此钩子      done: new SyncHook(), //会在编译结束的时候触发此钩子    };  }}
```

五、具体实现
------

整个实现过程大致分为以下步骤：

*   （1）搭建结构，读取配置参数
    
*   （2）用配置参数对象初始化 `Compiler` 对象
    
*   （3）挂载配置文件中的插件
    
*   （4）执行 `Compiler` 对象的 `run` 方法开始执行编译
    
*   （5）根据配置文件中的 `entry` 配置项找到所有的入口
    
*   （6）从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译
    
*   （7）找出此模块所依赖的模块，再对依赖模块进行编译
    
*   （8）等所有模块都编译完成后，根据模块之间的依赖关系，组装代码块 `chunk`
    
*   （9）把各个代码块 `chunk` 转换成一个一个文件加入到输出列表
    
*   （10）确定好输出内容之后，根据配置的输出路径和文件名，将文件内容写入到文件系统
    

### 5.1、搭建结构，读取配置参数

根据 **Webpack** 的用法可以看出， Webpack 本质上是一个函数，它接受一个配置信息作为参数，执行后返回一个 **compiler** 对象，调用 `compiler` 对象中的 **run** 方法就会启动编译。`run` 方法接受一个回调，可以用来查看编译过程中的错误信息或编译信息。

修改 **debugger.js** 中 webpack 的引用：

```
+ const webpack = require("./webpack"); //手写webpackconst webpackOptions = require("./webpack.config.js"); //这里一般会放配置信息const compiler = webpack(webpackOptions);compiler.run((err, stats) => {  console.log(err);  console.log(    stats.toJson({      assets: true, //打印本次编译产出的资源      chunks: true, //打印本次编译产出的代码块      modules: true, //打印本次编译产出的模块    })  );});
```

搭建结构：

```
class Compiler {  constructor() {}    run(callback) {}}//第一步：搭建结构，读取配置参数，这里接受的是webpack.config.js中的参数function webpack(webpackOptions) {  const compiler = new Compiler()  return compiler;}
```

运行流程图：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaZVuIRJPkA0cB1JyNKGyzrhq5rO0ggXP0YUtmN4KHPdiayQKDg2mglzg/640?wx_fmt=other)

### 5.2、用配置参数对象初始化 `Compiler` 对象

上面提到过，`Compiler` 它就是整个打包过程的大管家，它里面放着各种你可能需要的`编译信息`和`生命周期 Hook`，而且是单例模式。

```
//Compiler其实是一个类，它是整个编译过程的大管家，而且是单例模式class Compiler {+ constructor(webpackOptions) {+   this.options = webpackOptions; //存储配置信息+   //它内部提供了很多钩子+   this.hooks = {+     run: new SyncHook(), //会在编译刚开始的时候触发此run钩子+     done: new SyncHook(), //会在编译结束的时候触发此done钩子+   };+ }}//第一步：搭建结构，读取配置参数，这里接受的是webpack.config.js中的参数function webpack(webpackOptions) {  //第二步：用配置参数对象初始化 `Compiler` 对象+ const compiler = new Compiler(webpackOptions)  return compiler;}
```

运行流程图：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaFS6aZqnRfRem0NiaeDoAspDQj9eLEKJoacdkqibs5dovdeOfmseRg1Lw/640?wx_fmt=other)

### 5.3、挂载配置文件中的插件

先写两个自定义插件配置到 **webpack.config.js** 中：一个在开始打包的时候执行，一个在打包完成后执行。

`Webpack Plugin 其实就是一个普通的函数，在该函数中需要我们定制一个 apply 方法。`当 Webpack 内部进行插件挂载时会执行 `apply` 函数。我们可以在 `apply` 方法中订阅各种生命周期钩子，当到达对应的时间点时就会执行。

```
//自定义插件WebpackRunPluginclass WebpackRunPlugin {  apply(compiler) {    compiler.hooks.run.tap("WebpackRunPlugin", () => {      console.log("开始编译");    });  }}//自定义插件WebpackDonePluginclass WebpackDonePlugin {  apply(compiler) {    compiler.hooks.done.tap("WebpackDonePlugin", () => {      console.log("结束编译");    });  }}
```

**webpack.config.js**：

```
+ const { WebpackRunPlugin, WebpackDonePlugin } = require("./webpack");module.exports = {  //其他省略+ plugins: [new WebpackRunPlugin(), new WebpackDonePlugin()],};
```

插件定义时必须要有一个 `apply` 方法，加载插件其实执行 `apply` 方法。

```
//第一步：搭建结构，读取配置参数，这里接受的是webpack.config.js中的参数function webpack(webpackOptions) {  //第二步：用配置参数对象初始化 `Compiler` 对象  const compiler = new Compiler(webpackOptions);  //第三步：挂载配置文件中的插件+ const { plugins } = webpackOptions;+ for (let plugin of plugins) {+   plugin.apply(compiler);+ }  return compiler;}
```

运行流程图：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaiaxSAT8vlXkKo3ofrPqoicfMVdbJWK50PkWJe3DmNK9o5ic6wcwqNrVJQ/640?wx_fmt=other)

### 5.4、执行`Compiler`对象的`run`方法开始执行编译

重点来了！

在正式开始编译前，我们需要先调用 `Compiler` 中的 `run` 钩子，表示开始启动编译了；在编译结束后，需要调用 `done` 钩子，表示编译完成。

```
//Compiler其实是一个类，它是整个编译过程的大管家，而且是单例模式class Compiler {  constructor(webpackOptions) {   //省略  }  + compile(callback){+  //+ }+ //第四步：执行`Compiler`对象的`run`方法开始执行编译+ run(callback) {+   this.hooks.run.call(); //在编译前触发run钩子执行，表示开始启动编译了+   const onCompiled = () => {+     this.hooks.done.call(); //当编译成功后会触发done这个钩子执行+   };+   this.compile(onCompiled); //开始编译，成功之后调用onCompiled  }}
```

上面架构设计中提到过，编译这个阶段需要单独解耦出来，通过 `Compilation` 来完成，定义`Compilation` 大致结构：

```
class Compiler {  //省略其他  run(callback) {    //省略  }    compile(callback) {    //虽然webpack只有一个Compiler，但是每次编译都会产出一个新的Compilation，    //这里主要是为了考虑到watch模式，它会在启动时先编译一次，然后监听文件变化，如果发生变化会重新开始编译    //每次编译都会产出一个新的Compilation，代表每次的编译结果+   let compilation = new Compilation(this.options);+   compilation.build(callback); //执行compilation的build方法进行编译，编译成功之后执行回调  }}+ class Compilation {+   constructor(webpackOptions) {+     this.options = webpackOptions;+     this.modules = []; //本次编译所有生成出来的模块+     this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块+     this.assets = {}; //本次编译产出的资源文件+     this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译+   }+   build(callback) {+    //这里开始做编译工作，编译成功执行callback+    callback()+   }+ }
```

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iatuUaOmpgHu2k6Rz48XgLM5r8r0vECsutHog6zr5diaXCLTrRzZjIOaQ/640?wx_fmt=other)

### 5.5、根据配置文件中的`entry`配置项找到所有的入口

接下来就正式开始编译了，逻辑均在 `Compilation` 中。

在编译前我们首先需要知道入口文件，而 入口的配置方式 [2] 有多种，可以配置成字符串，也可以配置成一个对象，这一步骤就是为了统一配置信息的格式，然后找出所有的入口（考虑多入口打包的场景）。

```
class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }  build(callback) {    //第五步：根据配置文件中的`entry`配置项找到所有的入口+   let entry = {};+   if (typeof this.options.entry === "string") {+     entry.main = this.options.entry; //如果是单入口，将entry:"xx"变成{main:"xx"}，这里需要做兼容+   } else {+     entry = this.options.entry;+   }    //编译成功执行callback    callback()  }}
```

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaQXSXvCupiay18hhOHuoC3FVViaoAibdmricETnodKS1OSECRdVVbjMnibrA/640?wx_fmt=other)

### 5.6、从入口文件出发，调用配置的`loader`规则，对各模块进行编译

Loader 本质上就是一个函数，接收资源文件或者上一个 Loader 产生的结果作为入参，最终输出转换后的结果。

写两个自定义 Loader 配置到 **webpack.config.js** 中：

```
const loader1 = (source) => {  return source + "//给你的代码加点注释：loader1";};const loader2 = (source) => {  return source + "//给你的代码加点注释：loader2";};
```

**webpack.config.js**

```
const { loader1, loader2 } = require("./webpack");module.exports = {  //省略其他  module: {    rules: [      {        test: /\.js$/,        use: [loader1, loader2],      },    ],  },};
```

这一步骤将从入口文件出发，然后查找出对应的 Loader 对源代码进行翻译和替换。

主要有三个要点：

*   （6.1）把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块
    
*   （6.2）得到入口模块的的 `module` 对象 （里面放着该模块的路径、依赖模块、源代码等）
    

*   （6.2.1）读取模块内容，获取源代码
    
*   （6.2.2）创建模块对象
    
*   （6.2.3）找到对应的 `Loader` 对源代码进行翻译和替换
    

*   （6.3）将生成的入口文件 `module` 对象 push 进 `this.modules` 中
    

> 6.1：把入口文件的绝对路径添加到依赖数组中，记录此次编译依赖的模块

这里因为要获取入口文件的绝对路径，考虑到操作系统的兼容性问题，需要将路径的 `\` 都替换成 `/`：

```
//将\替换成/function toUnixPath(filePath) {  return filePath.replace(/\\/g, "/");}const baseDir = toUnixPath(process.cwd()); //获取工作目录，在哪里执行命令就获取哪里的目录，这里获取的也是跟操作系统有关系，要替换成/class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }  build(callback) {    //第五步：根据配置文件中的`entry`配置项找到所有的入口    let entry = {};    if (typeof this.options.entry === "string") {      entry.main = this.options.entry; //如果是单入口，将entry:"xx"变成{main:"xx"}，这里需要做兼容    } else {      entry = this.options.entry;    }+   //第六步：从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译+   for (let entryName in entry) {+     //entry entryName就是entry的属性名，也将会成为代码块的名称+     let entryFilePath = path.posix.join(baseDir, entry[entryName]); //path.posix为了解决不同操作系统的路径分隔符,这里拿到的就是入口文件的绝对路径+     //6.1 把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块+     this.fileDependencies.push(entryFilePath);+   }    //编译成功执行callback    callback()  }}
```

> 6.2.1：读取模块内容，获取源代码

```
class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }+ //当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径+ buildModule(name, modulePath) {+   //6.2.1 读取模块内容，获取源代码+   let sourceCode = fs.readFileSync(modulePath, "utf8");++   return {};+ }  build(callback) {    //第五步：根据配置文件中的`entry`配置项找到所有的入口    //代码省略...    //第六步：从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译    for (let entryName in entry) {      //entry entryName就是entry的属性名，也将会成为代码块的名称      let entryFilePath = path.posix.join(baseDir, entry[entryName]); //path.posix为了解决不同操作系统的路径分隔符,这里拿到的就是入口文件的绝对路径      //6.1 把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块      this.fileDependencies.push(entryFilePath);      //6.2 得到入口模块的的 `module` 对象 （里面放着该模块的路径、依赖模块、源代码等）+     let entryModule = this.buildModule(entryName, entryFilePath);    }    //编译成功执行callback    callback()  }}
```

> 6.2.2：创建模块对象

```
class Compilation {  //省略其他  //当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径  buildModule(name, modulePath) {    //6.2.1 读取模块内容，获取源代码    let sourceCode = fs.readFileSync(modulePath, "utf8");    //buildModule最终会返回一个modules模块对象，每个模块都会有一个id,id是相对于根目录的相对路径+   let moduleId = "./" + path.posix.relative(baseDir, modulePath); //模块id:从根目录出发，找到与该模块的相对路径（./src/index.js）+   //6.2.2 创建模块对象+   let module = {+     id: moduleId,+     names: [name], //names设计成数组是因为代表的是此模块属于哪个代码块，可能属于多个代码块+     dependencies: [], //它依赖的模块+     _source: "", //该模块的代码信息+   };+   return module;  }    build(callback) {    //省略  }}
```

> 6.2.3：找到对应的 `Loader` 对源代码进行翻译和替换

```
class Compilation {  //省略其他    //当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径  buildModule(name, modulePath) {    //6.2.1 读取模块内容，获取源代码    let sourceCode = fs.readFileSync(modulePath, "utf8");    //buildModule最终会返回一个modules模块对象，每个模块都会有一个id,id是相对于根目录的相对路径    let moduleId = "./" + path.posix.relative(baseDir, modulePath); //模块id:从根目录出发，找到与该模块的相对路径（./src/index.js）    //6.2.2 创建模块对象    let module = {      id: moduleId,      names: [name], //names设计成数组是因为代表的是此模块属于哪个代码块，可能属于多个代码块      dependencies: [], //它依赖的模块      _source: "", //该模块的代码信息    };    //6.2.3 找到对应的 `Loader` 对源代码进行翻译和替换+   let loaders = [];+   let { rules = [] } = this.options.module;+   rules.forEach((rule) => {+     let { test } = rule;+     //如果模块的路径和正则匹配，就把此规则对应的loader添加到loader数组中+     if (modulePath.match(test)) {+       loaders.push(...rule.use);+     }+   });+   //自右向左对模块进行转译+   sourceCode = loaders.reduceRight((code, loader) => {+     return loader(code);+   }, sourceCode);    return module;  }    build(callback) {    //省略  }}
```

> 6.3：将生成的入口文件 `module` 对象 push 进 `this.modules` 中

```
class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }  buildModule(name, modulePath) {    //省略其他  }    build(callback) {    //第五步：根据配置文件中的`entry`配置项找到所有的入口    //省略其他    //第六步：从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译    for (let entryName in entry) {      //entry entryName就是entry的属性名，也将会成为代码块的名称      let entryFilePath = path.posix.join(baseDir, entry[entryName]); //path.posix为了解决不同操作系统的路径分隔符,这里拿到的就是入口文件的绝对路径      //6.1 把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块      this.fileDependencies.push(entryFilePath);      //6.2 得到入口模块的的 `module` 对象 （里面放着该模块的路径、依赖模块、源代码等）      let entryModule = this.buildModule(entryName, entryFilePath);+     //6.3 将生成的入口文件 `module` 对象 push 进 `this.modules` 中+     this.modules.push(entryModule);    }    //编译成功执行callback    callback()  }}
```

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaak3Hia87snBSoia9jVdAx3SggNSIFiaJIiabvnLvPREXKrI3mSxhwvCfbg/640?wx_fmt=other)

### 5.7、找出此模块所依赖的模块，再对依赖模块进行编译

该步骤是整体流程中最为复杂的，一遍看不懂没关系，可以先理解思路。

该步骤经过细化可以将其拆分成十个小步骤：

*   （7.1）：先把源代码编译成 AST[3]
    
*   （7.2）：在 `AST` 中查找 `require` 语句，找出依赖的模块名称和绝对路径
    
*   （7.3）：将依赖模块的绝对路径 push 到 `this.fileDependencies` 中
    
*   （7.4）：生成依赖模块的`模块 id`
    
*   （7.5）：修改语法结构，把依赖的模块改为依赖`模块 id`
    
*   （7.6）：将依赖模块的信息 push 到该模块的 `dependencies` 属性中
    
*   （7.7）：生成新代码，并把转译后的源代码放到 `module._source` 属性上
    
*   （7.8）：对依赖模块进行编译（对 `module 对象`中的 `dependencies` 进行递归执行 `buildModule` ）
    
*   （7.9）：对依赖模块编译完成后得到依赖模块的 `module 对象`，push 到 `this.modules` 中
    
*   （7.10）：等依赖模块全部编译完成后，返回入口模块的 `module` 对象
    

```
+ const parser = require("@babel/parser");+ let types = require("@babel/types"); //用来生成或者判断节点的AST语法树的节点+ const traverse = require("@babel/traverse").default;+ const generator = require("@babel/generator").default;//获取文件路径+ function tryExtensions(modulePath, extensions) {+   if (fs.existsSync(modulePath)) {+     return modulePath;+   }+   for (let i = 0; i < extensions?.length; i++) {+     let filePath = modulePath + extensions[i];+     if (fs.existsSync(filePath)) {+       return filePath;+     }+   }+   throw new Error(`无法找到${modulePath}`);+ }class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }  //当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径  buildModule(name, modulePath) {    //省略其他    //6.2.1 读取模块内容，获取源代码    //6.2.2 创建模块对象    //6.2.3 找到对应的 `Loader` 对源代码进行翻译和替换    //自右向左对模块进行转译    sourceCode = loaders.reduceRight((code, loader) => {      return loader(code);    }, sourceCode);    //通过loader翻译后的内容一定得是js内容，因为最后得走我们babel-parse，只有js才能成编译AST    //第七步：找出此模块所依赖的模块，再对依赖模块进行编译+     //7.1：先把源代码编译成 [AST](https://astexplorer.net/)+     let ast = parser.parse(sourceCode, { sourceType: "module" });+     traverse(ast, {+       CallExpression: (nodePath) => {+         const { node } = nodePath;+         //7.2：在 `AST` 中查找 `require` 语句，找出依赖的模块名称和绝对路径+         if (node.callee.name === "require") {+           let depModuleName = node.arguments[0].value; //获取依赖的模块+           let dirname = path.posix.dirname(modulePath); //获取当前正在编译的模所在的目录+           let depModulePath = path.posix.join(dirname, depModuleName); //获取依赖模块的绝对路径+           let extensions = this.options.resolve?.extensions || [ ".js" ]; //获取配置中的extensions+           depModulePath = tryExtensions(depModulePath, extensions); //尝试添加后缀，找到一个真实在硬盘上存在的文件+           //7.3：将依赖模块的绝对路径 push 到 `this.fileDependencies` 中+           this.fileDependencies.push(depModulePath);+           //7.4：生成依赖模块的`模块 id`+           let depModuleId = "./" + path.posix.relative(baseDir, depModulePath);+           //7.5：修改语法结构，把依赖的模块改为依赖`模块 id` require("./name")=>require("./src/name.js")+           node.arguments = [types.stringLiteral(depModuleId)];+           //7.6：将依赖模块的信息 push 到该模块的 `dependencies` 属性中+           module.dependencies.push({ depModuleId, depModulePath });+         }+       },+     });+     //7.7：生成新代码，并把转译后的源代码放到 `module._source` 属性上+     let { code } = generator(ast);+     module._source = code;+     //7.8：对依赖模块进行编译（对 `module 对象`中的 `dependencies` 进行递归执行 `buildModule` ）+     module.dependencies.forEach(({ depModuleId, depModulePath }) => {+       //考虑到多入口打包 ：一个模块被多个其他模块引用，不需要重复打包+       let existModule = this.modules.find((item) => item.id === depModuleId);+       //如果modules里已经存在这个将要编译的依赖模块了，那么就不需要编译了，直接把此代码块的名称添加到对应模块的names字段里就可以+       if (existModule) {+         //names指的是它属于哪个代码块chunk+         existModule.names.push(name);+       } else {+         //7.9：对依赖模块编译完成后得到依赖模块的 `module 对象`，push 到 `this.modules` 中+         let depModule = this.buildModule(name, depModulePath);+         this.modules.push(depModule);+       }+     });+     //7.10：等依赖模块全部编译完成后，返回入口模块的 `module` 对象+     return module;   }    //省略其他}
```

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaYkF8icwtDia5pLibziaPScc9omwicgWbxaARVr5uwUWWPvU9xhF6xBalXZg/640?wx_fmt=other)

### 5.8、等所有模块都编译完成后，根据模块之间的依赖关系，组装代码块 `chunk`

现在，我们已经知道了入口模块和它所依赖模块的所有信息，可以去生成对应的代码块了。

一般来说，每个入口文件会对应一个代码块`chunk`，每个代码块`chunk`里面会放着本入口模块和它依赖的模块，这里暂时不考虑代码分割。

```
class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }    buildModule(name, modulePath) {   //省略其他  }  build(callback) {    //第五步：根据配置文件中的`entry`配置项找到所有的入口    //省略其他    //第六步：从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译    for (let entryName in entry) {      //entry entryName就是entry的属性名，也将会成为代码块的名称      let entryFilePath = path.posix.join(baseDir, entry[entryName]); //path.posix为了解决不同操作系统的路径分隔符,这里拿到的就是入口文件的绝对路径      //6.1 把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块      this.fileDependencies.push(entryFilePath);      //6.2 得到入口模块的的 `module` 对象 （里面放着该模块的路径、依赖模块、源代码等）      let entryModule = this.buildModule(entryName, entryFilePath);      //6.3 将生成的入口文件 `module` 对象 push 进 `this.modules` 中      this.modules.push(entryModule);      //第八步：等所有模块都编译完成后，根据模块之间的依赖关系，组装代码块 `chunk`（一般来说，每个入口文件会对应一个代码块`chunk`，每个代码块`chunk`里面会放着本入口模块和它依赖的模块）+     let chunk = {+       name: entryName, //entry 代码块的名称+       entryModule, //此代码块对应的module的对象,这里就是src/index.js 的module对象+       modules: this.modules.filter((item) => item.names.includes(entryName)), //找出属于该代码块的模块+     };+     this.chunks.push(chunk);    }    //编译成功执行callback    callback()  }}
```

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaJdMKPgSa46RCZD2aBdGZvosuxPAiaUGN3nUoNib8uj4ia9f4fIbZv13ibQ/640?wx_fmt=other)

### 5.9、把各个代码块 `chunk` 转换成一个一个文件加入到输出列表

这一步需要结合配置文件中的`output.filename`去生成输出文件的文件名称，同时还需要生成运行时代码：

```
//生成运行时代码+ function getSource(chunk) {+   return `+    (() => {+     var modules = {+       ${chunk.modules.map(+         (module) => `+         "${module.id}": (module) => {+           ${module._source}+         }+       `+       )}  +     };+     var cache = {};+     function require(moduleId) {+       var cachedModule = cache[moduleId];+       if (cachedModule !== undefined) {+         return cachedModule.exports;+       }+       var module = (cache[moduleId] = {+         exports: {},+       });+       modules[moduleId](module, module.exports, require);+       return module.exports;+     }+     var exports ={};+     ${chunk.entryModule._source}+   })();+    `;+ }class Compilation {  constructor(webpackOptions) {    this.options = webpackOptions;    this.modules = []; //本次编译所有生成出来的模块    this.chunks = []; //本次编译产出的所有代码块，入口模块和依赖的模块打包在一起为代码块    this.assets = {}; //本次编译产出的资源文件    this.fileDependencies = []; //本次打包涉及到的文件，这里主要是为了实现watch模式下监听文件的变化，文件发生变化后会重新编译  }  //当编译模块的时候，name：这个模块是属于哪个代码块chunk的，modulePath：模块绝对路径  buildModule(name, modulePath) {    //省略  }  build(callback) {    //第五步：根据配置文件中的`entry`配置项找到所有的入口    //第六步：从入口文件出发，调用配置的 `loader` 规则，对各模块进行编译    for (let entryName in entry) {      //省略      //6.1 把入口文件的绝对路径添加到依赖数组（`this.fileDependencies`）中，记录此次编译依赖的模块      //6.2 得到入口模块的的 `module` 对象 （里面放着该模块的路径、依赖模块、源代码等）      //6.3 将生成的入口文件 `module` 对象 push 进 `this.modules` 中      //第八步：等所有模块都编译完成后，根据模块之间的依赖关系，组装代码块 `chunk`（一般来说，每个入口文件会对应一个代码块`chunk`，每个代码块`chunk`里面会放着本入口模块和它依赖的模块）    }    //第九步：把各个代码块 `chunk` 转换成一个一个文件加入到输出列表+    this.chunks.forEach((chunk) => {+      let filename = this.options.output.filename.replace("[name]", chunk.name);+      this.assets[filename] = getSource(chunk);+    });+     callback(+       null,+       {+         chunks: this.chunks,+         modules: this.modules,+         assets: this.assets,+       },+       this.fileDependencies+     );  }}
```

到了这里，`Compilation` 的逻辑就走完了。

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaDhxbeGjibrpicmYsqOfNIGG0iakO7mR2OM6eiaIEickmy80578BK15GHhMA/640?wx_fmt=other)

### 5.10、确定好输出内容之后，根据配置的输出路径和文件名，将文件内容写入到文件系统

该步骤就很简单了，直接按照 Compilation 中的 this.status 对象将文件内容写入到文件系统（这里就是硬盘）。

```
class Compiler {  constructor(webpackOptions) {    this.options = webpackOptions; //存储配置信息    //它内部提供了很多钩子    this.hooks = {      run: new SyncHook(), //会在编译刚开始的时候触发此run钩子      done: new SyncHook(), //会在编译结束的时候触发此done钩子    };  }  compile(callback) {    //省略  }  //第四步：执行`Compiler`对象的`run`方法开始执行编译  run(callback) {    this.hooks.run.call(); //在编译前触发run钩子执行，表示开始启动编译了    const onCompiled = (err, stats, fileDependencies) => {+     //第十步：确定好输出内容之后，根据配置的输出路径和文件名，将文件内容写入到文件系统（这里就是硬盘）+     for (let filename in stats.assets) {+       let filePath = path.join(this.options.output.path, filename);+       fs.writeFileSync(filePath, stats.assets[filename], "utf8");+     }  +     callback(err, {+       toJson: () => stats,+     });      this.hooks.done.call(); //当编译成功后会触发done这个钩子执行    };    this.compile(onCompiled); //开始编译，成功之后调用onCompiled  }}
```

运行流程图（点击可放大）：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaxNfqJQiaQo9IdUdSjAQmDsWS2OEqKpJDsVibHbdQHaFRjDCbqxfYLPzA/640?wx_fmt=other)

### 完整流程图

以上就是整个 Webpack 的运行流程图，还是描述的比较清晰的，跟着一步步走看懂肯定没问题！

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaCHd6icnEcj7N4F0arnF7VqbXJnrDrAUJub3L3LRI2ERQAGvO3xeMWaw/640?wx_fmt=other)

执行 `node ./debugger.js`，通过我们手写的 Webpack 进行打包，得到输出文件 **dist/main.js**：

![](https://mmbiz.qpic.cn/mmbiz/mshqAkialV7F9r8KqkI6SZT7SIor7Ug2iaJx4WGxU1eliasCbzdkr2goyyiclJAo2gkVv3PyNLhB8uD3hp4NUFK0mg/640?wx_fmt=other)carbon.png

六、实现 watch 模式
-------------

看完上面的实现，有些小伙伴可能有疑问了：`Compilation` 中的 `this.fileDependencies`（本次打包涉及到的文件）是用来做什么的？为什么没有地方用到该属性？

这里其实是为了实现 Webpack 的 watch 模式 [4]：当文件发生变更时将重新编译。

思路：对 `this.fileDependencies` 里面的文件进行监听，当文件发生变化时，重新执行 `compile` 函数。

```
class Compiler {  constructor(webpackOptions) {   //省略  }  compile(callback) {    //虽然webpack只有一个Compiler，但是每次编译都会产出一个新的Compilation，    //这里主要是为了考虑到watch模式，它会在启动时先编译一次，然后监听文件变化，如果发生变化会重新开始编译    //每次编译都会产出一个新的Compilation，代表每次的编译结果    let compilation = new Compilation(this.options);    compilation.build(callback); //执行compilation的build方法进行编译，编译成功之后执行回调  }  //第四步：执行`Compiler`对象的`run`方法开始执行编译  run(callback) {    this.hooks.run.call(); //在编译前触发run钩子执行，表示开始启动编译了    const onCompiled = (err, stats, fileDependencies) => {      //第十步：确定好输出内容之后，根据配置的输出路径和文件名，将文件内容写入到文件系统（这里就是硬盘）      for (let filename in stats.assets) {        let filePath = path.join(this.options.output.path, filename);        fs.writeFileSync(filePath, stats.assets[filename], "utf8");      }      callback(err, {        toJson: () => stats,      });+     fileDependencies.forEach((fileDependencie) => {+       fs.watch(fileDependencie, () => this.compile(onCompiled));+     });      this.hooks.done.call(); //当编译成功后会触发done这个钩子执行    };    this.compile(onCompiled); //开始编译，成功之后调用onCompiled  }}
```

相信看到这里，你一定也理解了 compile 和 Compilation 的设计，都是为了解耦和复用呀。

七、总结
----

本文从 Webpack 的基本使用和构建产物出发，从思想和架构两方面深度剖析了 Webpack 的设计理念。最后在代码实现阶段，通过百来行代码手写了 Webpack 的整体流程，尽管它只能对文件进行打包，还缺少很多功能，但麻雀虽小，却也五脏俱全。

相信读完本章，你也一定已经克服 Webpack 的恐惧了!

### 参考资料

[1]

watch mode: _https://webpack.docschina.org/guides/development/#using-watch-mode_

[2]

入口的配置方式: _https://webpack.js.org/configuration/entry-context/#entry_

[3]

https://astexplorer.net/: _https://link.juejin.cn?target=https%3A%2F%2Fastexplorer.net%2F_

[4]

Webpack 的 watch 模式: _https://webpack.docschina.org/guides/development/#using-watch-mode_

> 作者：不要秃头啊
> 
> https://juejin.cn/post/7170852747749621791