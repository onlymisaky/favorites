> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/caqV1UvYfoZm8KPIZuPGAw)

> 拥抱 JSX/TSX？  

我们都知道 Vue 一直主流是使用 template 模板来进行页面的编写

而就在最近，Vue3 的超前项目 **Vue Macros** 中，发布了 `defineRender、setupComponent、setupSFC` 这些新的 API，这代表了，以后 Vue3 有可能可以全面拥抱 JSX/TSX 了！！

说这个新 API 之前，我们先来说说什么是 **Vue Macros**

Vue Macros
----------

Vue Macros 是由 Vue 团队成员维护的一个 **超前版 Vue**

许多 Vue3 的新 API 都是在这个项目中孵化出来的，比如 Vue3.4 的：

*   `defineOptions`
    
*   `defineModel`
    

所以从 Vue Macros 这个项目，也可以预见到 Vue3 未来可能会发布的新 API 和新特性

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBommuuwVhWnEu6JjWYPgHvPWHwpVlGhkQe9pI0wQ2kdHgc5BdvVnS4oeA/640?wx_fmt=png&from=appmsg)

Vue Macros 中很多功能都是**超前功能**，在 Vue3 正式版中并没有这些功能，如果想要体验这些超前功能，需要安装对应的插件

```
npm i -D unplugin-vue-macros
```

并在 vite.config.ts 中配置这个插件

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomHTRtllYQROQwW1H2In0z2rS6G1KbKIGcdu0K7iaFzN7dYoYuYBUn68g/640?wx_fmt=png&from=appmsg)

回顾 Vue3 现有渲染方式
--------------

### template

我们在开发 Vue 时，在很多情况下，都会使用 template 来编写页面

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomKx7CKQibhsnrMUC7TzbpYuJYPOoibxmqe88kjL6vN07wlqhl58aiawzFg/640?wx_fmt=png&from=appmsg)

### h 函数

但是在编写一些比较灵活且基础的组件（比如组件库）时，使用 template 来编写比较费劲，所以有些时候也会使用 `h` 函数来编写

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBom61nKJsSpWeREic4n6eLubFsxvhtiaVB48kvfEtDG5E2O6dONictseo1WA/640?wx_fmt=png&from=appmsg)

但是可以看到，虽然 h 函数更加贴近 JavaScript，更加灵活，但是当层级太多时，写起来也是非常的不方便~

### @vitejs/plugin-vue-jsx

所以 Vue3 在之前推出了 `@vitejs/plugin-vue-jsx` 这个插件，目的就是为了开发者能在 Vue3 项目中去使用 JSX/TSX

```
pnpm i @vitejs/plugin-vue-jsx
```

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomfR7mbvD6Y5cbYEO0e7qH3PwSMolXiaOEZ2bvicmlcxdAAhMgLtxF4gcw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomlnOJB0rHRia5zKNh1rUxqO1EYsEsn1seF5G777jXuia4GvJr6UJfrOxg/640?wx_fmt=png&from=appmsg)

拥抱 JSX/TSX！！！
-------------

### defineRender

**defineRender** 是 Vue 超前项目 **Vue Macros** 中推出的一个新的 API，它很有大可能会在未来的 Vue3 正式版中推出

我们可以通过安装 **Vue Macros** 的插件来体验这一超前功能

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomvqvDNicF23UeOpqDOoe25TLicOY1U3sJlian5CPIibpN8RbIaOC7J9fuWQ/640?wx_fmt=png&from=appmsg)

### setupComponent

setupComponent 让 Vue3 越来越像 React 了！！！在超前项目中，推出了 defineSetupComponent 这个 API ，让你可以使用 JSX 去编写一个组件

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomeU46KrPOtf71kxy3kf8KoHOeriaP7aZIzRWjxCzsENTXMRSaCU6nOtQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomBFJ00JicowkQ85kGHiavhNl0lWpF3MXSRJhSGRdJwTwWVZopia4TSJelg/640?wx_fmt=png&from=appmsg)

### setupSFC

setupSFC 的模式下，无需在包裹 defineSetupComponent 这个函数了，甚至可以直接写在 tsx 文件中，来编写一个 SFC

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdgGf1dtYibTqTxeLtZ9zSBomPEeUibRxdHr3JzJUUooGlpiaTPkPq9XNVcfiabvmTaibLBwicunEQu5MtvA/640?wx_fmt=png&from=appmsg)

*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2024 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！