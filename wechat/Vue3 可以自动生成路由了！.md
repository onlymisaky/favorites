> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TbI8Ml1t0St6k3zW2HCaHg)

前言
--

在 `Vue3` 开发中，路由管理一直是项目结构中的重要组成部分。

传统的`路由配置方式`需要手动编写每个路由的配置信息，这在页面众多的大型项目中显得尤为繁琐。

今天，我们将介绍一个能够自动化生成 `Vue3` 路由的插件 —— `unplugin-vue-router`。它将大幅提升你的开发效率！

`unplugin-vue-router` 简介
------------------------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKqSOvIiaicpROVFW8IS2Rv10ZZ7QBRGcYdhPibgooswgnwCMPISEjzYpKZfDXic75rd4P2uWp7vIDiadqQ/640?wx_fmt=png&from=appmsg)

`unplugin-vue-router` 是一个构建时的插件，它能够基于你的 `Vue` 组件文件自动生成路由配置。

这意味着你不再需要手动编写冗长的`路由配置`代码，只需按照`约定`创建组件文件，路由就会自动配置好。

安装与配置
-----

##### 安装插件

首先，在你的 `Vue3` 项目中安装 `unplugin-vue-router`：

```
npm install -D unplugin-vue-router
```

##### 配置 Vite

如果你使用的是 `Vite` 作为构建工具，需要在 `vite.config.ts` 中进行配置：

```
import { defineConfig } from 'vite';import vue from '@vitejs/plugin-vue';import VueRouter from 'unplugin-vue-router/vite';export default defineConfig({  plugins: [    VueRouter({ /* options */ }),    vue(),    // ...其他插件  ],  // ...其他配置});
```

注意，`VueRouter` 插件需要在 `vue()` 插件之前引入。

##### 配置路由

接下来，在 `src/router/index.ts` 中，使用 `unplugin-vue-router` 提供的 `routes` 来创建路由器：

```
import { createRouter, createWebHistory } from 'vue-router';import { routes } from 'vue-router/auto-routes';const router = createRouter({  history: createWebHistory(),  routes: routes, // 使用自动生成的路由});export default router;
```

自动路由规则
------

`unplugin-vue-router` 会根据你 `src/pages` 目录下的组件文件自动创建路由。例如：

*   `src/pages/index.vue` 会自动对应到根路由 `/`。
    
*   `src/pages/detail.vue` 会自动创建路由 `/detail`。
    
*   对于动态路由，如 `src/pages/detail/[id].vue`，会自动生成 `/detail/:id` 路由。
    
*   此外，`[...404].vue` 文件会被用作 `404` 错误页面的路由。
    
*   更多配置，请参考 unplugin-vue-router 官方文档：`https://uvr.esm.is/guide/file-based-routing.html`
    

自定义路由
-----

虽然 `unplugin-vue-router` 提供了强大的自动路由功能，但在某些情况下你可能需要添加自定义路由。你可以通过扩展自动生成的 `routes` 数组来实现：

```
// src/router/index.tsimport { createRouter, createWebHistory } from 'vue-router';import { routes } from 'vue-router/auto-routes';const router = createRouter({  history: createWebHistory(),  routes: [    ...routes,    {      path: '/custom', // 自定义路由      component: () => import('@/views/custom.vue'),    },  ],});export default router;
```

##### 实现原理解析

`unplugin-vue-router` 是一个基于 `unplugin` 库开发的插件，它能够与 Vite、Webpack、Rollup 等多种构建工具无缝集成。该插件通过分析项目中的 Vue 文件，自动生成路由配置，无需开发者手动编写路由文件。

`unplugin-vue-router` 的工作原理是在构建时扫描指定的目录（默认为 `src/pages`），根据文件名和目录结构生成路由配置。它利用了 Vue Router 的新特性，并结合了 TypeScript 来提供类型安全和自动完成。

##### 插件配置与初始化

在项目的配置文件中，例如 Vite 的 `vite.config.js`，我们通过配置 `unplugin-vue-router` 插件，指定路由文件的生成目录和类型声明文件的位置：

```
// vite.config.jsimport { defineConfig } from 'vite';import VueRouter from 'unplugin-vue-router/vite';export default defineConfig({  plugins: [    VueRouter({      routesFolder: 'src/pages', // 指定路由文件所在的目录      dts: 'types/typed-router.d.ts', // 指定类型声明文件的输出路径    }),    // ...其他插件  ],  // ...其他配置});
```

##### 构建过程的钩子函数

`unplugin-vue-router` 插件通过构建工具提供的钩子函数来实现自动化路由的生成。以下是构建过程中的关键步骤和对应的图示：

1.  **resolveId 钩子**: 插件拦截对 `vue-router/auto` 的导入请求，将其转换为虚拟模块标识符。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKqSOvIiaicpROVFW8IS2Rv10ZJOuSAaHdicwSFNYWA75OWYAo2a93yiav6CnGh7RH4OxKZiag5ibUwicm1Jw/640?wx_fmt=png&from=appmsg)

2.  **load 钩子**: 当构建工具请求加载虚拟模块时，插件根据配置生成实际的路由配置代码。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKqSOvIiaicpROVFW8IS2Rv10ZAdpVpUJqQXTznuW2KShK8xUbAZnnxfguHmVb5BsPibiclzonE871TFTw/640?wx_fmt=png&from=appmsg)

##### 动态生成 Vue Router 代理

`unplugin-vue-router` 的核心之一是动态生成 Vue Router 的代理模块。该模块会导出 `vue-router` 的所有 API，并扩展 `createRouter` 方法以包含自动生成的路由配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKqSOvIiaicpROVFW8IS2Rv10Zxt5vRsXabty12KRWldpTPUFL0hruIYgBHnX5XPicLt1GMj6f3o5AVHQ/640?wx_fmt=png&from=appmsg)

##### VSCode 代码提示支持

为了支持 VSCode 的代码提示功能，`unplugin-vue-router` 会在构建时生成一个 TypeScript 声明文件（例如 `types/typed-router.d.ts`），该文件声明了 `vue-router/auto` 模块的类型信息。通过在 `tsconfig.json` 中包含此文件，VSCode 能够识别自动生成的路由，并提供相应的代码提示。

总结
--

`unplugin-vue-router` 插件通过构建时的钩子函数，动态生成 Vue Router 的代理模块和路由配置，简化了路由管理的工作。

同时，通过生成 TypeScript 声明文件，为开发者提供了良好的代码提示和类型检查支持。这种自动化的路由生成方案，不仅提高了开发效率，也减少了人为错误的可能性，是 Vue 3 开发者值得尝试的工具。