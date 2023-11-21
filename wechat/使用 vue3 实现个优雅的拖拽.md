> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vQwCAnQLmuNVPhYKvUGObQ)

### 前置知识

#### vue2 中常用的复用的方式

*   mixin（混入）
    
*   HOC
    
*   Renderless (Scoped Slots)
    

#### vue3 中的常用复用方式

*   Composition API
    
*   自定义指令
    
*   Plugins
    

### 需求介绍

要求实现个可复用的拖拽逻辑，用户可以方便的使用，可拖拽，可设置边界。

### 技术选型

条条大路通罗马，我们有很多种方式来实现这个功能，本次选用 vue3 组合式 API 的写法，主要原因是我这种方式写的少，想练练；次要原因是这种方式较为优雅，可以按需引入，tree Sharking 也很方便。

### 实现分析

首先需要考虑的是坐标系与拖动的坐标点取哪个点？ 坐标系这里可以简单的使用网页的坐标，left 作为 x 轴的数值， right 作为 Y 轴的数值。 拖动的坐标点就取元素的左上角的点，也方便定位 因为是左上角的点的话，取值的时候就不能取事件的 MouseEvent: clientX 与 MouseEvent: clientY 直接作为坐标，不然就要求用户点击的时候只能点击左上角，不然一赋值，会导致元素直接偏移，体验就很差。这块我的解决方案是计算出来两者的差值，每次赋值的时候，将取出来的 clientX 与 clientY 加上差值，就得到了左上角的坐标 其次看可拖拽这个点

拖拽的事件必定是从元素上开始的，然后考虑到会拖着移动，所以移动事件与结束事件应该是绑定在外层的限制元素上

最后看可设置边界这个点 简单的想个理想模型，左上角的点坐标应该大于等于限制范围的左上角坐标，右下角的点坐标应该小于等于限制范围的右下角的坐标。考虑到实际情况，可能存在限制范围小于拖拽元素的情况，这里如果出现这种情况，对他的处理就是将坐标设为左上角（尽可能覆盖限制范围）。 这边考虑到用户体验，打算支持 2 种输入，一种是符合直觉的直接传入坐标的范围（minX,miny,maxX,maxY），另一种 DX 友好的方式是直接传入范围对应的元素，直接在内部计算出来范围，并且监听对应的范围变化，来作为限制。

### 具体实现

1、求取鼠标点击点与左上角点的差值

```
// target 是指待移动的元素  const start = (e: PointerEvent) => {    const rect = target.value!.getBoundingClientRect();    // 记录下点击的位置与左上角的偏差    const pos = {      x: e.clientX - rect.left,      y: e.clientY - rect.top,    }    // 记下本次的偏差值    pressedDelta.value = pos;  }
```

**「`Element.getBoundingClientRect()`」** 方法返回一个 `DOMRect` 对象，其提供了元素的大小及其相对于视口的位置。

2、实现移动

```
// target 是指待移动的元素 draggingElement 是指外层的事件// 移动开始  const start = (e: PointerEvent) => {    const rect = target.value!.getBoundingClientRect();    // 记录下点击的位置与左上角的偏差    const pos = {      x: e.clientX - rect.left,      y: e.clientY - rect.top,    }    pressedDelta.value = pos;  }  // 移动事件  const move = (e: PointerEvent) => {    // 如果没点击开始则不触发    if (!pressedDelta.value) {      return;    }    let { x, y } = position.value;    // 鼠标移动到的位置减去偏差    if (axis === 'x' || axis === 'both') {      x = e.clientX - pressedDelta.value.x;    }    if (axis === 'y' || axis === 'both') {      y = e.clientY - pressedDelta.value.y;    }    position.value = limitArea({ x, y });  }  // 移动结束  const end = (e: PointerEvent) => {    if (!pressedDelta.value) {      return    }    pressedDelta.value = undefined;  }onMounted( ()=>{  target.value!.addEventListener("pointerdown", start);  draggingElement!.addEventListener("pointermove", move);  draggingElement!.addEventListener("pointerup", end); })
```

3、处理限制区域

```
// 要求不超过边界  const limitArea = ({ x = position.value.x, y = position.value.y }: { x: number, y: number } = position.value) => {    if (x < areaLimit.value.startX) {      x = areaLimit.value.startX;    }    if (x > areaLimit.value.endX - size.value.width) {      x = areaLimit.value.endX - size.value.width;    }    if (y < areaLimit.value.startY) {      y = areaLimit.value.startY;    }    if (y > areaLimit.value.endY - size.value.height) {      y = areaLimit.value.endY - size.value.height;    }    // 如果元素小于限制区域 将元素移动到左上角    if(areaLimit.value.endY - areaLimit.value.startY < size.value.height){      y = areaLimit.value.startY    }    if(areaLimit.value.endX - areaLimit.value.startX < size.value.width){      x = areaLimit.value.startX    }    return {      x, y    }  }
```

4、监听输入的限制元素的变化

```
let mo: MutationObserver; let re: ResizeObserver;  // 更新相对位置  const initWatch = () => {    const limitdiv = unref(limitDOM) ? unref(limitDOM) : document.getElementById("app")    const callback = () => {      const { left, right, top, bottom } = limitdiv!.getBoundingClientRect()      areaLimit.value = {        startX: left,        startY: top,        endX: right,        endY: bottom,      }      position.value = limitArea();    };    if (limitdiv) {      mo = new MutationObserver(callback);      mo.observe(limitdiv, {        attributes: true,      });      re = new ResizeObserver(callback)      re.observe(limitdiv)      callback();    }  }  onMounted(    () => {      initWatch()    }  )// 凡事有开始就有结束，别忘记处理  onBeforeUnmount(    () => {      if (mo) {        mo?.disconnect()      }      if (re) {        re?.disconnect()      }    }  )
```

上面的使用 观察者 的这种方式性能会比较好点，当然可能有漏掉的情况，我这边时间原因没有怎么测试，但思路都是这样的。

最后来看下整体的效果                         

![](https://mmbiz.qpic.cn/mmbiz_gif/eMDAiasn5EQIB4iazkT8OiamT0bjGuqMo3HjYFJ6hnkxexWNytibZZW0hZuev46FvucHBSp4r9ghM1nvia2tm2tk2oA/640?wx_fmt=gif)

drag 例子动图

以上是所有的代码（供参考）

```
import { ref, onMounted, computed, unref, onBeforeUnmount } from "vue";import type { Ref } from "vue";  export const defaultWindow = /*#__PURE__*/ window;      interface useDragOption {  draggingElement?: any,  draggingHandle?: any,  initialValue?: any,  axis?: 'x' | 'y' | 'both',  limitDOM?: Ref<HTMLElement | null | undefined>,}    // Composablesconst useDrag = (target: Ref<HTMLElement | null>, options: useDragOption) => {  const {    draggingElement = defaultWindow,    draggingHandle = target,    initialValue,    axis = 'both',    limitDOM,  } = options;    const position = ref(    initialValue ?? { x: 0, y: 0 },  )    const size = computed(    () => {      return {        width: target?.value?.offsetWidth || 0,        height: target?.value?.offsetHeight || 0,      }    }  )        // 移动的变化  const pressedDelta = ref();    onMounted(    () => {      // 判断是否有target      if (!unref(target)) {        console.warn("drag目标元素不存在，请检查！");        return;      }      // 注册事件 此处可以搞个整体的事件,来提高一些性能,累了毁灭吧      target.value!.addEventListener("pointerdown", start);      draggingElement!.addEventListener("pointermove", move);      draggingElement!.addEventListener("pointerup", end);      }  )    onBeforeUnmount(    () => {      // 判断是否有target      if (unref(target)) {        // 取消事件        target.value!.removeEventListener("pointerdown", start);        draggingElement!.removeEventListener("pointermove", move);        draggingElement!.removeEventListener("pointerup", end);      }    }  )      // 移动开始  const start = (e: PointerEvent) => {    const rect = target.value!.getBoundingClientRect();    // 记录下点击的位置与左上角的偏差    const pos = {      x: e.clientX - rect.left,      y: e.clientY - rect.top,    }    pressedDelta.value = pos;  }    // 移动事件  const move = (e: PointerEvent) => {    // 如果没点击开始则不触发    if (!pressedDelta.value) {      return;    }    let { x, y } = position.value;    // 鼠标移动到的位置减去偏差    if (axis === 'x' || axis === 'both') {      x = e.clientX - pressedDelta.value.x;    }    if (axis === 'y' || axis === 'both') {      y = e.clientY - pressedDelta.value.y;    }    position.value = limitArea({ x, y });  }    // 移动结束  const end = (e: PointerEvent) => {    if (!pressedDelta.value) {      return    }    pressedDelta.value = undefined;  }    // 要求不超过边界  const limitArea = ({ x = position.value.x, y = position.value.y }: { x: number, y: number } = position.value) => {    if (x < areaLimit.value.startX) {      x = areaLimit.value.startX;    }    if (x > areaLimit.value.endX - size.value.width) {      x = areaLimit.value.endX - size.value.width;    }    if (y < areaLimit.value.startY) {      y = areaLimit.value.startY;    }    if (y > areaLimit.value.endY - size.value.height) {      y = areaLimit.value.endY - size.value.height;    }        // 如果元素小于限制区域 将元素移动到左上角    if(areaLimit.value.endY - areaLimit.value.startY < size.value.height){      y = areaLimit.value.startY    }    if(areaLimit.value.endX - areaLimit.value.startX < size.value.width){      x = areaLimit.value.startX    }      return {      x, y    }  }        // 计算div的返回限制范围    const areaLimit = ref(    {      startX: 0,      startY: 0,      endX: 500,      endY: 500,    }  )  let mo: MutationObserver;  let re: ResizeObserver;  // 更新相对位置  const initWatch = () => {    const limitdiv = unref(limitDOM) ? unref(limitDOM) : document.getElementById("app")    const callback = () => {      const { left, right, top, bottom } = limitdiv!.getBoundingClientRect()      areaLimit.value = {        startX: left,        startY: top,        endX: right,        endY: bottom,      }      position.value = limitArea();    };    if (limitdiv) {      mo = new MutationObserver(callback);      mo.observe(limitdiv, {        attributes: true,      });      re = new ResizeObserver(callback)      re.observe(limitdiv)      callback();    }        }  onMounted(    () => {      initWatch()    }  )  onBeforeUnmount(    () => {      if (mo) {        mo?.disconnect()      }      if (re) {        re?.disconnect()      }    }  )        return {    draggingHandle,    x: computed(() => position.value.x),    y: computed(() => position.value.y),    position,    isDragging: computed(() => !!pressedDelta.value),    style: computed(      () => `left:${position.value.x}px;top:${position.value.y}px;`,    )  }}export { useDrag }
```

```
<script setup lang="ts">

import { shallowRef } from "vue";

import { useDrag } from "./use/drag"

  

const el = shallowRef()

const limit = shallowRef()

const { x, y, isDragging, style } = useDrag(el, { limitDOM: limit })

  

</script>

  

<template>

  <div>

    <div ref="limit" style="height:500px;width:100%;border: 1px solid yellow;">

      我是限制框

    </div>

    <div></div>

    <div ref="el" :style="style" style="position: fixed;border: 1px solid red;">

      <div style="width:100px;height:100px;">

        x:{{ x }}

        y:{{ y }}

        isDragging:{{ isDragging }}

      </div>

  

    </div>

  </div>

</template>

  

<style scoped></style>
```