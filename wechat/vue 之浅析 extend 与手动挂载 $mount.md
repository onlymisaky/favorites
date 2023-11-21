> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eUexOK4BpPvT7Wn8AwLqZw)

  

> 本文作者为奇舞团前端开发工程师 

vue 组件的实现方式有很多种，本文所说的是其中较少使用的一种，即由 vue 内置的 API **extend** 与 **$mount** 配合使用实现的。

一、为什么使用
-------

### 1、典型使用场景的例子

渲染组件前![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECRNOawiaZiaOodkerVBb9NFlKH5XKQzC6b1w0TVxSdc8blAIb30QAyjdDcs9LvL7CuBudib5ncWt7zQ/640?wx_fmt=png)渲染组件后

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECRNOawiaZiaOodkerVBb9NFlAmbTYOnNQmlDd2SrBmSdz27CvMJlricgnrpGrKfjEWTiciaYeXLAMF4qg/640?wx_fmt=png)  

可以看到组件是在 **body** 标签添加进去的。关闭弹窗，组件会从 **body** 移除。

### 2、普通组件的局限性

#### 2.1、普通组件的引用方式

ButtonCounter.vue

```
<template>
  <button v-on:click="count++">You clicked me {{ count }} times.</button>
</template>

<script>
export default {
  name: "ButtonCounter",
  components: {},
  data() {
    return {
        count: 0
    }
  }
}
</script>
```

view.vue

```
<template>
  <ButtonCounter />
</template>

<script>
import ButtonCounter from "./ButtonCounter.vue"
export default {
  name: "VueAppComponent2",
  components: {
    ButtonCounter
  }
}
</script>
```

#### 2.2、普通组件的特点

由于 vue 框架多用于单页面应用，因此通常整个应用只有一个根节点，即 **#app**，如下：

main.js

```
import Vue from "vue"import App from "./App.vue"new Vue({  render: h => h(App)}).$mount("#app")
```

因此，项目内的所有内容全部在 **#app** 根节点下渲染。  
其次，通常引入的组件会进行局部注册，模板引用组件标签，这导致组件只能在预设的位置进行渲染。

#### 2.3、普通组件的问题

如下场景普通组件无法很好的解决：  
1、组件模版是从服务端异步获取到的，并需要动态渲染。  
2、实现类似原生的调用。例如，调用 window.alert() 就可以弹出弹窗。

二、如何实现
------

### 1、vue2 的实现

CreateButtomCounter.js

```
import Vue from "vue"import ButtonCounter from "./ButtonCounter.vue"export const CreateButtomCounter = () => {  const ButtonCounterCom = Vue.extend(ButtonCounter)  const instance = new ButtonCounterCom().$mount()    const dom = document.querySelector("#root")  dom.appendChild(instance.$el)}
```

view.vue

```
<template>
  <div>
    <button @click="CreateButtomCounter">点击加载组件</button>
    <div id="root"></div>
  </div>
</template>
<script>
import { CreateButtomCounter } from "./CreateButtomCounter.js"
export default {
  name: "VueAppComponent",
  methods: {
    CreateButtomCounter
  }
}
</script>
```

### 2、浅析

#### 2.1、new Vue

特点：  
（1）可以通过自身 components 引用 vue.extend 构造，通过自身 data 向构造传参  
（2）可以通过自身 component 引用组件模版，通过自身 data 向组件传参  
使用范围：  
（1）仅限于自身

```
new Vue({  el: "#app1",  data: {    msg: "vue实例参数"  },  components: {    dt1: {      template: "#dt1"    },    vueapple: Profile //【引入构造】  }});
```

#### 2.2、Vue.extend()

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECRNOawiaZiaOodkerVBb9NFll7jTBBuCUyahCtafMm2tsjVSQmgTrURPrM4utfQone18yecYsG9KKA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECRNOawiaZiaOodkerVBb9NFl5LCu47CTzxyOZnPNew7y3bCwtCJ7uQBuggE1dYjK33XCeee6xzSOnw/640?wx_fmt=png)简言之，通过参数传递一个配置对象（这个配置对象就是我们模板中 export default 的那个对象，例如 data,methods,props 等等）都可以传递，接下来该函数会根据我们的配置对象生成一个继承自 Vue 的子组件构造函数。

特点：  
只能通过自身初始化结构  
使用范围：  
（1）挂载在某元素下  
（2）被 vue 实例的 components 引用  
（3）Vue.component 组件引用

```
const ButtonCounterCom = Vue.extend(ButtonCounter)
```

这里创建了一个构造器，可以解决普通模板的问题。

#### 2.3、$mount()

$mount 方法支持传入 2 个参数，第一个是 el，它表示挂载的元素，可以是字符串，也可以是 DOM 对象，如果是字符串在浏览器环境下会调用 query 方法转换成 DOM 对象的。第二个参数是和服务端渲染相关，在浏览器环境下不需要传第二个参数。

```
const instance = new ButtonCounterCom().$mount()
```

这里，$mount() 不带参数，会把组件在内存中渲染完毕。因为没有挂载到节点上，因此显示不了组件。此时的 instance 已经是一个标准的 Vue 组件实例，因此它的 $el 属性也可以被访问。

```
dom.appendChild(instance.$el)
```

instance.$el 拿到的就是组件对应的 dom 元素, 可以直接操作 dom。

### 3、vue3 需注意

![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzECRNOawiaZiaOodkerVBb9NFlaVhm8BlB0bIMDjqKO5Z4ibWOic2bMWbzw2QcD5HFaT5WVvYiavzMUPteA/640?wx_fmt=jpeg)  

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)