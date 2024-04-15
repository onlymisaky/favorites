> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eZ3CoPrB3qtX0bMRCUkghw)

你是否考虑过在 Vue.js 或其他框架中构建组件库，或者你需要它来构建可重用的设计系统，以减少投入市场的时间并提供视觉一致性，或者你想为社区贡献另一个组件库。

你可能想立即投入进去并开始编码，但是首先你必须退后一步，问问自己：“是什么构成了一个好的组件库？”

让我们在这篇文章中回答这个问题，给你一个我们认为是必要考虑的项目清单。

漂亮的组件
-----

首先，美观很重要。组件库不仅应该功能良好，而且看起来很有吸引力。在选择采用自定义构建之前，请仔细考虑您的视觉需求。各种现有框架中的任何一个都可能就足够了。如果您熟悉 Tailwind CSS，请考虑围绕这个流行的 CSS 实用程序框架构建库。

功能组件
----

Vue 将功能性和交互性完美融合，将 JavaScript 的强大功能发挥到了极致。确保组件按预期运行是不容置疑的。它们必须兑现承诺，提供开发人员所期望的必要功能。

直观的设计
-----

易用性是最重要的。设计直观而灵活的组件需要注意细节——从一致和直观的命名约定到优先考虑开发人员体验的周到设计方法。

跨浏览器和设备兼容性
----------

确保你的组件库在各种浏览器和设备上无缝运行是至关重要的。这不仅包括基于屏幕大小的响应式设计，还包括选择的 JavaScript API 与目标浏览器兼容。

易访问性 (A11y)
-----------

无障碍性不仅仅是一个流行词，它是一种必需品。你的库应该迎合各种各样的用户，包括那些有残疾的人。将无障碍特性 (如 ARIA 属性) 合并到你的组件中，不仅可以扩大你的用户群，而且可以与包容性设计的最佳实践保持一致。

类型安全和自我文档
---------

在现代开发环境中，类型安全至关重要。使用 TypeScript 开发 Vue 组件库提供了自文档化特性，可以直接在 IDE 中为最终开发人员提供帮助。这些帮助以有用的悬停提示、有针对性和专注的自动补全和针对组件 API 的错误检测的形式出现。这对开发人员的效率和满意度有巨大的提升，并减少了他们必须在代码和库文档之间来回跳转的时间。

服务器端渲染 (SSR)
------------

支持客户端和服务器端渲染的灵活性，特别是对于像 Nuxt 这样的库来说，对于一个全面的 Vue UI 库来说是必不可少的。

测试覆盖率
-----

一个经过良好测试的库会给人带来信心。它使库维护者有信心定期添加新功能、更新依赖项，并修复 bug，而不用担心退化。它给库用户带来信心，更新不会导致他们的应用崩溃 (或更糟糕，以一些微妙、难以检测但业务基本的方式崩溃)。编写良好的测试和良好的覆盖率使库充满活力，不断发展，可以跟上不断变化的环境。考虑使用测试驱动开发 (TDD)，使测试成为工作流中无需思考的一部分。

主题化系统
-----

支持主题化允许自定义和个性化，这是调整库以适应不同项目的品牌和样式要求 (在合理范围内) 的关键。Vuetify 和 Prime Vue 等库为实现有效的主题系统提供了灵感。

全面的文档
-----

好的文档的重要性怎么强调都不为过。它通常是一个库被采用和成功的决定性因素。太多的维护者认为文档是事后的想法。不要犯同样的错误，它值得同样的关注。

可扩展性和可维护性
---------

一个好的组件库不仅应该满足当前的需求，还应该为未来的扩展做好准备。一个干净、组织良好的代码库有助于维护和引入新功能，确保库仍然相关和有用。这与一个经过良好测试的库密切相关，但也意味着要考虑版本控制、可预测的发布周期等因素。

结论
--

虽然所涵盖的方面是基础的，但一个真正出色的库通常包括额外的功能，如 Figma UI kits、完整的应用程序和 / 或网站模板、helper composables、有用的指令和 i18n 支持等。

构建一个组件库无疑是一项重大的任务，但它也是一项值得挑战的任务。没有必要从一开始就解决所有可能的需求。从小处开始，根据现实世界的反馈反复改进，这比一开始就追求完美更有效。如果现有的库不能满足您的需求，创建一个定制的库可能适合您。只要确保您考虑了这个清单上的项目，就可以构建一些真正令人惊叹的东西！

* * *

改编自：https://vueschool.io/articles/vuejs-tutorials/what-makes-a-good-vue-component-library-a-checklist/

[![](https://mmbiz.qpic.cn/mmbiz_jpg/WYoaOn5t0ANHxwSZwnNETiaM7gicXoNwK3nWPpibHwDfQsbRtlfNWsAlooSThhOHx62L8oDG0ic7BmW33Y83j2fmOQ/640?wx_fmt=jpeg)](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500844&idx=1&sn=630fa466181ce0597c335efd22bfbeda&chksm=f362e28fc4156b99ba391d5f32b3d8c5d1d252c031b7353d4e82cde3a27950538f6d834ea659&scene=21#wechat_redirect)

最近文章  

-------

*   [推文微博分享 15：见证奇迹的时候到了](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500850&idx=1&sn=c8bdf8ce1d9d81b5bd689444d46ce116&chksm=f362e291c4156b871b70746f636cd1cc31b255c700ba5f6b59e230513bf6d41b6f761abc4176&scene=21#wechat_redirect)  
    
*   [如何简化多个 if 的判断结构](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500844&idx=1&sn=630fa466181ce0597c335efd22bfbeda&chksm=f362e28fc4156b99ba391d5f32b3d8c5d1d252c031b7353d4e82cde3a27950538f6d834ea659&scene=21#wechat_redirect)  
    
*   [勤奋解决不了路线错误：记录移动开发者在矩阵打法中的困境](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500802&idx=1&sn=b6da8540ab629f6f803560a9483937da&chksm=f362e2a1c4156bb7512e07078e6f3a0fb4c68a1a80722b889a146a7c897d5074e7c0a517c96a&scene=21#wechat_redirect)  
    
*   [推文微博分享 14：软考想进体制就去考](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500772&idx=1&sn=7c3aa3abfe34334da64274298b8dd7a7&chksm=f362e2c7c4156bd1082b8b42425c420ad018d9f7d5f3dc215fea8672a25db32ed7f3880d7ed4&scene=21#wechat_redirect)
    
*   [推荐一个产品：简单设计，稿定设计、创客贴的简单平替](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500770&idx=1&sn=4e95a27dec277edb07ba37807a516b1a&chksm=f362e2c1c4156bd7013418f17d0996509af183cf9aeab5067af481c054fb0dbf5d12d93448e1&scene=21#wechat_redirect)  
    
*   [使用 Node.js 和 htmx 构建全栈 CRUD 应用程序](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500755&idx=1&sn=743859e53fcc53b37f13b5c126dd6a19&chksm=f362e2f0c4156be6862a094235a7d99e785d03b5a8ed7b12976730144871a2b5139cc8cda6d0&scene=21#wechat_redirect)  
    
*   [Flutter 3.13 之后如何监听 App 生命周期事件](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500689&idx=1&sn=91498bd5347a6ba61b0d62307f95327b&chksm=f362e332c4156a2423a7b2c43d2275af1a1879620aa4ecf76a31bb5c869997ba94cbb712e283&scene=21#wechat_redirect)  
    
*   [使用 GitHub Actions 通过 CI/CD 简化 Flutter 应用程序开发](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500677&idx=1&sn=142e11e3796c07c94db4c3a0bf2cc648&chksm=f362e326c4156a30547364bdfcec453ce943a497aa1851a8abf7d1f1524bfc04aa44cb0459b4&scene=21#wechat_redirect)  
    
*   [揭示 Dart 和 Flutter 中扩展（Extensions）的强大功能](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676500653&idx=1&sn=bf0b97e8166ae90c73bcd55ee2a3365b&chksm=f362e34ec4156a5831854adaa9d824090025776db45c40695aabfa3b2da737e463a55319defe&scene=21#wechat_redirect)