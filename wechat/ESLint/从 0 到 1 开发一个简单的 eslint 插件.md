> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/mMyVpmno7F7UfpQulZEcXQ)

> ❝
> 
> 前言：eslint 我们常应用在代码静态扫描中，通过设定的 eslint 的语法规则，来对代码进行检查，通过规则来约束代码的风格，以此来提高代码的健壮性，避免因为代码不规范导致应用出现 bug 的可能。而规则是自由的，你可以设定内部自己团队适用的规则，也可以直接使用开源社区比较热门的`规则集合`, 比如 airbnb、eslint-plugin-vue 等
> 
> ❞

1.eslint 的配置
------------

> ❝
> 
> 手写规则前，让我们重温下 eslint 配置，通常我们是使用`.eslintrc.js`来配置 eslint 的，或者也可以直接`package.json`中定义 eslintConfig 的属性
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfOpWIGFHsobeBKz6RWcMU6iaicVbZYpLgwGzqu8cgpXadqUUEVc4KSGeg/640?wx_fmt=png)

上图 👆 是 eslint 主要的配置，我们简单回顾下每个配置的背后包含的意义

### 1.1 parse

> ❝
> 
> parse 是用来定义 eslint 所使用的解析器，默认是使用`Espree`🔗, 解析器的作用是将代码 code 转化成为一种 AST 抽象语法树，eslint 中叫`ESTree`, 你可以理解为将 code 翻译为`ESLint`能听 👂 懂的话
> 
> ❞

关于 Espree 可以参考下面这个例子

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfUib3N3wDwwM5Q8vSA7xL7OSI8uo7bL6YPNO4A7HzkCiaMkOqgqicuTZOA/640?wx_fmt=png)

而常用的`解析器`还有包括以下几种

*   Esprima: 上文提到 espree 就是基于 Esprima 改良的
    
*   Babel-esLint：一个对 Babel 解析器的包装，当你项目中使用了 babel，babel 的解析器会把你的 code 转换为 AST，然后该解析器会将其转换为 ESLint 能懂的 ESTree。这个目前我们应用的较多，目前也不再维护和更新，升级为`@babel/eslint-parser`
    
*   @typescript-eslint/parser: 将 TypeScript 转换成与 estree 兼容的形式，以便在 ESLint 中使用。
    

对于 AST 的模拟生成，感兴趣的同学可以使用 astexplorer 在线尝试

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvficq7szUXeNibeeBfruM0LY1tQecmFdUUpAF2sOK0Mxzic61euPmwsWkvQ/640?wx_fmt=png)image.png

总结：无论你使用那种解析器，本质是都是为了将 code 转换为 ESLint 能够`阅读`的语言`ESTree`🔗

### 1.2 parseOption

> ❝
> 
> parserOptions 参数是用来控制 parse 解析器, 主要包括以下几个属性 👇，我们挑重点的讲讲
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfAOXWS0QkiaAAmicicmmTVmp4iau4V25JkjLD9kSHOrUBnST1xeeIUvDh6Q/640?wx_fmt=png)parserOptions

*   `ecmaVersion`：用来指定你想要使用的 ECMAScript 版本，默认设置为 5，举个例子：默认情况下，ESLint 支持 ECMAScript 5 语法，但如果你想让 eslint 使用 es6 特征来支持，就可以通过修改 parserOptions 中`"ecmaVersion": 6`
    

### 1.3 rules

> ❝
> 
> rules 就是 eslint 的规则，你可以在 rules 配置中根据在不同场景、不同规范下添加自定义规则详情可参考之前 🌲 树酱的 前端规范那些事
> 
> ❞

### 1.4 extends（扩展） 与 plugins（插件）

> ❝
> 
> extends 和 plugins 很容易混淆，本质是为了加强 eslint 的扩展性，使得我们可以直接使用别人已经写好的 eslint 规则，方便快捷的应用到项目中，有点类似之前文章中 Babel 配置傻傻看不懂？提及的 babel 配置中的 present 和 plugin
> 
> ❞

比如你使用 extends 去扩展 `{ "extends": [ "eslint:recommended", "plugin:react/recommended", "eslint-config-standard", ]}`

但是如果你想用插件，其实等价于 `{"plugin": ['react','standard']}`

⏰ 提醒：官方规定 npm 包的扩展必须以 `eslint-config-` 开头，我们使用过程中可以省略这个开头，上面案例中 eslint-config-standard 可以直接简写成 standard。同样，如果要开发一个 eslint 插件，也是需要以这种形式来命名，下节会介绍

我们再举个列子

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfooWZCpUc4u2NKLckSP0TibZJFQibnGgF7rLgDrZSloEK8ibhs17ZZd9Kg/640?wx_fmt=png)

上图我们通过上面这个配置例子，我们可以看到要么是`plugins:[]`要么是`extends:[]`，通过上图所示的配置二相对于配置一少了`parser`, `parserOptions` 和 `plugins` 等的信息配置，但其实这两个配置最终实现的结果是一致的，这是因为配置二中定义的 extends：`plugin:@typescript-eslint/recommended` 会自动加载上述提到的其他几个配置信息

2 开发 eslint 插件
--------------

> ❝
> 
> 通过上一节对 eslint 的配置的了解，接下来看看如何从 0 到 1 开发一个 eslint 插件。
> 
> ❞

### 2.1 eslint 插件初始化

> ❝
> 
> ESLint 官方为了方便开发者，提供了使用 Yeoman 脚手架的模板 (generator-eslint🔗)。以此方便我们通过该脚手架拉取 eslint 插件模版，对 Yeoman 进一步了解可以阅读 🌲 树酱的前端工程化那些事 - yeoman
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfnpp35Ah4yCmv2ELibk44Ru6OicMNxJibnxGficl4KUQch082hJTaWjfkPg/640?wx_fmt=png)

*   第一步：安装 `npm install -g yo generator-eslint`
    
*   第二步：创建一个文件夹并然后通过命令行初始化 ESLint 插件的项目结构 `yo eslint:plugin`
    
*   第三步：完成插件初始化创建
    

### 2.2 创建 rule 规则

> ❝
> 
> 完成插件项目结构初始化创建后，开始生成 ESLint 插件中具体规则，在 ESLint 插件的项目中执行命令行 `yo eslint:rule`，来生成 eslint 规则的模版，实际效果如下所示
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfxQ65XVFczqkbSVgJatg4cUBtGJLLULiaVEtI5ARWlVoIMmZTjvA9ib4g/640?wx_fmt=png)

创建成功后，我们看下最终的目录结构

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfB6RriaqAiclk1ibibStm9ick6gN6BR1z2swyfSYic5LrzfsvxK6fRCTaOkow/640?wx_fmt=png)

*   docs: 使用文档，描述你编写的规则
    
*   lib/rules 目录：规则开发源码文件 (例如，no-extra-semi.js)
    
*   tests/lib/rules 目录：单元测试文件 (例如，no-extra-semi.js)
    

### 2.3 编写规则

> ❝
> 
> 当完成上面一系列操作之后，eslint 插件模版初步完成，接下来我们找到目录中`lib/rules`中对刚刚创建的 rule 进行开发
> 
> ❞

假设我们有个场景，我们想创建一个规则，用来判读代码中是否存在`console`方法的调用，首先回到第一节提到的`parse解析器`，本质上 rule 的逻辑判断是通过识别 Espree 返回的抽象语法 🌲 去判断，分别针对各种类型定义检查方法。写代码之前，我们先看下 console 返回的 AST 是长啥样？

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfMlrXy5bDxsILp4RrAnKE94bnUpXZp8RwzJBKbUZ1Qnv6JYTh7ib5wFw/640?wx_fmt=png)

通过上图我们可以清晰的看到 `console.log()`是属于 ExpressionStatement(表达式语句) 中的 CallExpression(调用语句)，可以通过 callee 属性中的 object 来判断是否为`console`, 同时也可以利用其 property 属性来判断是 console 的哪种方法，比如`log`、`info`等

so~ 我们开始`造玩具`, 我们通过在 create 返回的对象中，定义一个 CallExpression 方法，当 ESLint 开始对 esTree 遍历时，通过对调用语句的监听，来检查该调用语句是否为 console 调用，代码如下 👇

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfdOrJfT328XlLroAHJOvWkXdRk0HicevpF5VE8A34ibOa4eOqyWUP0N1Q/640?wx_fmt=png)

每条 rule 就是一个 node 模块，其主要由 meta 和 create 两部分组成，重点讲下下面两个 👇

*   meta: 代表了这条规则的元数据，包含类别，文档，可接收的参数的 schema 等, 其中主要提下 schema，如果指定该选项，ESLint 可以通过识别的传参，避免无效的规则配置（排除校验），可参考下节介绍的单元测试的中传递的 options
    
*   context.report()：它用来发布警告或错误（取决于你所使用的配置）
    

🌲 推荐阅读：

*   Eslint - Working with Rules
    

### 2.4 单元测试

> ❝
> 
> 当完成 eslit 插件开发后，我们需要对开发完的插件进行验证，以此来保证规则校验功能的正常使用。eslint 插件开发项目结构中默认使用了`mocha`作为单元测试框架
> 
> ❞

我们对`tests/rules/treegogo.js`单元测试文件进行修改，定义 invalid 与 valid 的不同例子

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfl0XVjGumofNMyeKMMmJmylWIKbicdoYJ7aEkrbBESiaicNP3W56VK4mjw/640?wx_fmt=png)

最后执行

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfmleNgqLIR2E0LFLCnK7TXU0T7UhiaFeTYgxaNQVVc9YFUqgyA49fyvQ/640?wx_fmt=png)

### 2.5 关于发布

> ❝
> 
> 在发布之前，还需要对 packjson 中 main 定义入口文件即`lib/index.js`，暴露出 rules 与 configs
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_png/lXoAxSVgJib25OaGEDiamNZoz8v17hZfvfer9YlgYuVexNjwDlcO4zuSHFkcuDz2P3mkgiaicn4Juzojhc3m1GPyjQ/640?wx_fmt=png)

> ❝
> 
> 👨🎓 啊宽同学：那我如何定义一个包含配置的集合呢？
> 
> ❞

是的，官方文档描述：你可以在一个插件中在 configs 键下指定打包的配置。当你想提供不止代码风格，而且希望提供一些自定义规则来支持它时，会非常有用。每个插件支持多配置，然后当你使用的时候，可以通过这样使用 `{ "extends": ["plugin:tree-eslint/myConfig"] },`这就包含预设好的规则配置

最后是 npm 发布 `npm pulish`

### 2.6 如何使用

> ❝
> 
> 通过第一节的配置的介绍，我们需要有个`.eslintrc`文件，如果目录没用可以通过命令行`eslint -init`初始化，配置好后，安装刚刚开放好的 eslint 插件
> 
> ❞

配置一可以对我们开发的那个 rule 进行配置：error,warn,off，如果需要对部分做排除就加上 option，也可以像配置二引用预设好的扩展 extends