> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jvLAFzwJPlA5J-iNJSblag)

大厂技术  高级前端  Node 进阶

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

环境搭建
----

目前流行的组件库搭建方式都是使用 monorepo 的方式，好处很多，可以在一个代码仓库中管理多个项目，可以达到项目之间的资源共享。这里也是使用这种方式。

### 以 pnpm 构建 monorepo

首先全局安装 pnpm

```
npm install pnpm -g<br style="visibility: visible;">复制代码<br style="visibility: visible;">
```

pnpm 初始化

```
pnpm init<br style="visibility: visible;">复制代码<br style="visibility: visible;">
```

得到 `package.json` 的初始内容后删除 package.json 中的 name ，添加 `"private": true` 属性，因为这个作为一个整体是不需要发布的。组件都是写在`packages`中。

```
{  "private": true,  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "test": "echo "Error: no test specified" && exit 1"  },  "keywords": [],  "author": "",  "license": "ISC"}复制代码
```

### 配置 pnpm 的 monorepo 工作区

这是我目前的结构目录，`docs`用来存放组件库文档，`examples`用于调试编写好的组件，`packages`里的`compnents`用于存放自己的组件。![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4pp8ZSy38VTS6icIibsMWjpUT0mjNFFDM1BVC5Vb0ulBTo4P4ibcyCibpkA/640?wx_fmt=jpeg)

比如我使用到`packages`和`examples`这两个，那么就将这两个都配置进去, 在`pnpm-workspace.yaml`中配置

```
packages:  - 'packages/**'  - 'examples'复制代码
```

每个子模块都有属于自己的`package.json`文件

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4R6xLl5pta6iaeuNzMiaHRu1ibKNNiaqe1vuKFAfM9MLytXJgP8KrFjrNuA/640?wx_fmt=jpeg)image.png

以 components 包的`package.json`举例，其中`"@uv-ui/hooks": "workspace:^1.0.0"`和 `"@uv-ui/utils": "workspace:^1.0.0"`是依赖于其他目录的包，如果这个 components 包需要用到这两个包，需要在这个目录下也安装上，之后发布 npm 包的时候将`workspace:^`去掉即可，这两个依赖的包也需要独立发布 npm 包，这些在发布组件中有详细描述。

```
{  "name": "uv-ui",  "private": false,  "version": "1.0.11",  "main": "dist/es/index.js",  "module": "dist/es/index.js",  "style": "dist/es/style.css",  "description": "基于vue3的移动端组件库",  "scripts": {    "build": "vite build",    "lint": "eslint ./src/**/*.{js,jsx,vue,ts,tsx} --fix"  },  "repository": {    "type": "git",    "url": "https://github.com/monsterxwx/uv-ui",    "directory": "packages/uv-ui"  },  "keywords": [    "uv-ui",    "vue3组件库",    "mobile",    "frontend",    "components"  ],  "files": [    "dist"  ],  "author": "coderxwx",  "license": "MIT",  "dependencies": {    "@uv-ui/hooks": "workspace:^1.0.0",    "@uv-ui/utils": "workspace:^1.0.0"  }}复制代码
```

其他两个的包名则分别为：`@uv-ui/hooks` 和 `@uv-ui/utils`，创建过程同上。

### 仓库项目内的包相互调用

如何对`hooks`、`utils`和`components`这三个包进行互相调用呢？我们只需要把这三个包都安装到仓库根目录下的 `node_modules` 目录中即可。所有的依赖都在根目录下安装，安装到根目录需要加上`-w` ，表示安装到公共模块的 packages.json 中。

```
pnpm install uv-ui -w
pnpm install @uv-ui/hooks -w
pnpm install @uv-ui/utils -w
复制代码
```

根目录的`package.json`将会出现如下依赖，这三个就是我们刚刚安装的包

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4BibIbuC36F4SrWGSMfACTN6iacIqSHnnaNkKGGrMupaULmXwB757XGeA/640?wx_fmt=jpeg)image.png

组件编写
----

如果我们的组件库包需要支持按需引入，那么每个组件都需要进行 vue 的注册`app.component(comp.name,comp)`。每个都写一遍会比较麻烦，可以封装成一个函数。

```
export const withInstall = (comp) => {  comp.install = (app) => {    // 注册组件    app.component(comp.name, comp)  }  return comp}复制代码
```

以 button 组件为例，首先目录结构如下，在 src 目录下编写各个组件，在 components 目录下有一个 index 用于将所有的组件导出

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4O4j3xE8XnccQBBy3vZPnNFLRdcU58ia6sjPrL0ysTorsHF480OJXNkA/640?wx_fmt=jpeg)image.png

`button`的`index.js`代码如下：将编写的 button 组件导进来，然后导出去即可实现组件每个都是按需加载

```
import Button from './button.vue'import {withInstall} from '@uv-ui/utils'const UvButton = withInstall(Button)export default UvButton复制代码
```

再来看看 components 目录下的`index.js`文件，写多少个组件就引入多少个，然后全部导出去，这么做的目的是在全量导入的时候，可以直接引入组件，然后`vue.use(uv-ui)`即可将全部的组件注册

```
import uvButton from './button'const components = [  uvButton]const install = (Vue) => {  components.forEach(component => {    Vue.component(component.name, component)  })}export {  uvButton}export default install复制代码
```

再来看看`button.vue`文件, 由于写的比较多，这里直接省略部分代码，只保留关键代码。

可以看到每个组件都需要给他一个名字方便在 vue 中注册，`export default { name: 'UvButton' }`， 其次样式通过 css 变量抽离出来，方便样式的更改，样式不用加`scoped`作用域，只要命名好样式名称即可。其他组件同理。

```
<template>  <div class="uv-button">      </div></template><script setup>// 代码</script><script>export default {  name: 'UvButton'}</script><style lang="scss">:root {  --uv-button-primary: #409eff;  --uv-button-success: #67c23a;  --uv-button-warning: #e6a23c;  --uv-button-error: #f56c6c;  --uv-button-info: #909399;  --uv-button-text: #303133;}$primary: var(--uv-button-primary);$success: var(--uv-button-success);$warning: var(--uv-button-warning) ;$error: var(--uv-button-error) ;$info: var(--uv-button-info) ;$text: var(--uv-button-text) ;.uv-button {  font-size: var(--uv-button-font-size);  border: 0;  border-radius: var(--uv-button-border-radius);  white-space: nowrap;  color: #ffffff;  background: none;  outline: none;  cursor: pointer;}</style>复制代码
```

组件打包
----

组件打包采用的是 vite 的库模式打包，没有使用 gulp 这些工具，是比较简单的打包方式，只需要简单配置即可实现每个组件都单独打包，目前打包后所有组件样式会合成一个`style.css`文件，样式需要全部引入，组件是按需引入的方式，如果样式也想做分离就需要使用到 gulp 等这些工具，将样式全部拆分出来作为一个包`theme-chalk`, 然后引入就类似 element-ui 那种方式，比较麻烦这里就不详细描述了，可以找找相关的文章了解。

```
import { defineConfig } from 'vite'import vue from '@vitejs/plugin-vue'export default defineConfig({  build: {    target: 'modules',    // 压缩    minify: true,    rollupOptions: {      // 忽略打包vue文件      external: ['vue'],      input: ['src/index.js'],      output: [        {          format: 'es',          entryFileNames: '[name].js',          preserveModules: true,          // 配置打包根目录          dir: 'dist/es',          preserveModulesRoot: 'src'        },        {          format: 'cjs',          entryFileNames: '[name].js',          preserveModules: true,          dir: 'dist/lib',          preserveModulesRoot: 'src'        }      ]    },    lib: {      entry: './index.js',      formats: ['es', 'cjs']    }  },  plugins: [    vue()  ]})复制代码
```

下面是打包后的结构，分别拆成 es 和 lib，样式在 es 目录下的 style.css

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4TrXuJliaGmqiaEOrrEOV5Nn9Mj3LjK7m9NjHibqekAU4tbREQPkdwnU5A/640?wx_fmt=jpeg)image.png

使用方式就比较简单了

**第一种：全量使用 main.js 中导入**

```
import uvUI from 'uv-ui'import 'uv-ui/dist/es/style.css'app.use(uvUI)复制代码
```

**第二种：按需导入 在 main.js 中引入样式文件**

```
import 'uv-ui/dist/es/style.css'复制代码
```

其他用到的地方引入相关组件

```
<template>  <div>    <uvButton type="primary">切换</uvButton>  </div></template><script setup>import { uvButton } from 'uv-ui'</script>复制代码
```

组件发布
----

### 编写 package.json

**package.json 重要字段说明：**

*   **name** 即 npm 项目包名，发布到 npm 时就是取的这个 name 名，你自己取个语义化的名字，和已有的 npm 库不能重复；
    
*   **private** 是否私有包，要发布到 npm 需要关闭
    
*   **version** 版本号，更新 npm 包时必须修改一个更高的版本号后才能成功发布到 npm，版本号最好遵循 npm 版本管理规范；
    
*   **description** 包的描述，发布到 npm 后你搜索该 npm 包时，在搜索联想列表里会显示在包名的下方，作为描述说明；
    
*   **main** 入口文件路径，在你通过 import 或 require 引用该 npm 包时就是引入的该路径的文件
    
*   **keywords** 该包的关键词
    
*   **files** 白名单目录，配置哪些文件会上传到 npm 包中。有些文件是必定会上传的，无法控制，例如 package.json、LICENSE、README.md 等等
    
*   **repository** 关联 github 地址
    

`package.json完整代码`

```
{  "name": "uv-ui",  "private": false,  "version": "1.0.11",  "main": "dist/es/index.js",  "module": "dist/es/index.js",  "style": "dist/es/style.css",  "description": "基于vue3的移动端组件库",  "scripts": {    "build": "vite build",    "lint": "eslint ./src/**/*.{js,jsx,vue,ts,tsx} --fix"  },  "repository": {    "type": "git",    "url": "https://github.com/monsterxwx/uv-ui",    "directory": "packages/uv-ui"  },  "keywords": [    "uv-ui",    "vue3组件库",    "mobile",    "frontend",    "components"  ],  "files": [    "dist"  ],  "author": "coderxwx",  "license": "MIT",  "dependencies": {    "@coderxwx/uv-ui-hooks": "1.0.0",    "@coderxwx/uv-ui-utils": "1.0.0"  }}复制代码
```

### 添加 LICENSE

Copyright (c) 2023 代表年份，coderxwx 替换成自己的名字

```
MIT LicenseCopyright (c) 2023 coderxwxPermission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the "Software"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sellcopies of the Software, and to permit persons to whom the Software isfurnished to do so, subject to the following conditions:The above copyright notice and this permission notice shall be included in allcopies or substantial portions of the Software.THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS ORIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THESOFTWARE.复制代码
```

### npm 账号注册登录

要发布到 npm 上首先就要注册 npm 账号，通过官网进行账号注册：www.npmjs.com/[1] 。

```
npm login
复制代码
```

登录 npm, 输入账号和密码，密码输入不会有显示，正常输入即可，然后输入自己的邮箱，邮箱验证码验证通过后即成功登录，后续不需要重复登录。

### 调试 npm

如果不需要调试，可以跳过调试步骤，直接发布。

*   npm 项目根目录运行终端命令：运行后该 npm 包会放进本地 npm 缓存
    

```
npm link
复制代码
```

*   如果要在其他项目（例如项目名叫 aaa）里引用调试，只需要在 aaa 里运行命令：
    

```
npm link 包名
复制代码
```

*   如果要取消项目 aaa 与 npm 包的关联，在 aaa 项目下运行命令：
    

```
npm unlink 包名
复制代码
```

为了防止本地调试 npm 与发布后的 npm 混淆冲突，在调试完成后一定记得手动取消项目关联。

### 发布组件

在 npm 包项目根目录运行命令：

```
npm publish
复制代码
```

运行完稍等一段时间即可在 npm 官网搜索到发布的 npm 包。

**关于发布的一些错误汇总**

*   **403 错误**
    

*   检查 npm 源是否是官方源 registry.npmjs.org/[2]，比如之前是淘宝的源则需要切换回官方源，否则发布失败；
    
*   是否登录成功（npm login 或者 npm adduser 登录）；
    
*   是否已有重复的包名（修改 package.json 里的 name 或者使用 scope）。
    

*   **402 错误**
    

*   当使用 npm publish 发布带有`scope`作用域的包时，会出现 402 错误；
    
*   需使用 npm publish --access=public；
    
*   详细发布请看下面的发布私有包。
    

*   **404 错误**
    

*   没有找到对应的路径，其实跟 402 错误差不多，基本都是作用域的问题
    

### 发布私有包

我们在写组件库的时候会用到一些函数，这些都可以作为一个包进行发布，但是这些不需要发布为正式的包，只需要给组件库的主包使用，比如：

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4iaicB3BXNJoPWLQ4icPxeBNSsdaZ8mhY0X6YfBSWGdcGpGJEHyT4BMvzw/640?wx_fmt=jpeg)image.png

`package.json`中如果 name 是使用`@xx`来表示的则代表私有包，如果发布 npm 为私有包则需要收费，我们可以通过配置`publishConfig`字段将其表示为共有包，然后进行`npm publish`进行发布，如果不想写这个可以直接输入`npm publish --access=public` 比如我的私有包的前缀是这个 @coderxwx，@后面跟的是你 npm 的账号名

```
{  "name": "@coderxwx/uv-ui-hooks",  "private": false,  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "test": "echo "Error: no test specified" && exit 1"  },  "publishConfig": {    "access": "public",    "registry": "https://registry.npmjs.org/"  },  "keywords": [],  "author": "coderxwx",  "license": "MIT"}复制代码
```

如果不想使用自己的账号名作为私有包的前缀，可以创建一个组织

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4hSciaYA1qtu0ppDRCXI9oYY7oAjd8yMHyTbSOwJq4neQyD1icArNKXdQ/640?wx_fmt=jpeg)image.png

创建完成后就可以使用这个名字来当前缀了，比如我创建的是 uv-ui, 之后就可以使用 @uv-ui 进行发布了。

![](https://mmbiz.qpic.cn/mmbiz/TZL4BdZpLdiaibIQCibsRYyKdrkPXJju6t4jQX61Ma7raeB6H4QuqmXHMqf0zl0zOnXKibSicQqJBnJ4zJGp7bfkkOA/640?wx_fmt=jpeg)image.png

更新组件
----

当完成组件的修改后需要重新发布更新组件，这里有两种方式，一种是直接修改`package.json`中的`version`信息，然后进行`npm publish`

还有一种更规范的方式是使用 npm 的指令。

其中 type 有这些：

`patch`：小变动，比如修复 bug 等 版本号变动 **v1.0.0->v1.0.1**

`minor`：增加新功能，不影响现有功能 版本号变动 **v1.0.0->v1.1.0**

`major`：破坏模块对向后的兼容性，大版本更新 版本号变动 **v1.0.0->v2.0.0**

```
npm version [type]npm publish复制代码
```

文档编写
----

我用的是 vitepress 来构建文档，基本没啥难度

安装

```
pnpm install -D vitepress vue
复制代码
```

vitepress 的具体使用可以参考这篇文章：juejin.cn/post/716427…[3]

教程到这里就结束了，如有错误欢迎指出！

作者：唯有灬努力  
链接：https://juejin.cn/post/7211521650252398649  
来源：稀土掘金

结语
--

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```