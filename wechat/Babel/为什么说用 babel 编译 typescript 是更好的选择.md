> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [zhuanlan.zhihu.com](https://zhuanlan.zhihu.com/p/376867546)

typescript 给 javascript 扩展了类型的语法和语义，让 js 代码达到了静态类型语言级别的类型安全，之前只能在运行时发现的类型不安全的问题，现在能在编译期间发现了，所以大项目越来越多的选择用 typescript 来写。除此之外，typescript 还能够配合 ide 做更好的智能提示，这也是用 typescript 的一个理由。

> 类型安全： 如果一个类型的变量赋值给它不兼容类型的值，这就是类型不安全，如果一个类型的对象，调用了它没有的方法，这也是类型不安全。反之，就是类型安全。类型安全就是变量的赋值、对象的函数调用都是在类型支持的范围内。

最开始 typescript 代码只有自带的 tyepscript compiler（tsc）能编译，编译不同版本的 typescript 代码需要用不同版本的 tsc，通过配置 tsconfig.json 来指定如何编译。

但是 tsc 编译 ts 代码为 js 是有问题的：

tsc 不支持很多还在草案阶段的语法，这些语法都是通过 babel 插件来支持的，所以很多项目的工具链是用 tsc 编译一遍 ts 代码，之后再由 babel 编译一遍。这样编译链路长，而且生成的代码也不够精简。

所以，typescript 找 babel 团队合作，在 babel7 中支持了 typescript 的编译，可以通过插件来指定 ts 语法的编译。比如 api 中是这样用：

```
const parser = require('@babel/parser');

parser.parse(sourceCode, {
    plugins: ['typescript']
});
```

这个插件是 typescript 团队与 babel 团队合作了一年的成果。

但是，这个插件真的能支持所有 typescript 代码么？ 答案是否定的。

我们来看一下 babel 不支持哪些 ts 语法，为什么不支持。

**babel 能编译所有 typescript 代码么？**
-------------------------------

babel 的编译流程是这样的：

![](https://picx.zhimg.com/v2-c388dc6ef662b856c81d05a5f8a8dd13_r.jpg)

*   parser: 把源码 parse 成 ast
*   traverse：遍历 ast，生成作用域信息和 path，调用各种插件来对 ast 进行转换
*   generator：把转换以后的 ast 打印成目标代码，并生成 sourcemap

而 typescript compiler 的编译流程是这样的：

![](https://pic1.zhimg.com/v2-c13c17e354cc5cdf2a79ebfef552d8ca_r.jpg)

*   scanner + parser： 分词和组装 ast，从源码到 ast 的过程
*   binder + checker： 生成作用域信息，进行类型推导和检查
*   transform：对经过类型检查之后的 ast 进行转换
*   emitter： 打印 ast 成目标代码，生成 sourcemap 和类型声明文件（根据配置）

其实 babel 的编译阶段和 tsc 的编译阶段是类似的，只是 tsc 多了一个 checker，其余的部分没什么区别。

*   babel 的 parser 对应 tsc 的 scanner + parser
*   babel 的 traverse 阶段 对应 tsc 的 binder + transform
*   babel 的 generator 对应 tsc 的 emitter

那么能不能基于 babel 的插件在 traverse 的时候实现 checker 呢？

答案是不可以。

因为 tsc 的类型检查是需要拿到整个工程的类型信息，需要做类型的引入、多个文件的 namespace、enum、interface 等的合并，而 babel 是单个文件编译的，不会解析其他文件的信息。所以做不到和 tsc 一样的类型检查。

**一个是在编译过程中解析多个文件，一个是编译过程只针对单个文件，流程上的不同，导致 babel 无法做 tsc 的类型检查。**

那么 babel 是怎么编译 typescript 的呢？

其实 babel 只是能够 parse ts 代码成 ast，不会做类型检查，会直接把类型信息去掉，然后打印成目标代码。

这导致了有一些 ts 语法是 babel 所不支持的：

*   const enum 不支持。const enum 是在编译期间把 enum 的引用替换成具体的值，需要解析类型信息，而 babel 并不会解析，所以不支持。可以用相应的插件把 const enum 转成 enum。
*   namespace 部分支持。不支持 namespace 的跨文件合并，不支持导出非 const 的值。这也是因为 babel 不会解析类型信息且是单文件编译。

上面两种两个是因为编译方式的不同导致的不支持。

*   export = import = 这种 ts 特有语法不支持，可以通过插件转为 esm
*   如果开启了 jsx 编译，那么 <string> aa 这种类型断言不支持，通过 aa as string 来替代。这是因为这两种语法有冲突，在两个语法插件 (jsx、typescript) 里，解决冲突的方式就是用 as 代替。

这四种就是 babel 不支持的 ts 语法，其实影响并不大，这几个特性不用就好了。

**结论：babel 不能编译所有 typescript 代码，但是除了 namespace 的两个特性外，其余的都可以做编译。**

babel 是可以编译 typescript 代码，那么为什么要用 babel 编译呢？

**为什么要用 babel 编译 typescript 代码？**
---------------------------------

babel 编译 typescript 代码有 3 个主要的优点：

### **产物体积更小**

### **tsc**

tsc 如何配置编译目标呢？

在 compilerOptions 里面配置 target，target 设置目标语言版本

```
{
    compilerOptions: {
        target: "es5" // es3、es2015
    }
}
```

typescript 如何引入 polyfill 呢？

在入口文件里面引入 core-js.

```
import 'core-js';
```

### **babel7**

babel7 是如何配置编译目标呢？

在 preset-env 里面指定 targets，直接指定目标运行环境（浏览器、node）版本，或者指定 query 字符串，由 browserslist 查出具体的版本。

```
{
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    chrome: 45
                }
            }
        ]
    ]
}

{
    presets: [
        [
            "@babel/preset-env",
            {
                targets: "last 1 version,> 1%,not dead"
            }
        ]
    ]
}
```

babel7 如何引入 polyfill 呢？

也是在 @babel/preset-env 里面配置，除了指定 targets 之外，还要指定 polyfill 用哪个（corejs2 还是 corejs3），如何引入（entry 在入口引入 ，usage 每个模块单独引入用到的）。

```
{
    presets: [
        [
            "@babel/preset-env",
            {
                targets: "last 1 version,> 1%,not dead",
                corejs: 3,
                useBuiltIns: 'usage'
            }
        ]
    ]
}
```

这样可以根据 @babel/compat-data 的数据来针对的做语法转换和 api 的 polyfill：

**先根据 targets 查出支持的目标环境的版本，再根据目标环境的版本来从所有特性中过滤支持的，剩下的就是不支持的特性。只对这些特性做转换和 polyfill 即可。**

![](https://pica.zhimg.com/v2-26f3a932e6df2e56416afeae41d4d26c_r.jpg)

而且 babel 还可以通过 @babel/plugin-transform-runtime 来把全局的 corejs 的 import 转成模块化引入的方式。

显然，用 babel 编译 typescript 从产物上看有两个优点：

*   能够做更精准的按需编译和 polyfill，产物体积更小
*   能够通过插件来把 polyfill 变成模块化的引入，不污染全局环境

从产物来看，babel 胜。

### **支持的语言特性**

typescript 默认支持很多 es 的特性，但是不支持还在草案阶段的特性，babel 的 preset-env 支持所有标准特性，还可以通过 proposal 来支持更多还未进入标准的特性。

```
{
    plugins: ['@babel/proposal-xxx'],
    presets: ['@babel/presets-env', {...}]
}
```

从支持的语言特性来看，babel 胜。

### **编译速度**

tsc 会在编译过程中进行类型检查，类型检查需要综合多个文件的类型信息，要对 AST 做类型推导，比较耗时，而 babel 不做类型检查，所以编译速度会快很多。

从编译速度来看， babel 胜。

总之，从编译产物大小（主要）、支持的语言特性、编译速度来看，babel 完胜。

但是，babel 不做类型检查，那怎么类型检查呢？

**babel 和 tsc 的结合**
-------------------

babel 可以编译生成更小的产物，有更快的编译速度和更多的特性支持，所以我们选择用 babel 编译 typescript 代码。但是类型检查也是需要的，可以在 npm scripts 中配一个命令：

```
{
    "scripts": {
        "typeCheck": "tsc --noEmit"
    }
}
```

这样在需要进行类型检查的时候单独执行一下 npm run typeCheck 就行了，但最好在 git commit 的 hook 里（通过 husky 配置）再执行一次强制的类型检查。

**总结**
------

typescript 给 js 扩展了静态类型的支持，使得代码能够在编译期间检查出赋值类型不匹配、调用了没有的方法等错误，保证类型安全。

除了 tsc 之外，babel7 也能编译 typescript 代码了，这是两个团队合作一年的结果。

但是 babel 因为单文件编译的特点，做不了和 tsc 的多文件类型编译一样的效果，有几个特性不支持（主要是 namespace 的跨文件合并、导出非 const 的值），不过影响不大，整体是可用的。

babel 做代码编译，还是需要用 tsc 来进行类型检查，单独执行 tsc --noEmit 即可。

babel 编译 ts 代码，相比 tsc 有很多优点：产物体积更小，支持更多特性，编译速度更快。所以用 babel 编译 typescript 是一个更好的选择。

更多内容，见掘金小册[《babel 插件通关秘籍》](https://juejin.cn/book/6946117847848321055)。