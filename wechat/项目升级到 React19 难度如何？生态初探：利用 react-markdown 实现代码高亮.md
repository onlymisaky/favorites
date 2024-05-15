> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/m_OrvL03XAKfbP61J-V9Qw)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXe0VSDB3B1e49iatzVxAd6F0xb25HDC5YbKF6LUXvGLMVwVwwubGdicWsQ/640?wx_fmt=png&from=appmsg)

经过前面几个实践案例的学习，我们都已经知道，React19 有非常吸引开发者的特性值得我们去升级。但是与此同时，我们也感受到了某些改动确实挺大的。因此在交流群里，大家会有一个比较明显的担忧，这种**比较大的版本更新**，是否会导致升级困难？

其实在官方文档中的升级指引中，有明确提到这个问题，**开发团队预计这些重大更改不会影响到大多数程序**。并且我们看到，react 删除的功能中，大多数都是几年前都已经标记弃用不建议大家使用的内容。

例如，class 语法中，曾经支持了字符串引用 ref。

```
// beforeclass MyComponent extends React.Component {  componentDidMount() {    this.refs.input.focus();  }  render() {    return <input ref='input' />;  }}
```

这种使用方式因为存在多个缺点，在 2018 年 3 月（V16.3.0）中被标记为不推荐使用，直到现在才明确要删除代码。调整之后，开发者需要迁移到 ref 回调函数的使用。这个也并非新功能，而是一直都支持的写法，因此开发者有充裕的时间来解决这个问题。

```
// afterclass MyComponent extends React.Component {  componentDidMount() {    this.input.focus();  }  render() {    return <input ref={input => this.input = input} />;  }}
```

又例如，React19 决定要移出 `ReactDOM.findDOMNode`，这个 API 曾经在三方库中被大量使用，但是他已经在 2018 年 10 月被标记为废弃。由于他是一个性能较差，又容易受到重构影响，因此风险会比较大。

```
// Beforeimport {findDOMNode} from 'react-dom';function AutoselectingInput() {  useEffect(() => {    const input = findDOMNode(this);    input.select()  }, []);  return <input defaultValue="Hello" />;}
```

在 React18 的版本中，提供了新的方案来替换该用法。

```
// Afterfunction AutoselectingInput() {  const ref = useRef(null);  useEffect(() => {    ref.current.select();  }, []);  return <input ref={ref} defaultValue="Hello" />}
```

当然，其他的变化还有很多，我们就不一一列举，许多破坏性变更早在 React18 中就已经存在，因此对于长期维护的三方库而言，React19 的升级压力非常小。并且为了简化升级过程，React 发布了一个过渡版本 `React 18.3`，该版本功能与 `React 18.2` 相同，但是增加了对已弃用 API 代码的删除，并且调整了相关的警告。

目前，该过渡版本已经发布了刚好半个月，但已经被开发者大规模使用了。如下图所示，这个下载量，已经大概相当于 `Vue` 的整体使用水平了，所以整个行业对于 `React19` 的升级响应非常积极。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXeZNwHD0vnHXJCHbU24r28gNe6p20Vm1sxjjVNCwIKtn7HBEFLZ9Ho4A/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXeG54jsXEdeSOTFyHN4AqQqSEVRSIJzwI8Uyp5OeFibkfPibH0A8QIeMpA/640?wx_fmt=png&from=appmsg)

与此同时，我们还可以利用 `react` 团队之前发布的一个工具用于在代码中自动替换弃用的写法，他就是 `react-codemod`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXenmV98qwPoyWyqb1FSqhyCwhwR5uzhCsEb8azW0p3GaGjFO5ocUtHaQ/640?wx_fmt=png&from=appmsg)

因此总体来说，我们应该可以轻松的在 `react19` 中应用大多数目前仍然保持维护的三方工具库。为了验证我的猜想，我在 React19 项目中引入了许多我正在使用的三方工具库来尝试。这里就以 **react-markdown** 为例，跟大家分享一下在新项目中的运用情况。

* * *

`react-markdown` 是 react 生态中，一个非常好用 的 md 文件解析工具。依据这个工具，我们可以轻松创建一个 md 编辑器。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXeeWD0Qhh5JZHXsmOYrzic0BZBrOKX6DKeNwDhEFicJOAbhksZhOl4eicvQ/640?wx_fmt=png&from=appmsg)

如果你要设计一个个人博客，并且需要展示技术类文章，这个工具可以很好帮助到你。我们这里以展示一个**高亮代码块**为目标，分享引入过程。

首先我们在项目中，引入 `react-markdown`

```
npm i react-markdown
```

有了这个之后，我们就可以在项目中解析一些简单的 md 格式。

例如，我们可以解析如下格式。

```
const input = '# This is a header\n\nAnd this is a paragraph'
```

在页面中引入 **react-markdown**

```
import Markdown from 'react-markdown'
```

然后直接在 JSX 中使用即可。

```
<Markdown>{input}</Markdown>
```

渲染结果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXeS3AYTxeDEaJUD7NqJaywKydlqdakiaryJbp00pkNtGnCgByJSlCGic9w/640?wx_fmt=png&from=appmsg)

完了之后，有一些比较复杂的格式，**react-markdown** 可以引入不同的插件来支持。

例如，**react-gfm**，可以帮助我们解析列表等格式，如下所示：

```
const text2 = `A paragraph with *emphasis* and **strong importance**.> A block quote with ~strikethrough~ and a URL: https://reactjs.org.* Lists* [ ] todo* [x] doneA table:| a | b || - | - |`
```

安装插件

```
npm i remark-gfm
```

然后直接在组件中使用即可。

```
import remarkGfm from 'remark-gfm'// jsx<Markdown remarkPlugins={[remarkGfm]}>  {text2}</Markdown>
```

渲染结果如下。由于我没有引入 css，因此样式比较原始。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXe8ibR2HK9vNwFJBnGZnEIb6kkTMQLYWL1nj29P5VsXR6KGz3QZiaygDvQ/640?wx_fmt=png&from=appmsg)

我们可以通过查看 html 标签来查看渲染结果。验证之后发现已经渲染成功。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXeW97NYkDdNaeOCwMia5K8ibcaDWnhMOUvSbY1Yo8DloWwqiaduHzateSRQ/640?wx_fmt=png&from=appmsg)

当然，如果我们要渲染代码快，也需要引入特定的插件，我这里使用了 `rehype-highlight`

```
npm i rehype-highlight
```

安装好之后，我们可以专门在 `.md` 文件中编写好 md 内容，在 vite 项目中，可以直接通过如下方式引入 `.md` 文件

```
import code from './code.md?raw'
```

然后在页面组件中使用

```
import rehypeHighlight from 'rehype-highlight'// jsx<Markdown   remarkPlugins={[remarkGfm]}   rehypePlugins={[rehypeHighlight]}>{code}</Markdown>
```

此时，我们观察页面，发现标签已经渲染好了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXep2ncibaHQUThzzfPIUPmomicoHicOia5oHeLWg6MWQicygMicJxbG7taVyicg/640?wx_fmt=png&from=appmsg)

但是此时我们还没有样式文件。当然，我们可以直接自己根据对应元素中的 class 名来写样式。

由于设计能力有限，我一般引用别人已经设计好的样式文件。

如下这个网站收集了大量的高亮风格，我们直接复制代码使用即可。

```
https://highlightjs.tiddlyhost.com
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXeEuqry72b1YK8u23czL1vibiadlhiamwicLl8neaDKRXD996GHMHtAbgXLg/640?wx_fmt=png&from=appmsg)

我选择了一个，把他单独写在一个 css 文件中，并引入对应的组件。渲染结果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcGlwzVw7gCehTiagBzSrTibXejXmquxl1LCpYN3DavOYbw1ia6pnfic80XKq6aicaRcBYUtCzFq40hzShg/640?wx_fmt=png&from=appmsg)

搞定！

end
---

**总结**

在我尝试了几个三方库之后，总体感受就是基本上都能正常在 React19 项目中使用，即使这些三方库还没有升级到 react19。当然我也把我某一个 React18 的项目升级到 React19，小幅度更改之后，也成功升级了。

因此我预计我们有希望在 react19 正式版本发布之后不久把项目正式升级。

但是，一个不太好的消息是，antd 由于使用了一些很早版本就弃用的方法，例如 `findDOMNode`，还有一些 React19 会弃用的 api, 例如 `forwardRef`，导致了 antd 一运行就各种报错。许多组件无法正常使用。这种就只能等 antd 适配进度了，他们应该会很快更新。