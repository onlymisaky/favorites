> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/oYtY7VF1yo5sKDBNEpjF_A)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

最近公司的很多项目都用到相同功能的时间格式化函数，如果每次来一个项目都拷贝一份代码的话，就很麻烦，结合我们之前介绍的 Verdaccio 搭建 npm 私有服务器；本文我们通过 Vite 作为脚手架，封装一个时间函数的组件库。

封装时间函数，就绕不开强大的 Momentjs 库，但是 Momentjs 库又比较大，我们打包的时候不想将其打包进我们的库中，打包时需要将依赖包进行排除；因此本文我们主要来看下如何通过 Vite 封装一个纯工具库，并且发布到内部的 Verdaccio 上使用。

框架搭建
====

首先我们使用 pnpm 包管理器搭建一个 Vite 项目，选择`库打包模式`。

```
pnpm create vite


```

输入我们项目的名称，然后选择框架，选择其他 Others：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVTZuWlpNiakmhx2PdJWTVlUoNhuCM5hh71grNTYLgjicVnW76IH8Zvqug/640?wx_fmt=png&from=appmsg)选择框架

这一步是选择项目的模板，我们在这里选择库模式：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIV8cmu5P2Nfvas00P1Sca5jWKBAGticJphrcgf99vxI3yDmmStvkTHkiag/640?wx_fmt=png&from=appmsg)模板

最终我们生成项目模板的基本目录结构如下：

```
|- lib
    |- main.ts
|- public
    |- vite.svg
|- src
    |- main.ts
    |- style.css
    |- typescript.svg
    |- vite-env.d.ts
|- index.d.ts
|- index.html
|- package.json
|- tsconfig.json
|- vite.config.ts


```

这里我们对主要的文件和文件夹进行使用的说明；lib 作为我们项目模块的主要存放目录，可以将我们不同的函数和模块等，放到它的下面，最后使用 index.ts 进行统一导出。

src 目录是调试目录，我们可以在 main.ts 中引入 lib 中的模块，进行调试，测试功能是否正常调用；因此这个文件夹下面的 style.css 和 svg 文件基本用不到。

> ❝
> 
> 想要在局域网中开启调试，在 package.json 中修改 dev 添加`--host`参数。
> 
> ❞

此外，还有两个文件夹是打包后出现，一个是 dist 文件夹，生成打包后的文件；另一个是 types 文件夹，存放生成的类型声明文件；因此我们调整后的目录结构大致如下：

```
|- dist
    |-（打包后的文件）
|- lib
    |- index.ts
    |- （其他模块）
|- src
    |- main.ts
| types
    |- index.d.ts
    |- （其他类型声明文件）
|- package.json
|- vite.config.ts


```

使用块级注释
======

我们项目的主要结构基本定义完后，先来写两个工具函数尝试一下，在 lib 目录下新建一个 format.ts，导出两个函数，用来实现时间戳和时间字符串的相互转换：

```
import moment, { MomentInput } from "moment";

// 将时间戳转换成时间字符串
export function formatTimestampToDate(
  timestamp: MomentInput,
  formatter = "YYYY-MM-DD HH:mm:ss"
) {
  return moment(timestamp).format(formatter);
}

/**
 * 将时间字符串转换成时间戳
 * @param {String} date 时间格式，例如2023-06-01 02:00:00
 * @returns {Number} 返回时间戳，例如1689264000000
 */
export function formatDateToTimestamp(date: MomentInput) {
  return moment(date).valueOf();
}


```

接着我们需要在 lib/index.ts 中进行统一导出：

```
export { formatTimestampToDate, formatDateToTimestamp } from "./format";


```

上面的两个函数，我们发现使用了两种注释方式，一个是我们常见的行内注释，也就是两个斜杠的方式；另一个是比较详细的块级注释，将入参和出参都详细的标注说明；块级注释的好处，让我们在`src/main.ts`中引入两个函数看下实际的效果就知道了。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVaXJLotWKSV3uib4Kjmk8eyGX1ibVb9YrPsHlb2YshutpbF1nqRPB2IHw/640?wx_fmt=png&from=appmsg)行内注释![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVQODic4zd07oQ3ukWicf931DAOLiabZpMS6cibE30HHt44ehuKKNzuN7JTg/640?wx_fmt=png&from=appmsg)块级注释

很容易就发现，使用块级注释，在调用函数时具有很好的提示效果；这样别人在调用我们封装的函数时，就不用担心不知道函数的怎么调用，以及入参怎么传的问题了。

那么如何来生成这样的注释呢？VSCode 提供了一个插件 jsdoc，我们可以在商店中很方便的搜索并安装：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVQBgScPwEjljiaTicQ1FibqpdOcEe0kjwPCDqxVx9uB5icrMQxRpGpDkRUA/640?wx_fmt=png&from=appmsg)jsdoc

插件的使用也很简单，我们只要写前面`/**`，然后 VSCode 就会自动提示使用 jsdoc 的注释了。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVmbURkzzvfqnVMdiaoiaXZm2kswHRhzwPLwm3jtsdmPyDu9icb5dRZmE4Q/640?wx_fmt=png&from=appmsg)使用 jsdoc

生成类型声明文件
========

我们在上面目录结构中说到，types 文件夹用来存放生成的类型声明文件；这些类型声明文件包括上面编写的函数注释以及入参出参的类型；它的作用，主要就是在我们安装项目依赖后，VSCode 就会从依赖中找到声明文件，进行提示操作，方便包的使用者来调用函数。

因此类型声明文件就相当于是我们项目提供给外部的一份说明书，其重要性自然不必多说，但是如果让我们一个函数一个函数的编写说明书，大家肯定是不乐意的；那么回到我们的项目上来，看下如何根据我们导出的函数，自动的生成类型声明文件呢？

> ❝
> 
> 可以将项目根目录下初始化生成的`index.d.ts`文件删除。
> 
> ❞

打开`tsconfig.json`文件，添加类型声明文件的配置，`outDir属性`设置输出的目录：

```
{
    "compilerOptions": {
        + "declaration": true,
        + "outDir": "types",
        + "emitDeclarationOnly": true,
        -  "noEmit": true,
    },
    -  "include": ["src"],
    +  "include": ["lib"]
}


```

这里 include 属性是设置生成类型声明文件需要包含的文件夹，我们上面定义了 src 作为调试目录，因此这里需要改为我们代码的主要目录 lib；修改后我们进行打包，可以看到我们的类型声明文件已经生成在 types 目录下了：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIV1WPu0wfFxVPdVZhWnhS53NO8pYRQWzKE2zIvW43icMsZBZxiaZdkfic3Q/640?wx_fmt=png&from=appmsg)类型声明文件

此外，我们还需要将 package.json 中的`types`属性进行修改，告诉包的调用者，我们的类型声明文件放在哪：

```
{
    - "types": "./index.d.ts",
    + "types": "./types/index.d.ts",
}


```

依赖管理
====

在平时的开发中，相信大家对`dependencies`和`devDependencies`比较了解了，我们知道`dependencies`是我们项目运行所必须的依赖，比如我们正常开发一个项目，用到 vue、react、element-plus 等依赖，都可以放到这里；而`devDependencies`则是在开发过程中用到的依赖，比如 typescript、vite、webpack 等涉及编译打包等一些依赖，都是放到 devDependencies 字段。

那么如果别人在安装我们开发的包时，npm 会如何处理 devDependencies 字段里面的包呢？很明显，npm 不会去管这个字段，这个字段只是在我们包在开发中用到的依赖。

而另外一个`peerDependencies`这个字段我们在平时项目开发中接触的比较少，它的翻译过来的意思就是`对等依赖`；就像我们在包里封装时间函数时，需要用到 Momentjs 库，但是如果打包的时候将其打包进去，会导致整个包非常臃肿，如果调用我们包的项目也安装了 Momentjs 库，就会造成资源重复打包。

这时，我们就可以在 package.json 中，添加`peerDependencies`，告诉包的调用者，想要安装我，首先要安装这个字段下面所有的包；如果我们去看 vuex 和 vue-router 的包，我们会看到它们的 package.json 中都将 vue 设置为对等依赖：

```
{
  "peerDependencies": {
    "vue": "^3.2.0"
  }
}


```

那么回到我们的项目中来，我们在安装 Momentjs 时，可以添加`--save-peer`参数：

```
pnpm add moment --save-peer


```

在 vite 打包时，还需要通过配置将其从打包中排除：

```
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // 其他配置
    rollupOptions: {
      external: ["moment"],
      output: {
        globals: {
          moment: "moment",
        },
      },
    },
  },
});


```

这样，后续当我们在项目中安装我们开发的包时，我们会看到提示安装了两个依赖包, 即包本身及其下面对等依赖的包；如果我们去查看 node_modules，目录下中也有了 moment。

```
npm install vite-library-demo
added 2 packages in 2s


```

发包
==

写到这里，我们的包基本的功能已经都具备了，可以进行发包的操作了；这时我们又面临了一个问题，我们需要对哪些文件进行打包然后发布上去呢？

根据上面的项目结构，我们主要需要发布的就是 dist 和 types 文件夹，而 lib 和 src 文件夹都是需要排除的。和`.gitignore`一样，`.npmignore`文件是用来指定在发包时需要排除的目录；此外，下面这些文件是默认发布的，加不加到 ignore 都没有影响：

*   package.json
    
*   README.md
    
*   LICENSE
    
*   CHANGELOG
    

> ❝
> 
> 当项目中没有指定`.npmignore`时，默认使用`.gitignore`文件
> 
> ❞

因此，我们在项目根目录新建一个`.npmignore`文件，写入如下内容，将我们不需要的文件和文件夹进行发包时的排除：

```
node_modules
src
lib
vite.config.ts
tsconfig.json
index.html


```

此外，如果我们项目下文件比较多，一个一个排除比较麻烦，我们可以参考 vuex 包的 package.json，将我们需要发布的文件，直接放到`files`属性下即可：

```
{
  "files": [
    "dist",
    "types"
  ],
  // 其他属性
}


```

因此，我们可以发现，包文件的优先级从高到低如下顺序：

```
files属性 > .npmignore > .gitignore


```

另外这里有一个非常实用的小技巧，我们不需要每次 publish 后再查看包的内容，可以通过`npm pack`先生成一个包进行预览，再通过`tar -tf XXX.tgz`就可以预览包了。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVUBrz8y3YkKiaiaVdxGg9aIUiaZRX6hPta9OP7DhGzq6EEp06NOOMYnECg/640?wx_fmt=png&from=appmsg)发布预览

最后，我们可以在这个包里添加一些发布信息，例如包作者和主页的信息：

```
{
  "author": "",
  "homepage": "",
  // 其他属性
}


```

当然别忘了，添加 READMD.md 说明，告诉大家你这个包是做什么用的；最后，在激动的输入`npm pubsh`命令后，我们的包就正式发布到 Verdaccio 上去了，快去告诉你的小伙伴来调用你的包把。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiazIXv4iapjZkk8ZsZaoNIVicpfibCf6wOZbPiaAeMUV41CxkPloPSNWcOvIRJ8eQZKaXiaiaJmOibM5bMA/640?wx_fmt=png&from=appmsg)发布❞

聊了这么多 Vite 封装工具库的教程，你学会封装并发布它了吗？

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```