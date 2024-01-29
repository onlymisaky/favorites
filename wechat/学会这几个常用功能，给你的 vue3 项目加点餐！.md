> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/66cRcVgW5Xh1a-22uJ80Cg)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言
--

本文主要分享一下在使用 vue3 开发项目时的一些常用功能

一、自动注册全局组件
----------

自动注册 components 目录下所有 vue 组件并以组件的文件名为组件的名称

```
// components/index.ts

import { type App, defineAsyncComponent } from 'vue'
const components = Object.entries(import.meta.glob('./**/*.vue'))
const preFix = 'Es'
export default {
  // use 的时候
  install: (app: App) => {
    components.forEach(([key, comp]) => {
      // 得到组件的名称
      const name = getCompName(comp.name || key)
      app.component(preFix + name, defineAsyncComponent(comp as any))
    })
  }
}

function getCompName(key: string) {
  const nameReg = //(\w+).vue/
  return nameReg.test(key) ? key.match(nameReg)![1] : key
}


```

1.  使用 `import.meta.glob` 动态导入所有以 `.vue` 结尾的文件，并将它们作为键值对的形式存储在 `components` 变量中。
    
2.  在 `install` 方法中，通过遍历 `components` 数组，对每个组件进行注册
    
3.  通过 `comp.name` 获取组件的名称，如果名称不存在，则使用组件的路径 key。然后，使用 `defineAsyncComponent` 将组件定义为异步组件
    
4.  `getCompName` 函数用于从组件路径中提取组件的名称。使用正则对组件路径进行匹配，提取出路径中最后一个斜杠后的单词作为组件名称
    

使用这个插件

```
import { createApp } from 'vue'
import App from './App.vue'

import MyComponents from './components'

createApp(App).use(MyComponents).mount('#app')


```

自动注册全局组件虽然很方便，但在使用时缺少了 ts 类型提示，下面介绍一下为全局组件添加类型提示

### 为全局组件添加类型提示

这需要我们自己编写. d.ts 声明文件

```
// src/typings/component.d.ts
export {}

declare module 'vue' {
  export interface GlobalComponents {
    EsDialog: typeof import('../components/Dialog.vue')['default']
  }
}


```

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiaqAocWKmjzP6SAzaJuMib7EOr7weSSibKbJVR6klzUowEYanohsKlOIlSicibR9QecKOgvRia0ujgBpog/640?wx_fmt=other)01.png

二、函数式图片预览
---------

图片预览是一个比较常用的功能，封装成函数调用可以简化我们使用的方式

基于 element-plus 的 ElImageViewer 组件

对于有类似的功能都可以使用这种方式，例如我们想使用函数调用的方式弹窗

```
// utils/preview.ts
import { createVNode, render } from 'vue'
import { ElImageViewer, ImageViewerProps } from 'element-plus'

type PreviewOption = Partial<ImageViewerProps>

export function preview(option: PreviewOption) {
  const container = document.createElement('div')
  let vm = createVNode(ElImageViewer, {
    ...option,
    onClose() {
      render(null, container)
    }
  })

  // 将组件渲染成真实节点
  render(vm, container)
  document.body.appendChild(container.firstElementChild!)
}


```

1.  preview 函数接受一个 option 参数，它是 PreviewOption(ImageViewerProps 类型的部分可选类型) 类型的对象，用于配置图片预览的选项。
    
2.  函数内部，首先创建了一个 div 元素作为容器，用于渲染预览组件。
    
3.  使用 createVNode 创建了一个 ElImageViewer 组件实例 vm
    
4.  使用 render 方法将 vm 渲染为真实的节点，并将其挂载到之前创建的容器中，最后添加到 body 页面上
    
5.  传入的 props 中 监听 close 事件移除节点
    

调用

```
preview({
  urlList: ['https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg'],
  initialIndex: 0
})


```

四、手动封装 svgIcon 组件
-----------------

这节主要是 vangle 组件库的 icon 组件封装方式的介绍，为想自己手动封装 svgIcon 组件的朋友可以作个参考

以下下是代码实现

*   `Icon.vue`
    

```
<template>
  <i class="es-icon" :style="style" v-html="icon"></i>
</template>

<script lang="ts" setup>
import { computed, CSSProperties } from 'vue'
import { IconProps, getIcon } from './icon'

const props = defineProps(IconProps)

const icon = computed(() => getIcon(props.name))
const style = computed<CSSProperties>(() => {
  if (!props.size && !props.color) return {}

  return {
    fontSize: typeof props.size === 'string' ? props.size : `${props.size}px`,
    '--color': props.color,
  }
})
</script>

<style scoped lang="scss">
.es-icon {
  --color: inherit;
  height: 1em;
  width: 1em;
  line-height: 1em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  fill: currentColor;
  color: var(--color);
  font-size: inherit;
  font-style: normal;
  svg {
    height: 1em;
    width: 1em;
  }
}
</style>


```

*   以下是 getIcon 的实现 `icon.ts`
    

```
export const svgs = import.meta.glob('./svg/*.svg', { eager: true, as: 'raw' })
export const IconProps = {
  name: String,
  color: String,
  size: [String, Number]
}

export const getIcon = (name?: string) => {
  if (!name) return ''
  return svgs[`./svg/${name}.svg`]
}


```

使用 import.meta.glob 动态导入 svg 目录下所有以 .svg 结尾的文件，`as: 'raw'` 表示导入的文件内容以原始字符串形式保存

getIcon 根据 name 获取 svg 的内容

*   直接使用
    

```
<es-icon  />
<es-icon  />
<es-icon  />


```

五、封装拖拽钩子函数
----------

```
import { onBeforeUnmount, onMounted, watchEffect, Ref } from 'vue'

export const useDraggable = (
  targetRef: Ref<HTMLElement | undefined>,
  dragRef: Ref<HTMLElement | undefined>,
  draggable: Ref<boolean>
) => {
  // 保存偏移量
  let transform = {
    offsetX: 0,
    offsetY: 0,
  }

  const onMousedown = (e: MouseEvent) => {
    const downX = e.clientX
    const downY = e.clientY
    const { offsetX, offsetY } = transform

    // 获取拖拽目标的位置和尺寸信息
    const targetRect = targetRef.value!.getBoundingClientRect()
    const targetTop = targetRect.top
    const targetWidth = targetRect.width
    const targetHeight = targetRect.height

     // 计算拖拽目标在页面中的可移动范围
    const clientWidth = document.documentElement.clientWidth
    const clientHeight = document.documentElement.clientHeight

    const minLeft = -targetRect.left + offsetX
    const minTop = -targetTop + offsetY
    const maxLeft = clientWidth - targetRect.left - targetWidth + offsetX
    const maxTop = clientHeight - targetTop - targetHeight + offsetY

    const onMousemove = (e: MouseEvent) => {
      // 计算移动后的位置
      /**
       * offsetX + e.clientX - downX: 初始偏移量 offsetX 加上 e.clientX - downX 移动的距离得到拖拽元素在水平方向上的新位置。
       * Math.max(offsetX + e.clientX - downX, minLeft) 确保新位置大于等于最小可移动位置 minLeft，即不超出左边界
       * Math.min(..., maxLeft) 确保新位置小于等于最大可移动位置 maxLeft，即不超出右边界。这样做的目的是防止拖拽元素移出指定的范围。
       */
      const moveX = Math.min(
        Math.max(offsetX + e.clientX - downX, minLeft),
        maxLeft
      )

      // 和上面同理
      const moveY = Math.min(
        Math.max(offsetY + e.clientY - downY, minTop),
        maxTop
      )
      
      // 更新偏移量和元素位置
      transform = {
        offsetX: moveX,
        offsetY: moveY,
      }
      targetRef.value!.style.transform = `translate(${moveX}px, ${moveY}px)`
    }

    const onMouseup = () => {
      // 移除事件监听
      document.removeEventListener('mousemove', onMousemove)
      document.removeEventListener('mouseup', onMouseup)
    }

    // 监听鼠标移动和鼠标抬起事件
    document.addEventListener('mousemove', onMousemove)
    document.addEventListener('mouseup', onMouseup)
  }

  const onDraggable = () => {
    if (dragRef.value && targetRef.value) {
      dragRef.value.addEventListener('mousedown', onMousedown)
    }
  }

  const offDraggable = () => {
    if (dragRef.value && targetRef.value) {
      dragRef.value.removeEventListener('mousedown', onMousedown)
    }
  }

  onMounted(() => {
    watchEffect(() => {
      if (draggable.value) {
        onDraggable()
      } else {
        offDraggable()
      }
    })
  })

  onBeforeUnmount(() => {
    offDraggable()
  })
}


```

`useDraggable` 的函数，接受三个参数：

`targetRef`：拖拽目标 Ref `dragRef`：拖拽触发区域 Ref `draggable`: 开启 / 关闭拖拽

在函数内部定义了一个变量 transform，用于保存拖拽过程中的偏移量。

1.  在 onMousedown 函数中，首先记录下鼠标按下时的坐标 downX 和 downY，以及当前的偏移量 offsetX 和 offsetY
    
2.  获取拖拽目标元素的位置和尺寸信息，计算出拖拽目标在页面中可移动的范围。
    
3.  移动时 `onMousemove` 中，根据鼠标移动的位置计算出新的偏移量 moveX 和 moveY，并更新 transform 对象和拖拽目标元素的位置
    
4.  最后，定义了一个 onMouseup 函数，当鼠标抬起时执行的事件处理函数。在函数内部，移除鼠标移动和鼠标抬起事件的监听。
    

六、vscode 中 vue3 代码片段
--------------------

针对 Vue 3.2+ 的代码片段模板，用于在 VSCode 中快速生成 Vue 组件的模板代码

在项目的 .vscode 目录下创建一个名为 vue3.2.code-snippets 的文件，它是一个 JSON 格式的代码片段文件

```
{
  "Vue3.2+快速生成模板": {
    "prefix": "Vue3.2+",
    "body": [
      "<template>",
      "\t<div>\n",
      "\t</div>",
      "</template>\n",
      "<script setup lang='ts'>",
      "</script>\n",
      "<style lang='scss' scoped>\n",
      "</style>",
      "$2"
    ],
    "description": "Vue3.2+"
  }
}


```

`prefix`：定义了在代码编辑器中触发该代码片段的前缀，这里设定为 "Vue3.2+" `body`：定义了代码片段的主体部分，它是一个数组，包含多行模板代码 `description`：对该代码片段的描述

在 vue 文件中输入 "Vue3.2+"（会有自动提示） 按下 Tab 键，就会自动插入这段模板代码。你可以根据需要自行修改和完善这个模板。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiaqAocWKmjzP6SAzaJuMib7Ej3KBicwAU1S0T4UVfxUDkJoDGXJGvQAlUtzKhG0rSAeIVQdvmMWibZgg/640?wx_fmt=other)02.png

先到这吧！想到了再更新...

> 作者：幽月之格  
> 链接：https://juejin.cn/post/7256975111562674233  
> 来源：稀土掘金

结语
--

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```