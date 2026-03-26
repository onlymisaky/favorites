> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qkXbVJd0xYs8p-FU-njfsw)

![](https://mmbiz.qpic.cn/mmbiz_gif/AAQtmjCc74DZeqm2Rc4qc7ocVLZVd8FOASKicbMfKsaziasqIDXGPt8yR8anxPO3NCF4a4DkYCACam4oNAOBmSbA/640?wx_fmt=gif)

**目录**

一、实践背景

二、业界方案

三、技术选型

四、方案设计思路

    1. 方案难点

    2. 通过扩展插件命令实现 Rspack 构建

    3. 官方平替插件 + 少部分自研扩展支持原有插件能力

    4. 基于配置映射实现业务超低接入成本

    5. 方案架构 

    6. 稳定性保障

五、方案效益

六、分享过程中的一些干货

    1. 支持 ts/tsx

    2.React HMR

 3. Module Federation

    4. 样式按需引入：babel-plugin-import

 5. cssModules：auto-css-modules

    6. 影响编译效率的 devtool: "source-map"

    7. 可能你不知道的低效代码

七、未来规划

八、特别说明

**一**

**实践背景**

随着项目的逐步迭代，代码量和依赖的逐渐增长，应用的构建速度逐步进入缓慢期。以目前所在团队的业务应用来看（使用 webpack 构建），应用整体构建耗时已经普遍偏高，影响日常开发测试的使用效率，其中编译耗时大约占 50%。

实际上随着近些年前端的技术发展以及业务对前端交互体验的要求提高，前端整个代码量复杂度和代码量增长飞快。随着这一趋势的变化，服务于前端工程构建方案多年的 webpack，在构建效率上已经逐渐成为瓶颈。因此业界也存在不少优化思路和方案，主要分两个方向：

*   基于原有 Node.js 语言实现，通过缓存等方案来提升构建效率，主要是缓存、预构建的方式来减少编译。此类方案多数存在条件限制，比如缓存方案前提是第一次先生成缓存来提升二次构建效率，对于发布平台等需要冷启场景无法生效。
    
*   另外一类是采用 Golang、Rust 等语言重新实现耗时较为复杂的编译过程，从语言层面实现编译过程的性能提升。比较有代表的有，基于 Golang 实现的 esbuild、基于 Rust 实现的 SWC，都在对应的场景得到不少的性能提升。
    

**二**

**业界方案**  

既然是业界的普遍性问题，那么外界也肯定会存在不少优化案例可以借鉴或者复用。由于 Node.js 的优化方案通常都会存在各种场景限制，这里我们主要从另外一个思路去寻找方案。经过调研目前业界的主要方案有 Rspack、Vite、Turbopack、swcpack 相对比较有代表性（可能还有其他方案，由于笔者时间精力有限未能了解到）。几个方案主要的情况如下（笔者个人主观分析，仅供参考）：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaD2OUB6NMtccPQau9rRFJFavwRcxMtk1YpoibNQEuRSPxR05rntvbJcSg/640?wx_fmt=png&from=appmsg)

**三**

**技术选型**

先看当前大仓前端应用主要技术体系：整体技术栈主要是 React 为主，未来 Vue 还会逐步迁移 React；框架层面 UmiJS@4 大概占 60%、UmiJS@v3 大概占 20%、剩余为其他 Vue 或者 C 端的多页应用。整体技术体系主要是 UmiJS 为主，配套主要是 webpack 的构建方案，部分 Vue 项目有使用 Vite。

在这样的现实情况下，我们面对的主要是 React+UmiJS+webpack 的应用。基于应用广泛性考虑，只要解决这部分应用就可以达到 80% 的应用提速覆盖。为此，我们选择了基于 Rspack 来实现构建方案的性能提升，主要考虑有以下几点：

*   高性能：基于 Rust 实现核心能力，全量编译 + 增量编译（HMR）的实现方式，官方宣称实际落地有 5~10 倍的提升，随着未来逐步优化完善还有提升空间，且生产和开发阶段除缓存之外，基本可以获得一致性的性能收益。  
    
*   低成本：Rspack 大量兼容 webpack 生态，大量配置和插件可以直接或者调整一下配置即可复用，仅需对一些特殊的插件自研定制开发即可。以下是对项目主要使用到的 webpack 能力进行了梳理，并对其在 Rspack 中的情况情况也进行了对照。  
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaD6dM3eTLa6zxutusUZXkTj8fia79EAHQxbSFwkrbvDeV5ictd05oUZ3eg/640?wx_fmt=png&from=appmsg)

综合情况来看：虽然性能 Rspack 未必是最高的，但其兼容 webpack 生态带来的低成本迁移，是其他的方案基本上无法做到的。对此，选择了基于 Rspack 来作为基础的底层能力。得益于此，我们最终实现了业务代码零改动即可实现构建方案迁移（仅微调构建配置），并获得云构建 2 倍 + 编译性能的提升。

**四**

**方案设计思路**

由于大仓目前大量的应用为 UmiJS@4 体系，作为我们主要服务的目标对象，本文也是主要先针对解决 UmiJS@4 版本的应用方案。

**方案难点**

*   UmiJS 仅支持 webpack 和 Vite 两种构建模式，如何扩展 Rspack 构建？
    
*   业务应用中有大量使用 UmiJS 插件、Babel 插件来实现一些特殊能力，如何支持此类插件的能力？
    
*   如何尽可能降低业务应用接入成本，进而达成方案快速应用到各个业务应用中？
    

**通过扩展插件命令实现 Rspack 构建**

UmiJS 默认构建能力是封装在 @umi/max 内部，通过 max dev/build 来调用内置配套的本地 / 生产构建。在 UmiJS 官方上并未提供编译能力的完全自定义扩展能力，仅支持 Vite/webpack 的选择以及提供了一些修改构建配置的方法。

通过查看 UmiJS 项目的源码，发现其内部的构建实现全部集中在 dev/build 这两个扩展命令中。源代码在 preset-umi/src/commands / 目录下的 dev/dev.ts 和 build.ts 两个文件，分别对应 dev 和 build 命令。而实际上的构建逻辑，实现上主要是在 @umijs/bundler-vite 和 @umijs/bundler-webpack 两个包中。其内部执行的主要逻辑如下（这里以 dev 模式为例，build 模式基本上类似，就是少了文件监听编译和 express 相关逻辑）：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDKbWHAQlm4RuOdic2gS40oJUae32IRiaJ8yP6AskVIM1kBeWEEGP9TL2Q/640?wx_fmt=png&from=appmsg)

那么我们只需要在新的命令中实现相关的逻辑，即可通过扩展命令的方式来扩展 Rspack 构建能力。另外，使用该方法实现，还能沿用 UmiJS 原本的代码生成等原本的插件，进而可以避免需要大量重新实现 UmiJS 插件的能力，并降低重写带来的逻辑不一致风险。

**官方平替插件 + 少部分自研扩展支持原有插件能力**

前面的插件扩展模式已经能保证原有大量的 UmiJS 能力是可以直接沿用的，比如生成路由、添加 tailwind.css 等 UmiJS 内置能力都可直接沿用。另外项目主要依赖扩展的插件，除了少部分修改构建能力的插件之外，基本上都可以直接使用或者少量适配即可。不兼容的几个插件主要是因为：功能是通过修改的 webpack 配置来调整构建能力，需要通过使用对应的 Rspack 构建能力来进行兼容。  

另外除了 UmiJS 的插件之外，还有构建依赖的 Babel 插件部分，当然部分 Babel 插件也是通过 UmiJS 插件引入使用的。对此，也对主要的 Babel 插件的情况进行了梳理，其主要的情况如下表：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDdtNA15JgRvnf9lbiclfibmeQk0cw7pb2wZrWCWj1gfB50pFkh63AAib0Q/640?wx_fmt=png&from=appmsg)

所以整体上还是以沿用 webpack 原有扩展加 Rspack 官方能力替换为主，只需要针对少部分未支持的 Babel 插件进行扩展即可实现。

**基于配置映射实现业务超低接入成本**

想要达成方案可以快速应用的理想效果，就是让应用接入过程中尽可能少改内容，特别是业务代码。因为一旦要改业务代码逻辑，这种就会增加非常多的接入成本，所以在方案设计上，构建能力以及原本 UmiJS 的相关配置能力要尽量去沿用并且满足基本上不需要业务侧同学去感知差异化的内容。

带着这个需求并结合前面的几块内容分析来看，大多数内容都是有平替方案，少部分需要进行自定义开发扩展，主要也是集中在 Babel 插件上。那么我们需要做的就是维持 UmiJS 转换生成 webpack 的配置逻辑不动，在拿到 webpack 配置之后，再对 webpack 的配置做解析通过一个配置转换器对需要转换成 Rspack 的内容进行转化，对原本兼容的配置直接迁移使用即可实现我们的目的。

**配置 & 能力映射示意图：**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDSkePzTHjTSoM7BW90MzDkiclvYdLcAnZZSl3hThIlIEM1NUF9SeXUuw/640?wx_fmt=png&from=appmsg)

**方案架构**

结合以上的问题解决思路以及目标，最终方案的架构设计如下：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDNNu2UicjKhJjKRzJ3zI6mkO4ia0QRQFD7n8jA5qkzKdlwUsh8icqRe23A/640?wx_fmt=png&from=appmsg)

架构要点说明：

*   通过扩展自研插件，提供自定义的 rspack-dev 和 rspack-build 命令来提供开发、生产模式，接入时仅需要安装插件并替换启动命令即可（举个例子：package.json 中修改 max dev 为 max rspack-dev）。
    
*   通过插件内部对配置进行转化，将原本 UmiJS 的配置转为 Rspack 配置，保障业务应用接入时基本不感知。另外在开发成本方面，由于大多数 loader 和 plugin 可以复用，主要是配置和 loader 等能力替换映射成本。
    
*   方案基于 UmiJS 的 max 扩展，原本 UmiJS 的扩展能力不受影响。业务高使用率 Babel 插件有现成的 SWC 扩展能力可直接替换（比如：Babel-plugin-import、svgr 等），少部分自研插件需要使用 Rust 重写。  
    

  

**稳定性保障**

切换构建之后，less/postcss 插件是一致的，主要风险来自于两个方面：

*   webpack 转 Rspack：Rspack 项目内平移了大量的 webpack 测试用例用于保障一致性，另外默认严格模式，出现不兼容配置会抛出错误中断构建，保证了基础方面的稳定性。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDOL17CmTZ9A8sU2wf94wbfxRysDOZj4KYeUvlP1uxcdBHrr85FatfmA/640?wx_fmt=png&from=appmsg)

*   Babel（v7）转 SWC：SWC 支持所有 stage 3 perposals 、preset-env，JS/TS 语法编译能力上跟 Babel 7 对齐。在插件生态上不一致，若有使用 Babel 插件，需要考虑替换方案（详情参考前文中的 Babel 插件使用情况）。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDgYicRfYlm10coqX6d8fSNbMLIhyDgHSEKp7sQkicm5ls7lVyKaN4hcUA/640?wx_fmt=png&from=appmsg)

虽然**在 Rspack 方面申明已经兼容了主流的内容**，但毕竟是替换了构建方案，对业务来说还是存在一些未知的风险，还是需要一些手段来进行保障业务应用的稳定性。

**稳定性保障手段：**

*   **构建报错中断策略**：配置上出现不支持的 Babel 插件直接报错中断构建，避免未支持的内容被跳过进而导致异常发布上线。  
    
*   **阶段推进落地策略**：由于大多数构建运行都是在开发测试阶段（粗略统计平台发布 70% 左右为测试环境），先行接入开发 & 测试环境达到构建效率提升，等开发测试阶段跑稳定之后，再从非核心应用开始试点上线，功能稳定之后再逐步推广。  
    
*   **极简的应急恢复策略**：由于极低的接入成本，若接入遇到问题想快速回退也非常简单，仅需回退命令为 dev/build 即可完成应急恢复。  
    

**五**

**方案效益**

**实现超低接入成本**：仅需改动三个小步骤，一两分钟即可完成接入。具体步骤如下：  

*   添加并安装依赖：添加并安装 @umijs/plugin-rspack 依赖（得物私有 npm 包）。
    

```
dx add @umijs/plugin-rspack@latest -D
```

*   添加 UmiJS 的 plugin：在 config/config.ts 中修改 plugins 属性。
    

```
{
    // 原有其他配置
    ...
    plugins: [
        // 原有其他插件
        ..., 
        // 添加 @umijs/plugin-rspack 插件
        '@umijs/plugin-rspack',
    ],
    // 原有其他配置
    ...
}
```

*   修改构建命令：修改 package.json 中的构建命令，将对应环境的命令调整为 rspack-dev/rspack-build，并增加 NODE_ENV 配置。
    

```
{
    "scripts": {
        // start 对应支持本地的dx dev，
        // 原配置样例
        - "start": "cross-env BUILD_ENV=dev max dev",
        // 改rspack构建样例
        + "start": "cross-env BUILD_ENV=dev NODE_ENV=development max rspack-dev",
        // pnpm:build:x 对应支持发布平台指定的环境
        // 原t1配置样例
        - "pnpm:build:t1": "cross-env BUILD_ENV=t1 max build",
        // t1改rspack构建样例
        + "pnpm:build:t1": "cross-env BUILD_ENV=t1 NODE_ENV=production max rspack-build",
        ... // 原先的其他配置，酌情进行调整
    }
}
```

**平均 2 倍 + 的编译性能提升**：大仓应用接入 17 个应用（目前主要是接入开发、测试环境），平均提升在 2 倍以上。以自身负责的一个应用为例，原有 webpack 编译耗时 150 秒，接入后降低到 40 秒（减少 73.33%），加上优化过程中去除部分无用的引入代码最终仅需 20 秒左右。

**六**

**分享过程中的一些干货**

这里主要结合 UmiJS 所需要的能力，分享一些 UmiJS 涉及到的 Rspack 用法以及过程中一些比较典型的内容。

**支持 ts/tsx**

ts/tsx 的支持主要依靠的是 swc-loader，Rspack 使用了 Rust 定制的 builtin:swc-loader，其使用方式基本上是跟 webpack 的 swc-loader 一致的，详情可以直接参考 swc-loader 文档，这里主要体现一些常用的配置项，具体使用可以结合自身项目情况来调整。

```
export default {
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        loader: 'builtin:swc-loader',
        options: {
          env: {
            // 浏览器兼容性，支持browserslist，详细可以参考：https://swc.rs/docs/configuration/supported-browsers#targets
            targets: {
              chrome: "80",
            },
          },
          // js/ts编译配置
          jsc: {
            parser: {
              // 开启ts编译
              syntax: 'typescript',
              // 开启tsx编译
              tsx: true,
              // 开启@装饰器编译
              decorators: true,
              // 动态import
              // dynamicImport: false,
            },
            transform: {
              // react运行环境配置
              react: {
                // dev模式打开development启动react的开发模式
                development: isDev,
              },
              // stage 1 的旧版本class decorators
              legacyDecorator: true,
              // 支持 ts emitDecoratorMetadata
              decoratorMetadata: true,
            },
          },
        },
      },
    ]
  }
}
```

**React HMR**

在看文档配置时，感觉不好理解，实际使用上其实分两种情况：

*   直接使用 Rspack 的 devServer 情况下，需要同时开启 devServer.hot 和 @rspack/plugin-react-refresh。如下配置：
    

```
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

export default {
    ... 其他配置
    devServer: {
        // 开启HMR，官方文档也有体现
        hot: true,
    },
    plugins: [
        ...其他插件
        // React热更新支持插件
        isDev && new ReactRefreshPlugin(),
    ]
}
```

*   若不使用 devServer 的情况下，需要用 rspack.HotModuleReplacementPlugin 来实现 devServer.hot 的能力。由于这种方式未在实践过程中进应用，这里不进行具体的使用举例。
    

**Module Federation**

Rspack 提供了两个版本的模块联邦能力，官方文档主要是介绍的 v1.5 对应的是经过 Rspack 改良过的版本。但实际上在一些情况下，如果直接跟 webpack 的 MF 对接会存在一些问题。我们在第一次使用过程中，也是对接了默认的 v1.5 版本，就出现了公共依赖无法找到的问题，错误提示如下：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDTFoApr0tmjNs7Ib2aysRNwJG7N22T4zJgmUPOXtmobicOe0qJKGcibqw/640?wx_fmt=png&from=appmsg)

实际上若需要跟 webpack 项目对接的情况下，需要采用 v1.0 版本的 MF 插件，使用方法如下：

```
import { container } from '@rspack/core';
export default {
    ... 其他配置
    plugins: [
        new container.ModuleFederationPluginV1({
            ... 这里是mf的配置
        })
    ]
}
```

**样式按需引入：babel-plugin-import**

babel-plugin-import 作用：主要是配合 ant-design 或 poizon-design（基于 antd 定制主题）库来使用，通过插件识别 js 中依赖的组件，自动注入样式文件，进而实现 css 的按需引用。实现类似如下效果：

```
// 手写源代码
import { Button, Input } from 'antd';

// 通过插件编译后
import { Button, Input } from 'antd';
import 'antd/lib/button/style';
import 'antd/lib/input/style';
```

在 Rspack 中使用的是 swc 来进行 js/ts 解析的，故 babel-plugin-import 是不能直接使用的，需要采用 builtin:swc-loader 的 rspackExperiments 来进行对应的能力支持。其配置方法如下：

```
export default {
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        loader: 'builtin:swc-loader',
        options: {
          experimental: {
            // babel-plugin-import的配置
            import: [
              // pd按需注入样式
              { libraryName: 'poizon-design', libraryDirectory: 'es', style: true },
              // antd按需注入样式
              { libraryName: 'antd', libraryDirectory: 'es', style: true },
            ],
          }
        }
      }
    ]
  }
}
```

**cssModules：auto-css-modules**

在 UmiJS 中，默认是通过 auto-css-modules 来进行 css-modules 代码的判断；其原理为通过 ast 语法树，判断 import 引入样式文件时，若有声明对应的变量，就将其打上一个 query 标记。并在样式文件处理时，通过 resourceQuery 来进行匹配对应的文件，并添加 css-modules 的编译能力。详情见：UmiJS AutoCssModules 插件源代码、UmiJS CSS 编译配置源代码。

通过 UmiJS 项目以及结合一些资料，Babel 的 auto-css-modules 能力有 swc-plugin-auto-css-modules 可以替代，配置的话，主要几个关键点：

*   添加 swc-plugin-auto-css-modules 插件（实际上开源的插件并不能用，后文详细说明原因）。
    
*   添加 builtins.css 配置，指定 cssModules 编译时的方式，主要有样式名是否保持，输出的样式格式。
    
*   添加 resourceQuery 识别，并给对应的内容加 type: 'css/module'；Rspack 默认会对 type: 'css/module'的代码当做 cssModules 编译，这个用法会比使用 css-loader+style-loader 更方便。
    

具体配置实现参考如下：

```
const postcssLoader = {
  loader: require.resolve('postcss-loader'),
  options: {
    // ...此处省略less-loader配置
  }
};

const lessLoader = {
  loader: require.resolve('less-loader'),
  options: {
    // ...此处省略less-loader配置
  }
}

export default {
  builtins: {
    css: {
      // cssModule默认配置
      modules: {
        // class保持原样输出
        localsConvention: 'asIs',
        // class转换后的格式，localIdentName跟css-loader并不完全兼容，比如[hash:base64:5]这种写法就会报错
        localIdentName: '[local]_[hash:8]',
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)s(x)?$/,
        loader: 'builtin:swc-loader',
        options: {
          experimental: {
            plugins: [
              // ...此处其他配置内容
              // 添加 swc-plugin-auto-css-modules 插件执行?modules的注入
              [require.resolve('swc-plugin-auto-css-modules'), {}]
            ]
          }
        },
      },
      {
        test: /\.css(\?.*)?$/,
        oneOf: [
          {
            // 通过resourceQuery来匹配?modules
            resourceQuery: /modules/,
            use: [postcssLoader],
            // type声明指定为cssModules解析
            type: 'css/module'
          },
          {
            use: [postcssLoader],
            // type声明指定为普通css解析
            type: 'css'
          },
        ]
      },
      {
        test: /\.less(\?.*)?$/,
        oneOf: [
          {
            resourceQuery: /modules/,
            use: [postcssLoader, lessLoader],
            type: 'css/module'
          },
          {
            use: [postcssLoader, lessLoader],
            type: 'css'
          },
        ]
      },
    ]
  }
}
```

但实际上上述的配置并不能直接跑起来，运行时会提示构建报错（RuntimeError: out of bounds memory accesSS），错误如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDyOKtu1icYDQPzXEsRuDYia2cNpzuDEDgGnA9H81YRdC66GAnCTyFiarhw/640?wx_fmt=png&from=appmsg)

结合 github 上的相关 issue 最终定位为 swc_core 版本不兼容的问题导致。

原因详解：

*   Rspack 使用的 swc_core 为 0.88.x~0.89.x 对应 @swc/core 为 @swc/core@1.3.106~@swc/core@1.3.107(swc 官网可见)。  
    
*   swc-plugin-auto-css-modules 的 @1.6.0 虽然在文档上写着是兼容 >= 1.3.106 版本，但实际上由于其内部使用了 swc_core@0.90.13（详见 Github 源码）。  
    
*   但 swc 在 0.90.x 进行了 ast 的重构，跟之前的版本有了较大出入，导致无法生成的 wasm 调用无法兼容。
    

**问题解决办法**：实际上只要通过将 swc-plugin-auto-css-modules 的 swc_core 版本修改为 0.88.x~0.89.x 这个范围内，再编译出新的 wasm 文件即可解决；若有其他类似情况，也可以借鉴一下。

**具体操作步骤：**

*   将 swc-plugin-auto-css-modules 的 swc_core 修改版本后，在本地构建生成一个 wasm 文件，并放到项目内。
    
*   swc 的 plugin 修改为引入本地构建的 wasm 文件，其配置如下。
    

```
plugins: [
  // ...此处其他配置内容
  // 添加 swc-plugin-auto-css-modules 插件执行?modules的注入
  // 删掉原有的 swc-plugin-auto-css-modules 引入
  - [require.resolve('swc-plugin-auto-css-modules'), {}]
  // 修改为引入项目相对目录下的swc_plugin_auto_css_modules.wasm（因为开源的发版有发版周期，先进行自编译使用）
  + [path.join(__dirname, '../../swc-plugins/swc_plugin_auto_css_modules.wasm'), {}],
]
```

**影响编译效率的 devtool: "source-map"**

在以往使用 webpack 的 devtool 时，也能感受到有一定的性能开销；同时在 Rspack 中，官方文档中也有说明当 devtool 开启并设置 sourcemap 时有性能开销。官方文档：  

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDoT7PqN5iavhD2OicCXiaTHvAMkN6NSESUEfj1yHN96vlsSYZ3kicDSVeoA/640?wx_fmt=png&from=appmsg)

实际体验下来，source-map 的模式损耗确实是大，大约会增加 30% 的耗时，而其他一些模式在构建损耗上会有所优化，具体可视使用情况来选择建议在开发测试环境不使用，仅在线上等需要的环境开启。相同应用和机器环境，不同 devtool 的几种测试表现如下：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDM5Ytfzarebh6opIBpP8YHZRj0PvjkGlNSgt2NPZicN290b04jwMT3sg/640?wx_fmt=png&from=appmsg)

devtool: source-map（40.82s）

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDf92dDiaX4zdQtBsCEw3EsDhGsjw0IsJibTkhMdQw8t4d2mQyG4rh2lww/640?wx_fmt=png&from=appmsg)

devtool: cheap-module-source-map（39.46s）

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDPXXiaBWl2entQ39xfxXIfuKsiaZzpDXTTwFVk1QvmPMX3D8rdVIjoaxw/640?wx_fmt=png&from=appmsg)

devtool: eval（32.94s）

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaD2icNyqZDZMic42icicgoavBDuIXSCicrA65NQs86u9jcobUG0x9C3oDjTVA/640?wx_fmt=png&from=appmsg)

devtool: false (31.21s) 

**可能你不知道的低效代码**

在前面的内容中有提到 babel-plugin-import 按需引入的利器，但在业务项目中也有发现，应用 / 组件中有直接引入.../dist/antd.less 的情况。若在项目中有这种情况，实际上就是打包了多次 antd 的样式，非但没有作用反而让构建打包和应用访问性能更差。

以下为英特尔 i5 芯片差异情况（M2 等芯片在耗时上会缩小一些）：

在 css-moduels 中（比如：大多数页面 less、组件 less）：每引入一次，大约增加 6~7s 左右构建时间，css 文件大约增加 660kb。

在非 css-moduels 中（比如：global.less）：每引入一次，大约增加 4~5s 构建时间，css 文件大约增加 530kb。

📢📢📢：建议平时项目中排查注意一下，可以将此类代码进行删除，一个小小的习惯就可以直接提升不小的构建和访问性能。

**七**  

**未来规划**

整个项目过程下来，收获颇丰。一个是对前端构建以及 Rust 方面有了更多的认识，另外在接入过程中，也对当前的应用现状和技术体系由了更深入的了解。但当前项目主要服务于自身的业务的开发测试环境，使用范围还相对比较窄，还存在一些转换能力缺失的情况。未来将持续完善现有的构建转换能力，来拓展更多的业务应用场景。

**八**

**特别说明**

由于文章内的相关内容实践已经落地有了一段时间，文章内的一些内容可能已经发生了变化，若存在出入烦请以相应产品的官方介绍为准。比如：Rspack 的新版本已经升级了 swc_core 到 v0.91.x~v0.93.x 兼容了 swc-plugin-auto-css-modules 的 1.6.0 版本，Turbopack 计划未来全面支持 webpack 的相关工具特性等。

相关参考资料站点：

*   Rspack：https://www.rspack.dev/
    
*   UmiJS: https://umijs.org/
    
*   Webpack：https://webpack.js.org/
    
*   SWC：https://swc.rs/
    
*   Vite：https://cn.vitejs.dev/guide/
    
*   Turbopack：https://turbo.build/pack
    

**往期回顾**

1. [星愿森林的互动玩法揭秘｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527623&idx=1&sn=1eb79e88e2a2db776462507e430d7bd4&chksm=c1613998f616b08efd9bcd2cf1749369c938a1f614dad7511a9a7fe9cae51cd971a03e08dc59&scene=21#wechat_redirect)  
2. [StarRocks 跨集群迁移最佳实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527446&idx=1&sn=7454faec48e966fafaae2e26829e6a56&chksm=c1613949f616b05f1defbbd62dcbe9c33f03b4b43e9b28bb03b7fb3fafe5c5032e90298abf33&scene=21#wechat_redirect)  
3. [Apache Flink 类型及序列化研读 & 生产应用｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247527101&idx=1&sn=bee193b981bb15d10f65446a8f25e2a7&chksm=c1613fe2f616b6f42e89d413fcbb2ff6ec37837abf0de0b8b201720f6dcb8900e8a42441566f&scene=21#wechat_redirect)  
4. [可视化流量录制规则探索和实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525938&idx=1&sn=f72b5d3399c0abfbefc4a66367b849a9&chksm=c161336df616ba7bb5131cd3c3cbf2ffbd8b544e56c14cac9ad841f5b9054062c1f95c35b782&scene=21#wechat_redirect)  
5. [客服测试流水线编排设计思路和准入准出应用｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247525842&idx=1&sn=8ef60b41b54efe9db929266934a7905d&chksm=c161308df616b99ba004dadd99239b94f163d7f51d5082fae34ca429ea68da56b35bc60260bb&scene=21#wechat_redirect)

文 / 期越

关注得物技术，每周一、三、五更新技术干货

要是觉得文章对你有帮助的话，欢迎评论转发点赞～

未经得物技术许可严禁转载，否则依法追究法律责任。

“

**扫码添加小助手微信**

如有任何疑问，或想要了解更多技术资讯，请添加小助手微信：

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74AZqia3WDEBtQMbTTja3yLiaDnQUbEvcLKaF25akuFH5DKhevWvxM3ViavXmnUdhb6ZMQDOJBV7CibQ8g/640?wx_fmt=jpeg&from=appmsg)

**线下活动推荐**  

**快快点击下方图片报****名吧！**

![](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74DWMD3Odsul74bSMWmgIib8v1TBhicaXhmywwuO5CypjdZ5pic7T9tjoM584OjTibRFF2ZhP6NPlyCKoA/640?wx_fmt=jpeg&from=appmsg)