> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/89tji3VLXTMz92y8sxtFow)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHibGvsiapkC10vya2Sk9PbJmTdvbq5Bb2tWRxYUkfUN3FeDFgEDiaCVDdRzXTSWQiawvqWugFdsXvsNw/640?wx_fmt=png&from=appmsg)

有粉丝朋友问了我一个问题：

有一个 750 x 1500 尺寸的设计稿，设计稿上有一个 150 x 50 的按钮，那么在写页面布局的时候，应该如何确定按钮的尺寸呢？

他想到了要使用 rem。但具体如何使用，他还是一头雾水。因此跑来咨询我。

于是问题来了，rem 到底是什么？rem 是为了解决什么问题而存在的？rem 能够给我们带来什么样的便利？带着这样的问题，我们一起来总结一下 rem 的实践。

* * *

### rem 是什么

rem 是一个相对于根元素字体大小的 css 单位。与 px 一样，他可以用来设置字体大小，也可以用来设置长度单位。

那相对于根元素字体大小是什么意思？

举个栗子。在页面中，html 元素是根元素，因此我们首先给 html 设置一个字体大小

```
html { font-size: 100px; }
```

于是，在整个页面中，就有这样的换算公式

`1rem = 100px`

所以如果一个按钮，有如下的 css 样式，就等同于他的宽为 100px，高 50px.

```
/* 等同于 宽100px 高50px */btn { width: 1rem; height: 0.5rem; }
```

这就是 rem 这个知识点的所有真相了。

！！！什么？这就完了？这和 px 有什么区别？

对啊，这和 px 本来就没有特别的区别，就是一个尺寸单位嘛！

所以提问的那个同学拿着 750x1500 设计图来问，当我们设置为 html 的字体大小为 100px 时，150x50 的按钮应该在页面里面写什么尺寸？，用 px 就应该写 75x25，用 rem 就是 0.75 x 0.25.

```
真实宽度375px / 设计图宽度750px = 按钮真实宽度 / 设计图按钮宽度150px==> 按钮真实宽度 = 75px又 1rem = 100px;   ==> 75px = 0.75rem
```

当然，我们希望在设计图量出来的尺寸不用除 2 直接得到 rem 的值，也就是说量出来是 150px，那么用 rem 表示就是 1.5rem。这个时候我们只需要修改 html 的字体大小为 50px 即可。那么计算思路就有一点不同。

```
真实宽度375px / 设计图宽度750px = 按钮真实宽度 / 设计图按钮宽度150px==> 按钮真实宽度 = 75px又 1rem = 50px;   ==> 75px = 1.5rem
```

因此当设计图的尺寸发生改变时，我们需要根据上述思路，动态的调整 html 的字体大小，以达到我们想要的 rem 换算。例如要求设计图的宽度改成 375px，那么我们的计算方法对应调整即可。

> ✓
> 
> 所以设计稿的尺寸，要与前端团队约定好

* * *

### rem 是为了解决什么问题而存在的？

以 iPhone 不同手机的尺寸来说，iPhone 4、5 宽度 320px，iPhone 6 375px，iPhone 6 plus 414px. 如果一个按钮，固定一个 75x25 的尺寸，那么就必然会导致在不同尺寸下的相对大小不一样。这带来的问题就在于会直接影响到设计的美观，可能在 iPhone6 下，一个完美的设计图，到了 iPhone5，就变得 low 很多。 因此，为了让页面元素的尺寸能够在不同设备宽度下的表现尽量一致，rem 就出现了。

rem 的相对大小跟 html 元素的字体大小有关系。使用 rem 适配的原理就是我们只需要在设备宽度大小变化的时候，调整 html 的字体大小，那么页面上所有使用 rem 单位的元素都会相应的变化。 这也是 rem 与 px 最大的区别。

有 css 与 js 两种方式来调整 html 元素大小的值。

css 方式

```
html { font-size: calc(100vw / 3.75) }
```

100vw 表示设备宽度，除以 3.75 这里是以 iPhone 6 的宽度 375px 为标准，为了保证 html 的字体大小为 100px。这样我们在换算的时候，1px 就是 0.01rem，就很容易计算。

> ✓
> 
> 因为 chrome 下最小字体大小为 12px，所以不能把 html 的 font-size 设置成 1px 或者 10px，100px 是我们最好的选择。

js 方式， 原理与 css 一样，不过为了避免在一些老旧一点的手机浏览器上不支持 calc，vm 这些属性，在实际应用中使用 js 是最好的。

```
!function () {   function a() {       var _width;       var clientWidth = document.documentElement.clientWidth;       if (clientWidth > 568) {           _width = 568;       } else if (clientWidth < 320) {           _width = 320;       } else {               _width = clientWidth;       }       // var pageWid = (window.innerWidth > document.querySelector('body').offsetHeight) ? 1136 : 640;       document.documentElement.style.fontSize = _width / 375 * 100 + "px";   }   var b = null;   document.addEventListener("DOMContentLoaded", function () {       window.addEventListener("resize", function () {           clearTimeout(b);           b = setTimeout(a, 300)       }, !1);       a()   }, false);}(window);
```

在实践中还有一个关键的问题需要处理。就是无论如何 js 的加载会比 css 慢，因此如果我们就这样的话，页面的元素会有一个很明显的闪烁，因为在 js 加载进来之前，html 的字体大小还没有达到我们想要的效果。因此通常我们需要在 css 中，给 html 的字体大小设置一个默认值，以弱化这个闪烁。默认值的具体大小需要我们自行根据设计图的尺寸，以及你想要的结果，通过上面我们介绍的计算思路去得出。

```
html {  font-size: 100px;}
```

* * *

### 需要注意的地方

一、rem 的适用性很有局限，仅仅只能够用于只在移动端展示的页面。如果你的页面还需要适配到 pc 端，那么就老老实实的使用 px 吧。在上面的实现中，我通过设定 html 字体大小的范围来避免 pc 上显示过于夸张。

二、有的同学可能对 web 的适配有点误解。web 中做适配并不需要考虑什么物理像素啊，dpi 等等概念。这些误会导致许多搞设计的同学在给 web app 做设计时，也丢一张 1080x1920 的设计稿过来，真是愁死人了。

* * *

### 推荐阅读

掌握 React 19，推荐阅读我的 [`付费小册 React19`](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649870562&idx=1&sn=7364fcc9ae398e1c78bfb013a93e24e3&chksm=f3e58171c49208677962c3e10da1b66d3d62e3cbe75dc7669fec8824126dc0db13fd1e1043d7&scene=21#wechat_redirect)

成为 React 高手，推荐[`阅读 React 哲学`](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)