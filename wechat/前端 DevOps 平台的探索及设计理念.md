> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TBbfu8lTzcVyxRKkjgyWgQ)

**本期作者**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB66QyqzwJT71AyXs7CJlazLoeMsBR8wHyOIzEp8ibgE0P1hFaKb5mBgQ/640?wx_fmt=png&from=appmsg)

李典

哔哩哔哩高级开发工程师

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBHxSKqCJ4Yc0sIiaPC3fXdE7jRB6ZEUy8icR4OyHBrFyos6ZhDGnZmZdg/640?wx_fmt=jpeg&from=appmsg)

Jinkela（金坷垃）Pipeline 是一套用于前端 DevOps 的实验性的胶水工具，解决了许多开发流程中的细节问题，希望简化前端发布的操作难度，如今能力被集成到 Dejavu(逮虾户) 这个在线平台，承载上百个前端业务仓库的 CI/CD 能力。

本次分享我想尽可能帮助你:

*   了解前端发布相关的 “提示词”。
    
*   了解该项目早期的想法和设计。
    
*   了解如何复刻一套简单可行、便于维护的、适用于前端的发布流程, 中途需要关注哪些细节?
    

**动机**

**不合理流程设计带来的潜在危害**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBsE5mJTtWTIVbkiaicvRqOu2Or6NCcZrJyFtsuJJpaw66CuZWANiccG6MQ/640?wx_fmt=png&from=appmsg)

不合理的流程设计，会导致开发者心惊胆战，即便今后改善了流程设计，一朝被蛇咬十年怕井绳，看不见的影响依然会在开发者之间传递。

以一个前端项目简化的发布流程为例，假设我们想实现一套文件部署成功后生效配置文件的逻辑，该如何做呢？

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBtzicMcn4jklUuQebjPCzicnCc3cWQIjE8icLTqcrpRrf8TYTQ0iaib8ibHdg/640?wx_fmt=png&from=appmsg)

由于 过去的某个构建发布平台 定制化能力很差，无法原生地 在任意执行阶段 实现流程自动化，只能在本不该执行的时机 辅之以 臃肿的 插件 / 临时服务器 / Webhook…… 显然，这会造成相当大的发布隐患。

此外，部分项目还要在线上平台发布完成后，回到开发机本地环境下，执行本地 CLI 来上传资源，自动化程度很低。

每次发布的感受，像是操作一台复杂的难以记忆的机器。出了事故 也只能在原有的基础上缝缝补补。

这样的现状导致自动化的最佳实践很难被沉淀下来，单一团队很难有魄力釜底抽薪地解决问题。

我们需要更多生命周期自定义钩子，便于集成各种前端特有基建，实现自动化。

**前端特有业务流程的自动化**

现如今 “前端” 可以涉猎的职能越来越多，因不同业务的需要，逐渐分化出了不同的技术选型，我们在研发过程中会接触到各种类型的项目。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBhiarlr3mM38BlibBibsic9v9icHnuoCvCI95icABkicggKiaCiccLmT7hicudLNw/640?wx_fmt=png&from=appmsg)

过去少数项目即可打造出的一个完整项目，现在往往需要多种技术栈 几十个项目 相互配合以达成。

一方面原因是外部用户需求变得更加复杂，一方面也因为 前端模块化、工程化 在发展。对代码的复用、抽象 都提出了挑战，我们更加关注「同一份代码被更多地方复用」，自然而然会让项目基数变得庞大。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBROzf8mpYWPDXTBsia5gMkKAeLbL0p7bOT2HOxOydddPWicibj5f4iaQTdQ/640?wx_fmt=png&from=appmsg)

一个现代的前端页面，往往不局限于单一的部署目的地，更可能是多种部署方式的排列组合。

开发流程又是为了最终部署场景服务的，所以开发流程会变得千奇百怪。

当这些开发流程相互交织、膨胀到一定程度时，开发者就会倍感吃力，此时我们就要思考如何化繁为简了。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBE9IHZvorjqkE1xjvtUm9We8sicH7AkFFnibUdgneJ4Ab7wOXIoloelOg/640?wx_fmt=png&from=appmsg)

**减少机械性的冗余操作**

我们开发过程中是否会遇到一些冗余的操作步骤？

*   重要功能藏的很深，需要点击很多次才能触达想要的功能
    
*   割裂的 “被中断” 的使用体验，在多个页面的列表页与详情页之间来回人工操作
    
*   想不到问题发生在哪个位点，下次可能还会 “莫名其妙发生” 许多问题
    
    node-gyp，包管理器，各种打包器 / cli，脚本，缓存，构建环境，平台本身 等等 处处都有坑
    
*   有多少个平台，每新建一个前端应用，就要在这些平台上创建多少次项目，需要投入人力 重复维护 构建脚本、权限管理、元信息等配置，迁移时更会发现项目之间盘根错节，和既有链路耦合起来
    

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBXWickZwy1NqB9zkA1ibUjAXoIvic9qQlsqtvrKfSI706d5m0pFSumxSfQ/640?wx_fmt=png&from=appmsg)

我们想要一个更简单的东西

*   尽可能减少碎片化页面的打开次数，合并同类项，缩减操作流程
    
*   只维护一遍配置，减少用户对配置的感知
    
*   在同一个地方处理绝大多数开发场景
    

**排查问题不便**

这么多工具中，我们经常会发现有重合的功能点，比如，标签 (Tag) 和版本号(Version) 类似的元信息功能 几乎无处不在，目的是便于我们快速找到相应的资源。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBgpZvsZJ7ZIrhCPJASAl42Q4e8mcW04yoU79YAibeDnibwJM2Zia0h1IMQ/640?wx_fmt=png&from=appmsg)

当自动化程度比较低、各工具隔阂尚未打通时，由于操作困难，版本号 / Tag 功能会变得形同虚设，多个平台之间 用户倾向于随意标记 导致版本号对不上号，失去了其便于溯源的作用。

长此以往，「版本号 / Tag 变得不再可信」的认知会根深蒂固，大家更信任同样在各个工具中出现的另一个稳定的东西——Commit Sha。

然而 Commit Sha 这串随机字符串还是太不直观了，我们需要重新让这些碎片化的 版本号 / Tag 变得再度语义化、可被利用。

**前端发布流程相对简单**

在我们谈起「前端发布流程」的时候，我们常常想起的是 每天高频次的发版次数、被数十个前端项目支配的恐惧、前往各种平台处理琐碎事务、各种繁杂的前端工程化工具，有种 严肃、混沌、不明觉厉 的感觉。

那不妨让我们回忆一下 从十几年前到现在 前端是如何部署的，淡化这种恐惧。

**前端部署的最简流程是什么？**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBW9mQ9E0qAItbpMjFZR9rJrqtyF9biakepYfbtlqHKLJYtQA45icv6SyQ/640?wx_fmt=png&from=appmsg)

在很久以前，作为超文本标记语言的开发者，我们只需要.……

*   把文件上传到某个指定位置
    
*   配置一下代理转发规则
    

啊，这就完事儿了，已经可以顺利从浏览器访问到网页了。😆

**再高级点？在部署前做些什么？**

想想看，IE 浏览器尚存时、新兴浏览器的用户又想要获得更好的体验，我们希望兼容各种浏览器、简化代码维护成本，就会引入一些小工具……

**举例** **因浏览器的特性 所以才会做的力所能及的优化**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBF2PcCricLMk1XyvFZT6iaW31jEmae40RmnmpBrEJW1k38Jop1EbLhbqg/640?wx_fmt=png&from=appmsg)

改写一下 webpack gulp 等打包器 “编译时” 的配置，让文件名携带唯一标识符，便于配合浏览器的缓存机制。

如果恰好还用了什么 CDN，还可以给不同 bucket 设置不同的访问特性，

打包出不同类型不同分块的内容，把它们各自传到适合的地方。

**举例** **本机开发时 借助工具 实现一定程度的半自动化**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBuOBgE3zWgE3Wz2ibVfricRYdp0m00upHaJMw8e9pZBk86D2ibCVqAE0Dw/640?wx_fmt=png&from=appmsg)

使用 npm scripts (类似 Makefile) 结合各种工具 来实现本地开发时的半自动化

*   并行执行命令 提高效率
    

*   使用 parallel，npm-run-all，concurrently 等脚手架
    

*   优化本地开发的流程
    

*   引入 version bump，changelog，commit message lint，git hooks 等特性
    

*   提高健壮性
    

*   借助 lint，e2e，单测，性能报告 等流程
    

**举例** **因不同用途 分离出不同的开发环境**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBPIiaCMhYEJc2MR8Jib7RGw734QeP7cuxTFEuettrTfTmRPPorzU1LMXg/640?wx_fmt=png&from=appmsg)

前端生态工具链中 实际利用好” 环境变量” 这一古早概念 已经特别晚了。

为了分离出 **“测试 - 预发 - 生产”** 环境 (即 同一套代码打出不同产物包)，需要 if-else 判断 process.env. 环境变量，来实现构建过程中的多态性。

_PS: 直到 2023 年 dotenv 才被主流运行时 都原生支持，在这之前可以看到大量的项目都在使用各种千奇百怪的方式 读取 环境变量_

_PS: 包管理器本体或插件 也可以支持 读取 dotenv 文件_

例如，这是某个仓库下的情况……

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBWRpokZj0a9XtKCnwFUWicOpzN4VyuqDxbib3UU2aZS9m4ib7gdz3RicD9w/640?wx_fmt=png&from=appmsg)

**再再高级点？拥有一个平台**

前后端分离的开发模式深入人心后，前端也需要专有的平台，满足局部发布、动态化可配置 等需求。

*   统一记录操作日志，方便追踪问题
    
*   换一个地方构建，无需占用本地性能
    
*   版本管理 / 回滚 / 更好地管理多个部署环境 等等…
    
*   满足一定的约束，管控不合理的使用习惯
    
*   收拢权限，防止随意发布造成的灾难
    
*   用于更好地和其他平台黏结，提高协同的体验
    
*   …
    

其实不管是过去还是现在，大多数的前端应用的部署过程，都是上述几个例子的排列组合。

万变不离其宗 —— 本质就是花式 **“处理静态资源文件”**。

我们需要一种返璞归真的方法，把繁杂概念的溶解在简易的操作模式背后。

**雏形中的解决方案**

此时，主站前端已经有一些解决方案在探索中了。

例如，有同学根据构建发布平台提供的 OpenAPI，开发了 CLI 小工具，用脚本代替手动操作。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBwBYU9LSObMbAPA5dLtSicFOKFcyFF2cER64FxOmLrGha6wgAwUun7AA/640?wx_fmt=png&from=appmsg)

它可以支持 一次性触发多个项目的构建，例如 顶导 被数十个前端项目引用，改一次需要同步修改其他项目的话，这数十个前端项目可以第一时间同时构建。

需要用户在仓库根目录 显性地配置 一张包含「子应用——平台应用配置」的配置表，维护起来很麻烦。但只需配置一次，其他人在使用时 并不会感知到配置流程。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB7ickQYc55gXOpN4aChS1rUFZmgA1qcn2ZYtd9p6QTV4eIsJ6piaYVWEw/640?wx_fmt=png&from=appmsg)

**CI/CD 实现**

**使用体验**

Jinkela Pipeline 将各种操作流程都封装为统一风格的命令行交互逻辑，适度屏蔽了用户感知，把繁杂的操作都化简为一次次键盘回车事件。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBo9CJAn6pxYfpbVCvbf0vfmTlHHcyI3aDYtlHZQ6WplvvWbUDib7IyDA/640?wx_fmt=png&from=appmsg)

**简易的架构实现**

如果想搭建一套简单的 DevOps 工具链，按下图所示的分层架构，我们可以根据需要敏捷地开发任意部分，今后也可以复杂化任意部分。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBkkdwiaoIFlaW5UVaqzQkiccKWN0pC0IKJ7GiadYP84NRHiccCkFB8Vic9XQ/640?wx_fmt=png&from=appmsg)

再简化点就是，**「条件」 + 「执行」**，是不是发现身边有很多这样类似的工具？

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBesMksEKJeGHuoaL3WxQHO2vybU3WErAia282h7jAI31ShJmxPozY1icA/640?wx_fmt=png&from=appmsg)

核心就是 仅利用 Gitlab CI 提供的「Pipeline 创建 API」作为衔接整条链路的桥梁，允许我们把具有副作用的、需要手动完成的流程前置，把自动化执行的部分后置。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB8SRfr5rKOIGYiaODiaHf01ibysG8H8r9xqz7ZHBV5ZbpwUCZic9sz366hQ/640?wx_fmt=png&from=appmsg)

基于关注点分离原则，分为三层，每一层解决的问题截然不同。

**交互，提供 构建参数 + 环境变量**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB00S4qhwTLZkcibpZCw2JmoZV8Psb7FKeU168IoPKKlxzH2JWQGx9D2w/640?wx_fmt=png&from=appmsg)

**CI 脚本，需要维护 实际的执行内容 + 触发执行的规则**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBd02C86dOqKB3aJqYeQ6nBiaHBu7WuyvxrvdsOlU8HRmHMCj4JMic72Dw/640?wx_fmt=png&from=appmsg)

**Runner + 镜像 + 预载相关构建工具**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBKYeThEbJNnWqr0gkQpmIAAfRc8H8ibpB3BxnCEI2QPEw3ic3aqDdjfag/640?wx_fmt=png&from=appmsg)

**拼接流水线触发时需要的参数**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBX8eErYhRGpox5mcK4SsnmTFdFOKtHb1icS6n0WJK29XOQuk4QDrFZpg/640?wx_fmt=png&from=appmsg)

CLI 本质上就是一个 环境变量 收集器，命令行交互的 最终目的就是为了 拼凑流水线触发的必要参数。

命令执行时，当前所在目录即为 Git 仓库，结合 DotENV 文件读取，可以替用户减少大量重复字段的填写。其余字段才需要通过命令行交互获取。

CLI 内置了常见报错的半自动处理办法，也内置了各种检查来保证正确的使用姿势。

CLI 还内置了 Version Bump、Gitlab Release 的逻辑，让 “打版本号” 的操作变得足够简单。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBgngOQ5yhaMaJCU0gpWK4GVpMz1O6AgjYnBiaiaHiax2v60CfumoNwqibKA/640?wx_fmt=png&from=appmsg)

CLI 使用了 Tapable 开发插件机制，使用 TypeDI 依赖注入 为插件提供 Shell 执行、配置文件读取、MonoRepo 支持、日志收集、NPM、Gitlab、命令行交互 等能力，二次开发 inquirer.js 使其根据 Schema 约定来简化交互规则的开发。方便用户 开发 CLI 插件来定制流程交互。

**为什么采取半自动的 CLI 的方式？**

「维新派 vs 保守派」的使用习惯都能兼顾。

*   部分用户习惯了使用自研的 CLI 小工具，调取构建平台 API 来发布
    
*   相当多的用户 路径依赖是 “肉眼看得见的操作” 的构建平台，需要兼顾这样的使用习惯
    
*   极少数用户 Git Flow 做自动化部署的方案，通用化并推广的阻力是很大的，因为对开发流程的侵入性很大，需要提供一种折中的办法
    

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBMDs6PfPWjJcrXvvLzmiauMg2CIUBicxG5JViaSqrjMjRULkSfS2xR6Psw/640?wx_fmt=png&from=appmsg)

*   用脚手架调用 API 的设计，可以独立于项目现有任何开发流程，让大家的不同方案共存
    
*   对这样的仓库来说，很简单地就新增了一个触发流水线的新途径，老手可以继续使用 Git Flow 触发流水线，新手可以使用 脚手架 触发流水线，覆盖了不同的使用场景
    

前端社区大量的开发工具也是类似的使用体验。

*   模仿这样的体验 / 思路 可以让 熟悉前端技术栈的开发者 更快上手
    
*   可插拔的设计，即开即用，即用即走
    

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBOtQNDsujYhNSIBbY89oia4l0xXaia8Em6wBVAOmia7qfREYibB3giaA2R1A/640?wx_fmt=png&from=appmsg)

不需要额外打开浏览器页面，边开发边部署完全没有问题。

*   自始至终开发者只需要关注 IDE 和 Gitlab
    
*   兼顾不同 IDE 的用户，无论是 VSCode 还是 WebStorm 都有终端功能，只需开发 CLI 即可适用于不同 IDE。(在前期阶段 IDE 插件的开发成本过于高昂)
    

避免使用 Gitlab CI 其他的功能，引入不必要的复杂度。

*   Gitlab CI 很多功能的支持度 在不同大版本下不一样
    
*   Gitlab CI 也有很多坑，躺在 Gitlab 官方仓库 Issues 好几年没解决的问题 比比皆是
    
*   不少 Gitlab 的 RESTful/GraphQL API 提供的字段，甚至不如 webhook events 內给的字段多，难以二次开发
    

**更好地维护 CI 脚本**

.gitlab-ci.yml 是 Gitlab CI 提供的流水线编排的 ProCode 方案，通过约定的格式 手写配置文件，即可自定义 CI 流水线。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBUrf6pjic7F2UXzNnHx8PDhlLZJ7zwHdsicpHpf6RQNf6ZF3p66eB4icxg/640?wx_fmt=png&from=appmsg)

这张图既是速查表，也是提高 Gitlab CI 脚本复用性的一种方法。

你可以使用 Gitlab CI 提供的「hidden job」特性和「代码复用」功能，

根据需要把每个 Job 的代码 拆分为「hidden job」「实体 job」两部分单独维护 (类似 abstract class 和 class 的关系)，让代码尽可能保持精简、灵活。

**MonoRepo 兼容**

**需要支持 MonoRepo 的原因是什么？**

*   前端更需要 MonoRepo，一个仓库中经常需要满足各种细粒度的 “复用”，从而很可能包含十几~ 上百个 NPM Package
    

*   现代的前端开发 单次开发经常涉及 数十个 NPM Package
    
*   有一个应用 / 包 就要去创建一个仓库 (对应各种平台的一连串项目 都要创建)，是不现实的，管理起来十分麻烦
    

*   然而，各种包管理器 第三方工具 各自为政，引入了大量互不兼容的 MonoRepo 方案，并且部分工具对项目开发流程的侵入性很强，和其他工具或流程是相斥的
    

*   各种基础设施对 MonoRepo 的支持，都相当不成熟
    

*   原本一个现代的前端应用需要做各种配置 部署到各种目的地，就已经相当冗杂了
    

*   现在还引入了 MonoRepo 机制，复杂度更是指数级地提升了，概念层出不穷
    
*   需要思考如何降低使用门槛 或者 克制使用 MonoRepo 工具的新颖能力
    

*   Gitlab 缺少 MonoRepo 相关的能力
    

*   不借助人为约定，任何工具其实都很难预知 哪些子应用需要在哪些开发环境下部署
    
*   通过文件变更来反向推测是不合理的，还是需要人工提供这样的信息
    
*   通过 git hooks 又太挫了
    
*   通过 Gitlab 的 WebUI 界面手动输入 环境变量很难用
    

**通过梳理 B 站前端应用的现状，不难发现:**

仅从项目结构的维度上，就有大量的 “分分合合” 的不同解决方案 (根据数目从多到少排列↓)

<table><tbody><tr><td width="108" valign="top"><strong>项目结构<br></strong></td><td width="466" valign="top"><strong>简介<br></strong></td></tr><tr><td width="108" valign="top"><p><strong>PolyRepo</strong></p></td><td width="466" valign="top" align="left"><p>简单来说，就是一个仓库对应仅一个应用如果有新的应用出现就再单独建仓<o:p></o:p></p></td></tr><tr><td width="108" valign="top"><p><strong>Monolith</strong></p></td><td width="446" valign="top" align="left"><p>一种&nbsp;Monolith&nbsp;的方案:&nbsp;一个仓库下存放一个大单体应用，内部包含多个 “子应用” 换而言之就是多个 “子应用” 复用同一个&nbsp;package.json 仅靠在执行&nbsp;npm&nbsp;scripts&nbsp;时使用不同的&nbsp;命令参数&nbsp;或&nbsp;dotenv&nbsp;文件来区分彼此,&nbsp;来打出不同的产物包</p></td></tr><tr><td width="108" valign="top"><p><strong>MonoRepo</strong></p></td><td width="466" valign="top" align="left"><p>一个仓库下存放多个应用，使用各种社区第三方&nbsp;monorepo&nbsp;tools 例如使用&nbsp;lernajs&nbsp;rushjs&nbsp;等提供的新颖的&nbsp;MonoRepo&nbsp;方案，根据某种配置 / 约定&nbsp;来自动识别&nbsp;仓库下的&nbsp;子应用<o:p></o:p></p></td></tr><tr><td width="108" valign="top"><p><strong>私有方案</strong></p></td><td width="466" valign="top" align="left"><p>例如&nbsp;把所有应用的文件夹并排存放在仓库根目录中，实际开发时需要&nbsp;cd&nbsp;到具体某个二级目录开发例如&nbsp;同一个仓库中&nbsp;甚至可以同时存在多个&nbsp;MonoRepo……<o:p></o:p></p></td></tr></tbody></table>

**社区中同时存在各种 MonoRepo 方案**

这里只枚举一些公司内部前端项目的常见工具

MonoRepo 是相当复杂的东西，下表透露的概念仅占不到 10%

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBLn14XSphV3hFia9pnqnH7ia9Y8OnuuLUUGTVEExvlECibkK1Tkbxcmibwg/640?wx_fmt=png&from=appmsg)

你看到了什么？

*   命令行的使用风格，完全不一样
    
*   有的工具不同大版本间的功能点相去甚远
    
*   有多少种配置文件，就有多少 “暗坑” 等着你
    
*   开发流程 会被或多或少地 “绑架”
    

这意味着，想通过某种 “胶水层” 兼容上述所有方案的所有功能点是不太实际的。

**那么 Jinkela Pipeline 是怎么做的呢？**

是从目录结构的角度切入的，这样做可以不侵入任何既有的解决方案。(换句话来说，也算是另辟蹊径 重复造轮子了)

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBrALuwZxt37kWPVbZ17nsW86iaHmGGAn0GmwGIXWOiak1EZ6vicLfqfD8w/640?wx_fmt=png&from=appmsg)

*   通过配置文件，要求开发者指定 “入口项目” 的路径通配符。
    
*   子应用的根目录下需要存放 描述「子应用——服务树 appId」对应关系的 配置。(配置会通过命令行交互自动填写，无需用户手动操作)
    
*   脚手架在仓库任意目录下执行时，会递归扫描 当前相对于仓库根目录的相对路径解析出，完整目录结构。
    
*   在启动任何命令时，将会检测开发者是否配置了路径通配符，从而弹出 “选择子应用” 的命令行交互。而后自动读取相关配置文件。(如果在子应用目录下启动时，则不会弹出该交互)
    
*   脚手架 会向 Gitlab CI 的 API 拼接、提交环境变量，向 CI 脚本表明这是一个 子应用，提供 子应用的相对路径。
    
*   如何判断是普通的文件夹还是 MonoRepo，这需要 CI 脚本中 统一兼容 npm yarn pnpm 等 MonoRepo 方案、或非 MonoRepo 的大仓方案，后续会触发差异化的构建流程。Jinkela Pipeline 使用的方案是 二次开发库 ultra-runner 提供的能力。
    

**优化**

从效率、稳定性、用户体验、灵活性几个出发点考虑，各做了一些优化。

**稳定性**

**充分利用好 lockfile 以保证构建环境一致性**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBHJeBgOrt5BksibTtCic15OBp4uFPB37kMsgm43OVHXrpRCCgDml64ceg/640?wx_fmt=png&from=appmsg)

在构建制品的过程中，经常会遇到一些问题，例如一些库并没有很好的遵循版本号规范，仅仅升级了小版本号就导致其他项目无法构建。再例如，自己开发环境下构建正常，但一到多人协作就无法复现相同的构建结果。导致这些问题出现的原因 是「构建本身是可变的」。因此，我们需要通过不可变构建 使得构建产物与预期相符。

虽然 lockfile 不是解决一致性问题的唯一要点，但至少可以在 install/build 的时候 **缩小问题规模**，防止因为 「每次 install 了不一样的东西」 才导致的偶发性的构建差错，减少排查问题时的干扰。

此外，如果充分利用好 lockfile，CI 脚本中即可通过「匹配 lockfile 文件的类型」来决定「整条 CI 流水线使用哪种包管理器」。

**效率**

**使用 Gitlab CI 提供的 DAG 功能，实现 并行 Job**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBOfOXF833RmaTndy8wsn3LfQm6OcLFMzZwvHCyNPXzgGBSwaHAia5Tbg/640?wx_fmt=png&from=appmsg)

我们不应该粗暴地串行所有的任务，而是**根据任务的重要性**划分执行批次 各自执行，这是为了 缩短 关键路径 (critical path)，复用时间，让你更快达成你想要的结果。

**包管理器 Store-dir 结合 CI 缓存**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBfnlRo2OhJxogvKDHVmQ1CzRukKSdLWoapSuWryX8YVnBRd8mgiaFcHQ/640?wx_fmt=png&from=appmsg)

针对 不同的 包管理器 进行优化，舍弃 npm install，改用 npm ci，舍弃 yarn，改用 yarn --frozen-lockfile。

越大的大仓 越能感受到使用 npm ci 带来的性能提升，蚂蚁肉也是肉。

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBBmkfz1a7YTLGdx2l9HHz0AzZlUH62N6VFoVgiauQPribzFHJ4sBP6OKw/640?wx_fmt=png&from=appmsg)

与此同时，可以按需使用 Gitlab CI 缓存，或结合 K8S Gitlab Runner 做更多优化。

**细枝末节的优化**

*   超级大的仓库，每次能不能只 git clone 我们需要的那部分？或者减少 clone 次数？
    

*   话说 超级大仓库 本身 就应该鼓励拆仓吧从源头上 减少依赖数目，减少 安装 / 构建过程 的复杂度
    

*   构建镜像 体积 本身也可以优化，例如 给不同的 job 分配不同功能的 构建镜像，那拉取镜像耗时自然就减少了
    
*   我们能不能把 边缘的不重要的任务 丢到 “垃圾机器” 上跑，而把另一部分计算密集的关键任务 放到 “重要机器” 上跑？
    
*   我们能不能集成地解决 各种加速源 的配置问题？替用户做好各种配置文件的附加处理？
    
*   我们能不能找出哪部分流程最频繁被执行？它们能逐步替换为高性能的算法 / 工具链吗？
    

*   _甚至更换 Node.js 的运行时？就像 Kaniko，Buildah 之于 Docker build 的关系一样。_
    

*   每次敲击键盘 用 jinkela-cli ci 也很长，我们可以内置更简短的命令 alias
    
*   我们可以把一些诸如模块加载、初始化的工作，从 首次加载 分散转移到 其他步骤中 隐藏起来吗？我们可以提前预载好相关逻辑吗?
    
*   如果某一时间段流水线激增，我们能削峰吗？可以在这种时候禁用用处不大的任务 或者 合理分配资源，来维持整体正常的发布体验吗？
    
*    ……
    

有很多改善性能的空间 可以被发现，很考验综合优化能力 💡

 **用户体验**

**对配置进行分门别类，优化不同项目的使用体验**

满足不同规模的前端业务团队的需要，分为以下四个级别:

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB92Lfdfqn2qzD4PicQnRzQQ5RZQ1DTJMqC5lKDt7ibp2PDySPmrZvpaMA/640?wx_fmt=png&from=appmsg)

*   80% 的配置都是默认值，一路回车即可
    
*   剩下的情况弹出交互，通过 API 获取 来自动补全，抑或是自动写入值到配置文件中，下次执行时跳过该交互
    
*   少数需要自定义的复杂项目 查阅文档完成配置即可
    
*   尚不存在的功能，则需要靠 开发插件 / 开放 API / 迭代功能 等形式，为业务方提供定向的技术支持
    

**渐进式地解决问题**

遇到现阶段难以打通的外部平台，我们至少可以先提供一个 “Placeholder”……

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBMxZAFGTf5g2ib7bXSQ6J06rzE01A5O9kH2FGDO9Q1ZguuLAshrRN2rw/640?wx_fmt=png&from=appmsg)

*   首先，至少要提供直达的快捷链接，让用户更快地触达指定的位置
    
*   接着，调用 API 或者哪怕提供默认值，也要干掉最常见的机械性的重复性的低级劳作
    
*   最后，深度集成某个功能，使其成为整个工具链 / 规范中的一环
    

**灵活性**

部分项目拥有边缘的开发流程的需求，往往需要添加项目特有的逻辑 / 配置项，这些需求肯定不能纳入 通用 CI 脚本 来维护，那 Jinkela Pipeline 是如何解决的呢？

**充分利用 Gitlab CI 的灵活性**

Jinkela Pipeline 提供了整条链路上不同位置的多态性

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBnkCsZApEyrKs9kzIMwZeIWUJmele0OrEjPwcPVRfoUcNQXlakOHqSg/640?wx_fmt=png&from=appmsg)

*   可以开发 CLI 插件，自定义交互逻辑，上报私有环境变量
    
*   通过传递约定的环境变量，覆盖 Jinkela Pipeline 默认值，执行不同逻辑
    
*   基于目录约定，可以读取并执行代码仓库下 自定义的 shell 脚本文件
    
*   .gitlab-ci.yml 可以让业务项目轻而易举地覆盖通用 CI 脚本，混入私有逻辑
    

**实际案例**

实际案例

*   配合 Node.js 服务器的特殊逻辑 实现染色功能
    
*   部署同一份代码到 指定的不同渠道上
    
*   推送配置到 不同的 BFF 服务上
    
*   筛选多个子项目 部署到活动平台上
    
*   ...
    

实际上大多数定制需求 都是 新增业务开发流程独有的 “变量”，结合简单的自定义脚本，来实现流程的灵活性。

这类需求高度雷同，我们需要通用化 & 简化 这种自定义能力。

这也是决定实现平台化的原因之一。⬇️

**平台化**

**没有平台时的难处**

*   难懂的白箱 就是 黑箱，有问题时用户还是会寻求技术支持，最后难免变成中心化地维护
    
*   触发仅提供 CLI 一种操作模式，缺少其他 正式的 / 备用的途径，未能覆盖所有使用场景
    
*   必须要满足更严格的上线规范，这是 CLI 远远无法提供的，需要服务器来解决
    
*   需要更多的监控告警，以便第一时间了解或预测流水线故障
    
*   Gitlab CI 原生 不支持「MR 合并时」触发，实现自动化 需要写很多夸张的 CI 脚本
    
*   某部门想让我们提供 Open API 供他们自研平台调用
    
*   ... ...
    

我们迫切需要解决这些核心体验问题。⬇️

**Dejavu 平台**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB9GM2aqoiaQKVPogNOaTJD414EbhlM4JQ4vakzKsB9R43ibpAWkAJQgRw/640?wx_fmt=png&from=appmsg)

Dejavu 的流水线功能，基于原来的 Jinkela Pipeline 的各种功能点，扩展出了 更多独属于平台才能实现的功能:

*   把所有流水线触发 都收拢到了 同一个接口中，便于我们实现 合规、门禁、监控
    
*   不仅支持 脚手架触发，现在更是能在 平台页面上触发
    

*   脚手架是线性的，页面上 则可以一览无余 看到各种流水线表单，覆盖不同的使用场景
    
*   我们优化了各种操作流程，尽可能让用户 减少生硬的配置 做到一键触发流水线
    

*   Dejavu 解决了 前端全链路灰度 的问题，支持 SSR/CSR/UMD (多种前端具体业务类型应用) 的灰度
    
*   简化项目接入的手续，支持自动补全的表单远比配置文件直观简洁
    
*   ……
    

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBoElNGKEZo4KTeW9kGr3aKGsAesiaCH9ttAzPA7PaYBTZ3CoQWshGWrg/640?wx_fmt=png&from=appmsg)

**LowCode 编辑器**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBO1s3hNDDgVdia1XHuN0CLN98IreEEoKGBlglCqJADDbUdicRqF4MTqOg/640?wx_fmt=png&from=appmsg)

CI 脚本 部分 从原来采用的 ProCode 方案，改为提供 LowCode 方案——CI 脚本节点编辑器，

由于叠加了一层私有实现的 DSL，使得我们可以设计出可视化的界面、支持任意 CI 方案、还能做很多灵活的 hack。

繁琐的执行规则、串并联关系 交给用户打理，我们如今仅需维护 纯粹的执行内容相关逻辑 和 Job 的元信息，是不是变得优雅一些了呢?

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBkpOiaAvwwaGHG5diceURK0ZsSAP5cnAW2zE6NLLcK5siaUz2YUWeLb2WQ/640?wx_fmt=png&from=appmsg)

这是对 Gitlab CI 的一个全新的尝试，帮助我们获得这些特性:

*   降低操作难度，拖拽 Job 即可编排流水线，不会占用 技术支持 资源
    
*   填写动态表单，即可自定义独属于自己项目的 Job 配置，使用成本和开发成本都非常低
    
*   可视化编排「流水线触发器」，基于 Gitlab Webhook Events 二次开发，实现更精细的自动化触发能力，例如 MR 合入、正则匹配 Commit Message、MonoRepo 文件变更等等
    
*   我们仍可以热更新 CI 脚本，任何 hotfix 变动 都能第一时间应用到 用户的项目中
    
*   提供 Job 市场，允许用户共享和复用 CI 脚本、执行环境
    
*   按单个 MonoRepo 应用的维度，动态生成 CI 脚本到 Gitlab 中执行
    

**总结**

**拥有一个这样的胶水层的收益是什么？**

*   和业务开发紧密结合，第一时间为业务打造弹性、适宜的开发流程
    
*   减少了大量的迁移成本，能让用户第一时间接入我们的方案
    

*   前端 / 后端 / NPM 包 / 静态资源 不同类型的项目 可以共处一室
    
*   MonoRepo / 大仓 / 小仓 不同目录结构的仓库 也可以通用
    
*   不侵入既有的开发流程，不同方案可以共存
    

*   以一个集中的方式 缓冲掉各种上游平台迁移的风险，减少重复造轮子的现象
    

*   沉淀的解决方案对内开源，还可以被用于其他任意项目
    
*   扩充更多用户，吸纳社区反馈、社区实现，让产品更加健壮。
    

*   构建发布的每一个环节都可以嵌入自定义逻辑，非常灵活
    

**Roadmap**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBaa141fDySJ7bo5ibqmYcfHOpy5X7v26KqYe0kByibv3oW0iaVNWvsrHNA/640?wx_fmt=png&from=appmsg)

*   早期前端解决的是 部署的问题，怎么部署，怎么部署不一样的东西
    
*   而后前端需要解决的是 如何追踪事故，如何避免本机构建性能孱弱的问题，换一个地方构建，避免多人协作的缓存冲突问题等等
    
*   在这之后，我们需要在部署过程中引入 流程规范、卡控 等约束，提高健壮性
    
*   **一个好的基础设施可以让操作成本变得足够低廉，落地团队规范将会是顺手推舟的事情**
    
*   释放了很多精力去跟上社区的脚步，探索提升诸如 MonoRepo 等开发体验的整合方案，需要回过头来 重新思考交互逻辑 是否简洁合理
    
*   支持更多的边缘部署场景、自定义能力，灵活性为业务提供了更多可能性
    
*   仓廪实而知礼节，**最终我们会从产研协同等更高维度 撬动起更多的资源和设施**
    

**启示**

DevOps 是**我们有什么才能做什么**

*   必须要接触企业内部私有的大量的业务开发场景，从**收集大量真实的需求**开始
    
*   **有什么基础设施**才能被拿来做成什么
    
*   适配团队的现状，**肌肉记忆、固有认知、历史遗留问题** 都可以是 被利用的东西
    
*   从一个能解决燃眉之急的**最小可行化产品**开始迭代
    
*   根据 / 预测 团队的需要，提供**定向的开发者体验**
    

一个一个的细节得到了满足，才能释放开发者精力去投入有价值的事情

前端社区的性质决定了 DevOps 需要 **关注哪些特别的开发者体验？**

*   前端的 **“端” 特别多而繁杂**
    

*   意味着需要尽可能支持 更多的垂直的 业务角度的部署场景
    
*   大量冗杂的手动开发流程 亟待实现半自动化 / 自动化
    
*   各种类型前端项目的数量级 是极其庞大的，需要 降低操作难度 和 提高复用性
    
*   **复杂度不会凭空产生和消失**，无非是手动解决还是自动化解决
    

*   **前端部署 相对简单** (大多数情形下只涉及静态文件的处理)
    

*   意味着不需要暴露过多晦涩难懂的参数配置，部署过程是 配置一次 长时间受益的
    
*   意味着流程优化的空间其实更大，光是把每个单点功能实现自动化就已经获得巨大收益了
    

*   前端社区**起步晚并处于飞速的变化中**
    

*   注定了一劳永逸的 “银弹” 是不存在的，需要渐进式地添砖加瓦
    
*   尽可能使用 目录结构、Shell、环境变量 等通用技术，堆叠起你的产品
    
*   尽可能减少对开发流程的侵入，减少维护成本，随时剥离掉被社区废弃的部分
    

**展望**

**还能更快发起流水线**

即使我们穷尽了无数种优化方法 （性能角度？流程优化角度？参数调优？），是不是就意味着我们没办法再优化了？

当然不是，我们还可以充分利用**心理学**上的一些小技巧。😆

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBMOfTkoZZRpDz7iaIv7v0sl1bN7YllQt0AkODVn8ib3YJuVOcOpWUFHXw/640?wx_fmt=png&from=appmsg)

**举例 ** **格式塔定律**

谁不喜欢井井有条的东西呢？

合理的结构化的摆放，可以用更少的字数，承载更多的信息量。

(还能暗示你，嗷 我们这个东西是相当高级的 安心)

**举例** **峰终定律**

坐国正中心的电梯时，假如你按了 [21 楼]，电梯在 19~20 楼的时候就提前告诉你快到了。诶，注意到尾声的这一点，你就感觉整个电梯流程是很快的。(事实上不然，你还是坐了 21 层的电梯)

这是因为我们的感知是非线性的，我们对 “决定性的时刻 “印象最为深刻，掩盖了平淡过程的体验。

当然，我们仍需要探索更快的触发方式，以覆盖不同使用场景:

*   GUI 鼠标点击 （Dejavu 页面）
    
*   TUI 键盘回车（命令行 脚手架）
    
*   **ChatOps 消息卡片 （计划中）**
    

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyB1GrLBGicForP1BHle5Chj4b0lbibLYtT90KZHzupzJMPVw8VYjMY1Mgg/640?wx_fmt=png&from=appmsg)

**集成更多功能**

DevOps 是个筐，啥都能往里装。

无非就是扩张自动化的边界，去 “侵蚀” 更多的协作流程，统统实现自动化。

(当然，也不是所有东西都适合自动化，是吧?)

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBbltkev34ia1w6icQUW9qaxSXlIpUR5hUr4aGuyTibMGrlTJnuibWUp081Q/640?wx_fmt=png&from=appmsg)

*   TAPD + Gitlab MR + 多流水线
    
*   一个工单內 搞定所有资源申请...
    
*   模版市场...
    
*   物料库...
    
*   回归测试...
    
*   巡检...
    
*   更多部署能力...
    
*   约定式路由...
    
*   验收...
    
*   集成错误监控...
    
*   性能报告...
    

**The End**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBGou216pU2u6KfTb3LGdnPEtrbM2PkHAlBbznMXhjg26eDWbmgM5pew/640?wx_fmt=png&from=appmsg)

有多少人工就有多少自动化，我希望我的人工 能给大家带来更多的变化，在背后助力大家成为五边形战士，节约精力用于提升自我，自信地部署，自信地构建，自信地做任何想做的事情。😎

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBPIaYfp9OltbNVcldNlYMtaicLOCr8C9dad5erzco9j3FeBZmG8lDFCw/640?wx_fmt=png&from=appmsg)

**扩展阅读**

● “猴子拿香蕉实验” _https://www.zhihu.com/question/20208922_

● 什么是幽灵堵车，如何避免？_https://www.bilibili.com/video/BV1pV411T728_

● 经典知识科普 - 大公司里怎样开发和部署前端代码？_https://www.zhihu.com/question/20790576/answer/32602154_

● 《What is DevOps?》 _https://www.bilibili.com/video/BV1tu411U7Cw_

● PNPM 的 MonoRepo 功能 _https://pnpm.io/zh/workspaces_（工作空间 | pnpm）_https://pnpm.io/zh/filtering_（过滤 | pnpm）

● 谷歌为什么使用 MonoRepo？_https://www.continuousdelivery20.com/blog/google-why-monorepo/_

● Jinkela Pipeline/Dejavu 流水线功能涉及的核心 Gitlab API _https://docs.gitlab.com/ee/ci/triggers/_

● Gitlab 优化流水线效率的参考案例 _https://docs.gitlab.com/ee/ci/pipelines/pipeline_efficiency.html_ (社区参考案例 _https://gitlab.com/gitlab-org/gitlab/-/issues_）

● _https://github.blog/2021-03-16-improving-large-monorepo-performance-on-github/_

● Gitlab CI 最近几年对 MonoRepo 支持了哪些功能点? _https://www.youtube.com/watch?v=oZ53aFqFCkE_

● 《Why is CI so Damn Slow?》_https://www.youtube.com/watch?v=iNJLHqWv7ls_

● 使用友好的语言提升产品对外形象 _https://semi.design/zh-CN/start/content-guidelines_

● 了解前端工具链 介绍完整的工具链 _https://developer.mozilla.org/zh-CN/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Introducing_complete_toolchain_

● 看看远处新兴的包管理器吧 _https://github.com/pnpm/pacquet_

● 开发一个小的原型来试错 的例子 _https://www.bilibili.com/video/BV16x411k7Sq_

● 知觉是连续的还是离散的？_https://mgv.pku.edu.cn/kxyj/bdrzysjkx/321533.htm_

**开发者问答**

**大家有哪些改善前端开发流程的最佳实践呢？**欢迎在留言区告诉我们。小编将选取 1 则最有价值的评论，送出**幻星集小电视爱丽丝挂件 1 个**（见下图）。**12 月 8 日中午 12 点开奖。如果喜欢本期内容的话，欢迎点个 “在看” 吧！**

![图片](https://mmbiz.qpic.cn/mmbiz_png/1BMf5Ir754TVLu26PCI4xmDmVnXiccJyBWKW4AiaY5qcWwx9A53B86ysq1NHDuNrrMEYEYknDP29hojjQUiaImCFg/640?wx_fmt=png&from=appmsg)

**往期精彩指路**

*   [哔哩哔哩 Android 客户端基于依赖注入实现复杂业务架构探索](http://mp.weixin.qq.com/s?__biz=Mzg3Njc0NTgwMg==&mid=2247496087&idx=1&sn=ca9edcace8079f793a460a893b08717a&chksm=cf2f34b2f858bda41a395f41d2d7d5963ae208ca26e1d1759eb276f406472e7f3c0298b5d132&scene=21#wechat_redirect)
    
*   [哔哩哔哩 iOS Bazel 进化之路](http://mp.weixin.qq.com/s?__biz=Mzg3Njc0NTgwMg==&mid=2247495295&idx=1&sn=b3048ac8bc52a931c644cec9312144a4&chksm=cf2f2b5af858a24cef4898d38a343300769b42c00f1ffcd4022355798acc9a432e440e259c63&scene=21#wechat_redirect)
    
*   [用 VSCode 基于 Bazel 打造 Apple 生态开发环境](http://mp.weixin.qq.com/s?__biz=Mzg3Njc0NTgwMg==&mid=2247494600&idx=1&sn=d9ca6ee69773fd0308a2e97b86a2b57b&chksm=cf2f2eedf858a7fbce7e524b03fc4a15dc913ebf7a35693a229947261b3a2f702f1c7836dbc4&scene=21#wechat_redirect)