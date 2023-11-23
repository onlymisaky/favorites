> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/78h3eI8jwQiBhLUDyLg3GQ)

关注 前端瓶子君，回复 “交流”

加入我们一起学习，天天进步

> 作者：cd2001cjm（本文来自作者投稿）
> 
> https://www.jianshu.com/p/8bbc8f43a2ae

**前言**

每个编程语言都有自己的 AST，了解 AST 并能进行一些开发，会给我们的项目开发提供很大的便利。下面就带大家一探究竟

通过本文能了解到什么

1.  JS AST 结构和属性
    
2.  babel 插件开发
    

**JS AST 简介**

AST 也就是抽象语法树。简单来说就是把程序用树状形式展现。

每种语言（HTML，CSS，JS 等）都有自己的 AST，而且还有多种 AST 解析器。

回归 JS 本身，常见的 AST 解析器有：

*   acorn
    
*   @babel/parser
    
*   Typescript
    
*   Uglify-js
    
*   等等
    

不同解析器解析出来的 AST 有些许差异，但本质上是一样的。

本文将基于 @babel/parser 来进行示例和讲解

下面来看一句常见的代码

```
import ajax from 'axios'
```

转换后的 AST 结构如下：

```
{
        "type": "ImportDeclaration",
        "start": 0,
        "end": 24,
        "loc": {
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 24
          }
        },
        "specifiers": [
          {
            "type": "ImportDefaultSpecifier",
            "start": 7,
            "end": 11,
            "loc": {
              "start": {
                "line": 1,
                "column": 7
              },
              "end": {
                "line": 1,
                "column": 11
              }
            },
            "local": {
              "type": "Identifier",
              "start": 7,
              "end": 11,
              "loc": {
                "start": {
                  "line": 1,
                  "column": 7
                },
                "end": {
                  "line": 1,
                  "column": 11
                },
                "identifierName": "ajax"
              },
              "name": "ajax"
            }
          }
        ],
        "importKind": "value",
        "source": {
          "type": "StringLiteral",
          "start": 17,
          "end": 24,
          "loc": {
            "start": {
              "line": 1,
              "column": 17
            },
            "end": {
              "line": 1,
              "column": 24
            }
          },
          "extra": {
            "rawValue": "axios",
            "raw": "'axios'"
          },
          "value": "axios"
        }
      }
```

内容是不是比想象的多？莫慌，我们一点一点看。

来一张简略图：

![](https://mmbiz.qpic.cn/mmbiz/zPh0erYjkib3CcwuuQKNe0WxaRyWKLgHbrEjmfUCWpoTnIvkcunHcsFHkcCNbO8IJTqibNNylicGJZNGAFARtm0Xw/640?wx_fmt=other)

**ImportDeclaration**

语句的类型，表明是一个 import 的声明。

常见的有：

- VariableDeclaration：var x = 'init'

- FunctionDeclaration：function func(){}

- ExportNamedDeclaration：export function exp(){}

- IfStatement：if(1>0){}

- WhileStatement：while(true){}

- ForStatement：for(;;){}

- 不一一列举

既然是一个引入表达式，自然分左右两部分，左边的是 specifiers，右边的是 source

**specifiers**

specifiers 节点会有一个列表来保存 specifier

如果左边只声明了一个变量，那么会给一个 ImportDefaultSpecifier

如果左边是多个声明，就会是一个 ImportSpecifier 列表

什么叫左边有多个声明？看下面的示例

```
import {a,b,c} from 'x'
```

变量的声明要保持唯一性

而 Identifier 就是鼓捣这个事情的

**source**

source 包含一个字符串节点 StringLiteral，对应了引用资源所在位置。示例中就是 axios

**AST 是如何转换出来的呢？**

以 babel 为例子：

```
const parser = require('@babel/parser')
let codeString = `
import ajax from 'axios'
`;


let file = parser.parse(codeString,{
    sourceType: "module"
})
console.dir(file.program.body)
```

在 node 里执行一下，就能打印出 AST

通过这个小示例，大家应该对 AST 有个初步的了解，下面我们谈谈了解它有什么意义

**应用场景以及实战**

实际上，我们在项目中，AST 技术随处可见

*   Babel 对 es6 语法的转换
    
*   Webpack 对依赖的收集
    
*   Uglify-js 对代码的压缩
    
*   组件库的按需加载 babel-plugin
    
*   等等
    

为了更好的理解 AST，我们定义一个场景，然后实战一下。

场景：把 import 转换成 require, 类似于 babel 的转换

目标：通过 AST 转换，把语句

```
import ajax from 'axios'
```

转为  

```
var ajax = require('axios')
```

要达到这个效果，首先我们要写一个 babel-plugin。先上代码  

babelPlugin.js 代码如下：

```
const t = require('@babel/types');


module.exports = function babelPlugin(babel) {


  function RequireTranslator(path){


    var node = path.node
    var specifiers = node.specifiers


    //获取变量名称
    var varName = specifiers[0].local.name;
    //获取资源地址
    var source = t.StringLiteral(path.node.source.value)
    var local = t.identifier(varName)
    var callee = t.identifier('require')
    var varExpression = t.callExpression(callee,[source])
    var declarator = t.variableDeclarator(local, varExpression)
    //创建新节点
    var newNode = t.variableDeclaration("var", [declarator])
    //节点替换
    path.replaceWith(newNode)


  }


  return {
    visitor: {
      ImportDeclaration(path) {
        RequireTranslator.call(this,path)      
      }
    }
  };
};
```

测试代码：

```
const babel = require('@babel/core');
const babelPlugin = require('./babelPlugin')


let codeString = `
import ajax from 'axios'
`;
const plugins = [babelPlugin]
const {code} = babel.transform(codeString,{plugins:plugins});
console.dir(code)
```

输出结果：

```
'var ajax = require("axios");'
```

**目标达成！**

babel-plugin

在 babel 的官网有开发文档，这里只是简单的描述一下注意要点：

*   插件要求返回一个 visitor 对象。
    
*   可以拦截所有的节点，函数名称就是节点类型，入参是 path，可以通过 path.node 来获取当前节点
    
*   @babel/types 提供了大量节点操作的 API，同样可以在官网看的详细的说明
    

transform

这里的代码大家是不是看着很熟悉。没错，就是. babelrc 里的配置。我们开发的插件，配置到. babelrc 的 plugins 里，就可以全局运行了。

**写在最后**

JS 的 AST，给我们提供了实现各种可能得机会。我们可以自定义一个语法，可以将组件的按需引入过程简化等等。同时不仅仅是 JS，CSS，HTML，SQL 都可以在 ast 语法级别去进行一些有趣的操作。该篇文章只是带大家简单入门。写在最后：前端不仅仅是 UI，可玩的东西还有很多

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持