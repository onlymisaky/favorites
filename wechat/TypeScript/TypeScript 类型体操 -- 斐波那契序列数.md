> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gVnDbQc9Az0FUz4Ii1xiAw)

大家好，我是苏先生，2024 年我的第一愿景就是做一个可行的副业，求大佬带我～～

好文推荐
----

*   vite 技术揭秘、还原与实战 - 专栏 - 每周更新
    

前言
--

前边几篇文章我们一共实现了 **43** 个工具类型，按照本专栏的规划，还差 **56** 个...

本节我们继续学习**一个**新的工具类型

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aEytibkhXM8ecPJ9TmzldHaIiajV3XjbFILGWJTrnEQBjP6BbTA1gauBDhsN1r1ltoT7Ef1BKtsMTSg/640?wx_fmt=png&from=appmsg)

提示
--

对于语法层面的知识点本系列（类型体操开头的标题）不会展开说明哈，可以自行搜索学习其他大佬的优质文章或者等我后续更新补充

题目
--

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aEytibkhXM8ecPJ9TmzldHaI98Bmq2TtbVK95DTSP754O8T5fT5fUFVgt0XRwkR8YO0XnibZ0Cw7Ymw/640?wx_fmt=png&from=appmsg)

实现
--

首先，使用 type 关键字创建类型 Fibonacci，它接收一个数值参数 T

```
type Fibonacci<T extends number>
```

由于斐波那契序列一般指的都是非负整数索引，因此对于泛型 T，需要对其取绝对值。至于负数，其本质上等价于先取正整数的斐波那契数然后再对其取反即可

如下，当为负数时，先通过 Abs 取正，再通过模版字符类型取反

```
type Fibonacci<T extends number> =   T extends Abs<T>   ?     _Fibonacci<T>   :     `-${_Fibonacci<Abs<T>>}`
```

不过，为了返回类型的一致性，将正整数 T 对应的斐波那契数也转换成字符串类型

```
type Fibonacci<T extends number> =   T extends Abs<T>   ?     `${_Fibonacci<T>}`   :     `-${_Fibonacci<Abs<T>>}`
```

另外

已知斐波那契序列的性质如下

```
f(n)=f(n-2)+f(n-1)
```

我们搞一个 js 函数来观察下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aEytibkhXM8ecPJ9TmzldHaI1KsoJAvh51qqaedgFD0R6ib37k7KuAAiaYxPAPc4D7e9ibH7TIUickpOVg/640?wx_fmt=png&from=appmsg)

当 n 为 0 时其结果为 0，当 n 为 1 或 2 的时候，其结果为 1，这些结果是恒定的，可以将其前置处理掉

```
type _Fibonacci<T extends number> =   T extends 0   ?     0   :     T extends 1 | 2     ?       1    :      ...
```

省略号部分即 T>=3 的时候，由截图可知，它对应的斐波那契数为

```
f(3)=f(1)+f(2)
```

则，取 parent 的首字母 P 为 f(2)，即 f(n-1)，grandfather 的首字母 G 为 f(1)，即 f(n-2)，声明变量如下

```
type _Fibonacci<  T extends number,   P extends number[] = [1],  G extends number[] = [1]> = ...
```

则对于大于等于 3 的数，只需要对其执行递归

```
_Fibonacci<T,f(n-1),f(n-2)>
```

然后取 P 和 G 的 length 和就是最终的答案了

```
[...P,...G]['length']
```

那现在有两个问题需要解决

1. 递归何时结束？

声明变量 I 表示当前正在计算的斐波那契数

```
type _Fibonacci<  ...,   I extends number[] = [1,1,1],   ...> = ...
```

每递归一次，就将 I 的 length 加 1

```
_Fibonacci<...,[...I,1],...>
```

当 I['length'] 与 T 相等时，递归结束

```
type _Fibonacci<  ...,   I extends number[] = [1,1,1],   ...>   =     ...    I['length'] extends T     ?       '出口'     :       ...
```

2. 传入递归的 f(n-1) 和 f(n-2) 是什么？

结合定义和前文关于出口的说明，只需要依次向前推进一位即可

即

当 T=6 时

进入递归，P 为 5 即 f(n-1)，G 为 4 即 f(n-2)

```
_Fibonacci<T,f(6),f(5)>
```

当 T=7 时

进入递归，P 为 6 即 f(n-1)，G 为 5 即 f(n-2)

```
_Fibonacci<T,f(7),f(6)>
```

故，完整实现如下

```
type Abs<    N extends number> = `${N}`   extends `-${infer R extends number}` ? R : N;type _Fibonacci<  T extends number,   I extends number[] = [0,1,1],   P extends number[] = [1],  G extends number[] = [1]> = T extends 0 ?     0 :     T extends 1 | 2     ?         1    :         T extends I['length']         ?             [...P,...G]['length']        :            _Fibonacci<T,[...I,1],[...P,...G],P> type Fibonacci<T extends number> =   T extends Abs<T>   ?     _Fibonacci<T>   :     `-${_Fibonacci<Abs<T>>}`
```

使用如下

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ua6rWWmia2aEytibkhXM8ecPJ9TmzldHaIKQyVHVsxoicic1I3JGeNlEylKLfnCiayx0L5Z2hbGcspybwF3OeLbV65A/640?wx_fmt=png&from=appmsg)

下期预告
----

*   【知识点】巧用装饰器自动修正 TypeScript 中的类 this 指向
    

-【类型体操】去除数组指定元素

接收数组类型的 T 和数字或数组类型的 U 为参数，会返回一个去除 U 中元素的数组 T

```
type Res = Without<[1, 2], 1>; // [2]type Res1 = Without<[1, 2, 4, 1, 5], [1, 2]>; // [4, 5]type Res2 = Without<[2, 3, 2, 3, 2, 3, 2, 3], [2, 3]>; // []
```

* * *

如果本文对您有用，希望能得到您的点赞和收藏

**订阅专栏**，每**月**更新 1-2 篇类型体操，等你哟😎