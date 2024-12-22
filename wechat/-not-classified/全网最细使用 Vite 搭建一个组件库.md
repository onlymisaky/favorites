> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/9wZwruWXbGUf2c6cjdzxOw)

> 先使用 vite 搭建基础版本脚手架这里不做讲解、由于 vite 初始化什么都没有安装、我采用了自己改造过的脚手架

详情见 GitHub 内置`vue-router、commitlint、stylelint、eslint、prettier、unplugin-vue-components、unplugin-auto-import、lint-staged、sentry、pinia、husky...`基本上可以满足团队日常开发需求。

😅言归正传、生成目录大概是这样的

```
├── README.md
├── commitlint.config.cjs
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   ├── version.txt
│   └── vite.svg
├── src
│   ├── App.vue
│   ├── api
│   │   └── index.ts
│   ├── assets
│   ├── auto-imports.d.ts
│   ├── components
│   ├── components.d.ts
│   ├── global.d.ts
│   ├── hooks
│   ├── intercept.ts
│   ├── main.ts
│   ├── router
│   ├── store
│   ├── utils
│   ├── views
│   ├── vite-env.d.ts
│   └── workers
│       ├── versionCheckWorker.ts
│       └── worker.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

一系列的修改操作
--------

1.  修改`src`为`packages`，删除`views`目录
    
2.  修改`alias`把所有和`src`相关的别名路径修改为`components`、修改目录为`vite.config.ts`、`tsconfig.json`
    

```
// vite.config.ts
 alias: [
        {
            find: "@",
            replacement: resolve(__dirname, "../packages"),
        },
    ],
```

```
// tsconfig.json
{
...
 "paths": {
            "@/*": [
                "packages/*"
            ],
          },
...
}
```

3.  删除不需要用到的文件夹 `store`...
    
4.  修改 index.html 中`script`标签中`src`路径为`/packages/main.ts`
    
5.  `packages` 下新建文件夹`theme-chalk` 后续用来存放样式
    

修改后的目录结构
--------

```
├── README.md
├── commitlint.config.cjs
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   ├── version.txt
│   └── vite.svg
├── packages
│   ├── App.vue
│   ├── api
│   ├── assets
│   ├── auto-imports.d.ts
│   ├── components
│   ├── components.d.ts
│   ├── global.d.ts
│   ├── hooks
│   ├── intercept.ts
│   ├── main.ts
│   ├── router
│   ├── store
│   ├── utils
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

后续就可以在`components`文件夹下开发组件了, 查看组件的话直接在`router`上配置路径即可

> **敲黑板**：每个组件必须设置`name`，不然后续全局注册会有问题 `components`整体格式如下

```
├── components
    ├── button
    │   ├──Button.vue
    │   └──index.ts
    └──index.ts
```

相关代码如下

```
<!-- Button.vue -->
<template>
    <div class="bq-button">
        <span>-测试按钮-6</span>
    </div>
</template>

<script setup lang="ts">
defineOptions({
    name: "BqButton",
});
</script>

<style lang="scss" scoped>
@import "@theme-chalk/button.scss";
</style>
```

```
// index.ts
import Button from "./Button.vue";
import { withInstall } from "../../utils/tool";
export const BqButton = withInstall(Button);
export default BqButton;
```

`withInstall`相关方法如下、主要是为了全局注册

```
import type { App } from "vue";
export const withInstall = <T extends Component>(comp: T) => {
    (comp as Record<string, unknown>).install = (app: App) => {
        const compName = comp.name;
        if (!compName) return;
        app.component(compName, comp);
    };
    return comp;
};
```

```
// 最外层index.ts
export * from "./button";
```

这时候我们的组件基本就写好了，查看组件只需要在`router`下配置路径即可

```
{
        path: "/",
        name: "button",
        meta: {
            title: "login",
        },
        component: () => import(/* webpackChunkName: "button" */ "@/components/button/Button.vue"),
    },
```

打包配置
====

先给大家看配置、再给大家讲为什么

```
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { pluginsConfig, resolveConfig } from "./scripts/preview";
import dts from "vite-plugin-dts";
export default defineConfig(() => {
    return {
        build: {
            outDir: "build",
            cssCodeSplit: true,
            rollupOptions: {
                external: ["three", "@ant-design/icons-vue", "ant-design-vue", "unplugin-vue-components", "unplugin-auto-import", "vue"],
                output: [
                    {
                        format: "es",
                        entryFileNames: "[name].js",
                        exports: "named",
                        name: "BqDesign",
                        dir: "./build/dist",
                    },
                    {
                        format: "es",
                        entryFileNames: "[name].js",
                        exports: "named",
                        preserveModules: true,
                        preserveModulesRoot: "packages",
                        dir: "./build/es",
                    },
                    {
                        format: "cjs",
                        entryFileNames: "[name].js",
                        exports: "named",
                        preserveModules: true,
                        preserveModulesRoot: "packages",
                        dir: "./build/lib",
                    },
                ],
            },
            lib: {
                entry: resolve(__dirname, "./packages/index.ts"),
                name: "BqDesign",
                fileName: (format) => `bq-design.${format}.js`,
                formats: ["es", "cjs"],
            },
        },
        plugins: [
            vue(),
            dts({
                tsconfigPath: "./tsconfig.prod.json",
                outDir: "build/lib",
            }),
            dts({
                tsconfigPath: "./tsconfig.prod.json",
                outDir: "build/es",
            }),
            ...pluginsConfig,
        ],
        resolve: resolveConfig,
    };
});
```

一点一点给大家捋一下为什么这么写
----------------

### 1、为什么`output`需要这样配置

首先按照官网给的示例配置并执行

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibscFnYK5gA7vT2EJMFdPnqGaG4zGToeTw7r3ibx6ET15s4ic2R2cdcwvDUNaprrnWvxFgSvtMy2FPUw/640?wx_fmt=png&from=appmsg)image.png

打包后，有问题吗？没问题。但就是有点奇怪，因为我们打包后结构是这样的

```
└── dist
    ├── index.js
    └── style.css
```

毕竟我们都是见过世面的🤓，为什么我们打包出来的和`ant-design-vue`、`ElementPlus`差距这么大， 其实小编在做这个事情的时候也看了这些优秀的开源组件库、毕竟学习的过程就是先`模仿`后`创造`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibscFnYK5gA7vT2EJMFdPnqG4UBIg0d43LL0icqcAhNiaqUQAumNSn2FQ3fWy8BMYjbaUc8VrUYVJqXw/640?wx_fmt=png&from=appmsg)image.png

大概看了一下 `ElementPlus` 是基于 vite 开发的，`ant-design-vue`还是 webpack、那我们先看一下`ElementPlus`打包后的结构大概如下

```
└── build
    ├── dist
    ├── es
    ├── lib
    ├── README.md
    └── package.json
```

很明显他输出了三个包（说明我们在 output 中也需要配置 3 个输出文件）、首先`es`文件夹用来兼容`esm`语法、`lib`文件夹兼容`commentJs`、`dist`也是 esm 语法`他的css是打包在一个文件`里的主要是为了全局引入 css，配置好后大概是这个样子

```
output: [
                    {
                        format: "es",
                        entryFileNames: "[name].js",
                        dir: "./build/dist",
                    },
                    {
                        format: "es",
                        entryFileNames: "[name].js",
                        dir: "./build/es",
                    },
                    {
                        format: "cjs",
                        entryFileNames: "[name].js",
                        dir: "./build/lib",
                    },
                ],
```

之后我们执行打包脚步 `pnpm run build` 不报错的情况下打包出来应该已经是有三个文件了，但好像`js`和`css`还是在一起，怎么办？当然是看文档了🤑

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibscFnYK5gA7vT2EJMFdPnqGyxTcBrdkrJ1VUGtXqTxlYYFtRUch8Y9euU9nZk1ibY9ribc93yiabZYog/640?wx_fmt=png&from=appmsg)image.png![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibscFnYK5gA7vT2EJMFdPnqGnnXDsJmicibBB3nRXd3xczdcq4HxHxWPibVcKQFD7MibUvMEg0H0hwu8YA/640?wx_fmt=png&from=appmsg)image.png

原来如此、配置后执行打包命令，果然没问题

### 2、为什么`cssCodeSplit`是要改为`true`？

因为在`vite`在`lib`模式下`cssCodeSplit`默认是`false`，其实官方有说明，可只在英文文档做了说明🥲

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibscFnYK5gA7vT2EJMFdPnqGOJhZfJHVrMCfXxRMRW9qSzeQHT1egZ9LkVbcbAScYicqWIG2M4C02LQ/640?wx_fmt=png&from=appmsg)image.png

> 没注意到的打包后所有组件 css 都在一个文件、后续就没有办法实现我们的按需引入了

### 3、如何打包出 ts 类型标注

使用`pnpm`下载 `vite-plugin-dts` 该插件

`pnpm add vite-plugin-dts -D`

由于我们在`lib`和`es`库里都需要打包 ts，所以需要配置两个 dts, 代码如下

```
dts({
                tsconfigPath: "./tsconfig.prod.json",
                outDir: "build/lib",
            }),
            dts({
                tsconfigPath: "./tsconfig.prod.json",
                outDir: "build/es",
            }),
```

> tsconfigPath，需要单独引入一个新的 tsconfig 配置、主要是因为我们打包的 include 和 exclude 配置和实际开发中还是有一定区别。并且 include 配置有问题会导致打包出的类型没有放在实际文件夹下。

新建了一个 tsconfig.prod.json 文件，代码如下

```
{
    "extends": "./tsconfig.json",
    "include": [
        "packages/**/*.vue",
        "packages/**/*.d.ts",
        "packages/**/*.ts",
    ],
    "exclude": [
        "./packages/main.ts",
        "node_modules",
        "./packages/router/*"
    ]
}
```

走到这里其实我们的组件已经小有所成了

开发文档
====

一个好的组件离不开一个优秀的文档、这里我推荐大家使用`VitePress`，相对于市面上其他的文档生成工具`VitePress`拥有着强大的生态环境和相对稳定的版本，文档地址，根据文档操作，之后会在最外层目录下生成一个 docs 文件，里面就可以快乐的写我们的文档了，这里就不做演示了。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibscFnYK5gA7vT2EJMFdPnqGx3EJg86rX89iaaYibdm6XPfZHBnIjQUhchheOJVx9D0lpibUUKLncNZQg/640?wx_fmt=png&from=appmsg)image.png

关于 unplugin-vue-components 自动引入
===============================

```
const BqDesignResolver = () => {
    return {
        type: "component" as const,
        resolve: (name) => {
            if (name.startsWith("Bq")) {
                const pathName = name.slice(2).toLowerCase();
                return {
                    importName: name,
                    from: "bq-design",
                    path: `bq-design/es/components/${pathName}/index.js`,
                    sideEffects: `bq-design/es/components/${pathName}/${name.slice(2)}.css`,
                };
            }
        },
    };
};
```

更改名称为自己组件库即可

手动导入组件
======

在 vite 中严格意义上是不需要手动导入，因为 Vite 提供了基于 ES Module 的开箱即用的`Tree Shaking` 功能，但有一种情况就是我开发的组件库引入了第三方包，比如 threeJs，但在实际运用中，我只引用了我的 Button 按钮，会报错, 因为我们的导出模块是有关联的，实际这么引用

> 上述情况使用`Vite`一定要在`optimizeDeps.exclude` 添加相应的包如 bq-design，因为预加载发现缺少依赖会报错

```
import {Button} from 'bq-design'
```

开发环境下是会导出全部的 bq-design（生产环境并不会哦），默认情况按需引入需要这样导入

```
import BqButton from "bq-design/es/components/button";
```

但这样还存在着无法引入样式的问题，所以我们需要自己开发一个 vite 插件进行转换，代码如下

```
export default function importPlugin() {
    const regStr = /(?<!\/\/.*|\/\*[\s\S]*?\*\/\s*)import\s*{\s*([^{}]+)\s*}\s*from\s*['"]bq-design['"]/g;
    return {
        name: "vite-plugin-import",
        enforce: "pre",
        transform: (code: string, id: string) => {
            if (id.endsWith(".vue")) {
                const str = code.replaceAll(regStr, (match, imports) => {
                    const list = imports.split(",");
                    const newPath: string[] = [];
                    list.forEach((item: string) => {
                        item = item.trim();
                        const name = item.slice(2).charAt(0).toLowerCase() + item.slice(3);
                        const str = `import ${item.trim()} from 'bq-design/es/components/${name.trim()}';
                        import 'bq-design/es/components/${name.trim()}/${item.trim().slice(2)}.css'`;
                        newPath.push(str);
                    });
                    return newPath.join(";");
                });
                return str;
            }
            return code;
        },
    };
}
```

Webpack 用户可以使用 `babel-plugin-import`进行处理同样这也是`ant-design-vue`的处理方式

本地测试组件库推荐使用 yalc
================

这是小编自己搭建的组件库地址

https://biuat.ibaiqiu.com/bq-design/

相关 github 地址

https://github.com/Js-Man-H5/bq-deign

* * *

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！