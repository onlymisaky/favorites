> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/M4pDRfwCdUW0vxrAojxXZg)

那是一个风和日丽的早晨，我正悠闲地喝着 Coffe，突然领导向我走来，我赶紧熟练地切出 **VSCode**，淡定自若地问：领导，什么事？领导拍了拍我的肩膀：你上次封装的方法同事跟我反馈使用起来很不错啊，你不如做成 **JS 插件**给大家用吧。我放下了手中的马克杯，甩了一下眼前仅剩的几根刘海：没问题啊，小 case！

原型链写法
=====

要开始编写插件就得先了解 **JS 模块化**，早期的模块化是利用了**函数自执行**来实现的，在单独的函数作用域中执行代码可以避免插件中定义的变量污染到全局变量，举个栗子🌰，以下代码实现了一个简单随机数生成的插件：

```
;(function (global) {    "use strict";    var MyPlugin = function (name) {        this.name = name    };    MyPlugin.prototype = {        say: function () {            console.log('欢迎你：', this.name)        },        random: function (min = 0, max = 1) {            if (min <= Number.MAX_SAFE_INTEGER && max <= Number.MAX_SAFE_INTEGER) {                return Math.floor(Math.random() * (max - min + 1)) + min            }        }    };        // 函数自执行将 this（全局下为window）传入，并在其下面挂载方法    global.MyPlugin = MyPlugin;    // 兼容CommonJs规范导出    if (typeof module !== 'undefined' && module.exports) module.exports = MyPlugin; })(this);
```

直接使用 **script** 标签引入该插件，接着 `new` 一个实例就能使用插件啦：

```
var aFn = new MyPlugin()var num = aFn.random(10, 20)console.log(num) // 打印一个 10~20 之间的随机数
```

闭包式写法
=====

上面的插件使用时如果调用 `say` 方法，会打印方法中的欢迎字样，并显示初始化的 `name` 值：

```
var aFn = new MyPlugin('呀哈哈')aFn.say() // 欢迎你: 呀哈哈
```

但由于属性能被直接访问，插件中的变量就可以随意修改，这可能是我们不想看到的：

```
var aFn = new MyPlugin('呀哈哈')aFn.name = nullaFn.say() // 欢迎你: null
```

那么如果要创建**私有变量**，可以利用 **JS 闭包**原理来编写插件，我们使用**工厂模式**来创建函数，再举个栗子🌰，如下代码实现了一个简单正则校验的插件：

```
; (function (global) {    "use strict";    var MyPlugin = function (value) {        var val = value        var reg = {            phone: /^1[3456789]\d{9}$/,            number: /^-?\d*\.?\d+$/        };        return {            getRegs() {                return reg            },            setRegs(params) {                reg = { ...reg, ...params }            },            isPhone() {                reg.phone.test(val) && console.log('这是手机号')                return this            },            isNumber() {                reg.number.test(val) && console.log('这是数字')                return this            }        };    };    // 函数自执行将 this（全局下为window）传入，并在其下面挂载方法    global.MyPlugin = MyPlugin;    // 兼容CommonJs规范导出    if (typeof module !== 'undefined' && module.exports) module.exports = MyPlugin;})(this);
```

这时我们再调用插件，其内部的变量是不可访问的，只能通过插件**内部的方法查看 / 修改**：

```
var aFn = new MyPlugin()console.log( aFn.reg ) // undefinedvar reg = aFn.getRegs()console.log( reg ) // {"phone":{....},"number":{.....}}
```

上面代码中我们在 `isPhone` `isNumber` 方法的最后都返回了 `this`，这是为了实现如下的链式调用：

```
var aFn = new MyPlugin(13800138000)aFn.isPhone().isNumber() // log: > 这是手机号 > 这是数字
```

仿 JQuery 写法
===========

这种写法是仿造 **JQ** 实现的一种编写模式，可以省去调用时`new`实例化的步骤，并实现类似 `$(xxx).someFn(....)` 这样的调用方法，在需要频繁 **DOM** 操作的时候就很适合这么编写插件。笔者以前会在小项目中自己实现一些类 **JQ** 选择器操作的功能插件，来避免引入整个 **JQ**，实现插件的核心思路如下：

```
var Fn = Function(params) {    return new Fn.prototype.init(params)}Fn.prototype = {    init: function() {}}Fn.prototype.init.prototype = Fn.prototype
```

> 可以看出核心是对 **JS 原型链**的极致利用，首先主动对其原型上的`init`方法进行实例化并返回，`init`相当于构造函数的效果，而此时返回的实例里并没有包含`Fn`的方法，我们调用时 **JS** 自然就会从`init`的原型对象上去查找，于是最终`init`下的原型才又指向了`Fn`的原型，通过这种 "套娃" 的手法，使得我们能够不通过实例化`Fn`又能正确地访问到`Fn`下的原型对象。

说了这么多，还是举个栗子🌰，以下代码实现了一个简单的样式操作插件：

```
;(function (global) {  "use strict";  var MyPlugin = function (el) {    return new MyPlugin.prototype.init(el)  };  MyPlugin.prototype = {    init: function (el) {      this.el = typeof el === "string" ? document.querySelector(el) : el;    },    setBg: function (bg) {      this.el.style.background = bg;      return this    },    setWidth: function (w) {      this.el.style.width = w;      return this    },    setHeight: function (h) {      this.el.style.height = h;      return this    }  };  MyPlugin.prototype.init.prototype = MyPlugin.prototype  // script标签引入插件后全局下挂载一个_$的方法  global._$ = MyPlugin;})(this || window);
```

使用演示：

```
<!-- 页面元素 --><div id="app">hello world</div>
```

为元素设置背景：

```
_$('#app').setBg('#ff0')
```

![](https://mmbiz.qpic.cn/mmbiz_png/EFMcFLSf0WhoUMUbnliaE4hkqznVjlbOgt3PHN2y1OsvQLSniboVwMuWTNQSYFHsZlxl8UrVDaRQOo7dIFlEicDAA/640?wx_fmt=png)

为元素设置背景并改变宽高：

```
_$('#app').setBg('#ff0').setHeight('100px').setWidth('200px')
```

![](https://mmbiz.qpic.cn/mmbiz_png/EFMcFLSf0WhoUMUbnliaE4hkqznVjlbOgT5QTc6CYdxibED0ecSCicHNDFKKwU7N3MO8d6RuzQqJ86s64Byrkibh2A/640?wx_fmt=png)

工程化插件
=====

前面讲的插件编写方法已经足够优雅了，但还不够逼格，假设以后会有多人同时开发的情况，仅靠一个 **JS** 维护大型插件肯定是独木难支，这时候就需要组件化把颗粒度打细，将插件拆分成多个文件，分别负责各自的功能，最终再打包成一个文件引用。如今 **ES** 模块化已经可以轻松应对功能拆分了，所以我们只需要一个打包器，**Rollup.js** 就是不错的选择，有了它我们可以更优雅地编写插件，它会帮我们打包。许多大型框架例如 **Vue**、**React** 都是用它打包的。

> Rollup 是一个用于 JavaScript 的模块打包器，它将小段代码编译成更大更复杂的东西，例如库或应用程序。_https://rollupjs.org/guide/en/_

下面我们一步步实现这个工程化的插件，没有那么复杂，先创建一个目录：

```
mkdir -p my-project/src
```

接着运行 `npm init` 进行项目初始化，一路回车，接着为项目安装 **Rollup**：

```
npm install --save-dev rollup
```

根目录下创建入口文件 **index.js**，以及 **src** 下的 **main.js**：

```
// index.jsimport main from './src/main.js';console.log(main);
```

```
// src/main.jsexport default 'hello world!';
```

根目录下创建 `rollup.config.js`

```
import babel from 'rollup-plugin-babel'import commonjs from 'rollup-plugin-commonjs'import resolve from 'rollup-plugin-node-resolve'export default {  input: 'index.js',  output: [    {      file: 'dist/main.umd.js',      format: 'umd',      name: 'bundle-name',    },    {      file: 'dist/main.es.js',      format: 'es',    },    {      file: 'dist/main.cjs.js',      format: 'cjs',    },  ],  plugins: [    babel({      exclude: 'node_modules/**',    }),    resolve({      jsnext: true,      main: true,      browser: true,    }),    commonjs(),  ],}
```

> 稍微解释上面配置的插件：
> 
> `babel`：将最终代码编译成 **es5**，我们的开发代码可以不用处理兼容性。
> 
> `resolve`、`commonjs`：用于兼容可以依赖 **commonjs** 规范的包。

把上面的依赖安装一下：

```
npm install --save-dev @babel/core @babel/preset-env rollup-plugin-babel@latest rollup-plugin-node-resolve rollup-plugin-commonjs
```

修改 **package.json**，增加一条脚本命令：

```
.......
"scripts": {
    ......
    "dev": "rollup -c -w"
},
```

运行 `npm run dev` 看看效果吧：

![](https://mmbiz.qpic.cn/mmbiz_png/EFMcFLSf0WhoUMUbnliaE4hkqznVjlbOg9hDuh4RHia12OzkAEN28NphDiaJbYCM34tQTLUWibvNfmtSatkDFmSHuw/640?wx_fmt=png)

<table><thead data-style="line-height: 1.75; background: rgba(0, 0, 0, 0.05); font-weight: bold; color: rgb(63, 63, 63);"><tr><td data-style="line-height: 1.75; border-color: rgb(223, 223, 223); padding: 0.25em 0.5em;">打包文件</td><td data-style="line-height: 1.75; border-color: rgb(223, 223, 223); padding: 0.25em 0.5em;">测试运行</td></tr></thead><tbody><tr><td data-style="line-height: 1.75; border-color: rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: break-all;"><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/EFMcFLSf0WhoUMUbnliaE4hkqznVjlbOgUZ6Go1I6Sq7I3iaiapxg8ZgYjiaQ5hBsthibGKsplGdwdkrndEuLfSETRw/640?wx_fmt=png"></td><td data-style="line-height: 1.75; border-color: rgb(223, 223, 223); padding: 0.25em 0.5em; color: rgb(63, 63, 63); word-break: break-all;"><code data-style="line-height: 1.75; font-size: 12.6px; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; word-break: break-all;">node dist/main.cjs.js</code>:<br><img class="sr-rd-content-img-load" src="https://mmbiz.qpic.cn/mmbiz_png/EFMcFLSf0WhoUMUbnliaE4hkqznVjlbOgNP9WQ9rISP8qDM0rfmJI9YI5iaQPIHfXibXsSfJ2EJWu1GVMPiaw5XJaA/640?wx_fmt=png"></td></tr></tbody></table>

### 打包文件格式说明

1.  1. **umd**
    

集合了 **CommonJS**、**AMD**、**CMD**、**IIFE** 为一体的打包模式，看看上面的 **hello world** 会被打包成什么：

```
(function (global, factory) {    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :    typeof define === 'function' && define.amd ? define(factory) :    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["bundle-name"] = factory());})(this, (function () { 'use strict';    .....代码省略.....        return xxxxxxxx;}));
```

可以看出导出的文件就是我们前面一直使用的**函数自执行**开发方式，其中加了各种兼容判断代码将在哪个环境下导入。

1.  2. **es**
    

现代 JS 的标准，导出的文件只能使用 **ES 模块化** 方式导入。

1.  3. **cjs**
    

这个是指 **CommonJS** 规范导出的格式，只可在 **Node** 环境下导入。

补充：模块化的发展
=========

*   • 早期利用**函数自执行**实现，在单独的函数作用域中执行代码（如 JQuery ）
    
*   • **AMD**：引入 `require.js` 编写模块化，引用依赖必须提前声明
    
*   • **CMD**：引入 `sea.js` 编写模块化，特点是可以动态引入依赖
    
*   • **CommonJS**：NodeJs 中的模块化，只在服务端适用，是同步加载
    
*   • **ES Modules**：ES6 中新增的模块化，是目前的主流
    

本文前三种插件编写方式均属于利用函数自执行（**IIFE**）实现的插件，同时在向全局注入插件时兼容了 **CommonJS** 规范，但并未兼容 AMD CMD，是因为目前基本没有项目会使用到这两种模块化。

自动化 API 文档
==========

私以为一个好的 **JS** 插件决不能没有一份文档，如果别人使用你的插件，他不可能去查看源码才知道这个插件有哪些方法，是做什么的，要传哪些参数等。这里我们使用 **JSDoc** 来创建 **API 文档**，它使用简单，只需要在代码中编写规范的**注释**，即能根据注释自动生成文档，一举多得，非常优雅！

```
npm install --save-dev jsdoc open
```

修改 **package.json**，增加一条脚本命令：

```
.......
"scripts": {
    ......
    "doc": "jsdoc dist/main.es.js && node server.js"
},
```

根目录下创建文件 **server.js**：

```
var open = require('open');open(`out/index.html`); // 这是apidoc默认生成的路径，这里只是为了自动打开网页
```

好了，现在可以使用 `npm run doc` 命令来生成文档了，依然是举个栗子🌰，我们在 **src** 目录下添加一个文件 `ArrayDelSome.js`：

```
/** * * @desc 对象数组去重 * @param {Array} arr * @param {String} 对象中相同的关键字(如id) * @return {Array} 返回新数组，eg: ArrayDelSome([{id: 1},{id: 2},{id: 1}], 'id') -> 返回: [{id: 1},{id: 2}] */function ArrayDelSome(arr, key) {  const map = new Map()  return arr.filter((x) => !map.has(x[key]) && map.set(x[key], true))}export default ArrayDelSome
```

> 本例只演示最基础的用法，**JSDoc** 有许多类型注释大家可以自行搜索学习下，不过本例最基本的这几个注释依旧是够用的。

运行 `npm run doc`，将会打开一个网页，可以查看我们刚写的工具函数：

![](https://mmbiz.qpic.cn/mmbiz_png/EFMcFLSf0WhoUMUbnliaE4hkqznVjlbOghzMG8BcAJAFJSDePSAiclE90ISbt05SktXrKVfuGw56TGQjAI7PdDMg/640?wx_fmt=png)

> 注意在生成文当前需要先进行过 **rollup** 的打包，且不能开启去注释之类的插件，因为上面的例子实际是对 `dist/` 目录下的最终文件进行文档编译的。

发布插件
====

[还没发布过 npm 包？简单几步教会你](http://mp.weixin.qq.com/s?__biz=MzIzNjQ0MjcwNw==&mid=2247483932&idx=1&sn=68919a75a12d6d8a186a41780a1f002e&chksm=e8d68720dfa10e36d7b16e159bf63bcb1baaa3bad0058b203505296ee01bb32b2d33f217ef18&scene=21#wechat_redirect)

### 私有源发布

如果你的公司有私域 npm 管理源，或者平时喜欢用淘宝源，推荐使用 `nrm` 进行切换：

```
npm i nrm -g
```

1.  1. 查看源: `nrm ls`
    
2.  2. 添加源: `nrm add name http//:xxx.xxx.xxx.xxx:4873/`
    
3.  3. 删除源: `nrm del name`
    
4.  4. 使用指定源: `nrm use npm`
    

总结
==

功能较简单的 **JS** 插件我们可以直接采用前三种方式开发，如果涉及 **DOM** 操作较多，可以编写仿 **JQ** 的插件更好用，如果插件功能较多，有可能形成长期维护的大型插件，那么可以采用工程化的方式开发，方便多人协作，配套生成文档也利于维护。