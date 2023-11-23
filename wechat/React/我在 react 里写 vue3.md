> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3vO9IjKH7rNtqMf7_tKfkw)

### 前言

自从`vue3.0`正式发布之后，`vue3.0`核心响应式部分被单独抽离成`@vue/reactivity`包，也就是说，我们可以脱离`vue`框架之外，单独使用`@vue/reactivity`做一些其他的愉快的事 😊，于是乎笔者突发奇想，为何不用`@vue/reactivity`在`react`中，构建响应式，省着每次调用`this.setState`,`useState`，直接通过改变`state`值，做到更新视图。

😂😂😂 说干就干，**为了可以量化生产，复用逻辑，我在`function`组件中写了一个自定义`hooks`-`useReactive` ，在`class`组件中写了一个高阶组件`reactiveHoc`**。

在 `react` 写 `vue` 是不是有点不讲武德呢?

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73zicniasdjeaU1cLbkxoDYPKEeh6HJ5ibzOAevccKNLrMDCFbuABkL4JA80GW5J7uG06wnaJHRz93fPmg/640?wx_fmt=png)

实际写这篇文章的目的是：

*   1 在重温一下`vue3.0`响应式原理，`reactive` 和 `effect`。
    
*   2 如何编写一个响应式的自定义`hooks`，学会写自定义`hook`。
    
*   3 如何编写一个响应式的`HOC`, 学会写`hoc`。
    

### 函数组件 - 自定义 hooks - useReactive

#### 编写

**useReactive 自定义 hooks**

```
import { reactive, effect  } from '@vue/reactivity'import React, {  useRef , useEffect, useMemo, useState } from 'react'function useReactive (initState){   const reactiveState = useRef(initState) // state   const [  ,forceUpdate ] = useState(0)   const state = useMemo(()=> reactive(reactiveState.current)  ,[ reactiveState.current ])   useEffect(()=>{       let isdep = false       effect(()=>{           for(let i in state ){ state[i] } //依赖收集           isdep && forceUpdate(num => num + 1)  // 强制更新           if(!isdep) isdep = true       })   },[ state ])   return state}
```

**思路：**

*   ① 用`useRef`保存响应式对象，并构建响应式，为什么选择`useRef`, 在函数组件执行更新中, 只有`Ref-Hooks`一直使用的是原始对象，这之前的`hooks`原理中讲过。这样做的好处，防止函数组件更新时候，响应式对象丢失。
    
*   ② 用`useMemo`缓存响应式对象，当`Ref`对象被篡改，重新构建响应式。
    
*   ③ 用`useEffect`做响应式的依赖收集，用开关`isdep`，防止初始化`@vue/reactivity`的 `effect`初始化执行时，引起的`forceUpdate`引发的，额外的组件更新。
    
*   ④ 用一个`useState`，做强制更新。
    
*   ⑤ 在`effect`对象中，`for(let i in state ){ state[i] }`遍历 `Ref`对象 ，做依赖收集。
    

#### 使用

```
function Index(){   const state = useReactive({ number:1  , name:'alien' })   return <div class >           <div> 你的姓名是: { state.name } </div>           <div>{ new Array(state.number).fill(0).map(()=> '👽') }</div>       </div>       <div class >            <div> <button onClick={ ()=> state.number++ } >👽++</button> </div>            <div> <button onClick={ ()=> state.number-- } >👽--</button>  </div>            <input placeholder="姓名" value={state.name}  onChange={ (e:any) =>  state.name = e.target.value   }  />       </div>   </div>}
```

#### 效果

![](https://mmbiz.qpic.cn/mmbiz_gif/lP9iauFI73zicniasdjeaU1cLbkxoDYPKEevXq0hzZBvRRnm63IhlYz0DKFFyHMwPxxuJrxfuvHq1ZKibTBbsfX1HA/640?wx_fmt=gif)响应式

### 类组件 - 反向继承 hoc-reactiveHoc

在`function`组件中，我们可以使用自定义`hook`，构建响应式; 那么在`class`类组件中，我们如何构建响应式呢，每次在业务组件中引进`reactive`和`effect`，手动绑定，显然不是很切合实际，也不是我们的追求，这个时候，`hoc`高阶组件就派上用场了。我们接着往下看：

#### 编写

**reactiveHoc 高阶组件**

```
import { reactive , effect  } from '@vue/reactivity'import React from 'react'function reactiveHoc(Component){    const self_componentDidMount = Component.prototype.componentDidMount    return class WrapComponent extends Component{        constructor(props){            super(props)            this.state = reactive(this.state)        }        __isFirst = false        componentDidMount(){            effect(()=>{                for(let i in this.state ){ this.state[i] }  //构建响应式                this.__isFirst && this.forceUpdate()                !this.__isFirst && (this.__isFirst = true )            })            self_componentDidMount && self_componentDidMount.call(this)        }    }}
```

**思路：**

*   ① **为什么要选择反向继承模式 `HOC` 呢？** ，因为我们可以通过一个反正继承的`hoc`，访问到内部的`state`状态, 对于内部的`state`，进行`reactive`响应式处理。
    
*   ② 劫持类组件周期`componentDidMount`，在`hoc`的`componentDidMount`中同样做依赖收集。
    

#### 使用

```
@reactiveHocclass Index extends React.Component{    constructor(props){        super(props)        this.state={            number:0,            name:'alien'        }    }    componentDidMount(){        console.log(6666)    }    render(){        const { state } :any= this        return <div class >            <div> 你的姓名是: { state.name } </div>            <div>{ new Array(state.number).fill(0).map(()=> '👽') }</div>        </div>        <div class >             <div> <button onClick={ ()=> state.number++ } >👽++</button> </div>             <div> <button onClick={ ()=> state.number-- } >👽--</button>  </div>             <input placeholder="姓名" value={state.name}  onChange={ (e:any) =>  state.name = e.target.value   }  />        </div>    </div>    }}
```

### 总结

本文主要的目的并不是教大家在`react`用`@vue/reactivity`构建响应式，可以当娱乐玩玩罢了，主要目的是结合上两篇文章，教大家更好编写自定义`hooks`和 `hoc`。早日进阶`react`技术栈。最后, 送人玫瑰，手留余香，觉得有收获的朋友可以给笔者**点赞，关注**一波 ，陆续更新前端超硬核文章。

#### 如果文章中，有不明白地方，建议先看往期文章：

##### react-hooks 三部曲

*   [react-hooks 如何使用？](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247483747&idx=3&sn=682f1b80542e9c1b8a560e6fdaedf49c&chksm=cfc14851f8b6c147c7faa51012f0f92f01c78b53c56e7cd15e3d03d9a987642eeb45a6a4d9a8&scene=21#wechat_redirect)
    
*   [玩转 react-hooks, 自定义 hooks 设计模式及其实战](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247484169&idx=1&sn=db83a13c9ecfe11913325559d8835a54&chksm=cfc14a3bf8b6c32dc0c16f1ec05cf986176abfb8e5a5391a6cf4d6e8ed733ed46a6b340a93c0&scene=21#wechat_redirect)
    
*   [「react 进阶」一文吃透 react-hooks 原理](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247484634&idx=1&sn=618673960ee73b55df82efe886fd6cdd&chksm=cfc14de8f8b6c4fed909929339dd7ed4092af462de88150767173baea4a7fcb3e3ed501daefd&scene=21#wechat_redirect)
    

##### react-hoc

*   [「react 进阶」一文吃透 React 高阶组件 (HOC)](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247484613&idx=1&sn=c97b435638d9b21c8869d4e51e3a295a&chksm=cfc14df7f8b6c4e19707a17691c16f43282ad10abc0fb046d4bdf5e4a83e0057e6ab72510e1e&scene=21#wechat_redirect)
    

##### vue3.0 响应式原理

*   [vue3.0 源码解析一 ：响应式原理（上)](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247483980&idx=1&sn=0df00eb991b5a5eb814697a34158bfe8&chksm=cfc14b7ef8b6c268ba0d6ef9809fde6bdd2b8d979a5e9436b0cb53a7f661852e2cdd89c019fa&scene=21#wechat_redirect)
    
*   [vue3.0 源码解析二 ：响应式原理（下)](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247484054&idx=1&sn=c25c98e2ef776e5c6871a32389163585&chksm=cfc14ba4f8b6c2b2b7c45d9a11e72abbfcc4520b84e2096b3408d45a2d8f49528057ad6b34dd&scene=21#wechat_redirect)