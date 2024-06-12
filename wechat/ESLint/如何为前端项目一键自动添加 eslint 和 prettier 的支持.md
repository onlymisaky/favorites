> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iwrhNAMp_lJpSrOFUGWrLg)

本文属于源码共读第 35 期 | 为 vite 项目自动添加 eslint 和 prettier 点击了解本期详情一起参与 https://juejin.cn/post/7113563466211786783

> 前言

我之前好多次都是一步一步的安装 eslint 和 prettier 及相关依赖，一个配置文件一个配置文件的粘贴复制，并修改其中的相关配置。而且可能会在每个项目中都要去处理，如果项目工程规划化以后，eslint 和 prettier 确实是项目少不了的配置。不知道你有没有像我一样操作过呢？

那么有没有一种更简单的方式去处理呢？答案是我终于遇到了。通过若川大佬的[源码共读活动](https://mp.weixin.qq.com/s?__biz=MzA5MjQwMzQyNw==&mid=2650763595&idx=1&sn=14878a71ff9815a4e6fabf927c27f71a&chksm=886672c7bf11fbd1379e1fd9ab4c095ca1e169dff446cedf5f85b5fbedd567d596cf9aec6eae&token=1016586406&lang=zh_CN&scene=21#wechat_redirect)发现了，真的是太棒了。

本文以`vite脚手架`创建的项目为基础进行研究的，如果是其他脚手架创建的项目，那么就要自己去修改处理，但是原理是一样的。

那么接下来，我就要来一探究竟，先看看如何使用，然后查阅一下它的源码，看看它到底是如何实现的呢？

1、vite 创建项目
-----------

*   创建项目
    

```
yarn create vite
```

一顿操作以后项目就创建完毕了

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoJeOw4Lkz9wkMg1LOYQry7n0ibVx0CFJ1mjibZatpATnbUsGjez7ScAgQ/640?wx_fmt=png)image.png

*   2、安装依赖
    

```
yarn
```

*   3、运行项目
    

```
yarn dev
```

*   4、运行初始化 eslint 和 prettier 命令
    

```
yarn create vite-pretty-lint
```

先来看没有执行命令前的文件目录

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJo5eR81glKZEhzPrzaehgC0Bgr1kLtGbV2iceI2owloFIwMmicMCpqEYPQ/640?wx_fmt=png)image.png

再来看执行完命令后的文件目录

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJorKiaORWPDYTiaCajniam13FXT2f0Gd5pdU7vrBx9HXbfDQngiaXialZKWZQ/640?wx_fmt=png)image.png

可以发现文件目录中增加了 eslint 和 prettier 的相关配置，package.json 中增加了相关的依赖、以及 vite.config.xx 文件也增加了相关配置，具体的文件变更可以查看 https://github.com/lxchuan12/vite-project/commit/6cb274fded66634191532b2460dbde7e29836d2e。

一个命令干了这么多事情，真的太优秀了。接下来我们就去看看这如此优秀的源代码吧

2、整个过程的示意图
----------

通过大致的查看源代码，简单总结出来的代码执行过程示意图，仅供参考

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoon3Udicgr2aCuF3Nwwe91PwmuQ4E4Bo8KolKZguZKxaG1eUWhNIkgpQ/640?wx_fmt=png)未命名文件 (3).png

3、源码调试过程
--------

### 3.1、找到调试代码的位置

通过`package.json`中的 bin 节点可以发现，`yarn create vite-pretty-lint`最终执行的便是 lib/main.js 中的代码

```
"bin": {    "create-vite-pretty-lint": "lib/main.js"  },
```

### 3.2、 开始调试的命令

因为我们现在只是要执行`lib/main.js`这个入口文件，通过`package.json`的`scripts` 也没有发现执行命令，所以现在我们可以直接通过`node`来运行代码

```
node lib/main.js
```

调试成功的结果如下图所示

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoN60VoFyC6wTjjn2vLx8UjDkkg0IU763ia7ypiaiaarTgAHiaydjPvBpqMw/640?wx_fmt=png)企业微信截图_16564645675849.png

### 3.3、 查看头部引入的模块

*   chalk 终端多色彩输出
    

```
npm i chalkimport chalk from 'chalk'const log = console.log// 字体背景颜色设置log(chalk.bgGreen('chalk打印设置') )// 字体颜色设置log(chalk.blue('Hello') + ' World' + chalk.red('!'))// 自定义颜色const custom = chalk.hex('#F03A17')const bgCustom = chalk.bgHex('#FFFFFF')log(custom('customer'))log(bgCustom('bgCustom'))
```

执行效果如下图所示

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoge7ahX6sxa32A6xo4AaxPas22jUAduaKNtrxyNtlo16RicwAvA8NtyQ/640?wx_fmt=png)image.png

*   gradient 文字颜色渐变
    

```
// 安装npm i gradient-string// 引入import gradient  from 'gradient-string'// 使用console.log(gradient('cyan', 'pink')('你好啊赛利亚欢迎来到编码世界'));console.log(gradient('cyan', 'pink')('你好啊赛利亚欢迎来到编码世界'));console.log(gradient('cyan', 'pink')('你好啊赛利亚欢迎来到编码世界'));console.log(gradient('cyan', 'pink')('你好啊赛利亚欢迎来到编码世界'));console.log(gradient('cyan', 'pink')('你好啊赛利亚欢迎来到编码世界'));
```

执行效果如下图所示

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJotF5LNPHt9XEec0GyOl7VWaqaNsOiaV9sbjTmWAFEvoIsYWGtFicVOFYA/640?wx_fmt=png)image.png

*   child_process node.js 中的子进程。
    
    > 在 node.js 中，只有一个线程执行所有的操作，如果某个操作需要大量消耗 CPU 资源的话，后续的操作就需要等待。后来 node.js 就提供了一个`child_process`模块，通过它可以开启多个子进程，在多个子进程之间可以共享内存空间，可以通过子进程的互相通信来实现信息的交换。
    

```
import { exec } from 'child_process';exec('ls',(error, stdout,stderr)=> {    if(error) {        console.log(error)        return;    }    console.log('stdout: ' + stdout)    console.log('执行其他操作')})
```

执行效果如下图所示

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoXuXDPpYwibD8uPFViamJE1fcanaickyjSedsIziakMgf7Z7hnkI8n6G96A/640?wx_fmt=png)image.png

*   fs fs 用来操作文件的模块
    

```
import fs from 'fs'// 同步的读取方法，用来读取指定文件中的内容fs.readFileSync() // 同步的写入方法，用来向指定文件中写内容fs.writeFileSync()
```

*   path 路径分类
    

```
import path from 'path';// 拼接路径console.log(path.join('src', 'task.js'));  // src/task.js
```

*   nanospinner 命令行中的加载动画
    

```
// 安装npm i nanospinner// 引入模块import { createSpinner } from 'nanospinner';const spinner = createSpinner('Run test').start()setTimeout(() => {  spinner.success()}, 1000)
```

执行效果如下图所示（Run test 在加载的一个效果）

![](https://mmbiz.qpic.cn/mmbiz_gif/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJocJeaMaiaiaaKqBaKzICTj3gicVMgCeFGwdtljdq8ucXjrDjS2WBuGlWCw/640?wx_fmt=gif)3.gif

*   enquirer (utils.js 文件)
    

交互式询问 CLI 简单说就是交互式询问用户输入

```
npm i enquirer import enquirer from 'enquirer' let tempArray = ['major(1.0.0)','minor(0.1.0)', 'patch(0.0.4)', "customer" ]const { release } = await enquirer.prompt({    type: 'select',    name: 'release',    message: 'Select release type',    choices: tempArray})if(release === 'customer') {    console.log(release, 'customer')} else {    const targetVersion = release.match(/\((.*)\)/)[1]    console.log(targetVersion, 'targetVersion')}
```

执行效果如下图所示：先出来一个下拉选择，选择完后根据 if 判断进行输出

![](https://mmbiz.qpic.cn/mmbiz_gif/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoLE7TzpvM9vy8DpvUck0L7yWODyRgVwfKBDcukf2u0P2sBFzibF69Beg/640?wx_fmt=gif)4.gif

### 3.4、 调试具体代码

##### 3.4.1、 main.js 中的入口

```
async function run() {    // 所有的逻辑代码}run().catch((e) => {  console.error(e);});
```

通过`run`函数封装异步方法，这样最外面调用`run`函数时可以通过异步方法的`catch`捕获错误异常。

看一个小例子

```
const runTest = async () => {    console.log('Running test')    throw new Error('run test报错了')} runTest().catch(err => {    console.log('Error: ' + err)})
```

执行后打印顺序如下

```
Running testError: Error: run test报错了
```

可以发现 catch 中截获了异常

> 接下来开始进入 run 函数了

##### 3.4.2、 打印色彩字体

```
// 这个看上面的引入模块解析即可console.log(    chalk.bold(      gradient.morning('\n🚀 Welcome to Eslint & Prettier Setup for Vite!\n')    ));
```

##### 3.4.3、 交互式命令行

```
export function getOptions() {  const OPTIONS = [];  fs.readdirSync(path.join(__dirname, 'templates')).forEach((template) => {    const { name } = path.parse(path.join(__dirname, 'templates', template));    OPTIONS.push(name);  });  return OPTIONS;}export function askForProjectType() {  return enquirer.prompt([    {      type: 'select',      name: 'projectType',      message: 'What type of project do you have?',      choices: getOptions(),    },    {      type: 'select',      name: 'packageManager',      message: 'What package manager do you use?',      choices: ['npm', 'yarn'],    },  ]);}  try {    const answers = await askForProjectType();    projectType = answers.projectType;    packageManager = answers.packageManager;  } catch (error) {    console.log(chalk.blue('\n👋 Goodbye!'));    return;  }
```

`getOptions` 函数根据`fs.readdirSync`读取项目工程`template`文件夹下的所有文件，并通过`path.parse`转换对象，来获取文件名称`name`。

`askForProjectType`函数通过`enquirer.prompt`返回两个交互式命令行，供用户进行选择`projectType`选择项目类型：【react-ts】 【react】【vue-ts】 【vue】`packageManager`选择项目包管理方式：【npm】 【yarn】

##### 3.4.4、根据交互命令行返回结果进行匹配模板

假如我们上面选择的是`[vue-ts]`

```
const { packages, eslintOverrides } = await import(    `./templates/${projectType}.js`);
```

`/template/vue-ts.js`模板中的代码 (其中代码较多但一看就明白我就不贴了), 就是`export`导出了两个固定的模板变量数组，`packages`则相当于要引入的 npm 模块列表，eslintOverrides 这算是`.eslintrc.json`初始化模板。

##### 3.4.5、拼接变量数组

```
const packageList = [...commonPackages, ...packages];const eslintConfigOverrides = [...eslintConfig.overrides, ...eslintOverrides];const eslint = { ...eslintConfig, overrides: eslintConfigOverrides };
```

`commonPackages`是`shared.js`中预定义的公共的 npm 模块`eslint`则是通过公共 npm 模块中的`eslintConfig`和上面选择的`template/xxxx.js`中的进行拼接组成。

##### 3.4.6、 生成安装依赖包的命令

```
const commandMap = {    npm: `npm install --save-dev ${packageList.join(' ')}`,    yarn: `yarn add --dev ${packageList.join(' ')}`,};
```

将`packageList`数组通过 join 转换为字符串，通过命令将所有拼接 npm 模块一起安装

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoxQqIR43A3xlsJ28vUsmrCjpciaOibAL23M5tBTBtKXa8gDRCQbqjTCAQ/640?wx_fmt=png)image.png

##### 3.4.7、 读取项目的 vite 配置文件

```
const projectDirectory = process.cwd();    const viteJs = path.join(projectDirectory, 'vite.config.js');  const viteTs = path.join(projectDirectory, 'vite.config.ts');  const viteMap = {    vue: viteJs,    react: viteJs,    'vue-ts': viteTs,    'react-ts': viteTs,  };  const viteFile = viteMap[projectType];  const viteConfig = viteEslint(fs.readFileSync(viteFile, 'utf8'));  const installCommand = commandMap[packageManager];  if (!installCommand) {    console.log(chalk.red('\n✖ Sorry, we only support npm and yarn!'));    return;  }
```

根据选择的项目类型，来拼接 vite.config 的路径，并读取项目中的 vite.config 配置文件

上面用到了一个函数`viteEslint`, 这个具体的实现可以去看`shared.js`中，主要就是读取文件内容后，传入的参数 code，就是`vite.config.ts`中的所有字符

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJo9LNrVIcHBInyAHMYnGaicT4CI5J6ZXTwM3HEiaxQyCEH827EwFwdbSdg/640?wx_fmt=png)通过 babel 的`parseSync`转换为 ast。ast 对象如下图所示

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoVZqzwa75lc88b2XhATkibQkvjlvf1aP4kAiceN2D8P0xWT5TnLo9goRA/640?wx_fmt=png)1656558646620.png

对 ast 数据进行了一系列的处理后，再通过`babel`的`transformFromAstSync`将 ast 转换为代码字符串。

> 对于 babel 处理这一块我也不太了解，有时间我得去加一下餐，具体的可以参考 https://juejin.cn/post/6844904008679686152

##### 3.4.8 执行命令、执行完将 eslint 和 prettier 配置重写

```
const spinner = createSpinner('Installing packages...').start();  exec(`${commandMap[packageManager]}`, { cwd: projectDirectory }, (error) => {    if (error) {      spinner.error({        text: chalk.bold.red('Failed to install packages!'),        mark: '✖',      });      console.error(error);      return;    }    const eslintFile = path.join(projectDirectory, '.eslintrc.json');    const prettierFile = path.join(projectDirectory, '.prettierrc.json');    const eslintIgnoreFile = path.join(projectDirectory, '.eslintignore');    fs.writeFileSync(eslintFile, JSON.stringify(eslint, null, 2));    fs.writeFileSync(prettierFile, JSON.stringify(prettierConfig, null, 2));    fs.writeFileSync(eslintIgnoreFile, eslintIgnore.join('\n'));    fs.writeFileSync(viteFile, viteConfig);    spinner.success({ text: chalk.bold.green('All done! 🎉'), mark: '✔' });    console.log(      chalk.bold.cyan('\n🔥 Reload your editor to activate the settings!')    );  });
```

首先通过`createSpinner`来创建一个命令行中的加载，然后通过`child_process`中的`exec`来执行`[3.4.6]`中生成的命令，去安装依赖并进行等待。

如果命令执行成功，则通过`fs.writeFileSync`将生成的数据写入到三个文件当中`.eslintrc.json`、`.prettierrc.json`、`.eslintignore`、`vite.config.xx`。

4、npm init、npx
--------------

印象里面大家可能对它的记忆可能都停留在，`npm init`之后是快速的初始化`package.json`, 并通过交互式的命令行让我们输入需要的字段值，当然如果想直接使用默认值，也可以使用`npm init -y`。

`create-app-react`创建项目命令, 官网链接可以直接查看 https://create-react-app.dev/docs/getting-started

```
//官网的三种命令npx create-react-app my-appnpm init react-app my-appyarn create react-app my-app//我又发现npm create也是可以的npm create react-app my-app
```

上述这些命令最终效果都是可以执行创建项目的

同样的`vite`创建项目的命令

```
//官网的命令npm create vite@latestyarn create vitepnpm create vite// 指定具体模板的// npm 6.x npm create vite@latest my-vue-app --template vue //npm 7+, extra double-dash is needed: npm create vite@latest my-vue-app -- --template vueyarn create vite my-vue-app --template vuepnpm create vite my-vue-app --template vue
```

可以发现`vite`官网没有使用`npx`命令，不过我在我自己电脑上尝试了另外几个命令确实也是可以的

```
npx create-vite my-app
npm init vite my-app
```

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJotyNDmzGtbehQCJXSPcGz2uWo8icj2lKnJ0FiaTQ56yexUMTjG4405tJA/640?wx_fmt=png)image.png

通过上面的对比可以一个小问题,`yarn create`去官网查了是存在这个指令的，官网地址可看 https://classic.yarnpkg.com/en/docs/cli/create#search

而对于`npm create`这个命令在 npm 官网是看不到的，但是在一篇博客中发现了更新日志

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoQkqwl7nwAibRCUVff4Er7pAwyzvX9beaV086q0tpicibASa76YWj0PGUw/640?wx_fmt=png)image.png

意思就是说`npm create xxx`和`npm init xxx` 以及`yarn create xxx`效果是一致的。那么我们来本文的命令行

```
// 我们是通过npm安装的，并且包名里是包含create的npm i create-vite-pretty-lint// 那么以下几种方式都可以使用的npm init vite-pretty-lintnpm create vite-pretty-lintyarn create vite-pretty-lintnpx create-vite-pretty-lint
```

**再来看一下 npx**

假如我们只在项目中安装了`vite`, 那么`node_modules`中`.bin`文件夹下是会存在`vite`指令的

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoFDCYxtmsxiazxUvDPmuxc7miatqonOwIicVBL6703Wg61GWMMvnTV5gag/640?wx_fmt=png)image.png

如果我们想在该项目下执行该命令第一种方式便是

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJop6pLh42rjhHic5Q32UWDkBJE9lErCicdDIPLCNQnxKvSYIRwDxnYctjw/640?wx_fmt=png)image.png

第二种方式就是直接在 package.json 的 scripts 属性下

![](https://mmbiz.qpic.cn/mmbiz_png/Mpt86EGjlpuHoGia1Lq989bvNcnHFVQJoQnsA4P2DJWbOfyMQFyexg8L8RZEgUVnMcdyz9TgicRiaj0EpuL79ibA9g/640?wx_fmt=png)image.png

关于 npx 的详细说明可以看一下阮一峰大佬的精彩分享 http://www.ruanyifeng.com/blog/2019/02/npx.html

5、总结
----

*   npm init xxx 的妙用, 以及对 npx 的了解，感觉对 package.json 的每一个属性，可以专门去学习一下
    
*   对于自动添加 eslint 和 prettier 配置的原理分析
    
*   .eslintrc.json、.eslintignore、.prettierrc.json 算是直接新增文件，处理相对简单一些
    
*   最重要的学习点：对 vite.config 文件在原有基础上的修改，这里就涉及到了 AST 抽象语法树