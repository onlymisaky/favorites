> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/JEmsjprq83rGCmqNF--T1w)

前言
--

前段时间发现了一个好玩的东西 -- LocatorJS。它可以在浏览器界面快速定位到 IDE 里的具体代码，并且支持 React、Preact、Solid、Vue 和 Svelte 这些主流的框架。顿时觉得好神奇，简直就是开发神器，YYDS！于是，马上按照官方文档，一步步在项目中进行操作一番。对于 react 项目，它提供了 2 种接入方式。第一种是基于 data-id，第二种是基于 react devtools 和 Chrome 插件。对于它的实现特别好奇，所以拉取它的源码，进行探索一番。

![](https://mmbiz.qpic.cn/mmbiz_gif/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDSl1bzOjgrciaS0GRoJ9RnUDpyunTmhSuofER4SVtQQss0lNNOibJe7kA/640?wx_fmt=gif)

intro.gif

准备工作
----

1、拉取源码

把源码拉到本地，可以看到如下图目录

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDibzerwOGgMkKpXv7YE5eMRYoJlO20oVn7bmksql739ldWNsWdZ8scsQ/640?wx_fmt=jpeg)

该项目把 Chrome 插件和示例都放在 apps 文件夹里面，packages 里面放着 babel-jsx、locatorjs、runtime 等公共代码。可以看到这个项目是使用 lerna 管理的多包项目，那需要用 `lerna bootstrap` 进行依赖安装。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDpyUUiaV8iccWutQ7picUx7aIexvWZwVTFo1ULibPos6XlM5kuF6cY8RXGA/640?wx_fmt=jpeg)

2、启动项目

依赖安装完毕，然后使用 `yarn dev` 启动项目。可以看到 turbo 编译速度飞快，端口信息很快就被日志刷没了。于是只能通过代码里查看，具体的示例在哪个端口。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDqaRCAubR9dEaxNSWSvJicwlnKgB6wjzlvia4T7eEKFVHVMwSibd4VJejw/640?wx_fmt=jpeg)

我们以 vite-react-clean-project 项目为例，找到对应的 package.json，发现它启动的是 3348 端口，于是用浏览器打开 localhost:3348 页面。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDTm39lZabjiag6txOQ9S8ENicju4jQIZyG28NC59PJNOEnpksmBjlEHpA/640?wx_fmt=jpeg)image.png

3、加载 Chrome 插件

因为我们是采用的 Chrome 插件和 react devtools 进行代码分析。所以必须安装这 2 个插件。react devtools 如果没有安装，可以去 Chrome 插件市场里搜索安装。locatorjs Chrome 插件我们加载开发版本进行代码调试。（进去 Chrome 扩展管理 -> 加载我们项目 apps/extension/build/development_chrome 这个文件夹）

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sD0BYWge9z7H97IRZKzgkiaE3RFeyh0FOZyQibJMtJ0oVyzxAlRyWEic7DQ/640?wx_fmt=jpeg)image.png

源码分析
----

以上准备工作完毕之后，你可能已经发现 locatorjs 可以用了。如果说不能正常使用，可以参考官网，安装以下的 babel plugins。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDdX8q5kzBL4nAbT2mmGvwJ6mKdR5eJ9exf1icVKE68H07CWp47bmmCEg/640?wx_fmt=jpeg)

那么 Chrome 插件到底做了什么？我们带着问题去看源码吧。

1、Chrome 插件

打开 apps/extension/src/pages 这个文件，发现里面就是常规的插件代码。

*   Background 放着插件的后台代码，目前里面为空
    
*   Content 放着插件与浏览器内容页面的代码，与页面代码一起执行
    
*   Popup 放着插件 popup 页面的代码
    

这个插件的执行入口就在 content.ts。如果对插件不熟悉的同学，可以参考 Extensions - Chrome Developers(https://developer.chrome.com/docs/extensions/) 插件开发网站。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDS6onXfbKfsNCrx5yziaVCKjufzoZo1Rg4QEdibW8Tiabqxy0CMiaJf1X2w/640?wx_fmt=jpeg)

1.1 apps/extension/src/pages/Content/index.ts

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDdfad12E7lzOUSOjUuIppbyt4WjfhbJxdvqWlUlZRALs8RtNnqoibMZw/640?wx_fmt=jpeg)image.png

从上面代码可以看出，在 content.ts 中把 hook.bundle.js 注入到当前页面中，把 client.bundle.js 赋值给 document.documentElement.dataset.locatorClientUrl，其他代码都是一些监听事件，可以先不管。

1.2 apps/extension/src/pages/Hook/index.ts

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDLCRZbCcpFKgfVjenRzuiaYp9383xSsOFlXFoTn0os00LSNI7gOa93jQ/640?wx_fmt=jpeg)image.png

hook.bundle.js 就是 hook.ts 打包之后的文件名，它主要做了 2 件事情，第一，确保 react devtools 已经被安装了；第二，注入 runtime script。

1.3 apps/extension/src/pages/Hook/insertRuntimeScript.ts

该文件主要是监听 DOMContentLoaded，然后注入我们上面 document.documentElement.dataset.locatorClientUrl 这个文件，也就是 client.bundle.js。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDLCUJgu4fN9abWFp6XiaicXE2Dct33SiaFFSyhHpkUdEyia3CPS59mDlzhQ/640?wx_fmt=jpeg)image.png

在 insertScript 方法中，作者还考虑到了 iframe 的情况

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDrTD0YID1WE7Bml7oviccicfORpySufia0BcNapES1ZtPDiaZ29M8ohfLIg/640?wx_fmt=jpeg)image.png

1.4 apps/extension/src/pages/ClientUI/index.ts

接着我们来看 client.js 到底做了什么。兴致勃勃地打开 ClientUI 文件夹，结果只有一句代码。直接引入了 @locator/runtime，也就是 runtime 代码。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDzBCicmnod6S0Ys3JafPu325YmwUib7ibnuibEE5sCmVlNU5c1QVlxXicH2A/640?wx_fmt=jpeg)image.png

这样看来 Chrome 插件很简单，就检查了 react devtools 的安装情况，然后动态注入 locator 的 runtime 代码。接下来，我们就定位到 runtime 代码。

2、locator/runtime

2.1 packages/runtime/src/index.ts

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDw48YyWWx5mdsElNqLdeiaoxQrC1h5GIicxEsB0rYFEbrkibyt02rcribFA/640?wx_fmt=jpeg)image.png

从代码中可以看到，它就是我们在官网看到的 2 种不同的方式。不管我们是 Chrome 插件引入还是通过 @locator/runtime 引入，最终都会执行 initRuntime 函数，无非就是参数不一样。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sD9DRG2Re0hMS6q4L3Yp67kDBJanw81b3wAZU7S9KKFHag1ZbGM1Syvg/640?wx_fmt=jpeg)image.png

2.2 packages/runtime/src/initRuntime.ts

该文件中，它通过 shadow Dom 的方案去添加了一个 locatorjs 自己的全局样式和容器，来隔离 CSS，以免对页面进行影响。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDMgDK08PKv02ybEuLa2fXicQy5tJQqibzGCpdhL2psRatlYV1dZtKqBSQ/640?wx_fmt=jpeg)image.png

接着，它又引入了 components/Runtime 组件，并且考虑到了 SSR 的情况。我们是客户端渲染，所以走的是第二种情况。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDGbuGwia9jjh6NhGZ38icos2UEmSkZ8vRAY1QftNghZTWib1SVFRBGXxgw/640?wx_fmt=jpeg)image.png

2.3 packages/runtime/src/components/Runtime.tsx

在这个文件中终于看到了真面目，最终渲染的就是 Runtime 这个函数组件。该组件使用了  solidjs。函数最上面是一些变量的声明。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDGZjj9n932NbWmOY3p1eLhFBATRYa6Vmvvxce5jzk3iaQJJZg7xjrDOQ/640?wx_fmt=jpeg)image.png

接着是在 document 上绑定了 mouseover、keydown、keyup、click、 scroll 事件

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDEyYK4QlU8icK15I6KAFq10f1EfOdMBibVaDnOreQyuRGCDw5PvSkTkJg/640?wx_fmt=jpeg)image.png

当我们把鼠标浮到元素上，并且按住 option 按键的时候，就显示出当前元素的表框。这时候触发的就是 mouseover 和 keydown 事件。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDOTNgoyogdZm0GL7soh1UhNXAXvjHZhDn0uibXIBic33vTqBR7cbJia20w/640?wx_fmt=jpeg)image.png

mouseover 处理函数，就把当前的 element 选中；keydown 处理函数使 holdingModKey 为 true。在这种情况下，页面渲染的就是 MaybeOutline 组件

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sD3nJWoFQxLbCFplcFlYpOcfHBcp6gl0MS2H4KWpg3afT5nRw7DQ7XEQ/640?wx_fmt=jpeg)image.png

2.4 packages/runtime/src/components/MaybeOutline.tsx

在 MaybeOutline 组件里面，主要的就是获取当前 element 的信息。然后根据 elementInfo 去渲染红色的外边框。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDib7O1YvsGNianBW0pFjAD1SRhH55DHrCcVgnuPU3lGMmVuaoAlibXrqRQ/640?wx_fmt=jpeg)image.png

2.5 packages/runtime/src/adapters/getElementInfo.tsx

接着我们来看 getElementInfo 这个方法到底做了什么。可以看到，它用来适配器设计模式。根据适配 id 的不同，走不同的逻辑。现在我们来看 react 项目是怎么获取元素信息的。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDD48gHk6nXGP3CM6WmmFmjb5n0gJQxrH8TUOj7tzjkwO1u0n8foph2g/640?wx_fmt=jpeg)image.png

2.6 packages/runtime/src/adapters/react/reactAdapter.ts

在这个方法里，我们看到了熟悉的影子 fiber。这里最重要的函数就是 findFiberByHtmlElement，通过命名也能知道。就是通过 html 元素去查询 fiber 节点。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDSNIrAKcLJNylicY06icxgqFcCMeetGib0Mk8ODKhJxOgqW4J9wtCjZ5QA/640?wx_fmt=jpeg)image.png

2.7 packages/runtime/src/adapters/react/findFiberByHtmlElement.ts

通过 findFiberByHostInstance 就可以找到当前元素的 fiber 节点。那 fiber 节点里有哪些信息呢？我添加了打印信息。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDZkCtX1VZx0bkL6LVJnJpNLaRA4iaJpxqNWbZ9UlkKOsgdIP3AYorNzg/640?wx_fmt=jpeg)image.png

通过下图可以看到，_debugSource 里面居然自带了当前元素位置信息，还有 lineNumber、columnNumber，难怪可以具体定位到代码中。有了这个信息，跳转到 vscode 还不是轻而易举。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDw8P5WrHqFYAnpXdqicQmOS46uUSYR4heeDTQZW1esrY0FS2nqDfzA4Q/640?wx_fmt=jpeg)image.png

跳转的事件发生在 click 处理函数中，最终调用了 window.open 方法。vscode:// 这个是协议跳转，electron 本身就支持。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sD2k2ibtEeyibRnSlvZeZE1uJdvluQ9QIozP4AvJVEGeh811rYFxzYOpBw/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDmNVJ2ZianWOYicibKeu836GgQI470tmXDHxicKODnyDPk6ZqLHiasmxOdDw/640?wx_fmt=jpeg)image.png

那 _debugSource 的信息是怎么来的呢？那是 @babel/plugin-transform-react-jsx-source 的功劳。

2.8 @babel/plugin-transform-react-jsx-source

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDHbzkvicnRczQd1V3njD87gs8Jc2xDgGNib5feSiayrz0OyoKWBribXgSGw/640?wx_fmt=jpeg)image.png

从 babel 官网的示例可以看出，这个 plugin 可以把当前 tag 的位置信息添加到 __source 上。然后通过 React.createElement 把 __source 属性挂到 _source 下面。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDlhGibEzC4uMzMSkCYavu4qbFF1xhZVypfORlJ0Fc7j3DElEoxQPb8QA/640?wx_fmt=jpeg)image.png![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDK07oCnliaFiaRyHe6IibrcGCgPKQtGavIuAzqvaWaVBqBWKTUHiajKiclWQ/640?wx_fmt=jpeg)image.png

然后在创建 fiber 的时候，把元素的 _source 添加到 _debugSource。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sD6k2l61ryEZnJGGiaoOXQKavQorDic3S7m3V3Nm3iapQxgVy2j9V69PpXg/640?wx_fmt=jpeg)image.png

2.9 packages/runtime/src/components/ComponentOutline.tsx

那元素外面的红框是如何实现的呢？于是我们定位到 ComponentOutline.tsx

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sDEKlB5P1ng4qzITBPyk2fO1dKE5iaZ7mxACFM7sVDpMiaK2KpJ2EB9bNw/640?wx_fmt=jpeg)image.png

可以看到，它是通过 bbox 的属性计算出了整个元素的外边框。bbox 又是通过 fiber 元素的 getBoundingClientRect 计算出来的。到这里就全部解开了 locatorjs 的神秘面纱了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/sticlevzdTIDFnb27euFIxZ8MNzE5B3sD9hz6dxykicUslAOvoEjOBn2EyUUUsTrWiaNTXHcA9BhEu6G8mBLWwzgg/640?wx_fmt=jpeg)image.png

总结
--

通过查看这个源码还是有很多收获。第一，你能学到 Chrome 插件的开发；第二，solidjs 的使用，虽然本文没有展开讲；第三，shadow Dom 样式隔离方案；第四，适配器模式的应用；第五，熟悉 react fiber。本文是基于 react devtools 方式的来解析 locatorjs 的原理。官方还有一种 data-id 来实现的方案，它会把位置信息绑定在 data-id 上，然后点击的时候去处理信息，具体的源码实现还是留给各位读者自己去探索。

参考文献：
-----

Chrome Extensions content scripts - Chrome Developers(https://developer.chrome.com/docs/extensions/mv3/content_scripts/)

LocatorJS(https://www.locatorjs.com/)