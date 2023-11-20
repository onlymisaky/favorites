> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ENbUHy4xVnmO6o66JjbD7Q)

> ❝
> 
> 作者：前端自学驿站
> 
> https://juejin.im/post/6888102016007176200
> 
> ❞

前言
--

CSS 大家肯定都是会的但是每个人所撑握的情况都不一样，特别是已经工作几年的前辈 (这里指的是我司) 很多 CSS 玩法都不知道，可能他们已经习惯了用组件， 但是面试的时候又不可避免问，所以我整理了下 CSS 比较晦涩难懂的点总结写了这篇文章，在最后也会有些面试中常问的 CSS 相关面试题，看完全文面试就不用慌了😗。

目录👇

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgpfb1jWiaLP12O1aX9MyZD5s27D1zWZjSy9bibAGaytxGhl9TriaqFtPaw/640?wx_fmt=png)

三大特性
----

> ❝
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg): css 大三特性是 css 最重要的部分，可以说如果了解了这三大特性就对 css 撑握了一半，对于属性只不过是记不记的住的事，而这个是重在理解。
> 
> ❞

*   层叠性：css 样式冲突采取的原则（后者覆盖前者)
    
*   继承性：对于部分属性样式会有天生的继承
    
*   优先级：选择器优先级算法
    

### 选择器

> ❝
> 
> 在讲这三个特性之前我们需要来全面了解下选择器。
> 
> ❞

#### 种类

下面我将选择进行划分为三大部分，对于基本选择器我就不说了，主要讲下伪类选择器，组合选择器及它们各自的使用场景。

*   基本选择器
    

*   类名：`.box`
    
*   标签: `div`
    
*   属性: `input[type="eamil"] | a[href*="http://www.beige.world"]`
    
*   ID: `#box`
    

*   伪类选择器
    

*   结构伪类: `:nth-child(n) | :nth-of-type(n) | :hover`
    
*   伪元素: `::before | ::after`
    

*   组合选择器
    

*   相邻兄弟 `A + B`
    
*   普通兄弟 `A ~ B`
    
*   子选择器 `A > B`
    
*   后代选择器 `A B`
    

##### 基本选择器

算了还是讲下属性选择器吧🤔，这个选择器我在项目开发中还是用到过的

直接看例子：

```
/* 匹配包含title属性的a标签 => <a title> */a[title] {color: purple;}  /* 存在href属性并且属性值为"http://beige.world"的<a>标签*//*  <a href="http://beige.world"> */ a[href="http://beige.world"] {color: green;}/* 存在href属性并且属性值包含"baidu"的<a>标签*/ /*    <a href="https://baidu.com/we">   <a href="https://fanyi.baidu.com/we">   <a href="https://pan.baidu.com/we">  */ a[href*="baidu"] {font-size: 20px;}/* 存在id属性并且属性值结尾是"-wrapper"的<div>标签 */ /*    <div id="btn-wrapper">  <div id="menu-wrapper">  <div id="pic-wrapper"> */ div[id$="-wrapper"] {display: flex;}/* 存在class属性并且属性值包含以空格分隔的"logo"的<div>元素 */ /*    <div id="aaa logo">  <div id="bbb logo"> */  div[class~="logo"] { padding: 2px; }
```

##### 伪类选择器

**「结构伪类」**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicg9AgtBMM7k82TTaIEflsCdtkK5sjStoNuo11QQpJBv3G7Kowb71SjWQ/640?wx_fmt=png)

先讲这两比较作用类似的：`nth-child(n) | nth-of-type(n)`

`结构`

```
<ul>  <li>1</li>  <li>    <p>a1</p>    <div>b1</div>    <p>a2</p>    <div>b2</div>  </li>  <li>3</li>  <li>4</li>  <li>5</li></ul>
```

`CSS`

```
ul li:first-child { background-color: lightseagreen;} // 第一个li  =>  <li>1</li>ul li:last-child { background-color: lightcoral;} // 最后一个li =>  <li>5</li>ul li:nth-child(3) { background-color: aqua; } // 第三个li => <li>3</li>uk li:nth-child(2) > div:nth-of-type(1) {background-color: red} // 第二个li下的第一个div(不是div标签的都不算) => <div>b1</div>
```

**「它俩的区别」**

*   `nth-child`  选择父元素里面的第几个子元素，不管是第几个类型
    
*   `nt-of-type`  选择指定类型的元素
    

下面讲讲`nth-child()`, 括号中的公式，这个算是这个选择器的亮点了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgMQoBUlYE7DWiaoYR7eRekRaELMztdVs8mFic6ZFMqsalYnicUDdLgdHtA/640?wx_fmt=png)

*   注意：本质上就是选中第几个子元素
    
*   n 可以是数字、关键字、公式
    
*   n 如果是数字，就是选中第几个
    
*   常见的关键字有 `even` 偶数、`odd` 奇数
    
*   常见的公式如下 (如果 n 是公式，则从 0 开始计算)
    
*   但是第 0 个元素或者超出了元素的个数会被忽略
    

> ❝
> 
> 对于这里面的公式平常也用不到太复杂的，我说下我的技巧：nth-child(3n + 3); 这里的 n 可以看做几个为一组，3 可以看做选这组的第几个。
> 
> 例：nth-child(5n + 3) ：5 个为一组，选一组中的第三个。对于 "-" 号就表示选择的是前面的。
> 
> ❞

##### 组合选择器

> ❝
> 
> 组合选择器本质上就是通过连接符来对两个选择器进行组合
> 
> ❞

*   子选择器 `A > B`
    
*   后代选择器 `A B`
    

上面这两我就不说了，相信大家都用烂了。主要说说下面这两个。

*   相邻兄弟 `A + B`
    
*   普通兄弟 `A ~ B`
    

`结构`

```
<div class="box1">    <div>One</div>    <div>Two!</div>    <div>Three</div>    <p>pppp</p>  </div>  <div class="box2">    <div>One2</div>    <p>pppp1</p>    <div>Two2!</div>    <p>pppp2</p>  </div>
```

`选择器解析`

```
<style>    /*      (+标识)符介于两个选择器之间，当第二个选择器匹配的元素紧跟着第一个元素后面并且它们都是同一个父亲      .box1 div:first-of-type(A元素)      div(B元素)       匹配紧跟着A的B    */    .box1 div:first-of-type+div { color: red; }    .box1 div:first-of-type+p { color: red;}  筛选不到的    /*      (~标识)符介于两个选择器之间，匹配第一个选择器元素后面所有匹配第二个选择器的同层级元素      .box2 div(A元素)      p(B元素)      匹配所有A后面的B    */    .box2 div~p { color: seagreen; }  </style>
```

好了，在讲完这些选择器之后我们来看看它们的使用场景。

组合选择器可以用于：hover 伪类操纵自己包含的子元素及以外的元素。举个例子

```
<div id='a'>元素1  <div id='b'>元素2</div></div><div id='c'>元素3  <div id='b'>元素2</div></div><div>同级元素1</div><div>同级元素2</div><div>同级元素3</div></body>
```

```
#a:hover > #b{....}    #a:hover ~ div{....} // 鼠标停留在a元素的时候让所有同层级元素有某某样式// 防止选择器层级替换了下面的样式#a:hover + #c{....} // 鼠标停留在a元素的时候让同层级中的c元素有某某样式#a:hover + #c > #b{....} //  鼠标停留在a元素的时候让同层级中的c元素下的b元素有某某样式
```

上面这两选择器在做一些特效页的时候应该是会用到的。

#### 综合例子

`效果`

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgrJicYiaicTaMhGj3TceCZY5qWzO6FiaDkByaLsY9W3XjbzD5fe9YUwEicQA/640?wx_fmt=gif)

`结构`

```
<body>  <div class="img-box enter-box"> <!-- 悬浮在这个盒子的时候动态添加enter-box类名 -->    <img src="http://resource.beige.world/imgs/beige.jpg" alt="">    <div class="cover">      <h3>标题名称</h3>      <p class="con">Bei Ge</p>      <p class="brier">这里放内容简介，内容简介,这里放内容简介，内容简介,这里放内容简介，内容简介</p>      <div class="handle"><span>.</span><span>.</span><span>.</span></div>    </div>  </div>  <!-- 其他盒子 -->  <div class="img-box">2</div>   <div class="img-box">3</div>  <div class="img-box">4</div>  <div class="img-box">5</div></body>
```

`样式`

**「布局样式」**

```
<style>     .img-box {      position: relative;      top: 100px;      left: 200px;      z-index: 1;      display: inline-block;      overflow: hidden;      background: #70adc4;      cursor: pointer;      transition: transform .5s, box-shadow .3s;    }    .img-box img {      width: 200px;      height: 200px;      opacity: 1;      float: left;    }  .img-box .cover {      width: 200px;      height: 200px;      padding: 15px;      position: absolute;      box-sizing: border-box;      color: hotpink;    }    .img-box .cover h3 {      margin-top: 10%;      font-size: 24px;      font-weight: bold;      text-shadow: 0 0 2px #ccc;      opacity: 0;      transition: opacity .5s;    }    .img-box .cover .con {      margin: 20px 0;      font-style: italic;      font-weight: bold;      transform: translateX(-150%);    }    .img-box .cover .brier {      font-size: 12px;      transform: translateX(150%);    }    .img-box .cover .handle {      position: absolute;      right: 10px;      bottom: -50px;      font-size: 25px;      transition: bottom 1s;      /* 对于position的过渡动画, 不能用position, 直接用位置属性: left right top bottom */    }  </style>
```

**「定义了一个 animation 动画」**

```
@keyframes textAnimation {      /* 0% {        transform: translateX(150%);      } */      100% {        transform: translateX(0);      }}
```

**「悬浮在盒子设置样式」**

```
.img-box:hover { transform: scale(1.1); box-shadow: 2px 2px 13px 3px #ccc;}.img-box:hover img { opacity: .5;}.img-box:hover .cover h3 {  opacity: 1;}.img-box:hover p { animation: textAnimation .6s ease-out forwards; /* forwards让动画停留在最后一帧 */}.img-box:hover .cover .handle {   bottom: 5px;}.enter-box:hover ~ .img-box {  background-color: transparent;  color: wheat;}.enter-box:hover + .img-box {  color: red;}
```

上面这个例子有些还没有讲，但是相信大家之前也都学过，后文中也会说。主要会说些细节方面的东西。

*   flex(弹性布局）
    
*   transform: translate3D rodate3D
    
*   animation(设定动画)
    
*   3D or 透视 (perspective)
    

这里需要注意在使用伪类 Hover 的注意点，在使用他影响子级元素的时候尽量将选择器写全。例：

先看下效果😗

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgp9kJiajryN4Lezq7QnEfNEzD1LIUMmPJ2O0QmUgPMtr9gfqR0UFROTw/640?wx_fmt=gif)

上面的效果相信大家都能写出来，所以我要讲的肯定不是怎么去实现这个效果，我要说下使用 Hover 时的一些细节。

结构比较简单

> ❝
> 
> flex 类名用于布局实现重置和水平居中，box: 绿色盒子；center: 紫色盒子 inner: 橙黄色盒子
> 
> ❞

```
<div class="box flex">    <div class="center flex">      <div class="inner"></div>    </div></div>
```

我们用了一个`:hover`让鼠标虚浮的时候让盒子变红

```
.box:hover div { background-color: red;}
```

这里有一个问题不知道大家想过没有，为什么我这段代码只让 center 盒子变红了，inner 为什么没有变红呢？？？

> ❝
> 
> 因为 CSS 选择器的优先级！
> 
> ❞

我们在实现的时候一般都会像下面这样写吧，这个时候使用伪类选择器改变元素样式的时候就要注意选择器优先级的问题了。

```
.box .center {      width: 150px;      height: 150px;      background-color: blueviolet;}.box .center .inner {      width: 100px;      height: 100px;      background-color: coral;}
```

这段代码的优先级比 `.box .center`高，所以他也就只能覆盖它了。

```
.box:hover div {       background-color: red;}
```

相信我们很多人如果在写鼠标悬浮大盒子让最里面的`inner`盒子变色的时候，都会这么写吧：

```
.box:hover .inner {       background-color: red;}
```

有用吗？没用！

> ❝
> 
> 注意⚠: 优先级还是没有`.box .center .inner`高。
> 
> ❞

### 层叠性

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgdia8bl3T5cFNj0ibWD5Abm1lA5hPfKQQmjky1Kpv5SBy1F9MMNyabQng/640?wx_fmt=png)

> ❝
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)所谓层叠性是指多种 CSS 样式的叠加。是浏览器处理冲突的一个能力, 如果一个属性通过两个相同选择器设置到同一个元素上，那么这个时候一个属性就会将另一个属性层叠掉
> 
> ❞

*   原则：
    

*   样式冲突，遵循的原则是**「就近原则。」** 那个样式离着结构近，就执行那个样式。
    
*   样式不冲突，不会层叠
    

```
CSS层叠性最后的执行口诀：  长江后浪推前浪，前浪死在沙滩上。
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgsyy0HV6zQVvibr7ncPxJmPXvaX8h10KoYoI5CHY0aOfvtic2UDDh4ywg/640?wx_fmt=gif)

### 继承性

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgW7SiaadaEuB1AXtDrIial06tN4OY7lNiaibiaw7OmkdqGFFAjwz3NKicXQBg/640?wx_fmt=png)

> ❝
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)：子标签会继承父标签的某些样式，如文本颜色和字号。想要设置一个可继承的属性，只需将它应用于父元素即可。简单的理解就是： 子承父业
> 
> ❞

CSS 继承性口诀： 龙生龙，凤生凤，老鼠生的孩子会打洞

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgibrxqoUXeVGat9SZTxiaaM28AxKH3KwckrSibKzc7icMso13jYZupqEfaw/640?wx_fmt=gif)

我们恰当地使用继承可以简化代码，降低 CSS 样式的复杂性。比如有很多后代元素都需要某个样式，可以给父级指定一个，这些孩子继承过来就好了。

注意点：

1.  在 CSS 的继承中不仅仅是儿子可以继承, 只要是后代都可以继承
    

##### 可继承的属性

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicguAR7XxRLTxILNmbsj9pfEia7JIicns45qfk82hDr0eUxaLibCAYia5gPvg/640?wx_fmt=png)

##### 控制继承

> ❝
> 
> 对于天生自带的继承属性我们可以控制它是否需要继承
> 
> ❞

四个属性

*   `inherit`: 被应用属性继承父级的该属性（默认就是该值）
    
*   `initial`初始化，把应用属性初始为它默认的样式，并且排除继承的干扰（默认会继承的属性也不在默认继承，而是表现出没有任何设置时候的默认样式）
    
*   `unset`：意思是恢复其原本的继承方式。对`color`属性而言，就相当于`inherit`；而对于诸如`border`这样默认不继承的属性，就相当于`initial`。
    
*   `revert`: 效果等同于`unset`且浏览器支持有限，这里不做演示
    

`效果图`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgfiaSxFQTz7tibesweiaREdPWmcmbJKCnicjzvQjCEJicefzIrZMgwfwtf8g/640?wx_fmt=png)

`演示`

```
<ul style="color: green;">    <li class="default">Default <a href="#">link</a> color</li>    <li class="inherit">Inherit the <a style="color: inherit;" href="#">link</a> color</li>    <li class="initial">Reset the <a style="color: initial;" href="#">link</a> color</li>    <li class="unset">Unset the <a style="color: unset;" href="#">link</a> color</li></ul>
```

*   default 中的 a 标签没有写默认为`inherit`属性，但是使用了浏览器预设样式表：可以理解为浏览器帮我们为`<a>`写了个 style，其优先级自然就高于其父元素了。
    
*   inherit 中的 a 标签在行内写了 inherit，于是使用其父（或祖父，etc）元素的颜色值，在这里是绿色；
    
*   initial 中的 a 标签使用 color 属性初始值（黑色), 注意不要混淆属性初始值和浏览器样式表指定值，样式预设表是浏览器事先写好的样式，但是我 color 默认值就是黑色啊。
    
*   unset，意思是恢复其原本的继承方式。对 color 属性而言，就相当于 inherit；而对于诸如 border 这样默认不继承的属性，就相当于 initial。
    

如果我们需要控制元素所有属性的继承使用 all 属性

```
.inherit a { all: initial;  /* 将所有的属性都恢复成默认值(天生继承也不再继承) */    /* 行内设置过的除外：你的层级干不过人家 */}
```

##### 继承的权重是 0

这个不难，但是忽略很容易绕晕。其实，我们修改样式，一定要看该标签有没有被选中。

（1） 如果选中了，那么以上面的公式来计权重。谁大听谁的。（2） 如果没有选中，那么权重是 0，因为继承的权重为 0.

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicghqW72VHFhnv78skja1qgIXwZHBxiaZe3iacSW4k7D2CspMXMAhhu2AlA/640?wx_fmt=png)

控制继承在我们封装自己的组件的时候是会用到的，我们在封装组件需要沿用样式，有些默认情况下不可继承父元素的属性：box-sizing，这个其实用的就很多。

### 优先级

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgbLvkMcOwYxH55m9HPibnmFTvm1W5hqzE9jMK9LqBKJSQav6cS8ibLr2Q/640?wx_fmt=png)

> ❝
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)要想了解优先级，肯定得了解选择器；但是选择器非常多的，前面列举的是日常开发用的比较多，其他的你可能一辈子都用不到，这里贴出 C1~C4 的选择器，感兴趣的同学可以看看。
> 
> ❞

定义 CSS 样式时，经常出现两个或更多选择器应用在同一元素上，此时，

*   选择器相同，则执行层叠性（后者覆盖前者)
    
*   选择器不同，就会出现优先级的问题。
    

#### 权重计算公式

> ❝
> 
> 关于 CSS 权重，我们需要一套计算公式来去计算，这个就是 CSS Specificity（特殊性）
> 
> ❞

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">标签选择器</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">计算权重公式</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">继承或者 *</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">0,0,0,0</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">每个元素（标签选择器）</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">0,0,0,1</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">每个类，结构伪类 (如: hover)</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">0,0,1,0</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">每个 ID</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">0,1,0,0</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">每个行内样式</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1,0,0,0</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">h1 + p::first-line</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">0,0,0,3</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">li &gt; a[href*="beige.world"] &gt; .inline-warning</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">0,0,2,2</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">每个! important &nbsp;重要的</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">∞ 无穷大</td></tr></tbody></table>

** 值从左到右，左面的最大，一级大于一级，数位之间没有进制，级别之间不可超越。**

**「常用的选择器记法」**：

*   行内: 1,0,0,0
    
*   #id: 0,1,0,0
    
*   .class | :hover | :nth-child(): 0,0,1,0 (:hover 这种一个冒号叫结构伪类)
    
*   ::after | ::before | ::first-line: 0,0,0,1 (这种两冒号的叫伪元素，在书写的时候虽然你可以写一个冒号但是浏览器还是给你补上去了，本质上就是两冒号)
    

#### 权重叠加

> ❝
> 
> 我们经常用组合选择器，是有多个基础选择器组合而成，那么此时，就会出现权重叠加。
> 
> ❞

就是一个简单的加法计算

*   div ul  li   ------>      0,0,0,3
    
*   .nav ul li   ------>      0,0,1,2
    
*   a:hover      -----—>   0,0,1,1
    
*   .nav a       ------>      0,0,1,1
    

> ❝
> 
> 注意⚠: 数位之间没有进制 比如说：0,0,0,5 + 0,0,0,5 = 0,0,0,10 而不是 0,0, 1, 0， 所以不会存在 10 个 div 能赶上一个类选择器的情况。
> 
> ❞

**「important 适用优先级」**💡

```
#id .box div {    color: red !important;}#id div.box div {    color: green !important; // 使用这个选择器中的颜色}
```

### 通关答题

> ❝
> 
> 下面来几道题，全对才算通过了噢😗
> 
> ❞

```
<style type="text/css">  .c1 .c2 div{      color: blue;  }  div #box3 {      color:green;  }  #box1 div {     color:yellow;  }</style></head><body><div id="box1" class="c1">  <div id="box2" class="c2">    <div id="box3" class="c3">      文字    </div>  </div></div></body>
```

什么颜色??

> ❝
> 
> yellow 上面两选择器的层级都是一样的, 后者覆盖前者
> 
> ❞

```
<style type="text/css">  #father #son{     color:blue;  }  #father p.c2{     color:black;  }  div.c1 p.c2{      color:red;  }  #father{    color:green !important;  }</style></head><body><div id="father" class="c1">  <p id="son" class="c2">    试问这行字体是什么颜色的？  </p></div></body>
```

> ❝
> 
> blue
> 
> ❞

```
<body>  <style>    div.parent {      width: 300px;      height: 300px;      border: 10px solid #000;      font-size: 46px;      text-shadow: 3px 13px 4px green;      box-sizing: border-box    }    div.child {      width: 200px;      height: 200px;      background-color: brown;      border: 5px solid #000;      width: inherit;      box-sizing: inherit;      font-size: 80px;    }  </style></head>  <div class="parent">    <div id="child" class="child">123</div>  </div>  <!--     child: 字体多大? 有没有文字阴影? 真实内容的宽高是多少?   --></body>
```

> ❝
> 
> 字体：80，有文字阴影，真实内容的宽：290px 高 190px
> 
> ❞

讲下这最后一题

文字阴影有：因为从父元素中继承到了, 字体: 80px;

真实内容宽 290px, 高 190px

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgeS2f1Y9PNcSAscDICygTG6YtuccyOEvEBj8iaoSYsFkXryHWDRs9Yibg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgv4aENVc3Z85unN6wnuN6JGRT8ZT1icibFCDIFWCib5mx5weFkiaoQD819A/640?wx_fmt=png)

常问的属性
-----

*   flex(弹性布局）
    
*   transform: translate3D rodate3D
    
*   animation(设定动画)
    
*   3D or 透视 (perspective)
    

### flex

> ❝
> 
> flex 布局相信大家也都用烂了，用来让盒子垂直和水平居中好用的一批
> 
> ❞

#### 父项常用属性

*   flex-direction：设置主轴的方向
    
*   justify-content：设置主轴上的子元素排列方式
    
*   flex-wrap：设置子元素是否换行
    
*   align-content：设置侧轴上的子元素的排列方式（多行）
    
*   align-items：设置侧轴上的子元素排列方式（单行）
    
*   flex-flow：复合属性，相当于同时设置了 flex-direction 和 flex-wrap
    

**「flex-direction」**

在 flex 布局中，是分为主轴和侧轴两个方向，同样的叫法有 ：行和列、x 轴和 y 轴

*   默认主轴方向就是 x 轴方向，水平向右
    
*   默认侧轴方向就是 y 轴方向，水平向下
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgia1QdxWLe2OJTdVibcxePNJicohstxibUU1Eph5C7h5p7Z1Xfsrve5LCVA/640?wx_fmt=jpeg)

> ❝
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)：主轴和侧轴是会变化的，就看 flex-direction 设置谁为主轴，剩下的就是侧轴。而我们的子元素是跟着主轴来排列的
> 
> ❞

**「flex-wrap 设置是否换行」**

*   默认情况下，项目都排在一条线（又称” 轴线”）上。flex-wrap 属性定义，flex 布局中默认是不换行的。
    
*   nowrap 不换行
    
*   wrap 换行
    

**「justify-content 设置主轴上的子元素排列方式」**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgSGicACGmMKjaZ6vfzABiaGHuNrWD91tjzCEHrYOuYkls7Rkia5prCfBKQ/640?wx_fmt=jpeg)

**「效果图」**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgI3gn5mhZ53xXJDdR8N8Z1X53jYfiaXhPfVZ7Cnxj3JFp4udWs4Hb1mA/640?wx_fmt=png)   ![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgictWmXib8AX0x52RMRucJicRZZmoMjtvX6ZT4btr6gZFhhRWyOI8iaSYXQ/640?wx_fmt=png)  
![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgSCfHUDrqialSGic8IicQJratux6voMibjPowS00aKjibPtpKBAs9AGMFz2g/640?wx_fmt=png) ![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgrO4DA2cg42PTG3H94r7URRBIwoIzR1hzLt4Mm3ib0AP8QvxYSJ2wRWw/640?wx_fmt=png)

这里讲下`space-around`和`space-evenly`

*   space-around：项目之间的间距为左右两侧项目到容器间距的 2 倍。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgkialb1QdDZ0TSchZHHsf7ZUzASK0BuBxpQDxJpqMia0dCpQ28cwbsT6A/640?wx_fmt=png)

*   space-evenly：项目两侧之间的间距与项目与容器两侧的间距相等，相当于除去项目宽度和容器和项目的两侧间距，剩下的平均分配了剩余宽度作为项目左右 margin。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgDK1R3DJujUuwvJXOxgjZ9aibZ1jibR52SeibSMTuffagfKtGklqAOR4Mw/640?wx_fmt=png)

** 设置侧轴上的子元素排列方式：align-items(单行)/align-content(多行) **

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgKPsUvPSMgAsPtGVUeA3vzgpj5gIEtAd6tJeXPoTQ7vbwPOrqibx93fQ/640?wx_fmt=png)

> ❝
> 
> ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)上图写能`设置多行`只能用于子项出现 换行 的情况（多行），在单行下是没有效果的。
> 
> ❞

效果跟上面是一样的只不过是方向换了，上面是元素在主轴上排列，这个是在侧抽上，至于侧轴是不是 Y 轴就看你的`flex-direciton`怎么设置的了

#### 子项常见属性

*   flex(复合属性): 默认: flex: 0 1 auto;
    

*   flex-grow
    
*   flex-shrink
    
*   flex-basis
    

*   align-self：控制子项自己在侧轴的排列方式
    
*   order：定义子项的排列顺序 (前后顺序), 0 是第一个
    

**「flex-grow」**

> ❝
> 
> 默认 0，用于决定项目在有剩余空间的情况下是否放大，默认不放大；注意，即便设置了固定宽度，也会放大。
> 
> ❞

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgxVdkRDUd30lEA0icg1UicmwichXLHVH9Qia0HXBMb4q3zAj7I0siavb9Ikg/640?wx_fmt=png)

假设第一个项目默认为 0，第二个项目为 flex-grow:2，最后一个项目为 1，则第二个项目在放大时所占空间是最后项目的两倍。

可以这么理解:

*   flex: 1 => 在剩余的空间里我就占一份
    
*   flex: 2 => 在剩余的空间里我就占两份
    
*   flex: 3 => 在剩余的空间里我就占三份
    

```
假设三个盒子分别都设置了上面的属性: 那就将剩余空间分成6份, 各占自己的份数

假设前两个没有设置, 就最后一个设置了flex: 3 === flex: 1, 那就将剩余空间都给它
```

**「flex-shrink」**

> ❝
> 
> 默认 1，用于决定项目在空间不足时是否缩小，默认项目都是 1，即空间不足时大家一起等比缩小；注意，即便设置了固定宽度，也会缩小。但如果某个项目 flex-shrink 设置为 0，则即便空间不够，自身也不缩小。
> 
> ❞

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgWwy7FvKBXziawtxqJYGvwJtm1ysst7aUpzjTnnFeJDtQ8miaOaVfN73A/640?wx_fmt=gif)

上图中第二个项目 flex-shrink 为 0，所以自身不会缩小。

**「flex-basis」**

> ❝
> 
> 默认 auto，用于设置项目宽度，默认 auto 时，项目会保持默认宽度，或者以 width 为自身的宽度，但如果设置了 flex-basis，权重会 width 属性高，因此会覆盖 widtn 属性。
> 
> ❞

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgEiaWib9qB0U1fXFfT2RjN4zoajXsIGkDLO2QSpLRkJSFqo4LtDVjBUwA/640?wx_fmt=png)

上图中先设置了 flex-basis 属性，后设置了 width 属性，但宽度依旧以 flex-basis 属性为准。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)注意: 如果当容器中有多个盒子并且还宽度 100%,  flex-basis 会被影响, 如下图

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgFYHsLDGx5ffMqianl2GicpUiba3BRACHWvYU8tV2w38NcA1MwZMDhzYag/640?wx_fmt=png)

解决办法就是在我们设置`flex-basis`宽度时, 最好给他设置`flex-shrink`为 0 不缩放

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicggh2PSbdsesVXdcbZpx04icKJa3bBNcD0WUcJIoSnpS8CmFvXQKOFiaQw/640?wx_fmt=png)

### transform

2D 的属性相信大家都会用了, 本文主要深究 transform 的 3D 属性

*   透视：`perspctive`
    
*   3D 呈现：`transfrom-style`
    
*   3D 位移：`translate3d(x, y, z)`
    
*   3D 旋转：`rotate3d(x, y, z)`
    

#### 透视 (perspective)

> ❝
> 
> 在讲 3D 之间先来了解一下透视 (视距)，只有了解了透视我们才能理解 3D 的物体投影在 2D 平面上
> 
> ❞

*   透视也称为视距，所谓的视距就是人的眼睛到屏幕的距离
    
*   实际上模仿人类的视觉位置，可视为安排一直眼睛去看
    
*   距离透视点越近的在电脑平面成像越大，越远成像越小
    
*   透视的单位是像素
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0P7390MI1IkYGXrFneiaZKicgoYY8v2dtRqnUAnN0IXbcdHoicuib6IpSArtibYiamhcGgS1esVYCRyFxjQ/640?wx_fmt=jpeg)注意: 透视需要写在被视察元素的父盒子上面

拿图说话👇

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgMlzOZ11uy0ugdZQbxc91wXVMolaUNnWC4Sk5C8aqjzt863MC8zoPvw/640?wx_fmt=png)

*   d：就是视距，视距就是指人的眼睛到屏幕的距离
    
*   z：就是 z 轴，z 轴越大 (正值)，我们看到的物体就越大
    

来个栗子🌰

```
给实例的父元素设置: perspective: 200px;
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicg10X1Ec8Ems5HuaVaYaibcqq7zqvEEjYibOGIPtjXv49Czhq5K7IuSaAA/640?wx_fmt=png)

上面我们在 div 的父盒子上设置了`perspective`，也就是说从 3D 成像的角度来讲我们人眼距离屏幕 div 是 200 的视距，translate3D 设置 Z 轴让 div 往前挪了 100，视距变小距离我们人眼距离也就越小，所以看到的 div 也就变大了。（可以想像成在 500 米远看见的人， 和 5 米看见的人。）

#### translate3d(x, y, z)

**「3D 的特点」**

*   近大远小
    
*   物体和面遮挡不可见
    

**「三维坐标系」**

*   x 轴：水平向右  -- **「注意：x 轴右边是正值，左边是负值」**
    
*   y 轴：垂直向下  -- **「注意：y 轴下面是正值，上面是负值」**
    
*   z 轴：垂直屏幕  --  **「注意：往外边的是正值，往里面的是负值」**
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgpwZicwRw1Tu0xiaicic1RQAo9PRr6PbYuJT6ChW3DE6IFkpMDSpktftFaw/640?wx_fmt=png)

#### `3D` 呈现 transform-style

transform-style：控制子元素是否开启三维立体环境，代码写给父级，但是影响的是子盒子

*   `transform-style: flat`  代表子元素不开启 `3D` 立体空间，默认的
    
*   `transform-style: preserve-3d` 子元素开启立体空间
    

效果图

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgmqnAdEuzvxxxLXWuQqic7JXNPmFKhib5ibSXzUoz6aWLuKl42ffrQ8HwA/640?wx_fmt=gif)

```
body {  perspective: 500px;}.box {  position: relative;  width: 200px;  height: 200px;  margin: 100px auto;  transition: all 2s;  /* 让子元素保持3d立体空间环境 */  transform-style: preserve-3d;}.box:hover {  transform: rotateY(60deg);}.box div {  position: absolute;  top: 0;  left: 0;  width: 100%;  height: 100%;  background-color: pink;}.box div:last-child {  background-color: purple;  transform: rotateX(60deg);}
```

#### rotate3d(x, y, z)

> ❝
> 
> 3D 旋转指可以让元素在三维平面内沿着 x 轴、y 轴、z 轴 或者自定义轴进行旋转
> 
> ❞

*   transform: rotate3d(x, y, z, 45deg)` -- 沿着自定义轴旋转 45 deg 为角度
    

例子：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicgXBxEkKHBj5uIqicvVTBv8AqictGb52SzwmG0J14QWlibB7hUnk0QMBXow/640?wx_fmt=gif)

```
<ul> <li>  <div class="box">  <div class="front">公众号:</div>  <div class="bottom">前端自学驿站</div>  </div> </li></ul>
```

```
ul li { float: left; margin: 0 5px; width: 120px; height: 35px; list-style: none; /* 一会我们需要给box 旋转 也需要透视 干脆给li加 里面的子盒子都有透视效果 */ perspective: 500px;}.box { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: all .4s;}.box:hover { transform: rotateX(90deg);}.front,.bottom { position: absolute; left: 0; top: 0; width: 100%; height: 100%;}.front { background-color: pink; z-index: 1; transform: translateZ(17.5px);}.bottom { background-color: purple; /* 这个x轴一定是负值 */ /* 我们如果有移动 或者其他样式，必须先写我们的移动 */ transform: translateY(17.5px) rotateX(-90deg);}
```

### animation

> ❝
> 
> 动画 (animation) 是 `CSS3` 中最具颠覆性的特征之一，可通过设置多个节点来精确的控制一个或者一组动画，从而实现复杂的动画效果, 先定义动画在调用定义好的动画
> 
> ❞

#### 动画序列

> ❝
> 
> 0% 是动画的开始，100 % 是动画的完成，这样的规则就是动画序列
> 
> ❞

*   在 @keyframs 中规定某项 CSS 样式，就由创建当前样式逐渐改为新样式的动画效果
    
*   动画是使元素从一个样式逐渐变化为另一个样式的效果，可以改变任意多的样式任意多的次数
    
*   用百分比来规定变化发生的时间，或用 `from` 和 `to`，等同于 0% 和 100%
    

```
@keyframes move{ 0% {  transform: translate(0px) } form {  transform: translate(0px) }  100% {  transform: translate(500px, 0) } to {  transform: translate(500px, 0) }}
```

#### 动画常见属性

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgrgZxWeFw2D0ibDx0Gee9D0vibb7E6t1uqXgtbgB9QZFT0hzeMgNK7NUA/640?wx_fmt=png)

动画简写方式

```
/* animation: 动画名称 持续时间 运动曲线 何时开始 播放次数 是否反方向 起始与结束状态 */animation: name duration timing-function delay iteration-count direction fill-mode
```

除了名字，持续时间，何时开始有严格顺序要求其它随意

#### CSS 实现扫描二维码

**「效果」**

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/udZl15qqib0P7390MI1IkYGXrFneiaZKicggJ8LZUXia57GgLGxDjd14ibAWZkadxM2Ygrwznwen4DljZn4cI3qsqtQ/640?wx_fmt=gif)

代码篇幅过长我放到 gitHub 仓库了，大家可以 pull 下来自行研究。

地址：https://github.com/it-beige/blog

面试常问题
-----

### BFC 相关

> ❝
> 
> BFC(Block formatting context) 直译为 "块级格式化上下文"。
> 
> ❞

在讲 BFC 之前得先说下 display 的属性值，只有它符合成为条件才资格触发 BFC 机制

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicg1HmsuOel5Ek4klRdnWnFGYXReFdbibjn31LA0rEIbLm1zF7QIszJjEQ/640?wx_fmt=png)display 属性值

#### 那些属性值会具有 BFC 的条件

> ❝
> 
> 不是所有的元素模式都能产生 BFC，w3c 规范：display 属性为 block, list-item, table 的元素，会产生 BFC.
> 
> ❞

大家有没有发现这个三个都是用来布局最为合理的元素，因为他们就是用来可视化布局。注意其他的，display 属性，比如 line 等等，他们创建的是 IFC ，我们下面研究。

这个 BFC 有着具体的布局特性：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgIwQ9P71l2eW45S96nJfWHxvRKE1JlyKRTvjIyJ5Yhm4zppQFTt8Xww/640?wx_fmt=png)

有宽度和高度，有 外边距 margin  有内边距 padding 有边框 border。就好比，你有了练习武术的体格了。有潜力，有资质。

#### 什么情况下可以让元素产生 BFC

以上盒子具有 BFC 条件了，就是说有资质了，但是怎样触发才会产生 BFC，从而创造这个封闭的环境呢？

就好比，你光有资质还不行，你需要一定额外效果才能出发的武学潜力，要么你掉到悬崖下面，捡到了一本九阴真经，要么你学习葵花宝典，欲练此功必先....

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicg2kqerUvqtyF2tibgKoSKGDaJjCArgASkHWYLI8bEIZ1O3ecxic7mtv0w/640?wx_fmt=png)

同样，要给这些元素添加如下属性就可以触发 BFC。

*   float 属性不为 none
    
*   position 为 absolute 或 fixed
    
*   display 为 inline-block, table-cell, table-caption, flex, inline-flex
    
*   overflow 不为 visible。
    

#### BFC 元素所具有的特性

BFC 布局规则特性：

*   在 BFC 中，盒子从顶端开始垂直地一个接一个地排列
    
*   盒子垂直方向的距离由 margin 决定。**「属于同一个 BFC 的两个相邻盒子的 margin 会发生重叠」**
    
*   在 BFC 中，每一个盒子的左外边缘（margin-left）会触碰到容器的左边缘 (border-left)（对于从右到左的格式来说，则触碰到右边缘）。
    

*   BFC 的区域不会与浮动盒子产生交集，而是紧贴浮动边缘。
    
*   计算 BFC 的高度时，自然也会检测浮动或者定位的盒子高度
    

它是一个独立的渲染区域，只有 Block-level box 参与， 它规定了内部的 Block-level Box 如何布局，并且与这个区域外部毫不相干。

```
白话文： 孩子在家里愿意怎么折腾都行，但是出了家门口，你就的乖乖的，不能影响外面的任何人。
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgdX31kIY76K04Ifkz9kjxBGUSXQtBJGBCpKZmTBVuOKI1jKZTJnnApg/640?wx_fmt=png)

#### BFC 的主要用途

**「(1) 清除元素内部浮动」**

只要把父元素设为 BFC 就可以清理子元素的浮动了，最常见的用法就是在父元素上设置 overflow: hidden 样式

主要用到

```
计算BFC的高度时，自然也会检测浮动或者定位的盒子高度。
```

**「(2) 解决外边距合并 (塌陷) 问题」**

主要用到

```
盒子垂直方向的距离由margin决定。属于同一个BFC的两个相邻盒子的margin会发生重叠
```

属于同一个 sBFC 的两个相邻盒子的 margin 会发生重叠，那么我们创建不属于同一个 BFC，就不会发生 margin 重叠了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgJu3xibE7YuAn0PZAHtpmOticXuE2iaHQQ1TLNNL5B620AfP4Micibwm8mNg/640?wx_fmt=png)

**「(3) 制作右侧自适应的盒子问题」**

主要用到

```
普通流体元素BFC后，为了和浮动元素不产生任何交集，顺着浮动边缘形成自己的封闭上下文
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0P7390MI1IkYGXrFneiaZKicgUdQtgG0Dyte5ywXfmY8047PiaOpwC7VvibIEdia5GJ4HCgqmYzx2hiciccw/640?wx_fmt=png)

**「BFC 总结」**

BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素。反之也如此。包括浮动，和外边距合并等等，因此，有了这个特性，我们布局的时候就不会出现意外情况了。

### IFC 相关

> ❝
> 
> IFC（inline Formatting Context）叫做 “行级格式化上下” 相对 BFC 比较简单且问的也不是很多，这里大该做个了解
> 
> ❞

布局规则如下：

*   内部的盒子会在水平方向，一个个地放置 (默认就是 IFC)；
    
*   IFC 的高度，由里面最高盒子的高度决定 (里面的内容会撑开父盒子）；
    
*   当一行不够放置的时候会自动切换到下一行；
    

哪些属性开启了性能加速
-----------

> ❝
> 
> 何为硬件加速：就是将浏览器的渲染过程交给 GPU(Graphics Processing Unit) 处理，而不是使用自带的比较慢的渲染器。这样就可以使得`animation`与`transition`更加顺畅
> 
> 我们可以在浏览器中用 CSS 开启硬件加速，使 GPU 发挥功能，从而提升性能
> 
> ❞

所谓 GPU，就是图形处理器的缩写，相当于 PC 中的显卡。手机中的 GPU 也是为了对图形、图像处理而存在的，所谓强制渲染，就是 hwa（hardware acceleration 硬件加载）的一种，其存在的意义就是为了分担 cpu 的负担，其原理是通过 GPU 对软件图形的处理来减轻 CPU 的负担。从而使应用软件能够以更快的速度被处理，以达到提速的目的。

#### 硬件加速的原理

> ❝
> 
> 浏览器接收到页面文档后，会将文档中的标记语言解析为 DOM 树。DOM 树和 CSS 结合后形成浏览器构建页面的渲染树。渲染树中包含大量的渲染元素，每个渲染元素会被分到一个图层中，每个图层又会被加载到 GPU 形成渲染纹理，而图层在 GPU 中 transform 是不会触发 repaint 的，最终这些使用 transform 的图层都会由独立的合成器进程进行处理, CSS transform 会**「创建了一个新的复合图层，可以被 GPU 直接用来执行 transform 操作」**。
> 
> ❞

**「浏览器什么时候会创建一个独立的复合图层呢？事实上一般是在以下几种情况下：」**

*   3D 或者 CSS transform
    
*   `<video>`和`<canvas>`标签
    
*   `css filters(滤镜效果)`
    
*   元素覆盖时，比如使用了 z-index 属性
    

#### 为什么硬件加速会使页面流畅

> ❝
> 
> 因为 transform 属性不会触发浏览器的 repaint（重绘），而绝对定位 absolute 中的 left 和 top 则会一直触发 repaint（重绘）。
> 
> ❞

#### 为什么 transform 没有触发 repaint 呢？

> ❝
> 
> 简而言之，transform 动画由 GPU 控制，支持硬件加载，并不需要软件方面的渲染。**「并不是所有的 CSS 属性都能触发 GPU 的硬件加载，事实上只有少数的属性可以，比如 transform、opacity、filter」**
> 
> ❞

#### 如何用 CSS 开启硬件加速

> ❝
> 
> CSS animation、transform 以及 transition 不会自动开启 GPU 加速，而是由浏览器的缓慢的软件渲染引擎来执行，那我们怎样才可以切换到 GPU 模式呢，很多浏览器提供了某些触发的 CSS 规则。
> 
> ❞

当浏览器检测到页面中某个 DOM 元素应用了某些 CSS 规则时就会开启，最显著的特征的元素是 3D 变化。

```
.cube{    translate3d(250px,250px,250px);    rotate3d(250px,250px,250px,-120deg)    scale3d(0.5,0.5,0.5);}
```

> ❝
> 
> 可能在一些情况下，我们并不需要对元素应用 3D 变幻的效果，那怎么办呢? 这时候我们可以使用 “欺骗” 浏览器来开启硬件加速。虽然我们可能不想对元素应用 3D 变幻，可我们一样可以开启 3D 引擎。例如我们可以用`transform:translateZ(0)`; 来开启硬件加速
> 
> ❞

```
.cube{   transform: translateZ(0);}
```

写在最后
====

如果文章中有那块写的不太好或有问题欢迎大家指出，我也会在后面的文章不停修改。也希望自己进步的同时能跟你们一起成长。喜欢我文章的朋友们也可以关注一下

我会很感激第一批关注我的人。**「此时，年轻的我和你，轻装上阵；而后，富裕的你和我，满载而归。」**

参考文章
----

CSS 继承控制：inherit、initial 和 unset

一篇文章弄懂 flex 布局