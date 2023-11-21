> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/G7Q52AyNKBxx9SghU6T6vw)

点击上方 前端瓶子君，关注公众号  

回复算法，加入前端编程面试算法每日一题群![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQ7oQ0wGWibI0tksLKwgjgcYaviaU74sLvK2OP2yD9Lrib5UydDXbRsRwUNduyp1XbxNwfSiaiawcy7V5A/640?wx_fmt=png)

1. 前言
-----

大约在四年前，我先后写了《再见，babel-preset-2015》**以及**《为什么我们要做三份 Webpack 配置文件》，在知乎上受到不错的反响，虽然已经过去很多年，但是让我意外的是至今仍有很多读者在阅读和点赞。

前端技术栈在这些年间不断演进，已经发生了很大的变化，但是从零开始打造一个项目仍然是较为困难的事情，网上的文章实在太多太零散，有些几个月前的文章现在看来都会都会过时。我们团队大约在 2018 年切换到了 TypeScript 技术栈，包括 TypeScript + React + AntDesign + GraphQL。

因此，在 2021 年夏末，我想重新写一篇关于前端工程化入门配置的指南。

**本文中即将涉及的技术栈包括**（按照字母表顺序）：

*   **ESLint**：校验你的 TypeScript / JavaScript 代码。
    
*   **CommitLint**：校验你的 Git 提交消息。
    
*   **Git**：主流代码仓库。
    
*   **Husky**：快速添加 Git 钩子的工具。
    
*   **Less**：更友好的样式语言。
    
*   **LintStaged**：校验在 Git `staged` 阶段的代码。
    
*   **Prettier**：可以对各种源文件进行格式化的工具。
    
*   **React**：我们目前使用的前端框架，版本是 `17`。尽管如此，Angular 及 Vue 技术栈的同学依然可以毫无障碍的阅读本文。
    
*   **TypeScript**：不仅包含 JavaScript 的语法，而且还提供了静态类型检查以及面向对象编程特性。
    
*   **Vite**：新一代构建及打包工具，由于在 `dev` 模式下采用了 esbuild 作为底层 bundler，因此大幅提高了构建速度，特别是在开发态。Vite 的周边生态逐步完善中。
    
*   **Webpack**：目前最流行的前端构建及打包工具，本文中的版本是最新的 `5.x`。
    
*   **Yarn**：一个或许比 NPM 更友好、更快捷的包依赖管理工具，我们团队内部已经完全切换至 Yarn。
    

**Vite 的出现为前端工程化带来了显而易见的便利性和开发效率，本文会有两个分支，分别是 Webpack 和 Vite。对应的 Github 也会有 `master` 和 `webpack` 分支，master 使用的是 Vite 构建器。**

**2021 年夏天写的文章虽然可能会过时，但是 GitHub 上的项目会持续更新，欢迎大家 Star 上面的 GitHub 项目。**
--------------------------------------------------------------------

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQ7oQ0wGWibI0tksLKwgjgcYTH588KCl5MiavddQbTpffCcgNFkH9dLSWQQ8lUelY6AJGnaapxSGpzA/640?wx_fmt=jpeg)

点击图中的 Use this template 按钮

> 我已经将该仓库设置为 Github Template，因此，直接点击 Use this template 按钮，即可从该模板创建你自己的项目。

**你也可以点击这里用最新的模板在 Github 上创建新项目。**

* * *

2. 从零开始手工搭建一个新项目
----------------

### 2.1 创建项目目录

首先让我们创建一个新目录作为项目的根目录，目录的命名方式我们建议由英文小写字母及数字组成，单词或数字之间用 `-` 分隔，如 `my-boilerplate` 或 `boilerplate-2021`，不推荐的命名包括 `myboilerplate`、 `MyBolierplate`、`wo-de-mu-ban` 等。

```
mkdir boilerplate-2021
cd boilerplate-2021
```

### 2.2 初始化 Git 仓库

养成好习惯，在每次开始一个新项目的时候，首先要创建 Git 本地仓库，请在项目根路径中执行：

```
git init
```

当然，第 1 步和第 2 步也可以先在 Github 或 Gitlab 上创建好项目，然后通过 `git clone` 命令复制下来。这样带来的好处是在接下来的 `package.json` 中会自动填写上作者、Git Repository 地址等。

接下来在项目根路径中创建一个 `.gitignore` 文件，声明我们不要上传至 Git 的文件：

```
# MacOS / Windows 等系统文件
.DS_Store
Thumbs.db

# Node 依赖目录
node_modules/

# 输出目录
/dist
*.tsbuildinfo

# 日志
*.log

# 运行时数据
pids
*.pid
*.pid.lock

# 集成开发环境配置文件
/.vscode

# ESLint 缓存
.eslintcache
```

> 请注意，以 `/` 开头的路径表示强调必须是根路径下的文件夹；而以 `/` 结尾的路径强调是目录。
> 
> 这里有一份更全的 `.gitignore` 文件，可以作为参考。

### 2.3 创建 `README.md`

通常我们创建的第一个文档就是 `README.md` 文件：

```
# 项目名称

在这里添加项目的概述。

---

## 如何安装

如果这是一个提供给第三方使用的 NPM 包，你需要在这里提供安装命令。

通过 NPM 安装：

```sh
npm install boilerplate-2021
```

或通过 Yarn 安装：

```
yarn add boilerplate-2021
```

如何在本地开发
-------

在这里告诉开发人员如何在本地安装和开发。

```
`README.md` 是可以体现你的开源合作精神的地方，你可以尽可能的让未来使用你的 NPM 包或接手你工作的同学省心省力。这里有一份[开源标准](https://link.zhihu.com/?target=https%3A//github.com/standard/standard/blob/master/README.md)可以参考。`CHANGELOG.md` 也是重要的文件之一，你可以参考这份[开源标准](https://link.zhihu.com/?target=https%3A//github.com/standard/standard/blob/master/CHANGELOG.md)。> 更多文档标准可以参考 [https://github.com/standard/standard/](https://link.zhihu.com/?target=https%3A//github.com/standard/standard/)。### 2.4 生成 `package.json`本文中所有 NPM 包管理工作都交给 [Yarn](https://link.zhihu.com/?target=https%3A//yarnpkg.com/)，如果你对 Yarn 还不熟悉，请参考[这篇文档](https://link.zhihu.com/?target=https%3A//yarn.bootcss.com/docs/install/%23mac-stable)，同时建议参考[这篇文档](https://link.zhihu.com/?target=https%3A//learnku.com/articles/15976/yarn-accelerate-and-modify-mirror-source-in-china)将源设为国内的镜像。> 当然你也可以使用 [PNPM](https://link.zhihu.com/?target=https%3A//pnpm.io/zh/) 取代 `yarn`，本文中将以 `yarn` 为默认的包管理工具。接下来，让我们创建 `package.json` 文件，在项目根路径中执行：```bashyarn init
```

连续若干个 `Enter` 键后，你将看到这样一份简洁代码：

```
{  "name": "boilerplate-2021",  "version": "1.0.0",  "main": "index.js",  "author": "Henry Li <henry1943@163.com>",  "license": "MIT"}
```

> 建议始终通过 `yarn init` 或 `npm init` 创建 `package.json` 文件，并只通过 `yarn` 或 `npm` 命令修改项目的依赖。

### 2.5 引入 TypeScript 技术栈

我们首先要引入的是 TypeScript 技术栈，并且创建 `tsconfig.json`，最简单的方式就是交给 `tsc` 命令：

```
yarn add -D typescript && npx tsc --init
```

上方的命令中我们先借助 `[yarn add](https://link.zhihu.com/?target=https%3A//yarn.bootcss.com/docs/cli/add/)` 命令添加了 TypeScript 的主包，并且通过 Node 提供的 `[npx](https://link.zhihu.com/?target=https%3A//www.ruanyifeng.com/blog/2019/02/npx.html)` 命令直接执行 TypeScript 命令行工具创建默认的 `tsconfig.json`。

> 建议始终先通过 `tsc --init` 命令创建 `tsconfig.json` 文件，并且保留其中的注释。

基于官方的配置文件，建议设置以下选项：

*   `incremental` 设置为 `true`，允许增量编译，有助于加快编译速度。
    
*   `target` 设置为 `ESNEXT`，即直接输出为最新的 ES 标准。
    
*   `module` 设置为 `ESNext`，即面向未来的 ESM 模块化。
    
*   `allowJS` 及 `checkJS` 设置为 `true`，允许编译 JavaScript 文件。
    
*   `jsx` 设置为 `react-jsx`，本文中我们不会使用到 `Babel`，因此是直接通过 `TSC` 将 `JSX` 代码片段编译为 `JS` 代码片段。另外，`react-jsx` 是 TypeScript 在 4.1 引入的新特性，它可以让我们不需要再每一个 `JSX / TSX` 文件中写 `import React from 'react'`语句。
    
*   `outDir` 设置为 `./dist/es`，`dist` 是我们的发行（distribution）根目录，而 `es` 是我们默认的 ESM 模块发行目录。
    
*   `rootDir` 设置为 `./src`，这是我们存放源代码的目录，请顺手创建。
    
*   `strict` 改为 `true`，即启用所有严格类型检查选项。
    
*   `moduleResolution` 改为 `node`，将模块解析模式设为 Node.js。
    
*   `allowSyntheticDefaultImports` 改为 `true`，这样可以让 `import React from 'react'` 这样的语句不会报错。当然如今 `esModuleInterop` 已经默认开启，也会起到隐式声明的作用。
    
*   如果你和我一样需要用到 `decorator` 特性，需要将`experimentalDecorators` 和 `emitDecoratorMetadata` 改为 `true`
    
*   如果开发的是一个 NPM 包项目，`declaration` 需要改为 `true`。
    
*   最后加上 `include` 和 `exclude` 选项，告诉编译器需要编译和忽略什么。
    

这里有一份简明 `tsconfig.json` 作为参考，但是强烈建议按照上面的步骤手工进行配置，并且保留所有的注释及未使用的选项：

```
{  "compilerOptions": {    "target": "ESNEXT",    "module": "ESNext",    "allowJs": true,    "checkJS": true,    "jsx": "react-jsx",    "declaration": true,    "sourceMap": true,    "outDir": "./dist/es",    "rootDir": "./src",    "strict": true,    "moduleResolution": "node",    "allowSyntheticDefaultImports": true,    "esModuleInterop": true,    "experimentalDecorators": true,    "emitDecoratorMetadata": true,    "skipLibCheck": true,    "forceConsistentCasingInFileNames": true  },  "include": ["src/**/*"],  "exclude": ["node_modules"]}
```

接下来，让我们验证一下 TypeScript 的设置，创建并编写 `src/index.tsx`：

```
function hello(name: string) {  console.info(`Hello ${name}`);}hello('world');
```

通过 `tsc` 命令编译并执行：

```
npx tsc && node dist/es/index.js
```

此时，你还需检查在 `/dist/es` 目录中是否包含 TypeScript 声明文件（ `*.d.ts`） 和源代码映射文件（ `*.js.map` ）。如果看见 `/dist/tsconfig.tsbuildinfo` 文件则说明 `incremental` 选项生效了。

> 这里有一篇文章，包含更多关于 `tsconfig.json` 的知识，可以作为参考。

### 2.6 引入 Prettier

在我们写代码前，强烈建议引入 `[prettier](https://link.zhihu.com/?target=https%3A//prettier.io/)`，它会让我们的代码风格更加统一和规范，支持包括 JavaScript、TypeScript、HTML、CSS/LESS 甚至 Markdown 在内的多种文件的格式化。如果你是 VSCode 的用户，你需要提前安装 Prettier - Code formatter 插件。

```
yarn add -D prettier
```

执行上面的命令，并将下面的代码保存为 `.prettierrc` 文件：

```
{  "semi": true,  "singleQuote": true,  "trailingComma": "es5"}
```

在 VSCode 中，你可以通过 `Format Document` 命令执行格式化，也可以通过在 Workspace 配置文件中选中 `Editor: Format On Save` 选项实现保存前自动格式化。

> 曾经 `prettier` 与 `eslint` 之间就格式化问题有过冲突，但你早已不必担心此事，后文中有解法。

### 2.7 引入 ESLint

ESLint 如今已经成为前端代码校验的必备工具，TypeScript 过去需要依赖 tslint 工具进行校验，而现在早已被 ESLint 及一系列的 plugin 取代。安装 ESLint 的命令如下：

```
yarn add -D eslint
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
yarn add -D eslint-config-airbnb eslint-config-airbnb-typescript
yarn add -D eslint-plugin-import eslint-plugin-jsx-a11y
yarn add -D eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
```

这里我们选用的是 eslint-config-airbnb 配置，它对 JSX、Hooks、TypeScript 及 A11y 无障碍化都有良好的支持，可能也是目前最流行、最严格的 ESLint 校验之一。

接下来，创建 ESLint 配置文件 .eslintrc.js：

```
// .eslintrc.jsmodule.exports = {  root: true,  parser: '@typescript-eslint/parser',  extends: [    'airbnb',    'airbnb-typescript',    'airbnb/hooks',    'plugin:@typescript-eslint/recommended',    'plugin:@typescript-eslint/recommended-requiring-type-checking',    'plugin:react/jsx-runtime',    'prettier',  ],  parserOptions: {    project: './tsconfig.json',  },  rules: {    // 在这里添加需要覆盖的规则  }};
```

我们之所以选择 `.js` 的后缀，是为了将来有更好的扩展性，你可以在这里根据上下文及条件 “拼装” 复杂的规则。

由于我们在 `tsconfig.json` 中开启了 `react-jsx` 选项。因此我们需要添加 `plugin:react/jsx-runtime` 这个配置集，这样当我们不去写 `import React from 'react'` 时，ESLint 不会报错。

此外，永远将 `prettier` 放置在 `extends` 的末尾，这是为了关闭其与 ESLint 有冲突的规则。

### 2.8 引入 React 技术栈

前文介绍的技术栈基本没有涉及到前端框架，从本节开始我们将介绍如何快速在 TypeScript 环境中引入 React 17 技术栈，首先通过下面的 2 行命令安装 React 及其 TypeScript 描述。

```
yarn add react react-dom    
yarn add -D @types/react @types/react-dom
```

将 src/index.tsx 的内容修改为：

```
import { render } from 'react-dom';

import { Hello } from './components/Hello';

function App() {
  return <Hello  />;
}

render(<App />, document.getElementById('react-mount-point'));
```

添加 src/components 目录，并且创建 src/components/Hello/index.tsx。我们团队遵循每一个 React 组件代码放置在独立目录的原则。

```
export interface HelloProps {
  className?: string;
  name: string;
};

export function Hello({ className, name }: HelloProps) {
  return <div className={className}>Hello {name}</div>;
}
```

> 本文遵循的是 create-react-app 中的代码风格和标准。你也可以用 type 来声明 HelloProps，通常两者是等价的，除了一些特殊情况。因为我们在 tsconfig.json 中将 compilerOptions.jsx 设置为 react-jsx，因此我们不需要在 TSX 文件中显示引入 react。

* * *

3. Webpack 分支
-------------

作为老牌劲旅，Webpack 依然是 2021 年最流行的打包工具。相对于 Vite 来说它的功能更加强大，但是性能较低且配置复杂度偏高，如果你不想使用 Webpack，可以跳过本章节，直接到 `Vite 分支` 即本文的第 4 节。

### 3.1 引入 Webpack 构建器

本文将以 Webpack 5 为主，首先快速安装 `webpack*`及 `ts-loader`：

```
yarn add -D webpack webpack-merge webpack-cli webpack-dev-server webpackbar clean-terminal-webpack-plugin ts-loader fork-ts-checker-webpack-plugin
```

Webpack 的配置通常会有三份，至于原因可以阅读我多年前的拙文《为什么我们要做三份 Webpack 配置文件》：

*   `common` 通用配置：包含 Webpack 基础通用 配置信息，环境中立。
    
*   `dev` 开发配置：继承自 `base`，包含开发态的特殊配置，为开发环境。
    
*   `prod` 生产配置：同样继承自 `base`，包含线上最终态的特殊配置，为生产环境。
    

所有工程化脚本相关的 `JS` 代码建议都放在项目根路径下的 `scripts` 目录，首先让我们创建 `scripts/webpack/webpack.common.config.js`：

```
// scripts/webpack/webpack.commo.config.jsconst path = require('path');const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');const ProgressBarPlugin = require('webpackbar');module.exports = {  entry: { index: path.resolve(__dirname, '../../src/index.tsx') },  output: {    filename: '[name].js',    path: path.resolve(__dirname, '../../dist'),    clean: true,  },  stats: "errors-warnings",  resolve: {    extensions: ['.ts', '.tsx', '.js', '.jsx'],  },  module: {    rules: [      {        test: /\.tsx?$/,        exclude: /node_modules/,        loader: 'ts-loader',      },    ],  },  plugins: [new CleanTerminalPlugin(), new ProgressBarPlugin()],  optimization: {    usedExports: false,  },};
```

上面的代码是一份包含 `ts-loader` 的极简配置，在本例中无需使用到 Babel 技术栈。

你可以访问 [Webpack 的官方文档](Optimization | webpack 中文文档) 了解和添加更多优化选项。

有了通用配置之后，我们需要定义开发和生产环境下的 Webpack 配置，这里我们通过 `[webpack-merge](https://link.zhihu.com/?target=https%3A//www.webpackjs.com/guides/production/)` 实现继承 `common` 配置。

```
// scripts/webpack/webpack.dev.config.jsconst { merge } = require('webpack-merge');const common = require('./webpack.common.config');module.exports = merge(common, {  mode: 'development',  devtool: 'cheap-module-source-map',  devServer: {    // 添加 webpack-dev-server 开发服务器的配置  }});// scripts/webpack/webpack-prod-config.jsconst { merge } = require('webpack-merge');const common = require('./webpack.common.config');module.exports = merge(common, {  mode: 'production',});
```

为了更好的测试我们的编译结果，你还需要添加 `public/index.html`：

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta http-equiv="X-UA-Compatible" content="IE=edge">  <meta ></script></body></html>
```

`public` 是 `webpack-dev-server` 默认的静态资源目录。

最后，修改 `package.json` ，添加 `scripts` 脚本执行：

```
{  ...  "scripts": {    "build": "webpack --config scripts/webpack/webpack.prod.config.js",    "dev": "webpack serve --config scripts/webpack/webpack.dev.config.js",    "start": "npm run dev"  },}
```

现在，你可以执行 `yarn build` 和 `yarn start` 检查以上 Webpack 配置是否正确。

### 3.2 引入 Less 技术栈

直到目前为止，我们还没有涉及到任何样式相关的技术栈，在本章节中我们将引入 Less 技术栈，同样是从命令行安装开始：

```
yarn add -D less less-loader style-loader css-loader
yarn add classnames
```

> `[classnames](https://link.zhihu.com/?target=https%3A//github.com/JedWatson/classnames)` 库几乎是每一个项目都会用到的经典库。

修改 `scripts/webpack/webpack.common.config.js` 文件，添加如下配置（在 `module.rule` 配置章节中追加）：

```
module.exports = {  ...  module: {    rules: [      ...      {        test: /\.less$/,        exclude: /node_modules/,        use: [          'style-loader',          'css-loader',          'less-loader',        ],      },    ],  },};
```

接下来，我们需要进行测试，添加 `src/components/Hello/index.module.less` 文件：

```
.container {
  color: red;
}
```

> `*.module.less` 的文件将被编译为 `*.module.css` 并输入到 `css-loader`。`css-loader` 会默认将为 `.module.css` 结尾的文件自动开启 CSS 模块化。因此，我们在该文件中声明的选择器都是本地的，在编译时会加上前缀及哈希值。有关 CSS 模块化的内容，请参考这篇文章。

然后在 `src/components/Hello/index.tsx` 文件中引用 less 文件：

```
import cn from 'classnames';
import React from 'react';

import styles from './index.module.less';

export interface HelloProps {
  className?: string;
  name: string;
}

export function Hello({ className, name }: HelloProps) {
  return <div className={cn(styles.container, className)}>Hello {name}</div>;
}
```

这时，我们会发现编译器报错：

> TS2307: Cannot find module './index.module.less' or its corresponding type declarations.

这是因为我们没有为 `*.module.less` 文件声明其导出模块的类型，熟知 CSS 模块化的小伙伴们一定知道 less 模块导出的是一个映射表 JSON，键是我们在 less 文件中为选择器取得本地局部名称，而值则是 CSS 模块化编译后的运行时名称（被加前后缀、混淆及哈希化后的值）。

但是 TypeScript 并不知道这一点，因此我们需要在 `src/types` 目录中添加 `less.d.ts` 模块声明文件：

```
declare module '*.module.less' {  const map: Record<string, string>;  export = map;}
```

搞定，现在我们终于可以正常引用 `*.module.less` 文件了。

### 3.3 集成 ESLint

接下来，让我们添加 Webpack 插件使其与 ESLint 集成，在过去我们通常需要使用`eslint-loader`，然而 2021 年的当下它已经被归档，取而代之的是 `fork-ts-checker-webpack-plugin` （我们刚才已经安装过），它可以独立的进程中进行 TypeScript 的类型检查，同时也可以集成 ESLint，为此我们需要修改 `scripts/webpack/webpack.common.config.js` 文件，首先通过 `transpileOnly` 禁用 `ts-loader` 的类型检查，添加如下配置：

```
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');...module.exports = {  module: {    rules: [      {        test: /\.tsx?$/,        exclude: /node_modules/,        loader: 'ts-loader',        options: {          transpileOnly: true,        },      },      ...  ]  ...  plugins: [    ...    new ForkTsCheckerWebpackPlugin({      eslint: {        files: './src/**/*.{ts,tsx,js,jsx}',      },    }),  ],};
```

最后，再次强调 ESLint 的重要性，尽量不要随意关闭 `react-app` 中定义的规则，至少在关闭规则前需要仔细阅读该规则的说明和错误示例。另外，强烈建议你安装 ESLint 的 VSCode 插件，这样你可以借助 `Quick Fix` 功能提供的修改意见快速修正代码。

### 3.4 支持模块热更新

模块热更新（Hot Module Reload，简称为 HMR）是深受开发者喜爱的工具，然而 React 17 + Webpack 5 + TypeScript 技术栈下的 HMR 却扑朔迷离，我查了很多文档都没有 100% 适合当下的。感谢读者 baxtergu 的提示，我们采用的是 `create-react-app` 中也用到的 `[react-refresh-webpack-plugin + react-refresh](https://link.zhihu.com/?target=https%3A//github.com/%253C/code%253Epmm%253Ccode%253Emwh/react-ref%253C/code%253Eresh-webpack-plugin)：`

```
yarn add -D @pmmmwh/react-refresh-webpack-plugin react-refresh react-refresh-typescript
```

> 在笔者写这篇文章的时候，必须使用 react-refresh-webpack-plugin 的 `0.5.0-rc5` 才能奏效，默认安装的 `0.4.3` 版本未能与 Webpack `5.51.1` 匹配，这个版本是 8 天前刚更新的。

接下来，将你的 `scripts/webpack/webpack.dev.config.js` 中的内容替换为：

```
const webpack = require('webpack');const { merge } = require('webpack-merge');const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');const ReactRefreshTypeScript = require('react-refresh-typescript');const common = require('./webpack.common.config');const tsLoader = common.module.rules.find((r) => r.loader === 'ts-loader');if (tsLoader) {  tsLoader.options = {    ...tsLoader.options, // 可能为 undefined    getCustomTransformers: () => ({      before: [ReactRefreshTypeScript()],    }),    transpileOnly: true,  };}module.exports = merge(common, {  mode: 'development',  devtool: 'cheap-module-source-map',  devServer: {    client: {      overlay: {        warnings: false,      },    },  },  plugins: [    new webpack.HotModuleReplacementPlugin(),    new ReactRefreshWebpackPlugin(),  ],});
```

这里我们添加了 Webpack 自带的 `HotModuleReplacementPlugin` 和 刚才我们安装的 `ReactRefreshWebpackPlugin`，并且在 `ts-loader` 中添加了自定义的 `transformer`。与传统的 `[react-hot-reloader](https://link.zhihu.com/?target=https%3A//github.com/gaearon/react-hot-loader)` 相比，使用 `react-refresh` 的好处是你只需要修改 `dev` 环境下的 Webpack 配置，并且完全无需对你自己的源代码进行修改。

* * *

4. Vite 分支
----------

> Vite 目前还在不断改进和升级中，以下配置仅保证当前可用，请访问我的 Github 项目以保持更新。GitHub - MagicCube/boilerplate-2021: Yet another boilerplate for TypeScript and React developers.

### 4.1 引入 Vite 构建器

Vite 已经集成了包括 TypeScript、 CSS 处理器在内的构建配置，因此大大降低了配置难度，并且显著减少了 NPM 包的数量，

接下来让我们来安装一下 Vite：

```
yarn add -D vite less vite-plugin-linter vite-react-jsx @vitejs/plugin-react-refresh
```

> 尽管 Vite 已经集成了 Less、SCSS 等主流的 CSS 处理器，但是你仍然需要手动安装 `less`。当然，在 Vite 的官方文档中，鼓励直接使用 CSS 提供的变量及 PostCSS 的嵌套语法，从而彻底抛弃 Less 等预处理器。

**下一步很重要**，你需要在 `tsconfig.json` 中将 `isolatedModules` 设置为 `true`。

```
{   ...   "isolatedModules": true   ...}
```

为了让我们能够在代码中可以用上类似 `import.meta.env.MODE` 这样的环境变量，我们还需要在 `src/typings` 中添加 `vite.d.ts`：

```
/// <reference types="vite/client" />
```

然后，让我们在项目根路径下创建 `vite.config.js`：

```
import { defineConfig } from 'vite';import reactRefresh from '@vitejs/plugin-react-refresh';import { EsLinter, linterPlugin } from 'vite-plugin-linter';import reactJsx from 'vite-react-jsx';export default defineConfig((configEnv) => {  return {    base: '',    resolve: {      alias: [{ find: '@', replacement: '/src' }],    },    plugins: [      linterPlugin({        include: [          './src/**/*.ts',          './src/**/*.tsx',          './src/**/*.js',          './src/**/*.jsx',        ],        linters: [new EsLinter({ configEnv })],      }),      reactJsx(),      reactRefresh(),    ],  };});
```

可以看到我们的配置十分简单，一共只引入了三个额外的 Vite 插件，它们分别是：

*   **vite-plugin-linter**：Vite 的插件体系还正在不断成长中，我找了 3 个 ESLint 相关的插件，最后只有这一个完全符合我们的要求，它可以和 Webpack 的 Fork TS Check 插件一样启动一个子进程执行 ESLint 等类型校验，并且还支持其他的校验工具。
    
*   **plugin-react-refresh**：这个插件可以实现 React 热模块更新的功能。
    
*   **vite-react-jsx**：因为我们在 tsconfig.json 中开启了 react-jsx 开关，即使用了 React 17 之后的免去 `import React from 'react'` 声明的特性，因此我们需要引入这个插件。
    

> 这里你会发现我们使用了 `defineConfig((configEnv: ConfigEnv) => UserConfig)` 重载来设置配置项，这是为了将来可以根据环境变量等不确定条件决定配置项的值。

**4.2 创建 HTML**

Vite 构建的入口文件通常是一个 HTML 文件，我们可以在这里引入 TypeScript、JavaScript 的源文件，只需在 `<script/>` 标签中添加上 `type="module"` 的声明即可。在 `production` 构建时，Vite 会帮你处理好一切，甚至会帮你自动打包成 `vendor.js` 和 `index.js`，分别包含第三方包和你自己的程序。

```
<!DOCTYPE html><html lang="en">  <head>    <meta charset="UTF-8" />    <meta http-equiv="X-UA-Compatible" content="IE=edge" />    <title>boilerplate-2021</title>    <meta ></script>  </body></html>
```

除了程序的源代码，你还可以引入 CSS 等样式文件，甚至可以引入 favicon 等图片资源文件。需要注意的是，Vite 默认的公共文件目录是 `public`，存放在 `public` 目录下的资源文件名将不会被添加哈希，而放置在其他目录下的文件则会自动添加上哈希，比如在上面的代码中放置在 `resources` 目录下的 `favicon.svg` 文件就会被添加上哈希。

### 4.3 配置 package.json

在你的 `package.json` 中，添加以下构建（build）、开发（dev）及预览（preview）命令：

```
{  ...  "scripts": {    "build": "npm run build:vite",    "build:es": "tsc",    "build:vite": "vite build",    "dev": "vite",    "start": "npm run dev",    "preview": "vite preview"  }}
```

> 这里的预览是指查看 `production` 生产环境下的结果。

**是的，现在你已经完成了所有 Vite 所需的配置**。更多配置请查看 Vite 的官方文档。

* * *

5. 管控你的 Git 提交
--------------

在很多企业和开源项目中，都有一个关于 Git 的原则，即 **” 提交 commit 前，必须保证没有编译时异常 “**。对于前端来说就是必须让每一个 commit 都符合 TypeScript 编译器及 ESLint 的考验。

此外，你可能经常会在 Github 上看到开源项目的 commit 消息都是以 `feat`、`fix`、`chore` 等开头，这其实是 `commit-lint` 规范：

*   **feat**：新功能（feature）变更，大多数 commit 都属于这种类型。
    
*   **fix**：修复缺陷（bug）变更。
    
*   **docs**：修改或添加文档（documentations）及代码注释变更。
    
*   **style**：仅由代码格式化造成的变更。
    
*   **refactor**：重构（refactor）变更。
    
*   **test**：由测试相关的变更。
    
*   **chore**：构建过程、配置及辅助工具相关的变更，十分常用。
    

为了实现对每一条 Git 变更提交进行如上校验，我们需要引入 `husky`、`lint-staged` 和 `commit-lint`，最佳安装方式是通过执行命令：

```
yarn add -D husky lint-staged @commitlint/config-conventional @commitlint/cli
```

接下来，让我们配置 `lint-staged`，使其对 Git `staged` 状态中的源代码执行 `eslint`，为此我们要添加 `.lintstagedrc.json`：

```
{  "*.{js,jsx,ts,tsx}": ["eslint --cache"]}
```

我们还需要配置 `commit-lint`，它是负责校验 Git commit 消息的工具，之后的 message 必须以上述单词缩写和冒号开头，请大家添加 `commitlint.config.js`：

```
module.exports = { extends: ['@commitlint/config-conventional'] };
```

安装 husky，这将把 husky 挂到 Git 提供的 hooks 上。接着我们还需确保将安装 husky 的脚本挂在 NPM 的 `prepare` hooks 上：

```
npm set-script prepare "husky install"npm run prepare
```

最后，下面的命令行让我们将 `lint-staged` 和 `commit-lint` 挂在 Husky 的 hooks 上：

```
npx husky add .husky/pre-commit "npx --no-install lint-staged"npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

这里有一个坑，上面的这段命令是官方提供的，但事实上在 MacOS 中会出现问题，因此你还需要手工将 `.husky/commit-msg` 文件修改为：

```
#!/bin/sh. "$(dirname "$0")/_/husky.sh"npx --no-install commitlint --edit "$1"
```

好了，现在如果你的代码中有编译异常、ESLint 错误或是提交的 message 不标准，都会抛出异常，即便在 VSCode 里提交也一样。

* * *

6. 更新 `package.json`
--------------------

最后，我们还需要为我们的 NPM 包添加 ES 模块化和 TypeScript 类型声明，请在 `package.json` 中添加：

```
{  ...  "module": "/dist/es/index.js",  "types": "./dist/es/index.d.ts",}
```

如果开发的是一个 NPM 包项目，你可以在此基础上添加 `description`、`repository`、`keywords`、`homepage` 等信息，并且需要额外添加 `common-js` 风格的编译目标，并在 `package.json` 的 `main` 字段中声明。

* * *

### 7. 进阶功能

在该模板中，还内置了多主题样式等功能，在这里就不一一赘述。此外，我还集成 GitHub 模板、GitHub Pages 站点等功能，前者能够让其他开发者直接使用我们的脚手架创建新的 GitHub 仓库，而后者则可以将我们构建出来的站点在 github.io 上发布，就像这样。同时，我还集成了 Travis CI 工具，这样只要有 `master` 分支上的更新，就会触发持续集成构建，构建成功后就会自动帮我们更新 GitHub Pages 站点。

* * *

8. 结语
-----

本文到这里就即将结束，不得不说每隔一段时间去重温一次从零搭建脚手架，都受益匪浅。当然在阿里巴巴 CCO 技术部，我们早已无需手工搭建脚手架，在内部我们自研了具有自身特色的模板工具，可以秒建一个新项目，如果你也对前端工程化有兴趣，或是对本文中的步骤、代码有疑义，欢迎在下方留言。

关于本文

来源：Henry

https://zhuanlan.zhihu.com/p/403970666

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持

 》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持