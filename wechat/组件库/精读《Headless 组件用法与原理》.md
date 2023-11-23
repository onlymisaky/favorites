> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-PSUUDk0JtYRYH7g0viTZg)

Headless 组件即无 UI 组件，框架仅提供逻辑，UI 交给业务实现。这样带来的好处是业务有极大的 UI 自定义空间，而对框架来说，只考虑逻辑可以让自己更轻松的覆盖更多场景，满足更多开发者不同的诉求。

我们以 headlessui-tabs 为例看看它的用法，并读一读 源码。

概述
--

headless tabs 最简单的用法如下：

```
import { Tab } from "@headlessui/react";function MyTabs() {  return (    <Tab.Group>      <Tab.List>        <Tab>Tab 1</Tab>        <Tab>Tab 2</Tab>        <Tab>Tab 3</Tab>      </Tab.List>      <Tab.Panels>        <Tab.Panel>Content 1</Tab.Panel>        <Tab.Panel>Content 2</Tab.Panel>        <Tab.Panel>Content 3</Tab.Panel>      </Tab.Panels>    </Tab.Group>  );}
```

以上代码没有做任何逻辑定制，只用 `Tab` 及其提供的标签把 tabs 的结构描述出来，此时框架能提供最基础的 tabs 切换特性，即按照顺序，点击 `Tab` 时切换内容到对应的 `Tab.Panel`。

此时没有任何额外的 UI 样式，甚至连 `Tab` 选中态都没有，如果需要进一步定制，需要用框架提供的 RenderProps 能力拿到状态后做业务层的定制，比如选中态：

```
<Tab as={Fragment}>  {({ selected }) => (    <button      className={selected ? "bg-blue-500 text-white" : "bg-white text-black"}    >      Tab 1    </button>  )}</Tab>
```

要实现选中态就要自定义 UI，如果使用 RenderProps 拓展，那么 `Tab` 就不应该提供任何 UI，所以 `as={Fragment}` 就表示该节点作为一个逻辑节点而非 UI 节点（不产生 dom 节点）。

类似的，框架将 tabs 组件拆分为 Tab 标题区域 `Tab` 与 Tab 内容区域 `Tab.Panel`，每个部分都可以用 RenderProps 定制，而框架早已根据业务逻辑规定好了每个部分可以做哪些逻辑拓展，比如 `Tab` 就提供了 `selected` 参数告知当前 Tab 是否处于选中态，业务就可以根据它对 UI 进行高亮处理，而框架并不包含如何做高亮的处理，因此才体现出该 tabs 组件的拓展性，但响应的业务开发成本也较高。

Headless 的拓展性可以拿一个场景举例：如果业务侧要定制 Tab 标题，我们可以将 `Tab.List` 包裹在一个更大的标题容器内，在任意位置添加标题 jsx，而不会破坏原本的 tabs 逻辑，然后将这个组件作为业务通用组件即可。

再看更多的配置参数：

控制某个 Tab 是否可编辑：

```
<Tab disabled>Tab 2</Tab>
```

Tab 切换是否为手动按 `Enter` 或 `Space` 键：

```
<Tab.Group manual>
```

默认激活 Tab：

```
<Tab.Group defaultIndex={1}>
```

监听激活 Tab 变化：

```
<Tab.Group  onChange={(index) => {    console.log('Changed selected tab to:', index)  }}>
```

受控模式：

```
<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
```

用法就介绍到这里。

精读
--

由此可见，Headless 组件在 React 场景更多使用 RenderProps 的方式提供 UI 拓展能力，因为 RenderProps 既可以自定义 UI 元素，又可以拿到当前上下文的状态，天然适合对 UI 的自定义。

还有一些 Headless 框架如 TanStack table 还提供了 Hooks 模式，如：

```
const table = useReactTable(options)return <table {table.getTableProps()}></table>
```

Hooks 模式的好处是没有 RenderProps 那么多层回调，代码层级看起来舒服很多，而且 Hooks 模式在其他框架也逐渐被支持，使组件库跨框架适配的成本比较低。但 Hooks 模式在 React 场景下会引发不必要的全局 ReRender，相比之下，RenderProps 只会将重渲染限定在回调函数内部，在性能上 RenderProps 更优。

分析的差不多，我们看看 headlessui-tabs 的 源码。

首先组件要封装的好，一定要把内部组件通信问题给解决了，即为什么包裹了 `Tab.Group` 后，`Tab` 与 `Tab.Panel` 就可以产生联动？它们一定要访问共同的上下文数据。答案就是 Context：

首先在 `Tab.Group` 利用 `ContextProvider` 包裹一层上下文容器，并封装一个 Hook 从该容器提取数据：

```
// 导出的别名就叫 Tab.Groupconst Tabs = () => {  return (    <TabsDataContext.Provider value={tabsData}>      {render({        ourProps,        theirProps,        slot,        defaultTag: DEFAULT_TABS_TAG,        name: "Tabs",      })}    </TabsDataContext.Provider>  );};// 提取数据方法function useData(component: string) {  let context = useContext(TabsDataContext);  if (context === null) {    let err = new Error(      `<${component} /> is missing a parent <Tab.Group /> component.`    );    if (Error.captureStackTrace) Error.captureStackTrace(err, useData);    throw err;  }  return context;}
```

所有子组件如 `Tab`、`Tab.Panel`、`Tab.List` 都从 `useData` 获取数据，而这些数据都可以从当前最近的 `Tab.Group` 上下文获取，所以多个 tabs 之间数据可以相互隔离。

另一个重点就是 RenderProps 的实现。其实早在 75. 精读《Epitath 源码 - renderProps 新用法》 我们就讲过 RenderProps 的实现方式，今天我们来看一下 headlessui 的封装吧。

核心代码精简后如下：

```
function _render<TTag extends ElementType, TSlot>(  props: Props<TTag, TSlot> & { ref?: unknown },  slot: TSlot = {} as TSlot,  tag: ElementType,  name: string) {  let {    as: Component = tag,    children,    refName = 'ref',    ...rest  } = omit(props, ['unmount', 'static'])  let resolvedChildren = (typeof children === 'function' ? children(slot) : children) as    | ReactElement    | ReactElement[]  if (Component === Fragment) {    return cloneElement(      resolvedChildren,      Object.assign(        {},        // Filter out undefined values so that they don't override the existing values        mergeProps(resolvedChildren.props, compact(omit(rest, ['ref']))),        dataAttributes,        refRelatedProps,        mergeRefs((resolvedChildren as any).ref, refRelatedProps.ref)      )    )  }  return createElement(    Component,    Object.assign(      {},      omit(rest, ['ref']),      Component !== Fragment && refRelatedProps,      Component !== Fragment && dataAttributes    ),    resolvedChildren  )}
```

首先为了支持 Fragment 模式，所以当制定 `as={Fragment}` 时，就直接把 `resolvedChildren` 作为子元素，否则自己就作为 dom 载体 `createElement(Component, ..., resolvedChildren)` 来渲染。

而体现 RenderProps 的点就在于 `resolvedChildren` 处理的这段：

```
let resolvedChildren =  typeof children === "function" ? children(slot) : children;
```

如果 `children` 是函数类型，就把它当做函数执行并传入上下文（此处为 `slot`），返回值是 JSX 元素，这就是 RenderProps 的本质。

再看上面 `Tab.Group` 的用法：

```
render({  ourProps,  theirProps,  slot,  defaultTag: DEFAULT_TABS_TAG,  name: "Tabs",});
```

其中 `slot` 就是当前 RenderProps 能拿到的上下文，比如在 `Tab.Group` 中就提供 `selectedIndex`，在 `Tab` 就提供 `selected` 等等，在不同的 RenderProps 位置提供便捷的上下文，对用户使用比较友好是比较关键的。

比如 `Tab` 内已知该 `Tab` 的 `index` 与 `selectedIndex`，那么给用户提供一个组合变量 `selected` 就可能比分别提供这两个变量更方便。

总结
--

我们总结一下 Headless 的设计与使用思路。

作为框架作者，首先要分析这个组件的业务功能，并抽象出应该拆分为哪些 UI 模块，并利用 RenderProps 将这些 UI 模块以 UI 无关方式提供，并精心设计每个 UI 模块提供的状态。

作为使用者，了解这些组件分别支持哪些模块，各模块提供了哪些状态，并根据这些状态实现对应的 UI 组件，响应这些状态的变化。由于最复杂的状态逻辑已经被框架内置，所以对于 UI 状态多样的业务甚至可以每个组件重写一遍 UI 样式，对于样式稳定的场景，业务也可以按照 Headless + UI 作为整体封装出包含 UI 的组件，提供给各业务场景调用。

> 讨论地址是：精读《Headless 组件用法与原理》· Issue #444 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

![](https://mmbiz.qpic.cn/mmbiz_jpg/x0iannhWUodmaAoOiaicJ0rJgemicwdyuqvy3xHovt6fFZVicbrQHp3AkKVchlgicBGibDpAeibmFdwWpLBeZKrg1u7ic8A/640?wx_fmt=jpeg)

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）