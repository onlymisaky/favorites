> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eR-Rn1RKXZ8frz0RSZ87Ww)

作者：suporka

https://segmentfault.com/q/1010000024459339

**1. 前言**
---------

笔者两年前曾写过一篇文章《Webpack4 搭建 Vue 项目》，后来随着 webpack5 和 vue3 的面世，一直想升级下我这个 createVue 项目，但是苦于没有时间（其实是因为懒），一直拖延至今。捣鼓了好几天，终于搭建好整个项目，因此仅以此文记录升级搭建的过程。

PS: 其实也可以用官方脚手架搭建的，为何要自己从头做起呢？有脚手架我不用，我就折腾。哎，就是玩儿~😄

**2. 准备工作**
-----------

为何升级？除了折腾外，便是享受新版本带给我们的新特性体验。

**Webpack5 的新特性**

*   持久化缓存
    
*   moduleIds & chunkIds 的优化
    
*   更智能的 tree shaking
    
*   Module Federation
    
*   ...
    

### **Vue3 的新特性**

*   更小
    
*   更快
    
*   加强 TypeScript 支持
    
*   加强 API 设计一致性
    
*   提高自身可维护性
    
*   开放更多底层功能
    

### **确定项目技术栈**

*   编程语言：TypeScript 4.2.4
    
*   构建工具：[Webpack 5.33.2]()
    
*   前端框架：Vue 3.0.11
    
*   路由工具：Vue Router 4.0.6
    
*   状态管理：Vuex 4.0.0
    
*   CSS 预编译：Sass / Less
    
*   HTTP 工具：Axios
    
*   Git Hook 工具：Husky + Lint-staged
    
*   代码规范：EditorConfig + Prettier + ESLint
    
*   提交规范：Commitlint
    
*   构建部署：Travis
    

**3. 项目搭建**
-----------

此文并不是从零搭建，而是在 createVue@v1.0.0 的基础上修改搭建，如若看不懂，可以先看《Webpack4 搭建 Vue 项目》，跟着一步步搭建，后再看此文升级

创建 createVue 文件夹，进入该文件夹， npm init 初始化项目

老规矩，安装 webpack 四件套`npm i webpack webpack-cli webpack-dev-server webpack-merge --save-dev`

```
当前使用版本："webpack": "^5.33.2","webpack-bundle-analyzer": "^4.4.1","webpack-cli": "^4.6.0","webpack-dev-server": "^3.11.2","webpack-merge": "^5.7.3",
```

webpack5 启动开发服务器命令与之前有所变化，从 `webpack-dev-server` 转变为 `webpack serve`, 因此 package.json 中 script 的 start 修改为： `"start": "webpack serve --progress --hot --inline --config build/webpack.dev.js"`  

1.  创建相应文件
    

与之前没有太大差异。增加变动的有一下几点：

1). 持久化缓存，增加 cache 配置. v5 中缓存默认是 memory，修改设置 "filesystem" 写入硬盘

```
// webpack.dev.jsmodule.exports = merge(common, {  cache: {    type: 'filesystem',  }  //...}
```

2). 去除插件 clean-webpack-plugin（v5 支持），webpack.HashedModuleIdsPlugin（v5 更好的 moduleIds & chunkIds），HardSourceWebpackPlugin（v5 支持），happypack（v5 不兼容）  

安装 vue 核心解析插件

解析插件有所不同，从 `vue-template-compiler` 变成了 `@vue/compiler-sfc`, `vue-loader` 保持不变。 `npm i vue-loader @vue/compiler-sfc --save-dev`

```
// 当前我使用版本"vue-loader": "^16.2.0","@vue/compiler-sfc": "^3.0.11",
```

安装 vue3 及相关库，添加 vue 类型文件  

`npm i vue@next vuex@4.0.0-rc.1 vue-router --save`

src 文件夹下添加 shims-vue.d.ts 文件，解决 vue 类型报错

```
// shims-vue.d.tsdeclare module '*.vue' {  import type { DefineComponent } from 'vue'  const component: DefineComponent<{}, {}, any>  export default component}
```

安装 html 模板解析插件  

`npm i html-webpack-plugin --save-dev`

安装 typescript 及解析插件

`npm i typescript ts-loader --save-dev`

配置 ts-loader 解析：

```
// webpack.base.js// rules{    test: /\.(t|j)s$/,    exclude: /node_modules/,    use: [      {        loader: 'ts-loader',        options: {          // 指定特定的ts编译配置，为了区分脚本的ts配置          configFile: path.resolve(__dirname, '../tsconfig.loader.json'),          // 对应文件添加个.ts或.tsx后缀          appendTsSuffixTo: [/\.vue$/],        },      },    ],}
```

ts-loader 为单进程执行类型检查和转译，因此效率有些慢，可以用多进程方案：即关闭 ts-loader 的类型检查，类型检查由 `fork-ts-checker-webpack-plugin` 插件执行。`npm i fork-ts-checker-webpack-plugin --save-dev`  

```
// webpack.base.js// rules{    test: /\.(t|j)s$/,    exclude: /node_modules/,    use: [      {        loader: 'ts-loader',        options: {          // 指定特定的ts编译配置，为了区分脚本的ts配置          configFile: path.resolve(__dirname, '../tsconfig.loader.json'),          // 对应文件添加个.ts或.tsx后缀          appendTsSuffixTo: [/\.vue$/],          transpileOnly: true, // ? 关闭类型检查，即只进行转译        },      },    ],}// plugins pushnew ForkTsCheckerWebpackPlugin()
```

至此项目基本可以跑起来了，那么有个问题了：Ts 可以编译为指定版本的 js，那么还需要 babel 么？  

tsc 的 target 只转译语法，不集成 polyfill，所以还是得要 babel。

比如把箭头函数转成普通 function、aysnc + await 变成 Promise.then，这是语法转译；

但你运行环境里如果没有 Promise.prototype.finally，那没有就还是没有。

因此我们项目里还是需要 babel.

Webpack 转译 Typescript 现有方案:

![](https://mmbiz.qpic.cn/mmbiz_png/aVp1YC8UV0ePfoNIhj4bQe5Y3mCLbOmjvZkjJrJQ3xpStGlicemBGLGrLQM2ECb18MiaQY1Rd4aqmRu5854cdL8g/640?wx_fmt=png)

综合考虑性能和扩展性，目前比较推荐的是 `babel+fork-ts-checker-webpack-plugin` 方案。  

在 babel7 之前，是需要同时使用 ts-loader 和 babel-loader 的，其编译过程 `TS > TS 编译器 > JS > Babel > JS` 。可见编译了两次 js，效率有些低下。但是 babel7 出来之后有了解析 typescript 的能力，有了这一层面的支持，我们就可以只使用 babel，而不用再加一轮 ts 的编译流程了。

在 babel 7 中，我们使用新的 `@babel/preset-typescript` 预设，结合一些插件便可以解析大部分的 ts 语法。

那么，Babel 是如何处理 TypeScript 代码的呢？

Babel 删除了所有 TypeScript，将其转换为常规的 JavaScript，并继续以它自己的方式处理。删除了 typescript 则不需要进行类型检查，不会有烦人的类型错误提醒，因此编译速度提升，开开心心编程😄

当然，类型安全性检查必不可少，我们可以统一在某个时间集中处理，增加 script：

```
"check-types": "tsc --watch",
```

添加 babel 解析 typescript  

```
# 安装以下依赖 --save-dev# webpack loaderbabel-loader# babel 核心@babel/core# 智能转换成目标运行环境代码@babel/preset-env# 解析 typescript 的 babel 预设@babel/preset-typescript# polyfill @babel/plugin-transform-runtime# 支持 ts 类的写法@babel/plugin-proposal-class-properties # 支持三点展开符@babel/plugin-proposal-object-rest-spread# 安装以下依赖 --save@babel/runtime@babel/runtime-corejs3"core-js": "^3.11.0",
```

删除 ts-loader, 添加 babel-loader

```
{    test: /\.(t|j)s$/,    exclude: /node_modules/,    use: [      {        loader: 'babel-loader',      },    ],}
```

项目根目录添加 babel 配置文件 babel.config.js  

```
module.exports = {  presets: [    [      '@babel/preset-env',      {        useBuiltIns: 'usage', // 按需引入 polyfill        corejs: 3,      },    ],    [      '@babel/preset-typescript', // 引用Typescript插件      {        allExtensions: true, // 支持所有文件扩展名，否则在vue文件中使用ts会报错      },    ],  ],  plugins: [    [      '@babel/plugin-transform-runtime',      {        corejs: 3,      },    ],    '@babel/proposal-class-properties',    '@babel/proposal-object-rest-spread',  ],}
```

**4. 代码规范**  

--------------

项目中代码规范集成了 EditorConfig， Prettier， ESLint， Husky， Lint-staged，以及如何解决 Prettier 和 ESLint 的冲突的问题，具体实现可以参考 《从 0 开始手把手带你搭建一套规范的 Vue3.x 项目工程环境》这篇文章，讲的很详细这里不再赘述。

**5. 提交规范**
-----------

利用 inquirer 选择配置好的提交类型，以及配合 commitlint 实现 commit 检查

```
npm i inquirer shelljs @commitlint/{cli,config-conventional} -D
```

添加 package.json 的 script ：  

```
"commitlint": "commitlint -e", "commit": "node commit/git-commit.js"
```

创建 commit/git-commit.js 文件  

```
const shell = require('shelljs')const inquirer = require('inquirer')const prompsConfig = {  ciType: [    {      type: 'list',      name: 'type',      message: '请选择本次提交的类型:',      choices: [        {          name: '引入新特性',          value: 'feat',        },        {          name: '改进代码的结构格式/样式',          value: 'style',        },        {          name: '修复 bug',          value: 'fix',        },        {          name: '提升性能',          value: 'perf',        },        {          name: '删除代码或文件',          value: 'delete',        },        {          name: '其他修改, 比如改变构建流程、或者增加依赖库、工具等',          value: 'chore',        },        {          name: '重构',          value: 'refactor',        },        {          name: '撰写文档',          value: 'docs',        },        {          name: '增加测试',          value: 'test',        },        {          name: '更新打包文件',          value: 'build',        },        {          name: '初次提交',          value: 'init',        },        {          name: '发布/版本标签',          value: 'release',        },        {          name: '部署功能',          value: 'deploy',        },        {          name: '代码回滚',          value: 'revert',        },        {          name: 'CI持续集成修改',          value: 'ci',        },      ],    },  ],  ciMsg: {    type: 'input',    name: 'msg',    message: '请输入提交文本:',    validate: function (value) {      if (value) {        return true      }      return '文本必须输入!'    },  },}async function gitCommit() {  let { type } = await inquirer.prompt(prompsConfig.ciType)  let { msg } = await inquirer.prompt(prompsConfig.ciMsg)  shell.exec(`git commit -m "${type}: ${msg}"`, function () {    console.log(`\n提交脚本: git commit -m "${type}: ${msg}"`)  })}gitCommit()
```

配置 commitlint 类型，创建 commitlint.config.js 文件：  

```
module.exports = {  extends: ['@commitlint/config-conventional'],  rules: {    'type-enum': [2, 'always', [      'build', 'chore', 'ci', 'feat', 'docs', 'fix', 'perf', 'revert', 'refactor', 'style', 'test', 'init', 'build', 'release', 'delete'     ]],  }};
```

完成上述操作后，`git add 相关文件`，执行 `npm run commit` 即可执行 commit 校验  

**6. 构建部署 Travis CI**
---------------------

Travis CI 是一款构建和测试的自动化工具，不仅可以提高效率，还能使开发流程更可靠和专业化，从而提高软件的价值。而且，它对于开源项目是免费的，不花一分钱，就能帮你做掉很多事情。详细介绍可以查看 阮一峰——《持续集成服务 Travis CI 教程》

首先，访问官方网站 travis-ci.org，点击右上角的个人头像，使用 Github 账户登入 Travis CI。

找到对应的仓库，打开开关添加仓库

![](https://mmbiz.qpic.cn/mmbiz_png/aVp1YC8UV0ePfoNIhj4bQe5Y3mCLbOmj3LQzsUs7jlbf74eiaGd6JGTRykkewL3qHRNM1sCvjbYiat0OOA2s64mg/640?wx_fmt=png)

在 github 上 setting/Developer settings/Personal access token 处生成 travis token  

<img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69ea45bccd674eaeb7023ea850aa2be1~tplv-k3u1fbpfcp-watermark.image" width="700"/>

点击对应仓库的 setting

![](https://mmbiz.qpic.cn/mmbiz_png/aVp1YC8UV0ePfoNIhj4bQe5Y3mCLbOmjeMK7jQAAYuL5Nxe5wK3sn04vQKCjIOficpKmP8PpYicOMI5aap9oYF1w/640?wx_fmt=png)

设置环境变量 GITHUB_TOKEN 为刚才 github 处生成的 token  

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a1594556dfc3449698070dfb99c18f59~tplv-k3u1fbpfcp-watermark.image" width="700"/>

创建 .travis.yml 配置文件：

```
language: node_jsnode_js:  - 12branchs:  only:    - mastercache:  directories:    - node_modulesinstall:  - yarn installscripts:  - yarn builddeploy:  provider: pages  local_dir: dist  skip_cleanup: true  # 在 GitHub 上生成的令牌，允许 Travis 推送代码到你的仓库。  # 在仓库对应的 Travis 设置页面中配置，用于安全控制。  github_token: $GITHUB_TOKEN  keep_history: true  on:    branch: master
```

这样，当你 push 到 master 或者 pr 合并到 master 的时候，就会触发部署脚本的执行，将生成的 dist 推送至 gh-pages 分支  

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1710d33f1a1c4da18ad28ef2c4805f34~tplv-k3u1fbpfcp-watermark.image" width="700"/>

**7. 存在问题及总结**
--------------

*   构建时间比 webpack4 长，可能是由于 ts 的引入，以及 happypack 多进程构建的移除造成时间略长
    
*   dev server 不会自增 port
    
*   fork-ts-checker-webpack-plugin 无法检测 vue 中的 ts 类型错误
    

捣鼓了挺长一段时间，也了解了蛮多工程化的东西，虽然不一定能用于实际项目中，但还是算有所收获吧！

**推荐阅读：**

[

如何编写一个 webpack 的 loader

2021-05-28

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0NKfocMrAicgINGh22R4BIsh04K6kuWoib8KkHoCSjbe13qzB3zcwuVC31w5Pq271nXGicHYbDs8szkQ/640?wx_fmt=jpeg)

](http://mp.weixin.qq.com/s?__biz=MzIxNjgwMDIzMA==&mid=2247492079&idx=2&sn=55d4c945e9ccda796cfbb3a87ce60f4e&chksm=97812f66a0f6a6702579b36d2f409e3f1cece0e44793717aa9407d62676c8e0ef9ec8af50192&scene=21#wechat_redirect)

[Vue3 + Vite2 + TypeScript 开发复盘总结](http://mp.weixin.qq.com/s?__biz=MzIxNjgwMDIzMA==&mid=2247492313&idx=1&sn=8094ededb1f22b368d1886ac6ca299bb&chksm=97812c50a0f6a546649bf0c3607c6d949cb5f085f492b4dbb5c0811028ab172d1192e3be4e2f&scene=21#wechat_redirect)

[2021-06-20](http://mp.weixin.qq.com/s?__biz=MzIxNjgwMDIzMA==&mid=2247492313&idx=1&sn=8094ededb1f22b368d1886ac6ca299bb&chksm=97812c50a0f6a546649bf0c3607c6d949cb5f085f492b4dbb5c0811028ab172d1192e3be4e2f&scene=21#wechat_redirect)

[![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0MlNvFPKX2t7HoEW8Bk2Y1nG2rZajL50Alb0cjuLImpHMOPVxGic7cMFtB9LxY0UQb4czgiaVZnPFvw/640?wx_fmt=jpeg)](http://mp.weixin.qq.com/s?__biz=MzIxNjgwMDIzMA==&mid=2247492313&idx=1&sn=8094ededb1f22b368d1886ac6ca299bb&chksm=97812c50a0f6a546649bf0c3607c6d949cb5f085f492b4dbb5c0811028ab172d1192e3be4e2f&scene=21#wechat_redirect)