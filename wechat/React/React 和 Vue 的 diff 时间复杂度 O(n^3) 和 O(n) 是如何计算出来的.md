> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/k6NYlRaJPeQ_Kn2iZGAEUA)

问题描述
----

原问题标题 “React 和 Vue 的 diff 时间复杂度从 O(n^3) 优化到 O(n) ，那么 O(n^3) 和 O(n) 是如何计算出来的？”

1.  这里的 n 指的是页面的 VDOM 节点数，这个不太严谨。如果更严谨一点，我们应该应该假设 变化之前的节点数为 m，变化之后的节点数为 n。
    
2.  React 和 Vue 做优化的前提是 “放弃了最优解 “，本质上是一种权衡，有利有弊。
    

倘若这个算法用到别的行业，比如医药行业，肯定是不行的，为什么？

React 和 Vue 做的假设是：

*   检测 VDOM 的变化只发生在同一层
    
*   检测 VDOM 的变化依赖于用户指定的 key
    

如果变化发生在不同层或者同样的元素用户指定了不同的 key 或者不同元素用户指定同样的 key， React 和 Vue 都不会检测到，就会发生莫名其妙的问题。

但是 React 认为， 前端碰到上面的第一种情况概率很小，第二种情况又可以通过提示用户，让用户去解决，因此 这个取舍是值得的。没有牺牲空间复杂度，却换来了在大多数情况下时间上的巨大提升。明智的选择！

基本概念
----

首先大家要有个基本概念。

其实这是一个典型的最小编辑距离的问题，相关算法有很多，比如 Git 中 ，提交之前会进行一次对象的 diff 操作，就是用的这个最小距离编辑算法。

leetcode72: 编程距离 有原题目,

> https://leetcode.com/problems/edit-distance/

如果想明白这个 O(n^3)， 可以先看下这个。

对于树，我们也是一样的，我们定义三种操作，用来将一棵树转化为另外一棵树：

*   删除：删除一个节点，将它的 children 交给它的父节点
    
*   插入：在 children 中 插入一个节点
    
*   修改：修改节点的值
    

事实上，从一棵树转化为另外一棵树，我们有很多方式，我们要找到最少的。

直观的方式是用动态规划，通过这种记忆化搜索减少时间复杂度。

算法
--

由于树是一种递归的数据结构，因此最简单的树的比较算法是递归处理。

详细描述这个算法可以写一篇很长的论文，这里不赘述。大家想看代码的，这里有一份

> https://github.com/DatabaseGroup/tree-similarity/tree/develop

我希望没有吓到你。

确切地说，树的最小距离编辑算法的时间复杂度是`O(n^2m(1+logmn))`, 我们假设`m 与 n 同阶`， 就会变成 `O(n^3)`。

关于 O(n) 怎么计算出来的
---------------

React 将 Virtual DOM 树转换为 actual DOM 树的最小操作的过程称为调和， diff 算法便是调和的结果，React 通过制定大胆的策略，将 O(n^3) 的时间复杂度转换成 O(n)。

#### 1. diff 策略

下面是 React diff 算法的 3 个策略：

*   策略一：Web UI 中 DOM 节点跨层级的移动操作特别少。可以忽略不计。
    
*   策略二：拥有相同类的两个组件将会生成相似的树形结构，拥有不同类的两个组件将会生成不同的树形结构。
    
*   策略三：对于同一层级的一组子节点，它们可以通过唯一 id 进行区分。
    

基于以上三个策略，React 分别对 tree diff、component diff 以及 element diff 进行算法优化。

#### 2. tree diff

对于策略一，React 对树的算法进行了简单明了的优化，即对树进行分层比较，两颗树只会对同一层级的节点进行比较。

既然 DOM 节点跨层级的移动，可以少到忽略不计，针对这种现象，React 通过 updateDepth 对 Virtual DOM 树进行层级控制，只对相同层级的 DOM 节点进行比较，即同一父节点下的所有子节点，当发现该节点已经不存在时，则该节点及其子节点会被完全删除掉，不会用于进一步的比较。这样只需要对树进行一次遍历，便能完成整个 DOM 树的比较。

```
// updateChildren 源码updateChildren: function (nextNestedChildrenElements, transaction, context) {    updateDepth ++;    var errorThrown = true;    try {        this._updateChildren(nextNestedChildrenElements, transaction, context);        errorThrown = false;    } finally {        updateDepth --;        if (!updateDepth) {            if (errorThrown) {                clearQueue();            } else {                processQueue();            }        }    }}
```

那么就会有这样的问题：

**如果出现了 DOM 节点跨层级的移动操作，diff 会有怎样的表现喃？**

我们举个例子看一下：

如下图 2-1，A 节点（包括其子节点）整个需要跨层级移动到 D 节点下，React 会如何操作喃？![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnQ06QoBUibgcClFm7O7LURfNfVsSo3KavBxNx5u0sEU1MzVS2iaBY6ux8DgITftrl3catBJ1PP2VGQ/640?wx_fmt=png)**图 2-1 DOM 层级变换**

由于 React 只会简单的考虑同层级节点的位置变换，对于不同层级的节点，只有创建和删除操作。当根节点 R 发现子节点中 A 消失了，就会直接销毁 A；当 D 节点发现多了一个子节点 A，就会创建新的 A 子节点（包括其子节点）。执行的操作为：

create A —> create B —> create C —> delete A

所以。当出现节点跨级移动时，并不会像想象中的那样执行移动操作，而是以 A 为根节点的整个树被整个重新创建，这是影响 React 性能的操作，所以 **官方建议不要进行 DOM 节点跨层级的操作**。

> 在开发组件中，保持稳定的 DOM 结构有助于性能的提升。例如，可以通过 CSS 隐藏或显示节点，而不是真正的移除或添加 DOM 节点。

#### 3. component diff

React 是基于组件构建应用的，对于组件间的比较所采取的策略也是非常简洁、高效的。

*   如果是同一类型的组件，按照原策略继续比较 Virtual DOM 树即可
    
*   如果不是，则将该组件判断为 dirty component，从而替换整个组件下的所有子节点
    
*   对于同一类型下的组件，有可能其 Virtual DOM 没有任何变化，如果能确切知道这一点，那么就可以节省大量的 diff 算法时间。因此， React 允许用户通过 `shouldComponentUpdate()`来判断该组件是否需要大量 diff 算法分析。
    

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnQ06QoBUibgcClFm7O7LURfpdlOpMl0QC9wCtBpBtwjlrHppTWH4CzsjN3ljKtrHxmkS5eLtSEsbA/640?wx_fmt=png)**图 3-1 component diff**

如上图 3-1，当 D 组件变成 G 时，即使这两个组件结构相似，但一旦 React 判断 D 和 G 是两个不同类型的组件时，就不会再比较这两个组件的结构，直接进行删除组件 D， 重新创建组件 G 及其子组件。虽然这两个组件是不同类型单结构类似，diff 算法会影响性能，正如 React 官方博客所言：

**不同类型的组件很少存在相似 DOM 树的情况，因此，这种极端因素很难在实际开发过程中造成重大影响。**

#### 4. element diff

当节点处于同一层级时，diff 提供三种节点操作：

*   INSERT_MARKUP（插入）：如果新的组件类型不在旧集合里，即全新的节点，需要对新节点执行插入操作。
    
*   MOVE_EXISTING （移动）：旧集合中有新组件类型，且 element 是可更新的类型，generatorComponentChildren 已调用 receiveComponent，这种情况下 prevChild=nextChild，就需要做移动操作，可以复用以前的 DOM 节点。
    
*   REMOVE_NODE  （删除）：旧组件类型，在新集合里也有，但对应的 elememt 不同则不能直接复用和更新，需要执行删除操作，或者旧组件不在新集合里的，也需要执行删除操作。
    

```
// INSERT_MARKUPfunction makeInsertMarkup(markup, afterNode, toIndex) {    return {        type: ReactMultiChildUpdateTypes.INSERT_MARKUP,        content: markup,        fromIndex: null,        fromNode: null,        toIndex: toIndex,        afterNode: afterNode    }}// MOVE_EXISTINGfunction makeMove(child, afterNode, toIndex) {    return {        type: ReactMultiChildUpdateTypes.MOVE_EXISTING,        content: null,        fromIndex: child._mountIndex,        fromNode: ReactReconciler.getNativeNode(child),        toIndex: toIndex,        afterNode: afterNode    }}// REMOVE_NODEfunction makeRemove(child, node) {    return {        type: ReactMultiChildUpdateTypes.REMOVE_NODE,        content: null,        fromIndex: child._mountIndex,        fromNode: node,        toIndex: null,        afterNode: null    }}
```

下面由三个例子加深我们的理解

> 例 1：旧集合 A、B、C、D 四个节点，更新后的新集合为 B、A、D、C 节点，对新旧集合进行 diff 算法差异化对比，发现 B!=A，则创建并插入 B 节点到新集合，并删除旧集合中 A，以此类推，创建 A、D、C，删除 B、C、D。如下图 4-1![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnQ06QoBUibgcClFm7O7LURfnHptj4DdUEb7TeSLG8V3By2Wwj22yc7j0lEMwwtDprzkMFvv8rXa1Q/640?wx_fmt=png) **图 4-1 节点 diff**

React 发现这样操作非常繁琐冗余，因为这些集合里含有相同的节点，只是节点位置发生了变化而已，却发生了繁琐的删除、创建操作，实际上只需要对这些节点进行简单的位置移动即可。

**针对这一现象，React 提出了优化策略：**

**允许开发者对同一层级的同组子节点，添加唯一 key 进行区分，虽然只是小小的改动，但性能上却发生了翻天覆地的变化。**

> 例 2：看下图

进行对新旧集合的 diff 差异化对比，通过 key 发现新旧集合中包含的节点是一样的，所以可以通过简单的位置移动就可以更新为新集合，React 给出的 diff 结果为：B、D 不做任何操作，A、C 移动即可。

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnQ06QoBUibgcClFm7O7LURfhVNkico8NQvxVtNHGjVd045mrARHzB2zkicKEMtvRmLfrqe95ZRkDaTA/640?wx_fmt=png)**图 4-2 对节点进行 diff 差异化对比**

步骤：

*   初始化，lastIndex = 0， nextIndex = 0
    
*   从新集合取出节点 B，发现旧集合中也有节点 B，并且 B.__mountIndex = 1，lastIndex = 0，不满足 B._mountIndex <lastIndex，则不对 B 操作，并且更新 lastIndex= Math.max(prevChild._mountIndex, lastIndex)，并将 B 的位置更新为新集合中的位置 prevChild._mountIndex = nextIndex，即 B._mountIndex = 0, nextIndex ++ 进入下一步
    
*   从新集合取出节点 A，发现旧集合中也有节点 A，并且 A.__mountIndex = 0，lastIndex = 1，满足 A._mountIndex <lastIndex，则对 A 进行移动操作，enqueue( updates, makeMove(prevChild, lastPlacedNode, nextIndex)) 并且更新 lastIndex= Math.max(prevChild._mountIndex, lastIndex)，并将 A 的位置更新为新集合中的位置 prevChild._mountIndex = nextIndex，即 A._mountIndex = 1, nextIndex ++ 进入下一步
    
*   依次进行操作，可以根据下面代码执行的步骤实现，这里不再赘述
    

操作为：

```
updateChildren1: function(prevChildren, nextChildren) { // 旧集合 新集合     var updates = null    var name    // lastIndex 是 prevChildren 中最后一个索引，nextIndex 是 nextChildren 中每个节点的索引    var lastIndex = 0    var nextIndex = 0        for (name in nextChildren) { // 对新集合的节点进行循环遍历        if (!nextChildren.hasOwnProperty(name)) {             continue        }        var prevChild = prevChildren && prevChildren[name]         var nextChild = nextChildren[name]        // 通过唯一的key判断新旧集合是否有相同的节点        if (prevChild === nextChild) {  // 新旧集合有相同的节点            // 如果子节点的 index 小于 lastIndex 则移动该节点            if (prevChild._mountIndex < lastIndex) {                // 获取移动节点                let moveNode = makeMove(prevChild, lastPlacedNode, nextIndex)                // 存入差异队列                updates = enqueue(                    updates,                    moveNode                )            } // 这是一种顺序优化手段，lastIndex 一直在更新表示访问过的节点一直在prevChildren最大的位置，如果当前访问的节点比 lastIndex 大，说明当前访问的节点在旧结合中就比上一个节点靠后，则该节点不会影响其它节点的位置，因此不插入差异队列，不要执行移动操作，只有访问的节点比 lastIndex 小时，才需要进行移动操作。             // 更新lastIndex            lastIndex= Math.max(prevChild._mountIndex, lastIndex)            // 将prevChild的位置更新为在新集合中的位置            prevChild._mountIndex = nextIndex        } else {            if (prevChild) {// 如果没有相同节点且prevChild存在                // 更新lastIndex                lastIndex = Math.max(prevChild._mountIndex, lastIndex)            }        }        // 进入下一个节点的判断        nextIndex ++    }    // 如果存在更新，则处理更新队列    if (updates) {        processQueue(this, updates)    }     // 更新 DOM    this._renderedChildren = nextChildren}function enqueue(queue, update) {    // 如果有更新，将其存入 queue    if (update) {        queue = queue || []        queue.push(update)    }    return queue}// 处理队列的更新function processQueue (inst, updateQueue) {    ReactComponentEnvironment.processChildrenUpdates(        inst,        updateQueue    )}
```

> 例 3：看下图

![](https://mmbiz.qpic.cn/mmbiz_png/bwG40XYiaOKnQ06QoBUibgcClFm7O7LURfSibbmViclngVyvib5AfCege491qfVsmDH6POZP8C5jeg7cbP04oYibf6ow/640?wx_fmt=png)**图 4-3 创建、移动、删除节点**

可以看出在这个例子中，有新增的节点，还有需要删除的节点，具体怎么操作，请大胆的尝试一下吧

#### 5. 源码

```
_updateChildren: function(nextNestedChildrenElements, transaction, context) {    var prevChildren = this._renderedChildren  // 旧集合    var removedNodes = {} // 需要删除的节点集合    var nextChildren = this._reconcilerUpdateChildren(prevChildren, nextNestedChildrenElements, removedNodes, transaction, context) // 新集合        // 如果不存在 prevChildren 及 nextChildren，则不做 diff 处理    if (!prevChildren && !nextChildren) {        return    }    var updates = null    var name    // lastIndex 是 prevChildren 中最后一个索引，nextIndex 是 nextChildren 中每个节点的索引    var lastIndex = 0    var nextIndex = 0    var lastPlacedNode = null        for (name in nextChildren) { // 对新集合的节点进行循环遍历        if (!nextChildren.hasOwnProperty(name)) {             continue        }        var prevChild = prevChildren && prevChildren[name]         var nextChild = nextChildren[name]        // 通过唯一的key判断新旧集合是否有相同的节点        if (prevChild === nextChild) {  // 新旧集合有相同的节点            // 如果子节点的 index 小于 lastIndex 则移动该节点，并加入差异队列            updates = enqueue(                updates,                this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex)            )// 这是一种顺序优化手段，lastIndex 一直在更新表示访问过的节点一直在prevChildren最大的位置，如果当前访问的节点比 lastIndex 大，说明当前访问的节点在旧结合中就比上一个节点靠后，则该节点不会影响其它节点的位置，因此不插入差异队列，不要执行移动操作，只有访问的节点比 lastIndex 小时，才需要进行移动操作。             // 更新lastIndex            lastIndex= Math.max(prevChild._mountIndex, lastIndex)            // 将prevChild的位置更新为在新集合中的位置            prevChild._mountIndex = nextIndex        } else {            if (prevChild) {// 如果没有相同节点且prevChild存在                // 更新lastIndex                lastIndex = Math.max(prevChild._mountIndex, lastIndex)                // 通过遍历 removedNodes 删除子节点 prevChild            }            // 初始化并创建节点            updates = enqueue(                updates,                this._mountChildAtIndex(nextChild, lastPlacedNode, nextIndex, transaction, context)            )        }        // 进入下一个节点的判断        nextIndex ++        lastPlacedNode = ReactReconciler.getNativeNode(nextChild)    }    // 如果父节点不存在，则将其子节点全部移除    for (name in removedNodes) {        if (removedNodes.hasOwnProperty(name)) {            updates = enqueue(                updates,                this._unmountChild(prevChildren[name], removedNodes[name])            )        }    }    // 如果存在更新，则处理更新队列    if (updates) {        processQueue(this, updates)    }     this._renderedChildren = nextChildren}function enqueue(queue, update) {    // 如果有更新，将其存入 queue    if (update) {        queue = queue || []        queue.push(update)    }    return queue}// 处理队列的更新function processQueue (inst, updateQueue) {    ReactComponentEnvironment.processChildrenUpdates(        inst,        updateQueue    )}// 移动节点moveChild: function(child, afterNode, toIndex, lastIndex) {    // 如果子节点的 index 小于 lastIndex 则移动该节点    if (child._mountIndex < lastIndex) {        return makeMove(child, afterNode, toIndex)    }}// 创建节点createChild: function(child, afterNode, mountIndex) {    return makeInsertMarkup(mountIndex, afterNode, child._mountIndex)}// 删除节点removeChild: function(child, node) {    return makeRemove(child, node)}// 卸载已经渲染的子节点_unmountChild: function(child, node) {    var update = this.removeChild(child, node)    child._mountIndex = null    return update}// 通过提供的名称，实例化子节点_mountChildAtIndex: function(child, afterNode, index, transaction, context) {    var mountIndex = ReactReconciler.mountComponent(child, transaction, this, this._nativeContainerInfo, context)    child._mountIndex = index    return this._createChild(child, afterNode, mountIndex)}
```

https://muyiy.cn/question/

https://github.com/sisterAn/blog/issues/22

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 **「在看」**，让更多的人也能看到这篇内容

2、关注官网 **https://muyiy.cn**，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 **「加群」** ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《

```
“在看”吗？在看就点一下吧

```