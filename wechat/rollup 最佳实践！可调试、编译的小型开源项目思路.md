> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-fn8ynYuvRcnDLB5VqRBFg)

📖阅读本文，你将:
----------

1.  手把手带你搭建一个极简 `npm` 包（ `rollup` + `esbuild` + `ts` ）；
    
2.  从工程结构全方位思考 `npm` 包的开发原则。
    
3.  学会 `rollup`、`esbuild` 等新兴构建工具的使用；
    

一、前置阅读（推荐）
----------

> 本文章不再赘述 `rollup` 和 官方 `rollup` 插件的使用，因此有需要的话建议先阅读前置文章：

1.  说不清 rollup 能输出哪 6 种格式😥差点被鄙视
    
2.  一文入门 rollup🪀！13 组 demo 带你轻松驾驭
    

如果你对 `rollup` 和其官方插件有了一定了解，可跳过本节推荐的相关阅读；

二、目标
----

先制定一个小目标：

> 从零构建一个通过 `rollup` 构建的 `npm` 包；它可发布、可调试、支持 `TypeScript`、能够通过 `cdn` 引入页面、也可以通过 `npm` 在项目里安装引入。

这个目标有哪些关键词？让我们拆解一下：

1.  是一个 **可发布** 的 `npm` 包；
    
2.  通过 `rollup` 构建；
    
3.  支持 **调试** ；
    
4.  支持 **TypeScript** ;
    
5.  能通过 **`cdn`** 方式引入
    
6.  也支持通过 `npm` 安装；
    

看似简单，其实内中蕴含着许多前端相关的知识点，让我们一一梳理；

三、典型 `npm` 包的结构
---------------

我们发布一个 `npm` 包时，我们在发布什么？

1.  一个用来声明 `npm` 属性的 `package.json` 文件；
    
2.  若干可执行、可引入的文件；
    

仅此而已。

只有 `package.json` 是特殊的，除此之外的一切都可以被归为 “若干文件” 之列；

找一个最典型、最简单的 `npm` 包来印证我们的想法，你可以随便找个项目，执行以下命令：

```
npm i the-answer# 传说，此库以 “功能丰富”、“毫无破绽” 闻名于世
```

然后找到 `node_modules/the-answer` 文件夹，看看其项目目录:

![](https://mmbiz.qpic.cn/mmbiz_jpg/ibp9X0m3aT8twKGCKdicNB1gfAx2rbAaiaErYs05pgicU4h6UDZbgYhhOQaag6TnyzS2EOGjialEEC1w0Vc6P7IwRpg/640?wx_fmt=jpeg)

是以，要理解 `npm` 包，必须先从 `package.json` 入手，而一个典型的 `package.json` 至少应该具备以下属性：

```
{  "name": "the-answer",  "version": "1.0.0",  "description": "description",  "main": "dist/the-answer.js",  "files": [    "dist"  ]}
```

以上内容分别表示：

*   `name`: 包名
    
*   `version`: 版本
    
*   `description`: 包描述
    
*   `main`：入口
    
*   `files`：包发布时，需要将哪些文件打包上传
    

以上 5 个属性，足以支撑一个 `npm` 包的发布，但后续我们可能还会用到更多，此时，请先记住它们；

那么其他文件呢？

“协议” 和 “文档” 可以手动创建，但是 “构建物” 通常难逃 “构建” 这一过程。

`rollup` 是个不错的选择；

四、 `rollup` 的最简用法
-----------------

4.1 安装 `rollup`
---------------

执行脚本：

```
npm i -D rollup# oryarn add -D rollup
```

4.2 创建 `rollup.config.js`
-------------------------

> `rollup.config.js` 是 `rollup` 默认的配置文件

在这个配置文件里，最简单的配置莫过于：

*   配置入口文件
    
*   配置输出路径 & 格式
    

```
export default {  input: path.resolve(__dirname, './src/index.ts'),  output: [    {      dir: path.resolve(__dirname, 'dist/esm'),      format: 'esm', // 通过esm格式输出    }  ]}
```

4.3 编写构建脚本
----------

在 `package.json` 文件中添加如下代码：

```
{  ...,  "scripts": {    "build": "rollup -c"  }}
```

编写完上面脚本后，只需要执行：`npm run build`，就能成功完成一个最简单的 `rollup` 构建了。

但这还远远不够。

五、梳理：构建过程应该输出什么？
----------------

> 构建是为了有输出，输出是为了给客户使用。

因此，当我们构建时，应该率先考虑客户会在什么场景下使用我们的库。

（哪怕没有人真的用，但我们得假装自己的库会非常受欢迎，不是吗？🤣）

最常见的三种情况：

*   在构建工具中引入（`esm`）
    
*   在页面中直接引入（`umd`）
    
*   在`nodejs` 环境中使用 (`cjs`)
    

而本文的主要目标不涉及 `nodejs` 环境，因此暂时不考虑 `cjs` 输出，所以我们应该输出至少两种格式：

1.  `esm`
    
2.  `umd`
    

关于以上格式的区别，以及怎么输出，前置阅读推荐《说不清 rollup 能输出哪 6 种格式😥差点被鄙视》里有详细介绍；

通过参考目前开源社区的实现方式，我们还可以发现，通常一个开源库的 `esm` 产出物，并不是和 `rollup` 默认行为那样 “把所有文件打包成一个 `index.esm.js`”，而是：

**只编译，不打包**；（这样就能完美支持按需引入了）

![](https://mmbiz.qpic.cn/mmbiz_jpg/ibp9X0m3aT8twKGCKdicNB1gfAx2rbAaiaEbmJ99hvB6M4ZibU6lficIDeIHtDQ0rhOhq0iaicTmbOPBFFVJy432h9faw/640?wx_fmt=jpeg)

是的，文件结构依然和源码结构保持一致，只是将 `TypeScript` 编译为 `javascript`；

记住这个目标，它很重要；

六、编译 `TS` 哪家强？
--------------

> 虽然有提案让 `ts` 成为下一代的浏览器语言，但这只是还未到来的未来。

因此，如果我们的库是 `TypeScript` 编写的，那么我们在发布之前，一定需要将其编译为 `javascript` 类型。

那么，应该怎么编译呢？

社区里目前的主流方案有三类：

a. `TypeScript` https://www.npmjs.com/package/typescript

b. `Esbuild` https://esbuild.github.io/

c. `Babel` https://babeljs.io/

通过这篇文章：https://juejin.cn/post/7083298517753528334 的对比分析，可以得出结论：

`【c】` 比 `【a】` 支持的语言更丰富、编译速度更快；但是 `.d.ts` 还是推荐通过 `【a】` 中的 `tsc` 编译生成；

那么 `【b】` 选项 `Esbuild` 呢？

答案是：**速度更快** ！

所以，我做出了如下选择：

*   使用 `esbuild` 进行 `ts => js` 的编译
    
*   使用 `TypeScript` 进行 `.d.ts` 文件的编译；
    

七、编译成 `esm` 格式
--------------

整个构建过程梳理清楚后，我们可以在项目里加入如下依赖：

```
npm i typescript esbuild rollup-plugin-esbuild --save-dev
```

除了以上这些之外，还有一些常规 `rollup` 插件不在此赘述；

创建文件：`rollup.esm.config.js`

```
export default {  input: path.resolve(__dirname, './src/index.ts'),  output: [    {      dir: path.resolve(__dirname, 'dist/esm'),      format: 'esm',    }  ],  // 关键属性，只有将其设置为 `true` 才能保证只编译、不打包  preserveModules: true,  plugins: [    esbuild({      target: 'es2018'    }),    nodeResolve(),    json(),  ],  // 在 `esm` 构件中，`external` 非常重要，项目的 `dependencies` 里的内容理应都在此列  external: ['gsap']};
```

编写如下脚本：

```
{  "scripts": {    "build:esm": "rollup -c rollup.esm.config.js",    "postbuild:esm": "tsc  --emitDeclarationOnly --declaration --project ts.config.json --outDir dist/esm",  }}
```

解释一下，`postbuild:esm` 是 `build:esm` 脚本的后置钩子，当 `build:esm` 执行完成后会自动执行 `postbuild:esm`；

执行脚本：

```
npm run build:esm
```

可以编译出如下效果的代码：

![](https://mmbiz.qpic.cn/mmbiz_jpg/ibp9X0m3aT8twKGCKdicNB1gfAx2rbAaiaE46ictZ8kGIDLMpJREbUEPOziaktK9H3yiazqNOjYnv4rU5JlPVr2icqMWg/640?wx_fmt=jpeg)

基本满足我们对 `esm` 格式编译产出的要求。

八、编译 `umd` 格式
-------------

和 `esm` 格式的编译要求不同，`umd` 格式更多的被用在 `cdn` 加载。

因此：

*   构建物不仅需要编译，还需要打包
    
*   无需 `.d.ts` 文件
    

创建 `rollup.umd.config.js`:

```
export default {  input: path.resolve(__dirname, './src/index.ts'),  output: [    {      file: path.resolve(__dirname, 'dist/umd/index.js'),      format: 'umd',      // 这个name属性非常重要，是通过 cdn 引入后，挂载到 window上的属性名      name: 'rain'    }  ],  plugins: [    esbuild({      // 为了应对 umd 直接加载到浏览器里，构建目标需要设定得兼容性更强      target: 'es2015'    }),    // 需要babel plugin    babel({      presets: ['@babel/preset-env'],      exclude: 'node_modules/**',      babelHelpers: 'bundled'    }),    nodeResolve(),    json(),    commonjs()  ],};
```

编写脚本：

```
{  "scripts": {    "build:umd": "rollup -c rollup.umd.config.js",  }}
```

执行脚本 `npm run build:umd` 即可完成 `umd` 格式的编译。

完成 `esm` 和 `umd` 的编译后，需要考虑一下：

**如何拥有一个良好的开发调试环境呢？**

九、`umd` 构建物的调试
--------------

`rollup` 的命令行支持参数 `-w` （和 `--watch` 等价），其含义是监听源文件的变动，当文件发生变化时立刻更新文件；

这听起来和 `webpack` 的 `hrm` 类似。

因此，`umd` 环境下构建物的调试思路便出来了：

*   创建文件：`examples/base/index.html`
    
*   在 `index.html`里引入 `dist/umd/index.js`
    
*   起一个 `http` 静态服务以便访问 `index.html` 页面
    

这就是最简单的前端调试逻辑。

此时，我们需要用到三个工具：

1.  `cross-env` 工具库  
    通过 `cross-env`，我们可以轻易地跨平台地设置环境变量，比如:
    

```
cross-env NODE_ENV=production
```

可以把 `process.env.NODE_ENV` 设置成 `production`，这对我们的区分 “调试” 与 “构建” 具有非常大的帮助，

2.  `rollup-plugin-serve` 插件  
    这是一个 `rollup` 插件；  
    通过这个插件，你可以：
    

*   在固定端口启动 `http` 静态服务
    
*   指定该端口的 `root` 文件夹
    
*   指定浏览器默认打开页面，并可以指定直接访问某个路由
    

3.  `rollup-plugin-livereload` 插件  
    这也是一个 `rollup` 插件；  
    通过这个插件，可以监听某个文件夹，当里面的文件发生变动后，刷新页面。
    

使用以上三个工具，可以写出如下代码：

```
const isProduction = process.env.NODE_ENV === 'production'const pluginsWithEnv = isProduction ? [] : [serve({  open: true,  openPage: '/base/',  port: 10001,  contentBase: ['dist', 'examples']}), livereload('dist/umd')]// 然后通过 ...pluginsWithEnv 把配置结构到 rollup的plugins 里面去
```

并添加脚本：

```
{  "scripts": {    "dev:umd": "cross-env NODE_ENV=development rollup -w -c rollup.umd.config.js"  }}
```

完成以上步骤：执行 `npm run dev:umd` 就能正常打开页面，以及完成调试了。

十、`esm` 构建物的调试
--------------

相比于 `umd` 那简单的调试结构，`esm` 通常情况下需要依赖构建工具，事情就变得复杂起来了。

我的选择是 **在项目里内置一个基于 `webpack/vite` 的项目** ；

### 10.1 用 `vue-cli` 新增项目

先安装 `vue-cli`，见 vue-cli 官网

然后执行以下命令：

```
cd examplesvue create vue3
```

### 10.2 `import` 构建物

在 `vue3` 项目中通过相对路径引用 `esm` 构建物，引入方式如下：

```
import xx from '../../../'
```

注意，此处不需要指定到某个 `js` 文件，是因为要通过 `esm` 的导入方式，通过命中项目的 `package.json`，通过 `exports`、`main`、`module` 等属性命中它该命中的入口文件。

### 10.3 编写脚本

编写如下脚本：

```
{  "scripts": {    "serve:vue3": "cd ./examples/vue3 && yarn && yarn serve",    "watch:esm": "cross-env NODE_ENV=development rollup -w -c rollup.esm.config.js",  }}
```

如果分别运行 `npn run watch:esm` 和 `npm run serve:vue3`，就能成功运行一个 `vue3` 项目，并成功进行调试。

### 10.4 并联两个脚本

因为 `serve:vue3` 和 `watch:esm` 这两个脚本都是会导致命令行的命令，因此如果你这样写一个脚本：

```
npn run watch:esm && npm run serve:vue3
```

那么 **后者永远不会执行**。

因此，两者必须同时执行。

再推荐一个小工具：`npm-run-all` https://www.npmjs.com/package/npm-run-all

有了以上这个工具，你可以轻易的串行或者并行各种脚本。

此处只需要再新增一个脚本：

```
{  "scripts": {    "dev:esm": "run-p watch:esm serve:vue3",  }}
```

这样就可以异步同时执行两个脚本了。

十一、开发 & 发布
----------

完成了以上所有步骤，你就可以开始安心开发脚本了，无论是 “构建” 抑或是 “调试”，目前都已经非常清晰了。

对于 `rollup.js` 在一个小型前端开源项目中应该如何使用，也渐渐摸清了脉络。

等开发完项目，则需要考虑发布的过程。

执行以下过程

```
npm version patch 
```

项目编号会自动从 `0.0.1` 升级为 `0.0.2`。

再执行：

```
npm login
npm publish
```

就能成功发布你的开源库了。

十二、文章源码（供参考）
------------

参见：https://github.com/zhangshichun/rainy-window

十三、结束语
------

我是`春哥`。  
大龄前端打工仔，依然在努力学习。  
我的目标是给大家分享最实用、最有用的知识点，希望大家都可以早早下班，并可以飞速完成工作，淡定摸鱼🐟。

你可以在**公众号**里找到我：`前端要摸鱼`。