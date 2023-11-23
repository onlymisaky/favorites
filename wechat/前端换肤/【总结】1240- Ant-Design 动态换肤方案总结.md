> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-0zHsuFLZbnfdjTAwixNmA)

开头
--

最近有需求要换肤，于是研究了下这个方向，故事就这么开始了

换肤的技术调研
-------

1.Less 在线编译 - 前端引入 Less

2. 多套 Css 皮肤实现

3. 覆盖样式实现

4.Css 变量实现

5.... 若干方案

> 一个换肤，就有很多种方案，那么就要好好考虑了

项目实际情况
------

由于我们的项目是基于 React + Ant-Design 开发的，那么我最想用的是 Ant-Design 的官方方案，于是随着时间流逝，我发现 Ant-Design 更新了`4.17.1-alpha.0`版本

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3GPT1CHiaSVuLcpfsx2WhfBa3ZLsMkO62LIH1gicVqZuGpulRBj6eWwic3J4jBIQ0nPPn1tPms3DibM2FtmiaIZiapQA/640?wx_fmt=png)

并且在底部发现了一个切换主题色的功能

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3GPT1CHiaSVuLcpfsx2WhfBa3ZLsMkO620NPIOKywIC4QBWhNqbCJZPAy9LwTeatrgqjgiawwz2jZunzyicwicM6BQ/640?wx_fmt=png)

于是就好奇的点了进去

发现跟我之前设计的，通过 react-color 这个库来选择设置颜色，以及 CSS 变量实现的方案一样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3GPT1CHiaSVuLcpfsx2WhfBa3ZLsMkO62ibeGFIcnFxPTFE8tZ3k8TLf2FzNkF7aNetmmRfVGiad2QXZ2iazoqunzw/640?wx_fmt=png)

并且对于项目来说更友好，只需要：

引入 `antd.variable.min.css#`

替换当前项目引入样式文件为 CSS Variable 版本：

```
-- import 'antd/dist/antd.min.css';++ import 'antd/dist/antd.variable.min.css';
```

> 注：如果你使用了 babel-plugin-import，需要将其去除。

静态方法配置

调用 `ConfigProvider` 配置方法设置主题色：

```
import { ConfigProvider } from 'antd';ConfigProvider.config({  theme: {    primaryColor: '#25b864',  },});
```

这里面的坑
-----

如果你使用了 webpack 打包进行代码分割，就会存在异步的 chunk 模块，那么很可能这个换肤就会失效，这个时候你就要把`antd/dist/antd.variable`这个文件放在静态资源服务器上，在项目中进行异步加载。

例如，在项目中获取到基础数据后, 再创建一个 style 标签加载这个`antd/dist/antd.variable`文件, 最后用标签形式插入到 document 中：

```
getBaseInfo().then(getVariableCssAndAppend)；
```

然后就再调用`ConfigProvider.config`，换肤就生效了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3GPT1CHiaSVuLcpfsx2WhfBa3ZLsMkO62XPQAwxCffy711PUIbpuJMjqyvwEicTw6dzibYx0ykTticLWR3ACc8kYvA/640?wx_fmt=png)

官方方案最舒服的是不用自己去梳理哪些变量等，他们会给出 5 个选项可以选择，并且可以动态换肤，缺点是不支持 IE，以及需要升级到`antd@4.17.0-alpha.0`版本

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3GPT1CHiaSVuLcpfsx2WhfBa3ZLsMkO62zBCxyReWKg3mzALRrueLReoVib0ZiacsDFIyiacgj8jhQbOWk46PsCFdA/640?wx_fmt=jpeg)

结尾
--

要用好一个开源库，前提是要知道某些方面的实现原理，例如这次我们踩的坑，就是异步引入模块导致设置主题失效，所以大家觉得学源码原理有没有用呢？当然是有用的，所以，加油学习吧~

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 120[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 130+ 篇原创文章