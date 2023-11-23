> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tDIIZUV4sDZ0lkPX0FPAHQ)

大厂技术  坚持周更  精选好文
================

> 本文为来自 **字节教育 - 成人与创新前端团队** 成员的文章，已授权 ELab 发布。

简介
==

> 在计算机科学中，抽象语法树是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。之所以说语法是 “抽象” 的，是因为这里的语法并不会表示出真实语法中出现的每个细节。
> 
> ——维基百科

在前端基建中，ast 可以说是必不可少的。对 ast 进行操作，其实就相当于对源代码进行操作。

ast 的应用包括：

1.  开发辅助：eslint、prettier、ts 检查
    
2.  代码变更：压缩、混淆、css modules
    
3.  代码转换：jsx、vue、ts 转换为 js
    

ast 的生成
=======

通过词法分析和语法分析，可以得出一颗 ast。

1.  词法分析
    

词法分析的过程是将代码喂给有限状态机，结果是将代码单词转换为令牌（token），一个 token 包含的信息包括其的种类、属性值等。

例如将 `const a = 1 + 1` 转换为 token 的话，结果大概如下

```
[  {type: 关键字, value: const},   {type: 标识符, value: a},  {type: 赋值操作符, value: =},  {type: 常数, value: 1},  {type: 运算符, value: +},   {type: 常数, value: 1},]
```

2.  语法分析
    

面对一串代码，先通过词法分析，获得第一个 token，为其建立一个 ast 节点，此时的 ast 节点的属性以及子节点都不完整。

为了补充这些缺少的部分，接下来移动到下一个单词，生成 token，并且将其转换成子节点，添加进现有的 ast 中，然后重复这个 移动 & 生成 的递归的过程。

*   让我们来看看`const a = 1`是怎么变成一颗 ast 的。
    
*     
    

1.  读取 const，生成一个 VariableDeclaration 节点
    
2.  读取 a，新建 VariableDeclarator 节点
    
3.  读取 =
    
4.  读取 1，新建 NumericLiteral 节点
    
5.  将 NumericLiteral 赋值给 VariableDeclarator 的 init 属性
    
6.  将 VariableDeclarator 赋值给 VariableDeclaration 的 declaration 属性
    

前端编译
====

随着前端技术和理念的不断进步，涌现了各种新奇的代码以及带来了新的项目组织方式。

但在这些新技术中，有许多代码不能在浏览器中直接执行，比如 typescript、jsx 等，这种情况下我们的项目就需要通过编译、打包，将其转换为可以直接在浏览器中执行的代码。

以 webpack 为例，打包工具作用就是基于代码的 import、export、require 构建依赖树，将其做成一个或多个 bundles。它解决的是模块化的问题，但它自带的能力只能支持 javascript 以及 json 文件，而平时我们遇到的 ts、jsx、vue 文件，则需要先经过编译工具的编译。例如如果我们想用 webpack 对含有 ts 文件的项目进行打包，进行如下配置。

```
// webpack.config.jsconst path = require('path');module.exports = {  // ...  module: {    rules: [{       test: /.ts$/,      use: 'babel-loader',      options: {            presets: [              '@babel/typescript'            ]      }    }],  },};
```

配置的含义则是：当 webpack 解析到. ts 文件时，先使用 babel-loader 进行转换，再进行打包。

操作 ast 进行代码编译
=============

编译工具
----

常见的编译工具有这几种

1.  babel：目前最主流的编译工具，使用 javascript 编写。
    
2.  esbuild：使用 Go 语言开发的打包工具（也包含了编译功能）, 被 Vite 用于开发环境的编译。
    
3.  swc：使用 rust 编写的编译工具。
    

在对外提供直接操作 ast 的能力上，babel 和 swc 使用的是访问者模式，插件编写上有较多的共通之处，最大的区别就是语言不同。esbuild 没有对外提供直接操作 ast 的能力，但是可以通过接入其他的编译工具达到操作 ast 的效果。

编译过程
----

代码编译的过程分为三步，接（parse）、化（transform）、发（generate）

parse 的过程则是上文中提到的，将代码从字符串转化为树状结构的 ast。

transform 则是对 ast 节点进行遍历，遍历的过程中对 ast 进行修改。

generate 则是将被修改过的 ast，重新生成为代码。

编译插件
----

一般我们提起 babel，就会想到是用来将新标准的 js 转化为兼容性更高的旧标准 js。

如果 babel 默认的编译效果不能满足我们的需求，那我们要如何插手编译过程，将 ast 修改成我们想要的 ast 呢。此时就需要用到 babel plugin，也就是 babel 插件。

就如同上文中的配置

```
const path = require('path');module.exports = {  module: {    rules: [{       test: /.ts$/,      use: 'babel-loader',      options: {            presets: [              // presets也就是已经配置好的插件集合,也就是“预设”              '@babel/preset-typescript'            ]      }    }],  },};
```

除了以上将 typescript 转换为 javscript 的插件外，日常中我们还会用到许多其他的插件 / 预设，例如

1.  `@babel/react` 转换 react 文件
    
2.  `react-refresh/babel` 热刷新
    
3.  `babel-plugin-react-css-modules` css 模块化 避免样式污染
    
4.  `istanbul` 收集代码覆盖率
    
5.  ......
    

### Hello plugin！

babel 在将代码转换为 ast 后，会对 ast 进行遍历，在遍历时，会应用插件所提供的访问者对相应的 ast 节点进行访问，以达到修改 ast 的目的。

我们在编写插件时，首先我们需要知道我们想要访问的 ast 节点对应的类型是什么。假如我们要对函数类型的 ast 节点进行修改，先来看看这一段代码经过 babel 的转换以后会生成什么样的 ast。

https://astexplorer.net/

```
function a() {};const b = function() {}const c = () => {};
```

ast：（删除部分结构后）

```
[    {        "type": "FunctionDeclaration",        "id": {            "type": "Identifier",                       "name": "a"        }    },    {        "type": "VariableDeclaration",        "declarations": [            {                "type": "VariableDeclarator",                "id": {                    "type": "Identifier",                    "name": "b"                },                "init": {                    "type": "FunctionExpression",                }            }        ],        "kind": "const"    },    {        "type": "VariableDeclaration",        "declarations": [            {                "type": "VariableDeclarator",                "id": {                    "type": "Identifier",                    "name": "c"                },                "init": {                    "type": "ArrowFunctionExpression",                }            }        ],        "kind": "const"    }]
```

新建 my-plugin.js，在其中编写如下代码，对外暴露出访问者，babel 在遍历到对应节点时会调用相应的访问者。

```
// my-plugin.jsmodule.exports = () => ({    visitor: {        // 对一种ast节点进行访问        FunctionDeclaration: {            enter: enterFunction,            // 在babel对ast进行深度优先遍历时，            // 我们有enter和exit两次机会访问同一个ast节点。             exit: exitFunction        },        // 对多种ast节点进行访问        "FunctionDeclaration|FunctionExpression|ArrowFunctionExpression": {            enter: enterFunction        }        // 使用“别名”进行访问        Function: enterFunction    }})function enterFunction() {    console.log('hello plugin!')};function exitFunction() {};
```

接入插件

```
// .babelrc{    "plugins": [        './my-plugin.js'    ]}
```

### 实践

接下来我们来通过编写一个完整的 babel 插件来看看如何对 ast 进行修改：打印出函数的执行时间

代码：

```
async function a() {    function b() {        for (let i = 0; i < 10000000; i += Math.random()) {}    }    b();    await new Promise(resolve => {        setTimeout(resolve, 1000);    })}
```

运行效果：

```
b cost: 219 // 函数b耗时219毫秒
anonymous cost: 0 // promise中的匿名函数耗时0毫秒
a cost: 1222 // 函数a耗时1222毫秒
```

实现思路：在函数的第一行，插入一个 ast 节点，定义一个变量记录刚开始执行函数的时间。在函数的的最后一行，以及 return 时，打印出当前时间与开始时间的差。

#### 新增 & 插入节点

除了手写一个 ast 节点以外我们可以通过两种 babel 为我们提供的辅助工具生成 ast 节点

1.  @babel/types
    

一个工具集，可以用来新建、校验节点等。

在这里我们需要新建一个 `var fnName_start_time = Date.now()`的 ast 节点。

```
import * as t from 'babel-types';function functionEnter(path, state) {    const node = path.node;    const fnName = node.name || node.id?.name || 'anonymous';    // 新建一个变量声明    const ast = t.variableDeclarator(        // 变量名        t.identifier(`${fnName}_start_time`),        // Date.now()        t.callExpression(            t.memberExpression(                t.identifier('Date'),                t.identifier('now')            ),            // 参数为空            []        )    );}
```

2.  @babel/template
    

通过模板的方式，可以直接将代码转换成 ast，也可以替换掉模版中的节点，方便快捷。

```
import template from "babel-template";const varName = `${fnName}_start_time`;// 直接通过代码生成const ast = template(`const ${varName} = Date.now()`)();// 或者const ast = template('const fnName = Date.now()')({    fnName: t.identifier(varName)})
```

在生成了我们想要的 ast 节点后，我们可以将其插入到我们现有的节点中。

```
function functionEnter(path, state) {    const node = path.node;    const fnName = node.name || node.id?.name || 'anonymous';    const varName = `${fnName}_start_time`;    const start = template(`const ${varName} = Date.now()`)();    const end = template(        `console.log('${fnName} cost:', Date.now() - ${varName})`    )();        if (!node.body) {        return;    }    // 插入到容器中，函数的第一行添加const fnName_start_time = Date.now()    path.get('body').unshiftContainer('body', start);    path.get('body').pushContainer('body', end);}module.exports = () => ({    visitor: {        Function: enterFunction    }})
```

#### 主动遍历 & 停止遍历 & 状态

虽然我们在函数的第一行和最后一行添加了相应的代码，但是还是不能完整的实现我们需要的功能——如果函数在执行最后一行之前进行了 return，则不能打印出耗时数据。

找出该函数进行 return 的 ast 节点，在 return 之前，先把函数的耗时打印出来。

```
function a() {    if (Math.random() > 0.5) {        // 需要逮出来的return        return 'a';    }    function b() {        // 需要跳过的return        return 'b';    }}
```

通过主动遍历的方法，我们把 returnStatement 的访问者放到 Function 的访问者中。

当我们进行主动遍历时，需要跳过子节点中的函数节点的遍历，因为我们的目的只是在遍历函数 a 节点时，访问其 return，而不想去修改子函数节点的 return。

```
function functionEnter(path, state) {    // 主动遍历    path.traverse({        // 访问遍历到子函数，则跳过子函数及其的子节点遍历        Function(innerPath) {            innerPath.skip();        },        // 访问类型为ReturnStatement的子节点        ReturnStatement: returnEnter        // 传递状态    }, { fnName })}function returnEnter(path, state) {    // 读取状态    const { fnName } = state;    // 代码为resutn xxx; 新建 const fnName_result = xxx 的节点    const resultVar = t.identifier(`${fnName}_result`);    const returnResult = template(`const RESULT_VAR = RESULT`)({        RESULT_VAR: resultVar,        RESULT: path.node.argument || t.identifier('undefined')    })    // 插入兄弟节点    path.insertBefore(returnResult);        // 修改return xxx为    // return (console.log('耗时'), fnName_result)    const varName = `${fnName}_start_time`;    const end = template(        `console.log('${fnName} cost:', Date.now() - ${varName})`    )();    const ast = t.sequenceExpression([        end.expression,        resultVar    ]);    path.node.argument = ast;}
```

#### 最终效果

```
// 原代码function a() {    function b() {        for (let i = 0; i < 10000000; i += Math.random()) {}        function c() {            for (let i = 0; i < 10000000; i += Math.random()) {}        }        return c();    }    b();    for (let i = 0; i < 10000000; i += Math.random()) {}}
```

```
// 经过babel编译的代码function a() {  var a_start_time = Date.now();  function b() {    var b_start_time = Date.now();    for (var i = 0; i < 10000000; i += Math.random()) {}    function c() {      var c_start_time = Date.now();      for (var _i = 0; _i < 10000000; _i += Math.random()) {}      console.log('c cost:', Date.now() - c_start_time);    }    var b_result = c();    return console.log('b cost:', Date.now() - b_start_time), b_result;    console.log('b cost:', Date.now() - b_start_time);  }  b();  for (var i = 0; i < 10000000; i += Math.random()) {}  console.log('a cost:', Date.now() - a_start_time);}// 运行后控制台打印结果c cost: 290b cost: 603a cost: 895
```

❤️ 谢谢支持
-------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 分享、点赞、收藏 三连哦~。

欢迎关注公众号 **ELab 团队** 收货大厂一手好文章~

> *   字节跳动校 / 社招内推码: **WVYAHHE**
>     
> *   投递链接: **https://job.toutiao.com/s/h8jyJ65**
>     
> 
> 可凭内推码投递 **字节教育 - 成人与创新前端团队** 相关岗位哦~

- END -