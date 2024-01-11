> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [juejin.cn](https://juejin.cn/post/7194647659221614649#heading-18)

> 该专栏的相关文章：
> 
> *   [开篇：对于组件库的思考、技术梳理](https://juejin.cn/post/7194646431809372218 "https://juejin.cn/post/7194646431809372218")

Monorepo 概念
===========

随着各种技术的发展和超级应用的出现，人们开始考虑怎么才能将所有的小应用都集成在一个大项目中，特别是在这些项目互相影响时，在实现过程中，工程师们最关注的两点是：**项目功能分离** 和 **避免重复代码**。

如果将每个功能作为独立的项目打包，随着业务的发展，项目会越来越多，根本没法管理，项目与项目之间的协作也会越来越困难，所以`Monorepo`的概念并产生了。

在`Monorepo`中我们可以在一个项目下进行功能拆分，他们互相独立不影响，但是又可以通过引用来达到互相协助。

*   ### Monorepo 的优缺点
    

**优点：**

1.  简化依赖的管理。
2.  跨组合作更加方便。
3.  代码复用简单。

**缺点：**

1.  项目构建时间过长。
2.  版本信息杂糅不清晰。

我也会基于`Monorepo`的方式搭建属于自己的组件库工程。

项目工程的搭建
=======

### 技术选型

*   基于`pnpm`的`Monorepo`工程，项目打包工具`vite`、`gulp`，使用`sass`处理样式。
*   `Vue`组件写法会支持`Jsx`和`template`的方式。项目支持`Typescript`。
*   `lint`规范的接入，`prettier`的格式化统一，`husky`的卡点校验。
*   组件单元测试使用`vitest`+`happy-dom`。

基于以上的技术开始搭建我们的项目。

#### 项目的大概结构

```
// vb-design

|—— config        //放置一些脚本
|—— examples      //存放演示包
    |—— demo
    |—— taro-demo 
    ...
|—— packages      //存放npm库的包
    |—— hooks
    |—— icon
    |—— ui-h5
    |—— ui-taro
    ...
.eslintignore
.eslintrc.js
.gitignore
.lintstagedrc.cjs
.npmrc
.prettierrc.cjs
package.json
pnpm-workspace.yaml
README.md
tsconfig.root.json
...
```

#### 项目配置

*   ##### Monerepo 工程的起步
    

`pnpm`搭建`Monorepo`是非常简单的，只需要我们配置`pnpm-workspace.yaml`文件即可。具体的配置可参考 [pnpm-workspace.yaml | pnpm](https://link.juejin.cn?target=https%3A%2F%2Fpnpm.io%2Fzh%2Fpnpm-workspace_yaml "https://pnpm.io/zh/pnpm-workspace_yaml")

*   ##### lint、prettier、eslint 的接入
    

`lint`、`prettier`、`eslint`的配置大部人应该都很熟练了，在这我就不一一贴代码说明了。还不清楚的小伙伴可参考我的[**代码**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FFoneQinrf%2Fvb-design "https://github.com/FoneQinrf/vb-design")或者找篇相关的教程自己跟着试试。

*   ##### 统一开发环境
    

开发环境的统一，主要是统一`Node`版本和`pnpm`，我们可以通过在`package.json`中配置一些字段来统一开发环境。

1、限制`Node`版本和`pnpm`  
通过配置`volta`和`engines`限制`Node`和`pnpm`的版本

```
//package.json

"volta": {
    "node": "16.13.0"
},
"engines": {
    "node": "16.13.0",
    "pnpm": ">=6"
}
```

2、限制项目只能通过`pnpm`初始化依赖

```
//package.json

"scripts": {
    "preinstall": "npx only-allow pnpm",
}
```

#### packages 子包搭建

对于子包的搭建，不会详细地一一讲解，需要深入了解的可以自行到[**源代码**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FFoneQinrf%2Fvb-design "https://github.com/FoneQinrf/vb-design")里看。

##### ui-h5 搭建

*   目录结构设计

```
//ui-h5

components                  //组件目录
    |—— Button
        |—— demo            //demo演示存放目录
            |—— base.vue
            ...
        |—— index.md        //组件使用文档
        |—— index.scss      //组件样式
        |—— index.ts        //vue组件
        |—— index.taro.ts   //taro组件
    |—— Icon
    ...
style          //公共样式存放
    |—— index.scss
    ...
ui.h5.ts       //vue组件对外暴露
ui.taro.ts     //taro组件对外暴露
```

为了开发方便，把`vue端`、`taro端`的组件都放在该包下，以及`examples`需要的演示文档和`demo`也放在该包下。至于各端写好的`组件`、`demo`、`演示文档`是怎么使用，后续会说明。

*   构建产物

```
// dist
components                    //单个组件
    |—— Button
        |—— index.scss
        |—— index.css
        |—— index.js
        |—— index.taro.js
    |—— Icon
    ...
style 
    |—— index.scss
    ...
types
    |—— 
    ...
style.css
vb-ui.es.js
vu-ui.umd.js
vb-ui.taro.es.js
vb-ui.taro.umd.js
```

##### ui-taro 搭建

该包其实没有做更多的事情，只是初始化之后把`package.json`做了相关配置。最重要的地方是在根目录下的`package.json`配置了脚本，在`ui-h5`包构建之后，通过脚本`copy`了该包需要的东西。

*   脚本文件都在根目录`config`里

##### icon 搭建

在`ui-h5`中，`Icon`组件的设计支持了`iconfont`和`svg`的方式，这也是参考了 **element-ui** 的`Icon`组件设计。所以该包主要是处理`svg`图标，把图标转化成`vue`组件统一向外暴露的过程。

另外，我并不会用设计软件，没有`svg`可用，所以借用了字节 **arco-design** 的图标 [Arco Design Icons – Figma](https://link.juejin.cn?target=https%3A%2F%2Fwww.figma.com%2Ffile%2F1ohmb16op4ogbI09ojLR5W%2FArco-Design-Icons%3Fnode-id%3D0%253A1%26t%3D36mihjdOBFM71G1l-0 "https://www.figma.com/file/1ohmb16op4ogbI09ojLR5W/Arco-Design-Icons?node-id=0%3A1&t=36mihjdOBFM71G1l-0")

##### hooks 搭建

该包主要是一些公共方法的包，目前也没有更多的想法，所以也只是先放着。

##### examples 浏览器端演示包搭建

因为搭建的是移动端组件库，所以演示包需要有两个入口，`H5`端和`PC`端。整个搭建的过程大致是：

*   通过 [**vite-plugin-md**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fantfu%2Fvite-plugin-md "https://github.com/antfu/vite-plugin-md") 解析 md 文件。
*   通过 [**vite-plugin-pages**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fhannoeru%2Fvite-plugin-pages "https://github.com/hannoeru/vite-plugin-pages") 和 [**vite-plugin-vue-layouts**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fjohncampionjr%2Fvite-plugin-vue-layouts "https://github.com/johncampionjr/vite-plugin-vue-layouts") 管理路由，页面的存放路径是在`ui-h5`包下。

`vite-plugin-pages`和`vite-plugin-vue-layouts`的配置

```
//vite.config.js

Pages({
  dirs: [
    {
      dir: resolve(__dirname, '../../packages/ui-h5/components'),
      baseRoute: 'component',
    },
  ],
  exclude: ['**/components/*.vue'],
  extensions: ['vue', 'md'],
}),
Layout({
  layoutsDirs: 'src/layouts',
  defaultLayout: 'preview',
})
```

#### 项目的构建与 npm 包发布

这么多的子包，打包构建以及推送到`npm`是不是需要到每个子包下执行完打包和执推送的命令？针对这个问题`pnpm`官方是有解决方案的：

首先所有的子包都定义个`build`命令来执行当前包的所有打包构建事情，最后项目根目录`package.json`的配置如下：

```
//package.json

"scripts": {
    "build": "pnpm --filter './packages/**' run build && pnpm run build:taro",  //执行packages下所有子包的build方法
    "release": "pnpm run build && pnpm run release:only",
    "release:only": "changeset publish --tag=beta --access=publish",            //发布所有子包
    "build:taro": "node ./config/build-taro.js",
    "build:demo": "pnpm --filter './examples/**' run build"
}
```

上方`build`这个地方的配置 [**pnpm**](https://link.juejin.cn?target=https%3A%2F%2Fpnpm.io%2Fzh%2Ffiltering "https://pnpm.io/zh/filtering") 官方有很详细的说明。再就是关于`npm publish`的，主要是通过 [**@changesets/cli**](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40changesets%2Fcli "https://www.npmjs.com/package/@changesets/cli") 这个`cli`工具去解决。

`changeset publish` 只是一个很纯净的发包命令，手动提升 / 修改版本后再 `changeset publish`他会将所有包都`publish`一次。

*   写到这，顺便再给大家说下这个项目的代码发布流吧。

1.  版本号是手动修改的。
2.  通过打`tag`的方式会触发`workflows`去执行打包构建，然后`publish`和部署演示的`demo`。

很多开源的项目通过 [**changeset-bot**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fapps%2Fchangeset-bot "https://github.com/apps/changeset-bot") + [**changesets/action**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fchangesets%2Faction "https://github.com/changesets/action") + [**@changesets/cli**](https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40changesets%2Fcli "https://www.npmjs.com/package/@changesets/cli") 能玩出各种各样的工作流。

#### 关于单元测试

单测在开源项目里是不可缺少的存在，虽然我不一定会去写单测😀，但是该有的东西还是得搭起来。

[**Vitest**](https://link.juejin.cn?target=https%3A%2F%2Fcn.vitest.dev%2F "https://cn.vitest.dev/") 是基于`vite`的原生快速单元测试，完全兼容`Jest`的`Api`，还能共用`vite`的配置。所以针对当前项目使用 **Vitest** 是最快接入单元测试的方式，但是很遗憾，针对小程序端还没有更好的接入单元测试方案。

最后
==

写到这，组件库的搭建过程也差不多了，有什么不了解的可以留言或私信我。欢迎大家提出更好的意见或想法，还有写作水平差，有问题请轻喷。

最后因为没有一些设计规范，所以`UI`组件的产出并不会很理想。但是从 0 到 1 实现的过程才是重点，这能让我们以后在碰到相同问题时能快速解决。

代码仓库：[**vb-design**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2FFoneQinrf%2Fvb-design "https://github.com/FoneQinrf/vb-design")

*   #### 参考资料或代码
    

1.  [**pnpm**](https://link.juejin.cn?target=https%3A%2F%2Fpnpm.io%2F "https://pnpm.io/")
2.  [**nutui**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fjdf2e%2Fnutui "https://github.com/jdf2e/nutui")
3.  [**vant**](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fyouzan%2Fvant "https://github.com/youzan/vant")