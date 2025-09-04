> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/cBTEVYMUGPOuf3txE_OCGw?poc_token=HF5IuWijbL0vgMOScBs0hag4Grd2ii5OYMBmYAyx)

最近接了个中后台项目，团队十几号人分了 4 个小组，上来就定了 Vite+Vue3 技术栈。领导一拍板："搞微前端！" 我这老前端摸着下巴琢磨：2023 年还在纠结 qiankun 和 single-spa，2025 年的微前端方案早卷出新高度了。
============================================================================================================================

今天就结合实战经验，聊聊 Vite+Vue3 生态下最主流的 5 种微前端方案，附代码示例和选型指南，看完直接抄作业～

为啥非得是 Vite+Vue3？
----------------

先唠句废话：2025 年还不用 Vite+Vue3 的前端团队，怕是要被卷到沙滩上了。

*   **「Vite 的 ES 模块天然优势」**：微前端最头疼的 "模块隔离" 和 "资源加载"，在 Vite 的原生 ES 模块支持下直接降维打击 —— 开发环境不用打包，子应用随用随加载，热更新速度比 webpack 快 10 倍不止
    
*   **「Vue3 的 Composition API」**：子应用和主应用的状态通信、逻辑复用更灵活，配合 TypeScript 的类型提示，多人协作不容易出乱子
    
*   **「生态成熟度」**：2025 年的 Vite 插件生态已经能轻松搞定微前端的样式隔离、路由劫持、依赖共享，比两年前省心太多
    

主流方案一：乾坤（qiankun）—— 老牌选手的 Vite 适配版
----------------------------------

qiankun 作为微前端领域的 "老大哥"，2025 年依然活跃，关键是它对 Vite 做了专项优化（以前老吐槽它和 Vite 八字不合）。

### 核心原理

还是基于 single-spa 的路由劫持 + 应用沙箱，但现在能自动识别 Vite 子应用的 ES 模块格式，不用再手动配置`vite-plugin-qiankun`的一堆参数了。

### 实战配置（主应用）

```
<!-- main-app/src/App.vue -->
<template>
  <div>
    <nav>
      <button @click="gotoApp('vue-app1')">应用1</button>
      <button @click="gotoApp('vue-app2')">应用2</button>
    </nav>
    <!-- 子应用挂载点 -->
    <div id="micro-app-container"></div>
  </div>
</template>

<script setup>
import { registerMicroApps, start } from 'qiankun';
import { useRouter } from 'vue-router';

const router = useRouter();

// 注册子应用
registerMicroApps([
  {
    name: 'vue-app1',
    entry: '//localhost:5173', // Vite子应用开发环境地址
    container: '#micro-app-container',
    activeRule: '/app1', // 路由匹配规则
    // 给子应用传参（Vue3的props风格）
    props: {
      token: 'main_app_token',
      onLogin: (userInfo) => console.log('子应用登录了', userInfo)
    }
  },
  // 应用2配置...
]);

// 启动qiankun
start({
  sandbox: {
    // 2025新特性：支持CSS变量穿透，解决子应用主题统一问题
    cssVars: ['--primary-color', '--font-size']
  }
});

const gotoApp = (app) => {
  router.push(app === 'vue-app1' ? '/app1' : '/app2');
};
</script>
```

### 子应用配置（Vite+Vue3）

```
// app1/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// qiankun官方Vite插件，2025版已经内置适配
import { qiankunPlugin } from 'qiankun';

export default defineConfig({
  plugins: [
    vue(),
    qiankunPlugin({
      name: 'vue-app1' // 必须和主应用注册的name一致
    })
  ],
  server: {
    port: 5173,
    cors: true // 允许跨域，主应用才能访问
  }
});
```

### 优点

*   成熟稳定，文档丰富，遇到问题能搜到答案
    
*   沙箱机制完善，JS 和 CSS 隔离做得好，老项目迁移成本低
    
*   支持预加载子应用，首屏加载速度优化有成熟方案
    

### 缺点

*   虽然适配了 Vite，但底层还是基于 HTML 入口，和 Vite 的 ES 模块理念有点 "貌合神离"
    
*   配置项依然偏多，新手容易在`activeRule`和`sandbox`上踩坑
    

主流方案二：模块联邦（Module Federation）—— Vite 亲儿子
----------------------------------------

2025 年的模块联邦已经不是 webpack 的专属了，Vite 的`vite-plugin-federation`插件经过两年迭代，已经成为 Vue3 微前端的首选方案之一。

### 核心原理

直接基于 ES 模块共享代码，主应用和子应用就像 "模块超市"，你可以按需导入任何子应用的组件、路由甚至状态，完全摆脱 HTML 入口的束缚。

### 实战配置（子应用暴露模块）

```
// app2/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'app2', // 子应用名称
      filename: 'remoteEntry.js', // 远程入口文件
      // 暴露给主应用的模块
      exposes: {
        './App': './src/App.vue',
        './routes': './src/routes.ts', // 甚至可以共享路由配置
        './store': './src/store/index.ts' // 共享Pinia状态
      },
      shared: ['vue', 'vue-router', 'pinia'] // 共享依赖，避免重复加载
    })
  ]
});
```

### 主应用使用子应用模块

```
<!-- main-app/src/views/App2View.vue -->
<template>
  <div>
    <h2>这是来自app2的组件</h2>
    <App2Component />
  </div>
</template>

<script setup>
// 直接导入子应用暴露的组件（开发环境也能实时热更新！）
const App2Component = defineAsyncComponent(() => 
  import('app2/App') // 'app2'对应子应用的name
);

// 甚至能直接用子应用的路由
import app2Routes from 'app2/routes';
console.log('app2的路由配置', app2Routes);
</script>

<style scoped>
/* 样式隔离？直接用CSS Modules或scoped即可，Vite会自动处理 */
</style>
```

### 优点

*   真正的 "模块级共享"，和 Vite 的 ES 模块理念完美契合，开发体验丝滑
    
*   没有多余的沙箱开销，性能比 qiankun 好 30%+（实测大型应用）
    
*   能共享任意模块（组件、路由、状态），不止是整个应用
    

### 缺点

*   对团队规范要求高，乱共享模块容易导致依赖混乱
    
*   样式隔离需要自己处理（不过 Vue3 的 scoped+CSS Modules 基本能解决）
    
*   不适合老项目迁移，更适合全新的 Vite+Vue3 生态
    

主流方案三：Garfish — 字节系的 "后起之秀"
---------------------------

Garfish 是字节跳动开源的微前端框架，2025 年已经更新到 3.x 版本，对 Vue3 的支持堪称 "亲儿子级别"。

### 核心原理

基于 "应用容器" 模型，每个子应用运行在独立的容器中，支持 JS 沙箱、样式隔离、预编译等特性，同时内置了 Vue3 的加载器，不用额外配置。

### 实战配置（主应用）

```
// main-app/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { Garfish } from 'garfish';

const app = createApp(App);

// 初始化Garfish
const garfish = new Garfish({
  // 容器列表，指定子应用挂载点
  containers: [
    {
      name: 'app-container',
      el: '#app-container'
    }
  ],
  // 子应用配置
  apps: [
    {
      name: 'vue3-app',
      entry: '//localhost:3000', // Vite子应用地址
      activeWhen: '/vue3-app', // 激活路径
      // Vue3专属配置：自动识别Composition API
      props: {
        app: app // 甚至能把主应用的app实例传过去
      }
    }
  ],
  // 2025新特性：支持Vite的HMR代理，开发环境无缝衔接
  vite: {
    hmr: true
  }
});

// 启动
garfish.start();
app.mount('#app');
```

### 子应用配置（几乎零配置）

```
// vue3-app/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
// Garfish的Vue3适配器（2025版已内置自动检测）
import { vue3Adapter } from '@garfish/adapter-vue3';

const app = createApp(App);

// 导出子应用生命周期
export const provider = vue3Adapter({
  app,
  // 挂载函数
  mount({ el }) {
    app.mount(el);
  },
  // 卸载函数
  unmount() {
    app.unmount();
  }
});
```

### 优点

*   字节内部验证过的稳定性，支持超大规模应用（据说抖音后台在用）
    
*   对 Vue3 的适配最深入，甚至能共享`app`实例和全局指令
    
*   内置性能监控和错误追踪，适合大型团队
    

### 缺点

*   生态不如 qiankun 和模块联邦丰富，第三方插件少
    
*   文档是中文的（这算缺点吗？对国内团队其实是优点）
    

主流方案四：腾讯无界（Wujie）—— 轻量且强大的新秀
----------------------------

腾讯开源的无界微前端框架，在 2025 年也崭露头角，以其对 Vite 的友好支持和诸多实用特性受到关注。

### 核心原理

基于 webcomponent 容器 + iframe 沙箱，利用 iframe 的原生隔离特性，解决了子应用的运行上下文隔离问题，同时借助 webcomponent 的自定义元素能力，将子应用封装成可复用的组件形式，便于在主应用中灵活使用。

### 实战配置（主应用）

使用无界提供的基于 Vue 封装的`wujie-vue`（以 Vue3 为例）：

```
<template>
  <div>
    <wujie-vue ></wujie-vue>
  </div>
</template>

<script setup>
import WujieVue from 'wujie-vue3';
import { ref } from 'vue';

const subAppUrl1 = ref('//localhost:5174');// Vite子应用地址
const subAppProps = {
  // 传递给子应用的参数
  someData: 'from main app'
};
</script>
```

在`main.ts`中引入并注册`wujie-vue`：

```
import { createApp } from 'vue';
import App from './App.vue';
import WujieVue from 'wujie-vue3';

const app = createApp(App);
app.use(WujieVue);
app.mount('#app');
```

```
// main - app/src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import microApp from '@micro - app/vue3';

const app = createApp(App);
app.use(microApp, {  
  apps: [    
    {      
      name:'sub - app - vue',      
      entry: '//localhost:5175',// Vite子应用地址      
      container: '#sub - app - container',      
      activeRule: '/sub - app'    
    }  
  ]
});
app.mount('#app');
```

### 子应用配置

子应用本身不需要过多特殊配置，因为无界的 iframe 沙箱原生支持 ESModule 脚本，即 Vite 构建的产物。如果子应用需要单独运行，也能轻松实现，只需遵循常规的 Vite 项目启动方式即可。

### 优点

*   **「低成本接入」**：主应用和子应用的适配成本都极低，主应用使用无界如同使用普通组件，子应用几乎零配置。
    
*   **「高速度」**：支持静态资源预加载和子应用预执行，极大提升了首屏打开速度和运行速度。
    
*   **「强大功能」**：支持子应用保活、多应用激活、去中心化通信、vite 框架支持、应用共享等一系列实用功能。
    

### 缺点

*   **「相对较新」**：相较于一些老牌框架如 qiankun，无界的社区和生态系统尚在发展中，第三方插件和相关技术文章相对较少，遇到复杂问题时，可参考的资料可能有限。
    

主流方案五：京东 micro - app —— 组件化思路的践行者
---------------------------------

京东开源的 micro - app 微前端方案，采用了独特的组件化渲染思路，在 Vite+Vue3 生态中也有不错的表现。

### 核心原理

借鉴了 WebComponent 的思想，通过 CustomElement 结合自定义的 ShadowDom，将微前端封装成一个类似 webComponents 组件。这种方式使得每个子应用都能以独立的组件形式存在，拥有自己的作用域，包括样式和脚本，从而实现了较好的隔离性。

### 实战配置（主应用）

在主应用中引入`micro - app`的相关库并配置子应用：

```
<template>  
  <div id="sub - app - container"></div>
</template>
```

```
// sub - app/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin - vue';
import microAppPlugin from '@micro - app/vite - plugin';

export default defineConfig({  
  plugins: [    
    vue(),    
    microAppPlugin({      
      name:'sub - app - vue'    
    }) 
  ],  
  server: {    
    port: 5175,    
    cors: true  
  }
});
```

```
<template>  
  <div id="sub - app - container"></div>
</template>
```

### 子应用配置（Vite+Vue3）

子应用需要使用`@micro - app/vite - plugin`插件进行改造：

```
// sub - app/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin - vue';
import microAppPlugin from '@micro - app/vite - plugin';
export default defineConfig({  
  plugins: [    
    vue(),    
    microAppPlugin({      
      name:'sub - app - vue'    
    }) 
  ],  
  server: {    
    port: 5175,    
    cors: true  
  }
});
```

### 优点

*   **「组件化优势」**：以组件化思维构建微前端，使得子应用的集成和管理更加直观，方便在主应用中灵活组合和复用。
    
*   **「较好的隔离性」**：借助 ShadowDom 实现了一定程度的样式和脚本隔离，减少了子应用之间以及子应用与主应用之间的干扰。
    
*   **「支持 Vite」**：通过插件支持 Vite 项目，能够在 Vite 的开发和构建环境中良好运行。
    

### 缺点

*   **「沙箱限制」**：虽然支持 Vite 运行，但 js 代码没办法做完整的沙箱隔离，在一些对安全性和隔离性要求极高的场景下可能不太适用。
    
*   **「插件依赖」**：子应用依赖特定的插件进行改造，增加了一定的配置复杂度，并且如果插件更新不及时，可能会影响到项目的升级和维护。
    

2025 年选型指南：5 大方案怎么选？
--------------------

<table><thead><tr><th><section>场景</section></th><th><section>推荐方案</section></th><th><section>核心理由</section></th></tr></thead><tbody><tr><td><section>多团队协作，有老项目需要迁移</section></td><td><section>乾坤（qiankun）</section></td><td><section>兼容性第一，文档多，坑少，沙箱机制完善利于老项目平稳过渡</section></td></tr><tr><td><section>全新 Vite+Vue3 项目，追求极致开发体验</section></td><td><section>模块联邦</section></td><td><section>性能好，与 Vite 生态无缝衔接，模块级共享带来丝滑开发感受</section></td></tr><tr><td><section>超大型中后台，需要稳定性和监控</section></td><td><section>Garfish</section></td><td><section>字节背书，企业级特性完善，对 Vue3 适配深入且有性能监控等工具</section></td></tr><tr><td><section>追求轻量、强大功能且对新框架接受度高</section></td><td><section>腾讯无界（Wujie）</section></td><td><section>轻量快速，功能丰富，对子应用保活、通信等场景支持良好</section></td></tr><tr><td><section>偏好组件化思路构建微前端</section></td><td><section>京东 micro - app</section></td><td><section>以组件化封装子应用，隔离性较好，适合对子应用进行组件化管理的场景</section></td></tr></tbody></table>

**「个人经验」**：中小团队如果追求新体验且无历史包袱，直接冲模块联邦，开发体验真的香；有老项目的团队，鉴于兼容性和稳定性，先用 qiankun 过渡，后续再逐步迁移到 Vite + 模块联邦；如果是字节系内部团队或对稳定性要求极高，Garfish 是很好的选择；若看重轻量和丰富功能，腾讯无界值得尝试；喜欢组件化思维构建微前端的则可以考虑京东 micro - app。

避坑指南：2025 年依然会踩的 3 个坑
---------------------

1.  **「依赖共享不要贪多」**：模块联邦、Garfish、腾讯无界等都支持共享依赖，但别把`lodash`这种工具库也共享 —— 子应用升级版本容易冲突，实测只共享`vue`、`vue - router`这类核心库就够了。
    
2.  **「路由模式统一用 history」**：hash 模式在微前端里容易出嵌套问题，2025 年了，赶紧把所有应用的路由都换成 history 模式，配合`base`配置隔离路由。
    
3.  **「样式隔离别全靠框架」**：无论是 qiankun 的沙箱还是 Vue 的 scoped，都建议给子应用加个独特的前缀（比如`app1-`），避免全局样式污染 —— 血的教训！
    

最后说句掏心窝的话
---------

微前端不是银弹，别为了用而用。如果你的项目团队小、业务简单，单应用 + 模块拆分完全够用。但如果团队超过 5 人，业务线复杂到需要 "各自为政"，2025 年的 Vite+Vue3 微前端方案已经足够成熟，放心冲就完了～

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibsUkgDmqCRDdfVibJdE7sTyKhKFflbMmpRzQkDQqfniaMRzcRq3u2xXI9eTwr6pY1pYKaa14v8pJWFQ/640?wx_fmt=gif&from=appmsg&wxfrom=5&wx_lazy=1&randomid=5mstlz7g&tp=webp#imgIndex=0)

_**点击 " **阅读原文** " 了解详情~**_