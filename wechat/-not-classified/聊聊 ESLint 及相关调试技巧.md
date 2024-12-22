> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sb6BuZYl998AdKuSULhv0g)

> 来自团队同学「文明」的技术分享。

我是范文杰，一个专注于工程化领域的前端工程师，**近期有不少 HC，感兴趣的同学可联系我内推！**欢迎关注：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GLZBX0Wvv0ssC3ZGEGYBTkvH0NAXqvdbibOUk0ywda9X7PCma2q9MUibQ/640?wx_fmt=png&from=appmsg)

关于 eslint
---------

ESLint 是一个高度**可配置**的 Javascript 代码**静态分析**工具，其中静态分析是指将源码转为 AST 后，基于 AST 进行遍历、应用规则、上报问题；而可配置性则使得 ESLint 能够满足各种项目需求，极大地增强了其功能。例如：

*   **校验规则 (Rules)** ：ESLint 允许根据项目需求灵活配置规则，这些规则集可以作为基础配置，帮助开发者快速上手并维护一致的代码风格。社区中常见的 ESLint 规则集包括：
    

*   `eslint-config-airbnb`：遵循 Airbnb 的 JavaScript 风格指南。
    
*   `eslint-config-google`：遵循 Google 的 JavaScript 风格指南。
    

*   **扩展插件 (Plugins)** ：ESLint 支持通过插件扩展新的规则，插件可以增加 ESLint 的功能，使其能够处理更多的代码规范和风格要求，例如：
    

*   `@typescript-eslint/eslint-plugin`：用于扩展 TypeScript 的规则。
    

*   **解析器 (Parser)** ：虽然 ESLint 是 JavaScript 的静态分析工具，但其功能并不限于此。通过配置解析器，ESLint 可以解析和处理其他语言，例如：
    

*   `@typescript-eslint/parser`：将 TypeScript 文件解析为 ESTree 兼容的 AST 格式，使 ESLint 能够识别和处理 TypeScript 文件。
    
*   `yaml-eslint-parser`：使 ESLint 能够识别和处理 YAML 文件，并应用相应的规则。
    

*   **处理器 (Processors)** ：ESLint 还可以通过配置处理器来处理其他格式文档中的代码。例如：
    

*   `eslint-plugin-markdown`：可以 lint Markdown 文件中的 JavaScript 和 TypeScript 代码片段。
    
*   `eslint-plugin-html`：可以处理 HTML 文件中的 `<script>` 标签内的代码片段。
    

不过，初学者总容易混淆上面提到的若干概念，这里先集中介绍一下：

* * *

**parser 和 processor 的区别**

不知道大家有没有跟我一样的困惑，为什么 yaml 文件可以通过 yaml-eslint-parser 处理，但是 makdown 或者 html 文件是通过 plugin 的 processors 处理？yaml 文件的 lint 配置：

```
{  "files": ["*.yaml", "*.yml"],  "parser": "yaml-eslint-parser",  "plugins": ["yaml"],  "extends": ["plugin:yaml/recommended"]}  markdown文件的lint配置：{    "files": ["*.md"],    "processor": "markdown/markdown"}
```

*   **解析器（parser）** ：负责将代码转换为 AST，直接影响 ESLint 如何解析文件。
    
    换句话说，代码能够转出 eslint 能够识别的 AST 格式（参考 eslint 的 AST 规范，本质上就是 ESTree 的兼容格式）
    
*   **处理器（processor）** ：负责预处理和后处理文件内容，主要用于处理非 JavaScript 文件中特定的文件片段。比如说，markdown 这种语言并不是一门编程语言，也就没办法转换 Estree 格式的 AST，但是我们却想 lint 其中的 js 代码，就可以通过 plugin 的 preocessor 提取其中的代码片段，然后通过处理。
    

* * *

**config 和 plugin 的区别:**

config 简单理解就是一份完整的 eslint 配置文件，我们可以在配置中通过 extends 的来继承和使用这些配置：

```
{     "parser": "@typescript-eslint/parser",     "plugins": ["@typescript-eslint"],     "extends": [       "eslint:recommended",       "plugin:@typescript-eslint/recommended"     ],     "rules": {       "@typescript-eslint/no-unused-vars": "error",       "no-console": "warn"     },     "parserOptions": {       "ecmaVersion": 2021,       "sourceType": "module"     }   }
```

可能你注意到，plugin 除了可以配置在 plugins 中，也可以配置在 extends，其实 plugin 除了声明规则、processer（预处理器），也可以声明配置，例如声明一份推荐的配置：

```
// plugin configmodule.exports = {    configs: {        recommended: {            plugins: ["myPlugin"],            env: ["browser"],            rules: {                semi: "error",                "myPlugin/my-rule": "error",                "eslint-plugin-myPlugin/another-rule": "error"            }        }      rules: {          'some-rule': {/* rule definition */},      },      processers: { //... }    },
```

extends 里面配置的其实都是一份 eslint 配置，意味着这份配置文件也可以通过 extends 字段配置另一个 eslint 配置，然后另外一个配置文件也可以 extends 配置... ...

事情好像变得复杂一些了，下一节将会专门讲解 eslint 配置的复杂度。

eslint 配置的复杂度
-------------

> 参考：
> 
> 1.  https://eslint.org/blog/2022/08/new-config-system-part-1/
>     
> 2.  https://eslint.org/blog/2022/08/new-config-system-part-2/
>     

你是否有以下困惑：

*   eslint 的配置文件怎么那么多？`.eslintrc.js .eslintrc.cjs .eslintrc.yaml .eslintrc.yml .eslintrc.json package.json`
    
*   `.eslint.js` 的 plugin 配置和 config 配置为什么要写字符串？为什么要省略 eslint-config？而不是完整的 npm 包名？
    
*   怎么莫名其妙有一些新的规则？
    
*   我的规则配置怎么没有生效？plugin 好像没有生效？
    
*   ......
    

其实 eslint 最早期只支持 `.eslintrc` 配置（本质上是 json 格式），作为特性后面支持让用户使用更多格式的配置文件，也就看到上述的这么多配置文件。

yml 和 json 是可以相互转换的，倒也还好，但是 js 的对象并不能完全转换为 json。例如 plugin 中的配置是可以配置使用正则表达式，但是 json 文件中其实不方便配置正则（虽然可以通过一些方法去解析)，越来越多 plugin 支持配置 js 语法，这也让后续 js 文件的配置格式逐渐成为主流。

但是为了兼容 json 格式的配置，config 和 plugin 保留了使用字符串的特性，其实就是为了配置的简洁性，其实是约定的可以省略一些配置前缀。

这意味着如何去加载和处理这些配置的完全是 eslint 自己去处理的（eslint 如果解析不到声明的这些包，配置将会无效），但是我们共享和发布的 config 或者 plugin 的包对于他们依赖的 config 或者 plugin 或者 parser，官方推荐而只需声明 `peerDependency`（因为即使声明 dependency，eslint 的还是按照自己的安装路径进行解析）

这个特性在 npm v3 之前都是没有问题的，因为 npm3 会自动安装 `peerDependency`，但是之后 npm 取消了这个特性......

很常见的，我们要安装使用一个 config，我们还要安装好多其他包，以确保 eslint 能够正确解析。比如我们要使用：`eslint-config-airbnb-typescript`，安装后进行 eslint 配置：

```
extends: [ 'airbnb-typescript']
```

但是这个 config 其实还依赖 `@typescript-eslint/eslint-plugin` 和 `@typescript-eslint/parser`，所以我们还需要手动安装这两个依赖，才能正常工作。这也是一些规则或者插件没有生效的原因之一。

除了使用 `extends` 复用 eslint 的配置，eslint 还有一个早期就支持的特性叫配置级联（`configuration cascade`）。

eslint 会根据当前 lint 文件的位置一直往他的上层文件夹找 eslintrc 配置文件并且合并这个配置，直到找到配置了 "root":true 的配置文件或者到用户配置目录 `~/.eslintrc` 。

此外 eslint 还支持配置 overrides 配置，让允许我们用 glob 表达式匹配文件，然后使用不同的规则。例如 overrides 可以针对 ts 文件和 js 文件配置不同的规则，当然 overrides 里面也是可以使用其他 config 的。

```
"overrides": [    {      "files": ["**/*.ts", "**/*.tsx"],      "parser": "@typescript-eslint/parser",      "plugins": ["@typescript-eslint"],      "extends": [        "plugin:@typescript-eslint/recommended"      ],      "rules": {        "@typescript-eslint/no-unused-vars": ["error"],        "@typescript-eslint/explicit-module-boundary-types": "off"      }    },
```

现在假设我们要用 eslint 检测一个文件，我们该如何获取检测这个文件需要的完整配置呢？

1.  首先 eslint 会通过配置级联特性，逐个文件夹的去查找配置文件...
    
2.  当然如果有多个格式的配置文件，他们有自己的优先级...
    
3.  找完了所有的配置文件... 需要找到他们又 `extends` 使用了哪些配置文件... `overrides` 又配置了哪些规则...
    
4.  当然这些配置文件也可能 `extends`其他配置... 当然 `overrides` 也可以`extends` 配置...
    
5.  ....
    
6.  最后配置文件解析后，还要根据文件的指令以及 cli 的参数，合成最后的应用规则。
    

对文件应用的过程要合并各种配置，判断各种优先级，总而言之十分复杂和繁琐，连 eslint 作者本人也摇头。

上面所有的问题都是 eslint8.x（我们项目中使用的版本）存在的，但是 eslint9.x 已经完全重新设计的 eslintrc 配置系统 (8.x 也可以通过环境 ESLINT_USE_FLAT_CONFIG 开启该特性），使用的 flat config，解决了上述的很多问题。感兴趣可以参考本节开头引用的那两篇文章。

Can do and can't do
-------------------

eslint 的原理其实就决定了这个工具能做什么不能做什么？静态语法分析！所有基于静态语法分析能做的事情，eslint 几乎都可胜任。

**能做：**

1.  语法检测。如缺少分号、未定义的变量等。
    
2.  代码风格检测。如缩进、空格、引号类型等。
    
3.  最佳实践。React、React hooks 等框架的最佳实践。
    
4.  代码质量。如未使用的变量、未处理的 Promise 等。
    
5.  自动修复。自动修复一些简单的代码问题。
    
6.  ...
    

* * *

**不能做的：**

1.  运行时错误检测。代码到底跑是怎么样，还得靠自己保证。
    
2.  复杂的逻辑检测。比如一些无法泛化和抽象的场景，因为 JS 语言很灵活，很多问题不太可能静态就检测出来。
    

* * *

**不善于做的：**

1.  系统 IO：虽然通过插件已经可以检测命名规范等功能，但是 eslint 的规则还是不太建议去调用系统 IO 去做一些事情，比如动态的去生成或者读取一些其他信息。
    
2.  跨文件的代码分析：当然，一些 plugin 也已经实现垮文件的分析比如 eslint-plugin-import，它能检测依赖循环等功能。跨文件分析的关键在于通过语法解析到另外一个模块，这个 plugin 通过配置 resolver，内置支持 node 的模块解析逻辑，也支持配置其他的解析逻辑如 webpack、typescript 的解析。所以如果有跨文件解析的需求可考虑直接使用 eslint-modules-uitls
    

一些调试技巧
------

### 1. 如何检测 eslint 规则的性能？

我们可以在 eslint 命令前加上环境变量 TIMING，并且设置为 all 或者 *，就可以得到规则的耗时统计。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GELYdjG4BY3wpQBoyVXcZIA6hnowMaADicEAdez95FjaPuG1kbC47uYA/640?wx_fmt=png&from=appmsg)

> 设置为 * 或者 1，获取前 10 的耗时规则

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4G5kLiaPSYzBCFdBvgmGNBVZLrmz59XUnLKpCkZIm7evdMrBSwdf5DwPQ/640?wx_fmt=png&from=appmsg)

> 设置以为 all，获取所有耗时的规则

### 2. 如何知道某个文件应用了哪些规则？

上面关于 eslint 配置的复杂度介绍到，如果想知道一个文件到底生效和应用了哪些规则，单从配置文件上来看十分难以推断。有两种方法可以帮助我们直接拿到 eslint 最终应用的规则：

*   方法一 ：通过 `--print-config` 命令行参数: `npx eslint --print-config src/index.ts`
    
*   方法二：通过 `DEBUG` 环境变量`eslintrc:*`，这个方法不仅能看到最终的 config，还能看到整个查找和解析的过程: `DEBUG=eslintrc:* npx eslint src/index.t`s
    
*   方法三：通过 vscode eslint 插件的 outpout 日志。
    

*   首先打开 vscode 配置，把 "eslint.debug" 设置为 true，然后 `reload` 重新启动插件，然后打开 vscode 的 output 面板，选择 eslint。
    
*   这个方法不仅能看到 eslintrc 的日志，还能看到整个 eslint 的日志，相当于 `DEBUG=*`。
    
*   也适用于我们想快速验证和调试（而不是通过命令行启动 eslint）一个新的规则在某个文件中的运行情况。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GLRqYgQNUAj0OAk3Q0JnRKeV7DnrXCUPqicp3HYUHQY3zY4CEGr1sibZA/640?wx_fmt=png&from=appmsg)

### 3. 如何快速 debug 分析 eslint 执行逻辑？

eslint 生态基本上都可以通过 `DEBUG` 变量来调试 eslint 运行日志。如果不确定 DEBUG 的名称，可以先直接使用 `DEBUG=*` 运行，然后选择关注自己想要关注的部分。比如：我想关注 `eslint-import` 的 `resolver` 的性能，我可以运行：

```
DEBUG=eslint-import-resolver-typescript,eslint-plugin-import:resolver:* npx eslint ./src/index.ts 
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GkaMzhzrZKoicW0ytlErLje3wFEN7pu8LeWHZ0z2StwOfHLL6nwTEO4Q/640?wx_fmt=png&from=appmsg)

4.  如何详细 debug 分析 eslint 执行逻辑？如果通过日志也无法分析具体问题，除了看源码，我比较喜欢方式是直接 debug 运行代码，参考 node debug。可以运行:
    

```
node --inspect-brk ./node_modules/eslint/bin/eslint.js src/index.ts
```

然后我们可以在 chrome 上一行一行的对源码进行调试，也可以使用 perfomance 面板直接记录火焰图，分析性能问题。

实战: import/no-cycle 性能问题排查
--------------------------

这个是排查 pre-commit 的过程中发现的一个问题：`import/no-cycle` 的性能十分的差，几乎占到所有的时间。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GPoalIeUiandFSq6171PV6g0wpgun02sHOicZj6LKAQLE0uRmtB7Lg02Q/640?wx_fmt=png&from=appmsg)

通过 node debug 和 chrome 的 perfomance 看板分析火焰图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GaAcczR8qSOxTBsW1UdmbUbwDkMFqY6xgfBhW1N1ZaWCur8Yia9WRMCw/640?wx_fmt=png&from=appmsg)

从火焰图可以看出：

*   `lintFiles` 其实就是某个规则检测这个文件所用的时间，发现红框区域的耗时是最久的。
    
*   分析其调用栈，不难看出其一直在递归调用 `processImportedModules`，即使用例只引用了一个文件，但是调用栈已经很恐怖了。
    

归因到 `import/no-cycle` 的逻辑，他其实会递归的分析到的文件的的所有模块都解析一遍。

通过分析其源码发现，其实这个规则的逻辑会通过`ignoreExternal` 这个配置进行剪枝，从而优化性能。

所以，优化方式也很简单，对 `import/no-cycle` 规则配置开启 `ignoreExternal`，该配置会忽略非本项目之外（外部模块）的循环依赖检测（比如 node_modules 里的依赖、workspace 的其他 pkg）。

* * *

**近期有不少 HC，感兴趣的同学可联系我内推！****近期有不少 HC，感兴趣的同学可联系我内推！****近期有不少 HC，感兴趣的同学可联系我内推！**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eiciblk3nDgG7K4JQiapUwzzMZp4GzhBvfE7eVU6ZO2QI1Gfq8qoWlJtxBP4XMGWnyWASVYrw66xCEoDvJA/640?wx_fmt=png&from=appmsg)