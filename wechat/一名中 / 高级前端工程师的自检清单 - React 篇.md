> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Os4U_AZGJiflkVe1WRBt0Q)

点击上方 高级前端进阶，回复 “加群”  

加入我们一起学习，天天进步

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGoyklFcic3PXhibI7fCiboxLL2VmEWYOfsQwMzBtJoBHvGeqvgSbHwaXKg/640?wx_fmt=png)

  

你真的了解 React 吗？我们在面试中往往涉及 React 时，第一个问题就是 “解释 React 是什么”。解释一种技术是什么，在面试中也是非常常见的引起 话题的题目。本篇文章我就带你掌握这一类概念题的解答技巧。

一. 说说对 React 的理解，有哪些特性
----------------------

官方的解释: React 是一个 UI 库，它的核心思想是`UI=F(data)`, 即界面的呈现是由函数传入的参数决定的

开发者不再需要关心界面时如何渲染的，只要关心数据的生成和传递，这大大提高的开发者的开发效率，节省了开发时间

其次 React 设计的

*   使用类似 HTML 的`JSX`语法来描述视图
    
*   通过`虚拟DOM`修改`真实DOM`
    
*   通过`setState`修改数据
    
*   在不同的`生命周期`阶段做不同的事
    
*   源码底层对真实 DOM 事件进行封装，使用`事件委托`的方式来捕获 DOM 事件
    
*   ....
    

等特性进一步简化的 真实 DOM 操作的复杂性

二. 说说真实 DOM 与虚拟 DOM 的区别，优缺点
---------------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGj3SAfDSqEVQkZ7Cuv2HEDztq0PiadIXyjlCKbfQJnda2dGu83erjSjA/640?wx_fmt=other)虚拟 DOM

### 2.1 虚拟 DOM 是什么

*   `真实DOM`就是我们在浏览器开发者工具中看到的`DOM`结构
    
*   `虚拟DOM`简单来说就是 JS 对象，此对象中的字段包含了对`真实DOM`的描述:
    

*   `type`: 是什么标签 / 元素
    
*   `props`: 标签 / 元素有哪些属性
    
*   `children`: 是否有子元素
    

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGX0vh2ibluibpZguOJqhssWaxPe2zgtiaNQhEXJPh8NyL2jJCUw82dDdHQ/640?wx_fmt=other) a

### 2.2 虚拟 DOM 大概是如何工作的

当 `DOM` 操作（渲染更新）比较频繁时，

React 底层会先将前后两次的`虚拟DOM` 树进行对比，

定位出具体需要更新的部分，生成一个`补丁集`，

最后只把 “补丁” 打在需要更新的那部分`真实DOM` 上，实现精准的 “差量更新”。

### 2.3 虚拟 DOM 的优点

1.  解决了频繁操作真实 DOM 的低效率工作 - 不直接操作 DOM，数据驱动视图, 也在一定程度上提升了性能
    
2.  解决了扩平台开发的问题，因为虚拟 DOM 描述的东西可以是真实 DOM, 也可以是安卓界面。IOS 界面等等, 这就可以对接不同平台的渲染逻辑。从而实现 "一次编码，多端运行"(如 React,React Native)
    

### 2.4 虚拟 DOM 的缺点

如果当虚拟 DOM 的构建和`diff`的过程相对复杂 (比如很多递归遍历等操作), 那么虚拟 DOM 的 JS 计算是比较耗时的

三. 说说 Diff 算法
-------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGgW8NMUCVRoTSIHd2byFicib7rgduD2ZafVuLWcTmFj021txY6VRz9gjQ/640?wx_fmt=other)Diff 算法

一般的原始 diff 思路算法复杂度是`O(n^3)`, 即循环递归进行树节点的一一对比

但 React 的 `diff 算法`是 `O (n)` 复杂度的思路

> 当对比两棵虚拟 DOM 树时，React 首先比较两棵树的根节点。不同类型的根节点元素会有不同的形态
> 
> 当对比两个相同类型的 React 元素时，React 会保留 DOM 节点，仅比对及更新有改变的属性。

1.  当根节点为不同类型的元素时，React 会拆卸原有的树并且建立起新的树，这大大减少了 `Diff` 过程中冗余的递归操作
    
2.  当对比两个相同类型的 React 元素时，React 会保留 DOM 节点，仅比对及更新有改变的属性
    
3.  列表形式的子元素比较: React 引入了 `key 属性`。当子元素拥有 `key` 时，React 使用 `key` 来匹配原有树上的子元素以及最新树上的子元素, 如果 `key`不同 不同则会拆卸原有的 `key` 节点并且建立起新的 `key` 节点
    

详细内容请参考 React 官方文档 - Diffing 算法 [2]

四. 说说 React 声明周期有哪些不同阶段, 每个阶段对应的方法是什么
-------------------------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGERw1l359B4UI2Rm6jFLiaqtehyD6hclcibxPnYQavsGpcBMSr0Vl0Wvg/640?wx_fmt=other)image.png

### 4.1 创建阶段

1.  `constructor()`: 组件的构造函数，组件更新到界面上之前会先调用
    

*   用于初始化内部状态, 很少使用
    
*   唯一可以直接修改 `state` 的地方
    

3.  `static getDerivedStateFromProps(nextProps, prevState)`: 用于从外部的属性去初始化一些内部的状态
    

*   当 `state` 需要从 `props` 初始化时使用
    
*   尽量不要使用, 维护 `state/props` 状态一致性会增加复杂度
    
*   每次 `render` 都会调用
    
*   典型场景: 表单控件获取默认值
    

5.  `render()`:: 组件必须定义的一个生命周期方法，用来描述 虚拟 DOM 结构
    
6.  `componentDidMount()`: 用于数据请求，定义一些外部资源等等副作用
    

*   UI 渲染完成后调用
    
*   只执行一次
    
*   典型场景: 获取外部资源
    

### 4.2 更新阶段

1.  `static getDerivedStateFromProps(nextProps, prevState)`
    
2.  `shouldComponentUpdate(nextProps, nextState)`: 告诉组件是否需要重新渲染，用于性能优化，比如判定指定 props 发生改变，组件才进行重新渲染
    

*   决定虚拟 DOM 是否需要重绘
    
*   一般可以由 `PureComponent` 自动实现
    
*   典型场景: 性能优化
    

4.  `render()`
    
5.  `getSnapshotBeforeUpdate(prevProps, prevState)`
    

*   在最近一次渲染输出（提交到 DOM 节点）之前调用, state 已更新
    
*   与 `componentDidUpdate` 搭配使用
    
*   典型场景: 捕获 `render` 之前的 DOM 状态
    

7.  `componentDidUpdate(prevProps, prevState)`
    

*   每次 UI 更新时被调用
    
*   典型场景: 页面需要根据 `props` 变化重新获取数据
    

### 4.3 卸载阶段

1.  `componentWillUnmount()`: 做些资源释放，卸载副作用的事情
    

*   此方法中可以执行必要的清理操作，例如，清除 timer，取消网络请求或清除在
    

详细内容请参考 React 知识体系之生命周期及使用场景 [3]

五. 说说对 State 和 Props 的理解，有什么区别
------------------------------

*   `state`用于组件内部数据传递,`state` 数据可以通过`this.setSate`或者`useState`进行修改
    
*   `props`用于组件外部组件数据传递，`props`不能直接修改. 主要使用场景是:
    

*   兄弟组件通信
    
*   父子组件通信
    
*   `"爷孙组件"`组件通信
    

*   `props`的使用范围虽然更加广泛，但也有其局限性: 对于嵌套层次较深的组件，如果使用`props`传递数据, 会导致代码冗余, 增加数据传递的复杂度
    

六. super 和 super(props) 有什么区别
-----------------------------

> 在 JavaScript 中，super 指的是父类构造函数。（在我们的示例中，它指向 React.Component 实现。）

在调用父类的构造函数之前，你是不能在 `constructor` 中使用 `this` 关键字的。JavaScript 不允许这个行为

```
class Checkbox extends React.Component {  constructor(props) {    // 🔴  还不能使用 `this`    super(props);    // ✅  现在可以了    this.state = { isOn: true };  }  // ...}复制代码
```

为什么一定要传递 `props` 呢？为了让 `React.Component` 构造函数能够初始化 `this.props`

React 内部代码:

```
// React 內部class Component {  constructor(props) {    this.props = props;    // ...  }}复制代码
```

实例代码:

```
class Button extends React.Component {  constructor(props) {    super(); // ? We forgot to pass props    console.log(props); // ✅ {}    console.log(this.props); // ? undefined  }  // ...}复制代码
```

```
class Button extends React.Component {  constructor(props) {    super(props); // ✅ We passed props    console.log(props); // ✅ {}    console.log(this.props); // ✅ {}  }  // ...}复制代码
```

有了 Hooks 以后，我们几乎就不需要 `super` 和 `this` 了

详细内容请参考为什么我们要写 super(props) ？[4]

七. 说说 React 中的 setState 机制
--------------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGhBnzRpicU9hgRyHhibvfictnHcUyOiawqGEz4aiarW3lyEDP85byzAmsgag/640?wx_fmt=other)setState

### 7.1 合成事件、钩子函数中的 setState

*   在钩子函数中 `setSate` 拿不到最新值
    
*   在合成事件中执行多个同样的 `setSate`，最终只会执行一次，并且也拿不到最新值
    

原因:

1.  一次 `setState` 就会触发一次 `re-render`(重渲染)
    
2.  为了避免频繁的 `re-ernder`,`setState` 被设计成异步的形式
    
3.  每来一个 `setState`，就把它塞进一个队列里 “攒起来”。等时机成熟，再把“攒起来” 的 `state` 结果做合并 (对于相同属性的设置，React 只会为其保留最后一次的更新)，最后只针对最新的 `state` 值走一次更新流程。这个过程，叫作 **`批量更新`**
    

### 7.2 `setTimeout/setInterval`、`原生 DOM`中的 setState

*   在 `setTimeout/setInterval` 中设置 `setState`, 可以拿到最新的值
    
*   在`原生 DOM` 事件中设置 `setState`, 可以拿到最新的值
    

原因:

`setState` 的 “异步” 并不是说内部由异步代码实现，其实源码本身执行的过程和代码都是同步的，

只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形式了所谓的 “异步”

**`setState` 的批量更新优化也是建立在 “异步”（合成事件、钩子函数）之上的**，在原生事件和 `setTimeout` 中不会批量更新

详细内容请参考 setState 到底是同步的，还是异步的？[5]

八. 说说对 React 事件机制的理解
--------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHoX7icOibtUaZRAZD45BVfCwGEXSLEPibmqwSvGKiaLjwRoibSicd0A04kiaTfekmLZLVic52KapEMXyWqB3Q/640?wx_fmt=other)React 事件机制

### 8.1 React 中的事件是什么

React 中的事件叫`合成事件`:React 底层使用`事件委托`的方式对真实 DOM 事件进行了封装, 使合成事件具有更好的浏览器兼容性和性能

### 8.2 合成事件的大致原理

当事件在具体的 DOM 节点上被触发后，最终都会冒泡到 document 上，document 上所绑定的统一事件处理程序会将事件分发到具体的组件实例

### 8.3 React 为什么要重新设计出一个合成事件

合成事件是 React 自定义的事件对象，它符合 W3C 规范，在底层抹平了不同浏览器的差异，在上层面向开发者暴露统一的、稳定的、与 DOM 原生事件相同的事件接口。

开发者们由此便不必再关注烦琐的兼容性问题，可以专注于业务逻辑的开发。

*   虽然合成事件并不是原生 DOM 事件，但它保存了原生 DOM 事件的引用。当你需要访问原生 DOM 事件对象时，可以通过合成事件对象的 `e.nativeEvent` 属性获取到它
    
*   合成事件无法获取到真实 DOM, 但可以通过 React 提供`ref`API 进行获取
    

详细内容请参考 React 事件与 DOM 事件有何不同？[6]

九. React 事件绑定的方式有哪些
-------------------

### 9.1 类组件

#### 9.1.1 render 方法中使用 bind

这种方式在组件每次 render 渲染的时候，都会重新进行 bind 的操作，影响性能

```
class App extends React.Component {  handleClick() {    console.log("this > ", this);  }  render() {    return <div onClick={this.handleClick.bind(this)}>test</div>;  }}复制代码
```

#### 9.1.2 render 方法中使用箭头函数

通过 ES6 的上下文来将 this 的指向绑定给当前组件，同样在每一次 render 的时候都会生成新的方法，影响性能

```
class App extends React.Component {  handleClick() {    console.log("this > ", this);  }  render() {    return <div onClick={(e) => this.handleClick(e)}>test</div>;  }}复制代码
```

### 9.1.3 constructor 中 bind

在 constructor 中预先 bind 当前组件，可以避免在 render 操作中重复绑定

```
class App extends React.Component {  constructor(props) {    super(props);    this.handleClick = this.handleClick.bind(this);  }  handleClick() {    console.log("this > ", this);  }  render() {    return <div onClick={this.handleClick}>test</div>;  }}复制代码
```

#### 9.1.4 定义阶段使用箭头函数绑定

能够避免在 render 操作中重复绑定

```
class App extends React.Component {  constructor(props) {    super(props);  }  handleClick = () => {    console.log("this > ", this);  };  render() {    return <div onClick={this.handleClick}>test</div>;  }}复制代码
```

### 9.2 函数式组件

*   箭头函数
    

函数组件没有实例，因此没有`this`

```
const App = () => {  handleClick = (e) => {    console.log(e);  };  return <div onClick={this.handleClick}>test</div>;};复制代码
```

详细内容请参考 React 构建组件的方式有哪些 [7]

十. React 构建组件的方式有哪些
-------------------

1.  类组件
    
2.  高阶组件
    
3.  `render props`
    
4.  纯函数组件
    
5.  `Hooks`组件
    
6.  自定义`Hooks`
    

详细内容请参考 React 构建组件的方式有哪些 [8]

十一. React 中组件通信的方式有哪些
---------------------

*   单个组件内部数据传递
    

*   `state`
    

*   父组件向子组件传递
    

*   `props`
    

*   子组件向父组件传递
    

*   `props`
    

*   兄弟组件之间的通信
    

*   `props`
    

*   父组件向后代组件传递
    

*   `props`
    
*   `Context API`
    
*   `Redux`
    
*   `发布-订阅模式`
    
*   `EventBus`
    

*   非关系组件传递
    

*   `Context API`
    
*   `Redux`
    
*   `发布-订阅模式`
    
*   `EventBus`
    

十二. React 的 key 有什么作用
---------------------

说到 React 的 key，就要说到 React 的 Diff 算法

详细内容请参考 React 列表循环为什么需要 key[9]

* * *

### 参考资料

[1]

https://juejin.cn/post/6978685539985653767: _https://juejin.cn/post/6978685539985653767_

[2]

https://zh-hans.reactjs.org/docs/reconciliation.html#the-diffing-algorithm: _https://link.juejin.cn?target=https%3A%2F%2Fzh-hans.reactjs.org%2Fdocs%2Freconciliation.html%23the-diffing-algorithm_

[3]

https://juejin.cn/post/6981739846461030408: _https://juejin.cn/post/6981739846461030408_

[4]

https://overreacted.io/zh-hans/why-do-we-write-super-props/: _https://link.juejin.cn?target=https%3A%2F%2Foverreacted.io%2Fzh-hans%2Fwhy-do-we-write-super-props%2F_

[5]

https://www.yuque.com/u221766/xgl0mb/oxl3ik: _https://link.juejin.cn?target=https%3A%2F%2Fwww.yuque.com%2Fu221766%2Fxgl0mb%2Foxl3ik_

[6]

https://www.yuque.com/u221766/xgl0mb/iu68y0: _https://link.juejin.cn?target=https%3A%2F%2Fwww.yuque.com%2Fu221766%2Fxgl0mb%2Fiu68y0_

[7]

https://juejin.cn/post/6952907248393781284#heading-2: _https://juejin.cn/post/6952907248393781284#heading-2_

[8]

https://juejin.cn/post/6952907248393781284: _https://juejin.cn/post/6952907248393781284_

[9]

https://juejin.cn/post/6940974776441634823: _https://juejin.cn/post/6940974776441634823_

来源：望道同学

https://juejin.cn/post/6981831831112908831

The End  

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 **「在看」**，让更多的人也能看到这篇内容

2、关注官网 **https://muyiy.cn**，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 **「加群」** ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《  

```
“在看”吗？在看就点一下吧

```