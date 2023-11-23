> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jlw3Kjf51enJ1Md5j5v31Q)

![](https://mmbiz.qpic.cn/mmbiz_png/hM5HtkzgLYb1ugZ4XVK48AickmfNSjsK6CWIvHV1Y8AbbNPUXC9RTegFwibk2iaptD4ziaYe4DEicGvF81RRKdkKYBw/640?wx_fmt=png)

关注「前端向后」微信公众号，你将收获一系列「用心原创」的高质量技术文章，主题包括但不限于前端、Node.js 以及服务端技术

一. HMR
------

> HMR（Hot Module Replacement）能够对运行时的 JavaScript 模块进行热更新（无需重刷，即可替换、新增、删除模块）

（摘自 [webpack HMR](http://mp.weixin.qq.com/s?__biz=MzIwMTM5MTM1NA==&mid=2649473574&idx=1&sn=db1d53a00f3df17191ab2939169a55ab&chksm=8ef1cfb3b98646a5c4c910d7f937f4be58522ebd3e43e7724b8eb074c78b106201c82d42497a&scene=21#wechat_redirect)）

HMR 特性由 webpack 等构建工具提供，并暴露出一系列[运行时 API](http://mp.weixin.qq.com/s?__biz=MzIwMTM5MTM1NA==&mid=2649473574&idx=1&sn=db1d53a00f3df17191ab2939169a55ab&chksm=8ef1cfb3b98646a5c4c910d7f937f4be58522ebd3e43e7724b8eb074c78b106201c82d42497a&scene=21#wechat_redirect) 供应用层框架（如 React、Vue 等）对接：

> Basically it’s just a way for modules to say “When a new version of some module I import is available, run a callback in my app so I can do something with it”.

其基本原理是在运行时对（构建工具启动的）Dev Server 发起轮询，通过`script`标签将有更新的模块注入到运行环境，并执行相关的回调函数：

> HMR is just a fancy way to poll the development server, inject <script> tags with the updated modules, and run a callback in your existing code.

例如：

```
import printMe from './print.js';

if (module.hot) {
  module.hot.accept('./print.js', function() {
    console.log('Accepting the updated printMe module!');
    printMe();
  })
}
```

开启 HMR 后，当`./print.js`模块有更新时，会触发回调函数，表明模块已经替换完成，此后访问该模块取到的都是新模块实例

基于运行时的模块替换能力（HMR），可以结合应用层框架（React、Vue、甚至 Express）进一步实现 Live Reloading、Hot Reloading 等更加高效的开发模式

二. Live Reloading
-----------------

所谓 Live Reloading，就是在模块文件发生变化时，重新加载整个应用程序：

> Live reloading reloads or refreshes the entire app when a file changes. For example, if you were four links deep into your navigation and saved a change, live reloading would restart the app and load the app back to the initial route.

以 React 为例：

```
const App = require('./App')
const React = require('react')
const ReactDOM = require('react-dom')

// Render the root component normally
const rootEl = document.getElementById('root')
ReactDOM.render(<App />, rootEl)

// Are we in development mode?
if (module.hot) {
  // Whenever a new version of App.js is available
  module.hot.accept('./App', function () {
    // Require the new version and render it instead
    const NextApp = require('./App')
    ReactDOM.render(<NextApp />, rootEl)
  })
}
```

_利用 HMR 换掉根组件，并重新渲染即可_。因为 HMR 模块更新有[冒泡机制](http://mp.weixin.qq.com/s?__biz=MzIwMTM5MTM1NA==&mid=2649473574&idx=1&sn=db1d53a00f3df17191ab2939169a55ab&chksm=8ef1cfb3b98646a5c4c910d7f937f4be58522ebd3e43e7724b8eb074c78b106201c82d42497a&scene=21#wechat_redirect)，未经`accept`处理的更新事件会沿依赖链反向传递，所以在组件树顶层能够监听到树中所有组件的变化，此时重新创建整棵组件树，过程中取到的都是已经更新完成的组件，渲染出来即可得到新的视图

这种方案对应用层框架的依赖很少（仅 re-render 部分），实现简单而且稳定可靠，但_此前的运行状态都将丢失，对 SPA 等运行时状态多且复杂的场景极不友好_，刷完后要重新操作一遍才能回到先前的视图状态，开发效率上的提升非常有限

那么，有没有办法保留运行时的状态数据，只刷新有变化的视图呢？

有，Hot Reloading

三. Hot Reloading
----------------

下层同样基于 HMR，但 Hot Reloading 能够保留应用程序的运行状态，只对有变化的部分进行局部刷新：

> Hot reloading only refreshes the files that were changed without losing the state of the app. For example, if you were four links deep into your navigation and saved a change to some styling, the state would not change, but the new styles would appear on the page without having to navigate back to the page you are on because you would still be on the same page.

针对视图的局部刷新免去了整个刷新之后再次回到先前状态所需的繁琐操作，从而真正提升开发效率

然而，_局部刷新要求对组件（甚至组件的一部分）进行热替换，这在实现上存在不小的挑战_（包括如何保障正确性、缩小影响范围、及时反馈错误等，具体见 My Wishlist for Hot Reloading）

### 如何动态替换组件？

因为 HMR 替换后的新模块，在运行时看来是完全不同的两个组件，相当于：

```
function getMyComponent() {
  // 通过script标签，重新加载相同的组件代码
  class MyComponent {}
  return MyComponent;
}

getMyComponent() === getMyComponent() // false
```

显然无法通过 [React 自身的 Diff 机制](http://mp.weixin.qq.com/s?__biz=MzIwMTM5MTM1NA==&mid=2649472808&idx=1&sn=32d68e08421e2ede425be225588ec794&chksm=8ef1b2bdb9863bab4a1bb98f849774a75e5b7c2ec37dfeacdc31c177d3c5dca804e9fe475c3d&scene=21#wechat_redirect)来完成无伤替换，那么，只能从 JavaScript 语言寻找可能性了

一个经典的 React 组件通过 [ES6 Class](http://mp.weixin.qq.com/s?__biz=MzIwMTM5MTM1NA==&mid=2649472721&idx=1&sn=92ae499e54792e8a719641421e9c19a1&chksm=8ef1b344b9863a5219635f641b290da1495f5d9e6d8d93a884682210ddbaa41fb345a7df1843&scene=21#wechat_redirect) 来定义：

```
class Foo extends Component {
  state = {
    clicked: false
  }
  handleClick = () => {
    console.log('Click happened');
    this.setState({ clicked: true });
  }
  render() {
    return <button onClick={this.handleClick}>{!this.state.clicked ? 'Click Me' : 'Clicked'}</button>;
  }
}
```

在运行时根据组件类创建出一系列的组件实例，它们拥有`render`生命周期等原型方法，也有`handleClick`之类的实例方法，以及`state`等实例属性

原型方法、原型属性不难替换，但要换掉实例方法和实例属性就不那么容易了，因为它们被紧紧地包裹在了组件树中

为此，_有人想到了一种很聪明的办法_

四. React Hot Loader
-------------------

在 React 生态里，目前（2020/5/31）应用最广泛的 Hot Reloading 方案仍然是 RHL（React Hot Loader）：

> Tweak React components in real time.

为了实现组件方法的动态替换，RHL _在 React 组件之上加了一层代理_：

> Proxies React components without unmounting or losing their state.

P.S. 具体见 react-proxy

### 关键原理

![](https://mmbiz.qpic.cn/mmbiz_png/hM5HtkzgLYb1ugZ4XVK48AickmfNSjsK68ucuuAKAXJg0EbNFf0HqNJeF1Z5xiaH0erePZlSA8xjXpKcaz6wPwvA/640?wx_fmt=png)

_通过一层代理将组件状态剥离出来，放到代理组件中维护_（其余生命周期方法等全都代理到源组件上），因此换掉源组件后仍能保留组件状态：

> The proxies hold the component’s state and delegate the lifecycle methods to the actual components, which are the ones we hot reload.

源组件被代理组件包起来了，挂在组件树上的都是代理组件，热更新前后组件类型没有变化（背后的源组件已经被偷摸换成了新的组件实例），因而不会触发额外的生命周期（如`componentDidMount`）：

> Proxy component types so that the types that React sees stay the same, but the actual implementations change to refer to the new underlying component type on every hot update.

具体实现细节，见：

*   代理组件：react-hot-loader/src/proxy/createClassProxy.js
    
*   组件更新策略：Not all methods could|should be updated
    
*   在线 Demo：http://gaearon.github.io/react-hot-loader/
    

### Redux Store

特殊地，对于 Redux 应用而言，有必要让 Reducer 的变化也能热生效（因为大多数状态都交由 Redux 来管理了）：

```
// configureStore.js
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';

export default function configureStore(initialState) {
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(thunk),
  );

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('../reducers/index').default;
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
};
```

借助 replaceReducer 换掉 Reducer，同时保留`store`状态

P.S. 关于 Redux 应用 Hot Reloading 的更多信息，见 RFC: remove React Transform from examples

### 参考资料

*   Hot Reloading in React
    
*   Introducing Hot Reloading
    
*   React Hot Loader
    
*   What is the difference between Hot Reloading and Live Reloading in React Native?
    

联系我      

如果心中仍有疑问，请查看原文并留下评论噢。（特别要紧的问题，可以直接微信联系 ayqywx ）