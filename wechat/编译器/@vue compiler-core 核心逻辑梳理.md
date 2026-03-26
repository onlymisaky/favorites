> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nAW9Ce6J1uOf-XBHCR4Lrw)

```
import { baseParse, transform, generate } from '@vue/compiler-core';

// 模板字符串
const template = `<div>{{ message }}</div>`;

// 1. 解析模板为 AST
const ast = baseParse(template);

// 2. 转换和优化 AST
transform(ast, {
  nodeTransforms: [], // 可以添加自定义节点转换插件
  directiveTransforms: {}, // 可以添加自定义指令转换插件
});

// 3. 生成渲染函数代码
const { code } = generate(ast);

console.log(code);
// 输出类似以下内容的渲染函数代码：
// function render(_ctx, _cache) {
//   return (_openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */))
// }
```

`@vue/compiler-core` 是 Vue 3 中的一个关键模块，用于将 Vue 模板编译为渲染函数。它的整体逻辑可以分为几个主要阶段：解析（Parsing）、转换（Transformation）、优化（Optimization）和代码生成（Code Generation）。下面是对这些阶段的详细介绍：

### 1. 解析（Parsing）

**目标**：将模板字符串解析为抽象语法树（AST）。

• **输入**：Vue 模板字符串。• **输出**：AST。• **过程**：通过 `baseParse` 函数，将模板解析为一个结构化的 AST。这个 AST 包含了模板中所有元素、属性、指令和文本节点的信息。

### 2. 转换（Transformation）

**目标**：对 AST 进行转换和优化，使其更适合生成高效的渲染代码。

• **输入**：AST。• **输出**：转换后的 AST。• **过程**：

• **节点转换（Node Transforms）**：通过一系列插件对 AST 节点进行转换。可以自定义插件来处理特定类型的节点或指令。• **指令转换（Directive Transforms）**：处理 Vue 特有的指令（如 `v-if`、`v-for`），将它们转换为渲染函数所需的代码结构。

### 3. 优化（Optimization）

**目标**：标记静态内容以提升渲染性能。

• **输入**：转换后的 AST。• **输出**：优化后的 AST。• **过程**：识别和标记静态节点和属性，这样在渲染过程中可以跳过不必要的更新。

### 4. 代码生成（Code Generation）

**目标**：将优化后的 AST 生成渲染函数代码。

• **输入**：优化后的 AST。• **输出**：渲染函数的 JavaScript 代码。• **过程**：通过 `generate` 函数，将 AST 转换为可执行的渲染函数代码。生成的代码将包含创建虚拟 DOM 的逻辑，并根据模板结构生成相应的渲染指令。

### 整体逻辑流程图

1. **解析阶段**：模板字符串 → AST2. **转换阶段**：AST → 转换后的 AST3. **优化阶段**：转换后的 AST → 优化后的 AST4. **代码生成阶段**：优化后的 AST → 渲染函数代码

### 使用示例

以下是一个简单的例子，展示如何使用 `@vue/compiler-core` 将模板编译为渲染函数：

```
import { baseParse, transform, generate } from '@vue/compiler-core';
// 模板字符串
const template = `<div>{{ message }}</div>`;
// 1. 解析模板为 AST
const ast = baseParse(template);
// 2. 转换和优化 AST
transform(ast, {
  nodeTransforms: [], // 可以添加自定义节点转换插件
  directiveTransforms: {}, // 可以添加自定义指令转换插件
});
// 3. 生成渲染函数代码
const { code } = generate(ast);
console.log(code);
// 输出类似以下内容的渲染函数代码：
// function render(_ctx, _cache) {
//   return (_openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.message), 1 /* TEXT */))
// }
```

### 结论

`@vue/compiler-core` 是 Vue 3 模板编译器的核心模块，通过解析、转换、优化和代码生成这四个阶段，将模板编译为高效的渲染函数。它提供了高度的可定制性，允许开发者根据需要调整编译过程。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍
```