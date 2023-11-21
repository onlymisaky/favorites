> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RgZWA8ZXmxiC6hB5TYfzmg)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCVnWlxQfDaXWccOibiapYngicwibjb6BvGUEEVPLESrxEtn46kU6MLkuKYcjnNJ0uaUDbcYv1W8pVgOSw/640?wx_fmt=jpeg)

### 1、setState 是异步还是同步？

1.  合成事件中是异步
    
2.  钩子函数中的是异步
    
3.  原生事件中是同步
    
4.  setTimeout 中是同步
    

相关链接：你真的理解 setState 吗？：

### 2、聊聊 react@16.4 + 的生命周期

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQSgTeqj7sv9g0TZeib9xSEQlYzuuWBrKkFCLEo5QZQWlTsP8fo5licU0Do5ueBGegkM5R1PFoNhrGAQ/640?wx_fmt=jpeg)

相关连接：React 生命周期 我对 React v16.4 生命周期的理解

### 3、useEffect(fn, []) 和 componentDidMount 有什么差异？

`useEffect` 会捕获 `props` 和 `state`。所以即便在回调函数里，你拿到的还是初始的 `props` 和 `state`。如果想得到 “最新” 的值，可以使用`ref`。

### 4、hooks 为什么不能放在条件判断里？

以 `setState` 为例，在 react 内部，每个组件 (Fiber) 的 hooks 都是以链表的形式存在 `memoizeState` 属性中：

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQSgTeqj7sv9g0TZeib9xSEQlPJibobnPo0zu7uicWZsqbWuLibXQsYRhluMGktaGmuicJQBm0WUR5dfzjg/640?wx_fmt=jpeg)

update 阶段，每次调用 `setState`，链表就会执行 next 向后移动一步。如果将 `setState` 写在条件判断中，假设条件判断不成立，没有执行里面的 `setState` 方法，会导致接下来所有的 `setState` 的取值出现偏移，从而导致异常发生。

参考链接：烤透 React Hook

### 5、fiber 是什么？

**React Fiber 是一种基于浏览器的单线程调度算法。**

React Fiber 用类似 `requestIdleCallback` 的机制来做异步 diff。但是之前数据结构不支持这样的实现异步 diff，于是 React 实现了一个类似链表的数据结构，将原来的 递归 diff 变成了现在的 遍历 diff，这样就能做到异步可更新了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQSgTeqj7sv9g0TZeib9xSEQlzBibrTTU0uTBR3T2MmwIP1EMQjiaaeplwBMETZLX7aLGiakgzOHVILTnA/640?wx_fmt=jpeg)

相关链接：React Fiber 是什么？

### 6、聊一聊 diff 算法

传统 diff 算法的时间复杂度是 O(n^3)，这在前端 render 中是不可接受的。为了降低时间复杂度，react 的 diff 算法做了一些妥协，放弃了最优解，最终将时间复杂度降低到了 O(n)。

那么 react diff 算法做了哪些妥协呢？，参考如下：

1、tree diff：只对比同一层的 dom 节点，忽略 dom 节点的跨层级移动

如下图，react 只会对相同颜色方框内的 DOM 节点进行比较，即同一个父节点下的所有子节点。当发现节点不存在时，则该节点及其子节点会被完全删除掉，不会用于进一步的比较。

这样只需要对树进行一次遍历，便能完成整个 DOM 树的比较。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQRibOCr5MGPG0FZQicdYMH8jWSW52oFyO5aP94iaRdmwicGsicUPd7wKt9SpQhRYy8pwefq0siavOtVOP3w/640?wx_fmt=jpeg)

这就意味着，如果 dom 节点发生了跨层级移动，react 会删除旧的节点，生成新的节点，而不会复用。

2、component diff：如果不是同一类型的组件，会删除旧的组件，创建新的组件

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQRibOCr5MGPG0FZQicdYMH8jWiaHYOnm7ibBdk5TG7EZtWfUnR2ms4Iub5CnRz7Oedic2QWj5awVibTXZXw/640?wx_fmt=jpeg)

3、element diff：对于同一层级的一组子节点，需要通过唯一 id 进行来区分

如果没有 id 来进行区分，一旦有插入动作，会导致插入位置之后的列表全部重新渲染。

这也是为什么渲染列表时为什么要使用唯一的 key。

### 7、调用 setState 之后发生了什么？

1.  在 `setState` 的时候，React 会为当前节点创建一个 `updateQueue` 的更新列队。
    
2.  然后会触发 `reconciliation` 过程，在这个过程中，会使用名为 Fiber 的调度算法，开始生成新的 Fiber 树， Fiber 算法的最大特点是可以做到异步可中断的执行。
    
3.  然后 `React Scheduler` 会根据优先级高低，先执行优先级高的节点，具体是执行 `doWork` 方法。
    
4.  在 `doWork` 方法中，React 会执行一遍 `updateQueue` 中的方法，以获得新的节点。然后对比新旧节点，为老节点打上 更新、插入、替换 等 Tag。
    
5.  当前节点 `doWork` 完成后，会执行 `performUnitOfWork` 方法获得新节点，然后再重复上面的过程。
    
6.  当所有节点都 `doWork` 完成后，会触发 `commitRoot` 方法，React 进入 commit 阶段。
    
7.  在 commit 阶段中，React 会根据前面为各个节点打的 Tag，一次性更新整个 dom 元素。
    

### 8、为什么虚拟 dom 会提高性能?

虚拟 dom 相当于在 JS 和真实 dom 中间加了一个缓存，利用 diff 算法避免了没有必要的 dom 操作，从而提高性能。

### 9、错误边界是什么？它有什么用？

在 React 中，如果任何一个组件发生错误，它将破坏整个组件树，导致整页白屏。这时候我们可以用错误边界优雅地降级处理这些错误。

例如下面封装的组件：

```
class ErrorBoundary extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 可以将错误日志上报给服务器
    console.log('组件奔溃 Error', error);
    console.log('组件奔溃 Info', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return this.props.content;
    }
    return this.props.children;
  }
}
```

### 10、什么是 Portals？

Portal 提供了一种将子节点渲染到存在于父组件以外的 DOM 节点的优秀的方案。

```
ReactDOM.createPortal(child, container)
```

### 11、React 组件间有那些通信方式?

### 父组件向子组件通信

1、 通过 props 传递

### 子组件向父组件通信

1、 主动调用通过 props 传过来的方法，并将想要传递的信息，作为参数，传递到父组件的作用域中

### 跨层级通信

1、 使用 react 自带的 `Context` 进行通信，`createContext` 创建上下文， `useContext` 使用上下文。

参考下面代码：

```
import React, { createContext, useContext } from 'react';

const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}

export default App;
```

2、使用 Redux 或者 Mobx 等状态管理库

3、使用订阅发布模式

相关链接：React Docs

### 12、React 父组件如何调用子组件中的方法？

1、如果是在方法组件中调用子组件（`>= react@16.8`），可以使用 `useRef` 和 `useImperativeHandle`:

```
const { forwardRef, useRef, useImperativeHandle } = React;

const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    getAlert() {
      alert("getAlert from Child");
    }
  }));
  return <h1>Hi</h1>;
});

const Parent = () => {
  const childRef = useRef();
  return (
    <div>
      <Child ref={childRef} />
      <button onClick={() => childRef.current.getAlert()}>Click</button>
    </div>
  );
};
```

2、如果是在类组件中调用子组件（`>= react@16.4`），可以使用 `createRef`:

```
const { Component } = React;

class Parent extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
  }

  onClick = () => {
    this.child.current.getAlert();
  };

  render() {
    return (
      <div>
        <Child ref={this.child} />
        <button onClick={this.onClick}>Click</button>
      </div>
    );
  }
}

class Child extends Component {
  getAlert() {
    alert('getAlert from Child');
  }

  render() {
    return <h1>Hello</h1>;
  }
}
```

参考阅读：Call child method from parent

### 13、React 有哪些优化性能的手段?

### 类组件中的优化手段

1、使用纯组件 `PureComponent` 作为基类。

2、使用 `React.memo` 高阶函数包装组件。

3、使用 `shouldComponentUpdate` 生命周期函数来自定义渲染逻辑。

### 方法组件中的优化手段

1、使用 `useMemo`。

2、使用 `useCallBack`。

### 其他方式

1、在列表需要频繁变动时，使用唯一 id 作为 key，而不是数组下标。

2、必要时通过改变 CSS 样式隐藏显示组件，而不是通过条件判断显示隐藏组件。

3、使用 `Suspense` 和 `lazy` 进行懒加载，例如：

```
import React, { lazy, Suspense } from "react";

export default class CallingLazyComponents extends React.Component {
  render() {
    var ComponentToLazyLoad = null;

    if (this.props.name == "Mayank") {
      ComponentToLazyLoad = lazy(() => import("./mayankComponent"));
    } else if (this.props.name == "Anshul") {
      ComponentToLazyLoad = lazy(() => import("./anshulComponent"));
    }

    return (
      <div>
        <h1>This is the Base User: {this.state.name}</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <ComponentToLazyLoad />
        </Suspense>
      </div>
    )
  }
}
```

`Suspense` 用法可以参考官方文档

相关阅读：21 个 React 性能优化技巧

### 14、为什么 React 元素有一个 $$typeof 属性？

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQSgTeqj7sv9g0TZeib9xSEQlQatJTdbrBehvsj1jmwHzAmdLicXQ63aBkaL6mAZtel084xS718P5xhw/640?wx_fmt=jpeg)

目的是为了防止 XSS 攻击。因为 Synbol 无法被序列化，所以 React 可以通过有没有 $$typeof 属性来断出当前的 element 对象是从数据库来的还是自己生成的。

如果没有 $$typeof 这个属性，react 会拒绝处理该元素。

在 React 的古老版本中，下面的写法会出现 XSS 攻击：

```
// 服务端允许用户存储 JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: '/* 把你想的搁着 */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };

// React 0.13 中有风险
<p>
  {message.text}
</p>
```

相关阅读：Dan Abramov Blog

### 15、React 如何区分 Class 组件 和 Function 组件？

一般的方式是借助 typeof 和 Function.prototype.toString 来判断当前是不是 class，如下：

```
function isClass(func) {  return typeof func === 'function'    && /^class\s/.test(Function.prototype.toString.call(func));}
```

但是这个方式有它的局限性，因为如果用了 babel 等转换工具，将 class 写法全部转为 function 写法，上面的判断就会失效。

React 区分 Class 组件 和 Function 组件的方式很巧妙，由于所有的类组件都要继承 React.Component，所以只要判断原型链上是否有 React.Component 就可以了：

```
AComponent.prototype instanceof React.Component
```

相关阅读：Dan Abramov Blog

### 16、HTML 和 React 事件处理有什么区别?

在 HTML 中事件名必须小写：

```
<button onclick='activateLasers()'>
```

而在 React 中需要遵循驼峰写法：

```
<button onClick={activateLasers}>
```

在 HTML 中可以返回 false 以阻止默认的行为：

```
<a href='#' onclick='console.log("The link was clicked."); return false;' />
```

而在 React 中必须地明确地调用 `preventDefault()`：

```
function handleClick(event) {  event.preventDefault()  console.log('The link was clicked.')}
```

### 17、什么是 suspense 组件?

Suspense 让组件 “等待” 某个异步操作，直到该异步操作结束即可渲染。在下面例子中，两个组件都会等待异步 API 的返回值：

```
const resource = fetchProfileData();

function ProfilePage() {
  return (
    <Suspense fallback={<h1>Loading profile...</h1>}>
      <ProfileDetails />
      <Suspense fallback={<h1>Loading posts...</h1>}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}

function ProfileDetails() {
  // 尝试读取用户信息，尽管该数据可能尚未加载
  const user = resource.user.read();
  return <h1>{user.name}</h1>;
}

function ProfileTimeline() {
  // 尝试读取博文信息，尽管该部分数据可能尚未加载
  const posts = resource.posts.read();
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.text}</li>
      ))}
    </ul>
  );
}
```

Suspense 也可以用于懒加载，参考下面的代码：

```
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

### 18、为什么 JSX 中的组件名要以大写字母开头？

因为 React 要知道当前渲染的是组件还是 HTML 元素。

### 19、redux 是什么？

Redux 是一个为 JavaScript 应用设计的，可预测的状态容器。

它解决了如下问题：

*   跨层级组件之间的数据传递变得很容易
    
*   所有对状态的改变都需要 dispatch，使得整个数据的改变可追踪，方便排查问题。
    

但是它也有缺点：

*   概念偏多，理解起来不容易
    
*   样板代码太多
    

### 20、react-redux 的实现原理？

通过 redux 和 react context 配合使用，并借助高阶函数，实现了 `react-redux`。

参考链接：React.js 小书

### 21、reudx 和 mobx 的区别？

得益于 Mobx 的 observable，使用 mobx 可以做到精准更新；对应的 Redux 是用 dispath 进行广播，通过 Provider 和 connect 来比对前后差别控制更新粒度；

相关阅读：Redux or MobX: An attempt to dissolve the Confusion

### 22、redux 异步中间件有什么什么作用?

假如有这样一个需求：**请求数据前要向 Store dispatch 一个 loading 状态，并带上一些信息；请求结束后再向 Store dispatch 一个 loaded 状态**

一些同学可能会这样做：

```
function App() {
  const onClick = () => {
    dispatch({ type: 'LOADING', message: 'data is loading' })
    fetch('dataurl').then(() => {
      dispatch({ type: 'LOADED' })
    });
  }

  return (<div>
    <button onClick={onClick}>click</button>
  </div>);
}
```

但是如果有非常多的地方用到这块逻辑，那应该怎么办？

聪明的同学会想到可以将 onClick 里的逻辑抽象出来复用，如下：

```
function fetchData(message: string) {
  return (dispatch) => {
    dispatch({ type: 'LOADING', message })
    setTimeout(() => {
      dispatch({ type: 'LOADED' })
    }, 1000)
  }
}

function App() {
  const onClick = () => {
    fetchData('data is loading')(dispatch)
  }

  return (<div>
    <button onClick={onClick}>click</button>
  </div>);
}
```

很好，但是 `fetchData('data is loading')(dispatch)` 这种写法有点奇怪，会增加开发者的心智负担。

于是可以借助 rudux 相关的异步中间件，以 `rudux-chunk` 为例，将写法改为如下：

```
function fetchData(message: string) {  return (dispatch) => {    dispatch({ type: 'LOADING', message })    setTimeout(() => {      dispatch({ type: 'LOADED' })    }, 1000)  }}function App() {  const onClick = () => {-   fetchData('data is loading')(dispatch)+   dispatch(fetchData('data is loading'))  }  return (<div>    <button onClick={onClick}>click</button>  </div>);}
```

这样就更符合认知一些了，redux 异步中间件没有什么奥秘，主要做的就是这样的事情。

相关阅读：Why do we need middleware for async flow in Redux?

### 23、redux 有哪些异步中间件？

1、redux-thunk

源代码简短优雅，上手简单

2、redux-saga

借助 JS 的 generator 来处理异步，避免了回调的问题

3、redux-observable

借助了 RxJS 流的思想以及其各种强大的操作符，来处理异步问题

> 作者：王玉略
> 
> https://zhuanlan.zhihu.com/p/304213203

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步