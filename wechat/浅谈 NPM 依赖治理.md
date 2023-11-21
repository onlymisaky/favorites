> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ibmDnso_rPQlu_2MEuLLhQ)

![](https://mmbiz.qpic.cn/mmbiz_gif/Tmczbd3NL0196LMAE4X5mc95nbzWXpVC12n1NDnGy33BgJdGjvbKz1sCLIjyMscp4tOqibZX3A9aodkmdE3pBbA/640?wx_fmt=gif)

想想项目创建之后，多久没给 npm 依赖升级了？

如何得知当前项目 npm 依赖的 “健康度”？

给老项目升级 npm 依赖，有哪些注意事项？

核心诉求
----

*   提高可维护性。不容易和后引入的依赖产生冲突。引入新特性，功能表现和文档描述接近，后续开发也能得心应手。
    
*   提高可移植性。方便老项目向高版本 npm 或 pnpm 迁移。
    
*   提高可靠性。只要依赖还在稳定迭代，升级必定能引入一系列 bugfix（却也可能引入新 bug）。
    
*   提高安全性。官方社区会及时通告 npm 依赖的安全漏洞，将版本保持在安全范围，能排除许多隐患。
    

流程方法
----

*   使用专业的评估工具。手动升级 @latest 等于把依赖当成黑盒来操作。
    
*   按优先级处理。集中精力升级核心依赖，以及含有安全隐患的库，否则时间投入很容易超出预期。
    
*   阅读 changelog，评估升级影响。
    
*   回归测试，十分重要。
    

除了回归测试以外，主导治理的人不仅要熟悉项目内容，也要对计划升级的 npm 包有充分了解。如果没有合适的人选，建议继续在代码堆里坚持一会儿，毕竟升级有风险，后果得自负。

检索工具
----

> 以下内容以 npm 为例，pnpm 和 yarn 有可替代的命令。

### 过时依赖 npm outdated

`npm outdated` 命令会从 npm 源检查已安装的软件包是否已过时。

随便拿几个包举例：

```
Package                             Current   Wanted        Latest  Location
axios                                0.18.1   0.18.1        0.27.2  project-dir
log4js                               2.11.0   2.11.0         6.5.2  project-dir
lru-cache                             4.1.5    4.1.5        7.10.2  project-dir
socket.io                             2.4.1    2.5.0         4.5.1  project-dir
vue                                  2.6.14   2.6.14        3.2.37  project-dir
vue-lazyload                          1.3.3    1.3.4    3.0.0-rc.2  project-dir
vue-loader                           14.2.4   14.2.4        17.0.0  project-dir
vue-router                            3.5.3    3.5.4        4.0.16  project-dir
vuex                                  3.6.2    3.6.2         4.0.2  project-dir
webpack                              3.12.0   3.12.0        5.73.0  project-dir
```

默认只会检查项目 package.json 中直接引用的依赖， `--all` 选项可以用来匹配全部的依赖。但没有必要，真要彻底升级，更推荐尝试重建 lock 文件。

对于 outdated 的包，使用 `npm update` 或其他包管理工具对应的 update 命令即可安装 SemVer 标准执行升级。如果想跨越 Major 版本，则需要手动指定升级版本。

### 风险依赖 npm audit

`npm audit` 命令同样是向 npm 源发起请求，它将 package-lock.json 作为参数，返回存在已知漏洞的依赖列表。换句话说，audit 不需要安装 node_modules 就可以执行，其结果完全取决于当前的 package-lock.json。

返回节选如下：

```
# Run  npm install swiper@8.2.5  to resolve 1 vulnerabilitySEMVER WARNING: Recommended action is a potentially breaking change┌───────────────┬──────────────────────────────────────────────────────────────┐│ Critical      │ Prototype Pollution in swiper                                │├───────────────┼──────────────────────────────────────────────────────────────┤│ Package       │ swiper                                                       │├───────────────┼──────────────────────────────────────────────────────────────┤│ Dependency of │ swiper                                                       │├───────────────┼──────────────────────────────────────────────────────────────┤│ Path          │ swiper                                                       │├───────────────┼──────────────────────────────────────────────────────────────┤│ More info     │ https://github.com/advisories/GHSA-p3hc-fv2j-rp68            │└───────────────┴──────────────────────────────────────────────────────────────┘found 125 vulnerabilities (8 low, 66 moderate, 41 high, 10 critical) in 2502 scanned packages  run `npm audit fix` to fix 15 of them.  96 vulnerabilities require semver-major dependency updates.  14 vulnerabilities require manual review. See the full report for details.
```

如果你发现执行结果为 404，说明当前源不支持 audit 接口，可更换到支持 audit 的官方源重新执行。

```
npm http fetch POST 404 https://registry.npmmirror.com/-/npm/v1/security/audits 306ms
npm ERR! code ENOAUDIT
npm ERR! audit Your configured registry (https://registry.npmmirror.com/) does not support audit requests.
npm ERR! audit The server said: <h1>404 Not Found</h1>
```

结果中虽然提到了 `npm audit fix` 命令，却不总是可靠的，它能修复的依赖有限，远不如通过升级 root 依赖修复间接依赖带来的数量明显。

### 隐式依赖 npx depcheck

npm cli 工具 `depcheck` 能辅助我们找到项目中 `Unused dependencies`（无用依赖）和 `Phantom dependencies`（幻影依赖），分别表示写入 package.json 但没被项目使用、被项目引用了但没有写入 package.json。

depcheck 更像是一个缩小排查范围的过滤器，不能轻信其打印结果。例如，depcheck 默认无法识别特殊挂载的 plugin。

```
Unused dependencies
 * clipboard
 * cross-env
 * firebase
 * proxy
 * route-cache
 * socket.io
Unused devDependencies
 * add-asset-html-webpack-plugin
 * commitizen
 * eslint
 * husky
 * jasmine
 * rimraf
 * stylelint
Missing dependencies
 * node-notifier: ./build/utils.js
```

要删除一个无用依赖，必须熟悉该 npm 包的使用性质，再结合 grep 工具反复确认。

### 僵尸依赖 npm install

最后，还要提防一种 `Zombie dependencies`（僵尸依赖）。不同于前面介绍的隐式依赖，它的危害很大。

首先它切实被项目使用，但已经被维护者 deprecated 或 archieved。意味着版本不再更新，包名不会出现在 outdated 列表；很可能没人报告漏洞，也不会出现在 audit 列表。但潜在的 bug 无人修复，它将一直躲藏在项目里，伺机而动。

笔者没发现合适的工具去寻找僵尸依赖，只好多留意 npm install 的 deprecated 日志。

治理建议
----

### 如何阅读 CHANGELOG

changelog 一般位于代码仓库的 `CHANGELOG.md` 或 `History.md`，随意一些的也可能放在在 Github 的 `releases` 页，正式一些的会放在官方网站的 `Migrations` 类目。

如果发现一个 npm 包没有 changelog，或 changelog 写得太差，建议换成其他更靠谱的替代品 ，就只能靠阅读 commits 了。

关键词（欢迎补充）：

*   BREAKING CHANGE
    
*   !
    
*   Node.js
    

开发者普遍会用上面的方式标注不兼容的变更。

### lock 文件版本管理

该建议是对商业软件的研发流程而言。活跃的开源场景并不需要 lock 文件，为了开发者迭代和测试的过程能趁早发现兼容性问题。

package-lock.json 的设计文稿就直言推荐把 lock 文件加入代码仓库：

*   保证团队成员和 CI 能使用完全相同的依赖关系
    
*   作为 node_modules 的轻量化备份
    
*   让依赖树的变化更具可见性
    
*   加速安装过程
    

但是，npm 依赖管理的策略因团队和项目而异，是否提交 lock 文件到 git 仓库可以按需取舍，版本管理的形式还有很多。

例如研发流程完善，每次发布的 lock 文件都会留在制品库或镜像中，能够随时被还原。可如果缺少相关举措，就要想办法将生产环境的 lock 文件备份，为问题复现、故障恢复提供依据。

### 更新 hoisting

常年累月的更新之下，许多 package-lock.json 的外层依赖的版本会落后于子节点，因为目前 npm 为了保持最小更新幅度，不会对 lock 树做旋转和变形。即使更新的项目的直接依赖到 latest，它的间接依赖可能还是旧的，以致现存的依赖提升结果和默认 hoisting 算法的偏差越来越大。

一些老项目脱离 package-lock.json 文件之后，甚至无法正常安装构建。此时依赖已经处于非常不健康的状态，开发者需要担心新引入的依赖是否会破坏平衡，无法迁移 npm 包管理工具，也不能升级 Node.js 版本。不过亡羊补牢并不复杂，总好过修复一个没有 package-lock.json 的项目。

想生成一份可靠的 package-lock.json，最简单的办法就是除旧迎新：

```
rm -rf package-lock.json node_modules
npm i
```

更好的办法是换到不使用 hoisting 的依赖管理工具。

情况讲清楚了，什么时候重建可以看自身需求。但是，将 lock 文件加入 .gitignore 的同学就要注意了，如果别人出现了你本地无法复现的问题，记得先删掉 package-lock.json。

### 整理 dependencies 和 devDependencies

package.json 中 `dependencies` 和 `devDependencies` 的区别就不必介绍了，但大家在项目中是否会做严格区分呢？

一来 devDependencies 是为 npm 包优化依赖关系设计的，作为应用的项目通常不会打包发布到 npm 上；二来不作区分也没有直接带来不良后果。因此经常会有小伙伴将开发环境依赖的工具直接安装到 dependencies 中。

不过，即使对项目而言，devDependencies 也有积极意义：

*   能从语义上划分依赖的用途
    
*   使用 `npm install --production` 可以忽略 devDependencies，提高安装效率，显著减少 node_modules 的体积
    

第二点还需要做个补充说明，由于静态项目的构建环境往往需要安装大部分 devDependencies 中的依赖，一般只有放在服务端运行的 Node.js 项目才需要考虑这么做。但随着 TypeScript 的普及或是 SSR 的引入，这些服务端项目在运行前也需要执行构建。那还有什么用？别忘了，还有一个 `npm prune --production` 能用作后置的项目体积优化。

当然了，语义划分带来帮助也足够大了，例如根据依赖关系来优化 npm 治理的优先级和策略。

顺便再提一句，dependencies 和 devDependencies 不是用来区分重要程度，请不要把运行可有可无的依赖放在 devDependencies，应该放在 optionalDependencies (https://docs.npmjs.com/cli/v6/configuring-npm/package-json#optionaldependencies) 中。

结语
--

以上介绍的经验多为概述，主要结合 npm 依赖管理工具的特点，没能介绍 yarn 和 pnpm 等工具独有的 API 和问题，如果读者想了解更多内容，请查阅相关文档。此外，同时使用多种依赖管理工具的项目颇为复杂，比较少见，本文未作分析，也不建议读者朋友们尝试。而在软件工程领域，依赖治理还有很多要点需要我们去进一步实践，不过内容更侧重于 refactor。

回到标语所提项目依赖的 “健康度”，实为笔者胡诌，用来形容依赖关系的混乱程度。不做这些依赖治理，也没有太大关系，因为软件的生命周期往往坚持不到依赖关系崩坏的那天。但混乱的依赖管理，却能轻易促成代码的腐化。

![](https://mmbiz.qpic.cn/mmbiz_gif/Tmczbd3NL0196LMAE4X5mc95nbzWXpVCkjkP6CaAUCsTnibDA5aF5ANbYh2ClbvibCeKCxRiaibOiczqIBSZ2icEhlqA/640?wx_fmt=gif)![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL0196LMAE4X5mc95nbzWXpVCxaoT3WFy1yfh0DnNLAwI4GibfSkQQEiaibxAO6HPaa09tkcuovAN5uWvQ/640?wx_fmt=png)