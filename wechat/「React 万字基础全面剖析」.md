> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-WLQPNHF2zzPB1v1Lwkw1w)

很多同学用`react`开发的时候，真正用到的`React`的`api`少之又少，基本停留在`Component`,`React.memo`等层面, 实际`react`源码中，暴露出来的方法并不少，只是我们平时很少用。但是`React`暴露出这么多`api`并非没有用，想要玩转`react`, 就要明白这些`API`究竟是干什么的，应用场景是什么，今天就让我们从`react` 到 `react-dom`, 一次性把`react`生产环境的暴露`api`复习个遍 (涵盖 90%+)。  

我们把`react`,`API`，分为**组件类**，**工具类**，****hooks****，再加上 **`react-dom`**  ，一共四大方向，分别加以探讨。

为了能让屏幕前的你，更明白`api`, 我是绞尽脑汁, 本文的每一个`api`基本都会出一个`demo`演示效果, 弥补一下天书般的`react`文档😂😂😂，还有就是我对`api`基本概念的理解。

老规矩，我们带着疑问开始今天的阅读 (**自测掌握程度**)？

*   1 `react`暴露的`api`有哪些，该如何使用？
    
*   2 `react`提供了哪些自测性能的手段？
    
*   3  `ref`既然不能用在函数组件中，那么父组件如何控制函数子组件内的`state`和方法？
    
*   4 `createElement`和`cloneElement`有什么区别，应用场景是什么？
    
*   5 `react`内置的`children`遍历方法，和数组方法, 有什么区别？
    
*   6 `react`怎么将子元素渲染到父元素之外的指定容器中？
    
*   ...
    

我相信读完这篇文章，这些问题全都会迎刃而解？

组件类
===

组件类，详细分的话有三种类，第一类说白了就是我平时用于继承的基类组件`Component`,`PureComponent`, 还有就是`react`提供的内置的组件，比如`Fragment`,`StrictMode`, 另一部分就是高阶组件`forwardRef`,`memo`等。

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppN5jeazXCeoCqNDgIlOO1NrpeUyH2mx3NMHcvObMqo6ZAxPWdOWoTKQ/640?wx_fmt=jpeg)comp.jpg

Component
---------

`Component`是`class`组件的根基。类组件一切始于`Component`。对于`React.Component`使用，我们没有什么好讲的。我们这里重点研究一下`react`对`Component`做了些什么。

`react/src/ReactBaseClasses.js`

```
function Component(props, context, updater) {  this.props = props;  this.context = context;  this.refs = emptyObject;  this.updater = updater || ReactNoopUpdateQueue;}
```

这就是`Component`函数，其中`updater`对象上保存着更新组件的方法。

**我们声明的类组件是什么时候以何种形式被实例化的呢？**

`react-reconciler/src/ReactFiberClassComponent.js`

**constructClassInstance**

```
function constructClassInstance(    workInProgress,    ctor,    props){   const instance = new ctor(props, context);    instance.updater = {        isMounted,        enqueueSetState(){            /* setState 触发这里面的逻辑 */        },        enqueueReplaceState(){},        enqueueForceUpdate(){            /* forceUpdate 触发这里的逻辑 */        }    }}
```

对于`Component`， `react` 处理逻辑还是很简单的，实例化我们类组件，然后赋值`updater`对象，负责组件的更新。然后在组件各个阶段，执行类组件的`render`函数，和对应的生命周期函数就可以了。

PureComponent
-------------

`PureComponent`和 `Component`用法，差不多一样，唯一不同的是，纯组件`PureComponent`会浅比较，`props`和`state`是否相同，来决定是否重新渲染组件。所以一般用于**性能调优**，减少 **render** 次数。

什么叫做**浅比较**，我这里举个列子：

```
class Index extends React.PureComponent{    constructor(props){        super(props)        this.state={           data:{              name:'alien',              age:28           }        }    }    handerClick= () =>{        const { data } = this.state        data.age++        this.setState({ data })    }    render(){        const { data } = this.state        return <div class >            <div> 你的姓名是: { data.name } </div>            <div> 年龄： { data.age  }</div>            <button onClick={ this.handerClick } >age++</button>        </div>    </div>    }}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpppEqVBw2iaXq298kTTg0Cb3tNIXvgmgJzcACtB6bCEnDw0kt5aDV7y5g/640?wx_fmt=gif)**点击按钮，没有任何反应**，因为`PureComponent`会比较两次`data`对象，都指向同一个`data`, 没有发生改变，所以不更新视图。

解决这个问题很简单，只需要在`handerClick`事件中这么写：

```
this.setState({ data:{...data} })
```

**浅拷贝**就能根本解决问题。

memo
----

`React.memo`和`PureComponent`作用类似，可以用作性能优化，`React.memo` 是高阶组件，函数组件和类组件都可以使用， 和区别`PureComponent`是 `React.memo`只能对`props`的情况确定是否渲染，而`PureComponent`是针对`props`和`state`。

`React.memo` 接受两个参数，第一个参数原始组件本身，第二个参数，可以根据一次更新中`props`是否相同决定原始组件是否重新渲染。是一个返回布尔值，`true` 证明组件无须重新渲染，`false`证明组件需要重新渲染，这个和类组件中的`shouldComponentUpdate()`正好相反 。

**React.memo: 第二个参数 返回 `true` 组件不渲染 ， 返回 `false` 组件重新渲染。****shouldComponentUpdate: 返回 `true` 组件渲染 ， 返回 `false` 组件不渲染。**

解析来我们做一个场景，控制组件在仅此一个`props`数字变量，一定范围渲染。

例子🌰：

控制 `props` 中的 `number` ：

*   1 只有 `number` 更改，组件渲染。
    
*   2 只有 `number` 小于 5 ，组件渲染。
    

```
function TextMemo(props){    console.log('子组件渲染')    if(props)    return <div>hello,world</div> }const controlIsRender = (pre,next)=>{   if(pre.number === next.number  ){ // number 不改变 ，不渲染组件       return true    }else if(pre.number !== next.number && next.number > 5 ) { // number 改变 ，但值大于5 ， 不渲染组件       return true   }else { // 否则渲染组件       return false   }}const NewTexMemo = memo(TextMemo,controlIsRender)class Index extends React.Component{    constructor(props){        super(props)        this.state={            number:1,            num:1        }    }    render(){        const { num , number }  = this.state        return <div>            <div>                改变num：当前值 { num }                  <button onClick={ ()=>this.setState({ num:num + 1 }) } >num++</button>                <button onClick={ ()=>this.setState({ num:num - 1 }) } >num--</button>              </div>            <div>                改变number： 当前值 { number }                 <button onClick={ ()=>this.setState({ number:number + 1 }) } > number ++</button>                <button onClick={ ()=>this.setState({ number:number - 1 }) } > number -- </button>              </div>            <NewTexMemo num={ num } number={number}  />        </div>    }}
```

完美达到了效果，`React.memo`一定程度上，可以等价于组件外部的`shouldComponentUpdate` ，用于拦截新老`props`，确定组件是否更新。

forwardRef
----------

官网对`forwardRef`的概念和用法很笼统，也没有给定一个具体的案例。很多同学不知道 `forwardRef`具体怎么用，下面我结合具体例子给大家讲解`forwardRef`应用场景。

**1 转发引入 Ref**

这个场景实际很简单，比如父组件想获取孙组件，某一个`dom`元素。这种隔代`ref`获取引用，就需要`forwardRef`来助力。

```
function Son (props){    const { grandRef } = props    return <div>        <div> i am alien </div>        <span ref={grandRef} >这个是想要获取元素</span>    </div>}class Father extends React.Component{    constructor(props){        super(props)    }    render(){        return <div>            <Son grandRef={this.props.grandRef}  />        </div>    }}const NewFather = React.forwardRef((props,ref)=><Father grandRef={ref}  {...props} />  )class GrandFather extends React.Component{    constructor(props){        super(props)    }    node = null     componentDidMount(){        console.log(this.node)    }    render(){        return <div>            <NewFather ref={(node)=> this.node = node } />        </div>    }}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppOEBFYxp4x3PpEIm5IicQsEb0oUuNlYtBqkhY4tIaFls47ekD3sehgnA/640?wx_fmt=jpeg)forwaedRef.jpg

`react`不允许`ref`通过`props`传递，因为组件上已经有 `ref` 这个属性, 在组件调和过程中，已经被特殊处理，`forwardRef`出现就是解决这个问题，把`ref`转发到自定义的`forwardRef`定义的属性上，让`ref`，可以通过`props`传递。

**2 高阶组件转发 Ref**

一文吃透`hoc`文章中讲到，由于属性代理的`hoc`，被包裹一层，所以如果是类组件，是通过`ref`拿不到原始组件的实例的，不过我们可以通过`forWardRef`转发`ref`。

```
function HOC(Component){  class Wrap extends React.Component{     render(){        const { forwardedRef ,...otherprops  } = this.props        return <Component ref={forwardedRef}  {...otherprops}  />     }  }  return  React.forwardRef((props,ref)=> <Wrap forwardedRef={ref} {...props} /> ) }class Index extends React.Component{  componentDidMount(){      console.log(666)  }  render(){    return <div>hello,world</div>  }}const HocIndex =  HOC(Index,true)export default ()=>{  const node = useRef(null)  useEffect(()=>{     /* 就可以跨层级，捕获到 Index 组件的实例了 */     console.log(node.current.componentDidMount)  },[])  return <div><HocIndex ref={node}  /></div>}
```

如上，解决了高阶组件引入`Ref`的问题。

lazy
----

> React.lazy 和 Suspense 技术还不支持服务端渲染。如果你想要在使用服务端渲染的应用中使用，我们推荐 Loadable Components 这个库

`React.lazy`和`Suspense`配合一起用，能够有动态加载组件效果。`React.lazy` 接受一个函数，这个函数需要动态调用 `import()`。它必须返回一个 `Promise` ，该 `Promise` 需要 `resolve` 一个 `default export` 的 `React` 组件。

我们模拟一个动态加载的场景。

**父组件**

```
import Test from './comTest'const LazyComponent =  React.lazy(()=> new Promise((resolve)=>{      setTimeout(()=>{          resolve({              default: ()=> <Test />          })      },2000)}))class index extends React.Component{       render(){        return <div class  style={ { marginTop :'50px' } }   >           <React.Suspense fallback={ <div class ><SyncOutlined  spin  /></div> } >               <LazyComponent />           </React.Suspense>        </div>    }}
```

我们用`setTimeout`来模拟`import`异步引入效果。**Test**

```
class Test extends React.Component{    constructor(props){        super(props)    }    componentDidMount(){        console.log('--componentDidMount--')    }    render(){        return <div>            <img src={alien}  class />        </div>    }}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppNFfBQroUQAtuicIfojAC1iauksbagqbV9rrwcGxuiaMKK3DoQlxLbR63w/640?wx_fmt=gif)lazy.gif

Suspense
--------

何为`Suspense`, `Suspense` 让组件 “等待” 某个异步操作，直到该异步操作结束即可渲染。

用于数据获取的 `Suspense` 是一个新特性，你可以使用 `<Suspense>` 以声明的方式来 “等待” 任何内容，包括数据。本文重点介绍它在数据获取的用例，它也可以用于等待图像、脚本或其他异步的操作。

上面讲到高阶组件`lazy`时候，已经用 `lazy` + `Suspense`模式，构建了异步渲染组件。我们看一下官网文档中的案例：

```
const ProfilePage = React.lazy(() => import('./ProfilePage')); // 懒加载<Suspense fallback={<Spinner />}>  <ProfilePage /></Suspense>
```

Fragment
--------

`react`不允许一个组件返回多个节点元素，比如说如下情况

```
render(){    return <li> 🍎🍎🍎 </li>           <li> 🍌🍌🍌 </li>           <li> 🍇🍇🍇 </li>}
```

如果我们想解决这个情况，很简单，只需要在外层套一个容器元素。

```
render(){    return <div>           <li> 🍎🍎🍎 </li>           <li> 🍌🍌🍌 </li>           <li> 🍇🍇🍇 </li>    </div>}
```

但是我们不期望，增加额外的`dom`节点，所以`react`提供`Fragment`碎片概念，能够让一个组件返回多个元素。所以我们可以这么写

```
<React.Fragment>    <li> 🍎🍎🍎 </li>    <li> 🍌🍌🍌 </li>    <li> 🍇🍇🍇 </li></React.Fragment>
```

还可以简写成：

```
<>    <li> 🍎🍎🍎 </li>    <li> 🍌🍌🍌 </li>    <li> 🍇🍇🍇 </li></>
```

和`Fragment`区别是，`Fragment`可以支持`key`属性。`<></>`不支持`key`属性。

Profiler
--------

`Profiler`这个`api`一般用于开发阶段，性能检测，检测一次`react`组件渲染用时，性能开销。

`Profiler` 需要两个参数：

第一个参数：是 `id`，用于表识唯一性的`Profiler`。

第二个参数：`onRender`回调函数，用于渲染完成，接受渲染参数。

**实践：**

```
const index = () => {  const callback = (...arg) => console.log(arg)  return <div >    <div >      <Profiler id="root" onRender={ callback }  >        <Router  >          <Meuns/>          <KeepaliveRouterSwitch withoutRoute >              { renderRoutes(menusList) }          </KeepaliveRouterSwitch>        </Router>      </Profiler>     </div>  </div>}
```

**结果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppJfQ0qrhZYSHiadic9hE5bwU6VshTib6ocTX1IfnQGhjibLJkQEC1NCx3IA/640?wx_fmt=jpeg)Profiler.jpg

onRender

0 -id: `root`  ->  `Profiler` 树的 `id` 。1 -phase: `mount` ->  `mount` 挂载 ， `update` 渲染了。2 -actualDuration: `6.685000262223184`  -> 更新 `committed` 花费的渲染时间。3 -baseDuration:  `4.430000321008265`  -> 渲染整颗子树需要的时间 4 -startTime : `689.7299999836832` ->  本次更新开始渲染的时间 5 -commitTime : `698.5799999674782` ->  本次更新 committed 的时间 6 -interactions: `set{}` -> 本次更新的 `interactions` 的集合

> 尽管 Profiler 是一个轻量级组件，我们依然应该在需要时才去使用它。对一个应用来说，每添加一些都会给 CPU 和内存带来一些负担。

StrictMode
----------

`StrictMode`见名知意，严格模式，用于检测`react`项目中的潜在的问题，。与 `Fragment` 一样， `StrictMode` 不会渲染任何可见的 `UI` 。它为其后代元素触发额外的检查和警告。

> 严格模式检查仅在开发模式下运行；它们不会影响生产构建。

`StrictMode`目前有助于：

*   ①识别不安全的生命周期。
    
*   ②关于使用过时字符串 `ref API` 的警告
    
*   ③关于使用废弃的 `findDOMNode` 方法的警告
    
*   ④检测意外的副作用
    
*   ⑤检测过时的 `context API`
    

**实践: 识别不安全的生命周期**

对于不安全的生命周期，指的是`UNSAFE_componentWillMount`，`UNSAFE_componentWillReceiveProps` , `UNSAFE_componentWillUpdate`

`外层开启严格模式：`

```
<React.StrictMode>     <Router  >        <Meuns/>        <KeepaliveRouterSwitch withoutRoute >            { renderRoutes(menusList) }        </KeepaliveRouterSwitch>    </Router></React.StrictMode>
```

`我们在内层组件中，使用不安全的生命周期:`

```
class Index extends React.Component{        UNSAFE_componentWillReceiveProps(){    }    render(){              return <div class />       }}
```

`效果：`

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppNrWicquEhictT2HfBZ1ZmBx3sRUMLrT8Vpxq68HGibzoqiaUgddtMNicteQ/640?wx_fmt=jpeg)strictMode.jpg

工具类
===

接下来我们一起来探究一下`react`工具类函数的用法。

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpplwZzHq6Pliatiaf5DVa4jnzibibCxO44hwq68diccNZLQooLYP81RmdrudQ/640?wx_fmt=jpeg)utils.jpg

createElement
-------------

一提到`createElement`，就不由得和`JSX`联系一起。我们写的`jsx`，最终会被 `babel`，用`createElement`编译成`react`元素形式。我写一个组件，我们看一下会被编译成什么样子，

如果我们在`render`里面这么写：

```
render(){    return <div class  />        <React.Fragment> Flagment </React.Fragment>        { /*  */ }        text文本    </div>}
```

会被编译成这样：

```
render() {    return React.createElement("div", { className: "box" },            React.createElement("div", { className: "item" }, "\u751F\u547D\u5468\u671F"),            React.createElement(Text, { mes: "hello,world" }),            React.createElement(React.Fragment, null, " Flagment "),            "text\u6587\u672C");    }
```

当然我们可以不用`jsx`模式，而是直接通过`createElement`进行开发。

**`createElement`模型:**

```
React.createElement(
  type,
  [props],
  [...children]
)
```

`createElement`参数：

** 第一个参数:** 如果是组件类型，会传入组件，如果是`dom`元素类型，传入`div`或者`span`之类的字符串。

**第二个参数:**: 第二个参数为一个对象，在`dom`类型中为**属性**，在`组件`类型中为 **props**。

**其他参数:**，依次为`children`，根据顺序排列。

**createElement 做了些什么？**

经过`createElement`处理，最终会形成 `$$typeof = Symbol(react.element)`对象。对象上保存了该`react.element`的信息。

cloneElement
------------

可能有的同学还傻傻的分不清楚`cloneElement`和`createElement`区别和作用。

`createElement`把我们写的`jsx`，变成`element`对象;  而`cloneElement`的作用是以 `element` 元素为样板克隆并返回新的 `React` 元素。返回元素的 `props` 是将新的 `props` 与原始元素的 `props` 浅层合并后的结果。

那么`cloneElement`感觉在我们实际业务组件中，可能没什么用，但是在**一些开源项目，或者是公共插槽组件中**用处还是蛮大的，比如说，我们可以在组件中，劫持`children element`，然后通过`cloneElement`克隆`element`，混入`props`。经典的案例就是 `react-router`中的`Swtich`组件，通过这种方式，来匹配唯一的 `Route`并加以渲染。

我们设置一个场景，在组件中，去劫持`children`，然后给`children`赋能一些额外的`props`:

```
function FatherComponent({ children }){    const newChildren = React.cloneElement(children, { age: 18})    return <div> { newChildren } </div>}function SonComponent(props){    console.log(props)    return <div>hello,world</div>}class Index extends React.Component{        render(){              return <div class  />            </FatherComponent>        </div>       }}
```

**打印：**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpprzx0L18yYzictdN6GRgLthVf491BO3H3ib1zE6KicumZGTMacRaAJHYDA/640?wx_fmt=jpeg)cloneElment.jpg

完美达到了效果！

createContext
-------------

`createContext`用于创建一个`Context`对象，`createContext`对象中，包括用于传递 `Context` 对象值 `value`的`Provider`，和接受`value`变化订阅的`Consumer`。

```
const MyContext = React.createContext(defaultValue)
```

`createContext`接受一个参数`defaultValue`，如果`Consumer`上一级一直没有`Provider`, 则会应用`defaultValue`作为`value`。**只有**当组件所处的树中没有匹配到 `Provider` 时，其 `defaultValue` 参数才会生效。

我们来模拟一个 `Context.Provider`和`Context.Consumer`的例子：

```
function ComponentB(){    /* 用 Consumer 订阅， 来自 Provider 中 value 的改变  */    return <MyContext.Consumer>        { (value) => <ComponentA  {...value} /> }    </MyContext.Consumer>}function ComponentA(props){    const { name , mes } = props    return <div>             <div> 姓名： { name }  </div>            <div> 想对大家说： { mes }  </div>         </div>}function index(){    const [ value , ] = React.useState({        name:'alien',        mes:'let us learn React '    })    return <div style={{ marginTop:'50px' }} >        <MyContext.Provider value={value}  >          <ComponentB />    </MyContext.Provider>    </div>}
```

**打印结果：**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpp355ohlU3sKib7yHZOd2HnY3Sziby9Ydh565u4IVuCbdBvhTpglgllgtA/640?wx_fmt=jpeg)createContent.jpg

`Provider`和`Consumer`的良好的特性，可以做数据的**存**和**取**，`Consumer`一方面传递`value`, 另一方面可以订阅`value`的改变。

`Provider`还有一个特性可以层层传递`value`，这种特性在`react-redux`中表现的淋漓尽致。

createFactory
-------------

```
React.createFactory(type)
```

返回用于生成指定类型 React 元素的函数。类型参数既可以是标签名字符串（像是 '`div`'或'`span`'），也可以是 React 组件 类型 （ `class` 组件或函数组件），或是 `React fragment` 类型。

使用：

```
const Text = React.createFactory(()=><div>hello,world</div>) function Index(){      return <div style={{ marginTop:'50px'  }} >        <Text/>    </div>}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpp4ibM3m6Gx6uKY8SMTtHK159c1uuawQsenatQyKMzTDMux11QRmIcmsQ/640?wx_fmt=jpeg)createFactory.jpg

报出警告，这个`api`将要被废弃，我们这里就不多讲了，如果想要达到同样的效果，请用`React.createElement`

createRef
---------

`createRef`可以创建一个 `ref` 元素，附加在`react`元素上。

**用法：**

```
class Index extends React.Component{    constructor(props){        super(props)        this.node = React.createRef()    }    componentDidMount(){        console.log(this.node)    }    render(){        return <div ref={this.node} > my name is alien </div>    }}
```

个人觉得`createRef`这个方法，很鸡肋，我们完全可以`class`类组件中这么写，来捕获`ref`。

```
class Index extends React.Component{    node = null    componentDidMount(){        console.log(this.node)    }    render(){        return <div ref={(node)=> this.node } > my name is alien </div>    }}
```

或者在`function`组件中这么写：

```
function Index(){    const node = React.useRef(null)    useEffect(()=>{        console.log(node.current)    },[])    return <div ref={node} >  my name is alien </div>}
```

isValidElement
--------------

这个方法可以用来检测是否为`react element`元素, 接受待验证对象，返回`true`或者`false`。这个 api 可能对于业务组件的开发，作用不大，因为对于组件内部状态，都是已知的，我们根本就不需要去验证，是否是`react element` 元素。但是，对于一起公共组件或是开源库，`isValidElement`就很有作用了。

**实践**

我们做一个场景，验证容器组件的所有子组件，过滤到非`react element`类型。

没有用`isValidElement`验证之前：

```
const Text = () => <div>hello,world</div> class WarpComponent extends React.Component{    constructor(props){        super(props)    }    render(){        return this.props.children    }}function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>            <Text/>            <div> my name is alien </div>            Let's learn react together!        </WarpComponent>    </div>}
```

**过滤之前的效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppXVEq4u7KbWXatVZ3KMPZP4m9Eg3egZ6PDTCYWbWxic1hefOeAVByDJg/640?wx_fmt=jpeg)isValidElement.jpg

**我们用`isValidElement`进行`react element`验证:**

```
class WarpComponent extends React.Component{    constructor(props){        super(props)        this.newChidren = this.props.children.filter(item => React.isValidElement(item) )    }    render(){        return this.newChidren    }}
```

**过滤之后效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppkxCBBVwpXpqcSVyMmFJMUCgfTc0S67IEvbGRHKLFE4AiaSO6PMCOYsg/640?wx_fmt=jpeg)isValidElement111.jpg

过滤掉了非`react element` 的 `Let's learn react together!`。

Children.map
------------

接下来的五个`api`都是和`react.Chidren`相关的，我们来分别介绍一下，我们先来看看官网的描述，`React.Children` 提供了用于处理 `this.props.children` 不透明数据结构的实用方法。

有的同学会问遍历 `children`用数组方法,`map` ，`forEach` 不就可以了吗？请我们注意一下`不透明数据结构`, 什么叫做不透明结构?

**我们先看一下透明的结构：**

```
class Text extends React.Component{    render(){        return <div>hello,world</div>    }}function WarpComponent(props){    console.log(props.children)    return props.children}function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>            <Text/>            <Text/>            <Text/>            <span>hello,world</span>        </WarpComponent>    </div>}
```

**打印**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpp7xL17uSdzOc6ArstDQPQAtvoADSib2NkZIIywSHg7aN8bYcN94ZnM8Q/640?wx_fmt=jpeg)chidrenmap.jpg

但是我们把`Index`结构改变一下：

```
function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>            { new Array(3).fill(0).map(()=><Text/>) }            <span>hello,world</span>        </WarpComponent>    </div>}
```

**打印**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppibqJb1fBHoefpf0oa4obKcrEJ2h0o7cL7nBP1u5IlZ2yUZIraJqQ4YA/640?wx_fmt=jpeg)chidrenmap2.jpg

这个数据结构，我们不能正常的遍历了，即使遍历也不能遍历，每一个子元素。此时就需要 `react.Chidren` 来帮忙了。

但是我们把`WarpComponent`组件用`react.Chidren`处理`children`:

```
function WarpComponent(props){    const newChildren = React.Children.map(props.children,(item)=>item)    console.log(newChildren)    return newChildren}
```

此时就能正常遍历了，达到了预期效果。

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpp8tn6dqThicFVA1FZpcichbic4RnW2ppFg5AzsDfnkPlJTYcVkVA9VooHg/640?wx_fmt=jpeg)C71364B2-25E8-4F7D-A26D-50CA36AF4E33.jpg

**注意**如果 `children` 是一个 `Fragment` 对象，它将被视为单一子节点的情况处理，而不会被遍历。

Children.forEach
----------------

`Children.forEach`和`Children.map` 用法类似，`Children.map`可以返回新的数组，`Children.forEach`仅停留在遍历阶段。

我们将上面的`WarpComponent`方法，用`Children.forEach`改一下。

```
function WarpComponent(props){    React.Children.forEach(props.children,(item)=>console.log(item))    return props.children}
```

Children.count
--------------

`children` 中的组件总数量，等同于通过 `map` 或 `forEach` 调用回调函数的次数。对于更复杂的结果，`Children.count`可以返回同一级别子组件的数量。

我们还是把上述例子进行改造：

```
function WarpComponent(props){    const childrenCount =  React.Children.count(props.children)    console.log(childrenCount,'childrenCount')    return props.children}   function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>            { new Array(3).fill(0).map((item,index) => new Array(2).fill(1).map((item,index1)=><Text key={index+index1} />)) }            <span>hello,world</span>        </WarpComponent>    </div>}
```

**效果:**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppmZ49vC04VWQpQrg4hWDjVOpcPr6IjvpqS9MGejLicFdmucdibZMHVMWg/640?wx_fmt=jpeg)chidrencunt.jpg

Children.toArray
----------------

`Children.toArray`返回，`props.children`扁平化后结果。

```
function WarpComponent(props){    const newChidrenArray =  React.Children.toArray(props.children)    console.log(newChidrenArray,'newChidrenArray')    return newChidrenArray}   function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>            { new Array(3).fill(0).map((item,index)=>new Array(2).fill(1).map((item,index1)=><Text key={index+index1} />)) }            <span>hello,world</span>        </WarpComponent>    </div>}
```

**效果：**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppuibcpkjwtDBYmbjFbQ9CYjAtPEBP5jEQcmGdvy9WGHFCelnHRtfEK6w/640?wx_fmt=jpeg)chuldeanarrgy.jpg

**newChidrenArray** , 就是扁平化的数组结构。`React.Children.toArray()` 在拉平展开子节点列表时，更改 `key` 值以保留嵌套数组的语义。也就是说， `toArray` 会为返回数组中的每个 `key` 添加前缀，以使得每个元素 `key` 的范围都限定在此函数入参数组的对象内。

Children.only
-------------

验证 `children` 是否只有一个子节点（一个 `React` 元素），如果有则返回它，否则此方法会抛出错误。

**不唯一**

```
function WarpComponent(props){    console.log(React.Children.only(props.children))    return props.children}   function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>            { new Array(3).fill(0).map((item,index)=><Text key={index} />) }            <span>hello,world</span>        </WarpComponent>    </div>}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppc7wiah3FQ6Uosy5eHs0cU2WuG5WJg6HMa55G9G3jxQFAvXrM0jhgnvQ/640?wx_fmt=jpeg)falseonly.jpg

**唯一**

```
function WarpComponent(props){    console.log(React.Children.only(props.children))    return props.children}   function Index(){    return <div style={{ marginTop:'50px' }} >        <WarpComponent>           <Text/>        </WarpComponent>    </div>}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppyZLhaFlBnFrFzxXCQUgmwklyRValW9mFzYndz850g0Elqgkpy2N46A/640?wx_fmt=jpeg)only.jpg

`React.Children.only()` 不接受 `React.Children.map()` 的返回值，因为它是一个数组而并不是 `React` 元素。

react-hooks
===========

对于`react-hooks`, 我已经写了三部曲，对于常见的`hooks`，我这里就不多讲了，还没看过的同学建议看一下`react-hooks三部曲`。

三部曲

 [「react 进阶」一文吃透 react-hooks 原理](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247484634&idx=1&sn=618673960ee73b55df82efe886fd6cdd&chksm=cfc14de8f8b6c4fed909929339dd7ed4092af462de88150767173baea4a7fcb3e3ed501daefd&scene=21#wechat_redirect)  

  [玩转 react-hooks, 自定义 hooks 设计模式及其实战](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247484169&idx=1&sn=db83a13c9ecfe11913325559d8835a54&chksm=cfc14a3bf8b6c32dc0c16f1ec05cf986176abfb8e5a5391a6cf4d6e8ed733ed46a6b340a93c0&scene=21#wechat_redirect)

[react-hooks 如何使用？](http://mp.weixin.qq.com/s?__biz=Mzg5MjMxMzY5Mw==&mid=2247483747&idx=3&sn=682f1b80542e9c1b8a560e6fdaedf49c&chksm=cfc14851f8b6c147c7faa51012f0f92f01c78b53c56e7cd15e3d03d9a987642eeb45a6a4d9a8&scene=21#wechat_redirect)  

我们今天重点说一下，几个少用的`api`

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKpp7Evoka7dLHdu4P1ujmLssnMkuRqGLgBaXv7jXunEice9OMzpxCPempA/640?wx_fmt=jpeg)hooks.jpg

useImperativeHandle
-------------------

`useImperativeHandle` 可以配合 `forwardRef`自定义暴露给父组件的实例值。这个很有用，我们知道，对于子组件，如果是`class`类组件，我们可以通过`ref`获取类组件的实例，但是在子组件是函数组件的情况，如果我们不能直接通过`ref`的，那么此时`useImperativeHandle`和 `forwardRef`配合就能达到效果。

`useImperativeHandle`接受三个参数：

*   第一个参数 ref: 接受 `forWardRef` 传递过来的 `ref`。
    
*   第二个参数 `createHandle` ：处理函数，返回值作为暴露给父组件的`ref`对象。
    
*   第三个参数 `deps`: 依赖项 `deps`，依赖项更改形成新的`ref`对象。
    

**我们来模拟给场景，用`useImperativeHandle`，使得父组件能让子组件中的`input`自动赋值并聚焦。**

```
function Son (props,ref) {    console.log(props)    const inputRef = useRef(null)    const [ inputValue , setInputValue ] = useState('')    useImperativeHandle(ref,()=>{       const handleRefs = {           /* 声明方法用于聚焦input框 */           onFocus(){              inputRef.current.focus()           },           /* 声明方法用于改变input的值 */           onChangeValue(value){               setInputValue(value)           }       }       return handleRefs    },[])    return <div>        <input            placeholder="请输入内容"            ref={inputRef}            value={inputValue}        />    </div>}const ForwarSon = forwardRef(Son)class Index extends React.Component{    cur = null    handerClick(){       const { onFocus , onChangeValue } =this.cur       onFocus()       onChangeValue('let us learn React!')    }    render(){        return <div style={{ marginTop:'50px' }} >            <ForwarSon ref={cur => (this.cur = cur)} />            <button onClick={this.handerClick.bind(this)} >操控子组件</button>        </div>    }}
```

**效果:**

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppWtuFf49eYGOJnUKc7RwoACWm9ztWlAAOgpqy0ib3WwBQ3iaS5ClI2saA/640?wx_fmt=gif)useImperativeHandle.gif

useDebugValue
-------------

`useDebugValue` 可用于在 `React` 开发者工具中显示自定义 `hook` 的标签。这个`hooks`目的就是检查自定义`hooks`

```
function useFriendStatus(friendID) {  const [isOnline, setIsOnline] = useState(null);  // ...  // 在开发者工具中的这个 Hook 旁边显示标签  // e.g. "FriendStatus: Online"  useDebugValue(isOnline ? 'Online' : 'Offline');  return isOnline;}
```

> 我们不推荐你向每个自定义 Hook 添加 debug 值。当它作为共享库的一部分时才最有价值。在某些情况下，格式化值的显示可能是一项开销很大的操作。除非需要检查 Hook，否则没有必要这么做。因此，useDebugValue 接受一个格式化函数作为可选的第二个参数。该函数只有在 Hook 被检查时才会被调用。它接受 debug 值作为参数，并且会返回一个格式化的显示值。

useTransition
-------------

`useTransition`允许延时由`state`改变而带来的视图渲染。避免不必要的渲染。它还允许组件将速度较慢的数据获取更新推迟到随后渲染，以便能够立即渲染更重要的更新。

```
const TIMEOUT_MS = { timeoutMs: 2000 }const [startTransition, isPending] = useTransition(TIMEOUT_MS)
```

*   `useTransition` 接受一个对象， `timeoutMs`代码需要延时的时间。
    
*   返回一个数组。**第一个参数：**  是一个接受回调的函数。我们用它来告诉 `React` 需要推迟的 `state` 。**第二个参数：** 一个布尔值。表示是否正在等待，过度状态的完成 (延时`state`的更新)。
    

下面我们引入官网的列子，来了解`useTransition`的使用。

```
const SUSPENSE_CONFIG = { timeoutMs: 2000 };function App() {  const [resource, setResource] = useState(initialResource);  const [startTransition, isPending] = useTransition(SUSPENSE_CONFIG);  return (    <>      <button        disabled={isPending}        onClick={() => {          startTransition(() => {            const nextUserId = getNextId(resource.userId);            setResource(fetchProfileData(nextUserId));          });        }}      >        Next      </button>      {isPending ? " 加载中..." : null}      <Suspense fallback={<Spinner />}>        <ProfilePage resource={resource} />      </Suspense>    </>  );}
```

在这段代码中，我们使用 `startTransition` 包装了我们的数据获取。这使我们可以立即开始获取用户资料的数据，同时推迟下一个用户资料页面以及其关联的 `Spinner` 的渲染 2 秒钟（ `timeoutMs`  中显示的时间）。

这个`api`目前处于实验阶段，没有被完全开放出来。

react-dom
=========

接下来，我们来一起研究`react-dom`中比较重要的`api`。

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppvvqVRdnqVY7166VZs1bnwO1ywkUfNd9Ik7Wp5Zibibo4HuM39loaGaxw/640?wx_fmt=jpeg)react-dom.jpg

render
------

`render` 是我们最常用的`react-dom`的 `api`，用于渲染一个`react`元素，一般`react`项目我们都用它，渲染根部容器`app`。

```
ReactDOM.render(element, container[, callback])
```

**使用**

```
ReactDOM.render(    < App / >,    document.getElementById('app'))
```

`ReactDOM.render`会控制`container`容器节点里的内容，但是不会修改容器节点本身。

hydrate
-------

服务端渲染用`hydrate`。用法与 `render()` 相同，但它用于在 `ReactDOMServer` 渲染的容器中对 `HTML` 的内容进行 `hydrate` 操作。

```
ReactDOM.hydrate(element, container[, callback])
```

createPortal
------------

`Portal` 提供了一种将子节点渲染到存在于父组件以外的 `DOM` 节点的优秀的方案。`createPortal` 可以把当前组件或 `element` 元素的子节点，渲染到组件之外的其他地方。

那么具体应用到什么场景呢？

比如一些全局的弹窗组件`model`,`<Model/>`组件一般都写在我们的组件内部，倒是真正挂载的`dom`，都是在外层容器，比如`body`上。此时就很适合`createPortal`API。

`createPortal`接受两个参数：

```
ReactDOM.createPortal(child, container)
```

第一个：`child` 是任何可渲染的 `React` 子元素 第二个：`container`是一个 `DOM` 元素。

接下来我们实践一下：

```
function WrapComponent({ children }){    const domRef = useRef(null)    const [ PortalComponent, setPortalComponent ] = useState(null)    React.useEffect(()=>{        setPortalComponent( ReactDOM.createPortal(children,domRef.current) )    },[])    return <div>         <div class ref={ domRef } ></div>        { PortalComponent }     </div>}class Index extends React.Component{    render(){        return <div style={{ marginTop:'50px' }} >             <WrapComponent>               <div  >hello,world</div>            </WrapComponent>        </div>    }}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppQj2tz7ibKIUJIC06vv0wn1TTEBiaf0NKd5kwnquKOx1Z9tZWgULYaPiaA/640?wx_fmt=jpeg)createPortal.jpg

我们可以看到，我们`children`实际在`container` 之外挂载的，但是已经被`createPortal`渲染到`container`中。

unstable_batchedUpdates
-----------------------

在`react-legacy`模式下，对于事件，`react`事件有批量更新来处理功能, 但是这一些非常规的事件中，批量更新功能会被打破。所以我们可以用`react-dom`中提供的`unstable_batchedUpdates` 来进行批量更新。

**一次点击实现的批量更新**

```
class Index extends React.Component{    constructor(props){       super(props)       this.state={           numer:1,       }    }    handerClick=()=>{        this.setState({ numer : this.state.numer + 1 })        console.log(this.state.numer)        this.setState({ numer : this.state.numer + 1 })        console.log(this.state.numer)        this.setState({ numer : this.state.numer + 1 })        console.log(this.state.numer)    }    render(){        return <div  style={{ marginTop:'50px' }} >             <button onClick={ this.handerClick } >click me</button>        </div>    }}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppE7sOE8ThQS9eibJQN7H3t6zd4904Ad02UmszxlKdfzx36zicpOtibceXg/640?wx_fmt=jpeg)batch1.jpg

渲染次数一次。

**批量更新条件被打破**

```
handerClick=()=>{    Promise.resolve().then(()=>{        this.setState({ numer : this.state.numer + 1 })        console.log(this.state.numer)        this.setState({ numer : this.state.numer + 1 })        console.log(this.state.numer)        this.setState({ numer : this.state.numer + 1 })        console.log(this.state.numer)    })  }
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppEL6EMzt9x4ezh1mgBicKZdYCcI9rBCy2XYIDVpQpDaZurk67U922I1w/640?wx_fmt=jpeg)batch2.jpg

渲染次数三次。

**unstable_batchedUpdate 助力**

```
handerClick=()=>{        Promise.resolve().then(()=>{            ReactDOM.unstable_batchedUpdates(()=>{                this.setState({ numer : this.state.numer + 1 })                console.log(this.state.numer)                this.setState({ numer : this.state.numer + 1 })                console.log(this.state.numer)                this.setState({ numer : this.state.numer + 1 })                console.log(this.state.numer)            })         })    }
```

渲染次数一次, 完美解决批量更新问题。

flushSync
---------

`flushSync` 可以将回调函数中的更新任务，放在一个较高的优先级中。我们知道`react`设定了很多不同优先级的更新任务。如果一次更新任务在`flushSync`回调函数内部，那么将获得一个较高优先级的更新。比如

```
ReactDOM.flushSync(()=>{    /* 此次更新将设置一个较高优先级的更新 */    this.setState({ name: 'alien'  })})
```

为了让大家理解`flushSync`，我这里做一个`demo`奉上，

```
/* flushSync */import ReactDOM from 'react-dom'class Index extends React.Component{    state={ number:0 }    handerClick=()=>{        setTimeout(()=>{            this.setState({ number: 1  })        })        this.setState({ number: 2  })        ReactDOM.flushSync(()=>{            this.setState({ number: 3  })        })        this.setState({ number: 4  })    }    render(){        const { number } = this.state        console.log(number) // 打印什么？？        return <div>            <div>{ number }</div>            <button onClick={this.handerClick} >测试flushSync</button>        </div>    }}
```

先不看答案，点击一下按钮，打印什么呢？

**我们来点击一下看看**

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppzgBA6BTicmmKZxia74yXsuqeyIlJooT0iaxTbS3exUnzmxyI9KSRPBWIQ/640?wx_fmt=gif)flushSync.gif

打印 0 3 4 1 ，相信不难理解为什么这么打印了。

*   首先 `flushSync` `this.setState({ number: 3 })`设定了一个高优先级的更新，所以 3 先被打印
    
*   2 4 被批量更新为 4
    

相信这个`demo`让我们更深入了解了`flushSync`。

findDOMNode
-----------

`findDOMNode`用于访问组件`DOM`元素节点，`react`推荐使用`ref`模式，不期望使用`findDOMNode`。

```
ReactDOM.findDOMNode(component)
```

注意的是：

*   1 `findDOMNode`只能用在已经挂载的组件上。
    
*   2  如果组件渲染内容为 `null` 或者是 `false`，那么 `findDOMNode`返回值也是 `null`。
    
*   3 `findDOMNode` 不能用于函数组件。
    

接下来让我们看一下，`findDOMNode`具体怎么使用的：

```
class Index extends React.Component{    handerFindDom=()=>{        console.log(ReactDOM.findDOMNode(this))    }    render(){        return <div style={{ marginTop:'100px' }} >            <div>hello,world</div>            <button onClick={ this.handerFindDom } >获取容器dom</button>        </div>    }}
```

**效果：**

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppJOXDBw98H6yIaiaWA9opx3BBAiaKd5WmyQCwzGUVw8icIK08icGdfyHU3Q/640?wx_fmt=gif)findNodedom.gif

我们完全可以将外层容器用`ref`来标记，获取捕获原生的`dom`节点。

unmountComponentAtNode
----------------------

从 `DOM` 中卸载组件，会将其事件处理器和 `state` 一并清除。如果指定容器上没有对应已挂载的组件，这个函数什么也不会做。如果组件被移除将会返回 `true` ，如果没有组件可被移除将会返回  `false` 。

我们来简单举例看看`unmountComponentAtNode`如何使用？

```
function Text(){    return <div>hello,world</div>}class Index extends React.Component{    node = null    constructor(props){       super(props)       this.state={           numer:1,       }    }    componentDidMount(){        /*  组件初始化的时候，创建一个 container 容器 */        ReactDOM.render(<Text/> , this.node )    }    handerClick=()=>{       /* 点击卸载容器 */        const state =  ReactDOM.unmountComponentAtNode(this.node)       console.log(state)    }    render(){        return <div  style={{ marginTop:'50px' }}  >              <div ref={ ( node ) => this.node = node  }  ></div>              <button onClick={ this.handerClick } >click me</button>        </div>    }}
```

**效果**

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdx2IePG6IEmkBDkvWE1GKppv4icTiasO1UA0PFgiaxVSW9xsy55svyZXRMGVBGCWoA8yBF1v6ibeBzqBw/640?wx_fmt=gif)unmounted.gif

总结
==

本文通过`react`组件层面，工具层面，`hooks`层面，`react-dom`了解了`api`的用法，希望看完的同学，能够对着文章中的`demo`自己敲一遍，到头来会发现自己成长不少。

最后, 送人玫瑰，手留余香，觉得有收获的朋友可以给笔者**点赞，关注**一波 ，陆续更新前端超硬核文章。

提前透漏：接下来会出一部揭秘`react`事件系统的文章。感兴趣的同学请关注我！

参考文档
----

react 中文文档

如果你觉得这篇内容对你挺有启发，我想邀请你帮我三个小忙：

1.  点个「**在看**」，让更多的人也能看到这篇内容（喜欢不点在看，都是耍流氓 -_-）
    
2.  欢迎加我微信「**CALSFxiaotan**」一起交流学习...
    
3.  关注公众号「**前端巅峰**」，持续为你推送精选好文。