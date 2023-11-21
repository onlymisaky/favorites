> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_pKwBA-8EkMipuUOZ9Ymow)

几年前工作中整过几个 SDK 仓库，当时 SDK 库逻辑还比较简单，工程设计也不复杂：

*   ESLint+Prettier+GitHook
    
*   Rollup 打包
    
*   npm 私有仓库搭建
    

随即发包复用就解决了。

随着时间的推移，SDK 库为了兼容各个端、完善开发体验实现各种配套的调试工具等等逐渐变得复杂，之前简单的工程能力要实现源码插件化、分包发布、定制化构建等等能力会比较痛苦：

*   简单目录隔离划分模块
    
*   手动多次更新目录 `package.json` 版本来发包
    
*   多个端代码复用一个 `tsconfig.json`，存在端限制（比如不能使用 DOM）的目录并不能正确的校验。
    
*   ......
    

然后通过搜索你就会了解到了 Babel、React 等源码都采用了 Monorepo 的方式管理，Babel 还用了 Lerna 工具来做发包工具等等业内的实践，但当时借助 Lerna 搭建的一个仓库实践体验没有想象中的好......

最近我用 Yarn 包管理工具实践了一次 Monorepo 的工程化搭建，此文意在将实践过程分享出来并说说我对 Monorepo 的一些看法，仅供参考。

搭建过程
----

本地新建一个仓库的过程略过：

```
- packages/  - xxx/    - package.json    - README.md- package.json- .prettierrc- .eslintrc.js- .editorconfig- commitlint.config.js- README.md
```

可以看到源码是 packages 目录下存放的一个个模块：

*   源码使用统一的配置，如 eslint、prettier 配置等
    
*   不同模块间有一个良好的目录隔离
    

### 引入 Yarn

首选参照 yarn 官网在全局安装：

> npm i -g yarn

并在仓库根目录中引入指定版本的 yarn：

> yarn set version berry

此时你会发现仓库中出现了以下文件：

```
- .yarn/  - releases/    - yarn-berry.cjs  # berry版本源码- .yarnrc.yml        # yarn配置
```

### Yarn 配置

配置主要关心这些应该就足够用了：

```
httpProxy:'http://127.0.0.1:8899'httpsProxy:'http://127.0.0.1:8899'npmAuthIdent:'${USER:-root}:${TOKEN:-123456}'npmPublishRegistry:'https://mirrors.cn/npm/'npmRegistryServer:'https://mirrors.cn/npm/'unsafeHttpWhitelist:  -mirrors.cnyarnPath:.yarn/releases/yarn-berry.cjs
```

*   可能因公司内网限制，必须使用网络代理
    
*   公司搭建了 npm 镜像服务，修改下包发包地址及相应鉴权账号密码。
    
*   针对公司镜像域名放开 https 限制
    
*   禁用 PnP 模式（后面聊）
    

然后在 package.json 中添加：

```
{  "workspaces": [    "packages/*"  ],}
```

### 配置 IDE

如果你开启了 PnP 模式（没开启可以忽略这一步），那么还要参照文档操作下，不然 IDE 语言功能可能运行不正常：

> yarn dlx @yarnpkg/pnpify --sdk vscode

### 引入插件

参照 yarn 文档引入必要插件：

*   Typescript 插件是用于改进使用体验的，它会在你安装包 A 的同时去尝试帮你安装其类型 @types/A，这里不多介绍。
    

> yarn plugin import typescript

*   Workspace-tools 是工作区插件，必备。
    

> yarn plugin import workspace-tools

*   Version 插件是实现发布流的（本文所展示实践未使用，不作过多介绍）。
    

> yarn plugin import version

这时候你可能会发现. yarnrc.yml 多了以下配置：

```
plugins:  -path:.yarn/plugins/@yarnpkg/plugin-typescript.cjs    spec:'@yarnpkg/plugin-typescript'  -path:.yarn/plugins/@yarnpkg/plugin-workspace-tools.cjs    spec:'@yarnpkg/plugin-workspace-tools'  -path:.yarn/plugins/@yarnpkg/plugin-version.cjs    spec:'@yarnpkg/plugin-version'
```

### 类型配置

接下来你要明确你的包（源码）会在哪些环境去运行，假设我们要在网页上和服务器上运行，那么类型配置如下：

```
//tsconfig.isomorph.json{  "compilerOptions": {    "target":"es6"/*Specify ECMAScript target version:'ES3'(default), 'ES5', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019'or'ESNEXT'.*/,    "module":"commonjs"/*Specify module code generation:'none', 'commonjs', 'amd', 'system', 'umd', 'es2015', or'ESNext'.*/,    "allowJs":true/*Allowjavascriptfilestobecompiled.*/,    "resolveJsonModule":true,    "skipLibCheck":true,    "declaration":true/*Generatescorresponding'.d.ts'file.*/,    "declarationMap":true/*Generatesasourcemapforeachcorresponding'.d.ts'file.*/,    "sourceMap":true/*Generatescorresponding'.map'file.*/,    "composite":true/*Enableprojectcompilation*/,    "tsBuildInfoFile":"./dist/tsconfig.tsbuildinfo"/*Specifyfiletostoreincrementalcompilationinformation*/,    "strict":true/*Enableallstricttype-checkingoptions.*/,    /*ModuleResolutionOptions*/    "moduleResolution":"node"/*Specify module resolution strategy:'node'(Node.js)or'classic'(TypeScriptpre-1.6).*/,    "baseUrl":"./"/*Basedirectorytoresolvenon-absolutemodulenames.*/,    "paths": {      "@*": ["packages/*"]    } /*Aseriesofentrieswhichre-mapimportstolookuplocationsrelativetothe'baseUrl'.*/,    "typeRoots": ["src"] /*Listoffolderstoincludetypedefinitionsfrom.*/,  },  "include": ["src"]}
```

```
//tsconfig.node.json{  "extends":"./tsconfig.isomorph",  "compilerOptions": {    "baseUrl":".",    "typeRoots": ["src"],    "types": ["node"]  },  "include": ["src"]}
```

```
//tsconfig.web.json{  "extends":"./tsconfig.isomorph",  "compilerOptions": {    "lib": ["dom", "dom.iterable", "esnext"],    "jsx":"react-jsx"  }}
```

这里的主要目的是为了让每个包内源码能得到正确的校验，每个包内的目录结构是：

```
-dist/# 构建产物-src/# 包源码-tsconfig.json# 继承../../tsconfig.xxx.json的壳配置（让Vscode等IDE正常开启语言功能）-package.json# 有统一的scripts（dev, dist）
```

### 包脚手架

接下来你要想好你的包分哪几种类型，比如一种分法是：

*   入口模块（一般只有 1 个），命令为 `cli`
    
*   核心模块，命名模式为 `core-xxx`
    
*   插件模块，命名模式为 `plugin-xxx`
    
*   工具模块，命名模式为 `utils-xxx`
    
*   服务端模块，命名模式为 `server-xxx`
    
*   配套调试工具模块，命名模块为 `devtool-xxx`
    

然后你为每一种类型编写好脚手架模板，引入脚手架工具即可：

```
//package.json{  "scripts": {    "addpkg":"yo xxx"  }}
```

> yarn addpkg

### 研发流配置

这里也要跟 Lerna 一样先要问一个问题，每个包的版本是独立的呢还是统一的，说真的为了省事，建议统一方便很多，目前看起来也没造成什么问题。

借助工作区插件的能力，直接配置 scripts:

```
//package.json{  "scripts": {    "ws:ver":"yarn workspaces foreach --exclude '+(server-*)' -pv exec npm version",    "ws:pub":"yarn workspaces foreach --exclude '+(server-*)' -vt npm publish --tag alpha --tolerate-republish",    "ws:prebuild":"yarn workspaces foreach -j 1000 -pvA run prebuild",    "ws:dev":"yarn workspaces foreach -j 1000 -pvA run dev",    "ws:dist":"yarn workspaces foreach -pvtA run dist",  }}
```

*   通过 yarn ws:ver 可以统一更改包版本
    
*   通过 yarn ws:pub 可以统一发布包，并且把 server-* 类型包排除
    
*   通过 yarn ws:dev/dist 可以本地一键编译所有包
    

使用体验
----

### 依赖管理

Yarn 是个包管理器，最核心的实现就是依赖安装，其特性建议细看文档这里简单带过：

*   Offline Cache：简单地说就是会将下载的包以 zip 缓存在. yarn/cache/ 里。
    
*   Plug’n Play：安装后会生成. pnp.cjs，Hack Node.js 原生 require 方法达到直接加载. yarn/cache/ 中的 zip 包效果。
    
*   Zero-Install：将. yarn/cache/ 和. pnp.cjs 提交到 Git 仓库中并开启 PnP 模式后，协作者无需再安装即可开发。
    

PnP 模式跑起来后确实很爽，但后来因为它的局限性我还是关掉了这个特性：

PnP 只 Hack 到 require 方法，没有办法很好地 Hack 各种 resolve，很大程度上依赖生态需要别的库引入 SDK 支持它，比如 storybook 这类工具源码中很多 require.resolve 以及手动拼接的在 node_modules / 下的文件路径，这种实现就需要其本身去兼容 PnP。

修改. yarnrc.yml 配置以采用原生的 node_modules 安装结构：

```
nodeLinker:node-modules
```

简单地执行后，就能得到一个相对完美的结构：

> yarn install

```
-node_modules/# 公共依赖-packages/  -xxx/    -node_modules/# 与公共依赖版本冲突的特殊依赖
```

但这个实现也相对的复杂，作为使用者我还没深入的看源码理解其一些抽风行为，平时你可能需要用到以下技巧：

*   有时候变动依赖后某个工作区不冲突的依赖未提升到根目录 node_modules (https://www.yarnpkg.cn/cli/dedupe)
    

> yarn dedupe xxx

*   有时候仓库本地安装的命令会崩 (https://www.yarnpkg.cn/cli/rebuild)。
    

> yarn rebuild husky

*   有时候你会有锁定依赖的需要。
    

```
//package.json{  "resolutions": {    "roaring":"1.0.6",    "typeorm":"0.2.34",    "async":"3.2.0"  }}
```

### 工作区指令

workspace 插件给 yarn 提供了批量给工作区（包）执行命令的方式：

> yarn workspaces foreach ......

这个命令最强大的地方的是它可以拓扑式地执行，只要加上 `-topological` 参数即可。

但是它识别工作区命令执行完成的方式比较弱，就是进程退出，所以当我执行 yarn ws:dev 时，`tsc -w` 的编译挂起后使得拓扑执行就是个鸡肋了，而且控制台输出的也不好。

### Link

用过 npm link 的人都知道体验很不好，但 yarn link 的实现目前来看也很鸡肋。

yarn link 实际上是基于 resolutions 来实现的，但经常因为要链接的仓库子孙依赖版本冲突不成功，而且成功后也常常跑不起来。

据我自身的经验来说 link 功能实现其实挺复杂，往往不是一个简单创建一个软链就可以的，要考虑：

*   当加载到软链模块执行其 require 时，require 加载常常会寻址到其自身的 node_modules。
    
*   需要结合软链仓库的依赖重新计算依赖树。
    
*   ......
    

从我这次的实践角度来看，现实情况往往不要想那么多，直接创建的软链就完事。

*   npm v7 软链到全局调试 CLI 工具：
    

> npm link

*   npm v6 链接其他仓库：
    

> npm link /path/to/local/dependency

总结
--

以上，就是我简单实践 Yarn Monorepo 的一些经验之谈。

之所以选择 Yarn 是因为我不太看好 pnpm 软链原理的实现（详见参考），除了就事论事地去对比不同的工具，其实我选择 Yarn 依旧是看重了其源码仓库的质量和背后 Facebook、Google 等公司的实力。

谢谢，大家多多交流。

参考
--

*   **JavaScript 包管理器简史（npm/yarn/pnpm）**[https://mp.weixin.qq.com/s/0Nx093GdMcYo5Mr5VRFDjw](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651252081&idx=1&sn=f88298129fa96dea91b85a2d6b6e1b6d&scene=21#wechat_redirect)
    
*   **为什么现在我更推荐 pnpm 而不是 npm/yarn** [https://mp.weixin.qq.com/s/h7MfgVfR4c9YxtO44C-lkg](https://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496601&idx=1&sn=4c3bc00c37163e1dca152ebb8f723619&scene=21#wechat_redirect)
    
*   https://github.com/yarnpkg/yarn/issues/1761
    

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCsUS8uDeYgQE2E3ga5vf4XrvOOm2gpZEicrI9iaeJL0yNS9F3FxhlLia1fO9OicoAvdDWIVbjqHZw53IA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)