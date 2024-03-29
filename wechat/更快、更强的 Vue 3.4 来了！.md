> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4_aqOvR7hqP7Uu4_tWeWzg)

12 月 28 日，Vue 3.4 正式发布，代号为 “**🏀 Slam Dunk**”，即**灌篮高手**。这个版本进行了许多重要的内部改进，其中最引人瞩目的是重写的模板解析器。新的解析器将速度提高了 2 倍，显著提升了整体性能。此外，响应性系统也经过了重构，使得 effect 触发更为精确和高效。为了提升开发体验，还进行了一些 API 改进，包括 `defineModel` 的稳定以及绑定`props`时的新的同名简写。

Vue 3.4 的更新包括：

*   依赖项更新
    
*   功能亮点
    

*   解析器速度提高 2 倍，SFC 构建性能提升
    
*   更高效的响应式系统
    
*   `defineModel` 已稳定
    
*   `v-bind` 同名缩写
    
*   改进水合不匹配错误
    
*   错误代码和编译时标志参考
    

*   移除过时功能
    

*   全局 JSX 命名空间
    
*   其他已删除的功能
    

依赖项更新
-----

为了充分利用 Vue 3.4 版本的新功能，建议在升级到 3.4 版本时同时更新以下依赖项：

*   Volar / vue-tsc@^1.8.27（必需）
    
*   @vitejs/plugin-vue@^5.0.0（如果使用 Vite）
    
*   nuxt@^3.9.0（如果使用 Nuxt）
    
*   vue-loader@^17.4.0（如果使用 webpack 或 vue-cli）
    

如果在 Vue 中使用 TSX，需要检查在 "Removed: Global JSX Namespace" 中所需的操作。

请确保不再使用任何已弃用的功能（如果有使用，应该会在控制台中收到相应的警告）。这些功能可能已在 3.4 版本中被移除。

功能亮点
----

### 解析器速度提高 2 倍，SFC 构建性能提升

在 3.4 版本中，Vue 团队完全重写了模板解析器。之前，Vue 使 用的是依赖大量正则表达式和前向搜索的递归下降解析器。新的解析器则基于`htmlparser2`中的标记器，采用状态机的方式，仅需对整个模板字符串进行一次遍历。这使得无论模板大小如何，解析器的速度均提升了一倍。经过广泛的测试和生态系统持续集成，新解析器对 Vue 最终用户来说是 100% 向后兼容的。

在整合新解析器与其他系统部分时，发现了一些进一步提高 SFC 编译性能的机会。基准测试显示，生成 source map 时，编译 Vue SFC 的脚本和模板部分的速度提高了约 44%。因此，使用 Vue SFC 的大多数项目在 3.4 版本中的构建速度应有所提升。但请注意，Vue SFC 编译只是实际项目中整个构建过程的一部分。与单独的基准测试相比，最终的端到端构建时间效益可能较小。

此外，新解析器不仅提升了 Vue 核心的性能，还对 Volar / vue-tsc 以及需要解析 Vue SFC 或模板的社区插件（如 Vue Macros）有性能提升作用。

### 更高效的响应式系统

Vue 3.4 还对响应式系统进行了重大重构，目标是提高计算属性的重新计算效率。

为了说明正在改进的内容，考虑以下场景：

```
const count = ref(0)const isEven = computed(() => count.value % 2 === 0)watchEffect(() => console.log(isEven.value)) // truecount.value = 2 // true
```

在 3.4 版本之前，`watchEffect`的回调函数会在每次`count.value`发生变化时触发，即使计算结果保持不变。但是通过 3.4 版本的优化，只有在计算结果实际发生变化时，回调函数才会触发。

此外，在 3.4 版本中：

*   多个计算依赖的变化只会触发同步 `effect` 一次。
    
*   数组的`shift`、`unshift`和`splice`方法只会触发同步 effect 一次。
    

除了在基准测试中显示的性能提升外，这些优化还可以在许多场景中减少不必要的组件重新渲染，同时保持完全向后兼容。

### defineModel 已稳定

`defineModel`是一个新的`<script setup>`宏，旨在简化支持`v-model`的组件的实现。它在 3.3 版本中作为实验性功能发布，并在 3.4 版本中升级为稳定状态。现在，它还提供更好的支持与`v-model`修饰符一起使用。

### v-bind 同名缩写

现在可以缩写它：

```
const count = ref(0)const isEven = computed(() => count.value % 2 === 0)watchEffect(() => console.log(isEven.value)) // truecount.value = 2 // true
```

缩写之后：

```
<img :id="id" :src="src" :alt="alt">
```

在过去，用户经常提出对这个功能的需求。起初，Vue 团队对于其使用方式和布尔属性的混淆存在一些疑虑。然而，在重新评估该功能后，他们现在认为让`v-bind`的行为更接近 JavaScript，而不是直接对应原生属性，是有其合理性的，特别是考虑到它的动态特性。

### 改进水合不匹配错误

Vue 3.4 对水合不匹配错误消息进行了一些改进：

1.  改进了措辞的清晰度（服务器渲染与客户端预期的区别）。
    
2.  错误消息现在包括相关的 DOM 节点，这样可以快速在页面或元素面板中找到它。
    
3.  水合不匹配检查现在还适用于`class`、`style`和其他动态绑定的属性。
    

此外，Vue 3.4 还新增了一个编译时标志`__VUE_PROD_HYDRATION_MISMATCH_DETAILS__`，可以用于在生产环境中强制水合不匹配错误包含完整的详细信息。

### 误代码和编译时标志参考

为了减小生产构建的打包大小，Vue 在生产环境中会删除长的错误消息字符串。然而，这也意味着在生产环境中通过错误处理程序捕获的错误将只收到难以解读的短错误代码，需要深入研究 Vue 的源代码才能理解其含义。

为了改进这一点，Vue 团队在文档中新增了一个生产错误参考页面。这个页面根据最新版本的 Vue 稳定发布自动生成错误代码，方便开发者进行参考。

此外，还添加了一个编译时标志参考，其中包含了如何在不同的构建工具中配置这些标志的说明。这样开发者可以根据自己的需求进行配置，提高开发效率。

移除过时功能
------

### 全局 JSX 命名空间

自 3.4 版本起，Vue 不再默认注册全局 JSX 命名空间。此举旨在避免与 React 发生全局命名空间冲突，以使两个库的 TSX 在同一个项目中和谐共存。此变更对仅使用最新版 Volar 的 SFC 用户无影响。

如果正在使用 TSX，有两个解决方案可供选择：

*   在升级至 3.4 之前，需要在`tsconfig.json`中明确设置`jsxImportSource`为`'vue'`。此外，还可以在每个文件的顶部添加`/* @jsxImportSource vue */`的注释，以文件为单位选择性采用此选项。
    
*   如果代码依赖于全局 JSX 命名空间的存在，例如使用`JSX.Element`等类型，可以通过显式引用`vue/jsx`来保持与 3.4 版本之前完全相同的全局行为，该行为会注册全局 JSX 命名空间。
    

注意，此次变更仅影响类型，且为次要版本中的重大变更，符合发布政策。

### 其他已删除的功能

*   在 3.3 版本中，Reactivity Transform 功能被标记为不推荐使用，并在 3.4 版本中被移除。由于该功能是实验性的，所以这个变化不需要进行重大更改。希望继续使用该功能的用户可以通过 Vue Macros 插件来实现。
    
*   `app.config.unwrapInjectedRef`已经被移除。在 3.3 版本中，它被标记为不推荐使用并默认启用。在 3.4 版本中，不再支持禁用此行为。
    
*   在模板中使用`@vnodeXXX`事件监听器现在会导致编译错误，而不是发出不推荐使用的警告，需要改用`@vue:XXX`监听器。
    
*   `v-is`指令已被移除。在 3.3 版本中，它被标记为不推荐使用，需要改用带有`vue:`前缀的`is`属性。