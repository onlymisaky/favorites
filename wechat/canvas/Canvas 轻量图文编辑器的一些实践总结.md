> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/1SUvSHozAgn03MefK_E4dQ)

最近一直在研究**多模态文档引擎**相关的技术实践, 今天和大家分享一些有关图片编辑器的一些技术实践和思考, 大家感兴趣可以参考一下.

**1. 直接上正题**

我们需要一个能够在 H5 端和桌面端使用的轻量级图文编辑器。具体的使用流程是在桌面端制作编辑模板（上传一张底图，指定编辑区域的大小），然后在 H5 端允许用户在模板的基础之上添加文本，图片，支持对文本图片的多种编辑等。

**2. 核心问题和分析**
--------------

主要诉求是需要自研一套商品图文定制编辑器，在 PC 上支持模板定制，在 H5 上支持图文编辑。模板定制主要是确定底图的编辑区域，图文编辑器则是在底图上添加图片和文字。

### **2.1 社区现状**

在图文编辑器上，目前社区中各式各样的编辑器非常丰富：

*   专业的修图软件：PS、Pixelmator 等
    
*   手机 App：美图秀秀、Picsart 等，功能也非常完善且强大，不比 PS 差
    
*   轻量级编辑器：视频封面编辑、公众号图文排版、商品定制等面向业务场景
    

<table><thead><tr><th><strong>PhotoShop</strong></th><th><strong>Pixelmator</strong></th></tr></thead><tbody><tr><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGV0qV7ac8libTY9oZxz0p6Q1HtTc3OnK7jKOXnfaUKA1VgLPDgjTHaDWw/640?wx_fmt=jpeg&amp;from=appmsg"></td><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVrlMBEiclzOLA5fnQMck68CqElIwM2SddlyIsNShJf3KfFMqAiabgNVMQ/640?wx_fmt=jpeg&amp;from=appmsg"></td></tr><tr><td><strong>美图秀秀</strong></td><td><strong>Picsart</strong></td></tr><tr><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGV6QBMsaxpjGAcgIpsZiakESHDtefjhwIZ6HMibpbPYf9hU9iabMzPutapw/640?wx_fmt=jpeg&amp;from=appmsg" style="width: auto;"></td><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVqGrXmgbmkm8kZ4RZ2wBzWeFzgXAprPogqjhHNW2o8Xmf0ssPuoiaZNQ/640?wx_fmt=jpeg&amp;from=appmsg" style="width: auto;"></td></tr></tbody></table>

在 Web 上的编辑器种类也非常丰富，毕竟 canvas 能做的事情非常多。比如 miniPaint 基本复刻了 ps，基于 farbic.js 的 Pintura. 和 tui.image-editor，基于 Konva 的 polotno 等等。这些编辑器也基本是个 app 级别的应用了。

<table><thead><tr><th><strong>miniPaint</strong></th><th><strong>tui.image-editor</strong></th></tr></thead><tbody><tr><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVib7zIeWcric2LUTbtoGPZwGWrLaUiaZalQpX54lSkHkB5Kx2jGx7Ao1Eg/640?wx_fmt=jpeg&amp;from=appmsg"></td><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVmo8xkPcgaTMYUZg2eXicUvVkquWlftr6iaCIfEYNibvEbhfw8QnrlAk9w/640?wx_fmt=jpeg&amp;from=appmsg"></td></tr><tr><td><strong>polotno</strong></td><td><strong>pintura</strong></td></tr><tr><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVLiaOqCyKSaTiaLoSVvV0DRzdic4547TIiayR5okQ7ibP8DoLOQVxuHWrq5w/640?wx_fmt=jpeg&amp;from=appmsg"></td><td><img class="" src="https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGV44ao6WH64NbGsIv35Up19LiaPeNibVoiaibic6gVYZ2wlgiaOB4svCNoicXQA/640?wx_fmt=jpeg&amp;from=appmsg"></td></tr></tbody></table>

总结一下：

1、不论是软件型应用还是 Web 编辑器，一种是做得非常通用的编辑器，功能丰富且完善，另一种就是面向业务流程定制的轻量型编辑器，只有一些特定交互操作和属性配置能力，可操作内容很少；

2、上述的这些 Web 编辑器大部分都是在 PC 上被使用，在手机上的编辑器也基本是在 Native 容器里开发。所以可以参考的 H5 编辑器基本没有。

3、PC 和 H5 编辑器一个明显的不同是，在 PC 上编辑操作，是选中元素后，元素的属性在工具栏或侧边栏进行编辑，画布上的操作只有缩放和旋转。在 H5 上的编辑器，元素选中后的操作会主要放在四个锚点控制器上，添加自定义操作，其余一些次相关的操作放在底部操作栏。所以在设计和实现这个编辑器的过程中，我们参考了很多类似手机 App 的交互。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVarysIB4gibFQm4zjsIANW1gKxdEOpfk4PYXB5C1iaK3TicjgmYs3CbHsA/640?wx_fmt=jpeg&from=appmsg)

### **2.2 分析 -** **操作流程**

1、在 PC 设置模板，上传底图，并设置定制区域，定制区域可调整

2、在 H5 上基于模板进行图文编辑，可添加图片和文字，文字可修改字体 颜色 大小。同时可控制元素的缩放旋转、层级移动、删除和复制。

3、最后基于模板和元素，导出定制图。

我们这次的场景显然只需要一个轻量型的图文编辑器，技术上如何选型？

*   如果基于完整的第三方编辑类库（如 polotno），太重了，可能有现成的功能，但改造成本更高；
    
*   基于图形处理库（封装了 Cavnas 或者 SVG 的 API）直接开发会更容易管理，但可能需要从头实现一些功能。
    

我们准备基于 Konva 来实现这次的编辑器需求。也想借这次机会，沉淀一些通用的编辑能力，如元素锚点操作的控制、拖转限制的计算逻辑、蒙层遮罩的绘制逻辑、坐标转换的逻辑等等。

**Why Konva？**

Konva 和 Fabric 都是比较热门的开源 2D 图形库，封装了 Canvas 的一系列 API。

<table><thead><tr><th><strong>Farbic</strong></th><th><strong>Konva</strong></th></tr></thead><tbody><tr><td>比较老牌，比 Konva 上线时间更早一些。</td><td>使用&nbsp;TypeScript&nbsp;编写，TS&nbsp;原生支持</td></tr><tr><td>常用转换（放大、缩小、拖拽）都已经封装好，内置了丰富的笔刷，基本的对齐、标线都有，特别适合用&nbsp;Canvas&nbsp;写交互性的界面</td><td>渲染分层比较清晰，Stage&nbsp;-&gt;&nbsp;Layer&nbsp;-&gt;&nbsp;Group&nbsp;-&gt;&nbsp;Shape</td></tr><tr><td>代码集成度比较高，内置了可交互富文本（纯&nbsp;Canvas&nbsp;实现）</td><td>代码简洁、干净，易于阅读</td></tr><tr><td>代码使用&nbsp;ES5 开发，不能很好的支持&nbsp;TypeScript，开发效率可能会有影响</td><td>文档清晰，容易上手</td></tr><tr><td>由于库本身集成了很多功能点，代码包的大小偏大（压缩后 308&nbsp;kB）</td><td>核心代码精简，代码包较小（压缩后 155&nbsp;kB</td></tr><tr><td>细节功能还需要完善，比如标线系统实现相对简单</td><td>部分功能实现基于&nbsp;DOM（富文本）</td></tr><tr><td>.</td><td>后起之秀，周边生态还比较薄弱</td></tr></tbody></table>

### **2.3 编辑器设计思路**

编辑器按照图层叠加的顺序自上而下是 **底图** -> **蒙层** -> **元素** -> **控制器**

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVA8xT16ED1xs3b0nVGoJKxe9xBeAAcf5I54azFSDRsQuJR241PBLMfg/640?wx_fmt=jpeg&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGV0LMEMKvXLxUBQUedmbiasuTDMW4Y6LichfbZs6ygdrfQ6FJABjOKpia1w/640?wx_fmt=jpeg&from=appmsg)

**3. 详细功能设计**
-------------

### **3.1 数据**

#### **3.1.1 数据格式定制**

目前支持两种编辑区域，圆形和矩形。编辑区域的数据类型为:

```
    export type EditAreaType = RectArea | CircleArea;

    export interface RectArea {
      /** 类型 */
      type: 'Rect';
      /** 属性 */
      attrs: { x: number, y: number, width: number, height: number };
    }

    export interface CircleArea {
      /** 类型 */
      type: 'Circle';
      /** 属性 */
      attrs: { x: number, y: number, radius: number };
    }



```

其中，x，y 均是相对于底图所在容器的坐标。

#### **3.1.2 坐标转换**

由于服务端考虑到数据流量成本，在 PC 和 H5 的底图会做分辨率的限制，例如在 PC 上传的底图是 1200x1200，在 H5 上提供的底图是 400x400（但最后合成的时候会用原图）。因此定义编辑器数据过程中，元素和蒙层的坐标不能相对于底图，需要相当于容器大小计算。同时能够互相转换。

如下图所示，用户可以再 PC 端定制编辑区域的大小和位置，然后将模板的数据导出到 h5。这里的问题就是 PC 端制作的模板数据（底图，编辑区域相对于容器的位置，宽高）如何做转换的问题。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVAj8URTp2oxWtxz9MefYHicet2scq9QvK3McC2ZK57ylgB6Yiaiavsibztw/640?wx_fmt=jpeg&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVarxXtyojfTcm8bLGpjk0YJb9wS09XmibicWBY3w7yvuHgBad91BkrOrg/640?wx_fmt=jpeg&from=appmsg)

但本质上也是三个坐标系之间的转换问题。第一个坐标系是 PC 端底图的容器，第二个坐标系是图片底图本身，第三个坐标系是 h5 端底图的容器。底图填充容器的逻辑为：保持宽高比，填满容器的宽或高，另一个方向上居中处理。

用户在定制编辑区域的时候其实是以底图为坐标系的，但为了方便处理，我们将编辑区域的数据保存为以容器为坐标系。这样在 h5 端加载编辑区域的时候需要一套转换逻辑。实际的转换过程如下图所示，我们只需要计算出将底图填充到两个容器的的变换的 ” 差 “，或者说两个变换结果之间的变换即可，然后就是将求出的变换应用到编辑区域或具体的元素上。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVZl8411ooVVQWaNkjicAG7h3jV1twxqcD91GjibPTSgQS8HynQAgl2HIQ/640?wx_fmt=jpeg&from=appmsg)

实际的代码可能更好理解一些:

```
/**
 * 映射编辑区域，将编辑区域从旧容器映射到新容器
 * @param area 原始编辑区域数据
 * @param ratio 底图比例
 * @param containerSize 原始容器尺寸
 * @param newContainerSize 新容器尺寸
 * @returns 映射后的编辑区域 EditAreaType
 */
export const projectEditArea = (
  area: EditAreaType,
  ratio: number,
  containerSize: Vector2,
  newContainerSize: Vector2,
) => {
  const { type, attrs } = area;
  // 编辑区域相对于旧的容器的 transform
  const transform = {
    x: attrs.x,
    y: attrs.y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
  // 编辑区域相对于旧容器的 transform 转换为相对于 新容器的 transform
  const newTransform = projectTransform(transform, ratio, containerSize, newContainerSize);
  // 编辑区域是矩形
  if (type === 'Rect') {
    const { width, height } = attrs as { width: number, height: number };
    return {
      type,
      attrs: {
        x: newTransform.x,
        y: newTransform.y,
        width: width * newTransform.scaleX,
        height: height * newTransform.scaleY,
      },
    };
  }
  // 编辑区域是圆形
  if (type === 'Circle') {
    attrs as { x: number, y: number, radius: number };
    const { radius } = attrs as { radius: number };
    return {
      type,
      attrs: {
        x: newTransform.x,
        y: newTransform.y,
        radius: radius * newTransform.scaleX,
      },
    };
  }

  return area;
};


/**
 * 映射元素的形变
 * @param transform 原始容器下的形变
 * @param ratio 底图比例
 * @param containerSize 原始容器尺寸
 * @param newContainerSize 新容器尺寸
 * @returns { TransformAttrs } 新容器下的形变
 */
export const projectTransform = (
  transform: TransformAttrs,
  ratio: number,
  containerSize: Vector2,
  newContainerSize: Vector2,
) => {
  const {
    x, y, rotation, scaleX, scaleY,
  } = transform;

  const [oldContainerWidth, oldContainerHeight] = containerSize;
  const oldContainerRatio = oldContainerWidth / oldContainerHeight;

  // 底图相对于旧容器的位置，按比例缩放后居中
  let origin: null | { x: number, y: number } = null;
  // 底图在旧容器按比例缩放后的 size
  let imgSize: null | { width: number, height: number } = null;
  // 图片宽高比 < 旧容器宽高比 旧容器更宽，横向有空白
  if (ratio < oldContainerRatio) {
    imgSize = {
      height: oldContainerHeight,
      width: oldContainerHeight * ratio,
    };
    origin = {
      x: (oldContainerWidth - oldContainerHeight * ratio) / 2,
      y: 0,
    };
  } else {
    // 图片宽高比 > 容器宽高比 旧容器更高，上下有空白
    imgSize = {
      width: oldContainerWidth,
      height: oldContainerWidth / ratio,
    };
    origin = {
      x: 0,
      y: (oldContainerHeight - oldContainerWidth / ratio) / 2,
    };
  }

  const [newContainerWidth, newContainerHeight] = newContainerSize;
  const newContainerRatio = newContainerWidth / newContainerHeight;

  let newOrigin: null | { x: number, y: number } = null;
  let newImgSize: null | { width: number, height: number } = null;
  // 底图比例小于新容器的宽高比，新容器更宽，缩放后横向有空白
  if (ratio < newContainerRatio) {
    newImgSize = {
      width: newContainerHeight * ratio,
      height: newContainerHeight,
    };

    newOrigin = {
      y: 0,
      x: (newContainerWidth - newContainerHeight * ratio) / 2,
    };
  } else {
    // 底图比例大于新容器的宽高比，新容器更高，缩放后上下有空白
    newImgSize = {
      width: newContainerWidth,
      height: newContainerWidth / ratio,
    };
    newOrigin = {
      x: 0,
      y: (newContainerHeight - newContainerWidth / ratio) / 2,
    };
  }

  // 保持宽高比
  // 计算旧容器内底图到新容器内底图的缩放比例
  const scale = Math.min(newImgSize.width / imgSize.width, newImgSize.height / imgSize.height);
  // 累积两次缩放，实现到新容器保持宽高比缩放效果
  const newScaleX = scaleX * scale;
  const newScaleY = scaleY * scale;

  // 编辑区域相对于旧容器底图的位置转换为相对于新容器底图的位置
  const newX = (x - origin.x) * scale + newOrigin.x;
  const newY = (y - origin.y) * scale + newOrigin.y;

  return {
    x: newX, y: newY, rotation, scaleX: newScaleX, scaleY: newScaleY,
  };
};





```

### **3.2 元素操作**

#### **3.2.1 缩放 && 旋转元素**

缩放和旋转元素的功能如下图所示，要求按住元素右下角的 icon 的时候，可以绕元素中心旋转元素或缩放元素。

![](https://mmbiz.qpic.cn/mmbiz_gif/dFTfMt0114icjKicNfdSRIoblThj7vXibGVFlmWy1cluicn7zAREqP1FT4iaW9PQPxAFZMCHAIIUeRa4KfZdDMvMmJA/640?wx_fmt=gif&from=appmsg)

这里最好是有一些 2 维 平面上仿射变换的知识，理解起来会更轻松，可以参考  闫令琪关于计算机图形学入门的课程中的介绍，这里就直接介绍解法了。

上面动图中所展示的一共有三种仿射变换，缩放，旋转，还有平移。缩放和旋转都很明显，但是为什么有平移 ？因为 Konva 默认的旋转是围绕 ”左上角 “的，而实际位移的又是 “右下角”，所以如果想要一个围绕中心旋转的效果，就需要移动 “左上角” 把 “右下角” 的位移抵消掉。举个例子，放大的时候，右下角向编辑器右下方移动，左上角向编辑器左上方移动，他们的位移方向总是相反且距离相等。

这里我们只需要在拖拽过程中计算出此刻 ”右下角 “和元素中心构成的向量 和 上个时刻” 右下角“ 和元素中心构成的向量，之间的比值，角度，和位移。然后再将这三中变换应用到元素上即可，如下图所示，具体的代码这里不再讲解。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVOIXduUr0kHHaoas5TTCIM807icULIIkXpEMFT8MT2FS4RPSZHtTkVqg/640?wx_fmt=jpeg&from=appmsg)

#### **3.2.2 拖拽区域限制**

元素的拖拽范围限制是一个常见的问题，h5 上期望的效果为元素不可拖出蒙版所在区域，也就是 h5 上底图实际所在的区域。

![](https://mmbiz.qpic.cn/mmbiz_png/dFTfMt0114icjKicNfdSRIoblThj7vXibGV6fMMLcnyEEOB19wyE8ichnuLLEDh6azUVd0YA3AN5s1ewFbSjh1ftpA/640?wx_fmt=png&from=appmsg)

实现拖拽范围限制功能的一个思路是在拖拽的回调函数中判断当前的元素坐标是否越界，如果越界则修改元素的坐标为不越界的合法坐标。拖动是一个连续的过程，元素在被拖出限定区域之前会有一个临界的时刻，在此之前元素完全在限定区域内，在此之后，元素开始被拖出限定区域。所以，将元素限制在编辑区域内就是要在元素将要离开的最后一刻，修改元素下一刻的位置把它拉回来。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGV5n1TVzoQbs4LtNZ2nBS9ecomkhakGiaQPeP1R7icAd8daLjDMBp7EobA/640?wx_fmt=jpeg&from=appmsg)

Konva 也直接提供了一个元素的 dragBoundFunc(pos: Konva.vector2d) => Konva.vector2d 函数，其入参是下一个拖动过程中下一个时刻元素 “左上角” 本来的坐标，返回值是下一个时刻元素 “左上角” 最终的坐标。该函数会在拖动过程中不断执行，只需在此函数中填入限制逻辑即可。

需要注意的是，这里面有两个棘手的问题

1.  由于元素自身支持旋转，元素的 “左上角” 并不一定一直处于左上角的位置
    
2.  只有元素 “左上角” 下一时刻的坐标，无法计算下一个时刻元素是否越界 
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGV7zoRia8qnqZiaXJdRehmic9Q0xicQWDaoPiaSoLibJdR6hAeSqNjtDt1SXPQ/640?wx_fmt=jpeg&from=appmsg)    ![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVB4H0rAWuIrXhPwvfDJX6sVyoZAro8GQ8gg54qJOpxauH2YSONicwtcA/640?wx_fmt=jpeg&from=appmsg)

这两个问题的解决过程可谓是一波三折。这里需要注意两个点：一是，拖拽是一个连续的过程，拖拽的过程中只有位移，没有其他变换。二是，我们知道的不仅仅是 dragBoundFunc 传入的下一个时刻的 “左上角” 的坐标，我们还可以计算出当前时刻的元素的四个顶点的坐标。

所以，我们可以计算出下一个时刻 “左上角” 坐标和此刻 “左上角” 坐标的偏移量，从而计算出下一个时刻元素的四个顶点的坐标。然后检测，下个时刻的元素是否在限制区域内即可。如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVPnf6mZVOSYt61Mrw6nGndksK9fsdS9NiaYDHpYUQXr0Md3OXbtaca2g/640?wx_fmt=jpeg&from=appmsg)

好的，现在我们找到了那个将要越界的时刻，我们该如何计算出一个合法的坐标作为下个时刻元素 “左上角” 的坐标 ？你不能直接把边界值，minX minY maxX maxY 这些值返回，因为 “左上角” 不一定在左上角。

那如果我找到越界的那个点，然后把对应的点和边界对齐，然后再通过三角函数计算呢 ？就像下图中画的这样。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVUW6jxSd39Xib4xlhteEicGwst496l07BWdRSYZB6dYxR1Kj18ALKvnCg/640?wx_fmt=jpeg&from=appmsg)

当然可以 😂 ，但是这也太复杂，太不优雅了，你还要获取元素当前旋转的角度，还要判断到底是哪个点越界 ...

有没有更快更简单的方法，当然也有，这又不是在造火箭。如果精确解很困难，找到一个准确度还不错的近似解就是有价值的。越界的上一刻还是合法的，我们可以 “时间回溯”，用上一个时刻 左上角合法的坐标来返回就行了。

```
    if(crossLeft || crossRight || crossTop || crossBottom){
       pos = lastPos;
    }else {
       lastPos = pos;    }

```

到此为止就已经能实现开头动图中的效果了。

### **3.3 控制器**

Konva 虽然提供了 Transfomer，可以用于实现拖拽缩放、旋转元素。但在 H5 上对操作功能做了定制，如调整层级，删除元素等等，仍然需要自己定义和实现一个元素控制器。

如下图所示，控制器主要包含虚线边框和四角的可点击 icon。要求点击 icon 分别实现弹窗调整层级，复制，删除，按住拖拽缩放大小的能力。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVqPZRE8W78FLqcWb7ApLwrEvGsA8WNcKS9paiacX3Iof6lh8V9mUVJTw/640?wx_fmt=jpeg&from=appmsg)    

#### **3.3.1 单例模式**

控制器最开始是根据元素实例化的，即每添加一个元素都有一个控制器实例。元素被激活（点击）时会显示该元素的控制器 同时隐藏其他所有控制器，元素失焦之后会隐藏该元素的控制器。拖拽元素，缩放元素的过程中需要同步元素的大小到其自身的控制器。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVnibJNDLHrwU5UWzFibgArgAfJfq2f5ic9Y1o3LFPquzAYJglfazsBD49w/640?wx_fmt=jpeg&from=appmsg)

如上图所示，每个 Shape 类都有一个控制器属性，绘制控制器的时候，会传入包含 icon 的回调函数的配置。Shape 的拖拽，缩放过程中需要调用控制器提供的公有方法 updateByShape 来同步位置和缩放比例。

这种做法较为简单，易于理解，但会带来以下两个问题

1.  画布上的 Shape 增多，难以区分不同元素的 Shape，对于调整元素之间的层级关系（zIndex）造成困难。
    
2.  画布上的控制器的 Shape 增多，可能会造成性能变差。
    
3.  控制器和 Shape 类混杂在一起，概念不清晰，代码上不好维护。
    

将控制器和 Shape 类拆分后，两个类的职责更单一。Shape 类面相外部导出，可以做更多定制。控制器类只面相交互，实现编辑功能。

后面梳理后发现并不需要多个控制器实例子，同一时刻处于激活状态的元素只有一个，不会同时编辑（拖拽，缩放）两个元素。使用一个控制器实例，能够减少画布上的 Shape，便于控制元素的层级。后续的代码逐步演变成下图所示。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVO25Fues7Bqm1icOMYw5LarPMdib5MQ5KDDC3ZOaJiaGHA0EOKoDhFZ1AQ/640?wx_fmt=jpeg&from=appmsg)

控制器通过 id 关联当前激活的 ShapeElement, ShapeElement 类是对 Konva.Shape 类的简单包装，在其上添加了一些生命周期方法和导出方法等。 而控制器类中则实现了 缩放，拖拽等编辑能力，这种模式下，用户缩放和拖拽的其实是外层的控制器，然后控制器再将这些编辑操作通过 syncBorderRect 方法同步到当前激活的 ShapeElement。

而为了实现点击不同的 ShapeElement 时切换控制器的效果，我们提供了 updateByShapeElement 方法，在 shape 的 onClick 回调中，只需要调用该方法即可。

在这种模式下，原来控制器位于蒙层之上的效果也容易实现了。如下图所示，画布上从下到上分别是：底图，文本 / 图片元素，蒙层，控制器。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVtKXVwMgIia5EjREX6UwQ7tDZ9RqsCdHEp0HPo6nhb3eSIBYWwoPjl7A/640?wx_fmt=jpeg&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVZmibG0K9LETkbs2Mia4GFweTru1Vh0Nr83gYdEBs63Iy3bMurAbH7xiaA/640?wx_fmt=jpeg&from=appmsg)

#### **3.3.2 判断当前选中元素**

实现当前控制器的另一个难点在于，元素处于蒙版的遮盖的时候，点击元素如何唤起控制器。如上图所示，当元素完全被蒙版遮盖的时候，Konva 提供的元素的 onClick 事件是不会触发的。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVI3FZcxseDyoibLzIgicjyoF8WA9kibND2ORHgHdhbtTAoUgz6ffZd84dQ/640?wx_fmt=jpeg&from=appmsg)

这样只能回到在 canvas 上实现点击事件的思路，监听点击事件，根据点击事件的坐标和元素的位置关系来判断选中的元素。

具体的逻辑为：

1.  获取点击事件中的坐标
    
2.  通过 d3-polygon 提供的方法判断点击事件的坐标在不在元素的包围盒中。
    
3.  排序找到命中的最上层的元素
    
4.  激活对应元素，直接执行元素的 onClick 回调函数。
    

### **3.4 蒙层**

#### **3.4.1 蒙层绘制** 

蒙层的功能主要有两个：1. PC 端方便用户定制编辑区域的大小。2 H5 端起到编辑区域外起到半透明遮盖的效果，编辑区域内可视的效果。

![](https://mmbiz.qpic.cn/mmbiz_jpg/dFTfMt0114icjKicNfdSRIoblThj7vXibGVAj8URTp2oxWtxz9MefYHicet2scq9QvK3McC2ZK57ylgB6Yiaiavsibztw/640?wx_fmt=jpeg&from=appmsg)    ![](https://mmbiz.qpic.cn/mmbiz_gif/dFTfMt0114icjKicNfdSRIoblThj7vXibGVgykZOvHH0zYj8MKEhd4aWoCtfncfMdJm3kTgDssicN4icibdibe2wFnTVg/640?wx_fmt=gif&from=appmsg)

蒙层的元素主要有三个部分，一是背景的半透明的黑色区域，二是拖拽编辑区域大小时外层的框所在的矩形，三是实现透明效果的矩形。可拖拽，缩放的透明矩形框的实现是 Konva Rect + Konva Transformer，借助了 transfomer 提供的能力实现编辑区域的缩放。而透明效果的矩形主要是借助 Konva Shape 的 sceneFunc 定制形状的能力，通过 canvas 中的 clip 函数实现透明的矩形或者圆形的效果。

#### 3.4.2 导出特定区域

导出图片时限定只导出编辑区域内的功能主要依赖 Konva 提供的 clipFunc 函数，该函数会传入 canvas2d 绘制上下文，只需要绘制出特定的区域，konva 会自动帮我们只导出区域内的内容。

**4. 总结**
---------

本文介绍了基于 Konva 实现 H5 端的轻量级图文编辑器的一种方法，在实现这个轻量级的图文编辑器的过程中我们总结了设计思路和常见的问题处理方案。当然，编辑器的实现是一个需要不断打磨交互和细节的过程，比如像拖拽过程中的辅助线提示、支持文本和图片更丰富的属性等等。篇幅所限，这里不再展开介绍了。希望本文对有志于动手实现编辑器的前端同学能有所助益。

更多推荐
----

![](https://mmbiz.qpic.cn/mmbiz_gif/dFTfMt0114icRvovLK24UibrzWYfabH7IznPiaChhwJiathJJed9If0CqfytpbawMqicetoobaT5zwNicWaJQudSZ0kw/640?wx_fmt=gif&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1)

后面我也会持续迭代 `flowmix/docx` 多模态文档引擎, 来实现对 `docx` 文件的预览能力, 同时还会支持文档组件的图层管理和画线评论功能, 如果你有好的想法和建议, 欢迎随时和我反馈~

*   React 版体验地址: http://flowmix.turntip.cn/docx
    
*   Vue 版地址: http://flowmix.turntip.cn/docx-vue
    

  

  

  

作者：ES2049 / 金克丝

https://juejin.cn/post/7312243176835334196