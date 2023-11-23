> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/u-a0CG5N0jH6vWkHGdSciA)

在设计好画布与组件数据流体系后，理论上主体功能已经完成，但缺乏方便易用的 API，所以还需要内置一些状态与方法。

但是内置状态与方法必须寻求业务的最大公约数，极具抽象性，添加需慎重。

接下来我们从必须有与建议有的角度，看看一个可视化搭建需要内置哪些 API。

状态
--

状态是可变的，引用方式有如下两种。

第一种在任意 React 组件内通过 `useDesigner` 访问，当状态变化时会触发所在组件重渲染：

```
const { componentTree } = useDesigner((state) => ({  componentTree: state.componentTree,}));
```

第二种在任意组件元信息内通过 `selector` 访问，当状态变化时会触发不同行为，比如在 `runtimeProps` 会触发组件重渲染，在 `fetcher` 会触发重新查询：

```
const tableMeta = {  /** ... */  runtimeProps: ({ selector }) => {    const { componentTree } = selector(({ state }) => ({      componentTree: state.componentTree,    }));    return { componentTree };  },};
```

### componentTree

*   评价：必须有
    
*   类型：`ComponentInstance`
    

描述完整组件树 JSON 结构。在非受控模式下，组件树就存储在 `<Designer />` 实例内部，而受控模式下，组件树存储在外部状态。

但我们允许这两种模式都可以访问此状态，这样在开发可视化搭建应用的过程中，就不用关心受控或非受控模式了，即一套代码同时兼容受控与非受控模式。

### selectedComponentIds

*   评价：建议有
    
*   类型：`string[]`
    

定义当前选中组件实例 id 列表。

虽然这个状态业务也可以定义，但选中组件在可视化搭建是一种常见行为，以后定义插件、自定义组件也许都会读取当前选中的组件，如果框架定义了此通用 key，那么插件和自定义组件就可无缝结合到任意业务代码里。反之如果在业务层定义该状态，插件或者自定义组件也不知道如何标准的读取到当前选中的组件。

### canUndo, canRedo

*   评价：建议有
    
*   类型：`boolean`
    

描述当前状态是否能撤销或重做。

该状态需要结合内置方法 `undo()` `redo()` 一起提供，属于 “有了更好” 的状态。但有时候也会产生困扰，比如你的应用分了多个 sheet，每个 sheet 内是一个画布实例，而你希望撤销重做可以跨 sheet，那就不适合用单实例提供的方法了。

方法
--

状态引用不可变，引用方式有如下两种。

第一种在任意 React 组件内通过 `useDesigner` 访问，它不会变化，因此不会导致组件重渲染：

```
const { addComponent } = useDesigner();
```

第二种在任意组件元信息内通过回调访问：

```
const tableMeta = {  /** ... */  runtimeProps: ({ addComponent }) => {},};
```

### getState()

*   评价：必须有
    
*   类型：`() => State`
    

获取应用全部状态，包括内置与业务自定义。

### setState()

*   评价：必须有
    
*   类型：`(state: State) => void`
    

更新应用全部状态，包括内置与业务自定义。

### getComponentTree()

*   评价：必须有
    
*   类型：`() => ComponentInstance`
    

返回当前组件树。

并不是有了 `componentTree` 状态就万事大吉了，很多回调函数并不依赖组件树重渲染，而仅仅在触发时获取其瞬时值必须调用此方法。

虽然该方法一定程度上可以用 `getState().componentTree` 代替，但组件树概念太重要了，以至于单独定义一个方法不会增加理解成本。另外在受控模式下，`getState().componentTree` 不一定等价于 `getComponentTree()`，因为前者是从 `<Designer />` 拿组件树，而后者直接请求外部状态最新的组件树，当组件树受控模式没有及时触发渲染同步时，后者值会比前者更新。

### setComponentTree()

*   评价：必须有
    
*   类型：`(callback: (now: ComponentInstance) => ComponentInstance) => boolean`
    

更新当前组件树。

在非受控模式下等价于 `setState()` 修改 `componentTree`，但在非受控模式下，会直接透传到外部状态，直接修改一手组件树，因此极端情况下表现更稳定。

### addComponent()

*   评价：必须有
    
*   类型 `(componentInstance, parentIdPath?, index?, position?) => void`
    

添加组件实例。

基于 `setComponentTree()` 实现，但因为其太常见且意图较为复杂，抽成一个独立函数还是很有必要的。

*   `componentInstance` 必选，默认把组件实例添加到根节点的 `children` 位置。
    
*   `parentIdPath` 可选，描述要添加到的父节点 ID，当父节点没定义组件 ID 时，也可以用例如 `children.0` 这种组件树路径代替，所以名称不叫 `parentId`，而是 `parentIdPath`。
    
*   `index` 可选，描述要添加到父节点子元素下标，比如添加到 `children` 的第几项。
    
*   `position` 可选，描述要添加到父节点 `children` 还是 `props.header` 等位置，毕竟组件实例并不只有 `children` 一个地方。
    

### deleteComponent()

*   评价：必须有
    
*   类型：`(componentIdPath: string) => boolean`
    

删除组件实例。

基于 `setComponentTree()` 实现，但同理太常用，所以单独提供。

这里还有个细节，就是 `componentIdPath` 指可传组件 ID，也可传组件树路径，而真正删除肯定要从树上删，框架内部为了快速从组件 ID 定位到 `treePath`，维护了一个映射表，因此使用该函数无论何时都是 O(1) 的时间复杂度。

### getComponent()

*   评价：必须有
    
*   类型：`(componentIdPath: string) => ComponentInstance`
    

查询组件实例。

基于 `getComponentTree()` 实现。“增删” 都有了，“查” 还能没有吗？

### setComponent()

*   评价：必须有
    
*   类型：`(componentIdPath, callback) => boolean`
    

修改组件实例。

基于 `setComponentTree()` 实现，“增改查” 都有了，就差一个 “改” 了。

### setProps()

*   评价：建议有
    
*   类型：`(componentIdPath, callback) => boolean`
    

修改组件实例的 props。

基于 `setComponent()` 实现，因为修改组件 props 属性比修改整个组件实例常见，建议实现。

### getProps()

*   评价：建议有
    
*   类型：`(componentIdPath) => any`
    

获取组件实例的 props。

基于 `getComponent()` 实现，同理，调用可能比 `getComponent()` 更常见，因此建议实现。

### getComponents()

*   评价：建议有
    
*   类型：`() => ComponentInstance[]`
    

获取全量组件实例数组。

因为组件树是树状结构，业务除了用递归方式遍历外，还可以提供这种获取打平形式的组件树以备不时之需。

### getParentId()

*   评价：必须有
    
*   类型：`(componentIdPath: string) => string`
    

获取组件的父组件 ID。

以为 `componentTree` 为树状结构，所以直接从组件实例上找不到父节点，因此提供一个快速找父节点的函数是非常必要的。

当然框架内部实现寻找父节点肯定不会用遍历，而是提前解析组件树时就建立好关联映射表，所有内置方法时间复杂度都是 O(1) 的。

### getParentBy()

*   评价：建议有
    
*   类型：`(componentIdPath: string, finder: (parent: ComponentInstance) => boolean) => string`
    

一直向上寻找父节点，直到找到为止。

基于 `getParentId()` 实现，方便业务向上寻找符合条件的父节点。

### setParent()

*   评价：必须有
    
*   类型：`(componentIdPath, parentIdPath, index, position) => boolean`
    

调整某个组件的父节点。参数和 `addComponent()` 很像，只是把第一个从组件实例改为了组件 ID，参数含义相同。

当画布涉及组件跨父节点移动时，这个方法就显得很关键了，虽然底层也是基于 `setComponentTree` 实现的。一个比较复杂的场景是，当组件跨节点移动时，在组件树上操作还是比较复杂的，因为移除 + 添加无论先做哪个，都会导致组件树变化，从而导致后一个操作位置可能错误。如果每次都重新寻址性能会较差，如果想用聪明的方法绕过，逻辑还是比较复杂的，因此有必要内置该方法。

### setComponentMeta()

*   评价：必须有
    
*   类型：`(componentName: string, componentMeta: ComponentMeta) => void`
    

更新组件元信息。

提供这个方法其实对框架的挑战比较大，在提供很多生命周期的情况下，随时可能发生组件实例的更新，要保证整体逻辑符合预期，需要仔细设计一下。

### getComponentMeta()

*   评价：必须有
    
*   类型：`(componentName: string) => ComponentMeta`
    

获取组件元信息。

既然可以注册组件元信息，就可以获取它。注意通过 `<Designer />` 受控或者非受控模式注册，或者直接调用 `setComponentMeta` 注册的组件元信息都应该可以正常获取到。

### getComponentMetas()

*   评价：建议有
    
*   类型：`() => ComponentMeta[]`
    

批量获取所有已注册的组件元信息。

说不定业务会有什么特别的用途，建议提供。

### clearComponentMetas()

*   评价：建议有
    
*   类型：`() => void`
    

清空所有组件元信息。

说不定业务会有什么特别的用途，建议提供。

### setSelectedComponentIds()

*   评价：建议有
    
*   类型：`(ids: string[]) => void`
    

修改内置状态 `selectedComponentIds`。

如果你提供了 `selectedComponentIds` 这个内置状态，那提供对应的修改方法就是强烈建议了。虽然也可通过 `setState()` 更新 `selectedComponentIds` Key 来实现。

### getTreePath()

*   评价：建议有
    
*   类型：`(componentIdPath: string) => string`
    

根据组件 ID 查找在组件树上的路径。

也许业务想要自己操作组件树，那么框架提供根据组件 ID 找到组件树路径的方法就挺合适。

### undo(), redo()

*   评价：建议有
    
*   类型：`() => void`
    

撤销，重做。

如果提供了 `canUndo`、`canRedo` 内置状态，那么一定要提供 `undo()`、`redo()` 内置函数。

### getMergedProps()

*   评价：建议有
    
*   类型：`(componentIdPath: string) => any`
    

返回组件最终混合后的 props。

由于组件 props 可能来自组件树，也可能来自 `runtimeProps`，为了防止傻傻分不清，因此规定 `getProps()` 仅获取组件树上序列化的 props，而 `getMergedProps()` 获取了包含 `runtimeProps` 处理后的最终 props。

### getComponentDom()

*   评价：建议有
    
*   类型：`(componentIdPath: string) => HTMLElement`
    

根据组件 ID 获取 DOM 实例。

框架最好通过一些技巧，让组件即便不用 `forwardRef` 也能拿到 DOM，那么组件只要存在 DOM，就可以通过该方法拿到，非常方便。

### afterDomRender()

*   评价：建议有
    
*   类型：`(componentIdPath: string, callback: () => void) => Promise`
    

当组件 ID 的 DOM 实例挂载后，执行 `callback`。

因为组件 DOM 依赖渲染，所以不能保证 `getComponentDom` 时 DOM 真的完成了渲染，因此可以将时机放在 `afterDomRender()` 后，保证一定可以拿到 DOM。

总结
--

这一章我们设计了内置 API，设计思路总结如下：

1.  从组件树这个核心概念散开，设置了必要的 API，以及一些逻辑复杂，或者使用很方便的推荐 API。
    
2.  虽然组件树是树状结构，但内置 API 需要考虑易用性，所有操作都以组件 ID 作为参数，在内部实现时转化为操作组件树，并内置好 O(1) 时间复杂度的优化措施。
    
3.  核心 API 只有寥寥几个，其余 API 都以便利性为目的提供，且都以核心 API 为基础实现，这样框架核心会更稳定，框架大部分 API 只是一种实现规则，业务利用核心 API 拥有更大的实现自由。
    

> 讨论地址是：精读《可视化搭建内置 API》· Issue #467 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

![](https://mmbiz.qpic.cn/mmbiz_jpg/x0iannhWUodlcsZicJlhYuco6xLG3kJGT36Phz0MDBzItibawY5B4wZWTrW1rLpmekibODuOSaGeoSlHa1eGwQCBJg/640?wx_fmt=jpeg)

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）