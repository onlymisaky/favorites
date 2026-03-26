> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PxuImVKSaSIRwooda2ohPg)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

> 作者：Moment
> 
> 链接：https://juejin.cn/post/7553165143376134195

当 AI 技术刚刚兴起时，我加入了一家 AI 初创公司。由于我们在项目中有着对高级编辑功能的需求，我第一次接触到了 Tiptap。让我印象深刻的是，Tiptap 与其他编辑器相比，最大亮点在于它的灵活性和可扩展性。这种高度的定制能力，让我们能够根据需求随时调整和扩展编辑器的功能，完全满足了我们的独特要求。

经过一段时间的研究，我渐渐认为 Tiptap 应该是我未来选择的首选编辑器。另外现在公司很久就不干了，项目也没有上线，我完全可以复刻里面的核心功能。

现在在 dashboard 页面上能看到的基本就是将来要实现的核心功能了。

首先先贴相关地址：

Github 地址: https://github.com/xun082/DocFlow

在线预览: https://www.codecrack.cn

项目介绍
----

DocFlow 是一个基于 Tiptap 和 Yjs 构建的智能协作写作平台，类似飞书的文档功能，支持多人实时协作编辑。平台结合了 AI 生成内容和 RAG 知识库搜索，帮助用户在创作过程中快速获取相关信息，并提供智能写作建议。

DocFlow 还将具备类似 Dify 的工作流编排功能，用户可以创建自动化流程，定义不同任务和操作的执行顺序，实现任务的不同输入输出。通过这个功能，团队可以高效地管理创作过程，构建智能代理（Agent）来自动处理内容生成、文档整理等任务，极大提升生产力。

无论是文档写作、知识管理，还是复杂流程的自动化，DocFlow 都能提供强大的支持，帮助团队优化工作流并提升创作效率。

项目采用的 NextJs 和 NestJs 的全栈架构，

首选是前端的技术栈核心主要有以下几个：

1.  Next.js：用于构建 React 应用，支持服务器端渲染（SSR）和静态生成（SSG），非常适合 SEO 优化和提升页面加载速度。
    
2.  Tiptap：现代化的富文本编辑器，支持高度定制和扩展，适合各种文档编辑需求，并与 React 集成良好。
    
3.  TailwindCSS：通过实用类构建响应式和现代化界面的 CSS 框架，提高开发效率和灵活性。
    
4.  Radix UI：提供高质量、无样式的 UI 组件库，帮助开发者快速构建无障碍和响应式界面。
    
5.  Framer Motion： 用于 React 应用的动画库，提供丰富的动画效果，增强用户体验。
    
6.  React Query：高效的数据获取和同步库，用于管理远程数据的加载、缓存和同步。
    

未来做流程编排的话会使用 React Flow。

后端核心技术：

1.  NestJS：用于构建高效、可扩展的 Node.js 后端应用，支持模块化开发和依赖注入，非常适合构建企业级应用。
    
2.  Fastify： 高性能、低开销的 Node.js HTTP 框架，专注于优化速度，适合高并发和高效的 API 服务。
    
3.  Prisma： 现代的 ORM 工具，提供类型安全的数据库查询支持，适用于 PostgreSQL、MySQL 等数据库。
    
4.  MQ (消息队列)： 用于处理异步任务和消息传递，支持高并发、高可靠性的数据传输和任务调度。
    
5.  Socket.io：实时通信库，支持 WebSockets，帮助轻松实现实时消息推送和 Web 应用之间的实时通信。
    
6.  Langchain： 用于与多种语言模型（如 OpenAI 的 GPT）交互的框架，支持 AI 功能的集成，如文本生成、知识图谱等。
    
7.  Yjs：用于构建实时协作应用的框架，支持高效的数据同步，适合实时编辑和多人协作场景。
    

#### 目录结构

目录结构采用比较常见的结构：

```
src/
├── app/                # Next.js 应用目录，包含页面路由、布局配置等
├── components/         # 可复用的 UI 组件库
├── extensions/         # Tiptap 编辑器的自定义扩展功能
├── hooks/              # 自定义 React Hooks
├── services/           # 业务逻辑服务层（如 API 调用、请求封装等）
├── stores/             # 状态管理（如使用 Zustand、Jotai 等）
├── styles/             # 全局样式和样式模块
├── types/              # 全局 TypeScript 类型定义
├── utils/              # 工具函数、辅助方法
├── worker/             # Web Worker 实现，用于异步或性能密集型任务
└── middleware.ts       # Next.js 中间件，用于请求拦截、认证控制等


```

其中 styles 里面包含了大量的 tiptap 的 css 样式，这些 CSS 文件用于为 Tiptap 提供完整的富文本样式支持。由于 Tiptap 是无头组件，所有样式（如段落、代码块、表格、列表、协同编辑等）都需自行定义。每个 CSS 文件针对一个功能模块进行样式分离，便于维护与扩展。这种拆分方式能保持样式结构清晰、职责明确。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vu3qtaP8PtVDZT2dPG88XZUN4SRZMyiauKSNCliaLM9RfibEHpc7ZQq1Fug/640?wx_fmt=png&from=appmsg#imgIndex=0)20250923084026

每个文件代表不同插件的样式配置。例如，`code.css` 定义了代码块 `<pre><code>` 的样式，包括背景色、字体、行号等，适配 `CodeBlock` 插件，并支持语法高亮效果。

在 `components` 目录下，组件被分为两个不同的分类：

*   src 目录中的组件是全局公共组件或业务中可复用的组件，适用于多个页面或功能模块。
    
*   app 目录下的组件则是针对特定页面或布局路由组的业务组件，为避免与路由冲突，推荐将这些组件命名为 `_components`。
    

#### 核心模块

##### Service 封装和调用

service 目录下的 `request.ts` 为全局的 `fetch` 封装：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vukR0R23Iwk7ykKNRn2icSIaLMfEibYB7LDEibSV0TXzdu9HDAFetVfbe6Q/640?wx_fmt=png&from=appmsg#imgIndex=1)20250923084309

这段代码封装了一个基于 `fetch` 的请求工具类，支持统一的请求拦截、超时控制、错误处理和自动重试等高级功能。它提供了 `get`、`post`、`put`、`delete`、`patch` 等 HTTP 请求方法，并返回统一格式的响应结果，方便在项目中稳定复用。

对于不同模块的请求，可以在 services 目录下创建新的子目录进行模块化封装。例如，对于 user 模块，可以在 `user` 目录下创建 `index.ts` 来封装函数逻辑，`type.ts` 用于定义接口的入参和出参类型。通过这种方式，不同模块的请求逻辑清晰分离，便于维护和扩展。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuePcibWDhWOtMliaxOumTWl8ibhq8Y9iaEonzib63dywWw1AjRf32P8SaGpA/640?wx_fmt=png&from=appmsg#imgIndex=2)20250923084536

在实际调用时，无需显式使用 `try...catch` 来捕获错误。可以通过传入不同的错误处理逻辑，统一的 `fetch` 实例会自动处理错误并执行相应的处理方式。

##### Tiptap

借助 Tiptap 强大的扩展功能，我们可以在原有基础上轻松添加所需的功能，甚至可以在 Tiptap 上扩展整个页面。

创建扩展时，一般遵循以下原则：

```
import { Node } from"@tiptap/core";
import {
  NodeViewWrapper, // 用于包装 React 组件为 NodeView
  ReactNodeViewRenderer, // 用于包裹 React 节点，Tiptap 会识别它作为 NodeView 的容器
} from"@tiptap/react";

// 👉 你的自定义组件（实际渲染逻辑）
import MyReactComponent from"./MyReactComponent";

// 👉 定义扩展
exportconst MyNode = Node.create({
  name: "myNode", // 节点名称，必须唯一
  group: "block", // 节点分组，可选 block / inline / list
  atom: true, // 原子节点，不可编辑内部内容
  draggable: true, // 是否允许拖拽移动
  inline: false, // 是否是 inline 类型，默认为 block

// HTML -> Node 映射（反序列化）
  parseHTML() {
    return [
      {
        tag: 'div[data-type="my-node"]', // 将 HTML 标签映射到该节点
      },
    ];
  },

// Node -> HTML 映射（序列化）
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { ...HTMLAttributes, "data-type": "my-node" }, // 使用自定义数据属性
      "", // 空的内容，原子节点不包含可编辑内容
    ];
  },

// 客户端渲染视图（NodeView）—— 仅在浏览器中执行
  addNodeView() {
    // 仅在客户端执行 NodeView 渲染
    if (typeofwindow !== "undefined") {
      return ReactNodeViewRenderer(MyReactComponent);
    }
    returnnull; // SSR 时跳过 NodeView
  },

// 自定义命令：插入该节点
  addCommands() {
    return {
      insertMyNode:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});


```

创建完成之后可以在这里添加并导出：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vutLzBGssjbpJp9juocMplIPycUTMlwlic2VJjaarP8JxA8NwaNtsqLSQ/640?wx_fmt=png&from=appmsg#imgIndex=3)20250923084804

这两个文件都要。

##### Prisma

Prisma 非常好用，懂的都懂，项目目前 Mysql 的架构如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vugoX1ibC5ORpKibnaxubH2iajP8UPJzpZYaMPEObmKNdAFr5x4auLQRNZw/640?wx_fmt=png&from=appmsg#imgIndex=4)20250923092635

##### Rabbitmq

目前项目中的 AI 播客生成采用消息队列机制进行处理，主要是因为 TTS 接口存在较高的请求并发。通过使用消息队列，我们确保每次只处理一个请求，从而避免了并发请求对系统性能的影响。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuAJksEcAGcYpcsbkRv7m3xy0GtfKbicXIXRpJllALMqwqTYXw7prKulw/640?wx_fmt=png&from=appmsg#imgIndex=5)20250923163214

功能展示
----

### 协同编辑

协同编辑我们可以再文档这里点击文件进行分享，并且可以设置文件的权限以及是否需要密码等：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuJaYtWYTlHelYnoTibORHbE6I7KVgFF6uIsP26ibxzia1zUiadd53zUelBg/640?wx_fmt=png&from=appmsg#imgIndex=6)20250923174959

之后可以将这个 URL 分享给其他用户，点击之后会有这样的效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vumq6eSF10bflpKj4UaomPLu2sWxcBvv2b9GQchulZ0dchoGgxLsaDQA/640?wx_fmt=png&from=appmsg#imgIndex=7)20250923175045

这个功能跟百度网盘之类的分享类似，这里的主要使用了 RBAC 和 ACL 进行权限控制。

之后我们就可以进行协同编辑了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuaqQ421Aq0tgvaN2uKKWAWz2gAf4ibEgN2T9EHiavb5zTtukD9rydvqAw/640?wx_fmt=png&from=appmsg#imgIndex=8)

  

### AI 续写和 AI 问答

AI 续写和 AI 问答的功能正在逐步挣钱，目前以及支持 RAG 了，先看效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuyXLiaIJqLZFrRicWcwiatZ1AtWmo9RHc5HNbjib4HpR7vZZWKpjPQY9hjw/640?wx_fmt=png&from=appmsg#imgIndex=9)

  
continue.gif

上面的是续写的，接下来展示 AI 问答的，首先我们可以上传我们自己的一些内容：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vugj00hdWeOrhvy3dTBGRRIzdlsxRDMT295wVJVzBr6NEA3n8icAATZKg/640?wx_fmt=png&from=appmsg#imgIndex=10)20250923182314

之后我们执行 AI 问答：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vur7YUBWQxfAykbAM786Dibu7MX97VwOHQY0Hia0Sf5EZpWZfib47tfhkpQ/640?wx_fmt=png&from=appmsg#imgIndex=11)20250923182418

你可以看到我们添加的内容被我们输出到了这里了，这个就是我们当前的 RAG 的功能，当然后续会继续增强：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuV3ohMORsORCtoFbX8dZ4dhYSxibUm50HKbxKDTbjWxtsLylaLwlicn0A/640?wx_fmt=png&from=appmsg#imgIndex=12)20250923182554

他的原理如下流程图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuJHBB5vVqGgzoQEmeOzf13CZlQzxZTFgNBH7pJsWicNjia8aib0Qw3JGbQ/640?wx_fmt=png&from=appmsg#imgIndex=13)20250923183116

从文档处理角度来看，实现流程如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vudop0pRiaxela3G917fWNqK1VEPlWdLCgVUVouFzwuRRcBpVQehJOpBA/640?wx_fmt=png&from=appmsg#imgIndex=14)20250923183138

### AI 播客

AI 播客处理流程是用户上传简历和选择相对应的面试官，但是最好是相同简历对应面试官类型，不然可能生成出来的内容乱七八糟的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vumC2AcWVF6PLNW8HEHib8iaicM9ib2pa2TLLQqLh1uxNk9UMHS82hAN9XuQ/640?wx_fmt=png&from=appmsg#imgIndex=15)20250923183508

### 其他

关于编辑器里面还有很多内容没有介绍到，更多的可自行体验:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vu3NqdG6v2dFoUF6BVpRBQF0bcHmozjLzbuY9MdL530AejUrtUBySiboQ/640?wx_fmt=png&from=appmsg#imgIndex=16)20250923183627![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuHA6LKMEAJwBEJmywFWA1ibJq2tUzia7bowwLibIhUY6a3XdibDwtibbK5FQ/640?wx_fmt=png&from=appmsg#imgIndex=17)20250923183658

后续会继续增强，添加导入导出等功能。

未来
--

将来要做的内容非常核心，例如侧边栏这边的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuxghCB2rrfaoULItEtQyYTaAQLzTErf5fOWRtr7xs6VKr7nPNozbjAw/640?wx_fmt=png&from=appmsg#imgIndex=18)20250923183820

除了前面讲了这这些 Agent 和流程编排，将来还会实现如下核心功能：

1.  添加组织，增强权限管理。
    
2.  对应文档支持评论功能
    
3.  接入 Sentry 埋点监控
    
4.  后端接入 Prometheus 监控
    

总结
--

如果你对 AI 应用与富文本编辑器生态感兴趣，欢迎为本仓库点亮 Star 并开启 Watch，获取最新迭代。

希望了解更多服务（企业咨询、插件定制、参与开发、私有化部署等），请添加微信 `yunmz777`（备注：DocFlow）。我将邀请你进入技术交流群，与一线开发者交流实践经验、获取路线图。

Github 地址：https://github.com/xun082/DocFlow

在线预览：https://www.codecrack.cn

另外我还出有一个前端的体系课，内容包括前端工程化，React 源码等内容，如果你感兴趣，欢迎添加我微信进行更详细的了解：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vubCykIyIGJ9U6QyDNgmmIicBQsQ8jb1pWwfclTJx5Z7sDic3bl63T34UA/640?wx_fmt=png&from=appmsg#imgIndex=19)20250923185924![](https://mmbiz.qpic.cn/sz_mmbiz_png/YBFV3Da0NwtOyqibxD7uAlAbq8I4L09vuSwpUnsaZ6ia40dmDXZfomFxPeciccSorjBGAYDorulne1sDNOYzaqyzA/640?wx_fmt=png&from=appmsg#imgIndex=20)20250923185952

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```