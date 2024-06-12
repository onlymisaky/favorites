> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eQpO3EqTs5McIHs7jkf2Pw)

高阶组件的基本概念（是什么?）
---------------

*   高阶组件（HOC，Higher-Order Components）不是组件，而是一个**函数**，它会接收一个组件作为参数并返回一个经过改造的新组件：
    

```
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

*   需要区分的是，组件是将 `props` 转换为 UI，而高阶组件是将组件转换为另一个组件。
    
*   高阶组件是 React 中用于复用组件逻辑的一种高级技巧。
    

使用高阶组件的原因（为什么?）
---------------

*   在业务开发中，虽然不掌握高阶组件也可以完成项目的开发，但是如果我们能够灵活地使用高阶组件，可以让项目代码变得更加优雅，同时增强代码的复用性和灵活性，提升开发效率。
    
*   同时，了解高阶组件对我们理解各种 `React.js` 第三方库的原理很有帮助。
    
*   关于高阶组件能解决的问题可以简单概括成以下三个方面：
    

*   抽取重复代码，实现组件复用，常见场景：页面复用。
    
*   条件渲染，控制组件的渲染逻辑（渲染劫持），常见场景：权限控制。
    
*   捕获 / 劫持被处理组件的生命周期，常见场景：组件渲染性能追踪、日志打点。
    

*   可见，高阶组件的作用十分强大，接下来，我将对高阶组件的实现方式进行介绍，从而加深大家对高阶组件作用的理解。
    

高阶组件的实现（怎么做?）
-------------

*   通常情况下，实现高阶组件的方式有以下两种:
    

*   返回一个无状态（stateless）的函数组件
    
*   返回一个 class 组件
    
*   属性代理 (Props Proxy)
    
*   反向继承 (Inheritance Inversion)
    

*   高阶组件实现方式的差异性决定了它们各自的应用场景：一个 `React` 组件包含了 `props`、`state`、`ref`、生命周期方法、`static`方法和`React` 元素树几个重要部分，所以我将从以下几个方面对比两种高阶组件实现方式的差异性：
    

*   原组件能否被包裹
    
*   原组件是否被继承
    
*   能否读取 / 操作原组件的 `props`
    
*   能否读取 / 操作原组件的 `state`
    
*   能否通过 `ref` 访问到原组件的 `dom` 元素
    
*   是否影响原组件某些生命周期等方法
    
*   是否取到原组件 `static` 方法
    
*   能否劫持原组件生命周期方法
    
*   能否渲染劫持
    

### 属性代理

*   属性代理是最常见的实现方式，它本质上是使用组合的方式，通过将组件包装在容器组件中实现功能。
    
*   属性代理方式实现的高阶组件和原组件的生命周期关系完全是 React 父子组件的生命周期关系，所以该方式实现的高阶组件会影响原组件某些生命周期等方法。
    

#### 操作 props

*   最简单的属性代理实现代码如下：
    

```
// 返回一个无状态的函数组件function HOC(WrappedComponent) {  const newProps = { type: 'HOC' };  return props => <WrappedComponent {...props} {...newProps}/>;}// 返回一个有状态的 class 组件function HOC(WrappedComponent) {  return class extends React.Component {    render() {      const newProps = { type: 'HOC' };      return <WrappedComponent {...this.props} {...newProps}/>;    }  };}
```

*   从上面代码可以看到，通过属性代理方式实现的高阶组件包装后的组件可以拦截到父组件传递过来的 `props`，提前对 `props` 进行一些操作，比如增加一个 `type` 属性。
    

#### 抽象 state

*   需要注意的是，通过属性代理方式实现的高阶组件无法直接操作原组件的 `state`，但是可以通过 `props` 和回调函数对 `state` 进行抽象。️
    
*   常见的例子是实现非受控组件到受控组件的转变：
    

```
// 高阶组件function HOC(WrappedComponent) {  return class extends React.Component {    constructor(props) {      super(props);      this.state = {        name: '',      };      this.onChange = this.onChange.bind(this);    }        onChange = (event) => {      this.setState({        name: event.target.value,      })    }        render() {      const newProps = {        name: {          value: this.state.name,          onChange: this.onChange,        },      };      return <WrappedComponent {...this.props} {...newProps} />;    }  };}// 使用@HOCclass Example extends Component {  render() {    return <input  {...this.props.name} />;  }}
```

#### 获取 refs 引用

*   为了访问 `DOM element` （`focus`事件、动画、使用第三方 DOM 操作库），有时我们会用到组件的 `ref` 属性，关于`refs` 的介绍详见官方文档。
    
*   `ref` 属性只能声明在 class 类型的组件上，而无法声明在函数类型的组件上（因为无状态组件没有实例）。
    
*   通过属性代理方式实现的高阶组件无法直接获取原组件的 `refs` 引用，但是可以通过在原组件的`ref`回调函数中调用父组件传入的 `ref` 回调函数来获取原组件的`refs` 引用。
    
*   假设有一个 `User` 组件（原组件），它的代码如下：
    

```
import * as React from 'react';import * as styles from './index.module.less';interface IProps {  name: string;  age: number;  inputRef?: any;}class User extends React.Component<IProps> {  private inputElement: any ;  static sayHello () {    console.error('hello world'); // tslint:disable-line  }  constructor (props: IProps) {    super(props);    this.focus = this.focus.bind(this);    this.onChange = this.onChange.bind(this);  }  state = {    name: '',    age: 0,  };  componentDidMount () {    this.setState({      name: this.props.name,      age: this.props.age,    });  }  onChange = (e: any) => {    this.setState({      age: e.target.value,    });  }  focus () {    this.inputElement.focus();  }  render () {    return (      <div className={styles.wrapper}>        <div className={styles.nameWrapper}>姓名：{this.state.name}</div>        <div className={styles.ageWrapper}>          年龄:            <input              className={styles.input}              value={this.state.age}              onChange={this.onChange}              type="number"              ref={input => {                if (this.props.inputRef) {                  this.props.inputRef(input); // 调用父组件传入的ref回调函数                }                this.inputElement = input;              }}            />        </div>        <div>          <button            className={styles.button}            onClick={this.focus}          >            获取输入框焦点          </button>        </div>      </div>    );  }}export default User;
```

*   通过属性代理方式实现的能获取原组件 `refs` 引用的高阶组件代码如下：
    

```
import * as React from 'react';import * as styles from './index.module.less';function HOC (WrappedComponent: any) {    let inputElement: any = null;    function handleClick () {      inputElement.focus();    }    function wrappedComponentStaic () {      WrappedComponent.sayHello();    }    return (props: any) => (      <div className={styles.hocWrapper}>        <WrappedComponent          inputRef={(el: any) => { inputElement = el; }}          {...props}        />        <input          type="button"          value="获取子组件输入框焦点"          onClick={handleClick}          className={styles.focusButton}        />        <input          type="button"          value="调用子组件static"          onClick={wrappedComponentStaic}          className={styles.callButton}        />      </div>    );}export default HOC;
```

*   使用：
    

```
import React from 'react';import HOC from '../../components/OperateRefsHOC';import User from '../../components/User';const EnhanceUser = HOC(User);class OperateRefs extends React.Component<any> {  render () {    return <EnhanceUser  age={12} />;  }}export default OperateRefs;
```

*   通过高阶组件包装以后的 `EnhanceUser` 组件可以可以访问到 `User` 组件中的 `input` 元素：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iblmlja9MdiciaLown76MCicOPmAcicOmlTRBYyGoYg5NJDQUvdpghugIQzCNzqTQutWMQW8iabQQQZDFVEn8U95qpmw/640?wx_fmt=png&from=appmsg)

#### 获取原组件的 static 方法

*   当待处理组件为 class 组件时，通过属性代理实现的高阶组件（无论是返回一个函数组件 还是返回一个 class 组件，均）可以获取到原组件的 static 方法，如上面给出的高阶组件的代码，核心代码如下：
    

```
import * as React from 'react';import * as styles from './index.module.less';function HOC (WrappedComponent: any) {    /* 省略无关代码... */    function wrappedComponentStaic () {      WrappedComponent.sayHello();    }    return (props: any) => (      <div className={styles.hocWrapper}>        <WrappedComponent          inputRef={(el: any) => { inputElement = el; }}          {...props}        />        /* 省略无关代码... */        <input          type="button"          value="调用子组件static"          onClick={wrappedComponentStaic}          className={styles.callButton}        />      </div>    );}export default HOC;
```

*   效果如下：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iblmlja9MdiciaLown76MCicOPmAcicOmlTRBkJE3licg3tyZ5xO2Lv1ec4fq3ZVyUgRFh6WWyCoqC9U2oiaXmVaZu9Jw/640?wx_fmt=png&from=appmsg)

#### 通过 props 实现条件渲染

*   通过属性代理方式实现的高阶组件无法直接实现对原组件进行渲染劫持（即对原组件内部 `render` 的控制并不是很强），但可以通过 `props` 来控制是否渲染及传入数据：
    

```
import * as React from 'react';import * as styles from './index.module.less';function HOC (WrappedComponent: any) {    /* 省略无关代码... */    function wrappedComponentStaic () {      WrappedComponent.sayHello();    }    return (props: any) => (      <div className={styles.hocWrapper}>        {          props.isShow ? (            <WrappedComponent              {...props}            />          ) : <div>暂无数据</div>        }      </div>    );}export default HOC;
```

#### 用其他元素包裹传入的组件

*   我们可以通过类似下面的方式将原组件包裹起来，从而实现布局或者是样式的目的：
    

```
function withBackgroundColor(WrappedComponent) {    return class extends React.Component {        render() {            return (                <div style={{ backgroundColor: '#ccc' }}>                    <WrappedComponent {...this.props} {...newProps} />                </div>            );        }    };}
```

### 反向继承

*   反向继承指的是使用一个函数接受一个组件作为参数传入，并返回一个继承了该传入组件的类组件，且在返回组件的 `render()` 方法中返回 `super.render()` 方法，最简单的实现如下：
    

```
const HOC = (WrappedComponent) => {  return class extends WrappedComponent {    render() {      return super.render();    }  }}
```

*   相较于属性代理方式，使用反向继承方式实现的高阶组件的特点是允许高阶组件通过 `this` 访问到原组件，所以可以直接读取和操作原组件的 `state`/`ref`/ 生命周期方法。
    
*   反向继承方式实现的高阶组件可以通过 `super.render()` 方法获取到传入组件实例的 `render` 结果，所以可对传入组件进行渲染劫持（最大特点），如：
    

*   有条件地展示元素树（`element tree`）
    
*   操作由 `render()` 输出的 `React` 元素树
    
*   在任何由 `render()` 输出的 `React` 元素中操作 `props`
    
*   用其他元素包裹传入组件的渲染结果
    

#### 劫持原组件生命周期方法

*   因为反向继承方式实现的高阶组件返回的新组件是继承于传入组件，所以当新组件定义了同样的方法时，将会会覆盖父类（传入组件）的实例方法，如下面代码所示：
    

```
function HOC(WrappedComponent){  // 继承了传入组件  return class HOC extends WrappedComponent {    // 注意：这里将重写 componentDidMount 方法    componentDidMount(){      ...    }    render(){      //使用 super 调用传入组件的 render 方法      return super.render();    }  }}
```

*   虽然生命周期重写会被覆盖，但我们可以通过其他方式来劫持生命周期：
    

```
function HOC(WrappedComponent){  const didMount = WrappedComponent.prototype.componentDidMount;    // 继承了传入组件  return class HOC extends WrappedComponent {    componentDidMount(){      // 劫持 WrappedComponent 组件的生命周期      if (didMount) {        didMount.apply(this);      }      ...    }    render(){      //使用 super 调用传入组件的 render 方法      return super.render();    }  }}
```

#### 读取 / 操作原组件的 state

*   反向继承方式实现的高阶组件中可以读取、编辑和删除传入组件实例中的 `state`，如下面代码所示：
    

```
function HOC(WrappedComponent){  const didMount = WrappedComponent.prototype.componentDidMount;  // 继承了传入组件  return class HOC extends WrappedComponent {    async componentDidMount(){      if (didMount) {        await didMount.apply(this);      }      // 将 state 中的 number 值修改成 2      this.setState({ number: 2 });    }    render(){      //使用 super 调用传入组件的 render 方法      return super.render();    }  }}
```

#### 渲染劫持

##### unsetunset 条件渲染 unsetunset

*   条件渲染指的是我们可以根据部分参数去决定是否渲染组件（与属性代理方式类似），如：
    

```
const HOC = (WrappedComponent) =>  class extends WrappedComponent {    render() {      if (this.props.isRender) {        return super.render();      } else {        return <div>暂无数据</div>;      }    }  }
```

##### unsetunset 修改 React 元素树 unsetunset

*   我们还可以通过 `React.cloneElement` 方法修改由 `render` 方法输出的 React 组件树：
    

```
// 例子来源于《深入React技术栈》function HigherOrderComponent(WrappedComponent) {  return class extends WrappedComponent {    render() {      const tree = super.render();      const newProps = {};      if (tree && tree.type === 'input') {        newProps.value = 'something here';      }      const props = {        ...tree.props,        ...newProps,      };      const newTree = React.cloneElement(tree, props, tree.props.children);      return newTree;    }  };}
```

### 属性代理和反向继承的对比

*   上面两个小节分别介绍了属性代理和反向继承两种方式实现的高阶组件：
    

*   属性代理是从 “组合” 的角度出发，这样有利于从外部去操作 `WrappedComponent`，可以操作的对象是 `props`，或者在 `WrappedComponent` 外面加一些拦截器，控制器等。
    
*   反向继承则是从 “继承” 的角度出发，是从内部去操作 `WrappedComponent`，也就是可以操作组件内部的 `state` ，生命周期，`render`函数等等。
    

*   为了方便对比，对两种方式实现的高阶组件所具有的功能列表如下：
    
    <table><thead><tr><th>功能列表</th><th>属性代理</th><th>反向继承</th></tr></thead><tbody><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td>原组件能否被包裹</td><td>√</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td>原组件是否被继承</td><td>×</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td>能否读取 / 操作原组件的 <code data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(27, 31, 35, 0.05); width: auto; margin-left: 2px; margin-right: 2px; padding: 2px 4px; border-style: none; border-width: 3px; border-color: rgb(0, 0, 0) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4); border-radius: 4px; font-family: &quot;Operator Mono&quot;, Consolas, Monaco, Menlo, monospace; word-break: break-all;">props</code></td><td>√</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td>能否读取 / 操作原组件的 <code data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(27, 31, 35, 0.05); width: auto; margin-left: 2px; margin-right: 2px; padding: 2px 4px; border-style: none; border-width: 3px; border-color: rgb(0, 0, 0) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4); border-radius: 4px; font-family: &quot;Operator Mono&quot;, Consolas, Monaco, Menlo, monospace; word-break: break-all;">state</code></td><td>乄</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td>能否通过 <code data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(27, 31, 35, 0.05); width: auto; margin-left: 2px; margin-right: 2px; padding: 2px 4px; border-style: none; border-width: 3px; border-color: rgb(0, 0, 0) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4); border-radius: 4px; font-family: &quot;Operator Mono&quot;, Consolas, Monaco, Menlo, monospace; word-break: break-all;">ref</code> 访问到原组件的 <code data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(27, 31, 35, 0.05); width: auto; margin-left: 2px; margin-right: 2px; padding: 2px 4px; border-style: none; border-width: 3px; border-color: rgb(0, 0, 0) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4); border-radius: 4px; font-family: &quot;Operator Mono&quot;, Consolas, Monaco, Menlo, monospace; word-break: break-all;">dom</code> 元素</td><td>乄</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td>是否影响原组件某些生命周期等方法</td><td>√</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td>是否取到原组件 <code data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(27, 31, 35, 0.05); width: auto; margin-left: 2px; margin-right: 2px; padding: 2px 4px; border-style: none; border-width: 3px; border-color: rgb(0, 0, 0) rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.4); border-radius: 4px; font-family: &quot;Operator Mono&quot;, Consolas, Monaco, Menlo, monospace; word-break: break-all;">static</code> 方法</td><td>√</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td>能否劫持原组件生命周期方法</td><td>×</td><td>√</td></tr><tr data-style="color: rgb(0, 0, 0); background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td>能否渲染劫持</td><td>乄</td><td>√</td></tr></tbody></table>
    
*   可以看到，通过反向继承方法实现的高阶组件相较于属性代理实现的高阶组件，功能更强大，个性化程度更高，因此能适应更多的场景。
    

具体实践
----

*   本节将介绍高阶组件在业务场景中的一些实践 。
    

### 页面复用

*   前面提到，属性代理是最常见的高阶组件实现方式，它本质上是使用组合的方式，通过将组件包装在容器组件中实现组件逻辑复用的功能。 因此，如果想实现页面复用，可以使用属性代理方式实现的高阶组件。
    
*   假设我们项目中有 `pageA` 和 `pageB` 两个 UI 交互完全相同的电影列表页，但由于属于不同的电影类别，数据来源及部分文案有所不同，普通写法可能是这样：
    

```
// views/PageA.jsimport React from 'react';import fetchMovieListByType from '../lib/utils';import MovieList from '../components/MovieList';class PageA extends React.Component {  state = {    movieList: [],  }  /* ... */  async componentDidMount() {    const movieList = await fetchMovieListByType('comedy');    this.setState({      movieList,    });  }  render() {    return <MovieList data={this.state.movieList} emptyTips="暂无喜剧"/>  }}export default PageA;// views/PageB.jsimport React from 'react';import fetchMovieListByType from '../lib/utils';import MovieList from '../components/MovieList';class PageB extends React.Component {  state = {    movieList: [],  }  // ...  async componentDidMount() {    const movieList = await fetchMovieListByType('action');    this.setState({      movieList,    });  }  render() {    return <MovieList data={this.state.movieList} emptyTips="暂无动作片"/>  }}export default PageB;
```

*   通过观察发现，两个页面的代码有很多相同的代码，可能一开始觉得可以得过且过。但随着业务的进展，需要上线的越来越多类型的电影，每写一个新的页面就会新增一些重复的代码，这样明显是不合理的，所以我们需要对页面中的重复逻辑进行提取：
    

```
// HOCimport React from 'react';const withFetchingHOC = (WrappedComponent, fetchingMethod, defaultProps) => {  return class extends React.Component {    async componentDidMount() {      const data = await fetchingMethod();      this.setState({        data,      });    }        render() {      return (        <WrappedComponent           data={this.state.data}           {...defaultProps}           {...this.props}         />      );    }  }}// 使用：// views/PageA.jsimport React from 'react';import withFetchingHOC from '../hoc/withFetchingHOC';import fetchMovieListByType from '../lib/utils';import MovieList from '../components/MovieList';const defaultProps = {emptyTips: '暂无喜剧'}export default withFetchingHOC(MovieList, fetchMovieListByType('comedy'), defaultProps);// views/PageB.jsimport React from 'react';import withFetchingHOC from '../hoc/withFetchingHOC';import fetchMovieListByType from '../lib/utils';import MovieList from '../components/MovieList';const defaultProps = {emptyTips: '暂无动作片'}export default withFetchingHOC(MovieList, fetchMovieListByType('action'), defaultProps);;// views/PageOthers.jsimport React from 'react';import withFetchingHOC from '../hoc/withFetchingHOC';import fetchMovieListByType from '../lib/utils';import MovieList from '../components/MovieList';const defaultProps = {...}export default withFetchingHOC(MovieList, fetchMovieListByType('some-other-type'), defaultProps);
```

*   可以发现，上面设计的高阶组件 `withFetchingHOC`，把变的部分（组件和获取数据的方法） 抽离到外部作为传入，从而实现页面的复用。
    

### 权限控制

*   假设现在有这样一个场景：最近有一个新功能要上线，包含了一系列新开发的页面。现在需要对其中几个页面增加白名单功能，如果不在白名单中的用户访问这些页面只进行文案提示，不展示相关业务数据。一周（功能验收完成）后去掉白名单，对全部用户开放。
    
*   以上场景中有几个条件：
    

*   多个页面鉴权：鉴权代码不能重复写在页面组件中；
    
*   不在白名单用户只进行文案提示：鉴权过程业务数据请求之前；
    
*   一段时间后去掉白名单：鉴权应该完全与业务解耦，增加或去除鉴权应该最小化影响原有逻辑。
    

*   思路：封装鉴权流程，利用高阶组件的条件渲染特性，鉴权失败展示相关文案，鉴权成功则渲染业务组件。由于属性代理和反向继承都可以实现条件渲染，下面我们将使用比较简单的属性代理方式实现的高阶组件来解决问题：
    

```
import React from 'react';import { whiteListAuth } from '../lib/utils'; // 鉴权方法/** * 白名单权限校验 * @param WrappedComponent * @returns {AuthWrappedComponent} * @constructor */function AuthWrapper(WrappedComponent) {  return class AuthWrappedComponent extends React.Component {    constructor(props) {      super(props);      this.state = {        permissionDenied: -1,      };    }        async componentDidMount() {      try {        await whiteListAuth(); // 请求鉴权接口        this.setState({          permissionDenied: 0,        });      } catch (err) {        this.setState({          permissionDenied: 1,        });      }    }        render() {      if (this.state.permissionDenied === -1) {        return null; // 鉴权接口请求未完成      }      if (this.state.permissionDenied) {        return <div>功能即将上线，敬请期待~</div>;      }      return <WrappedComponent {...this.props} />;    }  }}export default AuthWrapper;
```

*   对于需要加权限控制的页面，只需要将页面组件作为参数传给高阶组件 `AuthWrapper` 即可。
    
*   通过使用高阶组件，使得鉴权与业务完全解耦，也避免了鉴权失败时多余的业务数据请求，只需要增加 / 删除少量代码，即可增加 / 去除用户白名单的控制，原有业务组件的逻辑也不会受到影响。
    

### 组件渲染性能追踪

*   前面介绍的两个例子都是使用属性代理的方式实现高阶组件，本小节介绍的，则是使用反向继承方式实现的高阶组件完成组件渲染性能的追踪。
    
*   前面提到 ，反向继承方式实现的高阶组件能否劫持原组件生命周期方法，因此，利用该特性，我们可以方便的对某个组件的渲染时间进行记录：
    

```
import React from 'react';// Home 组件class Home extends React.Component {  render () {    return (<h1>Hello World.</h1>);  }}// HOCfunction withTiming (WrappedComponent: any) {  let start: number, end: number;  return class extends WrappedComponent {    constructor (props: any) {      super(props);      start = 0;      end = 0;    }    componentWillMount () {      if (super.componentWillMount) {        super.componentWillMount();      }      start = +Date.now();    }    componentDidMount () {      if (super.componentDidMount) {        super.componentDidMount();      }      end = +Date.now();      console.error(`${WrappedComponent.name} 组件渲染时间为 ${end - start} ms`);    }    render () {      return super.render();    }  };}export default withTiming(Home);
```

*   结果：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/iblmlja9MdiciaLown76MCicOPmAcicOmlTRBYurtwvbAr8ThIkbyTs02AmoJwCDxEOdIuCJwFBgbJPRAqYXGdmaNAg/640?wx_fmt=png&from=appmsg)

扩展阅读
----

### Hook 会替代高阶组件吗？

*   `Hook` 是 `React 16.8` 的新增特性，它可以让我们在不编写 `class` 的情况下使用 `state` 以及其他的 `React` 特性（关于 `Hook` 的相关介绍可阅读官方文档）。
    
*   `Hook` 的出现使得原本许多很别扭的写法变得轻松，最典型的就是它可以取代掉 `class` 生命周期中大多数的功能，把更相关的逻辑放在一起，而非零散在各个生命周期实例方法中。
    
*   虽然 `Hook` 能解决许多难题，但这显然并不意味着 `Hook` 就能取代高阶组件，因为它们其实还是有着各自的优势所在：
    

*   高阶组件可以做到很轻松地外部协议化注入功能到一个基础 `Component` 中，所以可以用来做插件，如 `react-swipeable-views`中的 `autoPlay` 高阶组件，通过注入状态化的 `props` 的方式对组件进行功能扩展，而不是直接将代码写在主库中。对于 `Hook` 来说，其中间处理过程一定会与目标组件强依赖（不是 `Hook` 的缺陷，只是 `Hook` 显然并不是设计来解决插件注入的问题的）。
    
*   `Hook` 更多可以看作是对高阶组件方案的补充，填补了高阶组件不擅长的部分。`Hook` 的写法可以让代码更加紧凑，更适合做 `Controller` 或者需要内聚的相关逻辑。
    
*   目前 `Hook` 还处于早期阶段（`React 16.8.0` 才正式发布`Hook` 稳定版本），一些第三方的库可能还暂时无法兼容 `Hook`。
    

*   `React` 官方还没有把 `class` 从 `React` 中移除的打算，`class` 组件和 `Hook` 完全可以同时存在。官方也建议避免任何 “大范围重构”，毕竟 `Hook` 是一个非常新的特性，如果你喜欢它，可以在新的非关键性的代码中使用`Hook`。
    

总结
--

*   高阶组件不是组件，它是一个将某个组件转换成另一个组件的纯函数。
    
*   高阶组件的主要作用是实现代码复用和逻辑抽象、对 `state` 和 `props` 进行抽象和操作、对组件进行细化（如添加生命周期）、实现渲染劫持等。在实际的业务场景中合理的使用高阶组件，可以提高开发效率和提升代码的可维护性。
    
*   高阶组件的实用性使其频繁地被大量 `React.js` 相关的第三方库，如 `React-Redux`的 `connect` 方法、`React-Loadable`等所使用，了解高阶组件对我们理解各种 `React.js` 第三方库的原理很有帮助。
    
*   高阶组件有两种实现方式，分别是属性代理和反向继承。它可以看作是装饰器模式在 `React` 中的实现：在不修改原组件的情况下实现组件功能的增强。
    

来源：前端小黑