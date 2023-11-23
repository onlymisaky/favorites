> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/LgItijgdSMlHTIAj6ejw7A)

作者：令夕  

原文链接：https://juejin.im/post/5e92ad7a518825736c5b91cd

> 最近在做网站换肤的需求，也就是主题切换。那么如何切换主题的颜色呢？以下是网站换肤的实现以及基于换肤拓展的一些方案分享给大家，希望大家在做类似需求的时候能够有些参考。

### 覆盖样式实现

* * *

```
// light$color-brand1: #ffcd32;$fill-1: #fff !default;$color-text: #3c3c3c;$color-text-1: #757575;$color-text-2: #222;// dark$dark-fill-1: #222 !default; // 品牌色$dark-color-text: #fff;$dark-color-text-1: rgba(255, 255, 255, 0.3);$dark-color-text-2: $color-brand1;
```

```
// 页面使用<style lang="scss">@import "./assets/scss/index.scss";[data-theme="dark"] {  body {    background: $dark-fill-1;  }  .reaconmend .reaconmend-list .item .name {    color: $dark-color-text;  }  .reaconmend .reaconmend-list .item .desc {    color: $dark-color-text-1;  }  .header .text {    color: $dark-color-text-2;  }}</style>
```

利用 css 优先级的原理覆盖掉原有样式的实现，每定义一套皮肤就要定义对应的 sass 变量，以及定义一套覆盖原有样式的皮肤样式。如果有多套皮肤的话，覆盖的代码量就会 n 套。

**缺点：** 样式不易管理，查找样式复杂，开发效率低，拓展性差，维护成本高，多人协作沟通麻烦。

### sass 变量实现

* * *

```
// variable.scss  // 浅色$colors-light: (  fill-1: #fff,  text: #3c3c3c,  text-1: #757575,  text-2: #222,);// 深色$colors-dark: (  fill-1: #222,  text: #fff,  text-1: rgba(255, 255, 255, 0.3),  text-2: #ffcd32,);
```

```
// mixin.scss// 背景色@mixin bg-color($key) {  background-color: map-get($colors-light, $key);  [data-theme="dark"] & {    background-color: map-get($colors-dark, $key);  }}// text色@mixin text-color($key) {  color: map-get($colors-light, $key);  [data-theme="dark"] & {    color: map-get($colors-dark, $key);  }}
```

```
// 页面使用<style lang="scss" rel="stylesheet/scss">@import "../../../assets/scss/variable.scss";@import "../../../assets/scss/mixin.scss";.reaconmend-list {    .list-title {      height: 40px;      line-height: 40 px;      text-align: center;        @include text-color(text-1);    }}</style>
```

如上所示用到的知识点包含 Sass 变量（variable），嵌套（nestend rules），混合（mixins）， Sass Maps 的函数 - map-get(key)。

> Maps 的含义：Maps 可视为键值对的集合，键被用于定位值 在 css 种没有对应的概念。和 Lists 不同 Maps 必须被圆括号包围，键值对被都好分割 。Maps 中的 keys 和 values 可以是 sassscript 的任何对象。（包括任意的 sassscript 表达式 arbitrary SassScript expressions） 和 Lists 一样 Maps 主要为 sassscript 函数服务，如 map-get 函数用于查找键值，map-merge 函数用于 map 和新加的键值融合，@each 命令可添加样式到一个 map 中的每个键值对。Maps 可用于任何 Lists 可用的地方，在 List 函数中 Map 会被自动转换为 List ， 如 (key1: value1, key2: value2) 会被 List 函数转换为 key1 value1, key2 value2 ，反之则不能。(网友 Soledad 提供)

**使用 scss 变量换肤相比覆盖样式**

*   拓展性更强
    
*   将换肤的逻辑进行了收敛
    

### 生成多套皮肤 css

* * *

使用覆盖样式实现与 scss 变量实现会把多套皮肤的样式都编译到一个 css 文件里面，如果有多套皮肤样式，这个文件是会非常大的。为了解决这样的问题，就自然的想出了拆分 scss 的实现：

实现方案，通过编译工具与构建工具编译出多套皮肤 css，通过 js 动态的 link 对应的皮肤样式

```
// js动态处理 var theme = /\bt=(\w+)/.exec(location.search); theme = theme ? theme[1] : "light"; changeTheme(theme);function changeTheme(theme) {    var head = document.getElementsByTagName("head")[0];    var link = document.createElement("link");    link.dataset.type = "theme";    link.href = "assets/css/theme-" + theme + "/pages/home/home.css";    link.rel = "stylesheet";    link.type = "text/css";    head.appendChild(link);}
```

### CSS 变量实现

* * *

```
// variable.scss// 默认变量:root {  --fill-1: #fff;  --text: #3c3c3c;  --text-1: #757575;  --text-2: #222;  --font-size-large: 18px;  --font-size-large-x: 22px;  --font-size-medium: 14px;  --font-size-medium-x: 16px;  --font-size-small-s: 10px;  --font-size-small: 12px;}// 深色变量[data-theme="dark"] {  --fill-1: #222;  --text: #fff;  --text-1: rgba(255, 255, 255, 0.3);  --text-2: #ffcd32;}
```

在页面对 css 变量做引入使用

```
// 页面使用@import "../../assets/scss/variable.scss";.header {  position: relative;  height: 70px;  text-align: center;  font-size: 0;   .text {    display: inline-block;    vertical-align: top;    line-height: 70px;    font-size: var(--font-size-large);    color: var(--text-2);  }}
```

具体的实现效果：![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXw0fK9PvrmrXiaef3qgMKzYKZiauVk1WdX3FzVCN6j1wGH4rs2ia2h1REgg/640?wx_fmt=gif)

> 问题点：css 变量会存在兼容性问题

css 变量兼容性如下：![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwFCpBSnwBEP0Ue3nQviaLg0t0mlG04mqMYibfLXWOaPE33vT8Lr7o9uEw/640?wx_fmt=png)虽然现在大部分主流浏览器都可以兼容，但是还要考虑更多的兼容性这块的请往下看：

### CSS 变量兼容性实现 - 1

* * *

> 在 css 变量的基础上新增了 postcss-custom-properties 这个插件 安装依赖：npm install postcss-custom-properties --save-dev npm install postcss-loader --save-dev

在根目录新建 postcss.config.js 增加配置，配置如下：

```
const postcssCustompProperties = require("postcss-custom-properties");module.exports = {  plugins: [    postcssCustompProperties({      importFrom: "src/assets/scss/variable.scss"    })  ]};
```

postcss 会将 css 自定义变量直接编译为`确定值`，而`不是保留`。这时就需要 `postcss 插件` 来为我们保留这些自定义变量，使用 postcss-custom-properties 效果如下：![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwC5Sz2frb1ibbnJrGbQM2DuHT3gJHPcYAn655KpgyBJibC6ShVgoLgGvQ/640?wx_fmt=png)

*   优点：会生成一套与 css 变量对应的 css
    
*   缺点：在构建时根据 css 变量生成对应的 css，换肤是运行时并不能生成对应的 css。
    

换肤后样式：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwibg0kjXZMWjEY3OohhGicbRibaz4ia8nKNFZhwM8ZaZgFm1bY5QEE1f3KQ/640?wx_fmt=png)

### CSS 变量兼容性实现 - 2

* * *

首先需要建一个存放公共 css 变量的 js 文件，将需要定义的 css 变量存放到该 js 文件，例如（variable.js）

```
// variable.js// 字体变量const baseSize = {  "--font-size-large-x": "22px",  "--font-size-large": "18px",  "--font-size-medium": "14px",  "--font-size-medium-x": "16px",  "--font-size-small-s": "10px",  "--font-size-small": "12px",};//浅色export const lightTheme = {  "--fill-1": "#fff",  "--text": "#3c3c3c",  "--text-1": "#757575",  "--text-2": "#222",  ...baseSize,};// 深色export const darkTheme = {  "--fill-1": "#222",  "--text": "#fff",  "--text-1": "rgba(255, 255, 255, 0.3)",  "--text-2": "#ffcd32",  ...baseSize,};
```

页面使用 css 变量，例如：

```
<style lang="scss"> .text {    display: inline-block;    vertical-align: top;    line-height: 70px;    font-size: var(--font-size-large);    color: var(--text-2);  }</style>
```

安装 css-vars-ponyfill 插件

> **css-vars-ponyfill** 官方概念：在传统浏览器和现代浏览器中为 CSS 自定义属性 (又名“CSS 变量”) 提供客户端支持的 ponyfill。（具体用法与概念请查阅官方网站：**css-vars-ponyfill**）

封装切换主题的 js，在 main.js 做初始化调用

```
// theme.jsimport { lightTheme, darkTheme } from "../src/assets/js/variable";import cssVars from "css-vars-ponyfill";export const initTheme = (theme) => {  document.documentElement.setAttribute("data-theme", theme ? "light" : "dark");  cssVars({    watch: true, // 当添加，删除或修改其<link>或<style>元素的禁用或href属性时，ponyfill将自行调用    variables: theme ? lightTheme : darkTheme, // variables 自定义属性名/值对的集合    onlyLegacy: false, // false  默认将css变量编译为浏览器识别的css样式  true 当浏览器不支持css变量的时候将css变量编译为识别的css  });};
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwibQ5luUiaeUe3Gl5RRU6ubmTMdkX7NnrYUB8QsR8ACo4kW5mAJzsOxyQ/640?wx_fmt=png)在切换主题的按钮组件中调用![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwxvghQMrZuuYnQNhrflo3tc6heLV6MMJlb8p0dFU0MYUkeYPq3NkgcA/640?wx_fmt=png)

总结：css 自定义属性 + css-vars-ponyfill(解决兼容性) 预览效果![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwYvicgCgMP8eCqFKKCXIm1rNuv1XmS7yKrHl7icjWSMp2NibsW4BYbJtpA/640?wx_fmt=gif)

> 细心的小伙伴们，一定发现了这里的 css 变量已经编译成浏览器可识别的 css 样式了。

### ElementUI 实现

* * *

官方的实现解释

*   先把默认主题文件中涉及到颜色的 CSS 值替换成关键词：github.com/ElementUI/t…
    
*   根据用户选择的主题色生成一系列对应的颜色值：github.com/ElementUI/t…
    
*   把关键词再换回刚刚生成的相应的颜色值：github.com/ElementUI/t…
    
*   直接在页面上加 `style` 标签，把生成的样式填进去：github.com/ElementUI/t…
    

已实现的链接参考：https://juejin.im/post/5ca41617f265da3092006155#heading-1

### less 在线编译实现

* * *

根据 **less** 可以直接 编译 **less 变量**实现的步骤如下：

```
// variable.less 定义less变量// 公共字体@font-size-large-x: 22px;@font-size-large: 18px;@font-size-medium: 14px;@font-size-medium-x: 16px;@font-size-small-s: 10px;@font-size-small: 12px;// 浅色@fill-1: #fff;@text: #3c3c3c;@text-1: #757575;@text-2: #222;// 页面使用 例如：// 下面.text的css 如下，这里的 @font-size-large 和  @text-2就是 less 变量：.text {    display: inline-block;    vertical-align: top;    line-height: 70px;    font-size: @font-size-large;    color: @text-2;  }
```

当点击换肤按钮的时候，直接去加载 `less.js`，具体代码如下:

```
<template>
  <div class="header">
    <div class="text">小恐龙换肤</div>
    <div role="switch" class="switch" :class="theme === true ? 'is-checked' : ''">
      <input type="checkbox" class="switch-input" />
      <span class="switch-core" @click="changeTheme"></span>
    </div>
  </div>
</template>

<script>
import { lightTheme, darkTheme } from "../../assets/js/variable";
export default {
  name: "m-header",
  data() {
    return {
      theme: true
    };
  },
  methods: {
    changeTheme() {
      this.theme = !this.theme;
      // 调用 `less.modifyVars` 方法来改变变量值
      window.less.modifyVars(this.theme ? lightTheme : darkTheme);
    }
  },
  mounted() {}
};
</script>
```

定义 variable.js 是因为如果直接将 less 变量放在 modifyVars 中切换的效果只会生效一次，所以根据切换的状态使用对应的 less 变量。

```
//浅色export const lightTheme = {  "@fill-1": "#fff",  "@text": "#3c3c3c",  "@text-1": "#757575",  "@text-2": "#222",};// 深色export const darkTheme = {  "@fill-1": "#222",  "@text": "#fff",  "@text-1": "rgba(255, 255, 255, 0.3)",  "@text-2": "#ffcd32",};
```

然后点击色块进行试验，发现并没有生效，这是 why？然后就去看了其文档，原来它会找到所有如下的 less 样式标签，并且使用已编译的 css 同步创建 style 标签。也就是说我们必须吧代码中所有的 less 都以下面这种 link 的方式来引入，这样`less.js` 才能在浏览器端实现编译。

> `<link rel="stylesheet/less" type="text/css" href="index.less" />`

这里我用了 vue，所以直接把 `less` 文件放在了`public`目录下，然后在 html 中直接引入：![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwzO1TyGsKkibXbFvCicB28vlI3Ase4AwPTjibNibUrdrHdUATP3xqVbFrOw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwkfVHUVq3C5ibEePSsfH8FMMibBtj7W73kkPwyKpeehCY01ySSnVNNy5g/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwZuvREjG45TBZg2ic65GAjMML263I7auacxKIRmu6rr7hQyY3o7iau3yw/640?wx_fmt=png)点击切换按钮，可见 background 和 color 确实都变了![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwlxWqF8vvnMIhxwbV4p6eaR2yena6XCIQQvCDxDF70mRZ3tl9trzl6Q/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXw9rRx2t0As4SdOlSaVOkX2g4fLwfSwAJHB7cnY8TJp6Zd4oTBdbhdrA/640?wx_fmt=png)

> 注：使用 less 来实现换肤要注意 `less 文件`在 `html` 中编写的位置，不然很可能被其他 css 文件所干扰导致换肤失败。如果 less 文件特别大，会存在编译性能问题。

### 拓展 - 图片切换

* * *

以上的方案 --- 只是对 background-color 和 color 进行的换肤，如果要对图片进行换肤该怎么办呐？                                     ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwkgibqhMC0GFMa18eDw4qUM3xzHP2NvUj6YRSSKWUDiczr6mvvU5qaSHQ/640?wx_fmt=png)

**图片切换**

项目中还存在很多占位图或者其他图片会随着主题的变化而变化。通过引入所有图片，并用文件名来区分不同主题所对应的图片。在点击切换主题时，切换到主题所对应的文件，就能实现图片切换了。

> `<img class :src="avatar" alt />`

```
// 页面实现<template>  <div class="header">    <div class="text">小恐龙换肤</div>    <div role="switch" class="switch" :class="theme === true ? 'is-checked' : ''">      <input type="checkbox" class="switch-input" />      <span class="switch-core" @click="changeTheme"></span>    </div>  </div></template><script>import { initTheme } from "../../theme";import bus from "../../bus";export default {  name: "m-header",  data() {    return {      theme: true, // false深色主题      avatar: ""    };  },  methods: {    changeTheme() {      this.theme = !this.theme;      initTheme(this.theme);      this.setThemeValue(this.theme);      bus.$emit("changeTheme", this.theme);    },    setThemeValue(theme) {      theme = theme ? "light" : "dark";      this.avatar = require(`@/assets/images/logo-${theme}.jpeg`);    }  },  created() {    this.setThemeValue(this.theme);  }};</script>
```

在点击切换主题时，会发射一个 `changeTheme` 事件，各组件接收到 `changeTheme` 事件，就会为图片重新赋值，也就达到了切换图片的效果。

![](https://mmbiz.qpic.cn/mmbiz_gif/pfCCZhlbMQThuicS0qWPEKz38FIgic5nXwjbu1ZHErBqR6jgp3yMgfwolL55ia1h2CvRzQt2ibI77jicP8VUWdjibdtw/640?wx_fmt=gif)

### 最后

* * *

很感谢能在百忙中抽出时间把这篇文章看完的小伙伴:) 如果还有什么疑问或者建议，可以多多交流，原创文章，文笔有限，才疏学浅，文中若有不正之处，万望告知。好了，本文到此结束，希望对你有帮助 :)