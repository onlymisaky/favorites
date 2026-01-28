> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EJUrFxC_mS6WCWx1xf3KcA)

转转 UI 自动化走查方案探索
===============

前言
--

UI 走查是现在转转 C 端需求开发流程中相当重要的一环，然而 UI 走查这一环节难以接入自动化流程中，导致其没有如同测试环节一样的冒烟环节（又称测试准入），因此实际走查阶段时，前端的 UI 交付质量难以在流程上做硬性管控，UI 还原度参差不齐，这也就进一步导致了 UI 走查效率难以把控。经 UI 侧同学的不完全统计，2025 年 5-8 月期间，共走查需求 20 个，总耗时 33h，平均单个需求耗时 1.6h，在需求规模较大的情况下，走查耗时最高时可达 3-4 小时，走查轮次 3 次，异常数量 30-50 个不等，而走查本身耗时并不高，而大部分的时间都耗费在对 UI 异常问题的标注上。因此，开发一种自动化比对 UI 设计稿与 HTML 结构，自动化标注比对结果的工具，能在根本上提升 UI 还原度，提升 UI 走查效率。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCqB6TTY2XErb4qFlrtPhaJlP64kyOduwWNQsfCdmPnxOekL6vCweLAQ/640?wx_fmt=png&from=appmsg#imgIndex=0)走查耗时统计

方案的调研与选择
--------

### 叠图比对方案

目前现存的大多数 UI 走查方案走的都是比对 UI 设计稿与前端页面截图的方案，此方案虽通用性高，但是结果难以量化，难以与标准化研发流程结合，在前言中我们也说明了，走查的耗时成本在与**异常数据的标注**，而非获取比对结果。因此这种方案显然无法达成目的

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCpKQGAb4EDI8TOO5Z8oo3aJvpLanpibKIaWGCgWA929ClVhbdTREP44A/640?wx_fmt=png&from=appmsg#imgIndex=1)prefect pixel 实现效果

### 像素比对方案

像素级的比对方案与叠图比对方案的原理相似，在实现上，叠图方案需要开发者主动判断结果，而像素比对方案则是通过类似于`opencv`之类的图像处理工具配合类似于`scikit-image`之类的结构相似度算法进行实现。这种方案虽然能拿到量化的比对数据，以及自动化标注，但是在双方图片的相似度上要求较高，设计稿与 UI 在文案上有一定的区别都能造成比对的误差，且误差不可控。如果进一步的考虑通过微调、自训练 ai 模型的方案，则训练、标注的成本也相当高。因此改方案也并非最佳的选择。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCianJus3w3DNRoibM65WaW3WJUQeegjjh69yStQL48RMBkhiawj0nAfDnA/640?wx_fmt=png&from=appmsg#imgIndex=2)像素级比对方案结果![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCl09qickZjacPF0NEUAIGGHae43w1rwT08icLbiaGAF6ICBmDA7SPqSZkQ/640?wx_fmt=png&from=appmsg#imgIndex=3)像素级比对方案结果

### 基于前端与 UI 节点的比对方案

在现在流行的一些前端化 UI 设计工具（例如 Figma、Master Go）中，UI 设计稿在底层其实是一个大型的带有嵌套关系的 JSON 数据结构，而前端的 Dom 树也是一个带有嵌套关系的数据结构。基于这两点，很容易就想到如果能将双方的节点数据归一化处理成相同的数据结构，那么在节点间间距的精确匹配与比对上，或许会有不错的效果。

数据结构设计
------

既然要归一化处理数据，那么首先需要考虑的就是这个数据结构需要什么。

在上文提到的 UI 走查情况统计数据中，UI 走查出现的问题中，间距问题占比约 95%**，字体相关问题约占** 3%，其余诸如背景色、边框等问题占比共 2%，因此在方案前期，首要需要解决的问题就是间距问题。

要检测出间距问题，首先需要找到当前节点的相邻节点，于是我们对相邻节点做出如下定义。

1.  定义当前节点 A 与另一个节点 B 之间总共有 9 种环绕关系，按从左到右从上到下编号分别即为 1-9 号位置。![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCGI3SJeQLrxADFDfQKictDZuicHd1KTwZlweA6DkyJjN2MC7hOlCg546A/640?wx_fmt=png&from=appmsg#imgIndex=4)
    
2.  2、4、6、8 号位置中，与当前节点的距离最小的节点，即为当前节点的四个方位的相邻节点
    
3.  所谓上下左右的间距，即为当前节点与各方位上的相邻节点的间距。
    
    ```
    /** 相对于当前节点的兄弟节点位置枚举 */exportenum SiblingPosition {/** 不在任何位置 */  NONE = 0,/** 左上角 */  TOP_LEFT = 1,/** 正上方 */  TOP = 2,/** 右上角 */  TOP_RIGHT = 3,/** 左侧 */  LEFT = 4,/** 右侧 */  RIGHT = 6,/** 左下角 */  BOTTOM_LEFT = 7,/** 正下方 */  BOTTOM = 8,/** 右下角 */  BOTTOM_RIGHT = 9,}/** 节点的唯一ID标识符 */type UniqueId = string/** 只记录2 4 6 8 四个方向的兄弟节点信息 */type SiblingRelativeNodeInfo = Partial<Record<SiblingPosition, UniqueId>>
    ```
    

除此之外，我们还需要该节点的`boundingRect`、`padding`、`margin`、`border`、`font`相关的信息，最终设计了如下的数据结构

```
/** 节点信息 */exportinterface NodeInfo extends SiblingRelativeNodeInfo {/** 父节点 id */  parentId: UniqueId/** 子节点 id */  children: UniqueId[]/** 兄弟节点 id */  sibling: UniqueId[]  uniqueId: UniqueId  nodeName: string/** 节点边界 */  boundingRect: BoundingRect/** padding信息 */  paddingInfo: PaddingInfo/** border信息 */  borderInfo: BorderInfo/** 背景色 */  backgroundColor: string/** 标签名称（设计稿则为节点类型） */  tagName?: string | SceneNode['type']/** 文本样式信息, 只有内部是文本的节点才有这个字段 */  textStyleInfo?: TextStyleInfo/** 节点的中心信息 @description DOM ONLY */  nodeFlexInfo?: NodeFlexInfo/** 相邻节点的边距 */  neighborMarginInfo: Partial<Record<SiblingPosition, NeighborMarginInfo>>}
```

数据归一化处理流程
---------

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCyV24Z5nRdryZHoUR7TJTDULUyUT5MV8cbPWHYARhtIwyiagibkIqg6aQ/640?wx_fmt=png&from=appmsg#imgIndex=5)数据归一化流程

Dom 侧数据处理与 UI 侧数据处理逻辑基本一致，上图为整个 Dom 结构数据处理流程，下面将对该流程中比较核心的部分进行讲解。

### `processLargeLineHeight`处理行高问题

处理行高问题，旨在抹平前端侧与 UI 侧在相同渲染效果下，因为设置了不同的行高导致节点高度不同造成的异常。行高数据的归一化处理依赖于节点内部的`textStyleInfo`，其结构如下

```
export interface TextStyleInfo {/** 行高 */  lineHeight: number/** 文本宽度 */  textWidth: number/** 字体大小 */  fontSize: number/** 字体粗细 */ fontWeight: number/** 字体 */  fontFamily: string/** 文本行数 */  textLineCount: number/** 文本对齐方向 */  textAlignment: TextAlignment/** 文本内容 */  textContent: string/** master go的文本节点的宽高策略 */  textAutoResize?: TextNode['textAutoResize']}
```

其核心逻辑如下：

1.  **创建测量容器**
    

```
const measureElement = document.createElement('div')measureElement.style.position = 'absolute'measureElement.style.visibility = 'hidden'
```

2.  **克隆关键样式**
    

复制影响文本布局的所有样式到测量元素：

*   **字体样式**: `fontSize`, `fontFamily`, `fontWeight`
    
*   **排版**: `lineHeight`, `whiteSpace`, `wordBreak`, `textTransform`
    
*   **约束**: `width`（使用原节点宽度）
    
*   **清零**: `padding`, `margin`, `border`（避免干扰）
    

3.  **首次测量（多行场景）**
    

```
measureElement.style.width = `${domNode.getBoundingClientRect().width}px`document.body.appendChild(measureElement)const measureHeight = measureElementRect.height
```

*   设置**固定宽度**（与原节点一致）
    
*   测量文本在此宽度约束下的实际高度
    

4.  **计算行数**
    

```
const shouldUseOriginHeight = !isInline && originHeight < measureHeightconst textHeight = shouldUseOriginHeight ? originHeight : measureHeightconst lineCount = Math.max(1, Math.round(textHeight / lineHeightValue))
```

**关键逻辑**：

*   如果原节点是 **block** 且设置了固定高度，且该高度小于测量高度
    

*   说明文本被裁剪了（如 `height: 50px` 但文本实际需要 100px）
    
*   使用原始高度计算行数（因为实际显示的就是被裁剪的部分）
    

*   否则使用测量高度
    
*   `行数 = 文本高度 / 行高`
    

5.  **单行特殊处理**
    

```
if (lineCount > 1) {  return baseTextStyle}// 单行场景，重新计算宽度measureElement.style.width = 'auto'document.body.appendChild(measureElement)const measureElementRect2 = measureElement.getBoundingClientRect()
```

单行重新测量，根本上是为了确定单行文本的场景下实际占用的最小宽度。

在获取了`textStyleInfo`之后，就可以进行行高的归一化处理了。

1.  **Inline 节点特殊处理**
    

```
if (isInlineNode && !!parentNodeInfo) {  nodeInfo.boundingRect.y = parentNodeInfo.boundingRect.y  nodeInfo.boundingRect.height = parentNodeInfo.boundingRect.height  return}
```

inline 节点的处理是一个大坑，在 MasterGo 的渲染器中，文字始终是在`TextNode`中居中处理的，但是在前端文本中，文本是以 baseline 为基准对齐的，文字在 lnlineNode 中的居中方式，取决于字体本身的设置，而非始终居中渲染。因此此套逻辑只能在非行内元素中使用，而行内元素的宽高则始终与父节点保持一致。

2.  **单行行高大于字体大小时的处理**
    

```
const realHeight = boundingRect.height - paddingBottom - paddingTopif (textLineCount > 1 || fontSize === realHeight) {  return}const deltaValue = realHeight - fontSizenodeInfo.boundingRect.y = boundingRect.y + deltaValue / 2nodeInfo.boundingRect.height = fontSize + paddingTop + paddingBottom
```

**调整方式**：

```
原始高度 = 50px (行高撑开)字体大小 = 14px多余空间 = 36px调整后：- Y 坐标下移：y + 18px (居中)- 高度缩小：14px + padding
```

### `processMarginCollapsing`处理边距合并的场景

要理解这一步骤，首先需要理解 CSS 中的核心概念：**Margin 折叠（Margin Collapsing）**

#### Margin Collapsing 介绍

在特定条件下，**子元素的 margin 会穿透父元素边界**，直接作用到父元素外部。举个例子：

```
<div class="parent" style="background: lightblue;">  <div class="child" style="margin-top: 30px; background: pink;">    子元素  </div></div>
```

**预期效果**：子元素距离父元素顶部 30px  
**实际效果**：父元素整体向下移动 30px，子元素紧贴父元素顶部

```
❌ 预期布局                ✅ 实际布局┌─────────────┐           ↓ 30px│  Parent     │           ┌─────────────┐│  ↓ 30px     │           │  Parent     ││  ┌────────┐ │           │┌────────┐   ││  │ Child  │ │           ││ Child  │   ││  └────────┘ │           │└────────┘   │└─────────────┘           └─────────────┘
```

#### 不会发生 Margin 折叠的条件：

1.  BFC 区域
    
2.  父节点有边界或者背景
    
3.  Flex、Grid 布局
    
4.  节点中有内联文本
    
    ```
    <div class="parent">  内联文本  <div class="child" style="margin-top: 30px;">子元素</div></div>
    ```
    

#### 处理逻辑

1.  判断是否会发生 Margin 折叠
    
2.  会发生 Margin 折叠时，对应方向上是否有子节点有`margin`
    
3.  有`margin`时，将子节点设置为`margin: 0`, 并将父节点对应方向上的`margin`设置为子节点的值与父节点的值中的最大值。
    

```
export function hoistingNotBfcBoundaryMargin(domNode: HTMLElement) {Array.from(domNode.children).forEach((childNode) => {    // 反向DFS，先走最内部节点，然后往外走    hoistingNotBfcBoundaryMargin(childNode as HTMLElement)  })// 是否是bfcconst isBFC = getDomIsBfc(domNode)// 是否是flex or gridconst isFlexOrGridItem = getIsFlexOrGridItem(domNode)// 是否有内联元素const hasInlineContent = getHasInlineContent(domNode)// 是否有clearconst hasClearance = getHasClearance(domNode)const childNodeList = Array.from(domNode.children).filter((childNode) => {    const isDataTextWrapper = childNode.getAttribute('data-text-wrapper') === '1'    return !isDataTextWrapper  })// 全部为false才需要提升marginconst preJudgeResult = [isBFC, isFlexOrGridItem, hasInlineContent, hasClearance, !childNodeList.length].every(it => !it)if (!preJudgeResult) {    return  }const shouldHoistTopMargin = judgeDomNodeMarginHoisting(domNode, 'top')const shouldHoistBottomMargin = judgeDomNodeMarginHoisting(domNode, 'bottom')if (shouldHoistTopMargin) {    hostingTargetDirectionMargin(domNode, 'top')  }if (shouldHoistBottomMargin) {    hostingTargetDirectionMargin(domNode, 'bottom')  }}
```

### `processPaddingInfo` 合并 padding 逻辑

在 UI 设计稿中，他们的边距可能是两个节点之间的距离，也可能是自动化布局的时候配置的 padding。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCahCwvcC8SpjTuUhHVwg526mjR2EAm8BCsrKz2XHUqgZYH5qsfuhurg/640?wx_fmt=png&from=appmsg#imgIndex=6)不同的边距实现![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCpwr1TYiceW3ewtV67K6l5Iv2HwyP9gvBVKExlxK9AtqQAJeOyxKibl6Q/640?wx_fmt=png&from=appmsg#imgIndex=7)边距场景 2

而在前端页面中，由于时常要考虑到节点存在与不存在的情况下的间距稳定性，因此常会出现各种拼接边距的情况。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCuxBIlRTcEkHrZUDyfePRoSXhj0AMbJRvMXVKmLJ8LcThNl7LYaTT9Q/640?wx_fmt=png&from=appmsg#imgIndex=8)拼接边距场景

所以需要将纯粹地用来作为拼接边距的 padding，从当前节点的 width 和 height 中排除出去，让节点的尺寸中不包含任何多余的无效 padding。本处理方法的核心逻辑如下

1.  对每个节点的上、下、左、右四个方向独立处理
    

```
paddingInfoDirectionList.forEach((currentPosition) => {  // top, right, bottom, left})
```

2.  判断当前方向的 padding 是否可以被合并（可能需要检查子节点是否占用了这个空间）
    

```
const targetDirectionPaddingValue = getTargetDirectionPaddingValue({  currentNodeInfo,  flatNodeMap,  position: currentPosition,})exportfunction getTargetDirectionPaddingValue({ currentNodeInfo, position }: JudgeMergableConfig) {const paddingKey = camel(`padding ${position}`) as keyof PaddingInfo// 是否存在目标方向的paddingconst targetDirectionPaddingValue = currentNodeInfo.paddingInfo[paddingKey]return targetDirectionPaddingValue || 0}
```

3.  执行合并操作
    

1.  **扩展边界框**：将 padding 空间纳入 boundingRect
    
2.  **减少 padding 值**：从 paddingInfo 中扣除已合并的值
    

```
/** * 合并padding * @param curNodeInfo 当前节点信息 * @param position 目标方向 * @param paddingInfo 目标方向的padding值 * @returns 合并后的节点信息 */function handleMergePadding(curNodeInfo: NodeInfo, position: 'left' | 'right' | 'top' | 'bottom', paddingInfo: number) {const clonedBoundingRect = clone(curNodeInfo.boundingRect)if (position === 'left') {    clonedBoundingRect.x += paddingInfo    clonedBoundingRect.width -= paddingInfo  }if (position === 'right') {    clonedBoundingRect.width -= paddingInfo  }if (position === 'top') {    clonedBoundingRect.y += paddingInfo    clonedBoundingRect.height -= paddingInfo  }if (position === 'bottom') {    clonedBoundingRect.height -= paddingInfo  }return clonedBoundingRect}/** * 减去已被合并的padding值 * @param curNodeInfo 当前节点信息 * @param position 目标方向 * @param paddingInfo 目标方向的padding值 * @returns 减去padding值后的节点信息 */function handleSubtractPaddingValue(curNodeInfo: NodeInfo, position: 'left' | 'right' | 'top' | 'bottom', paddingInfo: number) {const clonedPaddingInfo = clone(curNodeInfo.paddingInfo)const paddingKey = camel(`padding ${position}`) as keyof PaddingInfo  clonedPaddingInfo[paddingKey] -= paddingInforeturn clonedPaddingInfo}function processingPaddingInfo() {//...const paddingMergedBoundingRect = handleMergePadding(    currentNodeInfo,     currentPosition,     targetDirectionPaddingValue  )const newPaddingInfo = handleSubtractPaddingValue(    currentNodeInfo,     currentPosition,     targetDirectionPaddingValue  )//...}
```

### `shrinkRectBounding`收缩矩形边界

#### 为什么要收缩矩形边界？

在 UI 设计稿中，存在一些质量不可控的现象，比如![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCvLHcBunGDfZoN5DjNxMYfo0AKsBQoJHyYZxaRT6sS4Rkd6842icicMJQ/640?wx_fmt=png&from=appmsg#imgIndex=9)

在这个设计稿中，看似左侧的成色 + 定级标准节点与右侧的上下边距非常混乱，毫无居中的感觉。但是倘若我们对他进行一下变更：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCwmlRVPZ4yic0icFoKBCKAA9zD9XNgExdr4Jp77O68z99zv05QGFIF1Hg/640?wx_fmt=png&from=appmsg#imgIndex=10)实际上只需要处理好左侧的高度，右侧的高度完全可以和左侧相同，并处理成为 `justify-content: space-between`即可。

但是当 FE 拿到第一张图的时候，并不会一眼就看出来左右两侧的高度是可以完全一样的（因为选中左侧的时候是一个大的 rectangle）

这个例子告诉我们，在 UI 侧常会存在一些凌乱的、难以用直觉判断实际效果的设计节点。这时候如果想要用自动化的方案进行比对，就需要针对这些噪声进行降噪处理。在本文中，采用的就是**以实际渲染内容为主的节点收缩方案**

主要逻辑就是尽可能的收缩节点的尺寸，让其可以紧凑地包裹在内容之外，尽可能地不包含多余的空间。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCALChvTLYxC4l5pFUIGice9SCg0r378lsUu5TXy9CJVfuJiaDaoib9FTDw/640?wx_fmt=png&from=appmsg#imgIndex=11)设计稿边距收缩效果![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCpqbNkjs8D36apnJxVUCnkrABmRd5fnKM5HrH2XncnGaAHEQNjXhmMQ/640?wx_fmt=png&from=appmsg#imgIndex=12) HTML 边距收缩效果

在做完这些工作后，便可以进行节点与其相邻节点的间距计算了。

Dom 与设计稿数据的预处理逻辑
----------------

所谓预处理逻辑，旨在解决归一化处理数据时遇到的一些特殊 case。包括但不限于：设计稿蒙版节点处理、设计稿使用 rectange 节点作为背景色节点的逻辑处理、前端 px2rem 误差精度修正等

### 设计稿蒙版节点处理

在设计稿中 Mask 的形式如下

```
GROUP├─ 图片 A├─ 图片 B└─ 圆形 (isMask: true)  ← Mask 图层
```

其效果为：圆形作为遮罩，图片 A 和 B 只显示圆形范围内的部分。

虽然蒙版节点与被蒙版的节点是同一层的几个节点，但是从效果上来说，被蒙版的节点，可以视为蒙版的子节点。因此，将蒙版节点及被蒙版的节点视为一个父子结构，可以有效简化数据结构的处理。其流程如下：

1.  **查找 Mask 节点**
    

1.  先**反转**子节点列表（因为设计工具中 mask 在图层堆叠的底部）
    
2.  找出所有可见的 `isMask: true` 节点的索引
    

```
const reversedChildNodeList = originChildNodeList.toReversed()const childMastIndexList = reversedChildNodeList  .filter(it => !!it.isVisible)  .reduce((prev, it, index) => {    if (!nodeCanBeMaskSet.has(curNode.type) || !curNode.isMask) {      return prev    }    return [...prev, index]  }, [] as number[])
```

2.  **计算 Mask 影响范围**
    

1.  Mask 节点会影响它**上方**的所有节点（直到遇到下一个 mask）
    
2.  计算每个 mask 的影响范围 `[start, end]`
    

```
const maskChildIndexStartEndList = childMastIndexList  .map((it, index, originArr) => {    if (index === 0) {      return [reversedChildNodeList.length - it, reversedChildNodeList.length]    }    return [reversedChildNodeList.length - it, reversedChildNodeList.length - originArr[index - 1] - 1]  })  .toReversed()
```

**示例**：

```
原始顺序（反转后）：[0: 图片A, 1: 图片B, 2: Mask1, 3: 图片C, 4: Mask2]                      ↑                    ↑Mask1 影响范围: [0, 2]  (图片A, 图片B)Mask2 影响范围: [3, 4]  (图片C)
```

3.  **创建新的 FRAME 容器**
    

```
const newFrameNode = {  ...emptyFrameNode,           // 基础 FRAME 属性  id: `${id}${MASK_REPLACE_SUFFIX}`,  name: `${name}${MASK_REPLACE_SUFFIX}`,  // 继承 mask 节点的位置和尺寸  absoluteTransform,  relativeTransform,  x, y, width, height,  cornerRadius,                // 继承圆角  clipsContent: true,          // 关键：裁剪内容  children,                    // 被遮罩的内容}
```

4.  **优化：单个 Mask 且尺寸一致**
    
    如果只有一个 mask 且和父容器尺寸相同，直接替换父节点，减少层级。
    

```
const isSameSize = currentNode.width === firstMaskRelpaceNodeInfo.width   && currentNode.height === firstMaskRelpaceNodeInfo.heightif (newChildGroupList.length === 1 && isSameSize) {  // 直接合并到父节点  return {    ...currentNode,    ...firstMaskRelpaceNodeInfo,  }}
```

### 设计稿背景节点的提升

由于一些原 Adobe 软件 or sketch 的操作习惯，且在 MasterGo 工具中，Group 节点无法主动设置宽高，因此常使用 group 节点 + rectangle 节点的方式去撑开一个节点或者给一个节点设置背景色。而这个 rectangle 节点在比对过程中则属于一个需要忽略的节点，因此在此预处理逻辑中，需要识别背景色节点，并将背景色提升到父节点的属性上去，简化图层结构。其处理流程如下：

1.  **分离背景图层和内容图层**
    

```
export function judgeIsBgStyleRectangle(currentNode: PenNode | RectangleNode, parentNode: FrameNode | GroupNode) {const { width, height } = currentNodeconst { width: parentWidth, height: parentHeight } = parentNodeconst deltaWidth = Math.abs(width - parentWidth)const deltaHeight = Math.abs(height - parentHeight)// 大于为图片 + mask 或者 图片+overflow hidden的场景const isSameSize = deltaWidth < 2 && deltaHeight < 2return isSameSize}// 背景图层：RECTANGLE/PEN 且判断为背景样式const bgStyleNodeList = currentNode.children.filter((it) => {if (it.type !== 'RECTANGLE' && it.type !== 'PEN') returnfalsereturn judgeIsBgStyleRectangle(it, currentNode)})// 其他图层：非背景的内容const restNodeChildList = currentNode.children.filter((it) => {if (it.type !== 'RECTANGLE' && it.type !== 'PEN') returntruereturn !judgeIsBgStyleRectangle(it, currentNode)})
```

2.  **合并背景样式**
    

```
// 合并所有背景图层的填充const combinedFillList = bgStyleNodeList.flatMap(node => node.fills || [])
```

### 前端 px2rem 误差精度修正

转转 App 的 px2rem 方案走的是常规的 px2rem 方案，root 上的`font-size`配置为了`document.clientWidth / 10`的值，rem 值的取值精度为两位小数。

在前端响应式配置设置为 iphone se（`375px`）的场景下，其页面实际渲染的值并非设计稿的一半。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCNjtf0jRc9xIy7wLL5Exlb0yWvW8x1rWotgHIDTdqyA1pOxPxMD4GRA/640?wx_fmt=png&from=appmsg#imgIndex=13)px2rem 误差

单个节点的场景误差尚可以用四舍五入的逻辑修正，但是在多数值拼接的场景下，误差可能会被放大，导致比对异常。因此需要对 px2rem 精度进行修正，以避免过多的误差出现。

*   **模块结构**
    

```
📦 css-hacker├─ main-hacker.ts      # 主流程编排├─ dom-parser.ts       # 解析页面样式表├─ css-fetcher.ts      # 获取 CSS 内容├─ css-modifier.ts     # 修改 CSS 内容├─ css-injector.ts     # 注入修改后的 CSS├─ convert-px2rem-deviation.ts  # rem 单位转换插件└─ types.ts            # 类型定义
```

*   核心流程![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCObomrhrm8JMr6Fd3WOpSU0sCia1HOnYsZJFGe6iakxm62MKBw5f7maHw/640?wx_fmt=png&from=appmsg#imgIndex=14)
    
*   **核心逻辑：**
    

通过 px2rem 逻辑，构建一个 1-2000 数值的哈希 Map，key 为 rem 的值，value 为原 px 值。

通过劫持页面 CSS 文件，用一个自定义的 postcss 插件，配合预配置的 Map，将 px 值反向映射为设计稿原值。

```
// 单例1-2000映射Mapclass PxConvertMapSingleton {privatestatic instance: PxConvertMapSingletonprivate convertMap: Map<number, number>privateconstructor() {    this.convertMap = this.generateConvertMap()  }publicstatic getInstance(): PxConvertMapSingleton {    if (!PxConvertMapSingleton.instance) {      PxConvertMapSingleton.instance = new PxConvertMapSingleton()    }    return PxConvertMapSingleton.instance  }private convertPx(originPxValue: number): number {    const originRemValue = originPxValue / 750 * 10    const remValue = Math.round(originRemValue * 100) / 100    returnMath.round(remValue * 37.5 * 1000) / 1000  }private generateConvertMap(): Map<number, number> {    const startValue = 1    const endValue = 2000    const entries = Array.from({ length: endValue - startValue + 1 }).map((_, index) => {      const curValue = index + startValue      if (curValue === 1) {        return [1, 1] asconst      }      return [this.convertPx(curValue), curValue] asconst    })    returnnew Map(entries)  }public getConvertMap(): Map<number, number> {    returnthis.convertMap  }}exportfunction getPxConvertMap(): Map<number, number> {return PxConvertMapSingleton.getInstance().getConvertMap()}
```

再通过设计稿数据处理方案转换成前端页面实际的 px 值，最终形成新的 css 样式表注入到 HTML 中。

```
const remRegex = /(\d+(?:\.\d+)?|\.\d+)rem/gi/** 处理CSS属性值中的rem单位，转换为px */exportfunction processRemInValue(value: string, baseFontSize: number): string {if (!value || !value.includes('rem')) {    return value  }const convertMap = getPxConvertMap()return value.replace(remRegex, (_match, remValue) => {    // rem值    const convertedRemValue = Number(remValue)    // 四舍五入取4位精度    const convertedPxValue = Math.round(convertedRemValue * baseFontSize * 10000) / 10000    const designValue = convertMap.get(convertedPxValue)    if (!designValue) {      return`${convertedRemValue}rem`    }    return`${convertDesignToPx(designValue)}px`  })}// post-css插件exportconst convertPx2RemDeviation: PluginCreator<Px2RemDeviationOptions> = (opts) => {const combinedOptions = { ...(opts || {}), ...defaultOptions }const { baseFontSize } = combinedOptionsreturn {    postcssPlugin: 'convert-px2rem-deviation',    Rule(rule: Rule) {      rule.walkDecls((decl: Declaration) => {        const value = decl.value        if (!value || !value.includes('rem')) {          return        }        const newValue = processRemInValue(value, baseFontSize)        decl.value = newValue      })    },  }}convertPx2RemDeviation.postcss = trueexportdefault convertPx2RemDeviation
```

*   **为什么不通过`computedStyle`进行反向映射？**
    
    原因在于`computedStyle`获取到的值无法通过 1-2000 的 Map 直接进行映射，比如一个`box-sizing:border-box`的 div 节点，需要面临三种场景：
    
    其整体判断逻辑复杂程度高，难以理清。所以采用 css 注入的方式从 css 文件层面去解决精度问题，是当前最优解。
    

*   如果其宽度是直接设置的，则需要拆解成`padding`、`border` 、`width`三部分分别进行映射。
    
*   如果其宽度是撑满父容器的，则需要受控于其父容器的宽度。
    
*   如果是被子节点撑开的，则又需要分别计算子节点的宽度进行组合。
    

Dom 节点与 UI 节点的匹配
----------------

节点匹配策略为一块较为独立且完整的模块，由于时间、人力等一些问题，目前的节点匹配方案为常规的 IOU 匹配方案，匹配准确率约为 40%~60% 左右，有较高的优化空间，并将在后续的开发中探索匹配层面的优化方案，以提高匹配率和检测准确度。

### 基本匹配策略

节点匹配算法采用**欧几里得距离计算**的方式，综合考虑节点的位置和尺寸信息：

*   **位置距离**：计算两个节点中心点的欧几里得距离
    
*   **尺寸距离**：计算两个节点宽高的欧几里得距离
    
*   **综合距离**：通过加权平均得到最终匹配分数
    

### 距离计算公式

```
// 位置距离计算const positionDistance = Math.sqrt(  (x - mgX)  2 + (y - mgY)  2)// 尺寸距离计算const sizeDistance = Math.sqrt(  (width - mgWidth)  2 + (height - mgHeight)  2)// 综合距离（位置权重 0.7，尺寸权重 0.3）const totalDistance = positionDistance  0.7 + sizeDistance  0.3
```

### 匹配阈值机制

*   **最大可接受距离**：MAX_ACCEPTABLE_DISTANCE = 100
    
*   只有当综合距离小于阈值时，才会被认为是有效匹配
    
*   在所有有效匹配中选择距离最小的作为最终匹配结果
    

### 算法流程

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCnGuG5ASLaLDp9aTibdzl1qZCpVyb2MicZDB4Na6ERulZ5zPY9KKmbgHw/640?wx_fmt=png&from=appmsg#imgIndex=15)匹配算法流程

部分区域 UI 比对逻辑
------------

上述的比对逻辑虽是比较通用的逻辑，但是在初版实现时，以全页面的比对逻辑为主。但是在实际业务开发过程中，对页面部分区域进行修改的需求数量是多余构建全新页面的需求数量的。因此部分区域比对逻辑是比较关键的一环。

这部分开发的重点在于如何快速简单地让用户选中需要比对的区域？

可以通过 chrome 插件中的 **devtools** 相关功能来实现。

### chrome 插件通信时序图

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN89zicAibzlv9JTCiaBaKrCvdCGMDT0o0icY155gGH8KRXBrFKZPgOdAicKdaeQwLpLBzhrQDIKzBlh4sQ/640?wx_fmt=png&from=appmsg#imgIndex=16)chrome 插件通信时序图

### 获取用户当前在 element 标签下选中的元素

主要通过 chrome 插件的`chrome.devtools.inspectedWindow.eval`方法实现。

```
function handleGetSelectedElement() {const getSelectorExpression = `      (function() {       // ...生成selector逻辑        // $0 是 DevTools 中当前选中的元素        return getElementSelector($0);      })()    `// 使用 chrome.devtools.inspectedWindow.eval 在页面上下文中执行  chrome.devtools.inspectedWindow.eval(    getSelectorExpression,    (result, exceptionInfo) => {      // 将获取到的selector发送给background      const responseMsg: ChromeListenerMessageType = {        type: ChromeMessageType.RETURN_ELEMENT_SELECTOR,        data: {          tabId: chrome.devtools.inspectedWindow.tabId,          selector: result,        },      }      backgroundPort?.postMessage(responseMsg)    },  )}
```

### 生成对应节点的 selector 逻辑

通过生成对应节点的 selector，将结果经由 background 层发送给`content_script`(插件主体)，在`content_script`中通过`document.querySelector(${selector})`重新获取到用户选中的节点。

```
function getElementSelector(element) {if (!element) {    returnnull  }// 如果是 document，返回 htmlif (element === document.documentElement) {    return'html'  }// 如果元素有 id，使用 idif (element.id) {    return`#${element.id}`  }// 构建 CSS Selectorconst path = []let current = elementwhile (current && current.nodeType === Node.ELEMENT_NODE) {    let selector = current.nodeName.toLowerCase()    // 添加类名（如果有）    if (current.className && typeof current.className === 'string') {      const classes = current.className.trim().split(/\\s+/).filter(c => c)      if (classes.length > 0) {        selector += `.${classes.join('.')}`      }    }    // 计算同级元素的位置（如果需要）    if (current.parentNode) {      const siblings = Array.from(current.parentNode.children).filter(        sibling => sibling.nodeName === current.nodeName,      )      if (siblings.length > 1) {        const index = siblings.indexOf(current) + 1        selector += `:nth-of-type(${index})`      }    }    path.unshift(selector)    current = current.parentNode    // 如果到达了有 id 的父元素，可以停止    if (current && current.id) {      path.unshift(`#${current.id}`)      break    }  }return path.join(' > ')}
```

写在最后
----

这套方案从最初的想法到现在的实现, 其实走了不少弯路。最开始我们也想过用图像识别, 毕竟看起来很 "AI" 很 "高级", 但实际跑下来发现根本不靠谱——设计稿改个文案、换个颜色, 算法就得重新训练。后来才想明白, 既然设计稿和 DOM 都是结构化数据, 为什么不直接对比结构呢?

整个方案的核心其实就做了一件事: 把两个看起来完全不同的东西 (设计稿的 JSON 和 HTML 的 DOM 树), 通过一系列归一化处理, 变成可以直接比对的同构数据。这个过程中最大的感受是, **前端开发和 UI 设计之间的 gap, 本质上是两套不同的渲染规则在互相较劲**。CSS 的 margin 折叠、行高计算、盒模型, 每一个细节都可能让设计稿 "看起来一样" 的两个元素在代码层面完全不同。

说实话, 当前 40%-60% 的匹配准确率还远谈不上完美, 但至少让我们看到了一个方向: 自动化 UI 走查的关键不在于追求百分百的准确, 而在于建立一套可量化、可追溯的比对标准。就像单元测试不能保证代码零 bug, 但能让我们对代码质量有个基本的信心。

更重要的是, 这套方案让我们重新思考了前端工程化的本质。过去我们总说要提效、要自动化, 但往往只盯着代码构建、打包部署这些环节。UI 还原度这件事一直是个 "玄学"——全凭开发的经验和责任心。现在我们把它量化了、标准化了, 这意味着整个研发流程可以往前再推一步: 不仅要保证代码能跑, 还要保证 UI 能过。

当然, 技术方案永远只是工具。真正能提升团队协作效率的, 是大家对质量的共识。这套自动化走查如果只是用来 "抓 bug", 那价值就太有限了。我更希望它能成为一面镜子, 让前端看到自己对设计的理解偏差, 让设计看到自己稿子的不规范之处, 最终推动双方在规范上达成更多共识。

技术的意义从来不在于解决所有问题, 而在于让问题变得可见、可量化、可改进。