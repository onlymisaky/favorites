> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/FcyWj-jItFyVi9-Fql2UWg)

第一段实习就接到了个工程化的需求 - 写插件，对我这种工程化小白来说无疑是巨大的挑战，向多位前辈请教过后，决定先从 webpack 学起，然后再到编译器 + AST，一步一步把工程化理解体系搭起来。如果觉得这篇文章对你有帮助，欢迎点赞关注😘

一、概览
----

**Babel** ：将 es6 + 的 JavaScript 代码编译成 目标环境支持的语法环境，并且对目标环境不支持的 api 自动 polyfill。编译过程主要分为三个阶段 （解析，转换，生成）

**AST**(抽象语法树): 是 `Babel`、`tsc` 等编译器 进行代码转换的核心数据结构，表示了源代码的抽象语法结构，以树状的形式表现编程语言的语法结构，每个节点都表示源代码中的一种结构。使得 `Babel` 能够理解和操作代码。

**TSC**（TypeScript Compiler）: typescript 官方的编译器，可以将 typescript 代码转换为 JavaScript 代码, 也可以像 Babel 那样对代码进行编译，同样使用了 AST 作为代码转换和优化的核心数据结构，和 babel 的区别在后面第五点有介绍～

#### 什么是 AST？为什么需要 AST？

1.  说白了就是以 JSON 形式存在的一棵树：`Babel`，`tsc`，`Vue-cli` 和 `EsLint` 等很多的工具和库的核心都是通过 AST 抽象语法树这个概念来实现对代码的检查、分析等操作的。在前端当中 AST 的使用场景非常广，比如在 `Vue.js` 当中，我们在代码中编写的 `template` 转化成 render function 的过程当中第一步就是解析模版字符串生成 AST。
    
2.  JS 的许多语法为了给开发者更好的编程体验（例如：ES6+ 新增的语法），并不适合程序的理解，所以需要把源码转化为 AST 来更适合程序分析，浏览器的编译器一般会把源码转化为 AST 来进行下一步的分析来执行其他操作。通过了解 `AST` 这个概念，对深入了解前端的一些框架和工具是很有帮助的
    

#### 了解到什么是 AST 了，再来了解一个完整的编译器整体执行过程

参考文章：前端工程化基石 -- AST 🔥[1]

我这里就不赘述了，用一张精美的图片展示： ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqDZic62FnQbIotFs9GX3icqAHH9KA56ib9fPRgiaIOTcbAOI7xGmfTOkWfTyc82cr0dwUAbz6e5jqnYQ/640?wx_fmt=other&from=appmsg)

二. 编译器 - 核心功能介绍（以 babel 为例）
---------------------------

Babel 是一个广泛使用的 JavaScript 编译器，它能够将现代 JavaScript 代码转换为向后兼容的 JavaScript 版本，以便在旧环境中运行。Babel 的核心功能之一就是它的**插件系统**，允许开发者自定义代码转换的逻辑。下面，我将结合一些实际的代码示例来介绍 Babel 的插件系统（配置文件 + preset 预设）。

在 Babel 中，配置文件（如 `.babelrc` 或 `babel.config.json`）和 preset 是两个不同的概念，但它们共同作用于 Babel 的转换过程。以下是它们之间的区别和详细说明：

#### 配置文件：

用于**指定转换代码的规则、插件和预设**。开发者可以根据项目的需要创建和配置自己的 `.babelrc` 文件或者`babel.config.json`。

*   `.babelrc`：文件相对的配置文件，适用于项目的特定部分或子目录。
    
*   `babel.config.json`：项目范围的配置文件，通常放在项目的根目录下，对整个项目生效。
    

#### preset 预设：

一组**插件的集合**，开发者可以通过使用预设来快速配置 `Babel` 的转换行为，而不需要一个个手动添加和配置各个插件。例如，`@babel/preset-env` 是一个常用的 `Babel` 预设，它根据目标环境的配置，自动选择需要的转换规则，以便将较新的 `JavaScript` 语法转换为目标环境兼容的代码。

**常见预设**：

*   `@babel/preset-env`：根据目标环境和配置选项自动选择适合的插件，以实现对最新的 ECMAScript 语法和功能的转换。
    
*   `@babel/preset-react`：用于转换 JSX 语法和 React 相关的特性。
    
*   `@babel/preset-typescript`：用于转换 TypeScript 代码。
    

**与配置文件的关系**：

*   Preset 通常在配置文件中指定，作为 `presets` 数组的一个元素。
    
*   配置文件可以包含多个 preset，每个 preset 都会按照声明的顺序（但在执行时可能是逆序，取决于 Babel 的版本和具体实现）应用于代码转换过程。
    

#### 小结

*   **配置文件**：是一个包含 Babel 配置选项的 JSON（或其他格式）文件，用于指定 Babel 的行为。
    
*   **Preset**：是一组预定义的转换规则集合，用于简化配置过程并实现对特定环境或特性的转换。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqDZic62FnQbIotFs9GX3icqAbvRyXT5OF9JiaciaZuTib7blnZic6RBic7ImYS9K07VcL4ddETuTy7KWplg/640?wx_fmt=other&from=appmsg)

#### 配置文件推荐使用场景：

*   `babel.config.json` 你正在使用一个 monorepo（可以理解为在一个项目中会有多个子工程） 你希望编译 node_modules 以及 symobllinked-project 中的代码
    
*   `.babelrc` 你的配置仅适用于项目的单个部分 需要在子目录 / 文件中运行一些特定的转换，比如你可能不希望一些第三方库被转码
    
*   `package.json` 也可以直接将 `.babelrc` 中的配置信息作为 `babel` 键 (key) 添加到 `package.json` 文件中:
    

```
        {
            "name": "my-package",
            "babel": {
                "presets": ["@babel/preset-env"],
                "plugins": ["@babel/plugin-transform-runtime"]
        }


```

##### **小结：**

推荐使用`babel.config.js`来作为整个项目的 babel 配置，

*   `.babelrc` 只会影响本项目中的代码
    
*   `babel.config.js`会影响整个项目中的代码，包含 node_modules 中的代码
    

需要了解这两个配置文件更具体区别的可以看一下这篇文章 不容错过的 Babel7 知识 [2]

三、babel 的编译过程
-------------

参考文章：babel 的编译过程 [3]

babel 的编译总体流程主要分成三个阶段：

*   1 parse（解析） 阶段: 通过 @babel/parser[4] 将代码转化为 AST
    
*   2 transform（转换）阶段: 通过 @babel/traverse[5] 对 AST 进行操作
    
*   3 generate（生成）阶段: 通过 @babel/generator[6] 将 AST 转化为源代码
    

解析：parse 阶段的目的是把源代码字符串转化成机器能够理解的 AST，这个过程分成词法分析、语法分析

转换：对 parse 阶段生成的 AST 进行遍历，针对不同的节点进行操作, 在这个阶段中，我们可以通过 @babel/traverse 操作 AST

生成：将 AST 转化为源代码，并生成 source-map。在这个阶段，我们可以通过 @babel/generate 将操作后的 AST 转化为源代码

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqDZic62FnQbIotFs9GX3icqAE0d3491cvtFWcib6axGwPnmVKMnJVuzYsknJuxGABdTMomvLy6BoEWw/640?wx_fmt=other&from=appmsg)  

四、实践
----

### （1）创建一个简单的 Babel 插件

一个 Babel 插件其实就是一个函数，它接收一个包含 `types` 工具箱的对象作为参数，并返回一个对象，该对象包含一个 `visitor` 属性，`visitor` 属性是一个对象，其方法会在遍历 AST 时被调用。

这个插件将会把 ES6 的 `**` 运算符转换为 `Math.pow` 函数调用。以下是插件的代码示例：

```
    // transform-to-mathpow.js
    module.exports = function(babel) {
      const { types: t } = babel;
      return {
        name: "transform-to-mathpow",
        visitor: {
          BinaryExpression(path) {
            if (path.node.operator === "**") {
              const mathpowAstNode = t.callExpression(
                t.memberExpression(t.identifier("Math"), t.identifier("pow")),
                [path.node.left, path.node.right]
              );
              path.replaceWith(mathpowAstNode);
            }
          },
        },
      };
    };


```

在这个插件中，我们首先检查当前节点是否为二元表达式，并且操作符是否为 `**`。如果是，我们就创建一个新的 `CallExpression` 节点，表示 `Math.pow` 函数的调用，并将原来的二元表达式的左右两边作为参数传递给 `Math.pow`。最后，我们用新的 `CallExpression` 节点替换原来的二元表达式节点。

### （2）使用 babel 插件

要使用上面创建的插件，我们需要在项目的配置文件（babel.config.json 或者 .babelrc）中添加它：

```
    {
      "plugins": ["./transform-to-mathpow.js"]
    }


```

### （3）Babel 预设和插件的执行顺序

Babel 插件和预设的执行顺序是其在转换 JavaScript 代码过程中的一个重要方面

*   #### 预设（Presets）的执行顺序
    

1.  **逆序执行**：与插件不同，预设是按照配置文件中声明的顺序逆序执行的。这意味着最后一个声明的预设会首先执行，然后是倒数第二个，依此类推。
    
2.  **内部插件顺序**：每个预设内部通常包含了一系列插件。这些插件的执行顺序由预设本身定义，并且遵循预设内部的规则。
    

*   #### 插件（Plugins）的执行顺序
    

1.  在所有预设执行完之后，才轮到插件执行
    
2.  **正序执行**：Babel 会按照配置文件中插件声明的顺序，依次执行这些插件。这意味着第一个声明的插件会首先执行，然后是第二个，依此类推。
    
3.  **交替调用**：在遍历抽象语法树（AST）的过程中，Babel 会交替调用不同插件的处理函数。当遇到某个节点类型时，Babel 会依次执行所有插件中针对该节点类型的处理函数。
    
4.  **enter 和 exit 阶段**：对于每个节点，Babel 提供了两个处理时机：enter 和 exit。enter 阶段表示进入节点时执行的处理，而 exit 阶段表示离开节点时执行的处理。插件可以选择在 enter 或 exit 阶段，或者两个阶段都进行处理。
    

*   #### 示例说明
    

假设有以下 Babel 配置文件：

```
    {
      "presets": ["preset-a", "preset-b"],
      "plugins": ["plugin-1", "plugin-2"]
    }


```

在这个配置中：

1.  预设的执行顺序将是 `preset-b`（先执行），然后是 `preset-a`（后执行）。
    
2.  插件的执行顺序将是 `plugin-1`（先执行），然后是 `plugin-2`（后执行）。
    
3.  `preset-a` 和 `preset-b` 内部包含的插件将分别按照它们各自的内部规则执行。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqDZic62FnQbIotFs9GX3icqAXeR5AAqW93PtPfoicDYYl9icCNZicVib0Zu1PlEhE8pAAqyecvNLaSMKeQ/640?wx_fmt=other&from=appmsg)

五、tsc 和 babel 的区别
-----------------

其实 tsc 和 babel 在本质上是同一类东西（都是编译器），只是实现的功能不同，如：

1.  tsc 可以对代码进行类型检查，babel 不能
    
2.  tsc 可以输出类型声明文件（.d.ts），babel 不能
    
3.  tsc 可以导出非 const 的值，babel 不能
    
4.  与 tsc 相比，babel 支持更多的语言特性，兼容性更强
    
5.  babel 的编译速度要比 tsc 更快
    

虽然 babel 是一个 JavaScript 编译器，但是通过添加 preset 预设也可以对 ts 进行编译。（插件系统真的强大！）

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHqDZic62FnQbIotFs9GX3icqAzp5SsHpJxvzNVibpicpQOA7wcHSNR3P3iabreyAYHK8EOIJG4xBOtjFwA/640?wx_fmt=other&from=appmsg)

六、tsc 和 babel 怎么选？
------------------

参考文章：babel 和 tsc 的使用指南 [7]

#### 情况一

项目运行环境无需过多 polyfill 的支持，项目源代码到输出代码过程仅需 ts=>js, 无对源码的个性化处理，就选 `tsc`。

#### 情况二

项目运行环境需要适配目标浏览器 / Node.js 环境等，源代码到输出目标代码过程需要除 ts=>js 编译外的个性化处理，追求更快的编译速度，但无需类型检查和类型声明文件的输出，就使用 `babel` 编译。

#### 情况三（常见）

既要引入 polyfill 适配目标浏览器版本，又要进行类型检查并输出类型声明文件，就使用 babel 进行编译，用 tsc 进行类型检查和声明文件输出。

结尾
--

这篇文章为了帮助大家更好地学习 AST 和编译器，就只引入了适用性更广 babel 和 tsc，没有引入其他在编译速度上更有优势的（如 swc、esbuild）。如果你对这篇文章哪个地方有更深的见解，欢迎在评论区留下你的观点。

  

本文作者：Luckyfif

https://juejin.cn/post/7447444766005018624

  

  

参考资料

[1]

前端工程化基石 -- AST 🔥:https://juejin.cn/post/7155151377013047304?searchId=202310201428043E156BF285B13E15D1B6#heading-15

[2]

不容错过的 Babel7 知识:https://juejin.cn/post/6844904008679686152?searchId=202412121633591F6781D5852E05005180#heading-12

[3]

babel 的编译过程:https://juejin.cn/post/7142158641628446733?searchId=2024121221193195B4DB3EC96D2C351CEF

[4]

@babel/parser:https://babeljs.io/docs/babel-parser

[5]

@babel/traverse:https://babeljs.io/docs/babel-traverse

[6]

@babel/generator:https://babeljs.io/docs/babel-generator

[7]

babel 和 tsc 的使用指南:https://juejin.cn/post/7107870117878300680?from=search-suggest