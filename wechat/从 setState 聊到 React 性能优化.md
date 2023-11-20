> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/rmUCfWoyMF8JdgSwUQ89Nw)

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLu6MzHFzwvqOFw9EY2xrIniaBgKlkNtRMvDxQksUcFvK1B6KOjIIGib6fw/640?wx_fmt=jpeg)作者：风不识途

https://segmentfault.com/a/1190000039776687

setState 的同步和异步  

------------------

### 1. 为什么使用 setState

*   开发中我们并**不能直接通过修改** `state` 的值来**让界面发生更新**：
    

*   因为我们修改了 `state` 之后, 希望 `React` 根据最新的 `Stete` 来重新渲染界面, 但是这种方式的修改 `React` 并不知道数据发生了变化
    
*   `React` 并没有实现类似于 `Vue2` 中的 `Object.defineProperty` 或者 `Vue3` 中的`Proxy`的方式来监听数据的变化
    
*   我们必须通过 `setState` 来告知 `React` 数据已经发生了变化
    

*   疑惑: 在组件中并没有实现 `steState` 方法, 为什么可以调用呢?
    

*   原因很简单: `setState`方法是从 `Component` 中**继承过来的**
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLut2EoPL4WwF6Bibc7hxBn282LtV7pqJOaM9XBIib9mlRAgH1yNKxC5w3w/640?wx_fmt=png)

### 2.setState 异步更新

**setState 是异步更新的** ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLujtjibuVLeAkQ11mY460sjzlsHAPhtdthkA0dqFc1u92jVQV5Hq8xUmw/640?wx_fmt=png)

*   为什么`setState`设计为异步呢?
    

*   `setState` 设计为异步其实之前在 `GitHub` 上也有很多的讨论
    
*   React 核心成员（Redux 的作者）Dan Abramov 也有对应的回复, 有兴趣的可以看一下
    

*   简单的总结: `setState`设计为异步, 可以**显著的提高性能**
    

*   如果每次调用 `setState` 都进行一次更新, 那么意味着 `render` 函数会被频繁的调用界面重新渲染, 这样的效率是很低的
    
*   **最好的方法是获取到多个更新, 之后进行批量更新**
    

*   如果同步更新了 `state`, 但还没有执行 `render` 函数, 那么`state`和`props`不能保持同步
    

*   `state`和`props`不能保持一致性, 会在开发中产生很多的问题
    

### 3. 如何获取异步的结果

*   如何获取 `setState` 异步更新`state`后的值?
    
*   方式一: `setState`的回调
    

*   `setState`接收两个参数: 第二个参数是回调函数 (`callback`), 这个回调函数会在`state`**更新后执行**
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuxzDHCnPp2qSQQlLXkeY0s4BTK5riaU2qjHWWwqmWClltjoLHNOfibTYA/640?wx_fmt=png)

*   方式二: `componentDidUpdate`生命周期函数
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLultEYygPS8y204mh3LD6ibcWoMAUoLuibicKM9Lx0qe6pbkjY7ZDXAEwQA/640?wx_fmt=png)

### 3.setState 一定是异步的吗?

> *   其实可以分成两种情况
>     
> *   在组件生命周期或 React 合成事件中, `setState`是异步的
>     
> *   在`setTimeou`或原生 DOM 事件中, `setState`是同步的
>     

*   验证一: 在`setTimeout`中的更新 —> 同步更新
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuXPtCxb0SMB9tiab5oVXQfFAJiaqGVN2K1u6ptx3xYmkvkqt2oFaFGNFw/640?wx_fmt=png)

*   验证二: 在原生`DOM`事件 —> 同步更新
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuWjBvJfhcucKwJp7q2IxpVib1RssdVHAoBZRVO0ZItoQ2nDpWE8fFgZQ/640?wx_fmt=png)

### 4. 源码分析

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLud8MS8ksxyKknib0uicO3tBIQQ5N26kqZSHKD5u1jfzpoDEiaCyvTqdgjA/640?wx_fmt=png)

setState 的合并
------------

### 1. 数据的合并

*   通过`setState`去修改`message`，是**不会对其他** `state` 中的数据产生影响的
    

*   源码中其实是有对 **原对象** 和 **新对象** 进行合并的
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuCXW2OxVvVhiajGJdk6k69xibWe9jicEZw9jX90V4MCJh3gEOt0KP9wy4g/640?wx_fmt=png)

### 2. 多个 state 的合并

*   当我们的**多次调用**了 `setState`, **只会生效最后一次**`state`
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuVvG3ibsyKXianiaT0SO9NvBwWYU25VicbcrlFlToY5xz6XSjJuCTEP6VWA/640?wx_fmt=png)

*   `setState`合并时进行累加: **给 setState 传递函数**, 使用前一次`state`中的值
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuac2szrs1n6dGicZ5DUE1Xor5lf5icSw9Y19oXibfeCVCqXNXxn80Z22Dg/640?wx_fmt=png)

React 更新机制
----------

### 1.React 更新机制

*   我们在前面已经学习`React`的渲染流程：
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuGY6orUYNwCBb7pBy438X5zB5MUiadiaU7qdwfEkyxNROickuCbicsUcfcw/640?wx_fmt=png)

*   那么 React 的更新流程呢?
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLu7HbW3UzMaFKtq16Dqr55ale19D18j4fpDKuvFg25EllNYlCexXMCZg/640?wx_fmt=png)

*   React 基本流程
    

### 2.React 更新流程

*   `React`在 `props` 或 `state` 发生改变时，会调用 `React` 的 `render` 方法，会创建一颗不同的树
    
*   `React`需要基于这两颗不同的树之间的差别来判断如何有效的更新`UI`：
    
*   如果一棵树参考另外一棵树进行完全比较更新, 那么即使是最先进的算法, 该算法的复杂程度为 O(n 3 ^3 3)，其中 n 是树中元素的数量
    

*   如果在 `React` 中使用了该算法, 那么展示 `1000` 个元素所需要执行的计算量将在`十亿`的量级范围
    

*   这个开销太过昂贵了, React 的更新性能会变得非常低效
    
*   于是，`React`**对这个算法进行了优化**，将其优化成了`O(n)`，如何优化的呢？
    

*   **同层节点之间相互比较**，**不会跨节点比较**
    
*   **不同类型的节点，产生不同的树结构**
    
*   **开发中，可以通过 key 来指定哪些节点在不同的渲染下保持稳定**
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuhM83qMnwSLbYy9vicicGEKm327zJbV6FyACDK2Vcag03VO7KDGW0iasYw/640?wx_fmt=png)

#### 情况一: 对比不同类型的元素

*   当**节点为不同的元素**，**React 会拆卸原有的树**，**并且建立起新的树**：
    

*   当一个元素从 `<a>` 变成 `<img>`，从 `<Article>` 变成 `<Comment>`，或从 `<button>` 变成 `<div>` **都会触发一个完整的重建流程**
    
*   当卸载一棵树时，对应的`DOM`节点也会被销毁，组件实例将执行 `componentWillUnmount()` 方法
    
*   当建立一棵新的树时，对应的 `DOM` 节点会被创建以及插入到 `DOM` 中，组件实例将执行 `componentWillMount()` 方法，紧接着 `componentDidMount()` 方法
    

*   比如下面的代码更改：
    

*   **React 会销毁 Counter 组件并且重新装载一个新的组件，而不会对 Counter 进行复用**
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuDfZEqanxXdpPnTQIe5LLwicKnrGZz3nYfor6rZjYPpGLsobaHT6IvNw/640?wx_fmt=png)

#### 情况二: 对比同一类型的元素

*   **当比对两个相同类型的 React 元素时，React 会保留 DOM 节点**，**仅对比更新有改变的属性**
    
*   比如下面的代码更改：
    

*   通过比对这两个元素，`React`知道只需要修改 `DOM` 元素上的 `className` 属性
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuC97CkvNROqzG8C3kRUP61V2wTKMgTZ0Y6p1ibOibQG5U2Hpj16ib4Uia6Q/640?wx_fmt=png)

*   比如下面的代码更改：
    

*   当更新 `style` 属性时，`React` 仅更新有所改变的属性。
    
*   通过比对这两个元素，`React` 知道只需要修改 `DOM` 元素上的 `color` 样式，无需修改 `fontWeight`
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuMTvobh8PtZNEW8tfxlMeuyAh52Ycxsqh9icf0CZe626OYWuhBUBjJVg/640?wx_fmt=png)

*   如果是同类型的组件元素：
    

*   组件会保持不变，`React`会更新该组件的`props`，并且调用`componentWillReceiveProps()` 和 `componentWillUpdate()` 方法
    
*   下一步，调用 `render()` 方法，`diff` 算法将在之前的结果以及新的结果中进行递归
    

#### 情况三: 对子节点进行递归

*   在默认条件下，当递归 `DOM` 节点的子元素时，`React` 会同时遍历两个子元素的列表；当产生差异时，生成一个 `mutation`
    

*   我们来看一下在最后插入一条数据的情况：👇
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLugL3lF2h4iauRYqz44ibl3fnKpNIUFnjJTP4Wb5zkQuQNULQQxBQNMD9Q/640?wx_fmt=png)
    
*   **前面两个比较是完全相同的，所以不会产生 mutation**
    
*   **最后一个比较，产生一个 mutation，将其插入到新的 DOM 树中即可**
    

*   但是如果我们是在前面插入一条数据：
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuTn1CZcHDlt2Ma9m9lKpdcSN5g6VkHlUI2wXWMQ8GlibBTic3MeIEH1qA/640?wx_fmt=png)
    

*   **React 会对每一个子元素产生一个 mutation，而不是保持 `<li>星际穿越</li>` 和 `<li>盗梦空间</li>`的不变**
    
*   **这种低效的比较方式会带来一定的性能问题**
    

React 性能优化
----------

### 1.key 的优化

*   我们在前面遍历列表时，总是会提示一个警告，让我们加入一个`key`属性：
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuUtN45c0PBRlJ3cnK3zib2KPv8my303PwSDqp72NF8mv8yKyKzusmasA/640?wx_fmt=png)

*   方式一：在最后位置插入数据
    

*   这种情况，有无`key`意义并不大
    

*   方式二：在前面插入数据
    

*   这种做法，在没有 `key` 的情况下，所有的`<li>`都需要进行修改
    

*   在下面案例: 当子元素 (这里的`li`元素) 拥有 `key` 时
    

*   `React` 使用 `key` **来匹配原有树上的子元素以及最新树上的子元素**：
    
*   下面这种场景下, key 为 111 和 222 的元素**仅仅进行位移**，不**需要进行任何的修改**
    
*   将`key`为 `333` 的元素插入到最前面的位置即可
    

> `key`的注意事项：
> 
> *   `key`应该是唯一的
>     
> *   `key`不要使用随机数（随机数在下一次 render 时，会重新生成一个数字）
>     
> *   使用`index`作为`key`，对性能是没有优化的
>     

### 2.render 函数被调用

*   我们使用之前的一个嵌套案例：
    

*   在 App 中，我们增加了一个计数器的代码
    

*   当点击 `+1` 时，会重新调用 `App` 的 `render` 函数
    

*   **而当 App 的 render 函数被调用时，所有的子组件的 render 函数都会被重新调用**
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuXh12W7HdPg8A3GWm8dxZWsN0lXTONNvp0jmNqibBniaoWXeLZbKJEBCg/640?wx_fmt=png)

*   **那么，我们可以思考一下，在以后的开发中，我们只要是修改 了 App 中的数据，所有的子组件都需要重新`render`，进行 `diff` 算法，性能必然是很低的：**
    

*   事实上，很多的组件没有必须要重新`render`
    
*   **它们调用 render 应该有一个前提**，就是**依赖的数据** (state、 props) **发生改变时**，**再调用自己的`render`方法**
    

*   如何来控制 `render` 方法是否被调用呢？
    

*   通过`shouldComponentUpdate`方法即可
    

### 3.shouldComponentUpdate

> `React`给我们提供了一个生命周期方法 `shouldComponentUpdate`（很多时候，我们简称为`SCU`），这个方法接受参数，并且需要有返回值；主要作用是：** 控制当前类组件对象是否调用`render`** 方法

*   该方法有两个参数:
    
*   参数一: `nextProps`修改之后, 最新的 `porps`属性
    
*   参数二: `nextState` 修改之后, 最新的 `state` 属性
    
*   该方法**返回值**是一个 booolan 类型
    
*   返回值为`true`, 那么就需要调用 `render` 方法
    
*   返回值为`false`, 那么不需要调用 `render` 方法
    
*   比如我们在 App 中增加一个`message`属性:
    
*   `JSX`中并**没有依赖**这个`message`, 那么**它的改变不应该引起重新渲染**
    
*   但是通过`setState`修改 `state` 中的值, 所以最后 `render` 方法还是被重新调用了
    

```
// 决定当前类组件对象是否调用render方法// 参数一: 最新的props// 参数二: 最新的stateshouldComponentUpdate(nextProps, nextState) {  // 默认是: return true  // 不需要在页面上渲染则不调用render函数  return false}
```

### 4.PureComponent

*   如果所有的类, 我们都需要手动来实现 `shouldComponentUpdate`, 那么会给我们开发者增加非常多的工作量
    

*   我们设想一下在`shouldComponentUpdate`中的**各种判断目的是什么**?
    
*   `props` 或者 `state` 中数据是否发生了改变, 来决定`shouldComponentUpdate`返回 `true` 或 `false`
    

*   事实上 `React` 已经考虑到了这一点, 所以 `React` 已经默认帮我们实现好了, 如何实现呢？
    

*   将 class 继承自 PureComponent
    
*   内部会进行**浅层对比**最新的 `state` 和 `porps` , 如果组件内没有依赖 `porps`或`state` 将不会调用`render`
    
*   解决的问题: 比如某些子组件没有依赖父组件的`state`或`props`, 但却调用了`render`函数
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuHOI3RicibDACNbN8rFuUibcpRXTkeicgalwibC3GcyOLb2GbXDJvJiaRUnDA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLu1ia8RTOHnlN5L30JxJQTvmsYq8jicFbFMuOHTo9Cb1kzII7miaQt32iatw/640?wx_fmt=png)

### 5.shallowEqual 方法

> 这个方法中，调用 `!shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)`，这个 `shallowEqual` 就是进行**浅层比较：**
> 
> ![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuVhWiaInNu9tqQo2rvH4REHfXVwvcibZJytROUOKXNFiayxVOeLIX0TZpA/640?wx_fmt=png)

### 6. 高阶组件 memo

*   **函数式组件如何解决**`render`: 在没有依赖 `state` 或 `props` 但却重新渲染 `render` 问题
    

*   我们需要使用一个高阶组件`memo`：
    
*   我们将之前的 Header、Banner、ProductList 都通过 memo 函数进行一层包裹
    
*   Footer 没有使用 memo 函数进行包裹；
    
*   最终的效果是，当`counter`发生改变时，Header、Banner、ProductList 的函数不会重新执行，而 Footer 的函数会被重新执行
    

```
import React, { PureComponent, memo } from 'react'// MemoHeader: 没有依赖props,不会被重新调用render渲染const MemoHeader = memo(function Header() {  console.log('Header被调用')  return <h2>我是Header组件</h2>})
```

React 知识点总结脑图
-------------

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQq9u069VL8eUUAV3O1EdLuoXdsasoHo3EIIw9gTr1swUwkyeicaugVtRRuUl30XAXDSv2TK6hM5pQ/640?wx_fmt=png)  

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端算法源码编程群，每日一刷（工作日），每题瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持