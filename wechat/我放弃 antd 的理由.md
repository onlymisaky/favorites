> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gKnzNVY1HHfbMFquKYLGvw)

antd 有哪些问题
----------

### 1. 样式难以重置

如果你是 `antd` 的初学者，那么你可能会花大量的时间在重置样式上。

有两个 `antd` 新手常见的问题：

*   有些样式是通过伪元素来实现的，除非直接覆盖伪元素样式，那么你写的任何覆盖样式都不会生效
    
*   `Modal` , `Popover` 这种 `Portal` 组件，默认是挂载在 `body` 上的。如果你想要覆盖这些组件的样式, 要么使用 `getPopupContainer` 属性让组件挂载在你指定的元素上，要么在组件中传入 `style` , `className` 属性，或者干脆直接写全局样式
    

除了新手常见的问题，还有组件库都有的问题。比如自带的组件  `Icon` 不能修改 , 动效添加、修改十分困难等等。

### 2. 出了 bug 难以修改

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtc9KXKrS00b835iaWUr63wZrHy8hgXCd76lhicn2h6uBuZfV759crpUkFFoVBaAibJHia2Q1IfY40ib0Q/640?wx_fmt=png)bug

虽然 `antd` 社区很活跃，响应速度很快。但是如果你遇到了 `bug`，那么你只能到 `github` 上提 `issue` 或者 `pr` ，然后等待 `antd` 维护者的回复或者审核，等待新版本的发布。

这个过程可能会花费你很多时间，而且最终你的 `pr` 也不一定会被合并，因为 `antd` 维护者可能会觉得你的 `pr` 不符合他们的设计理念。

### 3. 历史包袱太重

这也是 `antd` 这一类组件库的通病。大家都知道，`react` 的生态圈是非常活跃的，随着时间的流逝，社区会出现一些非常优秀的组件，比如

*   react-hooks-form
    
*   @tanstack/react-table
    
*   framer-motion
    
*   embla-carousel
    
*   zod
    

但是 `antd` 的维护者不会考虑到这些组件，因为他们的组件库已经有了类似的组件，比如 `Form` , `Table` , `Carousel` 等等。

这些组件的核心逻辑可能都是好几年前就已经固定了。作为国内最大的 `react` 组件库，`antd` 的维护者不可能随意修改这些组件核心逻辑，这就是一个沉重的历史包袱。

那我们应该选择什么组件库呢？
--------------

回答这个问题之前，我们先来看看上面社区优秀的组件都有一个共同特点：**Headless UI**

> Headless UI 是一种无样式的可访问组件，它们的唯一职责是管理组件的状态变化，而不关心任何视觉方面的问题。

想必大家都已经熟知 `Headless UI` 了，这里就不多说了。社区也有很多优秀的 `Headless UI` 组件库, 比如

*   radix-ui
    
*   chakra-ui
    
*   headless ui
    

那么为什么我最终选择基于 radix-ui 的 shadcn/ui 呢？

### 1. `shadcn/ui` 并不是一个组件库

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtc9KXKrS00b835iaWUr63wZxaxW5DNzA30liaktvgYVh1Gw43WdgTgI6er2kFCG24KTULjPWBSiah7A/640?wx_fmt=png)shadcn/ui

`shadcn/ui` 并不是一个组件库，它不能直接在 `npm` 下载，作者现在也暂时没有计划发布一个 `npm`包。

它只是一个 `react` 组件的集合。这些组件大多数都是基于 `radix-ui` 的 `primitive` 组件封装的。

一些比较复杂的组件，比如`Table` , `Form` (在今天刚刚推出) 等等都是采用社区优秀的组件 `react-hooks-form`，`zod` , `@tanstack/react-table` 来实现的。

使用 `shadcn/ui` 时 , 你可以直接复制组件的源码到你的项目中，或者采用官网的 `cli` 工具

```
npx shadcn-ui add [component]
```

比如

```
npx shadcn-ui add alert-dialog
```

官方是基于 `next.js`, `tailwindcss` 的模版，但是这个仓库并不是一个 `npm` 包。这意味着你可以尽情选择自己喜欢的脚手架，构建工具或者 css 写法，比如 `vite` ,`webpack` ,`create-react-app` , `sass` , `less` `styled-compoents` 等等。

这么做的好处是，你可以完全控制组件的样式，完全控制组件的逻辑，你可以随意修改组件的任何东西。

### 2. 有一个统一的样式规范

`shadcn/ui` 的组件都是 `Headless UI`，但是对于一个小公司或者个人来说，维护一个组件库的样式规范是很困难的，这是 `Headless UI` 的一个最大的缺点。

你可能只想向 `antd` 那样开箱即用，所以 `shadcn/ui` 为你提供了一个统一的样式规范，大体是极简风格，你可以直接使用它，也可以随意修改它。

> 这是 `shadcn/ui` 的 [Figma UI Kit]:https://www.figma.com/community/file/1203061493325953101

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtc9KXKrS00b835iaWUr63wZwibvgHO6ibzQucL6e3pQRRQJ2HhpHAe1jtAXIfE1xMlTIA0oSHZ00s4Q/640?wx_fmt=png)Figma UI Kit

总结
--

`shadcn/ui` 的出现完美解决了我上面提到的 `antd` 这类组件库的问题。除此以外他还有打包体积小，轻量化的特点，得到了开源社区很多大佬的广泛认可，希望各位有机会都可以在项目中试用一下