> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zd8x5Om2psKfrZLfL9Og-A)

大厂技术  坚持周更  精选好文
================

认识 AST
======

定义： 在计算机科学中，抽象语法树是源代码语法结构的一种抽象表示。它以树状的形式表现编程语言的语法结构，树上的每个节点都表示源代码中的一种结构。之所以说语法是 “抽象” 的，是因为这里的语法并不会表示出真实语法中出现的每个细节。

从定义中我们只需要知道一件事就行，那就是 AST 是一种树形结构，并且是某种代码的一种抽象表示。

在线可视化网站：https://astexplorer.net/ ，利用这个网站我们可以很清晰的看到各种语言的 AST 结构。

estree[1]
---------

estree 就是 es 语法对应的标准 AST，作为一个前端也比较方便理解。我们以官方文档为例

> https://github.com/estree/estree/blob/master/es5.md

1.  下面看一个代码
    

```
console.log('1')
```

AST 为

```
{  "type": "Program",  "start": 0, // 起始位置  "end": 16, // 结束位置，字符长度  "body": [    {      "type": "ExpressionStatement", // 表达式语句      "start": 0,      "end": 16,      "expression": {        "type": "CallExpression", // 函数方法调用式        "start": 0,        "end": 16,        "callee": {          "type": "MemberExpression", // 成员表达式 console.log          "start": 0,          "end": 11,          "object": {            "type": "Identifier", // 标识符，可以是表达式或者结构模式            "start": 0,            "end": 7,            "name": "console"          },          "property": {            "type": "Identifier",             "start": 8,            "end": 11,            "name": "log"          },          "computed": false, // 成员表达式的计算结果，如果为 true 则是 console[log], false 则为 console.log          "optional": false        },        "arguments": [ // 参数          {            "type": "Literal", // 文字标记，可以是表达式            "start": 12,            "end": 15,            "value": "1",            "raw": "'1'"          }        ],        "optional": false      }    }  ],  "sourceType": "module"}
```

2.  看两个稍微复杂的代码
    

```
const b = { a: 1 };const { a } = b;
```

```
function add(a, b) {    return a + b;}
```

这里建议读者自己将上述代码复制进上面提到的网站中，自行理解 estree 的各种节点类型。当然了，我们也不可能看一篇文章就记住那么多类型，只要心里有个大致的概念即可。

认识 acorn[2]
-----------

由 JavaScript 编写的 JavaScript 解析器，类似的解析器还有很多，比如 Esprima[3] 和 Shift[4] ，关于他们的性能，Esprima 的官网给了个测试地址 [5]，但是由于 acron 代码比较精简，且 webpack 和 eslint 都依赖 acorn，因此我们这次从 acorn 下手，了解如何使用 AST。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LAAsibgUuod8mRLYmjQ60PjjEES9H0ku30KlR6jfIYrbSkmFGtMnoKnQ/640?wx_fmt=png)

### 基本操作

acorn 的操作很简单

```
import * as acorn from 'acorn';const code = 'xxx';const ast = acorn.parse(code, options)
```

这样我们就能拿到代码的 ast 了，options 的定义如下

```
interface Options {    ecmaVersion: 3 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 'latest'    sourceType?: 'script' | 'module'    onInsertedSemicolon?: (lastTokEnd: number, lastTokEndLoc?: Position) => void    onTrailingComma?: (lastTokEnd: number, lastTokEndLoc?: Position) => void    allowReserved?: boolean | 'never'    allowReturnOutsideFunction?: boolean    allowImportExportEverywhere?: boolean    allowAwaitOutsideFunction?: boolean    allowSuperOutsideMethod?: boolean    allowHashBang?: boolean    locations?: boolean    onToken?: ((token: Token) => any) | Token[]    onComment?: ((      isBlock: boolean, text: string, start: number, end: number, startLoc?: Position,      endLoc?: Position    ) => void) | Comment[]    ranges?: boolean    program?: Node    sourceFile?: string    directSourceFile?: string    preserveParens?: boolean  }
```

*   ecmaVersion ECMA 版本，默认时 es7
    
*   locations 默认为 false，设置为 true 时节点会携带一个 loc 对象来表示当前开始与结束的行数。
    
*   onComment 回调函数，每当代码执行到注释的时候都会触发，可以获取当前的注释内容
    

获得 ast 之后我们想还原之前的函数怎么办，这里可以使用 astring[6]

```
import * as astring from 'astring';const code = astring.generate(ast);
```

### 实现普通函数转换为箭头函数

接下来我们就可以利用 AST 来实现一些字符串匹配不太容易实现的操作，比如将普通函数转化为箭头函数。

我们先来看两个函数的 AST 有什么区别

```
function add(a, b) {    return a + b;}
```

```
const add = (a, b) => {    return a + b;}
```

```
{  "type": "Program",  "start": 0,  "end": 41,  "body": [    {      "type": "FunctionDeclaration",      "start": 0,      "end": 40,      "id": {        "type": "Identifier",        "start": 9,        "end": 12,        "name": "add"      },      "expression": false,      "generator": false,      "async": false,      "params": [        {          "type": "Identifier",          "start": 13,          "end": 14,          "name": "a"        },        {          "type": "Identifier",          "start": 16,          "end": 17,          "name": "b"        }      ],      "body": {        "type": "BlockStatement",        "start": 19,        "end": 40,        "body": [          {            "type": "ReturnStatement",            "start": 25,            "end": 38,            "argument": {              "type": "BinaryExpression",              "start": 32,              "end": 37,              "left": {                "type": "Identifier",                "start": 32,                "end": 33,                "name": "a"              },              "operator": "+",              "right": {                "type": "Identifier",                "start": 36,                "end": 37,                "name": "b"              }            }          }        ]      }    }  ],  "sourceType": "module"}
```

```
{  "type": "Program",  "start": 0,  "end": 43,  "body": [    {      "type": "VariableDeclaration",      "start": 0,      "end": 43,      "declarations": [        {          "type": "VariableDeclarator",          "start": 6,          "end": 43,          "id": {            "type": "Identifier",            "start": 6,            "end": 9,            "name": "add"          },          "init": {            "type": "ArrowFunctionExpression",            "start": 12,            "end": 43,            "id": null,            "expression": false,            "generator": false,            "async": false,            "params": [              {                "type": "Identifier",                "start": 13,                "end": 14,                "name": "a"              },              {                "type": "Identifier",                "start": 16,                "end": 17,                "name": "b"              }            ],            "body": {              "type": "BlockStatement",              "start": 22,              "end": 43,              "body": [                {                  "type": "ReturnStatement",                  "start": 28,                  "end": 41,                  "argument": {                    "type": "BinaryExpression",                    "start": 35,                    "end": 40,                    "left": {                      "type": "Identifier",                      "start": 35,                      "end": 36,                      "name": "a"                    },                    "operator": "+",                    "right": {                      "type": "Identifier",                      "start": 39,                      "end": 40,                      "name": "b"                    }                  }                }              ]            }          }        }      ],      "kind": "const"    }  ],  "sourceType": "module"}
```

找到区别之后我们就可以有大致的思路

1.  找到 `FunctionDeclaration`
    

2.  将其替换为`VariableDeclaration` `VariableDeclarator` 节点
    

3.  在 `VariableDeclarator` 节点的 `init` 属性下新建 `ArrowFunctionExpression` 节点
    

4.  并将 `FunctionDeclaration` 节点的相关属性替换到 `ArrowFunctionExpression` 上即可
    

但是由于 acorn 处理的 ast 只是单纯的对象，并不具备类似 dom 节点之类的对节点的操作能力，如果需要操作节点，需要写很多工具函数， 所以我这里就简单写一下。

```
import * as acorn from "acorn";import * as astring from 'astring';import { createNode, walkNode } from "./utils.js";const code = 'function add(a, b) { return a+b; } function dd(a) { return a + 1 }';console.log('in:', code);const ast = acorn.parse(code);walkNode(ast, (node) => {    if(node.type === 'FunctionDeclaration') {        node.type = 'VariableDeclaration';        const variableDeclaratorNode = createNode('VariableDeclarator');        variableDeclaratorNode.id = node.id;        delete node.id;        const arrowFunctionExpressionNode = createNode('ArrowFunctionExpression');        arrowFunctionExpressionNode.params = node.params;        delete node.params;        arrowFunctionExpressionNode.body = node.body;        delete node.body;        variableDeclaratorNode.init = arrowFunctionExpressionNode;        node.declarations = [variableDeclaratorNode];        node.kind = 'const';    }})console.log('out:', astring.generate(ast))
```

结果如下

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LH2Gv8KPSRNMO2MMx1potibmbib7f2iaibRsIvl325V7JYndAahtoqy1GlQ/640?wx_fmt=png)

如果想要代码更加健壮，可以使用 recast[7]，提供了对 ast 的各种操作

```
// 用螺丝刀解析机器const ast = recast.parse(code);// ast可以处理很巨大的代码文件// 但我们现在只需要代码块的第一个body，即add函数const add  = ast.program.body[0]console.log(add)// 引入变量声明，变量符号，函数声明三种“模具”const {variableDeclaration, variableDeclarator, functionExpression} = recast.types.builders// 将准备好的组件置入模具，并组装回原来的ast对象。ast.program.body[0] = variableDeclaration("const", [  variableDeclarator(add.id, functionExpression(    null, // Anonymize the function expression.    add.params,    add.body  ))]);//将AST对象重新转回可以阅读的代码const output = recast.print(ast).code;console.log(output)
```

这里只是示例代码，展示 recast 的一些操作，最好的情况还是能遍历节点自动替换。

这样我们就完成了将普通函数转换成箭头函数的操作，但 ast 的作用不止于此，作为一个前端在工作中可能涉及 ast 的地方，就是自定义 eslint 、 stylelint 等插件，下面我们就趁热打铁，分别实现。

实现一个 ESlint 插件
==============

介绍
--

ESlint 使用 Espree （基于 acron） 解析 js 代码，利用 AST 分析代码中的模式，且完全插件化。

ESlint 配置
---------

工作中我们最常接触的就是 eslint 的配置，我们写的插件也需要从这里配置从而生效

```
// .eslintrc.jsmoudule.export = {    extends: ['eslint:recommend'],    parser: '@typescript-eslint/parser', // 解析器，    plugins: ['plugin1'], // 插件    rules: {        semi: ['error', 'alwayls'],        quotes: ['error', 'double'],        'plugin1/rule1': 'error',    },    processor: '', // 特定文件中使用 eslint 检测}
```

parser，默认使用 espree[8]，对 acorn[9] 的一层封装，将 js 代码转化为抽象语法树 AST。

```
import * as espree from "espree";const ast = espree.parse(code);
```

经常使用的还有 @typescript-eslint/parser[10] , 这里可以拓展 ts 的 lint；

开发一个 eslint 插件
--------------

### 准备

eslint 官方也有个介绍，如何给 eslint 做贡献 https://eslint.org/docs/developer-guide/contributing/

1.  安装 yeoman 并初始化环境，yeoman 就是一个脚手架，方便创建 eslint 的插件和 rule
    

```
 npm install -g yo generator-eslint
```

创建一个插件文件夹并进入

创建 plugin

```
yo eslint:plugin
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LncGOicbHh43aqIeVFrwdWmprWxuWEKlZpl0BkmudUg2pV2jyQcMM4NA/640?wx_fmt=png)image.png

最重要的是 ID，这样插件发布之后，会以 eslint-plugin-[id] 的形式发布到 npm 上，不可以使用特殊字符。

创建 rule 规则

```
yo eslint:rule
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LMufuXbwyB8xb3WN9kxQqEzNWIcXpV6WU1DjK2l24XNx6mxBtniclqTg/640?wx_fmt=png)image.png

这里的 id 会生成 `eslint-plugin-[id]` 插件唯一标识符

生成的文件列表为

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7L0DpLFTQ2IDyOK2H41yJQIj1qDCFrJsdibKa32cWeO4cXTKmLvu3k53Q/640?wx_fmt=png)

然后就可以实现插件了

这时候我们可以回头看一下刚刚生成的文件

> rules/cpf-plugin.js
> 
> 可以参考
> 
> https://cn.eslint.org/docs/developer-guide/working-with-rules

```
/** * @fileoverview cpf better * @author tsutomu */"use strict";//------------------------------------------------------------------------------// Rule Definition//------------------------------------------------------------------------------/** * @type {import('eslint').Rule.RuleModule} */module.exports = {  meta: { // 这条规则的元数据，    type: null, // 类别 `problem`, `suggestion`, or `layout`    docs: { // 文档      description: "cpf better",      category: "Fill me in",      recommended: false,      url: null, // URL to the documentation page for this rule    },    fixable: null, // Or `code` or `whitespace`    schema: [], // 重点， eslint 可以通过识别参数从而避免无效的规则配置 Add a schema if the rule has options  },  create(context) {    // variables should be defined here    //----------------------------------------------------------------------    // Helpers    //----------------------------------------------------------------------    // any helper functions should go here or else delete this section    //----------------------------------------------------------------------    // Public    //----------------------------------------------------------------------    return {      // visitor functions for different types of nodes    };  },};
```

Eslint 的插件需要根据它规定的特定规则进行编写

*   Meta 中比较重要的是 schema，主要是设置入参，我们来看一下 shcema 的规则 https://eslint.org/docs/developer-guide/working-with-rules#options-schemas
    

JSONSchema 定义 https://json-schema.org/understanding-json-schema/

大致有两种形式，enum 和 object

```
schema: [    {        "enum": ["always", "never"]    },    {        "type": "object",        "properties": { // 这里的意思就是可以有个叫 exceptRange 的参数，值为布尔类型            "exceptRange": {                "type": "boolean"            }        },        "additionalProperties": false    }]
```

*   下面看下 create，返回了一个对象，需要在其中编写遇到对应节点所需要执行的方法， context 则提供了一些方便的方法，包括 `context.report` 上报错误和`context.getSourceCode` 获取源代码。
    

```
create(context: RuleContext): RuleListener;        interface RuleContext {        id: string;        options: any[];        settings: { [name: string]: any };        parserPath: string;        parserOptions: Linter.ParserOptions;        parserServices: SourceCode.ParserServices;        getAncestors(): ESTree.Node[];        getDeclaredVariables(node: ESTree.Node): Scope.Variable[];        getFilename(): string;        getPhysicalFilename(): string;        getCwd(): string;        getScope(): Scope.Scope;        getSourceCode(): SourceCode;        markVariableAsUsed(name: string): boolean;        report(descriptor: ReportDescriptor): void;    }
```

### no-console 插件源码解析

写自己的插件之前，不妨看下官方的插件源码，也更方便理解里面的各种概念。

```
/** * @fileoverview Rule to flag use of console object * @author Nicholas C. Zakas */"use strict";//------------------------------------------------------------------------------// Requirements//------------------------------------------------------------------------------const astUtils = require("./utils/ast-utils");//------------------------------------------------------------------------------// Rule Definition//------------------------------------------------------------------------------/** @type {import('../shared/types').Rule} */module.exports = {    meta: {        type: "suggestion",        docs: {            description: "disallow the use of `console`",            recommended: false,            url: "https://eslint.org/docs/rules/no-console"        },        schema: [            {                type: "object",                properties: {                    allow: {                        type: "array",                        items: {                            type: "string"                        },                        minItems: 1,                        uniqueItems: true                    }                },                additionalProperties: false            }        ],        messages: {            unexpected: "Unexpected console statement."        }    },    create(context) {        const options = context.options[0] || {};        const allowed = options.allow || [];        /**         * Checks whether the given reference is 'console' or not.         * @param {eslint-scope.Reference} reference The reference to check.         * @returns {boolean} `true` if the reference is 'console'.         */        function isConsole(reference) {            const id = reference.identifier;            return id && id.name === "console";        }        /**         * Checks whether the property name of the given MemberExpression node         * is allowed by options or not.         * @param {ASTNode} node The MemberExpression node to check.         * @returns {boolean} `true` if the property name of the node is allowed.         */        function isAllowed(node) {            const propertyName = astUtils.getStaticPropertyName(node);            return propertyName && allowed.indexOf(propertyName) !== -1;        }        /**         * Checks whether the given reference is a member access which is not         * allowed by options or not.         * @param {eslint-scope.Reference} reference The reference to check.         * @returns {boolean} `true` if the reference is a member access which         *      is not allowed by options.         */        function isMemberAccessExceptAllowed(reference) {            const node = reference.identifier;            const parent = node.parent;            return (                parent.type === "MemberExpression" &&                parent.object === node &&                !isAllowed(parent)            );        }        /**         * Reports the given reference as a violation.         * @param {eslint-scope.Reference} reference The reference to report.         * @returns {void}         */        function report(reference) {            const node = reference.identifier.parent;            context.report({                node,                loc: node.loc,                messageId: "unexpected"            });        }        return {            "Program:exit"() {                const scope = context.getScope(); // 获取当前作用域，及全局作用域                const consoleVar = astUtils.getVariableByName(scope, "console"); // 向上遍历，查找                const shadowed = consoleVar && consoleVar.defs.length > 0; // 这里是判断别名                /*                 * 'scope.through' includes all references to undefined                 * variables. If the variable 'console' is not defined, it uses                 * 'scope.through'.                 */                // 如果 console 是未定义的，那么他就在 scope.through 中                const references = consoleVar                    ? consoleVar.references                    : scope.through.filter(isConsole);                if (!shadowed) {                    references                        .filter(isMemberAccessExceptAllowed)                        .forEach(report);                }            }        };    }};
```

对照看一下 console.log 的 ast ，在最上面

*   Scope 作用域定义
    

```
interface Scope {        type:            | "block"            | "catch"            | "class"            | "for"            | "function"            | "function-expression-name"            | "global" // 及 Program            | "module"            | "switch"            | "with"            | "TDZ";        isStrict: boolean;        upper: Scope | null; // 父级作用域        childScopes: Scope[]; // 子级作用域        variableScope: Scope;        block: ESTree.Node;        variables: Variable[]; // 变量        set: Map<string, Variable>; // 变量 set 便于快速查找        references: Reference[]; //  此范围所有引用的数组        through: Reference[]; // 由未定义的变量组成的数组        functionExpressionScope: boolean;    }
```

Scope 相关的源码可以参考 https://github.com/estools/escope，scope 可视化可以看这里 http://mazurov.github.io/escope-demo/

这里的 through 就是当前作用域无法解析的变量，比如

```
function a() {         function b() {            let c = d;    }}
```

这里面明显是 d 无法解析，那么

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LV1BLuRY1TEKY0TOYTFxjicFiaIdEGTL7oicTp7YSgFZiaLDmybicYvWoFtQ/640?wx_fmt=png)

可以看到，在全局作用域的 through 中可以找到这个 d。

### 自动修复

可以再 report 中调用 fix 相关的函数来进行修复，下面是 fix 的

```
interface RuleFixer {    insertTextAfter(nodeOrToken: ESTree.Node | AST.Token, text: string): Fix;    insertTextAfterRange(range: AST.Range, text: string): Fix;    insertTextBefore(nodeOrToken: ESTree.Node | AST.Token, text: string): Fix;    insertTextBeforeRange(range: AST.Range, text: string): Fix;    remove(nodeOrToken: ESTree.Node | AST.Token): Fix;    removeRange(range: AST.Range): Fix;    replaceText(nodeOrToken: ESTree.Node | AST.Token, text: string): Fix;    replaceTextRange(range: AST.Range, text: string): Fix;}interface Fix {    range: AST.Range;    text: string;}
```

用法为

```
report(context, message, type, {    node,    loc,    fix: (fixer) {        return fixer.inserTextAfter(token,  string);    }})
```

可以看下 `eqeqeq` 的写法，这是一个禁用 `==` `!=` 并且修复为`=== !==`的规则

```
return {    BinaryExpression(node) {        const isNull = isNullCheck(node);        if (node.operator !== "==" && node.operator !== "!=") {            if (enforceInverseRuleForNull && isNull) {                report(node, node.operator.slice(0, -1));            }            return;        }        if (config === "smart" && (isTypeOfBinary(node) ||                areLiteralsAndSameType(node) || isNull)) {            return;        }        if (!enforceRuleForNull && isNull) {            return;        }        report(node, `${node.operator}=`);    }};
```

修复的代码在 report 中

```
function report(node, expectedOperator) {    const operatorToken = sourceCode.getFirstTokenBetween(        node.left,        node.right,        token => token.value === node.operator    );    context.report({        node,        loc: operatorToken.loc,        messageId: "unexpected",        data: { expectedOperator, actualOperator: node.operator },        fix(fixer) {            // If the comparison is a `typeof` comparison or both sides are literals with the same type, then it's safe to fix.            if (isTypeOfBinary(node) || areLiteralsAndSameType(node)) {                return fixer.replaceText(operatorToken, expectedOperator);            }            return null;        }    });}
```

### 实现 no-getNodeRef

1.  实现一个禁用 getNodeRef 的插件
    

当我们在内部使用的跨端框架中使用下面的配置之后，将不再支持 `getNodeRef` 属性，取而代之的是使用 `createSelectorQuery`

```
compilerNGOptions: {    removeComponentElement: true,  },
```

首先我们先看一下 `getNodeRef` 的用法

```
class A extends C {    componmentDidMount() {        this.getNodeRef('');    }}
```

在上面的可视化网站中可以看到下面的

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LfqAZk1EdFly1bUQNw3cgQkg2Tef6ibv8J5QbEMpdicKEZIP0KDZuRK2w/640?wx_fmt=png)

那么我们就可以很暴力的写出 rule ，如下

```
return {  // visitor functions for different types of nodes  CallExpression: (node) => {    if(node.callee.property && node.callee.property.name === 'getNodeRef' && node.callee.object.type === 'ThisExpression') {      context.report({        node,        message: '禁用 getNodeRef'      })    }  }};
```

测试的代码

```
const ruleTester = new RuleTester();ruleTester.run("no-getnoderef", rule, {  valid: [    // give me some code that won't trigger a warning    {      code: 'function getNodeRef() {}; getNodeRef();'    }  ],  invalid: [{    code: " this.getNodeRef('');",    errors: [{      message: "禁用 getNodeRef",      type: "CallExpression"    }],  }, ],});
```

测试的结果

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lb3Qal1icDiaRDMMicO1YIcBTkJWbWsnDsiaxnf3eEgkhlGJ4HxbgFtxjsw/640?wx_fmt=png)image.png

### 实现 care-about-scroll

并没有什么实际的用处，仅仅是因为我们使用的框架中的 scroll event 有 bug，android 和 IOS 端参数有问题，安卓的 e.detail.scrollHeight 对应 ios 的 e.detail.scrollTop，再次说明，这是个框架的 bug，在这里使用仅仅为了演示 eslint 编写插件的一些能力。

我们的预期目标是在同一个函数中，如果使用了上述一个属性和没有使用另一个属性，则出现提示。

代码为

```
return {  // visitor functions for different types of nodes  "Identifier": (node) => {    if((node.name === 'scrollHeight' || node.name === 'scrollTop') && node.parent && node.parent.object.property.name === 'detail') {      const block = findUpperNode(node, 'BlockStatement');      if(block) {        let checked = false;        walkNode(block, (_node) => {          if(_node.type === 'Identifier' && _node.name === IDENTIFIERS[node.name]) {            checked = true;            return true;          }          return false;        });        if(!checked) {          context.report({node, message: `缺少 ${IDENTIFIERS[node.name]}`})        }      }    }  }};
```

测试代码如下

```
ruleTester.run("care-about-scroll", rule, {  valid: [    // give me some code that won't trigger a warning    {      code: "function handleScroll(e) { var a = e.detail.scrollTop; var b = e.detail.scrollHeight; }"    }  ],  invalid: [{    code: "function handleScroll(e) { var a = e.detail.scrollTop; }",    errors: [{      message: "缺少 scrollHeight",      type: "Identifier"    }],  }, ],});
```

### 发布插件

登录之后直接发布即可

```
npm publish
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LqOUpWHMbuuOdrwnxQJic4CJMeSL6bOib03iaPxKJibQ4Goc0s1IfLLIianQ/640?wx_fmt=png)image.png

### 使用插件

首先按照刚刚发布的插件

```
npm i eslint-plugin-cpf -D
```

在 eslintrc.js 中新增配置

```
moudule.exports = {    plugins: ['cpfabc'],    rules: {        'cpfabc/no-getnoderef': 'error',        'cpfabc/care-about-scroll': 'error',    }}
```

效果如下

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LaeHfeFwpuaUBTEkRcX2xHv5bFnsJ7NTCuWu0DnweIatzgsqPBib3SUQ/640?wx_fmt=png)image.png![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LlPaC5S5ianYuhcKQDGD2csfiaB9ibs3jH4CpVum1ic9NKgO13SmJ4dnx8A/640?wx_fmt=png)image.png

更改代码后正常

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lv3wuXJwoTwLhTQZWwwtMVTXeibCxy0y19LfGJhHBw8svCbqXt46pQnA/640?wx_fmt=png)image.png

实现一个 Stylelint 插件
=================

介绍
--

Stylelint 插件和 eslint 插件的区别主要是

*   解释器，postcss
    
*   入口，这里可以使用本地文件开发
    
*   Ast，因为 css 本身就有结构，这里更像 dom 树，每个节点有 type 和 nodes（子节点)，甚至并没有对 less 之类的代码进行转换。也因此 stylelint 的插件写起来更像直接对字符串进行处理，不会体现 ast 的作用。
    

但是整体的思想都是一样的，css 的节点类型也少很多，可以参考 https://github.com/postcss/postcss/blob/main/docs/writing-a-plugin.md

*   `Root`: 根节点，指代当前 css 文件
    
*   `AtRule`: @开头的一些属性，如 @media
    
*   `Rule`: 常用的 css 选择器
    
*   `Declaration`: 键值对，如 color: red
    
*   `Comment`: 注释
    

实现 cpf-style-plugin/max-depth-2
-------------------------------

内部跨端框架 的 ttss 最多支持两层的 css 组合选择器，即下面是可行的

```
div div {}
```

而下面是不行的

```
div div div {}
```

而对于 less

```
.a {
    &-b {
        &-c {
        }
    }
}
/////
.a-b-c {}
```

其实只有一层，所以我们的代码需要注意这点

首先建立一个文件叫 cpf-style-plugin.js

```
const stylelint = require('stylelint');const { ruleMessages, report } = stylelint.utils;const ruleName = 'cpf-style-plugin/max-depth-2';const messages = ruleMessages(ruleName, {  //… linting messages can be specified here  expected: '不允许三层',  test: (...any) => `${JSON.stringify(any)}xxx`,});module.exports.ruleName = ruleName;module.exports.messages = messages;module.exports = stylelint.createPlugin(ruleName, function ruleFunction() {  return function lint(postcssRoot, postcssResult) {    function helperDep(n, dep) {      if (n.nodes) {        n.nodes.forEach((newNode) => {          if (newNode.type === 'rule') {            const selectorNum = newNode.selector              .split(' ')              .reduce((p, c) => p + (/^[a-zA-z.#].*/.test(c) ? 1 : 0), 0);            if (dep + selectorNum > 2) {              report({                message: messages.expected,                node: newNode,                result: postcssResult,              });            }            helperDep(newNode, dep + selectorNum);          }        });      }    }    helperDep(postcssRoot, 0);  };});
```

这里有区别的是，eslint 都是对标准语法树进行操作，而这里的 css 树，准确来说应该是 less 的 ast 树，并不会先转成 css 再进行我们的 lint 操作，因此我们需要考虑 rule 节点可能以 `&` 开头，也导致写法上有一点别扭。

使用插件
----

使用的话只需要更改 stylelintrc.js 即可

```
module.exports = {    snippet: ['less'],    extends: "stylelint-config-standard",    plugins: ['./cpf-style-plugin.js'],    rules: {        'color-function-notation': 'legacy',        'cpf-style-plugin/max-depth-2': true,    }}
```

看一下效果

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LTdpDYvdKsicn7NbKAFHSbd2qBDTLPNmqftvDsFwljITQZ9jjDwqXBxA/640?wx_fmt=png)

实现一个 React Live Code
====================

你可能会觉得 live code 和 ast 有啥关系，只不过是放入 `new Function` 即可，但是形如 `import export` 等功能，利用字符串匹配实现是不太稳定的，我们可以利用 AST 来实现这些方法，这里为了简洁，最后一行表示 `export default` ，思想是一样的，利用 AST 查找到我们需要的参数即可。

> https://codesandbox.io/s/react-live-editor-3j7t2?file=/src/index.js

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Liaj2rEAEYlMiayPAmUx7yHbUia2JradcAmYA52DwccSVWX56PrWe8SxQQ/640?wx_fmt=png)

其中上半部分为编辑器，下半部分为事实的效果，我们的工作是分析最后一行的组件并展示出来。

其中编辑器的部分负责代码的样式，使用的是 react-simple-code-editor[11]，主要的用法如下

```
<Editor     value={code}    onValueChange={code => {xxx}}/>
```

所以主要的工作在获取编辑器代码之后的工作

1.  首先我们需要将 JSX 代码转换为 es5 代码，这里用到 @babel/standalone[12]，这是一个环境使用的 babel 插件，可以这么使用
    

```
import { transform as babelTransform } from "@babel/standalone";const tcode = babelTransform(code, { presets: ["es2015", "react"] }).code;
```

2.  然后我们需要获取最后一行代码 `<Greet />` 并将其转化为，其实也就是找到 `React.createElement(Greet)` 这个，这里就可以使用 ast 进行查找。过程略过，我们得到了这个节点 `rnode`，最后将这个`rnode` 转换为 `React.createElement`，我们最终得到了这样的代码
    

```
code = "'use strict';var _x = _interopRequireDefault(require('x'));function _interopRequireDefault(obj) {    return obj && obj.__esModule ? obj : { default: obj };}function Greet() {    return React.createElement('span', null, 'Hello World!');}render(React.createElement(Greet, null));"
```

3.  将上述的代码塞入 new Function 中执行。
    

```
const renderFunc = return new Function("React", "render", "require", code);
```

4.  最后执行上述的代码
    

```
import React from "react";function render(node) {    ReactDOM.render(node, domElement);}function require(moduleName) {    // 自定义}renderFunc(React, render, require)
```

参考
==

https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js

https://segmentfault.com/a/1190000016231512

https://juejin.cn/post/6844903450287800327

https://medium.com/swlh/writing-your-first-custom-stylelint-rule-a9620bb2fb73

https://juejin.cn/post/7054008042764894222

### 参考资料

[1]

estree: _https://github.com/estree/estree_

[2]

acorn: _https://github.com/acornjs/acorn_

[3]

Esprima: _https://github.com/jquery/esprima_

[4]

Shift: _https://github.com/shapesecurity/shift-parser-js_

[5]

测试地址: _https://esprima.org/test/compare.html_

[6]

astring: _https://www.npmjs.com/package/astring_

[7]

recast: _https://www.npmjs.com/package/recast_

[8]

espree: _https://github.com/eslint/espree_

[9]

acorn: _https://github.com/acornjs/acorn_

[10]

@typescript-eslint/parser: _https://typescript-eslint.io/docs/linting/_

[11]

react-simple-code-editor: _https://www.npmjs.com/package/react-simple-code-editor_

[12]

@babel/standalone: _https://babeljs.io/docs/en/babel-standalone_

- END -

❤️ 谢谢支持
=======

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 **分享、点赞、收藏** 三连哦~。

欢迎关注公众号 **ELab 团队** 收获大厂一手好文章~

> 我们来自字节跳动，是旗下大力教育前端部门，负责字节跳动教育全线产品前端开发工作。
> 
> 我们围绕产品品质提升、开发效率、创意与前沿技术等方向沉淀与传播专业知识及案例，为业界贡献经验价值。包括但不限于性能监控、组件库、多端技术、Serverless、可视化搭建、音视频、人工智能、产品设计与营销等内容。

字节跳动校 / 社招内推码: UFCR982 

投递链接: https://job.toutiao.com/s/NcC2VdL