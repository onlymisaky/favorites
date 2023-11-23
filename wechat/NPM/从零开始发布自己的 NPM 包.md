> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/92sn49SewjbGT9slNYY-zQ)

大厂技术  高级前端  Node 进阶  

======================

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

在 Verdaccio 搭建 npm 私有服务器中，我们介绍了如何搭建一个 Npm 私有服务器；服务器搭建完成后，我们本文来学习一下如何上传我们自己的 npm 包。  

前端模块化作为前端必备的一个技能，已经在前端开发中不可或缺；而模块化带来项目的规模不断变大，项目的依赖越来越多；随着项目的增多，如果每个模块都通过手动拷贝的方式无异于饮鸩止渴，我们可以把功能相似的模块或组件抽取到一个 npm 包中；然后上传到私有 npm 服务器，不断迭代 npm 包来更新管理所有项目的依赖。

npm 包的基本了解
==========

首先我们来了解一下实现一个 npm 包需要包含哪些内容。

打包
--

通常，我们把打包好的一些模块文件放在一个目录下，便于统一进行加载；是的，npm 包也是需要进行打包的，虽然也能直接写 npm 包模块的代码（并不推荐），但我们经常会在项目中用到 typescript、babel、eslint、代码压缩等等功能，因此我们也需要对 npm 包进行打包后再进行发布。

在深入对比 Webpack、Parcel、Rollup 打包工具中，我们总结了，rollup 相比于 webpack 更适合打包一些第三方的类库，因此本文主要通过 rollup 来进行打包。

npm 域级包
-------

随着 npm 包越来越多，而且包名也只能是唯一的，如果一个名字被别人占了，那你就不能再使用这个名字；假设我想要开发一个 utils 包，但是张三已经发布了一个 utils 包，那我的包名就不能叫 utils 了；此时我们可以加一些连接符或者其他的字符进行区分，但是这样就会让包名不具备可读性。

在 npm 的包管理系统中，有一种`scoped packages`机制，用于将一些 npm 包以`@scope/package`的命名形式集中在一个命名空间下面，实现域级的包管理。

域级包不仅不用担心会和别人的包名重复，同时也能对功能类似的包进行统一的划分和管理；比如我们用 vue 脚手架搭建的项目，里面就有`@vue/cli-plugin-babel`、`@vue/cli-plugin-eslint`等等域级包。

我们在初始化项目时可以使用命令行来添加 scope：

```
npm init --scope=username
```

相同域级范围内的包会被安装在相同的文件路径下，比如`node_modules/@username/`，可以包含任意数量的作用域包；安装域级包也需要指明其作用域范围：

```
npm install @username/package
```

在代码中引入时同样也需要作用域范围:

```
require("@username/package")
```

加载规则
----

在 npm 包中的`package.json`文件，我们经常会看到`main`、`jsnext:main`、`module`、`browser`等字段，那么这些字段都代表了什么意思呢？其实这跟 npm 包的`工作环境`有关系，我们知道，npm 包分为以下几种类型的包：

*   只能在浏览器端使用的
    
*   只能在服务器端使用的
    
*   浏览器 / 服务器端都可使用
    

假如我们现在开发一个 npm 包，既要支持浏览器端，也要支持服务器端（比如 axios、lodash 等），需要在不同的环境下加载 npm 包的不同入口文件，只通过一个字段已经不能满足需求。

首先我们来看下`main`字段，它是 nodejs 默认文件入口, 支持最广泛，主要使用在引用某个依赖包的时候需要此属性的支持；如果不使用`main`字段的话，我们可能需要这样来引用依赖：

```
import('some-module/dist/bundle.js')
```

所以它的作用是来告诉打包工具，npm 包的入口文件是哪个，打包时让打包工具引入哪个文件；这里的文件一般是 commonjs(cjs) 模块化的。

有一些打包工具，例如 webpack 或 rollup，本身就能直接处理 import 导入的 esm 模块，那么我们可以将模块文件打包成 esm 模块，然后指定`module`字段；由包的使用者来决定如何引用。

`jsnext:main`和`module`字段的意义是一样的，都可以指定 esm 模块的文件；但是 jsnext:main 是社区约定的字段，并非官方，而 module 则是官方约定字段，因此我们经常将两个字段同时使用。

在 Webpack 配置全解析中我们介绍到，`mainFields`就是 webpack 用来解析模块的，默认会按照顺序解析 browser、module、main 字段。

有时候我们还想要写一个同时能够跑在浏览器端和服务器端的 npm 包（比如 axios），但是两者在运行环境上还是有着细微的区别，比如浏览器请求数据用的是 XMLHttpRequest，而服务器端则是 http 或者 https；那么我们要怎样来区分不同的环境呢？

除了我们可以在代码中对环境参数进行判断（比如判断 XMLHttpRequest 是否为 undefined），也可以使用`browser`字段，在浏览器环境来替换 main 字段。browser 的用法有以下两种，如果 browser 为单个的字符串，则替换 main 成为浏览器环境的入口文件，一般是 umd 模块的：

```
{  "browser": "./dist/bundle.umd.js"}
```

browser 还可以是一个对象，来声明要替换或者忽略的文件；这种形式比较适合替换部分文件，不需要创建新的入口。key 是要替换的 module 或者文件名，右侧是替换的新的文件，比如在 axios 的 packages.json 中就用到了这种替换：

```
{  "browser": {    "./lib/adapters/http.js": "./lib/adapters/xhr.js"  }}
```

打包工具在打包到浏览器环境时，会将引入来自`./lib/adapters/http.js`的文件内容替换成`./lib/adapters/xhr.js`的内容。

在有一些包中我们还会看到`types`字段，指向`types/index.d.ts`文件，这个字段是用来包含了这个 npm 包的变量和函数的类型信息；比如我们在使用`lodash-es`包的时候，有一些函数的名称想不起来了，只记得大概的名字；比如输入 fi 就能自动在编译器中联想出 fill 或者 findIndex 等函数名称，这就为包的使用者提供了极大的便利，不需要去查看包的内容就能了解其导出的参数名称，为用户提供了更加好的 IDE 支持。

发布哪些文件
------

在 npm 包中，我们可以选择哪些文件发布到服务器中，比如只发布压缩后的代码，而过滤源代码；我们可以通过配置文件来进行指定，可以分为以下几种情况：

*   存在`.npmignore`文件，以`.npmignore`文件为准，在文件中的内容都会被忽略，不会上传；即使有`.gitignore`文件，也不会生效。
    
*   不存在`.npmignore`文件，以`.gitignore`文件为准，一般是无关内容，例如. vscode 等环境配置相关的。
    
*   不存在`.npmignore`也不存在`.gitignore`，所有文件都会上传。
    
*   `package.json`中存在 files 字段，可以理解为 files 为白名单。
    

ignore 相当于黑名单，files 字段就是白名单，那么当两者内容冲突时，以谁为准呢？答案是`files`为准，它的优先级最高。

我们可以通过`npm pack`命令进行本地模拟打包测试，在项目根目录下就会生成一个 tgz 的压缩包，这就是将要上传的文件内容。

项目依赖
----

在 package.json 文件中，所有的依赖包都会在 dependencies 和 devDependencies 字段中进行配置管理：

*   dependencies：表示生产环境下的依赖管理，--save 简写 -S；
    
*   devDependencies：表示开发环境下的依赖管理，--save-dev 简写 -D；
    

`dependencies`字段指定了项目上线后运行所依赖的模块，可以理解为我们的项目在生产环境运行中要用到的东西；比如 vue、jquery、axios 等，项目上线后还是要继续使用的依赖。

`devDependencies`字段指定了项目开发所需要的模块，开发环境会用到的东西；比如 webpack、eslint 等等，我们打包的时候会用到，但是项目上线运行时就不需要了，所以放到 devDependencies 中去就好了。

除了 dependencies 和 devDependencies 字段，我们在一些 npm 包中还会看到`peerDependencies`字段，没有写过 npm 插件的童鞋可能会对这个字段比较陌生，它和上面两个依赖有什么区别呢？

假设我们的项目 MyProject，有一个依赖 PackageA，它的 package.json 中又指定了对 PackageB 的依赖，因此我们的项目结构是这样的：

```
MyProject
|- node_modules
   |- PackageA
      |- node_modules
         |- PackageB
```

那么我们在 MyProject 中是可以直接引用 PackageA 的依赖的，但如果我们想直接使用 PackageB，那对不起，是不行的；即使 PackageB 已经被安装了，但是 node 只会在`MyProject/node_modules`目录下查找 PackageB。

为了解决这样问题，`peerDependencies`字段就被引入了，通俗的解释就是：如果你安装了我，你最好也安装以下依赖。比如上面如果我们在 PackageA 的 package.json 中加入下面代码：

```
{    "peerDependencies": {        "PackageB": "1.0.0"    }}
```

这样如果你安装了 PackageA，那会自动安装 PackageB，会形成如下的目录结构：

```
MyProject
|- node_modules
   |- PackageA
   |- PackageB
```

我们在 MyProject 项目中就能愉快的使用 PackageA 和 PackageB 两个依赖了。

比如，我们熟悉的 element-plus 组件库，它本身不可能单独运行，必须依赖于 vue3 环境才能运行；因此在它的 package.json 中我们看到它对宿主环境的要求：

```
{  "peerDependencies": {    "vue": "^3.2.0"  },}
```

这样我们看到它在组件中引入的 vue 的依赖，其实都是宿主环境提供的 vue3 依赖：

```
import { ref, watch, nextTick } from 'vue'
```

许可证
---

`license`字段使我们可以定义适用于`package.json`所描述代码的许可证。同样，在将项目发布到 npm 注册时，这非常重要，因为许可证可能会限制某些开发人员或组织对软件的使用。拥有清晰的许可证有助于明确定义该软件可以使用的术语。

借用知乎上 Max Law 的一张图来解释所有的许可证：

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25bcx8Y2nAVBVxWBXVrwZNaY2kt0Ut5SeUEWyy6Zicg7ujsZm4zZUqqavNdRH7SHW4qSVNEia22tMXDMA/640?wx_fmt=jpeg)许可证

版本号
---

npm 包的版本号也是有规范要求的，通用的就是遵循 semver 语义化版本规范，版本格式为：major.minor.patch，每个字母代表的含义如下：

1.  主版本号 (major)：当你做了不兼容的 API 修改
    
2.  次版本号 (minor)：当你做了向下兼容的功能性新增
    
3.  修订号 (patch)：当你做了向下兼容的问题修正
    

先行版本号是加到修订号的后面，作为版本号的延伸；当要发行大版本或核心功能时，但不能保证这个版本完全正常，就要先发一个先行版本。

先行版本号的格式是在修订版本号后面加上一个连接号（-），再加上一连串以点（.）分割的标识符，标识符可以由英文、数字和连接号（[0-9A-Za-z-]）组成。例如：

```
1.0.0-alpha
1.0.0-alpha.1
1.0.0-0.3.7
```

常见的先行版本号有：

1.  alpha：不稳定版本，一般而言，该版本的 Bug 较多，需要继续修改，是测试版本
    
2.  beta：基本稳定，相对于 Alpha 版已经有了很大的进步，消除了严重错误
    
3.  rc：和正式版基本相同，基本上不存在导致错误的 Bug
    
4.  release：最终版本
    

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bcx8Y2nAVBVxWBXVrwZNaY2WlIF2VRgUGRxAmtdHPpictpsxV4QXjic2bF8GVNnicGI0O316bo7uHmXA/640?wx_fmt=png)版本号

每个 npm 包的版本号都是唯一的，我们每次更新 npm 包后，都是需要更新版本号，否则会报错提醒：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bcx8Y2nAVBVxWBXVrwZNaY2HwdERKLJuoTOYTgSErGHv8P20Az5aviaPFicHrNicC18amqJ6j6wwDtFw/640?wx_fmt=png)版本号报错

> ❝
> 
> 当主版本号升级后，次版本号和修订号需要重置为 0，次版本号进行升级后，修订版本需要重置为 0。
> 
> ❞

但是如果每次都要手动来更新版本号，那可就太麻烦了；那么是否有命令行能来自动更新版本号呢？由于版本号的确定依赖于内容决定的主观性的动作，因此不能完全做到全自动化更新，谁知道你是改了大版本还是小版本，因此只能通过命令行实现半自动操作；命令的取值和语义化的版本是对应的，会在相应的版本上加 1：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bcx8Y2nAVBVxWBXVrwZNaY2Zy9F77tjhlYKdmNT0uiaygqiaz7mxjp12GG5mYH6LQxm8THwkSPgY7PQ/640?wx_fmt=png)命令行更新版本号

在 package.json 的一些依赖的版本号中，我们还会看到`^`、`~`或者`>=`这样的标识符，或者不带标识符的，这都代表什么意思呢？

1.  没有任何符号：完全百分百匹配，必须使用当前版本号
    
2.  对比符号类的：>(大于)  >=(大于等于) <(小于) <=(小于等于)
    
3.  波浪符号`~`：固定主版本号和次版本号，修订号可以随意更改，例如`~2.0.0`，可以使用 2.0.0、2.0.2 、2.0.9 的版本。
    
4.  插入符号`^`：固定主版本号，次版本号和修订号可以随意更改，例如`^2.0.0`，可以使用 2.0.1、2.2.2 、2.9.9 的版本。
    
5.  任意版本 *：对版本没有限制，一般不用
    
6.  或符号：|| 可以用来设置多个版本号限制规则，例如 >= 3.0.0 || <= 1.0.0
    

npm 包开发
=======

通过上面对`package.json`的介绍，相信各位小伙伴已经对 npm 包有了一定的了解，现在我们就进入代码实操阶段，开发并上传一个 npm 包。

工具类包
----

相信不少童鞋在业务开发时都会遇到重复的功能，或者开发相同的工具函数，每次遇到时都要去其他项目中拷贝代码；如果一个项目的代码逻辑有优化的地方，需要同步到其他项目，则需要再次挨个项目的拷贝代码，这样不仅费时费力，而且还重复造轮子。

我们可以整合各个项目的需求，开发一个适合自己项目的工具类的 npm 包，包的结构如下：

```
hello-npm
|-- lib/（存放打包后的文件）
|-- src/（源码）
|-- package.json
|-- rollup.config.base.js（rollup基础配置）
|-- rollup.config.dev.js（rollup开发配置）
|-- rollup.config.js（rollup正式配置）
|-- README.md
|-- tsconfig.json
```

首先看下`package.json`的配置，rollup 根据开发环境区分不同的配置：

```
{  "name": "hello-npm",  "version": "1.0.0",  "description": "我是npm包的描述",  "main": "lib/bundle.cjs.js",  "jsnext:main": "lib/bundle.esm.js",  "module": "lib/bundle.esm.js",  "browser": "lib/bundle.browser.js",  "types": "types/index.d.ts",  "author": "",  "scripts": {    "dev": "npx rollup -wc rollup.config.dev.js",    "build": "npx rollup -c rollup.config.js && npm run build:types",    "build:types": "npx tsc",  },  "license": "ISC"}
```

然后配置 rollup 的`base config`文件：

```
import typescript from "@rollup/plugin-typescript";import pkg from "./package.json";import json from "rollup-plugin-json";import resolve from "rollup-plugin-node-resolve";import commonjs from "@rollup/plugin-commonjs";import eslint from "@rollup/plugin-eslint";import { babel } from '@rollup/plugin-babel'const formatName = "hello";export default {  input: "./src/index.ts",  output: [    {      file: pkg.main,      format: "cjs",    },    {      file: pkg.module,      format: "esm",    },    {      file: pkg.browser,      format: "umd",      name: formatName,    },  ],  plugins: [    json(),    commonjs({      include: /node_modules/,    }),    resolve({      preferBuiltins: true,      jsnext: true,      main: true,      brower: true,    }),    typescript(),    eslint(),    babel({ exclude: "node_modules/**" }),  ],};
```

这里我们将打包成 commonjs、esm 和 umd 三种模块规范的包，然后是生产环境的配置，加入 terser 和 filesize 分别进行压缩和查看打包大小：

```
import { terser } from "rollup-plugin-terser";import filesize from "rollup-plugin-filesize";import baseConfig from "./rollup.config.base";export default {  ...baseConfig,  plugins: [...baseConfig.plugins, terser(), filesize()],};
```

然后是开发环境的配置：

```
import baseConfig from "./rollup.config.base";import serve from "rollup-plugin-serve";import livereload from "rollup-plugin-livereload";export default {  ...baseConfig,  plugins: [    ...baseConfig.plugins,    serve({      contentBase: "",      port: 8020,    }),    livereload("src"),  ],};
```

环境配置好后，我们就可以打包了

```
# 测试环境npm run dev# 生产环境npm run build
```

全局包
---

还有一类 npm 包比较特殊，是通过`npm i -g [pkg]`进行全局安装的，比如常用的`vue create`、`static-server`、`pm2`等命令，都是通过全局命令安装的；那么全局 npm 包如何开发呢？

我们来实现一个全局命令的计算器功能，新建一个项目然后运行：

```
cd my-calcnpm init -y
```

在 package.json 中添加`bin`属性，它是一个对象，键名是告诉 node 在全局定义一个全局的命令，值则是执行命令的脚本文件路径，可以同时定义多个命令，这里我们定义一个`calc命令`：

```
{  "name": "my-calc",  "version": "1.0.0",  "description": "",  "main": "index.js",  "scripts": {    "test": "echo \"Error: no test specified\" && exit 1"  },  "bin": {    "calc": "./src/calc.js",  },  "license": "ISC",}
```

命令定义好了，我们来实现 calc.js 中的内容：

```
#!/usr/bin/env nodeif (process.argv.length <= 2) {  console.log("请输入运算的数字");  return;}let total = process.argv  .slice(2)  .map((el) => {    let parseEl = parseFloat(el);    return !isNaN(parseEl) ? parseEl : 0;  })  .reduce((total, num) => {    total += num;    return total;  }, 0);console.log(`运算结果：${total}`);
```

需要注意的是，文件头部的`#!/usr/bin/env node`是必须的，告诉 node 这是一个可执行的 js 文件，如果不写会报错；然后通过`process.argv.slice(2)`来获取执行命令的参数，前两个参数分别是 node 的运行路径和可执行脚本的运行路径，第三个参数开始才是命令行的参数，因此我们在命令行运行来看结果：

```
calc 1 2 3 -4
```

如果我们的脚本比较复杂，想调试一下脚本，那么每次都需要发布到 npm 服务器，然后全局安装后才能测试，这样比较费时费力，那么有没有什么方法能够直接运行脚本呢？这里就要用到`npm link命令`，它的作用是将调试的 npm 模块链接到对应的运行项目中去，我们也可以通过这个命令把模块链接到全局。

在我们的项目中运行命令：

```
npm link
```

可以看到全局 npm 目录下新增了 calc 文件，calc 命令就指向了本地项目下的 calc.js 文件，然后我们就可以尽情的运行调试；调试完成后，我们又不需要将命令指向本地项目了，这个时候就需要下面的命令进行`解绑操作`：

```
npm unlink
```

解绑后 npm 会把全局的 calc 文件删除，这时候我们就可以去发布 npm 包然后进行真正的全局安装了。

vue 组件库
-------

在 Vue 项目中，我们在很多项目中也会用到公共组件，可以将这些组件提取到组件库，我们可以仿照 element-ui 来实现一个我们自己的 ui 组件库；首先来构建我们的项目目录：

```
|- lib
|- src
    |- MyButton
        |- index.js
        |- index.vue
        |- index.scss
    |- MyInput
        |- index.js
        |- index.vue
        |- index.scss
    |- main.js
|- rollup.config.js
```

我们构建 MyButton 和 MyInput 两个组件，vue 文件和 scss 不再赘述，我们来看下导出组件的 index.js：

```
import MyButton from "./index.vue";MyButton.install = function (Vue) {  Vue.component(MyButton.name, MyButton);};export default MyButton;
```

组件导出后在`main.js`中统一组件注册：

```
import MyButton from "./MyButton/index.js";import MyInput from "./MyInput/index";import { version } from "../package.json";import "./MyButton/index.scss";import "./MyInput/index.scss";const components = [MyButton, MyInput];const install = function (Vue) {  components.forEach((component) => {    Vue.component(component.name, component);  });};if (typeof window !== "undefined" && window.Vue) {  install(window.Vue);}export { MyButton, MyInput, install };export default { version, install };
```

然后配置 rollup.config.js：

```
import resolve from "rollup-plugin-node-resolve";import vue from "rollup-plugin-vue";import babel from "@rollup/plugin-babel";import commonjs from "@rollup/plugin-commonjs";import scss from "rollup-plugin-scss";import json from "@rollup/plugin-json";const formatName = "MyUI";const config = {  input: "./src/main.js",  output: [    {      file: "./lib/bundle.cjs.js",      format: "cjs",      name: formatName,      exports: "auto",    },    {      file: "./lib/bundle.js",      format: "iife",      name: formatName,      exports: "auto",    },  ],  plugins: [    json(),    resolve(),    vue({      css: true,      compileTemplate: true,    }),    babel({      exclude: "**/node_modules/**",    }),    commonjs(),    scss(),  ],};export default config;
```

这里我们打包出 commonjs 和 iife 两个模块规范，一个可以配合打包工具使用，另一个可以直接在浏览器中 script 引入。我们通过`rollup-plugin-vue`插件来解析 vue 文件，需要注意的是 5.x 版本解析 vue2，最新的 6.x 版本解析 vue3，默认安装 6.x 版本；如果我们使用的是 vue2，则需要切换老版本的插件，还需要安装以下 vue 的编译器：

```
npm install --save-dev vue-template-compiler
```

打包成功后我们就能看到`lib`目录下的文件了，我们就能像 element-ui 一样，愉快的使用自己的 ui 组件了，在项目中引入我们的 UI：

```
/* 全局引入 main.js */import MyUI from "my-ui";// 引入样式import "my-ui/lib/bundle.cjs.css";Vue.use(MyUI);/* 在组件中按需引入 */import { MyButton } from "my-ui";export default {  components: {    MyButton  }}
```

如果想要在本地进行调试，也可以使用`link`命令创建链接，首先在 my-ui 目录下运行`npm link`将组件挂载到全局，然后在 vue 项目中运行下面命令来引入全局的 my-ui：

```
npm link my-ui
```

我们会看到下面的输出表示 vue 项目中 my-ui 模块已经链接到 my-ui 项目了：

```
D:\project\vue-demo\node_modules\my-ui 
-> 
C:\Users\XXXX\AppData\Roaming\npm\node_modules\my-ui
-> 
D:\project\my-ui
```

npm 包发布
-------

我们的 npm 包完成后就可以准备发布了，首先我们需要准备一个账号，可以使用`--registry`来指定 npm 服务器，或者直接使用 nrm 来管理：

```
npm adduser
npm adduser --registry=http://example.com
```

然后进行登录，输入你注册的账号密码邮箱：

```
npm login
```

还可以用下面命令退出当前账号

```
npm logout
```

如果不知道当前登录的账号可以用 who 命令查看身份：

```
npm who am i
```

登录成功就可以将我们的包推送到服务器上去了，执行下面命令，会看到一堆的 npm notice：

```
npm publish
```

如果某版本的包有问题，我们还可以将其撤回

```
npm unpublish [pkg]@[version]
```

  

```
Node 社群








我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：


1. 点个「在看」，让更多人也能看到这篇文章
2. 订阅官方博客 www.inode.club 让我们一起成长



点赞和在看就是最大的支持❤️

```