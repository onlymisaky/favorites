> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/H6w7JZbY9-A0cBIiS-SGLA)

前言  

=====

大家好，我是 Fly 哥， 好久没写文章了。最近组长无意间提了个需求，**如何统一项目中组件的引用的次数？？**？ 听到这个立马来了兴趣， 心想着可以 webpack 的 loader 去做， 当时脑子里的第一时间想法 是用这个去做的，**后面从优化的角度的考虑还是开发了一个自定义 plugin 目前已经发布到 npm 上了**

如图：

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Z7xUNZIjSwgvqMGyYRfPIhzUHsal4M8iavctbckYxV1zyBS0wtZM5mBA/640?wx_fmt=png)image-20220319214923462

读完本篇文章你可以学到什么

1.  如何开发一个 webpack 插件
    
2.  如何使用 rollup + ts 进行打包
    
3.  发布一个属于自己的 npm
    

webpack
=======

Webpack 想必大家都很熟悉， 面试天天问， **你会 webpack? 你知道 webpack 的原理是什么？？** 这里我就不都说了， 已经好多文章说过， 但是看别人写的， 自己不去写一遍，永远是学不会的。

手写 webpack 核心原理

https://github.com/wzf1997/webpack-study

上面 这两个网址 一篇讲 webpack 核心原理的， 另一个 是我自己手写的简易版本的 webpack， 实现起来 还是比较简单的。

我们先看下 webpack 的大体构建流程：

1.  ![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Zap3fcIRrHrsgEbyAicUZ6YiaKS1B78506lah8j54oAGTVE6nMXHyicRkg/640?wx_fmt=png)webpack
    

**第一步初始化参数阶段**
--------------

这一步会从我们配置的`webpack.config.js`中读取到对应的配置参数和`shell`命令中传入的参数进行合并得到最终打包配置参数

所以一般在实际开发中 会用 **webpack-merge** 。

**第二步准备编译阶段**
-------------

这一步我们会通过调用`webpack()`方法返回一个`compiler`方法，创建我们的`compiler`对象，并且注册各个`Webpack Plugin`。找到配置入口中的`entry`代码，调用`compiler.run()`方法进行编译。这一步 后面我会重点分析

**第三步模块编译**
-----------

从入口模块进行分析，调用匹配文件的`loaders`对文件进行处理。同时分析模块依赖的模块，递归进行模块编译工作。常用的 loader: **ts-loader, thread-loader, cache-loader,  css-loader,babel-loader**。这里就是会涉及到 AST ，而大家写自定义 loader 就可以在这里操作了， loader 本质是拿到 source, 经过一些处理， 在 return 出去，有利于下一个 loader 去拿对应的 source， 有点像 promise 的链式调用， 这里 我就不带大家演示了，推荐这一篇文章，

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZPlicFkn5uPF5wiaWEBNqJfeJHctyyhFfORiayZPA9kbiczCjxWBwt3KfCg/640?wx_fmt=png)loader

多图详解 webpack loader 机制  https://juejin.cn/post/6992754161221632030

**第四五步完成编译和输出文件**
-----------------

在递归完成后，每个引用模块通过`loaders`处理完成同时得到模块之间的相互依赖关系。输出文件阶段 整理模块依赖关系，同时将处理后的文件输出到`ouput`的磁盘目录中。

webpack 插件
==========

这时候有人就会问， 那么 webpack 自定义的插件 是发生在哪里的。 `Webpack`中的插件机制就是基于 Tapable 实现与打包流程解耦，插件的所有形式都是基于`Tapable`实现。

**Tapable 包**本质上是为我们更方面创建自定义事件和触发自定义事件的库，类似于`Nodejs`中的`EventEmitter Api`。

所以在 webpack 存在了各种各样的钩子，既然有了这些钩子，我们就可以监听 webpack 开始的过程 ，完成的过程，或者说所有静态资源打包的过程，我们都可以进行一些骚操作，然后 就出现了 市面上的各种各样的插件。其实 webpack 的这种架构模式，我们是值得思考的，看后面业务是不是也可以用到类似的操作。

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZAaGkZiblksGUJCVtJjcxRDfWEcK3dAkrn0KX00ldgoiaJrpuwv6bE2Cg/640?wx_fmt=png)发布订阅模式

有接触过`webpack`插件开发的同学，或多或少可能都有了解过。**任何一个`webpack`插件都是一个类 (当然类本质上都是 funciton 的语法糖)，每个插件都必须存在一个`apply`方法**。

这个`apply`方法会接受一个`compiler`对象。我们上边做的就是依次调用传入的`plugin`的`apply`方法并且传入我们的`compiler`对象。

> 这里我请你记住上边的流程，日常我们编写`webpack plugin`时本质上就是操作`compiler`对象从而影响打包结果进行。

apply
-----

这时候有同学还是不理解，可能是有点蒙， 我们回到上面的第二步 **准备编译阶段**， 这个准备编译阶段 到底做了什么事情

1.  合并参数
    
2.  创建 compiler 对象
    
3.  然后加载插件函数 ，也就是遍历插件数组，然后调用每个插件实例的 **apply** 方法
    

**我下面写下伪代码** 方面你理解

```
function webpack(options) {  // 合并参数  const mergeOptions = _mergeOptions(options);  // 创建compiler对象  const compiler = new Compiler(mergeOptions);  // 加载插件  _loadPlugin(options.plugins, compiler);  return compiler;}// 加载插件函数function _loadPlugin(plugins, compiler) {  if (plugins && Array.isArray(plugins)) {    plugins.forEach((plugin) => {      plugin.apply(compiler);    });  }}module.exports = webpack;
```

这下你应该就该看明白了吧， 这就解释了为什么 我们编写的 webpack plugin 总是要有 apply 方法了。

然后这个 compiler 上面就有各种各样的钩子， 你就可以结合自己的需求去写一个自定义插件了。

统计组件次数
======

需求背景
----

**为什么要有这个东西，技术本质上是用来解决问题的。我们增长 C 端 游戏组，沉淀了一套公共游戏组件库， 其实是推动设计去做统一样式规范， 减少测试周设计验收时长，不然每次改样式太痛苦了， 如果改的是公共组件，一人修改，别人用了也不会出错， 从我们的角度思考， 如何知道哪一个组件的引用次数比较多，进行重点封装， 进行组件升级， 而且也足够有理由推动设计去说，你在这么多业务都用的这个组件， 这个也和之前的一样吧， 大大减少开发时间。他们也减少验收时间，何乐而不为呢？？所以就去搞了下，难度不大，但是意义重大。**

技术分析
----

首先分析了我们公共组件的引用方式 都是下面这种方式的

```
import { ViewPager, ViewPagerRef, Image } from '@growth/ui'
```

其实就可以生成 AST 的过程中， 我们做一个统计就好了，我们看下面这张图：

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZqTG9fxTxMHkgbwCLCowFjYFzCJPwG6oPFkHe2a0eFsZGXhkZmPJKfg/640?wx_fmt=png)AST

其实对于我们而言，我不需要改变生成的结果， 我只需要生产之前，做一个数据统计。这里有同学就会问， 我哪里知道 上面经过词法分析、语法分析后 会是什么样子呢？ 这里给大家分享一个网站

Ast 在线解析 https://astexplorer.net/

在这里我输入我们所需要的

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Z0RKfJGicbfISCjdm3kicibDGtkV6Ny1IUMsz7mJKxfQtvuvVJpg7srZMA/640?wx_fmt=png)ast 解析

然后我们会看到这么一个结构， 然后 可以找到 我们的 组件 名 和  引用的包名字，那么我可以去监听 webpack 遍历所有文件， 一但碰到对应的 节点 ，我们将他存储下来， 就可以了。

我这个时候去 webpack 官网 我们找到了这个 hook

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZDDzQXdp7LEDsOuUNHyTP9vhsTJWklGEdibfBtqmZdibRib6AQ7TqTjkNQ/640?wx_fmt=png)

`compiler` 使用 `NormalModuleFactory` 模块生成各类模块。从入口点开始，此模块会分解每个请求，解析文件内容以查找进一步的请求，然后通过分解所有请求以及解析新的文件来爬取全部文件。在最后阶段，每个依赖项都会成为一个模块实例。

`NormalModuleFactory` 类扩展了 `Tapable` 并提供了很多了生命周期的钩子， 大体就是上面 一个模块从 解析到生成的各个过程，这里我们找到 parser, 也就是解析这个文件 头部  有 import 这里的时候

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Z6zsHUZR5CYicGHqryzRGCkxWic1ftP5ic15rObHnMGGhAlM9YqrrqOibcQ/640?wx_fmt=png)parser

这里的其实对于我们要处理的 类型 就是  **esm**， 或者是全部的 **auto** , 这里的话 我就选择   auto 我写下了 下面 这段代码：

```
apply(compiler: Compiler) {
    const parser = (factory: any) => {
      factory.hooks.parser.for('javascript/auto').tap('count-webpack-plugin', (parser: any) => {
      })
    }
    compiler.hooks.normalModuleFactory.tap('count-webpack-plugin', parser)
  }
```

Tap  后面的名字是 自定义的 你可以随便取， 保持全局单一性就可以。

而我们拿到 parser 他其实也是一个钩子

可以看到下面这张图：

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZZe5QXO6cnB3MHUAZAviaNSswdSd78aKpXbgrhJdV2KvVkAJT1WU7gUQ/640?wx_fmt=png)parser HOOK

这里其实就是 webpack 处理文件， 进行 AST 留下的各种各样的钩子，我们自然就可以找到  **importSpecifier**, 我们看下下面这个例子：

index.js
--------

```
import _, { has } from 'lodash';
```

myPlugin
--------

```
parser.hooks.importSpecifier.tap(  'MyPlugin',  (statement, source, exportName, identifierName) => {    /* First call    source == 'lodash'    exportName == 'default'    identifierName == '_'  */    /* Second call    source == 'lodash'    exportName == 'has'    identifierName == 'has'  */  });
```

一看 原理， 钩子的 callback 对应的四个参数 而我们想要的 可能就是  最后一个 **identifierName**， 还有一个是 **source**

Source 其实就是对应着我们 插件 传入的文件名，  所以 构建整个 webpack 的过程 中， 有多少个符合， 我们的 callback  就会执行多少次，所以结果还是非常准确的。

```
const parser = (factory: any) => {      if (!this.opts.startCount) {        return      }      factory.hooks.parser.for('javascript/auto').tap('count-webpack-plugin', (parser: any) => {        parser.hooks.importSpecifier.tap('count-webpack-plugin', (_statement: string, source: string, _exportName: string, identifierName: string) => {          if (source.includes(this.opts.pathname)) {            this.total.len = this.total.len + 1            const key = identifierName            this.total.components[key] = this.total.components[key]              ? this.total.components[key] + 1              : 1          }        })      })    }
```

这里 其实就是数据进行一个统计， 统计完之后你需要去展示嘛 ，

```
compiler.hooks.normalModuleFactory.tap('count-webpack-plugin', parser)compiler.hooks.done.tap('count-webpack-plugin-done',done)
```

所以在 apply 方法的时候 同样也监听了 打包结束的钩子， 这个我们就可以在打包结束在控制 进行输出了。

为了让控制台 变得 有颜色 ，与其他打包 输出 不形成 干扰， 引入了  **chalk**

这是我统计我们项目组件的截图

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Ztzl1zeQOhasaibO2rlt05dXIoDUoIIFY1aCY7z7elCrpicPBlo4ODiamw/640?wx_fmt=png)最后出现这样的结果

这下其实就是一目了然了。

打包和发布
=====

好了整个文件写好了， 我看了下没有 100 行代码， 所以这里的打包，我选择了 rollup , 相对于 webpack,  rollup 对 treeShaking 支持友好。而且没有辣么重, 对于 npm 包 或者是 js-sdk 去打包 感觉用起来 也很方便。因为我们只需要打包一个简答的 bundle， 不需要太多其他的功能。我们在实际工作中，还是灵活选择对应的工具。

安装 TS
-----

```
yarn add typescript -D
```

生成 tsconfig.json 文件，用来配置 ts 的编译选项：

```
npx tsc --init
```

然后项目的根目录 就会生成  tsconfig.json

这里给大家推荐一篇文章：

https://juejin.cn/post/6844904178234458120 掌握 tsconfig.json

安装 rollup
---------

到了关键的环节，我们的代码是 ESM 规范的，并且是由 TS 书写的。我们要将它打包，提供给 Node 或者浏览器直接使用，因此我们可以用 rollup 对代码进行处理。

在项目文件 新建 **rollup.config.js**

由于我们是 ts 文件 ，所以安装   **rollup-plugin-typescript2**  用于处理 ts 文件

```
yarn add rollup-plugin-typescript2 -D
```

紧接着我们定义我们的输入

```
const path = require('path')import ts from 'rollup-plugin-typescript2'const getPath = _path => path.resolve(__dirname, _path)// 解析paconst pkg =  require('./package.json')const extensions = [    '.js',    '.ts',]const tsPlugin = ts({    tsconfig: getPath('./tsconfig.json'), // 导入本地ts 配置    extensions})const outputs = [    {file: pkg.main, format: 'cjs' },    {file: pkg.module, format: 'esm'}]export default {    input: 'src/main.ts', // 入口    output: outputs,  // 输入的文件类型    plugins: [        tsPlugin    ]}
```

就这么一个简单的配置我们 就配置好了，这里我讲一下 package.json

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Z5EbXAE1779iaLoZFCTZMTKg5fHxh2iaTAb4ZZn4bc0giaxHXEzrFhoZMA/640?wx_fmt=png)pkg

**main**  其实就是对应的 是 npm 包的入口文件 ，一般是 **common js**

**module** 字段就是引入 npm 包  如果支持 esm 优先会加载这个文件

**types**  就是对应的 打包的后 d.ts 文件

然后我们进行打包 rollup

```
rollup -c
```

然后 会发现 打包发现控制台

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZRPdDpd7iaicOUmHP1vdyEqhJh3wADFBnGx4Qprd2wIaCvN6gupuiaRhvw/640?wx_fmt=png)终端

就是我们这依赖的 没有打包进去

我们看下 common js 的目录：

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2Zzyn1ia7L9YR5wLo8PpZFBXpnaZqCBVEuhNpYvJLcvoU6dBqnM3VpGZw/640?wx_fmt=png)content

果然是没有打包进去的， 其实就 rollup 在打包过程中 ， 面对当前模块 引用其他模块的时候，会导致打包失败，这里我们安装一下这个插件

```
 yarn add rollup-plugin-node-resolve -D
```

> 在某些时候，您的项目可能取决于从 NPM 安装到 node_modules 文件夹中的软件包。

与 Webpack 和 Browserify 等其他捆绑软件不同，Rollup 不知道如何 `` 开箱即用''如何处理这些依赖项 - 我们需要添加一些插件配置。

rollup.js 编译源码中的模块引用默认只支持 ES6 + 的模块方式 import/export。然而大量的 npm 模块是基于 CommonJS 模块方式，这就导致了大量 npm 模块不能直接编译使用。所以辅助 rollup.js 编译支持 npm 模块和 CommonJS 模块方式的插件就应运而生。

```
@rollup/plugin-commonjs
@rollup/plugin-node-resolve
```

配置到 插件 列表后 就可以了 。

发布
--

所有准备工作已经做好了， 如何发布到 npm 包 上

1.  去 npm 官网 注册一个账号
    
2.  然后 进入 我们当前目录
    

```
npm login 
```

输入账号 和密码  就可以了

然后输入

```
npm publish
```

每一次发布前，记得修改 package.json 的版本 ，然后发布就可以了

总结
==

本篇文章是从一个简单的小需求本身，一步一步去分析问题，最终解决问题。大家如果觉得写的还不错的话，欢迎试用！！

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kgKuKdpHU0XMsKpoHsXzic2ZTQLUGNhDn1ibW1D4Y7w19ntg09urMyshyZ6qkLzibHUJLVocV42Ah5dw/640?wx_fmt=png)组件