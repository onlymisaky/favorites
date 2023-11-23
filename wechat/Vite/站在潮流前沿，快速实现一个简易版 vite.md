> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/LUpi0JXBiH0Agm57wVPHrQ)

> 张宇航，微医前端技术部医保支撑组，一个不文艺的处女座程序员。

目录
--

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">标题</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">模块</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">内容</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;"><a target="_blank" href="http://mp.weixin.qq.com/s?__biz=MzU4MTc2NTc5NQ==&amp;mid=2247486893&amp;idx=1&amp;sn=f79dfaaa513f2f5aec49f8f64ceab349&amp;chksm=fd43d261ca345b77705d7e17f489339941d6165d9f733fab2437e1ebad5404de4a571799cb2a&amp;scene=21#wechat_redirect" textvalue="90 行代码的webpack，你确定不学吗？" data-itemshowtype="0" tab="innerlink" data-linktype="2" hasload="1">90 行代码的 webpack，你确定不学吗？</a></td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">webpack</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; min-width: 85px;">简易实现</td></tr></tbody></table>

写在最前面
-----

本文最终实现的简易版 vite 可通过 github 地址 (https://github.com/levelyu/simple-vite) 下载，代码实现地较为简单（不到 100 行）可运行后再看此文，阅读效果可能更佳~

要解决的问题
------

首先我们参照官方文档启动一个 vue 模板的 vite-demo 项目

```
yarn create @vitejs/app vite-demo --template vuecd vite-demoyarnyarn dev
```

然后打开浏览器查看网络请求，我们不难发现 vite 正如官方文档所述利用浏览器支持原生 ES 模块的特性，让浏览器解析了 import 语句并发出网络请求避免了本地编译打包的过程，因此启动速度非常之快。

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9PgSraia0nfMEBJvoKWibZicsISWUnAbK7lwbUEY26aTQdhcllV4vYsu6VQ/640?wx_fmt=png)  

常言道 “先知其然, 然后知其所以然”, 在打开了 vite 模板工程的源文件再对照上述的网络请求后，有的同学可能有以下几个疑问：

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9PY1dlqfoa48YhOasuQcaI5b4Kh36WzlPv84nhQ6tL0y4f3NjVsic7cPA/640?wx_fmt=png)

1：main.js 返回的内容 其中 impor 语句为什么被改写成了 import {createApp} from '/node_modules/.vite/vue.js？

2：查看本地文件也会发现 node_modules 文件夹下为什么会多出了一个. vit 文件夹？

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9Pcg2UnblYXHjdCBGyLWJsU5wE8QJTdPB2zareCxyGF2XWlLqFqyhxBA/640?wx_fmt=png)  

3：.vue 文件的请求是怎么处理并返回能正常运行的 js 呢？

4: 为什么会多出两个 js 文件请求 /@vite/client 和 /node_modules/vite/dist/client/env.js 以及一个 websocket 连接？

对于问题 4，实际上是 vite devServer 的热更新相关的功能，不在本文的研究重点，因此本文的目的就是带着问题 1，2，3，参照源码实现一个没有热更新没有打包功能的极简易的 vite。（**注：本文参考的 vite 源码版本号为 2.3.0）**

准备工作
----

工欲善其事, 必先利其器。既然是从源码分析问题，那就先准备好调试工作。参照官方文档：

首先克隆 vite 仓库并创建一个软链接

```
git clone git@github.com:vitejs/vite.gitcd vite && yarncd packages/vite && yarn build && yarn linkyarn dev
```

进入之前初始化好的 vite-demo 项目并链接到本地 vite 仓库地址

```
cd vite-demoyarn link vite
```

从 vite bin 目录下 vite.js 文件不难发现 vite 命令对应的入口文件在 node_modules/vite/dist/node/cli.js

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9P6JiaWibSAOvAwQl04EV4De3zfayaBcS5hWEojmhQ5jWYpfPcNm01AL7g/640?wx_fmt=png)微信截图_20210511230131.png

因此我们可以在 vite-demo 的 package.json 文件中加入以下脚本命令：

```
"debug": "node --inspect-brk node_modules/vite/dist/node/cli.js"
```

并运行命令 yarn debug  后打开浏览器控制台即可看到 node 的图标，点击后，我们就可以开始进行源码调试的工作了:

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9Pg8DjiaoACibQvdyOHdDiaT57I2d3e9LmyibaYpIIHmqpaureSpc0h82Gaw/640?wx_fmt=png)微信图片_20210511231000.png

源码分析
----

> 注意：为方便理解，本文对应的源码均为截取后的伪代码

### server 的创建过程

```
// src/node/cli.tscli  .command('[root]')  .alias('serve')  .action(async () => {    const { createServer } = await import('./server')      const server = await createServer({        // ...      })      await server.listen()  })
```

不难看出上述入口文件代码是从 src/node/server/index.ts 引入了一个 createServer 方法并调用返回了一个 server 对象，紧接着调用了 server 的 listen 方法。ok, 那就让我们看看这个 createServer 方法内部做了哪些事情:

```
// src/node/server/index.ts// ....import connect from 'connect';import { transformMiddleware } from './middlewares/transform'//...export async function createServer() {    // ...    const middlewares = connect();    const httpServer = await resolveHttpServer({}, middlewares)    // 实际 server 的配置会读取 vite.config.js 以及各种插件中的配置 本文力求通俗简易就不再详细分析赘述...    const server = {        httpServer,        listen() {            return startServer(server);        },    };    // ...    middlewares.use(transformMiddleware(server))    // ...    await runOptimize();    return server;}async function startServer(server) {    // ...    const httpServer = server.httpServer;    // ...    const port = 3000;     const hostname = '127.0.0.1';    return new Promise((resolve, reject) =>{        httpServer.listen(port, hostname, () => {            resolve(server);        });    });};// src/node/server/http.tsexport async function resolveHttpServer(serveroptions, app) {    return require('http').createServer(app)}
```

通过上述伪代码可以发现，vite2 最终是调用了 http.ts 中的 resolveHttpServer 方法，通过 node 原生的 http 模块创建的 server。同时在 createServer 方法内部，使用了 connect 框架作为中间件。

### 依赖预构建

细心的同学不难发现在上述 createServer 方法的伪代码中有个 runOptimize 方法，下面让我们看看这个函数里具体做了哪些事情：

```
// src/node/server/index.tsconst runOptimize = async () => {    if (config.cacheDir) {      server._isRunningOptimizer = true      try {        server._optimizeDepsMetadata = await optimizeDeps(config)      } finally {        server._isRunningOptimizer = false      }      server._registerMissingImport = createMissingImporterRegisterFn(server)    }}
```

实际该方法最重要的是调用了依赖预构建的核心方法：**optimizeDeps**， 其定义在 src/node/optimizer/index.ts 中，并且在 server 启动前就已调用。

那么何为**依赖预构建**呢，vite 不是 No Bundle 吗？对此，官方文档做出了详细解释：点此查看原因，简而言之其目的有二：

1.  兼容 CommonJS 和 AMD 模块的依赖
    
2.  减少模块间依赖引用导致过多的请求次数
    

再结合以下伪代码分析：

```
// src/node/optimizer/index.tsimport { build } from 'esbuild';import { scanImports } from './scan';export async function optimizeDeps() {    // cacheDir 的定义在 src/node/config.ts    const cacheDir =  `node_modules/.vite`;    // optimizeDeps  函数依赖预构建的重要函数     const dataPath = path.join(cacheDir, '_metadata.json');     if (fs.existsSync(cacheDir)) {        emptyDir(cacheDir)      } else {        // 创建 cacheDir 目录        fs.mkdirSync(cacheDir, { recursive: true })      }    ;({ deps, missing } = await scanImports(config))    // eg: deps = {vue: "C:/code/sourcecode/vite-demo/node_modules/vue/dist/vue.runtime.esm-bundler.js"}    const result = await build({        entryPoints: Object.keys(flatIdDeps),        outdir: cacheDir,    })    writeFile(dataPath, JSON.stringify(data, null, 2))}
```

至此，我们基本可以得到开篇问题 2（为什么 node_modules 下多出了一个. vite 文件夹）的答案了。那么，可能又有同学有以下两个疑问：

1.vite 是如何分析找到哪些模块是需要预构建的呢？

2.vite 是如何完成预构建的同时保证构建速度的呢？

带着这两个问题，继续一路 debug 下去，不难发现答案就是 esbuild，关于 esbuild 是什么这里就不再赘述了，这里就贴一张官方文档的对比图感受下，总之就是一个字：快！！！

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9PDkUF5qSGHnrw9sc2yDJftXs4sWRhibUHntDaffBkjW83iaMhkIbqXkuw/640?wx_fmt=png)  

继续回到刚才 src/node/optimizer/index.ts 中的伪代码，实际上 scanImports 函数其实就是完成对 import 语句的扫描，并返回了需要构建的依赖 deps, 下图则说明了这个 deps 其实就是 main.js 中唯一的依赖 vue 对应的路径：

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9PupcFrajUr2iaaNYPafXAMwGVMj6JXXyUAQTN7fghdOqhHecjKvsRicag/640?wx_fmt=png)  

那么这个 scanImports 是如何找到我们的唯一依赖 vue 呢：进入 scanImports 函数有以下伪代码：

```
// src/node/optimizer/scan.tsimport { Loader, Plugin, build, transform } from 'esbuild'export async function scanImports() {    cosnt entry = await globEntries('**/*.html', config)    const plugin = esbuildScanPlugin()    build({        write: false,        entryPoints: [entry],        bundle: true,        format: 'esm',       // ...      })    }function esbuildScanPlugin() {    return {        name: 'vite:dep-scan',        setup(build) {          build.onLoad(                { filter: htmlTypesRE, namespace: 'html' },                // 读取 html 内容  正则匹配到 <script> 内的内容             return {                    loader: 'js',                    content: 'import "/src/main.js" export default {}"                }            )           build.onLoad({ filter: JS_TYPES_RE }, ({ path: id } => {                // eg: id = 'C:\\code\\sourcecode\\vite-demo\\src\\main.js'                        return {                    loader: 'js',                    content: '' // eg: 读取 main.js 内容 内有 import vue from 'vue'                }            })             build.onResolve( {filter: /^[\w@][^:]/},async ({ path: id, importer }) => {                // eg: id = "vue"                 // eg: importer = "C:\\code\\sourcecode\\vite-demo\\src\\main.js"                // 加入依赖                depImports[id] = await resolve(id, importer); // eg: 返回"C:/code/sourcecode/vite-demo/node_modules/vue/dist/vue.runtime.esm-bundler.js"                return {                    path： 'C:/code/sourcecode/vite-demo/node_modules/vue/dist/vue.runtime.esm-bundler.js'                }            })        }    };}
```

对照代码注释并结合以下流程图

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9P0aFymVVvickribYjhuR0QtkAnkzGoSMpy9icNK4S9VHs3c1gPxUbMuStg/640?wx_fmt=png)  

至此我们可以得出结论：vite 主要是通过一个内置的 vite:dep-scan esbuild 插件分析依赖项并将其写入一个_metadata.json 文件中，并通过 esbuild 将依赖的模块（如将 vue.runtime.esm-bundler.js）打包至. vite 文件中（产生一个 vue.js 和 vue.js.map 文件），这也就是开篇问题 2（本地多了一个. vite 文件夹）的答案。

### transformMiddleware

在上节中我们分析了 vite 预构建的过程，最终其将打包后的文件写入在. vite 文件夹内解决了开篇提出的问题 2。那么让我们继续回到开篇提到的问题 1：main.js 中的 import vue from 'vue'是如何改写成 import vue from '/node_modules/.vite/vue.js'的：

还记得我们在 src/node/optimizer/index.ts 中的一段代码吗：

```
//src/node/optimizer/index.tsimport { transformMiddleware } from './middlewares/transform'const middlewares = connect();middlewares.use(transformMiddleware);
```

实际上 transformMiddleware 正是 vite devServer 核心的中间件，简而言之它负责拦截处理各种文件的请求并将其内容转换成浏览器能识别的正确代码，下面让我们看下 transformMiddleware 做了哪些事情：

```
// src/node/server/middlewares/transform.tsimport { transformRequest } from '../transformRequest'export function transformMiddleware(server) {    // ....    if (isJSRequest(url) ) {        const result = await transformRequest(url)        return send(            req,            res,            result.code,            type,            result.etag,            // allow browser to cache npm deps!            isDep ? 'max-age=31536000,immutable' : 'no-cache',            result.map         )    }}
```

可以看得出它对 js 的请求，是通过 vite 中间件的一个核心方法 transformRequest 处理的，并将结果发送至浏览器

```
// src/node/server/transformRequest.tsexport async function transformRequest(url) {    code = await fs.readFile(url, 'utf-8')    const transformResult = await pluginContainer.transform(code)    code = transformResult.code!    return {        code    }}
```

transformRequest 中代码的核心处理是 pluginContainer.transform 方法，而 transform 方法会遍历 vite 内置的所有插件以及用户配置的插件处理转换 code，其中内置的一个核心的插件为 import-analysis

```
// src/node/plugins/importAnalysis.tsimport { parse as parseImports } from 'es-module-lexer'export function importAnalysisPlugin() {    return {        name: 'vite:import-analysis',        async transform(source, importer, ssr) {            const specifier = parseImports(source); // specifier = vue            await normalizeUrl(specifier);            const normalizeUrl  = async (specifier)=> {                const resolved = await this.resolve(specifier)                // eg: resolved = {id: "C:/code/sourcecode/vite-demo/node_modules/.vite/vue.js?v=82c5917e"}            }        }    }}
```

对 importAnalysisPlugin 函数内部做的事情可简单归纳如下：

1.  使用一个词法分析利器 es-module-lexer 对源代码进行词法分析，并最终能拿到 main.js 中的语句 import vue from 'vue'中的 vue
    
2.  调用 reslove 方法最终其会先后调用 vite 内置的两个 plugin：vite:pre-alias 及 vite:resolve
    
3.  最终在 vite:resolve 内的钩子函数 resolveId 内部调用 tryOptimizedResolve
    
4.  tryOptimizedResolve 最终会通过读取依赖构建阶段的缓存的依赖映射对象，拿到 vue 对应的路径
    

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9PEiaz2lSeK5JVfYEOMpr9IqAQFfBsdOwrlfuKjCPWuw6vugSqiabZTibgQ/640?wx_fmt=png)  

### 小结一下

至此我们已经通过源码分析解决了开篇所提到的问题 1 和问题 2，简单地总结下就是：

1.  vite 在启动服务器之前通过 esbuild 及内置的 vite:dep-scan esbuild 插件将 main.js 中的依赖 vue 预构建打包至 /node_modules/.vite / 下
    
2.  核心中间件 transformMiddleware 拦截 main.js 请求，读取其内容，在 import-analysis 的插件内部通过 es-module-lexer 分析 import 语句读取到依赖 vue, 再通过一系列的内置 plugin 最终将 import 语句中的 vue 转换成 vue 对应预构建的真实路径
    

对于问题 3vite 是如何转换. vue 文件的请求，vite 同样是通过 transformMiddleware 拦截. vue 请求并调用外部插件 @vitejs/plugin-vue 处理转换的，感兴趣的同学可以查看 plugin-vue 的源码, 本文就不再赘述了而是通过下文的实践章节以代码来解释。

### 实践一下

ok，在一顿分析之后我们终于来到了 coding 的环节了，废话不多说，我们先创建一个 server

```
// simple-vite/vit/index.jsconst http = require('http');const connect = require('connect');const middlewares = connect();const createServer = async ()=> {    // 依赖预构建    await optimizeDeps();    http.createServer(middlewares).listen(3000, () => {        console.log('simple-vite-dev-server start at localhost: 3000!');    });};// 用于返回 html 的中间件middlewares.use(indexHtmlMiddleware);// 处理 js 和 vue 请求的中间件middlewares.use(transformMiddleware);createServer();
```

接着我们写下依赖预构建的函数 optimizeDeps

```
// simple-vite/vit/index.jsconst fs = require('fs');const path = require('path');const esbuild = require('esbuild');// 因为我们的 vite 目录和测试的 src 目录在同一层，因此加了个../const cacheDir = path.join(__dirname, '../', 'node_modules/.vite');const optimizeDeps = async () => {    if (fs.existsSync(cacheDir)) return false;    fs.mkdirSync(cacheDir, { recursive: true });    // 在分析依赖的时候 这里为简单实现就没按照源码使用 esbuild 插件去分析    // 而是直接简单粗暴的读取了上级 package.json 的 dependencies 字段    const deps = Object.keys(require('../package.json').dependencies);    // 关于 esbuild 的参数可参考官方文档    const result = await esbuild.build({        entryPoints: deps,        bundle: true,        format: 'esm',        logLevel: 'error',        splitting: true,        sourcemap: true,        outdir: cacheDir,        treeShaking: 'ignore-annotations',        metafile: true,        define: {'process.env.NODE_ENV': "\"development\""}      });    const outputs = Object.keys(result.metafile.outputs);    const data = {};    deps.forEach((dep) => {        data[dep] = '/' + outputs.find(output => output.endsWith(`${dep}.js`));    });    const dataPath = path.join(cacheDir, '_metadata.json');    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));};
```

至此依赖预构建的函数已写完，当我们运行命令后会发现有打包后的依赖包及依赖映射的 json 文件, 而且整个过程非常快

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9PH0NwbjhiclZ5JOl7tXXJLiaAI9kh7UAgkNwicpiacNkcmNgN6QfuMutj3g/640?wx_fmt=png)微信图片_20210513214012.png

再然后我们来实现下中间件函数，indexHtmlMiddleware 没什么好说的就是读取返回根目录的 index.html

```
// simple-vite/vit/index.jsconst indexHtmlMiddleware = (req, res, next) => {    if (req.url === '/') {        const htmlPath = path.join(__dirname, '../index.html');        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');        res.setHeader('Content-Type', 'text/html');        res.statusCode = 200;        return res.end(htmlContent);    }    next();};
```

最核心的当属 transformMiddleware 了, 首先让我们处理下 js 文件

```
// simple-vite/vit/index.jsconst transformMiddleware = async (req, res, next) => {    // 因为预构建我们配置生成了 map 文件所以同样要处理下 map 文件    if (req.url.endsWith('.js') || req.url.endsWith('.map')) {        const jsPath = path.join(__dirname, '../', req.url);        const code = fs.readFileSync(jsPath, 'utf-8');        res.setHeader('Content-Type', 'application/javascript');        res.statusCode = 200;        // map 文件不需要分析 import 语句        const transformCode = req.url.endsWith('.map') ? code : await importAnalysis(code);        return res.end(transformCode);    }    next();};
```

transformMiddleware 最关键的就是 importAnalysis 函数了，正如 vite2 源码里一样其正是处理分析源代码中的 import 语句，并将依赖包替换成预构建包的路径

```
// simple-vite/vit/index.jsconst { init, parse } = require('es-module-lexer');const MagicString = require('magic-string');const importAnalysis = async (code) => {    // es-module-lexer 的 init 必须在 parse 前 Resolve    await init;    // 通过 es-module-lexer 分析源 code 中所有的 import 语句    const [imports] = parse(code);    // 如果没有 import 语句我们直接返回源 code    if (!imports || !imports.length) return code;    // 定义依赖映射的对象    const metaData = require(path.join(cacheDir, '_metadata.json'));    // magic-string vite2 源码中使用到的一个工具 主要适用于将源代码中的某些轻微修改或者替换    let transformCode = new MagicString(code);    imports.forEach((importer) => {        // n： 表示模块的名称 如 vue        // s: 模块名称在导入语句中的起始位置        // e: 模块名称在导入语句中的结束位置        const { n, s, e } = importer;        // 得到模块对应预构建后的真实路径  如         const replacePath = metaData[n] || n;         // 将模块名称替换成真实路径如/node_modules/.vite        transformCode = transformCode.overwrite(s, e, replacePath);    });    return transformCode.toString();};
```

至此，对于 js 请求已处理完毕，其中主要用到的两个包 es-module-lexer 和 magic-string 感兴趣的同学可以去对应的 github 地址了解。最后让我们再处理下. vue 文件吧：

```
// simple-vite/vit/index.jsconst compileSFC = require('@vue/compiler-sfc');const compileDom = require('@vue/compiler-dom');const transformMiddleware = async (req, res, next) => {    if (req.url.indexOf('.vue')!==-1) {        const vuePath = path.join(__dirname, '../', req.url.split('?')[0]);        // 拿到 vue 文件中的内容        const vueContent =  fs.readFileSync(vuePath, 'utf-8');        // 通过@vue/compiler-sfc 将 vue 中的内容解析成 AST        const vueParseContet = compileSFC.parse(vueContent);        // 得到 vue 文件中 script 内的 code        const scriptContent = vueParseContet.descriptor.script.content;        const replaceScript = scriptContent.replace('export default ', 'const __script = ');        // 得到 vue 文件中 template 内的内容        const tpl = vueParseContet.descriptor.template.content;        // 通过@vue/compiler-dom 将其解析成 render 函数        const tplCode = compileDom.compile(tpl, { mode: 'module' }).code;        const tplCodeReplace = tplCode.replace('export function render(_ctx, _cache)', '__script.render=(_ctx, _cache)=>');        // 最后不要忘了 script 内的 code 还要再一次进行 import 语句分析替换        const code = `                ${await importAnalysis(replaceScript)}                ${tplCodeReplace}                export default __script;        `;        res.setHeader('Content-Type', 'application/javascript');        res.statusCode = 200;        return res.end(await importAnalysis(code));    }    next();};
```

关于. vue 文件的处理好像也没什么好说的了，看代码看注释就完事了，想深入了解的同学可查看 @vitejs/plugin-vue。然后让我们看下此代码实现的最终效果吧：

![](https://mmbiz.qpic.cn/mmbiz_png/Tmczbd3NL015sthL1PFos468U5Hjkv9P6zUjuNdEibaib0O7tPR6RxxwjStP5e6MeBko8WsqgTVtu0aVNo3oibapw/640?wx_fmt=png)  

如上图所示，所有请求的文件最终都转换成了浏览器能成功运行的 js 代码。

最后的总结
-----

本文的最终目的是参照 vite2 源码实现一个极其简易版的 vite，其主要功能简而言之是以下两点：

1.  利用 esbuild 进行预构建工作，其目的是能将我们依赖的浏览器不支持运行的 CJS 和 AMD 模块的代码打包转换为浏览器支持的 ES 模块代码，同时避免了过多的网络请求次数。
    
2.  模拟源码实现一个 transformMiddleware，其目的是能将源代码进行转换浏览器能支持运行的代码，如：分析源代码的 import 语句并其替换为浏览器可执行的 import 语句以及将 vue 文件转换为可执行的 js 代码。
    

最后感谢您能抽出宝贵的时间来看此文章，希望能给您带来收获。

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V2mwZjG8T1LDomW0BIojAlLLzicDRktticyGHQwG0SoxC2vTtleOCIPBFrUia681Mnr8EmHpRxZH0aPg/640?wx_fmt=png)