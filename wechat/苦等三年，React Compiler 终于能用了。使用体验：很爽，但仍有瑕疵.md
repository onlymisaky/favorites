> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0ejbUqLFO647aNz7iZFZ6w)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXP2Ivy8BnRicYF1RAn8kKMjSmwZVNlucoiblKHOd59iafu8DM1aerD12N5w/640?wx_fmt=png&from=appmsg)

本文主要内容有：

*   **1、介绍 React Compiler**
    
*   2、检测你的项目是否适合使用 Compiler
    
*   **3、如何在不同的项目中使用 Compiler**
    
*   **4、真实项目使用体验**
    
*   **5、React Compiler 原理**
    

共 **3649** 字，阅读需要花费 6 分钟。

1
-

**React Compiler**

**React Compiler 终于开源了。**

自从从它第一次在 React Conf 2021 亮相。到现在 React Conf 2024 正式开源，我已经苦等了三年之久。盼星星盼月亮，终于把他给盼来了。

> i
> 
> > > 以前叫 React Forget，现改名为 React Compiler

要了解 React Compiler，这还需要从 React 的更新机制说起。**React 项目中的任何一个组件发生 state 状态的变更，React 更新机制都会从最顶层的根节点开始往下递归对比，通过双缓存机制判断出哪些节点发生了变化，然后更新节点**。这样的更新机制成本并不小，因为在判断过程中，如果 React 发现 `props、state、context` 任意一个不同，那么就认为该节点被更新了。因此，冗余的 `re-render` 在这个过程中会**大量发生**。

> ✓
> 
> **对比的成本非常小，但是 re-render 的成本偏高**，当我们在短时间之内快速更改 state 时，程序大概率会存在性能问题。因此在以往的开发方式中，掌握性能优化的手段是高级 React 开发者的必备能力

一个组件节点在 React 中很难被判断为没有发生过更新。因为 props 的比较总是不同的。它的比较方式如下。

```
{} === {} // false
```

因此，高级 React 开发者需要非常了解 React 的默认优化机制，让 props 的比较不发生，因为一旦发生，那么结果必定是 false。

> i
> 
> > > 事实上，对 React 默认优化机制了解的开发者非常少，我们在开发过程中也不会为了优化这个性能去重新调整组件的分布。更多的还是使用 memo 与 useMemo/useCallback 暴力缓存节点

在这样的背景之下，冗余的 `re-render` 在大量的项目中发生。这也是为什么 React 总是呗吐槽性能不好的主要原因。当然，大多数项目并没有频繁更新 state 的需求，因此这一点性能问题表现得并不是很明显。

如果我们要解决冗余 re-render 的问题，需要对 React 默认优化技能有非常深刻的理解，需要对 `memo、useCallback、useMemo` 有准确的理解。但是普通的 React 开发者很难理解他们，有的开发者虽然在项目中大量使用了，但是未必就达到了理想的效果。React Compiler 则是为了解决这个问题，它可以自动帮助我们记忆已经存在、并且没有发生更新的组件，从而解决组件冗余 `re-render` 的问题。

从使用结果的体验来看，React Compiler 被集成在代码自动编译中，因此只要我们在项目中引入成功，就不再需要关注它的存在。**我们的开发方式不会发生任何改变。**它不会更改 React 现有的开发范式和更新方式，侵入性非常弱。

2
-

**检测**

并非所有的组件都能被优化。因此早在 React 18 的版本中，React 官方团队就提前发布了严格模式。在顶层根节点中，套一层 `StrictMode` 即可。

```
<StrictMode>  <BrowserRouter>    <App />  </BrowserRouter></StrictMode>
```

遵循严格模式的规范，我们的组件更容易符合 React Compiler 的优化规则。

我们可以使用如下方式首先检测代码库是否兼容。在项目根目录下执行如下指令。

```
npx react-compiler-healthcheck
```

> ✓
> 
> 该脚本主要用于检测
> 
> 1、项目中有多少组件可以成功优化**：越多越好**
> 
> 2、是否使用严格模式，使用了优化成功率更高
> 
> 3、是否使用了与 Compiler 不兼容的三方库

例如，我的其中一个项目，检测结果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXPkNGcpFnPDjk9U0s1RJc7tPWYJKu4MicYPo62jL3FIp3pCy6BQZ4Py2Q/640?wx_fmt=png&from=appmsg)

每一项都基本上通过了，那我就可以放心的在项目中引入对应的插件开始体验了。

3
-

**在项目中引入**

官方文档中已经明确表示，由于 JavaScript 的灵活性，Compiler 无法捕获所有可能的意外行为，甚至编译之后还会出现错误。因此，目前而言，Compiler 依然可能会有他粗糙的一面。因此，我们可以通过配置，在具体的某一个小目录中运行 Compiler。

```
const ReactCompilerConfig = {  sources: (filename) => {    return filename.indexOf('src/path/to/dir') !== -1;  },};
```

React Compiler 还支持对应的 eslint 插件。该插件可以独立运行。不用非得与 Compiler 一起运行。

可以使用如下指令安装该插件

```
npm i eslint-plugin-react-compiler
```

然后在 eslint 的配置中添加

```
module.exports = {  plugins: [    'eslint-plugin-react-compiler',  ],  rules: {    'react-compiler/react-compiler': 2,  },}
```

Compiler 目前结合 Babel 插件一起使用，因此，我们首先需要在项目中引入该插件

```
npm i babel-plugin-react-compiler
```

然后，在不同的项目中，有不同的配置。

**添加到 `Babel` 的配置中**，如下所示

```
module.exports = function () {  return {    plugins: [      ['babel-plugin-react-compiler', ReactCompilerConfig], // must run first!      // ...    ],  };};
```

> i
> 
> > > 注意，该插件应该在其他 Babel 插件之前运行

**在 vite 中使用**

首先，我们需要安装 `vite-plugin-react`，注意不用搞错了，群里有的同学使用了 `vite-plugin-react-swc` 结果搞了很久没配置成功。然后在 vite.config.js 中，添加如下配置

```
export default defineConfig(() => {  return {    plugins: [      react({        babel: {          plugins: [            ["babel-plugin-react-compiler", ReactCompilerConfig],          ],        },      }),    ],    // ...  };});
```

**在 Next.js 中使用**

创建 `babel.config.js` 并添加上面 Babel 同样的配置即可。

**在 Remix 中使用**

安装如下插件，并且添加对应的配置项目。

```
npm i vite-plugin-babel
```

```
// vite.config.jsimport babel from "vite-plugin-babel";const ReactCompilerConfig = { /* ... */ };export default defineConfig({  plugins: [    remix({ /* ... */}),    babel({      filter: /\.[jt]sx?$/,      babelConfig: {        presets: ["@babel/preset-typescript"], // if you use TypeScript        plugins: [          ["babel-plugin-react-compiler", ReactCompilerConfig],        ],      },    }),  ],});
```

**在 Webpack 中使用**

我们可以单独为 Compiler 创建一个 Loader. 代码如下所示。

```
const ReactCompilerConfig = { /* ... */ };const BabelPluginReactCompiler = require('babel-plugin-react-compiler');function reactCompilerLoader(sourceCode, sourceMap) {  // ...  const result = transformSync(sourceCode, {    // ...    plugins: [      [BabelPluginReactCompiler, ReactCompilerConfig],    ],  // ...  });  if (result === null) {    this.callback(      Error(        `Failed to transform "${options.filename}"`      )    );    return;  }  this.callback(    null,    result.code    result.map === null ? undefined : result.map  );}module.exports = reactCompilerLoader;
```

我们可以在 React 官方了解到更多关于 React Compiler 的介绍与注意事项。具体地址如下

https://react.dev/learn/react-compiler

我目前已经在 vite 项目中引入，并将项目成功启动。接下来，就谈谈我的使用体验。

4
-

**真实项目的使用体验**

当项目成功启动，之后，我们可以在 React Devtools v5.x 的版本中，看到被优化过的组件旁边都有一个 `Memo` 标识。如图所示。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXPQw4ibelY5agGWwQdjZkUcyk0WfkG6v1rKcc0Bxy7S8KQp89ibP8JbiaicA/640?wx_fmt=png&from=appmsg)

如果我们要运行 React Devtools，安装成功之后，需要将如下代码加入到 html 文件中。这样我们就可以利用它来调试 React 项目了。

```
<script src="http://localhost:8097"></script>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXPFDlcnfjk368fd72GmLRZ58I5iaRhvCrQvVwrzCcmeOqSquegDOYkXbg/640?wx_fmt=png&from=appmsg)

如果是已有的老项目，我们最好删除 `node_modules` 并重新安装以来。不然项目运行起来可能会报各种奇怪的错误。如果还是不行，可以把 React 版本升级到 19 试试。

总之折腾了一会儿，我成功运行了一个项目。我目前就写了一个简单的组件来测试他的优化效果。代码如下

```
function Index() {  const [counter, setCounter] = useState(0)  function p() {    console.log('函数执行 ')  }  return (    <div>      <button onClick={() => setCounter(counter + 1)}>        点击修改 counter：{counter}      </button>      <Children a={1} b={2} c={p} />    </div>  )}
```

我们先来分析一下这段代码。首先，在父组件中，我们设计了一个数字递增的状态。当点击发生时，状态递增。此时父组件会重新 `render`。因此，在以往的逻辑中，子组件 `Children` 由于没有使用任何优化手段，因此，在父组件重新渲染时，子组件由于 props 的比较结果为 false，也会重新执行。

并且其中一个 props 属性还是一个引用对象，因此我们需要使用 `useCallback + memo` 才能确保子组件 Children 不会冗余 `re-render`。

但是此时，我们的组件已经被 React Compiler 优化过，因此，理论上来说，冗余 `re-render` 的事情应该不会发生，尝试了一下，确实如此。如图，我点击了很多次按钮，counter 递增，但是 Children 并没有冗余执行。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXPaq4fjQHD84dOhq6Y6DUvabjP3Bo6HdupSZWbNedkw26icq1REWsgTeg/640?wx_fmt=gif&from=appmsg)

很棒。

这里需要注意的是，引入了 Compiler 插件之后，它会自动工作，我们完全不用关注它的存在。因此，如果程序不出问题，对于开发者来说，编译工作是无感的。所以开发体验非常棒。

> !
> 
> > 不过有一些美中不足的是，当我尝试验证其他已经写好的组件被编译之后是否存在问题时，发现有一个组件的运行逻辑发生了变化。目前我还没有深究具体是什么原因导致的，不过通过对比，这个组件的独特之处在与，我在该组件中使用了 `useDeferredValue` 来处理异步请求。

另外，Compiler 也不能阻止 context 组件的 `re-render`。例如我在一个组件中使用了 `use(context)` ，哪怕我并没有使用具体的值。如下所示。

```
import {use} from 'react'import {Context} from './context'export default function Card() {  const value = use(Context)  console.log('xxxxx context')  return (    <>      <div class>Canary</div>        <p>The test page</p>      </div>    </>  )}
```

理想情况是这种情况可以不用发生 re-render。因此总体来说，Compiler 目前确实还不能完全信任。也有可能我还没掌握正确的姿势，还需要对他有更进一步的了解才可以。

不过值得高兴的是，**新项目可以放心使用 Compiler**，因为运行结果我们都能实时感知、调试、调整，能最大程度的避免问题的出现。

5
-

**原理**

React Compiler 编译之后的代码并非是在合适的时机使用 `useMemo/memo` 等 API 来缓存组件。而是使用了一个名为 **useMemoCache** 的 hook 来缓存代码片段

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXPksM6sdMAqibwRPbfWKzyHKYbGNPOHjpH73vgnhUbcMV5ibGMfh36memQ/640?wx_fmt=png&from=appmsg)

Compiler 会分析所有可能存在的返回结果，并把每个返回结果都存储在 useMemoCache 中。如上图所示，他打破了原有的链表存储结果，而选择把缓存结构存储在数组上。因此在执行效率上，Compiler 之后的代码会高不少。每一个渲染结果都会被存储在 `useMemoCache` 的某一项中，如果判断之后发现该结果可以复用，则直接通过读取序列的方式使用即可。如图所示。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHSE2TYBTebgxuygkKiavPXPbIOPNzbMibpXUcIRjcll5oWXJLD8l8FMqNStiaricq7vrTxbpRY5WECWw/640?wx_fmt=png&from=appmsg)

因此，编译之后的代码看上去会更加的繁杂。但是执行却会更加高效。

6
-

**总结**

初次感受下来，虽然感觉还不错。但是依然会有一种自己写的代码被魔改的不适感。特别是遇到问题的时候，还不知道到底编译器干了什么事情让最终运行结果与预想的完全不同。

> i
> 
> > > 这也是我不太喜欢使用 Solid 与 Svelte 的根本原因。不过 React 好在可以不用...

但是从执行性能上确实会有大的提高，这一点对于初学者可能会比较友好。

目前，由于接触时间太短，我对于 React Compiler 的使用体验还停留在比较浅的层面。因此能聊的东西并不多，在后续我有了更进一步更深刻的体会之后，再来跟大家分享体验结果。

> ✓
> 
> 点击右下方头像关注我，成为更顶尖的前端
> 
> [成为 React 高手，推荐阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)