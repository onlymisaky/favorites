> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ao9Yxzr4Gz3nDmG5omEJhQ)

    React 团队爆料最新主版本升级 React 19 Beta（公测版）已经正式上线 npm，想要提前体验最新版本的 React 发烧友可以参考这份 React 官方博客的升级指南。

   React 19 中新增的改进需要某些破坏性更改，但预计这些变更不会影响大多数应用程序。

   在这篇 React 官方博客中，我们将科普将库升级到 React 19 beta（公测版）相关的破坏性更改。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

React 18.3 正式发布
---------------

为了辅助你更轻松地升级到 React 19，我们发布了与 React 18.2 等价的 `react@18.3` 版本，但添加了废弃 API 的相关警告，以及 React 19 所需的其他变更。

React 19 公测版是 React 19 主版本的前戏。React 发烧友请先升级到 React 18.3，然后耐心等待 React 19 稳定版，切勿操之过急，否则后果自负。

如果你想辅助我们测试 React 19，请按照这份升级指南中的步骤操作，并报告你遭遇的任何问题。

安装
--

我们现在需要新型 JSX 转换。

我们在 2020 年引入了新型 JSX 转换，改进打包体积，且在不导入 React 的情况下使用 JSX。

在 React 19 中，我们新增了其他改进，比如使用 `ref` 作为 `prop`，以及需要新型转换的 JSX 速度优化。

我们预计大多数应用程序不会受到影响，因为转换已在大多数环境中启用。

要安装最新版本的 React 和 React DOM：

```
npm install react@beta react-dom@beta


```

如果你使用 TS，你还需要更新类型。一旦 React 19 稳定发布，你就可以照常安装 `@types/react` 和 `@types/react-dom` 中的类型。

在公测期间，这些类型在不同的包中可用，这需要在你的 `package.json` 中强制升级：

```
{
  "dependencies": {
    "@types/react": "npm:types-react@beta",
    "@types/react-dom": "npm:types-react-dom@beta"
  },
  "overrides": {
    "@types/react": "npm:types-react@beta",
    "@types/react-dom": "npm:types-react-dom@beta"
  }
}


```

破坏性更改
-----

### 渲染中的错误不会重新抛出

在 React 早期版本中，渲染时抛出的错误会被捕获，且重新抛出。在开发环境中，我们还会打印到 `console.error`，导致重复的错误日志。

在 React 19 中，我们改进了错误处理方式，禁止重新抛出从而减少重复：

*   未捕获的错误：Error Boundary 未捕获的错误将报告给 `window.reportError`。
    
*   捕获的错误：Error Boundary 捕获的错误将报告给 `console.error`。
    

此更改不会影响大多数应用程序，但如果你的生产错误报告依赖重新抛出的错误，你可能需要更新错误处理。为了支持这一点，我们向 `createRoot` 和 `hydrateRoot` 添加了新方法，来进行自定义错误处理：

```
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    // ... 打印错误报告
  },
  onCaughtError: (error, errorInfo) => {
    // ... 打印错误报告
  }
})


```

### 已删除弃用的 React API

#### 已删除：函数的 `propTypes` 和 `defaultProps`

`PropTypes` 于 2017 年 4 月（React 15.5）已弃用。

在 React 19 中，我们从 React 包中删除了 `propType` 检查，并且使用它们将被静默忽略。如果你在使用 `propTypes`，我们建议迁移到 TS 或其他类型检查方案。

我们还从函数组件中删除了 `defaultProps`，使用 ES6 的默认参数代替。由于没有 ES6 替代方案，类式组件将继续支持 `defaultProps`。

```
// 切换前：
import PropTypes from 'prop-types'

function Heading({ text }) {
  return <h1>{text}</h1>
}
Heading.propTypes = {
  text: PropTypes.string
}
Heading.defaultProps = {
  text: 'Hello, world!'
}

// 切换后：
interface Props {
  text?: string
}
function Heading({ text = 'Hello, world!' }: Props) {
  return <h1>{text}</h1>
}


```

#### 已删除：使用 `contextTypes` 和 `getChildContext` 的过时 Context

过时的 Context 于 2018 年 10 月（React 16.6）已弃用。

过时的 Context 能且仅能在使用 `contextTypes` 和 `getChildContext` API 的类式组件中可用，且由于存在感低下的细微 bug 而被 `contextType` 替换。

在 React 19 中，我们删除了过时的 Context，使 React 更加短小精悍。

如果你仍在类式组件中使用过时 Context，则需要迁移到新的 `contextType` API：

```
// 切换前：
import PropTypes from 'prop-types'

class Parent extends React.Component {
  static childContextTypes = {
    foo: PropTypes.string.isRequired
  }

  getChildContext() {
    return { foo: 'bar' }
  }

  render() {
    return <Child />
  }
}

class Child extends React.Component {
  static contextTypes = {
    foo: PropTypes.string.isRequired
  }

  render() {
    return <div>{this.context.foo}</div>
  }
}

// 切换后：
const FooContext = React.createContext()

class Parent extends React.Component {
  render() {
    return (
      <FooContext value="bar">
        <Child />
      </FooContext>
    )
  }
}

class Child extends React.Component {
  static contextType = FooContext

  render() {
    return <div>{this.context}</div>
  }
}


```

#### 已删除：字符串 `ref`

字符串 `ref` 于 2018 年 3 月（React 16.3.0）已弃用。

类式组件支持字符串 `ref`，之后由于若干缺陷被 `ref` 回调函数取代。在 React 19 中，我们删除了字符串 `ref`，使 React 更简单粗暴。

如果你仍在类式组件中使用字符串 `ref`，则需要迁移到 `ref` 回调函数：

```
// 切换前：
class MyComponent extends React.Component {
  componentDidMount() {
    this.refs.input.focus()
  }

  render() {
    return <input ref="input" />
  }
}

// 切换后：
class MyComponent extends React.Component {
  componentDidMount() {
    this.input.focus()
  }

  render() {
    return <input ref={input => (this.input = input)} />
  }
}


```

粉丝请注意，为了辅助迁移，React 团队将发布一个 react-codemod，自动用 `ref` 回调函数替换字符串 `ref`。

#### 已删除：模块模式工厂

模块模式工厂于 2019 年 8 月（React 16.9）已弃用。

这种模式很少使用，且支持它会导致 React 更大更慢。在 React 19 中，我们将删除对模块模式工厂的支持，你需要迁移到常规函数：

```
// 切换前：
function FactoryComponent() {
  return {
    render() {
      return <div />
    }
  }
}

// 切换后：
function FactoryComponent() {
  return <div />
}


```

#### 已删除：`React.createFactory`

`createFactory` 于 2020 年 2 月（React 16.13）已弃用。

在 JSX 得到广泛支持之前，使用 `createFactory` 司空见惯，但如今寥寥无几，且以用 JSX 代替。

在 React 19 中，我们将删除 `createFactory`，你需要迁移到 JSX：

```
// 切换前：
import { createFactory } from 'react'

const button = createFactory('button')

// 切换后：
const button = <button />


```

#### 已删除：`react-test-renderer/shallow`

在 React 18 中，我们更新了 `react-test-renderer/shallow`，来重新导出 `react-shallow-renderer`。

在 React 19 中，我们删除了 `react-test-render/shallow` 来直接安装包：

```
npm install react-shallow-renderer --save-dev


```

```
- import ShallowRenderer from 'react-test-renderer/shallow';
+ import ShallowRenderer from 'react-shallow-renderer';


```

请重新考虑浅层渲染。

浅层渲染取决于 React 内部结构，且可能会阻止你未来的升级。我们建议将你的测试迁移到 `@testing-library/react` 或 `@testing-library/react-native`。

### 删除了已弃用的 React DOM API

#### 已删除：`react-dom/test-utils`

我们已将 `act` 从 `react-dom/test-utils` 移至 `react` 包，你可以从 `react` 导入 `act`：

```
- import {act} from 'react-dom/test-utils'
+ import {act} from 'react';


```

所有其他 `test-utils` 功能已删除。这些实用程序并不常见，且很容易依赖组件和 React 的低级实现细节。

在 React 19 中，这些函数在调用时会出错，且它们的导出将在未来版本中删除。

#### 已删除：`ReactDOM.render`

`ReactDOM.render` 已于 2022 年 3 月（React 18）弃用。

在 React 19 中，我们将删除 `ReactDOM.render`，你需要迁移到使用 `ReactDOM.createRoot`：

```
// 切换前：
import { render } from 'react-dom'
render(<App />, document.getElementById('root'))

// 切换后：
import { createRoot } from 'react-dom/client'
const root = createRoot(document.getElementById('root'))
root.render(<App />)


```

#### 已删除：`ReactDOM.hydrate`

`ReactDOM.hydrate` 已于 2022 年 3 月弃用（React 18）。

在 React 19 中，我们删除了 `ReactDOM.hydrate`，你需要迁移到使用 `ReactDOM.hydrateRoot`。

```
// 切换前：
import { hydrate } from 'react-dom'
hydrate(<App />, document.getElementById('root'))

// 切换后：
import { hydrateRoot } from 'react-dom/client'
hydrateRoot(document.getElementById('root'), <App />)


```

#### 已删除：`unmountComponentAtNode`

`ReactDOM.unmountComponentAtNode` 已于 2022 年 3 月弃用（React 18）。

在 React 19 中，你需要迁移到使用 `root.unmount()`。

```
// 切换前：
unmountComponentAtNode(document.getElementById('root'))

// 切换后：
root.unmount()


```

#### 已删除：`ReactDOM.findDOMNode`

`ReactDOM.findDOMNode` 已于 2018 年 10 月（React 16.6）弃用。

我们正在删除 `findDOMNode`，因为它是一个过时的逃生舱口，执行速度慢，重构脆弱，仅返回第一个子级元素，并且破坏了抽象级别。

你可以将 `ReactDOM.findDOMNode` 替换为 `DOM refs`：

```
// 切换前：
import { findDOMNode } from 'react-dom'

function AutoselectingInput() {
  useEffect(() => {
    const input = findDOMNode(this)
    input.select()
  }, [])

  return <input defaultValue="Hello" />
}

// 切换后：
function AutoselectingInput() {
  const ref = useRef(null)
  useEffect(() => {
    ref.current.select()
  }, [])

  return <input ref={ref} defaultValue="Hello" />
}


```

参考文献
----

1.  React：https://react.dev
    
2.  Upgrade Guide：https://react.dev/blog/2024/04/25/react-19-upgrade-guide
    
3.  React 19 Beta：https://react.dev/blog/2024/04/25/react-19
    

  

---

### 最后

  

  

如果你觉得这篇内容对你挺有启发，我想邀请你帮我个小忙：  

1.  点个「**喜欢**」或「**在看**」，让更多的人也能看到这篇内容
    
2.  我组建了个氛围非常好的前端群，里面有很多前端小伙伴，欢迎加我微信「**sherlocked_93**」拉你加群，一起交流和学习
    
3.  关注公众号「**前端下午茶**」，持续为你推送精选好文，也可以加我为好友，随时聊骚。
    

  

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

  

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

点个喜欢支持我吧，在看就更好了