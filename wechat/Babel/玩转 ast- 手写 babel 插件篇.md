> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_j2lcoNK7XIsAJbmddFMtA)

AST

### 抽象语法树是什么？

*   抽象语法树（Abstract Syntax Tree，AST）是源代码语法结构的一种抽象表示
    
*   它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构
    
*   每个包含 type 属性的数据结构，都是一个 AST 节点；
    

**以下是普通函数 function ast(){}, 转换为 ast 后的格式：**

### ![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLdJ14YefocszkCNBnSCciap0dHqyKd9YEZY9VUkvicEEtlsuHSoiatyvkmql5rCibNyJrveug3pR3Xg/640?wx_fmt=png)

### 抽象语法树用途有哪些？

*   代码语法的检查、代码风格的检查、代码的格式化、代码的高亮、代码错误提示、代码自动补全、实现一套代码适配多端运行等等
    
*   优化变更代码，改变代码结构使达到想要的结构
    

webpack、Lint 等这些工具的原理都是通过 JavaScript Parser 把源代码转化为一颗抽象语法树（AST），通过操纵这颗树，我们可以精准的定位到声明语句、赋值语句、运算语句等等，实现对代码的分析、优化、变更等操作。

JavaScript 解析器
--------------

那什么是 JavaScript 解析器呢？  
JavaScript 解析器的作用，把 JavaScript 源码转化为抽象语法树。  
浏览器会把 js 源码通过解析器转换为 ast，再进一步转换为字节码或者直接生成机器码，进行渲染和执行。  
一般来说，每个 js 引擎都有自己的抽象语法树格式，Chrome 的 v8 引擎， firfox 的 Spider Monkey 引擎等。

JavaScript 解析器通常可以包含四个组成部分。

*   词法分析器（Lexical Analyser）
    
*   语法解析器（Syntax Parser）
    
*   字节码生成器（Bytecode generator）
    
*   字节码解释器（Bytecode interpreter）
    

### 词法分析器（Lexical Analyser）

首先词法分析器会扫描（scanning）代码，将一行行源代码，通过 switch case 把源码？“/ 为一个个小单元，jS 代码有哪些语法单元呢？大致有以下这些：

*   **空白**：JS 中连续的空格、换行、缩进等这些如果不在字符串里，就没有任何实际逻辑意义，所以把连续的空白符直接组合在一起作为一个语法单元。
    
*   **注释**：行注释或块注释，虽然对于人类来说有意义，但是对于计算机来说知道这是个 “注释” 就行了，并不关心内容，所以直接作为一个不可再拆的语法单元
    
*   **字符串**：对于机器而言，字符串的内容只是会参与计算或展示，里面再细分的内容也是没必要分析的
    
*   **数字**：JS 语言里就有 16、10、8 进制以及科学表达法等数字表达语法，数字也是个具备含义的最小单元
    
*   **标识符**：没有被引号扩起来的连续字符，可包含字母、_、$、及数字（数字不能作为开头）。标识符可能代表一个变量，或者 true、false 这种内置常量、也可能是 if、return、function 这种关键字，是哪种语义，分词阶段并不在乎，只要正确切分就好了。
    
*   **运算符**：+、-、*、/、>、< 等等
    
*   **括号**：(...)可能表示运算优先级、也可能表示函数调用，分词阶段并不关注是哪种语义，只把 “(” 或“)”当做一种基本语法单元
    

就是一个字符一个字符地遍历，然后通过 switch case 分情况讨论，整个实现方法就是顺序遍历和大量的条件判断。以 @babel/parser 源码为例：

```
getTokenFromCode(code) {  switch (code) {    case 46:      this.readToken_dot();      return;    case 40:      ++this.state.pos;      this.finishToken(10);      return;    case 41:      ++this.state.pos;      this.finishToken(11);      return;    case 59:      ++this.state.pos;      this.finishToken(13);      return;      // 此处省略...    case 92:      this.readWord();      return;    default:      if (isIdentifierStart(code)) {        this.readWord(code);        return;      }  }}readToken_dot() {  // charCodeAt一个一个向后移  const next = this.input.charCodeAt(this.state.pos + 1);  if (next >= 48 && next <= 57) {    this.readNumber(true);    return;  }  if (next === 46 && this.input.charCodeAt(this.state.pos + 2) === 46) {    this.state.pos += 3;    this.finishToken(21);  } else {    ++this.state.pos;    this.finishToken(16);  }}
```

### 语法解析器

将上一步生成的数组，根据语法规则，转为抽象语法树（Abstract Syntax Tree，简称 AST）。  
以  const a = 1  为例，词法分析中获得了 const 这样一个 token，并判断这是一个关键字，根据这个 token 的类型，判断这是一个变量声明语句。以 @babel/parser 源码为例，执行 parseVarStatement 方法。

```
parseVarStatement(node, kind, allowMissingInitializer = false) {    const {      isAmbientContext    } = this.state;    const declaration = super.parseVarStatement(node, kind, allowMissingInitializer || isAmbientContext);    if (!isAmbientContext) return declaration;    for (const {      id,      init    } of declaration.declarations) {      if (!init) continue;      if (kind !== "const" || !!id.typeAnnotation) {        this.raise(TSErrors.InitializerNotAllowedInAmbientContext, {          at: init        });      } else if (init.type !== "StringLiteral" && init.type !== "BooleanLiteral" && init.type !== "NumericLiteral" && init.type !== "BigIntLiteral" && (init.type !== "TemplateLiteral" || init.expressions.length > 0) && !isPossiblyLiteralEnum(init)) {        this.raise(TSErrors.ConstInitiailizerMustBeStringOrNumericLiteralOrLiteralEnumReference, {          at: init        });      }    }    return declaration;  }
```

经过这一步的处理，最终  const a = 1  会变成如下 ast 结构：  
![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLdJ14YefocszkCNBnSCciarbicMIj5LUjurWz63RqWv2hCUyMiaUNyhvsQjOxibxzQocVBTy4rPUdkg/640?wx_fmt=png)

### 字节码生成器

字节码生成器的作用，是将抽象语法树转为 JavaScript 引擎可以执行的二进制代码。目前，还没有统一的 JavaScript 字节码的格式标准，每种 JavaScript 引擎都有自己的字节码格式。最简单的做法，就是将语义单位翻成对应的二进制命令。

### 字节码解释器

字节码解释器的作用是读取并执行字节码。

### 几种常见的解析器

#### Esprima

这是**第一个用 JavaScript 编写的符合 EsTree 规范的 JavaScript 的解析器**，后续多个编译器都是受它的影响

#### acorn

acorn 和 Esprima 很类似，输出的 ast 都是符合 EsTree 规范的，目前 webpack 的 AST 解析器用的就是 acorn

#### @babel/parser(babylon)

babel 官方的解析器，最初 fork 于 acorn，后来完全走向了自己的道路，从 babylon 改名之后，其构建的插件体系非常强大

#### uglify-js

**用于混淆和压缩代码，**因为一些原因，uglify-js 自己 [内部实现了一套 AST 规范，也正是因为它的 AST 是自创的，不是标准的 ESTree，es6 以后新语法的 AST，都不支持，所以没有办法压缩最新的 es6 的代码，如果需要压缩，可以用类似 babel 这样的工具先转换成 ES5。

#### esbuild

esbuild 是用 go 编写的下一代 web 打包工具，它拥有目前最快的打包记录和压缩记录，snowpack 和 vite 的也是使用它来做打包工具，为了追求卓越的性能，目前没有将 AST 进行暴露，也无法修改 AST，无法用作解析对应的 JavaScript。

babel
-----

下面先介绍下 babel 相关工具库，以及一些 API，了解完这些基础概念后，我们会利用这些工具操作 AST 来编写一个 babel 插件。

*   @babel/parser 可以把源码转换成 AST
    
*   @babel/traverse 用于对 AST 的遍历，维护了整棵树的状态，并且负责替换、移除和添加节点
    
*   @babel/generate 可以把 AST 生成源码，同时生成 sourcemap
    
*   @babel/types 用于 AST 节点的 Lodash 式工具库, 它包含了构造、验证以及变换 AST 节点的方法，对编写处理 AST 逻辑非常有用
    
*   @babel/template 可以简化 AST 的创建逻辑
    
*   @babel/code-frame 可以打印代码位置
    
*   @babel/core Babel 的编译器，核心 API 都在这里面，比如常见的 transform、parse, 并实现了插件功能
    
*   babylon Babel 的解析器，以前叫 babel parser, 是基于 acorn 扩展而来，扩展了很多语法, 可以支持 es2020、jsx、typescript 等语法
    
*   babel-types-api ：https://babeljs.io/docs/en/babel-types.html
    
*   Babel 插件手册：https://github.com/brigand/babel-plugin-handbook/blob/master/translations/zh-Hans/README.md#asts
    

#### Visitor

*   访问者模式 Visitor 对于某个对象或者一组对象，不同的访问者，产生的结果不同，执行操作也不同
    
*   Visitor 的对象定义了用于 AST 中获取具体节点的方法
    
*   Visitor 上挂载以节点 type 命名的方法，当遍历 AST 的时候，如果匹配上 type，就会执行对应的方法
    

#### path

*   **node** 当前 AST 节点
    
*   **parent** 父 AST 节点
    
*   **parentPath** 父 AST 节点的路径
    
*   **scope** 作用域
    
*   **get(key)** 获取某个属性的 path
    
*   **set(key, node)** 设置某个属性
    
*   **is 类型 (opts)** 判断当前节点是否是某个类型
    
*   **find(callback)** 从当前节点一直向上找到根节点 (包括自己)
    
*   **findParent(callback)** 从当前节点一直向上找到根节点 (不包括自己)
    
*   **insertBefore(nodes)** 在之前插入节点
    
*   **insertAfter(nodes)** 在之后插入节点
    
*   **replaceWith(replacement)** 用某个节点替换当前节点
    
*   **replaceWithMultiple(nodes)** 用多个节点替换当前节点
    
*   **replaceWithSourceString(replacement)** 把源代码转成 AST 节点再替换当前节点
    
*   **remove()** 删除当前节点
    
*   **traverse(visitor, state)** 遍历当前节点的子节点, 第 1 个参数是节点，第 2 个参数是用来传递数据的状态
    
*   **skip()** 跳过当前节点子节点的遍历
    
*   **stop()** 结束所有的遍历
    
*   **getSibling(key)**  获取某个下标的兄弟节点
    
*   **getNextSibling()**  获取下一个兄弟节点
    
*   **getPrevSibling()** 获取上一个兄弟节点
    
*   **getAllPrevSiblings()**  获取之前的所有兄弟节点
    
*   **getAllNextSiblings()**  获取之后的所有兄弟节点
    

#### scope

• **scope.bindings** 当前作用域内声明所有变量  
• **scope.path** 生成作用域的节点对应的路径  
• **scope.references** 所有的变量引用的路径  
• **getAllBindings()** 获取从当前作用域一直到根作用域的集合  
• **getBinding(name)** 从当前作用域到根使用域查找变量  
• **getOwnBinding(name)** 在当前作用域查找变量  
• **parentHasBinding(name, noGlobals)** 从当前父作用域到根使用域查找变量  
• **removeBinding(name)** 删除变量  
• **hasBinding(name, noGlobals)** 判断是否包含变量  
• **moveBindingTo(name, scope)** 把当前作用域的变量移动到其它作用域中  
• **generateUid(name)** 生成作用域中的唯一变量名, 如果变量名被占用就在前面加下划线  
• **scope.dump()** 打印自底向上的 作用域与变量信息到控制台

### 实现 eslint 插件

上面这些概念在我们编写 babel 插件时会用到，接下来我们来实现一个 eslint 移除 console.log() 插件吧！  
先看下 **console.log('a')** 的 AST 长什么样子？  
![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLdJ14YefocszkCNBnSCciaxSWLVEquVmyURuciaP476aBV8ajBqJ2iaSecdz6qG9V6NicdH15kPQQlw/640?wx_fmt=png)  
可以看到 **console.log('a')** 是一个 type 为 “ExpressionStatement” 的节点，所以我们只需要遍历 AST，当遇到 type=ExpressionStatement 的节点删除即可！来一起实现吧～

1.  引入基础包
    

```
var fs = require("fs");//babel核心模块,里面包含transform方法用来转换源代码。const core = require('@babel/core');//用来生成或者判断节点的AST语法树的节点let types = require("@babel/types");
```

  
2. 遍历 AST 节点，babel 插件的语法都是固定的，里面包含 visitor，我们只需在 visitor 里面处理 ExpressionStatement 即可，

```
//no-console 禁用 consoleconst eslintPlugin = ({ fix }) => {  // babel插件的语法都是固定的，里面包含visitor    return {      pre(file) {        file.set('errors', []);      },      // 访问器      visitor: {        CallExpression(path, state) {          const errors = state.file.get('errors');          const { node } = path          if (node.callee.object && node.callee.object.name === 'console') {            errors.push(path.buildCodeFrameError(`代码中不能出现console语句`, Error));            if (fix) {              path.parentPath.remove();            }          }        }      },      post(file) {        // console.log(...file.get('errors'));      }    }  };
```

3.  完整实现：
    

```
var fs = require("fs");//babel核心模块,里面包含transform方法用来转换源代码。const core = require('@babel/core');//用来生成或者判断节点的AST语法树的节点let types = require("@babel/types");//no-console 禁用 consoleconst eslintPlugin = ({ fix }) => {  // babel插件的语法都是固定的，里面包含visitor    return {      pre(file) {        file.set('errors', []);      },      // 访问器      visitor: {        CallExpression(path, state) {          const errors = state.file.get('errors');          const { node } = path          if (node.callee.object && node.callee.object.name === 'console') {            errors.push(path.buildCodeFrameError(`代码中不能出现console语句`, Error));            if (fix) {              path.parentPath.remove();            }          }        }      },      post(file) {        // console.log(...file.get('errors'));      }    }  };core.transformFile("eslint/source.js",{    plugins: [eslintPlugin({ fix: false })]}, function(err, result) {    result; // => { code, map, ast }    console.log(result.code);  })
```

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)