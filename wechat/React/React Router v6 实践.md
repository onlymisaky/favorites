> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/VrFj7sD9ktDY8O1lWfwRAA)

React Router v6 简介  

=====================

React Router 是 React 应用程序中用于处理路由的标准库。随着版本的不断更新，React Router v6 引入了许多重要的新特性和改进。以下是 React Router v6 的一些核心功能：

**基于 Hooks 的 API**:  完全基于 React Hooks 构建。这意味着你可以在函数式组件中使用 hooks 来处理路由逻辑，使得代码更加简洁和易于理解。

**Routes 和 Route 组件**:  引入了新的 `Routes` 和 `Route` 组件。`Routes` 组件用于定义路由的集合，而 `Route` 组件用于定义单个路由。这种组件化的设计使得路由的定义更加清晰和模块化。

**静态和动态路由**: 你可以使用 `Route` 组件来定义静态路由，同时也可以通过使用路径参数（例如 `:id`）来定义动态路由。动态路由允许你根据 URL 中的参数来动态加载组件或执行其他逻辑。

**嵌套路由**: 支持嵌套路由，允许你在应用程序中创建层次结构化的路由。这使得你可以更好地组织和管理复杂的应用程序结构。

**导航**:  提供了 `Link` 和 `NavLink` 组件，用于在应用程序中进行导航。你可以使用 `Link` 组件创建超链接，而不必刷新整个页面。`NavLink` 则允许你为当前活动的链接添加样式。

**路由守卫**:  允许你通过使用 `Routes` 组件的 `element` 属性，以及在 `Route` 组件中使用 `beforeEnter` 和 `beforeLeave` 属性来添加路由守卫。这使得你可以在导航到或离开特定路由时执行一些逻辑。

**自定义路由器**: 你可以通过使用 `useRouter` hook 来访问路由器对象，并且可以自定义路由器来扩展或修改路由的行为。这为你提供了更大的灵活性，使得你可以根据应用程序的特定需求进行定制。

1. 安装
-----

首先，需要安装 `react-router-dom`：

```
npm install react-router-dom
```

或

```
yarn add react-router-dom
```

2. 基本概念
-------

React Router 提供了一些核心组件，用于定义和管理路由。

#### 2.1 BrowserRouter

`BrowserRouter` 是一个高阶组件，通常包裹在应用的根组件上。它使用 HTML5 的 history API 来保持 UI 和 URL 同步。

```
import { BrowserRouter as Router } from 'react-router-dom';function App() {  return (    <Router>      {/* 你的路由配置 */}    </Router>  );}
```

#### 2.2 Routes 和 Route

`Routes` 是 React Router v6 中新的路由声明方式，取代了 v5 中的 `Switch`。`Routes` 组件包含了多个 `Route` 组件，每个 `Route` 定义了一个路径和对应的组件。

```
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';function App() {  return (    <Router>      <Routes>        <Route path="/" element={<Home />} />        <Route path="/about" element={<About />} />        <Route path="/contact" element={<Contact />} />      </Routes>    </Router>  );}
```

#### 2.3 动态路由

你可以使用动态路由来处理路径参数。例如，处理用户的详细信息页面：

```
import { Routes, Route, useParams } from 'react-router-dom';function User() {  const { userId } = useParams();  return <div>User ID: {userId}</div>;}function App() {  return (    <Router>      <Routes>        <Route path="/user/:userId" element={<User />} />      </Routes>    </Router>  );}
```

#### 2.4 嵌套路由

React Router v6 支持更简洁的嵌套路由声明：

```
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';function App() {  return (    <Router>      <Routes>        <Route path="/" element={<Layout />}>          <Route index element={<Home />} />          <Route path="about" element={<About />} />          <Route path="contact" element={<Contact />} />        </Route>      </Routes>    </Router>  );}function Layout() {  return (    <div>      <h1>My Website</h1>      <Outlet /> {/* 嵌套路由将在这里渲染 */}    </div>  );}
```

#### 2.5 路径参数和查询参数

路径参数和查询参数的处理在 v6 中变得更加直观和简洁：

```
import { useParams } from 'react-router-dom';function UserProfile() {  let { userId } = useParams();  return <div>User ID: {userId}</div>;}// 路由声明<Route path="/user/:userId" element={<UserProfile />} />
```

3. 导航
-----

#### 3.1 Link 和 NavLink

`Link` 用于导航，而 `NavLink` 可以用于高亮当前选中的链接：

```
import { Link, NavLink } from 'react-router-dom';function Navigation() {  return (    <nav>      <Link to="/">Home</Link>      <NavLink to="/about" activeClass>Contact</NavLink>    </nav>  );}
```

#### 3.2 useNavigate

`useNavigate` 是一个新的 hook，用于编程式导航：

```
import { useNavigate } from 'react-router-dom';function Home() {  let navigate = useNavigate();  return (    <button onClick={() => navigate('/about')}>Go to About</button>  );}
```

4. 保护路由
-------

可以通过高阶组件或自定义钩子来保护某些路由：

```
import { Navigate } from 'react-router-dom';function PrivateRoute({ children }) {  let auth = useAuth();  return auth ? children : <Navigate to="/login" />;}// 使用 PrivateRoute 组件<Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
```

5. 代码拆分
-------

React Router v6 支持代码拆分，结合 React 的 `lazy` 和 `Suspense` 可以实现按需加载：

```
import { lazy, Suspense } from 'react';import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';const Home = lazy(() => import('./Home'));const About = lazy(() => import('./About'));const Contact = lazy(() => import('./Contact'));function App() {  return (    <Router>      <Suspense fallback={<div>Loading...</div>}>        <Routes>          <Route path="/" element={<Home />} />          <Route path="/about" element={<About />} />          <Route path="/contact" element={<Contact />} />        </Routes>      </Suspense>    </Router>  );}
```

6. 路由表
------

使用数组类型的路由表动态生成路由。这种方法使得添加、删除或修改路由变得更加灵活和易于管理。

### 6.1 创建路由表数组

**routes.js**

```
import Home from './Home';import About from './About';import Contact from './Contact';const routes = [  {    path: '/',    component: Home,    name: 'Home',  },  {    path: '/about',    component: About,    name: 'About',  },  {    path: '/contact',    component: Contact,    name: 'Contact',  },];export default routes;
```

### 6.2 在应用中使用路由表数组

将路由表数组用于动态生成路由。

**App.js**

```
import React from 'react';import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';import routes from './routes';function App() {  return (    <Router>      <Routes>        {routes.map((route, index) => (          <Route            key={index}            path={route.path}            element={<route.component />}          />        ))}      </Routes>    </Router>  );}export default App;
```

7. 示例
-----

下面是一个完整的例子，演示如何使用 React Router v6 构建一个简单的 React 应用程序，包括主页、关于页、用户页面以及嵌套路由。

### 项目结构

```
my-app/|-- public/|   |-- index.html|-- src/|   |-- components/|   |   |-- Layout.js|   |   |-- Home.js|   |   |-- About.js|   |   |-- Contact.js|   |   |-- User.js|   |-- App.js|   |-- index.js|-- package.json
```

### 7.1 安装依赖

首先，确保你已经安装了 `react` 和 `react-router-dom`：

```
npm install react react-dom react-router-dom
```

### 7.2 编写组件

**src/components/Layout.js**

```
import React from 'react';import { Link, Outlet } from 'react-router-dom';function Layout() {  return (    <div>      <nav>        <ul>          <li>            <Link to="/">Home</Link>          </li>          <li>            <Link to="/about">About</Link>          </li>          <li>            <Link to="/contact">Contact</Link>          </li>          <li>            <Link to="/user/1">User 1</Link>          </li>        </ul>      </nav>      <hr />      <Outlet />    </div>  );}export default Layout;
```

**src/components/Home.js**

```
import React from 'react';function Home() {  return <h2>Home Page</h2>;}export default Home;
```

**src/components/About.js**

```
import React from 'react';function About() {  return <h2>About Page</h2>;}export default About;
```

**src/components/Contact.js**

```
import React from 'react';function Contact() {  return <h2>Contact Page</h2>;}export default Contact;
```

**src/components/User.js**

```
import React from 'react';import { useParams } from 'react-router-dom';function User() {  let { userId } = useParams();  return <h2>User ID: {userId}</h2>;}export default User;
```

### 7.3 设置路由

**src/App.js**

```
import React from 'react';import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';import Layout from './components/Layout';import Home from './components/Home';import About from './components/About';import Contact from './components/Contact';import User from './components/User';function App() {  return (    <Router>      <Routes>        <Route path="/" element={<Layout />}>          <Route index element={<Home />} />          <Route path="about" element={<About />} />          <Route path="contact" element={<Contact />} />          <Route path="user/:userId" element={<User />} />        </Route>      </Routes>    </Router>  );}export default App;
```

### 7.4 入口文件

**src/index.js**

```
import React from 'react';import ReactDOM from 'react-dom';import App from './App';ReactDOM.render(  <React.StrictMode>    <App />  </React.StrictMode>,  document.getElementById('root'));
```

### 7.5HTML 模板

**public/index.html**

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta ></div></body></html>
```

### 7.6 运行应用

确保在项目根目录下运行：

```
npm start
```

总结
--

React Router v6 提供了更简洁、功能更强大的路由管理方式。通过新的 `Routes` 和 `Route` 组件、嵌套路由、路径参数、导航和代码拆分等特性，开发者可以更方便地构建复杂的 React 应用程序。

- END -

**如果您关注前端 + AI 相关领域可以扫码加群交流**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEBLSkUhpVsteZCibcxiat9fibuN49MnoQjy24GfX1yumLTdmKuXgGFKzKO64nW15Hpm55eUyAmSiaHZbQ/640?wx_fmt=jpeg&from=appmsg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1&tp=webp)