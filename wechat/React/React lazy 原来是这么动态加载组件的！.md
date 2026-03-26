> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-cRIx-T8yNWm5Ahh6qeZbw)

### 前言

最近没有开发任务，除了研究下安排的优化代码的任务，顺便看了下 React.lazy 源码！所以今天主要介绍 `React.lazy` 的实现原理！

### 正文

`React.lazy` 是 React 16.6 引入的功能，用于实现组件懒加载，从而减少初次加载的 JavaScript 包体积，提升应用性能！

#### 1. React.lazy 的基本用法

`React.lazy` 允许开发者动态导入组件，返回一个特殊的 `LazyComponent`。搭配 `Suspense`，可以在组件加载时显示占位内容！

```
import React, { lazy, Suspense } from 'react';const LazyComponent = lazy(() => import('./About'));function App() {  return (    <Suspense fallback={<div>Loading...</div>}>      <LazyComponent />    </Suspense>  );}
```

#### 2. React.lazy 的实现原理

`React.lazy` 的核心是利用 JavaScript 的动态导入和 React 的内部机制来实现按需加载。以下是其工作流程：

##### **动态导入**

`React.lazy` 接受一个返回 Promise 的函数，该 Promise 解析为模块对象，通常包含 default 导出的组件！

> ❝
> 
> 这也是每个模块入口需要 default 导出，而组件不需要的原因。

动态导入基于 ES Modules 的 `import()` 语法，浏览器会异步加载指定的模块。

```
const lazyFactory = () => import('./LazyComponent');
```

##### **LazyComponent 的创建**

`React.lazy` 将动态导入的 Promise 包装为一个内部的 `LazyComponent` 对象。这个对象包含了加载状态和组件引用。

`LazyComponent` 的结构大致如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/CtsaVVKdWEpRr8IvibUQMiaZpUzib604tiacHr4efHzKW9jqECxL1UlX4fD84W081dU6UqrZPyzTlicOtCHlMRIM2ww/640?wx_fmt=png&from=appmsg)LazyComponent 数据结构

```
{  _init: lazyInit, // 动态导入函数  _payload: {    _status: -1, // 未加载    _result: null, // 加载后的组件或错误  }}
```

##### **加载过程**

当 `LazyComponent` 首次渲染时，React 调用 `_init`（即动态导入函数），触发模块加载。加载期间，`LazyComponent` 保持 `_status` 为 0，并通过 `Suspense` 机制抛出 Promise，让 `Suspense` 捕获并显示 fallback 内容。

```
if (lazyComponent._status === -1) {  lazyComponent._status = 0;const promise = lazyComponent._init();  promise.then(    module => {      lazyComponent._payload._status = 1;      lazyComponent._payload._result = module.default;    },    error => {      lazyComponent._payload._status = 2;      lazyComponent._payload._result = error;    }  );throw promise; // 抛出 Promise，交给 Suspense 处理}
```

##### **使用缓存**

`React.lazy` 具有内置缓存，同一个 `LazyComponent` 的动态导入只执行一次。加载完成后，`_result` 存储实际组件，后续渲染直接使用缓存的组件。

#### 3. Suspense 的作用

`Suspense` 捕获 `LazyComponent` 抛出的 Promise，并在 Promise 解析前渲染 fallback 内容。一旦 Promise 解析（即组件加载完成），`Suspense` 重新渲染 `LazyComponent`，显示实际组件。

```
import React, { Suspense } from 'react';function App() {  return (    <Suspense fallback={<div>Loading...</div>}>      <LazyComponent />    </Suspense>  );}
```

#### 4. 加载失败

当然，当加载失败时，也可以使用 Error Boundary 捕获错误，防止应用可能崩溃。

```
class ErrorBoundary extends React.Component {  state = { hasError: false };static getDerivedStateFromError() {    return { hasError: true };  }  render() {    if (this.state.hasError) {      return<h1>Something went wrong.</h1>;    }    returnthis.props.children;  }}
```

### 最后

今天的分享就这些了，感谢大家的阅读，如果文章中存在错误的地方欢迎指正！

* * *

*   我是 ssh，工作 6 年 +，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
    
*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    
*   关注公众号，发送消息：
    
    指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。
    
    简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。
    
    面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰
    

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！