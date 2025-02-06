> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/B6mgjbF8kvHYlDUfEM-W2A)

ESlint 过去、现在、未来
===============

前言
--

2023 年 10 月 26 日，ESlint 的作者发布了一篇公告，宣布将在未来的 ESlint 版本中逐渐弃用核心格式化规则，建议用户使用其他的 formatter 工具，而 ESlint 也将回归成为更加纯粹的 lint 工具。

2024 年 4 月 5 日，ESlint9 正式发布，ESlint 发布了一个很重要的内容：`Flat Config` 扁平化配置。

过去，ESlint 仅仅是一个用于维护代码质量的一个工具，但是随着`Flat Config`的发布，以及由于官方放弃格式化规则带来的社区自由发展，ESlint 在做好一个维护代码质量的工具的同时，也具有更多的可能性。

让我们来看一下 ESlint 的 Flat Config 的发展时间线

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9go0QYmTMgnrw5byIWwsjL79QbhDqcw0MFX1pILWgKTw9xaMiaVLNbxlr4CiajEELQtibdTJPjFbLlw/640?wx_fmt=png&from=appmsg)Flat Config 的发展时间线

可以看到，`Flat Config`这个方案早在 2019 年就发布了意见征求稿。而纵观 2019-2024 这长达五年的时间跨度上，ESlint 团队似乎一直在为`Flat Config`的推出做工作（实际上，从官方的 Blog 中也能发现这点），这让我不禁好奇，到底是什么样的痛点，让 ESlint 团队可以让 ESlint 为`Flat Config`的更新布局谋划这么长时间。这在`Flat Config`的介绍文章中也许能找到答案。ESLint's new config system, Part 1: Background[1]

推出 Flat Config 的前因后果
--------------------

#### 问题一、extends 属性

> ❝
> 
> The first significant change to eslintrc was with the introduction of the `extends` key. The `extends` key, borrowed lovingly from JSHint, allowed users to import another configuration and then augment it

第一个痛点就是配置文件中的 `extends`属性，`extends`属性设置的初衷是参考 JSHint，为了让用户可以更加方便的导入另一个配置，并进行自定义的修改或者增强。例如

```
{  "extends": ['./.other-config.json'],  "rules": {    "semi": "warn"  }}
```

`extends`的使用本身是好的，让用户可以基于 npm 分享一些自己配置的规则集，让 ESlint 的更加的方便快捷。但是简单的使用`extends`导入其他的配置带来了一系列的规则级联上的问题，这让 eslint 团队苦不堪言。

而对于使用者来说，`extends`关键字在底层的逻辑是通过 require 导入其他的包实现的规则拓展，在配置文件中仅仅是几个字符串，这需要使用者花费额外的心智去了解自己配置的这些内容都在哪个位置，并通过寻找`node_modules`文件夹，或者查阅相关文档才能知道究竟配置了哪些规则。

#### 问题二、多格式支持

> ❝
> 
> As part of a refactor, we discovered that it would be trivial to allow different config file formats. Instead of forcing everyone to use a nonstandard `.eslintrc` file, we could formalize the JSON format as `.eslintrc.json` and also add support for YAML (`.eslintrc.yml` or `.eslintrc.yaml`) and JavaScript (`.eslintrc.js`). For backwards compatibility we continued to support `.eslintrc` because it was a trivial amount of code to keep around.

eslint 的配置文件是支持多种格式的。本意是想增加兼容性，但是添加 JS 格式的配置文件导致他与非 JS 格式之间出现了一些不兼容的情况。

#### 问题三、可共享的配置和依赖项

前面提到，`extends`的底层实现是使用`require()`引入对应的包。这就导致在 npm v3 之前，ESLint 建议将插件作为 `peer dependencies`而不是 `dependencies`来包含在可共享配置中，才能让 `require()` 正确解析对应的依赖包。但是 npm 在 v3 版本中停止了对 `peer dependencies`自动安装的功能，导致出现了依赖于此行为的所有共享配置都出现了异常。尽管后面 npm 恢复了自动安装 `peer dependencies`，但是对 eslint 的社区伤害已经造成，且难以挽回

#### 问题四、`overrides`也支持`extends`

本身 overrides 的推出是解决 extends 级联问题的最好时机，但是官方并没有这么做，并且后续还在`overrides`中添加了额外的`extends`属性，这种逻辑的堆叠对于配置使用方，和 eslint 维护者而言都增加了复杂度，造成了很大的负担。

`Flat Config`的配置方案
------------------

在上一节的内容中，我们已经对 ESlint 早期版本的一些痛点有了初步的了解，那么`Flat Config`方案是如何处理这些痛点的？

#### 配置文件的对比

在 eslint9 中，eslint 的配置文件仅支持 js 文件格式，彻底解决了不同文件格式带来的兼容问题，以下是两种配置方式的案例

*   早期配置文件：`.eslintrc.js`
    

```
module.exports = {    env: {      browser: true,      es2021: true,      node: true    },    extends: ['eslint:recommended'],    overrides: [      {        files: ["**/*.{js,jsx,ts,tsx}"],        plugins: ["react", "jsx-a11y"],        extends: ["plugin:react/recommended"],      },    ],    parser: '@typescript-eslint/parser',    parserOptions: {      ecmaVersion: 'latest',      sourceType: 'module'    },    plugins: ['react', '@typescript-eslint', 'react-hooks'],    rules: {      '@typescript-eslint/no-var-requires': 0,    }  };
```

*   Flat Config：`eslint.config.js`
    

```
import js from '@eslint/js'  import globals from 'globals'  import reactHooks from 'eslint-plugin-react-hooks'  import reactRefresh from 'eslint-plugin-react-refresh'  import tseslint from 'typescript-eslint'    export default tseslint.config(    { ignores: ['dist'] },    {      extends: [js.configs.recommended, ...tseslint.configs.recommended],      files: ['**/*.{ts,tsx}'],      languageOptions: {        ecmaVersion: 2020,        globals: globals.browser,      },      plugins: {        'react-hooks': reactHooks,        'react-refresh': reactRefresh,      },      rules: {        ...reactHooks.configs.recommended.rules,        'react-refresh/only-export-components': [          'warn',          { allowConstantExport: true },        ],      },    },  )
```

#### `extends`的处理

在旧版本的配置中，`extends`使用字符串的方式隐式地引入插件，在 eslint 的内部使用 required 加载内容。在新版本的配置中，`extends`拓展配置时，需要先将待拓展的插件以 ESM 的`import`的方式显式地导入，然后在 extends 中进行配置拓。

对于使用者而言，他们能更加清晰、便捷的找到自己拓展的依赖在 node_modules 中的源码，方便查看一些配置的规则，简化了规则的理解。对于 eslint 团队而言，显式地导入插件也能解决配置依赖的问题。可谓一举多得。

#### `plugins`的处理

在旧版本的配置中，`plugins`主要是一个数组的形式，通过输入插件的名称，在 eslint 内部确定需要加载的插件，最终实现插件的引入。这种方式本身没有太多的问题，但是由于`plugins`和`rules`往往是有联动的。比如：

```
module.exports = { //...  plugins: [ '@typescript-eslint'],  rules: {    '@typescript-eslint/no-var-requires': 'off',  }}
```

这代表着`no-var-requires`这个自定义的 rule 是属于`@typescript-eslint`这个插件的。在某些场景下，插件的作者可能期望修改自己插件的名称，或者用户使用另一个拥有相同规则的插件，比如将`@typescript-eslint`修改为`ts-eslint`。此时配置文件就需要修改为

```
module.exports = { //...  plugins: [ 'ts-eslint'],  rules: {    'ts-eslint/no-var-requires': 'off',  }}
```

如果配置文件中的规则过长，更改插件名字后需要重新配置的内容将会非常多，增加使用者负担。

因此在`flat config`中，`plugins`属性被定义为一个对象，key 是可自定义的插件的名字，value 则是显式导入进来的插件代码。这么做的好处在于提供了配置者自定义插件名称的功能。

```
// 原配置export default [  {     plugins: {      'react-refresh': reactRefresh,    },    rules: {      'react-refresh/only-export-components': 'off'    },  }]// 改名后export default [  {     plugins: {      'refresh': reactRefresh,    },    rules: {      'refresh/only-export-components': 'off'    },  }]
```

基于`Flat Config`的新生态
-------------------

#### Config Inspector

前面提到，在 eslint 中，由于可以便捷地拓展他人的配置，导致配置者在某些情况下自己都不清楚到底配置了什么内容，需要按照 extends 的内容分别去查看他们的源码或者查询文档，并且每一条规则适用与什么场景也并不了解。举个经常出现的例子。`no-unused-vars`这个规则，在 eslint 的基本规则和`eslint-typescript`插件中都有使用，我们可能期望禁用这条规则

```
{  rules: {    'no-unused-vars': 'off'  }}
```

此时我们再看编辑器。会发现出现了`eslint-typescript`发出的`no-unused-vars`的异常，这一定程度上拉低了开发效率。

所以在 eslint9 中。eslint 官方采取了开源大佬 Anthony Fu 制作的 Config Inspector，通过收集规则，在本地起一个 nuxt 服务来展示具体配置的规则。在 Configs 这个 Tab 中可以通过输入文件的路径 + 名称来确定应用到这个文件上有哪些规则，非常的清晰明确。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9go0QYmTMgnrw5byIWwsjLZpibSiaFETZYUmJBo1scTGgAPia5vh4Osiayq9JiaGwkgVL8HOsv6gEoHdA/640?wx_fmt=png&from=appmsg)Config Inspector

#### 工厂函数方案

工厂函数的配置方案，在非`Flat Config`场景下也适用，而`Flat Config`的发布让工厂函数配置方案具有更高的灵活度。

首先我们有一个共识，不论什么技术栈，本质还是 js、ts、css 这些内容，在 eslint 的规则上有很大一部分雷同的内容。因此很容易就想到可以通过工厂函数，组合不同的框架、不同语言的对应的 eslint 规则，最终返回一个配置对象，实现配置工厂化。但是实际操作起来，在配置的可拓展性上存在一定的缺陷。

这时候就可以用到 eslint-flat-config-utils[2] 这个工厂化配置工具。他提供的`composer`工具支持链式调用配置，在需要拓展时，可以在`.append`中配置自定义的一些内容，保证工厂化的同时也提供了相当大的灵活性。

```
// eslint.config.mjsimport { composer } from 'eslint-flat-config-utils'export default composer(  {    plugins: {},    rules: {},  }  // ...some configs, accepts same arguments as `concat`)  .append(    // appends more configs at the end, accepts same arguments as `concat`  )  .prepend(    // prepends more configs at the beginning, accepts same arguments as `concat`  )  .insertAfter(    'config-name', // specify the name of the target config, or index    // insert more configs after the target, accepts same arguments as `concat`  )  .renamePlugins({    // rename plugins    'old-name': 'new-name',    // for example, rename `n` from `eslint-plugin-n` to more a explicit prefix `node`    'n': 'node'    // applies to all plugins and rules in the configs  })  .override(    'config-name', // specify the name of the target config, or index    {      // merge with the target config      rules: {        'no-console': 'off'      },    }  )
```

#### ESLint Stylistic[3]

eslint 是否应该具有格式化功能，这是一个在社区迟迟没有讨论出结果的问题。对于大对数人而言，eslint + prettier + stylelint 的方案似乎已经是一种最佳实践了。但是在笔者看来，一个项目配置三套规则，在任何时候都是一种负担，prettier 的 “读取和重新输出” 的方法会丢弃源代码中的所有风格信息，比较典型的一个点就是 printWidth 的强制换行。因此，笔者个人更推荐仅使用 eslint 一套规则通吃的配置方案，简化配置、减轻负担。

我在前言中也提到，eslint 官方将在 9.0 级以后版本中逐渐弃用核心格式化规则，但是社区对 eslint 拥有格式化功能的需求并未减少，于是社区成员就将 eslint 中的格式化规则进行了单独的移植、封装、拓展，发布了 ESLint Stylistic。

他总共包含了三个迁移插件和一个额外引入的补充规则插件

*   `eslint` -> `@stylistic/eslint-plugin-js`  `eslint` -> `@stylistic/eslint-plugin-js`
    

*   迁移的 JavaScript 风格的规则
    

*   `@typescript-eslint/eslint-plugin` -> `@stylistic/eslint-plugin-ts`  `@typescript-eslint/eslint-plugin` -> `@stylistic/eslint-plugin-ts`：
    

*   TypeScript 的风格规则
    

*   `eslint-plugin-react` -> `@stylistic/eslint-plugin-jsx`  `eslint-plugin-react` -> `@stylistic/eslint-plugin-jsx`
    

*   框架无关的 JSX 的风格规则
    

*   `@stylistic/eslint-plugin-plus`
    

*   ESLint Stylistic 引入的补充规则
    

在配置上，和其他的 eslint 插件配置思路相同，以下是示例代码

```
// eslint.config.jsimport stylistic from '@stylistic/eslint-plugin'export default [  stylistic.configs.customize({    // the following options are the default values    indent: 2,    quotes: 'single',    semi: false,    jsx: true,    // ...  }),  // ...your other config items]
```

#### 配置的 TypeScript 提示

Flat Config 的显式导入修改而形成的完整的上下文，让 ESlint 生成类型提示成为了可能，这就是 eslint-typegen[4] 他只需要在 eslint 配置外面添加一个`typegen`函数，他就能从规则中自动推断生成类型，并为规则选项提供自动补全和类型检查。

```
/// <reference path="./eslint-typegen.d.ts" />import typegen from 'eslint-typegen'export default typegen(  [    // ...your normal eslint flat config  ])
```

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9go0QYmTMgnrw5byIWwsjLQf23btXB0hKhiarpu1uy4Bjn8m8X9ZZHWcOWKDJArVmqiaScicGLFaCYQ/640?wx_fmt=png&from=appmsg)eslint-typegen

ESlint 的未来
----------

ESlint9 发布至今，选择主动升级 eslint 的大型开源项目仍然是少数（比如 react），而 ESlint 放弃 formatter 的规则似乎也已经做好了完全成为一个优秀的 Linter 工具的准备。但是对于社区，ESlint 却不止于此，ESlint 拥有强大的 IDE 插件，以及优秀的 cli 工具，与其将 ESlint 作为一个纯粹的 Linter 工具，不如打破桎梏，发觉一些新的可能。

那么 ESlint 可以是什么？

#### 更多语言通用的 linter+formatter

> ❝
> 
> ESLint now officially supports linting of JSON and Markdown[5]
> 
> Taking our first steps towards providing a language-agnostic platform for source code linting.

ESlint 目前已经添加了对 markdown 和 json 的支持，文章的副标题叫做 “迈出第一步，提供一个与语言无关的源代码静态分析平台。”，可以见得 ESlint 未来对多语言支持的一个发展方向。而社区又拥有 ESlint Stylistic 这类格式化工具，在未来 ESlint 或将成为多语言通用的代码规范和格式化工具。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9go0QYmTMgnrw5byIWwsjLfF5acbAJRKEdUMHiagibReYWJtrgELSBbiamdpmGQLiapaq4ibVkeRAQIXQ/640?wx_fmt=png&from=appmsg)eslint 宣布支持 markdown 和 json

#### 更强大的 AST 分析处理工具

ESlint 的本质是对代码的 AST 分析，同时，由于其完善的 ide 插件体系和 cli 命令工具体系，结合其 AST 分析的底层逻辑，ESlint 或许在 AST 处理上有更多的可能性。

比如 ESLint Plugin Command[6]，利用注释命令触发对应的 eslint 规则，达到想要的修复目的

![](https://mmbiz.qpic.cn/mmbiz_gif/T81bAV0NNN9go0QYmTMgnrw5byIWwsjLOX0JDUibZ3ibLx8qE0ib1reHAAOQsczcfHfUqrXMGibw1gReLm3gIn6JXQ/640?wx_fmt=gif&from=appmsg)ESLint Plugin Command

总结
--

随着时代的发展和技术的演变，ESlint 从最初作为比 JSHint 更灵活的 Linter 工具，逐步演变成支持多种语言的静态分析平台。这不仅体现了 ESlint 对时代需求的适应，更推动了整个开发生态的进步。通过彻底推行 Flat Config 方案，ESlint 不仅解决了长期存在的问题，还为自己开辟了一条更加光明的未来道路。

回顾 ESlint 的发展历程，我们可以清晰地看到开源社区的强大动力和影响力，这正是所有开源贡献者最希望看到的结果。展望未来，随着 ESlint 对多语言的深入支持和社区的持续推动，我们有充分的理由相信，ESlint 的未来将是一条充满希望和机遇的康庄大道。

Reference

[1]

ESLint's new config system, Part 1: Background: _https://eslint.org/blog/2022/08/new-config-system-part-1/_

[2]

`eslint-flat-config-utils`: _https://github.com/antfu/eslint-flat-config-utils_

[3]

ESLint Stylistic: _https://eslint.style/_

[4]

`eslint-typegen`: _https://github.com/antfu/eslint-typegen_

[5]

ESLint now officially supports linting of JSON and Markdown: _https://eslint.org/blog/2024/10/eslint-json-markdown-support/_

[6]

ESLint Plugin Command: _https://eslint-plugin-command.antfu.me/_

想了解更多转转公司的业务实践，点击关注下方的公众号吧！