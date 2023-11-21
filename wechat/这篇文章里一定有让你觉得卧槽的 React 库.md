> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WUE2UrgiMRRjvGv2j-QQiA)

大家好，我是零一，今天是 React 实用小工具专场，主要为大家分享一些看到的比较有意思、提升效率的工具，大家可以按需了解使用

组件调试工具
------

写过 Vue 的读者一定用过官方提供的一个浏览器调试工具 vue-devtool[1]，它支持在浏览器中调试组件时，点击对应的按钮打开该组件对应你本地代码的文件

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1grYSLCH6fZXa7n3VngDf357PyU1PMYdbD9MUgobCV5ibxvxcCMwW4SlA/640?wx_fmt=png)

这真的非常实用，而且是 Vue 官网提供的

那 React 有没有类似的工具呢？有！今天给大家推荐两个类似的调试工具：react-dev-inspector[2]、click-to-component[3]

### react-dev-inspector

接入这个库以后，在 React 应用页面按对应的快捷键可以开启两个功能：

*   获得类似 Chrome Devtool 元素审查的能力，鼠标移入任意元素即可显示组件信息（组件名、组件对应的文件路径、元素宽高）
    
*   点击任意元素即可跳转到本地对应代码窗口
    

整体效果如下：

![](https://mmbiz.qpic.cn/mmbiz_gif/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1gqZc206HokOVvSop0AKhsgvRC5s3hBP3eUE6QaFC9TKe2WkkHdHFtrg/640?wx_fmt=gif)

而且这个工具目前已经支持了：`Vite2`、`next.js`、`create-react-app`、`umi3`

### click-to-component

顾名思义，点击后跳转到组件，跟上一个工具功能类似，不过相对而言，我可能更喜欢这个工具

`click-to-component` 同样是按快捷键开启 点击跳转 的功能，不过可以由我们来选择是跳转当前点击的这个元素还是跳转到该元素所在的组件

![](https://mmbiz.qpic.cn/mmbiz_png/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1gdXQOvjTqRBC6zbicCxlDrGY1x46aIR3gs1wenEpncb7mia3THjicOwdJQ/640?wx_fmt=png)

相比 `react-dev-inspector`，这个工具使用起来比较方便，直接在根目录引入组件即可，不用配置东西，开箱即用

```
import React from 'react';import ReactDOM from 'react-dom/client';import App from './App';import './index.css';+ import { ClickToComponent } from 'click-to-react-component';ReactDOM.createRoot(document.getElementById('root')).render(  <React.StrictMode>+ <ClickToComponent />    <App />  </React.StrictMode>);
```

看下完整的使用效果：

![](https://mmbiz.qpic.cn/mmbiz_gif/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1gfIm7AD3nOCmJPyD84qGEOgXLFrJbmmCibF1POxklk2WcdLQpqmr7zIQ/640?wx_fmt=gif)

动画工具
----

看到一个挺不错 React 动画库，是搭配 `react-router` 使用的，做的是路由跳转时，各页面之间的移出和展示动画，非常炫酷~ 很适合大家的个人项目或官网页来使用

这个库的名字叫 react-page-transition[4]，使用方式非常简单，在 router 组件外层包裹一层即可，并可以自定义设置动画

```
import React from 'react';import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';+ import { PageTransition } from '@steveeeie/react-page-transition';import './styles.css';const Links = () => (  <>    <Link to="/">Home</Link>    <Link to="/about">About</Link>  </>);const Home = props => <h1>Home</h1>;const About = props => <h1>About</h1>;export default function App() {  return (    <BrowserRouter>      <Links />      <Route        render={({ location }) => {          return (+           <PageTransition+             preset="moveToLeftFromRight"+             transitionKey={location.pathname}+           >              <Switch location={location}>                <Route exact path="/" component={Home} />                <Route exact path="/about" component={About} />              </Switch>+           </PageTransition>          );        }}      />    </BrowserRouter>  );}
```

这个库预设了很多很多很多动画（preset）供我们使用，至于有多少嘛，给大家瞅一眼：

![](https://mmbiz.qpic.cn/mmbiz_gif/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1glXCzPwOKNfAWBrJn9GSnqNKJsCA8vHu5xUc3UccQiaMgAFwibloZQnXw/640?wx_fmt=gif)preset

简单看几个炫酷的动画吧

![](https://mmbiz.qpic.cn/mmbiz_gif/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1gXJrVme6kbBDsqUNeIx8FodSxXtzDAHXib1bbS9I97kOewyhia2gVZiaYw/640?wx_fmt=gif)![](https://mmbiz.qpic.cn/mmbiz_gif/lgHVurTfTcwGJ7KQrsEoLJjGiauy9dn1gJmAXlDPa9ZK8ibibgR15sUOrsRusALibD5mt7tohn8EeBzxQsoSKJ8MSw/640?wx_fmt=gif)

还不赶紧用起来？

工具类
---

最近没看到太多好用的工具，就简单推荐一个吧，也是日常经常碰到的需求：复制文本到剪切板，我想应该没人会自己原生手写吧？毕竟兼容性那么差，大家都会选择用成熟的库，一般我们用的都是 copy-to-clipboard[5]，它是命令式编程的使用方式，然后在 React 里大家可能更习惯了声明式编程，那就可以用 react-copy-to-clipboard[6]，它也是基于 `copy-to-clipboard` 封装的

两者使用区别如下：

```
// copy-to-clipboardcopy('Text', {  debug: true,  message: 'Press #{key} to copy',});// react-copy-to-clipboard<CopyToClipboard  onCopy={this.onCopy}  text={this.state.value}>  <button onClick={this.onClick}>复制</button></CopyToClipboard>
```

最后
--

好了，今天的分享到此结束，希望能帮助到大家~

*   如果你们还有更不错的实用小工具，欢迎评论区留言，或者私聊我
    
*   你们还想了解哪些工具，也欢迎评论区留言，争取整理一波，下次分享~
    

我是零一，分享技术，不止前端！下期见~

### 参考资料

[1]

vue-devtool: https://github.com/vuejs/devtools#open-component-in-editor

[2]

react-dev-inspector: https://github.com/zthxxx/react-dev-inspector

[3]

click-to-component: https://github.com/ericclemmons/click-to-component

[4]

react-page-transition: https://github.com/Steveeeie/react-page-transition

[5]

copy-to-clipboard: https://npm.im/copy-to-clipboard

[6]

react-copy-to-clipboard: https://github.com/nkbt/react-copy-to-clipboard

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNDvxh93JHfZD80m7GhBmGicoYpnLCanxmxvpVm4ACYNms63xnCgKt1Py5rvMCEDkWebYCTpfDVBq7g/640?wx_fmt=gif)

**彦祖，亦菲，点个****「在看」**吧