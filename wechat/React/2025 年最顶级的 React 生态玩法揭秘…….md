> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MMzYZJ9-Ve00zC57BdWnRw)

到 2024 年，Next.js 已在 JavaScript 框架领域中占据了重要地位，其功能包括服务端渲染 (SSR)、缓存、SEO 优化以及强大的后端支持。然而，即便 Next.js 提供了丰富的功能，开发者仍需要借助外部库来满足特定需求并提升开发体验。本指南将带您探索多个领域中能够显著提升 Next.js 开发体验的顶级外部工具包。

全局状态管理
------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p18RQxFiaMolqAjespJCN6INibJV7yyZvria79Ot44rZyHsQDGEQwNj04JQ/640?wx_fmt=png&from=appmsg)Zustand

### **Zustand**

在 Next.js 应用中管理全局状态变得十分简单得益于 Zustand。这个轻量级的状态管理库支持异步操作和持久化，免去了大量的样板代码。通过 Zustand，可以轻松共享组件状态，避免复杂的设置或繁琐的属性传递。  
**Zustand** *🐻 React 状态管理的基础工具 *

### **Context API**

Next.js 与 React 的 Context API 完美兼容，为组件状态共享提供了一种内置机制。虽然它没有像 Zustand 等专业状态管理库那样的优化和便利，但 Context API 对于简单应用或减少外部依赖的场景来说依然是可行的选择。  
**useContext - React** 用于 Web 和原生用户界面的库

认证
--

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p1odZaFicG6J6UxGic1GWfx9uOAypudNDiadcpibFufOp9scLryGmuL9aP6g/640?wx_fmt=png&from=appmsg)Auth.js

### **NextAuth（现称 Auth.js）**

NextAuth（现已更名为 Auth.js）是 Next.js 应用中实现身份认证的全面解决方案。它支持多种认证提供商及会话管理，极大简化了认证流程。其与 Next.js 服务端组件的兼容性以及灵活的数据库支持，使其成为认证需求的首选工具。  
**NextAuth.js** 专为 Next.js 设计的认证方案

### **Lucia Auth（已废弃）**

Lucia Auth 是一个轻量级且可定制的认证方案，适合需要灵活控制的开发者。虽然尚处于早期阶段，但 Lucia Auth 提供了高性能并允许广泛的定制化。然而，由于其发展尚未成熟，在生产环境中使用时需谨慎。  
**Lucia 文档** Lucia 是一个开源认证库，简化会话处理的复杂性。

UI 组件库
------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p1sRf3EcbibxGrXUjJscWcVegIic9dcAWosbD4ibY0Pyicepe1whXdkZEiaHQ/640?wx_fmt=png&from=appmsg)shadcn/ui

### **Shadcn UI**

Shadcn UI 提供了一种将可定制组件集成到 Next.js 项目的便利方式。它基于 Radix UI 构建，具备多样化的组件，可轻松调整以适应项目设计需求。通过与 Tailwind CSS 无缝兼容，Shadcn UI 易于集成并允许灵活地定制组件，非常适合需要高灵活性和易用性的开发者。  
**shadcn/ui** 精心设计的可访问、可定制的开源组件

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p1uTfzDxk1crp4uPdyhS5qFhw6pbfjoS96O8QvzsVpkAYgcQnzVlOUQQ/640?wx_fmt=png&from=appmsg)NextUI

### **NextUI**

NextUI 提供了一整套优雅且视觉效果极佳的组件，并通过 Framer Motion 提供流畅的动画增强用户体验。尽管其受欢迎程度可能低于 Shadcn UI，但对于需要卓越设计和交互性的项目来说，NextUI 是一个强大的选择。  
**NextUI** 无论设计经验如何，都能打造漂亮的网站

数据获取
----

### **内置 Fetch**

Next.js 扩展了原生的 `fetch()` API，提供增强的数据获取能力。通过内置的服务端渲染支持，每个服务器请求都可以设置持久缓存策略，优化数据获取性能并高效处理请求。  
**Next.js 中的 Fetch 函数** Next.js 对 fetch 函数的 API 参考

### **SWR（Stale-While-Revalidate）**

SWR 是由 Vercel 开发的 React Hooks 数据获取库，提供了一种简单高效的缓存策略。它允许组件在缓存数据的同时自动重新验证数据，与 Next.js 应用无缝集成，为远程数据管理提供了一种轻量化的解决方案。  
**SWR - React Hooks 数据获取库** SWR 首先返回缓存数据（过时），然后发送新的获取请求。

### **React Query / Tanstack Query**

Tanstack Query（前称 React Query）是一款功能强大的数据获取和缓存库。它为数据获取、缓存、同步和更新提供了一种声明式 API，支持高级功能如分页、乐观更新和自动缓存失效，是 Next.js 项目实现复杂数据管理的理想选择。  
**TanStack Query** 强大的异步状态管理、服务器状态工具和数据获取库。

数据库 ORM
-------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p1xlPeiaSgmE3tNAEMql3UUykBBYvVMCstCrEkTSs2OOHMdtPvVfTWuYA/640?wx_fmt=png&from=appmsg)Drizzle ORM

### **Drizzle ORM**

Drizzle ORM 专为无服务器环境设计，轻量且高效。支持几乎所有 SQL 数据库，包括 NEON、PlanetScale 和 Cloudflare D1 等现代无服务器数据库。Drizzle ORM 提供类似于 SQL 的代码体验，并具备类型安全，还配备了 Drizzle Kit，方便进行数据库迁移。  
**Drizzle ORM** 新一代 TypeScript ORM

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p1d1lRZtJ4DY2vyanxoyRLoIibUWvXX1GuiapibxpJygJlaRlPnmJDnStWQ/640?wx_fmt=png&from=appmsg)Prisma

### **Prisma**

Prisma 不需要多做介绍，它因易用性和广泛的数据库支持（包括 MongoDB 和 CockroachDB）而广受欢迎。Prisma 提供了一种类似对象交互的方式，即便是 SQL 新手也能快速上手，其稳定性使其成为数据库开发中的首选工具。  
**Prisma** 为数据库操作提供直观、安全和高效的解决方案

其他重要库
-----

![](https://mmbiz.qpic.cn/sz_mmbiz_png/TRMuLUkXMlWFOFKwArP7ZBkezBCks8p1tGUn5HO0vIgaiaEVJTicOo1OFWQvd7HRriaZTyapTdnd53T6jibjlVI6tA/640?wx_fmt=png&from=appmsg)React Hook Form

### **React Hook Form**

React Hook Form 是一个用于管理 React 应用中表单的强大工具。它通过 React Hooks 提供了一种简单直接的表单状态管理、验证和提交方式，同时支持自定义验证规则和与 UI 库（如 Material-UI）的集成。  
**React Hook Form** 性能优越、灵活且可扩展的表单管理工具

### **DND Kit**

DND Kit 是一个轻量、高效且无障碍的拖放工具包，支持键盘导航和屏幕阅读器等功能。它能够帮助开发者快速实现拖放功能，并且可以根据项目需求进行定制。  
**DND Kit** 现代 React 拖放工具包

### **usehooks**

usehooks 提供了一系列实用的自定义 React Hooks，涵盖状态管理、表单验证、媒体查询等功能，帮助开发者提升代码复用性与开发效率。  
**useHooks** 由 ui.dev 团队提供的 React Hooks 集合

### **Tanstack Table**

Tanstack Table 是一个灵活的表格组件库，支持排序、过滤、分页和行选择等功能，非常适合 Next.js 项目中需要展示复杂表格数据的场景。  
**TanStack Table** 轻松构建强大的数据表格组件

### **Zod**

Zod 是一个 TypeScript 优先的架构声明与验证库，用于确保数据符合指定的形状和约束，帮助开发者避免运行时错误并提升代码可靠性。  
**Zod** TypeScript 静态类型推断的架构验证库

这些工具包涵盖了状态管理、认证、UI 组件、数据获取、表单、拖放、表格以及数据验证等领域，能够帮助开发者简化开发流程、增强功能并打造卓越的用户体验。

*   我是 ssh，工作 6 年 +，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
    
*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！