> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aMH7R5Db-lT2t0t5Ole7ow)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/wnIMIiaEIIrgE8SJmia20eBraamaRREOwR1cjvdNaibkGup5rVGuNhQfWj0iag3OnvAx5giaUX5icjH3ia6rzlxvExoWw/640?wx_fmt=jpeg)

Next.js 的 Github issues 中有一个帖子，反馈了 Next.js 的开发模式编译很慢 [1]，自 2023 年 4 月 23 日提问以来，现在已经有 468 多条讨论！看来这个问题不只一个人遇到，做为一个使用过 Next.js 的用户来说，Next.js 的其它方面还可以，但是开发体验真是挺糟糕的...

![](https://mmbiz.qpic.cn/sz_mmbiz_png/wnIMIiaEIIrgE8SJmia20eBraamaRREOwRib5XtSTVyVksZic6LbWN9dQgicH1vibkh3rKJHuQDqDz67Y2h6E7uLAX2g/640?wx_fmt=png&from=appmsg)

用户 `@roonie007` 提出了自己的疑问，为什么 Next.js 不使用 Vite，而要重新发明轮子？[2]

![](https://mmbiz.qpic.cn/sz_mmbiz_png/wnIMIiaEIIrgE8SJmia20eBraamaRREOwRykCZRMkAibAgdTNFic0wgVGyLogLD2hzcCBhZvySTQCHTg8nv6vO7o4Q/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/wnIMIiaEIIrgE8SJmia20eBraamaRREOwR3NGIIOxgKMkqGpcDVukFUry8GgtVfveUENzVRvX5KEcH1iawNOmSQibg/640?wx_fmt=png&from=appmsg)

做为 `Next.js` 和 `Turbopack @vercel` 的技术主管 @timneutkens[3] 对此进行了回复，如下所示：

> 我会尽量简短，因为我可以写 / 谈论这个话题几个小时 😄
> 
> 几年前，在 Vite 得到广泛应用之前，我们开始看到越来越多基于 Next.js 构建的大型 Web 应用程序，包括企业级团队中超过 100 名开发 > 人员的采用。这些代码库扩展到数万个自定义组件，并且还从 npm 导入包。简言之，尽管我们当时使用的 webpack（如果没有选择 Turbopack）实际上相当快速，但对于这些不断增长的代码库规模来说仍然不够快。
> 
> 我们还看到了一种趋势，即通用应用程序变得更加依赖编译，主要是由组件库 / 图标库的兴起所致。今天，正如您在这个帖子中看到的，由于已发布的设计系统和图标库的使用，即使是一个非常小的应用程序也可能编译出 20K 个或更多模块。
> 
> 我们发现的问题是，即使我们将 webpack 优化到最大，它仍然存在可以处理的模块数量上限，因为如果你有 20,000 个模块，即使每个模块只花费 1 毫秒，也会导致 20 秒的处理时间，如果不能并行处理的话。
> 
> 除此之外，我们不仅运行一个 webpack 编译器，而是运行了三个：一个用于服务器，一个用于浏览器，一个用于边缘运行时。这会带来复杂性，因为这些独立的编译器必须协调工作，因为它们没有共享的模块图。
> 
> 在同一时间段，我们还开始探索 React Server Components、App Router，以及我们希望未来 5-10 年内 Next.js 开发应该是什么样子的总体情况。其中一个主要议题是关于代码如何从服务器 -> 客户端 -> 服务器 -> 客户端，简言之，如果您熟悉的话，就是服务器操作，特别是服务器操作可以返回包含额外客户端组件的 JSX。为了使其工作，我们发现拥有一个统一的模块图，可以在同一个打包器 / 编译器中同时容纳服务器、客户端和边缘代码，将会非常有益。这是像 Parcel 这样的打包器长期探索的内容。
> 
> 那时候，我们评估了所有现有的解决方案，并发现它们各自都有权衡之处，我不会像 “抛弃其他人” 一样说它们，因为这些权衡都是有意义的，只是对于像 Next.js 这样的框架，尤其是未来的 Next.js（如果我记得正确的话，这大概是在 ~2020 年左右）来说，它们不合适。
> 
> 总体上来说，让我们谈一谈一些目标，其中一些对用户有益，一些对维护有益：
> 
> *   更快的 HMR
>     
> 
> *   Webpack 在模块图中的模块数量上有性能限制。一旦达到 30K 模块，每次代码变更的开销至少需要 ~1 秒的处理时间，无论您是进行小的 CSS 更改还是其他更改。
>     
> 
> *   更快的路由初始编译
>     
> *   具有 20-30K 模块的 Webpack 通常需要 15-30 秒的处理时间，因为它无法跨 CPU 进行并行处理。
>     
> *   无破坏性变更
>     
> 
> *   我们希望将所有这些改进带给现有应用程序。作为其中的一部分，有很多 Next.js 特定的编译器功能，如 next/font，需要添加进来。
>     
> 
> *   可伸缩到最大的 TS/JS 代码库
>     
> 
> *   如上所述，我们看到越来越大的代码库，为了优化这些，需要一种不同的架构。我认为在其他打包器中我们采用的架构最接近的是 Parcel。
>     
> 
> *   持久性缓存
>     
> 
> *   Turbopack 拥有一个广泛的缓存机制，可以与 Facebook 的 Metro 打包器（用于 react-native 和 instagram.com）相媲美，它能够持久地缓存之前完成的工作，因此当您重新启动开发服务器时，它只需恢复上次会话的缓存。目前正在积极地开发中。
>     
> 
> *   与开发密切匹配的生产构建
>     
> 
> *   目前在 Next.js 中，以及其他打包器中，dev/prod 之间存在差异，我们希望尽量减少这些差异。
>     
> 
> *   超越当前打包器的生产优化
>     
> 
> *   我们一直在开发先进的摇树功能，允许在导入 / 导出级别而不是模块级别进行代码拆分，受到 Closure Compiler 的启发。目前的打包器操作是在模块级别上进行的。
>     
> 
> *   减少编译器 / 编译时间中的不稳定性
>     
> 
> *   目前由于服务器 / 客户端 / 边缘 webpack 编译器之间的协调，有时会导致编译时间较长。主要目标之一是减少实现的复杂性，并在一个编译通道中输出所有必需的文件。
>     
> 
> *   （以后）Next.js 感知的打包器工具
>     
> 
> *   比如大大改进的 bundle 分析，了解布局 / 页面 / 路由情况。
>     
> 
> *   （以后）Next.js / RSC 感知的打包优化
>     
> 
> *   例如，优化客户端组件以尽可能高效地捆绑。
>     
> 
> *   维护者的完整可观察性
>     
> 
> *   Next.js 的使用很广泛，因此会产生大量的 bug 报告和功能请求。其中一种特别难以调查的 bug 报告与减速相关（这个问题就是一个很好的例子），以及内存使用（"Next.js 泄漏内存" 报告）。这些问题难以调查，因为它们需要深入了解报告者的性能分析 / 内存转储，而他们通常不愿意共享可运行的代码。
>     
> 
> 这是为什么构建我们自己的工具对于我们是有益的一个重要原因，它使我们能够调查报告的问题，而无需访问您的代码库。如果我们使用其他任何打包器，我们将不得不说 "很遗憾，这是您的问题，尝试将其报告给该打包器的 GitHub 存储库"，这不是我们想要做的事情，也不是我们之前在 webpack 中做过的。
> 
> 就我个人而言，我很高兴看到 Vite 在生态系统中做得很好。他们也从其他打包器中吸取了经验教训。如果您看看他们最近在 Rolldown 上的工作，您会发现有很多相似之处，这回归到打包而不是 “解包” 以提高编译性能，例如。
> 
> 猜测写这篇文章花了比我想要花的时间还要多，但希望对您有所帮助！
> 
> TLDR：其他打包器很棒，但它们不适合像 Next.js 这样的框架。我们希望将这些改进带给现有用户，为此我们不得不构建一个新的打包器，吸取了之前尝试过的许多不同方法的经验教训。

感兴趣的可以通过以下参考资料阅读原帖子。对此你怎么看？欢迎评论区讨论！

参考资料

[1]

Next.js 的开发模式编译很慢: _https://github.com/vercel/next.js/issues/48748_

[2]

为什么 Next.js 不使用 Vite，而要重新发明轮子？: _https://github.com/vercel/next.js/issues/48748#issuecomment-2151880231_

[3]

技术主管 @timneutkens: _https://github.com/vercel/next.js/issues/48748#issuecomment-2199941311_

- 这是底线 -

**想加入 Next.js 技术交流群的请扫描下方二维码先添加作者 “五月君” 微信，备注：nextjs**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/wnIMIiaEIIrhxdLEypJZmicufibSETMjBZic0NzQx3gPoFxYvvQqOq89WoFtA7fDY5sphzLUibGtUOiaWAPOp9FBI9Pw/640?wx_fmt=other&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)