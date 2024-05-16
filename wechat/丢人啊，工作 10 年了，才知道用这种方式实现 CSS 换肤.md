> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_dtELs-PzdThjzRLP88i-w)

*   **一、** React19 中 context 的具体改动
    
*   **二、** use(context) 基础介绍
    
*   **三、** 简单粗暴样式替换实现换肤
    
*   **四、** 利用 css 变量实现换肤
    

本文共 **3219** 字，阅读预计使用 5 分钟

1
-

**改动**

与之前的版本相比，在 React19 中，context 有一些细微的变化。主要体现在如下三个方面。

> !
> 
> > **一、删除 旧版 Context**
> > 
> > 旧版本的 Context 在 2018 年 10 月（v16.6.0）被废弃。但是为了保证平滑的升级，旧版代码一直沿用到了现在。在 React 19 中，这些代码会正式被删除。旧版本的 Context 仅在使用 `contextTypes` 和 `getChildContext` API 的类组件中可用。因此它的删除对现在的项目应该只会造成很小的影响。

如果你在项目中仍然使用了旧版 Context，你可以参考下面新旧版本的对比写法进行调整升级。

```
// 之前import PropTypes from 'prop-types';class Parent extends React.Component {  static childContextTypes = {    foo: PropTypes.string.isRequired,  };  getChildContext() {    return { foo: 'bar' };  }  render() {    return <Child />;  }}class Child extends React.Component {  static contextTypes = {    foo: PropTypes.string.isRequired,  };  render() {    return <div>{this.context.foo}</div>;  }}
```

```
// 之后const FooContext = React.createContext();class Parent extends React.Component {  render() {    return (      <FooContext value='bar'>        <Child />      </FooContext>    );  }}class Child extends React.Component {  static contextType = FooContext;  render() {    return <div>{this.context}</div>;  }}
```

**二、简化 Provider 的使用**

```
const Context = createContext({})
```

在以前的使用中，我们需要使用 `Context.Provider` 来包裹子组件。

```
<Context.Provider value={value}>  {props.children}</Context.Provider>
```

在 React19 中，我们可以直接使用 `Context` 来代替 Provider，从而让代表变得更加简洁。

```
<Context value={value}>  {props.children}</Context>
```

**三、可以使用 use 获取 context**

以前的版本中，在组件内部我们使用 `useContext` 来获取 context 中的状态。

```
// beforeimport { useContext } from 'react';function MyComponent() {  const theme = useContext(ThemeContext);  // ...
```

在 React19 中，我们可以直接使用 `use` 来获取

```
// afterimport { use } from 'react';function MyComponent() {  const theme = use(ThemeContext);  // ...
```

2
-

**重学一次 context**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcEzw87kgfXAicYIpfS6fIfDRJmdalx4wQib6TXYkKj7a3KN1gwCOCvK6Qaib44IFBx4mueW6pe906epQ/640?wx_fmt=png&from=appmsg)

在 React 中，props 能够帮助我们将数据层层往下传递。但是，当数据传递太多层之后，不仅代码上比较繁琐，理解上也容易混乱不清。因此，我们需要一种能够**跨越组件层级**让直达子组件的数据传递方式，这就是 context.

context 表示组件实例在运行期间能够**直接读取**的状态和内容。他记录了内存中的活跃数据。我们可以将这些数据使用 `useState` 来定义。那么，context 中的数据更改，就会驱动所有使用到该数据的 UI 发生变化。

> ✓
> 
> context 的学习主要分为如下三个部分
> 
> **一、** 如何创建 context
> 
> **二、** 顶层组件中如何传递数据
> 
> **三、** 子组件中如何获取数据

**一、如何创建 context**

我们可以使用 `createContext` 来创建 context.

```
const SomeContext = createContext(defaultValue)
```

`defaultValue` 表示默认值。他可以作为数据的兜底结果。当你无法从 `value` 中读取具体的值时，则会使用 `defaultValue` 中的值。在代码运行过程中，默认值始终保持不变。如果没有默认值，我们至少需要传入一个 `null`。

`createContext` 执行之后的返回值，就是我们需要的 `context`。

**二、如何传递 context**

返回的 context 通常是一系列组件的顶层父组件。因此，在使用时，我们通常会首先定义该顶层父组件。

```
function Provider(props) {  const value = {...}  return (    <SomeContext value={value}>      {props.children}    </SomeContext>  )}export default Provider
```

在该顶层父组件中，我们使用刚才创建的 `context` 作为父级标签，把子组件包起来。并作为渲染内容返回。

```
<SomeContext value={value}>  {props.children}</SomeContext>
```

此处的 `value` 表示我们在上下文中定义好的值。我们可以自己随意定义你想要传递给子组件的所有数据 / 方法。

> i
> 
> > > 这些数据 / 方法通常被多个不同的子组件共同使用。否则我们没必要将数据 / 方法存储在 context 中。

```
import { createContext } from 'react';const ThemeContext = createContext('light');function App() {  const [theme, setTheme] = useState('light');  // ...  return (    <ThemeContext value={theme}>      <Page />    </ThemeContext>  );}
```

此时，案例中 `Page` 组件的所有后代子组件，都可以直接获取 context 中的值，不管层级有多深。

> ✓
> 
> value 可以是任何类型，你可以根据自己的项目需要设计合适的数据类型。

**三、如何获取 context 中的值**

在任意被包裹的子组件中，我们可以使用 `use` 来获取 context 中的值。

```
function Button() {  // ✅ Recommended way  const theme = use(ThemeContext);  return <button className={theme} />;}
```

获取方法非常简单，接下来，我们使用具体的实践案例来分享 context 的使用。

> i
> 
> > > 需要注意，多个 Context **可以嵌套使用**，只是在实践中，这种场景不算多见。

3
-

**换肤方案一**

先来看一眼我们实现案例的演示效果。我们实现了部分 UI 的皮肤切换，并且记录了切换次数。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcEzw87kgfXAicYIpfS6fIfDRmkPzZWdmNJYYhYDFGfWGDHBeH2En8FAuiamZffSbqAuUO9pkBG367Bg/640?wx_fmt=gif&from=appmsg)

在文件中，为了验证 `context` 的作用，我们将组件结构设计为如下

```
+ App
  - index.jsx
  - Card.jsx
  - Setting.jsx
  - context.jsx
```

在 `context.jsx` 中，我们会创建好 context，并组织好要传递给子组件的 `value`，完整代码如下

```
import {createContext, useState} from 'react'export const Context = createContext({theme: 'dark'})export default function Provider(props) {  const [theme, setTheme] = useState('light')  const [counter, setCounter] = useState(0)  const value = {    theme,    setTheme,    counter,    setCounter  }  return (    <Context value={value}>      {props.children}    </Context>  )}
```

> i
> 
> > > 需要稍微注意观察的是，我们这里使用 **useState** 创建了数据，并将操作数据的方法一并集成在了 value 中，这样做的目的是为了确保数据的变动能触发 UI 的更新

在 `index.jsx` 中，我们使用刚才创建好的 context 组件将所有子组件包裹起来。

```
import Card from './Card'import Setting from './Setting'import Provider from './context'import './index.css'function Index() {  return (    <Provider>      <div id='tips'>切换主题，并记录切换次数</div>      <Card />      <Card />      <Setting />    </Provider>  )}export default Index
```

然后，分别在子组件中，使用 `use` 获取到组件需要的状态与方法即可。

```
// Card.jsximport {use} from 'react'import {Context} from './context'export default function Card() {  const {theme} = use(Context)  const __cls = `_06_card ${theme}`  return (    <>      <div className={__cls}>        <div class>Canary</div>        <p>The use API is currently only available in React’s Canary and experimental channels. Learn more about React’s release channels here.</p>      </div>    </>  )}
```

```
// Setting.jsximport {use} from 'react'import {Context} from './context'export default function Card() {  const {theme, counter, setTheme, setCounter} = use(Context)  const __switch = () => {    setTheme(theme == 'light' ? 'dark' : 'light')    setCounter(counter + 1)  }  return (    <div className='_06_setting'>      <button onClick={__switch}>点击切换到{theme === 'light' ? '暗黑' : '明亮'}主题</button>      <div id='tips'>已切换：{counter || 0} 次</div>    </div>  )}
```

此时，我们用于切换皮肤的方法，是将分别代码不同皮肤的 `className` 写入到每一个需要使用的元素中。虽然实现了功能，但是在真实项目中，必定会造成大量的工作量。因此这并不是一种好的思路。

```
._06_card {  margin: 20px 0;  padding: 20px;  border-radius: 10px;  transition: all 0.2s;}._06_card.light {  background-color: rgba(0, 0, 0, 0.02);  border: 1px solid rgba(0, 0, 0, 0.1);  color: rgba(0, 0, 0, 0.88);}._06_card.dark {  background-color: rgba(0, 0, 0, 0.8);  border: 1px solid rgba(0, 0, 0, 1);  color: rgba(255, 255, 255, 0.8);}._06_card .title {  font-weight: bold;  font-size: 20px;}._06_setting {  display: flex;  align-items: center;  justify-content: space-between;}
```

> !
> 
> > 除了这种方式，包括暴力重写并覆盖所有样式的方式来切换皮肤，都属于工作量很大的方案。这仅仅适合在项目设计之初没有考虑换肤功能的项目。**并不推荐**

4
-

**换肤方案二**

我们可以换一种高级一点的用法来完成皮肤的切换功能。那就是利用 **CSS 变量**。

> ✓
> 
> CSS 变量又称之为**自定义属性**。他已经在主流浏览器中被普遍支持，我们可以在许多项目中使用该特性。我们熟知的 antd 中就大量运用了自定义属性。

声明一个自定义属性，需要以 `--` 开头，属性值可以是任何有效的 CSS 值。

```
element {  --main-bg-color: brown;}
```

> i
> 
> > > 注意理解这句话：**自定义属性和其他属性一样，是写在规则集之内的。** 因此，它的改变，也能触发 transition 动画的执行

并且要注意的是，规则集所指定的选择器定义了自定义属性的可见作用域。通常的最佳实践是定义在根伪类 :root 下，这样就可以在 HTML 文档的任何地方访问到它了

```
:root {  --main-bg-color: brown;}
```

当然，我也应该根据实践运用灵活选择作用域。

在本案例中，我们把不同的主题定义在如下属性中。

```
[data-theme=dark] {  --font-color: rgba(255, 255, 255, 0.8);  --background-color:  rgba(0, 0, 0, 0.8);  --border-color: rgba(0, 0, 0, 0.1);}[data-theme=light] {  --font-color: rgba(0, 0, 0, 0.88);  --background-color:  rgba(0, 0, 0, 0.02);;  --border-color: rgba(0, 0, 0, 0.1);}
```

然后在页面元素样式的运用中，我们使用 `var()` 获取自定义属性对应的值。而不直接使用值。

```
._06_card {  background-color: var(--background-color);  border: 1px solid var(--border-color);  color: var(--font-color);}
```

这样，我们只需要通过修改父级元素的 `data-theme` 的值，就可以简单做到主题切换。

```
const __switch = () => {  let _theme = theme == 'light' ? 'dark' : 'light'  document.documentElement.setAttribute('data-theme', _theme)  setTheme(_theme)  setCounter(counter + 1)}
```

这样，一个简单易用，可维护性强的主题方案就搞定了。前端码易

> ✓
> 
> 本文将会收录至：前端码易
> 
> 要成为 React 高手，[推荐阅读 `React 哲学`](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)