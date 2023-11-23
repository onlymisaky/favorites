> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/7dApHpognDQrGJg7c30AIA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOpXJmSf5n27Cvo6f7ibzicwuHD4eLdpGaXJCMOYd2kfHfDTYXhW9eCicehQ/640?wx_fmt=jpeg)

如果大家看过一些 webpack 优化的文章，一定会出现 dll 动态链接库。它以配置之复杂让众多初学者记忆犹新。  

今天我会以一个学习者的角度去一步一步探讨 webpack dll 的配置，最后得出一个完美的解决方案。

**本文的内容和大部分讲解 webpack 优化文章的观点不一样**，如果有不同的见解，欢迎在评论区和我讨论。

> “⚠️ 
> 
> **友情提示**: 本文章不是入门教程，不会费大量笔墨去描写 webpack 的基础配置，请读者配合教程源代码 [1] 食用。

1. 基础概念：dll 其实就是缓存
------------------

说实话我刚看见这个 **dll 动态链接库**的时候，我真被镇住了：这是什么玩意？怎么根本没听说过？

好学的我赶紧 Google 一下，在维基百科 [2] 里找到了标准定义：

> “
> 
> 所谓动态链接，就是把一些经常会共享的代码制作成 DLL 档，当可执行文件调用到 DLL 档内的函数时，Windows 操作系统才会把 DLL 档加载存储器内，DLL 档本身的结构就是可执行档，当程序有需求时函数才进行链接。透过动态链接方式，存储器浪费的情形将可大幅降低。

唉，你们官方就是不说人话。

我结合 webpack，从 Web 前端的角度翻译一下：

具体到 webpack 这块儿，就是事先把常用但又构建时间长的代码提前打包好（例如 react、react-dom），取个名字叫 dll。后面再打包的时候就跳过原来的未打包代码，直接用 dll。这样一来，构建时间就会缩短，提高 webpack 打包速度。

我盯着上面那句话看了三分钟，什么 DLL，什么动态链接库，在前端世界里，不就是个**缓存**吗！

> “
> 
> 注：在这里**狭义上**可以理解为缓存，如果真的要探讨 `dll` 背后的知识：**动态链接库**和**静态链接库**，就又涉及到其它领域的的知识了。具体讲下去又是一篇新的文章了，所以暂时按下不表。

我们对比一下 DLL 和前端常接触的网络缓存，一张表就看明白了：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">DLL</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">缓存</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">1. 把公共代码打包为 DLL 文件存到硬盘里</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">1. 把常用文件存到硬盘 / 内存里</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">2. 第二次打包时动态链接 DLL 文件，不重新打包</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">2. 第二次加载时直接读取缓存，不重新请求</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">3. 打包时间缩短</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">3. 加载时间缩短</td></tr></tbody></table>

  

所以在前端世界里， DLL 就是个另类缓存。

2. DLL 手动配置：这么多步根本记不住
---------------------

刚开始我们先不搞配置，我们设想一下，如果让你**手动创建并管理缓存**，你会怎么做？

我想，大家的思路一般都是这样的：

1.  第一次请求的时候，把请求后的内容**存储**起来
    
2.  建立一个**映射表**，当后续有请求时，先根据这个映射表到看看要请求的内容有没有被缓存，有的话就加载缓存，没有就走正常请求流程（也就是所谓的**缓存命中**问题）
    
3.  命中缓存后，直接从缓存中拿取内容，交给程序处理
    

主要流程无非这 3 步，想把事情搞大，可以再加些权重啊，过期时间啊，多级缓存什么的，但主要流程就是上面的 3 步。

一般我们在开发的时候，浏览器，http 协议都帮我们把这些操作封装好了，我们就记几个参数调参就行了；但是 webpack dll 不一样，它需要我们手动实现上面 3 个步骤，所以就非常的无聊 + 繁琐。

下面的代码比较乱，因为我也没打算好好讲这些绕来绕去的配置，具体结构最好看我 github 上放出的示例源代码 [3]，**看不懂也没事，后面有更好的解决方案**。

> “⚠️
> 
> ：看得烦就直接跳过下面的内容

**第 1 步**，我们先要创建 dll 文件，这个相当于我们对第一次的请求内容进行存储，然后我们还要创建一个映射表，告诉程序我们把啥文件做成 dll 了（这个相当于**第 2 步**）：

首先我们写一个创建 dll 文件的打包脚本，目的是把 `react`，`react-dom` 打包成 dll 文件：

```
// 文件目录：configs/webpack.dll.js// 代码太长可以不看'use strict';const path = require('path');const webpack = require('webpack');module.exports = {    mode: 'production',    entry: {        react: ['react', 'react-dom'],    },    // 这个是输出 dll 文件    output: {        path: path.resolve(__dirname, '../dll'),        filename: '_dll_[name].js',        library: '_dll_[name]',    },    // 这个是输出映射表    plugins: [        new webpack.DllPlugin({             name: '_dll_[name]', // name === output.library            path: path.resolve(__dirname, '../dll/[name].manifest.json'),        })    ]};
```

打包脚本写好了，我们总得运行吧？所以我们写个运行脚本放在 `package.json` 的 `scripts` 标签里，这样我们运行 `npm run build:dll` 就可以打包 dll 文件了：

```
// package.json{  "scripts": {    "build:dll": "webpack --config configs/webpack.dll.js",  },}
```

**第 3 步**，链接 dll 文件，也就是告诉 webpack 可以命中的 dll 文件，配置也是一大坨：

```
// 文件目录：configs/webpack.common.js// 代码太长可以不看const path = require('path');const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin'); // 顾名思义，把资源加到 html 里，那这个插件把 dll 加入到 index.html 里const webpack = require('webpack');module.exports = {  // ......  plugins: [    new webpack.DllReferencePlugin({      // 注意: DllReferencePlugin 的 context 必须和 package.json 的同级目录，要不然会链接失败      context: path.resolve(__dirname, '../'),      manifest: path.resolve(__dirname, '../dll/react.manifest.json'),    }),    new AddAssetHtmlPlugin({      filepath: path.resolve(__dirname, '../dll/_dll_react.js'),    }),  ]}
```

为了减少一些大型库的二次打包时间，我们在 3 个文件里写了一堆配置代码，小心翼翼，如履薄冰，中间说不定还会因为作用域的问题链接失败（对，说的就是我）。配置 dll 会给人带来巨大的心理阴影，有没有其他方法降低我们的心智负担呢？

3. AutoDllPlugin：解放你的配置负担
-------------------------

在第 2 小节里我**疯狂劝退**，就是想介绍这个插件：autodll-webpack-plugin[4]，这个插件把上面那 3 坨代码整合到一块儿，让我们摆脱繁琐的配置，让我们看看这么用吧：

```
// 文件目录：configs/webpack.common.jsconst path = require('path');const AutoDllPlugin = require('autodll-webpack-plugin'); // 第 1 步：引入 DLL 自动链接库插件module.exports = {  // ......  plugins: [        // 第 2 步：配置要打包为 dll 的文件        new AutoDllPlugin({            inject: true, // 设为 true 就把 DLL bundles 插到 index.html 里            filename: '[name].dll.js',            context: path.resolve(__dirname, '../'), // AutoDllPlugin 的 context 必须和 package.json 的同级目录，要不然会链接失败            entry: {                react: [                    'react',                    'react-dom'                ]            }        })  ]}
```

`autodll-webpack-plugin`  的使用方法和 webpack 的其他 `plugin` 使用方式非常相似，和手动引入 dll 的方法比起来，简单许多，而且这个插件之前是被 vue-cli 使用的，质量也是比较稳定的，大家可以放心使用。

4. 抛弃 DLL：Vue & React 官方的共同选择
-----------------------------

第 3 节我说 `autodll-webpack-plugin` 之前被 vue-cli 使用，那意思是现在不用了？是不是有 bug 啊？这个还真不是。

学习 webpack 的时候，为了借鉴一下业内优秀的框架的 webpack 配置，我专门看了 vue-cli 和 create-react-app 的源码，但是却没有找到任何 dll 的配置痕迹。

这就很奇怪了，我之前翻过一些 nuxt.js 1.0 的源码，里面是有 dll 的配置代码的，按道理来说 vue-cli 也应该有的，我就猜测是在某次升级中，把 dll 去掉了。所以我开始查找 commit 记录，果然被我找到了：

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOp8iazFdCEgYibnxm2Rgt2oqcA4VC32kWHlHMvXTHELgue6ibAhicYxg83dw/640?wx_fmt=png)

> “
> 
> 白纸黑字，**remove DLL option 3** 个大字写的清清楚楚

原因是什么呢？在这个 issue[5] 里尤雨溪解释了去除的原因：

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOpHmqiaoQgqTEibVwTCjJ59OxDGMoqb61D4dHFJZgukacHCHQLDQcKiaXyw/640?wx_fmt=png)

> “
> 
> `dll` option will be removed. Webpack 4 should provide good enough perf and the cost of maintaining DLL mode inside Vue CLI is no longer justified.  
> dll 配置将会被移除，因为 Webpack 4 的打包性能足够好的，dll 没有在 Vue ClI 里继续维护的必要了。

同样的，在这个 PR[6] 里 create-react-app 里也给出了类似的解释：**webpack 4 有着比 dll 更好的打包性能**。

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOpRVT8uesWsAkpoaSKpH6XX37CGat8CbiaXibfw1cYVaSnTQkphJEicRzuw/640?wx_fmt=png)

所以说，如果项目上了 webpack 4，再使用 dll 收益并不大。我拿实际项目的代码试了一下，加入 dll 可能会有 1-2 s 的速度提升，对于整体打包时间可以说可以忽略不计。

Vue 和 React 官方 2018 都不再使用 dll 了，现在 2020 年都快过去了，所以说**我上面说的都没用了，都不用学了**，是不是感觉松了一口气（疯狂暗示点赞）？

5. 比 DLL 更优秀的插件
---------------

dll 构建加速不明显了，有没有更好的替代品？在 AutoDllPlugin[7] 的 README.md 里，给我们推荐了 HardSourceWebpackPlugin[8]，初始配置更简单，只需要一行代码：

```
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');module.exports = {  // ......  plugins: [    new HardSourceWebpackPlugin() // <- 直接加入这行代码就行  ]}
```

这个插件加速有多明显呢？我拿本文的试例代码测试了一下，下图是常规的打包时间，大概 900 ms：

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOpBSxNfgWPwmVc6tYgicAiaiaXaQAgZMmUCbHkAuPaBmW2MziaOqZfbwxQxA/640?wx_fmt=png)

加入 dll 优化后，打包时间为 507 ms，缩短了 400 ms 左右：

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOp6eict3I9O3bszSCicvIicmkHajqvtricayg6Mia04NTBO6CeicPaWZiaMGqng/640?wx_fmt=png)

只使用 HardSourceWebpackPlugin，再次打包时间缩短到 253 ms：

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOp4wEianAOGxDvicX7Jj3xmGE3icNI9VcEmiaXEvycB9Cl0icp57ryddmMMGQ/640?wx_fmt=png)

看相关的文档 [9]，貌似这个技术直接放到了 webpack 5 里，开箱即用。所以，虽然 dll 的配置你不用学了，但是 **webpack 5 is coming**......

![](https://mmbiz.qpic.cn/mmbiz_png/8MK8X2XQgu4FHj5sE4QxFgJqAjIHpDOpXCEkfKp6ice2TFGT8qeibDzxu52SO0Mm46lxxqhHRG7AgjqDqGH5LcpQ/640?wx_fmt=png)webpack 5.1.1

6. 写在最后
-------

这篇文章很难说它是一篇教程，更多的是记录了我学习 webpack 中的一个探索过程。说实话我把 dll 手动配完觉得我挺 nb 的，这么复杂的配置我都能配好。

当我后续找到 `autodll-webpack-plugin`，并发现在 webpack 的构建加速领域 dll 已经被抛弃时，其实还是有些失望，觉得自己的之前的努力都白费了，不由自主产生 `学不动` 的想法。但是当我仔细想了一下 dll 的原理，发现也就是那么一回事儿，拿空间换时间，只不过配置复杂了一些。

所以这也提醒我们，学习新知识的时候，不要专注于流程的配置和调参。因为**流程终会简化，参数（API）终会升级**。要抓大放小，把精力放在最核心的内容上，因为核心的思想是最不容易过时的。

7. 参考阅读
-------

面试必备！webpack 中那些最易混淆的 5 个知识点 [10]

webpack 官方文档 [11]

autodll-webpack-plugin[12]

HardSourceWebpackPlugin[13]

### 参考资料

[1]

源代码: _https://github.com/skychx/webpack_learn/tree/master/optimization_

[2]

维基百科: _https://zh.wikipedia.org/wiki / 动态链接库_

[3]

源代码: _https://github.com/skychx/webpack_learn/tree/master/optimization_

[4]

autodll-webpack-plugin: _https://github.com/asfktz/autodll-webpack-plugin_

[5]

issue: _https://github.com/vuejs/vue-cli/issues/1205_

[6]

PR: _https://github.com/facebook/create-react-app/pull/2710_

[7]

AutoDllPlugin: _https://github.com/asfktz/autodll-webpack-plugin_

[8]

HardSourceWebpackPlugin: _https://github.com/mzgoddard/hard-source-webpack-plugin_

[9]

文档: _https://github.com/webpack/webpack/issues/6527_

[10]

面试必备！webpack 中那些最易混淆的 5 个知识点: _https://juejin.im/post/5cede821f265da1bbd4b5630_

[11]

webpack 官方文档: _https://webpack.docschina.org/guides/_

[12]

autodll-webpack-plugin: _https://github.com/asfktz/autodll-webpack-plugin_

[13]

HardSourceWebpackPlugin: _https://github.com/mzgoddard/hard-source-webpack-plugin_

送你一本源码学习指南

加入专业 React 进阶群![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SQxNrPh7FwNylBx0k9PpYzVnHpMZgPlkxsVJrOianRy5uniacAlceHn24IY8NibOYkqPiaE6oJBQtfHVA/640?wx_fmt=png)