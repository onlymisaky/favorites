> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9KOr5-C5cidp0te1IEg6vg)

![](https://mmbiz.qpic.cn/mmbiz_gif/YriaiaJPb26VPQqHC66RJFpttVIMWG83T3lWHahUD4bvhxlKSayjeV2ibvC5ydqklP9QHDPD3qHJM07TV3IfHstjA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

作者 | 荣剑英

引   言

随着业务的发展和架构的迭代升级，近一年 FreeWheel 核心业务团队对前端技术栈进行了大规模升级改造，针对多个新业务页面的开发需求，对产品按照业务模块进行了划分，形成了多团队协作开发的 polyrepo 模式。而对于团队之间的组件或模块的共享问题，结合社区的实践和公司内部尝试的经验，我们决定采用 monorepo 模式来满足共享需求，并对将代码仓库改造成 monorepo 进行了技术尝试和落地，下面是具体介绍。

monorepo 与 polyrepo 对比

monorepo 和 polyrepo 是两种代码仓库的组织形式。monorepo 是指包含多个不同项目的单一代码仓库，并且内部子项目具有明确定义的关系（如下图）。对，它不只是简单的把多个代码仓库放到一个代码仓库下，而是要去明确的定义这些代码仓库之间的关系。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6Nso6QKTCicwib37ibiacDFnMricg6SFicgcILia3hjwryvtaVOdTjJH1hLibpUQ/640?wx_fmt=png)

而 polyrepo 是指每个应用或库分别拥有各自的代码仓库，不会和其他代码仓库合并（如下图）。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6Nu8qUlU9FibQm7ibON9k5GDWe7L3M6llpsWAODk0ujWjPu0LblB9EMJRA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

以下是二者的对比，可以看出，结合二者的特点既可以避免重复的配置，又能够灵活根据团队情况合理控制仓库的数量和大小，并且在 monorepo 模式下，可以结合发包功能来解决多团队之间的共享问题。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NEIMtYpwKplLOJ6akqH6R9bN1P16VoSKZom1ZlLex8aEqbnYjqNwBiaQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

开发现状

目前 FreeWheel 核心业务团队就是以 polyrepo 的架构进行多团队迭代开发，整个产品按照功能模块和团队情况进行了拆分，各个页面独立开发独立部署。在 polyrepo 架构下，每个代码仓库内部的共享问题很容易解决，把需要共享的组件或功能提取到合适的文件里再导出即可。但对于不同代码仓库之间的共享问题就不是很容易解决了。对于底层的结构组件，FreeWheel 有一套自建的基础组件库供业务组开发人员使用。但是对于含有业务逻辑的上层组件，目前没有一个灵活统一的方案来满足这一需求。

在实践之前，我们明确了实践过程中可能会遇到的问题。

第一，已有代码仓库的 monorepo 转化成本问题。其需要对项目结构进行改造，包括但不限于 NodeJS，Yarn 的版本，插件安装配置，项目和各个包的 package.json 和 tsconfig.json，lint 和 format 的配置。这对于中小厂公司或者中小团队来说是不小的开销。如果各自为政，重复造轮子，则是一种低 ROI 的行为。

第二，维护多包依赖关系成本问题。当一个 monorepo 里拥有多个包（可发布的子仓库）时，手动维护它们之间的依赖关系是很耗费精力的。如下图的例子所示，这是一个 monorepo 内部的依赖关系图。当 E 包升级发布新版后，由于上层的 C 包和 F 包依赖 E 包，所以 C 包和 F 包需要跟着升级。那么依赖 C 包和 F 包的上上层包，也需要升级。这样递归下去，直到依赖链路上的包都升级完成。显然靠人工来完成升级是件费时费力且易出错的事情。

因此，带着这两个问题，我们在接下来的技术选型和实践过程中有倾向性的进行了取舍。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NakzNmBb3gA4dADIIdQz9TBuYIl7nXQWiciax9Gxyc3jAT8dojCLiaqdHw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

技术选型

基于以上阐述，我们近期对此上述需求和问题进行了技术调研和实践，尝试在 polyrepo 的基础上，对每个代码仓库进行 monorepo 转化，使每个仓库可以按需拥有多个子仓库，并且拥有发布 npm 包的能力。这样在不破坏现有产品架构的前提下，解决了团队之间代码共享的问题。这里说明一点，本次实践基于的前端项目使用的是 Yarn 3+ 版本，Node.js 16+ 版本，TypeScript 4.8 版本及以上。

其实在此之前，公司内部已经进行过一些尝试。我们创建了一个 monorepo，可共享的组件或功能都放在这个 monorepo 里进行统一发布和维护。随着使用发现，开发共享组件需要频繁切换仓库，跨仓库的本地调试不是很方便。并且，组件都放在一个 monorepo 里，对于组件所属哪个团队变得模糊。我们设想，如果在各自团队的代码仓库下也能发布需要共享的组件，这样所属明确，与这个统一的 monorepo 结合使用，也更加灵活方便。

因此，我们尝试给各个团队自己的仓库进行 monorepo 转化。目前社区内的 monorepo 工具还是比较丰富的。我们着重调研了以下几个工具。从稳定性、上手成本、功能，需求匹配度及收费情况等方面考虑进行技术选型，最终决定采用 Yarn workspace 来作为前端 monorepo 的管理方案。

![](https://mmbiz.qpic.cn/mmbiz_jpg/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NSMia906J2QB0f6wqgAkiawzsCqZKoYibcga0yhOolmXJwfOT5Y8l1ibEog/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

这里简单介绍一下。在 Yarn 的生态下，Yarn workspace 是 yarn 官方提供的一个 monorepo 管理方案。根据项目中包之间的关系进行链接，避免多个包之间相同依赖的重复安装，以节省空间。同时共享一个 lock 文件，统一各个包依赖的版本。

它的使用比较简单，在 package.json 中加入如下设置就可以声明一个 workspace，workspace 内的每一个 folder 都是单独的包，或称为子仓库。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NFv91qoZHvKAiaNI9mHGGmSEWoGWlLicZ3icUoV5rWKBib3H3IJMa3NPx3Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

同时 Yarn workspace 提供了 workspace 协议，用于在 package.json 声明依赖时实时访问最新代码，有效避免了 yarn link 产生的系统环境污染，示例如下：

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6N4iaicOYSmzL7y1o6L9OZ9bqrKYcgnO1k3pgtXp6oQoxgM2f8SESKwvNg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

针对维护多包依赖问题，Yarn 社区也提供了解决方案——Yarn version plugin。与社区中针对此问题的其他工具（比如 changesets）类似，它可以自动化的管理各个包的升级过程。该插件通过 Yarn git 等一系列内置插件，根据语义化版本的规则，提供了实用的 CLI 命令，比如 yarn version patch，给包升级 patch 版本，后边可以使用 --deferred 并结合 yarn workspace 来实现多包批量升级等等。

下面具体阐述我们的实践过程。

monorepo 工程实践

实现一键转换与更新的 CLI 命令

首先，我们针对上文提到的 monorepo 转化成本问题，实现了一个自动化转化 monorepo 的 CLI 工具。其自动化改造的主要过程如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NsjJvweCLeQc041ul3HCFJaMvkibyoMgvEOI7kqbRh5LaouzicSMCTITg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

脚本首先会生成 workspace 由 yarn workspace 来管理。然后为项目更新配置，下载所需插件等，比如下面的自动升级 yarn 及其配置。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NAp0gmu35AO2pczyOnr6aicJyPOL4ut99couI90SdnYXUt97TuA3ia1Hw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

安装 yarn workspace-tools 和 yarn version 插件。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NlQjFsAHGsicbMibib23jR5I12UENv82oHF9jxWZdJ0icgITZkaWVRelB3A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

更新项目 package.json。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6N829JCbFfMxvZvGrCfg9IDqHS5UjWFzadBIlTrUGXdvmFNEZgByvIFQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

修改 tsconfig.json，方便 packages 里的包配置可以用 extend 方式快速的继承。还可以根据需要修改 eslint，prettier 以及. gitignore 等配置文件。

接下来会生成用于快速创建，升级，构建，发布包的各个脚本，并与 husky 集成，后面会做详细阐述。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NIFtialJdFeB9zpcTNWJmNyUzX6HR6Uc5PcpJA3ibx0AKwfWzjN5fwmCg/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6N1VtvvcvLFKHSBiaynrLSXmIRvYfaDuppkibGgibevpwCsXhhAUV7brutw/640?wx_fmt=png)

最后调用生成的脚本自动创建一个 hello-world 包并构建发布，用户可以通过 npx -y 命令快速运行 hello-world 包，来检查项目是否已经改造完成。

基于此工具，通过运行下面的一行命令，已有项目仅需几分钟就可以自动地完成改造，转变成开箱即用的 monorepo 项目。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6N5ANNWBgfclvJxkq6gL2fN4YOvic6sa46Mt2bZiageBicxJqbmhxhQLmrw/640?wx_fmt=png)

此外，为了优化用户体验的，此工具添加了一些常用的参数和命令。-h 用于打印帮助信息，方便用户快速查看可用参数和命令。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NlqU16J0wsibp4vMJvEZmDwlupiawwCXW6iadRc7UoQbdsVTiaurXzN0UYw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

-v 用于打印版本。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NMjELbHx1MLXickiaxbp0ib2l0cDIyFeAia5JuHcjXbzEK4LxSmTh0nuHCQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

-c 用于查看功能迭代历史。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6New1VAibVy5OooEV3xrwbpPia4DKlEeqIjlhibfHcLHTnDhoUJmUibk5DPw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

update 交互式快速更新所需配置以及 update:all 一键更新所有配置。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6Nkhib5iaSdoiaRTMT50lQVmDicZiaM8yRv2ptVTWU7Fmg3S074I6ExTRyjOw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

实现自动化升级多包依赖的脚本

下面就来具体看看该工具生成的自动化脚本，主要使用了 yarn workspace，yarn version 插件以及 zx 库。

 pre-push 脚本

首先，我们基于 husky 拦截了 git push，在 push 之前进行多包升级的检查以及自动更新版本并提交。具体流程可见下图。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NicvgAnqbJDe41YiaVUuKC00ic0cPPU9LZ19j3IvsISsNJQ72kSWUBWsWw/640?wx_fmt=png)

下面来说一下细节。命令首先会执行 git fetch 来更新本地的分支，已获得最新的远端 commit 用于 yarn version 的比较。待使用者选择了具体的提交分支后，脚本会自动通过设置 changesetBaseRefs 来给 yarn version 提供待对比的 commit。接着执行 yarn version 提供的 check 功能，自动的递归检查所有待升级包及其依赖包是否已经设置了升级策略或当前版本是否已存在。如果检查失败，使用者可以利用其提供的交互式命令方便的对各个包的升级策略进行设置，此处的升级策略遵循的就是我们常见的语义化版本规范。设置完成后会生成一个 yml 文件，例子如下。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NgJl0u6e0qTo0zX4fEqTrgoS5u6JpmfYT4UeyPYt7xdibibfsvqFLicCjg/640?wx_fmt=png)

接下来脚本会再次验证升级策略是否设置完全，在检查无误后，会执行 yarn version 的消费功能完成特定包 package.json 文件 version 字段的修改，这里的消费指的是消费刚才生成的那个 yml 文件，消费完即删除。所以，该流程不会在 commit 里增添无关的文件改动。结合 FreeWheel 的分支管理策略，在消费阶段，脚本会根据在开始阶段使用者选择的分支来判断是否给包版本打 tag，用以区别是线上紧急修复问题的发版（1.0.5-V1.1）还是平时主分支的发版（1.0.5）。最后，脚本在检查完所有待升级包的新版本无误后，会自动生成一次 commit 并完成 git push。

整个过程对使用者来说几乎是自动的和透明的。一旦检查有问题，脚本会返回明确的错误信息和解决办法，无需担心有过多的心智负担。

 创建新包脚本

为了方便开发者快速创建新包，我们也提供了相应的自动化脚本，流程如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NvyJq8yS7ibCVK00PUTibcNGDfQDAqicDStCmEYQrKbCnIGo4gjZtY17MA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

命令会检查包名的合理性，检查无误后会在新包的路径下自动创建其所需要的 package.json，tsconfig.json，.npmignore，index.ts，以及组件 app.tsx 等文件。该脚本提供了快速集成单元测试的功能，也会自动创建单元测试所需要的项目配置文件，项目依赖，以及组件的测试用例。目前支持 vitest 单元测试和 react 组件，测试用例包括一个 hook (useState) 以及一个鼠标点击事件，代码如下。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NWhGh3WWLvO7KgHNjBo1iajc4jQD9RTswic8WJW7zcs6DMh1y0aILh7Yw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这样一个带有组件测试用例的可构建发布的包就创建完成了，开发者可以在此基础上自行添加业务逻辑和测试用例，省去了创建新包需要做的一些额外的的配置工作。

 交互式更新包脚本

除了创建新包，工具还提供了手动更新包版本的自动化脚本，流程如下图所示。和 pre-push 的功能一样，命令会去检查多包之间依赖关系，确保需要升级的包都设置了对应的策略，避免漏升。该命令可以方便的修改多包版本，结合 pre-push 脚本使用效率更佳。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NJ5S04cdsafm5ffOyQQQNricXG1NfZw27ZuxESBibGwQYOiaWIYKgv4c5g/640?wx_fmt=png)

 手动构建发包脚本

此外，该工具也提供了用于构建和发布包的自动化脚本，流程如下图所示。脚本接收待发布的包名作为参数（可以多个），通过 yarn workspaces 的过滤功能进行遍历，构建和发布，最终结果会打印到终端。该功能可用于需要快速发布一些测试包来进行调试的场景，也可以结合上面更新包的脚本来快速发布线上包。使用者可以自由组合，灵活完成各自的发包需求。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6Nl0wUBG8zELjiaRLTupw9DXNsr5YnB8YoibhAODA5Qr4icjmjTGzVTFjOA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

 集成于 Jenkins 及 Slack 的统一发包 CI Job

基于 FreeWheel CICD 团队为开发人员提供的一套持续集成持续部署流水线工具，开发人员可以方便的通过简单的配置，自由创建流水线完成各自项目的自动化任务。本次实践也提供了 CI 支持，将构建发包的工作集成到了 Jenkins 流水线，团队在 review & merge 相应代码到指定分支后，流水线会自动触发，在任务里判断是否有需要发布的新包，来自动完成各个包的安装，测试，构建以及发布。同时流水线将结果集成到了指定的 Slack Channel，第一时间通知开发人员发包的结果，实现端到端的自动化。发包的端到端流程图下：

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6N9beEdcia5AgcZR89M47cTG95hIOGzn5iaAibnGchBw4MZbVkqAyMW0OXg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

Slack 的通知结果分为 lint，build 以及 publish 三类，方便开发者区分具体的失败原因。如果是 lint 或 build 失败，那很有可能是代码有 bug，需要修复问题并重新 review。如果是 publish 失败，那有可能是版本号已经存在，只需用上述提到的快捷命令更新具体失败的包并再次提交即可。

![](https://mmbiz.qpic.cn/mmbiz_png/YriaiaJPb26VOibM1FzgpYIc3zxgJglMy6NZb80TgCbDwHyTsLFNGx5FFNd0ZoNUQPKNPYZ6PQqGPaJIIrqDyKJ5Q/640?wx_fmt=png)

至此，改造 monorepo 进行升级发包的端到端流程就完成了。

总  结

以上就是本次实践的全部内容，我们在原有 polyrepo 的基础上，对已有代码仓库的 monorepo 转化进行了实践，概括起来实现了以下功能：

*   一键快速（几分钟）改造代码仓库为 monorepo 的 CLI
    
*   增强 pre-push，自动对项目下的包进行检查和升级
    
*   生成创建，升级，发布等对包的快捷命令和脚本
    
*   集成 Jenkins 流水线，自动发布新包并通知开发人员
    
*   撰写工具帮助文档和在线手册
    

目前我们已经在四个应用级代码仓库实践了 monorepo 方案，发布公共组件数十个。下一阶段我们会持续优化用户体验，比如对自动生成单元测试做进一步完善，对创建新包做更细致的校验，尝试搭建已发布组件的文档系统等。随着使用的团队越来越多，会提供更多实用的功能。

 作者介绍

**荣剑英**，FreeWheel 高级开发工程师，毕业于天津大学，对前端框架开发，前端工程化等领域感兴趣，热衷新技术的探索与实践。

今日好文推荐

[15 年做不好的代码搜索，基于 Rust 重写引擎终于搞定：GitHub 声称能从此 “改变游戏规则”](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651156431&idx=1&sn=07b8156d7794c0e3d4895fb4c0991c7b&chksm=bdb8979c8acf1e8aad370f504e2d64a6efcf766651c7702c786e13a8a86fc42ffb8ed2f1c75e&scene=21#wechat_redirect)

[搜索引擎技术大战，始于今日](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651156618&idx=1&sn=a8e0585cbb0f4d580957ab598129625b&chksm=bdb888d98acf01cf69cd221c048833497157edfc13ed2de5e55cd0f28acf1234e732b38a8fcf&scene=21#wechat_redirect)

[18.3 万美元 offer 到手！ChatGPT 通过谷歌 L3 面试：留给谷歌的时间不多了](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651156431&idx=1&sn=07b8156d7794c0e3d4895fb4c0991c7b&chksm=bdb8979c8acf1e8aad370f504e2d64a6efcf766651c7702c786e13a8a86fc42ffb8ed2f1c75e&scene=21#wechat_redirect)  

[我被微服务坑掉了 CTO 职位](http://mp.weixin.qq.com/s?__biz=MjM5MDE0Mjc4MA==&mid=2651156320&idx=1&sn=8de49e53191865d9d4ed7801cfb6642f&chksm=bdb897338acf1e25a4874f147dae16c1ad31851865ccf8be190998cfe925c77359b63cbb1b92&scene=21#wechat_redirect)

 活动推荐

2023 年 3 月 17-18 日，ArchSummit 全球架构师峰会将落地北京海航万豪酒店。来自百度、京东、华为、腾讯、斗鱼、中国信通院等企业与学术界的技术专家，将就数字化业务架构、低代码实践、国产化替代方案、分布式架构等主题展开分享讨论。

目前已上线数字化场景下的业务架构、低代码实践与应用、国产软件优化迭代之路、多数据中心的分布式架构实践、软件质量保障、技术 - 产品 - 业务、高并发架构实现、架构师成长与团队搭建落地实践、大数据和人工智能融合、大规模微服务架构演进、可观测技术落地、云原生大数据实践等多个专题，点击阅读原文去官网查看大会日程。

会期临近，门票即将售罄，购票或咨询其他问题请联系票务同学：15600537884（微信同电话）

![](https://mmbiz.qpic.cn/mmbiz_jpg/FE4VibF0SjfM2nAgtPCZ5aC9xoMfxiaFvntD9GEA6muVwibic9vFPyH1nkrkAXsicI2ic6CJQOQh15tLu0EGml1ayLeg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)