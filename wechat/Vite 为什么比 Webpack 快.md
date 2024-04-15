> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/o6cWOibGnHVpPUaqUV1cHA)

> 本文作者为 360 奇舞团前端开发工程师

一. 引言
-----

Vite 和 Webpack 作为两个主流的前端构建工具，在近年来备受关注。它们的出现使得前端开发变得更加高效和便捷。然而，随着前端项目规模的不断增大和复杂度的提升，构建工具的性能优化也成为了开发者关注的焦点。在性能方面，Vite 相比于 Webpack 表现出了明显的优势，尤其是在本地开发时冷启动速度、HMR 性能和构建速度等方面。本文将深入解析 Vite 为什么比 Webpack 更快的原因，并探讨其背后的技术实现。

二. 构建方式
-------

1.Webpack

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEDGLPVlbhReY68t392oibyHicoUY1GIlWMuBq065re47UwR6x9pbv9ePMnAGgqnp5Wr63jbjImB8qYw/640?wx_fmt=jpeg&from=appmsg)image-20240310161017787

上图是 Webpack 在本地启动项目时的一个过程表示，当你使用 Webpack 打包一个项目时，通常会生成一个或多个 bundle 文件，这些文件包含了你的应用程序所需的所有代码、样式和资源。然后，你可以在 HTML 文件中通过 `<script>` 标签引入这些 bundle 文件，从而加载你的应用程序。但是随着项目规模的增大，通常会有更多的模块需要打包。Webpack 需要扫描整个项目的依赖图，并分析模块之间的依赖关系，这个过程会变得更加复杂和耗时。

2.vite

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEDGLPVlbhReY68t392oibyHicpFxboPx8LIz8flXibibhYCxU5rCVEhb1k7EK76HnIe05pSqKj9AOrNXg/640?wx_fmt=jpeg&from=appmsg)

我们通过上图，可以看到本地启动一个 Vite 项目时，和 Webpack 有一些不一样了，Server 服务一开始就启动，然后通过网络请求去加载对应了文件。Vite 的构建特点，我们可以用下面几点来概括。

**基于浏览器原生 ES 模块支持**：Vite 利用了现代浏览器对 ES 模块（ESM）的原生支持，采用的是一种 no bundle 的策略，当使用 Vite 启动项目时，它会将每个模块都作为一个独立的文件提供给浏览器，而不需要像传统的打包工具（如 Webpack）那样先将模块打包成一个或多个 bundle。这样一来，浏览器可以更快地加载和解析这些模块，从而实现了快速的冷启动速度。

**即时编译（Instant Compilation）**：Vite 采用了即时编译策略。当浏览器请求一个模块时，Vite 会即时地将该模块编译成浏览器可执行的代码，并将编译结果缓存起来（我们在 node_modules 下可以找到一个. vite 文件）。下次再次请求同一模块时，Vite 可以直接返回缓存的编译结果，而不必重新编译，从而避免了冗余的编译过程，大大提高了启动速度。

**esbuild 预构建依赖：**Go 语言编写的快速、轻量级的 JavaScript/TypeScript 构建工具，比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。

三. 热更新
------

Webpack 的热更新机制是通过 webpack-dev-server 提供的功能来实现的。webpack-dev-server 是一个开发服务器，用于在开发过程中提供快速的开发体验，包括热更新、自动刷新等功能。

Webpack-dev-server 的热更新机制是基于 WebSocket 技术实现的。当你启动 webpack-dev-server 时，它会创建一个 WebSocket 服务器，与浏览器端建立连接。然后，webpack-dev-server 会监视项目文件的变化，并将这些变化推送给浏览器端，浏览器端收到变化后会执行相应的更新操作，从而实现了热更新的效果。

具体来说，webpack-dev-server 的热更新机制包括以下几个步骤：

1.  **创建 WebSocket 服务器**：webpack-dev-server 在启动时会创建一个 WebSocket 服务器，并与浏览器端建立连接。
    
2.  **监听文件变化**：webpack-dev-server 会监听项目文件的变化，包括入口文件、模块文件、样式文件等。
    
3.  **构建更新模块**：当文件发生变化时，webpack-dev-server 会重新构建变化的模块，并生成更新的代码。
    
4.  **推送更新信息**：webpack-dev-server 将更新的模块信息通过 WebSocket 推送给浏览器端。
    
5.  **浏览器端处理更新**：浏览器端接收到更新信息后，会根据更新的模块信息执行相应的更新操作，例如重新加载模块、更新页面内容等。
    

而 Vite 也使用了 WebSocket 技术来实现与浏览器的通信。当有模块变化时，Vite 会通过 WebSocket 将更新信息推送给浏览器端，从而触发浏览器端的模块重载。这样看起来，它和 Webpack 似乎没有什么不同，但是根据 Vite 官网的说法，在 Vite 中，HMR 是在原生 ESM 上执行的。当编辑一个文件时，Vite 只需要精确地使已编辑的模块与其最近的 HMR 边界之间的链失活（大多数时候只是模块本身），使得无论应用大小如何，HMR 始终能保持快速更新。从官网的解释中我们可以理解为，Vite 因为支持 ESM 的能力，使得它比 Webpack 拥有更小粒度的热更新能力。

四. 生产环境
-------

在生产环境下，二者的打包，构建时间就没有这么大的区别了，因为在生产环境下 Vite 仍需要通过 Rollup 将代码打包。主要是基于以下几点考虑。

1.  **兼容性**：尽管现代浏览器对 ESM 模块有很好的支持，但在生产环境中仍然需要考虑到旧版浏览器的兼容性。为了确保应用在所有浏览器中都能正常运行，需要将 ESM 模块转换成兼容性更好的 JavaScript 代码，通常是通过打包工具进行转换和优化。
    
2.  **性能优化**：在生产环境中，需要对代码进行一些性能优化，如代码压缩、合并、分割等，以减小代码体积、加快页面加载速度。通过打包工具，可以将多个模块合并成一个或多个 bundle，并对代码进行压缩和混淆，以减小文件体积。
    
3.  **资源管理**：除了 JavaScript 代码外，现代的前端应用还包含许多其他类型的资源，如样式表、图片、字体等。打包工具可以帮助管理这些资源，将它们进行优化、压缩，并生成适当的 URL 地址，以便在生产环境中有效地加载和使用这些资源。
    
4.  **部署和发布**：在生产环境中，需要将应用部署到服务器上，并且通常会对代码进行一些配置和优化。通过打包工具，可以方便地生成部署所需的静态文件，并进行一些配置，如路径设置、缓存控制等，以便于部署和发布应用。
    

五. 总结
-----

Vite 在本地能更快的根本原因，是借用了浏览器原生 ESM 能力，从而跳过了生成 bundle 的时间，再加上能够不依赖第三方插件将编译结果缓存，而且 esbuild 自身的也有着更快的运行速度，从而实现了 Vite 快速的冷启动。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)