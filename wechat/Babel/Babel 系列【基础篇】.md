> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GcozDbrrFmVqt0fjtjqn8g)

前言
--

**巴比伦塔** （希伯来语：מִגְדַּל בָּבֶל，**_Migdal Bāḇēl_**）也译作**巴贝尔塔**、**巴别塔**，或意译为**通天塔 **），本是犹太教《塔纳赫 · 创世纪篇》中的一个故事，说的是人类产生不同语言的起源。在这个故事中，一群只说一种语言的人在 “大洪水” 之后从东方来到了示拿地区，并决定在这修建一座城市和一座 “能够通天的” 高塔；上帝见此情形就把他们的语言打乱，让他们再也不能明白对方的意思，并把他们分散到了世界各地。摘自 Wikipedia - Tower of Babel[1]

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsjiaGU0DQdK3OY0EpMMkPMCsa3oSe8W1Ega2ybz5COtjaHPZq0B1frvA/640?wx_fmt=png)

Babel 是什么
---------

Babel 官网是这样定义的：Babel is a JavaScript compiler。Babel 是一套解决方案，主要用来把 ECMAScript 2015+ 的代码转化为浏览器或者其它环境支持的代码。它主要可以做以下事情：

*   语法转换
    
*   为目标环境提供 Polyfill 解决方案
    
*   源码转换
    
*   其它可参考 Videos about Babel[2]
    

Babel 的历史
---------

2014 年，高中生 Sebastian McKenzie 首次提交了 babel 的代码，当时的名字叫 6to5。从名字就能看出来，它主要的作用就是将 ES6 转化为 ES5。于是很多人评价，6to5 只是 ES6 得到支持前的一个过渡方案，但作者非常不同意这个观点，他认为 6to5 不光会按照标准逐步完善，依然具备非常大的潜力反过来影响并推进标准的制定。正因为如此，后来的 6to5 团队觉得 '6to5' 这个名字并没有准确的传达这个项目的目标。加上 ES6 正式发布后，被命名为 ES2015，对于 6to5 来说更偏离了它的初衷。于是 2015 年 2 月 15 号，6to5 正式更名为 Babel。（把 ES6 送上天的通天塔）

Babel 的使用
---------

了解完 babel 是什么后，我们接下来看如何使用它。根据官网中提供的用法，我们初始化一个基础项目并安装依赖。

```
npm install --save-dev @babel/core @babel/cli @babel/preset-env
```

*   目录结构如下
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qs0FFYzWYQWyGg12huEAslg4QTblqzynS42Wl2unBYQNywqnzeFiaM8RQ/640?wx_fmt=png)
    
*   package.json 中新增 babel 命令
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsUkZic30OFOxqFJyNkqYicgYzj4ZGBgRCn60WI8dUnhnjbibLo4yFrBrvA/640?wx_fmt=png)
    
*   babel.config.js 配置
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsyQh3DHPIHPqZfPEMI1epcK1fCt2asNoVic5wfjy0py7rmu33asjgwuQ/640?wx_fmt=png)
    

1.  配置中的 debug 用于打印 babel 命令执行的日志；
    
2.  presets 主要是配置用来编译的预置，plugins 主要是配置完成编译的插件，具体的含义后面会讲。
    

*   src/index.js
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsqxINT65apFibNT6B0FkqdSYZFvotZF1QCibff3EWpBSnib9sxibfcvgicqw/640?wx_fmt=png)
    

接下来，在命令行执行 npm run babel 命令，看看转换效果。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsHOicKuTlfzbGOeRJOHibXiay6rEwc233iaWDAuWuxzuDjeqlCG9icTPTWuQ/640?wx_fmt=png)

从上图中可以看到，const 被转换成了 var，箭头函数转换成了普通 function，同时打印出来如下日志：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsVTOZ4HBk4JwbMo2vib8QH97jp0GquDBJwrGG5mNspUuuNVZzr7Ip2lw/640?wx_fmt=png)

Babel 原理
--------

了解完成 babel 的基础使用后，我们来分析 babel 的工作原理。babel 作为一个编译器，主要做的工作内容如下：

1.  解析源码，生成 AST
    
2.  对 AST 进行转换，生成新的 AST
    
3.  根据新的 AST 生成目标代码
    

整体流程图下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsWml6xALfjb6QnGL2NicU0NWBEjJvNYVK5DQAfZxjCHa2EfzGzvAbIbA/640?wx_fmt=png)

根据上图中的流程，我们依次进行分析。

### Parse（解析）阶段

一般来说，Parse 阶段可以细分为两个阶段：词法分析（Lexical Analysis, LA）和语法分析（Syntactic Analysis, SA）。

*   词法分析
    

词法分析是对代码进行分词，把代码分割成被称为 Tokens 的东西。Tokens 是一个数组，由一些代码的碎片组成，比如数字、标点符号、运算符号等等，例如这样：

```
// 代码const a = 1;// Tokens https://esprima.org/demo/parse.html#[    {        "type": "Keyword",        "value": "const"    },    {        "type": "Identifier",        "value": "a"    },    {        "type": "Punctuator",        "value": "="    },    {        "type": "Numeric",        "value": "1"    },    {        "type": "Punctuator",        "value": ";"    }]
```

*   语法分析
    

词法分析之后，代码就已经变成了一个 Tokens 数组，现在需要通过语法分析把 Tokens 转化为 AST。例如上面的代码转成的 AST 结构如下（在线查看 [3]）：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsCLheC8iab3cDq2rIIVzPCd49GNQ5zNsXFHYFVrn7kPt9tPGH0lL9Bxw/640?wx_fmt=png)

在 babel 中，以上工作是通过 @babel/parser 来完成的，它基于 ESTree 规范 [4]，但也存在一些差异。从上图中，我们可以看到最终生成的 AST 结构中有很多相似的元素，它们都有一个 type 属性（可以通过官网提供的说明文档来查看所有类型），这样的元素被称作节点。一个节点通常含有若干属性，可以用于描述 AST 的节点信息。

### Transform（转换）阶段

转换阶段，Babel 对 AST 进行深度优先遍历，对于 AST 上的每一个分支 Babel 都会先向下遍历走到尽头，然后再向上遍历退出刚遍历过的节点，然后寻找下一个分支。在遍历的过程中，可以增删改这些节点，从而转换成实际需要的 AST。

以上是 babel 转换阶段操作节点的思路，具体实现是：babel 维护一个称作 Visitor 的对象，这个对象定义了用于 AST 中获取具体节点的方法，如果匹配上一个 type，就会调用 visitor 里的方法，实现如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsMz1TRN0wltibiaMwhiaaRv4GFJONotmlJkgEwhSnTjfgPe25oFnSSQDuA/640?wx_fmt=png)

一个简单的 Visitor 对象如下：

```
const visitor = {    FunctionDeclaration(path, state) {        console.log('我是函数声明');    }};
```

在遍历 AST 的过程中，如果当前节点的类型匹配 visitor 中的类型，就会执行对应的方法。上面提到，遍历 AST 节点的时候会遍历两次（进入和退出），因此，上面的 Vistor 也可以这样写：

```
const visitor = {    FunctionDeclaration: {        enter(path, state) {            console.log('enter');        },        exit(path, state) {            console.log('exit');        }    }};
```

> Visitor 中的每个函数接收 2 个参数：path 和 state。
> 
> path：表示两个节点之间连接的对象，对象包含：当前节点、父级点、作用域等元信息，以及增删改查 AST 的 api。
> 
> state：遍历过程中 AST 节点之间传递数据的方式，插件可以从 state 中拿到 opts，也就是插件的配置项。

例如使用上面 visitor 遍历如下代码时：

```
// 源码function test() {  console.log(1)}
```

输出如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsquWMNsG6CXULyryUOkCQj004mwN61qiaV8c7mibnnfua6aygTngEXNGg/640?wx_fmt=png)

### Generator（生成）阶段

经过上面两个阶段，需要转译的代码已经经过转换，生成新的 AST ，最后一个阶段理所应当就是根据这个 AST 来输出代码。在生成阶段，会遍历新的 AST，递归将节点数据打印成字符串，会对不同的 AST 节点做不同的处理，在这个过程中把抽象语法树中省略掉的一些分隔符重新加回来。比如 while 语句 WhileStatement 就是先打印 while，然后打印一个空格和 '('，然后打印 node.test 属性的节点，然后打印 ')'，之后打印 block 部分。

```
export function WhileStatement(this: Printer, node: t.WhileStatement) {  this.word("while");  this.space();  this.token("(");  this.print(node.test, node);  this.token(")");  this.printBlock(node);}
```

@babel/generator 的 src/generators[5] 下定义了每一种 AST 节点的打印方式，通过上述处理，就可以生成最终的目标代码了。

Plugin 插件
---------

上面介绍了 Babel 的原理，知道了 babel 是如何进行代码解析和转换，以及生成最终的代码。那么转换阶段，babel 是怎么知道要进行哪些转换操作呢？答案是通过 plugin，babel 为每一个新的语法提供了一个插件，在 babel 的配置中配置了哪些插件，就会把插件对应的语法给转化掉。插件被命名为 @babel/plugin-xxx 的格式。

### 插件的使用：

```
// babel配置文件"plugins": [  "pluginA",  ['pluginB'],  ["babel-plugin-b", { options }] // 如果需要传参就用数组格式，第二个元素为参数。]
```

### 常用插件介绍

*   @babel/plugin-transform-react-jsx：将 jsx 转换成 react 函数调用
    

```
// 源码const profile = (  <div>    <img src="avatar.png" class />    <h3>{[user.firstName, user.lastName].join(" ")}</h3>  </div>);
```

```
// 出码const profile = React.createElement(  "div",  null,  React.createElement("img", { src: "avatar.png", className: "profile" }),  React.createElement("h3", null, [user.firstName, user.lastName].join(" ")));
```

*   @babel/plugin-transform-arrow-functions：将箭头函数转成普通函数
    

```
// 源码var a = () => {};
```

```
// 出码var a = function() {};
```

*   @babel/plugin-transform-destructuring：解构转换
    

```
// 源码let { x, y } = obj;let [a, b, ...rest] = arr;
```

```
// 出码function _toArray(arr) { ... }let _obj = obj,  x = _obj.x,  y = _obj.y;let _arr = arr,  _arr2 = _toArray(_arr),  a = _arr2[0],  b = _arr2[1],  rest = _arr2.slice(2);
```

更多 babel 插件 [6] 请参考官网。

### 插件的形式：

babel 插件支持两种形式，一是函数，二是对象。

*   函数形式
    

```
export default funciton(babel, options, dirname) {    return {        // 继承某个插件        inherits: parentPlugin,        // 修改参数        manipulateOptions(options, parserOptions) {            options.xxx = '';        },        // 遍历前调用        pre(file) {          this.cache = new Map();        },        // 指定 traverse 时调用的函数        visitor: {          FunctionDeclaration(path, state) {            this.cache.set(path.node.value, 1);          }        },        // 遍历后调用        post(file) {          console.log(this.cache);        }    }}
```

*   对象形式
    

```
export default plugin = {    pre(state) {      this.cache = new Map();    },    visitor: {      FunctionDeclaration(path, state) {        this.cache.set(path.node.value, 1);      }    },    post(state) {      console.log(this.cache);    }};
```

> 执行顺序：从前往后

Preset 预设
---------

上面介绍了插件的使用和具体实现，在实际的项目中，转换时会涉及到非常多的插件，如果我们依次去添加对应的插件，效率会非常低，而且记住插件的名字和其对应功能本身就是一件很难的事。我们能不能把通用的插件封装成一个集合，用的时候只需要安装一个插件即可，这就是 preset。一句话总结：preset 就是对 babel 配置的一层封装。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsDmYanfkorPZqQY6umYDbvicYmAcJPX4f2VrBLdpTA8AkG7GuLDagPbg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsxPzMcQZB90ic11eDDMeI1rdWloVXQMtrkrccTrUJbetqBY6ia9P6dW9w/640?wx_fmt=png)

### 预设的使用

Preset 预设使用详情 [7] 可参考官网。

```
// babel配置文件{  "presets": [    "presetA", // 字符串    ["presetA"], // 数组    [        "presetA",  // 如果有参数，数组第二项为对象        {        target: {            chrome: '58' // 目标环境是chrome版本 >= 58            }        }    ]  ]}
```

> 执行顺序：从后往前；
> 
> 插件 & 预设执行顺序：先执行插件，后执行预设。

Polyfill
--------

让我们再次回到开始的源码转换

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsHOicKuTlfzbGOeRJOHibXiay6rEwc233iaWDAuWuxzuDjeqlCG9icTPTWuQ/640?wx_fmt=png)

从转换结果来看，const 和 var 都进行了转换，但 startsWith 方法却保留原样，这是怎么回事呢？原因是在 babel 中，把 ES6 的标准分为 syntax 和 built-in 两种类型。syntax 就是语法，像 const、=> 这些默认被 Babel 转译的就是 syntax 类型。而对于那些可以通过改写覆盖的语法就认为是 built-in，像 startsWith 和 includes 这些都属于 built-in。而 Babel 默认只转译 syntax 类型的，对于 built-in 类型的就需要通过 @babel/polyfill 来完成转译。@babel/polyfill 实现的原理也非常简单，就是覆盖那些 ES6 新增的 built-in。示意如下：

```
Object.defineProperty(Array.prototype, 'startsWith',function(){...})
```

> 由于 Babel 在 7.4.0 版本中宣布废弃 @babel/polyfill ，而是通过 core-js 替代，所以本文直接使用 core-js 来讲解 polyfill 的用法。

### core-js 使用

*   安装：`npm install --save core-js`
    
*   配置 corejs
    

```
// babel.config.jsconst presets = [  [    '@babel/env',    {      debug: true,+      useBuiltIns: 'usage', // usage | entry | false+      corejs: 3, // 2 ｜ 3    }  ]]
```

*   再次执行 npm run babel
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qs6QUlspUZ0U1cFqniaZgFG7hlFqKCaFWTH8NTlT4uhNiapAGaCNQyicAXQ/640?wx_fmt=png)

可以看到，代码顶部多了 require("core-js/modules/es.string.starts-with.js")，通过阅读 require 近来的源码 [8]，它内部实现了字符串的 startsWith 方法，这样就完成了 built-in 类型的转换。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsicFlSlu2xgyuhS6mudvJ70ycaib5icicnFkccA85vYMVREpibzNaz3gJrdQ/640?wx_fmt=png)

手写 babel 插件
-----------

通过上面的介绍，我们对插件的形式和实现有了基本的了解，接下来我们将通过手写一个简单的插件来切身感受下 babel 的魅力。

在我们的日常开发中，经常会在 async 函数中使用 tryCatch 来封装代码，例如：

```
async function getName() {    try {        // code        const name = await api.getName();    } catch(error) {        // do somethine    }}
```

上述每个这样的函数我们都需要封装一次，我们能否把封装的工作交给 babel 来处理呢？答案是肯定的，让我们一起看看怎么实现？

1.  我们先给插件起个名字：babel-plugin-try-catch
    
2.  实现功能
    

```
const template = require('@babel/template'); // 使用它来将代码批量生成节点function babelPlugintryCatch({ types: t }) {  return {    visitor: {      FunctionDeclaration: {        enter(path) {          /**           * 1. 获取当前函数体           * 2. 如果是async函数，则创建tryCatch并将原函数内容放到try体内           * 3. 替换原函数          */          // 1. 获取当前函数节点信息          const { params, generator, async, id, body } =path.node;          // 如果是async，则执行替换          if (async) {            // 生成 console.log(error) 的节点数据            const catchHandler = template.statement('console.log(error)')();            // 创建trycatch节点，并把原函数体内的代码放到try{}中，把刚刚生成的catchHandler放到catch体内            const tryStatement = t.tryStatement(body, t.catchClause(t.identifier('error'), t.BlockStatement([catchHandler])));            // 创建一个新的函数节点并替换原节点            path.replaceWith(t.functionDeclaration(id, params, t.BlockStatement([tryStatement]), generator, async))            // 跳过当前节点，否则会重新进入当前节点            path.skip();          }        }      }    }  }}module.exports = babelPlugintryCatch
```

3.  添加配置
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsqNUfhoTbgOor9sv6emp2EbJaSIQNAOLnn1icZVLrzcrHEaclZY3MZWg/640?wx_fmt=png)

4.  执行命令 npm run babel，看转换结果
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8SbGegNsbySelnqI8H12qsWkz5fShUdz2AWHpQM3InyzWufGicSWohqOPvoTYfX3ryHp1Ios6BicDA/640?wx_fmt=png)

从结果来看，我们已经实现了基本的转换需求，但还不是一个完善的插件，例如如果已经有 trycatch 了就不需要再转换了，又例如可以在 catch 体内做一些错误上报等。其它功能留给大家去探索～

总结
--

babel 是一款 javascript 编译器，它的作用是将 js 编译成目标环境可运行的代码，编译原理是先解析源代码生成 AST，对 AST 进行操作并生成新的 AST，最后根据新的 AST 生成最终的代码。在转换过程中，遍历到不同的节点类型时，会调用在插件中定义的访问者函数来处理，而单个插件的管理成本太大，因此，babel 在插件的基础上通过抽象一层 preset 来批量引入 plugin 并进行配置。（没有什么问题是不能通过增加一个抽象层解决的，如果有，再增加一层）最后我们一起手动实现了一个简单的 babel 插件，对 babel 的转换原理有了更加深入的理解。

![](https://mmbiz.qpic.cn/mmbiz_gif/Ljib4So7yuWgdsiawsibl2cqTm0PmXstpmMxMicIDIxQ2FMWwdj8BPCO5nMyWYdZZANdGStH09PtSBPXmjTdibMCbgQ/640?wx_fmt=gif)

点击上方关注 · 追更不迷路 

![](https://mmbiz.qpic.cn/mmbiz_gif/Ljib4So7yuWgdsiawsibl2cqTm0PmXstpmMxMicIDIxQ2FMWwdj8BPCO5nMyWYdZZANdGStH09PtSBPXmjTdibMCbgQ/640?wx_fmt=gif)

### 参考资料

[1]

Wikipedia - Tower of Babel: _https://en.wikipedia.org/wiki/Tower_of_Babel_

[2]

Videos about Babel: _https://babeljs.io/videos.html_

[3]

在线转换 AST: _https://astexplorer.net/_

[4]

ESTree 规范: _https://github.com/estree/estree_

[5]

@babel/generator 的 src/generators: _https://github.com/babel/babel/tree/main/packages/babel-generator/src/generators_

[6]

更多 babel 插件: _https://babeljs.io/docs/en/babel-plugin-transform-react-jsx_

[7]

Preset 预设使用详情: _https://babeljs.io/docs/en/presets_

[8]

require 近来的源码: _https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.starts-with.js_

[9]

What is Babel?: _https://babeljs.io/docs/en/_

[10]

blockstatement: _https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#blockstatement_

[11]

Babel 插件手册 - 路径: _https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-paths_

[12]

es.string.starts-with: _https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.string.starts-with.js_

[13]

Babel 设计，组成: _https://zhuanlan.zhihu.com/p/57883838_

[14]

Babel：把 ES6 送上天的通天塔: _https://zhuanlan.zhihu.com/p/129089156_

[15]

2015 in review: _https://medium.com/@sebmck/2015-in-review-51ac7035e272_

[16]

在线转换 Tokens: _https://esprima.org/demo/parse.html#_