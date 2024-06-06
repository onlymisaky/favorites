> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TA-o4acrpQmaX_ej38Yhew)

![](https://mmbiz.qpic.cn/mmbiz_gif/AAQtmjCc74DZeqm2Rc4qc7ocVLZVd8FOASKicbMfKsaziasqIDXGPt8yR8anxPO3NCF4a4DkYCACam4oNAOBmSbA/640?wx_fmt=gif)

**目录**

一、背景

    1. 工程管理  

    2. 代码风格  

    3. 文档  

    4. 质量管理  

二、monorepo

    1. 什么是 monorepo

    2. monorepo 的优缺点

        2.1 优点  

        2.2 缺点  

        2.3 选择

三、lerna

    1. lerna 命令集

        1.1 命令行列表

        1.2 全局配置项

        1.3 过滤器参数

    2. lerna 原理解析

        2.1 文件结构  

        2.2 命令行注册

        2.3 依赖管理

        2.4 lerna 中涉及的 git 命令

四、总结

**一**

**背景**

Babel 是一个比较庞大的项目，其子工程就有至少 140 个 (如 babel/plugins/presets/lerna/babel-loader 等)，产出的子工具已经是前端开发的基础设施，对开发效率、代码质量等有非常高的要求。

在本文中，我们将了解 Babel 是怎样进行项目管理的。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74Dm9aYQq0A4AVT5uqmJsJSsOmiamee8mQZvpTH3c8sLjra4amoG56SEkfIPRDc8wicwSJ8ISldG7p2Q/640?wx_fmt=png&from=appmsg)

本文从工程管理、代码管理、文档管理、质量管理四个方面对 Babel 项目管理进行拆解分析。

**工程管理**

Babel 是典型的 monorepo 项目，即单仓库项目，所有的子模块在同一个仓库里。Babel 目前有 140 + 个子模块，在工程管理部分，需要解决以下问题：

*   模块间如何方便地互相关联进行本地开发；
    
*   整个项目的版本控制；
    
*   操作自动化。
    

工程管理部分主要使用 lerna、yarn 等工具。

**代码风格**

Babel 是多人协作开发的开源项目，如何保证代码风格一致，Babel 使用的是社区常见的解决方案。

该模块主要使用 eslint、prettier 等工具。

**文档**

Babel 的迭代速度很快、涉及的模块很多，该模块解决版本发布后如何自动更新相关文档等问题。

该模块主要使用 lerna 等工具。

**质量控制**

Babel 的产品是前端开发的基础设施，该模块主要保证 Babel 的产出是高质量的。

该模块主要使用 jest、git blame 等工具。

**二**

**monorepo**

Babel 使用 monorepo 模式进行工程管理。

**什么是 monorepo**

monorepo(monolithic repository)，指的是单仓库代码，将多个项目代码存储在一个仓库里。另外有一种模式是 multirepo，指的是多仓库代码 (one-repository-per-module)，不同的项目分布在不同的仓库里。React、Babel、Jest、Vue、Angular 均采用 monorepo 进行项目管理。

典型的 monorepo 结构是：

```
├── packages
|   ├── pkg1
|   |   ├── package.json
|   ├── pkg2
|   |   ├── package.json
├── package.json
```

这是 Babel 源码的目录结构：

```
├─ lerna.json
├─ package.json
└─ packages/ # 这里将存放所有子项目目录
    ├─ README.md
    ├─ babel-cli
    ├─ babel-code-frame
    ├─ babel-compat-data
    ├─ babel-core
    ├─ babel-generator
    ├─ babel-helper-annotate-as-pure
    ├─ babel-helper-builder-binary-assignment-operator-visitor
    ├─ babel-helper-builder-react-jsx
    ├─ ...
```

而 rollup 则采取了 multirepo 的模式：

```
├─ rollup
    ├─ package.json
    ├─ ...
├─ plugins
    ├─ package.json
    ├─ ...
├─ awesome
    ├─ package.json
    ├─ ...
├─ rollup-starter-lib
    ├─ package.json
    ├─ ...
├─ rollup-plugin-babel
    ├─ package.json
    ├─ ...
├─ rollup-plugin-commonjs
    ├─ package.json
    ├─ ...
```

**monorepo 的优缺点**

**优点**

*   便捷的代码复用与依赖管理
    
    当所有项目代码都在一个工程里，抽离可复用的代码就十分容易了。并且抽离后，如果复用的代码有改动，可以通过一些工具，快速定位受影响的子工程，进而做到子工程的版本控制。
    
*   便捷的代码重构
    
    通过一些工具，monorepo 项目中的代码改动可以快速地定位出代码变更的影响范围，对整个工程进行快速的整体测试。而如果子工程分散在不同的工程分支里的话，通用代码的重构将难以触达各个子工程。
    
*   倡导开放、共享
    
    monorepo 项目中，开发者可以方便地看到所有子工程，这样响应了 "开放、共享" 的组织文化。可以激发开发者对工程质量等维护的热情（毕竟别人看不到自己的代码，乱不乱就看自己心情了），有助于团队建立良好的技术氛围。
    

**缺点**

*   复杂的权限管理
    
    因为所有子工程集中在一个工程里，某些子工程如果不希望对外展示的话，monorepo 的权限管理就比较难以实现了，难以锁定目标工程做独立的代码权限管理。
    
*   较高的熟悉成本
    
    相对于 multirepo，monorepo 涉及各种子工程、通用依赖等，新的开发者在理解整个项目时，可能需要了解较多的信息才能入手，如通用依赖代码、各子工程功能。
    
*   较大的工程体积
    
    很明显，所有子工程集成在一个工程里，代码体积会非常大，对文件存储系统等提出了较高的要求。
    
*   较高的质量风险
    
    成也萧何败萧何，monorepo 提供了便捷的代码复用能力，同时，一个公用模块的某个版本有 bug 的话，很容易影响所有用到它的子工程。此时，做好高覆盖率的单元测试就比较重要了。
    

**选择**

multirepo 和 monorepo 是两种不同的理念。

multirepo 允许多元化发展，每个模块独立实现自己的构建、单元测试、依赖管理等。monorepo 抹平了模块间的很多差异，通过集中管理和高度集成化的工具，减少开发和沟通时的成本。monorepo 最大的问题可能就是不能管理占用空间太大的项目了。

所以，还是要根据项目的实际需求出发选择用哪种项目管理模式。

**三**

**lerna**

lerna 是基于 git/npm/yarn 等的工作流提效工具，用于维护 monorepo。它是 Babel 开发过程中提升开发效率产出的工具。

lerna 本身也是一个 monorepo 的项目，并且，lerna 为 monorepo 项目提供了如下支持:

*   项目管理
    
    lerna 提供了一系列命令用于 monorepo 项目初始化、添加子项目、查看项目信息等。
    
*   依赖管理
    
    lerna 支持为 monorepo 项目统一管理公共依赖、自动安装各个子项目的依赖、自动创建子模块符号链接等。
    
*   版本管理
    
    lerna 可以根据项目代码的变动情况，发现影响的子项目范围，在发布时提供语义化版本推荐等，极大提升了 monorepo 项目的版本管理效率。
    

**lerna 命令集**

**命令行列表**

lerna 官网有对各种命令各种用法的详细介绍，这些命令可以分为：项目管理、依赖管理、版本管理三大类。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74Dm9aYQq0A4AVT5uqmJsJSs79JfpJUH4o35cNawLPPsLvX8OhYaMoIIFaCzZnzxm3HOueCHgQybXA/640?wx_fmt=png&from=appmsg)

**全局配置项**

lerna 有一批通用参数，所有子命令均可以使用。

**--concurrency**

当 lerna 将任务并行执行时，需要使用多少线程 (默认为逻辑 CPU 内核数)。

```
lerna publish --concurrency 1
```

**--loglevel<silent|error|warn|success|info|verbose|silly>**

要报告什么级别的日志。如果失败，所有日志都写到当前工作目录中的 lerna-debug.log 中。

任何高于该设置的日志都会显示出来。默认值是 "info"。

**--max-buffer<bytes>**

为每个底层进程调用设置的最大缓冲区长度。例如，当有人希望在运行 lerna import 的同时导入包含大量提交的仓库时，就是它出场的时候了。在这种情况下，内置的缓冲区长度可能不够。

**--no-progress**

禁用进度条。在 CLI 环境中总是这样。

**--no-sort**

默认情况下，所有任务都按照拓扑排序的顺序在包上执行，以尊重所讨论的包的依赖关系。在不保证 lerna 调用一致的情况下，以最努力的方式打破循环。

如果只有少量的包有许多依赖项，或者某些包执行的时间长得不成比例，拓扑排序可能会导致并发瓶颈。--no-sort 配置项禁用排序，而是以最大并发的任意顺序执行任务。

如果您运行多个 watch 命令，该配置项也会有所帮助。因为 lerna run 将按照拓扑排序的顺序执行命令，所以在继续执行之前可能会等待某个命令。当您运行 "watch" 命令时会阻塞执行，因为他们通常不会结束。

**--reject-cycles**

如果（在 bootstrap、exec、publish 或 run 中）发现循环，则立即失败。

```
lerna bootstrap --reject-cycles
```

**过滤器参数**

**--scope<glob>**  

只包含名称与给定通配符匹配的包。

```
lerna exec --scope my-component -- ls -la     
lerna run --scope toolbar-* test     
lerna run --scope package-1 --scope *-2 lint
```

**--ignore<glob>**

排除名称与给定通配符匹配的包。

```
lerna exec --ignore package-{1,2,5}  -- ls -la     
lerna run --ignore package-1  test     
lerna run --ignore package-@(1|2) --ignore package-3 lint
```

**--no-private**

排除私有的包。默认情况下是包含它们的。

**--since [ref]**

只包含自指定 ref 以来已经改变的包。如果没有传递 ref，它默认为最近的标记。

```
# 列出自最新标记以来发生变化的包的内容
    $ lerna exec --since -- ls -la

    # 为自“master”以来所有发生更改的包运行测试
    $ lerna run test --since master

    # 列出自“某个分支”以来发生变化的所有包
    $ lerna ls --since some-branch
```

在 CI 中使用时，如果您可以获得 PR 将要进入的目标分支，那么它将特别有用，因为您可以将其作为 --since 配置项的 ref。这对于进入 master 和 feature 分支的 PR 来说很有效。

**--exclude-dependents**

当使用 --since 运行命令时，排除所有传递的被依赖项，覆盖默认的 “changed” 算法。

如果没有 --since 该参数时无效的，会抛出错误。

**--include-dependents**

在运行命令时包括所有传递的被依赖项，无视 --scope、--ignore 或 --since。

**--include-dependencies**

在运行命令时包括所有传递依赖项，无视 --scope、--ignore 或 --since。

与接受 --scope(bootstrap、clean、ls、run、exec) 的任何命令组合使用。确保对任何作用域的包（通过 --scope 或 --ignore）的所有依赖项（和 dev 依赖项）也进行操作。

注意：这将会覆盖 --scope 和 --ignore。

例如，如果一个匹配了 --ignore 的包被另一个正在引导的包所以来，那么它仍会照常工作。

当您想要 “设置” 一个依赖于其他正在设置的包其中的一个包时，这是非常有用的。

```
lerna bootstrap --scope my-component --include-dependencies     
# my-component 及其所有依赖项将被引导
```

```
lerna bootstrap --scope "package-*" --ignore "package-util-*" --include-dependencies     
# 所有匹配 "package-util-*" 的包将被忽略，除非它们依赖于名称匹配 "package-*" 的包
```

**--include-merged-tags**

```
lerna exec --since --include-merged-tags -- ls -la
```

在使用 --since 命令时，它包含来自合并分支的标记。这只有在从 feature 分支进行大量发布时才有用，通常情况下不推荐这样做。

**lerna 原理解析**

**文件结构**

以下是 lerna 的主要目录结构（省略了一些文件和文件夹）：

```
lerna
├─ CHANGELOG.md -- 更新日志
├─ README.md -- 文档
├─ commands -- 核心子模块
├─ core -- 核心子模块
├─ utils -- 核心子模块
├─ lerna.json -- lerna 配置文件
├─ package-lock.json -- 依赖声明
├─ package.json -- 依赖声明
├─ scripts -- 内置脚本
└─ yarn.lock -- 依赖声明
```

有趣的是，lerna 本身也是用 lerna 进行开发管理的。它是一个 monorepo 项目，其各个子项目分布在 lerna/commands/*、core/*、utils/* 目录下。

另外，在源码中，经常会看到名称为 @lerna/command 的子项目，如 lerna/core/lerna/index.js 的内容是：

```
const cli = require("@lerna/cli");

const addCmd = require("@lerna/add/command");
const bootstrapCmd = require("@lerna/bootstrap/command");
const changedCmd = require("@lerna/changed/command");
const cleanCmd = require("@lerna/clean/command");
const createCmd = require("@lerna/create/command");
const diffCmd = require("@lerna/diff/command");
const execCmd = require("@lerna/exec/command");
const importCmd = require("@lerna/import/command");
const infoCmd = require("@lerna/info/command");
const initCmd = require("@lerna/init/command");
const linkCmd = require("@lerna/link/command");
const listCmd = require("@lerna/list/command");
const publishCmd = require("@lerna/publish/command");
const runCmd = require("@lerna/run/command");
const versionCmd = require("@lerna/version/command");
```

这些子项目分布在 lerna/commands/*、core/*、utils/* 下，截至本文截稿时，lerna 有 61 个子项目。

以下是各子项目分布：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74Dm9aYQq0A4AVT5uqmJsJSsAJhYCHGldEb3ubY4wmGB1rQzMuw1073U7XNSviam7W5ibbbNfuPIZu0g/640?wx_fmt=png&from=appmsg)

**命令行注册**

lerna 命令注册工作集中在 lerna/core/lerna/* 路径下。

**lerna/core/lerna/package.json**

该文件的 bin 字段定义了 lerna 命令：

```
"bin": {         
    "lerna": "cli.js"     
}
```

**lerna/core/lerna/cli.js**

该文件描述了命令行的执行入口：

```
#!/usr/bin/env node

    "use strict";

    /* eslint-disable import/no-dynamic-require, global-require */
    const importLocal = require("import-local");

    if (importLocal(__filename)) {
        require("npmlog").info("cli", "using local version of lerna");
    } else {
        require(".")(process.argv.slice(2));
    }
```

**lerna/core/lerna/index.js**

该文件为命令行引入了所有 lerna 指令：

```
"use strict";

const cli = require("@lerna/cli");

const addCmd = require("@lerna/add/command");
const bootstrapCmd = require("@lerna/bootstrap/command");
const changedCmd = require("@lerna/changed/command");
const cleanCmd = require("@lerna/clean/command");
const createCmd = require("@lerna/create/command");
const diffCmd = require("@lerna/diff/command");
const execCmd = require("@lerna/exec/command");
const importCmd = require("@lerna/import/command");
const infoCmd = require("@lerna/info/command");
const initCmd = require("@lerna/init/command");
const linkCmd = require("@lerna/link/command");
const listCmd = require("@lerna/list/command");
const publishCmd = require("@lerna/publish/command");
const runCmd = require("@lerna/run/command");
const versionCmd = require("@lerna/version/command");

const pkg = require("./package.json");

module.exports = main;

function main(argv) {
const context = {
    lernaVersion: pkg.version,
};

return cli()
    .command(addCmd)
    .command(bootstrapCmd)
    .command(changedCmd)
    .command(cleanCmd)
    .command(createCmd)
    .command(diffCmd)
    .command(execCmd)
    .command(importCmd)
    .command(infoCmd)
    .command(initCmd)
    .command(linkCmd)
    .command(listCmd)
    .command(publishCmd)
    .command(runCmd)
    .command(versionCmd)
    .parse(argv, context);
}
```

**Commander 类**

lerna 的子命令均继承自 Command 类，比如 lerna init 命令定义为：

```
const { Command } = require("@lerna/command");

class InitCommand extends Command {
    ...
}
```

Command 类定义在 @lerna/command，位于 lerna/core/command 目录。

有一些写法值得借鉴，比如个别方法需要 InitCommand 的实例自行定义，否则抛错，InitCommand 类的定义如下：

```
class InitCommand extends Command {
    ...

    initialize() {
        throw new ValidationError(this.name, "initialize() needs to be implemented.");
    }

    execute() {
        throw new ValidationError(this.name, "execute() needs to be implemented.");
    }
}
```

**import-local**

上文提到，lerna/core/lerna/cli.js 描述了命令行的执行入口：

```
#!/usr/bin/env node

"use strict";

/* eslint-disable import/no-dynamic-require, global-require */
const importLocal = require("import-local");

if (importLocal(__filename)) {
    require("npmlog").info("cli", "using local version of lerna");
} else {
    require(".")(process.argv.slice(2));
}
```

其中，import-local 的作用是，实现本地开发版本和生产版本的切换。import-local/index.js 的内容是：

```
'use strict';
const path = require('path');
const resolveCwd = require('resolve-cwd');
const pkgDir = require('pkg-dir');

module.exports = filename => {
    const globalDir = pkgDir.sync(path.dirname(filename));
    const relativePath = path.relative(globalDir, filename);
    const pkg = require(path.join(globalDir, 'package.json'));
    const localFile = resolveCwd.silent(path.join(pkg.name, relativePath));
    const localNodeModules = path.join(process.cwd(), 'node_modules');
    const filenameInLocalNodeModules = !path.relative(localNodeModules, filename).startsWith('..');

    // Use path.relative() to detect local package installation,
    // because __filename's case is inconsistent on Windows
    // Can use === when targeting Node.js 8
    // See https://github.com/nodejs/node/issues/6624
    return !filenameInLocalNodeModules && localFile && path.relative(localFile, filename) !== '' && require(localFile);
};
```

**依赖管理**

Babel 使用 lerna 进行依赖管理。其中，lerna 自己实现了一套依赖管理机制，也支持基于 yarn 的依赖管理。这里主要介绍 lerna 的 hoisting。

子模块相同的依赖可以通过依赖提升（hoisting），将相同的依赖安装在根目录下，本地包之间用软连接实现。

**lerna bootstrap**

该命令执行时，会在每个子项目下面，各自安装其中 package.json 声明的依赖。

这样会有一个问题，相同的依赖会被重复安装，除了占用更多空间外，依赖安装速度也受影响。

**lerna bootstrap --hoist**

--hoist 标记时，lerna bootstrap 会识别子项目下名称和版本号相同的依赖，并将其安装在根目录的 node_modules 下，子项目的 node_modules 会生成软连接。

这样节省了空间，也减少了依赖安装的耗时。

**yarn install**

当在项目中声明 yarn 作为依赖安装的底层依赖，如：

lerna.json

```
{             
    "npmClient": "yarn",             
    "useWorkspaces": true,         
}
```

package.json

```
{             
    "workspaces": [                 
        "packages/*"             
    ]         
}
```

相对于 lerna，yarn 提供了更强大的依赖分析能力、hoisting 算法。而且，默认情况下，yarn 会开启 hoist 功能，也可以设置 nohoist 关闭该功能：

```
{             
    "workspaces": {                 
        "packages": [                     
            "Packages/*",                 
        ],                 
        "nohoist": [                     
            "**"                 
        ]             
     }         
}
```

**lerna 中涉及的 git 命令**

lerna 中广泛使用了 git 命令用于内部工作，这里列举了 lerna 中使用的 git 命令。

```
git init
git rev-parse
git describe
git rev-list
git tag
git log
git config
git diff-index
git --version
git show
git am
git reset
git ls-files
git diff-tree
git commit
git ls-remote
git checkout
git push
git add
git remote
git show-ref
```

没有必要逐个介绍 git 命令，我们选取几个不是很常见的 git 命令介绍，了解其作用、lerna 哪些命令用到了它们。

**git rev-parse**

*   主要用于解析 git 引用（如分支名称、标签名称等）或表达式，并输出对应的 SHA-1 值。它的作用包括但不限于：
    

*   解析提交、分支、标签等引用，获取对应的 SHA-1 值。
    
*   校验是否为有效的引用或表达式。
    
*   生成 git 对象的唯一标识符。
    

下面是一个 git rev-parse 命令的执行结果案例：

```
$ git rev-parse HEAD
f7f6d6f2b6b47eb8c4cf4b8bf5f83e0b8028c031
```

*   关联的 lerna 命令
    

*   lerna version：在执行版本升级操作时，lerna 会使用 git rev-parse 来获取先前提交的哈希值作为上一个版本的参考。
    
*   lerna changed：用于列出自上次标记以来发生变更的包，可能会用到 git rev-parse 来比较不同提交之间的差异。
    
*   lerna diff：显示自上次标记以来的所有包的 diff，也可能会使用 git rev-parse 来比较不同提交之间的差异。
    

*   lerna 源码案例
    
    libs/commands/import/src/index.ts
    

```
getCurrentSHA() {
    return this.execSync("git", ["rev-parse", "HEAD"]);
}

getWorkspaceRoot() {
    return this.execSync("git", ["rev-parse", "--show-toplevel"]);
}
```

**git describe**

*   主要用于根据最接近的标签来描述当前提交的位置。它的作用包括但不限于：
    

*   找到最接近当前提交的标签。
    
*   根据最接近的标签以及提交的 SHA-1 值生成一个描述字符串。
    
*   可以帮助识别当前提交相对于标签的距离，以及提交是否是基于标签进行的修改。
    

下面是一个 git describe 命令的执行结果案例：

```
$ git describe
polaris-release-1.0.0-c12345
```

*   关联的 lerna 命令
    

*   lerna version：在执行版本升级操作时，lerna 可能会使用 git describe 来确定当前提交的位置，以便生成新的版本号。
    

*   lerna 源码案例
    
    libs/commands/diff/src/lib/get-last-commit.ts
    

```
export function getLastCommit(execOpts?: ExecOptions) {
  if (hasTags(execOpts)) {
    log.silly("getLastTagInBranch", "");
    return childProcess.execSync("git", ["describe", "--tags", "--abbrev=0"], execOpts);
  }
  log.silly("getFirstCommit", "");
  return childProcess.execSync("git", ["rev-list", "--max-parents=0", "HEAD"], execOpts);
}
```

**git rev-list**

*   主要用于列出提交对象的 SHA-1 哈希值。它的作用包括但不限于：  
    

*   列出提交对象的哈希值，可以按时间、作者、提交者等顺序进行排序。
    
*   支持使用范围、分支、标签等参数来限制输出的提交范围。
    

下面是一个 git rev-list 命令的执行结果案例：

```
$ git rev-list HEAD
f7f6d6f2b6b47eb8c4cf4b8bf5f83e0b8028c031
a3d8b4e1c2e1d0a9b8c6e5f7d6a4b3e8a1b2c3d4
```

这里 git rev-list HEAD 将列出当前 HEAD 指向的提交及其之前的所有提交的 SHA-1 哈希值。

*   关联的 lerna 命令
    

*   lerna changed：列出自上次标记以来发生变更的包，可能会使用 git rev-list 来获取两个标记之间的提交列表。
    
*   lerna diff：显示自上次标记以来的所有包的 diff，也可能会使用 git rev-list 来获取两个标记之间的提交列表。
    

*   lerna 源码案例
    
    libs/commands/diff/src/lib/get-last-commit.ts
    

```
export function getLastCommit(execOpts?: ExecOptions) {
  if (hasTags(execOpts)) {
    log.silly("getLastTagInBranch", "");
    return childProcess.execSync("git", ["describe", "--tags", "--abbrev=0"], execOpts);
  }
  log.silly("getFirstCommit", "");
  return childProcess.execSync("git", ["rev-list", "--max-parents=0", "HEAD"], execOpts);
}
```

**git diff-index**

*   主要用于比较索引和工作树之间的差异，并将其输出为标准输出。它的作用包括但不限于：
    

*   检查暂存区（index）和当前工作目录之间的差异。
    
*   可以与不同的选项一起使用，以便输出不同格式的差异信息。
    

下面是一个 git diff-index 命令的执行结果案例：

```
$ git diff-index HEAD
:100644 100644 bcd1234... 0123456... M        file.txt
```

这里 git diff-index HEAD 将显示当前提交（HEAD）和工作目录之间的差异。

*   关联的 lerna 命令
    

*   lerna changed：列出自上次标记以来发生变更的包时，可能会用到 git diff-index 来比较索引和工作树之间的差异。
    

*   lerna 源码案例
    
    libs/commands/import/src/index.ts
    

```
export class ImportCommand extends Command<ImportCommandOptions> {
    ...
    if (this.execSync("git", ["diff-index", "HEAD"])) {
      throw new ValidationError("ECHANGES", "Local repository has un-committed changes");
    }
    ...
}
```

**git diff-tree**

*   主要用于比较两棵树之间的差异，并以特定的格式输出。它的作用包括但不限于：  
    

*   比较两个树对象之间的差异，例如提交对象和树对象之间的差异。
    
*   可以用于查看提交之间的差异，文件的更改等信息。
    

下面是一个 git diff-tree 命令的执行结果案例：

```
$ git diff-tree HEAD~2 HEAD
100644 blob a3d8b4e1c2e1d0a9b8c6e5f7d6a4b3e8a1b2c3d4        file.txt
```

*   关联的 lerna 命令
    

*   lerna diff：显示自上次标记以来的所有包的 diff 时，可能会使用 git diff-tree 来比较不同提交之间的差异。
    

*   lerna 源码案例
    
    libs/commands/publish/src/lib/get-projects-with-tagged-packages.ts
    

```
export async function getProjectsWithTaggedPackages(
  projectNodes: ProjectGraphProjectNodeWithPackage[],
  projectFileMap: ProjectFileMap,
  execOpts: ExecOptions
): Promise<ProjectGraphProjectNodeWithPackage[]> {
  log.silly("getTaggedPackages", "");

  // @see https://stackoverflow.com/a/424142/5707
  // FIXME: --root is only necessary for tests :P
  const result = await childProcess.exec(
    "git",
    ["diff-tree", "--name-only", "--no-commit-id", "--root", "-r", "-c", "HEAD"],
    execOpts
  );

  const stdout: string = result.stdout;
  const files = new Set(stdout.split("\n"));

  return projectNodes.filter((node) => projectFileMap[node.name]?.some((file) => files.has(file.file)));
}
```

**git show-ref**

*   主要用于显示引用（如分支和标签）的名称和其对应的提交哈希值。它的作用包括但不限于：  
    

*   列出 git 仓库中的所有引用及其对应的提交哈希值。
    
*   可以用于查看分支、标签等引用的信息。
    

下面是一个 git show-ref 命令的执行结果案例：

```
$ git show-ref
a3d8b4e1c2e1d0a9b8c6e5f7d6a4b3e8a1b2c3d4 HEAD
a3d8b4e1c2e1d0a9b8c6e5f7d6a4b3e8a1b2c3d4 refs/heads/main
f7f6d6f2b6b47eb8c4cf4b8bf5f83e0b8028c031 refs/tags/v1.0.0
```

*   关联的 lerna 命令
    

*   lerna version：在执行版本升级操作时，lerna 可能会使用 git show-ref 来获取引用的信息，以确定当前提交的位置。
    

*   lerna 源码案例
    
    libs/commands/version/src/lib/remote-branch-exists.ts
    

```
export function remoteBranchExists(gitRemote: string, branch: string, opts: ExecOptions) {
  log.silly("remoteBranchExists", "");

  const remoteBranch = `${gitRemote}/${branch}`;

  try {
    childProcess.execSync("git", ["show-ref", "--verify", `refs/remotes/${remoteBranch}`], opts);
    return true;
  } catch (e) {
    return false;
  }
}
```

**四**

**总结**

可以看到，lerna 的内容还是挺多的，如果细致研究，里面有大量的方向可以探索，比如文末的 git 命令集，这些值得新开一篇文章详细介绍，敬请期待！

**往期回顾**

1. [星创编辑器在投放业务中的落地｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525615&idx=1&sn=6b23091e2937e1c7e3009a0884772b57&chksm=c16131b0f616b8a6720c24f1cf803fe10d88198572c856505f2ef4e54c4920aa26ff97325b38&scene=21#wechat_redirect)  
2. [Java 程序陷入时间裂缝：探索代码深处的神秘停顿｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525463&idx=1&sn=78d614e3e45c0b461110affb38ca8714&chksm=c1613108f616b81e44dcd159a1e1910c46f656f70efcb13b0a011823bb3d4bc50491a6857459&scene=21#wechat_redirect)  
3. [KubeAI 大模型推理加速实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525427&idx=1&sn=028ab7154ceded5f00317818e8105d98&chksm=c161316cf616b87afe27980d3510c471829af018833077fb9892f3ad2f1a19f47b11db342386&scene=21#wechat_redirect)  
4. [供应链 PC 实操落地实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525395&idx=1&sn=53694e74bff8c77df1e4efcfa76f1d10&chksm=c161314cf616b85a49df9ef49bbd250a69a00ac2d695c06139946332120d1d72e2283f0b4a5d&scene=21#wechat_redirect)  
5. [Android Fresco 调优实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525351&idx=1&sn=f2643ee45a23d0db543a1e1c693bd3bd&chksm=c16136b8f616bfae80d3a0ac90472c88ae0ab34996422440a7c13751f2bab0ca9793b0c8cb16&scene=21#wechat_redirect)

文 / 效率前端小丙

关注得物技术，每周一、三、五更新技术干货

要是觉得文章对你有帮助的话，欢迎评论转发点赞～

未经得物技术许可严禁转载，否则依法追究法律责任。

“

**扫码添加小助手微信**

如有任何疑问，或想要了解更多技术资讯，请添加小助手微信：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74Dm9aYQq0A4AVT5uqmJsJSsvnIE17BGbCUicohNfs44Kf8gBkEBVKqVMKr7jGjQ5xbr8VSEs9gYwzw/640?wx_fmt=jpeg&from=appmsg)