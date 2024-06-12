> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tFNc8hFxJL9ec6aoa8l3Sw)

_**点击**__**关注**__**公众号，“技术干货**__**” 及时达！**_
===========================================

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvYia1h8cHVzyk8ngfS9vSmmfvHSEKM8zOHRMP0EJic60JUjukg7lxHNYVHnRR2LFqqcTDOq3YhoMGA/640?wx_fmt=png&from=appmsg)

unocss 究竟比 tailwindcss 快多少？
===========================

前言
--

我们知道 `unocss` 很快，也许是目前最快的原子化 `CSS` 引擎 (没有之一)。

`unocss` 解释它为什么这么快的原因，是因为它不用去解析 `CSS` 抽象语法树，直接在 `content` 里面通过正则表达式从内容中提取 `token`，然后生成样式。

这点从 `unocss` 官方提供目前最新的测试结果可以看到（2023-08-11 版本）:

```
11/8/2023, 3:53:41 PM
1656 utilities | x200 runs (75% build time)

none                             33.99 ms / delta.      0.00 ms
unocss       v0.57.2            359.46 ms / delta.    325.47 ms (x1.00)
tailwindcss  v3.3.5            1238.25 ms / delta.   1204.26 ms (x3.70)
windicss     v3.5.6            1742.45 ms / delta.   1708.46 ms (x5.25)
```

可以看到 `unocss` 比 `tailwindcss` 快 `3.7` 倍左右。

其中官方的 `unocss` 测试素材，使用的是 `vite` + `@unocss/vite`，`tailwindcss` 测试素材则是 `vite` + `postcss` + `tailwindcss`。

可是假如我们以 `vite` / `webpack` 插件的方式去使用 `unocss` 的话，默认是不支持 `tailwindcss` 那些 `@apply`, `@screen`, `theme()` 这些 `CSS` 指令的。

这时候我们就需要额外去安装 `@unocss/transformer-directives` 这个包，并在 `uno.config.ts` 文件中注册来支持这些功能。

可是，当我们查看这个包的依赖的时候，发现它其实也是去使用一个 `CSS AST` 工具：`css-tree` 去解析操作抽象语法树的。

也就是说，`unocss` 以 `vite`/`webpack` 插件的方式，去实现的那些在 `tailwindcss` 内置的 `css` 指令不免也要解析成 `AST`。

那么这种时候，它又能比 `tailwindcss` 快多少呢？

开始测试
----

这里我做了一个基准测试，`unocss` 只加载 `@unocss/preset-uno` 和 `@unocss/transformer-directives`，`tailwindcss` 为默认注册安装。

测试素材以及代码 `fork` 自 `unocss` 官方 `bench`，和官方 `bench` 不同的是，我为了同时为了模拟平常的开发场景，我还加入了等量的 `@apply` 指令，这样它们都免不了要去解析 `CSS` 抽象语法树。属于是给 `2` 者增加负重了。

> ❝
> 
> 测试设备都为 `Mac Book M1 (2021)`, 跑 `200` 次，取 `75%`
> 
> ❞

源代码链接

运行后，测试结果如下所示：

```
2024/3/5 00:19:14
1656 utilities | x200 runs (75% build time)

none                             19.92 ms / delta.      0.00 ms 
unocss       v0.58.5            328.39 ms / delta.    308.47 ms (x1.00)
tailwindcss  v3.4.1             798.42 ms / delta.    778.49 ms (x2.52)
```

可以看到在 `1656 utilities` 个工具类提取 + `@apply` 的场景，作为 `vite` 插件使用的 `unocss` 速度差不多是 `tailwindcss` 的 `2.52` 倍左右。

相比 `unocss` 原先的测试结果，对比 `tailwindcss` 的速度从 `3.7` 倍 降低到了 `2.52` 倍。

可见 `CSS` 抽象语法树的解析，还是显著的降低了 `unocss` 的速度，不过成绩依然是可喜的，非常厉害。

postcss 方式
----------

当然，想要支持 `tailwindcss` 的 `@apply` , `@screen` , `theme()` 这些 `CSS` 指令，不止上面这一条路。

我们也可以使用 `@unocss/postcss` 这个 `postcss` 插件去达成这样的目的。

另外我也做了一个同样基于 `postcss` 插件的基准测试，`unocss` 只加载 `@unocss/preset-uno`，测试环境也和上一个一样。

源代码链接

测试结果如下:

```
2024/3/5 00:08:25
1656 utilities | x200 runs (75% build time)

none                             16.75 ms / delta.      0.00 ms 
unocss       v0.58.5            679.51 ms / delta.    662.77 ms (x1.00)
tailwindcss  v3.4.1             712.55 ms / delta.    695.80 ms (x1.05)
```

不出所料，果然在都需要在解析抽象语法树情况下，它们的性能差距是非常小的。因为大家操纵 `CSS AST` 的方式和手段都是差不多的，这点上不会有什么差距。

而相差的那 `30ms` 左右，其实关键点就在于，双方引擎中，正则表达式匹配的数量和质量了。但是，相差这点时间其实已经没有意义了，毕竟我们都知道，正则写的越多，越复杂，执行就越慢。

在我看来 `@unocss/postcss` 其实就是一个更加自由，可自定义的 `tailwindcss` 版本，你可以自定义里面匹配和生成 `CSS` 的规则。

这 `2` 个库，其实实现思路其实还是比较相似的，但是这个世界上，并没有必要存在 `2` 个 `tailwindcss`。

unocss vs tailwindcss
---------------------

就像我一向的观点，`unocss` 在帮助我们探索原子化 `CSS` 更多的上限。

`unocss` 在各个方面相比来说都更加的进取，而使用 `@unocss/postcss` 这种方式，相比它推荐的其他使用方式来说，有一点点失去了它的一部分灵魂，你知道我指的是哪一部分（笑～）。

而 `tailwindcss` 和 `unocss` 都可以通过 `plugin` / `preset` 去添加更多的匹配规则。

所以最终决定用什么的，还是取决于自己项目的需求，以及具体技术的生态吧，也就是中国的那句古话：`前人栽树，后人吃瓜`。

结尾
--

这个测试其实也变相的提供了一个 `unocss` 的最佳实践，即只要尽可能少的解析 `CSS AST`，`unocss` 提取 `token` 的速度绝对比 `tailwindcss` 快很多。

然而，最近我看 `X` 看到 `tailwindcss@4.x` 版本也快出了，官方放出了一张图片：

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibvYia1h8cHVzyk8ngfS9vSmmQNeUfQ5GsibyzDhtTlCgTVPxx1FsibI8OiclTRtQtgtS5AcCE7N3yVoiag/640?wx_fmt=jpeg&from=appmsg)Image

X 上链接

感觉性能相当 Ok，属于是用 `rust` 实现了一波弯道超车？狠狠地期待一波:

最后，期待 `unocss` 和 `tailwindcss` 它们之间相互卷起来，未来给我们开发者带来更多的惊喜！

 文章来源：https://github.com/sonofmagic

_**点击**__**关注**__**公众号，“技术干货**__**” 及时达！**_
===========================================