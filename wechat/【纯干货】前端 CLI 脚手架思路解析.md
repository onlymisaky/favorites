> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Rfov1ZMwS2g_2p-aOMEHbQ)

作者：左撇峰子，原文链接：https://juejin.im/post/6879265583205089287

为什么要自己搞脚手架
----------

在实际的开发过程中，我们经常用别人开发的脚手架，以节约搭建项目的时间。但是，当 npm 没有自己中意的脚手架时，我们不得不自己动手，此时学会开发前端 CLI 脚手架的技能就显得非常重要。搭建一个符合大众化的脚手架能使自己在项目经验上加个分哦！

什么时候需要脚手架
---------

其实很多时候从 0 开始搭建的项目都可以做成模板，而脚手架的主要核心功能就是利用模板来快速搭建一个完整的项目结构，后续我们只需在这上面进行开发就可以了。

入门需知
----

下面我们以创建 js 插件项目的脚手架来加深我们对前端脚手架的认知。  
在此之前，我们先把需要用到的依赖库熟悉一下（点击对应库名跳转到对应文档）：

*   chalk[1] （控制台字符样式）
    
*   commander[2] （实现 NodeJS 命令行）
    
*   download[3] （实现文件远程下载）
    
*   fs-extra[4] （增强的基础文件操作库）
    
*   handlebars[5] （实现模板字符替换）
    
*   inquirer[6] （实现命令行之间的交互）
    
*   log-symbols[7] （为各种日志级别提供着色符号）
    
*   ora[8] （优雅终端 Spinner 等待动画）
    
*   update-notifier[9] （npm 在线检查更新）
    

功能策划
----

我们先用思维导图来策划一下我们的脚手架需要有哪些主要命令：init（初始化模板）、template（下载模板）、mirror（切换镜像）、upgrade（检查更新），相关导图如下：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6klhngOichF1UiafYX6t8lnGUYB4aMKVHzPGKJwp9glmKDzt6rdSDEEhw/640?wx_fmt=png)

开始动手
----

新建一个名为 js-plugin-cli 的文件夹后打开，执行 `npm init -y` 快速初始化一个 `package.json`，然后根据下面创建对应的文件结构：

```
js-plugin-cli
├─ .gitignore
├─ .npmignore
├─ .prettierrc
├─ LICENSE
├─ README.md
├─ bin
│  └─ index.js
├─ lib
│  ├─ init.js
│  ├─ config.js
│  ├─ download.js
│  ├─ mirror.js
│  └─ update.js
└─ package.json
复制代码
```

其中 .gitignore、.npmignore、.prettierrc、LICENSE、README.md 是额外附属文件（非必须），但这里推荐创建好它们，相关内容根据自己习惯设定就行。在项目里打开终端，先把需要的依赖装上，后续可以直接调用。

```
yarn add -D chalk commander download fs-extra handlebars inquirer log-symbols ora update-notifier复制代码
```

注册指令
----

当我们要运行调试脚手架时，通常执行 `node ./bin/index.js` 命令，但我还是习惯使用注册对应的指令，像 `vue init webpack demo` 的 `vue` 就是脚手架指令，其他命令行也要由它开头。打开 `package.json` 文件，先注册下指令：

```
"main": "./bin/index.js","bin": {  "js-plugin-cli": "./bin/index.js"}
```

`main` 中指向入口文件 `bin/index.js`，而 `bin` 下的 `js-plugin-cli` 就是我们注册的指令，你可以设置你自己想要的名称（尽量简洁）。

万物皆 - v
-------

我们先编写基础代码，让 `js-plugin-cli -v` 这个命令能够在终端打印出来。  
打开 `bin/index.js` 文件，编写以下代码 ：

```
#!/usr/bin/env node// 请求 commander 库const program = require('commander')// 从 package.json 文件中请求 version 字段的值，-v和--version是参数program.version(require('../package.json').version, '-v, --version')// 解析命令行参数program.parse(process.argv)
```

其中 `#!/usr/bin/env node` （固定第一行）必加，主要是让系统看到这一行的时候，会沿着对应路径查找 node 并执行。调试阶段时，为了保证 `js-plugin-cli` 指令可用，我们需要在项目下执行 `npm link`（不需要指令时用 `npm unlink` 断开），然后打开终端，输入以下命令并回车：

```
js-plugin-cli -v
```

此时，应该返回版本号 `1.0.0`，如图：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6BfGic7WhZTiam2BsX4IYt1X0zf8icLfG8F7tunhn8qbJRTlhJzRW0vMPw/640?wx_fmt=png)接下来我们将开始写逻辑代码，为了维护方便，我们将在 `lib` 文件夹下分模块编写，然后在 `bin/index.js` 引用。

upgrade 检查更新
------------

打开 `lib/update.js` 文件，编写以下代码 ：

```
// 引用 update-notifier 库，用于检查更新const updateNotifier = require('update-notifier')// 引用 chalk 库，用于控制台字符样式const chalk = require('chalk')// 引入 package.json 文件，用于 update-notifier 库读取相关信息const pkg = require('../package.json')// updateNotifier 是 update-notifier 的方法，其他方法可到 npmjs 查看const notifier = updateNotifier({  // 从 package.json 获取 name 和 version 进行查询  pkg,  // 设定检查更新周期，默认为 1000 * 60 * 60 * 24（1 天）  // 这里设定为 1000 毫秒（1秒）  updateCheckInterval: 1000,})function updateChk() {  // 当检测到版本时，notifier.update 会返回 Object  // 此时可以用 notifier.update.latest 获取最新版本号  if (notifier.update) {    console.log(`New version available: ${chalk.cyan(notifier.update.latest)}, it's recommended that you update before using.`)    notifier.notify()  } else {    console.log('No new version is available.')  }}// 将上面的 updateChk() 方法导出module.exports = updateChk
```

这里需要说明两点：`updateCheckInterval` 默认是 `1` 天，也就意味着今天检测更新了一次，下一次能进行检测更新的时间点应该为明天同这个时间点之后，否则周期内检测更新都会转到 `No new version is available.`。  
举个栗子：我今天 10 点的时候检查更新了一次，提示有新版本可用，然后我下午 4 点再检查一次，此时将不会再提示有新版本可用，只能等到明天 10 点过后再检测更新才会重新提示新版本可用。因此，将 `updateCheckInterval` 设置为 `1000` 毫秒，就能使每次检测更新保持最新状态。  
另外，`update-notifier` 检测更新机制是通过 `package.json` 文件的 `name` 字段值和 `version` 字段值来进行校验：它通过 `name` 字段值从 npmjs 获取库的最新版本号，然后再跟本地库的 `version` 字段值进行比对，如果本地库的版本号低于 npmjs 上最新版本号，则会有相关的更新提示。  
当然，此时我们还需要把 `upgrade` 命令声明一下，打开 `bin/index.js` 文件，在合适的位置添加以下代码：

```
// 请求 lib/update.jsconst updateChk = require('../lib/update')// upgrade 检测更新program  // 声明的命令  .command('upgrade')  // 描述信息，在帮助信息时显示  .description("Check the js-plugin-cli version.")  .action(() => {    // 执行 lib/update.js 里面的操作    updateChk()  })
```

添加后的代码应该如图所示：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6JvhGujwW55YobM5RytUdbLrMnxUYyldnnriaibxoyxAev81wAFia72cQg/640?wx_fmt=png)记得把 `program.parse(process.argv)` 放到最后就行。添加好代码后，打开控制台，输入命令 `js-plugin-cli upgrade` 查看效果：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6iatpNicQsKYDOveVb3qia3BIZMJKsyaQOa8Yfn6Y898mj6Idbc3jXz2YA/640?wx_fmt=png)为了测试效果，我将本地库 `js-plugin-cli` 下 `package.json` 的 `name` 改为 `vuepress-creator`，`version` 默认为 `1.0.0`，而 npmjs 上 `vuepress-creator` 脚手架最新版本为 2.x，因此会有更新的提示。

mirror 切换镜像链接
-------------

我们通常会把模板放 Github 上，但是在国内从 Github 下载模板不是一般的慢，所以我考虑将模板放 Vercel 上，但是为了避免一些地区的用户因网络问题不能正常下载模板的问题，我们需要将模板链接变成可定义的，然后用户就可以自定义模板链接，更改为他们自己觉得稳定的镜像托管平台上，甚至还可以把模板下载下来，放到他们自己服务器上维护。  
为了能够记录切换后的镜像链接，我们需要在本地创建 config.json 文件来保存相关信息，当然不是由我们手动创建，而是让脚手架来创建，整个逻辑过程如下：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6Sce4MKdvk6vLPo92dUXfXzxzXwFpghgLoAXziaKyJtkJHJK9sKWLong/640?wx_fmt=png)所以我们还需要在 `lib` 文件夹下创建 `config.js` 文件，用于生成默认配置文件。  
打开 `lib/config.js` 文件，添加以下代码：

```
// 请求 fs-extra 库const fse = require('fs-extra')const path = require('path')// 声明配置文件内容const jsonConfig = {  "name": "js-plugin-cli",  "mirror": "https://zpfz.vercel.app/download/files/frontend/tpl/js-plugin-cli/"}// 拼接 config.json 完整路径const configPath = path.resolve(__dirname, '../config.json')async function defConfig() {  try {    // 利用 fs-extra 封装的方法，将 jsonConfig 内容保存成 json 文件    await fse.outputJson(configPath, jsonConfig)  } catch (err) {    console.error(err)    process.exit()  }}// 将上面的 defConfig() 方法导出module.exports = defConfig
```

这里需要注意的是，我们不要再直接去用内置的 `fs` 库，推荐使用增强库 `fs-extra`，`fs-extra` 除了封装原有基础文件操作方法外，还有方便的 json 文件读写方法。  
打开 `lib/mirror.js` 文件，添加以下代码：

```
// 请求 log-symbols 库const symbols = require('log-symbols')// 请求 fs-extra 库const fse = require('fs-extra')const path = require('path')// 请求 config.js 文件const defConfig = require('./config')// 拼接 config.json 完整路径const cfgPath = path.resolve(__dirname, '../config.json')async function setMirror(link) {  // 判断 config.json 文件是否存在  const exists = await fse.pathExists(cfgPath)  if (exists) {    // 存在时直接写入配置    mirrorAction(link)  } else {    // 不存在时先初始化配置，然后再写入配置    await defConfig()    mirrorAction(link)  }}async function mirrorAction(link) {  try {    // 读取 config.json 文件    const jsonConfig = await fse.readJson(cfgPath)    // 将传进来的参数 link 写入 config.json 文件    jsonConfig.mirror = link    // 再写入 config.json 文件    await fse.writeJson(cfgPath, jsonConfig)    // 等待写入后再提示配置成功    console.log(symbols.success, 'Set the mirror successful.')  } catch (err) {    // 如果出错，提示报错信息    console.log(symbols.error, chalk.red(`Set the mirror failed. ${err}`))    process.exit()  }}// 将上面的 setMirror(link) 方法导出module.exports = setMirror
```

需要注意的是 `async` 和 `await`，这里用的是 Async/Await 的写法，其他相关写法可参照 fs-extra[10] 。`async` 一般默认放函数前面，而 `await` 看情况添加，举个例子：

```
...const jsonConfig = await fse.readJson(cfgPath)jsonConfig.mirror = linkawait fse.writeJson(cfgPath, jsonConfig)console.log(symbols.success, 'Set the mirror successful.')...
```

我们需要等待 fs-extra 读取完，才可以进行下一步，如果不等待，就会继续执行 `jsonConfig.mirror = link` 语句，就会导致传入的 json 结构发生变化。再比如 `await fse.writeJson(cfgPath, jsonConfig)` 这句，如果去掉 `await`，将意味着还在写入 json 数据（假设写入数据需要花 1 分钟）时，就已经继续执行下一个语句，也就是提示 `Set the mirror successful.`，但实际上写入文件不会那么久，就算去掉 `await`，也不能明显看出先后执行关系。老规矩，我们还需要把 `mirror` 命令声明一下，打开 `bin/index.js` 文件，在合适的位置添加以下代码：

```
// 请求 lib/mirror.jsconst setMirror = require('../lib/mirror')// mirror 切换镜像链接program  .command('mirror <template_mirror>')  .description("Set the template mirror.")  .action((tplMirror) => {    setMirror(tplMirror)  })
```

打开控制台，输入命令 `js-plugin-cli mirror 你的镜像链接` 查看效果：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6gPlO65uZAwzKjv0bKf9NXwal7vc6n0Wt5OgiakYobicoXhLzB0XtIIIw/640?wx_fmt=png)此时，在项目下应该已经生成 config.json 文件，里面相关内容应该为：

```
{  "name": "js-plugin-cli",  "mirror": "https://zpfz.vercel.app/download/files/frontend/tpl/js-plugin-cli/"}
```

download 下载 / 更新模板
------------------

网络上很多教程在谈及脚手架下载模板时都会选择 `download-git-repo` 库，但是这里我选择 `download` 库，因为利用它可以实现更自由的下载方式，毕竟 `download-git-repo` 库主要还是针对 Github 等平台的下载，而 `download` 库可以下载任何链接的资源，甚至还有强大的解压功能（无需再安装其他解压库）。  
在此之前，我们得先明白 `lib/download.js` 需要执行哪些逻辑：下载 / 更新模板应属于强制机制，也就是说，不管用户本地是否有模板存在，`lib/download.js` 都会下载并覆盖原有文件，以保持模板的最新状态，相关逻辑图示如下：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6wHHbP5QQck6Le9rNMzPDfibM5s54eOhLa0v4ju7xdU3OFFDIKbibfjiag/640?wx_fmt=png)打开 `lib/download.js` 文件，添加以下代码：

```
// 请求 download 库，用于下载模板const download = require('download')// 请求 ora 库，用于实现等待动画const ora = require('ora')// 请求 chalk 库，用于实现控制台字符样式const chalk = require('chalk')// 请求 fs-extra 库，用于文件操作const fse = require('fs-extra')const path = require('path')// 请求 config.js 文件const defConfig = require('./config')// 拼接 config.json 完整路径const cfgPath = path.resolve(__dirname, '../config.json')// 拼接 template 模板文件夹完整路径const tplPath = path.resolve(__dirname, '../template')async function dlTemplate() {  // 参考上方 mirror.js 主代码注释  const exists = await fse.pathExists(cfgPath)  if (exists) {    // 这里记得加 await，在 init.js 调用时使用 async/await 生效    await dlAction()  } else {    await defConfig()    // 同上    await dlAction()  }}async function dlAction() {  // 清空模板文件夹的相关内容，用法见 fs-extra 的 README.md  try {    await fse.remove(tplPath)  } catch (err) {    console.error(err)    process.exit()  }  // 读取配置，用于获取镜像链接  const jsonConfig = await fse.readJson(cfgPath)  // Spinner 初始设置  const dlSpinner = ora(chalk.cyan('Downloading template...'))  // 开始执行等待动画  dlSpinner.start()  try {    // 下载模板后解压    await download(jsonConfig.mirror + 'template.zip', path.resolve(__dirname, '../template/'), {      extract: true    });  } catch (err) {    // 下载失败时提示    dlSpinner.text = chalk.red(`Download template failed. ${err}`)    // 终止等待动画并显示 X 标志    dlSpinner.fail()    process.exit()  }  // 下载成功时提示  dlSpinner.text = 'Download template successful.'  // 终止等待动画并显示 ✔ 标志  dlSpinner.succeed()}// 将上面的 dlTemplate() 方法导出module.exports = dlTemplate
```

我们先用 `fse.remove()` 清空模板文件夹的内容（不考虑模板文件夹存在与否，因为文件夹不存在不会报错），然后执行等待动画并请求下载，模板文件名固定为 `template.zip`，`download` 语句里的 `extract:true` 表示开启解压。  
上述代码有两处加了 `process.exit()`，意味着将强制进程尽快退出（有点类似 return 的作用，只不过 `process.exit()` 结束的是整个进程），哪怕还有未完全完成的异步操作。  
就比如说第二个 `process.exit()` 吧，当你镜像链接处于 404 或者其他状态，它会返回你相应的报错信息并退出进程，就不会继续执行下面 `dlSpinner.text` 语句了。  
我们还需要把 `template` 命令声明一下，打开 `bin/index.js` 文件，在合适的位置添加以下代码：

```
// 请求 lib/download.jsconst dlTemplate = require('../lib/download')// template 下载/更新模板program  .command('template')  .description("Download template from mirror.")  .action(() => {    dlTemplate()  })
```

打开控制台，输入命令 `js-plugin-cli template` 查看效果：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6vREzAdG4SSicDViaZRC4cuoxqiafD5zHYG5kJzGaWwbaIPl5iaE8RVBceA/640?wx_fmt=png)上图直接报错返回，提示 404 Not Found，那是因为我还没把模板文件上传到服务器上。等把模板上传后就能正确显示了。

init 初始化项目
----------

接下来是咱们最主要的 init 命令，init 初始化项目涉及的逻辑比其他模板相对较多，所以放在最后解析。  
初始化项目的命令是 `js-plugin-cli init 项目名`，所以我们需要把 `项目名` 作为文件夹的名称，也是项目内 `package.json` 的 `name` 名称（只能小写，所以需要转换）。由于模板是用于开发 js 插件，也就需要抛出全局函数名称（比如 `import Antd from 'ant-design-vue'` 的 `Antd`），所以我们还需要把模板的全局函数名称抛给用户来定义，通过控制台之间的交互来实现。完成交互后，脚手架会把用户输入的内容替换到模板内容内，整个完整的逻辑导图如下：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6qKOQibQnEvRRSQkJekVfAR1AicE0mOzTibdsDdr3pRZBl2ib4DibKxibG5ibw/640?wx_fmt=png)打开 `lib/init.js` 文件，添加以下代码：

```
// 请求 fs-extra 库，用于文件操作const fse = require('fs-extra')// 请求 ora 库，用于初始化项目时等待动画const ora = require('ora')// 请求 chalk 库const chalk = require('chalk')// 请求 log-symbols 库const symbols = require('log-symbols')// 请求 inquirer 库，用于控制台交互const inquirer = require('inquirer')// 请求 handlebars 库，用于替换模板字符const handlebars = require('handlebars')const path = require('path')// 请求 download.js 文件，模板不在本地时执行该操作const dlTemplate = require('./download')async function initProject(projectName) {  try {    const exists = await fse.pathExists(projectName)    if (exists) {      // 项目重名时提醒用户      console.log(symbols.error, chalk.red('The project already exists.'))    } else {      // 执行控制台交互      inquirer        .prompt([{          type: 'input', // 类型，其他类型看官方文档          name: 'name', // 名称，用来索引当前 name 的值          message: 'Set a global name for javascript plugin?',          default: 'Default', // 默认值，用户不输入时用此值        }, ])        .then(async (answers) => {          // Spinner 初始设置          const initSpinner = ora(chalk.cyan('Initializing project...'))          // 开始执行等待动画          initSpinner.start()          // 拼接 template 文件夹路径          const templatePath = path.resolve(__dirname, '../template/')          // 返回 Node.js 进程的当前工作目录          const processPath = process.cwd()          // 把项目名转小写          const LCProjectName = projectName.toLowerCase()          // 拼接项目完整路径          const targetPath = `${processPath}/${LCProjectName}`          // 先判断模板路径是否存在          const exists = await fse.pathExists(templatePath)          if (!exists) {            // 不存在时，就先等待下载模板，下载完再执行下面的语句            await dlTemplate()          }          // 等待复制好模板文件到对应路径去          try {            await fse.copy(templatePath, targetPath)          } catch (err) {            console.log(symbols.error, chalk.red(`Copy template failed. ${err}`))            process.exit()          }          // 把要替换的模板字符准备好          const multiMeta = {            project_name: LCProjectName,            global_name: answers.name          }          // 把要替换的文件准备好          const multiFiles = [            `${targetPath}/package.json`,            `${targetPath}/gulpfile.js`,            `${targetPath}/test/index.html`,            `${targetPath}/src/index.js`          ]          // 用条件循环把模板字符替换到文件去          for (var i = 0; i < multiFiles.length; i++) {            // 这里记得 try {} catch {} 哦，以便出错时可以终止掉 Spinner            try {              // 等待读取文件              const multiFilesContent = await fse.readFile(multiFiles[i], 'utf8')              // 等待替换文件，handlebars.compile(原文件内容)(模板字符)              const multiFilesResult = await handlebars.compile(multiFilesContent)(multiMeta)              // 等待输出文件              await fse.outputFile(multiFiles[i], multiFilesResult)            } catch (err) {              // 如果出错，Spinner 就改变文字信息              initSpinner.text = chalk.red(`Initialize project failed. ${err}`)              // 终止等待动画并显示 X 标志              initSpinner.fail()              // 退出进程              process.exit()            }          }          // 如果成功，Spinner 就改变文字信息          initSpinner.text = 'Initialize project successful.'          // 终止等待动画并显示 ✔ 标志          initSpinner.succeed()          console.log(`            To get started:              cd ${chalk.yellow(LCProjectName)}              ${chalk.yellow('npm install')} or ${chalk.yellow('yarn install')}              ${chalk.yellow('npm run dev')} or ${chalk.yellow('yarn run dev')}          `)        })        .catch((error) => {          if (error.isTtyError) {            console.log(symbols.error, chalk.red("Prompt couldn't be rendered in the current environment."))          } else {            console.log(symbols.error, chalk.red(error))          }        })    }  } catch (err) {    console.error(err)    process.exit()  }}// 将上面的 initProject(projectName) 方法导出module.exports = initProject
```

`lib/init.js` 的代码相对较长，建议先熟悉上述的逻辑示意图，了解这么写的意图后就能明白上述的代码啦！抽主要的片段解析：  
**inquirer 取值说明**  
`inquirer.prompt` 中的字段 `name` 类似 key，当你需要获取该值时，应以 `answers.key对应值` 形式获取（`answers` 命名取决于 `.then(answers => {})`），例：

```
inquirer.prompt([{  type: 'input', // 类型，其他类型看官方文档  name: 'theme', // 名称，用来索引当前 name 的值  message: 'Pick a theme?',  default: 'Default', // 默认值，用户不输入时用此值}, ]).then(answers => {})
```

上述要获取对应值应该为 `answers.theme`。**handlebars 模板字符设置说明**  
我们事先需要把模板文件内要修改的字符串改成 `{{ 定义名称 }}` 形式，然后才能用 `handlebars.compile` 进行替换，为了保证代码可读性，我们把模板字符整成 `{ key:value }` 形式，然后 `key` 对应定义名称，`value` 对应要替换的模板字符，例：

```
const multiMeta = {  project_name: LCProjectName,  global_name: answers.name}
```

上述代码意味着模板文件内要修改的字符串改成 `{{ project_name }}` 或者 `{{ global_name }}` 形式，当被替换时，将改成后面对应的模板字符。下图是模板文件：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6T9my9ibZzia6zGFSZKicgToCAk9dWrMiaQ2aqJl8Dj6kd4uZCNTbTNASFg/640?wx_fmt=png)接下来我们把 `init` 命令声明一下，打开 `bin/index.js` 文件，在合适的位置添加以下代码：

```
// 请求 lib/init.jsconst initProject = require('../lib/init')// init 初始化项目program  .name('js-plugin-cli')  .usage('<commands> [options]')  .command('init <project_name>')  .description('Create a javascript plugin project.')  .action(project => {    initProject(project)  })
```

打开控制台，输入命令 `js-plugin-cli init 你的项目名称` 查看效果：![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6icnbkZyeQGeFaEQwfxSW4lNEFZkv1HmJTCmQJYpRn9n4SlM5A7qrTMA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/j3vcKBBdH45xoib9oNR5zF7A0AoGTibicv6QBGDmV5MZ5SrrKhbETkdqKxeKd7EQem6XjKVr4SgDqT8SwbW428kVQ/640?wx_fmt=png)这样就完成整个脚手架的搭建了~ 然后可以发布到 npm，以全局安装方式进行安装（记得 `npm unlink` 解除连接哦）。

写在最最最后
------

这篇文章花了几天时间（含写脚手架 demo 的时间）编辑的，时间比较匆赶，若在语句上表达不够明白或者错误，欢迎掘友指出哦~  
最后附上项目源码：js-plugin-cli[11] ，脚手架已经发布到 npm，欢迎小伙伴试用哦！

### 参考资料

[1]

chalk: _https://www.npmjs.com/package/chalk_

[2]

commander: _https://www.npmjs.com/package/commander_

[3]

download: _https://www.npmjs.com/package/download_

[4]

fs-extra: _https://www.npmjs.com/package/fs-extra_

[5]

handlebars: _https://www.npmjs.com/package/handlebars_

[6]

inquirer: _https://www.npmjs.com/package/inquirer_

[7]

log-symbols: _https://www.npmjs.com/package/log-symbols_

[8]

ora: _https://www.npmjs.com/package/ora_

[9]

update-notifier: _https://www.npmjs.com/package/update-notifier_

[10]

fs-extra: _https://www.npmjs.com/package/fs-extra_

[11]

js-plugin-cli: _https://github.com/zpfz/js-plugin-cli/_

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

欢迎关注「前端瓶子君」，回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持