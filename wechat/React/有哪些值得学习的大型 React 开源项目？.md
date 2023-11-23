> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/k1kDqffdABiJKnUdm1W_mA)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

之前有很多小伙伴问过我，通过文档或者视频学习 `React`  已经有一段时间了，想学习一些好的开源项目来获得一些实战经验。我之前也没有很好的答案，确实很难找，因为一般企业级应用都是不开源的，`Github` 上大部分都是很简单的 `DEMO` 项目，很难挑选。

今天就给大家梳理了几个我觉得还不错的 `React` 开源项目。

Jira Clone
----------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickwsJ7kJyXRxGAfYA3522VDSSOJBcMI6HK07t1rpwGaUCW9fYsHAHibbg/640?wx_fmt=png)

*   仓库：https://github.com/oldboyxx/jira_clone
    
*   Github Star：8.6K
    

这是一个基于 `React` 开发的模仿 `Jira` 的项目，前端全部使用 `React Hooks` 实现 。另外还有一些其他亮点：

*   后端是基于 `TypeScript` 的 `TypeORM`，和 `Postgres` 进行通信
    
*   在前端使用自定义 `Webpack` 配置
    
*   基于 `Cypress` 进行端到端测试
    

作者还使用 `styled-components` 和全局样式进行混合开发，使他看起来和 `Jira` 非常像。

RealWorld aka Conduit
---------------------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickwhr4iafe4wxrOicEblqsibsIKUI6MXv55FQiboCgAZJC5IhiamUM274n2MQ/640?wx_fmt=png)

*   仓库：https://github.com/gothinkster/react-redux-realworld-example-app
    
*   Github Star：5.3K
    
*   预览：https://react-redux.realworld.io/
    

`Thinkster` 的 `RealWorld` 以超过 24 种不同的语言和框架重新实现了一个相同的应用程序（一个名为 `Conduit` 的仿 `Medium.com` 程序），这是它的 `React/Redux` 版本。

它基于 `create-react-app` 创建，用 `react-router` 实现路由，用 `Redux` 实现状态管理，基于 `classNames` 编写样式，基于 `superagent` 请求远程数据。

Real World App
--------------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickOZviclfg9XvNpzWqsPZdsZfBXVNHowRWUgjiaAXM5n1LEdhNUaGOZPHA/640?wx_fmt=png)

*   仓库：https://github.com/cypress-io/cypress-realworld-app
    
*   Github Star：3.7K
    

`Real World App` 是使用 `Cypress` 对程序进行端到端测试的一个很好的 `DEMO` 项目。在 `repo` 中包含了示例数据，自动化测试和应用程序都可以开箱即用地运行。

它基于 `create-react-app` 构建，使用 `TypeScript` 编写，带有 `Express` 后端，使用 `Material UI` 作为 UI / 组件库，使用 `Formik` 实现表单，使用 `react-router` 实现路由。

HospitalRun
-----------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickgGvnwkZ8Qeb1W7qUvIUBpkCic2g9txiaibnRsHIXYBffF9X0aWP4cicWKQ/640?wx_fmt=png)

*   仓库：https://github.com/HospitalRun/hospitalrun-frontend
    
*   Github Star：6.5K
    

`HospitalRun` 是一个成熟的电子健康记录系统 (`EHR`) 和医院信息系统 (`HIS`)  Web 应用。它是一个非常完整的 `OSS` 解决方案。使用 `TypeScript + React` 编写，并使用 `SCSS` 编写样式。大多数组件都存在于 `components` 包中。

Simorgh
-------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickTXYmqzbEBuVc7MyibwqLsSM1mAH1xia1dgvzTjd7mc0UrbtAiajsiaN2iaA/640?wx_fmt=png)

*   仓库：https://github.com/bbc/simorgh
    
*   Github Star：751
    
*   预览：https://astexplorer.net/
    

`Simorgh` 是 `BBC`（没错，就是那个天天抹黑中国的新闻网站） 的 `React SPA`，目前为全球数百万生产用户提供服务。它正在逐步推广到每个 `BBC World Service News` 网站。

它使用 `PropTypes` 进行类型检查，使用 `Jest` 和 `Enzyme` 进行单元测试（覆盖率已经达到 `98%` ），使用 `Cypress` 进行端到端测试，使用 `styled-components` 编写样式，使用 `Express` 处理服务端渲染。

AST Explorer
------------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkick4HlHTGSFiaPM1IdYEmm8HRjut7T5Y4k9eFQaIY4WRN7icibYX2nQ0ibZtw/640?wx_fmt=png)

*   仓库：https://github.com/fkling/astexplorer
    
*   Github Star：4.8K
    

`AST Explorer` 是一个在线生成抽象语法树的工具。

作为一个 `React` 项目很值得一试，因为它是持续开发很多年项目的一个很好的例子。使用 `PropTypes` 进行类型检查，使用 `Redux` 进行状态管理。

虽然你不会在这里找到像 `TypeScript/Flow` 这样的花哨的东西，但它的代码注释很完善，也很清楚地指出了很多编码技巧。另外，它们也逐步在将类组件迁移到 Hooks 上。

Excalidraw
----------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickrKHagef2scQkPyrSLLzRcuZgXyyluetHoyjiaxd92XeNugxX10fcytw/640?wx_fmt=png)

*   仓库：https://github.com/excalidraw/excalidraw/
    
*   Github Star：31.2K
    

`Excalidraw` 是一个在线图形绘制工具（手绘风格），我一直在用。

它使用 `TypeScript + React Hooks` 编写，使用 `SCSS` 进行样式处理。

Spectrum
--------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickPfq76uf26BAianPh9sOsQYdJDQ8fVTrYoygWGQPQseUlicicCqI2f5EVg/640?wx_fmt=png)

*   仓库：https://github.com/withspectrum/spectrum
    
*   Github Star：10.6K
    

`Spectrum` 是一个社区网站，它的目标是将实时聊天应用程序的功能和论坛的功能结合起来。它自从 `2017` 年初以来一直在积极开发中，并于 `2018` 年底被 `GitHub` 收购。

`Spectrum` 在早期是非常有趣的，因为它使用 `RethinkDB` 实时更新查询、服务器渲染和 `GraphQL`（在当时看来都是非常先进的技术）。

代码库使用 `Flow` 进行类型检查，使用 `Apollo (GraphQL)` 进行数据获取，使用 `Redux` 进行状态管理，使用 `Express` 服务器进行服务器渲染，并编写了大量的自定义 `React Hooks`。

Sentry
------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickd9qsZYnGvpjJwb6JVAGQRqryV8sAqkVB9QFibpdWqrAIiboNrs5BuB8g/640?wx_fmt=png)

*   仓库：https://github.com/getsentry/sentry
    
*   Github Star：31.5K
    

`Sentry` 是一个开源的前端异常监控工具。后端基于 `Django` 实现，前端基于 `TypeScript + React` 实现，使用 `Emotion` 进行样式管理，基于 `react-router` 实现路由，使用 `Redux` 进行状态管理。

Grafana
-------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkick7lU829HoJQZgFG6fKAeoO49xsZdCSH7Hr8LjChsPbpXUC2SvJGyhKg/640?wx_fmt=png)

*   仓库：https://github.com/grafana/grafana
    
*   Github Star：50.2K
    

它是一个正在从 `AngularJS` 迁移到 `React` 的项目，基于 TypeScript 编写，用 `Redux` 进行状态管理。

GoAlert
-------

![](https://mmbiz.qpic.cn/mmbiz_png/e5Dzv8p9XdSdRkhk04cqxRQrq5OOtkickOlL2QaRwk2VX1K9MaZ3g0mumIA0fLmCQRpiac6UC6YIu5WfiaRlWiaS9A/640?wx_fmt=png)

*   仓库：https://github.com/target/goalert
    
*   Github Star：1.7K
    

`GoAlert` 是一个开源的 `oncall` 调度程序和通知程序（类似于 `PagerDuty` 或 `Opsgenie`）。

他的后端是 `Go` 实现的，使用 `Apollo (GraphQL)` 进行数据获取，使用 `react-router` 实现路由，使用 `Redux` 进行状态管理，`Cypress` 进行端到端测试，使用 `Material UI` 用于样式组件，使用原生的 `CSS` 编写样式。

最后
--

参考链接：https://maxrozen.com/examples-of-large-production-grade-open-source-react-apps

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

如果你有任何想法，欢迎在留言区和我留言，如果这篇文章帮助到了你，欢迎点赞和关注。

希望本文对你所有帮助～

`点赞`和`在看`是最大的支持⬇️❤️⬇️