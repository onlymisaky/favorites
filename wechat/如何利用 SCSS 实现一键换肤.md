> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qnCZGSs18Fe5RFJpCQWa9A)

> 本文首发于政采云前端团队博客：如何利用 SCSS 实现一键换肤
> 
> https://www.zoo.team/article/theme-scss

前言
--

在项目开发过程中，我们有时候遇到需要**更换站点主题色**的需求。乃至于 APP 底部的 banner 中的 icon、文案和背景图都是运营**线上可配置的**。还有的功能比如**更换系统字体大小**等。

这些本质上都是 CSS 的**动态渲染**的需求。如果在开发过程中**写死 CSS 样式**的话在面对这样的需求的时候就会真 · 痛苦面具了。所以我们需要提前定义**一整套 CSS 的环境变量体系**，在开发过程中就使用这套体系，未雨绸缪才能立于不败之地。

这里我们用到 **SCSS**（Sassy CSS）来实现这套体系。SASS 是 CSS 的**预处理器**，由 Ruby 编写。一开始并不支持 {} 和这种原生 CSS 的写法，缩进也严格控制，增加了开发者的使用成本。具体的区别可以看下面这张 gif 图。

![](https://mmbiz.qpic.cn/mmbiz_gif/vzEib9IRhZD50LGtibZTU93hRJllpeoBP1Uiclw1tWRU1NVxiatIY9ON5UOicnuLqJm0BoPCwSdhpTFERXSMkAYEafw/640?wx_fmt=gif)

但是由 SASS3 开始引入的 SCSS 语法完全兼容现有的 CSS 语法，能够在生成真正的 CSS 文件之前预处理一些逻辑，比如变量，循环，嵌套，混合，继承，导入等，使其在逻辑上能够拥有部分 JS 的特性。

我们可以在这个网址 (https://www.sassmeister.com/) 在线查看编译的 SCSS 编译成 CSS 之后的代码。

整体项目效果
------

切换主题色之后，能够按照选择的主题色进行不同的展示。如下图展示。

![](https://mmbiz.qpic.cn/mmbiz_gif/vzEib9IRhZD50LGtibZTU93hRJllpeoBP14PZN1ickasgYpjy8Kb0JYCbrYlJ6RaQEmSXp9hBUvkVsf8xvqKicpIcg/640?wx_fmt=gif)

项目目录结构
------

```
src
├── App.vue
├── main.js
├── router
│   └── index.js
├── store
│   └── index.js
├── style
│   ├── settings
│   │   └── variable.scss  // 样式变量定义文件
│   └── theme
│       ├── default
│       ├── index.scss // 主题入口文件
│       └── old
└── views
    ├── Home.vue // 主题切换页面
    ├── List.vue
    └── Mine.vue
```

废话不多说。我们直接开干吧。

环境准备
----

首先我们需要安装 scss 解析环境

```
npm i sass
// 注意 sass-loader 安装需要指定版本 如果安装最新版本会报错 this.getOptions 这个方法未定义
npm i -D sass-loader@10.1.0
// 利用 normalize.css 初始化页面样式
npm i -S normalize.css
```

定义变量
----

我们需要提前把一些常用的主题色，字体大小，以及边距这种与视觉沟通好，然后定义对应的变量。这里我参考资料贴了一套自定义的颜色变量。当然里面的具体颜色可以根据需求动态调整。

### 小技巧

这里讲一个小技巧，定义的时候可以先定义一个**基准变量** base-param  然后其他状态的值可以依赖这个 base-param 进行缩放或放大实现。比如不同大小规模的字体可以采用这种方法。

```
// 行高
$line-height-base: 1.5 !default;
$line-height-lg: 2 !default;
$line-height-sm: 1.25 !default;
```

```
// ./style/settings/variable.scss

// 字体颜色
$info: #17a2b8 !default;
$danger: #dc3545 !default;

// 字体大小 浏览器默认 16px
$font-size-base: 1rem !default;
$font-size-lg: $font-size-base * 1.25 !default;
$font-size-slg: $font-size-base * 1.75 !default;

// 字重
$font-weight-normal: 400 !default;
$font-weight-bold: 600 !default;
```

定义主题
----

我们目前接到的需求是适老化改造，目前市场上大多数的项目字体都比较小，对老年人用户不太友好。所以针对老年人用户需要放大系统字体，方便他们查看。你也可以根据自己的需求进行不同的主题定制。

**定义一个入口文件**

```
// ./style/theme/index.scss

@import "../settings/variable.scss";

$themes-color: (
  default: (
    // 全局样式属性
    color: $info,
    font-weight: $font-weight-normal,
    font-size: $font-size-lg,
  ),
  old: (
    color: $danger,
    font-weight: $font-weight-bold,
    font-size: $font-size-slg,
  ),
);
// ... 可自定义其他主题
```

**vue.config.js 配置项处理**

我们不想每次都引入 CSS 变量，可以在配置项中利用 CSS 插件自动注入全局变量样式。

```
// vue.config.jsmodule.exports = {  css: {    loaderOptions: {      scss: {        // 注意: 在 sass-loader v8 中，这个选项是 prependData        additionalData: `@import "@/style/theme/index.scss";`,      },    },  },};
```

主题色切换
-----

主题色定义好之后就需要对他进行切换了。这也是**一键换肤**最核心的逻辑。

*   **在 App.vue 文件下的 mounted 中将 body 添加一个自定义的 data-theme 属性，并将其设置为 default**
    

```
// App.vue mounted() { document .getElementsByTagName("body")[0]
.setAttribute("data-theme", "default"); },
```

*   **利用 webpack 自定义插件遍历主题目录文件，自动生成自定义主题目录数组**
    

```
// vue.config.jsconst fs = require("fs");const webpack = require("webpack");// 获取主题文件名const themeFiles = fs.readdirSync("./src/style/theme");let ThemesArr = [];themeFiles.forEach(function (item, index) {  let stat = fs.lstatSync("./src/style/theme/" + item);  if (stat.isDirectory() === true) {    ThemesArr.push(item);  }});module.exports = {  css: {...},  configureWebpack: (config) => {    return {      plugins: [        // 自定义webpack插件        new webpack.DefinePlugin({          THEMEARR: JSON.stringify(ThemesArr),        }),      ],    };  },};
```

*   **切换 js 逻辑实现**
    

**初始化页面的时候，获取到默认主题**

```
// Home.vuemounted() {  this.themeValue = THEMEARR;  this.currentThemeIndex = this.themeValue.findIndex(    (theme) => theme === "default"  );  this.currentTheme = this.themeValue[this.currentThemeIndex];},
```

**把选择的主题赋值给自定义属性 data-theme**

```
// Home.vue// 核心切换逻辑methods: {  onConfirm(currentTheme) {    this.currentTheme = currentTheme;    this.showPicker = false;    this.currentThemeIndex = this.themeValue.findIndex(      (theme) => theme === currentTheme    );    document      .getElementsByTagName("body")[0]      .setAttribute("data-theme", THEMEARR[this.currentThemeIndex]);  },}
```

### CSS 版本如何实现主题色切换

可能大家不太了解，CSS 也是可以支持自定义属性的，这就为我们定义属性变量提供了基础。他通过在自定义属性之前加上前缀 **--** 来实现。

```
body {  --foo: #7f583f;  --bar: #f7efd2;}
```

首先想到的就是给标签添加自定义主题属性 data-theme，再通过 css 属性选择器 + 命名空间来找到指定的元素并替换不同的主题色。这里采用的 t - 文件名 - 含义类名来命名，防止样式冲突。

```
// ./default.scss// 也可以换成其他的自定义变量颜色[data-theme="default"] .t-list-title,[data-theme="default"] .t-list-sub-title,[data-theme="default"] .t-list-info {  color: var(--foo);  font-weight: 400;  font-size: 1rem * 1.25;}// ./old.scss// 也可以换成其他的自定义变量颜色[data-theme="old"] .t-list-title,[data-theme="old"] .t-list-sub-title,[data-theme="old"] .t-list-info {  color: var();  font-weight: 600;  font-size: 1rem * 1.75;}
```

```
// ./List.vue
<template>
  <div class="home">
    <div class="container" v-for="(item, index) in 3" :key="index">
      <div class="t-list-title">标题</div>
      <div class="t-list-sub-title">副标题</div>
      <div class="t-list-info">
        这是一段很长的详情信息这是一段很长的详情信息这是一段很长的详情信息这是一段很长的详情信息这是一段很长的详情信息这是一段很长的详情信息这是一段很长的详情信息
      </div>
    </div>
  </div>
</template>
```

### Scss 版本如何实现主题色切换

#### Scss 前置知识

在使用 sass 之前，需要知道一些知识点。

*   使用 @each 循环
    
    1. 循环一个 list: 类名为 icon-10px 、icon-12px、icon-14px 写他们的字体大小写法就可以如下：
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/vzEib9IRhZD50LGtibZTU93hRJllpeoBP1Lmf4FqBycW70niamMOS9FatX51N31NyFDZOekNEGnnJiciaDA0KnkBMLg/640?wx_fmt=jpeg)

2、循环一个 map：类名为 icon-primary、icon-success、icon-secondary 等，但是他们的值又都是变量，写法如下：

![](https://mmbiz.qpic.cn/mmbiz_png/vzEib9IRhZD50LGtibZTU93hRJllpeoBP1UUtbAK26wmKx9WLVr3okZPPHic3fFyYmrv2fnRbibbrkU5kq8VfRrV2A/640?wx_fmt=png)

*   map-get
    

map-get(map,key) 函数的作用是根据 key 参数，返回 key 在 map 中对应的 value 值。如果 key 不存在 map 中，将返回 null 值。此函数包括两个参数：

map：定义好的 map。key：需要遍历的 key。

假设要获取 facebook 键值对应的值 #3b5998，我们就可以使用 map-get() 函数来实现：

![](https://mmbiz.qpic.cn/mmbiz_png/vzEib9IRhZD50LGtibZTU93hRJllpeoBP1G1o1AaficMJ5PTngvnwGD1mJ4sWLWBf8yvVYkGIbn44hgMm6IibJSAUQ/640?wx_fmt=png)

*   使用 & 嵌套覆盖原有样式
    

当一个元素的样式在另一个容器中有其他指定的样式时，可以使用嵌套选择器让他们保持在同一个地方。`.no-opacity &`相当于`.no-opacity .foo`。

![](https://mmbiz.qpic.cn/mmbiz_png/vzEib9IRhZD50LGtibZTU93hRJllpeoBP1HG6UwFKN2wJoATB20megNGduG4rAc1yico3IU1gWeBEiaeiapfopB401w/640?wx_fmt=png)

*   map-merge
    

合并两个 map 形成一个新的 map 类型，即将 _map2_ 添加到 _map1_ 的尾部

```
$font-sizes: ("small": 12px, "normal": 18px, "large": 24px)
$font-sizes2: ("x-large": 30px, "xx-large": 36px)
map-merge($font-sizes, $font-sizes2)
结果: "small": 12px, "normal": 18px, "large": 24px,
"x-large": 30px, "xx-large": 36px
```

*   @content
    

`@content` 用在 `mixin` 里面的，当定义一个 `mixin` 后，并且设置了 `@content`；`@include` 的时候可以传入相应的内容到 `mixin` 里面

![](https://mmbiz.qpic.cn/mmbiz_png/vzEib9IRhZD50LGtibZTU93hRJllpeoBP19mqq2URQHDvr0yic9DRVcmR5hcs979hrIbibV2pPyFQqxQhD57lDRgrg/640?wx_fmt=png)

#### 综合使用

**定义混合指令, 切换主题, 并将主题中的所有规则添加到 theme-map 中**

```
// ./Home.vue@mixin themify() {  @each $theme-name, $map in $themes-color {    // & 表示父级元素  !global 表示覆盖原来的    [data-theme="#{$theme-name}"] & {      $theme-map: () !global;      // 循环合并键值对      @each $key, $value in $map {        $theme-map: map-merge(          $theme-map,          (            $key: $value,          )        ) !global;      }      // 表示包含 下面函数 themed()      @content;    }  }}@function themed($key) {  @return map-get($theme-map, $key);}.t-list-title,.t-list-sub-title,.t-list-info {  @include themify() {    color: themed("color");    font-weight: themed("font-weight");    font-size: themed("font-size");  }}
```

**整体编译后的样式代码如下图所示**

![](https://mmbiz.qpic.cn/mmbiz_gif/vzEib9IRhZD50LGtibZTU93hRJllpeoBP17EKmp0j4qel3D0NbQy0rNPWnm0lXT3Or9cF2Ney5swZiaeyJulxMayg/640?wx_fmt=gif)

项目源码地址  

---------

想要看 demo 源码的可以点击这个链接查看代码。

点击查看项目源码 (https://github.com/AshesOfHistory/test-skin-refresh)

总结

*   了解 SCSS 的基础语法，并综合使用，实现了一键换肤功能。
    
*   利用 SCSS 强大的函数功能遍历类名统一添加以自定义属性名前缀的命名空间，利用循环自动生成 CSS 样式。
    
*   了解一键换肤的核心原理。
    

参考文章
----

https://blog.csdn.net/wytraining/article/details/109676970

 - END -

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECqoVbtplgn1lGUicQXib1OKicq8iaxkE3PtFkU0vKvjPRn87LrAgYXw6wJfxiaSQgXiaE3DWSBRDJG39bA/640?wx_fmt=png)