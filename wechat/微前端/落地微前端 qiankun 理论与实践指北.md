> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/le-lqmwbpRJgRlQDxYv78g)

一、前言
====

> “一千个人眼里有一千个哈姆雷特” 本文仅是作者这段时间对微前端的思考与感悟，文笔拙劣，多多海涵。微前端的实现方式有很多种，但是微前端并不完美。只有适合自己、适合团队的才是最佳实践。希望本文能帮助您在微前端学习之路上节约一点时间。也欢迎大家提出意见、踊跃的反馈、希望能与大家共进步，加油～

由于本文较长（PS：本人懒得分篇），目录一至目录七偏理论知识，目录七之后为实践操作与思考，大家可以适当的跳跃来看

**微前端是什么？**

*   微前端不是特指某一项技术，而是一种思想。是由 2016 年 ThoughtWorks Technology Radar 中提出的，借鉴后端微服务的架构模式，将 Web 应用由单一的单体应用转变为多个小型前端应用，聚合为一的应用。
    
*   所以微前端不是指具体的库，不是指具体的框架，不是指具体的工具，而是一种理想与架构模式。
    
*   微前端的核心三大原则就是：**独立运行、独立部署、独立开发** 所以满足这些的最佳人选就是 “iframe”!!!
    

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv16HZsFNNs2yq9ibwVSiaIvhD1IKVultnYib8B5sxciclHx7n2srEko53icbg/640?wx_fmt=png)image.png

**微前端能解决我们什么问题？**

举例: 一个持续多年的应用，经历几年的业务的更新迭代，当项目发展到一定程度的时候就会遇到以下问题

1.  业务模块之间不断的堆叠，交错引用，业务耦合如何治理？
    
2.  老技术、老代码不敢动，新技术、新架构又想用？
    
3.  万年技术债？既要跟随业务敏捷迭代，又要保证代码库向好发展，旧的框架类库如何平稳升级？
    
4.  一个项目多个团队开发，你冲突我，我冲突你，如何解决并行开发的冲突？
    
5.  代码库持续膨胀，难以维护的项目代码，是屎上雕花？还是从头再来？
    

有没有一种可以分解复杂度，提升协作效率，支持灵活扩展的架构模式？**微前端应运而生—— “更友好的 iframe”** 将一个巨无霸应用拆解为一个个独立的微应用应用，而用户又是无感知的！

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1RL28z285RA0SSICwgmMMAJJTENIvNzxGkyxDKSFI30xsT3DvrPXJXQ/640?wx_fmt=png)微前端核心原则：

*   技术栈无关: 主应用不限制子应用接入的技术栈，每个应用的技术栈选型可以配合业务情景选择。
    
*   独立开发、独立部署：既可以组合运行，也可以单独运行。
    
*   环境隔离：应用之间 JavaScript、CSS 隔离避免互相影响
    
*   消息通信：统一的通信方式，降低使用通信的成本
    
*   依赖复用：解决依赖、公共逻辑需要重复维护的问题
    

这意味着我们可以循序渐进的进行巨石应用的拆解，去技术升级、去架构尝试、去业务拆解等等。以低成本、低风险的进行，**为项目带来更多可能性**

**我们的项目适不适合改造成微前端项目模式？**

看我们的项目满足不满足微前端化，先看能不能满足以下几点即可。

*   是否有明确的业务边界，业务是否高度集中。
    
*   业务是否高度耦合、项目是否足够庞大到需要拆分。
    
*   团队中存在多个技术栈并且无法统一，需要接入同一套主系统。
    
*   技术老旧，扩展困难，维护吃力不讨好。
    
*   开发协同、部署维护等工作，效率低下，一着不慎，满盘皆输。
    

**注意：没有迫切的需求接入微前端，只会带来额外的负担，我们要知道我们使用微前端是为了什么？**

二、微前端技术选型
=========

微前端实现方案对比

<table width="NaN"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">技术方案</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">描述</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">技术栈</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">优点</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">缺点</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">单独构建 / 部署</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">构建速度</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">SPA 体验</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">项目侵入性</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">学习成本</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">通信难度</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">iframe</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">每个微应用独立开发部署，通过 iframe 的方式将这些应用嵌入到父应用系统中</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无限制</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">1. 技术栈无关，子应用独立构建部署<br>2. 实现简单，子应用之间自带沙箱，天然隔离，互不影响</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">体验差、路由无法记忆、页面适配困难、无法监控、依赖无法复用，兼容性等都具有局限性，资源开销巨大，通信困难</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">低</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">Nginx 路由转发</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">通过 Nginx 配置实现不同路径映射到不同应用</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无限制</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">简单、快速、易配置</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">在切换应用时触发发页面刷新，通信不易</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">低</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">Npm 集成</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">将微应用抽离成包的方式，发布 Npm 中，由父应用依赖的方式使用，构建时候集成进项目中</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无限制</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">1. 编译阶段的应用，在项目运行阶段无需加载，体验流畅<br>2. 开发与接入成本低，容易理解</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">1. 影响主应用编译速度和打包后的体积<br>2. 不支持动态下发，npm 包更新后，需要重新更新包，主应用需要重新发布部署</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">不支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">慢</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">通用中心路由基座式</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">微应用可以使用不同技术栈；微应用之间完全独立，互不依赖。统一由基座工程进行管理，按照 DOM 节点的注册、挂载、卸载来完成。</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无限制</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">子应用独立构建，用户体验好，可控性强，适应快速迭代</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">学习与实现的成本比较高，需要额外处理依赖复用</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">特定中心路由基座式</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">微应用业务线之间使用相同技术栈；基座工程和微应用可以单独开发单独部署；微应用有能力复用基座工程的公共基建。</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">统一技术栈</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">子应用独立构建，用户体验好，可控性强，适应快速迭代</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">学习与实现的成本比较高，需要额外处理依赖复用</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">高</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">webpack5 模块联邦</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">webpack5 模块联邦 去中心模式、脱离基座模式。每个应用是单独部署在各自的服务器，每个应用都可以引用其他应用，也能被其他应用所引用</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">统一技术栈</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">基于 webpack5，无需引入新框架，学习成本低，像引入第三方库一样方便，各个应用的资源都可以相互共享应用间松耦合，各应用平行的关系</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">需要升级 Webpack5 技术栈必须保持一致改造旧项目难度大</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">低</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">低</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">正常</td></tr></tbody></table>

对于选择困难同学来说，可以参考以下纬度进行方案技术的选型

<table width="NaN"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">参考纬度</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">是否能支持未来的迭代</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">稳定性</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">该方案是否经历了社区的考验，有较多的成熟案例，同时保持较高的 活跃性</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">可拓展性</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">支持定制化开发，提供较高的可拓展能力，同时成本可以在接受范围内</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">可控性</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">发生问题后，能够在第一时间内进行问题排查，以最快的响应速度来处理问题，修复的方案是否会依赖于外部环境</td></tr></tbody></table>

市面框架对比：

*   magic-microservices 一款基于 Web Components 的轻量级的微前端工厂函数。
    
*   icestark 阿里出品，是一个面向大型系统的微前端解决方案
    
*   single-spa 是一个将多个单页面应用聚合为一个整体应用的 JavaScript 微前端框架
    
*   qiankun 蚂蚁金服出品，基于 single-spa 在 single-spa 的基础上封装
    
*   EMP YY 出品，基于 Webpack5 Module Federation 除了具备微前端的能力外，还实现了跨应用状态共享、跨框架组件调用的能力
    
*   MicroApp 京东出品，一款基于 WebComponent 的思想，轻量、高效、功能强大的微前端框架
    

综合以上方案对比之后，我们确定采用了 `qiankun` 特定中心路由基座式的开发方案，原因如下：

*   保证技术栈统一 Vue、微应用之间完全独立，互不影响。
    
*   友好的 “微前端方案 “，与技术栈无关接入简单、像 iframe 一样简单
    
*   改造成本低，对现有工程侵入度、业务线迁移成本也较低。
    
*   和原有开发模式基本没有不同，开发人员学习成本较低。
    
*   qiankun 的微前端有 3 年使用场景以及 Issue 问题解决积累，社区也比较活跃，在踩坑的路上更容易自救～
    

三、你需要明确的
========

> 微前端并不是万能的”解药 “，没有正确治理，所有的 codebase 的归宿都是” 屎山”

*   **qiankun 不是一个完整的微前端解决方案！**
    
*   **qiankun 不是一个完整的微前端解决方案！！**
    
*   **qiankun 不是一个完整的微前端解决方案！！！**
    

**1. 微前端的运行时容器**

*   qiankun 所帮你解决的这一块实际上是微前端的运行时容器，这是整个微前端工程化里面其中一个环节
    
*   从这个角度来讲 qiankun 不算是一个完整的微前端解决方案，而是微前端运行时容器的一个完整解决方案，当你用了 qiankun 之后，你几乎能解决所有的微前端运行时容器的问题，但是更多的一些涉及工程和平台的问题，则需要我们去思考与处理。
    
*   我们的版本管控、配置下发、监控发布，安全检测、等等这些怎么做，都不是 qiankun 作为一个库所能解答的，这些问题得根据具体情况，来选择适合自己的解决方案 **2. 迁移成本**
    
*   对于老旧项目的接入，很难做到零成本迁移，在开发的时候要预留足够的踩坑，魔改代码的时间。如果是已经维持几年堆叠的屎山需要做好因为不规范编码，所产生的各种奇怪的兼容性问题，这个时候你甚至会怀疑，“微前端是否真的有必要?"**3. 技术栈的选择**
    
*   微前端的核心不是多技术共存，而是分解复杂度，提升协作效率，支持灵活扩展，能把 “一堆复杂的事情” 变成“简单的一件事情”，但是也不是无脑使用的，广东话来说“多个香炉多只鬼”，每多一个技术栈都会增加：维护成本，兼容成本，资源开销成本，这些都会无形的拖累生产力。
    
*   基座应用与微应用之间，强烈推荐使用相同的技术栈，相同的技术栈可以实现公共依赖库、UI 库等抽离，减少资源开销，提升加载速度，最重要的是：“减少冲突的最好方式就是统一”，通过约束技术栈可以尽可能的减少项目之间的冲突，减少工作量与维护成本。
    

**4. 微前端初尝试**

*   对于微前端的接入最好的时候就是，刚开始不久或重要性不是特别强的项目，一方面项目具备兼容微前端的工程能力，另一方面项目使用微前端方案的成本最低，不需要改太多代码
    
*   对于老旧项目的接入建议还是从边缘简单的模版入手，逐步分解。
    

**7. 标准化才能提升生产力**

*   混乱的项目会拖累生产效率，同时混乱的微前端也会加剧内耗，所以只有标准化才能提升生产力。
    
*   解决微前端的接入问题是最简单的，但是微前端接入后的：工程化，应用监控，应用规范，应用管理才是微前端中困难的地方，如果你只是想简单的嵌入一个应用，我推荐你的使用 ”iframe“
    

**9. qiankun 不支持 Vite ！！！**

*   🚀 Link github 未来是否考虑支持 vite
    
*   不建议尝试去改变目前的 qiankun，Vite 的改造成本真的太高了，虽然 webpack 比 Vite 慢，但是经过拆分的应用内容已经很小了，不会对项目有太大的拖累。
    

**10. qiankun 并不难**

*   对于 qiankun 的学习其实大家不用很担心，好像一听微前端就很难的样子。因为 qiankun 真的很简单满打满算 10 个 API 都没有，接下来让我们一起走进 qiankun 的世界吧～～
    
*   🚀 Link qiankun 官网文档
    

四、微应用拆分规则
=========

> 微应用的拆与合思考：拆的是系统复杂度，合的是系统复用度 核心原则：高内聚，低耦合

微应用的拆解没有具体规则，但是以下规则应该可以给你在进行系统拆分时提供一些依据。

1.  **“尽量减少彼此的通信和依赖 “**，微前端的通信交互、链接跳转等操作所带来等成本其实是很大的，所以在拆分的时候尽量 “完全独立，互不依赖”
    
2.  微应用的拆分的时候**切忌 “盲目细致拆分”**，过度拆分会导致 “做的很牛逼，但是没有用的困局”，微应用的拆分并不是一步到位的，我们要根据实际情况逐步拆分。如果一开始不知道应该划分多细，可以先粗粒度划分，然后随着需求的发展，逐步拆分。
    

*   如：现在有一个售后管理系统，我们按业务线拆分为：客服管理，库存管理，物流管理，未来客服管理需求功能持续庞大再拆解为：智能客服、电话客服、在线客服。而这些客服，又可以嵌入供应商管理中心，商品管理中心 等项目使用。
    

4.  在拆分的时候我们应该尽量考虑未来场景：渐变式技术栈迁移，前端应用聚合、多系统业务复用，如何做业务解耦和代码复用。
    
5.  应用之间应该尽量解耦，子应用的事情就应该由子应用来做。
    

*   如：子应用的一些标识，如：路由前缀，应用名称，根节点容器名称，依赖库的使用
    
*   需要明确什么是子应用应该维护的，什么是父应用应该维护的，如果什么资源都一股脑的使用父应用下发，则会导致应用之间耦合严重。
    

**建议按照业务域来做拆分**

1.  保持核心业务的独立性，把无关的子业务拆分解耦。业务之间开发互不影响，业务之间可拆解微应用，单独打包，单独部署。
    
2.  业务关联紧密的功能单元应该做成一个微应用、反之关联不紧密的可以考虑拆分成多个微应用，判断业务关联是否紧密的标准：看这个微应用与其他微应用是否有频繁的通信需求。
    
3.  如果有可能说明这两个微应用本身就是服务于同一个业务场景，合并成一个微应用可能会更合适。
    
4.  分析平台差异，平台差异大可以根据平台特性拆分
    
5.  分析页面结构，如果结构清晰，可以根据结构拆分
    
6.  分析产品业务，将产品逻辑耦合度高的功能合并到一起
    

五、引入 qiankun - 在主应用中注册微应用
=========================

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1ibvLqIMZvoYTWXUnsYrLxC7SRje9unG1wkor9RiaK8Pdfx7DbyXx1Xyw/640?wx_fmt=png)image.png

**选择基座的模式？**

1.  **通用中心路由基座式：只有公共功能的主应用** (菜单栏、登录、退出...) 不包含任何业务逻辑
    
2.  **特定中心路由基座式：一个含业务代码的项目**作为基座，所有新功能作为子应用引入
    

以下案例是以 Vue 技术栈作为应用技术栈，建议应用之间还是统一技术栈，降低维护、上手、学习成本。越是不同技术、不同库的版本不同需要做的处理就越更多。

**qiankun 注册微应用的方式：**
---------------------

### **💫自动模式：使用 registerMicroApps + start，路由变化加载微应用**

*   当微应用信息注册完之后，一旦浏览器的 url 发生变化，便会自动触发 qiankun 的匹配
    

1.  首次 load 应用，创建子应用实例，渲染。
    
2.  切到其他子应用后切回，会重新创建新的子应用实例并渲染。
    
3.  之前的子应用实例 qiankun 直接不要了，即使你没有手动销毁实例。
    
4.  采用这种模式的话 一定要在子应用暴露的 unmount 钩子里手动销毁实例，不然会导致内存泄漏。
    

*   activeRule - `string | (location: Location) => boolean | Array<string | (location: Location) => boolean>` 必选，微应用的激活规则。
    
*   支持直接配置字符串或字符串数组，如 `activeRule: '/app1'` 或 `activeRule: ['/app1', '/app2']`，当配置为字符串时会直接跟 url 中的路径部分做前缀匹配，匹配成功表明当前应用会被激活。
    
*   支持配置一个 active function 函数或一组 active function。函数会传入当前 location 作为参数，函数返回 true 时表明当前微应用会被激活。如 `location => location.pathname.startsWith('/app1')`
    

1.  **自动挂载：registerMicroApps + start**
    

```
yarn add qiankun // ps：只需要主应用安装即可
```

```
// 主应用/scr/main.js import { registerMicroApps, start } from 'qiankun';// 1. 获取微应用配置const MICRO_CONFIG = [  {    name: 'vue app', // 应用的名字 必填 唯一    entry: '//localhost:7100', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch    container: '#yourContainer', // 挂载具体容器 ID     // 3. 根据路由匹配，激活的子应用    activeRule: '/yourActiveRule',    props: {        xxxx: '/' // 下发给子应用    }  }]// 2. 注册微应用registerMicroApps(MICRO_CONFIG)start() // 启动微服务
```

**activeRule 规则示例：此处拿官网的举例～**ctiveRule：`'/app1'`

*   **✅ https://app.com/app1**
    
*   **✅ https://app.com/app1/anything/everything**
    
*   🚫 https://app.com/app2activeRule：
    

activeRule：`'/users/:userId/profile'`

*   **✅ https://app.com/users/123/profile**
    
*   **✅ https://app.com/users/123/profile/sub-profile/**
    
*   🚫 https://app.com/users//profile/sub-profile/
    
*   🚫 https://app.com/users/profile/sub-profile/
    

activeRule：`'/pathname/#/hash'`

*   **✅ https://app.com/pathname/#/hash**
    
*   **✅ https://app.com/pathname/#/hash/route/nested**
    
*   🚫 https://app.com/pathname#/hash/route/nested
    
*   🚫 https://app.com/pathname#/another-hash
    

activeRule：`['/pathname/#/hash', '/app1']`

*   **✅ https://app.com/pathname/#/hash/route/nested**
    
*   **✅ https://app.com/app1/anything/everything**
    
*   🚫 https://app.com/pathname/app1
    
*   🚫 https://app.com/app2
    
*   💡 当微应用信息注册完之后，一旦浏览器的 url 发生变化，便会自动触发 qiankun 的匹配逻辑。所有 activeRule 规则匹配上的微应用就会被插入到指定的 container 中，同时依次调用微应用暴露出的生命周期钩子。
    

### **💪手动模式：使用 loadMicroApp 手动注册微应用**

1.  每个子应用都有一个唯一的实例 ID，reload 时会复用之前的实例
    
2.  如果需要卸载则需要手动卸载 **xxxMicroApp.unmount()**
    

由于 registerMicroApps 的特性，会导致路由的 keep alive 失效，故本文使用 loadMicroAp + router.beforeEach 进行来达到自动注册的目的。

如果微应用不是直接跟路由关联的时候，你可以选择手动加载微应用的方式会更加灵活。

**手动挂载: loadMicroApps**

```
// 任意页面都可以注册import { loadMicroApp } from 'qiankun';// 获取应用配置并手动挂载，挂载后返回挂载对象this.microApp = loadMicroApp({    name: 'vue app', // 应用的名字 必填 唯一    entry: '//localhost:7100', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch    container: '#yourContainer', // 挂载具体容器 ID    activeRule: '/yourActiveRule', // 根据路由 激活的子应用    props: {        xxxx: '/' // 下发给子应用    }})this.microApp.unmount() // 手动销毁～
```

六、微应用挂载节点
=========

> 微应用可以挂载在页面的任意位置，微应用、微项目、微页面、微组件，一切皆有可能。

*   微应用两种常见的挂载场景
    

**第一种：路由页内挂载，把子应用内嵌页入使用**![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1e33sjUKFIVQKMMFwTrBkZQBicmlZB5YPesVhxnBDeRe4Sria60zAh32w/640?wx_fmt=png)

```
// 主应用/src/views/About.vue<template>  <div class="about">    <div id="sub-app-container"></div>  </div></template>
```

**第二种：根 DOM 中与主应用同级挂载，切换的时候隐藏应用，显示当前应用**![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1cBTIUTATMkfV6wGZgPNLfaaV2uvhlS4iaRCfiaRoQ9bVtibbgFlT1TpxA/640?wx_fmt=png)

```
// 主应用/scr/App.vue<template>    <div id="app">        <!-- 不同的微应用 -->        <div v-show="location.hash.startsWith('#/operation')" id="sub-operation-container"></div>        <div v-show="location.hash.startsWith('#/inventory')" id="sub-inventory-container"></div>    </div></template>
```

七、应用加载解析流程图
===========

> 简易的图示了 qiankun 是如何通过 import-html-entry 加载微应用的

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv18mblqyle2oRRqcPFlADUAHH81AziaK3a1QBbEp0WMkswFRDhxnz1AYQ/640?wx_fmt=png) image.png

简易流程：

1.  qiankun 会用 原生 fetch 方法，请求微应用的 entry 获取微应用资源，然后通过 response.text 把获取内容转为字符串。
    
2.  将 HTML 字符串传入 processTpl 函数，进行 HTML 模板解析，通过正则匹配 HTML 中对应的 javaScript（内联、外联）、css（内联、外联）、代码注释、entry、ignore 收集并替换，去除 `html/head/body` 等标签，其他资源保持原样
    
3.  将收集的 `styles` 外链 URL 对象通过 fetch 获取 css，并将 css 内容以 `<style>` 的方式替换到原来 link 标签的位置
    
4.  收集 script 外链对象，对于异步执行的 JavaScript 资源会打上 `async` 标识 ，会使用 requestIdleCallback 方法延迟执行。
    
5.  接下来会创建一个匿名自执行函数包裹住获取到的 js 字符串，最后通过 eval 去创建一个执行上下文执行 js 代码，通过传入 proxy 改变 window 指向，完成 JavaScript 沙箱隔离。源码位置。
    
6.  由于 qiankun 是自执行函数执行微应用的 JavaScript，因此在加载后的微应用中是看不到 JavaScript 资源引用的，只有一个资源被执行替换的标识。
    
7.  当一切准备就绪的时候，执行微应用的 JavaScript 代码，渲染出微应用
    

八、微应用接入三步走
==========

**第一步：微应用的入口文件 修改 **webpack_public_path****

*   在 `src` 目录新增 `public-path.js`
    
*   `webpack` 默认的 `publicPath` 为 `""` 空字符串，会基于当前路径来加载资源。但是我们在主应用中加载微应用资源的时候会导致资源丢失，所以需要重新设置 `__webpack_public_path__` 的值
    

```
// 微应用/src/const/public-path.jsif (window.__POWERED_BY_QIANKUN__) {    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;}
```

**第二步：微应用 webpack 新增配置**

*   **webpack** 配置修改 PS: **什么是 umd 模块？**
    

```
const { name } = require('./package.json')module.exports = {  devServer: {      port: 8081, // 父应用配置微应用端口，要与微应用端口一致      disableHostCheck: true, // 关闭主机检查，使微应用可以被 fetch      headers: {          'Access-Control-Allow-Origin': '*' //因为qiankun内部请求都是fetch来请求资源，所以子应用必须允许跨域      }  },  configureWebpack: {      output: {          library: `${name}-[name]`, // 微应用的包名，这里与主应用中注册的微应用名称一致          libraryTarget: 'umd', // 这里设置为umd意思是在 AMD 或 CommonJS 的 require 之后可访问。          jsonpFunction: `webpackJsonp_${name}` // webpack用来异步加载chunk的JSONP 函数。      }  }}
```

**第三步：微应用添加生命周期**

> 微应用需要在自己的入口文件，添加 `bootstrap`、`mount`、`unmount` 三个生命周期钩子，供主应用在适当的时机调用。

*   main.js 注册微应用，增加判断让子应用就算脱离了父应用也可以独立运行
    
*   PS：qiankun 生命周期函数都必须是 Promise，使用 async 会返回一个 Promise 对象
    

```
// 微应用/scr/main.jsimport './public-path.js'import Vue from 'vue'import App from './App.vue'import router from './router'import store from './store'let instance = null// 1. 将注册方法用函数包裹，供后续主应用与独立运行调用function render(props = {}) {  const { container } = props  instance = new Vue({    router,    store,    render: h => h(App),  }).$mount(container ? container.querySelector('#app-micro') : '#app-micro')}// 判断是否在乾坤环境下，非乾坤环境下独立运行if (!window.__POWERED_BY_QIANKUN__) {  render()}// 2. 导出的生命周期/** * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。 */export async function bootstrap() {  console.log('[vue] vue app bootstraped')}/** * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法 */export async function mount(props) {  console.log('[vue] props from main framework', props)  render(props);}/** * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例 */export async function unmount() {  instance.$destroy()  instance.$el.innerHTML = ''  instance = null}/** * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效 */export async function update(props) {  console.log('update props', props)}
```

**小结**经历这几步，qiankun 父应用与微应用就接入完成了。当父应用完成加载微应用的时候，微应用就会遵循对应的解析 规则，插入到父应用的 HMTL 中了。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv11chF5XjO0Nn8t2sxSnzltwlywzicmLjwYN4ict2icvibjMV3HzGPWW9Qzg/640?wx_fmt=png)image.png

九、预加载微应用
========

**预先请求子应用的 HTML、JS、CSS 等静态资源，等切换子应用时，可以直接从缓存中读取这些静态资源，从而加快渲染子应用。**

1.  **registerMicroApps 模式下在 `start` 方法配置预加载应用**
    
    ```
    import { registerMicroApps, start } from 'qiankun';registerMicroApps([...AppsConfig])start({ prefetch: "all" }) // 配置预加载
    ```
    

*   prefetch - `boolean | 'all' | string[] | (( apps: RegistrableApp[] ) => { criticalAppNames: string[]; minorAppsName: string[] })` - 可选，是否开启预加载，默认为 `true`。
    
    配置为 `true` 则会在第一个微应用 mount 完成后开始预加载其他微应用的静态资源
    
    配置为 `all` 则主应用 `start` 后即开始预加载所有微应用静态资源
    
    配置为 `string[]` 则会在第一个微应用 mounted 后开始加载数组内的微应用资源
    
    配置为 `function` 则可完全自定义应用的资源加载时机 (首屏应用及次屏应用)
    

3.  **loadMicroApps 模式下**
    
    ```
    import { prefetchApps } from 'qiankun';export const MICRO_PREFETCH_APPS = [    { name: 'vue-child', entry: '//localhost:7101/' },    { name: 'vue-app', entry: '//localhost:8081/' }]prefetchApps(MICRO_PREFETCH_APPS)
    ```
    
    ```
    // 基座/src/const/micro/application-list.jsexport const MICRO_CONFIG =  [    {        name: 'you app name', // 应用的名字        entry: '//localhost:7286/', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch        container: '#yuo-container-container', // 容器id        activeRule: '/your-prefix', // 根据路由激活的路径        isPreload: true, // !! 是否开启预加载 !!    }]
    ```
    
    ```
    import { prefetchApps } from 'qiankun';import { MICRO_CONFIG } from '@/const/micro/application-list.js';// 获取配置的 isPreload 字段，并生成加载对应的格式const MICRO_PREFETCH_APPS = MICRO_CONFIG.reduce(    (total, { isPreload, name, entry }) => (isPreload ? [...total, { name, entry }] : total),    [])// 预加载应用prefetchApps(MICRO_PREFETCH_APPS)
    ```
    

*   笔者用的模式就是 loadMicroApps 模式，**为了日后维护的便携性，改造一下：**，新增 isPreload 字段维护是否开启预加载，这样有关于微应用的信息都在此 js 文件维护，避免散弹式修改。
    

十、路由模式选择与改造
===========

👉 我们应该怎么选择路由？
--------------

> 最好的路由模式就是主应用、子应用都统一模式，可以减少不同模式之间的兼容工作

本文选择统一为：父子路由 hash 模式

<table width="NaN"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">主模式</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">子模式</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">推荐</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">接入影响</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">解决方案</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">备注</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">hash</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">hash</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">强烈推荐</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">hash</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">history</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">不推荐</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">有</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">history.pushState</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">改造成本大</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">history</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">history</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">强烈推荐</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;"><br></td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">history</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">hash</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">推荐</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;"><br></td></tr></tbody></table>

PS: 每个模式之间的组合并不是接入就可以完成的，都需要一些改造，如：增加路由前缀，路由配置 base 设置，不同的模式 activeRule 的规则都不同

⚒ 路由改造工作
--------

### **新增微应用路由前缀**

> 新增前缀不是微应用必须的，但是为了从 URL 上与其他应用隔离，也是为了接入旧应用的时候，能让 activeRule 方法能识别并激活应用，故新增路由前缀。

**父应用路由表**

```
[    // 主应用 router.js：如果想匹配任意路径，我们可以使用通配符 (*)：    {        path: '/your-prefix',        name: 'Home',        component: Home    },     // 特定页面兜底 会匹配以 `/your-prefix` 开头的任意路径     // 如：/your-prefix/404 ， /your-prefix/no-permission ....    {        path: '/your-prefix/*',        name: 'Home',        component: Home    }]
```

PS：子应用路由切换，由于应用与路由都是通过 URL 注册与销毁的，当子应用路由跳转地址，无法与父应用的路由地址匹配上的时候页面会销毁，需要注意路由匹配，或者增加路由兜底。

**子应用 hash 模式**

```
// hash 模式不能使用base，只能改前缀new VueRouter({    mode: 'hash',    routes: [        {            //增加路由前缀判断            path: `${ window.__POWERED_BY_QIANKUN__ ? 'your-prefix' : ''}/login`,            component: _import('login/index.vue')        }    ]})
```

**子应用 history 模式**

```
new VueRouter({    mode: 'history',    // **针对子应用是 history模式的时候，只用设置 router base 就好了，不用像hash 这么麻烦**     base: window.__POWERED_BY_QIANKUN__ ? 'your-prefix' : null,    routes: [        {            path: '/login',            component: _import('login/index.vue')        }    ]})
```

十一、 📝 旧项目路由接入改造
================

> 但是由于笔者是接入的是旧项目并且又是 hash 路由模式想顺利接入，一个个加三元则改动太多路由表了，为了减少对于旧项目接入时的影响仅在以下三处做修改（ps：因为懒）

1. hash 路由模式：格式化路由表对象，微路由表路径，别名，重定向增加前缀区分应用
-------------------------------------------

*   这里我们利用递归函数需要给路由动态增加前缀、path 、redirect、alias 这个三种状态需要动态处理一下
    

1.  路由表数据
    

```
const routes = [    {        path: '/home',        name: 'home',        component: Home    },    {        path: '/about',        name: 'about',        redirect: 'home',        component: () => import('../views/About.vue')    },  {        path: '/about',        name: 'about',        alias: '/user/about',        component: () => import('../views/About.vue')    }]
```

*     
    

2.  格式化路由方法
    

```
let SUN_ROUTER_PATH_LIST = [] // 所有被格式化的路由都记录一下// 1. 格式化路由器参数 递归格式化export function formatRouterParams(parameter) {    // 判断如果不是 qiankun 环境内容则原样返回    if (!window.__POWERED_BY_QIANKUN__) {        return parameter.data    }        // 递归函数：data：数据源，params：需要替换的参数（数组、字符串），value需要替换的值（函数），deepKey：判断是否需要递归的参数名    const recursionData = ({ data, params, value, deepKey }) => {        return data.reduce((total, item) => {            item = formatData({ item, params, value })            // 判断是否需要继续递归            if (deepKey && item[deepKey] && Array.isArray(item[deepKey])) {                item[deepKey] = recursionData({                    data: item[deepKey],                    params,                    value,                    deepKey                })            }            return [...total, item]        }, [])    }    return recursionData(parameter)}// 2. 格式化路由数据增加前缀export function formatData({ item, params, value }) {    if (!item) return        // 如果params是数组：[path, ...more] 遍历增加前缀    if (Array.isArray(params)) {        params.forEach(key => {            if (Object.prototype.hasOwnProperty.call(item, key)) {                item[key] = geRouterValue(value, item[key])            }        })    } else if (params) {        item[params] = geRouterValue(value, item[params])    }    // 记录格式化路由路径    SUN_ROUTER_PATH_LIST.push(item)    return item}// 3. 判断value是函数还是值，如果是函数则调用函数 返回对应的value 值export function geRouterValue(value, key) {    return typeof value === 'function' ? value(key) : value}
```

2.  调用递归方法统一替换微应用路由表
    

```
const BASE_ROUTER_PATH = 'your-prefix'const router = new VueRouter({    mode: 'hash',    // 调用方法格式化路由表参数！！！    routes: formatRouterParams({        data: route,        deepKey: 'children',        params: ['path', 'redirect', 'alias'],        value: value => { // value 格式化的方法            if (window.__POWERED_BY_QIANKUN__ && typeof value === 'string') {                 const path = value[0] === '/' ? value : `/${value}`                 return BASE_ROUTER_PATH + path            }            return value        }    })})
```

遍历结果返回 - 路由表，统一增加 “your-prefix” 前缀啦

```
[    {        "path": "your-prefix/home",        "name": "home",        "component": "Home"    },    {        "path": "your-prefix/about",        "name": "about",        "redirect": "your-prefix/home",        "component": ""    },    {        "path": "your-prefix/about",        "name": "about",        "alias": "your-prefix/user/about",        "component": ""    }]
```

**2. router.beforeEach**
------------------------

> 跳转的时候调用检查跳转函数，判断是否需要增加前缀

```
// 路由全局守卫 // ps: 在内部判断，如果跳转的路由与当前子应用无关，直接放行即可router.beforeEach((to, from, next) => {    checkLink(to, next, () => {        next()    })})
```

*   简单来说：如果是在 qiankun 环境中，并且不是跳转其他微应用的 path， 并且跳转不是格式化前缀的路径，并且当前拼接的地址与格式化的路由地址是一致的才拼接 next
    

```
// LINK_MICRO_APP_LIST, SUN_ROUTER_PATH_LIST 变量上文有记录const { name } = require('../../package.json')export const BASE_ROUTER_PATH = `/${name}` // 此处笔者用了 package.json 的 name 做为 “your-prefix” 方便后期维护// 跳转的时候检查，判断是否需要增加前缀export function checkLink(to, next, callback) {    // 是否存在qinakun环境中    const IS_HAVE_QIANKUN = window.__POWERED_BY_QIANKUN__    // 是否跳转其他微应用    const IS_JUMP_TO_MICRO_APP = Object.values(LINK_MICRO_APP_LIST).includes(to.path)    // 是否跳转的是根路径    const IS_BASE_PATH_SYMBOL = to.path === '/'    // 根路径是否匹配一致    const IS_HAVE_BASE_ROUTER_PATH = getBasePath(to.path, '/') === getBasePath(BASE_ROUTER_PATH, '/')    // 判断以上情况来确定是否需要给路由动态增加前缀    const IS_ADD_PREFIX = IS_HAVE_QIANKUN && !IS_JUMP_TO_MICRO_APP && !IS_HAVE_BASE_ROUTER_PATH    if (IS_ADD_PREFIX || IS_BASE_PATH_SYMBOL) {        const path = `${BASE_ROUTER_PATH}${to.path}`        // 当前拼接的地址与 当前格式化的路由是否一致，一致才是跳转内部路由        if (SUN_ROUTER_PATH_LIST.some(e => [e.path, e.redirect, e.alias].includes(path))) {            next({ path })        }    }    // 执行回调函数    callback && callback()}// 获取当前的基础路径  如: getBasePath('/user/age/xxx', '/') => '/user'export function getBasePath(path, prefix = '') {    if (!path) return    const pathArray = String(path).split('/').filter(item => item)    const basePath = prefix + pathArray[0]    return basePath}
```

3. 改写 router.push OR router.replace
-----------------------------------

```
// 因为改变了next()的地址, push方法会提示报错，这里过滤一下～const originalPush = VueRouter.prototype.pushVueRouter.prototype.push = function push(location) {    return originalPush.call(this, location).catch(err => err)}
```

ps: **其可以直接在 push 中改写， 省略 router.befroeEach**

```
const originalPush = VueRouter.prototype.pushVueRouter.prototype.push = function push(location) {    const IS_JUMP_TO_MICRO_APP = Object.values(LINK_MICRO_APP_LIST).includes(location.path)    const IS_HAVE_QIANKUN = window.__POWERED_BY_QIANKUN__    const IS_BASE_PATH_SYMBOL = location.path === '/'    const IS_HAVE_BASE_ROUTER_PATH = getBasePath(location.path, '/') === BASE_ROUTER_PATH    const IS_ADD_PREFIX = IS_HAVE_QIANKUN && !IS_JUMP_TO_MICRO_APP && !IS_BASE_PATH_SYMBOL && !IS_HAVE_BASE_ROUTER_PATH    if (IS_ADD_PREFIX) {        location.path = `${BASE_ROUTER_PATH}${location.path}`    }    return originalPush.call(this, location)}
```

4. 路由跳转记录
---------

**跳转方式: 路由跳转与正常使用无异**

*   ps: 在父应用是 history 模式，子应用是 hash 模式的时候 子应用需要特殊处理一下 URL 重定向切换 history.pushState
    

**跳转其他微应用**

1.  由于我们的应用之间式分离的，所以跳转外部应用的路由也是分离的，**如果在项目中字面量固定写死风险太大了，如果外部应用发生一点改变，需要改项目里的路径的时候将会是一个噩梦**，所以我们统一使用在各自的微应用维护一个常量列表去处理记录应用之间的跳转，方便全局统一管理。此处仅笔者一点拙见，如有更好建议请多多发表。
    
2.  PS：此处跳转的常量列表其实也可以放到基座应用去维护，但是最佳选择是有运维平台去维护应用之间跳转关系会更好～
    

```
// 微应用/scr/const/link-micro-app-listexport const LINK_MICRO_APP_LIST = {    CHILD_VUE: '/child/vue', // vue 微应用地址    CHILD_REACT: '/child/react', // react 微应用地址    USER_INFO: '/user/info' // 跳转父应用用户信息页地址}
```

**使用场景：**

```
// 微应用/router.js// 1. 判断是否跳转其他应用const IS_JUMP_TO_MICRO_APP = Object.values(LINK_MICRO_APP_LIST).includes(to.path)// 2. 定义路由的时候通过路由列表地址获取let routes = [    {        path: '/about',        name: 'about',        // 别名 重定向 凡是跳转其他应用的都应该在这里统一管理 ！！！        redirect: LINK_MICRO_APP_LIST['CHILD_VUE'],         component: () => import('../views/About.vue')    }]// router.beforeEachrouter.beforeEach((to, from, next) => {    if (IS_JUMP_TO_MICRO_APP) {        next(false) // 禁止跳转其他ying yon    }  // ... more code})
```

十二、 微应用与路由之间 如何 keep alive
==========================

*   **registerMicroApps 模式下，为什么切换路由会导致应用重载？**
    

*   例：A 到 B， 触发 A unmount ⇒ 判断 B 是否加载过，已加载则触发 mount，未加载则触发 bootstrap ⇒ mount
    
*   详情可以看上文 **“五、引入 qiankun - 在主应用中注册微应用”**
    
*   URL 改变时应用匹配切换，路由的切换会导致应用的卸载与加载
    
*   如果子应用挂载在内部路由，路由跳转也将触发应用的重载
    
*   应用切换导致重载，导致组件状态丢失，为了保持应用实例不被加载，我们需要手动的控制应用的注册与销毁
    

*   方案一：**loadMicroApp**
    

*   优点：在一个页面中可以同时挂载多个微应用
    
*   缺点：无法根据路由匹配规则来挂载应用
    
*   适用场景：当需要在一个页面中同时挂载 2 个以上子应用，并且子应用的挂载不需要通过路由匹配来实现。
    
*   PS：在基座中关闭标签页时，需要手动调用 app 的 unmount 钩子销毁应用，不然再次新建页签进入时还是以前的实例
    

loadMicroApp 不能根据路由规则来挂载应用不是 qiankun 的问题，是我们的问题～

**使用 router.**afterEach** + loadMicroApp 的解决应用 keep alive，思路是通过判断路由守卫的地址，如果是符合激活规则的则激活应用**

**1. 主应用 router 路由守卫**

```
// 主应用/src/router/index.js// 1. 全局后置钩子调用微应用加载方法// 为什么笔者会在这里调用呢，其实是笔者利用了JavaScript机制的宏任务，目的就是为了在路由页获取是微应用的容器是否挂载了微应用，因为有时候微应用会因为作者系统的路由切换而被替换掉，所以用这个方式解决router.afterEach(to => {    setTimeout(() => { // setTimeout 是宏任务的一种        microApplicationLoading(to.path) // 把当前跳转的路径传入    })})
```

**2. 判断微应用加载的方法 microApplicationLoading**

*   应用表
    

```
// **src/const/micro/application-list.js** export const microApplicationList [    {        name: 'you app name', // 应用的名字        entry: '//localhost:7286/', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch        container: '#yuo-container-container', // 容器id        activeRule: '/your-prefix', // 根据路由激活的路径        **isPreload: true, // !! 是否开启预加载 !!        isRouteStart: true, // 是否需要路由启动**        props: { // 下发子应用的资源            router: router,            store: store,            parentEventHub: parentEventHub        }    }]
```

*   加载微应用方法
    

```
// 主应用/src/const/micro/qianun-utils.js// 加载微应用方法import { loadMicroApp } from 'qiankun'export async function microApplicationLoading(path) {    // 1. 根据路由地址加载当前应用配置    let currentActiveMicroConfig = await store.dispatch('d2admin/micro/GET_FIND_MICRO_CONFIG', path)      // 2. 从 vuex 获取缓存的微应用列表    const microApplicationList = store.getters['d2admin/micro/microApplicationList']    // 3. 如果没有匹配应用配置则代表跳转的不是微应用 or 微应用配置不需要路由启动的属性    if (!currentActiveMicroConfig || !currentActiveMicroConfig.isRouteStart) {        return    }    // 4. 根据应用配置 获取缓存的应用    const cacheMicro = microApplicationList.get(currentActiveMicroConfig.activeRule)     // 5. 判断当前挂载的是否有内容    const containerNode = getContainerNode(currentActiveMicroConfig.container)    const isNoTNodeContents = containerNode !== -1 && !containerNode     // 6. 如果没有dom节点 or 没有缓存应用配置 注册一下    if (isNoTNodeContents || !cacheMicro) {           // 如果有缓存应用配置，但是容器没有应用挂载，先卸载缓存应用再注册微应用        if (cacheMicro) {            cacheMicro.unmount()            cacheMicro.unmountPromise.then(() => {                loadRouterMicroApp(currentActiveMicroConfig)            })            return        }        // 加载应用        loadRouterMicroApp(currentActiveMicroConfig)    }}// 加载微应用export function loadRouterMicroApp(currentApp) {    const micro = loadMicroApp(currentApp)    micro.mountPromise.then(() => {        // 挂载完成 设置一下vuex微应用列表        store.dispatch('d2admin/micro/SET_MICRO_APPLICATION_LIST', {            key: currentApp.activeRule,            value: micro        })    })}// 获取容器节点export function getContainerNode(container) {    const containerNode = container && document.querySelector(container)        if (containerNode) {        return containerNode.childNodes.length    }        return -1}
```

**vuex 方法 记录一下注册应用对象**

```
// 主应用/src/store/modules/d2admin/modules/micro.jsimport MICRO_CONFIG from '@/const/micro/application-list.js 'export default {    state: {        microApplicationList: new Map([]) // 已经注册的微应用列表    },    getters: {        microApplicationList(state) {            return state.microApplicationList        }    },    actions: {        // 设置微应用程序列表        SET_MICRO_APPLICATION_LIST({ state, dispatch }, { key, value }) {            state.microApplicationList.set(key, value)        },        // 通过路径获取微应用配置        GET_FIND_MICRO_CONFIG({ state }, path) {            return MICRO_CONFIG.find(e => {                return getPathPrefix(path, '/') === getPathPrefix(e.activeRule, '/')            })        }    }}// 获取当前的基础路径  如: getPathPrefix('/user/age/xxx', '/') => '/user'export function getPathPrefix(path, prefix = '') {    if (!path) return    const pathArray = String(path).split('/').filter(item => item)    const basePath = prefix + pathArray[0]    return basePath}
```

**🚀 Link: 更多的 keep-alive 解决方案**

十三、沙箱模式
=======

CSS 沙箱
------

> 微前端对于样式隔离问题，目前相关配套还不是很成熟

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1In74J78rLmQK4fds97YoGeiafhlSXbY0kmbgrLL8O1piacNcjokuWcOQ/640?wx_fmt=png) image.png

*   由于微前端场景下，不同技术栈的子应用会被集成到同一个运行时中，所以我们必须在框架层确保各个子应用之间不会出现样式互相干扰的问题。不同于 JavaScript 的隔离，目前 CSS 隔离在行业内还不完全的成熟，但是 “甲之蜜糖，乙之砒霜 “，每个方案都有着不同的优势与劣势。
    
*   样式隔离有着各种方案
    

*   BEM （Block Element Module）规范
    
*   CSS-Modules 构建时生成各自的作用域
    
*   CSS in JS 使用 JS 语言写 CSS
    
*   Shadow DOM 沙箱隔离
    
*   experimentalStyleIsolation 给所有的样式选择器前面都加了当前挂载容器
    
*   Dynamic Stylesheet 动态样式表
    
*   postcss 增加命名空间
    

*   但是即使是有着如此多的样式隔离方案，css 还是会有一堆问题等着你去处理。例如：
    

*   不同应用依赖了同一个 UI 库，不同版本的情况
    
*   子应用，样式丢失或应用到了主项目的样式
    
*   微应用构运行时越界例如 **body 构建 DOM 的场景（弹窗、抽屉、popover 等这种插入到主应用 body 的 dom 元素）**，必定会导致构建出来的 DOM 无法应用子应用的样式的情况。
    

> 本文采取的样式隔离的最佳实践是：采用约定式隔离，用 CSS 命名空间。备选：CSS Module、css-in-js 等工程化手段，建立约束：如：避免写全局样式，子应用不能侵入 (如动态增加全局样式等) 修改除本应用外的样式，子应用样式写在以子应用名作为命名空间的类里等。

1.  **默认沙箱**
    

*   qiankun 是默认开启沙箱隔离的，默认情况下沙箱可以确保单实例场景子应用之间的样式隔离，但是无法确保主应用跟子应用、或者多实例场景的子应用样式隔离
    

3.  **严格样式隔离的沙箱模式**
    
    ```
    start({  sandbox: {    strictStyleIsolation: true // 严格沙箱模式  }})
    ```
    
    qiankun 会为每个微应用的容器包裹上一个 shadow dom 节点，从而确保微应用的样式不会对全局造成影响，基于 ShadowDOM 的严格样式隔离并不是一个可以无脑使用的方案，大部分情况下都需要接入应用做一些适配后才能正常在 ShadowDOM 中运行起来
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1kom1HnKuYkiaUa4YZ1ZiacmTnI960y2YnvbyESpFA0U3S9bVlaDIqWAQ/640?wx_fmt=png)image.png
    
4.  **qiankun 还提供了一个实验性的样式隔离特性 experimentalStyleIsolation**
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1Xibfr84a53JmI4DammGSxPxk6UXjpajQ852L4VpxSibErjXALjGEE1hw/640?wx_fmt=png)image.png
    

*   当 experimentalStyleIsolation 被设置为 true 时，qiankun 会改写子应用所添加的样式为所有样式规则增加一个特殊的选择器规则来限定其影响范围
    

6.  **BEM （Block Element Module）规范命名约束**
    
    特定规则链接：
    
    ```
    模块：            .Block
    模块多单词：       .Header-Block
    模块_状态：        .Block_Modifier
    模块__子元素：     .Block__Element
    模块__子元素_状态：.Block__Element_Modifier
    ```
    

*   '-'  中划线 ：仅作为连字符使用，表示某个块或者某个子元素的多单词之间的连接符号。
    
*   __  双下划线：双下划线用来连接块和块的子元素
    
*   _   单下划线：单下划线用来描述一个块或者块的子元素的一种状
    
*   **B** - `Block` 一个独立的模块，一个本身就有意义的独立实体 比如：`header`、`menu`、`container`
    
*   **E** - `Element` 元素, 块的一部分但是自身没有独立的含义 比如：`header title`、`container input`
    
*   **M** - `Modifier` 修饰符，块或者元素的一些状态或者属性标志 比如：`small`、`checked`
    

8.  **CSS Modules**
    

*   指的是我们像 import js 一样去引入我们的 css 代码，代码中的每一个类名都是引入对象的一个属性，通过这种方式，即可在使用时明确指定所引用的 css 样式。并且 CSS Modules 在打包的时候会自动将类名转换成 hash 值，完全杜绝 css 类名冲突的问题。
    

10.  **CSS In JS**
    

*   CSS in JS，意思就是使用 js 语言写 css，完全不需要些单独的 css 文件，所有的 css 代码全部放在组件内部，以实现 css 的模块化
    

12.  **postcss 增加命名空间**
    
    ```
    npm i postcss-plugin-namespace -D
    ```
    
    ```
    module.exports = ctx => {    return {        plugins: [            require('postcss-plugin-namespace')('#your-prefix', {                ignore: ['html', /body/]            })        ]    }}
    ```
    
    ```
    <html id="your-prefix"></html>
    ```
    

*   public/index.html
    
*   配置 postcss
    

1.  在项目根目录创建`postcss.config.js`文件
    
    该插件会将全局所有 class 前加上统一前缀，并过滤掉 ignore 内的标签；ignore 内可以写字符串，可以写正则表达式。但每次编译前都会运行，所以可能会增加编译时间
    
    注意：如果用`/body/`这样的正则，会将所有带 body 的 class 都过滤掉，比如`el-drawer__body`、`el-dialog__body`等。
    

JavaScript 沙箱
-------------

qiankun 框架为了实现 JavaScript 隔离，提供了三种不同场景使用的沙箱，分别是 **`snapshotSandbox`**、**`proxySandbox`**、**`legacySandbox`**

*   快照沙箱 (snapshotSandbox)：`qiankun`的快照沙箱是基于`diff`来实现的，主要用于不支持`window.Proxy`的低版本浏览器 (IE 浏览器)，而且也只适应单个的子应用
    
*   代理沙箱 (proxySandbox)：`qiankun`基于`es6`的`Proxy`实现了两种应用场景不同的沙箱，
    

*   一种是`legacySandbox`(单例)
    
*   一种是`proxySandbox`(多例)
    

*   PS：**qiankun 默认开启沙箱模式**
    

*   但是 qiankun 目前还是有一些缺陷：**给某个内置对象添加属性或方法会导致突破沙箱限制，污染都全局的 window 属性**
    
*   **沙箱不是万能的，沙箱只有一层的劫持，例如 Date.prototype.xxx 这样的改动是不会被还原的**
    

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1F3GuygMXdSzGa1OFlgKib2gZicWxo8FOzn1GiaicDykRodcGdWw02fUOYg/640?wx_fmt=png) image.png

```
// 示例    // 1. 子应用-改写了 setItem 方法    window.localStorage.setItem = function() {      console.log('Hi child')    }    // 2. 兄弟应用-调用 setItem    console.log(window.localStorage.setItem) // ƒ () {console.log('Hi child')} 污染了全局    // 3. 主应用-调用 setItem    console.log(window.localStorage.setItem) // ƒ () {console.log('Hi child')} 污染了全局
```

*   **微应用挂载 window 的 是 proxy 代理出来的 window，并不是真实的 window，所以修改会被隔离掉**
    

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1iawXAMjNnDDUAX2AdbmibdDiagibZ627W1xqU3CszrdOtXq1toicObfpvSw/640?wx_fmt=png) image.png

```
// 1. 主应用window.user = {    my: {        name: 'I m your father'    }}// 2. 微应用 这里第一次输出还是会继承父的 数据console.log(window.user)  // {my: {name: "I m your father"}}window.user = { // 改变数据    my: {        name: 'child'    }}console.log(window.user)  // {my: {name: "child"}}// 3. 兄弟应用 因为有沙箱隔离不会影响到 windowconsole.log(window.user)  // {my: {name: "I m your father"}}
```

微前端中最多的问题就是在沙箱中了，无论是 CSS 还是 JavaScript 沙箱都不是十全十美的，我们只能通过各种约束来避免沙箱出现问题的可能。例如：建立团队前缀，命名空间 CSS、事件、本地存储和 Cookie，以避免冲突并明确所有权。

**笔者整理了一下经常出现问题的场景。**

1.  由于 qiankun 沙箱的缺陷，window 对象并不是完全隔离的，子应用的 window 又是基于父应用的，经常导致的是：父应用的依赖库已经挂到 window 上了，子应用再挂载的时候就报错了
    
2.  微前端海纳百川的特性，当不同技术栈的应用被集合在同一个” 运行时环境 “的时候，微应用之间会出现样式互扰的问题，依赖版本冲突的问题
    
3.  代码在沙箱内运行错误的问题，主要是 BOM，DOM 的 API 使用冲突，因为无法隔离所以会有改写的危机
    
4.  qiankun 会将微应用的 JS/CSS 内容都记录在全局变量中，如果一直重复的挂载应用没有卸载，会导致内存占用过多，导致页面卡顿。
    
5.  给 body 、 document 等绑定的事件，必须在 unmount 周期清除，使用 document.body.addEventListener 或者 document.body.onClick 添加的事件并不会被沙箱移除，会对其他的页面产生影响
    
6.  第三方引入的 JS 不生效，有些 JS 文件本身是个立即执行函数，或者会动态的创建 scipt 标签，但是所有获取资源的请求是被乾坤劫持处理，所以都不会正常执行，也不会在 window 下面挂载相应的变量
    
7.  由于是相同的 window 对象，不会有应用之间的隔离，localStorage、sessionStorage、cookie 等对象互相冲突覆盖
    
8.  改变全局变量 window/location 的默认行为，通过 document 操作 Layout 的 DOM，这些本身都是一些不推荐的做法
    

十四、localStorage、sessionStorage 应用之间的使用
======================================

*   **因为父子应用都是同一个 window，所以 localStorage、sessionStorage、cookie, 这些方法就会造成数据覆盖问题**
    
*   正常读取即可，因为无论父子应用，存储的相关信息都以父应用的地址进行存储。
    
*   需要注意微应用之间数据冲突、数据覆盖问题，这里改写一个 setItem getItme 解决这个问题
    

PS:

*   此方案只是针对难以改动的老项目去做的，不推荐去改变 window 的方法，如果您有这个需求则应该去抽离成一个类或函数去做。
    
*   子项目的改动原 window 的 prototype qiankun 的沙箱无法处理隔离
    
*   目前不支持 sessionStorage[“keyName”] = value， sessionStorage.keyName =  value 这种写法，如果想使用以上方法可以使用 proxy or  defineProperty 改写本文不再赘述
    
*   动态给 getItem、setItem 方法加前缀，这样在接入旧项目的时候不会这么痛苦，取巧方式，不推荐
    

```
//定义需要遍历的常量const storageMap = [  {    storage: sessionStorage,    method: 'getItem'  },  {    storage: sessionStorage,    method: 'setItem'  },  {    storage: localStorage,    method: 'getItem'  },  {    storage: localStorage,    method: 'setItem'  }]// 改写方法function formatItem(storage, method) {  storage[method] = function(key, value, isGlobal = false) { // isGlobal 是否存储or查找全局    if (window.__POWERED_BY_QIANKUN__ && !isGlobal) { // 如果是qiankun则追加前缀      key = BASE_ROUTER_PATH + key    }    Object.getPrototypeOf(storage)[method].call(this, key, value) // 引用原方法改动最小化  }}// 遍历方法storageMap.forEach(({ storage, method }) => {  formatItem(storage, method)})
```

十五、资源共享
=======

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1Gq7gJx72Cm5cmqvNicAZfqzvsvjETedbmIL04o8KdOvs6eZ91RT3PzQ/640?wx_fmt=png)https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d381aa6a6e34b11bf0c9ae59dcc85f4~tplv-k3u1fbpfcp-zoom-1.image

对于应用之间的资源共享，笔者认为这个与微前端的概念是有矛盾的。

微前端的概念：

*   「技术栈无关」：主框架不限制接入应用的技术栈，子应用具备完全自主权
    
*   「独立开发 独立部署」：子应用仓库独立，可独立开发，部署完成后主框架自动完成同步更新
    
*   「独立运行」：每个子应用之间状态隔离，运行时状态不共享，不要共享运行时，即使所有团队都使用相同的框 架。构建自包含的独立应用程序。不要依赖共享状态或全局变量。
    

矛盾思考：

1.  「技术栈无关」是架构上的准绳，具体到实现时，对应的就是：应用之间不应该有任何直接或间接的技术栈、依赖、以及实现上的耦合。
    
2.  按照理想的情况：我们希望微前端尽可能独立解耦，但是不同微应用之间可能存在大量相同的重复的资源依赖，在分秒必争的今天，每一个资源的开销都不容小觑，如果把一些可复用的资源直接共享出去，那岂不是可以高效降低资源的开销了吗。
    
3.  当我们把资源共享出去的时，也给应用带来了依赖冗余，微应用把公共资源引入的同时，也把未来的复杂性也给引入进来了。
    

**1. 共享模块方式**
-------------

以下是笔者整理的共享模块的方式，

### npm 依赖

*   抽离相关代码（utils、组件..) 将其打包并上传 npm 库，然后在需要的微应用中以本地依赖或 npm link 的方式安装依赖，以 npm 的方式达到资源共享的目的。但是其本质只是代码层面的共享与复用，每个应用构建的的时候还是会把依赖包一起打包
    
*   并且 npm 管理，每次 npm 更新的时候都要在各微应用进行重新构建发布。
    

### git submodule or git subtree

*   🚀 Link git submodule
    
*   subtree 和 submodule 的目的都是用于 git 子仓库管理，二者的主要区别在于，subtree 属于拷贝子仓库，而 submodule 属于引用子仓库。
    
*   他们允许你将一个 Git 仓库当作另外一个 Git 仓库的子目录。这允许你克隆另外一个仓库到你的项目中并且保持你的提交相对独立
    
*   创建一个 libs 的项目进行管理维护，里面存放各种公用的方法，组件，图片等，并且同步到 gitlab 上
    
*   `git submodule` 和 `git subtree` 都是很好的子仓库管理方案，但缺点是每次子应用变更后，聚合库还得同步一次变更，考虑到并不是所有人都会使用该聚合仓库，子仓库独立开发时往往不会主动同步到聚合库，使用聚合库的同学就得经常做同步的操作，比较耗时耗力，不算特别完美。
    

### webpack Externals

*   🚀 Link git Externals
    
*   配置 webpack 输出的 bundle 中排除依赖，换句话说通过在 Externals 定义的依赖，最终输出的 bundle 不存在该依赖，
    
*   externals 前提是依赖都要有 cdn 或 找到它对应的 JS 文件，例如：jQuery.min.js 之类的，也就是说这些依赖插件得要是支持 umd 格式的才行。
    
*   通过这种形式在微前端基座应用加载公共模块，并将微应用引用同样模块的 Externals 移除掉，就可以实现模块共享了 但是存在微应用技术栈多样化不统一的情况，可能有的使用 Vue3，有的使用 React 开发，但 externals 并无法支持`多版本共存`的情况
    

> qiankun 不建议共享依赖，担心原型链污染等问题，如果一定要使用：推荐使用 webpack 的 Externals 来共享依赖库。

**使用场景：**

*   如果主子应用使用的是**相同的库或者包！！！** (`vue、axios、vue-router、element` 等) 可以用 externals 的方式来引入，减少加载重复包导致资源浪费，**一个项目使用了之后，另一个项目使用不再重复加载，可以直接复用这个文件**。
    

**使用原理：**

*   `qiankun` 将子项目的外链 `script` 标签，内容请求到之后，会记录到一个全局变量中，下次再次使用，他会先从这个全局变量中取。这样就会实现内容的复用，只要保证两个链接的 `url` 一致即可。
    

**使用方式：**

*   微应用之间使用
    

*   只要子项目配置了`webpack` 的 externals，并在 `index.html` 中使用外链 `script` 引入这些公共依赖，只要这些公共依赖 URL 一致即可，请求的时候会优先从缓存中读取，类似 HTTP 缓存
    

*   微应用使用基座依赖
    

*   给微应用的公共依赖的加上 `ignore` 属性（这是自定义的属性，非标准属性）。
    
*   `qiankun` 在入口解析的时候会判断如果有这个属性就忽略。子项目独立运行，这些 `js/css` 仍能被加载，如此，便实现了 “子项目复用主项目的依赖”。
    

```
module.exports = {     configureWebpack: {         externals: {             'vue': 'Vue',             'vue-router': 'VueRouter',             'vuex': 'Vuex',             'element-ui': 'ELEMENT'         }    }}
```

```
<link ignore rel="stylesheet" href="//cnd.com/antd.css"><script ignore src="//cnd.com/antd.js"></script>
```

PS：主项目使用`externals` 后，子项目可以复用它的依赖，但是不复用依赖的子项目会报错。

🚀 Link # [Bug] 公共依赖提取的时候，qiankun，代理 window 访问并没有先访问微应用的 window，再访问主应用的 window

### webpack DLL

*   🚀 Link webpack DLL
    
*   dll 插件可以帮助我们直接将已安装好的依赖在 node_module 中打包出来，结合 **add-asset-html-webpack-plugin** 插件帮助我们将生成打包好的 js 文件插入到 html 中
    
*   因为使用公共依赖，意味着所有使用公共依赖的应用，必须使用同版本的依赖，并且 qiankun 使用 dllplugin 提取公共依赖后，导致不同子应用中的全局 filter、component、mixin 相互影响
    

### 使用 lerna 管理

*   Lerna · 是一个管理工具，用于管理包含多个软件包（package）的 JavaScript 项目 | Lerna 中文文档
    

### 通过聚合目录

*   聚合目录相当于是一个空目录，在该目录下 clone 所有子仓库，并 .gitignore，子仓库的代码提交都在各自的仓库目录下进行操作，这样聚合库可以避免做同步的操作。
    

上面的方案都是业内比较成熟的方案，还需开发者深入了解，笔者采用的是：NPM、webpack external。对外的且稳定的组件或封装，推荐 `npm` 包方式。

2. 通过主应用共享资源给微应用
----------------

主应用的下发资源的核心就是：**注册的时候通过 props 下发**

### **props 方式**

*   **父应用注册时或加载时，将依赖通过 `props` 传递给子应用，子应用在 `bootstrap` 或者 `mount` 钩子函数中获取**
    
*   主应用注册下发，任何你想要的资源，但是切勿无脑下发资源，需要考虑日后解耦或独立运行的问题。
    

```
// 主应用/src/const/micro/application-list.jsimport { layout, assets, config, layout, public } from '/lib'export default [{    name: 'you-app-name', // 应用的名字    entry: '//localhost:7286/', // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch    container: '#you-app-name-container', // 容器id    activeRule: '/you-app-name', // 根据路由激活的路径，这里注意要与子应用对应的 package ==> name 文件一致    props: { // 下发微应用的入口, 如果是固定确认的资源可以维护在应用注册列表        hideLayout: true, // 是否隐藏子应用侧边栏、导航栏        defaultPath: '', // 默认跳转地址        commonComponent: {}, // 下发的组件        public: public, // 父亲应用公共文件        assets: assets, // 父应用资源文件        config: config, // 父应用配置文件        layout: layout  // 父应用布局组件    }}]
```

如果是动态数据可以注册的时候传递下发

```
import store from '@/store/index'import router from '@/router'// 在微应用 props 属性 动态下发配置。currentApp.props = {  ...currentApp.props,  router: router, // 下发父应用路由  store: store // 下发父应用vuex}loadMicroApp(currentApp) // 注册应用的时候在子应用可以在微应用的生命周期中获取
```

*   微应用接收
    

```
// 微应用 mount 中接收import childStore from '@/store/index'import childRouter from '@/router'export async function mount(props) {    render(props)}// 动态挂载 通过 this.$root.xxx 使用 data 的数据function render(props = {}) {    // 获取父应用下发的资源，并存储在 data 上    const { container, router，store，layout, config, assets, public, commonComponent } = props    instance = new Vue({        childRouter,        childStore,        data() {            return {                parentRouter: router, // 父应用路由                parentVuex: store, // 父应用 vuex                parentLayout: layout, // 父应用布局组件                parentConfig: config, // 父应用配置文件                parentAssets: assets, // 父应用资源文件                parentPublic: public, // 父亲应用公共文件                parentCommonComponent: commonComponent // 下发的组件            }        },        render: h => h(App)    }).$mount(container ? container.querySelector('#you-micro') : '#you-micro')}
```

### window 方式

*   因为主项目会先加载，然后才会加载子项目，所以一般是子项目复用主项目的组件，做法也很简单，主项目加载时，将组件挂载到 `window` 上，子项目直接注册即可
    
*   但是笔者这里不推荐任何修改 window 的方式，因为沙箱缺陷的缘故，不打扰就是最好的安排～
    

**主项目入口文件：**

```
import HelloWorld from '@/components/HelloWorld.vue'window.commonComponent = { HelloWorld };
```

**子项目直接使用：**

```
components: {  HelloWorld: window.__POWERED_BY_QIANKUN__ ? window.commonComponent.HelloWorld : import('@/components/HelloWorld.vue'))}
```

### **项目间的组件共享**

> 子项目本身自己也有这个组件，当别的子项目已经加载过了，就复用别人的组件，如果别的子项目未加载，就使用自己的这个组件

适用场景就是避免组件的重复加载，这个组件可能并不是全局的，只是某个页面使用。做法分三步：

**1. 由于子项目之间的全局变量不共享，主项目提供一个全局变量，用来存放组件**

*   **通过 `props` 传给需要共享组件的子项目。**
    

```
// 主应用import HelloWorld from '@/components/HelloWorld.vue'props: {  commonComponent: {    HelloWorld  }}
```

**2. 子项目拿到这个变量挂载到 `window` 上**

```
export async function mount(props) {  window.commonComponent = props.data.commonComponent  render(props.data)}
```

**3. 子项目中的共享组件写成异步组件，异步组件需要返回 Promise.resolve()**

```
components: {   HelloWorld: async () => {      if (!window.commonComponent) {        window.commonComponent = {} // 独立运行时      }      const HelloWorld = window.commonComponent.HelloWorld      return HelloWorld || (window.commonComponent.HelloWorld = import('@/components/HelloWorld.vue'))   }}
```

十六、应用通信
=======

**通信设计原则**

*   跨应用通信：解耦易接入
    
*   开放但不失约束：通信收口，统一管理
    
*   简单易用：学习成本低，接口尽可能少
    
*   易于维护：分模块管理，避免通信冲突
    
*   容易排查：链路监控性强，及时跟踪问题
    

**微前端通信方式**

*   基于 URL
    

*   使用简单、通用性强，但能力较弱，不适用复杂的业务场景
    

*   基于 Props
    

*   应用给子应用传值。适用于主子应用共享组件、公共方法调用等。
    

*   发布 / 订阅模式
    

*   一对多关系，观察者和被观察者是抽象耦合的。但是数据链路难跟踪。
    

*   状态管理模式
    

*   能够统一管理，链路清晰，易维护
    

*   基于 `localStorage`、`sessionStorage` 实现的通信方式
    

*   不推荐，因为 JSON.stringify() 会造成数据丢失，它只会对 Number、String、Booolean、Array 转换，对于 undefined、function、NaN、 regExp、Date 都会丢失本身的值
    

基于 URL、Props 、LocalStorage 的方式就不讲述了上文都有对应的说明，以下只对 发布 / 订阅模式，状态管理模式进行讲解

发布 / 订阅模式 EventBus
------------------

笔者这里的设计模式是，主应用注册 EventBus，然后通过 props 下发微应用，这样微应用既有主应用的 EventBus 也可以有自己的 EventBus

*   主应用注册 EventBus
    

```
Vue.prototype.$eventBus = new Vue()export const parentEventBus = Vue.prototype.$eventBus
```

*   通过 props 下发
    

```
// 在微应用 props 属性 动态下发配置。import { parentEventBus } from '@/main'currentApp.props = {    ...currentActiveMicroConfig.props,    parentEventBus: parentEventBus // 下发主应用的 EventBus}loadMicroApp(currentApp)
```

*   子应用接受并注册
    

```
// 微应用 mount 中接收export async function mount(props) {    render(props)}// 动态挂载 通过 this.$root.xxx 使用data的数据function render(props = {}) {    const { parentEventBus } = props    Vue.prototype.$eventBus = new Vue() // 子应用的独享的 EventBus    Vue.prototype.$parentEventBus = parentEventBus // 主应用下发的 EventBus    // 注册操作省略 ...}
```

*   使用 还是正常使用
    

```
this.$parentEventBus.$off('you-event') // 关闭this.$parentEventBus.$on('you-event', data => { // 监听  // xxxx code action})this.$parentEventBus.$emit('you-event', {...}) // 发布
```

使用 qiankun initGlobalState
--------------------------

*   主应用
    

```
// src/const/micro/actions.jsimport { initGlobalState } from 'qiankun'export const initialState = {}const actions = initGlobalState(initialState)export default actions
```

*   主应用使用
    

```
import actions from '@/const/micro/actions'// 设置actions.setGlobalState({   xxxxDataKey: xxxValue})// 监听全局actions.onGlobalStateChange((state, prev) => {  console.log(state, prev, '子应用的 state: 变更后的状态; prev 变更前的状态')})
```

*   微应用
    

```
// src/const/micro/actions.js 封装一下到时候引入使用方便function emptyAction() {    // 警告：提示当前使用的是空 Action    console.warn('Current execute action is empty!')}class Actions {    // 默认值为空 Action    actions = {        onGlobalStateChange: emptyAction,        setGlobalState: emptyAction    }    // 设置 actions    setActions(actions) {        this.actions = actions    }    // 映射监听    onGlobalStateChange(...args) {        return this.actions.onGlobalStateChange(...args)    }    // 映射设置    setGlobalState(...args) {        return this.actions.setGlobalState(...args)    }}const actions = new Actions()export default actions
```

*   微应用使用
    

```
import actions from './const/micro/actions'export async function mount(props) {    actions.setActions(props) // 设置一下 actions 对象}actions.onGlobalStateChange((state, prev) => {  // 监听公共应用下发 state: 变更后的状态; prev 变更前的状态})
```

状态管理模式
------

*   基于父应用的 vuex store 传给子应用
    

```
// 在微应用 props 属性 动态下发配置。import store from '@/store/index'currentApp.props = {    ...currentActiveMicroConfig.props,    store: store // 下发主应用的 store}loadMicroApp(currentApp)
```

*   子应用接受并使用
    

```
// 微应用 mount 中接收export async function mount(props) {    render(props)}// 动态挂载 通过 this.$root.xxx 使用data的数据function render(props = {}) {    const { container, store } = props    instance = new Vue({        childStore,        data() {            return {                parentVuex: store, // 父应用 vuex            }        },        render: h => h(App)    }).$mount(container ? container.querySelector('#you-micro') : '#you-micro')}
```

*   使用
    

```
this.$root.parentVuex.state.xxxx // 读this.$root.parentVuex.commit('xxxx', {}) // 写
```

十七、微应用内存溢出思考
============

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuwNjgibFz53gTia2BlNmYBv1Mg4UfPAK83shcdCKib1owxqDj3G54icRreD9I2IbgRNPpibVnjR4hon1A/640?wx_fmt=png)image.png

*   qiankun 会将微应用的 JS/CSS 内容都记录在全局变量中，如果一直重复的挂载应用没有卸载，会导致内存占用过多，导致页面卡顿
    
*   虽然官方没有明确说名内存的溢出问题，但是笔者在开发的过程中，在重复加载应用的时候崩溃过几次，出于安全性思考还是使用一些手段来约束变量的开销吧～
    

1.  微应用卸载的时候清空微应用注册的附加内容及 DOM 元素等
    
2.  设置自动销毁时间，去销毁那些长时间挂载的应用，
    
3.  设置最大运行应用数量，超过规定的数量的时候吧第一个应用销毁
    

**1. 卸载时清空无用实例**

```
export async function unmount() {     instance.$destroy()     instance.$el.innerHTML = '' // 关键    instance = null     route = null    // ... more}
```

**2. 设置过期时间与最大运行数，这里的的内容可以结合上面的内容来看，上文有对应的说明**

```
// src/const/micro/index.jsexport const MAX_RUN_MICRO_NUMBER = 5 // 最大运行微应用数量
```

```
// 主应用/src/const/micro/application-list.jsexport default [{    name: 'you-app-name', // 应用的名字    // ... micro app config    // 自动销毁时间 单位：3000（ms） or (Infinity = 永久不会销毁）    unmountTime: '300000'}]
```

**注册的时候记录时间**

```
// src/const/micro/qianun-utils.js// 注册应用的方法export function loadRouterMicroApp(currentApp) {    // 1. 返回注册应用对象    const micro = loadMicroApp(currentApp)    // 2. 微应用挂载完成    micro.mountPromise.then(() => {        // 3. 在应用对象，增加开始时间字段，记录微应用挂载时间        micro.createTime = new Date().getTime()        // 4. 在应用对象，增加卸载时间字段 记录应用卸载时间，如果时间是空默认 永不销毁        micro.unmountTime = currentApp.unmountTime || 'Infinity'        // 5. 设置当前应用列表, 记录挂载应用挂载信息，后期路由会匹配是否是否需要卸载        store.dispatch('d2admin/micro/SET_MICRO_APPLICATION_LIST', {            key: currentApp.activeRule,            value: micro        })    })}
```

**路由守卫的时候判断是否需要卸载**

```
router.afterEach(to => {    microApplicationLoading(to.path)})
```

```
// 主应用/src/const/micro/qianun-utils.js// 加载微应用方法export async function microApplicationLoading(path) {    // 1. 根据路由地址加载当前应用配置    let currentActiveMicroConfig = await store.dispatch('d2admin/micro/GET_FIND_MICRO_CONFIG', path)    // 2. 获取微应用列表    const microApplicationList = store.getters['d2admin/micro/microApplicationList']    // 3. 判断应用运行时间销毁应用    store.dispatch('d2admin/micro/CHECK_UNMOUNT_MICRO', { microApplicationList, currentActiveMicroConfig })    // ... code 后面注册判断操作就省略了}
```

判断是否最大堆栈、判断是否超时销毁

```
// 主应用/src/store/modules/d2admin/modules/micro.jsexport default {    state: {        microApplicationList: new Map([]),    },    actions: {        // 检查一下是否需要卸载微应用 依据时间来判断 microApplicationList：缓存微应用列表，currentActiveMicroConfig：当前URL匹配的微应用配置        CHECK_UNMOUNT_MICRO({ state, dispatch }, { microApplicationList, currentActiveMicroConfig }) {            // 1. 判断时候有缓存列表            if (!microApplicationList.size) {                return            }                        // 2. 获取当前时间            const currentTime = new Date().getTime()            // 3. 遍历缓存应用列表，判断应用是否需要销毁了～            Array.from(microApplicationList).forEach(([key, item]) => {                // 4. 获取应用运行时间                const runningTime = currentTime - item.createTime                // 5. 获取应用卸载时间                const unmountTime = item.unmountTime                // 6. 如果有微应用配置，这说明跳转就是已经挂载过的微应用了，刷新应用时间与取消应用销毁（续费一下，避免销毁有激活重复开销）                if (currentActiveMicroConfig) {                    item.createTime = new Date().getTime()                    // ！！！设置一下当前缓存应用列表，更新应用时间，判断是否达到最大堆栈，是否需要清除应用！！！                    dispatch('SET_MICRO_APPLICATION_LIST', {                        key: item.activeRule,                        value: item                    })                    return                }                                // 7. 如果运行时大于销毁时间则销毁对应应用，并且不是 Infinity 关键字                if (runningTime >= unmountTime && unmountTime !== 'Infinity') {                    dispatch('DELETE_MICRO_APPLICATION_LIST', key)                }            })        },                // 删除微应用程序列表        DELETE_MICRO_APPLICATION_LIST({ state }, key) {            const micro = state.microApplicationList.get(key)            micro && micro.unmount()            state.microApplicationList.delete(key)        },                // 设置微应用程序列表        SET_MICRO_APPLICATION_LIST({ state, dispatch }, { key, value }) {            // 判断是否达到最大堆栈，清除应用            dispatch('CLEAR_MICRO_STACK')            state.microApplicationList.set(key, value)        },                // 检查是否需要清空堆栈        CLEAR_MICRO_STACK({ state, dispatch }) {            // 判断是否是 Infinity 无堆栈限制            if (MAX_RUN_MICRO_NUMBER === 'Infinity') {                return            }            // 判断是否达到最大堆栈            if (state.microApplicationList.size < MAX_RUN_MICRO_NUMBER) {                return            }            // 获取MAP的第一个应用销毁并删除vuex信息            const key = state.microApplicationList.keys().next().value            dispatch('DELETE_MICRO_APPLICATION_LIST', key)        }    }}
```

十八、同一路由多应用共存
============

*   如果一个页面同时展示多个微应用，需要使用 `loadMicroApp` 来加载。
    
*   如果这些微应用都有路由跳转的需求，要保证这些路由能互不干扰，需要使用 `momery` 路由。
    
*   `vue-router` 使用 `abstract` 模式，`react-router` 使用 `memory history` 模式，`angular-router` 不支持。
    
*   Vue Router 的导航方法 (`push`、 `replace`、 `go`) 在各类路由模式 (`history`、 `hash` 和 `abstract`) 下表现一致。
    
*   `abstract` 是 vue 路由中的第三种模式，本身是用来在不支持浏览器 API 的环境中，充当 fallback，无论 hash 还是 history 模式都会对浏览器上的 url 产生作用，于是我们利用到了 abstract 这种与浏览器分离的路由模式解决多应用路由冲突的问题。
    

```
function render({ data = {} , container, defaultPath } = {}) {    router = new VueRouter({        mode: 'abstract', // 不会被URL所影响        routes    })    instance = new Vue({        router,        store,        render: h => h(App)    }).$mount(container ? container.querySelector('#appVueHash') : '#appVueHash')    if (defaultPath) {        router.push(defaultPath)    }}
```

十九、微应用开发与部署
===========

开发与部署目录建议
---------

> 建议在开发与部署的时候，所有的微应用都放在一个目录，虽然 qiankun 的应用只需提供微应用 URL 地址即可，从理论上来说项目放在那里都是没有影响的。但是出于管理维护的目的，我们还是推荐：

*   相关应用都在同一个目录下，统一管理
    
*   所有微应用都是独立项目、独立仓库、独立部署
    

```
└── micro-app-container       # 根文件夹    ├── main/                 # 基座应用/主应用    ├── child/                # 存放所有微应用的文件夹    |   ├── vue-hash/         # 存放微应用 vue-hash 的文件夹    |   ├── vue-history/      # 存放微应用 vue-history 的文件夹    ├── package.json          # 公共文件的 index.html 执行命令    ├── node_modules/         # 公共文件依赖
```

使用 npm-run-all 简化 script 配置
---------------------------

根据上面的结构一个一个 启动 or 打包应用太麻烦了，使用 npm-run-all 命令 **解决 npm run** **命令无法同时运行多个脚本的问题**

npm-run-all 的三个特点：

*   顺序执行 、并行执行、混合执行
    
*   `--parallel`: 并行运行多个命令，例如：npm-run-all --parallel lint build
    
*   `--serial`: 多个命令按排列顺序执行，例如：npm-run-all --serial clean lint build:
    
*   `--continue-on-error`: 是否忽略错误，添加此参数 npm-run-all 会自动退出出错的命令，继续运行正常的
    
*   `--race`: 添加此参数之后，只要有一个命令运行出错，那么 npm-run-all 就会结束掉全部的命令
    

安装依赖

```
npm install npm-run-all --save-dev// oryarn add npm-run-all --dev
```

配置命令 package.json, 一键给所有应用安装依赖

```
// 执行 install: 的命令～ 可以批量执行相同命令的前缀，可以异步、同步执行命令// 例如：npm run install-all 就给所有项目安装依赖"scripts": {    "install:child-hash": "cd child/child-hash && yarn",    "install:child-history": "cd child/child-history && yarn",    "install:main": "cd main && yarn",    "install-all": "npm-run-all install:*", // 全局安装依赖    "start:child-hash": "cd child/child-hash && npm run serve",    "start:child-history": "cd child/child-history && npm run serve",    "start:main": "cd main && npm run serve",    "serve-all": "npm-run-all --parallel start:*", // 全局启动    "build:child-hash": "cd child/child-hash && npm run build",    "build:child-history": "cd child/child-history && npm run build",    "build:main": "cd main && npm run build",    "build-all": "npm-run-all --parallel build:*" // 全局打包}
```

**或者配合脚本可以自己写一写简单的 shell 脚本**

```
# script/clone-all.sh# 相关项目地址# xxx 项目git clone http:/xxxxxxx.git# xxx 项目git clone http://xxxxxxxx.git
```

**package.json 中增加命令执行**

```
"clone:all": "bash ./scripts/clone-all.sh" // npm run clone:all 便可以批量克隆项目了 
```

**部署的时候也和开发的时候一样，不过可以直接放在基座应用里面使用**

```
└── html/                     # 根文件夹
    |
    ├── child/                # 存放所有微应用的文件夹
    |   ├── vue-hash/         # 存放微应用 vue-hash 的文件夹
    |   ├── vue-history/      # 存放微应用 vue-history 的文件夹
    ├── index.html            # 主应用的index.html
    ├── css/                  # 主应用的css文件夹
    ├── js/                   # 主应用的js文件夹
```

**此时需要设置微应用构建时的 `publicPath` 和 `history` 模式的路由 `base`，然后才能打包放到对应的目录里。构建的时候切记要修改 webpack 中的 publicPath 地址！！！**

<table width="NaN"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">项目</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">路由 base</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">publicPath</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); color: rgb(51, 51, 51); font-weight: normal; min-width: 85px;">真实访问路径</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">vue-hash</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">无</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">/child/vue-hash/</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">http://localhost:8080/child/vue-hash/</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">vue-history</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">/child/vue-history/</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">/child/vue-history/</td><td data-style="border-color: rgb(204, 204, 204); color: rgb(102, 102, 102); min-width: 85px;">http://localhost:8080/child/vue-history/</td></tr></tbody></table>

*   vue-history 微应用
    
    ```
    base: window.__POWERED_BY_QIANKUN__ ? '/app-vue-history/' : '/child/vue-history/',
    ```
    
    ```
    module.exports = {  publicPath: '/child/vue-history/',};
    ```
    

3.  同时主应用的配置文件 entry 入口也要和当前环境一样需要动态更改
    

2.  微应用 webpack 打包 publicPath 配置（`vue.config.js`）：
    

1.  微应用路由设置：
    

*   但是笔者觉得这样写真的不优雅，笔者希望有关于微前端的所有配置都在一个微前端配置页里面维护，并且清晰可见。
    
*   所以笔者的做法是方法判断环境传入一个对象，减少三元的丑陋与混乱，把路由前缀动态的下发给微应用，但微应用注册的时候，在动态把前缀加上
    

```
// 主应用 src/const/micro/application-list.js// 获取不同环境的入口function getEentry({ prodPath, devPath }) {    const isProduction = process.env.NODE_ENV === 'production'    return isProduction ? prodPath : devPath}// 注册微应用列表export default [    {        name: 'your-name', // 应用的名字        // 默认会加载这个html 解析里面的js 动态的执行 （子应用必须支持跨域）fetch        entry: getEentry({            devPath: '//localhost:7286/', // 开发环境地址            prodPath: `/child/your-name/` // 生产环境地址        }),        props: { // 下发微应用的入口            routeBase: '/app-vue-history/', // 动态下发路由前缀        }    }]
```

总结
==

*   感谢各位能看到这里，这是笔者在微前端实践的一些心得，碍于篇幅原因，很多技术细节我们就不再文中赘述了，如果有希望了解更多 qiankun 原理，或者更多实践细节的小伙伴，可以在文章底部留言，在**此很感谢能给予我实践机会的彬哥与标哥**，希望本文能在您微前端的探索之路为您照亮前方，感谢支持，本文如果有笔误的的地方，欢迎提出，定会及时修复与改进，愿君代码路上一路畅通无阻～
    

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibvfsf7LONeRerVQk5hrZiaFmyZxVKFDkBQueianibIkB7WgbnIx7DKY77KfEx0XE5O09gNhC8IqXDwQg/640?wx_fmt=gif)