> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0LvG2cn2qfDdRDg-Z1Mnbg)

一 前言
----

不知不觉 `react-router` 已经到了 `v6` 版本了，可能很多同学发现，`v6`相比之前的 `v5` 有着翻天覆地的变化，因为最近接触到了 React 的新项目，用到了 `v6` 版本的 `react-router`，亲身体验发现这还是我认识的 `router` 吗 ？从 api 到原理都有较大的改动，所以今天就和大家一起看一下新版路由的变化。  

对于这次的改动，笔者的建议是：**如果是新项目，可以尝试新版本的 `Rouer`，对于老项目，建议还是不要尝试升级 v6 ，升级的代价是会造成大量的功能改动，而且如果用到了依赖于 `router` 的第三方库，可能会让这些库失效。** 所以一些依赖于 react-router 的第三方库，也需要升级去迎合 `v6` 版本了，比如笔者之前的缓存页面功能的 `react-keepalive-router`，也会有大版本的更新。

通过本章节的学习，你将学习到以下内容：

*   新版本路由和老版本的差异，使用区别，API 区别。
    
*   新版本路由组件 Router ，Routes ，和 Route 的原理。
    
*   Outlet 组件原理。
    
*   useRoutes 原理。
    

让我们开始今天的 `router` v6 学习之旅吧。

二 基本使用
------

首先我们从路由的使用方法上，来看一下 v6 的变化，还是举例一个场景。比如有如下的路由结构：

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNbmNO2mrISTTnldC2lWjyd3OYeHIEypicaXCGxicWlSTb27gGxMSsnvtQ/640?wx_fmt=jpeg)1.jpg

如上图所示，页面分为简单的 2 级路由结构：

*   第一级页面有 `home` 页面， `list` 页面，和 `children` 页面。
    
*   第二级页面是 children 页面的子路由，包括：`child1` 和 `child2`。
    

接下来看一下，新老版本路由在使用上有什么区别。

### 1 老版本路由

#### 配置老版本路由

**入口文件 -> 一级路由**

```
const index = () => {  return <div class >      <BrowserRouter>         <Menus />         <Switch>            <Route component={Children} /* children 组件  */                path="/children"            ></Route>            <Route component={Home}     /* home 组件  */                path={'/home'}            ></Route>            <Route component={List}     /* list 组件 */                path="/list"            ></Route>         </Switch>      </BrowserRouter>    </div>  </div>}
```

上述为配置的一级路由的情况。我们看一下大体的功能职责分配：

*   **`BrowserRouter`** ：通过 history 库，传递 `history` 对象，`location` 对象。
    
*   **`Switch`**：匹配唯一的路由 `Route`，展示正确的路由组件。
    
*   **`Route`**：视图承载容器，控制渲染 `UI` 组件。
    

如上是一级路由的配置和对应组件的展示，接下来看一下二级路由的配置，二级路由配置在 `Children` 中：

```
function Children (){    return <div>        这里是 children 页面       <Menus />       <Route component={Child1}           path="/children/child1"       />       <Route component={Child2}           path="/children/child2"       />    </div>}
```

*   可以看到在 `Children` 中，有 `Child1` 和 `Child2` 两个组件。
    

看一下整体效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNficib9bfChchibr4SpakibnhDiaXXRVAJfUv59hgOZg5JjeY3QibictkIWsbw/640?wx_fmt=gif)2.gif

那么整体路由层级的结构图，如下所示（重点看和 v6 的整体设计的区别 ）：

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNjY85omPibOTZZS0vPlPY62sOavUE1wAacelu6YL7aTTicdpJUdmvVACw/640?wx_fmt=jpeg)3.jpg

#### 路由状态和页面跳转

**v5 可以通过以下方式获取路由状态**

*   **`props` + `Route`**：Route 承载的 ui 组件可以通过 props 来获取路由状态，如果想要把路由状态传递给子孙组件，那么可以通过 props 逐层传递的方式。
    
*   **`withRouter`** ：withRouter 是一个高阶组件 HOC ，因为默认只有被 `Route` 包裹的组件才能获取到路由状态，如果当前非路由组件想要获取状态，那么可以通过 withRouter 包裹来获取 `history` ，`location` 等信息。
    
*   **`useHistory`** ：函数组件可以通过 `useHistory` 获取 `history` 对象。
    
*   **`useLocation`** ：函数组件可以通过 `useLocation` 获取 `location` 对象。
    

**v5 通过以下方式实现路由跳转**

上面介绍了路由状态获取，那么还有一个场景就是切换路由，那么 v5 主要是通过两种方式改变路由：

*   通过 `react-router-dom` 内置的 `Link`， `NavLink` 组件来实现路由跳转。
    
*   通过 `history` 对象下面的路由跳转方法，比如 push 等，来实现路由的跳转。
    

#### 整体架构设计

**路由状态传递**

至于在 React 应用中，路由状态是通过什么传递的呢，我们都知道，在 React 应用中， `Context` 是一个非常不错的状态传递方案，那么在 Router 中也是通过 context 来传递的，在 `react-router` `v5.1.0`及之前的版本，是把 history ，location 对象等信息通过一个 `RouterContext` 来传递的。

在 v5.2.0 到新版本 v5 React-Router 中，除了用 `RouterContext` 保存状态之外，history 状态由 `HistoryContext` 单独保存。

**路由模块的整体设计**

接下来我们看一下 v5 的 react-router 的整体设计：

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNa3ktXt7huFdJGicmo88m1GMwXZFhRSgthDbdibpEZ1DIYhxRPIJm9yfw/640?wx_fmt=jpeg)4.jpeg

以上是整个 react-router v5 的模块设计。

### 2 v6 router 尝鲜

接下来我们使用 react-router v6 版本尝鲜。用 v6 实现上述功能。

#### 新版本路由配置

**入口文件 -> 整体路由配置**

```
import { Routes , Route , Outlet  } from 'react-routerimport { BrowserRouter } from 'react-router-dom'const index = () => {  return <div class >       <BrowserRouter >           <Menus />           <Routes>              <Route element={<Home />}                  path="/home"              ></Route>              <Route element={<List/>}                  path="/list"              ></Route>              <Route element={<Layout/>}                  path="/children"              >                  <Route element={<Child1/>}                      path="/children/child1"                  ></Route>                  <Route element={<Child2/>}                      path="/children/child2"                  ></Route>              </Route>           </Routes>       </BrowserRouter>    </div>  </div>}
```

如上，我们用 v6 版本的 router 同样实现了嵌套二级路由功能。通过如上代码我们可以总结出：

*     
    

1.  在 v6 版本中 `BrowserRouter` 和 `HashRouter` 还是在整个应用的最顶层。提供了 history 等核心的对象。
    

*     
    

2.  在新版的 router 中，已经没有匹配唯一路由的 `Switch` 组件，取而代之的是 `Routes` 组件，但是我们不能把 Routes 作为 Switch 的代替品。因为在新的架构中 ，Routes 充当了很重要的角色，在 react-router 路由原理 文章中，曾介绍到 Switch 可以根据当前的路由 path ，匹配唯一的 Route 组件加以渲染。但是 Switch 本身是可以被丢弃不用的，但是在新版的路由中， Routes 充当了举足轻重的作用。比如在 v5 中可以不用 Switch 直接用 Route，但是在 v6 中使用 Route ，外层必须加上 Routes 组件，也就是 Routes -> Route 的组合。
    

如果 Route 外层没有 Routes ，会报出错误。比如如下

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNIwcNCBJvQrAk9ktdkiaSbU06PM2wG0BWqQ5m9JLnwpELMBSBuvYKXNg/640?wx_fmt=jpeg)5.jpg

这个同学们在开发的时候需要注意。

*     
    

3.  对于新版本的路由，嵌套路由结构会更加清晰，比如在老版本的路由中，配置二级路由，需要在业务组件中配置，就像在第一个例子中，我们需要在 `Children` 组件中进行二级路由的配置。但是在 v6 中，对于配置子代路由进行了提升，可以在子代路由直接写在 Route 组件里，如上将 `Child1` 和 `Child2` 直接写在了 `/children` 的路由下面，那么有的同学会疑问，那么子路由将渲染在哪里，答案当然是上述的 `Layout` 组件内。那么就看一下 Layout 中是如何渲染的子代路由组件。
    

**Layout -> 渲染二级路由**

```
function Container(){  return <div> <Outlet/></div>}/* 子路由菜单 */function Menus1(){  return <div>      <Link to={'/children/child1'} > child1 </Link>      <Link to={'/children/child2'} > child2 </Link>  </div>}function Layout(){  return <div>      这里是 children 页面      <Menus1 />     <Container />  </div>}
```

*   如上我们可以看到，Layout 并没有直接渲染二级子路由，而是只有一个 `Container`， Container 内部运用了 v6 Router 中的 `Outlet` 。而 Outlet 才是真正渲染子代路由的地方，也就是 Child1 和 Child2 。这里的 Outlet 更像是一张身份卡，证明了这个就是真正的路由组件要挂载的地方，而且不受到组件层级的影响 （可以直接从上面看到，Outlet 并没有在 Layout 内部，而是在 Container ），这种方式更加清晰，灵活，能够把组件渲染到子组件树的任何节点上。
    

那么总结一下路由结构图如下所示：

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNw58Z9Su2dMDfecqodz71RwGKibKHkaguUIY2GOw7CpOkeCzYASHmVuQ/640?wx_fmt=jpeg)6.jpg

通过如上对比，可以看出 v6 大致上和 v5 的区别。这里对功能方面做了一下总结：

*     
    

1.  新版本的 router 没有 `Switch` 组件，取而代之的是 Routes ，但是在功能上 `Routes` 是核心的，起到了不可或缺的作用。老版本的 route 可以独立使用，新版本的 route 必须配合 Routes 使用。
    

*     
    

2.  新版本路由引入 Outlet 占位功能，可以更方便的配置路由结构，不需要像老版本路由那样，子路由配置在具体的业务组件中，这样更加清晰，灵活。
    

接下来看一下 v6 的其他功能。

#### 路由状态和页面跳转

**路由状态获取和页面跳转**

*     
    

1.  **状态获取**：对于路由状态 location 的获取 ，可以用自定义 hooks 中 `useLocation` 。location 里面保存了 hash | key | pathname | search | state 等状态。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNJFy5UFU82V4r4Nc7Avbs1lgHHTcENzIzn4GI29v88iakT7x3qPnSbiaQ/640?wx_fmt=jpeg)7.jpg

*     
    

2.  **路由跳转**：新版路由提供了 `useNavigate` ，实现路由的跳转。具体用法参考如下代码：
    

```
function Home (){    const navigate = useNavigate()    return <div>       <button onClick={() => navigate('/list',{ state:'alien' })  }  >         跳转列表页      </button>    </div>}
```

`navigate`：第一参数是跳转路径，第二个参数是描述的路由状态信息，可以传递 `state` 等信息。

*     
    

3.  **动态路由：** 新版路由里面实现动态路由，也变得很灵活，可以通过 useParams 来获取 url 上的动态路由信息。比如如下  
    

**配置：**

```
<Route element={<List/>} path="/list/:id"></Route>
```

**跳转动态路由页面：**

```
<button onClick={()=>{ navigate('/list/1'})}} >跳转列表页</button>
```

**useParams 获取动态路由参数**

```
function List(){    const params = useParams()    console.log(params,'params') // {id: '1'} 'params'    return <div>        let us learn React !    </div>}
```

*     
    

4.  **url 参数信息获取：**， 新版路由提供 `useSearchParams` 可以**获取** ｜ **设置** url 参数。比如如下例子：
    

```
function Index(){    const [ getParams ,setParam] = useSearchParams()   //第一个参数 getParams 获取 param 等 url  信息, 第二个参数 setParam 设置 url 等信息。    const name = getParams.getAll('name')    console.log('name',name)    return <div>        hello,world        <button onClick={()=>{           setParam({ name:'alien' , age: 29  })  //可以设置 url 中 param 信息        }}        >设置param</button>    </div>}
```

`useSearchParams` 返回一个数组。  

1 数组第一项，`getParams` 获取 url 参数信息。2 数组第二项，`setParam`  设置 url 参数信息。

来看一下演示：

![](https://mmbiz.qpic.cn/mmbiz_gif/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNlEznXAQQcTMCDLS05utDnI9DsyxDFWYdiaU825OBR67q3uRibYichvKPg/640?wx_fmt=gif)8.gif

*     
    

5.  **配置更加灵活。** 在 v5 版本中，通过 options 到路由组件的配置，可以用一个额外的路由插件，叫做 `react-router-config` 中的 `renderRoutes` 方法。在 v6 版本中提供了自定义 hooks `useRoutes` 让路由的配置更加灵活。来看一下具体的使用。
    

```
const routeConfig = [  {     path:'/home',     element:<Home />  },  {     path:'/list/:id',     element:<List />  },  {     path:'/children',     element:<Layout />,     children:[       { path:'/children/child1' , element: <Child1/> },       { path:'/children/child2' , element: <Child2/>  }     ]  }]const Index = () => {  const element = useRoutes(routeConfig)  return <div class >        <Menus />        {element}    </div>  </div>}const App = ()=> <BrowserRouter><Index /></BrowserRouter>
```

如上让结构更加清晰，配置更加灵活。

*     
    

6.  **其他功能**， v6 还提供了一些其他功能的 hooks ，这里就不一一讲了，有兴趣的同学可以看一下官方文档，传送门 。
    

#### 整体架构设计

接下来我们看一下 v6 整体设计：

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KND47NejCwB87y7ibYPOUz3TNZ5ITRCblYYjmX7q7dnm4zZVSBJGTYuVg/640?wx_fmt=jpeg)9.jpg

*   从如上图中，可以看得出，新版本 v6 已经完全拥抱了 hooks 。
    
*   用了很多 context 进行传递，比如传递 navigate （功能上可以理解成老版本 history  `）NavigationContext` 对象，传递 location 的 LocationContext 对象等。
    

三 原理分析
------

上述介绍了从使用上，v5 和 v6 版本路由的区别。接下来，我们重点看一下新版 Route 的原理。以及和老版本有什么区别。

### 1 新版 Route 设计

老版本的路由，核心的组件是 **`Route`**，之前的路由原理文章中介绍过，Route 内部通过消费 context 方式，当路由改变的时候，消费 context 的 Route 会重新渲染，内部通过 match 匹配到当前的路由组件是否挂载，那么就是说真正去匹配，去挂载的核心组件为 Route。

而在新版本的 Route 中，对于路由更新，到路由匹配，再到渲染真正的页面组件，这些逻辑主要交给了 Routes ，而且加了一个 `branch` ‘分支’ 的感念。可以把新版本的路由结构理解一颗分层级的树状结构，也就是当路由变化的时候，会在 Routes 会从路由结构树中，找到需要渲染 branch 分支。此时的 Route 组件的主要目的仅仅是形成这个路由树结构中的每一个节点，但是没有真正的去渲染页面。

新版本的路由可以说把路由从业务组件中解耦出来，路由的配置不在需要制定的业务组件内部，而是通过外层路由结构树统一处理。对于视图则是通过 `OutletContext` 来逐层传递，接下来我们一起来看一下细节。

### 2 外层容器，更新源泉 BrowserRouter | HashRouter ｜ Router

在新版本的路由中，对于外层的 Router 组件和老版本的有所差别。以 BrowserRouter 为例子，先看一下老版本。

**老版本的 BrowserRouter**

```
import { createBrowserHistory as createHistory } from "history";class BrowserRouter extends React.Component {  history = createHistory(this.props)   render() {    return <Router history={this.history} children={this.props.children} />;  }}
```

*   老版本的 BrowserRouter 就是通过 `createHistory` 创建 `history` 对象，然后传递给 Router 组件。
    

接下来就是新版本的 BrowserRouter， 做了哪些事情呢？

> react-router-dom/index.tsx

```
export function BrowserRouter({
  basename,
  children,
  window
}: BrowserRouterProps) {
  /* 通过 useRef 保存 history 对象  */
  let historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }

  let history = historyRef.current;
  let [state, setState] = React.useState({
    action: history.action,
    location: history.location
  });
  /* history 变化，通知更新。*/
  React.useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
```

新版本的 BrowserRouter 的功能如下：

*   通过 `createBrowserHistory` 创建 `history` 对象，并通过 `useRef` 保存 history 对象。
    
*   通过 `useLayoutEffect` 来监听 `history` 变化，当 history 发生变化（浏览器人为输入，获取 a 标签跳转，api 跳转等 ）。派发更新，渲染整个 router 树。**这是和老版本的区别，老版本里面，监听路由变化更新组件是在 Router 中进行的。**
    
*   还有一点注意的事，在老版本中，有一个 `history` 对象的概念，新版本中把它叫做 `navigator` 。
    

接下来分析一下新版本 Router 做了哪些事。

> react-router/index.tsx

```
function Router({basename,children,location:locationProp,navigator}){  /* 形成 navigationContext 对象   保存 basename ， navigator 对象等信息。*/  let navigationContext = React.useMemo(    () => ({ basename, navigator, static: staticProp }),    [basename, navigator, staticProp]  );  /* 把 location 里面的状态结构出来  */  const { pathname, search, hash, state, key } = locationProp  /* 形成 locationContext 对象，保存 pathname，state 等信息。 */  let location = React.useMemo(() => {    /* .... */     return { pathname, search, hash, state, key  }  },[basename, pathname, search, hash, state, key])  /* 通过 context 分别传递 navigationContext 和 locationContext */   return (    <NavigationContext.Provider value={navigationContext}>      <LocationContext.Provider        children={children}        value={{ location, navigationType }}      />    </NavigationContext.Provider>  )}
```

**`Router`** 在新版路由中充当的角色如下：

*   通过 useMemo 来派生出负责跳转路由等功能的 navigator 对象和路由信息的 location 对象。通过 React context 来传递它们。
    
*   当路由变化时候，在 `BrowserRouter` 中通过 useState 改变 location ，那么当 location 变化的时候，`LocationContext` 发生变化，消费 LocationContext 会更新。
    

### 3 原理深入，Routes 和 branch 概念

上述我们拿 BrowserRouter 为例子，讲解了外层容器做了哪些事。我们继续深入探秘，看一下 routes 内部做了什么事，还有如何形成的路由的层级结构。以及路由跳转，到对应页面呈现的流程。

以如下例子为参考：

```
<Routes>   <Route element={<Home />} path="/home" />   <Route element={<List/>}  path="/list" />   <Route element={<Layout/>} path="/children" >      <Route element={<Child1/>} path="/children/child1" />      <Route element={<Child2/>} path="/children/child2" />   </Route></Routes>
```

我们带着两个问题去思考。

*   如果当前 `pathname` 为 `/home`，那么整个路由如何展示 Home 组件的。
    
*   如果切换路由为 `/children/child1`，那么从页面更新到呈现的流程是怎么样的。又如何在 `Layout` 内部渲染的 `Child1` 。
    

#### Route 和 Routes 形成路由结构

上面我们讲到过，新版的 Route 必须配合上 Routes 联合使用。老版本 Route 至关重要，负责匹配和更新容器，**那么新版本 Route 又做了哪些事呢？**

> react-router/index.tsx

```
function Route(_props){  invariant(    false,    `A <Route> is only ever to be used as the child of <Routes> element, ` +      `never rendered directly. Please wrap your <Route> in a <Routes>.`  );}
```

刚看到 Route 的同学，可能会发懵，里面没有任何的逻辑，只有一个 `invariant` 提示。这可能会颠覆很多同学的认识，Route 组件不是常规的组件，可以理解成一个空函数。如果是正常按照组件挂载方式处理，那么肯定会报错误，那么我们写的 `<Route>` 是怎么处理的呢？实际上一切处理的源头就在 Routes 这个组件，它的作用就是根据路由的变化，匹配出一个正确的渲染分支 branch 。

那么 Routes 就是我们需要重点研究的对象。

#### Routes 和 useRoutes

首先来看一下 `Routes` 的实现：

> react-router/index.tsx

```
export function Routes({children,location }) {  return useRoutes(createRoutesFromChildren(children), location);}
```

*   使用 `<Routes />` 的时候，本质上是通过 useRoutes 返回的 react element 对象，那么可以理解成此时的 useRoutes 作为一个视图层面意义上的 `hooks` 。Routes 本质上就是使用 useRoutes 。
    

上面我们讲到了，如果可以用 useRoutes ，可以直接把 route 配置结构变成 element 结构，并且负责展示路由匹配的路由组件，那么 useRoutes 就是整个路由体系核心。

在弄清楚 useRoutes 之前我们先来明白 **`createRoutesFromChildren`** 做了些什么？

> react-router/index.tsx -> createRoutesFromChildren

```
function createRoutesFromChildren(children) { /* 从把 变成层级嵌套结构  */
  let routes = [];
  Children.forEach(children, element => {
    /* 省略 element 验证，和 flagement 处理逻辑 */
    let route = {
      caseSensitive: element.props.caseSensitive,  // 区分大小写
      element: element.props.element,              // element 对象 
      index: element.props.index,                  // 索引 index 
      path: element.props.path                     // 路由路径 path
    };
    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children);
    }
    routes.push(route);
  });
  return routes;
}
```

*   createRoutesFromChildren 内部通过 React.Children.forEach 把 Route 组件给结构化，并且内部调用递归，深度递归 children 结构。
    

`createRoutesFromChildren` 可以把 `<Route>` 类型的 react element 对象，变成了普通的 route 对象结构。我们上面说过了 Route 本质是一个空函数，并没有实际挂载，所以是通过 createRoutesFromChildren 处理转化了。

比如如下的结构:

```
<Routes>   <Route element={<Home />} path="/home" />   <Route element={<List/>}  path="/list" />   <Route element={<Layout/>} path="/children" >      <Route element={<Child1/>} path="/children/child1" />      <Route element={<Child2/>} path="/children/child2" />   </Route></Routes>
```

element 会被转化成如下结构：

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNl1gEZWs99PNKnhX0lZib6wqUrelofUdZhI3IYz4G8eczQ5936PGDkeg/640?wx_fmt=jpeg)10.jpg

接下来暴露的重点就是 **useRoute** ，似乎从路由挂载，再到切换路由重新渲染，都和它有关系。那么接下来重点看一下这个自定义 hooks。

> react-router/useRoutes

```
function useRoutes(routes, locationArg) {    let locationFromContext = useLocation();   /* TODO: 第一阶段：计算 pathname  */   // ...代码省略   /* TODO: 第二阶段：找到匹配的路由分支  */  let matches = matchRoutes(routes, {    pathname: remainingPathname  });  console.log('----match-----',matches)  /* TODO: 第三阶段：渲染对应的路由组件 */  return _renderMatches(matches && matches.map(match => Object.assign({}, match, {    params: Object.assign({}, parentParams, match.params),    pathname: joinPaths([parentPathnameBase, match.pathname]),    pathnameBase: match.pathnameBase === "/" ? parentPathnameBase : joinPaths([parentPathnameBase, match.pathnameBase])  })), parentMatches);}
```

这段代码是 v6 路由比较核心的一部分，为了加强理解，我把它分成三个阶段。

*   **第一阶段 ，生成对应的 pathname** ：还是以上面的 demo 为例子，比如切换路由 `/children/child1`，那么 pathname 就是 `/children/child1`。
    
*   **第二阶段，通过 `matchRoutes`，找到匹配的路由分支。**，什么叫做匹配的路由分支呢，比如上面的切换路由到  `/children/child1`，那么明显是一个二级路由，那么它的路由分支就应该是 root -> children -> child1。我们打印 matches 看一下数据结构。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KN5QWKtT1hicLTdMPsggmd6hkwNMVNXupKr95LxIUmicia1XnoDicrke3zNA/640?wx_fmt=jpeg)11.jpg

*   还有一点就是 `useRoutes` 内部用了 `useLocation`。当 location 对象变化的时候，useRoutes 会重新执行渲染。
    

通过上面可以看到，matches 为扁平化后匹配的路由结构，是一个数组结构，那么索引 0 为第一层路由，索引 1 为第二层路由。那么来看一下  **matchRoutes** 的实现。

#### matchRoutes 和 _renderMatches 渲染路由分支

> react-router/index.tsx -> matchRoutes

```
function matchRoutes(routes,locationArg,basename){    /* 扁平化 routes 结构 */    let branches = flattenRoutes(routes);    /* 排序 route */    rankRouteBranches(branches);    let matches = null;    /* 通过 matchRouteBranch  */    for (let i = 0; matches == null && i < branches.length; ++i) {      matches = matchRouteBranch(branches[i], pathname);    }    return matches;}
```

*   首先通过 **flattenRoutes** 将数组进行扁平化处理，扁平化处理后变成了如下的样子。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KN2G9ibiaW9ma2iaZUtd88v5wMuBQarkdh0IfLBtPtmRuP85Hwvbp0QMSpg/640?wx_fmt=jpeg)12.jpg

扁平化的 branches 里面有一个 **routesMeta** 属性，存放了每一个 route 信息，比如上面那个  `/children/child1` 那么本质上有 2 层路由组成。第一层是 `/children`，第二层是 `/child1`；

*   接下来通过 rankRouteBranches 调整 route 的顺序。
    
*   最后 `for` 循环和 `matchRouteBranch` 来找到待渲染的路由分支，如果 matches 不为 null ，那么会终止循环。由于篇幅原因 matchRouteBranch 的原理就不讲了，它主要的作用就是通过 pathname 来找到待渲染的 routesMeta 下面的路由。然后形成最终的 `matches` 结构。
    

找到了对应的 `matches` ，我们知道 `matches` 里面保存了即将待渲染的路由。那么接下来就是去渲染路由，渲染对应的页面。那么主要就是 _renderMatches 做的事情了，所以我们看一下这个函数做了些什么？

> react-router/index.tsx -> _renderMatches

```
function _renderMatches(matches, parentMatches) {  if (parentMatches === void 0) {    parentMatches = [];  }  if (matches == null) return null;  return matches.reduceRight((outlet, match, index) => {    /* 把前一项的 element ，作为下一项的 outlet */    return  createElement(RouteContext.Provider, {      children: match.route.element !== undefined ? match.route.element : /*#__PURE__*/createElement(Outlet, null),      value: {        outlet,        matches: parentMatches.concat(matches.slice(0, index + 1))      }    });  }, null);}
```

这段代码很精妙，信息量也非常大，通过 `reduceRight` 来形成 react 结构 elmenet，这一段解决了三个问题：

*     
    

1.  第一层 route 页面是怎么渲染。
    

*     
    

2.  outlet 是如何作为子路由渲染的。
    

*     
    

3.  路由状态是怎么传递的。
    

首先我们知道 reduceRight 是从右向左开始遍历，那么之前讲到过 match 结构是 root -> children -> child1， reduceRight 把前一项返回的内容作为后一项的 outlet，那么如上的 match 结构会这样被处理。

*   1 首先通过 provider 包裹 child1，那么 child1 真正需要渲染的内容 Child1 组件 ，将被当作 provider 的 children，最后把当前 provider 返回，child1 没有子路由，所以第一层 outlet 为 null。
    
*   2 接下来第一层返回的 provider，讲作为第二层的 outlet ，通过第二层的 provider 的 value 里面 outlet 属性传递下去。然后把 Layout 组件作为 children 返回。
    
*   3 接下来渲染的是第一层的 Provider ，所以 Layout 会被渲染，那么 Child1 并没有直接渲染，而是作为 provider 的属性传递下去。
    

那么从上面我们都知道 child1 是在 `container` 中用 `Outlet` 占位组件的形式渲染的。那么我们先想一下 Outlet 会做哪些事情，应该会用 useContext 把第一层 provider 的 outlet 获取到然后渲染就可以渲染 child1 的 provider 了，而 child1 为 children 也就会被渲染了。我们验证一下猜想是否正确。

> react-router/index.tsx -> Outlet

```
export function Outlet(props: OutletProps): React.ReactElement | null {  return useOutlet(props.context);}
```

*   Outlet 本质就是用了 useOutlet ，接下来一起看一下 `useOutlet`。
    

> react-router/index.tsx -> useOutlet

```
export function useOutlet(context?: unknown): React.ReactElement | null {  let outlet = React.useContext(RouteContext).outlet;  if (outlet) {    return (      <OutletContext.Provider value={context}>{outlet}</OutletContext.Provider>    );  }  return outlet;}
```

*   可以看出来就是获取上一级的 Provider 上面的 outlet ，（在上面 demo 里就是包裹 Child1 组件的 Provider ），然后渲染 outlet ，所以二级子路由就可以正常渲染了。
    

到此为止，整个 v6 渲染原理就很清晰了。

我们把 reduceRight 做的事，用一幅流程图来表示。

![](https://mmbiz.qpic.cn/mmbiz_jpg/2KticQlBJtdzJfprBWZlR2d1ejooxj4KNic3YCEaZBS4ia5B9Tfbiboic47RHxoTVHsOeUjlv8IpibZwUt0XEo7CQTicA/640?wx_fmt=jpeg)13.jpg

#### 路由更新到对应组件渲染展示流程

接下来我们来分析一下如果通过 navigator 实现跳转，比如 home 跳转到 child1 组件，那么会发生哪些事情呢？

*   还是拿 BrowserRouter 为例子，当更新路由的时候，首先 BrowserRouter 中的 listen 事件会触发，那么会形成新的 location 对象。接下来 locationContext 会更新。
    
*   useRoutes 内部消费了 locationContext ，locationContext 变化会让 useRoutes 重新执行。
    
*   useRoutes 重新执行，内部会调用 matchRoutes 和 _renderMatches 找到新的渲染分支，渲染对应的页面。
    

整个渲染流程还是比较简单和清晰的。

四 v5 和 v6 区别
------------

上面介绍了 v6 的用法和原理，接下来看一下 v6 和 v5 比较区别是什么？

**组件层面上：**

*   老版本路由采用了 Router Switch Route 结构，Router -> 传递状态，负责派发更新；Switch -> 匹配唯一路由 ；Route -> 真实渲染路由组件。
    
*   新版本路由采用了 Router Routes Route 结构，Router 为了抽离一 context；Routes -> 形成路由渲染分支，渲染路由；Route 并非渲染真实路由，而是形成路由分支结构。
    

**使用层面上：**

*   老版本路由，对于嵌套路由，配置二级路由，需要写在具体的业务组件中。
    
*   新版本路由，在外层统一配置路由结构，让路由结构更清晰，通过 Outlet 来实现子代路由的渲染，一定程度上有点类似于 vue 中的 `view-router`。
    
*   新版本做了 API 的大调整，比如 useHistory 变成了 useNavigate，减少了一些 API ，增加了一些新的 api 。
    

**原理层面上：**

*   老版本的路由本质在于 Route 组件，当路由上下文 context 改变的时候，Route 组件重新渲染，然后通过匹配来确定业务组件是否渲染。
    
*   新版本的路由本质在于 Routes 组件，当 location 上下文改变的时候，Routes 重新渲染，重新形成渲染分支，然后通过 provider 方式逐层传递 Outlet，进行匹配渲染。
    

五 总结
----

本文主要介绍了 v6 的基本使用，原理介绍，和 v5 区别，感兴趣的朋友可以尝试把 v6 用起来。总体感觉还是挺不错的。

### 参考资料

*   Upgrading from v5
    
*   「源码解析 」这一次彻底弄懂 react-router 路由原理
    

 - END -

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECqoVbtplgn1lGUicQXib1OKicq8iaxkE3PtFkU0vKvjPRn87LrAgYXw6wJfxiaSQgXiaE3DWSBRDJG39bA/640?wx_fmt=png)