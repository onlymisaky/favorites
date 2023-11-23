> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/XVF5Xlvj7-jZXF68haaFJw)

本文简介
====

**点赞 + 关注 + 收藏 = 学会了**

在前端领域，如果只是懂 `Vue` 或者 `React` ，未来在职场的竞争力可能会比较弱。

根据我多年在家待业经验来看，前端未来在 `数据可视化` 和 `AI` 这两个领域会比较香，而 `Canvas` 是数据可视化在前端方面的基础技术。

本文就用光的速度将 `canvas` 给入门了。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt959kxhgf5stYRlZMgxVWia3tIkYaf4tqQJPxLy8revgFPtibSdor60FQ/640?wx_fmt=other)01.gif

要入门一个技术，前期最重要是快！所以本文只讲入门内容，能应付简单项目。深入的知识点会在其他文章讲解。

Canvas 是什么？
===========

*   `Canvas` 中文名叫 “画布”，是 `HTML5` 新增的一个标签。
    
*   `Canvas` 允许开发者通过 `JS`在这个标签上绘制各种图案。
    
*   `Canvas` 拥有多种绘制路径、矩形、圆形、字符以及图片的方法。
    
*   `Canvas` 在某些情况下可以 “代替” 图片。
    
*   `Canvas` 可用于动画、游戏、数据可视化、图片编辑器、实时视频处理等领域。
    

Canvas 和 SVG 的区别
================

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); min-width: 85px;">Canvas</th><th data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); min-width: 85px;">SVG</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">用 JS 动态生成元素（一个 HTML 元素）</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">用 XML 描述元素（类似 HTML 元素那样，可用多个元素来描述一个图形）</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">位图（受屏幕分辨率影响）</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">矢量图（不受屏幕分辨率影响）</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">不支持事件</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">支持事件</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">数据发生变化需要重绘</td><td data-style="font-size: 16px; border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; min-width: 85px;">不需要重绘</td></tr></tbody></table>

就上面的描述而言可能有点难懂，你可以打开 `AntV` 旗下的图形编辑引擎做对比。G6[1] 是使用 `canvas` 开发的，X6[2] 是使用 `svg` 开发的。

我的建议是：如果要展示的数据量比较大，比如一条数据就是一个元素节点，那使用 `canvas` 会比较合适；如果用户操作的交互比较多，而且对清晰度有要求（矢量图），那么使用 `svg` 会比较合适。

起步
==

学习前端一定要动手敲代码，然后看效果展示。

起步阶段会用几句代码说明 `canvas` 如何使用，本例会画一条直线。

画条直线
----

1.  在 `HTML` 中创建 `canvas` 元素
    
2.  通过 `js` 获取 `canvas` 标签
    
3.  从 `canvas` 标签中获取到绘图工具
    
4.  通过绘图工具，在 `canvas` 标签上绘制图形
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAticibJGEuCfBn49I1S6T6Yh0fYXEqmExjLtw9cK3eDIHFIXibR5jsm8Ntg/640?wx_fmt=other) 02.png

```
<!-- 1、创建 canvas 元素 --><canvas  id="c"  width="300"  height="200"  style="border: 1px solid #ccc;"></canvas><script>  // 2、获取 canvas 对象  const cnv = document.getElementById('c')  // 3、获取 canvas 上下文环境对象  const cxt = cnv.getContext('2d')  // 4、绘制图形  cxt.moveTo(100, 100) // 起点坐标 (x, y)  cxt.lineTo(200, 100) // 终点坐标 (x, y)  cxt.stroke() // 将起点和终点连接起来</script>复制代码
```

`moveTo` 、 `lineTo` 和 `stroke` 方法暂时可以不用管，它们的作用是绘制图形，这些方法在后面会讲到~

注意点
---

### 1、默认宽高

`canvas` 有 **默认的 宽度 (300px) 和 高度 (150px)**

如果不在 `canvas` 上设置宽高，那 `canvas` 元素的默认宽度是 300px，默认高度是 150px。

### 2、设置 canvas 宽高

`canvas` 元素提供了 `width` 和 `height` 两个属性，可设置它的宽高。

需要注意的是，这两个属性只需传入数值，不需要传入单位（比如 `px` 等）。

```
<canvas width="600" height="400"></canvas>复制代码
```

### 3、不能通过 CSS 设置画布的宽高

使用 `css` 设置 `canvas` 的宽高，会出现 **内容被拉伸** 的后果！！！

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtwscBqmOpDiad9gLsnbjPSmZQickZ6FKXZCQGQZgAULibqgicibCIVMzH7UQ/640?wx_fmt=other)03.png

```
<style>  #c {    width: 400px;    height: 400px;    border: 1px solid #ccc;  }</style><canvas id="c"></canvas><script>  // 1、获取canvas对象  const cnv = document.getElementById('c')  // 2、获取canvas上下文环境对象  const cxt = cnv.getContext('2d')  // 3、绘制图形  cxt.moveTo(100, 100) // 起点  cxt.lineTo(200, 100) // 终点  cxt.stroke() // 将起点和终点连接起来  console.log(cnv.width) // 获取 canvas 的宽度，输出：300  console.log(cnv.height) // 获取 canvas 的高度，输出：150</script>复制代码
```

`canvas` 的默认宽度是 300px，默认高度是 150px。

1.  如果使用 `css` 修改 `canvas` 的宽高（比如本例变成 400px * 400px），那宽度就由 300px 拉伸到 400px，高度由 150px 拉伸到 400px。
    
2.  使用 `js` 获取 `canvas` 的宽高，此时返回的是 `canvas` 的默认值。
    

最后出现的效果如上图所示。

### 4、线条默认宽度和颜色

线条的默认宽度是 `1px` ，默认颜色是黑色。

但由于默认情况下 `canvas` 会将线条的中心点和像素的底部对齐，所以会导致显示效果是 `2px` 和非纯黑色问题。

### 5、IE 兼容性高

暂时只有 `IE 9` 以上才支持 `canvas` 。但好消息是 `IE` 已经有自己的墓碑了。

如需兼容 `IE 7 和 8` ，可以使用 ExplorerCanvas[3] 。但即使是使用了 `ExplorerCanvas` 仍然会有所限制，比如无法使用 `fillText()` 方法等。

基础图形
====

坐标系
---

在绘制基础图形之前，需要先搞清除 `Canvas` 使用的坐标系。

`Canvas` 使用的是 **W3C 坐标系** ，也就是遵循我们屏幕、报纸的阅读习惯，从上往下，从左往右。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAty7I3tpVp08RZLst20YGbe63OYfb7lG6Gze9A49P50TYxYyI3NO7oeA/640?wx_fmt=other)04.jpg

**W3C 坐标系** 和 **数学直角坐标系** 的 `X轴` 是一样的，只是 `Y轴` 的反向相反。

**W3C 坐标系** 的 `Y轴` 正方向向下。

直线
--

### 一条直线

最简单的起步方式是画一条直线。这里所说的 “直线” 是几何学里的 “线段” 的意思。

需要用到这 3 个方法：

1.  `moveTo(x1, y1)`：起点坐标 (x, y)
    
2.  `lineTo(x2, y2)`：下一个点的坐标 (x, y)
    
3.  `stroke()`：将所有坐标用一条线连起来
    

起步阶段可以先这样理解。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt2PhPIVJic8DFgXzYGhGt2TdXNJ9zUicNvMYyc2ls80ahRmw228qKfP0g/640?wx_fmt=other)05.png

```
<canvas id="c" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 绘制直线  cxt.moveTo(50, 100) // 起点坐标  cxt.lineTo(200, 50) // 下一个点的坐标  cxt.stroke() // 将上面的坐标用一条线连接起来</script>复制代码
```

上面的代码所呈现的效果，可以看下图解释（手不太聪明，画得不是很标准，希望能看懂）

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtibelqAUMHPZnxRNhqq4oDO4kWUBFV9Lqu1iaiawT45p7niatCWDHdVBX3g/640?wx_fmt=other)06.jpg

### 多条直线

如需画多条直线，可以用会上面那几个方法。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtu9iavIJb4AjGeUfBaGoFsUBmhfbboFUsFq9eCaZaNVyuW90R93yElUg/640?wx_fmt=other)07.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(20, 100)  cxt.lineTo(200, 100)  cxt.stroke()  cxt.moveTo(20, 120.5)  cxt.lineTo(200, 120.5)  cxt.stroke()</script>复制代码
```

仔细观察一下，为什么两条线的粗细不一样的？

明明使用的方法都是一样的，只是第二条直线的 `Y轴` 的值是有小数点。

答：**默认情况下 `canvas` 会将线条的中心点和像素的底部对齐，所以会导致显示效果是 `2px` 和非纯黑色问题。**

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtcpNiabian3ibEJiaTKpnoTeQ3vG2qcricZnWU6cRN8W9AhMos1c9TIyzkXA/640?wx_fmt=other)08.jpg

上图每个格子代表 `1px`。

**线的中心点会和画布像素点的底部对齐**，所以会线中间是黑色的，但由于一个像素就不能再切割了，所以会有半个像素被染色，就变成了浅灰色。

所以如果你设置的 `Y轴` 值是一个整数，就会出现上面那种情况。

### 设置样式

*   `lineWidth`：线的粗细
    
*   `strokeStyle`：线的颜色
    
*   `lineCap`：线帽：默认: `butt`; 圆形: `round`; 方形: `square`
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtpf76Oe6kbQibnicVoVFXWibqoVIQzcYpa36ibjoJhfQU63Xem0D3WtX6nQ/640?wx_fmt=other)09.png

```
<canvas id="c" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 绘制直线  cxt.moveTo(50, 50)  cxt.lineTo(200, 50)  // 修改直线的宽度  cxt.lineWidth = 20  // 修改直线的颜色  cxt.strokeStyle = 'pink'  // 修改直线两端样式  cxt.lineCap = 'round' // 默认: butt; 圆形: round; 方形: square  cxt.stroke()</script>复制代码
```

### 新开路径

开辟新路径的方法：

*   `beginPath()`
    

在绘制多条线段的同时，还要设置线段样式，通常需要开辟新路径。

要不然样式之间会相互污染。

比如这样

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtHxqgHFbOBUsiaYkmfHJsONkiaLrHNlm6eOmYMd9duIuDcrqEkTjcAX5Q/640?wx_fmt=other)10.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 第一条线  cxt.moveTo(20, 100)  cxt.lineTo(200, 100)  cxt.lineWidth = 10  cxt.strokeStyle = 'pink'  cxt.stroke()  // 第二条线  cxt.moveTo(20, 120.5)  cxt.lineTo(200, 120.5)  cxt.stroke()</script>复制代码
```

如果不想相互污染，需要做 2 件事：

1.  使用 `beginPath()` 方法，重新开一个路径
    
2.  设置新线段的样式（必须项）
    

如果上面 2 步却了其中 1 步都会有影响。

#### 只使用 `beginPath()`

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtpUE3A2LyFr9j4TCSvAIHXfEPVVqtFzOT5KFLf3xpdlicUicxtHbic1FRQ/640?wx_fmt=other)11.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 第一条线  cxt.moveTo(20, 100)  cxt.lineTo(200, 100)  cxt.lineWidth = 10  cxt.strokeStyle = 'pink'  cxt.stroke()  // 第二条线  cxt.beginPath() // 重新开启一个路径  cxt.moveTo(20, 120.5)  cxt.lineTo(200, 120.5)  cxt.stroke()</script>复制代码
```

第一条线的样式会影响之后的线。

但如果使用了 `beginPath()` ，后面的线段不会影响前面的线段。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt85R0y2gmFFAcghslOxMhKiasTnCCMq3zibd2iaCq7M89EAKgUlYWEAbyQ/640?wx_fmt=other)12.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 第一条线  cxt.moveTo(20, 100)  cxt.lineTo(200, 100)  cxt.stroke()  // 第二条线  cxt.beginPath() // 重新开启一个路径  cxt.moveTo(20, 120.5)  cxt.lineTo(200, 120.5)  cxt.lineWidth = 4  cxt.strokeStyle = 'red'  cxt.stroke()</script>复制代码
```

#### 设置新线段的样式，没使用 `beginPath()` 的情况

这个情况会反过来，后面的线能影响前面的线。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtk9orwIdJmeaQ7LhEsoianYL4qXzUccedm64DK4ycqOzAcn6tLqNhpPg/640?wx_fmt=other)13.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 第一条线  cxt.moveTo(20, 100)  cxt.lineTo(200, 100)  cxt.lineWidth = 10  cxt.strokeStyle = 'pink'  cxt.stroke()  // 第二条线  cxt.moveTo(20, 120.5)  cxt.lineTo(200, 120.5)  cxt.lineWidth = 4  cxt.strokeStyle = 'red'  cxt.stroke()</script>复制代码
```

#### 正确的做法

在设置 `beginPath()` 的同时，也各自设置样式。这样就能做到相互不影响了。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtuzzt2qnuPmpibicFr2mGxa5VjPOQqlllfwsZTMc94wLFqKB7JSDuZftA/640?wx_fmt=other)14.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(20, 100)  cxt.lineTo(200, 100)  cxt.lineWidth = 10  cxt.strokeStyle = 'pink'  cxt.stroke()  cxt.beginPath() // 重新开启一个路径  cxt.moveTo(20, 120.5)  cxt.lineTo(200, 120.5)  cxt.lineWidth = 4  cxt.strokeStyle = 'red'  cxt.stroke()</script>复制代码
```

折线
--

和 **直线** 差不多，都是使用 `moveTo()` 、`lineTo()` 和 `stroke()` 方法可以绘制折线。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtE0hMB5Wn2KbCFjRlQkfRNnCE4BwObf7CB0huct3EMRppo8uJfcU94g/640?wx_fmt=other)15.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(50, 200)  cxt.lineTo(100, 50)  cxt.lineTo(200, 200)  cxt.lineTo(250, 50)  cxt.stroke()</script>复制代码
```

画这种折线，最好在草稿纸上画一个坐标系，自己计算并描绘一下每个点大概在什么什么位置，最后在 `canvas` 中看看效果。

矩形
--

根据前面的基础，我们可以 **使用线段来描绘矩形**，但 `canvas` 也提供了 `rect()` 等方法可以直接生成矩形。

### 使用线段描绘矩形

可以使用前面画线段的方法来绘制矩形

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt2eo3ov4ZgCfOZ7TUOdfGNkUKWqdPlLvMpdJibbx04VoY02PAjA0ciciaQ/640?wx_fmt=other)16.png

```
canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script> const cnv = document.getElementById('c') const cxt = cnv.getContext('2d') // 绘制矩形 cxt.moveTo(50, 50) cxt.lineTo(200, 50) cxt.lineTo(200, 120) cxt.lineTo(50, 120) cxt.lineTo(50, 50) // 需要闭合，又或者使用 closePath() 方法进行闭合，推荐使用 closePath() cxt.stroke()</script>复制代码
```

上面的代码几个点分别对应下图。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtOGicFX9wwib8L6D5IjB0f8ltExmHtgCkt6TY7kbK8Dgtd93VSuCSticZQ/640?wx_fmt=other)17.jpg

### 使用 `strokeRect()` 描边矩形

*   `strokeStyle`：设置描边的属性（颜色、渐变、图案）
    
*   `strokeRect(x, y, width, height)`：描边矩形（x 和 y 是矩形左上角起点；width 和 height 是矩形的宽高）
    
*   `strokeStyle` 必须写在 `strokeRect()` 前面，不然样式不生效。
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtMvJZhbUczNEsWc6Bzxiaa3UAppJbOSWokXlhsZlZndyP1BaHkdAnqicQ/640?wx_fmt=other)18.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // strokeStyle 属性  // strokeRect(x, y, width, height) 方法  cxt.strokeStyle = 'pink'  cxt.strokeRect(50, 50, 200, 100)</script>复制代码
```

上面的代码可以这样理解

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtW0ADkCichibQ3jOJXvDOlGCrQm3HRIad18ZiahKYGlxoyNPqLLjxyBYdA/640?wx_fmt=other)19.jpg

### 使用 `fillRect()` 填充矩形

`fillRect()` 和 `strokeRect()` 方法差不多，但 `fillRect()` 的作用是填充。

**需要注意的是，`fillStyle` 必须写在 `fillRect()` 之前，不然样式不生效。**

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt7iaiaqDLK3aSm0WRcOibcJedd388QNYTUGZp09kg9QryibjwoWRZ6ibxdSQ/640?wx_fmt=other)20.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // fillStyle 属性  // fillRect(x, y, width, height) 方法  cxt.fillStyle = 'pink'  cxt.fillRect(50, 50, 200, 100) // fillRect(x, y, width, height)</script>复制代码
```

### 同时使用 `strokeRect()` 和 `fillRect()`

同时使用 `strokeRect()` 和 `fillRect()` 会产生描边和填充的效果

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtBN4nXC2JaVNUicHnOVJe3RgELFleib823DAVDsicKjETGgmtXHywrQPKA/640?wx_fmt=other)21.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.strokeStyle = 'red'  cxt.strokeRect(50, 50, 200, 100) // strokeRect(x, y, width, height)  cxt.fillStyle = 'yellow'  cxt.fillRect(50, 50, 200, 100) // fillRect(x, y, width, height)</script>复制代码
```

### 使用 `rect()` 生成矩形

`rect()` 和 `fillRect() 、strokeRect()` 的用法差不多，唯一的区别是：

**`strokeRect()` 和 `fillRect()` 这两个方法调用后会立即绘制；`rect()` 方法被调用后，不会立刻绘制矩形，而是需要调用 `stroke()` 或 `fill()` 辅助渲染。**

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt5Vb9C6lz4ncg337ib4JGj74ZN05vOwDf1Dkck565s5SA87tdd6UMecA/640?wx_fmt=other)22.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.strokeStyle = 'red'  cxt.fillStyle = 'pink'  cxt.rect(50, 50, 200, 100) // rect(x, y, width, height)  cxt.stroke()  cxt.fill()</script>复制代码
```

**等价公式：**

```
cxt.strokeStyle = 'red',cxt.rect(50, 50, 200, 100)cxt.stroke()// 等价于cxt.strokeStyle = 'red'cxt.strokerect(50, 50, 200, 100)// -----------------------------cxt.fillStyle = 'hotpink'cxt.rect(50, 50, 200, 100)cxt.fill()// 等价于cxt.fillStyle = 'yellowgreen'cxt.fillRect(50, 50, 200, 100)复制代码
```

### 使用 `clearRect()` 清空矩形

使用 `clearRect()` 方法可以清空指定区域。

```
clearRect(x, y, width, height)
复制代码
```

其语法和创建 `cxt.rect()` 差不多。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt0dlf3rV1AA4jXrYM1NYzujnKNP63ibNZR4KGTIblW5EXn2CwbE3rdmw/640?wx_fmt=other)23.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.fillStyle = 'pink' // 设置填充颜色  cxt.fillRect(50, 50, 200, 200) // 填充矩形  cxt.clearRect(60, 60, 180, 90) // 清空矩形</script>复制代码
```

### 清空画布

`canvas` 画布元素是矩形，所以可以通过下面的代码把整个画布清空掉。

```
// 省略部分代码cxt.clearRect(0, 0, cnv.width, cnv.height)复制代码
```

要清空的区域：从画布左上角开始，直到画布的宽和画布的高为止。

多边形
---

`Canvas` 要画多边形，需要使用 `moveTo()` 、 `lineTo()` 和 `closePath()` 。

### 三角形

虽然三角形是常见图形，但 `canvas` 并没有提供类似 `rect()` 的方法来绘制三角形。

需要确定三角形 3 个点的坐标位置，然后使用 `stroke()` 或者 `fill()` 方法生成三角形。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtNc6ibmMr0yIEF3ribt9ocVCibxafsmAr7pPy0bZaEeiaVhzHgMRnFyR2Og/640?wx_fmt=other)24.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(50, 50)  cxt.lineTo(200, 50)  cxt.lineTo(200, 200)  // 注意点：如果使用 lineTo 闭合图形，是不能很好闭合拐角位的。  cxt.lineTo(50, 50) // 闭合  cxt.stroke()</script>复制代码
```

注意，默认情况下不会自动从最后一个点连接到起点。最后一步需要设置一下 `cxt.lineTo(50, 50)` ，让它与 `cxt.moveTo(50, 50)` 一样。这样可以让路径回到起点，形成一个闭合效果。

但这样做其实是有点问题的，而且也比较麻烦，要记住起始点坐标。

上面的闭合操作，如果遇到设置了 `lineWidth` 或者 `lineJoin` 就会有问题，比如：

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtuyMFNn6eeBFia3oLW8vr2caw6mlIEN0yKeydVT3Wz4nkSvxfAed0jTg/640?wx_fmt=other)25.png

```
// 省略部分代码cxt.lineWidth = 20复制代码
```

当线段变粗后，起始点和结束点的链接处，拐角就出现 “不正常” 现象。

如果需要真正闭合，可以使用 `closePath()` 方法。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAttzqVg4QqAEVfZC2wFaOJj8iaVYqK7ibcWu4ia6oCvOm5dXg7VqjcGXH3Q/640?wx_fmt=other)26.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(50, 50)  cxt.lineTo(200, 50)  cxt.lineTo(200, 200)  // 手动闭合  cxt.closePath()  cxt.lineJoin = 'miter' // 线条连接的样式。miter: 默认; bevel: 斜面; round: 圆角  cxt.lineWidth = 20  cxt.stroke()</script>复制代码
```

使用 `cxt.closePath()` 可以自动将终点和起始点连接起来，此时看上去就正常多了。

### 菱形

有一组邻边相等的平行四边形是菱形

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt7dXY13BuOrp5Pic9b6LEzVMMBUqtYhDP2s98Rb4fNVDMwRrv47Oht6w/640?wx_fmt=other)27.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(150, 50)  cxt.lineTo(250, 100)  cxt.lineTo(150, 150)  cxt.lineTo(50, 100)  cxt.closePath()  cxt.stroke()</script>复制代码
```

要绘制直线类型的图形，在草稿纸上标记出起始点和每个拐角的点，然后再连线即可。相对曲线图形来说，直线图形是比较容易的。

圆形
--

绘制圆形的方法是 `arc()`。

**语法：**

```
arc(x, y, r, sAngle, eAngle，counterclockwise)
复制代码
```

*   `x` 和 `y`: 圆心坐标
    
*   `r`: 半径
    
*   `sAngle`: 开始角度
    
*   `eAngle`: 结束角度
    
*   `counterclockwise`: 绘制方向（true: 逆时针; false: 顺时针），默认 false
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtTEKricz6ec6HqfqMXhdiboB0cvQhLKSBahWicuhMAWJrIOnpGdpSibnibjA/640?wx_fmt=other)28.jpg

开始角度和结束角度，都是以**弧度**为单位。例如 180° 就写成 `Math.PI` ，360° 写成 `Math.PI * 2` ，以此类推。

在实际开发中，为了让自己或者别的开发者更容易看懂**弧度的数值**，1° 应该写成 `Math.PI / 180`。

*   100°: `100 * Math.PI / 180`
    
*   110°: `110 * Math.PI / 180`
    
*   241°: `241 * Math.PI / 180`
    

**注意：绘制圆形之前，必须先调用 `beginPath()` 方法！！！在绘制完成之后，还需要调用 `closePath()` 方法！！！**

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtY3lY922XktpuSKJo1bicYB9PJDwb53EO7I2cCiaAQtcYHnNJ1efFNIhA/640?wx_fmt=other)29.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.beginPath()  cxt.arc(150, 150, 80, 0, 360 * Math.PI / 180)  cxt.closePath()  cxt.stroke()</script>复制代码
```

半圆
--

如果使用 `arc()` 方法画圆时，没做到刚好绕完一周（360°）就直接闭合路径，就会出现半圆的状态。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtAlxibzAwEfZESzhUa8KFNILPtibA4Wjer2iaxIDyyxI0pLrYpEgLoU6ibw/640?wx_fmt=other)30.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.beginPath()  cxt.arc(150, 150, 100, 0, 180 * Math.PI / 180) // 顺时针  cxt.closePath()  cxt.stroke()</script>复制代码
```

上面的代码中，`cxt.arc` 最后一个参数没传，默认是 `false` ，所以是顺时针绘制。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtLBzAyoRDGoXVzkntfNIqPy3RiatbmkSdiaTJL5PmNQZPXSXQbxFqHzMw/640?wx_fmt=other)31.jpg

如果希望半圆的弧面在上方，可以将 `cxt.arc` 最后一个参数设置成 `true`

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtOd74O4fr2wCUdZRPufA9mLny1Jc3GUdteooxDZHPHpbUEMjugdBiawA/640?wx_fmt=other)32.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.beginPath()  cxt.arc(150, 150, 100, 0, 180 * Math.PI / 180, true)  cxt.closePath()  cxt.stroke()</script>复制代码
```

弧线
--

使用 `arc()` 方法画半圆时，如果最后不调用 `closePath()` 方法，就不会出现闭合路径。也就是说，那是一条弧线。

在 `canvas` 中，画弧线有 2 中方法：`arc()` 和 `arcTo()` 。

### arc() 画弧线

如果想画一条 `0° ~ 30°` 的弧线，可以这样写

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt8lH5P4yluwtpDg9MAubRDu2Jic8E5kc8r6oBTDibq6MOzbq8OfJl6STg/640?wx_fmt=other)33.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.beginPath()  cxt.arc(150, 150, 100, 0, 30 * Math.PI / 180)  cxt.stroke()</script>复制代码
```

原理如下图所示，红线代表画出来的那条弧线。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtiavQpiaM57H6jYeFocy3AKfAuKWVEFlgqIltbhia9T1lE5ic6YMiczKwQqg/640?wx_fmt=other)34.jpg

### arcTo() 画弧线

`arcTo()` 的使用方法会更加复杂，如果初学看不太懂的话可以先跳过，看完后面的再回来补补。

**语法：**

```
arcTo(cx, cy, x2, y2, radius)
复制代码
```

*   `cx`: 两切线交点的横坐标
    
*   `cy`: 两切线交点的纵坐标
    
*   `x2`: 结束点的横坐标
    
*   `y2`: 结束点的纵坐标
    
*   `radius`: 半径
    

其中，`(cx, cy)` 也叫控制点，`(x2, y2)` 也叫结束点。

是不是有点奇怪，为什么没有 `x1` 和 `y1` ？

`(x1, y1)` 是开始点，通常是由 `moveTo()` 或者 `lineTo()` 提供。

`arcTo()` 方法利用 **开始点、控制点和结束点形成的夹角，绘制一段与夹角的两边相切并且半径为 `radius` 的圆弧**。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtfuc2VX9YyTaPUTVR8pSpnAz3zFvRUlhC2wMGsbS7mNU8lXEJPGZv2g/640?wx_fmt=other)35.jpg

举个例子

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtg7icY6ebcXASsPcj9m11gqlwU4Lgb2iayb8GDFAxZwvRhlu6VdCmJ62w/640?wx_fmt=other)36.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(40, 40)  cxt.arcTo(120, 40, 120, 120, 80)  cxt.stroke()</script>复制代码
```

基础样式
====

前面学完基础图形，接下来可以开始了解一下如何设置元素的基础样式。

描边 stroke()
-----------

前面的案例中，其实已经知道使用 `stroke()` 方法进行描边了。这里就不再多讲这个方法。

线条宽度 lineWidth
--------------

`lineWidth` 默认值是 `1` ，默认单位是 `px`。

**语法：**

```
lineWidth = 线宽
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtBicLAciadCm9Cia5qVx6BxicukyHqglQiaxNkRibl0wHxKVe7MRibm6ibPlGww/640?wx_fmt=other)37.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 线宽 10  cxt.beginPath()  cxt.moveTo(50, 50)  cxt.lineTo(250, 50)  cxt.lineWidth = 10 // 设置线宽  cxt.stroke()  // 线宽 20  cxt.beginPath()  cxt.moveTo(50, 150)  cxt.lineTo(250, 150)  cxt.lineWidth = 20 // 设置线宽  cxt.stroke()  // 线宽 30  cxt.beginPath()  cxt.moveTo(50, 250)  cxt.lineTo(250, 250)  cxt.lineWidth = 30 // 设置线宽  cxt.stroke()</script>复制代码
```

线条颜色 strokeStyle
----------------

使用 `strokeStyle` 可以设置线条颜色

**语法:**

```
strokeStyle = 颜色值
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtkAQF4rghwWc1Qly9cXZobETmD6FHbqvmulksYo2h3w3uZjibHSNMWPQ/640?wx_fmt=other)38.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.moveTo(50, 50)  cxt.lineTo(250, 50)  cxt.lineWidth = 20  cxt.strokeStyle = 'pink' // 设置颜色  cxt.stroke()</script>复制代码
```

为了展示方便，我将 `lineWidth` 设为 20。

线帽 lineCap
----------

线帽指的是线段的开始和结尾处的样式，使用 `lineCap` 可以设置

**语法：**

```
lineCap = '属性值'复制代码
```

属性值包括：

*   `butt`: 默认值，无线帽
    
*   `square`: 方形线帽
    
*   `round`: 圆形线帽
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtMAfrticHx2Tsu1wRnU6K4icjKu06KJhYbTgXP8fCNtdPCzWspOwZjfgQ/640?wx_fmt=other) 39.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 设置线宽，方便演示  cxt.lineWidth = 16  // 默认线帽 butt  cxt.beginPath()  cxt.moveTo(50, 60)  cxt.lineTo(250, 60)  cxt.stroke()  // 方形线帽 square  cxt.beginPath()  cxt.lineCap = 'square'  cxt.moveTo(50, 150)  cxt.lineTo(250, 150)  cxt.stroke()  // 圆形线帽 round  cxt.beginPath()  cxt.lineCap = 'round'  cxt.moveTo(50, 250)  cxt.lineTo(250, 250)  cxt.stroke()</script>复制代码
```

使用 `square` 和 `round` 的话，会使线条变得稍微长一点点，这是给线条增加线帽的部分，这个长度在日常开发中需要注意。

**线帽只对线条的开始和结尾处产生作用，对拐角不会产生任何作用。**

拐角样式 lineJoin
-------------

如果需要设置拐角样式，可以使用 `lineJoin` 。

**语法：**

```
lineJoin = '属性值'复制代码
```

属性值包括：

*   `miter`: 默认值，尖角
    
*   `round`: 圆角
    
*   `bevel`: 斜角
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtiavqfEpz3GkI3labMKxLn1uJrrsbKyt6xfENWzzuwpKcqeoVVgsRiagw/640?wx_fmt=other) 40.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')    cxt.lineWidth = 20  // 默认，尖角  cxt.moveTo(50, 40)  cxt.lineTo(200, 40)  cxt.lineTo(200, 90)  cxt.stroke()  // 斜角 bevel  cxt.beginPath()  cxt.moveTo(50, 140)  cxt.lineTo(200, 140)  cxt.lineTo(200, 190)  cxt.lineJoin = 'bevel'  cxt.stroke()  // 圆角 round  cxt.beginPath()  cxt.moveTo(50, 240)  cxt.lineTo(200, 240)  cxt.lineTo(200, 290)  cxt.lineJoin = 'round'  cxt.stroke()</script>复制代码
```

虚线 setLineDash()
----------------

使用 `setLineDash()` 方法可以将描边设置成虚线。

**语法：**

```
setLineDash([])
复制代码
```

需要传入一个数组，且元素是数值型。

虚线分 3 种情况

1.  只传 1 个值
    
2.  有 2 个值
    
3.  有 3 个以上的值
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt80DpiclO7NxfGmazt3jd6jKd1H8iao4wTLC0G0wc4dGZickqkZOVSjgMw/640?wx_fmt=other) 41.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.lineWidth = 20  cxt.strokeStyle = 'pink'  cxt.moveTo(50, 50)  cxt.lineTo(200, 50)  cxt.setLineDash([10]) // 只传1个参数，实线与空白都是 10px  cxt.stroke()  cxt.beginPath()  cxt.moveTo(50, 100)  cxt.lineTo(200, 100)  cxt.setLineDash([10, 20]) // 2个参数，此时，实线是 10px, 空白 20px  cxt.stroke()  cxt.beginPath()  cxt.moveTo(50, 150)  cxt.lineTo(200, 150)  cxt.setLineDash([10, 20, 5]) // 传3个以上的参数，此例：10px实线，20px空白，5px实线，10px空白，20px实线，5px空白 ……  cxt.stroke()</script>复制代码
```

此外，还可以始终 `cxt.getLineDash()` 获取虚线不重复的距离；

用 `cxt.lineDashOffset` 设置虚线的偏移位。

填充
--

使用 `fill()` 可以填充图形，根据前面的例子应该掌握了如何使用 `fill()`

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtB0iav4SCExRWlwGxDbfH9HdENLMv6n2dnIXqkSew9R1WicThQWRLXaMA/640?wx_fmt=other)42.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.fillStyle = 'pink'  cxt.rect(50, 50, 200, 100)  cxt.fill()</script>复制代码
```

可以使用 `fillStyle` 设置填充颜色，默认是黑色。

非零环绕填充
------

在使用 `fill()` 方法填充时，需要注意一个规则：**非零环绕填充**。

在使用 `moveTo` 和 `lineTo` 描述图形时，如果是按顺时针绘制，计数器会加 1；如果是逆时针，计数器会减 1。

当图形所处的位置，计数器的结果为 0 时，它就不会被填充。

这样说有点复杂，先看看例子

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtw0RfOnic51CdPVuJqaRGxJicNl2PEKgthaCILT1icejKQzeL0qKlZntOQ/640?wx_fmt=other)43.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 外层矩形  cxt.moveTo(50, 50)  cxt.lineTo(250, 50)  cxt.lineTo(250, 250)  cxt.lineTo(50, 250)  cxt.closePath()  // 内层矩形  cxt.moveTo(200, 100)  cxt.lineTo(100, 100)  cxt.lineTo(100, 200)  cxt.lineTo(200, 200)  cxt.closePath()  cxt.fill()</script>复制代码
```

请看看上面的代码，我画了 2 个矩形，它们都没有用 `beginPath()` 方法开辟新路径。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtu4s65vmHfGRSh4peQ1PGLR2LaN9Yzufw561ku0qAYHgEnjRrdWV04A/640?wx_fmt=other)44.png

内层矩形是逆时针绘制的，所以内层的值是 `-1` ，它又经过外层矩形，而外层矩形是顺时针绘制，所以经过外层时值 `+1`，最终内层的值为 `0` ，所以不会被填充。

文本
==

`Canvas` 提供了一些操作文本的方法。

为了方便演示，我们先了解一下在 `Canvas` 中如何给本文设置样式。

样式 font
-------

和 `CSS` 设置 `font` 差不多，`Canvas` 也可以通过 `font` 设置样式。

**语法：**

```
cxt.font = 'font-style font-variant font-weight font-size/line-height font-family'复制代码
```

如果需要设置字号 `font-size`，需要同事设置 `font-family`。

```
cxt.font = '30px 宋体'复制代码
```

描边 strokeText()
---------------

使用 `strokeText()` 方法进行文本描边

**语法：**

```
strokeText(text, x, y, maxWidth)
复制代码
```

*   `text`: 字符串，要绘制的内容
    
*   `x`: 横坐标，文本**左边**要对齐的坐标（默认左对齐）
    
*   `y`: 纵坐标，文本**底边**要对齐的坐标
    
*   `maxWidth`: 可选参数，表示文本渲染的最大宽度（px），如果文本超出 `maxWidth` 设置的值，文本会被压缩。
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAttRa8mgJFIicUa4Bq8WkrRKu9icRWFGYqUicP1MUw9RE8dLWmRfOmcPESw/640?wx_fmt=other)45.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.font = '60px Arial' // 将字号设置成 60px，方便观察  cxt.strokeText('雷猴', 30, 90)</script>复制代码
```

设置描边颜色 strokeStyle
------------------

使用 `strokeStyle` 设置描边颜色。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtiaqw0rlmkRxkia5wyFKkAzib649qMBdYYqeW23FUPF6EhFhgYc0IMtADw/640?wx_fmt=other)46.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.font = '60px Arial' // 将字号设置成 60px，方便观察  cxt.strokeStyle = 'pink' // 设置文本描边颜色  cxt.strokeText('雷猴', 30, 90)</script>复制代码
```

填充 fillText
-----------

使用 `fillText()` 可填充文本。

语法和 `strokeText()` 一样。

```
fillText(text, x, y, maxWidth)
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtvUxd69xA1Jg5nNs63dkdXWXOtV6k4FOMtPa46L7DCGVH6LJW4xO5gA/640?wx_fmt=other)47.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.font = '60px Arial'  cxt.fillText('雷猴', 30, 90)</script>复制代码
```

设置填充颜色 fillStyle
----------------

使用 `fillStyle` 可以设置文本填充颜色。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtFrtpLqxic9Rp8Q2Lm2QFysTibiccD1UoehEbj7j4nrutibyV1F1GLT5vpg/640?wx_fmt=other)48.png

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  cxt.font = '60px Arial'  cxt.fillStyle = 'pink'  cxt.fillText('雷猴', 30, 90)</script>复制代码
```

获取文本长度 measureText()
--------------------

`measureText().width` 方法可以获取文本的长度，单位是 `px` 。

```
<canvas id="c" width="300" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  let text = '雷猴'  cxt.font = 'bold 40px Arial'  cxt.fillText(text, 40, 80)  console.log(cxt.measureText(text).width) // 80</script>复制代码
```

水平对齐方式 textAlign
----------------

使用 `textAlign` 属性可以设置文字的水平对齐方式，一共有 5 个值可选

*   `start`: 默认。在指定位置的横坐标开始。
    
*   `end`: 在指定坐标的横坐标结束。
    
*   `left`: 左对齐。
    
*   `right`: 右对齐。
    
*   `center`: 居中对齐。
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt0VbNA4twbuRIvDWicjC8Qov5Uz8xDAsKRkl6rhAibpTBjd8gemmj8GPQ/640?wx_fmt=other)49.png

红线是辅助参考线。

```
<canvas id="c" width="400" height="400" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 竖向的辅助线（参考线，在画布中间）  cxt.moveTo(200, 0)  cxt.lineTo(200, 400)  cxt.strokeStyle = 'red'  cxt.stroke()  cxt.font = '30px Arial'  // 横坐标开始位对齐  cxt.textAlign = 'start' // 默认值,  cxt.fillText('雷猴 start', 200, 40)  // 横坐标结束位对齐  cxt.textAlign = 'end' // 结束对齐  cxt.fillText('雷猴 end', 200, 100)  // 左对齐  cxt.textAlign = 'left' // 左对齐  cxt.fillText('雷猴 left', 200, 160)  // 右对齐  cxt.textAlign = 'right' // 右对齐  cxt.fillText('雷猴 right', 200, 220)  // 居中对齐  cxt.textAlign = 'center' // 右对齐  cxt.fillText('雷猴 center', 200, 280)</script>复制代码
```

从上面的例子看，`start` 和 `left` 的效果好像是一样的，`end` 和 `right` 也好像是一样的。

在大多数情况下，它们的确一样。但在某些国家或者某些场合，阅读文字的习惯是 **从右往左** 时，`start` 就和 `right` 一样了，`end` 和 `left` 也一样。这是需要注意的地方。

垂直对齐方式 textBaseline
-------------------

使用 `textBaseline` 属性可以设置文字的垂直对齐方式。

在使用 `textBaseline` 前，需要自行了解 `css` 的文本基线。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtWrialtpUSqM0P3icg3norF68KwacE95wiaCzjZzsybtV51EqSibia8fUrww/640?wx_fmt=other)50.png

用一张网图解释一下基线

**`textBaseline` 可选属性：**

*   `alphabetic`: 默认。文本基线是普通的字母基线。
    
*   `top`: 文本基线是 `em` 方框的顶端。
    
*   `bottom`: 文本基线是 `em` 方框的底端。
    
*   `middle`: 文本基线是 `em` 方框的正中。
    
*   `hanging`: 文本基线是悬挂基线。
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtJo5EuicgFIqm1yuWfm6qT1kFQv1k8ngruibxY1GG1hjvY8ThVJKz50ZA/640?wx_fmt=other)51.png

红线是辅助参考线。

```
<canvas id="c" width="800" height="300" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 横向的辅助线（参考线，在画布中间）  cxt.moveTo(0, 150)  cxt.lineTo(800, 150)  cxt.strokeStyle = 'red'  cxt.stroke()  cxt.font = '20px Arial'  // 默认 alphabetic  cxt.textBaseline = 'alphabetic'  cxt.fillText('雷猴 alphabetic', 10, 150)  // 默认 top  cxt.textBaseline = 'top'  cxt.fillText('雷猴 top', 200, 150)  // 默认 bottom  cxt.textBaseline = 'bottom'  cxt.fillText('雷猴 bottom', 320, 150)  // 默认 middle  cxt.textBaseline = 'middle'  cxt.fillText('雷猴 middle', 480, 150)  // 默认 hanging  cxt.textBaseline = 'hanging'  cxt.fillText('雷猴 hanging', 640, 150)</script>复制代码
```

**注意：在绘制文字的时候，默认是以文字的左下角作为参考点进行绘制**

图片
==

在 `Canvas` 中可以使用 `drawImage()` 方法绘制图片。

渲染图片
----

渲染图片的方式有 2 中，一种是**在 JS 里加载图片再渲染**，另一种是**把 DOM 里的图片拿到 `canvas` 里渲染**。

**渲染的语法：**

```
drawImage(image, dx, dy)
复制代码
```

*   `image`: 要渲染的图片对象。
    
*   `dx`: 图片左上角的横坐标位置。
    
*   `dy`: 图片左上角的纵坐标位置。
    

### JS 版

在 `JS` 里加载图片并渲染，有以下几个步骤：

1.  创建 `Image` 对象
    
2.  引入图片
    
3.  等待图片加载完成
    
4.  使用 `drawImage()` 方法渲染图片
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtWBuwBQwc3MHrnbJuncpbeic5z4nic8InEia9HX8nxWnRe0WQSHed8Qiang/640?wx_fmt=other) 52.png

```
<canvas id="c" width="500" height="500" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  // 1 创建 Image 对象  const image = new Image()  // 2 引入图片  image.src = './images/dog.jpg'  // 3 等待图片加载完成  image.onload = () => {    // 4 使用 drawImage() 方法渲染图片    cxt.drawImage(image, 30, 30)  }</script>复制代码
```

### DOM 版

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt5uOMYEnibdcl3A6153H3NYhkwms5JPmvk5nebpWCYhgBuzILyNw5Vrg/640?wx_fmt=other)53.png

```
<style>  #dogImg {    display: none;  }</style><img src="./images/dog.jpg" id="dogImg"/><canvas id="c" width="500" height="500" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  const image = document.getElementById('dogImg')  cxt.drawImage(image, 70, 70)</script>复制代码
```

因为图片是从 `DOM` 里获取到的，所以一般来说，只要在 `window.onload` 这个生命周期内使用 `drawImage` 都可以正常渲染图片。

本例使用了 `css` 的方式，把图片的 `display` 设置成 `none` 。因为我不想被 `<img>` 影响到本例讲解。

实际开发过程中按照实际情况设置即可。

设置图片宽高
------

前面的例子都是直接加载图片，图片默认的宽高是多少就加载多少。

如果需要指定图片宽高，可以在前面的基础上再添加两个参数：

```
drawImage(image, dx, dy, dw, dh)
复制代码
```

`image、 dx、 dy` 的用法和前面一样。

`dw` 用来定义图片的宽度，`dh` 定义图片的高度。

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAtxIAmb44PpqYia0BCOLc3D343YVcAB1JkmCSSGf9RQD2hwfUFicvzvfIA/640?wx_fmt=other)54.png

```
<canvas id="c" width="500" height="500" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  const image = new Image()  image.src = './images/dog.jpg'  image.onload = () => {    cxt.drawImage(image, 30, 30, 100, 100)  }</script>复制代码
```

我把图片的尺寸设为 100px * 100px，图片看上去比之前就小了很多。

截取图片
----

截图图片同样使用`drawImage()` 方法，只不过传入的参数数量比之前都多，而且顺序也有点不一样了。

```
drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
复制代码
```

以上参数缺一不可

*   `image`: 图片对象
    
*   `sx`: 开始截取的横坐标
    
*   `sy`: 开始截取的纵坐标
    
*   `sw`: 截取的宽度
    
*   `sh`: 截取的高度
    
*   `dx`: 图片左上角的横坐标位置
    
*   `dy`: 图片左上角的纵坐标位置
    
*   `dw`: 图片宽度
    
*   `dh`: 图片高度
    

![](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKlxDHCn21fyEeiaE8icHzbcAt8QQ2qibicKelobnJ8soB4FwW3OtQY9RoSqfGriaHjMnhmyoVAUicGHOxAQ/640?wx_fmt=other) 55.png

```
<canvas id="c" width="500" height="500" style="border: 1px solid #ccc;"></canvas><script>  const cnv = document.getElementById('c')  const cxt = cnv.getContext('2d')  const image = new Image()  image.src = './images/dog.jpg'  image.onload = () => {    cxt.drawImage(image, 0, 0, 100, 100, 30, 30, 200, 200)  }</script>复制代码
```

总结
==

本文主要讲解了在 `Canvas` 中绘制一些基础图形，还有一些基础样式设置。

还有更多高级的玩法会在之后的文章中讲到，比如渐变、投影、滤镜等等。

代码仓库
====

⭐雷猴 Canvas[4]

推荐阅读
====

👍《Fabric.js 从入门到膨胀》[5]

👍《『Three.js』起飞！》[6]

👍《console.log 也能插图！！！》[7]

👍《纯 css 实现 117 个 Loading 效果》[8]

👍《视差特效的原理和实现方法》[9]

👍《这 18 个网站能让你的页面背景炫酷起来》[10]

**点赞 + 关注 + 收藏 = 学会了**

关于本文

作者：德育处主任
========

https://juejin.cn/post/7116784455561248775

  

最后
--

欢迎关注「三分钟学前端」

号内回复：  

「网络」，自动获取三分钟学前端网络篇小书（90 + 页）

「JS」，自动获取三分钟学前端 JS 篇小书（120 + 页）

「算法」，自动获取 github 2.9k+ 的前端算法小书

「面试」，自动获取 github 23.2k+ 的前端面试小书

「简历」，自动获取程序员系列的 `120` 套模版

》》面试官也在看的前端面试资料《《  

“在看和转发” 就是最大的