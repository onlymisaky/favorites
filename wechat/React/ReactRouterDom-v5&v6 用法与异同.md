> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-mJFWayxFR9vYS6WfEYvrw)

> 本文作者系 360 奇舞团前端开发工程师

简介：
---

React Router Dom 是 React.js 中用于实现路由功能的常用库。在 React 应用中，路由可以帮助我们管理页面之间的导航和状态，并实现动态加载组件。本文将深入探讨 React Router Dom 的两个主要版本：V5 和 V6，并介绍它们的用法和异同点。

v5 用法
-----

React Router Dom 的 V5 版本是在 React Router 的基础上构建的。它是一个稳定且广泛使用的版本，为 React 应用提供了强大的路由功能。以下是 V5 版本的用法示例：

### 安装 React Router Dom：

```
npm install react-router-dom@5<br style="visibility: visible;">yarn add react-router-dom@5<br style="visibility: visible;">
```

### 导入所需组件：

```
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
```

### 在应用中定义路由：

```
<Router>  <nav>    <ul>      <li>        <Link to="/">首页</Link>      </li>      <li>        <Link to="/about">关于</Link>      </li>    </ul>  </nav>  <Route path="/" exact component={Home} />  <Route path="/about" component={About} />  </Router>
```

### 在组件中使用路由参数：

```
import { useParams } from 'react-router-dom';function User() {  let { id } = useParams();  return <h2>用户ID: {id}</h2>;}
```

*   V5 版本的 React Router Dom 提供了许多强大的功能，如嵌套路由、路由参数、重定向等。但在 V6 版本中，它们的用法可能有所不同。
    

v6 用法
-----

React Router Dom 的 V6 版本是一个全新的重写版本，旨在提供更简洁和直观的 API。以下是 V6 版本的用法示例：

### 安装 React Router Dom V6：

```
npm install react-router-dom@next
yarn add react-router-dom@next
```

### 导入所需组件：

```
import { BrowserRouter as Router, Route, Link, Routes, Outlet } from 'react-router-dom';
```

### 在应用中定义路由：

```
<Router>  <nav>    <ul>      <li>        <Link to="/">首页</Link>      </li>      <li>        <Link to="/about">关于</Link>      </li>    </ul>  </nav>  <Routes>    <Route path="/" element={<Home />} />    <Route path="/about" element={<About />} />  </Routes></Router>
```

### 在组件中使用路由参数：

```
import { useParams } from 'react-router-dom';function User() {  let { id } = useParams();  return <h2>用户ID: {id}</h2>;}
```

*   V6 版本的 React Router Dom 引入了一些新的概念，如 **Routes** 和 **Outlet**。**Routes** 用于定义路由集合，而 **Outlet** 用于在父路由组件
    

BrowserRouter 与 HashRouter
--------------------------

BrowserRouter 和 HashRouter 是 React Router Dom 中两种常用的路由器组件，它们用于在 React 应用中处理路由。

### BrowserRouter：

BrowserRouter 使用 HTML5 的 History API 来实现路由功能。它通过使用`history.pushState()`和`history.replaceState()`方法来修改浏览器的 URL，而不会引起页面的重新加载。BrowserRouter 使用基于浏览器的 URL 路径来匹配和渲染对应的组件。 使用 BrowserRouter 时，需要将所有的路由规则放置在服务端的路由配置上，以确保在刷新或直接访问某个 URL 时能够正确加载对应的组件。

### HashRouter：

HashRouter 使用 URL 的哈希部分（#）来实现路由功能。它在 URL 中添加了一个哈希路由器，并通过监听 window 对象的 hashchange 事件来响应 URL 的变化。当 URL 的哈希部分发生改变时，HashRouter 会匹配对应的路由规则并渲染相应的组件。 相对于 BrowserRouter，HashRouter 具有更广泛的兼容性，因为哈希部分的变化不会触发浏览器向服务器发起请求，而是在客户端进行处理。这对于一些需要部署在静态服务器上的应用程序非常有用。

```
import { BrowserRouter as Router, Route } from 'react-router-dom';import { HashRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router>      <Route path="/" component={Home} />      <Route path="/about" component={About} />    </Router>  );}
```

*   需要注意的是，在使用 HashRouter 时，URL 的哈希部分会被添加到应用的根路径之后，例如：**http://example.com/#/about**。这种方式可以让应用正确地响应 URL 的变化并显示对应的组件。
    
*   总结：BrowserRouter 和 HashRouter 是 React Router Dom 中两种常用的路由器组件。BrowserRouter 使用 HTML5 的 History API 实现路由功能，而 HashRouter 使用 URL 的哈希部分实现路由功能。选择使用哪种路由器取决于应用的部署环境和兼容性需求。如果应用部署在一个支持 HTML5 History API 的服务器上，可以使用 BrowserRouter；如果需要更广泛的兼容性，或者应用是一个纯静态网站，可以使用 HashRouter。
    

Router 中的重要配置
-------------

### BrowserRouter 与 homepage

在 React 应用的 package.json 文件中，可以通过设置 "homepage" 参数来指定应用的基本 URL 路径。这个基本 URL 路径会影响 React Router 中使用的路由匹配规则和导航链接的生成。 当设置了 "homepage" 参数后，React Router 的路由匹配规则和导航链接会考虑到该基本 URL 路径。它们会自动添加基本 URL 路径作为前缀，以确保路由的正确匹配和导航链接的生成。 例如，假设 "homepage" 参数设置为`"/my-app"`，以下是使用 React Router 时的一些示例：

#### BrowserRouter：

```
import { BrowserRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router>      <Route path="/" component={Home} /> {/* 匹配的路径为：/my-app/ */}      <Route path="/about" component={About} /> {/* 匹配的路径为：/my-app/about */}    </Router>  );}
```

在 BrowserRouter 中，设置了 "homepage" 参数后，路由匹配规则中的路径会自动添加基本 URL 路径作为前缀。

#### Link 组件：

```
import { Link } from 'react-router-dom';function Navigation() {  return (    <nav>      <ul>        <li>          <Link to="/">首页</Link> {/* 生成的链接为：/my-app/ */}        </li>        <li>          <Link to="/about">关于</Link> {/* 生成的链接为：/my-app/about */}        </li>      </ul>    </nav>  );}
```

*   在 Link 组件中，设置了 "homepage" 参数后，生成的导航链接会自动添加基本 URL 路径作为前缀。
    
*   总结：设置 package.json 中的 "homepage" 参数可以指定 React 应用的基本 URL 路径。这个基本 URL 路径会影响 React Router 中的路由匹配规则和导航链接的生成，确保它们考虑到基本 URL 路径作为前缀。这在部署 React 应用到不同的路径下时非常有用，可以保证路由的正确匹配和导航链接的生成。
    

### HashRouter 与 homepage

在 React Router 中，HashRouter 不受 package.json 中的 "homepage" 参数的影响。设置 "homepage" 参数只会影响 BrowserRouter 的行为，不会直接影响 HashRouter。 HashRouter 使用 URL 的哈希部分（#）来实现路由功能，不依赖于基本 URL 路径。无论是否设置了 "homepage" 参数，HashRouter 始终使用相对于根目录的哈希部分来匹配路由规则和生成导航链接。 例如，假设 "homepage" 参数设置为`"/my-app"`，以下是使用 HashRouter 时的示例：

```
import { HashRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router>      <Route path="/" component={Home} /> {/* 匹配的路径为：/#/ */}      <Route path="/about" component={About} /> {/* 匹配的路径为：/#/about */}    </Router>  );}
```

在 HashRouter 中，无论 "homepage" 参数设置为什么，路由的匹配规则和生成的导航链接仍然会使用`/#/`和`/#/about`这样的哈希部分路径。

*   总结： HashRouter 不受 package.json 中的 "homepage" 参数的影响。无论是否设置了 "homepage" 参数，HashRouter 始终使用相对于根目录的哈希部分来匹配路由规则和生成导航链接。"homepage" 参数只会影响 BrowserRouter 的行为。
    

其他参数

1.  **basename**： 可以通过在 Router 组件中设置 basename 属性来使用 basename 参数，如下所示：
    

```
import { BrowserRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router base component={Home} />      <Route path="/about" component={About} />    </Router>  );}
```

2.  **path**： 在 Route 组件中使用 path 属性来定义路由规则的路径，如下所示：
    

```
import { BrowserRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router>      <Route path="/" exact component={Home} />      <Route path="/about" component={About} />    </Router>  );}
```

3.  **exact**： 通过设置 exact 属性为 true，确保只有当 URL 路径与 path 参数完全匹配时才进行渲染，如下所示：
    

```
import { BrowserRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router>      <Route exact path="/" component={Home} />      <Route exact path="/about" component={About} />    </Router>  );}
```

4.  **strict**： 设置 strict 属性为 true，以在末尾带有斜杠的 URL 路径上进行匹配，如下所示：
    

```
import { BrowserRouter as Router, Route } from 'react-router-dom';function App() {  return (    <Router>      <Route strict path="/" component={Home} />      <Route strict path="/about/" component={About} />    </Router>  );}
```

以上示例展示了如何使用这些参数来影响路径的生成和匹配。根据具体需求，可以在相应的组件中设置这些参数来实现所需的路由配置。

引用
--

*   https://reactrouter.com/en/main/router-components/browser-router
    
*   https://www.npmjs.com/package/react-router-dom
    

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)