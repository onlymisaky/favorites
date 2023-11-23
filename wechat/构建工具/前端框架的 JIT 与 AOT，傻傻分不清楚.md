> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wumVSSktr_0XCuGTMNp4CQ)

大家好，我卡颂。  

现代前端框架都需要 “编译” 这一步骤，用于：

*   将框架中描述的`UI`转换为宿主环境可识别的代码
    
*   代码转化，比如将`ts`编译为`js`、实现`polyfill`等
    
*   执行一些编译时优化
    
*   代码打包、压缩、混淆
    

`编译`可以选择放在两个时机执行：

*   代码构建时，被称为`AOT`（Ahead Of Time，提前编译或预编译），宿主环境获得的是编译后的代码
    
*   代码在宿主环境执行时，被称为`JIT`（Just In Time，即时编译），代码在宿主环境编译并执行
    

本文会聊聊两者的区别，及前端框架中`AOT`的应用。

AOT 和 JIT 的区别
-------------

`Angular`同时提供这两种编译方案，下面我们用`Angular`举例说明两者的区别。

考虑如下`Angular`代码：

```
import { Component } from "@angular/core";@Component({  selector: "app-root",  template: "<h3>{{getTitle()}}</h3>"})export class AppComponent {  public getTitle() {    return 'Hello World';  }}
```

定义`AppComponent`，最终浏览器（作为宿主环境）渲染的结果为：

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPY5wJz061WUaE0D0QNNt53h1Pl15vukfQ172FgqYpdQqmnicNwjYXK35w/640?wx_fmt=png)

现在将模版中使用的`getTitle`方法修改为未定义的`getTitleXXX`：

```
// 从template: "<h3>{{getTitle()}}</h3>"// 修改为template: "<h3>{{getTitleXXX()}}</h3>"
```

如果使用`AOT`，编译后会立刻报错：

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPYJdI3gdlJlB8RJ8vk0Wu0uGJLD2C6aHiaNAN2VSL4h0P2YKW8vrb1kQQ/640?wx_fmt=png)ERROR occurs in the template of component AppComponent.

如果使用`JIT`，编译后不会报错，代码在浏览器中执行时会报错：

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPYpGgiaiazEVhVWF4OfGn5ThHVRngAAHXXbvApFdkib7t3bpYCaN5Syaqqg/640?wx_fmt=png)ERROR TypeError: _co.getTitleXXX is not a function

造成以上区别的原因是：当使用`JIT`时，构建阶段仅仅使用`tsc`将`ts`编译为`js`并将代码打包。

打包后的代码在浏览器运行后，执行到`Decorator`（上例中的`@Component`语句）时，`Angular的模版编译器`才开始编译`template`字段包含的模版语法，并报错。

当使用`AOT`时，`tsc`、`Angular的模版编译器`都会在构建阶段进行编译，所以会立刻发现`template`字段包含的错误。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPYQ0KLF3TWU5WFqMQLWQgI4fhyS3Miap5zZnConbTLkO50T3xaI1Etytg/640?wx_fmt=png)

除了以上区别外，`JIT`与`AOT`的区别还包括：

*   使用`JIT`的应用在首次加载时慢于`AOT`，因为其需要先编译代码，而使用`AOT`的应用已经在构建时完成编译，可以直接执行代码
    
*   使用`JIT`的应用代码体积普遍大于使用`AOT`的应用，因为在运行时会多出编译器代码
    

基于以上原因，在`Angular`中一般在开发环境使用`JIT`，在生产环境使用`AOT`。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPYsPQmlyoI8YmicDQ5mRYzBMFpqznd9N9VUeUVA4K8YuafGDUtbX8qa1A/640?wx_fmt=png)

从前端框架的角度看 AOT
-------------

可以用两个步骤描述前端框架的工作原理：

1.  根据组件状态变化找到变化的`UI`
    
2.  将`UI`变化渲染为宿主环境的真实`UI`
    

借助`AOT`对模版语法编译时的优化，就能减少步骤 1 的开销。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPYCsREyzE5QJkI1rtttlJcOtVkqkUs2YWpbykiaEHmRmTe0SgBC65aeIg/640?wx_fmt=png)

这是大部分采用模版语法描述`UI`的前端框架都会进行的优化，比如`Vue3`、`Angular`、`Svelte`。

其本质原因在于模版语法的写法是固定的，固定意味着**「可分析」**。

**「可分析」**意味着在编译时可以标记模版语法中的`静态部分`（不变的部分）与`动态部分`（包含自变量，可变的部分），使步骤 1 在寻找变化的`UI`时可以跳过静态部分。

甚至`Svelte`、`Solid.js`直接利用`AOT`在编译时建立了**「组件状态与 UI 中动态部分的关系」**，在运行时，组件状态变化后，可以直接执行步骤 2。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPY10VUbchltGJ8gk1sq8Wic78tHFibibcRTKuVyfZ33MLPonVx2PQxoYTYQ/640?wx_fmt=png)

AOT 与 JSX
---------

而采用`JSX`描述`UI`的前端框架则很难从`AOT`中受益。

原因在于`JSX`是`ES`的语法糖，作为`JS`语句只有执行后才能知道结果，所以很难被静态分析。

为了让使用`JSX`描述`UI`的前端框架在`AOT`中受益，有两个思路：

*   使用新的`AOT`思路
    
*   约束`JSX`的灵活性
    

`React`尝试过第一种思路。`prepack`是`meta`（原`Facebook`）推出的一款`React`编译器，用来实现`AOT`优化。

![](https://mmbiz.qpic.cn/mmbiz_png/5Q3ZxrD2qNBNSjuqJiaq1STTfKNhphoPY9rtQyKsoxd4ExPVDL3NzmukB1vc6iasZWGfWxU0ztU0Vb3I1GDAhrhA/640?wx_fmt=png)

他的思路是：在保持运行结果一致的情况下，改变源代码的运行逻辑，输出性能更高的代码。

即：代码在编译时将计算结果保留在编译后代码中，而不是在运行时才去求值。

比如，如下代码：

```
(function () {  function hello() { return 'hello'; }  function world() { return 'world'; }  global.s = hello() + ' ' + world();})();
```

经由`prepack`编译后输出：

```
s = "hello world";
```

遗憾的是，由于复杂度以及人力成本考虑，`prepack`项目已于三年前暂停了。

`Solid.js`同样使用`JSX`描述视图，他实现了几个内置组件用于描述`UI`的逻辑，从而减少`JSX`的灵活性，使`AOT`成为可能。比如：

`For`替代数组的`map`方法：

```
<For each={state.list} fallback={<div>Loading...</div>}>  {(item) => <div>{item}</div>}</For>
```

`Show`替代`if`条件语句：

```
<Show when={state.count > 0} fallback={<div>Loading...</div>}>  <div>My Content</div></Show>
```

`Switch`、`Match`替代`switch…case`语句：

```
<Switch fallback={<div>Not Found</div>}>  <Match when={state.route === "home"}>    <Home />  </Match>  <Match when={state.route === "settings"}>    <Settings />  </Match></Switch>
```

总结
--

总结一下，前端框架可以从`AOT`中收获很多益处，其中最主要的一条是：

> 减少 “根据`组件状态变化`找到`变化的UI`” 这一步骤的工作量

要实现`AOT`的前提是：组件代码易于分析。

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNBsxuv924G1gCDazaicxKjHiblcTLNHIJXxhEas0FQjX7bAj9JE4RYVt8VAibxw0C3bU2I6ws0oRricmw/640?wx_fmt=gif)

**「分享」**「点赞」******「在看」**是最大支持