> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Qsgaci7_4v2He1K0dSgJHw)

前言
--

前面我们有提到`Vite`在开发阶段，提倡的是一个`no-bundle`的理念，不必与`webpack`那样需要先将整个项目进行打包构建。但是`no-bundle`的理念只适合源代码部分（我们自己写的代码），`vite`会将项目中的所有模块分为**依赖**与**源码**两部分。

**依赖：**指的是一些不会变动的一些模块，如：`node_modules`中的第三方依赖，这部分代码`vite`会在启动本地服务之前使用 **esbuild** 进行预构建。esbuild 使用 Go 编写，比使用 JavaScript 编写的打包器预构建依赖快 10-100 倍。

**源码：**指的是我们自己开发时写的那部分代码，这部分代码可能会经常变动，并且一般不会同时加载所有源代码。

所以总结来说：**no-bundle 是针对源码的，而预构建是针对第三方依赖的**

使用预构建的原因
--------

主要有以下两点：

*   **commonJS 与 UMD 兼容**：因为`Vite`在开发阶段主要是依赖浏览器原生 ES 模块化规范，所以无论是我们的源代码还是第三方依赖都得符合 ESM 的规范，但是目前并不是所有第三方依赖都有 ESM 的版本，所以需要对第三方依赖进行预编译，将它们转换成 EMS 规范的产物。
    

比如`React`，它就没有`ESM`的版本，所以在使用`Vite`时需要预构建

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjbB4wribmRqVyp25HQNQHSX0s6mpjFJA9kWeoJtuEt8u1JxUAWYBqX8A/640?wx_fmt=png&from=appmsg)

*   **性能：**为了提高后续页面的加载性能，Vite 将那些具有许多内部模块的 ESM 依赖项转换为单个模块。
    

比如常用的`loads-es`

我们引入`lodash-es`工具包中的`debounce`方法，此时它理想状态应该是只发出一个请求

```
import  { debounce }  from 'lodash-es'
```

事实也是这样

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjdFibNcw9KxpwdYyaaZvQtQqGAV3qdre31Fd0nNJsXZHJjEXwDuwibBhA/640?wx_fmt=png&from=appmsg)

但这是预构建的功劳，如果我们对`lodash-es`关闭预构建呢？

`vite`配置文件加上如下代码，再来试试：

```
// vite.config.jsoptimizeDeps: {    exclude: ['lodash-es']  }
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjkh19K8k1GEcfzSurEDDIcHc4WNgdkbsgHrXC7E41V0PxKw6ttFD3WQ/640?wx_fmt=png&from=appmsg)

可以看到，此时发起了 600 多个请求，这是因为`lodash-es` 有超过 600 个内置模块！

**vite 通过将 `lodash-es` 预构建成单个模块，只需要发起一个 HTTP 请求！可以很大程度地提高加载性能**

> ❝
> 
> 由于 Vite 的预构建是基于性能优异的 Esbuild 来完成的，所以并不会造成明显的打包性能问题

开启预构建
-----

### 默认配置

一般来说，`Vite`帮我们默认开启了预构建

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjStVAALQTkXN84TNLQU0w2SxAHP2CZlEsXxyprMb9zT4x6FufMnh7wg/640?wx_fmt=png&from=appmsg)

预构建产物会存放在：`node_modules/.vite/deps`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjAfDB9utOicicoaBr4ZFkKkKgG3KsmbVtU8bh6D2atCPeDqnnN8k9nYrA/640?wx_fmt=png&from=appmsg)

里面会有一个`_metadata.json`的文件，这里保存着已经预构建过的依赖信息

对于预构建产物的请求，`Vite`会设置为强缓存，有效时间为 1 年，对于有效期内的请求，会直接使用缓存内容

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjXIibx0bdYLYTO2R0tmTiaI8vZ2g1tF7LVF45BGQHv7Uu501YCeD1MMag/640?wx_fmt=png&from=appmsg)

如果只有 HTTP 强缓存肯定也不行，如果用户更新了依赖版本，在缓存过期之前，浏览器拿到的一直是旧版本的内容。

所以`Vite`对本地文件也设置了缓存判断，如果下面几个地方任意一个地方有变动，`Vite`将会对依赖进行重新预构建：

*   项目依赖`dependencies`变更
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAj1R81lW7AZbRePOYbaQtk3LX75e8dDoI60QE2XfcMT9dk8eV13u5vSA/640?wx_fmt=png&from=appmsg)

*   各种包管理器的`lock`文件变更
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjC2iazLB8Ws9KnnPia5eRWp4Sptqt0n4F6pIavfhXulQO5N2aN8tgweyQ/640?wx_fmt=png&from=appmsg)

*   `optimizeDeps`配置内容变更
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAj6Og6zhfibUYc1HMAea0VnohRjNuvsuwsOtEVrfx0wnhEicdT9iafdff0Q/640?wx_fmt=png&from=appmsg)

### 自定义配置

#### entries

默认情况下，`Vite`会抓取项目中的`index.html`来检测需要预构建的依赖

```
optimizeDeps: {  entries: ['index.html']}
```

如果指定了 `build.rollupOptions.input`，Vite 将转而去抓取这些入口点。

#### exclude

排除需要预构建的依赖项

```
optimizeDeps: {  exclude: ['lodash-es']}
```

#### include

默认情况下，不在 `node_modules` 中的依赖不会被预构建。使用此选项可强制选择预构建的依赖项。

```
optimizeDeps: {  include: ['lodash-es']}
```

预构建流程
-----

还是从源码入手，在启动服务的过程中会执行一个`initDepsOptimizer`表示初始化依赖优化

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjXJzVL68ax96wyhRgI2fHbtbx4cNNL3t9ndpvlUTNOsxcBP1Hl82yicw/640?wx_fmt=png&from=appmsg)

接着找到定义`initDepsOptimizer`方法的地方

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjfN32ZdRH537n9QVpSP7piaQZLOrBJ08XolZhibG8QkjECgmTWsebIISA/640?wx_fmt=png&from=appmsg)

在这里会执行`createDepsOptimizer`方法，再接着找到定义`createDepsOptimizer`的地方

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjMRMgibRcQjzuMjyyAibL1icKQE3HDG5vSficiauO4IjmOeQxYjJR33D2rVQ/640?wx_fmt=png&from=appmsg)

这里首先会去执行`loadCachedDepOptimizationMetadata`用于获取本地缓存中的`metadata`数据

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjYOoB2RzqzS6xWPkHyibAwC4jFUgzAZZGviaAECy9BO1Lk3UpAe2XzzBQ/640?wx_fmt=png&from=appmsg)

该函数会在获取到`_metadata.json`文件内容之后去对比 lock 文件 hash 以及配置文件 optimizeDeps 内容，如果一样说明预构建缓存没有任何改变，无需重新预构建，直接使用上次预构建缓存即可

如果没有缓存时则需要进行依赖扫描

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjYIoBWmacQRT0ib3mZbuw2HJrIU9PKsryf4mEcKLicR04ibLAgN6FSAalw/640?wx_fmt=png&from=appmsg)

这里主要是会调用`scanImport`方法，从名字也能看出该方法应该是通过扫描项目中的`import`语句来得到需要预编译的依赖

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjqwWwO9FFnQp6QoFuSneM8Qzco6NwhebPRKmjmSxee5E5caromm8DwA/640?wx_fmt=png&from=appmsg)

最终会返回一个`prepareEsbuildScanner`方法

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia6LtUGO4CqWyxJ51oHmzZAjx9cTWRlm00XVw7jBjP5LGzyECWx2FWfThueBh0GU2VSsNlVwS7V5LA/640?wx_fmt=png&from=appmsg)

最后该方法中会使用`esbuild`对扫描出来的依赖项进行预编译。