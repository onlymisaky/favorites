> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AEiqR9GT23sj3dOsz-HECQ)

关注 前端瓶子君，回复 “交流”  

加入我们一起学习，天天进步

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQn9e0CSQXMDqpiaibb5WE71F2TS9tic9YvNWgpbhevUy4Miavycib6ZCBql5QgbibP0Uc9mTSPRaqbyDiag/640?wx_fmt=jpeg)

> 转载自：时樾同学
> 
> https://juejin.cn/post/6901467138599763975

干了几个月的 nuxt 项目，差点没把自己给干翻。在公司没开干 nuxt 项目之前，我也没接触过 nuxt, 潦潦草草看了几眼官网就开干了，在这过程中也踩了不少坑，也写了不少无谓的代码，所以借助这次摸🐟 的时间总结了一些实战用到的知识点，希望能帮到你，能让你少踩点坑，文采不好，凑合着看。

middleware 定义（nuxt.config, layout, pages）
=========================================

middleware 顾名思义就是中间件的意思，在中间价可以做路由拦截，参数过滤等等...middleware 有以下三种定义方式。

*   nuxt.config 配置文件定义
    

```
export default{ router:{     middleware: ['xxxx'] //直接写中间件文件名，比如middleware/auth.js，直接写auth就ojbk  }}
```

```
特别提醒⏰ ：定义在nuxt.config中的中间件要在根目录的middleware文件下，定义对应的js文件，导出一个函数。
```

*   layout 页面定义
    

```
export default {  middleware:({route,params,query})=>{    console.log(route,params,query, 'layout')  }}
```

*   pages 页面定义
    

```
export default {  middleware:({route,params,query})=>{    console.log(route,params,query, 'page')  }}
```

middleware 的第一参数是一个上下文参数，能够解构出 route,params,query 等等... 参数，足够我们做各种骚操作。既然它们能够定义在不同位置，那么它们的执行顺序就有前有后👇。

**执行顺序：nuxt.config => layout => page**

validate 参数验证 (pages)
=====================

validate 钩子主要是做页面级别（pages）的参数验证操作, 在它的上下文能够解构出 params,query... 参数，最后`return true`代表验证通过，`return false`表示验证失败。

```
export default {  validate({params,query}){    console.log(params,query,'validate')    return true  }}
```

asyncData 服务端请求异步数据 (pages)
===========================

asyncData 主要做服务端数据请求渲染, 在它上下文能够解构出 axios,route,params... 参数，要解构出 axios,route,params... 参数，要解构出 axios,route,params... 参数，要解构出 axios，还需要做一些额外配置，往下拉有讲到。解构出 $axios，就可以做 ajax 请求，最后把要渲染的数据 return 出去就行。

```
export default {  async asyncData({$axios,route}){    let data = await $axios('xxx/xxx/xx')    return {     data    }  }}
```

扩展路由（nuxt.config）
=================

在 nuxt 默认为约定是路由，就是在 pages 在创建一个文件，或者一个文件夹就会自动创建对应的路由，无需手动配置什么，方便极了，这里就不多说，这里只要说一下，当我们要对某个地址做一个特殊操作的时候，或者全面接管约定式路由的时候，就需要用扩展路由了。

假如想让一个叫`/hahaha/:id`的路由也跳到详情，也这样做👇

```
export default {  router:{    extendRoutes:(routes,resolve)=>{      routes.push({        name:"hahaha",        path:'/hahaha/:id',        component:resolve(__dirname,'pages/detail/_id.vue')      })    }  }}
```

假如要全面接管约定式路由，可以这样做👇

```
export default {  router:{    extendRoutes(routes, resolve){     return [       {         name:"home",         path:"/",         component:resolve(__dirname,'pages/index'),         meta:{           title:"home"         }       }       ...这里还可以继续写，一般如果要接管约定式路由的话，都会把它放到一个文件再引入     ]    }  }}
```

定制错误页面 （layout）
===============

处理错误页面，默认情况下，nuxt 提供了一个默认的错误页面，如果你嫌它错的哇，也可以自己定制一个风骚的错误页面，直接下`layout目录下定义一个error.vue文件`就可以定制自己喜欢的错误页面了，它会代替默认的错误页面，在`error.vue的prop有个error属于是包含错误信息的`

```
<template>
  <div>
      错误页面{{ error }}
  </div>
</template>
<script>
export default {
   props:['error']
}
</script>
```

动画定制 （css,pages, nuxt.config）
=============================

全局
--

假如想要全局实现一个路由切换动画，那么可以在根目录的`assets/css目录(全局css样式可以随便你放，一般都会放在assets下,你也可以放在某个角落)`定义一个全局文件，实现一下以下几个类👇

*   page-enter-active
    
*   page-leave-active
    
*   page-enter
    
*   page-leave
    

🌰

```
.page-enter-active, .page-leave-active{    transition: opacity 1.5s;}.page-enter, .page-leave-active{    opacity: 0;}
```

最后在 nuxt.config 引用这个文件就可以实现一个路由切换的淡入淡出效果。

```
export default {  css: [    "assets/css/xxx.css"  ],}
```

局部
--

假如想在某个路由页面有个一种独一无二的入场出场方式的话，也可以为它单独实现独有的效果，只需要给个`transition:'xxxx'(xxx是自己起的名字，随便你起)`, 然后实现对应的类就可以实现该有的动画。

*   xxx-enter-active
    
*   xxx-leave-active
    
*   xxx-enter
    
*   xxx-leave
    

路由守卫
====

全局守卫
----

*   定义的在 nuxt.config 的 middleware
    
*   定义在 layout 的 middleware
    
*   定义在 plugins
    

组件局部守卫
------

*   定义在组件的 middleware
    

局部后置守卫
------

*   组件 beforeRouteLeave 钩子
    

数据请求 (nuxt.config)
==================

要做数据请求，就要用到 axios 了，nuxt 有为我们集成，只需要安装，引用就可以。

*   第一步 `npm i \-D @nuxtjs/axois`
    

*   第二步在 nuxt.config 引入就可以
    

```
export default{ modules: [  '@nuxtjs/axios' ]}
```

然后重启，就可以在 plugin,aysncData... 的上下文解构到`$axios`参数

```
重要提醒⏰ ：nuxt集成的库大多数都要在modules中引入。
```

开启代理
====

有时候我们的接口出现了跨域，那么我们就要代理了。

*   第一步 `npm i \-D @nuxtjs/proxy`
    
*   第二步 nuxt.config 下配置
    
*   @nuxtjs/proxy
    

*   nuxt.config 下配置 axios 和 proxy
    

```
export default {  axios:{     proxy:true   }，   proxy:{     'api/':{       target:'http://localhost:3000'     }   }}
```

axios 拦截
========

在平时开发中请求异步数据，少不了请求前，请求后做一些拦截，在 nuxt 中也很容易实现，只需定义一个`axios拦截plugin`。

*   第一步 在`plugins目录`，起一个性感的插件名，比如叫`axios.js`
    

```
export default({$axios})=>{  // 请求拦截  $axios.onRequest(req=>{    // doing something...  })  // 响应拦截  $axios.onResponse(res=>{    // doing something...  })  // 错误拦截  $axios.onError(err=>{  // doing something...  })}
```

*   第二步 在`nuxt.config`中引入插件
    

```
export default {plugins: [    {      src:'~/plugins/axios',      ssr:true // 默认为true，会同时在服务端（asyncData（{$axios}））和客户端（this.$axios）同时拦截axios请求，设为false就只会拦截客户端    }  ]}
```

配置 loading （nuxt.config）
========================

配置 loading 有两种方式。一种在，

*   直接在默认的 loading 上调样式
    

```
export default {  loading: {    color: 'blue',    height: '5px'  }}
```

**它还有这样属性可以调**

*   定制 loading
    

```
export default {  loading: '指向一个组件的路径'}
```

**这个被指向的组件会有两个特殊钩子 start, finish 钩子，代表开始加载的时候，和加载结束的时候做些什么**

vuex
====

配置 vuex 直接下根目录下的`store目录`下定义就可以了，注意的是，除了`index文件`不是具名文件，其他的文件都是具名的, 具名的在调用使需要加上这个名字，比如（this.$store.commit('xxx/handle')）。

vuex 的文件写法格式如下👇

```
export const state => （{}）export const getters = {}export const actions = {}export const mutations = {}
```

配置 UI 库
=======

第三方 UI 库配置，这里以 element-ui 为例。

*   第一步 `npm i \-D element-ui`
    

*   第二步 在`plugins目录建议xxx.js`然后引入 element-ui 注册
    

```
import Vue from 'vue'import ElementUi from 'element-ui'Vue.use(ElementUi)
```

*   第三步 在 nuxt.config 配置
    

```
export default {  css: [    "element-ui/lib/theme.chalk/index.css" //引入element-ui的样式  ],  plugins: [    '~/plugins/xxx' // 引入刚刚定义的plugin  ]}
```

定制 meta（nuxt.config,pages）
==========================

定制可以在 nuxt.config 中定义全局，也可以在 pages 下定制单独的。

**nuxt**

```
export default {  head: {    title: 'test',    meta: [      { charset: 'utf-8' },      { name: 'viewport', content: 'width=device-width, initial-scale=1' },      { hid: 'description', name: 'description', content: '' }    ],    link: [      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }    ]  }}
```

**pages**

```
export default {  head:()=>({    title: 'test',    meta: [      { charset: 'utf-8' },      { name: 'viewport', content: 'width=device-width, initial-scale=1' },      { hid: 'description', name: 'description', content: '' }    ],    link: [      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }    ]  })}
```

其他
==

*   路径别名:~ 或 @ srcDir , ~~ 或 @@ rootDir (默认情况下，srcDir 和 rootDir 相同)
    
*   nuxt-link 选中样式 修改 active-class='xxx'
    
*   @nuxtjs/style-resources 配置 less,scss 全局变量
    
*   更多特性, 自己看官网
    

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

欢迎关注「前端瓶子君」，回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持