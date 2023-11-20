> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/IzYrDbMLplf4JOlpf8pLeQ)

Babel 是什么？我们为什么要了解它?
--------------------

### 1. 什么是 babel ?

> Babel 是一个 JavaScript 编译器。他把最新版的 javascript 编译成当下可以执行的版本，简言之，利用 babel 就可以让我们在当前的项目中随意的使用这些新最新的 es6，甚至 es7 的语法。

**为了能用可爱的 ES678910 写代码, 我们必须了解它!**

### 2. 可靠的工具来源于可怕的付出

August 27, 2018 by Henry Zhu

> 历经 2 年，4k 多次提交，50 多个预发布版本以及大量社区援助，我们很高兴地宣布发布 Babel 7。自 Babel 6 发布以来，已经过了将近三年的时间！发布期间有许多要进行的迁移工作，因此请在发布第一周与我们联系。Babel 7 是更新巨大的版本：我们使它编译更快，并创建了升级工具，支持 JS 配置，支持配置 "overrides"，更多 size/minification 的选项，支持 JSX 片段，支持 TypeScript，支持新提案等等！

**Babel 开发团队这么辛苦的为开源做贡献，为我们开发者提供更完美的工具, 我们为什么不去了解它呢?**

**(OS: 求求你别更啦. 老子学不动啦~)**

### 3. Babel 担任的角色

August 27, 2018 by Henry Zhu

> 我想再次介绍下过去几年中 Babel 在 JavaScript 生态系统中所担任的角色，以此展开本文的叙述。
> 
> 起初，JavaScript 与服务器语言不同，它没有办法保证对每个用户都有相同的支持，因为用户可能使用支持程度不同的浏览器（尤其是旧版本的 Internet Explorer）。如果开发人员想要使用新语法（例如 class A {}），旧浏览器上的用户只会因为 SyntaxError 的错误而出现屏幕空白的情况。
> 
> Babel 为开发人员提供了一种使用最新 JavaScript 语法的方式，同时使得他们不必担心如何进行向后兼容，如（class A {} 转译成 var A = function A() {}）。
> 
> 由于它能转译 JavaScript 代码，它还可用于实现新的功能：因此它已成为帮助 TC39（制订 JavaScript 语法的委员会）获得有关 JavaScript 提案意见反馈的桥梁，并让社区对语言的未来发展发表自己的见解。
> 
> Babel 如今已成为 JavaScript 开发的基础。GitHub 目前有超过 130 万个仓库依赖 Babel，每月 npm 下载量达 1700 万次，还拥有数百个用户，其中包括许多主要框架（React，Vue，Ember，Polymer）以及著名公司（Facebook，Netflix，Airbnb）等。它已成为 JavaScript 开发的基础，许多人甚至不知道它正在被使用。即使你自己没有使用它，但你的依赖很可能正在使用 Babel。

**即使你自己没有使用它，但你的依赖很可能正在使用 Babel。怕不怕 ? 了解不了解 ?**

Babel 的运行原理
-----------

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4scib6NWPyVH9X5PNZkeibV5GYPLvibWmAAULaXqPaAwAMXgW8tXxVUQNGLqv6sJ1C090btfAZLvYyGJQ/640?wx_fmt=png)

### 1. 解析

解析步骤接收代码并输出 AST。这个步骤分为两个阶段：词法分析（Lexical Analysis） 和 语法分析（Syntactic Analysis）。

#### 1. 词法分析

词法分析阶段把字符串形式的代码转换为 令牌（tokens） 流。

你可以把令牌看作是一个扁平的语法片段数组：

```
n * n;
```

```
[
  { type: { ... }, value: "n", start: 0, end: 1, loc: { ... } },
  { type: { ... }, value: "*", start: 2, end: 3, loc: { ... } },
  { type: { ... }, value: "n", start: 4, end: 5, loc: { ... } },
  ...
]
```

每一个 type 有一组属性来描述该令牌：

```
{
  type: {
    label: 'name',
    keyword: undefined,
    beforeExpr: false,
    startsExpr: true,
    rightAssociative: false,
    isLoop: false,
    isAssign: false,
    prefix: false,
    postfix: false,
    binop: null,
    updateContext: null
  },
  ...
}
```

和 AST 节点一样它们也有 start，end，loc 属性。

#### 2. 语法分析

语法分析阶段会把一个令牌流转换成 AST 的形式。这个阶段会使用令牌中的信息把它们转换成一个 AST 的表述结构，这样更易于后续的操作。

简单来说，解析阶段就是

```
code(字符串形式代码) -> tokens(令牌流) -> AST（抽象语法树）
```

Babel 使用 @babel/parser 解析代码，输入的 js 代码字符串根据 ESTree 规范生成 AST（抽象语法树）。Babel 使用的解析器是 babylon。

什么是 AST

### 2. 转换

转换步骤接收 AST 并对其进行遍历，在此过程中对节点进行添加、更新及移除等操作。这是 Babel 或是其他编译器中最复杂的过程。

Babel 提供了 @babel/traverse(遍历) 方法维护这 AST 树的整体状态，并且可完成对其的替换，删除或者增加节点，这个方法的参数为原始 AST 和自定义的转换规则，返回结果为转换后的 AST。

### 3. 生成

代码生成步骤把最终（经过一系列转换之后）的 AST 转换成字符串形式的代码，同时还会创建源码映射（source maps）。

代码生成其实很简单：深度优先遍历整个 AST，然后构建可以表示转换后代码的字符串。

Babel 使用 @babel/generator 将修改后的 AST 转换成代码，生成过程可以对是否压缩以及是否删除注释等进行配置，并且支持 sourceMap。

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4scib6NWPyVH9X5PNZkeibV5GYfp63cFbxLhTIr9GwKoBQ8icMn1NrickomzE5TROJcufic1Avnya7L3E9Q/640?wx_fmt=png)

实践前提
----

在这之前, 你必须对 Babel 有了基本的了解, 下面我们简单的了解下 babel 的一些东西, 以便于后面开发插件。

#### babel-core

babel-core 是 Babel 的核心包, 里面存放着诸多核心 API, 这里说下 transform。

transform : 用于字符串转码得到 AST 。

传送门

```
//安装
npm install  babel-core -D;
import babel from 'babel-core';
/*
 * @param {string} code 要转译的代码字符串
 * @param {object} options 可选，配置项
 * @return {object}
*/
babel.transform(code:String,options?: Object)
//返回一个对象(主要包括三个部分)：
{
    generated code, //生成码
    sources map, //源映射
    AST  //即abstract syntax tree，抽象语法树
}
```

#### babel-types

Babel Types 模块是一个用于 AST 节点的 Lodash 式工具库（译注：Lodash 是一个 JavaScript 函数工具库，提供了基于函数式编程风格的众多工具函数）， 它包含了构造、验证以及变换 AST 节点的方法。该工具库包含考虑周到的工具方法，对编写处理 AST 逻辑非常有用。传送门

```
npm install babel-types -D;  
import traverse from "babel-traverse";
import * as t from "babel-types";
traverse(ast, {
  enter(path) {
    if (t.isIdentifier(path.node, { name: "n" })) {
      path.node.name = "x";
    }
  }
});
```

#### JS CODE -> AST

查看代码对应的 AST 树结构

#### Visitors (访问者)

当我们谈及 “进入” 一个节点，实际上是说我们在访问它们， 之所以使用这样的术语是因为有一个访问者模式（visitor）的概念。

访问者是一个用于 AST 遍历的跨语言的模式。简单的说它们就是一个对象，定义了用于在一个树状结构中获取具体节点的方法。这么说有些抽象所以让我们来看一个例子。

```
const MyVisitor = {
  Identifier() {
    console.log("Called!");
  }
};
// 你也可以先创建一个访问者对象，并在稍后给它添加方法。
let visitor = {};
visitor.MemberExpression = function() {};
visitor.FunctionDeclaration = function() {}
```

> 注意：Identifier() { ...} 是 Identifier: { enter() { ... } } 的简写形式

这是一个简单的访问者，把它用于遍历中时，每当在树中遇见一个 Identifier 的时候会调用 Identifier() 方法。

#### Paths（路径）

AST 通常会有许多节点，那么节点直接如何相互关联呢？我们可以使用一个可操作和访问的巨大可变对象表示节点之间的关联关系，或者也可以用 Paths（路径）来简化这件事情。

Path 是表示两个节点之间连接的对象。

在某种意义上，路径是一个节点在树中的位置以及关于该节点各种信息的响应式 Reactive 表示。当你调用一个修改树的方法后，路径信息也会被更新。Babel 帮你管理这一切，从而使得节点操作简单，尽可能做到无状态。

**Paths in Visitors（存在于访问者中的路径）**

当你有一个 Identifier() 成员方法的访问者时，你实际上是在访问路径而非节点。通过这种方式，你操作的就是节点的响应式表示（译注：即路径）而非节点本身。

```
const MyVisitor = {
  Identifier(path) {
    console.log("Visiting: " + path.node.name);
  }
};
```

#### Babel 插件规则

Babel 的插件模块需要我们暴露一个 function,function 内返回 visitor 对象。

```
//函数参数接受整个Babel对象,这里将它进行解构获取babel-types模块,用来操作AST。
module.exports = function({types:t}){
    return {
        visitor:{
        }
    }
}
```

撸一个 Babel ... 插件 !!!
--------------------

```
做一个简单的ES6转ES3插件:
1. let,const 声明 -> var 声明  
2. 箭头函数 -> 普通函数
```

#### 文件结构

```
|-- index.js  程序入口
|-- plugin.js 插件实现
|-- before.js 转化前代码
|-- after.js  转化后代码
|-- package.json
```

首先, 我们先创建一个 package.json。

```
npm init
```

**package.json**

```
{
  "name": "babelplugin",
  "version": "1.0.0",
  "description": "create babel plugin",
  "main": "index.js",
  "scripts": {
    "babel": "node ./index.js"
  },
  "author": "webfansplz",
  "license": "MIT",
  "devDependencies": {
    "@babel/core": "^7.2.2"
  }
}
```

可以看到, 我们首先下载了 @babel/core 作为我们的开发依赖, 然后配置了 npm run babel 作为开发命令。

**index.js**

```
const { transform } = require('@babel/core');
const fs = require('fs');
//读取需要转换的js字符串
const before = fs.readFileSync('./before.js', 'utf8');
//使用babel-core的transform API 和插件进行字符串->AST转化。
const res = transform(`${before}`, {
  plugins: [require('./plugin')]
});
// 存在after.js删除
fs.existsSync('./after.js') && fs.unlinkSync('./after.js');
// 写入转化后的结果到after.js
fs.writeFileSync('./after.js', res.code, 'utf8');
```

我们首先来实现 功能 1. let,const 声明 -> var 声明

```
let code = 1;
```

我们通过传送门查看到上面代码对应的 AST 结构为

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4scib6NWPyVH9X5PNZkeibV5GYGgCfanVLgfjSicKUJaqrvibOLdHADjzUC4tccwaKMd1KxTZEgcNN9kbQ/640?wx_fmt=png)

我们可以看到这句声明语句位于 VariableDeclaration 节点, 我们接下来只要操作 VariableDeclaration 节点对应的 kind 属性就可以啦~

**before.js**

```
const a = 123;
let b = 456;
```

**plugin.js**

```
module.exports = function({ types: t }) {
  return {
   //访问者
    visitor: {
     //我们需要操作的访问者方法(节点)
      VariableDeclaration(path) {
        //该路径对应的节点
        const node = path.node;
        //判断节点kind属性是let或者const,转化为var
        ['let', 'const'].includes(node.kind) && (node.kind = 'var');
      }
    }
  };
};
```

ok~ 我们来看看效果!

```
npm run babel
```

**after.js**

```
var a = 123;
var b = 456;
```

没错, 就是这么吊!!! 功能 1 搞定, 接下来实现功能 2. 箭头函数 -> 普通函数 (this 指向暂不做处理~)

我们先来看看箭头函数对应的节点是什么?

```
let add = (x, y) => {
  return x + y;
};
```

我们通过传送门查看到上面代码对应的 AST 结构为

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4scib6NWPyVH9X5PNZkeibV5GYCWGoG6mILkxicHGzTX3HtksZsQqRfPmYVN2icb0PqqGEzP7ibujZt4RcQ/640?wx_fmt=png)

**我们可以看到箭头函数对应的节点是 ArrowFunctionExpression。**

接下来我们再来看看普通函数对应的节点是什么?

```
let add = function(x, y){
  return x + y;
};
```

我们通过传送门查看到上面代码对应的 AST 结构为

![](https://mmbiz.qpic.cn/mmbiz_png/C527icpHV4scib6NWPyVH9X5PNZkeibV5GYvvmOUSaMDaibEvle1SWDuxgScXYDLB4s4RVwCTgP2Aa6D9S6tTUxGEA/640?wx_fmt=png)

**我们可以看到普通函数对应的节点是 FunctionExpression。**

**所以我们的实现思路只要进行节点替换 (ArrowFunctionExpression->FunctionExpression) 就可以啦。**

**plugin.js**

```
module.exports = function({ types: t }) {
  return {
    visitor: {
      VariableDeclaration(path) {
        const node = path.node;
        ['let', 'const'].includes(node.kind) && (node.kind = 'var');
      },
      //箭头函数对应的访问者方法(节点)
      ArrowFunctionExpression(path) {
       //该路径对应的节点信息
        let { id, params, body, generator, async } = path.node;
        //进行节点替换 (arrowFunctionExpression->functionExpression)
        path.replaceWith(t.functionExpression(id, params, body, generator, async));
      }
    }
  };
};
```

满怀激动的

```
npm run babel
```

**after.js**

```
var add = function (x, y) {
  return x + y;
};
```

惊不惊喜 ? 意不意外 ? 你以为这样就结束了吗 ? 那你就太年轻啦。

我们经常会这样写箭头函数来省略 return。

```
let add = (x,y) =>x + y;
```

我们来试试 这样能不能转义

```
npm run babel
```

GG. 控制台飘红~

下面我直接贴下最后的实现, 具体原因我觉得读者自己研究或许更有趣~

**plugin.js**

```
module.exports = function({ types: t }) {
  return {
    visitor: {
      VariableDeclaration(path) {
        const node = path.node;
        ['let', 'const'].includes(node.kind) && (node.kind = 'var');
      },
      ArrowFunctionExpression(path) {
        let { id, params, body, generator, async } = path.node;
        //箭头函数我们会简写{return a+b} 为 a+b
        if (!t.isBlockStatement(body)) {    
          const node = t.returnStatement(body);
          body = t.blockStatement([node]);
        }
        path.replaceWith(t.functionExpression(id, params, body, generator, async));
      }
    }
  };
};
```

关于奇舞精选
------

《奇舞精选》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 Ecma 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib5qznUbusCncHwRfT4p5Gz5eiaQibZamprE68NGzXQAh7xdxdic83U5fYsDvxterxyjq3DfNibqabQHibA/640?wx_fmt=png)