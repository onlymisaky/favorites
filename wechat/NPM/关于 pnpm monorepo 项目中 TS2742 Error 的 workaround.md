> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-P61ifLnuPDRYm63CrugOw)

![](https://mmbiz.qpic.cn/mmbiz_jpg/lolOWBY1tkwUTmlb0S2bwCXVaAhm6U9Eib8uctfHQYCicziapZPXMAldrzZW6kwGaqn3EZHiaOyEpWyg3kRFYfAuzw/640?wx_fmt=jpeg)

最近我在使用 pnpm 作为包管理器开发一个 monorepo 项目，从个人体验来说，在 monorepo 项目中，pnpm 确实要比 yarn classic 用得舒心，最让我欣喜的是 pnpm 对 workspace 协议的支持度很好；另外感受比较明显的一点就是，开发过程中感知到的由于依赖层级导致的 bug 也变少了。

但是任何事情都不可能是完美的。果不其然，一个关键的 bug 就在等着我。我在这个 pnpm monorepo 项目中尝试为一个子包生成 d.ts 类型声明文件时，出现了一个 TS2742 错误。

```
error TS2742: The inferred type of 'default' cannot be named without a reference to '.pnpm/@vue+runtime-core@3.3.4/node_modules/@vue/runtime-core'. This is likely not portable. A type annotation is necessary.<br style="visibility: visible;">
```

从错误信息最后一句话看，是需要加一个类型注解，但是从我的使用场景来看，相关类型应该是能够自动推导出来的，不需要画蛇添足。感觉很奇怪！

第一反应是检查下 .pnpm 目录下的对应的文件是不是都正常。经检查，一切文件结构和软链接都正常。

然后就想着是不是代码引入 vue 相关的依赖时有问题。看了报错处，都是很正常的一些引用，比如：

```
import { defineComponent } from "vue"<br style="visibility: visible;">
```

但是从报错信息来看，似乎是找不到 vue 内部的子包的相关类型，难道是通过 vue 找内部包的时候出问题了？

另外很奇怪的一点是：VSCode 表现正常，鼠标悬停类型提示正常，面板也没有报出任何关于类型的错误。

无奈，只能拿着错误信息去 google 搜索，确实找到了 github 上一些关联度很高的 issue，issue 来源包括 typescript, pnpm 等仓库。

microsoft/TypeScript#42873[1]

microsoft/TypeScript#47663[2]

这些 issue 在 21 年，22 年就提出了，但是目前也还没有 Close。我试了 issue 讨论中提到的一些方法，包括修改`preserveSymlinks`，在项目根目录安装对应依赖，设置 tsconfig.json 中的`paths`配置辅助 TypeScript 找到对应依赖的位置等，但是最后都没有奏效，可能是我的解决姿势不正确，最终困扰了几天，在 google, stackoverflow, github 上一无所获，也尝试过 debug 去分析代码执行过程，也没看明白。

解决方法 1：node-linker=hoisted
--------------------------

于是我在想是不是 pnpm 的依赖结构导致的，如果放弃 symlink 这种方式会不会奏效。结果还真的行，虽然这不是我想要的解决方式，因为这样是完全放弃了 pnpm 的重要优势。

具体做法：

1.  在 .npmrc 文件中配置`node-linker=hoisted`
    
2.  删除 node_modules 和 pnpm-lock.yaml
    
3.  pnpm i 重新构建依赖
    

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwUTmlb0S2bwCXVaAhm6U9EHcI9ASStbGwOlu0VkyYHTKIteqcjR3z3pRzW2iadKHdD6f1Q2mqjicQA/640?wx_fmt=png) pnpm

相关链接：node-linker[3]。

解决方法 2：依赖提层级 + paths 配置
-----------------------

在使用 node-linker=hoisted 后，我仍然不死心，还是希望能够找到一个更好的方法，能解决问题的同时兼顾 pnpm symlink 的重要特性。

说来也是缘分，前几天，一位圈内好友也遇到了类似问题，并且看到了我在 TypeScript issue 中的 comment，就找到了我讨论这个问题，并分享了他的解决方案。

最终我的解决方法是，将`@vue/shared`这个包同时安装到 pnpm monorepo 项目的根级 node_modules 下。

```
pnpm add -Dw @vue/shared
```

再通过配置 tsconfig.json 中的 `paths` 配置项，辅助 TypeScript 能够找到对应的依赖。

```
"paths": {    "@vue/shared": ["./node_modules/@vue/shared"]}
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/lolOWBY1tkwUTmlb0S2bwCXVaAhm6U9ELoVW1Pnk0YiaSvoO9XRWRzibjxn8ggRZYMibok34uSB0CnrLiadCES5wmw/640?wx_fmt=jpeg)

经测试，这个做法必须配置`moduleResolution`为`Node16`及以上。

这个解法涉及到的一些关键点其实在一些 issue 中也有提到，不过我之前只是单独采用了 issue 中某一解决方法，而没有把这些方法结合起来尝试，最终导致我没有及时地解决掉这个问题。

具体过程和原因就不分析了，如果有遇到相同问题的朋友，希望能对你有所帮助！

### 参考资料

[1]

microsoft/TypeScript#42873: https://github.com/microsoft/TypeScript/issues/42873

[2]

microsoft/TypeScript#47663: https://github.com/microsoft/TypeScript/issues/47663

[3]

node-linker: https://pnpm.io/npmrc#node-linker

  

_END_

  

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXzzPpciaorRnwicnXYBiaSzdB4Hh2ueW2a09xqAztoX9iayLyibTyoicltC7g/640?wx_fmt=png)

  

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)