> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nk5SN8AKwyFkUTEOiLCBdQ)

随着 Snowpack、Vite 等利用提倡 no-bundle 的构建工具逐渐兴起，同时现代浏览器对原生 ESM 的普遍支持，Bundle-less 的概念席卷前端圈，那么我们如何理解 Bundle-less？究竟是炒概念还是能够真正地给业界带来收益？下面就来分享一下我对于 Bundle-less 的理解以及在这个方向上做过的一些探索。

如何理解 Bundle-less?
=================

Bundle-less，也被叫做 Bundless，我觉得可以从这几个角度去理解:

1.  首先是拆包，弱化传统意义上的打包概念，由单 bundle 拆分为数十或者上百个 bundle，这样可以更好地利用 HTTP2 的多路复用优势和提升缓存命中率。
    
2.  然后是对于项目源代码不进行 bundle(no-bundle)，在开发阶段可以省略 bundle 的开销，如 Vite、Snowpack、WMR，这层含义相信大家都比较熟悉了。
    
3.  再者是依赖产物的模块化分发。对于庞大的外部依赖，一方面打包成本比较高，另一方面文件数量可能非常多，打包几乎是一个必选项，甚至需要多个 NPM 包合并打包。因此，针对依赖的打包也是非常重要的优化点，一般可以通过预打包 + 模块化缓存来进行优化，目前也有一些优化案例，如 Vite 中基于 Esbuild 的预打包器、基于 ESM  的 CDN 服务，如 Skypack、esm.sh、jspm 等，当然也有一些新的自研方案，后文会详细介绍。
    

一、拆多少包更合适？
----------

对于究竟拆多少包这个问题，大家的概念都一直比较模糊，打的包太多或者太少都可能出现加载性能的问题，比如过多的嵌套 import 导致网络瀑布流的产生、bundle 太少不能充分利用 HTTP2 下并发请求的优势。

针对这个问题，我们曾做过一系列的性能测试，最后得出的结论如下:

1.  对于总产物资源大小相同的情况，资源加载分成的 chunk 数量在 10 - 25 之间进行并行加载性能最佳。
    
2.  一次资源加载需要的依赖引用深度尽量等于 1 时加载性能最好。
    

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrO8xibqxzJgeCiaBevMwOBMn9HwapHwlSOicszKibtwhRsuqMbr53Jic8DkxA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOaaVIdHlkiavHqndJujdBtPgRUxw5ArzSdYA4mQGeGHqJia7InXClMZ7g/640?wx_fmt=png)

3.  由于不打包的情况下项目的请求数量和请求深度问题都不可控，因此不适合在生产构建中采用 no-bundle 方案。
    

二、No-bundle 服务
--------------

### 1. 代表方案 Vite

在开发环境中，Vite 主要做了两件事情:

*   基于 Esbuild 打包外部依赖
    
*   创建 HTTP Server 以响应浏览器中`<script type="module">` 所发起的一系列模块请求
    

而生产环境下直接使用 Rollup 进行打包。Vite 整体的优势是在于开发阶段，服务启动快、热更新快，明显地优化了开发者体验。![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrO8bDKRbMynhWUdp9Z3FWjS55qND1CbMaFXCSaREZvdBtibvGkLm9K4PA/640?wx_fmt=png)

### 2. 劣势及解决方案

#### 2.1 文件编译耗时较长

No-bundle 方案虽然省去了 bundle 的开销，但仍然需要进行单文件的编译 (如 TS、JSX、Less、Sass)，编译的时长仍然可能会比较长 (某些业务项目编译要 20 s 左右)。

Vite 在二次请求时会采用 Etag 标识返回协商缓存的内容，可以跳过编译消耗的时间，但服务重启后仍然需要进行全量的编译，体验不太好。

对此，一个比较好的解决方法是在服务退出时将 ModuleGraph 的内容缓存到本地，然后重启的时候激活缓存 (hydrate)，那么二次启动时仍然会使用协商缓存，达到比较快的首屏加载效果。

本地缓存在 Vite 中暂时还没有被完全实现，但也是未来的一个优化方向。https://github.com/vitejs/vite/issues/1309

#### 2.2 海量请求的加载性能问题

请求数量达到一定量级 (1000 +) 的时候，no-bundle 服务都会遇到加载性能问题，对 Vite 而言，尽管二次请求会使用协商缓存，但实际上请求仍然会发送，在开发环境中 (一般的业务项目会使用代理进行本地开发) 表现仍然不容乐观，以之前接入 Vite 的某个业务项目为例:

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;"><br></th><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">项目第一次构建 （CSR 构建时间为准）</th><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">页面加载时间 (二次加载)</th><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; min-width: 85px;">热更新</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">Webpack</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">80 s 构建</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">3~4 s</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">5 s 以上</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">使用 vite 方案</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">10 s 构建</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">10 s 左右</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">1 s 以内</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">时间缩短</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">50% 以上</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">vite 页面加载时间过长，由于调试后端接口需要频繁刷新页面，影响开发体验，需要进一步优化</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; min-width: 85px;">80% 以上</td></tr></tbody></table>

经过一系列的尝试，最后发现 Service Worker 缓存可以很好地解决这一类问题，思路如下：![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOl1jyd4a8yLgNvh7gpiazjysVIY26GbW0zYR7LImAm3EJkXhfc7ic15LA/640?wx_fmt=png)

简单来说就是把 Vite 的编译结果缓存到  Service Worker，并对于 HMR 的模块及其依赖模块禁用缓存，保证模块的编译结果永远是最新的。优化之后页面加载时间由 10s 降低到了 5 s 以内，明显地提升了开发体验。

#### 2.3 (Vite 独有) 开发 / 生产表现不一致

有不少人会吐槽 Vite 开发 / 生产环境的不一致性，因为开发环境使用 Esbuild + Dev Server 架构，而生产环境直接用 Rollup。但由于生产环境的构建场景和开发阶段存在天然差异，开发和生产表现一致是不现实的。所以问题的核心在于保证生产环境构建的稳定性。

而影响生产构建稳定性最主要的部分在于依赖的处理上，进一步说是对于 CommonJS 格式的依赖处理上面，开发环境使用 Esbuild 而生产环境下使用 @rollup/plugin-commonjs，就容易导致生产构建出现一些奇怪的问题，如 @rollup/plugin-commonjs  `ignoreTryCatch`行为 https://github.com/rollup/plugins/pull/1005，在默认情况下忽略对于 try-catch 代码块中的 require 语法转换，这样对于某些依赖 (如 `jspdf-autotable`) 就会出现问题，而开发阶段使用 Esbuild 就不会出现。

解决这类问题有两种方案:

*   生产环境也使用 Esbuild 来进行依赖的打包，确保 CommonJS 的处理规则和开发阶段一致。该 feature 已经实现，将在 Vite 3.0 发布 https://github.com/vitejs/vite/pull/8280
    
*   开发和生产阶段使用 ESM CDN 方案，用同一套依赖产物。
    

三、依赖产物的模块化分发
------------

对于第三方依赖，我们可以将其进行预构建，然后将产物进行分发，这样所有的依赖可以被 external 掉了，可以很大程度上降低项目 bundle 的开销。

总体而言，这类方案有几大关键要素:

*   预构建产物。
    
*   模块化方案。
    
*   产物分发机制。
    

接下来我们可以对照现有的案例来分析。

### 现有方案概览

首先是 Vite 的依赖预构建方案，使用 esbuild 对第三方依赖进行打包，基于浏览器原生 ESM 特性来加载第三方包的产物，同时将产物存储在本地，可以通过 Dev Server 访问产物资源。

其次包括开源社区的一些 ESM CDN 方案，如 Skypack、esm.sh。前者服务并未开源，后者使用 esbuild 进行模块打包或者单文件转译。这类方案也是依赖于浏览器原生 ESM 特性实现产物加载，通过第三方的 CDN 来进行产物分发，如通过 `https://esm.sh/react@18.0.2` 即可访问到对应的 react 包产物。

### 问题分析

当然，现有的依赖 Bundleless 方案并不能很好地运用到业务项目中，尤其是生产环境，因为以下的几个关键问题没有得到根本的解决：

*   产物语法和 Polyfill 安全问题
    
*   产物线上加载性能问题
    
*   模块化加载方案的兼容性问题
    
*   产物本地化调试问题
    

首先是**产物语法和 Polyfill 安全问题**。无论是 Vite 预构建还是社区开源的 Skypack 和 esm.sh 等 ESM CDN 方案，都不支持 ES3/ES5 语法降级，也没有基于 browserlist 的 polyfill 方案，这样一来就很无法兼容旧版本浏览器，如大部分需要支持 Android 4.4 / iOS 9 机型的业务就无法使用这些方案。

其次是**产物的性能问题**。如果你稍微了解一些 Vite，就知道 Vite 会把项目中所有的依赖 (包括 `lodash/add` 这种 subpath) 各自打包为一个 bundle 文件，在大型项目中依赖产物的数量仍然很大 (100 +)，根据之前 Bundleless 性能测试的结果，巨大的文件请求数量显然会带来页面加载的性能问题。

而对于开源的 ESM CDN 方案，一般有两种构建模式，分别的 bundle 模式和非 bundle 模式。在非 bundle  模式下会存在严重的网络瀑布流问题，而 bundle 模式下会把所有的间接依赖都打包进去，容易造成某些公共依赖重复打包的问题，使产物性能变差。同时，这些 ESM CDN 方案都不支持产物的 Tree Shaking，对于任何包都只能全量引入依赖产物，无法做到按需加载。

再者是模块化方案的兼容性问题。我们知道，ESM 在如今的前端圈大行其道，得到了众多浏览器的原生支持，但如果在生产环境也使用 ESM 格式的产物，那么很可能会产生兼容性问题，目前浏览器对于原生 ESM 的兼容性如下图:![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOcOYcLhwgsabc43gDTYqO7yvIRUtGIwkN2yyj1wEw1IsQAgSkF4shbQ/640?wx_fmt=png)

对于需要兼容 IE11 或者低版本移动端机型的项目，现有的 ESM CDN 方案就无法使用了。

最后是**产物的本地化调试和部署的问题**。Vite 的预构建产物可以在本地使用，通过 Dev Server 分发，但也有一定的弊端:

*   如果要调试产物，则需要开发者手动清除浏览器缓存
    
*   产物仅存在本地，团队成员之间无法共享产物
    

而现有的 ESM CDN 产物本地化方面也显得捉襟见肘:

*   本地开发只能使用第三方 CDN，调试产物会比较困难
    
*   项目线上部署时也只能使用第三方 CDN 的资源，无法做到私有化部署
    

### 解决思路

面对如上的核心问题，我们可以逐个展开思考，各个击破，解决思路分别如下:

*   对于产物语法和 Polyfill 安全问题，在预构建阶段，可通过 babel/swc 编译出特定 target (视项目情况而定) 下的安全产物。
    
*   对于产物线上加载性能问题，我们需要完成一套项目依赖分析工具，对项目的模块依赖图进行分析，将项目使用到的依赖进行合并 (combo) 打包，使最后依赖的产物 chunk 数量保持在性能最佳的范围之内。
    
*   对于模块化加载方案的兼容性问题，我们可以在无需兼容旧版本浏览器的项目使用原生 ESM 特性，否则降级为 SystemJS 加载方案。
    
*   对于产物本地化调试和部署问题，我们一方面需要维护一份第三方 CDN 服务，类似 Skypack、esm.sh，另一方面需要支持将 CDN 产物下载至本地，并通过特定的模块化加载方案来加载这些本地的产物。
    

### 自研方案

根据如上的业界方案问题分析与解决思路，我们自研了一套依赖 Bundleless 的方案，整体架构如下:![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOaY9JSVx5wSngrL868lUQ4cmBjoBcpvRYxWQoRbJ0NEVS4HkseLZNAQ/640?wx_fmt=png)

#### 1. 基于 Import Map

在现有的社区方案中，一般用路径重写的方式来管理 CDN 依赖的路径，比如:

```
import React from 'react'// 改写为import React from '/-/v70/react@v17.0.1'
```

这么做导致一些问题:

*   多实例问题。在产物代码中将路径写死，这样对于 peerDependencies 不太友好，比如某个组件库的 React 引用路径被改写为`/v1/react@16.14`，而项目依赖的 React 版本为 `17.0.2`，那么就会产生 React 多实例问题。
    
*   缓存命中率比较低。如果 A 依赖 B，B 的代码发生变化，那么 A 里面对应的 import 代码也发生变化，A 的缓存也会失效。
    

我们希望用一个集中的空间来管理依赖关系，并避免多实例的问题，而 Import Map 就可以解决这些问题。接入原理如下:

```
<script type="importmap">{  "imports": {    // 保证单实例    "react": "https://tosv.byted.org/obj/eden-internal/ulkl_lm_zlp/ljhwZthlaukjlkulzlp/npm_cdn/dev/react/17.0.2/0636c3a4.js",    "react-dom": "https://tosv.byted.org/obj/eden-internal/ulkl_lm_zlp/ljhwZthlaukjlkulzlp/npm_cdn/dev/lodash/4.17.21/8ba9d138.js"  }}</script><script type="module">import React from 'react';import ReactDOM from 'react-dom'</script>
```

> 浏览器的 import map 兼容性: https://caniuse.com/?search=importmap
> 
> 相关 Polyfill: es-module-shims(地址) 、SystemJS

#### 2. 模块合并

首先基于 Esbuild 将项目进行预打包 (性能考虑)，需要开启 metafile 配置，在 onEnd 钩子或者 build API 的返回值中可以获取构建元信息，即 meta 对象，由 inputs 字段可以解析出模块依赖图。

```
// meta 对象{    "inputs": {    // 当前模块路径    "../node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js": {      // 模块大小      "bytes": 2108,      // 依赖模块数组      "imports": []    },    "../node_modules/.pnpm/react@17.0.2/node_modules/react/cjs/react.development.js": {      "bytes": 72141,      "imports": [        {          "path": "../node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js",          "kind": "require-call"        }      ]    },  }}
```

根据当前的模块依赖图信息，我们可以将项目中用到的依赖进行分组，通过特定的依赖分组算法产出一些依赖组的信息，算法细节比较复杂，篇幅原因就不展开了。

#### 3. 多包 (combo) 模式打包

Combo 模式打包即把多个依赖包打包到一起，主要会产生如下的问题：

*   多包出现导出名称冲突
    
*   Subpath 问题大量出现的问题
    

##### 3.1 不同包的导出名冲突问题

首先需要解决命名导出的问题，整体由两部分构成，在构建时阶段注入一些带有包名前缀的 specifier，运行时根据包名取出这些 specifier，从根本上解决导出名冲突问题。

###### 3.1.1 构建时注水

**导入导出检测**

在构建之前需要探测 NPM 包所有的导出，包含以下的情况：

*   ESM
    

*   Named/Default export，通过 `es-module-lexer` 扫描
    
*   export * from 'xxx'，通过 esbuild 预打包，开启 metafile 模式，在 metafile 中获取所有的 export 名
    

*   CJS
    

*   尝试通过直接 require 拿到所有的导出名
    
*   若 require 失败，降级到 AST 解析，分析所有的导出名
    

**构造入口模块**

在拿到所有导出名的基础之上，构建虚拟模块，交由 bundler 进行打包，格式如下:

```
export { 包名_导出字段名 } from '包名'
```

也就是在 NPM 包每个导出名前面加上`包名_`，完成注水过程，以防止重名。

###### 3.1.2 运行时脱水 (Hydrate)

如上`包名_导出字段名` 的这种导出在业务中是直接使用的，我们需要在模块系统中进行运行时拦截 (脱水过程)，把真正的导出字段名取出。

如以下的导入:

```
// 在以 esm 的方式对依赖进行 external 后，webpack 产物中的引入代码import * as __WEBPACK_EXTERNAL_MODULE_react_router_ from 'react-reouter'
```

我们将会改写成以下的代码:

```
// 1. 换成临时变量import * as __WEBPACK_EXTERNAL_MODULE_react_router_$0 from "react-router";// 2. 对原来的变量重新赋值，通过 __EDEN_COMBO_HYDRATE__ 工具函数将导出名去掉包名前缀// 如 react_router_Router => Routervar __WEBPACK_EXTERNAL_MODULE_react_router_ = __EDEN_COMBO_HYDRATE__(  __WEBPACK_EXTERNAL_MODULE_react_router_$0,  "react_router");
```

##### 3.2 大量 subpath 问题

做实际落地项目的过程中发现第三方包中使用大量的 subpath，如下图的依赖分组结果所示:![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOUWqnrnics1Km08ia4wSnQzzwtN6FCicWDpFvp2ibuJHj1KKRzI69QBJQicQ/640?wx_fmt=png)

这种情况下 import map 的体积会很大，因为每个 subpath 都会对应一个远程地址。解决方案是进行 subpath 合并打包，如`@babel/runtime/helper/esm/assertThisInitialized`、`@babel/runtime/helpers/esm/inheritsLoose`，原始产物中的引入代码如下:

```
import * as __WEBPACK_EXTERNAL_MODULE_babel_runtime_helers_esm_inheritsLoose from '@babel/runtime/helpers/esm/inheritsLoose';import * as __WEBPACK_EXTERNAL_MODULE_babel_runtime_helers_esm_assertThisInitialized from '@babel/runtime/helpers/esm/assertThisInitialized';
```

改写成如下的形式:

```
import * as _babel_runtime_ from '@babel/runtime';var __WEBPACK_EXTERNAL_MODULE_babel_runtime_helers_esm_inheritsLoose = __EDEN_COMBO_HYDRATE__(  _babel_runtime_,  '_babel_runtime_helers_esm_inheritsLoose');var __WEBPACK_EXTERNAL_MODULE_babel_runtime_helers_esm_assertThisInitialized = __EDEN_COMBO_HYDRATE__(  _babel_runtime_,  '_babel_runtime_helers_esm_assertThisInitialized');
```

这样对于 @babel/runtime 只留下一个 importmap 的 key-value 对，有效减少 import map 的体积。

#### 4. 产物 Tree Shaking

在 Esbuild 预打包阶段扫描源文件所用到的 specifier，然后构建对应的虚拟模块交给打包器进行打包:

```
export { cloneDeep } from 'lodash-es'export { Spin } from '@douyinfe/semi-ui'
```

这样可以做到一定程度的 Tree Shaking。

#### 5. Polyfill 安全

根据不同的 runtimeTarget 要求 (Eden 默认自带以下前三种 runtimeTarget，包括 Modern、PCLegacy、MobileLegacy) 和产物模块格式，注入不同的 Polyfill 内容:

*   现代浏览器: 注入 import map 的 polyfill 即可
    
*   PC 端老旧浏览器: PC 端默认 browserlist 下所有第三方包所需的 Polyfill + Systemjs 产物
    
*   移动端老旧浏览器: 移动端默认 browserlist 下所有第三方包所需的 Polyfill + Systemjs 产物
    
*   自定义 runtimeTarget 或模块格式: 指定 browserlist 下所有第三方包所需的 Polyfill，如果是 Systemjs 格式，则加入 Systemjs 的 Polyfill
    

Polyfill 内容在所有第三方包编译完成后进行累计去重，然后统一打包成一个 Chunk，通过 script 标签注入到页面中：![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOymBjibNY130LVzRgFwxT3bZBvLaRAB56mUxgtz9qQVf9FFxxWibVjaeg/640?wx_fmt=png)

#### 6. 产物本地化

依赖产物本地化有两个好处:

*   可以在本地调试依赖的产物代码
    
*   可以将依赖产物代码同业务代码一同部署 (私有化部署)
    

具体的做法如下:

在使用编译服务将依赖包打包完成并上传 CDN 后，构建插件会重新请求 CDN 的资源，并将资源写入到本地磁盘中。![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFwqPibhdEUiabkoBqz6yhTDrOLAxT9tWEDUcBp0dy9dQZvW58cq4jBl66tzZVEVSksoxxDz1WSfvvsA/640?wx_fmt=png)

然后，构建插件通过在本地 Dev Server 加入中间件来对本地临时目录启用静态资源服务。

与此同时，插入到 HTML 中的 import map 的远程 CDN 产物被改写为本地静态资源服务的地址。

因此，最后项目中访问到的第三方包资源即为临时目录中的产物代码。

小结
--

本文从拆包数量、no-bundle 服务和依赖产物的模块化分发三个角度介绍了 Bundle-less 目前的具体概念及应用，不知道你对 Bundle-less 有没有新的理解呢？

- END -