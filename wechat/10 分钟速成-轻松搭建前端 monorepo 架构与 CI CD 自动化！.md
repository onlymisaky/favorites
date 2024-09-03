> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/M7gPH_YyJAbMOCuj7frpmw)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 作者：文学与代码
> 
> 原文地址：https://juejin.cn/post/7401112990441275426

正文
--

今天我们主要讨论 3 方面内容：

1.  如何搭建比较高效好用的 monorepo 工程
    
2.  前端如何基于搭建的 monorepo 工程实现自定义 cli 工具
    
3.  普通前端项目以及 monorepo 工程项目自动化 cicd 核心问题以及解决方案
    

基于 pnpm-workspace + Turborepo + lerna 搭建 monorepo 的 cli 工程
----------------------------------------------------------

### 首先利用 pnpm 初始化一个工程

执行命令初始化工程：

```
pnpm init -y



```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fmeC81siaXmxHB6jnswo1G0wKV35yX5vVHVmDnEjLY6tr97wC8ibBgV0A/640?wx_fmt=other&from=appmsg)image.png

### 项目中安装开发依赖 lerna:

`pnpm i -D lerna`

配置命令：

```
  "scripts": {
    "lerna-init": "lerna init",
    "lerna-create": "lerna create"
  }


```

### 搭建多包环境：

建立 pnpm-workspace.yaml 文件，并且配置：

```
packages:
  - 'packages/*'


```

新建 packages 目录：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fMFf28zKc98J2dXxnTictQtxfhLxOdqeUrUJWKXkbxkjOkvKweLWTXibQ/640?wx_fmt=other&from=appmsg)image.png

初始化 lerna 配置：

```
pnpm lerna-init


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fRRicQAhhcZhUOe3BJ80dSr3l8OWmIoiaJ5A4EXGJr46ZD0VDhtahxaMA/640?wx_fmt=other&from=appmsg)image.png

### 创建 cli 的核心包：

```
lerna-create @frontend-dev-cli/core


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f3yl43pWZOKTBaNT6ZcQ8Z3haCQqAr4t2ibTibXN91GwId5mXTAR9n0NQ/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fxak1Ke6odZibvlN9RRib2L7YU9hTwWAlnDTallrGIbyLssoBaAqT76yQ/640?wx_fmt=other&from=appmsg)image.png

这样之后，lerna 就给我们创建好了一个包的默认模板。

### 集成 ts

我们的 cli 全部采用 ts 进行开发，所以我们需要搭建一套多包的 ts 环境。

1.  我们在根目录下新建一个 ts 的配置文件：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fFyp30fGQpMS8Un7ZwQ5yRh2YFRMoDOk4Jiayw7HRUAicicWxeYPVNhFoA/640?wx_fmt=other&from=appmsg)image.png

加入如下的配置：

```
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
     "outDir": "./build",
    "noImplicitAny": false,
    "removeComments": true,
    "noLib": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "target": "es6",
    "sourceMap": true,
    "lib": [
      "es6",
      "esnext",
      "dom"
    ],
    "types": [
      "node"
    ],
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*.ts" // 明确指定匹配 .ts 文件
  ],
  "exclude": [
    "node_modules",
    "**/*.spec.ts",
    "package.json"
  ]
}



```

在根目录下新建一个 src 测试文件夹，在里面加入 index.ts 以及 a.ts 两个测试 ts 的文件：

```
// a.ts

export const a = () => {
    console.log('adjddj');
}

export const b = () => {
    console.log('adjddj');
}



```

```
// index.ts

import { a } from './a'

export default function main () {
    a()
    console.log('main')
}

main()



```

然后执行以下命令在根目录安装 typescript 的开发依赖：

`pnpm i -D typescript -w`

然后，配置编译的脚本：

```
 "build": "tsc"


```

执行 pnpm build 命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fh78rQcLwiaYVqIKdyERhr8ic6AfrsIBPZ9TynKrFRgDCiaBDoxAbRkadw/640?wx_fmt=other&from=appmsg)image.png

出现这个错误的原因是因为我们在 ts 编译配置中的：

```
    "types": [
      "node"
    ],


```

设置 ts 的编译的宿主环境是 node，但是 ts 没有找到 node 的类型文件。所以我们执行：

```
 pnpm i -D @types/node -w


```

安装 node 的类型文件。然后再次执行构建命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f1CDbicckUseqn2OzzuCKUic0knJw6dXXoLttcDuyCq9HKHn3PNGfcQuA/640?wx_fmt=other&from=appmsg) 构建完成了。在著项目中测试完毕之后我们再到创建的 core 子项目中去新建一个 index.ts 文件并且再子项目中配置构建命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fHdibkgoUDyLryw0tYOjuxkegkvsaMAxkjyHVbPswlHXzJuR8Yib0YoUw/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fMZC6dF8sbP8JC25wP5zic3Iv1F0zngPYQQyNMBSK2tSJrITx7vFRgVA/640?wx_fmt=other&from=appmsg)image.png

配置子应用的 ts 配置文件：

```
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "outDir": "./build"
    },
    "include": [
        "./lib"
    ]
}


```

直接继承了父应用的全局配置，并且指定了本应用的编译目录和输出目录。然后我们尝试再 core 项目中执行 build 命令：

```
pnpm build


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f59ibCicibOAL8r1icgMhgydE6KBfLLHWZBab4OiaNavxHuiavKyCm0ziazIHw/640?wx_fmt=other&from=appmsg) 可以看到在子项目中是可以成功调用到父项目中安装的脚本命令的，并且成功按照父项目中统一配置的 ts 配置文件的规则来进行编译了。这就是 monorepo 架构的好处。包括像 eslint 这些代码格式校验工具，jest 这些测试工具，我们都只需要再根项目下配置依次就可以了，子项目中直接就可以集成根项目中的配置。至此，ts 环境准备完毕。

### 打通多包项目之间的调用关系

我们先新建一个新的包：

```
 pnpm lerna-create @frontend-dev-cli/utils


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fkvAy5y22qvuECLD1vg6wDsehA803WjqgnoFQcxibtEXhphQDDuM50vw/640?wx_fmt=other&from=appmsg) 加入如下的工具导出：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f0Z3UGUS3IibQcAiaq4Ne6ichZtNn0Rqticl1PtEAUAIobTHtbW9jAn4hwQ/640?wx_fmt=other&from=appmsg) 在这个子项目中加入同样的编译命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fFDVibgmpfXZYMamBvN2qPHFuGmZqEpP2m7QxKj3oSodKMbSRubvIG2Q/640?wx_fmt=other&from=appmsg) 在 utils 这个子项目中执行 build 命令，产生构建结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0ficoRKzE1bQx66He9O0OPkPicZ46JoUbzJicZbTOSSMVqicSVo6Hp4RWyjQ/640?wx_fmt=other&from=appmsg) 然后我们调整 package.json 中的 files 配置：

```
  "files": [
    "build"
  ],


```

也就是当执行 publish 操作的时候，我们只需要上传 build 目录里面的内容就可以了。然后我们尝试在 core 这个子项目中引入 utils 这个项目。我们切换到 core 项目中，执行以下命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fdwBuTlYVkkBUBniaeo9Tca4YE1Dg9eHtibsFQcdKYfTE8PTI7fLIrCHQ/640?wx_fmt=other&from=appmsg) 这样，utils 这个子项目就被链接进来了：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fibYBalNZkbIpuFzNMD6I182RfVK9lQtGDZkpqu4MOxlia8XclNddEKNA/640?wx_fmt=other&from=appmsg)image.png

然后我们直接在 core 中引入 utils 中导出的内容：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fRApu20ETw0mDNdAAO0YfyWaba1sFDXtrUhfuTpqof0xKkTD4d1m5uA/640?wx_fmt=other&from=appmsg) 我们执行以下构建 core 项目的命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fuTicsZCDdIiazyBO9aLXPrS5UQIkYMylCcSTbePCVRQSmSxEibWAR3oicg/640?wx_fmt=other&from=appmsg) 正常构建了，我们执行以下构建的结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fYaDUnZ3yEXr8DfKrRktmYqb2jkrZ9dZhnYC4nOwCwtsicZ1GlSqwpNQ/640?wx_fmt=other&from=appmsg) 至此。子应用之间的调用也测试通过了。

### 优化开发体验

优化开发体验主要是两个方面：

1.  每一个子应用中只要 ts 代码变化了都需要重新触发 ts 代码的重新构建
    
2.  我们在主项目中需要一个一次性可以执行所有子项目构建操作的命令
    

先解决第一个问题，这个问题很好解决，我们可以在每一个子应用中的 tsc 命令调用的时候加入 watch 参数：

```
  "scripts": {
    "build": "tsc --watch"
  },


```

我们重新执行 core 中的 build 命令，然后重新改以下源码：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fZuIBGrIxXDMdwL8x8uEjDQfGVgtJ5Ut1QDNiba7PG0ACLQoBwDOibK4Q/640?wx_fmt=other&from=appmsg)image.png

此时 tsc 就会一直监控源码的变化，一旦源码变化就会自动编译，并将编译结果输出到 build 目录。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f0Gfkd2tYzRiahNOQ281nyMHfjia2tYricgYIby7QCvUIY642Or0RibDiakw/640?wx_fmt=other&from=appmsg)image.png

我们就可以看到最新的代码执行结果了。要解决第二个问题。其实目前有两种常见解决方案：

1.  利用我们已经安装的 lerna 工具，lerna 中有支持一次性并行执行的命令。
    
2.  比较新的一个工具：turbo。这个工具相对效率更高，体验更好，我们本次采用这个工具来解决这个问题。
    

首先还是在全局安装依赖：

```
pnpm i -D turbo -w


```

然后再根目录下新建 turbo.json 文件，配置如下内容：

```
{
    "tasks": {
      "build": {
        "dependsOn": [],
        "outputs": ["build/**"]
      }
    }
  }


```

然后调整根目录下的 build 命令并且指定包管理器：

```
  "packageManager": "pnpm@8.9.2",
  "scripts": {
    "lerna-init": "lerna init",
    "lerna-create": "lerna create",
    "build": "turbo run build"
  },


```

再根目录下执行 pnpm build:

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fRQ4BRuKjsLSM02Uq8VrXRoBXT9BrFsl1PmUGrPQVJtjOJ11Im3Kt9w/640?wx_fmt=other&from=appmsg)image.png

turbo 对编译结果是进行了本地缓存的以及加速的，所以编译非常的快，体验很棒：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fBzQ5PH451sNOLc3foWdjXBO6xeiaYRAOHcWVfvsb7hPYX0Q5j7I3huw/640?wx_fmt=other&from=appmsg)image.png

至此我们就优化了本地开发的编译问题。

### 利用 lerna 来进行 monorepo 发包：

首先不管是 lerna 还是 pnpm 发布包之前都必须提交本地 git，所以请先将自己本地的 git 改动全部提交到远程仓库上。然后我们就在 package.json 中添加如下的发包命令：

```
 "lerna-publish": "lerna publish"


```

然后我们执行命令，利用 lerna 进行发包：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f9emIKcTFqyy0icQG3ba5MDtJC4P09tHxtp108ZnBHrazhRmbdQ7leVg/640?wx_fmt=other&from=appmsg)image.png

然后进入一系列和 lerna 的交互之后，就可以进行 lerna 的发包了。发布完成之后，我们可 ui 前往 npm 仓库查看：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fficwLUvBq7HiafjCAqx4SicKpKHusibjpaCB80AoDsexLwnOANEC22625w/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fibcHjmX3jLysDGoFFicwFL4DpwnlVlyU4N7RPiaRHzuZ9IcGcFXaxpSJA/640?wx_fmt=other&from=appmsg)image.png

至此，我们利用 lerna 完成了多包项目的发包操作。我们再来提前扩展一个点哈，因为我们后面就要实现多包工程自动化发布的 cicd。而 cicd 肯定是在服务器上自动执行的，不能够有交互。lerna 实际上是考虑到了这一点的，它的命令行提供了如下的参数：

```
"lerna-publish": "lerna publish 0.0.2 --yes"


```

就可以直接指定所有的子包发布的版本以及跳过所有的交互命令行了。而且在绝大多数情况下，尤其是在要实现自动化 cicd 的 monorepo 项目，保持所有子包版本的统一性是最佳的实践。lerna 在包发布完成之后，会自动基于现在的新发布的版本来自动打上一个 git tag，以及自动把这个版本推送到远程分支：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f6ua0KNHBFWeURBl4EGkphRPJbcRxZeoRrhlTX3h7XibmAciaibYNKseuQ/640?wx_fmt=other&from=appmsg) 包括自动更新对统一作用域包的版本依赖，都会自动更新：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fibPKEgDKLlSQSnnXaBMRpkOVGyc2FulHmRYC2bd215FbhrtLl0kfreA/640?wx_fmt=other&from=appmsg)image.png

这些都算是很好的自动化实践。

自定义 cli 工具
----------

### cli 的原理以及搭建前端研发脚手架：

cli 本质上就是一个命令行工具，通过和用户进行命令行交互来实现指定的功能。前端实现 cli 其实很简单：

1.  在 package.json 中加上 bin 字段：
    

cli 想不本质上也就是一个 npm 包，但是和普通的 npm 包不同的是，它的 package.json 文件中多了一个 bin 字段，bin 字段实际上就是配置命令的名称以及对应的可执行文件，我们将 core 包改造成一个 cli 程序：

```
  "bin": {
    "frontend": "build/index.js"
  },


```

我们在 package.json 中配置了如上的命令，实际上就是注册了 cli 的命令是 frontend。frontend 对应的可执行文件是 build/index.js，也就是我们期望，当在控制台上输入 frontend 后，操作系统会自动执行 build/index.js。改造完这个之后，我们需要让目前的操作系统上存在 frontend 命令，要做到这一点，我们可以这样做，在 core 包所在的目录的下输入：

```
 npm link


```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fO2G66hqRIVsp59Tx5qEmJVtIDr4ibicjK79Js8OVYC3S1dYzbtKgNPWg/640?wx_fmt=other&from=appmsg)image.png

本质上就是在 npm 全局目录下设置一个软连接，链向了我们本地正在开发的包。这样做了之后，我们在命令行中尝试输入注册的 cli 命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fakKNvK8g2zqsqzbIH7kxXoYKZM37m1JXEWORCcyP0zmHGxVtpBHO4g/640?wx_fmt=other&from=appmsg) 我们可以看到操作系统已经可以正常识别命令了，因为我们的 node 以及 npm 目录是早已经被注册到了环境变量中的，而全局 npm 目录下存在 frontend 命令以及对应的执行文件，所以操作系统就可以正常找到了。只是目前这个文件依然是一个普通的文件，不是一个可之心那个文件，所以操作系统直接使用记事本将文件的内容打开了。我们需要将其改造成一个可执行文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f2SJiaQl7Et7Ulicd88SBV7oZRicNmJ5yJKYqvsSH3tEgnvsE2VoIsoqrA/640?wx_fmt=other&from=appmsg)image.png

方案其实很简单，就是在开头加了一行注释，这行注释就是告诉操作系统，需要调用 node 进程来执行这个文件，这样做了之后我们重新链接，然后重新执行命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f2mURQ1jlpYhVEibrFlLtmKuXPScR9YpFFpAKbE1Oic4YcnXl8qplMagw/640?wx_fmt=other&from=appmsg)image.png

至此，我们就搭建了 cli 的基础能力。

### 利用 yargs 库注册并解析命令行参数：

可以注册和解析命令行参数的库有很多，个人比较喜欢 yargs 这个老牌的库。我们可以新建一个包：

@frontend-dev-cli/cli

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fBj11zaJIicSKrEGwuf2NjibwKTRRE2KVp2sM6zHdM70wgX7WSSZGH6icQ/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fOsmATicgpXkIYw8tmUft7nic4qDxxILGBduLwZEToTOesHOyVIBhMO0g/640?wx_fmt=other&from=appmsg)image.png

在这个包下负责封装 yargs，

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fXD6zW7cb9xVu9vLWx1IID2agpTReG7806dKa0ArnhDG6r5moqzbFzQ/640?wx_fmt=other&from=appmsg)image.png

进阶这我们快速基于 yargs 来封装一个命令行程序：在 index.ts 内：

```
import yargs = require('yargs')

// 注册 cli 全局 options

const initGlobalOptions = (yargsIns: yargs.Argv) => {
  return yargsIns
    .option("debug", {
      alias: "d",
      default: false,
      describe: "开启脚手架调试模式",
      type: "boolean",
    })
    .option('targetPath', {
        alias: 't',
        default: '',
        describe: '指定要执行的目标目录',
        type:'string',
    })
    .option('flushed', {
      alias: 'f',
      default: false,
      describe: '前置更新',
      type:'boolean',
  })
}

export default function cli() {
  // 初始化 cli、注册cmd
  return enrollCommand(initGlobalOptions(yargs('', '')))
  .usage("Usage: $0 <command> [options]")
  .demandCommand(1, "A command is required. Pass --help to see all available commands and options.")
  .recommendCommands()
  .strict()
  .alias("h", "help")
  .alias("v", "version")
  .fail((msg, err, yargsInstance) => {
    console.log('自定义错误内容', msg)
  })
}



```

在 enrollCommand.ts 内：

```
const enrollCreateCommand = (cli: yargs.Argv) => {
  // 添加注册 cmd 的逻辑
}

const enrollPublishCommand = (cli: yargs.Argv) => {
// 添加注册 cmd 的逻辑
}

const enrollDownloadCommand = (cli: yargs.Argv) => {
// 添加注册 cmd 的逻辑
}

export default function (cli: yargs.Argv) {
  // 注册 create 命令
  enrollCreateCommand(cli)
  // 注册 publish 命令
  enrollPublishCommand(cli)
  // 注册 download 命令
  enrollDownloadCommand(cli)
  return cli
}



```

其实就是针对 yargs 进行了一些简单的自定义以及提供注册 cmd 以及 options。然后我们将 cli 包链接到 core 包下，在 core 中进行引用：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f8iaE2RWFs9JhbsHXqAw0END4gYQKbWM0pM53qbxNsUwELtjaucoericg/640?wx_fmt=other&from=appmsg)image.png

```
#!/usr/bin/env node

import { sum, a, aa } from "@frontend-dev-cli/utils"
import cli from '@frontend-dev-cli/cli'

function core() {
  // 开始注册 cli
  cli()
}

core()


```

然后我们执行 cli 命令进行测试：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fDibzM0ty3Jv2tr3J9LD9vzuicYC7Nu3ergxGqwZKnZ6LFcRs8zZhAZbA/640?wx_fmt=other&from=appmsg)image.png

好像任何反应都没有。这个原因是因为 yargs 需要我们将用户在控制台输入的参数喂给它去解析：

```
import cli from '@frontend-dev-cli/cli'

function core() {
  // 开始注册 cli
  cli().parse(process.argv.slice(2))
}

core()



```

然后我们再次输入命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fZAkJh6JjbU3RibXua00AE1F79UecMicDWfLuhjibBGA8CYkWG7rAxXHrQ/640?wx_fmt=other&from=appmsg)image.png

因为篇幅有限，我们的 cli 程序本身还有很多细节可以去优化，这里就不再赘述了。

### 丰富脚手架的交互体验

虽然命令行的交互优化很难比得上浏览器交互，但是依然可以由很多手段尽量优化以下交互：

1.  可以利用 Inquirer.js 在命令行中实现选项列表、input 输入，checkBox 多选框等交互效果
    
2.  ora.js 在命令行中实现 loading 效果
    
3.  cli-progress 实现进度条
    
4.  npmLog 实现丰富的自定义 cli 输出日志，lerna 中的日志就是采用的这个库，而且可以方便的自定义和扩展 log 等级
    
5.  chalk、colors 库可以实现在控制台中输出自定义的颜色。
    

等等，关于如何开发一个强大的 cli 工具还有很多内容，我们在这里就不一一赘述了，大家可以从参考 lerna 的 cli，阅读它的源码，它的源码写的很优质，很好读。

通用前端项目 cicd 设计
--------------

在绝大多数情况下前端项目，比如 vue 或者 react 框架搭建的项目，都是单包的项目，也就是一个项目一个仓库，这种项目的 cicd 设计是比较简单的，我们现在来基于上面的 cli 脚手架来封装一个 command 来简单实现以下这个流程：（实际上，大部分情况下，前端的 cicd 流一定是在服务端开启一个 dockter 容器环境中去进行的，我们这里就直接在本地模拟了）：我们在 cli 中开发一个 publish 的 command：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fjzIjXV6t5wOk6M6sJSOOIXsfyOKyrF2kUjRbQyyofhbSib63yiaInWCg/640?wx_fmt=other&from=appmsg)image.png

```
function publish() {
  console.log('publish')
  return 'Hello from publish';
}

export default publish


```

然后再 cli 中链接这个模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fFIWfpiaolq9xdkIMrV2kzjIhibmYC8FcFLDEEKGM8qPyrphWalgWb22g/640?wx_fmt=other&from=appmsg)image.png

注册一个 publish command

```
import publish from '@frontend-dev-cli/publish'

const enrollPublishCommand = (cli: yargs.Argv) => {
  cli.command({
      command: 'publish',
      describe: "自动化cd",
      builder(yargs) {
        return yargs;
      },
      async handler(argv) {
        publish()
      },
  })
}

export default function (cli: yargs.Argv) {
  // 注册 create 命令
  enrollCreateCommand(cli)
  // 注册 publish 命令
  enrollPublishCommand(cli)
  // 注册 download 命令
  enrollDownloadCommand(cli)
  return cli
}



```

然后我们尝试执行 publish 命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fHQESicMicBkBPYY76Ss57WaeJqkz36ITibHdibc2Bo2zaia3LPCibjxKmemA/640?wx_fmt=other&from=appmsg)image.png

至此我们就注册了脚手架的第一个命令，再目前的设计下，注册一个脚手架命令还是很方便的，而且很好维护，因为我们将所有的 command 执行程序全部拆分到了一个单独的子包中，要调整某个命令只需要在子包中去调整即可。下面我们来梳理一下普通前端项目基础的 cicd 流程是什么样子的：

hjt06zvgj6.feishu.cn/docx/Zqlkdf…[1]

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f1ANyNhNzMpoTTwhKCkJiabDfwXO4m3GsdL4UOLPGBfrNVWWFGt36dLg/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fG0CPLzd21g6FjGIgpz5mTAUuO8J90yPywQMJnSVC7NArAMdtaLp7mg/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fWQCXSpJ1MLVOjyhUAWZiaCcrGbUCk5YAvhdbjJ9qfeoVkEla3z4a78Q/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0fmkH5JS7UdpNJysYwHgxc4C0OytjP7DFacfQaojfyt4IfvZ3T8SheoA/640?wx_fmt=other&from=appmsg)image.png

自动化 cd 流程相对比较简单：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxyoAuuuaNCc2NGNsSw3iaK0f8fMiaiapRfXyuuDtE147pe8rC51veMvkFgE1Hsicibqxe99Gib8C3iamJv0Q/640?wx_fmt=other&from=appmsg)image.png

相比于普通前端项目的 ci 流程，前端 monorepo 的项目的 ci 流程复杂就复杂在，在某些情况下需要构建指定的包，发布指定的包；在某些情况下可能需要构建和发布全部的项目。要实现这一点的关键就是我们在 ci 流程中需要根据不同的参数动态的去控制构建和发布的范围以及流程，基于此我们给出以下的解决方案：

1.  我们允许用户在触发 ci 流程的时候传入具体的参数来表示需要构建的项目的信息，比如可以传入 all 表示需要构建所有的项目，传入指定的项目名称表示需要构建指定的项目。而我们在触发具体的构建过程之前将参数设置到环境变量中去。
    
2.  在每一个前端项目的根目录下允许用用户配置一个自定义的 js 脚本，我们在整个 ci 的流程中不要把 ci 的构建步骤写死，而是执行用户自定义的 js 脚本来进行自定义的构建。并且脚本中可以读取到前置步骤设计的环境变量，来动态控制构建流程。
    

我们可以在前面的脚手架中 build command 中简单写一个以上 ci 方案的大致流程：

```
const enrollBuildCommand = (cli: yargs.Argv) => {
  cli.command({
      command: 'build',
      describe: "自动化ci",
      builder(yargs) {
        // 注册 command 参数
        yargs.option('serciceName', {
          alias: 's',
          default: '',
          describe: '指定需要构建的项目名称',
          type:'string',
        })
        return yargs;
      },
      async handler(argv) {
        const s = argv.s as string
        // 将应用名设置到环境变量中
        process.env.serviceName = s
        build()
      },
  })
}



```

```
function build() {
  // 一系列前置操作...
  // 调用当前项目中的构建脚本
  const jobPath = resolve(process.cwd(), 'build', 'index.js')
  // 利用 require 函数执行改脚本，触发构建
  require(jobPath)
  // 构建完成之后按照约定的目录格式将产物拷贝到发布制品中
  // 压缩，上传发布制品到oss
}


```

其实 build command 核心就是利用 require 函数触发构建 job 的调用。

这样用户就可以在根目录下面利用构建 job 以及环境变量自定义构建流程了

```
function buildJob() {
  const serviceName = process.env.serviceName
    switch (serviceName) {
      case 'serviceA':
        console.log('构建 serviceA')
        npm run build:serviceA
        break
      case 'serviceB':
        console.log('构建 serviceB')
         npm run build:serviceB
        break
      case 'all':
        console.log('构建所有服务')
         npm run build:all
        break
      default:
        npm run build
    }
}
// 导入 job 之后自动触发函数执行
buuldJob()


```

还有一个很重要的一点，当构建完成之后，用户需要将所有需要发布的内容按照约定的文件夹目录格式进行整理，我们在通用的 ci 流程中只会将统一格式的文件夹作为发布制品进行上传。而对于非多包项目 ci，用户不需要考虑环境变量，直接在 自定义 job 中将 ci 流程固定就可以了。自定义允许用户可以自定义流程。比如用户需要执行怎样的包管理器以及其他的预设命令，都可以在 job 中定义，不过因为 job 的灵活性，在执行 job 之前还可以加上对它的安全性检测。

cd 的流程也是类似的一个方案了，这里我们就不一一赘述了。这样我们就可以以比较低的成本实现了比较通用的前端项目的 cicd 流程了。关于 npm 库的 cicd 流程，其实 ci 流程和目前这里说的前端项目的流程基本上是一致的。区别仅限于在 cd 的时候，npm 库需要发布到 npm 上面去，多包的 npm 项目一定是统一发包，统一变动版本号的。但总体的实现流程是差不多的。

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```