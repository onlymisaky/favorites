> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/suaQTXgcDk0Ap1R1SHXP9g)

前言
--

之前对公司七八年的老项目进行了升级，将 vue2 升级到 vue3，并输出了一篇文章，传送门

但它存在很多问题，具体来说：

*   可读性巨差
    

以下边对 filters 的处理举例，你很难一眼看出来它到底在做什么，光是正则就要脑子宕机好一会儿

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciavR7961ejQHUjXAbM3NgjibBRS6mviaWdbsWvJKLdA2cus8LYeNU801kA/640?wx_fmt=png&from=appmsg)

*   识别不准确
    

以下边对 methods 的处理举例，针对 methods 不存在的情况就没办法处理，必须手动在. vue 文件中增加占位符

之所以当时能接受，是因为项目中的大多数页面基本都有该属性配置，要改动的点特别的少

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaRSCLQTZVib6Ylf9AelutUd9jX7aaweeZx1G3gndc6F1jyBhITdyibJLw/640?wx_fmt=png&from=appmsg)

*   不智能
    

在拒绝 gogocode，vue2 升级 vue3，看这里一文中笔者也说了，目标是半自动化。以项目中使用到的 render 函数、slot 插槽举例

项目中有多少呢？说出来也许吓你一跳

公司项目大部分是以 h 函数引用的，有 **718** 个

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciawcZhV6V6UZzxyic5UiayGLy9PV9pjjZgVz3EfL2icOjy8DprOT8cvT9SA/640?wx_fmt=png&from=appmsg)

而 slot 有 **1112** 个

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciar0OwcfTrExhrpL9hMAc74v47eXMfvEUpAm2hMGa1VU9mvNbStUX8AA/640?wx_fmt=png&from=appmsg)

这些当时基本是手动一个一个改的，虽然也有通过正则替换的，但并不可靠，当时也是给我搞的挺 tnn 的

安装与使用
-----

```
// 安装yarn add patch-vue3// 使用const patchVue3 = require('patch-vue3').default;new patchVue3({  // 配置项，详见文档  identifier: {...},  config:{...}}),
```

效果预览
----

测试源码在`example/test.vue`下，笔者此处仅展示结果

*   template 部分
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcialCz9Z9bmB95sLJibvibUDFibN7Z7SuYq5PSEN9r4aPVEX2XHVIscd5eGA/640?wx_fmt=png&from=appmsg)

*   script 部分
    

在 methods 中，黄色是注入的部分，红色是转换的部分

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia8icOwicqeibm9Ez9YDNo9Ph8WdRKrwBricV1pwWGbUoQsTbdFtmWnZUucQ/640?wx_fmt=png&from=appmsg)

render 语法中，黄色是对 props 的处理，红色是对事件绑定的处理

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaDSeEfp3DGGXrcEQSK1HHp2rCorvibcpR0YOIAqVOmvyAYeicZS8wiaAgg/640?wx_fmt=png&from=appmsg)

目标
--

实现一个 webpack 插件，对于 vue2 和 vue3 差异的部分，实现**一键转换**

正文
--

我始终认为，**思路大于开发**，因此，本文之分享核心实现思路，细节概不涉及

首先，要选一个打包工具，并确定输出，笔者这里选择 cjs 和 esm 两种输出格式，

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaNZScAFfF5rQfoGz66mHyrjS3ZiaKhhnqa222iaibvg5q63Mjbu675ojDg/640?wx_fmt=png&from=appmsg)

由于 webpack 的 loader 需要是字符串形式，且需要指向打包后的最终地址，因此，需要设计成双出口

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciabYuZIS0q9p86XB4EZic2Tad8X3Q9YiaUeGdBfGm55X6U7bw1ZFdjibSpQ/640?wx_fmt=png&from=appmsg)

下一步就是来确定实现方式，想要对代码进行转换，无非先定位，后重写

重写的方式无二，只能基于字符串 rewrite

定位要不就是正则匹配，要不就是 ast，显然前文已经证明了前者的不可行，故选择 ast

那问题就变成了如何 ast 化？

*   解析 sfc
    

通过`@vue/compiler-sfc`可以拿到. vue 文件的基本信息，这包括了 script 和 template 部门的源码

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciabpX4N3BnicenfdQAGKFOkAM6INcHiaVcK1xBMh3CgQgVkRKliaLI5KVjw/640?wx_fmt=png&from=appmsg)

*   解析转换 script
    

使用`ast-kit`提供的`babelParse`接口

*   解析转换 template
    

使用`vue-template-compiler`提供的`compiler`接口

接着，我们来简单设计下整个应用程序的风格

首先，定义 ast 基类，它负责对 ast 树做解析或遍历等操作

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaTVyjI27vXbWlvWfBIG1XSp6z2IPuWIn8frgv2DyNIvjdYHPbiaktibQw/640?wx_fmt=png&from=appmsg)

在具体处理 script 或 template 时就可以基于它做扩展

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcias5g2q3k6yl4nJVKGtxZUYXJvg0uvkuic96d4BeAg8D8QukhqB9FMSqw/640?wx_fmt=png&from=appmsg)

### 处理 script

*   思路
    

由于在 vue2 中的 script 代码，本质上是按属性分类的，所以我们要搞一个批量自动触发调用的机制，而不是一堆 if else 做判断然后分发处理

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia9f5RicYzTXicaRG5PzZAicEjMEToGiaYC7bJrHd0kyIv6QtsqTOiaETlKmg/640?wx_fmt=png&from=appmsg)

要想不改变原有代码的写法，最好的方法是将语法的变动层注入到 methods 中，这就保证 methods 必须要在最后一步被程序触发，对应在源码中，它必须在配置项的最后一个，显然这不可能要求开发者这么做，也违背了 “无感” 原则

所以，第一步就是做一些格式化处理

这包括代码格式化，这样操作，能减少对逗号存在性处理的心智负担

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia4B0AvNEwR17Urt9dGjX8JdXVRYg7oPJlqgGs44olXicCX08uEWy3KBg/640?wx_fmt=png&from=appmsg)

还有就是关于 methods 的位置处理，它应该总是在最后，即使原本没有

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciatGpLNkiaPreBicyY9jcqMzXjLqSX84mibFKMIeXdwbauYgtpKdPqRialuA/640?wx_fmt=png&from=appmsg)

最后是关于 render 函数的导入的处理，需要将其收集并从源码中剔除，并等待最后重新注入

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciag5w2IFVJ5UC6kN1MiaQ92xpic6mJhYLdGjuZgmakFsBNibJETy9EKGehQ/640?wx_fmt=png&from=appmsg)

当每一段处理程序执行的时候，只需要基于 ast 的标记进行识别并分发给具体的处理函数重写就可以了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia7usiazUBxkMBKZzXVW0C8luhrQmw6BiceVUsO2OWFgyhIRQajYQroJIw/640?wx_fmt=png&from=appmsg)

*   重难点
    

1 - 处理顺序

在处理的时候要特别注意处理顺序，因为字符串是基于`magic-string`包的，该包会把处理过的字符串位置进行标记，已经处理过的再次处理会报错

因此，在每次处理前，需要进行下 reverse，按从后往前的顺序

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia6MjkeyChlhW6j4mOYhS1lkKa3IjBw3MLOLdoUDlyVibBRM8wzeH0NWw/640?wx_fmt=png&from=appmsg)

（ps：关于顺序的处理涉及很多，并非简单的数组反转，感兴趣的可以看下源码）

2 - 更新 ast 节点

在处理 render 时，由于函数中有可能仍有需要处理的语法

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaBianm7ibRZqNZWX6TG8v5KGBvHSJnqmO0dXUCJZ5Ynee5gHJK4aRW54A/640?wx_fmt=png&from=appmsg)

这样就涉及到了递归，需要对函数体内的语法先行处理，再回过头来继续处理 on 对应的部分

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia7iaAHqghSYGOibibAJQRicTvrzKDy8ibKRCbCkb5ggKdRvjpM1EMvIR3exw/640?wx_fmt=png&from=appmsg)

这就会产生节点的不一致，因此，还需要对节点进行更新

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaSDAfaIQoxkQCOAA8qBGyq2Ag0Rk0dxoOf2387ZrMVqFyicg9V62Q13Q/640?wx_fmt=png&from=appmsg)

3 - 避免重复处理

由于`walkAST`本质上是一次深度遍历，默认情况下，他会对每一个节点依次访问一遍，那就有可能处理过的节点被二次处理

笔者一开始是在全局维护了 repaired 数组来进行标记，后来觉得不够优雅，就去大致翻了下源码，可以像如下这样做，调用 ast 树上的 remove 接口就可以了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaeJNBdbcYXwb98Q8AicmGswvzLk5ydtrpwianteRYnCa7aqE6TmumibtTA/640?wx_fmt=png&from=appmsg)

### 处理 template

说实话，这个可坑死我了！！！

在一开始阶段，笔者是基于`@vue/compiler-dom`进行的 ast 化，实现过程很顺利

在正式向项目里接入时候却不停报错，看了报错后才意识到，可能是解析包的问题，因为它报的错误信息与源码毫无关系

遂，转为`vue-template-compiler`

但`vue-template-compiler`依旧很坑，它虽然解析正常，也有 ast tree。但结构却与正常认知的 ast 大不相同

具体来说

它没有节点在源码中的对应位置信息

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcia3EcSYicfQXS2ic14kM3zaLf68X3CoQLZj2QExqeUBPqYOQedX2YJYeEA/640?wx_fmt=png&from=appmsg)

为此，需要自己去拉取对应的 html 结构

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaGEgq5pWNgHI0ses8wTBYWPTj387ZGjky5sbw2V0zmLWFIVBktHtfLQ/640?wx_fmt=png&from=appmsg)

组件的 slot 是挂载在当前节点的

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciawKJ9vMQEbe0Motda3euAskMHoWsU4t77nVvgpEAfv8dCS0pwunWUkg/640?wx_fmt=png&from=appmsg)

为此，需要自己手动实现 traverseNode

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaZOwPv6FiaY2EKrsqETd2KrnEadd7SC7VOdDLV9B6jShU5wXk4LgRhicw/640?wx_fmt=png&from=appmsg)

还有一点，由于对应的 html 结构是自己实现的，它只能拉取最顶层的 html 部分，对于子 html 结构是无能为力的。至少，在当前版本中是这样

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciaYuSvTibOjzE8ZOfZrA2c3NjWhUuL8AeEHsib6IRM96uUoGQlia5zOJBgQ/640?wx_fmt=png&from=appmsg)

为此，就不能使用`magic-string`包了，因为没法保证先子后父，从后向前，故，需要基于原生 js 实现。为了代码结构的一致性，得模拟一个

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefciatsrOAoNPbyqh8vTiayDiaHl6x0rf2WPkO0XkyMwpwPvHVva8y4GzOrew/640?wx_fmt=png&from=appmsg)

剩下的，就和 script 差不多，都是找到指定的标记，然后分发做处理

预期与展望
-----

以下是一些尚未添加的功能，准备发布成 npm 包，到时候看有没有人用吧，有人用，就搞一下，没人用，就当笔记在这里记一下这样子。就......，梦想是要有的😂

*   支持 import 导入
    

虽然笔者打包了 esm 和 cjs 两种，但是在引入 webpack 的 loader 时却使用的是__dirname 语法，这在 es 模块下大概是不支持的

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aETjnYIQ0x5ArkJdyRBefcias00a0sjN779ftd4ibVoyT54tkDe5tIgZVZQuj6ZggxaaCrcQqZh0LzQ/640?wx_fmt=png&from=appmsg)

*   添加 vite 支持
    

应该有一部分人是基于 vite 跑的 vue2 项目，后续可以进行下支持，并且这也很容易

*   使用 typescript 重构
    

尽管笔者一直在更新 TypeScript 的专栏，但早就过了技术至上的年纪，能不复杂化就尽量简单些，但如果你觉得使用 ts 很酷，那我也可以让它变身

*   增加插件机制
    

插件化这个话题之前是聊过的，并且笔者将不止聊一次，后续的 vite 技术揭秘、还原与实战专栏中也会 1:1 解析并实现插件功能

因为它真的很香，也在一定程度上会降低包作者的维护成本

*   增加 write 配置
    

大概有不少人是希望将转换结果生成文件的，且不说每次运行补丁都会耗费时间，就单说日报这一块儿

你是写我研究了 vue2 和 vue3 的文档，详细对比并罗列了差异点，还通过创建 demo 进行了效果比对，最后逐个攻破，改动了三千八百八十八行代码

还是写我就 npm install 一下，调了个包，完事儿

你自己说，哪一种写出来更显得辛苦一些

*   优化解析流程
    

目前的解析流程我个人感觉是有问题的，虽然我也不是很能说出来到底问题出在哪，似乎每一步都挺合理的，但我不是尤雨奚，所以我的代码具有隐藏 bug，它一定不够好