> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bgZOv0pfsbzSpdoGQlW90w)

unsetunset 前言 unsetunset
------------------------

作为前端开发者，你应该对以下技术演进过程并不陌生：jQuery → MVC → React/Vue（VDOM）→ Svelte/Solid/Qwik（无 VDOM）

每一次技术变迁都伴随着性能瓶颈、设计哲学与工程场景的变化。VDOM 是前端史上最具代表性的技术转折点之一，它改变了 Web 开发方式，同时也带来了新的挑战与发展方向。

本文将讲述一段 “VDOM 编年史”：从浏览器渲染瓶颈到 VDOM 的诞生，再到 Diff 算法进化及无 VDOM 的崛起。

unsetunsetVDOM 之前 unsetunset
----------------------------

在 jQuery 时代，更新视图只能直接操作 DOM。然而，频繁的 DOM 操作会带来性能瓶颈，从而导致页面卡顿。

### 为什么会卡顿

要解释这个问题，我们需要从浏览器渲染引擎的工作原理说起：

![](https://mmbiz.qpic.cn/mmbiz_jpg/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7vbZvfRQ4lbibBVOTxtl3uDicrwh7cJEep51WrwO16FgIxopBkeVUwh4w/640?wx_fmt=jpeg&from=appmsg#imgIndex=0)

浏览器首先通过解析代码分别构建 DOM 和 CSSOM，然后将两者结合生成渲染树。渲染树用于计算页面上所有内容的大小和位置。布局完成后，浏览器才会将像素绘制到屏幕上。其中，布局计算 / 重排（Layout/Reflow）是渲染过程中最核心的性能瓶颈。

在下面这些情况下会触发重排：

*   修改元素几何属性（width/height...）
    
*   内容变化、添加、删除 DOM
    
*   获取布局信息（offsetTop/Left/Width...）
    

根据影响范围重排又可以分为

1.  只影响一个元素及其子元素的简单重排
    
2.  影响一个子树下所有元素的局部重排
    
3.  整个页面都需要重新计算布局的全量重排
    

**性能消耗对比**

布局计算时间的简化模型可以表示为：Layout 时间 ≈ 基础开销 + Σ(每个受影响元素的复杂度 × 元素数量)。这里的‘基础开销’指每次触发布局的固定开销。

可以自行通过示例实验配合 Chrome DevTools 的 Performance 面板来验证。

```
<!-- 测试模板 --><div class="container">  <div class="box" id="target"></div>  <div class="children">    <div v-for="n in 100"></div>  </div></div>
```

```
// 性能测试方法function measure(type) {const start = performance.now();switch(type) {    case'simple-reflow':      target.style.width = '300px';       break;    case'partial-reflow':      container.style.padding = '20px';      break;    case'full-reflow':      document.body.style.fontSize = '16px';      break;    case'repaint':      target.style.backgroundColor = '#f00';  }// 强制同步布局void target.offsetHeight; return performance.now() - start;}
```

还可以参考行业权威数据：Google 的 RAIL 模型（https://web.dev/rail/）和 BrowserBench（https://browserbench.org/）等。

对比测试数据，可以得到以下性能消耗的对比结果

<table><thead><tr><th><section>类型</section></th><th><section>影响范围</section></th><th><section>计算复杂度</section></th><th><section>典型耗时</section></th></tr></thead><tbody><tr><td><section>简单重排</section></td><td><section>单个元素</section></td><td><section>O(1)</section></td><td><section>1-5ms</section></td></tr><tr><td><section>局部重排</section></td><td><section>子树</section></td><td><section>O(n)</section></td><td><section>5-15ms</section></td></tr><tr><td><section>全量重排</section></td><td><section>全局</section></td><td><section>O(n)</section></td><td><section>15-30ms</section></td></tr><tr><td><section>重绘</section></td><td><section>无布局变化</section></td><td><section>O(1)</section></td><td><section>0.1-1ms</section></td></tr></tbody></table>

具体测试结果可能存在误差，受以下因素影响：DOM 树复杂度、样式规则复杂度、GPU 加速是否开启，以及硬件设备和浏览器引擎的差异等。

#### 事件循环与渲染阻塞

事件循环是浏览器处理 JS 任务和页面渲染的核心机制，而渲染阻塞则发生在 JS 执行时间过长时，导致页面无法及时更新。 下面是一个典型的性能问题示例：

```
// 典型性能问题代码function badPractice() {  for(let i=0; i<1000; i++) {    const div = document.createElement('div');    document.body.appendChild(div); // 每次循环都触发重排    div.style.width = i + 'px';     // 再次触发重排  }}
```

**性能影响过程：**

1.  每次循环触发 2 次重排
    
2.  共 2000 次重排操作
    
3.  主线程被完全阻塞
    
4.  因此页面呈现卡死直至循环结束
    

**性能消耗计算：**

*   每次循环消耗：2 次重排（≈5ms）×2 = 10ms；
    
*   1000 次循环：1000 × 10ms = 10000ms；
    
*   因此阻塞总时间约 10000ms，对应丢失约 600 帧（10000/16.67≈600）；
    

结果是用户将体验到约 10 秒的卡顿。

### 手动优化方案

**离线 DOM 操作（DocumentFragment）**

将要添加的多个节点先批量添加到 `DocumentFragment` 中，最后一次性插入页面，有效降低重排频率。

```
// 优化前：直接操作 DOMfunction appendItemsDirectly(items) {const container = document.getElementById('list');  items.forEach(item => {    const li = document.createElement('li');    li.textContent = item;    container.appendChild(li); // 每次添加都触发重排  });}// 优化后：使用 DocumentFragmentfunction appendItemsOptimized(items) {const fragment = document.createDocumentFragment();  items.forEach(item => {    const li = document.createElement('li');    li.textContent = item;    fragment.appendChild(li);  });document.getElementById('list').appendChild(fragment); // 单次重排}
```

**读写分离**

利用浏览器批量更新机制、避免强制同步布局（Forced Synchronous Layout）进而减少布局计算次数

```
// 错误写法：交替读写布局属性function badReadWrite() {const elements = document.getElementsByClassName('item');for(let i=0; i<elements.length; i++) {    elements[i].style.width = '200px';        // 写操作    const height = elements[i].offsetHeight;  // 读操作    elements[i].style.height = height + 'px'; // 再次写操作  }}// 优化写法：批量读写function goodReadWrite() {const elements = document.getElementsByClassName('item');const heights = [];// 批量读for(let i=0; i<elements.length; i++) {    heights.push(elements[i].offsetHeight);  }// 批量写for(let i=0; i<elements.length; i++) {    elements[i].style.width = '200px';    elements[i].style.height = heights[i] + 'px';  }}
```

**FastDom**

FastDOM 是一个轻量级库，它提供公共接口，可将 DOM 的读 / 写操作捆绑在一起。它将每次测量（`measure`）和修改（`mutate`）操作排入不同队列，并利用 `requestAnimationFrame` 在下一帧统一批处理，从而降低布局压力。

```
// 使用 FastDOM 库（自动批处理）function updateAllElements() {  elements.forEach(el => {    fastdom.measure(() => {      const width = calculateWidth();      const height = calculateHeight();            fastdom.mutate(() => {        el.style.width = width;        el.style.height = height;      });    });  });}
```

可以参考此示例了解在修改 DOM 宽高时使用 FastDOM 前后的性能对比 (https://wilsonpage.github.io/fastdom/examples/aspect-ratio.html)

通过以上优化，可以大幅缓解渲染压力。但手动控制 DOM 更新不易维护，且在复杂应用中易出错。这时，虚拟 DOM 概念应运而生。

unsetunsetVDOM 时代 unsetunset
----------------------------

2013 年 Facebook 发布了 React 框架，提出了虚拟 DOM 概念，即用 JavaScript 对象模拟真实 DOM。

**虚拟 DOM 树**

将真实 DOM 抽象为轻量级的 JavaScript 对象（虚拟节点），形成一棵虚拟 DOM 树。

```
// 虚拟 DOM 节点结构示例const vNode = {  type: 'ul',  props: { className: 'list' },  children: [    { type: 'li', props: { key: '1' }, children: 'Item 1' },    { type: 'li', props: { key: '2' }, children: 'Item 2' }  ]};
```

**差异化更新（Diffing）**

简单来说，虚拟 DOM 利用 JavaScript 的计算能力来换取对真实 DOM 直接操作的开销。当数据变化时，框架通过比较新旧虚拟 DOM（即执行 Diff）来确定需要更新的部分，然后只更新相应的视图。

### 虚拟 DOM 的优点

*   跨平台与抽象：虚拟 DOM 用 JavaScript 对象表示 DOM 树，脱离浏览器实现细节，可映射到浏览器 DOM、原生组件、小程序等，便于服务端渲染 (SSR) 和跨平台渲染。
    
*   只更新变化部分：通过对比新旧虚拟 DOM 树并生成补丁 (patch)，框架仅对真实 DOM 做必要的最小修改，避免重建整棵 DOM 树。
    
*   性能下限有保障：虚拟 DOM 虽然不是最优方案，但比直接操作 DOM 更稳健，在无需手动优化的情况下能提供可预测的性能表现。
    
*   简化 DOM 操作：更新逻辑从命令式变为声明式驱动，开发者只需关注数据变化，框架负责高效更新视图，从而大幅提升开发效率。
    
*   增强组件化和编译优化能力：虚拟渲染让组件更易抽象和复用，并可结合 AOT 编译，将更多工作移到构建阶段，以减轻运行时开销。这在高频更新场景下效果尤为显著。
    

### Diff 算法

![](https://mmbiz.qpic.cn/mmbiz_jpg/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7jT5sjoqYo9LX6icH1dHfC9sfs2vEPiaX48rj3GprMrtmSheSn9j4JUgw/640?wx_fmt=jpeg&from=appmsg#imgIndex=1)

**算法目标**

找出新旧虚拟 DOM 的差异，并以最小代价更新真实 DOM。

**基本策略**

*   只比较同级节点，不跨层级移动元素。
    

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7ibFv6fsbVjaYoibdXoPOJLoJqHIWgtwGIAH3x9FVo6W1wJ6mlH56X1lQ/640?wx_fmt=png&from=appmsg#imgIndex=2)

```
<!-- 之前 --><div>           <!-- 层级1 --><p>            <!-- 层级2 -->    <b> aoy </b>   <!-- 层级3 -->       <span>diff</span></p></div><!-- 之后 --><div>            <!-- 层级1 --><p>             <!-- 层级2 -->      <b> aoy </b>        <!-- 层级3 --></p><span>diff</span></div>
```

由于 Diff 算法只在同层级比较节点，上例中新增的 `<span>` 在层级 2，而原有 `<span>` 在层级 3，因此无法直接复用。框架只能删除旧节点并在层级 2 重新创建 `<span>`。这也导致了预期移动操作无法实现。

*   使用 Key 标识可复用节点，提高节点匹配准确性。
    

例如，对于元素序列 a、b、c、d、e（互不相同），若未设置 key，更新时元素 b 会被视为新节点而被重新创建，旧的 b 节点会被删除。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7c7hLA9WTaEJYBjJwtTtkY9XmNUZR1ZY48Yee0Q9Dibg75Lbic0KlKn9w/640?wx_fmt=png&from=appmsg#imgIndex=3)

若给每个元素指定唯一 key，则可正确识别并复用对应节点，如下图所示。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7ad7icynZ7jTnWNialqggYVmic0SpGwGNpCPGLf19icBesfo0SfrvG7R09w/640?wx_fmt=png&from=appmsg#imgIndex=4)

*   当新旧节点类型不同（如标签名不同）时，框架会直接替换整个节点，而非尝试复用。
    

#### Diff 算法的演进

**简单 Diff 算法**

核心逻辑： 对新节点逐一在线性遍历的旧节点中查找可复用节点（sameVNode），找到则 `patch`，找不到则创建新节点。遍历完成后，旧节点中未被复用的节点将被删除。

缺点： 实现简单但不是最优，对于节点移动操作效率较低，最坏情况时间复杂度为 `O(n²)`。

```
function simpleDiff(oldChildren, newChildren) {let lastIndex = 0for (let i = 0; i < newChildren.length; i++) {    const newVNode = newChildren[i]    let find = false    for (let j = 0; j < oldChildren.length; j++) {      const oldVNode = oldChildren[j]      if (sameVNode(oldVNode, newVNode)) {        find = true        patch(oldVNode, newVNode) // 更新节点        if (j < lastIndex) {          // 需要移动节点          const anchor = oldChildren[j+1]?.el          insertBefore(parentEl, newVNode.el, anchor)        } else {          lastIndex = j        }        break      }    }    if (!find) {      // 新增节点      const anchor = oldChildren[i]?.el      createEl(newVNode, parentEl, anchor)    }  }// 删除旧节点...}
```

举个例子：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7AskTicC6rKnXjs6l88PlMzBJlvy3ibwBJ0rZdmAw3qANqb7QicXI22HAg/640?wx_fmt=png&from=appmsg#imgIndex=5)

**双端 Diff 算法**

在简单 Diff 基础上使用四个指针同时跟踪旧 / 新列表的头尾（`oldStartVnode`、`oldEndVnode`、`newStartVnode`、`newEndVnode`），从头尾进行四种快速比较：头 - 头、尾 - 尾、旧头 - 新尾、旧尾 - 新头。若匹配则执行更新，否则退回线性查找或插入操作。优点：对常见的 “头部插入、尾部删除” 场景非常高效；缺点：若中间区域节点顺序混乱，仍需遍历查找，可能导致较多 DOM 操作。平均时间复杂度 `O(n)`。

```
function diff(oldChildren, newChildren) {let oldStartIdx = 0let oldEndIdx = oldChildren.length - 1let newStartIdx = 0let newEndIdx = newChildren.length - 1while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {    // 四种情况比较    if (sameVNode(oldChildren[oldStartIdx], newChildren[newStartIdx])) {      // 情况1：头头相同      patch(...)      oldStartIdx++      newStartIdx++    } elseif (sameVNode(oldChildren[oldEndIdx], newChildren[newEndIdx])) {      // 情况2：尾尾相同      patch(...)      oldEndIdx--      newEndIdx--    } elseif (sameVNode(oldChildren[oldStartIdx], newChildren[newEndIdx])) {      // 情况3：旧头新尾      insertBefore(parentEl, oldStartVNode.el, oldEndVNode.el.nextSibling)      oldStartIdx++      newEndIdx--    } elseif (sameVNode(oldChildren[oldEndIdx], newChildren[newStartIdx])) {      // 情况4：旧尾新头      insertBefore(parentEl, oldEndVNode.el, oldStartVNode.el)      oldEndIdx--      newStartIdx++    } else {      // 查找可复用节点...    }  }// 处理剩余节点...}
```

举例：若发现 `oldEndVnode` 与 `newStartVnode` 是同一节点（sameVnode），则说明原列表的尾部节点在新列表中移到了开头。执行 `patchVnode` 时，会将对应的真实 DOM 节点移动到新列表的开始位置。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7C6XOQjUgV1yjNO9XGD4dWnQgwcdEX6uPsThOmbJaMQQ5j7iaftQfeDA/640?wx_fmt=png&from=appmsg#imgIndex=6)![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNibibfE4iaH7nMyibhI2vEZIoE7cniaRZjZkvjJmIe862aa3Y0J80LB9VGEt9QL2icDYAWVDysX7MJaq8NA/640?wx_fmt=png&from=appmsg#imgIndex=7)

**快速 Diff 算法**

核心思路：

1.  剥离公共前缀 / 后缀（`prefix/suffix`），把问题缩减到中间区。
    
2.  为新中间区建立 key 映射，生成旧中间区到新索引的映射数组，同时对可复用节点执行 `patch`。
    
3.  对映射数组求 最长递增子序列（LIS），LIS 对应节点保持相对顺序，无需移动。
    
4.  从右向左遍历新列表，若当前位置属于 LIS，跳过；否则将节点移动到正确位置或创建新节点。
    

通过 LIS 标识 “一组相对顺序正确” 的节点，只移动剩余节点，快速 Diff 在减少 DOM 移动次数方面显著优化了算法。但它需要额外的映射表和辅助数组开销。

快速 Diff 算法的优势在于在中间区大量移动 / 重排时能显著减少 DOM 移动次数与总时间，但是需要额外内存（映射、mapped、LIS 辅助数组）。整体时间复杂度为 `O(nlogn)`。

```
function quickDiff(oldChildren, newChildren) {// 1. 处理前缀let i = 0while (i <= oldEnd && i <= newEnd && sameVNode(old[i], new[i])) {    patch(...)    i++  }// 2. 处理后缀let oldEnd = oldChildren.length - 1let newEnd = newChildren.length - 1while (oldEnd >= i && newEnd >= i && sameVNode(old[oldEnd], new[newEnd])) {    patch(...)    oldEnd--    newEnd--  }// 3. 处理新增/删除if (i > oldEnd && i <= newEnd) {    // 新增节点...  } elseif (i > newEnd) {    // 删除节点...  } else {    // 4. 复杂情况处理    const keyIndex = {} // 新节点key映射    for (let j = i; j <= newEnd; j++) {      keyIndex[newChildren[j].key] = j    }    // 找出最长递增子序列    const lis = findLIS(...)        // 移动/更新节点    let lisPtr = lis.length - 1    for (let j = newEnd; j >= i; j--) {      if (lis[lisPtr] === j) {        lisPtr--      } else {        // 需要移动节点        insertBefore(...)      }    }  }}
```

### VDOM 的挑战

*   运行时开销： 每次状态更新都要重新构建 VDOM 树并进行 Diff，再更新真实 DOM。在高频小更新场景（如动画帧、复杂列表渲染）下，这些计算开销可能会超过直接操作 DOM 的成本。
    
*   渲染冗余： 框架通常通过 `shouldComponentUpdate`、`memo`、`v-if` 等手段减少不必要的更新，但这些本质上是人工干预。组件依赖复杂时，仍可能发生级联更新和不必要的 Diff。
    
*   生态割裂： 不同框架的 VDOM 实现和优化策略差异较大，开发者需为不同生态编写特定优化代码，增加了学习和维护成本。
    
*   设备压力： 在中低端设备或 WebView 场景，VDOM diff 的 CPU 开销显著，容易成为性能瓶颈。
    

基于以上原因，近年来出现了多种无虚拟 DOM 解决方案，将更多工作提前到编译时或采用细粒度响应式，以降低运行时成本。

unsetunset 无 VDOM 解决方案 unsetunset
---------------------------------

无虚拟 DOM 的核心目标是：在编译期生成精确的 DOM 操作，或者将数据响应切分到最小单元，从而避免常规的 VDOM diff。主要技术路线有：

### 三条主流技术路线

**Svelte（编译期生成精确 DOM 操作）**

Svelte 在构建阶段将组件模板编译成直接操作 DOM 的 JavaScript 代码，运行时不再创建 VNode 或进行 Diff。编译器静态分析模板，决定哪些节点是静态，哪些依赖于变量，从而生成最小更新路径。

优点： 运行时开销极低、内存分配少、GC 压力低，首屏和交互延迟很低，适合移动端和首屏优化场景。

缺点： 编译器实现复杂，开发调试时依赖高质量 `source map`；对于运行时高度动态（如动态生成组件）的场景，需要额外方案支持。

**Solid（细粒度响应式）**

Solid 使用类似信号（signal）机制，将组件内部表达式拆分为最小依赖单元。数据变化只触发与之直接相关的更新回调，这些回调直接操作 DOM。

优点： 更新几乎零延迟，避免整组件或整树的重新渲染，非常适合高频小更新场景（如实时图表仪表盘）。

缺点： 编程模型与传统 VDOM 框架不同，需要理解信号粒度和副作用清理；在大型项目中需要特别注意内存管理和副作用回收。

**Qwik（按需恢复的应用）**

Qwik 将应用的状态尽量序列化（或在服务端预渲染时生成可恢复信息），客户端仅在需要时 “唤醒” 对应组件（按需 hydration）。它推迟或避免了不必要的运行时代价。

优点： 首次加载脚本体积小、交互延迟低，非常适合大页面或低算力设备。

缺点： 需要复杂的序列化 / 恢复机制，对路由和事件绑定有严格要求，迁移成本较高。

此外，以 Vue 为例的 Vapor/opt-in 编译模式 实际上把 Vue 的模板编译成 “直达 DOM 的更新指令”，属于编译期优化思路的一种变体：保留 Vue 的语法与生态，同时在性能关键路径上逼近无 VDOM 性能。

### 性能比较

*   内存与 GC：无 VDOM 的运行时分配显著下降（少量短期对象），GC 停顿减少；但编译产物体积可能会略增（生成更多特定更新函数）。
    
*   CPU 时间：高频更新场景中，无 VDOM 通常显著胜出，因为省去了每帧的树构造与 diff 运算。对于低更新频率的普通页面，差异不明显。
    
*   开发与调试体验：调试 “直接操作 DOM” 生成代码有时不如调试抽象语义直观，因此优秀的 source map 与开发工具对这些框架尤为重要。
    

unsetunset 总结 unsetunset
------------------------

VDOM 是一个强大的工程抽象，它把浏览器渲染复杂性封装为可预测的模型，推动了跨平台与组件化生态的发展。 但 VDOM 有真实的成本：对象分配、Diff 计算与可能的 GC 停顿，在高频更新或受限环境会成为瓶颈。 无 VDOM 方案并非魔法，而是通过编译期与细粒度响应式把运行时成本下降到 “更接近命令式最优” 的路径，适用于性能关键场景。