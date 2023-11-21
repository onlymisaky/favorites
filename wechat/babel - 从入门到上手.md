> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/LlQRx5SPmFgnTDO8VunGnw)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZgcRXpgF9AM33Zn5zmicKkIzANS5tX6E5h9drZTmXtWbEfRiaibGiau5y0A/640?wx_fmt=png)

本文将引导你一步一步的学会 babel，在学习的过程将着重介绍以下几点：

*   babel 转译的过程
    
*   AST 介绍
    
*   babel 常用的 api
    
*   @babel/preset-env
    
*   @babel/plugin-transform-runtime
    

### 1.babel 的作用

**官方定义**：Babel 是一个工具链，主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。

### 2.babel 转译的三个阶段

1.  源码 parse 生成 AST（parse）
    
2.  遍历 AST 并进行各种增删改 (核心)（transform）
    
3.  转换完 AST 之后再打印成目标代码字符串（generate）![](https://mmbiz.qpic.cn/mmbiz_jpg/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZ81IQAU8UjtDMFzWKSERDqq7nawyHdpAPf9tSzrJaVW6hiaJT25b4TlA/640?wx_fmt=jpeg)
    

### 3. AST 如何生成

在学习 AST 和 babel 转换时，可以借助下面两个网站辅助查看代码转换成 AST 之后的结果。

https://esprima.org/demo/parse.html

https://astexplorer.net/

整个解析过程主要分为以下两个步骤：**词法分析**和**语法分析**

#### 3.1 词法分析

词法分析，这一步主要是将字符流 (char stream) 转换为令牌流(token stream)，又称为分词。其中拆分出来的各个部分又被称为 **词法单元** (**Token)**。

可以这么理解，词法分析就是把你的代码从 string 类型转换成了数组，数组的元素就是代码里的单词 (词法单元)， **并且标记了每个单词的类型。**

比如：

```
const a = 1
```

生成的 tokenList

```
[    { type: 'Keyword', value: 'const' },    { type: 'Identifier', value: 'a' },    { type: 'Punctuator',value: '=' },    { type: 'Numeric', value: '1' },    { type: 'Punctuator', value: ';' },];
```

词法分析结果，缺少一些比较关键的信息：需要进一步进行 **语法分析** 。

#### 3.2 语法分析

语法分析会将词法分析出来的 **词法单元** 转化成有语法含义的 **抽象语法树结构 (AST)，**同时，验证语法，语法如果有错，会抛出语法错误。

这里截取 AST 树上的 program 的 body 部分 (采用 @babel/parser 进行转化)

```
"body": [    {       "type": "VariableDeclaration",       "start": 0,       "end": 11,       "loc": {},       "declarations": [        {           "type": "VariableDeclarator",           "start": 6,           "end": 11,           "loc": {},           "id": {             "type": "Identifier",             "start": 6,             "end": 7,             "loc": {},             "name": "a"          },           "init": {             "type": "NumericLiteral",             "start": 10,             "end": 11,             "loc": {},             "extra": {},             "value": 1          }        }      ],       "kind": "const"    }  ]
```

可以看到，经过语法分析阶段转换后生成的 AST，通过树形的层属关系建立了语法单元之间的联系。

### 4. AST 节点

转换后的 AST 是由很多 AST 节点组成，主要有以下几种类型：**字面量（Literal）、标志符（Identifer）、语句（statement）、声明（****Declaration）****、表达式（Expression）、注释（Comment）、程序（Program）、文件（File）**。

每种 AST 节点都有自己的属性，但是它们也有一些公共属性：

*   **结点类型（type）**：AST 节点的类型。
    
*   **位置信息（loc）**：包括三个属性 start、 end、 loc。其中 start 和 end 代表该节点对应的源码字符串的开始和结束下标，不区分行列。loc 属性是一个对象，有 line 和 column 属性分别记录开始和结束行列号。
    
*   **注释（comments）**：主要分为三种 leadingComments、innerComments、trailingComments ，分别表示开始的注释、中间的注释、结尾的注释。
    

### 5. babel 常用的 api

babel 中有五个常用的 api：

1.  针对 parse 阶段有 @babel/parser，功能是把源码转成 AST
    
2.  针对 transform 阶段有 @babel/traverse，用于增删改查 AST
    
3.  针对 generate 阶段有 @babel/generate，会把 AST 打印为目标代码字符串，同时生成 sourcemap
    
4.  在 transform 阶段，当需要判断和生成结点时，需要 @babel/types，
    
5.  当需要批量创建 AST 的时候可以使用 @babel/template 来简化 AST 创建逻辑。
    

我们可以通过这些常用的 api 来自己实现一个 plugin，对代码进行转换。接下来就介绍一下几个常见的 api。

#### 5.1 @babel/parser

> babelParser.parse(code, [options])--- 返回的 AST 根节点是 File 节点 babelParser.parseExpression(code, [options])--- 返回的 AST 根结点是 Expression

第一个参数是源代码，第二个参数是 options，其中最常用的就是 plugins、sourceType 这两个：

*   sourceType: 指示分析代码的模式，主要有三个值：script、module、unambiguous。
    
*   plugins：指定要使用插件数组。
    

5.2 @babel/traverse（核心）  

> **function traverse(ast, opts)**
> 
> ast：经过 parse 之后的生成的 ast
> 
> opts ：指定 visitor 函数 -- 用于遍历节点时调用（核心）

方法的第二参数中的 visitor 是我们自定义插件时经常用到的地方，你可以通过两种方式来定义这个参数

第一种是以方法的形式声明 visitor

```
traverse(ast, {   BlockStatement(path, state) {       console.log('BlockStatement>>>>>>')  }});
```

第二种是以对象的形式声明 visitor

```
traverse(ast, {   BlockStatement: {       enter(path, state) {           console.log('enter>>>', path, state)      },       exit(path, state) {           console.log('exit>>>', path, state)      }  }});
```

每一个 visitor 函数会接收两个参数 **path** 和 **state**，path 用来操作节点、遍历节点和判断节点，而 state 则是遍历过程中在不同节点之间传递数据的机制， 我们也可以通过 state 存储一些遍历过程中的共享数据。

#### 5.3. @babel/generator

转换完 AST 之后，就要打印目标代码字符串，这里通过 @babel/generator 来实现，其方法常用的参数有两个：

*   要打印的 AST
    
*   options-- 指定打印的一些细节，比如 comments 指定是否包含注释
    

### 6. babel 的内置功能

上面我们介绍了几个用于实现插件的 api，而 babel 本身为了实现对语法特性的转换以及对 api 的支持 (polyfill)，也内置了很多的**插件 (plugin)** 和**预设 (preset)**。

**其插件主要分为三类：**

*   syntax plugin：只是在 parse 阶段使用，可以让 parser 能够正确的解析对应的语法成 AST
    
*   transform plugin：是对 AST 的转换，针对 es20xx 中的语言特性、typescript、jsx 等的转换都是在这部分实现的
    
*   proposal plugin：未加入语言标准的特性的 AST 转换插件
    

**那么**预设是**什么呢？**预设其实就是对于插件的一层封装，通过配置预设，使用者可以不用关心具体引用了什么插件，从而减轻使用者的负担。

而根据上面不同类型的插件又产生了如下几种预设：  

*   专门根据 es 标准处理语言特性的预设 -- babel-preset-es20xx
    
*   对其 react、ts 兼容的预设 -- preset-react  preset-typescript
    

我们目前最常使用的便是 @babel/preset-env 这个预设，下文将会通过一个例子来介绍它的使用。

### 7. 案例 1-- 自定义插件  

#### 需求

如果有一行代码

```
const a = 1
```

我需要通过 babel 自定义插件来给标识符增加类型定义，让它成为符合 ts 规范的语句，结果：const a: number = 1。

#### 实现

通过 babel 处理代码，其实就是在对 AST 节点进行处理。

我们先搭起一个架子

```
// 源代码const sourceCode = ` const a = 1`;// 调用parse，生成astconst ast = parser.parse(sourceCode, {})// 调用traverse执行自定义的逻辑，处理ast节点traverse(ast, {})// 生成目标代码const { code } = generate(ast, {});console.log('result after deal with》〉》〉》', code)
```

在引入对应的包后，我们的架子主要分为三部分，我们首先需要知道这句话转换完之后的 AST 节点类型

```
"sourceType": "module",    "interpreter": null,    "body": [      {        "type": "VariableDeclaration",        "start": 0,        "end": 11,        "loc": {...},        "declarations": [          {            "type": "VariableDeclarator",            "start": 6,            "end": 11,            "loc": {...},            "id": {...},            "init": {...}          }        ],        "kind": "const"      }    ]
```

上图可以看出这句话的类型是 VariableDeclaration，所以我们要写一个可以遍历 VariableDeclaration 节点的 visitor。

```
// 调用traverse执行自定义的逻辑，处理ast节点traverse(ast, {     VariableDeclaration(path, state) {       console.log('VariableDeclaration>>>>>>', path.node.type)    }})
```

继续观察结构，该节点下面有 declarations 属性，其包括所有的声明，declarations[0] 就是我们想要的节点。

```
traverse(ast, {    VariableDeclaration(path, state) {       console.log('VariableDeclaration>>>>>>', path.node.type)       const tarNode = path.node.declarations[0]       console.log('tarNode>>>>>>', tarNode)    }})
```

每一个声明节点类型为 VariableDeclarator，该节点下有两个重要的节点，id（变量名的标识符）和 init（变量的值）。这里我们需要找到变量名为 a 的标识符，且他的值类型为 number（对应的节点类型为 NumericLiteral）。

```
"declarations": [        {          "type": "VariableDeclarator",          "start": 6,          "end": 11,          "loc": {...},          "id": {            "type": "Identifier",            "start": 6,            "end": 7,            "loc": {...},            "name": "a"          },          "init": {            "type": "NumericLiteral",            "start": 10,            "end": 11,            "loc": {...},            "extra": {...},            "value": 1          }        }      ]
```

这时候就需要我们使用一个新的包 **@babel/types** 来判断类型。判断类型时只需调用该包中对应的判断方法即可，方法名都是以 isXxx 或者 assertXxx 来命名的 (Xxx 代表节点类型)，需要传入对应的节点才能判断该节点的类型。

```
traverse(ast, {  VariableDeclaration(path, state) {    const tarNode = path.node.declarations[0]    if(types.isIdentifier(tarNode.id) && types.isNumericLiteral(tarNode.init))            {       console.log('inside>>>>>>')     }  }})
```

锁定了节点后，我们需要更改 id 节点的 name 内容, 就可以实现需求了。

```
traverse(ast, {  VariableDeclaration(path, state) {  const tarNode = path.node.declarations[0]    if(types.isIdentifier(tarNode.id)&&types.isNumericLiteral(tarNode.init))           {       console.log('inside>>>>>>')       tarNode.id.name = `${tarNode.id.name}: number`    }  }})
```

### 8. 案例 2-- 工程化使用

#### 8.1 准备工作

**@babel/core** 是 babel 的核心库，**@babel/cli** 是 babel 的命令行工具。如果要使用 babel，首先要安装 **@babel/core** 和 **@babel/cli**。

源代码为：

```
const fn = () => 1 ;
```

位置放在 src 下的 test.js 文件。

#### 8.2 通过配置文件使用

根据官方文档的说法，目前有两类配置文件：项目范围配置 和 文件相对配置。

##### 1. 项目范围配置（全局配置） -- babel.config.json

##### 2. 文件相对配置（局部配置） -- .babelrc.json、package.json

**区别**：第一种配置作用整个项目，如果 babel 决定应用这个配置文件，则一定会应用到所有文件的转换。而第二种配置文件只能应用到 “当前目录” 下的文件中。

> babel 在决定一个 js 文件应用哪些配置文件时, 会执行如下策略: 如果这个 js 文件在当前项目内，则会递归向上搜索最近的一个 .babelrc 文件 (直到遇到 package.json)，将其与全局配置合并。

这里我们只需使用 babel.config.json 的形式进行配置

配置文件：

```
{     "presets": [           [                 "@babel/preset-env"           ]      ]}
```

再在 package.json 里配置一下执行的脚本

```
"dev": "./node_modules/.bin/babel src --out-dir lib"
```

#### 8.4 常用的包

#### 我们在工程里常用包主要有两个：

*   #### @babel/preset-env
    
*   #### @babel/plugin-transform-runtime
    

#### 8.4.1 @babel/preset-env  

@babel/preset-env 是一个智能的预设，它允许你使用最新的 JavaScript，而不需要微管理你的目标环境需要哪些语法转换，根据 babel 官网上的描述，它是通过 browsersList、compat-table 相结合来实现智能的引入语法转换工具。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZQyUOaovcVAAjNicxeLzpkjSrNYyml7oUV72U3g8sVLtxUg9AOPwrkxQ/640?wx_fmt=png)

compat-data 形如如下，其注明了什么特性，在什么环境下支持，再结合通过 browsersList 查询出的环境版本号，就可以确定需要引入哪些 plugin 或者 preset。

```
"es6.array.fill": {   "chrome": "45",   "opera": "32",   "edge": "12",   "firefox": "31",   "safari": "7.1",   "node": "4",   "ios": "8",   "samsung": "5",   "rhino": "1.7.13",   "electron": "0.31"},
```

@babel/preset-env 有三个常用的关键可选项:

*   targets
    
*   useBuiltIns
    
*   corejs
    

#### targets

描述项目支持的环境 / 目标环境，支持 browserslist 查询写法

```
{  "targets": "> 0.25%, not dead" }  // 全球使用人数大于0.25%且还没有废弃的版本
```

支持最小环境版本构成的对象

```
{  "targets": { "chrome": "58",  "ie": "11" } }
```

如果没配置 targets， Babel 会假设你的目标是最老的浏览器 @babel/preset-env 将转换所有 ES2015-ES2020 代码为 ES5 兼容

#### useBuiltIns

可以使用三个值："usage" 、"entry" 、 false，默认使用 false

**false**

当使用 false 时：**在不主动 import 的情况下不使用 preset-env 来处理 polyfills**

**entry**

babel 将会根据浏览器目标环境 (targets) 的配置，**引入全部浏览器暂未支持的 polyfill 模块**，只要我们在**打包配置入口** 或者 **文件入口**写入 import "core-js" 这样的引入， babel 就会根据当前所配置的目标浏览器 (browserslist) 来引入所需要的 polyfill 。

**usage**

设置 useBuiltIns 的值为 usage 时，babel 将会根据我们的代码使用情况自动注入 polyfill。

#### 8.4.2 **entry 与 **usage 的区别****：

在上文所示例子的基础上，我们修改一下源代码

```
function test() {    new Promise()}test()const arr = [ 1 , 2 , 3 , 4 ].map(item => item * item)console.log(arr)
```

我们没有配置 useBuiltIns 时，preset-env 只对代码的语法进行了处理，对于新增的 api 并没有引入对应的 polyfill。下图是转换结果：

```
"use strict";function test() {    new Promise();}test();var arr = [1, 2, 3, 4].map(function (item) {    return item * item;});console.log(arr);
```

当我们使用 useBuiltIns：“entry” 时 (入口文件需要引入 core-js)，由于我们没有指定 targets，结果当然是引入了一堆包。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZbC5XJh0snzj7ehQ81icHwgzBIcla6A68kLLUVAhIhibvXGlX8zevxXdQ/640?wx_fmt=png)

加入 "targets": "> 0.25%, not dead" 后，很明显少了很多的引入（如下图所示），这也印证了上面所说的， 当 useBuiltIns 的值为 entry 时，@babel/preset-env 会按照你所设置的 targets 来引入所需的 polyfill。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZMR7NiavhujQxcQ7onU7hHhIFl3BUb43u4bhhE9YmwQqGqFlx2XJk1Vw/640?wx_fmt=png)

当我们使用 useBuiltIns：“usage” 时，这时就无须在入口文件引入 core-js 了。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZdlHVT6YriaEb8X84mv2Ce5KxiaiaAFeNS5PKYk3fmlaroHlic5NKXyaoMQ/640?wx_fmt=png)

可以看出引入的包非常精准，需要哪些就引入哪些 polyfill。当然你也可以配置 targets，这样的话 targets 会辅助 preset-env 引入，从而进一步控制引入包数量。

#### corejs

corejs 是 JavaScript 的模块化标准库，其中包括各种 ECMAScript 特性的 polyfill。上面我们转换后的代码中引入的 polyfill 都是来源于 corejs。它现有 2 和 3 两个版本，目前 2 版本已经进入功能冻结阶段了，新的功能会添加到 3 版本中。

> 具体的变化可以查看 corejs 的 github 的说明文档：core-js@3, babel and a look into the future

这个选项只有在和 **useBuiltIns: "usage"** 或 **useBuiltIns:"entry"** 一起使用时才有效果，该属性默认为 "2.0"。其作用是进一步约束引入的 polyfill 的数量。

#### 8.4.3 @babel/plugin-transform-runtime

虽然经过了 preset-env 的转换，代码已经可以实现不同版本的特性兼容了。但是会产生两个问题：

1.preset-env 转换后引入的 polyfill，是通过 require 进行引入的，这就意味着，对于 Array.from 等静态方法，以及 includes 等实例方法，会直接在 global 上添加。这就导致引入的 polyfill 方法可能和其他库发生冲突。

2.babel 转换代码的时候，可能会使用一些帮助函数来协助转换，比如 class

```
class a {}<br style="box-sizing: border-box;">
```

转换之后：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZ5nc7bv20RBibjvTnKxQgEFEP1XyXkKoMY8G4NUtg2lHH0d14OKqD95g/640?wx_fmt=png)

这里就使用了_classCallCheck 这样的辅助函数，如果有多个文件声明 class 的话，就会重复创建这样的方法。

@babel/plugin-transform-runtime 这个插件的作用就是为了处理这样的问题。该插件也有一个 corejs 的配置，这里配置的是 runtime-corejs 的版本，目前有 2、3 两个版本。

```
{ "presets": [  [     "@babel/preset-env"  ]], "plugins": [  [     "@babel/plugin-transform-runtime",    {       "corejs": "3.0"    }  ]]}
```

转换结果：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibBMe3NvP7HK8Z9N65rUfVZbBEZ3rUvicee6YdBkc2aiazjK25qCmOweBBpFLRmciapbconMphlaas7A/640?wx_fmt=png)

> 这里由于 babel 是先执行 plugins 后执行 presets 的内容，@babel/plugin-transform-runtime 插件先于 preset-env 将 polyfill 引入了，并且做了一层包装，所以就无须再通过 @babel/preset-env 来引入 polyfill 了。

可以看到，转换之后的_classCallCheck 的方法定义全部改为了从 runtime-corejs 中引入，对于新特性的 polyfill 也不再挂载在全局了。这样的方法适合定义类库时使用，可以防止变量污染全局。

### 结束语

相信通过这么一篇文章，大家基本都了解了 babel 的基础原理，以及它是如何实现对代码的转换的，并可以自己实现简单的一个 babel 的插件。当然，本文中所述之内容只是 babel 全部内容的十之一二，只是作一个学习 babel 的引路石，如果有较强烈的需求，还是要常翻阅官方文档。最后希望大家可以将 bebel 学的更透彻。

参考文章：

1.  https://juejin.cn/post/6844903797571977223
    
2.  https://juejin.cn/post/6844904013033373704
    
3.  https://www.cnblogs.com/zhishaofei/p/13896056.html
    
4.  https://zhuanlan.zhihu.com/p/367724302
    
5.  https://www.babeljs.cn/
    
6.  https://juejin.cn/book/6946117847848321055