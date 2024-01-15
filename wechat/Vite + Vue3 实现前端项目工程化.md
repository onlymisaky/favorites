> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sBgr7Y41LyhoTZExg--t_w)

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhbP2fy1uaVL87uPGjQiao9egybc3tRQebU4qTF9rhBOWevicYiaoic0SI4Q/640?wx_fmt=png)

Vue3 发布至今，周边的生态、技术方案已足够成熟，个人认为新项目是时候切换到 Vite + Vue3 了。今天就给大家操作一下这种技术方案实现前端工程化。

1. 初始化项目
--------

**通过官方脚手架初始化项目**

*   第一种方式，这是使用 vite 命令创建，这种方式除了可以创建 vue 项目，还可以创建其他类型的项目，比如 react 项目
    
    ```
    npm init vite@latest
    ```
    
*   第二种方式，这种方式是 vite 专门为 vue 做的配置，这种方式创建的项目在创建时会提示是否需要安装各种插件配置
    
    ```
    npm init vue@latest
    ```
    
*   第三种方式，直接快速通过参数生成
    
    ```
    npm init vite@latest project-engineer --template vue-ts
    ```
    

**询问的相关问题：**

```
Project name: … // 项目名称，默认值：vue-project，可输入想要的项目名称，此处不建议中文。Add TypeScript? … No / Yes // 是否加入TypeScript组件？Add JSX Support? … No / Yes // 是否加入JSX支持？Add Vue Router for Single Page Application development? … No / Yes // 是否为单页应用程序开发添加Vue Router路由管理组件？Add Pinia for state management? … No / Yes // 是否添加Pinia组件来进行状态管理？Add Vitest for Unit Testing? … No / Yes // 是否添加Vitest来进行单元测试？Add an End-to-End Testing Solution? » No // 是否添加一个端到端测试解决方案?Add ESLint for code quality? … No / Yes // 是否添加ESLint来进行代码质量检查？Add Prettier for code formatting? … No / Yes // 是否添加Prettier代码格式化?
```

执行结束后进入项目目录，安装依赖后执行 `npm run dev` 即可秒开项目

**命令行演示操作**![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhYL2mttpLX7zYkh2495RuVoUsyp6ExKTJeTtOBpWfvq4X4MVNSTT9hA/640?wx_fmt=png)

**生成的项目目录如下：**![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhyFtic1XFpibwQwH6xQoXX5RJpiaRsKS62ywc9buUXEFKYfLmJZhXyaJaQ/640?wx_fmt=png)

**但此项目目录不足以支持项目的复杂度，因此对目录结构进行扩展如下：**![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozh4GVOGaFhBBia3YL3cKzS4Sp2t2TK090ZEAqJMwU27SDEvr1EFoUWV6g/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhYSqF8krKtIVna9Lf3L1Rh8WFBuPibvq3dW5DwQVswNZNCQvzibZ63Cxw/640?wx_fmt=png)

2. 定制化 plugins
--------------

在初始化的项目中 `vite.config.js` 只是引入了提供 Vue 3 单文件组件支持的 plugin，大家可以根据项目需要进行个性化配置，详见 awesome-vite。

### 2.1 @vitejs/plugin-vue-jsx

提供 Vue 3 JSX & TSX 支持（通过 专用的 Babel 转换插件）。

安装

```
npm i -D @vitejs/plugin-vue-jsx
```

配置 `vite.config.ts`

```
import { defineConfig } from 'vite'import vueJsx from '@vitejs/plugin-vue-jsx'export default defineConfig({  plugins: [    vueJsx({      // options 参数将传给 @vue/babel-plugin-jsx    }),  ],})
```

### 2.2 rollup-plugin-visualizer

可视化并分析构建包，查看哪些模块占用空间大小，以此来优化构建包的大小。这是一个 Rollup 的 plugin，推荐这个也是 vite 的一个特性，vite 默认已经支持大部分的 Rollup 的 plugin，从这点来看，vite 的 plugin 库更加丰富了。

安装

```
npm i -D rollup-plugin-visualizer
```

配置 `vite.config.ts`

```
import { defineConfig } from 'vite'import visualizer from 'rollup-plugin-visualizer'export default defineConfig({  plugins: [visualizer()],})
```

### 2.3 vite-plugin-element-plus

为 ElementPlus 提供按需引入能力。全量导入 ElementPlus 导致构建包的体积过大，按需引入有效的减小包的体积。此包的原理是动态将每个按需引入的组件 css 写入。

```
import { ElButton } from 'element-plus'import 'element-plus/es/components/button/style/css'
```

安装

```
npm i -D vite-plugin-element-plus
```

配置 `vite.config.ts`

```
import { defineConfig } from 'vite'import importElementPlus from 'vite-plugin-element-plus'export default defineConfig({  plugins: [    // @ts-ignore 此处暂时需要使用 ignore    // 原因是包内部的 options 未做非必填兼容    // 目前已有人提了 PR，未合并，使用可以观望下    importElementPlus(),  ],})
```

3. 基于 husky + lint-staged 项目规范化
-------------------------------

*   Husky 支持所有 Git 钩子，当您提交或推送时，您可以使用 husky 来检查**您的提交消息**、**运行测试**、**检查代码**等。安装后，它会自动在仓库中的 `.git/` 目录下增加相应的钩子，比如 `pre-commit` 钩子就会在你执行 `git commit` 的触发。那么我们可以在 `pre-commit` 中实现一些比如 `lint` 检查、单元测试、代码美化等操作。当然，`pre-commit` 阶段执行的命令当然要保证其速度不要太慢，每次 commit 都等很久也不是什么好的体验。
    
*   `lint-staged`，一个过滤出 Git 代码暂存区文件（被 git add 的文件）的工具。这个很实用，因为我们如果对整个项目的代码做一个检查，可能耗时很长，如果是老项目，要对之前的代码做一个代码规范检查并修改的话，这可能就麻烦了呀，可能导致项目改动很大。所以 `lint-staged`，对团队项目和开源项目来说，是一个很好的工具，它是对个人要提交的代码的一个规范和约束。
    

### 3.1 Eslint

**`eslint` 用于配置代码风格、质量的校验，`prettier`用于代码格式的校验，`lint-staged` 过滤文件。**

本项目已经默认安装 eslint、prettier，如果需要单独安装，执行以下命令：

```
# 安装 eslintnpm i eslint -D# 利用 eslint 命令行工具生成基本配置npx eslint --init
```

生成的 .eslintrc.cjs 文件，如下：

```
/* eslint-env node */require('@rushstack/eslint-patch/modern-module-resolution')module.exports = {  root: true,  'extends': [    'plugin:vue/vue3-essential',    'eslint:recommended',    '@vue/eslint-config-typescript',    '@vue/eslint-config-prettier/skip-formatting'  ],  parserOptions: {    ecmaVersion: 'latest'  }}
```

做一下配置补充

```
/* eslint-env node */require('@rushstack/eslint-patch/modern-module-resolution')module.exports = {  root: true,  env: {    browser: true,    node: true,    es6: true  },  'extends': [    'plugin:vue/vue3-essential',    'eslint:recommended',    '@vue/eslint-config-typescript',    '@vue/eslint-config-prettier/skip-formatting'  ],  parserOptions: {    ecmaVersion: 'latest',    sourceType: 'module',    ecmaFeatures: {      jsx: true    }  },  plugins: ['@typescript-eslint'],  rules: {}}
```

> **这里为什么生成的配置文件名称是. eslintrc.cjs 而不是. eslintrc.js？**
> 
> 因为我们将项目定义为 ESM，`eslint --init` 会自动识别 type，并生成兼容的配置文件名称，如果我们改回 `.js` 结尾，再运行 `eslint` 将会报错。出现这个问题是 `eslint` 内部使用了 `require()` 语法读取配置。
> 
> 同样，这个问题也适用于其他功能的配置，比如后面会讲到的 Prettier、Commitlin t 等，配置文件都不能以 xx.js 结尾，而要改为当前库支持的其他配置文件格式，如：.xxrc、.xxrc.json、.xxrc.yml。

验证配置是否生效，在任意组件脚本中定义如下代码：

```
const calc = (a:number, b:number) => {    return a +b}// console.log(calc(10, 20))
```

执行 package.json 中的 lint 命令（没有的话需要自行配置，package.json 指令配置如下）

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhWdwU1tpLO3CPy9ByfXBm5qQ9JnCeKibpogQ2niaBc2XlLKNGYNddQ3dg/640?wx_fmt=png)

注释上面打印信息的情况下，执行 `npm run lint` 指令，将会出现 1 条错误提示信息

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhB6g27TlFA5BAibKVopXiaTS0cphST2l1PzZl4eWPNTpicu06foyFQxY3A/640?wx_fmt=png)

注释放开后，变量被调用，再次执行指令，则校验通过

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhobO3uWVOhPppuOURM3CPFWLq9z7OVWBRhNicksticic6oxDsicWBMibugsQ/640?wx_fmt=png)

### 3.2 Prettier

Prettier 如果需要单独安装，执行以下命令：

```
# 安装 prettiernpm i prettier -D
```

.prettierrc.json 默认配置如下（没有这个文件的需要自行创建）

```
{  "$schema": "https://json.schemastore.org/prettierrc",  "semi": false,  "tabWidth": 2,  "singleQuote": true,  "printWidth": 100,  "trailingComma": "none"}
```

*   semi:false 句末是否使用分号（false | true）
    
*   singleQuote:true 是否使用单引号代替双引号（false | true）
    
*   trailingComma:'none' 最后一个对象元素是否加逗号, 'none' 为不加
    
*   tabWidth 设置工具每一个水平缩进的空格数
    
*   printWidth 换行字符串阈值
    
*   bracketSpacing:true 对象，数组是否加空格（false | true）
    
*   jsxBracketSameLine:true jsx > 是否另起一行（false | true）
    
*   arrowParens :’always‘ (x) => {} 是否要有小括号，值为 ’always‘ 则需要
    
*   requirePragma:false 是否需要写文件开头的 @prettier （false | true）
    
*   insertPragma:false 是否需要自动在文件开头插入 @prettier
    

### 3.3 Prettierrc & ESLint 规则冲突的解决

上面讲过 **，`eslint` 用于配置代码风格、质量的校验，`prettier`用于代码格式的校验，`lint-staged` 过滤文件**。

但两者在使用过程中，会因为规则不同，有出现冲突的可能性，所以需要通过插件加强两者的配合：

*   `eslint-plugin-prettier` 一个 ESLint 插件， 由 prettier 生态提供，用于关闭可能与 prettier 冲突的规则
    
*   `eslint-config-prettier` 使用 prettier 代替 eslint 格式化，防止 Prettier 和 ESLint 的自动格式化冲突
    

安装

```
# 带 lint-stagednpm i eslint prettier lint-staged eslint-plugin-prettier eslint-config-prettier -D# 不带 lint-staged（本文采用方式）npm i eslint-config-prettier eslint-plugin-prettier -D
```

.eslintrc.cjs 配置文件

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhgekXpz7dIDaXQEFdS6ew3DjiacpE9HibEzbWoJPiamoI3r0yic3ViaKA6CA/640?wx_fmt=png)

控制台执行 `npm run lint` 可以做代码校验和格式化了（Vite+Vue3 项目搭建时选择了 eslint、prettier 配置的情况下，默认配置已够用，可根据需要做增项）

完成了 eslint 和 prettier 的集成配置，无论你使用什么编辑器，有没有安装相关插件，都不会影响代码校验的效果。

### 3.4 Husky

因为一个项目通常是团队合作，我们不能保证每个人在提交代码之前执行一遍 lint 校验， 所以需要 git hooks 来自动化校验的过程，否则禁止提交。

```
# 安装 huskynpm i husky -D# 生成 .husky 文件夹（注意：这一步操作之前，一定要执行 git init 初始化当前项目仓库，.husky 文件夹才能创建成功）npx husky-init install
```

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhRtzYOfzyibqAywUo1H2KrxZ48JdPiagZg9XO54Cia0SVicBzm4tiaGqdzjw/640?wx_fmt=png)

在 package.json 中添加'prepare' 指令

```
"scripts": {    // 省略其它指令    "prepare": "husky install"}
```

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhzwx2Gr9lpWqzFrgnzFTc2VuNxO03tTvtj7fApRnSMiampBKobibnMbbA/640?wx_fmt=png)image.png

`.husky/pre-commit` 文件修改如下

```
#!/usr/bin/env sh. "$(dirname -- "$0")/_/husky.sh"npm run lint
```

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozhL1nXibugL68CkRCszmuBJVmqibRrb2DLZnwpMewrq4efKRLJyCibjf6Ww/640?wx_fmt=png)

**测试钩子（git hooks）是否生效**

修改组件代码（变量声明调用和不调用两种情况），执行如下 git 命令提交代码，查看结果

```
git addgit commit -m '测试husky'
```

**变量声明未调用**

```
const calc = (a: number, b: number): number => {  return a + b}// console.log(calc(1024, 28))
```

执行结果

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozh2YVjiaGbc9Yd7Y47YQLtQyEDn7icIoQiaEB1ELP81e2DDQD5ibibYGiaUvpQ/640?wx_fmt=png)

> 当 `git commit` 时，它会自动检测到不符合规范的代码，如果无法自主修复就会抛出错误提示。

**变量声明并调用**

```
const calc = (a: number, b: number): number => {  return a + b}console.log(calc(1024, 28))
```

执行结果

![](https://mmbiz.qpic.cn/mmbiz_png/zwgqxRDyClgia9QiaT0ticJibKywPLGWYozh6sjZFD90IiaOAlia1W7tExIWmiaib1pXVibiciacLpzRM5WrzyniauOIvEll7A/640?wx_fmt=png)

### 3.5 Commitlint

为什么需要 Commitlint，除了在后续生成的 changelog 文件和语义发版中需要提取 commit 中的信息外，也利于其他团队开发者分析你提交的代码，所以我们要约定 commit 的规范。

安装如下两个插件：

*   @commitlint/cli Commitlint 命令行工具
    
*   @commitlint/config-conventional 基于 Angular 的约定规范
    

```
npm i @commitlint/config-conventional @commitlint/cli -D
```

最后将 Commitlint 添加到钩子：

```
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'
```

创建 `.commitlintrc`，并写入配置

```
{  "extends": [    "@commitlint/config-conventional"  ]}
```

> 注意，这里配置文件名使用的是. commitlintrc 而不是默认的. commitlintrc.js

测试 Commitlint 是否生效，与上面同样的方式提交 “符合规范和不符合规范的代码”，查看结果。

**Angular 规范说明：**

*   feat：新功能
    
*   fix：修补 BUG
    
*   docs：修改文档，比如 README, CHANGELOG, CONTRIBUTE 等等
    
*   style：不改变代码逻辑 (仅仅修改了空格、格式缩进、逗号等等)
    
*   refactor：重构（既不修复错误也不添加功能）
    
*   perf：优化相关，比如提升性能、体验
    
*   test：增加测试，包括单元测试、集成测试等
    
*   build：构建系统或外部依赖项的更改
    
*   ci：自动化流程配置或脚本修改
    
*   chore：非 src 和 test 的修改，发布版本等
    
*   revert：恢复先前的提交
    

  

**如果感觉文章还不错，给博主一个点赞、在看，作为继续创作的动力。**