> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Id2uetN4ygX1azr0v8GKNg)

前言
--

一直以来, 转转 APP 为了满足公司内部业务快速迭代的诉求并且追求极致的开发效率, 端内容器一直都是走的 Webview 容器技术路线, 90%+ 的页面都是 Vue 技术栈的 Webview 页面, 还有部分 Native 原生页面, 当然了, 还有几年前探索跨端容器技术历史遗留的一个 Flutter(Kraken) 页面。 随着业务产品对用户体验的诉求愈来愈强烈, 鸿蒙系统用户越来越多, 结合业内同级别公司的企业级跨端容器实践, 并与相关企业进行深入交流之后, 最终转转决定探索并拥抱 ReactNative 容器。 下面主要介绍一下转转今年在探索 ReactNative 跨端容器技术（前端侧）的一些实践。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNico7wV7BztqR75XHyeBm4JtibdGianKC0B6Gq2AetKBjOFNaGjNvpEeYeX1YoMtaRqSKiaiaicm2oQUk0g/640?wx_fmt=png&from=appmsg#imgIndex=0)转转 App 容器建设里程碑

前期调研与方案对比
---------

### RN 在转转 APP 内工程实现

RN 应用的工程实现模式通常有三种: 1. RN 官方工程模式 2. 原生工程模式 3. 原生 APP 混合模式。

相比纯 ReactNative 工程，例如转转 APP 这种中大型 App 的实际业务开发还需要考虑如何在已有原生 (原生容器 + webview 容器) 项目中引入 ReactNative，作为原生框架的扩展能力。比如，部分业务可能对开发效率、页面性能体验、多端一致性、动态更新能力等有较强要求的，可使用 ReactNative 容器来实现。

另外, 采用原生 APP 混合模式, 还有如下几点因素:

*   不侵入现有工程结构，React Native 模块会作为现有工程的一部分进行组织管理。
    
*   不影响代码仓库管理，不用把 Android、iOS 放在同一代码仓库下进行管理。
    
*   方便进行组件功能复用，可以将 React Native 模块独立成组件，提供给其他 App 平台使用。
    

当然了, 如果是一个轻量级 APP 或者新 APP 可选择纯 ReactNative 工程实现模式.

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNico7wV7BztqR75XHyeBm4JtP1SkuibxJiaeDCPEZV1MNHOibv5c40VMTZabvy4Folv0fbDXpCUCr6gjQ/640?wx_fmt=png&from=appmsg#imgIndex=1)集成 RN 开发模式图

### RN-CLI 的选择

在 RN 项目开发中，我们面临两个主要项目开发方案选择：Expo CLI 和 React Native CLI。

#### Expo CLI vs React Native CLI 对比

<table><thead><tr><th><section>特性</section></th><th><section>Expo CLI</section></th><th><section>React Native CLI</section></th></tr></thead><tbody><tr><td><strong>项目初始化</strong></td><td><code>expo init</code></td><td><code>npx react-native init</code></td></tr><tr><td><strong>开发体验</strong></td><td><section>开箱即用，配置简单</section></td><td><section>需要手动配置，灵活性高</section></td></tr><tr><td><strong>原生模块支持</strong></td><td><section>受限，需要 eject</section></td><td><section>完全支持</section></td></tr><tr><td><strong>自定义原生代码</strong></td><td><section>不支持</section></td><td><section>完全支持</section></td></tr><tr><td><strong>热重载</strong></td><td><section>内置支持</section></td><td><section>需要配置</section></td></tr><tr><td><strong>调试工具</strong></td><td><section>Expo Dev Tools</section></td><td><section>Flipper/Chrome DevTools</section></td></tr><tr><td><strong>simulator 调试</strong></td><td><section>支持</section></td><td><section>不支持</section></td></tr><tr><td><strong>支持 web</strong></td><td><section>支持</section></td><td><section>不支持</section></td></tr><tr><td><strong>构建部署</strong></td><td><section>Expo Build Service</section></td><td><section>本地构建</section></td></tr><tr><td><strong>第三方库兼容性</strong></td><td><section>受 Expo SDK 限制</section></td><td><section>无限制</section></td></tr><tr><td><strong>学习曲线</strong></td><td><section>简单</section></td><td><section>中等</section></td></tr></tbody></table>

转转最终选择了 Expo-CLI + 自定义脚本的组合方案。

主要考虑以下因素：

1.  **开发效率优先**：前端开发同学的电脑配置环境不具备 Native 原生开发能力，经过验证从零搭建原生开发环境时间成本很大需要数天时间，但 Expo-CLI 在电脑本地可以直接吊起 ios-simulator 基于 Expo-Go 进行开发调试。
    
2.  **Web 兼容性**：便于兼容 web 侧代码调试与部署。由于 Expo-CLI 内置了 webpack 能力，只需将 webpack 配置文件进行自定义即可实现。
    
3.  **扩展性强**：内置能力多且扩展性强，Expo-CLI 内部同时也具备 RN-CLI 的能力，可基于内部 Metro 服务进行二次自定义开发，同时也方便鸿蒙系统侧的兼容。
    
4.  **团队协作**：降低团队学习成本，前端同学可以快速上手，减少环境配置等问题。
    

### RN 组件库的选择

在转转 RN 技术栈落地过程中，组件库的选择直接影响开发效率和用户体验。我们调研了国内外主流的 RN 组件库，并进行了详细对比分析。

#### 组件库对比分析

<table><thead><tr><th><section>组件库</section></th><th><section>类型</section></th><th><section>组件数量</section></th><th><section>维护状态</section></th><th><section>技术架构</section></th><th><section>样式定制</section></th><th><section>学习成本</section></th><th><section>社区活跃度</section></th><th><section>适用场景</section></th></tr></thead><tbody><tr><td><strong>react-native-elements</strong></td><td><section>国外开源</section></td><td><section>30+</section></td><td><section>活跃维护</section></td><td><section>基于 React Native</section></td><td><section>高度可定制</section></td><td><section>低</section></td><td><section>⭐⭐⭐⭐⭐</section></td><td><section>通用业务场景</section></td></tr><tr><td><strong>native-base</strong></td><td><section>国外开源</section></td><td><section>50+</section></td><td><section>活跃维护</section></td><td><section>基于 React Native + Styled System</section></td><td><section>主题系统</section></td><td><section>中</section></td><td><section>⭐⭐⭐⭐</section></td><td><section>复杂 UI 需求</section></td></tr><tr><td><strong>antd-mobile-rn</strong></td><td><section>国内开源</section></td><td><section>40+</section></td><td><section>活跃维护</section></td><td><section>基于 React Native</section></td><td><section>Ant Design 风格</section></td><td><section>低</section></td><td><section>⭐⭐⭐</section></td><td><section>企业级应用</section></td></tr><tr><td><strong>beeshell</strong></td><td><section>国内开源</section></td><td><section>20+</section></td><td><section>停止维护</section></td><td><section>基于 React Native</section></td><td><section>美团设计风格</section></td><td><section>中</section></td><td><section>⭐</section></td><td><section>历史项目</section></td></tr></tbody></table>

#### 详细特性对比

<table><thead><tr><th><section>特性维度</section></th><th><section>react-native-elements</section></th><th><section>native-base</section></th><th><section>antd-mobile-rn</section></th><th><section>beeshell</section></th></tr></thead><tbody><tr><td><strong>组件丰富度</strong></td><td><section>基础组件齐全</section></td><td><section>组件最丰富</section></td><td><section>企业级组件</section></td><td><section>组件较少</section></td></tr><tr><td><strong>样式系统</strong></td><td><section>灵活的主题定制</section></td><td><section>强大的主题系统</section></td><td><section>固定设计语言</section></td><td><section>简单样式</section></td></tr><tr><td><strong>TypeScript 支持</strong></td><td><section>完整支持</section></td><td><section>完整支持</section></td><td><section>完整支持</section></td><td><section>部分支持</section></td></tr><tr><td><strong>文档质量</strong></td><td><section>优秀</section></td><td><section>良好</section></td><td><section>优秀</section></td><td><section>一般</section></td></tr><tr><td><strong>性能表现</strong></td><td><section>良好</section></td><td><section>中等</section></td><td><section>良好</section></td><td><section>一般</section></td></tr><tr><td><strong>包体积</strong></td><td><section>较小</section></td><td><section>较大</section></td><td><section>中等</section></td><td><section>较小</section></td></tr><tr><td><strong>定制化能力</strong></td><td><section>高</section></td><td><section>高</section></td><td><section>中等</section></td><td><section>低</section></td></tr><tr><td><strong>与 Vue 组件对齐</strong></td><td><section>容易对齐</section></td><td><section>较难对齐</section></td><td><section>较难对齐</section></td><td><section>容易对齐</section></td></tr></tbody></table>

#### 转转选择的方案

基于以下关键因素，转转最终选择了**基于 react-native-elements 二次开发**的方案：

**1. 技术架构匹配度**

*   与转转现有 zzui 组件库（基于 Vant 二次开发）的架构理念一致
    
*   支持灵活的定制化，便于与现有设计系统对齐
    
*   组件 API 设计简洁，学习成本低
    

**2. 业务场景适配**

*   组件覆盖度满足转转业务需求
    
*   样式定制灵活，便于实现转转品牌风格
    
*   性能表现良好，适合移动端场景
    

**3. 开发效率考虑**

*   文档完善，开发体验好
    
*   社区活跃，问题解决及时
    
*   与 Vue 技术栈 zzui 组件迁移成本低 (方便 AI 理解)
    

通过这种设计，转转 RN 组件库既保证了基础组件的稳定性，又满足了 RN 场景自定义需求，为 Vue 到 RN 的技术栈迁移提供了强有力的支撑。

主要技术方案介绍
--------

转转 RN 整体架构图:

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNico7wV7BztqR75XHyeBm4Jt2ELoO6nkJSMicQzo82OSBXZtEsbyFK6vcNcg4Y2TkD9yMrMpE5rdHsA/640?wx_fmt=png&from=appmsg#imgIndex=2)转转 RN 容器整体架构

### bundle 打包与拆分

转转 RN 项目采用了多包拆分策略，将整个应用拆分为基础包 (common) 和业务包 (buz) 两部分，以优化加载性能和减少重复代码。

#### 1. RN bundle 的打包原理

React Native 的打包过程基于 Metro 打包器，主要包含以下步骤：

**打包流程：**

1.  **依赖分析**：Metro 从入口文件开始，递归分析所有依赖关系
    
2.  **模块转换**：将 ES6 + 代码转换为目标平台可执行的 JavaScript 代码
    
3.  **模块 ID 分配**：为每个模块分配唯一 ID，支持多包拆分
    
4.  **代码合并**：将所有模块合并为单个 bundle 文件
    
5.  **资源处理**：处理图片、字体等静态资源
    

**自定义打包策略：**

*   使用自定义的`createModuleIdFactory`为模块分配稳定的 SHA256 哈希 ID
    
*   通过 metro 钩子函数 `processModuleFilter` 实现模块的精确过滤和拆分
    
*   支持开发模式和生产模式的不同打包策略
    

```
// 模块ID生成策略function getModuleId(projectRootPath, modulePath) {let startIndex = modulePath.indexOf(projectRootPath);let pathRelative = modulePath.substr(startIndex + projectRootPath.length + 1);returnString(SHA256(pathRelative)); // 使用SHA256确保ID稳定性}// moduleId Map 生产function createModuleIdFactoryWrap(projectRootPath, ...bundles) {console.log('----------createModuleIdFactoryWrap', projectRootPath);return() => {    return(path) => {      let moduleId = getModuleId(projectRootPath, path);      let jsItem = path + ' ---> ' + moduleId;      if ('base' == bundles[0]) {        if (!baseNameArray.includes(jsItem)) {          baseNameArray.push(jsItem);          fs.writeFileSync(            __dirname + pathSep + 'map' + pathSep + 'baseNameMap.json',            JSON.stringify(baseNameArray),          );        }      } else {        if (!pageNameArray.includes(jsItem)) {          pageNameArray.push(jsItem);          fs.writeFileSync(            __dirname + pathSep + 'map' + pathSep + 'pageNameMap.json',            JSON.stringify(pageNameArray),          );        }      }      return moduleId;    };  };}
```

#### 2. IOS / Android / Harmony 三端打包配置

转转支持三端统一打包，通过不同的 Metro 配置文件实现平台差异化处理：

**配置文件结构：**

```
├── metro.config.js          # 开发环境配置├── all.metro.config.js      # IOS/Android 全量打包配置├── base.metro.config.js     # IOS/Android common 基础包配置├── page.metro.config.js     # IOS/Android buz 业务包配置├── harmony.metro.config.js  # 鸿蒙全量打包配置├── harmony.base.metro.config.js   # 鸿蒙 common 基础包配置├── harmony.page.metro.config.js   # 鸿蒙 buz 基础包配置└── scripts/    ├── android/             # Android平台配置脚本     ├── ios/                 # iOS平台配置脚本    └── harmony/             # 鸿蒙平台配置脚本    └── build.js             # IOS/Android/Harmony三端构建脚本    └── base.js              # 基础包入口    └── page.js              # 业务包入口    └── build-web.js/        # web构建脚本
```

**三端打包命令：**

```
# iOS平台npm run build:ios:bundle:minify# Android平台  npm run build:android:bundle:minify# 鸿蒙平台npm run build:harmony:bundle:minify
```

**平台差异化处理：**

*   **iOS/Android**：使用标准的`react-native bundle`命令
    
*   **鸿蒙**：使用`react-native bundle-harmony`命令，支持鸿蒙特有的 API
    
*   **资源处理**：各平台使用不同的资源目录结构
    
*   **模块 ID 映射**：每个平台维护独立的模块 ID 映射文件
    

#### 3. 打包产物的 common 与 buz 拆分

转转采用双包架构，将应用拆分为基础包和业务包：

**基础包 (common bundle)：**

*   **包含内容**：React、React Native 核心库、常用第三方库
    
*   **文件位置**：`dist-common-bundle/{platform}/common.{platform}.bundle`
    
*   **入口文件**：`scripts/base.js`
    
*   **更新频率**：基本不更新，跟随 APP 内置 RN 主版本升级
    

```
// base.js - 基础包入口import'react'import'react-native'import'@react-native-async-storage/async-storage'import'react-native-safe-area-context'import'react-native-svg'import'lottie-react-native'import'react-native-render-html'import'@sentry/react-native'// ... 其他基础库
```

**业务包 (buz bundle)：**

*   **包含内容**：业务组件、页面逻辑、业务相关第三方库
    
*   **文件位置**：`dist/{platform}/buz.${hash}.{projectName}.{platform}.bundle`
    
*   **入口文件**：`scripts/page.js`
    
*   **更新频率**：高频更新，支持热更新
    

```
// page.js - 业务包入口import { AppRegistry } from 'react-native';import App from '../App';AppRegistry.registerComponent(appName, () => App);
```

**拆分策略优势：**

1.  **减少重复加载**：基础包只需下载一次，所有业务包可共享
    
2.  **提升加载速度**：业务包体积小，首次加载更快
    
3.  **支持热更新**：业务包可独立更新，不影响基础包
    
4.  **缓存优化**：基础包长期缓存 App 内 + 业务包自定义策略缓存 App 内，提升用户体验
    

**拆包构建时模块过滤机制：**

```
// 业务包打包时过滤掉基础包已包含的模块function postProcessModulesFilterWrap(projectRootPath) {return(module) => {    const moduleId = getModuleId(projectRootPath, module.path);    let jsItem = module.path + ' ---> ' + moduleId;        // 如果模块已在基础包中，则从业务包中过滤掉    if (baseNameArray.includes(jsItem)) {      returnfalse;    }    returntrue;  };}
```

#### 4. 客户端侧的 bundle 加载流程

转转客户端采用分层加载策略，确保基础包优先加载完成后再加载业务包：

**加载时序：**

1.  **基础包预加载**：应用启动时优先加载 common bundle
    
2.  **基础包验证**：检查基础包加载状态和完整性
    
3.  **业务包加载**：基础包就绪后加载对应的业务包
    
4.  **组件注册**：业务包加载完成后注册 RN 组件
    

**加载流程代码示例：**

```
// 基础包加载完成标记global.__BASE_BUNDLE_LOADED__ = true;// 业务包加载时检查基础包状态console.log('common 包是否已经加载完成', global.__BASE_BUNDLE_LOADED__);
```

**客户端加载策略：**

*   **预加载机制**：在用户进入 RN 页面前预加载基础包
    
*   **缓存策略**：基础包长期缓存，业务包自定义策略缓存
    
*   **降级处理**：加载失败时自动降级到异常重试页或 WebView 容器
    
*   **性能监控**：记录各阶段加载时间，优化加载性能
    

**多包协调机制：**

*   通过全局变量`__BASE_BUNDLE_LOADED__`标记包加载状态
    
*   使用统一的模块 ID 确保包间依赖关系正确
    
*   实现包的原子性加载，避免部分加载导致的错误
    

这种双包架构设计既保证了加载性能，又提供了良好的热更新能力，为转转 RN 技术的落地提供了坚实的技术基础。

### RN 热更新

相比原生 APP 迭代需求需要发版本、应用市场审核才能上架新功能, RN 项目天然支持 bundle 下载更新机制显得更受欢迎。 业务代码发布后的动态更新而无需发布 App 版本更新。

当然了, RN bundle 热更新方案在业内已经较成熟, 主流的热更新方案有:  Code Push、 Pushy、 自研。

由于转转内部已经有成熟的 webview  离线包的更新服务方案, 因此转转 app 可以基于此服务进行低成本的开发自研来实现  RN bundle 的热更新能力。

bundle 热更新全流程如下图所示:

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNico7wV7BztqR75XHyeBm4JtkpcSuLZIAT7kcm7945QBCQIFMicI7eLC4IltGd77B6atuH5O4xckqZw/640?wx_fmt=png&from=appmsg#imgIndex=3)更新全流程

新版本业务 bundle 更新流程如下图所示, 每次打开 App 、打开 RN 页面、App 后台切换前台都会进行版本配置拉取操作:

![](https://mmbiz.qpic.cn/mmbiz_jpg/T81bAV0NNNico7wV7BztqR75XHyeBm4JtQbtNmwderxIhIZh2hxibKCqyK7ZiaibnpkEDeGlmO6h3UeegJX8gSC39Q/640?wx_fmt=other&from=appmsg#imgIndex=4)bundle 更新流程

### 前端工程结构定义

对于项目 - 页面 - bundle-RN 视图之间的关系如何处理, 直接关系到了项目结构规范以及 RN 页面统跳规范如何设计. 由于转转前端侧的内部项目结构大体上为一个 git 项目中存在多个路由页面, 然后根据页面路由来进行单个 webview 容器承接的方式.

因此 在设计 RN 页面组织形式时也沿用了该形式, 主要有以下几点因素:

1.  方便 web 代码到 RN 的迁移, 便于借助 AI 能力, 便于工程管理
    
2.  单个 bundle 可承接多个页面, 减少不必要的 bundle 储存空间资源
    
3.  沿用历史的原生页面栈管理形式, 减少兼容成本且不用原生兼容 RN-Navigation 依赖库
    

整体 RN 前端项目工程结构方案如下图所示:

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNico7wV7BztqR75XHyeBm4JtcBibRLcrdicCGy3Ajf6ms44h2FhsxVCUDVeBc96Liaib58vbzQwVeZBhLg/640?wx_fmt=png&from=appmsg#imgIndex=5)前端 RN 项目工程结构

### 如何开发调试

上面也提到了, 为了便于前端开发同学快速上手开发业务, 转转选择了 Expo-CLI + 自定义脚本方案实现开发调试。

整体调试方案如下图所示:

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNico7wV7BztqR75XHyeBm4JtEFVoznsw9tiatbSsLpqJnwkOE3w2H2CwlepxEmFM75L5kmo2tfh3azQ/640?wx_fmt=png&from=appmsg#imgIndex=6)RN 项目调试方案

虽然 Expo CLI 在开发阶段有原生能力限制，但我们通过以下方案解决：

1.  **本地开发阶段**：使用 Expo Go 进行快速开发和 UI 调试
    
2.  **真机开发自测阶段**：通过真机基于转转 APP 进行原生能力调试
    
3.  **测试阶段**：通过真机基于转转 APP 进行原生能力测试
    

```
// 原生能力检测和降级处理import { isExpoGo } from '@/utils';// 根据环境选择不同的实现, 在本地模拟器环境可以走Mock避免页面crashexport const nativeModule = isExpoGo   ? mockNativeModule  // Expo Go环境使用Mock  : realNativeModule; // 真机环境使用真实模块
```

### 异常监控

由于历史原因, 转转 App 端内的的监控有两套体系, 客户端原生侧主要采用的商业化的某云监控方案, 前端侧主要采用开源的 Sentry 监控方案。基于前期开发成本考虑, 在 RN 容器内还沿用了该套方案。

Sentry 监控代码如下:

```
import * as Sentry from"@sentry/react-native";// Sentry.init({    dsn: "https://XXX@sentry.zhuanzhuan.com/2298",    tracesSampleRate: 1, //    beforeSend: (event) => {      event.extra = {        ...event.extra,        pageParams: getPageParams(),        backup: defaultBackup(),      }      return event;    },})// 全局错误处理ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {    logRNInfo('ErrorUtils.setGlobalHandler error isFatal', error, isFatal);    Sentry.captureException(error, {        level: 'error'    })    if (isFatal) {        // 自定义的全屏错误提示, 显示兜底 UI    }})
```

对应相关内部实现原理可自行查阅`@sentry/react-native` 源码

* * *

当然了, 除了上述提到的核心方案设计, 还有一些列客户端原生侧的核心方案设计, 比如 RN 原生侧各种异常落地处理机制; 性能优化相关的 RN 容器预热技术、 common bundle 预加载、业务页面视图的预渲染技术; RN 异常奔溃治理等等等等, 由于篇幅原因这里不一一展开, 后面会在 [客户端篇] 文章进行详细介绍。

AI 赋能 Vue 转 RN
--------------

为了助力转转 RN 容器技术方案的落地, 如何低成本的将已有移动端 webview 项目（Vue2）迁移到跨平台的 ReactNative 技术栈是一项不小的挑战。 下面深入探讨如何利用 AI 辅助完成这一转换过程，重点阐述两种框架的差异与映射关系、依赖库的转换、AI 提示词的优化、以及通过具体案例展示转换的有效性。

### 1. 两种框架之间的差异与能力的映射转化关系

Vue2 和 React Native 在设计哲学、组件模型、数据流和渲染机制上存在本质差异。理解这些差异并建立映射关系，是让 AI 成功迁移代码的第一步。

<table><thead><tr><th><section>特性</section></th><th><section>Vue 2</section></th><th><section>React Native</section></th><th><section>转换映射关系</section></th></tr></thead><tbody><tr><td><strong>核心定位</strong></td><td><section>用于构建用户界面的渐进式 JavaScript 框架，主要面向 Web。</section></td><td><section>使用 React 构建原生移动应用的框架。</section></td><td><section>Vue 组件需要被转换为 React Native 组件，并且需要理解从 Web DOM 到原生 UI 的转变。</section></td></tr><tr><td><strong>组件语法</strong></td><td><section>单文件组件 (<code>.vue</code>)，包含 HTML 模板、JavaScript 逻辑和 CSS 样式。</section></td><td><section>使用 JSX 语法，将 UI 结构和逻辑写在 JavaScript 中。</section></td><td><section>AI 需要理解<code>.vue</code>文件的结构，并将其模板部分转换为 JSX 语法，<code>&lt;script&gt;</code>部分转换为 React 组件的逻辑。</section></td></tr><tr><td><strong>数据绑定</strong></td><td><section>支持双向数据绑定 (<code>v-model</code>) 和单向数据流。</section></td><td><section>严格遵循单向数据流，通过<code>state</code>和<code>props</code>管理数据。</section></td><td><section>Vue 的<code>v-model</code>需要被显式地转换为由<code>useState</code>管理的<code>value</code>和<code>onChangeText</code>事件处理。</section></td></tr><tr><td><strong>生命周期</strong></td><td><section>拥有一套完整的生命周期钩子，如<code>created</code>,&nbsp;<code>mounted</code>,&nbsp;<code>updated</code>,&nbsp;<code>destroyed</code>等。</section></td><td><section>React 组件有类似的生命周期，如<code>useEffect</code>钩子可以模拟<code>componentDidMount</code>,&nbsp;<code>componentDidUpdate</code>, 和<code>componentWillUnmount</code>。</section></td><td><section>AI 需要将 Vue2 的生命周期钩子映射到<code>useEffect</code>的不同依赖项和清理函数中。</section></td></tr><tr><td><strong>样式</strong></td><td><section>使用标准的 CSS 或预处理器如 Sass/Less，支持作用域 CSS。</section></td><td><section>使用 JavaScript 对象定义样式 (CSS-in-JS)，属性名采用驼峰式命名。</section></td><td><section>AI 需将 CSS 语法转换为 React Native 的 StyleSheet 对象格式。</section></td></tr><tr><td><strong>路由</strong></td><td><section>使用<code>vue-router</code>进行页面导航。</section></td><td><section>主流使用<code>React Navigation</code>库进行屏幕间的导航。</section></td><td><section>路由配置和导航 API 需要进行完全的转换，AI 可以辅助生成<code>React Navigation</code>的导航栈和路由配置。</section></td></tr><tr><td><strong>状态管理</strong></td><td><section>官方推荐使用<code>Vuex</code>进行集中式状态管理。</section></td><td><section>可选用<code>Redux</code>、<code>MobX</code>或 React 内置的<code>Context API</code>等方案。</section></td><td><code>Vuex</code><section>中的<code>state</code>,&nbsp;<code>mutations</code>,&nbsp;<code>actions</code>,&nbsp;<code>getters</code>需要被映射为<code>Redux</code>的<code>store</code>,&nbsp;<code>reducers</code>,&nbsp;<code>actions</code>或<code>Context API</code>的<code>Provider</code>和<code>useContext</code>。</section></td></tr></tbody></table>

### 2. 依赖组件库的转化, 上下文知识库能力完善提升转化 RN 代码的可用性

在迁移过程中，直接转换这些 Vue2 的 ZZUI 组件库的代码是不可行的。此时，准确的组件转换并且提供足够的 AI 知识库能力来保证转换后代码可用性就显得尤为重要。

**策略：**

1.  **建立映射知识库:** 在开始转换前，可以预先为 AI 提供一个 UI 库的映射关系表。
    

*   **ZZUI** -> **React Native Elements**
    

2.  **提供明确上下文:** 在转换包含特定 UI 组件的 Vue 代码时，在提示词中明确告知 AI 这种映射关系、知识库, 并且明确的表明要实现什么样的能力。
    
3.  **由下向上分步转换:** 在转换过程中, 先将依赖组件库的原子组件转换完成并验证各个原子组件的可用性, 再以转换后的原子组件作为上下文知识库进一步转换业务页面的组件, 再次验证业务组件的可用性, 可大大提高转换后整个业务项目的代码可用性.
    

**示例提示词 1 (UI 库转换):**

```
# BUTTON 组件迁移（VUE转RN）## 1. 你需要熟悉一下前置知识：- 这个你需要迁移的原始vue组件 packages/button- 这个是 RN 参考基础组件 ./rne-packages/base/src/Button/## 2. 本次迁移只实现下列内容能力即可：- type="primary"type="text"type="plan"- size="small" size="large" size="normal"- :disabled=""- :style=""- 样式能力保留##  3. 生成后的产物输出到 ./new-rn-packages 文件夹目录与原生vue组件目录保持一致”
```

**示例提示词 2 (业务项目中业务组件转换):**

```
# 1. 目标与范围确认- 目标：将 m_pay_v2/src/components/ 下的原生 Vue 组件，逐步迁移为可用的 React Native 组件，放到 rn_pay/src/components/ 下，完善每个骨架组件的渲染和交互逻辑。- RN 侧实现优先复用 rn_pay/src/components-rn 下组件- 范围：仅涉及 Home 依赖的相关组件，每次只聚焦一个组件，确保迁移质量和一致性。# 迁移步骤与计划## 2.1 逐步迁移顺序建议### 建议优先顺序如下（可根据依赖关系调整）：- AlertPicker（弹窗选择器，常用于支付方式说明、确认等）- Dialog（通用弹窗，配合 PageHeader/PageWrapper 使用）- PasswordInput（支付密码输入弹窗）- PartMoneyPicker / PartMoneyNotesPicker（大额分次支付弹窗及说明）- Tag（标签组件，银行卡、支付方式等依赖）- GoodsInfo（商品信息展示）- PaySucAnimate（支付成功动画弹窗）- PageWrapper（页面包裹，含头部/弹窗等）- PriceDisplay（价格展示）- Step / TimerDialog / RiskDialog（如业务需要）### 2.2 每个组件的迁移流程- 分析原 Vue 组件结构和 props/事件- 对照骨架组件，补全渲染和交互逻辑- 如有依赖原子组件，优先复用 components-rn 下已有实现- 保证 props、事件、children/slot 兼容，UI/交互一致- 每次只聚焦一个组件，完成后再进入下一个
```

**示例提示词 3 (业务 Home 页面转换):**

```
## 你需要做的事情：- 这个你需要迁移的原始vue代码（ m_pay_v2/src/views/Home/index.vue 的 zz-radio-list 标签内的内容 ）- 依赖的组件 也需要相应的转换成 RN 代码实现- rn 依赖原子组件可以参考组件库 rn_pay/src/components-rn- 保证逻辑上一致性 - 生成后的产物输出到 rn_pay/src/ 内，文件名称与原始文件保持一致， 依赖的组件输出到 rn_pay/src/components ， home 页面输出到 rn_pay/src/pages/home/Home.tsx
```

通过这种方式，我们可以利用 AI 的外部知识和我们提供的完备上下文信息以及分步转换策略，引导其使用 React Native 生态中功能对等的组件库，从而极大提升转换后代码的可用性和一致性。

### 3. 提示词的合理书写保证 RN 项目的业务逻辑以及功能完整性

AI 转换代码的质量高度依赖于提示词（Prompt）的质量。一个优秀、精确的提示词能够确保转换后的 React Native 代码不仅语法正确，更能完整保留原始 Vue2 项目的业务逻辑和功能。

**有效提示词的关键要素：**

*   **明确角色和任务:** 指示 AI 扮演一个 “精通 Vue2 和 React Native 的专家开发者”，任务是 “将以下 Vue2 组件代码转换为 React Native”。
    
*   **提供完整上下文:** 粘贴完整的 Vue2 组件代码，包括`<template>`, `<script>`和`<style>`部分。
    
*   **指定技术栈和版本:** 明确指出目标是 “React Native”，并可指定使用的特定库，如 “使用 Redux Toolkit 进行状态管理”。
    
*   **详细说明转换规则:**
    

*   **组件映射:** " 将 Vue 的`<template>`转换为 React Native 的 JSX，使用`<View>`, `<Text>`, `<TextInput>`等核心组件。"
    
*   **数据绑定:** " 将`v-model`转换为使用`useState`管理的`value`和`onChangeText`属性。"
    
*   **生命周期:** " 将`mounted`钩子中的逻辑放在`useEffect`的空依赖数组中执行。"
    
*   **方法处理:** " 将`methods`中的函数转换为 React 组件内部的函数。"
    
*   **样式转换:** " 将`<style>`中的 CSS 转换为 React Native 的`StyleSheet.create`对象。"
    

*   **要求代码质量和注释:** "请确保转换后的代码格式清晰，并为关键逻辑添加注释，解释转换的思路。"
    

### 4. 典型例子代码对比

下面通过几个典型的例子，直观地展示在良好提示词的引导下，AI 如何高效地将 Vue2 代码转换为高质量的 React Native 代码。

#### 示例 1：简单的表单输入与提交

**Vue2 原始代码:**

```
<template>  <div class="form-container">    <input v-model="username" placeholder="Username" class="input-field" />    <button @click="login">Login</button>  </div></template><script>export default {  data() {    return {      username: ''    };  },  methods: {    login() {      if (this.username) {        alert(`Welcome, ${this.username}`);      }    }  }};</script><style>.form-container { margin: 10px; }.input-field { border: 1px solid #ccc; padding: 8px; }</style>
```

**AI 转换后的 React Native 代码:**

```
import React, { useState } from'react';import { View, TextInput, Button, StyleSheet, Alert } from'react-native';const LoginScreen = () => {const [username, setUsername] = useState('');const handleLogin = () => {    if (username) {      Alert.alert('Login Success', `Welcome, ${username}`);    }  };return (    <View style={styles.formContainer}>      <TextInput        style={styles.inputField}        value={username}        onChangeText={setUsername}        placeholder="Username"      />      <Button title="Login" onPress={handleLogin} />    </View>  );};const styles = StyleSheet.create({formContainer: {    margin: 10,  },inputField: {    borderWidth: 1,    borderColor: '#ccc',    padding: 8,    marginBottom: 10,  },});exportdefault LoginScreen;
```

**分析:** AI 成功地将`data`转换为`useState`，`v-model`分解为`value`和`onChangeText`，`@click`事件转换为`onPress`，`alert`转换为`Alert.alert`，并且 CSS 被正确转换为`StyleSheet`对象。代码可直接运行且逻辑完整。

#### 示例 2：列表渲染与条件展示

**Vue2 原始代码:**

```
<template>  <div>    <ul v-if="items.length > 0">      <li v-for="item in items" :key="item.id">{{ item.name }}</li>    </ul>    <p v-else>No items found.</p>  </div></template><script>export default {  props: {    items: {      type: Array,      default: () => []    }  }};</script>
```

**AI 转换后的 React Native 代码:**

```
import React from'react';import { View, Text, FlatList, StyleSheet } from'react-native';const ItemList = ({ items = [] }) => {if (items.length === 0) {    return (      <View style={styles.container}>        <Text>No items found.</Text>      </View>    );  }return (    <FlatList      style={styles.container}      data={items}      renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}      keyExtractor={item => item.id.toString()}    />  );};const styles = StyleSheet.create({container: {    flex: 1,    padding: 10,  },item: {    padding: 10,    fontSize: 18,    borderBottomWidth: 1,    borderBottomColor: '#eee',  },});exportdefault ItemList;
```

**分析:** AI 不仅转换了`v-for`为高性能的`FlatList`组件，还正确处理了`v-if`/`v-else`的条件渲染逻辑。同时，它将 Vue 的`props`定义转换为了 React 的函数组件参数解构和默认值，代码非常地道和高效。

### 结论

实践证明，利用 AI 辅助进行 Vue2 到 React Native 的项目迁移是完全可行的，并且能够大幅提升开发效率。其成功的关键在于：

1.  **深刻理解框架差异:** 开发者需要对两种框架的核心差异有清晰的认识，以便更好地引导 AI。
    
2.  **精通提示词工程:** 通过编写具体、结构化且包含丰富上下文的提示词，可以显著提高 AI 生成代码的质量和可用性。
    
3.  **善用 AI 知识库:** 结合内外部知识和自定义的映射规则，指导 AI 处理复杂的依赖库转换问题。
    

虽然 AI 不能完全替代开发者进行思考和决策，但作为一个强大的辅助工具，它能够将开发者从大量重复、模式化的代码转换工作中解放出来，让我们更专注于架构设计、性能优化和业务逻辑的实现，最终以更低的成本、更快的速度完成技术栈的现代化迁移。

线上效果对比
------

<table><thead><tr><th><section><br></section></th><th><section>旧 webview</section></th><th><section>RN</section></th><th><section>原生</section></th><th><section>效果对比</section></th></tr></thead><tbody><tr><td><section>业务侧转化率数据</section></td><td><section>41%</section></td><td><section>45%</section></td><td><section>-</section></td><td><section>⬆️</section></td></tr><tr><td><section>性能侧页面可用时间 (自定义打点)</section></td><td><section>2137ms</section></td><td><section>842ms</section></td><td><section>-</section></td><td><section>⬆️</section></td></tr><tr><td><section>热更新能力</section></td><td><section>✅</section></td><td><section>✅</section></td><td><section>❌</section></td><td><section>-</section></td></tr><tr><td><section>用户体验</section></td><td><section>一般</section></td><td><section>好</section></td><td><section>好</section></td><td><section>⬆️</section></td></tr></tbody></table>

展望
--

虽然, 转转 React Native 容器已经完成从零到一的探索以及建设, 某种程度上提升了用户体验、 赋能了业务价值。 但是 依然存在着很多待完善的点, 比如: 端差异性问题以及对应兼容方案的完善与沉淀; 相关基础能力建设需要进一步完善提升业务开发 / 接入效率; RN 异常错误的归纳、分级以便于进行对应的兜底处理, 形成体系化方案; AI 赋能代码转换、需求代码实现 Agent 的开发与完善等等。

最后, 感谢客户端组同学、工程效率组同学、以及所有支持并推动该项目落地的所有同学, 还要感谢 AI 大模型, 让没有任何 RN 经验的新手能摸着过河, 没有你们的支持该项目很难在几个月内就顺利落地并赋能业务。