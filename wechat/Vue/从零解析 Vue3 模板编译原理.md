> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/sBABH1PqEdc7zs5DkfBMpw)

Vue 的编译模块包含 4 个目录：

```
compiler-core
compiler-dom // 浏览器
compiler-sfc // 单文件组件
compiler-ssr // 服务端渲染
```

其中 compiler-core 模块是 Vue 编译的核心模块，并且是平台无关的。而剩下的三个都是在 compiler-core 的基础上针对不同的平台作了适配处理。

Vue 的编译分为三个阶段，分别是：parse、transform、codegen。

其中 parse 阶段将模板字符串转化为语法抽象树 AST。transform 阶段则是对 AST 进行了一些转换处理。codegen 阶段根据 AST 生成对应的 render 函数字符串。

Parse
-----

Vue 在解析模板字符串时，可分为两种情况：以 `<` 开头的字符串和不以 `<` 开头的字符串。

不以 `<` 开头的字符串有两种情况：它是文本节点或 `{{ exp }}` 插值表达式。

而以 `<` 开头的字符串又分为以下几种情况：

1. 元素开始标签 `<div>`2. 元素结束标签 `</div>`3. 注释节点 `<!-- 123 -->`4. 文档声明 `<!DOCTYPE html>`

用伪代码表示，大概过程如下：

```
while (s.length) {
    if (startsWith(s, '{{')) {
        // 如果以 '{{' 开头
        node = parseInterpolation(context, mode)
    } else if (s[0] === '<') {
        // 以 < 标签开头
        if (s[1] === '!') {
            if (startsWith(s, '<!--')) {
                // 注释
                node = parseComment(context)
            } else if (startsWith(s, '<!DOCTYPE')) {
                // 文档声明，当成注释处理
                node = parseBogusComment(context)
            }
        } else if (s[1] === '/') {
            // 结束标签
            parseTag(context, TagType.End, parent)
        } else if (/[a-z]/i.test(s[1])) {
            // 开始标签
            node = parseElement(context, ancestors)
        }
    } else {
        // 普通文本节点
        node = parseText(context, mode)
    }
}
```

在源码中对应的几个函数分别是：

1.`parseChildren()`，主入口。2.`parseInterpolation()`，解析双花插值表达式。3.`parseComment()`，解析注释。4.`parseBogusComment()`，解析文档声明。5.`parseTag()`，解析标签。6.`parseElement()`，解析元素节点，它会在内部执行 `parseTag()`。7.`parseText()`，解析普通文本。8.`parseAttribute()`，解析属性。

每解析完一个标签、文本、注释等节点时，Vue 就会生成对应的 AST 节点，并且**会把已经解析完的字符串给截断**。

对字符串进行截断使用的是 `advanceBy(context, numberOfCharacters)` 函数，context 是字符串的上下文对象，numberOfCharacters 是要截断的字符数。

我们用一个简单的例子来模拟一下截断操作：

```
<div >
  <p></p>
</div>
```

首先解析 `<div`，然后执行 `advanceBy(context, 4)` 进行截断操作（内部执行的是 `s = s.slice(4)`），变成：

```
>
  <p></p>
</div>
```

再解析属性，并截断，变成：

```
<p></p>
</div>
```

同理，后面的截断情况为：

```
></p>
</div>
```

```
</div>
```

```
<!-- 所有字符串已经解析完 -->
```

**AST 节点**

所有的 AST 节点定义都在 compiler-core/ast.ts 文件中，下面是一个元素节点的定义：

```
export interface BaseElementNode extends Node {
  type: NodeTypes.ELEMENT // 类型
  ns: Namespace // 命名空间 默认为 HTML，即 0
  tag: string // 标签名
  tagType: ElementTypes // 元素类型
  isSelfClosing: boolean // 是否是自闭合标签 例如 <br/> <hr/>
  props: Array<AttributeNode | DirectiveNode> // props 属性，包含 HTML 属性和指令
  children: TemplateChildNode[] // 字节点
}
```

一些简单的要点已经讲完了，下面我们再从一个比较复杂的例子来详细讲解一下 parse 的处理过程。

```
<div >
  <!-- 这是注释 -->
  <p>{{ test }}</p>
  一个文本节点
  <div>good job!</div>
</div>
```

上面的模板字符串假设为 s，第一个字符 s[0] 是 `<` 开头，那说明它只能是刚才所说的四种情况之一。这时需要再看一下 s[1] 的字符是什么：

1. 如果是 `!`，则调用字符串原生方法 `startsWith()` 看看是以 `'<!--'` 开头还是以 `'<!DOCTYPE'` 开头。虽然这两者对应的处理函数不一样，但它们最终都是解析为注释节点。2. 如果是 `/`，则按结束标签处理。3. 如果不是 `/`，则按开始标签处理。

从我们的示例来看，这是一个 `<div>` 开始标签。

这里还有一点要提一下，Vue 会用一个栈 stack 来保存解析到的元素标签。当它遇到开始标签时，会将这个标签推入栈，遇到结束标签时，将刚才的标签弹出栈。它的作用是保存当前已经解析了，但还没解析完的元素标签。这个栈还有另一个作用，在解析到某个字节点时，通过 `stack[stack.length - 1]` 可以获取它的父元素。

从我们的示例来看，它的出入栈顺序是这样的：

```
1. [div] // div 入栈
2. [div, p] // p 入栈
3. [div] // p 出栈
4. [div, div] // div 入栈
5. [div] // div 出栈
6. [] // 最后一个 div 出栈，模板字符串已解析完，这时栈为空
```

接着上文继续分析我们的示例，这时已经知道是 `div` 标签了，接下来会把已经解析完的 `<div` 字符串截断，然后解析它的属性。

Vue 的属性有两种情况：

1.HTML 普通属性 2.Vue 指令

根据属性的不同生成的节点不同，HTML 普通属性节点 type 为 6，Vue 指令节点 type 为 7。

所有的节点类型值如下：

```
ROOT,  // 根节点 0
ELEMENT, // 元素节点 1
TEXT, // 文本节点 2
COMMENT, // 注释节点 3
SIMPLE_EXPRESSION, // 表达式 4
INTERPOLATION, // 双花插值 {{ }} 5
ATTRIBUTE, // 属性 6
DIRECTIVE, // 指令 7
```

属性解析完后，`div` 开始标签也就解析完了，`<div >` 这一行字符串已经被截断。现在剩下的字符串如下：

```
<!-- 这是注释 -->
  <p>{{ test }}</p>
  一个文本节点
  <div>good job!</div>
</div>
```

注释文本和普通文本节点解析规则都很简单，直接截断，生成节点。注释文本调用 `parseComment()` 函数处理，文本节点调用 `parseText()` 处理。

双花插值的字符串处理逻辑稍微复杂点，例如示例中的 `{{ test }}`：

1. 先将双花括号中的内容提取出来，即 `test`，再对它执行 `trim()`，去除空格。2. 然后会生成两个节点，一个节点是 `INTERPOLATION`，type 为 5，表示它是双花插值。3. 第二个节点是它的内容，即 `test`，它会生成一个 `SIMPLE_EXPRESSION` 节点，type 为 4。

```
return {
  type: NodeTypes.INTERPOLATION, // 双花插值类型
  content: {
    type: NodeTypes.SIMPLE_EXPRESSION,
    isStatic: false, // 非静态节点
    isConstant: false,
    content,
    loc: getSelection(context, innerStart, innerEnd)
  },
  loc: getSelection(context, start)
}
```

剩下的字符串解析逻辑和上文的差不多，就不解释了，最后这个示例解析出来的 AST 如下所示：

![](https://mmbiz.qpic.cn/mmbiz_png/rSNuFXbuCQf1hHT7vibtgALgJmLZ3FWZf3QwkfQQ3ACm9ezUianbgfQgA8V2uA5ZU1XWtIMUzGhkCIT8l5zLqVbA/640?wx_fmt=png)

从 AST 上，我们还能看到某些节点上有一些别的属性：

1.ns，命名空间，一般为 HTML，值为 0。2.loc，它是一个位置信息，表明这个节点在源 HTML 字符串中的位置，包含行，列，偏移量等信息。3.`{{ test }}` 解析出来的节点会有一个 isStatic 属性，值为 false，表示这是一个动态节点。如果是静态节点，则只会生成一次，并且在后面的阶段一直复用同一个，不用进行 diff 比较。

另外还有一个 tagType 属性，它有 4 个值：

```
export const enum ElementTypes {
  ELEMENT, // 0 元素节点
  COMPONENT, // 1 组件
  SLOT, // 2 插槽
  TEMPLATE // 3 模板
}
```

主要用于区分上述四种类型节点。

Transform
---------

在 transform 阶段，Vue 会对 AST 进行一些转换操作，主要是根据不同的 AST 节点添加不同的选项参数，这些参数在 codegen 阶段会用到。下面列举一些比较重要的选项：

### cacheHandlers

如果 cacheHandlers 的值为 true，则表示开启事件函数缓存。例如 `@click="foo"` 默认编译为 `{ onClick: foo }`，如果开启了这个选项，则编译为

```
{ onClick: _cache[0] || (_cache[0] = e => _ctx.foo(e)) }
```

### hoistStatic

hoistStatic 是一个标识符，表示要不要开启静态节点提升。如果值为 true，静态节点将被提升到 `render()` 函数外面生成，并被命名为 `_hoisted_x` 变量。

例如 `一个文本节点` 生成的代码为 `const _hoisted_2 = /*#__PURE__*/_createTextVNode(" 一个文本节点 ")`。

下面两张图，前者是 `hoistStatic = false`，后面是 `hoistStatic = true`。大家可以在网站 [1] 上自己试一下。

![](https://mmbiz.qpic.cn/mmbiz_png/rSNuFXbuCQf1hHT7vibtgALgJmLZ3FWZfJHH0c26DcmibwQsrhIgLjPey8hs0GbTn5c3IIa70qm974vGRPR1KPkA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/rSNuFXbuCQf1hHT7vibtgALgJmLZ3FWZfZXiayoLdkMibGRjWHFEtQicTXdHLTBic6HRFWqfcJCibD27LoEltEFzwGag/640?wx_fmt=png)

### prefixIdentifiers

这个参数的作用是用于代码生成。例如 `{{ foo }}` 在 module 模式下生成的代码为 `_ctx.foo`，而在 function 模式下是 `with (this) { ... }`。因为在 module 模式下，默认为严格模式，不能使用 with 语句。

### PatchFlags

transform 在对 AST 节点进行转换时，会打上 patchflag 参数，这个参数主要用于 diff 比较过程。当 DOM 节点有这个标志并且大于 0，就代表要更新，没有就跳过。

我们来看一下 patchflag 的取值范围：

```
export const enum PatchFlags {
  // 动态文本节点
  TEXT = 1,

  // 动态 class
  CLASS = 1 << 1, // 2

  // 动态 style
  STYLE = 1 << 2, // 4

  // 动态属性，但不包含类名和样式
  // 如果是组件，则可以包含类名和样式
  PROPS = 1 << 3, // 8

  // 具有动态 key 属性，当 key 改变时，需要进行完整的 diff 比较。
  FULL_PROPS = 1 << 4, // 16

  // 带有监听事件的节点
  HYDRATE_EVENTS = 1 << 5, // 32

  // 一个不会改变子节点顺序的 fragment
  STABLE_FRAGMENT = 1 << 6, // 64

  // 带有 key 属性的 fragment 或部分子字节有 key
  KEYED_FRAGMENT = 1 << 7, // 128

  // 子节点没有 key 的 fragment
  UNKEYED_FRAGMENT = 1 << 8, // 256

  // 一个节点只会进行非 props 比较
  NEED_PATCH = 1 << 9, // 512

  // 动态 slot
  DYNAMIC_SLOTS = 1 << 10, // 1024

  // 静态节点
  HOISTED = -1,

  // 指示在 diff 过程应该要退出优化模式
  BAIL = -2
}
```

从上述代码可以看出 patchflag 使用一个 11 位的位图来表示不同的值，每个值都有不同的含义。Vue 在 diff 过程会根据不同的 patchflag 使用不同的 patch 方法。

下图是经过 transform 后的 AST：

![](https://mmbiz.qpic.cn/mmbiz_png/rSNuFXbuCQf1hHT7vibtgALgJmLZ3FWZfohJhEpP5EO5jdvkyvekTicOQ0wC4JaXnTlGK28xFZK2AQBUbW2ex2TA/640?wx_fmt=png)

可以看到 codegenNode、helpers 和 hoists 已经被填充上了相应的值。codegenNode 是生成代码要用到的数据，hoists 存储的是静态节点，helpers 存储的是创建 VNode 的函数名称（其实是 Symbol）。

在正式开始 transform 前，需要创建一个 transformContext，即 transform 上下文。和这三个属性有关的数据和方法如下：

```
helpers: new Set(),
hoists: [],

// methods
helper(name) {
  context.helpers.add(name)
  return name
},
helperString(name) {
  return `_${helperNameMap[context.helper(name)]}`
},
hoist(exp) {
  context.hoists.push(exp)
  const identifier = createSimpleExpression(
    `_hoisted_${context.hoists.length}`,
    false,
    exp.loc,
    true
  )
  identifier.hoisted = exp
  return identifier
},
```

我们来看一下具体的 transform 过程是怎样的，用 `<p>{{ test }}</p>` 来做示例。

这个节点对应的是 `transformElement()` 转换函数，由于 `p` 没有绑定动态属性，没有绑定指令，所以重点不在它，而是在 `{{ test }}` 上。`{{ test }}` 是一个双花插值表达式，所以将它的 patchFlag 设为 1（动态文本节点），对应的执行代码是 `patchFlag |= 1`。然后再执行 `createVNodeCall()` 函数，它的返回值就是这个节点的 codegenNode 值。

```
node.codegenNode = createVNodeCall(
    context,
    vnodeTag,
    vnodeProps,
    vnodeChildren,
    vnodePatchFlag,
    vnodeDynamicProps,
    vnodeDirectives,
    !!shouldUseBlock,
    false /* disableTracking */,
    node.loc
)
```

`createVNodeCall()` 根据这个节点添加了一个 `createVNode` Symbol 符号，它放在 helpers 里。其实就是要在代码生成阶段引入的帮助函数。

```
// createVNodeCall() 内部执行过程，已删除多余的代码
context.helper(CREATE_VNODE)

return {
  type: NodeTypes.VNODE_CALL,
  tag,
  props,
  children,
  patchFlag,
  dynamicProps,
  directives,
  isBlock,
  disableTracking,
  loc
}
```

### hoists

一个节点是否添加到 hoists 中，主要看它是不是静态节点，并且需要将 hoistStatic 设为 true。

```
<div > // 属性静态节点
  <!-- 这是注释 -->
  <p>{{ test }}</p>
  一个文本节点 // 静态节点
  <div>good job!</div> // 静态节点
</div>
```

可以看到，上面有三个静态节点，所以 hoists 数组有 3 个值。并且无论静态节点嵌套有多深，都会被提升到 hoists 中。

### type 变化

![](https://mmbiz.qpic.cn/mmbiz_png/rSNuFXbuCQf1hHT7vibtgALgJmLZ3FWZfrBNqto9P2AuFJRTWkUeuvEXx7v5iagQXLicxItHCxmSjThqe4YsuwCuA/640?wx_fmt=png)

从上图可以看到，最外层的 div 的 type 原来为 1，经过 transform 生成的 codegenNode 中的 type 变成了 13。这个 13 是代码生成对应的类型 `VNODE_CALL`。另外还有:

```
// codegen
VNODE_CALL, // 13
JS_CALL_EXPRESSION, // 14
JS_OBJECT_EXPRESSION, // 15
JS_PROPERTY, // 16
JS_ARRAY_EXPRESSION, // 17
JS_FUNCTION_EXPRESSION, // 18
JS_CONDITIONAL_EXPRESSION, // 19
JS_CACHE_EXPRESSION, // 20
```

刚才提到的例子 `{{ test }}`，它的 codegenNode 就是通过调用 `createVNodeCall()` 生成的：

```
return {
  type: NodeTypes.VNODE_CALL,
  tag,
  props,
  children,
  patchFlag,
  dynamicProps,
  directives,
  isBlock,
  disableTracking,
  loc
}
```

可以从上述代码看到，type 被设置为 NodeTypes.VNODE_CALL，即 13。

每个不同的节点都由不同的 transform 函数来处理，由于篇幅有限，具体代码请自行查阅。

Codegen
-------

代码生成阶段最后生成了一个字符串，我们把字符串的双引号去掉，看一下具体的内容是什么：

```
const _Vue = Vue
const { createVNode: _createVNode, createCommentVNode: _createCommentVNode, createTextVNode: _createTextVNode } = _Vue

const _hoisted_1 = { name: "test" }
const _hoisted_2 = /*#__PURE__*/_createTextVNode(" 一个文本节点 ")
const _hoisted_3 = /*#__PURE__*/_createVNode("div", null, "good job!", -1 /* HOISTED */)

return function render(_ctx, _cache) {
  with (_ctx) {
    const { createCommentVNode: _createCommentVNode, toDisplayString: _toDisplayString, createVNode: _createVNode, createTextVNode: _createTextVNode, openBlock: _openBlock, createBlock: _createBlock } = _Vue

    return (_openBlock(), _createBlock("div", _hoisted_1, [
      _createCommentVNode(" 这是注释 "),
      _createVNode("p", null, _toDisplayString(test), 1 /* TEXT */),
      _hoisted_2,
      _hoisted_3
    ]))
  }
}
```

### 代码生成模式

可以看到上述代码最后返回一个 `render()` 函数，作用是生成对应的 VNode。

其实代码生成有两种模式：module 和 function，由标识符 prefixIdentifiers 决定使用哪种模式。

function 模式的特点是：使用 `const { helpers... } = Vue` 的方式来引入帮助函数，也就是是 `createVode()` `createCommentVNode()` 这些函数。向外导出使用 `return` 返回整个 `render()` 函数。

module 模式的特点是：使用 es6 模块来导入导出函数，也就是使用 import 和 export。

### 静态节点

另外还有三个变量是用 `_hoisted_` 命名的，后面跟着数字，代表这是第几个静态变量。再看一下 parse 阶段的 HTML 模板字符串：

```
<div >
  <!-- 这是注释 -->
  <p>{{ test }}</p>
  一个文本节点
  <div>good job!</div>
</div>
```

这个示例只有一个动态节点，即 `{{ test }}`，剩下的全是静态节点。从生成的代码中也可以看出，生成的节点和模板中的代码是一一对应的。静态节点的作用就是只生成一次，以后直接复用。

细心的网友可能发现了 `_hoisted_2` 和 `_hoisted_3` 变量中都有一个 `/*#__PURE__*/` 注释。

这个注释的作用是表示这个函数是纯函数，没有副作用，主要用于 tree-shaking。压缩工具在打包时会将未被使用的代码直接删除（shaking 摇掉）。

再来看一下生成动态节点 `{{ test }}` 的代码： `_createVNode("p", null, _toDisplayString(test), 1 /* TEXT */)`。

其中 `_toDisplayString(test)` 的内部实现是：

```
return val == null
    ? ''
    : isObject(val)
      ? JSON.stringify(val, replacer, 2)
      : String(val)
```

代码很简单，就是转成字符串输出。

而 `_createVNode("p", null, _toDisplayString(test), 1 /* TEXT */)` 最后一个参数 1 就是 transform 添加的 patchflag 了。

### 帮助函数 helpers

在 transform、codegen 这两个阶段，我们都能看到 helpers 的影子，到底 helpers 是干什么用的？

```
// Name mapping for runtime helpers that need to be imported from 'vue' in
// generated code. Make sure these are correctly exported in the runtime!
// Using `any` here because TS doesn't allow symbols as index type.
export const helperNameMap: any = {
  [FRAGMENT]: `Fragment`,
  [TELEPORT]: `Teleport`,
  [SUSPENSE]: `Suspense`,
  [KEEP_ALIVE]: `KeepAlive`,
  [BASE_TRANSITION]: `BaseTransition`,
  [OPEN_BLOCK]: `openBlock`,
  [CREATE_BLOCK]: `createBlock`,
  [CREATE_VNODE]: `createVNode`,
  [CREATE_COMMENT]: `createCommentVNode`,
  [CREATE_TEXT]: `createTextVNode`,
  [CREATE_STATIC]: `createStaticVNode`,
  [RESOLVE_COMPONENT]: `resolveComponent`,
  [RESOLVE_DYNAMIC_COMPONENT]: `resolveDynamicComponent`,
  [RESOLVE_DIRECTIVE]: `resolveDirective`,
  [WITH_DIRECTIVES]: `withDirectives`,
  [RENDER_LIST]: `renderList`,
  [RENDER_SLOT]: `renderSlot`,
  [CREATE_SLOTS]: `createSlots`,
  [TO_DISPLAY_STRING]: `toDisplayString`,
  [MERGE_PROPS]: `mergeProps`,
  [TO_HANDLERS]: `toHandlers`,
  [CAMELIZE]: `camelize`,
  [CAPITALIZE]: `capitalize`,
  [SET_BLOCK_TRACKING]: `setBlockTracking`,
  [PUSH_SCOPE_ID]: `pushScopeId`,
  [POP_SCOPE_ID]: `popScopeId`,
  [WITH_SCOPE_ID]: `withScopeId`,
  [WITH_CTX]: `withCtx`
}

export function registerRuntimeHelpers(helpers: any) {
  Object.getOwnPropertySymbols(helpers).forEach(s => {
    helperNameMap[s] = helpers[s]
  })
}
```

其实帮助函数就是在代码生成时从 Vue 引入的一些函数，以便让程序正常执行，从上面生成的代码中就可以看出来。而 helperNameMap 是默认的映射表名称，这些名称就是要从 Vue 引入的函数名称。

另外，我们还能看到一个注册函数 `registerRuntimeHelpers(helpers: any()`，它是干什么用的呢？

我们知道编译模块 compiler-core 是平台无关的，而 compiler-dom 是浏览器相关的编译模块。为了能在浏览器正常运行 Vue 程序，就得把浏览器相关的 Vue 数据和函数导入进来。 `registerRuntimeHelpers(helpers: any()` 正是用来做这件事的，从 compiler-dom 的 runtimeHelpers.ts 文件就能看出来：

```
registerRuntimeHelpers({
  [V_MODEL_RADIO]: `vModelRadio`,
  [V_MODEL_CHECKBOX]: `vModelCheckbox`,
  [V_MODEL_TEXT]: `vModelText`,
  [V_MODEL_SELECT]: `vModelSelect`,
  [V_MODEL_DYNAMIC]: `vModelDynamic`,
  [V_ON_WITH_MODIFIERS]: `withModifiers`,
  [V_ON_WITH_KEYS]: `withKeys`,
  [V_SHOW]: `vShow`,
  [TRANSITION]: `Transition`,
  [TRANSITION_GROUP]: `TransitionGroup`
})
```

它运行 `registerRuntimeHelpers(helpers: any()`，往映射表注入了浏览器相关的部分函数。

**helpers 是怎么使用的呢**?

在 parse 阶段，解析到不同节点时会生成对应的 type。

在 transform 阶段，会生成一个 helpers，它是一个 set 数据结构。每当它转换 AST 时，都会根据 AST 节点的 type 添加不同的 helper 函数。

例如，假设它现在正在转换的是一个注释节点，它会执行 `context.helper(CREATE_COMMENT)`，内部实现相当于 `helpers.add('createCommentVNode')`。然后在 codegen 阶段，遍历 helpers，将程序需要的函数从 Vue 里导入，代码实现如下：

```
// 这是 module 模式
`import { ${ast.helpers
  .map(s => `${helperNameMap[s]} as _${helperNameMap[s]}`)
  .join(', ')} } from ${JSON.stringify(runtimeModuleName)}\n`
```

### 如何生成代码？

从 codegen.ts 文件中，可以看到很多代码生成函数：

```
generate() // 代码生成入口文件
genFunctionExpression() // 生成函数表达式
genNode() // 生成 Vnode 节点
...
```

生成代码则是根据不同的 AST 节点调用不同的代码生成函数，最终将代码字符串拼在一起，输出一个完整的代码字符串。

老规矩，还是看一个例子：

```
const _hoisted_1 = { name: "test" }
const _hoisted_2 = /*#__PURE__*/_createTextVNode(" 一个文本节点 ")
const _hoisted_3 = /*#__PURE__*/_createVNode("div", null, "good job!", -1 /* HOISTED */)
```

看一下这段代码是怎么生成的，首先执行 `genHoists(ast.hoists, context)`，将 transform 生成的静态节点数组 hoists 作为第一个参数。`genHoists()` 内部实现：

```
hoists.forEach((exp, i) => {
    if (exp) {
        push(`const _hoisted_${i + 1} = `);
        genNode(exp, context);
        newline();
    }
})
```

从上述代码可以看到，遍历 hoists 数组，调用 `genNode(exp, context)`。`genNode()` 根据不同的 type 执行不同的函数。

```
const _hoisted_1 = { name: "test" }
```

这一行代码中的 `const _hoisted_1 =` 由 `genHoists()` 生成，`{ name: "test" }` 由 `genObjectExpression()` 生成。同理，剩下的两行代码生成过程也是如此，只是最终调用的函数不同。

❤️ 看完三件事

如果你觉得这篇内容对你挺有启发，我想邀请你帮我三个小忙：

1.  **点「在看」**，让更多的人也能看到这篇内容（收藏不点赞，都是耍流氓 -_-）
    
2.  关注公众号「前端巅峰」，不定期分享原创知识。
    
3.  也看看其它文章肯定