> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-GIIs1VseDhojexI2HQ-tA)

> 转载自：yeyan1996
> 
> https://juejin.im/post/6844903886898069511

前言
==

在开发中，你是否会为了系统健壮性，亦或者是为了捕获异步的错误，而频繁的在 async 函数中写 try/catch 的逻辑？

```
async function func() {    try {        let res = await asyncFunc()    } catch (e) {      //......    }}
```

曾经我在《一个合格的中级前端工程师必须要掌握的 28 个 JavaScript 技巧》：https://juejin.im/post/6844903856489365518 中提到过一个优雅处理 async/await 的方法

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQBlNiaPHjibomiaIPKFyTsTMMfIgcQhE03xOWDz0Z4lp1Wszd1fHibtiaLFQ/640?wx_fmt=png)

这样我们就可以使用一个辅助函数包裹这个 async 函数实现错误捕获

```
async function func() {    let [err, res] = await errorCaptured(asyncFunc)    if (err) {        //... 错误捕获    }    //...}
```

但是这么做有一个缺陷就是每次使用的时候，都要引入 errorCaptured 这个辅助函数，有没有 “懒” 的方法呢？

答案肯定是有的，我在那篇博客后提出了一个新的思路，可以通过一个 webpack loader 来自动注入 try/catch 代码，最后的结果希望是这样的

```
// developmentasync function func() {   let res = await asyncFunc()    //...其他逻辑}// releaseasync function func() {    try {        let res = await asyncFunc()    } catch (e) {      //......    }    //...其他逻辑}
```

是不是很棒？在开发环境中不需要任何多余的代码，让 webpack 自动给生产环境的代码注入错误捕获的逻辑，接下来我们来逐步实现这个 loader

loader 原理
=========

在实现这个 webpack loader 之前，先简要介绍一下 loader 的原理，我们在 webpack 中定义的一个个 loader，本质上只是一个函数，在定义 loader 同时还会定义一个 test 属性，webpack 会遍历所有的模块名，当匹配 test 属性定义的正则时，会将这个模块作为 source 参数传入 loader 中执行

```
{    test: /\.vue$/,    use: "vue-loader",}
```

当匹配到 .vue 结尾的文件名时，会将文件作为 source 参数传给 vue-loader，use 属性后面可以是一个字符串也可以是一个路径，当是字符串时默认会视为 nodejs 模块去 node_modules 中找

而这些文件本质上其实就是字符串（图片，视频就是 Buffer 对象），以 vue-loader 为例，当 loader 接受到文件时，通过字符串匹配将其分为 3 份，模版字符串会 vue-loader 编译为 render 函数，script 部分会交给 babel-loader，style 部分会交给 css-loader，同时 loader 遵守单一原则，即一个 loader 只做一件事，这样可以灵活组合多个 loader，互不干扰

实现思路
====

因为 loader 可以读取匹配到的文件，经过处理变成期望的输出结果，所以我们可以自己实现一个 loader，接受 js 文件，当遇到 await 关键字时，给代码包裹一层 try/catch

那么如何能够准确给 await 及后面的表达式包裹 try/catch 呢？这里需要用到抽象语法树（AST）相关的知识

AST
===

> 抽象语法树是源代码 [1] 语法 [2] 结构的一种抽象表示。它以树状 [3] 的形式表现编程语言 [4] 的语法结构，树上的每个节点都表示源代码中的一种结构

通过 AST 可以实现很多非常有用的功能，例如将 ES6 以后的代码转为 ES5，eslint 的检查，代码美化，甚至 js 引擎都是依赖 AST 实现的，同时因为代码本质只是单纯的字符串，所以并不仅限于 js 之间的转换，scss，less 等 css 预处理器也是通过 AST 转为浏览器认识的 css 代码，我们来举个例子

```
let a = 1let b = a + 5
```

将其转换为抽象语法树后是这样的

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQyFtxesxiaKy8kqs5nMMsuZNhXBwnMkq7QvlPNjX4FwYY7y1C4H0biaTw/640?wx_fmt=png)

将字符串转为 AST 树需要经过词法分析和语法分析两步

词法分析将一个个代码片段转为 token （词法单元），去除空格注释，例如第一行会将 let，a，=，1 这 4 个转为 token，token 是一个对象，描述了代码片段在整个代码中的位置和记录当前值的一些信息

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQ6OnUcFBE69SnI9wGEf7QickyibIjMdNHkOutdbcicB04eUqtrWzORCp4g/640?wx_fmt=png)

语法分析会将 token 结合当前语言（JS）的语法转换成 Node（节点），同时 Node 包含一个 type 属性记录当前的类型，例如 let 在 JS 中代表着一个变量声明的关键字，所以它的 type 为 VariableDeclaration，而 a = 1 会作为 let 的声明描述，它的 type 为 VariableDeclarator，而声明描述是依赖于变量声明的，所以是一种上下的层级关系

另外可以发现并不是一个 token 对应一个 Node，等号左右必须都有值才能组成一个声明语句，否则会作出警告，这就是 eslint 的基本原理。最后所有的 Node 组合在一起就形成了 AST 语法树

**推荐一个很实用的 AST 查看工具，AST explorer，更直观的查看代码是如何转为抽象语法树**

回到代码的实现，我们只需要通过 AST 树找到 await 表达式，将 await 外面包裹一层 try/catch 的 Node 节点即可

```
async function func() {   await asyncFunc()}
```

对应 AST 树：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQCwkibIonaED6MS5sHDiauwujCdOtibHSynYgawNhSFiczwwjhrialb8X8Vg/640?wx_fmt=png)

```
async function func() {    try {        await asyncFunc()    } catch (e) {        console.log(e)    }}
```

对应 AST 树：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQy9CUMicTqs9iaWkTibAMSafmhyEqjQsKuW0wv8zGrGoUd305PK2aYGUsA/640?wx_fmt=png)

loader 开发
=========

有了具体的思路，接下来我们开始编写 loader，当我们的 loader 接收到 source 文件时，通过 `@babel/parser`  
这个包可以将文件转换为 AST 抽象语法树，那么如何找到对应的 await 表达式呢？

这就需要另外一个 babel 的包 `@babel/traverse`，通过 `@babel/traverse` 可以传入一个 AST 树和一些钩子函数，随后深度遍历传入的 AST 树，当遍历的节点和钩子函数的名字相同时，会执行对应的回调

```
const parser = require("@babel/parser")const traverse = require("@babel/traverse").defaultmodule.exports = function (source) {    let ast = parser.parse(source)    traverse(ast, {        AwaitExpression(path) {            //...         }    })    //...}
```

通过 `@babel/traverse` 我们能够轻松的找到 await 表达式对应的 Node 节点，接下来就是创建一个类型为 TryStatement 的 Node 节点，最后 await 放入其中。这里还需要依赖另外一个包 `@babel/types`，可以理解为 babel 版的 loadsh 库，它提供了很多和 AST 的 Node 节点相关的辅助函数，我们需要用到其中的 `tryStatement` 方法，即创建一个 TryStatement 的 Node 节点

```
const parser = require("@babel/parser")const traverse = require("@babel/traverse").defaultconst t = require("@babel/types")module.exports = function (source) {    let ast = parser.parse(source)    traverse(ast, {        AwaitExpression(path) {            let tryCatchAst = t.tryStatement(                //...            )            //...        }    })}
```

`tryStatement` 接受 3 个参数，第一个是 try 子句，第二个是 catch 子句，第三个是 finally 子句，一个完整的 try/catch 语句对应的 Node 节点看起来像这样

```
const parser = require("@babel/parser")const traverse = require("@babel/traverse").defaultconst t = require("@babel/types")const parser = require("@babel/parser")const traverse = require("@babel/traverse").defaultconst t = require("@babel/types")module.exports = function (source) {    let ast = parser.parse(source)    traverse(ast, {        AwaitExpression(path) {            let tryCatchAst = t.tryStatement(                // try 子句（必需项）                t.blockStatement([                    t.expressionStatement(path.node)                ]),                // catch 子句                t.catchClause(                    //...                )            )            path.replaceWithMultiple([                tryCatchAst            ])        }    })      //...}
```

使用 `blockStatement` ，`expressionStatement` 方法创建一个块级作用域和承载 await 表达式的 Node 节点，`@babel/traverse` 会给每个钩子函数传入一个 path 参数，包含了当前遍历的一些信息，例如当前节点，上个遍历的 path 对象和对应的节点，最重要的是里面有一些可以**操作 Node 节点的方法**，我们需要使用到 `replaceWithMultiple` 这个方法来将当前的 Node 节点替换为 try/catch 语句的 Node 节点

另外我们要考虑到 await 表达式可能是是作为一个声明语句

```
let res = await asyncFunc()
```

也有可能是一个赋值语句

```
res = await asyncFunc()
```

还有可能只是一个单纯的表达式

```
await asyncFunc()
```

这 3 种情况对应的 AST 也是不一样的，所以我们需要对其分别处理，`@bable/types` 提供了丰富的判断函数，在 AwaitExpression 钩子函数中，我们只需要判断上级节点是哪种类型的 Node 节点即可，另外也可以通过 AST explorer 来查看最终需要生成的 AST 树的结构

```
const parser = require("@babel/parser")const traverse = require("@babel/traverse").defaultconst t = require("@babel/types")module.exports = function (source) {    let ast = parser.parse(source)    traverse(ast, {        AwaitExpression(path) {            if (t.isVariableDeclarator(path.parent)) { // 变量声明                let variableDeclarationPath = path.parentPath.parentPath                let tryCatchAst = t.tryStatement(                    t.blockStatement([                        variableDeclarationPath.node // Ast                    ]),                    t.catchClause(                        //...                    )                )                variableDeclarationPath.replaceWithMultiple([                    tryCatchAst                ])            } else if (t.isAssignmentExpression(path.parent)) { // 赋值表达式                let expressionStatementPath = path.parentPath.parentPath                let tryCatchAst = t.tryStatement(                    t.blockStatement([                        expressionStatementPath.node                    ]),                    t.catchClause(                        //...                    )                )                expressionStatementPath.replaceWithMultiple([                    tryCatchAst                ])            } else { // await 表达式                let tryCatchAst = t.tryStatement(                    t.blockStatement([                        t.expressionStatement(path.node)                    ]),                    t.catchClause(                        //...                    )                )                path.replaceWithMultiple([                    tryCatchAst                ])            }        }    })      //...}
```

在拿到替换后的 AST 树后，使用 `@babel/core` 包中的 `transformFromAstSync` 方法将 AST 树重新转为对应的代码字符串返回即可

```
const parser = require("@babel/parser")const traverse = require("@babel/traverse").defaultconst t = require("@babel/types")const core = require("@babel/core")module.exports = function (source) {    let ast = parser.parse(source)    traverse(ast, {        AwaitExpression(path) {              // 同上        }    })    return core.transformFromAstSync(ast).code}
```

在这基础上还暴露了一些 loader 配置项以提高易用性，例如如果 await 语句已经被 try/catch 包裹则不会再次注入，其原理也是基于 AST，利用 path 参数的 `findParent` 方法向上遍历所有父节点，判断是否被 try/catch 的 Node 包裹

```
traverse(ast, {    AwaitExpression(path) {        if (path.findParent((path) => t.isTryStatement(path.node))) return        // 处理逻辑    }})
```

另外 catch 子句中的代码片段也支持自定义，这样使得所有错误都使用统一逻辑处理，原理是将用户配置的代码片段转为 AST，在 TryStatement 节点被创建的时候作为参数传入其 catch 节点

进一步改进
=====

经过评论区的交流，我将默认给每个 await 语句添加一个 try/catch，修改为给整个 async 函数包裹 try/catch，原理是先找到 await 语句，然后递归向上遍历

当找到 async 函数时，创建一个 try/catch 的 Node 节点，并将原来 async 函数中的代码作为 Node 节点的子节点，并替换 async 函数的函数体

当遇到 try/catch，说明已经被 try/catch 包裹，取消注入，直接退出遍历，这样当用户有自定义的错误捕获代码就不会执行 loader 默认的捕获逻辑了

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQqEeTd2TAktekHmLyKJqHaeBr2HMzp4RDjbibdBhryZeFmSclAYfwTMA/640?wx_fmt=png)

对应 AST 树:

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQaaFz6vO9959hm07u3m1Wtv8ZiaT1LO7m2ico80ibGN9VrbhjTNNgpBX1g/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQvMN8F9c9YkVzF9czLOe4IpGhqZdNJztbVW5JpzYMAQRiaQ05bBOR5lw/640?wx_fmt=png)

对应 AST 树：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQv3e0luJOgG2OYTeY17I1GEQ3Tk7qEiaoFBia5BWuicJgib4dSia4lorF9gA/640?wx_fmt=png)

这只是最基本的 async 函数声明的 node 节点，另外还有函数表达式，箭头函数，作为对象的方法等这些表现形式，当满足其中一种情况就注入 try/catch 代码块

```
// 函数表达式const func = async function () {    await asyncFunc()}// 箭头函数const func2 = async () => {    await asyncFunc()}// 方法const vueComponent = {    methods: {        async func() {            await asyncFunc()        }    }}
```

总结
==

本文意在抛砖引玉，在日常开发过程中，可以结合自己的业务线，开发更加适合自己的 loader，例如技术栈是 jQuery 的老项目，可以匹配 `$.ajax` 的 Node 节点，统一注入错误处理逻辑，甚至可以自定义一些 ECMA 没有的新语法

抱歉，懂编译原理，真的是可以为所欲为

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQFzflSkWjwiacribxGf5tEhQ2sWlKQSib7Vh0icq778vH13Yec6kHxuECtUf7oDv4vf3SILqyiaseFHtw/640?wx_fmt=jpeg)

通过开发这个 loader 不仅可以学习到 webpack loader 是如何运行的，同时了解很多 AST 方面的知识，了解 babel 的原理，更多的方法可以查看

> babel 的官方文档 ：https://www.babeljs.cn/

或者

> babel 手书：https://github.com/jamiebuilds/babel-handbook

关于这个 loader 我已经发布到 npm 上，有兴趣的朋友可以直接调用 `npm install async-catch-loader \-D` 安装和研究，使用方法和一般 loader 一样，记得放在 babel-loader 后面，以便优先执行，将注入后的结果继续交给 babel 转义

```
{    test: /\.js$/,    use: [        "babel-loader?cacheDirectory=true",        'async-catch-loader'    ]}
```

更多细节和源代码可以查看 github，同时本文对您有收获的话，希望能点个 star，非常感谢~

> async-catch-loader : https://github.com/yeyan1996/async-catch-loader

### 参考资料

[1]

源代码: _https://zh.wikipedia.org/wiki/%E6%BA%90%E4%BB%A3%E7%A0%81_

[2]

语法学: _https://zh.wikipedia.org/wiki/%E8%AF%AD%E6%B3%95%E5%AD%A6_

[3]

树 (图论): _https://zh.wikipedia.org/wiki / 树_(图论)_

[4]

编程语言: _https://zh.wikipedia.org/wiki/%E7%BC%96%E7%A8%8B%E8%AF%AD%E8%A8%80_

最后  

=====

欢迎关注「前端瓶子君」，回复「交流」加入前端交流群！

回复「算法」，你可以每天学习一道大厂算法编程题（阿里、腾讯、百度、字节等等）或 leetcode，瓶子君都会在第二天解答哟！

另外，每周还有手写源码题，瓶子君也会解答哟！

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持