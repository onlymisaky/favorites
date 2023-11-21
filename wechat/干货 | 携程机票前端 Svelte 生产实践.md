> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QWwb8PXtdJJUKyicHRmBkw)

**作者简介** 

shuan feng，携程高级前端开发工程师，关注性能优化、低代码、svelte 等领域。

**一、技术调研**
----------

最近几年，前端框架层出不穷。近两年，前端圈又出了一个`新宠`：`Svelte`。作者是 `Rich Harris`，也就是 `Ractive`, `Rollup` 和 `Buble`的作者，前端界的 “轮子哥”。

通过静态编译减少框架运行时的代码量。一个 `Svelte` 组件编译之后，所有需要的运行时代码都包含在里面了，除了引入这个组件本身，你不需要再额外引入一个所谓的框架运行时！

在`Github`上拥有 5w 多的 star！

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQDE5AWHoLXYoia7hKh3Moh61FunWoib41yBdMZbjCVTpQibl2Llia1cAjAg/640?wx_fmt=png)

在最新的 State of JS 2021 和 Stack Overflow Survey 2021 的排名情况中，也一定程度上反映了它的火热程度。

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQL3qGMmAD4RsKR6bJhoGeBUGJlcu3ftHicwJUrFLiaNDuRGhiboFXxiabuQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQGtPqoh1QR2B5779ojocfJAMQxjP80WKpKicem6XGTKg77Ifib0L5eOBA/640?wx_fmt=png)

在早前知乎的如何看待 svelte 这个前端框架？问题下面，`Vue`的作者尤雨溪也对其做出了极高的评价：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQggv5T2QdwWpVpPrxNzC8B1rBmNbA9GnWoJLvxGEicWkibOa1ODGn7KIA/640?wx_fmt=png)

去它的官网看一下：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQvdUicJRHAms6nLMEXkU58OOTO5cexNdqQyztSyTMdcQHxUYk8T6RkaQ/640?wx_fmt=png)

官网上清楚的表明了三大特性：

*   • `Write less code`
    
*   • `No virtual DOM`
    
*   • `Truly reactive`
    

### **1.1 Write less code**

顾名思义，是指实现相同的功能，`Svelte`的代码最少。这一点会在后面的示例中有所体现。

### **1.2 No virtual DOM**

`Svelte`的实现没有利用虚拟`DOM`，要知道`Vue`和`React`的实现都是利用了虚拟`DOM`的，而且虚拟`DOM`不是一直都很高效的吗？

#### **Virtual DOM 不是一直都很高效的吗？**

其实 `Virtual DOM`高效是一个误解。说 `Virtual DOM` 高效的一个理由就是它不会直接操作原生的 `DOM` 节点，因为这个很消耗性能。当组件状态变化时，它会通过某些 `diff` 算法去计算出本次数据更新真实的视图变化，然后只改变`需要改变`的 `DOM` 节点。

用过 `React` 的同学可能都会体会到 `React` 并没有想象中那么高效，框架有时候会做很多无用功，这体现在很多组件会被 “无缘无故” 进行重渲染（`re-render`）。所谓的 `re-render` 是你定义的 `class Component` 的 `render` 方法被重新执行，或者你的组件函数被重新执行。

组件被重渲染是因为 `Vitual DOM` 的高效是建立在 `diff` 算法上的，而要有 `diff` 一定要将组件重渲染才能知道组件的新状态和旧状态有没有发生改变，从而才能计算出哪些 `DOM` 需要被更新。

正是因为框架本身很难避免无用的渲染，`React` 才允许你使用一些诸如 `shouldComponentUpdate`，`PureComponent` 和 `useMemo` 的 `API` 去告诉框架哪些组件不需要被重渲染，可是这也就引入了很多模板代码。

那么如何解决 `Vitual DOM` 算法低效的问题呢？最有效的解决方案就是不用 `Virtual DOM`！

### **1.3 Truly reactive**

第三点`真正的响应式`，上面也提到了前端框架要解决的首要问题就是：当数据发生改变的时候相应的 `DOM` 节点会被更新，这个就是`reactive`。

我们先来看下`Vue`和`React`分别是如何实现响应式的。

#### **React reactive**

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQnMbU0F2nZhDVMyicUWOCbGkaw8bGI8ia6dlBdu98oTD9VicLcjYsBORBQ/640?wx_fmt=png)

通过`useState`定义`countdown`变量，在`useEffect`中通过`setInterval`使其每秒减一，然后在视图同步更新。这背后实现的原理是什么呢？

`React` 开发者使用 `JSX` 语法来编写代码，`JSX` 会被编译成 `ReactElement`，运行时生成抽象的 `Virtual DOM`。

然后在每次重新 `render` 时，`React` 会重新对比前后两次 `Virtual DOM`，如果不需要更新则不作任何处理；如果只是 `HTML` 属性变更，那反映到 `DOM` 节点上就是调用该节点的 `setAttribute` 方法；如果是 `DOM` 类型变更、`key` 变了或者是在新的 `Virtual DOM` 中找不到，则会执行相应的删除 / 新增 `DOM` 操作。

#### **Vue reactive**

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQ8lBMZI7tZjybGt1oSm2pj1Cn8UupkLoU9tPUC32865Q47lFZjA6njg/640?wx_fmt=png)

用`Vue`实现同样的功能。`Vue`背后又是如何实现响应式的呢？

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQIevPplYDlQwsyUb55xISiczFI2sBAldfobicT4Km2hNcHrEiayrF3sUjA/640?wx_fmt=png)

大致过程是编译过程中收集依赖，基于 `Proxy`（3.x) ，`defineProperty`(2.x) 的 `getter`，`setter` 实现在数据变更时通知 `Watcher`。

像`Vue`和`React`这种实现响应式的方式会带来什么问题呢？

*   • `diff` 机制为 `runtime` 带来负担
    
*   • 开发者需自行优化性能
    

*   • `useMemo`
    
*   • `useCallback`
    
*   • `React.memo`
    
*   • ...
    

那么`Svelte`又是如何实现响应式的呢？

#### **Svelte reactive**

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQc6vFcSO3e5MYZT1vaHwsEwI7WnWdYlRY7eMDq6YbXQU1SrTR8nYXPw/640?wx_fmt=png)

其实作为一个框架要解决的问题是当数据发生改变的时候相应的 `DOM` 节点会被更新（`reactive`），`Virtual DOM` 需要比较新老组件的状态才能达到这个目的，而更加高效的办法其实是数据变化的时候直接更新对应的 `DOM` 节点。

这就是`Svelte`采用的办法。`Svelte`会在代码编译的时候将每一个状态的改变转换为对应`DOM`节点的操作，从而在组件状态变化的时候快速高效地对`DOM`节点进行更新。

深入了解后，发现它是采用了 `Compiler-as-framework` 的理念，将框架的概念放在编译时而不是运行时。你编写的应用代码在用诸如 `Webpack` 或 `Rollup` 等工具打包的时候会被直接转换为 `JavaScript` 对 `DOM` 节点的原生操作，从而让 `bundle.js` 不包含框架的 `runtime`。

那么 `Svelte` 到底可以将 `bundle size` 减少多少呢？以下是 `RealWorld` 这个项目的统计：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQLkurT6E1sO0uDudoV5FlxmyxZc7kjQR49Lbpn7GnPb2sibm9Jv0Vofg/640?wx_fmt=png)

由上面的图表可以看出实现相同功能的应用，`Svelte`的`bundle size`大小是`Vue`的`1/4`，是`React`的`1/20`！单纯从这个数据来看，`Svelte`这个框架对`bundle size`的优化真的很大。

看到这么强有力的数据支撑，不得不说真的很动心了！

**二、项目落地**
----------

为了验证`Svelte`在营销 `h5` 落地的可能，我们选择了口罩机项目：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQtgSlQH0VbK4gUjDic4g0Nrgzt6aFibG54Spfiallia5MygZd52iau2QMaYw/640?wx_fmt=png)

上图是口罩机项目的设计稿，不难看出，核心逻辑不是很复杂，这也是我们选用它作为`Svelte`尝试的原因。

首先项目的基础结构是基于 svelte-webpack-starter 创建的，集成了`TypeScript`、`SCSS`、`Babel`以及`Webpack5`。但这个基础模板都只进行了简单的支持，像项目中用到的一些图片、字体等需要单独使用`loader`去处理。

启动项目，熟悉的`hello world`：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQlSGBMeZ87aGaRh5WOKWHT5RzI5qlYKAJhXZ5S57ePeFS1Yqa6yibtnw/640?wx_fmt=png)

这里看下核心的`webpack`配置：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQ3TzwV7PMftD9OViawq9O4TmWowKTEk9BKbmUX63Liau50DFl1icB0WibIQ/640?wx_fmt=png)

当然开发环境使用`webpack`有时不得不说体验不太好，每次都要好几秒，我们就用`Vite`来替代了，基本都是秒开：

![](https://mmbiz.qpic.cn/mmbiz_gif/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQyMD8coUJFApwN4icsHiaia41WDTfDsvMFpOwN2INVic0OQziczcnzNYwPXQ/640?wx_fmt=gif)

`Vite`的配置也比较简单：

![](https://mmbiz.qpic.cn/mmbiz_jpg/kEeDgfCVf1c7TzwGzK0j5730ahvh6py0xt1G9OGqv7mM7628iciaNaA86HnRyHP45OeJDicqufg75mUmiaAZyjc7wg/640?wx_fmt=jpeg)

### **2.1 组件结构差异**

和 `React` 组件不同的是，`Svelte` 的代码更像是以前我们在写 `HTML`、`CSS` 和 `JavaScript`时一样（这点和`Vue`很像）。

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQwy8n4XHv1GHFsDWKF2nOh0nZbDgXF4C7h43AUjLvOaz2dgCyLcLHcw/640?wx_fmt=png)

所有的 `JavaScript` 代码都位于 `Svelte` 文件顶部的 `<script></script>` 标签当中。然后是 `HTML` 代码，你还可以在 `<style></style>` 标签中编写样式代码。组件中的样式代码只对当前组件有效。这意味着在组件中为 `<div>` 标签编写的样式不会影响到其他组件中的 `<div>` 元素。

### **2.2 生命周期**

`Svelte` 组件的生命周期有不少，主要用到的还是 `onMount`、 `onDestoy`、`beforeUpdate`、`afterUpdate`，`onMount` 的设计和 `useEffect` 的设计差不多，如果返回一个函数，返回的函数将会在组件销毁后执行，和 `onDestoy` 一样：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQOWnRNHPhRC3ibNldZC0XiaYIGRlaqByDSpsflPA07xXMFvD47NtDhNNw/640?wx_fmt=png)

### **2.3 初始状态**

接下来是对初始状态的定义：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQfWsWEAzJB52usqvuUPb7xiaBib8OrExWD1vsObqdaduXlvBvDcjwmjUQ/640?wx_fmt=png)

我们发现代码在对变量更新的时候并没有使用类似`React`的`setState`方法, 而是直接对变量进行了赋值操作。仅仅是对变量进行了赋值就可以引发视图的变化, 很显然是数据响应的, 这也正是`Svelte`的`truly reactive`的体现。

### **2.4 条件判断**

项目中使用了很多的条件判断，`React`由于使用了`JSX`，所以可以直接使用`JS`中的条件控制语句，而模板是需要单独设计条件控制语法的。比如`Vue`中使用了`v-if`。

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQHLfjQEGOic66ibn5gRKIPK0Foph55ib34XrlOmGTPFe8urcxGQFL8LNwA/640?wx_fmt=png)

`Svelte`中则是采用了`{#if conditions}`、`{:else if}`、`{/if}`，属于`Svelte`对于`HTML`的增强。

上面代码中有这么一行：

$: buttonText = isTextShown ? 'Show less' : 'Show more'

`buttonText`依赖了变量`isTextShown`，依赖项变更时触发运算，类似`Vue`中的`computed`，这里的`Svelte`使用了`$:`关键字来声明`computed`变量。

> 这又是什么黑科技呢？这里使用的是 `Statements and declarations` 语法，冒号`:`前可以是任意合法变量字符。

### **2.5 数据双向绑定**

项目中有很多地方需要实现`双向绑定`。我们知道`React`是单向数据流，所以要手动去触发变量更新。而`Svelte`和`Vue`都是双向数据流。

`Svelte`通过`bind`关键字来完成类似`v-model`的双向绑定。

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQxsA9WibK0nZ3MfLl2UT3ad4RG7ZcrdIu0ntnS6xkF1jUb0dicGsFjZicQ/640?wx_fmt=png)

### **2.6 列表循环**

项目中同样使用了很多列表循环渲染。`Svelte`使用 `{#each items as item}{/each}` 来实现列表循环渲染，这里的`item`可以通过解构赋值，拿到`item`里面的值。

> 不得不说有点像`ejs`

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQqQ6ZSAR7I6vSFGBvmhD1wV9Yv3NUkDh2Cb17PR6B3A47UY5p1b8S0w/640?wx_fmt=png)

### **2.7 父子属性传递**

父子属性传递时，不同于`React`中的`props`，`Svelte` 使用 `export` 关键字将变量声明标记为属性，`export` 并不是传统 `ES6` 的那个导出，而是一种语法糖写法。

> 注意只有 `export let` 才是声明属性

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQiaMgGdmFHn0qAJQOia92ic6SgoWEcopHib6Md4QeQJa7qtjDjhPKP1aVrw/640?wx_fmt=png)

### **2.8 跨组件通讯（状态管理）**

既然提到了父子组件通讯，那就不得不提`跨组件通讯`，或者是`状态管理`。这也一直是前端框架中比较关注的部分，`Svelte` 框架中自己实现了 `store`，无需安装单独的状态管理库。你可以定义一个 `writable store`, 然后在不同的组件之间进行读取和更新：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQgetGt1hJ6rjqtB6unHkrsHbaSaOLdgCja78l5DeWzd9RwuhPlmO3ibg/640?wx_fmt=png)

每个 `writable store` 其实是一个 `object`, 在需要用到这个值的组件里可以 `subscribe` 他的变化，然后更新到自己组件里的状态。在另一个组件里可以调用 `set`和`update` 更新这个状态的值。

### **2.9 路由**

`Svelte` 目前没有提供官方路由组件，不过可以在社区中找到：

*   • `svelte-routing`
    
*   • `svelte-spa-router`
    

`svelte-routing`和`react-router-dom` 的使用方式很像：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQ4NOML5Cn2MGu63GNVnKvicL4lJazvFb3HABBsLUwSO8lAGzW0HQCmnQ/640?wx_fmt=png)

而`svelte-spa-router`更像`vue-router`一点：

![](https://mmbiz.qpic.cn/mmbiz_jpg/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQEEZemHqQYaDU7IKTrlS1uowMmicOAP7wm3T4PJae3m9qd6oU28tpZ5g/640?wx_fmt=jpeg)

### **2.10 UI**

项目中也用到了组件库，通常`react`项目一般都会采用`NFES UI`，但毕竟是`react component`，在`Svelte`中并不适用。我们尝试在社区中寻找合适的`Svelte UI`库，查看了`Svelte Material UI`、`Carbon Components Svelte`等，但都不能完全满足我们的需求，只能自己去重写了（只用到了几个组件，重写成本不算很大）。

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQk8WPPuW2OlzluCEHfXY9IYBRic9PIkSoSdyNprTfDn3vgd46arGLt6g/640?wx_fmt=png)

### **2.11 单元测试**

单元测试用的是`@testing-library/svelte`：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQBT980iaGwoEVRMvDSSQFz7OhZI7MnQY2jldYNyzQW0gP4Qpt1CPTSxw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQvTPj1wjJ8ZhYGFeleggG9nicR3JVFp6dx14eOJnu88GmEEweYrOckzA/640?wx_fmt=png)

基本用法和`React`是很类似的。

业务代码迁移完毕，接着就是对原有功能`case`的逐一验证。

为了验证单单使用`Svelte`进行开发的效果，我们没有进行其他的优化，发布了一版只包含`Svelte`的代码到产线，来看下`bundle size`（未做`gzip`前）和`lighthouse`评分情况：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQ7wPYlIzoT8vx7hEKzFxxyVyvde0jH6kwfcpibQvpZEicp6PnJqXN2PIg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQiafASQZI3Jl5dZw3ElCP4DlOyCj6D2Jxh61xUXo6N2tne0gbZIiaib8Dg/640?wx_fmt=png)

除此之外，我们遵循`lighthouse`给出的改进建议，对`Performance`、`Accessibility`和`SEO`做了更进一步的优化改进：

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQAousqU3hiahhUyVrzbEeLgjLa76rj0MQGPKLVUc3eCIKRrDOyCY5DpQ/640?wx_fmt=png)

`Performance`的提升主要得益于图片格式支持`webp`以及一些资源的延迟加载，`Accessibility`和`SEO`的提升主要是对`meta`标签的调整。

**三、实践总结**
----------

通过这次技改，我们对`Svelte`有了一些全新的认知。

![](https://mmbiz.qpic.cn/mmbiz_png/kEeDgfCVf1eOGz9VNYOQGEKZl8HdgqpQntKu0eDsSXjOsAGDZibDGico8iamXiadH1Z2SeVWkQEWo9yHJBTKbC7yvQ/640?wx_fmt=png)

整体来说，`Svelte` 继前端三大框架之后推陈出新，以一种新的思路实现了响应式。

因其起步时间不算很长，国内使用程度仍然偏少，目前来说其生态还不够完备。

但这不能掩盖其优势：足够 “轻”。`Svelte`非常适合用来做活动页，因为活动页一般没有很复杂的交互，以渲染和事件绑定为主。正如文章最开始说的，一个简单的活动页却要用`React`那么`重`的框架多少有点委屈自己。所以对于一些营销团队，想在`bundle size`上有较大的突破的话，`Svelte`是绝对可以作为你的备选方案的。

另外现在社区对于`Svelte`还有一个很好的用法是使用它去做`Web Component`，好处也很明显：

*   • 使用框架开发，更容易维护
    
*   • 无框架依赖，可实现跨框架使用
    
*   • 体积小
    

所以对于想实现跨框架组件复用的团队，用`Svelte`去做`Web Component`也是一个很好的选择。

**参考链接**
--------

*   svelte、react、vue 对比
    

[https://joshcollinsworth.com/blog/introducing-svelte-comparing-with-react-vue](https://joshcollinsworth.com/blog/introducing-svelte-comparing-with-react-vue)

*   你还没有听过 svelte 吗？
    

[https://developpaper.com/you-havent-heard-of-sveltejs-yet/](https://developpaper.com/you-havent-heard-of-sveltejs-yet/)

*   如何看待 svelte 这个前端框架？  
    

[https://www.zhihu.com/question/53150351](https://www.zhihu.com/question/53150351)

**【推荐阅读】**
----------

*   [携程动态表单 DynamicForm 的设计与实现](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697272582&idx=2&sn=17331422ab3818ea59c394de9f97817f&chksm=8376e232b4016b24cb043293bbfd66971060d89bad30b236748e40b8790d050017f81cc2e2b4&scene=21#wechat_redirect)
    ==================================================================================================================================================================================================================================================
    
*   [开源 | 携程 Foxpage 前端低代码框架](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697272519&idx=1&sn=a4175298cad1f708fd2803d7167436fa&chksm=8376e3f3b4016ae59afda3132aaed33ec7da4dcb31461f62666d9881c88e3656d19b1bdc019e&scene=21#wechat_redirect)
    ================================================================================================================================================================================================================================================
    
*   [秒开率 70%+，携程金融 SSR 应用性能监测与优化](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697272519&idx=2&sn=1c10c101a236ee6ae6868869f498dbaf&chksm=8376e3f3b4016ae5af0f9e4f1fea670f9c163ecfe58319fad6b44bd2b66cd1467c6a04da7036&scene=21#wechat_redirect)
    ====================================================================================================================================================================================================================================================
    
*   [提升 50 分，Trip.com 机票基于 PageSpeed 的前端性能优化实践](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697272423&idx=1&sn=46047a086ff9066e922046fe94305e63&chksm=8376e353b4016a45f61225e8091d9a802fd67575b5e641a4a3ab41b96dbb4498c59b0b2d71ff&scene=21#wechat_redirect)
    ==================================================================================================================================================================================================================================================================
    

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/kEeDgfCVf1c7TzwGzK0j5730ahvh6py0PcmLA7obyibHnXZVJLeIU1eaoUEv2qic0qHics7LsZkhbiaZiaxDXp8OtQw/640?wx_fmt=jpeg)

 **“携程技术” 公众号**

 **分享，交流，成长**