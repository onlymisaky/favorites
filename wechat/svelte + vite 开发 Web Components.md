> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BNbAI2ClX1-iZExFvOOG8g)

引言
--

最近要做一个跨平台使用的卡片插件，考虑到插件的通用性，就选择了 Web Components 技术来实现

Web Components 概念
-----------------

Web Components 是一套不同的技术，允许你创建可重用的定制元素（它们的功能封装在你的代码之外）并且在你的 web 应用中使用它们。

它由三项主要技术组成：

1、Custom element（自定义元素）：一组 JavaScript API，允许您定义 custom elements 及其行为，然后可以在您的用户界面中按照需要使用它们。

2、Shadow DOM（影子 DOM）：一组 JavaScript API，用于将封装的 “影子”DOM 树附加到元素（与主文档 DOM 分开呈现）并控制其关联的功能。通过这种方式，您可以保持元素的功能私有，这样它们就可以被脚本化和样式化，而不用担心与文档的其他部分发生冲突。

3、HTML template（HTML 模板）：`<template>` 和 `<slot>` 元素使您可以编写不在呈现页面中显示的标记模板。然后它们可以作为自定义元素结构的基础被多次重用。

兼容性
---

现阶段的 Safari 和 Chrome 已经都原生支持了 Web Components 的规范标准。Firefox，Edge 和 IE11 在 Polyfill 的支持下也都能很好的支持 Web Components。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BjRv4iaibjWwzUjG8yekhFgnxHo1K37icrJafBgHxOu8DJkTRwxvMUJGicQ/640?wx_fmt=png)host

技术选型
----

考虑到学习成本，这里只对比了一些主流框架

### 前端框架的满意度 & 关注度走势

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4Bibia4XeribyznibjZQLEOymQ6mPYibx1zUayz6OfoNVLQZCtAblcX8KA4fg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BtNE6avMMDPMJasxFersK6nRcLsKKZAttdAQ5zA3mX8udzZSkEywlpQ/640?wx_fmt=png)

### 前端框架的性能测试

越绿表示分越高

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BOj6E05oUKib5IuuiaYIWbYuttSM0U2mibickzYhwn5szo1olkTPbcP3Ltg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4B2wXWT2o4hNEFfacxCCyBuvzfJIjqx4tlGJE7OJxhNZ3tTL0ATUZctg/640?wx_fmt=png)

### 前端框架包体积的对比

![](https://mmbiz.qpic.cn/mmbiz_jpg/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4Bb64ib36OJQTBgicS6ic7fOFWfXiaLeDryO4Ety5h199iaAEJQs2tKmOHgbw/640?wx_fmt=jpeg)host

无论是满意度、关注度还是性能，Svelte 都是很突出优秀的，下面看一下它的优势

### Svelte 优势

1、不需要运行时代码的框架，因此减少了框架运行时的代码量；

2、减少代码量：构建的组件无需依赖模板文件；

3、无虚拟 DOM：Svelte 将你的代码编译成体积小、不依赖框架的普通 JS 代码，在构建时运行，将组件转换为命令式代码，以手术方式更新 DOM；

4、真正的响应式：无需复杂的状态管理库，Svelte 为 js 自身添加反应能力，因为他是一个编译器，可以通过在幕后来检测赋值；

5、最主要的是 Svelte 是生来就支持 CustomElements ，并提供了编译 API。

所以我选择了 svelte

而选择 vite 主要原因就是快

项目搭建
----

1、`npm init vite@latest` 下载模版命令

2、输入项目名称 `vite_svelte_comps`

3、选择 svelte 模版（这里还可以选择 ts）

4、进入项目并安装 `npm install`

5、运行 `npm dev`

开发一个 Counter Web Components
---------------------------

### Counter.svelte

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BibpPL7rmvfqagTlgu8h3l0YlGrwlrqT2Tec38qfpSmbqBQCgjMTyTdg/640?wx_fmt=png)host

### 将自定义组件转成通用组件

需要将自定义 Svelte 组件转成通用的 Web Component ，这样才可以在其他框架中直接使用。

需要在 svelte.config.js 文件中 compilerOptions: {customElement: true}

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BkhDoqXtbFbCgqxtG06CsYYdWwdyIiboa7Emew08bIDq8qe4Yhb2E5lg/640?wx_fmt=png)host

然后在组件内定义元素名称`<svelte:options tag="my-custom-counter"/>`

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BcfsEicpy4PccqVZj31re0LGzXfg42nmicqWicBHB3JZsEmPd7C0S5icdNg/640?wx_fmt=png)host

在 index.js 中导出

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4B9G6kU4gEb9MpGicg78wjKA8V0Pe31wvsB2L0icfGeRLdaMdV6gYnkU1Q/640?wx_fmt=png)host

### 打包

打包 `npm run build`

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4B9G6kU4gEb9MpGicg78wjKA8V0Pe31wvsB2L0icfGeRLdaMdV6gYnkU1Q/640?wx_fmt=png)host

### 注册并登录 npm 账号

1、首先要在 `https://www.npmjs.com/` 官网上注册一个账号

2、注册成功后，在终端登录 npm 账号 `npm login` (登录 npm 账号，密码，邮箱验证)

```
Username: npm 用户名

Password: npm 登录密码

Email: npm 绑定的邮箱；回车后，会向你的邮箱发送一个验证码

Enter one-time password: 你邮箱收到的6位数验证码
```

3、登录成功

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4Biake5aaEBlq5UHo8OZamdtWCLNBzvvetlme6sMEoHVYNdhBpe4YV9TA/640?wx_fmt=png)host

### 发布到 npm 上

进入项目所在的终端，输入指令 `npm publish`

下面是发布成功后的样子

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4B7tGtVAzdHStYfODpQvy6qmRXMm4brtLYQp22Opy0lwXtWzOL2xWZcg/640?wx_fmt=png)host

### react 项目中的引用情况

`npm i vite_svelte_comps`

使用 demo 地址：https://codesandbox.io/s/awesome-saha-05stz8?file=/src/App.js

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BAH62GqDw9RPxFBl0UbsyKgjFecPic2EjHI2vdMCDYNuYRc9LZBJJSLg/640?wx_fmt=png)host

### vue 项目中的引用情况

`npm i vite_svelte_comps`

使用 demo 地址：https://codesandbox.io/s/wonderful-galileo-pnmryi?file=/src/App.vue

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBRLCSvSsTyLeAjOpXfiaJ4BIuHxnx9xgX76sibf1Um1V8sAxe4NnfqK7Mq9LL8yym8RKco7qhZZtog/640?wx_fmt=png)host

参考资料
----

[1] 性能测试 (https://rawgit.com/krausest/js-framework-benchmark/master/webdriver-ts-results/table.html)  
[2] svelte 中文网 (https://www.sveltejs.cn/)  
[3] All the Ways to Make a Web Component(https://webcomponents.dev/blog/all-the-ways-to-make-a-web-component/)  
[4] WebComponents 框架对比 (https://zhoukekestar.github.io/notes/2020/02/07/webcomponents.html)  
[5] [Web Component(https://developer.mozilla.org/zh-CN/docs/Web/Web_Components)

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)