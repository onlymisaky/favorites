> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ngL-4wDxjOfPkIZLoMnERA)

前言
--

在这之前我写过这样一篇文章[_**教你用 canvas 打造一个炫酷的碎片切图效果**_](http://mp.weixin.qq.com/s?__biz=Mzg5NDExMzU1MA==&mid=2247488937&idx=1&sn=93994bd9086f1697ac075f0697bd6de0&chksm=c025d7c8f7525ede3d222eb07427e2492a4e4b0f5a65c8dd3f2fa4624d34082d011df6b5934e&scene=21#wechat_redirect)，这个效果是用 Canvas 来实现的，现在想着尝试使用`CSS Paint API`来实现一个类似的碎片效果。

**「如果这篇文章有帮助到你，❤️关注 + 点赞❤️鼓励一下作者，文章公众号首发，关注 `前端南玖` 第一时间获取最新文章～」**

简单介绍下 CSS Paint API
-------------------

> ❝
> 
> CSS Paint API 是 Houdini 项目的一部分。它允许我们使用自己的功能扩展 CSS，所以我们可以不再需要等待新功能的发布，完全可以自己实现想要的新功能，可以说 CSS Paint API 就是 CSS 的未来。Houdini 是一组底层 API，它暴露一部分 CSS 引擎给开发者介入浏览器渲染与布局的能力，从而能够扩展 CSS。
> 
> ❞

W3C 上关于 CSS Paint API 的介绍是这样的：

> ❝
> 
> CSS `Paint API` 允许开发者使用 JavaScript 创建对样式与大小变化自适应的 CSS 图像。这种方式创建的图像，可以通过调用 `paint()` 函数，应用在诸如 `background-image`、`border-image` 和 `mask-image` 等属性上。
> 
> ❞

有了这个 API，我们在 CSS 中可以绘制任意自己想要的图案了，是不是泰裤辣！

### 使用

使用流程具体可以按照这张图来即可：

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia5d3TnibReuwncBXD357oLAw5c9RPQjXWGMzYia51mlHEQnynJ6Hb3ucxlVyK4UHNrLV5oq0EqWYdyw/640?wx_fmt=png)

1.  创建一个 js 文件，使用 `registerPaint()` 方法注册一个 PaintWorklet
    
2.  调用 `addModule()` 方法添加此模块
    
3.  在 CSS 中使用 `paint()` 函数调用
    

更具体的介绍可以在 MDN 上查看，了解完大概的使用流程我们就可以开始尝试实现我们的图像碎片效果了

开始制作
----

### 初步绘制

首先我们使用 Paint API 将我们的图片绘制成为一半不透明一半透明的效果：

```
<template>
  <div :class="$style.paint_container">
    <img src="/public/3.jpg" :class="$style.paint_img1" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
// import paintSuipian from "../../utils/paintSuipian";

const paint = () => {
  if (CSS.paintWorklet) {
    CSS.paintWorklet.addModule("/src/utils/paintSuipian1.js");
  }
};

onMounted(() => {
  paint();
});
</script>
<style lang="scss" module>
.paint_img1 {
  width: 400px;
  height: auto;
  --m: 12;
  --n: 12;
  -webkit-mask: paint(suipian1);
}
</style>
```

```
// paintSuipian1.jsregisterPaint(  "suipian1",  class {    paint(ctx, size) {      console.log("ctx:", ctx, "size:", size);      /* left */      ctx.fillStyle = "rgba(0,0,0,1)";      ctx.fillRect(0, 0, size.width / 2, size.height);      /* right */      ctx.fillStyle = "rgba(0,0,0,0.5)";      ctx.fillRect(size.width / 2, 0, size.width / 2, size.height);    }  });
```

从这里来看，paint 内部的一些操作 API 其实与我们熟悉的 Canvas 有点类似，ctx 就是当前的绘制上下文，而 size 则是应用这个 paint 元素的宽高大小。

所以从这里看上去理解并不难，与 Canvas 差不多，通过`fillRect`绘制矩形，然后通过`fillStyle`填充染色，我们就能看到下面这个效果：

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia5d3TnibReuwncBXD357oLAwBugPENoxjPiaz9frxUic377nVl9facJ4qDNO8cHRBaJFTSX3YK4Ip2kg/640?wx_fmt=png)

看到这个效果我们是不是就能够想象到之前的那种碎片效果应该怎样去实现呢？

这上面其实就是绘制了两个矩形，分别填充了不同的透明度，那么我们如果绘制多一点的矩形也让它填充不同的透明度会是什么样子呢，大家可以想象一下🤔...

### 稍微加工

为了更加实用，我们可以通过定义 CSS 变量来达到控制碎片密度的效果。

```
// paintSuipian1.jsregisterPaint(  "suipian1",  class {    static get inputProperties() {      return ["--m", "--n"];    }    paint(ctx, size, properties) {      console.log("ctx:", ctx, "size:", size);      const m = properties.get("--m");      const n = properties.get("--n");      const w = size.width / m;      const h = size.height / n;      for (var i = 0; i < n; i++) {        for (var j = 0; j < m; j++) {          ctx.fillStyle = "rgba(0,0,0," + Math.random() + ")";          ctx.fillRect(i * w, j * h, w, h);        }      }    }  });
```

此时我们的 js 改的稍微复杂了一点，其实也还好，只是定义了一下矩形矩阵的维度，然后计算了没个碎片的宽高，再经过 for 循环进行绘制。

**「这里我们可以通过`get inputProperties`来获取我们 CSS 中定义的变量，需要注意的是这里的获取的变量也是有作用域的，它只能获取到自己身定义的变量或者是它继承而来的 CSS 变量」**

```
.paint_img1 {  width: 400px;  height: auto;  --m: 12;  --n: 12;  -webkit-mask: paint(suipian1);}
```

现在这张图片会变成什么样呢，我们来看一下：

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia5d3TnibReuwncBXD357oLAw2VnZ5icPgmegt31RObanAIibyLSgtHd5DviaApXSTiaBG1Jwia8SRyTTDnw/640?wx_fmt=png)

这样一看是不是有点感觉了

我们可以通过控制 CSS 变量来实现不同的效果，比如：

```
.paint_img1 {  width: 400px;  height: auto;  --m: 22;  --n: 22;  -webkit-mask: paint(suipian1);}
```

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia5d3TnibReuwncBXD357oLAwzFSnAArkUD3IkmZ4pRrb0nf9oaxIynmicBgetNmNU3ibjcQc2V4fZtXQ/640?wx_fmt=png)

### 添加动画

到这了，整个碎片的轮廓大概是有了，现在需要做的是怎么为这些碎片加上动画？

这里有个技巧是我们可以通过使用`@property`来自定义一个属性，这个属性其实是一个`Number`值，而这个值又恰好是我们每个碎片计算随机透明度需要用的值，然后我们再使用 transition 再对这个自定义属性进行过渡。

OK，我们来尝试一下:

```
// paintSuipian1.jsregisterPaint(  "suipian1",  class {    static get inputProperties() {      return ["--m", "--n", "--f"];    }    paint(ctx, size, properties) {      console.log("ctx:", ctx, "size:", size);      const m = properties.get("--m");      const n = properties.get("--n");      const f = properties.get("--f");      const w = size.width / m;      const h = size.height / n;      for (var i = 0; i < n; i++) {        for (var j = 0; j < m; j++) {          ctx.fillStyle = "rgba(0,0,0," + f + ")";          ctx.fillRect(i * w - 0.5, j * h - 0.5, w + 0.5, h + 0.5);        }      }    }  });
```

```
.paint_img1 {  width: 400px;  height: auto;  --m: 10;  --n: 10;  --f: 1;  -webkit-mask: paint(suipian1);  transition: --f 1s;}.paint_img1:hover {  --f: 0;}
```

看看效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia5d3TnibReuwncBXD357oLAwop19C4a4EF5iaFMhkL4b1AVLLqr6ib9RUXX6XZOtrwHUYVct98pgABuQ/640?wx_fmt=gif)

  

这里看着有点怪怪的，因为所有的碎片都会同时隐藏出现，并没有达到我们想要的效果，所以这里我们还得想办法防止所有的碎片同时显示隐藏🤔

### 最后优化

这里其实需要通过一种算法来让每个碎片的不透明度达到一个随机的效果。

```
// paintSuipian.jsregisterPaint(  "suipian",  class {    static get inputProperties() {      return ["--color", "--m", "--n", "--f"];    }    paint(ctx, size, properties) {      console.log("ctx:", ctx, "size:", size, properties.get("--color"));      const m = properties.get("--m");      const n = properties.get("--n");      const f = properties.get("--f");      const w = size.width / m;      const h = size.height / n;      const l = 10;      const mask = 0xffffffff;      const seed = 30;      let m_w = (123456789 + seed) & mask;      let m_z = (987654321 - seed) & mask;   // 随机算法      const random = function () {        m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;        m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;        let result = ((m_z << 16) + (m_w & 65535)) >>> 0;        result /= 4294967296;        return result;      };      for (let i = 0; i < n; i++) {        for (let j = 0; j < m; j++) {          ctx.fillStyle =            "rgba(0,0,0," + (random() * (l - 1) + 1 - (1 - f) * l) + ")";          ctx.fillRect(i * w - 1, j * h - 1, w + 1, h + 1);        }      }    }  });
```

```
.paint_img {  width: 400px;  height: auto;  --color: rgba(255, 255, 255, 1);  --m: 10;  --n: 10;  --f: 1;  -webkit-mask: paint(suipian);  transition: --f 1s;}.paint_img:hover {  --f: 0;}
```

最后的效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia5d3TnibReuwncBXD357oLAwQ6GWmhkUlpndiaWWzb2I8TAFW3GagADQl6lR27NmUDSgRDqicuq0eqPg/640?wx_fmt=gif)