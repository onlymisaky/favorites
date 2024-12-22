> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aMU3idDsg8k8UH9etqehPg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/dy9CXeZLlCX3GvxTV6xRTqvemTIzibM5ldzkg0a0dDkHBzptHuqFbJywDyJZAPPFxuoiaeLBXeFJkOaAe5SiamFqg/640?wx_fmt=png&from=appmsg)

> 作者：文学与代码
> 
> https://juejin.cn/post/7395969637878693942

无论在面试还是内部晋升，**性能优化方案** 一直都是非常重要的部分。

性能优化可以分为很多种，比如：

1.  打包工具（webpack || vite）性能优化
    
2.  访问速度优化
    
3.  用户感知优化
    
4.  代码标准化
    
5.  ...
    

在了解 webpack 的性能优化之前，我们需要先对性能优化有一个总体的认知，总共分为 3 点：

1.  在业务开发中，不要过早的考虑性能优化，而且业务开发大部分时候都不需要进行性能优化。因为 vue-cli 这些脚手架已经帮助业务开发者进行了最佳实践。
    
2.  性能优化没有一招鲜吃遍天的方法论，而是因地制宜，见招拆招，所以任何性能优化的方案都不要死记硬背，而是理解其本质原理。
    
3.  性能优化其实主要就是优化以下 3 个方面：
    

1.  优化构建效率。
    
2.  优化网络传输效率。
    
3.  优化代码执行效率。而 webpack 层面主要优化的是前两种效率。
    

本文是 webpack 性能优化相关文章的第一篇，将从以下几个角度开始探讨：

1.  webpack 基本原理
    
2.  搭建基础 webpack5 调试环境
    
3.  分析 webpack dev 模式打包结果
    
4.  分析 webpack prod 模式打包结果
    
5.  去除掉重复打包模块以及没有使用的模块
    
6.  自动分包的实施方案
    

webpack 基本原理
------------

webpack 打包构建的核心流程可以总结为以下的流程图：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R1VGq5bvSNsZMOiaz52RRjNXUrCbmF25OrI4jVdbDUKcpZTHyO9DkRfg/640?wx_fmt=other&from=appmsg)image.png

webpack 在打包流程的各个阶段都设置了勾子函数，基于这些勾子函数，开发者可以自定义 webpack 插件，来实现一些强大的自定义功能。在编译过程中，webpack 会对各个模块的导出内容进行缓存，如果在这个过程中，webpack 发现这个模块已经存在了缓存，那么就不会重复处理这个模块了。

搭建最基础的 webpack 实验环境：
--------------------

我们不基于 vue-cli，而是直接搭建一个基于 webpack5 的 vue3 开发环境：

首先我们可以直接安装以下以下依赖：

```
"devDependencies": {    "@babel/core": "^7.24.7",    "@babel/plugin-transform-runtime": "^7.24.7",    "@babel/preset-env": "^7.24.7",    "@babel/preset-typescript": "^7.24.7",    "@types/lodash": "^4.17.7",    "@types/node": "^20.14.8",    "babel-loader": "^9.1.3",    "copy-webpack-plugin": "^12.0.2",    "cross-env": "^7.0.3",    "css-loader": "^7.1.2",    "dotenv": "^16.4.5",    "html-webpack-plugin": "^5.6.0",    "mini-css-extract-plugin": "^2.9.0",    "postcss": "^8.4.38",    "postcss-loader": "^8.1.1",    "postcss-preset-env": "^9.5.14",    "regenerator-runtime": "^0.14.1",    "sass": "^1.77.6",    "sass-loader": "^14.2.1",    "serve": "^14.2.3",    "style-loader": "^4.0.0",    "style-resources-loader": "^1.5.0",    "ts-loader": "^9.5.1",    "vue-loader": "^17.4.2",    "webpack": "^5.92.1",    "webpack-bundle-analyzer": "^4.10.2",    "webpack-cli": "^5.1.4",    "webpack-dev-server": "^5.0.4",    "webpack-merge": "^5.10.0"  },  "dependencies": {    "@babel/runtime": "^7.24.7",    "@babel/runtime-corejs3": "^7.24.7",    "core-js": "^3.37.1",    "element-plus": "^2.7.8",    "lodash": "^4.17.21",    "lodash-es": "^4.17.21",    "vue": "^3.4.29",    "vue-router": "^4.4.0"  }
```

在目录下新建一个 webpack 的文件夹，在里面新建一个 base-webpack 配置以及分别用于构建开发环境以及生产环境的配置文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RhT2kH8SHboEy3FY4YyicU8oI0YhIdqLjjUjlIXpVwbcDltsqZhNztaw/640?wx_fmt=other&from=appmsg)image.png

我们在 webpack-base 文件中加入如下配置：

```
// 公共的 webpack 配置const { relative, resolve } = require("path");const HtmlWebpackPlugin = require("html-webpack-plugin");const { VueLoaderPlugin } = require("vue-loader");const webpack = require("webpack");const MinicssExtractPlugin = require("mini-css-extract-plugin");const setCssRules = require("./setCssRules");const setModuleCssRule = require("./setModuleCssRule");const CopyWebpackPlugin = require("copy-webpack-plugin");const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;// 读取 node_env 环境变量的值let nodeEnv = process.env.NODE_ENV;if (!nodeEnv) {  nodeEnv = "development";}const isProd = nodeEnv === "production";const envVars = [  ".env",  `.env.${nodeEnv}`,  `.env.${nodeEnv}.local`,  ".env.local",].filter(Boolean);// 读取当前构建环境对应的环境变量文件的所有内容，将其注入到环境变量中envVars.forEach((envVar) => {  const envFilePath = resolve(__dirname, "..", envVar);  const envFileExists = require("fs").existsSync(envFilePath);  if (envFileExists) {    require("dotenv").config({      path: envFilePath,    });  }});/** * @type {import('webpack').Configuration} */module.exports = {  // 配置入口  entry: resolve(__dirname, "..", "src", "main.ts"),  optimization: {    // 暂时不要压缩代码    minimize: true,  },  // 配置打包出口  output: {    path: resolve(__dirname, "..", "dist"),    // 使用文件指纹    filename: "js/[name].[contenthash:6].js",    // 从 webpack5 开始，只要开启这个开关，那么每一次构建会自动清理输出目录    clean: true,    // 打包后访问的资源前缀    publicPath: "/",  },  // 配置路径别名  resolve: {    alias: {      "@": resolve(__dirname, "..", "src"),      vue$: "vue/dist/vue.runtime.esm-bundler.js",    },    // 配置模块的访问路径    extensions: [".js", ".ts", ".tsx", ".vue", ".json"],  },  // 配置插件  plugins: [    new HtmlWebpackPlugin({      // 指定 html 模板的路径      template: resolve(__dirname, "..", "public", "index.html"),      // 该配置会注入到 html 文件的模板语法中      title: process.env.VUE_APP_TITLE,    }),    // 加载 vue-loader 插件    new VueLoaderPlugin(),    // 在编译时候全局替换静态值    new webpack.DefinePlugin({      // 定义全局变量      "process.env": {        VUE_APP_API_URI: JSON.stringify(process.env.VUE_APP_API_URI),      },      // 决定 vue3 是否启用 options api      __VUE_OPTIONS_API__: true,      // Vue Devtools 在生产环境中不可用      __VUE_PROD_DEVTOOLS__: false,    }),    new MinicssExtractPlugin({      filename: "css/[name].[contenthash:6].css",      // chunkFilename: "css/[name].[contenthash:6].css",    }),    new CopyWebpackPlugin({      patterns: [        {          from: resolve(__dirname, "..", "public"),          to: resolve(__dirname, "..", "dist"),          toType: "dir",          globOptions: {            ignore: ["**/index.html", "**/.DS_Store"],          },          info: {            minimized: true, // 注意：minimize 应该是 minimized，根据CopyWebpackPlugin的文档进行修正          },        },      ],    }),    new BundleAnalyzerPlugin({      analyzerMode: 'server',      analyzerHost: '127.0.0.1',      analyzerPort: 8888,      openAnalyzer: true,      generateStatsFile: false,      statsOptions: null,      logLevel: 'info'    })  ],  module: {    // 配置 leader    rules: [      // 配置 js loader      {        test: /\.js$/,        use: "babel-loader",        exclude: /node_modules/,      },      {        // 配置 .vue 文件        test: /\.vue$/,        use: "vue-loader",      },      // 匹配 .ts(x)      {        test: /\.tsx?$/,        // 先暴力排除 node_modules 目录        exclude: /node_modules/,        use: [          {            loader: "ts-loader",            options: {              // 在编译 ts 的时候关闭类型检查，只进行代码转换              transpileOnly: true,              // .vue 文件在编译过程中添加 .ts 后缀              appendTsSuffixTo: [/\.vue$/],            },          },          // 在 ts 处理完成之后，将内容交给 babel-loader 处理          {            loader: "babel-loader",            // options: {            //   // 添加 babel 预设            //   presets: [            //     [            //       "@babel/preset-typescript",            //       {            //         // 尝试转换任意类型文件中的 ts 代码            //         allExtensions: true,            //       },            //     ],            //   ],            // },          },        ],      },      {        oneOf: [          // 处理 css 相关的内容          {            test: /\.css$/,            // 过滤掉 node_modules 以及以 .module.css 结尾的文件            exclude: [/\.module\.css$/],            use: setCssRules("css", isProd),          },          // 处理 scss 相关的内容          {            test: /\.s[ac]ss$/i,            // 过滤掉 node_modules 以及以 .module.scss 结尾的文件            exclude: [/\.module\.s[ac]ss$/],            use: setCssRules("scss", isProd),          },          //  处理 .module.css 结尾的文件          {            test: /\.module\.css$/,            exclude: /node_modules/,            use: setModuleCssRule("css", isProd),          },          // 处理 .module.scss 结尾的文件          {            test: /\.module\.s[ac]ss$/,            exclude: /node_modules/,            use: setModuleCssRule("scss", isProd),          },        ],      },      // webpack5处理图片相关的静态资源      {        test: /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/,        // 使用 webpack5 覅人新特性，不再需要使用loader去进行处理        // 而且 assets 是 webpack5 通用的资源处理类型        // 默认情况下 8kb 以下的资源会被转化为 base64 编码        type: "asset",        parser: {          dataUrlCondition: {            // 自定义 10 kb 以下的资源会被转化为 base 64 位编码            maxSize: 10 * 1024,          },        },        generator: {          // 输出图片的目录          // outputPath: "images",          // 输出图片的名称          filename: "images/[name].[contenthash:6].[ext]",        },      },      // svg 类型的静态资源期望转为为 asset/resource 类型进行处理      {        test: /\.(svg)(\?.*)?$/,        // 默认会将构建结果导出单独的配置文件        type: "asset/resource",        generator: {          // 输出 svg 的目录          // outputPath: "images",          // 输出 svg 的名称          filename: "svgs/[name].[contenthash:6].[ext]",        },      },    ],  },};
```

配置比较简单，就是搭建 vue3 开发环境的基础配置。配置完成之后，我们就继续编写 dev 环境构建配置以及生产环境构建配置：

```
const baseConfig = require('./webpack.base.js')const { merge } = require('webpack-merge')/** * @type {import('webpack').Configuration} */const devConfig = {    mode: "development",    // webpack5 本身就直接支持了热更新    // 定义sourceMap    devtool: "cheap-module-source-map",    devServer: {        port: Number(process.env.VUE_APP_PORT),        // 启动完成之后自动打开        open: JSON.parse(process.env.VUE_APP_OPEN),        // 在访问资源 404 之后 自动导航到 index.html        historyApiFallback: true,    }}module.exports = merge(baseConfig, devConfig)
```

```
const baseConfig = require('./webpack.base.js')const { merge } = require('webpack-merge')/** * @type {import('webpack').Configuration} */const prodConfig = {  mode: 'production',}module.exports = merge(baseConfig, prodConfig)
```

配置完毕之后我们可以加上如下的 script 脚本命令：

```
"scripts": {    "build:dev": "webpack -c webpack/webpack.dev.js --node-env devlopment",    "build:prod": "webpack -c webpack/webpack.prod.js --node-env production",    "priview": "serve -s dist -l 4000",    "serve": "webpack-dev-server -c webpack/webpack.dev.js --node-env devlopment"  },
```

接着我们可以配置 vue3 的业务代码：

首先配置入口文件：

```
// src/main.tsimport { createApp, h } from "vue"import ElementPlus from 'element-plus'import 'element-plus/dist/index.css'import App from "./App.vue"import './style.css'import router from './router'createApp(App).use(ElementPlus).use(router).mount("#app")
```

紧接着我们配置 App.vue 入口组件：

```
<template>  <div class="app">    <el-button @click="$router.push('/')" type="primary">前往首页</el-button>    <el-button @click="$router.push('/about')" type="primary">关于</el-button>    <router-view></router-view>  </div></template><script lang="ts" setup>import { onBeforeMount, ref } from 'vue'// 以后一定要仔细阅读 webpack 的编译日志信息import * as moduleCss from './styles/app.module.scss'console.log('moduleCss', moduleCss)const count = ref(0) console.log('工程运行模式', process.env.NODE_ENV)console.log('前台请求的base_url', process.env.VUE_APP_API_URI)onBeforeMount(() => {  console.log('app组件开始渲染')})</script>
```

我们配置 /router/index.js 文件：

```
// 生成vue-router的初始化配置代码import { createRouter, createWebHistory } from 'vue-router';import Home from '@/views/Home.vue';import About from '@/views/About.vue';const routes = [  {    path: '/',    name: 'Home',    component: Home,  },  {    path: '/about',    name: 'About',    component: About,  },];const router = createRouter({  history: createWebHistory(process.env.BASE_URL || '/'),  routes,});export default router;
```

我们新建 views 页面文件：

```
home.vue<template>    <div class="home-container">        home 页面skskssk    </div></template><script lang="ts" setup>import { map } from 'lodash'const numbers = [1, 2, 3, 4, 5]const doubledNumbers = map(numbers, (num: number) => num * 2)console.log('doubledNumbers', doubledNumbers); // 输出: [2, 4, 6, 8, 10]</script>
```

```
about.vue<template>    <div class="home-container">        About 页面    </div></template><script lang="ts" setup>import { map } from 'lodash-es'const numbers = [1, 2, 3, 4, 5]const doubledNumbers = map(numbers, (num: number) => num * 2)console.log('doubledNumbers', doubledNumbers); // 输出: [2, 4, 6, 8, 10]</script>
```

我们建立 /assets 文件夹，新建 var.scss 文件：

```
// 定义公共全局变量$green: #00ff00;
```

完成上述准备工作之后，我们可以 加上一些环境变量：

.env:

```
VUE_APP_TITLE=webpack-vue3-appBASE_URL=/
```

.env.devlopment:

```
CURRENT_ENV=developmentVUE_APP_OPEN=trueVUE_APP_API_URI=/apiVUE_APP_PORT=3000
```

.env.production:

```
CURRENT_ENV=productionVUE_APP_API_URI=/api
```

建立 babel 配置文件：

```
module.exports = {  presets: [    [      "@babel/preset-env",      {        // 按需引入 corejs 垫片, 普通的业务开发前端项目适合该方法，简单方便，按需引入        // 但是不适合处理一些公共第三方库库的打包构建        useBuiltIns: "usage",        corejs: 3,      },    ],    [      "@babel/preset-typescript",      {        // 尝试转换任意类型文件中的 ts 代码        allExtensions: true,      },    ],  ],  // plugins: [  //     // 配置 babel 插件  //     [  //         // 配置运行时进行垫片处理的插件  //         // 不会全局污染原生宿主环境提供的内容，完全重写语法垫片  //         // 适合封装公共三方库  //         '@babel/plugin-transform-runtime',  //         {  //             corejs: 3  //         }  //     ]  // ]};
```

建立 ts 配置文件：

```
{    "compilerOptions": {      "target": "esnext",      "module": "esnext",      "strict": true,      "jsx": "preserve",      "moduleResolution": "node",      "skipLibCheck": true,      "esModuleInterop": true,      "allowSyntheticDefaultImports": true,      "forceConsistentCasingInFileNames": true,      "useDefineForClassFields": true,      "sourceMap": true,      "baseUrl": ".",    //   "types": [    //     "webpack-env"    //   ],      "paths": {        "@/*": [          "src/*"        ]      },      "lib": [        "esnext",        "dom",        "dom.iterable",        "scripthost"      ],    },    "include": [      "src/**/*.ts",      "src/**/*.tsx",      "src/**/*.vue",      "tests/**/*.ts",      "tests/**/*.tsx"    ],    "exclude": [      "node_modules"    ],  }
```

配置完毕之后，我们可以执行 pnpm serve 命令：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RHFbdRrAf4icBY6w6CCqGRso4sC3mKzTGfkzicrdW6p7EyEag7iavZzzTw/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37Rk5ovgf5bbiaHHhy4xukiaBQalLbiaibQO0QRgibictWZr1pVbmcFYz2Cah1Q/640?wx_fmt=other&from=appmsg)image.png

至此，我们就完成了基础配置环境的搭建。那么首先，让我们来分析和优化传输效率：

分析 webpack dev 模式打包结果：
----------------------

我们已经加入了 BundleAnalyzerPlugin 插件，并且配置了该服务的端口号是：8888，所以我们可以访问该端口号来分析打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RX6tgSJRGjt5HlhiaArBASibTngt7FI1vMT9Ln9FNU577prk715Sm6rVw/640?wx_fmt=other&from=appmsg)image.png

通过对打包结果的分析，我们可以得到以下的发现：

1.  所有的内容都被打包到了一个 chunk 中。
    
2.  我们此时这个项目中同时使用了 lodash 以及 lodash-es 文件，所以这两个包的所有内容同时都被打包到了最终的构建结果中了：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RiciaRoXJlXVJvTY0sfdyNiaKpJlkCcPAOQxRjorBLXcCFuGAQQib4kdXcQ/640?wx_fmt=other&from=appmsg) 3. 占打包体积最大的三个包分别是 element-plus、lodash-es、lodash：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RJnlg5EVXibwn3ydbiaI8Hl2a1bFHC7vRhib2yzJfShkKQrm3vz93bAWdQ/640?wx_fmt=other&from=appmsg)image.png

并且 element-plus 中的所有组件都被打包进来了。

4.  有一些貌似我们完全没有使用，也没有直接安装的依赖都被打包进来了：
    

比如：![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RYomdq8IHBdXgSy7cL2QMJOqfKj9mN9jsU8wnfAPOicxZetMEhlRNu3g/640?wx_fmt=other&from=appmsg)

day.js

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37Rmk4SA58CCr58pnP4KKFgpKFut2MbnjuEeTPObSiaHWgVoh07f0Ol0GQ/640?wx_fmt=other&from=appmsg)image.png

async-validator

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RssDY95Dfek1umf5lr3OJTX3V4HdZnApIhgibL44Wqy6qUJxBJVAX6ibA/640?wx_fmt=other&from=appmsg)image.png

element-plus/icon-vue 的内容都被打包进来了，我们目前并没有使用 icon。

分析 webpack prod 模式打包结果：
-----------------------

我们执行 pnpm build:prod 命令：

首先，我们关注一下 webpack 构建之后，控制台的警告日志：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RiceKic4QAWEbiaPCxrs9ZzPNNEgyqFgt7zCb0tVTVjhjjabibHoK2F431g/640?wx_fmt=other&from=appmsg)image.png

分析这个日志我们可以知道 webpack 在提示我们，目前整个打包体积比较大了，建议我们使用 import 函数来进行路由懒加载，从而优化主 chunk 的打包体积。这是一个很有用的日志信息，我们可以知道，借助 import 函数进行模块的懒加载，是实现代码分包，优化主 chunk 的一种重要手段。接着我们继续来观察生产环境构建的打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37Rgxia1Fc8J14IQKg0wRMEsk6PvdC9vIoCgiaIX6XLWx1W0Y8mL8icrJ7XA/640?wx_fmt=other&from=appmsg)image.png

通过分析生产环境的打包结果，我们就可以得出以下结论：

1.  mian.ts + 911 module 这个模块占体积最大的。而这个模块中混合了我们自己编写的业务代码以及其他诸多三方库的代码。
    
2.  占体积最大的三个模块分别是：混合了第三方库和业务代码的混合模块、lodash 模块、element-plus 模块。
    
3.  lodash-es 以及 vue 等一些三方模块的打包结果没有看到，我们推测，它们都被一起合并到了 mian.ts + 911 module 这个模块中了。
    

对当前项目的打包体积有了最基本的分析之后，我们下面来逐步优化打包体积。

去除掉重复打包模块以及没有使用的模块
------------------

我们可以看到上述打包结果中同时打包了 lodash-es 以及 lodash 模块

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R7ykwpKUfbBKkS5kSffYMFrjtftfsp00SfnePoX1qLz6F3fV9qBvibew/640?wx_fmt=other&from=appmsg)image.png

这个问题的原因其实在日常开发中还是挺常见的，我们可能同时安装和使用了一个常用包的普通版本以及 es 版本。所以我们需要将项目中 lodash 的普通版本移除调用，全部改成 lodash-es 版本。这样做了之后，我们再一次查看打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RUb3iaE4XsYicqZAkSoKUQlonMygk0WJicpYW8zwQibB7hLicMmHTNBD1Jrg/640?wx_fmt=other&from=appmsg)image.png

可以看到 lodash 模块已经被移除了，此时开发模式下包的总体积是 4.54M

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R0E3mB0qXCKt7t0czyicHh631mia9q0fwMSH4z2nd62yEq3hwfjrYtEug/640?wx_fmt=other&from=appmsg)image.png

生产模式构建 ladash 模块也被整个移除掉了，并且因为 lodash-es tree shaking 的能力，整个 lodash-es 也进行了按需打包，所以一下子减少了很多的体积，只有 3.49M 了。做完这个优化之后，我们继续来分析此时的打包结果：目前打包体积最大的是 element-plus 组件库以及相关的图标组件库：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R7ic3Ovvyu0fTjZ89SNDJPSuxq2M7dBoe503jG0slHzOFW5etm7HXpvA/640?wx_fmt=other&from=appmsg)image.png

不过生产模式下打包我们好像并没有看到 element-plus 相关的模块，这个我们推测并不是 element-plus 的包太小了所以看不到，而是被整个合并到 main.ts + modules 这个大大的块中去了，此时这个大部模块的体积是 3.14 M

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RiaZMOTn8AkkYQmjUSl4CpzZNORTlELwRBaDOk82MsZkLxMhfaEkVvwA/640?wx_fmt=other&from=appmsg)image.png

我们目前在项目中采取的是插件来全局注册 element-plus 的所有组件的。所以，生产模式是无法进行 tree shaking 的，因为本身所有组件不管有没有使用都被 import 了。所以我们要所见 element 的打包体积，需要按需导入，我们提出两种方案：

1.  在哪一个模块中用到哪一个组件，我们就在哪一个模块中手动 import 哪一个组件。这种可以最好的在生产模式下享受 tree shaking 的福利，但是使用过于繁琐了，推荐只是在当前项目只需使用几次 element-plus 组件的情况下采用该方案。
    
2.  我们手动编写一个 install element-plus 组件库的方案，按需导入并且全局注册 element-plus 组件。我们下面开始实践方案 2：
    

首先我们来分析一下 element-plus 这个项目的 package.json 文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37Ricbhd8d3KzCFsLrL29sdKiabKKAXHbm11FwpmAvDX7icdNSTouAGK2zGw/640?wx_fmt=other&from=appmsg)image.png

分析可知，如果我们在项目中 import element-plus，那么导入的模块入口实在 es/index.mjs 模块的，我们来看一下该模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R673hibuKOJvtSIYneK1HY0uXj6Af2WODbpnmEZw6uzkxnru7dVPsXPQ/640?wx_fmt=other&from=appmsg)image.png

这个模块实际上就是导出的入口，将所有的组件依次进行了 export，那么我们只需要在自己的 install element-plus 模块中 依次 import 组件，然后依次注册就可以了。分析了实现方案，我们开干：

首先在 src 下面新建一个 /plugins/install.ts 文件，加入以下内容：

```
import { App } from "vue";import {     ElButton,    ElInput} from 'element-plus'const elementComponents = [    ElButton,    ElInput]export default {    install(app: App) {      elementComponents.forEach(component => {        app.component(component.name!, component)      })    }}
```

然后我们修改以下入口模块的方式：

```
import { createApp, h } from "vue"import 'element-plus/dist/index.css'import App from "./App.vue"import './style.css'import router from './router'import elementInstall from "./plugins/elementInstall"createApp(App).use(elementInstall).use(router).mount("#app")
```

然后我们重新启动一下服务，重新进行打包：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RCUYpDw1WbTg78vBNSal6GPLXhnAbx04HBPYW62gySDUqVmep1t0TIw/640?wx_fmt=other&from=appmsg)image.png

首先页面运行正常。我们分析一下打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R3gsn68Ox5O5yYCJLRjU0AL3iaCQO7PCgAm1V2m5FYRtAYbFx6OqJ4vQ/640?wx_fmt=other&from=appmsg)image.png

此时生产模式下的综合模块的体积只有 1.3M 了，瞬间从 3.14 M 降到了 1.3M。效果还是很明显的。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RoypE0A72oEb4HAmzNX7I97oxf4PRAwYqFn0ibYeLwRjR8tkZ8pyGBlQ/640?wx_fmt=other&from=appmsg)image.png

开发模式也只是将了 element-plus 中注册的组件模块内容导入进来了。

自动分包
----

首先我们明确一点，分包最大的目的就是为了利用 http 缓存协议来实现模块的缓存和重用。而为了实现浏览器缓存，最主流的手段就是借助文件 hash。当某些 chunk 文件内容没有发生变化的时候，文件 hash 就不会发生变化，而只要文件 hash 没有变，那么浏览器就会重用本地缓存的内容，不会重新向服务器发送 http 请求。这样就可以实现传输性能优化。实际上，webpack 本身就有默认的分包配置，我们可以去看一下 webpack 的官网描述：

优化 (Optimization) | webpack 中文文档 | webpack 中文文档 | webpack 中文网 (webpackjs.com)[1]

我们可以知道，实际上从 webpack4 开始，分包实际上使用的就是内置的插件：

SplitChunksPlugin | webpack 中文文档 | webpack 中文文档 | webpack 中文网 (webpackjs.com)[2]

webpack 已经对这个插件进行了默认配置：

```
module.exports = {  //...  optimization: {    splitChunks: {      // 默认对异步模块进行分包      chunks: 'async',      // 最小的分包提示是 20000 字节      minSize: 20000,      minRemainingSize: 0,      minChunks: 1,      maxAsyncRequests: 30,      maxInitialRequests: 30,      enforceSizeThreshold: 50000,      cacheGroups: {        defaultVendors: {          test: /[\/]node_modules[\/]/,          priority: -10,          reuseExistingChunk: true,        },        default: {          minChunks: 2,          priority: -20,          reuseExistingChunk: true,        },      },    },  },};
```

这个里面最核心的配置就是：

`chunks: 'async'` 这个表示 webpack 只会对异步加载的模块进行分包，所谓的异步加载就是使用`await import('xxxx')` 函数来进行模块懒加载。其实很好理解，也就是只有当 js 执行到了这个 import 函数调用的时候才会进行模块加载。

`minSize: 20000` 这个配置决定了 webpack 只会对 超过 20000 子节的模块进行分包。

基于以上分析，我们可以将所有的 vue-router 中配置的页面路由全部调整为异步加载，来尝试将每一个路由单独进行打包，实现模块懒加载：

```
const routes = [  {    path: '/',    name: 'Home',    component: () => import('@/views/Home.vue')  },  {    path: '/about',    name: 'About',    component: () => import('@/views/About.vue'),  },];
```

我们看一下生产环境分包的结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RQBR3AxEakU9SFI4YTX6sIjCicPGIw51XK0XY9ickaqqH3N06GUBL8yTw/640?wx_fmt=other&from=appmsg)image.png

webpack 分出来了 4 个 chunk，main 开头的那个 chunk 肯定是主模块的 chunk，其他三个 chunk，实在是看不出来含义，为了 chunk 的语义化更好，我们可以利用 webpack 支持的魔法注释以及下面的配置：首先我们回顾一下基础配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R7Ixd7FJhqRF4bNp5hVak5ww8tYwsq96FBoSIuWutUuVkQTibSpYicThg/640?wx_fmt=other&from=appmsg) 我们已经给所有打包出来的模块开启了文件指纹，那么对于分离出来的 chunk 模块这个同样是生效的。因此我们才可以看到，所有的 chunk 都被打上了 hash id。这样已经很好的有利于浏览器缓存了。我们现在是需要定义分离出来的 chunk 名字能够符合模块的语义，那么我们可以加上如下的配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RBy4BXhyYSE054YMLNCyDcH4xHM3GcpgaaelQ9D4uAZfOMicQKyze3sw/640?wx_fmt=other&from=appmsg)image.png

```
mode: 'production',  optimization: {    // 用文件的名字作为chunk的名字    chunkIds: 'named',  },
```

加上这个配置之后我们继续打包：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RybB4a44cL6215dnQ6oAWZgPcKHicxvZsvMVgsDicThiaNsyjXWicZWt2fQ/640?wx_fmt=other&from=appmsg)image.png

语义化已经好一些了，但是我们仍然需要进一步优化懒加载的路由模块的名字，那么我们可以继续配置魔法注释：

```
{    path: '/',    name: 'Home',    component: () => import(      /* webpackChunkName: "HomeView" */      '@/views/Home.vue'    )  },  {    path: '/about',    name: 'About',    component: () => import(      /* webpackChunkName: "AboutView" */      '@/views/About.vue'    ),  },
```

我们再一次打包：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RrhVnyXvVCYogEPQbVZoxwVDGC9lcqYzthJld98tzlPCx9MjTzv6Row/640?wx_fmt=other&from=appmsg)image.png

这些就非常的语义化了。但是现在我们需要注意一个特殊的模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RkOVIviafYPvKIl3gYfW3iadM9hzf70icwHlXVWyW1AvzeovnSlEjsptyw/640?wx_fmt=other&from=appmsg)image.png

第三方库里面的异步导入的模块也被打包成了一个单独的模块。其实目前主要就是包含了 lodash-es map 模块的相关内容。这就说明 lodash 里面的 map 函数存在依赖了一些异步加载的模块。如果我们在项目中去除掉 lodash map 函数，替换为一个其他的模块：

```
<template>    <div class="home-container">        home 页面skskssk    </div></template><script lang="ts" setup>import { trim } from 'lodash-es'const numbers = [1, 2, 3, 4, 5]const doubledNumbers = trim('ssssss')console.log('doubledNumbers', doubledNumbers); // 输出: [2, 4, 6, 8, 10]</script>
```

```
<template>    <div class="home-container">        About 页面    </div></template><script lang="ts" setup>// import { map } from 'lodash-es'// const numbers = [1, 2, 3, 4, 5]// const doubledNumbers = map(numbers, (num: number) => num * 2)// console.log('doubledNumbers', doubledNumbers); // 输出: [2, 4, 6, 8, 10]</script>
```

此时我们再关注一下打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37Riav90ubv7Msic5pKW1E6g3DuKxWy3O1XOWl3YiaHJcvzyGLicYicT9UAQGg/640?wx_fmt=other&from=appmsg)image.png

lodash 模块中的异步加载模块就被干掉了。

配置完毕路由懒加载异步分包之后，我们需要继续去分包：

我们关注一下这个主 chunk：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RqiaiavVFPu4gibp9sjyKIEezHY8Sg2Ibzm168icia8UGHStUVafmFE06fpA/640?wx_fmt=other&from=appmsg)image.png

我们自己的其他非异步加载的代码和 node_modules 中三方包的代码仍然混合在一起了，这样，依然不利于浏览器缓存，因为业务代码改动是会很频繁的，但是诸多第三方代码的改动是很少的。所以我们需要进一步将业务代码和 node_modules 代码拆分出来：

我们可以在生产环境的 webpack 配置中添加上如下配置：

```
optimization: {    // 用文件的名字作为chunk的名字    chunkIds: 'named',    splitChunks: {      // 任意模块都可以拆分      chunks: 'all',      cacheGroups: {        // 屁用 node_modules 模块：        vendors: {          name: 'vendors',          test: /[\\/]node_modules[\\/]/,          priority: -10,          // 不需要重复拆跟 chunk          reuseExistingChunk: true        },      }    }    // minimize: false  },
```

这样配置之后，我们再来看一下打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37R0DV1DQ8nP6EF0kNN1Rejibyg65BxR9G6MXND8wb5QxUQh8BheTNOttw/640?wx_fmt=other&from=appmsg)image.png

此时我们编写的普通业务代码就已经可以被单独拆分出 main.xxx.js 模块了。

实际上代码拆分到这一步就已经可以满足绝大多数的需求了，大部分脚手架工具提供的默认分包策略也就是这样的。但是如果我们希望进一步拆分，比如我们希望把 element-plus 这样比较大并且基本上完全不会变动的的三方模块单独拆分出来，那么可以进一步拆分：

```
// 拆跟 elemnt 模块：        element: {          name: 'element',          test: /[\\/]node_modules[\\/]element-plus(.*)/,          // 注意优先级需要高于 vendors 的分包优先级          priority: 10,          // 不需要重复拆跟 chunk          reuseExistingChunk: true        }
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RU8FmdA458ycjt9foq4ZSkmfoP1Bj6OlcfzdwfjUj6LPKBRJQNzVTKQ/640?wx_fmt=other&from=appmsg)image.png

此时 element-plus 就被拆分出来了。如果需要手动拆分其他的第三方模块，依此类推。webpack 分包策略的 test 配置特别强大，可以接收一个函数，webpack 在构建过程中，每遍历一个模块就会将这个模块的信息作为参数传入到这个函数的入参中，我们则可以在这个函数中编写判断逻辑：

```
custonChunk: {          test(module) {             // console.log(module.size())            // console.log(module.nameForCondition())            // console.log(module.context)            // 如果模块大于30kb，并且模块名字中包含node_modules, 就会被单独打包到一个文件中            return module.size() > 30000 &&               module.nameForCondition() && module.nameForCondition().includes('node_modules')          },          // 动态计算生成 bundle 名称          name(module) {             const packageNameArr = module.context.match(/[\\/]node_modules[\\/]\.pnpm[\\/](.*?)(\/|$)/)            const packageName = packageNameArr ? packageNameArr[1] : ''            return `chunk-lib.${packageName.replace(/@/g,"")}`;          },          priority: 20,          minChunks: 1,          reuseExistingChunk: true,        }
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RygFweQMUFzVEr8l2F5iaibM3icWp7c3jO5AoibicwwIPqqQLpslJeVyibaYw/640?wx_fmt=other&from=appmsg)image.png

但是现在又出现了新的问题，这样配置之后，其他所有的较小的第三方包又和业务代码混合到一起了。为了解决这个问题，我们需要进一步调整，我们需要加上这个配置：包拆的比较细致之后，可以充分的利用浏览器缓存来提升网络传输效率：

```
vendors: {          name: 'vendors',          test: /[\\/]node_modules[\\/]/,          priority: -10,          // 不需要重复拆跟 chunk          reuseExistingChunk: true        },
```

这样其他所有较小的第三方包也被单独拆分出来，可以进行缓存了：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37REA19NhuF7dRQSe3yr6AkawgvQnekIAnRE13FBY6Gond0LropSN5eCA/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RMXaqHW5JdMZsShqagK9L67kmJxSqqsVLtNKmz3OEVBKoYuDicWVojAA/640?wx_fmt=other&from=appmsg)image.png

这样之后，当我们修改了业务带么的内容重新构建部署到静态资源服务器之后，重新访问页面之后：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RrMHOCs6zYCsTjmibVPDPeKF0W8nQuHkOnso8mbFYlnw33o2Erv7VSmg/640?wx_fmt=other&from=appmsg)image.png

只有业务代码会被请求了。

而且在 http2 时代，因为 http 协议已经支持了并行请求，所以只要包的数量不是多到离谱，其实不会导致加载阻塞的问题的。

最后我们再来进行优化，将 vendors 模块中的 element-plus 拆分出来：

```
// // 屁用 node_modules 模块：        vendors: {          name: 'vendors',          test: /[\\/]node_modules[\\/]/,          priority: -10,          // 不需要重复拆跟 chunk          reuseExistingChunk: true        },        // // 拆跟 elemnt 模块：        element: {          name: 'element',          test: /[\\/]node_modules[\\/]element-plus(.*)/,          // 注意优先级需要高于 vendors 的分包优先级          priority: 20,          // 不需要重复拆跟 chunk          reuseExistingChunk: true        },
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RNH05XmbO0dI1nnZwg6jcKCjGhvGXfic8fsib7ia2pf7Qm43h2Y1K8udOw/640?wx_fmt=other&from=appmsg)image.png

继续观测分析自动分包的结果：
--------------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RrzvIAQ5eR81DCBNNVYnkVz4Vj1V5CcsQzXsV5icRU4zcFycKHebzMkg/640?wx_fmt=other&from=appmsg)image.png

我们可以看自动拆包拆分除了一个表达的 element-plus 的图标模块，但是我们自己的项目中似乎并没有使用该模块，那么为什么它的打包结果中会包含它的内容呢？而且还被单独拆分成了一个 chunk 呢？实际上很简单，因为 element-plus 中的很多组件都使用了该模块，比如 ElButton:

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37RtetjGt3lV7y3fASKh5rAQSxWGlLrZawCzQdEaX2YgCUkcPalEOuYtA/640?wx_fmt=other&from=appmsg)image.png![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/Ptef09iaEWxxMlAUMVERYQZDYquxkv37REYLDVlf9rtgvsf6B9cZ2mGkxicbJwgea52RPylXPBJz9cPAQNvwqB7w/640?wx_fmt=other&from=appmsg)image.png

向 day.js 这些第一次打包的时候存在的第三方模块，为什么现在打包结果中不存了呢？其实很简单，因为 day.js 这个第三方模块是 element-plus 组件中的时间日历组件导入使用的模块，但是因为我们目前是按需加载的 element 组件库，而我们目前项目中没有依赖时间日历组件，所以自然这些模块都被依次 tree sheaking 掉了。

参考资料

[1]

https://www.webpackjs.com/configuration/optimization/#optimizationsplitchunks: https://www.webpackjs.com/configuration/optimization/#optimizationsplitchunks

[2]

https://www.webpackjs.com/plugins/split-chunks-plugin/: https://www.webpackjs.com/plugins/split-chunks-plugin/