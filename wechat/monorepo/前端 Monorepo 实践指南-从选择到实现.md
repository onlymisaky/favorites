> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kd_L-pU7QpIKori0VfL6_A)

本文转载于稀土掘金技术社区，作者：ssshooter

https://juejin.cn/post/7527954323828588594

当你想用 monorepo 时，必须要搞清楚一件事，为什么要用 monorepo？

一般来说，只有体量很大的公司会考虑 monorepo，这与组织架构和组织间的协作有关。一个组织的沟通结构、层级关系和协作方式，会在它设计或开发的产品、系统甚至软件架构中被 “投射” 或“复刻”出来。这就是**康威定律**，使用 monorepo 很重要的一个原因。

公司内部不同组织可以通过一个大仓库配置所有项目的规范，这个规范不是限制前端框架而是代码格式和 eslint 的统一。不同项目间的依赖也能通过 monorepo 框架生成，一目了然。

另一种情况是**开源项目**，Vue3[1] 的代码库就是一个 monorepo 的例子。Vue 虽不是出自大公司之手，但参与的人数众多，分出独立的不同模块也是一个不错的选择。这样单独的模块可以独立开发，也可以被单独测试，这确保了多人合作下软件质量的稳定性。

选择 monorepo 是有代价的，所以没有充分的理由请不要无脑上 monorepo，哪怕这个理由是**干中学**，问题也不大，总之**不要为了装逼用 monorepo**。

如果你的公司部门**多且联系紧密**，monorepo 就显得很必要，但是相反，就一个部门单干，又或者各个部门间都不会互相调用包，那么 monorepo 就很可能不适合你。

monorepo 还有这么一系列缺点：

*   CICD 就变得有点麻烦，不再那么直观
    
*   跨包的方法调用虽然不麻烦但肯定也不如单仓库简单
    
*   一个大仓库拉下来都是个费时费硬盘的动作
    
*   monorepo 内的权限不好控制
    

以上的这一套逻辑，无论优缺点，同样适合**微前端**，甚至可以说微前端能派上用场的机会比 monorepo 更小。

当你深思熟虑决定要用 monorepo 了，那就进入到下一步，要用什么工具。

workspaces
----------

首先要让你的**包管理器**适配 monorepo，这里以 pnpm 为例，npm 和 yarn 配置不同，但逻辑类似。

使用 pnpm 的 Workspace[2] 首先要在根目录建一个 `pnpm-workspace.yaml` 文件：

```
packages:  # specify a package in a direct subdir of the root  - "my-app"# all packages in direct subdirs of packages/  - "packages/*"# all packages in subdirs of components/  - "components/**"# exclude packages that are inside test directories  - "!**/test/**"catalog:  chalk: ^4.1.2catalogs:  react16:    react: ^16.7.0    react-dom: ^16.7.0  react17:    react: ^17.10.0    react-dom: ^17.10.0
```

这时候你需要运行其中一个包，可以进包目录正常运行，也可以在根目录用 `-F` 过滤运行：

```
pnpm -F package-name run dev
```

如果你依赖了仓库内的包，这次运行就多半会出现问题了。

pnpm workspaces 确实有效解决了**外部**依赖管理的基本需求。

但是仓库内的包怎么办？仓库内的 A 包依赖 B，你要记得，monorepo 里的可是源码，它不会因为被依赖就自动 build，怎么直接依赖？那难道每次更新都要整体 build 一遍？

确实是可以的，pnpm 可以让你简单粗暴地把所有包都 build 一遍：

```
pnpm recursive run build
```

这并非长远之计，尤其是项目非常大的时候（又凑巧，monorepo 一般都很大）。我们需要一个能帮我们自动构建内部依赖的工具，并且最好是只构建当前包依赖的包而不是整个 monorepo。

turborepo
---------

**turborepo** 就是上一个问题的答案，它可以用于处理任务执行调度、缓存等更高层的构建效率问题。

现有仓库接入 turborepo 不麻烦，可以参考官方文档 [3]，简单来说就是先安装 turborepo：

```
pnpm add turbo --save-dev --ignore-workspace-root-check
```

然后在根目录创建 `turbo.json` 文件：

```
{ "$schema": "https://turborepo.com/schema.json","tasks": {"build": {   "dependsOn": ["^build"],   "outputs": ["dist/**"]  },"check-types": {   "dependsOn": ["^check-types"]  },"dev": {   "dependsOn": ["^build"],   "persistent": true,   "cache": false  } }}
```

关键看 `"dependsOn": ["^build"]` 这一行，加上之后 build 或者 dev 的时候就能自动构建内部依赖。

最后仓库的结构就类似这样：

```
my-monorepo/├── packages/│   ├── ui-components/│   ├── utils/│   └── shared-types/├── apps/│   ├── web-app/│   └── admin-dashboard/├── pnpm-workspace.yaml├── turbo.json└── package.json
```

也可以参考官方提供的 Example[4]，各种框架各种脚手架的例子都有。

在独立仓库迁移到 monorepo 的过程中，turborepo 基本没有什么强制要修改的地方。现在的 monorepo 迁移要比前 AI 时代简单多了，借助 AI 可以轻松把项目依赖改为内部包名，还能快速把多个仓库的共有依赖抽取为 `catalog`。

turborepo 还支持远程缓存，在多人协作时对于构建时间很长的任务可以直接拉取远程缓存。不过这是收费的，turborepo 毕竟是 vercel 开发的，当然要推销自家产品了。

类似的工具还有 Nx[5]，功能更全面但学习成本更高，还能支持其他语言的多仓库管理。

changesets
----------

changesets[6] 是一个写 changelog 的好帮手，并且它无需额外配置直接支持 monorepo，在一个包更新时，它能帮你顺便更新它的依赖者的 changelog。

```
pnpm add @changesets/cli --save-dev --ignore-workspace-root-check
```

初始化后会自动生成一份泛用的配置：

```
npx changeset init
```

正式生成更新文档：

```
npx changeset# 输出🦋  Which packages would you like to include? · @mind-elixir/import-freemind🦋  Which packages should have a major bump? · @mind-elixir/import-freemind🦋  Please enter a summary for this change (this will be in the changelogs).🦋    (submit empty line to open external editor)🦋  Summary · 1.0.0 Released🦋🦋  === Summary of changesets ===🦋  major:  @mind-elixir/import-freemind🦋🦋  Note: All dependents of these packages that will be incompatible with the new version will be patch bumped when this changeset is applied.🦋🦋  Is this your desired changeset? (Y/n) · true🦋  Changeset added! - you can now commit it🦋🦋  warn This Changeset includes a major change and we STRONGLY recommend adding more information to the changeset:🦋  warn WHAT the breaking change is🦋  warn WHY the change was made🦋  warn HOW a consumer should update their code
```

应用更新文档：

```
npx changeset version# 输出🦋  All files have been updated. Review them and commit at your leisure
```

对于其他团队协作规范，monorepo 跟单仓库差距不大，可以参考前端代码质量与团队协作终极指南 [7]。

总结
--

前端 monorepo 不是银弹，选择它需要基于实际的业务需求和团队规模。记住康威定律：你的架构会反映你的组织结构。

**适合使用 monorepo 的场景：**

*   多部门协作且联系紧密
    
*   需要统一代码规范和工具链
    
*   包之间存在复杂的依赖关系
    
*   开源项目需要模块化管理
    

**核心工具链组合：**

*   **pnpm workspaces**：解决依赖管理和包隔离
    
*   **turborepo**：处理构建调度和缓存优化
    
*   **changesets**：自动化版本管理和 changelog 生成
    

这套工具链已经足够应对大部分 monorepo 场景，重点是理解每个工具解决的具体问题，而不是盲目追求技术栈的复杂度。

最后，如果你的项目规模还不足以支撑 monorepo 的复杂性，那就继续用单仓库吧。技术选型的核心是解决问题，而不是炫技。