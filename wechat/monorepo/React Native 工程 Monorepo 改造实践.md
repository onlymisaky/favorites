> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/g5wb_BL-oMPl_sxQAaVMEA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/KV8By3euEQhNl6zt6Y1x55uN23ribOGqh5UCeyBzeIzw0LVIjib6ohhu89brrb5TgaDTaSHjXSMK0sJ95GIZsTmg/640?wx_fmt=jpeg)题图

> 图片来自：https://unsplash.com

背景
--

目前云音乐内有多个 RN 收银台场景分布在不同的工程，比如页面收银台，浮层收银台，个性收银台等，后续可能还会有别的收银台场景。

那在开发过程中存在的问题就是每个收银台的核心逻辑如商品展示、支付方式展示、下单购买等逻辑都大致相同，而每次有修改或者新增需求的时候都需要开发多次，重复代码较多效率低下。

虽然可以通过发 npm 包的形式复用代码，但是有些组件和代码块不太好抽成包，还会带来调试麻烦，发版等问题。所以为了提高代码复用，提高开发效率，我们希望能够在一个仓库内包含多个工程，也就是 Monorepo 形式。

Monorepo
--------

### 什么是 Monorepo

Monorepo 是一种将多个项目的代码集中在同一个仓库中的软件开发策略，与之对立的是传统的 MultiRepo 策略，即每个项目在一个单独的仓库进行管理。![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQhNl6zt6Y1x55uN23ribOGqh1y0rngHB3JGZpJgwc3EzaKMib8AxOxJcYlqNHlTXT9fNhHYYFWd4M0w/640?wx_fmt=png)目前像社区内一些著名的开源项目 Babel、React 和 Vue 等都是用这种策略来管理代码。

### Monorepo 解决的问题

要想知道 Monorepo 解决了哪些问题与其优势，我们先来看下 MultiRepo 存在的问题。

当我们在 MultiRepo 下两个工程之前需要复用一些代码时，往往会采用抽成 npm 包的形式。但当 npm 包有改动时我们需要做以下事情：

1.  修改 npm 包代码，通过 npm link 与两个工程调试
    
2.  调试完成后发布新版本
    
3.  两个工程升级 npm 包新版本，再进行发布
    

整个流程可以看出还是比较繁琐的，那如果是在 Monorepo 下我们可以将公共部分抽成一个 workspace，我们的两个工程分别也是 workspace 可以直接引用公共 workspace 的代码，工具会帮我们管理这些依赖关系，开发过程中调试起来也非常方便，而且不涉及到发包，版本依赖等，公共部分代码改动完成后两个工程部署即可。

从上述可以看出 Monorepo 主要有**代码复用容易**、**调试方便**和**简化依赖管理**等优点，这也是我们选择这个方案的原因。

当然 Monorepo 也有一些缺点，比如：仓库体积大、工程权限不好控制等。所以不管是 Monorepo 还是 MultiRepo 都不是完美的方案，只要能解决当下的问题就是好方案。

### Monorepo 的工具

目前业界最常见的实现 monorepo 工具和方案有 lerna、yarn workspace 和 pnpm 等。

#### Lerna

lerna 是一个通过使用 git 和 npm 来优化多包仓库管理工作流的工具，多用于多个 npm 包相互依赖的大型前端工程，提供了许多 CLI 命令帮助开发者简化从 npm 开发，调试到发版的整个流程。但是目前已官宣停止维护。

#### Pnpm

pnpm 是一个新型的依赖包管理工具，并支持 workspace 功能，它的优势主要是通过全局存储和硬链接来来磁盘空间并提升安装速度，通过软链接来解决幻影依赖问题。但是 RN 的构建工具 metro 对于符号链接的解析还存在问题需要改造，成本较大。

#### Yarn workspace

yarn workspace 是 yarn 提供的 Menorepo 依赖管理机制，是一个底层的工具，用于在仓库根目录下管理多个 package 的依赖，天然支持 hoist 功能，安装依赖时会将 packages 中相同的依赖提升到根目录，减少重复依赖安装。workspace 之间的引用在依赖安装时通过 yarn link 建立软链，代码修改时可以在依赖其的 workspace 中实时生效，调试方便。

通常业界主流方案是 lerna + yarn worksapce，lerna 负责发布和版本升级，yarn workspace 负责依赖管理。因为我们的 RN 工程是页面工程，不涉及到发 npm 包，而且需要依赖提升的功能（这个后面会说到），所以最终采用 yarn worspace 方案。

Metro
-----

在工程改造之前，我们先了解下 ReactNative 的构建工具 Metro。

Metro 在构建过程中主要会经历三个阶段：

1.  Resolution：此阶段 Metro 会从入口文件出发分析所依赖的模块生成一个所有模块的依赖图，主要是使用 jest-haste-map 这个包做依赖分析。这个阶段和 Transformation 阶段是并行的；
    
2.  Transformation：此阶段主要是将模块代码转换成目标平台可识别的格式；
    
3.  Serialization：此阶段主要是将 Transform 后的模块进行序列化，然后组合这些模块生成一个或多个 Bundle
    

jest-haste-map 是单元测试框架 Jest 的其中一个包，主要用来获取监听的所有文件及其依赖关系。

工程改造
----

接下来就是对工程的改造，首先我们将两个 RN 工程放在一个工程下，并按照 yarn workspace 的方式进行配置，然后通过脚手架（这里使用的是公司内部自研的脚手架）分别创建 app-a 和 app-b 两个 RN 工程，如下所示

```
rn-mono
|-- apps
  |-- app-a
  |-- app-b
|-- package.json
```

```
// package.json{  ...  "workspaces": {    "packages": [      "apps/*"    ]  },  "private": true}
```

接着我们运行

```
yarn install
```

发现 packages 中相同的依赖都会安装在根目录下的 node_modules 中，接着我们用如下启动 app-a 或 app-b

```
yarn workspace app-a run dev
```

这时如果你的 app-a 工程中的 dev 启动命令是用相对路径的方式可能会出现命令找不到的情况，比如

```
// app-a/package.json{  // 这里的react-native是安装在了根目录，所以会找不到命令，需要修改下路径  "script": {    "dev": "node ./node_modules/react-native/local-cli/cli.js start"  }}
```

那如果是调用`./node_modules/.bin`中的命令则不需要，因为在安装依赖的时候 packages 中`.bin`中的命令会有个软链指向根目录下`./node_modules/.bin`中的命令。启动成功后，这时打开页面会报如下错误：

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQhNl6zt6Y1x55uN23ribOGqhcAibUjlvX0osQz9eiasfEeFv00tGpI0z9m3d4mcKicU3HahIpaV4w98pQ/640?wx_fmt=png)Untitled

这是因为 jest-haste-map 在做依赖分析时通过 metro.config.js 中的 watcherFolders 配置项来指定需要监听变化的文件目录。

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQhNl6zt6Y1x55uN23ribOGqhUuoDJlfX6EeictOyO42dhlQMZswwC098aCxvWSqDCL8B2b9dzNjUETQ/640?wx_fmt=png)Untitled

watcherFolders 默认值为工程根目录，此时也就是 app-a 中目录，但是我们的模块都是安装在根目录下，所以会找不到。我们需要修改下 metro.config.js 中 watcherFolders

```
// app-a/metro.config.jsconst path = require('path');module.exports = {  watchFolders: [path.resolve(__dirname, '../../node_modules')],};
```

修改完成后我们重新启动，再打开页面后发现已经可以正常打开了，同样的方式 app-b 也可以正常运行。

但是我们对工程进行 monorepo 改造的目的是为了抽离公共组件，复用代码。所以我们在根目录下建立个 common 的文件夹来存放公共部分，此时根目录下的 pacage.json 中的 packages 和 apps 里每个 app 的 metro.config.js 中 watchFolder 配置都需要加入 common

```
rn-mono|-- common    |-- package.json|-- apps    |-- app-a    |-- app-b|-- package.json
```

```
// package.json{  ...  "workspaces": {    "packages": [        "apps/*",        "common"      ],  },  "private": true}// apps/app-a/metro.config.jsconst path = require('path');module.exports = {  watchFolders: [path.resolve(__dirname, '../../node_modules'), path.resolve(__dirname, '../../common')],};
```

接着在 common 中添加个 Button 组件，package.json 中添加相应的依赖，版本要和 apps 中对应依赖的版本保持一致

```
{  ...  "dependencies": {    "react": "16.8.6",    "react-native": "0.60.5",  },}
```

然后 yarn install 重新安装下，这时在根目录的 node_modules 下就可以看到 common 模块软链到了 common 目录，所以在 app-a 中引入 common 时就可以像 npm 包一样直接引入，同样 app-b 也可以。

```
import common from 'common';
```

到这里我们 RN 工程的 monorepo 改造也基本完成了。

### 依赖提升

这里解释下为什么需要依赖提升。

我们先来看下取消依赖提升会有什么问题，可以在根目录中的 package.json 中 nohoist 配置来指定不需要提升安装到根目录的模块

```
{  ...  "workspaces": {    "packages": [        "apps/*",        "common"      ],    "nohoist": ["**react**"],  },  "private": true}
```

然后重新 yarn install，启动 app-a 后会发现报如下错误

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQhNl6zt6Y1x55uN23ribOGqh9MKRawuHxbmCDz1UPqyrZAC24jyVGsxxHGeHMq48AzIc37a9XsHB0Q/640?wx_fmt=png)Untitled

这是因为有些模块 jest-haste-map 在做依赖分析生成 dependency graph 时发现在两个不同的目录下会产生命名冲突，导致报错。所以我们需要依赖提升，将所用到的相同依赖安装到根目录，这样只会安装一次。

### 相同依赖的版本保持一致

虽然有了依赖提升但如果每个 packages 中相同依赖的版本不一致，同样会导致相同的依赖会安装多次的情况出现，根目录和对应的 package 中都会有。这种情况除了会产生以上问题外还有可能产生其他潜在的问题，比如依赖客户端的第三方模块，如果存在多个版本在 bundle 执行时会多次注册组件导致组件注册失败，在调用时会发生找不到组件的报错。

虽然可以在 metro 中配置 blacklistRE 和 extraNodeModules 来表明要读取哪个位置的依赖，但是这种方式并不通用，每次在引入新的依赖时都要去配置下较为繁琐。所以我们需要将每个 packages 中的依赖版本保持一致。

人为的去约定这个规则肯定是不安全的，可以开发一个依赖版本的 lint 检测工具，在提交代码的时候做强制性的检测。

我们最终的方案是开发一个检测脚本结合 gitlab-ci 在分支代码 push 的时候检测，未通过则不允许 push 代码来避免风险。

```
// .gitlab-ci.ymltest-dev-version:  stage: test  before_script:    - npm install --registry http://rnpm.hz.netease.com  script:    - npm run depVerLint  only:    changes:      - "package.json"      - "packages/**/package.json"
```

![](https://mmbiz.qpic.cn/mmbiz_png/KV8By3euEQhNl6zt6Y1x55uN23ribOGqhU3crCUgmmHZQQmnVlqUNHjbkLFcUFHJFKZj6KQFyfDCL1popNMhy5A/640?wx_fmt=png)Untitled

### 工程迁移过渡

如果是将多个正在快速迭代的工程迁移到一个 Monorepo 仓库时，肯定会遇到存量开发分支代码同步问题。比如我们要将工程 A 迁移到新仓库，如果我们只是基于 master 分支将代码 copy 到新工程，并在改造开发过程中还有组内其他同学也在基于 master 拉取分支做开发，并在你改造完成前开发完成合并到了 master，此时你新工程的代码是落后的，要想同步只能手动 copy 改动的代码，很容易出错。为了解决这个问题我们可以使用 git subtree。git subtree 允许将一个仓库作为子仓库嵌套在另一个仓库里，所以这里我们可以将工程 A 作为一个子工程添加到 Monorepo 新工程对应的 packages 目录下，如果有更新可以直接使用 pull 进行同步。

```
# 添加git subtree add --prefix=apps/app-a https://github.com/xxxx/app-a.git master --squash# 更新git subtree pull --prefix=apps/app-a https://github.com/xxxx/app-a.git master --squash
```

对于新工程或者新的开发分支就可以直接此工程下进行开发了。

### 构建

由于我们的构建机还不支持 yarn，所以直接使用 yarn workspace 的命令是有问题的。目前的做法是将 yarn 作为 devDependency，然后在根目录下创建个脚本文件，将每个 package 的构建命令收敛在一起。结合 yarn workspace 的命令，这样只需要在构建时传入不同的 package name 即可。

```
## scripts/build.shPLATFORM=$1PROJECT=$2EXEC_PARAMS=${@:2}YARN="${PWD}/node_modules/.bin/yarn"...echo "start yarn install"${YARN} cache clean${YARN} installecho "start build"echo "${YARN} workspace ${PROJECT} run build:${PLATFORM} ${EXEC_PARAMS}"${YARN} workspace ${PROJECT} run build:${PLATFORM} ${EXEC_PARAMS}
```

```
// package.json{  ...  "workspaces": {    "packages": [      "apps/*"    ],  },  "private": true,  "scripts": {    "build": "./script/build.sh"  },}
```

比如对 app-a 进行构建，就可以

```
npm run build ios app-a## 实际上执行的是yarn workspace app-a run build:ios
```

总结
--

至此对 React Native 工程的 menorepo 改造基本完成了，对于多个功能类似的工程采用 Monorepo 的管理方式确实会方便代码复用和调试，提高我们的开发效率。如果公司内部其余场景有类似的需求，未来规划可以将其沉淀出一个脚手架。

目前对于 h5 工程的 Monorepo 方案已经较为成熟了，但是对 RN 工程来说由于构建机制不同无法完全适用，可参考的资料也较少。本文也是通过实践记录了一些踩坑经验，如果你有更好的实践，欢迎留言一起讨论。

> 本文发布自网易云音乐技术团队，文章未经授权禁止任何形式的转载。我们常年招收各类技术岗位，如果你准备换工作，又恰好喜欢云音乐，那就加入我们 grp.music-fe(at)corp.netease.com！