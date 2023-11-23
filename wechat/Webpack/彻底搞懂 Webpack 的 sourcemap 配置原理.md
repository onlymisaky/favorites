> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0Sq9Z0i9Q3N0likFlZB0rQ)

用过 webpack 的都知道，webpack 的 sourcemap 配置是比较麻烦的，比如这两个配置的区别：

*   eval-nosources-cheap-module-source-map
    
*   hidden-module-source-map
    

是不是分不清楚？

其实它是有规律的。

你把配置写错的时候，webpack 会提示你一个正则：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibaOR6X4Mopxic5bLwMns1bxvteFibF60jR6dadPx9hsdmhkAOk1drQERw/640?wx_fmt=png)

`^(inline-|hidden-|eval-)?(nosources-)?(cheap-(module-)?)?source-map$`

这个就是配置的规律，是几种基础配置的组合。

搞懂了每一种基础配置，比如 eval、nosources、cheap、module，按照规律组合起来，也就搞懂了整体的配置。

那这每一种配置都是什么意思呢？

我们分别来看一下。

在讲基础配置之前，首先讲下 sourcemap 是什么：

sourcemap
---------

**sourcemap 是关联编译后的代码和源码的，通过一个个行列号的映射。**

比如编译后代码的第 3 行第 4 列，对应着源码里的第 8 行第 5 列这种，这叫做一个 mapping。

sourcemap 的格式如下：

```
{    version : 3,    file: "out.js",    sourceRoot : "",    sources: ["foo.js", "bar.js"],    names: ["a", "b"],    mappings: "AAgBC,SAAQ,CAAEA;AAAEA",      sourcesContent: ['const a = 1; console.log(a)', 'const b = 2; console.log(b)']}
```

version 是版本号，file 是文件名，sourceRoot 是源码根目录，names 是转换前的变量名，sources 是源码文件，sourcesContent 是每个 sources 对应的源码的内容，mappings 就是一个个位置映射了。

为什么 sources 可以有多个呢？

因为可能编译产物是多个源文件合并的，比如打包，一个 bundle.js 就对应了 n 个 sources 源文件。

为什么要把变量名单独摘出来到 names 里呢？

因为这样就可以通过下标来索引了，mapping 里面就不用保存变量名，只保留 names 的索引就行。

重点是 mappings 部分：

mappings 部分是通过分号`;` 和逗号 `,` 分隔的：

```
mappings:"AAAAA,BBBBB;CCCCC"
```

一个分号就代表一行，这样就免去了行的映射。

然后每一行可能有多个位置的映射，用 `,` 分隔。

那具体的每一个 mapping 都是啥呢？

比如 AAAAA 一共五位，分别有不同的含义：

*   第一位：转换后代码的第几列（行数通过分号 ; 来确定）
    
*   第二位：对应转换前的哪个源码文件，保存在 sources 里的，这里通过下标索引
    
*   第三位：对应转换前的源码的第几行
    
*   第四位：对应转换前的源码的第几列
    
*   第五位：对应转换前的源码的哪个变量名，保存在 names 里的，这里通过下标索引
    

然后经过编码之后，就成了 AAAAA 这种，这种编码方式叫做 VLQ 编码。

sourcemap 的格式还是很容易理解的，就是一一映射编译后代码的位置和源码的位置。

各种调试工具一般都支持 sourcemap 的解析，只要在文件末尾加上这样一行：

```
//@ sourceMappingURL=/path/to/source.js.map
```

运行时就会关联到源码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibdBYpxQEdyKdLmPay6y3wlNajHqAlMQEp7kGQXuqmrqLEWibHcibd0ruQ/640?wx_fmt=png)

sourcemap 介绍完了，接下来一起来看下 webpack 的几种 sourcemap 配置。

前面说过，webpack 的 sourcemap 配置是 eval、cheap、nosources、inline、source-map 等基础配置的组合。

我们先分别来看下这几种基础配置：

eval
----

eval 的 api 是动态执行 JS 代码的。比如：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibhtDwVdgm9Nar8ibZmiba7T5mHAYwHDoccezltqOfK0ib7F3OM9CQZZRAQ/640?wx_fmt=png)

但有个问题，eval 的代码打不了断点。

怎么解决这个问题呢？

浏览器支持了这样一种特性，只要在 eval 代码的最后加上 //# sourceURL=xxx，那就会以 xxx 为名字把这段代码加到 sources 里。那不就可以打断点了么？

比如这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibQxHZuPn81UeyL3Aic8N5hwyFNnjjvqr5ViaKbicCG5Gp7Z71FL7DMh0JA/640?wx_fmt=png)

执行以后，你会发现 sources 多了`光.js`的文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibh9DqnibEMRll46hNGeYRy8HFCksKXR9uZicW63mqXtNn2JicVQUHxlemw/640?wx_fmt=png)

它是可以打断点的，比如在 add 里打个断点，然后再执行 eval。

你会发现它断住了！

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibpVuh0j7TTY2loaKatZ7J0qxDRWGFPrgqOxGOQ9AJUib7Xx64VhK2dOA/640?wx_fmt=png)

除了指定 source 文件外，还可以进一步指定 sourcemap 来映射到源码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibMDlrcC1cg11d5pxGlxeQAkO3ctXef3IVVqZgfhhCoI4RrgFpJVBXHw/640?wx_fmt=png)

这样，动态 eval 的代码也能关联到源码，并且能打断点了！

webpack 就利用了 eval 这个特性来优化的 sourcemap 生成的性能，比如你可以指定 devtool 为 eval：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibQomjic35qRflUllia0bJnjjKuRuk5AjrYWhfRGiackdb8YtWCjuqNo7Cw/640?wx_fmt=png)

生成的代码就是每个模块都被 eval 包裹的，并且有 sourceUrl 来指定文件名：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibK8D6uVib3HWSibcwD5Dk4AWiaD1dc9MPyghCOyNq8GXxlyofyRiaCgvJvg/640?wx_fmt=png)

这样有啥好处呢？

快呀，因为只要指定个文件名就行，不用生成 sourcemap。sourcemap 的生成还是很慢的，要一个个 mapping 的处理，做编码之类的。

每个模块的代码都被 eval 包裹，那么执行的时候就会在 sources 里生成对应的文件，这样就可以打断点了：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibicnYBmWT5Iia6t4ZCq9vVxfOR4WTnlxSsLQqQXVKLWw3Y7rZOzfOtdfw/640?wx_fmt=gif)

不过这样只是把每个模块的代码分了出去，并没有做源码的关联，如果相关联源码，可以再开启 sourcemap：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOib9WNRh6ua4YNKw16zLib5A6SWeSiav7BxDgb8hqstc9hs4RFLbtdGrH5w/640?wx_fmt=png)

你会发现生成的代码也是用 eval 包裹的，但除了 sourceUrl 外，还有 sourceMappingUrl：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibapjP7Ku7XxnKVhQBBiaO1wEGicb9hEGRAlEDOgiaef8u1pmZ02BDglKkQ/640?wx_fmt=png)

再运行的时候除了 eval 的代码会生成文件放在 sources 外，还会做 sourcemap 的映射：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibXmn7SObP75aMgp1EhEia9rWRpmNOd7auvaygjLszJobAiazVhzEsgiaDw/640?wx_fmt=png)

webpack 的 sourcemap 的配置就利用了浏览器对 eval 代码的调试支持。

所以为什么这个配置项不叫 sourcemap 而叫 devtool 呢？

因为不只是 sourcemap 呀，eval 的方式也行。

再来看下一个基础配置：

source-map
----------

source-map 的配置是生成独立的 sourcemap 文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibsJIISHUhQMxovmrqvJwYxIsKQ9Rr75tC1OtsKVZWvlG3VhmM43n4GQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibqy4HYsLF0pNAQBRL9aXbxqGvSGA4YmtTfyv4h6palDedwZf0CzUnUw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibR0tLAB43glmCGalIcT8LCmZMicKJwDkXS9WnZSqROmibQ3XWiaa6NL7IQ/640?wx_fmt=png)

可以关联，也可以不关联，比如加上 hidden，就是生成 sourcemap 但是不关联：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOib60ROZbQr1rz7wXibHb6Gy6YbFjwBEdYKokrWM6LlzRR6PljAx4uX8icw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibia1VTKbeEbX6vPMbAWibOJoHm8kRiaulM9XYpKb38W9MNn5cia49NXHuTg/640?wx_fmt=png)

生产环境就不需要关联 sourcemap，但是可能要生成 sourcemap 文件，把它上传到错误管理平台之类的，用来映射线上代码报错位置到对应的源码。

此外，还可以配置成 inline 的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibkjtl5EDVV9fUPfmWyWCA2ksF88OYZDoTsB7Wugp8hfjI45Nu0rVmBA/640?wx_fmt=png)

这个就是通过 dataUrl 的方式内联在打包后的文件里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibzhSwiaD1oLkxLcR5IfmVdd71fMbgoKIfEkubNZibtT1Ua41EW9Jr6mdw/640?wx_fmt=png)

这几个配置还是很好懂的，我们来看下一个基础配置：

cheap
-----

sourcemap 慢主要是处理映射比较慢，很多情况下我们不需要映射到源码的行和列，只要精确到行就行，这时候就可以用 cheap。

不精确到列能提升 souremap 生成速度，但是会牺牲一些精准度：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibiatiaa9IMgaeAiak1Tv4nfNC4abp9aWbibfBdJgILrt7Ro3kO8sbSumEzw/640?wx_fmt=png)

我们再来看下一个基础配置：

module
------

webpack 中对一个模块会进行多次处理，比如经过 loader A 做一次转换，再用 laoder B 做一次转换，之后打包到一起。

每次转换都会生成 sourcemap，那也就是有多个 sourcemap：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibmXwmzwiaSibtuMvMCN3jghVP56OZbHO4TLibrPRu7icrBHiaia3KhS1oWBKA/640?wx_fmt=png)

默认 sourcemap 只是能从 bundle 关联到模块的代码，也就是只关联了最后那个 sourcemap。

那如果你想调试最初的源码怎么办呢？

那就把每一次的 loader 的 sourcemap 也关联起来，这就是 module 配置的作用。

比如我们想调试 React 最初的源码，那就要先生成有 sourcemap 的代码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibjLuy3zwNE4hBiaDEpE5IIwQa5tmzVINBVkcm7KVqK62ffthUBia9viakQ/640?wx_fmt=png)

怎么生成有 sourcemap 的 React 代码可以看我[前面一篇文章](http://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247491142&idx=1&sn=44f4c5d0b776048c229cc5b1e7b32114&chksm=cf00d17df877586b756cc368e17dac0b13db0c160fef847bf5e325d7b809bdb4bb44a1935b26&scene=21#wechat_redirect)。

有了 sourcemap 之后，要配置下 sourcemap-loader：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibl4Islpn15t1vQdZjCKuqYjEUsg32Im5wXJwqUSR2TpOgrehx51LYkQ/640?wx_fmt=png)

它的作用就是读取源码的 sourcemap，传递给后面的 loader。

之后配置 devtool，加上 module：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibHXIxuHlrMtReqAePtBjUJIWC2W44dLHBx8K2gicy81vr39BTu1IDuVQ/640?wx_fmt=png)

再次运行，你就会发现 react 代码能映射到最初的源码了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibykDRCQZ3x9No10UcXCdqOtQicM8d89skvRlHgDcjHrTpxlOyD7yRWag/640?wx_fmt=png)

之前只能从 bundle.js 映射到编译后的模块代码，也就是这一步：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibLTWe93vpqae80NKI64RTJHJzhdgMEVmJibnZAlibIp9hcsdAl4zliaJWg/640?wx_fmt=png)

devtool 配置加上 module，就支持了 loader 的 sourcemap 映射，然后再加上 sourmap-loader 来读取源码的 sourcemap，这样就能一次性映射回最初的源码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibsf9Xldh1QQ6W6kvXYzL786F2VPPUib7lQQicj7VQXzPOGwApwkEyFnfw/640?wx_fmt=png)

当你想调试最初的源码的时候，module 的配置就很有用了。

接下来还有最后一个基础配置：

nosources
---------

sourcemap 里是有 sourceContent 部分的，也就是直接把源码贴在这里，这样的好处是根据文件路径查不到文件也可以映射，但这样会增加 sourcemap 的体积。

如果你确定根据文件路径能查找到源文件，那不生成 sourceContent 也行。

比如 devtool 配置为 source-map，生成的 sourcemap 是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibPILuuOyMgPianhtwSWlkxFfib9n9u6joNTHgib5thO7yrKrKnwKTUicLNg/640?wx_fmt=png)

当你加上 nosources 之后，生成的 sourcemap 就没有 sourceContent 部分了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOiblnoPf9VkHnF5Mf0VV4yPJkgjcxh9J0ViaYs3aRJzQpS64f8zJAxBxug/640?wx_fmt=png)

sourcemap 文件大小会小很多。

基础配置讲完了，接下来就是各种组合了，这个就比较简单了，就算组合错了，webpack 也会提示你应该按照什么顺序来组合。

它是按照这个正则来校验的：^(inline-|hidden-|eval-)?(nosources-)?(cheap-(module-)?)?source-map$

接下来，我们讨论下最佳实践：

线上的时候当然要启用 hidden，不关联 sourcemap，但要生成 sourcemap，不大需要 module 来映射回最初的源码，所以可能是 hidden-source-map 这种。

开发的时候可以用 eval 的方式，这样是每个模块单独做映射，不用从 bundle.js 开始映射，然后 cheap 也可以开启，只映射到源码的某一行，提升生成速度，一般需要 module 来映射回最初的源码，所以可能是 eval-cheap-module-source-map 这种。

当然，具体怎么配置是按照需求来的，我们理解了每个基础配置，知道怎么组合就可以了。

不知道有没有同学会觉得这样写比较麻烦，能不能每个基础配置用 true、false 的方式配置呢？

确实可以，有这样一个插件：SourceMapDevToolPlugin

它有很多 option，比如 module、columns、noSources 等：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibxfNtUDyichhCTVRz3UibkvwUfnUKfEc8tGor1WlX0DPCJQLdvzYnjHAQ/640?wx_fmt=png)

相当于是 devtool 的另一种配置方式，启用它需要把 devtool 设置为 false。

而且它可以控制更多东西，比如修改 sourcemap 的 url 和文件名等：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGjGWScxbxOSJ6wRIj9kZfOibhIvuicjNiagjXrIia0lTABTbQLJybibD1ckgxmvs24wXGtUHI9HcpicZhQA/640?wx_fmt=png)

当你需要做更多的 sourcemap 生成方式的控制的时候，可以使用这个 webpack 插件。

总结
--

webpack 的 sourcemap 配置比较麻烦，但其实也是有规律的。

它是对一些基础配置按照一定顺序的组合，理解了每个基础配置，知道了怎么组合就理解了各种 devtool 配置。

*   eval：浏览器 devtool 支持通过 sourceUrl 来把 eval 的内容单独生成文件，还可以进一步通过 sourceMappingUrl 来映射回源码，webpack 利用这个特性来简化了 sourcemap 的处理，可以直接从模块开始映射，不用从 bundle 级别。
    
*   cheap：只映射到源代码的某一行，不精确到列，可以提升 sourcemap 生成速度
    
*   source-map：生成 sourcemap 文件，可以配置 inline，会以 dataURL 的方式内联，可以配置 hidden，只生成 sourcemap，不和生成的文件关联
    
*   nosources：不生成 sourceContent 内容，可以减小 sourcemap 文件的大小
    
*   module：sourcemap 生成时会关联每一步 loader 生成的 sourcemap，配合 sourcemap-loader 可以映射回最初的源码
    

理解了这些基础配置项，根据 ^(inline-|hidden-|eval-)?(nosources-)?(cheap-(module-)?)?source-map$ 的规律来进行组合，就可以实现各种需求下的 sourcemap 配置。

当然，这种 sourcemap 配置还不够细致，比如 sourcemap 的 url 怎么生成，文件名是什么。如果想对这些做配置，可以关掉 devtool，启用 SourceMapDevToolPlugin 来配置。

虽然 webapck 的 sourcemap 配置方式比较多，但最底层也就是浏览器支持的文件级别的 sourcemap 还有 eval 代码的 source 映射和 sourcemap 这两种机制。其余的方式都是基于这两种机制的封装。

理解了浏览器 devtool 的机制，webpack 封装出的基础配置，知道了组合规则，就可以应对各种需求的 sourcemap 配置。