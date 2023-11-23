> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Q4YwNMZ09Klc2Vwxo0aOsg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCX3rnibicfmNM5psAiassVTHyjEFhgszYsGgKTH13icCLibZCX9ZV6gib59grpYXqThgLPrygd4aqqH2tuw/640?wx_fmt=jpeg)

一些像素概念
------

*   物理像素：即实际的每一个物理像素，也就是移动设备上每一个物理显示单元（点）
    
*   设备逻辑像素（`css`中的`px`）：可以理解为一个虚拟的相对的显示块，与物理像素有着一定的比例关系，也就是下面的设备像素比
    
*   设备像素比（`dpr`）：= 物理像素 / 设备独立像素 (`px`)
    

> 如果`dpr`为`1`的话，那么`1px = 1物理像素`，`x`轴`y`轴加起来就是`1`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/zHYsKHjf0ngqIZUhlTMkCIJYkRYD0ejwtrQOV3qZXaCia72tNEss3YJg3LmHVoPSAkXFe0bvQibYNjpYymaCq7cg/640?wx_fmt=png)

> 如果`dpr`为`2`的话，那么`1px = 2`物理像素，`x`轴`y`轴加起来就是`4`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/zHYsKHjf0ngqIZUhlTMkCIJYkRYD0ejwa8hl0fJ9a882R7JKibiaRYpqkQFbA0ic8143gOwsbpmliaia31LkaUtuAVA/640?wx_fmt=png)

**以此类推**

> 在 js 中可以通过`window.devicePixelRatio`获取当前设备的`dpr`。

这里说明一下，无论`dpr`多大，`1px`的大小通常来说是一致的，这也就意味着，随着`dpr`的增大，物理像素点会越来越小，这样才能容纳更多的物理像素，才能更高清，更`retina`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/zHYsKHjf0ngqIZUhlTMkCIJYkRYD0ejwyeozhEIYj4EicvKPSXTaDfuV8lGtIPkP4vBmiaurwEC8m5bEwFb7f9dA/640?wx_fmt=gif)

说完基本概念，来说一下几个问题：

retina 屏图片模糊
------------

> 首先普及一下位图像素：一个位图像素是图片的最小数据单元，每一个单元都包含具体的显示信息（色彩，透明度，位置等等）

那为什么在 dpr 高的 retina 屏上反而会模糊呢？看图~

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zHYsKHjf0ngqIZUhlTMkCIJYkRYD0ejwXOkIMVqbXGC4tWU3RxGzOt8On6bDcgcFl7WsLuSgC8TDgbamas26JA/640?wx_fmt=jpeg)

> 在`1dpr`的屏幕上，位图像素和物理像素一一对应没什么问题，但是在`retina`屏上，由于一个`px`由`4`个甚至更多的物理像素组成，并且单个位图像素不能进一步分割，所以会出现就近取色的情况，如果取色不均，那么就会导致图片模糊。

> 对于这种情况，只能采用`@2x`、`@3x`这样的倍图来适配高清展示，这样侧向说明了为什么照着`iphone6`做的`ui`稿不是`375`，而是`750`的问题。

虽然这样在`dpr`为`1`的屏幕上会导致`1`个物理像素上有`4`个位图像素，但是这种情况的取色算法更优，影响不大，不做讨论。

1px 的粗细问题
---------

> 由于`1px`的实际大小是一样的，只是里面的物理像素数量不同，所以如果直接写`1px`是没问题的，不会出现粗细不同的情况，但是这样一来`retina`的优势也`rem`的作用也就没了，其实还是`dpr`的问题，`dpr`为`1`，那么`1px`就是一个物理像素，但是在`retina`中。`1px`实际可能有`4`、`9`个物理像素，`ui`想要的其实是`1`个物理像素，而不是 1px，不过由于不是素所有的手机都能适配`0.x`，所以曲线救国，采用`scale`缩放或者设置`meta`都可以

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/zHYsKHjf0ngqIZUhlTMkCIJYkRYD0ejwX9zBL9Msuth1Echb2QGWfrB5VRoAXKWTjFnDUoweVkicA2lbPrEsnYQ/640?wx_fmt=jpeg)

viewport
--------

### 三个概念

*   `layout viewport`
    
*   `visual viewport`
    
*   `ideal viewport`
    

**layout viewport**

> 最开始，`pc`上的页面是无法再移动端正常显示的，因为屏幕太小，会挤作一团，所以就有了`viewport`的概念，又称布局视口（虚拟视口），这个视口大小接近于`pc`，大部分都是`980px`

**visual viewport**

> 有了布局视口，还缺一个承载它的真是视口，也就是移动设备的可视区域 - 视觉视口（物理视口）, 这个尺寸随着设备的不同也有不同。这样在视觉视口中创建了一个布局视口，类似`overscroll:scroll;`这样，可以通过滚动拖拽、缩放扩大进行较好的访问体验

**ideal viewport**

> 像上面的体验在早些年可能比较多，但是近几年几乎很少了，还是归咎于用户体验，所以，我们还需要一个视口 - 理想视口（同样是虚拟视口），不过这个理想视口的大小是等于布局视口的，这样用户就能得到更好的浏览体验。

### 一个特性

> `viewport`有六种可以设置的常用属性：

*   `width`：定义`layout viewport`的宽度，如果不设置，大部分情况下默认是`980`
    
*   `height`：非常用
    
*   `initial-scale`：可以以某个比例将页面缩放 \ 放大，你也可以用它来设置`ideal viewport`：
    

```
<meta name='viewport' content='initial-scale=1' />
```

*   `maximum-scale`：限制最大放大比例
    
*   `minimum-scale`：限制最小缩小比例
    
*   `user-scalable`：是否允许用户放大 \ 缩小页面，默认为`yes`
    

rem 适配方案
--------

> 先说原理，通过`meta`修正`1px`对应的物理像素数量，在根据统一的设计稿来生成`html`上的动态`font-size`，根据`dpr`构造字体等误差较大的样式的`mixin`

```
// 第一版:function initRem() {  const meta = document.querySelector('meta[]');;  const html = document.documentElement;  const cliW = html.clientWidth;  const dpr = window.devicePixelRatio || 1;  meta.setAttribute('name', 'viewport');  meta.setAttribute(      'content',      `width=${cliW * dpr}, initial-scale=${1 /          dpr} ,maximum-scale=${1 / dpr}, minimum-scale=${1 /          dpr},user-scalable=no`  );  html.setAttribute('data-dpr', dpr);  // 这样计算的好处是，你可以直接用ui的px/100得到的就是rem大小，方便快捷，无需mixin  html.style.fontSize = 10 / 75 * cliW * dpr + 'px';}initRem();window.onresize = window.onorientationchange = initRem();
```

> 对于引入的第三方 ui 组件，需要使用 px2rem 转换工具去做整体转换，比如`postcss-pxtorem`：https://github.com/cuth/postcss-pxtorem

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 100[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 100+ 篇原创文章