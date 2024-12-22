> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/XvF8DWSsaw7bN2TcgdRt5w)

最近有个需求需要实现自定义首页布局，需要将屏幕按照 6 列 4 行进行等分成多个格子，然后将组件可拖拽对应格子进行渲染展示。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2j3ibpWuEbic7WaZCAWhtjaaUUic3xqyRyFn8c8ibceEDrpotS1ypqOibseBw/640?wx_fmt=png&from=appmsg)

对比一些已有的插件，发现想要实现产品的交互效果，没有现成可用的。本身功能并不是太过复杂，于是决定自己基于 vue 手撸一个简易的 Grid 拖拽布局。

完整源码在此，在线体验

概况
--

需要实现 Grid 拖拽布局，主要了解这两个东西就行

*   拖放 API，关于拖放 API 介绍文章有很多 ，可以直接看 MDN 里拖放 API 介绍，可以说很详细了。
    
*   Grid 布局， Grid 布局与 Flex 布局很相似，但是 Grid 像是二维布局，Flex 则为一维布局，Grid 布局远比 Flex 布局强大。MDN 关于网格布局介绍
    

需要实现主要包含：

*   组件物料栏拖拽到布局容器
    
*   布局容器 Grid 布局
    
*   放置时是否重叠判断
    
*   拖拽时样式
    
*   放置后样式
    
*   容器内二次拖拽
    

拖放操作实现
------

拖拽中主要使用到的事件如下

*   被拖拽元素事件：
    

<table data-tool="markdown.com.cn编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px;">事件</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px;">触发时刻</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">dragstart</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当用户开始拖拽一个元素或选中的文本时触发。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">drag</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当拖拽元素或选中的文本时触发。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">dragend</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当拖拽操作结束时触发</td></tr></tbody></table>

*   放置容器事件：
    

<table data-tool="markdown.com.cn编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px;">事件</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px;">触发时刻</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">dragenter</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当拖拽元素或选中的文本到一个可释放目标时触发。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">dragleave</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当拖拽元素或选中的文本离开一个可释放目标时触发。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">dragover</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当元素或选中的文本被拖到一个可释放目标上时触发。</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">drop</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">当元素或选中的文本在可释放目标上被释放时触发。</td></tr></tbody></table>

### 可拖拽元素

让一个元素能够拖拽只需要给元素设置 **「draggable="true"」** 即可拖拽，拖拽事件 API 提供了 **「DataTransfer」** 对象，可以用于设置拖拽数据信息，但是仅仅只能 **「drop」** 事件中获取到，但是我们需要在拖拽中就需要获取到拖拽信息，用来显示拖拽时样式，所以需要我们自己存储起来，以便读取。

需要处理主要是，在拖拽时将 将当前元素信息设置到 **「dragStore」** 中，结束时清空当前信息

```
<script setup lang="ts">  import { dragStore } from "./drag";  const props = defineProps<{    data: DragItem;    groupName?: string;  }>();  const onDragstart = (e) => dragStore.set(props.groupName, { ...props.data });  const onDragend = () => dragStore.remove(props.groupName);</script><template>  <div class="drag-item__el" draggable="true" @dragstart="onDragstart" @dragend="onDragend"></div></template>
```

封装一个存储方法，然后通过配置相同 key ，可以在同时存在多个放置区域时候，区分开来。

```
class DragStore<T extends DragItemData> {  moveItem = new Map<string, DragItemData>();  set(key: string, data: T) {    this.moveItem.set(key, data);  }  remove(key: string) {    this.moveItem.delete(key);  }  get(key: string): undefined | DragItemData {    return this.moveItem.get(key);  }}
```

### 可放置区域

首先时需要告诉浏览器当前区域是可以放置的，只需要在元素监听 **「dragenter」**、**「dragleave」**、**「dragover」** 事件即可，然后通过 **「preventDefault」** 来阻止浏览器默认行为。可以在这三个事件中处理判断当前位置是否可以放置等等。

示例：

```
<script setup lang="ts">  // 进入放置目标  const onDragenter = (e) => {    e.preventDefault();  };  // 在目标中移动  const onDragover = (e) => {    e.preventDefault();  };  // 离开目标  const onDragleave = (e) => {    e.preventDefault();  };</script><template>  <div @dragenter="onDragenter($event)" @dragover="onDragover($event)" @dragleave="onDragleave($event)" @drop="onDrop($event)"></div></template>
```

上面的代码已经可以让，元素可以拖拽，然后当元素拖到可防止区域时候，可以看到鼠标样式会变为可放置样式了。

Grid 布局
-------

我们是需要进行 Grid 拖拽布局，所以先对上面放置容器进行改造，首先就是需要将容器进行格子划分区域显示。

### 计算 Grid 格子大小

我这里直接使用了 **「@vueuse/core」** 的 **「useElementSize」** 的 hooks 去获取容器元素大小变动，也可以自己通过 **「ResizeObserver」** 去监听元素变动，然后根据设置列数、行数、间隔去计算单个格子大小。

```
import { useElementSize } from "@vueuse/core";/** * 容器等分尺寸 * @param {*} target 容器 HTML * @param {*} column 列数 * @param {*} row 行数 * @param {*} gap 间隔 * @returns */export const useBoxSize = (target: Ref<HTMLElement | undefined>, column: number, row: number, gap: number) => {  const { width, height } = useElementSize(target);  return computed(() => ({    width: (width.value - (column - 1) * gap) / column,    height: (height.value - (row - 1) * gap) / row,  }));};
```

### 设置 Grid 样式

根据列数和行数循环生成格子数，**「rowCount」**、**「columnCount」**为行数和列数。

```
<div class="drop-content__drop-container" @dragenter="onDragenter($event)" @dragover="onDragover($event)" @dragleave="onDragleave($event)" @drop="onDrop($event)">  <template v-for="x in rowCount">    <div class="bg-column" v-for="y in columnCount" :key="`${x}-${y}`"></div>  </template></div>
```

设置 Grid 样式，下面变量中 **「gap」** 为格子间隔，**「repeat」** 是 Grid 用来重复设置相同值的，**「grid-template-columns: repeat(2,100px)」** 等效于 **「grid-template-columns: 100px 100px」**。因为我们只需在容器里监听拖拽放置事件，所以我们还需要将 所有的 **「bg-column」** 事件去掉，设置 **「pointer-events: none」** 即可。

```
.drop-content__drop-container {
  display: grid;
  row-gap: v-bind("gap+'px'");
  column-gap: v-bind("gap+'px'");
  grid-template-columns: repeat(v-bind("columnCount"), v-bind("boxSize.width+'px'"));
  grid-template-rows: repeat(v-bind("rowCount"), v-bind("boxSize.height+'px'"));
  .bg-column {
    background-color: #fff;
    border-radius: 6px;
    pointer-events: none;
  }
}
```

效果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2jYFRs05pA4iaCeMgRUYjzO3vJznrzFfIEcpzVUNnIlKV1JvFwM0fgkbQ/640?wx_fmt=png&from=appmsg)

放置元素
----

放置元素时我们需要先计算出元素在 Grid 位置信息等，这样才知道元素应该放置那哪个地方。

### 拖拽位置计算

当元素拖拽进容器中时，我们可以通过 **「offsetX」**、**「offsetY」**两个数据获取当前鼠标距离容器左上角位置距离，我们可以根据这两个值计算出对应的在 Grid 中做坐标。

计算方式：

```
// 计算 x 坐标const getX = (num) => parseInt(num / (boxSizeWidth + gap));// 计算 y 坐标const getY = (num) => parseInt(num / (boxSizeHeight + gap));
```

需要注意的是上面计算坐标是 0,0 开始的，而 Grid 是 1,1 开始的。

### 获取拖拽信息

我们在进入容器时，通过上面封装 **「dragData」** 来获取当前拖拽元素信息，获取它尺寸信息等等。

```
// 拖拽中的元素const current = reactive({  show: <boolean>false,  id: <undefined | number>undefined,  column: <number>0, // 宽  row: <number>0, // 高  x: <number>0, // 列  y: <number>0, // 行});// 进入放置目标const onDragenter = (e) => {  e.preventDefault();  const dragData = dragStore.get(props.groupName);  if (dragData) {    current.column = dragData.column;    current.row = dragData.row;    current.x = getX(e.offsetX);    current.y = getY(e.offsetY);    current.show = true;  }};// 在目标中移动const onDragover = (e) => {  e.preventDefault();  const dragData = dragStore.get(props.groupName);  if (dragData) {    current.x = getX(e.offsetX);    current.y = getY(e.offsetY);  }};const onDragleave = (e) => {  e.preventDefault();  current.show = false;  current.id = undefined;};
```

在 drop 事件中，我们将当前拖拽元素存放起来，list 会存放每一次拖拽进来元素信息。

```
const list = ref([]);// 放置在目标上const onDrop = async (e) => {  e.preventDefault();  current.show = false;  const item = dragStore.get(props.groupName);  list.value.push({    ...item,    x: current.x,    y: current.y,    id: new Date().getTime(),  });};
```

### 计算碰撞

在上面还需要计算当前拖拽的位置是否可以放置，需要处理是否包含在容器内，是否与其他已放置元素存在重叠等等。

#### 计算是否在容器内

这个是比较好计算的，只需要当前拖拽位置左上角坐标 >= 容器左上角的坐标，然后右下角的坐标 <= 容器的右下角的坐标，就是在容器内的。

代码实现：

```
/** * 判断是否在当前四边形内 * @param {*} p1 父容器 * @param {*} p2 *  对应是 左上角坐标 和 右下角坐标 *  [0,0,1,1]  => 左上角坐标 0,0  右下角 1,1 */export const booleanWithin = (p1: [number, number, number, number], p2: [number, number, number, number]) => {  return p1[0] <= p2[0] && p1[1] <= p2[1] && p1[2] >= p2[2] && p1[3] >= p2[3];};
```

#### 计算是否与现有的相交

两个矩形相交情况有很多种，计算比较麻烦，但是我们可以计算他们不相交，然后在取反方式判断是否相交。

不相交情况只有四种，假设有 p1、p2 连个矩形，它们不相交的情况只有四种：

*   p1 在 p2 左边
    
*   p1 在 p2 右边
    
*   p1 在 p2 上边
    
*   p1 在 p2 下边
    

代码实现：

```
/** * 判断是两四边形是否相交 * @param {*} p1 父容器 * @param {*} p2 *  对应是 左上角坐标 和 右下角坐标 *  [0,0,1,1]  => 左上角坐标 0,0  右下角 1,1 */export const booleanIntersects = (p1: [number, number, number, number], p2: [number, number, number, number]) => {  return !(p1[2] <= p2[0] || p2[2] <= p1[0] || p1[3] <= p2[1] || p2[3] <= p1[1]);};
```

### 在放置前判断

可以通过计算属性去计算，在后面拖拽中处理样式也可以用到。修改 **「drop」** 中方法，然后在 **「drop」** 中根据 **「isPutDown」** 是否有效。

```
// 是否可以放置const isPutDown = computed(() => {  const currentXy = [current.x, current.y, current.x + current.column, current.y + current.row];  return (    booleanWithin([0, 0, columnCount.value, rowCount.value], currentXy) && //    list.value.every((item) => item.id === current.id || !booleanIntersects([item.x, item.y, item.x + item.column, item.y + item.row], currentXy))  );});
```

拖拽时样式
-----

上处理了基本拖放数据处理逻辑，为了更好的交互，我们可以在拖拽中显示元素预占位信息，更加直观的显示元素占位大小，类似这样：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2juLHjASTawpLQZRRlC8es75HLQ9UCGAfaNdibyZA6ficnuTr0ibRmx4JbQ/640?wx_fmt=png&from=appmsg)

我们可以根据上面 **「current」** 中信息去计算大小信息，还可以根据 **「isPutDown」** 去判断当前位置是否可以放置，用来显示不同交互效果。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2jW2g4dLrTMOyjSTPEUufgJT5iaOswFKQNzPeYGnIZHdW0V4RnGqTNX3Q/640?wx_fmt=png&from=appmsg)

可以直接通过 Grid 的 grid-area 属性，快速计算出放置位置信息，应为我们上面计算的 x 、y 是从 0 开始的，所以这里需要 +1。

```
grid-area: `${y + 1} / ${x + 1} / ${y + row + 1}/ ${ x + column + 1 }`
```

预览容器
----

在元素放置后，我们还需要根据 list 中数据，生成元素占位样式处理，我们可以拖拽容器上层在放置一个容器，专门用来显示放置后的样式，也是可以直接使用 Grid 布局去处理。

### 预览样式

样式基本上和 **「drop-container」** 样式抱持一致即可，需要注意的时需要为预览容器设置 **「pointer-events: none」**，避免遮挡了 **「drop-container」** 事件监听。

```
.drop-content__preview,
.drop-content__drop-container {
  // ...
}
```

每个元素位置信息计算方式，基本和拖拽时样式计算方式一致，直接通过 **「grid-area」** 去布局就可以了。

```
grid-area: `${y + 1} / ${x + 1} / ${y + row + 1}/ ${ x + column + 1 }`
```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2jou0A1TJzhTLWAEhPrnCYNQiaDFaXjjdNZicO3miajyV2vlxGMZynsTdww/640?wx_fmt=png&from=appmsg)

### 二次拖拽

当元素拖拽进来后，我们还需要对放置的元素支持继续拖拽。因为上面我们将预览事件通过 **「pointer-events」** 去除了，所以我们需要给每个子元素都加上去。然后给子元素添加 **「draggable=true」**，然后处理拖拽事件，基本上和上面处理方式一样，在 **「dragstart」**、**「dragend」** 处理拖拽元素信息。

然后我们还需在 **「onDrop」** 进行一番修改，如果是二次拖拽时只需要修改坐标信息，修改原 **「onDrop」** 处理方式：

```
if (item.id) {  item.x = current.x;  item.y = current.y;} else {  list.value.push({    ...item,    x: current.x,    y: current.y,    id: new Date().getTime(),  });}
```

### 位置偏移优化

当你对元素二次拖拽时，会发现元素会存在偏移问。比如你放置了一个 1x2 元素后，当你从下面拖拽，你会发现拖拽中的占位样式和你拖拽元素位置存在偏差。

效果如下图

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibsOtOYPsiaRfyh2x8AgKlw2jjTUNhvpH9Y7A0bNI6fgicrQE6OQMicbDmibCDzbtGLDF6VKQoty6ebIicg/640?wx_fmt=png&from=appmsg)

出现这情况应为上面我们时根据鼠标位置为左上角进行计算的，所以会存在这种偏差问题，我们可在拖拽前计算出偏移量来校正位置。

我们可以在二次拖拽时，获取到鼠标在当前元素内位置信息

```
const onDragstart = (e) => {  const data = props.data;  data.offsetX = e.offsetX;  data.offsetY = e.offsetY;  dragStore.set(props.groupName, data);};
```

在 **「drop-container」** 内计算 x、y 值时候减去偏移量，对 **「onDragenter」**、**「onDragover」** 进行如下调整修改

```
current.x = getX(e.offsetX) - getX(dragData?.offsetX ?? 0);current.y = getY(e.offsetY) - getY(dragData?.offsetY ?? 0);
```

### 拖拽元素优化

因为上面我们将预览元素添加了 **「pointer-events: all」**，所以在我们拖拽到现有元素上时，会挡住 **「drop-container」** 事件的触发，在二次拖拽时，比如将一个 2x2 元素我们需要往下移动一格时，会发现也会被自己挡住。

*   预览元素遮挡问题，可以在拖拽时将其他元素都设置为 **「none」**，二次拖拽时要做自己设置为 **「all」** 否则会无法拖拽
    

```
:style="{ pointerEvents: current.show && item.id !== current.id ? 'none' : 'all' }"`
```

*   二次拖拽时自己位置遮挡问题 我们可以在拖拽时增加标识，将自己通过 **「transform」** 移除到多拽容器外去
    

```
moveing.value  ? {      opacity: 0,      transform: `translate(-999999999px, -9999999999px)`,    }  : {};
```

结语
--

到目前为止基本上的 Grid 拖拽布局大致实现了，已经满足基本业务需求了，当然有需要朋友还可以在上面增加支持拖拉调整大小、碰撞后自动调整位置等等。

完整源码在此，在线体验：https://stackblitz.com/edit/vitejs-vite-rkwugn?file=README.md

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2023 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！