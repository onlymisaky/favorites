> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PufzuuNAo5gTbYl7tejL8w)

```
大厂技术  高级前端  Node进阶


点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群
```

Vite 4.3 相比 Vite 4.2 取得了惊人的性能提升，下面和大家分享一下 Vite 4.3 性能大幅提升的幕后技术细节，深度阅读，全程高能。

![](https://mmbiz.qpic.cn/mmbiz_png/3LcRhAf5AsbwXGeic3E85rWnlRxQgiboqBsnMWB4TvVTp0ObCmuIN6w5r1bhficVsuAic1VCJYQA1QfkuArvg200Tg/640?wx_fmt=png&from=appmsg)

`fs.realpathSync` 的 bug
-----------------------

你可能不知道，Node 中有一个冷门的 `realpathSync` 性能问题 —— **`fs.realpathSync` 比 `fs.realpathSync.native` 慢了整整 `70` 倍。**

虽然但是，由于在 Windows 上的行为不同，Vite 4.2 只在非 Windows 系统上使用 `fs.realpathSync.native`。

为了搞定这个 bug，Vite 4.3 在 Windows 上调用 `fs.realpathSync.native` 时添加了网络驱动验证。

Vite 从未放弃 Windows，它真的...... 我哭死。

JS 重构优化
-------

当我们重构项目时，千万不要忘记针对编程语言自身的优化。

Vite 4.3 中有若干有趣的 JS 优化的具体例子：

### 1. 将 `*yield` 重构为回调函数

Vite 使用 `tsconfck` 模块来查找和解析 `tsconfig` 文件。`tsconfck` 模块源码通过 `*yield` 遍历指定目录。

Generater（生成器函数）的短板之一在于，它需要更多的内存开销来存储其 `Generator` 对象，且生成器中存在一大坨生成器上下文切换运行。

因此，自 `tsconfck` 2.1.1 以来，该模块源码用回调函数重构了 `*yield`。

### 2. 将 `startsWith/endsWith` 重构为 `=== 运算符`

Vite 4.2 使用 `startsWith/endsWith` 来检查热门 URL 中的 `'/'` 前缀和后缀。

我们测评了 `str.startsWith('x') 和 str[0] === 'x'` 的执行基准跑分，发现 `===` 比 `startsWith` 快约 20%，同时 `endsWith` 比 `===` 慢约 60%。

### 3. 避免重新创建正则表达式

Vite 需要许多正则表达式来匹配字符串，其中大多数都是静态的，所以最好只使用它们的单例。

Vite 4.3 优化了正则表达式，这样就可以重复使用它们。

### 4. 放弃生成自定义错误

为了更好的开发体验，Vite 4.2 提供了若干自定义错误。

不幸的是，这些自定义错误可能会导致额外的计算和垃圾回收，降低 Vite 的速度。

在 Vite 4.3 中，我们不得不放弃生成某些热门的自定义错误，比如 `package.json NOT_FOUND` 错误，取而代之的是直接抛出原始错误，从而获取更高的性能。

更机智的解析策略
--------

Vite 会解析所有已接收的 URL 和路径，从而获取目标模块。

Vite 4.2 中存在一大坨冗余的解析逻辑和非必要的模块搜索。

Vite 4.3 的解析逻辑更精简和严格，减少了计算量和 `fs` 调用。

### 1. 更简单的解析

Vite 4.2 重度依赖 `resolve` 模块来解析依赖的 `package.json。`

但当我们偷看 `resolve` 模块的源码时，发现在解析 `package.json` 时存在一大坨无用逻辑。

于是 Vite 4.3 弃用了 `resolve` 模块，遵循更精简的解析逻辑：直接检查嵌套父目录中是否存在 `package.json`。

### 2. 更严格的解析

Vite 需要调用 Node 的 `fs` API 来查找模块，但 IO 成本十分昂贵。

Vite 4.3 缩小了文件搜索范围，并跳过搜索某些特殊路径，尽量减少 `fs` 调用。

举个栗子：

1.  由于 `#` 符号不会出现在 URL 中，且用户可以控制源文件路径中不存在 `#` 符号，因此 Vite 4.3 不再检查用户源文件中带有 `#` 符号的路径，而只在 `node_modules` 中搜索它们。
    
2.  在 Unix 系统中，Vite 4.2 首先检查根目录内的每个绝对路径，对于大多数路径而言问题不大。但如果绝对路径以 `root` 开头，那大概率会失败。为了在 `/root/root` 不存在时，跳过搜索 `/root/root/path-to-file`，Vite 4.3 会在开头判断 `/root/root` 是否作为目录存在，并预缓存结果。
    
3.  当 Vite 服务器接收到 `@fs/xxx` 和 `@vite/xxx` 时，无需再次解析这些 URL。Vite 4.3 直接返回之前缓存的结果，不再重新解析。
    

### 3. 更准确的解析

当文件路径为目录时，Vite 4.2 会递归解析模块，这会导致不必要的重复计算。

Vite 4.3 将递归解析扁平化，针对不同类型的路径对症下药。拍平后缓存某些 `fs` 调用也更容易。

### 4. package

Vite 4.3 打破了解析 `node_modules` 包数据的性能瓶颈。

Vite 4.2 使用绝对文件路径作为包数据缓存键。这还不够，因为 Vite 必须在 `pkg/foo/bar` 和 `pkg/foo/baz` 中遍历相同的目录。

Vite 4.3 不仅使用绝对路径，比如 `/root/node_modules/pkg/foo/bar.js` 和 `/root/node_modules/pkg/foo/baz.js`，还使用遍历的目录作为 `pkg` 缓存的键，比如`/root/node_modules/pkg/foo` 和 `/root/node_modules/pkg`。

另一种情况是，Vite 4.2 在单个函数内查找深度导入路径的 `package.json。`

举个栗子，当 Vite 4.2 解析 `a/b/c/d` 这样的文件路径时，它首先检查根 `a/package.json` 是否存在。

如果不存在，那就按 `a/b/c/package.json` -> `a/b/package.json` 的顺序查找最近的 `package.json。`

但事实上，查找根 `package.json` 和最近的 `package.json` 应该分而治之，因为它们需要不同的解析上下文。

Vite 4.3 将根 `package.json` 和最近的 `package.json` 的解析分而治之，这样它们就不会混合。

非阻塞任务优化
-------

作为一种按需服务，Vite 开发服务器无需备妥所有东东就能启动。

### 1. 非阻塞 `tsconfig` 解析

Vite 服务器在预打包 `ts/tsx` 时需要 `tsconfig` 的数据。

Vite 4.2 在服务器启动前，会在 `configResolved` 插件钩子中等待解析 `tsconfig` 的数据。

一旦服务器启动而尚未备妥 `tsconfig` 的数据，即使该请求稍后需要等待 `tsconfig` 解析，页面请求也可以访问服务器，

Vite 4.3 在服务器启动前初始化 `tsconfig` 解析，但服务器不会等待它。

解析过程在后台运行。一旦 `ts` 相关的请求进来，它就必须等待 `tsconfig` 解析完成。

### 2. 非阻塞文件处理

Vite 中存在一大坨 `fs` 调用，其中某些是同步的。

这些同步 `fs` 调用可能会阻塞主线程，所以 Vite 4.3 将其更改为异步。此外，异步函数的并行化也更容易。

关于异步函数，我们关注的一件事是，解析后可能需要释放一大坨 `Promise` 对象。

得益于更机智的解析策略，释放 `fsPromise`对象的成本要低得多。

HMR 防抖
------

请考虑两个简单的依赖链 `C <- B <- A` 和 `D <- B <- A。`

当编辑 `A` 时，HMR 会将两者从 `A` 传播到 `C` 到 `D`。这导致 `A` 和 `B` 在 Vite 4.2 中更新了两次。

Vite 4.3 会缓存这些遍历过的模块，避免多次探索它们。

这可能会对那些具有组件集装导入的文件结构产生重大影响。这对于 `git checkout` 触发的 HMR 也有好处。

并行化
---

并行化始终是获取更好性能的不错选择。

在 Vite 4.3 中，我们并行化了若干核心功能，包括但不限于导入分析、提取 `deps` 的导出、解析模块 url 和运行批量优化器。

基准测试生态系统
--------

*   `vite-benchmark`：Vite 使用此仓库来测评每个提交的跑分，如果您正在使用 Vite 开发大型项目，我们很乐意测试您的仓库，以获得更全面的性能。
    
*   `vite-plugin-inspect`:`vite-plugin-inspect` 从 0.7.20 版本开始支持显示插件的钩子时间，并且将来会有更多的跑分图。
    
*   `vite-plugin-warmup`：预热您的 Vite 服务器，并提升页面加载速度！
    

### 最后  

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下
```