> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zD3j9jzWYCD810w6QmX2FQ)

📍前言
====

最近在一次理解`vue`项目的代码时，发现周一对好多`API`都不太熟悉。这间接导致的问题是，代码理解速度要比平常要慢很多。于是乎，赶忙把`vue API`的学习提上了日程。

在下面的文章中，将地板式地扫盲`vue3`文档中`API`模块的所有内容，融入周一的理解进行深入介绍。下面就来一起看看吧~🍬

一、🖇框架搭建
========

1、关于文档
------

首先附上官方文档的具体材料：https://cn.vuejs.org/api/

2、VUE3 API 整体盘点
---------------

在`vue3`的全新`API`中，有部分在`vue2`的基础上沿用了。还有另外一部分，是`vue3`所新增加的。我们先来看`vue3 API`文档主要包含哪些内容？

`vue3 API`主要包含以下六个部分：

*   全局 API —— 全局会用到的 API
    
*   组合式 API —— vue3 所拥有的组合式 API
    
*   选项式 API —— vue2 所拥有的选项式 API
    
*   内置内容 —— 指令、组件、特殊元素和特殊属性
    
*   单文件组件 —— 语法定义、`<script setup>`和 CSS 功能
    
*   进阶 API —— 渲染函数、服务端渲染、TS 工具类型和自定义渲染
    

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2ChuibJWxVqCkw5ju0v1GHQtwMVHXgA1RSGNkNce9X5IjZmrl6obia7icA/640?wx_fmt=png) vue3 API 盘点

下面将依据上面提到的六大点内容，来进行相应的剖析和讲解。

二、🎨全局 API
==========

vue3 的全局 API 包含两个部分：应用实例和通用 API。那它们各自都有哪些内容呢？

1、应用实例
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2BTSMQbAjRKyB2HrKoMeFjwu96qN7SZmK2YUibCOiawxAIp3lNCoQx1FA/640?wx_fmt=png)02_应用实例

2、通用 API
--------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2Y5z7NuOKeOcAl5lTOjwcFlHtfIu4eXcs2ibjPvUWodyeiboEdtN2vn6A/640?wx_fmt=png)02_通用

三、🚲组合式 API
===========

谈到`vue3` ，相信大家最为熟悉的就是 `composition API` 了，也就是 `组合式 API` 。那么，`vue3` 的 `组合式 API` 都给我们带来了什么呢？

1、setup
-------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ228bvgccK1jn3AECibeT4WTJnibso1bWicyoZGKJDCrz97obAXVDYs4TBQ/640?wx_fmt=png)01_setup

2、响应式：核心
--------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2Rj6FKexrNuWIp8l3H313icaYokO5m0RTHsmWFibDhFiab6IQibVVFJ2aGQ/640?wx_fmt=png)02_响应式核心

3、响应式：工具函数
----------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2hDWI7typcalze4zlia8m1WFhxIiar0cQWg09EfZMF3oQ9fmUvbAShLeg/640?wx_fmt=png)03_响应式工具函数

4、响应式：进阶
--------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2naicGpsydqibGticRica08ibdxWMrjD7picee2UOt9cg7gtBcL2olGZxbloQ/640?wx_fmt=png)04_响应式进阶

5、生命周期钩子
--------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ25cQc7hhSteMg0uLv6SvPVia7afiaFKUkFGJzZ0WhiaQnL7Y29SJa2icjLw/640?wx_fmt=png)05_生命周期钩子

6、依赖注入
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2Zrz3lsuhoIPUNuRjUsnPX7MJiaTL3eL5tBOsHMJnJJic1SbKniahmD5icA/640?wx_fmt=png)06_依赖注入

四、🌠选项式 API
===========

`选项式API` 即 `options API` 。可能有的小伙伴会觉得它在 `vue2` 项目下会更为常见一些。但在 `vue3` 项目中，也是有一些 `选项式API` 值得我们去挖掘的。那都有哪些内容呢，我们来一探究竟。

1、状态选项
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2LsI0Y3bma6cfiaORukjUHlqibcWwMUxkj0wGrGy80W0W73cY0Wn5MGdQ/640?wx_fmt=png)01_状态选项

2、渲染选项
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2kVv3Fog1OibGMqVMj0dvqJF3pTWsIkcjAH3IibZlhyIwpXRWBAzJkxHQ/640?wx_fmt=png)02_渲染选项

3、生命周期选项
--------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2RtXOW0E38cqG6ibVPNEpJRRxhW6CQSosmVAbtE4ptrr7ZMwywuND8icg/640?wx_fmt=png)03_生命周期选项

4、组合选项
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2iam44tgoN1N0NN2tx22srwbIUQK8cVUM3eIGMNf7kDiaG2GwwUEiawBfQ/640?wx_fmt=png)04_组合选项

5、其他杂项
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2jy1P5RNnAfPFmbWJZ8O3u7cQNAkBn3YQQgtuzHbptMmgv3I7ibAzBZA/640?wx_fmt=png)05_其他杂项

6、组件实例
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2jq1De75fnJgibYGZAtx4N0eJHNr7fCoPHVG3TMF228XV9ibzne4zvB6Q/640?wx_fmt=png)06_组件实例

五、🏕内置内容
========

`vue3` 的内置内容包括**指令**、**组件**、**特殊元素 element** 和**特殊属性 attributes**。如果要谈在什么场景下会用到内置内容，那周一可能觉得，在一般的 `vue` 项目开发中，基本都会用到**内置内容**。较为常见的是用 v-if 和 v-else-if 来判断什么时候显示某个组件，什么时候不显示某个组件。

还有像 `v-model` 、`v-on` 和 `v-for` 等指令，都是在 `vue` 项目中非常高频率使用的指令。那 `vue3` 的内置内容都还有哪些东西呢？请看下方介绍。

1、指令
----

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ24TVYr4fzfVQyicxgh4dEn02IDtR4emXUFKshUicsRkGo5bGVllY3OwsA/640?wx_fmt=png)01_指令

2、组件
----

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2WXmTWQOicfZ9I7h1yneSQNS6ZCfRibZDuUwJf5tFrnSYBdxeIvNnyLdQ/640?wx_fmt=png)02_组件

3、特殊元素
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2sz7CByIyajc713EibsNVXBZz3wB2jfia9rO7g5Wx8rIiceToKUiaRj08Bw/640?wx_fmt=png)03_特殊元素

4、特殊属性 Attributes
-----------------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2CibGxzcKMHXyRbtOLHCBvZK4EyEqSXD0ET7jpePxiau4I3HwZe04ejVg/640?wx_fmt=png)04_特殊属性 Attributes

六、📸单文件组件
=========

对于 `vue` 来说，相信大家都会非常熟悉它的组件化思想，似乎有一种理念是：万物皆可组件。那对于一个组件来说，我们都需要了解它的什么内容呢？比如，我们写的 `<template>` 是什么，用 `<script setup>` 和 `<script lang="ts">` 都分别是什么含义，`<style>` 用了 `scoped` 是什么意思，`:slotted` 插槽选择器又在什么情况下使用呢？我们一起来一探究竟。

1、SFC 语法定义
----------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2XJ7uN6Lh9awt1ccwEVTDsW8ZLldBsLSTKL4ictyiakShEic9icSQBYLj1g/640?wx_fmt=png)01_SFC 语法定义

2、单文件组件 script setup
--------------------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2lEKkV2aCCLGtibiahEjmEklicpbQG3jWX67DKOrAbEUKHicrtjboRswySg/640?wx_fmt=png)02_单文件组 setup

3、css 功能
--------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2fNWpKqtmibaV2FC6SDP8fsBdia7z3tRZfiaFNBgBpVAgPJdibiciaUxaFJ8w/640?wx_fmt=png)03_CSS 功能

七、📈进阶 API
==========

上面我们了解了 `vue3` 的基础 API，准确来说，上面的 `API` 可以解决实际工作中 `80%` 的问题。那下面，我们就再来看一些较为进阶的 `api` 操作。下面所涉及到的这些 `API` ，更多的是可以在**某些定制化的场景**下，做一些高阶的操作。比如：我们可以在一个 `headless` 组件里，用 `render` 和 `h()` 函数，来渲染自定义的页面。那 `进阶 API` 都还有哪些东西呢，来看下面的内容。

1、渲染函数
------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2prJzoDiaOx5YSaJpgS43jBwSWe94hFvib1pMy7sYKA0YZ0EeEjia27v3Q/640?wx_fmt=png)01_渲染函数

2、服务端渲染
-------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2tP8Hcib3vFI9VKd0njibgOskAe5NqXwYhZrUiaagM0o0mMcXxjichrqCPw/640?wx_fmt=png)02_服务端渲染

3、TypeScript 工具类型
-----------------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ29S4QuyIDmf0VHSuu6UvvFWVzibsoOovkz3Kqolzg9FK3P5oMyCoxYGw/640?wx_fmt=png)03_TypeScript 工具类型

4、自定义渲染
-------

![](https://mmbiz.qpic.cn/mmbiz_png/9hfT9fvicAyAQcVG4QQ8OtGbl5JYSCAQ2qY3F2MfJuicgDru5kGOY4w3xWlWiagd8cABVeQKjklAzCq35xyuPQxFA/640?wx_fmt=png)04_自定义渲染

八、🛒结束语
=======

到这里，我们也就讲完了 `vue3 API` 所有的知识点。个人认为，原理知识的学习，是为了更好地将其运用到项目中。所以在学完以上内容后，不妨可以进一步将其运用到项目里，总结出工作中的最佳实践。

思维导图`github`地址：https://github.com/Jacqueline712/vue3-api