> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/28Vwmmv82vkaXB-6am3nFg)

> 随着团队建设以及相关业务的日益增长，越来越多的 NPM 包需要多人协同维护，各个项目之间有关联，就不得不在多个编辑器之间切换，以及通过 `npm link` 来调试，开发的效率受到制约，那有没有一种方式可以解决现在的痛点？答案就是 **Monorepo**!

![](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHT3FZakDYvSnCexO1JMMYhGnWDibZGicutsMGe5YG6pVN9IraibiaRyKl8EONh6z4ia3yjRmXBmnibtic3RQ/640?wx_fmt=png)

在字节跳动内部的百科词条中对于 `Monorepo` 的定义如下：

> Monorepo 是一种将多个项目代码存储在一个仓库里的软件开发策略。

目前来讲，Lerna 作为 JavaScript 项目的多包管理器，已经是比较成熟，并已被现代企业所验证，因此接下来将逐步搭建一个基于 Lerna[1] 的 Monorepo 管理环境，希望可以帮助大家在各司业务中落地并实现**降本提效**。

根据笔者经验，Monorepo 将显著提升开发人员的愉悦度，所以赶紧搞起来吧！

本文**主要内容结构**如下，朋友们可按需食用：

![](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHT3FZakDYvSnCexO1JMMYhGraN07mzsn3bNyfRy6sfqqnicib1H85YazoRaueodbIZpVHkEJrduM7Bg/640?wx_fmt=png)

一、为什么选择 Lerna
-------------

![](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHT3FZakDYvSnCexO1JMMYhGUGuymC5ygtTsBQ80KE2Nsbf8KQLhCOwViaRLd8Ef0MLYGoSUVMfUFQA/640?wx_fmt=png)

Monorepo 能被定义为策略，那么一定是一种能够解决问题的方案，基于 **Lerna** 实现的 Monorepo 多包管理方式，能解决的问题（优点）如下：

1.  **扁平**：同一仓库（项目）下，统一管理维护多个 `package`
    
2.  **集中**：在根目录的 `node_modules/` 文件夹下维护所有 `package` 的三方依赖
    
3.  **简化**：根据文件变动统一执行命令，按需发包，自动升级版本并回写仓库、打 `tag`
    
4.  **高效**：有互相依赖的项目直接可直接关联，避免开发人员在多仓库之间切换
    

当然，Lerna 经过长时间的使用，一些问题也在生产环境中暴露出来，典型的如：

1.  **无效构建**：每次发包前会对所有的 `package` 进行构建
    
2.  **无效依赖**：每次发包都会安装所有 `package` 的依赖项
    
3.  **幽灵依赖**：Phantom dependencies[2] 在依赖提升（`hoist`）后更加明显
    

这里将**问题罗列**出来，不是说 Lerna 就应该被放弃，而是我们应当清楚技术方案的利与弊，并结合项目的实际情况做一些取舍，上述的缺点只是在构建中不那么优雅，但并不影响 Lerna 作为一种可落地 Monorepo 的方案。

二、初始化一个 Monorepo 形式的项目
----------------------

我们将从 0 到 1 构建一个纯净的、基于 Lerna 的 Monorepo 项目，并将利于团队协作规范的 `ESlint` 校验，`Prettier` 自动格式化，以及 `git commit message` 规范一并完善。

### 2.1 初始化项目结构

首先就是得全局安装 Lerna：

```
yarn global add lerna// ornpm install lerna -g
```

然后就是新建项目目录，并使用 Lerna 初始化一个基本结构

```
mkdir dyboy-lerna-projectcd dyboy-lerna-project/lerna init --independent
```

如此之后，便得到了如下的一个文件目录结构：

```
.├── lerna.json   // lerna 的配置文件├── package.json // 当前项目的描述文件└── packages/    // 存放所有包的文件夹
```

Lerna 初始化项目的时候，追加了一个 `--independent` 的参数，其含义是使用**独立模式**。

在 Lerna 中，有两种模式：

1.  **固定模式**：所有 `package` 的版本号保持一致，每次更新发包都是全量的
    
2.  **独立模式**：每个 `package` 版本号各自独立，互不影响，每次更新按需发包
    

一般我们都会选择独立模式，来避免多 `package` 下频繁发包的情况出现，尤其是在一些业务变化频繁的项目下，发包压力恐怖如斯😱。

### 2.2 Lerna + Yarn Workspaces

Lerna 默认会使用 NPM 作为包管理器，但使用 yarn 作为 Lerna 的默认包管理器是更推荐的方式。

在 Yarn 1.0 版本，就已经支持了 workspaces 功能，其优势以及和 Lerna 的关系可以参考当时的这篇文章：《Workspaces[3]》

Yarn Workspaces 相结合，使得 Lerna 方案补齐短板，如虎添翼。

首先是修改 `lerna.json` 配置，改为如下内容：

```
{   "version": "independent",  "npmClient": "yarn",  "useWorkspaces": true}
```

然后在 package.json 文件中指明（新增）workspaces（工作空间）字段：

```
+ "workspaces": ["packages/*"],
```

意思就是认为 `packages/` 目录下的所有项目都归 Lerna + Yarn 管理，这之后，无论我们在哪个文件夹下执行 `yarn` 都将分析 `packages/` 目录下所有项目的依赖，并安装到根目录的 `node_modules/` 中。

### 2.3 ESlint + Prettier + Commit Rules

针对项目需要配置上述的规则，在任一项目中来说都是比较统一的，因之前文章中详述过相关配置流程，此处便不再赘述。

相关配置规则的初始化和详细流程可参考：《[手摸手学会搭建一个 TS+Rollup 的初始开发环境](https://mp.weixin.qq.com/s?__biz=MzIyODQzNTMyMA==&mid=2247484878&idx=1&sn=5b2aad6f90232b772867724303553b7e&scene=21#wechat_redirect)》中第 **5～7** 步骤。

经过上述配置好之后，我们的项目就算是大致初始化完成了！

![](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHT3FZakDYvSnCexO1JMMYhGIII87YODU6aPJ1DhtxWnibAj9toC8VE69F3QJicxO38icrSL54Aickla7g/640?wx_fmt=png)

### 2.4 NPM 团队账号

因为发包需要账号，Monorepo 同时管理了数个、数十个包，都需要维护发包。

如果使用个人账号发包到公司内自建的 Registry 上，万一该同学离职了，该仓库会变成 “幽灵仓库”。

当然，我们可以找公司内部 Registry 维护者直接更改对应包，但总归是比较麻烦的一件事。

为此可以给团队申请一个公共账号，通过 `npm token create` 创建一个权限 token，放到项目根目录下的 `.npmrc` 文件中。

之后无论是哪个开发者维护，都将默认使用团队账号发包更新。

**最后初始化的项目文件结构如下：**

![](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHT3FZakDYvSnCexO1JMMYhGgwhbyln5lxlUGaxTNoZWiazuVzuWT7DhwBGG0qYJMJ9qYicNDcpEkvkw/640?wx_fmt=png)

三、版本发布
------

之前说到过，Lerna 可以统一管理所有的包，因此我们可直接在根目录的 `package.json` 文件中指定快捷指令，实现**按需发包**的功能

**注意：** Lerna 发包时，会默认忽略掉在 `package.json` 中设置了 `"private": true` 的私有包。

### 3.1 项目打包编译

在发新的包版本之前，一般是需要打包编译好产物，在 Monorepo 下的多个包发布前，肯定也是需要先打包。

#### (1). Learn Run

借助 `Lerna` 提供的 `run` 命令，可以实现在发包前，让所有在 `package.json` -> `scripts` 中定义了指令的项目**执行该命令**

例如，执行：`lerna exec build`

则会遍历每一个 `package`，寻找其 `package.json` -> `scripts` 中是否定义了 `build` 命令，有则执行，否则跳过（在所有包含 `build` 命令的包中运行 `npm run build`）。

这样的方式会存在一个问题：每次发包前，都会把所有 pckage 都先 build 了一遍，**增加了打包发布的时间**。

那有没有更优雅的方式呐？

#### (2). NPM Scripts 生命周期

在 `package.json` 文件中自定义的 `scripts` 字段，含有默认的两个生命周期 `pre` 和 `post`

通过执行 `npm run build`，则会先自动执行`npm run prebuid`，然后是 `npm run build`，再者是执行 `npm run postbuild`。

除了 `package.json` -> `scripts` 中自定义的命令，还有 npm 自带的一些 scripts，比如 `npm publish`。

`npm publish` 命令的生命周期包含：

1.  prepublishOnly
    
2.  prepare
    
3.  prepublish
    
4.  publish
    
5.  postpublish
    

`prepare` 在 `npm publish --dry-run` 时不会被执行。

**注意**：npm 6.x 和 7.x 版本的生命周期有不同，上面是 6.x 版本，考虑到 6.x 和 7.x 版本的差异，建议将发包前的动作放到 `prepublishOnly` 命令中。

更多可以参考：《scripts - NPM 6.x 官方文档 [4]》 & 《scripts - NPM 7.x 官方文档 [5]》

#### (3). 按需 Build

有了上面对于 NPM Publish 生命周期的基础，因此我们可以在需要在发包时候构建的项目（`packages/`目录下的项目），在其 `package.json` -> `scripts` 中定义如下字段：

```
"scripts": {    "build": "rollup -c",    "prepublishOnly": "yarn build"}
```

如此，在执行 `npm publish` 的时候，会先执行 `prepublishOnly` 中的 `yarn build`，项目编译打包，然后再发包。

如此，按需发包就可以很优雅、流畅地搞定了！

![](https://mmbiz.qpic.cn/mmbiz_png/sQ040UzziaHT3FZakDYvSnCexO1JMMYhGT8wXmxy3ZsibGdO49Pc8XyHhlxPdTQQVk8piagpZ2XTxBH9oTsE79qKQ/640?wx_fmt=png)

3.2 项目发包
--------

到了发包阶段，我们在根目录的 `package.json` 文件中添加内容：

```
"scripts": {  "release": "lerna publish",  "release:beta": "lerna publish --canary --pre-dist-tag=beta --preid beta --yes"},
```

`yarn release` 用于发布正式版

`yarn relase:beta` 则是用于发布测试版本，用于给开发联调时候测试使用

**约定大于配置**：在根目录下的 `package.json` -> `name` 字段默认为 `root`，大家可以理解为 “**工作根目录**”，如果是有作用域的（`scope`，例如：@dyboy/utils），可以改名为：`@dyboy/root`，以便于让其他开发者知道这是一个有作用域的 Monorepo 项目，尽管 name 字段并没有什么作用。

总结
--

基于 Lerna 构建的 Monorepo 项目的心智成本不高，但需要我们对于其中的流程、生命周期、NPM Scripts 等知识有一定的认识和把握，需要构建者能在流程、管理中寻找需求共性和约束规范，为团队的降本提效落地解决方案。

本文从根据搭建流程来简述 Monorepo 的一种方案，在前端工程化中，构建者还需要思考是否存在优化空间以及斟酌细节？比如，书写通俗易懂的 README.md 文档，思考是否能让新人更容易上手，尝试解决流程中的问题并积极探索新的 Monorepo 技术解决方案，比如 Rush、PNPM ...

**TODO：** 能否实现 Monorepo 自动发正式版本的包？感兴趣的朋友可以关注后续的分享嗷！

### 参考资料

[1]

Lerna 官方网站: _https://lerna.js.org/_

[2]

Phantom dependencies - 应用级 Monorepo 优化方案: _https://github.com/worldzhao/blog/issues/9_

[3]

Yarn Workspaces: _https://classic.yarnpkg.com/lang/en/docs/workspaces/_

[4]

scripts - NPM 6.x 官方文档: _https://docs.npmjs.com/cli/v6/using-npm/scripts_

[5]

scripts - NPM 7.x 官方文档: _https://docs.npmjs.com/cli/v7/using-npm/scripts_