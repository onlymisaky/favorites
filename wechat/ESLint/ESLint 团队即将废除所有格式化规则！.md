> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3IUaVZAtWVonS1mm28iIkg)

ESLint 是一款提高代码质量的静态分析工具，旨在使代码风格更加一致并避免错误。

ESLint 主要包括两大类规则：代码质量规则和格式化规则。不幸的是，以后 ESLint 有且仅有代码质量规则了......

2023 年 ESLint 8.53 中，ESLint 官宣废除所有格式化规则，使用此类规则会收到警告。在官方博客中，ESLint 团队提及 ESLint 10 可能会完全废除所有规则，而目前最新的 ESLint 主版本已经到达 ESLint 9.2 了。

本期一起来回顾 ESLint 废除格式化规则的诸多幕后原因和技术细节，以及为什么这是 ESLint 团队笃信的正确选择。

  

背景
--

2013 年 ESLint 首发时，JS 生态系统陷入了关于源码格式化是否应该成为 linter 一部分的争论。

JSLint 是地球上第一个 JS linter，“JSLint 之父”将其格式首选项大量编码到 JSLint 中。这些风格偏好在 JSLint 的继任者 JSHint 中得到了延续和松耦。

但 2013 年，JSHint 宣布废除格式化选项，且会在下一个主版本中删除它们。虽然这些选项从未被删除，但它们仍会展示警告：

> 警告：格式化选项已被废除，且会在下一个主版本中删除。JSHint 将其作用域限制在代码准确性的问题上。如果你想强制执行源码格式化规则，请传送到 JSCS 项目。

JSCS 项目的诞生旨在满足 JS 开发者日益增长的愿望，更精准地格式化开发者的代码。ESLint 出现同段实验期，用户尝试使用 JSHint、JSCS 和 ESLint 的不同组合来实现它们的 linting 和格式化需求。

早期，我认为 ESLint 与 JSHint 分庭抗礼的唯一方式在于，确保所有可用的 JSHint 规则都有 ESLint 版本的等效功能。

虽然 ESLint 从古至今的优势一直是创建自定义规则，但我认为如果每个人都必须自己重建 JSHint 规则，ESLint 势必不会得到大规模采用。我最初的计划是制定几十条核心规则，然后将其余规则作为插件来实现。

随着时间的推移，ESLint 收到越来越多向核心源码添加格式化规则的需求。许多需求提到它们不想在代码中同时使用两种工具：ESLint + JSCS，如果 ESLint 可以完成 JSCS 的功能，它们可以果断弃用 JSCS，且只使用 ESLint。

因此，现在 ESLint 有一个团队，我们关注实现等价功能来支持这种用户场景。最终，我们的工作十分出色，JSCS 的使用率下降了，我们将 JSCS 合并到了 ESLint。

那时我们还太年轻，不知道 JSHint 的想法是正确的，尽管 ESLint 已经成为 JS 的主流 linter 和源码格式化程序，但我们涉及了太多工作。

JS 技术爆炸和维护负担
------------

在 ES6 和 React 发展的推动下，大家编写 JS 的方式今非昔比。Airbnb 和 Standard 等人气爆棚的风格指南鼓励 JS 开发者精确掌握其代码的优雅编写方式。

结果，ESLint 被关于格式化规则的例外和选项的需求淹没了。

在过去十年里，我们见证了各种奇葩的代码风格，并伴随着在 ESLint 核心规则中强制执行它们的需求。每次引入 ES6 新语法时，我们都会收到一系列更新现有规则和实施新规则的需求。

当我们的核心规则接近 300 条时，我们试图通过冻结风格规则来减轻维护负担，这样我们就不再追逐极端情况，以此支持用户的个人偏好。这有所帮助，但还不够。

*   规则冲突。用户期望核心规则能够“梦幻联动”，这意味着,任意两个规则都不应标记相同的问题，任意两个核心规则也不应给出相互冲突的建议。虽然当核心规则少于 30 条时，这轻而易举，但当规则超过 300 条时，这就难如脱单，甚至是不可能事件。
    
*   不切实际的期望。有了大量的核心格式规则，用户期望每一种可能的样式指南都应该只使用核心规则就可以实现，而无需涉及插件。这让 ESLint 团队雪上加雪，要求它们继续添加选项，这也增加了 ESLint 核心源码的规模。
    
*   努力 vs 价值错位。不断添加新选项和例外，支持用户的风格指南的维护重担压在了 ESLint 团队身上，而价值却只被少数用户提取。
    
*   机会成本。我们花在维护格式化规则上的时间越多，花在对大量用户有利的事情上的时间就越少。
    
*   索然无趣。虽然 ESLint 受益于外部贡献，但这些贡献者对纠结空格等极端情况不感兴趣。ESLint 团队本身认为这些规则的优先级远远低于任何其他工作，这常常使问题长时间悬而未决。
    
*   一致性问题。由于 ESLint 的规则被设计为原子性，且无法访问其他规则，因此我们会遭遇无法正确修复错误的问题，因为信息位于另一个规则中。举个栗子，如果自动修复需要添加新的代码行，则需要知道文件如何缩进才能应用正确的修复。但是，`indent` 规则控制 ESLint 的缩进，这意味着，其他规则需要应用不带缩进的修复，然后相信 `indent` 规则将在后续传递中修复缩进。
    

随着 ESLint 朽化，这些问题与日俱增，我们终于遭遇了压死骆驼的最后一根稻草。

所有源码格式化规则将在 ESLint 8.53 的下一个版本中废除，但至少要等到 ESLint 10 才会被删除。尽管你可能会在 ESLint CLI 中亲眼目睹废除的警告，但你还可以继续使用它们。

你该怎么办
-----

我们建议使用源码格式化程序，而不是诉诸 ESLint 来格式化代码。源码格式化程序旨在理解整个文件，并在整个文件中应用一致的格式。

虽然你可能无法像 ESLint 那样对异常有大量的控制，但与使用数十个单独的规则配置 ESLint 相比，你将获得简单性和速度的权衡。

我们推荐下列两种格式化程序：

*   Prettier：基于 JS 的格式化程序，支持多语言格式化
    
*   dprint：基于 Rust 的格式化程序，支持迷你的语言集
    

如果你对使用专用源码格式化程序的想法不感兴趣，你还可以使用针对 JS 的 `@stylistic/eslint-plugin-js` 或针对 TS 的 `@stylistic/eslint-plugin-ts`。这些 npm 包分别包含 ESLint 核心和 `typescript-eslint` 中废除的格式规则。

这些软件包由 AntFu 维护，他决定继续维护这些规则。如果你想继续使用 ESLint 的源码格式化规则，那么我们建议切换到这些软件包。

高潮总结
----

我们知道很多用户依赖 ESLint 来提高代码质量和格式化源码，因此，我们不会轻易做出这样的重大决定。

不幸的是，我们一直以来的行事方式进退两难，我们被迫这样改变。专用源码格式化程序的普遍存在和人气爆棚使这一决定变得更加容易，因为 AntFu 自愿将源码格式化规则作为单独的包来维护。

我们由衷期望本文的可用备选方案之一能确保用户可以继续以自己喜欢的方式格式化源代码。

参考文献
----

1.  ESLint：https://eslint.org
    
2.  Blog：https://eslint.org/blog/2023/10/deprecating-formatting-rules
    
3.  v9.2：https://eslint.org/blog/2024/05/eslint-v9.2.0-released
    

粉丝互动
----

本期话题是：你更喜欢使用 ESLint 一劳永逸，还是更青睐 ESLint + Prettier 分而治之？

### 最后

  

  

如果你觉得这篇内容对你挺有启发，我想邀请你帮我个小忙：  

1.  点个「**喜欢**」或「**在看**」，让更多的人也能看到这篇内容
    
2.  我组建了个氛围非常好的前端群，里面有很多前端小伙伴，欢迎加我微信「**sherlocked_93**」拉你加群，一起交流和学习
    
3.  关注公众号「**前端下午茶**」，持续为你推送精选好文，也可以加我为好友，随时聊骚。
    

  

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

  

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

点个喜欢支持我吧，在看就更好了