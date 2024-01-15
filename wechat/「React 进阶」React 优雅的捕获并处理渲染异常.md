> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/rAd5CATbweLujHq1Fws5Nw)

一 前言
----

哈喽，大家好，我是 alien, 今天来聊一聊在 React 应用中，如何发现异常并处理异常的。

**JSX 是优势也是劣势？**

在 React 中，出现一次渲染异常的后果是很严重的。比如如下的场景:

```
function Comp({ data }){  return <div>{ data.value }</div>}/* 页面 */export default function App(){  return <div>     <div>hello</div>     <Comp  data={{value:'hello world'}} />     <Comp  data={{value:'前端跨端开发指南'}} />     <Comp  data={null} />  </div>}
```

如上，在第三个 Comp 组件渲染的时候，因为 data 传入的值是 null ，而在渲染阶段读取了 data 下面的属性，这个时候就会报空指针的错误：`Cannot read properties of null` , 结果就是整个页面都白屏。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8GEmzIAkvJmXG2xdkQhByMz7u2KInxicNXBYdlXzhicpzhvapeicb76Ddg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8RmSVhEkZpvtkzvwFCOujLq2T2Ne4PfHNYnEhsWXH8ic5OOKmZC8bLfw/640?wx_fmt=png&from=appmsg)

这样后果是严重的，所以 React 中要特别注意渲染数据的规范与严谨。

这个问题本质上和 React 采用 JSX 语法而并非渲染模版有一定的关系。JSX 给 React 带来很便利的开发体验，开发者可以借助 JSX 灵活使用组合模式，render props 模式，Hoc 等各种设计模式，JSX 给开发者带来了很大的发挥空间，但是凡事都有两面性。JSX 的灵活性也带来一定的潜在风险。

React jsx 在编译阶段，会被 babel 变成 React.Element 的形式，它的执行是在 React 整个渲染的 render 阶段执行的，如果 React.Element 出现了空指针等异常，那么就会中断 render 阶段的执行，当然也不会执行渲染真实 DOM 的 commit 阶段。所以如果是初次渲染，任何渲染动作也就不会执行，最终呈现给我们的视图就是白屏。

那么如何处理这个问题呢？

二 渲染异常处理
--------

**componentDidCatch**

还好 React 中提供了 componentDidCatch 或者 getDerivedStateFromError 生命周期，去挽救由于渲染阶段出现问题造成 UI 界面无法显示的情况。我们以 componentDidCatch 为例子，看一下它是如何处理的异常。

componentDidCatch 是 React 类组件的生命周期，它接受两个参数：

1 error —— 抛出的错误。2 info —— 带有 componentStack key 的对象，其中包含有关组件引发错误的栈信息。先来打印一下，生命周期 componentDidCatch 参数长什么样子。

那么 componentDidCatch 中可以再次触发 setState，来降级 UI 渲染，componentDidCatch 会在 commit 阶段被调用，因此允许执行副作用。我们给上面的例子用类组件和 componentDidCatch 改造，如下：

```
function Comp({ data }){  return <div>{ data.value }</div>}class CompSafe extends React.Component{  state = {    isError:false  }  componentDidCatch(){    this.setState({ isError:true })  }  render(){    const { isError } = this.state    return isError ? null : <Comp {...this.props} />  }}export default function App(){  return <div>     <div>hello</div>     <CompSafe  data={{value:'hello world'}} />     <CompSafe  data={{value:'前端跨端开发指南'}} />     <CompSafe  data={null} />  </div>}
```

如上，我们将 Comp 组件包装一层，通过 CompSafe 包裹，然后 CompSafe 内容通过 componentDidCatch 来捕获异常，这样就可以将渲染异常产生的影响，由页面维护，降低到了组件维度。其他部分的视图也能够正常渲染了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8Zlkc4OHo7fIQb0wQCuWGKJUJ7717b7Z7e3L1TjMSruBYMH5Js87L4A/640?wx_fmt=png&from=appmsg)

但是这样同样暴露出一个问题。就是我们把所有的组件，都像 Comp 一样，在配套一个渲染异常的组件 CompSafe, 那样是不切实际的，所以我们需要一个通用能力，这样就需要一个渲染异常的高级组件来解决。

hoc 高阶组件模式也是 React 比较常用的一种包装强化模式之一，高阶函数是接收一个函数，返回一个函数，而所谓高阶组件，就是接收一个组件，返回一个组件，返回的组件是根据需要对原始组件的强化。

**HOC 助力渲染异常组件**

我们接下来编写一个通用高阶组件，解决渲染异常。

```
function SafeCompHoc(Comp) {  return class CompSafe extends React.Component{    state = {      isError:false    }    componentDidCatch(){      this.setState({ isError:true })    }    render(){      const { isError } = this.state      return isError ? <div>渲染异常</div> : <Comp {...this.props} />    }  }}const CompSafe = SafeCompHoc(Comp)export default function App(){  return <div>     <div>hello</div>     <CompSafe  data={{value:'hello world'}} />     <CompSafe  data={{value:'前端跨端开发指南'}} />     <CompSafe  data={null} />  </div>}
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8mI6c1DWvoQ8ZQGMiblXTzjQNcuU2pcwrbAmUSqRbBKW5IRto2dG1UBQ/640?wx_fmt=png&from=appmsg)

如上，经过 SafeCompHoc 包装之后的，可以批量处理渲染异常的组件，可能出现渲染异常的核心组件，就可以用 SafeCompHoc 统一处理了。

三 渲染异常监控
--------

**渲染监控：**

如上通过 HOC 的方式做到了渲染降级，但是如果只做到监控级别，那是远远不够的，我们要做的就是，发现问题，去根本解决问题，这种渲染问题大概率可能是渲染数据结构出现了问题，而数据结构大概率又是后端返回的，所以这个异常本质上很可能是服务端出了问题。

这个时候，**发现问题**也是非常重要的, 那么就需要一个渲染的监控方法。接下来我们将用 **context 上下文 + 插槽**的方案来实现一个渲染模版监控方案。

**渲染插槽 + context 上下文**

技术方案：核心技术实现：context + 插桩组件

*   首先，我们用 context 保存一个记录模版状态的方法集合。在页面初始化之后, 接下来会请求数据，在请求数据之后，页面会循环渲染子组件列表，在渲染之前，记录每一个 API 返回的模版，每一个模版需要有一个唯一标识。
    
*   每一个渲染模版里面有一个插桩组件，插桩组件在每一个模版下部，确保组件正常渲染，插桩组件一定会渲染。插桩组件的生命周期 componentDidMount 或者 useLayoutEffect 里面，触发事件给最上层组件，并上报该模版的唯一标识。
    
*   根组件在完成首次渲染之后，通过短暂的延时后，对比渲染列表里面的每一个模版的标识，是否均备插桩组件上报，如果有个别组件的标识没有上报，则认为是该组件渲染异常。如果有子组件发生渲染异常，上报该子组件的渲染数据。方便查询问题。
    

原理图：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8Ric5W2O4ibdtWPaj5uBY7EAcgYLmMtVg5PE8K6U2xRKKib7VSYNqZMD1A/640?wx_fmt=png&from=appmsg)2.png

介绍完原理来看一下代码的实现：

渲染插桩组件：

```
import React from 'react'/* 上下文保存渲染异常状态 */export const RenderErrorContext = React.createContext()/* 渲染插桩组件 */export default function RenderErrorComponent({renderKey}){    const { setRenderKey } = React.useContext(RenderErrorContext)    React.useLayoutEffect(()=>{        /* 渲染正常，上报渲染 key */        setRenderKey && setRenderKey(renderKey)    },[])    return <React.Fragment />}
```

如上编写的渲染插桩组件 `RenderErrorComponent` 和渲染状态上下文 `RenderErrorContext` ，如果渲染插桩组件正常渲染，那么说明当前组件没有出现渲染异常，接下来需要在 `useLayoutEffect` 钩子函数里面，上传渲染成功状态。

接下来看一下使用渲染上下文的页面组件。

```
import React, { useEffect } from 'react'import { RenderErrorContext } from './renderError'import Comp from './component/comp1'/* 模拟的渲染数据 */const renderList = [  {    id:1,    data: {      value:'我不是外星人'    },  },  {    id:2,    data: {      value:'大前端跨端开发指南'    },  },  { /* 异常数据 */    id:3,    data: null  }]function App() {  const [list,setList] = React.useState([])  const renderState = React.useRef({    errorList:[],    setRenderKey(id){  //如果渲染成功了，那么将当前 key 移除      const index = renderState.current.errorList.indexOf(id)       renderState.current.errorList.splice(index,1)    },    getRenderKey(key){ //这里表示渲染了哪些组件      renderState.current.errorList.push(key)    }  })  useEffect(()=>{      /* 记录每一个待渲染的模版 */      renderList.forEach(item => renderState.current.getRenderKey(item.id))      setList(renderList)      /*  验证模版是否正常渲染，如果 errorList 不为空，那么有渲染异常的组件，里面的 item 就是渲染异常的 id */      setTimeout(()=>{        console.log('errorList',renderState.current.errorList)      })  },[])  return (    <RenderErrorContext.Provider value={renderState.current}>        { list.map(item=><Comp data={item.data} id={item.id}  key={item.id} />) }    </RenderErrorContext.Provider>  );}export default App;
```

如上就是页面组件的使用，这里重点介绍一下每一个环节：

*   首先，用 ref 保存渲染状态 renderState，是一个对象，在对象里面一定要有 setRenderKey 方法，提供给插槽组件使用。最终将渲染状态传递给 RenderErrorContext 的 Provider 中，接下来每一个需要监控的下游组件都可以回传渲染状态了。
    
*   在 useEffect 模拟请求数据，然后根据数据，记录下来待渲染的 id，通过 getRenderKey 将 id 放入到数组中。
    
*   接下来当插桩组件正常渲染，那么会回传状态，证明渲染成功了，那么将此渲染 id 从数组中移除。
    
*   接下来用 setTimeout 验证模版是否正常渲染，如果 errorList 不为空，那么有渲染异常的组件，里面的 item 就是渲染异常的 id 。
    
*   在渲染列表中，我们模拟一条异常数据，就是第三条，data 为 null。
    

接下来看一下渲染插桩组件的使用：

```
import React from 'react'import RenderErrorComponent from '../renderError'function Comp({ data, id }){    return <div>         <div>{ data.value } </div>        <RenderErrorComponent renderKey={id} />    </div>}function ErrorHandle (Component){    return class Wrap extends  React.Component{        state = {            isError:false        }        componentDidCatch(){            this.setState({isError : true })        }        render(){           const { isError } = this.state           return  isError ? null : <Component {...this.props}  />        }    }}export default ErrorHandle(Comp)
```

如上当渲染 Comp 组件的时候，如果 data 为 null, 那么肯定会报出渲染异常，这个时候页面都不会正常显示，为了能够让页面正常展示，我们用一个错误处理组件 ErrorHandle 来防止白屏情况发生。

看一下效果：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8bBh49QZ21enTDw7LiaicnQep0xIUlYzAPBxOUFaLujjLAMX9CKyON0iaQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/2KticQlBJtdyz4zxlK9FmIIqb56of3wS8QAGeliaT5BqADqic4RzdFfzUiaJy7MiaMHgOzuVSboZoLMdiax98c1UVI1A/640?wx_fmt=png&from=appmsg)4.png

如上页面能够正常渲染，从渲染异常列表里，能够查询到渲染异常的组件 id=3, 预期达成。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)