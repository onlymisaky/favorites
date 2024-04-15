> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0TVFRVxRukBGXSrcLt_vQQ)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

作者：方长_beezen  

原文地址：https://juejin.cn/post/7342360674151858202

前言
--

在当今飞速发展的软件开发领域，面对日益复杂的项目结构和不断增长的开发挑战，各团队需要不断调整其开发工作流程，以适应变化中的需求。随着项目的发展，我们发现传统的单一代码库在应对多项目、多库和多服务的情况下显得力不从心。

正是在这个背景下，Monorepo（单一仓库）的理念崭露头角。Monorepo 不再是抽象的概念，而是成为了解决日益复杂软件开发挑战的切实有效的工具之一。通过将多个项目、库或服务统一存储在一个版本控制的存储库中，Monorepo 为团队提供了更集中、更统一的开发环境。

然而，实现 Monorepo 的过程中存在多种方法，因此明智的选择显得尤为重要。在本文中，我们将深入探讨团队面对项目瓶颈时，为何考虑将开发架构从 Multirepo 迁移到 Monorepo 的决策背后的实际项目经验。同时，我们将分享关于 2024 年最为普遍的 Monorepo 工具，以及我们在选择和应用这些工具时的决策过程。这样的实践洞察有助于我们更全面地理解 Monorepo 的实际应用，并为团队在迁移或实施 Monorepo 时提供有益的指导。

Multirepo 的挑战
-------------

Multirepo 是一种软件开发结构，其中每个项目或组件都有独立的代码仓库。这种分散的结构可能导致项目间协同开发困难，版本控制和依赖管理变得复杂。随着时间推移，不一致的构建和部署流程、降低的可维护性以及困难的持续集成将成为项目开发瓶颈。

我们团队内部使用的跨端框架项目支持一套代码直接生成多种应用，采用 Multirepo 项目架构。该项目由一个 CLI 工具模块和多个 Plugin 插件模块组成，它们分别存储在不同的项目仓库中，独立进行维护。然而，在几年的产品发展和几十个版本迭代之后， CLI 和 Plugin 模块之间出现了较多的耦合逻辑。例如，CLI 模块需要读取项目 Config 配置文件中的信息并解析后传递给 Plugin 插件内部使用。当开发者使用低版本 CLI（未读取 Config 配置）与高版本 Plugin（需要接收解析后的 Config 配置）配合时，可能会遇到项目编译报错或功能无法生效的问题。

在设计初期，我们将各个插件（Plugin）之间的公共逻辑抽离到一个公共插件中。然而，由于项目分散管理，维护工作变得疏忽，导致各个插件之间慢慢产生了较多的耦合逻辑。当开发者在使用多个插件协同编译一个项目时，很容易遇到插件间不兼容的报错问题。为解决这一挑战，我们投入了大量精力处理插件之间的兼容性问题，并整理了兼容的多种插件和 CLI 的固定组合版本至文档。然而，这也给开发者带来了相当大的心智负担。

最终，为了应对不断增长的软件开发挑战，并为团队提供更高效、更一致的开发环境，我们决定将原有的多仓库（Multirepo）架构转变为更为合理的单一仓库（Monorepo）架构。我们相信这一变革将为我们带来更优越的使用体验、更协同的代码开发、更简化的版本管理以及更流畅的开发流程。接下来，我们将首要分析 2024 年常用的 Monorepo 工具，并为选择一个最适合的工具做出决策。

常用 Monorepo 工具
--------------

在采用 Monorepo（单一仓库）架构的软件开发中，工具的选择是至关重要的。合适的 Monorepo 工具能够帮助团队更高效地管理大规模代码库、提升协同开发体验以及优化构建和部署流程。

直至 2024 年，目前在前端界比较流行的 Monorepo 工具有 Rush、Turborepo、Lerna、Yarn Workspaces、Pnpm Workspaces、Yalc、npm Workspaces 和 Nx，下面将会简单分享各个热门工具的优缺点。

### Rush

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ib1KnPHxpXB35ibj4ddvylgGd6d5XPSEC7EKXLWSD6Iv8XqVNibAvpFg8g/640?wx_fmt=png&from=appmsg)

「Rush」 是由 Microsoft 打造的 Monorepo 管理工具，旨在优化大型项目的构建和开发流程。它支持同时管理多个包，提供自动版本管理、并行构建、增量构建等功能，通过统一的命令行工具简化 Monorepo 的操作。尽管具有完整的生态系统和强大的社区支持，但学习曲线可能较陡峭，适用于大型项目而对小型项目可能显得过于庞大。

「优点：」

0.  「完整生态系统：」 Rush 提供了一系列工具和脚本，构建了一个完整的 Monorepo 生态系统，从版本管理到构建发布都有涵盖。
    
1.  「自动版本管理：」 具备自动版本升级和依赖管理的功能，简化了维护过程，减轻了开发者的负担。
    
2.  「并行构建和增量构建：」 Rush 支持并行构建，提高了整体构建效率，同时也支持增量构建，仅构建发生变化的包，节省了构建时间。
    
3.  「社区支持：」 作为由 Microsoft 支持的项目，Rush 有庞大的社区基础，保证了持续的更新和维护。
    

「缺点：」

0.  「学习曲线：」 Rush 提供了丰富的功能，学习曲线相对较陡峭，可能需要一定时间来熟悉和掌握。
    
1.  「适用性：」 由于其强大的功能集，更适用于大型项目，对于小型项目来说可能显得过于庞大，不太合适。
    

### Turborepo

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibeX69iaOBcIlZNaDQhvB1lez3PYfQLP1MaYYKdYOWIptR6c1kZtu8Mug/640?wx_fmt=png&from=appmsg)

「Turborepo」 是专注于提升大型 Monorepo 项目性能的工具，通过支持并行构建和增量构建等功能，显著减少了构建时间，同时具备分布式缓存和模块化工具链设计，为开发者提供了更灵活的定制选择。虽相对较新，但其性能优化和灵活性使其在大型项目中备受欢迎。

「优点：」

*   「性能优化：」 Turborepo 专注于提升 Monorepo 项目的性能，通过并行构建和增量构建等手段，显著减少了构建时间。
    
*   「定制灵活：」 工具链模块化设计，使得开发者可以根据项目需求选择和配置不同的工具，提供更大的灵活性。
    

「缺点：」

*   「较新项目：」 相对于一些更成熟的 Monorepo 工具，Turborepo 可能相对较新，社区生态和文档可能相对有限。
    
*   「学习曲线：」 与其他 Monorepo 工具相比，Turborepo 的学习曲线可能较陡峭，需要一定时间的适应。
    

### Lerna

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibq4WQQ7NHyc3N8GtCVb1mFtcDI9KTd3kPJFhRaUg9BroNLpUJPfbibcw/640?wx_fmt=png&from=appmsg)

「Lerna」 是一款专为管理具有多个软件包的 JavaScript 项目而设计的工具，旨在优化大型 Monorepo 项目的版本管理、依赖共享以及发布流程。通过提供一套强大的命令行工具，Lerna 简化了 Monorepo 项目的操作，使开发者能够更轻松地管理和维护庞大的代码库，提高开发效率和代码的可维护性。

「优点：」

0.  「版本一致性：」 Lerna 有助于确保 Monorepo 中各个软件包的版本保持一致，减少了因版本不一致而导致的问题。
    
1.  「依赖管理：」 提供了方便的依赖管理机制，允许在项目中共享和重用代码，减少了重复劳动。
    
2.  「发布自动化：」 Lerna 支持自动化的发布过程，能够一次性发布所有更新的软件包，提高了发布的效率。
    
3.  「操作简便：」 具备强大的命令行工具，使得 Monorepo 项目的操作变得简单易行，包括软件包的添加、删除、测试等。
    

「缺点：」

0.  「上手难度：」 对于初学者来说，Lerna 的学习曲线可能较陡峭，需要花一些时间熟悉其概念和操作。
    
1.  「维护成本：」 随着项目的规模增加，Monorepo 中的软件包数量可能庞大，这会增加维护的难度和成本。
    
2.  「配置复杂：」 部分用户认为 Lerna 的配置相对复杂，需要仔细调整以满足特定项目的需求，可能需要更多的配置文件。
    

### Yarn Workspaces

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibWMmHvqDftUClvuV2zib41fUQvv3DG3TUz7OQGOicqBJib8FSVic5eyRqsw/640?wx_fmt=png&from=appmsg)

「Yarn Workspaces」 是 Yarn 包管理器的一项强大功能，专注于优化 Monorepo 项目的依赖关系管理。它允许将多个包组织在同一个版本控制存储库中，通过统一依赖版本解决了版本冲突问题，同时通过共享顶层 `node_modules` 目录，有效减小了磁盘占用。Yarn Workspaces 支持交叉包引用，提供了更灵活的项目组织方式，并通过并行安装加速了整体构建速度。它是一个轻量级而功能强大的 Monorepo 解决方案，尤其适用于中小型项目和对简单性要求较高的团队。

「优点：」

*   「依赖一致性：」 通过统一依赖版本，有效解决了依赖冲突和版本不一致的问题，提高了项目的稳定性。
    
*   「资源共享：」 通过单一 `node_modules` 目录，减小了磁盘占用，提高了模块查找效率。
    
*   「灵活性：」 允许在 Monorepo 中的包之间进行相互引用，提供更灵活的项目组织方式。
    

「缺点：」

*   「初始学习曲线：」 对于新用户来说，Yarn Workspaces 的使用可能需要一定时间的学习，特别是对于没有使用过 Yarn 的开发者。
    
*   「功能相对简化：」 与一些专注于 Monorepo 管理的工具相比，Yarn Workspaces 的功能相对简化，可能不适用于所有复杂的项目结构。
    

### Pnpm Workspaces

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibNX1vx63yibicORUs8h9NrzWjdsf9QKPEPuK5zhsvJ1icqMhmzS3EZDUTw/640?wx_fmt=png&from=appmsg)

「pnpm workspace」 是 `pnpm` 包管理工具的一个功能模块，专注于支持 Monorepo（单一仓库）的工作区管理。它通过高效的依赖共享机制，将多个相关的包集中管理，实现了更快速、更节省空间的依赖安装和执行。`pnpm workspace` 提供了命令行工具，支持多包管理、依赖共享、版本一致性维护、脚本运行等功能，使得在单一仓库中管理多个包变得更为便捷和高效。尽管可能存在学习曲线和部分生态支持的挑战，但其在 Monorepo 场景下的优势在于提供了快速、节省空间、版本一致性等方面的综合解决方案。

「优点：」

*   「快速的安装和执行：」 `pnpm` 利用了硬链接和符号链接的方式，使得依赖的安装和执行更加迅速。
    
*   「磁盘空间节省：」 通过依赖共享机制，`pnpm` 节省了大量磁盘空间。
    
*   「版本一致性：」 工作区功能有助于保持包的版本一致性，降低了由于版本不一致导致的问题。
    

「缺点：」

*   「学习曲线：」 对于不熟悉 `pnpm` 和工作区概念的开发者来说，需要一些时间来适应和学习。
    
*   「部分生态支持：」 虽然 `pnpm` 在支持的生态方面不断增加，但与其他更成熟的包管理工具相比，仍有一些生态上的差距。
    

### Yalc

「Yalc」 是一款专注于本地软件包管理的工具，为 Monorepo 项目提供了轻便而强大的解决方案。其主要功能包括将本地修改的软件包快速发布到本地 registry，并在其他项目中进行引用，以及支持在 Monorepo 中进行快速本地迭代，提高开发效率。Yalc 的简便性和专注于本地开发的特点，使其成为解决 Monorepo 项目中本地软件包管理问题的有力工具。

「优点：」

*   「本地开发流畅：」 Yalc 提供了一种无缝的本地开发体验，使得在 Monorepo 项目中的包之间可以更轻松地进行本地调试和测试。
    
*   「避免发布到公共 registry：」 通过将包发布到本地 registry，避免了不必要的包发布到公共 registry 中，保持了项目的干净和高效。
    
*   「本地调试效率：」 允许对一个包进行本地修改并快速在其他项目中测试，提高了本地调试效率。
    

「缺点：」

*   「局限于本地使用：」 Yalc 主要用于本地开发和测试，不适用于将包发布到生产环境。
    
*   「仅适用于 Monorepo：」 Yalc 的优势主要体现在 Monorepo 项目中，对于单一项目的情况可能并不是最优选择。
    

### Npm Workspaces

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibJ83cYF92loXsKFtfiaEp8bV7c1Bl1DNQHA0Y6V2EXjgicVaMmajWAIiaA/640?wx_fmt=png&from=appmsg)

「npm Workspaces」 是 npm 包管理工具的功能模块之一，旨在支持 Monorepo（单一仓库）结构的项目。该功能允许在单一仓库中管理多个包，通过一个统一的 `package.json` 文件来管理各个包的依赖和脚本。npm Workspaces 提供了一系列命令和配置，使得开发者可以更便捷地进行多包的管理，如依赖安装、脚本执行等。尽管在某些方面不如其他专业的 Monorepo 工具强大，npm Workspaces 提供了一种相对轻量级的方案，适用于一些小型或者简单的 Monorepo 项目，无需引入额外的复杂性。

「优点：」

0.  「简单易用：」 npm Workspaces 提供了一种相对简单的 Monorepo 管理方案，易于上手和使用。
    
1.  「内建支持：」 作为 npm 的一部分，npm Workspaces 不需要额外的安装，无需引入其他工具，方便集成到已有项目中。
    
2.  「灵活性：」 对于小型或简单的 Monorepo 项目，npm Workspaces 提供了足够的灵活性，无需引入过多复杂性。
    

「缺点：」

0.  「性能问题：」 随着项目规模的增大，npm Workspaces 的性能可能会受到影响，尤其是在进行依赖安装时。
    
1.  「生态相对薄弱：」 与一些专业的 Monorepo 工具相比，npm Workspaces 的生态系统相对较小，可能缺乏某些高级功能和插件。
    
2.  「限制性：」 在某些高级场景下，npm Workspaces 可能无法提供足够的灵活性和功能，无法完全替代更专业的 Monorepo 工具。
    

### Nx

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibxfOHbPJqvHJSEtlbVzVgHPNP0rKib9m1eQvg5If3qJvyV1xLxW9H8OA/640?wx_fmt=png&from=appmsg)

「Nx」 是一个开源的工具，专为管理和开发大型 Monorepo 项目而设计。它建立在 Angular CLI 之上，提供了一套功能强大的工具和插件，支持多语言、多框架的项目。Nx 的核心理念是通过插件化的方式，为开发者提供更高层次的抽象，以提高项目的可维护性、可扩展性和开发效率。Nx 支持生成可重用的领域库、定义和执行一致的工作流，以及提供强大的可视化工具来监控项目和性能。

「优点：」

0.  「强大的插件生态：」 Nx 提供了丰富的插件生态系统，支持多语言、多框架，使得开发者可以选择最适合其项目的工具。
    
1.  「一致的工作流：」 Nx 引入了一致的工作流程，通过定义任务和脚本，提高了多包项目的开发效率和一致性。
    
2.  「全面的可视化工具：」 Nx 提供了全面的可视化工具，帮助开发者更好地理解项目结构、监控性能，并提供快速导航和跳转。
    

「缺点：」

0.  「学习曲线较陡峭：」 由于 Nx 提供了丰富的功能和抽象，初学者可能需要花费一些时间来理解和熟悉其工作原理。
    
1.  「依赖于 Angular：」 Nx 的核心建立在 Angular CLI 之上，因此对于不使用 Angular 框架的项目可能显得过于重量级。
    
2.  「复杂性增加：」 尽管 Nx 提供了丰富的功能，但对于小型项目而言，引入 Nx 可能带来不必要的复杂性。
    

### 小结

<table width="NaN"><thead><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><th data-style="border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px;">工具</th><th data-style="border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px;">介绍</th><th data-style="border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px;">优点</th><th data-style="border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px;">缺点</th></tr></thead><tbody><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Rush」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">由 Microsoft 开发，为大型 Monorepo 项目提供全面的支持。具有完整的生态系统，自动版本管理和并行构建。学习曲线较陡峭，更适用于大型项目。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、完整生态系统 2、自动版本管理 3、并行构建</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、学习曲线较陡峭 2、对小型项目可能显得过于庞大</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgba(216, 156, 246, 0.467);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Turborepo」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">旨在提供高度可配置的 Monorepo 解决方案，支持自定义构建流程和任务。灵活性较高，适用于各种项目。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、高度可配置 2、支持自定义构建流程</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、相对较新，可能缺乏一些成熟的功能和社区支持</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Lerna」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">专注于管理具有多个包的 JavaScript 项目，提供了一组工具用于优化 Monorepo 的管理。支持并行构建，版本管理等。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、专注于 JavaScript 项目 2、并行构建 3、版本管理方便</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、学习曲线较陡峭 2、配置不够灵活</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgba(216, 156, 246, 0.467);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Yarn Workspaces」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">Yarn 的一部分，提供了一种 Monorepo 管理方案，允许多个包共享相同的<code data-style="font-weight: 700; font-family: Menlo, Monaco, Consolas, &quot;Courier New&quot;, monospace; font-size: 1em; color: rgb(145, 109, 213); word-break: break-all; overflow-x: auto; background-color: transparent; border-radius: 2px;">node_modules</code>。轻量级，易于上手。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、轻量级 2、易于上手</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、功能相对比较单一</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Pnpm Workspaces」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">Pnpm 的一部分，提供了与 Yarn Workspaces 类似的功能，支持多个包共享依赖。通过符号链接进行高效的依赖管理。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、高效的依赖管理 2、易于上手</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、功能相对比较单一 2、需要适应符号链接的概念</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgba(216, 156, 246, 0.467);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Yalc」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">允许在不发布到 npm 仓库的情况下共享本地包，适用于本地开发和测试。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、本地包共享方便</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、可能不适用于所有场景，特别是在需要发布到公共 npm 仓库时</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「npm Workspaces」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">npm 的一部分，提供了在 Monorepo 中管理包的功能。与 Yarn Workspaces 类似，但在某些方面有所不同。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、与 npm 集成</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、功能相对简单</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgba(216, 156, 246, 0.467);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">「Nx」</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">针对 Angular 项目的工具，提供了一套强大的 Monorepo 管理功能，包括构建、测试、文档生成等。专注于提高 Angular 项目的开发效率。</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、针对 Angular 项目优化的强大功能集</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、针对非 Angular 项目可能显得过于专业化，学习曲线较陡峭</td></tr></tbody></table>

详细对比分析
------

各 Monorepo 工具的统计数据来源于 stateofjs.com 网站, 由于 2023 年数据暂未出炉，截止数据为 2022 年底。需要注意的是，数据的来源样本可能会一定程度影响整体数据分析，因此这些统计数据仅供参考，不代表绝对性。同时，一些流行度较低的工具可能未被纳入统计。

下面将从 Monorepo 工具的认知度、使用度、关注度和满意度四个方面进行简要分析：

### 认知度

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibCPWYibUEnjK52fAVZtwwqvhtEtfNokBO9XM1msjghKx7WrBNrKBL77w/640?wx_fmt=png&from=appmsg)

从认知度的角度来看，pnpm 和 turborepo 在大家的认知中逐渐上升，显示出明显的增长趋势。npm Workspaces（npm 高版本才支持）的数据上有相对的增长，但在工具领域的知名度基本保持不变。而相对于其他工具，yarn Workspaces 和 lerna 的知名度则呈现出一定的下降趋势。

这一定程度上反映了新兴 Monorepo 工具在大家中的接受度不断提升，而传统 Monorepo 工具并未能保持其领先地位，因此整体市场份额逐渐减少。

### 使用度

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ib2A1cY0QjvIIwsYHAvEMNETVeC4e5VfgHFiapq75UaIhVxCNqjU88y9w/640?wx_fmt=png&from=appmsg)

在使用度方面的分析显示，Lerna 的使用率明显下降，从 25% 降至 22%。这可能反映了一些开发者转向了其他更适应他们需求的工具，可能是因为 Lerna 在应对现代 Monorepo 架构的挑战方面遇到了一些限制。与此同时，yarn Workspaces 和 npm Workspaces 的使用率都为 26%，已经超越了 Lerna，这表明开发者对于更集中的 Monorepo 管理方式的需求在增加。pnpm 的使用率从 13% 上升到 21%，呈现明显的上升趋势，可能是因为其快速的安装速度和独特的存储机制吸引了更多开发者。另外，Turborepo 从 3% 上升到 9%，显示了一定的增长，这可能是因为 Turborepo 在提供更快速的构建和增量编译方面的性能优势引起了开发者的关注。

### 关注度

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibNYmWibBxlJwEXX0mq2RTMnw9eHuh9AmrafFiadf5xGcD01haA5IqhHyA/640?wx_fmt=png&from=appmsg)

在关注度方面的分析显示，Turborepo、pnpm 和 Nx 的关注度遥遥领先，而 npm Workspaces、yarn Workspaces 和 Lerna 则呈现明显的下降趋势。这也一定程度上说明了老牌 Monorepo 工具逐步趋于稳定，缺少了新的特性能力输入，而新兴的 Monorepo 工具持续为开发者带来惊喜，引起了强烈的关注。

### 满意度

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibxF5IInet2ibrkqBFh7rhibxcic2kgswPryPaXxnD2vtKGHMnooianMDvvQ/640?wx_fmt=png&from=appmsg)

在满意度方面的分析显示，pnpm 和 Turborepo 的满意度遥遥领先，都高达 90% 以上。这高满意度可能反映了它们在用户体验和功能性方面的优势。相比之下，npm Workspaces 和 yarn Workspaces 则呈现一定程度的下降，这可能是因为它们在一些方面的性能或功能上没有跟上新兴工具的发展。另外，Lerna 的满意度有较为明显的下降，从 60% 降至 48%，这可能是因为用户对于一些老牌 Monorepo 工具的期望在逐渐改变，对于更现代、更高效的工具有了更高的期待。

### 小结

<table width="NaN"><thead><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><th data-style="border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px;">角度</th><th data-style="border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px;">说明</th></tr></thead><tbody><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">认知度</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、pnpm 和 turborepo 的认知度上升 2、npm Workspaces 有轻微增长，但整体市场份额下降 3、新兴 Monorepo 工具逐渐受到认可，而传统工具的领先地位减弱。</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgba(216, 156, 246, 0.467);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">使用度</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、Lerna 的使用率下降至 22%，可能受到现代 Monorepo 挑战限制的影响。2、yarn Workspaces 和 npm Workspaces 的使用率达到 26%，超越了 Lerna，显示出对更集中 Monorepo 管理方式的需求上升。3、pnpm 的使用率从 13% 上升至 21%，呈明显增长趋势，可能因为其快速安装和独特存储机制吸引开发者。4、Turborepo 的使用率从 3% 上升至 9%，可能因其提供更快速构建和增量编译的性能优势引起关注。</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">关注度</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、Turborepo、pnpm 和 Nx 的关注度领先，而 npm Workspaces、yarn Workspaces 和 Lerna 呈现下降趋势。2、老牌 Monorepo 工具趋于稳定，缺乏新特性输入，而新兴 Monorepo 工具不断带来惊喜，引起强烈关注。</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgba(216, 156, 246, 0.467);"><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">满意度</td><td data-style="border-color: rgb(223, 226, 229); padding: 12px 7px; line-height: 24px; min-width: 120px;">1、pnpm 和 Turborepo 的满意度均超过 90%，显示它们在用户体验和功能性方面的优势。2、npm Workspaces 和 yarn Workspaces 略有下降，可能因为在性能或功能上没有跟上新兴工具的发展。3、Lerna 的满意度从 60% 下降至 48%，可能反映用户对老牌 Monorepo 工具期望逐渐改变，对更现代、高效的工具有更高期望。</td></tr></tbody></table>

Monorepo 中的依赖管理
---------------

在全面评估各个 Monorepo 工具的优劣势，并结合团队实力、认知度、使用度、关注度以及满意度等多方面因素，我们初步确定了 Lerna、Yarn Workspaces 和 Pnpm Workspaces 这三个工具用于企业级 Monorepo 项目管理。

然而，通过查阅 「Lerna」 官方文档的 Legacy Package Management 章节，我们了解到它将不再负责安装和链接项目中的依赖项，而将这一任务交由更优秀的包管理器，如`npm`、`yarn`和`pnpm`来处理。具体原文如下：

> The important mental shift is to recognize that lerna is not responsible for installing and linking your dependencies in your repo, your package manager is much better suited to that task.
> 
> The way to achieve this is by using your package manager's `workspaces` feature. See their respective documentation here:
> 
> *   `npm` (https://docs.npmjs.com/cli/using-npm/workspaces)
>     
> *   `yarn` (https://yarnpkg.com/features/workspaces)
>     
> *   `pnpm` (https://pnpm.io/workspaces)
>     

因此，在工具选型时，我们需考虑当前工具的可升级性和可扩展性，所以我们决定放弃使用 Lerna 进行项目间的依赖管理。

接下来，我们将聚焦于比较 「Yarn Workspaces」 和 「Pnpm Workspaces」 这两个工具。它们在处理项目间的依赖管理方面表现优异且具有较好的兼容性。然而，在依赖安装方面存在细微差异。接下来我们将呈现 「Yarn」 和 「Pnpm」 两者的依赖管理差异：

「Yarn Workspace」：

1、在 `package.json` 中添加配置如下：

```
{
  "workspaces": ["packages/*"]
}


```

2、子模块间依赖配置如下：

```
// modulea
{
  "name": "@xx/modulea",
  "version": "1.0.0",
  "dependencies": {
    "@xx/moduleb": "1.0.0",
    "@xx/modulec": "1.0.0"
  }
}


```

3、根目录执行 `yarn install` 命令进行依赖安装，会自动关联子模块之间的模块依赖。其依赖树结构如下：

```
.
├── node_modules
│   ├── @babel
│   ├── @changesets
│   └── @xx # 幽灵依赖，来自子模块
│       ├── modulea -> ../../packages/moduleA
│       ├── moduleb -> ../../packages/moduleB
│       └── modulec -> ../../packages/moduleC
├── package.json
├── packages
│   ├── moduleA
│   ├── moduleB
│   └── moduleC
└── yarn.lock


```

「Pnpm Workspace」：

1、根目录添加 `pnpm-workspace.yaml` 配置文件，内容如下：

```
packages:
  - "packages/**"


```

2、子模块间依赖配置如下：

```
// modulea
{
  "name": "@xx/modulea",
  "version": "1.0.0",
  "dependencies": {
    "@xx/moduleb": "workspace:*",
    "@xx/modulec": "workspace:*"
  }
}


```

3、根目录执行 `pnpm install` 命令进行依赖安装，会自动关联子模块之间的模块依赖。其依赖树结构如下：

```
.
├── node_modules
│   ├── @babel
│   └── @changesets
├── package.json
├── packages
│   ├── moduleA
│   │   └── node_modules
│   │       └── @xx
│   │           ├── moduleb -> ../../../moduleB
│   │           └── modulec -> ../../../moduleC
│   ├── moduleB
│   │   └── node_modules
│   │       └── @xx
│   │           └── modulec -> ../../../moduleC
│   └── moduleC
├── pnpm-lock.yaml
└── pnpm-workspace.yaml


```

由上可知，使用 Yarn 会将子模块的依赖项向最外层扁平化展开，这就会造成「幽灵依赖」现象，导致项目的依赖关系不够清晰，给开发者带来一定困惑。相比之下，Pnpm 的依赖树结构更符合常规认知，整个依赖关系更加透明和可控。因此，最终我们决定选择 Pnpm 作为 Monorepo 项目的依赖管理工具。

版本控制工具
------

尽管 Pnpm Workspace 在管理子模块间的依赖方面表现出色，但它并未提供统一修改各个子模块关联版本号的功能，开发者需要单独进入每个子模块进行版本号的修改。因此，为了实现更全面的 Monorepo 项目管理，包括批量修改版本号、记录各个模块的修改日志以及自动化发布等功能，我们需要为其选择一个适用的版本管理和发布工具。

目前有两种主流方案，它们分别针对不同的项目场景，以下将详细介绍。

### 1、Lerna + Conventional Changelog

尽管 Lerna 不再负责依赖管理，但它将更多关注点放在了 Monorepo 项目的版本管理和发布上。通过结合 Lerna 和 Conventional Changelog 两个工具，我们可以轻松地统一修改 Monorepo 项目中各个子模块的关联版本号，并记录每次修改的日志。虽然其操作模式相对固定，不太适用于添加自定义流程，但在特定场景下，其操作简单，特别适合新手团队使用。以下是项目中添加的构建脚本的简化示例：

```
{
  "release": "npm-run-all version:lerna changelog version:git",
  "version:lerna": "lerna version $npm_package_version --exact --no-git-tag-version --force-publish --no-private",
  "version:git": "git add . && git commit -m "chore(release): publish $npm_package_version"",
  "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
}


```

开发者在准备发布时，只需要执行 `pnpm run release` 这个集成命令，内部会分别按序执行 `lerna version` 、`conventional-changelog` 和 `git xxx` 三步命令。下面将逐一说明三步命令的作用：

首先执行 `lerna version` 命令时，会询问是否需要将版本号统一修改为某一个版本，确认后则会自动修改，非常简单。示例如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibzpCsnlYmS2MBIoic8JwK4Y4pwPn3QrBhkdj7ibylWgeZicHNicGo2wOkEg/640?wx_fmt=png&from=appmsg)

然后，利用 `conventional-changelog` 工具将当前迭代过程中，所有开发者提交的日志统一记录到本地的 `CHANGELOG.md` 文件中。

最后，执行的 Git 命令，只是将代码提交到存储仓库中。

在发布阶段，只需执行 `lerna publish` 即可自动发布 Monorepo 项目中的所有模块。其发布原则主要通过比较 Git 记录或 Registry 记录来确定发布的内容，规则如下：

```
lerna publish              # publish packages that have changed since the last release
lerna publish from-git     # explicitly publish packages tagged in the current commit
lerna publish from-package # explicitly publish packages where the latest version is not present in the registry


```

### 2、Changesets

Changesets 是一个用于管理项目版本和发布流程的工具，它旨在使 Monorepo 项目中的版本管理更加清晰、灵活和易于协作。

相比于 Lerna + Conventional Changelog 工具，其指令更加简单，操作更加灵活，能够满足更多的定制化需求场景。我们项目中的构建脚本大致简化如下：

```
{
  "add": "pnpm changeset add",
  "version": "pnpm changeset version",
  "publish": "changeset publish"
}


```

需要注意的是 Changesets 工具的操作流程，会与传统的日志提交和发布流程有所不同，它引入了开发者和管理者的概念。开发者负责日常项目开发，保持代码的颗粒化修改提交并添加标记，而管理者主要负责对开发者的提交进行归类，并做统一的发布操作，操作流程图大致如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibkOa8fdZCPbO0ic7h25SeVVBycVnicmB9bia0OMPibogqhc3qXoPs32SZeA/640?wx_fmt=png&from=appmsg)

首先，开发者完成每次的代码提交之后，只需要执行 `changeset add` 命令，以记录每次提交的版本变更信息，操作如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibTqibwysFfZEO9zwvDZaaD9B91IOWDFdQIte6nzT65KahJxFFdiaE6kNQ/640?wx_fmt=png&from=appmsg)

接着，管理者需要定期对项目提交内容进行合并。执行 `changeset version` 命令后，我们可以查看在这段时间内所有的提交信息，并对其中不合适的地方进行适度修改。一旦完成这一步操作，即表示已经处理了近期的所有开发提交文件。以下是操作的示例：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibGoacFg8AkaQ4oUZAVH35GMtPLngC3Z7QCRpHqK4GibpA8DkWzlUIEQg/640?wx_fmt=png&from=appmsg)

最后，管理者只需要执行 `changeset publish` 命令，就可以为所有模块分别打上 tag 日志，并自动发布到镜像源，操作示例如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZdrFZcMZ1MC3x6tORD0ib6ibUduCFhRhv7PGgxLCia7acDz2FdBbuiaiab62YDs11jRS0F0xtkUCwqic4Q/640?wx_fmt=png&from=appmsg)

所以，在版本管理和发布工具的选择上，我们可以根据团队和项目的整体情况来权衡取舍。如果我们对稳定性有更高的要求，那么相较于 Changesets，Lerna 在版本管理和发布方面的操作更为简单；而如果我们更注重管控的灵活性，且存在 Lerna 无法满足的需求场景，那么 Changesets 可能是更好的选择。

最后
--

通过将原本分散的多仓库（Multirepo）架构转变为更为合理的单一仓库（Monorepo）架构，我们成功实现了对 CLI 和多个 Plugin 模块之间版本的精确掌控。在后续的开发中，只需保持 CLI 和 Plugin 的版本一致，彻底解决了版本冲突和不兼容性的问题。这一改变为我们的开发流程带来了更大的稳定性和协同性，确保了整个项目在版本控制方面的一致性和可维护性。

在实现 Monorepo 的过程中，我们面临着多种方法的选择，因此明智的选择显得尤为重要。在本文中，我们深入探讨了团队在面对项目瓶颈时，为何考虑将开发架构从 Multirepo 迁移到 Monorepo 的决策背后的实际项目经验。同时，我们分享了关于 2024 年最为普遍的 Monorepo 工具，以及在选择和应用这些工具时的决策过程。这样的实践洞察有助于我们更全面地理解 Monorepo 的实际应用，并为团队在迁移或实施 Monorepo 时提供有益的指导。

总的来说，Monorepo 为我们的团队带来了更优雅、更模块化的版本管理解决方案，使得我们能够更好地应对复杂性，并推动项目的持续发展。通过选择适用的工具和架构，我们在面对不断变化的软件开发挑战时更加有信心，确保团队能够保持协同、高效的工作状态。

参考资料
----

*   Awesome Monorepo
    
*   stateofjs.com
    
*   Lerna - legacy-package-management
    

### 最后  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```