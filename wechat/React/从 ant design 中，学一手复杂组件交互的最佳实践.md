> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sI-sXffVcc9JPcu8JgN0jQ)

> React 知命境第 44 篇，原创第 158 篇

我们在学习的时候遇到的 Demo 经常都是比较简单的，但是一旦到了实践工作中，数据和功能就开始变得复杂了。这个时候许多小伙伴就不知道咋处理了，他可能会把组件写的非常庞大。不利于维护

我们可以在 antd 中，学习一手最佳实践，如何把复杂的组件转化为简单的组件。

例如我们有这样一个复杂交互需求。这是一个树结构与输入框结合的交互逻辑 Input + Tree

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFwIwVpdL9BD6comyiaTnJiaUXUKm2j83jTJPMfdLBtFomPyU3n7MjibFTQFnHELFxAFic6ickJVPwIZ7w/640?wx_fmt=png&from=appmsg)

在 antd 中，这样的交互被封装成为了一个单独的子组件 `TreeSelect`。他的妙处就在于，当我们使用该组件时，不需要关注内部的复杂逻辑到底是如何处理的

我们只需要关心的问题有三个，第一，Input 和 Tree 结构需要的初始化数据

```
<TreeSelect   treeData={treeData}  defaultValue={}  placeholder="Please select"/>
```

`placeholder` 表示没有任何选中数据时，Input 中的提示信息。可以在组件内部给一个通用默认值，这样在大多数情况就不需要显示的传入了

第二，Input 受控属性 `value`。

```
<TreeSelect   treeData={treeData}  value={}/>
```

第三，当内部有操作变化，并且需要告知外部时，所需要执行的钩子函数 `onChange`

```
<TreeSelect   treeData={treeData}  onChange={}/>
```

> **很多时候，我们并不需要受控属性 `value`** 。这是许多人在使用时可能会不太理解的地方。受控属性的目的是用于在父组件去控制 `TreeSelect` 的显示。但是其实我们可能只是需要从 onChange 中获取到当前选中的结果，然后将这个结果整合到接口参数中去提交表单。只有当 `TreeSelect` 中的交互结果，会影响到其他外部组件时，我们才会考虑使用受控组件。

因此，在使用时，我们需要考虑的是，利用 `defaultValue` 或者 `value` 去回显组件在初始化时的数据。

然后利用 onChange 获取得到最新的值即可。

这里比较有意思的是，当我们把目标关注到 Input 组件时，发现 Input 组件的核心属性也是这几个 `defalutValue`/`value`/`onChange`

而 tree 组件的核心属性，也是这几个 `defalutValue`/`value`/`onChange`

因此，我们可以基于这种思路，去封装复杂业务组件，让其使用起来变得非常简单。

例如，我们有一个配置项名为被选中的学员。在页面上我们使用一个列表来暂时选中结果列表。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcFwIwVpdL9BD6comyiaTnJiaU1Tj2fjoPia9dCqfzbb9Hygvgibk8OWnrolnm4D5qjlL5p9U8rVlyqic6w/640?wx_fmt=png&from=appmsg)

在该结果展示列表中，可以删除项。

当需要重新选中时，需要点开一个弹窗，然后弹窗中有一个完整的人员分页列表。

> 大家可以脑补一下

我们可以把这一部分统一封装成一个 TreeSelect 那样的组件，命名为 `PersonnelSelector`，其中包括：展示结果的列表组件、弹窗组件、弹窗中的分页列表组件

对于内部而言，构成非常的复杂

但是对于外部而言，他的构成就非常简单，我们只需要通过 `value/defaultValue` 回显数据，并且通过 `onChange` 获取操作之后的最新选中值即可。

```
<PersonnelSelector 
  value={[{}, {}, {}]}
  onChange={}
/>
```

PersonnelSelector 就是我们封装的业务组件

```
// 简化版代码function PersonnelSelector() {  const [selected, setSelected] = useState([])  const [open, setOpen] = useState(false)  const {list} = usePagination(api)  return (    <>      <Table dataSource={selected} />      <Modal show={open}>        <Table dataSource={list} />      </Modal>    </>  )}
```

0
-

**总结**

这是一种合理抽离子组件的方式，在复杂页面的交互中非常有用。把局部交互逻辑单独隔离到子组件中去，而不需要在父组件中去维护弹窗组件等逻辑的状态，从而让页面组件的代码保持简洁。