> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qFa-DNUCJUypGXX1yHeeAw)

### 背景

UI 给出的设计稿，一般是以 iphone6 屏幕大小为准，也就是宽高为 375 * 667，激进一些的还会使用 414 * 736 的设计稿。在其他不同尺寸的屏幕上适配的问题也就由此诞生，一般新搭建的项目都要处理这个问题。

### 常见方案

目前市面上比较常见的有两种方案：rem 方案、viewport 方案

1.  rem 方案 通过计算屏幕宽度比，对 html 标签设置 font-size 为 px，子元素都使用 rem 标识
    

```
<script type="text/javascript">  !(function e () {      var t = document.documentElement,          n = Math.min(t.clientWidth, 500) / 4.14;      t.style.fontSize = n + 'px';      var i = parseFloat(window.getComputedStyle(t).fontSize);      n !== i && ((n = (n * n) / i), (t.style.fontSize = n + 'px')),          (window.__REAL_FONT_SIZE__ = n),          window.addEventListener('resize', e);  })();</script>
```

缺点：rem 单位会可能会出现精度的兼容性问题，可能出现 1px 未对齐的问题，即半像素问题

2.  viewport 方案
    

通过更改 viewport 的 initial-scale=1.0, maximum-scale=1.0 属性控制缩放

优点：不会出现像素不对齐的问题 缺点：视窗缩放时，相当于渲染出了一个大尺寸页面进行缩放，会占用 webview 内存，影响性能

```
<meta /><script>;+(function () {     function resize() {      var viewport = document.querySelector('meta[name=viewport]');      viewport.content = viewport.content.replace(/(initial-scale=)[^,]*/i, '$1'.concat(screen.width / 818))   }   // 动态调整视口宽度至设计稿宽度    window.addEventListener('resize', function () { setTimeout(resize, 300) });   resize() })()</script>
```

**观察发现：这两种方案，都需要借助 JS 实现页面的屏幕适配，有点像补丁代码，对于代码洁癖的人，肯定想除之而后快，所以就想着实现一种纯 CSS 方案来实现布局适配**

### 纯 CSS 方案

该方案与第一种方案类似，不过不是通过 JS 来控制根节点的`fontSize`，而是引入新的单位`vw`来实现。通过设置根节点单位为`vw`，实现根节点在不同尺寸屏幕下的相同占比；子节点使用单位`rem`，实现根据根节点大小变化调整对应大小。

`vw`字面意思是视窗宽度，将整个视窗划分为 100vw，所以`vw`类似百分比，该方案正是利用这个特性实现不同屏幕下的布局适配。

根据设计稿可知， `375px = 100vw`，

如果将根节点`fontSize`设置为 100px，所以，根节点 html

`fontSize=100px * 100vw/375px = 26.66666667vw`

为了兼容不支持`vw`的机型，可以先设置 px，再用 vw 进行覆盖，具体如下：

```
html {
    font-size: 100PX; // 大写的PX，不会被postcss-pxtorem转化为rem
    font-size: 26.66666667vw;
}
```

子节点通过插件`postcss-pxtorem`，在 webpack 构建时，会把实际写样式时用的`px`转换为`rem`，具体配置如下：

```
'postcss-pxtorem': {    rootValue: 100,    propList: ['*'],    selectorBlackList: ['__vconsole']}
```

具体适配效果预览：

**375*667 屏幕**

![](https://mmbiz.qpic.cn/mmbiz_png/2K5IuDFDWmic3nicClPKSCOhcibIWXwv2a31DF19LjKZk1lV9bWAvemic9sS6W52b6MrehVYBick1hLwMaQ5v2c1I8w/640?wx_fmt=png)

  

**414*736 屏幕**

![](https://mmbiz.qpic.cn/mmbiz_png/2K5IuDFDWmic3nicClPKSCOhcibIWXwv2a3UDSmppbqUJwiaBxSQvaUenjmF5sAef6AT6ElrYK8gPMU0Fiavzlg3UdQ/640?wx_fmt=png)

**414*1024 屏幕（ipad）**

![](https://mmbiz.qpic.cn/mmbiz_png/2K5IuDFDWmic3nicClPKSCOhcibIWXwv2a3mrOtq9yusADt5eHUCnDWsNQGwfWHkcyfgBbL735ibrJZo2QQZzSxkJA/640?wx_fmt=png)

  

### 总结

该方案让 CSS 和 JS 各司其职，代码也比较整洁。该方案已经被应用于多个公司级营销活动页面、多个移动端项目，未暴漏发现严重的兼容问题。