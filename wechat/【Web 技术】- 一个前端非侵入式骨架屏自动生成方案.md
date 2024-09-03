> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1nml9naEMNSaH5b0FdNBKg)

背景
--

性能优化、减少页面加载时间、提升用户体验，是前端领域的一个永恒话题。在前后端分离、异步渲染在页面中被普遍应用的背景下，大量页面在用户访问时不可避免的会出现一段短时间白屏。目前的解决方案一般为以下几种：

*   服务端同步渲染
    
*   增加页面 loading
    
*   增加页面首屏骨架屏
    

这几种方案各有优缺点，服务端同步渲染优点在于效果最好，缺点在于成本过高，需要在服务器部署、运维方面有较大的投入；页面 loading 是优点是通用性强、成本低，缺点是传递给用户的信息量过少；首屏骨架屏的优点在于能够给提前给用户充分信息量，预先获取用户关注点，让用户关注焦点提前聚焦到感兴趣位置，真实数据替换骨骼图过程过渡自然，渐进式渲染，要用户感知更快，缺点在于成本稍高，一般的解决方案要自己手写一份骨架屏代码。

综合以上分析，骨架屏是一种不错的解决加载过程中短暂白屏问题的解决方法。

现有方案调研
------

目前市面上的骨架屏方案大体可以分为以下几种。

### 侵入业务式手写代码

这种方式是直接在写业务代码的时候将骨架屏代码写好，该代码作为业务代码的一部分，每次修改骨架屏代码都相当于在修改业务代码。因此对业务代码有一定侵入性，后续维护成本略高。

示例如下：

*   Skeleton Screen -- 骨架屏 [1]
    
*   Building Skeleton Screens with CSS Custom Properties[2]
    

### 非侵入业务式手写代码

这种方式依然需要手写骨架屏代码，不过该代码和业务代码分离，通过 webpack 注入的方式注入到项目源码中。好处是使骨架屏代码和业务代码解耦，后续维护成本降低，缺点是 webpack 有一定的配置成本。

示例如下：

*   Vue 页面骨架屏注入实践 [3]
    
*   Vue 页面骨架屏 [4]
    
*   Vue 单页面骨架屏实践 [5]
    

### 非侵入式骨架屏代码自动生成

这种方式无需手写骨架屏代码，骨架屏代码自动生成且自动注入到项目源码中。无须手写骨架屏代码，使用成本低是这种方式最明显的特点。

示例如下：

*   一种自动化生成骨架屏的方案 - 饿了么 [6]
    

技术方案
----

综合考虑现有方案的优缺点，我们决定采用使用成本最低的非侵入式骨架屏自动生成方案。站在巨人的肩膀上，参考饿了么骨架屏方案的设计思路，并加入一些新的优化思路，设计出一种新的骨架屏自动生成方案。

### 设计原则

设计方案前，先明确我们的设计原则。个人认为一个好的骨架屏方案应该具备以下原则：

*   骨架屏自动生成
    
*   使用和维护成本低
    
*   配置灵活
    
*   还原度高
    
*   尽量不影响加载性能
    

基于以上设计原则，我们对方案进行了如下设计：

*   骨架屏由 puppeteer 自动获取生成
    
*   方案以 npm 包的方式落地，支持命令行、node 调用两种使用方式
    
*   多种参数配置，可灵活配置页面地址、页面名称、viewport、输出路径、注入路径等
    
*   基于真实页面做骨架处理后，获取页面截屏或源码，保证还原度
    
*   采用 base64 图片作为骨架屏的默认输出形式，注入作为页面背景图片，体积小至几 K，不增加额外网络请求，避免对加载性能造成影响
    

### 架构图

基于以上设计思路，对骨架屏方案进行设计。技术框架如下。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyobclHCaXicNcgSOPN31xzVHMKCJzPApiadE9Fxiaz7O3RNfwq9h06l3XrQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

该骨架屏方案分为骨架屏生成和骨架屏注入项目源码两个环节。下面对这两个环节分别进行介绍。

#### 骨架屏生成

骨架屏生成分为准备、处理和输出三个阶段。

*   准备阶段为使用 puppeteer 模拟打开目标页面，等待页面充分加载完成后；
    
*   处理阶段为调用处理器进行脚本、图片、a 标签、文本、自定义属性进行处理，并获取到首屏的 html 和样式 style 代码；
    
*   输出阶段为将获取的骨架屏以 "base64 图片" 和 "HTML + 样式 style 代码" 两种形式进行输出。
    

#### 骨架屏注入

骨架屏生成阶段有两种形式的产出，base64 图片和 HTML + 样式代码，考虑到 base64 图片比 HTML 源码整体要小很多（测试结果，base64 图片只有 4k 大小，HTML 源码有 23k 大小，并且 base64 图片可以非常灵活的作为页面背景图，不对页面中其他 DOM 节点造成干扰，具有注入量更小、使用更灵活的特点，因此本方案在骨架屏注入阶段默认注入 base64 图片作为页面背景图。

优化点
---

本方案基于社区现有骨架屏方案，主要做了如下优化：

*   以 npm 包为最终形态，支持 node 和命令行两种使用方式，使用更加方便灵活；
    
*   骨架屏注入直接通过 node 文本写入，无需进行 webpack 配置，使用门槛更低；
    
*   骨架屏生成物有 base64 图片和 html 源码两种形式，方便不同使用场景使用。目前 base64 图片一般用作页面背景图，HTML 源码用于在骨架屏出现不符合预期色块时的问题定位。
    
*   骨架屏注入默认使用 base64 图片作为页面背景图方式。背景图片正常只有 4k 大小，同时又能够有更好的拓展性，比如可以非常灵活的支持为页面增加渐现效果，这一点在 html 源码形式下，就无法很好支持，会出现明显的页面闪动。
    

\

部分技术细节解析
--------

### puppeteer

Puppeteer(中文翻译” 木偶”) 是 Google Chrome 团队官方的无界面（Headless）Chrome 工具，它是一个 Node 库，提供了一个高级的 API 来控制 DevTools 协议上的无头版 Chrome 。也可以配置为使用完整（非无头）的 Chrome。

使用示例：

```
const puppeteer = require('puppeteer');(async () => {  const browser = await puppeteer.launch();  const page = await browser.newPage();  await page.setViewport({width: 375, height: 812});  // 事件监听，可用于事件通信  page.on('console', msg => console.log('PAGE LOG:', msg.text()));  page.on('warning', msg => console.log('PAGE WARN:', JSON.stringify(msg)));  page.on('error', msg => console.log('PAGE ERR:', ...msg.args));    // waitUntil 参数为 load/domcontentload/networkidle0/networkidle2  await page.goto('https://news.ycombinator.com', {waitUntil: 'networkidle2'});  // 对打开的页面进行操作  const dimensions = await page.evaluate(() => {    return {      width: document.documentElement.clientWidth,      height: document.documentElement.clientHeight,      deviceScaleFactor: window.devicePixelRatio    };  });  // 将页面截图，输出为 pdf 或 图片  await page.pdf({path: 'hn.pdf', format: 'A4'});  await page.screenshot({path: 'example.png'});  await browser.close();})();
```

这里有个参数非常实用，单独拎出来给大家看下。这个参数就是 waitUntil 参数解析：

```
waitUntil <string|Array<string>> When to consider navigation succeeded, defaults to load. Given an array of event strings, navigation is considered to be successful after all events have been fired. Events can be either:load - consider navigation to be finished when the load event is fired.domcontentloaded - consider navigation to be finished when the DOMContentLoaded event is fired.networkidle0 - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.networkidle2 - consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
```

这个参数的主要作用是让 puppeteer 在对页面做打开、回退等操作时，等待一定时间再返回。一共有四个参数，分别是 load/domcontentloaded/networkidle0/networkidle2 。其中 networkidle0 和 networkidle2 比较特殊，值得注意，networkidle0 指在 500ms 内没有任何请求发出去，networkidle2 指在 500ms 内有不多于 2 个请求发出去。这两个参数可以保证让页面能够得到充分加载。避免在页面未完全加载完时就进行相关操作，最终操作结果和预期不一致。

### 文本块处理

文本块的处理相对比较复杂，一段文本（单行或多行），要将文本替换为和文本长度相同的灰色背景。文本块的容器也有 2 种可能：行内元素，如 span；块级元素，如 div。

下面我们队这样一个多行文本做处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyoSoKqIPCOrqsIKTkFwiaZgdu5791UzKFQMvyYPFDqyBHiceOfbQ07BpTQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

能够想到的一个比较直接的方法是给文本容器增加灰色背景色，但是添加后效果往往是这个样子的。

*   行内元素容器下，如 span  
    ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyoaibPyr8xgSr6TflmFDzmWqtW3cbYj0a6TTq5S5gzDnpudYu7kJEBNFw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
    
*   块级元素容器下，如 div  
    ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyoyiagibJUS5Z8fiajicVQuDOUicoHWbyCAuKMq5NLcBG6uZ8zKCbZdEOqHIg/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
    

多行文本的情况下，会发现背景是黏在一起的，十分不美观，也没法让人一眼看出这是两行文本。

这种情况下应该如何处理呢，linear-gradient 是一个不错的解决思路。

使用 linear-gradient 对文本块进行背景处理。

*   行内元素  
    html:
    

```
<span class="text">我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题</span>
```

css:  
效果：  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyoRrhMkYELHO3H7ib4akIX84Q887HLDt3w5ftIDIVibdbqbAiaPC4uGe8kg/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

*   块级元素  
    块级元素添加背景后，会铺满正行，为让效果更像多行文本，会增加额外的末行背景遮盖处理。  
    html:
    

```
<div class="text">我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题我是标题<span class="text-mask"></span></div>
```

css:  
效果如图：  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyofUAreovP63icNoeopxbtyPMPT0EibLGhQiagy1FeY4WsScwKc4AxqR4aw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 图片块处理

图片处理逻辑较为简单，将所有 img 标签的 src 设为 1x1px 的灰色 base64 图片 ，背景色也设为相同色值的灰色。

```
Array.from(document.body.querySelectorAll('img')).map(img => {  img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';  img.style.backgroundColor = '#EEEEEE';});
```

### a 标签处理

为防止骨架屏的 html 形态中 a 标签仍然可点，将所有 a 标签的 href 设为 javascript:void(0); 。

```
Array.from(document.body.querySelectorAll('a')).map(a => {  a.href = 'javascript:void(0);';});
```

### 自定义属性处理

一个页面中元素一般非常多，所以按照默认的规则处理后，很有可能得到的骨架屏中色块比较杂乱，不够美观。这个时候可以使用如下四个自定义属性进行设置，将骨架屏效果调至最优。

```
属性：data-skeleton-remove：指定进行移除的 dom 节点属性data-skeleton-bgcolor：指定在某 dom 节点中添加的背景色data-skeleton-ignore：指定忽略不进行任何处理的 dom 节点属性data-skeleton-empty: 将某dom的innerHTML置为空字符串示例：<div data-skeleton-remove><span>abc</span></div><div data-skeleton-bgcolor="transparent"><span>abc</span></div><div data-skeleton-ignore><span>abc</span></div><div data-skeleton-empty><span>abc</span></div>
```

处理前：  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyoNbKsIrWy6fVpAIdexc4bZ1InYKGzGkFpBsYU5F3UCZ12D6drDH3Ulg/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

处理后：  
![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyogcSib1CPqE2NoQ1npicrMAMfeqYAicpMWKV7f0BkW4qkibwGYZnuDzib8SQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 首屏 HTML 处理

为了使生成的骨架屏 HTML 源码没有冗余，代码量最小，须对非首屏节点直接移除。处理逻辑中核心代码如下。

```
function inViewPort(ele) {    try {      const rect = ele.getBoundingClientRect()      return rect.top < window.innerHeight &&        rect.left < window.innerWidth    } catch (e) {      return true;    }}
```

### 首屏样式处理

样式的处理同上，非首屏节点用到的样式也要移除，避免获取的 HTML 源码中样式冗余。

获取当前页面所有样式，非首屏样式直接移除，核心处理代码如下。

```
const styles = Array.from(document.querySelectorAll('style')).map(style => style.innerHTML || style.innerText);// 移除非首屏样式function handleStyles(styles, html) {    const ast = cssTree.parse(styles);    const dom = new JSDOM(html);    const document = dom.window.document;    const cleanedChildren = [];    let index = 0;    ast && ast.children && ast.children.map((style) => {        let slectorExisted = false,            selector;        switch (style.prelude && style.prelude.type) {            case 'Raw':                selector = style.prelude.value && style.prelude.value.replace(/,|\n/g, '');                slectorExisted = selectorExistedInHtml(selector, document);                break;            case 'SelectorList':                style.prelude.children && style.prelude.children.map(child => {                    const children = child && child.children;                    selector = getSelector(children);                    if (selectorExistedInHtml(selector, document)) {                        slectorExisted = true;                    }                });                break;        }        if (slectorExisted) {            cleanedChildren.push(style);        }    });    ast.children = cleanedChildren;    let outputStyles = cssTree.generate(ast);    outputStyles = outputStyles.replace(/},+/g, '}');    return outputStyles;}function selectorExistedInHtml(selector, document) {    if (!selector) {      return false;    }    // 查询当前样式在 html 中是否用到    let selectorResult, slectorExisted = false;    try {      selectorResult = document.querySelectorAll(selector);    } catch (e) {      console.log('selector query error: ' + selector);    }    if (selectorResult && selectorResult.length) {      slectorExisted = true;    }    return slectorExisted;}
```

效果演示
----

总结一下，该方案有如下优点：

*   无代码侵入
    
*   接入成本低
    
*   两种产出，使用灵活
    
*   自然过渡，避免闪屏
    

效果演示如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyoglbuNPbicvhkHjibJMicx9fvPFh0ZuHXRmOcjd96BXUDP1sVSeDbIibWfQ/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

业务实践
----

业务实践效果如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/XP4dRIhZqqV9v9XumyibSqmicJAJZpvbyogPNOupS2aawCk7dclR06rIQpv1JO2kibR4jic9xUNwC3FXZ15zI1AEKw/640?wx_fmt=other&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

###   
参考资料

[1]

http://www.bestvist.com/p/50: https://link.juejin.cn?target=http%3A%2F%2Fwww.bestvist.com%2Fp%2F50

[2]

https://css-tricks.com/building-skeleton-screens-css-custom-properties/: https://link.juejin.cn?target=https%3A%2F%2Fcss-tricks.com%2Fbuilding-skeleton-screens-css-custom-properties%2F

[3]

https://segmentfault.com/a/1190000014832185: https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000014832185

[4]

https://segmentfault.com/a/1190000014963269: https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000014963269

[5]

https://segmentfault.com/a/1190000012403177: https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000012403177

[6]

https://gitissue.com/issues/5af2a74a9c2d3728a0a0de8b: https://link.juejin.cn?target=https%3A%2F%2Fgitissue.com%2Fissues%2F5af2a74a9c2d3728a0a0de8b

作者：前端冒菜师

原文：https://juejin.cn/post/7143502980040359950