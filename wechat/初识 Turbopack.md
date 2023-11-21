> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Tu8unIaDTklrJgOx7nkG5Q)

👆  这是第 171 篇不掺水的原创，想要了解更多，请戳下方卡片关注我们吧～

> 初识 Turbopack
> 
> http://zoo.zhengcaiyun.cn/blog/article/turbopack

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSl7wicwBibHRZt7R5ibxbmCHRaMrosBa03bjq1Y01agYTTnMZv2BnjMth9g/640?wx_fmt=png)

一 前言
====

前端构建工具从 Grunt, Gulp 发展到具有划时代意义的 Webpack，Webpack 成为前端不可或缺的开发构建工具。但是随着前端的项目越来越大，无论是项目的启动时间，还是项目的打包时间，变得原来越长，短则四、五分钟，长则十几二十分钟。特别是在发版期间，打包速度直接影响发版效率。Webpack 打包速度成为了前端开发的最大痛点之一。

二 什么是 Turbopack
===============

Turbopack 是 Webpack 的作者 Tobias Koppers 使用 Rust 语言开发一个前端模块化的工具，按作者构想 Turbopack 的目标是取代 Webpack。官方宣称 TurboPack 的速度比 Vite 快 10 倍，比 Webpack 快 700 倍。目前 Turbopack 仍然处于 AIpha 阶段，离正式运用到生产环境还有不少时间。

三 Turbopack 功能和特点
=================

如果用一个字来形容 Turbopack，“懒” 字再合适不过，极尽所能做不必要做的事情。

为了更好的说明 Turbopack 特性，我们使用 Webpack 作为对比的对象。

### 1. 增量计算和函数级别的缓存

我们用一个简单的例子来说明增量计算和缓存，如下代码是一个页面的代码，代码包含了 Header 和 Footer 两个组件：

```
import Header from '../components/header'import Footer from '../components/footer'export default function Home() {  return (    <div>      <Header />      <h1>Home</h1>       <Footer />    </div>  )}
```

当页面访问 /home 时 Header 和 Footer 会被标记为需要缓存 ，并被编译输出为 components_header.tsx.js 和 components_footer.tsx.js。而后更新 Footer 这个组件并保存，在 Webpack 中 Header 和 Footer 两个组件都会被重新编译，而仔细观察 Turbopack 输出的缓存文件，会发现只有 Footer 组件被重新编译，而 Header 组件则使用的是上一次的编译结果，如图所示 compoents_footer.tsx.js 的文件被刷新，而 header 则依旧是上一次的结果。![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSl0AtdEpibGEk0KxQLwnyibZibOXicgLkseXfUR5Rux7V7ZfUzGsBdXSSibxg/640?wx_fmt=png)

通过这种缓存机制，去除大量重复的工作，使得编译的效率大幅度的提升。

### 2. 按需编译

本地开发时，Webpack 启动时要全量编译所有文件，这使得启动项目或者切换分支后需要花费大量的时间重新打包编译。而 Turbopack 则采用按需编译的方式，我们使用一个简单的例子来说明什么是按需编译，为什么 Turbopack 的启动速度如此之快，在项目的基础上添加一个 Login 的页面，如下所示：

```
import Header from '../components/header'import Footer from '../components/footer'export default function Login() {  return (    <div>      <Header />      <h1>Login</h1>      <Footer />    </div>  )}
```

启动项目，在不到 1s 时间后控制台提示已经启动成功，但是文件目录下却没有输出任何缓存文件，这是由于 Turbopack 的按需编译机制，所有组件在启动时都未被使用，所以没有任何的编译操作。在浏览器中访问项目的首页地址，此时观察输出缓存文件则发现 /home 页面及其依赖的组件才被编译：![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSlPWbvBBPmTsvvf2ycvNiaokFYTJtowvs4zYzoze3Hiaro8bofVHibqGAtg/640?wx_fmt=png)

而我们添加的 Login 的页面并没有被编译和输出，我们再次访问 /login 页面，在看一次输出的缓存文件：

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSlSOI4spzZ0hB1G8zsYPadJInKq7y8XXSrctMAXCqRJjvtPmfPpR34kQ/640?wx_fmt=png)

在浏览器访问 /login 之后，该页面的以及所依赖的组件才会被编译，而这种按需编译的机制，减少程序的重复工作，提升开发人员的工作效率。此外还有一点，虽然 /home 和 /login 页面都依赖于 Footer 组件，当浏览器访问 /login 时只会更新当前页面的下的 Footer 组件，而 /home 页面下的 Footer 组件是不会被更新的。

### 3. SWC 编译器

Turbopack 的速度如此之快有一个很大的原因是使用了 SWC 作为编译器。大部分 Webpack 的项目编译都是使用 Babel 编译和转换，由于 Babel 本身也是使用 Javascript 编写，转换效率并不理想，而 Turbopack 原生使用 SWC(https://swc.rs/) 作为编译器。SWC 是一款 Rust 编写的 Javascript 代码编译器，官方宣称其编译速度是 Babel 的 20 倍（ Webpack 也可以使用 SWC）。

### 4. 本地持久化

根据作者的想法，未来编译结果不仅仅缓存在内存当中，还会本地持久化。本地持久化的意义是什么？在实际的生产环境中， 中大型的项目往往都需要打包 15 分钟甚至更久，编译结果持久化可以节省大量的打包时间。假设项目里有 50 个页面，本次迭代只修改了其中 10 个页面，Webpack 打包会全量重新打包 50 个页面，而 Turbopack 只需重新打包 10 个被修改的页面，未修改的 40 个页面直接从硬盘读取上一次打包结果，打包效率则得到非常大的提升。

### 5. Imports

根据作者的计划，Turbopack 支持 CommonJS、ESM， 部分支持 AMD。

CommonJS:

```
const { add } = require('./math');add(1, 2);
```

ESM:

```
import img from './img.png'; import type { User } from '../server/types'; import { z } from 'zod';
```

Dynamic Imports:

```
const getFeatureFlags = () => {    return import('/featureFlags').then(mod => {        return mod.featureFlags;    }) }
```

### 6. 框架支持

原生支持 JSX/TSX，不需要引入 React 也能使用 JSX/TSX.

```
- import React from 'react'; const Component = () => {   return <div />}
```

作者计划在未来通过插件的形式支持 Vue 和 Svelte。

四 Turbopack 体验
==============

目前 next.js v13 搭配 Turbopack 已开放体验

```
npx create-next-app --example with-turbopack
```

在启动代码里新增常规启动方式，分别使用两种方式启动项目，做个对比。

```
"scripts": {    "dev": "next dev --turbo",    "dev_normal": "next dev",    "dev:tailwind": "concurrently \"next dev --turbo\" \"npm run tailwind -- --watch\"",    "build": "next build",    "start": "next start",    "lint": "next lint",    "tailwind": "tailwindcss -i styles/globals.css -o styles/dist.css",    "format": "prettier --write \"**/*.{js,ts,tsx,md}\"",    "postinstall": "npm run tailwind"  },
```

使用 Turbopack 启动时间：![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSl107JUb2PpicKicHwkH6SvJNlJ8dpibCLgII2CmszsO5aDcDqnK2VBdEJg/640?wx_fmt=png)

使用常规方式启动项目的时间：

![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSlNib3YynL3m0rtbxyOiajMqBFiaiaibGL7hYL1uzySkLItAhnjzDqGoibnQSA/640?wx_fmt=png)

该测试项目仅仅只有 200 个模块，得益于按需编译方式，Turbopack 的启动速度远比常规的方式要快的多。但是以上方法只能看出启动速度，在实际的开发中打包速度更能提升开发体验，因此想测试下 Turbopack 在大量模块下的打包编译速度。

新建一个 Next 的项目:

```
npx create-next-app@latest
```

安装 Turbo：

```
npm install turbo --save-dev
```

启动服务：

```
npx turbo dev
```

使用以下脚本批量生成模块，将代码 batch.js 文件保存在项目的根目录下，并在 pages 目录下新建 components 文件夹：

```
const [nodeExeDir, fileDir, count] = process.argv ;var fs = require('fs');const getJsx = (index) => {    return `export function Comp${index}() {        return <div>hello world ${index}</div>      }`}(async () => {    let importJsx = [];    let renderJsx = [];    for(var i=0;i<count;i++){        await fs.writeFileSync(`./pages/components/comp${i}.tsx`,getJsx(i),'utf-8');        importJsx.push(`import { Comp${i} } from './components/comp${i}';`);        renderJsx.push(`<Comp${i} />  `)    }    await fs.writeFileSync(`./pages/page.tsx`,` ${importJsx.join('\r\n')} \r\n export default function Page() {        return <div> ${renderJsx.join('\r\n')}  </div>    }`,'utf-8');})();
```

执行代码：

```
node batch.js 1000
```

后面的数字为生成的模块数量，代码生成完成后将 page.tsx 引入并重启服务。分别生成 1000 ~ 10000 个模块的页面，并使用 Turbopack 运行， 记录多次编译所需的平均时间。作为参照使用 Webpack + Babel 的打包速度作为对比，操作方法同上。 得到以下曲线图：![](https://mmbiz.qpic.cn/mmbiz_png/sticlevzdTIC4GpzZkvibLYqREiaAuPHUSlNiaDJIbDiaC5wRwAxdqekIuRWcKSzKmuuzquJuOj4ibUIP9X2zLf1R4pQ/640?wx_fmt=png)

从图表中可以看出，随着模块的增加，打包编译的时间是比较接近线性增长。测试过程中出现了一种情况，当模块数量超过 10000 个后编译时间变得非常不稳定，从 60s ~ 100s 都存在，没有统计意义，所以只统计到 10000 个模块。当数量达到 13000 个，编译过程会出现进程超时的情况。

备注 1：测试的结果会因为 模块的大小、硬件设备、平台的不同，而有比较大的区别；

备注 2：如果使用命令搭建失败，您可以在 https://github.com/vercel/next.js 的 example 文件夹里找到该项目。

五 Turbopack 的生态问题
=================

除了上文所说的打包器之外，还有一款被大家熟知的打包器 Vite。相比 Webpack， Vite 的打包速度也比 Webpack 快非常多，但是流行程度依然没有 Webpack 这么高，比较重要的原因之一就是生态的问题。在 Webpack 的社区有丰富的插件供开发者使用，未来 Turbopack 也会遇到同样的问题。与 Vite 不同的地方，Turbopack 由同一个作者开发，和 Webpack 是继承关系，但作者表示并不会对 Webpack 和 Turbopack 做 1:1 的兼容，意味着 Webpack 的插件是无法在 Turbopack 上使用，同时作者也表示会将在 Webpack 上广泛被使用的插件移植到 Turbopack。因此 Turbopack 想替代 Webpack，未来还有很长的路要走。

六 总结
====

Turbopack 想替代 Webpack 急需解决的一个是生态问题，以及提供尽可能低成本的迁移方案。当迁移后的收益远大于迁移成本，Turbopack 完全取代 Webpack 也不是没有可能。就目前而言，未来一段时间内 Webpack 依然是主流的前端的工具。

七 参考文档
======

*   https://turbo.build/pack/docs
    

看完两件事
-----

如果你觉得这篇内容对你挺有启发，我想邀请你帮我两件小事

1. 点个「**在看**」，让更多人也能看到这篇内容（点了「**在看**」，bug -1 😊）

2. 关注公众号「**政采云前端**」，持续为你推送精选好文

招贤纳士
----

政采云前端团队（ZooTeam），一个年轻富有激情和创造力的前端团队，隶属于政采云研发部，Base 在风景如画的杭州。团队现有 80 余个前端小伙伴，平均年龄 27 岁，近 3 成是全栈工程师，妥妥的青年风暴团。成员构成既有来自于阿里、网易的 “老” 兵，也有浙大、中科大、杭电等校的应届新人。团队在日常的业务对接之外，还在物料体系、工程平台、搭建平台、性能体验、云端应用、数据分析及可视化等方向进行技术探索和实战，推动并落地了一系列的内部技术产品，持续探索前端技术体系的新边界。

如果你想改变一直被事折腾，希望开始能折腾事；如果你想改变一直被告诫需要多些想法，却无从破局；如果你想改变你有能力去做成那个结果，却不需要你；如果你想改变你想做成的事需要一个团队去支撑，但没你带人的位置；如果你想改变既定的节奏，将会是 “5 年工作时间 3 年工作经验”；如果你想改变本来悟性不错，但总是有那一层窗户纸的模糊… 如果你相信相信的力量，相信平凡人能成就非凡事，相信能遇到更好的自己。如果你希望参与到随着业务腾飞的过程，亲手推动一个有着深入的业务理解、完善的技术体系、技术创造价值、影响力外溢的前端团队的成长历程，我觉得我们该聊聊。任何时间，等着你写点什么，发给 `ZooTeam@cai-inc.com`

![](https://mmbiz.qpic.cn/mmbiz_jpg/vzEib9IRhZD7b2jpsibTsaZxWjfhyfqIpeMmOsdx6heH7KYxYXS1c6eQ30TrnyLyRa0SSs74NUM7BNTK8cu5XoibQ/640?wx_fmt=jpeg)