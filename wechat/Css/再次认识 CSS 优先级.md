> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Lzh7gZpZ7pdRJPLZ_dT5-Q)

前言
--

> 温故知新

针对 CSS 优先级，我们的认知可能是这样：内联、CSS 各种选择器、!important，

你是否遇到过优先级覆盖成本太高、优先级无法覆盖等情况？本文将带你重新认识 CSS 优先级。

CSS 优先级
-------

css 优先级分为两大类：继承和级联

### 继承

#### 概念

继承指的是类似 color, font-family, visibility 等属性父元素设置，子元素会被继承的特性。

inherit 关键字可以让元素继承父元素的属性，可以用来覆盖原来的值

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZbXIvYqy363ias2rFb4lBNTcuGmzwQiaf5C4xxn6wdRepCYlBaTdaMTeg/640?wx_fmt=png)

#### 优先级规则

**继承优先级最低；层级越深优先级越高**

思考：文字最终的颜色？

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZt63zSXPodDaSoib36f3Uia6BWicdpAr0jjdHrEnjia7U7wK57AribpZ64Tw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZqX6dUckhY8Ic9bx9PMUUHjzfnpwE7wbSMsgnPzJib0G1tNrNTib0mtFw/640?wx_fmt=png)

### 级联

#### 概念

css 一层层的优先级规则可看作级联（分层 + 嵌套关系称为级联）

#### 层级规范

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZz56XQEZm85OMiblQoUAmyLb3jLBwiatVIcVKupn1baWaysSHBzDumxtQ/640?wx_fmt=png)image.png

1.  Transition 过渡声明
    
2.  设置了 !important 的浏览器内置样式
    
3.  设置了 !important 的用户设置样式
    
4.  @layer 规则中的 !important 样式
    
5.  开发者设置的 !important 的 样式
    
6.  animation 动画
    
7.  开发设置的 css
    
8.  @layer 规则样式
    
9.  用户设置的样式
    

1.  Injected stylesheet：用户设置的 CSS 多指用户安装插件等工具所设置的 CSS（称为 “注入的样式表”）  **常见现象**：在开发过程中遇到页面中某个控件样式异常了（无法正常显示），然后打开浏览器控制面板，发现一大片灰色字体的，并且右上方还写着 injected stylesheet![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZ1uMRYDr9kLFNAnDlIUt3EQuCCccV3u0f7aK0JGAPoQqUfE9jYeVjUw/640?wx_fmt=png)
    
2.  用户通过浏览器自身的设置改变浏览器的主题背景，字号或字体等也可以归为这一类![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZGaW42rGtKJvGhqTNyMUWJphRIKnk4pLSJribQib9nJ4icSP4NKyLenFew/640?wx_fmt=png)
    

11.  浏览器内置样式
    
    user agent stylesheet：用户代理样式，就是浏览器内置的样式
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZbXIvYqy363ias2rFb4lBNTcuGmzwQiaf5C4xxn6wdRepCYlBaTdaMTeg/640?wx_fmt=png)
    

级联中的 @layer
-----------

### 何为 @layer

@layer 声明了一种级联层级，使得开发者可以控制更多层级规则

其兼容性如下：

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZz16lfe6wYXjHlHMOuZ8x4QL31Ew9hGibibvGuBXxb9YHenAzKibL5yeMA/640?wx_fmt=png)

### 诞生背景

我们在实际开发的时候，经常会使用第三方组件。但是这些组件虽然功能是我们需要的，但是 UI 样式却和产品的风格不一致，我们需要对这些组件的 UI 进行重置，换肤，变色什么的。有些 Web 组件甚至还有 CSS reset 代码，而所有的 CSS 在同一个文档流中都公用同一个上下文（无论是 Shadow DOM 还是 iframe 都可以看成是一个独立的上下文），这就导致这些 CSS 代码会影响全局样式。

**@layer 诞生之前，常见** **CSS** **优先级覆盖场景存在各种问题：**

1.  提高 CSS 选择器优先级
    

```
<div class="container">    <div class="some-button">button</div></div>.some-button {    color: 'red'}
```

覆盖后可能是下面这样的，如果场景多了会导致代码变得很臃肿，复杂选择器 会让 css 渲染性能变差：

```
.container .some-button {    color: 'green'}
```

2.  一些特殊伪类优先级很高，难以覆盖
    

例如 any-link 语义好，匹配最精准，且无需担心 `:visited` 伪类的干扰，但优先级较高

```
<a href="xxxx">link</a>
```

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZ40OsyVQ3wTrlDxdRspib9olBaWPm8ueYxzSibqC2LANcJGVzkK1kpNDw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZpAcibmqib42XwR1j0PRBxdtDM598seQDuI6LmhNFicVXBVVspniaAXWfgg/640?wx_fmt=png)

图中我们可以看到 any-link 的优先级最高

3.  !important 可以针对上述情况提升优先级，但是维护困难
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZk2MQgKnWTUaEALng7aYYwjmVRxZxgpRcY5hpsqfSDLniccic00N1lI0w/640?wx_fmt=png)

基于以上场景，@layer 提供了一种更为优雅的方案来 管理 CSS ，下面介绍其使用方法

### 规则

*   `@layer layer-name {rules};`
    
*   `@layer layer-name;`
    

主要是用来灵活设置 @layer 规则和其他 @layer 规则的前后优先级。

*   `@layer layer-name, layer-name, layer-name;`
    

在默认情况下，@layer 规则内 CSS 声明的优先级是按照前后顺序来的

*   `@layer {rules};`
    

优先级低于常规 CSS，详见 层级规范

我们依然举前面的例子，使用 @layer 前 vs 使用 @layer 后，显然 @layer 的管理更灵活，更清晰：

使用 @layer 前![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZfrv54BEmb4UyJkXZiaEgBhIoMamF5ic9GVP2SzEc8VBNnh8wZ78KgNPQ/640?wx_fmt=png)

使用 @layer 后![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZt798BciaKJbOUnwj9MMLKtF88TU0r0PTwK5YUPIBjz514bgB9fKmnjQ/640?wx_fmt=png)

优先级：常规 CSS > @layer![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZL4JBwTEn2zAN25YUG0SS7uiaOHLYaCBORN0A7ZViaTFek758Oh5Jeic6w/640?wx_fmt=png)

### 嵌套

**嵌套越内部优先级越低**

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZTS2PEHD6oBP4XNFicQGY3y773SRdzYVBqalr0cRichARviae2foz5dsPw/640?wx_fmt=png)

内外嵌套语法还可以写成下面这样：

```
@layer btn2 {
  button {   
  }
}

@layer btn2.inner {
}
```

**多嵌套语法下的优先级**

内部的 @layer 的优先级由外部的 @layer 规则决定。

下图中优先级：`btn2` > `inner2` > `btn1` > `inner1`

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZaUOvvmbMecPd8TctxBslDS64o5ZUtFicIufKhMnZjGeFWz4fJiaEaqDw/640?wx_fmt=png)

### 整个 CSS 文件变 @layer

通过以下方式可以让整个 CSS 文件样式优先级降低

```
@import './test.css' layer(some-name);
```

```
<link rel="stylesheet" href="test.css" layer="some-name">
```

### 总结

`@layer` 的诞生，让我们能更好的管理 CSS 样式 / CSS 文件 的优先级，可以最大程度避免选择器、`!important` 的滥用、属于比较重大的一次革新

!important
----------

### 级联中的 !important

上图中已经看到层级规则中带 !important 的存在其规律：

*   层级跃阶
    
*   逆向跃阶
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZbjZmetCia0Uzl1g3UxDAlRIYO9TRUdOps9bRR5UQQ7vWHE3Gz8oSibYA/640?wx_fmt=png) image.png

如果想开发时直接覆盖浏览器内置 !important 或者插件注入样式的 !important，那就放弃吧 😜，层级规则就是如此！

### 避免滥用的几条原则

优先考虑使用样式规则的优先级来解决问题而不是 `!important`

**只有**在需要覆盖全站或外部 CSS 的特定页面中使用 `!important`

**不要**在你的插件中使用 `!important`

**不要**在全站范围的 CSS 代码中使用 `!important`

级联每层级中的优先级
----------

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZAkddphyvIJw5p4fvYwUatQRhkOnfKZicHPuBmBPWyZghOx1x1Vias7mA/640?wx_fmt=png)image.png

**内联 > ID > 类、伪类、属性选择器 > 标签 >** **通配符** **、功能伪类 (不带参数，where 除外)**

总结
--

1.  **所有的优先级遵循以上规则，遇到层级无法覆盖的情况下，请按照上述规则排查。**
    
2.  **@layer 的到来，让层级规范更加丰富，将避免臃肿的** **CSS** **，或将让性能更优**
    
3.  **!important 导致级联层级越阶和逆向越阶，优先级权重发生变化，造成难以维护，要慎用**
    

参考
--

https://segmentfault.com/a/1190000017970486

注释
--

*   css reset，举例：`a { color: blue; }`
    
*   Shadow DOM 可以理解为 DOM 中的 DOM，创建 Shadow DOM 是为了允许在 Web 平台上本地封装和组件化，而不必依赖像
    

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZQVwlyuP1uHn5EYwm5VedZhn9XL4xyAZhwiabaBzn0poA1nicRhmoUn6Q/640?wx_fmt=png)

*   功能伪类，如`:not()、:is()、:where(any-selector)`
    

`:not()`伪类的本身没有优先级，最终优先级是由括号里面的选择器决定的。

![](https://mmbiz.qpic.cn/mmbiz_png/v1qoyIrBu1mAlaRL8y1WIic6VXdoHfHvZK8J6b3lx5LuWITrj0HGje91mSRaAsklZQjYxNd0YDZwmBERKcdPFBg/640?wx_fmt=png)

关于我们
----

我们来自字节跳动，是旗下西瓜视频前端部门，负责西瓜视频的产品研发工作。

我们致力于分享产品内的业务实践，为业界提供经验价值。包括但不限于营销搭建、互动玩法、工程能力、稳定性、Nodejs、中后台等方向。

欢迎关注我们的公众号：xiguafe，阅读更多精品文章。

我们在招的岗位：https://job.toutiao.com/s/B6adncN。招聘的城市：北京 / 上海 / 厦门。

**欢迎大家加入我们，一起做有挑战的事情！**

谢谢你的阅读，希望能对你有所帮助，欢迎关注、点赞~

- END -