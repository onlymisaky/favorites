> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EgWOcjLldO5VQrto5XYNJQ)

在 web 开发中，有时不可避免会和 “选区” 与“光标”打交道，比如选中高亮、选中出现工具栏、手动控制光标位置等。选区就是用鼠标选中的那一部分，通常是蓝色  

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPIC3tyFfwFTKKUM5CE7ArehNGNss5whwZhVvDdibicficX7oicbrvOW8ucLMw/640?wx_fmt=png)

光标呢，是那个闪烁的竖线吗？

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICyByWuLibJxdkMCBWv97KdychQibX6UVKmtG74X6XGibrrzZ2rEYiaKcI1Q/640?wx_fmt=png)

> 温馨提示：文章比较长，耐心看完可以完全自主的操作选区和光标

一、“选区”和 “光标” 是什么？
-----------------

先说结论：**光标是一种特殊的选区**。

想搞清楚这个，不得不提到两个重要的对象：Section[1] 和 Range[2]。这两个对象都有大量的属性和方法，详细可以查看官方文档，这里简单介绍一下：

1.**Selection** 对象表示用户选择的文本范围或插入符号的当前位置。它代表页面中的文本选区，可能横跨多个元素。通常由用户拖拽鼠标经过文字而产生。2.**Range** 对象表示包含节点和部分文本节点的文档片段。通过 `selection` 对象获得的 `range` 对象才是我们操作光标的重点。获取 `selection` ，可以通过全局的 getSelection[3] 方法

```
const selection = window.getSelection();
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICbVA8QibBzCAo6f4liaqvyplcB0DDiatCgibRPtnwI6EmbbLZUL4JSrSWIg/640?wx_fmt=png)

通常情况下我们不会直接操作 `selection` 对象，而是需要操作用 `seleciton` 对象所对应的用户选择的 `range` 。获取方式如下：

```
const range = selection.getRangeAt(0);
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICjex2KtAWqjBKS4hHiaAIMEvsfVLukQTrwuAoC5QoDJALcA4d31ccv3w/640?wx_fmt=png)

为什么这里 `getRangeAt`需要传一个序列呢，难道选区还能有几个吗？还真是，只不过目前只有 Firefox 支持多选区，通过`cmd`键（windows 上是 `ctrl`键）可以实现多选区

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICkUib7d5AHSE3Vwic57YsGjWYAsysLIEp6RJia1TmMoA44Sk1KxFbUOZCA/640?wx_fmt=png)

可以看到，此时 `selection` 返回的 `rangeCount`为 5。不过大部分情况下都不需要考虑多选区的情况。

如果想获取选中的文本内容也非常简单，直接`toString` 就可以了

```
window.getSelection().toString()
// 或者
window.getSelection().getRangeAt(0).toString()
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICvJAkiaraJmXyicTEm1kBibC2OiaGfNOUqzrfDK1uVo2sibibX7R3orHN4e8w/640?wx_fmt=png)

再看一个`range`返回的一个属性，`collapsed`，表示选区的起点与终点是否重叠。当`collapsed`为`true`时，**选中区域被压缩成一个点，对于普通的元素，可能什么都看不到，如果是在可编辑元素上，那这个被压缩的点就变成了可以闪烁的光标**。

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICEAtkQM1fniaU8ROGM56OdJztKPUEuuDiaVpPjTbq3bOicW48dDN7m2hEw/640?wx_fmt=png)

所以，光标就是一种起始点相同的选区

二、可编辑元素
-------

虽然选区和元素是否可编辑并没有直接关系，唯一的区别就是，在可编辑元素上可以看到光标，不过很多时候的需求都是针对可编辑元素的。

提到可编辑元素，一般有两种，一种是默认的表单输入框 `input`和`textarea`

```
<input type="text">
<textarea></textarea>
```

另外一种是给元素添加属性`contenteditable="true"`，或者 CSS 属性 `-webkit-user-modify`  

```
<div contenteditable="true">yux阅文前端</div>
```

或者  

```
div{
    -webkit-user-modify: read-write;
}
```

这两种有什么区别呢？简单来说，表单元素更容易控制，浏览器提供了更直观的 API 来操控选区。  

三、input 和 textarea 选区操作
-----------------------

首先看这类元素的操作方式，几乎可以不用 `section` 和 `range` 相关 API，可能更好理解一些。API 不太好记，直接看几个例子吧，这里以 `textarea`为例

假设 HTML 如下

```
<textarea id="txt">阅文旗下囊括 QQ 阅读、起点中文网、新丽传媒等业界知名品牌，拥有 1450 万部作品储备，940 万名创作者，覆盖 200 多种内容品类，触达数亿用户，已成功输出包括《庆余年》《赘婿》《鬼吹灯》《琅琊榜》《全职高手》在内的动画、影视、游戏等领域的 IP 改编代表作。</textarea>
```

### 1. 主动选中某一区域  

表单元素选中区域可以用到 setSelectionRange[4] 方法

> inputElement.setSelectionRange(selectionStart, selectionEnd [,
> 
> selectionDirection]); 

有 3 个 参数，分别是 `selectionStart` (起始位置)、 `selectionEnd` （ 结束位置）和 `selectionDirection`（方向）

比如我们想主动选中前两个字 “阅文”，那么可以

```
btn.onclick = () => {
    txt.setSelectionRange(0,2);
    txt.focus();
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICUYIETQ7LIAJQqCm8ZUaOJ9gy343sGibkw4Onx6G7L7JA4aAzrfAb0vg/640?wx_fmt=gif)

如果想全部选中，可以直接用 `select` 方法

```
btn.onclick = () => {
    txt.select();
    txt.focus();
}
```

### 2. 聚焦到某一位置  

如果我们想把光标移动到 “阅文” 的后面，根据前面所讲，光标其实是选区起始位置相同的产物，所以可以这样

```
btn.onclick = () => {
    txt.setSelectionRange(2,2); // 设置起始点相同
    txt.focus();
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICyur5g22QaeVx73OlMhlTC6rt2uSmOf5rrf2xKMajAPhT8wecHVI6Ug/640?wx_fmt=gif)

### 3. 还原之前的选区

有时候，我们需要在点击其他地方后，再重新选中之前的选区。这就需要先记录一下之前选区的起始位置，然后主动设置一下就行了

选区的起始位置，可以用 `selectionStart`和`selectionEnd`这两个属性来获取，所以

```
const pos = {}
document.onmouseup = (ev) => {
   pos.start = txt.selectionStart;
   pos.end = txt.selectionEnd;
}
btn.onclick = () => {
    txt.setSelectionRange(pos.start,pos.end)
    txt.focus();
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICm2CibO2BvxFJr4ibj75bQJ87ed0iaT2jCJRYGDkfibF6T3iaf8aTbxgV8sQ/640?wx_fmt=gif)

### 4. 在指定选区插入（替换）内容

表单输入框插入内容需要用到 setRangeText[5] 方法，

> inputElement.setRangeText(replacement); 
> 
> inputElement.setRangeText(replacement,start, end [,selectMode]); 

这个方法有两种形式，第 2 中形式有 4 个参数，第一个参数 `replacement` ，表示需要替换的文本，然后`start`和`end`是起始位置，默认是该元素当前选中区域，最后一个参数`selectMode`，表示替换后选区的状态，有 4 个可选项

•select 替换后选中 •start 替换后光标位于替换词之前 •end 替换后光标位于替换词之后

•preserve 默认值，尝试保留选区 比如，我们在选区插入或替换成一段文本 “❤️❤️❤️”，可以这样：

```
btn.onclick = () => {
    txt.setRangeText('❤️❤️❤️')
    txt.focus();
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICCia5piaIbjBC1rtU2mcVNS7D5wwYCuAzTARSCQS2HycEql5LLwdcuT3w/640?wx_fmt=gif)

上面有一个默认值 “尝试保留选区” 是什么意思呢？假设手动选中的区域是`[9,10]`，如果在`[1,2]`的位置替换新内容，那么选区仍然在之前位置。如果在`[8,11]`的位置替换新内容，由于新内容的位置覆盖了之前的选区，原选区也就不存在了，那么替换完之后，选区会选中刚刚插入的新内容

```
btn.onclick = () => {
    txt.setRangeText('❤️❤️❤️',5,10,'preserve')
    txt.focus();
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPIC8N7UCIYIpK5dLErEmJ6eFzdAkC0ER6xJjWpTKkluxNCChqibBicB1Dfg/640?wx_fmt=gif)

以上完整代码可以访问 setSelectionRange & setRangeText (codepen.io)[6]，关于表单输入框的相关操作就到这里了，下面介绍普通元素的

四、普通元素的选区操作
-----------

首先，普通元素并没有以上方法

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPIClYhmdkAo0WtGuo1O5uRIEH8cK5vKibRwyYhoYQjcQrvr5aMbxS9DibeQ/640?wx_fmt=png)

这就需要用到前面提到的`section`和`range`相关方法了，这里 API 也很多，还是从例子看起吧

### 1. 主动选中某一区域

首先需要主动创建一个`Range`对象，接着设置区域的起始位置，然后将这个对象添加到`Section`中就可以了。值得注意的是，设置区域起始位置的方法为 range.setStart[7] 和 range.setEnd[8]

> range.setStart(startNode, startOffset); 
> 
> range.setEnd(endtNode, endOffset); 

为什么要分成两部分呢？**原因在于普通元素的选区远比表单要复杂的多 ！** 表单输入框里只有单一的文本，普通元素可能会包含多个元素

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPIC7BUEaUOnD4kBjJZkMwGLMOhvnajyP0xELj3lcOeNuFibcMOb88qXpDQ/640?wx_fmt=png)

通过两个方法，可以把这两者之前的内容区域选中

添加到选区的方法是 selection.addRange[9]

> selection.addRange(range)

不过一般在添加之前，应该清除掉之前的选区，可以用 selection.removeAl -lRanges 方法

```
selection.removeAllRanges()
selection.addRange(range)
```

先看纯文本的例子，假设 HTML 如下  

```
<div id="txt" contenteditable="true">阅文旗下囊括 QQ 阅读、起点中文网、新丽传媒等业界知名品牌，拥有 1450 万部作品储备，940 万名创作者，覆盖 200 多种内容品类，触达数亿用户，已成功输出包括《庆余年》《赘婿》《鬼吹灯》《琅琊榜》《全职高手》在内的动画、影视、游戏等领域的 IP 改编代表作。</div>
```

如果想将前面两个字 “阅文” 选中，可以这样做  

```
btn.onclick = () => {
  const selection = document.getSelection();
  const range = document.createRange();
  range.setStart(txt.firstChild,0);
  range.setEnd(txt.firstChild,2);
  selection.removeAllRanges();
  selection.addRange(range);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICczibMK6eTe0oE9pCYldX914Vfg3PRltMObDqQ7uyPcFgwsUas3zdU1Q/640?wx_fmt=gif)

这里需要注意一点，在`setStart`和`setEnd`中设置的节点是`txt.firstChild`，而不是`txt`，这是为什么呢？

MDN 上是这么定义的：

> 如果起始节点类型是 `Text` ， `Comment` , or `CDATASection` 之一, 那么 `startOffset` 指的是从起始节点算起字符的偏移量。对于其他 `Node` 类型节点， `startOffset` 是指从起始结点开始算起子节点的偏移量

什么意思呢？假设有一个这样的结构：

```
<div>yux阅文前端</div>
```

其实结构是这样的![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICNySqcRI8e737Yr7OXyJrdMWTibrVMpHjKEmJxDJTmGEcuFj7czoe3gw/640?wx_fmt=png)

所以如果将最外层的 `div` 作为起始节点，那么对于它本身来说，**它只有 1 个文本节点**，如果设置偏移为 2，浏览器就直接报错，由于只有一个文本节点，所以需要以它的第一个文本节点作为起始节点，也就是 `firstChild`，那样它就会以每个**字符**作为偏移量

### 2. 主动选中富文本中的某一区域

普通元素相比表单元素，最大的区别就是，支持内嵌标签，也就是富文本，假设这样一个 HTML

```
<div id="txt" contenteditable="true">yux<span>阅文</span>前端</div>
```

真实结构是这样的![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICGgB3jg2icqmdm6mjhJZETE7n2In2jMEylEPcXWbGmjphX3FaTibuSibuQ/640?wx_fmt=png)

我们也可以通过`childNodes`获取子节点

```
div.childNodes
```

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICkaiaClRExIh3AjeCc5HYRSoYpbauRToJWZUhlUcEfx5kmyasxWZz2zQ/640?wx_fmt=png)

如果要选中 “阅文” 该怎么做呢？

由于 “阅文” 是一个独立的标签，可以用到另外两个新的 API，range.selectNode[11] 和 range.selectNodeContents[12]，这两个都是表示选中某一节点，不同的是，`selectNodeContents`仅包含只节点，不包含自身

这里 “阅文” 所在的标签是第 2 个，所以

```
btn.onclick = () => {
  const selection = document.getSelection();
  const range = document.createRange();
  range.selectNode(txt.childNodes[1])
  selection.removeAllRanges();
  selection.addRange(range);
}
```

这里可以看看 `selectNodeContents` 和 `selectNode` 的具体区别，给 `span` 添加一个红色的样式，下面是`selectNode`的效果![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICW0ohPOB8ziayXRjZFkp10XQsnFX9sS9ia41H9OOXPLs1E4Sd44IaZnXw/640?wx_fmt=gif)

再看`selectNodeContents`的效果

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICx5f7SMRLgzbcK9M6w8C5aKrC5j6Jjk4ps9TXWmtSKURYJwOI7dv9Eg/640?wx_fmt=gif)

很明显`selectNodeContents`只是选中的节点的内部，当删除后，节点本身还在，所以重新输入内容还是红色的。

如果只想选中 “阅文” 的“阅”字，那如何操作呢？其实就是在这个标签下往下查找就行了

```
btn.onclick = () => {
  const selection = document.getSelection();
  const range = document.createRange();
  range.setStart(txt.childNodes[1].firstChild, 0)
  range.setEnd(txt.childNodes[1].firstChild, 1)
  selection.removeAllRanges();
  selection.addRange(range);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICUZNJSGxdeExT4NHWqYicokB2frKoP5SCrOtRKM5lgb4zIIR1B72cgicA/640?wx_fmt=gif)

可以看到，这里的起始点都是相对于`span`元素的，而不是外层`div`的，这似乎有些不合常理？通常我们希望的肯定是针对最外层指定一个区间，比如 `[2,5]`，不管你是什么结构，直接选中就行了，而不是像这样手动去找具体的标签，这该怎么处理呢？

选区最关键的一点就是获取起始点和结束点以及偏移量，如何通过相对外层的偏移量获取到最里层元素的信息呢？

假设有这样一段 HTML，稍微有点复杂

```
<div>yux<span>阅文<strong>前端</strong>团队</span></div>
```

试着找了很多官方文档，可惜并没有直接获取的 API，只能逐层遍历了。整体思路就是，先通过`childNodes`获取第一层的信息，被分成好几个区间，如果需要的偏移量在这个区间，就继续往里遍历，直到最底层，示意如下：![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICnBtCfBhapkFIwNOADPOOC9dJxtbm3BP2Amibc91lzPH2CfuibNkXNmvg/640?wx_fmt=png)

只要看红色部分（#text），不就一目了然了？用代码实现就是

```
function getNodeAndOffset(wrap_dom, start=0, end=0){
    const txtList = [];
    const map = function(children){
        [...children].forEach(el => {
            if (el.nodeName === '#text') {
                txtList.push(el)
            } else {
                map(el.childNodes)
            }
        })
    }
    // 递归遍历，提取出所有 #text
    map(wrap_dom.childNodes);
    // 计算文本的位置区间 [0,3]、[3, 8]、[8,10]
    const clips = txtList.reduce((arr,item,index)=>{
        const end = item.textContent.length + (arr[index-1]?arr[index-1][2]:0)
        arr.push([item, end - item.textContent.length, end])
        return arr
    },[])
    // 查找满足条件的范围区间
    const startNode = clips.find(el => start >= el[1] && start < el[2]);
    const endNode = clips.find(el => end >= el[1] && end < el[2]);
    return [startNode[0], start - startNode[1], endNode[0], end - endNode[1]]
}
```

有了这个方法，就可以选中任意的区间了，不管是什么结构  

```
<div id="txt" contenteditable="true">阅文旗下<span>囊括 <span><strong>QQ</strong>阅读</span>、起点中文网、新丽传媒等业界知名品牌</span>，拥有 1450 万部作品储备，940 万名<span>创作者</span>，覆盖 200 多种内容品类，触达数亿用户，已成功输出包括《庆余年》《赘婿》《鬼吹灯》《琅琊榜》《全职高手》在内的动画、影视、游戏等领域的 IP 改编代表作。</div>
```

```
btn.onclick = () => {
  const selection = document.getSelection();
  const range = document.createRange();
  const nodes = getNodeAndOffset(txt, 7, 12);
  range.setStart(nodes[0], nodes[1])
  range.setEnd(nodes[2], nodes[3])
  selection.removeAllRanges();
  selection.addRange(range);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICDUGvGnIMWKMxMzgcve3fsiab2n0ksfR3LQNonibsxWiaeAAGyTTC9VIkw/640?wx_fmt=gif)

### 3. 聚焦到某一位置

这个就比较容易了，只需要把起始点设置相同就可以了，比如这里想把光标移动到 “QQ” 的后面，“QQ”后的位置是“8”，所以可以这样来实现

```
btn.onclick = () => {
  const selection = document.getSelection();
  const range = document.createRange();
  const nodes = getNodeAndOffset(txt, 8, 8);
  range.setStart(nodes[0], nodes[1])
  range.setEnd(nodes[2], nodes[3])
  selection.removeAllRanges();
  selection.addRange(range);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICWyDRHGAHGiarv3gcDd0zqGVY1nBSlmSlo7chPhDUW2Q4NQDtLmNOFIg/640?wx_fmt=gif)

### 4. 还原之前的选区

这个有两种方式，第一种，可以先把之前的选区存下来，然后后面复原就行了

```
let lastRange = null;
txt.onkeyup = function (e) {
    var selection = document.getSelection()
    // 保存最后的range对象
    lastRange = selection.getRangeAt(0)
}
btn.onclick = () => {
  const selection = document.getSelection();
  selection.removeAllRanges();
  // 还原上次的选区
  selection.addRange(lastRange);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPIC2Xs1bRheq5PIpklvWO2culzJCNLuwdDmWBOalYYBxmyvB3hd1icwG7w/640?wx_fmt=gif)

但是这种方式不太靠谱，存下来的`lastRange`很容易丢失，因为这个是跟随内容的，如果内容发生了改变，这个选区也就不存在了，所以需要一种更靠谱的方式，比如记录之前的绝对偏移量，同样需要之前的遍历，找到最底层文本节点，然后计算出相对整段文本的偏移量，代码如下：

```
function getRangeOffset(wrap_dom){
    const txtList = [];
    const map = function(children){
        [...children].forEach(el => {
            if (el.nodeName === '#text') {
                txtList.push(el)
            } else {
                map(el.childNodes)
            }
        })
    }
    // 递归遍历，提取出所有 #text
    map(wrap_dom.childNodes);
    // 计算文本的位置区间 [0,3]、[3, 8]、[8,10]
    const clips = txtList.reduce((arr,item,index)=>{
        const end = item.textContent.length + (arr[index-1]?arr[index-1][2]:0)
        arr.push([item, end - item.textContent.length, end])
        return arr
    },[])
    const range = window.getSelection().getRangeAt(0);
    // 匹配选区与区间的#text，计算出整体偏移量
    const startOffset = (clips.find(el => range.startContainer === el[0]))[1] + range.startOffset;
    const endOffset = (clips.find(el => range.endContainer === el[0]))[1] + range.endOffset;
    return [startOffset, endOffset]
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICS363zgsksEcMs4DMhxUVwdo73PcdKz393ngJYnnSoNMWSHnjicYJ92g/640?wx_fmt=gif)

然后就可以利用这个偏移量，就主动选中该区域了

```
const pos= {}
txt.onmouseup = function (e) {
    const offset = getRangeOffset(txt)
    pos.start = offset[0]
    pos.end = offset[1]
}
btn.onclick = () => {
  const selection = document.getSelection();
  const range = document.createRange();
  const nodes = getNodeAndOffset(txt, pos.start, pos.end);
  range.setStart(nodes[0], nodes[1])
  range.setEnd(nodes[2], nodes[3])
  selection.removeAllRanges();
  selection.addRange(range);
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICs1Q9ewiaa5dBKp08XDa9uCdGAPHRkPBoNnxxMuJqzoupKa7SoIQGk4g/640?wx_fmt=gif)

### 5. 在指定选区插入（替换）内容

在选区插入内容，可以用到 range.insertNode[13] 方法，它表示在选区的起点处插入一个节点，**并不会替换掉当前已经选中的**，如果要替换，可以先删除，删除需要用到 deleteContents[14] 方法，具体实现就是

```
let lastRange = null;
txt.onmouseup = function (e) {
    lastRange = window.getSelection().getRangeAt(0);
}
btn.onclick = () => {
  const newNode = document.createTextNode('我是新内容')
  lastRange.deleteContents()
  lastRange.insertNode(newNode)
}
```

这里需要注意的是，必须是一个节点，如果是文本，可以用 `document.createTextNode` 来创建![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICkDVib9dkRzHgTU7MS7IzEcLHU59peZSvuiaKSgzmRKysaYOfRyvwdDCA/640?wx_fmt=gif)

还可以插入带标签的内容

```
btn.onclick = () => {
  const newNode = document.createElement('mark');
  newNode.textContent = '我是新内容' 
  lastRange.deleteContents()
  lastRange.insertNode(newNode)
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICVSPPycFZ0RPLnwJpB4ferOibbffczB3yib8gic5MLGV8UcaVhAnXoEglw/640?wx_fmt=gif)

插入的新内容默认是选中的，如果希望插入后光标在新内容后边，怎么处理呢

这时可以用到 range.setStartAfter[15] 方法，表示设置区间的起点为该元素的后面，终点默认就是该元素的后面，不用处理，实现就是

```
btn.onclick = () => {
  const newNode = document.createElement('mark');
  newNode.textContent = '我是新内容' 
  lastRange.deleteContents()
  lastRange.insertNode(newNode)
  lastRange.setStartAfter(newNode)
  txt.focus()
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICoicDamQXAYvCnavnASZn2Z0HhArn31lSs4TiaQY5TzgrDI2zNHtrfxoQ/640?wx_fmt=gif)

### 6. 给指定选区包裹标签

最后再来看一个比较常见的例子，在选中时将所选区域包裹一层标签。

这个是有官方 API 支持的，需要用到 range.surroundContents[16] 方法，表示给选区包裹一层标签

```
btn.onclick = () => {
  const mark = document.createElement('mark');
  lastRange.surroundContents(mark)
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPIChBpPqiapsrHW9X6ndqpwAWArpib5jEM9mncHUxZInHgsbjahPV8CoETA/640?wx_fmt=gif)

但是，这个方法有一个缺陷，当选区有 “断层” 时，比如这种情况，就会直接报错

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICJ7c0LWDfv3Ik0icPtf7ufa37qnaY19GW6sLyMkhGk7xrbE6muRpsPKw/640?wx_fmt=png)

这里可以用另一种方式，能够规避这个问题，和上面替换内容原理类似，不过需要先获取选区内容，获取选区内容可以通过 range.extractContents[17] 方法，该方法返回的是一个 DocumentFragment[18] 对象，将选区内容添加到新节点上，然后插入新内容，具体实现如下

```
btn.onclick = () => {
    const mark = document.createElement('mark');
  // 记录选区内容
  mark.append(lastRange.extractContents())
  lastRange.insertNode(mark) 
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICbVZUffibhqbluickWTBgDI2ibla0m3LDztyiag20UrpoJ7YQhDQUib5tcdw/640?wx_fmt=gif)

以上完整代码可以访问 Section & Range (codepen.io)[19]

五、用两张图总结一下
----------

如果完全掌握这些方法，相信对选区的处理可以游刃有余，记住一点，光标是一种特殊的选区，并且跟元素是否聚焦没什么关系，然后就是各种 API 了，这里用两张图列了一下大致关系

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICefBT7uGibeDPAkgicJ3Al7q4Kb4HpT8nohicM4hJwb2jWxSKHS8dwdM9w/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/HGCZWzWIk2kD8ngJJTx7icGVJTEFnmPICDHArH5lm7wicr5tH6EK3Dpr4BtOAkUUw3mIznu8O6k6SC3QzVWyNtDA/640?wx_fmt=png)

> 以上 API 并不全面，但覆盖了平时开发中了绝大部分场景，如果想了解更全面的属性和方法，可以上 MDN 查看。

### 随着 vue 、react 这些框架的流行，这些原生的 API 可能会很少有人提及，大部分的功能框架都帮我们做了封装，但总有一些功能是不满足的，这就必须要借助 “原生的力量” 了。最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发❤❤❤

### References

`[1]` Section: _https://developer.mozilla.org/en-US/docs/Web/API/Selection_  
`[2]` Range: _https://developer.mozilla.org/en-US/docs/Web/API/Range_  
`[3]` getSelection: _https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getSelection_  
`[4]` setSelectionRange: _https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange_  
`[5]` setRangeText: _https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText_  
`[6]` setSelectionRange & setRangeText (codepen.io): _https://codepen.io/xboxyan/pen/LYOdXpB_  
`[7]` range.setStart: _https://developer.mozilla.org/en-US/docs/Web/API/Range/setStart_  
`[8]` range.setEnd: _https://developer.mozilla.org/en-US/docs/Web/API/Range/setEnd_  
`[9]` selection.addRange: _https://developer.mozilla.org/en-US/docs/Web/API/Selection/addRange_  
`[10]` selection.removeAllRanges: _https://developer.mozilla.org/en-US/docs/Web/API/Selection/removeAllRanges_  
`[11]` range.selectNode: _https://developer.mozilla.org/en-US/docs/Web/API/Range/selectNode_  
`[12]` range.selectNodeContents: _https://developer.mozilla.org/en-US/docs/Web/API/Range/selectNodeContents_  
`[13]` range.insertNode: _https://developer.mozilla.org/en-US/docs/Web/API/Range/insertNode_  
`[14]` deleteContents: _https://developer.mozilla.org/en-US/docs/Web/API/Range/deleteContents_  
`[15]` range.setStartAfter: _https://developer.mozilla.org/en-US/docs/Web/API/Range/setStartAfter_  
`[16]` range.surroundContents: _https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents_  
`[17]` range.extractContents: _https://developer.mozilla.org/en-US/docs/Web/API/Range/extractContents_  
`[18]` DocumentFragment: _https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment_  
`[19]` Section & Range (codepen.io): _https://codepen.io/xboxyan/pen/dyZmQNw_

‍