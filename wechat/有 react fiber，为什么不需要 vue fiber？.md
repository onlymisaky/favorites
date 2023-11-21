> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/po503V7TTezSVFHqsgoZVw)

提到 react fiber，大部分人都知道这是一个 react 新特性，看过一些网上的文章，大概能说出 “纤程”“一种新的数据结构”“更新时调度机制” 等关键词。

但如果被问：

1.  有 react fiber，为什么不需要 vue fiber 呢；
    
2.  之前递归遍历虚拟 dom 树被打断就得从头开始，为什么有了 react fiber 就能断点恢复呢；
    

本文将从两个框架的响应式设计为切入口讲清这两个问题，不涉及晦涩源码，不管有没有使用过 react，阅读都不会有太大阻力。

什么是响应式
======

无论你常用的是 react，还是 vue，“响应式更新” 这个词肯定都不陌生。

响应式，直观来说就是视图会自动更新。如果一开始接触前端就直接上手框架，会觉得这是理所当然的，但在 “响应式框架” 出世之前，实现这一功能是很麻烦的。

下面我将做一个时间显示器，用原生 js、react、vue 分别实现：

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2ANt2OnURYFlLsGwlmcicwlLCtLelcAaETiamFVDYsEibEpTdY3kjCicxRkg/640?wx_fmt=png)

1.  原生 js：
    

想让屏幕上内容变化，必须需要先找到 dom（`document.getElementById`）, 然后再修改 dom（`clockDom.innerText`）。

```
<div id="root">    <div id="greet"></div>    <div id="clock"></div></div><script>    const clockDom = document.getElementById('clock');    const greetDom = document.getElementById('greet');    setInterval(() => {        clockDom.innerText = `现在是：${Util.getTime()}`        greetDom.innerText = Util.getGreet()    }, 1000);</script>
```

有了响应式框架，一切变得简单了

2.  react：
    

对内容做修改，只需要调用`setState`去修改数据，之后页面便会重新渲染。

```
<body>    <div id="root"></div>    <script type="text/babel">        function Clock() {            const [time, setTime] = React.useState()            const [greet, setGreet] = React.useState()            setInterval(() => {                setTime(Util.getTime())                setGreet(Util.getGreet())            }, 1000);            return (                 <div>                    <div>{greet}</div>                    <div>现在是：{time}</div>                </div>            )        }        ReactDOM.render(<Clock/>,document.getElementById('root'))    </script></body>
```

3.  vue：
    

我们一样不用关注 dom，在修改数据时, 直接`this.state=xxx`修改，页面就会展示最新的数据。

```
<body>    <div id="root">        <div>{{greet}}</div>        <div>现在是：{{time}}</div>    </div>    <script>        const Clock = Vue.createApp({            data(){                return{                    time:'',                    greet:''                }            },            mounted(){                setInterval(() => {                    this.time = Util.getTime();                    this.greet = Util.getGreet();                }, 1000);            }        })        Clock.mount('#root')    </script></body>
```

react、vue 的响应式原理
================

上文提到修改数据时，react 需要调用`setState`方法，而 vue 直接修改变量就行。看起来只是两个框架的用法不同罢了，但响应式原理正在于此。

从底层实现来看修改数据：在 react 中，组件的状态是不能被修改的，`setState`没有修改原来那块内存中的变量，而是去新开辟一块内存；而 vue 则是直接修改保存状态的那块原始内存。

所以经常能看到 react 相关的文章里经常会出现一个词 "immutable"，翻译过来就是不可变的。

数据修改了，接下来要解决视图的更新：react 中，调用`setState`方法后，会自顶向下重新渲染组件，自顶向下的含义是，该组件以及它的子组件全部需要渲染；而 vue 使用`Object.defineProperty`（vue@3 迁移到了 Proxy）对数据的设置（`setter`）和获取（`getter`）做了劫持，也就是说，vue 能准确知道视图模版中哪一块用到了这个数据，并且在这个数据修改时，告诉这个视图，你需要重新渲染了。

所以当一个数据改变，react 的组件渲染是很消耗性能的——父组件的状态更新了，所有的子组件得跟着一起渲染，它不能像 vue 一样，精确到当前组件的粒度。

为了佐证，我分别用 react 和 vue 写了一个 demo，功能很简单：父组件嵌套子组件，点击父组件的按钮会修改父组件的状态，点击子组件的按钮会修改子组件的状态。

为了更好的对比，直观展示渲染阶段，没用使用更流行的 react 函数式组件，vue 也用的是不常见的 render 方法：

```
class Father extends React.Component{    state = {        fatherState:'Father-original state'    }    changeState = () => {        console.log('-----change Father state-----')        this.setState({fatherState:'Father-new state'})    }    render(){        console.log('Father:render')        return (             <div>                <h2>{this.state.fatherState}</h2>                <button onClick={this.changeState}>change Father state</button>                <hr/>                <Child/>            </div>        )    }}class Child extends React.Component{    state = {            childState:'Child-original state'    }    changeState = () => {        console.log('-----change Child state-----')        this.setState({childState:'Child-new state'})    }    render(){        console.log('child:render')        return (             <div>                <h3>{this.state.childState}</h3>                <button onClick={this.changeState}>change Child state</button>            </div>        )    }}ReactDOM.render(<Father/>,document.getElementById('root'))
```

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2AX7Kf8BLzRJkpNgCAibfdBN3iakaLGaebZyIU71yUId3BowBZJRIMTjBA/640?wx_fmt=png)

上面是使用 react 时的效果，修改父组件的状态，父子组件都会重新渲染：点击`change Father state`，不仅打印了`Father:render`，还打印了`child:render`。

```
const Father = Vue.createApp({    data() {        return {            fatherState:'Father-original state',        }    },    methods:{        changeState:function(){            console.log('-----change Father state-----')            this.fatherState = 'Father-new state'        }    },    render(){        console.log('Father:render')        return Vue.h('div',{},[            Vue.h('h2',this.fatherState),            Vue.h('button',{onClick:this.changeState},'change Father state'),            Vue.h('hr'),            Vue.h(Vue.resolveComponent('child'))        ])    }})Father.component('child',{    data() {        return {            childState:'Child-original state'        }    },    methods:{        changeState:function(){            console.log('-----change Child state-----')            this.childState = 'Child-new state'        }    },    render(){        console.log('child:render')        return Vue.h('div',{},[            Vue.h('h3',this.childState),            Vue.h('button',{onClick:this.changeState},'change Child state'),        ])    }})Father.mount('#root')
```

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2AOMCBrdQK5gMFcrcC0QgCENq5ibdR6gwQOnd3qQibU0RsfyTuOu5x1xPA/640?wx_fmt=png)

上面使用 vue 时的效果，无论是修改哪个状态，组件都只重新渲染最小颗粒：点击`change Father state`，只打印`Father:render`，不会打印`child:render`。

> 后台回复【父子组件 demo】获取上述两个 sandbox 在线链接

不同响应式原理的影响
----------

首先需要强调的是，上文提到的 “渲染”“render”“更新 “都不是指浏览器真正渲染出视图。而是框架在 javascript 层面上，调用自身实现的 render 方法，生成一个普通的对象，这个对象保存了真实 dom 的属性，也就是常说的虚拟 dom。本文会用组件渲染和页面渲染对两者做区分。

每次的视图更新流程是这样的：

1.  组件渲染生成一棵新的虚拟 dom 树；
    
2.  新旧虚拟 dom 树对比，找出变动的部分；（也就是常说的 diff 算法）
    
3.  为真正改变的部分创建真实 dom，把他们挂载到文档，实现页面重渲染；
    

由于 react 和 vue 的响应式实现原理不同，数据更新时，第一步中 react 组件会渲染出一棵更大的虚拟 dom 树。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2AaAfVibGPm1Kww0rSiasticibbJ51oGUFUiciapTCHKQztaU7yicQib8ITiaUsicA/640?wx_fmt=png)

fiber 是什么
=========

上面说了这么多，都是为了方便讲清楚为什么需要 react fiber：在数据更新时，react 生成了一棵更大的虚拟 dom 树，给第二步的 diff 带来了很大压力——我们想找到真正变化的部分，这需要花费更长的时间。js 占据主线程去做比较，渲染线程便无法做其他工作，用户的交互得不到响应，所以便出现了 react fiber。

react fiber 没法让比较的时间缩短，但它使得 diff 的过程被分成一小段一小段的，因为它有了 “保存工作进度” 的能力。js 会比较一部分虚拟 dom，然后让渡主线程，给浏览器去做其他工作，然后继续比较，依次往复，等到最后比较完成，一次性更新到视图上。

fiber 是一种新的数据结构
---------------

上文提到了，react fiber 使得 diff 阶段有了被保存工作进度的能力，这部分会讲清楚为什么。

我们要找到前后状态变化的部分，必须把所有节点遍历。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2AOXibJkLtqOlqHj8LC4vTo7CHRBWzAt4ydyQu1QdwicTD5kvqEcLwTILA/640?wx_fmt=png)

在老的架构中，节点以树的形式被组织起来：每个节点上有多个指针指向子节点。要找到两棵树的变化部分，最容易想到的办法就是深度优先遍历，规则如下：

1.  从根节点开始，依次遍历该节点的所有子节点；
    
2.  当一个节点的所有子节点遍历完成，才认为该节点遍历完成；
    

如果你系统学习过数据结构，应该很快就能反应过来，这不过是深度优先遍历的后续遍历。根据这个规则，在图中标出了节点完成遍历的顺序。

这种遍历有一个特点，必须一次性完成。假设遍历发生了中断，虽然可以保留当下进行中节点的索引，下次继续时，我们的确可以继续遍历该节点下面的所有子节点，但是没有办法找到其父节点——因为每个节点只有其子节点的指向。断点没有办法恢复，只能从头再来一遍。

以该树为例：

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2AcV58DPcjH4HYcLf7ZMwXjBXQ4vyg5GFZpuBfpmRjkVfcDKSbdk7lAw/640?wx_fmt=png)

在遍历到节点 2 时发生了中断，我们保存对节点 2 的索引，下次恢复时可以把它下面的 3、4 节点遍历到，但是却无法找回 5、6、7、8 节点。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2AhanHpDdsPw9A2GIt1H8kbmBlPfc4td6etg3ibjaOic0BZzVl4ew6uz2A/640?wx_fmt=png)

在新的架构中，每个节点有三个指针：分别指向第一个子节点、下一个兄弟节点、父节点。这种数据结构就是 fiber，它的遍历规则如下：

1.  从根节点开始，依次遍历该节点的子节点、兄弟节点，如果两者都遍历了，则回到它的父节点；
    
2.  当一个节点的所有子节点遍历完成，才认为该节点遍历完成；
    

根据这个规则，同样在图中标出了节点遍历完成的顺序。跟树结构对比会发现，虽然数据结构不同，但是节点的遍历开始和完成顺序一模一样。不同的是，当遍历发生中断时，只要保留下当前节点的索引，断点是可以恢复的——因为每个节点都保持着对其父节点的索引。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2ATfic9Tp6vWsohm1gTeUcADSCB1zTmUQHuKRtN1AcIBTnib0MRQ4wYjMg/640?wx_fmt=png)

同样在遍历到节点 2 时中断，fiber 结构使得剩下的所有节点依旧能全部被走到。

这就是 react fiber 的渲染可以被中断的原因。树和 fiber 虽然看起来很像，但本质上来说，一个是树，一个是链表。

fiber 是纤程
---------

这种数据结构之所以被叫做 fiber，因为 fiber 的翻译是纤程，它被认为是协程的一种实现形式。协程是比线程更小的调度单位：它的开启、暂停可以被程序员所控制。具体来说，react fiber 是通过`requestIdleCallback`这个 api 去控制的组件渲染的 “进度条”。

`requesetIdleCallback`是一个属于宏任务的回调，就像 setTimeout 一样。不同的是，setTimeout 的执行时机由我们传入的回调时间去控制，requesetIdleCallback 是受屏幕的刷新率去控制。本文不对这部分做深入探讨，只需要知道它每隔 16ms 会被调用一次，它的回调函数可以获取本次可以执行的时间，每一个 16ms 除了`requesetIdleCallback`的回调之外，还有其他工作，所以能使用的时间是不确定的，但只要时间到了，就会停下节点的遍历。

使用方法如下：

```
const workLoop = (deadLine) => {    let shouldYield = false;// 是否该让出线程    while(!shouldYield){        console.log('working')        // 遍历节点等工作        shouldYield = deadLine.timeRemaining()<1;    }    requestIdleCallback(workLoop)}requestIdleCallback(workLoop);
```

requestIdleCallback 的回调函数可以通过传入的参数`deadLine.timeRemaining()`检查当下还有多少时间供自己使用。上面的 demo 也是 react fiber 工作的伪代码。

但由于兼容性不好，加上该回调函数被调用的频率太低，react 实际使用的是一个 polyfill(自己实现的 api)，而不是 requestIdleCallback。

现在，可以总结一下了：React Fiber 是 React 16 提出的一种更新机制，使用链表取代了树，将虚拟 dom 连接，使得组件更新的流程可以被中断恢复；它把组件渲染的工作分片，到时会主动让出渲染主线程。

react fiber 带来的变化
=================

首先放一张在社区广为流传的对比图，分别是用 react 15 和 16 实现的。这是一个宽度变化的三角形，每个小圆形中间的数字会随时间改变，除此之外，将鼠标悬停，小圆点的颜色会发生变化。

  
![](https://mmbiz.qpic.cn/mmbiz_gif/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2A8QRGpWbr4UlYCiaEH5Z4bnfcddAe89tQJvByd7ibjhyQGGibgumaFQ4cg/640?wx_fmt=gif)

> 后台回复【三角形案例】获取在线连接

实操一下，可以发现两个特点：

1.  使用新架构后，动画变得流畅，宽度的变化不会卡顿；
    
2.  使用新架构后，用户响应变快，鼠标悬停时颜色变化更快；
    

看到到这里先稍微停一下，这两点都是 fiber 带给我们的吗——用户响应变快是可以理解的，但使用 react fiber 能带来渲染的加速吗？

动画变流畅的根本原因，一定是一秒内可以获得更多动画帧。但是当我们使用 react fiber 时，并没有减少更新所需要的总时间。

为了方便理解，我把刷新时的状态做了一张图：

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTaua9skyECBhK8fmn4VYgeH2A66kFvXcWF6PLCxbeFBUx3nkB9NdzrSgibhZnjq3E6w54sotwjtl4H4A/640?wx_fmt=png)

上面是使用旧的 react 时，获得每一帧的时间点，下面是使用 fiber 架构时，获得每一帧的时间点，因为组件渲染被分片，完成一帧更新的时间点反而被推后了，我们把一些时间片去处理用户响应了。

这里要注意，不会出现 “一次组件渲染没有完成，页面部分渲染更新” 的情况，react 会保证每次更新都是完整的。

但页面的动画确实变得流畅了，这是为什么呢？

我把该项目的代码仓库 down 下来，看了一下它的动画实现：组件动画效果并不是直接修改`width`获得的，而是使用的`transform:scale`属性搭配 3D 变换。如果你听说过硬件加速，大概知道为什么了：这样设置页面的重新渲染不依赖上图中的渲染主线程，而是在 GPU 中直接完成。也就是说，这个渲染主线程线程只用保证有一些时间片去响应用户交互就可以了。

```
-<SierpinskiTriangle x={0} y={0} s={1000}>+<SierpinskiTriangle x={0} y={0} s={1000*t}>    {this.state.seconds}</SierpinskiTriangle>
```

> 后台回复【三角形仓库】获取 github 连接

修改一下项目代码中 152 行，把图形的变化改为宽度`width`修改，会发现即使用 react fiber，动画也会变得相当卡顿，所以这里的流畅主要是 CSS 动画的功劳。（内存不大的电脑谨慎尝试，浏览器会卡死）

react 不如 vue？
=============

我们现在已经知道了 react fiber 是在弥补更新时 “无脑” 刷新，不够精确带来的缺陷。这是不是能说明 react 性能更差呢？

并不是。孰优孰劣是一个很有争议的话题，在此不做评价。因为 vue 实现精准更新也是有代价的，一方面是需要给每一个组件配置一个 “监视器”，管理着视图的依赖收集和数据更新时的发布通知，这对性能同样是有消耗的；另一方面 vue 能实现依赖收集得益于它的模版语法，实现静态编译，这是使用更灵活的 JSX 语法的 react 做不到的。

在 react fiber 出现之前，react 也提供了 PureComponent、shouldComponentUpdate、useMemo,useCallback 等方法给我们，来声明哪些是不需要连带更新子组件。

结语
==

回到开头的几个问题，答案不难在文中找到：

1.  react 因为先天的不足——无法精确更新，所以需要 react fiber 把组件渲染工作切片；而 vue 基于数据劫持，更新粒度很小，没有这个压力；
    
2.  react fiber 这种数据结构使得节点可以回溯到其父节点，只要保留下中断的节点索引，就可以恢复之前的工作进度；
    

如果这篇文章对你有帮助，给我点个赞呗～这对我很重要

（点个在看更好！>3<）