> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ErNdbeufS8HLH96EOtPw4w)

> 作者：漂流瓶 jz
> 
> https://juejin.cn/post/7240404579133128760

BFF 是一种 Web 架构，全名为 Backends For Frontends，即为服务于前端的后端。这个词来源于 Sam Newman 的一篇文章：Pattern: Backends For Frontends[1]。BFF 一般指的是在前端与后端之间加增加一个中间层。为什么要在前端和后端之间增加一个 BFF 层呢？

计算机科学家 David Wheeler 曾经说过一句话：`All problems in computer science can be solved by another level of indirection.`计算机科学中的所有问题都可以通过加一层来解决。因此，需要使用 BFF 的场景，肯定是普通的前后端开发模式遇到了部分问题。例如在 Sam Newman 的文章中就描述了 BFF 解决多个展示端的场景。

多端展示问题
------

在系统一开始开发的时候只考虑了 PC 网页端的设计，服务器端 API 是为了 PC 网页端而服务的。但是后来随着移动互联网的兴起，移动端开始流行，决定在原有服务端的基础上开发移动端 App，复用之前的 API，但是原有 API 是为了 PC 端设计的，并不符合移动端的需求。

1.  PC 端的需求与移动端并不一定完全相同，现有接口无法满足所有移动端的新需求。
    
2.  PC 端电脑性能强，可以并发请求多个接口或进行部分较复杂的数据处理，但是移动端性能低，如果使用同样的多个接口，由前端组装数据，页面展示可能会出现延迟和卡顿现象。
    
3.  PC 端的屏幕较大，展示内容较多且全面。但是移动端屏幕小，展示内容较少。而且部分数据的获取并不容易，需要后端调用许多服务。如果移动端复用 PC 端接口，会获取和传输部分无用数据，不仅消耗服务端资源，还浪费网络带宽。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnVWE9c7mM8qQSctfp5GiaicQssKQuUIGcjbqJRQictmd5olTlfDCPZ0ficQw/640?wx_fmt=other)bff-1.png

而且随着科技的发展和用户的需求，不同的展示端越来越多，在不仅在手机上会区分 Android 端，IOS 端，而且还会有平板电脑端，手机网页端，PC 网页端，PC 的 APP 端等等。这些端的页面设计各不相同，对于数据的需求也不相同。假设我们复用同一个服务端和 API 接口，如果出现不满足需求的场景就加接口加字段，那么随着这些不同客户端的开发和迭代，服务端会变的大而臃肿，效率低下。而且同一个接口提供给太多前端调用，涉及到太多的逻辑，复杂性越来越高。

因此，更好的方式是服务端对展示进行解耦，服务端只负责提供数据，有专门的展示端负责前端的展示业务。这里的展示端就是 BFF 层。

不同业务场景的展示模式差异
-------------

在某些业务中，客户端的类型只有一种，但是在不同的场景下，展示的模式有差异。比如在美团的 BFF 实践中，不同行业的团购货架展示模块不同，是两套独立定义的产品逻辑，并且会各自迭代。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnV0rb9sEddmzricCiad9KJ0XJZLfA9Pw9mSicnEyXdqpqtnzxdG0pMMkTCA/640?wx_fmt=other)bff-2.png

在这种业务场景下，虽然是同一个客户端，但是业务不同，需求的数据格式和类型也不同，因此遇到与上面多端展示类似的接口问题。

短生命周期的需求
--------

还有一种情形，是闲鱼团队遇到的短生命周期的需求。在普通的业务场景下，服务端正常稳定迭代开发。但是偶尔会有一些特殊的运营活动，这种活动时间较短，可能仅仅持续几天时间。

如果仅仅为了这些几天的活动，每次都要开新 API，联调，甚至修改原有服务端的逻辑，成本较大，而且较为低效。如果加一层 BFF，让前端可以直接获取数据，那么开发和联调会变的简单很多。

业务整合需要
------

在某些情形下，业务后端和需求比较复杂，例如这篇文章涉及到的场景 [2]，有一个`Moments App`, 包含了像用户管理，关系管理，信息，头像，点赞等多种多种后端微服务。这些服务在前端展示的逻辑耦合性较强。比如有些需要串行处理，例如得到服务 1 的结果才可以调用服务 2；有些则可以并行处理。而数据合并和整理的逻辑额较为复杂。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnVVxXwQThb7MQPPibjp2OloFFhmgm28IoobHcxHrm1rcO34ia9IXN5k3wQ/640?wx_fmt=other)bff-4.png

图片来源：跨平台架构：如何设计 BFF 架构系统？[3]

网易云音乐也使用 BFF 进行微服务的调度以及数据的组装和适配。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnV5EFJia9VmpdIeegbc3j0EMusVYcE114ibccWPYCcicD0NcVAyIWx569gw/640?wx_fmt=other)bff-9.png

图片来源：基于 GraphQL 的云音乐 BFF 建设实践 [4]

这时候可以设立一个 BFF 层，作为一个数据整合服务，将调用不同微服务接口，与数据处理的复杂逻辑都在 BFF 端中实现，降低了前端的复杂度，也提高了响应效率。

处理部分展示相关的业务
-----------

在使用了 BFF 之后，部分页面展示相关的业务逻辑可以抽象出来，交由 BFF 端处理。

例如数据导出 Excel 下载服务，输入导入 Excel 上传服务。BFF 层可以接收用导入的 Excel，解析并处理表格数据，然后提供给服务端。在导出时，也可以调用服务端 API 获取数据，由 BFF 端整合提供给前端下载。在这种情形下，服务端只需要提供一个展示接口，就可以满足页面展示和导出两种不同格式的展示需求。导入也是同理。而且假设表格与页面展示要求的数据格式不同，例如导入时部分字段值需要作转换，那么也可以由 BFF 端处理这种差异。

BFF 的类型
-------

BFF 本身仅仅是一个概念，实现方式有多种，在实际中我们要根据不同的场景选取不同的方案。按照大类分，主要有单一 BFF 和多端 BFF。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnVu4r3NYGnrkAujTrnoe1bNLjicZZDtwYTh6ibKGZoibRiaaBjuNw32gvxRA/640?wx_fmt=other)bff-3.png

### 单一 BFF

单一的 BFF 主要对接服务端，根据展示服务的需求组装数据提供给每个端或者每种业务进行展示。

很多单一 BFF 都会用到 GraphGL，他是由 Facebook 开发的数据查询工具。通过该工具，可以将不稳定的数据组装部分从稳定的业务数据逻辑中剥离，使数据控制逻辑前移，开发模式由 “下发数据” 转变成 “取数据” 的过程。

例如美团，闲鱼，网易云音乐等的 BFF，都提供了按需查询能力，一个 BFF 对接多种客户端或者多种业务的需求。下图是美团使用的 BFF 架构设计。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnVuYHgB6mJIp7S4PCx6mY6wzfqJu4khHPPU0yobMOic5mWFH0cwIgLKJA/640?wx_fmt=other)bff-6.png

图片来源：GraphQL 及元数据驱动架构在后端 BFF 中的实践

### 多端 BFF

多端 BFF 是指每种业务或者每种客户端采用自己独立的 BFF 层，这样每种客户端的服务更加灵活，不同的 BFF 端对于展示服务解耦性更高。

### 前端 BFF 与后端 BFF

从技术上分，BFF 又可以分为前端 BFF 和后端 BFF。即 BFF 层由前端团队主导或者后端团队主导。前端团队的 BFF 一般使用 Node.js，后端团队则会使用 Java 或者其他服务端语言。

如果使用前端 BFF，可以实现谁使用谁开发，一定程序生避免了前后端实现的上不必要的沟通成本。但需要前端团队有一服务端开发经验，对前端团队的技术建设有较高需求。但是前端也能更深入的接触业务逻辑，对于重展示的业务需求有一定优势。例如淘宝的实践：大淘宝技术行业 FaaS 化实战经验分享 [5]。

### 传统接口与按需查询

传统接口模式即正常开发接口，固定入参和返回数据格式，供前端调用。按需查询模式即前端调用接口时指定需要哪些数据，前端自主进行按需查询。GraphQL 即是使用按需查询的模式。

BFF 的其他特点
---------

### 与 ServerLess 集成

使用前端 BFF 时，前端开发可能缺乏运维经验，而且在高可用，并发性等问题上可能会遇到挑战。如果结合 Serverless 实现自动扩容，弹性伸缩等功能，可以解决一些 BFF 的问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnVicicQ3TcwhZeS6u1Eib2xicV2QdxEDA4adicCIm443wbiczlwwFWjoibywBiaA/640?wx_fmt=other)bff-7.png

阿里云的云原生团队介绍了这一方法：基于函数计算的 BFF 架构 [6]（图片来源）

### BFF 与网关

网关可以提供路由，认证，监控，日志等服务。网关可以与 BFF 集成在一起，也可以作为独立的一层来实现。如果业务复杂，还可以在不同的 BFF 上层配置不同的网关。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/mshqAkialV7HMHAvI9TwOdicJtXib7aahnVfjKydYhGlG682TrJAtuI4D4djVvdiblhLaScPD07HrYjH7C2vN27tDQ/640?wx_fmt=other)bff-8.png

这篇文章介绍了在不同场景下，BFF 层与网关的应用。微服务架构：BFF 和网关是如何演化出来的？[7]（图片来源）

BFF 的优势
-------

通过上面的的各种问题和场景，相信我们已经知道了 BFF 可以解决很多场景的问题，这里总结一下 BFF 的优势：

1.  服务端对数据展示服务进行解耦，展示服务由独立的 BFF 端提供，服务端可以聚焦于业务处理。
    
2.  多端展示或者多业务展示时，对与数据获取有更好的灵活性，避免数据冗余造成消耗服务端资源。
    
3.  对于复杂的前端展示，将数据获取和组装的负责逻辑在 BFF 端执行，降低前端处理的复杂度，提高前端页面响应效率。
    
4.  部分展示业务，可以抽象出来利用 BFF 实现，对于服务端实现接口复用。
    
5.  降低多端业务的耦合性，避免不同端业务开发互相影响。
    
6.  其他优势，包括数据缓存，接口安全校验等。
    

### 参考资料

[1]

Pattern: Backends For Frontends: _https://link.juejin.cn?target=https%3A%2F%2Fsamnewman.io%2Fpatterns%2Farchitectural%2Fbff%2F_

[2]

这篇文章涉及到的场景: _https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2Fbfc652baccf7_

[3]

跨平台架构：如何设计 BFF 架构系统？: _https://link.juejin.cn?target=https%3A%2F%2Fwww.jianshu.com%2Fp%2Fbfc652baccf7_

[4]

基于 GraphQL 的云音乐 BFF 建设实践: _https://juejin.cn/post/7182019663004434488_

[5]

大淘宝技术行业 FaaS 化实战经验分享: _https://juejin.cn/post/7143520902913720327_

[6]

基于函数计算的 BFF 架构: _https://juejin.cn/post/6844904113033969672_

[7]

微服务架构：BFF 和网关是如何演化出来的？: _https://juejin.cn/post/6844903806208049159_

向下滑动查看