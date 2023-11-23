> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kt3gCLrXcVmiaVoHsvEvNg)

```
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

前言
==

如果想要文本超出宽度后用省略号省略，只需要加上以下的 css 就行了。

```
// 仅仅粘贴相关的
const cellChild = (event.target as HTMLElement).querySelector('.cell') 
const range = document.createRange()
range.setStart(cellChild, 0)
range.setEnd(cellChild, cellChild.childNodes.length)
let rangeWidth = range.getBoundingClientRect().width
let rangeHeight = range.getBoundingClientRect().height
/** detail: https://github.com/element-plus/element-plus/issues/10790
* What went wrong?
* UI > Browser > Zoom, In Blink/WebKit, getBoundingClientRect() sometimes returns inexact values, probably due to lost
precision during internal calculations. In the example above:
* - Expected: 188
* - Actual: 188.00000762939453
*/
const offsetWidth = rangeWidth - Math.floor(rangeWidth)
if (offsetWidth < 0.001) {
  rangeWidth = Math.floor(rangeWidth)
}
const offsetHeight = rangeHeight - Math.floor(rangeHeight)
if (offsetHeight < 0.001) {
  rangeHeight = Math.floor(rangeHeight)
}


const { top, left, right, bottom } = getPadding(cellChild) // 见下方
const horizontalPadding = left + right
const verticalPadding = top + bottom
if (
  rangeWidth + horizontalPadding > cellChild.offsetWidth ||
  rangeHeight + verticalPadding > cellChild.offsetHeight ||
  cellChild.scrollWidth > cellChild.offsetWidth
) {
  createTablePopper(
    parent?.refs.tableWrapper,
    cell,
    cell.innerText || cell.textContent,
    nextZIndex,
    tooltipOptions
  )
}
```

**3 行 css 搞定，但是问题来了：**

如果我们想要当文本被省略的时候，也就是当文本超出指定的宽度后，鼠标悬浮在文本上面才展示 popper，应该怎么实现呢？

CSS 帮我们搞定了省略，但是 JS 并不知道文本什么时候被省略了，所以我们得通过 JS 来计算。

接下来，我将介绍几种方法来实现 JS 计算省略。

**createRange**
===============

我发现`Element-plus`表格组件已经实现了这个功能，所以就先来学习一下它的源码。

**源码地址：**

**https://github.com/element-plus/element-plus/blob/dev/packages/components/table/src/table-body/events-helper.ts**

```
// 上面代码17行中的getPadding函数
const getPadding = (el: HTMLElement) => {
  const style = window.getComputedStyle(el, null)
  const paddingLeft = Number.parseInt(style.paddingLeft, 10) || 0
  const paddingRight = Number.parseInt(style.paddingRight, 10) || 0
  const paddingTop = Number.parseInt(style.paddingTop, 10) || 0
  const paddingBottom = Number.parseInt(style.paddingBottom, 10) || 0
  return {
    left: paddingLeft,
    right: paddingRight,
    top: paddingTop,
    bottom: paddingBottom,
  }
}
```

```
<div class="ellipsis box">
  Lorem ipsum dolor sit amet consectetur adipisicing elit. 
</div>

<style>
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .box {
    border: 1px solid gray;
    padding: 10px;
  }
</style>
```

`document.createRange()` 是 JavaScript 中的一个方法，用于创建一个 Range 对象，表示文档中的一个范围。Range 对象通常用于选择文档中的一部分内容，然后对其进行操作。

它可以：

1.  设置选中文本范围：可以使用 `document.createRange()` 方法创建一个 Range 对象，并使用 `setStart()` 和 `setEnd()` 方法设置选中文本的起始和结束位置。
    
2.  插入新元素：可以使用 `document.createRange()` 方法创建一个 Range 对象，并使用 `insertNode()` 方法将新元素插入到文档中的指定位置。
    
3.  获取特定元素的位置：可以使用 `document.createRange()` 方法创建一个 Range 对象，并使用 `getBoundingClientRect()` 方法获取元素在文档中的位置和大小信息。
    

这边 element 就是使用 range 对象的 getBoundingClientRect 获取到元素的宽高，同时因为得到的宽高值有很多位的小数，所以 element-plus 做了一个判断，如果小数值小于 0.001 就舍弃小数部分。

接下来，就让我们进行一下复刻吧，可以通过调整盒子的宽度，在页面中看到是否有省略号的判断。

```
const checkEllipsis = () => {
  const range = document.createRange();
  range.setStart(box, 0)
  range.setEnd(box, box.childNodes.length)
  let rangeWidth = range.getBoundingClientRect().width
  let rangeHeight = range.getBoundingClientRect().height
  const contentWidth = rangeWidth - Math.floor(rangeWidth)
  const { pLeft, pRight } = getPadding(box)
  const horizontalPadding = pLeft + pRight
  if (rangeWidth + horizontalPadding > box.clientWidth) {
    result.textContent = '存在省略号'
  } else {
    result.textContent = '容器宽度足够，没有省略号了'
  }
}
```

注意这里，我们需要区分`clientWidth`和`offsetWidth`，因为我们现在给了 box 加了 1px 的边框，所以 offsetWidth = 1 * 2 (左右两边的 border 宽度) + clientWidth，所以我们这边使用 clientWidth 来代表 box 的实际宽度。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJP2DmNRIkRibpejPlEX66CqmllMUIACPibCR3Z3iaoZUw0EPryjgibZhroPo0X5bsFez4w4kibXdFCB95A/640?wx_fmt=jpeg)

```
<div class="ellipsis box">
  Lorem ipsum dolor sit amet consectetur adipisicing elit. 
  <span style="font-size: large;">hello world</span>
  <span style="letter-spacing: 20px;">hello world</span>
</div>
```

这种方法 div 里面放的元素和样式是不受限制的，比如 html 这样写还是能够正确计算的。

```
<div class="ellipsis box">
  Lorem ipsum dolor sit amet consectetur adipisicing elit. 
</div>

<style>
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .box {
    border: 1px solid gray;
    padding: 10px;
  }
</style>
```

创建一个 div 来获取模拟宽度
================

我们可以还可以通过创建一个几乎相同的 div 来获取没有`overflow:hidden`时元素的实际宽度。

```
const checkEllipsis = () => {
  const elementWidth = box.clientWidth;
  const tempElement = document.createElement('div');
  const style = window.getComputedStyle(box, null)
  tempElement.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    white-space: nowrap;
    padding-left:${style.paddingLeft};
    padding-right:${style.paddingRight};
    font-size: ${style.fontSize};
    font-family: ${style.fontFamily};
    font-weight: ${style.fontWeight};
    letter-spacing: ${style.letterSpacing};
  `;
  tempElement.textContent = box.textContent;
  document.body.appendChild(tempElement);
  if (tempElement.clientWidth >= elementWidth) {
    result.textContent = '存在省略号'
  } else {
    result.textContent = '容器宽度足够，没有省略号了'
  }
  document.body.removeChild(tempElement);
}
```

```
<div class="ellipsis box">
  <span class="content">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing
    elit.
  </span>
</div>

<style>
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .box {
    border: 1px solid gray;
    padding: 10px;
  }
</style>
```

当 box 元素里面存在多个 dom 元素的时候，还得进行一个递归创建 dom，或者也可以试试`cloneNode(true)`来试试克隆。

**创建一个 block 元素来包裹 inline 元素**
==============================

这种方法从`acro design vue`中学到的，应该是最简单的办法。要点就是外层一定是 block 元素，内层是 inline 元素

```
const checkEllipsis = () => {
  const { pLeft, pRight } = getPadding(box)
  const horizontalPadding = pLeft + pRight
  if (box.clientWidth <= content.offsetWidth+horizontalPadding ) {
    result.textContent = '存在省略号'
  } else {
    result.textContent = '容器宽度足够，没有省略号了'
  }
}
```

通过上面对 css 和 html 做的处理，我们可以实现让 box 元素里面的文字进行 ellipisis，同时由于并没有 对`span.content`进行任何 overflow 的处理，所以该 span 的 offsetWidth 还是保持不变。

```
<div class="ellipsis box">
  <span class="content">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing
    elit.
    <span style="font-size: large;">
      hello world
    </span>
    <span style="letter-spacing: 20px;">
      hello world
    </span>
  </span>
</div>
```

同样，只要满足外层元素是 block，内层元素是 inline 的话，里面的 dom 元素其实是随便放的

```
<div>
  <span>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing
    elit.
    <span>
      hello world
    </span>
    <span>
      hello world
    </span>
  </span>
</div>
```

**方法比较**
========

1.  性能（个人主观判断）3>1>2
    
2.  省心程度（个人主观判断）：1>3>2
    
3.  精确度（个人主观判断）：3 种方法精确度几乎相同，如果硬要比较我觉得是 3>1>2
    

之后我在看看其他组件库有什么好的方法，然后再补充上来，前端总是在做这些很小很小的点，哈哈。

> 作者：嘉琪 coder  
> 链接：https://juejin.cn/post/7262280335978741797

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下
```