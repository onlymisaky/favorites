> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/wj08y9QKfW36Fw2JJxSFdA)

大厂技术  高级前端  Node 进阶
===================

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

开发者工作中，研究代码逻辑常需要思考这个问题：数组变更后，具体变更了哪一些元素？变更的位置如何？本文作者陈碧松解析并覆写了针对数组变化的 diff 算法逻辑。希望本文对你有帮助。

![](https://mmbiz.qpic.cn/mmbiz_jpg/VY8SELNGe94QeANounecCYXmibLibjDT9FiaZYIGick0nWJJXC1lSLI8zy2asbcicfNgvgJXexvB9rOnicPxbKFdEibPg/640?wx_fmt=jpeg)**diff 方法的运行规则和前提方法**

为了了解 diff 方法的运行规则和前提方法，首先我们通过几个图快速区别虚拟 node 进行深度优先和同级对比。

深度优先:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjTBWSJwUNF3wZgiaI7Ye3G6vYeFHd26ibibx2GmmSUg7SibGACdKS9V1sWw/640?wx_fmt=png)

同级对比：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjUGzdYx1zMA4bYhvvH3NSf5qZXoTeMxaqiaZ7xPfrdVyHicGMNhMk7ibSw/640?wx_fmt=png)

如上面图所示，每次 vnode 都是执行同级对比。（对应 dom 同一个父元素）

代码逻辑如下图：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjicUHYA8eeZWZhXbavSDmqwTcBUk9A0HuJCsrWMJX9PPdl7XbZjhTt9Q/640?wx_fmt=png)

第二，**简单判断**：`sameVnode` 函数用来进行判断是否是同一个 vnode 元素。源代码如下：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjJ1ax0d9b4iarn7iaImdAnQkZ7ibCticNhtKCHJ95kqFat138jAEYno1VcQ/640?wx_fmt=png)

如图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjTuAc6WKeUUbNRkIt6eTKVbqFTF4EOrcMNqPN5MIawajcibEWLzzroAg/640?wx_fmt=png)

这里有两个重要元素：`key` : 开发者定义的”:key”；`sel `:  元素 tagName + 元素 id + 元素 class。

sel 的定义源码如下：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjxCWegJMra3F4C5eRicTFz1cUxBIvCACSMlMqJA1lKYK5jUhEYkHQOMw/640?wx_fmt=png)

vNode 构建函数：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjczANiciawYCSIzlbluTaT9TZ8NeXoV0kzxjshtH3VXGk6iazkPboyu2Eg/640?wx_fmt=png)

第三是构建索引。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjyOFfC2iandr77n22txMicDD0XstjicJjNCQwv0iaZUP9Aefb7ibQ2nwAxHw/640?wx_fmt=png)

逻辑如图：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjrAXxdCI0cudkPJiatvWV1EkDhSTSh0S6MsWvxcG70mOtiaZVolopROKg/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_jpg/VY8SELNGe94QeANounecCYXmibLibjDT9F812pnpTVKsrLmlcKHlIuuBvuwqeIqmOLOsD9nTpkow7FlAh45LKRLA/640?wx_fmt=jpeg)**如何处理元素**

尽量不新增 / 删除 dom。如图下所示:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCj01jF7mpkEJJ2P5R3QsHPL0YEl1wb4O4VKH6lcbBs0mnPVs8oibCOqPQ/640?wx_fmt=png)

如果是相同 vnode，源码如下：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjicHsVEa4gkLLY10hxDo8v1HeVOtPss21v0Bv168RXHy7V1ZGE79cpag/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_jpg/VY8SELNGe94QeANounecCYXmibLibjDT9Fl62j5eylelCcZwNOEv5HRg9xicSj2KIwvdQMPbwiau3eqyIUpKbjQ6nA/640?wx_fmt=jpeg)**开始比较**

首先会进行时间复杂度 O(n) 的 while 循环，循环条件为 “遍历旧节点数组 && 遍历新节点数组，谁先遍历完循环就结束”。源码如下图:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCj84Kl6Sn4KfsZiaK3LtrIbCewk3HhurrcTu1lq0Fxd9jWZgCibeOB1I5A/640?wx_fmt=png)

在每次的循环过程中，会有两大类判断方法：

**1）首尾比较 & 首尾序号**

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCj3ibFKmQjs1CgexK1AqUS9Ghtj6UEzun7aDiaT4J3HAqKXyt9k2Bib781A/640?wx_fmt=png)

逻辑：如图上所示。首先在循环遍历前标记好新，旧节点数组的开始位置和结束位置的序号：oldStartIdx、oldEndIdx、newStartIdx、newEndIdx；其次在循环遍历的过程中采用 **“****首首比较，尾尾比较，首尾比较 "**。

源码如下：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjRiczjibGXW4kt1pbU8kkQFWqw6Ey4jvqiaKaGU1viaOnXPDwDEWfoHvwvQ/640?wx_fmt=png)

如果数据为图上所示，那么根据首尾比较方法会有如下图所示结果，最终全部执行了更新操作：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjicmCxuRPHS1QTYic8eOeDTQDRnw7FVibJ6dqnicVdDzTH2XCZqwSXcicnIQ/640?wx_fmt=png)

**2）索引比较**

**最坏情况, 这里的时间复杂度也是 O(n)，即整个算法复杂度 O(n)+O(n)。**每次遍历的过程中可能存在 "新数组节点新增 / 旧数组节点删除"，那么前后对比就满足不了条件。这里逻辑会进入索引比较：比如这种情况：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCju1NhoeXPkcyR4Kq1WPnDCOFlrKSQRo6BtbI9OLUMOgDgVicT58wH48g/640?wx_fmt=png)

那么循环中会执行一遍，创建旧数组的索引对象。从创建到比较的整个逻辑图如下：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjayAyic2ABZZJuRWRlBMdGlYnCUrKJ4wL0ObWDI0hjohj1K59Z0mGrdQ/640?wx_fmt=png)

这里的源码如下:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjYAQzwdMUUx55OFwfI1IcpLR4618tkIfMIEf806CSxnn9UPgSmKuqjQ/640?wx_fmt=png)

*   **当旧节点不存在新增的节点时, 进行当前 oldStartIdx 位置的添加**
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjZ8rQViaMbA2nJibAGC9wGqmvGYpBasIEwkpHicjhOJtNVEqiadyaqyUZ4g/640?wx_fmt=png)
    

源码如下:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjy8yNaXndaC3xKlLe1s5FJWWibYI5963J3o3scq8y1zRsdYTnFApUXUA/640?wx_fmt=png)

*   **当旧数组存在节点，那么进行位置移动**
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjlY7LRGyTvibo5NaLBMoz8ib0R2aaZRiamJ5l2odMHhmaFib6CeZxZNCxvA/640?wx_fmt=png)
    

源码：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjBLZAFG3fOpiapd9Zibo5fW8k3nbZGspEibMVqY2yIfBa6XOJk8mr2ojow/640?wx_fmt=png)

**3）当节点遍历完之后**

会存在两种情况：新数组已经遍历完，但旧数组没有遍历完成；旧数组遍历完成，但新数组没有遍历完成。故源代码的判断如下:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjiaMD360MVsJDBkLXiarxktFAUk30YSxlyNEttTgeA4Qw50s7SxwT3GLQ/640?wx_fmt=png)

*   **旧数组没有循环完成**
    

旧数组没有循环完成的效果如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjXIQqD8pZZBEBwibx9HJvsgheAqp2CfHsdycExm29Oibq1LbibKrAKVdWw/640?wx_fmt=png)

这里注意一个点，我们每次的节点更新会移动序号，即使被删除的节点不在一块最终也会被首尾比较算法 “摞在一块”（oldStartIdx~oldEndIdx）。上图所示更加明显。源码在这里就进行批量删除：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjiahPJicFqiaCyyld61kr1kSSyn4vb31U8TfsRQB3zsZGszMpuzv0foDyg/640?wx_fmt=png)

*   **新数组没有循环完成**
    

效果如下图所示:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjhz887l0jFoicUgcgJmlRYHFib39OoMAuh3ibmD4cpbHzicQzxhrFico4NgQ/640?wx_fmt=png)

整体来说，有几个关键点：**简单对比；创建旧数组的索引表；首位对比 & 首尾索引 & vnode 位置移动；索引添加 / 位移；剩余部分批量处理添加 / 删除**。

经过前后对比 & 索引的过滤后，只会存在新. 末尾节点!== 旧节点及之前的连续的新节点 (!== 旧节点)，所以这里也被 “摞在一块”，即 （newStartIdx~newEndIdx）。源码如下。这样，整个 diff 的对比算法就已经走完了。核心就是：前后对比 + 索引。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjzF9WuhprQAWGQU1ao5saylXTUbYJLSWxqt0IicBhrJ8BAh343EuMR8A/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_jpg/VY8SELNGe94QeANounecCYXmibLibjDT9FPB6mZB01WGXHsGUE2UYENHAJNeKa8y0qwiajZdfHR5lvk4rjnrQabwg/640?wx_fmt=jpeg)

**vue3.0 对于 diff 比较前的优化**

vue3.0 针对 “无脑”patchVnode 进行了过滤 -- 静态类型 Vnode 老版的源码:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjlkS53I630YjrSKxFkWuGwlZOIsXQYDIbP3Xt5V0xrteAgzpP5s5trA/640?wx_fmt=png)

这里，我们再重复下 vue2.x 系列的对比更新逻辑:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjFaQ46IT6qx4jrTE4Hgnw2pOUyh2yzyibqbmwA8030xVmvE8CybRz6Yg/640?wx_fmt=png)

新版的 vue3.0 增加了静态类型 Vnode。如果是静态类型的 vnode，直接跳过更新，修改新节点引用即可。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjLkFS8oWGPPF4Kqha3SuSTRBicB1pgb5RaDbYBwdYKmPibE8F411niaSZA/640?wx_fmt=png)

comment 类型目前翻到它的源码也只是更改引用，源码作者加上了一行注释。

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjJHDON5QSRNmlmNFSFaG2dnDAlhwAMbibkibPGGAvyu87vLpuNtEbGHfQ/640?wx_fmt=png)

补充一下，flagment 碎片类型为新增的 vnode 类型，即：

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjXxz0XKAA5y19cpGX51nvPRz7hnvQ2IjE2yibvVO2YuBRFmaUW3Rl5gg/640?wx_fmt=png)

vue3.0 的过滤判断源码如下:

![](https://mmbiz.qpic.cn/mmbiz_png/VY8SELNGe96E4vsumHtibvh7FUpxrpQCjy89Qiatb7HQHqkI3gT4MmLK6Cuib1iaRcfHk0zxOAxibV880WD9RcbXURA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_jpg/VY8SELNGe94QeANounecCYXmibLibjDT9F9gEWETfj769ZEnnF4YHYbm1UBFpYldG1ibl6E9owa0M3yRB40WtEqLg/640?wx_fmt=jpeg)

**数组比较的应用**

由于我们想监听数组的变化，参考了 diff 算法覆写类似的逻辑，用来在 update,add,dels 时，代码层面获取操作的具体节点明细（新旧节点的位置，内容）。希望本文对你有帮助。

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍
```