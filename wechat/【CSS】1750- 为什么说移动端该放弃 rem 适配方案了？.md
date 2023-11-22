> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GehX21Dffzk7q8Q1HiCD2g)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/iccXN8sGPLT42R7YXE6WA5fgjsBtYBZgI1b9BDseP6yODBv8XSc8mdaQNhwExyNJQqpyGhYlWvWGMcdvKoBujBQ/640?wx_fmt=jpeg)  

作者：去伪存真  

https://juejin.cn/post/7084926646033055752

### 1. 背景

在做移动端各种尺寸屏幕的适配时，用的最多的就是 rem 方案。我们都写过这样的代码, 来设置根字体大小。这个计算公式中设备宽度，UI 设计稿尺寸这两个参数比较好理解，可是为什么要除以 100 呢，为什么不是 10,50 或者其它的数值呢。

```
const setRem = () => {  const deviceWidth = document.documentElement.clientWidth;  // 获取相对UI稿，屏幕的缩放比例  const rem = (deviceWidth *100) / 750;  // 动态设置html的font-size  document.querySelector( html ).style.fontSize =  rem +  px ;};
```

查了一番资料才得知，rem 方案是 viewport 的过渡方案，将设计稿除以 100，等分为 7.5 份来实现移动端不同屏幕尺寸适配的原理，与 viewport 中 vw 单位的定义，设计思想与想要解决的问题，是相同的。当时浏览器对 viewport 的支持性不好，而现在已经是 2022 年了，可以看到，各大浏览器厂商，对 viewport 的支持率已经很高了。可以放心使用。

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqXibV6Nzgy0KVvzHav8mXaDffEJTTD4o8p6oApkWyp1yoMx5VnbVTSnCialEibQVBRzOpW0veFQ7yJpQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

### 2. 相对于 rem 的优势

*   语义化更好, rem 从本义上来说，是一种字体单位，不是用来做布局和各种屏幕尺寸大小适配的，如上面的示例，用 rem 做适配单位，计算根字体的时候，计算公式中的 100 这个参数让人感觉很费解，viewport 词更达意。
    
*     
    

可以直接在代码中书写 px, 借助 postcss-px-to-viewport 插件转换成 vw 单位，完美适配移动端各种屏幕尺寸。不用像之前那样，一是要在蓝湖上设置根字体基准尺寸，将设计稿标注的 px 单位转换成 rem 单位，然后摘抄到代码中。二是需要用 js 计算设置根字体大小。前端开发天然喜欢 px 单位，像 rem,em,vw，vh 这些单位，一般都不是 UI 设计稿标注的尺寸，开发时需要转换成本。不如直接在代码中写 px 直观高效。

### 3. postcss-px-to-viewport 方案正确的使用姿势

看到网上的教程都是说要在项目中安装 postcss-px-to-viewport 工具包，然而安装和配置完 postcss-px-to-viewport 之后，运行项目，发现命令行出现如下报错：

```
postcss-px-to-viewport: postcss.plugin was deprecated. Migration guide: https://evilmartians.com/chronicles/postcss-8-plugin-migration<br style="outline: 0px;">
```

说安装的 postcss-px-to-viewport 已经过时了，迁移指南参考 evilmartians.com/chronicles/…[1]

点进入一看，根本找不到配置 px 转 vw 单位的方法。后面经过一番尝试之后，最终找到了正确的使用方法。

#### 3.1 安装 postcss-px-to-viewport-8-plugin

```
yarn add -D postcss-px-to-viewport-8-plugin<br style="outline: 0px;">
```

#### 3.2 在项目下创建 postcss.config.js

```
module.exports = {  plugins: {     postcss-px-to-viewport-8-plugin : {      unitToConvert:  px , // 需要转换的单位，默认为"px"      viewportWidth: 750, // 设计稿的视口宽度      unitPrecision: 5, // 单位转换后保留的精度      propList: [ * , !font-size ], // 能转化为vw的属性列表,!font-size表示font-size后面的单位不会被转换      viewportUnit:  vw , // 希望使用的视口单位      fontViewportUnit:  vw , // 字体使用的视口单位      // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。      // 下面配置表示类名中含有 keep-px 都不会被转换      selectorBlackList: [ keep-px ],      minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换      mediaQuery: false, // 媒体查询里的单位是否需要转换单位      replace: true, //  是否直接更换属性值，而不添加备用属性      exclude: [/node_modules/], // 忽略某些文件夹下的文件或特定文件，例如  node_modules  下的文件      include: [/src/], // 如果设置了include，那将只有匹配到的文件才会被转换      landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)      landscapeUnit:  vw , // 横屏时使用的单位      landscapeWidth: 1338, // 横屏时使用的视口宽度    },  },};
```

### 4 效果演示

在项目中直接写 px, 运行项目之后，可以看到 px 已经转换成 vw 单位了

```
#app{  width:100px}
```

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqXibV6Nzgy0KVvzHav8mXaDf522DuJMmDV6JxgQKjZxlFjJfzCk7zaZtE9UDjwfqdnDvKiaicKHmZQiaQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

需要注意的是：

*   1.postcss-px-to-viewport 对内联 css 样式，外联 css 样式，内嵌 css 样式有效，对 js 动态 css 无效。所以要动态改变 css 展示效果的话，要使用静态的 class 定义变化样式，通过 js 改变 dom 元素的 class 实现样式变化。
    
*   2.Vant 组件的设计稿尺寸是 375px，可用通过覆盖: root 下的 Vant 的 css 变量中 px 单位的方式，对 Vant 组件做适配
    
*     
    

3.vue 模板中的 px 单位不会被转换，如需转换请使用 postcss-style-px-to-viewport[2] 工具

本文仅代表个人观点，非喜勿喷。

### 参考资料

[1]

https://evilmartians.com/chronicles/postcss-8-plugin-migration: _https://link.juejin.cn?target=https%3A%2F%2Fevilmartians.com%2Fchronicles%2Fpostcss-8-plugin-migration_

[2]

https://www.npmjs.com/package/postcss-style-px-to-viewport: _https://link.juejin.cn?target=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fpostcss-style-px-to-viewport_

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2wV7LicL762ZUCR5WEela9H9fDfYic8BAp8ib4cmuicFgACoRwORYGwkBtgUVaILLOjXtlGBnicuM5246MgketktMCg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

点个在看支持我吧，转发就更好了