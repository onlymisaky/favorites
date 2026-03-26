> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [ksh7.com](https://ksh7.com/posts/workspace-pnpm-turborepo-changesets/index.html#%E7%BB%93%E5%B0%BE)

> 环境与版本 platform => mac os node => v22.2.0 npm =>

点击获取文章摘要

*   `platform` => `mac os`
*   `node` => `v22.2.0`
*   `npm` => `10.8.0`
*   `pnpm` => `9.1.3`
*   `yarn` => `1.22.22`
*   `turbo` => `1.13.3`
*   `changesets` => `2.27.5`

请注意文档时效和工具版本，浏览前建议查看官方文档，以获得最新信息！

> [pnpm 使用 workspace](https://ksh7.com/posts/pnpm-use-workspace/)  
> [Node corepack 使用](https://ksh7.com/posts/node-corepack/)  
> [pnpm 切换国内镜像源](https://ksh7.com/posts/npm-registry/)  
> [Turorepo](https://turbo.build/repo/docs/getting-started/from-example)

本文档搭配 `corepack` 更佳~ 还需要掌握 `pnpm` 的 `workspace` 相关知识哦~

[](#命令初始化 "命令初始化")命令初始化
-----------------------

```
pnpm dlx create-turbo@latest
```

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw690/0085UwQ9gy1hq7kf2yhf2j313k098774.jpg)

[](#使用模版 "使用模版")使用模版
--------------------

> 本文使用的模版：[monorepo with changesets](https://github.com/vercel/turbo/tree/main/examples/with-changesets)

```
pnpm dlx create-turbo -e with-changesets
```

注意，无论**生成**还是**模版**中 `package.json` 都含有 `packageManager` 字段，请将你的 `pnpm` 的版本与其对齐，或者参考 [Node corepack 使用](https://ksh7.com/posts/node-corepack/)

```
demo-turoborepo
├── apps
│   ├── docs
│   └── web
├── packages
│   ├── ui
│   ├── eslint-config
│   └── typescript-config
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

本文主要在 `changesets`，所以此处简单介绍下~

[](#Turborepo-介绍 "Turborepo 介绍")`Turborepo` 介绍
----------------------------------------------

`Turborepo` 是专为 `JavaScript` 和 `Typescript` 的 `monorepo` 项目设计的高性能构建系统。可以高效管理和构建项目中多个 `packages`，通过缓存构建和测试结果，来提升开发和持续集成的效率。  
`Turborepo` 旨在提高大型 `monorepo` 项目的构建效率，在复杂的项目中，可以更好的处理任务之间的依赖关系，并保证构建的正确性和效率。

[](#优势 "优势")优势
--------------

*   **多任务并行处理**
*   **增量构建**
*   **云缓存**

[](#Pipeline-管道 "Pipeline - 管道")Pipeline - 管道
---------------------------------------------

`Turborepo` 为开发人员提供了一种以常规方式显示指定任务关系的方法。 在 `Turborepo` 中可以在项目根目录中定义 `turbo.json` 来配置输出、缓存依赖、打包等功能。

在 `pipeline` 中的每一个 `key` 都指向我们在 `package.json` 中定义的 `script` 脚本执行命令，并且在 `pipeline` 中的每一个 `key` 都可以被 `turbo run` 执行。

在执行 `turbo run` 命令时，`turbo` 会根据 `pipeline` 中的配置，对每个 `package.json` 中的 `script` 执行脚本进行有序的**执行**和 **缓存**输出的`文件`和`日志`

```
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      // `build` tasks  being completed first
      // (the `^` symbol signifies `upstream`).
      "dependsOn": ["^build"],
      // note: output globs are relative to each package's `package.json`
      // (and not the monorepo root)
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "test": {
      // A package's `test` script depends on that package's
      // own `build` script being completed first.
      "dependsOn": ["build"],
      "outputs": [],
      // A package's `test` script should only be rerun when
      // either a `.tsx` or `.ts` file has changed in `src` or `test` folders.
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts", "test/**/*.tsx"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      // Setting cache to false is useful for daemon or long-running "watch" 
      // or development mode tasks you don't want to cache.
      "cache": false,
      // Label a task as persistent if it is a long-running process
      // such as a dev server or --watch mode. 
      "persistent": true
    }
  }
}
```

[](#dependsOn "dependsOn")dependsOn
-----------------------------------

### [](#常规依赖 "常规依赖")常规依赖

如果任务需要依赖其他任务，则可以放入 `dependsOn` 内。例如执行 `deploy` 任务时需要 `build`、`test`、`lint` 任务先完成  
当然，在这里你只需要执行 `turbo run deploy` 即可，`turbo` 会按 `dependsOn` 中定义脚本执行

```
{
  "turbo": {
    "pipeline": {
      "deploy": {
        "dependsOn": ["build", "test", "lint"]           
      } 
    }    
  }
}
```

### [](#依赖工作空间中的包-From-dependent-workspaces "依赖工作空间中的包 - From dependent workspaces")依赖工作空间中的包 - From dependent workspaces

#### [](#目录结构-1 "目录结构")目录结构

例如当 `docs` `build` 时，需要 `ui` 和 `hooks` `build` 完成之后，此时需在 `dependsOn` 中配置 `^` 符号来明确依赖关系。

```
apps/
  docs/package.json # 依赖 ui 和 hooks
packages/
  ui/package.json
  hooks/package.json
turbo.json
package.json
```

```
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // A workspace's `build` command depends on its dependencies'
      // and devDependencies' `build` commands being completed first
      "dependsOn": ["^build"]
    }
  }
}
```

### [](#拓扑依赖-Dependencies-outside-of-a-task "拓扑依赖 - Dependencies outside of a task")拓扑依赖 - [Dependencies outside of a task](https://turbo.build/repo/docs/core-concepts/monorepos/task-dependencies#dependencies-outside-of-a-task)

稍微有点绕，可以先阅读官方文档，或者从 `demo` 中找到思路。  
[demo-turborepo/test-topo](https://github.com/tardis-ksh/demo-turborepo)，在项目根目录运行 `turbo run checkType` 再修改 `ui` 项目中的 `typescript` 类型代码，再运行 `typeCheck`，最后可在 `docs` 项目中查看 `ui` 的类型正确与错误

#### [](#目录结构-2 "目录结构")目录结构

```
apps/
  docs/package.json # 依赖 ui
  web/package.json  # 依赖 ui
packages/
  ui/package.json   # 无依赖
turbo.json
package.json
```

```
{
  "pipeline": {
    // fake task
    "topo": {
      "dependsOn": ["^topo"]
    },
    "typeCheck": {
      "dependsOn": ["topo"]
    }
  }
}
```

```
{
  "name": "docs",
  "script": {
    "typeCheck": "tsc --checkJs --noEmit"
  }
}
```

#### [](#应用场景 "应用场景")应用场景

先了解业务场景，再尝试理解这段逻辑。

场景：`docs` 和 `web` 项目依赖 `ui` 组件，`ui` 组件无其他负作用依赖，三个项目都由 `typescript` 构建，且都有自己的 `typeCheck` 任务。  
先不考虑更复杂的任务执行，按正常 `dependsOn` 的思路配置可能只要 `"dependsOn": ["^typeCheck"]` 即可，也能完成 `typeCheck` 任务，正常缓存。  
其实你可以发现，每个 `typeCheck` 任务都是可以独立执行的，不需要依赖其他 `typeCheck` 任务结果，上述配置虽然可以完成任务，但 `Turbo` 的优势就是多任务并行，所以此类场景可以考虑使用并行来优化速度。

```
{
  "pipeline": {
    "topo": {
      "dependsOn": ["^topo"]
    },
    "typeCheck": {
      "dependsOn": ["topo"]
    }
  }
}
```

所以这段配置可以理解为，`pipeline` 中的 `topo`（topological）任务是个虚拟任务（当然你可以随意命名），不存在于任何 `package.json` 的脚本中，`Turborepo` 会 “立即” 完成该任务，然后会并行执行依赖于它的 `typeCheck` 任务。  
虽然不是真实存在任务，但 `turbo` 也会创建 `web` 到 `ui`和 `docs` 到 `ui` 之间的依赖关系，所以当 `ui` 发生变化时，`web` 和 `docs` 的缓存也会失效。

[{"url":"https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw690/0085UwQ9gy1hq8p6wz6p2j30kg0jen88.jpg","alt":"","title":""},{"url":"https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw690/0085UwQ9gy1hq8p6xmbsqj30vi0jaapc.jpg","alt":"","title":""}]

`pipeline` 中的其他字段可以查看官方文档（[pipeline](https://turbo.build/repo/docs/reference/configuration#pipeline)），这里展开 `dependsOn` 是因为文档中的这一段描述比较绕，需要结合实际场景理解。。。

[](#本地远程缓存 "本地远程缓存")本地远程缓存
--------------------------

`Turbo` 不仅支持在本地缓存结果，也支持多人开发或在 `CI` 中使用的远程缓存模式。

### [](#登录-Vercel "登录 Vercel")登录 Vercel

执行命令后，你将跳转至 [Vercel](https://vercel.com/docs/concepts/monorepos/remote-caching?utm_source=turbo.build&utm_medium=referral&utm_campaign=docs-link) 的授权页面

```
turbo login
# or
pnpm dlx turbo login
```

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq90k2n2uzj31e20gw46m.jpg)

### [](#开启缓存 "开启缓存")开启缓存

开启后执行 `turbo run` 命令的缓存将同时在本地和远程保存

```
turbo link
# or
pnpm dlx turbo link
```

### [](#测试远程缓存 "测试远程缓存")测试远程缓存

```
rm -rf ./node_modules/.cache/turbo
```

删除缓存后再执行 `turbo run build`，若显示 `Remote caching enabled`，此时 `turbo` 将在远程下载日志和产物，并在你执行时重新展示。

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq91fmtd9jj31ly0coh39.jpg)

### [](#关闭缓存 "关闭缓存")关闭缓存

```
turbo unlink
# or
pnpm dlx turbo unlink
```

[](#在-CI-中使用远程缓存-Using-Turborepo-with-GitHub-Actions "在 CI 中使用远程缓存 - Using Turborepo with GitHub Actions")在 CI 中使用远程缓存 - [Using Turborepo with GitHub Actions](https://turbo.build/repo/docs/ci/github-actions)
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

`Turbo` 支持在 `CI` 中配置远程缓存，如 `GitHub Actions`。在 `actions` 中，`turbo` 支持多种缓存，如使用 `vercel` 的远程缓存或 `actions` 提供的 `actions/cache`，这里只介绍 `turbo` 的了~

### [](#设置环境变量 "设置环境变量")设置环境变量

```
name: Release

on:
  push:
    branches:
      - "main"

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    # To use Turborepo Remote Caching, set the following environment variables for the job.
    env:
      TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
      TURBO_TEAM: ${{ vars.TURBO_TEAM }}
    steps:
      - name: Install Dependencies
        run: pnpm i
        
      - name: Build
        run: pnpm build
```

### [](#生成-secrets-TURBO-TOKEN "生成 secrets TURBO_TOKEN")生成 `secrets` `TURBO_TOKEN`

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq90k3aor9j31hg0o6tcp.jpg)

### [](#生成-variables-TURBO-TEAM "生成 variables TURBO_TEAM")生成 `variables` `TURBO_TEAM`

注意，请设置 `variables`  
同上面账户设置，`Account Settings => General => Default Team` 复制 `Team ID` 在 actions `repository => settings => Secrets and variables => Repository variables => create TURBO_TEAM` 即可

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq90k1wu7bj31i80iun10.jpg)

### [](#缓存效果 "缓存效果")缓存效果

[{"url":"https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq930gazh1j31kw0mktjl.jpg","alt":"","title":""},{"url":"https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq91fmtd9jj31ly0coh39.jpg","alt":"","title":""}]

`changesets` 是用于管理版本和生成变更日志的工具，专注多包管理。相较于 `lerna` 客制化更高，配置灵活，在 `CI` 中更友好。

[](#安装-changeset "安装 changeset")安装 changeset
--------------------------------------------

在 `monorepo` 项目中添加依赖。第二个包为 `changelog` 风格，后续会介绍。

```
pnpm add -Dw @changesets/cli
# or
pnpm add -Dw @changesets/cli @changesets/changelog-github
# or
pnpm add -Dw @changesets/cli @changesets/changelog-git
```

[](#初始化 "初始化")初始化
-----------------

```
pnpm changeset init
```

执行后会在项目根目录生成 `.changeset` 文件夹，内含 `README.md` 和 `config.json` 文件

```
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.1/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "tardis-ksh/demo-turborepo" }
  ],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "updateInternalDependencies": "patch",
  "ignore": ["@tardis-ksh/docs", "@test/**"],
  "baseBranch": "main"
}
```

### [](#配置说明 "配置说明")配置说明

#### [](#baseBranch（git-branch-name） "* baseBranch（git branch name）")* `baseBranch`（git branch name）

`baseBranch` 是 `changesets` 用于比较变更的分支，通常为你主要分支，如 `main`、`master` 等。  
改值较生成默认 `main`，请注意修改。

#### [](#access-restricted-public "access (restricted | public)")`access` (restricted | public)

包的发布方式，`public` 为公开，`restricted` 为私有。你可以在包的 `package.json` 中 `publishConfig.access` 字段来覆盖。  
如果你不想某个包被发布，在该包的 `package.json` 中设置 `"private": true` 即可。

#### [](#commit-boolean-or-module-path-as-a-string-or-a-tuple-like-modulePath-string-options-any "commit (boolean, or module path as a string, or a tuple like [modulePath: string, options: any])")`commit` (boolean, or module path as a string, or a tuple like [modulePath: string, options: any])

在每次执行 `changeset add` 或 `changeset version` 后是否自动提交这些更改。该值接受 `Boolean` 或自定义行为。  
这里介绍下 `Boolean` 时的场景：

*   `true` - 每次执行 `changeset add` 或 `changeset version` 后自动提交变更的文件，在 `changeset add` 时生成的文件 `changeset` 变更文件在 `.changeset` 文件夹中，若为 `true` 时只会提交这些变更文件且也会将此次 `commit id` 作为 `changelog` 内容记录 -> [517c63d](https://github.com/tardis-ksh/demo-turborepo/releases/tag/%40tardis-ksh%2Futils%401.1.0)
*   `false` - 手动提交变更文件。`changeset` 会将包含变更文件的这次 `commit` 作为 `changelog` 内容记录，所以你可以在提交时包含相关变更文件，使你的 `commit` 更有价值。=> [00e4bd2](https://github.com/tardis-ksh/demo-turborepo/releases/tag/%40tardis-ksh%2Facme-hooks%400.10.0)

#### [](#updateInternalDependencies（patch-minor-major） "updateInternalDependencies（patch | minor | major）")`updateInternalDependencies`（patch | minor | major）

内部依赖的更新策略。（由于依赖基本都是 `workspace:*` 或者 `*`，暂无需过多考虑）

#### [](#ignore-array-of-packages "ignore (array of packages)")`ignore` (array of packages)

`ignore` 用于忽略某些包的变更，如 `@tardis-ksh/docs` 和 `@test/**` 包的变更不会被记录。格式 [micromatch](https://www.npmjs.com/package/micromatch)

```
{
  "ignore": ["@tardis-ksh/docs", "@test/**"]
}
```

#### [](#changelog "* changelog")* `changelog`

用于生成 `changelog` 的风格，或者自己定义

##### [](#changesets-changelog-github "@changesets/changelog-github")@changesets/changelog-github

```
{
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "tardis-ksh/demo-turborepo" }
  ]
}
```

##### [](#changesets-changelog-git "@changesets/changelog-git")@changesets/changelog-git

在本地使使用该 `log` 工具时需要在环境变量配置 `GITHUB_TOKEN`

```
{
  "changelog": "@changesets/changelog-git"
}
```

##### [](#custom "custom")custom

> [getChangelogEntry.js](https://github.com/JedWatson/react-select/blob/master/.changeset/getChangelogEntry.js)

```
{
  "changelog": "./getChangelogEntry",
}
```

[](#命令 "命令")命令
--------------

`changesets` 命令行中，通过 `space` 空格选择，`enter` 回车确认或跳过。

### [](#changeset-add-添加变更 "changeset add 添加变更")`changeset add` 添加变更

```
pnpm changeset add
# or
pnpm changeset
```

应该在什么时候添加变更？和你 `commit` 节奏保持一致，如完成一个 `feature` 或修复一个 `bug` 时。建议在 `commit` 变更文件前，先执行 `changeset add`，这样 `commit` 时会包含变更文件。

简单了解 `major、minor、patch`，在版本中：`major.minor.patch`，`major` 为主版本号, 可标记为不兼容的更改，`minor` 为次版本号，可标记为向后兼容的新功能，`patch` 为补丁版本号，可标记为向后兼容的问题修复。  
通过 `space` 来选择变更的类型，`enter` 确认，或 `enter` 挑至下个选择

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw690/0085UwQ9ly1hq4e6hni7aj30nm08ugmu.jpg)

#### [](#变更文件 "变更文件")变更文件

在执行 `add` 后，会在 `.changeset` 目录生成变更文件，你可在这里继续修改变更 `log`，这将是此次变更的 `changelog`

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9ly1hq4e6hons3j31cs07640y.jpg)

### [](#changeset-version-生成-版本变更-和-changelog "changeset version 生成 版本变更 和 changelog")`changeset version` 生成 版本变更 和 changelog

```
pnpm changeset version
```

### [](#problem-with-changesets-changelog-github "problem with @changesets/changelog-github")problem with `@changesets/changelog-github`

#### [](#add-GITHUB-TOKEN "add `GITHUB_TOKEN")add `GITHUB_TOKEN

如果你使用了该工具，你需要在本地环境变量中配置 `GITHUB_TOKEN`。[create your token here](https://github.com/settings/tokens/new?description=changeset%20test%20token&scopes=repo:status,read:user)，目前只需要 `repo:status` 和 `read:user`

for mac： `~/.zshrc`、`~/.bashrc`

```
$ vim ~/.zshrc
# add in your file
# export GITHUB_TOKEN = "some string"
$ source ~/.zshrc
$ echo $GITHUB_TOKEN
```

**或者临时使用**

```
GITHUB_TOKEN=your_token pnpm changeset version
```

你需要将你本地的 commit 提交，否则 `changelog` 会报错，因为 `changelog` 会读取 `commit` 信息。

![](https://image.baidu.com/search/down?url=https://gzw.sinaimg.cn/mw2000/0085UwQ9gy1hq9w9wql4kj31600dgk16.jpg)

### [](#publish "publish")publish

```
pnpm changeset publish
```

[](#在-CI（actions）中使用 "在 CI（actions）中使用")在 CI（actions）中使用
--------------------------------------------------------

```
name: Release

on:
  push:
    branches:
      - "main"

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
        with:
          # This makes Actions fetch all Git history so that Changesets can generate changelogs with the correct commits
          fetch-depth: 0

      - name: Setup pnpm
        run: corepack enable

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install Dependencies
        run: pnpm i

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          # This expects you to have a script called release which does a build for your packages and calls changeset publish
          publish: pnpm release
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: if a publish happens
        if: steps.changesets.outputs.published == 'true'
        # You can do something when a publish happens.
        run: |
          echo "down"
```

在 `actions` 中使用 `changesets/action@v1`。在本地添加完变更后，不需要再主动执行 `changeset version` 了，`push` 至分支，将由 `changesets/action` 自动执行。  
`changesets/action` 执行流程：发现变更，创建新分支生成版号和 `changelog`，创建 `PR`，手动同意后将再次触发该 `actions`，此时 `changesets/action` 会执行 `publish` 命令（由你定义），发布至 `npm`。

[](#处理-Pull-requests-changeset-bot "处理 Pull requests - changeset-bot")处理 Pull requests - changeset-bot
------------------------------------------------------------------------------------------------------

安装 [changeset-bot](https://github.com/apps/changeset-bot) 后，在后续的 `PR` 中（除 `changeset` 自己的 `PR`）`Bot` 将会在 `PR` 中留下评论，以及是否需要创建变更。

![](https://user-images.githubusercontent.com/11481355/66184052-3a6e6980-e6be-11e9-8e62-8fd9d49af587.png)

完结 撒花~~~

> [Turborepo](https://turbo.build/repo/docs)  
> [changesets](https://github.com/changesets/changesets/tree/main)  
> [changesets/action](https://github.com/changesets/action)  
> [https://juejin.cn/post/7129267782515949575](https://juejin.cn/post/7129267782515949575)