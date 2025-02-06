> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/unNbvl6L6vLHXcnyheI1UQ)

大家好，我是欧阳，又跟大家见面啦！

欧阳也在找工作，坐标成都求内推，remote 也可以。扫描文末的二维码加欧阳好友，还可以加入高质量 vue 源码交流群，这个群里也有不少面试官。

前言
==

虚拟列表对于大部分一线开发同学来说是一点都不陌生的东西了，有的同学是直接使用第三方组件。但是面试时如果你简历上面写了虚拟列表，却给面试官说是通过三方组件实现的，此时空气可能都凝固了。所以这篇文章欧阳将会教你 2 分钟内实现一个定高的虚拟列表，至于不定高的虚拟列表下一篇文章来写。

什么是虚拟列表
=======

有的特殊场景我们不能分页，只能渲染一个长列表。这个长列表中可能有几万条数据，如果全部渲染到页面上用户的设备差点可能就会直接卡死了，这时我们就需要虚拟列表来解决问题。

一个常见的虚拟列表是下面这样的，如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvCe8r9MF2ejjAVVdnlSfCn9HDPt9MXnWONlS27fiaJhSmL0TNNsxf0UxgF51XibV5p0btksdsoafPQ/640?wx_fmt=png&from=appmsg)

其中实线框的 item 表示在视口区域内真实渲染 DOM，虚线框的 item 表示并没有渲染的 DOM。

在定高的虚拟列表中，我们可以根据`可视区域的高度`和`每个item的高度`计算得出在可视区域内可以渲染多少个 item。不在可视区域里面的 item 那么就不需要渲染了（不管有几万个还是几十万个 item），这样就能解决长列表性能很差的问题啦。

实现滚动条
=====

按照上面的图，很容易想到我们的 dom 结构应该是下面这样的：

```
<template>  <div class="container">    <div class="list-wrapper">      <!-- 只渲染可视区域列表数据 -->    </div>  </div></template><style scoped>  .container {    height: 100%;    overflow: auto;    position: relative;  }</style>
```

给可视区域`container`设置高度`100%`，也可以是一个固定高度值。并且设置`overflow: auto;`让内容在可视区域中滚动。

此时我们遇见第一个问题，滚动条是怎么来的，可视区域是靠什么撑开的？

答案很简单，我们知道每个 item 的高度`itemSize`，并且知道有多少条数据`listData.length`。那么`itemSize * listData.length`不就是真实的列表高度了吗。所以我们可以在可视区域`container`中新建一个名为`placeholder`的空 div，将他的高度设置为`itemSize * listData.length`，这样可视区域就被撑开了，并且滚动条也有了。代码如下：

```
<template>  <div class="container">    <div class="placeholder" :style="{ height: listHeight + 'px' }"></div>    <div class="list-wrapper">      <!-- 只渲染可视区域列表数据 -->    </div>  </div></template><script setup>  import { ref, onMounted, computed } from "vue";  const { listData, itemSize } = defineProps({    listData: {      type: Array,      default: () => [],    },    itemSize: {      type: Number,      default: 100,    },  });  const listHeight = computed(() => listData.length * itemSize);</script><style scoped>  .container {    height: 100%;    overflow: auto;    position: relative;  }  .placeholder {    position: absolute;    left: 0;    top: 0;    right: 0;    z-index: -1;  }</style>
```

`placeholder`采用绝对定位，为了不挡住可视区域内渲染的列表，所以将其设置为`z-index: -1`。

接下来就是计算容器里面到底渲染多少个 item，很简单，`Math.ceil(可视区域的高度 / 每个item的高度)`。

为什么使用`Math.ceil`向上取整呢？

只要有个 item 在可视区域漏了一点出来，我们也应该将其渲染。

此时我们就能得到几个变量：

*   `start`：可视区域内渲染的第一个 item 的 index 的值，初始化为 0。
    
*   `renderCount`：可视区域内渲染的 item 数量。
    
*   `end`：可视区域内渲染的最后一个 item 的 index 值，他的值等于`start + renderCount`。注意我们这里使用`start + renderCount`实际是多渲染了一个 item，比如`start = 0`和`renderCount = 2`，我们设置的是`end = 2`，实际是渲染了 3 个 item。目的是为了预渲染下一个，后面会讲。
    

监听滚动事件
======

有了滚动条后就可以开始滚动了，我们监听`container`容器的 scroll 事件。

可视区域中的内容应该随着滚动条的滚动而变化，也就是说在 scroll 事件中我们需要重新计算`start`的值。

```
function handleScroll(e) {  const scrollTop = e.target.scrollTop;  start.value = Math.floor(scrollTop / itemSize);  offset.value = scrollTop - (scrollTop % itemSize);}
```

如果当前`itemSize`的值为 100。

如果此时滚动的距离在 0-100 之间，比如下面这样：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvCe8r9MF2ejjAVVdnlSfCnutxOrXbQQB7E0al71OwuR62xzf04Y7W86dujF5IqicKYjqXXP87jRkA/640?wx_fmt=png&from=appmsg)

上面这张图 item1 还没完全滚出可视区域，有部分在可视区域内，部分在可视区域外。此时可视区域内显示的就是`item1-item7`的模块了，这就是为什么前面我们计算 end 时要多渲染一个 item，不然这里 item7 就没法显示了。

**滚动距离在 0-100 之间时，渲染的 DOM 没有变化，我们完全是复用浏览器的滚动，并没有进行任何处理。**

当`scrollTop`的值为 100 时，也就是刚刚把 item1 滚到可视区外面时。此时 item1 已经不需要渲染了，因为已经看不见他了。所以此时的`start`的值就应该从`0`更新为`1`，同理如果`scrollTop`的值为`110`，start 的值也一样是`1`。所以得出`start.value = Math.floor(scrollTop / itemSize);`如下图：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvCe8r9MF2ejjAVVdnlSfCnx5ZY9aadJHMuYvgKt1vlEpTYoAtQjmEjUckDqU4NBBiaeibqp6bc5YYQ/640?wx_fmt=png&from=appmsg)

此时的`start`从 item2 开始渲染，但是由于前面我们复用了浏览器的滚动，所以实际渲染的 DOM 第一个已经在可视区外面了。此时可视区看见的第一个是 item3，很明显是不对的，应该看见的是第一个是 item2。

此时应该怎么办呢？

很简单，使用`translate`将列表向下偏移一个 item 的高度就行，也就是 100px。列表偏移后就是下面这样的了：![](https://mmbiz.qpic.cn/mmbiz_png/8hhrUONQpFvCe8r9MF2ejjAVVdnlSfCnM8d06FxAFzJz2olfReqBhxISjMq5LictHIRcU6cYgPnQuPbz4Ut78zg/640?wx_fmt=png&from=appmsg)

如果当前`scrollTop`的值为 200，那么偏移值就是 200px。所以我们得出

```
offset.value = scrollTop - (scrollTop % itemSize);
```

为什么这里要减去`scrollTop % itemSize`呢？

因为在滚动时如果是在 item 的高度范围内滚动，我们是复用浏览器的滚动，此时无需进行偏移，所以计算偏移值时需要减去`scrollTop % itemSize`。

实际上从一个 item 滚动到另外一个 item 时，比如从`item0`滚动到`item1`。此时会做两件事情：将`start`的值从`0`更新为`1`和根据`scrollTop`计算得到列表的偏移值`100`，从而让新的 start 对应的`item1`重新回到可视范围内。

这个是运行效果图：![](https://mmbiz.qpic.cn/mmbiz_gif/8hhrUONQpFvCe8r9MF2ejjAVVdnlSfCn2E1FtpbWhkEkpWT6UPnGSlicEjxflzX3SicUTeo6SibaXknpeRLvr4M5g/640?wx_fmt=gif&from=appmsg)

下面是完整的代码：

```
<template>  <div ref="container" class="container" @scroll="handleScroll($event)">    <div class="placeholder" :style="{ height: listHeight + 'px' }"></div>    <div class="list-wrapper" :style="{ transform: getTransform }">      <div        class="card-item"        v-for="item in renderList"        :key="item.id"        :style="{          height: itemSize + 'px',          lineHeight: itemSize + 'px',          backgroundColor: `rgba(0,0,0,${item.value / 100})`,        }"      >        {{ item.value + 1 }}      </div>    </div>  </div></template><script setup>import { ref, onMounted, computed } from "vue";const { listData, itemSize } = defineProps({  listData: {    type: Array,    default: () => [],  },  itemSize: {    type: Number,    default: 100,  },});const container = ref(null);const containerHeight = ref(0);const renderCount = computed(() => Math.ceil(containerHeight.value / itemSize));const start = ref(0);const offset = ref(0);const end = computed(() => start.value + renderCount.value);const listHeight = computed(() => listData.length * itemSize);const renderList = computed(() => listData.slice(start.value, end.value + 1));const getTransform = computed(() =>`translate3d(0,${offset.value}px,0)`);onMounted(() => {  containerHeight.value = container.value.clientHeight;});function handleScroll(e) {const scrollTop = e.target.scrollTop;  start.value = Math.floor(scrollTop / itemSize);  offset.value = scrollTop - (scrollTop % itemSize);}</script><style scoped>.container {  height: 100%;  overflow: auto;  position: relative;}.placeholder {  position: absolute;  left: 0;  top: 0;  right: 0;  z-index: -1;}.card-item {  padding: 10px;  color: #777;  box-sizing: border-box;  border-bottom: 1px solid #e1e1e1;}</style>
```

这个是父组件的代码：

```
<template>  <div style="height: 100vh; width: 100vw">    <VirtualList :listData="data" :itemSize="100" />  </div></template><script setup>import VirtualList from "./common.vue";import { ref } from "vue";const data = ref([]);for (let i = 0; i < 1000; i++) {  data.value.push({ id: i, value: i });}</script><style>html {  height: 100%;}body {  height: 100%;  margin: 0;}#app {  height: 100%;}</style>
```

总结
==

这篇文章我们讲了如何实现一个定高的虚拟列表，首先根据可视区域的高度和 item 的高度计算出视口内可以渲染出来的 item 数量`renderCount`。然后根据滚动的距离去计算`start`的位置，计算`end`的位置时使用`start + renderCount`预渲染一个 item。在每个 item 范围内滚动时直接复用浏览器的滚动，此时无需进行任何处理。当从一个 item 滚动到另外一个 item 时，此时会做两件事情：更新 start 的值和根据`scrollTop`计算列表的偏移值让新的 start 对应的 item 重新回到可视范围内。

长按图片加欧阳微信，拉你进欧阳的面试交流群（分享内推信息）、以及高质量 vue 源码交流群，群里也有不少面试官。  

![](https://mmbiz.qpic.cn/mmbiz_jpg/8hhrUONQpFvj3tceZOHVCHAt7YibzKNqW9WZBLQYMugDqbp2ibfS4Dzcj8yXKgZCzHKK5dT3HMRKnticwibd0eyxvw/640?wx_fmt=jpeg&from=appmsg)

关注公众号，发送消息：

666，领取欧阳研究 vue 源码过程中收集的源码资料，欧阳写文章有时也会参考这些资料。

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本公众号星标，看完文章后记得点下赞或者在看，谢谢各位！