> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eojlTyfiT0ErzKEEWeZqaA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCUkqG8mwYq5tibibtjabGDXxwdCajjSBVic7PIW6k5dl8btUVCjoRBzdQfc5UGsTeF0esLZcQibyXDzMQ/640?wx_fmt=jpeg)

引言
--

有这么一个需求：列表页进入详情页后，切换回列表页，需要对列表页进行缓存，如果从首页进入列表页，就要重新加载列表页。

对于这个需求，我的第一个想法就是使用 keep-alive 来缓存列表页，列表和详情页切换时，列表页会被缓存；从首页进入列表页时，就重置列表页数据并重新获取新数据来达到列表页重新加载的效果。

但是，这个方案有个很不好的地方就是：如果列表页足够复杂，有下拉刷新、下拉加载、有弹窗、有轮播等，在清除缓存时，就需要重置很多数据和状态，而且还可能要手动去销毁和重新加载某些组件，这样做既增加了复杂度，也容易出 bug。

接下来说说我的想到的新实现方案（代码基于 Vue3）。

省流
--

demo: xiaocheng555.github.io/page-cache/…[1]

代码: github.com/xiaocheng55…[2]

keep-alive 缓存和清除
----------------

> keep-alive 缓存原理：进入页面时，页面组件渲染完成，keep-alive 会缓存页面组件的实例；离开页面后，组件实例由于已经缓存就不会进行销毁；当再次进入页面时，就会将缓存的组件实例拿出来渲染，因为组件实例保存着原来页面的数据和 Dom 的状态，那么直接渲染组件实例就能得到原来的页面。

keep-alive 最大的难题就是缓存的清理，如果能有简单的缓存清理方法，那么 keep-alive 组件用起来就很爽。

但是，keep-alive 组件没有提供清除缓存的 API，那有没有其他清除缓存的办法呢？答案是有的。我们先看看 keep-alive 组件的 props：

```
include - string | RegExp | Array。只有名称匹配的组件会被缓存。
exclude - string | RegExp | Array。任何名称匹配的组件都不会被缓存。
max - number | string。最多可以缓存多少组件实例。
复制代码
```

从 include 描述来看，我发现 include 是可以用来清除缓存，做法是：将组件名称添加到 include 里，组件会被缓存；移除组件名称，组件缓存会被清除。根据这个原理，用 hook 简单封装一下代码：

```
import { ref, nextTick } from 'vue'const caches = ref<string[]>([])export default function useRouteCache () {  // 添加缓存的路由组件  function addCache (componentName: string | string []) {    if (Array.isArray(componentName)) {      componentName.forEach(addCache)      return    }        if (!componentName || caches.value.includes(componentName)) return    caches.value.push(componentName)  }  // 移除缓存的路由组件  function removeCache (componentName: string) {    const index = caches.value.indexOf(componentName)    if (index > -1) {      return caches.value.splice(index, 1)    }  }    // 移除缓存的路由组件的实例  async function removeCacheEntry (componentName: string) {        if (removeCache(componentName)) {      await nextTick()      addCache(componentName)    }  }    return {    caches,    addCache,    removeCache,    removeCacheEntry  }}复制代码
```

hook 的用法如下：

```
<router-view v-slot="{ Component }">  <keep-alive :include="caches">    <component :is="Component" />  </keep-alive></router-view><script setup lang="ts">import useRouteCache from './hooks/useRouteCache'const { caches, addCache } = useRouteCache()<!-- 将列表页组件名称添加到需要缓存名单中 -->addCache(['List'])</script>复制代码
```

清除列表页缓存如下：

```
import useRouteCache from '@/hooks/useRouteCache'const { removeCacheEntry } = useRouteCache()removeCacheEntry('List')复制代码
```

> 此处 removeCacheEntry 方法清除的是列表组件的实例，'List' 值仍然在 组件的 include 里，下次重新进入列表页会重新加载列表组件，并且之后会继续列表组件进行缓存。

### 列表页清除缓存的时机

#### 进入列表页后清除缓存

在列表页路由组件的 beforeRouteEnter 勾子中判断是否是从其他页面（Home）进入的，是则清除缓存，不是则使用缓存。

```
defineOptions({  name: 'List1',  beforeRouteEnter (to: RouteRecordNormalized, from: RouteRecordNormalized) {    if (from.name === 'Home') {      const { removeCacheEntry } = useRouteCache()      removeCacheEntry('List1')    }  }})复制代码
```

这种缓存方式有个不太友好的地方：当从首页进入列表页，列表页和详情页来回切换，列表页是缓存的；但是在首页和列表页间用浏览器的前进后退来切换时，我们更多的是希望列表页能保留缓存，就像在多页面中浏览器前进后退会缓存原页面一样的效果。但实际上，列表页重新刷新了，这就需要使用另一种解决办法，**点击链接时清除缓存清除缓存**。

#### 点击链接跳转前清除缓存

在首页点击跳转列表页前，在点击事件的时候去清除列表页缓存，这样的话在首页和列表页用浏览器的前进后退来回切换，列表页都是缓存状态，只要当重新点击跳转链接的时候，才重新加载列表页，满足预期。

```
// 首页 Home.vue<li>  <router-link to="/list" @click="removeCacheBeforeEnter">列表页</router-link></li><script setup lang="ts">import useRouteCache from '@/hooks/useRouteCache'defineOptions({  name: 'Home'})const { removeCacheEntry } = useRouteCache()// 进入页面前，先清除缓存实例function removeCacheBeforeEnter () {  removeCacheEntry('List')}</script>复制代码
```

状态管理实现缓存
--------

通过状态管理库存储页面的状态和数据也能实现页面缓存。此处状态管理使用的是 pinia。

首先使用 pinia 创建列表页 store：

```
import { defineStore } from 'pinia'interface Item {  id?: number,  content?: string}const useListStore = defineStore('list', {  // 推荐使用 完整类型推断的箭头函数  state: () => {    return {      isRefresh: true,      pageSize: 30,      currentPage: 1,      list: [] as Item[],      curRow: null as Item | null    }  },  actions: {    setList (data: Item []) {      this.list = data    },    setCurRow (data: Item) {      this.curRow = data    },    setIsRefresh (data: boolean) {      this.isRefresh = data    }  }})export default useListStore复制代码
```

然后在列表页中使用 store：

```
<div>  <el-page-header @back="goBack">    <template #content>状态管理实现列表页缓存</template>  </el-page-header>  <el-table v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 30px;">    <el-table-column prop="id" label="id" />    <el-table-column prop="content" label="内容"/>    <el-table-column label="操作">      <template v-slot="{ row }">        <el-link type="primary" @click="gotoDetail(row)">进入详情</el-link>        <el-tag type="success" v-if="row.id === listStore.curRow?.id">刚点击</el-tag>      </template>    </el-table-column>  </el-table>  <el-pagination    v-model:currentPage="listStore.currentPage"    :page-size="listStore.pageSize"    layout="total, prev, pager, next"    :total="listStore.list.length"  /></div>  <script setup lang="ts">import useListStore from '@/store/listStore'const listStore = useListStore()...</script>复制代码
```

通过 beforeRouteEnter 钩子判断是否从首页进来，是则通过 `listStore.$reset()` 来重置数据，否则使用缓存的数据状态；之后根据 `listStore.isRefresh` 标示判断是否重新获取列表数据。

```
defineOptions({  beforeRouteEnter (to: RouteLocationNormalized, from: RouteLocationNormalized) {    if (from.name === 'Home') {      const listStore = useListStore()      listStore.$reset()    }  }})onBeforeMount(() => {  if (!listStore.useCache) {    loading.value = true    setTimeout(() => {      listStore.setList(getData())      loading.value = false    }, 1000)    listStore.useCache = true  }})复制代码
```

### 缺点

通过状态管理去做缓存的话，需要将状态数据都存在 stroe 里，状态多起来的话，会有点繁琐，而且状态写在 store 里肯定没有写在列表组件里来的直观；状态管理由于只做列表页数据的缓存，对于一些非受控组件来说，组件内部状态改变是缓存不了的，这就导致页面渲染后跟原来有差别，需要额外代码操作。

页面弹窗实现缓存
--------

将详情页做成全屏弹窗，那么从列表页进入详情页，就只是简单地打开详情页弹窗，将列表页覆盖，从而达到列表页 “缓存” 的效果，而非真正的缓存。

这里还有一个问题，打开详情页之后，如果点后退，会返回到首页，实际上我们希望是返回列表页，这就需要给详情弹窗加个历史记录，如列表页地址为 '/list'，打开详情页变为 '/list?id=1'。

弹窗组件实现：

```
// PopupPage.vue<template>  <div class="popup-page" :class="[!dialogVisible && 'hidden']">    <slot v-if="dialogVisible"></slot>  </div></template><script setup lang="ts">import { useLockscreen } from 'element-plus'import { computed, defineProps, defineEmits } from 'vue'import useHistoryPopup from './useHistoryPopup'const props = defineProps({  modelValue: {    type: Boolean,    default: false  },  // 路由记录  history: {    type: Object  },  // 配置了history后，初次渲染时，如果有url上有history参数，则自动打开弹窗  auto: {    type: Boolean,    default: true  },  size: {    type: String,    default: '50%'  },  full: {    type: Boolean,    default: false  }})const emit = defineEmits(  ['update:modelValue', 'autoOpen', 'autoClose'])const dialogVisible = computed<boolean>({ // 控制弹窗显示  get () {    return props.modelValue  },  set (val) {    emit('update:modelValue', val)  }})useLockscreen(dialogVisible)useHistoryPopup({  history: computed(() => props.history),  auto: props.auto,  dialogVisible: dialogVisible,  onAutoOpen: () => emit('autoOpen'),  onAutoClose: () => emit('autoClose')})</script><style lang='less'>.popup-page {  position: fixed;  left: 0;  right: 0;  top: 0;  bottom: 0;  z-index: 100;  overflow: auto;  padding: 10px;  background: #fff;    &.hidden {    display: none;  }}</style>复制代码
```

弹窗组件调用：

```
<popup-page   v-model="visible"   full  :history="{ id: id }">  <Detail></Detail></popup-page>复制代码
```

> hook：useHistoryPopup 参考文章：juejin.cn/post/713994…[3]

### 缺点

弹窗实现页面缓存，局限比较大，只能在列表页和详情页中才有效，离开列表页之后，缓存就会失效，比较合适一些简单缓存的场景。

父子路由实现缓存
--------

该方案原理其实就是页面弹窗，列表页为父路由，详情页为子路由，从列表页跳转到详情页时，显示详情页字路由，且详情页全屏显示，覆盖住列表页。

声明父子路由：

```
{  path: '/list',  name: 'list',  component: () => import('./views/List.vue'),  children: [    {      path: '/detail',      name: 'detail',      component: () => import('./views/Detail.vue'),    }  ]}复制代码
```

列表页代码：

```
// 列表页<template>  <el-table v-loading="loading" :data="tableData" border style="width: 100%; margin-top: 30px;">    <el-table-column prop="id" label="id" />    <el-table-column prop="content" label="内容"/>    <el-table-column label="操作">      <template v-slot="{ row }">        <el-link type="primary" @click="gotoDetail(row)">进入详情</el-link>        <el-tag type="success" v-if="row.id === curRow?.id">刚点击</el-tag>      </template>    </el-table-column>  </el-table>  <el-pagination    v-model:currentPage="currentPage"    :page-size="pageSize"    layout="total, prev, pager, next"    :total="list.length"  />    <!-- 详情页 -->  <router-view class="popyp-page"></router-view></template><style lang='less' scoped>.popyp-page {  position: fixed;  top: 0;  bottom: 0;  left: 0;  right: 0;  z-index: 100;  background: #fff;  overflow: auto;}</style>
```

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步

> 作者：香芋好好吃  
> 链接：https://juejin.cn/post/7153140300817367054  
> 来源：稀土掘金