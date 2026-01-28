> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/P3T2b_ZPbDgaQRhUd8pp_g)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

### 一、引言：为何选择微前端？

在传统单体前端架构中，随着业务复杂度增加，代码臃肿、协作困难、部署效率低等问题愈发突出。**微前端**通过将项目拆分为多个独立自治的微应用，解决了这些问题：

*   **技术栈无关**：支持 Vue、React、Angular 等框架混合开发
    
*   **独立部署**：各团队可独立开发、测试、发布
    
*   **渐进升级**：允许逐步重构旧系统
    
*   **动态加载**：按需加载减少首屏耗时
    

本文将以**电商后台管理系统**为应用场景，对比分析无界（Momentum）与乾坤（Qiankun）两大框架的实现方式，通过完整示例代码揭示其核心差异。

* * *

### 二、基础概念对比

<table><thead><tr><th><strong>特性</strong></th><th><strong>无界（Momentum）</strong></th><th><strong>乾坤（Qiankun）</strong></th></tr></thead><tbody><tr><td><strong>技术实现</strong></td><td><section>WebComponents + iframe</section></td><td><section>single-spa + proxy + function-based sandbox</section></td></tr><tr><td><strong>样式隔离</strong></td><td><section>依赖 WebComponent 原生影子 DOM</section></td><td><section>JS 沙箱 + 实验性样式隔离</section></td></tr><tr><td><strong>浏览器兼容性</strong></td><td><section>IE11+（需处理 iframe 弹窗）</section></td><td><section>支持 IE11（通过 polyfill）</section></td></tr><tr><td><strong>学习成本</strong></td><td><section>极低（接近原生开发）</section></td><td><section>中等（需理解生命周期函数）</section></td></tr><tr><td><strong>最佳适用场景</strong></td><td><section>中小型项目、快速集成</section></td><td><section>大型复杂项目、多团队协作</section></td></tr></tbody></table>

* * *

### 三、实战示例：电商后台管理系统

#### 场景描述

假设某电商后台包含以下三个核心模块：

1.  **商品管理**（React 技术栈）
    
2.  **订单处理**（Vue 技术栈）
    
3.  **用户中心**（Angular 技术栈）
    

主应用提供统一导航和登录态，各子应用独立开发部署。

* * *

#### 四、主应用配置（通用部分）

##### 1. 创建主应用（Vue 3）

```
vue create main-app
cd main-app
npm install momentum-ui # 无界框架
npm install qiankun      # 乾坤框架


```

##### 2. 目录结构

```
main-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── NavBar.vue
│   ├── App.vue
│   ├── main.js
│   └── ...
├── package.json


```

* * *

#### 五、无界框架实现

##### 1. 主应用配置（`src/main.js`）

```
import { createApp } from'vue'
import App from'./App.vue'
import NavBar from'./components/NavBar.vue'
import { registerMicroApps } from'momentum-ui'

const app = createApp(App)
app.component('NavBar', NavBar)
app.mount('#app')

// 注册子应用
registerMicroApps([
  {
    name: 'product-react',
    entry: '//localhost:7100',
    activeRule: '/product',
    container: '#subapp-container'
  },
  {
    name: 'order-vue',
    entry: '//localhost:7101',
    activeRule: '/order',
    container: '#subapp-container'
  }
])


```

##### 2. 导航组件（`src/components/NavBar.vue`）

```
<template>
  <nav>
    <router-link to="/product">商品管理</router-link>
    <router-link to="/order">订单处理</router-link>
  </nav>
</template>


```

##### 3. 主应用模板（`public/index.html`）

```
<body>
  <div id="app">
    <NavBar />
    <div id="subapp-container"></div>
  </div>
</body>


```

* * *

#### 六、乾坤框架实现

##### 1. 主应用配置（`src/main.js`）

```
import { createApp } from'vue'
import App from'./App.vue'
import NavBar from'./components/NavBar.vue'
import { registerMicroApps, start } from'qiankun'

const app = createApp(App)
app.component('NavBar', NavBar)
app.mount('#app')

// 注册子应用
registerMicroApps([
  {
    name: 'product-react',
    entry: '//localhost:7100',
    activeRule: '/product',
    container: '#subapp-container',
    props: { allowRouter: true }
  },
  {
    name: 'order-vue',
    entry: '//localhost:7101',
    activeRule: '/order',
    container: '#subapp-container'
  }
])

// 启动乾坤
start()


```

##### 2. 关键区别

*   **无界**：无需显式启动，注册即自动加载
    
*   **乾坤**：需调用 `start()` 激活沙箱环境
    
*   **样式隔离**：无界依赖 WebComponent 影子 DOM，乾坤需配置 `sandbox: { strictStyleIsolation: true }`
    

* * *

#### 七、子应用开发（以 React 子应用为例）

##### 1. 创建子应用

```
npx create-react-app product-react
cd product-react
npm install momentum-ui # 或 qiankun


```

##### 2. 无界适配配置

```
// src/index.js (无界)
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

if (window.__POWERED_BY_MOMENTUM__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_MOMENTUM__
}

ReactDOM.render(<App />, document.getElementById('root'))


```

##### 3. 乾坤适配配置

```
// src/index.js (乾坤)
import React from'react'
import ReactDOM from'react-dom'
import App from'./App'

let instance = null

function render(props) {
  ReactDOM.render(<App {...props} />, document.getElementById('root'))
}

if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

exportasyncfunction bootstrap() {
console.log('React 子应用启动')
}
exportasyncfunction mount(props) {
console.log('React 子应用挂载')
  render(props)
}
exportasyncfunction unmount() {
  ReactDOM.unmountComponentAtNode(instance.container.querySelector('#root'))
console.log('React 子应用卸载')
}


```

* * *

### 八、核心特性对比

#### 1. 样式隔离

*   **无界**：利用 WebComponent 的影子 DOM 自动隔离样式
    
*   **乾坤**：需开启严格样式隔离（`sandbox: { strictStyleIsolation: true }`），否则可能污染全局样式
    

#### 2. JS 沙箱

*   **无界**：通过 iframe 天然隔离，但跨帧通信成本较高
    
*   **乾坤**：采用函数代理沙箱，性能更优但需注意变量泄漏
    

#### 3. 动态路由

*   **无界**：支持动态注册路由，适合频繁变化的导购系统
    
*   **乾坤**：依赖主应用路由配置，更适合固定入口的场景
    

* * *

### 九、生产环境部署要点

1.  **构建顺序**：
    

*   先构建主应用，再依次构建子应用
    
*   使用带哈希的指纹版本避免缓存问题
    

3.  **Nginx 配置示例**：
    

```
server {
  listen 80;
  location / {
    root /path/to/main-app/dist;
    try_files $uri $uri/ /index.html;
  }
  location /product/ {
    proxy_pass http://localhost:7100;
  }
  location /order/ {
    proxy_pass http://localhost:7101;
  }
}


```

3.  **跨域处理**：
    

*   子应用需设置 `Access-Control-Allow-Origin`
    
*   推荐使用 CDN 加速静态资源加载
    

* * *

### 十、总结与选择建议

<table><thead><tr><th><strong>需求场景</strong></th><th><strong>推荐框架</strong></th><th><strong>理由</strong></th></tr></thead><tbody><tr><td><section>快速原型验证、中小型项目</section></td><td><section>无界</section></td><td><section>零配置接入、天然样式隔离、支持现代浏览器</section></td></tr><tr><td><section>企业级复杂系统、多团队协作</section></td><td><section>乾坤</section></td><td><section>完善的生命周期管理、更强的兼容性、适合长期维护</section></td></tr><tr><td><section>混合技术栈项目</section></td><td><section>乾坤</section></td><td><section>官方支持多种框架混合，社区生态更成熟</section></td></tr></tbody></table>

通过本文的对比与实战演示，开发者可根据项目规模、技术复杂度、团队协作需求选择合适的微前端框架。建议从无界入手体验微前端优势，待业务扩展后再逐步迁移至乾坤。

> 本文转载于稀土掘金技术社区，作者：
> 
> 架构个驾驾
> 
> https://juejin.cn/post/7514956702345773065

  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```