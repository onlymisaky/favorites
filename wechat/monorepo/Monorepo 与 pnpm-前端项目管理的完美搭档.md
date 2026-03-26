> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6zifH8fozWTJMoHWfyVk0g)

### 一、什么是 pnpm

pnpm 又称 performant npm，翻译过来就是高性能的 npm。

##### 1. 节省磁盘空间提高安装效率

pnpm 通过使用**硬链接**和**符号链接**（又称软链接）的方式来避免重复安装以及提高安装效率。**硬链接**：和原文件共用一个磁盘地址，相当于别名的作用，如果更改其中一个内容，另一个也会跟着改变**符号链接（软链接）**：是一个新的文件，指向原文件路径地址，类似于快捷方式 官网原话：

> 当使用 npm 时，如果你有 100 个项目，并且所有项目都有一个相同的依赖包，那么，你在硬盘上就需要保存 100 份该相同依赖包的副本。然而，如果是使用 pnpm，依赖包将被存放在一个统一的位置，因此：1. 如果你对同一依赖包需要使用不同的版本，则仅有 版本之间不同的文件会被存储起来。例如，如果某个依赖包包含 100 个文件，其发布了一个新 版本，并且新版本中只有一个文件有修改，则 pnpm update 只需要添加一个新文件到存储中，而不会因为一个文件的修改而保存依赖包的所有文件。2. 所有文件都保存在硬盘上的统一的位置。当安装软件包时，其包含的所有文件都会硬链接自此位置，而不会占用额外的硬盘空间。这让你可以在项目之间方便地共享相同版本的依赖包。最终结果就是以项目和依赖包的比例来看，你节省了大量的硬盘空间，并且安装速度也大大提高了！

##### 2. 创建非扁平的 node_modules 目录结构

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcFeic0crZytzTcq3nrn6rzBOcFm2ttWgFYyBzrsWUqO0yGGAblUu5ZmQ/640?wx_fmt=png&from=appmsg)image.png

##### 3.Monorepo 简介及其与包管理工具（npm、yarn、pnpm）之间的关系

###### Monorepo 模式：

**Monorepo** 是一种项目开发与管理的策略模式，它代表 "单一代码仓库"（Monolithic Repository）。在 **Monorepo** 模式中，所有相关的项目和组件都被存储在一个统一的代码仓库中，而不是分散在多个独立的代码仓库中，这些项目之间还可能会有依赖关系。

###### 包管理工具：

**npm、yarn、pnpm** 等是用来管理项目依赖、发布包、安装依赖的工具，它们都提供了对工作区（workspace）的支持，允许在单个代码库中管理多个项目或包。这种工作区支持在单个代码库中同时开发、测试和管理多个相关的项目，而无需使用多个独立的代码仓库。

###### 关系：

这些包管理工具与 monorepo 的关系在于它们可以为 monorepo 提供依赖安装与依赖管理的支持，借助自身对 workspace 的支持，允许在 monorepo 中的不同子项目之间共享依赖项，并提供一种管理这些共享依赖项的方式，这可以简化依赖项管理和构建过程，并提高开发效率。

##### 4.Monorepo （单仓多模块）开发模式

*   回归单体管理：Monorepo 是一种试图回归单体管理优势的方法，但保留了多仓库开发的某些优点。它允许在一个代码库中管理多个项目、组件或服务，提供更好的代码共享和重用性。
    
*   现代工具支持：现代的版本控制系统和工具链使得 Monorepo 开发模式更为可行，例如像 Pnpm、Yarn 、Lerna 和 Turborepo 等工具，它们提供了更好的管理、构建和部署多个项目的能力。
    
*   优点：
    

*   保留 multirepo 的主要优势
    
*   管理所有项目的版本控制更加容易和一致，降低了不同项目之间的版本冲突。
    
*   可以统一项目的构建和部署流程，降低了配置和维护多个项目所需的工作量。
    

1.  代码复用
    
2.  模块独立管理
    
3.  分工明确，业务场景独立
    
4.  代码耦合度降低
    

*   缺点：
    

*   Monorepo 可能随着时间推移变得庞大和复杂，导致构建时间增长和管理困难，git clone、pull 的成本增加。
    
*   权限管理问题：项目粒度的权限管理较为困难，容易产生非 owner 管理者的改动风险。
    

##### 5. 如何解决 monorepo 无法进行细粒度权限管理的缺点

**1.  使用代码所有权文件**使用如 CODEOWNERS 文件（GitHub 等平台支持）来指定某个目录或文件的所有者。当这些文件或目录被修改时，只有指定的所有者才能批准更改。这种方法能够实现对项目或模块级别的权限粒度控制。  
**2.  利用 CI/CD 流程**在持续集成 / 持续部署（CI/CD）流程中设置权限和访问控制。例如，可以配置流程，只允许具有特定权限的用户触发构建或部署到生产环境。这种方式可以在流程层面上控制谁可以对代码库进行重要操作。  
**3.  分支策略**通过严格的分支管理策略，如 Git Flow，控制不同级别的开发人员可以访问和修改的分支。比如只允许项目负责人合并代码到主分支，而其他开发人员只能在特定的功能分支上工作。  
**4.  使用 Git 钩子**配置 Git 钩子（Hooks），在代码提交或合并前执行脚本来检查提交者的权限。例如，可以设定 pre-commit 钩子，确保提交的代码符合访问权限要求。  
**5.  利用子模块**虽然这种做法在传统 Monorepo 中较少使用，但通过 Git 子模块（submodules）可以实现对特定部分的仓库独立控制，从而在需要时提供更细粒度的权限管理。  
**6.  第三方工具和扩展**考虑使用一些第三方工具和扩展来管理权限。例如，GitLab 和 Bitbucket 等平台提供了更细粒度的权限控制设置，允许在项目或组织级别进行详细的访问控制。  

##### 6. 为什么组件库项目会选用 Monorepo 模式

对于组件库项目，很自然的会涉及到划分以下模块

*   components 包，作为组件库的主要代码，实现各个 UI 组件的核心逻辑。
    
*   shared 包，主要存放各种杂七杂八的工具方法。
    
*   theme 包，实现组件库的主题样式定制方案。
    
*   cli 包，实现组件库模板脚手架的命令行工具。
    
*   docs 包，组件库的示例 demo 与使用文档。
    
*   playground 包，组件库的在线编辑、演示应用。
    

细化拆分不同模块的好处非常明显，一句话总结就是：模块划分的越清晰，复用时的灵活性、可操作性就越强，每个独立模块产物的体积也会越轻量。

### 二、pnpm 的安装和使用

##### 1. 安装全局 pnpm

`npm i pnpm -g`

##### 2. 查看 pnpm 版本

`pnpm -v`  
如果显示版本，说明安装成功

### 三、pnpm 在 monorepo 架构中的使用

如下结构，我们项目中有一个 main 应用，在 web 文件夹下还有一个 react 应用和 vue 应用，我们可以用 pnpm 对依赖进行统一管理

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcmUYAnsDicC6KOibRDXgQI1aP0ODzNRaibCibBah2hy1K3XjzRCWIz9S2uQ/640?wx_fmt=png&from=appmsg)image.png

##### 1. 在根目录 pnpm 初始化生成 package.json

`pnpm init`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcrHzGF5QibmxBxzwouPqZiauv0H3Zrr3VKlwVpoR9vLVpogud0s82n1cQ/640?wx_fmt=png&from=appmsg)image.png

##### 2. 配置工作空间

① 新建 pnpm-workspace.yaml 文件

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcHtTSCcYBYfEniclAqDxJpRkZeTMYrLZvW7RWlUlTm0QlYJ2sjPuoiacw/640?wx_fmt=png&from=appmsg)image.png

② 配置 pnpm-workspace.yaml 文件

```
packages:  # 主项目  - 'main-project'  # 子目录下所有项目  - 'web/**'
```

##### 3. 安装项目依赖

在根目录运行如下命令，一键为所有项目安装依赖

`pnpm i`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcOHCvzZHnNjOTpYHxu0e4PBia73iaMSv2qicwbiaOICraM5nL3fnEgJ9ic0A/640?wx_fmt=png&from=appmsg)image.png

##### 4. 暴露公用方法

###### ① 创建 common 文件夹及 index.ts

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcRpmJrrXnddszjzA0983oDO4EUZZbcrib4k7krxJV0icZnJWus4uGhiaUw/640?wx_fmt=png&from=appmsg)image.png

###### ② 在 common 文件夹中运行 pnpm init 初始化

`pnpm init`

###### ③ pnpm-workspace.yaml 文件中添加 common 文件夹

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDc43AeL9MwKqcFZKrEIdJzdoGjxibbCicZictxSGxnHhnXXfibQbgcictmicFg/640?wx_fmt=png&from=appmsg)image.png

###### ④ 编写 index.ts 文件暴露方法

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcRpmJrrXnddszjzA0983oDO4EUZZbcrib4k7krxJV0icZnJWus4uGhiaUw/640?wx_fmt=png&from=appmsg)image.png

`export const hello = () => { console.log('hello') }`

###### ⑤ 根目录运行 pnpm -F main-project add common 将 common 里的方法暴露给 main-project

这里的 - F 是 --filter 的简写，用于过滤指定的 package，用法 pnpm --filter

`pnpm -F main-project add common`

##### ⑥ 在页面中引入公共方法

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcEmIILPDKKSFhuMwMWEUsMUicpllW4vt1uc4rQ37ymuxzjopBFQ4Y3nQ/640?wx_fmt=png&from=appmsg)image.png

##### ⑦ 启动页面

`pnpm -F  main-project dev`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcWa1y8SLiaiaABd68IQxpwr5CBwLgwcvQFVBUxAHUl3ULSNO7r2kBckicg/640?wx_fmt=png&from=appmsg)image.png

##### ⑧使用 pnpm 模块内部指定依赖 踩坑总结

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDc7VaFoQvqQG2Pib7SMiaP3FC1icG11jyBsr8vQEtvtfjR36D92r6KgAS7A/640?wx_fmt=png&from=appmsg)image.png

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcr8UKzHOTJHPia4SSTYg5lv91D7VES0LYtwefHTjmlRkH1qpdSdfXUqg/640?wx_fmt=png&from=appmsg)例如我要将 common 包添加到 packages/* 下面的所有子项目的 package.json 中 执行 pnpm -F packages/* add common or pnpm -F 'packages/*' add common

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcCdjqW2B0CwkAv8u5vaG9agE0ANbQ797qAFhhCeIKJK1yiapAmWcRw9g/640?wx_fmt=png&from=appmsg)都会显示找不到路径 原因：官网通知 pnpm filter 过滤器非常强大 需要依赖当前项目相对路径

`正确指令：pnpm -F "./packages/\*" add common`![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibt0gKCZCsyfnlXAxZbLKiaDcpibhnt81bAVBGYs5owPs3FuELrbMRzym4ibm4AxLG0LNryQGyicZKD9zQ/640?wx_fmt=png&from=appmsg)

### 四、pnpm 常用命令

```
#安装软件包及其依赖的任何软件包 如果workspace有配置会优先从workspace安装
pnpm add <pkg>
#安装项目所有依赖
pnpm install
#更新软件包的最新版本
pnpm update
#移除项目依赖
pnpm remove
#运行脚本
pnpm run
#创建一个 package.json 文件
pnpm init
#以一个树形结构输出所有的已安装package的版本及其依赖
pnpm list
```

**子包管理操作**在 workspace 模式下，pnpm 主要通过 --filter 选项过滤子模块，实现对各个工作空间进行精细化操作的目的。

###### 为指定模块安装外部依赖。

*   下面的例子指为 a 包安装 lodash 外部依赖。
    
*   同样的道理，-S 和 -D 选项分别可以将依赖安装为正式依赖 (dependencies) 或者开发依赖(devDependencies)。
    

```
// 为 a 包安装 lodash pnpm --filter a i -S lodash // 生产依赖pnpm --filter a i -D lodash // 开发依赖
```

###### 指定内部模块之间的互相依赖。

*   指定模块之间的互相依赖。下面的例子演示了为 a 包安装内部依赖 b。
    

```
// 指定 a 模块依赖于 b 模块pnpm --filter a i -S b
```

pnpm workspace 对内部依赖关系的表示不同于外部，它自己约定了一套 Workspace 协议 (workspace:)。下面给出一个内部模块 a 依赖同是内部模块 b 的例子。

```
{  "name": "a",    // ...    "dependencies": {    "b": "workspace:^"  }}
```

在实际发布 npm 包时，workspace:^ 会被替换成内部模块 b 的对应版本号 (对应 package.json 中的 version 字段)。替换规律如下所示：

```
{  "dependencies": {    "a": "workspace:*", // 固定版本依赖，被转换成 x.x.x    "b": "workspace:~", // minor 版本依赖，将被转换成 ~x.x.x    "c": "workspace:^"  // major 版本依赖，将被转换成 ^x.x.x  }}
```