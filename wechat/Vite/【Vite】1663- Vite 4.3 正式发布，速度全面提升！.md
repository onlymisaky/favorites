> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/lTTkBDZih05-WihgRcOvwQ)

4 月 20 日，Vite 4.3 正式发布。在这个版本中，Vite 团队专注于改进  devServer 的性能。简化了解析逻辑，优化了热路径，并对查找 package.json、TS 配置文件和一般解析 URL 实现了更智能的缓存。与 Vite 4.2 相比，这个版本的[速度得到了全面提升](http://mp.weixin.qq.com/s?__biz=MzU2MTIyNDUwMA==&mid=2247513736&idx=1&sn=c7067a660928a550db5cd6532a2269ce&chksm=fc7ef8d3cb0971c503ae02324d9d5db3e626afa5c704e1e6c2b4f155bd7e1c221682eea1b387&scene=21#wechat_redirect)！

性能提升
----

以下是性能改进的具体数据，由 sapphi-red/performance-compare 测试得出，该测试会以 1000 个 React 组件测试应用的冷启动和热启动时间以及根节点和叶节点组件的 HMR 时间：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Vite (babel)</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Vite 4.2</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Vite 4.3</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>改进</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>开发冷启动</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">17249.0ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">5132.4ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-70.2%</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>开发热启动</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">6027.8ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">4536.1ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-24.7%</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>根 HMR</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">46.8ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">26.7ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-42.9%</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>叶 HMR</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">27.0ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">12.9ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-52.2%</td></tr></tbody></table>

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Vite (swc)</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Vite 4.2</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>Vite 4.3</strong></th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;"><strong>改进</strong></th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>开发冷启动</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">13552.5ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">3201.0ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-76.4%</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>开发热启动</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">4625.5ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">2834.4ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-38.7%</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>根 HMR</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">30.5ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">24.0ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-21.3%</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><strong>叶 HMR</strong></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">16.9ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">10.0ms</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">-40.8%</td></tr></tbody></table>

![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMOaeZeibawFHcHibrCyC43mgN6DzKHbJcLVpVhfcXJX4eEicQaMFVUMZw3RrCK6JH19atIVySf6mR5vQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/EO58xpw5UMOaeZeibawFHcHibrCyC43mgNaE5dIlejyguRpm2ktjtEBYZwRy3aSvEOxDSriamM7zqFNvSibRrjib2gg/640?wx_fmt=png)

此性能运行的规格和版本：

*   CPU：Ryzen 9 5900X，内存：DDR4-3600 32GB，SSD：WD Blue SN550 NVME SSD
    
*   Windows 10 专业版 21H2 19044.2846
    
*   Node.js 18.16.0
    
*   Vite 和 React 插件版本
    

*   Vite 4.2 (babel): Vite 4.2.1 + plugin-react 3.1.0
    
*   Vite 4.3 (babel): Vite 4.3.0 + plugin-react 4.0.0-beta.1
    
*   Vite 4.2 (swc): Vite 4.2.1 + plugin-react-swc 3.2.0
    
*   Vite 4.3 (swc): Vite 4.3.0 + plugin-react-swc 3.3.0
    

Vite 团队将继续致力于提升 Vite 的性能，正在为 Vite 开发一个官方基准测试工具，以获得每个 Pull Request 的性能指标。vite-plugin-inspect 现在有更多与性能相关的功能，可以帮助开发者确定哪些插件或中间件是应用性能的瓶颈。页面加载后使用 `vite --profile`（然后按 p）将保存 devServer 启动的 CPU 配置文件。可以在应用中将它们作为 speedscope 打开以识别性能问题。

接下来，Vite 团队决定今年做一个 Vite 主版本，以配合 9 月 Node.js 16 的 EOL，放弃对 Node.js 14 和 16 的支持。

为什么 Vite 4.3 这么快？
-----------------

### 更智能的解析策略

Vite 会将所有接收到的 URL 和路径解析为目标模块。在 Vite 4.2 中，存在很多冗余的解析逻辑和不必要的模块搜索。为了减少计算和文件系统调用，Vite 4.3 使解析逻辑更简单、更严格和更准确。

#### 更简单的解析

Vite 4.2 严重依赖 resolve 包来解析依赖的 package.json，查看 resolve 的源码发现解析 package.json 时有很多无用的逻辑。Vite 4.3 摒弃了 resolve，遵循更简单的 resolve 逻辑：**直接检查嵌套父目录中是否存在 package.json**。

#### 更严格的解析

Vite 必须调用 Nodejs fs API 来查找模块。但是 IO 很昂贵。Vite 4.3 缩小了文件搜索范围，并跳过搜索一些特殊路径，以尽可能减少 fs 调用。例如：

1.  由于 # 符号不会出现在 URL 中，用户可以控制源文件路径中没有 # 符号，因此 Vite 4.3 不再检查用户源文件中带有 # 符号的路径，而是仅在 node_modules 中搜索它们。
    
2.  在 Unix 系统中，Vite 4.2 会先检查根目录下的每一个绝对路径，对大多数路径都可以，但是如果绝对路径以根开头就很容易失败。为了在 /root/root 不存在的情况下跳过搜索 /root/root/path-to-file，Vite 4.3 会在开头判断 /root/root 作为目录是否存在，并预先缓存结果。
    
3.  当 Vite 服务器收到 `@fs/xxx` 和 `@vite/xxx` 时，就不需要再解析这些 URL。Vite 4.3 直接返回之前缓存的结果，不再重新解析。
    

#### 更准确的解析

Vite 4.2 在文件路径为目录时递归解析模块，会导致不必要的重复计算。Vite 4.3 将递归解析扁平化，并对不同类型的路径应用适当的解析，展平后缓存一些 fs 调用也更容易。

### 包解析

Vite 4.3 打破了解析 node_modules 包数据的性能瓶颈。Vite 4.2 使用绝对文件路径作为包数据缓存键。这还不够，因为 Vite 必须遍历 `pkg/foo/bar` 和 `pkg/foo/baz` 中的同一个目录。

Vite 4.3 不仅使用了绝对路径 (`/root/node_modules/pkg/foo/bar.js` & `/root/node_modules/pkg/foo/baz.js`)，还使用了遍历目录 (`/root/node_modules/pkg/foo` & `/root/node_modules/pkg`) 作为 `pkg` 缓存的键。

另一种情况是，Vite 4.2 在单个函数中查找深层导入路径的 `package.json`，例如 Vite 4.2 解析 `a/b/c/d` 等文件路径时，首先检查根 `a/package.json` 是否存在， 如果没有，则按照`a/b/c/package.json` -> `a/b/package.json`的顺序查找最近的`package.json`，但事实是查找根`package.json`和最近的`package.json`应该分开处理 ，因为在不同的解析上下文中需要它们。Vite 4.3 将根 `package.json` 和最近的 `package.json` 解析分成两部分，这样它们就不会混在一起。

### fs.realpathSync 问题

Nodejs 中有一个有趣的 realpathSync 问题，它指出 `fs.realpathSync` 比 `fs.realpathSync.native` 慢 70 倍。但 Vite 4.2 仅在非 Windows 系统上使用 `fs.realpathSync.native`，因为它在 Windows 上的行为不同。为了解决这个问题，Vite 4.3 在 Windows 上调用 `fs.realpathSync.native` 时添加了网络驱动器验证。

### 非阻塞任务

作为一个按需服务，Vite dev server 可以在没有准备好所有东西的情况下启动。

#### 非阻塞 tsconfig 解析

Vite 服务器在预绑定 ts 或 tsx 时需要 `tsconfig` 数据。

Vite 4.2 在服务端启动之前，在插件钩子 `configResolved` 中等待 `tsconfig` 数据解析完成。一旦服务器启动而没有准备好 `tsconfig` 数据，页面请求就可以访问服务器，即使请求可能需要稍后等待 `tsconfig` 解析。

Vite 4.3 会在服务器启动前初始化 `tsconfig` 解析，但服务器不会等待。解析过程在后台运行。一旦有 ts 相关的请求进来，就得等`tsconfig`解析完了。

#### 非阻塞文件处理

Vite 中有大量的 fs 调用，其中一些是同步的。这些同步 fs 调用可能会阻塞主线程。Vite 4.3 将它们改为异步。此外，并行化异步函数也更容易。关于异步函数，可能有许多 Promise 对象在解析后要释放。由于更智能的解析策略，释放 fs-Promise 对象的成本要低得多。

### HMR 防抖

考虑两个简单的依赖链 C <- B <- A & D <- B <- A，当 A 被编辑时，HMR 将从 A 传播到 C 和 A 传播到 D。这导致 A 和 B 在 Vite 4.2 中被更新两次。

Vite 4.3 缓存了这些遍历的模块，以避免多次搜索它们，它适用于由 git checkout 触发的 HMR。

### 并行化

并行化始终是获得更好性能的好选择。在 Vite 4.3 中，我们并行化了一些核心功能，包括导入分析、提取 deps 的导出、解析模块 url 和运行批量优化器。

### Javascript 优化

#### 用回调替换 *yield

Vite 使用 `tsconfck` 来查找和解析 `tsconfig` 文件。`tsconfck` 曾经通过 `*yield` 遍历目标目录，生成器的一个缺点是它需要更多的内存空间来存储它的生成器对象，并且在运行时会有大量的生成器上下文切换。所以从 v2.1.1 开始在核心中用回调替换 `*yield`。

#### 使用 === 代替 startsWith 和 endsWith

Vite 4.2 使用 `startsWith` 和 `endsWith` 检查热更新 URL 中的头部和尾部 '/'。比较 `str.startsWith('x')` 和 `str[0] === 'x'` 的执行基准发现，`===` 比 `startsWith` 快约 20%，`endsWith` 比 === 慢约 60%。

#### 避免重复创建正则表达式

Vite 需要很多正则表达式来匹配字符串，其中大部分都是静态的，因此只使用它们的单例会更好。Vite 4.3 将正则表达式提升，以便可以重复使用它们。

#### 放弃生成自定义错误

在 Vite 4.2 中，有一些自定义错误以改进开发体验。这些错误可能会导致额外的计算和垃圾回收，从而降低 Vite 的速度。在 Vite 4.3 中，放弃了生成某些热更新自定义错误（例如 `package.json` NOT_FOUND 错误），直接抛出原始错误以获得更好的性能。

**参考资料：**

> *   https://vitejs.dev/blog/announcing-vite4-3.html
>     
> *   https://sun0day.github.io/blog/vite/why-vite4_3-is-faster.html
>     

###   

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步