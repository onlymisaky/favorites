> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mDFesxrKUWVXU9Os4zRRRQ)

> 此文档翻译自 **https://github.com/jamiebuilds/babel-handbook**，由图雀酱审验。

这个文档涵盖了所有你想知道的关于 Babel 及其相关工具使用的所有内容。

目录
==

*   引言
    
*   配置 Babel 环境
    

*   `babel-cli`
    
*   在项目内部运行 Babel CLI
    
*   `babel-register`
    
*   `babel-node`
    
*   `babel-core`
    

*   配置 Babel
    

*   `.babelrc`
    
*   `babel-preset-es2015`
    
*   `babel-preset-react`
    
*   `babel-preset-stage-x`
    

*   执行 babel 生成的代码
    

*   `babel-polyfill`
    
*   `babel-runtime`
    

*   配置 Babel (进阶版)
    

*   手动指定插件
    
*   插件选项
    
*   基于环境定制 Babel
    
*   构建自己的 Preset
    

*   Babel 和其他工具
    

*   静态分析工具
    
*   Linting
    
*   文档
    
*   框架
    

引言
--

Babel 是一个用于 JavaScript 的通用多用途编译器，使用 Babel 可以使用（或创建）下一代 的 JavaScript，以及下一代 JavaScript 工具。

作为一门语言，JavaScript 不断发展，带来了很多新的规范和建议，使用 Babel 可以让你在这些新的规范和建议全面普及之前就提前使用它们。

Babel 通过将最新标准的 JavaScript 代码编译为已经在目前可以工作的代码来实现上一段提到的内容。这个过程被称为 “**源代码到源代码**” 的编译，这也被成为 **“转换”**。

例如，Babel 可以将最新的 ES2015 的箭头函数语法从：

```
const square = n => n * n;
```

转换成下面的内容：

```
const square = function square(n) {  return n * n;};
```

然而，Babel 可以胜任更多的工作，因为 Babel 支持语法扩展，例如 React 的 JSX 语法或者静态类型检查的 Flow 语法。

更近一步，在 Babel 中一切皆插件，而每个人都可以充分利用 Babel 的强大能力来创建属于自己的插件。且 Babel 被组织成几个核心的模块，允许用户利用这些模块来构建下一代 JavaScript 工具链。

许多人也是这样去做的，Babel 的生态系统正在茁长的成长。在这本 Babel 手册中，我将讲解 Babel 内建的一些工具以及社区里的一些拥有的工具。

Babel 模块介绍
----------

因为 JavaScript 社区没有标准的构建工具，框架或平台等，Babel 官方性与其他所有的主要工具进行了集成。无论是来自 Gulp、Browserify，或者是 Ember、Meteor，亦或是 Webpack 等，无论你的启动工具是什么，Babel 都存在一些官方性的集成。

就本手册而言，我们将介绍设置 Babel 的内置方法，但是您也可以访问交互式设置页面 [1] 以了解所有集成。

> 注意：本指南将参考诸如 `node` 和 `npm` 之类的命令行工具。在继续进行任何操作之前，您应该对这些工具感到满意。

### `babel-cli`

Babel 的 CLI 是从命令行使用 Babel 编译文件的简单方法。

让我们首先在全局安装它以学习基础知识。

```
$ npm install --global babel-cli
```

我们可以像这样编译我们的第一个文件：

```
$ babel my-file.js
```

这会将编译后的输出直接转储到您的终端中。要将其写入文件，我们将指定 `--out-file` 或 `-o` 。

```
$ babel example.js --out-file compiled.js# or$ babel example.js -o compiled.js
```

如果我们想将整个目录编译成一个新目录，可以使用 `--out-dir` 或 `-d` 来完成。

```
$ babel src --out-dir lib# or$ babel src -d lib
```

### 从项目中运行 Babel CLI

虽然您可以在计算机上全局安装 Babel CLI，但最好逐个项目在本地安装它。

这有两个主要原因。

*   同一台计算机上的不同项目可能取决于 Babel 的不同版本，从而允许您一次更新一个版本。
    
*   这意味着您对工作的环境没有隐式依赖。使您的项目更加可移植且易于设置。
    

我们可以通过运行以下命令在本地安装 Babel CLI：

```
$ npm install --save-dev babel-cli
```

> 注意：由于在全局范围内运行 Babel 通常是一个坏主意，因此您可能需要通过运行以下命令来卸载全局副本：

```
$ npm uninstall --global babel-cli
```

完成安装后，您的 `package.json` 文件应如下所示：

```
{  "name": "my-project",  "version": "1.0.0",  "devDependencies": {    "babel-cli": "^6.0.0"  }}
```

现在，与其直接从命令行运行 Babel，不如将命令放入使用本地版本的 npm 脚本中。只需在您的 `package.json` 中添加一个 `“script”` 字段，然后将 `babel` 命令放入其中即可进行构建。

```
{    "name": "my-project",    "version": "1.0.0",+   "scripts": {+     "build": "babel src -d lib"+   },    "devDependencies": {      "babel-cli": "^6.0.0"    }  }
```

现在，从我们的终端我们可以运行：

```
npm run build
```

这将以与以前相同的方式运行 Babel，只是现在我们正在使用本地副本。

### `babel-register`

运行 Babel 的下一个最常见的方法是通过 `babel-register` 。通过此选项，您仅需要文件即可运行 Babel，这可能会更好地与您的设置集成。

**请注意**，这并非供生产使用。部署以这种方式编译的代码被认为是不好的做法。最好在部署之前提前进行编译。但是，这对于构建脚本或您在本地运行的其他事情非常有效。

首先让我们在项目中创建一个 `index.js` 文件。

```
console.log("Hello world!");
```

如果我们使用 `node index.js` 来运行它，那么 Babel 不会编译它。因此，我们需要先设置 `babel-register` 。

首先安装 `babel-register` 。

```
$ npm install --save-dev babel-register
```

接下来，在项目中创建一个 `register.js` 文件，并编写以下代码：

```
require("babel-register");require("./index.js");
```

这是在 Node 的模块系统中注册 Babel 并开始编译每个 `require` 的文件。

现在，我们可以使用 `node egister.js` 代替运行 `node index.js` 。

```
$ node register.js
```

注意：您不能在要编译的文件中注册 Babel。在 Babel 有机会编译文件之前，Node 正在执行文件。

```
require("babel-register");// not compiled:console.log("Hello world!");
```

### `babel-node`

如果您只是通过 `node`  CLI 运行某些代码，则集成 Babel 的最简单方法可能是使用 `babel-node`  CLI，这在很大程度上只是对 `node` CLI 的替代。

**请注意**，这并非供生产使用。部署以这种方式编译的代码被认为是不好的做法。最好在部署之前提前进行编译。但是，这对于构建脚本或您在本地运行的其他事情非常有效。

首先，请确保您已安装 `babel-cli` 。

```
$ npm install --save-dev babel-cli
```

** 注意：** 如果您想知道为什么要在本地安装此软件，请在上面的项目部分中阅读 “从项目中运行 Babel CLI”。

然后，将运行 `node` 的任何位置替换为 `babel-node` 。

如果您使用的是 npm `script` ，则只需执行以下操作：

```
{    "scripts": {-     "script-name": "node script.js"+     "script-name": "babel-node script.js"    }  }
```

否则，您将需要写出通向 `babel-node` 本身的路径。

```
- node script.js
+ ./node_modules/.bin/babel-node script.js
```

### `babel-core`

如果出于某种原因需要在代码中使用 Babel，则可以使用 `babel-core` 软件包本身。

首先安装 `babel-core` 。

```
$ npm install babel-core
```

```
var babel = require("babel-core");
```

如果您具有 JavaScript 字符串，则可以直接使用 `babel.transform` 对其进行编译。

```
babel.transform("code();", options);// => { code, map, ast }
```

如果使用文件，则可以使用异步 api：

```
babel.transformFile("filename.js", options, function(err, result) {  result; // => { code, map, ast }});
```

如果您出于任何原因已经拥有 Babel AST，则可以直接从 AST 转换。

```
babel.transformFromAst(ast, code, options);// => { code, map, ast }
```

对于上述所有方法， `options` 可以传递指南可以从这里了解 https://babeljs.io/docs/usage/api/#options[2]。

配置 Babel
--------

您现在可能已经注意到，仅运行 Babel 似乎除了将 JavaScript 文件从一个位置复制到另一个位置之外没有执行任何其他操作。

这是因为我们尚未告诉 Babel 该做什么事情。

> 由于 Babel 是通用编译器，它以多种不同的方式使用，因此默认情况下它不会执行任何操作。您必须明确告诉 Babel 它应该做什么。

您可以通过安装 **plugins** 或 **presets** （plugins 组）为 Babel 提供操作说明。

### `.babelrc`

在我们开始告诉 Babel 怎么做之前。我们需要创建一个配置文件。您需要做的就是在项目的根目录下创建一个 `.babelrc` 文件。从这样开始：

```
{  "presets": [],  "plugins": []}
```

该文件是您配置 Babel 以执行所需操作的方式。

> 注意：虽然您还可以通过其他方式将选项传递给 Babel，但 `.babelrc` 文件是约定俗成的，也是最好的方法。

### `babel-preset-es2015`

让我们首先告诉 Babel 将 ES2015（JavaScript 标准的最新版本，也称为 ES6）编译为 ES5（当今大多数 JavaScript 环境中可用的版本）。

我们将通过安装 “es2015” Babel 预设来做到这一点（当然目前浏览器支持了绝大部分 ES2015 的特性了，这里是用作演示，使用形式是一致的）：

```
$ npm install --save-dev babel-preset-es2015
```

接下来，我们将修改 `.babelrc` 以包括该预设。

```
{    "presets": [+     "es2015"    ],    "plugins": []  }
```

### `babel-preset-react`

设置 React 同样简单。只需安装预设：

```
$ npm install --save-dev babel-preset-react
```

然后将预设添加到您的 `.babelrc` 文件中：

```
{    "presets": [      "es2015",+     "react"    ],    "plugins": []  }
```

### `babel-preset-stage-x`

JavaScript 还提出了一些建议，这些建议正在通过 TC39（ECMAScript 标准背后的技术委员会）流程纳入标准。

此过程分为 5 个阶段（0-4）。随着提案获得更大的吸引力，并更有可能被采纳为标准，它们经历了各个阶段，最终在阶段 4 被接纳为标准。

这些以 babel 的形式捆绑为 4 种不同的预设：

*   `babel-preset-stage-0`
    
*   `babel-preset-stage-1`
    
*   `babel-preset-stage-2`
    
*   `babel-preset-stage-3`
    

请注意，没有阶段 4 的 `preset` ，因为它只是上面的 es2015 预设。

这些预设中的每个预设都需要用于后续阶段的预设。即 `babel-preset-stage-1` 需要 `babel-preset-stage-2` ，而 `babel-preset-stage-3`  也需要。

安装您感兴趣的 stage 很简单：

```
$ npm install --save-dev babel-preset-stage-2
```

然后，您可以将其添加到您的 `.babelrc` 配置中。

```
{    "presets": [      "es2015",      "react",+     "stage-2"    ],    "plugins": []  }
```

执行 Babel 生成的代码
--------------

目前，您已经使用 Babel 编译了代码，但这还不是故事的结局。

### `babel-polyfill`

几乎所有未来 JavaScript 语法都可以使用 Babel 进行编译，但 API 并非如此。

例如，以下代码具有需要编译的箭头函数功能：

```
function addAll() {  return Array.from(arguments).reduce((a, b) => a + b);}
```

在编译之后会变成如下这样：

```
function addAll() {  return Array.from(arguments).reduce(function(a, b) {    return a + b;  });}
```

但是，由于 `Array.from` 并非在每个 JavaScript 环境中都存在，因此在编译之后它仍然无法使用：

```
Uncaught TypeError: Array.from is not a function
```

为了解决这个问题，我们使用一种叫做 Polyfill[3] 的东西。简而言之，Polyfill 是一段代码，该代码复制当前运行时中不存在的 API，允许您在当前环境可用之前能提前使用 `Array.from` 等 API。

Babel 使用出色的 core-js[4] 作为其 polyfill，以及定制的 regenerator[5] 运行时，以使生成器和异步函数正常工作。

要包含 Babel polyfill，请首先使用 npm 安装它：

```
$ npm install --save babel-polyfill
```

然后只需将 polyfill 包含在任何需要它的文件的顶部：

```
import "babel-polyfill";
```

### `babel-runtime`

为了实现 ECMAScript 规范的详细信息，Babel 将使用 “**helper**” 方法来保持生成的代码干净。

由于这些 “helper” 方法会变得很长，而且它们被添加到每个文件的顶部，因此您可以将它们移动到 `require` 的单个 “运行时” 中。

首先安装 `babel-plugin-transform-runtime` 和 `babel-runtime` ：

```
$ npm install --save-dev babel-plugin-transform-runtime
$ npm install --save babel-runtime
```

然后更新您的 `.babelrc` ：

```
{    "plugins": [+     "transform-runtime",      "transform-es2015-classes"    ]  }
```

现在，Babel 将如下代码：

```
class Foo {  method() {}}
```

编译成这样：

```
import _classCallCheck from "babel-runtime/helpers/classCallCheck";import _createClass from "babel-runtime/helpers/createClass";let Foo = function () {  function Foo() {    _classCallCheck(this, Foo);  }  _createClass(Foo, [{    key: "method",    value: function method() {}  }]);  return Foo;}();
```

而不是将 `_classCallCheck` 和 `_createClass` helper 函数放在需要的每个文件中。

配置 Babel（进阶版）
-------------

大多数人都可以通过仅使用内置预设来使用 Babel，但是 Babel 所展现的功能远不止于此。

### 手动指定插件

Babel 预设只是预配置插件的集合，如果您想做不同的事情，可以手动指定插件。这几乎与预设完全相同。

首先安装一个插件：

```
$ npm install --save-dev babel-plugin-transform-es2015-classes
```

然后将 `plugins` 字段添加到您的 `.babelrc` 中。

```
{+   "plugins": [+     "transform-es2015-classes"+   ]  }
```

这使您可以更精确地控制正在运行的确切的 `transforms` 。

有关官方插件的完整列表，请参见 Babel 插件页面 [6]。

还请看一下社区构建的所有插件 [7]。如果您想学习如何编写自己的插件，请阅读 Babel 插件手册 [8]（图雀社区将在之后翻译这本插件手册，敬请期待~）。

### 插件选项

许多插件还具有将其配置为不同行为的 `option` 。例如，许多 `transform` 都具有 `loose` 模式，该模式会放弃某些规范行为，而倾向于使用更简单，性能更高的代码。

要将选项添加到插件，只需进行以下更改：

```
{    "plugins": [-     "transform-es2015-classes"+     ["transform-es2015-classes", { "loose": true }]    ]  }
```

### 根据环境定制 Babel

Babel 插件解决了许多不同的任务。其中许多是开发工具，可以帮助您调试代码或与工具集成。还有许多用于优化生产中代码的插件。

因此，通常需要基于环境的 Babel 配置。您可以使用 `.babelrc` 文件轻松完成此操作。

```
{    "presets": ["es2015"],    "plugins": [],+   "env": {+     "development": {+       "plugins": [...]+     },+     "production": {+       "plugins": [...]+     }    }  }
```

Babel 将根据当前环境在 `env` 内部启用配置。

当前环境将使用 `process.env.BABEL_ENV` 。当 `BABEL_ENV` 不可用时，它将回退到 `NODE_ENV` ，如果不可用，则默认为 “ `development` ”。

#### Unix

```
$ BABEL_ENV=production [COMMAND]
$ NODE_ENV=production [COMMAND]
```

#### Windows

```
$ SET BABEL_ENV=production
$ [COMMAND]
```

> 注意：`[COMMAND]` 是您用来运行 Babel 的任何东西（即 `babel` ， `babel-node` ，或者如果您正在使用 `babel-register` 钩子，则可能只是 `node` ）。

> 提示：如果要让命令在 Unix 和 Windows 跨平台上运行，请使用 cross-env[9]。

### 构建自己的预设

手动指定插件？插件选项？基于环境的设置？对于所有项目，所有这些配置似乎都需要重复很多次。

因此，我们鼓励社区创建自己的预设。这可以是您整个公司 [10] 的预设。

创建预设很容易。假设您有以下 `.babelrc` 文件：

```
{  "presets": [    "es2015",    "react"  ],  "plugins": [    "transform-flow-strip-types"  ]}
```

您需要做的就是按照命名约定 `babel-preset-*` 创建一个新项目（请对此命名空间负责！），并创建两个文件。

首先，创建一个新的 `package.json` 文件，该文件具有您的预设所需的 `dependencies` 关系。

```
{  "name": "babel-preset-my-awesome-preset",  "version": "1.0.0",  "author": "James Kyle <me@thejameskyle.com>",  "dependencies": {    "babel-preset-es2015": "^6.3.13",    "babel-preset-react": "^6.3.13",    "babel-plugin-transform-flow-strip-types": "^6.3.15"  }}
```

然后创建一个 `index.js` 文件，该文件导出 `.babelrc` 文件的内容，并用 `require` 调用替换插件 / 预设字符串。

```
module.exports = {  presets: [    require("babel-preset-es2015"),    require("babel-preset-react")  ],  plugins: [    require("babel-plugin-transform-flow-strip-types")  ]};
```

然后只需将其发布到 npm，就可以像使用任何预设一样使用它。

Babel 和其他工具结合
-------------

一旦掌握了 Babel，Babel 便会很直接地进行设置，但是使用其他工具进行设置可能非常困难。但是，我们尝试与其他项目紧密合作，以使体验尽可能轻松。

### 静态分析工具

较新的标准为语言带来了许多新语法，而静态分析工具才刚刚开始利用它。

#### Linting

ESLint 是最受欢迎的 Lint 工具之一，因此，我们维护了官方的 babel-eslint[11] 集成。首先安装 `eslint` 和 `babel-eslint` 。

```
$ npm install --save-dev eslint babel-eslint
```

接下来，在项目中创建或使用现有的 `.eslintrc` 文件，并将解析器设置为 `babel-eslint` 。

```
{+   "parser": "babel-eslint",    "rules": {      ...    }  }
```

现在将一个 `lint`  任务添加到您的 npm `package.json` 脚本中：

```
{    "name": "my-module",    "scripts": {+     "lint": "eslint my-files.js"    },    "devDependencies": {      "babel-eslint": "...",      "eslint": "..."    }  }
```

然后只需运行任务即可完成所有设置。

```
$ npm run lint
```

有关更多信息，请查阅 babel-eslint[12] 或 eslint[13] 文档。

### 文档

使用 Babel，ES2015 和 Flow，您可以推断出很多有关您的代码的信息。使用 documentation.js[14]，您可以非常轻松地生成详细的 API 文档。

Documentation.js 在后台使用 Babel 支持所有最新语法，包括 Flow 注释，以便在代码中声明类型。

### 框架

现在，所有主要的 JavaScript 框架都专注于围绕语言的未来调整其 API。因此，在工具中进行了大量工作。

框架不仅有机会使用 Babel，而且有机会以改善用户体验的方式对其进行扩展。

#### React

React 极大地改变了其 API 以使其与 ES2015 类保持一致（在此处了解更新的 API）。更进一步，React 依赖 Babel 来编译它的 JSX 语法，不赞成 Babel 来使用它自己的自定义工具。您可以按照上述说明开始设置 `babel-preset-react` 程序包。

React 社区接受了 Babel 并与之合作。社区 [15] 现在进行了许多转换。

最著名的是 `babel-plugin-react-transform` 插件，结合了许多特定于 React 的转换，可以启用热模块重装和其他调试实用程序。

### 参考资料

[1]

交互式设置页面: _https://babeljs.io/en/setup/_

[2]

https://babeljs.io/docs/usage/api/#options: _https://babeljs.io/docs/usage/api/#options_

[3]

Polyfill: _https://www.google.com/search?q=%E4%BB%80%E4%B9%88%E6%98%AF+polyfill&oq=%E4%BB%80%E4%B9%88%E6%98%AF+polyfill&aqs=chrome..69i57j0i12.3956j1j4&sourceid=chrome&ie=UTF-8_

[4]

core-js: _https://github.com/zloirock/core-js_

[5]

regenerator: _https://github.com/facebook/regenerator_

[6]

Babel 插件页面: _http://babeljs.io/docs/plugins/_

[7]

所有插件: _https://www.npmjs.com/search?q=babel-plugin_

[8]

Babel 插件手册: _https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md_

[9]

cross-env: _https://www.npmjs.com/package/cross-env_

[10]

公司: _https://github.com/cloudflare/babel-preset-cf_

[11]

babel-eslint: _https://github.com/babel/babel/tree/master/eslint/babel-eslint-parser_

[12]

babel-eslint: _https://github.com/babel/babel/tree/master/eslint/babel-eslint-parser_

[13]

eslint: _https://eslint.org/_

[14]

documentation.js: _http://documentation.js.org/_

[15]

社区: _https://www.npmjs.com/search?q=babel-plugin+react_

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 100[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 100+ 篇原创文章