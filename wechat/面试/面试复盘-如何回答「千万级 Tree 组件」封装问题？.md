> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/g-dENA9003B55YA3ISloDQ)

### 背景回顾

在一次技术面中，面试官提问：“有没有封装过渲染千万级数据的树组件？” 我实际上没有封装过，有点懵，类似这样的都是第三方库，大概知道点思路停顿了会儿尝试回答：“监听视口区域动态加载”，便被一句 “好了，你没做过” 打断。内心 OS： 真拽，下一家。 虽然当时有些不服气，但事后冷静下来，觉得确实有必要系统性地梳理这个问题的完整解决方案。下面就是我针对这个问题的深度复盘和知识整理。

* * *

### 完整回答思路

**我的理解**：虚拟树和虚拟列表本质其实是一样的，核心原理都是只渲染可视区域内的数据。

#### 核心逻辑：虚拟树 ≈ 虚拟列表 + 树形结构

**虚拟列表的本质**：只渲染可视区域元素，通过占位容器模拟滚动条。  
**树的特殊性**：需处理层级关系、展开折叠动态变化，二者结合即为 **虚拟树（Virtual Tree）** 。

* * *

### 实现四步法：

#### 1. **数据结构转化（TreeToList）**

递归遍历树节点，转化为线性数组并记录层级、展开状态、父子关系：

```
function flattenTree(root, level = 0, result = []) {  const node = { ...root, level, expanded: false };  result.push(node);  if (node.children && node.expanded) {    node.children.forEach(child => flattenTree(child, level + 1, result));  }  return result;}
```

#### 2. **监听滚动事件**

通过容器`scrollTop`动态计算当前可视区域索引：

```
const startIdx = Math.floor(scrollTop / itemHeight);const endIdx = startIdx + Math.ceil(containerHeight / itemHeight);
```

#### 3. **动态渲染可视节点**

仅对`visibleNodes = flatData.slice(startIdx, endIdx)`执行 DOM 渲染。

#### 4. **占位元素模拟滚动条**

设置占位块高度为`总高度 = 节点数 × 单节点高度`，欺骗浏览器滚动条。

* * *

### 关键问题与解决策略

<table><thead><tr><th><strong>难点</strong></th><th><strong>原因</strong></th><th><strong>解决方案</strong></th></tr></thead><tbody><tr><td><strong>展开折叠导致高度突变</strong></td><td><section>子节点隐藏后总高度减少</section></td><td><section>① 递归更新子节点<code>visible</code>状态 ② 重算总高度并重置<code>scrollTop</code></section></td></tr><tr><td><strong>动态节点高度兼容</strong></td><td><section>内容换行 / 图标差异导致高度不一</section></td><td><section>① 使用<code>ResizeObserver</code>监听高度变化 ② 缓存节点实际高度，滚动用高度累加值计算</section></td></tr><tr><td><strong>搜索 / 定位性能瓶颈</strong></td><td><section>递归遍历万级节点耗时长</section></td><td><section>建立节点索引 Map（&nbsp;<code>id -&gt; { node, parent }</code>） + 后端返回节点路径只展开关键分支</section></td></tr><tr><td><strong>内存占用暴涨</strong></td><td><section>海量数据转响应式对象开销大</section></td><td><section>①&nbsp;<code>Object.freeze</code>冻结非活动数据 ② 使用<code>shallowRef</code>替代<code>reactive</code></section></td></tr><tr><td><strong>浏览器渲染上限</strong></td><td><section>滚动容器最大高度约 1677 万像素</section></td><td><section>分块加载（懒加载 + 虚拟滚动结合）</section></td></tr></tbody></table>

* * *

### 性能优化方向

#### 1. **懒加载 + 虚拟滚动**

```
- 初始只加载首屏数据- 展开父节点时异步请求子数据，动态插入扁平列表- 已加载节点纳入虚拟滚动管理
```

#### 2. **渲染性能极限优化**

*   **减少重复渲染**：`v-once`（Vue）或`React.memo`缓存静态节点
    
*   **GPU 加速滚动**：`transform: translateY()`取代`top`定位
    
*   **请求空闲期处理**：用`requestIdleCallback`预计算展开路径
    

#### 3. **现成轮子方案**

<table><thead><tr><th><section>库名称</section></th><th><section>框架</section></th><th><section>特点</section></th></tr></thead><tbody><tr><td><code>vue-virt-tree</code></td><td><section>Vue 3</section></td><td><section>动态高度 / 复选框 / 懒加载</section></td></tr><tr><td><code>react-window</code><section>+<code>react-tree</code></section></td><td><section>React</section></td><td><section>组合式虚拟树</section></td></tr><tr><td><section>Ant Design&nbsp;<code>&lt;a-tree&gt;</code></section></td><td><section>Vue/React</section></td><td><section>企业级 UI 内置虚拟滚动</section></td></tr></tbody></table>

* * *

### 总结：理论完备性 > 是否造过轮子

虽然未实际封装千万级 Tree，但可以明确：  
**本质相通**：虚拟列表 → 虚拟树 **实践开发原则**：成熟库 + 定制化改造 ＞ 重复造轮子 （实际开发中使用现成方案更具性价比） **抗打断话术（回答思路）** ：总分总，思路和表达比回答全和回答对更有意义。

下次若再遇此类问题，我会微笑反问：“贵司的 Tree 组件是自己封装，还是用 Ant Design 呢？” —— 把问题抛回去，反客为主。

  

作者：Neon1234

https://juejin.cn/post/7533048503934976009