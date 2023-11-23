> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Uvi2r3a2KwXrPdNAkexqLg)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9ibxaGSVLwAeLJxKiaBQo81lHmY94c8JcsCgmFW8vAsKm01kfoXHBtM4ibvHfZO31Lm5l82PH6v5YRg/640?wx_fmt=png)

前述
--

本文的初衷是想让更多的同学知道并了解 vue 模版编译，所以文中主要以阶段流程为主，不会涉及过多的底层代码逻辑，请耐心观看。

思考
--

html 是标签语言，只有 JS 才能实现判断、循环，而模版有指令、插值、JS 表达式，能够实现判断、循环等，故模板不是 html，因此模板一定是转换为某种 JS 代码，这种编译又是如何进行的？

解析
--

模版编译是将 template 编译成 render 函数的过程，这个过程大致可以分成三个阶段：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9ibxaGSVLwAeLJxKiaBQo81lqbgUBMlXYrOZmf3OZud3jkqgGnGMpsuwjgCLic4qcvQeaAKQB8VodeQ/640?wx_fmt=png)模版编译 vue2.0.png

阶段
--

### parse 解析器

解析器主要就是将 `模板字符串` 转换成 `element ASTs`

#### 模板字符串

```
<div>
   <p>{{message}}</p>
</div>
```

#### element ASTs[1]

AST 是指抽象语法树 和 Vnode 类似，都是使用 JavaScript 对象来描述节点的树状表现形式

```
{  tag: "div"  // 节点的类型（1标签，2包含字面量表达式的文本节点，3普通文本节点或注释节点）  type: 1,  // 静态根节点  staticRoot: false,  // 静态节点  static: false,  plain: true,  // 父节点元素描述对象的引用  parent: undefined,  // 只有当节点类型为1，才会有attrsList属性，它是一个对象数组，存储着原始的html属性名和值  attrsList: [],  // 同上，区别是attrsMap是以键值对的方式保存html属性名和值的  attrsMap: {},  // 存储着该节点所有子节点的元素描述对象  children: [      {      tag: "p"      type: 1,      staticRoot: false,      static: false,      plain: true,      parent: {tag: "div", ...},      attrsList: [],      attrsMap: {},      children: [{          type: 2,          text: "{{message}}",          static: false,          // 当节点类型为2时，对象会包含的表达式          expression: "_s(message)"      }]    }  ]}
```

#### 截取的规则

主要是通过判断模板中 html.indexof('<') 的值，来确定要截取标签还是文本.

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9ibxaGSVLwAeLJxKiaBQo81lhqy9r0ujklIvvLVvcEFbefiaYHXbndFCYdxjdKJWKUgicibdwH79uA7ww/640?wx_fmt=png)模版编译 vue2.0.png

#### 截取的过程

##### 字符串部分

```
`<div><p>{{message}}<p></div>`
```

##### 截取过程部分

第一次截取

1.  判断模板中 html.indexof('<') 的值, 为零 (注释、条件注释、doctype、开始标签、结束标签中的一种)
    
2.  被起始标签的正则匹配成功，获取当前的标签名为 div，然后截掉匹配成功的'<div'部分，得到新的字符串`><p>{{message}}</p></div>`
    
3.  截取掉开始标签后，会使用匹配属性的正则去匹配，如果匹配成功，则得到该标签的属性列表，如果匹配不成功，则该标签的属性列表为空数组
    
4.  截掉属性后，会使用匹配开始标签结束的正则去匹配，得到它是否是自闭合标签的信息，然后截掉匹配到的字符串得到新的字符串`<p>{{message}}</p></div>`
    
5.  匹配到开始标签，判断当前节点是否存在根节点，不存在则会创建一个元素类型的树节点，存在，则将其设置为 currentParent 的子节点，然后将当前节点压入 stack 栈中
    

```
/**
   总结为，匹配标签，提取属性，建立层级
*/
// 经过上面的匹配，剩下的字符串部分为：
`<p>{{message}}<p></div>`
```

第二次截取

```
/**
    同上
*/
// 经过上面的匹配，剩下的字符串部分为：
`{{message}}</p></div>`
```

第三次截取

1.  判断模板中 html.indexof('<') 的值, 大于等于零 (文本、表达式中的一种)
    
2.  查询最近的一个'<'，并匹配其是否符合 (起始标签、结束标签、注释、条件注释中的一种)，匹配成功则结束遍历，不成功继续遍历
    
    例如：
    
    `a < b </p>` => 文本部分 `a < b`，命中结束标签
    
    `a<b</p>` => 文本部分 `a`，命中开始标签 < b
    

```
/**
   总结为，判断类型，截取文本
*/
// 经过上面的匹配，剩下的字符串部分为：
`</p></div>`
```

第四次截取

1.  判断模板中 html.indexof('<') 的值, 为零 (注释、条件注释、doctype、开始标签、结束标签中的一种)
    
2.  被结束标签的正则匹配成功，然后截掉匹配成功的`</p>`部分，得到新的字符串`</div>`
    
3.  匹配到结束标签，会从栈中弹出一个节点'p'，并将栈中的最后一个节点'div'设置为 currentParent
    

```
/**
    总结为，匹配标签，确定层级
*/
// 经过上面的匹配，剩下的字符串部分为：
`</div>`
```

第五次截取

```
/**
    同上
*/
结束
```

##### 解析器总结

*   `模板字符串` 转换成 `element ASTs`过程，其实就是不断的截取字符串并解析它们的过程。
    
*   匹配到起始标签，则截取对应的开始标签，并定义 AST 的基本结构，并且解析标签上带的属性 (attrs， tagName)、指令等等，同时将此标签推进栈中
    
*   匹配到结束标签，则需要通过这个结束标签的 tagName 从后到前匹配 stack 中每一项的 tagName，将匹配到的那一项之后的所有项全部删除（从栈里面弹出来）所以栈中的最后一项就是父元素
    
*   解析阶段，节点会被拉平，没有层级关系，通过观察可以发现节点树，可以发现是最里面的节点被解析完成，最后一个解析往往是父元素，故我们通过一个栈 (stack) 来记录节点的层级关系。
    
*   自闭合标签`<input />`不存在子节点, 故不需求 push 到栈 (stack)。
    

### optimize 优化器

优化器的作用主要是对生成的 AST 进行静态内容的优化，标记静态节点，为了每次重新渲染，不需要为静态子树创建新节点，可以跳过虚拟 DOM 中 patch 过程（即不需要参与第二次的页面渲染了，大大提升了渲染效率）。

#### 静态节点

遍历 AST 语法树，找出所有的静态节点并打上标记

```
function isStatic (node) {    // expression    if (node.type === 2) {      return false    }    // text    if (node.type === 3) {      return true    }    /**        1. 不能使用动态绑定语法，即标签上不能有v-、@、:开头的属性；        2. 不能使用v-if、v-else、v-for指令；        3. 不能是内置组件，即标签名不能是slot和component；        4. 标签名必须是平台保留标签，即不能是组件；        5. 当前节点的父节点不能是带有 v-for 的 template 标签；        6. 节点的所有属性的 key 都必须是静态节点才有的 key，注：静态节点的key是有限的，它只能是type,tag,attrsList,attrsMap,plain,parent,children,attrs之一；    */    return !!(node.pre || (      !node.hasBindings &&      !node.if && !node.for &&      !isBuiltInTag(node.tag) &&      isPlatformReservedTag(node.tag) &&      !isDirectChildOfTemplateFor(node) &&      Object.keys(node).every(isStaticKey)    ))}
```

#### 静态根节点

遍历经过上面步骤后的树，找出静态根节点，并打上标记

#### 优化器总结

*   没有使用 vue 独有的语法 (v-pre v-once 除外) 的节点就可以称为静态节点
    
*   静态节点：指当前节点及其所有子节点都是静态节点
    
*   静态根节点：指本身及所有子节点都是静态节点，但是父节点为动态节点的节点
    

### generate 代码生成器

代码生成器的作用是通过 AST 语法树生成代码字符串，代码字符串被包装进渲染函数，执行渲染函数后，可以得到一份 vnode

#### JS 的 with 语法

```
使用 with，能改变｛｝内自由变量的查找方式，将｛｝内自由变量，当做 obj 的属性来查找，如果找不到匹配的obj属性，就会报错
const obj = {a: 100, b: 200}
with(obj) {
     console.log(a)
     console.log(b)
     // console.log(c) // 会报错
}
```

#### 代码字符串

解析 parse 生成的 element ASTs，拼接成字符串

```
with(this){return _c('div',_c('p',[_v(message)])])}
```

#### 得到 render 函数

```
/** 代码字符串通过new Function('代码字符串')就可以得到当前组件的render函数 */const stringCode = `with(this){return _c('div',_c('p',[_v(message)])])}`const render = new Function(stringCode)
```

欲观看不同指令、插值、JS 表达式，可使用 vue-template 转换

```
const compiler = require('vue-template-compiler')// 插值const template = `<p>{{message}}</p>`const result = compiler.compile(template)console.log(result.render)// with(this){return _c('p',[_v(_s(message))])}
```

`vue 源代码找到缩写函数的含义`

模板编译的源码可以在 `vue-template-compiler`[2] 包中查看

```
function installRenderHelpers(target) {    target._c = createElement    // 标记v-once    target._o = markOnce    // 转换成Number类型    target._n = toNumber    // 转换成字符串    target._s = toString    // 渲染v-for    target._l = renderList    // 渲染普通插槽和作用域插槽    target._t = renderSlot    // 通过staticRenderFns渲染静态节点    target._m = renderStatic    // 获取过滤器    target._f = resolveFilter    // 检查键盘事件keycode    target._k = checkKeyCodes    target._b = bindObjectProps    // 创建文本vnode    target._v = createTextVNode    // 创建空vnode    target._e = createEmptyVNode    target._u = resolveScopedSlots    target._g = bindObjectListeners    // 处理修饰符    target._p = prependModifier}
```

综述
--

vue 脚手架中会使用 vue-loader 在开发环境做模板编译（预编译）

解析过程是一小段一小段的去截取字符串，然后维护一个`stack`用来保存 DOM 深度，当所有字符串都截取完之后也就解析出了一个完整的`AST`

优化过程是用递归的方式将所有节点打标记，表示是否是一个`静态节点`，然后再次递归一遍把`静态根节点`也标记出来

代码生成阶段是通过递归生成函数执行代码的字符串，递归的过程根据不同的`节点类型`调用不同的`生成方法`

### 参考资料

[1]

element ASTs: _http://caibaojian.com/vue-design/appendix/ast.html_

[2]

`vue-template-compiler`: _https://github.com/vuejs/vue/blob/v2.6.10/packages/vue-template-compiler/build.js_