> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/uthYMP-s2uNJVSJ8I2gAmA)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

之前双十一实现的一个功能，总结下！本篇文章就来介绍下如何使用 Vue3 + TS + Svg + ECharts 实现一个如下所示的双十一数据大屏页面：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTedSrJQsaEP7skZHibZ7NwNgIJNOiblTSZ0TScJmqrPQXWC4eQYicKKibVw/640?wx_fmt=other&from=appmsg)abac904c-fad1-4730-9578-4b32f530cd88.gif

创建项目
----

执行命令 `npm create vue@latest` 创建基于 Vite 构建的 vue3 项目，功能选择如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTqngFcsBeD1ibPfLFCqL0AySGbZDBqGXQGNG2tmLyqkt3Uv0uHqZ61ow/640?wx_fmt=other&from=appmsg)

我选择使用 pnpm1 安装项目依赖：`pnpm i`，各安装包的版本号可见于下图：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rT2e4okkN08ib2JqIsYsvaJqQlTHUERFoZplfQd3ndBo8PAoYBBkKtqOw/640?wx_fmt=other&from=appmsg)

```
export default defineConfig({
  // ...
  server: {
    open: true
  }
})


```

现在，就可以通过 `pnpm dev` 启动新建的项目了。

大屏适配
----

大屏适配的方案有很多，比如 rem、vw 和 flex 布局等，我选择使用缩放（scale）的方式来适配大屏，因为该方案使用起来比较简单，也不用考虑第三方库的单位等问题。

假设设计稿的尺寸为 1920 * 1080px，为了保证效果，在大屏中放大时应该保持宽高比 `designRatio` 不变，`designRatio` 为 `1920 / 1080 ≈ 1.78`。放大的倍数 `scaleRatio`，可以分为以下 2 种情况计算：

*   当用于展示的设备屏幕的宽高比 `deviceRatio` 等于或小于设计稿的宽高比 `designRatio` 时，我们可以按照两者的宽度之比进行缩放，即让设计稿保持宽高比的情况下放大到与设备等宽，在高度上可能留有空白；
    
*   当设备屏幕的宽高比 `deviceRatio` 大于设计稿宽高比 `designRatio` 时，也就是说设备为超宽屏，`scaleRatio` 应该按照两者的高度之比决定，即让设计稿保持宽高比的情况下放大到与设备等高，在宽度上可能留有空白，所以还要做个居中布局。
    

具体代码我封装成了一个 hook：

```
// 屏幕适配，src\hooks\useScreenAdapt.ts
import _ from 'lodash'
import { onMounted, onUnmounted } from 'vue'

export default function useScreenAdapt(dWidth: number = 1920, dHeight: number = 1080) {
  // 节流
  const throttleAdjustZoom = _.throttle(() => {
    AdjustZoom()
  }, 1000)

  onMounted(() => {
    AdjustZoom()
    // 响应式
    window.addEventListener('resize', throttleAdjustZoom)
  })

  // 释放资源
  onUnmounted(() => {
    window.removeEventListener('resize', throttleAdjustZoom)
  })

  function AdjustZoom() {
    // 设计稿尺寸及宽高比
    const designWidth = dWidth
    const designHeight = dHeight
    const designRatio = designWidth / designHeight // 1.78

    // 当前屏幕的尺寸及宽高比
    const deviceWidth = document.documentElement.clientWidth
    const devicHeight = document.documentElement.clientHeight
    const deviceRatio = deviceWidth / devicHeight

    // 计算缩放比
    let scaleRatio = 1
    // 如果当前屏幕的宽高比大于设计稿的，则以高度比作为缩放比
    if (deviceRatio > designRatio) {
      scaleRatio = devicHeight / designHeight
    } else {
      // 否则以宽度比作为缩放比
      scaleRatio = deviceWidth / designWidth
    }

    document.body.style.transform = `scale(${scaleRatio}) translateX(-50%)`
  }
}


```

最后是给 `body` 添加了 `transform` 属性，为了实现居中效果，还需要给 body 添加上相应样式：

```
/* \src\assets\base.css */
* {
  box-sizing: border-box;
}

body {
  position: relative;
  margin: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: left top;
  left: 50%;
  background-color: black;
}


```

使用 lodash 实现节流
--------------

为避免改变屏幕尺寸时过于频繁触发 `AdjustZoom`，我借助 lodash 的 `throttle` 方法做了个节流，这就需要安装 lodash：`pnpm add lodash`。因为用到了 ts，如果直接引入使用 lodash 会遇到如下报错：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTIsKYys3f73ibSwhMJam8hiaP0k1UoGtlyBib0JMWdtt9QmD9ib07RIzElg/640?wx_fmt=other&from=appmsg)

我们需要引用它的声明文件，才能获得对应的代码补全、接口提示等功能。提示里已经告诉了我们解决办法，就是去安装 @types/lodash：`pnpm add -D @types/lodash`，之后就能在 ts 文件中正常使用 lodash 了。

使用 svg
------

页面头部使用的就是一张 svg2，样式中给 `#top` 添加绝对定位 `position: absolute;` ，目的在于开启一个单独的渲染层，以减少之后添加动画造成的回流损耗：

```
<template>
  <main class="main-bg">
    <section id="top"></section>
  </main>
</template>
<style scoped>
#top {
  position: absolute;
  width: 100%;
  height: 183px;
  background-size: cover;
  background-image: url(@/assets/imgs/top_bg.svg);
}
</style>


```

作为背景引入的 top_bg.svg 是我使用 Illustrator 绘制后导出的，绘制时注意做好图层的命名：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rT8zaglnbTks9UMH8H8umlkhLborWOuLRr2f8SURDbPa7HibrKY4YZibHw/640?wx_fmt=other&from=appmsg)

因为图层的名称会影响到导出的 svg 文件中元素的 id 名称。另外导出的 svg 文件中也可能存在一些中文命名或一些不必要的代码，我们可以自行修改：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTYM3WWG5yULRlOnIgy9DP6aibebv5fsKBT3ibiawP6P4MOXkXxPJzPqA4g/640?wx_fmt=other&from=appmsg)

添加动画及滤镜
-------

使用 Illustrator 绘制的都是静态图形，现在我们以其中一个圆球为例，添加上平移的动画以及高斯模糊的滤镜：

```
<!-- top_bg.svg 部分代码 -->
<?xml version="1.0" encoding="UTF-8"?>
<svg id="top-bg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 183">
  <defs>
    <style>
      #circle-1 {
        opacity: 0;
        transform: translate(800px, -18px) scale(0.5);
        animation: circle-1-ani 1.8s ease-out forwards infinite;
      }
      @keyframes circle-1-ani {
        90%,
        100% {
          opacity: 0.95;
          transform: translate(600px, 80px) scale(1);
        }
      }
    </style>
    <filter id="blurMe">
        <feGaussianBlur stdDeviation="2" />
      </filter>
  </defs>
 <circle id="circle-1" class="cls-1" r="12.96" filter="url(#blurMe)" />
</svg>


```

动画使用 css 定义，可以直接写在 `<defs>` 里的 `<style>` 中。一旦用到 transform3，那么圆的坐标系就会移动到圆的中心点，所以我将原本 `<circle>` 中的用于定义圆心坐标的 `cx` 和 `cy` 属性删除了，通过在 `#circle-1` 中直接使用 `transform: translate(800px, -18px);` 来定位圆的初始位置：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTNNm0WxgabN02OYdLUMJrWsP7oqIYzrR0zo4kjAhF9iawTWmeRctQyvg/640?wx_fmt=other&from=appmsg)

滤镜定义在 `<defs>` 里的 `<filter>` 中，使用的是高斯模糊 `<feGaussianBlur>`， `stdDeviation` 用于指定钟形（bell-curve），可以理解为模糊程度。在圆形 `<circle>` 上通过 `filter` 属性，传入滤镜的 `id` 应用滤镜。

使用 ECharts
----------

安装
--

首先是安装 ECharts：`pnpm add echarts`。在 npm 的仓库搜索 echarts 可以看到其带有如下所示的 ts 标志：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTJhb8vibopA0KbibzYFNsUyNrnmMYaPS9dFicyyWVXZKuEkkJFiaG2VE4Kw/640?wx_fmt=other&from=appmsg)

说明它的库文件中已经包含了 .d.ts 文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwtACnibVllTd9GG4yteFJ5rTsFzA6DaUibZW1a8GD3gALdwy5Sxpt7fqCvHxkvO5Vcc4wb8nz6Wg3Hw/640?wx_fmt=other&from=appmsg)

所以不需要像上面使用 lodash 那样再去额外安装声明文件了。

封装组件
----

接着就可以封装 echarts 组件了。组件中只需要提供一个展示图表的 dom 容器 `<section>`，然后在 `onMounted`（确保可以获取到 dom 容器） 中创建一个 ECharts 实例 `myChart`，最后通过 `myChart.setOption(option)` 传入从父组件获取的图表实例的配置项以及数据 `option`：

```
<!-- src\components\BaseEChart.vue -->
<template>
  <section ref="mainRef" :style="{ width: width, height: height }"></section>
</template>

<script lang="ts" setup>
  import * as echarts from 'echarts'
  import { onMounted, onUnmounted, ref } from 'vue'

  interface IProps {
    width?: string
    height?: string
    chartOption: echarts.EChartsOption
  }
  const props = withDefaults(defineProps<IProps>(), {
    width: '100%',
    height: '100%'
  })

  const mainRef = ref(null)

  let myChart: echarts.ECharts | null = null
  onMounted(() => {
    myChart = echarts.init(mainRef.value, 'dark', { renderer: 'svg' })
    const option = props.chartOption
    myChart.setOption(option)
  })

  onUnmounted(() => {
    // 销毁 echart 实例，释放资源
    myChart?.dispose()
  })
</script>


```

更多关于 echarts 的使用细节可以阅览《ECharts 实现掘金数据中心折线图》4。

使用示例
----

以左上角的 “人均消费金额排名” 柱状图为例，代码如下：

```
<!-- src\views\HomeView.vue -->
<template>
  <main class="main-bg">
    <section id="left-top">
      <section class="title">人均消费金额排名</section>
      <section class="sub-title">Ranking of per capita consumption amount</section>
      <BaseEChart :chartOption="amountRankOption" />
    </section>
  </main>
</template>

<script setup lang="ts">
import BaseEChart from '@/components/BaseEChart.vue'
import { amountRankOption } from './config/amount-rank-option'
</script>

<style scoped>
#left-top {
  position: absolute;
  top: 130px;
  left: 20px;
  width: 500px;
  height: 320px;
}
</style>


```

在页面引入 `BaseEChart` 后，传入定义好的 `amountRankOption` 即可：

```
// 人均消费金额排名柱状图配置
import * as echarts from 'echarts'
type EChartsOption = echarts.EChartsOption

export const amountRankOption: EChartsOption = {
  grid: {
    top: 20,
    bottom: 50,
    left: 40,
    right: 40
  },
  xAxis: {
    axisTick: {
      show: false // 隐藏 x 坐标轴刻度
    },
    data: ['思明', '湖里', '集美', '同安', '海沧', '翔安']
  },
  yAxis: {
    axisLabel: {
      show: false // 隐藏 y 坐标轴刻度标签
    },
    splitLine: {
      show: false // 隐藏平行于 x 轴的分隔线
    }
  },
  series: [
    {
      type: 'bar',
      data: [5, 20, 36, 10, 10, 20],
      barWidth: 20 // 设置柱形的宽度
    }
  ]
}


```

至于剩下的图表的实现，只是配置不同而已，如有兴趣可以去该项目的 git 仓库查看。

数字滚动动画
------

最后添加成交额的数字滚动动画，用到了 countup.js5，需要先安装：`pnpm add countup.js`。

使用时，直接 `new CountUp()` 生成 `countUp`，第 1 个参数为要添加动画的 dom 的 id，第 2 个参数为动画结束时显示的数字，还可以传入第 3 个参数 options 实现一些配置，比如设置前缀，小数点等。然后通过 `countUp.start()` 即可实现动画效果：

```
<!-- src\components\Digital.vue -->
<template>
  <section>
    <span>成交额</span>
    <span class="t2">150</span>
    <span>亿</span>
  </section>
</template>

<script lang="ts" setup>
  import { CountUp } from 'countup.js'
  import { onMounted } from 'vue'

  onMounted(() => {
    const countUp = new CountUp('amount', 150)

    if (!countUp.error) {
      countUp.start()
    } else {
      console.error(countUp.error)
    }
  })
</script>


```

> 项目 git 仓库：github6、gitee7  
> 原文链接: https://juejin.cn/post/7305434729527181322

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```

  

参考资料

[1]

pnpm:https://juejin.cn/post/7301610680457543743

[2]

svg:https://juejin.cn/post/7294597695477710884

[3]

transform:https://juejin.cn/post/7288632764916367379#heading-1

[4]

《ECharts 实现掘金数据中心折线图》:https://juejin.cn/post/7303856162150285323

[5]

countup.js:https://www.npmjs.com/package/countup.js

[6]

github:https://github.com/chaimHL/front-end-visualization/tree/master/%E5%A4%A7%E5%B1%8F%E9%80%82%E9%85%8D/vue3/consumer_data_on_Double_Eleven

[7]

gitee:https://gitee.com/chaimhl/front-end-visualization/tree/master/%E5%A4%A7%E5%B1%8F%E9%80%82%E9%85%8D/vue3/consumer_data_on_Double_Eleven