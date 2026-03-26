> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WJj0UKZVW-9Syow2T6KiWw)

本文介绍了 React 中 RSC（React Server Components）和 Server Action 的构建实践，包括它们的概念、渲染方式、在 webpack 中的打包流程，以及 Turbopack 是如何在一个模块图中完成打包多个环境模块的。

简单介绍下 RSC
=========

在 RSC 之前，React 只有 Client Component，你可以在 Client Component 中使用 Client 的能力，包括保持状态 useState、副作用 useEffect、事件处理以及客户端的各种 API 等，渲染方式有 CSR 和 SSR，它们都是对 Client Component 的渲染。

在 React 推出 RSC，就有了 Client Component 和 Server Component 两种组件，在 Server Component 中可以使用 Server 的能力，包括异步以及文件系统、数据库等服务端的 API。渲染方式也多了对 Server Component 的渲染：

*   RSC：在服务端渲染 Server Component，server side server component rendering
    
*   SSR：在服务端预渲染 Client Component，server side client component prerendering
    
*   CSR/Hydration：在客户端渲染 Client Component，client side client component rendering
    

Server Component 渲染后的结果会以流的形式，发送给 Client Component 进行消费 / 渲染，所以 SSR 也是 Server Component 的一个 client，SSR 和 RSC 是解耦的，你可以只使用 RSC 不使用 SSR。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqSt6IbhwRPW9wZwYphCETLxYge1pVPeiazyfiawvyIQCqxJ9xVA5UuaGefw/640?wx_fmt=png&from=appmsg)

当然 Server Component 并不一定需要 Server，可以和 SSG 一样在构建时渲染，将渲染结果存储为静态文件，甚至可能放到 Worker 渲染，但 RSC 这套架构下 React 的意图就是去结合 Server。

强烈推荐 React 官方这篇关于 Server Component 的 RFC（https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md），写得非常清晰全面，当然集成部分（框架集成、Router 集成、Bundler 集成等）写的比较简单，所以本篇文档就详细阐述了如何与 Bundler 进行集成。

除了 Server Component 之外 React 也推出了 Server Action，目前还处于探索阶段，也没有 RFC，使用它可以很方便的调用服务端的接口，它强依赖了 Server，实现上部分和 Server Component 解耦，只使用 Client Component 时也能使用 Server Action。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStibVXojhFFJGPb2oYOfr3ianH6W9Nfltd6Ix1qMXPibdicMZOvicDiclDx2qg/640?wx_fmt=png&from=appmsg)

Server Action 会在编译时编译成一段对 server endpoint 的调用的 async function，这说明它是可组合的，你可以把它当作 ReactQuery 的 queryFn 来使用。

在 Webpack 中打包
=============

> 以下代码实践可参考：https://github.com/ahabhgk/react-flight/tree/60928e2445292ec405876112c409ec11ad6573e7

RSC
---

根据 RFC 中所说 RSC 对 bundler 的要求有以下四点：

*   能够识别带有 `"use client"` 的模块，并当作 Client 模块进行处理
    
*   能够理解 package.json 中的 `"react-server"` exports
    
*   能够设置代码分割点，Server 模块引入的 Client 模块（`"use client"`）会当作潜在的代码分割点（Code Splitting）
    

*   一般情况下，在 Server 环境中，即 SSR 时，不会进行代码分割，以尽早加载 Client Component 不阻塞渲染
    
*   在 Client 环境中，会进行代码分割，以减少首屏的请求数量和代码体积
    

*   能够提供 Client 模块的 id、导出变量名（export）、所在 ChunkGroup 的 chunks 等元信息（manifest）
    

前两点比较容易理解，`"use client"` 是 Client 边界的标识，边界之内，即带有 `"use client"` 标识模块所引入的模块，不管有没有 `"use client"` 标识都会作为 Client 模块；边界之外，默认作为 Server 模块，Client 模块的导出的组件会当作 Client Component 了；在打包时我们会在 Loader 中解析 AST 来识别 `"use client"` 标识。

`"react-server"` 在 resolve 时会引入该 exports 对应的文件，一些适配 RSC 的库需要在 package.json 中写明该 exports，打包时只需要在 `module.rule[].resolve` 中添加 resolve condition 即可实现。

后两点主要帮助 React 在运行时加载 Client Component，首先介绍下整体渲染流程，以及 Reference 这个概念。

### 渲染流程

包含 `"use client"` 的 Client 模块在 Server 环境下的产物并不会保留原有内容，而是会被替换为 Client References。

```
// src/ClientComp.js"use client"export function ClientComp() { return <div>...</div> }
```

```
import { createClientReference } from "plugin/runtime/server.js"export let ClientComp = createClientReference("src/ClientComp.js#ClientComp")
```

当 Server 渲染 Server Component 时，遇到引入的 Client Component 实际上会是一条 Client Reference，React 运行时会通过 Reference 上的路径信息在 manifest 中拿到导出、ChunkGroup 中的 chunks、模块 id 等元信息，得到序列化后的 JSX。

```
import { ClientComp } from "./ClientComp"export async function App() { return <div><ClientComp /></div> }
```

```
0:"$L1"// Client Reference 渲染结果对应这条，包含一些元信息，可以通过这些元信息获得一个模块的导出变量，即 ClientComp 组件2:I{"id":"./src/ClientComp.js","chunks":["client0"],"name":"ClientComp","async":false}// 其他部分就是序列化后的 JSX1:["$","div",null,{"children":["$","$L2",null,{}]}]
```

发送到 Client（包括 SSR）渲染这段 Server Component 结果（序列化后的 JSX）时，在遇到 Client Reference 时会通过这些元信息加载 Client 模块，首先 React 运行时会拿其中的 chunks 通过 `__webpack_chunk_load__` 加载这部分被分割的 ChunkGroup，然后拿模块的 id 通过 `__webpack_require__` 运行对应模块，最后拿到对应 export 的组件进行渲染即可。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStz7RAKXkQfBBoa2dvIQjFrTia25VRFiaf0An4VfBMXZWicHClMSx9YaNbg/640?wx_fmt=png&from=appmsg)

### RSC-only

我们从 RSC-only 开始，先不管 SSR，整体分为两个编译，分别用于 server（`target: "node"`）和 client（`target: "web"`）环境的打包，我们的应用也分为两个入口，分别为 client-entry.js 和 server-entry.js，同时也作为两个编译的入口：

```
// src/client-entry.jsimport { use } from "react";import { createFromFetch } from "react-server-dom-webpack/client";import ReactDOM from "react-dom/client";const data = createFromFetch(  fetch(location[0], { headers: { Accept: "text/x-component" } }),  { callServer });const Root = () => use(data);const root = ReactDOM.createRoot(document.getElementById("root"));root.render(<Root />);
```

```
// src/server-entry.jsexport { default as App } from "./App";export { getServerAction } from "plugin/runtime/server";export * as ReactServerDOMWebpackServer from "react-server-dom-webpack/server";export * as React from "react";
```

client-entry.js 会对 Root 组件进行 mount，但没有渲染最主要的 App 组件，这是因为 App 是个 Server Component，会在 server-entry.js 中 re-export，作为 library 进行打包，在 server.js（server.js 是 dev/prod server 并不会参与打包）中引入并进行渲染，`createFromFetch` 会发送网络请求获取 App 序列化后的 JSX 并渲染在 client 端上。

```
// server.jsapp.get("/", async function (req, res, next) {  if (req.accepts("text/html")) {    next();  } else if (req.accepts("text/x-component")) {    const { App, ReactServerDOMWebpackServer, React } = await import(`./dist/server-entry.js?t=${+new Date()}`);    const clientModulesManifest = await fs.promises.readFile(`./dist/client-modules.json`, "utf-8");    // 渲染 Server Component    const stream = ReactServerDOMWebpackServer.renderToPipeableStream(React.createElement(App), clientModulesManifest);    res.set("Content-type", "text/x-component");    stream.pipe(res);  }});
```

我们假设有以下初始状态的 Module Graph：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqSt3NjiaGJoS9wTLWpgQlHY8ZKhBBxzZ62hDsFaHmhSVGWbcDWSicSgJszQ/640?wx_fmt=png&from=appmsg)

在 server compile 中，在编译 ClientComp.js 这个模块时，我们会遇到 `"use client"`，我们需要一个 Loader 来进行处理，这个 Loader 中需要解析 AST 识别 `"use client"` 并收集所有的 export 导出，以替换成 Client Reference，Client Reference 中不再存在对 Child.js 的引用，由此我们 server compile 的流程结束，之后进入 client compile，这也符合 `"use client"` 作为边界的定义。对于真正的 Client 模块 ClientComp.js，我们会在 server compile 中收集这些依赖的路径，在 client compile 中通过 `AsyncDependenciesBlock` 作为代码分割点（Code Splitting），将这些依赖作为 `react-server-dom-webpack/client` 这个 RSC 的 client runtime 的依赖，添加上去，可以得到以下 Module Graph：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqSttia9CrYLmqGHaP5Bpbkbfj07GEI4P9ujcpImekXY9TQcZ9YU7ic8Y8RA/640?wx_fmt=png&from=appmsg)

同时会在 client compile 中会收集这些依赖的元信息，即上面提到的模块 id、所在 ChunkGroup 中的 chunks、export 导出变量名等，生成一份对应 Client 端渲染时的 manifest（client-modules.json），用于在 server 中渲染 Client Reference。

由此我们也看出 RSC 的 client compile 强依赖 server compile 来收集这些带有 `"use client"` 的 Client 边界模块的路径，所以必须先 server compile 再 client compile，无法并行。

### CSS

这里 CSS 处理不考虑 css-in-js 方案，目前依赖 runtime 的 css-in-js 方案只能在 `"use client"` 模块中使用（有些依赖构建的 css-in-js 方案如 pandaCSS 可以在 Server Component 中使用，pandaCSS 可以理解为 css-in-js 写法的 tailwindcss）。

如果我们在 `"use client"` 边界以内的 Client 模块中引入 CSS，这部分 CSS 会随着 `"use client"` 边界的 Client 模块一同移入到 client compile 中，走正常的 client 编译流程，一点问题没有。但如果从 App.js 这种 Server 模块中引入 CSS，这部分 CSS 不会进入 client 编译流程，就出现了问题，所以我们也需要一种方式把这部分 CSS 移到 client 的编译流程中。

其实很简单，CSS 模块可以理解为隐式的 `"use client"` 模块，唯一的不同就是 CSS 模块不需要作为代码分割点异步的进行加载，而且 Server 模块必是 Client 模块的父模块，Server Component 的渲染会先于 Client Component 的渲染，所以 CSS 模块可以直接作为 `react-server-dom-webpack/client` 的 `ModuleDependency`，首屏加载即可。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStKgS1Yw95HWDVWycc8cPkicCRXABIU3HDokBiciaaCAVKj3kibJhpdd8nKg/640?wx_fmt=png&from=appmsg)

### SSR

接下来添加 SSR 功能，SSR 是针对 Client Component 在服务端的预渲染，只需要将 Client Component 添加到 server compile 中，打包出能够运行在 server 环境中的 Client Component 产物即可，但目前存在两个问题：

*   在 server compile 中，我们在编译到 ClientComp.js 时会把内容替换成 Client Reference，没有对子模块 Child.js 的引入，导致 server compile 在 make 阶段构建模块图直接结束了，我们如何将真正的 ClientComp.js 以及其子模块添加到模块图中呢？
    
*   ClientComp.js 替换为 Client Reference 后只是内容发生了改变，模块的唯一标识 identifier 仍然不变，如果想把真正的 ClientComp.js 模块也加入到模块图中如何确保其 identifier 与 Client Reference 模块的 identifier 不发生冲突呢？
    

针对第一个问题，我们可以在 `finishMake` 这个 hook 中，将收集到的 `"use client"` Client 边界模块构造出一个新的 Entry 虚拟模块，这个 Entry 的内容是 `import(/* webpackMode: "eager" */ "ClientComp.js")`，其中使用 dynamic import 可以确保在生产环境下不被 tree-shaking 以及 module concatenation 优化导致产物错误，使用 `webpackMode: "eager"` 确保不会被代码分割，之后调用 `addModuleTree`（该方法也是 EntryPlugin 处理正常 config 中 entry 时所用的底层 API）将该 Entry 模块加入构建队列开启第二轮 make。

对于第二个问题，可以使用 layer 来实现，layer 是 webpack 提供的在同一编译流程中将同一模块分为多个 “分身” 的 API，“分身”的 layer 不同 identifier 也会不同，layer 可以通过 `module.rule[].layer` 进行配置，模块默认的 layer 会继承其 issuer（即第一个引入该模块的模块）的 layer。SSR 中的 Client Component 其实也是 Server Component 的 client，所以我们将原有 Server Component 标识为 server layer，通过调用 `addModuleTree` 添加的 Client Component 标识为 client layer，得到如下 Module Graph：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStbicM9tjyXViayY0aibSXp5I3SRen8YSLAlGVxgkTs5NneXjLf8poOrukQ/640?wx_fmt=png&from=appmsg)

为了能在 SSR 时渲染 Client Component，类似的，我们也需要生成一份对应 SSR 渲染时的 manifest（client-modules-ssr.json）

### HMR

对于 Client Component 的处理和 CSR 一致，插入 HMR runtime，并在每个 Client 模块中用 `react-refresh/babel` 编译并插入 runtime 即可。

对于 Server Component 的处理则有些不一样，因为 Server Component 渲染是通过 fetch 请求然后 `use` 请求的结果，所以 Server Component 的更新，包括开发环境下修改代码导致的更新和生产环境下事件处理、路由跳转等导致的更新，都只需要重新 fetch 即可。

```
useEffect(() => {  if (process.env.NODE_ENV === "development") {    import(/* webpackMode: "eager" */ "webpack-hot-middleware/client").then((hotClient) => {      hotClient.subscribe((payload) => {        // dev-server 监听到 Server 模块变动后发送 "sc-refresh" 事件        if (payload.action === "sc-refresh") {          console.log(`[HMR] server components refresh`);          refresh(); // createFromFetch + use        }      });    });  }}, []);
```

Server Action
-------------

Server Action 目前有三种定义的方式：

*   出现在 Server 模块中，function-level 添加 `"use server"`，则该 async function 会被当作 Server Action
    
*   出现在单独的模块中，该模块被 Server 模块引入，该模块 top-level 添加 `"use server"`，则该模块导出的 async function 会被当作 ServerAction
    
*   出现在单独的模块中，该模块被 Client 模块引入，该模块 top-level 添加 `"use server"`，则该模块导出的 async function 会被当作 ServerAction
    

前两种方式由于是本身定义在 Server 模块中或者被 Server 模块引入，可以理解为被 server 环境引入，第三种被 Client 模块引入，可以理解为被 client 环境引入，据此可以将 Server Action 分为 from server 和 from client 两种，这两种 Server Action 的调用流程、打包方式也都有所不同。

### from client 调用流程

首先介绍下 from client 这种 Server Action 的调用流程。

类似于 `"use client"`，包含 `"use server"` 的模块在 Client 环境下的产物并不会保留原有内容，而是会被替换为 Server References。

```
// src/actions.js"use server"export async function handleSubmit() { ... }
```

```
import { createServerReference } from "react-server-dom-webpack/client"import { callServer } from "./router"// "src/actions.js#handleSubmit" 因为包含路径且会随着 Client 产物发送到 Client 端，所以生产环境需要加密/hash，通过解密/查表等方式在 Server 端找到真正的内容export let handleSubmit = createServerReference("src/actions.js#handleSubmit", callServer)// createServerReference 会返回 async function(...args) { return callServer("src/actions.js#handleSubmit", args) }
```

```
// src/router.jsexport async function callServer(id, args) {  const response = fetch("/", {    method: "POST",    headers: { Accept: "text/x-component", "rsc-action": id }, // 这里 id 即 "src/actions.js#handleSubmit"    body: await encodeReply(args),  });  return createFromFetch(response, { callServer });}
```

所以当调用 handleSubmit 时会调用 callServer 进行 fetch 请求服务端。

```
// server.jsapp.post("/", bodyParser.text(), async function (req, res) {  const { ReactServerDOMWebpackServer, getServerAction } = await import(`./dist/server-entry.js?t=${+new Date()}`);  const serverActionsManifest = await fs.promises.readFile(`./dist/server-actions.json`, "utf-8");  const serverReference = req.get("rsc-action"); // 获取到 id："src/actions.js#handleSubmit"  if (serverReference) {    const action = getServerAction(serverReference, serverActionsManifest);    const args = await ReactServerDOMWebpackServer.decodeReply(req.body);    const actionResult = await action.apply(null, args);    const stream = ReactServerDOMWebpackServer.renderToPipeableStream(actionResult);    stream.pipe(res);  }});
```

`callServer` 时会将 Server Reference 的 id 通过 rsc-action 头字段传给 server.js，在 server.js 中会根据记录 Server Action 元信息的 manifest 在 server compile 的产物中找到并加载真正的 Server 模块（actions.js），根据导出名取出对应 async function，然后在 Server 端调用并将结果响应。

### from client 打包

与 RSC 中对于 Client Component 打包的处理类似，使用 Loader 将 `"use server"` 模块的内容替换为 Server References，收集 `"use server"` 模块，通过 `addModuleTree` 进行第三轮 make，并标记回 server layer，同时收集元信息生成 manifest（server-actions.json），包括模块 id、导出变量名、所在 ChunkGroup 的 chunks。

算上 client compile，可以得到如下 Module Graph：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStCM5khnx5RxyJq5djZyJqnnTnicTo4GDJmAUkeYWhQtXICHibS4efsPAg/640?wx_fmt=png&from=appmsg)

### from server 调用流程

这种 Server Action 由于本身就在 Server 环境中，通过 props 传给 Client Component，所以在调用这种 Server Action 时，React 无法通过类似 from client，在 Server Reference 中拿到调用的 id，只能在渲染 RSC 时将这段 id 随 Server Component 序列化后的 JSX 通过网络一起传到 client 端。

```
import handleSubmit from "./handleSubmit"export default async function App() {  return <form action={handleSubmit}></form>}
```

```
0:"$L1"// Server Action (from server) 的渲染对应这条，会将 id 随 RSC 一同通过网络请求传给 client 端2:{"id":"src/handleSubmit.js#default","bound":null}1:["$","form",null,{"action":"$F2"}]
```

而在调用时，会在渲染后的 Client Component 的 props 上拿 id 通过 `callServer` 向服务端发起请求，之后的流程就和 from client 的流程一致了。

### from server 打包

这种 Server Action 打包时只需要通过 Loader 给模块的 export 导出加上一些元信息，包括 id、导出名，RSC 在渲染 Client Component 的 props 时，遇到 Server Action 会读这些信息，然后渲染出对应的序列化内容。

```
// src/handleSubmit.js"use server"export default async function handleSubmit() { ... }import { registerServerReference } from "react-server-dom-webpack/server"export default async function handleSubmit() { ... }// https://github.com/facebook/react/blob/9f4fbec5f7bb639be6dac438f9da5f032ae12c15/packages/react-server-dom-webpack/src/ReactFlightWebpackReferences.js#L76// Object.defineProperties(handleSubmit, { $$typeof: { value: SERVER_REFERENCE }, $$id: { value: "src/handleSubmit.js#default" }, $$bound: { value: null } });registerServerReference(handleSubmit, "src/handleSubmit.js", "default")
```

如何一次编译完成打包
==========

从上述 Webpack 的编译流程上看，先后需要 server compile 和 client compile 分别对 server 环境和 client 环境进行两次编译，那有没有方法能在一次编译里完成不同环境的打包呢？

Webpack 中其实已经有类似的实现：Worker，编译时会从 web/node 环境切换到 webworker 环境，核心的 API 为 AsyncEntrypoint，每个 `new Worker()` 会对应创建一个 AsyncEntrypoint，并附带 webworker 环境所需的 runtime 模块，它和 RSC 的模型有些不同，但理论上可以通过 AsyncEntrypoint 实现 RSC 在一次编译中完成打包。

接下来我们来学习下 Tobias 在 Turbopack 中是怎样实现一次编译完成 RSC 打包的：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStHfpUfTDpjOhFgXYLrJybfhdUHepCpYQNqOYAaQAYjC7axYzOeIVoNw/640?wx_fmt=png&from=appmsg)

切换环境
----

在 Turbopack 中，核心的一个概念就是 Context，分为 AssetContext 和 ChunkingContext，可以理解为 Webpack 配置（Configuration）的底层抽象，AssetContext 对应 make 阶段的一些配置，ChunkingContext 对应 seal 阶段的一些配置。

不同的 Module 可以有不同的 AssetContext，通过 `Transition` 对模块的 AssetContext 进行改变，比如 JS 模块和 CSS 模块使用不同的 AssetContext 实现不同的 resolve 逻辑、使用不同的 AssetContext 生成不同 layer 的模块、所属不同环境的模块使用不同的 AssetContext 生成不同环境的产物。

不同的 Chunk 可以有不同的 ChunkingContext，目前分为 `DevChunkingContext` 和 `BuildChunkingContext`，比如开发模式和生产模式使用不同的 ChunkingContext 实现不同的打包策略、插入不同的 runtime 代码、控制产物的路径等。

Turbopack 就通过改变 AssetContext 来改变模块的环境信息，然后调用 `chunk_group`/`evaluated_chunk_group`，以该模块作为入口模块（entry module），生成入口 chunk（entry chunk），再生成 ChunkGroup/Entrypoint，根据该入口模块的环境信息，从而生成不同环境的产物（其实由此也可以看出 Turbopack 与 Webpack 一个很大的差异就是 Turbopack 为 pull-based，Webpack 为 push-based，包括 Module Graph、Chunk Graph 的生成，以及增量编译的实现）。

以此，Turbopack 实现了切换环境，同时也具备了 RSC 打包的第三个条件，作为代码分割点，即从 Client 边界模块生成 ChunkGroup。

manifest
--------

RSC 打包的第二个条件就是能够提供足够的元信息，以满足 client 端根据序列化的 Server Component 结果请求并加载 Client Component，Turbopack 目前开发模式下并不会将这些元信息写到一个单独的 manifest 文件中，而是通过一个特殊的模块，可简单理解为在生成的 Client Reference 模块中就包含了这些信息（当然这需要对 React 运行时读取这些信息的方式做些改动），不仅对于 RSC 所需的 manifest 是这样做的，对于 SSR 渲染所需 entry chunks 的 manifest 也是这样做的。

打包
--

接下来简单过一下 Turbopack 的打包流程，我们从以下初始的模块图开始（以下内容为方便理解，对实际实现有一些简化）：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqSt38IpqssnRhiaPOlkspslMeibZYI51yeSt76jKjs6K1sKdicbjuH1jy6EQ/640?wx_fmt=png&from=appmsg)

首先从 server.js 即 server-entry 开始打包（因为可以切换环境所以不需要再当作 library 打包并 re-export 出 App.js 等模块），当打包遇到作为 server-entry 依赖之一的 hydrate.js 即 client-entry，该模块作为 client 的入口，进行 hydrate 等操作，属于 client 环境，所以我们对该模块进行 `Transition` 切换到 client 环境，同时因为是 client 的 Entrypoint，server.js 在处理 `"/"` 请求进行首屏 SSR 渲染时需要该 Entrypoint 所有的 script 路径，我们添加一个特殊的模块并在其代码生成时生成这些 chunks 的路径，而 Entrypoint 在代码生成时要附上 client 端所需的 runtime 代码，我们通过 `evaluated_chunk_group` 将该模块及其依赖作为 Entrypoint 进行打包。

```
"[next]/entry/app/hydrate.tsx (ecmascript, chunk group files, ssr)": (({ r: __turbopack_require__, f: __turbopack_require_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, l: __turbopack_load__, j: __turbopack_dynamic__, g: global, __dirname }) => (() => {__turbopack_export_value__([  "static/chunks/_5654f9._.js",  "static/chunks/[next]_common_2185c6._.js",  "static/chunks/[next]_entry_app_hydrate_tsx_b53fce._.js",  "static/chunks/[turbopack]_dev_client_3861d9._.js",]); // chunks})()),
```

之后继续编译遇到 ClientComp.js，parse 时识别到 `"use client"` 后开始 `Transition`，切换到 client 端编译环境，然后添加 `"react-server"` resolve condition，并生成 Client Reference 模块和相关元信息，同时因为 ClientComp.js 会作为代码分割点，我们通过 `chunk_group` 将该模块及其依赖作为 ChunkGroup 进行打包。

```
"[next]/entry/app/server-to-client-ssr.tsx/(CLIENT_MODULE)/[project]/App.tsx (ecmascript, with chunking context scope)/(CLIENT_CHUNKS)/[project]/App.tsx (ecmascript, chunks) (ecmascript, rsc)": (({ r: __turbopack_require__, f: __turbopack_require_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, l: __turbopack_load__, j: __turbopack_dynamic__, g: global, __dirname, x: __turbopack_external_require__, k: __turbopack_refresh__ }) => (() => {__turbopack_esm__({    "default": ()=>__TURBOPACK__default__export__});var __next_module_proxy = __turbopack_import__("[project]/node_modules/next/dist/next/module-proxy.js (ecmascript, rsc)");const __TURBOPACK__default__export__ = __next_module_proxy["createProxy"](JSON.stringify([    "[project]/App.tsx (ecmascript)", // module id    ["static/chunks/[next]_common_2185c6._.js"], // chunks]));})()),
```

据此我们得到如下 Module Graph：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStL5jByOmj94X2Bc2J3hsFFQT3mXAzwCySqTgzEMiaa3vQ4eoub5zVJtA/640?wx_fmt=png&from=appmsg)

这里有一张更加完整的图总结并对比了两种编译方式：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFzrAmDStiaatggsJ5sn8sqStxJpwal2l1xsLA3srY2QWic6Bs3w78kBnuctSsHyE0lko7EqAgA3sA8A/640?wx_fmt=png&from=appmsg)

好处
--

相比于两次编译可能有一些好处，因为在同一次编译中，能够得到其他环境模块的更多信息，比如使用的 export（`usedExport`），从而对没使用的 export 做 tree-shaking，而两次编译由于丢失了这些信息（可能可以通过 manifest 保存这些信息），为了确保使用的 export 不被 tree-shaking，要对所有 export 都不做 tree-shaking（`setUsedInUnknownWay`）。

当然并不是所有的场景都适用于一次编译完成打包，对于 RSC 这种一部分模块运行在 server、一部分模块运行在 client，甚至 next.js 还有一部分 middleware 模块会运行在 server，是比较适合的；但对于 SSR 这种基本所有模块都既运行在 server 又运行在 client，就没太大必要了。