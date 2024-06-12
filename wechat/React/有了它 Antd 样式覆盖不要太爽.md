> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/hvrZjneQN-EMIMZveomK9g)

背景
==

目前作者所在的业务正在升级 Antd5.0，不得不说 Antd5.0 真的太香了，但是由于团队的 UE 规范进行了大改版，Antd5.0 所有的组件必须对齐最新的规范，因此就需要对 Antd5.0 组件做主题定制。

现状
==

目前针对项目中使用的 antd 高频组件进行了梳理，并且根据规范基于 design token 对这些高频组件进行样式定制，对于主题色、圆角、边框、字体等用户关注度高的主题都已经满足团队规范。

虽然 Design Token 提供了非常强大的拓展能力，但是同样它也有限制，例如当某些组件（button、select）的主题实现不能单纯依赖某种 Token 时，开发者就需要通过样式覆盖的方式去改写 antd 的样式以满足需求。

目标
==

*   从高频组件中梳理出需要进行样式覆盖的组件及其需要覆盖点。
    
*   调研出一套具备高性能、高可扩展、兼容性强的样式覆盖方案。
    

Antd 主题定制演进
===========

Antd4.x 时代
----------

### 简单概要

在 antd4.x 时代，antd 的样式使用了 less 作为开发语言，其内部定义了一系列的全局 / 组件的样式变量，开发者可以根据业务需求去覆盖这些样式变量。

```
@primary-color: #1890ff; // 全局主色
@link-color: #1890ff; // 链接色
@success-color: #52c41a; // 成功色
@warning-color: #faad14; // 警告色
@error-color: #f5222d; // 错误色
@font-size-base: 14px; // 主字号
```

对于样式变量的覆盖，原理上是使用 less 提供的 modifyVars 方式进行变量的覆盖，以 webpack 为例：

```
// webpack.config.js
module.exports = {
  rules: [{
    test: /\.less$/,
    use: [{
      loader: 'style-loader',
    }, {
      loader: 'css-loader',
    }, {
      loader: 'less-loader',
+     options: {
+       lessOptions: {
+         modifyVars: {
+           'primary-color': '#1DA57A',
+           'link-color': '#1DA57A',
+           'border-radius-base': '2px',
+         },
+         javascriptEnabled: true
+       }
+     }
    }]
  }]
}
```

### 什么是 CSS 变量？

早在 2012 年 W3C 就已经公布了 CSS 变量的首个公开草案；2017 年 3 月微软 Edge 浏览器也宣布支持 CSS 变量，此时所有主要浏览器都已经支持这个 CSS 新功能。

CSS 变量本质是定义一系列样式属性，可以被其他 CSS 属性引用，并且提供了 JavaScript 基层 API 进行管理，因此 CSS 变量天生就是为**「主题定制」**而生的，典型页面就是 react.dev 和 Mantine 的官网。

除此之外 CSS 变量一个最大的优势在于**「是编译时，不是运行时」**，这个特性在主题定制中尤为重要，主要体现在两个方面：

*   切换主题不会卡顿
    
*   切换主题后能够无缝刷新（静态站点切换到暗色后刷新，不会从亮色再变回暗色）
    

这两个场景在 cssinjs 这种**「运行时」**方案下是无法实现的，前者不能实现是因为在切换主题时样式需要重新进行序列化，后者不能无缝刷新是因为刷新后系统就无法保留切换后的主题样式，需要重新生成）。

### CSS 变量下的 Antd 主题定制不足

*   不够灵活
    
    以 CSS 变量为基础的主题系统 / 样式引擎虽然能够带来更好的用户体验，但同时也就丧失了主题定制的**「灵活性」**，比如不支持主题嵌套、多主题并存的能力，比如说下面这个典型的场景：
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5wA49td7SdVKgHOXKl3FLHIxic6q9pKkDo8K7qAkkgBgRyp9Ksv6Vbdg/640?wx_fmt=png&from=appmsg)image.png![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5w4D5TldNiavu7NNj1ttFbSSJfR5JjmG4Qmaicia2AZ4H3IjpOrBMTHKKA/640?wx_fmt=png&from=appmsg)image.png
    
    可以看到由于暗色模式下 Modal 的底色与页面基础的 Layout 底色不同，最终呈现的感觉就是 table “陷” 进去了一层，但这种场景在 antd 层面往往无能为力，因为组件本身并不限制业务应用如何使用组件，因此就需要开发者自己去做样式覆盖。这篇文档中官方提供了很多关于灵活性讲解的例子。
    

Antd5.x 时代
----------

### 简单概要

在 2022 年 11 月 18 日，Antd 发布了 Ant Design 5.0 的正式版本，为了提高主题定制的了灵活性， Antd 将原有的 less 方案替换为 css-in-js 方案，也因此诞生了一套新的主题定制方案—— Design Token 模型，支持用户去灵活的实现主题嵌套、多主题并存。

> ❝
> 
> 🔑 关键点：主题配置从原来的编译时配置变成了代码里的运行时配置。
> 
> ❞

### 什么是 CSS-in-JS？

css-in-js 是一个将 CSS 样式写在 Javascript 文件中的技术，旨在解决 CSS 自身的局限性，比如变量定义、条件判断、函数调用等 JavaScript 语言才有的特性，通过 css-in-js 使得原有 CSS 样式变得更灵活可拓展。在 React 社区中，目前最流行的 css-in-js 库是 styled-components 和 Emotion。

css-in-js 最关键的特性就是**「运行时」**，这意味着使用 css-in-js 编写的样式只有在应用运行时才会去解释并应用。

### CSS-in-JS 的优点和缺陷

**「优势：」**

*   没有全局样式冲突
    
    就像 js 天然支持模块化的好处一样，原生 CSS 因为没有模块化的能力，和容易导致全局样式污染，如果样式不是特意用 BEM 的方式命名，或者借助 css module 的能力，想要避免样式冲突就只能用 css-in-js。
    
*   自带 tree-shaking 功能
    
    由于 css-in-js 支持模块化的样式定义，每个组件的样式会被定义成一个单独的模块，而构建工具会对定义的样式模块进行静态分析，使得未使用的样式模块不会打包到最终的产物中。
    
*   方便样式管理
    
    css-in-js 会把样式和组件绑定在一起，当这个组件要被删除掉的时候，直接把这些代码删除掉就好了，不用担心删掉的样式代码会对项目的其他组件样式产生影响（css-modules 也一样能做到，只是必须单独拆一个样式文件）。
    
*   灵活性高
    
    css-in-js 允许再样式中使用 Javascript 变量，从而使组件的样式具备高可定制化的能力。
    

**「缺点：」**

*   css-in-js 增加了运行时开销
    
    组件每次渲染时，css-in-js 库必须将样式**「序列化」**为可被插入到页面的 CSS 样式，显然这需要额外的 CPU 消耗，尤其是在 React 18 的并发模式下，会存在无法解决的性能问题。
    
    React 核心团队成员、Hook 设计者 Sebastian Markbåge 在 React 18 工作组的这篇非常有价值的讨论中说道：
    
    > ❝
    > 
    > 📢 在并发渲染中，React 可以在渲染之间让出线程给浏览器。如果你在一个组件中插入新的 CSS, 然后 React 让出线程，浏览器必须检查这些 CSS 是否适用于现有的树。所以它重新计算样式规则。然后 React 渲染下一个组件，然后这个组件发现新 CSS，那么这个过程会循环往复。
    > 
    > ❞
    
    **「总结来说，css-in-js」** **「在运行时插入样式会阻塞 React 的渲染，进而拖慢整个页面的渲染速度，当组件频繁的渲染时就会出现明显的性能瓶颈。」**
    
    这个问题目前看来是无解的，因为运行时 css-in-js 库的工作方式就是组件渲染时插入新样式规则，这在根本上和性能是对立的。
    
*   css-in-js 增加了包体积
    
    相比于原生 CSS 写法或者 CSS module 方案来说，**「css-in-js」** 会引入而外的运行时代码（Emotion 是 7.9 kB 压缩后，styled-components 是 12.7 kB）。
    
*   多个不同（甚至是相同）版本的 css-in-js 库同时加载时可能导致错误（example issue）。
    
*   不同 React 版本的 SSR，css-in-js 需要适配不同的实现（example issue）
    

小结
--

**「css-in-js」** 自身的设计方向是对的，即把 CSS 与 JS 相结合，使得 CSS 变得更加的灵活，在一些需要组件样式具备高可定制化能力的场景中能发挥出最大的优势，这也是 Antd5.0 不可割舍的最主要的原因，但太过灵活的运行时 **「css-in-js」** 方案遇到了几乎不可解的性能问题，因此 Antd 也需要面临这方面的挑战。

Antd 没有考虑过 CSS- in-JS 的性能问题吗？
=============================

CSS-in-JS 性能问题的根源
-----------------

在 css-in-js 中每一段 CSS 都会有一个 hash 值，用来确认这段 CSS 是否已经插入到页面，而这个 hash 的生成方式一般是将这段完整的 CSS 样式转换成一个 hash 值。比如在 styled-components 中，它生成的样式会被插入到 style 标签中，而这个 style 标签中的每一个 className 就是根据 CSS 样式生成的 hash 值，每个 hash 值都是唯一的。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5Sw8RVeRxJLTicnfiaEqd5zYGgRDO3FtaA45Z099EibAZ8jKvcjribJD31A/640?wx_fmt=png&from=appmsg)image.png

因此也就引入了一个 css-in-js 被诟病已久的性能问题，因为开发者在使用 css-in-js 编写的样式本身不是最终的 CSS 样式，需要应用在运行时调用 css-in-js 库对所写的 CSS 样式进行序列化，生成最终的可插入页面的 CSS 样式，然后基于最终的 CSS 样式再去生成对应的 hash 值，这样组件每次重新渲染就需要重新序列化一次 CSS 样式进而带来额外的开销。除此之外，如果 css-in-js 样式会跟随组件的 props 变化，那么这个性能消耗便变得不可忽视。

因此，这里总结一下使用 css-in-js 出现性能问题的两个根本原因：

*   **「组件本身频繁的重渲染」**（可以通过将 CSS 样式提取到组件外或者通过缓存来解决）。
    
*   **「css-in-js 样式本身是动态的，会根据组件 props 变化。」**
    

如何破局
----

Antd 为了解决 **「css-in-js」** 存在的性能问题，根据自身场景推出了两个重要的目标：

*   **「Antd 的 css-in-js 样式并不跟随组件本身的 props 改变」**
    
    在 Antd 中，一个组件的样式通常来说是**「完整」**的，只要使用了某个组件，antd 就会自动引入有关这个组件的所有样式——不管有没有使用过。这样做有两个原因：
    

1.  Antd 从 4.x 到 5.x 进行改造时并没有改变样式的组织方式，任然是和 4.x 一样通过 class 的组合来实现不同的样式效果。
    
2.  减少动态生成样式的次数。Antd 以组件为维度制定了缓存策略，同一个组件只会插入一次样式，这样会减少 css-in-js 在序列化 CSS 时的性能损耗。
    

*   **「对组件做样式缓存」**![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5YUAmJa479iabtlRDQ8e1OfzRbTddz4K5WV6Itn4JesGL4lBiceKabnEQ/640?wx_fmt=png&from=appmsg)
    
    对于一个 Antd 组件，Antd 会通过上面的策略计算当前组件样式的 hash 值，前者是当前组件的 token，可以通过 context 获取，后者是当前 Antd 的版本，可以从 package.json 中获取。因此在 hash 相同的情况下，同一个组件无论使用了多少次、渲染了多少次，样式永远只会在第一次 mount 时生成一次，剩下的时间里都会命中缓存 。
    

Benchmark
---------

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5olC587lMfEnaiar7KREd7OmhliaBskHz1hMB59SItib0wcgOvMKqNO8aA/640?wx_fmt=png&from=appmsg)image.png

这个 benchmark 的成立条件是产生一段非常长的不会变更的样式，以此来测试这三个库的基本用法的性能。可以看出在 Ant Design 的 “组件级” 使用场景下，无论是初次渲染还是二次渲染，Antd 都拥有性能上的优势。由于 styled 在处理稳定的样式时有一定优化，所以这个 benchmark 中二次渲染的性能较好，但在有 props 参与样式计算时仍会和 emotion 一样受到重新计算的影响。

小结
--

Antd 针对 css-in-js 在性能上的问题，结合自身的场景给出了相应的解决方案，通过这个方案，Antd 获得了相较于其他 css-in-js 库更高的性能，但代价则是牺牲了其在应用中自由使用的灵活性。所以这个方案也被称为 “组件级” 的 css-in-js 方案。

> ❝
> 
> 💡 @ant-design/cssinjs 是实现 antd 组件库的一套组件级的 css-in-js 方案，它通过比较繁琐的写法换得了相比 styled-component 和 emotion 都要好很多的性能。
> 
> ❞

CSS 样式覆盖方案选择
============

Antd 作为一个组件库，他的职责只在于提供高品质的基础组件，因此应用层如何使用样式方案，Antd 并不关心也不做限制，开发者可以使用 less、sass、styled-components、tailwindcss、emotion 等方案对 Antd 组件进行样式覆盖。

样式覆盖方案
------

样式覆盖方案大类可分为两类：css-module 和 css-in-js。

> ❝
> 
> 全局样式覆盖暂时不考虑，这种方案不可控且维护非常困难。
> 
> ❞

目标
--

*   高性能（css-module 优于 css-in-js）
    
    css-module 相比于 css-in-js 有着天然的性能优势，因为它是编译时，不需要在应用运行时去序列化样式。
    
*   高可扩展（css-in-js 优于 css-module ）
    
    在扩展方面，css-in-js 占据着绝对的优势，因为运行时赋予了它更高的灵活性，举个例子，在 Antd 中开发者可以通过 ConfigProvider 的 `prefixCls` 修改组件 className 的前缀，这种场景是很常见的，对于 css-module 来说这是非常难实现的，更别说嵌套 ConfigProvider 的场景。
    
    而在 css-in-js 中，混合 `prefixCls` 是很容易的事情，开发者可以通过 ConfigProvider 的 `getPrefixCls` 方法来获取 `prefixCls`，然后进行混合：
    
    ```
    import React from 'react';
    import {ConfigProvider} from 'antd';
    import {createStyles} from 'antd-style';
    
    const useButtonStyle = () => {
      const {getPrefixCls} = React.useContext(ConfigProvider.ConfigContext);
      const btnPrefixCls = getPrefixCls('btn');
    
      return createStyles(({ css }) => ({
        btn: css`
          background: red;
          .${btnPrefixCls}-icon {
            color: green;
          }
        `,
      }))();
    };
    
    function GeekProvider(props: {children?: React.ReactNode}) {
      const {styles} = useButtonStyle();
    
      return <ConfigProvider button={{className: styles.btn}}>{props.children}</ConfigProvider>;
    }
    ```
    
*   兼容性强
    
    能够兼容 SSR 、微前端等场景。
    

总体来说不管是 css-module 还是比较流行的 css-in-js 方案，都不能完全满足**「目标」**，面对开发者的诉求，官方给出了他们的解决方案——antd-style。

官方出手—antd-style
---------------

### 背景

上面介绍过，antd 组件库本身的样式是基于 css-in-js 实现的，为了在使用 css-in-js 带来的灵活性的同时也能拥有相比 styled-component 和 emotion 更好的性能，antd 推出了**「组件级别的 css-in-js 方案」**（@ant-design/cssinjs），但对应用和基于 antd 封装的组件库中，这种写法可能过于繁琐和复杂，且缺少消费 antd token 系统的能力。

### antd-style 是什么？

`antd-style` 是基于 Ant Design V5 Token System 构建的业务级 css-in-js 解决方案，它的适用场景是业务应用和基于 antd 二次封装的组件库，它会提供这两个场景所需要的所有能力。

### 使用方式

*   安装 antd-style
    
    ```
    yarn add antd-style 
    或
    npm install antd-style
    ```
    
*   覆盖组件样式（官方推荐样式覆盖的方式）
    
    ```
    import React from 'react';
    import {ConfigProvider} from 'antd';
    import {createStyles} from 'antd-style';
    
    const useButtonStyle = () => {
      const {getPrefixCls} = React.useContext(ConfigProvider.ConfigContext);
      const btnPrefixCls = getPrefixCls('btn');
    
      return createStyles(({css, token}) => ({
        btn: css`
          background: red;
          .${btnPrefixCls}-icon {
            color: green;
          };
    			background: ${token.colorPrimary};
        `,
      }))();
    };
    
    function GeekProvider(props: {children?: React.ReactNode}) {
      const {styles} = useButtonStyle();
    
      return <ConfigProvider button={{className: styles.btn}}>{props.children}</ConfigProvider>;
    }
    ```
    
    更多使用方式可查看官网。
    

### 是否能够满足目标？

*   **「高性能」** ✅
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5PjkPwlyvcYMabqnNFHUtGOTKFrH5mWaBmVDiaPibqDgNo4wQIDOlGL6g/640?wx_fmt=png&from=appmsg)image.png
    
    antd-style 的目标之一就是为组件开发者开发的组件能够获得更优的性能，Antd 官方也针对 antd-style 的性能与其他 CSS-in-JS 库进行了对比，可查看 benchmark。
    
*   **「高可扩展」** ✅
    
    antd-style 本身是一个 css-in-js 方案，因此天生在灵活性上有很大的优势，同时它还支持自定义 token、复合样式（stylish）等能力。
    
*   **「兼容性强」** ✅
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibtib3ShShaxtrCM8eELtkRe5V9KoWl6zncBvBT88dvQHQcEWP0KO2XVErUTziaeNtODDsQVsMSD4mWQ/640?wx_fmt=png&from=appmsg)antd-style 已经支持 SSR，同时微前端场景也在未来的 feature 中。
    

### 误区

1.  **「antd-style 彻底解决了性能问题吗？」**
    
    没有，antd-style 的性能还达不到 @ant-design/cssinjs  的水平，原因是 @ant-design/cssinjs 包在不支持响应 props 的设定下可以静态化，不需要频繁的序列化，进而提升性能，但业务应用中需要使用 props 来动态响应样式。
    

### 结论

相比于 less、sass、styles-component、emotion 等样式覆盖方案，antd-style 作为官方提供的 css-in-js 方案，能够很好的满足基于 antd 二次封装的组件库这个场景所需要的能力，在性能、扩展性和兼容性上都变显得非常优异，但是目前这个库还处于持续建设阶段，部分文档和功能建设还不完善，有一定的上手难度。