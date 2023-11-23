> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1cJl2VXHCkG-2rvLqUncmw)

![](https://mmbiz.qpic.cn/mmbiz_png/2MvanVZk2wf1MHJ7iawa0KNC333h1fMIgaVEjMpwvgVSyJFgHiasUjR4fRIicFKkHr4ZkZ11IC4VRLBD73ribATEXQ/640?wx_fmt=png)

点击上方蓝字关注我们，标星不迷路，不错过每一篇用心分享的技术文章哦

  

![](https://mmbiz.qpic.cn/mmbiz_png/Bt0AiaiblzGHzqnvnyzGW4zjLrpWVHoictMf5sqV5dCiblfEBkkFZTbfd6GX3wHIiaiazAmmSSbJWDaDiba8YB3yPV4Gw/640?wx_fmt=png)

`css3`在切图中占有半壁江山的位置，所谓人靠衣装，马靠鞍，一个网站好不好看除了设计本身，合理的布局以及完美`css`布局会让视觉更上一层楼

今天主要分享几个在`css3`中常用的函数，希望看完在项目中有所思考和帮助

正文开始...

#### calc

这是一个计算函数，通常在业务上使用也是非常之多，比如一个场景，一个三栏结构，如果想让内容铺满整个内容，但是头部与底部高度固定

有人说这个布局最简单，首先我想到的就是`flex`，比如你很快像下面这样写

```
<div class="app">  <header>我是Header</header>  <main>这是内容</main>  <footer>这是footer</footer></div>
```

对应的 css 如下

```
* {padding: 0;margin:0;}  html,body {height: 100%;}  .app {      display: flex;      flex-direction: column;      height: 100%;  }  .app header {     height: 50px;     line-height: 50px;     background-color: red;  }  .app main {      flex:1;      background-color: green;  }  .app footer {      height: 80px;      line-height: 80px;      background-color: #111;      color: #fff;  }
```

预览![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILkEns2bgQpwx2lz1as9F8xERSK4FnpILDiaM3oXBHoYpYfrLKZvO5qIQ/640?wx_fmt=png)

有人还想到另一种方式，我用`grid`实现

```
* {padding: 0;margin:0;}html,body {height: 100%;}.app {      height: 100%;      display: grid;      grid-template-columns: 1fr;      grid-template-rows: 50px 1fr 80px;  }  .app header {     line-height: 50px;     background-color: red;  }  .app main {      background-color: green;  }  .app footer {      line-height: 80px;      background-color: #111;      color: #fff;  }
```

张三看到使用`grid`, 嗯，`very good`, 小伙子骨骼惊奇，我再授一种方案

我们知道块级元素文档流是从上往下依次排列的，所以我只需要借助这个特性，并且借助`calc`就可以实现了

*   单独计算`main`中间内容的高度`height: calc(100% - 50px - 80px)`
    

```
* {padding: 0;margin:0;} html,body {height: 100%;}  .app {      height: 100%;  }  .app header {     height: 50px;     line-height: 50px;     background-color: red;  }  .app main {      background-color: green;      height: calc(100% - 50px - 80px);  }  .app footer {      height: 80px;      line-height: 80px;      background-color: #111;      color: #fff;  }
```

嗯，非常不错，小弟甘拜下风。

### attr

`calc`很强大, 但今天有一个`css3`技能必须让你感受她的强大，那就是传说中的`attr`

`attr`这个函数是一个非常有名的函数，那么她可以做什么呢？

在你的业务中，假设你的一个列表中需要展示不同的图标，那么你就可以借助`attr`来巧妙的实现你的需求

```
<head><link rel="stylesheet" href="//at.alicdn.com/t/c/font_3844652_3qxwqjxiuyp.css"> <style>    * {padding: 0;margin:0;}    html,body {height: 100%; }    #app {        height: 100%;    }    #app div::before {        font-family: "iconfont";        content: attr(data-uniCode);    }    </style></head> <body>   <div id="app"></div>  </body> <script>  const app = document.getElementById('app');  const dataSource = [      {          title: "公众号:Web技术学苑",          uniCode: ""      },      {          title: "公众号:前端之巅",          uniCode: ""      },      {          title: "公众号:前端之神",          uniCode: ""      },      {          title: "公众号:itclanCoder",          uniCode: ""      }  ];  let htmlTemplate = "";  dataSource.forEach(item => {      htmlTemplate+=`<div data-uniCode=${item.uniCode}>${item.title}</div>`  });  app.innerHTML = htmlTemplate;</script>
```

我们发现在源数据中，我们使用了`uniCode`，这个`uni-code`实际上就是我们的阿里矢量图标库![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILFcMOAPibTqqyusjs654jC0uqwlwVHq0IPTAdIYiaHLysib7F3mqyicQiarQ/640?wx_fmt=png)预览结果![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILwygtdsQC65Pc0go6PWibDzoyoxsscxTXqRGubu8mnibO8Jnia7Sueia2xQ/640?wx_fmt=png)`attr`是一个很强大的函数，除了在业务中你使用它来加载`unicode`图标, 你也可以用来加载一段文字

```
<div id="app">  <div data-text="Web技术学苑"></div></div>
```

对应的`css`如下

```
<style>  * {padding: 0;margin:0;}  html,body {height: 100%; }  #app {      height: 100%;      display: flex;      flex-direction: column;      justify-content: center;      align-items: center;  }  #app div::before {      content: attr(data-text);      display: block;  }  </style>
```

![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILPS8cgCVUY9TycAOF5YccN3pOp7NVfYQxu54I8LibibFbgJ2icsuc9WwLQ/640?wx_fmt=png)

### var

这是一个`css3`中非常有用的一个函数，通常来讲你想加载 css3 中的变量就必须使用`var`，比如说

```
<div id="app">  <div class="text">Web技术学苑</div></div>
```

对应的`css`如下

```
<style>  * {padding: 0;margin:0;}  html,body {height: 100%; }  :root {      --text-color: red;  }  .text {    color: var(--text-color)  }</style>
```

![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILmbKQBE2gwyuqNM6wZwetXAPKaSYrrmibzvrdkOunG1CBuMqx7OaQg1A/640?wx_fmt=png)`var`函数基本在换肤主题，必然是一个高频函数，因此它是一个很常用的函数

### clamp(min,default,max)

`min`最小值，`default`默认首选值，`max`最大值，当`default`大于`max`, 则会取`max`，当`default`小于`min`时，则会取`min`，当在`min`与`max`之间时，则会取默认值。通常我们可以保证一个元素的最大值与最小值，在这范围内，就获取默认值。

```
<div class="text">    <h1 class="title">Web技术学苑</h1>    <p class="content">hello world</p>  </div>
```

对应的`css`

```
* {padding: 0;margin:0;}html,body {height: 100%; font-size:16px }:root {    --text-color: red;}.text {    color: var(--text-color);    width: min(500px, calc(80% + 100px));    background-color: green;}.text .title {    font-size: clamp(2rem, 2.5vw, 3rem);}.text p.content {    font-size: max(1rem, 2rem);}
```

### repeat

这个函数，如果你有用过`grid`布局，那么一定会有所了解，主要用于在`grid-template-rows`与`grid-template-columns`

```
<div class="text">   <div>1</div>   <div>2</div>   <div>3</div></div>
```

对应`css3`

```
.text {    display: grid;    grid-template-columns: 1fr 1fr 1fr;}.text >div:nth-of-type(2n) {    background-color: red;}
```

换成`repeat`函数

```
.text {    display: grid;    grid-template-columns: repeat(3, 1fr);}
```

### url

这是一个平时用到了但是你肯定没注意的 css 函数，因为你在用背景图片的时候肯定有用到

*   在背景图片上使用
    

```
.text >div.img {  display: block;  height: 800px;  background: url("https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF") no-repeat;}
```

*   在伪类元素上使用 url
    

```
.text >div.img2::before {  content: url("https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF");  display: block;}
```

对应的结构如下

```
<div class="text">    <div class="img"></div>    <div class="img2"></div> </div>
```

fit-content

这个函数在`grid`布局中会有用到，相当于设置最大阀值，你可以把它当成`max-width`或者`max-height`

```
<div class="text">  <div class="cursor">Web TEACH LEARN ARE YOU READLY </div>  <div class="cursor">HELLO WORLD</div>  <div class="cursor">JAVASCRIPT</div></div>
```

对应的`css`如下

```
.text{    display: grid;    grid-template-columns: fit-content(100px) 1fr fit-content(300px);    column-gap: 20px;    height:200px;}.text >div:nth-of-type(1) {    background-color: red;}.text >div:nth-of-type(2)  {    background-color: green;}.text >div:nth-of-type(3)  {    background-color: blue;}
```

### tan

这是一个数学中的正切三角函数，通常在我们业务中可能会很少遇到，但是在实现一个复杂的结构时，我们除了用图片替换，可能 css 也是可以绘制的，比如我们用 css 绘制一个平行四边形

```
<div class="box-wrap">  <div class="box"></div></div>
```

对应的`css`如下

```
* {padding: 0;margin:0;}  html,body {height: 100%; font-size:16px }  :root {      --bg: red;      --defaultBg: #e5e5e5;      --width: 400;      --height: 200;      --angle: 30deg;  }  #app {      overflow: hidden;  }  .box-wrap {      width: 100%;      height: calc(1px * var(--height));      display: flex;      justify-content: center;      position: relative;  }  .box {      width: calc(1px * var(--width));  }  .box:nth-of-type(1):before{      content: "";      display: block;      width: 100%;      height: calc(1px * var(--height));      transform: skewX(calc(var(--angle) * 1));      background-color: var(--bg);      border-left: 1px solid #e5e5e5;  }
```

![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILvBSm327bJxhicWUOYfHgxySbdQgGhc0ibCGjTFR34bQ6DXqbYkiaZqkUA/640?wx_fmt=png)

counter

这是一个计数函数，在一些特殊的列表中，我们可以巧妙的用这个函数

```
<div id="app">   <ul>    <li>hello</li>    <li>world</li>    <li>JAVA</li>    <li>JAVASCRIPT</li>    <li>PYTHON</li>   </ul></div>
```

对应的 css

```
#app {      overflow: hidden;      padding: 50px;  }  #app  ul {      counter-reset: count;  }  #app ul li {      counter-increment: count 1  }  #app ul li::marker {      content: "【"counter(count)"】"  }
```

![](https://mmbiz.qpic.cn/mmbiz_png/0jXCeiaibicNx7uppNzj5lBC4d5dLEeCXILKG2wKy4SCpak4Y46M71CgDUTjRhhhzL6FYhDux0UB6RK4HYnicVEl7w/640?wx_fmt=png)

### 总结

*   我们主要介绍了在`css3`常用的高频函数，比如`calc`,`var`,`attr`,`repeat`,`url`等，通常来讲有些函数可能用的并不是会那么多，比如`counter`、`tan`、`sin`函数等
    
*   另外还有不少不太常用的 css3 函数，具体可参考 Function[1]
    
*   本文示例 code example[2]
    

### 参考资料

[1]

Function: _https://developer.mozilla.org/en-US/docs/Web/CSS/attr_

[2]

code example: _https://github.com/maicFir/lessonNote/tree/master/html/14-css 函数_