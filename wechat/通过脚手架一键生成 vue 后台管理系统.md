> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/L2_AAuGXWieAMSIpPM1ULQ)

最近一直在做后台管理，一般都是从网上 git clone 一份下来，然后根据需求将多余的模块删除。

这时我就在想有没有一种方法能够根据我的需要自动配置我想要的功能和模块呢？毕竟每一次复制粘贴也怪麻烦的，而且有些后台管理用的技术栈并不是我想要的。

例如，我想用不同的 ui 库，模板用的 ts，但是我想要 js 版的，想用上多语言等等。。。

于是，参考 vue cli 的方式我搭建了一个脚手架 bd-admin, 能够按照我的需求自己选择技术栈

如果对你有帮助，可以下载安装试一试，欢迎提各种需求和 bug

**「ps: 如果发现项目无法创建或者生成的项目有问题，请说一下你现在的版本号」**

**「目前最低支持版本 18.12.0」**

bd-admin 是什么？
-------------

bd-admin（布丁 admin）是一款能根据需求快速配置 vue 后台管理的脚手架，内置使用 vue3 + vue-router + pinia + axios 其他功能均可自定义。

脚手架能做什么？
--------

*   极简操作，安装就可使用
    
*   轻装上阵，模块功能自己决定是否使用，可以快速修改为自己想要的模板。
    
*   自定义技术栈 : vue3 +elementUI or vue3+Ant Design 由你搭配
    
*   自定义后台管理功能模块：权限配置 or 多语言 or 动态换肤 项目功能由你选择
    
*   代码规范可配置：自选是否在项目中应用 eslint 和 Prettier
    

构建后后台管理有哪些功能？
-------------

搭建的后台模板默认是使用 vite5，vue3,pinia,axios 这些流行的技术栈 其余可选配置有

*   框架技术自提
    

*   [x] 语言选择：typeScript or javaScript
    
*   [x] ui 库选择 ：element Plus or Ant Design
    
*   [x] css 扩展语言选择: less or scss
    
*   [x] 代码规范: eslint 和 Prettier
    
*   [x] 多语言：使用 i18 配置多语言
    

*   框架模块自提
    

*   [x] echarts
    
*   [x] three.js
    

如何使用
----

使用方法很简单, 先全局安装脚手架

```
npm install bd-admin -g
```

然后

```
bd-admin create <name>
```

之后就可以根据配置自主选择项目需要哪些模块了

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmphpod9s4OnNl7xbLXP5ErmWMeyJBZUaWfzfNvdTcG8w6Twy1eujrhg/640?wx_fmt=png&from=appmsg)image.png

生成后的项目示例
--------

### 示例 1

**「ts」**+vue3+i18n+vue-router+pinia+**「ant Design vue」**

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmia7rianBoxf1ZL2UibahI11AH6tUFQedcyj79m1bwQQsBMgkQ97RygtUw/640?wx_fmt=png&from=appmsg)image.png

### 示例 2

**「js」**+vue3+i18n+vue-router+pinia+**「element」**

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmiceLOlUlAmY7QZMgWt1Qhtv4tuzLPrYlibCmFQKJqhfu7HRlrvqSDeXg/640?wx_fmt=png&from=appmsg)image.png![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmUCvNHVzb3UyKCGXY4fF4jsDSLVq6qOo3JkSl4ewDrU7mmEQcXZTCicw/640?wx_fmt=png&from=appmsg)