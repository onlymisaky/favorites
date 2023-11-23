> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/u5b8t0xMx4IG5tdEEtVsDg)

大厂技术  高级前端  Node 进阶  

======================

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

来源：leaf（a1029563229 ）  

https://github.com/a1029563229/blogs/blob/master/Source-Code/qiankun/1.md

本文将针对微前端框架 `qiankun` 的源码进行深入解析，在源码讲解之前，我们先来了解一下什么是 `微前端`。

`微前端` 是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将单页面前端应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。各个前端应用还可以独立开发、独立部署。同时，它们也可以在共享组件的同时进行并行开发——这些组件可以通过 `NPM` 或者 `Git Tag、Git Submodule` 来管理。

`qiankun（乾坤）` 就是一款由蚂蚁金服推出的比较成熟的微前端框架，基于 `single-spa` 进行二次开发，用于将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGNS2E4zZGnFz26NCMDGeSBfUiavfblUBSGUeq6v9ia7dVd7FeqgicVjm1Q/640?wx_fmt=jpeg)qiankun

那么，话不多说，我们的源码解析正式开始。

初始化全局配置 - `start(opts)`
-----------------------

我们从两个基础 API - `registerMicroApps(apps, lifeCycles?) - 注册子应用` 和 `start(opts?) - 启动主应用` 开始，由于 `registerMicroApps` 函数中设置的回调函数较多，并且读取了 `start` 函数中设置的初始配置项，所以我们从 `start` 函数开始解析。

我们从 `start` 函数开始解析（见下图）：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGBc2z1EGWYe6LKfQJeQyOpbldIzJqpMheibqJ8lXXvxUzqX8ekJZMq7A/640?wx_fmt=png)qiankun

我们对 `start` 函数进行逐行解析：

*   `第 196 行`：设置 `window` 的 `__POWERED_BY_QIANKUN__` 属性为 `true`，在子应用中使用 `window.__POWERED_BY_QIANKUN__` 值判断是否运行在主应用容器中。
    
*   `第 198~199 行`：设置配置参数（有默认值），将配置参数存储在 `importLoaderConfiguration` 对象中；
    
*   `第 201~203 行`：检查 `prefetch` 属性，如果需要预加载，则添加全局事件 `single-spa:first-mount` 监听，在第一个子应用挂载后预加载其他子应用资源，优化后续其他子应用的加载速度。
    
*   `第 205 行`：根据 `singularMode` 参数设置是否为单实例模式。
    
*   `第 209~217 行`：根据 `jsSandbox` 参数设置是否启用沙箱运行环境，旧版本需要关闭该选项以兼容 IE。（新版本在单实例模式下默认支持 IE，多实例模式依然不支持 IE）。
    
*   `第 222 行`：调用了 `single-spa` 的 `startSingleSpa` 方法启动应用，这个在 `single-spa` 篇我们会单独剖析，这里可以简单理解为启动主应用。
    

从上面可以看出，`start` 函数负责初始化一些全局设置，然后启动应用。这些初始化的配置参数有一部分将在 `registerMicroApps` 注册子应用的回调函数中使用，我们继续往下看。

注册子应用 - `registerMicroApps(apps, lifeCycles?)`
----------------------------------------------

`registerMicroApps` 函数的作用是注册子应用，并且在子应用激活时，创建运行沙箱，在不同阶段调用不同的生命周期钩子函数。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGibpibV3rcf8fgEQ0QNTucj5NwCTM0utqS2LPwMRl4ThCXC2Ns1SXYWgw/640?wx_fmt=png)qiankun

从上面可以看出，在 `第 70~71 行` 处 `registerMicroApps` 函数做了个处理，防止重复注册相同的子应用。

在 `第 74 行` 调用了 `single-spa` 的 `registerApplication` 方法注册了子应用。

我们直接来看 `registerApplication` 方法，`registerApplication` 方法是 `single-spa` 中注册子应用的核心函数。该函数有四个参数，分别是

*   `name（子应用的名称）`
    
*   `回调函数（activeRule 激活时调用）`
    
*   `activeRule（子应用的激活规则）`
    
*   `props（主应用需要传递给子应用的数据）`
    

这些参数都是由 `single-spa` 直接实现，这里可以先简单理解为注册子应用（这个我们会在 `single-spa` 篇展开说）。在符合 `activeRule` 激活规则时将会激活子应用，执行回调函数，返回一些生命周期钩子函数（见下图）。

> 注意，这些生命周期钩子函数属于 `single-spa`，由 `single-spa` 决定在何时调用，这里我们从函数名来简单理解。（`bootstrap` - 初始化子应用，`mount` - 挂载子应用，`unmount` - 卸载子应用）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG4kqD5B44KNguO06hfvnX6wHAXzJrdOdgZUyOkTLkz42cx2NuicOvcgw/640?wx_fmt=png)qiankun

如果你还是觉得有点懵，没关系，我们通过一张图来帮助理解。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGZgibgkORQtqaibb7ib2DiaibKowZRP7HW9bg5hJynapqJIKmwfBmbAUJg1A/640?wx_fmt=png)qiankun

### 获取子应用资源 - import-html-entry

我们从上面分析可以看出，`qiankun` 的 `registerMicroApps` 方法中第一个入参 `apps - Array<RegistrableApp<T>>` 有三个参数 `name、activeRule、props` 都是交给 `single-spa` 使用，还有 `entry` 和 `render` 参数还没有用到。

我们这里需要关注 `entry（子应用的 entry 地址）` 和 `render（子应用被激活时触发的渲染规则）` 这两个还没有用到的参数，这两个参数延迟到 `single-spa` 子应用激活后的回调函数中执行。

那我们假设此时我们的子应用已激活，我们来看看这里做了什么。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGcGdYwFXNwNJFY6cGrX8dugkPCmBYApicxm3FcFgYzSoiaVrX7biajspTQ/640?wx_fmt=png)qiankun

从上图可以看出，在子应用激活后，首先在 `第 81~84 行` 处使用了 `import-html-entry` 库从 `entry` 进入加载子应用，加载完成后将返回一个对象（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGhOMSEdhbRGaOpY7sPSBJaCdibpyPsicSicC7wOia50BjfaMggXIRfkF3kQ/640?wx_fmt=png)qiankun

我们来解释一下这几个字段

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">字段</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">解释</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>template</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">将脚本文件内容注释后的 <code>html</code> 模板文件</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>assetPublicPath</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">资源地址根路径，可用于加载子应用资源</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>getExternalScripts</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">方法：获取外部引入的脚本文件</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>getExternalStyleSheets</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">方法：获取外部引入的样式表文件</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>execScripts</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">方法：执行该模板文件中所有的 <code>JS</code> 脚本文件，并且可以指定脚本的作用域 - <code>proxy</code> 对象</td></tr></tbody></table>

我们先将 `template 模板`、`getExternalScripts` 和 `getExternalStyleSheets` 函数的执行结果打印出来，效果如下（见下图）：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGFaFRkDoiaQSicRibOrPkTB9Bzic1uPTxESPMgAu91FTzukQJB1hf3g5VEw/640?wx_fmt=png)qiankun

从上图我们可以看到我们外部引入的三个 `js` 脚本文件，这个模板文件没有外部 `css` 样式表，对应的样式表数组也为空。

然后我们再来分析 `execScripts` 方法，该方法的作用就是指定一个 `proxy`（默认是 `window`）对象，然后执行该模板文件中所有的 `JS`，并返回 `JS` 执行后 `proxy` 对象的最后一个属性（见下图 1）。在微前端架构中，这个对象一般会包含一些子应用的生命周期钩子函数（见下图 2），主应用可以通过在特定阶段调用这些生命周期钩子函数，进行挂载和销毁子应用的操作。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGKw35M0iaxylqwcsqw0d0BvNM3O2vUhtsI2gKfRTR1alkCJNq2wAHSDA/640?wx_fmt=png)qiankun![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGazfhMdcvSpQKBhrNIj0ZCbgvAD77SuRL6YebPIRlItVFrz11yicmk4g/640?wx_fmt=png)qiankun

在 `qiankun` 的 `importEntry` 函数中还传入了配置项 `getTemplate`，这个其实是对 `html` 目标文件的二次处理，这里就不作展开了，有兴趣的可以自行去了解一下。

### 主应用挂载子应用 HTML 模板

我们回到 `qiankun` 源码部分继续看（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGHlBHt3G9qAWsh6BJ95Zg4HzpZCqJI34MjTjbiaiaF3PicWz1ZziaMzkbCw/640?wx_fmt=png)qiankun

从上图看出，在 `第 85~87 行` 处，先对单实例进行检测。在单实例模式下，新的子应用挂载行为会在旧的子应用卸载之后才开始。

在 `第 88 行` 中，执行注册子应用时传入的 `render` 函数，将 `HTML Template` 和 `loading` 作为入参，`render` 函数的内容一般是将 `HTML` 挂载在指定容器中（见下图）。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG7UTkhOJCRzYBibWF4v7dHGIBp7HUs8C04iacg5o0rUgy2CzUDt9LykTA/640?wx_fmt=png)qiankun

在这个阶段，主应用已经将子应用基础的 `HTML` 结构挂载在了主应用的某个容器内，接下来还需要执行子应用对应的 `mount` 方法（如 `Vue.$mount`）对子应用状态进行挂载。

此时页面还可以根据 `loading` 参数开启一个类似加载的效果，直至子应用全部内容加载完成。

### 沙箱运行环境 - genSandbox

我们回到 `qiankun` 源码部分继续看，此时还是子应用激活时的回调函数部分（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG4wPqnZkfOM8gnN9ngUVoXpibGb7AibEozVNwAwv0GuqOcwtRA4KZgOgg/640?wx_fmt=png)qiankun

在 `第 90~98 行` 是 `qiankun` 比较核心的部分，也是几个子应用之间状态独立的关键，那就是 `js` 的沙箱运行环境。如果关闭了 `useJsSandbox` 选项，那么所有子应用的沙箱环境都是 `window`，就很容易对全局状态产生污染。

我们进入到 `genSandbox` 内部，看看 `qiankun` 是如何创建的 `（JS）沙箱运行环境`。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGo9RVo79XcyjGD6NbOZbl4gMvnH3Vd9fgExs1712cfC1wGAjSbtoUFQ/640?wx_fmt=png)qiankun

从上图可以看出 `genSandbox` 内部的沙箱主要是通过是否支持 `window.Proxy` 分为 `LegacySandbox` 和 `SnapshotSandbox` 两种。

> 扩展阅读：多实例还有一种 `ProxySandbox` 沙箱，这种沙箱模式目前看来是最优方案。由于其表现与旧版本略有不同，所以暂时只用于多实例模式。
> 
> `ProxySandbox` 沙箱稳定之后可能会作为单实例沙箱使用。

#### LegacySandbox

我们先来看看 `LegacySandbox` 沙箱是怎么进行状态隔离的（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGCM3d0yjibFialJWUEvXSMK327eicY76yUQMibOJdWTrB72rCMabPpKMtsg/640?wx_fmt=png)qiankun

我们来分析一下 `LegacySandbox` 类的几个属性：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">字段</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">解释</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>addedPropsMapInSandbox</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">记录沙箱运行期间新增的全局变量</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>modifiedPropsOriginalValueMapInSandbox</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">记录沙箱运行期间更新的全局变量</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>currentUpdatedPropsValueMap</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">记录沙箱运行期间操作过的全局变量。上面两个 <code>Map</code> 用于 <code>关闭沙箱</code> 时还原全局状态，而 <code>currentUpdatedPropsValueMap</code> 是在 <code>激活沙箱</code> 时还原沙箱的独立状态</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>name</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">沙箱名称</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>proxy</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代理对象，可以理解为子应用的 <code>global/window</code> 对象</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>sandboxRunning</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">当前沙箱是否在运行中</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>active</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">激活沙箱，在子应用挂载时启动</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>inactive</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">关闭沙箱，在子应用卸载时启动</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>constructor</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">构造函数，创建沙箱环境</td></tr></tbody></table>

我们现在从 `window.Proxy` 的 `set` 和 `get` 属性来详细讲解 `LegacySandbox` 是如何实现沙箱运行环境的。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGezkKDDwTkkBbhQjibNrbd3tMqgeS4rnI9G4ZL3DWhjf7TRu4v9EPS1w/640?wx_fmt=png)qiankun

> 注意：子应用沙箱中的 `proxy` 对象（`第 62 行`）可以简单理解为子应用的 `window` 全局对象（代码如下），子应用对全局属性的操作就是对该 `proxy` 对象属性的操作，带着这份理解继续往下看吧。

```
// 子应用脚本文件的执行过程：eval(  // 这里将 proxy 作为 window 参数传入  // 子应用的全局对象就是该子应用沙箱的 proxy 对象  (function(window) {    /* 子应用脚本文件内容 */  })(proxy));
```

在 `第 65~72 行中`，当调用 `set` 向子应用 `proxy/window` 对象设置属性时，所有的属性设置和更新都会先记录在 `addedPropsMapInSandbox` 或 `modifiedPropsOriginalValueMapInSandbox` 中，然后统一记录到`currentUpdatedPropsValueMap` 中。

在 `第 73 行` 中修改全局 `window` 的属性，完成值的设置。

当调用 `get` 从子应用 `proxy/window` 对象取值时，会直接从 `window` 对象中取值。对于非构造函数的取值将会对 `this` 指针绑定到 `window` 对象后，再返回函数。

`LegacySandbox` 的沙箱隔离是通过激活沙箱时还原子应用状态，卸载时还原主应用状态（子应用挂载前的全局状态）实现的，具体实现如下（见下图）。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGAibmcoAMIoryqpdrA4Dnogic681oIRMryPDct8P4jaOwR2sFyMOWrjKQ/640?wx_fmt=png)qiankun

从上图可以看出：

*   `第 37 行`：在激活沙箱时，沙箱会通过 `currentUpdatedPropsValueMap` 查询到子应用的独立状态池（沙箱可能会激活多次，这里是沙箱曾经激活期间被修改的全局变量），然后还原子应用状态。
    
*   `第 44~45 行`：在关闭沙箱时，通过 `addedPropsMapInSandbox` 删除在沙箱运行期间新增的全局变量，通过 `modifiedPropsOriginalValueMapInSandbox` 还原沙箱运行期间被修改的全局变量，从而还原到子应用挂载前的状态。
    

从上面的分析可以得知，`LegacySandbox` 的沙箱隔离机制利用快照模式实现，我们画一张图来帮助理解（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGlOeicCRWXJnKH56ZV9yCibTtSAsia8zT4XiczGibVOku9xv87Hh921HtshA/640?wx_fmt=png)qiankun

#### 多实例沙箱 - ProxySandbox

`ProxySandbox` 是一种新的沙箱模式，目前用于多实例模式的状态隔离。在稳定后以后可能会成为 `单实例沙箱`，我们来看看 `ProxySandbox` 沙箱是怎么进行状态隔离的（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGwfMSNrXgv58ERBG84upYFCAedbiaZ8Put7sAokkOm3S9TMa4gLBNM7g/640?wx_fmt=png)qiankun

我们来分析一下 `ProxySandbox` 类的几个属性：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">字段</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">解释</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>updateValueMap</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">记录沙箱中更新的值，也就是每个子应用中独立的状态池</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>name</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">沙箱名称</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>proxy</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代理对象，可以理解为子应用的 <code>global/window</code> 对象</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>sandboxRunning</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">当前沙箱是否在运行中</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>active</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">激活沙箱，在子应用挂载时启动</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>inactive</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">关闭沙箱，在子应用卸载时启动</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>constructor</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">构造函数，创建沙箱环境</td></tr></tbody></table>

我们现在从 `window.Proxy` 的 `set` 和 `get` 属性来详细讲解 `ProxySandbox` 是如何实现沙箱运行环境的。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGyCGhBJ8JmWpZiaoRF5M8CX8fjDB7AR8wJFL1hnkwyV8icAicqJ66NFzcg/640?wx_fmt=png)qiankun

> 注意：子应用沙箱中的 `proxy` 对象可以简单理解为子应用的 `window` 全局对象（代码如下），子应用对全局属性的操作就是对该 `proxy` 对象属性的操作，带着这份理解继续往下看吧。

```
// 子应用脚本文件的执行过程：eval(  // 这里将 proxy 作为 window 参数传入  // 子应用的全局对象就是该子应用沙箱的 proxy 对象  (function(window) {    /* 子应用脚本文件内容 */  })(proxy));
```

当调用 `set` 向子应用 `proxy/window` 对象设置属性时，所有的属性设置和更新都会命中 `updateValueMap`，存储在 `updateValueMap` 集合中（`第 38 行`），从而避免对 `window` 对象产生影响（旧版本则是通过 `diff` 算法还原 `window` 对象状态快照，子应用之间的状态是隔离的，而父子应用之间 `window` 对象会有污染）。

当调用 `get` 从子应用 `proxy/window` 对象取值时，会优先从子应用的沙箱状态池 `updateValueMap` 中取值，如果没有命中才从主应用的 `window` 对象中取值（`第 49 行`）。对于非构造函数的取值将会对 `this` 指针绑定到 `window` 对象后，再返回函数。

如此一来，`ProxySandbox` 沙箱应用之间的隔离就完成了，所有子应用对 `proxy/window` 对象值的存取都受到了控制。设置值只会作用在沙箱内部的 `updateValueMap` 集合上，取值也是优先取子应用独立状态池（`updateValueMap`）中的值，没有找到的话，再从 `proxy/window` 对象中取值。

相比较而言，`ProxySandbox` 是最完备的沙箱模式，完全隔离了对 `window` 对象的操作，也解决了快照模式中子应用运行期间仍然会对 `window` 造成污染的问题。

我们对 `ProxySandbox` 沙箱画一张图来加深理解（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGgzglxSslDJn8APia564pvmHvphfEHJb0g4H6GWstlw2OMr3OjeR7VBQ/640?wx_fmt=png)qiankun

#### SnapshotSandbox

在不支持 `window.Proxy` 属性时，将会使用 `SnapshotSandbox` 沙箱，我们来看看其内部实现（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG569u9f3bxjrrugO2ic5XmX7b78IliahNhDskJiakGpbKsto3s1gHuXgMA/640?wx_fmt=png)qiankun

我们来分析一下 `SnapshotSandbox` 类的几个属性：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">字段</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">解释</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>name</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">沙箱名称</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>proxy</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">代理对象，此处为 <code>window</code> 对象</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>sandboxRunning</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">当前沙箱是否激活</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>windowSnapshot</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>window</code> 状态快照</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>modifyPropsMap</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">沙箱运行期间被修改过的 <code>window</code> 属性</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>constructor</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">构造函数，激活沙箱</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>active</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">激活沙箱，在子应用挂载时启动</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;"><code>inactive</code></td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">关闭沙箱，在子应用卸载时启动</td></tr></tbody></table>

`SnapshotSandbox` 的沙箱环境主要是通过激活时记录 `window` 状态快照，在关闭时通过快照还原 `window` 对象来实现的。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGicEnd30FricrVgYpCsTM1jvGkB5UjKG8Q6u6IM0r3sbNjWCgp7bv92FA/640?wx_fmt=png)qiankun

我们先看 `active` 函数，在沙箱激活时，会先给当前 `window` 对象打一个快照，记录沙箱激活前的状态（`第 38~40 行`）。打完快照后，函数内部将 `window` 状态通过 `modifyPropsMap` 记录还原到上次的沙箱运行环境，也就是还原沙箱激活期间（历史记录）修改过的 `window` 属性。

在沙箱关闭时，调用 `inactive` 函数，在沙箱关闭前通过遍历比较每一个属性，将被改变的 `window` 对象属性值（`第 54 行`）记录在 `modifyPropsMap` 集合中。在记录了 `modifyPropsMap` 后，将 `window` 对象通过快照 `windowSnapshot` 还原到被沙箱激活前的状态（`第 55 行`），相当于是将子应用运行期间对 `window` 造成的污染全部清除。

`SnapshotSandbox` 沙箱就是利用快照实现了对 `window` 对象状态隔离的管理。相比较 `ProxySandbox` 而言，在子应用激活期间，`SnapshotSandbox` 将会对 `window` 对象造成污染，属于一个对不支持 `Proxy` 属性的浏览器的向下兼容方案。

我们对 `SnapshotSandbox` 沙箱画一张图来加深理解（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGuQJbfT8p9F2NbMmCHRfbmK7nRhfM0RC3HMbp9uuDSx1oNS2niaNrQbQ/640?wx_fmt=png)qiankun

### 挂载沙箱 - `mountSandbox`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG4wPqnZkfOM8gnN9ngUVoXpibGb7AibEozVNwAwv0GuqOcwtRA4KZgOgg/640?wx_fmt=png)qiankun

我们继续回到这张图，`genSandbox` 函数不仅返回了一个 `sandbox` 沙箱，还返回了一个 `mount` 和 `unmount` 方法，分别在子应用挂载时和卸载时的时候调用。

我们先看看 `mount` 函数内部（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGJId7IvqYsDSslBX0pZ2jM7jtlZymocZILiaybKc9BvGfKNoy1dQgDvw/640?wx_fmt=png)qiankun

首先，在 `mount` 内部先激活了子应用沙箱（`第 26 行`），在沙箱启动后开始劫持各类全局监听（`第 27 行`），我们这里重点看看 `patchAtMounting` 内部是怎么实现的。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGgSohjKQNdGxeIsPhcqiblKp2KMe0lYq6K5zc9nzW77BloG4yk42ic6sw/640?wx_fmt=png)qiankun

`patchAtMounting` 内部调用了下面四个函数：

*   `patchTimer（计时器劫持）`
    
*   `patchWindowListener（window 事件监听劫持）`
    
*   `patchHistoryListener（window.history 事件监听劫持）`
    
*   `patchDynamicAppend（动态添加 Head 元素事件劫持）`
    

上面四个函数实现了对 `window` 指定对象的统一劫持，我们可以挑一些解析看看其内部实现。

#### 计时器劫持 - `patchTimer`

我们先来看看 `patchTimer` 对计时器的劫持（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGIMyD8nXTu3roP963KGUNzRaEKZMrKd9A6MlhrPCheQ7q2987kqG6gA/640?wx_fmt=png)qiankun

从上图可以看出，`patchTimer` 内部将 `setInterval` 进行重载，将每个启用的定时器的 `intervalId` 都收集起来（`第 23~24 行`），以便在子应用卸载时调用 `free` 函数将计时器全部清除（见下图）。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG5nL7SicLz1ib8Oq6xIhAdfg7XN8Y1GibZUVnpmx6elucF0yXFD6LW5KKA/640?wx_fmt=png)qiankun

我们来看看在子应用加载时的 `setInterval` 函数验证即可（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGGWKF2Y80s36h3fJIduMaNUT0IPfciapaVzp1MnO2LulokJ3DiaRb6AsQ/640?wx_fmt=png)qiankun

从上图可以看出，在进入子应用时，`setInterval` 已经被替换成了劫持后的函数，防止全局计时器泄露污染。

#### 动态添加样式表和脚本文件劫持 - `patchDynamicAppend`

`patchWindowListener` 和 `patchHistoryListener` 的实现都与 `patchTimer` 实现类似，这里就不作复述了。

我们需要重点对 `patchDynamicAppend` 函数进行解析，这个函数的作用是劫持对 `head` 元素的操作（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGyxt4tnicH6EEqULRmKcNSEH3CgiavQYbvVRvDZxKz3ckskMbOjqanNkQ/640?wx_fmt=png)qiankun

从上图可以看出，`patchDynamicAppend` 主要是对动态添加的 `style` 样式表和 `script` 标签做了处理。

我们先看看对 `style` 样式表的处理（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGiaMeR3w1XcmL1u7k00u2ickOw3dtChL6XA7NfUWCgeWRPdF1IHT5Baug/640?wx_fmt=png)qiankun

从上图可以看出，主要的处理逻辑在 `第 68~74 行`，如果当前子应用处于激活状态（`判断子应用的激活状态主要是因为：当主应用切换路由时可能会自动添加动态样式表，此时需要避免主应用的样式表被添加到子应用`head`节点中导致出错`），那么动态 `style` 样式表就会被添加到子应用容器内（见下图），在子应用卸载时样式表也可以和子应用一起被卸载，从而避免样式污染。同时，动态样式表也会存储在 `dynamicStyleSheetElements` 数组中，在后面还会提到其用处。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGR0KheIBhzVxjTsNUzAK75icEw3OkClIc5Qz2j9ibMawkba5H7sUiakU3w/640?wx_fmt=png)qiankun

我们再来看看对 `script` 脚本文件的处理（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG25mUyD93JSSgsicKsICaDcKYpXLxkBxMdaBadM4uTUHdotR6XQQ76YA/640?wx_fmt=png)qiankun

对动态 `script` 脚本文件的处理较为复杂一些，我们也来解析一波：

在 `第 83~101 行` 处对外部引入的 `script` 脚本文件使用 `fetch` 获取，然后使用 `execScripts` 指定 `proxy` 对象（作为 `window` 对象）后执行脚本文件内容，同时也触发了 `load` 和 `error` 两个事件。

在 `第 103~106 行` 处将注释后的脚本文件内容以注释的形式添加到子应用容器内。

在 `第 109~113 行` 是对内嵌脚本文件的执行过程，就不作复述了。

我们可以看出，对动态添加的脚本进行劫持的主要目的就是为了将动态脚本运行时的 `window` 对象替换成 `proxy` 代理对象，使子应用动态添加的脚本文件的运行上下文也替换成子应用自身。

`HTMLHeadElement.prototype.removeChild` 的逻辑就是多加了个子应用容器判断，其他无异，就不展开说了。

最后我们来看看 `free` 函数（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGSKvaxwMtq34eycd3nK4tEWIC8nDSibVoqI9QdSqIe6OeBUDicrFngvdQ/640?wx_fmt=png)qiankun

这个 `free` 函数与其他的 `patches（劫持函数）` 实现不太一样，这里缓存了一份 `cssRules`，在重新挂载的时候会执行 `rebuild` 函数将其还原。这是因为样式元素 `DOM` 从文档中删除后，浏览器会自动清除样式元素表。如果不这么做的话，在重新挂载时会出现存在 `style` 标签，但是没有渲染样式的问题。

### 卸载沙箱 - unmountSandbox

我们再回到 `mount` 函数本身（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGJId7IvqYsDSslBX0pZ2jM7jtlZymocZILiaybKc9BvGfKNoy1dQgDvw/640?wx_fmt=png)qiankun

从上图可以看出，在 `patchAtMounting` 函数中劫持了各类全局监听，并返回了解除劫持的 `free` 函数。在卸载应用时调用 `free` 函数解除这些全局监听的劫持行为（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGic9B9ZLICykXLsy9wPxSG69h4T0BJfKWtxpIV0XQJowSMyCw5vAgs4Q/640?wx_fmt=png)qiankun

从上图可以看到 `sideEffectsRebuilders` 在 `free` 后被返回，在 `mount` 的时候又将被调用 `rebuild` 重建动态样式表。这块环环相扣，是稍微有点绕，没太看明白的同学可以翻上去再看一遍。

到这里，`qiankun` 的最核心部分 - 沙箱机制，我们就已经解析完毕了，接下来我们继续剖析别的部分。

在这里我们画一张图，对沙箱的创建过程进行一个总梳理（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGZReHq66mZBQrOiaROmfAMxNkGoSia1DVc9ln5A2yd651feAumYrBK1jw/640?wx_fmt=png)qiankun

### 注册内部生命周期函数

在创建好了沙箱环境后，在 `第 100~106 行` 注册了一些内部生命周期函数（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGSUf0EfOpkAzX6NYh6jNGxSX0llpicFicEEdPludb4oENlCibaaoVZpNicw/640?wx_fmt=png)qiankun

在上图中，`第 106 行` 的 `mergeWith` 方法的作用是将内置的生命周期函数与传入的 `lifeCycles` 生命周期函数。

> 这里的 `lifeCycles` 生命周期函数指的是全子应用共享的生命周期函数，可用于执行多个子应用间相同的逻辑操作，例如 `加载效果` 之类的。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG4NH8eseicTdjxF6LQDaZibQHZMLswFHLQnYjrHv4lDkpkpsQJHXFhyTA/640?wx_fmt=png)qiankun

除了外部传入的生命周期函数外，我们还需要关注 `qiankun` 内置的生命周期函数做了些什么（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGqWaCa4bjf1Olb3cskkkto5S9njqdX8qgicdmnZibuFd2CrROPweZ1rmA/640?wx_fmt=png)qiankun

我们对上图的代码进行逐一解析：

*   `第 13~15 行`：在加载子应用前 `beforeLoad`（只会执行一次）时注入一个环境变量，指示了子应用的 `public` 路径。
    
*   `第 17~19 行`：在挂载子应用前 `beforeMount`（可能会多次执行）时可能也会注入该环境变量。
    
*   `第 23~30 行`：在卸载子应用前 `beforeUnmount` 时将环境变量还原到原始状态。
    

通过上面的分析我们可以得出一个结论，我们可以在子应用中获取该环境变量，将其设置为 `__webpack_public_path__` 的值，从而使子应用在主应用中运行时，可以匹配正确的资源路径。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGe5MdhKhN0pPV9DibGfTNfYia10kTr1qLtRxk5mjVjrOv24ApJyCjECsQ/640?wx_fmt=png)qiankun

#### 触发 `beforeLoad` 生命周期钩子函数

在注册完了生命周期函数后，立即触发了 `beforeLoad` 生命周期钩子函数（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGCbYGFhHibbqnicMF9hNtuYtUWuFKkKKGRtictLzmTnJI6ntNpDibQteoicg/640?wx_fmt=png)qiankun

从上图可以看出，在 `第 108 行` 中，触发了 `beforeLoad` 生命周期钩子函数。

随后，在 `第 110 行` 执行了 `import-html-entry` 的 `execScripts` 方法。指定了脚本文件的运行沙箱（`jsSandbox`），执行完子应用的脚本文件后，返回了一个对象，对象包含了子应用的生命周期钩子函数（见下图）。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGazfhMdcvSpQKBhrNIj0ZCbgvAD77SuRL6YebPIRlItVFrz11yicmk4g/640?wx_fmt=png)qiankun

在 `第 112~121 行` 对子应用的生命周期钩子函数做了个检测，如果在子应用的导出对象中没有发现生命周期钩子函数，会在沙箱对象中继续查找生命周期钩子函数。如果最后没有找到生命周期钩子函数则会抛出一个错误，所以我们的子应用一定要有 `bootstrap, mount, unmount` 这三个生命周期钩子函数才能被 `qiankun` 正确嵌入到主应用中。

这里我们画一张图，对子应用挂载前的初始化过程做一个总梳理（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG5whLR9ibJlsIH8X4MqI1nHyjia28BxHVsGVr1XGoLQbw7mibn86icbNaHA/640?wx_fmt=png)qiankun

### 进入到 `mount` 挂载流程

在一些初始化配置（如 `子应用资源、运行沙箱环境、生命周期钩子函数等等`）准备就绪后，`qiankun` 内部将其组装在一起，返回了三个函数作为 `single-spa` 内部的生命周期函数（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG4kqD5B44KNguO06hfvnX6wHAXzJrdOdgZUyOkTLkz42cx2NuicOvcgw/640?wx_fmt=png)qiankun

`single-spa` 内部的逻辑我们后面再展开说，这里我们可以简单理解为 `single-spa` 内部的三个生命周期钩子函数：

*   `bootstrap`：子应用初始化时调用，只会调用一次；
    
*   `mount`：子应用挂载时调用，可能会调用多次；
    
*   `unmount`：子应用卸载时调用，可能会调用多次；
    

我们可以看出，在 `bootstrap` 阶段调用了子应用暴露的 `bootstrap` 生命周期函数。

我们这里对 `mount` 阶段进行展开，看看在子应用 `mount` 阶段执行了哪些函数（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGcd6haRroVY6gmkQzicB2nNJtoI49B1sjmwPjQSy3FibJE3lRf0rY1KZA/640?wx_fmt=png)qiankun

我们进行逐行解析：

*   `第 127~133 行`：对单实例模式进行检测。在单实例模式下，新的子应用挂载行为会在旧的子应用卸载之后才开始。（由于这里是串行顺序执行，所以如果某一处发生阻塞的话，会阻塞所有后续的函数执行）
    
*   `第 134 行`：执行注册子应用时传入的 `render` 函数，将 `HTML Template` 和 `loading` 作为入参。这里一般是在发生了一次 `unmount` 后，再次进行 `mount` 挂载行为时将 `HTML` 挂载在指定容器中（见下图）
    
    > 由于初始化的时候已经调用过一次 `render`，所以在首次调用 `mount` 时可能已经执行过一次 `render` 方法。
    > 
    > 在下面的代码中也有对重复挂载的情况进行判断的语句 - `if (frame.querySelector("div") === null`，防止重复挂载子应用。
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG7UTkhOJCRzYBibWF4v7dHGIBp7HUs8C04iacg5o0rUgy2CzUDt9LykTA/640?wx_fmt=png)qiankun

*   `第 135 行`：触发了 `beforeMount` 全局生命周期钩子函数；
    
*   `第 136 行`：挂载沙箱，这一步中激活了对应的子应用沙箱，劫持了部分全局监听（如 `setInterval`）。此时开始子应用的代码将在沙箱中运行。（反推可知，在 `beforeMount` 前的部分全局操作将会对主应用造成污染，如 `setInterval`）
    
*   `第 137 行`：触发子应用的 `mount` 生命周期钩子函数，在这一步通常是执行对应的子应用的挂载操作（如 `ReactDOM.render、Vue.$mount`。（见下图）
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGhWBZDdkObfuG7xegD9mk3ictAv3Ribb0ib6OgFS9f6L3wFMEmrrrhDqSA/640?wx_fmt=png)qiankun

*   `第 138 行`：再次调用 `render` 函数，此时 `loading` 参数为 `false`，代表子应用已经加载完成。
    
*   `第 139 行`：触发了 `afterMount` 全局生命周期钩子函数；
    
*   `第 140~144 行`：在单实例模式下设置 `prevAppUnmountedDeferred` 的值，这个值是一个 `promise`，在当前子应用卸载时才会被 `resolve`，在该子应用运行期间会阻塞其他子应用的挂载动作（`第 134 行`）；
    

我们在上面很详细的剖析了整个子应用的 `mount` 挂载流程，如果你还没有搞懂的话，没关系，我们再画一个流程图来帮助理解。（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGiasQTZxbKS4jGCDIWPfacKMZibdrulyMPtfS8CDj2PDMm401nov767bg/640?wx_fmt=png)qiankun

### 进入到 `unmount` 卸载流程

我们刚才梳理了子应用的 `mount` 挂载流程，我们现在就进入到子应用的 `unmount` 卸载流程。在子应用激活阶段， `activeRule` 未命中时将会触发 `unmount` 卸载行为，具体的行为如下（见下图）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGHq2s0iawozE0S3Sa1JhzOyqDpm3aTicDhzZ9icbZPRDpWb2Yx9kbF1MNg/640?wx_fmt=png)qiankun

从上图我们可以看出，`unmount` 卸载流程要比 `mount` 简单很多，我们直接来梳理一下：

*   `第 148 行`：触发了 `beforeUnmount` 全局生命周期钩子函数；
    
*   `第 149 行`：这里与 `mount` 流程的顺序稍微有点不同，这里先执行了子应用的 `unmount` 生命周期钩子函数，保证子应用仍然是运行在沙箱内，避免造成状态污染。在这里一般是对子应用的一些状态进行清理和卸载操作。（如下图，销毁了刚才创建的 `vue` 实例）
    

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGCeq4bf3TeKyluTYfhZHHv0UVpF2YSmYM7Za1l3fXuG2Kmyh1tiaicAVQ/640?wx_fmt=png)qiankun

*   `第 150 行`：卸载沙箱，关闭了沙箱的激活状态。
    
*   `第 151 行`：触发了 `afterUnmount` 全局生命周期钩子函数；
    
*   `第 152 行`：触发 `render` 方法，并且传入的 `appContent` 为空字符串，此处可以清空主应用容器内的内容。
    
*   `第 153~156 行`：当前子应用卸载完成后，在单实例模式下触发 `prevAppUnmountedDeferred.resolve()`，使其他子应用的挂载行为得以继续进行，不再阻塞。
    

我们对 `unmount` 卸载流程也画一张图，帮助大家理解（见下图）。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGk3qOQP17S38Ntbde7FY3lN2Z58urxkbI7jPumc1rESzswUajmOEw2Q/640?wx_fmt=png)qiankun

总结
--

到这里，我们对 `qiankun` 框架的总流程梳理就差不多了。这里应该做个总结，大家看了这么多文字，估计大家也看累了，最后用一张图对 `qiankun` 的总流程进行总结吧。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFG3lp1ic7UwZAyibIHibiaia0haZGu1jxj9o1yI4QfOMrMjiaciahw2dSib2CV0A/640?wx_fmt=png)qiankun

彩蛋
--

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGuPL8xl7ljKWuOXrbQI1q5ibPMZ4wvibUqQrnss1BvDB4JetOdI07rlOQ/640?wx_fmt=png)qiankun

展望
--

传统的云控制台应用，几乎都会面临业务快速发展之后，单体应用进化成巨石应用的问题。我们要如何维护一个巨无霸中台应用？

上面这个问题引出了微前端架构理念，所以微前端的概念也越来越火，我们团队最近也在尝试转型微前端架构。

工欲善其事必先利其器，所以本文针对 `qiankun` 的源码进行解读，在分享知识的同时也是帮助自己理解。

这是我们团队对微前端架构的最佳实践（见下图），如果有需求的话，可以在评论区留言，我们会考虑出一篇《微前端框架 `qiankun` 最佳实践》来帮助大家搭建一套微前端架构。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQRM54RrQb3ibsibYx6dPM8tFGVsWWeqpicZhzN9UtYOAfttgmSEgvvXUicibIC4r656MhL0vNTovQIJrmg/640?wx_fmt=png)架构图

最后一件事
-----

这篇文章我花了大约半个月的时间来进行排版、梳理、画图，坚持下来一路写完确实很不容易。

如果您已经看到这里了，希望您还是点个赞再走吧~

如果本文对您有帮助的话，请点个赞和收藏吧！

您的点赞是对作者的最大鼓励，也可以让更多人看到本篇文章！

如果对 `《微前端框架 qiankun 最佳实践》` 有兴趣的话，还请在评论区留言告诉作者吧！

github 地址: https://github.com/a1029563229/Blogs/tree/master/Source-Code/qiankun/1.md)

Node 社群

  

  

我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js 小伙伴，如果你对 Node.js 学习感兴趣的话（后续有计划也可以），我们可以一起进行 Node.js 相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvFQgO67XibvUG5S2UMXwCghOuJvE8BFRzUXnCAfWXkU1qHld6Ly9xiarib3siaWicJWJ0U3lI8kSgD38w/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

   **“分享、点赞、在看” 支持一波👍**