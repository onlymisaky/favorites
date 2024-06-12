> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/xnDBiVC0mrW5EArW6_d6ng)

> ❝
> 
> 一个人是没法被一句话两句话改变的
> 
> ❞

大家好，我是**「柒八九」**。一个**「专注于前端开发技术 /`Rust`及`AI`应用知识分享」**的`Coder`

前言
==

`xdm`，`5.1`玩的还可以吗？既然已经玩够了，那么我们又得切换到上班模式。其实这篇文章是`5.1`之前开始写的，为了让大家能够有一个轻松的假期，索性就没在节内发送。今天我们来聊聊前端的内容。

`React19`她来了，她来了，她带着🎁走来了。时隔 2 年多，`React`终于有了新版本了。你可知道，我们这两年是如何过来的吗？！

![](https://mmbiz.qpic.cn/mmbiz_gif/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkVjtoH4vvLibicltB2YCU7RAZR08EzgNd0TP7TOvDKjDDALSMFxibxKF4w/640?wx_fmt=gif&from=appmsg)

就在`2024/04/25`，我们可以通过`npm install react@beta`在本地安装`React19`了。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRklNexDrLVYeuIpBLaPqYrJz9lxn66GHd7tNP2KiaYpnIK4KjWOLGgnbQ/640?wx_fmt=png&from=appmsg)

在`React19`没发布之前，从各种小道消息中知晓了`React`在新版本中新增了很多特性，并且优化了编译流程。因为，本着没有调查就没有发言权的态度，我就迟迟没有下笔。

既然，`React19`我们可以唾手可得了，那高低需要研究一波。

下面，我们就来看看她到底给我带来了啥！

好了，天不早了，干点正事哇。

![](https://mmbiz.qpic.cn/mmbiz_gif/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRk1NbKlBupBGicvD02PDFGuZicdIXfUiaBtZn8oTpwXxs4mmejktnEyLY0Q/640?wx_fmt=gif&from=appmsg)

### 我们能所学到的知识点

> ❝
> 
> 1.  React v19 的新特性概览
>     
> 2.  React 编译器
>     
> 3.  服务器组件 (`RSC`)
>     
> 4.  动作（`Action`）
>     
> 5.  Web Components
>     
> 6.  文档元数据
>     
> 7.  资源加载
>     
> 8.  新的 React Hooks
>     
> 
> ❞

* * *

1. React v19 的新特性概览
===================

*   `React 编译器`：`React` 实现了一个新的编译器。目前，`Instagram` 已经在利用这项技术了。
    
*   服务器组件 (`RSC`)：经过多年的开发，`React` 引入了`服务器组件`，而不是需要借助`Next.js`
    
*   动作 (`Action`)：`动作`也将彻底改变我们与 DOM 元素的交互方式。
    
*   文档元数据：这是另一个备受期待的改进，让我们能够用更少的代码实现更多功能。
    
*   资源加载：这将使资源在后台加载，从而提高应用程序的加载速度和用户体验。
    
*   `Web Components`：`React` 代码现在可以让我们集成 `Web Components`。
    
*   增强的 `hooks`：引入了很多令人兴奋的新 hooks，将彻底改变我们的编码体验。
    

下面我们就来一一探索其中的奥秘。

* * *

2. React 编译器
============

其实`React 编译器`就是之前早在`React 2021年开发者大会上`提出的`React Forget`，只不过最近才将其改为`React 编译器`。

> ❝
> 
> `React 编译器`是一个**「自动记忆编译器」**，可以自动执行应用程序中的所有记忆操作。
> 
> ❞

`React 编译器` 的核心几乎与 `Babel` 完全解耦，编译器内核其实就是**「旧的 AST 输入，新的 AST 输出」**。在后台，`编译器`使用`自定义代码表示`和`转换管道`来执行语义分析。

`React19`之前的版本，当状态发生变化时,`React`有时会重新渲染不相干的部分。从`React`的早期开始, 我们针对此类情况的解决方案一直是**「手动记忆化」**。在之前的 API 中, 这意味着应用`useMemo`、`useCallback`和`memo` API 来手动调整`React`在状态变化时重新渲染的部分。但手动记忆化只是一种**「权宜之计」**, 它会使代码变得复杂, 容易出错, 并需要额外的工作来保持更新。`React` 团队意识到手动优化很繁琐，并且使用者对这种方式**「怨声载道」**。

因此，`React` 团队创建了`React 编译器`。`React 编译器`现在将管理这些重新渲染。`React` 将**「自行决定何时以及如何改变状态并更新 UI」**。

有了这个功能，我们不再需要手动处理这个问题。这也意味着让人诟病的 `useMemo()`、`useCallback()` 和 `memo`要被历史的车轮无情的碾压。

React19 !=React 编译器
-------------------

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkJiccFaiaHMyekhTeN1Q3Qg3GhF7iaDxEkISDrmAQGf7Nlmm8aXFkiaEAJA/640?wx_fmt=png&from=appmsg)

由于`React 编译器`还未开源，所以我们无法得知其内部实现细节，不过我们可以从以往的动态中窥探一下。下面是一些与其相关的资料和视频。

*   React 编译器_youtube 地址 [1]
    
*   React Forget 的基本介绍 [2]
    

* * *

3. 服务器组件 (`RSC`)
================

其实，在`2023`年，我们就注意到`RSC`，并且写了几篇文章。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkDMJOX9QpP6n1qxibPgoia3DOhIV1c4BPdcOLyEa34ujMgicrd5wu9p32A/640?wx_fmt=png&from=appmsg)

对应的文章链接如下

1.  [React Server Components 手把手教学](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489493&idx=1&sn=6fec93867130730b641eddc9ea075b8a&scene=21#wechat_redirect)
    
2.  [用 Rust 搭建 React Server Components 的 Web 服务器](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489899&idx=1&sn=6fc040b1e3e66e5a2ae8083c0dc32a70&scene=21#wechat_redirect)
    

`服务器组件`的想法已经流传了多年，`Next.js` 是第一个在生产环境中实现它们的。从 `Next.js 13` 开始，**「默认情况下所有组件都是服务器组件」**。要使组件在客户端运行，我们需要使用`'use client'`指令。

在 `React 19` 中，`服务器组件`将直接集成到 `React` 中，带来了一系列优势：

1.  数据获取: `服务器组件`允许我们将数据获取移至服务器端, 更接近数据源。这可以通过减少获取渲染所需数据的时间和客户端需要发出的请求数量来提高性能。
    
2.  安全性: `服务器组件`允许我们将**「敏感数据和逻辑」**保留在服务器端, 而无需暴露给客户端的风险。
    
3.  缓存: 由于在`服务器端渲染`, 结果可以被缓存并在后续请求和跨用户时重复使用。这可以通过减少每个请求所需的渲染和数据获取量来提高性能并降低成本。
    
4.  性能: `服务器组件`为我们提供了额外的工具来从基线优化性能。例如, 如果我们从一个完全由客户端组件组成的应用程序开始, 将非交互式 UI 部分移至服务器组件可以减少所需的客户端`JavaScript`。这对于网络较慢或设备性能较低的用户来说是有益的, 因为浏览器需要下载、解析和执行的客户端`JavaScript`更少。
    
5.  初始页面加载和首次内容渲染 (`FCP`): 在服务器端, 我们可以生成`HTML`, 允许用户立即查看页面, 而无需等待客户端下载、解析和执行渲染页面所需的`JavaScript`。
    
6.  SEO：`RSC`通过为网络爬虫提供更可访问的内容来增强搜索引擎优化。
    
7.  流式传输: `服务器组件`允许我们将渲染工作分割成块, 并在它们准备就绪时将其流式传输到客户端。这允许用户在不必等待整个页面在服务器端渲染完成的情况下, 更早地看到页面的某些部分。
    

### 如何使用服务器组件

> ❝
> 
> 默认情况下，`React` 中的所有组件都是`客户端组件`。只有使用 `'use server'` 时，组件才是`服务器组件`。
> 
> ❞

我们只需要将 `'use server'` 添加为组件的第一行即可。这将使组件成为`服务器组件`。它不会在客户端运行，只会在服务器端运行。

```
'use server';export default async function requestUsername(formData) {  const username = formData.get('username');  if (canRequest(username)) {    // ...    return 'successful';  }  return 'failed';}
```

* * *

4. 动作（`Action`）
===============

在 `React19`中，另一个令人兴奋的新增功能将是`Action`。这将是我们处理表单的重大变革。

何为 Action
---------

> ❝
> 
> 使用异步转换的函数被称为`Action`（动作）。`Action`自动管理数据的提交：
> 
> ❞

1.  Pending 状态：`Action`提供了一个`state`
    

*   请求开始时，代表对应的状态 - `pending状态`
    
*   请求结束时，状态自动重置
    

3.  `Optimistic`更新：`Action`支持新的`useOptimistic` hook，因此我们可以在请求提交时向用户显示即时反馈。
    
4.  错误处理：`Action`提供错误处理，因此我们可以在请求失败时显示`Error Boundary`，并自动恢复`Optimistic更新`为其原始值。
    
5.  增强表单操作：`<form>`元素支持将函数传递给`action`和`formAction` props。
    

*   传递给`action props`的函数默认使用`Action`机制，并在提交后自动重置表单
    

`Action`将允许我们将`action`与`<form/>标签` 集成。简单来说，我们将能够用`action`替换 `onSubmit` 事件。

在使用 Action 之前
-------------

在下面的代码片段中，我们将利用 `onSubmit`事件，在表单提交时触发搜索操作。

```
<form onSubmit={search}>  <input >查询</button></form>
```

使用 Action 后
-----------

随着`服务器组件`的引入，  `Action`可以在服务器端执行。在我们的 `JSX` 中，我们可以删除 `<form/>` 的 `onSubmit` 事件，并使用 `action` 属性。`action` 属性的值将是一个**「提交数据的方法」**，可以在`客户端`或`服务器端`提交数据。

我们可以使用`Action`执行`同步`和`异步`操作，简化数据提交管理和状态更新。目标是使处理表单和数据更加容易。

```
"use server"const submitData = async (userData) => {    const newUser = {        username: userData.get('username'),        email: userData.get('email')    }    console.log(newUser)}const Form = () => {    return <form action={submitData}>        <div>            <label>用户名</label>            <input type="text"  />        </div>        <button type='submit'>提交</button>    </form>}export default Form;
```

在上面的代码中，`submitData` 是服务器组件中的`Action`。`form` 是一个客户端组件，它使用 `submitData` 作为`Action`。`submitData` 将在服务器上执行。

* * *

5. Web Components
=================

如果大家公司技术方案不是单一的。例如，公司有很多项目，并且项目中使用了不同的技术框架`React/Vue`等。然而，此时有一个功能需要多项目多框架使用，那么我们可以考虑一下，将此功能用`Web Components`实现。

Web Components
--------------

`Web 组件`允许我们使用原生 `HTML`、`CSS` 和 `JavaScript` 创建自定义组件，无缝地将它们整合到我们的 Web 应用程序中，就像使用`HTML` 标签一样。

### 三要素

1.  `Custom elements`（自定义元素）：一组 `JavaScript` API，允许我们定义 `custom elements` 及其行为，然后可以在我们的用户界面中按照需要使用它们。
    

*   通过 `class A extends HTMLElement {}` 定义组件，
    
*   通过 `window.customElements.define('a-b', A)` 挂载已定义组件。
    

3.  `Shadow DOM`（影子 DOM ）：一组 `JavaScript` API，用于将封装的 “影子” DOM 树附加到元素（**「与主文档 DOM 分开呈现」**）并控制其关联的功能。
    

*   通过这种方式，我们可以**「保持元素的功能私有」**，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。
    
*   使用 `const shadow = this.attachShadow({mode : 'open'})` 在 `WebComponents` 中开启。
    

5.  `HTML templates`（HTML 模板）`slot` ：`template` 可以简化生成 `dom` 元素的操作，不再需要 `createElement` 每一个节点。
    

> ❝
> 
> 虽然 `WebComponents` 有三个要素，但却不是缺一不可的，`WebComponents`
> 
> *   借助 `shadow dom`  来实现**「样式隔离」**，
>     
> *   借助 `templates` 来**「简化标签」**的操作。
>     
> 
> ❞

* * *

### 内部生命周期函数（4 个）

1.  `connectedCallback`: 当 `WebComponents` **「第一次」**被挂在到 `dom` 上是触发的钩子，并且只会触发一次。
    

*   类似  `React` 中的 `useEffect(() => {}, [])`，`componentDidMount`。
    

3.  `disconnectedCallback`: 当自定义元素与文档 `DOM` **「断开连接」**时被调用。
    
4.  `adoptedCallback`: 当自定义元素被**「移动」**到新文档时被调用。
    
5.  `attributeChangedCallback`: 当自定义元素的被监听属性变化时被调用。
    

如果不想用原生写，那么我们可以选择一些成熟的框架，例如 Lit[3]

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkgQKDUNN8gAMpuaHZyia5ftndvmMGa3kq7NdIDWLiapcs4uA35OiaVscVQ/640?wx_fmt=png&from=appmsg)

React19 兼容 Web Components
-------------------------

在`React19`之前，在 `React` 中集成 `Web Components`并不直接。通常，我们需要将 `Web Components`转换为 `React 组件`，或者安装额外的包并编写额外的代码来使 `Web Components`与 `React` 协同工作。

`React 19` 将帮助我们更轻松地将 `Web Components`整合到我们的 `React` 代码中。如果我们遇到一个非常有用的 `Web Components`，我们可以无缝地将其整合到 `React` 项目中，而不需要将其转换为 `React` 代码。

这简化了开发流程，并允许我们在 `React` 应用程序中利用现有 `Web Components`的广泛生态系统。

* * *

6. 文档元数据
========

TKD
---

在做`SEO`时，我们需要在`<meta>`中处理`title/keywords/description`的信息。

1.  `title`的权重最高，利用`title`提高页面权重
    
2.  `keywords`相对权重较低，作为页面的辅助关键词搜索
    
3.  `description`的描述一般会直接显示在搜索结果的介绍中
    

> ❝
> 
> 当然处理`SEO`不仅仅这点方式，还有在项目中新增`Sitemap.xml`还有使用`rel=canonical`的连接, 想了解更多的方式，可以参考 SEO 教程 [4]
> 
> ❞

处理 SEO
------

经常借助编写自定义代码或使用像 react-helmet[5] 这样的包来处理路由更改并相应地更新元数据。这个过程可能会重复，而且容易出错，特别是在处理像 `meta 标签`这样对 `SEO` 敏感的元素时。

### React19 之前的 SEO

```
import React, { useEffect } from 'react';const HeadDocument = ({ title }) => {  useEffect(() => {    document.title = title;  const metaDescriptionTag = document.querySelector('meta[]');    if (metaDescriptionTag) {    metaDescriptionTag.setAttribute('content', '前端柒八九');    }  }, [title]);  return null;};export default HeadDocument;
```

在上面的代码中，我们有一个名为 `HeadDocument` 的组件，基于`props` 更新`title`和 `meta` 标签。我们在 `useEffect` 钩子中更新这些内容。我们还使用 `JavaScript` 来更新标题和 `meta` 标签。这个组件将在路由更改时更新。

### React19 的 SEO

使用 `React19`后，我们可以直接在 `React` 组件中使用`<title>`和 `<meta>` 标签：

```
Const HomePage = () => {  return (    <>      <title>React19</title>      <meta  />      // 页面内容    </>  );}
```

当然，我们可以基于`props`来更新`title/meta`中的对应信息。

* * *

7. 资源加载
=======

在 `React` 中，我们需要特别关心应用程序的`加载体验`和`性能`，特别是`图片`和其他资源文件。

通常，`视图`会首先在浏览器中渲染，然后是`样式表`、`字体`和`图片`。这可能会导致`FOIT`或者`FOUT`。

我们在[浏览器之性能指标 - CLS](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247489275&idx=1&sn=783fd13d187421392d576c36a25abb1b&scene=21#wechat_redirect) 中有过介绍，这里我们就拿来主义了。

`FOIT`/`FOUT`
-------------

`FOIT`和`FOUT`是与`Web字体加载`相关的术语。

> ❝
> 
> `FOIT`代表`"Flash of Invisible Text"`，意为**「不可见文本的闪烁」**。
> 
> ❞

当使用`Web字体`时，浏览器在下载字体文件时，会显示一段时间的空白文本，直到字体文件完全加载完成。这段时间内，用户可能会看到页面上出现了空白文本，然后突然闪现出字体样式。这种体验被称为`FOIT`。

> ❝
> 
> `FOUT`代表`"Flash of Unstyled Text"`，意为**「未样式化文本的闪烁」**。
> 
> ❞

与`FOIT`类似，当使用`Web字体`时，浏览器可能会**「先显示系统默认字体」**，然后在字体文件加载完成后，突然将文本样式化为所需的`Web字体`。这种体验被称为`FOUT`。

`FOIT`和`FOUT`都是由于`Web字体`加载的延迟而导致的不佳用户体验。用户可能会看到文本内容在加载过程中发生闪烁或样式变化，给页面的整体稳定性和一致性带来了困扰。为了解决`FOIT`和`FOUT`问题，可以使用 CSS 属性，如`font-display`，来控制字体加载和显示的方式，以平滑地呈现文本内容，提高用户体验。

或者我们可以**「添加自定义代码来检测这些资源何时准备好」**，确保`视图`只在所有内容加载完毕后显示。

> ❝
> 
> 在 `React 19` 中，当用户浏览当前页面时，图片和其他文件将**「在后台加载」**。
> 
> ❞

这个改进应该有助于提高页面加载速度并减少等待时间。

此外，`React` 还引入了用于资源加载的生命周期 `Suspense`，包括`script`、样式表和字体。这个特性使 `React` 能够确定内容何时准备好显示，消除了任何`FOUT`的闪烁现象。

还有新的资源加载 API，比如 `preload` 和 `preinit`，可以提供更大的控制力，确定何时加载和初始化资源。

通过允许资源在后台异步加载，`React 19`减少了等待时间，确保用户可以在不间断的情况下与内容进行交互。

* * *

8. 新的 React Hooks
=================

自从`React16.8`引入`Hook`机制以来，`React`的开发模式就发生了翻天覆地的变化。她提供的各种内置`Hook`大大提高了我们开发组件的效率。并且，我们还可以通过封装各种`自定义Hook`来处理共有逻辑。也就是说，`Hook`在`React`中有举足轻重的地位。`Hook`已经成为了开发`React`的主流编程模式。

虽然，`Hook`为我们带来了很多的便利，但是有些`Hook`的使用却需要各种限制，稍不留神就会让页面陷入万劫不复的地步。所以`React19`对一些我们平时用起来不咋得心应手的`Hook`做了一次升级。

在 `React 19` 中，我们使用 `useMemo`、`forwardRef`、`useEffect` 和 `useContext` 的方式将会改变。这主要是因为将引入一个新的 `hook`，即 `use`。

useMemo()
---------

> ❝
> 
> 在 `React19` 之后，我们不再需要使用 `useMemo()` hook，因为 `React编译器` 将会自动进行记忆化。
> 
> ❞

### 之前的写法

```
import React, { useState, useMemo } from 'react';function ExampleComponent() {  const [inputValue, setInputValue] = useState('');  // 记住输入框是否为空的检查结果  const isInputEmpty = useMemo(() => {    console.log('检测输入框是否为空');    return inputValue.trim() === '';  }, [inputValue]);  return (    <div>      <input        type="text"        value={inputValue}        onChange={(e) => setInputValue(e.target.value)}      />      <p>{isInputEmpty ? 'Input 为空' : 'Input有值'}</p>    </div>  );}export default ExampleComponent;
```

### 之后的写法

在下面的例子中，我们可以看到在 `React19` 之后，我们不再需要自己来做记忆化，`React19` 将会在后台自动完成。

```
import React, { useState } from 'react';function ExampleComponent() {  const [inputValue, setInputValue] = useState('');  const isInputEmpty = () => {    console.log('检测输入框是否为空');    return inputValue.trim() === '';  });  return (    <div>      <input        type="text"        value={inputValue}        onChange={(e) => setInputValue(e.target.value)}      />      <p>{isInputEmpty ? 'Input 为空' : 'Input有值'}</p>    </div>  );}export default ExampleComponent;
```

forwardRef()
------------

> ❝
> 
> `ref` 现在将作为`props`传递而不是使用 `forwardRef()` hook。
> 
> ❞

这将简化代码。因此，在 `React19` 之后，我们不需要使用 `forwardRef()`。

### 之前的写法

```
import React, { forwardRef } from 'react';const ExampleButton = forwardRef((props, ref) => (  <button ref={ref}>    {props.children}  </button>));
```

### 之后的写法

`ref` 可以作为属性传递。不再需要 `forwardRef()`。

```
import React from 'react';const ExampleButton = ({ ref, children }) => (  <button ref={ref}>    {children}  </button>);
```

新的 use() hook
-------------

`React19` 将引入一个新的 `hook`，名为 `use()`。这个 `hook` 将简化我们如何使用 `promises`、`async` 代码和 `context`。

### 语法

```
const value = use(resource);
```

### 示例 1：接收 async 函数

下面的代码是使用 `use` hook 进行 `fetch` 请求的示例：

```
import { use } from "react";const fetchUsers = async () => {    const res = await fetch("远程地址");    return res.json();  };  const UsersItems = () => {  const users = use(fetchUsers());  return (    <ul>      {users.map((user) => (        <div key={user.id} >          <h2>{user.name}</h2>          <p>{user.email}</p>        </div>      ))}    </ul>  );}; export default UsersItems;
```

让我们理解一下代码：

*   `fetchUsers`进行远程数据请求
    
*   我们使用 `use` hook 执行 `fetchUsers`，而不是使用 `useEffect` 或 `useState` hooks。
    
*   `use` hook 的返回值是 `users`，其中包含 `GET` 请求的响应（users）。
    
*   在`return`中，我们使用 `users`进行对应信息的渲染处理。
    

### 示例 2：接收 context 对象

我们以后可以直接将`context`对象传人到`use()`中，从而达到将`context`引入组件的目的。而不需要`useContext()`了。

#### 使用 createContext 定义全局变量

这里我们定义

```
import { createContext, useState, use } from 'react';const ThemeContext = createContext();const ThemeProvider = ({ children }) => {  const [theme, setTheme] = useState('light');  const toggleTheme = () => {    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));  };  return (    <ThemeContext.Provider value={{ theme, toggleTheme }}>      {children}    </ThemeContext.Provider>  );};
```

#### 在组件中使用 use() 获取 context 信息

```
const Card = () => {  // use Hook()  const { theme, toggleTheme } = use(ThemeContext);  return (    // 基于theme/toggleTheme 渲染页面或者执行对应的操作  );};const Theme = () => {  return (    <ThemeProvider>      <Card />    </ThemeProvider>  );};export default Theme
```

上面代码中有几点需要简单解释一下：

*   `ThemeProvider` 负责提供 `context`。
    
*   `Card` 是我们将消费 `context` 的组件。为此，我们将使用新的 hook `use` 来消费 `context`。
    

### 衍生一下

其实吧，`use`的内部实现很简单，就是基于传人的对象类型进行返回数据即可。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkuHOUrLxIMoehxdIH4yy95QgVHRXriaJ2rfDUB0rKwzoFrzwvW3NgO9A/640?wx_fmt=png&from=appmsg)

针对，其内部是如何实现的，我们后期会有专门的文章来介绍，这里就不在过多解释了。

useFormStatus() hook
--------------------

在 `React19` 中，我们还有新的 `hooks` 来处理`表单状态`和`数据`。这将使处理表单更加流畅和简单。将这些 `hooks` 与 `Action`结合使用将使处理表单和数据更加容易。

`React19` 中的这个新 `hook` 将帮助我们更好地控制你创建的表单。它将提供关于上次表单提交的状态信息。

### 基础语法

这是它的语法：

```
const { pending, data, method, action } = useFormStatus();
```

或者简化的版本：

```
const { status } = useFormStatus()
```

*   `pending`：如果表单处于待处理状态，则为 `true`，否则为 `false`。
    
*   `data`：一个实现了 `FormData` 接口的对象，其中包含父 `<form>` 提交的数据。
    
*   `method`：`HTTP` 方法 – `GET`，或 `POST`。
    

*   默认情况下将是 GET。
    

*   `action`：一个函数引用。
    

### 案例展示

> ❝
> 
> `useFormStatus`是从`react-dom`库中导出的
> 
> ❞

```
import { useFormStatus } from "react-dom";function Submit() {  const status = useFormStatus();  return <button disabled={status.pending}>        {status.pending ? '正在提交...' : '提交完成'}    </button>;}// ==== 父组件 ==引入Submit ====const formAction = async () => {  // 模拟延迟 3 秒  await new Promise((resolve) => setTimeout(resolve, 3000));}const FormStatus = () => {  return (    <form action={formAction}>      <Submit />    </form>  );};export default FormStatus;
```

让我们简单解释一下上面代码：

*   `Submit`通过`useFormStatus`可以获取此时`from`表单的提交状态，并基于一些状态渲染一些辅助信息
    
*   `formAction`是执行异步提交的处理
    

在上面的代码中，当表单提交时，从 `useFormStatus` hook 我们将获得一个 `pending` 状态。

*   当 `pending` 为 `true` 时，UI 上会显示 "正在提交..." 文本。
    
*   一旦 `pending` 为 `false`，"正在提交..." 文本将被更改为 "提交完成"。
    

当我们想要知道表单提交的状态并相应地显示数据时，它会很有用。

useFormState() hook
-------------------

`React19` 中的另一个新 hook 是 `useFormState`。它允许我们根据表单提交的结果来更新状态。

### 语法

这是它的语法：

```
const [state, formAction] =       useFormState(        fn,         initialState,         permalink?      );
```

*   `fn`：表单提交或按钮按下时要调用的函数。
    
*   `initialState`：我们希望状态初始值是什么。它可以是任何可序列化的值。在首次调用操作后，此参数将被忽略。
    
*   `permalink`：这是可选的。一个 `URL` 或页面链接，如果 `fn` 将在服务器上运行，则页面将重定向到 `permalink`。
    

这个 `hook` 将返回：

*   `state`：初始状态将是我们传递给 `initialState` 的值。
    
*   `formAction`：一个将传递给表单操作的操作。此操作的返回值将在状态中可用。
    

### 案例展示

```
import { useFormState} from 'react-dom';const FormState = () => {    const submitForm = (prevState, queryData) => {        const name =  queryData.get("username");        console.log(prevState); // 上一次的from 的state         if(name === '柒八九'){            return {                success: true,                text: "前端开发者"            }        }        else{            return {                success: false,                text: "Error"            }        }    }    const [ message, formAction ] = useFormState(submitForm, null)    return <form action={formAction}>        <label>用户名</label>        <input type="text"  />        <button>提交</button>        {message && <h1>{message.text}</h1>}    </form>}export default FormState;
```

让我们简单解释一下发生了啥

*   `submitForm` 是负责表单提交的方法。这是一个 `Action`。
    
*   在 `submitForm` 中，我们正在检查表单的值。
    

*   `prevState`: 初始状态将为 `null`，之后它将返回表单的 `prevState`。
    
*   `queryData`: 用于获取此次操作中`from表单`中对应`key`的值
    

useOptimistic() hook
--------------------

> ❝
> 
> `useOptimistic` 也新发布的`Hook`，它允许我们在异步操作时显示不同的状态。
> 
> ❞

这个 `hook` 将帮助增强用户体验，并应该导致更快的响应。这对于需要与服务器交互的应用程序非常有用。

### 语法

以下是 `useOptimistic` hook 的语法：

```
const [ optimisticX, addOptimisticX] = useOptimistic(state, updatefn)
```

例如，当响应正在返回时，我们可以显示一个**「optimistic 状态」**，以便让用户获得即时响应。一旦服务器返回实际响应，`optimistic状态`将被替换。

### 案例展示

```
import { useOptimistic, useState } from "react";const Optimistic = () => {  const [messages, setMessages] = useState([    { text: "初始化信息", sending: false, key: 1 },  ]);    const [optimisticMessages, addOptimisticMessage] = useOptimistic(    messages,    (state, newMessage) => [      ...state,      {        text: newMessage,        sending: true,      },    ]  );  async function sendFormData(formData) {    const sentMessage = await fakeDelayAction(formData.get("message"));    setMessages((messages) => [...messages, { text: sentMessage }]);  }  async function fakeDelayAction(message) {    await new Promise((res) => setTimeout(res, 1000));    return message;  }  const submitData = async (userData) => {    addOptimisticMessage(userData.get("username"));    await sendFormData(userData);  };  return (    <>      {optimisticMessages.map((message, index) => (        <div key={index}>          {message.text}          {!!message.sending && <small> (Sending...)</small>}        </div>      ))}      <form action={submitData}>        <h1>OptimisticState Hook</h1>        <div>          <label>Username</label>          <input type="text" >Submit</button>      </form>    </>  );};export default Optimistic;
```

*   `fakeDelayAction` 模拟一个异步操作。
    
*   `submitData` 是 `action`。这个方法负责表单提交。这也可以是 async 的。
    
*   `sendFormData` 负责将表单发送到 `fakeDelayAction`
    
*   设置默认状态。`messages` 将用作 `useOptimistic()` 的输入，并将返回 `optimisticMessages`。
    

```
const [messages, setMessages] = useState([{ text: "初始化信息", sending: false, key: 1 },]);
```

在 `submitData` 内部，我们使用 `addOptimisticMessage`。这将添加表单数据，以便在 `optimisticMessage` 中可用。我们将使用此数据在 UI 中显示消息：

```
{optimisticMessages.map((message, index) => (        <div key={index}>          {message.text}          {!!message.sending && <small> (Sending...)</small>}        </div>      ))}
```

其实，我们以后在处理类似`Form`表单状态时，可以配合`Action/useOptimistic/useFormState/useFormState`进行状态的各种流转处理。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkZZAyL6icP1Tj0uxn5St6fj0lYJ5qV05AQwMfuk1VZDIo3FHsXNTiaTcg/640?wx_fmt=png&from=appmsg)

* * *

后记
==

**「分享是一种态度」**。

**「全文完，既然看到这里了，如果觉得不错，随手点个赞和 “在看” 吧。」**

![](https://mmbiz.qpic.cn/mmbiz_gif/rv5jxwmzMCWlia2NRY72EAQL89lBDtJRkZWKRSrT9AvjRBqX5JGPBO4qfib7L1EMs6dQvQ6q0NA0vlicZR5PWicyicA/640?wx_fmt=gif&from=appmsg)

### Reference

[1]

React 编译器_youtube 地址: https://youtu.be/kjOacmVsLSE?si=dqCjg0_9x2hOB8BF

[2]

React Forget 的基本介绍: https://dev.to/usulpro/how-react-forget-will-make-react-usememo-and-usecallback-hooks-absolutely-redundant-4l68

[3]

Lit: https://lit.dev/

[4]

SEO 教程: https://moz.com/beginners-guide-to-seo

[5]

react-helmet: https://www.npmjs.com/package/react-helmet