> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [juejin.cn](https://juejin.cn/post/7066966456638013477)

从 Vue3 正式发布到现在，也快过去一年了（写这行文字的时候是 2021 年 09 月 08 日，拖延症...）。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f0c643b01c3c44cabd6ebea8fa82b63d~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

但是就我最近招聘面试的一些经历来看，很多 Vue 技术栈的候选人依然还没有使用过 Vue3。

关于他们没有选择使用 Vue3 这个事情，我觉得也是可以理解的。一方面，Vue3 直接放弃了 IE11。虽然 IE 的用户数量在持续下降，但是想让老板们直接放弃 IE11 还是有一些困难。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c083d736727742d7b912e7b59ef458e8~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

另外就是，做项目这种事情，有时候人们的选择就是能用就行，升级 Vue3 可能并不能给项目带来太多效益。对于一些历史悠久的项目，甚至还要考虑 Vue3 新生态是否完善的问题，是不是能够支撑自己完美过渡。

诚然，拥抱新技术还存在着这么一些障碍，是否选择新技术需要综合去考量。但是从做技术的角度出发，我们还是要保持一个 Open 的心态，敢于去接受新鲜事物，即便短期不能直接用在工作中，也可以自己私下感受下新框架给我们带来了什么新的体验。

早些时候，我为了更深入地了解前后端完整链路，特意自己实现了个人博客。早期效果如下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/238072d66bc040ab883012745c0a011c~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

之后一方面是觉得博客做得太难看，另一方面是想尝试在 Vue 项目中实践 TS，于是 2020 年我就立了一个 Flag 做重构，当时技术选型是 vue-class-component + vue-property-decorator，类组件 + 装饰器模式。做了一段时间，感觉开发体验也不是很好，慢慢就放弃了，等着 Vue3 的发布。

最近也是借着一些业余时间完成了自己的一个 Flag，虽然延期了很久，但总算是有了结果。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0bf65bc541a44e385046277168fd304~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

首先分享下在线链接：[Tusi 博客](https://link.juejin.cn?target=https%3A%2F%2Fblog.wbjiang.cn%2F "https://blog.wbjiang.cn/")

整体架构
====

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/231c24b8a2634f7dbf622f1b9bcfb0a8~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

从技术选型来看，我还是选择了一些比较接地气的框架和技术。

其实对于博客这种 SEO 要求高的网站，优选的方案还是 SSR，但我还是选择了 CSR 方案（毕竟是个人项目，怎么舒服怎么来），后续时间充裕的情况下再考虑下 SEO 优化。

Web 端这块，我是直接选择了 [Vue3](https://link.juejin.cn?target=https%3A%2F%2Fv3.cn.vuejs.org%2F "https://v3.cn.vuejs.org/") + [TS](https://link.juejin.cn?target=https%3A%2F%2Fwww.typescriptlang.org%2Fdocs%2F "https://www.typescriptlang.org/docs/") 作为一个开发骨架。作为一个代码洁癖选手，我还是非常倾向于使用 TS 的。

UI 方面，我选择了 AntDesign 为主、ElementPlus 为辅的这样一个组合，这两个 UI 框架都是非常优秀的，但二者都有一些对方没实现的能力，所以我综合使用了二者。读者们也不用担心性能问题，按需加载情况下，用两套 UI 框架也没有什么压力，这一点我也是思考过的。

视觉效果这块，基本上属于我自己发挥想象了，凭着自己感觉做的一个整体效果。然后我也是采用了 Mobile First 的理念，优先完成移动端视觉效果，结合 Media Query 去做一些其他屏幕的适配。

在客户端这块，除了 Web 端，我早期还是做了小程序的，这个可以在微信直接搜索到，名字也是 **Tusi 博客**。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15ea276e9fbd413889133f2a2ab06f62~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

回过头来看，如果是这种跨端的系统，我应该优选 uniapp 这类的方案，不过这个小程序我做得比较早，那会儿我几乎还不会小程序开发，也是属于一个边学习边开发的状态。

后端这块，也是开发得比较早，那会儿可选的 Node 框架也不多，所以我选择了比较流行的 [Express](https://link.juejin.cn?target=https%3A%2F%2Fwww.expressjs.com.cn%2F "https://www.expressjs.com.cn/")，这确实是一个易上手并且好用的框架，Express 不会给你灌输太多的设计模式，对于初次接触后端的朋友来说，是一个非常友好的选择。

数据库我选择的是关系型数据库 MySQL，接入层当然首选 Nginx 啦。

云服务器配置
======

我买的云服务器配置是：1 核 2GB 1Mbps

这对于前期负载不是很高的个人项目来说，是足够的。反正现在都支持弹性伸缩，不够就加，问题不大。

部署方式
====

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3c668ccf8ea4c11bc4f37039e01dc33~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

整体上采用了自动化部署的策略。Node 这块是基于 PM2 去做进程守护和自动化部署。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/49136892bb784dc1ac9b6c2593505376~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

前端则是基于 Github Actions 实现的 CI/CD。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1508dfb54f224212a43ffe799fd8c06d~tplv-k3u1fbpfcp-jj-mark:3024:0:0:0:q75.awebp)

我购买的云服务器配置很普通，图片资源放自己服务器上是不现实的，所以我的图片资源是放在七牛云存储。

未完待续
====

本文主要是对 [Tusi 博客](https://link.juejin.cn?target=https%3A%2F%2Fblog.wbjiang.cn%2F "https://blog.wbjiang.cn/")做了一个总体的介绍，让大家先有个整体的印象。整个博客应用确实是比较简单，但也算是一个前后端完整的系统，应该能给朋友们带来一点帮助或思路。接下来，我将分几篇文章详细讲讲我是怎么实现这些功能的，敬请期待！

代码，拿来吧你
=======

> 本项目代码已开源，具体见：
> 
> 前端工程：[vue3-ts-blog-frontend](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fcumt-robin%2Fvue3-ts-blog-frontend "https://github.com/cumt-robin/vue3-ts-blog-frontend")
> 
> 后端工程：[express-blog-backend](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fcumt-robin%2Fexpress-blog-backend "https://github.com/cumt-robin/express-blog-backend")
> 
> 数据库初始化脚本：关注公众号 [bin 不懂二进制](https://link.juejin.cn?target=https%3A%2F%2Fqncdn.wbjiang.cn%2F%25E5%2585%25AC%25E4%25BC%2597%25E5%258F%25B7%2Fqrcode_bin.jpg "https://qncdn.wbjiang.cn/%E5%85%AC%E4%BC%97%E5%8F%B7/qrcode_bin.jpg")，回复关键字 “博客数据库脚本”，即可获取。

系列文章
====

**Vue3+TS+Node 打造个人博客**系列文章如下，持续更新，欢迎阅读！点赞关注不迷路！😍

*   [Vue3+TS+Node 打造个人博客（总览篇）](https://juejin.cn/post/7066966456638013477 "https://juejin.cn/post/7066966456638013477")
*   [Vue3+TS+Node 打造个人博客（数据库设计）](https://juejin.cn/post/7070001585199251487 "https://juejin.cn/post/7070001585199251487")
*   [Vue3+TS+Node 打造个人博客（后端架构）](https://juejin.cn/post/7072903323128594462 "https://juejin.cn/post/7072903323128594462")
*   [Vue3+TS+Node 打造个人博客（前端架构）](https://juejin.cn/post/7245674094493057082 "https://juejin.cn/post/7245674094493057082")
*   [Vue3+TS+Node 打造个人博客（分页模型和滚动加载）](https://juejin.cn/post/7301242196888387593 "https://juejin.cn/post/7301242196888387593")
*   [Vue3+TS+Node 打造个人博客（一键到顶和侧边弹射）](https://link.juejin.cn?target=)
*   [Vue3+TS+Node 打造个人博客（文章创作和 Markdown 渲染）](https://link.juejin.cn?target=)
*   [Vue3+TS+Node 打造个人博客（评论系统的巧妙设计）](https://link.juejin.cn?target=)
*   [Vue3+TS+Node 打造个人博客（Socket.IO 在线聊天室）](https://link.juejin.cn?target=)
*   [Vue3+TS+Node 打造个人博客（登录，权限，后台管理）](https://link.juejin.cn?target=)
*   [Vue3+TS+Node 打造个人博客（自动化部署）](https://link.juejin.cn?target=)
*   [Vue3+TS+Node 打造个人博客（小程序博客）](https://link.juejin.cn?target=)