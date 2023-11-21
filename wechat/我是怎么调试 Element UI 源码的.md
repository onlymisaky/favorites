> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/J_ePb4DlZed0j7AqyDBlBw)

[上篇文章](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247492344&idx=1&sn=a9187b4394b9d62d366974ed677f40fb&chksm=cf032dc3f874a4d5344b8c79057ad9e8859416c82f1b1efa9a56602b0778863667d445c27658&token=1706144066&lang=zh_CN&scene=21#wechat_redirect)写了怎么调试 antd 的源码，反响很不错：

[![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXlROr7WicpGurDibEpOnicERToffo4U7yHI7lUics5czf3IJAw4QI2via2zA/640?wx_fmt=png)](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247492344&idx=1&sn=a9187b4394b9d62d366974ed677f40fb&chksm=cf032dc3f874a4d5344b8c79057ad9e8859416c82f1b1efa9a56602b0778863667d445c27658&token=1706144066&lang=zh_CN&scene=21#wechat_redirect)

但很多小伙伴是写 Vue 的，可能平时用的是 Element UI 的组件库，所以这篇文章就来讲下怎么调试 Element UI 的源码。

首先，我们用 Vue CLI 创建一个 vue2 的项目：

```
yarn global add @vue/cli<br style="visibility: visible;"><br style="visibility: visible;">vue create element-vue-test<br style="visibility: visible;">
```

创建成功后，进入到项目目录

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXic24by7xGnPedsrV1gqlav2PN8PffKibIVqQTuu3L1reTOTNQbrHd4vA/640?wx_fmt=png)

安装 element ui 的库，并在入口引入：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXCE1DDmayh7TibLLU4Ly2aa5HdXFSibfaTgRevLokQ4vFTq1YCufzMDlQ/640?wx_fmt=png)

然后在 App.vue 里用一下 button 组件

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEX3433vSPHkB6icgdN4ormDL2LC4TkiawIDI63lRQkzKYab7EzOP7CD9cw/640?wx_fmt=png)

之后 yarn run serve 把开发服务跑起来，就可以看到这样的页面：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXbRRwIDcdBTATGwVwFHXoDW414kA2LnCbMNErNL1rWQrmlbbuYwqib1A/640?wx_fmt=png)

Element UI 的组件正确的显示了。

接下来调试 button 组件的源码，那问题来了，我怎么知道在哪里打断点呢？

我们可以知道的是，这个 button 会处理点击事件，但是却不知道事件处理函数的代码在什么地方。

这种情况可以加一个事件断点：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXiaz6xmgrGDPywRPCF95Mef9upYW7T9SRMFMcxWmJ9kFiaP1jea6scKXQ/640?wx_fmt=png)

在 sources 面板的 Event Listener Breakponts 里勾选 Mouse 的 click 事件，也就是在所有 click 事件的处理函数处断住。

然后你再点下那个按钮试试看：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXBw2pDWLwickUk1IgtjMC9w1OZJGvSkK3WliboW1s1Z1AaOgZM2eKWMicw/640?wx_fmt=gif)

你会发现它在事件处理函数处断住了。

当你知道这个组件处理了什么事件，但却不知道事件处理函数在哪的时候就可以用事件断点。

当然，这个事件处理函数并不是组件里的，因为 Vue 内部会先做一些处理，然后再交给组件处理。

所以，我们要先走到组件的事件处理函数：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXF3NZbjt25kCrIsmIJhYnyGUUE7bwOUnT5cyp2a9ibLdZhMXmFpgMuIg/640?wx_fmt=gif)

单步执行、再进入函数内部，再单步执行、再进入函数内部，代码就会走到组件的事件处理函数：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXicnmpu7LWLHZwJHax2CFCjccI2nDJgya3qm1LmJn2yShp7lU33Q6pyQ/640?wx_fmt=png)

methods、computed、props，这明显是源码里的了。但你再往上走两步，会发现又不是最初的源码：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXg6gFSToyibOjBBKaVbn6IUSPSeJDib7IWQhEkTmGYBkCxJosseiczuTHw/640?wx_fmt=gif)

template 变成了 render 函数，而且还有其他组件的代码，这明显是被编译打包之后的代码。

从文件名也可以看出来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXjs7WScYLTarib6v5uYHStsrRKA7EW0bQMX5JhbuxzCaiaT8yMgOfSlWQ/640?wx_fmt=png)

这是一个把所有组件代码编译后打包到一起的文件。

这样虽然也能调试，但肯定是不爽的，能不能直接调试组件最初的源码呢？就是带 template 的单文件组件那种？

是可以的，这就要用到 sourcemap 了。

sourcemap 是在编译过程中产生的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXXfGG2JrRicaddt2Qcjwb9Pib4TLxLz69YyS9xmuWFSxOibic3AM8JObqFA/640?wx_fmt=png)

里面记录了目标代码和源代码的映射关系，调试的时候可以通过它映射回源码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXI6I29jt4IGNhBsic8tdxMYtSk0d2PFlx61rcu9ZfBtkYloPcdyhnBDg/640?wx_fmt=png)

但是你去 node_modules 下看看，会发现没有这个文件的 sourcemap：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXLTEPyF9ZHDs8icQSQJ8nUbneysokt5NgVWJxsb3S1MwYWeNaDdL5cjQ/640?wx_fmt=png)

那怎么生成它的 sourcemap 呢？

这就要从源码重新编译了。

我们从 github 把它的源码下载下来：

```
git clone --depth=1 --single-branch git@github.com:ElemeFE/element.git
```

--depth=1 是只下载单个 commit，--single-branch 是下载单个 branch，这样下载速度能快几十倍，是一个加速小技巧。

进入 element 目录，安装依赖，你会遇到一个前端经常头疼的问题，node-sass 安装报错了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXK2c1e8lpqPgkhk6YHAYsbtVl19lNK1Qs4Hoib5kAH2NiaW7NLiba7B74Q/640?wx_fmt=png)

这个问题的解决方案就是把 node 版本切换到 node-sass 版本对应的那个。

package.json 中可以看到 node-sass 是 4.11.0

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXxBVVeEicz6BRISD473ufdseS23QCqoXnGmsHvT1LqpVgo9uxHKP1cQw/640?wx_fmt=png)

打开 node-sass 的 github 首页：

你会看到这样一个版本对应关系表：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXAlmYk5YJjxx8qosrOqWUxZmeZ3rWjibqOlIJK1XfO8iarKktE0avs4gA/640?wx_fmt=png)

4.11 对应 node11，那就把 node 切换到 11 就可以了。

然后再次 yarn 安装依赖就能成功了。

之后开始编译，在 npm scripts 中可以找到 dist 命令，这就是构建源码用的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXibuZoTTSqMsUQAfrmjQWdkn92e34cA06OI0DvlE9RJhQLdcYic8CnkEw/640?wx_fmt=png)

但是我们只需要 element-ui.common.js 这个文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXKT1ibv1pRWJVFHZpVsCmFXibLLEzqFpicDJhmEoFUGIGnyx7ic4AhwMPug/640?wx_fmt=png)

其实只需要执行其中的一部分脚本，也就是这个：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXgFMFKmHZ2NUPWnV3ibGPvUrAIz2ia74WeowMMicjxRo6mEt4xxmNK5Hvg/640?wx_fmt=png)

所以在项目下执行 npx webpack --config build/webpack.common.js 即可：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXxgtSC3XibCQohXA3dGZeTyN9QOR3na3O1hJtvHNuKBiaOMNxm0N5xiaDQ/640?wx_fmt=png)

然后在 lib 下就可以看到构建产物：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXFb8AFFD3zykDjboTLBXT0vRCUxQK5PkzDImPyn2eN0UnW3skhXQfZw/640?wx_fmt=png)

但我们的目标是生成带有 source-map 的代码，所以要改下配置：

修改 build/webpack.common.js，配置 devtool 为 cheap-module-source-map：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXyxIzcnqll12dSh2ROffiaKFrM4ZNN5LmIZzUaXLOh79wc9icFSEA0ibxg/640?wx_fmt=png)

source-map 是生成 sourcemap 并关联，也就是这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXOcAOxLicMSibW4Q46RdXBpScEJTlWCm80Py7RzmAex3g0YaP0yWdmd4A/640?wx_fmt=png)

module 是把中间 loader 产生的 sourcemap 也给合并到最终的 sourcemap 里，这样才能直接映射到源码。

cheap 是加快编译速度用的，只保留行的映射信息。

改完配置后再次 yarn run dist，就可以看到带有 sourcemap 的产物了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXdvfCxdXwjKOxJ8TpvUM2121YRVHBmwe5MuS7s2mO8TUDGXAibAqgibiaQ/640?wx_fmt=png)

把这俩文件复制到测试项目的 node_modules/element-ui 下覆盖下之前的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXeUic4oLklnx5E5cp6TeHhsEmicwNo2lKDkIBR8761k4nXAqIvsRJmCibQ/640?wx_fmt=png)

之后清掉 node_modules/.cache 下的缓存，重新跑 dev server：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXWAd4RmcNeUAUgFgaYpXibtxcB8Wep0g8OMIdUTic7l56ciccK4pVbTW0g/640?wx_fmt=png)

这时会报错提示你 node 版本太低了，你需要再把 node 版本换回来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEX3mYV5awdy3YWTpbULqXRILA5ObQicYED9n6URjKynGhaVNP2PDTgYCw/640?wx_fmt=png)

跑起开发服务之后，再次用之前的方式调试 button 组件的源码：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXLpdv6yiadPpt8jdPhzykZZl7GHlf3iaoeXKkyLTonLyTQj0GERWeKzvQ/640?wx_fmt=gif)

你会发现现在的组件代码是带 template 语法的单文件组件的代码了！

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXtofYU6MicO5ibeJv6AKwsM0kj4iadcGcjibAXdu2ANRRLaS03baSa4ob7w/640?wx_fmt=png)

这就是 sourcemap 的作用。

之后你会可以在这个组件里打断点然后调试。

有的同学可能会问，通过事件断点进入组件内部，这样有点麻烦，有没有更简单的方式？而且 button 组件有点击事件，但有的组件没有呀，这些组件该怎么调试呢？

确实，有了 sourcemap 之后就有更简单的调试方式了。

你可以在 sources 左边看到 ELEMENT 目录下有很多 vue 文件，这其实就是 Chrome DevTools 解析 sourcemap 之后列在这里的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXGtNHL2eg7NlyWntrzWVQTPBlcba4m9libb34QiaFAga05yPcaHCaYEHQ/640?wx_fmt=gif)

你可以直接在里面打断点调试。

比如我们加一个 tabs 组件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXuHn9fMhlJ7JMk0b17iaKsU3icXcPP5qm6hTqo1XVWhSqIRIRKkr8yjjg/640?wx_fmt=png)

把前面添加的那个事件断点去掉，在代码里手动打一个断点：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXzg5UPhoxxL3srqHqyNtKF8I7ibQD5vnibGyYX5prickxWl1DYtkqWnDJA/640?wx_fmt=png)

然后你就会发现，这样就可以调试 Element UI 组件源码了！

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia7R8a4BSLh39CHATibeOTEXXT6ibezUj0v1e4WnaosoEj2Hf9drC5pOPibAZYOjRpC7dXgRPFWCAIMw/640?wx_fmt=gif)

当然，有的组件找不到的时候，还是可以通过事件断点的方式来进入组件内部。

我们是通过 Chrome DevTools 调试的，其实用 VSCode Debugger 来调试它也是一样的，在 Chrome DevTools 里打的断点，在 VSCode Debugger 里同样会断住。

总结
--

今天我们调试了 Element UI 的源码。

定位到组件的代码，是通过事件断点的方式，因为我们知道它触发了什么事件，但却不知道事件处理函数在哪。

但是组件的代码是被编译打包过的，不是最初的源码。

为了调试最初的源码，我们下载了 Element UI 的代码，build 出了一份带有 sourcemap 的代码。

覆盖项目 node_modules 下的代码，重新跑 dev server，这时候就可以直接调试组件源码了。

有了 sourcemap 之后，Chrome DevTools 会直接把 vue 文件列在 sources 里，我们可以找到对应的 vue 文件来打断点，就不用通过事件断点来找了。

能够调试 Element UI 源码之后，想知道组件内部都有哪些逻辑的话，就可以直接在源码断点调试了，就很香。