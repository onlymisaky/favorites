> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/N7ErRdii1YqrMIfjPSFEFQ)

前言
==

在日常开发中`vue`的模版语法在大多数情况都能够满足我们的需求，但是在一些复杂的业务场景中使用模版语法就有些麻烦了。这个时候灵活的`JSX/TSX`渲染函数就能派上用场了，大多数同学的做法都是将`*.vue`文件改为`*.tsx`或者`*.jsx`文件。其实我们可以直接在`*.vue`文件中直接使用`JSX/TSX`渲染函数。

什么场景需要使用 JSX/TSX 渲染函数
=====================

假设我们现在有这样的业务场景，在我们的页面中有个`list`数组。我们需要去遍历这个数组，根据每一项的 item 去渲染不同的组件。如果 tem 的数据满足条件 A，那么就渲染组件 A。如果 item 的数据满足条件 B，那么就渲染组件 B。如果 item 的数据满足条件 C，那么就渲染组件 C。

如果我们使用 vue 模版语法去实现这个需求，我们的`Page.vue`文件的代码就需要是这样的：

```
<template>  <template v-for="item in list">    <ComponentA v-if="isComponentA(item)" />    <ComponentB v-else-if="isComponentB(item)" />    <ComponentC v-else-if="isComponentC(item)" />  </template></template><script setup lang="ts">import ComponentA from "./component-a.vue";import ComponentB from "./component-b.vue";import ComponentC from "./component-c.vue";const list: Array<number> = [1, 5, 3, 2, 1];const isComponentA = (item): boolean => {  return item % 3 === 0;};const isComponentB = (item): boolean => {  return item % 3 === 1;};const isComponentC = (item): boolean => {  return item % 3 === 2;};</script>
```

这样虽然可以实现功能，但是明显不够优雅，领导 code review 时看了直呼摇头。

在 *.jsx/tsx 文件中使用 JSX/TSX 渲染函数
==============================

此时机智的小伙伴会说，我们可以使用`vue`的`setup`方法使用`JSX/TSX`渲染函数实现。确实可以，我们来看看具体实现的代码：

```
import { defineComponent } from "vue";import ComponentA from "./component-a.vue";import ComponentB from "./component-b.vue";import ComponentC from "./component-c.vue";export default defineComponent({  setup() {    const list = [1, 5, 3, 2, 1, 0];    function renderDataList(data: Array<number>) {      return data?.map((val) => {        if (val % 3 === 0) {          return <ComponentA />;        } else if (val % 3 === 1) {          return <ComponentB />;        } else {          return <ComponentC />;        }      });    }    return () => {      return <div>{renderDataList(list)}</div>;    };  },});
```

首先我们需要将原来的`Page.vue`文件改为`Page.tsx`文件，然后我们需要将原来写在`template`中的代码摞到`setup`中。这种写法有如下几个痛点：由于没有使用`vue`的模版语法，所以`vue`内置的`v-model`等指令和项目中自己封装的指令等都不能使用了，只能使用 js 去自己实现。

按照常规的思维，`setup`直接返回一个值就行了，但是如果你这样写就会收到这样的报错：

[Vue warn]: setup() should not return VNodes directly - return a render function instead.

原因是`setup()` 函数在每个组件中只会被调用一次，而返回的渲染函数将会被调用多次。这样就导致我们的代码只能在外面包裹一层匿名函数:

```
return () => {  return <div>{renderDataList(list)}</div>;};
```

在 *.vue 文件中使用 JSX/TSX 渲染函数
==========================

那么有没有方法可以让我们在使用`JSX/TSX`渲染函数的同时，也可以在`vue`文件中使用模版语法呢？答案是：当然可以！

首先我们需要导入`@vitejs/plugin-vue-jsx`

```
// vite.config.jsimport vue from '@vitejs/plugin-vue'export default {  plugins: [vue()],}
```

然后我们需要将`vue`文件的`script`标签的`lang`设置为`tsx或者jsx`。具体的`Page.vue`代码如下：

```
<template>  <RenderDataList :data="list" /></template><script setup lang="tsx">import ComponentA from "./component-a.vue";import ComponentB from "./component-b.vue";import ComponentC from "./component-c.vue";const list = [1, 5, 3, 2, 1];const RenderDataList = (props: { data: Array<number> }) => {  return props.data?.map((val) => {    if (val % 3 === 0) {      return <ComponentA />;    } else if (val % 3 === 1) {      return <ComponentB />;    } else {      return <ComponentC />;    }  });};</script>
```

在上面这个例子中我们定义了一个`RenderDataList`，然后在`template`中可以直接将`RenderDataList`当作一个组件使用。vscode 也会给出智能提示。  

![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFu6H5HnNgiafXR1bau17OCDQMmicYnOBvrcCwOKFKI2WEopiaDkTRyy03Wv40ibZMlEFCsw9OicMg4JAKg/640?wx_fmt=png&from=appmsg)

在`react`中，这种场景我们可以将`RenderDataList`当作一个函数去使用，然后在模版中直接调用这个函数就行了。但是在`vue`中，`RenderDataList`只能当做一个组件使用，不能当做函数调用。

还有一点需要避坑的是，假如我们的 props 中定义了一个驼峰命名法的变量，例如：`pageNum`。在`template`中传入`pageNum`的时候必须写成`:pageNum="xxx"`，不能写成`:page-num="xxx"`。

总结
==

这篇文件介绍了如何在`*.vue`文件中直接使用`JSX/TSX`渲染函数，只需要导入`@vitejs/plugin-vue-jsx`，然后将`script`标签的`lang`设置为`tsx或者jsx`。就可以在`script`中直接定义组件，然后在`template`中直接使用组件就可以了。这样我们既可以使用`JSX/TSX`渲染函数的灵活性，也可以使用`vue`模版语法中内置的指令等功能。