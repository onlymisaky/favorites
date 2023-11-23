> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/OuwyqWvLE-7AxHXw7trSNw)

前言
--

> 在这个`卷神`辈出的时代，只是熟练`Vue`的胖头鱼，已经被毒打过多次了，面试中曾被质疑：“你居然不会 React？” 我无语凝噎，不知说啥是好。

> 这篇文章尝试将`Vue`中一些常见的功能在`React`中实现一遍，如果你恰巧是`Vue`转`React`，或者`React`转`Vue`，期待对你有些帮助。

> 如果你是一名熟悉`React`和`Vue`的同学跪求轻喷（手动求生）

`每个功能，都有对应的Vue和React版本实现，也有对应的截图或者录屏`

Vue 仓库

React 仓库

1. v-if
-------

> 我们先从最常见的显示隐藏开始，Vue 中处理一个元素的显示隐藏一般会用`v-if`或者`v-show`指令，只不过`v-if`是 “真正” 的条件渲染，切换过程中条件块内的事件监听器和子组件会适当地被销毁和重建。而`v-show`就简单了，只是 css 样式上的控制。

v-if 源代码点这里

### Vue

```
<template>  <div class="v-if">    <button @click="onToggleShow">切换</button>    <div v-if="isShow">前端胖头鱼 显示出来啦</div>  </div></template><script>export default {  name: 'vif',  data () {    return {      isShow: true    }  },  methods: {    onToggleShow () {      this.isShow = !this.isShow    }  }}</script>
```

### React

vif 源代码点这里

```
import React, { useState } from "react"export default function Vif (){  const [ isShow, setIsShow ] = useState(true)  const onToggleShow = () => {    setIsShow(!isShow)  }  return (    <div class>      <button onClick={ onToggleShow }>切换</button>      {/* 也可以用三目运算符 */}      {/* { isShow ? <div>前端胖头鱼 显示出来啦</div> : null } */}      {        isShow && <div>前端胖头鱼 显示出来啦</div>      }    </div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiathYctUiaE1UfO3T5DUtDRZiazQSDOxvk2XlTy6ZVmndANylmxLibnshLeg/640?wx_fmt=gif)v-if.gif

2. v-show
---------

> 同上，这次我们通过`v-show`来实现显示隐藏的功能，同时观察 DOM 的样式变化

**注意:** 这里为啥显示的时候不设置为`block`是因为有些元素本身不是块级元素，如果强行设置为`block`有可能导致错误的样式。

### Vue

v-show 源代码点击这里

```
<template>  <div class="v-show">    <button @click="onToggleShow">切换</button>    <div v-show="isShow">前端胖头鱼 显示出来啦</div>  </div></template><script>export default {  name: 'vshow',  data () {    return {      isShow: true    }  },  methods: {    onToggleShow () {      this.isShow = !this.isShow    }  }}</script>
```

### React

vShow 源代码点这里

```
import React, { useState } from "react"export default function VShow (){  const [ isShow, setIsShow ] = useState(true)  const onToggleShow = () => {    setIsShow(!isShow)  }  return (    <div class>      <button onClick={ onToggleShow }>切换</button>      {        <div style={{ display: isShow ? '' : 'none' }}>前端胖头鱼 显示出来啦</div>      }    </div>  )}
```

### 预览

  
  

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatMSU7ErWjvnVqtaFgQ9Mp2DYfHZ7NHM987sukkbMpicl5wP6WCDr80MA/640?wx_fmt=gif)

  

3. v-for
--------

> 一般情况下，渲染一个列表在`Vue`中使用`v-for`指令，v-for 指令需要使用 `item in items` 形式的特殊语法，其中 `items` 是源数据数组，而 `item` 则是被迭代的数组元素的别名。当然了，每个元素都需要设置唯一的`key`

### Vue

v-for 源代码点这里

```
<template>  <div class="v-for">    <div       class="v-for-item"      v-for="item in list"      :key="item.id"    >      {{ item.name }}    </div>  </div></template><script>export default {  name: 'vfor',  data () {    return {      list: [        {          id: 1,          name: '前端',        },        {          id: 2,          name: '后端',        },        {          id: 3,          name: 'android',        },        {          id: 4,          name: 'ios',        },      ]    }  }}</script>
```

### React

> 在`React`没有`v-for`指令，我们可以采用`map`遍历的方式实现类似功能

vFor 源代码点这里

```
import React, { useState } from "react"export default function VFor (){  const [ list, setList ] = useState([    {      id: 1,      name: '前端',    },    {      id: 2,      name: '后端',    },    {      id: 3,      name: 'android',    },    {      id: 4,      name: 'ios',    },  ])  return (    <div class>      {        list.map((item) => {          return <div class key={ item.id }>{ item.name }</div>        })      }    </div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiaticNVOfh8ZB3iaoBs0teqp3JCyVDHmPK5icfk0EQvutfd1kLzS7zlS3JxA/640?wx_fmt=png)v-for.png

4. computed
-----------

> 当某个变量需要依赖其他变量求值时，使用计算属性会非常方便，并且`Vue`的计算属性是基于它们的响应式依赖进行缓存的，依赖值未发生变化，不会重新计算，达到缓存的作用。

我们来看一个简单的加法例子：`num3`由`num1`和`num2`相加所得，同时按钮每点一次`num1`加 10，`num3`也会跟着不断加 10

### Vue

computed 源代码点这里

```
<template>  <div class="computed">    <button @click="onAdd">+10</button>    <div>计算结果：{{ num3 }}</div>  </div></template><script>export default {  name: 'computed',  data () {    return {      num1: 10,      num2: 10,    }  },  computed: {    num3 () {      return this.num1 + this.num2    }  },  methods: {    onAdd () {      this.num1 += 10    }  }}</script>
```

### React

> `React`没有计算属性，但是我们可以通过`useMemo`这个 hook 来实现，和`Vue` computed 不太一样的地方在于，我们必须**手动维护依赖**

computed 源代码点这里

```
import React, { useMemo, useState } from "react"export default function Computed (){  const [ num1, setNum1 ] = useState(10)  const [ num2, setNum2 ] = useState(10)  const num3 = useMemo((a, b) => {    return num1 + num2  }, [ num1, num2 ])  const onAdd = () => {    setNum1(num1 + 10)  }  return (    <div class>      <button onClick={ onAdd }>+10</button>      <div>计算结果：{ num3 }</div>    </div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatkibDkArJAPBWDicawQialXA6Nsibz9C4ZktqJJWiaxFgXPl4NOWHtCIaOicw/640?wx_fmt=gif)computed.gif

5. watch
--------

> 有时候我们需要监听数据变化然后执行异步行为或者开销较大的操作时，在 Vue 中可以使用`watch`来实现

我们来模拟一个这样的场景并且通过`watch`来实现：选择`boy`或者`girl`，选中后发送请求，显示请求结果。（这里通过 setTimeout 模拟异步请求过程）

### Vue

watch 源代码点这里

```
<template>  <div class="watch">    <div class="selects">      <button         v-for="(item, i) in selects"        :key="i"        @click="onSelect(item)"      >        {{ item }}      </button>    </div>    <div class="result">      {{ result }}    </div>  </div></template><script>export default {  name: 'watch',  data () {    return {      fetching: false,      selects: [        'boy',        'girl'      ],      selectValue: ''    }  },  computed: {    result () {      return this.fetching ? '请求中' : `请求结果： 选中${this.selectValue || '~'}`    }  },  watch: {    selectValue () {      this.fetch()    }  },  methods: {    onSelect (value) {      this.selectValue = value      },    fetch () {      if (!this.fetching) {        this.fetching = true        setTimeout(() => {          this.fetching = false        }, 1000)      }    }  }}</script>
```

### React

> `React`中要实现监听某些数据的变化执行响应的动作，可以使用`useEffect`

watch 源代码点这里

```
import React, { useState, useMemo, useEffect } from "react"import './watch.css'export default function Watch() {  const [fetching, setFetching] = useState(false)  const [selects, setSelects] = useState([    'boy',    'girl'  ])  const [selectValue, setSelectValue] = useState('')  const result = useMemo(() => {    return fetching ? '请求中' : `请求结果： 选中${selectValue || '~'}`  }, [ fetching ])  const onSelect = (value) => {    setSelectValue(value)  }  const fetch = () => {    if (!fetching) {      setFetching(true)      setTimeout(() => {        setFetching(false)      }, 1000)    }  }  useEffect(() => {    fetch()  }, [ selectValue ])  return (    <div class>        {          selects.map((item, i) => {            return <button key={ i } onClick={ () => onSelect(item) }>{ item }</button>          })        }      </div>      <div class>        { result }      </div>    </div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatRtQD3ibiagiaEFznUdnPF7XxRwkeyCVm17zTial8a166E5CwMsCyNP3s1g/640?wx_fmt=gif)watch.gif

6. style
--------

> 有时候难免要给元素动态添加样式`style`，`Vue`和`React`都给我们提供了方便的使用方式。

在使用上基本大同小异：

**相同点：**

CSS property 名可以用驼峰式 (camelCase) 或短横线分隔 (kebab-case，记得用引号括起来) 来命名

**不同点：**

1.  Vue 可以通过数组语法绑定多个样式对象，React 主要是单个对象的形式（这点 Vue 也可以）
    
2.  React 会自动添加 ”px”(**这点 Vue 不会自动处理**) 后缀到内联样式为数字的属性，其他单位手动需要手动指定
    
3.  React 样式不会自动补齐前缀。如需支持旧版浏览器，需手动补充对应的样式属性。Vue 中当 v-bind:style 使用需要添加浏览器引擎前缀的 CSS property 时，如 transform，Vue.js 会自动侦测并添加相应的前缀。
    

### Vue

style 源代码点这里

```
<template>  <div class="style" :style="[ style, style2 ]"></div></template><script>export default {  name: 'style',  data () {    return {      style: {        width: '100%',        height: '500px',      },      style2: {        backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',        borderRadius: '10px',      }    }  }}</script>
```

### React

style 源代码点这里

```
import React from "react"export default function Style (){  const style = {    width: '100%',    height: '500px',  }  const style2 = {    backgroundImage: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',    borderRadius: '10px',  }  return (    <div class style={ { ...style, ...style2 } } ></div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatVYLucZNib2JMhhLuxwIYFBWQibAOiaIhs4GuaUhibNtuFFnquwhmebDwbQ/640?wx_fmt=png)style.png

7. class
--------

> 如何动态地给元素添加 class？Vue 中我自己比较喜欢用数组的语法（当然还有对象的写法），React 中也可以使用一些第三方包如 classnames 起到更加便捷添加 class 的效果。

下面我们看下不借助任何库，如何实现按钮选中的效果

### Vue

class 源代码点这里

```
<template>  <button :class="buttonClasses" @click="onClickActive">{{ buttonText }}</button></template><script>export default {  name: 'class',  data () {    return {      isActive: false,    }  },  computed: {    buttonText () {      return this.isActive ? '已选中' : '未选中'    },    buttonClasses () {   // 通过数组形式维护class动态列表         return [ 'button', this.isActive ? 'active' : '' ]    }  },  methods: {    onClickActive () {      this.isActive = !this.isActive    }  }}</script><style scoped>.button{  display: block;  width: 100px;  height: 30px;  line-height: 30px;  border-radius: 6px;  margin: 0 auto;  padding: 0;  border: none;  text-align: center;  background-color: #efefef;}.active{  background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);  color: #fff}</style>
```

### React

class 源代码点这里

```
import React, { useMemo, useState } from "react"import './class.css' // 此处样式与上面是一样的export default function Class (){  const [ isActive, setIsActive ] = useState(false)  const buttonText = useMemo(() => {    return isActive ? '已选中' : '未选中'  }, [ isActive ])  const buttonClass = useMemo(() => {    // 和Vue中不太一样的是我们需要手动join一下，变成'button active'形式    return [ 'button', isActive ? 'active' : '' ].join(' ')  }, [ isActive ])  const onClickActive = () => {    setIsActive(!isActive)  }  return (    <div className={ buttonClass } onClick={onClickActive}>{ buttonText }</div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatdcvmSRDXn09VLG0kXNqgNloxxzvVMLMd2rcLP5qwXiaiaX1akjvu6MUw/640?wx_fmt=gif)

  

8.provide/inject
----------------

> Vue 和 React 中对于全局状态的管理都有各自好的解决方案，比如 Vue 中的`Vuex`，React 中的`redux`和`Mobx`，当然小型项目中引入这些有点**大材小用**了, 有没有其他解决方案呢？

Vue 中可以使用 provide/inject

React 中则可以使用 Context

`假设全局有有一个用户信息userInfo的变量，需要在各个组件中都能便捷的访问到，在Vue和React中该如何实现呢?`

### Vue

> `Vue`中借用`provide/inject`可以将顶层状态，传递至任意子节点，假设我们再 app.vue 中声明了一个`userInfo`数据

provide 源代码点这里

**app.vue**

```
<template>  <div id="app">    <div class="title">我是Vue栗子</div>    <router-view/>  </div></template><script>export default {  name: 'app',  // 声明数据   provide () {    return {      userInfo: {        name: '前端胖头鱼'      }    }  }}</script>
```

**provide.vue**

```
<template>  <div class="provide-inject">{{ userInfo.name }}</div></template><script>export default {  name: 'provideInject',  // 使用数据  inject: [ 'userInfo' ]}</script>
```

### React

> `React`中要实现类似的功能，可以借助 Context，将全局状态共享给任意子节点

provide 源代码点这里

**context/index.js**

```
import { createContext } from "react";export const UserInfoContext = createContext({  userInfo: {    name: ''  }})
```

**app.js**

```
import { UserInfoContext } from './context/index'function App() {  return (    <BrowserRouter>      // 注意这里      <UserInfoContext.Provider        value={{ userInfo: { name: '前端胖头鱼' } }}      >        <div class element={<Vif />} />          <Route path="/v-show" element={<VShow />} />          <Route path="/v-for" element={<VFor />} />          <Route path="/computed" element={<Computed />} />          <Route path="/watch" element={<Watch />} />          <Route path="/style" element={<Style />} />          <Route path="/class" element={<Class />} />          <Route path="/slot" element={<Slot />} />          <Route path="/nameSlot" element={<NameSlot />} />          <Route path="/scopeSlot" element={<ScopeSlot />} />          <Route path="/provide" element={<Provide />} />        </Routes>      </UserInfoContext.Provider>    </BrowserRouter>  );}
```

**provide.js**

```
import React, { useContext } from "react"import { UserInfoContext } from '../context/index'export default function Provide() {  // 通过userContext，使用定义好的UserInfoContext  const { userInfo } = useContext(UserInfoContext)  return (    <div class="provide-inject">{ userInfo.name }</div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_png/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatogh8tr01v2HxiaVuic3PiaRv6z1T4ZNYcDvfiaHjO3jWcYicf4H9MCha73w/640?wx_fmt=png)4127923929-provide.png

9. slot(默认插槽)
-------------

> 插槽是`Vue`中非常实用的功能，我把他理解成”坑位 “，等待着你从外面把他填上，而这个” 坑位“可以分成`默认坑位`、`具名坑位`、`作用域坑位`，咱们通过一个实战例子来看看`React`中如何实现同等的功能。

假设我们要实现一个简单的`dialog`组件, 基本功能是标题可以传字符串，内容部分可以完全自定义，应该怎么实现呢？

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatWn7y4hictUC88u9oVkCrbxibDHEpvnnd4C3BmYJvazoR2ibodaLc5u1lQ/640?wx_fmt=gif)

  

### Vue

slot 源代码点这里

**dialog**

```
<template>  <div class="dialog" v-show="visible">    <div class="dialog-mask" @click="onHide"></div>    <div class="dialog-body">      <div class="dialog-title" v-if="title">{{ title }}</div>      <div class="dialog-main">  // 注意这里放了一个默认插槽坑位        <slot></slot>      </div>      <div class="dialog-footer">        <div class="button-cancel" @click="onHide">取消</div>        <div class="button-confirm" @click="onHide">确定</div>      </div>    </div>  </div></template><script>export default {  name: "dialog",  props: {    title: {      type: String,      default: "",    },    visible: {      type: Boolean,      default: false,    },  },  methods: {    onHide () {      this.$emit('update:visible', false)    }  }};</script>
```

**slot**

```
<template>  <div class="slot">    <button @click="onToggleVisible">切换dialog</button>    <Dialog      :visible.sync="visible"      title="默认插槽"    >   // 这里会替换到<slot></slot>的位置处   <div class="slot-body">前端胖头鱼</div>    </Dialog>  </div></template><script>import Dialog from './components/dialog.vue'export default {  name: 'slot',  components: {    Dialog,  },  data () {    return {      visible: false    }  },  methods: {    onToggleVisible () {      this.visible = !this.visible    }  }}
```

### React

> 要在 React 中同样实现上面的功能应该怎么办呢？`React`可没有啥插槽啊！别急，虽然`React`中没有插槽的概念，但是却可以通过`props.children`获取到组件内部的子元素，通过这个就可以实现默认插槽的功能

slot 源代码点这里

**Dialog**

```
import React, { useState, useEffect } from "react"import './dialog.css'export default function Dialog(props) {  // 原谅我用visible -1这种傻叉的方式先实现了, 重点不是在这里  const { children, title = '', visible = -1 } = props  const [visibleInner, setVisibleInner] = useState(false)  const onHide = () => {    setVisibleInner(false)  }  useEffect(() => {    setVisibleInner(visible > 0)  }, [ visible ])  return (    <div class style={ { display: visibleInner ? 'block' : 'none' }}>      <div class onClick={ onHide }></div>      <div class>        { title ? <div class>{ title }</div> : null }        <div class>          {/* 注意这里，通过children实现默认插槽功能 */}          {children}        </div>        <div class onClick={ onHide }>取消</div>          <div class onClick={ onHide }>确定</div>        </div >      </div >    </div >  )}
```

**slot**

```
import React, { useState, useEffect } from "react"import Dialog from './components/dialog'export default function Slot() {  const [visible, setVisible] = useState(-1)  const onToggleVisible = () => {    setVisible(Math.random())  }  return (    <div class>      <button onClick={ onToggleVisible }>切换dialog</button>      <Dialog        visible={visible}        title="默认插槽"      >        {/* 注意这里，会被Dialog组件的children读取并且替换掉 */}        <div class>前端胖头鱼</div>      </Dialog>    </div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatWn7y4hictUC88u9oVkCrbxibDHEpvnnd4C3BmYJvazoR2ibodaLc5u1lQ/640?wx_fmt=gif)

  

10. name slot(具名插槽)
-------------------

> 当组件内部有多个动态内容需要外部来填充的时候，一个默认插槽已经不够用了，我们需要给插槽取个名字，这样外部才可以” 按部就班 “到指定位置。

我们来丰富一下`Dialog`组件，假设`title`也可以支持动态传递内容呢？

### Vue

> Vue 中通过`<slot ></slot>`形式先进行插槽的声明，再通过`v-slot:main`形式进行使用，一个萝卜一个坑也就填起来了

nameSlot 源代码点这里

**Dialog 改造**

```
<template>  <div class="dialog" v-show="visible">    <div class="dialog-mask" @click="onHide"></div>    <div class="dialog-body">      <div class="dialog-title" v-if="title">{{ title }}</div>      <!-- 注意这里，没有传title属性，时候通过插槽进行内容承接 -->      <slot >        <!-- 声明main部分 -->        <slot  @click="onHide">取消</div>        <div class="button-confirm" @click="onHide">确定</div>      </div>    </div>  </div></template>// ... 其他地方和上面试一样的
```

**nameSlot**

```
<template>  <div class="slot">    <button @click="onToggleVisible">切换dialog</button>    <Dialog      :visible.sync="visible"    >      <template v-slot:title>        <div class="dialog-title">具名插槽</div>      </template>      <template v-slot:main>        <div class="slot-body">前端胖头鱼</div>      </template>    </Dialog>  </div></template><script>import Dialog from './components/dialog.vue'export default {  name: 'nameSlot',  components: {    Dialog,  },  data () {    return {      visible: false    }  },  methods: {    onToggleVisible () {      this.visible = !this.visible    }  }}</script>
```

### React

> 前面通过`props.children`属性可以读取组件标签内的内容算是和`Vue`默认插槽实现了一样的功能，但是具名插槽如何实现呢？`React`好玩的其中一个点，我觉得是属性啥玩意都可以传、`字符串`、`数字`、`函数`、`连DOM`也可以传。所以实现具名插槽也很简单，直接当属性传递就可以

nameSlot 源代码点这里

**Dialog 改造**

```
import React, { useState, useEffect } from "react"import './dialog.css'export default function Dialog(props) {  // 原谅我用visible -1这种傻叉的方式先实现了, 重点不是在这里  const { title, main, visible = -1 } = props  const [visibleInner, setVisibleInner] = useState(false)  const onHide = () => {    setVisibleInner(false)  }  useEffect(() => {    setVisibleInner(visible > 0)  }, [ visible ])  return (    <div class style={ { display: visibleInner ? 'block' : 'none' }}>      <div class onClick={ onHide }></div>      <div class>        {/* { title ? <div class>{ title }</div> : null } */}        {/* 注意这里，直接渲染title就可以了 */}        { title }        <div class>          {/* 注意这里，通过children实现默认插槽功能 */}          {/* {children} */}          {/* 这一这里不是children了，是main */}          { main }        </div>        <div class onClick={ onHide }>取消</div>          <div class onClick={ onHide }>确定</div>        </div >      </div >    </div >  )}
```

**nameSlot**

```
import React, { useState } from "react"import Dialog from './components/dialog'import './slot.css'export default function NameSlot() {  const [visible, setVisible] = useState(-1)  const onToggleVisible = () => {    setVisible(Math.random())  }  return (    <div class>      <button onClick={ onToggleVisible }>切换dialog</button>      <Dialog        visible={visible}        // 注意这里，直接传递的DOM        title={ <div class>默认插槽</div> }        // 注意这里，直接传递的DOM        main={ <div class>前端胖头鱼</div> }      >      </Dialog>    </div>  )}
```

### 预览

> 可以看到具名插槽，`React`直接用属性反而更简洁一些

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiatzQWFld6Fe5eLGgUico0kVazULjPibvvUZgQpAeQWyZ0YKCN4xGp0lKLw/640?wx_fmt=gif)具名插槽. gif

11. scope slot(作用域插槽)
---------------------

> 有了`默认插槽`、`具名插槽`最后当然少不了作用域插槽啦！有时让插槽内容能够访问子组件中才有的数据是很有用的，这也是作用域插槽的意义所在

假设：`Dialog`组件内部有一个`userInfo: { name: '前端胖头鱼' }`数据对象，希望使用`Dialog`组件的外部插槽也能访问到，该怎么做呢？

### Vue

scopeSlot 源代码点这里

**Dialog**

```
<template>  <div class="dialog" v-show="visible">    <div class="dialog-mask" @click="onHide"></div>    <div class="dialog-body">      <div class="dialog-title" v-if="title">{{ title }}</div>      <!-- 注意这里，通过绑定userInfo外部可以进行使用 -->      <slot >     <!-- 注意这里，通过绑定userInfo外部可以进行使用 -->        <slot  @click="onHide">取消</div>        <div class="button-confirm" @click="onHide">确定</div>      </div>    </div>  </div></template><script>export default {  name: "dialog",  // ...  data () {    return {      userInfo: {        name: '前端胖头鱼'      }    }  },  // ... };</script>
```

**scopeSlot**

```
<template>  <div class="slot">    <button @click="onToggleVisible">切换dialog</button>    <Dialog      :visible.sync="visible"    >      <template v-slot:title>        <div class="dialog-title">作用域插槽</div>      </template>      <!-- 注意这里 -->      <template v-slot:main="{ userInfo }">        <!-- 注意这里userInfo是Dialog组件内部的数据 -->        <div class="slot-body">你好{{ userInfo.name }}</div>      </template>    </Dialog>  </div></template>
```

### React

> 还是那句话，React 中万物皆可传，类似实现具名插槽中我们直接传递 DOM，同样我们也可以传递函数，将`Dialog`组件内部的`userInfo`数据通过函数传参的方式给到外部使用

scopeSlot 源代码点这里

**Dialog 改造**

```
import React, { useState, useEffect } from "react"import './dialog.css'export default function Dialog(props) {  // 原谅我用visible -1这种傻叉的方式先实现了, 重点不是在这里  const { title, main, visible = -1 } = props  const [visibleInner, setVisibleInner] = useState(false)  const [ userInfo ] = useState({    name: '前端胖头鱼'  })  const onHide = () => {    setVisibleInner(false)  }  useEffect(() => {    setVisibleInner(visible > 0)  }, [ visible ])  return (    <div class style={ { display: visibleInner ? 'block' : 'none' }}>      <div class onClick={ onHide }></div>      <div class>        {/* 作用域插槽，当函数使用，并且把数据传递进去 */}        { title(userInfo) }        <div class>          {/* 作用域插槽，当函数使用，并且把数据传递进去 */}          { main(userInfo) }        </div>        <div class onClick={ onHide }>取消</div>          <div class onClick={ onHide }>确定</div>        </div >      </div >    </div >  )}
```

**scopeSlot**

```
import React, { useState } from "react"import Dialog from './components/dialog'import './slot.css'export default function ScopeSlot() {  const [visible, setVisible] = useState(-1)  const onToggleVisible = () => {    setVisible(Math.random())  }  return (    <div class>      <button onClick={ onToggleVisible }>切换dialog</button>      <Dialog        visible={visible}  // 通过函数来实现插槽        title={ () => <div class>作用域插槽</div> }  // 接收userInfo数据        main={ (userInfo) => <div class>你好{ userInfo.name }</div> }      >      </Dialog>    </div>  )}
```

### 预览

![](https://mmbiz.qpic.cn/mmbiz_gif/d3KxlCFgM07pMmicUqLXr4ZricQ7AFlLiateUXk2xHYibsO2IW2cibQeib4QDiavOad3yiaFfZeWC9voibX3QQ36Z8iaGPOg/640?wx_fmt=gif)作用域插槽. gif

- END -
-------

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECqoVbtplgn1lGUicQXib1OKicq8iaxkE3PtFkU0vKvjPRn87LrAgYXw6wJfxiaSQgXiaE3DWSBRDJG39bA/640?wx_fmt=png)