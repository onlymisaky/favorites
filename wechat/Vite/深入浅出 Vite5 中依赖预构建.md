> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1gAY94h4QpS5WLrMzLvAkw)

引言  

=====

大多数同学提到 `Vite` ，会下意识的反应出 “快”、“noBundle” 等关键词。

那么，为什么 Vite 相较于 Webpack、Rollup 之类的会更加快，亦或是大多数同学认为 Vite 是 "noBundle" 又是否正确呢？

接下来，这篇文章和大家一起来深入浅出 Vite 中的核心的 “预构建” 过程。

> ❝
> 
> 文章中 vite 版本为最新的 `5.0.0-beta.18`。
> 
> ❞

预构建
===

概念
--

既然提到预构建，那么预构建究竟是一个什么样的概念呢？

熟悉 Vite 的朋友可能清楚，Vite 在开发环境中存在一个优化**「依赖预构建」**（Dependency Pre-Bundling）的概念。

简单来说，所谓依赖预构建指的是在 `DevServer` 启动之前，Vite 会扫描使用到的依赖从而进行构建，之后在代码中每次导入 (`import`) 时会动态地加载构建过的依赖这一过程，

也许大多数同学对于 Vite 的认知更多是 No Bundle，但上述的依赖预构建过程的确像是 Bundle 的过程。

简单来说，Vite 在一开始将应用中的模块区分为 **「依赖」** 和 **「源码」** 两类：

*   **「依赖部分」** 更多指的是代码中使用到的第三方模块，比如 `vue`、`lodash`、`react` 等。
    
    Vite 将会使用 esbuild 在应用启动时对于依赖部分进行预构建依赖。
    
*   **「源码部分」** 比如说平常我们书写的一个一个 `js`、`jsx`、`vue` 等文件，这部分代码会在运行时被编译，并不会进行任何打包。
    
    Vite 以 原生 ESM 方式提供源码。这实际上是让浏览器接管了打包程序的部分工作：Vite 只需要在浏览器请求源码时进行转换并按需提供源码。根据情景动态导入代码，即只在当前屏幕上实际使用时才会被处理。
    

我们在文章中接下来要聊到的**「依赖预构建」**，其实更多是针对于第三方模块的预构建过程。

什么是预构建
------

我们在使用 `vite` 启动项目时，细心的同学会发现项目 `node_modules` 目录下会额外增加一个 `node_modules/.vite/deps` 的目录：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9UUK1SDlgTo3ZVKWw38uPI9BY8VVzXwEqfE7NibAv2qPpJDSJmRm3oIg/640?wx_fmt=png&from=appmsg)

这个目录就是 `vite` 在开发环境下预编译的产物。

项目中的**「依赖部分」**：`ahooks`、`antd`、`react` 等部分会被预编译成为一个一个 `.js` 文件。

同时，`.vite/deps` 目录下还会存在一个 `_metadata.json`：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9GvFpCaRJWo70ibq4BagRSTv7WCicicezaKzDm5Jy6qkmAPgb9WthsBwJA/640?wx_fmt=png&from=appmsg)  

`_metadata.json` 中存在一些特殊属性：

*   `hash`
    
*   `browserHash`
    
*   `optimized`
    
*   `chunks`
    

简单来说 `vite` 在预编译时会对于项目中使用到的第三方依赖进行依赖预构建，将构建后的产物存放在 `node_modules/.vite/deps` 目录中，比如 `ahooks.js`、`react.js` 等。

同时，预编译阶段也会生成一个 `_metadata.json` 的文件用来保存预编译阶段生成文件的映射关系 (optimized 字段)，方便在开发环境运行时重写依赖路径。

上边的概念大家也不需要过于在意，现在不清楚也没关系。我们只需要清楚，依赖预构建的过程简单来说就是生成 `node_modules/deps` 文件即可。

为什么需要预构建
--------

那么为什么需要预构建呢？

首先第一点，我们都清楚 Vite 是基于浏览器 `Esmodule` 进行模块加载的方式。

那么，对于一些非 `ESM` 模块规范的第三方库，比如 `react`。在开发阶段，我们需要借助预构建的过程将这部分非 `esm` 模块的依赖模块转化为 `esm` 模块。从而在浏览器中进行 `import` 这部分模块时也可以正确识别该模块语法。

另外一个方面，同样是由于 Vite 是基于 `Esmodule` 这一特性。在浏览器中每一次 `import` 都会发送一次请求，部分第三方依赖包中可能会存在许多个文件的拆分从而导致发起多次 `import` 请求。

比如 `lodash-es` 中存在超过 600 个内置模块，当我们执行 `import { debounce } from 'lodash'` 时，如果不进行预构建浏览器会同时发出 600 多个 HTTP 请求，这无疑会让页面加载变得明显缓慢。

正式通过依赖预构建，将 `lodash-es` 预构建成为单个模块后仅需要一个 HTTP 请求就可以解决上述的问题。

基于上述两点，Vite 中正是为了**「模块兼容性」**以及**「性能」**这两方面大的原因，所以需要进行依赖预构建。

思路导图
----

那么，预构建究竟是怎么样的过程？我们先来看一幅关于依赖预构建的思维导图

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9YBQfG61sVXGicfjgpPB1CLtpzfRb28bibsmic0CNgWvwaCDxC2uM7iaw2g/640?wx_fmt=png&from=appmsg)  

在开始后续的内容之前，我们先来简单和大家聊聊这张图中描述的各个关键步骤。

1.  调用 `npm run dev`(vite) 启动开发服务器。首先，当我们在 vite 项目中首次启动开发服务器时，默认情况下（未指定 `build.rollupOptions.input`/`optimizeDeps.entries` 情况下），Vite 抓取项目目录下的所有的 (`config.root`) `.html` 文件来检测需要预构建的依赖项（忽略了`node_modules`、`build.outDir`、`__tests__` 和 `coverage`）。
    

> ❝
> 
> 通常情况下，单个项目我们仅会使用单个 `index.html` 作为入口文件。
> 
> ❞

2.  分析 index.html 入口文件内容。其次，当首次运行启动命令后。Vite 会寻找到入口 HTML 文件后会分析该入口文件中的 `<script>` 标签寻找引入的 js/ts 资源（图中为 `/src/main.ts`）。
    
3.  分析 `/src/main.ts` 模块依赖 之后，会进入 `/src/main.ts` 代码中进行扫描，扫描该模块中的所有 `import` 导入语句。这一步主要会将依赖分为两种类型从而进行不同的处理方式：
    

*   对于源码中引入的第三方依赖模块，比如 `lodash`、`react` 等第三方模块。Vite 会在这个阶段将导入的第三方依赖的入口文件地址记录到内存中，简单来说比如当碰到 `import antd from 'antd'`时 Vite 会记录 `{ antd: '/Users/19Qingfeng/Desktop/vite/vite-use/node_modules/antd/es/index.js' }`，同时会将第三方依赖当作外部 (`external`) 进行处理（并不会递归进入第三方依赖进行扫描）。
    
*   对于模块源代码，就比如我们在项目中编写的源代码。Vite 会依次扫描模块中所有的引入，对于非第三方依赖模块会再次递归进入扫描。
    

5.  递归分析非第三方模块中的依赖引用 同时，在扫描完成 `/src/main.ts` 后，Vite 会对于该模块中的源码模块进行递归分析。这一步会重新进行第三步骤，唯一不同的是扫描的为 `/src/App.tsx`。
    
    最终，经过上述步骤 Vite 会从入口文件出发扫描出项目中所有依赖的第三方依赖，同时会存在一份类似于如下的映射关系表：
    
    ```
    {        "antd": {            // key 为引入的第三方依赖名称，value 为该包的入口文件地址            "src": "/Users/19Qingfeng/Desktop/vite/vite-use/node_modules/antd/es/index.js"        }，        // ...    }
    ```
    
6.  生产依赖预构建产物
    
    经过上述的步骤，我们已经生成了一份源码中所有关于第三方导入的依赖映射表。最后，Vite 会根据这份映射表调用 EsBuild 对于扫描出的所有第三方依赖入口文件进行打包。将打包后的产物存放在 `node_modules/.vite/deps` 文件中。比如，源码中导入的 `antd` 最终会被构建为一个单独的 `antd.js` 文件存放在 `node_modules/.vite/deps/antd.js` 中。
    

简单来说，上述的 5 个步骤就是 `Vite` 依赖预构建的过程。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL94gU5ibj8ndgd3eBUtannwPeDxnOzCbHT8pjJfoacamLjkvialNEQibRYg/640?wx_fmt=png&from=appmsg)  

有些同学可能会好奇，预构建生成这样的文件怎么使用呢？

这个问题其实和这篇文章关系并不是很大，本篇文章中着重点更多是和让大家了解预构建是在做什么以及是怎么实现的过程。

简单来说，预构建对于第三方依赖生成 `node_modules/.vite/deps` 资源后。在开发环境下 `vite` 会 “拦截” 所有的 ESM 请求，将源码中对于第三方依赖的请求地址重写为我们预构建之后的资源产物，比如我们在源码中编写的 antd 导入：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9NKxw2LHcW6wGppMw679kxeohg2D2gt8JM2fnAWJqughJXgNPf1MMQQ/640?wx_fmt=png&from=appmsg)  

最终在开发环境下 Vite 会将对于第三方模块的导入路径重新为：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL91skqQmmFG93K2UzicL1rwonrXgqQF4IiaUR6BatJkdy69VniamE2OmU9w/640?wx_fmt=png&from=appmsg)  

其实 `import { Button } from '/node_modules/.vite/deps/antd.js?v=09d70271'` 这个地址正是我们将 `antd` 在预构建阶段通过 Esbuild 在 `/node_modules/.vite/deps` 生成的产物。

至于 Vite 在开发环境下是如何重写这部分第三方导入的地址这件事，我们会在下一篇关于实现 Vite 的文章会和大家详细讲解。

简单实现
----

上边的过程我们对于 Vite 中的预构建进行了简单的流程梳理。

经过上述的章节我们了解了预构建的概念，以及预构建究竟的大致步骤。

接下来，我会用最简单的代码来和大家一起实现 Vite 中预构建这一过程。

> ❝
> 
> 因为源码的分支 case 比较繁琐，容易扰乱我们的思路。所以，我们先实现一个精简版的 Vite 开始入手巩固大家的思路，最后我们在循序渐进一步一步阅读源码。
> 
> ❞

### 搭建开发环境

工欲善其事，必先利其器。在着手开发之前，让我们先花费几分钟来稍微梳理一下开发目录。

这里，我创建了一个 `vite` 的简单目录结构：

```
.├── README.md              Reamdme 说明文件├── bin                    │   └── vite               环境变量脚本文件        ├── package.json           └── src                    源码目录    ├── config.js          读取配置文件    └── server             服务文件目录        ├── index.js       服务入口文件        └── middleware     中间件目录文件夹
```

创建了一个简单的目录文件，同时在 `bin/vite` 与 `package.json` 中的 `bin` 字段进行关联：

```
#!/usr/bin/env nodeconsole.log('hello custom-vite!');
```

```
{  "name": "custom-vite",  // ...  "bin": {    "custom-vite": "./bin/vite"  },  // ...}
```

关于 `bin` 字段的作用这里我就不再赘述了，此时当我们在本地运行 `npm link` 后，在控制台执行 `custom-vite` 就会输出 `hello custom-vite!`:

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9vicJvzdRn7JiaWSb7jUReV4R1UjeDQ8ydt3cjKezInqypCPu2utuEicicw/640?wx_fmt=png&from=appmsg)  

### 编写开发服务器

接下来，让我们按照思维导图的顺序一步一步来。

在运行 `vite` 命令后需要启动一个开发服务器用来承载应用项目（启动目录下）的 `index.html` 文件作为入口文件，那么我们就从编译一个开发服务器开始。

首先，让我们先来修改 Vite 命令的入口文件 `/bin/vite`:

```
#!/usr/bin/env nodeimport { createServer } from '../src/server';(async function () {  const server = await createServer();  server.listen('9999', () => {    console.log('start server');  });})();
```

上边的 `/bin/vite` 文件中，我们从 `/src/server` 中引入了一个 `createServer` 创建开发服务器的方法。

随后，利用了一个自执行的函数调用该 `createServer` 方法，同时调用 `server.listen` 方法将开发服务器启动到 `9999` 端口。

```
// /src/server/index.jsimport connect from 'connect';import http from 'node:http';import staticMiddleware from './middleware/staticMiddleware.js';import resolveConfig from '../config.js';/** * 创建开发服务器 */async function createServer() {  const app = connect(); // 创建 connect 实例  const config = await resolveConfig(); // 模拟配置清单 （类似于 vite.config.js）  app.use(staticMiddleware(config)); // 使用静态资源中间件  const server = {    async listen(port, callback) {      // 启动服务      http.createServer(app).listen(port, callback);    }  };  return server;}export { createServer }
```

我们 `/src/server/index.js` 中定义了一个创建根服务器的方法: `createServer`。

`createServer` 中首先我们通过 `connect` 模块配置 `nodejs http` 模块创建了一个支持中间件系统的应用服务。

> ❝
> 
> `connect` 为 `nodejs http` 模块提供了中间件的扩展支持，Express 4.0 之前的中间件模块就是基于 connect 来实现的。
> 
> ❞

之后，我们在 `createServer` 方法中通过 `resolveConfig` 方法来模拟读取一些必要的配置属性（该方法类似于从应用本身获取 `vite.config.js` 中的配置）:

```
// src/utils.js/** * windows 下路径适配（将 windows 下路径的 // 变为 /） * @param {*} path * @returns */function normalizePath(path) {  return path.replace(/\\/g, '/');}export { normalizePath };// /src/config.jsimport { normalizePath } from './utils.js';/** * 加载 vite 配置文件 * （模拟） */async function resolveConfig() {  const config = {    root: normalizePath(process.cwd()) // 仅定义一个项目根目录的返回  };  return config;}export default resolveConfig;
```

可以看到在 `resolveConfig` 中我们模拟了一个 `config` 对象进行返回，此时 `config` 对象是一个固定的路径：为调用 `custom-vite` 命令的 pwd 路径。

关于 root 配置项的作用，可以参考 Vite Doc Config，我们接下来会用该字段匹配的路径来寻找项目根入口文件 (`index.html`) 的所在地址。

初始化配置文件后，我们再次调用 `app.use(staticMiddleware(config));` 为服务使用了静态资源目录的中间件，保证使用 custom-vite 的目录下的静态资源在服务上的可访问性。

```
import serveStatic from 'serve-static';function staticMiddleware({ root }) {  return serveStatic(root);}export default staticMiddleware;
```

上边我们使用了 serve-static 作为中间件来提供创建服务的静态资源功能。

此时，当我们在任意项目中使用 `custom-vite` 命令时 terminal 中打印出：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9xpceMXb0QKzWcicRklIYsndMDLILFWjicq835po2IqjUsnGicVpZpkBdA/640?wx_fmt=png&from=appmsg)  

同时，我们在浏览器中输入 `localhost:9999` 即可访问到我们根据使用到的项目创建的服务。

这一步，我们通过自己编写的 `custom-vite` 已经拥有一键启动开发环境的功能。

### 寻找 / 解析 HTML 文件

在调用 `custom-vite` 命令已经可以启动一个简单的开发服务器后，接下来我们就要开始为启动的开发服务器来填充对应的功能了。

了解过 Vite 的朋友都清楚，Vite 中的入口文件和其他沟通工具不同的是：vite 中是以 `html` 文件作为入口文件的。比如，我们新建一个简单的项目：

```
.
├── index.html
├── main.js
├── ./module.js
└── package.json
```

```
// index.html<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta ></script></body></html>
```

```
{  "name": "custom-vite-use",  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "dev": "vite",    "test": "echo \"Error: no test specified\" && exit 1"  },  "keywords": [],  "author": "",  "license": "ISC",  "devDependencies": {    "react": "^18.2.0",    "vite": "^5.0.4"  }}
```

```
const a = '1';export { a };
```

```
import react from 'react';
import { a } from './module.js';

console.log(a);
console.log(react, 'react');
```

我已在该项目中安装了 `react` 和 `vite`，我们先来看看对于上边这个简单的项目原始的 vite 表现如何。

此时我们在该项目目录下运行 `npm run dev` 命令，等待服务启动后访问 `localhost:5173`：

页面上会展示 `index.html` 的内容：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9GiaYkW5LM73Sl4gicZ8v4CwyRaicuvshb6iag8ZuicFofibnWGhIZqswY0PQ/640?wx_fmt=png&from=appmsg)  

同时，浏览器控制台中会打印：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9TjV6DXeKFTGPAplQJg67UW2r7jPMYx7OnfJ6ibuLDu4CIJpdolyw1jQ/640?wx_fmt=png&from=appmsg)  

> ❝
> 
> 当然，也会打印 `1`。因为 `module.js` 是我在后续为了满足递归流程补上来的模块所以这里的图我就不补充了，大家理解即可～
> 
> ❞

同时我们观察浏览器 network 请求：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9O5xkAtZfVRT38tnZJXaxzuDTUE45rvzeL93lrukia5l42mVuMfhvCQQ/640?wx_fmt=png&from=appmsg)  

network 中的请求顺序分别为 `index.html` => `main.js` => `react.js`，这里我们先专注预构建过程忽略其他的请求以及 `react.js`  后边的查询参数。

当我们打开 `main.js` 查看 sourceCode 时，会发现这个文件中关于 react 的引入已经完全更换了一个路径：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9ialDVicjShtANmIVNJelqOSUSr8Lbh80ZWT5ZFoLzMEWQXL68tWqtW0w/640?wx_fmt=png&from=appmsg)  

很神奇对比，**「前边我们说过 vite 在启动开发服务器时对于第三方依赖会进行预构建的过程」**。这里，`/node_modules/.vite/deps/react.js` 正是启动开发服务时 react 的预构建产物。

我们来打开源码目录查看下：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9jubGhVQKINrsbjYHLYwnRasBI1J8zAPUSwWJjiajJN6hjqBiaRhYmFLg/640?wx_fmt=png&from=appmsg)  
![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9wzrBGyvm0nvwKeRwnl310zlGbfr12OPZDXPJkCvs4arhTAd0nlf4dA/640?wx_fmt=png&from=appmsg)  

一切都和我们上述提到过的过程看上去是那么的相似对吧。

启动开发服务器时，会首先根据 `index.html` 中的脚本分析模块依赖，将所有项目中引入的第三方依赖（这里为 `react`） 进行预构建。

**「将构建后的产物存储在 `.vite/deps` 目录中，同时将映射关系保存在 `.vite/deps/_metadata.json` 中，其中 `optimized` 对象中的 `react` 表示原始依赖的入口文件而 `file` 则表示经过预构建后生成的产物（两者皆为相对路径）。」**

之后，简单来说我们只要在开发环境下判断如果请求的文件名命中 `optimized` 对象的 `key` 时（这里为 `react`）则直接预构建过程中生成的文件 (`file` 字段对应的文件路径即可）。

接下来，我们就尝试在我们自己的 `custom-vite` 中来实现这一步骤。

首先，让我们从寻找 `index.html` 中出发：

```
// /src/config.jsimport { normalizePath } from './utils.js';import path from 'path';/** * 加载 vite 配置文件 * （模拟） */async function resolveConfig() {  const config = {    root: normalizePath(process.cwd()),    entryPoints: [path.resolve('index.html')] // 增加一个 entryPoints 文件  };  return config;}export default resolveConfig;
```

首先，我们来修改下之前的 `/src/config.js` 为模拟的配置文件增加一个 `entryPoints` 入口文件，该文件表示 custom-vite 进行构建时的入口文件，即项目中的 `index.html` 文件。

```
// /src/server/index.jsimport connect from 'connect';import http from 'node:http';import staticMiddleware from './middleware/staticMiddleware.js';import resolveConfig from '../config.js';import { createOptimizeDepsRun } from '../optimizer/index.js';/** * 创建开发服务器 */async function createServer() {  const app = connect();  const config = await resolveConfig();  app.use(staticMiddleware(config));  const server = {    async listen(port, callback) {      // 启动服务之前进行预构建      await runOptimize(config);      http.createServer(app).listen(port, callback);    }  };  return server;}/** * 预构建 * @param {*} config */async function runOptimize(config) {  await createOptimizeDepsRun(config);}export { createServer };
```

上边我们对于 `/src/server/index.js` 中 `createServer` 方法进行了修改，在 `listen` 启动服务之前增加了 `runOptimize` 方法的调用。

所谓 `runOptimize` 方法正是在启动服务之前的预构建函数。可以看到在 `runOptimize` 中递归调用了一个 `createOptimizeDepsRun` 方法。

接下来，我们要实现这个 `createOptimizeDepsRun` 方法。这个方法的核心思路正是**「我们希望借助 Esbuild 在启动开发服务器前对于整个项目进行扫描，寻找出项目中所有的第三方依赖进行预构建。」**

让我们新建一个 `/src/optimizer/index.js` 文件：

```
import { scanImports } from './scan.js';/** * 分析项目中的第三方依赖 * @param {*} config */async function createOptimizeDepsRun(config) {   // 通过 scanImports 方法寻找项目中的所有需要预构建的模块  const deps = await scanImports(config);  console.log(deps, 'deps');}export { createOptimizeDepsRun };// /src/optimizer/scan.jsimport { build } from 'esbuild';import { esbuildScanPlugin } from './scanPlugin.js';/** * 分析项目中的 Import * @param {*} config */async function scanImports(config) {  // 保存扫描到的依赖（我们暂时还未用到）  const desImports = {};  // 创建 Esbuild 扫描插件（这一步是核心）  const scanPlugin = await esbuildScanPlugin();  // 借助 EsBuild 进行依赖预构建  await build({    absWorkingDir: config.root, // esbuild 当前工作目录    entryPoints: config.entryPoints, // 入口文件    bundle: true, // 是否需要打包第三方依赖，默认 Esbuild 并不会，这里我们声明为 true 表示需要    format: 'esm', // 打包后的格式为 esm    write: false, // 不需要将打包的结果写入硬盘中    plugins: [scanPlugin] // 自定义的 scan 插件  });  // 之后的内容我们稍微在讲，大家先专注于上述的逻辑}export { scanImports };
```

可以看到在 `/src/optimizer/scan.js` 的 `scanImports` 方法最后调用了 esbuild `build` 的 build 方法进行构建。

正是在这一部分构建中，我们使用了自己定义的 `scanPlugin` Esbuild Plugin 进行扫描项目依赖，那么 `esbuildScanPlugin` 又是如何实现的呢？

```
// /src/optimizer/scanPlugin.jsimport nodePath from 'path';import fs from 'fs-extra';const htmlTypesRe = /(\.html)$/;const scriptModuleRe = /<script\s+type="module"\s+src\="(.+?)">/;function esbuildScanPlugin() {  return {    name: 'ScanPlugin',    setup(build) {      // 引入时处理 HTML 入口文件      build.onResolve({ filter: htmlTypesRe }, async ({ path, importer }) => {        // 将传入的路径转化为绝对路径 这里简单先写成 path.resolve 方法        const resolved = await nodePath.resolve(path);        if (resolved) {          return {            path: resolved?.id || resolved,            namespace: 'html'          };        }      });      // 当加载命名空间为 html 的文件时      build.onLoad({ filter: htmlTypesRe, namespace: 'html' }, async ({ path }) => {        // 将 HTML 文件转化为 js 入口文件        const htmlContent = fs.readFileSync(path, 'utf-8');        console.log(htmlContent, 'htmlContent'); // htmlContent 为读取的 html 字符串        const [, src] = htmlContent.match(scriptModuleRe);        console.log('匹配到的 src 内容', src); // 获取匹配到的 src 路径：/main.js        const jsContent = `import ${JSON.stringify(src)}`;        return {          contents: jsContent,          loader: 'js'        };      });    }  };}export { esbuildScanPlugin };
```

简单来说，Esbuild 在进行构建时会对每一次 `import` 匹配插件的 `build.onResolve` 钩子，匹配的规则核心为两个参数，分别为：

*   `filter`: 该字段可以传入一个正则表达式，Esbuild 会为每一次导入的路径与该正则进行匹配，如果一致则认为通过，否则则不会进行该钩子。
    
*   `namespace`: 每个模块都有一个关联的命名空间，默认每个模块的命名空间为 file （表示文件系统），我们可以显示声明命名空间规则进行匹配，如果一致则认为通过，否则则不会进行该钩子。
    

> ❝
> 
> 不熟悉 Esbuild 相关配置和 Plugin 开发的同学可以优先移步 Esbuild 官网手册进行简单的查阅。
> 
> ❞

上述的 `scanPlugin` 的核心思路为：

*   当运行 `build` 方法时，首先入口文件地址会进入 `ScanPlugn` 的 `onResolve` 钩子。
    

此时，由于 `filter` 的正则匹配为后缀为 `.html`，并不存在 namespace(默认为 `file`)。则此时，`index.html` 会进入 `ScanPlugin` 的 `onResolve` 钩子中。

在 `build.onResolve` 中，我们先将传入的 `path` 转化为磁盘上的绝对路径，将 html 的绝对路径进行返回，同时修改入口 html 的 `namespace` 为自定义的 `html`。

> ❝
> 
> 需要注意的是如果同一个 import （导入）如果存在多个 `onResolve` 的话，会按照代码编写的顺序进行顺序匹配，**「如果某一个 `onResolve` 存在返回值，那么此时就不会往下继续执行其他 `onResolve` 而是会进行到下一个阶段 (`onLoad`)」**，Esbuild 中其他 hook 也同理。
> 
> ❞

*   之后，由于我们在 `build.onResolve` 中对于入口 `html` 文件进行了拦截处理，在 `onLoad` 钩子中依然进行匹配。
    

`onLoad` 钩子中我们的 `filter` 规则同样为 `htmlTypesRe`, 同时增加了匹配 `namespace` 为 `html` 的导入。

此时，我们在上一个 `onResove` 返回的 `namspace` 为 `html` 的入口文件会进行该 `onLoad` 钩子。

> ❝
> 
> build.onLoad 该钩子的主要作用加载对应模块内容，如果 onResolve 中返回 `contents` 内容，则 Esbuild 会将返回的 `contents` 作为内容进行后续解析（并不会对该模块进行默认加载行为解析），否则默认会为 `namespace` 为 `file` 的文件进行 IO 读取文件内容。
> 
> ❞

我们在 `build.onlod` 钩子中，首先根据传入的 `path` 读取入口文件的 `html` 字符串内容获得 `htmlContent`。

之后，我们根据正则对于 `htmlContent` 进行了截取，获取 `<script type="module" src="/main.js />"` 中引入的 js 资源 `/main.js`。

**「此时，虽然我们的入口文件为 `html` 文件，但是我们通过 EsbuildPlugin 的方式从 html 入口文件中截取到了需要引入的 js 文件。」**

之后，我们拼装了一个 `import "/main.js"` 的 `jsContent` 在 `onLoad` 钩子函数中进行返回，同时声明该资源类型为 `js`。

> ❝
> 
> 简单来说 Esbuild 中内置部分文件类型，我们在 `plugin` 的 `onLoad` 钩子中通过返回的 `loader` 关键字来告诉 Esbuild 接下来使用哪种方式来识别这些文件。
> 
> ❞

此时，Esbuil 会对于返回的 `import "/main.js"` 当作 JavaScript 文件进行递归处理，这样也就达成了我们**「解析 HTML 文件」**的目的。

我们来回过头稍微总结下，之所以 Vite 中可以将 HTML 文件作为入口文件。

其实正是借助了 Esbuild 插件的方式，在启动项目时利用 Esbuild 使用 HTML 作为入口文件之后利用 Plugin 截取 HTML 文件中的 script 脚本地址返回，从而寻找到了项目真正的入口 `js` 资源进行递归分析。

### 递归解析 js/ts 文件

上边的章节，我们在 `ScanPlugin` 中分别编写了 `onResolve` 以及 `onLoad` 钩子来分析入口 html 文件。

其实，`ScanPlugin` 的作用并不仅仅如此。这部分，我们会继续完善 `ScanPlugin` 的功能。

我们已经可以通过 HTML 文件寻找到引入的 `/main.js` 了，那么接下来自然我们需要对 js 文件进行递归分析**「寻找项目中需要被依赖预构建的所有模块。」**

递归寻找需要被预构建的模块的思路同样也是通过 Esbuild 中的 Plugin 机制来实现，简单来说我们会根据上一步转化得到的 `import "/main.js"` 导入来进行递归分析。

对于 `/main.js` 的导入语句会分为以下两种情况分别进行不同的处理：

*   对于 `/main.js` 中的导入的**「源码部分」**会进入该部分进行递归分析，比如 `/main.js` 中如果又引入了另一个源码模块 `./module.js` 那么此时会继续进入 `./module.js` 递归这一过程。
    
*   对于 `/main.js` 中导入的**「第三方模块」**会通过 Esbuild 将该模块标记为 external ，从而记录该模块的入口文件地址以及导入的模块名。
    

比如 `/main.js` 中存在 `import react from 'react'`，此时首先我们会通过 Esbuild 忽略进入该模块的扫描同时我们也会记录代码中依赖的该模块相关信息。

> ❝
> 
> 标记为 external 后，esbuild 会认为该模块是一个外部依赖不需要被打包，所以就不会进入该模块进行任何扫描，换句话到碰到第三方模块时并不会进入该模块进行依赖分析。
> 
> ❞

解析来我们首先来一步一步来晚上上边的代码：

```
// src/optimizer/scan.js/** * 分析项目中的 Import * @param {*} config */async function scanImports(config) {  // 保存依赖  const depImports = {};  // 创建 Esbuild 扫描插件  const scanPlugin = await esbuildScanPlugin(config, depImports);  // 借助 EsBuild 进行依赖预构建  await build({    absWorkingDir: config.root,    entryPoints: config.entryPoints,    bundle: true,    format: 'esm',    write: false,    plugins: [scanPlugin]  });  return depImports;}
```

首先，我们先为 `scanImports` 方法增加一个 depImports 的返回值。

之后，我们继续来完善 `esbuildScanPlugin` 方法：

```
import fs from 'fs-extra';import { createPluginContainer } from './pluginContainer.js';import resolvePlugin from '../plugins/resolve.js';const htmlTypesRe = /(\.html)$/;const scriptModuleRe = /<script\s+type="module"\s+src\="(.+?)">/;async function esbuildScanPlugin(config, desImports) {  // 1. Vite 插件容器系统  const container = await createPluginContainer({    plugins: [resolvePlugin({ root: config.root })],    root: config.root  });  const resolveId = async (path, importer) => {    return await container.resolveId(path, importer);  };  return {    name: 'ScanPlugin',    setup(build) {      // 引入时处理 HTML 入口文件      build.onResolve({ filter: htmlTypesRe }, async ({ path, importer }) => {        // 将传入的路径转化为绝对路径        const resolved = await resolveId(path, importer);        if (resolved) {          return {            path: resolved?.id || resolved,            namespace: 'html'          };        }      });      // 2. 额外增加一个 onResolve 方法来处理其他模块(非html，比如 js 引入)      build.onResolve({ filter: /.*/ }, async ({ path, importer }) => {        const resolved = await resolveId(path, importer);        if (resolved) {          const id = resolved.id || resolved;          if (id.includes('node_modules')) {            desImports[path] = id;            return {              path: id,              external: true            };          }          return {            path: id          };        }      });      // 当加载命名空间为 html 的文件时      build.onLoad(        { filter: htmlTypesRe, namespace: 'html' },        async ({ path }) => {          // 将 HTML 文件转化为 js 入口文件          const htmlContent = fs.readFileSync(path, 'utf-8');          const [, src] = htmlContent.match(scriptModuleRe);          const jsContent = `import ${JSON.stringify(src)}`;          return {            contents: jsContent,            loader: 'js'          };        }      );    }  };}export { esbuildScanPlugin };
```

esbuildScanPlugin 方法新增了 `createPluginContainer` 和 `resolvePlugin` 两个方法的引入：

```
// src/optimizer/pluginContainer.jsimport { normalizePath } from '../utils.js';/** * 创建 Vite 插件容器 * Vite 中正是自己实现了一套所谓的插件系统，可以完美的在 Vite 中使用 RollupPlugin。 * 简单来说，插件容器更多像是实现了一个所谓的 Adaptor，这也就是为什么 VitePlugin 和 RollupPlugin 可以互相兼容的原因 * @param plugin 插件数组 * @param root 项目根目录 */async function createPluginContainer({ plugins }) {  const container = {    /**     * ResolveId 插件容器方法     * @param {*} path     * @param {*} importer     * @returns     */    async resolveId(path, importer) {      let resolved = path;      for (const plugin of plugins) {        if (plugin.resolveId) {          const result = await plugin.resolveId(resolved, importer);          if (result) {            resolved = result.id || result;            break;          }        }      }      return {        id: normalizePath(resolved)      };    }  };  return container;}export { createPluginContainer };
```

```
// src/plugins/resolve.jsimport os from 'os';import path from 'path';import resolve from 'resolve';import fs from 'fs';const windowsDrivePathPrefixRE = /^[A-Za-z]:[/\\]/;const isWindows = os.platform() === 'win32';// 裸包导入的正则const bareImportRE = /^(?![a-zA-Z]:)[\w@](?!.*:\/\/)/;/** * 这个函数的作用就是寻找模块的入口文件 * 这块我们简单写，源码中多了 exports、imports、main、module、yarn pnp 等等之类的判断 * @param {*} id * @param {*} importer */function tryNodeResolve(id, importer, root) {  const pkgDir = resolve.sync(`${id}/package.json`, {    basedir: root  });  const pkg = JSON.parse(fs.readFileSync(pkgDir, 'utf-8'));  const entryPoint = pkg.module ?? pkg.main;  const entryPointsPath = path.join(path.dirname(pkgDir), entryPoint);  return {    id: entryPointsPath  };}function withTrailingSlash(path) {  if (path[path.length - 1] !== '/') {    return `${path}/`;  }  return path;}/** * path.isAbsolute also returns true for drive relative paths on windows (e.g. /something) * this function returns false for them but true for absolute paths (e.g. C:/something) */export const isNonDriveRelativeAbsolutePath = (p) => {  if (!isWindows) return p[0] === '/';  return windowsDrivePathPrefixRE.test(p);};/** * 寻找模块所在绝对路径的插件 * 既是一个 vite 插件，也是一个 Rollup 插件 * @param {*} param0 * @returns */function resolvePlugin({ root }) {  // 相对路径  // window 下的 /  // 绝对路径  return {    name: 'vite:resolvePlugin',    async resolveId(id, importer) {      // 如果是 / 开头的绝对路径，同时前缀并不是在该项目（root） 中，那么 vite 会将该路径当作绝对的 url 来处理（拼接项目所在前缀）      // /foo -> /fs-root/foo      if (id[0] === '/' && !id.startsWith(withTrailingSlash(root))) {        const fsPath = path.resolve(root, id.slice(1));        return fsPath;      }      // 相对路径      if (id.startsWith('.')) {        const basedir = importer ? path.dirname(importer) : process.cwd();        const fsPath = path.resolve(basedir, id);        return {          id: fsPath        };      }      // drive relative fs paths (only windows)      if (isWindows && id.startsWith('/')) {        // 同样为相对路径        const basedir = importer ? path.dirname(importer) : process.cwd();        const fsPath = path.resolve(basedir, id);        return {          id: fsPath        };      }      // 绝对路径      if (isNonDriveRelativeAbsolutePath(id)) {        return {          id        };      }      // bare package imports, perform node resolve      if (bareImportRE.test(id)) {        // 寻找包所在的路径地址        const res = tryNodeResolve(id, importer, root);        return res;      }    }  };}export default resolvePlugin;
```

这里我们来一步一步分析上述增加的代码逻辑。

首先，我们为 `esbuildScanPlugin` 额外增加了一个 `build.onResolve` 来匹配任意路径文件。

**「对于入口的 html 文件，他会匹配我们最开始 filter 为 `htmlTypesRe` 的 onResolve 勾子来处理。而对于上一步我们从 html 文件中处理完成后的入口 js 文件 (`/main.js`)，以及 `/main.js` 中的其他引入，比如 `./module.js` 文件并不会匹配 `htmlTypesRe` 的 onResolve 钩子则会继续走到我们新增的 `/.*/` 的 onResolve 钩子匹配中。」**

细心的朋友们会留意到上边代码中，我们把之前 `onResolve` 钩子中的 `path.resolve` 方法变成了 `resolveId(path, importer)` 方法。

所谓的 resolveId 则是通过在 `esbuildScanPlugin` 中首先创建了一个 `pluginContainer` 容器，之后声明的 `resolveId` 方法正是调用了我们创建的 `pluginContainer` 容器的 `resolveId` 方法。(`src/optimizer/pluginContainer.js`)。

我们要理解 pluginContainer 的概念，首先要清楚在 Vite 中实际上在开发环境会使用 Esbuild 进行预构建在生产环境上使用 Rollup 进行打包构建。

通常，我们会在 vite 中使用一些 vite 自身的插件也可以直接使用 rollup 插件，这正是 pluginContainer 的作用。

Vite 中会在进行文件转译时通过创建一个所谓的 pluginContainer 从而在 pluginContainer 中使用一个类似于 Adaptor 的概念。

它会在开发 / 生产环境下对于文件的导入调用 pluginContainer.resolveId 方法，而 pluginContainer.resolveId 方法则会依次调用配置的 vite 插件 / Rollup 插件的 ResolveId 方法。

> ❝
> 
> 其实你会发现 VitePlugin 和 RollupPlugin 的结构是十分相似的，唯一不同的是 VitePlugin 会比 RollupPlugin 多了一些额外的生命周期（钩子）以及相关 context 属性。
> 
> ❞

当然，开发环境下对于文件的转译（比如 `tsx`、`vue` 等文件的转译）正是通过 pluginContainer 来完成的，这篇文章重点在于预构建的过程所以我们先不对于其他方面进行拓展。

**「上述 `esbuildScanPlugin` 会返回一个 Esbuild 插件，然后我们在 Esbuild 插件的 `build.onResolve` 钩子中实际调用的是 `pluginContainer.resolveId` 来处理。」**

**「其实这就是相当于我们在 Esbuild 的预构建过程中调用了 VitePlugin。」**

同时，我们在调用 `createPluginContainer` 方法时传入了一个默认的 `resolvePlugin`，所谓的 resolvePlugin 注意是一个 **「Vite 插件」**。

resolvePlugin(`src/plugins/resolve.js`) 的作用就是通过传入的 `path` 以及 `importer` 获取去引入模块在磁盘上的绝对路径。

> ❝
> 
> 源码中 `resolvePlugin` 边界处理较多，比如虚拟导入语句的处理，yarn pnp、symbolic link 等一系列边界场景处理，这里我稍微做了简化，我们清楚该插件是一个内置插件用来寻找模块绝对路径的即可。
> 
> ❞

自然，在当调用 `custom-vite` 命令后：

*   首先会创建 `pluginContainer` ，这个容器是 vite 内置实现的插件系统。
    
*   之后，Esbuild 会对于入口 html 文件进行处理调用 scanPlugin 的第一个 onResolve 钩子。
    
*   在第一个 onResolve 钩子由于 html 会匹配 `htmlTypesRe` 的正则所以进入该钩子。该 onResolve 方法会调用 Vite 插件容器 (`pluginContainer`) 的 `resolvedId` 方法，**「通过 Esbuild 插件的 onResolve 来调用 Vite 插件的 ResolveId 方法」**，从而获得 html 入口文件的绝对路径。
    
*   之后在 Esbuild 的 onLoad 方法中截取该 html 中的 `script` 标签上的 `src` 作为模块返回值 (js 类型) 交给 Esbuild 继续处理(`import "/main.js"`)。
    
*   在之后，Esbuild 会处理 `"/main.js"` 的引入，由于第一个 onResolve 已经不匹配所以会进入第二个 onResolve 钩子，此时会进行相同的步骤调用 VitePlugin 获得该模块在磁盘上的绝对路径。
    

我们会判断返回的路径是否包含 `node_modules`，如果包含则认为它是一个第三方模块依赖。

**「此时，我们会通过 esBuild 将该模块标记为 `external: true` 忽略进行该模块内部进行分析，同时在 `desImports` 中记录该模块的导入名以及绝对路径。」**

如果为一个非第三方模块，比如 `/main.js` 中引入的 `./module.js`，那么此时我们会通过 onResolve 返回该模块在磁盘上的绝对路径。

Esbuild 会继续进入插件的 onLoad 进行匹配，由于 onLoad 的 filter 以及 namesapce 均为 htmlTypesRe 所以并不匹配，默认 Esbuild 会在文件系统中寻找该文件地址根据文件后缀名称进行递归分析。

这样，最终就达到了我们想要的结果。当我们在 `vite-use`(测试项目中) 调用 `custom-vite` 命令，会发现控制台中会打印：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9pjpBjgdNm8ElghbOCrPDdeBPQm10Wy2cWLxBnwYHPQjAjO57UoIr6Q/640?wx_fmt=png&from=appmsg)  

> ❝
> 
> 此时 `depImports` 中已经记录了我们在源码中引入的第三方依赖。
> 
> ❞

### 生成预构建产物

上边的步骤我们借助 Esbuild 以及 scanPlugin 已经可以在启动 Vite 服务之前完成依赖扫描获得源码中的所有第三方依赖模块。

接下来我们需要做的，正是对于刚刚获取到的 deps 对象中的第三方模块进行构建输出经过预构建后的文件以及一份资产清单 `_metadata.json` 文件。

首先，我们先对于 `src/config.js` 配置文件进行简单的修改：

```
import { normalizePath } from './utils.js';import path from 'path';import resolve from 'resolve';/** * 寻找所在项目目录（实际源码中该函数是寻找传入目录所在最近的包相关信息） * @param {*} basedir * @returns */function findNearestPackageData(basedir) {  // 原始启动目录  const originalBasedir = basedir;  const pckDir = path.dirname(resolve.sync(`${originalBasedir}/package.json`));  return path.resolve(pckDir, 'node_modules', '.custom-vite');}/** * 加载 vite 配置文件 * （模拟） */async function resolveConfig() {  const config = {    root: normalizePath(process.cwd()),    cacheDir: findNearestPackageData(normalizePath(process.cwd())), // 增加一个 cacheDir 目录    entryPoints: [path.resolve('index.html')]  };  return config;}export default resolveConfig;
```

我们对于 config.js 中的 config 配置进行了修改，简单增加了一个 `cacheDir` 的配置目录。

这个目录是用于当生成预构建文件后的存储目录，这里我们固定写死为当前项目所在的 node_modules 下的 `.custom-vite` 目录。

之后，我们在回到 `src/optimizer/index.js` 中稍做修改：

```
// src/optimizer/index.jsimport path from 'path';import fs from 'fs-extra';import { scanImports } from './scan.js';import { build } from 'esbuild';/** * 分析项目中的第三方依赖 * @param {*} config */async function createOptimizeDepsRun(config) {  const deps = await scanImports(config);  // 创建缓存目录  const { cacheDir } = config;  const depsCacheDir = path.resolve(cacheDir, 'deps');  // 创建缓存对象 （_metaData.json）  const metadata = {    optimized: {}  };  for (const dep in deps) {    // 获取需要被依赖预构建的目录    const entry = deps[dep];    metadata.optimized[dep] = {      src: entry, // 依赖模块入口文件（相对路径）      file: path.resolve(depsCacheDir, dep + '.js') // 预编译后的文件（绝对路径）    };  }  // 将缓存文件写入文件系统中  await fs.ensureDir(depsCacheDir);  await fs.writeFile(    path.resolve(depsCacheDir, '_metadata.json'),    JSON.stringify(      metadata,      (key, value) => {        if (key === 'file' || key === 'src') {          // 注意写入的是相对路径          return path.relative(depsCacheDir, value);        }        return value;      },      2    )  );  // 依赖预构建  await build({    absWorkingDir: process.cwd(),    define: {      'process.env.NODE_ENV': '"development"'    },    entryPoints: Object.keys(deps),    bundle: true,    format: 'esm',    splitting: true,    write: true,    outdir: depsCacheDir  });}export { createOptimizeDepsRun };
```

在 `src/optimizer/index.js` 中，之前我们已经通过 scanImports 方法拿到了 deps 对象：

```
{
  react: '/Users/ccsa/Desktop/custom-vite-use/node_modules/react/index.js'
} 
```

然后，我们冲 config 对象中拿到了 depsCacheDir 拼接上 `deps` 目录，得到的是存储预构建资源的目录。

同时创建了一个名为 metadata 的对象，遍历生成的 deps 为 metadata.optimize 依次赋值，经过 for of 循环后所有需要经过依赖预构建的资源全部存储在 `metadata.optimize` 对象中，这个对象的结构如下：

```
{  optimized: {    react: {      src: "/Users/ccsa/Desktop/custom-vite-use/node_modules/react/index.js",      file: "/Users/ccsa/Desktop/custom-vite-use/node_modules/.custom-vite/deps/react.js",    },  },}
```

> ❝
> 
> 需要注意的是，我们在内存中存储的 `optimize` 全部为绝对路径，而写入硬盘时的路径全部为相对路径。
> 
> ❞

之后同样我们使用 Esbuild 再次对应项目中的所有第三方依赖进行构建打包。不过不同的是这一步我们标记 `write:true` 是需要将构建后的文件写入硬盘中的。

完成上述过程后，我们再次在使用到的项目中 `custom-vite-use` 中运行 `custom-vite` 命令：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9xMh2G6Vy041gsQqWQktPxibzer0oEkqjVCc1qVcLrEK5Qja3oTA1b3w/640?wx_fmt=png&from=appmsg)  
![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9qJMuekgOgGfv95C0wWbuI3nAbM6ZcHnyiajC2F5wQyibzVM3SSN3kHTg/640?wx_fmt=png&from=appmsg)  

此时，我们已经实现了一个简易版本的 Vite 预构建过程。

之后，启动开发服务器后 Vite 实际会在开发服务器中对于第三方模块的请求进行拦截从而返回预构建后的资源。

至于 Vite 是如何拦截第三方资源以及在是如何在 ESM 源生模块下是如何处理 `.vue/.ts/.tsx` 等等之类的模块转译我会在后续的 Vite 文章中和大家继续进行揭密。

> ❝
> 
> 文章中的代码你可以在这里（https://github.com/19Qingfeng/custom-vite/tree/feat/prepare-scan）找到。
> 
> ❞

Vite 源码
-------

上边的章节中我们已经自己实现了一个简易的 Vite 预构建过程，接下来我会用上述预构建的过程和源码进行一一对照。

### Cli 命令文件

Vite 源码结构为 `monorepo` 结构，这里我们仅仅关心 vite 目录即可。

首先，Vite 目录下的 /pakcages/vite/bin/vite.js 文件是作为项目 cli 入口文件。

实际当运行 vite 命令时会执行该文件，执行该文件会经过以下调用链：

1.  执行 `/vite/src/node/cli.ts` 文件处理一系列命令行参数。
    
2.  处理完毕后再次调用 `/vite/src/node/server/index.ts` 创建开发服务器。
    

### createServer 方法

当运行一次 Vite 命令后会执行到 `/vite/src/node/server/index.ts` 中的 `createServer` 方法。

实际 createServer 就和我我们上述的 createServer 代表的含义是一致的，都是在开发环境下启动开发服务器。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9eCYnHEmyibMWQCic23REa3XK7592ZRryrO21eqJVqRMUuhny2BibLs7iag/640?wx_fmt=png&from=appmsg)  

> ❝
> 
> 实际上大多数流程和我们上述的代码思路是一致的，比如`resolveConfig` 以及 `serveStaticMiddleware` 之类。
> 
> ❞

### 依赖预构建

在 createServer 方法的下半部分中，我们可以看到：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9ic9n0oqR5EoG6YWm0bj0QhLlaItLuBYFPP4ydLrhYfWpOqQQKTAVPcw/640?wx_fmt=png&from=appmsg)  

1.  container.buildStart
    

所谓 container.buildStart 正是我们之前提到过的 vite 内部有一套自己的插件容器。vite 正是通过这一套插件容器来处理开发模式和生产模式的区别。

container 插件容器会实现一套和 Rollup 一模一样的插件 API，所以 Rollup Plugin 同样也可以通过 container Api 在开发模式下调用。

自然，生产模式下本身就使用 Rollup 进行构建，所以可以实现生产百分百的插件兼容。

2.  initDepsOptimizer
    

initDepsOptimizer 正是在启动开发服务器之前进行依赖预构建的核心方法。

### initDepsOptimizer

initDepsOptimizer 会调用 createDepsOptimizer 方法。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9qibUYEpSMNkSaL5jpMajhxVQGDxudPNeQjXALqQXTaCxRAFg0yYPB2Q/640?wx_fmt=png&from=appmsg)createDepsOptimizer 方法在开发模式下 (!isBuild):

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9zVBS1MxTZic2FK2VzVfNVdLH4YSfg5mn4gDZgXWMY8Zavre9zQwTXHg/640?wx_fmt=png&from=appmsg)  

discoverProjectDependencies 正如名字那样，这个方法是发现项目中的第三方依赖（依赖扫描）。

discoverProjectDependencies 内部会调用 scanImports（https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/scan.ts） 方法：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9btiaWE9icDvsnfARar5Zib2xQQ9mzeqF1aqicsXWQBA7GOLrolMoicP41HQ/640?wx_fmt=png&from=appmsg)  

编辑器左边部分为 scanImports 方法，他会返回 prepareEsbuildScanner 方法的返回值。

而 prepareEsbuildScanner 正是和我们上述思路一致的依赖扫描：借助 Esbuild 以及 esbuildScanPlugin 扫描项目中的第三方依赖。

最终 createDepsOptimizer 方法中会用 `deps` 保存 discoverProjectDependencies 方法的项目中扫描到的所有第三方依赖。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9fJDfvBCXjNkJ6RwbGicl5ib44AWibdevD0nxib4YPccMBUF5v3bt9BhBibw/640?wx_fmt=png&from=appmsg)  

> ❝
> 
> 这里有两点需要注意。
> 
> ❞

1.  首先 discoverProjectDependencies 寻找到的 react 实际地址是一个 `"/Users/ccsa/Desktop/custom-vite-use/node_modules/.pnpm/react@18.2.0/node_modules/react/index.js"` 的值，这是由于安装依赖时我使用的是 pnpm ，而 Vite 中对于 Symbolic link 有处理，而我们上边的代码比较简易并没有处理 Symbolic link。
    
2.  下图中可以看到 prepareEsbuildScanner 方法又创建了一个 pluginContainer。
    

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9qQ3uebBOoLwzAtNq2bv593W3K9qxo7kW5iao6stRvhicCzX2558Q3z2Q/640?wx_fmt=png&from=appmsg)  

Vite 中的 pluginContianer 并不是一个单例，Vite 中会多次调用 createPluginContainer 创建多个插件容器。

在 prepareEsbuildScanner 在与预构建过程同样会创建一个插件容器，这正是我们上述简易版 Vite 中创建的插件容器。

> ❝
> 
> 这里大家只要明白 pluginContainer 在 vite 中不是一个单例即可，后续在编译文件的文章中我们会着重来学习 pluginContainer 的概念。
> 
> ❞

### runOptimizeDeps

上述的步骤 Vite 已经可以通过 discoverProjectDependencies 拿到项目中的需要进行预构建的文件。

之后，createDepsOptimizer 方法中会使用 `prepareKnownDeps` 方法处理拿到的依赖（增加 hash 等）：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9CMqY1fSvYVEDactw0NZjLHIcvDbn0UelSOc1icKpurjIzWjEN5xAwDA/640?wx_fmt=png&from=appmsg)  

然后将 prepareKnownDeps 返回的 knownDeps 交给 runoptimizeDeps 进行处理:

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL900pibTibZRicL9wo3zoGafXa3JbKiad7v2iaRicOmOesPBMqE43rDaRHaakA/640?wx_fmt=png&from=appmsg)  

runOptimizeDeps 方法内部会调用 prepareEsbuildOptimizerRun（https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/index.ts）。

prepareEsbuildOptimizerRun 方法正是使用 EsBuild 对于前一步扫描生成的依赖进行预构建的方法：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9eCG1OHBFibRtdXiajqmRicopoY7dtOfUNtuNkiau8Yics73hWfsgnEplH9w/640?wx_fmt=png&from=appmsg)  

当 context 准备完毕后，prepareEsbuildOptimizerRun 会调用 `rebuild` 方法进行打包（生成预构建产物）：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9EYaCDxmgP7uUroH1ClBD7picfQVKApibH87zhLEah5y8iaoGpHjJLNzHA/640?wx_fmt=png&from=appmsg)  

当 rebuild 运行完毕后，我们会发现 node_modules 下的预构建文件也会生成了：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibutGz3o48fxnsSCMhibWODL9ebDjDM2bfceErKiak8bOBJEsXNPZRibO8k6mejJJQuemABeujtDEEbyg/640?wx_fmt=png&from=appmsg)  

Vite 源码中关于边界处理的 case 特别说，实话说笔者也并没有逐行阅读。

这里的源码部分更多是想起到一个抛砖引玉的作用，希望大家可以在了解预构建的基础思路后可以跟随源码自己手动 debugger 调试一下。

结尾
==

Vite 中依赖预构建截止这里已经给大家分享完毕了，希望文章中的内容可以帮助到大家。

之后我仍会在专栏中分享关于 Vite 中其他进阶内容，比如 Vite 开发环境下的文件转译、热重载以及如何在生产环境下的调用过程。

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！