> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3h86y4oBXiDKoYo849b8ng)

前言
--

GithubBlog：https://github.com/Nealyang/PersonalBlog/issues/99

背景如是：

*   [pmlci 源码脚手架：https://mp.weixin.qq.com/s/JRF4GjYqXw1f6jGqcYofnQ](https://mp.weixin.qq.com/s?__biz=MzIxNjgwMDIzMA==&mid=2247486978&idx=1&sn=f0838b344671b21f166feb3a17d77626&scene=21#wechat_redirect)
    

随着脚手架的提供，以及新增页面和模块的功能封装。

毕竟 **「多提供一层规范，就多了一层约束。」** 而架构的本质是为了让开发者能够将精力更加的 focus 到业务的开发中，无需关心其他。比如上述脚手架初始化出来的一些模块配置、异步加载甚至一些已定义并且保留在初始化架构中的一些业务 `hooks` 等。

如上原因，我希望能够提供一套可视化的操作（创建项目、选择依赖、添加页面，选择所需物料、配置物料属性等），一言以蔽之就是让用户对于源码开发而言，只需要编写对应的业务模块组件，而不需管理架构是如何组织模块和状态分发的，**「除了业务模块编码，其他都是可视化操作」**。

因为团队里 100% 的同学都是以 `vscode` 作为饭碗，所以自然而然的 `vscode extinction` 就是我的第一选择了。计划中会提供创建项目、新增页面、模块配置、页面配置、新增模块等一系列插件。后续阶段性进展，再发文总结。咳咳，是的，这将是一个**「源码工作台」**的赶脚~

截止目前，已经将项目的脚手架基本搭建了个 90% ，此处作为第一阶段性总结。

成果展示
----

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0N26pweKT8x4oX4x5awib19b5C2hj4DcGLyJibicy0LIVsyBGWlZQLcgzicKHSUVHvB6Ag91LkdPibkN0w/640?wx_fmt=gif)demo![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bdVdfxIEn0VnlprzE2ywqqzdZDTYDhRjmIeiaFYx4AoF6TDVHgCMgdLw/640?wx_fmt=png) 项目目录

`extensions` 文件夹为 `vscode` 插件的文件夹、`packages` 文件夹是存放公共的组件、`scripts` 为发布、构建、开发的脚本，其他就是一些工程配置。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19biahSAzPpXPhiaLL1GN3weljGWNy9NUx3oZwl1GHeiaIia2qNaCrwjWxGOQ/640?wx_fmt=png)

> ❝
> 
> 当然，这里最主要不是产品功能的展示，嘎嘎~
> 
> ❞

### packages.json scripts

```
"scripts": {    "publish": "lerna list && publish:package",    "publish-beta": "lerna list && npm run publish-beta:package",    "start":"tnpm run start:packages && tnpm run start:extensions",    "start:packages": "tnpm run setup:packages && tnpm run packages:watch",    "start:extensions":"tnpm run extensions:link",    "commit": "git-cz",    "env": "node ./scripts/env.js",    "packages:link": "lerna link",    "packages:install": "rm -rf node_modules && rm -rf ./packages/*/node_modules && rm -rf ./packages/*/package-lock.json && SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/ yarn install --registry=http://registry.npm.taobao.org",    "packages:clean": "rm -rf ./packages/*/lib",    "packages:watch": "ts-node ./scripts/watch.ts",    "packages:build": "npm run packages:clean && ts-node ./scripts/build.ts",    "setup:packages": "npm run packages:install && lerna clean --yes && npm run packages:build && npm run packages:link ",    "publish-beta:package": "ts-node ./scripts/publish-beta-package.ts",    "publish:package": "ts-node ./scripts/publish-package.ts",    "extensions:install": " rm -rf ./extensions/*/node_modules && rm -rf ./extensions/*/package-lock.json && rm -rf ./extensions/*/web/node_modules && rm -rf ./extensions/*/web/package-lock.json && ts-node ./scripts/extension-deps-install.ts",    "extensions:link": "ts-node ./scripts/extension-link-package.ts"  }
```

`scripts` 没有添加完全，目前开发直接 `npm start` 发布 `packages` 分别为 `npm run publish-beta:package` 、 `npm run publish:package` , 上面也有 `publish` 的命令汇总。

架构选型
----

目前是为了将 `pmCli` 功能全部封装成插件，然后通过可视化替代掉编码过程中关于架构配置的相关操作。所以插件必然不会只有一个，而是一个基于源码架构的一个**「操作集」**：多 `extensions`。插件中有非常多的相似功能封装。比如从 `gitlab` 上读取基础文件、`vscode` 和 `WebView` 的通信、`AST` 的基本封装等，所以必然需要依赖非常多的 `packages` ，为了开发提效和集合的统一管理，必然想到基于 `lerna` 的`monorepo` 的项目结构。 ![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bznF4cTt2YrulzBkCPic7c6P66uEEjOm81D6rXzYWJ4vw7M0ibmAzZXkw/640?wx_fmt=png)

其中关于 lerna 的一些采坑就不多说了，主要是我也只是看了市面上大部分的实践文章和官方文档，缺乏一些自己实践（毕竟感觉研究多也解决不了多大的痛点，就不想花精力了）最终的 `monorepo` 是基于 `yarn workspace` 实现的，通过 `lerna link` 来软链`package`、`lerna` 的发布 `package` 比较鸡肋，就参考 `App works` 自己写了一些打包发布到预发、线上的脚本。

项目工作流以及编码约束通过`husky`、`lint-staged`、`git-cz`、 `eslint`、`prettier`等常规配置。

编码采用 `ts` 编码，所以对于 `extensions` 以及 `packages` 中都有很多公共的配置，这里可以提取出来公共部分放置到项目根目录下（如上项目目录截图）。

实践
--

通过 `lerna init`、`lerna create xxx` 来初始化这里就不说了。反正完事以后就是带有一个`packages` 和 `package.json` 文件的一个目录结构。

### 项目架构

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bcQwdxibCicBTZfVVuMAKbOrw3J7dibHicGIRiaLqxrnBp3wS2CpiajaAqYEw/640?wx_fmt=png)项目结构

### package 结构

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bSvNfDZjfS2DibMmq7luiavy2zMrm8AskD6MTNWiaptHVjglwKB9ld2spA/640?wx_fmt=png)package

> ❝
> 
> 以上结构说明都在图片里了
> 
> ❞

### 脚本封装

在项目的根目录下放置了一个 `scripts` 文件夹，存放着一些发布、开发以及依赖的安装的脚本啥的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bibeWQdxUzIvAEHLJk8ic0f9Tol5N1lB7mtIwqtFNfZbVicaIjIRdlw0Yw/640?wx_fmt=png)scripts

#### getPakcageInfo.ts

> ❝
> 
> 用于从 `packages` 中获取相关 `publish` 信息。其中`shouldPublish`是将本地 `version` 和线上 `version` 对比，判断师傅需要执行 `publish` 的
> 
> ❞

```
/* * @Author: 一凨 * @Date: 2021-06-07 18:47:32 * @Last Modified by: 一凨 * @Last Modified time: 2021-06-07 19:12:28 */import { existsSync, readdirSync, readFileSync } from 'fs';import { join } from 'path';import { getLatestVersion } from 'ice-npm-utils';const TARGET_DIRECTORY = join(__dirname, '../../packages');// 定义需要获取到的信息结构export interface IPackageInfo {  name: string;  directory: string;  localVersion: string;  mainFile: string; // package.json main file  shouldPublish: boolean;}// 检查 package 是否 build 成功function checkBuildSuccess(directory: string, mainFile: string): boolean {  return existsSync(join(directory, mainFile));}// 判断线上最新version是否和本地 version 相同function checkVersionExists(pkg: string, version: string): Promise<boolean> {  return getLatestVersion(pkg)    .then((latestVersion) => version === latestVersion)    .catch(() => false);}export async function getPackageInfos ():Promise<IPackageInfo[]>{  const packageInfos: IPackageInfo[] = [];  if (!existsSync(TARGET_DIRECTORY)) {    console.log(`[ERROR] Directory ${TARGET_DIRECTORY} not exist!`);  } else {    // 拿到所有packages 目录，再去遍历其 package.json    const packageFolders: string[] = readdirSync(TARGET_DIRECTORY).filter((filename) => filename[0] !== '.');    console.log('[PUBLISH] Start check with following packages:');    await Promise.all(      packageFolders.map(async (packageFolder) => {        const directory = join(TARGET_DIRECTORY, packageFolder);        const packageInfoPath = join(directory, 'package.json');        // Process package info.        if (existsSync(packageInfoPath)) {          const packageInfo = JSON.parse(readFileSync(packageInfoPath, 'utf8'));          const packageName = packageInfo.name || packageFolder;          console.log(`- ${packageName}`);     // 从 package.json 中取信息 返回          try {            packageInfos.push({              name: packageName,              directory,              localVersion: packageInfo.version,              mainFile: packageInfo.main,              // If localVersion not exist, publish it              shouldPublish:                checkBuildSuccess(directory, packageInfo.main) &&                !(await checkVersionExists(packageName, packageInfo.version)),            });          } catch (e) {            console.log(`[ERROR] get ${packageName} information failed: `, e);          }        } else {          console.log(`[ERROR] ${packageFolder}'s package.json not found.`);        }      }),    );  }  return packageInfos;}
```

代码的解释都在注释里了，核心做的事情就是，从 `packages` 中读取每一个 `package` 的 `package.json` 中的信息，然后组成需要的格式返回出去，用于发布。

#### publish-beta-package

```
/* * @Author: 一凨 * @Date: 2021-06-07 18:45:51 * @Last Modified by: 一凨 * @Last Modified time: 2021-06-07 19:29:26 */import * as path from 'path';import * as fs from 'fs-extra';import { spawnSync } from 'child_process';import { IPackageInfo, getPackageInfos } from './fn/getPackageInfos';const BETA_REG = /([^-]+)-beta\.(\d+)/; // '1.0.0-beta.1'interface IBetaPackageInfo extends IPackageInfo {  betaVersion: string;}function setBetaVersionInfo(packageInfo: IPackageInfo): IBetaPackageInfo {  const { name, localVersion } = packageInfo;  let version = localVersion;  if (!BETA_REG.test(localVersion)) {    // 如果 localVersion 不是 beta version，则盘他！    let betaVersion = 1;    // 获取package 的 dist-tag 相关信息    const childProcess = spawnSync('npm', ['show', name, 'dist-tags', '--json'], {      encoding: 'utf-8',    });    const distTags = JSON.parse(childProcess.stdout || "{}") || {};    const matched = (distTags.beta || '').match(BETA_REG);    // 1.0.0-beta.1 -> ["1.0.0-beta.1", "1.0.0", "1"] -> 1.0.0-beta.2    if (matched && matched[1] === localVersion && matched[2]) {      // 盘 version，+1      betaVersion = Number(matched[2]) + 1;    }    version += `-beta.${betaVersion}`;  }  return Object.assign({}, packageInfo, { betaVersion: version });}// 将矫正后的 betaVersion 写到对应 package.json 中function updatePackageJson(betaPackageInfos: IBetaPackageInfo[]): void {  betaPackageInfos.forEach((betaPackageInfo: IBetaPackageInfo) => {    const { directory, betaVersion } = betaPackageInfo;    const packageFile = path.join(directory, 'package.json');    const packageData = fs.readJsonSync(packageFile);    packageData.version = betaVersion;    for (let i = 0; i < betaPackageInfos.length; i++) {      const dependenceName = betaPackageInfos[i].name;      const dependenceVersion = betaPackageInfos[i].betaVersion;      if (packageData.dependencies && packageData.dependencies[dependenceName]) {        packageData.dependencies[dependenceName] = dependenceVersion;      } else if (packageData.devDependencies && packageData.devDependencies[dependenceName]) {        packageData.devDependencies[dependenceName] = dependenceVersion;      }    }    fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2));  });}// npm publish --tag=beta 发布function publish(pkg: string, betaVersion: string, directory: string): void {  console.log('[PUBLISH BETA]', `${pkg}@${betaVersion}`);  spawnSync('npm', ['publish', '--tag=beta'], {    stdio: 'inherit',    cwd: directory,  });}// 入口文件console.log('[PUBLISH BETA] Start:');getPackageInfos().then((packageInfos: IPackageInfo[]) => {  const shouldPublishPackages = packageInfos    .filter((packageInfo) => packageInfo.shouldPublish)    .map((packageInfo) => setBetaVersionInfo(packageInfo));  updatePackageJson(shouldPublishPackages);  // Publish  let publishedCount = 0;  const publishedPackages = [];  shouldPublishPackages.forEach((packageInfo) => {    const { name, directory, betaVersion } = packageInfo;    publishedCount++;    // 打印此次发布的相关信息    console.log(`--- ${name}@${betaVersion} ---`);    publish(name, betaVersion, directory);    publishedPackages.push(`${name}:${betaVersion}`);  });  console.log(`[PUBLISH PACKAGE BETA] Complete (count=${publishedCount}):`);  console.log(`${publishedPackages.join('\n')}`);});
```

基本功能都在注释里了（这句话后面不赘述了），总结次脚本作用：

*   拿到所有的本地 packageInfo 信息
    
*   对比线上（已发布）信息，纠正此次发布需要的版本信息
    
*   将纠正的版本信息补充道（写入）本地对应的 package 中的 package.json 中
    
*   调用脚本，执行发布
    

> ❝
> 
> `publish-package` 就非常简单了，写的也比较简单，就是调用 `npm publish` ，当然，也需要一些基本的线上校验，比如上述的 `shouldPublish`。不赘述了！
> 
> 需要注意的是，发布的时候，需要注意登陆（`npm whoami`）以及如果你也是采用`@xxx/`的命名方式的话，注意对应 `organization`的权限
> 
> ❞

#### watch

主要借助 nsfw 的能力对本地文件进行监听。**「有变动，咱编译就完事了！」**

```
/* * @Author: 一凨 * @Date: 2021-06-07 20:16:09 * @Last Modified by: 一凨 * @Last Modified time: 2021-06-10 17:19:05 */import * as glob from 'glob';import * as path from 'path';import * as fs from 'fs-extra';import { run } from './fn/shell';// eslint-disable-next-line @typescript-eslint/no-var-requiresconst nsfw = require('nsfw');async function watchFiles(cwd, ext) {  const files = glob.sync(ext, { cwd, nodir: true });  const fileSet = new Set();  /* eslint no-restricted-syntax:0 */  for (const file of files) {    /* eslint no-await-in-loop:0 */    await copyOneFile(file, cwd);    fileSet.add(path.join(cwd, file));  }  const watcher = await nsfw(cwd, (event) => {    event.forEach((e) => {      if (        e.action === nsfw.actions.CREATED ||        e.action === nsfw.actions.MODIFIED ||        e.action === nsfw.actions.RENAMED      ) {        const filePath = e.newFile ? path.join(e.directory, e.newFile!) : path.join(e.directory, e.file!);        if (fileSet.has(filePath)) {          console.log('non-ts change detected:', filePath);          copyOneFile(path.relative(cwd, filePath), cwd);        }      }    });  });  watcher.start();}watchFiles(path.join(__dirname, '../packages'), '*/src/**/!(*.ts|*.tsx)').catch((e) => {  console.trace(e);  process.exit(128);});// 在这之上的代码都是为了解决 tsc 不支持 copy 非 .ts/.tsx 文件的问题async function tscWatcher() {  await run('npx tsc --build ./tsconfig.json -w');}tscWatcher();async function copyOneFile(file, cwd) {  const from = path.join(cwd, file);  const to = path.join(cwd, file.replace(/src\//, '/lib/'));  await fs.copy(from, to);}
```

#### extensions-deps-install

因为我们的 `workspace` 是 `packages` 目录下，所以针对于 `extensions` 下的插件以及 `web` 页面，我们没有办法通过 `yarn` 直接`install` 所有依赖，随意提供了一个插件安装依赖的脚本。**「其实就是跑到项目目录下，去执行 `npm i`」**

```
import * as path from 'path';import * as fse from 'fs-extra';import * as spawn from 'cross-spawn';export default function () {  const extensionsPath = path.join(__dirname, '..', '..', 'extensions');  const extensionFiles = fse.readdirSync(extensionsPath);  const installCommonds = ['install'];  if (!process.env.CI) { // 拼接参数    installCommonds.push('--no-package-lock');    installCommonds.push('--registry');    installCommonds.push(process.env.REGISTRY ? process.env.REGISTRY : 'http://registry.npm.taobao.org');  }  for (let i = 0; i < extensionFiles.length; i++) {    // 遍历安装，如果有 web 目录，则继续安装 web 页面里的依赖    const cwd = path.join(extensionsPath, extensionFiles[i]);    // eslint-disable-next-line quotes    console.log("Installing extension's dependencies", cwd);    spawn.sync('tnpm', installCommonds, {      stdio: 'inherit',      cwd,    });    const webviewPath = path.join(cwd, 'web');    if (fse.existsSync(webviewPath)) {      // eslint-disable-next-line quotes      console.log("Installing extension webview's dependencies", webviewPath);      spawn.sync('tnpm', installCommonds, {        stdio: 'inherit',        cwd: webviewPath,      });    }  }}
```

> ❝
> 
> 注意 `scripts` 都是 ts 编码，所以在 `npmScripts` 中采用 `ts-node` 去执行
> 
> ❞

#### extension-link-package

删除本地相关的 package，让其递归向上（应用级）查找到对应软链后的 package

```
import * as path from 'path';import * as fse from 'fs-extra';import { run } from './fn/shell';(async function () {  const extensionsPath = path.join(__dirname, '../extensions');  const extensionFiles = await fse.readdir(extensionsPath); // 获取 extensions 下的插件列表，挨个遍历执行 remove  return await Promise.all(    extensionFiles.map(async (extensionFile) => {      const cwd = path.join(extensionsPath, extensionFile);      if (fse.existsSync(cwd)) {        // link packages to extension        if (!process.env.CI) {          await removePmworks(cwd);        }        const webviewPath = path.join(cwd, 'web');        if (fse.existsSync(webviewPath)) {          // link packages to extension webview          if (!process.env.CI) {            await removePmworks(webviewPath);          }        }      }    }),  );})().catch((e) => {  console.trace(e);  process.exit(128);});// 删除 @pmworks 下的依赖async function removePmworks(cwd: string) {  const cwdStat = await fse.stat(cwd);  if (cwdStat.isDirectory()) {    await run(`rm -rf ${path.join(cwd, 'node_modules', '@pmworks')}`);  }}
```

#### 小小总结

核心脚本目前就如上吧，其实都是比较简单直接的功能。关于 extensions 的发布啥的还没有写，其实也可以从 appworks 中借（抄）鉴（袭）到的。等后续发布插件了再补充吧。

一个项目完成基建以后，基本就可以开工了。这里我拿创建项目来举例子吧（着重说基建部分，对插件功能和实现不展开具体的解释，第二阶段再总结吧）。

### vscode extensions（vscode-webview 封装举例）

我们通过 `yo code` 在 `extensions` 文件夹中去初始化一下我们要写的插件。具体的基础知识，参考官方文档：https://code.visualstudio.com/api

如上以后，我们有了一个项目的基本架构，包的一系列管理，就已经可以进入到我们的开发阶段了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19b8PK6Pw2j4mVuRzZ1TtkU1FDKFrgYIiamPibkDCvu2h7s9eF7ibIdsiblmQ/640?wx_fmt=png)

毕竟我们插件是为了可视化的一系列操作，那么`vscode` 的按钮和命令必然满足不了我们，需要一个操作界面：`webView`。如上图是一个带有 `webView` 插件的整体交互过程：

*   `Common-xxx(utils)` 是负责整个项目级别一些通用功能封装
    
*   `Extension-utils` 是针对某一个插件提取的一些方法库，比如 `project-utils` 是 `createProject` 初始化项目时候用到的方法库，类似于一个 `controller`
    
*   `extension-service` 是承载 `vscode` 和 `webView` 通信的一些方法提取，顾名思义：`service`
    

上面说的有些绕，与传统 `MVC` 不同的是这里的 view 有两个：`vscode-extension` 和 `extension-webview`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bHSyHKc64sl9HH2wIDTt4mJ9UxE8LTaibyExUUPVtia5oNuyV9dd3XH4g/640?wx_fmt=png)

举个栗子！这里以初始化一个项目教授架为例子吧~

> ❝
> 
> 关于 vscode  extension with WebView 相关基础概念可以看这里：https://code.visualstudio.com/api/extension-guides/webview
> 
> ❞

#### WebView

WebView 其实没有太多要准备的，就是准备 HTML、JavaScript 和 css 前端三大件就行了。

这里我使用的 ice 的脚手架初始化出来的项目：`npm init ice`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bSpSXj0EyQIp7cHxpp7fdcT8VbENG4PhRKJT6EEXfQRFtJP0gIoQmibw/640?wx_fmt=png)web

然后修改 `build.json` 中的`outputDir`配置，以及指定为 `mpa` 模式

```
{  "mpa": true,  "vendor": false,  "publicPath": "./",  "outputDir": "../build",  "plugins": [    [      "build-plugin-fusion",      {        "themePackage": "@alifd/theme-design-pro"      }    ],    [      "build-plugin-moment-locales",      {        "locales": [          "zh-cn"        ]      }    ],    "@ali/build-plugin-ice-def"  ]}
```

码完代码以后得到我们的三大件即可。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bcedaYk7JuRhtibGz7By8MyeIuWib8l05AcdR7eCVXTHAgLHLJ4MGGvjg/640?wx_fmt=png)build 后的文件输出

> ❝
> 
> 更多关于 ice 的文档，请移步官方文档
> 
> ❞

#### Extensions

```
import * as vscode from 'vscode';import { getHtmlFroWebview, connectService } from "@pmworks/vscode-webview";import { DEV_WORKS_ICON } from "@pmworks/constants";import services from './services';export function activate(context: vscode.ExtensionContext) { const { extensionPath } = context; let projectCreatorPanel: vscode.WebviewPanel | undefined; const activeProjectCreator = () => {  const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;  if (projectCreatorPanel) {   projectCreatorPanel.reveal(columnToShowIn)  } else {   projectCreatorPanel = vscode.window.createWebviewPanel('BeeDev', '初始化源码架构', columnToShowIn || vscode.ViewColumn.One, {    enableScripts: true,    retainContextWhenHidden: true,   });  }  projectCreatorPanel.webview.html = getHtmlFroWebview(extensionPath, 'projectcreator', false);  projectCreatorPanel.iconPath = vscode.Uri.parse(DEV_WORKS_ICON);  projectCreatorPanel.onDidDispose(   () => {    projectCreatorPanel = undefined;   },   null,   context.subscriptions,  );  connectService(projectCreatorPanel, context, { services }); } let disposable = vscode.commands.registerCommand('devworks-project-creator.createProject.start', activeProjectCreator); context.subscriptions.push(disposable);}export function deactivate() { }
```

这里也都是常规操作，注册命令和相关回调，初始化 `WebView` 。这里说下`getHtmlFroWebview`

```
/** * 给本地资源带上安全协议 * @param url 本地资源路径 * @returns 带有 vscode-resource 协议的安全路径 */function originResourceProcess(url: string) {  return vscode.Uri.file(url).with({ scheme: 'vscode-resource' });}export const getHtmlFroWebview = (  extensionPath: string,  entryName: string,  needVendor?: boolean,  cdnBasePath?: string,  extraHtml?: string,  resourceProcess?: (url: string) => vscode.Uri,): string => {  resourceProcess = resourceProcess || originResourceProcess;  const localBasePath = path.join(extensionPath, 'build');  const rootPath = cdnBasePath || localBasePath;  const scriptPath = path.join(rootPath, `js/${entryName}.js`);  const scriptUri = cdnBasePath ?    scriptPath :    resourceProcess(scriptPath);  const stylePath = path.join(rootPath, `css/${entryName}.css`);  const styleUri = cdnBasePath ?    stylePath :    resourceProcess(stylePath);  // vendor for MPA  const vendorStylePath = path.join(rootPath, 'css/vendor.css');  const vendorStyleUri = cdnBasePath    ? vendorStylePath    : resourceProcess(vendorStylePath);  const vendorScriptPath = path.join(rootPath, 'js/vendor.js');  const vendorScriptUri = cdnBasePath    ? vendorScriptPath    : resourceProcess(vendorScriptPath);  // Use a nonce to whitelist which scripts can be run  const nonce = getNonce();  return `<!DOCTYPE html>  <html>  <head>    <meta charset="utf-8">    <meta ${styleUri}">    ${extraHtml || ''}    ` +    (needVendor ? `<link rel="stylesheet" type="text/css" href="${vendorStyleUri}" />` : '') +    `  </head>  <body>    <noscript>You need to enable JavaScript to run this app.</noscript>    <div id="ice-container"></div>    ` +    (needVendor ? `<script nonce="${nonce}" src="${vendorScriptUri}"></script>` : '') +    `<script nonce="${nonce}" src="${scriptUri}"></script>  </body></html>`;}function getNonce(): string {  let text = '';  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';  for (let i = 0; i < 32; i++) {    text += possible.charAt(Math.floor(Math.random() * possible.length));  }  return text;}
```

方法位于 `packages/vscode-webview/vscode.ts` ，其实**「就是获取一段 html」**，将本地资源添加 `vscode` 协议。支持 `vendor`、`extraHtml`等

截止目前，我们已经可以在 vscode 中唤起我们的 WebView 了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0N26pweKT8x4oX4x5awib19bZGMibvk6VxiabepEK2joiaX6m3cfiaiaXjox6CqaAC0NHRUEibCkZa4F72OQ/640?wx_fmt=gif)webview

#### 通信

然后就是解决 vscode 和 WebView 通信的问题了。这里的通信跟 pubSub 非常的类似：

*   插件给 WebView 发消息
    

```
panel.webview.postMessage({text:"你好，这里是 vscode 发送过来的消息"});
```

*   webview 端接受消息
    

```
window.addEventListener('message',event=>{   const message = event.data;   console.log(`WebView 接受到的消息：${message}`);  })
```

*   webview 给插件发消息
    

```
vscode.postMessage({text:"你好，这是 webView 发送过来的消息"});
```

*   插件端接受
    

```
panel.webview.onDidReceiveMessage(msg=>{   console.log(`插件接受到的消息：${msg}`)  },undefined,context.subscriptions);
```

这种通信机制太零散了，在实际项目中，`webView` 更加的类似于我们的 `view` 层。所以**「理论上它只要通过 `service` 去调用 `controller` 接口去完成底层操作告诉我结果就可以」**：

比如在创建项目的时候需要让用户选择创建目录，在 HTML 页面点击选择按钮的 click handle 应该如下：

```
const getAppPath = async () => {    const projectPath = await callService('project', 'getFolderPath', 'ok');    setAppPath(projectPath);  };
```

`callService`的形参第一个作为 `service` 类、第二个作为类里面所需要调用的方法名，后续的为其对应方法的参数。

正对如上，我们封装一个 `callService` 方法：

```
// packages/vscode-webview/webview.ts// @ts-ignoreexport const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;export const callService = function (service: string, method: string, ...args) {  // 统一 return promise，统一调用方式  return new Promise((resolve, reject) => {    // 生成对应的 eventId    const eventId = setTimeout(() => { });    console.log(`WebView call vscode extension service：${service} ${method} ${eventId} ${args}`);    // 收到 vscode 发来消息，一般为处理后 webView 的需求后    const handler = event => {      const msg = event.data;      console.log(`webview receive vscode message:}`, msg);      if (msg.eventId === eventId) {// 去定时对应的 eventID，说明此次通信结束，可以移除（结束）此次通信了        window.removeEventListener('message', handler);        msg.errorMessage ? reject(new Error(msg.errorMessage)) : resolve(msg.result);      }    }    // webview 接受 vscode 发来的消息    window.addEventListener('message', handler);    // WebView 向 vscode 发送消息    vscode.postMessage({      service,      method,      eventId,      args    });  });}
```

`webview` 层完成了对发送时间请求、接受时间请求以及接受后取消完成（`removeListener`）此次时间请求的封装。那么我们在来给 `extension` 添加上对应的`webView` 需要的 `service.methodName` 才行。

这里我们再封装了一个叫做 connectService 的方法。

```
connectService(projectCreatorPanel, context, { services });
```

上面的`projectCreatorPanel` 就是 create 出来的 `WebviewPanel` 的 “实例”，而 services 可以理解为含有多个类的对象

```
const services = { project:{  getFolderPath(...args){   //xxx  },  xxx }, xxx:{}}
```

具体的 connectService 方法如下：

```
export function connectService(  webviewPanel: vscode.WebviewPanel,  context: vscode.ExtensionContext,  options: IConnectServiceOptions) {  const { subscriptions } = context;  const { webview } = webviewPanel;  const { services } = options;  webview.onDidReceiveMessage(async (message: IMessage) => {    const { service, method, eventId, args } = message;    const api = services && services[service] && services[service][method];    console.log('onDidReceiveMessage', message);    if (api) {      try {        const fillApiArgLength = api.length - args.length;        const newArgs = fillApiArgLength > 0 ? args.concat(Array(fillApiArgLength).fill(undefined)) : args;        const result = await api(...newArgs, context, webviewPanel);        console.log('invoke service result', result);        webview.postMessage({ eventId, result });      } catch (err) {        console.error('invoke service error', err);        webview.postMessage({ eventId, errorMessage: err.message });      }    } else {      vscode.window.showErrorMessage(`invalid command ${message}`);    }  }, undefined, subscriptions);}
```

上面的代码也比较简单，就是**「注册监听函数，然后只要监听到`WebView` `post` 过来的 `message`，就去取对应 `services` 下的某个 `service` 的 `method` 去执行，并且传入 `WebView` 传过来的参数」**。

extension 的 services 是在这里引入的

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19b8EHiayDeNiamFQMU8X5Irt7azK0W8sDTkgs7RvKCmbF9cHD2QnqKMHjw/640?wx_fmt=png)services

而`@pmworks/project-service`这个 package 里面也只是封装一些基本的方法调用。核心的处理逻辑比如下载对应`gitRpo`、解析本地文件等都是在对应的`extension-utils` 里面进行。**「service 只管调用即可。」**

#### 小小问题

如上已经完成了基本的流程封装，剩下就是具体逻辑的编写了。但是在实际开发中，web 页面需要拿到 vscode 传入的参数才行，而在 web 页面开发中，vscode 插件又没法读取未编译后的代码。如何解决呢？

**「在 webView 里面在封装一层 callService 用于本地 web 页面开发所需」**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bcqhibyTIF1wKxWpPibgjq0jo4UGW3aRmBib5xMpZicLczVU8mHvydWicXDA/640?wx_fmt=png)封装 callService

后续展望
----

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19baQuiaFhYBtNbbhklxVFjiclIjf2ybxJ1V0SwoT6MMLx4Tfxib3BMFs42w/640?wx_fmt=png)

截止目前，基本介绍完了这两周除业务工作外的一些开发总结了。接下来需要恶补一下 vscode 插件的相关 api 准备开始操刀了。当然，在这之前，另一个非常非常紧急的任务就是还需要再升级下去年整理的源码架构，对齐下集团内现在 rax 体系的一些能力。

在回到这个插件体系（BeeDev 源码工作台）的开发中，后续还需要：

*   初始化源码架构
    
*   创建页面、拖拉拽相关 H5 源码物料（需要整个物料后台）生成初始化页面
    
*   创建模块、可视化配置模块加载类别等
    

如果精力有余，其实还需要个`node` 后台，这样才能打通服务端和本地的能力（就是个桌面应用了呀~）

好吧，不 YY，先酱紫吧~ 下一个里程碑了再总结下~~

至于项目源码。。。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N26pweKT8x4oX4x5awib19bTjrQCMJYq7icXwRV0jWoVRRf4iaib7DTtdmn8AZMeLDrP7zW7YGSXaxRw/640?wx_fmt=png)参考已开源的 appworks

参考文献
----

*   appworks：https://appworks.site/
    
*   vscode  extension api：https://code.visualstudio.com/api
    
*   monorepo&leran：https://github.com/lerna/lerna
    

其他
--

关注微信公众号【全栈前端精选】，每天推送精选文章~