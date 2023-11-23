> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qCJXhfd5ZBkpqV4bs_nY6w)

一. 介绍
=====

1.  Babel 是什么
    ---------
    

官方：Babel 是一个 JavaScript 编译器！

我：Babel 是一个源码到目标代码的转换器！

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z99HZFLMsChLaDM73kfDhc1lrUddiavgJBxdBHfkl8L2xuRbGMDibWycgKW591OH16w9pLLEovS88hA/640?wx_fmt=png)

如图可以看到， Babel 的作用就是将「源码」转换为「目标代码」，至于转换中间的过程，下文讨论。

2.  Babel 的发展历史
    -----------
    

Babel 在 4.0 版本之前叫做 "6to5"，由澳大利亚的 Sebastian (早已离开 Babel 团队，目前就职于 Facebook，依然致力于前端工具链开发中)在他的 2014 年十一月 (那是他的高中时期) 开始发布的，通过 6to5 这个名字我们就能知道，最初的 Babel 就是将 ES6 的代码转换成 ES5 的代码，2015 年与 ESNext[1] 合并并改名成 Babel。Babel 的本意是 " 巴别塔 [2]"，取自神话小说中。由 6to5 重命名为 Babel 前，6to5 已经走过了三个版本，所以改名后的 Babel 从版本 4.0 开始，此时已经能够转译 ES7 与 JSX，2015 年发布 5.0，引入了 stage，创建了 plugin system 来支持自定义转译，同年又发布 6.0 ，拆分了几个核心包，引入了 presets 和 plugin/presets options 的概念，18 年，发布了 7.0，除了性能方面的提升以外，增加了对 typescript 的支持，对安装包使用「@babel」的命名空间。

3.  Babel 的作用
    ---------
    

主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为 es5 语法，让开发者无视用户浏览器的差异性，并且能够用新的 JS 语法及特性进行开发。除此之外，Babel 能够转换 JSX 语法，并且能够支持 TypeScript 转换为 JavaScript。 总结一下：Babel 的作用如下

*   语法转换
    

*   通过 Polyfill 方式在目标环境中添加缺失的特性
    
*   源码转换
    

二. Babel7 的使用
=============

1.  配置文件
    ----
    

Babel 支持多种形式的配置文件，根据使用场景不同可以选择不同的配置文件。如果配置中需要书写 js 逻辑，可以选择「babel.config.js」或者 「.babelrc.js」；如果只是需要一个简单的 key-value 配置，那么可以选择「.babelrc」，甚至可以直接在 「package.json」 中配置。

这里给出在各种配置文件中配置 Babel 的书写形式，以 plugins 和 presets 配置为例：

```
// babel.config.jsmodule.exports = function(api) {    api.cache(true);    const plugins = ["@babel/plugin-transform-arrow-functions"];    const presets = ["@babel/preset-env"];    return {        plugins,        presets    };}
```

```
// .babelrc.jsconst plugins = ["@babel/plugin-transform-arrow-functions"];const presets = ["@babel/preset-env"];module.exports = { plugins, presets };
```

```
// .babelrc{    plugins: ["@babel/plugin-transform-arrow-functions"],    presets: ["@babel/preset-env"]}
```

```
// package.json{    "name": "my-package",    "version": "1.0.0",    // ...省略其他配置    "babel": {        "plugins": ["@babel/plugin-transform-arrow-functions"],        "presets": ["@babel/preset-env"]    }}
```

2.  小试个牛刀
    -----
    

所有 Babel 的包都发布在 npm 上，并且名称以 @babel 为前缀（自从版本 7.0 之后）, 接下来，我们一起看下 @babel/core 和 @babel/cli 这两个 npm 包。

*   @babel/core - 核心库，封装了 Babel 的核心能力
    

*   @babel/cli - 命令行工具， 提供了「babel」 这个命令
    

接下来我们试着通过 Babel 将 es6 中的「箭头函数」语法转换为 es5 中「function 函数申明」语法：

```
// 安装这两个依赖包npm install --save-dev @babel/core @babel/cli
```

```
/*    package.json 文件中配置 babel 执行命令    以下命令含义为：将 src 目录中的文件经过 babel 转换，并将转换后的文件输出到 lib 目录中*/"script": {    "compile": "babel src --out-dir lib --watch"}
```

```
//  src/index.jsconst fn = () => {    console.log('xuemingli');};
```

```
//  lib/index.jsconst fn = () => {    console.log('xuemingli');};
```

此时，我们执行 `npm run compile` 后，发现 lib/index.js 中的依然是箭头函数，说明 src/index.js 中的代码并没有没 babel 转换，为什么？请大家记住一句话：**Babel 构建在插件之上的。**默认情况下，Babel 不做任何处理，需要借助插件来完成语法的解析，转换，输出。

3.  插件
    --
    

接下来我们一起尝试使用 @babel/plugin-transform-arrow-functions 插件来将箭头函数转换成函数声明：

```
//.babelrc{    "plugins": ["@babel/plugin-transform-arrow-functions"]}
```

```
//  lib/index.jsconst fn = function () {    console.log('xuemingli');};
```

再次执行 `npm run compile` 后发现 lib/index.js 中已经是函数声明了，说明 src/index.js 中的代码被 babel 转换了。到此为止，大家可能想迫切的知道插件究竟做了什么事，别急，请大家慢慢往后看。

插件的配置形式常见有两种，分别是字符串格式与数组格式 (见下面代码)，并且可以传递参数，如果插件名称为 @babel/plugin-XXX，可以使用简写成 @babel/XXX，例如 @babel/plugin-transform-arrow-functions 便可以简写成 @babel/transform-arrow-functions。请大家再记住一句话： **插件的执行顺序是从前往后**。

```
// .babelrc/** 以下三个插件的执行顺序是：    @babel/proposal-class-properties ->    @babel/syntax-dynamic-import ->    @babel/plugin-transform-arrow-functions*/{    "plugins": [        // 同 "@babel/plugin-proposal-class-properties"        "@babel/proposal-class-properties",        // 同 ["@babel/plugin-syntax-dynamic-import"]        ["@babel/syntax-dynamic-import"],        [            "@babel/plugin-transform-arrow-functions",            {                "loose": true            }        ]    ]}
```

到此为止，我们了解了插件的使用，对于特定的 ES6+ 语法，我们需要使用特定的插件将其转换为 ES5 中的代码，设想一下，如果我们的项目中使用了大量的 ES6+ 语法，我们是不是需要一个个的配置相应的插件呢？当然不需要，那如何解决呢？有请 「预设」出场。

4.  预设
    --
    

预设是一组插件的集合。与插件类似，预设的配置形式也是字符串和数组两种 (见下面代码)，预设也可以将 @babel/preset-XXX 简写为 @babel/XXX 。**预设的执行顺序是从后往前，并且插件在预设之前执行**。

我们常见的预设有以下几种：

*   @babel/preset-env： 可以无视浏览器环境的差异而尽情地使用 ES6+ 新语法和新特性；
    

*   注：语法和特性不是一回事，语法上的迭代是让我们书写代码更加简单和方便，如展开运算符、类，结构等，因此这些语法称为语法糖；特性上的迭代是为了扩展语言的能力，如 Map、Promise 等，事实上，Babel 对新语法和新特性的处理也是不一样的，对于新语法，Babel 通过插件直接转换，而对于新特性，Babel 还需要借助 polyfill 来处理和转换。
    

*   @babe/preset-react： 可以书写 JSX 语法，将 JSX 语法转换为 JS 语法；
    
*   @babel/preset-typescript：可以使用 TypeScript 编写程序，将 TS 转换为 JS；
    

*   注：该预设只是将 TS 转为 JS，不做任何类型检查
    

*   @babel/preset-flow：可以使用 Flow 来控制类型，将 Flow 转换为 JS；
    

预设使用示例如下：

```
// .babelrc/**  以下配置中，插件比预设先执行*  预设的执行顺序为：    @babel/preset-react ->    @babel/preset-typescript ->    @babel/preset-env*/{    "plugins": [        // 同 "@babel/plugin-proposal-class-properties"        "@babel/proposal-class-properties",        // 同 ["@babel/plugin-syntax-dynamic-import"]        ["@babel/syntax-dynamic-import"],        [            "@babel/plugin-transform-arrow-functions",            {                "loose": true            }        ]    ],    "presets": [        [            "@babel/preset-env",            {                "useBuiltIns": "usage",                "corejs": {                    "version": 3,                    "proposals": true // 使用尚在提议阶段特性的 polyfill                }            }        ],        "@babel/preset-typescript",        // 同 @babel/preset-react        "@babel/react"    ]}
```

对于 @babel/preset-env ，我们通常需要设置目标浏览器环境，可以在根目录下的 .browserslistrc 文件中设置，也可以在该预设的参数选项中通过 targets(优先级最高) 或者在 package.json 中通过 browserslist 设置。如果我们不设置的话，该预设默认会将所有的 ES6+ 的新语法 (**注意：这里我说的只是新语法，不包含新特性**) 全部做转换，否则，该预设只会对目标浏览器环境不兼容的新语法做转换。我推荐设置目标浏览器环境，这样在中大型项目中可以明显缩小编译后的代码体积，因为有些新语法的转换需要引入一些额外定义的 helper 函数的，比如 class。

目标浏览器配置示例如下：

```
// .browserslistrc> 0.25%not dead
```

```
// .babelrc{    "presets": [        [            "@babel/preset-env",            {                "targets": "> 0.25%, not dead"            }        ]    ]}
```

```
// package.json{    "name": "my-package",    "version": "1.0.0",    // ...省略其他配置    "browserslist": "> 0.25%, not dead"}
```

设置不同目标浏览器环境，编译情况示例如下：

src/index.js 中的是源代码，lib/index.js 是转换后的目标代码：

```
// src/index.js// 新语法const fn = () => {  console.log('xuemingli');};const arr = ["name", "age"];const [a, b] = arr;const arr2 = [...arr, "school"];const arr3 = [["key1", "value1"], ["key2", "value2"]]class Person {  constructor(name, age) {    this.name = name;    this.age = age;  }  sayName() {    console.log(this.name);  }}const person = new Person('xuemingli', '26');person.sayName();// 新特性const isHas = [1,2,3].includes(2);const resArr = [1,[2,3]].flat();const p = new Promise((resolve, reject) => {    resolve(100);});const map = new Map(arr3);const value1 = map.get('key1');const arr4 = Object.keys({ name: 'xuemingli', age: 26 })
```

**结论 1：**通过如下转换后的目标代码可以验证：如果不设置浏览器环境的话，@babel/preset-env 会将新语法全部转换，并且对于一些特殊的新语法，如 class，还额外定义了一些 helper 函数，而新特性并没有做任何转换。

```
/*  lib/index.js  不设置目标浏览器环境*/"use strict";function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }// 新语法var fn = function fn() {  console.log('xuemingli');};var arr = ["name", "age"];var a = arr[0],    b = arr[1];var arr2 = [].concat(arr, ["school"]);var arr3 = [["key1", "value1"], ["key2", "value2"]];var Person = /*#__PURE__*/function () {  function Person(name, age) {    _classCallCheck(this, Person);    this.name = name;    this.age = age;  }  _createClass(Person, [{    key: "sayName",    value: function sayName() {      console.log(this.name);    }  }]);  return Person;}();var person = new Person('xuemingli', '26');person.sayName();// 新特性var isHas = [1, 2, 3].includes(2);var resArr = [1, [2, 3]].flat();var p = new Promise(function (resolve, reject) {  resolve(100);});var map = new Map(arr3);var value1 = map.get('key1');var arr4 = Object.keys({  name: 'xuemingli',  age: 26});
```

**结论 2：**通过如下转换后的目标代码可以验证：如果设置了目标浏览器环境，@babel/preset-env 只会对目标浏览器环境不兼容的新语法做转换。如代码所示，当前目标浏览器环境下，该预设只转换了「结构赋值」语法，而其他新语法在已经被浏览器实现了，便不需要转换了。

```
/*  lib/index.js  目标浏览器环境设置为 last 53 Chrome versions*/"use strict";// 新语法const fn = () => {  console.log('xuemingli');};const arr = ["name", "age"];const a = arr[0],      b = arr[1];const arr2 = [...arr, "school"];const arr3 = [["key1", "value1"], ["key2", "value2"]];class Person {  constructor(name, age) {    this.name = name;    this.age = age;  }  sayName() {    console.log(this.name);  }}const person = new Person('xuemingli', '26');person.sayName();// 新特性const isHas = [1, 2, 3].includes(2);const resArr = [1, [2, 3]].flat();const p = new Promise((resolve, reject) => {  resolve(100);});const map = new Map(arr3);const value1 = map.get('key1');const arr4 = Object.keys({  name: 'xuemingli',  age: 26});
```

对于新特性，@babel/preset-env 能否转换呢？答案当然是能的。但是需要通过 useBuiltIns 这个参数选项实现，值需要设置为 usage，这样的话，只会转换我们使用到的新语法和新特性 (**注意：这里既包括新语法也包括新特性**)，能够有效减小编译后的包体积，并且还要设置 `corejs: { version: 3, proposals }` 选项，因为转换新特性需要用到 polyfill，而 corejs 就是一个 polyfill 包。如果不显示指定 corejs 的版本的话，默认使用的是 version 2 ，而 version 2 已经停更，诸如一些更新的特性的 polyfill 只会更行与 version 3 里，如 Array.prototype.flat()。

示例如下：

```
// .babelrc"presets": [    [        "@babel/preset-env",        {            "useBuiltIns": "usage",            "corejs": {                "version": 3,                "proposals": true // 使用尚在提议阶段特性的 polyfill            }        }    ]]
```

```
// lib/index.js// 从 corejs 这个包里引入了 polyfill 并对新特性做了转换"use strict";require("core-js/modules/es.object.define-property.js");require("core-js/modules/es.array.concat.js");require("core-js/modules/es.array.includes.js");require("core-js/modules/es.array.flat.js");require("core-js/modules/es.array.unscopables.flat.js");require("core-js/modules/es.object.to-string.js");require("core-js/modules/es.promise.js");require("core-js/modules/es.array.iterator.js");require("core-js/modules/es.map.js");require("core-js/modules/es.string.iterator.js");require("core-js/modules/esnext.map.delete-all.js");require("core-js/modules/esnext.map.every.js");require("core-js/modules/esnext.map.filter.js");require("core-js/modules/esnext.map.find.js");require("core-js/modules/esnext.map.find-key.js");require("core-js/modules/esnext.map.includes.js");require("core-js/modules/esnext.map.key-of.js");require("core-js/modules/esnext.map.map-keys.js");require("core-js/modules/esnext.map.map-values.js");require("core-js/modules/esnext.map.merge.js");require("core-js/modules/esnext.map.reduce.js");require("core-js/modules/esnext.map.some.js");require("core-js/modules/esnext.map.update.js");require("core-js/modules/web.dom-collections.iterator.js");require("core-js/modules/es.object.keys.js");function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }// 新语法var fn = function fn() {  console.log('xuemingli');};var arr = ["name", "age"];var a = arr[0],    b = arr[1];var arr2 = [].concat(arr, ["school"]);var arr3 = [["key1", "value1"], ["key2", "value2"]];var Person = /*#__PURE__*/function () {  function Person(name, age) {    _classCallCheck(this, Person);    this.name = name;    this.age = age;  }  _createClass(Person, [{    key: "sayName",    value: function sayName() {      console.log(this.name);    }  }]);  return Person;}();var person = new Person('xuemingli', '26');person.sayName();// 新特性var isHas = [1, 2, 3].includes(2);var resArr = [1, [2, 3]].flat();var p = new Promise(function (resolve, reject) {  resolve(100);});var map = new Map(arr3);var value1 = map.get('key1');var arr4 = Object.keys({  name: 'xuemingli',  age: 26});
```

以下示例演示了使用 @babel/preset-react 、@babel/preset-typescript 以及 @babel/preset-env 来转换 src/index.tsx 中的源代码，lib/index.js 中的是转换后的目标代码：

```
// .babelrc"presets": [    [        "@babel/preset-env",        {            "useBuiltIns": "usage",            "corejs": {                "version": 3,                "proposals": true // 使用尚在提议阶段特性的 polyfill            }        }    ],    "@babel/preset-typescript", "@babel/react"]
```

```
// src/index.tsximport React, { useState } from 'react';const App: React.FC = () => {  const [value, setValue] = useState(0);  const fn = (): void => {    setValue(value => value++);  };  const arr: string[] = ["name", "age"];  const [a, b] = arr;  const arr2: string[] = [...arr, "school"];  class Person {    name: string;    age: number;    constructor(name: string, age: number) {      this.name = name;      this.age = age;    }    sayName() {      console.log(this.name);    }  }  const person = new Person('xuemingli', 26);  person.sayName();  // 新特性  const isHas: boolean = [1,2,3].includes(2);  const resArr: number[] = [1,[2,3]].flat();  const p: Promise<number> = new Promise((resolve, reject) => {      resolve(100);  });  const map: Map<string, string> = new Map();  map.set('key1', 'value1');  const arr4: string[] = Object.keys({ name: 'xuemingli', age: 26 })  return (    <div>      <div>{value}</div>      <button onClick={fn}>+</button>    </div>  )};export default App;
```

```
// lib/index.js"use strict";function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }require("core-js/modules/es.symbol.js");require("core-js/modules/es.symbol.description.js");require("core-js/modules/es.symbol.iterator.js");require("core-js/modules/es.array.slice.js");require("core-js/modules/es.array.from.js");require("core-js/modules/es.regexp.exec.js");require("core-js/modules/es.object.define-property.js");require("core-js/modules/es.weak-map.js");require("core-js/modules/esnext.weak-map.delete-all.js");require("core-js/modules/es.object.get-own-property-descriptor.js");Object.defineProperty(exports, "__esModule", {  value: true});exports.default = void 0;require("core-js/modules/es.array.concat.js");require("core-js/modules/es.array.includes.js");require("core-js/modules/es.array.flat.js");require("core-js/modules/es.array.unscopables.flat.js");require("core-js/modules/es.object.to-string.js");require("core-js/modules/es.promise.js");require("core-js/modules/es.array.iterator.js");require("core-js/modules/es.map.js");require("core-js/modules/es.string.iterator.js");require("core-js/modules/esnext.map.delete-all.js");require("core-js/modules/esnext.map.every.js");require("core-js/modules/esnext.map.filter.js");require("core-js/modules/esnext.map.find.js");require("core-js/modules/esnext.map.find-key.js");require("core-js/modules/esnext.map.includes.js");require("core-js/modules/esnext.map.key-of.js");require("core-js/modules/esnext.map.map-keys.js");require("core-js/modules/esnext.map.map-values.js");require("core-js/modules/esnext.map.merge.js");require("core-js/modules/esnext.map.reduce.js");require("core-js/modules/esnext.map.some.js");require("core-js/modules/esnext.map.update.js");require("core-js/modules/web.dom-collections.iterator.js");require("core-js/modules/es.object.keys.js");var _react = _interopRequireWildcard(require("react"));function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]( "Symbol.iterator") method."); }function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }var App = function App() {  var _useState = (0, _react.useState)(0),      _useState2 = _slicedToArray(_useState, 2),      value = _useState2[0],      setValue = _useState2[1];  var fn = function fn() {    setValue(function (value) {      return value++;    });  };  var arr = ["name", "age"];  var a = arr[0],      b = arr[1];  var arr2 = [].concat(arr, ["school"]);  var Person = /*#__PURE__*/function () {    function Person(name, age) {      _classCallCheck(this, Person);      this.name = name;      this.age = age;    }    _createClass(Person, [{      key: "sayName",      value: function sayName() {        console.log(this.name);      }    }]);    return Person;  }();  var person = new Person('xuemingli', 26);  person.sayName();  // 新特性  var isHas = [1, 2, 3].includes(2);  var resArr = [1, [2, 3]].flat();  var p = new Promise(function (resolve, reject) {    resolve(100);  });  var map = new Map();  map.set('key1', 'value1');  var arr4 = Object.keys({    name: 'xuemingli',    age: 26  });  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, value), /*#__PURE__*/_react.default.createElement("button", {    onClick: fn  }, "+"));};var _default = App;exports.default = _default;
```

到此为止，我们了解了预设的概念和使用方式。虽然 @babel/env 可以帮我们做新语法和新特性的按需转换，但是依然存在 2 个问题：

*   从 corejs 引入的 polyfill 是全局范围的，不是模块作用域返回的，可能存在污染全局变量的风险，如上例中的 `require("core-js/modules/es.promise.js")`；
    

*   对于某些新语法，如 class，会在编译后的文件中注入很多 helper 函数声明，而不是从某个地方 require 进来的函数引用，从而增大编译后的包体积；
    

能不能解决如上两个问题呢？当然能，有请 runtime 出场。

5.  runtime
    -------
    

runtime 是 babel7 提出来的概念，旨在解决如上提出的性能问题的。接下来我们实践一下 @babel/plugin-transform-runtime 插件配合 @babel/preset-env 使用，示例如下：

```
npm install --save-dev @babel/plugin-transform-runtime// @babel/runtime 是要安装到生产依赖的，因为新特性的编译需要从这个包里引用 polyfill// 不错，它就是一个封装了 corejs 的 polyfill 包npm install --save @babel/runtime
```

```
// .babelrc{  "presets": [    "@babel/env"  ],  "plugins": [    [      "@babel/plugin-transform-runtime",{          "corejs": 3      }    ]  ],}
```

```
// src/index.js// 新语法const fn = () => {  console.log('xuemingli');};const arr = ["name", "age"];const [a, b] = arr;const arr2 = [...arr, "school"];const arr3 = [["key1", "value1"], ["key2", "value2"]]class Person {  constructor(name, age) {    this.name = name;    this.age = age;  }  sayName() {    console.log(this.name);  }}const person = new Person('xuemingli', '26');person.sayName();// 新特性const isHas = [1,2,3].includes(2);const resArr = [1,[2,3]].flat();const p = new Promise((resolve, reject) => {    resolve(100);});const map = new Map(arr3);const value1 = map.get('key1');const arr4 = Object.keys({ name: 'xuemingli', age: 26 })
```

`npm run compile` 编译后，可以明显看到，引入的 polyfill 不再是全局范围内的了，而是模块作用域范围内的；并且不再是往编译文件中直接注入 helper 函数了，而是通过引用的方式，既解决了全局变量污染的问题，又减小了编译后包的体积。

```
// lib/index.js"use strict";var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));var _flat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/flat"));var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/map"));var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));var _context, _context2, _context3;// 新语法var fn = function fn() {  console.log('xuemingli');};var arr = ["name", "age"];var a = arr[0],    b = arr[1];var arr2 = (0, _concat.default)(_context = []).call(_context, arr, ["school"]);var arr3 = [["key1", "value1"], ["key2", "value2"]];var Person = /*#__PURE__*/function () {  function Person(name, age) {    (0, _classCallCheck2.default)(this, Person);    this.name = name;    this.age = age;  }  (0, _createClass2.default)(Person, [{    key: "sayName",    value: function sayName() {      console.log(this.name);    }  }]);  return Person;}();var person = new Person('xuemingli', '26');person.sayName();// 新特性var isHas = (0, _includes.default)(_context2 = [1, 2, 3]).call(_context2, 2);var resArr = (0, _flat.default)(_context3 = [1, [2, 3]]).call(_context3);var p = new _promise.default(function (resolve, reject) {  resolve(100);});var map = new _map.default(arr3);var value1 = map.get('key1');var arr4 = (0, _keys.default)({  name: 'xuemingli',  age: 26});
```

6.  结合 webpack
    ----------
    

在 webpack 中，通过 babel-loader 的方式来接入 babel 的能力，babel 配置文件与单独使用 babel 时相同。在 webpack 中使用 babel 时建议开启 babel 的缓存能力，即 cacheDirectory，统计显示，在大型项目中，构建速度可以提升 1 倍，webpack 的配置文件示例如下：

```
// webpack.config.jsconst path = require('path');module.exports = {  entry: './src/index.js',  output: {    path: path.resolve(__dirname, 'dist'),    filename: '[name].js'  },  module: {    rules: [      {        test: /\.[j,t]sx?$/,        exclude: /node_modules/,        use: {          loader: 'babel-loader?cacheDirectory'        }      }    ]  },};
```

到此为止，我们已经了解了 babel 的使用，但是 babel 的运行原理是怎么样的呢？请大家往下看。

三. 原理
=====

1.  简述
    --
    

Babel 的运行原理可以通过以下这张图来概括。整体来看，可以分为三个过程，分别是：1. 解析，2. 转换，3. 生成。而解析过程又可分为词法解析和语法解析两个过程。![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z99HZFLMsChLaDM73kfDhc1W4gDZbibiarcIUnjMqCjyPljSqTo77rfSQicCsaI33dExsyAee59ZRfwA/640?wx_fmt=png)

我先以 箭头函数 转换成 函数声明 为例，大致描述下每一个过程，然后再通过具体的代码来演示每个过程做了什么事。

*   解析：将箭头函数源代码字符串解析成箭头函数对应的抽象语法树，如图中红色框部分。
    
    ```
    /* const fn = () => { console.log('xuemingli'); }; 经过词法分析得到如下Tokens*/[  { type: 'Keyword', value: 'const' },  { type: 'Identifier', value: 'fn' },  { type: 'Punctuator', value: '=' },  { type: 'Punctuator', value: '(' },  { type: 'Punctuator', value: ')' },  { type: 'Punctuator', value: '=>' },  { type: 'Punctuator', value: '{' },  { type: 'Identifier', value: 'console' },  { type: 'Punctuator', value: '.' },  { type: 'Identifier', value: 'log' },  { type: 'Punctuator', value: '(' },  { type: 'String', value: "'xuemingli'" },  { type: 'Punctuator', value: ')' },  { type: 'Punctuator', value: ';' },  { type: 'Punctuator', value: '}' },  { type: 'Punctuator', value: ';' }]
    ```
    

*   语法分析：将词法分析得到的 Tokens 解析成箭头函数对应的 AST(抽象语法树)。从 Tokens 提供的信息来分析出代码之间的逻辑关系，这种逻辑关系抽象成树状结构，就叫做 AST，对应到数据类型来说，它就是一个 JSON 对象。大家可以在 AST 解析器 [3] 这个工具中的 JSON Tab 来查看，由于太大，我就不贴在这里了，下图展示了 AST 树状结构的样子。
    
*   词法分析： 将箭头函数源代码字符串分割成 Tokens。 Tokens 是由 JS 中的标识符、运算符、括号、数字以及字符串等等独立且有意义的最小单元组成的集合，对应到数据类型来说，它就是一个数组，数组项是包含 type 和 value 这两个属性的对象，如下所示。
    

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z99HZFLMsChLaDM73kfDhc1UxgAIRmks8q4zXGTZMd4WMJQDlHYBUWu0NcG7xYk6esASj1rkq6CgA/640?wx_fmt=gif)

*   转换：通过 @babel/transform-arrow-functions 插件操作 (包括增、删、改) 箭头函数对应的抽象语法树上的节点得到函数声明对应的抽象语法树，如图中蓝色框部分。在这里就能回答 「插件做了什么事？」这个问题了，所有的 babel 插件都是在 转换 这个过程中起作用的，都是操作源代码对应的抽象语法树上的节点来得到目标代码对应的抽象语法树。我们可以简单的把插件视为一个 visitor，可以 visit 以及 operate 抽象语法树上的任意一个节点。
    
*   生成：将函数声明对应的抽象语法树按照 JS 语法规则，拼接成函数声明代码字符串，如图中黄色框部分。
    

2.  代码实现
    ----
    

接下来我们通过实现一个最简易的编译器来将 (add 2 (subtract 4 2)) 这种语法转换成我们熟悉的 add(2, subtract(4, 2)) 这种语法。最终我们提供如下方法：

```
// 词法分析器function tokenizer(sourceCode) {    const tokens = [];    ...    return tokens;}// 语法解析器function parser(tokens) {    const ast = {};    ...    return ast;}// 遍历器function traverse(ast, visitor) {    /*    将源代码对应的ast通过visitor的遍历和操作    得到目标代码对应的newAst    */}// 转换器function transformer(ast) {    const newAst = {};    traverse(ast, visitor);    return newAst;}// 生成器function codeGenerator(newAst) {    let targetCode = '';    ...    return targetCode;}// 编译器function compiler(sourceCode) {  const tokens = tokenizer(sourceCode);  const ast    = parser(tokens);  const newAst = transformer(ast);  const targetCode = codeGenerator(newAst);  return targetCode;}module.exports = {  tokenizer,  parser,  traverse,  transformer,  codeGenerator,  compiler,};
```

事实上，我们实现的这个简易编译器的功能和组织结构与 Babel 生态系统中的功能和组织结构是一一对应的，如下图。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z99HZFLMsChLaDM73kfDhc14YGse3ic7G54xjbcpIna6tWibUa57GwNJUOvHjmVOZoNEKwVTUjo5GNA/640?wx_fmt=png)

### 2.1 解析

#### 2.1.1 词法分析

将 (add 2 (subtract 4 2)) 代码字符串分割成如下 Tokens：

```
[  { type: 'paren',  value: '('        },  { type: 'name',   value: 'add'      },  { type: 'number', value: '2'        },  { type: 'paren',  value: '('        },  { type: 'name',   value: 'subtract' },  { type: 'number', value: '4'        },  { type: 'number', value: '2'        },  { type: 'paren',  value: ')'        },  { type: 'paren',  value: ')'        }, ]
```

具体代码实现如下，并添加了较为详细的注释：

```
// tokenizer.jsfunction tokenizer(sourceCode) {  // 声明一个游标用来记录遍历的位置  let current = 0;  let tokens = [];  // 通过一个循环，不断的遍历源码字符串  while (current < sourceCode.length) {    let char = sourceCode[current];    if (char === '(') {      tokens.push({        type: 'paren',        value: '(',      });      current++;      continue;    }    if (char === ')') {      tokens.push({        type: 'paren',        value: ')',      });      current++;      continue;    }    // 由于空白字符对我们来说意义不大，故不放到Tokens中，直接跳过    let WHITESPACE = /\s/;    if (WHITESPACE.test(char)) {      current++;      continue;    }    // 因为数字可以是任意数量的字符，我们想要将整个数字序列捕获为一个标记。    //（如 123 456）    let NUMBERS = /[0-9]/;    if (NUMBERS.test(char)) {      let value = '';      while (NUMBERS.test(char)) {        value += char;        char = sourceCode[++current];      }      tokens.push({ type: 'number', value });      continue;    }    // 这里是想要获取运算函数名称，如 add 和 subtract    let LETTERS = /[a-z]/i;    if (LETTERS.test(char)) {      let value = '';      while (LETTERS.test(char)) {        value += char;        char = sourceCode[++current];      }      tokens.push({ type: 'name', value });      continue;    }    throw new TypeError('I dont know what this character is: ' + char);  }  return tokens;}
```

#### 2.1.2 语法分析

将 Tokens 解析成 (add 2 (subtract 4 2)) 对应的 AST 的对象形式，如下所示：

```
{  type: 'Program',  body: [{    type: 'CallExpression',    name: 'add',    params: [{      type: 'NumberLiteral',      value: '2'    }, {      type: 'CallExpression',      name: 'subtract',      params: [{        type: 'NumberLiteral',        value: '4'      }, {        type: 'NumberLiteral',        value: '2'      }]    }]  }]}
```

具体代码实现如下，并添加了较为详细的注释：

```
// parse.jsfunction parser(tokens) {  let current = 0;  // 这里定义了一个被递归的函数walk，每次遍历Tokens时都会调用  function walk() {    let token = tokens[current];    // 如果遍历到 number 就返回如下对象    if (token.type === 'number') {      current++;      return {        type: 'NumberLiteral',        value: token.value,      };    }    // 如果遍历到'(',跳过并取下一个Token,并返回如下对象，因为'('之后肯定是运算函数名称    // 如 add 和 subtract    if (      token.type === 'paren' &&      token.value === '('    ) {      token = tokens[++current];      let node = {        type: 'CallExpression',        name: token.value,        params: [],      };      token = tokens[++current];      // 如果没有遍历到')'，则递归walk，知道遍历到')'返回一个      // {type: 'CallExpression', name: token.value, params: [xxx]}      while (        (token.type !== 'paren') ||        (token.type === 'paren' && token.value !== ')')      ) {        node.params.push(walk());        token = tokens[current];      }      current++;      return node;    }    throw new TypeError(token.type);  }  let ast = {    type: 'Program',    body: [],  };  // 遍历Tokens并调用walk  while (current < tokens.length) {    ast.body.push(walk());  }  return ast;}
```

### 2.2 转换

#### 2.2.1 遍历 AST 节点

现在我们已经通过 parse 方法得到了 (add 2 (subtract 4 2)) 对应的 AST 了，这就轮到插件起作用了，插件可以遍历并操作 AST 上的任意节点，将节点修改成我们想要的样子。最终我们想得到 add(2, subtract(4, 2)) 对应的 AST 对象，如下所示：

```
{  type: 'Program',  body: [{    type: 'ExpressionStatement',    expression: {      type: 'CallExpression',      callee: {        type: 'Identifier',        name: 'add'      },      arguments: [{        type: 'NumberLiteral',        value: '2'      }, {        type: 'CallExpression',        callee: {          type: 'Identifier',          name: 'subtract'        },        arguments: [{          type: 'NumberLiteral',          value: '4'        }, {          type: 'NumberLiteral',          value: '2'        }]      }    }  }]}
```

我这里用对象声明模拟了一个插件，可以视为 Babel 系统概念中的 visitor ，可以看到，插件最终对外暴露的就是一个包含处理各种节点逻辑的对象，只要匹配上节点，就走处理节点的逻辑，将其处理成我们希望的样子。如下所示：

```
{    NumberLiteral: {      enter(node, parent) {        parent._context.push({          type: 'NumberLiteral',          value: node.value,        });      }    },    // 将CallExpression节点处理成我们希望得到的节点样子    CallExpression: {      enter(node, parent) {        let expression = {          type: 'CallExpression',          callee: {            type: 'Identifier',            name: node.name,          },          arguments: [],        };        node._context = expression.arguments;        if (parent.type !== 'CallExpression') {          expression = {            type: 'ExpressionStatement',            expression: expression,          };        }        parent._context.push(expression);      }    }}
```

具体代码实现如下，并添加了较为详细的注释，traverse 方法需要结合 transformer 方法一起看，会更加清晰：

```
// transformer.jsfunction traverse(ast, visitor) {  // 用来处理节点集合，即数组  function traverseArray(array, parent) {    array.forEach(child => {      traverseNode(child, parent);    });  }  // 用来处理单个节点，即对象  function traverseNode(node, parent) {    let methods = visitor[node.type];    if (methods && methods.enter) {      methods.enter(node, parent);    }    switch (node.type) {      case 'Program':        traverseArray(node.body, node);        break;      case 'CallExpression':        traverseArray(node.params, node);        break;      case 'NumberLiteral':        break;      default:        throw new TypeError(node.type);    }    if (methods && methods.exit) {      methods.exit(node, parent);    }  }  traverseNode(ast, null);}function transformer(ast) {  let newAst = {    type: 'Program',    body: [],  };  const visitor = {    NumberLiteral: {      enter(node, parent) {        parent._context.push({          type: 'NumberLiteral',          value: node.value,        });      },    },    CallExpression: {      enter(node, parent) {        let expression = {          type: 'CallExpression',          callee: {            type: 'Identifier',            name: node.name,          },          arguments: [],        };        node._context = expression.arguments;        if (parent.type !== 'CallExpression') {          expression = {            type: 'ExpressionStatement',            expression: expression,          };        }        parent._context.push(expression);      },    }  };  ast._context = newAst.body;  traverser(ast, visitor);  return newAst;}
```

### 2.3 生成

生成的过程比较简单，就是将 add(2, subtract(4, 2)) 对应的 AST 对象按照拼接成 add(2, subtract(4, 2)) 代码字符串便可，具体代码如下：

```
// generator.jsfunction codeGenerator(node) {  switch (node.type) {  // 遍历到'Program'节点，拼接个换行符即可    case 'Program':      return node.body.map(codeGenerator)        .join('\n');    // 遍历到'ExpressionStatement'节点，又将expression节点作为参数递归codeGenerator    // 并拼接个 ';'    case 'ExpressionStatement':      return (        codeGenerator(node.expression) +        ';'      );    // 遍历到'CallExpression'节点，拼接运算表达式，    // 如 (4, 2)    case 'CallExpression':      return (        codeGenerator(node.callee) +        '(' +        node.arguments.map(codeGenerator)          .join(', ') +        ')'      );    // 遍历到'Identifier'节点，拼接运算表达式，    // 如 subtract add    case 'Identifier':      return node.name;    case 'NumberLiteral':      return node.value;    default:      throw new TypeError(node.type);  }}
```

到此为止，我们实现了一个简易的 babel 编译器，github 地址

四. 写到最后
=======

限于篇幅，自定义 Babel 插件的部分将于下篇文章中带着大家手摸手实现，敬请期待。本文更偏向于科普性质，感兴趣的内容欢迎大家自行搜索了解和学习。本文所有内容皆源于官网学习以及个人理解与实践，如有疑问，请回复讨论。希望通过本文，你能对 Babel 有一个基本的了解，能对你的学习和工作有所帮助。

五. 参考材料
=======

1.  https://www.babeljs.cn/
    

2.  https://juejin.cn/post/6844904008679686152#heading-17
    

### 参考资料

[1]

ESNext: _https://juejin.cn/post/7028417636811669534_

[2]

巴别塔: _https://baike.baidu.com/item/%E5%B7%B4%E5%88%AB%E5%A1%94/67557_

[3]

AST 解析器: _https://astexplorer.net/_