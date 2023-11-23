> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-nYnPXFy-MdV_kmjlGFrpg)

话不多说，直接先看效果💯：  

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHryCcEdeGEDXSib8AyvGIgeCVGFeAfT4f9DG0ux7JItT0Z3qmxPickCoJ1RLe39GujdnZRiamsywPnBA/640?wx_fmt=other)console-button.png

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHryCcEdeGEDXSib8AyvGIgeCWPe0sAo7TqEicLkdic511ZYBLkyrc89LrSV7Ps01e7FCp6HC086BSSYQ/640?wx_fmt=other) 这些效果都是使用 console 在控制台输出的 log，是不是还蛮炫酷的？

一、console.log（info、warn、error） 如何自定义样式
======================================

如果你想实现类似效果，需要一点前置知识。我们经常使用的 `console.log`、`console.info`、`console.warn`、`console.error` 都是可以自定义样式的，规则如下：

*   第一个参数，需要写带有 `%c` 的字符串模板，代表你写的样式要作用的字符区域，可以连写多个：`%c %c %c` ...
    
*   后面的参数，需要你编写样式，就像写 CSS 样式一样，但是因为控制台支持的样式有限，类似于宽高之类的属性是不支持的，如果想实现宽高，可以使用 `padding` 来替代
    
*   一行样式对应一个 `%c`
    

```
// 只有一个 %c 时console.info(  '%c this is me ',  'background-color: #2196f3; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; text-transform: uppercase; font-weight: 600;',  window);// 两个 %c 时console.info(  '%c this is first %c this is second ',  'background-color: #2196f3; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; text-transform: uppercase; font-weight: 600;',  'background-color: #00BCD4; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; text-transform: uppercase; font-weight: 600;',  window);复制代码
```

看下效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHryCcEdeGEDXSib8AyvGIgeCw9Dic6GYcGX6OuVRFiambq1gQ0noIcIfLZF2YmWbpzSGWG0zkheKuSMQ/640?wx_fmt=other)image.png

`console.log`、`console.info`、`console.warn`、`console.error` 支持的样式：

*   `background`，包括 `background-image` 等
    
*   `border`，及其他 border 属性
    
*   `border-radius`
    
*   `box-decoration-break`
    
*   `box-shadow`
    
*   `clear` 和 `float`
    
*   `color`
    
*   `cursor`
    
*   `display`
    
*   `font`，及其他 font 属性
    
*   `line-height`
    
*   `margin`
    
*   `outline`，及其他 outline 属性
    
*   `padding`
    
*   `text-transform`
    
*   `text-*`
    
*   `white-space`
    
*   `word-spacing`
    
*   `word-break`
    
*   `writing-mode`
    

基于以上特性，我们可以看到 console 虽然能写样式，但是支持的样式比较有限，能实现的效果不算很多，但是很明显的一点是， button 风格的 log 可以实现，并且效果还不错。

二、结合 console 样式特性写一个简易 log 库
============================

有这个想法完全是因为公司的项目非常多的 log，因为工程及 npm 包都非常多，加上好些年时间了，项目里跑满了 log，但是出于排查故障的考虑，这些 log 一直保留没有人删，造成了页面非常多的 log，有时候想看看自己的 log 都需要过滤半天，所以想在工程里打一些属于自己特色 log 帮助自己排查问题。但是我发现直接在工程里输出带样式的 console 会产生非常多的多余代码，不利于代码编写，而且大概率会被其他人问候，所以就有了封装成 npm 库的想法。

在样式上受到了 vue-devtool 启发，所以会有一个基本的 log-button 的版本，样式配色采用 vue-devtool 的方案。为了增加样式的丰富性，我又参考了 arco-design，但是样式依然很单调，为了增加趣味性，我找了一些 emoji 表情作为内置符号，方便大家把玩。另外，结合了 chatgpt 的能力，生成了一组 material ui 风格的色卡，这样可以大大丰富 button 的样式。

那么，话不多说，先来搭建基础架构。

*   首先打包工具使用 vite，简单快速：`yarn create vite`，选择库模式，typescript 也是必不可少
    
*   接着配置 `vite.config.ts`
    

```
import { defineConfig } from 'vite';export default defineConfig({  build: {    target: 'modules',    outDir: "dist",    minify: false,    rollupOptions: {      input: ['src/index.ts'],      output: [        {          format: 'es',          entryFileNames: '[name].js',          preserveModules: true,          dir: 'es',          preserveModulesRoot: 'src'        },        {          format: 'cjs',          entryFileNames: '[name].js',          preserveModules: true,          dir: 'lib',          preserveModulesRoot: 'src'        }      ]    },    lib: {      entry: './index.ts',      formats: ['es', 'cjs'],    }  },});复制代码
```

*   简单的来配置下 eslint（不想看的可以略过这里）
    

先下载几个包：`yarn add eslint husky lint-staged \-D` 再执行下命令：`npx eslint \--init` package.json 的 script 加入脚本：

```
"scripts": {    "lint": "eslint . --ext '.js,.ts' --fix",    "precommit": "lint-staged"},复制代码
```

package.json script 统计增加配置：

```
"husky": {    "hooks": {         "pre-commit": "lint-staged"    }},"lint-staged": {    "src/**/*.{js,ts}": [        "eslint --fix",        "git add"    ]},复制代码
```

为了待会发布方便，配置下 package.json 中的 publishConfig，把 npm 地址配上：

```
"publishConfig": {    "registry": "https://registry.npmjs.org/"}复制代码
```

我们的 build 命令会生成一个 es 包以及一个 lib 包，分别对应 esmodule 和 commonjs，需要继续配置：

```
"files": [    "lib",    "es",    "README",    "LICENSE"],复制代码
```

不同模块化标准对应不同的入口，继续配置：

```
"main": "lib/index.js","module": "es/index.js",复制代码
```

以下是完成的 package.json 配置，源码链接会放在文末：

```
{  "name": "console-log-button",  "private": false,  "version": "0.0.1",  "type": "module",  "main": "lib/index.js",  "module": "es/index.js",  "scripts": {    "dev": "vite",    "build": "tsc && vite build",    "lint": "eslint . --ext '.js,.ts' --fix",    "precommit": "lint-staged"  },  "devDependencies": {    "@typescript-eslint/eslint-plugin": "^5.56.0",    "@typescript-eslint/parser": "^5.56.0",    "typescript": "^4.9.4",    "vite": "^4.0.4"  },  "dependencies": {    "eslint": "^8.36.0",    "husky": "^8.0.3",    "lint-staged": "^13.2.0"  },  "files": [    "lib",    "es",    "README",    "LICENSE"  ],  "husky": {    "hooks": {      "pre-commit": "lint-staged"    }  },  "lint-staged": {    "src/**/*.{js,ts}": [      "eslint --fix",      "git add"    ]  },  "keywords": [    "console",    "log",    "button"  ],  "license": "MIT",  "publishConfig": {    "registry": "https://registry.npmjs.org/"  }}复制代码
```

项目的基本架构就简单介绍到这里，因为是个玩具库，所以没那么多可以配置的项，功能代码也不是很多。本想使用 vitest 进行单元测试的，但是 console 怎么去测属实难倒我了，有知道的朋友还望在评论区不吝赐教。

三、结合 chatgpt 生成我们想要的 UI 色卡
==========================

最近也是一直在探索 chatgpt 如何结合自己的工作提高生产力，所以这里就做了下尝试。首先是直接让他为我们生成最终的代码，但是效果并不理想，因为提问不够详细，导致出来的代码达不到我的预期。必须向它提供可参考的案例，或者具体的方向，它才能提供可靠的代码示例，所以我具体化了它参考的 UI 库，例如 arco-design 及 material ui，它也确实生成了不少好看的配色。目前我们初版，就只做一个 button 样式的 log 库，来看看 chatgpt 为我们生成的色卡：

```
// arco-designexport const ARCO_DEEP_BLUE = "#1f5bfb";export const ARCO_DEEP_ORANGE = "#fe9c3e";export const ARCO_DEEP_RED = "#f66965";export const ARCO_DEEP_GREEN = "#27c24a";export const ARCO_LIGHT_BLUE = "#96bdfd";export const ARCO_LIGHT_ORANGE = "#fff7e8";export const ARCO_LIGHT_RED = "#ffece9";export const ARCO_LIGHT_GREEN = "#e8ffeb";// material uiexport const MATERIAL_BLUE = "#2196f3";export const MATERIAL_GREY = "#9e9e9e";export const MATERIAL_RED = "#f44336";export const MATERIAL_YELLOW = "#ffeb3b";export const MATERIAL_GREEN = "#4caf50";export const MATERIAL_ORANGE = "#ff9800";export const MATERIAL_PURPLE = "#9c27b0";export const MATERIAL_TEAL = "#009688";export const MATERIAL_PINK = "#e91e63";export const MATERIAL_BROWN = "#795548";export const MATERIAL_CYAN = "#00bcd4";export const MATERIAL_LIME = "#cddc39";export const MATERIAL_DEEP_ORANGE = "#ff5722";export const MATERIAL_LIGHT_BLUE = "#03a9f4";export const MATERIAL_AMBER = "#ffc107";export const MATERIAL_INDIGO = "#3f51b5";export const MATERIAL_LIGHT_GREEN = "#8bc34a";export const MATERIAL_DEEP_PURPLE = "#673ab7";export const MATERIAL_YELLOW_GREEN = "#9ccc65";export const MATERIAL_DEEP_CYAN = "#006064";export const MATERIAL_DEEP_GREEN = "#2e7d32";export const MATERIAL_LIGHT_YELLOW = "#fff59d";export const MATERIAL_LIGHT_RED = "#e57373";export const MATERIAL_LIGHT_GREEN_2 = "#81c784";export const MATERIAL_LIGHT_ORANGE = "#ffcc80";export const MATERIAL_LIGHT_PURPLE = "#ba68c8";export const MATERIAL_LIGHT_GREY = "#bdbdbd";export const MATERIAL_LIGHT_PINK = "#f48fb1";export const MATERIAL_LIGHT_TEAL = "#4db6ac";export const MATERIAL_DARK_BLUE = "#0d47a1";export const MATERIAL_DARK_GREEN = "#1b5e20";export const MATERIAL_DARK_PINK = "#880e4f";export const MATERIAL_DARK_CYAN = "#00838f";export const MATERIAL_DARK_YELLOW = "#f9a825";export const MATERIAL_DARK_RED = "#b71c1c";export const MATERIAL_DARK_ORANGE = "#e65100";export const MATERIAL_DARK_GREY = "#616161";export const MATERIAL_DARK_PURPLE = "#4a148c";export const MATERIAL_DARK_TEAL = "#004d40";export const MATERIAL_DARK_LIME = "#827717";export const MATERIAL_DARK_AMBER = "#ff6f00";export const MATERIAL_DARK_INDIGO = "#1a237e";export const MATERIAL_DARK_BROWN = "#3e2723";export const MATERIAL_DARK_YELLOW_GREEN = "#689f38";export const MATERIAL_DARK_LIGHT_BLUE = "#01579b";export const MATERIAL_DARK_LIGHT_GREEN = "#33691e";export const MATERIAL_DARK_LIGHT_PINK = "#ad1457";export const MATERIAL_DARK_LIGHT_PURPLE = "#6a1b9a";复制代码
```

这些色卡已经完全满足我们的需求了，接下来是编码环节。

四、代码实现及发布 npm
=============

*   基础版 log-button，我们采用 vue-devtool 的风格作为默认样式：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHryCcEdeGEDXSib8AyvGIgeCvdcoqEZV2xFXddaym3w4rE3o95E4smuoNdMWia8sWDcSTLWv76sGjGw/640?wx_fmt=other)image.png

```
/** * 基础 log 方法 * @param {string} logBy log 第一个按钮中的文字内容 * @param {string} logName log 第二个按钮中的文字内容 * @param {any} data 这里的 data 可以传多个 以 rest 参数形式会被展开 */export const buttonLog = (logBy = '', logName = '', ...logData: any[]) => console.log(  `%c log-by-${logBy} %c ${logName} %c`,  `background: ${VUE_DEEP_CYAN}; padding: 6px; border-radius: 1px 0 0 1px;  color: #fff`,  `background: ${VUE_BLUE_GRAY}; padding: 6px; border-radius: 0 1px 1px 0;  color: #fff`,  'background: transparent',  ...logData);复制代码
```

*   material ui 风格我们单独写一个方法作为 API 调用
    
*   这里实现了黄、橙、红、绿、青、蓝、紫七个基本配色方案，并搭配了渐变
    

```
const colorMap = new Map([  ['yellow', '#FFC107'],  ['orange', '#ff9800'],  ['red', '#f44336'],  ['green', '#4caf50'],  ['cyan', '#00BCD4'],  ['blue', '#2196f3'],  ['purple', '#9C27B0'],]);const gradientColorMap = new Map([  ['yellow', 'linear-gradient(to right, #FDB813, #FFAA00)'],  ['orange', 'linear-gradient(to right, #FFA500, #FF6347)'],  ['red', 'linear-gradient(to right, #FF416C, #FF4B2B)'],  ['green', 'linear-gradient(to right, #00b09b, #96c93d)'],  ['cyan', 'linear-gradient(to right, #1D976C, #93F9B9)'],  ['blue', 'linear-gradient(to right, #2196F3, #4FC3F7)'],  ['purple', 'linear-gradient(to right, #DA22FF, #9733EE)'],]);/** * material ui 风格 log 方法 * @param {object} config log 配置 * - config.logName - log 按钮中的文字内容 * - config.type - 'yellow' | 'orange' | 'red' | 'green' | 'cyan' | 'blue' | 'purple' * - config.isLinearGradient 是否是渐变按钮 * @param {any} data 这里的 data 可以传多个 以 rest 参数形式会被展开 */export const materialButtonLog = ({ logName = '', type = 'blue', isLinearGradient = false }, ...data: any[]) => {  if (isLinearGradient) {    console.log(`%c${logName}`, `background-image: ${gradientColorMap.get(type)}; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; text-transform: uppercase; font-weight: 600;`, ...data);  } else {    console.log(`%c${logName}`, `background-color: ${colorMap.get(type)}; padding: 6px 12px; border-radius: 2px; font-size: 14px; color: #fff; text-transform: uppercase; font-weight: 600;`, ...data);  }  };复制代码
```

*   为了方便用户生成自己想要的 log-button 的风格，我们还要编写一个 class
    

```
interface IButtonLogConfig {  logBy?: string;  logName?: string;  preButtonColor?: string;  nextButtonColor?: string;  padding?: number;  borderRadius?: number;  fontColor?: string;}interface IButtonLogClass {  logBy: string;  logName: string;  preButtonColor: string;  nextButtonColor: string;  padding: number;  borderRadius: number;  fontColor: string;  logTemplate?: (logBy: string, logName: string) => string;}export default class ButtonLogClass implements IButtonLogClass {  logBy;  logName;  preButtonColor;  nextButtonColor;  padding;  borderRadius;  fontColor;  logTemplate = (logBy = '', logName = '') => `%c log-by-${logBy} %c ${logName} `;    constructor(config: IButtonLogConfig) {    this.logBy = config.logBy || '';    this.logName = config.logName || '';    this.preButtonColor = config.preButtonColor || VUE_DEEP_CYAN;    this.nextButtonColor = config.nextButtonColor || VUE_BLUE_GRAY;    this.padding = config.padding || 6;    this.borderRadius = config.borderRadius || 1;    this.fontColor = config.fontColor || '#fff';  }  log = (...data: any[]) => {    const firstButtonStyle = `background: ${this.preButtonColor}; padding: ${this.padding}px; border-radius: ${this.borderRadius}px 0 0 ${this.borderRadius}px;  color: ${this.fontColor}`;    const secondButtonStyle = `background: ${this.nextButtonColor}; padding: ${this.padding}px; border-radius: 0 ${this.borderRadius}px ${this.borderRadius}px 0;  color: ${this.fontColor}`;    console.log(      this.logTemplate(this.logBy, this.logName),      firstButtonStyle,      secondButtonStyle,      ...data    );  };}复制代码
```

那么基本上我们的一个简易的 console-log-button 库就完成了，代码都非常简单，也很好理解。

如何发布
----

在发布之前，我们需要先拥有一个 npm 的账号，没有的可以先注册一个。本地的 npm 镜像需要切换到 npm 官网：`npm config set registry https://registry.npmjs.org/`。然后 `npm login` 登录 npm 才能正式发布。

之后 `yarn build` 生成我们的 es、lib 包，这些包在发布 npm 上时会被真正的使用。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHryCcEdeGEDXSib8AyvGIgeC74LEB6Zw6WYg3y32aDM3IpJR5rstcPoiceMibLhYL0jHQjtQF1j2eWiaw/640?wx_fmt=other)image.png

发布之前需要注意几点，你的本地的更改必须全部 commit，否则会发布失败。每次更新版本，需要在 packge.json 中更新 version 字段的版本，例如从 `0.0.1` 升级到 `0.0.2`， 否则你上一次发布 `0.0.1`，这次也是 `0.0.1`，版本号没有升级也会失败。

以上都准备妥当后，我们在代码所在终端执行：`npm publish`，之后就可以愉快地玩耍等待发包成功了！

最后
==

闲来无事，摸了一中午的鱼写出来的小玩意，大家要是有兴趣可以探索更多样式上的可能性。要是也想体验一番，可以 `npm i console-log-button` 下载体验。

下面是 `console-log-button` 的文档链接和代码链接（欢迎 star）：

*   npm[2]
    
*   github[3]
    

关于本文  

作者：北岛贰

https://juejin.cn/post/7216182763237916729

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 「在看」，让更多的人也能看到这篇内容

2、关注官网 https://muyiy.cn，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 「加群」 ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《  

```
最后不要忘了点赞呦！

```