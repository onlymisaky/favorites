> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Qd5aBRc72AV69nlUXONWng)

Tags: JavaScript, React

引子
==

本文会讨论 react 生态下的常用路由库，React-router 的版本迭代与源码架构，并尝试探讨路由思维的变化与未来。

什么是路由？
------

路由是一种向用户显示不同页面的能力。 这意味着用户可以通过输入 URL 或单击页面元素在 WEB 应用的不同部分之间切换。

版本
==

为了探究 react-router 设计思维，从 v3 开始有这几个版本：

*   react-router 3「静态路由」
    
*   react-router 4「动态路由」
    
*   react-router 5「意外发布」
    
*   @reach/router「简化轻量」
    
*   react-router 6「完全方案」
    

让我们逐个参与讨论。

react-router3：静态路由
------------------

静态路由的设计如下图所示：

```
React.render((  <Router>    <Route path="/" component={Wrap}>      <Route path="a" component={App} />      <Route path="b" component={Button} />    </Route>  </Router>), document.body)
```

特点：

*   路由集中在外层
    
*   页面路由配置通过`Route`组件的嵌套而来
    
*   布局和页面组件是完全纯粹的，它们是路由的一部分
    

v3 静态路由的设计对前端工程师来说，相对更易接受，因为前端工程师很多都接触过类似的路由配置设计，比如 express、rails 等框架。

虽然细节各有不同，但是思路大致相同——将 path 静态映射为渲染模块。

react-router4：动态路由
------------------

虽然 v3 以一种质朴无华的方式完成了基本的路由工作，但 react-router 的几个核心成员感觉现有的实现严重受 ReactAPI 的制约，并且实现方式也不够优雅。

于是，经过了激烈的思考与讨论，他们大胆地在 v4 中做出了比较激进的更迭。

React-router4 不再提倡静态路由的集中化架构，取之的是路由存在于布局和 UI 之间：

```
const App = () => (    <BrowserRouter>      <div>      <Route path="/a" component={A}/>      </div>    </BrowserRouter>);const A  = ({ match }) => (    <div>     <span>A</span>      <Route     path={match.url + '/b'}     component={B}      />    </div>);const B = () => <div>B</div>;
```

我们来看以上代码的逻辑

1.  一开始在 App 组件里，只有一个路由`/a`
    
2.  用户跳转访问`/a`时，渲染`A`组件，浏览器上出现字母 A，然后子路由`/b`被定义
    
3.  用户跳转访问`/a/b`时，渲染`B`组件，浏览器上出现字母 B
    

我们可以看到，在 v4 中：

*   路由不再集中在一处
    
*   布局和页面的层叠不再由层叠的`<Route>`组件控制，`<Route>`与组件为替换的关系
    
*   布局和页面组件也不在是路由的一部分
    

这被称之为「动态路由」。

### 动态路由

传统静态路是在程序渲染前就定义好。

而动态意味着路由功能在应用渲染时才动态生成，这需要把路由看成普通的 React 组件，传递 `props` 来正常使用，借助它来控制组件的展现。这样，没有了静态配置的路由规则，取而代之的是程序在运行渲染过程中动态控制的展现。

动态路由将带来很大的好处。比如代码分割，也就是 react 常说的`code splitting`，由于不需要在渲染前决定结果，动态路由可以满足代码块的按需加载，这对于大型在线应用非常有帮助。

但是，毕竟路由对一个应用的架构来说非常重要，这么大的改变显得过于激进，这会改变以前开发者比较习惯的一些模式，由于这次的更新过于激进，遭到了开发者们的一些负面反馈：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLVKDN6nTBw6NYmuKXVcdh9VFYhIEvR7aGm5ohgDCq0QsC1TE4PPmz01pFeES36NLibaMhiauIz7EA/640?wx_fmt=png)

这就要讨论到动态路由的缺点了：

*   不够直观，你无法从顶层知道程序中所有的路由，应用一层一层下来，搞不清最后显示出来什么，可读性很差
    
*   测试困难。组件中掺杂了路由逻辑，原本对针对组件的单元测试（功能层面）完全不需要知道路由的存在，而现在就要考虑了
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLVKDN6nTBw6NYmuKXVcdh13Be6ibjKQbWfNonqboDs4Y8tic4tF0mGhhTtGsdjLudFKeiagffpmWkg/640?wx_fmt=png)

由于 React-router 团队保证 v3 会持续维护，所以当时很多开发者没有选择升级。

react-router5：沿用
----------------

原本只是计划发布 React Router 4.4 版本，但由于不小心误用了`^`字符，将依赖错误地写成 `"react-router": "^4.3.1"`，导致报错。于是最后团队决定撤销 4.4 版本，直接改为发布 React Router v5。

react-router5 延续了动态路由的模式，但是提供了更加直观的写法：

```
export default function App() {  return (    <Router>      <Switch>        <Route path="/about">          <About />        </Route>        <Route path="/topics">          <Topics />        </Route>        <Route path="/">          <Home />        </Route>      </Switch>    </Router>  );}
```

以上的写法，`/about`显示`<About>`组件，`/topics`显示`<Topic>`组件，根路由显示`<Home>`组件。

同时，v5 还允许你将路由配置作为一个 config 的 json 数据，写在组件外引入。

`<Route>`将作为父组件用于匹配路由，同时还有一系列辅助组件，比如`<Switch>`可以限制子元素进行单一的路由匹配。当然，这也会带来一定的

@reach/router：简洁
----------------

Reach-Router 是**前** ReactRouter 成员 Ryan Florence 开发的一套基于 react 的路由控件。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLVKDN6nTBw6NYmuKXVcdhscMF0SydogY6JLngkZdQo8xDu0Hre7hib83NPW6ch9GnQIHUtTTPJcA/640?wx_fmt=png)

那么已经有比较成熟的 ReactRouter 了, 为什么要” 再” 做一套 Router 呢？

*   Accessibility「易用」
    
*   相对链接的跳转方式
    
*   嵌套的路由配置
    
*   合适的路径优先 (顺序不会造成影响) 等等
    

优点：小而简

*   4kb，压缩后比`react-router`小 40kb 左右，同时有更少的配置
    
*   比起 react-router 需要 3 个包 (`history`, `react-router-dom`, `react-router-redux`)，`reach-router`只需要一个
    
*   不需要在`store`配置`router`相关信息
    
*   不需要显示的使用`history`
    
*   基本一样的 api, 学习成本非常低
    
*   源码非常简洁，总共就 3 个文件，900 行
    

react-router6：终极方案
------------------

2021 年 11 月，react-router 6.0.0 正式版发布：

*   全部用 ts 重写
    
*   不以 '/' 开头，都是「相对路径」
    
*   路由按照最佳匹配选择，可以嵌套或者分散
    

v6 的设计可以说很大程度参照了 @reach/router，API 和 @reach/router v1.3 非常相似。因此，官方也宣称 v6 可以被看做 @reach/router 的 v2。

总体来说，v6 更像是一个以前版本的完善和整合，相对路径与嵌套分散的选择方式，让大家能够按个人喜好去构建路由。

源码
==

探讨完设计哲学与版本更迭，我们正式进入从 0 到 1 的源码学习。

本文对源码的探讨，就是以 v6 为基础（中间存在各种简化）。

我们先从 V6 的简易的实例开始：

```
import { render } from "react-dom";import {  BrowserRouter,  Routes,  Route,  Link,} from "react-router-dom";import App from "./App";import Expenses from "./routes/expenses";import Invoices from "./routes/invoices";const rootElement = document.getElementById("root");render(  <BrowserRouter>    <Routes>      <Route path="/" element={<App />}>        <Route path="expenses" element={<Expenses />} />        <Route path="invoices" element={<Invoices />} />      </Route>    </Routes>    <Link to="/invoices">Check Invoices</Link>  </BrowserRouter>,  rootElement);
```

React-router 的结构主要分为四个模块：

*   History：
    

*   `history`
    
*   「状态机」
    
*   负责路由的状态的管理和记录
    

*   Router：
    

*   `<Router>`
    
*   「路由管理者」
    
*   负责自上到下传递路由数据
    

*   Route：
    

*   `<Route>`
    
*   「路由端口」
    
*   路由对应组件配置
    

*   Link：
    

*   `<Link />`、`<Navigate />`
    
*   「导航」
    
*   负责导航的跳转链接
    

让我们分别对各部分的源码进行拆分与讨论。

history
-------

每个`<Router>`都会创建一个`history`对象，它记录了当前以及历史的路由位置。

react-router 使用了`history`库作为路由历史状态的管理模块：

> `history`这个库可以让你在 JavaScript 运行的任何地方都能轻松地管理回话历史，`history`对象抽象化了各个环境中的差异，并提供了最简单易用的的 API 来给你管理历史堆栈、导航，并保持会话之间的持久化状态。——React Training 文档

这部分值得关注的源码：

1.  工厂函数`createBrowserHistory`等
    
    它们代码差别很小，不同的`router`只有`parsePath`的入参不同。还有其它的差别，比如`hashHistory`增加了`hashchange`事件的监听等
    
    由于篇幅所限，这里我们只讨论`createBrowserHistory`
    
2.  `history.push`，用于基本的切换路由
    
    `go`/`replace`/`forward`/`back`也类似，不过`push`是`history`栈变化的基础
    
3.  `history.listen`
    
    添加路由监听器，每当路由切换可以收到最新的`action`和`location`，从而做出不同的判断，`BrowserRouter`中就是通过`history.listen(setState)`来监听路由的变化，从而管理所有的路由
    
4.  `history.block`
    
    添加阻塞器，会阻塞`push`等行为和浏览器的前进后退，阻止离开当前页面。且只要判断有 `blockers`，那么同时会阻止浏览器刷新、关闭等默认行为。且只要有`blocker`，会阻止上面`listener`的监听
    

### createBrowserHistory

我们先看工厂函数：

工厂函数的用途是创建一个`history`对象，后面的`listen`和`unlisten`都是挂载在这个 API 的返回对象上面的。

*   `history.listen`：这个是用在 Router 组件里面的，用来监听路由变化
    
*   `history.unlisten`：这个也是在 Router 组件里面用的，是`listen`方法的返回值，用来在清理的时候取消监听的
    

```
export function createBrowserHistory(  options: BrowserHistoryOptions = {}): BrowserHistory { // -----------------------------第一部分-------------------------------- const [index, location] = getIndexAndLocation(); function getIndexAndLocation(): [number, Location] {   const { pathname, search, hash } = window.location;   const state = window.history.state || {};   return [     state.idx,     readOnly<Location>({       pathname,       search,       hash,       state: state.usr || null,       key: state.key || 'default'     })   ]; } if (index == null) {   index = 0;   window.history.replaceState({ ...window.history.state, idx: index }, ''); } function handlePop() {   const [nextIndex, nextLocation] = getIndexAndLocation();   const delta = index - nextIndex;   go(delta) } window.addEventListener('popstate', handlePop);  // ----------------------------第二部分-------------------------------  const listeners = createEvents<Listener>(); const blockers = createEvents<Blocker>();  function createEvents<F extends Function>(): Events<F> {   let handlers: F[] = [];    return {     get length() {       return handlers.length;     },     push(fn: F) {       handlers.push(fn);       return function() {         handlers = handlers.filter(handler => handler !== fn);       };     },     call(arg) {       handlers.forEach(fn => fn && fn(arg));     }   }; }  listeners.call({ action, location }); blockers.call({ action, location, retry });    // ----------------------------第三部分------------------------------— const history: BrowserHistory = {   get action() {     return action;   },   get location() {     return location;   },   createHref,   push, // 重点   replace,   go(delta: number) {     window.history.go(delta);   },   back() {     go(-1);   },   forward() {     go(1);   },   listen(listener) { // 重点     return listeners.push(listener);   },   block(blocker) {  // 重点     const unblock = blockers.push(blocker);     if (blockers.length === 1) {       window.addEventListener('beforeunload', promptBeforeUnload);     }     return function() {       unblock();       if (!blockers.length) {         window.removeEventListener('beforeunload', promptBeforeUnload);       }     };   } };  return history}
```

我们可以将源码分为三部分：

*   第一部分「初始化和绑定」
    
    通过`getIndexAndLocation`获取初始当前路径的`index`和`location`，初始 index 为空，对应 history.state.idx 为 0。
    
    同时，`handlePop`在`window`监听`url`的变化，在`handleState`里面进行触发。
    
*   第二部分「发布订阅」
    
    我们看到这部分是个标准的发布订阅模式：
    
    `createEvents`是创建`listeners`与`blockers`的工厂函数，其返回了一个对象，通过`push`添加每个`listener`，通过`call`通知每个 `listener`，代码中叫做`handler`
    
    `listeners`通过`call`传入`action`和`location`，这样每个`listener`在路由变化时就能接收到，从而做出对应的判断
    
    `blockers`，比`listeners`多了传入了一个`retry`，从而判断是否要阻塞路由，不阻塞的话需要调用函数`retry`
    
*   第三部分「构建 history」
    
    我们可以看看得到的`history`对象
    
    这里我们重点关注：`push`、`listen`、`block`
    

*   `action`代表上一个修改当前`location`的`action`，`POP`/`PUSH`/`REPLACE`等
    
*   `action`与`location`这两个属性都通过修饰符`get`获取，那么我们每次要获取就可以通过`history.action`或`history.location`。避免了只能拿到第一次创建的值，可以每次调用函数才能拿到。
    
*   `createHref`作用是通过`location`返回新的`href`, `to`为字符串则返回`to`，否则返回`pathname`+`search`+`hash`
    
*   `back`和`forward`都通过`go`实现
    

### history.push

`replace`和`push`非常相似，区别在于`replace`将历史堆栈中当前`location`替换为新的，被替换的将不再存在，所以我们着重关注`push`

```
function push(to: To, state?: State) {  const nextAction = Action.Push;  const nextLocation = getNextLocation(to, state); function getNextLocation(to: To, state: State = null): Location {   return readOnly<Location>({     ...location,     ...(typeof to === 'string' ? parsePath(to) : to),     state,     key: createKey()   }); }  function retry() {    push(to, state);  }  if (allowTx(nextAction, nextLocation, retry)) { // blockers的限制    const [historyState, url] = getHistoryStateAndUrl(nextLocation, index + 1);  function getHistoryStateAndUrl(    nextLocation: Location,    index: number  ): [HistoryState, string] {    return [      {        usr: nextLocation.state,        key: nextLocation.key,        idx: index      },      createHref(nextLocation)    ];  }    window.history.pushState(historyState, '', url);    try {      globalHistory.pushState(historyState, '', url);    } catch (error) {      window.location.assign(url);    } // 用try-catch的原因是因为ios限制了100次pushState的调用，catch后只能选择刷新页面    applyTx(nextAction); // 调用listeners  }}
```

*   `allowTx`下面`blockers`会讲到，用于阻塞路由
    
*   `applyTx`下面`listeners`会讲到，用于调用监听器
    
*   `getNextLocation`
    
    路由还没切换的时候，根据`history.push`的`to`和`state`（新的 path 和状态）获取到新的 `location`
    
    `to`是字符串的话，会通过`parsePath`解析对应的`pathname`、`search`、`hash`(三者都是可选的，不一定会出现在返回的对象中)
    
*   `getHistoryStateAndUrl`
    
    根据新的`location`获取新的`state`和`url`
    
    因为是`push`，这里的`index`自然是加一
    
    再调用`createHref`，根据`location`生成`url`
    
*   最后调用`history.pushState`成功跳转页面，这个时候路由也就切换了
    

### history.listener

```
const history: HashHistory = {  // ...  listen(listener) {    return listeners.push(listener);  },  // ...}function applyTx(nextAction: Action) {  const [index, location] = getIndexAndLocation();  listeners.call({ action: nextAction, location });}function push(to: To, state?: State) { // replace  // ...  if (allowTx(nextAction, nextLocation, retry)) {    // ...    applyTx(nextAction);  }}function handlePop() {  if (blockedPopTx) {    // ...  } else {    // ...    if (blockers.length) {    // ...    } else {      applyTx(nextAction);    }  }}function allowTx(action: Action, location: Location, retry: () => void): boolean {  return (    !blockers.length || (blockers.call({ action, location, retry }), false)  );}
```

`history.listen`是一个标准的发布订阅模式，可以往`history`中添加`listener`，返回一个取消监听的可调用方法

*   `listener`在`push`、`replace`和`handlePop`三个函数中成功切换路由后调用
    
*   每当成功切换路由，就会调用`applyTx(nextAction)`来通知每个`listener`
    
*   `allowTx`的作用是判断是否允许路由切换，有`blockers`就不允许，也即是说，`listener`能否监听到路由变化，取决于当前页面是否被`blockers`阻塞了
    

### history.block

```
const history: BrowserHistory = {  // ...  block(blocker) {    const unblock = blockers.push(blocker);    if (blockers.length === 1) {      window.addEventListener('beforeunload', promptBeforeUnload);    }    return function() {      unblock();      if (!blockers.length) {        window.removeEventListener('beforeunload', promptBeforeUnload);      }    };  }};
```

`blocker`s 与`listeners`类似，区别在于：

*   添加第一个`blocker`时会添加`beforeunload`事件
    
    只要`block`了，那么我们刷新、关闭页面，通过修改地址栏输入`url`后`enter`都会触发
    
*   移除的时候发现`blockers`空了，那么就移除`beforeunload`事件
    

Router
------

应用顶层使用，为后代的`Route`提供`Context`的数据传递。

`Router`有很多种，区别在于路由在 url 上面存在的方式：

*   `BrowserRouter`「完整路由」，路由路径在 url 上完整对应，需要服务端支持
    
*   `HashRouter`「哈希路由」，路径为 url 里`#`后面的部分
    
*   `StaticRouter`「静态路由」，无状态：不改变路径地址、不记录历史栈
    

还有`MemoryRouter`（在内存中保存）、`NativeRouter`（在`ReactNative`中使用）等，他们使用的`history`状态机也不一样。

### BrowserRouter

篇幅所限，这里我们主要讨论最通用的`BrowserRouter`：

*   使用`browserHistory`
    
*   需要服务端支持
    

*   原因：如果只给用户提供 cdn 静态 html 文件，强制刷新或通过 “复杂路径” 访问时，无法找到路径下匹配的资源
    
*   对于`BrowserRouter`的应用，服务端渲染完成后，之后的路由由`BrowserRouter`独立完成解析
    
*   将相关的路径都转发到静态文件上，静态文件执行后，会读取当前的浏览器路径并正确渲染对应的组件
    

作为应用的最外层的容器组件，`BrowserRouter`源码如下：

```
export function BrowserRouter({  basename,  children,  window}) {  const history = useRef<BrowserHistory>();  if (historyRef.current == null) {    historyRef.current = createBrowserHistory({ window });  }  const history = historyRef.current;  const [state, setState] = useState({    action: history.action,    location: history.location  });  useLayoutEffect(() => {    history.listen(setState)  }, [history]);  return (    <Router      basename={basename}      children={children}      action={state.action}      location={state.location}      navigator={history}    />  );}
```

可以看到是，是一个构建了`history`的`<Router>`组件的封装

*   `Router`初始化会生成`history`实例，`history`一般变化的就是`action`和`location`，并把`setState`放入对应的`listeners`，那么路由切换就会`setState`了。
    
*   `Router`其接收的属性的变化的，就是路由相关的变化（`action`、`location`），这部分路由被存到`Context`。子组件作为消费者，就可以对页面进行修改，跳转，获取这些数值。
    

我们来看`Router`：

```
export function Router({  action = Action.Pop,  basename: basenameProp = "/",  children = null,  location: locationProp,  navigator,  static: staticProp = false}: RouterProps): React.ReactElement | null {  // ...  return (    <NavigationContext.Provider value={navigationContext}>      <LocationContext.Provider        children={children}        value={{ action, location }}      />    </NavigationContext.Provider>  );}const { basename, navigator } = React.useContext(NavigationContext);const { location } = React.useContext(LocationContext);export function useLocation(): Location {  return React.useContext(LocationContext).location;}
```

`Router`最后返回了两个`Context.Provider`，中间就是针对于`location`的处理

Route「路由端口」
-----------

我们直接看`Routes`和`Route`的源码：

```
export function Routes({  children,  location}: RoutesProps): React.ReactElement | null {  return useRoutes(createRoutesFromChildren(children), location);}export function Route(  _props: PathRouteProps | LayoutRouteProps | IndexRouteProps): React.ReactElement | null {  invariant(    false,    `A <Route> is only ever to be used as the child of <Routes> element, ` +      `never rendered directly. Please wrap your <Route> in a <Routes>.`  );}
```

可以发现

*   `Routes`实际上就是`useRoutes`的包装
    
*   `Route`实际上没有`render`，只是作为`Routes`的子组件存在
    

我们只需要着重研究`createRoutesFromChildren`与`useRoutes`:

```
export function createRoutesFromChildren(  children: React.ReactNode): RouteObject[] {  const routes: RouteObject[] = [];  React.Children.forEach(children, element => {    if (!React.isValidElement(element)) return;    if (element.type === React.Fragment) {      routes.push.apply(        routes,        createRoutesFromChildren(element.props.children)      );      return;    }    const route: RouteObject = {      caseSensitive: element.props.caseSensitive,      element: element.props.element,      index: element.props.index,      path: element.props.path    };    if (element.props.children) {      route.children = createRoutesFromChildren(element.props.children);    }    routes.push(route);  });  return routes;}
```

我们看到，`createRoutesFromChildren`作用如下：

*   递归收集子元素`Route`上的属性，最终返回一个嵌套数组
    
*   支持`React.Fragment`
    
*   创建一个`routes`路由配置
    

```
export function useRoutes(  routes: RouteObject[],): React.ReactElement | null { // --------------------------------第一段------------------------------------    const { matches: parentMatches } = React.useContext(RouteContext);  const routeMatch = parentMatches[parentMatches.length - 1];  const parentParams = routeMatch ? routeMatch.params : {};  const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : "/";    // --------------------------------第二段------------------------------------   let location = useLocation();  const pathname = location.pathname || "/";  const remainingPathname =    parentPathnameBase === "/"      ? pathname      : pathname.slice(parentPathnameBase.length) || "/";  const matches = matchRoutes(routes, { pathname: remainingPathname });    // --------------------------------第三段-------------------------------------   return _renderMatches(    matches &&      matches.map(match =>        Object.assign({}, match, {          params: Object.assign({}, parentParams, match.params),          pathname: joinPaths([parentPathnameBase, match.pathname]),          pathnameBase: joinPaths([parentPathnameBase, match.pathnameBase])        })      ),    parentMatches  );}
```

`useRoutes`参数的`routes`嵌套数组就是`createRoutesFromChildren`返回的路由配置，通过路由配置匹配到对应的 route 元素进行渲染：

*   第一段：获取`parentMatches`最后一项「routeMatch」
    
    `Routes`中，上一次`useRoutes`匹配后得到的`matches`会作为下一层的`parentMatches`，如果 match 了，获取匹配的`params`、`pathname`等各种信息
    
*   第二段：通过当前 Routes 的相对路径`remainingPathname`和`routes`匹配到对应的`matches`
    
    这里最复杂的部分，也是 react-router 最精华的部分，就是匹配路由，而这部分的逻辑在`matchRoutes`上：
    
    ```
    export function matchRoutes(  routes: RouteObject[],  locationArg: Partial<Location> | string,  basename = "/"): RouteMatch[] | null {  const location =    typeof locationArg === "string" ? parsePath(locationArg) : locationArg;  const pathname = stripBasename(location.pathname || "/", basename);  if (pathname == null) {    return null;  }  const branches = flattenRoutes(routes);  rankRouteBranches(branches);  let matches = null;  for (let i = 0; matches == null && i < branches.length; ++i) {    matches = matchRouteBranch(branches[i], pathname);  }  return matches;}
    ```
    
    `matchRoutes`的作用是通过当前相对路径和路由配置匹配到对应的`matches`
    
    `routes`有可能是多维路由配置，那么扁平化的过程中，会收集每个路由的属性作为 `routeMeta`，收集过程是一个深度优先遍历，`routesMeta`的长度等于路由嵌套自身所处层数
    
    对扁平后之后的路由进行排序，根据权重排序每个分支，如果权重相等才去比较 `routesMeta`的每个自权重
    
    直到`matches`有值 (意味着匹配到，那么自然不用再找了）或遍历完才跳出循环
    
    而`matchRouteBranch`会通过每个部分的`routesMeta`，来看看是否能从头到尾匹配到相应的路由，只要有一个不匹配，就返回 null
    
    `routesMeta`最后一项是该次路由自己的路由信息，前面项都是`parentMetas`
    
*   第三段：通过`_renderMatches`渲染上面得到的匹配元素
    
    终于拿到「路由匹配元素」matches 了，那么就要根据匹配项来渲染。
    
    ```
    function _renderMatches(  matches: RouteMatch[] | null,  parentMatches: RouteMatch[] = []): React.ReactElement | null {  if (matches == null) return null;  return matches.reduceRight((_, match, index) => {    return (      <RouteContext.Provider        children={match.route.element}        value={{          outlet,          matches: parentMatches.concat(matches.slice(0, index + 1))        }}      />    );  }, null as React.ReactElement | null);}
    ```
    

*   `_renderMatches`会根据匹配项和父级匹配元素`parentMatches`
    
*   从右到左，从子元素向父元素，渲染`RouteContext.Provider`
    

Link、Switch 等「导航」
-----------------

*   `Link`组件功能就是实现一次跳转
    
*   直接使用一般的`a`标签，会使页面刷新，所以需要借助`history`
    
*   `history.pushState`只会改变`history`状态，不会刷新页面
    
*   `history.pushState`的时候，不会触发`popstate`事件，所以`history`里面的回调不会自动调用，当用户使用`history.push`的时候，我们需要手动调用回调函数
    

我们来看看源码：

```
export default function Link({  to,  ...rest}) {  return (    <RouterContext.Consumer>      {context => {        const { history } = context;        const props = {          ...rest,          href: to,          onClick: event => {            event.preventDefault();            history.push(to);          }        };        return <a {...props} />;      }}    </RouterContext.Consumer>  );}
```

我们看到，`<Link>`只是渲染了一个没有默认行为的`a`标签，其跳转行为由`context`传入的`history.push`实现。

未来：Remix
========

remix 是由 react-router 原班人马打造，并获得三百万美元融资的 ts 全栈明星开发框架，笔者认为 remix 作为一个全新的全栈的解决方案值得关注，其路由功能非常灵活高效。

> “我们经常将 Remix 描述为 "React Router 的编译器"，因为有关 Remix 的所有内容都利用了嵌套路由。”

官网对 remix 的介绍如下：

*   一个编译器
    
*   一个有着 HTTP 处理器的服务端
    
*   一个服务端框架
    
*   一个浏览器端框架
    

remix 可以干掉骨架屏等加载状态，所有资源都可预加载，而且管理后台，对于数据的加载、嵌套数据或者组件的路由、并发加载优化做得很好，并且异常的处理已经可以精确到局部级别：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLVKDN6nTBw6NYmuKXVcdhhvaiaga5DStXBZvINFwLAz6UuYq1NzeUa33n2nj5DQJe1OyqXFjYmSg/640?wx_fmt=png)

remix 告别瀑布式的方式来获取数据，数据获取在服务端并行获取，生成完整 HTML 文档，类似 React 并发特性：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLVKDN6nTBw6NYmuKXVcdhuiaAMemwKaBEpKEibC3vbia0z7wB4BattZLSHcLje73tlUtcvKVBqRUUA/640?wx_fmt=png)

相比之下，Next.js 更像是一个静态网站生成器。Gatsby 相比下则门槛过高，需要一定的 GraphQL 基础。

同时，客户端与服务端能有一致的开发体验，客户端代码与服务端代码写在一个文件里，无缝进行数据交互，同时基于 TypeScript，类型定义可以跨客户端与服务端共用，路由也可以同步，实现一个组件化、路由为首的全栈模型。

结尾
==

我们看到，随着 Web 技术思维的变革，最早的渐进式应用正在走向越来越强的一体化，大前端、泛前端的思维性质越来越浓厚。

而服务端技术则通过云技术，走向了 SaaS，容器化这样更灵活、成本更低的道路上，旨在为应用端提供更便捷的开发。

在未来的 Web3 浪潮下，由于公链的存在，「胖协议 + 瘦应用」会是大势所趋，越来越敏捷和低成本的开发会更为重要。

路由作为前后端，交互最紧密的桥梁，会是一个关键的变革区域，或许有天我们可以看到，Web 技术通过路由，实现了真正的前后端的统一，走向了人人都可开发的大全栈未来。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)