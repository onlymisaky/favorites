> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [zhuanlan.zhihu.com](https://zhuanlan.zhihu.com/p/102250469)

> 本文将展示，如何使用 @babel/preset-typescript 和 @babel/preset-env 配置一个最小但完整的编译环境，打包工具使用 webpack@4.41.2

插件集 preset-typescript
---------------------

preset-typescript 是 Babel 提供的预设插件集之一，Babel 官方对其有一篇简短的介绍：

[https://babeljs.io/docs/en/babel-preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)

其中仅包含插件：@babel/plugin-transform-typescript

顾名思义，它的作用是转换 TypeScript 代码。

插件集 preset-env
--------------

preset-env 也是 Babel 提供的预设插件集之一，它可以将 ES6 转换为 ES5。preset-env 对于插件的选择是基于某些开源项目的，比如 [browserslist](https://github.com/browserslist/browserslist)、[compat-table](https://github.com/kangax/compat-table) 以及 [electron-to-chromium](https://github.com/Kilian/electron-to-chromium)。我们常用 `.browserslistrc` 来设置我们预想满足的目标运行环境，如：

```
> 0.25%
not dead
```

这里不详细展开 browserslist 的使用，有时间会专门写一篇文章。我现在要详细说的是 preset-env 的重要配置之一：`useBuiltIns`。

`useBuiltIns` 从其名字来说是 “使用内置”，“内置” 的什么呢？从官方看来是“polyfills”。它的取值可以是以下三种：

1） `false`：

不使用内置的 “polyfills”，这意味着你需要自行解决必要的“polyfills” 问题。

2） `"entry"`：

只在 “入口模块” 处导入 “polyfills”，你需要“根模块” 写上`import "core-js"` 和 `import "regenerator-runtime/runtime"`，babel 会自动展开全部必要模块导入`import "core-js/modules/X"`，X 是根据你配置的目标环境选择出来的 polyfill，如`es.string.pad-start`、`es.array.unscopables.flat`。注意，如果你没有写`import "core-js"`，则不会展开任何导入（import）语句。

3） `"usage"`：

你不用写什么了，babel 会根据你配置的目标环境，在你使用到一些 “ES6 特性 X” 的时候，自动补充`import "core-js/modules/X"`。我觉得这是比较棒的选择！

另一个选项 corejs，指定的是使用的 corejs 的版本，corejs 需要你自己安装：

```
npm i -S core-js@2
```

或者

```
npm i -S core-js@3
```

corejs 只在 `useBuiltIns` 取值为 `“entry”` 或 `“usage”` 的时候有用，因为 Babel 所谓内置的 polyfills 工具就是 corejs。corejs 可以配置为 `2` 或 `3`。

安装 Babel 基础
-----------

有 **5** 个包需要下载安装，它们分别是：

*   @babel/core
*   @babel/preset-env
*   @babel/preset-typescript
*   @babel/plugin-proposal-class-properties
*   @babel/plugin-proposal-object-rest-spread

其中包含了 2 个插件 _plugin-proposal-class-properties_ 和 _plugin-proposal-object-rest-spread_，分别用于转换语法特性 “类属性”、“对象展开”，二者均处于“提议” 阶段。

三步配置 babel
----------

首先，在项目的根目录创建文件 _.babelrc_，写入下面的内容：

```
{
  "presets": [
    [
      "@babel/env",
      {
        "useBuiltIns": "usage",
        "corejs": {
          "version": 3,
          "proposals": true // 使用尚在“提议”阶段特性的 polyfill
        }
      }
    ],
    "@babel/typescript"
  ],
  "plugins": [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
  ]
}
```

然后，创建 _.browserlistrc_ 文件，配置目标环境：

```
> 0.25%
not dead
```

最后，创建 _tsconfig.json_ 文件，配置 TypeScript 编译器：

```
{
  "compilerOptions": {
    // Target latest version of ECMAScript.
    "target": "esnext",
    // Search under node_modules for non-relative imports.
    "moduleResolution": "node",
    // Process & infer types from .js files.
    "allowJs": true,
    // Don't emit; allow Babel to transform files.
    "noEmit": true,
    // Enable strictest settings like strictNullChecks & noImplicitAny.
    "strict": true,
    // Disallow features that require cross-file information for emit.
    "isolatedModules": true,
    // Import non-ES modules as default imports.
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

安装 babel-cli 以执行编译
------------------

为了执行编译，你可以安装 cli：

```
npm i -D @babel/cli
```

并在_package.json_ 文件的 _scripts_ 字段中加上命令：`"compile": "babel src --out-dir lib --extensions ".ts""`。

在终端执行命令：

```
npm run compile
```

集成 webpack
----------

现在加入 webpack 打包工具，首先安装它：

```
npm i -D webpack
```

配置 webpack，在项目根目录创建 _webpack.config.js_：

```
const path = require("path")

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve("./www/dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.[chunkhash:7].js"
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "babel-loader"
      }
    ]
  }
}
```

编写执行 webpack 的脚本，创建 _scripts.js_：

```
const webpack = require("webpack")
const config = require(`./webpack.config`)

const compiler = webpack(config)
compiler.run((err, stat) => {
  if (err) throw err
  console.log(stat.toString({
    colors: true
  }))
})
```

在 package.json 文件中加入命令：`"pack": "node scripts.js"`

执行打包：`npm run pack`

区别 runtime 和 polyfills
----------------------

为了性能，Babel 官方建议使用插件 [@babel/plugin-transform-runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime)。这个插件有什么作用呢？

### 1）不使用 plugin-transform-runtime

提供如下 TypeScript 脚本内容：

```
class Staff {
  name: string = "Singhi"
  say() {
    console.log(`I am ${this.name}`)
  }
}
```

Babel 转换后的代码如下：

```
"use strict";

require("core-js/modules/es.function.name");

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Animal =
/*#__PURE__*/
function () {
  function Animal() {
    _classCallCheck(this, Animal);

    _defineProperty(this, "name", "Singhi");
  }

  _createClass(Animal, [{
    key: "say",
    value: function say() {
      console.log("I am ".concat(this.name));
    }
  }]);

  return Animal;
}();
```

可以看到 Babel 为我们插入了很多的函数：

*   _classCallCheck
*   _defineProperties
*   _createClass
*   _defineProperty

它们都是用来创建类`Animal`的，我们的类`Animal`被转换了。需要注意，Babel 会为每个模块（js 文件）写入这样一段内容，如果我们有 **1000** 个模块，那么就会有 **1000** 段这样的 “东西”，这是内容上的重复。为了复用，Babel 允许我们配置这个插件。

### 2）使用 plugin-transform-runtime

配置如下：

```
"plugins": [
  "@babel/plugin-transform-runtime",
  // ...
]
```

我们来看看配置后的输出：

```
...

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

...
```

可以看出来，Babel 从 @babel/runtime/helpers 中引入了一些工具，并经过`_interopRequireDefault`处理赋值给局部变量。这里的 @babel/runtime 包是需要额外安装的：

```
npm i -S @babel/runtime
```

@babel/runtime 为我们提供了一些额外的函数，以辅助语言的降级转换。而 plugin-transform-runtime 插件则基于 @babel/runtime 避免了内容上的重复，从而减小了程序包的体积。

与 @babel/runtime 不同，polyfills 用于提供 API，如 `Array.from`、`String.prototype.split` 等。我们可以在 preset-env 下配置 polyfills，corejs 是 Babel 使用的内置 polyfills 库。

默认，polyfills 会写入全局环境，插件 plugin-transform-runtime 提供了 “隔离” 能力，你只需修改一下默认配置：`corejs: 3` 或者 `corejs: 2`。配置项`corejs`默认为`false`，也就是不管 polyfills 那部分工作。但 corejs 被设置为`2`或`3`的时候，你需要额外安装：

```
npm i -S @babel/runtime-corejs2
```

或：

```
npm i -S @babel/runtime-corejs3
```

**并且**将 preset-env 的配置项 useBuiltIns 设置为`false`，否则就重复了。

假如我们的代码使用了`Promise`，Babel 会生成以下内容：

```
require("@babel/runtime-corejs3/core-js-stable/promise")
```

**你可能会疑惑**，当我们未安装包 _@babel/runtime_ 的时候，Babel 从哪里获得 helpers？这个问题参考我在 github 上的一个提问：

[https://github.com/babel/babel/issues/10984#issuecomment-573347933](https://github.com/babel/babel/issues/10984#issuecomment-573347933)

维护者 **nicolo-ribaudo** 给出了回答：

![](https://pic3.zhimg.com/v2-c6763a7370b7a7d4da509d586e2810e0_r.jpg)

综上
--

有了 @babel/preset-typescript ，配置 TypeScript 环境确实方便了很多。需要注意的是，@babel/preset-typescript 只做语法转换，不做类型检查，因为类型检查的任务可以交给 IDE （或者用 tsc）去做。另外，Babel 负责两件事：1）语法转换，由各种 transform 插件、helpers 完成；2）对于可 _polyfill_ 的 API 的提供，由 corejs 实现。@babel/plugin-transform-runtime 插件可用于减少生成代码的量，以及对 corejs 提供的 API 与 runtime 提供的帮助函数（helpers）进行模块隔离。

_本人博客地址：_[https://www.zhangxinghai.cn](https://www.zhangxinghai.cn)

_欢迎访问！_