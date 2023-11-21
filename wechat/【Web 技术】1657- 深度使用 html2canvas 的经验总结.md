> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Z4dU4EqemWOak1waNf1mFw)

1、背景
====

移动端业务裂变业务最大的难点就是移动端缺少快速裂变的渠道，仅靠搜索引擎的导流，获得的流量和客户引流是极其有限，这也是 SEO 优化逐渐被人忽视的根本原因。我们的业务肯定希望在微信、微博、抖音等渠道进行快速裂变，但是这些渠道对移动端等网页的引流做了很强的限制，例如二跳限制、合规限制，巧妇难为无米之炊啊。

最常用的解决方案则是依赖图片分享转发来绕开流量平台的 URL 限制，常见的就是各种海报、截图，形式多种多样。这样一来就给开发带来了更高的要求，分享图必须拟合客户画像，内容丰富且依据客户深度定制，表现的张力很强，才能吸引客户去分享。

在这种业务背景下，前端开发就希望设计一套自动生成丰富多样的截图方案，常规的玩法有两大类：前端生成和后台生成。

1、后台生成是指在 Nodejs 服务端中，通过调用 chrome 内核来加载对应的页面，然后使用浏览器等内置 API 进行截图，例如使用 puppeteer 生成 pdf。

通过后台服务生产的图片在清晰度和字体显示的平滑程度方面效果是最好的，并且开发方式简单，Nodejs 服务器前端可以自己开发和维护，但缺点是服务端生成依赖 Nodejs 服务，增加额外的服务器环境维护工作和开发工作。

2、前端生成则是指在前端浏览器端生成，一般可以选择 html2canvas 或者直接使用 HTML5 canvas 的 API 直接绘制。

html2canvas 是很成熟的 JavaScript 库，拥有 2.7W+ 的关注，经过长时间的迭代其性能和使用体验可以得到很好的保障。其实 html2canvas 底层是使用 canvas API 实现的，因此也可以直接使用 canvas API 来进行效果绘制，优点就是性能高，不必依赖于 DOM 结构的渲染，可以直接绘制 canvas 生成图片，也可以摆脱 DOM 的限制，做出一些酷炫的效果；缺点就是实现的难度太大，普通开发学习成本高，难以很快上手。

本文主要关注 html2canvas 的前端生成方案，作者把在其中学习到的思路和踩坑经验和大家分享下，帮助大家上线顺利，享受美好的周末。

2、原理和使用
=======

正如 html2canvas 的名字所提示的一样，其实现截图的原理实际是将 DOM 对象进行迭代克隆和解析，按照层叠关系自顶向下逐步绘制到 canvas 对象里，然后利用 canvas 的底层 API `toDataURL`和 `toBlob`转换成图片数据，最终可以上传到后台生成截图的在线地址，方便客户进行预览和下载分享。

本文将结合 html2canvas 的使用给大家介绍下内部调用细节。

```
import html2canvas from 'html2canvas';// DidMount 之后const canvas = await html2canvas(this.posterRef.current as HTMLElement, options: Options);const jpgImgBase64 = canvas.toDataURL('image/jpeg'); // 预览图片
```

html2canvas 返回 Promise 实例，获取到 Canvas 实例，因此可以调用 toDataURL 获取图片数据。

```
const renderer = new CanvasRenderer(context, renderOptions);canvas = await renderer.render(root);return canvas;
```

下面是 render.render() 内部调用的流程。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXiaXerL2ew4gC5dtPicEfNXEp53MNIVMZcgff6w6ic0Fic6muND1vfEXrHiaA/640?wx_fmt=other)

1.  克隆 DOM 过程
    

1.  收集样式。
    
2.  挂载上解析后样式对象。
    
3.  拆分伪元素，克隆当前节点。
    

3.  绘制 Canvas 过程
    

1.  生成层叠上下午树 / 栈，将样式 + 节点内容的绘制节点放入 9 个阶层，确定层叠顺序。
    
2.  依据生成层叠上下午树 / 栈，调用底层 Canvas API 进行逐步绘制。
    

2.1、克隆 DOM 过程
-------------

克隆 DOM 树采用的自顶向下的方式进行递归遍历，核心的逻辑在`cloneNode`方法中。

第一步，执行`const clone = this.createElementClone(node)`创建当前 Node 的克隆对象。

第二步，执行`getComputedStyle(node/nodeBefore/nodeAfter)`获取样式集，并且当前样式经过`new CSSParsedCounterDeclaration(this.context, style)`封装后压入样式计数器。

第三步，判断是否存在子元素，如果存在则将`this.cloneChildNodes(node, clone, copyStyles)`进行递归挂载。

第四步，挂载 Before 和 After 伪类元素。

第五步，样式计数器弹出当前样式集，并且返回克隆后的 root 节点。

在这个过程中，Video、Slot、Canvas、SVG、CustomElement、iframe 等节点类型是单独处理的，这里不做多讨论。

作者也想过一个问题：为何不直接对 DOM 结构进行遍历渲染？看了源码之后，发现这个克隆过程，实际也是对 DOM 结构进行层级精简，样式解析和调整，最终将整个 DOM 结构转成更加适合渲染的内部对象结构，并且预处理的 DOM 索引，保证性能和避免内存泄漏。

2.2、渲染 Canvas 过程
----------------

下面介绍绘制过程 - 将克隆树渲染到 Canvas。

将克隆树渲染到 Canvas 对象中，核心方法类是`CanvasRender`。

```
const renderer = new CanvasRenderer(context, renderOptions);// 声明全局canvas实例，传入渲染的相关参数canvas = await renderer.render(root);// 进行具体的DOM渲染到canvas中
```

内部调用细节：

```
async render(element: ElementContainer): Promise<HTMLCanvasElement> {    if (this.options.backgroundColor) {        // 绘制背景        this.ctx.fillStyle = asString(this.options.backgroundColor);        this.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);    }    const stack = parseStackingContexts(element);    await this.renderStack(stack);    this.applyEffects([]);    return this.canvas;}
```

最终会返回渲染之后的 canvas 对象，能够使用常规 Canvas API 来导出截图数据。

### 2.2.1、收集层叠上下文

先来阐明一下什么是层叠上下文。

层叠上下文（stacking content），是 HTML 中的一种三维概念。它表达了独立的 DOM 元素在人的事业范围内的远近顺序，例如 background 和 border 产生的视觉效果要在 DOM 内容的视觉效果后面，这就是一种层叠上下文。如果一个复杂 DOM 节点含有层叠上下文，那么在下图的 Z 轴中位置就要做调整。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXiaFia2HcuCG1ib3gHLquelUTnMeDCmR1U0SqWtgI3OPrlGnhmlxXUK6vqw/640?wx_fmt=other)上面 render 的代码中第一个要关注的核心逻辑是`parseStackingContexts` ，该方法创建层叠上下文，是决定 DOM 元素渲染 z 轴的前后次序的关键。

下面是其内部的部分细节。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXia7ooykz7j3SBoaW23bGAXkPcianOvu9Zrlx5eh9hZC8fHVkqSjrlz14g/640?wx_fmt=other)

从源码来看，

1.  布局 position !== static
    
2.  透明度 opacity < 1
    
3.  样式变换 transformed
    
4.  浮动布局 floated
    

以上元素都会产生层叠上下文，放入不同层级的样式堆栈中，仔细观察命名就能发现其层叠上下文分类类似著名的 7 阶层层叠水平的模型。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXiaaibAupMgLwPwQxotnKdySIsI0BV0XzYKjFYvSHenRVpzTwMCApXm6sA/640?wx_fmt=other)

虽然不是完全一致，html2canvas 底层分了 9 个阶层，但是大多是能够对应上的。这里列举下内部的层叠上下文样式堆栈，按照序号顺序渲染的 z 轴位置越靠近用户。

1.  backgroundAndBorders
    
2.  negativeZIndex
    
3.  nodeContent  # 元素自身渲染对齐 block 块状盒子
    
4.  nonInlineLevel
    
5.  nonPositionedFloats
    
6.  nonPositionedInlineLevel
    
7.  inlineLevel
    
8.  zeroOrAutoZIndexOrTransformedOrOpacity
    
9.  positiveZIndex
    

无层叠上下文的样式集一般放到 inlineLevel/nonInlineLevel 这两个堆栈。  
最终通过递归调用 parseStackTree 方法，构建基于 DOM 树结构的层叠上下文对象。

### 2.2.2、按照层叠上下午逐步渲染 Canvas 过程

接下来根据层叠上下文逐步渲染，核心函数`renderStackContent`。

```
async renderStackContent(stack: StackingContext): Promise<void> {    if (contains(stack.element.container.flags, FLAGS.DEBUG_RENDER)) {        debugger;    }    // https://www.w3.org/TR/css-position-3/#painting-order    // 1. the background and borders of the element forming the stacking context.    await this.renderNodeBackgroundAndBorders(stack.element);    // 2. the child stacking contexts with negative stack levels (most negative first).    for (const child of stack.negativeZIndex) {        await this.renderStack(child);    }    // 3. For all its in-flow, non-positioned, block-level descendants in tree order:    await this.renderNodeContent(stack.element);    for (const child of stack.nonInlineLevel) {        await this.renderNode(child);    }    // 4. All non-positioned floating descendants, in tree order. For each one of these,    // treat the element as if it created a new stacking context, but any positioned descendants and descendants    // which actually create a new stacking context should be considered part of the parent stacking context,    // not this new one.    for (const child of stack.nonPositionedFloats) {        await this.renderStack(child);    }    // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.    for (const child of stack.nonPositionedInlineLevel) {        await this.renderStack(child);    }    for (const child of stack.inlineLevel) {        await this.renderNode(child);    }    // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:    //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.    //  For those with 'z-index: auto', treat the element as if it created a new stacking context,    //  but any positioned descendants and descendants which actually create a new stacking context should be    //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',    //  treat the stacking context generated atomically.    //    //  All opacity descendants with opacity less than 1    //    //  All transform descendants with transform other than none    for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {        await this.renderStack(child);    }    // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index    // order (smallest first) then tree order.    for (const child of stack.positiveZIndex) {        await this.renderStack(child);    }}
```

核心的逻辑在于 renderStackContent 和 renderStack 互相调用，按照层叠上下文进行递归渲染。

源码这里做了丰富的注释，能够清晰看到不同层叠上下文的渲染顺序。开发中如果有 z 轴的样式层级出错的情况，可以看下出错的样式所在的堆栈的渲染顺序，自行做下调整即可。

3、生成在线地址
--------

在内存中生成我们所需的 Canvas 的对象，接下来就要将内容上传到服务器生成在线文件地址。

```
const renderer = new CanvasRenderer(context, renderOptions);// 声明全局canvas实例，传入渲染的相关参数canvas = await renderer.render(root);// 进行具体的DOM渲染到canvas中const jpgImgBase64 = canvas.toDataURL('image/jpeg'); // 预览图片canvas.toBlob(  (blob: any) => {    const fd = new FormData(); // 构造请求上传    fd.append('file', blob, 'poster.jpeg');    dispatch({      type: 'contentCenter/s3FileUpload',      payload: fd,    }).then((result: any) => {      // 取得在线地址    });  },  'image/jpeg',  0.5,);
```

3、踩坑点
=====

1、图片跨域和缓存
---------

官方提供了下面的配置来解决图片跨域问题，官方建议后端增加跨域头`Control-Allow-Origin: *`避免破坏 canvas 的安全规则。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Name</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Default</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Description</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">allowTaint</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">false</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Whether to allow cross-origin images to taint the canvas</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">proxy</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">null</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Url to the proxy which is to be used for loading cross-origin images. If left empty, cross-origin images won't be loaded.</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">useCORS</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">false</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Whether to attempt to load images from a server using CORS</td></tr></tbody></table>

其次是图片的资源缓存会导致截图和 DOM 渲染不一致的情况，常见于图片是后台手动维护，并没有交给通用文件服务托管，导致图片文件出现延时更新的问题，因此每次生成的时候图片的地址建议拼接上唯一的版本参数`?version=uuidxxxx`避免缓存。

2、图片清晰度差
--------

官方提供了两个 API - dpi 和 scale 两个参数来解决。

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Name</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Type</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Default</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">Description</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">scale</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">number</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">1</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Increase the resolution by a scale factor (2=double).</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">dpi</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">number</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">96</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Increase the resolution to a specific DPI (dots per inch).</td></tr></tbody></table>

```
// Create a canvas with double-resolution.html2canvas(element, {  scale: 2,  onrendered: myRenderFunction});// Create a canvas with 144 dpi (1.5x resolution).html2canvas(element, {  dpi: 144,  onrendered: myRenderFunction});
```

其他 hack 方案 - 两次 canvas 绘制方案。

首次绘制按照设备像素比缩放 canvas 的画布大小，结合 scale 进行放大，

第二次绘制，直接用 canvas 进行缩小绘制，进而提高精度。

```
function canvasToJPG(canvas, width, height) {  const w = canvas.width;  const h = canvas.height;  const canvas = document.createElement('canvas');  const ctx = canvas.getContext('2d');  canvas.width = width;  canvas.height = height;  ctx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);  return canvas.toDataURL('jpeg');}function eleToImage() {  const elem = document.body;  const width = elem.offsetWidth;  const height = elem.offsetHeight;  const canvas = document.createElement('canvas');  const scale = window.devicePixelRatio; // 设备像素比  canvas.width = width * scale; // 定义canvas 宽度 * 缩放  canvas.height = height * scale; // 定义canvas高度 * 缩放  // 放大后再缩小提高清晰度  canvas.getContext('2d').scale(scale, scale);   html2canvas(elem, {    scale: scale, // 添加的scale 参数    canvas: canvas, // 自定义 canvas    width: width, // dom 原始宽度    height: height,    useCORS: true // 【重要】开启跨域配置  }).then(canvas => {    const context = canvas.getContext('2d');    context.webkitImageSmoothingEnabled = false;    context.imageSmoothingEnabled = false;    const img = canvasToJPG(canvas, canvas.width, canvas.height);  });}
```

3、滚动元素截图不全
----------

设置滚动元素提前滚动到顶部。  
`document.body.scrollTop = document.documentElement.scrollTop = 0;`

4、部分样式丢失
--------

首先检查当前需要截图的页面样式是否包含以下不支持的样式。

*   background-blend-mode
    
*   border-image
    
*   box-decoration-break
    
*   box-shadow
    
*   filter
    
*   font-variant-ligatures
    
*   mix-blend-mode
    
*   object-fit
    
*   repeating-linear-gradient()
    
*   writing-mode
    
*   zoom
    

html2canvas 支持情况如下参考：html2canvas.hertzen.com/features/  
再者如果确实存在复杂的样式建议使用 UI 生成的图片来代替，避免 DOM 整体过于复杂。

5、字体间距、样式与 DOM 存在不一致
--------------------

常见的场景有 @等特殊字符出现空间隙，"." 等半角字符被吞掉等

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXiamFsp07ZJkGJ4Btey2cvjRpVYU72Pdnco6MXl45WmTH4dvxlfNyHaWw/640?wx_fmt=other)

第一步是给文本标签设置字体，html2canvas 绘制的时候默认会添加下面的`font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;`，其次是对于密集，大段文字部分，可以进行字符分割，每个文字使用内联元素 span 标签进行包裹，提供渲染的精确度。

假如移动端采用的 rem 布局，再加上频繁改动根元素的 font-size， 可能会导致渲染字体的行高出现问题，导致字体下移或者上移。![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXiapRyDzR2obXXiaroWZNAjy5Txiaw4qc9klvUnXLflyeG02nnHx2HJib1Eg/640?wx_fmt=other)

这里的解决方案是这里的字体不要采用 rem 的布局，CSS 样式 LineHeight、font-size 等采用 px 进行显式声明。

6、图片生成时间太长
----------

第一个环节 - html2canvas，配置 ignoreElements 函数或者在 DOM 上增加`data-html2canvas-ignore`属性，去除冗余的 DOM，其次精简需要渲染的 DOM 范围，

第二个环节 - canvas to Blob，提前生成 blob，上传到后台，获取在线 url，增加缓存在线地址。

7、ios 生成图片失效
------------

简单来说就是假如工程化例如 webpack 中，对图片转成 base64 的大小不做限制，会导致十分巨大的 base64 数据被塞入 canvas 中，引起 Starting DOM parsing; Added image data:image/png:base64,xxxx 的报错。

因此对于老方案中的使用 base64 来绕开跨域，工程化存在 url-loader 的 limit 设置的场景中，需要注意控制图片数据的大小，也可以增加 noparse 文件夹，内部的图片不做转换。

```
{  test: /.(png|jpe?g|gif)(?.*)?$/,  loader: 'url-loader',  include: [resolve('static/noparse')],  options: {    // 单位是 Byte ，设置一个很小的值，使得这些图片不会被转成 base64    limit: 1,    name: utils.assetsPath('img/[name].[hash:7].[ext]')  }},{  test: /.(png|jpe?g|gif)(?.*)?$/,  loader: 'url-loader',  exclude: [resolve('static/parse')],  options: {    // limit: 1,    name: utils.assetsPath('img/[name].[hash:7].[ext]')  }},
```

8、模糊元素局部优化
----------

设置模糊元素的 width 和 height 为素材原有宽高，然后通过 transform: scale 进行缩放。这里 scale 的数值由具体需求决定。

```
.targetElem {  width: 54px;  height: 142px;  margin-top:2px;  margin-left:17px;  transform: scale(0.5)；}
```

这里不推荐使用这种方式，首先是本人尝试了下放大不同倍数，整体对生成的图片效果影响很小，其次一旦改变部分元素的实际大小，后续元素必然要使用`position: absolute` 进行调整，会引起后续元素最终渲染的位置出错，如下图的文字部分上移了，推荐使用坑点 1 的官方解决方案。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pqcWLvSo2khK3IIAMiag5Kw4sBfmiboLXiakJM3oLd5hsiadzUY5vpK0pZtjNvwpgTHPEqz4q0dY9JTVN7r72QVVkg/640?wx_fmt=other)

9、tips
------

*   背景色默认是白色，可以设置 options `backgroundColor: "transparent"`
    
*   ios `<br>`换行失败，使用其他块级元素进行换行
    
*   视频截图失败，可以升级到 v1.4.0，新版本支持
    
*   插件内容无法支持  
    官方文档明确指出了这一点，大家需要注意下。
    

> The script doesn't render plugin content such as Flash or Java applets

4、总结
====

本文主要介绍了基于 html2canvas 的前端截图生成方案，大家能感受到基于前端 JS 生成方案具有很多限制。

1.  客户端经常会有些小的兼容性问题，特别是 IOS 端；
    
2.  在终端差异较大时无法保证不同终端生成的图片完全一样；
    
3.  性能开销比较大，无法预先生成。
    

假如想更进一步去解决这些限制的话，我个人考虑借助于作系统底层的能力会是个更好的方案。例如在 APP 端借助于原生的截图能力；在浏览器里借助人机交互接口进行截图，进而获得真正的用户所见即所得的截图效果。

以上就是本文所有的经验感悟，非常感谢您看到这里。  
如果对您有帮助的话，请点赞支持下，这是我坚持下去的动力

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步