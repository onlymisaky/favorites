> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/m39x8cXWwktyTJHygjyhjg)

**一、背景**
--------

公司发展到一定程度，随着业务分支不断变多，B 端 C 端的项目也随之增多，由于历史原因可能产生新老技术栈（vue/react）共存的情况，这既不利于组件物料的抽离统一 (一类通用组件需适配多套技术栈)，也增大了开发者跨项目开发的适应成本。因此技术栈收敛是提升前端平台体系开发效率重要的一环。

提到技术栈迁移，我们首先想到的是**微前端方案，**在隔离性上来说，微前端确实很好的方案**，**但是对于一些**复杂核心模块**，往往需要**较长**的周期迁移，并且伴随着该模块的不断迭代，使得整体项目的迁移进度**逐步拉长。**最终核心**痛点**可能还是没有完全解决。

基于以上的背景，我们需要解决两个问题：

1.  **更丝滑的技术栈迁移**：不仅是新页面，旧有页面的需求也能用 react 开发，做到代码块级迁移。
    
2.  **跨技术栈****开发**：MF 组件化开发，需要将 react 组件转化为 vue 组件以实现在同一界面嵌入 react 组件。
    

**二、跨技术栈开发**
------------

_vuereact-combined_ [1] 提供了组件转换较为通用的解决方案，利用 applyReactInVue 在 vue 指定生命周期渲染 React 组件，并区分了 update 阶段与 create 阶段以减少不必要的 dom 构建，同时监听上层的 $attrs、$listenters，并通过 reactComponentWrapper 中间层拿到的 reactInstance 透传相应状态及方法。

React  -> Vue 转化源码可参考**这里** [2]

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmlrEiaa34BicMvPs0JDiclSLVoy0T5Jbddziaty4HjxaHb2uicydkHia8womw/640?wx_fmt=png)

同时 _vuereact-combined_ [3] 内部还进行了 vuex、router 转化使得 react 组件可以获取到全局状态以及 router 实例以满足路由跳转以及鉴权相关需求。

以下是其支持的转化特性：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQm2e4lVTib47oAIe2UxdlvazGwYOalSeCyV3lhrkHo7V39vTU4o4T2Ptw/640?wx_fmt=png)

##### **同一项目下混合开发？**

嗯，看似一切都解决了，但其中有一些无法避免的问题：首先，React 与 Vue 的依赖以及编译 babel 生态是有区别的，如果有同一依赖，需要找到两个技术栈同时适配的版本，并且构建成本成倍提升，在本地开发与线上构建中需要单独拿出精力优化，一个文件夹下同时存在. vue 与. tsx，结构杂乱，不利于维护。

**三、更丝滑的技术栈迁移**
---------------

### **3.1 页面级微前端对于技术栈迁移以及提效的局限性**

提到技术栈迁移，我们首先想到的是微前端，例如 QianKun、Single SPA、Micro App，他们能做到在平台内部根据大的业务模块做项目级的分拆，并且与技术栈无关。本质上解决了项目维护成本与构建优化成本随着项目不断提升的问题。

注意，页面级的微前端虽然能做跨技术栈开发，但是只能做**增量改造**，新的页面我们可以使用内部统一的技术栈，但是在业务迭代中有相当多的需求是基于旧有页面进行改造，我们还是需要基于以往的技术栈开发，除非是全量重构。那么按照常规方式是，单独抽时间对核心模块做迁移，其中的阻碍可想而知，业务在不断推进，而重构对于用户来说无感，并且还需要测试资源回归，不管对于业务提升以及结果产出短期来看都是没有明显正向作用的。所以，结果只能是旧有模块维持原状，技术栈统一任重道远。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQml2yNswAupox6SmR5KJic21P1nAc59HpF9aD7HaIc3FWMsKaq9CxkUmA/640?wx_fmt=png)

### **3.2 Web components？**

Web components 是 chrome 推动的原生组件 API, 即不依赖技术栈开发组件，实现组件的高复用率。在作为组件级共享上是一个比较好的方案，但由于是原生 API，状态管理，组件通信需要开发者自己实现，由于技术栈迁移这个场景不管是被迁的还是迁入的都是技术栈相关，对于组件转化会有较高的成本。

### **3.3 Module Federation 的代码块级引入**

MF 本质上是 webpack 提供的一种能力，可以使得开发者在一个 JavaScript 应用中动态加载并运行另一个 JavaScript 应用的代码，并实现应用之间的依赖共享。具体原理可参考 _Module Federation 原理剖析_ [4]。

这样我们就能对于旧有的 vue 项目在减少重构成本的前提下做渐进式的迁移。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmkp0B99A0PiaicdzUPicTXOyGeHfkIZGJp9FiagMZJ54VGxB5FVn4ia7pD8w/640?wx_fmt=png)

基于前面微前端与模块化的对比，考虑到模块逻辑的复杂度与迁移成本，我们决定使用基于 Module Federation 的模块化开发，这使得复杂模块的迁移更加平滑，并且能够平衡同模块下技术迁移与业务开发的节奏，两者尽量松耦合，做到渐进式迁移。下面将介绍实现模块化迁移方案的关键点。

**四、实现方案**
----------

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmod7ibAgD8ajvicFl33WyjaJrbqkibKsEovYn4J6pGz3UxkUVwr95BjN6g/640?wx_fmt=png)

### **4.1 组件转换**

首先我们需要将开发者的 react 组件转换为 vue 组件，在每一次 react micro 项目变动时，我们需要遍历该项目并找到. jsx/.tsx 的文件，并声明其对应的. vue 文件，.vue 文件里面做了什么呢？它会基于 vuereact 引入 react 文件，并透传变量与方法，这些. vue 文件用户是没有感知的，因此它们会存放在**临时目录**中 (.mfveat)。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmPX0Y7Wv4mNWlAHthKUO66wsGmoWGFu0zavqwJcGxoCQVXo4JcOiaEJQ/640?wx_fmt=png)

.vue 文件的代码模板如下：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmNUr8LIib5cT8g8YdcI1zXo8OE9n3OmlG7PXqFAjvxOaVRH6FUHObS9w/640?wx_fmt=png)

### **4.2 生成组件 expose 映射**

上节提到的. vue 文件会生成 expose 组件地址到文件地址映射，以被 Module Federation 使用。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQm2rEr3cGxsSH9Kz0XpolT9lW2Txy4WlLHWwSaG4dPqx8CQOkNucgBgg/640?wx_fmt=png)

### **4.3 Module Federation 动态注入**

大家都知道 Module Federation 是写在构建配置文件里的，exposes 决定了这个微应用暴露哪些组件，但是在本地开发时我们业务代码以及导出是变动的，如果每次修改 expose 都得通过重启工程的方式效率是很低的。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmpQVNxOicJnBRC4Kc2KibdTo7HUQd4NhZuEk8ic0OnyM7oqiaNicc6fcvgbA/640?wx_fmt=png)

如何解决动态 expose 的问题呢？这里就要讲到 Module Federation Plugin 的组成, 核心是 ContainerPlugin（remote 端）与 ContainerReferencePlugin（host）, 方案是在基于 ContainerPlugin 上层封装一个插件 **mf-veact-plugin**，支持 expose 传入，在微项目构建完成后按照以上步骤生成 expose.json，然后动态注入 **mf-veact-plugin。**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQm5l3WARbSKOpNf3tMYnLgkqVVabm5YR7lGKLgzj7Cr8wGYY93MbpxUA/640?wx_fmt=png)

以上 3 步就构成了跨技术栈开发的构建全链路，用户只需关心 react 业务代码，然后通过 Module Federation Host 在主项目中引入即可。

**五、开发体验**
----------

### **5.1 刷新监听与 MF 引入**

由于 MF 与主项目是独立的，那么用户在改了 React 代码后如何触发主项目的刷新呢？在每一个子项目编译完成后，webpack 插件会向主项目写入更新唯一标识，主项目循环监听唯一标识，变化时触发页面刷新，最近加入了热重载保证子项目与主项目通信顺滑。

webpack-dev-server 的作者在近期版本中更新了热重载功能，无需手动监听重载。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQm2dib0lwnnKthWhozRaGFngJzXgBYzVBNcJIuDVttsib6xUVLmpIgeTFw/640?wx_fmt=png)

### **5.2 UI 库样式降级，避免全局污染**

MF 做到了组件级微前端，同时又带来了一些问题，由于各个项目可能使用的不同的 UI 库，而 UI 库本身会有全局样式的改造，不可避免的会影响其他项目 UI 库的样式，而 MF 的组件粒度有很难做到如页面微前端一样的项目样式隔离。

这里拿 Antd 举例，Antd 中的 global.less 会对全局样式做格式化，在社区中已经有很多讨论，但直到今天也没有进展。因为 Ant-Design 是一套设计语言，所以 antd 会引入一套 fork 自 _normalize.css_[4] 的浏览器默认样式重置库 global.less。

因此这里的方案是，**「收敛 base.less，并保证外部的全局样式无法轻易覆盖** **antd** **的样式」，从编译角度解决样式污染问题。**

**1）Antd-vue 样式污染问题**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74D4KJj72qLXfMc8u9rFduQmpqDTWNpIlptn9e1QvxqK3gwtkhPZMUoUGkFCGx7DpvmwDicpeZfRQXg/640?wx_fmt=png)

**六、总结**
--------

本文简要介绍了前端领域在迈出技术栈统一这一步后经历的痛点以及挑战，分别从迁移粒度以及使用场景两个方面针对微前端以及模块化这两类开发模式进行了对比，并且从解决用户开发痛点出发阐述架构如此设计的原因。最后列出了在模块化迁移或开发过程中需要注意的问题并给出了解决方案。主旨还是希望能够以更低的成本与更好的开发体验推动技术栈统一与迁移。

模块化开发是前端领域离不开的话题，解决技术栈统一问题仅是其一个分支，同时模块化代码隔离与非版本化改动也是我们未来要解决优化的方向，组件、平台模块的自动化共享一直在被提及，希望本次方案探索能够给大家带来一些灵感，也欢迎大家在前端平台体系组件通用化这一方向上一起交流讨论。

参考文章：

[1]https://github.com/devilwjp/vuereact-combined

[2]https://github.com/devilwjp/vuereact-combined/blob/master/src/applyReactInVue.js

[3]https://github.com/devilwjp/vuereact-combined

[4]https://juejin.cn/post/6895324456668495880

[5]《如何优雅地彻底解决 antd 全局样式问题》

https://juejin.cn/post/6844904116288749581

[6]《Module Federation 原理剖析》https://juejin.cn/post/6895324456668495880

*** 文** **/ 天意**

 关注得物技术，每周一三五晚 18:30 更新技术干货  

要是觉得文章对你有帮助的话，欢迎评论转发点赞～

10 月 30 日得物技术沙龙杭州专场 - 电商后端服务架构 PPT 已上传

**获取方式：**「得物技术」公众号后台回复 **PPT**。