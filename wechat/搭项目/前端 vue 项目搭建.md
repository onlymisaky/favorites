> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vUnHkR9hYzCULrmiAcZqBw)

大纲

  

  









---------------------

> 搭建脚手架：
> 
> *   初始化脚手架
>     
> *   限定包管理器
>     
> *   开放局域网访问
>     
> *   统一编辑器编码风格
>     
> *   配置 Prettier
>     
> *   配置 ESLint
>     
> *   `ESLint`、`Prettier` 以及 `EditorConfig` 的区别
>     
> *   配置 stylelint
>     
> *   配置 Browserslist
>     
> *   配置保存时执行代码检查
>     
> *   配置 PostCSS
>     
> *   配置别名路径
>     
> *   禁止 git 转换换行符
>     
> *   集成 husky
>     
> *   集成 lint-staged
>     
> *   检测提交日志
>     
> 
> vue 项目优化：
> 
> *   修改标题和语言
>     
> *   vite 代码提示
>     
> *   svg 图标组件
>     
> *   png 图片组件
>     
> *   plugins 目录
>     
> *   全局样式
>     
> *   路由自动化
>     
> *   添加组件实例方法
>     

初始化脚手架

  

  









-------------------------

推荐使用 Vite 来创建一个 Vue 项目：

```
# vue3
$ npm create vue@latest

# vue2
$ npm create vue@legacy
```

```
# .npmrc
registry=https://registry.npm.taobao.org
```

限定包管理器

  

  









-------------------------

当前常见的依赖包管理器有：

<table data-line="53" dir="auto"><thead data-line="53" dir="auto"><tr data-line="53" dir="auto"><th>包管理器</th><th>优势</th><th>劣势</th><th>lock 文件</th></tr></thead><tbody data-line="55" dir="auto"><tr data-line="55" dir="auto"><td><em><code>npm</code></em></td><td>官方工具，原生支持</td><td>速度慢</td><td><em><code>npm-lock.json</code></em></td></tr><tr data-line="56" dir="auto"><td><em><code>yarn</code></em></td><td>快速高效，界面美观</td><td>-</td><td><em><code>yarn.lock</code></em></td></tr><tr data-line="57" dir="auto"><td><em><code>pnpm</code></em></td><td>极致速度，节省空间</td><td>非扁平化</td><td><em><code>pnpm-lock.yaml</code></em><code></code></td></tr></tbody></table>

_cnpm_ 是不推荐使用的，因为没有 lock 文件。如果要使用淘宝镜像，推荐使用配置文件（项目根目录下的 _.npmrc_ 文件）指定：

```
// package.json
{
  "scripts": {
    "preinstall": "npx only-allow yarn"
  }
}
```

lock 文件在安装依赖时生成，用于锁定依赖包的具体版本，非常重要，应该被添加到版本管理中。但由于不同的包管理器生成的 lock 文件不一致，所以需要统一项目成员使用的包管理器，可以使用 _only-allow_ 来限定包管理器。

在 _package.json_ 中添加对应的脚本，在安装依赖前检查使用的包管理器：

```
// vite.config.js
import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    // 监听所有IP地址
    host: true,
  },
});
```

相关链接（查看如何限定其他包管理器）：

*   [only-allow](https://www.npmjs.com/package/only-allow)
    

```
# .editorconfig

root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

开放局域网访问

  

  









--------------------------

如果需要允许局域网中的其他电脑访问项目，可以在 vite.config.js 中设置监听所有 IP 地址：

```
// .prettierrc.json
{
  "singleQuote": true,
  "endOfLine": "lf"
}
```

相关链接：

*   [server.host](https://cn.vitejs.dev/config/server-options.html#server-host)
    

统一编辑器编码风格

  

  









----------------------------

使用 _EditorConfig_ 来统一编辑器的编码风格。在项目根目录下创建文件 _.editorconfig_：

```
{
  "scripts": {
    "lint": "eslint --fix 'src/**/*.{vue,ts,tsx}'"
  }
}
```

> 部分编辑器需要安装插件才能支持此功能，比如 _VSCode_ 需要安装插件 _EditorConfig for VS Code_。但 WebStorm 原生支持。

相关链接：

*   [EditorConfig](https://editorconfig.org/)
    
*   [EditorConfig Specification](https://spec.editorconfig.org/)  
    
*   [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
    

配置 Prettier

  

  









------------------------------

在初始化脚手架时选择使用 _Prettier_，在项目根目录下创建文件 _.prettierrc.json_：

```
# 将 Prettier 集成到 stylelint 规则中
# stylelint-prettier
# 关闭与 Prettier 冲突的 stylelint 规则
# stylelint-config-prettier-scss
# 用于约束 css 属性的顺序
# stylelint-config-recess-order
# 用于识别 vue 文件中的样式代码
# stylelint-config-recommended-vue
# 用于识别 scss 代码
# stylelint-config-standard-scss
# 根据 browserslist 来检查样式代码的浏览器兼容性
# stylelint-no-unsupported-browser-features
$ yarn add -D stylelint stylelint-prettier stylelint-config-prettier-scss stylelint-config-recess-order stylelint-config-recommended-vue stylelint-config-standard-scss stylelint-no-unsupported-browser-features
```

> 使用 json 文件配置的原因是，编辑器安装 Prettier 插件后可以对配置文件智能提示。

相关链接：

*   [Prettier 配置项](https://www.prettier.cn/docs/options.html)
    
*   [Prettier 配置文件格式](https://www.prettier.cn/docs/configuration.html)
    
*   [Prettier 集成到编辑器](https://www.prettier.cn/docs/editors.html)
    
*   [Prettier 集成到 ESLint](https://www.prettier.cn/docs/integrating-with-linters.html)
    
*   [Prettier 忽略文件](https://www.prettier.cn/docs/ignore.html)
    

配置 ESLint

  

  









----------------------------

在初始化脚手架时选择使用 _ESLint_，会自动在项目根目录下生成配置文件 _.eslintrc.cjs_。可以直接使用生成的配置，但编辑器可能需要安装 _ESLint_ 插件。

另外，可以修改以下 _ESLint_ 检测脚本：

```
// .stylelintrc.json
{
  "extends": [
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue/scss",
    "stylelint-config-recess-order",
    "stylelint-config-prettier-scss",
    "stylelint-prettier/recommended"
  ],
  "plugins": ["stylelint-no-unsupported-browser-features"],
  "rules": {
    // 如果使用 BEM 命名规范，可以用这个规则检测选择器名称是否合法
    "selector-class-pattern": [
      "^([a-z0-9]+)+([\\-][a-z0-9]+)*(__([a-z0-9]+)+([\\-][a-z0-9]+)*)?(--([a-z0-9]+)+([\\-][a-z0-9]+)*)?$",
      {
        "resolveNestedSelectors": true
      }
    ],
    "plugin/no-unsupported-browser-features": [
      true,
      {
        "severity": "warning"
      }
    ],
    // 配置自定义的 css 单位
    "unit-no-unknown": [
      true,
      {
        "ignoreUnits": ["rpx"]
      }
    ]
  }
}
```

相关链接：

*   [ESLint](https://zh-hans.eslint.org/docs/latest/use/getting-started)
    
*   [ESLint 集成到编辑器](https://zh-hans.eslint.org/docs/latest/use/integrations)
    

ESLint、Prettier 以及 EditorConfig 的区别

  

  









------------------------------------------------------

_ESLint_ 是一种 _Linter_，也就是代码检查工具。

*   检查代码中的潜在问题，比如使用了未定义的变量，并可以自动修复部分问题
    
*   内置的解析器只能解析 js 文件
    

_Prettier_ 是格式化工具。

*   只调整代码风格，比如空格、换行等，不会改动代码本身
    
*   支持比 _ESLint_ 更多的文件格式  
    

_EditorConfig_ 用于覆盖编辑器自身配置。

*   可以调整新建文件时的缩进方式，这是格式化工具做不到的
    
*   支持任意文件，但可调整项更少，因为更通用  
    

配置 stylelint

  

  









-------------------------------

_ESLint_ 用于检查 js 代码，而 _stylelint_ 是用于检查 css 代码的。

安装 _stylelint_ 及相关插件：

```
// package.json
{
  "scripts": {
    "lint:style": "stylelint --fix 'src/**/*.{vue,css,scss}'"
  }
}
```

在项目根目录下添加配置文件 _.stylelintrc.json_。

```
defaults and supports es6-module and supports es6-module-dynamic-import
```

在 _package.json_ 中添加对应的脚本：

```
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "vue"],
  "stylelint.validate": ["css", "scss", "vue"]
}
```

最后还可以安装编辑器插件来进行集成，这样在检查到错误时会使用下划线标出。

相关链接：

*   [stylelint](https://stylelint.io/)
    
*   [VSCode Stylelint 插件](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)  
    

配置 Browserslist

  

  









----------------------------------

在根目录下创建配置文件 _.browserslistrc_，用于配置兼容的目标浏览器。

```
// .postcssrc.json
{
  "plugins": {
    // 支持使用未发布的 css 语法，根据 browserslist 来进行转译
    "postcss-preset-env": {},
    // 支持自定义 css 单位 rpx
    "postcss-plugin-rpx2vw": {
      "viewportWidth": 375
    }
  }
}
```

这个文件是给其他插件使用的，比如根据目标浏览器列表自动在 css 中添加前缀的插件 _Autoprefixer_。在 VSCode 中可以安装对应插件来高亮此文件。

相关链接：

*   [browserslist](https://github.com/browserslist/browserslist)
    
*   [VSCode browserslist 插件](https://marketplace.visualstudio.com/items?itemName=webben.browserslist)  
    
*   [Autoprefixer](https://github.com/postcss/autoprefixer)
    

配置保存时执行代码检查

  

  









------------------------------

编辑器可以配置在保存时执行代码检查，比如 VSCode 的配置文件是 _.vscode/settings.json_：

```
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

这是 VSCode 工作区的配置文件，不应该添加到版本库中，应该通过 _.gitignore_ 文件从版本库中排除。之前在初始化脚手架时应该已经排除了这个文件。

> 这个步骤是可选的，因为保存时执行检查会消耗资源，拖慢代码保存时间，我们也可以只在 git 提交时执行检查。

配置 PostCSS

  

  









-----------------------------

_PostCSS_ 是 css 后处理器，通过插件的方式来修改生成的 css 代码。因为脚手架已经支持了 _PostCSS_，所以只需要在项目根目录下添加配置文件 _.postcssrc.json_ 即可使用。

```
// vite.config.js
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths({ loose: true })],
});
```

相关链接：

*   [PostCSS](https://github.com/postcss/postcss/blob/main/docs/README-cn.md)
    
*   [支持的配置文件格式](https://github.com/postcss/postcss-load-config)  
    

配置别名路径

  

  









-------------------------

在项目根目录下添加配置文件 _tsconfig.json_（或者 _jsconfig.json_），来配置别名语法。

```
* -text
```

这样，VSCode 就可以识别别名路径，支持点击跳转、类型识别。但是，非 js 文件路径必须写完整后缀才可以识别，如果要强行校验这一点，可以使用 _eslint-plugin-import_。

Vite 也需要识别别名路径，可以通过插件 _vite-tsconfig-paths_ 从 _tsconfig.json_ 文件中读取。

```
* text=auto eol=lf
```

相关链接：

*   [paths](https://www.typescriptlang.org/zh/tsconfig#paths)
    
*   [路径映射](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)  
    
*   [vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths)
    

禁止 git 转换换行符

  

  









-------------------------------

在项目根目录下添加文件 _.gitattributes_。

可以将所有文件当成非文本文件，来防止换行符转换：

```
npx husky-init && npm install
```

也可以强制使用换行符 LF：

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm test
```

集成 husky

  

  









---------------------------

代码检测工具有三种集成方式，对应三种检测代码的时机：

编辑器集成：

*   通过安装编辑器相关插件来集成
    
*   实时检测代码中的错误，并使用下划线展示  
    
*   保存代码时修复代码中的问题
    

打包工具集成：

*   通过 webpack loader 或 vite 插件来集成
    
*   代码编译时，通过终端或浏览器中的 overlay 来提示代码中的问题  
    

git 集成：

*   通过 git 提供的钩子，在提交代码时检测
    
*   这可以确保提交的代码符合规范
    

通过 _husky_ 来管理 git 钩子，在代码提交时执行检测命令。安装命令是：

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx eslint --fix "src/**/*.{vue,js}"
npx stylelint --fix "src/**/*.{vue,css}"
```

这条命令会配置 git，指定 git hook 脚本所在目录为_.husky_，并且默认安装了一个 hook 叫做 _pre-commit_，对应的脚本文件是 _.husky/pre-commit_，里面会执行一条 _npm test_ 命令。

```
// package.json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

这个 hook 正好指的是在 git 提交前执行，也就是说在 git 提交代码的时候会自动执行 _npm test_ 命令。所以我们直接把它替换成我们想要的命令即可。

```
yarn add -D lint-staged
```

最后添加 _prepare_ 脚本，以便在首次安装依赖时设置 git 钩子。

```
// package.json
{
  "lint-staged": {
    "*.{vue,ts,tsx}": "eslint --fix",
    "*.{vue,css,scss}": "stylelint --fix"
  }
}
```

> 也可以使用 mrm 来设置 husky，这个工具擅长检测项目安装的依赖，自动生成各种配置。使用前请提交代码，以便知道这个工具做了哪些更改。

相关链接：

*   [husky](https://typicode.github.io/husky/getting-started.html)
    
*   [mrm](https://mrm.js.org/docs/getting-started)  
    

集成 lint-staged

  

  









---------------------------------

提交时执行的代码检查命令是针对整个工作区，这没有必要，应该只检查暂存区的代码。要做到这一点，可以使用 _lint-staged_。

首先安装它：

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

然后把代码检测的命令放在 _package.json_ 中。

```
<type>(<scope>): <description>
// 空一行
<body>
// 空一行
<footer>
```

将 _husky_ 脚本 _.husky/pre-commit_ 中的命令替换成 _npx lint-stage_。

```
# 安装命令行工具
$ yarn add -D @commitlint/cli
# 安装配置集
$ yarn add -D @commitlint/config-conventional
```

相关链接：

*   [lint-staged](https://github.com/okonet/lint-staged)
    

检测提交日志

  

  









-------------------------

代码提交一般使用约定式提交（Conventional Commits），提交信息的格式如下：

```
// .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"]
}
```

只有类型和描述是必需的，所以一个最简单的示例为：_feat: 添加中文语言支持_。

常见的 **类型（type）**如下：

*   _feat_ 添加功能，引入新特性
    
*   _fix_ 错误修复，修复 bug
    
*   _refactor_ 代码重构，既不是修复 bug 也不是添加特性的代码更改
    
*   _chore_ 杂务处理，其他不会修改源文件或测试文件的更改
    
*   _docs_ 文档变更，添加或者更新文档
    
*   _style_ 格式调整，不会影响代码含义的更改（空格，格式，缺少分号等）
    
*   _perf_ 性能优化，更改代码以提高性能
    
*   _revert_ 恢复版本，恢复到上一个版本
    

_feat_ 和 _fix_ 分别对应语义化版本中的 _MINOR_ 和 _PATCH_，它们会出现在自动生成的更新日志中。其他的类型不是必需的，你可以配置在项目中允许使用哪些类型。

首先安装依赖：

```
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
```

然后在根目录下添加配置文件 _.commitlintrc.json_：

```
<html lang="zh-cmn-Hans">
  <title>Vue 项目演示</title>
</html>
```

最后使用 husky 添加 git 钩子，在提交时进行校验。

```
/// <reference types="vite/client" />
```

相关链接：

*   [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
    

修改标题和语言

  

  









--------------------------

在 _index.html_ 中修改文档标题和语言，比如：

```
yarn add -D vite-plugin-svg-icons
```

vite 代码提示

  

  









----------------------------

在项目根目录（其实可以是任意目录）添加配置文件 _vite-env.d.ts_。

```
// vite.config.js
import { fileURLToPath, URL } from 'node:url';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      // 指定svg图标文件夹
      iconDirs: [fileURLToPath(new URL('./src/assets/svg', import.meta.url))],
    }),
  ],
});
```

这可以为 glob 导入等功能添加类型声明。

相关链接：

*   [客户端类型](https://cn.vitejs.dev/guide/features.html#client-types)
    

svg 图标组件

  

  









---------------------------

使用 _vite-plugin-svg-icons_ 生成 svg 雪碧图。

安装插件：

```
<!-- src/components/SvgIcon.vue -->
<template>
  <svg width="1em" height="1em" aria-hidden="true">
    <use :xlink:href="`#icon-${name}`"></use>
  </svg>
</template>

<script>
  // 生成雪碧图DOM节点并插入文档
  import 'virtual:svg-icons-register';

  export default {
    props: {
      /** 图标名 */
      name: String,
    },
  };
</script>

<style lang="scss" scoped>
  svg {
    vertical-align: middle;
  }
</style>
```

在 _vite.config.js_ 中引入此插件：

```
// vite-env.d.ts
/// <reference types="vite-plugin-svg-icons/client" />
```

编写图标文件：

```
- logo.png
- logo@2x.png
- logo@3x.png
```

还可以添加以下类型提示：

```
<PngIcon  />
```

相关链接：

*   [vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons/blob/main/README.zh_CN.md)
    

png 图片组件

  

  









---------------------------

png 图片和 svg 图标的不同之处在于图片尺寸不固定，并且 png 属于位图。之所以需要封装组件，主要是为了支持多倍图。

假设有如下 png 文件：

```
<img src="logo.png" srcset="logo@2x.png 2x, logo@3x.png 3x" />
```

我们期望 png 图片组件的使用方式为：

```
<!-- PngIcon.vue -->
<template>
  <img :src="src" :srcset="srcset" />
</template>

<script>
  /**
   * 图片组件，根据图片名自动寻找对应的图片，具体规则如下：
   *
   * - 使用文件夹 `src/assets/png` 中的 png 图标，png 图标支持多倍图
   */

  /**
   * png 图片汇总
   * @type {{ [name: string]: { src?: string, srcset?: string }}} 图标名对应的图片属性
   *
   * @example
   * - src/assets/png/logo.png
   * - src/assets/png/logo@2x.png
   * - src/assets/png/logo@3x.png
   * PNG_ICONS === {
   *   logo: {
   *     src: 'src/assets/png/logo.png',
   *     srcset: 'src/assets/png/logo@2x.png,src/assets/png/logo@3x.png'
   *   }
   * }
   */
  const PNG_ICONS = ((images) => {
    const ICONS = Object.create(null);
    /**
     * @type {{ [name: string]: { [dpr: string]: string }}}
     * @example
     * META === {
     *   logo: {
     *     '1x': 'src/assets/png/logo.png',
     *     '2x': 'src/assets/png/logo@2x.png',
     *     '3x': 'src/assets/png/logo@3x.png',
     *   }
     * }
     */
    const META = Object.create(null);
    for (const key of Object.keys(images)) {
      const [, name, dpr = '1x'] = key
        .split('/')
        .pop()
        .split('.')
        .slice(0, -1)
        .join('.')
        .match(/^(.+?)(?:@(\d+x))?$/);
      META[name] = META[name] || Object.create(null);
      META[name][dpr] = images[key];
    }
    for (const name of Object.keys(META)) {
      const dpr2url = META[name];
      ICONS[name] = {};
      const srcset = [];
      for (const dpr of Object.keys(dpr2url).sort(
        (a, b) => parseInt(a) - parseInt(b)
      )) {
        const url = dpr2url[dpr];
        if (dpr === '1x') {
          ICONS[name].src = url;
        } else {
          srcset.push(`${url} ${dpr}`);
        }
      }
      if (srcset.length > 0) {
        ICONS[name].srcset = srcset.join(',');
      }
    }
    return ICONS;
  })(import.meta.glob('@/assets/png/*.png', { eager: true, as: 'url' }));

  export default {
    props: {
      /** 图标名 */
      name: String,
    },
    computed: {
      src() {
        return PNG_ICONS[this.name]?.src;
      },
      srcset() {
        return PNG_ICONS[this.name]?.srcset;
      },
    },
  };
</script>

<style lang="scss" scoped>
  img {
    vertical-align: middle;
  }
</style>
```

期望的渲染结果是：

```
// main.js
import.meta.glob('./plugins/*.js', { eager: true });
```

所以 _PngIcon.vue_ 组件的源码如下：

```
// main.js
import.meta.glob('./assets/styles/*.scss', { eager: true });
```

plugins 目录

  

  









-----------------------------

新建 _src/plugins_ 目录，并在 _main.js_ 中执行如下语句：

```
- reset.scss # 样式重置
- transitions.scss # 全局过渡动画
- element.scss # ElementUI 样式重置
- vars-color.scss # 全局颜色变量
- vars-size.scss # 全局尺寸变量
- vars-font.scss # 字体相关变量
- font-family.scss # 引入字体
```

_plugins_ 目录下的脚本将在 _Vue_ 初始化前自动执行。这样做的好处是可以随时往 _plugins_ 目录中添加或删除文件，而不必把所有初始化代码都放在 _main.js_ 中。

全局样式

  

  









-----------------------

新建 _src/assets/styles_ 目录，并在 _main.js_ 中执行如下语句：

```
// reset.scss
html,
body,
#app {
  height: 100%;
  overflow: hidden;
  color: var(--color-text);
  background-color: var(--color-bg);
}

body {
  margin: 0;
}

#app {
  overflow: hidden auto;
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  word-break: break-word;
  white-space: pre-wrap;
  user-select: none;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -moz-osx-font-smoothing: grayscale;
}

// safari 默认样式重置
button,
input,
textarea {
  font-size: 14px;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;

  &-track {
    background-color: transparent;
  }

  &-thumb {
    border-radius: 4px;
    background-color: #b7b2b2;
  }
}
```

这样会自动引入 _styles_ 目录下的全局样式文件，比如：

```
// vars-color.scss
:root {
  --color-primary: #69f;
  --color-danger: #ee0a24;
  --color-success: #07c160;
  --color-warning: #ff976a;
  --color-link: #1989fa;
  --color-text: var(--color-text-85);
  --color-text-85: rgb(0 0 0 / 85%);
  --color-text-65: rgb(0 0 0 / 65%);
  --color-text-45: rgb(0 0 0 / 45%);
  --color-text-35: rgb(0 0 0 / 35%);
  --color-text-15: rgb(0 0 0 / 15%);
  --color-border: #eee;
  --color-disabled: #999;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text-85: rgb(255 255 255 / 85%);
    --color-text-65: rgb(255 255 255 / 65%);
    --color-text-45: rgb(255 255 255 / 45%);
    --color-text-35: rgb(255 255 255 / 35%);
    --color-text-15: rgb(255 255 255 / 15%);
    --color-border: #333;
    --color-disabled: #666;
  }
}
```

示例代码如下：

```
// vars-font.scss
:root {
  --font-weight-medium: 600;
}
```

```
// transitions.scss
:root {
  --transition-duration: 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-duration: 0;
  }
}

.forward {
  &-enter-from {
    transform: translateX(100%);
  }

  &-leave-to {
    transform: translateX(-30%);
  }

  &-enter-active,
  &-leave-active {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-color: #fafafa;
    transition: transform var(--transition-duration);
  }
}

.backward {
  &-leave-to {
    transform: translateX(100%);
  }

  &-enter-from {
    transform: translateX(-30%);
  }

  &-enter-active,
  &-leave-active {
    position: fixed;
    inset: 0;
    z-index: 0;
    background-color: #fafafa;
    transition: transform var(--transition-duration);
  }

  &-leave-active {
    z-index: 1;
  }
}
```

```
yarn add -D vite-plugin-pages
```

```
// vite.config.js
import { defineConfig } from 'vite';
import Pages from 'vite-plugin-pages';

export default defineConfig({
  plugins: [
    Pages({
      dirs: 'src/views',
    }),
  ],
});
```

路由自动化

  

  









------------------------

配置路由文件挺麻烦的，可以考虑根据目录结构生成路由文件。

首先安装插件：

```
// src/plugins/router.js
import Vue from 'vue';
import VueRouter from 'vue-router';
// 这个 ~pages 是一个虚拟模块，内容是生成的路由配置
import routes from '~pages';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: import.meta.env.BASE_URL,
  routes,
});

export default router;
```

然后在 _vite.config.js_ 中引入：

```
// vite-env.d.ts
/// <reference types="vite-plugin-pages/client" />
```

最后修改路由配置文件：

```
// vite-env.d.ts
import { AxiosInstance } from "axios";

declare module 'vue/types/vue' {
  interface Vue {
    $http: AxiosInstance
  }
}
```

你还可以添加一下类型提示：

```
// vite-env.d.ts
/// <reference types="vite-plugin-pages/client" />
```

> _vite-plugin-pages_ 项目 github 上的介绍页更推荐使用 _unplugin-vue-router_，因为后者和 _vue-router_ 是同一个作者写的，与 _vue-router_ 的集成度更高。但是，unplugin-vue-router 目前仍处于实验阶段，且官方支持的 Vue Router 版本是 4.1.0 以上。

相关链接：

*   [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages)
    
*   [unplugin-vue-router](https://github.com/posva/unplugin-vue-router)  
    

添加组件实例方法

  

  









---------------------------

组件实例方法是指添加到 _Vue.prototype_ 上的方法，可以直接在组件实例中使用，比如 _this.$http_。我们可以为它们添加类型提示。

```
// vite-env.d.ts
import { AxiosInstance } from "axios";
declare module 'vue/types/vue' {
  interface Vue {
    $http: AxiosInstance
  }
}
```

![](https://mmbiz.qpic.cn/mmbiz_png/iakryfYqmUd2OsDFClJC8lvNLL8KbRF0wFmcmPC04dC3MzlHmzW7hQQhS7ytZCU7JDJnIWoJh9WbplBwgX2xBNg/640?wx_fmt=png)

点开阅读原文

发现更多精彩

使用 EditorConfig 来统一编辑器的编码风格。在项目根目录下创建文件 .editorconfig：