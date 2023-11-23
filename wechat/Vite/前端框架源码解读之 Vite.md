> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_w1b04nsEZk1AfaKDiRiUg)

> 前端工具链十年盘点：[https://mp.weixin.qq.com/s/FBxVpcdVobgJ9rGxRC2zfg](https://mp.weixin.qq.com/s?__biz=Mzg4MjE5OTI4Mw==&mid=2247490237&idx=1&sn=363a5853432edefb10e51f6076469457&scene=21#wechat_redirect)
> 
> Webpack、Rollup 、Esbuild、Vite ?
> 
> *   webpack: 基于 JavaScript 开发的前端打包构建框架，通过依赖收集，模块解析，生成 chunk，最终输出生成的打包产物，是一个 _BundleBased_ 的框架，优点是**大而全**，缺点是**配置繁琐**。
>     
> 
> *   Rollup: Rollup 是专门针对类库进行打包，它的优点是小巧而专注，现在很多我们熟知的库都都使用它进行打包，比如：Vue、React 和 three.js 等。
>     
> *   Esbuild: 一个基于 Go 编写的高性能构建工具，和其他构建工具相比，速度快到  10-100x，其内置了一些 Loader 能解析编译常见的 JS（X）、TS（X）等文件，同时支持通过插件的形式处理其他类型的文件。
>     
> *   Vite: Vite 基于_ESMBased_devServer 在开发环境实现了快速启动、按需编译、即时模块热更新等能力，同时针对同一份代码，在生产环境通过 Rollup 进行打包，生成线上产物。
>     

Vite 简介
=======

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWuiaVbA5Yx5WzR0VPiacITEibnAdlA2PFQNeyCff8Ay3fkX0jicjuhS87mQ/640?wx_fmt=png)

背景驱动  

-------

目前比较成熟的前端开发构建工具，如 webpack 等，基本是通过 “打包” 的方式来进行源码构建，即通过对源码进行依赖收集、构建处理，最终生成可在浏览器运行的 JS 文件，然而随着项目增长，他们存在以下问题

1.  打包构建时间也会随着增长，项目本地启动缓慢
    

2.  更新缓慢，即使使用 HMR 开发，也需要几秒的时间代码变更才能反映到页面上，严重影响开发体验
    

得益于现在前端生态系统的快速发展，Vite 基于下面两个新特性去解决上述存在的问题

1.  浏览器开始支持 原生 ES 模块
    

2.  越来越多 JavaScript 工具使用编译型语言如 Go 等进行编写，加快了构建速度
    

核心功能
----

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWzsy5Vsx5J6g5dibmwo9kWdbS2PpdvBhgUwLcK7vem7diaxzZibvYmKtVw/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWbbtFqNErwLzRJwdRtPd0eiaSzQKRyic9mTDgBCDXJM5MZMhicr0IJ9S2w/640?wx_fmt=png)  

*   **本地开发环境**，利用浏览器支持原生 ESM 文件的特性，不对源代码进行打包操作，浏览器直接动态引入资源，并在 devServer 对请求的资源进行处理，最终返回浏览器可运行的内容
    

*   **依赖预构建**，首次启动的时候，通过 Esbuild 对项目的依赖进行预构建，并缓存在本地，后续浏览器请求的时候可以直接返回
    
*   **更高效的 HMR 模块**，利用浏览器的缓存特性，优化资源的请求，使得无论应用大小如何，HMR 始终能保持快速更新
    
*   在**生产产物构建**时，基于 Rollup 进行打包，并提供了一套  构建优化  的  构建命令，开箱即用。
    

Vite 核心模块原理
===========

本次分享主要介绍最核心的两个功能的实现原理

*   依赖预构建
    

*   浏览器模块加载流程
    

源码初识
----

> 源码版本：v2.8.2

> 之前有简单了解过 Webpack 的源码，看的一头雾水，这一层层的 callback 都是些啥？然而 vite 框架的源码看起来就很简洁明了，非常易懂

```
./src
├── client # 客户端运行时WEB SOCKET以及HMR相关的代码
│   ├── client.ts
│   ├── env.ts
│   ├── overlay.ts
│   └── tsconfig.json
└── node # 本地服务器相关代码
    ├── __tests__
    ├── build.ts # 生产环境rollup build代码
    ├── certificate.ts
    ├── cli.ts # cli，入口
    ├── config.ts
    ├── constants.ts
    ├── http.ts
    ├── importGlob.ts
    ├── index.ts # 导出出口
    ├── logger.ts
    ├── optimizer # 依赖预构建
    ├── packages.ts
    ├── plugin.ts
    ├── plugins # 插件
    ├── preview.ts # build构建后，在预览模式下启动Vite Server，以模拟生产部署
    ├── server # server文件夹，dev环境主要代码
    ├── ssr
    ├── tsconfig.json
    └── utils.ts

7 directories, 18 files
```

我们主要关注`server`目录下的代码，框架通过在本地启动一个 http+connect 的服务器，然后在启动之前做一些优化操作主入口在`src/server/index.ts`的`createServer`函数中，这个函数里做了以下几件事情

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWbbtFqNErwLzRJwdRtPd0eiaSzQKRyic9mTDgBCDXJM5MZMhicr0IJ9S2w/640?wx_fmt=png)

**流程初始化**

1）调用`resolveConfig`函数，解析合并各种配置

2）初始化一个`http+connect`服务器

3）创建插件容器 ，`createPluginContainer`方法，把插件的各个钩子函数串联起来，后续在请求处理的过程中直接执行挂载好的钩子函数

4）生成一个`server`对象，包含配置信息、服务器信息、一些辅助函数等

5）配置一系列内置中间件，各个中间件做的事情，可以参考文章 https://www.modb.pro/db/966326）返回 server 对象

**调用 server 的 listen 方法**

1）运行插件`container`的`buildStart`钩子，进而运行所有插件的`buildStart`钩子

2）进行依赖预构建，运行`runOptimize`函数。

3）开启服务，监听端口

**请求处理流程**

1）主要处理流程在 tansformMiddleware 中间件处理，这部分后面的内容会详细介绍

依赖预构建
-----

进行依赖预构建有两个目的：

1.  **CommonJS 和 UMD 兼容性**: 开发阶段中，Vite 的开发服务器将所有代码视为原生 ES 模块。因此，Vite 必须先将作为 CommonJS 或 UMD 发布的依赖项转换为 ESM。
    

2.  **性能**：Vite 将有许多内部模块的 ESM 依赖关系转换为单个模块，以提高后续页面加载性能。例如将 lodash 中的小模块打包成一个大的文件
    

### 参数配置

首先看一下，vite 配置中关于 optimizeDeps 的入参

```
export interface DepOptimizationOptions {
  /**
   * 入口文件，默认从html文件进行解析收集依赖，如果配置了的话，就从配置文件开始进行解析
   */
  entries?: string | string[]
  /**
   * 需要进行预构建的文件
   */
  include?: string[]
  /**
   * 不需要进行预构建的依赖
   */
  exclude?: string[]
  /**
   * 预构建是通过esbuild进行的，所以可以自定义配置esbuild参数
   */
  esbuildOptions?: Omit<
    EsbuildBuildOptions,
    | 'bundle'
    | 'entryPoints'
    | 'external'
    | 'write'
    | 'watch'
    | 'outdir'
    | 'outfile'
    | 'outbase'
    | 'outExtension'
    | 'metafile'
  >
}
```

### 预构建结果

预构建的结果默认保存在`node_modules/.vite`中，具体预构建的依赖列表在_metadata.json 文件中，其中_metadata.json 的内容为一个 json 结构

```
{
  // 配置的hash值
   hash :  afcda65e ,
  /**
   * 主要用于浏览器获取预构建的 npm 依赖时，添加的查询字符串
   * 在依赖变化时，浏览器能更新缓存
   */
   browserHash :  c369dd06 ,
   optimized : { // 预构建的优化列表
     react : {
      // 构建后的文件地址
       file :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/.vite/react.js ,
      // 原始文件地址
       src :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/react/index.js ,
      // 记录那些在依赖预构建时，使用了commonjs语法的依赖
      // 如果使用了commonjs语法，那么 needsInterop 为 true
       needsInterop : true
    },
     react-dom : {
       file :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/.vite/react-dom.js ,
       src :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/react-dom/index.js ,
       needsInterop : true
    },
     lodash : {
       file :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/.vite/lodash.js ,
       src :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/lodash/lodash.js ,
       needsInterop : true
    },
     react/jsx-dev-runtime : {
       file :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/.vite/react_jsx-dev-runtime.js ,
       src :  /Users/zhachunliu/Desktop/own/demo/vite-demo/vite-react-project/node_modules/react/jsx-dev-runtime.js ,
       needsInterop : true
    }
  }
}
```

### 预构建过程

入口文件：`src/node/optimizer/index.ts`，入口函数：optimizeDeps，构建过程如下

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoW43z78LTX9npRiaWxAgjKlCgtl6F1BHtNnfDN2Td0JV0YR6T0VuKD35g/640?wx_fmt=png)

1.  调用`getDepHash()`函数去计算当前依赖相关的的 hash 值，影响依赖预构建 hash 值的内容有
    

1.  包管理器的 lockfile，例如 package-lock.json,yarn.lock，或者 pnpm-lock.yaml
    
2.  vite.config.js 中的部分相关配置，如 plugins、optimizeDeps 的 include 和 exclude 等
    

2.  读取本地_metadata.json 中的 hash 值，判断和计算出来的是否一致，一致且未设置强制构建的话，则直接结束预构建过程，否则需要进入预构建过程
    
3.  通过`({ deps, missing } = await ``scanImports``(config));`进行依赖扫描，得到需要处理的依赖，deps 是一个对象，是依赖的包名和文件系统中的路径的映射，如下图所示
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoW2UR6879jaUzCRavGA1kE3RXHyq7KRBsc7gOZqEN7XtJ0iaNjhaIj0qg/640?wx_fmt=png)

其中，`scanImports`方法会扫描根目录下的所有 .html 文件或者用户配置对 optimizeDeps.entries 文件，然后找到文件中所有的 script 标签，这样就找到了入口 js 文件，之后调用 esbuild，通过配置的插件，就可以一层层的找到对应的依赖项了

4.  使用`es-module-lexer`的`parse`处理所有的 deps，获得其中`exportsData`内容 ，并得到依赖 id 到`exportsData`的映射，用于之后`esbuild`构建时进行依赖图分析并打包到一个文件里面，parse 解析后的结构如下图所示
    
      
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWCrKM2JicG0PMOQlR8GMLSQ2DQBWibqWCCiaVU2cviaPDA2WYTMtQPU6kpg/640?wx_fmt=png)
    

  

5.  调用`esbuild`进行依赖的预构建，并将构建之后的文件写入缓存目录`node_modules/.vite`，得益于 esbuild 比传统构建工具快 10-100 倍的速度，所以依赖预构建也是非常快的
    
6.  ![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoW5hgqVibkHI1GjKhOF1Kl8z2A688hNnoIhffAAVg6NtUZLngHkjl2icDQ/640?wx_fmt=png)
    

6.  将 metadata 信息写进本地缓存目录下，后续可以直接使用缓存的依赖
    

### 依赖访问过程

在进行了依赖预构建之后，如何访问这些已经构建的依赖呢

1）在加载资源文件的时候，会通过`vite:import-analysis`插件进行依赖解析，碰到已经进行预构建的依赖，直接替换，将`import React from 'react'`替换成`import __vite__cjsImport2_react from /node_modules/.vite/react.js?v=0f16c3f0`这样的形式

2）在浏览器去请求资源的时候，通过`resolvePlugin`插件去解析，获得真正的本地文件，匹配到对应的本地缓存资源

模块加载
----

> 对于浏览器请求，针对一个文件的访问，vite 会如何进行处理呢？

主要由以下两个中间件来统一处理请求的内容，并在中间件处理的流程中调用 vite 插件容器的相关钩子函数

*   `transformMiddleware`：核心中间件处理代码
    

*   `indexHtmlMiddleware`：html 相关请求处理中间件
    

### vite 插件体系

在这里，我们先了解一下 vite 的插件体系，Vite 插件扩展了设计出色的 Rollup 接口，带有一些 Vite 独有的配置项。

因此，你只需要编写一个 Vite 插件，就可以同时为开发环境和生产环境工作。vite 的插件其实就是定义一个对象，该对象包含了一系列的 hook 函数配置

```
export default function myPlugin() {
  const virtualModuleId = '@my-virtual-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // 必须的，将会在 warning 和 error 中显示
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg =  from virtual module `
      }
    }
  }
}
```

#### Rollup 插件兼容性

相当数量的 Rollup 插件将直接作为 Vite 插件工作，但并不是所有的，因为有些插件钩子在非构建式的开发服务器上下文中没有意义。

一般来说，只要 Rollup 插件符合以下标准，它就应该像 Vite 插件一样工作：

*   没有使用`moduleParsed`钩子。
    

*   它在打包钩子和输出钩子之间没有很强的耦合。
    

**和 rollup 保持一致的通用钩子**以下钩子在服务器启动时被调用：

*   options
    

*   buildStart
    

以下钩子会在每个传入模块请求时被调用：

*   resolveId
    

*   load
    
*   transform
    

以下钩子在服务器关闭时被调用：

*   buildEnd
    

*   closeBundle
    

#### **Vite 独有钩子**

Vite 插件也可以提供钩子来服务于特定的 Vite 目标。这些钩子会被 Rollup 忽略。

*   config
    

*   configResolved
    
*   transformIndexHtml
    
*   handleHotUpdate
    

#### 具体插件执行过程

1）在 dev 环境模拟了一套和 rollup 保持一致的插件运行环境，确保在开发环境和生产环节的核心环节执行同样的流程

2）vite 通过 createPluginContainer 创建了一个插件容器，将每个插件中对应的 hook 收集起来

3）最终在各个生命周期阶段，执行对应的已经收集好的钩子

### 模块请求加载过程

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWibRYVNCSdvFVoRJqw316AgpRTPHOUvOl1457JWLezQ5HN6VD1lkpysw/640?wx_fmt=png)

  

#### GET /

当访问页面的时候，实际是有一个 GET / => /index.html 的重定向进入 indexHtmlMiddleware 这个过程，主要做了一件事情，注入 dev 环境需要的一些依赖，@vite/client 主要用来和服务器进行 ws 通信并处理一些 hmr 相关的工作，`@react/refresh`这段代码，是 vite-plugin-react 插件注入的代码，用来处理 dev 环境的一些能力

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWIib752oGeia27Uic5Bhfva2Oia6Su0tWGAZicdnQgDjkUSZMu8rPTMda2nw/640?wx_fmt=png)

#### GET /@vite/client

> 前面讲到，@vite/client 里面的代码主要用于与服务器进行 ws 通信来进行 hmr 热更新、以及重载页面等操作。

这个请求会直接进入 transformMiddleware 中间件中，进入中间件的处理过程：中间件会调用`transformRequest(url, server, options = {})`函数

1.  @vite/client 是如何映射到对应的内容呢，在调用`pluginContainer.resolveId`的过程中会遇到 aliasPlugin 插件的钩子，执行名称替换，最终替换成`vite/dist/client/client.mjs`
    

2.  继续将改写过的路径传给下一个插件，最终进入`resolvePlugin`插件的`tryNodeResolve`函数，最终解析获得该文件的 id 为`/Users/zhachunliu/.nvm/versions/node/v14.17.0/lib/node_modules/vite/dist/client/client.mjs`
    
3.  最终通过`pluginContainer.load`获取加载本地文件，然后通过`pluginContainer.transform`进行代码转换，将转换后的代码通过`send`方法发送给浏览器
    

#### GET /src/main.tsx

针对普通的 tsx 文件的请求，流程基本上和上面介绍的`GET /@vite/client`一致，不同点在于使用的插件钩子内容不一样，因为需要对 tsx 文件进行处理成 js

1.  通过 resolveId 钩子函数，将 / src/main.tsx 映射到本地文件系统
    

2.  调用 load 钩子函数，加载本地文件到内存中
    
3.  通过 vite:react-babel 插件，将 jsx 语法进行转换，转换成 js 代码
    
4.  通过 vite:esbuild 插件，进行代码格式化
    
5.  通过 vite:import-analysis 插件，将代码中所有的 import 内容，转换成对应的本地文件，方便后续直接请求
    
6.  返回结果
    

其他的所有请求，都是经过类似的插件处理流程，最终返回给浏览器一段可执行的 JS 代码，就不一一介绍了。

vite 调试工具
=========

vite-plugin-inspect（插件调试工具，强推）
------------------------------

在学习、调试或创作插件时，建议在你的项目中引入 vite-plugin-inspect。它可以帮助你检查 Vite 插件的中间状态。安装后，你可以访问`localhost:3000/__inspect/`来检查你项目的模块和栈信息。请查阅 vite-plugin-inspect 文档中的安装说明。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoW60S6WvCIHdaEHZBibsAPsNRADF6fZLEiavOodTdzGpib1Y6RO7HEXJKiaw/640?wx_fmt=png)

Vite debug 模式
-------------

通过`vite --force --debug`命令，可以明确的了解到，启动过程和请求过程，经历了什么插件，具体的执行流程等，方便调试

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicxX2OhszGVp939viaGkVsoWkpk1lmDOpMFyv2Z0XyCiaQ8qvoqK69UAR83qjCRK9rt9PJ6sWvH9Tbg/640?wx_fmt=png)

参考资料
====

*   前端工具链十年盘点：[https://mp.weixin.qq.com/s/FBxVpcdVobgJ9rGxRC2zfg](https://mp.weixin.qq.com/s?__biz=Mzg4MjE5OTI4Mw==&mid=2247490237&idx=1&sn=363a5853432edefb10e51f6076469457&scene=21#wechat_redirect)
    

*   如何调试 vite 源码：https://maximomussini.com/posts/debugging-javascript-libraries
    
*   源码理解：https://jishuin.proginn.com/p/763bfbd5f00e