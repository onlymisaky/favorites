> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ni5RFn2Eqz9aOOQGfQ64nA)

> ❝
> 
> 🚀 **「插播一条」**：欢迎来到 **「不做工具人：从 0 到 1 手搓前端监控 SDK」** 专栏！这是咱们的第一站。
> 
> （悄悄说一句，**「第二站：用户行为监控」** 也已经发车啦！想知道怎么统计 PV、UV 的同学可以先收藏哦）
> 
> ❞

> ❝
> 
> 你是否一直对前端错误监控系统的底层原理充满好奇？
> 
> 想知道那些 “黑科技” 是如何拦截报错、上报数据的吗？
> 
> 与其只做工具的使用者，不如深入底层，探寻其背后的实现机制。
> 
> 本文将从原理角度切入，手把手带你设计并实现一个**「轻量级、功能完备的前端错误监控 SDK」**
> 
> ❞

学习完本文，你将收获什么？
-------------

通过手写这个 SDK，你不仅能获得一个可用的监控工具，更能深入掌握以下核心知识点：

1.  **「浏览器底层原理」**：事件冒泡 / 捕获机制，以及 `onerror`、`unhandledrejection` 等 API 的工作细节。
    
2.  **「AOP 面向切面编程」**：学会如何通过劫持（Hook）原生方法（如 `XMLHttpRequest`、`fetch`）来实现无感监控。
    
3.  **「高可靠数据上报」**：掌握 `Navigator.sendBeacon` 的使用场景，确保在页面卸载时也能稳定上报数据。
    
4.  **「工程化实践」**：从架构设计到 NPM 发布，体验完整的 SDK 开发全流程。
    

1. 架构设计
-------

别被 “监控系统” 这四个字吓到了。拆解下来，核心逻辑就三步：**「监听 -> 收集 -> 上报」**。

在开始编码之前，我们先梳理一下 SDK 的整体架构。我们需要监控 **「JS 运行时错误」**、**「网络请求错误」** 以及 **「资源加载错误」**，并将这些数据统一格式化后上报到服务端。

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtpLFnJf9T0vxLwibOdN5QvPedaZpFsvmJhSiakib6KAFJBkK4zYpf3ic61xia1Iribgv60bW5Wvj9lcyQA/640?wx_fmt=other&from=appmsg#imgIndex=0)

### 项目结构

为了保持代码的模块化和可维护性，我们采用以下目录结构：

```
error-monitor/
├── dist/                # 打包产物
├── src/                 # 源码目录
│   ├── index.ts         # 入口文件
│   ├── errorHandler.ts  # JS 错误捕获
│   ├── networkMonitor.ts# 网络请求监控
│   ├── resourceMonitor.ts# 资源加载监控
│   ├── sender.ts        # 上报逻辑
│   └── utils.ts         # 工具函数
├── test/                # 测试靶场
│   ├── server.js        # 本地测试服务
│   └── index.html       # 错误触发页面
├── package.json         # 项目配置
├── rollup.config.js     # Rollup 打包配置
├── tsconfig.json        # TypeScript 配置
└── README.md
```

错误监控源码在 `src`目录下 ，最终使用`rollup`对代码进行打包，`dist`是打包产物 ； `test`目录下是对打包产物的测试：能否拦截 JS / 请求 / 资源错误，能否稳妥上报。现在就从 0 到 1 开干，做个 mini 版的错误监控 SDK

🚀 _**「浏览项目的完整代码及示例可以点击这里 https://github.com/Teernage/error-monitor ，如果对您有帮助欢迎 Star。」**_

2. 核心实现详解
---------

### 2.1 SDK 初始化入口 (`index.ts`)

SDK 的入口主要负责接收配置（如上报地址、项目名称）并启动各个监控模块。

```
// src/index.ts
import { monitorJavaScriptErrors } from './errorHandler';
import { monitorNetworkErrors } from './networkMonitor';
import { monitorResourceErrors } from './resourceMonitor';

interface ErrorMonitorConfig {
  reportUrl: string; // 上报接口地址
  projectName: string; // 项目标识
  environment: string; // 环境 (dev/prod)
}

export const initErrorMonitor = (config: ErrorMonitorConfig) => {
  const { reportUrl, projectName, environment } = config;

  // 启动三大监控模块
  monitorJavaScriptErrors(reportUrl, projectName, environment);
  monitorNetworkErrors(reportUrl, projectName, environment);
  monitorResourceErrors(reportUrl, projectName, environment);
};
```

### 2.2 全局异常捕获 (`errorHandler.ts`)

这是错误监控的 “基本盘”。浏览器中的 JavaScript 错误主要分为两类，必须“兵分两路” 进行拦截：

1.  同步运行时错误, 这是最经典的错误类型（比如 undefined is not a function ）。 我们使用老牌的 **「window.onerror」**进行捕获。它虽然古老，但依然是获取错误行号、列号和堆栈信息最直接、兼容性最好的方式。
    
2.  随着 **「async/await」** 的普及，未被 **「catch」**的 Promise 错误越来越常见。这部分错误 **「不会」** 触发 **「onerror」**，需要通过监听 **「unhandledrejection」**事件来捕获。
    

**「一句话总结」**

*   onerror 抓同步， unhandledrejection 抓异步；两条线一起上，漏报率直降。
    

**「关键原则」**：不破坏原有逻辑

监控 SDK 的定位永远是 “旁听者”，绝不能 “反客为主”。它不能改变页面原本的错误处理结果、不该屏蔽控制台的报错输出、更不该影响其他第三方库的行为。

所以在实现时，要遵守以下三点：

1.  优先使用 addEventListener 能用事件监听就别直接赋值覆盖。通过 window.addEventListener('unhandledrejection', ...) 可以形成 “链式处理”，让你的监控和其他逻辑并存，大家都能收到通知，互不打架。
    
2.  劫持必须 “有借有还” 如果必须劫持 window.onerror （或者 window.onunhandledrejection ），一定要 先保存原有的回调函数 。在执行完你的上报逻辑后， 必须 把控制权交还给原回调，并且返回值。如果你随手返回了 true ，控制台的红字报错就被你吞掉了，这会让调试变得非常痛苦。
    

```
// src/errorHandler.ts
import { sendErrorData } from './sender';

export const monitorJavaScriptErrors = (
  reportUrl: string,
  projectName: string,
  environment: string
) => {
  // 1. 捕获 JS 运行时错误
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const errorInfo = {
      type: 'JavaScript Error',
      message,
      source,
      lineno,
      colno,
      stack: error ? error.stack : null,
      projectName,
      environment,
      timestamp: new Date().toISOString(),
    };
    sendErrorData(errorInfo, reportUrl);

    // 关键点：如果原来有 onerror 处理函数，继续执行它，避免覆盖用户逻辑
    // 这样做是为了不破坏宿主环境（例如用户自己写的或其他 SDK）已有的错误处理逻辑
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
  };

  // 2. 捕获未处理的 Promise Rejection
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const errorInfo = {
      type: 'Unhandled Promise Rejection',
      message: event.reason?.message || event.reason,
      stack: event.reason?.stack,
      projectName,
      environment,
      timestamp: new Date().toISOString(),
    };
    sendErrorData(errorInfo, reportUrl);

    // 关键点：执行原有的 Promise 错误处理逻辑
    // 这样做是为了不破坏宿主环境（例如用户自己写的或其他 SDK）已有的错误处理逻辑
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event);
    }
  };
};
```

### 2.3 网络请求监控 (`networkMonitor.ts`)

接口监控是监控的难点，因为浏览器**「并没有」**提供一个全局的 `onNetworkError` 事件。

**「解决方案」**：AOP（面向切面编程）重写

简单来说，就是把原生的方法 “包” 一层：在请求发出前 / 响应返回后，插入我们的监控代码，然后再执行原有的逻辑。这样业务代码完全无感知，而我们却能拿到所有的请求细节。

**「难点与细节：」**

1.  Fetch 的特殊性 ： fetch 在遇到 HTTP 4xx/5xx 错误码时 不会 reject （不会抛出异常），只有在网络断开或 DNS 解析失败时才会 reject。因此我们需要手动检查 response.ok 。
    
2.  死循环防护 ：监控 SDK 自身的上报请求（ reportUrl ）必须被排除，否则 “上报失败” 会触发“新的上报”，导致无限递归，瞬间打挂服务器。
    

```
// src/networkMonitor.ts
export const monitorNetworkErrors = (
  reportUrl: string,
  projectName: string,
  environment: string
) => {
  // 1. 劫持 XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...args: any[]
  ) {
    // 关键点：排除上报接口自身的请求，防止死循环
    const urlStr = typeof url === 'string' ? url : String(url);
    if (urlStr.includes(reportUrl)) {
      return originalXhrOpen.apply(this, [method, url, ...args] as any);
    }

    // 监听 error 事件
    this.addEventListener('error', () => {
      sendErrorData(
        {
          type: 'Network Error',
          message: `Request Failed: ${method} ${url}`,
          projectName,
          environment,
        },
        reportUrl
      );
    });
    return originalXhrOpen.apply(this, [method, url, ...args] as any);
  };

  // 2. 劫持 Fetch
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    // 关键点：排除上报接口自身的请求，防止死循环
    const urlStr = (input instanceof Request) ? input.url : String(input);
    if (urlStr.includes(reportUrl)) {
      return originalFetch(input, init);
    }

    try {
      const response = await originalFetch(input, init);
      if (!response.ok) {
        sendErrorData(
          {
            type: 'Fetch Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: input instanceof Request ? input.url : input,
            projectName,
            environment,
          },
          reportUrl
        );
      }
      return response;
    } catch (error) {
      // 网络故障等无法发出请求的情况
      sendErrorData(
        {
          type: 'Fetch Error',
          message: `Fetch Failed: ${input}`,
          projectName,
          environment,
        },
        reportUrl
      );
      throw error;
    }
  };
};
```

### 2.4 资源加载监控 (`resourceMonitor.ts`)

这里有一个常见的误区：很多人认为 window.onerror 可以捕获所有错误，但实际上它无法捕获 资源加载错误 （如 img 、 script 、 link 的 404）。

*   **「原因」**： 因为资源加载失败产生的 `error` 事件是 不冒泡 的。 `window.onerror` 机制依赖于事件冒泡到顶层窗口，因此它对资源加载错误无能为力。
    
*   **「解决方案」**： 我们必须利用 `addEventListener` 的 **「捕获阶段」** （将第三个参数设为 true ）。 虽然错误事件不冒泡，但在 捕获阶段 （事件从 window 向下传播到目标元素的过程），我们依然有机会在 window 层级拦截到这些错误。
    

我们需要专门编写一个模块，通过 window.addEventListener('error', handler, true) 并在回调中通过 event.target 过滤出 IMG 、 SCRIPT 等标签的错误。

```
// src/resourceMonitor.ts
export const monitorResourceErrors = (
  reportUrl: string,
  projectName: string,
  environment: string
) => {
  // 注意：useCapture 设置为 true，在捕获阶段处理
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement;
      // 过滤掉 window 自身的 error，只处理资源元素的 error
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT')) {
        sendErrorData(
          {
            type: 'Resource Load Error',
            message: `Failed to load ${target.tagName}: ${
              target.getAttribute('src') || target.getAttribute('href')
            }`,
            projectName,
            environment,
          },
          reportUrl
        );
      }
    },
    true // 捕获阶段
  );
};
```

### 2.5 数据上报 (`sender.ts`)

收集到错误数据后，如何发给后端？这看似简单，实则暗藏玄机。

**「痛点：页面卸载时的 “遗言” 发不出去」**

用户遇到 Bug 的第一反应往往是关闭页面。如果我们使用普通的 `fetch` 或 `XHR` 上报：

1.  **「异步请求可能会被取消」**：页面关闭时，浏览器通常会 cancel 掉所有未完成的请求。
    
2.  **「同步请求会阻塞跳转」**：虽然能强行发出去，但会卡住页面切换，严重影响体验。
    

**「救星：Navigator.sendBeacon」**

`sendBeacon` 是专门为此场景设计的 API。它有三大优势：

1.  **「可靠」**：即使页面卸载，浏览器也会在后台保证数据发送成功。
    
2.  **「异步」**：完全不阻塞页面关闭或跳转。
    
3.  **「高效」**：传输少量数据时性能极佳。
    

因此，我们的上报策略是：**「优先 `sendBeacon`，不支持则降级为 `fetch`。」**

```
// src/sender.ts
export const sendErrorData = (errorData: Record<string, any>, url: string) => {
  // 补充浏览器信息（UserAgent 等）
  const dataToSend = {
    ...errorData,
    userAgent: navigator.userAgent,
    // 还可以添加更多环境信息，如屏幕分辨率、当前 URL 等
  };

  // 优先使用 sendBeacon (异步，不阻塞，页面卸载时仍有效)
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(dataToSend)], {
      type: 'application/json',
    });
    navigator.sendBeacon(url, blob);
  } else {
    // 降级使用 fetch
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend),
    }).catch(console.error);
  }
};
```

**「💡 知识扩展：经典的 1x1 GIF 打点」**

你可能听说过用 `new Image().src = 'http://api.com/report?data=...'` 这种方式上报。这在统计 PV/UV 时非常流行，因为它兼容性极好且天然跨域。

但在**「错误监控」**场景下，通常**「不推荐」**作为主力方案。

**「核心原因正是数据量」**：

1.  **「URL 长度限制」**：GIF 打点本质是 GET 请求，数据都挂在 URL 上。浏览器对 URL 长度有限制（通常 2KB~8KB）。
    
2.  **「堆栈过长」**：一个完整的报错堆栈（Stack Trace）动辄几千字符，很容易就被浏览器截断，导致我们看不到关键的报错信息。
    

所以，对于**「体积较大」**的错误数据，走 POST 通道的 `sendBeacon` 或 `fetch` 是更稳妥的选择。

### 2.6 进阶优化：采样与缓冲，别把服务器搞崩了

如果线上出现大规模故障，成千上万的用户同时上报错误，可能会瞬间把监控服务器打挂（DDoS 既视感）。

这时候我们需要引入两个机制：

1.  **「采样 (Sampling)」**：
    

*   **「大白话」**：不要每个错误都报。比如只允许 20% 的运气不好的用户上报，剩下的忽略。这样既能发现问题，又能节省 80% 的流量。
    
*   **「实现」**：`if (Math.random() > 0.2) return;`
    

3.  **「缓冲 (Buffering)」**：
    

*   **「大白话」**：不要出一条错就发一个请求，太浪费资源。先把错误攒在数组里，凑够 10 条或者每隔 5 秒统一发一车。
    
*   **「注意」**：记得在页面卸载（关闭）时，把车上剩下的货强制发出去，别丢了。
    

3. 工程化构建配置
----------

既然是 SDK，最好的分发方式当然是发布到 NPM。这样其他项目只需要一行命令就能接入你的前端错误监控系统。

这里我们选择 **「Rollup」**对代码进行打包，因为它比 Webpack 更适合打包库（Library），生成的代码更简洁。

### 3.1 package 配置 (`package.json`)

`package.json` 不仅仅是依赖管理，它还定义了你的包如何被外部使用。配置不当会导致用户引入报错或无法获得代码提示。

```
{
  "name": "error-monitor-sdk",
  "version": "1.0.0",
  "description": "A lightweight front-end error monitoring SDK",
  "main": "dist/index.cjs.js", // CommonJS 入口
  "module": "dist/index.esm.js", // ESM 入口
  "browser": "dist/index.umd.js", // UMD 入口
  "type": "module",
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w"
  },
  "keywords": ["error-monitor", "frontend", "sdk"],
  "license": "MIT",
  "files": ["dist"], // 发布时仅包含 dist 目录
  "devDependencies": {
    "rollup": "^4.9.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@rollup/plugin-terser": "^0.4.0", // 用于压缩代码
    "typescript": "^5.3.0",
    "tslib": "^2.6.0"
  }
}
```

**「💡 关键字段解读：」**

*   **「`name`」**: 包的 “身份证号”。在 NPM 全球范围内必须唯一，发布前记得先去搜一下有没有重名。
    
*   **「入口文件 “三剑客”」**（决定了别人怎么引用你的包）：
    

*   **「`main`」**: **「CommonJS 入口」**。给 Node.js 环境或老旧构建工具（如 Webpack 4）使用的。
    
*   **「`module`」**: **「ESM 入口」**。给现代构建工具（Vite, Webpack 5）使用的。支持 Tree Shaking（摇树优化），能减小体积。
    
*   **「`browser`」**: **「UMD 入口」**。给浏览器直接通过 `<script>` 标签引入使用的（如 CDN）。
    

*   **「`files`」**: **「发布白名单」**。指定 `npm publish` 时只上传哪些文件（这里我们只传编译后的 `dist` 目录）。源码、测试代码等不需要发上去，以减小包体积。
    

### 3.2 TypeScript 配置 (`tsconfig.json`)

我们需要配置 TypeScript 如何编译代码，并生成类型声明文件（`.d.ts`），这对使用 TS 的用户非常友好。

```
{
  "compilerOptions": {
    "target": "es5", // 编译成 ES5，兼容旧浏览器
    "module": "esnext", // 保留 ES 模块语法，交给 Rollup 处理
    "declaration": true, // 生成 .d.ts 类型文件 (关键！)
    "declarationDir": "./dist", // 类型文件输出目录
    "strict": true, // 开启严格模式，代码更健壮
    "moduleResolution": "node" // 按 Node 方式解析模块
  },
  "include": ["src/**/*"] // 编译 src 下的所有文件
}
```

### 3.3 Rollup 打包配置 (`rollup.config.js`)

为了兼容各种使用场景，我们配置 Rollup 输出三种格式：

1.  **「ESM (`.esm.js`)」**: 给现代构建工具（Vite, Webpack）使用，支持 Tree Shaking。
    
2.  **「CJS (`.cjs.js`)」**: 给 Node.js 或旧版工具使用。
    
3.  **「UMD (`.umd.js`)」**: 可以直接在浏览器通过 `<script>` 标签引入，会挂载全局变量。
    

```
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts', // 入口文件
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'ErrorMonitor', // <script> 引入时的全局变量名',
      sourcemap: true,
      plugins: [terser()], // UMD 格式进行压缩体积
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
    }),
  ],
};
```

4. 发布到 NPM (保姆级教程)
------------------

### 4.1 准备工作

1.  **「注册账号」**：去 npmjs.com 注册一个账号（记得验证邮箱，否则无法发布）。
    
2.  **「检查包名」**：在 NPM 搜一下你的 `package.json` 里的 `name`，确保没有被占用。如果不幸重名，改个独特的名字，比如 `error-monitor-sdk-vip`。
    

### 4.2 终端操作三步走

打开终端（Terminal），在项目根目录下操作：

**「第一步：登录 NPM」**

```
npm login
```

*   输入命令后按回车，浏览器会弹出登录页面。
    
*   或者在终端根据提示输入用户名、密码和邮箱验证码。
    
*   登录成功后会显示 `Logged in as <your-username>`.
    
*   _注意：如果你之前切换过淘宝源，发布时必须切回官方源：`npm config set registry https://registry.npmjs.org/`_
    

**「第二步：打包代码」**

确保 `dist` 目录是最新的，不要发布空代码。

```
npm run build
```

**「第三步：正式发布」**

```
npm publish --access public
```

*   `--access public` 参数用于确保发布的包是公开的（特别是当包名带 `@` 前缀时）。
    
*   看到 `+ error-monitor-sdk@1.0.0` 字样，恭喜你，发布成功！
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtpLFnJf9T0vxLwibOdN5QvPecTYIuxCppoTMtDfjA6FfibcxlgUWibxicQeRc1vJfCEp6f70z1sQDfbA/640?wx_fmt=other&from=appmsg#imgIndex=1)

现在，全世界的开发者都可以通过 `npm install error-monitor-sdk` 来使用你的作品了！

5. 如何使用
-------

SDK 发布后，支持多种引入方式，适配各种开发场景。

### 方式 1：NPM + ES Modules (推荐)

适用于现代前端项目（Vite, Webpack, Rollup 等）。

```
# 请将 error-monitor-sdk 替换为你实际发布的包名
npm install error-monitor-sdk
```

在你的业务代码入口（如 `main.ts` 或 `app.js`）引入并初始化：

```
// 请将 error-monitor-sdk 替换为你实际发布的包名
import { initErrorMonitor } from 'error-monitor-sdk';

initErrorMonitor({
  reportUrl: 'http://localhost:3000/error-report',
  projectName: 'MyAwesomeProject',
  environment: 'production',
});
```

### 方式 2：NPM + CommonJS

适用于 Node.js 环境或旧版打包工具。

```
# 请将 error-monitor-sdk 替换为你实际发布的包名
npm install error-monitor-sdk
```

```
// 请将 error-monitor-sdk 替换为你实际发布的包名
const { initErrorMonitor } = require('error-monitor-sdk');

initErrorMonitor({
  reportUrl: 'http://localhost:3000/error-report',
  projectName: 'MyAwesomeProject',
  environment: 'production',
});
```

### 方式 3：CDN 直接引入

适用于不使用构建工具的传统项目或简单的 HTML 页面。

```
<!-- 请将 error-monitor-sdk 替换为你实际发布的包名，x.x.x 替换为具体版本号 -->
<script src="https://unpkg.com/error-monitor-sdk@x.x.x/dist/index.umd.js"></script>

<script>
  // UMD 版本会将 SDK 挂载到 window.ErrorMonitor
  ErrorMonitor.initErrorMonitor({
    reportUrl: 'http://localhost:3000/error-report',
    projectName: 'MyAwesomeProject',
    environment: 'production',
  });
</script>
```

6. 进阶：Vue & React 框架集成
----------------------

在现代框架下，组件渲染错误通常**「不会冒泡」**到全局 `window.onerror`，需要通过框架自身的错误钩子来捕获并上报，避免遗漏。

*   **「Vue」**：使用 `app.config.errorHandler`（Vue 3）接管全局组件错误。
    
*   **「React」**：使用 `ErrorBoundary`（错误边界）包裹组件树。虽然 React 没有全局错误钩子，但只要将 `ErrorBoundary` 包裹在最外层的根组件，就能达到 “捕获全站渲染错误” 的效果。
    

### 6.1 SDK 实现（核心片段）

```
// src/index.ts (补充)

// Vue 3 插件：统一接入框架错误 + 自动初始化全局监控
export const VueErrorMonitorPlugin = {
  install(app: any, options: { reportUrl: string; projectName: string; environment: string }) {
    if (!options || !options.reportUrl) return;

    // 开启 JS/Promise/网络/资源监控
    initErrorMonitor(options); 

    const original = app.config.errorHandler;
    // vue提供的捕获组件内错误的事件
    app.config.errorHandler = (err: unknown, instance?: unknown, info?: unknown) => {
      sendErrorData({
        message: formatErrorMessage(err),
        stack: (err as any)?.stack || null,
        projectName: options.projectName,
        environment: options.environment,
        errorType: 'Vue Error',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        info,
      }, options.reportUrl);

      if (typeof original === 'function') {
        try { (original as any)(err, instance, info); } catch {}
      }
    };
  }
};

// React 错误边界：捕获子树渲染错误并上报
export const createReactErrorBoundary = (React: any, config: { reportUrl: string; projectName: string; environment: string }) => {

  // 确保在创建边界组件时启动全局监控（JS/网络/资源）
  if (config && config.reportUrl) {
    initErrorMonitor(config);
  }

  return class ErrorMonitorBoundary extends React.Component {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any, info: any) {
      sendErrorData({
        message: formatErrorMessage(error),
        stack: error?.stack || null,
        projectName: config.projectName,
        environment: config.environment,
        errorType: 'React Error',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        componentStack: info?.componentStack || null,
      }, config.reportUrl);
    }
    render() {
      if ((this.state as any).hasError) return (this.props as any).fallback || null;
      return (this.props as any).children;
    }
  };
};
```

### 6.2 使用示例

**「Vue 3」**

```
import { createApp } from 'vue';
import { VueErrorMonitorPlugin } from 'error-monitor-sdk';

const app = createApp(App);
// 一行代码，同时开启全局监控和 Vue 错误捕获
app.use(VueErrorMonitorPlugin, {
  reportUrl: 'http://localhost:3000/error-report',
  projectName: 'MyVueProject',
  environment: 'production',
});
app.mount('#app');
```

**「React」**

```
import React from 'react';
import ReactDOM from 'react-dom';
import { createReactErrorBoundary } from 'error-monitor-sdk';

// 1. 创建错误边界组件
const ErrorBoundary = createReactErrorBoundary(React, {
  reportUrl: 'http://localhost:3000/error-report',
  projectName: 'MyReactProject',
  environment: 'production',
});

// 2. 包裹根组件，即可捕获整个应用树的渲染错误
ReactDOM.render(
  <ErrorBoundary fallback={<h1>Something went wrong.</h1>}>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')
);
```

7. 总结与展望
--------

到这里，我们这个 “麻雀虽小，五脏俱全” 的错误监控 SDK 就算是跑起来了。

回头看看，几百行代码没白写，实打实搞定了三件事：

1.  **「啥都能抓」**：JS 报错、Promise 挂了、接口 500、图片 404，一个都跑不掉，统统收入囊中。
    
2.  **「死活都能报」**：用了 `Navigator.sendBeacon`，哪怕用户秒关页面，最后那条 “遗言” 也能顽强地发给服务器。
    
3.  **「拿来就能用」**：打包好了三种格式，还送了个 “靶场” 页面，点点按钮就能看效果，主打一个省心。
    

**「不过说实话，这离真正的 “企业级” 监控还有点距离。」**

想在生产环境（特别是高流量业务）扛大旗，还得把下面这些坑填了：

*   **「别盲猜 Bug」**：线上代码都是压缩的，得搞定 **「Sourcemap 还原」**，不然对着 `a.b is not a function` 只有哭的份。
    
*   **「页面白了没」**：有时候没报错但页面一片白，这种 “假死” 得靠 **「白屏检测」** 来发现。
    
*   **「到底快不快」**：光不报错不够，还得看 **「性能指标」** (FCP/LCP)，监控页面加载速度。
    
*   **「用户干了啥」**：复现 Bug 全靠猜？不行，得把用户出事前的点击、路由跳转全记下来，来个 **「行为回溯」**（案发现场还原）。
    
*   **「别把服务器搞崩」**：报错太多得限流、去重，引入 **「采样率」**，不然监控服务先挂了就尴尬了。
    

**「贪多嚼不烂，这次我们先聚焦在最核心的 “错误监控” 闭环。」**

至于上面那些进阶玩法，**「我们下篇文章接着聊」**，带你一步步把这个系统打磨得更完美。

造轮子不是为了重复造，而是为了亲手拆开看看里面的齿轮是怎么转的，这才是学习的本质。

希望这篇文章能是你打造专属监控系统的起点。**「Happy Coding!」**

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibsUkgDmqCRDdfVibJdE7sTyKhKFflbMmpRzQkDQqfniaMRzcRq3u2xXI9eTwr6pY1pYKaa14v8pJWFQ/640?wx_fmt=gif&from=appmsg&wxfrom=5&wx_lazy=1&tp=webp#imgIndex=37)

_**点击 " **阅读原文** " 了解详情**_