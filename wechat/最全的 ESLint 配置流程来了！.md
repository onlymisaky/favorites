> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/k2ComniGiMmFXD-3yk746g)

在前端开发中，代码质量和一致性至关重要。「ESLint」 是帮助你提升代码质量的关键工具，尤其是在使用 「Vue」 和 「React」 进行开发时，合理配置和使用 ESLint 能够大幅提升开发效率和代码质量。但是，你知道如何在 「VSCode」 中无缝集成 ESLint，并让它自动为你提示和修复代码问题吗？如果还不清楚，赶紧学习，否则你可能已经落后了！
==================================================================================================================================================================================

目前您可能还用不到这篇文章，不过可以先收藏起来。希望将来它能为您提供所需的帮助！也欢迎在评论区分享你的问题或见解。

~ 简单说一下 ESLint 是做什么的 ~
----------------------

ESLint 是一款强大的工具，它能够实时检测并修复代码中的错误，确保你的代码风格一致、质量高，减少潜在的 bug。无论你是一个人开发还是团队协作，通过 ESLint，你可以：

1.  **「实时提示」**：在你编写代码的同时，ESLint 插件会及时指出语法错误和风格问题，让你第一时间修正。
    
2.  **「自动修复」**：配置自动修复配置后，ESLint 会在你保存文件时自动修复常见错误，如缩进、引号类型等，省时省力。
    
3.  **「统一风格」**：通过 ESLint 配置，你和团队可以遵循一致的编码风格，提高代码的可读性和维护性。
    
4.  **「减少错误」**：ESLint 能帮助你捕获未定义变量、未使用变量等潜在错误，降低 bug 发生的概率。
    

遵循 ESLint 规则能确保你的代码始终符合最佳实践，为项目的长期维护和功能扩展打好坚实基础。

🔥🔥只需 5 步，搞定 ESLint 集成
-----------------------

### 1. 初始化 Vue 3 项目（以 Vue 3 示例）

如果还没有 Vue 3 项目，可以通过 Vue CLI 来创建：

```
npm install -g @vue/cli
vue create my-vue3-project
```

在创建过程中，可以选择默认配置或自定义配置。

### 2. 安装 ESLint

进入项目目录，安装 ESLint 及相关插件（node 1）：

```
cd my-vue3-projectnpm install eslint eslint-plugin-vue --save-dev
```

注意：如果你的 `eslint` 版本 `>9.0.0`，那么 node 为（`^18.18.0`、`^20.9.0` 或 `>=21.1.0`）。我的 `eslint` 版本是 `9.8.0`，`node` 版本是 `v18.17.1`。

### 3. 初始化 ESLint 配置

使用以下命令初始化 ESLint 配置文件：（这里操作可能会有问题，请查看常见问题处理）

```
npx eslint --init
```

在初始化过程中，ESLint 会问你一些问题来帮助生成适合你项目的配置文件。下面是一个示例的交互过程：

```
How would you like to use ESLint? …  您希望如何使用ESLint…
  To check syntax only  仅检查语法
❯ To check syntax and find problems  检查语法并发现问题
  To check syntax, find problems, and enforce code style 检查语法、发现问题并强制执行代码样式
```

就这样，一步一步选择适合你项目的所需的配置。

```
✔ How would you like to use ESLint? · problems✔ What type of modules does your project use? · esm✔ Which framework does your project use? · vue✔ Does your project use TypeScript? · No / Yes✔ Where does your code run? · browser✔ What format do you want your config file to be in? · JavaScriptThe config that you've selected requires the following dependencies:eslint-plugin-vue@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest? Would you like to install them now with npm? › No / Yes
```

这将生成一个 `eslint.config.mjs` 文件（小于 v9.0.0 版本会生成`.eslintrc.js`），包含初始配置。不过这不重要，因为它们的本质都是一样的。下面是我配置 Vue3 项目时，eslint（v9.8.0）自动生成的配置（扁平配置格式）:

```
// eslint.config.mjsimport globals from "globals"; // 常见全局变量的库（如 window、document 等）import pluginJs from "@eslint/js"; // ESLint 官方提供的 JavaScript 规则插件import tseslint from "typescript-eslint"; // TypeScript ESLint 插件，允许解析和检查 TypeScript 代码import pluginVue from "eslint-plugin-vue"; // Vue.js 的 ESLint 插件，用于解析和检查 Vue 文件export default [  {       files: ["**/*.{js,mjs,cjs,ts,vue}"]   }, // 指定 ESLint 要检查的文件类型，包括 JS、MJS、CJS、TS 和 Vue 文件  {       languageOptions: { globals: globals.browser }   }, // 为浏览器环境设置全局变量选项，允许代码中使用这些全局变量而不会触发 ESLint 警告  pluginJs.configs.recommended, // 使用 ESLint 官方推荐的 JavaScript 规则配置  ...tseslint.configs.recommended, // 使用 TypeScript ESLint 推荐的规则配置  ...pluginVue.configs["flat/essential"], // 使用 Vue.js 插件提供的基本规则配置  {       files: ["**/*.vue"], // 针对 Vue 文件做特殊配置      languageOptions: {           parserOptions: { parser: tseslint.parser }      } // 指定 TypeScript ESLint 解析器来解析 Vue 文件中的 `<script>` 块  },];
```

### 4. 配置 ESLint

然后我又在 `eslint.config.mjs` 文件中添加特定的 ESLint 配置（一般项目够用了）。如果项添加更丰富的配置，见官网 ESLint 配置或者中文网 ESLint 配置。

```
import globals from "globals";import pluginJs from "@eslint/js";import pluginVue from "eslint-plugin-vue";import standard from "eslint-config-standard";export default [  // 指定文件匹配模式  {    files: ["**/*.{js,mjs,cjs,ts,vue}"],  },  // 指定全局变量和环境  {    languageOptions: {      globals: globals.browser,      ecmaVersion: 12, // 使用最新的 ECMAScript 语法      sourceType: "module", // 代码是 ECMAScript 模块    },  },  // 使用的扩展配置  pluginJs.configs.recommended,  pluginVue.configs["flat/essential"],  standard,  // 自定义规则  {    rules: {      indent: ["error", 2], // 缩进使用 2 个空格      "linebreak-style": ["error", "unix"], // 使用 Unix 风格的换行符      quotes: ["error", "single"], // 使用单引号      semi: ["error", "never"], // 语句末尾不加分号      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off", // 生产环境中警告 console 使用，开发环境中关闭规则      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off", // 生产环境中警告 debugger 使用，开发环境中关闭规则    },  },];
```

注意，这里也是可以通过环境判断是否执行某些配置。

### 5. 执行 ESLint 检查

你已经生成了 `eslint.config.mjs` 文件，这是 ESLint 的配置文件，定义了代码检查规则和文件类型。

在你的 `package.json` 文件中，添加以下脚本，以便在本地开发或构建时运行 ESLint：

```
{  "scripts": {    "lint": "eslint . --ext .js,.mjs,.cjs,.ts,.vue",    "lint:fix": "eslint . --ext .js,.mjs,.cjs,.ts,.vue --fix"  }}
```

*   `lint`: 这个脚本会检查当前项目根目录及其子目录中的所有文件，使用 `.js`, `.mjs`, `.cjs`, `.ts`, `.vue` 扩展名。
    
*   `lint:fix`: 这个脚本会检查并尝试自动修复可修复的问题。
    

你还可以将 ESLint 集成到你的构建过程中。更新 `package.json` 文件中的 `scripts` 部分，以便在构建之前运行 ESLint：

现在，你可以通过以下命令来检查和修复代码：

```
npm run lint
```

```
npm run lint:fix
```

注意：ESLint 的 `--fix` 选项只能自动修复那些被标记为 “可自动修复” 的规则错误，例如代码格式化、简单的语法修正等。但对于一些复杂的规则，`--fix` 可能无法处理，您需要手动修复这些问题。

思考：我们不能在每次编码后都去触发命令，从而通过 eslint 校验代码。那么有没有简单快捷的方法呢？

我们希望在本地运行时，部署打包时，都能运行 eslint，而不是去触发 npm run lint，怎么处理？

更深入的集成（开发、打包时自动检查和修复）
---------------------

详细介绍如何在 Vite、Webpack 中集成 ESLint，并在 CI/CD 流程中保持代码的高质量。同时，我们还将讨论如何在本地开发环境中，持续运行 ESLint 进行代码检查。

### Vite 集成

在 Vite 项目中，我们可以使用 `vite-plugin-eslint` 插件，这样不仅可以在开发过程中进行代码检查，还可以在打包时进行验证。

首先，安装插件：

```
npm install vite-plugin-eslint --save-dev
```

然后在 `vite.config.js` 中进行配置：

```
import { defineConfig } from 'vite';import vue from '@vitejs/plugin-vue';import eslintPlugin from 'vite-plugin-eslint';export default defineConfig({    plugins: [        vue(),        eslintPlugin({            // 可以在这里传入自定义配置            // 默认会读取项目中的 .eslintrc.js 文件        })    ]});
```

你也可以直接配置插件的选项：

```
eslintPlugin({    include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.ts'],  // 指定要检查的文件和目录。    exclude: ['node_modules/**', 'dist/**'], // 排除不需要检查的文件和目录。    fix: true,  // 在保存文件时自动修复 ESLint 问题。    cache: false // 禁用 ESLint 缓存，以便每次都执行完整检查。})
```

注意：千万不要小瞧这个`include`、`exclude`，这两个配置可以帮助我们再老项目中，检查和自动修复分批进行。

通过这种方式，你不仅能在开发阶段发现并修复代码问题，还能在打包时确保代码的质量。

### Webpack 集成

在 Webpack 项目中，可以使用 `eslint-webpack-plugin` 插件。这能够让 ESLint 在每次构建时检查代码，并根据需要自动修复问题。

首先，安装插件：

```
npm install eslint-webpack-plugin --save-dev
```

接着在 `webpack.config.js` 中配置：

```
const ESLintPlugin = require('eslint-webpack-plugin');module.exports = {    // 其他 Webpack 配置    plugins: [        new ESLintPlugin({            extensions: ['js', 'vue', 'ts'], // 指定要检查的文件类型            fix: true, // 启用自动修复功能            cache: true, // 启用缓存，提高检查性能            exclude: 'node_modules', // 排除的目录            failOnError: true, // 如果有错误则使构建失败        })    ]};
```

通过这种方式，无论是开发还是生产环境的构建，都能确保代码质量不会下降。

### CI/CD 集成

在持续集成 / 持续交付（CI/CD）流程中，集成 ESLint 是确保代码质量的重要一环。以下是如何在 GitHub Actions 和 GitLab CI 中集成 ESLint：

*   **「GitHub Actions」**:
    

```
name: CIon: [push, pull_request]jobs:  lint:    name: Lint Code Base    runs-on: ubuntu-latest    steps:      - uses: actions/checkout@v3      - name: Install Dependencies        run: npm install      - name: Run ESLint        run: npm run lint
```

*   **「GitLab CI」**:
    

```
stages:  - linteslint:  stage: lint  script:    - npm install    - npm run lint
```

通过在 CI/CD 流程中集成 ESLint，可以在每次提交或合并请求时自动检查代码，确保代码符合团队的编码标准。

使用 Git Hooks（代码库的处理）
--------------------

为了防止不符合标准的代码进入代码库，可以通过 Git Hooks 在提交代码时自动运行 ESLint。使用 `husky` 和 `lint-staged` 工具，你可以轻松实现这一点。

### 安装 `husky` 和 `lint-staged`

```
npm install husky lint-staged --save-dev
```

### 配置 `package.json`

在 `package.json` 中添加以下配置：

```
{  "husky": {    "hooks": {      "pre-commit": "lint-staged"    }  },  "lint-staged": {    "*.{js,mjs,cjs,ts,vue}": "eslint --fix"  }}
```

这样，每次提交代码时，`lint-staged` 会运行 ESLint 并自动修复可修复的问题。

同志们，到这里关于 eslint 自动化在项目的运行就实现。但是我们可以会遇到一些问题，请参考下面处理！

常见问题处理
------

### 1、You can also run this command directly using 'npm init @eslint/config'.

执行 `npx eslint --init` 时，出现问题。这个问题是你的项目中初始化一个 ESLint 配置，但是你遇到了一个错误。错误信息表明存在与 npm 会话相关的问题，可能是因为一个可选依赖项安装失败。

检查下 `node` 版本，建议使用 `node 16+`，我用的是`v16.14.2`。

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibsv3KNAy96eVv5rD5FtPLbuiauCibxLicrUhgOtX2tTprrIEhPleV9vtxXZiaW4M9CicSYCyd6RHWJDGYQ/640?wx_fmt=other&from=appmsg)

### 2、eslint 版本不一致

如果你是新项目，那么按照上面的配置来，很少出现问题。但是如果你是在老项目上重新加 eslint，我的建议是非必要不加。

但是如果需要加的话，建议你先完成 “执行 Eslint 检查”，然后触发 npm run lint，看下有哪些文件、代码出现问题。而且你可能刚出现以下问题：

```
[plugin:vite-plugin-eslint] Failed to load plugin '@typescript-eslint' declared in '.eslintrc.js': Class extends value undefined is not a constructor or null
```

有时候，`@typescript-eslint` 插件的版本较旧可能与较新的 ESLint 版本不兼容。以下是解决此问题的一些步骤：

1、更新 `@typescript-eslint` 插件。尝试将 `@typescript-eslint` 插件更新到最新版本。使用以下命令更新：

```
npm install @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest --save-dev
```

2.  确保 `vite-plugin-eslint` 插件是最新的。
    

```
npm install vite-plugin-eslint@latest --save-dev
```

3、清除缓存并重新安装依赖。删除 `node_modules` 和 `package-lock.json`，然后重新安装所有依赖：

```
rm -rf node_modules package-lock.json
npm install
```

5.  手动运行 ESLint 检查。确保 ESLint 本身可以正常运行。在项目目录中，使用以下命令运行 ESLint：
    

```
npx eslint src --ext .js,.ts,.vue
```

如果以上步骤没有解决问题，可以参考 ESLint、`@typescript-eslint` 和 `vite-plugin-eslint` 的官方文档和 GitHub 问题跟踪器，看看是否有类似问题的解决方案。

### 3、Invalid option '--ext' - perhaps you meant '-c'?You're using eslint.config.js, some command line flags are no longer available.

```
> eslint . --ext .js,.mjs,.cjs,.ts,.vueInvalid option '--ext' - perhaps you meant '-c'?You're using eslint.config.js, some command line flags are no longer available. Please see https://eslint.org/docs/latest/use/command-line-interface for details.
```

在使用 `eslint.config.mjs` 配置文件时，ESLint 的命令行选项有所不同。`--ext` 选项在使用新的 `eslint.config.*` 文件时不再可用，因为文件扩展名可以直接在配置文件中指定。

已经在 `eslint.config.mjs` 文件中指定了匹配模式为 `**/*.{js,mjs,cjs,ts,vue}`，这会告诉 ESLint 自动处理这些扩展名的文件，因此无需在命令行中指定 `--ext`。

**「使用 `eslint` 命令直接运行：」**

直接使用一下命令：

```
eslint .
```

如果您需要进一步自定义检查的目录或文件，可以在命令行中指定目录或文件路径，而无需使用 `--ext` 选项。例如：

```
eslint src/
```

### 4、ConfigError: Config (unnamed): Key "rules": Key "constructor-super": structuredClone is not defined

```
> eslint .Oops! Something went wrong! :(ESLint: 9.8.0ConfigError: Config (unnamed): Key "rules": Key "constructor-super": structuredClone is not defined
```

相比上面那种费时的配置处理，下面这种方式，不失为最简单的方式之一，直接跳过打包工具的配置，由开发工具来进行 ESLint 的检查、修复。

🔥🔥借助编辑器和 IDE（一直在项目中配置失败怎么办？）
------------------------------

我们集成 ESLint 到编辑器或 IDE，这是非常快捷简单的操作。

大多数现代编辑器和 IDE（如 VSCode、WebStorm、Sublime Text 等）都支持 ESLint 插件。通过安装 ESLint 插件，可以实现以下功能：

*   **「实时检查」**：在你编写代码时，编辑器会自动运行 ESLint，并在代码中标记出不符合规则的地方。
    
*   **「自动修复」**：在保存文件时，编辑器可以自动运行 ESLint 的 `--fix` 选项，自动修复简单的问题。
    

### 1、安装 IDE 中的 ESLint 插件

1.  打开 VS Code: 打开你的 Vue 3 项目。
    
2.  进入扩展市场: 点击左侧活动栏中的 “扩展” 图标。
    
3.  搜索 ESLint: 在搜索框中输入 “ESLint”。
    
4.  安装插件: 找到 ESLint 插件后，然后点击 “安装”。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibsv3KNAy96eVv5rD5FtPLbu6vfnKtxbl8I9odoFuKC6iapk27WvEXhJbLNGkRmbwMAO0ZDickbMUhVA/640?wx_fmt=other&from=appmsg)

### 2. 配置项目目录 .vscode/settings.json

为了让 ESLint 插件在保存文件时自动检查和修复代码问题，你需要在项目根目录下的 `.vscode/settings.json` 文件中创建或更新以下配置：

```
{    "editor.codeActionsOnSave": {        "source.fixAll.eslint": true    },    "eslint.validate": [        "javascript",        "javascriptreact",        "vue"    ]}
```

*   **「`editor.codeActionsOnSave`」**: 这个配置项确保在保存文件时，VS Code 会自动应用所有 ESLint 规则进行修复。
    
*   **「`eslint.validate`」**: 这个配置项指定哪些文件类型将由 ESLint 插件进行验证。在这里，我们添加了 JavaScript、JavaScript React 和 Vue 文件。
    

是不是很简单，但是这个前提是需要新入职的员工在 IDE 先安装插件，可能有的刚入行的老师不熟练，所以这个有点微瑕。但是这个不失为是一个简单快捷的代码规范方式。

来看看，实际应用效果
----------

假设你在 VS Code 中编辑一个 Vue 组件文件 `HelloWorld.vue`，并且 ESLint 配置要求使用单引号，但你使用了双引号：

```
<template>  <div class="hello">Hello, World!</div></template><script>export default {  name: "HelloWorld"}</script>
```

如果 ESLint 配置要求使用单引号，并且你在 VS Code 中保存文件时，ESLint 将会自动将双引号修复为单引号：

```
<template>  <div class='hello'>Hello, World!</div></template><script>export default {  name: 'HelloWorld'}</script>
```

总结
--

通过项目集成 ESLint，你可以实时检测和修复代码问题，确保代码质量的一致性。这有助于保持代码的一致性和可读性。而我们也可以通过在开发工具 VS Code 中集成 ESLint，这两者不仅可以实时获得代码提示，而且还能在保存时自动修复问题，从而提高开发效率和代码质量。

希望这篇文章对你有所帮助！如果你在配置或使用过程中遇到问题，欢迎在评论区分享你的问题或见解

**「你有什么关于 ESLint 集成的经验或问题吗？欢迎在评论区分享你的见解或提问！**