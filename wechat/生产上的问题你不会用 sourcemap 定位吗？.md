> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0Kzyhe4IKoMx3ws8z9ovoQ)

**前言**
======

> **欢迎关注《熊的猫》公众号，本公众号会定期分享技术干货！**

上周在群里突然被 `@` 要我查看生产上出现的问题，由于这个项目比较老 (**`React15`**)，既没有埋点也没有接入错误监控，于是会得到如下的这样一个提示信息（**以下错误是本地模拟的实际生产效果**）：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdh7Ns4OjbgQoS9OiaymeEB47ocvmIOQk9JmIVViarxvsygk1btzLj0Jicfw/640?wx_fmt=other)

当你想要直接点击链接定位时，就会看到如下的形式：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhJffsyHrrS1QDcQla8G1jTRED6PQqeIZ69y7weBLXD7ibsIcIUpZcBlg/640?wx_fmt=other)

这怎么说呢？**不能说一模一样，只能说毫不相关（`表面上`）**！

针对老项目再想加入埋点和错误监控可能就比较困难了，特别是当看到其中各种无法让你理解的写法和逻辑，加之不同开发人员的迭代开发，一直在往上堆 **x 山**（`保持优雅，该打码就打码`），就更加没法做什么进一步的优化了，只能说能跑就行，**不敢动，根本就不敢动！**

那么还剩下的能够快速帮助我们定位详细错误信息的方式是什么呢？没错就是本文的主角 **sourcemap**，这也是为什么会有本篇与 **sourcemap** 相关的文章。

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhavHfV8RdLhRhKs2Hk9X7BOdHVVHtpFNArvA2xNPxoTeu2Uqiak0w0bQ/640?wx_fmt=other)

文中若存在不正确之处，可在评论区斧正！！！

**sourcemap 的使用和规则**
====================

**sourcemap 是什么？**
------------------

简单的说，就是一个以 **`.map`** 为后缀的文件，例如：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdh4ZAzYzY22kAScYibibQAcr1RghK7NBWmLycVyfEzkILb7mHK5SkLxTww/640?wx_fmt=other)

而 **`.map`** 文件里面的内容以 **`json`** 形式存储了 **源代码** 打包转换后的位置信息，核心内容如下：

*   **version**：版本号，目前 `sourcemap` 标准的版本为 **3**
    
*   **file**：指打包构建后的 **`文件名`**，即 **`bundle`** 文件名
    
*   **sources**：指当前这个 **`bundle`** 文件所包含的所有 **`源码文件`**，因为存在分包等优化策略，一个 **`bundle`** 文件可能会包含 **`多个源码文件`** 的内容
    
*   **sourcesContent**：指上述 **`sources`** 中每个 **`源码文件`** 所对应的源码内容字符
    
*   **names**：指在代码在经历 **`混淆压缩`** 之前的 **`变量名`**，这个变量名包含 **`导入模块名`**、**`常用方法名`**
    
*   **mappings**：直接进行翻译就是 **`映射`** 的意思，即根据以上信息实现的源码代码位置和构建产物之间的一一映射关系
    
*   **sourceRoot**：指源码目录
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhvpzyxDlOzZnY9aLogDAEuWds5E6EDZIFYMZRyCUnoWomaEjwTW5PRw/640?wx_fmt=other)
    

**sourcemap 有啥用？**
------------------

上面已经提到了 **`.map`** 文件中以 `json` 形式存储的数据内容，就是包含着源代码与构建产物之间的映射关系，那么它的作用自然就是实现：**`运行时代码`** 和 **`开发时代码` 都能拥有相同准确的信息提示**。

常见的 **开发时代码提示**，如下：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhOf3K81KX9GmcDQv4Gv1bOZqibVPzP2oicxJ3rVBZW1GCZTm9mAdC80icw/640?wx_fmt=other)

常见的 **运行时代码提示**，如下：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdh7Ns4OjbgQoS9OiaymeEB47ocvmIOQk9JmIVViarxvsygk1btzLj0Jicfw/640?wx_fmt=other)

可见 **运行时代码提示** 的代码提示信息不够详细准确，而且以上只是简单的模拟了运行时错误，而实际项目中大多数的运行时错误是在不同的场景下才会出现的，而此时由于处于生产环境中，在排查异常代码时就会体现出限制：

*   首先，运行时代码 和 开发时代码 不一致，导致错误信息也不同
    
*   其次，运行时代码 很难通过 `debug` 的方式进行调试
    

主要原因就是 **开发时代码** 到 **运行时代码** 的转变都需要经历以下几个处理阶段：

*   **代码压缩**，为了减小运行时代码的体积，会将源代码中的 换行符、无意义空格 等进行删除，使得代码紧凑在一起
    
*   **代码混淆**，实际上是指将源代码转换成一种功能上等价，但是难于阅读和理解的形式，例如开发时代码中定义的 "见名知意" 的 函数名、模块名、变量名 等转换为类似 "a、b、c、..." 等无意义的名字，使得即使运行时代码被人获取，也难以猜测其作用
    
*   **代码分块（chunk split）**，在现代前端构建工具（webpack、vite 等）中都支持将多个源代码文件合并成一个 bundle 文件，目的就是减少 http 请求数量，以实现优化效果
    

因此，sourmap 就可以在这些处理阶段中构建出 运行时代码 和 开发时代码 代码的映射关系，使得运行时代码也能够像开发时代码一样提供给我们详细而准确的信息，帮助我们在生产环境中也能够快速定位到源代码中的位置。

**如何快速生成 sourcemap?**
---------------------

前端构建工具很多，这里只列举最常用的两个：**vite** 和 **webpack**

### **vite 生成 sourcemap**

**`vite`** 中只要通过设置 `build.sourcemap` 的选项配置即可，值类型包括：

*   **boolean：true | false**
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhg3DCsPY7VcbTbWp2RQJQhpoQqiciawdry7seZkvfFIoTYvSlMNQYclyg/640?wx_fmt=other)
    

*   其默认值为 **false**，当设置为 **true** 时，就会生成单独的 `.map` 文件，并且在对应的 bundle 文件中通过 **注释** 来指明对应的 `.map` 文件，如下：
    

*   **'inline'**
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhvibNVYDRa6bQibDtibDJb2vSJXUf7hrS4qoluJwbBC9YBGAAoibYM5zArw/640?wx_fmt=other)
    

*   指定为该值 source map 将作为一个 data URI 附加在输出文件中，如下：
    

*   **'hidden'**
    

*   `'hidden'` 的工作原理与 `'true'` 相似，只是 bundle 文件中相应的注释将不被保留
    

### **webpack 生成 sourcemap**

**`webpack`** 中只要通过设置 `devtool` 的选项配置即可，值类型包括以下类型的 **组合**：

*   **(none) 默认值**
    
*   **eval**
    

*   会生成被 `eval` 函数包裹的模块内容，并在其中通过注释来注明是源文件位置，其中的 `sourceUrl` 是用来来指定文件名
    
*   优点就是快，因为不用生成 `.map` 文件，并且 运行时代码 映射到 开发时代码 只需要提供对应的 源文件地址
    
*   缺点就是包含映射信息少，并且 `eavl` 函数因为安全性问题也是不建议使用的![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhqG9ydvq3dq7jvmBva8KHBUZVZV5VQYWHmNUgJRSInVoBnScPXOEE4Q/640?wx_fmt=other)
    

*   **source-map**
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhogfUmJMGrmHoCDG7Ese740CxqtbYCnrf2p6EOvpPhwicrZCc10gdQLA/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhEG9OI4Uia8wahcVUPQ9xM33HVWyjh7ruicFicbg5ABA3XFibKxkjZ7LW6Q/640?wx_fmt=other)
    

*   会生成单独的 `.map` 文件包含 `version、file、sources、sourcesContent、names、mappings、sourceRoot` 等信息，需要进行 mapping 和 编码 工作
    
*   优点就是拥有单独的 `.map` 文件，使得 运行时代码 体积不会过大，并且能够提供详细的信息，包含文件名、行、列等信息
    
*   缺点就是慢，因为需要额外生成 `.map` 文件，并且随着模块内容的增多整体速度就越慢
    

*   **cheap**
    

*   和 `source-map` 的方式不同，`cheap` 只会映射到源码的 **行信息**，即它 **不会生成源码的 `列信息`，也不包含 `loader` 的 `sourcemap`**，因此相对来说会比 `source-map` 的方式更快
    
*   优点就是速度更快，只映射到源码的 **行信息** 的原因是：通常在进行错误定位时，大多数情况下只需要关注到 **行** 就可以知道错误原因，而很少会关注到 **列**，因此列信息其实不是必要性的
    
*   缺点就是映射信息会不够精确，因为一个文件可能会经过不同 `loader` 的处理，而它又不生成 `loader` 相关的 `sourcemap`，自然会导致最终产物的信息不够精确
    

*   **module**
    

*   `module` 的方式生成的 `sourcemap` 就会包含和 `loader` 相关的 `sourcemap` 信息
    
*   需要 `loader` 相关的 `sourcemap` 信息的原因在于：当一个文件被多个 `laoder` 依次进行转换处理后，其内容会发生不同的变化（**`例如：新内容的行列 和 源代码的行列 信息不一致`**），就会使得我们无法去调试最初始的代码内容
    

*   **inline**
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhwL1BiaQzsnIMe32liaD91yqoTBUgw8RGRC7r0Bicc0D7yXr9eibAibVcCMQ/640?wx_fmt=other)
    

*   顾名思义，就是会将原本生成的 `.map` 文件的内容作为 **DataURL（`base64 形式`）** 嵌入 `bundle` 文件中，不单独生成 `.map` 文件
    

*   **hidden**
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhcyQPnliaYiahZRa5ccUNODcTNhkaeibGhNjaTCvjLKAsiabjicicI9UPibzgA/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhS7ZxMxKaJiav2UIFOJRvNdNjLvNgjsLibdG86AoaHvjf10b4yhQNgAHw/640?wx_fmt=other)
    

*   会生成单独的 `.map` 文件，但是相比于 `source-map` 的形式，其会在对应的 `bundle` 文件中隐藏 `sourceMappingURL` 的路径
    

*   **nosources**
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhP8eTTC54gcjicXRtSQCzVyp6ib3HibrJNjrO3Kx2emml22qlbMDYRcDvg/640?wx_fmt=other)
    

*   在 `source-map` 生成的 `.map` 文件中的 `sourceContent` 存储的是源码内容，这样的好处是既可以根据文件路径来映射，也可以根据这部分内容来映射，换句话说 `source-map` 提供了双重保险，但也增加了 `.map` 文件体积
    
*   `nosources` 则是在能够保证文件路径可以准确建立映射的情况下，就可以把 `sourceContent` 的内容给去除掉，使得 `.map` 文件体积能够更小一些![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhISZOoUhKN2IlDx16LmVY0omnicHnia4vUicW4nIIm3llNQVAFOF0hWkicw/640?wx_fmt=other)
    

以上和 `webpack` 相关的 `devtool` 的配置内容，`eval`、`source-map` 都可以单独使用，也可以组合使用，但 `module、inline、hidden、nosources、cheap` 的方式一定是包含 `source-map` 的内容的，如果你记不住或写错了，`webpack` 会给你相应的提示信息：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhs0TIo6jN0VgGV8FmP1EzB9Fkibtf9iaLY8aGH5X8Z8WxyLtBgIibPzBLQ/640?wx_fmt=other)

**不同环境的 sourcemap 怎么选？**
------------------------

这里的环境指的就是 **开发环境** 和 **生产环境**，由于不同的组合方式在 **构建** 和 **重构建** 时的速度不同，另外还需要考虑 `.map` 文件在线上可能带来的风险问题，因此必须要 **权衡** 使用 `sourcemap` 的组合方式，好在 **`webpack`** 文档中给我们提供给了相应的组合方式，如下：

<table><thead><tr><th>devtool</th><th>performance</th><th>production</th><th>quality</th><th>comment</th></tr></thead><tbody><tr><td>(none)</td><td><strong>build</strong>: fastest &nbsp;<strong>rebuild</strong>: fastest</td><td>yes</td><td>bundle</td><td>Recommended choice for production builds with maximum performance.</td></tr><tr><td><strong><code>eval</code></strong></td><td><strong>build</strong>: fast &nbsp;<strong>rebuild</strong>: fastest</td><td>no</td><td>generated</td><td>Recommended choice for development builds with maximum performance.</td></tr><tr><td><code>eval-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: fast</td><td>no</td><td>transformed</td><td>Tradeoff choice for development builds.</td></tr><tr><td><code>eval-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: fast</td><td>no</td><td>original lines</td><td>Tradeoff choice for development builds.</td></tr><tr><td><strong><code>eval-source-map</code></strong></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: ok</td><td>no</td><td>original</td><td>Recommended choice for development builds with high quality SourceMaps.</td></tr><tr><td><code>cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>transformed</td><td><br></td></tr><tr><td><code>cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>original lines</td><td><br></td></tr><tr><td><strong><code>source-map</code></strong></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: slowest</td><td>yes</td><td>original</td><td>Recommended choice for production builds with high quality SourceMaps.</td></tr><tr><td><code>inline-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>transformed</td><td><br></td></tr><tr><td><code>inline-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>original lines</td><td><br></td></tr><tr><td><code>inline-source-map</code></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: slowest</td><td>no</td><td>original</td><td>Possible choice when publishing a single file</td></tr><tr><td><code>eval-nosources-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: fast</td><td>no</td><td>transformed</td><td>source code not included</td></tr><tr><td><code>eval-nosources-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: fast</td><td>no</td><td>original lines</td><td>source code not included</td></tr><tr><td><code>eval-nosources-source-map</code></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: ok</td><td>no</td><td>original</td><td>source code not included</td></tr><tr><td><code>inline-nosources-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>transformed</td><td>source code not included</td></tr><tr><td><code>inline-nosources-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>original lines</td><td>source code not included</td></tr><tr><td><code>inline-nosources-source-map</code></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: slowest</td><td>no</td><td>original</td><td>source code not included</td></tr><tr><td><code>nosources-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>transformed</td><td>source code not included</td></tr><tr><td><code>nosources-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>original lines</td><td>source code not included</td></tr><tr><td><code>nosources-source-map</code></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: slowest</td><td>yes</td><td>original</td><td>source code not included</td></tr><tr><td><code>hidden-nosources-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>transformed</td><td>no reference, source code not included</td></tr><tr><td><code>hidden-nosources-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>original lines</td><td>no reference, source code not included</td></tr><tr><td><code>hidden-nosources-source-map</code></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: slowest</td><td>yes</td><td>original</td><td>no reference, source code not included</td></tr><tr><td><code>hidden-cheap-source-map</code></td><td><strong>build</strong>: ok &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>transformed</td><td>no reference</td></tr><tr><td><code>hidden-cheap-module-source-map</code></td><td><strong>build</strong>: slow &nbsp;<strong>rebuild</strong>: slow</td><td>no</td><td>original lines</td><td>no reference</td></tr><tr><td><code>hidden-source-map</code></td><td><strong>build</strong>: slowest &nbsp;<strong>rebuild</strong>: slowest</td><td>yes</td><td>original</td><td>no reference. Possible choice when using SourceMap only for error reporting purposes.</td></tr></tbody></table>

**sourcemap 如何生效？**
-------------------

要使得 `sourcemap` 发挥作用，单单只是生成对应的映射规则还不够，还需要一个 **解析工具** 负责将 **`源代码`** 和 **`sourcemap`** 规则真正进行映射，通常这个解析工具是 **浏览器**、**异常监控系统（如：sentry）** 和 **手动映射**。

### **浏览器**

通常在现代浏览器中基本上会默认启用 `sourcemap` 映射功能，即只要对应的 `bundle` 文件中有 `sourceMappingURL` 或 `sourceURL` 等指向的注释内容即可，手动开启位置如下（大同小异）：

**Google 浏览器**：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhT6bUpwyc6dO7x2CgTMXk2yj1ia8cebFYPTTibA3bovJfjDOMEm5uH1RQ/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhNGBEVfWauMmjSvZRCVVp5e4E8sBPINFKqGIHtuvH7hvzxtAgrr1ZibA/640?wx_fmt=other)

**Firefox 浏览器**：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhjGWfibq2eFhNhtVVeWJnsibzliagcLoibyHa975jaH7GS8tfJrYcHOYYDA/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhz2ZFK4UaNrDcGaPVOHQkIKiadH9Pq2pDunzSiapY9ia4daxe660AIYVVw/640?wx_fmt=other)

**Edge 浏览器**：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdh3V63Mc7dEwbsCbpiagDGSdq1qQQYfWtVhwD02WhlD7NrMeFiaic6JcUMQ/640?wx_fmt=other)

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdh9NpaVM1eNXkoaFsUdDh689SWiaAjblYUsiaYj9Mia8ibiaI7INqty0X055A/640?wx_fmt=other)

### **异常监控系统**

这里以 `sentry` 为例 **简单演示** 一下，大致包括：

*   **接入 sentry**
    
*   **异常捕获**
    
*   **添加 sourcemap**
    

**首先**，在 **`Sentry`** 监控平台上注册 / 登录拥有自己的账号，然后可以构建一个对应的项目（首次注册登录会有指引），项目创建好以后会生成一个 **`dsn`**，在接入 `sentry` 时需要传入。

**其次**，按照引导页的提示在你的项目（以 `vue3` 为例）中安装依赖。

```
npm install --save @sentry/vue @sentry/tracing
```

**最后**，在你项目入口文件（`main.js`）中初始化接入 **`Sentry`** 即可：

```
import { createApp } from "vue";
import { createRouter } from "vue-router";
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";

const app = createApp({
  // ...
});
const router = createRouter({
  // ...
});

Sentry.init({
  app,
  dsn: "https://x@x.ingest.sentry.io/x",
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      tracePropagationTargets: ["localhost", ...],
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

app.use(router);
app.mount("#app");
```

```
// vue.config.js
  
  const { defineConfig } = require('@vue/cli-service')
  const SentryWebpackPlugin = require('@sentry/webpack-plugin')

  module.exports = defineConfig({
    configureWebpack(config) {
      if (process.env.NODE_ENV === 'production') {
        config.devtool = 'hidden-source-map'
        config.plugins.push(
          new SentryWebpackPlugin({
            include: './dist',
            ignoreFile: '.gitignore',
            ignore: ['node_modules', 'webpack.config.js'],
            configFile: './.sentryclirc',
            release: '0.0.1',
            urlPrefix: '~/js/',
          }),
        )
      }
    },
  })
```

```
[auth]
token = 在 sentry 平台生成
[defaults]
url = https://sentry.io/ // 如果是自己部署的就填部署地址，如果不是就不改
org = sentry 平台的 org
project = sentry 平台的 project
```

经过以上处理，默认情况下 `Sentry` 已经可以自动获取到错误信息了，如：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhTnuruxxpfvhCiaGV98H3p8NibvibTVs0NbT1Q9QAZUqcRBfzcaXopWbYQ/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhkibEHjKjnygMGvmLnpxRicb0J8Vum3esuO3qdUNFgnhm6ibU3t94KibaNQ/640?wx_fmt=other)

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhBYibOgScN68UrjrYXibdtiaoyOfSh9Pq4ITqsyzraoAIlqqImliaRPANGQ/640?wx_fmt=other)

显然，没有接入 `sourcemap` 的错误信息在 `sentry` 中也无法进行快速定位，因此下一步就是需要给 `sentry` 上传 `sourcemap` 相关的文件。

**sentry 上传 sourcemap 流程（****`sentry 文档`** **）**

*   **安装 webpack 插件：`npm install --save-dev @sentry/webpack-plugin`**
    
*   **配置 webpack 插件**
    

```
npm install source-map
```

```
const { SourceMapConsumer } = require('source-map')
   const fs = require('fs')

   const rawSourceMap = fs.readFileSync('./dist/js/app.dde017e5.js.map', 'utf-8')

   // 填入错误信息
   originalPositionFor('app.dde017e5.js:1:11871')

   function originalPositionFor(errInfo) {
     const [budleName, line, column] = errInfo.split(':')

     SourceMapConsumer.with(rawSourceMap, null, (consumer) => {
       const originalPosition = consumer.originalPositionFor({
         line: parseInt(line),
         column: parseInt(column),
       })

       console.log('bundle name = ', budleName)
       console.log('original position = ', originalPosition)
     })
```

*   **在项目根目录下新建 `.sentryclirc` 文件**
    

```
"var a = 1;console.log(a);" 
         相当于 
"var, a, =, 1, console, log"
```

```
// main.js
console.log(1);

// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": "AAAAA,QAAQC,IAAI",
  "sources": ["webpack://vue3-wp5/./src/main.js"],
  "sourcesContent": ["console.log(1);\n"],
  "names": ["console", "log"],
  "sourceRoot": ""
}
```

*   **如果设置 `release` 字段，那么要保证 `main.js` 中的 `Sentry.init({...})` 和  `SentryWebpackPlugin` 中的要保持一致性，或者都不设置**
    
*   **构建产物 `npm run build`**
    
*   **进入 `dist` 目录通过 `http-server`  启动本地服务模拟生产环境产生错误**
    
*   **进入 `sentry` 中查看异常信息，上传 `sourcemap` 文件后**，错误信息如下：
    
    ![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhAu54HDKeIGb3Nt2BqqCKn02MvtNw7Gl1sfAxIE6FNbgveibicBhHib1gw/640?wx_fmt=other)
    

### **手动映射**

通常情况下为了安全性，不推荐使用 **浏览器** 映射的方式，虽然这种方式对你来说很简便，但也为别有用心的人提供了便捷，因此，通常都会有接入对应的 **监控平台**，当然除此之外还可以通过 **手动映射** 的方式进行定位：

*   安装 `source map` 库：
    
    ```
    npm install source-map
    ```
    
*   新建 `sourcemap.js`
    
    ```
    const { SourceMapConsumer } = require('source-map')
       const fs = require('fs')
       const rawSourceMap = fs.readFileSync('./dist/js/app.dde017e5.js.map', 'utf-8')
       // 填入错误信息
       originalPositionFor('app.dde017e5.js:1:11871')
       function originalPositionFor(errInfo) {
         const [budleName, line, column] = errInfo.split(':')
         SourceMapConsumer.with(rawSourceMap, null, (consumer) => {
           const originalPosition = consumer.originalPositionFor({
             line: parseInt(line),
             column: parseInt(column),
           })
           console.log('bundle name = ', budleName)
           console.log('original position = ', originalPosition)
         })
    ```
    
*   演示如下：![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhpC59ZWic2hcScVugriapRrOeslWJicpowrsju8sOYlyD6HxYYc9PkEScA/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhSQ6Kic6lpxMrialRfnVAfxyRwyS38sicHEpHEYOFOgc9hAaFuFCvqOyQw/640?wx_fmt=other)![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhearyHEokbP0b0GHBsxjB6bwECyKekicFDYPX3ia88xGmthiaFBKNj9KnA/640?wx_fmt=other)
    

**sourcemap 的映射原理**
===================

在 `.map` 文件中有 `mappings` 字段，其内容很难让人不注意，毕竟和其他内容相比看起来太与众不同了：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhm0ZJj0qiccEKVxzibSdtt4yUSqH77uqpkcicrOtq8DAMO0nIOW6Xcm6tg/640?wx_fmt=other)

实际上，`mappings` 以 **Base64 VLQ** 编码形式存储了映射到源代码 **行、列** 等相关信息。

**为什么使用 Base64 VLQ 编码？**
------------------------

源代码通常都是很庞大的，单纯使用 **数字** 表示 **行信息** 和 **列信息** 会使得整个 `.map` 文件体积变大，而 **Base64 VLQ** 是一种 **压缩数字** 内容的编码方式，因此可以用来减少文件体积。

由于 **Base64** 所能表示的数字存在 **上限**，如果需要表示超过上限的数字该怎么办，实际上只有 **每个分号中的第一串英文** 是用来表示代码的 **第几行、第几列** 的绝对位置外，后面的都是相对于之前的位置来做 **加减法** 的。

> 可以通过 **BASE64 VLQ CODEC** 这个网站了解具体的映射关系.

**mappings 的组成**
----------------

**`mappings`** 的内容主要由三部分组成：

*   **英文串**
    

*   **`运行时代码` 所在的列**，通常源代码经压缩后只有 **`1行`**，因此不需要存储行信息，只需要存储列信息
    
*   **对应 `sources` 字段下标**，即对应哪个源文件
    
*   **`开发时代码`的 第几行**
    
*   **`开发时代码`的 第几列**
    
*   **对应 `names` 字段下标**，即对应哪个变量名
    
*   每段英文串表示 **运行时代码** 和 **开发时代码** 位置关联的 **base64VLQ** 编码内容
    
*   每段英文串拥由 **5** 部分组成：
    

*   **逗号 `,`**
    

*   用于分隔一行代码中的内容或位置，例如
    
    ```
    "var a = 1;console.log(a);" 
             相当于 
    "var, a, =, 1, console, log"
    ```
    

*   **分号 `;`**
    

*   表示 **运行时代码** 的行信息，用来定位是编译后代码的第几行，如果启用代码压缩那么就不会有 **分号**，因为代码会被压缩在一行上
    

**简单解析 mappings**
-----------------

下面以 `console.log(1);` 为例子简单介绍下对应关系，毕竟源码内容复杂的不好分析：

```
// main.js
console.log(1);
// main.js.map
{
  "version": 3,
  "file": "main.js",
  "mappings": "AAAAA,QAAQC,IAAI",
  "sources": ["webpack://vue3-wp5/./src/main.js"],
  "sourcesContent": ["console.log(1);\n"],
  "names": ["console", "log"],
  "sourceRoot": ""
}
```

还是先关注 `mappings` 字段，其内容由于是编码后的内容，为了更直观的看到其代表的具体数字内容，我们可以通过 **BASE64 VLQ CODEC** 网站来得到结果：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhPEReFEvxCdeUc1h1ll7hWxeawbJhdjpzg7iaCmHwwPpRa11LkSrtdgA/640?wx_fmt=other)

现在，我们知道了 `"AAAAA,QAAQC,IAAI"` 对应 `[0,0,0,0,0], [8,0,0,8,1], [4,0,0,4]`，结合上述其内容就表示：

*   `[0,0,0,0,0]` 对应 `console`
    

*   0 ：**编译代码 第 `0` 列**
    
*   0 ：**对应 `sources[0]`**，即 `main.js`
    
*   0 ：**源代码 第 `0` 行**
    
*   0 ：**源代码 第 `0` 列**
    
*   0 ：**对应 `names[0]`**，即 `console`
    

*   `[8,0,0,8,1]` 对应 `log`
    

*   8 ：**编译代码 第 `8` 列**，其实是 第 `8+0=8` 列
    
*   0 ：**对应 `sources[0]`**，即 `main.js`
    
*   0 ：**源代码 第 `0` 行**
    
*   8 ：**源代码 第 `8` 列**，其实是 第 `8+0=8` 列
    
*   1 ：**对应 `names[1]`**，即 `log`
    

*   `[4,0,0,4]` 对应 `1`
    

*   4 ：**编译代码 第 `4` 列**，其实是 第 `8+4=12` 列
    
*   0 ：**对应 `sources[0]`**，即 `main.js`
    
*   0 ：**源代码 第 `0` 行**
    
*   4 ：**源代码 第 `4` 列**，其实是 `8+4=12` 列
    
*   不是变量，因此没有和 `names` 相关信息
    

是不是有些奇怪，明明 `1` 的位置比 `log` 的位置更靠后，为什么编码显示的列数却更小，别忘了下面这个规则:

> 实际上只有 **每个分号中的第一串英文** 是用来表示代码的 **第几行、第几列** 的绝对位置外，后面的都是相对于之前的位置来做 **加减法** 的

即实际显示的列号数应为：

![](https://mmbiz.qpic.cn/mmbiz/p3q0CDzmjJMfYZpHCBEcniabRHssQZvdhnicszCSS2UpD9j6DEP7pYIsSFs2xXAgQZUu43UcQaK3icD3iaZ4iclTib9w/640?wx_fmt=other)

**最后**
======

以上就是对 `sourcemap` 相关内容的介绍，**希望本文对你有所帮助****！！！**

说个题外话，有人好奇我哪有那么内容要写，其实大多文章内容只是将自己需要解决或者同事遇到的问题进行总结和扩展而已，所以大多数文章的想法就来源于此，其次我认为写文章的原则就是：**写出来的文章首先要保证自己有收获****!** 另外，更多的是看看大家对同一个问题都会有什么更好的方案！

> **欢迎关注公众号《熊的猫》，本公众号会定期分享技术干货！**