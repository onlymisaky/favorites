> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/iqo4UtNWKYa1B-ND0cn6tA)

本文由体验技术团队 TinyVue 组件库成员陈家梅同学分享，带你手把手实现 TinyVue 组件库适配微前端~

**一、前言**

以下是我对微前端的一些粗浅理解，对微前端有一定了解的话可以略过，直接进入第二部分。

**1、微前端是什么？**

我们首先来点熟悉的东西，以我们最常见的页面为例，看下图：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjp5q8n606fq2js4AGAd4fWWSvGDZa5vs26ZQLOCxny8yjEJr7Ysy2BdQ/640?wx_fmt=png&from=appmsg)

左侧为子应用路由切换，通过点击左侧完成右侧页面子应用的切换，这就是一个最简单的微前端应用架构了。

作为一名资深打工人，为了便于理解，我把微前端类比成一家企业，当它发展到了一定规模时，效率会变得低下，运行迟缓。此时为了便于管理，提高能效，加强部门之间的协作；一般会分化出几家子公司 + 一个总公司（或总部）。

其特点是：每家子公司都可以独立运作，也可以互相协作，但都听从总部的统一管理，至此，我们就有了微前端的基本概念。

微前端借鉴了后端比较成熟的微服务概念：

*   形式上：通过将各个子应用和一主应用统一组织起来，构成一个集成应用；
    
*   独立性：这些子应用可以单独部署，单独运行，单独扩展，相互之间状态隔离；技术栈独立，相对不受限；
    
*   通信上：可以相互通信。子应用可以共享主应用数据。也可共享兄弟应用数据。
    

**2、为什么需要微前端，它有什么优点？**

一个优秀的微前端框架应当有如下优点：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpMdmOajLwqH3bF22qA2g3qdsSkt5bOib2FHy32aIOOwb1JOwflXzxXSA/640?wx_fmt=png&from=appmsg)

①：应用之间互相独立：包括了 js 沙箱、css 隔离等；

②：支持父与子，子与子应用之间的通讯；

③：性能方面支持预加载和按需加载机制；

④：多个公共依赖的共享处理。

一个优秀的前端工程像一家优秀的企业一样，当项目的业务达到了一定的规模，高度集成为一个巨无霸，为了降低运行消耗、维护的时间和人力成本，提升用户的终端体验；拆分 + 整合就势在必行了。

想象一个场景：（作为一名刚入职公司的前端工程师，不管你是初级还是资深，面对使用不同技术栈、相互之间业务耦合性大的多个项目；或者是一个高度集成、体量庞大，运行缓慢的巨石项目，你要怎么处理才能降低项目维护成本，提升性能，从而提升效率，提升用户体验？

第一种情况：项目多且杂我就遇到过，工程师们加班加点的修 bug；但愣是换了一批又一批人，还是没有改善现状，进入了一个恶性循环）。

所以我们急需一种能整合所有项目，并且单个项目又能独立运作的技术方案。

此时有条件的研发团队，一般都会选择微前端，接入同一套主系统，既能独立运行又可相互通信，兼顾了流畅体验和信息共享。

在选择了一款优秀的微前端架构的前提下，需要注意：此时组件库的选择就能展现出工程师眼光的差距了；是有 n 种前端框架就使用 n 个组件库好，还是 n 种前端框架就使用一个组件库好呢？

我比较懒、想节省时间、想早点下班...... 而且一套东西越用越熟练，效率越高，不拘泥于技术栈，可以一当十（想当年六大门派围攻光明顶，我张无忌以一当...... 额，回归正题），至此 @opentiny/vue 就成了我不二之选。

那么如何做？

**3、需要怎么做？**

下面我们用 @opentiny/vue 组件库，在各个子应用中引入并使用，共用一套 @opentiny/vue-renderless 方法，实现多个技术栈跨端引用。

经过多方对比，我们选择了目前比较合适的（无界）微前端框架，接入相对简单，并兼具一款优秀微前端框架的优点。

跟着我们一起来动手吧！

**二、项目结构**

1、动手之前我们先了解一下要实现的项目结构，如图：

根目录主要分为：pnpm 单包管理. yaml 文件 + packages 目录；

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpoiczyXVykIWjqQWg3g7dmCiaTNwxPPx8GDZkl32quEWVpvFPKmpad5gQ/640?wx_fmt=png&from=appmsg)

packages 目录分为：一个主工程 + 四个子工程。

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpSib1UjlId2IaTrM8FEBnfOeRneHmbw1dp19HVfia9rjAsDYzstgA3dSQ/640?wx_fmt=png&from=appmsg)

主工程目录如下：我们需要编写的文件分别是路由文件 router/index.js + views 目录下的五个展示的页面。

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpObL0wJvrEQvfLXaBahkeEXsYT2B4TcObXlotzAdoKeurQ8QaHWt7Mg/640?wx_fmt=png&from=appmsg)

四个子工程目录结构分别如下：

前三个我们只简单的在其首页编写 @opentiny/vue 中两个组件的使用，展示的内容都是计时器和按钮；

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpWm2oKcJqcdkW7S7BG8p7e0xiborZCKDsKh6lAww4ot8TxQsI1NXRm8w/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpTd9BIR2UzGzCB9PLm5HwDLIP1dKaunQq3MOGCvLGCRFp9NlmrNIN8A/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpFoSJEjdFcLIEoUYLFyXlwlC2hiaHSSgGaTMfN5NU2da5aicNfxRiaqWibQ/640?wx_fmt=png&from=appmsg)

最后一个 Vue3 项目我们在一个页面展示了 pc、mobile 和 watch 三端的内容，所以需要编写的内容会多一点；

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpF13DnI69q3vPPqG3fWVibVSBVcBib6l1qK6JJ0elouZotbCkUGScXTHg/640?wx_fmt=png&from=appmsg)

这样就完成了我们此次的目的 => 跨框架使用我们的 @opentiny/vue 组件库。

2、了解了我们要实现的项目结构，接下来就是实现的思路：

我们分为三个阶段：

*   初始化 pnpm 和微前端工程；
    
*   创建一个主工程
    
*   创建四个子工程
    

最后启动查看效果。

**三、初始化**

**使用 pnpm 管理组件库工程和微前端工程**

1、创建 monorepo 工程根目录，使用 gitbash 输入以下命令（以下所有命令均在 gitbase 环境下运行）：

```
# 创建cross-framework-component工程根目录（名字可以自定义）mkdir cross-framework-component# 进入cross-framework-component根目录cd cross-framework-component# 创建多个子包的根目录mkdir packages
```

2、创建组件源代码目录：

```
# 进入多包目录cd packages# 创建components目录mkdir components
```

这里就不再介绍跨端组件库的实现了（关于如何实现跨框架组件库可以参考：[原来 TinyVue 组件库跨框架（vue2、vue3、react、solid）是这样实现的？](http://mp.weixin.qq.com/s?__biz=MzU5ODA3OTY5Ng==&mid=2247492188&idx=1&sn=f844c86b46739df405c29227bb13c9d6&chksm=fe4b03e3c93c8af5ee9c7e62e109d24a4f555803dde4f335011592689de8f03b5d3407c51a50&scene=21#wechat_redirect)），

我们直接将线上文件夹写好的 components 直接复制到我们 packages 目录下的 components ，完成适配 => 线上文件夹地址：https://github.com/opentiny/cross-framework-component/tree/master/packages/components

3、在根目录下创建 package.json，并修改其内容：

```
npm init -y
```

package.json 内容主要分为两块：

（1）定义包管理工具和一些启动工程的脚本：

    "preinstall": "npx only-allow pnpm"  -- 本项目只允许使用 pnpm 管理依赖  
    "dev": "node setup.js" -- 启动无界微前端的主工程和所有子工程  
    "dev:home": "pnpm -C packages/home dev" -- 启动无界微前端的主工程（vue3 框架）  
    "dev:react": "pnpm -C packages/react dev" -- 启动无界微前端的 react 子工程  
    "dev:solid": "pnpm -C packages/solid dev" -- 启动无界微前端的 solid 子工程  
    "dev:vue2": "pnpm -C packages/vue2 dev" -- 启动无界微前端的 vue2 子工程  
    "dev:vue3": "pnpm -C packages/vue3 dev" -- 启动无界微前端的 vue3 子工程

（2）解决一些 pnpm 针对 Vue 不同版本（Vue2、Vue3）的依赖冲突，packageExtensions 项可以让 Vue2 相关依赖可以找到正确的 Vue 版本，从而可以正常加载 Vue2 和 Vue3 的组件。

package.json 文件具体内容如下所示：

```
{  "name": "@opentiny/cross-framework",  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "preinstall": "npx only-allow pnpm",    "dev": "node setup.js",    "dev:home": "pnpm -C packages/home dev",    "dev:react": "pnpm -C packages/react dev",    "dev:solid": "pnpm -C packages/solid dev",    "dev:vue2": "pnpm -C packages/vue2 dev",    "dev:vue3": "pnpm -C packages/vue3 dev",    "dev:el": "pnpm -C packages/element-to-opentiny dev"  },  "repository": {    "type": "git",    "url": "https://github.com/opentiny/cross-framework-component.git"  },  "keywords": [],  "author": "",  "license": "ISC",  "pnpm": {    "overrides": {      "vue2": "npm:vue@2.6.14"    },    "packageExtensions": {      "vue-template-compiler@2.6.14": {        "peerDependencies": {          "vue": "2.6.14"        }      },      "@opentiny/vue-locale@2.9.0": {        "peerDependencies": {          "vue": "2.6.14"        }      },      "@opentiny/vue-common@2.9.0": {        "peerDependencies": {          "vue": "2.6.14"        }      }    }  }}
```

4、在根目录创建配置文件 pnpm-workspace.yaml，文件内容如下：

```
packages:  - packages/**    # packages文件夹下递归所有的子孙npm包，只要包含package.json都是独立的子工程
```

至此初始化已经完成，我们总共完成了四件事：

*   创建根目录 + packages 子包目录;
    
*   创建 packages 的 components 子目录，完成不同框架的适配;
    
*   在根目录下创建包管理文件 package.json，用于定义子应用的启动命令和解决依赖冲突的问题;
    
*   在根目录下创建单包配置文件 pnpm-workspace.yaml;
    

这样项目配置基本完成，我们就可以开始将注意力集中于编写我们的页面了。

**四、创建一个主工程**

**主工程最重要的是编写页面，用来串联起四个子应用，因此创建页面后，路由便是我们主工程的重中之重。**

主工程路由如下，默认路径或 /home 是集成展示所有子应用的首页，剩下的四个路径分别对应子应用的首页展示。

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpcia0tWjdPyWPscfSuAjgC451uTBR4THFkuQqdgCk3ZuxojyS81XMZJA/640?wx_fmt=png&from=appmsg)

1、使用 vite 脚手架创建一个 Vue3 的工程，运行命令如下：

```
npm create vite@latest home --template vue
```

2、下载安装无界微前端的 Vue3 依赖包和 vue-router 路由：

```
npm i wujie-vue3 vue-router
```

这里先简单了解一下无界页面的编写 <WujieVue> 元素的用法，以如下代码为例：

```
<WujieVue  width="100%"  height="100%" // width和height用于设置在主应用中子应用的尺寸；   // name对应子应用的名字；  :url="xxx" // url对应子应用的路径；  :sync="true" // sync开启路由同步；开启后浏览器刷新、前进、后退子应用路由状态也都不会丢失。  props="{ data: xxx, methods: xxx }" // props定义父应用传递给子应用的信息；></WujieVue>
```

3、进入主工程，在 packages/home/src 下新建 views 文件夹，并在文件夹中创建一个主页面和四个子页面，分别为：Home.vue（主页 -- 集成页面）、React.vue、Solid.vue、Vue2.vue、Vue3.vue 为四个子页面

Home.vue

```
<template>  <div class="multiple" style="">    <div class="home-box">      <WujieVue class="item"       ></WujieVue>    </div>  </div></template><script>export default {  data() {    return {      reactUrl: 'http://localhost:2001/', // 切换到react子工程的url      solidUrl: 'http://localhost:2002/', // 切换到solid子工程的url      vue2Url: 'http://localhost:2003/', // 切换到vue2子工程的url      vue3Url: 'http://localhost:2004/' // 切换到vue3子工程的url    }  }}</script><style scoped>.multiple {  width: 98%;  height: 100%;  padding: 5px 10px 0 10px;}.home-box {  display: flex;  justify-content: space-between;}.item {  display: block;  border: 1px dashed #ccc;  border-radius: 8px;  width: 32%;  height: 30vh;  overflow-y: auto;}.item-vue3 {  width: 100%;  height: 65vh;  margin-top: 20px;}</style>
```

React.vue：展示 react 子应用的窗口页面

```
<template>  <WujieVue    width="100%"    height="100%"      ></WujieVue></template><script>export default {  data() {    return {      reactUrl: 'http://localhost:2001/'    }  }}</script>
```

Solid.vue、Vue2.vue、Vue3.vue 这三个文件和 React.vue 代码几乎是相同的，不一样的只有 name 属性和端口号；都是用于展示相应子工程的窗口页面；如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpUN813Bhicff5wfqE8bCriaoPHibKoVSOEzuXibP3AjXiamaic7Ehw0pxx0Ug/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpUmPiaAY9j4CwTJsPibr5uDbAOZdiapt5aMQAr7NPHG1Frxic58CSV2yZFg/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpYm18FypXm0BE2Ia6lt4ibLzXqQStw2fWZKibYKa4FC8UhXG9WfmUfiagg/640?wx_fmt=png&from=appmsg)

5、跟 Vue 创建路由一样，在 packages/home/src/router 下创建路由文件 index.js，并引入上文创建的几个页面，内容如下：

```
import { createRouter, createWebHashHistory } from 'vue-router'import Home from '../views/Home.vue'import React from '../views/React.vue'import Solid from '../views/Solid.vue'import Vue2 from '../views/Vue2.vue'import Vue3 from '../views/Vue3.vue'const basename = process.env.NODE_ENV === 'production' ? '/demo-main-vue/' : ''const routes = [  {    path: '/home',    name: 'home',    component: Home  },  {    path: '/',    redirect: '/home'  },  {    path: '/react',    name: 'react',    component: React  },  {    path: '/solid',    name: 'solid',    component: Solid  },  {    path: '/vue2',    name: 'vue2',    component: Vue2  },  {    path: '/vue3',    name: 'vue3',    component: Vue3  }]const router = createRouter({  history: createWebHashHistory(),  base: basename,  routes})export default router
```

6、然后在 Home 主工程的主入口注册 wujie-vue3 和路由。

```
import { createApp } from 'vue'import WujieVue from 'wujie-vue3'import App from './App.vue'import router from './router'import './index.css'const app = createApp(App)app.use(WujieVue).use(router).mount('#app')
```

至此，我们主工程的页面和路由已创建完成。每个子工程在主工程都有自己的 “展台”，那么接下来我们就着手编写我们的子工程。

**五、创建四个子工程**

在开始创建之前，前面我们已经了解了四个子工程的项目结构，那就有思路了：

*   通过 vite 可以很方便快捷完成创建；
    
*   通过 vite 配置文件配置端口号和相应的插件，需要注意：Vue2 和 Vue3 的配置需额外做别名适配，对应上 @opentiny/vue 的 common 层；
    
*   每个子工程的 package.json 依赖中，添加我们当时复制的 components 文件夹下的 npm 包，对应实时加载上我们要使用的组件；
    
*   最后就是使用我们的组件编写页面了；
    

话不多说，跟着我们的步骤走起来~

1、在主工程 home 的同级目录，分别使用 React、Solid、Vue 的 vite 套件创建四个子工程，依次为：react/solid/vue2/vue3:

```
npm create vite@latest react --template react
npm create vite@latest solid --template solid
npm create vite@latest vue2 --template vue
npm create vite@latest vue3 --template vue
```

2、然后分别配置四个子工程 vite.config.js，设置不同的端口号（React：2001、Solid：2002、Vue2：2003、Vue3：2004）

React/vite.config.js：

```
import { defineConfig } from 'vite'import react from '@vitejs/plugin-react'import svgr from 'vite-plugin-svgr'// https://vitejs.dev/config/export default defineConfig({  plugins: [react(), svgr()],  server: {    port: 2001,    host: 'localhost'  }})
```

Solid/vite.config.js：

```
import { defineConfig } from 'vite'import solid from 'vite-plugin-solid'export default defineConfig({  plugins: [solid()],  server: {    port: 2002,    host: 'localhost'  }})
```

Vue2、Vue3 的 vite.config.js 需要一些别名适配，对接 vue-common 适配层。

Vue2/vite.config.js：

```
import { defineConfig } from 'vite'import { createVuePlugin } from 'vite-plugin-vue2'import path from 'node:path'// https://vitejs.dev/config/export default defineConfig({  plugins: [createVuePlugin()],  server: {    port: 2003,    host: 'localhost'  },  resolve: {    alias: { // 别名配置      'virtual:common/adapter/vue': path.resolve(        __dirname,        `../components/vue/common/src/adapter/vue2/index`      )    }  },  define: {    'process.env': { ...process.env }  }})
```

Vue3/vite.config.js：

```
import { defineConfig } from 'vite'import vue from '@vitejs/plugin-vue'import path from 'node:path'// https://vitejs.dev/config/export default defineConfig({  plugins: [vue()],  server: {    port: 2004,    host: 'localhost',    https: false,    proxy: {      '/api': {        target: '*',        changeOrigin: true      }    }  },  resolve: {    alias: { // 别名配置      'virtual:common/adapter/vue': path.resolve(        __dirname,        `../components/vue/common/src/adapter/vue3/index`      )    }  },  define: {    'process.env': { ...process.env }  }})
```

3、分别在四个子工程根目录的 package.json 的 dependencies 键中添加如下依赖包，用来加载本地跨框架的 button 组件和倒计时 countdown 组件：

```
# vue2、vue3"@opentiny/vue-button"："workspace:~","@opentiny/vue-countdown": "workspace:~"# react "@opentiny/react -button"："workspace:~","@opentiny/react -countdown": "workspace:~"# solid "@opentiny/solid-button"："workspace:~","@opentiny/solid-countdown": "workspace:~"
```

4、在四个子工程里使用 button 组件和倒计时 countdown 组件，自定义一些交互逻辑如下：

React/src/app.jsx：

```
import { Button, Countdown } from '@opentiny/react'import './style.css'const operation = {  start: () => { },  reset: () => { }}const operate = ({ start, reset }) => {  operation.start = start  operation.reset = reset}function App() {  return (    <>      <div class> <Countdown operate={operate} /> </div>          <div class click={() => operation.reset()}>Reset</Button>            <Button type="danger" click={() => operation.start()}>Start</Button>          </div>        </div>      </div>    </>  )}export default App
```

Solid/src/app.jsx：

```
import { createSignal } from 'solid-js'import { Button, Countdown } from '@opentiny/solid'const operation = {  start: () => { },  reset: () => { },  stop: () => { }}const operate = ({ start, reset }) => {  operation.start = start  operation.reset = reset}function App() {  return (    <>      <div class="demo-box">        <h1 class="demo-titile">Solid</h1>        <div class="demo-container">          <div class="tiny-countdown" style="--ti-countdown-font-color:pink;"><Countdown operate={operate}></Countdown></div>          <div class="btn-box">            <Button type="primary" onClick={operation.reset()}>Reset</Button>            <Button type="danger" onClick={operation.start()}>Start</Button>          </div>        </div>      </div>    </>  )}export default App
```

Vue2/src/app.vue：

```
<template>  <div class="demo-box">    <h1 class="demo-titile">Vue2</h1>    <div class="demo-container">      <div class="tiny-countdown">        <tiny-countdown :operate="operate"></tiny-countdown>      </div>      <div class="btn-box">        <tiny-button type="primary" @click="reset">Reset</tiny-button>        <tiny-button type="danger" @click="start">Start</tiny-button>      </div>      </div>    </div>  </div></template><script>import TinyButton from '@opentiny/vue-button'import TinyCountdown from '@opentiny/vue-countdown'export default {  components: {    TinyButton,    TinyCountdown  },  data() {    return {      operation: {        start: () => {},        reset: () => {}      }    }  },  methods: {    operate({ start, reset }) {      this.operation.start = start      this.operation.reset = reset    },    reset() {      this.operation.reset()    },    start() {      this.operation.start()    }  }}</script><style lang="less">html,body {  margin: 0;  padding: 0;}.demo-box {  position: relative;  overflow: hidden;  .demo-titile {    width: 80px;    line-height: 36px;    font-size: 24px;    margin: 0;    padding: 0 5px;    background: #999;    text-align: center;    color: #fefefe;    position: absolute;    left: 0;    top: 0;  }  .demo-container {    margin-top: 40px;  }  .tiny-countdown {    font-size: 50px;    text-align: center;  }  .btn-box {    text-align: center;    margin-top: 20px;  }}.tiny-countdown__container {  --ti-countdown-font-color:#f4606c;}</style>
```

Vue3 的页面涉及到跨 pc、mobile、watch 端，内容比较多，可以直接 copy 线上的内容：

https://github.com/opentiny/cross-framework-component/tree/master/packages/vue3

**六、启动创建好的微前端**

接下来，进入我们的根目录，分别运行以下命令启动四个子工程

1、运行 React 子应用：

```
npm run dev:react
```

效果如下所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjp4icmtq0o1icfWf14W4qafXgeoFZbmHWPNHT1eOIm2CH5HMY4DYvfqDzg/640?wx_fmt=png&from=appmsg)

2、运行 Solid 子应用：

```
npm run dev:solid
```

效果入下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjprBtibgfTaOkuIwca8Z9JhAjmAPrrnUTktREuAlBkhEaH5lcRtXFvplQ/640?wx_fmt=png&from=appmsg)

3、运行 Vue2 子应用：

```
npm run dev:vue2
```

效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpdn0Iib1xEv4tty3FIlW6rQxfycaKKmR3CuY0YWKArQuZibeScDMy6uew/640?wx_fmt=png&from=appmsg)

4、运行 Vue3 子应用：

```
npm run dev:vue3
```

效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpT2icDpcXySzMhfdo5lvKfjcrXeXCXDlmo6MSgibAXo63O4NNqZlcD6yA/640?wx_fmt=png&from=appmsg)

5、启动微前端主应用：

```
npm run dev:home
```

效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpfv24EFeXCpKgoPrL0b9uIN9ExpGibPlAzplwpY6TAMlqqpd4jnHtlQg/640?wx_fmt=png&from=appmsg)

6、一键启动（如果觉得繁琐，那我会选择这种方式）：直接使用脚本一个命令启动所有微前端工程，在根目录创建 setup.js，其内容如下：

```
const { exec } = require('child_process')exec('npm run dev:vue3', __dirname)exec('npm run dev:react', __dirname)exec('npm run dev:solid', __dirname)exec('npm run dev:vue2', __dirname)exec('npm run dev:home', __dirname)console.log('home', 'http://localhost:5173/')console.log('react', 'http://localhost:2001/')console.log('solid', 'http://localhost:2002/')console.log('vue2', 'http://localhost:2003/')console.log('vue3', 'http://localhost:2004/')
```

然后在根目录的 package.json 中的 script 命令中添加以下命令：

```
"dev": "node setup.js"
```

最后只需要一个命令就可以启动所有的微前端工程：

```
npm run dev
```

**七、源代码仓库参考**

1、使用以下命令把演示 Demo 克隆到本地：

```
git clone https://github.com/opentiny/cross-framework-component.git
```

2、使用 pnpm 下载依赖：

```
pnpm i

# 如果没有pnpm需要执行以下命令
npm i pnpm -g
```

3、工程目录结构分析

整个工程是基于 pnpm 搭建的多包 monorepo 工程，演示环境为无界微前端，整体工程的目录架构如下所示：

```
├─ package.json
├─ packages     
│  ├─ components              # 组件库文件夹
│  │  ├─ react                 # react组件库及其适配层
│  │  ├─ renderless         # 跨框架复用的跨框架无渲染逻辑层
│  │  ├─ solid                 # solid组件库及其适配层
│  │  ├─ theme              # 跨框架复用的pc端样式层
│  │  ├─ theme-mobile         # 移动端模板样式层
│  │  ├─ theme-watch           # 手表带模板样式层
│  │  └─ vue                           # vue组件库及其适配层
│  ├─ element-to-opentiny            # element-ui切换OpenTiny演示工程
│  ├─ home                              # 基于vue3搭建无界微前端主工程
│  ├─ react                            # 基于react搭建无界微前端子工程
│  ├─ solid                              # 基于solid搭建无界微前端子工程
│  ├─ vue2                              # 基于vue2搭建无界微前端子工程
│  └─ vue3                              # 基于vue3搭建无界微前端子工程
├─ pnpm-workspace.yaml
├─ README.md
├─ README.zh-CN.md
└─ setup.js
```

4、效果展示，启动本地的无界微前端本地服务

```
pnpm dev
```

总共会启动 5 个工程，1 个主工程和 4 个子工程，4 个子工程分别用到 Vue2、Vue3、React、Solid 框架，并都使用了 OpenTiny 的跨框架组件库。

效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/qkxhvoHGVKCd5Xyf06QM1Vej4e4aJLjpfv24EFeXCpKgoPrL0b9uIN9ExpGibPlAzplwpY6TAMlqqpd4jnHtlQg/640?wx_fmt=png&from=appmsg)

**八、结语**

我们通过对微前端的粗浅了解，以及从 0 到 1 搭建起整个微前端的项目，能明显感觉到在单页面应用流行的当下，若变为巨石应用时，微前端的重要性；与此同时，如何选择一款好的组件库适配好的微前端框架，也会成为我们前端从业者考虑的重点。

跟着本文的教程实践下来，大家应该能明显感觉到，我们 @opentiny/vue 组件库不管是适配不同技术栈，还是使用、功能方面，都是很容易上手的。  

想当年我张无忌以一敌......