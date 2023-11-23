> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/X2IK5mA6HRcnl2_d9NpNOg)

来源：花满楼

https://zhuanlan.zhihu.com/p/74403911

**什么是骨架屏？**

什么是骨架屏呢？骨架屏 (Skeleton Screen) 是指在页面数据加载完成前，先给用户展示出页面的大致结构（灰色占位图），在拿到接口数据后渲染出实际页面内容然后替换掉。Skeleton Screen 是近两年开始流行的加载控件，本质上是界面加载过程中的过渡效果。

假如能在加载前把网页的大概轮廓预先显示，接着再逐渐加载真正内容，这样既降低了用户的焦灼情绪，又能使界面加载过程变得自然通畅，不会造成网页长时间白屏或者闪烁。这就是 Skeleton Screen ！

Skeleton Screen 能给人一种页面内容 “已经渲染出一部分” 的感觉，相较于传统的 loading 效果，在一定程度上可提升用户体验。

**骨架屏的实现方案**

目前生成骨架屏的技术方案大概有三种：

1. 使用图片、svg 或者手动编写骨架屏代码：使用 HTML + CSS 的方式，我们可以很快的完成骨架屏效果，但是面对视觉设计的改版以及需求的更迭，我们对骨架屏的跟进修改会非常被动，这种机械化重复劳作的方式此时未免显得有些机动性不足；

2. 通过预渲染手动书写的代码生成相应的骨架屏：该方案做的比较成熟的是 vue-skeleton-webpack-plugin，通过 vueSSR 结合 webpack 在构建时渲染写好的 vue 骨架屏组件，将预渲染生成的 DOM 节点和相关样式插入到最终输出的 html 中。

```
// webpack.conf.js const SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin'); plugins: [  //...  new SkeletonWebpackPlugin({    webpackConfig: {      entry: {        app: resolve('./src/entry-skeleton.js')      }    }  }) ]
```

该方案的前提同样是编写相应页面的骨架屏组件，然后预渲染生成骨架屏所需的 DOM 节点，但由于该方案与 vue 相关技术直接关联，在当今前端框架三分天下的大环境下，我们可能需要一个更加灵活、可控的方案；

3 . 饿了么内部的生成骨架页面的工具：该方案通过一个 webpack 插件 page-skeleton-webpack-plugin 的方式与项目开发无缝集成，属于在自动生成骨架屏方面做的非常强大的了，并且可以启动 UI 界面专门调整骨架屏，但是在面对复杂的页面也会有不尽如人意的地方，而且生成的骨架屏节点是基于页面本身的结构和 CSS，存在嵌套比较深的情况，体积不会太小，并且只支持 history 模式。

```
// webpack.conf.js const HtmlWebpackPlugin = require('html-webpack-plugin') const { SkeletonPlugin } = require('page-skeleton-webpack-plugin') const path = require('path') plugins: [  //...  new HtmlWebpackPlugin({    // Your HtmlWebpackPlugin config  }),  new SkeletonPlugin({    pathname: path.resolve(__dirname, `${customPath}`), // 用来存储 shell 文件的地址    staticDir: path.resolve(__dirname, './dist'), // 最好和 `output.path` 相同    routes: ['/', '/search'], // 将需要生成骨架屏的路由添加到数组中  }) ]
```

**我们的实现方案**

后来仔细想想，骨架屏这幅样子不是和一堆颜色块拼起来的页面一样吗？对比现有的骨架屏方案，这个想法有点 “走捷径” 的感觉。再进一步思考，这些色块基于当前页面去分析节点来生成，不如来段 JS 分析页面节点，一顿 DOM 操作生成颜色块拼成骨架屏。那么问题来了，该怎么样精确的分析页面节点，不同节点又该生成什么样的色块呢？

既然骨架屏代表了页面的大致结构，那么需要先用 js 对页面的结构进行分析。分析之前，我们需要制定一种规则，以确定需要排除哪些节点？哪些种类的节点需要生成颜色块？生成的颜色块如何定位等等。我们初步定下的规则如下：

1. 只遍历可见区域可见的 DOM 节点，包括：

非隐藏元素、宽高大于 0 的元素、非透明元素、内容不是空格的元素、位于浏览窗口可见区域内的元素等；

2. 针对（背景）图片、文字、表单项、音频视频、Canvas、自定义特征的块等区域来生成颜色块；

3. 页面节点使用的样式不可控，所以不可取 style 的尺寸相关的值，可通过 getBoundingClientRect 获取节点宽、高、距离视口距离的绝对值，计算出与当前设备的宽高对应的百分比作为颜色块的单位，来适配不同设备；

基于这套规则，我们开始生成骨架屏：

首先，确定一个 rootNode 作为入口节点，比如 document.body，同时方便以后扩展到生成页面内局部的骨架屏，由此入口进行递归遍历和筛选，初步排除不可见节点。

```
function isHideStyle(node) {    return getStyle(node, 'display') === 'none' ||         getStyle(node, 'visibility') === 'hidden' ||         getStyle(node, 'opacity') == 0 ||        node.hidden;}
```

接下来判断元素特征，确定是否符合生成条件，对于符合条件的区域，”一视同仁”生成相应区域的颜色块。”一视同仁”即对于符合条件的区域不区分具体元素、不考虑结构层级、不考虑样式，统一根据该区域与视口的绝对距离值生成 div 的颜色块。之所以这样是因为生成的节点是扁平的，体积比较小，同时避免额外的读取样式表、通过抽离样式维持骨架屏的外观，这种统一生成的方式使得骨架屏的节点更可控。基于那上述 “走捷径” 的想法，该方法生成的骨架屏是由纯 DOM 颜色块拼成的。

生成颜色块的方法：

```
const blocks = [];// width,height,top,left 都是算好的百分比function drawBlock({width, height, top, left, zIndex = 9999999, background, radius} = {}) {  const styles = [    'position: fixed',    'z-index: '+ zIndex,    'top: '+ top +'%',    'left: '+ left +'%',    'width: '+ width +'%',    'height: '+ height +'%',    'background: '+ background  ];  radius && radius != '0px' && styles.push('border-radius: ' + radius);  // animation && styles.push('animation: ' + animation);  blocks.push(`<div style="${ styles.join(';') }"></div>`);}
```

绘制颜色块并不难，绘制之前的分析确认才是这个方案真正的核心和难点。比如，对于页面结构比较复杂或者大图片比较多的页面，由图片拼接的区域没有边界，生成的颜色块就会紧挨着，出现不尽如人意的地方。再比如，一个包含很多符合生成条件的小块的 card 块区域，是以 card 块为准还是以里面的小块为准来生成颜色块呢？如果以小块为准，绘制结果可能给人的感觉压根就不是一个 card 块，再加上布局方式和样式的可能性太多，大大增加了不确定因素。而如果以 card 块为准生成颜色块的话还要对 card 块做专门的规则。

目前来说，对于页面结构不是特别复杂，不是满屏图片的，不是布局方式特别 “飘逸 “的场景，该方式已经可以生成比较理想的骨架屏了。而对于那些与预期相差较远的情况，我们提供了两个钩子函数可供微调：

1. init 函数，在开始遍历节点之前执行，适合删除干扰节点等操作。

2. includeElement(node, draw) 函数，可在遍历到指定节点时，调 用 draw 方法进行自定义绘制。

通过以上步骤就能够直接在浏览器中生成骨架屏代码了。

**在浏览器里运行**

由于我们的方案出发点是通过单纯的 DOM 操作，遍历页面上的节点，根据制定的规则生成相应区域的颜色块，最终形成页面的骨架屏，所以核心代码完全可以直接跑在浏览器端；

```
const createSkeletonHTML = require('draw-page-structure/evalDOM')    createSkeletonHTML({        // ...        background: 'red',        animation: 'opacity 1s linear infinite;'    }).then(skeletonHTML => {        console.log(skeletonHTML)    }).catch(e => {        console.error(e)    })
```

**结合 Puppeteer 自动生成骨架屏**

虽然该方式已经可以生成骨架屏代码了，但是还是不够自动化，为了让生成的骨架屏代码自动加载进指定页面。于是，我们开发了一个配套的 CLI 工具。这个工具通过 Puppeteer 运行页面，并把 evalDOM.js 脚本注入页面自动执行，执行的结果是生成的骨架屏代码被插入到应用页面。

我们的方案大概思路如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHobp5iaFW2AG2jWq1jqiasMLkiaEqHTKgzPfrRdCiaa6OuYP83ibjVYmWZeOfV0oaHhicwpWibWKJLKicZXzg/640?wx_fmt=jpeg)

接下来看看如何使用 CLI 工具生成骨架屏，最多只需如下四步：

1. 全局安装，npm i draw-page-structure – g

2. dps init 生成配置文件 dps.config.js

3. 修改 dps.config.js 进行相关配置

4. dps start 开始生成骨架屏

只需简单几步，然而并没有繁琐的配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHobp5iaFW2AG2jWq1jqiasMLkNZEswYiaWlngm2COAge9zatsLPeuGMsYsDHqYG4FFaCfJpN1ibdwMFBQ/640?wx_fmt=jpeg)

一般来说，你需要按自己的项目情况来配置 dps.config.js ，常见的配置项有：

*   url: 待生成骨架屏的页面地址
    
*   output.filepath: 生成的骨架屏节点写入的文件
    
*   output.injectSelector: 骨架屏节点插入的位置，默认 #app
    
*   background: 骨架屏主题色
    
*   animation: css3 动画属性
    
*   rootNode: 真对某个模块生成骨架屏
    
*   device: 设备类型，默认 mobile
    
*   extraHTTPHeaders: 添加请求头
    
*   init: 开始生成之前的操作
    
*   includeElement(node, draw): 定制某个节点如何生成
    
*   writePageStructure(html, filepath): 回调的骨架屏节点
    

详细代码及工具的使用请移步 [Github]( famanoder/dps)；

**初步实现的效果：**

* 京东 PLUS 会员正式中首页：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHobp5iaFW2AG2jWq1jqiasMLk7QbRdR81xxxicgAT3tTcy1jkOicDYCwEus7A4Eic7bpMsqE7icmBJYYhicw/640?wx_fmt=jpeg)

* 京东 PLUS 会员正式中首页，通过该方案生成的骨架屏效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHobp5iaFW2AG2jWq1jqiasMLkofroLG2JicMSvx1g9rfGAjGIX6sias9kyhBOQ2MHTIAHQey6ibnZic3l2w/640?wx_fmt=gif)

* 移动端百度首页，通过该方案生成的骨架屏效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHobp5iaFW2AG2jWq1jqiasMLkJibaaysPice1pVLcV9W9XCCmGdK5Tj0iblKgk4cPILq8n7TIicwORmvNUw/640?wx_fmt=jpeg)

**总结**

以上就是基于 DOM 的骨架屏自动生成方案，其核心是 evalDOM 函数。这个方案在很多场景下的表现还是令人满意的。不过，网页布局和样式组合的可能性太多，想要在各种场景下都获得理想的效果，还有很长的路要走，但既然已经在路上，就勇敢的向前吧！

欢迎 star，欢迎提 PR ！https://github.com/famanoder/dps

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHobp5iaFW2AG2jWq1jqiasMLkuhTc7EJVQgmmDVzx1ribCYXH1Z5vDCQYS4zYZV4KicDgGQmbOHy00pKg/640?wx_fmt=jpeg)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)

》》面试官都在用的题库，快来看看《《