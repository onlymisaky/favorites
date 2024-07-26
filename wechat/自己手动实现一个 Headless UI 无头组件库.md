> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/YENxIK_Oh_gAdewvc7OQVQ)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
==

前面咱们已经介绍了，什么是 `Headless UI 无头组件库`了，以及如何去使用它，我相信同学们看完了之后能够已经在实际项目中运用自如了；

ps：作者之前的文章可以点击文末**阅读原文**，进入作者主页进行查看。

但是我的目的是带领大家能实现一个属于自己的，一个属于公司的、甚至属于公司和个人 KPI 的产物，那么接下来将会手摸手的一步一步指引大家去实现一个真正意义上的 `Headless UI 无头组件库`；

让我们一起开始动手吧~

> 说明：为了更好符合国内的大部分用户群体，所以主要实现一个 vue3 的 `Headless UI 无头组件库`！

一、初始化项目
=======

**1. 生成目录 & 初始化**

```
# 创建目录
mkdir my-project

# 进入
cd my-project

# 初始化
pnpm init


```

**2.  创建 `pnpm-workspace.yaml` 文件**

```
touch pnpm-workspace.yaml


```

**3.  修改 `pnpm-workspace.yaml`**

```
packages:
  - packages/*
  - playground
  - docs


```

**4.  新增 `packages/vue` 目录**

```
mkdir packages

mkdir packages/vue

cd packages/vue

pnpm init


```

**5.  新增 `typescript` 依赖**

```
# 安装到 my-project 根目录下
pnpm i typescript @types/node -Dw 

# 初始化 
npx tsc --init


```

**6. 新增 `README.md` 和 `LICENSE` 文件**

```
touch README.md LICENSE


```

二、安装 `eslint` 和 `simple-git-hooks` + `commitlint` 等基本配置
=======================================================

1. 配置 `eslint` 和 `@antfu/eslint-config`
---------------------------------------

1.  安装
    
    ```
    pnpm i eslint @antfu/eslint-config -Dw
    
    
    ```
    
    > `@antfu/eslint-config` 是一个由 Anthony Fu 创建的 ESLint 配置包，它包含了 Vue 和 Vanilla JS 项目中常见的最佳实践规则，实际项目可安可不安。
    
2.  新建 `eslint.config.js`文件
    
3.  编辑 `eslint.config.js` 文件：
    
    ```
    import antfu from '@antfu/eslint-config'
    
    export default antfu({
      ignores: ['/dist', '/node_modules', '/packages/**/dist', '/packages/**/node_modules'],
      rules: {
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/consistent-type-definitions': 'off',
        'import/first': 'off',
        'import/order': 'off',
        'symbol-description': 'off',
        'no-console': 'warn',
        'max-statements-per-line': ['error', { max: 2 }],
        'vue/one-component-per-file': 'off',
      },
    })
    
    
    
    ```
    
4.  在 `package.json` 中 `script` 添加脚本
    
    ```
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    
    
    ```
    
5.  测试
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibWPrh41DUpLHrCPYJRA6LsTYjpblZmiaDeribAK9lWV7kyfr4cJNgcN1Q/640?wx_fmt=png&from=appmsg)image.png
    

2. 配置 `simple-git-hooks` 和 `lint-staged`
----------------------------------------

1.  安装
    
    ```
    pnpm i simple-git-hooks lint-staged -Dw
    
    
    ```
    
2.  `package.json` 中添加脚本
    
    ```
    script:{
      "prepare": "npx simple-git-hooks",
    },
    "lint-staged": {
        "*": "eslint --fix"
    }
    
    
    ```
    

3. 配置 `@commitlint/config-conventional` 和 `@commitlint/cli`：
------------------------------------------------------------

1.  安装
    
    ```
    pnpm i @commitlint/config-conventional @commitlint/cli -Dw
    
    
    ```
    
2.  在 `package.json` 中添加配置和脚本
    
    ```
    "commitlint": {
        "extends": [
          "@commitlint/config-conventional"
        ]
    },
    "simple-git-hooks": {
        "pre-commit": "pnpm lint-staged",
        "commit-msg": "pnpm commitlint --edit ${1}"
      },
    
    
    ```
    

4. 执行
-----

根据上面的配置，我们在每次修改文件 git 提交后，都会按照以下顺序执行：

1.  `npx simple-git-hooks`：执行 simple-git-hooks 命令；
    
2.  `pnpm lint-staged`：执行 lint-staged 命令；
    
3.  `eslint --fix`：执行 eslint 方法，检查所有的代码是否合格；
    
4.  正常提交 `commit-msg`；
    

比较 `simple-git-hooks`  与 `husky`
--------------------------------

**1. 共同点：**

*   都是用于管理 Git 钩子（Git hooks）的工具，它们可以帮助开发团队在代码提交、推送等操作时运行预定义的脚本或命令。
    
*   可以用来执行代码格式化、静态代码分析、单元测试等任务，以确保代码质量和一致性。
    
*   都提供了对本地 Git 钩子的支持，包括但不限于 `pre-commit`、`post-commit`、`pre-push` 等钩子。
    

**2. 差异点：**

*   `功能和灵活性`：
    

*   `husky` 提供了更多的功能和灵活性，可以在提交前、提交后、推送前等不同的 Git 钩子上运行任务，并且支持与其他工具（如 lint-staged）的集成。
    
*   `simple-git-hooks` 则专注于简单的 Git 钩子管理，功能相对较少，主要用于运行基本的脚本任务。
    

*   `配置和定制`：
    

*   `husky` 提供了更丰富的配置选项和定制能力，可以根据项目的需求定义更复杂的钩子行为。
    
*   `simple-git-hooks` 更注重简单易用，配置相对简单，适合对 Git 钩子管理要求不高的项目。
    

*   `生态系统和支持`：
    

*   `husky` 在社区中有着更广泛的应用和支持，拥有更丰富的生态系统和插件，可以满足不同需求。
    
*   `simple-git-hooks` 的用户群体相对较小，生态系统相对简单。
    

> 总结：
> 
> 选择使用 `simple-git-hooks` 还是 `husky` 取决于项目的具体需求和团队的偏好。根据项目的规模、复杂度以及对 Git 钩子管理的需求，选择适合的工具可以提高开发流程的效率和代码质量。

三、配置`package/vue`核心库
====================

1. 初始化 `package/vue`
--------------------

```
# 进入目录
cd package/vue

# 初始化
pnpm init


```

2. 安装用到的基本库
-----------

*   `vue`: 这个就不解释了
    
*   `vue-tsc`: vue-tsc 是对 TypeScript 自身命令行界面 tsc 的一个封装。它的工作方式基本和 tsc 一致。
    

```
pnpm install vue vue-tsc -D


```

3. 配置工具库（可选）
------------

*   `@vueuse/core`：一个针对 Vue.js 生态系统的工具库，旨在提供一组通用的、经过测试的 Vue 3 组合式 API，帮助开发者更轻松地构建 Vue 应用程序。
    

```
pnpm install @vueuse/core -D


```

4. 配置 `tsconfig`
----------------

*   `typescript`：不解释
    
*   `@tsconfig/node18`：是 TypeScript 中的一个预定义的配置文件，它适用于 Node.js 18 的项目。在 TypeScript 中，可以使用预定义的配置文件来简化项目的配置过程，而不必手动指定所有的编译选项。
    
*   `@vue/tsconfig`：一个 TypeScript 配置文件的包装库，用于简化在 Vue.js 项目中配置 TypeScript 的过程。这个包装库提供了一组预定义的 TypeScript 配置，旨在帮助开发者轻松地配置 TypeScript 在 Vue.js 项目中的使用。如果你们不需要它的配置，可以自己写。
    

**1. 安装 `typescript` 、`@tsconfig/node18` 和 `@vue/tsconfig`**

```
pnpm install typescript @tsconfig/node18 @vue/tsconfig -D


```

**2. 添加 `tsconfig` 配置文件**

*   `tsconfig.json`：ts 配置，不解释
    
    ```
    {
      "files": [],
      "extends": ["./tsconfig.app.json"]
    }
    
    
    ```
    
*   `tsconfig.app.json`：定义项目中所需文件的基本 ts 编译规则
    
    ```
    {
      "extends": "@vue/tsconfig/tsconfig.dom.json",
      "include": [
        "env.d.ts",
        "src/**/*",
        "src/**/*.ts",
        "src/**/*.tsx",
        "src/**/*.vue"
      ],
      "compilerOptions": {
        "paths": {
          "@/*": ["src/*"],
        },
        "target": "esnext",
        "module": "esnext",
        "moduleResolution": "node",
        "strict": true,
        "jsx": "preserve",
        "sourceMap": true,
        "resolveJsonModule": true,
        "esModuleInterop": true,
        "declaration": false,
        "lib": ["esnext", "dom"],
        "baseUrl": ".",
        "skipLibCheck": true,
        "outDir": "dist"
      }
    }
    
    
    
    ```
    
*   `tsconfig.build.json`：主要用来打包所用的 ts 编译规则，执行 pnpm build 所需规则（代码与 tsconfig.app.json 类似）
    
*   `tsconfig.node.json`：专门用来配置 vite.config.ts 文件的编译规则
    
    ```
    {
      "extends": "@tsconfig/node18/tsconfig.json",
      "include": [
        "vite.config.*",
        "vitest.config.*",
        "cypress.config.*",
        "nightwatch.conf.*",
        "playwright.config.*"
      ],
      "compilerOptions": {
        "composite": true,
        "module": "ESNext",
        "types": ["node"]
      }
    }
    
    
    ```
    

5. 安装 vite 相关
-------------

*   `vite`：这个就不解释了
    
*   `@vitejs/plugin-vue`：Vite 的一个插件，用于处理 Vue 单文件组件（SFC）。
    
*   `vite-plugin-dts`：一个 Vite 插件，用于自动生成 TypeScript 类型声明文件（.d.ts 文件）并将其输出到构建目录中。
    

```
pnpm install vite @vitejs/plugin-vue vite-plugin-dts -D


```

配置 `vite.config.ts`

```
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
        tsconfigPath: 'tsconfig.build.json',
        cleanVueFileName: true,
        exclude: ['src/test/**'],
      }),
  ],

  build: {
    lib: {
      name: 'yi-ui',
      fileName: 'index',
      entry: resolve(__dirname, 'src/index.ts'),
    },
  },
})



```

6. 新建 src & build 测试
--------------------

**创建 `src`**

```
mkdir src 

touch src/index.ts


```

**编辑 src/index.ts**

```
const a = '1111'

const b = '2222'

const fn = () => {
    console.log('fn')
}

const add = (a: number, b: number) => {
    return a + b
}

export { a, b, fn, add }


```

**添加 package.json 脚本**

```
"build": "vite build",


```

**build 构建**

```
pnpm build


```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tib9teicgAbsiaAIdmiaJES43kN1eoH6iaKSwkNANiapp35rwzVGJwo3A2kntw/640?wx_fmt=png&from=appmsg)image.png

结果就会生成了 dist 目录，如下图的文件

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibI2kBVMWJQne44RWY9OGdy45cPL04jPxIfXastSb97Cc3selnMDgjQw/640?wx_fmt=png&from=appmsg)image.png

因为我们要的是能开箱即用，所以 `esm、cjs` 的文件格式就要配置好

7. 配置 exports 默认模块
------------------

```
"exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.umd.js",
      "import": "./dist/index.mjs"
    }
},
"main": "./dist/index.umd.js",
"module": "./dist/index.mjs",
"types": "./dist/index.d.ts",
"typings": "./dist/index.d.ts",


```

这样我们就可以直接在项目中使用 import 或者 require 来使用库了；

例如：

```
import { add } from '@yi-ui/vue'

add(1, 2)


```

在下面讲解的 docs 文档 和 playground 也会使用到；

* * *

到这里一个最最基本的核心库就完成了最基本的搭建，下一步我们考虑的就是测试问题了

四、单元测试
======

为什么要用单元测试
---------

因为我们写的是一个上层的工具库，所以单元测试是必不可少的；

毕竟单元测试可以验证库的每个功能模块是否按照预期工作；

在开发阶段就能发现和修复问题，而不是等到系统集成测试甚至上线后才发现，这样可以显著降低修复成本。

等等一系列的原因我们都必须得安排上；

因为咱们**主要是开发一个 vue 相关的无头组件库**，为了更好的适配，所以咱们的选择就必须是 `vitest` 了 。

vitest 配置
---------

**1. 安装**

```
cs package/vue

pnpm install vitest -D


```

**2. 新建 vitest.config.ts**

```
import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'

const r = (p: string) => resolve(__dirname, p)

export default defineConfig({
  plugins: [Vue()],
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },
})



```

**3. 配置运行脚本：package.json**

```
"script": {
    ...
    "test": "vitest",
    ...
}



```

**4. 新建一个 src/index.test.ts 文件**

```
import { describe, expect, test, it } from 'vitest'
import { add } from './index'

describe('测试', () => {
    test('函数返回值', () => {
        expect(add(1, 2)).toBe(3)
    })
})


```

**5. 执行 pnpm test**

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibcM1yDxUnriaVTz5sJZbzE7kPbZaAy2tUtooy1OuwkUXJ7ictLjoXyegg/640?wx_fmt=png&from=appmsg)image.png

五、配置 `docs` 文档
==============

为什么要用到文档
--------

1.  提高易用性与可理解性：
    

*   详细的文档能够帮助开发者快速上手，减少试错的时间，提升开发效率。
    

3.  方便安装和配置：
    

*   文档应当包含安装指南、依赖说明、编译和构建步骤，确保任何技术水平的开发者都能顺利将其集成到他们的项目中。
    

5.  示例与教程：
    

*   包含示例代码和教程的文档能够直观展示组件库的功能如何实际应用，对于初学者尤为重要。
    

7.  维护和更新指南：
    

*   文档应包含版本更新日志、迁移指南等内容，方便开发者跟踪库的最新变化并适应升级过程。
    

9.  社区建设与贡献者引导：
    

*   文档还应包含贡献指南、代码规范、提交 PR 和 issue 的流程等，鼓励社区成员参与到开源库的开发与维护工作中来。
    

安装配置 `vitepress`
----------------

**新建 docs 目录**

```
mkdir docs

cd docs 

pnpm init


```

**安装 vitepress & tailwindcss**

```
pnpm i vitepress tailwindcss -D


```

**配置 package.json**

```
"scripts": {
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  },


```

**运行 pnpm docs:dev**

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tib4f8GzibbAMENj3eOQxCOSzy0gcsGvr6TiavKE0WaSgNB1pqfEMFSqYIA/640?wx_fmt=png&from=appmsg)image.png

到这里其实文档就基本配置好了~

但是还要与我们的核心库做关联，还要有一些基本 config 配置和样式等等，这些暂时不表，因为涉及的点太多，待后续完善。

六、配置`playground`
================

为什么要配置 playground
-----------------

一句话概括就是：配置 playground 的主要目的是为了提供给开发者一个**交互式的、即时反馈的环境**，以更加便捷和直观的方式探索和学习该库的功能。

新建 vue3 项目
----------

```
mkdir playground

cd playground



```

初始化 vue3 项目

```
pnpm create vite



```

新建 nuxt 项目
----------

```
pnpm create vite

# 选择 nuxt


```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibsHy5XXvSPzIvdrhiaMQkIrvp42uTu4ic5cIoZ04xlrxtAPVglYEUU5BA/640?wx_fmt=png&from=appmsg)image.png

引入 package/vue 核心库
------------------

配置 playground/vue3 和 nuxt 项目的 package.json

```
"dependencies": {
    "@yi-ui/vue": "link:../../packages/vue",
},


```

使用 @yi-ui/vue
-------------

```
import { add } from '@yi-ui/vue'

add(1, 2)


```

七、打包构建
======

1. 配置
-----

其实我们在上面配置 package/vue 核心库的时候有添加了一个 build 命令，但是在子项目中 build 不是很方便;

所以为了统一多包管理，需要在根目录的 package.json 下配置一下

```
"scripts": {
    "clear": "rimraf packages/**/dist",
    "build": "pnpm run clear && pnpm -r --filter=./packages/** run build",
},


```

另外，我们还需要额外安装一下 `rimraf`，来删除打包的产物 dist 等目录；

```
pnpm install rimraf -Dw


```

`rimraf`：一个在 Node.js 环境中常用的 npm 包，用于递归删除文件和文件夹。其名称来源于 "rm -rf" 命令，这是在 Unix/Linux 系统中用于递归删除文件和文件夹的命令。

2.build 打包
----------

```
pnpm build


```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibH08HsAGZYng8Qq1rtsdPsyaoS6d28mibBd1lmL9dWHFCWeSfvdpSl4Q/640?wx_fmt=png&from=appmsg)image.png

八、发布 & 安装使用
===========

1.  登录 npm（按照提示输入用户名密码邮箱即可）
---------------------------

```
npm login


```

> 注意：
> 
> *   如果发布的 `npm` 包名为：`@xxx/yyy` 格式，需要先在 `npm` 注册名为：xxx 的 `organization`，否则会出现提交不成功；
>     
> *   发布到 `npm group` 时默认为 `private`，所以我们需要手动在每个 `packages` 子包中的 `package.json` 中添加如下配置；`"publishConfig": { "access": "public" },`
>     

2.  安装 `changesets`
-------------------

因为我们的项目是一个 monorepo 多包项目，所以我们使用普通的办法显然不能了；

那么这时候搭配 pnpm workspace 的工具 `changesets` 就出现了

**1. 安装 `changesets`**

```
pnpm i @changesets/cli -Dw


```

**2. 初始化 `changesets`**

```
pnpm changeset init


```

**3. 完成后项目会出现一个`.changeset`的文件夹**

```
|-- my-project
    |-- .changeset
        |-- config.json
        |-- README.md
    |-- ...


```

**4. 配置 `.changeset/config.json`**

```
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@yi-ui/playground",
    "@yi-ui/docs"
  ]
}


```

**5. 配置 `package.json` 的发布脚本**

```
{
    "script": {
        // 1. 开始交互式填写变更集，每次发布版本的时候执行，生成对应的 md 文件
        "changeset": "changeset",
        // 2. 用来统一提升版本号以及对应的md文档
        "vp": "changeset version",
        // 3. 构建产物后发版
        "release": "pnpm build && pnpm release:only",
        "release:only": "changeset publish"
    }
}



```

3. 发布
-----

**1. 随便修改 `package/vue` 下 `src/index.ts` 的代码**

**2. 按照顺序执行**

*   第一步：`pnpm changeset`
    

*   这里会让你去选择版本号、还有发版说明等等
    

*   第二步：`pnpm vp`
    

*   生成对应的 md 文档
    

至此就会在子包中生成你每次发布版本的 md 文档说明了，如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibf5KlXfibBoxQibWM0YGA5GpaoGYJ2kLstwlpicO1ia42tROYCqPBoeI1tQ/640?wx_fmt=png&from=appmsg)image.png

**3. 运行 `pnpm release` 的最终发布**

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibuP61icib86syrsbibR6BJ73tibribiaQFkb0B0OXMQRd05U6ic3kBUtUtp4TJszaESia4iaTwib2g6FkQbRVew/640?wx_fmt=png&from=appmsg)image.png

> **Tips：**
> 
> `playground` 和 `docs` 目录下的包需要在 `package.json` 中设置 `"private": true`，否则每次 `pnpm release` 会把队友的包 `publish 至 npm，从而导致 release 失败。

4. 安装使用
-------

**安装：**

```
pnpm install @yi-ui/vue


```

**使用：**

```
import { add } from '@yi-ui/vue'

add(1, 2)


```

总结
==

其实上述的流程，只是一个很基本的搭建，还有更详细配置，例如文档、单元测试等等配置其实不止上述这一点，因为要和核心库做深度绑定；

但是为了不显得文章臃肿，咱们只是一笔带过的间接了解下其最基本的配置。

当然我们不可能就这样抛弃了，所以接下来的文章，将会实现一个最基本无头组件，以及如何耦合单元测试、文档等等。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

```

最后不要忘了点个赞再走噢![](https://res.wx.qq.com/t/wx_fed/we-emoji/res/v1.3.10/assets/Expression/Expression_64@2x.png)