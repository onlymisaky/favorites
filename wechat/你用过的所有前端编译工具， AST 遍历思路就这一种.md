> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/LXtG4qmlW67LvOyDkIbcXw)

作为前端，我们会用很多编译工具：typescript compiler、babel、eslint、postcss 等等，它们的 AST 不尽相同，但 AST 的遍历算法有且只有一种，不信我们慢慢来理一下。

AST 的遍历思路
---------

编译工具会把源码转成 AST，从而把对字符串的操作转为对 AST 对象树的操作。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdpuu9ZECJ1FdltwgxXqnqPEV2EpZEO0JKOviavIepqozFFK62EzYhDSQ/640?wx_fmt=png)

既然要操作 AST，那就要找到对应的 AST，这就需要遍历。

怎么遍历呢？

AST 不就是树嘛，而树的遍历就深度优先和广度优先两种，而这里只能是深度优先。

那对于每个 AST 怎么遍历呢？

比如 `a + b` 这个 BinaryExpression，需要遍历 left、right 属性

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdOFEoRHRyvcCOJiaqoL13v5nHialBB5V3uBLdGwQWce8qYJhTCK5KNpgw/640?wx_fmt=png)

比如 `if (a === 1) {}` 这个 IfStatement，需要遍历 test、consequece 属性：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdxlgW9NZC5LnDe3HtO3Vo5SLA2ThsP0QwA1b8hTtfhv3xicYXphibqUag/640?wx_fmt=png)

这样，我们记录下每种 AST 怎么遍历，然后从根结点开始递归的遍历就可以了。

比如像这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxd2oBzLpeaVwtnJLZUR9UHib4eeDD5fPHqfMiaH7x7Rymgc2sdyxRYZVRw/640?wx_fmt=png)

因为是每种 AST 访问那些 key，所以叫做 visitorKeys。

遍历每种 AST 的时候，就从 visitorKeys 里面找，看看要遍历哪些属性，之后取出来递归遍历就行了。

这就是 AST 的遍历过程，有且只有这么一种。（你还能想出第二种么？）

当然，思路虽然只有一种，但还是有一些变形的：

比如把递归变成循环，因为 AST 如果过深，那递归层次就过深，可能栈溢出，所以可以加一个数组（作为栈）来记录接下来要遍历 AST，这样就可以变成循环了。（react fiber 也是把递归变循环）

比如可以不把 visitorKeys 提出来，而是直接在代码里写死，这样虽然不如提出来更容易扩展，但是做一些针对部分 AST 的逻辑变更还是比较方便的。

说了这么多，但是你可能不信，那我们就上源码来看下 babel、eslint、tsc、estraverse、postcss 都是怎么遍历 AST 的。

各种编译工具的 AST 遍历的实现
-----------------

源码里面有很多无关的信息，我们重点看遍历的部分就好了：

### eslint

eslint 的 遍历过程比较标准，我们先来看下这个：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdCayASk9vyxiaHicYaN8sdHT56OafNMR4y3p7iajUKtHBic6TZPFia8k5v8g/640?wx_fmt=png)

就是对每种 AST 都从 visitorKeys 中拿到遍历的属性 keys，然后递归遍历每个 key 的值就行了，数组的话还要循环遍历每个元素。

和我们上面理清的思路一毛一样。

而且，在遍历之前可以调用 enter 回调函数，在遍历之后可以调用 exit 回调函数。

### babel

babel 也是一样的思路，通过 visitorKeys 记录每种 AST 怎么遍历，然后遍历的时候取出对应的 keys 来递归访问：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdmxyoOdibxphwcnIHviaEU8DqMYh1AR0TMRbeGU4N13bo7jmSQ9l5Hl4w/640?wx_fmt=png)

babel 分为了两个方法，没啥实质区别，而且也有 enter 和 exit 两个阶段的回调。

estraverse
----------

estraverse 是专门用于遍历 AST 的库，一般和 esprima 的 parser 配合。它的 AST 遍历和上面两个不太一样，就是把递归变成了循环。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdFaOEycCpJ1tF9FebOh02LaUTGjVxKeiceibcNollTJncJlbDTKuqamXg/640?wx_fmt=png)

看到我标出来的地方了么，和上面的是一样的，只不过这里不是递归了，而是把要遍历的 AST 放入数组，之后继续循环。

递归改循环的思路都是这样，加个数组（作为栈）记录路径就可以了。

typescript
----------

typescript 的遍历和上面的也不太一样，它没有抽离出 visitorKeys 的数据，而是写死在代码里对什么 AST 访问什么属性：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdhuazVWy1xBEXreovfVeTC0Cxwia5aA6juZbHCVGKFjoeFmfAT0klL3w/640?wx_fmt=png)

这种方式比较命令式，要把所有 AST 枚举一遍，而上面那种把 visitorKeys 抽离出来的方式是声明式的思想，逻辑可以复用。不知道为什么 ts 是这样写遍历逻辑的，可能好处就是可以对某一些遍历逻辑做修改吧。

postcss
-------

postcss 也稍微有点不同，它的所有 key 都是可遍历的，也就不需要 visitorKeys ，直接遍历所有的 key 就行。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGhhdHanelEUyibHxLYicABJxdNS0lkuQxusYk0Q5V9Zy07P0x7AVzVagrQQuFXygL1oSoxDZ8jibXWfw/640?wx_fmt=png)

而且 postcss 的 node 是有方法的，通过面向对象的方式来组织遍历的过程。

写法上有点区别，但遍历的思路没有变。

总结
--

前端领域的编译工具有挺多的，它们都是基于 AST，而操作 AST 就需要遍历来查找。

eslint、babel、estraverse、postcss、typescript compiler 这些编译工具的遍历 AST 的实现我们都过了一遍，虽然有的用递归、有的用循环，有的是面向对象、有的是函数，有的是抽离 visitorKeys、有的是写死在代码里，但思路都是一样的。

所以，我们来正式的下个结论：`编译工具的遍历实现思路只有一种，就是找到每种 AST 的可遍历的 keys，深度优先的遍历。`

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNBsxuv924G1gCDazaicxKjHiblcTLNHIJXxhEas0FQjX7bAj9JE4RYVt8VAibxw0C3bU2I6ws0oRricmw/640?wx_fmt=gif)

**「分享」**「点赞」******「在看」**是最大支持