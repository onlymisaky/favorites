> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/79w3KPexU2kpOJ0cHv4NoQ)

前言  

欧阳最近找工作面试时总是被问到两个问题：`Vue和React的区别`和`从编译原理的角度来聊聊Vue的template和React的jsx`。面试官问这些问题一般是想了解你对这两个框架的理解，所以这是一个开放性的问题，不同的同学对框架的理解程度不同、侧重点不同，回答出来的答案也不同。这篇文章欧阳将从 Vue 出发来聊聊`Vue和React的区别`，大家有补充的欢迎在评论区提出。

  
简单概述  

==========

先来说说相同点，这个简单，`组件化`、采用`虚拟DOM`、以及都在向`函数式编程`靠拢，具体的表现就是 Vue 推出了 Composition（组合式） API，React 推出了 hooks。

相同点都是一些老生常谈的话题了，我们这篇文章主要来聊聊不同点。关于不同欧阳列出了下面几点：

*   设计理念不同
    
*   Vue 的组件编译后是一个组件对象，而 React 的组件就是一个函数
    
*   diff 优化
    
*   中文文档
    

  
设计理念  

==========

我们先来看一张 React 官网的截图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFsY5mLVGSZThrQbLdLS17To5VdMshk7NTQpTnxGHQiajiaK7WYCCclYRfa6T3lcYNY95C1icoZ95jsiaA/640?wx_fmt=png&from=appmsg)

从这张图中我们可以提取出两个主要信息：`React组件就是函数`、`编写组件的语法是JSX，本质就是Javascript`

我们平时写 React 实际就是在写 JS，这也就是为什么 React 那么灵活的原因。灵活带来的优势就是上限高，劣势就是上手难度相对 Vue 较难。

所以在 React 社区中有高阶组件、compose 函数、纯函数等概念，但是这些概念在 Vue 社区中很少提及。

而 Vue 从出生开始就一直在尽可能的降低前端开发门槛，通过什么方式降低呢？

Vue 内置了很多黑魔法，比如`SFC`、`宏函数`、`指令`、`scoped`等，其中最大的黑魔法就是`单文件组件SFC`。只要我们按照 Vue 的设计规范来，就能轻松的写出漂亮的代码。

同时 Vue 的设计也不会让人反感，因为学习他的这一套东西真的很容易，这也就是为什么很多后端同学写前端都是从 Vue 开始。

也正是因为有这么多黑魔法，所以导致很多同学`一年工作经验用三年`。他们将这些黑魔法当作前端语言中的一部分，离开这些黑魔法后发现自己什么都不懂。

  
组件存在的形式  

=============

从前面的官网截图可以看到 React 中定义一个组件就是在定义一个函数，一个文件里面可以定义多个函数，所以理所应当的在一个文件中可以定义多个组件。

但是在 Vue 中事情就不一样了。

大家都知道在 Vue 中一个`.vue`文件就是一个 Vue 组件，所以想正常的在一个`.vue`文件中定义多个 Vue 组件是不可能的。

大家知道一个 Vue 组件到底是什么样的吗？比如这个子组件`count-child.vue`：

```
<template>  <h1>count的值是: {{ count }}</h1>  <button @click="count++">count++</button></template><script setup lang="ts">import { ref } from "vue";const count = ref(0);</script>
```

很简单！我们直接在父组件里面把他打印出来就知道这个组件到底是什么玩意了，父组件代码如下：

```
<script setup lang="ts">import CountChild from "./count-child.vue";console.log(CountChild);</script>
```

我们来控制台上面看看打印出来的`CountChild`长什么样，如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFsY5mLVGSZThrQbLdLS17ToicQMwBRLQuSCzrLl55iabYSrheMjSrDqGGCrmefvMyeUY3I9aibicic4pKw/640?wx_fmt=png&from=appmsg)

从上图中可以看到 import 导入进来的`CountChild`变量是一个对象，并且对象上面还有一些属性的方法：`render`、`setup`。

在父组件里面`import CountChild from "./count-child.vue"`，这是使用了 import 语法，讲道理子组件里面应该是有 export 的，但是在子组件里面没有看到任何 export 的代码。

其实这些都是 vue-loader 或者 @vitejs/plugin-vue 做的工作，底层还是调用 Vue 暴露出来的编译 API。

经过他们的处理一个. vue 文件就变成了一个组件对象。

所以在 Vue 中组件其实就是对象，只是这个对象中拥有`render`、`setup`等方法。其实我们可以自己手写一个对象，按照 Vue 他的规则去定义对象里面的`render`、`setup`等方法同样可以定义一个 Vue 组件。

正是因为在 Vue 中组件就是对象，所以在 Vue 社区中才很少出现高阶组件、compose 函数、纯函数等概念。因为这些东西都是依赖于函数去实现的，而 React 中组件就是函数。

  
diff 优化  

=============

众所周知每重新渲染一次都会执行一次 diff 算法，如果参与 diff 的 DOM 足够复杂，那么这个 diff 的过程也是很耗时的。

在优化 diff 上面 Vue 和 React 走向了两个极端，Vue 走向了更加细粒度的更新，也就是大名鼎鼎的`靶向更新`，如果你不知道可以看一下我的这篇 [靶向更新](https://mp.weixin.qq.com/s?__biz=MzkzMzYzNzMzMQ==&mid=2247484655&idx=1&sn=440135579d26504e1d9af47ddead9e21&scene=21#wechat_redirect) 文章。而 React 则是引入了`fiber`，采用时间切片的方式进行优化。

那么为什么 React 中没有实现`靶向更新`呢？

原因很简单，因为 Vue 的 template 模版很不灵活，也正是因为不灵活所以可以在编译时就对代码进行分析出哪些节点是动态的。相反在 React 中的 JSX 是相当灵活，想对他进行静态分析很难实现。

  
中文文档  

==========

尤大和大部分 Vue 团队成员都是国人，所以每当英文文档更新后，对应的中文文档就会很快的更新。这对于英文不好的同学是特别友好的，React 虽然也有中文文档，但是相比英文文档来说还是有一些滞后。

  
总结  

========

这篇文章我们分别从设计理念、组件存在形式、diff 优化、中文文档方面聊了一下 Vue 和 React 的区别，欢迎大家在评论区进行补充。