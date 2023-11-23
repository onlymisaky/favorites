> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wYYDG7yU9h3-6DBYTCkuiA)

大厂技术  坚持周更  精选好文
================

> 本文为来自 **字节跳动 - 业务中台团队** 成员的文章，已授权 ELab 发布。

前言
==

代码是写给人看的，所以一份好的代码，是要让水平不一的阅读者，都能够理解代码的本意。每个人的代码风格是不可能完全相同的，例如在一个文件里，有的以两个空格做缩进，有的以四个空格做缩进，有的使用下划线，有的使用驼峰，那么它的阅读体验就会变得很差。

所以如何来对代码进行约束，使团队的代码风格尽量统一，不产生更多的理解成本，是一个需要解决的问题。众所周知，**懒是社会生产力进步的源动力，所以...**

在前端工程化的标准中有一项就是自动化，自动化当中就包括了代码规范自动化。实现代码规范自动化可以解放团队生产力，提升团队生产效率，balabla... 所以 ESlint、TSLint、StyleLint 这些工程化插件应运而生。

而最近在笔者团队也在统一不同的项目之间的规范差异，相信大家也都遇到了大段飘红的现象，今天咱来简单探究一下背后涉及到的原理。

What is ESLint/Lint？
====================

首先，提到 ESlint，应该会想到两种东西，一个是 ESLint 的 npm 包，也就是我们 devDep 里面的， 另一个是我们所安装的比如 VSCode 的 ESLint 插件，那么这两个东西有什么联系呢。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6Gd9NZRKrkj3q2BtgNFRld26ic2a6VcPDVMgqlpErILhBJdiclBxz17SZQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GDWnn6pk64MR2fXVkINFl2RoW7eYVAVmqr16uhmYXAC25JLPrvwh07A/640?wx_fmt=png)

Npm 包：是实际的 lint 规则以及我们执行 lint 的时候，控制代码如何去进行格式化的。

Vscode 插件: 实际指向我们项目的 /node_modules/eslint 或者全局的 eslint，通过 eslint 的规则，告诉 IDE，哪些地方需要飘红。也就是说插件是在解析我们的打开的文件，同时和规则对比，是否存在 eslint 问题。以及可以通过我们的 IDE 配置，在不同的时机去执行我们的 lint，比如保存自动格式化。

总而言之， eslint 规则就是对我们的代码风格和代码中潜在的一些错误和不规范用法的一个约束，通过 npm 包的形式引入项目，同时通过 IDE 的插件，读取 npm 包规则，对我们的代码进行错误提示，

How to Use it？
==============

如何在项目配置 ESlint 就不在本文赘述了。大多数脚手架其实都会给你初始化好基本的 ESlint。涉及到的工具不同可能会有些许的不一样，不过都大差不差。这段讲一下 ESLint 中的主要配置项。如果有兴趣深一步研究，可以移步 eslint 的官网文档 [1]，对默认的规则集 [2] 感兴趣 也可以移步 。

打开一个 eslintrc 文件, 一般来说，有几个选项。这里以 json 为例，来简单说明下每个字段。

```
{    "extends": '', // 规则集继承自某个规则集    "root": 'true', // 找到这后，不再向上级目录寻找    // 解析选项    "parserOptions": {        "ecmaVersion": 6, //  指定你想要使用的 ECMAScript 版本 3/5/6/7/8/9        "sourceType": "module", // 'script'(default) or 'module'，标明你的代码是模块还是script        "ecmaFeatures": { // 是否支持某些feature，默认均为false            "globalReturn": true, //是否允许全局return            'impliedStrict': true, //是否为全局严格模式            "jsx": true        }    },    //自定义解析器，官方支持下列四种，也可以自己定义解析器。    "parse": "espree" | "esprima" | 'Babel-ESLint' | '@typescript-eslint/parser',    "plugins": ["a-plugin"], //第三方 插件a    "processor": "a-plugin/a-processor", // 制定处理器为插件a的处理器    "rules": {        "eqeqeq": "error"    }    // 指定一些全局变量，类似于global.d.ts的作用    "globals": {        "var1": "writable",        "var2": "readonly"    }    // 忽略哪些文件    "ignorePatterns": ["src/**/*.test.ts", "src/frontend/generated/*"]}
```

eslint 支持以下几种格式的配置文件，如果同一个目录下有多个配置文件，ESLint 只会使用一个。优先级顺序如下：

1.  `.eslintrc.js`
    
2.  `.eslintrc.yaml`
    
3.  `.eslintrc.yml`
    
4.  `.eslintrc.json`
    
5.  `.eslintrc`
    
6.  `package.json`
    

同时 eslint 也支持对每个目录配置不一样的规则，对于 mono 仓库下，可能每个 repo 的 eslint 都有些许的区别，这个时候我们就可以采用下面的目录格式，根目录下存在基本规则，子 app 下存在特定的规则。子 rc 是对父 rc 的一个 override，但是如果我们在 app/.eslintrc.js 中设置了 root:true, 那么对于 test.js, 父目录中 rc 使用的规则，在 app 中不会生效。

```
packages
├── package.json
├──.eslintrc.js
├── lib
│  └── test.js
└─┬ app
  ├── .eslintrc.js
  └── test.js
```

Why does it work？
=================

AST
---

他是为什么能够生效的。这里就要提到我们前端方方面面都要涉及到的 AST 了，感谢新时代。

ESLint 是基于抽象语法树来进行工作的，ESLint 默认使用的编译器 (parse) 是 Espree[3]，通过它来解析我们的 JS 代码生成 AST，基于 AST，我们就可以对我们的代码进行检查和修改了。

通常我们的 Babel 编译分为下图这几步，编译 / 转换 / 生成。ESlint 和它对比，只有第一步是一致的， 因为我们只需要拿到 ast 中的部分信息，同时直接在源码中进行提示和操作就行，并不需要 transform 和后续的生成代码。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GzRCWFn3QPAAyJZWpYFiaKl0KpHz48pQjfPica5Ikxm4q0RV4Q9OcrpBw/640?wx_fmt=png)

解析
--

现在我们通过 demo 来探究他背后的原理以及转换的方式。首先，我们需要加载和解析我们的源代码。这就是编译器将我们的代码转换成 AST 树的一个过程。因为已经全面拥抱 typescript（主要是因为 espree 没有类型注解，我难受），所以本文使用 `@typescript-eslint/parser`来作为我们的编译器。这里有个小坑，如果在 VSCode 安装了 import cost 插件的话，他去解析这个 parser 会特别卡，所以可以暂时禁用。

```
const foo =   "anthony"const bar = "dst"
```

```
import fs from 'fs';import path from 'path';import * as tsParser from  '@typescript-eslint/parser';const filePath = path.resolve('./src/test.ts')const text = fs.readFileSync(filePath, "utf8")// 编译成 AST 这里是不是和eslint的配置项对上了，没错就是透传而已const ast = tsParser.parse(text,{     comment: true, // 创建包含所有注释的顶级注释数组    ecmaVersion: 6, // JS 版本    // // 指定其他语言功能，    // ecmaFeatures: {     //     jsx: true, // 启用JSX解析    //     globalReturn: true // 在全局范围内启用return（当sourceType为“commonjs”时自动设置为true）    // },     loc: true, // 将行/列位置信息附加到每个节点    range: true, // 将范围信息附加到每个节点    tokens: true // 创建包含所有标记的顶级标记数组})
```

然后我们将获得的 ast 打印一下，简单从下图可以看到主要包含的内容。本地打印出来可能不太方便阅读，也可以使用在线的工具 [4]，将解析器设置为`@typescript-eslint/parser`。相对于 espree 来说，ts 解析多出来的部分中，比较关键的就是右图这段，决定我们如何去解析他的类型。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GJw85aAop6hdibmhtPt24ibxcGUR2VmiawloNFTuA64oAWNxEzZbr9AicYg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GUA3zZaGLLu0mjhnnUSn8fA5jXqtH5GKJsNqX9bDVfJ3dKyv3Oeibvgg/640?wx_fmt=png)

AST 就是记录了读取源文件之后的文本内容的各个单位的位置信息，这样我们就可以通过操作 AST 修改需要修改的内容，然后再根据修改后的 AST 信息进行修改对应的文本内容。比如我们把上文中的 `const` 关键字修改成 `let` ，那么我们就先对 AST 对应的`const`内容进行修改为 `let` ，得到修改之后的 AST 数据，再根据修改后的 AST 数据去修改对应的文本内容。所谓的修改就是字符串替换，因为我们已经知道了对应的位置信息。

SourceCode
----------

但是根据上面我们可以看到，直接根据 ast 去查找然后比对替换，效率是很低的，而且嵌套比较深。这个时候 ESlint 是怎么干的呢？他生成了一个新的结构用于我们操作，也就是`SourceCode`。有兴趣进一步探究可以自行查阅源码的 `sourcecode/source_code.js`部分。简单来说，就是构建了一个 SourceCode 实例，接受两个参数，原文 text 和解析后的 ast，然后返回我们一个包含茫茫多方法的实例对象。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GcVzNwiam27KwDy8n54WfNgmjIJIJhW6u8GUp9012YvCJt457O2QghKg/640?wx_fmt=png)

我们在 demo 项目中装一个 eslint 然后引入 SourceCode，看看构造后的对象是个什么玩意。

```
import { SourceCode } from 'eslint';// ....//const sourceCode = new SourceCode(text,ast);// 这打个断点，看看sourceCode结构
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6Gfy8HwS0yuHx38xVUU7VQRD5ibbBq77zuGClghf5OjR1Vbic0YE2Wria0w/640?wx_fmt=png)

*   简单来讲解（摘抄）一下实例对象里面的一些属性和`__proto__`上的方法，完整属性可以查阅官网 [5]/ 源码 / 类型注解。
    
*     
    

1.  hasBOM：是否含有 unicode bom[6]
    
2.  lines：将我们的每一行切割，分行形成的一个 array
    
3.  linsStartIndices: 每行的开始位置
    
4.  tokenAndComments: token 和 comment 的一个有序集合。
    
5.  `getText(node?: ESTree.Node, beforeCount?: number, afterCount?: number): string;`
    
6.  `isSpaceBetweenTokens(first: AST.Token, second: AST.Token): boolean;` 两个 token 间是否有空格。
    
7.  visitorKeys: 存在的 key 值。
    

好了 前置的一些知识我们已经介绍的差不多了。接下来 结合实际的 rules demo 来进行讲解。

规则模版
----

相信如果有写过 vscode 插件的同学应该对 Yeoman 不陌生，eslint 也有提供基于 Yeoman 的一套脚手架用于生成模版。

首先全局安装 eslint 的脚手架，`npm install -g yo generator-eslint`，然后通过下面的一些交互式命令行操作来初始化我们的操作。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GXziaicnrsVJDAFkO3kIYuiah3abKwumjg41KYxEkK1rEeiaU1kkMLY4XwQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GNJ4zpqjK1na1Xa2WqTJmFzbDgslQ76OK5txL3tj8BapqNJ7bgyDL8A/640?wx_fmt=png)

通过初始化，我们可以看到一个以下的文件的壳子, 我们在里面添加一些我们上面所讲到的东西。打开我们生成的规则模版文件，同时在里面添加一些规则和提示（注意，这里我的写法不规范，我将两种无关规则放在了一个规则文件里）。

```
"use strict";/** @type {import('eslint').Rule.RuleModule} */module.exports = {  meta: {    type: 'problem', // `problem`, `suggestion`, or `layout`    docs: {      description: "xxxx",      recommended: false,      url: null, // URL to the documentation page for this rule    },    messages:{      temp:'不样你用字面量作为函数的参数传入',      novar: '不样你用var声明',      noExport: '退出时执行这个'    },    fixable: 'code', // Or `code` or `whitespace`    schema: [], // Add a schema if the rule has options  },  create(context) {    // variables should be defined here    const sourceCode = context.getSourceCode();    return {      ArrowFunctionExpression:(node)=>{        if(node.callee.name !== 'abcd') return;        if(!node.arguments) return;        node.arguments.forEach((argNode,index)=>{          argNode.type === "Literal" && context.report({            node,            messageId: 'temp',            fix(fixer){              const val = argNode.value;              const statementString = `const val${index} = ${val}\n`;              return [                fixer.replaceTextRange(node.arguments[index].range, `val${index}`),                fixer.insertTextBeforeRange(node.range, statementString)              ]            }          })        })      },      "Program:exit"(node) {            context.report({                node,                messageId: "noExport",            });      },      VariableDeclaration(node){        if(node.kind === 'var') {          context.report({              node,              messageId: 'novar',              fix(fixer) {                  const varToken = sourceCode.getFirstToken(node)                  return fixer.replaceText(varToken, 'let')              }          })      }    }    };  },};
```

关键函数
----

在这个 demo 里面，我们看到几个东西，一个是 create 函数的参数 `context` 以及他的返回值，还有就是`context`上提供的`report`方法 以及 report 接受的`fix`参数。这几个加起来，形成了我们一条规则的校验逻辑，通过遍历，我们到了某个 ast 节点，如果某个 ast 节点满足了我们所写的某条规则，我们进行 report，同时提供一个修复函数，修复函数通过 token 或者 range 来决定对某处进行文本替换。

接下来，挨个来讲解这些东西，首先是 context 的上下文形成，这个没有什么好说的，其实就是创建了一个对象，然后提供了一些一些方法，供我们在插件中访问上下文使用，然后对于每个 rule 都在 createRuleListener 中都创建了一个 listener，这里我们在后面串整体流程时还会再过一遍。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6Gxic8ico38wcvYdRnMviaibn80WOUGtC4c4IDp0ebms0nnLIq2U1PL96mzQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6G6WfTNRfiaS6G1ksFrL7d4SHvibvm5F4xgX4cPgRUgEDAtYIawZ3bROFg/640?wx_fmt=png)

接着是 report 方法，简单分析下这块代码，其实就是通过一系列的操作，然后往 lintingProblem 这个数组里面推了一个 problem。这个 problem 包含一些错误信息，ast 信息等等。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GUvq4icjZBGgG3DiaD5hT8PDUWiajMVN1KkVibA83IicFAvOsJ3BO2xCgE8Q/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GYdLXvVXjVcPMu9WWzj1rnyXZFZY6chxBRcw4IhR54Q9wq2gR63yojw/640?wx_fmt=png)

最后是我们的 fix，我们上面用到的所有 replace 方法，其实都殊途同归，最后回到了这里，大道至简，简单的 slice 和 += 完成了我们的修复动作。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GqvMESvbP9kuxxWpfd8IH75QhPh5GY7ibpUtx8quU6CiaxbfxBTrLDwMA/640?wx_fmt=png)

基本上一个插件涉及到的核心几个东西，都简单解释了下。现在我们来串一串整体检测和修复的流程，也就是源码中`linter.js`中的`runRules`方法。

整体流程
----

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GIL76CvvMzsz9I9N7AXAQE2ncaibcdnK3QX2sndPslgs53DJE0Z6ASMg/640?wx_fmt=png)

我们在跑规则的时候，肯定需要的是对 ast 进行遍历，同时做一些操作。首先做了一个什么操作呢，调用了一个实例方法`Traverser.traverse`，传入了`ast`和一个对象，包含`enter`、`leave`和`visitorKeys`。这个函数的作用就是进行一个递归遍历，同时在遍历的时候通过 enter 和 leave 我们在队列中存储了两个相同的节点，一个是进入时，一个是退出时，方便我们后续处理。这里涉及到一个设计模式，访问者模式（用于数据和操作解耦），通过在遍历时加上 isEntering，可以让我们决定是在进入时还是退出时执行访问者逻辑。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GlU4vHIqeoic5aAfgWaGZ63xMeAZ33PPoAzDibLicfwico4MpXa6svj6kibA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GXCIKfBK1WfMk4yIPpibQzwCFDD6nXT1zrDdPj5SkWgurddoib20XPGTQ/640?wx_fmt=png)

接着我们需要把我们的所有规则都给像上面讲的给创建成 ruleListener，然后在我们的 nodeQueue 后续遍历时，触发某些逻辑。当然，这里大家可能都想到了订阅发布模式，这个也是在我们整个逻辑中比较重要的一环，遍历时，通过 emit 推送消息，然后让 ruleListener 决定是否需要执行某些逻辑，所以，我们需要对 Listener 订阅上某些事件。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6G64XYDCZMPtjlZDWC1VOZibymiaicXddgWziaTauLwhsYe34kibOxfWWSDIw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6G2XKYribibxmwZibh5gjcAk8AjfACtLyHZ05Vr8wTptHc7zHEVEnaI0sxA/640?wx_fmt=png)

接下来，就是对我们的 nodeQueue 遍历了，通过我们节点上打上的标，来决定是在执行进入逻辑还是离开逻辑。这里我就不展开讲具体的细节了，其实简单理解就是通过 enter 和 leave 的时候去触发不同的 visitor 的动作。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6GibN5aribwJhIVPibLXrIZ8fqib67Kudo2MePnDILFqiautzzWVWhCMG1mNg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIrnsFbXSfEKicia9kXYQK8ia6Gic2UueRx3NVDv1J3T2pUICt8aNmlBjBWpJtXB2ZDrY2eR1t5icOsXzzw/640?wx_fmt=png)

后语
==

限制于时间因素，本文成文比较仓促，可能会有一些知识点的缺失或者不对，敬请大家斧正。同时本文仅是初步的探索了其背后的原理，根据原理，后续可以做的一些例如 eslint 插件等等并没有详细的阐述。大家下来可以自行探索。

最后送大家一句话，linus 说的，也是我比较信奉的一句话。talk is cheap, show me the code，想了解一个东西，最好的办法就是简单实现它。我相信大家在解析完它的流程后，都能够简单实现一个 eslint 的小 demo，以及能够上手写一写 eslint-plugin。

❤️ 谢谢支持
-------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 分享、点赞、收藏 三连哦~。

欢迎关注公众号 **ELab 团队** 收货大厂一手好文章~

> **我们是谁？**
> 
> 我们是字节跳动业务中台，通过持续建设通用的基础产品技术能力，赋能字节包括抖音、电商、头条、西瓜等全系产品的业务创新。
> 
> **我们的职责**
> 
> 1、为业务提供设备、帐号、推送、短信、邮件、LBS、数据引 > 擎、舆情、众包标注、技术中间件等多类型基础服务 / 功能；
> 
> 2、面向内部关键业务场景（如抖音、电商、生活服务、广告、VR/AR 等），提供综合性行业解决方案；面向外部市场需求，提供部分 toB 产品；
> 
> 3、作为公司中台建设推进者，我们致力于提升中台治理水平，为字节内部各中台团队提供平台 / 数据 / 架构的解决方案。
> 
> 可凭内推码投递 **字节跳动 - 业务中台** 相关岗位哦~
> 
> *   字节跳动校 / 社招内推码: **BVJNBUG**
>     
> *   投递链接: **https://job.toutiao.com/s/hUmSryG**
>     

### 参考资料

[1]

官网文档 : _https://eslint.org/docs/latest/user-guide/configuring/configuration-files_

[2]

默认的规则集: _https://eslint.org/docs/latest/rules/_

[3]

Espree: _https://github.com/eslint/espree_

[4]

在线的工具: _https://astexplorer.net/_

[5]

官网: _https://eslint.org/docs/latest/developer-guide/working-with-rules_

[6]

unicode bom: _https://en.wikipedia.org/wiki/Byte_order_mark_

- END -