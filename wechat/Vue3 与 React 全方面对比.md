> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MzEw2dpV5FAoeRQXrWaMXw)

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

### 1. 编程风格 & 视图风格  

1.1 编程风格
--------

1.  `React` 语法少、难度大；`Vue` 语法多，难度小
    

例如指令：

**Vue**

```
<input v-model="username"/>

<ul>
    <li v-for="(item,index) in list" :key="index">{{ item }}</li>
</ul>
复制代码


```

**React**

```
<input value={username} onChange={e => setUsername(e.target.value)}/>


<ul>
{ list.map((item,index) => <li key={index}>{item}</li>) }
</ul>
复制代码


```

`Vue` 给我们提供了很多的指令功能，而这些功能在 `React` 中基本都需要我们使用原生 `js` 来实现。

所以会有很多人说: "使用 Vue 实际上你就是在操作 Vue，使用 React 实际上你是在操作 js"。

2.  React 魔改少，手动实现；Vue 魔改多，自动完成。
    

例如事件：

**Vue**

```
<button @click="handleClick('hello')">点击</button>

const handleClick = (msg) => {
  console.log('msg')
}
复制代码


```

**React**

```
<button onClick="handleClick('hello')">点击</button>

const handleClick = (msg) => {
    return () => {
        console.log(msg)
    }
}
复制代码


```

像在点击事件中传参数这种功能：

1.  我们知道 `dom` 的点击事件是需要我们传递一个函数过去的，就像在 `React` 中例子一样，你的 `handleClick` 肯定需要返回一个函数（或者在 `jsx` 中写箭头函数调用 `handleClick`）。
    
2.  而在 `Vue` 中可以在 `@click` 中直接调用 `handleClick` 函数，而这个函数又没有返回一个新的函数，按道理这样调用 `handleClick` 是会返回 `undefined` 的，但是由于 `Vue` 底层做了魔改优化，使得我们不再需要在返回一个函数。
    

上面两个例子中，我们说不上哪种好哪种不好，只能说你更喜欢哪一种。`React` 中的实现更符合 `js` 的逻辑但却稍显麻烦，`Vue` 中的实现简单但却没有遵循原生 `js` 的特点。

编程风格上的总结：就像我们前面讲的，`Vue` 写起来更像是写 `Vue` 代码，`React` 写起来更像是写 `JavaScript` 代码。

1.2 视图风格
--------

1.  `Vue` 采用 `<template>` 字符串模板。更贴近 `HTML`，学习成本低，但有时候不灵活。
    
2.  `React` 采用 `JSX` 语法，更类似于 `js` ，限制比较多，（像一些关键字 `class`、`for`，单标签要闭合、属性要驼峰、组件名要大写等等这些都要注意），但是可以跟模板语法很好的进行结合
    

比如下面是一个通过 `level` 的值来渲染不同的标签在 `Vue` 和 `React` 中的不同实现

**Vue**

```
<template>
    <h1 v-if="level === 1">标题1</h1>
    <h2 v-if="level === 2">标题2</h1>
</template>
复制代码


```

**React**

```
let App = () => {
    const level = 1
    const Tag = 'h' + level
    return (
        <div>
            { <Tag>标题{level}</Tag>}
        </div>
    )
}
复制代码


```

可以想象，如果当我们的条件判断很多时，使用 `JSX` 的方式会比使用模版字符串要灵活的多。

**注意**: `Vue` 一开始并不直接支持 `JSX` ，在 `Vue 2.1.0` 版本中，`Vue` 引入了 `render` 函数来代替模板，这使得使用 `JSX` 作为组件渲染函数成为可能。在`Vue 2.1.0`版本后的 `create-vue` 和 `Vue CLI` 都有预置的 `JSX` 语法支持。所以说在 `Vue` 中如果你想写 `JSX` 这个它也是支持的，但是在 `React` 是没办法用字符串模板的方式写。

2. 组件 & 路由 & 状态管理
=================

2.1 组件风格
--------

1.  `Vue2` 中采用 **选项式 API**，但是由于它**不够灵活**，而且 `this` 指向不够简单，`Vue3` 中给我们提供了 **组合式 API** 的写法，**组合式 API** 更偏向函数式编程的方式，它的复用能力和组合的能力更强，而且没有 `this` 指向问题，也是 `Vue` 比较推荐的写法。
    
2.  `React` 在 `16.8` 版本之前都是采用**类组件**的方式开发，**类组件**也会有 `this` 指向以及写起来很**繁琐难度大**的问题，在 `16.8` 之后 `React` 提供了**函数组件**的写法，其**实函数组件**和 `Vue` 的 **组合式 API** 是很像的，它的组合和复用的能力更强，而且也没有 `this` 指向问题，比类组件写起来简单很多，也是 `React` 比较推荐的写法
    

**Vue 组件示意图：**

```
<template>
  <div class="my-component">
    <!-- HTML模板 -->
  </div>
</template>

<script>
export default {
  // JavaScript代码
}
</script>

<style>
.my-component {
  /* CSS样式 */
}
</style>
复制代码


```

**React 组件示意图：**

```
import React from 'react';
import './MyComponent.css';

function MyComponent() {
  // JavaScript代码
  return (
    <div class>
      {/* HTML模板 */}
    </div>
  );
}

export default MyComponent;
复制代码


```

总结：这两种框架它们的最终趋势都是函数式编程，不管是 `Vue` 还是 `React` 都是推荐我们引入大量内置的函数或者是 use 函数来进行组合并且完成我们的开发需求。而简化使用面向对象或者是配置的写法，能简化我们使用 `this` 的场景从而提升代码的灵活度和简易度。

2.2 路由风格
--------

`Vue` 采用 `Vue-Router`；React 采用 `React-Router`

相比而言 `vue` 语法更加简练（useRouter useRoute），而 `react` 的 use 函数太多，不够统一化（useLocation、useParams、useSearchParams、useNavigate......）

而像下面这些常规的功能它们都是大差不差的：

1.  路由表的配置
    
2.  嵌套路由
    
3.  动态路由
    
4.  编程式路由
    
5.  守卫路由
    

**Vue-Router 示例代码**

```
<!-- index.html -->
<div id="app">
  <router-view></router-view>
</div>
复制代码


```

```
// main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import About from './components/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})

const app = createApp({
  // 空的 `setup` 函数
  setup() {}
})

app.use(router)
app.mount('#app')
复制代码


```

```
<!-- Home.vue -->
<template>
  <div>
    <h1>Home Page</h1>
    <button @click="goToAbout">Go to About Page</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAbout = () => {
  router.push('/about')
}
</script>
复制代码


```

```
<!-- About.vue -->
<template>
  <div>
    <h1>About Page</h1>
    <p>Param: {{ $route.params.id }}</p>
    <router-link to="/">Go to Home Page</router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id
</script>

复制代码


```

**React-Router 示例代码**

```
import React from 'react'
import { BrowserRouter as Router, Switch, Route, Link, useParams, useHistory } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'

const App = () => {
  return (
    <Router>
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>

        <hr/>

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

const Home = () => {
  const history = useHistory()
  const handleClick = () => {
    history.push('/about')
  }
  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleClick}>Go to About Page</button>
    </div>
  )
}

const About = () => {
  const { id } = useParams()
  return (
    <div>
      <h1>About Page</h1>
      <p>Param: {id}</p>
      <Link to="/">Go to Home Page</Link>
    </div>
  )
}

export default App

复制代码


```

2.3 状态管理风格
----------

`Vue` 采用 `Vuex/Pinia` ；`React` 采用 `Redux/Mobx`

区别：

1.  语法和 `API` 的不同：`Vuex` 和 `Pinia` 是专门为 `Vue.js` 设计的状态管理库，因此它们的语法和 API 都非常类似。而 `Redux` 和 `Mobx` 可以在任何 `JavaScript` 应用程序中使用，因此**它们的语法和 API 与特定的框架无关**。
    
2.  数据流的不同：在 `Redux` 中，数据是通过单向数据流进行管理的，即 `action -> reducer -> store -> view`。而在 `Vuex` 和 `Pinia` 中，数据是通过 `Vuex store` 或 `Pinia store` 直接管理的，不需要 `reducer`。而在 `Mobx` 中，数据则是通过响应式数据实现的。
    
3.  异步处理的不同：在 `Redux` 中，异步处理通常需要使用中间件来处理异步操作。而在 `Vuex` 和 `Pinia` 中，异步操作可以通过 `actions` 处理。而在 `Mobx` 中，则可以使用 `async/await` 或 `reaction` 函数来处理异步操作。
    
4.  开销和复杂性的不同：`Redux` 和 `Mobx` 都需要在应用程序中进行额外的设置和配置，并且在处理大量数据时可能会导致性能问题。而 `Vuex` 和 `Pinia` 的设置和配置相对简单，并且在大多数情况下可以处理大量数据。
    

总的来说，`Vuex` 和 `Pinia` 适用于 `Vue.js` 应用程序，**提供了一种简单和直接的状态管理方式**，而 `Redux` 和 `Mobx` 则可以在多种应用程序中使用，**提供了更灵活的状态管理方案**。

**Pinia 示例代码**

```
// store.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++
    },
  },
})
复制代码


```

```
<!-- App.vue -->
<template>
  <div>
    <h1>Count: {{ count }}</h1>
    <button @click="incrementCount">Increment</button>
  </div>
</template>

<script setup>
import { defineComponent } from 'vue'
import { useCounterStore } from './store'

const counterStore = useCounterStore()
const count = counterStore.count
const incrementCount = () => {
  counterStore.increment()
}
</script>

<!-- 在根组件中注入 store -->
<script>
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
</script>

复制代码


```

**Redux Toolkit 示例代码**

```
// store.js
import { configureStore, createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    count: 0
  },
  reducers: {
    increment(state) {
      state.count++
    }
  }
})

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer
  }
})

export const { increment } = counterSlice.actions;
复制代码


```

```
// App.js
import { useSelector, useDispatch } from 'react-redux'
import { increment } from './store'

function App() {
  const count = useSelector(state => state.counter.count)
  const dispatch = useDispatch()

  const incrementCount = () => {
    dispatch(increment())
  }

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={incrementCount}>Increment</button>
    </div>
  )
}

export default App

// 在根组件中注入 store
import { Provider } from 'react-redux'
import { store } from './store'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
复制代码


```

3. 一些基础功能
=========

3.1 模板对比
--------

`Vue` 的视图变化主要通过：指令 + 模板的方式

`React` 的视图变化主要通过：原生 JS + 模板的方式

`React` 的模板比较强大，因为可以编写 `JSX` 结构，所以可以做出更加灵活的结构处理。

3.2 样式对比
--------

`Vue` 的 `class` 和 `style` 都有三种写法：字符串、数组、对象

`React` 的 `style` 只能写对象，`class` 只能字符串，可借助 `classnames` 这个库

两个框架基本上都可以满足常见的样式需求。

3.3 事件对比
--------

`Vue` 事件功能丰富

`React` 事件传参需要高阶处理

```
<!-- Vue -->
<template>
    <ul>
        <li v-for="item,index in list" @click="handleClick(index)"></li>
    </ul>
</template>
<script>
methods: {
 handleClick(index){
 
    }
}
</script>
复制代码


```

```
<!-- React -->
<ul>
{ 
    list.map((v, i)=> <li onClick={handleClick(i)}></li>)
}
</ul>
const handleClick = (index) => {
    return () => {
        console.log(index)
    }    
}

复制代码


```

3.4 表单对比
--------

`Vue` 表单双向绑定 `v-model`

`React` 表单受控与非受控

针对表单操作这一块来说，`Vue` 的表单指令 `v-model` 还是非常灵活的，总体对比要比 `React` 使用方便且灵活。

3.5 组件通信对比
----------

`Vue` 父子组件通过 `props`属性通信，子父组件通过 `emits` 方法通信

`React` 父子组件也是通过 `props`属性通信，而子父组件则是通过回调函数通信的

`emits` 自定义事件和回调函数，实际上是一样的思想。

跨组件的通信方案也很类似，都是一种依赖注入的方式来实现的。

3.6 逻辑复用
--------

`Vue` 选项式采用：`mixins混入`；组合式采用：`use函数`

`React` 类组件采用：`Render Props`、`HOC`；函数组件：`use函数`

可以发现组合式 API 和函数组件都是采用 use 函数，所以基本复用是差不多的思想，这也是两个框架推荐的用法。

3.7 内容分发
--------

`Vue` 通过插槽，进行接收

`React` 通过 `props.children`，进行接收

3.8 DOM 操作
----------

`Vue` 通过 `ref` 属性

`React` 也通过 `ref` 属性处理

思路都是差不多的，就是给元素添加 `ref` 属性，在跟对象或字符串绑定在一起，这样就可以直接获取到 `DOM` 元素。

4. 响应式 & 生命周期 & 副作用
===================

4.1 响应式数据对比
-----------

Vue 采用响应式数据，底层通过 new Proxy() 进行监控，灵活性更高

React 采用 state 状态，通过 setState() 方法进行内部 re-render，可控性更强

4.2 生命周期对比
----------

Vue 生命周期钩子 (常见)

1.  beforeCreate
    
2.  created
    
3.  beforeMount
    
4.  mounted
    
5.  beforeUpdate
    
6.  updated
    
7.  beforeUnmount
    
8.  unmounted
    

React 生命周期钩子 (常见)

1.  constructor
    
2.  componentDidMount
    
3.  componentDidUpdate
    
4.  componentWillUnmount
    
5.  render 整体对比来看，`Vue` 的生命周期会更丰富一些，`React` 生命周期会更简约一些。
    

4.3 副作用处理对比
-----------

vue 使用，watchEffect()

react 使用，useEffect()

都是处理副作用的方法，用法上还是有很大区别的。

watchEffect 会自动根据所依赖的值进行重渲染，而 useEffect 要明确指定对应的值才能进行重渲染，React 团队已经给出在未来的版本中可能会改成根据所依赖的值自动进行重渲染的操作，但暂时还不行。

watchEffect 在更新前和卸载前触发的方式是通过回调函数的参数被调用来实现的，而 useEffect 是通过 return 的返回值来指定的。

```
// Vue
watchEffect((cb)=>{
 cb(()=>{
       //更新前的触发
    })
})
复制代码


```

```
// React
useEffect(()=>{
   return ()=>{
      //更新前的触发
   }
})


```

结语
--

> 作者：前端要努力 QAQ  
> 链接：https://juejin.cn/post/7210918245993611301  
> 来源：稀土掘金

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```