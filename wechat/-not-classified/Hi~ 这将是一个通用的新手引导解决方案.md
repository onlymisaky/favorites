> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vrDQEGgOSnKBvHuwZV6vSA)

> 本组件已开源，源码可见：https://github.com/bytedance/guide

组件背景
----

不管是老用户还是新用户，在产品发布新版本、有新功能上线、或是现有功能更新的场景下，都需要一定的指导。功能引导组件就是互联网产品中的指示牌，它旨在带领用户参观产品，帮助用户熟悉新的界面、交互与功能。与 FAQs、产品介绍视频、使用手册、以及 UI 组件帮助信息不同的是，功能引导组件与产品 UI 融合为一体，不会给用户割裂的交互感受，并且不需要用户主动进行触发操作，就会展示在用户眼前。

图片比文字更加具象，以下是两种典型的新手引导组件，你是不是一看就明白功能引导组件是什么了呢？

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml52x8GUZnsvX1ia7XYeKXiaHnmicmSQ1iaZRjsewvfM9YlaCiclQAPHicfJ2tQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5OelPrl7uypdLpzpGEMxTqU0A4X1O1v4AbuicACRBN11ibq22UoRwjZjA/640?wx_fmt=png)

功能简介
----

### 分步引导

Guide 组件以分步引导为核心，像指路牌一样，一节一节地引导用户从起点到终点。这种引导适用于交互流程较长的新功能，或是界面比较复杂的产品。它带领用户体验了完整的操作链路，并快速地了解各个功能点的位置。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5AZkHhEtKuPuuWs4OKY6vGXYiaCZ42UpECl93CvSsSRMnC3a9tFCZBhA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5ztmPIdAiaK2ibmLnf7SicOEVib7OMjFEgf6OnFZOussnriaNicc65fvF5zOg/640?wx_fmt=png)

### 呈现方式

#### 蒙层模式

顾名思义，蒙层引导是指在产品上用一个半透明的黑色进行遮罩，蒙层上方对界面进行高亮，旁边配以弹窗进行讲解。这种引导方式阻断了用户与界面的交互，让用户的注意力聚焦在所圈注的功能点上，不被其他元素所干扰。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml52x8GUZnsvX1ia7XYeKXiaHnmicmSQ1iaZRjsewvfM9YlaCiclQAPHicfJ2tQ/640?wx_fmt=png)

#### 弹窗模式

很多场景下，为了不干扰用户，我们并不想使用蒙层。这时，我们可以使用无蒙层模式，即在功能点旁边弹出一个简单的窗口引导。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5OelPrl7uypdLpzpGEMxTqU0A4X1O1v4AbuicACRBN11ibq22UoRwjZjA/640?wx_fmt=png)

### 精准定位

#### 初始定位

Guide 提供了 12 种对齐方式，将弹窗引导加载到所选择的元素上。同时，还允许自定义横纵向偏差值，对弹窗的位置进行调整。下图分别展示了定位为 top-left 和 right-bottom 的弹窗：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5xhyluY53jTicpOJiaRXdMN7ibgyC8qODXDia1SjTxvO69ZpsKhX970evTw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5nhTseKEXkIjjf5sIHfg5u7Dte7fG5xicGJnQ6ib3X20cKhSxyT9V1lDg/640?wx_fmt=png)

并且当用户缩放或者滚动页面时，弹窗的定位依然是准确的。

#### 自动滚动

在很多情境中，我们都需要对距离较远的几个页面元素进行功能说明，串联成一个完整的引导路径。当下一步要圈注的功能点不在用户视野中时，Guide 会自动滚动页面至合适的位置，并弹出引导窗口。

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5Au8Unut1rc7233oCFPVKdBE88DZzgFmJ9VcyO7M6Sl4eIVVfLWXumw/640?wx_fmt=gif)

### 键盘操作

当 Guide 引导组件弹出时，我们希望用户的注意力被完全吸引过来。为了让使用辅助阅读器的用户也能够感知到 Guide 的出现，我们将页面焦点移动到弹窗上，并且让弹窗里的每一个可读元素都能够聚焦。同时，用户可以用键盘（tab 或 tab+shift）依次聚焦弹窗里的内容，也可以按 escape 键退出引导。

下图中，用户用 tab 键在弹窗中移动焦点，被聚焦的元素用虚线框标识出来。当聚焦到 “下一步” 按钮时，敲击 shift 键，便可跳至下一步引导。

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5aZiad5micjPibQtEWuOASEOwtJ631HcASW9ibTwuHYAeORUrGKw5q1ugxA/640?wx_fmt=gif)

技术实现
----

### 总体流程

在展示组件的步骤前我们会先判断是否过期，判断是否过期的标准有两个：一个是该引导组件在`localStorage`中存储唯一 key 是否为 true，为 true 则为该组件步骤执行完毕。第二个是组件接收一个`props.expireDate`，如果当前时间大于`expireDate`则代表组件已经过期则不会继续展示。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5zLweLHBhFewuSby2MSOd3Ds7iaHBibtBQFVCyQ4sGnLR2D1QtsM3xnAw/640?wx_fmt=png)

当组件没有过期时，会展示传入的`props.steps`相应的内容，steps 结构如下：

```
interface Step {    selector: string;    title: string;    content: React.Element | string;    placement: 'top' | 'bottom' | 'left' | 'right'        | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',    offset: Record<'top' | 'bottom' | 'left' | 'right', number>}const steps = Step[]
```

根据 `step.selector` 获取高亮元素，再根据 `step.placement` 将弹窗展示到高亮元素相关的具体位置。点击下一步会按序展示下个 step，当所有步骤展示完毕之后我们会将该引导组件在 `localStorage` 中存储唯一 key 置为 `true`，下次进来将不再展示。

下面来看看引导组件的具体细节实现吧。

### 蒙层模式

当前的引导组件支持有无蒙层两种模式，有蒙层的展示效果如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5Rc5WsIjjBWXBDVNg4r7KzE0Oyytvk1ZDAT1Nc3xEx3VbdV2q8T81rA/640?wx_fmt=png)

蒙层很好实现，就是一个撑满屏幕的 div，但是我们怎么才能让它做到高亮出中间的 selector 元素并且还支持圆角呢？🤔 ，真相只有一个，那就是—— border-width

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5qPbtuD4EkHiapNVMITPSicWnrT1Pf1aoZ7bgicLsKE2gaN09E8VzibMicBQ/640?wx_fmt=png)

我们拿到了 selector 元素的`offsetTop`, `offsetRight`, `offsetBottom`, `offsetLeft`，并相应地设置为高亮框的`border-width`，再把`border-color`设置为灰色，一个带有高亮框的蒙层就实现啦！在给这个高亮框 div 加个`pseudo-element ::after` 来赋予它 border-radius，完美！

### 弹窗的定位

用户使用 Guide 时，传入了步骤信息，每一步都包括了所要进行引导说明的界面元素的 CSS 选择器。我们将所要标注的元素叫做 “锚元素”。Guide 需要根据锚元素的位置信息，准确地定位弹窗。

每一个 HTML 元素都有一个只读属性 offsetParent，它指向最近的（指包含层级上的最近）包含该元素的定位元素或者最近的 `table,td,th,body`元素。每个元素都是根据它的 offsetParent 元素进行定位的。比如说，一个 absolute 定位的元素，是根据它最近的、非 static 定位的上级元素进行偏移的，这个上级元素，就是其的 offsetParent。

所以我们想到将弹窗元素放进锚元素的 offsetParent 中，再对其位置进行调整。同时，为了不让锚元素 offsetParent 中的其它元素产生位移，我们设定弹窗元素为 absolute 绝对定位。

#### 定位步骤

弹窗的定位计算流程大致如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5dJYY4YkobCol7JYuDBobHm4JxGCXagSDmRWBwMxETwzoXpvibdlMU7w/640?wx_fmt=png)

#### 步骤 1. 得到锚元素

通过传给 Guide 的步骤信息中的 selector，即 CSS selector，我们可以由下述代码拿到锚元素：

```
const anchor = document.querySelector(selector);
```

如何拿到 anchor 的 offsetParent 呢？这一步其实并没有想象中那么简单。下面我们就来详细地讲一讲这一步吧。

#### 步骤 2. 获取 offsetParent

一般来说，拿到锚元素的 offsetParent，也只需要简单的一行代码：

```
const parent = anchor.offsetParent;
```

但是这行代码并不能涵盖所有的场景，我们需要考虑一些特殊的情况。

##### 场景一：锚元素为 fixed 定位

并不是所有的 HTMLElement 都有 offsetParent 属性。当锚元素为 fixed 定位时，其 `offsetParent` 返回 `null`。这时，我们就需要使用其 **包含块（containing block）** 代替 offsetParent 了。

包含块是什么呢？大多数情况下，包含块就是这个元素最近的祖先块元素的内容区，但也不是总是这样。一个元素的包含块是由其 position 属性决定的。

*   如果 position 属性是 **`fixed`**，包含块通常是 `document.documentElement`。
    

*   如果 position 属性是 **`fixed`**，包含块也可能是由满足以下条件的最近父级元素的内边距区的边缘组成的：
    

*   `transform` 或 `perspective`的值不是`none`
    
*   `will-change` 的值是 `transform` 或 `perspective`
    
*   `filter` 的值不是 `none` 或 `will-change` 的值是 `filter`(只在 Firefox 下生效).
    
*   `contain` 的值是 `paint` (例如: contain: paint;)
    

因此，我们可以从锚元素开始，递归地向上寻找符合上述条件的父级元素，如果找不到，那么就返回 `document.documentElement`。

下面是 Guide 中用来寻找包含块的代码：

```
const getContainingBlock = node => {  let currentNode = getDocument(node).documentElement;  while (    isHTMLElement(currentNode) &&    !['html', 'body'].includes(getNodeName(currentNode))  ) {    const css = getComputedStyle(currentNode);    if (      css.transform !== 'none' ||      css.perspective !== 'none' ||      (css.willChange && css.willChange !== 'auto')    ) {      return currentNode;    }    currentNode = currentNode.parentNode;  }  return currentNode;};
```

##### 场景二：在 iframe 中使用 Guide

在 Guide 的代码中，我们常常用到 `window` 对象。比如说，我们需要在 `window` 对象上调用 `getComputedStyle()`获取元素的样式，我们还需要 `window` 对象作为元素 `offsetParent` 的兜底。但是我们并不能直接使用 `window` 对象，为什么呢？这时，我们需要考虑 iframe 的情况。

想象一下，如果我们在一个内嵌了 iframe 的应用中使用 Guide 组件，Guide 组件代码在 iframe 外面，而被引导的功能点在 iframe 里面，那么在使用 Window 对象提供的方法是，我们一定是想在所圈注的功能点所在的 Window 对象上进行调用，而非当前代码运行的 Window。

因此，我们通过下面的 `getWindow` 方法，确保拿到的是参数 node 所在的 Window。

```
// Get the window object using this function rather then simply use `window` because// there are cases where the window object we are seeking to reference is not in// the same window scope as the code we are running. (https://stackoverflow.com/a/37638629)const getWindow = node => {  // if node is not the window object  if (node.toString() !== '[object Window]') {    // get the top-level document object of the node, or null if node is a document.    const { ownerDocument } = node;    // get the window object associated with the document, or null if none is available.    return ownerDocument ? ownerDocument.defaultView || window : window;  }  return node;};
```

在 line 8，我们看到一个属性 ownerDocument。如果 node 是一个 DOM Element，那么它具有一个属性 `ownerDocument`，此属性返回的 document 对象是在实际的 HTML 文档中的所有子节点所属的主对象。如果在文档节点自身上使用此属性，则结果是 `null`。当 node 为 Window 对象时，我们返回 `window`；当 node 为 Document 对象时，我们返回了 `ownerDocument.defaultView` 。这样，`getWindow` 函数便涵盖了参数 node 的所有可能性。

#### 步骤 3. 挂载弹窗

如下代码所示，我们常常遇到的使用场景是，在组件 A 中渲染 Guide，让其去标注的元素却在组件 B、组件 C 中。

```
// 组件A const A = props => (    <>        <Guide            steps={[                {                    ......                    selector: '#btn1'                },                {                    ......                    selector: '#btn2'                },                {                    ......                    selector: '#btn3'                }            ]}        />        <button id="btn1">Button 1</button>    </>)
```

```
// 组件Bconst B = props => (<button id="btn2">Button 2</button>)
```

```
// 组件Cconst C = props => (<button id="btn3">Button 3</button>)
```

上述代码中，Guide 会自然而然地渲染在 A 组件 DOM 结构下，我们怎样将其挂载到组件 B、C 的 offsetParent 中呢？这时候就要给大家介绍一下强大却少为人知的 React Portals 了。

##### React Portals

当我们需要把一个组件渲染到其父节点所在的 DOM 树结构之外时， 我们首先应该考虑使用 React Portals。Portals 最适用于这种需要将子节点从视觉上渲染到其父节点之外的场景了，在 Antd 的 Modal、Popover、Tooltip 组件实现中，我们也可以看到 Portal 的应用。

我们使用 `ReactDOM.createPortal(child, container)`创建一个 Portal。child 是我们要挂载的组件，container 则是 child 要挂载到的容器组件。

虽然 Portal 是渲染在其父元素 DOM 结构之外的，但是它并不会创建一个完全独立的 React DOM 树。一个 Portal 与 React 树中其它子节点相同，都可以拿到父组件的传来的 props 和 context，也都可以进行事件冒泡。

另外，与 ReactDOM.render 所创建的 React DOM 树不同，ReactDOM.createPortal 是应用在组件的 render 函数中的，因此不需要手动卸载。

在 Guide 中，每跳一步，上一步的弹窗便会卸载掉，新的弹窗会被加载到这一步要圈注的元素的 offsetParent 里。伪代码如下：

```
const Modal = props => (    ReactDOM.createPortal(        <div>            ......        </div>,    offsetParent);)
```

将弹窗渲染进 offsetParent 后，Guide 的下一步工作便是计算弹窗相对于 offsetParent 的偏移量。这一步非常复杂，并且要考虑一些特殊情况。下面就让我们就仔细地讲解这部分计算吧。

#### 步骤 4. 偏移量计算

以一个 `placement = left` ，即需要在功能点**左侧**展示的弹窗引导为例。如果我们直接把弹窗通过 React Portal 挂载到锚元素的 offsetParent 中，并赋予其绝对定位，其位置会如下图所示——左上角与 offsetParent 的左上角对齐。

_下图中，用**蓝色框**表示的考拉图片是 Guide 需要标注的元素，即锚元素；**红色框**则标识出这个锚元素的 offsetParent 元素。_

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5lTk2fxEOulyw66elAxDymVfKibkIbAlZicwYB3ESLGaial6MAN9vWHH1A/640?wx_fmt=png)

而我们预想的定位结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5GAZy0DVdEHAJqLUB0BUTHTqMkPoVykwTTiaILlXuhxPklzmImiaBibyAw/640?wx_fmt=png)

参考下图，将弹窗从初始位置移动至预期位置，我们需要在 y 轴上向下移动弹窗 `offsetTop + h1/2 - h2/2 px`。其中，`h1` 为锚元素的高度，`h2` 为弹窗的高度。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5z2Zf83R5ibLLS4ewJBDMKchlVEqqxDkDyL3o1Gcmtqbr6q1foD0FLYw/640?wx_fmt=png)

但是，上述计算依然忽略了一种场景，那就是当锚元素定位为 fixed 时。若锚元素定位为 fixed，那么无论锚元素所在的界面怎样滑动，锚元素相对于屏幕视口（viewport）的位置是固定的。自然，用来对 fixed 锚元素进行引导的弹窗也需要具有这些特性，即同样需要为 fixed 定位。

### Arrow 实现及定位

`arrow` 是 `modal` 的子元素且相对于 `modal` 绝对定位，如下图所示有十二种展示位置，我们把十二种定位分为两类情况：

1.  紫色的四种居中情况；
    
2.  黄色的其余八种斜角。
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5iam21Bj8CTQUl232SnZEtL5BcC0S06YenzfyPNJszpbBe7zTcbWfJrw/640?wx_fmt=png)

**对于第一类情况**

箭头始终是相对弹窗边缘居中的位置，出对于 top、bottom，箭头的 right 值始终是`(modal.width - arrow.diagonalWidth)/2` ，而 top 或 bottom 值始终为`-arrow.diagonalWidth/2`。

对于 left、right，箭头的 top 值是`(modal.height - arrow.diagonalWidth)/2` ，而 left 或 right 为`-arrow.diagonalWidth/2`。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml56cpmUIibCah9aUMxXaicr35DeZZQYriavs3mOxBM2hTsAAmhjHoHGCgMg/640?wx_fmt=png)

_注：`diagonalWidth`为对角线宽度，`getReversePosition\(placement\)`为获取传入参数的 reverse 位置，top 对应 bottom，left 对应 right。_

伪代码如下：

```
const placement = 'top' | 'bottom' | 'left' | 'right';const diagonalWidth = 10;const style = {  right: ['bottom', 'top'].includes(placement)    ? (modal.width - diagonalWidth) / 2    : '',  top: ['left', 'right'].includes(placement)    ? (modal.height - diagonalWidth) / 2    : '',    [getReversePosition(placement)]: -diagonalWidth / 2,};
```

**对于第二类情况**

对于 A-B 的位置，通过下图可以发现，B 的位移总是固定值。比如对于 placement 值为 top-left 的弹窗，箭头 left 值总是固定的，而 bottom 值为`-arrow.diagonalWidth/2`。

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z8OUyCD3mcV9N0chjPDkml5J71n1u3vmedq9pTiabs3FyQsd9tSYIKKnDNAqhflGR9x7CjG4JKMmMA/640?wx_fmt=png)

以下为伪代码：

```
const [firstPlacement, lastPlacement] = placement.split('-');const diagonalWidth = 10;const margin = 24;const style =  {    [lastPlacement]: margin,    [getReversePosition(placement)]: -diagonalWidth / 2,}
```

### Hotspot 实现及定位

引导组件支持 `hotspot` 功能，通过给一个 `div` 元素加上动画改变其 `box-shadow` 大小实现呼吸灯的效果，效果如下图所示，其中热点的定位是相对箭头的位置计算的，这里便不赘述了。

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73z8OUyCD3mcV9N0chjPDkml52XC7MHJnllXCU8xicVNia6sAEZic2Xgba1yv8NHDQEESsCNTsrzEtib8XQ/640?wx_fmt=gif)

结语
--

在 Guide 的开发初期，我们并没有想到这样一个小组件需要考虑到以上这些技术点。可见，再小的组件，让其适用于所有场景，做到足够通用都是件难事，需要不断地尝试与反思。

本文作者：Lilly Jiang & Wind

招聘硬广
----

我们团队招人啦！！！

欢迎加入字节跳动商业变现前端团队，我们在做的技术建设有：前端工程化体系升级、团队 Node 基建搭建、前端一键式 CI 发布工具、组件服务化支持、前端国际化通用解决方案、重依赖业务系统微前端改造、可视化页面搭建系统、商业智能 BI 系统、前端自动化测试等等等等，拥有近百号人的北上杭大前端团队，一定会有你感兴趣的领域!

如果你想要加入我们，欢迎点击我们的内推通道吧：

✨✨✨✨✨

校招专属入口：字节跳动校招内推码: WAU8ZHR

如果你想了解我们部门的日常生 (dòu) 活 (bī) 以及工作环 (fú) 境 (lì)

也可以点击阅读原文了解噢～

✨✨✨✨✨