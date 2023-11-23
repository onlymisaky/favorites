> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3Co4WBaPuJ34bF95sPGfUw)

> Hi，大家好。我是 yxchan🧑‍💻。不知道大家团队内的 npm 包代码是「分开管理」还是「合并管理」的呢？

点击上方 前端自习课，关注公众号

回复加群，加入技术交流群交流群

关于代码库管理，一般是两种常见方案：

*   `multirepo`: 把项目按模块拆分为 **多** 个仓库；
    
*   `monorepo`: 把所有项目放在 **单** 个仓库中；
    

multirepo
=========

*   **优点**：每个同学都拥有自己的仓库，可以用自己擅长的「**语言**」、「**工具**」、「**workflow**」等，效率 “高”；
    
*   **缺点**：代码质量得不到保证，如果项目之间存在依赖关系，修复某个项目的`bug`需要同步到其他项目，增加沟通成本；
    

monorepo
========

*   **优点**：能够「统一管理代码」、「代码风格」以及「质量」能得到保障；
    
*   **缺点**：让所有同学都走 “同一条路”，效率可能会降 “低”；
    

以上两种方式，孰优孰劣是个 “哲学” 问题。但对于团队内的「公共组件」而言，我认为`monorepo`模式更加合理 (效率不一定会更高)。

**为什么呢？**

因为同一个团队内，组件之间避免不了会出现相互依赖的情况。设想一下：

有两个模块，`module-a`和`module-b`，`module-b`依赖于`module-a`。这时发现，`module-a`有个`bug`，需要发`bugfix`版本：

*   `multirepo`: `module-a`发布后，需要手动在`module-b`上升级`module-a`的版本。如果有多个`module`依赖`module-a`，又或者`module-b`被`module-other`所依赖，则会变得非常难维护，很容易遗漏;
    
*   `monorepo`: 当`module-a`发布新版本时，借助一些工具，就可以根据`module`间的引用关系，同时发布依赖于`module-a`的相关`module`;
    

没错，一些「工具」指的就是`lerna`。

lerna
=====

> ⚠注意：以下内容并不是`lerna`的使用教程，👉 「lerna 使用教程 [1]」👈。

是什么?
----

The Original Tool forJavaScript Monorepos.

> 用于 TypeScript/JavaScript `monorepo` 的原始工具。

怎么用？
----

自己去看文档 [2]。

同学 A：我想发个 npm 包，要怎么搞？

我：首先`clone`仓库下来，然后在`packages`目录下创建个文件夹`A`，然后在`A`里`npm init`，然后配置相关的打包工具..... 开发完后就参照`lerna`文档进行发布......

同学 A：比新建个仓库还麻烦，`npm publish`不能发布吗？

我：......

确实是，这么一套下来，比新建仓库发布更麻烦，还要去查阅`lerna`的文档来怎么进行构建和发布。再说，程序员🧑‍💻怎么能容忍手动创建文件夹这种事情发生！所以，得想办法解决掉这些 “麻烦”。最后的解决方案，就是`封装`。

封装
--

> 更通俗的说，就是「化繁为简」。

封装的思路主要有 **六** 部分：

*   创建
    

```
$ npm run create
复制代码
```

*   安装
    

```
$ npm run link
复制代码
```

*   测试
    

```
$ npm run test
复制代码
```

*   构建
    

```
$ npm run build
复制代码
```

*   版本
    

```
$ npm run version
复制代码
```

*   发布
    

```
$ npm run release
复制代码
```

这样，只要知道自己当前的步骤，就不用查看文档，直接运行 ⬇️ ：

```
$ npm run 「步骤」
复制代码
```

一步到位！

演示
==

接来下，将会演示 `lernanpm-yxutils` 和 `lernanpm-yxtest` 的「创建」、「安装」、「开发」、「测试」、「构建」、「发布」、「**依赖连接**」、「**同步构建发布**」。

创建
--

运行 ⬇️ ，创建项目：

```
$ npm run create
复制代码
```

可以看到在`packages`下，新增了`yxtest`和`yxutils`两个项目。

安装
--

运行 ⬇️ ，安装项目所需的依赖：

```
$ npm run link
复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHrUmSZiasUeD2iaQCLxRPvtqic6q6X24jzXys4sq781yfIbkxib9UfU0V32W69h87MhgVv9icAexvg8N6A/640?wx_fmt=jpeg)link.gif

选择「默认」安装方式，这样所有项目的依赖都会被安装。

开发
--

添加`say`方法到`yxutils`中，⬇️ ：

> lerna-npm/packages/yxutils/src/features/index.ts

```
/** * 打印 * @return {string} val 打印内容 */interface Isay {  (val: string): void}export let say: Isaysay = (val: string) => {  console.log(val)}复制代码
```

添加`printName`方法到`yxtest`中，⬇️ ：

> lerna-npm/packages/yxtest/src/features/index.ts

```
/** * 打印名字 * @param { string } sFirstName * @param { string } sFirstName * @returns { void } */interface IprintName {  (sFirstName: string, sLastName: string): void}export let printName: IprintNameprintName = (sFirstName: string, sLastName: string) => {  console.log(sFirstName + sLastName)}复制代码
```

测试
--

编写测试代码

> lerna-npm/packages/yxutils/__test__/index.spec.ts

```
import { say } from '../src/index'describe('utils ', () => {  test('This is say test', () => {    const consoleSpy = jest.spyOn(console, 'log')    say('hello')    expect(consoleSpy).toHaveBeenCalledWith('hello')  })})复制代码
```

> lerna-npm/packages/yxtest/__test__/index.spec.ts

```
import { printName } from '../src/index'describe('test ', () => {  test('This is printName test', () => {    const consoleSpy = jest.spyOn(console, 'log')    printName('yx', 'chan')    expect(consoleSpy).toHaveBeenCalledWith('yxchan')  })})复制代码
```

运行 ⬇️ ，进行`jest`测试：

```
$ npm run test
复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHrUmSZiasUeD2iaQCLxRPvtqicrunt5PSqDqIaJkIgNACgbAvUx5kloBy0sU8GhQzW070PQjQ5ZYVzFg/640?wx_fmt=jpeg)test.gif

构建
--

运行 ⬇️ ，进行项目构建：

```
$ npm run build
复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHrUmSZiasUeD2iaQCLxRPvtqicV72mhz5Lut0yuo3YnP5CXOaRoMWnIZ1lY3eNooprGHBX3xNxswCO4A/640?wx_fmt=jpeg)build.gif

选择「默认」构建方式，这样所有「未被构建过」 or 「有代码变动」的项目都会被构建（也可以选择「自定义」模式，选择构建「一个」or「多个」指定项目）。

可以看到的`yxutils`和`yxtest`目录下都多了个代码打包后生成的`dist`目录。

版本
--

紧接着，来到「更新版本号」。在进行这一步之前，要先确保「提交代码」。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHrUmSZiasUeD2iaQCLxRPvtqicJndkYDOQfrHP3N4EHDcgFcIelkeye6U4icbXAAz3mhl1LdO3T8OFYtg/640?wx_fmt=jpeg)version.gif

此时，会自动打上`tag`，并且推送到「远程仓库」：

```
$ git tag// lernanpm-yxtest@0.0.1// lernanpm-yxutils@0.0.1复制代码
```

发布
--

运行 ⬇️ ，一键发布。

```
$ npm run release
复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHrUmSZiasUeD2iaQCLxRPvtqicpmKPyhwn7MxanLdhmU4UP8sfubMOInFGtL0ibAGyjF4TSLU0fNR4olw/640?wx_fmt=jpeg)release.gif

至此，已经完成发布一个独立的「npm 包」的完整流程。

依赖连接
----

`yxtest`中的`printName`方法内其实可以调用`yxutils`已经封装好了`say`方法。

因此，可以在`yxtest`中连接`yxutils`，然后使用`say`方法。

运行 ⬇️ ：

```
$ npm run link
复制代码
```

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHrUmSZiasUeD2iaQCLxRPvtqicm6kYAOG2Fb7cSa7kxBnuO8icbVL58xanMdq90sMeqibfM6GzicoV5ibIyA/640?wx_fmt=jpeg) 选择「自定义」模式，选择 `yxtest` 为「目标 Module」，`lernanpm-yxutils`为「依赖名称」，`dependencies`为「依赖位置」。

此时，可以在`yxtest`的`package.json`中的`dependencies`看到，`lernanpm-yxutils`已添加成功。

修改代码:

> lerna-npm/packages/yxtest/src/features/index.ts

```
import { say } from 'lernanpm-yxutils'/** * 打印名字 * @param { string } sFirstName * @param { string } sFirstName * @returns { void } */interface IprintName {  (sFirstName: string, sLastName: string): void}export let printName: IprintNameprintName = (sFirstName: string, sLastName: string) => {  say(sFirstName + sLastName)}复制代码
```

然后，再跑一遍「测试」、「构建」、「版本」、「发布」流程。

同步构建发布
------

在上一步骤，已经让`yxtest`与`yxutils`建立了连接，接下来尝试修改`yxutils`。

> lerna-npm/packages/yxutils/src/features/index.ts

```
/** * 打印 * @return {string} val 打印内容 */interface Isay {  (val: string): void}export let say: Isaysay = (val: string) => {  console.log(val.split('').join(''))}复制代码
```

可以看到，因为`yxtest`依赖了`yxutils`，即使`yxtest`没有代码改动，也被同步「打包」、「构建」、「发布」了。

实现
==

项目地址：lerna-npm[3]

创建
--

主要是为了解决「_在`packages`目录下创建个文件夹`A`，然后在`A`里`npm init`，然后配置相关的打包工具_」这个繁琐的过程。

> lerna-npm/scripts/create/index.ts

### entry

```
/** * 程序入口 * @param {object} payload sModule(模块名)、sDescription(模块描述)、sName(作者名称) * @returns {void} */interface Ientry {  (payload: { sModule: string; sDescription: string; sName: string }): void}let entry: Ientryentry = ({ sModule, sDescription, sName }) => {  if (!sModule) {    console.log(chalk.red(`[ERROR] The package name can not be empty!`))    return  }  console.log(chalk.blue(`[INFO] Start creating "${sModule}"...`))  const foldPath = createFold(sModule)  if (!foldPath) return  pullLocalTemp(foldPath, sModule, sDescription, sName)    .then(() => {      console.log(        chalk.green(          `[SUCCESS] Congratulations! The "${sModule}" create successfully!`        )      )    })    .catch(() => {      console.log(chalk.red(`[ERROR] Sorry! The "${sModule}" create failed!`))      // 删除创建失败的项目      rimraf(foldPath, () => {        console.log(chalk.blue(`[INFO] Delete "${sModule}" package fold!`))      })    })}复制代码
```

1.  通过 inquirer[4] 工具，拿到命令行交互后的数据`sModule`、`sDescription`和`sName`；
    
2.  把相关参数传入`entry`函数；
    
3.  创建名为`sModule`的文件夹；
    
4.  通过`pullLocalTemp`函数写入模板内容；
    
5.  如果项目创建失败就删除已创建的文件夹；
    

接下来看看`pullLocalTemp`干了什么：

### pullLocalTemp

```
/** * 拉取模板，生成目标项目 * @param {string} sDestpath 文件夹路径 * @param {string} sModule 模块名 * @param {string} sDescription 模块描述 * @param {string} sName 作者名称 * @returns {Promise<boolean>} */interface IpullLocalTemp {  (    sDestpath: string,    sModule: string,    sDescription: string,    sName: string  ): Promise<boolean>}let pullLocalTemp: IpullLocalTemppullLocalTemp = (  sDestpath: string,  sModule: string,  sDescription: string,  sName: string) => {  return new Promise((resolve, reject) => {    const metadata = {      pkgName: sModule,      pkgCamelName: toCamel(sModule),      description: sDescription,      name: sName    }    // 把文件转换为js对象    Metalsmith(__dirname)      .metadata(metadata) // 需要替换的数据      .source(sTempPath) // 模板位置      .destination(sDestpath) // 目标位置      .use((files, metalsmith, done) => {        // 遍历需要替换模板        Object.keys(files).forEach(fileName => {          // 需先转换为字符串          const fileContentsString = files[fileName].contents.toString()          // 重写文件内容          files[fileName].contents = Buffer.from(            // 使用定义的metaData取代模板变量            Handlebars.compile(fileContentsString)(metalsmith.metadata())          )        })        done(null, files, metalsmith)      })      .build(function (err) {        if (err) {          console.log(chalk.red(`[ERROR] Metalsmith build error!`))          reject(false)          throw err        }        resolve(true)      })  })}复制代码
```

这个函数的功能很简单，就是使用 metalsmith[5] 把相关参数传入`template`中，替换掉对应坑位中的内容，然后输出模板。

目前支持的模板：

*   [x]  rollup
    
*   [ ]  glup
    
*   [ ]  webpack
    

安装
--

同学 A: `npm i` 不能安装依赖？

该封装主要是解决依赖「**安装位置**」问题以及「**链接依赖**」问题。

设想一下，假如`packages`下有两个模块，`module-a`和`module-b`：

1.  该模块都引用了第三方模块`lodash`。如果正常`install`，则在`module-a`和`module-b`的`node_modules`下都包含`lodash`，这样就会造成空间的浪费。针对这种情况，应该把多次引用的第三方模块提升至顶层的`node_modules`；
    
2.  `module-b`依赖了`module-a`，在`module-b`的代码中引用`module-a`暴露的方法。这种情况就比较麻烦了 (`npm link`)，虽然有解决方案，但并不完美；
    

很幸运，`lerna`提供了`lerna run build`，能完美解决以上两种情况。

所以，要做的就是对`lerna run build`命令的封装。很简单，通过「问答」，拿到「**安装模式**」、「**依赖名称**」、「**项目名称**」、「**安装位置**」，再构造`lerna`命令。

> scripts/link/link.ts

```
/** * 安装依赖 * @param {Object} payload sInstallType(安装模式)、sInstallModule(依赖名称)、sTargetModule(项目名称)、sOption(安装位置) * @returns {void} */interface Iinstall {  (payload: {    sInstallType: string    sInstallModule?: string    sTargetModule?: string    sOption?: string  }): void}let install: Iinstallinstall = ({ sInstallType, sInstallModule, sTargetModule, sOption }) => {  // 一键安装  if (sInstallType === 'all') {    run('lerna', ['bootstrap', '--hoist'])    // 自定义安装  } else {    run(      'lerna',      ['add', sInstallModule || '', `--scope=lernanpm-${sTargetModule}`].concat(        sOption === 'normal' ? [] : [`--${sOption}`]      )    )  }}复制代码
```

有「安装』，当然也有「卸载」。同理也是通过「问答」的模式，拿到「**项目名称**」(需要卸载依赖的项目)、「**依赖名称**」，再构造`lerna`命令。

> scripts/link/unlink.ts

```
/** * 卸载依赖 * @param {Object} payload sTargetModule(目标项目)、sDelModule(卸载依赖名称) * @returns {void} */interface Iuninstall {  (payload: { sTargetModule: string; sDelModule: string }): void}let uninstall: Iuninstalluninstall = ({ sTargetModule, sDelModule }) => {  run('lerna', [    'exec',    `--scope=lernanpm-${sTargetModule}`,    `npm uninstall ${sDelModule}`  ])}复制代码
```

测试
--

同理。

有两种测试模式：

1.  全量：运行「全部」项目的测试
    
2.  自定义：运行「特定」项目的测试
    

> scripts/test/index.ts

```
/** * 测试项目 * @param {Object} payload sTestType(测试模式)、sTargetModule(目标项目) * @returns {void} */interface Itest {  (payload: { sTestType: string; sTargetModule?: string }): void}let test: Itesttest = ({ sTestType, sTargetModule }) => {  // 默认测试方式  if (sTestType === 'all') {    run('lerna', ['run', 'test', '--no-sort'])    // 自定义测试方式  } else {    run('lerna', ['run', 'test', `--scope=lernanpm-${sTargetModule}`])  }}复制代码
```

构建
--

同理。

有两种构建模式：

1.  全量：构建「所有」项目
    
2.  自定义：构建「特定」项目
    

> scripts/build/index.ts

```
/** * 构建项目 * @param {Object} payload sBuildType(构建模式)、vPackages(项目名称) * @returns {void} */interface Ibuild {  (payload: { sBuildType: string; vPackages?: Array<string> }): void}let build: Ibuildbuild = ({ sBuildType, vPackages }) => {  // 默认构建方式  if (sBuildType === 'all') {    run('lerna', ['run', 'build'])    // 自定义构建方式  } else {    vPackages &&      vPackages.forEach(async pkg => {        await run('lerna', ['run', 'build', `--scope=lernanpm-${pkg}`])      })  }}复制代码
```

版本
--

`lerna`提供的版本号构建命令，可供选择的参数不多，而且自带「问答」模式，固毋需对命令再封装。

```
"version": "lerna version"复制代码
```

> ⚠️注意：得益于 nx[6]，「**有代码改动**」& 与其有「**依赖关系**」的项目都会被重新构建新的版本号。

发布
--

`lerna`提供的发布命令，可供的选择也是不多，也是自带「问答」模式，亦毋需对命令再封装。

```
"release": "lerna publish from-package"复制代码
```

> ⚠️注意：所有被「新构建过版本号」的项目，都会被发布。

注意
==

1.  使用`npm run link`连接`packages`的其它模块时，要确保该模块与当前模块是高度耦合的，并且稳定、可靠；
    
2.  确保在开发某个模块时，只改动「当前模块」的代码！因为，任何模块的代码改动都会被识别，即使被改动模块没有被重新构建，版本亦会被更新发布；
    
3.  若要卸载某个模块的依赖，可以运行`npm run unlink`；
    
4.  单独执行某个模块的测试，可以运行`npm run test`；
    
5.  `npm run version`失败的情况一般分两种：
    

*   没有提交当前代码改动：提交当前代码后即可正常升级版本；
    
*   手动修改过版本：在`package.json`里修改成「目标版本」，然后删除「本地」和「远程」有冲突的`tag`；
    

7.  删除某个模块的特定版本，可以运行`npm unpublish moduleName@version`(不建议，直接发个新版本覆盖更合理)，然后删除本地和远程相关的`tag`；
    
8.  查看`packages`下模块之间的引用关系，可以`npx nx graph`；
    

最后
==

由于时间关系，项目还有很多可以优化的地方，好比如：支持多模板、丰富命令参数等等。目前只是对`lerna`最基础的参数进行封装，基于「简单」的原则，很多参数比较少用到，所以并没有封装在里面。但可以直接使用`lerna`的命令运行。

By the way，这是我第一篇掘金文章，很感谢你能看到这里。祝你工作顺利、生活愉快！

「--- The end ---」

关于本文  

作者：JustCarryOn
==============

https://juejin.cn/post/7134646424083365924