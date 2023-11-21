> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/j_nkMK8sqd5VSI1x0e8VNA)

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjicxujtUicgrwYSWZ17T57BMrvlrGaOnWkdzKvvcUSROas9EdELtp2fqgmgah1aoTJhvgvHrhdUdsg/640?wx_fmt=png)

背景
--

changesets 是 jira 公司 atlassian 的产品，目前已经转由 changesets 新组织专门维护

*   repo 地址：changesets/changesets
    

谁在用？

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjicxujtUicgrwYSWZ17T57BMAia2vvGfAs52iaHibNSGbDib8EGqVW1T5cgtauLxbN6ViaibNJrU0CWuCcnA/640?wx_fmt=png)

先置理论
----

### 聊聊工作流

![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjicxujtUicgrwYSWZ17T57BMB4tOhh5HkyzDrVRmicsYicRjnLQ0LIsycEMbJfu0fOtvaXh3oiaATUkZQ/640?wx_fmt=png)

#### workflow 一致性问题

如何达成一致协作的 workflow？

*   公司内：拉通对齐形成一致合力
    
*   开源：github bot + github actions
    

#### 开源项目的工作流解法

官方推荐自动化解法：Automating Changesets

##### github bot

*   Bot 介绍：changeset-bot
    

1.  规范开发者行为  
    ![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjicxujtUicgrwYSWZ17T57BMJicXgSvnIib7gT1XHp068w1c6QVnIEmPibo0jf1sZne2Le1t850DqQk6A/640?wx_fmt=png)
    
2.  自动生成 release changelog 报告，可控制的统一发版行为 （例子：changesets pull #718 ）  
    ![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjicxujtUicgrwYSWZ17T57BMQNIhaqpUFKn2HslrVAhJzJxxgngZaBO4tYXjqLenbuxpoA38C4q2QA/640?wx_fmt=png)
    

##### github actions

*   action 地址：changesets/action  
    ![](https://mmbiz.qpic.cn/mmbiz_png/pqcWLvSo2kjicxujtUicgrwYSWZ17T57BMIzmbybCczr7c1ib85WyYDYKGUdHK08caGDn1h7xavFBwkQq7xAC0niag/640?wx_fmt=png)
    

所以开源项目的 Auto workflow 的解法流程是：

1.  **开发阶段**：开发者开发代码，进行 PR ，由 github bot 规范保证提交变更集，此处附带了：
    
    a. 单次变动的 changelog  
    b. 影响 version 程度
    
2.  **收集阶段**：项目 owner 收集 approve 需要的 PR ，此时 github bot 会以一个 PR 为形式，积累所有变动的发版 PR 。内包含了：
    
    a. 项目 release changelog  
    b. 每个子包的 version 变化  
    c. 每个子包的 changelog
    
3.  **发版阶段**：经过一段时间，收集足够 PR (变更集) 后，项目 owner 合并 github bot 提出的发版 PR ，由 github actions 自动发版，此处会进行：
    
    a. 自动发版至 npm  
    b. 每个子包接收 changelog 附加、version 变化
    

实践赋能
----

### 安装 changesets

```
# 安装 changesets  pnpm add -W -D @changesets/cli  # 初始化 changesets 文件夹  npx changeset init
```

### 配置 changestes

配置 `.changeset/config.json` ：

```
{  "$schema": "https://unpkg.com/@changesets/config@1.6.1/schema.json",    // changelog 生成方式  "changelog": "@changesets/cli/changelog",  // 开源项目可用 github 格式的 changelog，会附带 commit link  // "changelog": ["@changesets/changelog-github", { "repo": "changesets/changesets" }]    // 不要让 changeset 在 publish 的时候帮我们做 git add  "commit": false,    // 配置哪些包要共享版本  // 参考1：https://github.com/changesets/changesets/blob/main/docs/config-file-options.md#linked-array-of-arrays-of-package-names  // 参考2：https://github.com/changesets/changesets/blob/main/docs/linked-packages.md#using-glob-expressions  "linked": [],    // 公私有安全设定，内网建议 restricted ，开源使用 public  "access": "restricted",    // 项目主分支  "baseBranch": "origin/main",    // 确保某包依赖的包发生 upgrade，该包也要发生 version upgrade 的衡量单位（量级）  // https://github.com/changesets/changesets/blob/main/docs/config-file-options.md#updateinternaldependencies  "updateInternalDependencies": "patch",    // 不需要变动 version 的包  "ignore": [],    // 在每次 version 变动时一定无理由 patch 抬升依赖他的那些包的版本，防止陷入 major 优先的未更新问题  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {    // https://github.com/changesets/changesets/blob/c68536edf4c04e7fdf5594ec9c69471cd86fd0ce/packages/assemble-release-plan/src/determine-dependents.ts#L88    "updateInternalDependents": "always"  }}
```

各个选项介绍可直接参看官方文档说明，这里给出两份不同场景的推荐解法：

#### 业务项目

```
{  "$schema": "https://unpkg.com/@changesets/config@1.6.1/schema.json",  "changelog": "@changesets/cli/changelog",  "commit": false,  "linked": [],  "access": "restricted",  "baseBranch": "origin/main",  "updateInternalDependencies": "patch",  "ignore": [],  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {    "updateInternalDependents": "always"  }}
```

#### 开源项目

```
{  "$schema": "https://unpkg.com/@changesets/config@1.6.1/schema.json",  // ⬇️ 这里和业务的配置不一样~  "changelog": ["@changesets/changelog-github", { "repo": "owner/repo" }],  "commit": false,  "linked": [],  // ⬇️ 这里和业务的配置不一样~  "access": "public",  "baseBranch": "origin/main",  "updateInternalDependencies": "patch",  "ignore": [],  "___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH": {    "updateInternalDependents": "always"  }}
```

### 修改 packages.json

修改项目根目录的 `package.json` ：

```
// package.json// 新增"scripts": {    // 构建整个项目的产物  	"build": "pnpm -r --filter ./packages run build",        // 1. 开始交互式填写变更集    "changeset": "changeset",          // 2. 用来统一提升版本号    "version-packages": "changeset version",         // 3. 构建产物后发版    "release": "pnpm build && pnpm release:only",    "release:only": "changeset publish --registry=https://registry.npmjs.com/"}// 新增"publishConfig": {  "access": "public"}
```

这里同样给出两种不同场景的解法：

#### 业务项目

```
// package.json"scripts": {  	"build": "pnpm -r --filter ./packages run build",    	// ⬇️ 由于需要频繁使用，本地用更短的命令来节省成本 🥰    "change": "changeset",      // ⬇️ 由于内部无 github bot，本地用更短的命令节省成本 🥰    "vp": "pnpm version-packages",    "version-packages": "changeset version",      "release": "pnpm build && pnpm release:only",    	// ⬇️ 配置公司源    "release:only": "changeset publish --registry=https://company-registry/"}
```

可选：新增 `.npmrc` 限定私有源，若默认配置全走私有则无需这一步

```
# .npmrc@scope:registry=https://company-registry/
```

#### 开源项目

```
// package.json"scripts": {  	"build": "pnpm -r --filter ./packages run build",    "changeset": "changeset",    "version-packages": "changeset version",    "release": "pnpm build && pnpm release:only",    "release:only": "changeset publish --registry=https://registry.npmjs.com/"}"publishConfig": {  "access": "public"}
```

进阶思考
----

### 业务项目发布流是怎么样的？

1.  不同开发者先开发，在提交 PR 时使用 `pnpm changeset` 写入一份变更集
    
2.  定期项目 owner 发包，使用 `pnpm version-packages` 消耗所有变更集，由 changesets 自动提升子包版本、生成 changelog 😆
    
3.  执行 `pnpm release` 构建全部项目并发包 🥰
    

### 开源项目发布流是怎样的？

1.  由 github bot 帮助，每位开发者 PR 前提交一份变更集
    
2.  由 github bot 帮助，项目 owner 定期点击合入 bot 提出的 发版 PR ，一键合入提升版本，生成 changelog 😆
    
3.  由 github actions 帮助，当 发版 PR 被合入时，自动发包到 npm 🥰
    

可以看到，发版时项目 owner 做了什么？点击几下鼠标 😅 ，但是 changelog 、版本提升、发包 却一点没少，是真的很 nice。

changeset publish 怎样用好？  

实际上，`changeset publish` 只是一个很纯净的发包命令，他会将所有包都 publish 一次，所以即使不通过 workflow 来提升版本，手动 提升 / 修改 版本后再 `changeset publish` 也是可以成功的。

比如你有紧急的测试场景，可以快速手动修改为带 tag 的版本 publish 测试。

### 如何 release with tag (like beta version)？

#### 方法一：手动调试法

根据上文我们对 `changeset publish` 的理解可以得知，每次修改完代码后，手工修改某个包的版本号带上 tag 后进行 tag 发布即可：

```
// package.json{	"name": "@scope/some-package",    "version": "1.0.1-beta.1"}
```

```
# 注意不要忘记附带 tag 的 optionpnpm changeset publish --tag beta
```

#### 方法二：整体调试法

利用官方提供的 prerelease 模式，先进入 pre 模式：

```
# 进入 beta 为 tag 的 prerelease 模式pnpm changeset pre enter beta
```

之后在此模式下的 `changeset publish` 均将默认走 `beta` 环境，下面在此模式下任意的进行你的开发，举一个例子如下：

```
# 1-1 进行了一些开发...# 1-2 提交变更集pnpm changeset# 1-3 提升版本pnpm vp # changeset version# 1-4 发包pnpm release # pnpm build && pnpm changeset publish --registry=...# 1-5 得到 1.0.0-beta.1# 2-1 进行了一些开发...# 2-2 提交变更集pnpm changeset# 2-3 提升版本pnpm vp# 2-4 发包pnpm release# 2-5 得到 1.0.0-beta.2# ......
```

完全调试好后，退出 prerelease 模式：

```
pnpm changeset pre exit
```

可以看到这种方式更加体系化，当然为了本地调试预发更方便，你可以尽最大限度的聚合命令在一起运行，并缩略命令长度。

### 业务项目 monorepo 里，业务应用和基础库混杂的场景如何优雅打开？

#### 问题场景

考虑一种业务场景，我们又要把业务应用放到 monorepo 里，又要把基础库、工具包放到 monorepo 里（他们可能不是一个 workspace 文件夹，这样也不会很混乱）。  
考虑到业务的复杂、敏捷性，这样做的好处是可以直接走仓内工作区协议 `workspace:version` 去快速使用，无需发版，而且不需要在多个 repo 间反复横跳。

#### 问题拆解

此时就会遇到一种问题，虽然我们对业务项目指定了 `private: true` ，他不会被发包，但由于他依赖了仓内的工具库，在工具库提升版本时，该业务应用的版本仍然会被提升，同时生成一份 changelog 在业务项目的目录内（即使不填写 `version` 字段也会生成），这是我们非预期的。

如何开解？

#### 问题解法

为了解决这个问题，我们需要把业务应用的 name 加入 changeset 配置文件内的 `ignore` 字段来代表不要对该项目进行任何操作。

但对于一个 monorepo 来说，业务项目数量多了怎么解？每次都去手动填写 `ignore` 吗，显然不是，我们需要 monkey patch 一下 `pnpm changeset` ，比如：

```
// package.json"scripts": {  // 这个脚本会帮我们去收集所有 private 的包  // 并把他们的 name 加入 changeset 配置文件的 ignore 列表中	"change": "node ./scripts/change.js",}
```

如此一来，便可自动解掉业务项目和工具混杂的问题。

### 业务项目每次发布前，怎么进行前置依赖最优构建？

考虑一种业务 monorepo 仓库中常见的场景：

1.  我们有 `@scope/a` 、`@scope/b` 、`@scope/c` 三个基础包
    
2.  我们需要构建某个项目 `@project/a` ，他依赖了 `@scope/a`
    

如果每次发布 project 前，全量构建所有基础包，明显是浪费，如何解？

目前有几种解法：

1.  使用 pnpm 的 `-r` 原生进行递归构建
    
2.  使用 `turborepo` 等工具寻求最佳构建路径
    

我们对比下：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th align="center" data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">对比项</th><th align="left" data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">pnpm -r</th><th align="left" data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">turborepo</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td align="center" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">cache</td><td align="left" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">😅 无。二次构建需要再次打包</td><td align="left" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🥰 有。本地二次构建可根据 hash 略过构建，在 cicd 中可利用上次容器的文件缓存略过构建</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td align="center" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">best build path</td><td align="left" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">😅 无。每次都全部 <code>-r</code> 递归构建全部基础包</td><td align="left" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🥰 有。turbo 会自动寻找要构建的 project 预依赖了哪些 dependencies ，只构建需要的，构建顺序是最优的</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td align="center" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">flexible exec script</td><td align="left" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">🥰 有。每次 <code>pnpm exec</code> 可以灵活指定要执行的命令，支持附带参数</td><td align="left" data-style="border-color: rgb(204, 204, 204); min-width: 85px;">😅 无。只能执行每个包 <code>scripts</code> 内含有的命令</td></tr></tbody></table>

另附加一篇我对 turborepo 理解的入门级教程：

《 使用 Turborepo 进行复杂拓扑关系的 monorepo 最优构建 》

turborepo 不是唯一解，还有 `nx` 等 build system 组织工具。

### 同类竞品比较？

#### lerna

1.  上手成本高，需要提前安装
    
2.  yarn 对 monorepo 不原生支持，需要繁琐的配置
    
3.  隐式依赖、幽灵依赖
    
4.  changelog 不成熟
    
5.  不再积极维护
    

#### rush

思路也是类似，需要开发者提供变更说明文件，不过过程相较 changesets 更加繁琐，文档劝退 🤬

### 我眼中的效能基础

*   pnpm monorepo
    
*   changesets
    
*   turborepo
    

原文链接：https://blog.csdn.net/qq_21567385/article/details/122361591

**喜欢点赞，再看，转发谢谢！**

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步