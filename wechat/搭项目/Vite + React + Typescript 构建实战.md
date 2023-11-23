> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/exUEXIJV_V1nL56tYyzh-Q)

  

  

导语

  

  

最近前端大火的 Vite 2.0 版本终于出来了，在这里分享一下使用 vite 构建一个前端单页应用以及踩过的坑，希望能带给大家一些收获。

文章首发于个人博客：heavenru.com

**该文章主要面向对 Vite 感兴趣，或者做前端项目架构的同学**

源码地址：fe-project-base

https://github.com/lichenbuliren/fe-project-base

通过这篇文章，你能了解到以下几点：

*   vscode 编辑器配置
    
*   git pre-commit 如何配置
    
*   ESLint + Pritter 配置
    
*   标准前端单页应用目录规划
    
*   从 0 到 1 学习 vite 构建优化
    
*   mobx/6.x + react + TypeScript 最佳实践
    

想快速了解 Vite 配置构建的，可以直接跳到 这里

  

  

  

初始化项目

这里我们项目名是 fe-project-base 这里我们采用的 vite 2.0 来初始化我们的项目

```
npm install --save-dev eslint typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-config-alloy
```

这个时候，会出现命令行提示，咱们按照自己想要的模板，选择对应初始化类型就 OK 了

  

  

  

安装项目依赖

首先，我们需要安装依赖，要打造一个基本的前端单页应用模板，咱们需要安装以下依赖：

1.  `react` & `react-dom`：基础核心
    
2.  `react-router`：路由配置
    
3.  `@loadable/component`：动态路由加载
    
4.  `classnames`：更好的 className 写法
    
5.  `react-router-config`：更好的 react-router 路由配置包
    
6.  `mobx-react` & `mobx-persist`：mobx 状态管理
    
7.  `eslint` & `lint-staged` & `husky` & `prettier`：代码校验配置
    
8.  `eslint-config-alloy`：ESLint 配置插件
    

dependencies:

```
{
  "singleQuote": true,
  "tabWidth": 2,
  "bracketSpacing": true,
  "trailingComma": "none",
  "printWidth": 100,
  "semi": false,
  "overrides": [
    {
      "files": ".prettierrc",
      "options": { "parser": "typescript" }
    }
  ]
}
```

devDependencies：

```
error `'` can be escaped with `'`, `‘`, `'`, `’`  react/no-unescaped-entities
```

  

  

  

pre-commit 配置

在安装完上面的依赖之后，通过 `cat.git/hooks/pre-commit` 来判断 husky 是否正常安装，如果不存在该文件，则说明安装失败，需要重新安装试试

**这里的 husky 使用 4.x 版本，5.x 版本已经不是免费协议了 测试发现 node/14.15.1 版本会导致 husky 自动创建 .git/hooks/pre-commit 配置失败，升级 node/14.16.0 修复该问题**

在完成了以上安装配置之后，我们还需要对 `package.json` 添加相关配置

```
Warning: React version not specified in eslint-plugin-react settings. See https://github.com/yannickcr/eslint-plugin-react#configuration
```

到这里，我们的整个项目就具备了针对提交的文件做 ESLint 校验并修复格式化的能力了

![](https://mmbiz.qpic.cn/mmbiz_png/QgsoTuzQP2wncD7ZDCsKztOBFFx1OnsCF0VJOAxkQzJqCjQbhpJm0L6GXxicHQ3iad8aH1mbyFahZ4F6c9bt1EPQ/640?wx_fmt=png)ESLintError↑

  

  

  

编辑器配置

工欲善其事必先利其器，我们首要解决的是在团队内部编辑器协作问题，这个时候，就需要开发者的编辑器统一安装 EditorConfig 插件（这里以 vscode 插件为例）

首先，我们在项目根目录新建一个配置文件：`.editorconfig` 参考配置：

```
// .eslintrc
{
  "settings": {
    "react": {
      "version": "detect" // 表示探测当前 node_modules 安装的 react 版本
    }
  }
}
```

**配置自动格式化与代码校验** 在 vscode 编辑器中，Mac 快捷键 `command+,` 来快速打开配置项，切换到 `workspace` 模块，并点击右上角的 `open settings json` 按钮，配置如下信息：

```
# .env.custom
NODE_ENV=production
```

这个时候，咱们的编辑器已经具备了保存并自动格式化的功能了

  

  

  

ESLint + Prettier

关于 ESLint 与 Prettier 的关系，可以移步这里：彻底搞懂 ESLint 和 Prettier

1、`.eslintignore`：配置 ESLint 忽略文件

2、`.eslintrc`：ESLint 编码规则配置，这里推荐使用业界统一标准，这里我推荐 AlloyTeam 的 eslint-config-alloy，按照文档安装对应的 ESLint 配置：

```
// vite.config.ts
const config = {
  ...
  define: {
    'process.env.NODE_ENV': '"production"'
  }
  ...
}
```

3、`.prettierignore`：配置 Prettier 忽略文件

4、`.prettierrc`：格式化自定义配置

```
import vitePluginImp from 'vite-plugin-imp'
// vite.config.ts
const config = {
  plugins: [
    vitePluginImp({
      libList: [
        {
          libName: 'antd-mobile',
          style: (name) => `antd-mobile/es/${name}/style`,
          libDirectory: 'es'
        }
      ]
    })
  ]
}
```

选择 `eslint-config-alloy` 的几大理由如下：

1.  更清晰的 ESLint 提示：比如特殊字符需要转义的提示等等
    
    ```
    error `'` can be escaped with `'`, `‘`, `'`, `’`  react/no-unescaped-entities
    ```
    
2.  更加严格的 ESLint 配置提示：比如会提示 ESLint 没有配置指明 React 的 version 就会告警
    
    ```
    Warning: React version not specified in eslint-plugin-react settings. See https://github.com/yannickcr/eslint-plugin-react#configuration
    ```
    
    这里我们补上对 `react` 版本的配置
    
    ```
    // .eslintrc
    {
      "settings": {
        "react": {
          "version": "detect" // 表示探测当前 node_modules 安装的 react 版本
        }
      }
    }
    ```
    

  

  

  

整体目录规划

一个基本的前端单页应用，需要的大致的目录架构如下：

这里以 `src` 下面的目录划分为例

```
.
├── app.tsx
├── assets // 静态资源，会被打包优化
│   ├── favicon.svg
│   └── logo.svg
├── common // 公共配置，比如统一请求封装，session 封装
│   ├── http-client
│   └── session
├── components // 全局组件，分业务组件或 UI 组件
│   ├── Toast
├── config // 配置文件目录
│   ├── index.ts
├── hooks // 自定义 hook
│   └── index.ts
├── layouts // 模板，不同的路由，可以配置不同的模板
│   └── index.tsx
├── lib // 通常这里防止第三方库，比如 jweixin.js、jsBridge.js
│   ├── README.md
│   ├── jsBridge.js
│   └── jweixin.js
├── pages // 页面存放位置
│   ├── components // 就近原则页面级别的组件
│   ├── home
├── routes // 路由配置
│   └── index.ts
├── store // 全局状态管理
│   ├── common.ts
│   ├── index.ts
│   └── session.ts
├── styles // 全局样式
│   ├── global.less
│   └── reset.less
└── utils // 工具方法
  └── index.ts
```

OK，到这里，我们规划好了一个大致的前端项目目录结构，接下来我们要配置一下别名，来优化代码中的，比如：`importxxxfrom'@/utils'` 路径体验

_通常这里还会有一个 public 目录与 src 目录同级，该目录下的文件会直接拷贝到构建目录_

**别名配置**

别名的配置，我们需要关注的是两个地方：`vite.config.ts` & `tsconfig.json`

其中 `vite.config.ts` 用来编译识别用的；`tsconfig.json` 是用来给 Typescript 识别用的；

这里建议采用的是 `@/` 开头，为什么不用 `@` 开头，这是为了避免跟业界某些 npm 包名冲突（例如 @vitejs）

*   `vite.config.ts`
    

```
// vite.config.ts
{
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/common': path.resolve(__dirname, './src/common'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/routes': path.resolve(__dirname, './src/routes'),
      '@/layouts': path.resolve(__dirname, './src/layouts'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store')
    }
  },
}
```

*   `tsconfig.json`
    

```
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/styles/*": ["./src/styles/*"],
      "@/config/*": ["./src/config/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/common/*": ["./src/common/*"],
      "@/assets/*": ["./src/assets/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/routes/*": ["./src/routes/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/store/*": ["./src/store/*"]
    },
    "typeRoots": ["./typings/"]
  },
  "include": ["./src", "./typings", "./vite.config.ts"],
  "exclude": ["node_modules"]
}
```

  

  

  

从 0 到 1 Vite 构建配置

**截止作者写该篇文章时， `**vite**` 版本为 `**vite****/****2.1****.****2**`，以下所有配置仅针对该版本负责**

### 配置文件

默认的 `vite` 初始化项目，是不会给我们创建 `.env`， `.env.production`， `.env.devlopment` 三个配置文件的，然后官方模板默认提供的 `package.json` 文件中，三个 `script` 分别会要用到这几个文件，所以需要我们**手动先创建**，这里提供官方文档：.env 配置

```
# package.json
{
  "scripts": {
    "dev": "vite", // 等于 vite -m development，此时 command='serve',mode='development'
    "build": "tsc && vite build", // 等于 vite -m production，此时 command='build', mode='production'
    "serve": "vite preview",
    "start:qa": "vite -m qa" // 自定义命令，会寻找 .env.qa 的配置文件;此时 command='serve'，mode='qa'
  }
}
```

同时这里的命令，对应的配置文件：mode 区分

```
import { ConfigEnv } from 'vite'
export default ({ command, mode }: ConfigEnv) => {
  // 这里的 command 默认 === 'serve'
  // 当执行 vite build 时，command === 'build'
  // 所以这里可以根据 command 与 mode 做条件判断来导出对应环境的配置
}
```

具体配置文件参考：fe-project-vite/vite.config.ts

### 路由规划

首先，一个项目最重要的部分，就是路由配置；那么我们需要一个配置文件作为入口来配置所有的页面路由，这里以 `react-router` 为例：

#### **路由配置文件配置**

`src/routes/index.ts`，这里我们引入的了 `@loadable/component` 库来做路由动态加载，vite 默认支持动态加载特性，以此提高程序打包效率

```
import loadable from '@loadable/component'
import Layout, { H5Layout } from '@/layouts'
import { RouteConfig } from 'react-router-config'
import Home from '@/pages/home'
const routesConfig: RouteConfig[] = [
  {
    path: '/',
    exact: true,
    component: Home
  },
  // hybird 路由
  {
    path: '/hybird',
    exact: true,
    component: Layout,
    routes: [
      {
        path: '/',
        exact: false,
        component: loadable(() => import('@/pages/hybird'))
      }
    ]
  },
  // H5 相关路由
  {
    path: '/h5',
    exact: false,
    component: H5Layout,
    routes: [
      {
        path: '/',
        exact: false,
        component: loadable(() => import('@/pages/h5'))
      }
    ]
  }
]
export default routesConfig
```

#### **入口 main.tsx 文件配置路由路口**

```
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/global.less'
import { renderRoutes } from 'react-router-config'
import routes from './routes'
ReactDOM.render(
  {renderRoutes(routes)},
  document.getElementById('root')
)
```

这里面的 `renderRoutes` 采用的 `react-router-config` 提供的方法，其实就是咱们 `react-router` 的配置写法，通过查看 源码 如下：

```
import React from "react";
import { Switch, Route } from "react-router";
function renderRoutes(routes, extraProps = {}, switchProps = {}) {
  return routes ? (
{routes.map((route, i) => ( route.render ? ( route.render({ ...props, ...extraProps, route: route }) ) : ( ) } /> ))} 
) : null; } export default renderRoutes;
```

通过以上两个配置，咱们就基本能把项目跑起来了，同时也具备了路由的懒加载能力；

执行 `npm run build`，查看文件输出，就能发现我们的动态路由加载已经配置成功了

```
$ tsc && vite build
vite v2.1.2 building for production...
✓ 53 modules transformed.
dist/index.html                  0.41kb
dist/assets/index.c034ae3d.js    0.11kb / brotli: 0.09kb
dist/assets/index.c034ae3d.js.map 0.30kb
dist/assets/index.f0d0ea4f.js    0.10kb / brotli: 0.09kb
dist/assets/index.f0d0ea4f.js.map 0.29kb
dist/assets/index.8105412a.js    2.25kb / brotli: 0.89kb
dist/assets/index.8105412a.js.map 8.52kb
dist/assets/index.7be450e7.css   1.25kb / brotli: 0.57kb
dist/assets/vendor.7573543b.js   151.44kb / brotli: 43.17kb
dist/assets/vendor.7573543b.js.map 422.16kb
✨  Done in 9.34s.
```

细心的同学可能会发现，上面咱们的路由配置里面，特意拆分了两个 `Layout` & `H5Layout`，这里这么做的目的是为了区分在微信 h5 与 hybird 之间的差异化而设置的模板入口，大家可以根据自己的业务来决定是否需要 `Layout` 层

### 样式处理

说到样式处理，这里咱们的示例采用的是 `.less` 文件，所以在项目里面需要安装对应的解析库

```
npm install 
--
save
-
dev less postcss
```

如果要支持 `css modules` 特性，需要在 `vite.config.ts` 文件中开启对应的配置项：

```
//  vite.config.ts
{
  css: {
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true
      }
    },
    modules: {
      // 样式小驼峰转化,
      //css: goods-list => tsx: goodsList
      localsConvention: 'camelCase'
    }
  },
}
```

### 编译构建

其实到这里，基本就讲完了 vite 的整个构建，参考前面提到的配置文件：

```
export default ({ command, mode }: ConfigEnv) => {
  const envFiles = [
    /** mode local file */ `.env.${mode}.local`,
    /** mode file */ `.env.${mode}`,
    /** local file */ `.env.local`,
    /** default file */ `.env`
  ]
  const { plugins = [], build = {} } = config
  const { rollupOptions = {} } = build
  for (const file of envFiles) {
    try {
      fs.accessSync(file, fs.constants.F_OK)
      const envConfig = dotenv.parse(fs.readFileSync(file))
      for (const k in envConfig) {
        if (Object.prototype.hasOwnProperty.call(envConfig, k)) {
          process.env[k] = envConfig[k]
        }
      }
    } catch (error) {
      console.log('配置文件不存在，忽略')
    }
  }
  const isBuild = command === 'build'
  // const base = isBuild ? process.env.VITE_STATIC_CDN : '//localhost:3000/'
  config.base = process.env.VITE_STATIC_CDN
  if (isBuild) {
    // 压缩 Html 插件
    config.plugins = [...plugins, minifyHtml()]
  }
  if (process.env.VISUALIZER) {
    const { plugins = [] } = rollupOptions
    rollupOptions.plugins = [
      ...plugins,
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ]
  }
  // 在这里无法使用 import.meta.env 变量
  if (command === 'serve') {
    config.server = {
      // 反向代理
      proxy: {
        api: {
          target: process.env.VITE_API_HOST,
          changeOrigin: true,
          rewrite: (path: any) => path.replace(/^\/api/, '')
        }
      }
    }
  }
  return config
}
```

在这里，我们利用了一个 `dotenv` 的库，来帮我们将配置的内容绑定到 `process.env` 上面供我们配置文件使用

详细配置请参考 demo：https://github.com/lichenbuliren/fe-project-base

### 构建优化

1.  为了更好地、更直观的知道项目打包之后的依赖问题，我们，我们可以通过 `rollup-plugin-visualizer` 包来实现可视化打包依赖
    
2.  在使用自定义的环境构建配置文件，在 `.env.custom` 中，配置
    
    ```
    # .env.custom
    NODE_ENV=production
    ```
    
    截止版本 `vite@2.1.5`，官方存在一个 BUG，上面的 `NODE_ENV=production` 在自定义配置文件中不生效，可以通过以下方式兼容
    
    ```
    // vite.config.ts
    const config = {
      ...
      define: {
        'process.env.NODE_ENV': '"production"'
      }
      ...
    }
    ```
    

4.  `antd-mobile` 按需加载，配置如下：
    
    ```
    import vitePluginImp from 'vite-plugin-imp'
    // vite.config.ts
    const config = {
      plugins: [
        vitePluginImp({
          libList: [
            {
              libName: 'antd-mobile',
              style: (name) => `antd-mobile/es/${name}/style`,
              libDirectory: 'es'
            }
          ]
        })
      ]
    }
    ```
    
    以上配置，在本地开发模式下能保证 antd 正常运行，但是，在执行 `build` 命令之后，在服务器访问会报一个错误
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/QgsoTuzQP2wncD7ZDCsKztOBFFx1OnsCALrxmCJBtOiaHs0DPJEJXibeunP41G4zovVurIc43eLfdPLBIOPoZFgA/640?wx_fmt=png)，类似 issue 可以参考
    
    **解决方案** 手动安装单独安装 `indexof` npm 包：`npm install indexof`
    

  

  

  

mobx6.x + react + typescript 实践

作者在使用 `mobx` 的时候，版本已经是 `mobx@6.x`，发现这里相比于旧版本，API 的使用上有了一些差异，特地在这里分享下踩坑经历

### Store 划分

store 的划分，主要参考本文的示例 需要注意的是，在 store 初始化的时候，如果需要数据能够响应式绑定，需要在初始化的时候，给默认值，不能设置为 undefined 或者 null，这样子的话，数据是无法实现响应式的

```
// store.ts
import { makeAutoObservable, observable } from 'mobx'
class CommonStore {
  // 这里必须给定一个初始化的只，否则响应式数据不生效
  title = ''
  theme = 'default'
  constructor() {
    // 这里是实现响应式的关键
    makeAutoObservable(this)
  }
  setTheme(theme: string) {
    this.theme = theme
  }
  setTitle(title: string) {
    this.title = title
  }
}
export default new CommonStore()
```

### Store 注入

`mobx@6x`的数据注入，采用的 `react` 的 `context` 特性；主要分成以下三个步骤

#### **根节点变更**

通过 `Provider` 组件，注入全局 `store`

```
// 入口文件 app.tsx
import { Provider } from 'mobx-react'
import counterStore from './counter'
import commonStore from './common'
const stores = {
  counterStore,
  commonStore
}
ReactDOM.render(
  {renderRoutes(routes)},
  document.getElementById('root')
)
```

_这里的 Provider 是由 mobx-react 提供的_ 通过查看源码我们会发现， `Provier`内部实现也是 React Context：

```
// mobx-react Provider 源码实现
import React from "react"
import { shallowEqual } from "./utils/utils"
import { IValueMap } from "./types/IValueMap"
// 创建一个 Context
export const MobXProviderContext = React.createContext({})
export interface ProviderProps extends IValueMap {
    children: React.ReactNode
}
export function Provider(props: ProviderProps) {
    // 除开 children 属性，其他的都作为 store 值
    const { children, ...stores } = props
    const parentValue = React.useContext(MobXProviderContext)
    // store 引用最新值
    const mutableProviderRef = React.useRef({ ...parentValue, ...stores })
    const value = mutableProviderRef.current
    if (__DEV__) {
        const newValue = { ...value, ...stores } // spread in previous state for the context based stores
        if (!shallowEqual(value, newValue)) {
            throw new Error(
                "MobX Provider: The set of provided stores has changed. See: https://github.com/mobxjs/mobx-react#the-set-of-provided-stores-has-changed-error."
            )
        }
    }
    return {children}
}
// 供调试工具显示 Provider 名称
Provider.displayName = "MobXProvider"
```

### Store 使用

因为函数组件没法使用注解的方式，所以咱们需要使用自定义 `Hook` 的方式来实现：

```
// useStore 实现
import { MobXProviderContext } from 'mobx-react'
import counterStore from './counter'
import commonStore from './common'
const _store = {
  counterStore,
  commonStore
}
export type StoreType = typeof _store
// 声明 store 类型
interface ContextType {
  stores: StoreType
}
// 这两个是函数声明，重载
function useStores(): StoreType
function useStores<T extends keyof StoreType>(storeName: T): StoreType[T]
/**
 * 获取根 store 或者指定 store 名称数据
 * @param storeName 指定子 store 名称
 * @returns typeof StoreType[storeName]
 */
function useStores<T extends keyof StoreType>(storeName?: T) {
  // 这里的 MobXProviderContext 就是上面 mobx-react 提供的
  const rootStore = React.useContext(MobXProviderContext)
  const { stores } = rootStore as ContextType
  return storeName ? stores[storeName] : stores
}
export { useStores }
```

组件引用通过自定义组件引用 store

```
import React from 'react'
import { useStores } from '@/hooks'
import { observer } from 'mobx-react'
// 通过 Observer 高阶组件来实现
const HybirdHome: React.FC = observer((props) => {
  const commonStore = useStores('commonStore')
  return (
    <>
      <div>Welcome Hybird Homediv>
      <div>current theme: {commonStore.theme}div>
      <button type="button" onClick={() => commonStore.setTheme('black')}>
        set theme to black
      button>
      <button type="button" onClick={() => commonStore.setTheme('red')}>
        set theme to red
      button>
  )
})
export default HybirdHome
```

可以看到前面咱们设计的自定义 Hook，通过 `Typescript` 的特性，能够提供友好的代码提示

![](https://mmbiz.qpic.cn/mmbiz_png/QgsoTuzQP2wncD7ZDCsKztOBFFx1OnsCGia8sPCOvm5CaFwia8k6mPunUtFscrgMrKg5KwNfBzA0oaZjPSCwEWaA/640?wx_fmt=png)code demo↑

以上就是整个 `mobx+typescript` 在函数式组件中的实际应用场景了；如果有什么问题，欢迎评论交流 :)

  

  

  

参考资料

*   React Hook useContext
    
    （https://reactjs.org/docs/hooks-reference.html#usecontext）
    
*   Mobx 官方文档
    
    （https://mobx.js.org/react-integration.html）
    
*   vite 构建案例 vite-concent-pro
    
    （https://github.com/tnfe/vite-concent-pro）
    

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

  

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwsicQDIDxzNjf7l5letSvniaMFeqkIQ8maDMubVSicdtaKIRRNra3EggM4PYXQMXWI95uOm0YBgpICdA/640?wx_fmt=jpeg)

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)