> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tWVnMymvGVIWi_pdFxnQ9g)

前言
--

*   本文主要介绍如何使 Monorepo 与微前端结合使用，篇幅较长，请结合目录酌情阅读。
    
*   微前端 / Monorepo 方案都存在很多争议，争论无意义，选择适合自己团队的方案即可。
    
*   技术实战以 Micro App + pnpm 技术栈，讲解了从零搭建到项目部署的一个完整微前端项目。
    

了解 Monorepo 与微前端
----------------

当想使用一项新的技术时，大量的重构工作会让你不得不放弃使用新技术的想法时，这时选择**微前端**方案，可以大幅降低接入旧项目的成本，使用新技术开发新的功能或重构部分旧的功能模块。

Monorepo 可以协助微前端项目，因为它可以提供一个集中式的代码库和版本控制系统，使得多个微前端应用可以共享代码和资源，并且可以更容易地进行协作和集成。通过 Monorepo，可以更容易地管理共享的组件、库和工具，以及更方便地进行测试、构建和部署。

本文将通过 `pnpm monorepo` + `Micro-App` 为例，为大家提供一种架构思路。

阅读本章节可以对 Monorepo 与微前端有一个初步的认识，并通过技术选型对比，选择更加适合你的组合方案。如果你已经对它们有一定的了解，可以跳过本章节。

### 1. 解决哪些痛点？

*   代码管理复杂：在传统的多仓库项目中，每个仓库都有自己的版本控制和依赖管理，这样会导致代码管理复杂，难以维护。
    
*   部署困难：多仓库项目需要分别进行部署，这样容易出现版本不一致的问题，而且部署时需要耗费大量时间和人力。
    
*   模块重复：在多仓库项目中，不同的仓库可能会有相同的模块，这样会浪费时间和资源。
    
*   开发效率低下：在多仓库项目中，开发人员需要频繁地切换仓库，这样会降低开发效率。
    
*   维护成本高：多仓库项目中，每个仓库都需要单独维护，这样会导致维护成本高。
    

### 2. 实际应用场景

微前端我个人认为非常适合后台管理系统开发，尤其是在项目中往往拥有多个业务系统，每个系统都有自己的开发团队和技术栈，而这些系统之间需要进行数据共享和交互，微前端技术可以让这些系统更加灵活地集成在一起。

另外，在电商、金融等领域也可以应用微前端技术，例如电商平台通常会包含多个子系统，如商品管理、订单管理、支付管理等，这些子系统可以通过微前端技术进行集成，提高系统的整体性能和用户体验。

### 3.Monorepo 技术选型

介绍两种 monorepo 技术选型方向：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">类型</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">方案</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: center; min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">构建型</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">Turborepo<sup data-style="line-height: 0; font-weight: bold; color: rgb(221, 165, 45); margin: 2px; padding: 3px;">[1]</sup>、Rush<sup data-style="line-height: 0; font-weight: bold; color: rgb(221, 165, 45); margin: 2px; padding: 3px;">[2]</sup>、Nx<sup data-style="line-height: 0; font-weight: bold; color: rgb(221, 165, 45); margin: 2px; padding: 3px;">[3]</sup></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">主要解决构建效率低的问题，项目代码仓库越来越庞大，工作流（int、构建、单元测试、集成测试）也会越来越慢，专门针对这样的场景进行极致的性能优化。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">轻量型</td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">Lerna<sup>[4]</sup>、Yarn、pnpm<sup>[5]</sup></td><td data-style="border-color: rgb(204, 204, 204); text-align: center; min-width: 85px;">渐进式方案，初期建议选择，主要为了解决依赖管理、版本管理等问题。</td></tr></tbody></table>

不论是构建型还是轻量型，他们都可以搭配使用，例如 Nx + Lerna + pnpm, 他们可以各司其职。

本文更偏向业务开发方向，推荐使用更轻量得 pnpm 来实现 Monorepo 项目，如果有对版本控制有需求，可以配合 changesets[6] 实现。

### 4. 微前端技术选型

*   Single-spa[7]（不推荐）: 最早的微前端框架，这里提一下它的缺点，无通信机制，不支持 Javascript 沙箱，样式冲突，无法预加载。
    
*   Qiankun[8]: 基于 single-spa，弥补了上述不足，现在主流的微前端方案。
    
*   Micro App[9]: 基于 Web Component 原生组件进行渲染的微前端框架。
    
*   无界 [10]：基于 WebComponent 容器 + iframe 沙箱的微前端框架。
    
*   EMP[11]: 基于 Webpack5 Module Federation 搭建的微前端方案，共享模块粒度自由掌控，小到一个单独组件，大到一个完整应用。既实现了组件级别的复用，又实现了微服务的基本功能，总体来说功能很强大，但需要统一使用 webpack5。
    

我最终选择了 Micro App[12] 微前端框架，它提供了 JS 沙箱、样式隔离、元素隔离、预加载、资源地址补全、插件系统、数据通信等一系列的完善功能，最主要的是它的接入成本极低，容易上手。

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKmrZC5yQbyTNEJ1IDEBzkEGJ134Acshg024jy36fQ4pGv6Qf07AsYwdNlMFQ0QlB2fyRUVibYcOGlA/640?wx_fmt=other)image.png

无界没有深入使用，用法和 Micro App 比较像，都很容易入手，但是 js 沙箱和 css 沙箱实现方式有区别，这点还是根据需求选择。

技术实战
----

技术实战的方案选择 pnpm + Micro App 来实现 monorepo 微前端项目，下面我们来一步步实现。

### 使用 pnpm 实现 monorepo

首先了解一下 monorepo 的组织结构如下：

```
├── packages
|   ├── pkg1
|   |   ├── package.json
|   ├── pkg2
|   |   ├── package.json
├── package.json
├── pnpm-workspace.yaml
```

在 monorepo 中，所有的包都放在 packages 目录下，每个包都有自己的 package.json 文件，而根目录的 package.json 用来管理整个项目的依赖。

#### 安装 pnpm

pnpm 是一个非常轻量的 monorepo 管理工具，它的安装非常简单，只需要执行以下命令即可：

```
npm install -g pnpm
```

#### 初始化 monorepo 项目

在项目根目录下执行以下命令，初始化 monorepo 项目：

```
pnpm init
```

创建 pnpm-workspace.yaml 文件，用来配置 monorepo 项目：

```
packages: - 'packages/*'
```

创建 packages/ 目录，所有的微前端应用（基座和子应用）和共享模块都放在这个目录下。如果你的应用和共享模块都很多，也可以再加入 apps 目录区别管理应用和模块。

### 安装 Micro-App

Micro-App 微前端项目中，可以存在多个基座应用，每个基座应用可以包含多个子应用。建议在全局依赖中安装 Micro-App，这样所有的基座应用都可以使用它，可以保持基座应用的统一性。子应用无需安装 Micro-App，后续会介绍如何在子应用中使用 Micro-App。

在项目根目录下执行以下命令，安装 Micro-App：

```
pnpm add micro-app -w
```

> -w 表示安装到 workspace 根目录下。

### 搭建基座应用

这里我们使用 vite 来搭建基座应用，vite 是一款基于原生 ES Module 的轻量级前端构建工具，它的出现是为了解决 Webpack 构建速度慢的问题，它的构建速度非常快，可以达到秒级别的构建速度，非常适合用来搭建基座应用。

在项目根目录下执行以下命令，安装 vite：

```
pnpm add vite -D
```

这里我们使用 vite 创建一个 vue3 基座应用：

```
pnpm create vite --template vue packages/base
```

这里会提示输入项目名称，这里我们输入 base，会在 packages 目录下创建 base 目录，base 目录就是基座应用。

### 搭建子应用

通常来讲，微前端对技术不应有要求，但 Micro-App 子应用对 vite 的支持不是很好，所以我们选择使用 vue-cli 来搭建子应用。

> Micro-App 可以使用 vite 开发子应用，但需要一些配置，可以等待 1.0 版本 [13] 的更新。了解更多 [14]

这里我们使用 @vue/cli 初始化一个 vue2 子应用，详细的 vue-cli 使用可以参考 Vue CLI[15]。

当然你可以使用其他技术栈来搭建子应用，比如 React、Angular、Svelte 等，这里不做详细说明。

#### history 路由

需要注意的是子应用的路由配置，如果使用可以接受 hash 路由，可以略过。

创建路由文件 router/index.ts，配置路由：

```
import { createRouter, createWebHistory } from 'vue-router';import routes from './router';const router = createRouter({  //  __MICRO_APP_BASE_ROUTE__ 为micro-app传入的基础路由  history: createWebHistory(window.__MICRO_APP_BASE_ROUTE__ || process.env.BASE_URL),  routes,});
```

在 src 目录下创建 public-path.js， 并在 main.js 中引入：

```
if (window.__MICRO_APP_ENVIRONMENT__) { __webpack_public_path__ = window.__MICRO_APP_PUBLIC_PATH__}
```

#### 子应用跨域

如果是开发环境，可以在 webpack-dev-server 中设置 headers 支持跨域。

```
devServer: { headers: { 'Access-Control-Allow-Origin': '*', },},
```

如果是线上环境，可以通过配置 nginx 支持跨域，后文会有专门对 nginx 配置做详细讲解。

### 统一的应用配置文件

在 monorepo 中，我们需要统一的应用配置文件，这样可以方便我们管理所有的应用。根目录下创建 config.json 文件，用来配置应用：

这里我们可以列举几个关键的配置项：

*   name：应用名称
    
*   port：应用端口
    

例如：

```
"base": { "name": "基座", "packageName": "@package/core", "port": 4000}
```

其他属性可以根据需要自行添加。

### 路由配置

#### 区分环境构建不同的路由

开发环境路径为 localhost，而生产环境一般为域名地址，这里我们在基座应用创建 src/config.[ts|js] 文件，用来修改不同环境下的地址：

```
import packageConfig from '@/../../../config.json';const config = JSON.parse(JSON.stringify(packageConfig));interface DevConfig { [key: string]: string;}const devConfig: DevConfig = {};// 将 config 中的配置项合并到 devConfig 中Object.keys(config).forEach((key) => { if (key !== 'base') { devConfig[key] = `http://localhost:${config[key].port}`; }});// 线上环境地址if (process.env.NODE_ENV === 'production') { // 基座应用和子应用部署在同一个域名下，这里使用location.origin进行补全 Object.keys(devConfig).forEach((key) => { devConfig[key] = window.location.origin; });}export default devConfig;
```

#### 创建路由

在基座应用中创建 src/router/index.ts 文件，用来配置路由：

```
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';const routes: Array<RouteRecordRaw> = [];const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes,});export default router;
```

#### 基座根据配置文件自动生成子应用路由与页面

编写方法 tsx 组件，生成子应用页面组件：

```
import { defineComponent } from 'vue';
import packageConfig from '@/../../../config.json';
import devConfig from '@/config';
const config = JSON.parse(JSON.stringify(packageConfig));
export default function buildPage(name: string) {
 const url = `${devConfig[name]}/child/${name}`;
 return defineComponent({
 name,
 setup() {
 return () => <div>
 <micro-app
 name={name}
 url={url}
 baseroute={`/base/${name}`}
 disableScopecss={config[name].disableScopecss}
 ></micro-app>
 </div>;
 },
 });
}
```

编写 buildMicroRoutes，自动根据配置文件生成子应用路由：

```
import packageConfig from '@/../../../config.json';import buildPage from '@/views/buildPage';const config = JSON.parse(JSON.stringify(packageConfig));function buildMicroRoutes() {  const routes: Array<RouteRecordRaw> = [];  Object.keys(config).forEach((key: string) => {    if (key !== 'base') {      routes.push({        path: `/${key}/:page*`,        name: key.charAt(0).toUpperCase() + key.slice(1),        component: buildPage(key),        meta: { auth: config[key].auth },      });    }  });  return routes;}const routes: Array<RouteRecordRaw> = [  {    path: '/',    name: 'base',    redirect: '/core',    children: buildMicroRoutes(),  },];
```

> 以上代码仅作参考，可以根据实际情况进行修改。

这么做的好处是，我们只需要在 config.json 中配置好应用信息，就可以自动生成子应用路由，不需要手动去配置。如果你的应用很少，你可以参考 Micro-App 文档进行配置。

### 基座登录权限管理

通常我们的应用都需要登录权限管理，这里我们使用 vue-router[16] 的导航守卫来实现。

首先在根目录 config.json 中添加 auth 属性，用来配置是否需要登录权限，上文中已经在 meta 中增加了 auth 属性。

在 base/src 目录下创建 permission.ts 文件，用来配置登录权限：

```
import storage from 'store';import router from './router/index';import useUserStore from './stores/user';const loginRoutePath = '/login';const defaultRoutePath = '/home';router.beforeEach(async (to, from, next) => {  const token = storage.get('authKey');  // 进度条  NProgress.start();  // 验证当前路由所有的匹配中是否需要有登录验证的  if (to.matched.some(r => r.meta.auth)) {    // 是否存有token作为验证是否登录的条件    if (token && token !== 'undefined') {      if (to.path === loginRoutePath) {        next({ path: defaultRoutePath });      } else {        next();      }    } else {      // 没有登录的时候跳转到登录界面      // 携带上登录成功之后需要跳转的页面完整路径      next({        name: 'Login',        query: {          redirect: to.fullPath,        },      });      NProgress.done();    }  } else {    // 不需要身份校验 直接通过    next();  }});
```

这里写了一个简单的权限校验，仅保证用户是否登录，复杂情况根据你的实际情况自行处理。

### 应用之间跳转

通常我们会在导航栏做页面的跳转，这里分为两种情况：

*   如果跳转的页面不是已开启的子应用，那么基座应用跳转路由到指定地址。
    
*   如果跳转的页面，是已经开启的子应用的页面，那么通知子应用自行跳转。
    

```
import microApp, { getActiveApps } from '@micro-zoe/micro-app';if (!getActiveApps().includes(appName)) { router.push(`/${appName}${path}`);} else { microApp.setData(appName, { path });}
```

getActiveApps 是 Micro-App 提供的方法，获取正在运行的子应用，不包含已卸载和预加载的应用。

这里还需要注意的一点是，页面刷新后，导航栏可能需要重新激活当前的菜单，可以通过子应用向基座发送当前的路由信息，基座在导航组件使用 microApp.addDataListener 方法监听子应用的信息，从而实现默认激活菜单的功能。

子应用通过导航钩子去通知基座：

```
router.afterEach(({ path }) => { window.microApp.dispatch({ path });});
```

基座通过 microApp.addDataListener 监听：

```
microApp.addDataListener(appName, ({ path }) => { // ...});
```

### 基座与子应用通讯

Micro-App 提供了几种通讯方式，这里列举几个常用方法，详细请参考官方文档 [17]：

#### 子应用

*   window.microApp.getData(): 子应用获取基座下发的数据。
    
*   window.microApp.addDataListener(): 子应用监听基座下发的数据。
    
*   window.microApp.dispatch({type: '子应用发送的数据'}): 子应用向基座发送数据。
    

#### 基座

*   microApp.setData('子应用 name', {type: '数据'})：基座手动发送数据。
    
*   可以通过组件 data 属性传递数据，请参考 Micro-App 提供的 vue/react 组件。
    
*   microApp.getData(appName)：直接获取子应用发送的数据。
    
*   microApp.addDataListener()：监听子应用发送的数据。
    
*   通过组件 @datachange 属性监听子应用发送的数据。
    

#### 全局数据

*   microApp.getGlobalData()：返回全局数据。
    
*   microApp.addGlobalDataListener()：监听全局数据变化。
    

#### 本地存储

通过本地存储做全局数据交互，因为在统一的域名下，本地存储的数据各个应用都可以获取到，这里推荐安装 store 库操作本地存储。

同时，需要注意本地存储的安全性，避免敏感数据被泄露。可以对存储的数据进行加密处理，或者只存储必要的信息，避免存储过多敏感信息。另外，还需要注意本地存储的容量限制，避免存储过多数据导致应用性能下降。

#### 创建 bus 统一管理通讯

推荐在基座应用中创建 bus.js 统一管理与子应用的通讯，通过遍历所有子应用挂载 addDataListener 方法，对 listener 不同的数据做不同的操作，例如：

*   统一的消息提醒，通常是请求报错时触发。
    
*   登录信息过期、退出登录等操作。
    
*   设置页面标题、tabs 切换等操作。
    

具体根据项目需求增加。

由于子应用可以发送任何信息给基座，建议使用 ts 对 listener data 做约束可以更好的管理。

### 搭建共享通用功能模块

使用 Monorepo 可以方便地管理多个应用或模块之间的依赖关系，提高代码重用性和可维护性。这里我们可以创建一个 share 模块，它可以提供给各个应用一些通用的功能。

这里以封装 axios 为例，讲解如何搭建通用模块。

#### 封装 request

每个应用都会与后端发生请求，那么一个通用的 request 方法就尤为重要，否则随着项目的逐渐壮大，后端在发生变化时，我们前端的维护成本将逐渐变高。

首先整理一下需求：

*   标准的 axios 封装，这种文章很多，每个人可能都不同，这里不做更多的赘述。
    
*   使用 ts 开发，微前端项目各个应用可能技术栈不同，使用 ts 开发兼容性会更好。
    
*   定义后台的各种返回类型，减少类型定义的开发工作量。
    
*   请求异常时通常会消息提醒，但每个子应用使用的组件库可能不同，这里我们可以通知基座触发提醒。
    

这里贴出一些代码片段，可供参考。

定义后端常用的返回类型，例如列表：

```
export interface Response<T> { errors: Errors; response: ResponseResult<T>; response_code: number; success: boolean;}export interface ListResult<T> { countId?: string; current: number; hitCount: boolean; maxLimit?: string; optimizeCountSql: boolean; orders: []; pages: number; records: T[]; searchCount: boolean; size: number; total: number;}
```

这样我们可以在定义接口时直接引用这些类型：

```
import { request, Response, ListResult } from '@package/share';interface Result { // ...}export function getChargingAnalysis() { return request<Response<ListResult<Result>>>({ url: '...', method: 'post', });}
```

#### 应用将 share 作为依赖

可以在应用的 package.json 中增加依赖：

```
"dependencies": { "@package/share": "workspace:*"},
```

#### 使用 rollup 打包

使用什么工具打包都可以，根据喜好自行挑选工具。这里贴出 rollup 的简单配置：

```
import typescript from 'rollup-plugin-typescript2';import autoprefixer from 'autoprefixer';import pkg from './package.json';export default {  input: 'src/index.ts', // 入口文件  output: [    {      file: pkg.main,      format: 'esm',      sourcemap: false,    },  ],  plugins: [    typescript({      tsconfigOverride: {        compilerOptions: { declaration: true, module: 'ESNext' },      },      check: false,    }),  ],};
```

> 如果要开发支持 vue2/vue3 的组件，推荐使用 vue-demi 开发。

### 原子化 CSS

原子化 CSS 提供了一系列的样式类，可以直接应用到 HTML 元素上，减少了手写 CSS 的时间和工作量。它具有很强的可定制性，可以根据自己的需求自定义样式，而不必担心样式冲突或需要重复编写 CSS 代码。

常用的原子化 CSS 框架有：

*   Tailwind.css[18]
    
*   Uno.css[19]
    
*   还有很多，甚至 BootStrap 我认为也算是，只不过它的颗粒度比较大。
    

#### 样式隔离

微前端中的样式隔离是为了防止不同的子应用之间的样式冲突，保证各个子应用之间的样式独立性和隔离性。如果不做样式隔离，不同子应用使用的样式可能会相互影响，导致样式错乱或者不一致的问题。此外，样式隔离也可以提高项目的可维护性和可扩展性，方便不同团队或者开发者独立开发和维护各自的子应用。因此，微前端中的样式隔离是非常必要的。

虽然样式隔离起到了很好的作用，但基座应用的样式依然会影响到子应用，产生某些不稳定的因素，还是建议关闭样式隔离，使用原子化 CSS 框架可以极大程度的上解决这种问题。

### 全局环境变量配置

环境变量是开发时常用的功能，但是在 Monorepo 项目中，每个 package 都存在环境变量，这使得在维护环境变量时变得耗时且不好维护。

接下来我们要做到在根目录维护环境变量。

不同的构建工具配置方式不同，这里说一下常见的 vite 和 webpack(@vue/cli) 项目：

#### Vite

Vite 配置环境变量文件非常方便，因为它提供了 envDir 属性:

```
export default defineConfig({ envDir: './../../', envPrefix: 'VUE_APP',)};
```

*   envDir[20]: 用于加载 `.env` 文件的目录。可以是一个绝对路径，也可以是相对于项目根的路径。
    
*   envPrefix[21]: 以 `envPrefix` 开头的环境变量会通过 import.meta.env 暴露在你的客户端源码中。
    

#### Webpack

Webpack 没有提供选择加载 env 路径的功能，默认只能加载同级目录下的文件，但我们使用 dotenv 解决这个问题：

首先安装 dotenv[22]。

然后编写一个 setGlobalEnv 方法：

```
const dotenv = require('dotenv');const path = require('path');module.exports = function setGlobalEnv() { let envfile = '.env'; if (process.env.NODE_ENV) { envfile += `.${process.env.NODE_ENV}`; } dotenv.config({ path: path.resolve('../../', envfile), });};
```

在 webpack 配置文件或 vue.config.js 中直接调用即可。

> 这里存在一个问题还没有解决，那就是 env.local 暂时无法使用，后续有方法解决会补充。

### 统一代码规范

在使用 Monorepo 进行开发时，为了方便团队协作和代码共享，需要制定统一的代码规范。使用工具如 ESLint、Prettier 等来自动化代码风格的检查和格式化。

#### ESLint

在根目录下创建 eslint 配置文件，建议使用 .eslintrc.js，可以更方便的匹配不同项目。这里需要注意的是，在不同的项目中，ESLint 所使用的拓展插件也不同，这时可以通过 overrides 来针对不同路径的下的项目进行覆盖：

```
const path = require('path');module.exports = {  overrides: [    {      files: ['./packages/vue2/**/*.{js,vue}'],      extends: ['plugin:vue/essential'],    },    {      files: ['./packages/vue3_ts/src/**/*.{ts,tsx,vue}'],      extends: ['plugin:vue/vue3-essential', '@vue/typescript/recommended'],    },  ],};
```

上面的例子展示了对应 vue2 和 vue3 + ts 的不同配置。

#### .eslintignore

由于 node_modules 存在于根目录和 packages 中，所以应创建 .eslintignore 忽略校验：

```
node_modules/*
./node_modules/**
**/node_modules/**
```

### Mock

前端 mock 的作用是在开发过程中模拟数据和接口，使得前端开发人员可以在没有后端支持的情况下进行开发和调试。通过 mock 数据，前端开发人员可以快速构建出页面和功能，并且可以在没有后端接口的情况下进行联调和测试。同时，mock 数据也可以用于模拟异常情况，以便在开发过程中更好地处理错误和异常情况。最终，mock 数据可以提高开发效率，减少开发成本，并且可以更好地保证产品质量。

这里提供一种基于 msw[23] + faker[24] 实现 mock 接口的方式，这种方式可以丝滑的从 mock 和真实接口进行切换，faker 的辅助提供了更加符合实际的模拟数据。

#### 创建 mock 环境

首先，我们需要安装 `msw` 和 `faker`：

`pnpm add -w msw faker -D`

接下来，我们可以在根目录创建一个 `mocks` 目录，用于存放我们的 mock 接口代码。

在 `mocks` 目录下，创建不同应用的文件夹去创建 mock 请求，这样更加方便管理，这里举一个例子：

```
// /mocks/task/history.jsimport { rest } from 'msw';import { faker } from '@faker-js/faker/locale/zh_CN';const baseUrl = process.env.VUE_APP_API_BASE_URL;export default [  rest.post(`${baseUrl}/business/history/page`, (req, res, ctx) =>    res(      ctx.delay(),      ctx.status(200),      ctx.json({        errors: null,        response: {          code: 200,          message: '检索成功。',          result: {            current: req.body.pageNo,            size: req.body.pageSize,            total: faker.datatype.number({ min: 100, max: 500 }),            records: new Array(req.body.pageSize).fill(1).map(() => ({              agencyCode: faker.random.word(),              createTime: faker.date.past(),              createUser: faker.datatype.number(),              dataHash: faker.random.word(),              id: faker.datatype.uuid(),              updateTime: faker.date.past(),              updateUser: faker.datatype.number(),              vin: faker.vehicle.vin(),            })),          },        },        response_code: 2000,        success: true,      }),    ),  ),];
```

在 `mocks` 目录下，我们可以创建一个 `handlers.js` 文件，用于整理 handlers：

```
import taskHistory from './task/history';export const handlers = [...taskHistory];
```

在 `mocks` 目录下，我们可以创建一个 `browser.js` 文件，用于启动浏览器环境 mock：

```
import { setupWorker } from 'msw';import { handlers } from './handlers';export const worker = setupWorker(...handlers);
```

随后需要执行命令：

`npx msw init ./packages/base/public --save`

这样会在基座的 public 中创建 mockServiceWorker.js 文件，npx msw init 的作用是初始化 Mock Service Worker 库，它会在项目根目录下创建一个 `msw` 目录，并在该目录下创建一个 `serviceWorker.js` 文件，用于配置和启动 Mock Service Worker。我们把它放在基座应用下，是因为子应用也可以直接访问到 mock 接口。

#### 在应用中使用

建议在 config.json 中增加 mock 开关字段，这样可以更方便的开启或关闭 mock。

在应用的 main.js 文件中加入下面的代码，即可使用:

```
import config from '../../../config.json';const microAppName = packageJson.name.split('/')[1];const isMock = config[microAppName].mock;if (process.env.NODE_ENV === 'development' && isMock) { const { worker } = require('../../../mocks/browser'); worker.start();}
```

### 搭建技术文档

项目技术文档可以帮助项目团队成员之间更好地协作，减少沟通成本。新成员可以通过文档了解项目的背景和目的，以及项目的技术细节和工作流程，从而更快地融入团队并开始工作。随着项目越来越庞大，一个完善的技术文档，可以为后续的开发工作提供极大的便利。

这里推荐使用 vuepress[25] 搭建技术文档，你只要会 markdown 语法和简单的配置即可快速搭建。

你也可以阅读我以前写过的文章辅助你搭建《VuePress + Travis CI + Github Pages 全自动上线文档》[26]。

接入旧项目
-----

将旧项目嵌入到微前端应用的过程可能会因项目不同而有所不同，但以下是一些一般步骤：

*   将旧项目拷贝到 packages 目录下，在 config.json 中增加此应用的配置。
    
*   查看是否有公共依赖相同的依赖，可以考虑升级或降级，根据实际情况考虑，然后使用 pnpm 重新安装依赖。
    
*   旧项目通常也存在导航栏、登录等功能组件，这与基座的功能冲突，删除这些功能，仅保留每个页面的内容即可。
    
*   补充上下文提到过子应用的配置。
    
*   登录等全局信息在通讯方式中有详细讲解，补全删除登录功能后的数据交互。
    

开发与构建
-----

这一章节我们详细了解一下如何更方便的调试和构建微前端项目。

### 优化 npm script

当已经有多个应用时，我们通过 npm script 去运行或打包时，需要编辑多条 npm script 命令，这可能会变得很麻烦和复杂。为了解决这个问题，这里推荐两种做法:

#### npm-run-all

安装 npm-run-all[27]， 它可以让你同时运行多个 npm script。例如，如果你需要同时运行 "build:base" 和 "build:core"，你可以使用以下命令：

```
"build": "npm-run-all build:*","build:base": "cd packages/base && npm run build","build:core": "cd packages/core && npm run build"
```

#### 编写任务脚本（推荐）

使用 npm-run-all 的方式比较简单，但也存在一个问题，当我们新增应用时，还需要配置 npm script，并且应用越来越的情况下，package.json 中 npm script 变得巨大且难以维护。

前文提到过，我们所有的应用都在 config.json 中维护，那么我们创建 node 脚本来启动或构建应用会更加方便：

我们在根目录创建 scripts 文件夹，创建 dev.js 和 build.js。

**dev.js**

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKmrZC5yQbyTNEJ1IDEBzkEGibYsSoOTcPicBxyo0DhT20CVmEgiaTPSAACdseibuHcrlBIPwekHkjaTibA/640?wx_fmt=other)image.png

首先会判断基座是否启动，如果没启动，运行会直接先启动基座，因为它是必须启动的。然后出现选择列表，选择要启动的子应用即可，这里还做了对已启动的应用做了标记，不可选择。

JS

复制代码

```
// scripts/dev.jsconst inquirer = require('inquirer');const execa = require('execa');const detect = require('detect-port');const config = require('../config.json');// 已占用端口列表const occupiedList = [];const checkPorts = Object.keys(config).map(  key =>    new Promise(resolve => {      detect(config[key].port).then(port => {        resolve({          package: key,          isOccupied: port !== config[key].port,        });      });    }),);// 运行选择命令function runInquirerCommand() {  inquirer    .prompt([      {        name: 'devPackage',        type: 'list',        message: '请选择要启动的子应用',        choices: Object.keys(config)          .filter(item => item !== 'base')          .map(key => {            const { name, packageName, port } = config[key];            return {              name: `${name}(${packageName}:${port})`,              value: key,              disabled: occupiedList.find(item => item.package === key).isOccupied                ? '已启动'                : false,            };          }),      },    ])    .then(async answers => {      execa('npm', ['run', 'dev'], {        cwd: `./packages/${answers.devPackage}`,        stdio: 'inherit',      });    });}Promise.all(checkPorts).then(ports => {  occupiedList.push(...ports);  if (ports[0].isOccupied) {    runInquirerCommand();  } else {    execa('npm', ['run', 'dev'], {      cwd: './packages/base',      stdio: 'inherit',    });  }});
```

**build.js**

![](https://mmbiz.qpic.cn/mmbiz_jpg/bwG40XYiaOKmrZC5yQbyTNEJ1IDEBzkEG76G7xAlChX69yf7YANYfkVIRMibib71l0xwM5keajjHx4EHQoROAQVeA/640?wx_fmt=other)image.png

微前端具备独立部署的能力，运行指令后，可以多选要打包的应用，随后会按顺序逐个打包。

```
// scripts/build.jsconst inquirer = require('inquirer');const execa = require('execa');const config = require('../config.json');inquirer  .prompt([    {      name: 'buildPackage',      type: 'checkbox',      message: '请选择要打包的应用',      choices: Object.keys(config).map(key => {        const { name, packageName } = config[key];        return {          name: `${name}(${packageName})`,          value: key,        };      }),    },  ])  .then(async answers => {    console.time('打包完成，耗时');    Promise.all(      answers.buildPackage.map(        item =>          new Promise(resolve => {            execa('npm', ['run', 'build'], {              cwd: `./packages/${item}`,              stdio: 'inherit',            }).then(() => {              resolve();            });          }),      ),    ).then(() => {      console.timeEnd('打包完成，耗时');    });  });
```

*   inquirer[28] 用于在命令行中与用户交互，获取用户输入的信息，然后根据输入的信息执行不同的操作。
    
*   detect-port[29] 的作用是检测端口是否被占用，也可以理解为应用是否启动。
    
*   execa[30] 用于在子进程中运行外部命令，它提供了一个简单的 API，用于执行命令、传递参数、读取输出和处理错误。
    

最后在 package.json 中配置 npm script：

```
"dev": "node scripts/dev.js","build": "node scripts/build.js",
```

#### 构建目录

为了方便部署，我们将打包后的路径改为根目录的 dist 目录下，然后根据基座或子应用放置到不同的文件夹下，最后的结构应该为：

erlang

复制代码

```
├── dist/
|   ├── base/
|   |   ├── ...
|   ├── child/
|   |   ├── child-app1/
|   |   ├── child-app2/
|   |   ├── ...
```

webpack 可以修改 outputDir 参数，vite 可以修改 build.outDir 即可。

### Nginx 配置

微前端在部署时会产生多个地址，可以通过 nginx 的反向代理，把子项目的地址代理到主项目地址下。

这里贴一下 nginx 配置：

```
server { listen       80; server_name  localhost; gzip  on;  gzip_min_length 1k; gzip_comp_level 5;  gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css; gzip_disable "MSIE [1-6]\."; gzip_vary on; location / {   root /usr/share/nginx/html/base;   index index.php index.html index.htm;   # add_header Cache-Control;   add_header Access-Control-Allow-Origin *;   if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){     add_header Cache-Control max-age=7776000;     add_header Access-Control-Allow-Origin *;   } } location /base {   root /usr/share/nginx/html;   add_header Access-Control-Allow-Origin *;   if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){     add_header Cache-Control max-age=7776000;     add_header Access-Control-Allow-Origin *;   }   try_files $uri $uri/ /base/index.html; } location ^~ /child {   root /usr/share/nginx/html;   add_header Access-Control-Allow-Origin *;   if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){     add_header Cache-Control max-age=7776000;     add_header Access-Control-Allow-Origin *;   }   try_files $uri $uri/ index.html; }}
```

需要注意以下几点：

*   `^~ /child` 匹配所有 child 路径下的子应用，这样可以避免增加子应用时，还需在服务器进行配置。
    
*   本地开发时需要给 dev 服务器设置跨域，线上生产环境需要给 nginx 设置跨域。
    
*   开启 gzip，这样可以使文件加载速度巨大提升，前提是你打包时要做 gzip 压缩。
    

### 本机 Docker + Nginx 测试环境搭建

在本地测试环境中，我们可以使用 Docker 和 Nginx 来模拟微前端的生产环境。Docker 可以帮助我们轻松地创建和管理容器，而 Nginx 则可以帮助我们将多个应用组合在一起，使它们可以相互通信。

这一步可以大大的减少预生产或生成环境存在未知的 bug（减少扯皮）。

#### Docker

首先需要安装 Docker[31]，然后在根目录创建 Dockerfile[32] 文件：

```
FROM nginx:latest
COPY dist /usr/share/nginx/html
COPY nginx.conf /usr/share/nginx/conf/nginx.conf
EXPOSE 80
CMD ["nginx", "-c", "/usr/share/nginx/conf/nginx.conf", "-g", "daemon off;"]
```

这个 Dockerfile 使用最新版本的 nginx 作为基础镜像，然后将本地的 dist 目录复制到 nginx 的默认静态文件目录 /usr/share/nginx/html 中，再将本地的 nginx.conf 文件复制到 nginx 的默认配置文件目录 /usr/share/nginx/conf/ 中。最后暴露 80 端口并启动 nginx 服务。

`daemon off` 是指关闭 nginx 的守护进程模式，即让 nginx 在前台运行而不是在后台作为守护进程运行。这通常用于测试或调试时，以便更容易地查看 nginx 的日志输出和调试信息。但在实际生产环境中，建议将 nginx 作为守护进程运行，以确保系统的稳定性和安全性。

#### Docker Compose

为了方便管理容器，可以使用 Docker Compose[33]，在根目录下创建 docker-compose.yaml:

```
services:
 web:
 build:
 context: .
 dockerfile: Dockerfile
 image: web
 container_name: web
 ports:
 - 80:80
```

这个 docker-compose.yaml 文件定义了一个服务 web，它使用当前目录下的 Dockerfile 构建镜像，并将其命名为 web。容器的名称也是 web，将本地的 80 端口映射到容器的 80 端口。

然后可以使用以下命令启动服务：

`docker-compose up -d`

这会在后台启动并运行服务。如果需要停止服务，可以使用以下命令：

`docker-compose down`

这会停止并删除服务的容器。如果需要重新构建镜像并启动服务，可以使用以下命令：

`docker-compose up -d --build`

这会重新构建镜像并启动服务。

#### 插件

如果你使用 vscode 推荐安装 Docker[34] 插件，该插件可以方便地管理 Docker 容器、镜像和服务。它提供了一个 Docker 栏，可以查看容器和镜像的状态，并提供了一组命令，可以方便地启动、停止、删除和重启容器。此外，该插件还提供了一个 Docker Compose 栏，可以管理 Docker Compose 项目和服务。安装 Docker 插件后，可以更轻松地进行 Docker 开发和测试。

### 生产环境部署

如果你已经在本机测试环境下正常启动，那么生产环境的配置几乎一致。

总结
--

本文主要介绍了微前端和 Monorepo 的架构设计，探讨了它们之间如何搭配，并介绍了 Micro App + pnpm 的使用案例，最后，讲解了如何使用 Docker + nginx 进行本机测试环境，完整的走完了一个微前端项目的全部流程。

我个人比较看好微前端未来的发展，下面贴一下 chatGPT 对未来发展的看法 (屁话)：

> 随着微服务和前端技术的快速发展，monorepo 和微前端已经成为了前端开发的热门话题。它们可以帮助我们更好地管理代码和提高开发效率，但未来的发展方向和趋势是什么呢？
> 
> *   更加智能化的工具支持：未来，我们将看到更加智能化的 monorepo 和微前端工具，这些工具将能够自动化处理更多的代码管理和构建任务，从而提高开发效率和质量。
>     
> *   更加模块化的架构：随着前端应用的不断增长，更加模块化的架构将变得越来越重要。未来的 monorepo 和微前端架构将更加注重模块化设计，以便更容易地管理和扩展应用程序。
>     
> *   更加集成化的开发流程：未来，我们将看到更加集成化的开发流程，这将涉及到更多的自动化测试、CI/CD 和部署任务。这些流程将更加紧密地集成到 monorepo 和微前端架构中，以提高开发效率和质量。
>     
> *   更加普及的微前端架构：随着微前端的不断发展和成熟，我们将看到越来越多的应用程序采用微前端架构。这将有助于更好地管理代码和提高应用程序的可维护性和可扩展性。
>     
> *   更加开放的生态系统：未来，我们将看到更加开放的 monorepo 和微前端生态系统，这将涉及到更多的开源工具和框架。这将有助于推动 monorepo 和微前端的发展，并促进更加广泛的采用。
>     
> 
> 总之，未来的 monorepo 和微前端将更加注重智能化、模块化、集成化、普及化和开放化，这将有助于更好地管理代码和提高开发效率和质量。

总的来说，微前端 和 Monorepo 的搭配是一种值得尝试的架构设计，可以帮助团队更好地管理和开发前端应用。

参考资料
----

*   Micro App 官方文档 [35]
    
*   pnpm 官方文档 [36]
    
*   灵感 React Microfrontends and Monorepos: A Perfect Match[37] （Nx 团队大佬的文章）
    

### 参考资料

[1]

https://turbo.build/

[2]

https://rushstack.io/

[3]

https://nx.dev/

[4]

https://lerna.js.org/

[5]

https://pnpm.io/zh/workspaces

[6]

https://github.com/changesets/changesets

[7]

https://github.com/single-spa/single-spa

[8]

https://github.com/umijs/qiankun

[9]

https://micro-zoe.github.io/Micro-App/

[10]

https://wujie-micro.github.io/doc/

[11]

https://emp2.netlify.app/

[12]

https://micro-zoe.github.io/Micro-App/

[13]

https://micro-zoe.com/docs/1.x/#/zh-cn/start

[14]

https://micro-zoe.github.io/micro-app/docs.html#/zh-cn/framework/vite

[15]

https://cli.vuejs.org/zh/

[16]

https://next.router.vuejs.org/zh/

[17]

https://micro-zoe.github.io/micro-app/docs.html#/zh-cn/data

[18]

https://tailwindcss.com/

[19]

https://unocss.dev/

[20]

https://cn.vitejs.dev/config/shared-options.html#envdir

[21]

https://cn.vitejs.dev/config/shared-options.html#envprefix

[22]

https://www.npmjs.com/package/dotenv

[23]

https://mswjs.io/

[24]

https://fakerjs.dev/

[25]

https://v2.vuepress.vuejs.org/

[26]

https://juejin.cn/post/6844903869558816781

[27]

https://github.com/mysticatea/npm-run-all

[28]

https://www.npmjs.com/package/inquirer

[29]

https://www.npmjs.com/package/detect-port

[30]

https://www.npmjs.com/package/execa

[31]

https://www.docker.com/

[32]

https://docs.docker.com/engine/reference/builder/

[33]

https://docs.docker.com/compose/

[34]

https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker

[35]

https://micro-zoe.github.io/micro-app/docs.html#/

[36]

https://pnpm.io/zh/installation

[37]

https://blog.nrwl.io/monorepos-and-react-microfrontends-a-perfect-match-d49dca64489a

关于本文  

来源：codexu

https://juejin.cn/post/7225800207329230905

最后
--

欢迎关注「三分钟学前端」

号内回复：  

「网络」，自动获取三分钟学前端网络篇小书（90 + 页）

「JS」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「算法」，自动获取 github 2.9k+ 的前端算法小书

「面试」，自动获取 github 23.2k+ 的前端面试小书

「简历」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的支持