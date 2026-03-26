> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1Y7ROIH9tZaQ3_jvBVZptA)

```
点击下方“前端开发爱好者”，选择“设为星标”

第一时间关注技术干货！



```

> 哈喽，大家好，我是 `xy`👨🏻‍💻。今天给大家分享一个基于 **Vue3** 的企业级前端应用解决方案——**Fes.js**！

前言
--

在前端开发的世界里，**Vue.js** 以其**轻量级**、**易上手**的特点，赢得了广大开发者的青睐。

而随着 **Vue3** 的发布，我们更是迎来了一个性能更强、更易于维护的版本。

但你是否还在使用 `create-vue` 来初始化你的 **Vue** 项目？

今天，我要向你推荐一个更现代、更强大的选择——**Fes.js**！

Fes.js：Vue 3 的企业级前端解决方案
-----------------------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53U1jrgKllcar6zKDRpngWBjvTgXI2TX7nBUUjeJTTgtI7TnicGl7NibAQ/640?wx_fmt=png&from=appmsg)

**Fes.js** 是一个基于 **Vue3** 的前端应用解决方案，它不仅提供了初始化项目的 **CLI** 工具，还内置了**布局**、**权限**、**数据字典**、**状态管理**等多个模块。

更重要的是，Fes.js 采用了**约定**、**配置化**、**组件化**的设计思想，让你只需关注于用组件搭建页面内容，其余的繁琐配置都交给它来处理。

为什么选择 Fes.js？
-------------

**1. 极速开发体验（Fast）**

Fes.js 提供了**极致敏捷**的开发体验。从创建项目到开发调试，再到编译打包，**Fes.js** 一应俱全。它让开发流程变得前所未有的流畅，大幅提升了开发效率。

**2. 低学习成本（Easy）**

基于 **Vue.js 3.0**，Fes.js 的上手非常简单。它贯彻了 “约定优于配置” 的思想，通过统一的插件配置入口，提供了简单简洁又不失灵活的开发体验。一致性的 API 入口，让学习成本大大降低。

**3. 稳健的性能（Strong）**

**Fes.js** 通过提供单元测试、覆盖测试能力，保障了项目的质量。你只需要关心页面内容，Fes.js 会帮你处理好代码的稳健性和性能优化。

**4. 强大的插件生态**

Fes.js 的真正强大之处在于其**插件生态**。这个生态系统提供了一系列的插件来满足各种开发需求，覆盖了从项目构建、开发调试到运行时功能等多个方面。

如何开始使用 Fes.js？
--------------

使用 **Fes.js** 的步骤非常简单，以下是基本的**初始化步骤**：

**1. 使用 Fes.js CLI 工具创建模板**（以 npm 为例）:

```
npx @fesjs/create-fes-app myvue


```

**2. 提示选择需要的模板** （以 PC 为例）:

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53jAFsm60dZaqtIr4M3pA4LUbhe4UzF43sicycEsHOLdNnZVkfW0lGu3w/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53JBboia7HZvKeHQ7lsByZic6eZ0XWlk2icC8iaJ2aMEnrebOEUZsYlWWA1w/640?wx_fmt=jpeg)

**3. 进入项目文件夹安装依赖启动项目：**

```
# 进入项目文件夹
cd myvue
# 安装依赖
npm install
# 启动
npm run dev


```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm5374LM7vkjVEoiayoanrdBzw2QGKvM7pvLRN3fOzKDIxIS6NtR93DG7aA/640?wx_fmt=png&from=appmsg)

**4. 使用 Vite 作为构建工具：**

**Fes.js@3.0.x** 版本支持 **Vite** 和 **Webpack** 两种构建方式，不再内置构建方式，需要开发者自行选择:

*   选用 Vite 构建，安装 **npm i @fesjs/builder-vite** 依赖即可。
    
*   选用 Webpack 构建，安装 **npm i @fesjs/builder-webpack** 依赖即可。
    

```
npm i @fesjs/builder-vite


```

重新启动：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53tpOOkqbaVM7xUn4RxPtCQHqltUlYqicMrpdS3Yfia90XgCx4e4DpmdgQ/640?wx_fmt=png&from=appmsg)

如何使用插件
------

Fes.js 把大家常用的技术栈封装成一个个**插件**进行整理，收敛到一起，让大家只用 **Fes.js** 就可以完成 **80%** 的日常工作。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm532KHqkTr3N9XJ3AJI8qX0xfz8RKF9wlJ9k6pPEW93oNHw0R0B1GM5hg/640?wx_fmt=png&from=appmsg)

### 以下是一些核心插件及其功能：

*   **路由插件**：基于 Vue Router，自动生成路由配置，简化了路由管理流程。
    
*   **状态管理插件**：提供了基于 Vuex 或 Pina 的状态管理能力，适合管理复杂的全局状态。
    
*   **API 请求插件**：封装了 Axios，提供了防止重复请求、请求节流、错误处理等功能，简化了与后端 API 的交互。
    
*   **布局插件**：提供了简单的配置来实现布局，包括导航以及侧边栏等。
    
*   **国际化插件**：基于 Vue I18n，提供了国际化能力，方便开发多语言应用。
    
*   **数据字典插件**：提供了统一的枚举存取及丰富的函数来处理枚举，简化了数据管理。
    
*   **权限控制插件**：提供对页面资源的权限控制能力。
    
*   **SVG 图标插件**：SVG 文件自动注册为组件，方便在项目中使用 SVG 图标。
    
*   **单元测试插件**：基于 Jest，提供单元测试、覆盖测试能力。
    
*   **模型插件**：提供了简易的数据管理方案。
    
*   **微服务插件**：基于 qiankun，提供了微服务能力。
    
*   **样式处理插件**：支持 Sass 样式，增强了 CSS 的功能。
    
*   **代码编辑器插件**：提供了基于 Monaco Editor 的代码编辑器能力。
    
*   **原子化 CSS 插件**：基于 Windi CSS，提供原子化 CSS 能力。
    
*   **Pinia 状态管理插件**：提供了基于 Pinia 的状态管理能力。
    
*   **水印插件**：提供在页面上添加水印的功能。
    
*   **SWC 插件**：在 webpack 构建中使用 swc-loader，提升构建速度。
    

这些插件大多数都是可选的，并且可以按需引入，这样可以避免引入不必要的依赖，保持项目的轻量级。Fes.js 的插件生态不仅提高了开发效率，还保证了项目的可维护性和扩展性。

### 以布局插件 **@fesjs/plugin-layout** 为例：

配置参数是 **navigation**, 布局有五种类型 **side**、**mixin** 、**top** 、**left-right**、**top-left-right**， 默认是 side。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53T8wic9mjkuIjnFwOwJHSjEWGr0VNkoZJH9GGIgt109xypEiaKnolkpsg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53RribyNiaPYqM1MaySmRTVXiaxnYN064qUDWvVwAbvchlic9xdPyF0nbMGQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53kOj5qQAtHD49ib4bNK1WTwlhlGIibdOUuYNzuPyCLP4qnqEQr7W5ibE1g/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53cQ2ZcP20oz5MnQTicOicR5EEo2YlZqvcFh8iaUFkgvHiapib7lceQJARicXQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKrU2wic9JXdyAHZwJEMNlm53L0s2pluyGUO5icX86ichnydYqvk5Jh6n9wUOK2u1xoCwEumLR0hDDQZQ/640?wx_fmt=png&from=appmsg)

Fes.js 以其现代化的架构、强大的功能和活跃的社区支持，成为了 Vue 开发者的新宠。

如果你还在使用 `create-vue`，不妨试试 Fes.js，它可能会成为你构建下一个项目的最佳选择！

**相关链接**：

*   Fes.js GitHub: https://github.com/WeBankFinTech/fes.js
    
*   Fes.js 文档: https://webankfintech.github.io/fes.js/
    

开始你的 Fes.js 之旅，让我们一起在 Vue 的世界里，创造更多可能！🚀

写在最后
----

> `公众号`：`前端开发爱好者` 专注分享 `web` 前端相关`技术文章`、`视频教程`资源、热点资讯等，如果喜欢我的分享，给 🐟🐟 点一个`赞` 👍 或者 ➕`关注` 都是对我最大的支持。

```
点击上方“前端开发爱好者”，选择“设为星标”
第一时间关注技术干货！

```