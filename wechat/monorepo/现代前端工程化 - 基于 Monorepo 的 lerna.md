> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/YcKnrpY_rG8kpubeyC0rhg)

本文你能学到什么？
---------

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibUIoIJUNGu920bj6n4e0icEDq4GXuAxduibfT9nCBPlYAeAWaIazZpTdMg/640?wx_fmt=png)

看完本文后希望可以检查一下图中的内容是否都掌握了，文中的例子最好实际操作一下，下面开始正文。

> 本文是**前端工程化系列**中的一篇，回不断更新，下篇更新内容可看文末的**下期预告**！**宗旨：工程化的最终目的是让业务开发可以 100% 聚焦在业务逻辑上**

lerna 是什么？有什么优势？
----------------

### lerna 基础概念

> A tool for managing JavaScript projects with multiple packages. Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm.

翻译：`Lerna`是一个用来优化托管在 `git\npm` 上的多 `package` 代码库的工作流的一个管理工具, 可以让你在主项目下管理多个子项目，从而解决了多个包互相依赖，且发布时需要手动维护多个包的问题。

关键词：多仓库管理，多包管理，自动管理包依赖

### lerna 解决了哪些痛点

#### 资源浪费

通常情况下，一个公司的业务项目只有一个主干，多 `git repo` 的方式，这样 `node_module` 会出现大量的冗余，比如它们可能都会安装 `React`、`React-dom` 等包，浪费了大量存储空间。

#### 调试繁琐

很多公共的包通过 `npm` 安装，想要调试依赖的包时，需要通过 `npm link` 的方式进行调试。

#### 资源包升级问题

一个项目依赖了多个 `npm` 包，当某一个子 `npm` 包代码修改升级时，都要对主干项目包进行升级修改。(这个问题感觉是最烦的，可能一个版本号就要去更新一下代码并发布)

lerna 的核心原理
-----------

### monorepo 和 multrepo 对比

`monorepo`：是将所有的模块统一的放在一个主干分支之中管理。`multrepo`：将项目分化为多个模块，并针对每一个模块单独的开辟一个 `reporsitory`来进行管理。

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibUJXouUfpggBk2Ra0oiabuDmojs2kYOQIGFUBXL1zJ2gotoxscP2OYWUg/640?wx_fmt=png)image.png

### lerna 软链实现 (如何动态创建软链)

未使用 `lerna` 之前，想要调试一个本地的 `npm` 模块包，需要使用 `npm link` 来进行调试，但是在 `lerna` 中可以直接进行模块的引入和调试，这种动态创建软链是如何实现的？

#### 软链是什么？

#### Node.js 中如何实现软链

`lerna`  中也是通过这种方式来实现软链的

`fs.symlinkSync(target,path,type)`

```
fs.symlinkSync(target,path,type)
target <string> | <Buffer> | <URL>   // 目标文件
path <string> | <Buffer> | <URL>  // 创建软链对应的地址
type <string>
```

它会创建名为 `path` 的链接，该链接指向 `target`。`type` 参数仅在 `Windows` 上可用，在其他平台上则会被忽略。它可以被设置为 `'dir'`、 `'file'` 或 `'junction'`。如果未设置 `type` 参数，则 `Node.js` 将会自动检测 `target` 的类型并使用 `'file'` 或 `'dir'`。如果 `target` 不存在，则将会使用 `'file'`。`Windows` 上的连接点要求目标路径是绝对路径。当使用 `'junction'` 时， `target` 参数将会自动地标准化为绝对路径。

*   基本使用
    

```
const res = fs.symlinkSync('./target/a.js','./b.js');
```

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibUapFQNnZwQicIDuibp07nlTsqvheo73FtzZQtYzfwMdyRVAicx35YtUBkg/640?wx_fmt=png)image.png

这段代码的意思是为  创建一个软链接 `b.js` 指向了文件 `./targert/a.js`, 当 `a.js` 中的内容发生变化时，`b.js` 文件也会发生相同的改变。

在 `Node.js` 文档中，`fs.symlinkSync()``lerna` 的源码中动态链接也是通过 `symlinkSync` 来实现的。源码对应地址：软链实现源码地址参考 1

```
function createSymbolicLink(src, dest, type) {  log.silly("createSymbolicLink", [src, dest, type]);  return fs    .lstat(dest)    .then(() => fs.unlink(dest))    .catch(() => {      /* nothing exists at destination */    })    .then(() => fs.symlink(src, dest, type));}
```

> 更多关于软链的文章, 我后面会单独写一篇文章介绍软硬链接，这里知道 `lerna 链接部分` 的实现就可以了。Node fs 官网 参考 2

lerna 基本使用
----------

### lerna 环境配置

`lerna` 在使用之前需要全局安装 `lerna` 工具。

```
npm install lerna -g
```

#### 初始化一个 lerna 项目

`mkdir lerna-demo`, 在当前目录下创建文件夹`lerna-demo`, 然后使用命令 `lerna init`执行成功后，目录下将会生成这样的目录结构。，一个 `hello world`级别的 `lerna` 项目就完成了。

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibUylyPicnARt5ntOs8zkRQgs600H1gwmqFRiaUQgiaP7KUdib0Sosl7co2OA/640?wx_fmt=png)image.png

```
 - packages(目录)
 - lerna.json(配置文件)
 - package.json(工程描述文件)
```

### lerna 常用命令

介绍一些 `lerna` 常用的命令, 常用命令这部分可以简单过一遍，当作一个工具集收藏就行，需要的时候来找下，用着用着就熟练了，主要可以实操下下面的实战小练习，这个过程会遇到一些坑的。

1.  初始化 `lerna` 项目
    

```
lerna init 
```

2.  创建一个新的由 `lerna` 管理的包。
    

```
lerna create <name>
```

3.  安装所有 · 依赖项并连接所有的交叉依赖
    

```
lerna bootstrap
```

4.  增加模块包到最外层的公共 `node_modules`中
    

```
lerna add axios
```

5.  增加模块包到 `packages` 中指定项目 下面是将 `ui-web` 模块增加到 `example-web` 项目中
    

```
lerna add ui-web --scope=example-web
```

6.  在 `packages` 中对应包下的执行任意命令 下面的命令，是对 `packages` 下的 `example-web` 项目执行 `yarn start` 命令 ，比较常用，可以把它配置到最外层的 `package.json` 中。
    

```
lerna exec --scope example-web -- yarn start
```

如果命令中不增加 `--scope example-web`直接使用下面的命令，这会在 `packages` 下所有包执行命令`rm -rf ./node_modules`

```
lerna exec -- rm -rf ./node_modules
```

7.  显示所有的安装的包
    

```
lerna list // 等同于 lerna ls
```

这里再提一个命令也比较常用, 可以通过`json`的方式查看 `lerna` 安装了哪些包,`json` 中还包括包的**路径**，有时候可以用于查找包是否生效。

```
lerna list --json
```

8.  从所有包中删除 `node_modules` 目录
    

```
lerna clean
```

> ⚠️注意下 `lerna clean` 不会删除项目最外层的根 `node_modules`

9.  在当前项目中发布包
    

```
lerna publish
```

这个命令可以结合 `lerna.json` 中的  `"version": "independent"` 配置一起使用，可以完成统一发布版本号和`packages` 下每个模版发布的效果，具体会在下面的实战讲解。

> `lerna publish` 永远不会发布标记为 `private` 的包（`package.json中的”private“: true`）

以上命令基本够日常开发使用了，如果需要更详细内命令内容，可以查看下面的详细文档 lerna 命令详细文档参考 3

lerna 应用 (适用场景)
---------------

### 从零搭建一个 平台基础组件库项目

lerna 比较适合的场景：基础框架，基础工具类，`ui-component` 中会存在 `h5` 组件库，`web` 组件库，`mobile` 组件库，以及对应的 `doc` 项目，三个项目通用的 `common` 代码。为了方便多个项目的联调，以及分别打包，这里采用了`lerna` 的管理方式。

接下来会讲解使用 `leran` 搭建 `ui-component` 基础组件库的过程。

#### 1. 项目初始化

创建一个文件夹 `ui-component` ,

切换到目录 `ui-component`目录下。执行 `lerna init`

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibUeicGCnaJOrXR715Y9aiayNRyA3f56fOo8gpWPP3u40VaJ6TfyxQZdXUw/640?wx_fmt=png)image.png

`lerna` 会自动创建一个 `packages` 目录夹，我们以后的项目都新建在这里面。同时还会在根目录新建一个 `lerna.json`配置文件

```
{  "packages": [    "packages/*"  ],  "version": "0.0.0" // 共用的版本，由lerna管理}
```

> 注意 ``lerna`默认使用的是集中版本，所有的`package`共用一个`version`,如果需要`packages`下不同的模块 使用不同的版本号，需要配置`Independent`模式。命令行介绍时有提到这里 在`json` 中增加属性配置

```
"version": "independent"
```

`package.json` 中有一点需要注意，他的 `private` 必须设置为 `true` ，因为 `mono-repo` 本身的这个 `Git`仓库并不是一个项目，他是多个项目，所以一般不进行直接发布，发布的应该是 `packages/` 下面的各个子项目。

#### 子项目创建

现在 `package` 目录下是空的，我们需要创建一下组件库内部相关内容。使用 `leran create` 命令创建子 `package` 项目。

```
lerna create ui-common
```

`lerna create ui-common`会在 `packages` 中创建 `ui-common` 项目，另外创建两个基于 `TypeScript` 的 `react` 项目 `ui-web` 和 `example-web`， 在 `package` 目录下运行

```
npx create-react-app ui-web --typescript
npx create-react-app example-web --typescript
```

> 这里补充一个小插曲吧，初始化 `typescript` 项目后如何进行配置，可以直接用 `typescript` 编写组件? 安装 typescript 需要的模块包

```
$ npm install --save typescript @types/node @types/react @types/react-dom @types/jest$ # 或者$ yarn add typescript @types/node @types/react @types/react-dom @types/jest
```

然后在项目根目录创建 `tsconfig.json` 和 `webpack.config.js` 文件：

```
{  "compilerOptions": {    "target": "es5",    "module": "commonjs",    "lib": ["dom","es2015"],    "jsx": "react",    "sourceMap": true,    "strict": true,    "noImplicitAny": true,    "baseUrl": "src",    "paths": {      "@/*": ["./*"],    },    "esModuleInterop": true,    "experimentalDecorators": true,  },  "include": [    "./src/**/*"  ]}
```

*   `jsx` 选择 `react`
    
*   `lib` 开启 `dom` 和 `es2015`
    
*   `include` 选择我们创建的 `src` 目录
    

```
var fs = require('fs')var path = require('path')var webpack = require('webpack')const { CheckerPlugin } = require('awesome-typescript-loader');var ROOT = path.resolve(__dirname);var entry = './src/index.tsx';const MODE = process.env.MODE;const plugins = [];const config = {  entry: entry,  output: {    path: ROOT + '/dist',    filename: '[name].bundle.js'  },  module: {    rules: [      {        test: /\.ts[x]?$/,        loader: [          'awesome-typescript-loader'        ]      },      {        enforce: 'pre',        test: /\.ts[x]$/,        loader: 'source-map-loader'      }    ]  },  resolve: {    extensions: ['.ts', '.tsx', '.js', '.json'],    alias: {      '@': ROOT + '/src'    }  },}if (MODE === 'production') {  config.plugins = [    new CheckerPlugin(),    ...plugins  ];}if (MODE === 'development') {  config.devtool = 'inline-source-map';  config.plugins = [    new CheckerPlugin(),    ...plugins  ];}module.exports = config;
```

创建完两个项目后， `ui-web` 和 `example-web` 中同时出现 `node_modules`, 二者会有很多重复部分，并且会占用大量的硬盘空间

##### lerna bootstrap

`lerna` 提供了可以**将子项目的依赖包提升到最顶层**的方式 ，我们可以执行 `lerna clean`先删除每个子项目的 `node_modules` , 然后执行命令  `lerna bootstrop --hoist`。

`lerna bootstrop --hoist` 会将 `packages` 目录下的公共模块包抽离到最顶层，但是这种方式会有一个问题，**不同版本号只会保留使用最多的版本**，这种配置不太好，当项目中有些功能需要依赖老版本时，就会出现问题。

##### yarn workspaces

有没有更优雅的方式？再介绍一个命令 `yarn workspaces` ，可以解决前面说的当不同的项目依赖不同的版本号问题， `yarn workspaces`会检查每个子项目里面依赖及其版本，如果版本不一致都会保留到自己的 `node_modules` 中，只有依赖版本号一致的时候才会提升到顶层。注意：这种需要在 `lerna.json` 中增加配置。

```
"npmClient": "yarn",  // 指定 npmClent 为 yarn
  "useWorkspaces": true // 将 useWorkspaces 设置为 true
```

并且在**顶层**的 `package.json` 中增加配置

```
// 顶层的 package.json{    "workspaces":[        "packages/*"    ]}
```

增加了这个配置后 不再需要 `lerna bootstrap` 来安装依赖了，可以直接使用 `yarn install` 进行依赖的安装。注意：`yarn install` 无论在顶层运行还是在任意一个子项目运行效果都是可以。

#### 启动子项目

配置完成后，我们启动 `packages` 目录下的子项目 `example-web`, 原有情况下我们可能需要频繁切换到 `example-web` 文件夹，在这个目录执行 `yarn start`。

使用了 `lerna` 进行项目管理之后, 可以在顶层的 `package.json` 文件中进行配置，在 `scripts` 中增加配置。

```
  "scripts": {
        "web": "lerna exec --scope example-web -- yarn start",
  }
```

`lerna exec --scope example-web` 命令是在 `example-web` 包下执行 `yarn start`。

并且在顶层 `lerna.json` 中增加配置

```
{"npmClient": "true"}
```

然后在顶层执行 `yarn web` 就可以运行 `example-web` 项目了。

配置完成后尝试一下，项目正常启动。

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibUZrTGjMTHpA2LDDjntmic5ml23M1epicGjL6YViahKq3IyWib9ia8KMehpMA/640?wx_fmt=png)image.png

#### example-web 模块中 引用 ui-common 中的函数

我们在 `ui-common`中定义一个网络请求公共函数，在 `ui-web` 和 `example-web` 项目中都会用到。在项目 `example-web` 中增加 `ui-common` 模块依赖，执行命令

```
lerna add ui-common --scope=example-web
```

执行命令后，在 `example-web` 的 `package.josn`中会出现

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZU2u2Lvia7W3PonSFIaetBibU3pdOwuibj51m0UsDXUfZJvGcVmZaqvQiapIYtXUaU4do6lEic5eaxvMBg/640?wx_fmt=png)image.png

`ui-common` 已经成功被 `example-web` 中引用，然后在 `example-web` 项目中引用 `request` 函数并使用，例子中只是简单使用下 `ui-common` 中的函数。

```
import React from "react";import request from "ui-common";interface IProps {}interface IState {  conents: Array<string>;}class CommentList extends React.Component<IProps, IState> {  constructor(props: IProps) {    super(props);    this.state = {      conents: ["我是列表第一条"],    };  }  componentDidMount() {    request({      url: "www.baidu.com",      method: "get",    });  }  render() {    return (      <>        <ul>          {this.state.conents.map((item, index) => {            return <li key={index}> {item} </li>;          })}        </ul>      </>    );  }}export default CommentList;
```

#### 发布

项目结构已基本搭建完成，我们尝试发布一下 , 使用命令

```
lerna publish
```

由于之前我们在 `lerna.json`  中配置了

```
{  "packages": [    "packages/*"  ],  "version": "independent",// 不同模块不同版本  "npmClient": "yarn",   "useWorkspaces": true }
```

执行命令后在会出现如下内容，针对 `packages` 中的每个模块单独选择版本进行发布。

如果想要发布的模块统一，使用相同的版本号，需要修改`lerna.json` , 将 `"version": "independent"`, 改为固定版本号, 修改后尝试重新使用 `lerna publish`进行发布，

> 注意⚠️：这里再次声明一下，如果使用了 `independent` 方式进行版本控制，在 `packages` 内部的包进行互相依赖时，每次发布之后记得修改下发布后的版本号，否则在本地调试时会出现刚发布的代码不生效问题 (这个问题本人亲自遇到过，单独说下)

### 框架类项目

#### 公司组件库项目

组件库项目类似上面实战的目录结构，但是会在 `packages` 包下添加很多其他的模块，比如 `ui-h5` , `example-h5` 等

### 工具类项目

举例一些开源项目。

*   `babel` 使用的就是 `lerna` 进行管理
    
*   `facebook/jest` 使用的是 `lerna` 进行管理
    
*   `alibaba/rax` 使用的是 `lerna` 进行管理
    

lerna 弊端
--------

和传统的 `git submodules` 多仓库方式对比，我觉得 `lerna` 优势很明显的，个人认为唯一不足的是: 由于源码在一起，仓库变更非常常见，存储空间也变得很大，甚至几`G`，`CI` 测试运行时间也会变长, 虽然如此也是可以接受的。

下期预告
----

本文主要讲解了 `lerna` 的基本使用，并且用它搭建了一个基础目录结构 (我会补充一些基础的配置 `eslint`，`prettier` 等, 本文不多写之前有写过)，这种搭建我们没有必要每次都配置一遍，尝试一遍就好了，**工程化的最终目的是让业务开发可以 100% 聚焦在业务逻辑上**，下一篇文章会讲解 轮子 `create-mono-repo cli` 脚手架的完整实现过程，如何快速创建 `mono-repo` 项目

导图插入后不是很清晰，有需要的公众号回复 `lerna` 可获取原图。

#### 参考文章

*   [1] https://github.com/lerna/lerna/tree/main/utils/create-symlink
    
*   [2] http://nodejs.cn/api/fs.html#fs_fs_unlink_path_callback
    
*   [3] http://www.febeacon.com/lerna-docs-zh-cn
    
*   [4] https://juejin.cn/post/6844903885312622606
    
*   [5] https://github.com/dkypooh/front-end-develop-demo/tree/master/base/lerna
    
*   [6] http://www.febeacon.com/lerna-docs-zh-cn/routes/commands/bootstrap.html
    
*   [7] https://github.com/lerna/lerna/tree/main/utils/create-symlink
    

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib60yXwEibZdrlaDgWF0UZ7BL2OATxhVRerxib9Zfx8mQiaMvRIHG6PFhJmSb406gf2icCFqia7g2PTr3rQ/640?wx_fmt=png)