> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fD5YnL9xf0OBHRaxZpNZ8Q)

> **来自：掘金，作者：yuxiaoliang  
> **
> 
> **链接：https://juejin.cn/post/7099041402771734559**

大厂技术  高级前端  精选文章

点击上方 全站前端精选，关注公众号

回复 1，加入高级前段交流群

npm 是前端开发人员广泛使用的包管理工具，项目中通过 package.json 来管理项目中所依赖的 npm 包的配置。package.json 就是一个 json 文件，除了能够描述项目的包依赖外，允许我们使用 “语义化版本规则” 指明你项目依赖包的版本，让你的构建更好地与其他开发者分享，便于重复使用。

  
本文主要从最近的实践出发，结合最新的 npm 和 node 的版本，介绍一下 package.json 中一些常见的配置以及如何写一个规范的 package.json

> *   package.json
>     
> *   package.json 常用属性
>     
> *   package.json 环境相关属性
>     
> *   package.json 依赖相关属性
>     
> *   package.json 三方属性
>     

* * *

1package.json
-------------

### 1. package.json 简介

在 nodejs 项目中，package.json 是管理其依赖的配置文件，通常我们在初始化一个 nodejs 项目的时候会通过：

```
npm init<br style="visibility: visible;">
```

然后在你的目录下会生成 3 个目录 / 文件， node_modules, package.json 和 package.lock.json。其中 package.json 的内容为：

```
{    "name": "Your project name",    "version": "1.0.0",    "description": "Your project description",    "main": "app.js",    "scripts": {        "test": "echo \"Error: no test specified\" && exit 1",    },    "author": "Author name",    "license": "ISC",    "dependencies": {        "dependency1": "^1.4.0",        "dependency2": "^1.5.2"    }}
```

上述可以看出，package.json 中包含了项目本身的元数据, 以及项目的子依赖信息 (比如 dependicies 等)。

### 2. package-lock.json

我们发现在 npm init 的时候，不仅生成了 package.json 文件，还生成了 package-lock.json 文件。那么为什么存在 package.json 的清空下，还需要生成 package-lock.json 文件呢。本质上 package-lock.json 文件是为了锁版本，在 package.json 中指定的子 npm 包比如：react: "^16.0.0"，在实际安装中，只要高于 react 的版本都满足 package.json 的要求。这样就使得根据同一个 package.json 文件，两次安装的子依赖版本不能保证一致。

而 package-lock 文件如下所示，子依赖 dependency1 就详细的指定了其版本。起到 lock 版本的作用。

```
{    "name": "Your project name",    "version": "1.0.0",    "lockfileVersion": 1,    "requires": true,    "dependencies": {        "dependency1": {            "version": "1.4.0",            "resolved": "https://registry.npmjs.org/dependency1/-/dependency1-1.4.0.tgz",            "integrity": "sha512-a+UqTh4kgZg/SlGvfbzDHpgRu7AAQOmmqRHJnxhRZICKFUT91brVhNNt58CMWU9PsBbv3PDCZUHbVxuDiH2mtA=="        },        "dependency2": {            "version": "1.5.2",            "resolved": "https://registry.npmjs.org/dependency2/-/dependency2-1.5.2.tgz",            "integrity": "sha512-WOn21V8AhyE1QqVfPIVxe3tupJacq1xGkPTB4iagT6o+P2cAgEOOwIxMftr4+ZCTI6d551ij9j61DFr0nsP2uQ=="        }    }}
```

2package.json 常用属性
------------------

本章来聊聊 package.json 中常用的配置属性，形如 name，version 等属性太过简单，不一一介绍。本章主要介绍一下 script、bin 和 workspaces 属性。

### 2.1 script

在 npm 中使用 script 标签来定义脚本，每当制定 npm run 的时候，就会自动创建一个 shell 脚本，这里需要注意的是，npm run 新建的这个 Shell，会将本地目录的 node_modules/.bin 子目录加入 PATH 变量。

这意味着，当前目录的 node_modules/.bin 子目录里面的所有脚本，都可以直接用脚本名调用，而不必加上路径。比如，当前项目的依赖里面有 esbuild，只要直接写 esbuild xxx 就可以了。

```
{  // ...  "scripts": {    "build": "esbuild index.js",  }}
```

```
{  // ...  "scripts": {    "build": "./node_modules/.bin/esbuild index.js"   }}
```

上面两种写法是等价的。

### 2.2 bin

bin 属性用来将可执行文件加载到全局环境中，指定了 bin 字段的 npm 包，一旦在全局安装，就会被加载到全局环境中，可以通过别名来执行该文件。

```
比如\@bytepack/cli的npm包：
```

```
"bin": {    "bytepack": "./bin/index.js" },
```

一旦在全局安装了 @bytepack/cli，就可以直接通过 bytepack 来执行相应的命令，比如

```
bytepack -v
//显示1.11.0
```

如果非全局安装，那么会自动连接到项目的 node_module/.bin 目录中。与前面介绍的 script 标签中所说的一致，可以直接用别名来使用。

### 2.3 workspaces

在项目过大的时候，最近越来越流行 monorepo。提到 monorepo 就绕不看 workspaces，早期我们会用 yarn workspaces，现在 npm 官方也支持了 workspaces.     workspaces 解决了本地文件系统中如何在一个顶层 root package 下管理多个子 packages 的问题，在 workspaces 声明目录下的 package 会软链到最上层 root package 的 node_modules 中。  
直接以官网的例子来说明：

```
{  "name": "my-project",  "workspaces": [    "packages/a"  ]}
```

在一个 npm 包名为 my-project 的 npm 包中，存在 workspaces 配置的目录。

```
.+-- package.json+-- index.js`-- packages   +-- a   |  `-- package.json
```

并且该最上层的名为 my-project 的 root 包，有 packages/a 子包。此时，我们如果 npm install, 那么在 root package 中 node_modules 中安装的 npm 包 a，指向的是本地的 package/a.

```
.+-- node_modules|  `-- packages/a -> ../packages/a+-- package-lock.json+-- package.json`-- packages   +-- a   |   `-- package.json
```

上述的

```
-- packages/a -> ../packages/a
```

指的就是从 node_modules 中 a 链接到本地 npm 包的软链

3package.json 环境相关属性
--------------------

常见的环境，基本上分为浏览器 browser 和 node 环境两大类，接下来我们来看看 package.json 中，跟环境相关的配置属性。环境的定义可以简单理解如下：

*   browser 环境：比如存在一些只有在浏览器中才会存在的全局变量等，比如 window，Document 等
    
*   node 环境: npm 包的源文件中存在只有在 node 环境中才会有的一些变量和内置包，内置函数等。
    

### 3.1 type

js 的模块化规范包含了 commonjs、CMD、UMD、AMD 和 ES module 等，最早先在 node 中支持的仅仅是 commonjs 字段，但是从 node13.2.0 开始后，node 正式支持了 ES module 规范，在 package.json 中可以通过 type 字段来声明 npm 包遵循的模块化规范。

```
//package.json{   name: "some package",   type: "module"||"commonjs" }
```

需要注意的是：

*   不指定 type 的时候，type 的默认值是 commonjs，不过建议 npm 包都指定一下 type
    
*   当 type 字段指定值为 module 则采用 ESModule 规范
    
*   当 type 字段指定时，目录下的所有. js 后缀结尾的文件，都遵循 type 所指定的模块化规范
    
*   除了 type 可以指定模块化规范外，通过文件的后缀来指定文件所遵循的模块化规范，以. mjs 结尾的文件就是使用的 ESModule 规范，以. cjs 结尾的遵循的是 commonjs 规范
    

### 3.2 main & module & browser

除了 type 外，package.json 中还有 main,module 和 browser 3 个字段来定义 npm 包的入口文件。

*   main : 定义了 npm 包的入口文件，browser 环境和 node 环境均可使用
    
*   module : 定义 npm 包的 ESM 规范的入口文件，browser 环境和 node - 环境均可使用
    
*   browser : 定义 npm 包在 browser 环境下的入口文件
    

我们来看一下这 3 个字段的使用场景，以及同时存在这 3 个字段时的优先级。我们假设有一个 npm 包为 demo1,

```
----- dist
   |-- index.browser.js
   |-- index.browser.mjs
   |-- index.js
   |-- index.mjs
```

其 package.json 中同时指定了 main,module 和 browser 这 3 个字段，

```
"main": "dist/index.js",  // main   "module": "dist/index.mjs", // module  // browser 可定义成和 main/module 字段一一对应的映射对象，也可以直接定义为字符串  "browser": {    "./dist/index.js": "./dist/index.browser.js", // browser+cjs    "./dist/index.mjs": "./dist/index.browser.mjs"  // browser+mjs  },  // "browser": "./dist/index.browser.js" // browser
```

默认构建和使用，比如我们在项目中引用这个 npm 包：

```
import demo from 'demo'
```

通过构建工具构建上述代码后，模块的加载循序为：_**browser+mjs > module > browser+cjs > main**_这个加载顺序是大部分构建工具默认的加载顺序，比如 webapck、esbuild 等等。可以通过相应的配置修改这个加载顺序，不过大部分场景，我们还是会遵循默认的加载顺序。

### 3.3 exports

如果在 package.json 中定义了 exports 字段，那么这个字段所定义的内容就是该 npm 包的真实和全部的导出，优先级会高于 main 和 file 等字段。举例来说：

```
{  "name": "pkg",  "exports": {    ".": "./main.mjs",    "./foo": "./foo.js"  }}
```

```
import { something } from "pkg"; // from "pkg/main.mjs"
```

```
const { something } = require("pkg/foo"); // require("pkg/foo.js")
```

从上述的例子来看，exports 可以定义不同 path 的导出。如果存在 exports 后，以前正常生效的 file 目录到处会失效，比如 require('pkg/package.json')，因为在 exports 中没有指定，就会报错。    exports 还有一个最大的特点，就是条件引用，比如我们可以根据不同的引用方式或者模块化类型，来指定 npm 包引用不同的入口文件。

```
// package.json{   "name":"pkg",  "main": "./main-require.cjs",  "exports": {    "import": "./main-module.js",    "require": "./main-require.cjs"  },  "type": "module"}
```

上述的例子中，如果我们通过

```
const p = require('pkg')
```

引用的就是 "./main-require.cjs"。如果通过：

```
import p from 'pkg'
```

引用的就是 "./main-module.js" 最后需要注意的是 ：_**如果存在 exports 属性，exports 属性不仅优先级高于 main，同时也高于 module 和 browser 字段。**_

4package.json 依赖相关属性
--------------------

package.json 中跟依赖相关的配置属性包含了 dependencies、devDependencies、peerDependencies 和 peerDependenciesMeta 等。

dependencies 是项目的依赖，而 devDependencies 是开发所需要的模块，所以我们可以在开发过程中需要的安装上去，来提高我们的开发效率。这里需要注意的时，在自己的项目中尽量的规范使用，形如 webpack、babel 等是开发依赖，而不是项目本身的依赖，不要放在 dependencies 中。

dependencies 除了 dependencies 和 devDependencies，本文重点介绍的是 peerDependencies 和 peerDependenciesMeta。

### 3.1 peerDependencies

peerDependencies 是 package.json 中的依赖项, 可以解决核心库被下载多次，以及统一核心库版本的问题。

```
//package/pkg----- node_modules   |-- npm-a -> 依赖了react,react-dom   |-- npm-b -> 依赖了react,react-dom   |-- index.js
```

比如上述的例子中如果子 npm 包 a,b 都以来了 react 和 react-dom, 此时如果我们在子 npm 包 a,b 的 package.json 中声明了 PeerDependicies 后，相应的依赖就不会重新安装。需要注意的有两点：

*   对于子 npm 包 a, 在 npm7 中，如果单独安装子 npm a, 其 peerDependicies 中的包，会被安装下来。但是 npm7 之前是不会的。
    
*   请规范和详细的指定 PeerDependicies 的配置，笔者在看到有些 react 组件库，不在 PeerDependicies 中指定 react 和 react-dom，或者将 react 和 react-dom 放到了 dependicies 中，这两种不规范的指定都会存在一些问题。
    
*   其二，正确的指定 PeerDependicies 中 npm 包的版本，react-focus-lock\@2.8.1[1],peerDependicies 指定的是："react": "^16.8.0 || ^17.0.0 || ^18.0.0"，但实际上，这个 react-focus-lock 并不支持 18.x 的 react
    

### 3.2 peerDependenciesMeta

看到 “Meta” 就有元数据的意思，这里的 peerDependenciesMeta 就是详细修饰了 peerDependicies，比如在 react-redux 这个 npm 包中的 package.json 中有这么一段：

```
"peerDependencies": {    "react": "^16.8.3 || ^17 || ^18"  }, "peerDependenciesMeta": {    "react-dom": {      "optional": true    },    "react-native": {      "optional": true    }  }
```

这里指定了 "react-dom","react-native" 在 peerDependenciesMeta 中，且为可选项，因此如果项目中检测没有安装 "react-dom" 和 "react-native" 都不会报错。

值得注意的是，通过 peerDependenciesMeta 我们确实是取消了限制，但是这里经常存在非 A 即 B 的场景，比如上述例子中，我们需要的是 “react-dom” 和 "react-native" 需要安装一个，但是实际上通过上述的声明，我们实现不了这种提示。

5package.json 三方属性
------------------

package.json 中也存在很多三方属性，比如 tsc 中使用的 types、构建工具中使用的 sideEffects,git 中使用的 husky，eslint 使用的 eslintIgnore，这些扩展的配置，针对特定的开发工具是有意义的这里不一一举例。

### 参考资料

[1]

mailto:react-focus-lock@2.8.1: _https://link.juejin.cn?target=mailto%3Areact-focus-lock%402.8.1_

### 

*   ### 
    
    前端 社群  
    
      
    
      
    
    下方加 Nealyang 好友回复「 加群」即可。
    
    ![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0N4k0zoSSTiaUeicvTRStJYYmGWa6YpNqicxibYmM4oSD8oWs9X8b9DfK3CpUmGMWzIriaiaOf1L59t9nGA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
    如果你觉得这篇内容对你有帮助，我想请你帮我 2 个小忙：  
    
    1. 点个「在看」，让更多人也能看到这篇文章