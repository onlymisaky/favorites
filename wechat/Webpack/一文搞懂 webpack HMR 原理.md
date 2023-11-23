> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/EYQGU8do5csWh4YZe5xbYA)

![](https://mmbiz.qpic.cn/mmbiz_jpg/hM5HtkzgLYYUNVVhp9B5kIXkBQ4uUH7BhWyMTiczGejHm2XicLaQicF816QJaaCVbP1Sx5rQtcuv1dfUfI3pzicibnA/640?wx_fmt=jpeg)

关注「前端向后」微信公众号，你将收获一系列「用心原创」的高质量技术文章，主题包括但不限于前端、Node.js 以及服务端技术

一. HMR
------

Hot Module Replacement（HMR）特性最早由 webpack 提供，能够_对运行时的 JavaScript 模块进行热更新_（无需重刷，即可替换、新增、删除模块）：

> Hot Module Replacement (HMR) exchanges, adds, or removes modules while an application is running, without a full reload.

（摘自 Hot Module Replacement Concepts）

与整个重刷相比，模块级热更新最大的意义在于_能够保留应用程序的当前运行时状态_，让更加高效的 Hot Reloading 开发模式成为了可能

P.S. 后来其它构建工具也实现了类似的机制，例如 Browserify、甚至 React Native Packager

可是，编辑源码产生的文件变化在编译时，替换模块实现在运行时，二者是怎样联系起来的呢？

二. 基本原理
-------

![](https://mmbiz.qpic.cn/mmbiz_png/hM5HtkzgLYYUNVVhp9B5kIXkBQ4uUH7BRXriajG02hxhCKMicetV3YoPMpFBfe3qY1P8hhjw96mpsmiaULc3G5JIw/640?wx_fmt=png)

监听到文件变化后，通知构建工具（HMR plugin），将发生变化的文件（模块）发送给跑在应用程序里的运行时框架（HMR Runtime），由运行时框架把这些模块塞进模块系统（新增 / 删除，或替掉现有模块）

其中，HMR Runtime 是构建工具在编译时注入的，通过统一的模块 ID 将编译时的文件与运行时的模块对应起来，并暴露出一系列 API 供应用层框架（如 React、Vue 等）对接

三. HMR API
----------

最常用的是`accept`：

*   `module.hot.accept(dependencies, callback)`：监听指定依赖模块的更新
    

例如：

```
import printMe from './print.js';

if (module.hot) {
  module.hot.accept('./print.js', function() {
    console.log('Accepting the updated printMe module!');
    printMe();
  })
}
```

触发`accept`（回调）时，表示新模块已经塞进模块系统了，在此之后访问到的都是新模块实例

P.S. 完整示例，见 Hot Module Replacement Guides

然而，实际场景中模块间一般存在多级依赖，替换一个模块会影响（直接或间接）依赖到它的所有模块：

![](https://mmbiz.qpic.cn/mmbiz_png/hM5HtkzgLYYUNVVhp9B5kIXkBQ4uUH7Bibk9icnROYAQOR7QvJicmibMNQpVbC0lhicD91Re3S3tsAuGdFDKibecWeKw/640?wx_fmt=png)

那岂不是要在所有模块中都添一段类似的更新处理逻辑？

通常不需要，因为模块更新事件有_冒泡机制_，未经`accept`处理的更新事件会沿依赖链反向传递，只需要在一些重要的节点（比如`Router`组件）上集中处理即可

除`accept`外，还提供了：

*   `module.hot.decline(dependencies)`：将依赖项标记为不可更新（期望整个重刷）
    
*   `module.hot.dispose/addDisposeHandler(data => {})`：当前模块被替换时触发，用来清理资源或（通过`data`参数）传递状态给新模块
    
*   `module.hot.invalidate()`：让当前模块失效，用来强制更新当前模块
    
*   `module.hot.removeDisposeHandler(callback)`：取消监听模块替换事件
    

P.S. 关于 webpack HMR API 的具体信息，见 Hot Module Replacement API

四. HMR Runtime
--------------

从应用程序的角度来看，模块替换过程如下：

1.  应用程序要求 HMR Runtime 检查更新
    
2.  HMR Runtime 异步下载更新并通知应用程序
    
3.  应用程序要求 HMR Runtime 应用这些更新
    
4.  HMR Runtime 同步应用更新
    

接到（构建工具发来的）模块更新通知后，HMR Runtime 向 Webpack Dev Server 查询更新清单（manifest），接着下载每一个更新模块，所有新模块下载完成后，准备就绪，进入应用阶段

将更新清单中的所有模块都标记为失效，对于每一个被标记为失效的模块，如果在当前模块没有发现`accept`事件处理，就向上冒泡，将其父模块也标记失效，一直冒到应用入口模块

之后所有失效模块被释放（`dispose`），并从模块系统中卸载掉，最后更新模块 hash 并调用所有相关`accept`事件处理函数

五. 实现细节
-------

实现上，应用程序在初始化时会与 Webpack Dev Server 建立 WebSocket 连接：

![](https://mmbiz.qpic.cn/mmbiz_png/hM5HtkzgLYYUNVVhp9B5kIXkBQ4uUH7BGHiaQtpGQCjyyzwZQk3Qvib3vW2YicQUCMDy5v71nKIlMjJFpvAUtDXPQ/640?wx_fmt=png)

Webpack Dev Server 向应用程序发出一系列消息：

```
o
a["{"type":"log-level","data":"info"}"]
a["{\"type\":\"hot\"}"]
a["{"type":"liveReload"}"]
a["{"type":"hash","data":"411ae3e5f4bab84432bf"}"]
a["{"type":"ok"}"]
```

文件内容发生变化时，Webpack Dev Server 会通知应用程序：

```
a["{"type":"invalid"}"]
a["{"type":"invalid"}"]
a["{"type":"hash","data":"a0b08ce32f8682379721"}"]
a["{"type":"ok"}"]
```

接着，HMR Runtime 发起 HTTP 请求获取模块更新清单：

```
XHR GET http://localhost:8080/411ae3e5f4bab84432bf.hot-update.json
{"h":"a0b08ce32f8682379721","c":{"main":true}}
```

通过`script`标签 “下载” 所有模块更新：

```
SCRIPT SRC http://localhost:8080/main.411ae3e5f4bab84432bf.hot-update.js
webpackHotUpdate("main", {
  "./src/App.js": (function(module, __webpack_exports__, __webpack_require__) {
    // （新的）文件内容
  })
})
```

如此这般，_运行时的 HMR Runtime 顺利拿到了编译时的文件变化_，接下来将新模块塞进模块系统（`modules`大表）：

```
// insert new code
for (moduleId in appliedUpdate) {
  if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
    modules[moduleId] = appliedUpdate[moduleId];
  }
}
```

最后通过`accept`事件通知应用层使用新的模块进行 “局部刷新”：

```
// call accept handlers
for (moduleId in outdatedDependencies) {
  module = installedModules[moduleId];
  if (module) {
    moduleOutdatedDependencies = outdatedDependencies[moduleId];
    var callbacks = [];
    for (i = 0; i < moduleOutdatedDependencies.length; i++) {
      dependency = moduleOutdatedDependencies[i];
      cb = module.hot._acceptedDependencies[dependency];
      if (cb) {
        if (callbacks.indexOf(cb) !== -1) continue;
        callbacks.push(cb);
      }
    }
    for (i = 0; i < callbacks.length; i++) {
      // 触发accept模块更新事件
      cb(moduleOutdatedDependencies);
    }
  }
}
```

至此，水落石出

### 参考资料

*   What exactly is Hot Module Replacement in Webpack?
    
*   Understanding webpack HMR beyond the docs
    
*   Introducing Hot Reloading
    

联系我      

如果心中仍有疑问，请查看原文并留下评论噢。（特别要紧的问题，可以直接微信联系 ayqywx ）