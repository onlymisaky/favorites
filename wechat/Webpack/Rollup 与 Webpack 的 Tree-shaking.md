> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/R68sDHMZiizYGX2m1qdHTw)

👆  这是第 166 篇不掺水的原创，想要了解更多，请戳下方卡片关注我们吧～

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIDRUia6xZyQhICQhgxoKbicOhw7vmRSTIyDgLPBbIeoWqDYdFglkLNic4CTZTfC6CJeVzCleE8T5jgsQ/640?wx_fmt=png)

> Rollup 与 Webpack 的 Tree-shaking
> 
> http://zoo.zhengcaiyun.cn/blog/article/tree-shaking

Rollup 和 Webpack 是目前项目中使用较为广泛的两种打包工具，去年发布的 Vite 中打包所依赖的也是 Rollup；在对界面加载效率要求越来越高的今天，打包工具最终产出的包体积也影响着开发人员对工具的选择，所以对 Tree-shaking 的支持程度和配置的便捷性、有效性就尤为重要了。本文就来简单分析下两者 Tree-shaking 的流程和效果差异。

#### Tree-shaking 的目的

Tree-shaking 的目标只有一个，去除无用代码，缩小最终的包体积，至于什么算是无用代码呢？主要分为三类：

1.  代码不会被执行，不可到达
    
2.  代码执行的结果不会被用到
    
3.  代码只会影响死变量（只写不读） Tree-shaking 的目的就是将这三类代码在最终包中剔除，做到按需引入。
    

#### 为什么 Tree-shaking 需要依赖 ES6 module

ES6 module 特点：

*   只能作为模块顶层的语句出现
    
*   import 的模块名只能是字符串常量
    
*   import 之后是不可修改的 例如，在使用 CommonJS 时，_必须导入完整的工具 (tool) 或库 (library) 对象_，且可带有条件判断来决定是否导入。
    

```
// 使用 CommonJS 导入完整的 utils 对象
if (hasRequest) {
  const utils = require( 'utils' );
}
```

但是在使用 ES6 模块时，无需导入整个 `utils` 对象，我们可以只导入我们所需使用的 `request` 函数，但此处的 import 是不能在任何条件语句下进行的，否则就会报错。

```
// 使用 ES6 import 语句导入 request 函数
import { request } from 'utils';
```

ES6 模块依赖关系是确定的，和运行时的状态无关，因此可以进行可靠的静态分析，这就是 Tree-shaking 的基础。

静态分析就是不执行代码，直接对代码进行分析；在 ES6 之前的模块化，比如上面提到的 CommonJS ，我们可以动态 require 一个模块，只有执行后才知道引用的什么模块，这就使得我们不能直接静态的进行分析。

### Wepack5.x Tree-shaking 机制

Webpack 2 正式版本内置支持 ES2015 模块（也叫做 _harmony modules_）和未使用模块检测能力。Webpack 4 正式版本扩展了此检测能力，通过 `package.json` 的  `"sideEffects"`  属性作为标记，向 compiler 提供提示，表明项目中的哪些文件是 "pure (纯正 ES2015 模块)"，由此可以安全地删除文件中未使用的部分。Webpack 5 中内置了 terser-webpack-plugin 插件用于 JS 代码压缩，相较于 Webpack 4 来说，无需再额外下载安装，但如果开发者需要增加自定义配置项，那还是需要安装。

Wepack 自身在编译过程中，会根据模块的 `import` 与 `export` 依赖分析对代码块进行打标。

```
/**   * @param {Context} context context   * @returns {string|Source} the source code that will be included as initialization code   */  getContent({ runtimeTemplate, runtimeRequirements }) {    runtimeRequirements.add(RuntimeGlobals.exports);    runtimeRequirements.add(RuntimeGlobals.definePropertyGetters);    // 未使用的模块, 在代码块前增加 unused harmony exports 注释标记    const unusedPart =      this.unusedExports.size > 1        ? `/* unused harmony exports ${joinIterableWithComma(            this.unusedExports          )} */\n`        : this.unusedExports.size > 0        ? `/* unused harmony export ${first(this.unusedExports)} */\n`        : "";    const definitions = [];    const orderedExportMap = Array.from(this.exportMap).sort(([a], [b]) =>      a < b ? -1 : 1    );    // 对 harmony export 进行打标    for (const [key, value] of orderedExportMap) {      definitions.push(        `\n/* harmony export */   ${JSON.stringify(          key        )}: ${runtimeTemplate.returningFunction(value)}`      );    }        // 对 harmony export 进行打标    const definePart =      this.exportMap.size > 0        ? `/* harmony export */ ${RuntimeGlobals.definePropertyGetters}(${            this.exportsArgument          }, {${definitions.join(",")}\n/* harmony export */ });\n`        : "";    return `${definePart}${unusedPart}`;  }
```

上面是从 Webpack 中截取的打标代码，可以看到主要会有两类标记，`harmony export` 和 `unused harmony export` 分别代表了有用与无用。标记完成后打包时 Teser 会将无用的模块去除。

### Rollup Tree-shaking 机制

以下是 `rollup 2.77.2` 版本的 package.json 文件，我们可以看下它的主要依赖；

```
{
  "name": "rollup",
  "version": "2.77.2",
  "description": "Next-generation ES module bundler",
  "main": "dist/rollup.js",
  "module": "dist/es/rollup.js",
  "typings": "dist/rollup.d.ts",
  "bin": {
    "rollup": "dist/bin/rollup"
  },
  "devDependencies": {
    "@rollup/plugin-alias": "^3.1.9",
    "@rollup/plugin-buble": "^0.21.3",
    "@rollup/plugin-commonjs": "^22.0.1",
    "@rollup/plugin-json": "^4.1.0",
    "@rollup/plugin-node-resolve": "^13.3.0",
    "@rollup/plugin-replace": "^4.0.0",
    "@rollup/plugin-typescript": "^8.3.3",
    "@rollup/pluginutils": "^4.2.1",
    "acorn": "^8.7.1", // 生成 AST 语法树
    "acorn-jsx": "^5.3.2", // 针对 jsx 语法分析
    "acorn-walk": "^8.2.0", // 递归生成对象
    "magic-string": "^0.26.2", // 语句的替换
    ......,
  },
......
}
```

想要详细了解 Acorn：A tiny, fast JavaScript parser, written completely in JavaScript. 可查看 (https://github.com/acornjs/acorn)，Magic-string，可查看 (https://github.com/rich-harris/magic-string#readme) 。rollup 源码中各个模块的执行顺序大致如下图，这也基本表明了它的分析流程。

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIDRUia6xZyQhICQhgxoKbicOhjKdtABOySVia8PiaVjD1UV11l4nLIzXKdfZcibbc021QbvbNjIuWbV2mA/640?wx_fmt=png)

与 Webpack 不同的是，Rollup 不仅仅针对模块进行依赖分析，它的分析流程如下：

1.  从入口文件开始，组织依赖关系，并按文件生成 Module
    
2.  生成抽象语法树（Acorn），建立语句间的关联关系
    
3.  为每个节点打标，标记是否被使用
    
4.  生成代码（MagicString+ position）去除无用代码
    

#### Rollup 的优势

1.  它支持导出 ES 模块的包。
    
2.  它支持程序流分析，能更加正确的判断项目本身的代码是否有副作用。
    

### 两个 Case

1.  案例 1：**Import  但未调用，不可消除**
    

```
import pkgjson from '../package.json';

export function getMeta (version: string) {
  return {
    lver: version || pkgjson.version,
  }
}
```

编译后整个 package.json 都被打了进来，代码块如下：

```
var name = "@zcy/xxxxx-sdk";var version$1 = "0.0.1-beta";var description = "";var main = "lib/index.es.js";var module$1 = "lib/index.cjs.js";var browser = "lib/index.umd.js";var types = "lib/index.d.ts";var scripts = {  test: "jest --color  --coverage=true",  doc: "rm -rf doc && typedoc --out doc ./src",  .....};var repository = {  type: "git",  url: "......"};var author = "";var license = "ISC";var devDependencies = {  "@babel/core": "^7.15.5",  "@babel/preset-env": "^7.15.4",  "@babel/runtime-corejs3": "^7.11.2",  "@types/jest": "^24.9.1",  "@typescript-eslint/eslint-plugin": "^2.34.0",  "@typescript-eslint/parser": "^2.34.0",  "babel-loader": "^8.2.2",  eslint: "^6.8.0",  "eslint-config-alloy": "^3.7.2",  jest: "^24.9.0",  "lodash.camelcase": "^4.3.0",  path: "^0.12.7",  prettier: "^1.19.1",  rollup: "^1.32.1",  ....  };var dependencies = {  "@babel/plugin-transform-runtime": "^7.10.5",  "@rollup/plugin-json": "^4.1.0",  "core-js": "^3.6.5"};var sideEffects = false;var pkgjson = {  name: name,  version: version$1,  description: description,  main: main,  module: module$1,  browser: browser,  types: types,  scripts: scripts,  repository: repository,  author: author,  license: license,  devDependencies: devDependencies,  dependencies: dependencies,  sideEffects: sideEffects,};
```

未 import 的部分可消除

```
import { version } from '../package.json';

export function getMeta (ver: string) {
  return {
    lver: ver || version,
  }
}
```

编译后可以发现，version 作为一个常量被单独打包进来；代码块如下：

```
var version$1 = "0.0.1-beta";
```

2.  案例 2: **变量影响了全局变量**
    

```
window.utm = 'a.b.c';
```

即使 `utm` 没有任何地方被使用到，在编译打包的过程中，上述代码也不能被去除。因此我们可以得出结论：

1.  在 import 三方工具库、组件库时不要全量 import。
    
2.  设置或改动全局变量需谨慎。
    

#### Vue3 针对 Tree-shaking 所做的优化

在 Vue2.x 中，你一定见过以下引入方式：

```
import Vue from 'vue'Vue.nextTick(() => {  // 一些和 DOM 有关的东西})
```

很可惜的是，像 `Vue.nextTick()` 这样的全局 API 是不支持 Tree-shaking 的，因为它并没有被单独 `export`；无论 `nextTick` 方法是否被实际调用，都会被包含在最终的打包产物中。但在 Vue3，针对全局和内部 API 进行了改造。如果你想更详细的了解 Vue3.x 全局 API Tree-shaking 带来的改动，可以查看这里，里面详细列出了不再兼容的 API，以及在内部帮助器及插件中的使用变化。

有了这些能力之后，我们可以不再过于关注框架总体的体积了，因为按需打包使得我们只需要关注那些我们已经使用到的功能和代码。

#### 最终效果对比

先分别来看下两种打包工具的配置；

webpack.config.js :

```
const webpack = require('webpack');const path = require('path');// 删除 const UglifyJsPlugin = require('uglifyjs-webpack-plugin');module.exports = {  entry: path.join(__dirname, 'src/index.ts'),  output: {filename: 'webpack.bundle.js'},  module: {    rules: [      {        test: /\.(js|ts|tsx)$/,        exclude: /(node_modules|bower_components|lib)/,        use: {          loader: 'babel-loader',          options: {            presets: ['@babel/preset-env']          }        }      },      {        test: /\.tsx?$/,        use: 'ts-loader',        exclude: /(node_modules|lib)/,      },    ]  },  resolve: {    extensions: ['.tsx', '.ts', '.js'],  },  optimization: { // tree-shaking 优化配置    usedExports: true,  },  plugins: [    new webpack.optimize.ModuleConcatenationPlugin()  ]}
```

rollup.config.js :

```
import resolve from "rollup-plugin-node-resolve";import commonjs from "rollup-plugin-commonjs";import typescript from "rollup-plugin-typescript2";import babel from "rollup-plugin-babel";import json from "rollup-plugin-json";import { uglify } from 'rollup-plugin-uglify'export default {  input: "src/index.ts",  output: [    { file: "lib/index.cjs.js", format: "cjs" },  ],  treeshake: true, // treeshake 开关  plugins: [    json(),    typescript(),    resolve(),    commonjs(),    babel(      {        exclude: "node_modules/**",        runtimeHelpers: true,        sourceMap: true,        extensions: [".js", ".jsx", ".es6", ".es", ".mjs", ".ts", ".json"],      }    ),    uglify(),  ],};
```

最后来看下打包结果的对比。结果发现，本项目在配置  `sideEffects：false`  前后时长和体积没有明显变化。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">对比</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">Tree-Shaking 前体积</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">Tree-Shaking 后体积</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); min-width: 85px; text-align: left;">打包时长</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">webpack（5.52.0）</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">46kb</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">44kb</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">4.8s</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">rollup（1.32.1）</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">24kb</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">18kb</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">3.7s</td></tr></tbody></table>

另，上述打包效果中的项目是 sdk 工具包。

### 结束语

你如果想了解 Rollup 会打包更快的原因，可以查看我之前发布的文章《[Vite 特性和部分源码解析](http://mp.weixin.qq.com/s?__biz=Mzg3NTcwMTUzNA==&mid=2247486343&idx=1&sn=ad838dda9e48372b7a1952bd1ccca914&chksm=cf3c3ff6f84bb6e00da98014a00b5fbaa457685dacb0b47b2199fe6b82579ba9984d5a53ee8f&scene=21#wechat_redirect) 》(https://www.zoo.team/article/about-vite）。关于 Tree-shaking 的问题也欢迎你在下面留言讨论。

### 推荐阅读

《Rollup 源码解析》(https://juejin.cn/post/7021115814870810660)

Rollup Tree-shaking 机制 (https://www.rollupjs.com/guide/introduction#tree-shaking)

看完两件事
-----

如果你觉得这篇内容对你挺有启发，我想邀请你帮我两件小事

1. 点个「**在看**」，让更多人也能看到这篇内容（点了「**在看**」，bug -1 😊）

2. 关注公众号「**政采云前端团队**」，持续为你推送精选好文

招贤纳士
----

政采云前端团队（ZooTeam），一个年轻富有激情和创造力的前端团队，隶属于政采云产品研发部，Base 在风景如画的杭州。团队现有 90 余个前端小伙伴，平均年龄 27 岁，近 3 成是全栈工程师，妥妥的青年风暴团。成员构成既有来自于阿里、网易的 “老” 兵，也有浙大、中科大、杭电等校的应届新人。团队在日常的业务对接之外，还在物料体系、工程平台、搭建平台、性能体验、云端应用、数据分析及可视化等方向进行技术探索和实战，推动并落地了一系列的内部技术产品，持续探索前端技术体系的新边界。

如果你想改变一直被事折腾，希望开始能折腾事；如果你想改变一直被告诫需要多些想法，却无从破局；如果你想改变你有能力去做成那个结果，却不需要你；如果你想改变你想做成的事需要一个团队去支撑，但没你带人的位置；如果你想改变既定的节奏，将会是 “5 年工作时间 3 年工作经验”；如果你想改变本来悟性不错，但总是有那一层窗户纸的模糊… 如果你相信相信的力量，相信平凡人能成就非凡事，相信能遇到更好的自己。如果你希望参与到随着业务腾飞的过程，亲手推动一个有着深入的业务理解、完善的技术体系、技术创造价值、影响力外溢的前端团队的成长历程，我觉得我们该聊聊。任何时间，等着你写点什么，发给 `ZooTeam@cai-inc.com`

![](https://mmbiz.qpic.cn/mmbiz_jpg/vzEib9IRhZD7b2jpsibTsaZxWjfhyfqIpeMmOsdx6heH7KYxYXS1c6eQ30TrnyLyRa0SSs74NUM7BNTK8cu5XoibQ/640?wx_fmt=jpeg)