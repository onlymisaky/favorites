> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2MZ_b__k_ewcbAOuMHqXUw)

> 版权声明：本人文章仅在掘金平台发布，请勿抄袭搬运，转载请注明作者及原文链接 🦉
> 
> 阅读提示：网页版带有主题和代码高亮，阅读体验更佳 🍉

如果你不想看文章，可以直接阅读源码：xwg-cli[1]，如果有收获请点个 star。

开门见山，先看效果：

`xwg \--help`：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVKEia18mAPhpcCY5PjYv3VrjdRBpAy622tPIGR0D95oWF2JkWAI1tnUg/640?wx_fmt=other)image.png

`xwg \--version`：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVdqZv7HrI6RkIPSztaeIsicsLIBuLkEzLgFjialqLJahPIWxtKkNo3I5Q/640?wx_fmt=other)image.png

`xwg create demo`：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVAcNqibc5Znmhhr2J9GicbtnZRtibxuJWFZcdChuYpL1jFQHrMxBmcibBZg/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVf2hgDsJoIogDcrYFTnian8Hd7OaVGk0qk5I5YNWWxRuSeOia41j8S39Q/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVibxYFZLY3jZvMYMhzpLLZDDSQnRWEd1icIfJF1QZTtNMtNqicg5d84XAg/640?wx_fmt=other)image.png

`xwg create \--help`：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBV1uqxsDLSxcB6Qib1Z85Xzib62naPL2o3qBYKJLibEvHaoLtU58A41ETTg/640?wx_fmt=other)image.png

再来看看模板的质量如何：

每份模板都是我精心准备的，具备较为完善的工程化能力，包括 `eslint`，`commitlint`，`git cz`，`CHANGELOG` 等。但是也没有过多地干涉你的使用，并不是完全强制的。例如，虽然我配置了 `eslint`，但是没有强制规则，你可以自己增减。

`koa：`

搭建了完整的 `koa` 开发结构，内置了一个 `User` 模块，开箱即用。像 `sequelize`、`log4js` 等功能都是完备可用的，是不是非常用心，有木有！！

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVEmsGDYSLZF8qwCIdlmz2IfZmIZZJcLYV2RNdADbeYIibNc1FiaRrnonA/640?wx_fmt=other)image.png

`uniapp + vue2 + uview：`

uniapp 这份 vue2 版本的模板，基于我自己的商业项目进行改造，像请求模块都是内置好的。另外，这个模板还加入了 `uview-ui`，省去了你寻找 UI 添加组件库的步骤，关键是添加 UI 组件库真的有不少坑，用了这个模板直接快人一步，少踩起码 10 个坑。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBViaUmoBbO85OdadJUL6CbZHtIyU32B5tJfySrmUT6OfXvV2OXqnHkIcQ/640?wx_fmt=other)image.png

使用简介
====

在介绍开发代码之前，想必你也想先尝试下效果。

首先，确保你的 `node` 版本是 `14.18+` 或者 `16+`。

执行 `yarn add xwg-cli \-g`，重新打开终端执行 `xwg \--version` 看看是否成功安装。目前支持的命令有：

`xwg \--help`

`xwg \--version`

`xwg create <项目名>`

其实 `--help`，`--version` 是自带的（后面会详细讲），这两个命令更严谨的说法是参数，参数一般就是 `--` 开头，只有 `create` 才算是命令，目前 cli 仅完成了创建项目的能力，其他的能力正在思考建设中。

如果你不想下载，也可以执行 `npx xwg-cli create demo` 尝试创建项目。想必你又有疑问，为什么我的 cli 叫作 `xwg-cli`，但是我执行的时候是 `xwg xxx`，为什么不是 `xwg-cli xxx`？这些问题都将在我们接下来的文章中解答。

接下来的内容会比较长，请坐好小板凳。

如何搭建项目的开发环境
===========

cli 工具本质是一个 npm 库，那么我们就应该按照库的模式搭建项目开发环境。如果你不知道如何搭建，请参考我的文章：开发一个 npm 库应该做哪些工程配置？[2]。如果你不是很想从头搭建开发环境，那么，你可以直接 fork 我的仓库：xwg-cli[3]。

我的项目使用了 ts，但是不复杂，基本和 js 差不多，但是这仍然要求你具备比较好的 ts 知识，否则阅读文章会有一点难度。

需要用到的第三方库
=========

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">库名</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">作用</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>commander</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">解析用户在终端输入的命令及参数，例如 create、--help 等</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>chalk</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">为终端输出的文字增加各种各样的颜色</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>inquirer</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">给用户提供各种交互，包括输入、选择等，例如提示用户选择项目的创建类型，其可以提供输入框、radio、checkbox 等强大的交互控件</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>ora</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">增加 loading，例如下载模板时增加 loading</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>fs-extra</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">fs 模块的增强，支持更强大的文件读写操作</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>download-git-repo</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">下载模板</td></tr></tbody></table>

chalk
-----

我下载的 `chalk` 的大版本是 `4`，类型定义可能和其它版本不一样，具体请以你下载的版本为准。

```
import chalk from 'chalk';console.log(chalk.red('这会输出红色的字'))console.log(chalk.blue('这会输出蓝色的字'))console.log(chalk.cyan('这会输出青色的字'))console.log(chalk.cyan.bold('这会输出青色加粗的字'))console.log(chalk.cyan.italic('这会输出青色斜体的字'))
```

chalk 改变字体颜色的所有方法定义：

```
declare type ForegroundColor =| 'black'| 'red'| 'green'| 'yellow'| 'blue'| 'magenta'| 'cyan'| 'white'| 'gray'| 'grey'| 'blackBright'| 'redBright'| 'greenBright'| 'yellowBright'| 'blueBright'| 'magentaBright'| 'cyanBright'| 'whiteBright';
```

chalk 改变字体背景色的所有方法定义：

```
declare type BackgroundColor =| 'bgBlack'| 'bgRed'| 'bgGreen'| 'bgYellow'| 'bgBlue'| 'bgMagenta'| 'bgCyan'| 'bgWhite'| 'bgGray'| 'bgGrey'| 'bgBlackBright'| 'bgRedBright'| 'bgGreenBright'| 'bgYellowBright'| 'bgBlueBright'| 'bgMagentaBright'| 'bgCyanBright'| 'bgWhiteBright';
```

chalk 改变字体属性所有方法的定义：  

```
declare type Modifiers =| 'reset'| 'bold'| 'dim'| 'italic'| 'underline'| 'inverse'| 'hidden'| 'strikethrough'| 'visible';
```

了解这些基本已经足够你开发使用了。  

commander
---------

```
import { program } from 'commander';
```

`program.name` 定义命令的名称。

```
program.name(chalk.cyan('xwg'))program.name(chalk.cyan('demo'))
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVMHNTTyYqBnsFXQ3gBiaCTiczsDEgFWSetqVXibanY0mdiaTC7PUVtpOHUg/640?wx_fmt=other)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVib0dKbRbn2YE6z98AlykXzSnFtYhyxN4wYFtQ06ppJlvr5ibLgrqLIWg/640?wx_fmt=other)image.png

`program.usage` 定义命令的用法。

```
program.name(chalk.cyan('xwg')).usage(`${chalk.yellow('<command>')} [options]`);
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVfHpzfwhoJMhRm1G8lYqMDG6jqwx134AYHMFeL4GFhnoibAKic6Q31luQ/640?wx_fmt=other)image.png

`program.version` 定义 `--version`。

```
program.version(  `\r\n  ${chalk.cyan.bold(VERSION)}  ${chalk.cyan.bold(BRAND_LOGO)}`);
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVYWEFbSbhNR68xqEtoGwQL9kJeqet6qoWOz1WW36L8GlGUBHvfN0HhQ/640?wx_fmt=other)image.png

`program.on` 监听某个参数的执行，并执行回调。

```
program.on("--help", function () {    console.log(`\r\n终端执行 ${chalk.cyan.bold("xwg <command> --help")} 获取更多命令详情\r\n`);});
```

当我们监听某个命令时，可以这么写：  

```
program  .command('create <project-name>') // 这里不能使用 chalk  .description(chalk.cyan('创建新项目'))  .option('-f, --force', chalk.red('如果目录已存在将覆盖原目录，请谨慎使用，这会先删除你已存在的项目再进行创建，可能会存在意外情况'))  .action(这里是一个回调函数，执行这个命令的操作);
```

command 监听命令，description 设置命令的描述，option 是设置命令的可选参数，比如这里设置了 `--force`，意思就是是否强制覆盖目录，这个参数是可选的。所以 `--help`，`--version` 其实也是参数。action 就是这个命令真正的执行的方法，这里我们定义了一个 `create` 函数，该方法最后就会执行这个函数，在这个函数中我们去执行一系列的包括询问用户、添加 loading、下载模板等操作。  

`program.parse(process.argv);` 是固定写法，在最后执行，就是将 process.argv 传递给 parse，parse 会解析用户在终端输入的一切命令还有参数，并进行执行。

来看完整版：

```
const runner = () => {  program.name(chalk.cyan('demo')).usage(`${chalk.yellow('<command>')} [options]`);  program.version(    `\r\n  ${chalk.cyan.bold(VERSION)}    ${chalk.cyan.bold(BRAND_LOGO)}`  );  program    .command('create <project-name>') // 这里不能使用 chalk    .description(chalk.cyan('创建新项目'))    .option('-f, --force', chalk.red('如果目录已存在将覆盖原目录，请谨慎使用，这会先删除你已存在的项目再进行创建，可能会存在意外情况'))    .action(() => {      // 执行操作    });  program.on("--help", function () {    console.log(`\r\n终端执行 ${chalk.cyan.bold("xwg <command> --help")} 获取更多命令详情\r\n`);  });  program.parse(process.argv);};
```

inquirer
--------

具体配置参见官方文档：www.npmjs.com/package/inq…[4]

贴太多代码影响阅读体验，想看具体实现细节和类型定义的可以去看源码。

```
import Inquirer from 'inquirer';export const prompt = async (prompts: any[]) => {  return await new Inquirer.prompt(prompts);};/** 询问要创建的项目类型 */export const askCreateType = async () => {  const { projectType } = await prompt([    // 返回值为 Promise    // 具体配置参见：https://www.npmjs.com/package/inquirer#questions    {      type: "list",      name: "projectType",      message: "请选择你要创建的项目类型",      choices: [        { name: "vue", value: 'vue' },        { name: "react", value: 'react' },        { name: "uniapp", value: 'uniapp' },        { name: "koa", value: 'koa' },        // { name: "nest", value: 'nest' },        { name: "library", value: 'library' },      ],    },  ]);  return projectType;};
```

ora
---

```
import ora from "ora";import chalk from "chalk";const spinner = ora('loading');spinner.start(); // 开启加载spinner.succeed('成功');spinner.fail("请求失败，正在重试...");
```

download-git-repo
-----------------

在网上看到其他文章说该库不支持 Promise，需要 util 模块 promisify 一下：

```
import util from 'node:util';import download from 'download-git-repo';export const downloadGitRepo = util.promisify(download);// 下面是伪代码downloadGitRepo(`direct: 仓库地址`, 存放的目标地址, { clone: true })
```

一些前置知识  

node_modules 的 bin 目录
---------------------

我们下载的一些 cli 工具，会放在 `node_modules` 下一个 `.bin` 的目录中。虽然其文件没有后缀，但其实就是 js 文件，它会去找对应的代码执行，下面是 bin 目录下 nodemon 命令的文件内容：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVic3ytx6j1wRExQLWFzeg007paOz57iaAp6OTKRxnNzBpb8m7sFBvP22g/640?wx_fmt=other)image.png

当我们执行命令时 node 会从这个目录中找到我们要执行的命令。那为什么这些包会在这里生成一个命令文件呢？主要是因为可以在 `package.json` 中配置字段 `bin`：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVBO6CUaz9MyPC3TyOicXNosoW6ShJz1qYS4IAwBKdPmXUM0Veb4zA9vg/640?wx_fmt=other)image.png

我们这里配置一个命令 `xwg`，它在执行时会去寻找 `bin` 文件夹下的 `cli.js` 文件进行执行。这也就是为什么我的包名是 `xwg-cli`，但是我却可以通过 `xwg` 来执行命令。我们还可以创建多个，不同的命令对应不同的执行文件：

```
"bin": {  "xwg": "./bin/cli.js",  "ikun": "./bin/ikun.js"},
```

必要的注释
-----

接下来也是一个非常重要的点：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVjEJoZx8CZz3fBBGHdtDYKHDsy48ic7NnicPEap7pJH48MlTw9dojsj4A/640?wx_fmt=other)image.png

可以看到，在 `cli.js` 的首行，有一行注释：`#! /usr/bin/env node`。这个注释可不是多余，所有的 node cli 必须在开头包含此注释，否则命令就没法正常运行，这句注释就是指该命令在 node 环境下运行，所以请务必不要省略此注释！

本地测试
----

我们可以现在 `bin/cli.js` 下随便写点什么：

```
#! /usr/bin/env nodeconsole.log('跑起来了')
```

基于当前项目打开你的终端，运行 npm link，链接你的本地包，此时我们终端运行 `xwg` 试试：  

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVGbGJq2bPzoDXCIEUiauVp9TZu5mibv8wchu2aYdf7BKr8S7IOHicB1icmw/640?wx_fmt=other)image.png

如果没有权限请记得给你的项目赋予管理员权限。

工程化配置
=====

tsconfig.json
-------------

`noEmit` 必须是 false，否则 tsc 编译后不输出文件。

`include` 必须包含 `types/**/*`，否则在 types 下的声明不起效果。

```
{  "compilerOptions": {    "target": "ESNext",    "useDefineForClassFields": true,    "module": "ESNext",    "lib": ["ESNext", "DOM"],    "moduleResolution": "Node",    "strict": true,    "sourceMap": false,    "resolveJsonModule": true,    "isolatedModules": false,    "esModuleInterop": true,    "noEmit": false,    "noUnusedLocals": true,    "noUnusedParameters": true,    "noImplicitReturns": true,    "skipLibCheck": true  },  "include": ["src", "types/**/*"]}
```

nodemon
-------

由于每次更改都要重新执行一遍 `node ./lib/index.js` 过于麻烦，所以需要借助于 nodemon。

下载 nodemon：`yarn add nodemon \-D`。

新建 `nodemon.json`：

```
{  "watch": ["src"], // 监听 src 目录  "ext": "ts", // 匹配扩展名为 ts 的文件  "exec": "rimraf lib && tsc --outDir lib --module CommonJS"}
```

`watch`：监听 src 目录。

`ext`：匹配扩展名为 ts 的文件。

`exec`：rimraf 是一个 npm 包，作用是删除目录文件，优点是跨平台兼容性好。该命令的意义是：tsc 编译 src 下的 ts 文件并制定输出目录为 lib (`--outDir lib`)，并指定编译目标的模块化规范是 commonjs（`--module CommonJS`）。

因为有 `nodemon.json` 的配置文件，我们在 `package.json` 中可以简写：

```
"scripts": {  "dev": "nodemon",},
```

每次我们执行 `npm run dev` 实际上就是执行 nodemon，nodemon 会寻找 `nodemon.json` 并执行里面的配置，每次当我们修改 src 的 ts 文件它就会删除 lib 并帮助我们重新 tsc 编译一遍。  

文件目录结构
======

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVQFGprLllbjYHhawpzBHpcZl8cmD4awlERXxFMemzlGFeR5Uuv1bzQw/640?wx_fmt=other)image.png

*   bin 文件我们存放命令的执行入口
    
*   lib 的代码是 src 经过 tsc 编译为 commonjs 的代码
    
*   src 是我们编写核心代码的地方
    
*   test 用于存放单元测试
    
*   types 用于存放 ts 类型声明
    
*   .editorconfig 编辑器配置
    
*   .eslintignore eslint 忽略文件
    
*   .eslintrc eslint 配置文件
    
*   commitlin.config.js commit 提交信息校验的配置文件，commit message 不对会报错
    
*   nodemon.json 配置 nodemon，帮助我们保存代码后热更新，不用再执行 `node lib/index.js`
    
*   tsconfig.json ts 配置文件
    

bin/cli.js
----------

```
#! /usr/bin/env node/** * xwg cli * @author xiwenge <1825744594@qq.com> * @create 2023/06/24 */'use strict';const runner = require('../lib/index').default;runner();
```

不建议把大量的代码堆在 bin 目录下，可能很多教程会这么做，但是这样拆分代码不太简洁美观。我们将所有核心代码放入 lib 目录下，从 lib 引入核心代码来进行运行。

在这里我们引入 runner 函数进行执行。

src/index.ts
------------

```
import runner from './runner';export default runner;
```

src/runner.ts
-------------

这里，我们把 command 相关的代码拆出去。

```
import { program } from 'commander';import chalk from 'chalk';import {  create} from './commands';import { BRAND_LOGO, VERSION } from './const';const runner = () => {  program.name(chalk.cyan('xwg')).usage(`${chalk.yellow('<command>')} [options]`);  program.version(    `\r\n  ${chalk.cyan.bold(VERSION)}    ${chalk.cyan.bold(BRAND_LOGO)}`  );  create();  program.on("--help", function () {    console.log(`\r\n终端执行 ${chalk.cyan.bold("xwg <command> --help")} 获取更多命令详情\r\n`);  });  program.parse(process.argv);};export default runner;
```

src/const.ts
------------

此目录用于存放我们需要使用到的静态变量。这种艺术字可以访问 ascii 艺术字 [5]，我们这里使用的字体是 `ANSI Shadow`。

```
/** * 静态变量 * @author xiwenge <1825744594@qq.com> * @create 2023/06/25 */import fs from 'fs-extra';import path from 'node:path';import util from 'node:util';import download from 'download-git-repo';/** 当前根目录 */export const ROOT_DIR = path.resolve(__dirname, '../');const { version } = fs.readJSONSync(path.resolve(ROOT_DIR, 'package.json'));/** https://tooltt.com/art-ascii/ font: ANSI Shadow */export const BRAND_LOGO = `  ██╗  ██╗██╗    ██╗ ██████╗      ██████╗██╗     ██╗  ╚██╗██╔╝██║    ██║██╔════╝     ██╔════╝██║     ██║  ╚███╔╝ ██║ █╗ ██║██║  ███╗    ██║     ██║     ██║  ██╔██╗ ██║███╗██║██║   ██║    ██║     ██║     ██║  ██╔╝ ██╗╚███╔███╔╝╚██████╔╝    ╚██████╗███████╗██║  ╚═╝  ╚═╝ ╚══╝╚══╝  ╚═════╝      ╚═════╝╚══════╝╚═╝`;/** 当前版本号 */export const VERSION = version;export const getRepoURL = (tag: string) => {  return `https://gitee.com/redstone-1/${tag}.git`;};export const downloadGitRepo = util.promisify(download);
```

封装 loading 和 prompt

loading
-------

```
import ora from "ora";import chalk from "chalk";import { LoadingOther } from '../types';/** * 睡觉函数 * @param {Number} delay 睡眠时间 */const sleep = (delay: number) => {  return new Promise((resolve) => {    setTimeout(() => {      resolve(false);    }, delay);  });};/** * 加载中方法 * @param message - 提示信息 * @param callback - 执行的回调 * @param projectName - 项目名 * @returns */export const loading = async (message: string, callback: () => any, other: LoadingOther): Promise<any> => {  const spinner = ora(message);  spinner.start(); // 开启加载  try {    const res = await callback();    // 加载成功    spinner.succeed(      `${chalk.black.bold('下载成功！执行以下命令打开并运行项目:')}      \r\n  ${chalk.gray.bold(`cd ${other?.projectName}`)}      \r\n  ${chalk.gray.bold('npm install')}      \r\n  ${chalk.gray.bold('npm run dev')}      \r\n  ${chalk.gray.bold('问题、意见、建议请反馈至：https://github.com/Redstone-1/xwg-cli/issues')}      `    );    return res;  } catch (error) {    // 加载失败    spinner.fail("请求失败，正在重试...");    await sleep(1000);    // 重新拉取    return loading(message, callback, other);  }};
```

prompt

```
import Inquirer from 'inquirer';export default async (prompts: any[]) => {  return await new Inquirer.prompt(prompts);};
```

askUser.ts
----------

将所有询问用户的操作都封装在此，这里仅贴出示例：

```
import prompt from "../../utils/prompt";// ========== library ==========/** 询问要创建的项目类型 */export const askCreateType = async () => {  const { projectType } = await prompt([    // 返回值为 Promise    // 具体配置参见：https://www.npmjs.com/package/inquirer#questions    {      type: "list",      name: "projectType",      message: "请选择你要创建的项目类型",      choices: [        { name: "vue", value: 'vue' },        { name: "react", value: 'react' },        { name: "uniapp", value: 'uniapp' },        { name: "koa", value: 'koa' },        // { name: "nest", value: 'nest' },        { name: "library", value: 'library' },      ],    },  ]);  return projectType;};...
```

create 命令  

新建 commands 目录存放各类命令
--------------------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVP44B1a8STag3DP8mpKv822dpYPDZuaxok9wIF6iaDhGBoDvSeicwN08A/640?wx_fmt=other)image.png

拆分 action
---------

将 action 的回调函数 create 拆分出去：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoHv7VAkkdKFwGdHWXmfYBVePJF0tYfpziaKddMWCBHW2ICOmp0LcWcSJiba7IGiapyvtB1CQMB2ibPjg/640?wx_fmt=other)image.png

create.ts
---------

这里主要做了一件事，判断要创建的项目目录名是否存在，分别走入不同的分支逻辑：

```
import path from 'path';import fs from 'fs-extra';import dirExistCall from './dirExistCall';import downloadRepo from './downloadRepo';/** * 创建新项目 * @param projectName - 项目名 * @param options - 命令参数 */export default async (projectName: string, options: any) => {  // 获取当前工作目录  const cwd = process.cwd();  // 拼接得到项目目录  const targetDirectory = path.join(cwd, projectName);  // 判断目录是否存在  if (fs.existsSync(targetDirectory)) {    await dirExistCall(options, projectName, targetDirectory);  } else {    await downloadRepo(projectName, targetDirectory);  }};
```

dirExistCall.ts

当目录已经存在时，需要询问用户是否覆盖。

```
import fs from "fs-extra";import downloadRepo from './downloadRepo';import { askOverwrite } from './askUser';/** * 如果目录已经存在时调用 * @param options - 命令参数 * @param targetDirectory - 目标路径 */export default async (options: any, projectName: string, targetDirectory: string) => {  // 判断是否使用 --force 参数  if (options.force) {    // 删除重名目录    await fs.remove(targetDirectory);    await downloadRepo(projectName, targetDirectory);  } else {    const { isOverwrite } = await askOverwrite();    // 选择 Overwirte    if (isOverwrite) {      // 先删除掉原有重名目录      await fs.remove(targetDirectory);      await downloadRepo(projectName, targetDirectory);    }  }};
```

*     
    

downloadRepo.ts
---------------

当用户将所有的选择都确认后执行下载模板的操作。下面给出部分代码示例，请从下往上阅读：

```
import {  askCreateType,  askNeedTypeScript,  askIsAgreeCli,  askVueVersion,  askNeedUviewUI,} from "./askUser";import { loading } from "../../utils/loading";import { getRepoURL, downloadGitRepo } from "../../const";import { TProjectType } from '../../types';import chalk from "chalk";/** * 下载 vue 模板 * @param projectName - 项目名称 * @param targetDirectory - 目标存储路径 */const downloadVueTemplate = async (projectName: string, targetDirectory: string) => {  let repoURL = '';  const needTypeScript = await askNeedTypeScript();  if (needTypeScript) {    repoURL = getRepoURL('vue-template-typescript');  }  if (!needTypeScript) {    repoURL = getRepoURL('vue-template');  }  await loading('正在下载模板，请稍后...', () => downloadGitRepo(`direct:${repoURL}`, targetDirectory, { clone: true }), { projectName });};/** * 执行创建命令 * @param projectType - 项目类型 "library" | "react" | "vue" | "uniapp" | "koa" | nest"" * @param projectName - 项目名称 * @param targetDirectory - 目标存储路径 */const execCreate = async (projectType: TProjectType, projectName: string, targetDirectory: string) => {  switch (projectType) {    case 'library':      await downloadLibraryTemplate(projectName, targetDirectory);      break;    case 'vue':      await downloadVueTemplate(projectName, targetDirectory);      break;    case 'react':      await downloadReactTemplate(projectName, targetDirectory);      break;    case 'uniapp':      await downloadUniappTemplate(projectName, targetDirectory);      break;    case 'koa':      await downloadKoaTemplate(projectName, targetDirectory);      break;    case 'nest':      console.log(chalk.gray.bold(`\r\n  开发中，敬请期待...\r\n`));      break;  }};/** * 创建项目 * @param projectName - 项目名称 * @param targetDirectory - 目标存储路径 */export default async (projectName: string, targetDirectory: string) => {  console.log(chalk.red.bold(`\r\n  请注意：本 cli 下大部分模板采用 vite 构建，node 版本需要 14.18+ 或 16+ 或更高\r\n`));  const projectType = await askCreateType();  await execCreate(projectType, projectName, targetDirectory);};
```

到这里我们就完成了 create 命令，现在执行 `xwg create xxx` 就可以创建项目了。

写在最后
====

贴了太多代码看起来可能不是很顺畅，建议直接去看源码，更能快速上手学习。

在其他的一些高级 cli 教程里，使用 babel 进行各种配置文件的生成和写入，这是更高级的内容，暂时做不了。目前比较呆的处理方式是写一堆模板，不同的配置下载不同的模板。引入 babel 可以减少模板仓库数量，根据用户的选择动态的删除、插入各种文件，具备更强大更灵活的处理能力，但是目前不具备 babel 的运用能力，后续再考虑进行升级。若有愿意共建的朋友，欢迎 Pr。

关于本文  

作者：北岛贰  

=========

https://juejin.cn/post/7256702654579310652

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持！

```
最后不要忘了点赞呦！




```