> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DFDqCqz9icX9_1OdK2t_Jw)

单文件组件由三个不同的实体组成：模板、脚本和样式。所有这些都很重要，但后者往往被忽视，尽管它可能会变得复杂，并经常导致挫折和错误。更好地理解可以改进代码审查并减少调试时间。

这里有 7 个小贴士可以帮助你：

*   1. 样式作用域和插槽内容
    
*   2. 作用域选择器性能
    
*   3. 全局样式
    
*   4. 样式中的 Javascript 变量
    
*   5.CSS 模块
    
*   6.CSS 与 SCSS 中的变量
    
*   7.SCSS include 与 extend
    

* * *

unsetunset1. 样式作用域和插槽内容 unsetunset
----------------------------------

将样式的作用域限定为只影响当前组件，是防止组件耦合和意外副作用的有效策略。

它是通过添加 scoped 属性来转换以下内容来实现的：

```
<template>  <div class="title">Hello world!</div></template><style scoped>  .title {    font-size: 24px;  }</style>
```

to

```
<template>  <div class="title" data-v-7ba5bd90>Hello world!</div></template><style scoped>  .title[data-v-7ba5bd90] {    font-size: 24px;  }</style>
```

如果想让样式影响子组件，可以使用 `deep` 选择器。

```
<style scoped>  .a :deep(.b) {    /* ... */  }</style>
```

其编译为：

```
.a[data-v-7ba5bd90] .b {  /* ... */}
```

使用插槽选择器对插槽内的内容也是如此。

```
<style scoped>  :slotted(div) {    color: red;  }</style>
```

unsetunset2. 作用域选择器性能 unsetunset
--------------------------------

作用域样式不会消除对类的需求。由于 CSS 选择器的工作方式，当使用作用域时，`p { color: red }` 的速度会慢很多倍。如果使用类来代替，性能方面的影响可以忽略不计。

```
<!-- DO --><template>  <h1 class="title">Hello world!</h1></template><style scoped>  .title {    font-size: 24px;  }</style>
```

```
<!-- DONT --><template>  <h1>Hello world!</h1></template><style scoped>  h1 {    font-size: 24px;  }</style>
```

unsetunset3. 全局样式 unsetunset
----------------------------

影响整个应用程序的样式可能不是一个好主意。如果您还是想这么做，可以将作用域样式与非作用域样式混合使用，或者使用 `:global` 伪选择器

```
<style scoped>  :global(.red) {    color: red;  }</style>
```

unsetunset4. 样式中的 Javascript 变量 unsetunset
------------------------------------------

自 Vue 3.2 版起，可以在样式标签内使用 `v-bind`。这可以带来一些有趣的用例，比如只需几行代码就能实现颜色选择器。

```
<template>  <h1 class="text">Hello World!</h1>  <input type="color" v-model="color" /></template><script setup>  import { ref } from "vue";  const color = ref("");</script><style>  .text {    color: v-bind(color);  }</style>
```

一个更高级的用例是使可重用应用程序图标组件的图标大小动态化。

```
<template>  <p>    <input type="radio" v-model="size" :value="sizes.s" />S    <input type="radio" v-model="size" :value="sizes.m" />M    <input type="radio" v-model="size" :value="sizes.l" />L    <input      type="radio"      v-model="size"      :value="sizes.xl"    />XL  </p>  <div class="icon" /></template><script setup lang="ts">  import { ref } from "vue";  enum sizes {    s = 8,    m = 16,    l = 32,    xl = 64,  }  const size = ref(sizes.xl);</script><style>  .icon {    width: v-bind(size + "px");    height: v-bind(size + "px");    background: #cecece;  }</style>
```

unsetunset5.CSS 模块 unsetunset
-----------------------------

只需在样式标签中添加 `module` 属性，即可立即支持 CSS 模块。这些类会通过 `$style` 变量自动显示在模板中。

```
<template>  <p :class="$style.red">This should be red</p></template><style module>  .red {    color: red;  }</style>
```

unsetunset6.CSS 与 SCSS 中的变量 unsetunset
--------------------------------------

SCSS 变量是我们编写 CSS 方式的一次重大变革。在使用预处理器之前，使用变量是不可能的。此后，CSS 迎头赶上，现在所有主流浏览器都支持 CSS 变量。CSS 变量提供了 SCSS 变量所能做到的一切，此外还提供了更简便的主题功能，因此在这场争论中，CSS 变量明显胜出。

unsetunset7.SCSS include 与 extendunsetunset
-------------------------------------------

这两个 SCSS 助手经常会引起混淆，因为它们都可以用来减少 SCSS 代码的重复。CSS 输出中存在一些细微的差别，您应该注意。

`@include` 帮助程序用于包含在 mixin 块中编写的代码。

```
<template>  <p class="error-text">Hello World!</p>  <p class="error-notification">Hello World!</p></template><style lang="scss">  @mixin error {    color: red;  }  .error-text {    @include error;    font-size: 24px;  }  .error-notification {    @include error;    border: 1px solid red;    padding: 8px;  }</style>
```

生成的 CSS 将根据需要多次重复代码

```
.error-text {  color: red;  font-size: 24px;}.error-notification {  color: red;  border: 1px solid red;  padding: 8px;}
```

> ❝
> 
> 这里的 `error` mixin 只有一条规则，但在实际应用中通常会有更复杂的 mixin。

另一方面，当元素几乎相同时 `@extend` 更有用。

```
<template>  <p class="error-text">Hello World!</p>  <p class="error-notification">Hello World!</p></template><style lang="scss">  %error {    color: red;  }  .error-text {    @extend %error;    font-size: 24px;  }  .error-notification {    @extend %error;    border: 1px solid red;    padding: 8px;  }</style>
```

生成的代码为：

```
.error-notification,.error-text {  color: red;}.error-text {  font-size: 24px;}.error-notification {  border: 1px solid red;  padding: 8px;}
```

这里的一般规则是选择 `extend`，除非你想在 mixin 中使用一个参数，在这种情况下，只有 `include` 才有效。

* * *

原文：https://fadamakis.com/7-quick-tips-about-vue-styles-you-might-didnt-know-5ec2fcecb384

![](https://mmbiz.qpic.cn/mmbiz_jpg/WYoaOn5t0AOUYHONmDgjGbAicZVpbQWWwiaw27dsmzh2rGqXFK8xrQqPRLGDGCm837CgDco1hG8W0bOaKYq8y4qQ/640?wx_fmt=jpeg)

最近文章
----

*   [超越基础：Flutter 中 onTap 事件的 5 条规则让你脱颖而出](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499349&idx=1&sn=df7b4c8a659fa75cc9737ae2ee73b235&chksm=f362e876c415616010a169b6ffbb3e46f700b9802f0ac18722aa58bdd187c88f29eb0922074d&scene=21#wechat_redirect)
    
*   [VSCode 是最佳的开发 Flutter 的 IDE 吗？](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499296&idx=1&sn=8d90fdd76a23395be7664f35ef4a9f08&chksm=f362e883c4156195b03f60dbcc9157b69f00197cfb9123eb6a562478576ec92c475ccd61aad1&scene=21#wechat_redirect)  
    
*   [保护生产中 Node.js 应用程序安全的 15 项最佳实践](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499243&idx=1&sn=48377078444cfac72ca61be90f596a4f&chksm=f362e8c8c41561def328ba8f1eb8a8549464af534373919e6722ad2fe9500be1eb9f7d714d7c&scene=21#wechat_redirect)  
    
*   [RDB.js：适用于 Node.js 和 Typescript 的终极对象关系映射器](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499212&idx=1&sn=468131afae1a832a87610eec544912bb&chksm=f362e8efc41561f9bc840ac261f520187654ca7ad6b483b48580f488d78fe15e2250b09f3848&scene=21#wechat_redirect)  
    
*   [如何让你的 Node.js 应用程序处理数百万的 API 请求](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499200&idx=1&sn=c0ce7985b0e7c859ee1d483085902e49&chksm=f362e8e3c41561f5890e563af127e1d9b81718c17722c5c6caa254cfb72e4116951fcb76103b&scene=21#wechat_redirect)  
    
*   [UI 设计通识：通过 60-30-10 规则增强美感](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499195&idx=1&sn=e0585c13cb13228e10d337fe8503cee6&chksm=f362e918c415600e63daf3ee89914e82983b827efe7ef97f9a4438fc31ac6704ea675a3bb4e5&scene=21#wechat_redirect)