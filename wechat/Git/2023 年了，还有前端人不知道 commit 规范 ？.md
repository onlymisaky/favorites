> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9Xc9sRwNawCXbMq1REvNQQ)

```
大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复1，加入高级前段交流

```

一个开发人员需要知道的 commit 规范
=====================

什么是约定式提交
--------

约定式提交（Conventional Commits）是一种用于代码版本控制的规范，旨在通过明确和标准化提交信息来提高代码协作质量和效率。其基本原则是通过规定提交信息的结构和语义来提高代码版本控制的可读性、可维护性和自动化程度。

约定式提交规范通常要求提交信息包括一个描述性的 "类型"、一个可选的 "作用域"、一个用于简洁说明的 "主题"，以及可选的 "正文" 和 "尾部" 等组成部分。这些组成部分的格式和语义都是根据规范要求进行约定的，比如使用 "feat" 来表示新功能、"fix" 表示修复错误、"docs" 表示文档变更等。

通过遵循约定式提交规范，开发人员可以更容易地理解和管理代码的变更历史，同时也为自动化工具提供了更多可靠的信息，例如自动生成版本号、发布日志和代码库更新等操作。

提交说明的结构如下所示:

* * *

原文：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
复制代码


```

译文：

```
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
复制代码


```

* * *

提交说明包含了下面的结构化元素，以向类库使用者表明其意图：

0.  **fix:** _类型_ 为 `fix` 的提交表示在代码库中修复了一个 bug（这和语义化版本中的 `PATCH`[1] 相对应）。
    
1.  **feat:** _类型_ 为 `feat` 的提交表示在代码库中新增了一个功能（这和语义化版本中的 `MINOR`[2] 相对应）。
    
2.  **BREAKING CHANGE:** 在脚注中包含 `BREAKING CHANGE:` 或 <类型>(范围) 后面有一个 `!` 的提交，表示引入了破坏性 API 变更（这和语义化版本中的 `MAJOR`[3] 相对应）。破坏性变更可以是任意 _类型_ 提交的一部分。
    
3.  除 `fix:` 和 `feat:` 之外，也可以使用其它提交 _类型_ ，例如 \@commitlint/config-conventional[4]（基于 Angular 约定 [5]）中推荐的 `build:`、`chore:`、 `ci:`、`docs:`、`style:`、`refactor:`、`perf:`、`test:`，等等。
    
4.  脚注中除了 `BREAKING CHANGE: <description>` ，其它条目应该采用类似 git trailer format[6] 这样的惯例。
    

其它提交类型在约定式提交规范中并没有强制限制，并且在语义化版本中没有隐式影响（除非它们包含 BREAKING CHANGE）。可以为提交类型添加一个围在圆括号内的范围，以为其提供额外的上下文信息。例如 `feat(parser): adds ability to parse arrays.`。

### 示例

包含了描述并且脚注中有破坏性变更的提交说明

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
复制代码


```

包含了 `!` 字符以提醒注意破坏性变更的提交说明

```
feat!: send an email to the customer when a product is shipped
复制代码


```

包含了范围和破坏性变更 `!` 的提交说明

```
feat(api)!: send an email to the customer when a product is shipped
复制代码


```

包含了 `!` 和 BREAKING CHANGE 脚注的提交说明

```
chore!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
复制代码


```

不包含正文的提交说明

```
docs: correct spelling of CHANGELOG
复制代码


```

包含范围的提交说明

```
feat(lang): add polish language
复制代码


```

包含多行正文和多行脚注的提交说明

```
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
复制代码


```

### type 类型概览

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">值</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">feat</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">新增一个功能</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">fix</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">修复一个 Bug</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">docs</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">文档变更</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">style</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代码格式（不影响功能，例如空格、分号等格式修正）</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">refactor</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代码重构</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">perf</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">改善性能</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">test</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">测试</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">build</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">变更项目构建或外部依赖（例如 scopes: webpack、gulp、npm 等）</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">ci</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">更改持续集成软件的配置文件和 package 中的 scripts 命令，例如 scopes: Travis, Circle 等</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">chore</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">变更构建流程或辅助工具</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">revert</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代码回退</td></tr></tbody></table>

作者：子弈 链接：juejin.cn/post/684490…[7] 来源：稀土掘金 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

为什么需要约定式提交？
-----------

Git 提交信息需要遵循 Angular 约定是为了使提交信息格式清晰、易于阅读和理解，从而提高代码协作的效率。Angular 约定包括以下三个部分：

1.  标题（header）：用一行简短的描述来总结更改内容，并使用特殊关键字指定更改类型和影响范围。
    
2.  正文（body）：提供更详细的更改描述，包括更改原因、影响和解决方案等信息。
    
3.  页脚（footer）：提供一些附加信息，如相关链接、关联的 BUG 编号等。
    

通过遵循 Angular 约定，可以使提交信息更加规范化和易于管理，从而方便其他团队成员阅读和理解更改的含义，从而提高团队协作效率。此外，遵循 Angular 约定的提交信息还可以更好地与许多自动化工具进行集成，如自动化版本控制、代码审查工具等。

如何遵守约定式提交？
----------

### 第一步：自动生成提交说明的工具

> Commitizen 是一个基于命令行的交互式工具，它可以帮助开发者规范化提交 Git 提交信息，符合 Angular Commit Message Conventions 的规范，从而更好地管理代码变更历史。

Commitizen 提供了一个友好的命令行交互界面，让开发者根据规范选择提交信息的类型、影响范围等内容，自动生成符合规范的 Git 提交信息。

Commitizen 可以与 Git 结合使用，使得开发者可以使用 commitizen 命令代替 git commit 命令提交代码变更，并且生成的提交信息格式更加规范化和易于管理。

**这里我建议您全局安装**

```
pnpm install -g commitizen 
pnpm install -g cz-conventional-changelog
复制代码


```

随后在电脑用户根目录穿件. czrc 文件，不然使用的时候会进入命令行（笔者的系统为 Ubuntu20.04）

```
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
复制代码


```

随后使用 **commitizen** 生成符合 AngularJS 规范的**提交说明**

```
commitizen init cz-conventional-changelog --save --save-exact
复制代码


```

随后你就可以使用以下命令获得中规中距的 commit 信息了。

```
git cz 
复制代码


```

### 第二步：客制化自动提交信息

> cz-customizable 是 Commitizen 的一个插件，可以帮助开发者自定义符合 Angular Commit Message Conventions 的提交信息格式和内容。

**拜托，人又不是机器！别那么死板。和代码打交道最重要的事情就是懂得如何苦中作乐，在遇到挑战和困难时，优秀的人能够采取积极的心态，并且能够寻找解决问题的方式和方法。**

cz-customizable 提供了一些配置选项，让开发者可以根据项目的需要自定义提交信息的格式和内容。

cz-customizable 的配置选项包括：

1.  `types`: 定义提交信息的类型，如 feat（新功能）、fix（修复 Bug）等。
    
2.  `scopes`: 定义提交信息的影响范围，如模块、组件等。
    
3.  `allowCustomScopes`: 是否允许自定义影响范围。
    
4.  `scopeOverrides`: 定义不同类型的提交信息对影响范围的要求。
    
5.  `messages`: 定义提交信息的模板，包括标题、正文、页脚等内容。
    
6.  `allowBreakingChanges`: 是否允许提交破坏性变更。
    

#### 1. 安装 cz-customizable

```
npm install cz-customizable --save-dev
复制代码


```

#### 2. 添加以下配置到`package.json`中

```
"config": {
    "commitizen": {
    "path": "node_modules/cz-customizable"
    }
}
复制代码


```

#### 3. 项目根目录下创建`.cz-config.js`文件来自定义提示

```
├── CHANGELOG.md
├── commitlint.config.js
├── index.html
├── node_modules
├── package.json
├── pnpm-lock.yaml
├── public
├── README.md
├── src
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── .cz-config.js  // 创建
复制代码


```

#### 以下是我的一些参考配置

```
module.exports = {
  // 可选类型
  types: [
    {
      value: ':sparkles: feat',
      name: '✨ feat:      新功能'
    },
    {
      value: ':bug: fix',
      name: '🐛 fix:      修复'
    },
    {
      value: ':memo: docs',
      name: '📝 docs:      文档变更'
    },
    {
      value: ':lipstick: style',

      name: '💄 style:     代码格式(不影响代码运行的变动)'
    },
    {
      value: ':recycle: refactor',

      name: '♻️  refactor:    重构 (既不增加feature, 也不是修复bug)'
    },
    {
      value: ':zap: perf',
      name: '⚡️ perf:      性能优化'
    },
    {
      value: ':white_check_mark: test',
      name: '✅ test:      增加测试'
    },
    {
      value: ':wrench: chore',
      name: '🔧 chore:     构建过程或辅助工具的变动'
    },
    {
      value: ':rewind: revert',
      name: '⏪ revert:     回退'
    },
    {
      value: ':rocket: build',
      name: '🚀 build:     打包'
    }
  ],

  // 步骤

  messages: {
    type: '请选择提交的类型：',
    customScope: '情输入修改的范围(可选)',
    subject: '请简要描述提交(必填)',
    body: '请输入详细描述(可选)',
    footer: '请输入要关闭的issus(可选)',
    confirmCommit: '确认要使用以上信息提交？(y/n)'
  },
  // 默认长度72
  subjectLimit: 72
};

复制代码


```

此时再次运行 `git cz`时就可以看到

```
? 请选择提交的类型： (Use arrow keys)
❯ ✨ feat:      新功能 
  🐛 fix:      修复 
  📝 docs:      文档变更 
  💄 style:     代码格式(不影响代码运行的变动) 
  ♻️  refactor:    重构 (既不增加feature, 也不是修复bug) 
  ⚡️ perf:      性能优化 
  ✅ test:      增加测试 
复制代码


```

### 第三部：增加对自动生成 commit 信息的校验

> 有时候你的队友可能是傻逼？请你注意防范

**很遗憾的是，上面的操作并没有任何校验功能，你的队友仍然可以提交 trash 在 commit 信息中。如果不敲你是队伍中的审核人员，那么我想你需要设置一些规范**

这里我们分情况讨论：

若您**没有使用 cz-customizable** 适配器**做了破坏 Angular 风格的提交说明配置**，则可以使用以下配置方案

1. 安装 @commitlint/config-conventional

```
npm i @commitlint/config-conventional @commitlint/cli -D
复制代码


```

2. 在根目录创建 commitlint.config.js 文件，配置 commitlint

```
module.exports = {
  extends: ['@commitlint/config-conventional']
}
复制代码


```

若您使用 **cz-customizable** 了则需要使用以下配置方案

```
npm install commitlint-config-cz --save-dev
复制代码
复制代码


```

然后加入 commitlint 校验规则配置：

```
module.exports = {
  extends: [
    'cz'
  ]
};
复制代码


```

最后的一些补充
-------

### husky 最后的帮手

> 是一个可以在 Git hooks 中使用的 npm 包，它可以帮助你在特定的 Git 事件发生时执行命令，例如提交代码之前进行代码格式化、测试等操作.

"husky" 是一个为了方便使用 Git hooks 的工具，它能够帮助你在项目中自动化地执行一些 Git 相关的操作。使用 husky，你可以在 Git 的一些关键操作（例如提交、推送、合并等）前或后，执行一些脚本或命令，比如代码格式化、自动化测试、打包发布等。

**他可以帮助我们额外拦截一些如`git commit`等指令**。需要注意的是，husky 只在 Git 仓库中才能正常工作，所以在使用之前请确保你的项目已经初始化为 Git 仓库

#### 1. 安装 husky

1.  ```
    在项目中安装 husky，可以使用 npm或者 yarn 进行安装：
    
    
    ```
    

```
pnpm install husky --save-dev
复制代码


```

或者

```
yarn add husky --dev
复制代码


```

#### 2. 在 package.json 中定义需要执行的 Git hooks 和对应的脚本

例如，在提交代码前执行代码格式化和自动化测试：

```
jsonCopy code{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test"
    }
  }
}
复制代码


```

这样，每次在执行`git commit`命令时，都会自动执行 npm 中定义的`lint`和`test`命令。

除了`pre-commit`钩子，husky 还支持其他一些 Git hooks，比如`pre-push`、`post-merge`、`post-checkout`等，可以根据实际需求进行配置。

需要注意的是，husky 只在 Git 仓库中才能正常工作，所以在使用之前请确保你的项目已经初始化为 Git 仓库。

当然 除了在`pageage.json`中设置之外，还可以使用

`npx husky add .husky/pre-commit`来生成一个 hook 的文件

随后你也可以在相应的文件中书写要执行的脚本了

```
./.husky/
├── _
│   └── husky.sh
├── commit-msg
└── pre-commit // 再此写入
复制代码


```

#### 3. 使用 lint-staged, 对暂存区代码进行 eslint 校验和 prettier 格式化

现在我们已经约束了提交规范，但是我们希望在提交前对当前的代码进行格式验证和修复，此时需要使用到`lint-staged`

1.  安装 `npm i lint-staged \--save-dev`
    
2.  在`package.json`中新增配置
    
    ```
    "lint-staged": {
    
    
    ```
    

"**/*.scss":"stylelint --syntax scss","**/_.{js,jsx, tsx,ts}":"npm run lint-staged:js","**/_.{js,jsx,tsx,ts,less,scss,md,json}": ["prettier --write" ] } 复制代码 复制代码 ```

3.  在`package.json`中新增 `lint-staged` 和 `lint-staged.js` 命令
    
    ```
    "scripts": {
    
    
    ```
    

"lint-staged": "lint-staged",    "lint-staged:js": "eslint --ext .js,.jsx,.ts,.tsx" } 复制代码 复制代码 ```

4.  最后在 `pre-commit`中新增脚本
    
    ```
    npm run lint-staged
    复制代码
    
    
    ```
    

链接文档
----

[Cz 工具集使用介绍 - 规范 Git 提交说明]  juejin.cn/post/684490…[8]

[Commitizen 约定式提交]  juejin.cn/post/710410…[9]

[Commitizen + husky 规范提交信息]  juejin.cn/post/709120…[10]

关于本文  

作者：喜欢哆肉

https://juejin.cn/post/7212597327579037756

```
前端 社群








下方加 Nealyang 好友回复「 加群」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：


1. 点个「在看」，让更多人也能看到这篇文章

```