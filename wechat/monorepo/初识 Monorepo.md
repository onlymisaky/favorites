> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/SXme3V6p1nIIP17tHOiAcw)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9a9XT4m4ibMpVIoibMlANVSnbBIyfjmv2qJeZibY0c5WjxqLqI5QAoVlYfrKUvfqVDf2NlRUQhpNtPQ/640?wx_fmt=png)

引言
==

在如今快节奏的前端开发中，管理多个项目和组件的复杂性成为了开发团队的挑战，Monorepo（单一代码仓库）作为一种新兴的解决方案，正在成为开发团队的新宠。

Monorepo 简介
===========

是什么
---

**Monorepo** 是一种软件开发的策略模式，它代表 "单一代码仓库"（Monolithic Repository）。在 **Monorepo** 模式中，所有相关的项目和组件都被存储在一个统一的代码仓库中，而不是分散在多个独立的代码仓库中。

简单理解：所有的项目在一个代码仓库中，但并不是说代码没有组织的都放在 ./src 文件夹里面。

谁在用
---

*   大型互联网公司：Google、Facebook、Uber、MicroSoft、阿里、字节等
    
*   前端常用的开源库：Vue、React、Vite、Babel、Element-plus
    

为什么会出现
------

Monorepo 的出现是为了解决传统分离式代码仓库所面临的一些挑战和痛点，我们先来看看代码管理的发展历程：

#### 1、Single-repo Monolith 时期

单一代码仓库：传统的单体式应用程序通常将所有的功能和模块打包在一起，形成一个单一的代码库和部署单元。这种单一的代码库包含了应用程序的所有部分，从前端界面到后端逻辑，甚至包括数据库模式和配置文件等。

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── app.js
├── tests/
│   ├── client/
│   └── server/
├── package.json
├── README.md
└── ...
```

存在问题：

*   难以实现部分更新和独立扩展的灵活性
    
*   高度耦合，代码臃肿
    

#### 2、Multi-repo 时期

多代码仓库：将不同的功能模块、组件或服务等分别存放在独立的仓库中，可以单独进行版本控制、构建、部署和发布，使得不同的团队或开发者可以独立地开发、测试和维护各自的模块，更容易实现并行开发和团队协作。

```
// Repository - module1├── node_modules/├── src/│   ├── components/│   ├── pages/│   ├── utils/│   ├── App.js│   └── index.js├── styles/│   ├── main.css├── public/│   ├── index.html├── package.json└── ...// Repository - module2├── node_modules/├── src/│   ├── components/│   ├── pages/│   ├── utils/│   ├── App.js│   └── index.js├── styles/│   ├── main.css├── public/│   ├── index.html├── package.json└── ...// Repository - lib├── node_modules/├── package.json├── src│   ├── ...├── README.md// 共享代码- lib 进行发包，比如包名为 @my-scope/lib- 进入project1 或 project2 进行npm install- 在代码中引入 import {method} from '@my-scope/lib';
```

存在问题：

*   跨仓库开发：多仓维护成本高，
    
*   开发调试：npm 包 (修改 -> 发布 ->安装成本高)，调试麻烦(npm link)，
    
*   版本管理：依赖版本同步升级管理麻烦
    
*   项目基建：脚手架升级，新老项目规范很难保证统一
    

#### 3、Monorepo 时期

可以解决上述问题，代码之间的共享也不再强依赖于 NPM 来进行，既保留了 Single-repo 单仓环境维护的便利性，同时满足 Multi-repo 多仓对于项目解耦的独立开发管理。

```
├── packages/
│   ├── module1/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── ...
│   ├── module2/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── ...
│   └── shared/
│       ├── src/
│       ├── tests/
│       ├── package.json
│       └── ...
├── libs/
│   ├── lib1/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── ...
│   ├── lib2/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── ...
│   └── ...
├── docs/
├── .gitignore
├── package.json
└── ...
```

哎呀，这项目组织看起来太简单了！！！就是把各个项目放到一个文件夹下了嘛，但是我们尝试以下思考：

**1. 怎样进行项目间代码共享？发包至 npm 再引用安装吗？**

答案：肯定不是的，举个例子：

*   假设 lib 的包名为 @my-scope/lib，无需发包至 NPM。
    
*   在一级目录的 package.json 添加包名 @my-scope/lib: "workspace:*"。
    
*   在两个 projects 中的代码中引入：
    

```
import {method} from '@my-scope/lib';
```

**2. 各个项目怎么装包、运行？切换目录挨个装、挨个运行吗？(那岂不太麻烦了)**

答案：在根目录下就可以给各个项目安装。

**3. 各个项目代码开发完分别提交一次 commit，还是一起提交呢?**

答案：可以一起提交。

**4. lib 包还能单独发布 npm 包吗？**

答案：可以。

**5. 编译构建的顺序要我们自己定吗?**

答案：不同的 Monorepo 库不同的处理方式，有些需要自己指定构建顺序，有些会内置判断项目依赖关系，无需自定义构建顺序。

怎么用
---

**Monorepo** 有很多优势，但要发挥作用，需要拥有合适的框架，帮助我们保持快速、易于理解和管理。

#### Monorepo 策略

**Monorepo** 策略期望框架能提供以下的功能：

功能详细介绍可参考 https://monorepo.tools/#workspace-analysis![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9a9XT4m4ibMpVIoibMlANVSnoGGBO1Bz1e7jK6tGIUV5wald2SzOsofGfVHd9MG0py1HrxufDjB5bg/640?wx_fmt=png)

但是理想是丰满的，现实是骨感的。

目前前端领域的 **Monorepo** 生态的显著特点是只有库，而没有大一统的框架或者完整的构建系统来支持。

#### 现有 Monorepo 库：

Bazel（谷歌）、   Gradle Build Tool（Gradle, Inc）、   Lage（微软）、   Lerna、  Nx（Nrwl）、  Pants（Pants Build 社区）、  Rush（由 Microsoft) 和 Turborepo（由 Vercel）

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9a9XT4m4ibMpVIoibMlANVSnmrc3eg9HL9uF437oldl9QpeeE1iaia1rJ7iaFnvhStwzLhO08S2DRy7og/640?wx_fmt=png)各个库目前所支持的功能

生态社区中 Nx，Lerna，Turborepo 脱颖而出。

#### Monorepo 生态

`核心技术`：

包管理方案：npm、yarn、pnpm

包版本方案：Lerna、Changesets

包构建方案：Turborepo、Nx

`辅助技术`：

代码规范工具：Eslint、Prettier

提交规范工具：Commitlint、Commitizen

Monorepo 实战
===========

1. pnpm Workspace
-----------------

自带 **Monorepo** 的解决方案

官网：https://pnpm.io/workspaces

*   全局安装 pnpm
    

```
npm install -g pnpm
```

*   在项目根目录下创建一个 package.json 文件，并设置 "private": true 以表示该项目是私有的。
    
*   在 package.json 文件中添加一个 "workspaces" 字段，并设置为一个包含子项目目录的数组。例如
    

```
"workspaces": [  "packages/*"]
```

*   可以新建两个 vue 项目，在每个子项目的目录下，都有一个独立 package.json 文件
    
*   所有工作空间安装依赖：在根目录下运行 pnpm install 命令，它会自动安装所有子项目的依赖
    

```
pnpm install
```

*   全局的公共依赖包
    

```
pnpm install react -w
pnpm install rollup -wD 安装开发依赖
```

*   给某个子项目单独安装指定依赖
    

pnpm 提供了 --filter 参数

```
pnpm add axios --filter @package1
```

*   模块之间的相互依赖
    

```
pnpm install @package2 -r --filter @package1
```

在设置依赖版本的时候推荐用 workspace:* ，这样就可以保持依赖的版本是工作空间里最新版本，不需要每次手动更新依赖版本。

pnpm workspace 谁在用：vue, vite 等。

pnpm Monorepo 优点：

1.  天然支持 **Monorepo**(在根目录给所有空间安装依赖、在根目录单独给子包安装依赖)
    

缺点：

1.  需要手动提升公共依赖。
    
2.  需要手动指定任务 (dev,build) 执行，任务不支持并行执行，影响构建速度。
    
3.  不支持自动版本控制，需要依赖第三方工具，官方推荐两个工具 changesets、Rush。
    
4.  没有通用的脚手架模板。
    
5.  不支持缓存。
    
6.  不支持依赖分析。
    

...

2. Lerna
--------

目前已经交给 Nx 公司。

官网：https://lerna.js.org/

*   默认 npm，支持 yarn，pnpm
    
*   克隆下官方 demo
    

```
git clone https://github.com/lerna/getting-started-example.gitcd getting-started-examplenpm install
```

*   初始化
    

```
npx lerna@latest init
```

*   工作区可视化，能形象看到项目之间依赖关系图
    

```
npx nx graph
```

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9a9XT4m4ibMpVIoibMlANVSn0Yv7Xtcj3H7EzwzEiaiavyiaVpQrpDic3mPzyHJGZl6bcRcoJmN3enUwlQ/640?wx_fmt=png)项目依赖关系图

*   公共包提升根目录
    

```
lerna bootstrap --hoist
```

*   构建所有项目（自动识别 build 并以正确的顺序构建）
    

```
npx lerna run build
```

*   给某个 package 单独 build，使用 --scope
    

```
npx lerna run build --scope=package1
```

*   开启缓存
    

```
npx lerna add-caching
```

*   自带版本控制
    

```
lerna publish --no-private (过滤私有包，不发布)
```

*   添加子项目，lerna 内置了一些项目模版，例如 react
    

```
lerna create <pkgName>
```

优点：

1.  依赖自动提升
    
2.  交给 Nx 公司之后，支持开启缓存、内部依赖分析、任务分析
    
3.  检测改动 commit 影响的包，区分提示
    
4.  自带版本控制（能分析出 private:false 的包，引导版本号提升）
    

缺点：

1.  默认 npm, npm@7 版本以下不支持 **Monorepo**，只能安装根目录的依赖，需要使用 `lerna bootstrap --hoist`，@npm@7 版本以上支持，可以直接 npm 安装所有子包的依赖
    

3. Turborepo
------------

官网：https://turbo.build/，官方有详细的 demo，这里就不赘述。核心的功能点如下：

*   包管理：支持 npm，yarn，pnpm
    
*   turbo 运行任务 turbo hello，它必须在 turbo.json
    

```
{  "pipeline": {    "build": {      //   ^^^^^      "dependsOn": ["^build"],      "outputs": ["dist/**", ".next/**"]    },    "lint": {},    "dev": {      //   ^^^      "cache": false    }  }}
```

*   默认使用缓存
    
*   自动识别项目中的 dev, build 命令，并全量运行
    

```
turbo build
```

*   仅运行某个单独的包，使用 --filter
    

```
turbo dev --filter package1
```

优点：

*   多任务并行处理
    
*   云缓存：多人开发共享缓存
    
*   任务管道
    
*   约定配置：显式声明，执行顺序
    

缺点：

*   版本控制不支持，官方推荐 Changesets
    

思考
==

什么场景适合用
-------

1.  代码共享：当多个项目或模块之间需要共享代码、组件或工具库时。
    
2.  统一版本管理：需要统一管理各个项目的版本依赖，确保一致性。
    
3.  简化依赖管理：减少依赖安装和版本冲突，提高构建和部署效率。
    
4.  协作与团队工作：团队成员可以更轻松地共享代码、协作开发和进行代码审查。
    
5.  简化构建和部署：需要更方便地进行整体构建和部署，尤其对于有相互依赖关系的子项目。
    
6.  敏捷开发和迭代：需要加快开发和迭代周期，避免在多个代码仓库之间切换和同步。
    

Monorepo 有哪些缺点
--------------

1.  性能问题：当仓库的代码规模非常的巨大，达到 GB/TB 的级别，会增大开发环境的代码 git clone、pull 成本，以及安装成本，本地硬盘的压力，执行 git status 也可能需要花费数秒甚至数分钟的时间。
    
2.  打包构建需要专门优化，否则会出现打包时间过长。
    
3.  权限管理问题：项目粒度的权限管理较为困难，github、gitlab 权限目前不支持文件夹级别。
    
4.  特定开发工具和框架限制，灵活性差。
    

未来趋势
====

期望 Nx 或者 Turborepo 这样的库往完整的框架发展，或者包管理器 pnpm/npm 自身就逐步支持相应的功能，不需要过多的三方依赖。

参考
==

1.  https://monorepo.tools/#workspace-analysis
    
2.  https://developer.aliyun.com/article/1067018#slide-6
    
3.  https://juejin.cn/post/7098609682519949325#heading-9
    
4.  https://segmentfault.com/a/1190000039157365
    
5.  https://pnpm.io/workspaces
    
6.  https://turbo.build/repo/docs
    
7.  https://lerna.js.org/docs/getting-started
    

  

想了解更多转转公司的业务实践，点击关注下方的公众号吧！