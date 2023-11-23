> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vBBfUdy4pHIPChs7TUkFLQ)

| 导语  2020 年 10 月 10 日，webpack5 正式发布，并带来了诸多重大的变更，将会使前端的构建效率与质量大为提升。其实现在各大博客网站已经有很多关于 webpack5 的文章，但真正通过业务实践并获得第一手数据的并不多，所以今天就给大家介绍一下 webpack5 在企鹅辅导业务中的升级与实践 。

**对比 webpack4**  

下面是企鹅辅导 h5 项目分别在 webpack4 和 webpack5 版本下的构建实测数据，测试环境为我的 MacBook Pro 15 寸高配。

<table><tbody><tr><td width="123" valign="top">webpack 版本<br></td><td width="123" valign="top">第一次<br>build 时间<br></td><td width="123" valign="top">第二次<br>build 时间</td><td width="123" valign="top">第三次<br>build 时间</td></tr><tr><td width="123" valign="top">v4<br></td><td width="123" valign="top">19.6s<br></td><td width="123" valign="top">6.8s<br></td><td width="123" valign="top">7.4s<br></td></tr><tr><td width="123" valign="top">v5<br></td><td width="123" valign="top">14.8s<br></td><td width="123" valign="top">1.6s<br></td><td width="123" valign="top">1.5s<br></td></tr></tbody></table>

在上表打包的结果基础之上，修改项目中的代码后，重新进行打包得到如下结果：  

<table><tbody><tr><td width="123" valign="top">webpack 版本<br></td><td width="123" valign="top">第一次<br>build 时间<br></td><td width="123" valign="top">第二次<br>build 时间</td><td width="123" valign="top">第三次<br>build 时间</td></tr><tr><td width="123" valign="top">v4<br></td><td width="123" valign="top">10.5s<br></td><td width="123" valign="top">7.3s<br></td><td width="123" valign="top">6.8s<br></td></tr><tr><td width="123" valign="top">v5<br></td><td width="123" valign="top">4.0s<br></td><td width="123" valign="top">1.5s<br></td><td width="123" valign="top">1.6s</td></tr></tbody></table>

打包后文件的大小：

<table><tbody><tr><td width="153" valign="top">webpack 版本<br></td><td width="141" valign="top">build 产生的文件的大小<br></td></tr><tr><td width="153" valign="top">v4<br></td><td width="141" valign="top">2.16M<br></td></tr><tr><td width="153" valign="top">v5<br></td><td width="141" valign="top">2.05M<br></td></tr></tbody></table>

从上表的测试结果可以看出，webpack5 构建性能相对于 webpack4 提升很多，但在打包完成的 bundle 大小上，与 v4 差距不大。由此可以看出 webpack5 的新特性带来了一些优化，下面结合这些新的特性来分析为什么能够做到这些优化。

**webpack5 新特性**

webpack5 的发布带来了很多新的特性，例如优化持久缓存、优化长期缓存、Node Polyfill 脚本的移除、更优的 tree-shaking 以及 Module Federation 等。下面针对这些新的特性作出分析。

**1、编译缓存**

顾名思义，编译缓存就是在首次编译后把结果缓存起来，在后续编译时复用缓存，从而达到加速编译的效果。

**1.1、webpack4 缓存方案**

webpack4 及之前的版本本身是没有持久化缓存的能力的，只能借助其他的插件或 loader 来实现，例如：

*   **使用** **cache-loader** **来缓存编译结果到硬盘，再次构建时在缓存的基础上增量编译长期缓存。**
    
*   使用自带缓存的 loader，如：babel-loader，可以配置 cacheDirectory 来将 babel 编译的结果缓存下来。
    
*   使用 hard-source-webpack-plugin 来为模块提供中间缓存。
    

如下图所示，使用以上缓存方案的结果，默认存储在 node_modules/.cache 目录下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHkxibCSj0FJZgq3bGu80duRPm44hRDlEtUWvibXCqT3Fyx1F2cibFQbGRQ/640?wx_fmt=jpeg)

**1.2、webpack5 缓存方案**

webpack5 统一了持久化缓存的方案，有效降低了配置的复杂性。另外由于 webpack 提供了构建的 runtime，所有被 webpack 处理的模块都能得到有效的缓存，大大提高了缓存的覆盖率，因此 webpack5 的持久化缓存方案将会比其他第三方插件缓存性能要好很多。

webpack5 缓存的开启可以通过以下配置来实现：

```
module.exports = {    cache: {      // 将缓存类型设置为文件系统      type: "filesystem",       buildDependencies: {        /* 将你的 config 添加为 buildDependency，           以便在改变 config 时获得缓存无效*/        config: [__filename],        /* 如果有其他的东西被构建依赖，           你可以在这里添加它们*/        /* 注意，webpack.config，           加载器和所有从你的配置中引用的模块都会被自动添加*/      },      // 指定缓存的版本      version: '1.0'     }}
```

如下图所示，webpack5 默认将构建的缓存结果放在 node_modules/.cache 目录下, 可以通过配置更改目录：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTH42jibWICHYibJVYuupSKEjo9Rj0rRicy845lLsLqYBoFDmYevA73ww0Nw/640?wx_fmt=png)

**注意事项：**

*   cache 的属性 type 会在开发模式下被默认设置成 memory，而且在生产模式中被禁用，所以如果想要在生产打包时使用缓存需要显式的设置。
    
*   为了防止缓存过于固定，导致更改构建配置无感知，依然使用旧的缓存，默认情况下，每次修改构建配置文件都会导致重新开始缓存。当然也可以自己主动设置 version 来控制缓存的更新。
    

> 更多缓存的配置可以参考官方文档：
> 
> https://webpack.js.org/configuration/other-options/#cache

**2、长效缓存**

**长效缓存指的是能充分利用浏览器缓存，尽量减少由于模块变更导致的构建文件** **hash** **值的改变，从而导致文件缓存失效。**

**2.1、webpack4 长效缓存方案**

webpack4 及之前的版本 moduleId 和 chunkId 默认是自增的，更改模块的数量，容易导致缓存的失效。

使用脚手架创建一个简单的项目，构建结果如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHGdTcFzdmatPVWdM2ur92pyEoPllhFn3dTRSj0bmfcdmqiaU9v7YD3Gw/640?wx_fmt=jpeg)

```
import React from 'react';import ReactDOM from 'react-dom';ReactDOM.render(  <React.StrictMode>    <div />  </React.StrictMode>,  document.getElementById('root'));
```

**注释掉入口文件 test.js  里引用的 css 文件，如上代码，构建结果如下：**

**![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHAkaAbeLXt2t54rkjd6HutTv9GpFY25xEIuDNC7RMybtOiaAMXqE6lhw/640?wx_fmt=jpeg)**

由上图可知，仅仅改了其中一个文件，结果构建出来的所有 js 文件的 hash 值都变了，不利于浏览器进行长效缓存。v4 之前的解决办法是使用 HashedModuleIdsPlugin 固定 moduleId，它会使用模块路径生成的 hash 作为 moduleId；使用 NamedChunksPlugin 来固定 chunkId。

其中 webpack4 中可以根据如下配置来解决此问题：

```
optimization.moduleIds = 'hashed'optimization.chunkIds = 'named'
```

**2.2、webpack5 长效缓存方案**

**webpack5 增加了确定的** **moduleId****，****chunkId** **的支持，如下配置：**

```
optimization.moduleIds = 'deterministic'
optimization.chunkIds = 'deterministic'


```

此配置在生产模式下是默认开启的，它的作用是以确定的方式为 module 和 chunk 分配 3-5 位数字 id，相比于 v4 版本的选项 hashed，它会导致更小的文件 bundles。

由于 moduleId 和 chunkId 确定了，构建的文件的 hash 值也会确定，有利于浏览器长效缓存。同时此配置有利于减少文件打包大小。

在开发模式下，建议使用:

```
optimization.moduleIds = 'named'
optimization.chunkIds = 'named'


```

此选项生产对调试更友好的可读的 id。

**3、Node Polyfill 脚本被移除**

webpack4 版本中附带了大多数 Node.js 核心模块的 polyfill，一旦前端使用了任何核心模块，这些模块就会自动应用，但是其实有些是不必要的。

webpack5 将不会自动为 Node.js 模块添加 polyfill，而是更专注的投入到前端模块的兼容中。因此需要开发者手动添加合适的 polyfill。

```
import sha256 from 'crypto-js/sha256';

const hashDigest = sha256('hello world1');
console.log(hashDigest);


```

上面代码在 v4 中打包结果如下：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHFdJ8DvicaW8EAhq29DKs6wrEJEl5EqSL1xNxkaKEmhzTnsR3NrhJx3g/640?wx_fmt=jpeg)

使用 wepack4 打包，主动添加了 crypto 的 polyfill，即 crypto-browserify，打包大小为 441k。在 wepack5 中打包这样的代码，构建会提示开发者进行确认是否需要 node polyfill，如下图：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHsMZhgerNicmVZngpoYBFticfiaR59o0po8BfygwqUCibsMiaaqy00chxW6w/640?wx_fmt=jpeg)

**如果确认不需要 polyfill，可根据提示设置** **fallback****，如下：**

```
resolve: {
  fallback: { "crypto": false }
}


```

打包结果为：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHjXtVBNib7rrbkSWu6y5cJibJTkS5xiaebcR0t0HCicg2dJsNiaiaDDLnlgnQ/640?wx_fmt=jpeg)

**打包后 js 文件小了 305k，去除掉项目不需要的 node polyfill，对于减小打包大小收益很可观。**

**4、更优的 tree-shaking**

```
// const.js
export const a = 'hello';
export const b = 'world';

// module.js
export * as module from './const';

// index.js
import * as main from './module';
console.log(main.module.a)


```

**有如上的一段代码，在 v4 构建中打包后的结果如下：**  

**![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4IoGiaTbhibrO2gepTaGIOP98m1uxuaWicHcQBL7hre72aHL1akUIUibSt3Ug/640?wx_fmt=png)**

从上图可以看出，const.js 导出的 a，b 变量都被打包了，但实际上我们只用到了 a，期待的是 b 应该不被打包进去。

webpack5 对 tree-shaking 进行了优化，分析模块的 export 和 import 的依赖关系，去掉未被使用的模块，打包结果如下：

```
!function(){"use strict"; console.log("hello")}();


```

**可以看出代码非常简洁。**  

5、Module Federation
-------------------

Module Federation 使得使 JavaScript 应用得以从另一个 JavaScript 应用中动态地加载代码 —— 同时共享依赖。相当于 webpack 提供了线上 runtime 的环境，多个应用利用 CDN 共享组件或应用，不需要本地安装 npm 包再构建了，这就有点云组件的概念了。

以 github 上的例子为例，basic-host-remote

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCve8Zavut2EsZCYV7NGKzTHliaU5Y9WZM4XKNyX0WFDGCqLMewTgX2e7zQG2GO4kIVUibIBf8aQdoGQ/640?wx_fmt=png)

**上图是项目的目录结构，可以看出存在 2 个应用 app1、app2。其中 app1 使用了 app2 的代码，那么 app1 是如何引用 app2 的代码呢？看下面的代码：**  

```
// app1

import React from "react";

const RemoteButton = React.lazy(() => import("app2/Button"));

const App = () => (
  <div>
    <h1>Basic Host-Remote</h1>
    <h2>App 1</h2>
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
  </div>
);

export default App;


```

其中最重要的就是

```
const RemoteButton = React.lazy(() => import("app2/Button"));


```

直接在 app1 的项目中引用了 app2 项目的代码。是如何做到的？我们看下构建配置：

先看提供组件 Button 的 app2 的配置：

```
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
 // 有删减
  plugins: [
    new ModuleFederationPlugin({
      name: "app2",
      library: { type: "var", name: "app2" },
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/Button",
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};


```

依赖共享主要是由插件 ModuleFederationPlugin 来提供的，由上面的配置可以看出 app2 暴露出了 Button 组件，依赖 react、react-dom，生成入口文件为 remoteEntru.js。下面再来看下 app1 的配置：

```
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {

  //http://localhost:3002/remoteEntry.js
  plugins: [
    new ModuleFederationPlugin({
      name: "app1",
      remotes: {
        app2: "app2@http://localhost:3002/remoteEntry.js",
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
    }),
  ],
};

```

结合之前 app2 的配置来看，app1 加载远程的 app2 模块，依赖 react、react-dom。

浏览器里运行效果如图：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4Ioic2zs69ZibuIQwKUu3rFqXqYe42wZoOgHicbIl8aqFLHy1RcvEUzFWhCA/640?wx_fmt=png)

Module Federation 还有很多的潜力可以挖掘，例如可以将我们项目中常用的依赖包 react 全家桶等打成一个包，做成一个 runtime, 开发环境和生产环境依赖一个 runtime，这样可以大大减少项目的大小，提高编译速度。

一些更实用的用法需要我们在实际使用中继续探索，发挥 webpack5 更大的价值。

6、其他新特性
-------

1、在 webpack4 中标记过期的功能都已经在 webpack5 移除了。

2、开发环境下默认使用可读的名称为 module 命名，不需要使用如下语法：

```
import(/* webpackChunkName: "name" */ "module")


```

3、原生 worker 支持

......

本文针对 webpack5 的比较重要的特性进行了说明，具体的一些变更可以去参考官方文档。

**升级踩坑**

**升级的过程比较枯燥，基本上就是调试、修改、继续调试的过程，下面列出几个比较典型的问题。**

**1、升级 webpack 及相关包的版本**

这个过程是比较耗时的，需要将 webpack 的版本及相关 loader 和 plugin 的版本进行升级，如今 webpack5 已正式发布，相关插件基本上都兼容了 webpack5，所以大部分问题都能通过升级包版本解决。

**2、配置 webpack5 编译缓存不生效**

**这个问题就比较坑了，脚手架创建一个简单项目后，根据官网文档配置** **cache****，启动构建：**

```
webpack --config webpack-dist.config.js

```

```
cache: {
   type: 'filesystem'
}

```

**结果构建是成功，但是相应的缓存却一直没有生成，其中构建提示如下：**

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4IoRqzCSpib4dqNEHwen7U7u3xHS4xL8OMCt1UvuWWZ2YWAmibJItjTlUOQ/640?wx_fmt=png)

提示说 webpack-dist.config.js 找不到，当时就很懵了，这个文件明明是存在的，而且配置缓存策略时，并没有这个文件。查阅大量文档之后开始翻看源码，其中部分如下：

```
// webpack/lib/cache/PackFileCacheStrategy.js

if (newBuildDependencies.size > 0 || !this.buildSnapshot) {
    if (reportProgress) reportProgress(0.5, "resolve build dependencies");
    this.logger.debug(`Capturing build dependencies... (${Array.from(newBuildDependencies).join(", ")})`);
    promise = new Promise((resolve, reject) => {
        this.logger.time("resolve build dependencies");
        this.fileSystemInfo.resolveBuildDependencies(this.context,
newBuildDependencies,) ...


```

打印 newBuildDependencies 得到结果：

![](https://mmbiz.qpic.cn/mmbiz_jpg/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4Io8icVxKwEYsicRib5k3XrCZrvibZibsTOE3RwByBzliadZNvtHmxqryb3jichA/640?wx_fmt=jpeg)

发现还真有这个文件，而且相比于其他绝对路径，这个相对路径可能无法找到。

继续断点调试，追溯这里的 newBuildDependencies 的值，发现 webpack-dist.config.js 这个文件是在 webpack-cli 里写入的，

```
const cacheDefaults = (finalConfig, parsedArgs) => {
    // eslint-disable-next-line no-prototype-builtins
    const hasCache = finalConfig.hasOwnProperty('cache');
    let cacheConfig = {};
    if (hasCache && parsedArgs.config) {

        if (finalConfig.cache && finalConfig.cache.type === 'filesystem') {
            cacheConfig.buildDependencies = {
                config: parsedArgs.config,
            };
        }
        console.log(3333, cacheConfig)
        return { cache: cacheConfig };
    }
    return cacheConfig;
};


```

从这里看出当配置持久缓存时，使用命令行自动的给 cache 加上 config 后面的参数。由于找不到这个相对路径，从而导致缓存逻辑执行报错，缓存失败。

我的解决办法：

```
const path = require('path');
const exec = require('child_process').exec;

const config = path.resolve(__dirname, 'webpack-dist.config.js');
const cmdStr = `webpack --config ${config}`;

exec(cmdStr, function(err,stdout,stderr){
  if(err) {
      console.log('get weather api error:'+stderr);
  } else {
      console.log(stdout);
  }
});

```

获取 webpack-dist.config.js 的绝对路径，传给命令行，就可以解决。可能还有更优雅的解决方法，后面继续探索。

**3、loader 配置参数修改**

出现如下报错时，表示 webpack5 不兼容以前的 webpack 的写法了，需要按最新版的规则来修改：

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4Iop5wOSmxBVLACk24qQH8B4jN4Zx2rVv5NKkdk4Kd28nbNaWGhZpcyEA/640?wx_fmt=png)

```
{
  test: /\.css$/,
  loaders: ['css-loader'],
        // 提取出css
}

loaders改为use 

{
  test: /\.css$/,
  use: ['css-loader'],
        // 提取出css
}

```

**4、去掉 node polyfill**

**由于 webpack5 会自动去掉 polyfill，因此会出现如下提示**

**![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCu1rRLicXibOB6jq4wpe7W4IoQH27sbvrWxtwocHnZPiawvRK10tQLDFzsuggpEnD1OiamwtmicSrkZbEA/640?wx_fmt=png)**

**解决办法是按照提示修改，确认是否需要添加 polyfill**

```
resolve: {
  fallback: { "domain": false }
}


```

总结  

webpack5 正式发布已经有一段时间了，总的来说：  

1.  构建性能大幅度提升，依赖核心代码层面的持久缓存，覆盖率更高，配置更简单。
    
2.  打包后的代码体积减少。
    
3.  默认支持浏览器长期缓存，降低配置门槛。
    
4.  令人激动的新特性 Module Federation，蕴含极大的可能性。