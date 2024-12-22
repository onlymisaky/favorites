> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/HYSLu6pKfZzfc6LRqE-vmg)

一、写在前面
------

一次线上项目 bug，引发了关于 package.json 中的 ^~ 是否该保留？保留可能引发的后果？以及如何在版本更新便利和版本更稳定中取舍的思考？这个 bug 是由于线上部署打包时，自己下载了最新依赖，于是线上依赖版本和研发本地依赖版本不同，不巧的是最新依赖有 bug 而本地早先下载的没有， 导致了定位 bug 浪费了大量时间。

最后是发现 lock 的版本有差异，根据这个方向进一步定位到了 bug。

而会导致这种版安装的依赖版本差异的决定性原因则是 package.json 没有写死版本号，而是使用允许根据市场版本更新的指令符号 ^~。

那么如果希望避免上诉 bug，锁定依赖版本，可行的方案是什么？

本文将以上诉 bug 为引，尝试简单讨论和认识：

1.  ①package.json 中的 ^ ~
    
2.  ②依赖版本锁定：yarn 和 npm 等的 lock 锁定
    
3.  ③依赖版本锁定：package.json 的锁定
    
4.  ④让 Git 记下 lock 的变更记录的意义
    
5.  ⑤小结：前端工程项目依赖版本锁定的小结
    

二、package.json 中的 ^ ~
---------------------

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiad0ZgfyoKclOibAsr756gRia512egRWpe7oc7ujekeIzovUZ98sfnJUv2fq9xcse9yXiaJHXXyLiaMOA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)image.png

1.  ^ 意思是要更新【次版本】，当市场有更新的版本时，例如：package.json 中是 "^2.1.0"，库可能会更新到 2.2.0 的最新版本，但不会更新到 3.0.0 版本。
    
2.  ~ 意思是要更新【补丁版本】，当市场有更新的版本时，例如：package.json 中是 "~2.1.0"，库可能会更新到 2.1.1 的最新版本，但不会更新到 2.2.0 版本。
    
3.  版本号前面啥也没有，表示写死了版本号，无论何时何地安装的依赖版本只会是这个。
    

三、怎么锁定工程依赖的版本
-------------

在实践中，工程依赖的版本锁定，可能会有两方面的考虑，一是通过包管理工具的 lock 进行版本依赖锁定， 二则是通过在 package.json 中写死版本号来 “绝对锁定” 依赖版本。依赖版本的锁定，是必须要考虑， 否则一个差异和不幸可能需要浪费大量时间去定位由此导致的 bug，那将是痛苦而不值得的，尽管发生的机会比较小。

### 3.1 package.json 的锁定

毫无疑问，package.json 具有依赖版本的决定权。是否在安装依赖时，下载新版本，是否修改 lock 版本，是由 package.json 中附带 ~ ^ 等命令符号结合市场最新版本决定的， 在决定性因素上，与使用的包管理工具并无多大关系，无论是 npm、yarn 或 pnpm。

只要，package.json 写死版本号，版本号前不携带那些 ~ ^ 等符号，那么无论何时何地何人安装依赖，依赖版本都会是一致的。

因此，在功能已经开发完毕，进入运维阶段的前端工程项目，如果希望减少由于依赖版本差异带来的莫名其面的 bug，那么写死 package.json 中版本号是可行可靠的。如果确有需要升级依赖版本，再单独手动去升级。项目上线转运维阶段后，需要批量更新依赖，从而使用新依赖的新功能的可能性较小， 而运维中项目保证项目的稳定才是更重要工作，毕竟 “还能跑就行”。

### 3.2 yarn 和 npm 等的 lock 锁定

矛盾是总是存在的，总有不希望一个一个手动更新依赖的需求，总有希望 “一键更新全部依赖” 的场景。这种时候，package.json 中写死版本号，则不是期望的。那么某种程度上的依赖本锁定则出现了，这就是通过包管理工具的 lock 来锁定，例如 yarn 的 yarn.lock，npm 的 package-lock.json， 以及 pnpm 的 pnpm-lock.yaml。

据我观测一些知名的开源项目，通常也不会全部一锤将版本号都写死中 package.json，并且通常让 Git 记下 lock 的变更记录。例如：

1.  vuejs/vue（pnpm 的 lock）[1]
    
2.  facebook/react（yarn 的 lock）[2]
    
3.  axios/axios（npm 的 lock）[3]
    
4.  dcloudio/uni-app（yarn 的 lock）[4]
    
5.  didi/LogicFlow（yarn 的 lock）[5]
    
6.  quilljs/quill（npm 的 lock）[6]
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiad0ZgfyoKclOibAsr756gRia53qW5fJD4kKtErF5NPGlAgsGsDdiazLEQmMZxWHibeP9ROEvtPTibwQag/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)image.png

### 3.3 yarn.lock 和 package-lock.json 下载新依赖上的区别

包管理工具的 lock 也具有某种程度上的 “依赖版本锁定” 功能，尽管不同的工具的 lock 表现具有差异。例如当 package-lock.json 存在时，即使市场上有比 package-lock.json 中锁定版本更新，且 package-lock.json 中存在 ^ ~ 允许更新， 安装的版本也只会是 package-lock.json 中锁定的版本，不会自动下载更新的版本。当然当 package.json 中版本被手动更新，会触发的 package-lock.json 连带变更。

而 yarn 的 yarn.lock 的 “版本锁定” 的则表现不同，当市场有比 yarn.lock 中更新的版本，且 package-lock.json 中存在 ^ ~ 允许更新， 那么 yarn 会自动安装比 yarn.lock 更新的版本并且主动修改 yarn.lock。

从这个差异角度看，package-lock.json 的 “版本锁定” 更可靠，可以起到依赖版本保持一致的作用，而 yarn.lock 则不具备。

### 3.4 让 Git 记下 lock 的变更记录

既然 yarn.lock 无法帮助我们 “锁定” 版本，那么 yarn.lock 的意思而在？我并不清楚 yarn.lock 设计全部意义，但我可以确定的一个价值是： **让 Git 记下 lock 的变更记录，有助于追踪使用的依赖版本记录，有时会很有作用，例如定位某类 bug 时。**

即使 lock 会被修改，它的存在也会很有价值，例如：证明此前被 lock 的版本在本工程是可用的。因为会存在某个新下的最新版本存在缺陷或不符合本工程的需求的情形。这个新版本缺陷可能会导致工程无法运行或运行异常。

一个例子是，新同事安装工程出现工程运行异常，而旧同事正常，且通过 git 证明业务代码无差异，package.json 也无差异，此时差异会体现在 lock 的版本。此时要想使用最新且能确保本工程正常运行的依赖版本，那么旧同事 lock 的依赖版本就是答案。

而 package.json 中的版本虽然可用，但由于具有时间跨度的不确定性，可能会比 lock 的要旧很多。

知名的例子是 vue-router 的 issues #2881 中提到的，在升级了 Vue-Router 版本到 3.1.0 及以上之后，页面在跳转路由控制台会报 Uncaught (in promise) 的问题，从而导致某些场景的跳转异常。

### 3.5 关于依赖地狱 (Dependency Hell) 和依赖分身(Doppelgangers)

package.json 的依赖版本设置作用仅有效于当前工程，实践中依赖锁定往往会涉及嵌套依赖等问题，因为依赖也可能会有 package.json，依赖的依赖也可能会有 package.json。

但本文暂不讨论，关于依赖地域 (Dependency Hell) 和依赖分身 (Doppelgangers) 的问题。

四、小结
----

> 总结上述简单的分析和讨论，小结如下：
> 
> *   ①package.json 具有锁定依赖版本的决定权，包管理工具不具有。
>     
> *   ②package.json ^ 意思是要更新【次版本】，~ 意思是要更新【补丁版本】。
>     
> *   ③yarn 的 yarn.lock 和 npm 的 package-lock.json 对 “锁定依赖版本” 表现不同，package-lock.json 的 “锁定效果” 更可靠。
>     
> *   ④让 Git 记下 lock 的变更记录是有意义的。一些知名开源项目都让 Git 记下 lock 的变更记录。
>     
> 
> vuejs/vue[7] facebook/react[8] axios/axios[9] dcloudio/uni-app[10] didi/LogicFlow[11] quilljs/quill[12]

> 作者：灵扁扁  
> 链接：https://juejin.cn/post/7244818841502826553  
> 来源：稀土掘金