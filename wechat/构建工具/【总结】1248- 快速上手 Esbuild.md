> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EsD-7W-w2TxgFyRA1kIKcg)

相信很多小伙伴第一次使用 Vite 开发项目的时候，都会被它的速度震惊到。为什么 Vite 那么快呢？除了使用了 ES modules 之外，Vite 内部还使用了一个神器 ——  esbuild。

Esbuild 是由 Figma 联合创始人 **Evan Wallace** 于 2020 年开发的工具。它是一个速度极快的 JavaScript/CSS 打包器，相比已有的 Web 构建工具，它的构建速度快 10-100 倍。

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V1X7TATic48VcD5uPw2N03X3lzGhiaTNVjKnicictEzMEgk68NHAcicoXIF6ohBST5wHVKWbFRWbDjYF4w/640?wx_fmt=jpeg)

如此逆天的性能提升，还在抱怨 Webpack 打包慢的你，是不是很心动？心动不如行动，本文将带你一起快速上手 esbuild。

### 安装 esbuild

你可以通过 `npm` 来安装 esbuild ，以下命令将以局部的方式来安装 esbuild。当然你也可以使用 `yarn` 或 `pnpm` 等其它客户端来安装 esbuild。

```
 npm install esbuild -D
```

待安装成功后，可以运行以下命令来检测是否安装成功：

```
 ./node_modules/.bin/esbuild --version
```

当以上命令成功执行后，终端会输出当前的 esbuild 版本信息 —— `0.14.21`。为了方便后面的演示，我们来新建一个 **getting-started-esbuild** 项目，然后使用 `npm init -y` 来初始化项目：

```
 mkdir getting-started-esbuild
 npm init -y
```

Esbuild 支持 TypeScript 和 JSX 语法，下面我们先来体验如何打包 TS 文件。

### 打包 TS

首先，在根目录下新建一个 **math.ts** 文件并输入以下内容：

```
// math.tsexport const add = (a: number, b: number) => a + b;
```

接着，继续新建一个 **main.ts** 文件并输入以下内容：

```
// main.tsimport { add } from "./math"console.log(`3 + 5 = ${add(3, 5)}`);
```

为了方便后续的打包操作，我们在 **package.json**  文件的 **scripts** 字段中新增一个打包 TS 文件的命令：

```
{  "name": "getting-started-esbuild",  "scripts": {    "build:ts": "esbuild main.ts --bundle --outfile=main.js"  }}
```

> esbuild 默认不进行打包，所以你必须显式设置 `--bundle` 标志，而 `--outfile` 标志用于设置打包输出的文件名称。若未设置 `--outfile` 标志，esbuild 将把结果发送到标准输出（stdout）。

之后，我们就可以通过 `npm run build:ts` 命令来打包 **main.ts** 文件。以下是经过 esbuild 打包后的输出结果：

```
// main.js(() => {  // math.ts  var add = (a, b) => a + b;  // main.ts  console.log(`3 + 5 = ${add(3, 5)}`);})();
```

除了支持打包 TS 之外， esbuild 也支持打包 css 文件。下面我们来看一下如何利用  esbuild 打包 css 文件。

### 打包 CSS

首先，在根目录下新建一个 **normalize.css** 文件并输入以下内容：

```
/** normalize.css */html {  line-height: 1.15; /* 1 */  -webkit-text-size-adjust: 100%; /* 2 */}body {  margin: 0;}
```

接着，继续新建一个 **style.css** 文件并输入以下内容：

```
/** style.css */@import "normalize.css";p {  font-weight: bold;}
```

同样，为了方便后续的打包操作，我们在 **package.json**  文件的 **scripts** 字段中新增一个打包 CSS 文件的命令：

```
{  "name": "getting-started-esbuild",  "scripts": {    "build:css": "esbuild style.css --bundle --minify --outfile=      style.min.css"  }}
```

之后，我们就可以通过 `npm run build:css` 命令来打包 **style.css** 文件。以下是经过 esbuild 打包后的输出结果：

```
html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}p{font-weight:700}
```

### 打包图片

在 Web 项目打包过程中，我们经常需要处理图片资源。esbuild 内置了 `dataurl` 和 `file` 加载器，利用这些加载器我们就可以轻松处理图片资源。

下面我们将使用 esbuild 的 logo 来演示一下如何打包图片资源，为了验证不同 loader，我们准备了 `esbuild-logo.png` 和 `esbuild-logo.jpg` 两张不同格式的图片文件：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V1X7TATic48VcD5uPw2N03X3SFN4f4k7kKPLwkKQsUlfey24lE3MLM6ayYcx6fWDhIpm25BQbTNaIw/640?wx_fmt=jpeg)

准备好图片资源文件之后，我们在根目录下新建一个 **index.html** 文件并输入以下内容：

```
<!DOCTYPE html><html lang="zh-cn">  <head>    <meta charset="UTF-8" />    <meta http-equiv="X-UA-Compatible" content="IE=edge" />    <meta ></script>  </body></html>
```

接着，继续新建一个 **index.ts** 文件并输入以下内容：

```
import pngUrl from "./esbuild-logo.png";const dataUrlImg: HTMLImageElement = document.querySelector("#dataUrlLogo");dataUrlImg.src = pngUrl;import jpgUrl from "./esbuild-logo.jpg";const urlImg: HTMLImageElement = document.querySelector("#urlLogo");urlImg.src = jpgUrl;
```

然后，我们在 **package.json**  文件的 **scripts** 字段中新增一个打包图片资源的命令：

```
{  "name": "getting-started-esbuild",  "scripts": {    "build:image": "esbuild index.ts --bundle --loader:.png=dataurl        --loader:.jpg=file --outfile=index.js"  }}
```

> 在以上的 `build:image` 命令中，我们为 `.png` 文件指定了 `dataurl` 加载器，为 `.jpg` 文件指定了 `file` 加载器。`dataurl` 加载器会对图片的二进制数据进行 base64 编码，然后组装成 data-uri 的形式。

之后，我们就可以通过 `npm run build:image` 命令来打包图片资源文件。以下是经过 esbuild 打包后的输出结果：

```
(() => {  // esbuild-logo.png  var esbuild_logo_default = "data:image/png;base64,iVBORw0KGgoAAAAN...=";  // esbuild-logo.jpg  var esbuild_logo_default2 = "./esbuild-logo-WVOHGFM5.jpg";  // index.ts  var dataUrlImg = document.querySelector("#dataUrlLogo");  dataUrlImg.src = esbuild_logo_default;  var urlImg = document.querySelector("#urlLogo");  urlImg.src = esbuild_logo_default2;})();
```

由于我们为 `.png` 文件指定了 `dataurl` 加载器，所以 `esbuild-logo.png` 文件的内容就被转化为 data-uri 的数据格式。

### 使用 build API

在前面的示例中，我们都是通过在命令行启动 esbuild 应用程序来执行打包操作。对于简单的命令来说，这种方式很便捷。但如果我们的命令很复杂，比如需要设置较多的配置选项，那么我们的命令就不便于阅读。针对这个问题，我们可以使用 esbuild 提供的 build api。

在 esbuild 模块的入口文件 **main.js** 中，我们可以清楚地看到该模块导出的内容：

```
// node_modules/esbuild/lib/main.js0 && (module.exports = {  analyzeMetafile,  analyzeMetafileSync,  build,  buildSync,  formatMessages,  formatMessagesSync,  initialize,  serve,  transform,  transformSync,  version});
```

由以上代码可知，esbuild 为我们提供了 `build（异步）` 和 `buildSync（同步）` 的 API。接下来，我们以异步的 build API 为例，来打包一下前面的 **main.ts** 文件。

为了方便管理项目的脚本，我们先在根目录下新建一个 **scripts** 目录，然后在该目录下新建一个 `build.js` 文件并输入以下内容：

```
// scripts/build.jsrequire("esbuild")  .build({    entryPoints: ["main.ts"],    outfile: "main.js",    bundle: true,    loader: { ".ts": "ts" },  })  .then(() => console.log("⚡ Done"))  .catch(() => process.exit(1));
```

创建完 `build.js` 文件之后，我们就可以在终端中执行 `node scripts/build.js` 命令来执行打包操作。

### Watch Mode

在开发阶段，我们希望当文件发生异动的时候，能自动执行打包操作，从而生成新的文件。针对这种场景，可以在调用 `build` API 的时候，设置 `watch` 字段的值为 `true`。

```
// scripts/watch-build.jsrequire("esbuild")  .build({    entryPoints: ["main.ts"],    outfile: "main.js",    bundle: true,    loader: { ".ts": "ts" }, watch: true,  })  .then(() => console.log("⚡ Done"))  .catch(() => process.exit(1));
```

### Serve Mode

除了 Watch 模式之外，esbuild 还支持 Serve 模式。在该模式下，esbuild 将会根据用户的配置启动一个静态资源服务器。当用户在浏览器请求打包生成的文件时，若文件已经发生变化，则 esbuild 会自动触发打包操作并返回新的资源文件。

```
// scripts/serve.jsrequire("esbuild")  .serve(    {      servedir: "www",      port: 8000,      host: "localhost"    },    {      entryPoints: ["index.ts"],      outdir: "www",      bundle: true,      loader: {        ".png": "dataurl",        ".jpg": "file",      },    }  )  .then((server) => {      console.log("Server is running at: http://localhost:8000/")    // server.stop();  });
```

### 使用插件

Esbuild 提供了很多开箱即用的功能，比如可以打包 TS、CSS 和 Image 等文件。但这还不能满足我们日常的工作需求。在日常工作中，我们可能还需要打包 Sass、Less、Yaml 或 Markdown 等文件。

为了解决上述的问题，从而满足不同的使用场景，esbuild 设计了插件机制。利用 esbuild 提供的插件机制，开发者可以根据自己的需求，定制对应的插件，来实现对应的功能。当然你并不需要从头开发各种插件，在开发对应的插件前，大家可以先浏览已有的社区插件。

使用 esbuild 插件，主要分为 2 个步骤：安装插件和注册插件。这里我们来介绍一下如何使用 esbuild-plugin-less 插件。

**步骤一：安装插件**

```
 npm install esbuild-plugin-less -D
```

**步骤二：注册插件**

```
import { build } from 'esbuild';import { lessLoader } from 'esbuild-plugin-less';build({  entryPoints: [path.resolve(__dirname, 'index.ts')],  bundle: true,  outdir: path.resolve(__dirname, 'output'),  plugins: [lessLoader()],  loader: {    '.ts': 'ts',  },});
```

在以上代码中，我们通过 `plugins` 字段来注册 `esbuild-plugin-less` 插件，之后 esbuild 就可以打包 less 文件了。如果使用的是 Sass 的话，就需要安装 `esbuild-plugin-sass` 插件。

好的，esbuild 的相关内容就介绍到这里，想系统学习 esbuild 的话，可以阅读 esbuild 官方文档。另外，如果想进一步了解它在实际工作中的应用，可以阅读 [又一个基于 Esbuild 的神器](https://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247498224&idx=1&sn=2c521547ee1492d4a1cc9462eb334c0a&scene=21#wechat_redirect) 这篇文章。

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 120[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 130+ 篇原创文章