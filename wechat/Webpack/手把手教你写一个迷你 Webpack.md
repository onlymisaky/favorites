> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vDuOV2OxgJlpk8EmGuVADg)

一、前言
====

最近正好在学习 Webpack，觉得 Webpack 这种通过构建模块依赖图来打包项目文件的思想很有意思，于是参考了网上的一些文章实现了一个简陋版本的 mini-webpack，通过入口文件将依赖的模块打包在一起，生成一份最终运行的代码。想了解 Webpack 的构建原理还需要补充一些相关的背景知识，下面一起来看看。

二、背景知识
======

1. 抽象语法树（AST）
-------------

什么是抽象语法树？

平时我们编写程序的时候，会经常在代码中根据需要 import 一些模块，那 Webpack 在构建项目、分析依赖的时候是如何得知我们代码中是否有 import 文件，import 的是什么文件的呢？Webpack 并不是人，无法像我们一样一看到代码语句就明白其含义，所以我们需要将编写的代码转换成 Webpack 认识的格式让他它进行处理，这份转换后生成的东西就是抽象语法树。下面这张图能很好地说明什么是抽象语法树：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCuAqibnKwIUjwz8MNIQK6wib9AIjuNylDHibElQnibSuy5ckMn6gqgOjV2rZ1ic4HeAnEGUNC4FmDx4uFQ/640?wx_fmt=jpeg)

可以看到，抽象语法树是源代码的抽象语法结构树状表现形式，我们每条编写的代码语句都可以被解析成一个个的节点，将一整个代码文件解析后就会生成一颗节点树，作为程序代码的抽象表示。通过抽象语法树，我们可以做以下事情：  

*   IDE 的错误提示、代码格式化、代码高亮、代码自动补全等
    
*   JSLint、JSHint、ESLint 对代码错误或风格的检查等
    
*   Webpack、rollup 进行代码打包等
    
*   Babel 转换 ES6 到 ES5 语法
    
*   注入代码统计单元测试覆盖率
    

想看看你的代码会生成怎样的抽象语法树吗？这里有一个工具 AST Explorer 能够在线预览你的代码生成的抽象语法树，感兴趣的不妨上去试一试。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCuAqibnKwIUjwz8MNIQK6wib979CszccMYErbh9Wj19p8WKoklAjErEtzRnj0cjp9bh6Dj8buzg3rzw/640?wx_fmt=png)

2. Babel
--------

Babel 是一个工具链，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。通过 Babel 我们可以做以下事情：

*   语法转换
    
*   通过 Polyfill 方式在目标环境中添加缺失的特性（通过第三方 Polyfill 模块，例如 core-js，实现）
    
*   源码转换 (codemods)
    

一般来说项目使用 Webpack 来打包文件都会配置 babel-loader 将 ES6 的代码转换成 ES5 的格式以兼容浏览器，这个过程就需要将我们的代码转换成抽象语法树后再进行转换处理，转换完成后再将抽象语法树还原成代码。

```
// Babel 输入：ES2015 箭头函数[1, 2, 3].map((n) => n + 1);// Babel 输出：ES5 语法实现的同等功能[1, 2, 3].map(function(n) {  return n + 1;});
```

3. Webpack 打包原理
---------------

Webpack 的构建过程一般会分为以下几步：

*   读取 Webpack 基础配置
    

```
// 读取 webpack.config.js 配置文件：    const path = require（"path"）    module.exports = {        entry:"./src/index.js"        mode:"development"        output:{          path:path.resolve(__dirname,"./dist"),          filename:"bundle.js"        }    }
```

*   入口文件分析
    

*   分析依赖模块
    
*   分析内容
    
*   编译内容
    

*   依赖模块分析
    

*   分析依赖模块是否有其他模块
    
*   分析内容
    
*   编译内容
    

*   生成打包文件
    

```
// 基础结构为一个IIFE自执行函数    // 接收一个对象参数，key 为入口文件的目录，value为一个执行入口文件里面代码的函数    (function (modules) {      // installedModules 用来存放缓存      const installedModules = {};      // __webpack_require__用来转化入口文件里面的代码      function __webpack_require__(moduleIid) { ... }      // IIFE将 modules 中的 key 传递给 __webpack_require__ 函数并返回。      return __webpack_require__(__webpack_require__.s = './src/index.js');    }({      './src/index.js': (function (module, exports) {        eval('console.log(\'test webpack entry\')');      }),    }));
```

三、具体实现
======

1. 安装相关依赖
---------

我们需要用到以下几个包：

*   @babel/parser：用于将输入代码解析成抽象语法树（AST）
    
*   @babel/traverse：用于对输入的抽象语法树（AST）进行遍历
    
*   @babel/core：babel 的核心模块，进行代码的转换
    
*   @babel/preset-env：可根据配置的目标浏览器或者运行环境来自动将 ES2015 + 的代码转换为 es5
    

使用 npm 命令安装一下：

```
npm install @babel/parser @babel/traverse @babel/core @babel/preset-env -D<br style="box-sizing: border-box;">
```

2. 读取基本配置
---------

要读取 Webpack 的基本配置，首先我们得有一个全局的配置文件：

```
// mini-webpack.config.jsconst path = require('path');module.exports ={    entry: "./src/index.js",    mode: "development",    output: {      path: path.resolve(__dirname,"./dist"),      filename: "bundle.js"    }}
```

然后我们新建一个类，用于实现分析编译等函数，并在构造函数中初始化配置信息：

```
const options = require('./mini-webpack.config');class MiniWebpack{    constructor(options){        this.options = options;    }    // ...}
```

3. 代码转换，获取模块信息
--------------

我们使用 `fs` 读取文件内容，使用 `parser` 将模块代码转换成抽象语法树，再使用 `traverse` 遍历抽象语法树，针对其中的 `ImportDeclaration` 节点保存模块的依赖信息，最终使用 `babel.transformFromAst` 方法将抽象语法树还原成 ES5 风格的代码。

```
parse = filename => {    // 读取文件    const fileBuffer = fs.readFileSync(filename, 'utf-8');    // 转换成抽象语法树    const ast = parser.parse(fileBuffer, { sourceType: 'module' });    const dependencies = {};    // 遍历抽象语法树    traverse(ast, {        // 处理ImportDeclaration节点        ImportDeclaration({node}){            const dirname = path.dirname(filename);            const newDirname = './' + path.join(dirname, node.source.value).replace('\\', '/');            dependencies[node.source.value] = newDirname;        }    })    // 将抽象语法树转换成代码    const { code } = babel.transformFromAst(ast, null, {        presets:['@babel/preset-env']    });        return {        filename,        dependencies,        code    }}
```

4. 分析依赖关系
---------

从入口文件开始，循环解析每个文件与其依赖文件的信息，最终生成以文件名为 `key`，以包含依赖关系与编译后模块代码的对象为 `value` 的依赖图谱对象并返回。

```
analyse = entry => {    // 解析入口文件    const entryModule = this.parse(entry);    const graphArray = [entryModule];    // 循环解析模块，保存信息    for(let i=0;i<graphArray.length;++i){        const { dependencies } = graphArray[i];        Object.keys(dependencies).forEach(filename => {            graphArray.push(this.parse(dependencies[filename]));        })    }    const graph = {};    // 生成依赖图谱对象    graphArray.forEach(({filename, dependencies, code})=>{        graph[filename] = {            dependencies,            code        };    })    return graph;}
```

5. 生成打包代码
---------

生成依赖图谱对象，作为参数传入一个自执行函数当中。可以看到，自执行函数中有个 require 函数，它的作用是通过调用 eval 执行模块代码来获取模块内部 export 出来的值。最终我们返回打包的代码。

```
generate = (graph, entry) => {    return `    (function(graph){        function require(filename){            function localRequire(relativePath){                return require(graph[filename].dependencies[relativePath]);            }            const exports = {};            (function(require, exports, code){                eval(code);            })(localRequire, exports, graph[filename].code)            return exports;        }                require('${entry}');    })(${graph})    `}
```

6. 输出最终文件
---------

通过获取 this.options 中的 output 信息，将打包代码输出到对应文件中。

```
fileOutput = (output, code) => {    const { path: dirPath, filename } = output;    const outputPath = path.join(dirPath, filename);    // 如果没有文件夹的话，生成文件夹    if(!fs.existsSync(dirPath)){        fs.mkdirSync(dirPath)    }    // 写入文件中    fs.writeFileSync(outputPath, code, 'utf-8');}
```

7. 模拟 run 函数
------------

我们将上面的流程集成到一个 run 函数中，通过调用该函数来将整个构建打包流程跑通。

```
run = () => {    const { entry, output } = this.options;    const graph = this.analyse(entry);    // stringify依赖图谱对象，防止在模板字符串中调用toString()返回[object Object]    const graphStr = JSON.stringify(graph);    const code = this.generate(graphStr, entry);    this.fileOutput(output, code);}
```

8.mini-webpack 大功告成
-------------------

通过上面的流程，我们的 mini-webpack 已经完成了。我们将文件保存为 main.js，新建一个 MiniWebpack 对象并执行它的 run 函数：

```
// main.jsconst options = require('./mini-webpack.config');class MiniWebpack{    constructor(options){        // ...    }    parse = filename => {        // ...    }    analyse = entry => {        // ...    }    generate = (graph, entry) => {        // ...    }    fileOutput = (output, code) => {        // ...    }    run = () => {        // ...    }}const miniWebpack = new MiniWebpack(options);miniWebpack.run();
```

四、实际演示
======

我们来实际试验一下，看看这个 mini-webpack 能不能正常运行。

1. 新建测试文件
---------

首先在根目录下创建 `src` 文件夹，新建 `a.js`、`b.js`、`index.js` 三个文件

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCuAqibnKwIUjwz8MNIQK6wib971CaWYLERQLdmZwDZ7PgsO2Cdj3rBlWB9hTr1AwAl4Gj0yl2I4S8pQ/640?wx_fmt=png)

三个文件内容如下：

*   ##### a.js
    

```
export default 1;
```

*   ##### b.js
    

```
export default function(){    console.log('I am b');}
```

*   ##### index.js  
    

```
import a from './a.js';import b from './b.js';console.log(a);console.log(b);
```

2. 填入配置文件
---------

配置好入口文件、输出文件等信息：

```
const path = require('path');module.exports ={    entry: "./src/index.js",    mode: "development",    output: {      path: path.resolve(__dirname,"./dist"),      filename: "bundle.js"    }}
```

3. 完善 package.json
------------------

我们在 package.json 的 `scripts` 中新增一个 `build` 命令，内容为执行 main.js：

```
{  "name": "mini-webpack",  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "test": "echo \"Error: no test specified\" && exit 1",    "build": "node main.js"  },  "author": "",  "license": "ISC",  "devDependencies": {    "@babel/core": "^7.15.4",    "@babel/parser": "^7.15.4",    "@babel/preset-env": "^7.15.4",    "@babel/traverse": "^7.15.4"  }}
```

4. 效果演示
-------

我们执行 `npm run build` 命令，可以看到在根目录下生成了 dist 文件夹，里面有个 bundle.js 文件，内容正是我们输出的打包代码：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCuAqibnKwIUjwz8MNIQK6wib9xs2EAjKkJ2qcD0OIHnFrT3icicRfqJib525sy2zm0Yb0N8IqvibXoeItibA/640?wx_fmt=png)

执行下 `bundle.js` 文件，看看会有什么输出：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCuAqibnKwIUjwz8MNIQK6wib9YsVVT6vvoBHYEFETgy21pNq9rbqUZFQuYG5icmSEibTqVaFiaNcc7aIMw/640?wx_fmt=png)

可以看到，bundle.js 的输出正是 index.js 文件中两个 console.log 输出的值，说明我们的代码转换没有问题，到这里试验算是成功了。

五、项目 Git 地址
===========

项目代码在此：mini-webpack

六、参考文章
======

1.  实现一个简单的 Webpack
    
2.  Babel 中文文档
    
3.  【你应该了解的】抽象语法树 AST
    
4.  webpack 构建原理和实现简单 webpack
    

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCv3wqhIVIl3Swtl0YTVVYtPclfGW61kjoRulbicrdAjV7gib55NKqYWicTgwnRgSaTQhNA3PeatM516w/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCv3wqhIVIl3Swtl0YTVVYtPic25FrbD0Y1GZJfpYIaoL8Y9E5MF3bsgicpf750goOrfgMr5VHRUAl0A/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/xsw6Lt5pDCv3wqhIVIl3Swtl0YTVVYtPclfGW61kjoRulbicrdAjV7gib55NKqYWicTgwnRgSaTQhNA3PeatM516w/640?wx_fmt=gif)