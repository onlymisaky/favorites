> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AZfFqV3FH4QAw6klJcU-Og)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTCiaPDic6yBcbOl5hf2MdERGNLk3cE4OWI642ktUNgYytb7XkCicbSomrA/640?wx_fmt=png)

若微信中阅读体验不佳，可点击阅读原文在 PC 端阅读。

Vue CLI 是一个基于 Vue.js 进行快速开发的完整系统，提供了终端命令行工具、零配置脚手架、插件体系、图形化管理界面等。本文暂且只分析**项目初始化**部分，也就是终端命令行工具的实现。

0. 用法
-----

用法很简单，每个 CLI 都大同小异：

```
npm install -g @vue/cli
vue create vue-cli-test
```

目前 Vue CLI 同时支持 Vue 2 和 Vue 3 项目的创建（默认配置）。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUT2FwWjSVFvuwVXCl2EAvibRKpCGqyAGZrujJf2m9CaicBq3ibDNJA0BGjg/640?wx_fmt=png)

上面是 Vue CLI 提供的默认配置，可以快速地创建一个项目。除此之外，也可以根据自己的项目需求（是否使用 Babel、是否使用 TS 等）来自定义项目工程配置，这样会更加的灵活。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTX27RlULZicDDSbFqZAo53DcEicONUlmvW3ysZOCTnPnDZ7xiaUkxVsicZw/640?wx_fmt=png)

选择完成之后，敲下回车，就开始执行安装依赖、拷贝模板等命令...

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTb6ia11wZxTKeVvc0bDM3KHDrp4mcFekgHslesqeG2A7K3sHLhcOoumQ/640?wx_fmt=png)

看到 Successfully 就是项目初始化成功了。

`vue create`  命令支持一些参数配置，可以通过 `vue create --help`  获取详细的文档：

```
用法：create [options] <app-name>选项：  -p, --preset <presetName>       忽略提示符并使用已保存的或远程的预设选项  -d, --default                   忽略提示符并使用默认预设选项  -i, --inlinePreset <json>       忽略提示符并使用内联的 JSON 字符串预设选项  -m, --packageManager <command>  在安装依赖时使用指定的 npm 客户端  -r, --registry <url>            在安装依赖时使用指定的 npm registry  -g, --git [message]             强制 / 跳过 git 初始化，并可选的指定初始化提交信息  -n, --no-git                    跳过 git 初始化  -f, --force                     覆写目标目录可能存在的配置  -c, --clone                     使用 git clone 获取远程预设选项  -x, --proxy                     使用指定的代理创建项目  -b, --bare                      创建项目时省略默认组件中的新手指导信息  -h, --help                      输出使用帮助信息
```

具体的用法大家感兴趣的可以尝试一下，这里就不展开了，后续在源码分析中会有相应的部分提到。

1. 入口文件
-------

> 本文中的 `vue cli` 版本为 `4.5.9`。若阅读本文时存在 `break change`，可能就需要自己理解一下啦

按照正常逻辑，我们在 `package.json` 里找到了入口文件：

```
{  "bin": {    "vue": "bin/vue.js"  }}
```

`bin/vue.js` 里的代码不少，无非就是在 `vue`  上注册了 `create` / `add` / `ui`  等命令，本文只分析 `create`  部分，找到这部分代码（删除主流程无关的代码后）：

```
// 检查 node 版本checkNodeVersion(requiredVersion, '@vue/cli');// 挂载 create 命令program.command('create <app-name>').action((name, cmd) => {  // 获取额外参数  const options = cleanArgs(cmd);  // 执行 create 方法  require('../lib/create')(name, options);});
```

`cleanArgs`  是获取 `vue create`  后面通过 `-`  传入的参数，通过 `vue create --help` 可以获取执行的参数列表。

获取参数之后就是执行真正的 `create`  方法了，等等仔细展开。

不得不说，Vue CLI 对于代码模块的管理非常细，每个模块基本上都是**单一功能模块**，可以任意地拼装和使用。每个文件的代码行数也都不会很多，阅读起来非常舒服。

2. 输入命令有误，猜测用户意图
----------------

Vue CLI 中比较有意思的一个地方，如果用户在终端中输入 `vue creat xxx`  而不是 `vue create xxx`，会怎么样呢？理论上应该是报错了。

如果只是报错，那我就不提了。看看结果：![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTuYqC8oI7bJwnsjAPeB8C3Fl9ljibiaDQFaHXs1Lu54tKhQmStwibhViaNw/640?wx_fmt=png)

终端上输出了一行很关键的信息 `Did you mean create`，Vue CLI 似乎知道用户是想使用 `create`  但是手速太快打错单词了。

这是如何做到的呢？我们在源代码中寻找答案：

```
const leven = require('leven');// 如果不是当前已挂载的命令，会猜测用户意图program.arguments('<command>').action(cmd => {  suggestCommands(cmd);});// 猜测用户意图function suggestCommands(unknownCommand) {  const availableCommands = program.commands.map(cmd => cmd._name);  let suggestion;  availableCommands.forEach(cmd => {    const isBestMatch =      leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {      suggestion = cmd;    }  });  if (suggestion) {    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));  }}
```

代码中使用了 leven 了这个包，这是用于计算字符串编辑距离算法的 JS 实现，Vue CLI 这里使用了这个包，来分别计算输入的命令和当前已挂载的所有命令的编辑举例，从而猜测用户实际想输入的命令是哪个。

小而美的一个功能，用户体验极大提升。

3. Node 版本相关检查
--------------

### 3.1 Node 期望版本

和 `create-react-app`  类似，Vue CLI 也是先检查了一下当前 Node 版本是否符合要求：

*   当前 Node 版本： `process.version`
    
*   期望的 Node 版本： `require("../package.json").engines.node`
    

比如我目前在用的是 Node v10.20.1 而 @vue/cli 4.5.9  要求的 Node 版本是 `>=8.9`，所以是符合要求的。

### 3.2 推荐 Node LTS 版本

在 `bin/vue.js`  中有这样一段代码，看上去也是在检查 Node 版本：

```
const EOL_NODE_MAJORS = ['8.x', '9.x', '11.x', '13.x'];for (const major of EOL_NODE_MAJORS) {  if (semver.satisfies(process.version, major)) {    console.log(      chalk.red(        `You are using Node ${process.version}.\n` +          `Node.js ${major} has already reached end-of-life and will not be supported in future major releases.\n` +          `It's strongly recommended to use an active LTS version instead.`      )    );  }}
```

可能并不是所有人都了解它的作用，在这里稍微科普一下。

简单来说，Node 的主版本分为**奇数版本**和**偶数版本**。每个版本发布之后会持续六个月的时间，六个月之后，奇数版本将变为 **EOL** 状态，而偶数版本变为 **Active LTS ** 状态并且长期支持。所以我们在生产环境使用 Node 的时候，应该尽量使用它的 LTS 版本，而不是 **EOL** 的版本。

> EOL 版本：A End-Of-Life version of Node LTS 版本: A long-term supported version of Node

这是目前常见的 Node 版本的一个情况：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTJoY4QF54Cxn00qlX4gr6ibEMEUcW6jUaPeGT3q36IUWNlsLaPV4r46A/640?wx_fmt=png)

解释一下图中几个状态：

*   **CURRENT**：会修复 bug，增加新特性，不断改善
    
*   **ACTIVE**：长期稳定版本
    
*   **MAINTENANCE**：只会修复 bug，不会再有新的特性增加
    
*   **EOL**：当进度条走完，这个版本也就不再维护和支持了
    

通过上面那张图，我们可以看到，Node 8.x 在 2020 年已经 **EOL**，Node 12.x 在 2021 年的时候也会进入 **MAINTENANCE ** 状态，而 Node 10.x 在 2021 年 4、5 月的时候就会变成 **EOL**。

Vue CLI 中对当前的 Node 版本进行判断，如果你用的是 EOL 版本，会推荐你使用 LTS 版本。也就是说，在不久之后，这里的应该判断会多出一个 `10.x`，还不快去给 Vue CLI 提个 PR（手动狗头）。

4. 判断是否在当前路径
------------

在执行 `vue create`  的时候，是必须指定一个 `app-name` ，否则会报错： `Missing required argument <app-name>` 。

那如果用户已经自己创建了一个目录，想在当前这个空目录下创建一个项目呢？当然，Vue CLI 也是支持的，执行 `vue create .`  就 OK 了。

`lib/create.js`  中就有相关代码是在处理这个逻辑的。

```
async function create(projectName, options) {  // 判断传入的 projectName 是否是 .  const inCurrent = projectName === '.';  // path.relative 会返回第一个参数到第二个参数的相对路径  // 这里就是用来获取当前目录的目录名  const name = inCurrent ? path.relative('../', cwd) : projectName;  // 最终初始化项目的路径  const targetDir = path.resolve(cwd, projectName || '.');}
```

如果你需要实现一个 CLI，这个逻辑是可以拿来即用的。

5. 检查应用名
--------

Vue CLI 会通过 `validate-npm-package-name`  这个包来检查输入的 `projectName` 是否符合规范。

```
const result = validateProjectName(name);if (!result.validForNewPackages) {  console.error(chalk.red(`Invalid project name: "${name}"`));  exit(1);}
```

对应的 `npm` 命名规范可以见：Naming Rules

6. 若目标文件夹已存在，是否覆盖
-----------------

这段代码比较简单，就是判断 `target`  目录是否存在，然后通过交互询问用户是否覆盖（对应的是操作是删除原目录）：

```
// 是否 vue create -mif (fs.existsSync(targetDir) && !options.merge) {  // 是否 vue create -f  if (options.force) {    await fs.remove(targetDir);  } else {    await clearConsole();    // 如果是初始化在当前路径，就只是确认一下是否在当前目录创建    if (inCurrent) {      const { ok } = await inquirer.prompt([        {          name: 'ok',          type: 'confirm',          message: `Generate project in current directory?`,        },      ]);      if (!ok) {        return;      }    } else {      // 如果有目标目录，则询问如何处理：Overwrite / Merge / Cancel      const { action } = await inquirer.prompt([        {          name: 'action',          type: 'list',          message: `Target directory ${chalk.cyan(            targetDir          )} already exists. Pick an action:`,          choices: [            { name: 'Overwrite', value: 'overwrite' },            { name: 'Merge', value: 'merge' },            { name: 'Cancel', value: false },          ],        },      ]);      // 如果选择 Cancel，则直接中止      // 如果选择 Overwrite，则先删除原目录      // 如果选择 Merge，不用预处理啥      if (!action) {        return;      } else if (action === 'overwrite') {        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`);        await fs.remove(targetDir);      }    }  }}
```

7. 整体错误捕获
---------

在 `create`  方法的最外层，放了一个 `catch`  方法，捕获内部所有抛出的错误，将当前的 `spinner`  状态停止，退出进程。

```
module.exports = (...args) => {  return create(...args).catch(err => {    stopSpinner(false); // do not persist    error(err);    if (!process.env.VUE_CLI_TEST) {      process.exit(1);    }  });};
```

8. Creator 类
------------

在 `lib/create.js`  方法的最后，执行了这样两行代码：

```
const creator = new Creator(name, targetDir, getPromptModules());await creator.create(options);
```

看来最重要的代码还是在 `Creator`  这个类中。

打开 `Creator.js`  文件，好家伙，500+ 行代码，并且引入了 12 个模块。当然，这篇文章不会把这 500 行代码和 12 个模块都理一遍，没必要，感兴趣的自己去看看好了。

本文还是梳理主流程和一些有意思的功能。

### 8.1 constructor 构造函数

先看一下 `Creator`  类的的构造函数：

```
module.exports = class Creator extends EventEmitter {  constructor(name, context, promptModules) {    super();    this.name = name;    this.context = process.env.VUE_CLI_CONTEXT = context;    // 获取了 preset 和 feature 的 交互选择列表，在 vue create 的时候提供选择    const { presetPrompt, featurePrompt } = this.resolveIntroPrompts();    this.presetPrompt = presetPrompt;    this.featurePrompt = featurePrompt;    // 交互选择列表：是否输出一些文件    this.outroPrompts = this.resolveOutroPrompts();    this.injectedPrompts = [];    this.promptCompleteCbs = [];    this.afterInvokeCbs = [];    this.afterAnyInvokeCbs = [];    this.run = this.run.bind(this);    const promptAPI = new PromptModuleAPI(this);    // 将默认的一些配置注入到交互列表中    promptModules.forEach(m => m(promptAPI));  }};
```

构造函数嘛，主要就是初始化一些变量。这里主要将逻辑都封装在 `resolveIntroPrompts` / `resolveOutroPrompts`  和 `PromptModuleAPI`  这几个方法中。

主要看一下 `PromptModuleAPI` 这个类是干什么的。

```
module.exports = class PromptModuleAPI {  constructor(creator) {    this.creator = creator;  }  // 在 promptModules 里用  injectFeature(feature) {    this.creator.featurePrompt.choices.push(feature);  }  // 在 promptModules 里用  injectPrompt(prompt) {    this.creator.injectedPrompts.push(prompt);  }  // 在 promptModules 里用  injectOptionForPrompt(name, option) {    this.creator.injectedPrompts      .find(f => {        return f.name === name;      })      .choices.push(option);  }  // 在 promptModules 里用  onPromptComplete(cb) {    this.creator.promptCompleteCbs.push(cb);  }};
```

这里我们也简单说一下，`promptModules`  返回的是所有用于终端交互的模块，其中会调用 `injectFeature` 和 `injectPrompt` 来将交互配置插入进去，并且会通过 `onPromptComplete`  注册一个回调。

`onPromptComplete` 注册回调的形式是往 `promptCompleteCbs` 这个数组中 `push` 了传入的方法，可以猜测在所有交互完成之后应该会通过以下形式来调用回调：

```
this.promptCompleteCbs.forEach(cb => cb(answers, preset));
```

回过来看这段代码：

```
module.exports = class Creator extends EventEmitter {  constructor(name, context, promptModules) {    const promptAPI = new PromptModuleAPI(this);    promptModules.forEach(m => m(promptAPI));  }};
```

在 `Creator`  的构造函数中，实例化了一个 `promptAPI`  对象，并遍历 `prmptModules`  把这个对象传入了 `promptModules`  中，说明在实例化 `Creator`  的时候时候就会把所有用于交互的配置注册好了。

这里我们注意到，在构造函数中出现了四种 `prompt`： `presetPrompt`，`featurePrompt`， `injectedPrompts`， `outroPrompts`，具体有什么区别呢？下文有有详细展开。

### 8.2 EventEmitter 事件模块

首先， `Creator`  类是继承于 Node.js 的 `EventEmitter` 类。众所周知， `events`  是 Node.js 中最重要的一个模块，而 `EventEmitter` 类就是其基础，是 Node.js 中事件触发与事件监听等功能的封装。

在这里， `Creator`  继承自 `EventEmitter` , 应该就是为了方便在 `create`  过程中 `emit`  一些事件，整理了一下，主要就是以下 8 个事件：

```
this.emit('creation', { event: 'creating' }); // 创建this.emit('creation', { event: 'git-init' }); // 初始化 gitthis.emit('creation', { event: 'plugins-install' }); // 安装插件this.emit('creation', { event: 'invoking-generators' }); // 调用 generatorthis.emit('creation', { event: 'deps-install' }); // 安装额外的依赖this.emit('creation', { event: 'completion-hooks' }); // 完成之后的回调this.emit('creation', { event: 'done' }); // create 流程结束this.emit('creation', { event: 'fetch-remote-preset' }); // 拉取远程 preset
```

我们知道事件 `emit`  一定会有 `on`  的地方，是哪呢？搜了一下源码，是在 @vue/cli-ui 这个包里，也就是说在终端命令行工具的场景下，不会触发到这些事件，这里简单了解一下即可：

```
const creator = new Creator('', cwd.get(), getPromptModules());onCreationEvent = ({ event }) => {  progress.set({ id: PROGRESS_ID, status: event, info: null }, context);};creator.on('creation', onCreationEvent);
```

简单来说，就是通过 `vue ui`  启动一个图形化界面来初始化项目时，会启动一个 `server` 端，和终端之间是存在通信的。 `server` 端挂载了一些事件，在 create 的每个阶段，会从 cli 中的方法触发这些事件。

9. Preset（预设）
-------------

`Creator`  类的实例方法 `create`  接受两个参数：

*   **cliOptions**：终端命令行传入的参数
    
*   **preset**：Vue CLI 的预设
    

### 9.1 什么是 Preset（预设）

Preset 是什么呢？官方解释**是一个包含创建新项目所需预定义选项和插件的 JSON 对象，让用户无需在命令提示中选择它们**。比如：

```
{  "useConfigFiles": true,  "cssPreprocessor": "sass",  "plugins": {    "@vue/cli-plugin-babel": {},    "@vue/cli-plugin-eslint": {      "config": "airbnb",      "lintOn": ["save", "commit"]    }  },  "configs": {    "vue": {...},    "postcss": {...},    "eslintConfig": {...},    "jest": {...}  }}
```

在 CLI 中允许使用本地的 preset 和远程的 preset。

### 9.2 prompt

用过 `inquirer` 的朋友的对 prompt 这个单词一定不陌生，它有 `input` / `checkbox` 等类型，是用户和终端的交互。

我们回过头来看一下在 `Creator` 中的一个方法 `getPromptModules`， 按照字面意思，这个方法是获取了一些用于交互的模块，具体来看一下：

```
exports.getPromptModules = () => {  return [    'vueVersion',    'babel',    'typescript',    'pwa',    'router',    'vuex',    'cssPreprocessors',    'linter',    'unit',    'e2e',  ].map(file => require(`../promptModules/${file}`));};
```

看样子是获取了一系列的模块，返回了一个数组。我看了一下这里列的几个模块，代码格式基本都是统一的：：

```
module.exports = cli => {  cli.injectFeature({    name: '',    value: '',    short: '',    description: '',    link: '',    checked: true,  });  cli.injectPrompt({    name: '',    when: answers => answers.features.includes(''),    message: '',    type: 'list',    choices: [],    default: '2',  });  cli.onPromptComplete((answers, options) => {});};
```

单独看 `injectFeature` 和 `injectPrompt` 的对象是不是和 `inquirer` 有那么一点神似？是的，他们就是用户交互的一些配置选项。那 Feature  和 Prompt  有什么区别呢？

**Feature**：Vue CLI 在选择自定义配置时的顶层选项：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUT4LL7mhkaicgTB5hbtxhtpj3Iqhc7UWibYzJWygejkVnNb8C7q8WibfVtQ/640?wx_fmt=png)

**Prompt**：选择具体 Feature 对应的二级选项，比如选择了 **Choose Vue version** 这个 Feature，会要求用户选择是 2.x 还是 3.x：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUT5jjVmUXfFRCedLXgsKksKTk8jy69UX84SXE2uZepicNVicWxevBJyL8w/640?wx_fmt=png)

`onPromptComplete` 注册了一个回调方法，在完成交互之后执行。

看来我们的猜测是对的， `getPromptModules` 方法就是获取一些**用于和用户交互的模块**，比如：

*   **babel**：选择是否使用 Babel
    
*   **cssPreprocessors**：选择 CSS 的预处理器（Sass、Less、Stylus）
    
*   ...
    

先说到这里，后面在自定义配置加载的章节里会展开介绍 Vue CLI 用到的所有 `prompt` 。

### 9.3 获取预设

我们具体来看一下获取预设相关的逻辑。这部分代码在 `create`  实例方法中：

```
// Creator.jsmodule.exports = class Creator extends EventEmitter {  async create(cliOptions = {}, preset = null) {    const isTestOrDebug = process.env.VUE_CLI_TEST || process.env.VUE_CLI_DEBUG;    const { run, name, context, afterInvokeCbs, afterAnyInvokeCbs } = this;    if (!preset) {      if (cliOptions.preset) {        // vue create foo --preset bar        preset = await this.resolvePreset(cliOptions.preset, cliOptions.clone);      } else if (cliOptions.default) {        // vue create foo --default        preset = defaults.presets.default;      } else if (cliOptions.inlinePreset) {        // vue create foo --inlinePreset {...}        try {          preset = JSON.parse(cliOptions.inlinePreset);        } catch (e) {          error(            `CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`          );          exit(1);        }      } else {        preset = await this.promptAndResolvePreset();      }    }  }};
```

可以看到，代码中分别针对几种情况作了处理：

*   cli 参数配了 --preset
    
*   cli 参数配了 --default
    
*   cli 参数配了 --inlinePreset
    
*   cli 没配相关参数，默认获取 `Preset` 的行为
    

前三种情况就不展开说了，我们来看一下第四种情况，也就是默认通过交互 `prompt`  来获取 `Preset` 的逻辑，也就是 `promptAndResolvePreset`  方法。

先看一下实际用的时候是什么样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTlibo4Qe20kefEBxSegK5iaL1uUDtGJ1FMkSVMoic9TIvsk9EXCsVjmiaZQ/640?wx_fmt=png)

我们可以猜测这里就是一段 `const answers = await inquirer.prompt([])`  代码。

```
async promptAndResolvePreset(answers = null) {    // prompt    if (!answers) {      await clearConsole(true);      answers = await inquirer.prompt(this.resolveFinalPrompts());    }    debug("vue-cli:answers")(answers); } resolveFinalPrompts() {    this.injectedPrompts.forEach((prompt) => {      const originalWhen = prompt.when || (() => true);      prompt.when = (answers) => {        return isManualMode(answers) && originalWhen(answers);      };    });    const prompts = [      this.presetPrompt,      this.featurePrompt,      ...this.injectedPrompts,      ...this.outroPrompts,    ];    debug("vue-cli:prompts")(prompts);    return prompts; }
```

是的，我们猜的没错，将 `this.resolveFinalPrompts`  里的配置进行交互，而 `this.resolveFinalPrompts`  方法其实就是将在 `Creator`  的构造函数里初始化的那些 `prompts`  合到一起了。上文也提到了有这四种 `prompt`，在下一节展开介绍。**

### 9.4 保存预设

在 Vue CLI 的最后，会让用户选择 `save this as a preset for future?`，如果用户选择了 `Yes`，就会执行相关逻辑将这次的交互结果保存下来。这部分逻辑也是在 `promptAndResolvePreset` 中。

```
async promptAndResolvePreset(answers = null)  {  if (    answers.save &&    answers.saveName &&    savePreset(answers.saveName, preset)  ) {    log();    log(      `🎉  Preset ${chalk.yellow(answers.saveName)} saved in ${chalk.yellow(        rcPath      )}`    );  }}
```

在调用 `savePreset` 之前还会对预设进行解析、校验等，就不展开了，直接来看一下 `savePreset` 方法：

```
exports.saveOptions = toSave => {  const options = Object.assign(cloneDeep(exports.loadOptions()), toSave);  for (const key in options) {    if (!(key in exports.defaults)) {      delete options[key];    }  }  cachedOptions = options;  try {    fs.writeFileSync(rcPath, JSON.stringify(options, null, 2));    return true;  } catch (e) {    error(      `Error saving preferences: ` +        `make sure you have write access to ${rcPath}.\n` +        `(${e.message})`    );  }};exports.savePreset = (name, preset) => {  const presets = cloneDeep(exports.loadOptions().presets || {});  presets[name] = preset;  return exports.saveOptions({ presets });};
```

代码很简单，先深拷贝一份 Preset（这里直接用的 lodash 的 clonedeep），然后进过一些 `merge` 的操作之后就 `writeFileSync` 到上文有提到的 `.vuerc` 文件了。

10. 自定义配置加载
-----------

这四种 `prompt`  分别对应的是预设选项、自定义 feature 选择、具体 feature 选项和其它选项，它们之间存在互相关联、层层递进的关系。结合这四种 `prompt`，就是 Vue CLI 展现开用户面前的所有交互了，其中也包含自定义配置的加载。

### 10.1 presetPrompt: 预设选项

也就是最初截图里看到的哪三个选项，选择 Vue2 还是 Vue3 还是自定义 `feature`：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTCWkAvvD1EzFPIXGCNapFBSH7REeO8dAm9dsFVRt1iasVhR1b7w9TELw/640?wx_fmt=png)

如果选择了 `Vue2`  或者 `Vue3` ，则后续关于 `preset`  所有的 `prompt`  都会终止。

### 10.2 featurePrompt: 自定义 feature 选项

** 如果在 `presetPrompt`  中选择了 `Manually`，则会继续选择 `feature`：![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTQwbNAxmRlQTpice5KPT7o9kCGVvcK9BDogZ0Cp8rXcwlicIaeBGWS9uA/640?wx_fmt=png)

`featurePrompt`  就是存储的这个列表，对应的代码是这样的：

```
const isManualMode = answers => answers.preset === '__manual__';const featurePrompt = {  name: 'features',  when: isManualMode,  type: 'checkbox',  message: 'Check the features needed for your project:',  choices: [],  pageSize: 10,};
```

在代码中可以看到，在 `isManualMode`  的时候才会弹出这个交互。

### 10.3 injectedPrompts: 具体 feature 选项

`featurePrompt`  只是提供了一个一级列表，当用户选择了 `Vue Version` / `Babel` / `TypeScript`  等选项之后，会弹出新的交互，比如 `Choose Vue version`：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTa0nl5FOxoKAwwNZ1W8aTqZHtn9IV0Hn5gTxLUD50nmGJFKO7wcOdMQ/640?wx_fmt=png)

`injectedPrompts`  就是存储的这些具体选项的列表，也就是上文有提到通过 `getPromptModules` 方法在 `promptModules`  目录获取到的那些 `prompt`  模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTNgkVIG6SSwSBU4paUBb431COJTd5Fv9SqAuEnsueJckibYNiaVEyQxzw/640?wx_fmt=png)

对应的代码可以再回顾一下：

```
cli.injectPrompt({  name: 'vueVersion',  when: answers => answers.features.includes('vueVersion'),  message: 'Choose a version of Vue.js that you want to start the project with',  type: 'list',  choices: [    {      name: '2.x',      value: '2',    },    {      name: '3.x (Preview)',      value: '3',    },  ],  default: '2',});
```

可以看到，在 `answers => answers.features.includes('vueVersion')`，也就是 `featurePrompt` 的交互结果中如果包含 `vueVersion`  就会弹出具体选择 `Vue Version`  的交互。

### 10.4 outroPrompts: 其它选项

** 这里存储的就是一些除了上述三类选项之外的选项目前包含三个：

**Where do you prefer placing config for Babel, ESLint, etc.? **Babel，ESLint 等配置文件如何存储？

*   **In dedicated config files**。单独保存在各自的配置文件中。
    
*   **In package.json**。统一存储在 package.json 中。
    

**Save this as a preset for future projects? ** 是否保存这次 Preset 以便之后直接使用。

如果你选择了 Yes，则会再出来一个交互：**Save preset as **输入 Preset 的名称**。**

### 10.5 总结：Vue CLI 交互流程

这里总结一下 Vue CLI 的整体交互，也就是 `prompt`  的实现。

也就是文章最开始的时候提到，Vue CLI 支持默认配置之外，也支持自定义配置（Babel、TS 等），这样一个交互流程是如何实现的。

Vue CLI 将所有交互分为四大类：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUT0Lxbsx0JXoaaR1ia5JdgWLUeVB75AlIoicoqNOIyGymH6Jvpppgt0UsQ/640?wx_fmt=png)

从预设选项到具体 feature 选项，它们是一个**层层递进**的关系，不同的时机和选择会触发不同的交互。

Vue CLI 这里在代码架构上的设计值得学习，将各个交互维护在不同的模块中，通过统一的一个 `prmoptAPI`  实例在 `Creator`  实例初始化的时候，插入到不同的 `prompt`  中，并且注册各自的回调函数。这样设计对于 `prompt`  而言是完全解耦的，删除某一项 `prompt`  对于上下文的影响可以忽略不计。

好了，关于预设（Preset）和交互（Prompt）到这里基本分析完了，剩下的一些细节问题就不再展开了。

这里涉及到的相关源码文件有，大家可以自行看一下：

*   Creator.js
    
*   PromptModuleAPI.js
    
*   utils/createTools.js
    
*   promptModules
    
*   ...
    

11. 初始化项目基础文件
-------------

当用户选完所有交互之后，CLI 的下一步职责就是根据用户的选项去生成对应的代码了，这也是 CLI 的核心功能之一。

### 11.1 初始化 package.json 文件

根据用户的选项会挂载相关的 `vue-cli-plugin`，然后用于生成 `package.json`  的依赖 `devDependencies`，比如 `@vue/cli-service` / `@vue/cli-plugin-babel` / `@vue/cli-plugin-eslint`  等。

Vue CLI 会现在创建目录下写入一个基础的 `package.json` ：

```
{  "name": "a",  "version": "0.1.0",  "private": true,  "devDependencies": {    "@vue/cli-plugin-babel": "~4.5.0",    "@vue/cli-plugin-eslint": "~4.5.0",    "@vue/cli-service": "~4.5.0"  }}
```

### 11.2 初始化 Git

根据传入的参数和一系列的判断，会在目标目录下初始化 Git 环境，简单来说就是执行一下 `git init`：

```
await run('git init');
```

具体是否初始化 Git 环境是这样判断的：

```
shouldInitGit(cliOptions) {  // 如果全局没安装 Git，则不初始化  if (!hasGit()) {    return false;  }  // 如果 CLI 有传入 --git 参数，则初始化  if (cliOptions.forceGit) {    return true;  }  // 如果 CLI 有传入 --no-git，则不初始化  if (cliOptions.git === false || cliOptions.git === "false") {    return false;  }  // 如果当前目录下已经有 Git 环境，就不初始化  return !hasProjectGit(this.context);}
```

### 11.3 初始化 README.md

项目的 `README.md`  会根据上下文动态生成，而不是写死的一个文档：

```
function generateReadme(pkg, packageManager) {  return [    `# ${pkg.name}\n`,    '## Project setup',    '```',    `${packageManager} install`,    '```',    printScripts(pkg, packageManager),    '### Customize configuration',    'See [Configuration Reference](https://cli.vuejs.org/config/).',    '',  ].join('\n');}
```

Vue CLI 创建的 `README.md`  会告知用户如何使用这个项目，除了 `npm install`  之外，会根据 `package.json`  里的 `scripts`  参数来动态生成使用文档，比如如何开发、构建和测试：

```
const descriptions = {  build: 'Compiles and minifies for production',  serve: 'Compiles and hot-reloads for development',  lint: 'Lints and fixes files',  'test:e2e': 'Run your end-to-end tests',  'test:unit': 'Run your unit tests',};function printScripts(pkg, packageManager) {  return Object.keys(pkg.scripts || {})    .map(key => {      if (!descriptions[key]) return '';      return [        `\n### ${descriptions[key]}`,        '```',        `${packageManager} ${packageManager !== 'yarn' ? 'run ' : ''}${key}`,        '```',        '',      ].join('\n');    })    .join('');}
```

这里可能会有读者问，为什么不直接拷贝一个 `README.md`  文件过去呢？

*   第一，Vue CLI 支持不同的包管理，对应安装、启动和构建脚本都是不一样的，这个是需要动态生成的；
    
*   第二，动态生成自由性更强，可以根据用户的选项去生成对应的文档，而不是大家都一样。
    

### 11.4 安装依赖

调用 `ProjectManage` 的 `install` 方法安装依赖，代码不复杂：

```
async install () {   if (this.needsNpmInstallFix) {     // 读取 package.json     const pkg = resolvePkg(this.context)     // 安装 dependencies     if (pkg.dependencies) {       const deps = Object.entries(pkg.dependencies).map(([dep, range]) => `${dep}@${range}`)       await this.runCommand('install', deps)     }     // 安装 devDependencies     if (pkg.devDependencies) {       const devDeps = Object.entries(pkg.devDependencies).map(([dep, range]) => `${dep}@${range}`)       await this.runCommand('install', [...devDeps, '--save-dev'])     }     // 安装 optionalDependencies     if (pkg.optionalDependencies) {       const devDeps = Object.entries(pkg.devDependencies).map(([dep, range]) => `${dep}@${range}`)       await this.runCommand('install', [...devDeps, '--save-optional'])     }     return   }   return await this.runCommand('install', this.needsPeerDepsFix ? ['--legacy-peer-deps'] : []) }
```

简单来说就是读取 `package.json` 然后分别安装 `npm` 的不同依赖。

这里的逻辑深入进去感觉还是挺复杂的，我也没仔细深入看，就不展开说了。。。

#### 11.4.1 自动判断 NPM 源

这里有一个有意思的点，关于安装依赖时使用的 npm 仓库源。**如果用户没有指定安装源，Vue CLI 会自动判断是否使用淘宝的 NPM 安装源**，猜猜是如何实现的？

```
function shouldUseTaobao() {  let faster  try {    faster = await Promise.race([      ping(defaultRegistry),      ping(registries.taobao)    ])  } catch (e) {    return save(false)  }  if (faster !== registries.taobao) {    // default is already faster    return save(false)  }  const { useTaobaoRegistry } = await inquirer.prompt([    {      name: 'useTaobaoRegistry',      type: 'confirm',      message: chalk.yellow(        ` Your connection to the default ${command} registry seems to be slow.\n` +          `   Use ${chalk.cyan(registries.taobao)} for faster installation?`      )    }  ])  return save(useTaobaoRegistry);}
```

Vue CLI 中会通过 `Promise.race` 去请求**默认安装源**和**淘宝安装源：** **

*   如果先返回的是淘宝安装源，就会让用户确认一次，是否使用淘宝安装源
    
*   如果先返回的是默认安装源，就会直接使用默认安装源
    

一般来说，肯定都是使用默认安装源，但是考虑国内用户。。咳咳。。为这个设计点赞。

15. Generator 生成代码
------------------

除了 `Creator`  外，整个 Vue CLI 的第二大重要的类是 `Generator`，负责项目代码的生成，来具体看看干了啥。

### 15.1 初始化插件

在 `generate`  方法中，最先执行的是一个 `initPlugins`  方法，代码如下：

```
async initPlugins () {  for (const id of this.allPluginIds) {    const api = new GeneratorAPI(id, this, {}, rootOptions)    const pluginGenerator = loadModule(`${id}/generator`, this.context)    if (pluginGenerator && pluginGenerator.hooks) {      await pluginGenerator.hooks(api, {}, rootOptions, pluginIds)    }  }}
```

在这里会给每一个 `package.json`  里的插件初始化一个 `GeneratorAPI`  实例，将实例传入对应插件的 `generator`  方法并执行，比如 `@vue/cli-plugin-babel/generator.js`。

### 15.2 GeneratorAPI 类

> Vue CLI 使用了一套基于插件的架构。如果你查阅一个新创建项目的 package.json，就会发现依赖都是以 @vue/cli-plugin- 开头的。插件可以修改 webpack 的内部配置，也可以向 vue-cli-service 注入命令。在项目创建的过程中，绝大部分列出的特性都是通过插件来实现的。

刚刚提到，会往每一个插件的 `generator`  中传入 `GeneratorAPI`  的实例，看看这个类提供了什么。

#### 15.2.1 例子：@vue/cli-plugin-babel

为了不那么抽象，我们先拿 `@vue/cli-plugin-babel` 来看，这个插件比较简单：

```
module.exports = api => {  delete api.generator.files['babel.config.js'];  api.extendPackage({    babel: {      presets: ['@vue/cli-plugin-babel/preset'],    },    dependencies: {      'core-js': '^3.6.5',    },  });};
```

这里 `api`  就是一个 `GeneratorAPI` 实例，这里用到了一个 `extendPackage`  方法：

```
// GeneratorAPI.js// 删减部分代码，只针对 @vue/cli-plugin-babel 分析extendPackage (fields, options = {}) {  const pkg = this.generator.pkg  const toMerge = isFunction(fields) ? fields(pkg) : fields  // 遍历传入的参数，这里是 babel 和 dependencies 两个对象  for (const key in toMerge) {    const value = toMerge[key]    const existing = pkg[key]    // 如果 key 的名称是 dependencies 和 devDependencies    // 就通过 mergeDeps 方法往 package.json 合并依赖    if (isObject(value) && (key === 'dependencies' || key === 'devDependencies')) {      pkg[key] = mergeDeps(        this.id,        existing || {},        value,        this.generator.depSources,        extendOptions      )    } else if (!extendOptions.merge || !(key in pkg)) {      pkg[key] = value    }  }}
```

这时候，默认的 `package.json`  就变成：

```
{  "babel": {    "presets": ["@vue/cli-plugin-babel/preset"]  },  "dependencies": {    "core-js": "^3.6.5"  },  "devDependencies": {},  "name": "test",  "private": true,  "version": "0.1.0"}
```

看完这个例子，对于 `GeneratorAPI`  的实例做什么可能有些了解了，我们就来具体看看这个类的实例吧。

#### 15.2.2 重要的几个实例方法

先介绍几个 `GeneratorAPI`  重要的实例方法，这里就只介绍功能，具体代码就不看了，等等会用到。

*   **extendPackage**：拓展 package.json 配置
    
*   **render**：通过 ejs 渲染模板文件
    
*   **onCreateComplete**: 注册文件写入硬盘之后的回调
    
*   **genJSConfig**: 将 json 文件输出成 js 文件
    
*   **injectImports**: 向文件中加入 import
    
*   ...
    

### 16. @vue/cli-service

上文已经看过一个 `@vue/cli-plugin-babel`  插件，对于 Vue CLI 的插件架构是不是有点感觉？也了解到一个比较重要的 `GeneratorAPI`  类，插件中的一些修改配置的功能都是这个类的实例方法。

接下来看一个比较重要的插件 `@vue/cli-service`，这个插件是 Vue CLI 的核心插件，和 `create react app`  的 `react-scripts`  类似，借助这个插件，我们应该能够更深刻地理解 `GeneratorAPI` 以及 Vue CLI 的插件架构是如何实现的。

来看一下 `@vue/cli-service`  这个包下的 `generator/index.js`  文件，这里为了分析方便，将源码拆解成多段，其实也就是分别调用了 `GeneratorAPI`  实例的不同方法：

#### 16.1 渲染 template

```
api.render('./template', {  doesCompile: api.hasPlugin('babel') || api.hasPlugin('typescript'),});
```

将 `template`  目录下的文件通过 `render`  渲染到内存中，这里用的是 `ejs`  作为模板渲染引擎。

#### 16.2 写 package.json

通过 `extendPackage` 往 `pacakge.json` 中写入 `Vue`   的相关依赖：

```
if (options.vueVersion === '3') {  api.extendPackage({    dependencies: {      vue: '^3.0.0',    },    devDependencies: {      '@vue/compiler-sfc': '^3.0.0',    },  });} else {  api.extendPackage({    dependencies: {      vue: '^2.6.11',    },    devDependencies: {      'vue-template-compiler': '^2.6.11',    },  });}
```

通过 `extendPackage` 往 `pacakge.json` 中写入 `scripts`：

```
api.extendPackage({  scripts: {    serve: 'vue-cli-service serve',    build: 'vue-cli-service build',  },  browserslist: ['> 1%', 'last 2 versions', 'not dead'],});
```

通过 `extendPackage` 往 `pacakge.json` 中写入 `CSS` 预处理参数：

```
if (options.cssPreprocessor) {  const deps = {    sass: {      sass: '^1.26.5',      'sass-loader': '^8.0.2',    },    'node-sass': {      'node-sass': '^4.12.0',      'sass-loader': '^8.0.2',    },    'dart-sass': {      sass: '^1.26.5',      'sass-loader': '^8.0.2',    },    less: {      less: '^3.0.4',      'less-loader': '^5.0.0',    },    stylus: {      stylus: '^0.54.7',      'stylus-loader': '^3.0.2',    },  };  api.extendPackage({    devDependencies: deps[options.cssPreprocessor],  });}
```

#### 16.3 调用 router 插件和 vuex 插件

```
// for v3 compatibilityif (options.router && !api.hasPlugin('router')) {  require('./router')(api, options, options);}// for v3 compatibilityif (options.vuex && !api.hasPlugin('vuex')) {  require('./vuex')(api, options, options);}
```

是不是很简单，通过 `GeneratorAPI`  提供的实例方法，可以在插件中非常方便地对项目进行修改和自定义。

17. 抽取单独配置文件
------------

上文提到，通过 `extendPackage`  回往 `package.json`  中写入一些配置。但是，上文也提到有一个交互是 **Where do you prefer placing config for Babel, ESLint, etc.?** 也就是会将配置抽取成单独的文件。`generate`  里的 `extractConfigFiles`  方法就是执行了这个逻辑。

```
extractConfigFiles(extractAll, checkExisting) {  const configTransforms = Object.assign(    {},    defaultConfigTransforms,    this.configTransforms,    reservedConfigTransforms  );  const extract = (key) => {    if (      configTransforms[key] &&      this.pkg[key] &&      !this.originalPkg[key]    ) {      const value = this.pkg[key];      const configTransform = configTransforms[key];      const res = configTransform.transform(        value,        checkExisting,        this.files,        this.context      );      const { content, filename } = res;      this.files[filename] = ensureEOL(content);      delete this.pkg[key];    }  };  if (extractAll) {    for (const key in this.pkg) {      extract(key);    }  } else {    extract("babel");  }}
```

这里的 `configTransforms`  就是一些会需要抽取的配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/icLVkb61mw4n51FqkVFStasI3UckhIhUTJKdplbf9Kp09Eo9PE1TTazd0RbediaU4fHOB5Q4Dobu73MfMW7fLVGg/640?wx_fmt=png)

如果 `extractAll`  是 `true`，也就是在上面的交互中选了 Yes，就会将 `package.json`  里的所有 `key` `configTransforms` 比较，如果都存在，就将配置抽取到独立的文件中。

18. 将内存中的文件输出到硬盘
----------------

上文有提到，`api.render`  会通过 EJS 将模板文件渲染成字符串放在内存中。执行了 `generate`  的所有逻辑之后，内存中已经有了需要输出的各种文件，放在 `this.files`  里。 `generate`  的最后一步就是调用 `writeFileTree`  将内存中的所有文件写入到硬盘。

到这里 `generate`  的逻辑就基本都讲完了，Vue CLI 生成代码的部分也就讲完了。

19. 总结
------

整体看下来，Vue CLI 的代码还是比较复杂的，整体架构条理还是比较清楚的，其中有两点印象最深：

**第一，整体的交互流程的挂载**。将各个模块的交互逻辑通过一个类的实例维护起来，执行时机和成功回调等也是设计的比较好。

**第二，插件机制很重要**。插件机制将功能和脚手架进行解耦。

看来，无论是 create-react-app 还是 Vue CLI，在设计的时候都会尽量考虑**插件机制**，将能力开放出去再将功能集成进来，无论是对于 Vue CLI 本身的核心功能，还是对于社区开发者来说，都具备了足够的开放性和扩展性。

整体代码看下来，最重要的就是两个概念：

*   **Preset**：预设，包括整体的交互流程（Prompt）
    
*   **Plugin**：插件，整体的插件系统
    

围绕这两个概念，代码中的这几个类：**Creator**、**PromptModuleAPI**、**Generator**、**GeneratorAPI** 就是核心。

简单总结一下流程：

1.  执行 `vue create`
    
2.  初始化 `Creator` 实例 `creator`，挂载所有交互配置
    
3.  调用 `creator` 的实例方法 `create`
    
4.  询问用户自定义配置
    
5.  初始化 `Generator` 实例 `generator`
    
6.  初始化各种插件
    
7.  执行插件的 `generator` 逻辑，写 `package.json`、渲染模板等
    
8.  将文件写入到硬盘
    

这样一个 CLI 的生命周期就走完了，项目已经初始化好了。

附：Vue CLI 中可以直接拿来用的工具方法
-----------------------

看完 Vue CLI 的源码，除了感叹这复杂的设计之外，也发现很多工具方法，在我们实现自己的 CLI 时，都是可以拿来即用的，在这里总结一下。

### 获取 CLI 参数

解析 CLI 通过 `--` 传入的参数。

```
const program = require('commander');function camelize(str) {  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));}function cleanArgs(cmd) {  const args = {};  cmd.options.forEach(o => {    const key = camelize(o.long.replace(/^--/, ''));    // if an option is not present and Command has a method with the same name    // it should not be copied    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {      args[key] = cmd[key];    }  });  return args;}
```

### 检查 Node 版本

通过 `semver.satisfies` 比较两个 Node 版本：

*   **process.version**: 当前运行环境的 Node 版本
    
*   **wanted: package.json** 里配置的 Node 版本
    

```
const requiredVersion = require('../package.json').engines.node;function checkNodeVersion(wanted, id) {  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {    console.log(      chalk.red(        'You are using Node ' +          process.version +          ', but this version of ' +          id +          ' requires Node ' +          wanted +          '.\nPlease upgrade your Node version.'      )    );    process.exit(1);  }}checkNodeVersion(requiredVersion, '@vue/cli');
```

### 读取 package.json

```
const fs = require('fs');const path = require('path');function getPackageJson(cwd) {  const packagePath = path.join(cwd, 'package.json');  let packageJson;  try {    packageJson = fs.readFileSync(packagePath, 'utf-8');  } catch (err) {    throw new Error(`The package.json file at '${packagePath}' does not exist`);  }  try {    packageJson = JSON.parse(packageJson);  } catch (err) {    throw new Error('The package.json is malformed');  }  return packageJson;}
```

### 对象排序

这里主要是在输出 package.json 的时候可以对输出的对象先进行排序，更美观一些。。

```
module.exports = function sortObject(obj, keyOrder, dontSortByUnicode) {  if (!obj) return;  const res = {};  if (keyOrder) {    keyOrder.forEach(key => {      if (obj.hasOwnProperty(key)) {        res[key] = obj[key];        delete obj[key];      }    });  }  const keys = Object.keys(obj);  !dontSortByUnicode && keys.sort();  keys.forEach(key => {    res[key] = obj[key];  });  return res;};
```

### 输出文件到硬盘

这个其实没啥，就是三步：

*   fs.unlink 删除文件
    
*   fs.ensureDirSync 创建目录
    
*   fs.writeFileSync 写文件
    

```
const fs = require('fs-extra');const path = require('path');// 删除已经存在的文件function deleteRemovedFiles(directory, newFiles, previousFiles) {  // get all files that are not in the new filesystem and are still existing  const filesToDelete = Object.keys(previousFiles).filter(    filename => !newFiles[filename]  );  // delete each of these files  return Promise.all(    filesToDelete.map(filename => {      return fs.unlink(path.join(directory, filename));    })  );}// 输出文件到硬盘module.exports = async function writeFileTree(dir, files, previousFiles) {  if (previousFiles) {    await deleteRemovedFiles(dir, files, previousFiles);  }  // 主要就是这里  Object.keys(files).forEach(name => {    const filePath = path.join(dir, name);    fs.ensureDirSync(path.dirname(filePath));    fs.writeFileSync(filePath, files[name]);  });};
```

### 判断项目是否初始化 git

其实就是在目录下执行 `git status` 看是否报错。

```
const hasProjectGit = cwd => {  let result;  try {    execSync('git status', { stdio: 'ignore', cwd });    result = true;  } catch (e) {    result = false;  }  return result;};
```

### 对象的 get 方法

可以用 lodash，现在可以直接用 a?.b?.c 就好了

```
function get(target, path) {  const fields = path.split('.');  let obj = target;  const l = fields.length;  for (let i = 0; i < l - 1; i++) {    const key = fields[i];    if (!obj[key]) {      return undefined;    }    obj = obj[key];  }  return obj[fields[l - 1]];}
```

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6z8Ow5UWkhzOrv2Q2wZqztUQia432OJ9QmHicT93TY7NYWA9jX1G8JCETMbAQk3KiaC5HbPZRpV3qMQ/640?wx_fmt=png)