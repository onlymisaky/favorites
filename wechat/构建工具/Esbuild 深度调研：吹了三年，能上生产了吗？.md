> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2lyEHzpt5jPBPYoNqxKYXQ?poc_token=HBCvpGWjgKVRNXJ9yK5raLdy2nyCqDOEtytvtsAQ)

_**点击**__**关注**__**公众号，” 技术干货**__**” 及时达！**_
============================================

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCVBW0moklcIcDHYsdOsFkZDKvGkg1bsRHL5Mrhp6WsQQlHMdBaicJTLQ/640?wx_fmt=jpeg&from=appmsg)
----------------------------------------------------------------------------------------------------------------------------------------------------------

  

一、前言
----

> ❝
> 
> 本文是 从零到亿系统性的建立前端构建知识体系✨中的第十篇。  
> https://juejin.cn/post/7145855619096903717
> 
> ❞

随着前端项目规模的不断扩大，构建时间和性能成为开发者们日益关注的焦点。

在这个背景下，esbuild 以惊人的速度和卓越的性能迅速吸引了众多开发者的目光。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCj8wfPtWJvz416EiaM7mQRCkoTibb39523I1cibSLNGhA0ibicibDic15T44aA/640?wx_fmt=png&from=appmsg)  

近两年来，esbuild 的 npm 下载量也呈现出迅猛增长的趋势，一副要和老大哥 Webpack 争一争这头把交椅的味道。

* * *

在一些开发者眼中，esbuild 不仅是一个构建工具，更像是一个革命先驱。它对现代前端构建范式发起了一场革命，让我们突然意识到，前端工具的选择并非局限于 `Node.js`，还包括像 `Golang`、`Rust` 这样的新兴技术栈。

本文将从实际需求出发，深入调研 esbuild 的应用场景。和大家探讨一下：esbuild 到底是名副其实还是虚有其表？

二、调研目录
------

为了满足生产环境的构建需求，调研内容如下：

1.  **「基本特性：」**
    

*   是否支持 `.js`、`.jsx`、`.ts`、`.tsx`（要求能在 `.js` 中写 `jsx` 语法）
    
*   是否支持 `.css`、`.module.css`、`.less`、`.module.less`
    
*   是否支持不同文件格式之间的互相引用（比如 `.css` 文件中引入 `.less`）
    
*   是否支持字体图标
    
*   是否支持常规的图片资源（在 `.js` / `.css` / `.less` / `.html` 中的引用）
    
*   其他资源文件处理：`.json`、`.txt`、`.data` 等
    
*   配置路径别名缩短引用路径
    
*   提供 `html` 模版，将打包后的文件插入到 `html` 模版中
    
*   在 `NodeJs` 环境和 `Web` 环境中获取环境变量（判断是开发环境还是生产环境）
    
*   生成 `source-map` 文件，最起码要有开发环境模式和生产环境模式
    

3.  **「性能优化：」**
    

*   资源文件解析转换：比如当图片资源小于 `8kb` 时，转换为 `base64` 格式
    
*   代码压缩（`js` 文件压缩 + `css` 文件压缩 + `html` 文件压缩）
    
*   输出文件名称支持配置 `contentHash`
    
*   部分第三方包支持不参与构建，使用 cdn 链接（排除 react、react-dom ）
    
*   支持 `tree shaking`
    
*   支持代码分割，将第三方包单独抽离
    

5.  **「向下兼容：」**
    

*   `css` 加厂商后缀
    
*   `css API` 兼容老浏览器
    
*   `javascript` 语法兼容老浏览器
    
*   `javascript API` 兼容老浏览器
    

7.  **「项目管理：」**
    

*   将构建后的资源按目录进行分类
    
*   构建前清空 `dist` 文件夹
    
*   构建前进行 `typescript` 类型检测（可选）
    

以上这些功能是构建工具应用在生产环境和大型项目时的必备条件。我们将在接下来的调研中，深入探讨这些关键点。

已将相关代码存放在开源的 GitHub 仓库中：https://github.com/noBaldAaa/esbuild-demo

三、调研开始
------

为了防止我行你不行的场景发生，在这里统一约定环境版本：

```
"node": "20.9.0","react": "^18.2.0","react-dom": "^18.2.0","esbuild": "^0.19.8",
```

> ❝
> 
> 初始化项目：
> 
> ❞

```
yarn init  //初始化一个项目yarn add esbuild react react-dom typescript //安装项目依赖，本文用 react 进行演示yarn add @types/react @types/react-dom // 添加 react 类型npx tsc --init // 生成 tsconfig.json 初始配置文件
```

安装完依赖后，根据以下目录结构来添加对应的目录和文件：

```
├── node_modules
├── package-lock.json
├── package.json
├── tsconfig.json
├── esbuild.build.js #配置文件
├── main.tsx #项目入口文件
├── main.css #项目入口css文件
└── src #源码目录
     |── pages #页面文件
     |── font  #字体文件
     |── imgs  #资源文件
     └── mock  #模拟数据
```

**「esbuild.build.js:」**

```
const esbuild = require("esbuild");const entryPoints = ["main.tsx"];const options = {  // 入口文件  entryPoints,  // 启动打包  bundle: true,  // 输出目录文件夹  outdir: "dist",};esbuild.build(options).catch((e) => console.log(e));
```

**「main.tsx:」**

```
import { createRoot } from "react-dom/client";import React, { FC } from "react";import "./main.css";const App: FC = () => {  return (    <div>      <p>main.js入口文件：</p>    </div>  );};const root = createRoot(document.getElementById("root") as HTMLElement);root.render(<App />);
```

**「main.css:」**

```
color: #123456;
}
```

**「package.json 中进行配置：」**

```
"scripts": {    "build": "node ./esbuild.build.js"  },
```

### 3.1、是否支持 .js、.jsx、.ts、.tsx

先尝试对 **「main.tsx」** 进行打包，运行：

```
yarn build
```

打包成功，并自动生成 **「dist」** 文件夹，在 **「dist」** 目录下手动新建 **「index.html」** 文件，并导入打包后的文件：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCzW3vDlHK7O7bVf7GWHwDNHLBlia3mlgErBUpF9gL5hG8wjdDNeOCO8Q/640?wx_fmt=png&from=appmsg)  

导入后在浏览器中打开 **「index.html」** 文件，按预期成功显示。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCdUjVmqqn0ldXaJVAMwADv32CxCmOclzDkuCbR3iccQ1La2d1ic71Quag/640?wx_fmt=png&from=appmsg)  

现在我们并没有像 Webpack 那样配置 loader，而是 esbuild 自动就识别 `.tsx` 文件并进行解析，很强👍。

经测试，**「esbuild」** 能够自动识别 `.js`、`.jsx`、`.ts`、`.tsx` 等类型文件。

如果我们是在 `.js` 后缀文件中写 `tsx` 内容，它能够识别吗？

将入口文件 **「main.tsx」** 文件名后缀改为 **「main.js」** 后再重新进行打包：不出意外的报错了：

`The esbuild loader for this file is currently set to "js" but it must be set to "jsx" to be able to parse JSX syntax`

通过查阅文档得知，需要配置相应的 esbuild loader 进行解析。

**「esbuild.build.js:」**

```
const options = {  // 省略其他  // 配置loader进行解析  loader: {    ".js": "tsx", // 默认是 .js:js    ".ts": "tsx", // 默认是 .ts:ts    ".tsx": "tsx", // 默认就支持    ".jsx": "jsx", // 默认就支持  },};esbuild.build(options).catch((e) => console.log(e));
```

这里的配置表示对 `.js` 文件后缀的文件用 tsx loader 进行解析。

配置完成后重新打包，解析成功。

> ❝
> 
> 小结：**「esbuild」** 通过内置了一部分 `loader`, 支持对 `.js`、`.jsx`、`.ts`、`.tsx` 等文件进行解析。
> 
> ❞

### 3.2、是否支持 .css、.module.css、.less、.module.less

对 `.css` 文件我们已经简单验证过了（**「main.css」**），在 **「src」** 目录中创建如下文件：

```
└── src #源码目录
     └── pages #页面
        |── PageA.tsx 
        |── pageA.module.css
        |── PageB.tsx
        |── pageB.less
        |── PageC.tsx
        └── pageC.module.less
```

**「PageA.tsx：」**

```
import React from "react";

import styles from "./pageA.module.css";

const PageA = () => {
  return (
    <div>
      <h3 className={styles["pageA-test-module-background"]}>
        我是PageA页面 测试.module.css文件
      </h3>
    </div>
  );
};

export default PageA;
```

**「pageA.module.css：」**

```
.pageA-test-module-background {  background-color: #ddd;}
```

**「PageB.tsx：」**

```
import React, { useEffect } from "react";

import "./pageB.less";

const PageB = () => {
  return (
    <div>
      <h3 className={"pageB-test-less-background"}>
        我是PageB页面 测试.less文件
      </h3>
    </div>
  );
};

export default PageB;
```

**「pageB.less：」**

```
.pageB-test-less-background {
  background-color: #999;
}

div {
  h3 {
    color: orange;
  }
}
```

**「PageC.tsx：」**

```
import React from "react";

import styles from "./pageC.module.less";

const PageC = () => {
  return (
    <div>
      <h3 className={styles["pageC-test-module-less-background"]}>
        我是PageC页面 测试.module.less文件
      </h3>
    </div>
  );
};

export default PageC;
```

**「pageC.module.less：」**

```
.pageC-test-module-less-background {
  background-color: #666;
}
```

添加完成后在 **「main.tsx」** 中引入：

```
// 省略其他import PageA from "./src/PageA";import PageB from "./src/PageB";import PageC from "./src/PageC";import "./main.css";const App: FC = () => {  return (    <div>      <p>main.js入口文件：</p>      <PageA />      <div style={{ height: "1px", background: "#666" }}></div>      <PageB />      <div style={{ height: "1px", background: "#666" }}></div>      <PageC />      <div style={{ height: "1px", background: "#666" }}></div>    </div>  );};// 省略其他
```

此时再运行 **「yarn build」** 重新打包，运行报错：

`No loader is configured for ".less" files: src/pageB.less`

通过查阅文档得知 **「esbuild」** 不支持解析 `.less` 文件，且没有对应的 `loader`，需要我们手动配置插件。

安装支持解析 **「less」** 的插件：

```
yarn add esbuild-plugin-less 
```

安装完成后在 **「esbuild.config.js」** 中进行配置：

```
//省略其他const { lessLoader: lessLoaderPlugin } = require("esbuild-plugin-less");const options = {  //省略其他  plugins: [    lessLoaderPlugin({      // 该插件还支持全局的主题配置      globalVars: {        primaryColor: "blue",      },    }),  ],};esbuild.build(options).catch((e) => console.log(e));
```

配置完成后重新打包，打包成功。在浏览器中打开 **「dist/index.html」** ：均符合预期。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCSxveVxs1MD9tLqoeLiatiaeqBa2nC6icaUFGcBSputW7KRicDWAOonwG2Q/640?wx_fmt=png&from=appmsg)  

经测试，文件间相互引用也均无问题。例如：

*   `.css` 文件引入 `.module.css` 文件
    
*   `.css` 文件引入 `.less` 文件
    
*   `.css` 文件引入 `.module.less` 文件
    
*   ...
    

> ❝
> 
> 小结：在**「esbuild」**内部，默认会对 `.css` 文件用 css loader 进行解析，对 `.module.css` 用 local loader 进行解析。
> 
> 当需要支持  **「less」**、**「sass」** 时，需要配置相应的插件。
> 
> ❞

### 3.3、是否支持字体图标

在 iconfont 中选择一些图标后下载到 **「src/font」** 目录中：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCNvkGyjSicBBKXhVWghSH7M4EFmvoHRwDrNW81AiaqWgQWIicyicpQzozwg/640?wx_fmt=png&from=appmsg)  

在 **「main.css」** 中进行全局导入：

```
+ @import "./src/font/iconfont.css";:root {  color: #123456;}
```

在 **「main.tsx」** 中使用图标：

```
// 省略其他
import "./main.css";

const App: FC = () => {
  return (
    <div>
      <p>main.js入口文件：</p>
      <PageA />
      <div style={{ height: "1px", background: "#666" }}></div>
      <PageB />
      <div style={{ height: "1px", background: "#666" }}></div>
      <PageC />
      <div style={{ height: "1px", background: "#666" }}></div>
+     <div style={{ margin: "10px" }}>
+       测试图标：<span class></span>
+     </div>
    </div>
  );
};
```

此时进行打包，控制台运行报错：

`No loader is configured for ".woff2 .ttf .woff .svg .eot"，`

经过查阅文档得知，我们要想解析这些文件，有两个 `loader` 可供选择：

*   file loader：将文件复制到输出目录下，并返回对应的文件名称（类型于 **「Webpack」** 的 file-loader）。
    
*   dataurl loader：将文件内容以 `Base64 编码`的形式直接包含在 URL 中。这样可以减少对服务器的请求，提高页面加载速度。
    

这里我们使用 dataurl loader 进行配置。在 **「esbuild.config.js」** 中：

```
// 省略其他const options = {  loader: {    ...,+   ".ttf": "dataurl", // 为了支持字体图标+   ".eot": "dataurl", // 为了支持字体图标+   ".woff": "dataurl", // 为了支持字体图标+   ".woff2": "dataurl", // 为了支持字体图标+   ".svg": "dataurl", // 为了支持字体图标  },};
```

此时再重新打包，可以看到图标文件通过 `Base64 编码` 的形式插入到了输出文件中：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCaKtLZvd3W2Zc6edsMeVUcTKPAh7Xnkyj7T2lqn4EQpc3FXvTw6362w/640?wx_fmt=png&from=appmsg)  

打开浏览器，`iconfont` 图标显示正常：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCUHS6r6ggTAQtSKlXyicG6czoJzqwDb8bFWWb6m8ibVPt2rsblAPoPDkA/640?wx_fmt=png&from=appmsg)  

> ❝
> 
> 小结：在 **「esbuild」** 中，file loader 和 dataurl loader 都是用于处理文件的 `loader` ，但它们有各自的优缺点，适用于不同的场景。
> 
> file loader 适用于大型文件，可以有效减少 js 文件的大小，同时更有利于缓存。但由于每个文件都需要额外的网络请求，可能会影响页面的加载性能，特别是对于大量小文件的情况。
> 
> dataurl loader 通过将文件内容嵌入到 js 中，减少了对服务器的额外请求，特别适用于小型文件。但可能会显著增加文件体积，且不利于缓存，只要 bundle 有变化，都需要重新下载。
> 
> 如何进行选择？
> 
> 一般情况下，我们会设置当资源文件小于 8KB 时使用 dataurl loader，否则使用 file loader。下文会讲解如何进行设置。
> 
> ❞

### 3.4、是否支持常规的图片资源

在 **「src/imgs」** 目录放两张图片：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCiavEXu6wmkoM4yGzNkTGSldWqjPiaIJw6lB2esF06DTvrFiadQ4zzAVRw/640?wx_fmt=png&from=appmsg)  

在 **「PageB.tsx」** 中引入图片：

```
+ import ESBUILD_LOGO from "../imgs/esbuild.svg";

const PageB = () => {
+  useEffect(() => {
+    const dom: any = document.getElementById("img");
+    dom.src = ESBUILD_LOGO;
+  }, []);

  return (
    <div>
      <h3 className={"pageB-test-less-background"}>
        我是PageB页面 测试.less文件
      </h3>
+     <div>测试在tsx中通过import的方式导入图片：</div>
+     <img
+       src={ESBUILD_LOGO}
+       style={{ width: "100px", height: "100px", backgroundSize: "contain" }}
+     />
+     <div>测试在tsx中通过dom的方式插入图片：</div>
+     <img
+       id="img"
+       style={{ width: "100px", height: "100px", backgroundSize: "contain" }}
+     ></img>
    </div>
  );
};
```

在 **「pageA.module.css」** 中引入图片：

```
.pageA-background-image {  width: 100px;  height: 100px;  background-size: contain;  background-image: url("../imgs/esbuild.svg");}
```

配置完成进行打包：打包成功，并按照预期正常显示。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCLib7a6ibGbs8aP4wd7Js8eCzXRGAwAcR2GLSjYevPlgkOcbNAN8Gy8Kw/640?wx_fmt=png&from=appmsg)  

为了测试 `.html` 文件中引入图片的问题，我们需要先有一个 `HTML 模板`。

再者，我们现在是手动在 **「dist」** 目录中创建 `index.html` 文件的，依赖的输出文件也是我们手动添加的，这样肯定不够优雅。

为了解决此问题，社区找了一个插件：@craftamap/esbuild-plugin-html。它可以帮我们提供 **「HTML 模版」**，并能将打包后的文件自动插入到 **「HTML 模版」** 中，类型于 **「Webpack」** 的 webpack-html-template。

安装插件：

```
yarn add @craftamap/esbuild-plugin-html
```

在 **「esbuild.config.js」** 中进行配置，并附上了一些个人理解：

```
// 省略其他+ const { htmlPlugin } = require("@craftamap/esbuild-plugin-html");const entryPoints = ["main.tsx"];const options = {  // 省略其他  // 此选项告诉 esbuild 以 JSON 格式生成一些有关构建的元数据。以下示例将元数据放入名为 的文件中meta.json  // 想要用 htmlPlugin 插件，必须开启metafile+  metafile: true,+  plugins: [+    htmlPlugin({+      files: [+        {+           // entryPoints (string[]): 要注入到创建的HTML文件中的入口点（Entry Points）数组。例如，['src/index.jsx']。可以指定多个入口点。+           entryPoints,+           // 输出的HTML文件的文件名，例如 index.html。路径是相对于输出目录的。+           filename: "index.html",+           // title (string): 注入到<head>中的<title>标签的内容，如果未指定，则不设置。+           // 会覆盖模版中默认的title+           title: "学习",+           // htmlTemplate (string): 自定义HTML文档模板字符串。如果省略模板，则将使用默认模板。可以是HTML字符串，也可以是指向HTML文件的相对路径。+           htmlTemplate: "./public/index.html",+           // define (Record<string, string>): 定义可在 html 模板上下文中访问的自定义值。+          define: {+             name: "不要秃头啊",+           },+           // scriptLoading ('blocking' | 'defer' | 'module'): 决定是否将脚本标签插入为阻塞脚本标签，带有 defer=""（默认），或带有 type="module"。+           scriptLoading: "",+           // findRelatedCssFiles (boolean): 查找相关的输出 *.css 文件并将它们注入到HTML中。默认为 true。+           findRelatedCssFiles: true,+           // 默认为false，开启后相当于将所有的css,js文件全部放在html文件中，这样相当于只需要用到html文件+           // 属性用于控制是否将脚本和样式资源嵌入到 HTML 文件中，而不是作为外部文件引用。这可以有助于减少页面的请求次数，从而提高页面加载性能，特别是对于较小的应用+           inline: false,+           // extraScripts ((string | { src: string; attrs?: { [key: string]: string } } )[]): 额外的脚本，可以是字符串数组或包含 src 和可选 attrs 的对象。用于在HTML中插入其他脚本。+          extraScripts: [],+           // hash (boolean | string): 为所有包含的脚本和CSS文件附加哈希以进行缓存破坏。哈希基于给定的字符串。如果给定一个布尔值，哈希基于当前时间。+           // 为引入的 js 和 css 添加hash，但是感觉不太好这里，因为使用的是时间戳+           hash: false,+         },+       ],    }),  ],};
```

这插件有一个比较坑的地方是：它依赖于 **「esbuild」** 内部生成的 **「meta.json」** 文件，所以必须将  `metafile` 属性设置为 `true` 。

配置完成后，在根目录下新建 **「public」** 文件夹：

**「public/index.html：」**

```
<!DOCTYPE html><html lang="en">  <head>    <meta charset="UTF-8" />    <meta  />    <title>esbuild demo</title>  </head>  <body>    <div>这里是index.html的内容：</div>    I am <%- define.name %>    <img src="./juejin.svg" />    <div id="root"></div>  </body></html>
```

并在 **「public」** 目录下放一张掘金的 logo 。

此时进行打包：打包成功。但 **「index.html」** 中引入的图片却不能正常显示。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCxEp0G6aEiaDWUVibocdTgF9fk0VtuIDOiakuuG9WF3knCxc4nnfbwt7zQ/640?wx_fmt=png&from=appmsg)  

这里是因为 **「index.html」** 文件并不在打包的依赖项中，而且 **「esbuild」** 也还没有处理 `html` 文件相关的 `loader`。

没办法，我们需要将 **「public」** 目录下用到的文件复制到输出目录中。

这里尝试找了几个插件，都挺坑的。决定还是自己手撸一个（该篇文章不具体讲解如何写插件，以及插件的原理，下一篇文章重点讲）。

**「esbuild.config.js：」**

```
// 省略其他const path = require("path");const fs = require("fs");const options = {  // 省略其他  plugins: [    // 省略其他    {      name: "copy-plugin",      setup(build) {        // 辅助函数，用于同步复制文件        function copyFileSync(source, target) {          // 获取目标文件夹路径          const targetDir = path.dirname(target);          // 如果目标文件夹不存在，创建它（包括多层目录）          if (!fs.existsSync(targetDir)) {            fs.mkdirSync(targetDir, { recursive: true });          }          // 获取目标文件路径，使用源文件的基本文件名          const targetFile = path.join(target, path.basename(source));          // 同步复制文件          fs.copyFileSync(source, targetFile);        }        // 主要复制函数，source 是数组，遍历处理每个文件        function copy({ source, target }) {          source.forEach((sourceItem) => {            // 如果文件存在，进行复制            if (fs.existsSync(sourceItem)) {              copyFileSync(sourceItem, target);            }          });        }        // 配置复制的选项        const copyOptions = {          source: ["./public/juejin.svg"], // 源文件或文件夹路径，可以是数组          target: "./dist", // 目标文件夹路径        };        // 在 esbuild 完成构建后触发的回调，执行复制操作        build.onEnd(() => copy(copyOptions));      },    },  ],};
```

配置完成后重新打包，**「public」** 目录下的图片已经复制到输出目录：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCfGGUKjLibv74TK3ad0via6Erle7mJKTrQYh8Se4weCVSAU2DqOmHcrrA/640?wx_fmt=png&from=appmsg)  

打开浏览器，显示正常：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCNTiaYibEklHnQSCz6TibXOpZIH3qheFv5el1ibUdaxWX2x1oaGRIho7cfw/640?wx_fmt=png&from=appmsg)image.png

> ❝
> 
> 小结：在 `css`、`js`、`html` 中引入图片成功。但 **「esbuild」** 仅支持在 `css`、`js` 中引用图片资源。如果想要在 `.html` 中正常显示，需要 @craftamap/esbuild-plugin-html 插件和手写相应的复制文件插件来完成。
> 
> ❞

### 3.5、其他资源文件处理

在 **「src/mock」** 文件夹中添加：

**「test1.json：」**

```
{  "name": "不要秃头啊"}
```

**「text2.txt：」**

```
"hello ，我是 data 格式"
```

在 **「main.tsx」** 中引入并打印结果：

```
// 省略其他import test1 from "./src/mock/test1.json";import test2 from "./src/mock/text2.txt";const App: FC = () => {  console.log(test1, "test1.json");  console.log(test2, "test2.txt");    // 省略其他};
```

配置完成后重新打包，控制台运行报错：

`Could not resolve "./src/mock/test2.txt"`

经查阅文档，对 `.txt` 文件我们需要用到 text loader，在 **「esbuild.config.js」** 中进行配置:

```
// 省略其他代码const options = {  loader: {    ".js": "tsx", // 默认是 .js:js    ".ts": "tsx", // 默认是 .ts:ts    ".tsx": "tsx", // 默认就支持    ".jsx": "jsx", // 默认就支持    // file 这个 loader 会将文件复制到输出目录，并将文件名返回到源代码中    // 这里用 dataurl loader，相当于将字体图标都转换为 Base 64 格式插入到了 App.css 文件中    // 这里用file loader 的话，就相当于拷贝    ".ttf": "dataurl", // 为了支持字体图标    ".eot": "dataurl", // 为了支持字体图标    ".woff": "dataurl", // 为了支持字体图标    ".woff2": "dataurl", // 为了支持字体图标    ".svg": "dataurl", // 为了支持字体图标+   ".txt": "text",    ".json": "json", // 默认就是这个  },};
```

配置完成后重新打包：处理成功。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCuoAj81ScvRt88cPbuK9XIMLNP13BQdJzFp3NqamSAXXO5EfP8BBr8w/640?wx_fmt=png&from=appmsg)  

### 3.6、loader 总结

上面主要测试了 **「esbuild」** 对于不同类型资源的处理情况，这里根据 **「esbuild」** 所提供的 `loader` 做个总结：

*   js：处理 .js 文件，不多说。
    
*   jsx：处理 .jsx 文件，不多说。
    
*   ts：处理 .ts 文件，不多说。
    
*   tsx：处理 .tsx 文件，不多说。
    
*   css：处理 .css 文件，不多说。
    
*   local-css：处理 .module.css 文件，支持 css module。
    
*   global-css：处理全局 css 文件，代表不启用 css module 模式（如果对 .module.css 文件配置该 loader，代表用正常 css loader 进行处理）。
    
*   json：处理 .json 文件，不多说。
    
*   file：可处理任何格式文件。该 loadder 会将文件复制到输出目录，并将文件名作为字符串嵌入到包中，和 webpack 的 file-loader 一样。
    
*   text：处理文本文件。
    
*   base64：将文件转换为 Base64 编码。
    
*   dataurl：将文件转换为 Data URL 格式。类似于 Base64 Loader，将文件直接嵌入到代码中，但以 Data URL 形式。
    
*   binary：用于处理不需要转换的二进制文件。
    
*   copy：复制文件到输出目录而不进行处理。
    
*   empty：生成一个空的模块。更多时候用于占位，或在某些情况下需要一个空模块时使用。
    

### 3.7、优化图片资源

在 **「3.3」** 节中我们提到过：一般情况下，我们会对请求资源进行优化。当资源文件小于 8KB 时使用 dataurl loader，否则使用 file loader 更佳。

在 **「Webpack」** 中我们一般是这样配置的：

```
{       test: /\.(png|jpe?g|gif|svg)$/,       type: "asset",       parser: {         dataUrlCondition: {           maxSize: 8 * 1024, //如果文件不超过8kb才转换为 base64 URL         },       },     },
```

那么在 **「esbuild」** 中我们应该如何去配置呢？

经查阅文档，发现在 **「esbuild」** 内部并不支持我们动态的去切换 `loader`，需要通过第三方插件来完成。安装插件：

```
yarn add esbuild-plugin-inline-image
```

在 **「esbuild.config.js」** 中进行配置：

```
// 省略其他+ const inlineImagePlugin = require("esbuild-plugin-inline-image");const options={  // 省略其他  plugins: [+   inlineImagePlugin({+     limit: 8 * 1024, // 默认为10000，超过这个数用 file loader，否则用 dataurl loader+     // 这里如果 loader 中配置了 png 格式用 file loader，但是插件这里又配了，以这里的为准+     extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp", "avif"], // 要处理的文件格式，默认为这些    }),  ],}
```

### 3.8、配置路径别名缩短引用路径

随着项目越来越大，文件路径越来越深，有时候我们希望这样去导入文件，而不用一层一层的往外查找：

`import xx from "@src/xxx"`

在其他构建工具中通常是通过配置 `alias` 属性来设置的。**「esbuild」** 也不例外，在 **「esbuild.config.js」** 中进行配置：

```
const options={  // 配置别名，不仅可以配置路径，还可以配置包名  alias: {    // 这里还运行替换包名，当识别hello 这个包时自己用成 react 包，这个功能还是很有用的，比如替换为华为最近发布的包    // hello: "react",    "@": path.resolve(__dirname, "./src"),    "@imgs": path.resolve(__dirname, "./src/imgs"),    "@pages": path.resolve(__dirname, "./src/pages"),  },}
```

这个功能还是很强大的，不仅可以配置路径，还能替换包名。比如我们配置 `hello: "react"`，这就相当于告诉 **「esbuild」** 当遇到 `hello` 这个包名时，去加载 `react` 这个包。

最近华为不是新出了前端开发框架 openInula 嘛，宣传说可以和 React 无缝替换，将来说不定能用上这个功能！

在 **「main.tsx」** 中进行测试：

```
// 将原先的 import PageA from "./src/pages/PageA" 进行替换

import PageA from "@pages/PageA";
import PageB from "@pages/PageB";
import PageC from "@pages/PageC";

import test1 from "@/mock/test1.json";
import test2 from "@/mock/text2.txt";
```

替换完成后重新打包，显示正常！

> ❝
> 
> 小结：这里经过本人反复测试，发现 `alias` 这个属性坑还是很多的。
> 
> github 上也有不少跟 alias 属性相关的 bug，这里大家如果在使用中遇到了问题，可以直接将 `alias` 属性替换成这个插件：esbuild-plugin-path-alias（社区有不少解决 `alias` 问题的插件，经测试这个最靠谱）。
> 
> ❞

安装：

```
yarn add esbuild-plugin-path-alias
```

使用：

```
// 省略其他+ const aliasPlugin = require("esbuild-plugin-path-alias");const options={    // 省略其他    plugins:[+       aliasPlugin({+         "@": path.resolve(__dirname, "."),+         "@utils": path.resolve(__dirname, "./src/utils"),+       }),    ]}
```

### 3.9、配置 source-map

**「esbuild」** 的 source-map 配置 虽然不像 **「Webpack」** 那么多种类，但也还是提供了四种模式供我们选择：

*   linked：生成单独的 .js.map 文件，并在 .js 文件中包含 `//# sourceMappingURL = 地址`。**「它的优点是可以 source-map 文件独立出来，减小生成的 .js 文件大小。」**
    
*   external：生成单独的 .js.map 文件，但 .js 文件不包含 `//# sourceMappingURL = 地址`。**「它的优点是 source-map 文件独立存储，但 .js 文件不包含显式的 source-map 地址。」**
    
*   inline：将 source-map 文件以 Base64 形式追加到 .js 文件的末尾，不生成额外的 .js.map 文件。**「它最大的优点是方便部署，一次加载即可获取源映射信息。但由于源映射通常较大，会显著增加 .js 文件的大小。」**
    
*   both：同时生成 inline 和 external，即在 .js 文件末尾追加 inline，并生成单独的 .js.map 文件。**「该模式结合了 inline 和 external 的优势，可在 .js 文件中快速获取源映射信息，并且也有独立的 .js.map 文件备份。很难说这是优点还是缺点，暂时没想到应用场景。」**
    

这里比较好的最佳实践是：

*   生产环境使用 external 模式 或 不生成 source-map 文件。
    
*   开发环境使用 inline 模式 或 linked 模式。
    

在生产环境使用 **「external 模式」**主要是为了方便我们在需要时进行错误追踪和调试。虽然浏览器不会自动加载并关联 `source map` 文件，但在开发人员需要查看详细的错误信息、追溯代码来源时，这个独立的 `source map` 文件就变得非常有价值。

在 **「esbuild.config.js」** 中配置 `source-map`：

```
// 省略其他内容const options = {  // 配置true的话，默认就是 linked 模式，这里的模式选择：linked｜external｜inline｜both+ sourcemap: true,}
```

这里如果配置 `true` 的话，默认就是 **「linked 模式」**。配置完成后重新打包：打包成功，`source map` 文件正常生成。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCSakVEDFtGm6Lq2N4JVbB5JdqmwnibJV4jiaiac58pamUaCnsdoibnwk2cQ/640?wx_fmt=png&from=appmsg)  

### 3.10、排除部分第三方包，使用 cdn

为了提升页面加载速度，加快打包速度，有时候我们希望将一些常用的第三方包排除在构建之外，通过 cdn 链接的方式来引入。**「这样即能长久的使用缓存，节省带宽成本，又能提高加载速度，减小构建体积。」**

通过查阅文档得知 external 属性能满足我们的需求，将 `react` 、`react-dom`、`lodash` 排除在构建依赖中。

在 **「esbuild.config.js」** 中配置如下：

```
// 省略其他const options={  // 将这几个模块标记为外部依赖+  external: ["react", "react-dom", "lodash"],}
```

然后在 esbuild-plugin-html 插件中配置我们需要加载的 cdn 链接：

```
// 省略其他const options={    plugins:[      // 省略其他          htmlPlugin({          files: [            {              // 省略之前的其他配置+             extraScripts: [+               {                  src: "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",+               },+               {+                 src: "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",+               },+               {+                 src: "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js",+               },+             ],            },          ],        }),    ]}
```

此时运行 yarn build 重新打包：打包成功，cdn 链接正确引入。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCDgABxt3NibUBdTvVKQZ9ibJwm2TlD7uJ1AGBpWBXPQic8vbu644VJg5ag/640?wx_fmt=png&from=appmsg)  

**「dist/main.js」** 中成功将 `react` 运行时代码排除掉：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCsT4rYfAfGGxEoq1qOMzB2NibHUYuwquyPvvk6Rkp0ZjfqdZvASr4u9Q/640?wx_fmt=png&from=appmsg)  

此时在浏览器中打开，运行却报错：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCw7lEGibgnocxrHOxVkqyJobxqMepJjAzrYtwP4ibFrYBzQsPV5iaRiczhg/640?wx_fmt=png&from=appmsg)  

经过反复研读打包后的文件，发现 **「esbuild」** 对于 `external` 的实现方式有点不同。即使我们配置了 `external` 属性，告诉 **「esbuild」** 这些模块不参与构建过程，但它依然会保留导入语句。

官方文档中也提到了这一点，这是原文：

You can mark a file or a package as external to exclude it from your build. Instead of being bundled, the import will be preserved (using require for the iife and cjs formats and using import for the esm format) and will be evaluated at run time instead.

也就是说，当我们项目中导入了 `react`，并在 `external` 中将其标记为了外部依赖，在构建的时候它会将 `import react from "react"` 转换为 `const react = require(react)`。

当在浏览器中运行时，由于找不到 `react` 模块代码，就会导致报错。

基于这个问题，我个人也是很不理解，并向 **「esbuild」** 的作者提出了我的疑问，这是 issue 链接：https://github.com/evanw/esbuild/issues/3509

evanw （esbuild 作者）虽然并未解释为什么这么做，但是给出了解决方案：**「在 Web 环境中手动实现 require 函数，并判断当加载 react 模块的时候返回 cdn 中导出的 react 变量。」**

......

我个人对这种解决方案很难苟同，我认为这是 **「esbuild」** 内部实现的问题。

基于我个人的理解，也给出了另一个解决方案：写一个插件解决这种问题。

```
const options={  // 省略其他  plugins: [    // 排除第三方包插件，配合 external 属性使用+    {+       name: "external-plugin",+       setup(build) {+         build.onResolve({ filter: /^lodash$/ }, (args) => {+           return { path: args.path, namespace: "lodash" };+         });+         build.onLoad({ filter: /.*/, namespace: "lodash" }, (args) => {+           return {+             contents: "module.exports=window._",+           };+         });+         build.onResolve({ filter: /^react$/ }, (args) => {+           return { path: args.path, namespace: "react" };+         });+         build.onLoad({ filter: /.*/, namespace: "react" }, (args) => {+           return {+             contents: "module.exports=window.React",+           };+         });+         build.onResolve({ filter: /^react-dom/ }, (args) => {+           return { path: args.path, namespace: "react-dom" };+         });+         build.onLoad({ filter: /.*/, namespace: "react-dom" }, (args) => {+           return {+             contents: "module.exports=window.ReactDOM",+           };+         });+       },+     },  ]}
```

这个插件的大致意思是说，当去 `require` 这些被排除构建的模块时，返回这些模块导出的全局变量。

经测试，能解决问题且正常显示。

### 3.11、代码压缩

接下来测试代码压缩，这是 **「esbuild」** 的重头戏，并且是它的核心优势！

在 **「esbuild.config.js」** 中开启压缩：

```
const options={+ // 开启压缩+ minify: true}
```

使用方式很简单，点赞！

配置完成后重新打包，打包成功并显示正常。

唯一美中不足的是，**「esbuild」** 只会对在构建流程中的 `js` 文件和 `css` 文件进行压缩，并不会对构建流程之外的 `html` 文件进行压缩。当然，这也是能理解的。

要想压缩 **「html」** 文件，需要我们在输出 **「html」** 文件前用 html-minifier-terser 这个工具进行压缩，压缩完成后再输出到文件系统中，这一块我们下一节写插件再重点讲解。

不过无伤大雅，速度很快，再次点赞。

### 3.12、css 加厂商后缀 + API 转换

接下来是上生产前的必要准备工作：解决 css 属性兼容性问题。比如 css3 中新增的属性 `user-select`，目前只有部分浏览器支持，其他浏览器要想也支持的话，需要我们加上浏览器前缀：

```
-webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
```

在 **「Webapck」** 中一般是用 PostCSS 和相应的插件来解决此类问题的。

但在 **「esbuild」** 中很简单，只需配置需要兼容的浏览器即可。

如上面提到的 `user-select` 属性，在 https://caniuse.com/ 中查询到，该属性谷歌浏览器 54 版本后才支持，火狐浏览器 69 版本后才支持。

在 target 属性中配置我们需要支持的浏览器版本。

```
// 省略其他 const options={  // 配置兼容的浏览器或js版本+ target: ["es2015", "chrome53", "firefox68"], }
```

在 **「main.css」** 中写一段测试代码：

```
:root {  --foo-color: #12345678;  color: var(--foo-color);  user-select: none;}
```

重新打包：浏览器前缀已自动加上。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCkGvA0rHz4NV0WAqPJCtQXiceZTc9eibgkuKQjtXmBaDRuXqG5vm5KcVg/640?wx_fmt=png&from=appmsg)  

* * *

但是有些属性仅仅加前缀是不够的，比如上面我们用到的 `var (css 变量)` 这个 API，谷歌浏览器 67 以上版本才支持，这个时候单独配置 **「esbuild」** 的 `target` 属性是不会生效的。

如果我们想要在低浏览器中生效，就必须要生成对应的 polyfills。

这个时候我们可以借助 PostCSS 来帮我们解决这类问题。

> ❝
> 
> PostCSS：它是一个通过 JavaScript 来转换样式的工具，它可以帮助我们进行一些 CSS 的转换和适配，比如自动添加浏览器前缀、css 样式的重置等。
> 
> 它本身只提供了解析和生成 CSS 的基础框架，实际的功能是通过插件来实现的。
> 
> ❞

这里尝试了几个 **「esbuild」** 插件均失败，决定自己写一个简易的 `esbuild-postcss-plugin`。先安装相应的依赖:

```
yarn add postcss postcss-css-variables
```

postcss-css-variables：专门解决 var 变量兼容性的 **「postcss」** 插件。

安装完成后在 `esbuild.config.js` 中配置：

```
+ const postcss = require("postcss");+ const cssVariables = require("postcss-css-variables");const options={  plugins:[    // 配置css兼容性问题+   {+     name: "postcss-plugin",+      async setup(build) {+        build.onLoad({ filter: /.css$/ }, async (args) => {+          const css = await fs.promises.readFile(args.path, "utf8");+          const result = await postcss([cssVariables]).process(css, {+            from: args.path,+          });+          return { contents: result.css, loader: "css" };+        });+      },+    },  ]}
```

配置完成后重新打包：var 变量已经替换为具体的属性。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCM0WApZ4WcGicdcRJjRMEhtfTjVG37Q341pnWD6OyLjd25ib8o0XglODg/640?wx_fmt=png&from=appmsg)  

这里由于在生产环境中需要用到大量插件，所以更多的时候是使用插件的合集，也就是预设。它里面包含了很多我们需要用到的插件：postcss-preset-env。

安装该插件：

```
yarn add postcss-preset-env
```

配置到 **「postcss」** 中：

```
const postcss = require("postcss");+ const postcssPresetEnv = require("postcss-preset-env");const cssVariables = require("postcss-css-variables");const options={  plugins:[    // 配置css兼容性问题    {      name: "postcss-plugin",      async setup(build) {        build.onLoad({ filter: /.css$/ }, async (args) => {          const css = await fs.promises.readFile(args.path, "utf8");          const result = await postcss([+           postcssPresetEnv,            cssVariables,          ]).process(css, {            from: args.path,          });          return { contents: result.css, loader: "css" };        });      },    },  ]}
```

这里还有个问题，**「postcss」** 一般是需要配置所兼容的浏览器版本，但 **「esbuild」** 中配置的 `target` 属性并不会在 **「postcss」** 中生效。因此我们还是需要在 **「package.json」** 中配置`browserslist` 属性来告诉 **「postcss」** 我们需要兼容哪些浏览器。

**「package.json：」**

```
"browserslist": {    "production": [      "> 0.2%",      "ie 10"    ],    "development": [      "last 1 chrome version",      "last 1 firefox version"    ]  }
```

这个配置的含义：

*   在生产环境中，支持全球浏览器市场份额大于 0.2% 的浏览器，并且特别指定要支持 IE 浏览器版本。
    
*   在开发环境中，支持最新版本的 Chrome 和 Firefox 浏览器。
    

这个配置不仅 **「postcss」** 会用到，**「babel」** 等工具同样会读取该配置，是一个业内标准配置。

从这里可以看出，**「esbuild」** 的 **「targets」** 能力其实很有限，仅仅会做一些语法上的兼容。

### 3.13、js 兼容老浏览器 + API 转换

同理，对于 js 文件来说，**「esbuild」** 也只能根据 `target` 属性来兼容部分语法，遇到 API 同样无能为力。

比如 `??` 运算符是在 Chrome 80 中引入的，当遇到 Chrome 79 或更早版本时，**「esbuild」** 会将其转换为等效的条件表达式。

在 **「main.tsx」** 中写一个测试函数：

```
// 省略其他const App: FC = () => {  const testFun = () => {    const obj = {      name: "不要秃头啊",    };    return Promise.resolve(console.log("jjj", obj.name ?? "测试??"));  };};
```

查看打包后的文件：发现 **「esbuild」** 已经帮我们对 `??` 语法做了向下兼容。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCB5uv8CqO39zG7F5REej9CT7HDUQVVXoxQjpibDGbicB1BdhyNeeibp1bg/640?wx_fmt=png&from=appmsg)  

对于 `Promise` 这种 API 的兼容，需要通过 Babel 等工具来转换，动手写一个插件吧，安装对应的依赖：

```
yarn add core-js @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript
```

*   core-js：用于提供 JavaScript 标准库的兼容性补丁。
    
*   @babel/core：Babel 编译器的核心，用于转译新版 JavaScript 代码。
    
*   @babel/preset-env：Babel 的预设，根据目标环境智能选择转译插件。
    
*   @babel/preset-react：用于处理 React 中的 JSX 语法转译。
    
*   @babel/preset-typescript：用于处理 TypeScript 代码转译。
    

安装完成后在 **「esbuild.config.js」** 中进行配置：

```
+ const babel = require("@babel/core");const options={   // 省略其他  plugins:[    // 配置babel插件+    {+      name: "esbuild-plugin-babel",+      setup(build) {+        const options = {+          filter: /.ts?x$/,+          namespace: "",+        };+        const transformContents = ({ args, contents }) => {+          const babelOptions = babel.loadOptions({+            // // targets: "> 0.25%, not dead",+            // targets: {+            //   chrome: "58",+            //   ie: "11",+            // },+            filename: args.path,+            presets: [+              [+                "@babel/preset-env",+                {+                  useBuiltIns: "usage",+                  corejs: 3, //需要指定安装core-js的版本，我这里安装的是 "core-js": "^3.23.4"+                },+              ],+              "@babel/preset-react", //预设是从前往后执行+              "@babel/preset-typescript",+            ],+            // "plugins": ["@babel/plugin-transform-block-scoping"],+            caller: {+              name: "esbuild-plugin-babel",+              supportsStaticESM: true,+            },+          });+          return new Promise((resolve, reject) => {+            babel.transform(contents, babelOptions, (error, result) => {+              error ? reject(error) : resolve({ contents: result.code });+            });+          });+        };+        build.onLoad(+          { filter: options.filter, namespace: options.namespace },+          async (args) => {+            const contents = await fs.promises.readFile(args.path, "utf8");++            return transformContents({ args, contents });+          }+        );+      },+    },  ]}
```

这里不用配置需要兼容的浏览器版本信息，babel 默认会读取 **「package.json」** 中的 `browserslist` 属性。

配置完成后重新打包：从打包后的文件可以看到，已经对 `Promise API` 做了向下兼容。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCZzLdHzgR4iaqOSZkC97cLibNc90iaql5M8hDT56icjzU1QY0nx0gCJJj1Q/640?wx_fmt=png&from=appmsg)  

### 3.14、tree shaking

`Tree shaking` 的作用是剔除未使用的代码，使最终打包的 JavaScript 文件更加精简，从而提高前端应用的性能和用户体验。

在 **「esbuild.config.js」** 中开启 `Tree shaking`：

```
// 省略其他const options={  // 开启 tree-shaking+ treeShaking: true,}
```

这个没啥好说的。经测试，功能正常。

### 3.15、代码分割，将第三方包单独抽离

有时候我们为了缩短页面首屏加载时间，减小初始加载体积，通常会将应用拆分成多个小块或模块，使得用户在访问网页时只需下载必要的代码。

这既可以显著减小了初始加载时的文件体积，加速页面加载时间；也能提高缓存利用率，节省带宽成本。同时，多个小块的代码可以并行下载，提高整体加载效率。它的重要性不必多言。

在 **「esbuild.config.js」** 中开启代码分割：

```
const options={   // 开启代码分割   splitting: true,   // splitting 捆绑销售，没办法，想要用代码分割，必须设置 format 为 esm   format: "esm"}
```

要想成功开启代码分割，还必须设置 `format: "esm"`，妥妥的捆绑销售啊。

> ❝
> 
> 介绍一下 esm 格式：
> 
> ECMAScript 模块是 ECMAScript 2015（ES6）引入的模块系统规范。它提供了 `import` 和 `export` 语法，支持异步加载、模块作用域等特性，用来改进 JavaScript 代码的组织和复用。
> 
> 使用 ESM 有助于提高前端应用的性能、可维护性和依赖管理。它使得代码更模块化、可读性更强，同时能够利用现代浏览器的支持。
> 
> 比较适用于支持 ECMAScript 模块的环境，对需要兼容较低浏览器版本的项目慎用。
> 
> ❞

既然必须使用 `esm` 的格式，那我们还需要将 `htmlPlugin` 插件中的配置 `scriptLoading` 设置为 `'module'`：

```
// 省略其他const options={  plugins:[      htmlPlugin({        files: [          {            // scriptLoading ('blocking' | 'defer' | 'module'): 决定是否将脚本标签插入为阻塞脚本标签，带有 defer=""（默认），或带有 type="module"。+           scriptLoading: "module",          },        ],    }),  ]}
```

在 **「main.tsx」** 中写一个 `import` 动态导入的例子：

```
const App: FC = () => {
  return (
    <div>
+     <p onClick={() => import("./src/pages/PageA").then(console.log)}>
        main.js入口文件：
      </p>
      <PageA />
      <div style={{ height: "1px", background: "#666" }}></div>
      <PageB />
      <div style={{ height: "1px", background: "#666" }}></div>
      <PageC />
      <div style={{ height: "1px", background: "#666" }}></div>
      <div style={{ margin: "10px" }}>
        测试图标：<span class></span>
      </div>
    </div>
  );
};
```

点击 `p` 标签，请求 `PageA.tsx` 文件并打印出来。

配置完成后重新打包：**「dist/index.html」** 中的 `script` 链接已经加上 `type="module"` 属性，并成功的实现了代码分割（当遇到动态 `import` 语法时会自动进行分割）。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCl9fkr6IbF9MGqiaELvibgFGOX7gB7GuCEsLgGzySD3cgVaJuRGBPd8Ew/640?wx_fmt=png&from=appmsg)  

打开页面，点击 `p` 标签，控制台报错：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCaYEJ2iaHI34FZOib1MYq6bMbOCR5ZSSAHmNV1gkULGZq6HYut4jKstEg/640?wx_fmt=png&from=appmsg)  

查看生成后的文件发现，是原先的 `target` 属性配置的太低了。

`import` 语法谷歌浏览器 63 版本才支持，如果这里配置的太低会导致 **「esbuild」** 将 `import` 动态语法转换为 `Promise.resolve` 的形式......

这就是对需要兼容较低浏览器版本的项目慎用的原因，没办法，调高浏览器版本：

```
const options={  // 配置兼容的浏览器或js版本-    target: ["es2015", "chrome53", "firefox68"],+    target: ["es2015", "chrome63", "firefox68"],}
```

重新打包：点击 `p` 标签也正常加载。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCyMp8rEcFv1FIFhbxyibBuZpvicb4iaiaTlDj8KqQY57MKjDWYRGCxniaJLA/640?wx_fmt=png&from=appmsg)  

经过测试，**「esbuuld」** 的代码分割能力很鸡肋。只能对动态 `import` 的内容或多入口同时用到的代码进行分割。

也就是基于入口进行分割的，如果是单入口的项目压根用不了这个功能。

假如我们多个地方都使用到了 `Antd` 组件，我希望将用到的 `Antd` 组件单独打包出去，实现不了......

并且该功能只支持 `esm` 格式，对浏览器版本有限制，也没有相关的插件解决。

> ❝
> 
> 总结一下就是：鸡肋。
> 
> ❞

### 3.16、文件加 hash

为了更持久的使用缓存，并能够及时的请求最新文件，我们一般会给输出文件名称加上 `hash`，并对打包后的文件类型进行分类。

比如资源文件放在 `assets` 中，`.js` 文件放在 `js` 目录中，`.css` 文件 放在 `css` 目录中。

在 **「esbuild.config.js」** 中进行配置：

```
// 省略其他const options={  // 对资源文件分类和加内容 hash  // 当用 file loader 解析的文件都会放在这里  assetNames: "assets/[name]-[hash]",  // 对 js、cs 进行分类  chunkNames: "[ext]/[name]-[hash]",  // 对入口文件进行分类并加 hash  entryNames: "[name]-[hash]",}
```

注意：这里使用的都是 `Content Hash`。

配置完成后重新打包：正常分类，运行正常。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCOGNSjgSjMfVhicr5asUmtPly1p9qZ0FKict1QbYN7LRiaMUhWQwibdZdAQ/640?wx_fmt=png&from=appmsg)  

### 3.17、构建前清空 dist 文件夹

每次打包前自动清空 **「dist」** 目录，别说了，我手都删累了。

安装插件解放双手：

```
yarn add esbuild-plugin-clean
```

在 **「esbuild.config.js」** 中配置插件：

```
const { clean } = require("esbuild-plugin-clean");const options={  // 省略其他  plugins:[     clean({ patterns: "dist/*" }),  ]}
```

### 3.18、如何获取环境变量：判断是 dev 还是 prod

有时候我们需要将配置进行区分出来，比如生产环境下才需要对代码进行代码压缩和 `tree-shaking`，开发环境只需要正常打包就行。

这个时候需要配置环境变量来进行区分。修改 package.json 中的打包命令：

```
"scripts": {    // 运行前先在 node 环境中设置环境变量 NODE_ENV = production    "build": "NODE_ENV=production node ./esbuild.build.js"  },
```

在 **「esbuild.config.js」** 中读取环境变量并进行配置：

```
// 省略其他  const options={    // define 的本质其实就是字符串替换   define: {     "process.env.NODE_ENV": `"${process.env.NODE_ENV || false}"`, // 设置 NODE_ENV   },  }
```

这样，我们在 **「node」** 环境或 **「web」** 环境中都能成功拿到`process.env.NODE_ENV` 属性。

在 **「main.js」** 中打印该变量验证一下：成功获取。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibv7cGkWyNYF5wvtn03nickyCIcI8uUrYX3zGlia0pLOxVbwfRvY9VRpJHznJxc0piapzR79m5ryLedEg/640?wx_fmt=png&from=appmsg)  

### 3.19、构建前进行 ts 类型检测（可选）

为了在上线前提前捕获异常，我们通常会在构建前先对代码进行类型检测，避免在运行时才报错。

**「esbuild」** 在对 `.ts` 文件和 `.tsx` 文件打包的过程中并不支持类型检测。作者也明确表示未来也不会支持 TS 类型检查能力。当然，大部分构建工具都不支持。

我们在 **「Webpack」** 中往往是通过插件 fork-ts-checker-webpack-plugin 来进行前置校验的，在 **「esbuild」** 中目前还没有相应的插件。

有兴趣的同学可以借助 tsc --noEmit 的能力写一个插件来完成。由于这个功能并不是必须的，我也就不肝了，留给社区开发者吧。

四、总结
----

从上面的调研结果可以看出，**「esbuild」** 的优势很明显，它具有**「极快的构建速度」**、**「可扩展性」**、**「支持多种格式」**、**「不需要设置各种 loader」**，**「配置简单」**等特点。

但对于真实的应用场景还有很多不足，比如：

*   社区生态很弱，跟 **「Webpack」** 和 **「Vite」** 完全不在一个量级
    
*   插件之间兼容性问题很严重，这也是为啥在调研过程中写了不少插件的原因...
    
*   代码分割能力太弱，只能基于入口进行分割
    
*   对目标浏览器版本有一定要求
    
*   不支持 HMR
    
*   为了保持结构的一致性，没有提供转化的 AST 的 API
    
*   由于工具和插件还是采用 JavaScript 编写，存在解析速度相对较慢的可能性
    
*   对于复杂场景，配置还是像 Webpack 一样复杂（其实可以内置一些插件）
    

总之，**「esbuild」** 不是像 **「Webpack」** 是一个大一统项目，提供完善的插件机制，而是在极度精简之后的打包工具，快才是它的追求目标。

从另一个角度来说，**「Esbuild」** 现在还是一片蓝海，上升空间很大。如果未来发布 1.0 正式版，说不定能有更好的表现，值得期待！

五、推荐阅读
------

1.  从零到亿系统性的建立前端构建知识体系✨
    
2.  我是如何带领团队从零到一建立前端规范的？🎉🎉🎉
    
3.  二十张图片彻底讲明白 Webpack 设计理念，以看懂为目的
    
4.  【中级 / 高级前端】为什么我建议你一定要读一读 Tapable 源码？
    
5.  前端工程化基石 -- AST（抽象语法树）以及 AST 的广泛应用
    
6.  线上崩了？一招教你快速定位问题！
    
7.  【Webpack Plugin】写了个插件跟喜欢的女生表白，结果.....
    
8.  从构建产物洞悉模块化原理
    
9.  Webpack 深度进阶：两张图彻底讲明白热更新原理！
    
10.  【万字长文｜趣味图解】彻底弄懂 Webpack 中的 Loader 机制