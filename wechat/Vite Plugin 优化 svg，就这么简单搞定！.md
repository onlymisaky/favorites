> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1B1jvTDk2UYvIkS3Icm6Vg)

> 前言  

最近，在做项目优化的时候，突然发现有一个点可能我们平时都很少去注意 - 我们如何维护和使用`svg`。当我们项目中`svg`资源过多时，无论是资源管理还是资源引入都是一个让人头疼的问题。

之前使用 svg 的方式
------------

```
const svgSrc from "@/assets/svg/xx.svg";const SvgIcon = () => {  return <svg {...attribute}>            <use xlinkHref={`#${svgSrc}`} />        </svg>}
```

那如果项目中有如下代码，阁下该如何应对。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3XibINLB9McHUlrXibicHFw5apVqJlaSHUA5a9fAhgvuU4qKaGnHnaZJyw/640?wx_fmt=png&from=appmsg)

那我们就会重复如上的动作

1.  从指定目录中引入文件资源 (`src`)
    
2.  在指定的组件或者`svg元素`中接收`src`
    
3.  在合适的地方进行渲染处理。
    

之后使用 svg 的方式
------------

不知道，大家之前用过 Image Sprites[1]，也就是我们常说的**「雪碧图」**。它能够把我们项目中用到的图片或者图标放置到一个图片中，然后依据图片位置来从中获取到我们像要展示的图片资源。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3IicOialDRzdFZTKcFttAgQBU9lK3Muus5NbMjLJpb9vn1Faz9J0yYonA/640?wx_fmt=png&from=appmsg)

其实，我们也可以用类似的方式来处理`SVG`，也就是`SVG Sprites`。我们可以将项目中所有的`svg`都放置到一个`svg`文件中 (我们暂且叫它`all.svg`)。然后，通过一个唯一 id 来获取到想要渲染的`svg`内容。

像上面的例子中，我们就可以使用如下的代码

```
const SvgIcon: FC<{ name: string }> = ({ name }) => (  <svg>    <use href={`/all.svg#${name}`} />  </svg>);const App = () => {  return <>    <SvgIcon  />  </>};
```

可以看到，我们在渲染对应的`svg`的时候，只需要提供一个**「唯一 ID」**即可 (这里做一下剧透，其实就是`svg`的文件名称)

那么，我们如何才能让我们的项目如此丝滑的使用这种特性呢。再这里，我们选择了写一个`vite-plugin`来解决这个问题。当然，也可以写`Webpack-plugin`，虽然他们插件机制不同，但是在插件处理资源的是逻辑都是相同的，也就是我们下文中的`Node部分`

好了，天不早了，干点正事哇。

![](https://mmbiz.qpic.cn/mmbiz_gif/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3u3WV2YsYiczS8FtX36Va8yNMdm82OHE3uM9R35uOfLunYWK7oPcDwXA/640?wx_fmt=gif&from=appmsg)

### 我们能所学到的知识点

> ❝
> 
> 1.  `SVG` 是个啥？
>     
> 2.  `Node` 处理`SVG`
>     
> 3.  插件实现逻辑
>     
> 4.  使用`microbundle`进行打包
>     
> 
> ❞

* * *

1. SVG 是个啥？
===========

我们之前在[位图 / 矢量图 / GIF/PNG/JPEG/WEBP 一网打尽](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247491922&idx=1&sn=ce76a50139885f57ef3969454e75a90f&scene=21#wechat_redirect)中简单介绍过各种图片格式的优缺点。文中的主要重点集中在**「位图」**上。不过，我们也简单介绍过**「矢量图」**的概念。下面我们就拿来主义了。

SVG 是矢量图的一种
-----------

我们从维基百科中寻找关于矢量图 [2] 的信息。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3MwVyJOSR4rzFFdhhANO9kEgdZVxmXt3rzwjnUaTjkssnfial0OazlEQ/640?wx_fmt=png&from=appmsg)

从上面的信息，我们可以得知。`矢量图`是使用**「数学公式」**生成的，这些公式转化为在网格上对齐的`点`、`线`和`曲线`。

> ❝
> 
> `矢量图`**「不是基于像素的，这意味着在调整大小时不受限制」**。它们是分辨率独立的 - 我们可以调整矢量图形的大小而不会丢失质量或出现视觉伪影。
> 
> ❞

`矢量图`可以帮助我们创建性能友好的 UI 设计元素、可以`无限缩放`，或者以极低成本制作的快速加载的解释性动画。基于这些特性，我们如果考虑网络性能时并且图像的还原度不是很高的话，我们一般首选`SVG`(可缩放的矢量图)。

`矢量图`形常见于 `SVG`、`WMF`、`EPS`、`PDF`、`CDR` 或 `AI` 类型的图形文件格式。

SVG 文件
------

从上面得知，`SVG`是使用矢量构建的图形。`矢量`是具有特定大小和方向的元素。理论上，我们可以使用一组矢量生成几乎任何类型的图形。

例如，我们有如下的一个`PNG`格式的图片。![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou33gEApQDvIdShXLvyeKvonW7XwFpvicEoSC4LTia4NIdT5vUARR7845Lg/640?wx_fmt=png&from=appmsg)

其实，我们可以用`SVG`达到相同的效果。以下代码可以实现相同的结果：

```
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" version="1.1" baseProfile="full" >   <rect x="0" y="0" width="60" height="60" style="stroke: blue;"/>  <rect id="myRect" x="25" y="25" rx="0.6" ry="0.6" width="150" height="150" fill="blue" stroke="black" stroke-width="8"/></svg>
```

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3zdB1e9nDibH0rrk9yJBpbHvvamiaG7ygoOODIxfibN3NZibo9PUU47icWXA/640?wx_fmt=png&from=appmsg)

尽管两种图像看起来相同，但`SVG`提供了其他格式所不具备的一系列好处。例如，`SVG`能够在**「缩放时保持图像质量」**。如果我们不断放大`PNG`，我们会注意到在某个点开始**「质量下降」**。对于更复杂的基于像素的图形，退化速度要快得多。但是，`SVG`在几乎任何分辨率下都表现良好。

为什么使用 SVG 文件
------------

尽管`SVG`不太灵活。但是，`SVG`是一系列其他情况的绝佳选择：

1.  Logo 设计。由于我们可能会在`pc端`和`移动端`重复使用 Logo，使用`SVG`解决了潜在的可伸缩性问题。
    
2.  插图。`SVG`非常适合图表和任何依赖简单线条的插图。
    
3.  动画元素。我们可以使用`CSS`来为`SVG`添加动画效果，这使它们成为网站设计中的有用组件，特别是那些应用简单特效的元素。
    
4.  图表。我们可以使用`SVG`创建可伸缩的支持动画的图表。
    
5.  最后，`SVG`通常比其他格式的高分辨率等效文件小得多。从理论上讲，这意味着我们可以减少一些页面大小并减少加载时间。但是，除非我们计划将大多数图像转换为`SVG`，否则性能提升可能会很小。
    

`<symbol>`
----------

本来呢，这篇文章不想过多的引入`SVG`的概念，但是呢有一个概念确实我们实现`SVG Sprite`的核心点。所以这里来简单介绍一下，以免下文中我们直接抛出这个概念的时候，你不会感觉到唐突。

在`svg`的语言体系中，有一个定义图形模板的方式, 那就是使用 symbol[3], 然后我们可以使用`<use>`来引入该块的信息。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3pscSd0XCnsJykia8ibxxuvUtWuw6XK6whhbXicZRicicjCyvS8bxGf1ZLVQ/640?wx_fmt=png&from=appmsg)

我们在举一个例子，现在有如下的一个`svg`

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3ZwjNn3zfaKBQjwDaqplb0qZBHl2qOeXUoTgEtjQBYWBibJUX3DOqvWQ/640?wx_fmt=png&from=appmsg)

此时，我们对齐进行改造

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3iaEXicJWAIJ3bApX8Dw9y66F3Cym635Wov7eqic0VI0UyHcDaHuJPGr0Q/640?wx_fmt=png&from=appmsg)

1.  首先我们用`<symbol>`替换`<svg>`并且在`symbol`的属性上`id`用于和其他的`svg`做区分。
    
2.  我们在`<symbol>`外部又嵌套了一个`<svg>`，此时这个`<svg>`就是我们项目中唯一的`svg`文件，而其他的文件都被变为`<symbol>`内嵌到它下面了
    

然后，我们就可以通过刚才给定的`id`来获取对应的`svg`内容了。

```
<button>  <svg width="2rem" height="2rem">    <use href="#icon-pen"/>  </svg></button>
```

这里，我们不对`SVG`具体语法做介绍，如果想了解可以参考 MDN_SVG[4]

* * *

2. Node 处理 SVG
==============

首先，我们用`npm init`构建一个最简单的`Node`项目，名称嘛随意起。因为，这部分我们只是重点讲解使用**「Node 处理 SVG」**, 所以大家只需要重点关心代码部分即可。

比方说在我们的项目中存在如下目录 (`src/icons`) 里面存放的是我们在项目中使用的`svg`文件。![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3fUiaSF9ZlBibk1QrP1v8PTL0icGDrwZBdbIVEyP8VVyKm3s5nIiciavgibtg/640?wx_fmt=png&from=appmsg)

我们现在要做的就是将这些文件通过**「猛如虎」**的操作，放置到一个`svg`（`all.svg`）内。

那接下来，我们来一步一步实现这个操作。

处理文件
----

我们在项目的根目录下，新建一个文件 -`mergeSvgToSprite.ts`, 用于承载将指定文件目录下 (`src/icons`) 的所有`svg`(`*.svg`) 合并到`Sprite`中 (`all.svg`)。

既然涉及到文件的操作，那我们就需要一个得力干将，这里我们选用 - glob[5],（使用匹配模式 (`pattern`) 来匹配文件）。

```
npm i  -D glob
```

然后我们就可以基于模式 (`src/icons/*.svg`) 来匹配和获取到对应的文件。

```
import { globSync } from 'glob';const svgFiles = globSync('src/icons/*.svg');
```

随后，我们可以通过遍历通过`pattern`收集到的文件路径信息，然后通过内置的 fs[6] 的`readFileSync(path[, options])`来获取文件的内容。

```
import { globSync } from 'glob';+ import fs from 'fs';const svgFiles = globSync('src/icons/*.svg');svgFiles.forEach(file => {+  let code = fs.readFileSync(file, 'utf-8');})
```

此时，通过`readFileSync`获取到的只是`svg`的文件内容，它只是一个字符串或者`Buffer`类型。

在上一节中我们说过，我们是通过`<symbol>`来承载`svg`的内容, 那么我们就需要将`svg`的字符信息转换成对应的`DOM`结构。要处理此过程，我们可以借助 node-html-parser[7]

```
import { globSync } from 'glob';import fs from 'fs';+ import { HTMLElement, parse } from 'node-html-parser';const svgFiles = globSync('src/icons/*.svg');svgFiles.forEach(file => {  let code = fs.readFileSync(file, 'utf-8');+ const svgElement = parse(result).querySelector('svg') as HTMLElement;})
```

此时，`svgElement`就是对应的`svg`的`DOM`对象。

然后我们再用相同的方式构建一个`symbolElement`，并且通过遍历`svgElement`的`childNodes`来将`svg`的内部元素`append`到`symbolElement`中。

```
import { globSync } from 'glob';import fs from 'fs';import { HTMLElement, parse } from 'node-html-parser';const svgFiles = globSync('src/icons/*.svg');svgFiles.forEach(file => {   let code = fs.readFileSync(file, 'utf-8');   const svgElement = parse(result).querySelector('svg') as HTMLElement;+  const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;+  svgElement.childNodes.forEach(child => symbolElement.appendChild(child));})
```

此时，`symbolElement`已经将`svgElement`的内部元素全部容纳。之前也讲过`<symbol>`是有一个`id`属性的。并且，`svgElement`的属性还没做处理呢。（在这里我们只处理`viewbox`, 其他属性先不做处理）。

```
import { globSync } from 'glob';import fs from 'fs';import { HTMLElement, parse } from 'node-html-parser';+ import path from 'path';const svgFiles = globSync('src/icons/*.svg');svgFiles.forEach(file => {   let code = fs.readFileSync(file, 'utf-8');   const svgElement = parse(result).querySelector('svg') as HTMLElement;   const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;+   const fileName = path.basename(file, '.svg');      svgElement.childNodes.forEach(child => symbolElement.appendChild(child));+   symbolElement.setAttribute('id', fileName);   +    if (svgElement.attributes.viewBox) {+      symbolElement.setAttribute('viewBox', svgElement.attributes.viewBox);+    }})
```

通过 path.basename[8] 我们获取到对应`svg`的文件名称，然后通过`setAttribute`将其赋值给`symbolElement`的`id`属性。

随后，我们还是利用`setAttribute`将`svgElement`的 viewBox[9] 赋值给`symbolElement`。

到此，我们就完成了`svgElement`到`symbolElement`的转换了。

之前我们说过，我们要将`symbolElement`都放置到统一的`svg`中吗，此时我们就需要用一个变量 (`symbols`) 进行收集这些转换完成的`symbolElement`

```
import { globSync } from 'glob';import fs from 'fs';import { HTMLElement, parse } from 'node-html-parser';import path from 'path';const svgFiles = globSync('src/icons/*.svg');+ const symbols:string[] = [];svgFiles.forEach(file => {   let code = fs.readFileSync(file, 'utf-8');   const svgElement = parse(result).querySelector('svg') as HTMLElement;   const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;   const fileName = path.basename(file, '.svg');      svgElement.childNodes.forEach(child => symbolElement.appendChild(child));   symbolElement.setAttribute('id', fileName);       if (svgElement.attributes.viewBox) {      symbolElement.setAttribute('viewBox', svgElement.attributes.viewBox);    }    +   symbols.push(symbolElement.toString()); })
```

此时，`symbols`已经收集完成，我们需要将这些元素放置到`svg`中。

```
const allSvg = `<svg>${symbols.join('')}</svg>`;
```

然后，我们就可以利用`fs`将其写到指定位置 (在前端开发中，我们一般在项目根目录下的`public/`) 存放文件资源。

那么我们就可以使用如下代码进行写入

```
fs.writeFileSync('public/all.svg', allSvg);
```

此时，我们在根目录中执行`npx tsx mergeSvgToSprite.ts`, 我们就会看到在`public`中生成了一个`all.svg`。可以看到我们之前说过的

1.  `src/icons`中所有的`svg`的都被复制到`all.svg`中对应的`symbol`中
    
2.  `symbol`中的`id`对应`svg`的文件名称
    
3.  `symbol`中属性和源`svg`一模一样
    

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3YagtPxJaw3W65Cng3JJ9tm77h8OffpZWjVnNLTEdsPlicxcAOnHFvdQ/640?wx_fmt=png&from=appmsg)

### 最终代码

```
import { globSync } from 'glob';import fs from 'fs';import { HTMLElement, parse } from 'node-html-parser';import path from 'path';const svgFiles = globSync('src/icons/*.svg');const symbols: string[] = [];svgFiles.forEach(file => {  const code = fs.readFileSync(file, 'utf-8');  const svgElement = parse(code).querySelector('svg') as HTMLElement;  const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;  const fileName = path.basename(file, '.svg');  svgElement.childNodes.forEach(child => symbolElement.appendChild(child));  symbolElement.setAttribute('id', fileName);  if (svgElement.attributes.viewBox) {    symbolElement.setAttribute('viewBox', svgElement.attributes.viewBox);  }  symbols.push(symbolElement.toString());});const allSvg = `<svg>${symbols.join('')}</svg>`;fs.writeFileSync('public/all.svg', allSvg);
```

大家可以随意启动一个`Node`项目来进行验证。

配置 svg 的颜色
----------

默认情况下，`svg`是`#000000`或者`黑色`的。但是，有时候我们想让我们的`svg`配合其他元素一起展示，并且与其他元素拥有相同的颜色信息。

此时呢，按照以往的处理逻辑，我们可以通过直接修改`svg`的`fill`等属性来达到目的。但是呢，这种情况有点繁琐，我们需要不停的指定颜色然后基于不同的展示情况来对`fill`赋值。

而我们想要达到那种情况，`svg`可以借助 currentColor[10] 来完成。这个就是我们常说的**「动态 SVG 颜色」**。

还记得之前我们在前端项目里都有啥？[11]

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3nF9pQIUWyyR1475icF5iaRtfy4hAbjfzmc50lWibxgavv1zayjmRYLNYw/640?wx_fmt=png&from=appmsg)

它不仅能帮助我们优化`svg`而且还可以修正指定的属性，而`currentColor`就在其中。

还是老样子，用`npm i -D svgo`

`svgo`有一个内置插件 - `covertColors`, 它可以通过配置`currentColor:true`来将`svg`中出现颜色的地方都换成`currentColor`。

例如有如下的代码：

```
import { optimize } from 'svgo';const output = optimize( '<svg viewBox="0 0 24 24"><path fill="#000" d="m15 5 4 4" /></svg>', {   plugins: [   {       name: 'convertColors',       params: {         currentColor: true,       },     }  ], })
```

在经过处理后，`output`就会变成

```
<svg viewBox="0 0 24 24"><path fill="currentColor" d="m15 5 4 4"/></svg>
```

想了解更多这方面的概念和原理可以参考 currentcolor-and-svgs[12]

下面，我们就将`svgo`的逻辑加入到刚才的代码中。

```
import { globSync } from 'glob';import fs from 'fs';import { HTMLElement, parse } from 'node-html-parser';import path from 'path';+ import { Config as SVGOConfig, optimize } from 'svgo'; + const svgoConfig: SVGOConfig = {+  plugins: [+    {+      name: 'convertColors',+      params: {+        currentColor: true,+      },+    }+  ],+ };const svgFiles = globSync('src/icons/*.svg');const symbols: string[] = [];svgFiles.forEach(file => {  const code = fs.readFileSync(file, 'utf-8');+  const result = optimize(code, svgoConfig).data;+  const svgElement = parse(result).querySelector('svg') as HTMLElement;  const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;  const fileName = path.basename(file, '.svg');  svgElement.childNodes.forEach(child => symbolElement.appendChild(child));  symbolElement.setAttribute('id', fileName);  if (svgElement.attributes.viewBox) {    symbolElement.setAttribute('viewBox', svgElement.attributes.viewBox);  }  symbols.push(symbolElement.toString());});const allSvg = `<svg>${symbols.join('')}</svg>`;fs.writeFileSync('public/all.svg', allSvg);
```

当我们再次执行`npx tsx mergeSvgToSprite.ts`时，就会看到在`all.svg`中的`symbol`中。

* * *

3. 插件实现逻辑
=========

熟悉`Vite`开发的同学都知道，`Vite`在开发环境和生产环境处理资源的决策是不同的。

对于`开发服务器`，它使用 esbuild[13] 与 [ESM](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247488468&idx=1&sn=dc38787b741856708e4e984a32b2733a&scene=21#wechat_redirect)，因此我们无需将代码打包到单个文件中，同时它还利用`HRM`实现资源的快速替换。我们之前刚聊过 [Vite_HRM](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247492373&idx=1&sn=7451340f4eada0fec3444b7d61d2a312&scene=21#wechat_redirect)

对于生产环境的资源处理，它使用 rollup.js[14]，因为它灵活且拥有庞大的生态系统；它允许创建高度优化的生产包，具有不同的输出格式。这块的内容我们在[浅聊 Vite](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247488826&idx=1&sn=26eaf7f17620b13acdbf8130b69929f2&scene=21#wechat_redirect) 中有过介绍。

接下来，我们就来将上一节中我们用`Node`处理`SVG`的逻辑做一番处理，让变成能够在`Vite`项目中使用的`Vite`插件。

话不多说，开造。

准备工作
----

在上一节中，我们不是创建了一个`Node`项目吗，然后在项目的根目录下新建了一个`mergeSvgToSprite.ts`, 现在我们将`mergeSvgToSprite.ts`移动到`src`目录下，并且在`src`中再新增一个`index.ts`文件，该文件用于承载插件的主要逻辑。

首先，我们需要引入`vite`- `npm i vite`。

对了，还有一点需要注意的就是，我们在写`vite plugin`的时候，会用到一些内置的钩子，这个我们可以在 vite_插件 API[15] 中进行搜索。同时，当插件是在打包阶段起作用时候，我们可能还会用到 rollup_插件 API[16]。

下面就是一个最简单的`vite plugin`。

```
import { Plugin } from 'vite';function myPlugin(): Plugin {  return {    name: 'my-plugin',    configResolved(config) {      console.log(config); },  };}
```

我们可以直接将`myPlugin`定义在`vite.config.ts`中，并且可以在`defineConfig`中引入。

```
// vite.config.tsdefineConfig({  plugins: [    myPlugin(),  ],});
```

之前我们已经介绍过了，`vite`在处理文件资源的时候，是要区分`开发环境`和`生产环境`的。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3Kz7E0cmRkJLxFOm4ic43Koy2Pfv9hdZiaqVxqf0ZGdkd0e6fsHR5Yq3A/640?wx_fmt=png&from=appmsg)

由于，我们的场景是处理文件资源，那就意味着在`开发环境`和`生产环境`中都要执行，但是他们的执行逻辑不同。所以我们需要在我们的插件中处理这两种情况。那么我们可以返回一个插件数组。

```
import { Plugin } from 'vite';function myPlugin(): Plugin[] {  return [    {      name: 'my-plugin:serve',      apply: 'serve',      configResolved(config) {        console.log('dev server:', config);      },    },    {      name: 'my-plugin:build',      apply: 'build',      configResolved(config) {        console.log('bundle:', config);      },    },  ];}
```

这样我们就可以通过`apply`的靶向指定，能够处理对应的资源逻辑，并且在一个插件中就可以处理两种情况。可谓一石二鸟。

下面我们就分别处理这两种情况。

古人打战都讲究一个**「师出有名」**，所以我们用一个常量`PLUGIN_NAME`为插件起一个响当当的名字，- `vite-plugin-svg-merge`，我们就是为了消灭那些烦人的`svg`。达到老祖宗，**「车同轨，书同文」**的大一统的目的

apply:'build'处理生产环境
-------------------

之前，我们就介绍过`vite build`的大致流程。![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3bmsbMicwweicROA9hvHSSYiaGicj0dQBkN0le54P5oAJXlGbT2DeZSMvtA/640?wx_fmt=png&from=appmsg)这个图，大家可以仔细看一下，因为下面的代码中会涉及一些阶段。

其实，针对开发环境是最简单的。因为它的主要逻辑其实和上一节中用`Node处理资源`是一脉相承的。都是基于`pattern`查到到文件，然后做`svg`内容的替换，生成最后的`svg`文件，然后将最后生成的`svg`复制到指定文件夹内。

下面就是针对打包时的主要核心代码。

```
import { Plugin,ResolvedConfig } from 'vite';import path from 'path';import fs from 'fs-extra';import { getSpriteContent } from './mergeSvgToSprite';export interface SvgMergeOptions {  pattern: string;}const PLUGIN_NAME = 'vite-plugin-svg-merge';export function svgMerge({  pattern,}: SvgMergeOptions): Plugin {    let config: ResolvedConfig;    const filename = 'all.svg';    return {      name: `${PLUGIN_NAME}:build`,      apply: 'build',      async configResolved(_config) {          config = _config;        },      writeBundle() {          const sprite = getSpriteContent({ pattern });          const filePath = path.resolve(config.root, config.build.outDir, filename);          fs.ensureFileSync(filePath);          fs.writeFileSync(filePath, sprite);        },    };}
```

上面有几点需要解释和注意

1.  在代码中我们使用了从`mergeSvgToSprite.ts`导出的`getSpriteContent`，其实这部分内容就是我们之前的`Node处理资源`部分，只不过我们需要对其做一下简单改造，这个我们后面再做
    
2.  我们使用了 configResolved[17] 来接收`vite`的配置信息![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou39M5faS3iazzxzZEHKG8kLVebLYM6NtjpZRKGrgNU4XlyMfm0CMrQ7og/640?wx_fmt=png&from=appmsg)
    
3.  writeBundle[18] 是`Rollup`的一个钩子，它是在`bundle.write()`完成后才会被触发。
    
4.  我们使用`fs-extra`和`path`进行文件操作
    

由于上面新增了库，我们别忘记在项目中进行安装处理。

apply:'serve'处理开发环境
-------------------

在 [Vite 热更新 (HMR) 原理了解一下](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247492373&idx=1&sn=7451340f4eada0fec3444b7d61d2a312&scene=21#wechat_redirect)中我们介绍过，在开发环境`Vite`会启动一个开发服务器，通过`WebSocket`与`HMR客户端`交互。

那也就意味着，如果要写针对开发环境的插件时候，我们是利用和服务器相关的 hook。而`Vite`为我们提供了一个 configureServer[19] 用于处理资源请求相关的逻辑。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3AYqHUdicTCq36odLP2TPb2wwYWbzkpYiaolLLGkMdhfHvA4VYsMicKuWQ/640?wx_fmt=png&from=appmsg)

```
import { Plugin,ResolvedConfig } from 'vite';import { getSpriteContent } from './mergeSvgToSprite';export interface SvgMergeOptions {  pattern: string;}const PLUGIN_NAME = 'vite-plugin-svg-merge';export function svgMerge({  pattern,}: SvgMergeOptions): Plugin {    let config: ResolvedConfig;    const filename = 'all.svg';    return {      name: `${PLUGIN_NAME}:serve`,      apply: 'serve',      async configResolved(_config) {        config = _config;      },      configureServer(server) {        return () => {          server.middlewares.use(async (req, res, next) => {            if (req.url !== `/${filename}`) {              return next();            }            const sprite = getSpriteContent({ pattern });            res.writeHead(200, {               'Content-Type': 'image/svg+xml, charset=utf-8',              'Cache-Control': 'no-cache',            });            res.end(sprite);          });        };      },    };}
```

让我们来简单解释一下：

1.  为了向开发服务器添加自定义中间件以捕获每个请求，我使用了 `server.middlewares.use()`。我需要它来检测 `URL` 为 `localhost:3000/all.svg` 的请求，这样我就可以模拟文件行为；
    
2.  如果请求 URL 不是 `/all.svg` - 跳过到下一个中间件（即，将控制传递给链中的下一个处理程序, 使用`next()`）；
    
3.  为了准备文件内容，我将 `getSpriteContent` 的结果放入变量 `sprite` 中，并将其作为响应发送，同时配置了头部信息。
    

其实，处理到这里算是完成了我们的主要逻辑，但是呢大家都知道在开发环境，我们还需要支持`HRM`。用就是当对应的文件发生变更 (新增，删除等)，都需要将最新的资源告知客户端。

所以，我们还需要对特定的文件进行监听处理。

### 实现 HRM

要实现这部分代码呢，其实最关键的还是在`configureServer`中进行处理，然后因为要涉及文件的监听我们选择 chokidar[20]。

下面我们就直接将新增部分代码写到下面。

```
import chokidar from 'chokidar';// 省略部分代码export function svgMerge({  pattern,}: SvgMergeOptions): Plugin {    let watcher: chokidar.FSWatcher;     return {       // 省略部分代码      configureServer(server) {        function reloadPage() { // 发送信号以重新加载服务器的函数。            server.ws.send({ type: 'full-reload', path: '*' });        }        watcher = chokidar            .watch('src/icons/*.svg', { // 监视 src/icons/*.svg            cwd: config.root, // 定义项目根路径            ignoreInitial: true, // 不在实例化时触发 chokidar。            })            .on('add', reloadPage) // 添加新增、修改、删除的监听器。            .on('change', reloadPage)            .on('unlink', reloadPage);         return () => {           // 逻辑不变        };      },      async closeBundle() {          await watcher.close();      },    };}
```

我们在`configureServer`定义了一个发送信号以重新加载服务器的函数。其中利用`WebSocket`进行信息的处理。然后，利用`chokidar`对指定文件进行监听。并且当文件有新增 / 修改 / 删除时进行资源加载。

最后，我们在`Rollup`的 closeBundle[21]hook 将`watcher`进行关闭处理。

插件合并
----

上面的代码，我们处理了针对**「开发环境」**和**「生产环境」**的资源处理。现在我们将他们放到一个插件定义中，即返回一个插件数组。

```
export function svgMerge({  pattern,}: SvgMergeOptions): Plugin {    let config: ResolvedConfig;    const filename = 'all.svg';    return [      {      // 针对生产环境的代码      },      {      // 针对开发环境的代码      }    ]
```

之前代码改造
------

在写插件时候，我们都是直接使用`import { getSpriteContent } from './mergeSvgToSprite';`引入处理`svg`的逻辑。因为，这是一个统一的逻辑 (开发环境 / 生产环境) 都涉及。同时，由于我们在第二节中已经把如何处理`svg`的逻辑都解释过了。

现在就是将其适配成`Vite plugin`的类型。其实吧，也就是修改一些参数和返回类型。话不多少，我们直接上代码。

```
import fg from 'fast-glob';import fs from 'fs';import { Config as SVGOConfig, optimize } from 'svgo';import path from 'path';import { HTMLElement, parse } from 'node-html-parser';const svgoConfig: SVGOConfig = {  plugins: [    {      name: 'convertColors',      params: {        currentColor: true,      },    }  ],};export function getSpriteContent({  pattern}: {pattern:string}): string {  const svgFiles = fg.sync(pattern);  const symbols: string[] = [];  svgFiles.forEach(file => {    let code = fs.readFileSync(file, 'utf-8');    const result = optimize(code, svgoConfig).data     const fileName = path.basename(file, '.svg');    const svgElement = parse(result).querySelector('svg') as HTMLElement;    const symbolElement = parse('<symbol/>').querySelector('symbol') as HTMLElement;    symbolElement.setAttribute('id', fileName);    if (svgElement.attributes.viewBox) {      symbolElement.setAttribute('viewBox', svgElement.attributes.viewBox);    }    svgElement.childNodes.forEach(child => symbolElement.appendChild(child));    symbols.push(symbolElement.toString());  });  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`;}
```

其实和之前的代码几乎没有差别。就是在之前的基础上做了几点修正

1.  用一个函数来承载之前的处理逻辑
    
2.  我们之前用`Node`处理是直接将要处理的文件地址写死了，现在是用一个`pattern`来从外面指定。
    
3.  之前是使用`fs.writeFileSync`直接将最后生产的`svg`写入到指定地址，而现在我们是将最后的`svg string`返回到函数调用处了。具体返回的内容是要写入到哪里，是由函数调用处决定。
    

最后，我们已经把所有的逻辑都处理完成了。可以说，如果现在将`plubin`放置到`vite.config.ts`中，在引入对应的库后，已经能生效了。

但是，作为一个功能完备的插件，我们肯定不想让其成为一个内部应用。所以，我们还需要将其打包并发布到指定的地方 (`npm`也好还是公司私库)

> ❝
> 
> 其实呢，我们这个插件算是一个基础版本，其实还可以对其做更一步的优化处理
> 
> 1.  我们使用每个`svg`的文件名称作为`symbol`的 id, 这个其实我们还可以引入额外的变量例如`prefix-name`进行配置
>     
> 2.  针对`svgo`的配置，我们只处理了`currentColor`，其实`svgo`还可以做很多事情，例如删除多余的属性等，这个也是可以通过参数传人
>     
> 3.  我们在处理`pattern`是接收一个`string`类型，其实我们可以改造成`Array<sting>`类型，这样我们可以不用拘泥用只处理`src/icons/`的`svg`。 .....
>     
> 
> ❞

* * *

4. 使用 microbundle 进行打包
======================

针对一个插件的处理或者库的打包，我们可以选择 microbundle[22]。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3jNRNauxUiapd9sa3RkctpiaDVXrexacsvJBlzNHWRZ1ay9WY4GxibN7pg/640?wx_fmt=png&from=appmsg)

在官网，已经为我们介绍了很详细的配置步骤了。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3QcnbylASHt2gDGtCVlk01Aib4vtZyhQEz2z5gsFicZWe9WzjThViaO8Iw/640?wx_fmt=png&from=appmsg)

我们就按照官网的步骤，一步一步进行处理即可。

```
{  "name": "svg-merge",  "version": "1.0.0",  "description": "一款用于将项目中所有的svg合并到一个svg文件中的工具",  "type": "module",  "source": "src/index.ts",  "exports": {    "require": "./dist/index.cjs",    "default": "./dist/foo.modern.js"  },  "main": "./dist/index.cjs",  "module": "./dist/index.module.js",  "unpkg": "./dist/index.umd.js",  "scripts": {    "build": "microbundle",    "dev": "microbundle watch"  },  "author": "front789",  "license": "ISC",  "devDependencies": {    "@types/fs-extra": "^11.0.4",    "@types/node": "^20.12.11",    "microbundle": "^0.15.1",    "svgo": "^3.3.2",    "vite": "^5.2.11"  },  "dependencies": {    "chokidar": "^3.6.0",    "fast-glob": "^3.3.2",    "fs-extra": "^11.2.0",    "glob": "^10.3.12",    "node-html-parser": "^6.1.13"  }}
```

随后，我们执行`npm run build`即可。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3ibySZxsxNpCNzq1QysGMDEbPHKMuSpLfIgjT3uMsIUORRibFibjibONWhw/640?wx_fmt=png&from=appmsg)随后，我们就在项目的`dist`中看到这些文件了。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3UvpPUwX1K4Av0fGWic2szu6fQWlC3zBmpicdNePC0DranBxWmBaLrrVg/640?wx_fmt=png&from=appmsg)

然后，我们就可以发布到`npm`或者私有仓了。

这里发布的流程我们就不写了。因为我们之前写过。

![](https://mmbiz.qpic.cn/mmbiz_png/rv5jxwmzMCUaIVcPic5JtlQnk8b3vyou3pUE7npiclKKMZkeMBH4IpII5YhGfNvCkn4336GQjBU1t1ej4s0Z1Tnw/640?wx_fmt=png&from=appmsg)

1.  [如何在 npm 上发布二进制文件？](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247491478&idx=1&sn=588f7e30999ad2302cf638e9b0eb00f4&scene=21#wechat_redirect)
    
2.  [如何在 gitlab 上发布 npm 包](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247491631&idx=1&sn=9a17713da687b432ee532c49d7fb4b46&scene=21#wechat_redirect)
    
3.  [在 gitlab 上发布 npm 二进制文件](https://mp.weixin.qq.com/s?__biz=Mzg3NjU2OTE1Mw==&mid=2247491660&idx=1&sn=f9c2a7e1459176c5ada92ac2d9196065&scene=21#wechat_redirect)
    

  

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！

* * *

  

### Reference

[1]

Image Sprites: https://www.w3schools.com/css/css_image_sprites.asp

[2]

矢量图: https://en.wikipedia.org/wiki/Vector_graphics

[3]

symbol: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/symbol

[4]

MDN_SVG: https://developer.mozilla.org/en-US/docs/Web/SVG

[5]

glob: https://www.npmjs.com/package/glob

[6]

fs: https://nodejs.org/api/fs.html?ref=hackernoon.com#fsreadfilesyncpath-options

[7]

node-html-parser: https://github.com/taoqf/node-html-parser

[8]

path.basename: https://www.w3schools.com/nodejs/met_path_basename.asp

[9]

viewBox: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox

[10]

currentColor: https://www.digitalocean.com/community/tutorials/css-currentcolor

[11]

前端项目里都有啥？: https://mp.weixin.qq.com/s/2hxwntKm7W-fis8UrtmPDg

[12]

currentcolor-and-svgs: https://gomakethings.com/currentcolor-and-svgs/

[13]

esbuild: https://esbuild.github.io/

[14]

rollup.js: https://rollupjs.org/

[15]

vite_插件 API: https://cn.vitejs.dev/guide/api-plugin.html

[16]

rollup_插件 API: https://rollupjs.org/plugin-development/

[17]

configResolved: https://cn.vitejs.dev/guide/api-plugin.html#configresolved

[18]

writeBundle: https://rollupjs.org/plugin-development/#writebundle

[19]

configureServer: https://cn.vitejs.dev/guide/api-plugin.html#configureserver

[20]

chokidar: https://github.com/paulmillr/chokidar

[21]

closeBundle: https://rollupjs.org/plugin-development/#closebundle

[22]

microbundle: https://github.com/developit/microbundle