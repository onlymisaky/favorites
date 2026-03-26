> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/UfzzGH0uF0VIoP_XCnL5dg)

### react 强制刷新

component.forceUpdate() 一个不常用的生命周期方法, 它的作用就是强制刷新。

官网解释如下：

1.  默认情况下，当组件的 state 或 props 发生变化时，组件将重新渲染。如果 render() 方法依赖于其他数据，则可以调用 forceUpdate() 强制让组件重新渲染。
    
2.  调用 forceUpdate() 将致使组件调用 render() 方法，此操作会跳过该组件的 shouldComponentUpdate()。但其子组件会触发正常的生命周期方法，包括 shouldComponentUpdate() 方法。如果标记发生变化，React 仍将只更新 DOM。
    

通常你应该避免使用 forceUpdate()，尽量在 render() 中使用 this.props 和 this.state。

shouldComponentUpdate 在初始化 和 forceUpdate 不会执行。

### React 组件中怎么做事件代理？它的原理是什么？

React 基于 Virtual DOM 实现了一个 SyntheticEvent 层（合成事件层），定义的事件处理器会接收到一个合成事件对象的实例，它符合 W3C 标准，且与原生的浏览器事件拥有同样的接口，支持冒泡机制，所有的事件都自动绑定在最外层上。

在 React 底层，主要对合成事件做了两件事：

*   **事件委派：** React 会把所有的事件绑定到结构的最外层，使用统一的事件监听器，这个事件监听器上维持了一个映射来保存所有组件内部事件监听和处理函数。
    
*   **自动绑定：** React 组件中，每个方法的上下文都会指向该组件的实例，即自动绑定 this 为当前组件。
    

### React-Router 怎么设置重定向？

在 React Router 中设置重定向可以通过使用`<Redirect>`组件来实现。

以下是不同版本 React Router 中设置重定向的基本方法：

1.  React Router v4 至 v5:
    

在 React Router v4 和 v5 中，你可以直接在路由配置中使用`<Redirect>`组件来进行重定向：

```
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';function App() {  return (    <Router>      {/* 重定向示例 */}      <Route exact path="/old-path" render={() => <Redirect to="/new-path" />} />      {/* 其他路由配置 */}      <Route path="/new-path" component={NewPage} />      {/* ... */}    </Router>  );}
```

在这个例子中，当用户访问路径`/old-path`时，将会被重定向到`/new-path`。

2.  React Router v6
    

在 React Router v6 中，`<Redirect>`组件已经被移除，取而代之的是使用`navigate()`函数或者在`element`属性中执行条件重定向：

```
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';function App() {  let navigate = useNavigate();  // 使用navigate函数重定向  useEffect(() => {    if (shouldRedirect) {      navigate('/new-path', { replace: true }); // replace防止原路径保留在历史记录中    }  }, [shouldRedirect, navigate]);  return (    <Router>      {/* 或者在Route内部执行条件重定向 */}      <Routes>        <Route path="/old-path">          { /* 检查某些条件并重定向 */}          {conditionalRedirect && <Navigate to="/new-path" replace />}        </Route>        <Route path="/new-path" element={<NewPage />} />        {/* ... */}      </Routes>    </Router>  );}
```

在 v6 中，如果要在渲染阶段直接重定向，可以使用`<Navigate>`组件，并根据需要设置`to`属性为目标路径。如果需要根据某些条件动态重定向，则可以配合 useState 或者其他状态管理工具，在满足条件时触发重定向。

### 什么是上下文 Context

Context 通过组件树提供了一个传递数据的方法，从而避免了在每一个层级手动的传递 props 属性。

*   用法：在父组件上定义 getChildContext 方法，返回一个对象，然后它的子组件就可以通过 this.context 属性来获取
    

```
import React,{Component} from 'react';import ReactDOM from 'react-dom';import PropTypes from 'prop-types';class Header extends Component{    render() {        return (            <div>                <Title/>            </div>        )    }}class Title extends Component{    static contextTypes={        color:PropTypes.string    }    render() {        return (            <div style={{color:this.context.color}}>                Title            </div>        )    }}class Main extends Component{    render() {        return (            <div>                <Content>                </Content>            </div>        )    }}class Content extends Component{    static contextTypes={        color: PropTypes.string,        changeColor:PropTypes.func    }    render() {        return (            <div style={{color:this.context.color}}>                Content                <button onClick={()=>this.context.changeColor('green')}>绿色</button>                <button onClick={()=>this.context.changeColor('orange')}>橙色</button>            </div>        )    }}class Page extends Component{    constructor() {        super();        this.state={color:'red'};    }    static childContextTypes={        color: PropTypes.string,        changeColor:PropTypes.func    }    getChildContext() {        return {            color: this.state.color,            changeColor:(color)=>{                this.setState({color})            }        }    }    render() {        return (            <div>                <Header/>                <Main/>            </div>        )    }}ReactDOM.render(<Page/>,document.querySelector('#root'));
```

### 在构造函数调用 super 并将 props 作为参数传入的作用

在调用 super() 方法之前，子类构造函数无法使用 this 引用，ES6 子类也是如此。  
将 props 参数传递给 super() 调用的主要原因是在子构造函数中能够通过 this.props 来获取传入的 props

**传递了 props**

```
class MyComponent extends React.Component {  constructor(props) {    super(props);    console.log(this.props); // { name: 'sudheer',age: 30 }  }}
```

**没传递 props**

```
class MyComponent extends React.Component {  constructor(props) {    super();    console.log(this.props); // undefined    // 但是 Props 参数仍然可用    console.log(props); // Prints { name: 'sudheer',age: 30 }  }  render() {    // 构造函数外部不受影响    console.log(this.props); // { name: 'sudheer',age: 30 }  }}
```

### React Hooks 在平时开发中需要注意的问题和原因

（1）**不要在循环，条件或嵌套函数中调用 Hook，必须始终在 React 函数的顶层使用 Hook**

这是因为 React 需要利用调用顺序来正确更新相应的状态，以及调用相应的钩子函数。一旦在循环或条件分支语句中调用 Hook，就容易导致调用顺序的不一致性，从而产生难以预料到的后果。

（2）**使用 useState 时候，使用 push，pop，splice 等直接更改数组对象的坑**

使用 push 直接更改数组无法获取到新值，应该采用析构方式，但是在 class 里面不会有这个问题。代码示例：

```
function Indicatorfilter() {  let [num,setNums] = useState([0,1,2,3])  const test = () => {    // 这里坑是直接采用push去更新num    // setNums(num)是无法更新num的    // 必须使用num = [...num ,1]    num.push(1)    // num = [...num ,1]    setNums(num)  }return (    <div className='filter'>      <div onClick={test}>测试</div>        <div>          {num.map((item,index) => (              <div key={index}>{item}</div>          ))}      </div>    </div>  )}class Indicatorfilter extends React.Component<any,any>{  constructor(props:any){      super(props)      this.state = {          nums:[1,2,3]      }      this.test = this.test.bind(this)  }  test(){      // class采用同样的方式是没有问题的      this.state.nums.push(1)      this.setState({          nums: this.state.nums      })  }  render(){      let {nums} = this.state      return(          <div>              <div onClick={this.test}>测试</div>                  <div>                      {nums.map((item:any,index:number) => (                          <div key={index}>{item}</div>                      ))}                  </div>          </div>      )  }}
```

（3）**useState 设置状态的时候，只有第一次生效，后期需要更新状态，必须通过 useEffect**

TableDeail 是一个公共组件，在调用它的父组件里面，我们通过 set 改变 columns 的值，以为传递给 TableDeail 的 columns 是最新的值，所以 tabColumn 每次也是最新的值，但是实际 tabColumn 是最开始的值，不会随着 columns 的更新而更新：

```
const TableDeail = ({    columns,}:TableData) => {    const [tabColumn, setTabColumn] = useState(columns) }// 正确的做法是通过useEffect改变这个值const TableDeail = ({    columns,}:TableData) => {    const [tabColumn, setTabColumn] = useState(columns)     useEffect(() =>{setTabColumn(columns)},[columns])}
```

（4）**善用 useCallback**

父组件传递给子组件事件句柄时，如果我们没有任何参数变动可能会选用 useMemo。但是每一次父组件渲染子组件即使没变化也会跟着渲染一次。

（5）**不要滥用 useContext**

可以使用基于 useContext 封装的状态管理工具。

### hooks 父子传值

```
父传子在父组件中用useState声明数据 const [ data, setData ] = useState(false)把数据传递给子组件<Child data={data} />子组件接收export default function (props) {    const { data } = props    console.log(data)}--------子传父子传父可以通过事件方法传值，和父传子有点类似。在父组件中用useState声明数据 const [ data, setData ] = useState(false)把更新数据的函数传递给子组件<Child setData={setData} />子组件中触发函数更新数据，就会直接传递给父组件export default function (props) {    const { setData } = props    setData(true)}--------如果存在多个层级的数据传递，也可依照此方法依次传递// 多层级用useContextconst User = () => { // 直接获取，不用回调 const { user, setUser } = useContext(UserContext); return <Avatar user={user} setUser={setUser} />;};
```

### React 中 constructor 和 getInitialState 的区别?

两者都是用来初始化 state 的。前者是 ES6 中的语法，后者是 ES5 中的语法，新版本的 React 中已经废弃了该方法。

getInitialState 是 ES5 中的方法，如果使用 createClass 方法创建一个 Component 组件，可以自动调用它的 getInitialState 方法来获取初始化的 State 对象，

```
var APP = React.creatClass ({  getInitialState() {    return {         userName: 'hi',        userId: 0     }; }})
```

React 在 ES6 的实现中去掉了 getInitialState 这个 hook 函数，规定 state 在 constructor 中实现，如下：

```
Class App extends React.Component{    constructor(props){      super(props);      this.state={};    }  }
```

### React 的事件和普通的 HTML 事件有什么不同？

区别：

*   对于事件名称命名方式，原生事件为全小写，react 事件采用小驼峰；
    
*   对于事件函数处理语法，原生事件为字符串，react 事件为函数；
    
*   react 事件不能采用 return false 的方式来阻止浏览器的默认行为，而必须要地明确地调用`preventDefault()`来阻止默认行为。
    

合成事件是 react 模拟原生 DOM 事件所有能力的一个事件对象，其优点如下：

*   兼容所有浏览器，更好的跨平台；
    
*   将事件统一存放在一个数组，避免频繁的新增与删除（垃圾回收）。
    
*   方便 react 统一管理和事务机制。
    

事件的执行顺序为原生事件先执行，合成事件后执行，合成事件会冒泡绑定到 document 上，所以尽量避免原生事件与合成事件混用，如果原生事件阻止冒泡，可能会导致合成事件不执行，因为需要冒泡到 document 上合成事件才会执行。

### React 中的高阶组件运用了什么设计模式？

使用了装饰模式，高阶组件的运用：

```
function withWindowWidth(BaseComponent) {  class DerivedClass extends React.Component {    state = {      windowWidth: window.innerWidth,    }    onResize = () => {      this.setState({        windowWidth: window.innerWidth,      })    }    componentDidMount() {      window.addEventListener('resize', this.onResize)    }    componentWillUnmount() {      window.removeEventListener('resize', this.onResize);    }    render() {      return <BaseComponent {...this.props} {...this.state}/>    }  }  return DerivedClass;}const MyComponent = (props) => {  return <div>Window width is: {props.windowWidth}</div>};export default withWindowWidth(MyComponent);
```

装饰模式的特点是不需要改变 被装饰对象 本身，而只是在外面套一个外壳接口。JavaScript 目前已经有了原生装饰器的提案，其用法如下：

```
@testable   class MyTestableClass {}
```

### 什么是高阶组件

高阶组件不是组件，是 增强函数，可以输入一个元组件，返回出一个新的增强组件

*   属性代理 (Props Proxy) 在我看来属性代理就是提取公共的数据和方法到父组件，子组件只负责渲染数据，相当于设计模式里的模板模式，这样组件的重用性就更高了
    

```
function proxyHoc(WrappedComponent) {    return class extends React.Component {        render() {            const newProps = {                count: 1            }            return <WrappedComponent {...this.props} {...newProps} />        }    }}
```

*   反向继承
    

```
const MyContainer = (WrappedComponent)=>{    return class extends WrappedComponent {        render(){            return super.render();        }    }}
```

### 高阶组件的应用场景

权限控制

利用高阶组件的 **条件渲染** 特性可以对页面进行权限控制，权限控制一般分为两个维度：**页面级别** 和 **页面元素级别**

```
// HOC.js    function withAdminAuth(WrappedComponent) {        return class extends React.Component {            state = {                isAdmin: false,            }            async componentWillMount() {                const currentRole = await getCurrentUserRole();                this.setState({                    isAdmin: currentRole === 'Admin',                });            }            render() {                if (this.state.isAdmin) {                    return <WrappedComponent {...this.props} />;                } else {                    return (<div>您没有权限查看该页面，请联系管理员！</div>);                }            }        };    }// 使用// pages/page-a.js    class PageA extends React.Component {        constructor(props) {            super(props);            // something here...        }        componentWillMount() {            // fetching data        }        render() {            // render page with data        }    }    export default withAdminAuth(PageA);
```

可能你已经发现了，高阶组件其实就是装饰器模式在 React 中的实现：通过给函数传入一个组件（函数或类）后在函数内部对该组件（函数或类）进行功能的增强（不修改传入参数的前提下），最后返回这个组件（函数或类），即允许向一个现有的组件添加新的功能，同时又不去修改该组件，属于 **包装模式 (Wrapper Pattern)** 的一种。

什么是装饰者模式：**在不改变对象自身的前提下在程序运行期间动态的给对象添加一些额外的属性或行为**

**可以提高代码的复用性和灵活性**。

再对高阶组件进行一个小小的总结：

*   高阶组件 **不是组件**，**是** 一个把某个组件转换成另一个组件的 **函数**
    
*   高阶组件的主要作用是 **代码复用**
    
*   高阶组件是 **装饰器模式在 React 中的实现**
    

**封装组件的原则**

封装原则

1、单一原则：负责单一的页面渲染

2、多重职责：负责多重职责，获取数据，复用逻辑，页面渲染等

3、明确接受参数：必选，非必选，参数尽量设置以_开头，避免变量重复

4、可扩展：需求变动能够及时调整，不影响之前代码

5、代码逻辑清晰

6、封装的组件必须具有高性能，低耦合的特性

7、组件具有单一职责：封装业务组件或者基础组件，如果不能给这个组件起一个有意义的名字，证明这个组件承担的职责可能不够单一，需要继续抽组件，直到它可以是一个独立的组件即可

### Redux 中异步的请求怎么处理

可以在 componentDidmount 中直接进⾏请求⽆须借助 redux。但是在⼀定规模的项⽬中, 上述⽅法很难进⾏异步流的管理, 通常情况下我们会借助 redux 的异步中间件进⾏异步处理。redux 异步流中间件其实有很多，当下主流的异步中间件有两种 redux-thunk、redux-saga。

**（1）使用 react-thunk 中间件**

**redux-thunk** 优点:

*   体积⼩: redux-thunk 的实现⽅式很简单, 只有不到 20 ⾏代码
    
*   使⽤简单: redux-thunk 没有引⼊像 redux-saga 或者 redux-observable 额外的范式, 上⼿简单
    

**redux-thunk** 缺陷:

*   样板代码过多: 与 redux 本身⼀样, 通常⼀个请求需要⼤量的代码, ⽽且很多都是重复性质的
    
*   耦合严重: 异步操作与 redux 的 action 偶合在⼀起, 不⽅便管理
    
*   功能孱弱: 有⼀些实际开发中常⽤的功能需要⾃⼰进⾏封装
    

使用步骤：

*   配置中间件，在 store 的创建中配置
    

```
import {createStore, applyMiddleware, compose} from 'redux';import reducer from './reducer';import thunk from 'redux-thunk'// 设置调试工具const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;// 设置中间件const enhancer = composeEnhancers(  applyMiddleware(thunk));const store = createStore(reducer, enhancer);export default store;
```

*   添加一个返回函数的 actionCreator，将异步请求逻辑放在里面
    

```
/**  发送get请求，并生成相应action，更新store的函数  @param url {string} 请求地址  @param func {function} 真正需要生成的action对应的actionCreator  @return {function} */// dispatch为自动接收的store.dispatch函数 export const getHttpAction = (url, func) => (dispatch) => {    axios.get(url).then(function(res){        const action = func(res.data)        dispatch(action)    })}
```

*   生成 action，并发送 action
    

```
componentDidMount(){    var action = getHttpAction('/getData', getInitTodoItemAction)    // 发送函数类型的action时，该action的函数体会自动执行    store.dispatch(action)}
```

**（2）使用 redux-saga 中间件**

**redux-saga** 优点:

*   异步解耦: 异步操作被被转移到单独 saga.js 中，不再是掺杂在 action.js 或 component.js 中
    
*   action 摆脱 thunk function: dispatch 的参数依然是⼀个纯粹的 action (FSA)，⽽不是充满 “⿊魔法” thunk function
    
*   异常处理: 受益于 generator function 的 saga 实现，代码异常 / 请求失败 都可以直接通过 try/catch 语法直接捕获处理
    
*   功能强⼤: redux-saga 提供了⼤量的 Saga 辅助函数和 Effect 创建器供开发者使⽤, 开发者⽆须封装或者简单封装即可使⽤
    
*   灵活: redux-saga 可以将多个 Saga 可以串⾏ / 并⾏组合起来, 形成⼀个⾮常实⽤的异步 flow
    
*   易测试，提供了各种 case 的测试⽅案，包括 mock task，分⽀覆盖等等
    

**redux-saga** 缺陷:

*   额外的学习成本: redux-saga 不仅在使⽤难以理解的 generator function, ⽽且有数⼗个 API, 学习成本远超 redux-thunk, 最重要的是你的额外学习成本是只服务于这个库的, 与 redux-observable 不同, redux-observable 虽然也有额外学习成本但是背后是 rxjs 和⼀整套思想
    
*   体积庞⼤: 体积略⼤, 代码近 2000 ⾏，min 版 25KB 左右
    
*   功能过剩: 实际上并发控制等功能很难⽤到, 但是我们依然需要引⼊这些代码
    
*   ts ⽀持不友好: yield ⽆法返回 TS 类型
    

redux-saga 可以捕获 action，然后执行一个函数，那么可以把异步代码放在这个函数中，使用步骤如下：

*   配置中间件
    

```
import {createStore, applyMiddleware, compose} from 'redux';import reducer from './reducer';import createSagaMiddleware from 'redux-saga'import TodoListSaga from './sagas'const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;const sagaMiddleware = createSagaMiddleware()const enhancer = composeEnhancers(  applyMiddleware(sagaMiddleware));const store = createStore(reducer, enhancer);sagaMiddleware.run(TodoListSaga)export default store;
```

*   将异步请求放在 sagas.js 中
    

```
import {takeEvery, put} from 'redux-saga/effects'import {initTodoList} from './actionCreator'import {GET_INIT_ITEM} from './actionTypes'import axios from 'axios'function* func(){    try{        // 可以获取异步返回数据        const res = yield axios.get('/getData')        const action = initTodoList(res.data)        // 将action发送到reducer        yield put(action)    }catch(e){        console.log('网络请求失败')    }}function* mySaga(){    // 自动捕获GET_INIT_ITEM类型的action，并执行func    yield takeEvery(GET_INIT_ITEM, func)}export default mySaga
```

*   发送 action
    

```
componentDidMount(){  const action = getInitTodoItemAction()  store.dispatch(action)}
```

### 哪些方法会触发 React 重新渲染？重新渲染 render 会做些什么？

**（1）哪些方法会触发 react 重新渲染?**

*   **setState（）方法被调用**
    

setState 是 React 中最常用的命令，通常情况下，执行 setState 会触发 render。但是这里有个点值得关注，执行 setState 的时候不一定会重新渲染。当 setState 传入 null 时，并不会触发 render。

```
class App extends React.Component {  state = {    a: 1  };  render() {    console.log("render");    return (      <React.Fragement>        <p>{this.state.a}</p>        <button          onClick={() => {            this.setState({ a: 1 }); // 这里并没有改变 a 的值          }}        >          Click me        </button>        <button onClick={() => this.setState(null)}>setState null</button>        <Child />      </React.Fragement>    );  }}
```

*   **父组件重新渲染**
    

只要父组件重新渲染了，即使传入子组件的 props 未发生变化，那么子组件也会重新渲染，进而触发 render

**（2）重新渲染 render 会做些什么?**

*   会对新旧 VNode 进行对比，也就是我们所说的 Diff 算法。
    
*   对新旧两棵树进行一个深度优先遍历，这样每一个节点都会一个标记，在到深度遍历的时候，每遍历到一和个节点，就把该节点和新的节点树进行对比，如果有差异就放到一个对象里面
    
*   遍历差异对象，根据差异的类型，根据对应对规则更新 VNode
    

React 的处理 render 的基本思维模式是每次一有变动就会去重新渲染整个应用。在 Virtual DOM 没有出现之前，最简单的方法就是直接调用 innerHTML。Virtual DOM 厉害的地方并不是说它比直接操作 DOM 快，而是说不管数据怎么变，都会尽量以最小的代价去更新 DOM。React 将 render 函数返回的虚拟 DOM 树与老的进行比较，从而确定 DOM 要不要更新、怎么更新。当 DOM 树很大时，遍历两棵树进行各种比对还是相当耗性能的，特别是在顶层 setState 一个微小的修改，默认会去遍历整棵树。尽管 React 使用高度优化的 Diff 算法，但是这个过程仍然会损耗性能.

### state 和 props 区别是啥？

*   state 是组件自己管理数据，控制自己的状态，可变；
    
*   props 是外部传入的数据参数，不可变；
    
*   没有 state 的叫做无状态组件，有 state 的叫做有状态组件；
    
*   多用 props，少用 state，也就是多写无状态组件。
    

### 应该在 React 组件的何处发起 Ajax 请求

在 React 组件中，应该在 `componentDidMount` 中发起网络请求。这个方法会在组件第一次 “挂载”(被添加到 DOM) 时执行，在组件的生命周期中仅会执行一次。更重要的是，你不能保证在组件挂载之前 Ajax 请求已经完成，如果是这样，也就意味着你将尝试在一个未挂载的组件上调用 setState，这将不起作用。在 `componentDidMount` 中发起网络请求将保证这有一个组件可以更新了。