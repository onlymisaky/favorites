> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/W82-QLvb52p2-HtJEbSbww)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/dy9CXeZLlCUPLRe8KViagAIoPtpcNgAW4jISkxpIyxGjK2V6JV1VSOCMkyib4GXqzRqEu2mCL8EmObnYJp5d6jIw/640?wx_fmt=png)

前言
--

此篇文章笔者将围绕 React 中自定义 hooks 给大家讲讲自定义 hooks 的概念以及我们要如何来设计编写自定义 hooks...

介绍
--

自定义 hooks 是基于 React Hooks 的一个拓展，我们可以根据业务需求制定满足业务需要的组合 hooks，更注重的是逻辑单元。怎样把一段逻辑封装起来，做到复用，这才是自定义 hooks 的初衷。

自定义 hooks 也可以说是 React Hooks 的聚合产物，其内部有一个或者多个 React Hooks 组成，用于解决一些复杂逻辑。

一个传统自定义 hooks 长下面这个样子：

```
function useXXX(参数A, 参数B, ...) {  /*     实现自定义 hooks 逻辑    内部应用了其他 React Hooks  */  return [xxx, ...]}复制代码
```

使用：

```
const [xxx, ...] = useXXX(参数A, 参数B, ...)复制代码
```

自定义 hooks **参数** 可能是以下内容：

> *   `hooks` 初始化值
>     
> *   一些副作用或事件的回调函数
>     
> *   可以是 `useRef` 获取的 `DOM` 元素或者组件实例
>     
> *   不需要参数
>     

自定义 hooks **返回值** 可能是以下内容：

> *   负责渲染视图获取的状态
>     
> *   更新函数组件方法，本质上是 `useState` 或者 `useReducer`
>     
> *   一些传递给子孙组件的状态
>     
> *   没有返回值
>     

特性
--

首先我们要明白，开发者编写的自定义 hooks 本质上就是一个函数，而且在函数组件中被执行。**自定义 hooks 驱动本质上就是函数组件的执行**。

### 驱动条件

自定义 hooks 的驱动条件主要有两点：

> 1.  `props` 改变带来的函数组件执行。
>     
> 2.  `useState` 或 `useReducer` 改变 `state` 引起函数组件的更新。
>     

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHpgwmx9KtqHXTNVSmVZIsV1hnuRsQ9AbuU1dK2fu3eY1voY67RD4kiaiaZTl9tt64HaIaQ8xriaKnObw/640?wx_fmt=jpeg)

### 顺序原则

自定义 hooks 内部至少要有一个 React Hooks，那么自定义 hooks 也同样要遵循 React Hooks 的规则，**不能放在条件语句中，而且要保持执行顺序的一致性。** 这是为什么呢？

> 这是因为在更新过程中，如果通过 if 条件语句，增加或者删除 hooks，那么在复用 hooks 的过程中，会产生复用 hooks 状态和当前 hooks 不一致的问题。所以在开发时一定要注意 hooks 顺序的一致性。

实践
--

接下来我们来实现一个能够 **自动上报 页面浏览量｜点击时间 的自定义 hooks** -- `useLog`。

通过这个自定义 hooks，来 **控制监听 DOM 元素，分清楚依赖关系**。

编写自定义 hooks：

```
export const LogContext = createContext({});export const useLog = () => {  /* 定义一些公共参数 */  const message = useContext(LogContext);  const listenDOM = useRef(null);  /* 分清依赖关系 */  const reportMessage = useCallback(    function (data, type) {      if (type === "pv") {        // 页面浏览量上报        console.log("组件 pv 上报", message);      } else if (type === "click") {        // 点击上报        console.log("组件 click 上报", message, data);      }    },    [message]  );  useEffect(() => {    const handleClick = function (e) {      reportMessage(e.target, "click");    };    if (listenDOM.current) {      listenDOM.current.addEventListener("click", handleClick);    }    return function () {      listenDOM.current &&        listenDOM.current.removeEventListener("click", handleClick);    };  }, [reportMessage]);  return [listenDOM, reportMessage];};复制代码
```

在上面的代码中，使用到了如下 4 个 React Hooks：

> *   使用 `useContext` 获取埋点的公共信息，当公共信息改变时，会统一更新。
>     
> *   使用 `useRef` 获取 DOM 元素。
>     
> *   使用 `useCallback` 缓存上报信息 `reportMessage` 方法，里面获取 `useContext` 内容。把 `context` 作为依赖项，当依赖项发生改变时，重新声明 `reportMessage` 函数。
>     
> *   使用 `useEffect` 监听 DOM 事件，把 `reportMessage` 作为依赖项，在 `useEffect` 中进行事件绑定，返回的销毁函数用于解除绑定。
>     

**依赖关系**：`context` 发生改变 -> 让引入 `context` 的 `reportMessage` 重新声明 -> 让绑定 DOM 事件监听的 `useEffect` 里面能够绑定最新的 `reportMessage`

使用自定义 hooks：

```
import React, { useState } from "react";import { LogContext, useLog } from "./hooks/useLog";const Home = () => {  const [dom, reportMessage] = useLog();  return (    <div>      {/* 监听内部点击 */}      <div ref={dom}>        <button> 按钮 1 (内部点击) </button>        <button> 按钮 2 (内部点击) </button>        <button> 按钮 3 (内部点击) </button>      </div>      {/* 外部点击 */}      <button        onClick={() => {          console.log(reportMessage);        }}      >        外部点击      </button>    </div>  );};// 阻断 useState 的更新效应const Index = React.memo(Home);const App = () => {  const [value, setValue] = useState({});  return (    <LogContext.Provider value={value}>      <Index />      <button onClick={() => setValue({ cat: "小猫", color: "棕色" })}>        点击      </button>    </LogContext.Provider>  );};export default App;复制代码
```

如上，当 `context` 发生改变时，能够达到正常上报的效果。小细节：使用 `React.memo` 来阻断 `App` 组件改变 `state` 给 `Home` 组件带来的更新效应。

效果
--

刚开始时依次点击按钮 1，2，3，效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHpgwmx9KtqHXTNVSmVZIsV1pj69OqpKiaMLMrwLOecnum4Djy6iawehmOGwO2S5Q2pERbZ3SArzW7aw/640?wx_fmt=jpeg)

点击点击按钮后，再依次点击按钮 1，2，3 时，效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHpgwmx9KtqHXTNVSmVZIsV1y3nlbBEiclnQFhyroJd5h3edly3YRgdHG9yOdr5b1xUJ6ibUiclhOxBTQ/640?wx_fmt=jpeg)

本文参考：React 进阶实践指南 [2]，感兴趣的小伙伴可以去瞧瞧～

最后
--

以上就是笔者对于自定义 hooks 的一些理解，若有不足欢迎大家指出，如果觉得还不错的话，也可以留下你的点赞哟～

关于本文  

作者：codinglin  

===============

https://juejin.cn/post/7175914445057556539

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步