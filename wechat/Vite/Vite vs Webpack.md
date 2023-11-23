> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_Xz8M_AwSsPP8NmeAAUWYQ)

> 本文作者为奇舞团前端工程开发师
> 
> 原文作者：Shawn Wildermuth
> 
> 原文地址：https://www.vuemastery.com/blog/vite-vs-webpack/

Vite 或 Vue CLI：选择哪一个
--------------------

随着 Vue 生态系统的成熟，已经引入了许多新技术。虽然一些开发人员可能从一个普通的 JavaScript 文件开始，并在页面中包含 Vue。但随着时间的推移，在开发 Vue 应用程序时，使用打包工具和命令行界面成为更加标准的开发流程。

Vue 不会强制你选择某种开发、打包方式，但 vue 的生态系统提供了许多工具，例如 Vue CLI 和最近的推出的 Vite js。那么你应该使用 Vite 还是 Vue CLI？在做出选择的时候，了解 Vite 和 Vue CLI 之间的区别会对我们有很大的帮助。

在本文中，我们将深入探讨 Vite 与 Vue CLI，以便你可以根据自己的需求做出最佳选择。

Vue CLI 是如何工作的？
---------------

Vue 命令行界面 (CLI) 围绕 Webpack 创建一个包装器来编译你的 Vue 项目。但是我们为什么要编译它呢？在 Webpack 和 Rollup 这样的打包工具出现之前，我们只需要将我们的 JavaScript 文件部署到服务器并将它们全部包含在一个页面上。当我们的项目很小的时候，这种效果很好。但是随着 Vue 的发展，我们开始需要某种程度的打包功能。单文件组件 (SFC) 和 TypeScript 的使用都需要借助打包工具来构建我们的项目。这就是为什么要引入 Vue CLI 。

Vue CLI 允许我们在开发和生产期间创建和构建项目。CLI 隐藏了 Webpack 的复杂配置细节，并在开发和生产过程中为我们的项目提供服务。但是，如果我们想要将它与 Vite 进行比较，那就让我们再深入一点。

### Webpack

正如 Webpack 网站所描述的，Webpack 是一个静态模块打包工具。但是，这是什么意思？Webpack 的主要目标是获取你的 Web 项目的资产并将它们打包到少量文件中以供浏览器下载。这并不意味着立即加载项目的所有文件，也可以按需下载。

虽然 Webpack 可以打包非代码资产，但它真正的闪光点是打包相关的代码。你可以认为打包就是简单地将所有代码文件（例如 JavaScript/TypeScript）合并在一起，但实际上这里还有更多的内容。

Webpack 处理代码中的 imports/require 语句时，只包含实际需要的文件。此外，它经常进行 “tree-shaking”，这可以删除实际上从未引用过的代码块（例如类、函数）。通过这种方式，Webpack 可以非常高效地打包你的项目。但是，如果我们正在研究 Vue CLI（包含 Webpack）与 Vite 的比较，我们需要继续看看在开发时会发生什么。

### 开发过程中的 Webpack

在 Vue CLI 中，Webpack 用于模块绑定。在开发时也会发生这种绑定。当你通过 CLI 开发 Vue 项目时，它会指示 Webpack 以增量方式构建项目并监听更改，以便它可以将更改的文件打包并在浏览器中进行替换。因为构建包是增量的，所以它可以在你开发项目时快速的将更改同步。第一次构建项目时可能会较慢（即 3 秒或更长时间，具体取决于你的项目大小），但一旦项目启动，增量更改的同步会非常快（即 < 1 秒，通常小于 100 毫秒）。

Vite js 是如何工作的？
---------------

如果你是 Vite 的新手，我建议直接从它的创造者尤雨溪那里学习，他在 Vue Mastery 的课程 “使用 vite 快速构建” 中教我们关于 Vite 的知识。

如果你看过该课程的第一课（它是免费的），你将了解如何开始，但在我们将其与 Vue CLI 和 Webpack 进行比较之前，我们需要了解 Vite 的工作原理。

当你创建一个基本的 Vite 项目（在我们的例子中，是 Vue 3 的 Vite 项目）时，**index.html** 文件是非常基本的：

📄 **index.html**

```
<!DOCTYPE html><html lang="en">  <head>    <meta charset="UTF-8" />    <link rel="icon" type="image/svg+xml"           href="/vite.svg" />    <meta ></script>**  </body></html>
```

你会注意到这与 Vue CLI 看起来很相似，但有一个主要例外：`script`标记使用`type="module`“。除非你使用 TypeScript，否则这里没有真正的构建步骤。`src`脚本指向你的实际源代码文件。

当这个请求传入时，它会将 **main.js** 文件作为原生 ES 模块发送到浏览器。这意味着它根本不会打包你的代码。实际上，源文件只是一个简单的 Vue 启动文件：

📄 **main.js**

```
import { createApp } from 'vue'import './style.css'import App from './App.vue'createApp(App).mount('#app')
```

这里发生了什么？Vite 正在利用原生 ES 模块和动态 ESM 模块，以便根据需要将代码注入浏览器。本质上，项目中的每次导入都会强制浏览器根据需要加载每个有效负载。这些导入将级联以获得特定情况下所需的所有代码。

这意味着在开发过程中， Vite 不但为你的网站提供服务，并且它也支持动态加载（在支持它的新浏览器中，并且也兼容旧浏览器）。

此外，Vite 在你开发项目时使用模块热替换 (HMR) 来更新修改的代码。使你能够在开发时获得即时的启动速度，这会大大提高开发体验。

但是 Vite 是如何在生产环境中实现这一点的呢？让我们来看看。

### Vite 和生产环境

虽然 Vite 在开发过程中使用其提供文件的能力来加速该过程，但 Vite 本身并没有真正打包你的项目。相反，它依赖于一个名为 "Rollup" 的打包程序来进行实际的打包。

通过使用 Vite 中的`build`命令，它将使用`rollup`来构建你的项目：

📄 **命令行**

```
> vite build
```

这将构建项目，生成几个文件（使用校验和以避免缓存的影响）：

📄 **命令行**

```
vite v3.0.9 building for production...✓ 16 modules transformed.dist/assets/vue.5532db34.svg     0.48 KiBdist/index.html                  0.44 KiBdist/assets/index.43cf8108.css   1.26 KiB / gzip: 0.65 KiBdist/assets/index.3ee41559.js    52.82 KiB / gzip: 21.30 KiB
```

与 Vue CLI 非常相似，Vite 允许通过配置文件配置 Rollup（配置文件具有非常合理的默认值）：

📄 **vue.config.js**

```
import { defineConfig } from 'vite'import vue from '@vitejs/plugin-vue'// https://vitejs.dev/config/export default defineConfig({  plugins: [vue()],  build: {    sourcemap: true,    outDir: "public/build/"  }})
```

例如，设置`sourcemap`和`outDir`，都直接传递给 Rollup 进行配置。`vite.config.js`中的选项允许你在必要时对 Rollup 进行深入配置。

因此，使用 Vite 实际上为你提供了两种不同的体验：在开发时的快速调试体验；遵循 Rollup 规范，允许你以想要的方式构建项目。

当 Vite 使用`Rollup`时， `Rollup`不是必需的。你可以使用任何你想要的打包工具代替 Rollup 来构建你的 Vue 项目。

Vite 或 Vue CLI：我应该选择哪个？
-----------------------

这个问题没有一个明确的答案，_Vite 还是 Vue CLI 哪个更好？_

但我想把它分成两个不同的讨论：在**开发**中使用和在**生产**中使用。

### 开发时

Vue CLI（以及扩展的 Webpack）和 Vite 的整体体验在开发过程中可能是相似的。两者都增量构建你的项目并使用模块热替换来替换运行的项目中改动的代码。

两者的区别归结为速度。Webpack 从源代码构建项目，并在开发项目时持续进行增量构建。

另一方面，Vite 会根据需要将实际代码加载到浏览器中。这意味着不需要太多源代码的映射，因为在浏览器中运行的代码就是你正在使用的实际代码（和文件）。这意味着，在大多数情况下，你会发现 Vite 比 Vue CLI 提供更快速和直接的开发和调试体验。在 Vue CLI 中，你调试的是 Webpack 生成的代码（通过使用源代码映射），而不是调试的你正在编写的代码。

另一个好处是 Vite 不依赖于 Vue.js。Vite 可以在不同的环境中使用：纯 JavaScript、React、PReact 和 SvelteKit。因此，如果你在多个环境中工作，则可以更轻松地使用（和配置）一个工具来处理不同的项目。

### 生产时

Rollup 类似于 Webpack（以及 Parcel，另一个流行的打包工具），尽管它们的工作_方式_有点不同。

Webpack 基于 CommonJS API 来管理 JavaScript 模块。即使 Webpack 支持 ES 模块，底层构建系统仍然希望模块可以动态加载（因为`require()`只有在函数执行时才导入模块）。

相比之下，Rollup 依赖于 ES 模块，这意味着它可以比 Webpack 更轻松地进行静态分析，尽管这种差异非常小。但是，使用 Rollup 需要你具有支持 ES 模块的依赖项。这可能会给不支持 ES 模块的库带来一些问题，但这些库现在越来越少了。

最终，由你来决定
--------

虽然我不能为你做决定，但我希望我已经列出了这两种方法的优缺点。我通常将 Vite（带有 Rollup）用于新项目，但我没有看到足够的好处来吸引我将现有的所有 Vue CLI 项目迁移到 Vite。

在某些时候，这不太重要，因为尤雨溪曾表示，它们会在某个时刻趋于一致（例如，在 CLI 中用 Vite 替换 Webpack）。但就目前而言，这还没有发生，两种方法都得到了很好的支持。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)