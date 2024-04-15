> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Qrpfed69-nvSJKR_GccQgA)

```
<div id="app">
    <test-input></test-input>
</div>
<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
<script>
    // 将组件 URL 挂载到 script 标签上，然后通过 window 获取这个组件
    await lodaScript('http://localhost/component/input/0.1.0/bundle.js')
    app.component('TestInput', window.TestInput)
</script>
```

背景
--

最近的项目有一个加载远程组件的需求。基于此我对 Vue 加载远程组件的方案进行了研究，并且整理了两个可行的解决方案。

HTML 文件 + umd 组件
----------------

这个方案是最简单、最容易实现的。组件以 umd 的格式进行打包，然后在 HTML 文件中直接使用。

```
import { reactive } from 'vue'
// other code...
```

但是这个方案不适合在大型项目中使用，效率比较低。

Vue 工程项目 + esm /umd 组件
----------------------

Vue 工程项目 + esm /umd 组件是我目前在使用的方案，但是在研究的过程中遇到了两个问题，逐一解决后，才把这个方案趟通了。

### 第一个问题 `Relative references must start with either "/", "./", or "../"`

由于我们的项目不需要兼容 IE，所以打包组件采用的是 esm 格式。打包后的组件源码如下：

```
const { default: TestInput } = await import('http://localhost/component/input/0.1.0/bundle.mjs')
```

然后在主项目中进行引用：

```
import * as Vue from 'vue'
window.Vue = Vue
```

在动态导入远程组件到项目时，提示报错 `Relative references must start with either "/", "./", or "../"`。这是因为在浏览器中不支持以 `import { reactive } from 'vue'` 的方式进行导入，得把 `'vue'` 改成 `https://..../vue.js` 或者 `'./vue.js'` 的形式才可以。平时我们这样用没问题是因为有 vite、webpack 等构建工具帮忙解决了这个问题。

### 第二个问题 Vue 上下文环境不同

产生上面的问题是因为要引入依赖，如果打包组件时把相关依赖都打在一起，那不就没有 import 语句了。结果试了一下还是不行，因为当前的 Vue 主项目和打包好的 Vue 组件存在两个不同的 Vue 上下文。导致在加载组件时报错，比如提示 `xxx 变量找不到` 这种问题。

![](https://mmbiz.qpic.cn/mmbiz_png/rSNuFXbuCQdF4RfUblhYIyl5PZpG7WN6N03fpAYxicibnUA3zHaM5CqXqvc8hibp5YG8f65Q7SQdJxculyCe54AjA/640?wx_fmt=png)

虽然主项目和远程组件使用的 Vue 方法都是一样的，但由于各自的 Vue 上下文不一样，导致主项目无法正常使用远程组件。

以上两个问题困扰了我一天的时间，但是睡醒一觉后，终于想到了如何解决这两个问题。首先在浏览器上不能直接使用 `import { reactive } from 'vue'` 这种语句，那把它改成 `const { reactive } = Vue` 就能解决这个问题了。至于第二个问题，打包时不把依赖打在一起，而是在 `main.js` 文件中直接把整个 Vue 引进来：

```
const { default: TestInput } = await import('http://localhost/component/input/0.1.0/bundle.mjs')
```

这样就能确保主项目和远程组件使用的是同一个 Vue 上下文。

为了解决代码转换问题，我写了一个 rollup-plugin-import-to-const[1] 插件（支持 rollup、vite），打包 esm 组件时，它会自动的把 `import { reactive } from 'vue'` 转换成 `const { reactive } = Vue` 。

至此，就可以在主项目中加载远程 esm 组件了：

```
import * as Vue from 'vue'
window.Vue = Vue
```

其实只要能解决上面的两个问题，不管是 esm 还是 umd、cjs 等格式，都能够实现加载远程组件的方案。比如换成 umd 的格式来打包组件，就不需要引入 rollup 插件去转换代码了，并且还能支持 webpack。唯一要做的只是在 `main.js` 上把 Vue 全引进来挂到 window 下。

```
import * as Vue from 'vue'
window.Vue = Vue
```

总结
--

远程组件的方案其实不止上面两种，比如还有直接加载 `.vue` 文件的方案，有个现成的 vue3-sfc-loader[2] 插件能用。一般来说，加载远程组件的应用场景比较少，所以网上能搜到的讨论也比较少。目前比较常见的应用场景应该就是在低代码平台中加载远程组件了。

### References

`[1]` rollup-plugin-import-to-const: _https://github.com/woai3c/rollup-plugin-import-to-const_  
`[2]` vue3-sfc-loader: _https://github.com/FranckFreiburger/vue3-sfc-loader_

### 最后  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下
```