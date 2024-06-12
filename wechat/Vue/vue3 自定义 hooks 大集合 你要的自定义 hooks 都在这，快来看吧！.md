> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EMCE34qfAPVYZcOkPiuD0g)

> 本文链接较多，建议点击底部阅读原文查看文章，更方便快捷打开链接~

前言
--

不知道喜欢 `vue3` 的小伙伴和我是不是一样，刚上手`vue3` 的时候对`自定义hooks` 一脸懵逼，在一些视频网站学习的时候老师讲解到自定义 hooks 最喜欢用加减乘除来描述自定义 hooks 是咋用的，可能是我理解能力比较差吧，我看了这个`加减乘除`的自定义 hooks 之后感觉跟没看一样，还是一脸懵逼，所以个人觉得这种知识还是结合项目或者业务来说才是比较能让人理解的。

但是平时开发的过程中却好像也不怎么需要自定义 hooks，那我们到底需不需要自定义 hooks，又该如何学习自定义 hooks 呢，首先先在这跟你说结论：自定义 hooks 不是必须的，他只是为我们提供一种`逻辑复用`的方式，但是他有利于你复用逻辑代码更简洁，那如何学？学习别人的思想啊！然后自己融汇贯通即可。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGiaia2ZeXvEam02dUZVJ0zI1Te665px0H5zddJzlumtD9W6h3VTGqMQJg/640?wx_fmt=png&from=appmsg)

介绍
--

其实我们平常说的，自定义 hooks 在 vue3 官方说法叫组合式 API (Composition API)(https://cn.vuejs.org/guide/extras/composition-api-faq.html#comparison-with-react-hooks)

*   组合式 API (Composition API) 是一系列 API 的集合，使我们可以使用函数而不是声明选项的方式书写 Vue 组件
    
*   虽然这套 API 的风格是基于函数的组合，但**「组合式 API 并不是函数式编程」**。组合式 API 是以 Vue 中数据可变的、细粒度的响应性系统为基础的，而函数式编程通常强调数据不可
    
*   组合式 API 最基本的优势是它使我们能够通过组合函数 (https://cn.vuejs.org/guide/reusability/composables.html) 来实现更加简洁高效的逻辑复用。在选项式 API 中我们主要的逻辑复用机制是 mixins，而组合式 API 解决了 mixins 的所有缺陷(https://cn.vuejs.org/guide/reusability/composables.html#vs-mixins)
    

使用
--

平时我们 写自定义 hooks 可能有两种

*   一种是基于业务的自定义 hooks 只是为了单纯提取可复用的逻辑，缺点是只能用在自己项目中
    
*   一种是可复用性强的可在全局使用的，比如对于弹框、表格、表单等等的自定义 hooks
    

### 基于业务封装的 hooks

最近我在开发低代码的项目，我在项目中得封装一套组件，看下面的伪代码：

**「输入框」**

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGib3VicGzosSahS34IFvJUmkBOxRiaHjZBI3Cx3BFBTNXtV0X6JbEAfdoQ/640?wx_fmt=png&from=appmsg)

**「下拉框」**

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGf76wYNn8XIYDAJM0TNv1xk8VBldR93FYBeicRatOHO2ibBTo05un3zNA/640?wx_fmt=png&from=appmsg)

**「开关」**

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGkC0oe3jh13I3cB6DSaop65bobFGLgkfJbDTKJR2M4RAgpKaN8bOQLg/640?wx_fmt=png&from=appmsg)

可以看到，每个组件都有个共性，有个配置项 status 如果值为 disabled 的时候，会被赋值到组件上，要是有很多组件，我们都得复制一下这个代码，那就比较恶心了，这个时候我们就可以用自定义 hooks 去封装这个属性：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGLI8L5U8wffAtwdxZXqa0QWyfHaCTjM9V7sxXNHHP2VQ5ZQSZaO8vQA/640?wx_fmt=png&from=appmsg)

我们组件就可以通过 hooks 去引入这个属性了，这样每个组件也只要引入这个 hooks 就行

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGXYqv5AZz2EY7v9ib4Z9LZbft5kRZtHq1ubvuMtIlbw3YdrYdArZ3oIg/640?wx_fmt=png&from=appmsg)

### 复用性强的自定义 hooks

#### 1) 更改网站 title

大家有没有遇到过这种业务，每个页面进入之后都有他自己对应的 title，你都得去改，如果没有的话那之前的 title 不用改，所以你就可能在每个页面写出 类似以下的代码：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibG84BQ3P8VwIgFZ6Y3beD4Q6wGEqYGLqic4SrgzjR0L938X2Rg3FrXM9A/640?wx_fmt=png&from=appmsg)

但是你要是用了封装之后的 hooks 之后

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibGFj2505fYHow8n7wVojsYbDo78f2QF5iaMXZic8S1UFuwvymciaB8VP5WA/640?wx_fmt=png&from=appmsg)

你只需要把这个 hooks 引入只写一句代码就行

```
const setTitle = useTitle('测试')
```

##### 2) 大家写后台管理的时候是不是大多场景都是对于表格的增删改查 ，对于分页的操作每个页面其实都是一样的，这个时候我们就可以把他封装起来

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zibGur3rh5gH17DRH0M0l7ibG8c6NtHO9JkJsmQ1vEluk2QvZH2JtgO8ncGrh7VIcpdZmCI5Jeh8V3g/640?wx_fmt=png&from=appmsg)

这个 hooks 发给任何人，他们都能用到自己的项目中，复用性较强。

给大家分享一下 我平时收藏的 vue3 hooks 的网站以及文章
---------------------------------

**「开源库与开源项目中的 hooks」**

🚀vue3 官方推荐社区项目 VueUse：https://www.vueusejs.com/)

这个是我最推荐大家的 hooks 平时没事的时候在里面逛一下 看看源码 绝对能学到很多，我平时用的比较多的是其中的 `useResizeObserver`、`useTitle`、`useClipboard`、`useDraggable` 等

🚀ahooks-vue：https://github.com/dewfall123/ahooks-vue

ahooks 的 vue 实现。许多 hooks 是从 ahooks(https://ahooks.js.org/docs) 移植过来的，但是不完全一致。包含了 `useRequest`、`useAxios`、`useFullscreen`、`useTable`等

🚀个人封装的 hooks 库：https://github.com/lmhcoding/vhook

这个是我偶然发现的一个 hooks 库 感觉也是模仿其他库的，仅供参考

🚀vue-hooks:https://github.com/u3u/vue-hooks

主要包含了 `useDate`、`useStore`、`useActions`等

🚀vue-use-web：https://github.com/Tarektouati/vue-use-web

跟 vueuse 有点像不知道是不是 vueuse 前身，而且都是国外大佬维护的

🚀vue-hooks-plus：https://github.com/InhiblabCore/vue-hooks-plus

其中包含 47 个高质量 & 可靠 hook 函数 其中`useRequeset` 、`useWebSocket`、`useFetchs`等都很优秀

🚀针对 Vue3 的实用 Hooks 集合：https://github.com/yanzhandong/v3hooks

`useRequest`、 `useDate`、`useVirtualList` 我在项目中都用到了

🚀20kstars 的后台管理项目：vue-vben-admin：https://github.com/vbenjs/vue-vben-admin/tree/main/src/hooks

这个是 点赞比较多的 vue3 后台管理项目 其中 我上面的分页 hooks 就是抄他的 里面还有很多 表格表单 hooks 大家也可以参考 其中包含了 `useContext`、`useScroll`、`useEventListener`、`useTable`、`useTitle`等

🚀vue3-antd-admin：https://github.com/buqiyuan/vue3-antdv-admin/tree/main/src/hooks

喜欢用 antd 的同学可以看看其中的`useI18n` `useModal`、`useEventbus` 方案都很优秀

**「表格相关的」**

🚀一文学会 vue3 如何自定义 hook 钩子函数和封装组件：https://juejin.cn/post/7300872843587469327

🚀【Vue3】如何封装一个超级好用的 Hook ：https://juejin.cn/post/7299849645206781963

🚀useTable 表格 hooks 封装和使用 (Vue3)：https://juejin.cn/post/7289661061984649275

🚀vue3 流水线开发分页列表？😁 useTable 了解一下：(https://juejin.cn/post/7293786797061668902

🚀Vue3 自定义 useTable：https://juejin.cn/post/7288956991089705018

🚀在 Vue3 这样子写页面更快更高效：https://juejin.cn/post/7172889961446768670

🚀基于 vue3+Arco Design 的 table 组件的 hook 二次封装：https://juejin.cn/post/7088958678912466957

每个人封装的表格 hook 其实都有区别，所以大家可以综合一下，总结出比较适合自己项目的，因为每个人项目中的 ui 分页等等都不太一样所以个人建议总结出一个，集成到自己项目中是最好的。

**「关于请求的 hook」**

🚀Vue3 教你实现公司级网络请求的 Hook：https://juejin.cn/post/7048214402121596959

🚀Vue3 使用 hook 封装常见的几种异步请求函数场景，让开发更加丝滑：https://juejin.cn/post/7252255706934722597

**「其他 hooks」**

🚀Form 表单组件封装和使用 (Vue3)：https://juejin.cn/post/7294880695398268943

他把 antdvue 的 form 二次封装了 并且搭配了自己的封装的 hooks

🚀【vue3】写 hook 三天，治好了我的组件封装强迫症：https://juejin.cn/post/7181712900094951483

封装了下拉框选项从后端获取值的 hooks 以及关于 loading 状态的 hook

🚀Vue3 自定义一个 Hooks，实现一键换肤：https://juejin.cn/post/7237020208648634429)

一键换肤的 hooks

🚀Vue3 使用 hook 封装媒体查询和事件监听，使 Vue 的开发更加丝滑🚀🚀🚀：https://juejin.cn/post/7251523348596441143

🚀聊聊 Vue3+hook 怎么写弹窗组件更快更高效：https://www.php.cn/faq/499568.html

🚀【Vue3 Hook】实现 useTimeout 代替 setTimeout：https://juejin.cn/post/7184703134936072249

🚀公共 Hooks 封装之文件下载 useDownloadBlob：https://juejin.cn/post/7247010613740961847

🚀在 vue 中封装 useIntro 来更好的使用 Intro.js：https://juejin.cn/post/7282603015742947389

总结
--

以上是我工作这么长时间收藏到的，分享出来希望能够给到大家一点帮助，如果大家也有比较好自定义 hooks 的方案 和 hooks 库可以阅读原文评论哦 我觉得比较好的话会再加上去的，最终也希望自己能做一个跟 `vueuse`媲美的 hooks，名字我都想好了，就叫 jym-hooks（掘友们一起创建的 hooks 库）。