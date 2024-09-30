> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MfcOSadSQ0-b0JE623w4ug)

作者：来自 vivo 互联网大前端团队 - Wei Xing

在研发项目过程中，我们经常会遇到技术架构迭代更新的需求，通过技术的迭代更新，让项目从新的技术特性中受益，但由于很多新的技术迭代版本并不能完全向下兼容，包含了很多非兼容性的改变（Breaking Changes），因此我们需要设计一款工具，帮助我们完成大规模代码自动迁移问题。本文简单阐述了基于 AST 的代码迁移概念和大致流程，并通过代码案例带大家了解到了其中的处理细节。

一、背景介绍

在研发项目过程中，我们经常会遇到技术架构迭代更新的需求，通过技术的迭代更新，让项目从新的技术特性中受益。例如将 Vue 2 迁移至 Vue 3、Webpack 4 升级 Webpack 5、构建工具迁移至 Vite 等，这些技术架构的升级能让项目持续受益，获得诸如可维护性、性能、扩展性、编译速度、可读性等等方面的提升，适时的对项目进行技术架构更新是很有必要的。

那既然新特性这么好，有人会说那当然要与时俱进，随时更新了。

但问题在于很多新的技术迭代版本并不能完全向下兼容，包含了很多非兼容性的改变（Breaking Changes），并不是简单升个版本就行了，通常还需要投入不少的人力和学习成本。例如 Vue 3 只能兼容 80% 的 Vue 2 代码，对于一些新特性、新语法糖，开发者只能参考官方提供的迁移文档，手动完成迁移。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/4g5IMGibSxt7j1G1GtTiaeqeBaXLic9CT5b0QlgYSwv9hiactEpWDX44JskKCicGTqXwaRiadlE39v2vmeEynuicsicx6A/640?wx_fmt=png&from=appmsg)

（图片来源：[freecodecamp](https://www.freecodecamp.org/news/content/images/size/w2000/2021/06/Cover_migration_vue_2_3.jpg)）

1.1 Vue 3 代码迁移案例

来看一个 Vue 3 的代码迁移案例，在 Vue 2 和 Vue 3 中声明一个全局指令（Directive）的差异：

**（1）Vue 2：允许直接在 Vue 原型上注册全局指令。而在 Vue 3 中，为了避免多个 Vue 实例产生指令混淆，已经不再支持该写法。**

```
import Vue from 'vue'
 
Vue.directive('focus', {
  inserted: (el) => el.focus()
})
```

**（2）Vue 3：建议通过 createApp 创建 Vue 实例，并直接在实例上注册全局指令。就像这样：  
**

```
import { createApp } from 'vue'
 
const app = createApp({})
 
app.directive('focus', {
  inserted: (el) => el.focus() 
})
```

以上是一个大家熟知的 Vue 3 迁移案例，看似简单，动几行代码即可。但当我们的项目规模足够大，或者有大量项目都需要类似代码迁移时，工作量会变得巨大，并且很难规避手动迁移的带来的风险。

因此，一般针对大规模的项目迁移，最好的方式还是写个脚手架工具，协助我们完成自动化迁移。既能提高效率，又能降低人工迁移的风险。

1.2 本文的代码迁移背景

同样地，我在项目中也遇到了相同的技术架构升级难题。简单来说，我需要将基于 Vue 2 的项目迁移到一个我司内部自研的技术栈，这个技术栈的语法结构和 Vue 2 相似，但由于底层的技术原因，有一部分语法上的差异，需要手动去迁移改造兼容（类似 Vue 2 升级至 Vue 3 的过程）。

除了和迁移 Vue 3 一样需要针对 JavaScript、Template 模板做迁移处理之外，我还需要额外去单独处理 CSS、Less、SCSS 等样式文件。

所以，我实现了一个自动化迁移脚手架工具，来协助完成代码的迁移工作，减少人工迁移带来的低效和风险问题。

二、代码迁移思路

刚刚提到我们需要设计一个脚手架来帮助我们完成自动化的代码迁移，那脚手架该如何设计呢？

首先，代码迁移思路可以简单概括为：对原代码做静态代码分析，并按一定规则替换为新代码。那最直观的办法就是利用正则表达式来匹配和替换代码，所以我也做了这样的尝试。

2.1 思路一：利用正则表达式匹配规则和替换代码

例如，将下述代码：

```
import { toast } from '@vivo/v-jsbridge'
```

（左右滑动查看完整代码）

按规则替换为：

```
import { toast } from '@webf/webf-vue-render'
```

（左右滑动查看完整代码）

这看起来很简单，似乎用正则匹配即可完成，像这样：

```
const regx = /\@vivo\/v\-jsbridge/gi
 
const target = '@webf/webf-vue-render'
 
sourceCode.replace(regx, target)
```

（左右滑动查看完整代码）

但在实操过程中，发现正则表达式实在太局限，有几个核心问题：

*   正则表达式完全基于字符串匹配，对原代码格式的统一性要求很高。空格、换行、单双引号等格式差异都可能引起正则匹配错误；
    
*   面对复杂的匹配场景，正则表达式很难写、很晦涩，容易误匹配、误处理；
    
*   处理样式文件时，需要兼容 CSS / Less / SCSS / Sass 等语法差异，工作量倍增。
    

简单举个例子，当我需要匹配 import {toast} from '@vivo/v-jsbridge'  字符串时。针对单双引号、空格、分号等细节处理上需要更仔细，稍有不慎就会忽略一些特殊场景，结果就是匹配失败，造成隐蔽的迁移问题。  

```
import { toast } from '@vivo/v-jsbridge'  // 单引号

import { toast } from "@vivo/v-jsbridge"  // 双引号

import { toast } from "@vivo/v-jsbridge";  // 双引号 + 分号

import {toast} from "@vivo/v-jsbridge";  // 无空格
```

（左右滑动查看完整代码）

所以，用简单的正则匹配规则是无法帮助我们完成大规模的代码迁移和重构的，我们需要更好的方法：基于 AST 的代码迁移。

2.2 思路二：基于 AST（抽象语法树）的代码迁移

在了解到正则匹配规则的局限性后，我把目光锁定到了基于 AST 的代码迁移上。

那么什么是基于 AST 的代码迁移呢？

2.2.1 Babel 的编译过程

如果你了解过 Babel 的代码编译原理，应该对 AST 代码迁移不陌生。我们知道 Babel 的编译过程大致分为三个步骤：

*   解析：将源代码解析为 AST（抽象语法树）；  
    
*   变换：对 AST 进行变换；  
    
*   再建：根据变换后的 AST 重新构建生成新的代码。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/4g5IMGibSxt7j1G1GtTiaeqeBaXLic9CT5buRCMwFyWHlD49Qf9MKCkOics6y7clfH8Q6pxYNN5401lCzRqkXdusRA/640?wx_fmt=png&from=appmsg)

（图片来源：[Luminosity Blog](https://zhang.beer/vuepress/blog/vue/gogocode.html) ）

举个例子，Babel 将一个 ES6 语法转换为 ES5 语法的过程如下：  

**（1）输入一个简单的 sayHello 箭头函数方法源码：**

```
const sayHello = () => {
    console.log('hello')
}
```

**（2）经过 Babel 解析为 AST（可以看到 AST 是一串由 JSON 描述的语法树），并对 AST 进行规则变换：**  

*   将 type 字段由 ArrowFunctionExpression 转换为 FunctionExpression
    
*   将 kind 字段由 const 转换为 var
    

```
{
  "type": "Program",
  "start": 0,
  "end": 228,
  "body": [
    {
      "type": "VariableDeclaration",
      "start": 179,
      "end": 227,
      "declarations": [
        {
          "type": "VariableDeclarator",
          "start": 185,
          "end": 227,
          "id": {
            "type": "Identifier",
            "start": 185,
            "end": 193,
            "name": "sayHello"
          },
          "init": {
-            "type": "ArrowFunctionExpression",
+            "type": "FunctionExpression",
            "start": 196,
            "end": 227,
-            "id": null,
+            "id": {
+               "type": "Identifier",
+               "start": 203,
+               "end": 211,
+               "name": "sayHello"
+            },
            "expression": false,
            "generator": false,
            "async": false,
            "params": [],
            "body": {
              "type": "BlockStatement",
              "start": 202,
              "end": 227,
              "body": [
                {
                  "type": "ExpressionStatement",
                  "start": 205,
                  "end": 225,
                  "expression": {
                    "type": "CallExpression",
                    "start": 205,
                    "end": 225,
                    "callee": {
                      "type": "MemberExpression",
                      "start": 205,
                      "end": 216,
                      "object": {
                        "type": "Identifier",
                        "start": 205,
                        "end": 212,
                        "name": "console"
                      },
                      "property": {
                        "type": "Identifier",
                        "start": 213,
                        "end": 216,
                        "name": "log"
                      },
                      "computed": false,
                      "optional": false
                    },
                    "arguments": [
                      {
                        "type": "Literal",
                        "start": 217,
                        "end": 224,
                        "value": "hello",
                        "raw": "'hello'"
                      }
                    ],
                    "optional": false
                  }
                }
              ]
            }
          }
        }
      ],
-      "kind": "const"
+      "kind": "var"
    }
  ],
  "sourceType": "module"
}
```

（左右滑动查看完整代码）

**（3）从 AST 重新构建为 ES5 语法：**

```
var sayHello = function sayHello() {
   console.log('hello');
 };
```

这样就完成了一个简单的 ES6 到 ES5 的语法转换。我们的脚手架自动代码迁移思路也是如此。

对比正则表达式匹配，基于 AST 代码迁移，有几点好处：

*   比字符串匹配更灵活、涵盖更多复杂场景。
    
*   通常 AST 代码迁移工具都提供了方便的解析、查询、匹配、替换的 API，能轻易写出高效的代码转换规则。
    
*   方便统一转换后的代码风格。
    

2.2.2 代码迁移流程设计

了解了 AST 的基本原理和可行性后，我们需要找到合适的工具库来完成代码的 AST 解析、重构、生成。考虑到项目中至少包含了这几种内容（脚本、样式、HTML）：

*   单独的 JS 文件；
    
*   单独的样式文件：CSS / Less / SCSS / Sass；
    
*   Vue 文件：包含 Template、Script、Style 三部分。
    

我们需要分别找到各类文件内容对应的解析和处理工具。

**首先，是 JS 文件的解析处理工具的选择**。在市面上比较流行的 JS AST 工具有很多种选择，例如最常见的 Babel、jscodeshift 以及 Esprima、Recast、Acorn、estraverse 等。做了一些简单调研后，发现这些工具都有一些共通的缺陷：

*   上手难度大，有较大的学习成本，要求开发者充分了解 AST 的语法规范；
    
*   语法复杂，代码量大；
    
*   代码可读性差，不利于维护。
    

以 jscodeshift 为例，如果我们需要匹配一个简单语句：item.update('price')(this, '50')，它的实现代码如下：

```
const callExpressions = root.find(j.CallExpression, {
  callee: {
    callee: {
      object: {
        name: 'item'
      },
      property: {
        name: 'update'
      }
    },
    arguments: [{
      value: 'price'
    }]
  },
  arguments: [{
    type: 'ThisExpression'
  }, {
    value: '50'
  }]
})
```

（左右滑动查看完整代码）

其实相比于原始的 Babel 语法，上述的 jscodeshift 语法已经相对简洁，但可以看出依然有较大的代码量，并且要求开发者熟练掌握 AST 的语法结构。

因此我找到了一个更简洁、更高效的 AST 工具：**GoGoCode**，它是一款阿里开源的 AST 工具，封装了类似 jQuery 的语法，简单易用。一个直观的对比就是，如果用 GoGoCode 同样实现上述的语句匹配，只需要一行代码：

```
$(code).find(`item.update('price')(this, '50')`)
```

（左右滑动查看完整代码）

它直观的语义以及简洁的代码，让我选择了它作为 JS 的 AST 解析工具。

**其次，是单独的 CSS 样式文件解析工具选择**。这个选择很轻易，直接使用通用的 PostCSS 来解析和处理样式即可。

**最后，是 Vue 文件的解析工具选择**。因为 Vue 文件是由 Template、Script、Style 三部分组成，因此需要更复杂的工具进行组合处理。很庆幸的是 GoGoCode 除了能够对单独的 JS 文件进行解析处理，它还封装了对 Vue 文件中的 Template 和 Script 部分的处理能力，因此 Vue 文件中除了 Style 样式部分，我们也可以交由 GoGo Code 来处理。那 Style 样式的部分该如何处理呢？这里我大致看了官方的 vue-loader 源码，发现源码中使用的是 @vue/component-compiler-utils 来解析 Vue 的 SFC 文件，它可以将文件中的 Style 样式内容单独抽离出来。因此思路很简单，我们利用 @vue/component-compiler-utils 将 Vue 文件中的 Style 样式内容抽离出来，再交由 PostCSS 来处理即可。

那么，简单总结下找到的几款适合的工具库：

*   GoGoCode：阿里开源的一款抽象语法树处理工具，可用于解析 JS / HTML / Vue 文件并生成抽象语法树（AST），进行代码的规则替换、重构等。封装了类似 jQuery 的语法，简单易用。
    
*   PostCSS：大家熟悉的开源 CSS 代码迁移工具，可用于解析 Less / CSS / SCSS / Sass 等样式文件并生成语法树（AST），进行代码的规则替换、重构等。
    
*   @vue/component-compiler-utils：Vue 的开源工具库，可用于解析 Vue 的 SFC 文件，我用它将 SFC 中的 Style 内容单独抽出，并配合 PostCSS 来处理样式代码的规则替换、重构。
    

有了这三个工具，我们就可以梳理出针对不同文件内容的处理思路：  

*   JS 文件：交给 GoGoCode 处理。
    
*   CSS / Less / SCSS / Sass 文件：交给 PostCSS 处理。
    
*   Vue 文件:
    

*   Template / Script 部分：交给 GoGoCode 处理。
    
*   Style 部分：先用 @vue/component-compiler-utils 解析出 Style 部分，再交给 PostCSS 处理。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/4g5IMGibSxt7j1G1GtTiaeqeBaXLic9CT5bf3FbfsZTskDChNJKxHcDFW7NuDNmUeBsj625QtY8ZCWibt5icuzZoQSg/640?wx_fmt=png&from=appmsg)

有了处理思路后，接下来进入正文，深入代码细节，详细了解代码迁移流程。

三、代码迁移流程详解

整个代码迁移流程分为几个步骤，分别是：

3.1 遍历和读取文件内容

遍历项目文件内容，根据文件类型交由不同的 transform 函数来处理：

*   transformVue：处理 Vue 文件
    
*   transformScript：处理 JS 文件
    
*   transformStyle：处理 CSS 等样式文件
    

```
const path = require('path')
const fs = require('fs')
 
const transformFiles = path => {
    const traverse = path => {
        try {
            fs.readdir(path, (err, files) => {
                files.forEach(file => {
                    const filePath = `${path}/${file}`
                    fs.stat(filePath, async function (err, stats) {
                        if (err) {
                            console.error(chalk.red(`  \n🚀 ~ ${o} Transform File Error:${err}`))
                        } else {
                            // 如果是文件则开始执行替换规则
                            if (stats.isFile()) {
                                const language = file.split('.').pop()
                                if (language === 'vue') {
                                    // 处理vue文件内容
                                    await transformVue(file, filePath, language)
                                } else if (jsSuffix.includes(language)) {
                                    // 处理JS文件内容
                                    await transformScript(file, filePath, language)
                                } else if (styleSuffix.includes(language)) {
                                    // 处理样式文件内容
                                    await transformStyle(file, filePath, language)
                                }
                            } else {
                                // 如果是目录，则继续遍历
                                traverse(`${path}/${file}`)
                            }
                        }
                    })
                })
            })
        } catch (err) {
            console.error(err)
            reject(err)
        }
    }
    traverse(path)
}
```

（左右滑动查看完整代码）

3.2 Vue 文件的代码迁移

由于单独的 JS、样式文件处理流程和 Vue 文件相似，唯一的差别在于 Vue 文件多了一层解析。所以这里以 Vue 文件为例，阐述下具体的代码迁移流程：

```
const $ = require('gogocode')
const path = require('path')
const fs = require('fs')
 
// 处理vue文件
const transformVue = async (file, path, language = 'vue') => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function read(err, code) {
            const sourceCode = code.toString()
            // 1. 利用gogocode提供的$方法，将源码转换为ast语法树
            const ast = $(sourceCode, { parseOptions: { language: 'vue' } })
 
            // 2. 处理script
            transformScript(ast)
 
            // 3. 处理template
            transformTemplate(ast)
           
            // 4. 处理styles
            transformStyles(ast)
 
            // 5. 对处理过的ast重新生成代码
           const outputCode = ast.root().generate()
 
            // 6. 重新写入文件
            fs.writeFile(path, outputCode, function (err) {
                if (err) {
                    reject(err)
                    throw err
                }
                resolve()
           })
        })
    })
}
```

（左右滑动查看完整代码）

可以看到，代码中的 Vue 文件处理流程主要如下：

1.  生成 AST 语法树：利用 GoGoCode 提供的 $ 方法，将源码转换为 Ast 语法树，然后将 Ast 语法树交由不同的处理器来完成语法的匹配和转换。  
    
2.  处理 JavaScript：调用 transformScript 处理 JavaScript 部分。
    
3.  处理 template：调用 transformTemplate 处理 template（HTML）部分。
    
4.  处理 Styles：调用 transformStyles 处理样式部分。
    
5.  对处理过的 Ast 重新生成代码：调用 GoGoCode 提供的 ast.root().generate() 方法，可以由 Ast 重新生成目标代码。
    
6.  重新写入文件：将生成的目标代码重新写入文件。
    

这样一来，一个 Vue 文件的代码迁移就结束了。接下来看看针对不同的内容 JavaScript、HTML、Style，需要如何处理。

3.3 处理 JavaScript 脚本

处理 JavaScript 脚本时，主要是依赖 GoGoCode 提供的一些语法进行代码迁移：

*   首先，利用 ast.find('<script></script>') 解析并找到 Vue 文件中的 JavaScript 脚本部分。
    
*   其次，利用 replace 等方法对原代码进行一个匹配和替换。
    
*   最后，返回处理后的 Ast。
    

下面是一个简单的代码替换案例，主要目的是将一个 import 语句替换引用包的来源。将

@vivo/v-jsbridge 替换为 @webf/webf-vue-render/modules/jsb。

```
// 转换前
import { call } from '@vivo/v-jsbridge'
 
// 转换后
import { call } from '@webf/webf-vue-render/modules/jsb'
```

（左右滑动查看完整代码）

```
const transformScript = (ast) => {
    const script = ast.find('<script></script>')
    // 利用replace方法替换代码
    script.replace(
        `import {$$$} from "@vivo/v-jsbridge"`,
        `import {$$$} from "@webf/webf-vue-render/modules/jsb"`
    )
    return ast
}
```

（左右滑动查看完整代码）

除了 replace 之外，还有一些别的语法也经常用到，例如：

*   find（查找代码）
    
*   has（判断是否包含代码）
    
*   append（在后面插入代码）
    
*   prepend（在前面插入代码）
    
*   remove（删除代码）等。
    

只要简单熟悉下 GoGoCode 的语法，就能很快写出一些转换规则（相比于正则表达式，效率高很多）。

3.4 处理 Template 模板

处理 Template 模板时也是类似，主要依赖 GoGoCode 提供的 API：

*   首先，利用 ast.find('<template></template>') 解析并找到 Vue 文件中的 Template（HTML）部分。
    
*   其次，利用 replace 等方法对原代码进行一个匹配和替换。
    
*   最后，返回处理后的 Ast 。
    

下面是简单的 Template 标签替换案例，将带有 @change 属性的 div 标签，替换为带有 :onChange 属性的 span 标签。

```
// 转换前
<div @change="onChange"></div>
 
// 转换后
<span :onChange="onChange"></div>
```

（左右滑动查看完整代码）

```
const transformTemplate = (ast) => {
    const template = ast.find('<template></template>')
    const tagName = 'div'
    const targetTagName = 'span'
    // 利用replace方法替换代码，将div标签替换为span标签
    template
        .replace(
            `<${tagName} @change="$_$" $$$1>$$$0</${tagName}>`,
            `<${targetTagName} :onChange="$_$" $$$1>$$$0</${targetTagName}>`
        )
    return ast
}
```

（左右滑动查看完整代码）

值得一提的是，GoGoCode 提供了 $_$、$$$1 这类通配符，让我们能对 DOM 结构进行更好的规则匹配，高效地写出匹配和转换规则。

3.5 处理 Style 样式

最后是处理 Style 样式部分，这部分和处理 JavaScript、Template 有些不同，由于 GoGoCode 暂时没有提供针对 Style 样式的处理方法。所以我们需要额外借用两个工具，分别是：

*   @vue/component-compiler-utils：解析样式代码，转成 Ast 。
    
*   PostCSS：按规则处理样式，转换成目标代码。
    

整个 Style 样式的处理流程如下（写过 PostCSS 插件的同学对这样式处理这部分应该很熟悉）：

*   获取 Styles 节点：利用 ast.rootNode.value.styles 获取 Styles 节点，一个 Vue 文件中可能包含多个 Style 代码块，对应多个 Styles 节点。
    
*   遍历 Styles 节点：
    
*   利用 @vue/component-compiler-utils 提供的 compileStyle 方法解析 Style 节点内容。
    
*    利用 postcss.process 方法，根据规则处理样式内容，生成目标代码。
    
*   返回转换后的 Ast 。
    

下面是一个简单的案例，将样式中所有的 color 属性值统一替换为 red。

```
// 转换前
<style>
  .button {
    color: blue;
  }
</style>
 
// 转换后
<style>
  .button {
    color: red;
  }
</style>
```

```
const compiler = require('@vue/component-compiler-utils')
const { parse, compileStyle } = compiler
const postcss = require('postcss')
 
// 一个简单的替换所有color属性为'red'的postcss插件
const colorPlugin = (opts = {}) => {
    return {
        postcssPlugin: 'postcss-color',
        Once(root, { result }) {
            root.walkDecls(node => {
                // 找到所有prop为color的节点，将节点的值设置为red
                if (node.prop === 'color') {
                    node.value = 'red'
                }
            })
        }
    }
}
colorPlugin.postcss = true
 
const transformStyles = (ast) => {
    // 获取styles节点（一个vue文件中可能包含多个style代码块，对应多个styles节点）
    const styles = ast.rootNode.value.styles
 
    // 遍历所有styles节点
    styles.forEach((style, index) => {
        let content = style.content
        // 获取文件的后缀：less / sass / scss / css等
        const lang = style.lang || 'css'
 
        // 利用@vue/component-compiler-utils提供的compileStyle方法解析style内容
        const result = compileStyle({
            source: content,
            scoped: false
        })
 
        // 交由postcss处理样式，传入刚刚声明的colorPlugin插件
        const res = postcss([colorPlugin]).process(result.code, { from: path, syntax: parsers[lang] })
 
        style.content = res.css
    })
    return ast
}
```

（左右滑动查看完整代码）

到此，整个代码迁移流程就完成了。

【源码 DEMO 可参考】[https://github.com/vivo/BlueSnippets/tree/main/demos/ast-migration](https://github.com/vivo/BlueSnippets/tree/main/demos/ast-migration)

四、总结

本文简单阐述了基于 AST 的代码迁移概念和大致流程，并通过代码案例带大家了解到了其中的处理细节。梳理下整个代码迁移处理流程：

*   遍历和读取文件内容。
    
*   将内容分类，针对不同文件内容，采用不同的处理器。
    
*   JavaScript 脚本直接交由 GoGoCode 处理。
    
*   样式文件直接交由 PostCSS 处理。
    
*   针对 Vue 文件，通过解析，拆分成 Template、JavaScript、Style 样式三部分，再进行分别处理。
    
*   处理完成后，基于转换后的 Ast 生成目标代码并重新写入文件，完成代码迁移。
    

整个处理流程还是相对简单的，只需要掌握 AST 代码转换的基本概念，对 GoGoCode、PostCSS、

@vue/component-compiler-utils 这些工具的基本使用有一定的了解，就可以进行一个自动化迁移工具的开发了。

最后，需要额外提醒大家的一点是，在设计代码匹配和转换规则时，需要注意边界场景，避免产生错误的代码转换，从而造成潜在 bug。为了规避代码转换异常，建议大家针对每个转换规则编写充分的测试用例，以保障转换规则的正确性。

如果大家有类似的需求，也可以参照本文进行工具设计和实现。

END

猜你喜欢

1. [前端生成海报图技术选型与问题解决](http://mp.weixin.qq.com/s?__biz=MzI4NjY4MTU5Nw==&mid=2247498865&idx=1&sn=b7ae1c85ad5a244b5993b8021edb3f20&chksm=ebdb8ce3dcac05f510a30311151c0bc48caf78c323db37cb1461611b034ff38cfe6dec08cb72&scene=21#wechat_redirect)

2. [基于 Three.js 的 3D 模型加载优化](http://mp.weixin.qq.com/s?__biz=MzI4NjY4MTU5Nw==&mid=2247498974&idx=1&sn=5566f2e0574116fa3e528985451ccb60&chksm=ebdb8c4cdcac055a23c40eda0115eab0b3120d4bd48394ebeae8c5476880d6412736897a1cc6&scene=21#wechat_redirect)