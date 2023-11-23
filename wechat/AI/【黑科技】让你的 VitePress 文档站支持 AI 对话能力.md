> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0irKEPA-BAaG78kpxMlV_Q)

这篇文章将教你如何使用一个开源工具 **Documate**（https://github.com/AirCodeLabs/documate）快速让你的 **VitePress**（https://vitepress.dev/） 文档站拥有 AI 对话能力，基于你的文档内容来解答用户问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXFfpBXiaGQOk7Bo6iboiaV1icLiafv8t4oDFnEbW0VztY3GmZ1icELoHtTdBw/640?wx_fmt=gif)

通过简单的配置，就可以将能力接入到你的网站之中。有了大模型的加持，用户上来几乎可以不读文档，直接与 AI 对话就可以完成自己的需求，对技术类产品文档来说，价值很高。支持流式输出，回答速度很快，并且开源，随时可以贡献和调整代码。

技术原理
----

仔细阅读了这个项目的源码，整体实现还是比较简单和清晰的。它由三部分构成：

第一部分：一个将文档提交到数据库的 CLI 工具，只需要在项目中配置下 documate.json 就行了。

`document.json`配置文件非常简单，只有三个配置项：

*   root 描述使用项目的哪个目录下的文件生成内容，默认是根目录
    
*   include 描述哪些是需要处理的文档文件，默认是 Markdown 文本。
    
*   backend 指定上传文档内容到后端保存的接口，OpenAI 根据这些内容来提供回答。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXUicmXAfIfyFTcdo7mmpgSoRBZSZa2bOumqtUqsic8OavZLe4WUl5GW3g/640?wx_fmt=png)

第二部分：一个封装好的拿来即用的问答 UI 组件，直接 import 组件就可以使用，目前提供了 Vue 组件以及不依赖任何框架的原生 JavaScript 的 UI。看 issue 规划，React 版本社区已经在支持中了，相信很快就会发布；

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuX4tSibye3lzgK4TvicuLibjVLpDdXsDDE0JVZwvg7o2y6Ux9d9YZlia7icYw/640?wx_fmt=png)

第三部分：一个提供问答服务、可一键完成部署的 AI Ask Server，可以在 AirCode 直接完成部署，也可以在自己的服务器上部署；

问答服务有了，UI 组件有了，数据也有了，那就可以尝试着玩耍了，整个配置过程大概可以在 15min 内完成。

如何接入
----

如果你想创建一个全新的 VitePress 项目并包含 AI 对话能力，可以使用下面的命令：

```
npm create documate@latest --template vitepress
```

创建完成后可直接跳到第 3 步「构建上传和搜索后端 API」继续配置。

如果要给已有的 VitePress 项目添加 AI 对话能力，则按照以下步骤进行。

### 1. 初始化

在你的 VitePress 项目根目录下使用以下命令进行初始化：

```
npx @documate/documate init --framework vue
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXfEickXljyzWDHRyS8CRhjPIuu8vyvdUb5WNDWsA7OQbyZJkocdOJdbA/640?wx_fmt=png)

该命令会创建一个 `documate.json` 配置文件。

```
{  "root": ".",  "include": [    "**/*.md"  ],  "backend": ""}
```

并且添加了一个 `documate:upload` 命令用于上传文档生成知识库，后面会介绍到具体用法。

```
{  "scripts": {    "docs:dev": "vitepress dev",    "docs:build": "vitepress build",    "docs:preview": "vitepress preview",    "documate:upload": "documate upload"  },  "dependencies": {    "@documate/vue": "^0.2.3"  },  "devDependencies": {    "@documate/documate": "^0.1.0"  }}
```

### 2. 给项目添加 UI 入口

在文件 `.vitepress/theme/index.js` 中添加如下代码，如果没有则需要先手动创建这个文件。VitePress 在 Extending the Default Theme 文档中介绍了如何定制自己的主题。

```
import { h } from 'vue'import DefaultTheme from 'vitepress/theme'// Load component and styleimport Documate from '@documate/vue'import '@documate/vue/dist/style.css'export default {  ...DefaultTheme,  // Add Documate UI to the slot  Layout: h(DefaultTheme.Layout, null, {    'nav-bar-content-before': () => h(Documate, {      endpoint: '',    }),  }),}
```

上面的代码会在导航栏中添加一个 AI 对话框的 UI。在本地使用 `npm run docs:dev` 启动服务后，你可以在左上角找到 `Ask AI` 的按钮。如果没有看到 Ask AI 按钮，可以检查下上面的代码是否都正确添加，并确保从 `@documate/vue/dist/style.css` 导入了 CSS 样式文件。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXibyKwqy24SatgejCtpNVn2KM2GfyfMxs8GTgpjibcRKQIINRAiaHsxSiaA/640?wx_fmt=png)

至此，你已经完成了 UI 的接入，接下来我们为对话框添加回答问题的接口能力。

### 3. 构建上传和搜索后端 API

Documate 的后端代码用于上传文档内容生成知识库，以及接收用户的问题并返回流式的回答。

进入 GitHub 中的 backend 文件夹，点击其中的「Deploy to AirCode」，快速复制并部署一份自己的后端代码。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuX3lViauS1tKrBvaSfCErpulnzicYuIZEs2icvUGg9H2ALiaTgTHLWzKp9wQ/640?wx_fmt=png)

如果是第一次使用 AirCode（一个在线编写和部署 Node.js 应用的平台），会被重定向到登录页面。建议选择 GitHub 登录，会更快一些。

创建应用之后，在 `Envrionments` 标签页中设置 `OPENAI_API_KEY` 环境变量为你的 OpenAI Key 值。你可以在 OpenAI 控制台 中获取到 API Key。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXN3ohP1MKC7kibhZibQ1cV8pV9SxicZo82OcbVVgsYxR5tGEaL9icmc2tgQ/640?wx_fmt=png)

点击顶部栏上的「Deploy」按钮，将所有的函数部署到线上，部署成功后可以得到每个函数的调用 URL。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXlVibF9B0ictibIlib2C5hAgUI2wGMQuCiaPOXfvEZs1OZWtFoNlbe4TuZDQ/640?wx_fmt=png)

这里会使用到 `upload.js` 和 `ask.js`两个函数，一个用于文档内容上传，另一个用于回答问题。

### 4. 设置 API 接口

在 AirCode Dashboard 中，选择部署后的 `upload.js` 文件，复制 URL 并添加到 `documate.json` 的 `backend` 字段中：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuX4tarETPO56CpmImDBS7vuyyITUia9Y5eQFOW5Fn8W7Hg9rmEqpkcOxw/640?wx_fmt=png)

```
// documate.json{  "root": ".",  "include": [ "**/*.md" ],  "backend": "替换为你的 upload.js 的 URL"}
```

同上操作，在 AirCode 中选择已部署的 `ask.js` 文件，复制调用 URL，修改 `.vitepress/theme/index.js` 文件 endpoint 值。

```
// .vitepress/theme/index.jsimport { h } from 'vue'import DefaultTheme from 'vitepress/theme'import Documate from '@documate/vue'import '@documate/vue/dist/style.css'export default {  ...DefaultTheme,  Layout: h(DefaultTheme.Layout, null, {    'nav-bar-content-before': () => h(Documate, {        // Replace the URL with your own one        endpoint: '替换为你的 ask.js 的 URL',      },    ),  }),}
```

### 5. 运行项目

通过下面的命令将内容上传到后端，生成文档知识库:

```
npm run documate:upload
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXN74GDJM4wGBdiawGPNwo0p2rpm9uia1kU6TtKxfslJicB62TUP0e1pHYA/640?wx_fmt=png)

命令完成后，本地启动项目，点击左上角 `Ask AI` 按钮，在弹出对话框后输入问题就可以得到基于你文档内容的回答。

```
npm run docs:dev
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/cAd6ObKOzEAJB9aJibFDw1TmA7C1YZmuXqkdLUWHp2hjzquibhEZZVUurfPVxtLko1UF9iaI6k56110egyboliageg/640?wx_fmt=gif)https://s2.loli.net/2023/09/19/nRvOlzXY2wUiyaJ.gif

更多的使用和配置方式可以参考 Documate 项目的 GitHub：https://github.com/AirCodeLabs/documate。欢迎留言讨论。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)