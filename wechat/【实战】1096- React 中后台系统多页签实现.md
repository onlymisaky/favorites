> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/o0CBoTpXaUcQ_wV5CgNaDg)

> 在中后台管理类系统中，**多页签**的需求非常普遍，用户常常需要在多个页签内跳转，比如填写表单时去查询某个列表获取一些字段信息再回到表单页面填写。这样的需求在 Vue 中使用 `keep-alive` 即可实现，但是在 React 中，React Router 切换路由后就会卸载组件，而本身并没有提供类似 `keep-alive` 的功能，所以实现多页签的功能就会变得格外困难。我的项目也遇到了同样的问题，在 2019 年左右做了技术调研和选型，最终选择了 react-router-cache-route，并在此基础上实现了多页签的需求，并稳定运行了 2 年的时间。下面我来复盘一下这次的多页签改造。

一、项目简介
------

本项目是我现在所在部门的项目，是一个**企业级中后台管理系统**，包括系统管理、角色权限体系、基于 Activiti 的工作流引擎等很多开箱即用的功能。项目包括前后端，后端是我们部门自研的基于 Spring 的企业级 Java 框架，**前端是 React 技术栈，当时还是 v15 版本。React Router 还是 v2 版本**。

项目主要对象是提供给科技部门有中后台和流程需求的项目组，基于我们项目提供的基线工程，可以快速搭建工程，在此基础上根据需求进行开发。截止到 2019 年 10 月我离开该项目组，本项目已经服务了行内近 50 个系统。

二、需求背景
------

当时的**多页签**需求还是比较明确的，因为我们团队在 2013 年使用 Sea.js + JQuery 的后管类系统都早已实现了，而新的使用 React 技术栈构建的新 UI 却丢失了这个功能，备受用户诟病，期望多页签的需求十分强烈。而 Vue 使用 `keep-alive` 即可实现多页签功能，如下图的  vue-element-admin  就是典型的多页签案例。

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl4lX6fVVw37EJicQKLOGicwTaJaxXlJFUwWqnIEftd9m0grPN3ZIgLZtQQ/640?wx_fmt=png)Vue Element Admin 系统多页签实现

React 多页签本身好实现，难点是没有官方提供类似 Vue 的 `keep-alive` 功能，而使用 React Router，路由切换会直接卸载组件，导致无法缓存，用户的数据和行为因此丢失了。

社区上关于多页签的需求呼声也非常高，但是如 React 社区比较出名的中后台方案 Ant Design Pro 也不支持该功能，两年没看，至今仍然有很多 Issue 提出这类需求：

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl493uR5ldlqUe1AnoT5jK4ibU9qvLslgEhcvUPia9YqEibxsmqlW4V9faicg/640?wx_fmt=png)Antd Pro 社区多页签需求 Issues

偏右大佬早在 2017 年对此做出了回应，详见 “能否提供 tab 切换模式 · Issue #220 · ant-design/ant-design-pro · GitHub”，这个 Isuue 虽然关闭了，但这些年仍然活跃：

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl43f9EodmL5HnHmPBMSaFXmiaD2AIP6QS2M8fvKrvnSxprDU4t22yQSOA/640?wx_fmt=png)偏右 2017 年的回应

看 👎 的数量就知道，用户其实对这种回答很不买帐。再来看 2019 年偏右对这个问题的解释，稍微具体了些：

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl4t3ma8osTrFCvzXISgicnXiad459tLFz7bGZ4jG3ER7xTSibWe273BsD8A/640?wx_fmt=png)偏右 2019 年的回应

**这个解释我个人并不完全认同**。首先说 “tab 模式无法（不适合）进行 url 的分享” 其实是不成立的， url 带路由和参数就能准确跳转到对应页面，这在我们系统和 Vue 的多页签系统里都是基本功能；而说浏览器本身有 tabs 就不需要做到网站内部，也比较片面，SPA 的页面不开浏览器 tab 应该**更符合 Antd 的设计价值观：足不出****户 - Ant Design**，就连最新版的 Chrome 都已经支持 “群组” 功能了，让用户在 SPA 页面尽量不开浏览器页签才应该是更好的体验设计。

看看社区其他人的理性分析：

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl4b0VhX7ftmjphfnfKe1lDkoH9FiawtLwE2k3IV0lv39o9yz3GNFOnpmw/640?wx_fmt=png)社区用户反馈

三、方案选型
------

经过一番调研之后，基本的思路大概有三种：

1.  **使用 Redux**，数据往 store 里面怼，实现页面数据的” 缓存 “。
    
2.  **改写 React Router 源码**，切换路由不卸载，改为隐藏。
    
3.  **使用社区的轮子**，当时选了 GitHub 里的两个产品：React Keeper  和 react-router-cache-route
    

其实每种方案都存在一些问题，最终的选择是使用了排除法。第一种方案的缺点是，由于**存在大量的存量项目**，而且项目本身的代码也很多，**改造侵入性比较大**，不是很好的选择。第二种的思路和  react-router-cache-route  比较像，就**不想重复造轮子**了。第三种选用开源方案其实当时也不太想选择，别看现在这两个项目都有 700 多 star，**在当时 star 数只有****几十个**，**而且 Issue 和 Pr 也****很少**，也就是用户和贡献者都不多，所以担心会有后续维护性的问题以及隐藏的暗坑。

最终同事选择了 react-router-cache-route，但在当时在项目尝试集成的时候，直接就报个错，给了我同事当头一棒，详见这个 Issue。

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl4Zxa8NhBETzsXhokjdKK1FmibEDmob45tj8ajPkr8ibPCFvZffTsicTibXA/640?wx_fmt=png)

  
同事找到我来排查问题，经过定位，发现是 React 16 的一个 **Breaking Change** 导致的，**从 React 16 版本开始， React 组件可以返回数组了**，而 React 15 不行，详见我提交的这个 PR。  
![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl4CUiaiczMLrkTDaLj4z8Fiaps08QtYGKN9I3xo0eiafR7Y0FWNfsUKpNUBA/640?wx_fmt=png)

解决了 react-router-cache-route 在 React 15 版本报错问题之后，接下来的工作就是实现页签的 UI 和打开关闭的逻辑了，注意关闭需要调用  react-router-cache-route 的卸载缓存 API。

四、还存在什么问题
---------

项目组深度使用  react-router-cache-route  两年时间了，期间由于 React 和 React Router 版本迭代也出现过一些问题，好在  react-router-cache-route 的作者一直保持更新，解决了很多棘手的问题。

但目前总结起来仍然存在两个问题，一个是嵌套的 Cache Route 内部 Route 无法清除缓存问题，刚才看了一下，这个问题终于有了解，详见 Issue #64 ：

![](https://mmbiz.qpic.cn/mmbiz_png/4zdhUdvhbaluQrr4LnrGiay30DnRZPjl4vJibNm51UHxgibdgl5MgKa2VXUbVpw74icI7oTJkTzggFtgfcSrmfwSyA/640?wx_fmt=png)嵌套路由无法清楚缓存问题时隔一年才有解法

但这个问题**大约 1 年时间才有****解！**

还有一个问题，这个其实不是 react-router-cache-route 的问题。我们在多页签的迭代中增加了相同组件多开功能，这个场景比较常见，比如列表页点击链接跳转到表单页，可以同时打开多个表单，这样在不使用 Redux 是没有什么问题，但是一旦数据存在 Redux 中，多开组件就会有问题，显示的始终是 store 中最新的数据，要解决这个问题，需要重构 Redux 相关逻辑，比较麻烦。

五、现在 React 多页签方案有啥新进展吗
----------------------

有很长时间没关注了，这两天复盘看了看相关 Issue，发现又出现了一些新的轮子，没有验证过，先放在下面供同学们参考。如果想要实现多页签功能的同学，还是推荐使用 react-router-cache-route，毕竟我们已经稳定使用两年多了，没有太大问题。

*   react-router-cache-route （推荐）
    
*   React Activation （和上面的工具同一个作者，Vue 中功能在 React 中的实现，配合 babel 预编译实现更稳定的 KeepAlive 功能）
    
*   umi-plugin-keep-alive （上面轮子的 umi 插件）
    
*   react-keeper （774 star）
    
*   react-antd-multi-tabs-admin (73 star，Antd 多标签页后台管理模板）
    
*   react-live-route （207 star，也是一种缓存路由的轮子）
    
*   React Ant （232 star，基于 Ant Design Pro 2.0 的多标签页 tabs)
    
*   Ant Design Pro Plus （ 88 star，基于 ant-design-pro 做一些微小的工作）
    
*   React Admin （83 star，基于 Ant Design React 的管理系统架构）
    
*   ant_pro_tabs （82 star，基于 Ant Design Pro 4 实现多标签页面，包括：路由联动，列表，多详情页共存，自动新增、关闭标签等功能）
    
*   Antd Pro Page Tabs （ 54 star，Ant Design Pro 多页签，基于 UmiJS ）
    
*   alita/packages/tabs-layout（基于 umi 的移动端 react 框架的缓存插件）
    

大家选择的时候可以考察其原理，star 数，Issue 数，PR 数等，当然，也可以看看他们实现的原理，学习一下这块的思路也是不错的。

六、结语
----

中后台类系统**多页签**的需求应该是很多的，React 技术栈**目前还没有大一统的解决方案**，目前是轮子齐飞的状态。希望本文的经验能够帮助到大家，少走弯路。

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

点击 “**阅读原文**” 查看 120+ 篇原创文章