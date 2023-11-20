> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/E4iFf5aTbR9rXBU3gnR4Gg)

> 授权转载自：相学长 
> 
> https://zhuanlan.zhihu.com/p/32831172

> 本文将探讨 tree-shaking 在当下的现状，以及研究为什么 tree-shaking 依旧举步维艰的原因，最终总结当下能提高 tree-shaking 效果的一些手段。

Tree-Shaking 这个名词，很多前端 coder 已经耳熟能详了，它代表的大意就是删除没用到的代码。这样的功能对于构建大型应用时是非常好的，因为日常开发经常需要引用各种库。但大多时候仅仅使用了这些库的某些部分，并非需要全部，此时 Tree-Shaking 如果能帮助我们删除掉没有使用的代码，将会大大缩减打包后的代码量。

Tree-Shaking 在前端界由 rollup 首先提出并实现，后续 webpack 在 2.x 版本也借助于 UglifyJS 实现了。自那以后，在各类讨论优化打包的文章中，都能看到 Tree-Shaking 的身影。

许多开发者看到就很开心，以为自己引用的 elementUI、antd 等库终于可以删掉一大半了。然而理想是丰满的，现实是骨干的。升级之后，项目的压缩包并没有什么明显变化。

我也遇到了这样的问题，前段时间，需要开发个组件库。我非常纳闷我开发的组件库在打包后，为什么引用者通过 ES6 引用，最终依旧会把组件库中没有使用过的组件引入进来。

下面跟大家分享下，我在 Tree-Shaking 上的摸索历程。

Tree-Shaking 的原理
----------------

这里我不多冗余阐述，直接贴百度外卖前端的一篇文章：Tree-Shaking 性能优化实践 - 原理篇。

> https://juejin.im/post/6844903544756109319

如果懒得看文章，可以看下如下总结：

1.  ES6 的模块引入是静态分析的，故而可以在编译时正确判断到底加载了什么代码。
    
2.  分析程序流，判断哪些变量未被使用、引用，进而删除此代码。
    

很好，原理非常完美，那为什么我们的代码又删不掉呢？

**先说原因：都是副作用的锅！**

副作用
---

了解过函数式编程的同学对副作用这词肯定不陌生。它大致可以理解成：一个函数会、或者可能会对函数外部变量产生影响的行为。

举个例子，比如这个函数：

```
function go (url) {  window.location.href = url}
```

这个函数修改了全局变量 location，甚至还让浏览器发生了跳转，这就是一个有副作用的函数。

现在我们了解了副作用了，但是细想来，我写的组件库也没有什么副作用啊，我每一个组件都是一个类，简化一下，如下所示：

```
// componetns.jsexport class Person {  constructor ({ name, age, sex }) {    this.className = 'Person'    this.name = name    this.age = age    this.sex = sex  }  getName () {    return this.name  }}export class Apple {  constructor ({ model }) {    this.className = 'Apple'    this.model = model  }  getModel () {    return this.model  }}// main.jsimport { Apple } from './components'const appleModel = new Apple({  model: 'IphoneX'}).getModel()console.log(appleModel)
```

用 rollup 在线 repl 尝试了下 tree-shaking，也确实删掉了 Person，传送门

可是为什么当我通过 webpack 打包组件库，再被他人引入时，却没办法消除未使用代码呢？

因为我忽略了两件事情：babel 编译 + webpack 打包

成也 Babel，败也 Babel
-----------------

Babel 不用我多解释了，它能把 ES6/ES7 的代码转化成指定浏览器能支持的代码。正是由于它，我们前端开发者才能有今天这样美好的开发环境，能够不用考虑浏览器兼容性地、畅快淋漓地使用最新的 JavaScript 语言特性。

然而也是由于它的编译，一些我们原本看似没有副作用的代码，便转化为了 (可能) 有副作用的。

比如我如上的示例，如果我们用 babel 先编译一下，再贴到 rollup 的 repl，那么结果如下：传送门

如果懒得点开链接，可以看下 Person 类被 babel 编译后的结果：

```
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }var _createClass = function() {  function defineProperties(target, props) {    for (var i = 0; i < props.length; i++) {      var descriptor = props[i];      descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0,      "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);    }  }  return function(Constructor, protoProps, staticProps) {    return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps),    Constructor;  };}()var Person = function () {  function Person(_ref) {    var name = _ref.name, age = _ref.age, sex = _ref.sex;    _classCallCheck(this, Person);    this.className = 'Person';    this.name = name;    this.age = age;    this.sex = sex;  }  _createClass(Person, [{    key: 'getName',    value: function getName() {      return this.name;    }  }]);  return Person;}();
```

我们的 Person 类被封装成了一个 IIFE(立即执行函数)，然后返回一个构造函数。那它怎么就产生副作用了呢？问题就出现在_createClass 这个方法上，你只要在上一个 rollup 的 repl 链接中，将 Person 的 IIFE 中的`_createClass`调用删了，Person 类就会被移除了。至于`_createClass`为什么会产生副作用，我们先放一边。因为大家可能会产生另外一个疑问：**Babel 为什么要这样去声明构造函数的？**

假如是我的话，我可能会这样去编译：

```
var Person = function () {
  function Person() {

  }
  Person.prototype.getName = function () { return this.name };
  return Person;
}();
```

因为我们以前就是这么写 “类” 的，那 babel 为什么要采用`Object.defineProperty`这样的形式呢，用原型链有什么不妥呢？自然是非常的不妥的，因为 ES6 的一些语法是有其特定的语义的。比如：

1.  类内部声明的方法，是不可枚举的，而通过原型链声明的方法是可以枚举的。这里可以参考下阮老师介绍 Class 的基本语法
    
2.  `for...of`的循环是通过遍历器 (`Iterator`) 迭代的，循环数组时并非是 i++，然后通过下标寻值。这里依旧可以看下阮老师关于遍历器与 for...of 的介绍，以及一篇 babel 关于`for...of`编译的说明 transform-es2015-for-of
    

所以，babel 为了符合 ES6 真正的语义，编译类时采取了`Object.defineProperty`来定义原型方法，于是导致了后续这些一系列问题。

眼尖的同学可能在我上述第二点中发的链接 transform-es2015-for-of 中看到，babel 其实是有一个`loose`模式的，直译的话叫做宽松模式。它是做什么用的呢？它会不严格遵循 ES6 的语义，而采取更符合我们平常编写代码时的习惯去编译代码。比如上述的`Person`类的属性方法将会编译成直接在原型链上声明方法。

这个模式具体的 babel 配置如下：

```
// .babelrc{  "presets": [["env", { "loose": false }]]}
```

同样的，我放个在线 repl 示例方便大家直接查看效果：loose-mode

咦，如果我们真的不关心类方法能否被枚举，开启了`loose`模式，这样是不是就没有副作用产生，就能完美 tree-shaking 类了呢？

我们开启了`loose`模式，使用 rollup 打包，发现还真是如此！传送门

不够屌的 UglifyJS
-------------

然而不要开心的太早，当我们用 Webpack 配合 UglifyJS 打包文件时，这个 Person 类的 IIFE 又被打包进去了？What？？？

为了彻底搞明白这个问题，我搜到一条 UglifyJS 的 issue：Class declaration in IIFE considered as side effect，仔细看了好久。对此有兴趣、并且英语还 ok 的同学，可以快速去了解这条 issue，还是挺有意思的。我大致阐述下这条 issue 下都说了些啥。

> issue 楼主 - blacksonic 好奇为什么 UglifyJS 不能消除未引用的类。  
> UglifyJS 贡献者 - kzc 说，uglify 不进行程序流分析，所以不能排除有可能有副作用的代码。  
> 楼主：我的代码没什么副作用啊。要不你们来个配置项，设置后，可以认为它是没有副作用的，然后放心的删了它们吧。  
> 贡献者：我们没有程序流分析，我们干不了这事儿，实在想删除他们，出门左转 rollup 吼吧，他们屌，做了程序流分析，能判断到底有没有副作用。  
> 楼主：迁移 rollup 成本有点高啊。我觉得加个配置不难啊，比如这样这样，巴拉巴拉。  
> 贡献者：欢迎提 PR。  
> 楼主：别嘛，你们项目上千行代码，我咋提 PR 啊。我的代码也没啥副作用啊，您能详细的说明下么？  
> 贡献者：变量赋值就是有可能产生副作用的！我举个例子：

```
var V8Engine = (function () {  function V8Engine () {}  V8Engine.prototype.toString = function () { return 'V8' }  return V8Engine}())var V6Engine = (function () {  function V6Engine () {}  V6Engine.prototype = V8Engine.prototype // <---- side effect  V6Engine.prototype.toString = function () { return 'V6' }  return V6Engine}())console.log(new V8Engine().toString())
```

> 贡献者：`V6Engine`虽然没有被使用，但是它修改了 V8Engine 原型链上的属性，这就产生副作用了。你看`rollup`（楼主特意注明截至当时）目前就是这样的策略，直接把 V6Engine 给删了，其实是不对的。  
> 楼主以及一些路人甲乙丙丁，纷纷提出自己的建议与方案。最终定下，可以在代码上通过`/*@__PURE__*/`这样的注释声明此函数无副作用。

这个 issue 信息量比较大，也挺有意思，其中那位 uglify 贡献者 kzc，当时提出 rollup 存在的问题后还给 rollup 提了 issue，rollup 认为问题不大不紧急，这位贡献者还顺手给 rollup 提了个 PR，解决了问题。。。

我再从这个 issue 中总结下几点关键信息：

1.  函数的参数若是引用类型，对于它属性的操作，都是有可能会产生副作用的。因为首先它是引用类型，对它属性的任何修改其实都是改变了函数外部的数据。其次获取或修改它的属性，会触发`getter`或者`setter`，而`getter`、`setter`是不透明的，有可能会产生副作用。
    
2.  uglify 没有完善的程序流分析。它可以简单的判断变量后续是否被引用、修改，但是不能判断一个变量完整的修改过程，不知道它是否已经指向了外部变量，所以很多有可能会产生副作用的代码，都只能保守的不删除。
    
3.  rollup 有程序流分析的功能，可以更好的判断代码是否真正会产生副作用。
    

有的同学可能会想，连获取对象的属性也会产生副作用导致不能删除代码，这也太过分了吧！事实还真是如此，我再贴个示例演示一下：传送门

代码如下：

```
// maths.jsexport function square ( x ) { return x.a}square({ a: 123 })export function cube ( x ) { return x * x * x;}//main.jsimport { cube } from './maths.js';console.log( cube( 5 ) ); // 125
```

打包结果如下：

```
function square ( x ) {  return x.a}square({ a: 123 });function cube ( x ) { return x * x * x;}console.log( cube( 5 ) ); // 125
```

而如果将`square`方法中的`return x.a` 改为 `return x`，则最终打包的结果则不会出现`square`方法。当然啦，如果不在`maths.js`文件中执行这个`square`方法，自然也是不会在打包文件中出现它的。

所以我们现在理解了，当时 babel 编译成的`_createClass`方法为什么会有副作用。现在再回头一看，它简直浑身上下都是副作用。

查看 uglify 的具体配置，我们可以知道，目前 uglify 可以配置`pure_getters: true`来强制认为获取对象属性，是没有副作用的。这样可以通过它删除上述示例中的`square`方法。不过由于没有`pure_setters`这样的配置，`_createClass`方法依旧被认为是有副作用的，无法删除。

那到底该怎么办？
--------

聪明的同学肯定会想，既然 babel 编译导致我们产生了副作用代码，那我们先进行 tree-shaking 打包，最后再编译 bundle 文件不就好了嘛。这确实是一个方案，然而可惜的是：这在处理项目自身资源代码时是可行的，处理外部依赖 npm 包就不行了。因为人家为了让工具包具有通用性、兼容性，大多是经过 babel 编译的。而最占容量的地方往往就是这些外部依赖包。

那先从根源上讨论，假如我们现在要开发一个组件库提供给别人用，该怎么做？

如果是使用 webpack 打包 JavaScript 库
-----------------------------

先贴下 webpack 将项目打包为 JS 库的文档。可以看到 webpack 有多种导出模式，一般大家都会选择最具通用性的`umd`方式，但是 webpack 却没支持导出 ES 模块的模式。

**所以，假如你把所有的资源文件通过 webpack 打包到一个 bundle 文件里的话，那这个库文件从此与 Tree-shaking 无缘。**

那怎么办呢？也不是没有办法。目前业界流行的组件库多是将每一个组件或者功能函数，都打包成单独的文件或目录。然后可以像如下的方式引入：

```
import clone from 'lodash/clone'import Button from 'antd/lib/button';
```

但是这样呢也比较麻烦，而且不能同时引入多个组件。所以这些比较流行的组件库大哥如 antd，element 专门开发了 babel 插件，使得用户能以`import { Button, Message } form 'antd'`这样的方式去按需加载。本质上就是通过插件将上一句的代码又转化成如下：

```
import Button from 'antd/lib/button';import Message from 'antd/lib/button';
```

这样似乎是最完美的变相 tree-shaking 方案。唯一不足的是，对于组件库开发者来说，需要专门开发一个 babel 插件；对于使用者来说，需要引入一个 babel 插件，稍微略增加了开发成本与使用成本。

除此之外，其实还有一个比较前沿的方法。是 rollup 的一个提案，在 package.json 中增加一个 key：module，如下所示：

```
{  "name": "my-package",  "main": "dist/my-package.umd.js",  "module": "dist/my-package.esm.js"}
```

这样，当开发者以 es6 模块的方式去加载 npm 包时，会以`module`的值为入口文件，这样就能够同时兼容多种引入方式，(rollup 以及 webpack2 + 都已支持)。但是 webpack 不支持导出为 es6 模块，所以 webpack 还是要拜拜。我们得上 rollup!

(有人会好奇，那干脆把未打包前的资源入口文件暴露到`module`，让使用者自己去编译打包好了，那它就能用未编译版的 npm 包进行 tree-shaking 了。这样确实也不是不可以。但是，很多工程化项目的 babel 编译配置，为了提高编译速度，其实是会忽略掉`node_modules`内的文件的。所以为了保证这些同学的使用，我们还是应该要暴露出一份编译过的 ES6 Module。)

使用 rollup 打包 JavaScript 库
-------------------------

吃了那么多亏后，我们终于明白，打包工具库、组件库，还是 rollup 好用，为什么呢？

1.  它支持导出 ES 模块的包。
    
2.  它支持程序流分析，能更加正确的判断项目本身的代码是否有副作用。
    

我们只要通过 rollup 打出两份文件，一份 umd 版，一份 ES 模块版，它们的路径分别设为`main`，`module`的值。这样就能方便使用者进行 tree-shaking。

那么问题又来了，使用者并不是用 rollup 打包自己的工程化项目的，由于生态不足以及代码拆分等功能限制，一般还是用 webpack 做工程化打包。

使用 webpack 打包工程化项目
------------------

之前也提到了，我们可以先进行 tree-shaking，再进行编译，减少编译带来的副作用，从而增加 tree-shaking 的效果。那么具体应该怎么做呢？

首先我们需要去掉 babel-loader，然后 webpack 打包结束后，再执行 babel 编译文件。但是由于 webpack 项目常有多入口文件或者代码拆分等需求，我们又需要写一个配置文件，对应执行 babel，这又略显麻烦。所以我们可以使用 webpack 的 plugin，让这个环节依旧跑在 webpack 的打包流程中，就像 uglifyjs-webpack-plugin 一样，不再是以 loader 的形式对单个资源文件进行操作，而是在打包最后的环节进行编译。这里可能需要大家了解下 webpack 的 plugin 机制。

关于 uglifyjs-webpack-plugin，这里有一个小细节，webpack 默认会带一个低版本的，可以直接用`webpack.optimize.UglifyJsPlugin`别名去使用。具体可以看 webpack 的相关说明

> webpack =<v3.0.0 currently contains v0.4.6 of this plugin under webpack.optimize.UglifyJsPlugin as an alias. For usage of the latest version (v1.0.0), please follow the instructions below. Aliasing v1.0.0 as webpack.optimize.UglifyJsPlugin is scheduled for webpack v4.0.0

而这个**低版本的 uglifyjs-webpack-plugin** 使用的依赖 uglifyjs 也是低版本的，它没有`uglify`ES6 代码的能力，故而如果我们有这样的需求，需要在工程中重新`npm install uglifyjs-webpack-plugin \-D`，安装最新版本的`uglifyjs-webpack-plugin`，重新引入它并使用。

这样之后，我们再使用 webpack 的 babel 插件进行编译代码。

问题又来了，这样的需求比较少，因此 webpack 和 babel 官方都没有这样的插件，只有一个第三方开发者开发了一个插件 babel-webpack-plugin。可惜的是这位作者已经近一年没有维护这个插件了，并且存在着一个问题，此插件不会用项目根目录下的`.babelrc`文件进行 babel 编译。有人对此提了 issue，却也没有任何回应。

那么又没有办法，就我来写一个新的插件吧 ----webpack-babel-plugin，有了它之后我们就能让 webpack 在最后打包文件之前进行 babel 编译代码了，具体如何安装使用可以点开项目查看。注意这个配置需要在`uglifyjs-webpack-plugin`之后，像这样：

```
plugins: [
  new UglifyJsPlugin(),
  new BabelPlugin()
]
```

但是这样呢，有一个毛病，由于 babel 在最后阶段去编译比较大的文件，耗时比较长，所以建议区分下开发模式与生产模式。另外还有个更大的问题，`webpack`本身采用的编译器 acorn 不支持对象的扩展运算符 (...) 以及某些还未正式成为 ES 标准的特性，所以。。。。。

所以如果特性用的非常超前，还是需要`babel-loader`，但是`babel-loader`要做专门的配置，把还在 es stage 阶段的代码编译成 ES2017 的代码，以便于`webpack`本身做处理。

**感谢掘金热心网友的提示，还有一个插件 BabelMinifyWebpackPlugin，它所依赖的 babel/minify 也集成了 uglifyjs。使用此插件便等同于上述使用 UglifyJsPlugin + BabelPlugin 的效果，如若有此方面需求，建议使用此插件。**

总结
--

上面讲了这么多，我最后再总结下，在当下阶段，在 tree-shaking 上能够尽力的事。

1.  尽量不写带有副作用的代码。诸如编写了立即执行函数，在函数里又使用了外部变量等。
    
2.  如果对 ES6 语义特性要求不是特别严格，可以开启 babel 的`loose`模式，这个要根据自身项目判断，如：是否真的要不可枚举 class 的属性。
    
3.  如果是开发 JavaScript 库，请使用 rollup。并且提供 ES6 module 的版本，入口文件地址设置到 package.json 的`module`字段。
    
4.  如果 JavaScript 库开发中，难以避免的产生各种副作用代码，可以将功能函数或者组件，打包成单独的文件或目录，以便于用户可以通过目录去加载。如有条件，也可为自己的库开发单独的 webpack-loader，便于用户按需加载。
    
5.  如果是工程项目开发，对于依赖的组件，只能看组件提供者是否有对应上述 3、4 点的优化。对于自身的代码，除 1、2 两点外，对于项目有极致要求的话，可以先进行打包，最终再进行编译。
    
6.  如果对项目非常有把握，可以通过 uglify 的一些编译配置，如：`pure_getters: true`，删除一些强制认为不会产生副作用的代码。
    

故而，在当下阶段，依旧没有比较简单好用的方法，便于我们完整的进行 tree-shaking。所以说，想做好一件事真难啊。不仅需要靠个人的努力，还需要考虑到历史的进程。

> PS: 此文中涉及到的代码，我也传到了 github，可以点击阅读原文下载查看。https://github.com/wuomzfx/tree-shaking-test

@丁香园 F2E @相学长

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)

》》面试官都在用的题库，快来看看《《