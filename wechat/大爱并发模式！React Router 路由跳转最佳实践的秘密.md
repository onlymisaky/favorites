> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DR_Ugew3SImAxP1o_fsk5w?poc_token=HDkeXWajPad1KoXWLvfNnc_b32rcbLWaOq5763F0)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFS5wELyQfEPeqQrpfGEO8drkuyuPHichqsZic5qcdPa7MmDrIVHmialSZhHWKMEGichYayv6xrUIkCxg/640?wx_fmt=png&from=appmsg)

在 Next.js 大热之前，React Router 是 React 生态中，最流行的路由库。也是我最喜爱的路由库。不过随着版本的迭代，React Router 变得越来越庞大了。他的复杂度已经快要比得上一个框架了。

所以也不知道现在大家是否还在使用它。

本文主要的目的是结合 Suspense 与 useTransition，来为大家分享一下路由懒加载如何做才是最佳实践。技术点主要包含如下内容

*   1、React Router v6 基础简介
    
*   1、React.lazy
    
*   2、Suspense
    
*   3、useTransition
    

全文共 **3028** 字，预计阅读需要花费 6 分钟

1
-

**React Router v6 基础简介**

浏览器支持了两种路由方案。分别是 history router 与 hash router。

history router 是目前的主流方案，他相对简洁，我们可以通过 `location.pathname` 获取到对应的值。

```
// history routerxxx.com/article/121xxx.com/profile
```

hash router 是指 # 后面的内容。可以通过 `location.hash` 获取到对应的值。

```
// hash routerxxx.com#/article/121xxx.com#/profile
```

React Router 中，分别有两个顶层容器组件对应不同的路由模式。`<BrowserRouter>` 对应 history router，`<HashRouter>` 对应 hash router.

在项目顶层组件中，我们只需要使用对应的组件包裹项目节点，就可以使用对应的路由模式。例如，我们的 demo 项目使用了 BrowserRouter

```
ReactDOM.createRoot(document.getElementById('root')).render(  <StrictMode>    <BrowserRouter>      <App />    </BrowserRouter>  </StrictMode>)
```

然后我们就可以在 App 中使用 `<Routes>` 组件来配置子路由。Routes 表示当前组件的一个路由适配标记，当路由发生变化时，它会自动去识别子路由中是否有合适的组件被匹配上了。

子路由的配置，我们使用如下语法来完成

```
<Route path="tasks" element={<DashboardTasks />} />
```

path 表示当前路由，element 表示当前路由所对应需要渲染的组件。

当子路由配置比较多时，我们可以通过抽象的思路，将其中的配置项抽离成为数组，然后通过 map 遍历来实现功能

```
const routerConfig = [{  path: 'tasks',  element: DashboardTasks}, {  ...}]
```

```
{routerConfig.map((item, index) => {  <Route key={item.path} path={item.path} element={    <item.element />  } />))}
```

> ✓
> 
> 如果还有其他更细节的逻辑，请结合正常的需求和 JS 逻辑完善补充，切勿生搬硬套。例如，Route 还支持子组件嵌套，那么这里的逻辑会变得更复杂

**两种常见的路由跳转方案**

我们可以使用 `Link` 组件来实现跳转，它类似与一个 a 标签，是**一个正常的 UI 组件**，因此我们只需要把他放到跳转按钮应该存在的位置即可。

```
import { Link } from "react-router-dom";function UsersIndexPage({ users }) {  return (    <div>      <h1>Users</h1>      <ul>        {users.map((user) => (          <li key={user.id}>            <Link to={user.id}>{user.name}</Link>          </li>        ))}      </ul>    </div>  );}
```

另外一种方式就是利用 `js` 来控制跳转。React Router v6 中，提供了新的 hook 来支持这种跳转。

```
import {useNavigate} from 'react-router-dom'function Motion() {  const navigate = useNavigate()  function __handler() {    navigate('/use/01')  }  return (    <div>      <button onClick={__handler}>点击跳转</button>    </div>  )}export default Motion;
```

虽然 React Router v6 非常复杂，不过利用我们刚才提到的知识点，已经可以勉强搭建一个小型应用了。

2
-

**React.lazy**

当项目变得庞大时，我们可以通过 `React.lazy` 来进行拆包。有 React.lazy 引入的组件会单独的打成一个包。如果我们的每一个页面组件都使用它来引入，那么，主包的大小就不会随着页面变多也变大。

这是首屏优化的重要手段之一。

我们可以单独引入一个组件

```
import React from 'react';const OtherComponent = React.lazy(() => import('./OtherComponent'));function MyComponent() {  return (    <div>      <OtherComponent />    </div>  );}
```

在新的 React 版本中，可以直接将其当做正常的组件使用即可，不会报错。

```
<Router   path="xxx"   element={<OtherComponent />} />
```

也可以在刚才抽离出来的配置文件中引入。

```
import {lazy} from 'react'export const navigation = [{  path: '',  name: 'home',  component: lazy(() => import('./pages/home'))}, {  path: 'motion',  name: 'react motion',  component: lazy(() => import('./pages/00_motion'))}, {  ...}]
```

如果我们不担心在加载时的白屏时间过长，那么这样做就可以了。

> i
> 
> > > 通常情况下也不会太长，大多数页面代码都非常小，一闪而过就加载成功了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFS5wELyQfEPeqQrpfGEO8dptYFQVlDxtjRHt6ASzayUAc6FkxiagiaY24079d1WdeWVTa0GH4GGYWQ/640?wx_fmt=png&from=appmsg)

3
-

**Suspense**

当然，更保险和稳妥的做法是，使用 Suspense 做一层兜底。Suspense 可以一定程度上拦截可能会发生的报错行为，并且我们有机会在加载页面时，显示一个 Loading 过程。

```
<!--map 中--><Route key={item.path} path={item.path} element={  <Suspense fallback={<div>loading...</div>}>    <item.component />  </Suspense>} />
```

加了这个之后，我们来看一下页面切换的演示效果

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcFS5wELyQfEPeqQrpfGEO8dS2SRMobJeVib1tG64QByqF2tKC8pPHZSEq6u7lZLjxdyficCsu6gap0w/640?wx_fmt=gif&from=appmsg)

注意看，组件首次加载时，会显示我们在 Suspense 中设定的 Loading 状态。但是当我们第二次点击时，Loading 就不再显示。

因此，这种交互效果的体验还是非常可以了。许多团队搞到这里基本上就差不多了。

4
-

**进一步结合 useTransition 使用**

但是这里我们注意到，每个页面的整体体积是非常小的。有的甚至只有不到 200B，打包之后还会变得更小，因此新的页面组件模块加载非常快。

大多数情况下，增加一个 Loading 表示加载过程其实是没有必要的。因此，我们这里可以进一步结合 `useTransition` 来让 Suspense 的 Loading 不显示。

> ✓
> 
> 注意，这个行为是一个可选的，并非必要，当你觉得部分页面加载还是需要花费一点时间，那么显示 Loading 可能是更好的选择

具体的做法，就是使用 `useTransition` 降低路由跳转的优先级，让加载行为先执行。

完整代码如下。

```
import {useTransition} from 'react'import {useNavigate} from 'react-router-dom'function Motion() {  const [isPending, startTransition] = useTransition()  const navigate = useNavigate()  function __handler() {    startTransition(() => {      navigate('/use/01')    })  }  return (    <div>      <button        onClick={__handler}        disabled={isPending}      >点击跳转</button>    </div>  )}export default Motion;
```

我们可以观察一下这种方式的路由切换效果。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcFS5wELyQfEPeqQrpfGEO8dxhE2vDLbFTAsfn4iaJJPiaDUIFQqc47snaYI2tPZOqMW9Cp7sCMibibs5w/640?wx_fmt=gif&from=appmsg)

在上面的演示图中我们可以看到，由于新页面模块的请求非常快，因此切换的过程也非常丝滑，基本上看不出来有任何卡顿。

5
-

**总结**

在以前的开发中，大家对于 React 的并发模式，更多停留在有所耳闻的阶段。他具体是如何运用到实践的许多道友感受并不深刻，甚至有的人认为这玩意儿压根没什么用。

但是在以后的开发中，并发模式将会更加的亲民，我们会越来越多的在实践中感受到它的存在。

在本次案例中，代码执行顺序上，我们会先执行路由跳转，再执行页面模块的请求任务。但是我们通过 useTransition **降低路由跳转的优先级**，让他在请求任务之后执行。

因此最终的结果是请求完成之后再跳转，我们就发现当跳转发生时，页面组件已经准备好了。那么 Loading 就可以不用出现。由于请求速度非常快，因此用户也不会感受到明显的卡顿。

在代码组织上，也非常的方便，我们并没有为了让请求先发生，就极大的调整代码逻辑结构，而是只需要让本应该先发生的任务，降低优先级，让后来的任务插队执行。

希望能够通过这案例，让道友们能 get 到并发模式的强大魅力。

> ✓
> 
> 成为 React 高手，推荐[阅读 React 哲学](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)