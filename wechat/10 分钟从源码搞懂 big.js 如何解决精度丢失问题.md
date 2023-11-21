> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/yNYfqGmLxGX-nFJ_glc6Ag)

```
大厂技术  高级前端  Node进阶


点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

前言  

想必大家日常开发中经常碰到小数相加结果不准确的坑，也都知道这是因为精度丢失导致的，更是知道能通过一些库，比如 big.js、decimal.js 等解决，但是你知道它们是怎么解决的吗？

今天我带大家一步步分析 big.js 部分源码，帮助大家理解这类库对精度丢失的处理方式。

初窥门径 —— 打开调试窗口
==============

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    <script src='https://cdn.jsdelivr.net/npm/big.js@6.2.1/big.min.js'></script>
</head>
<body>
    <script>
        new Big(1.2).plus(120);
    </script>
</body>
</html>
复制代码


```

我们可以通过 **F12** 或者 **Ctrl+Shift+I** 打开 Chrome DevTool。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtANzZBvLSXnazwHZfGnicyU406vZeCGSxbdhxNheuXBQOibaIzEUu6HcA/640?wx_fmt=other)微信截图_20220930223705.png

在 Sources 标签的 Page 项里，找到未混淆的代码文件 big.js（xxx.min.js 文件一般是压缩混淆后的代码，可读性不高），这个就是我们要用到的完整源码了。

知根知底 —— Big 构造函数做的好事
====================

我们先来看看 `Big` 构造函数做了什么事。

```
function _Big_() {
    function Big(n) {
        var x = this;
        // 可以通过函数调用的形式来创建 Big 对象
        if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);
        // 区分是否为 Big 示例.
        if (n instanceof Big) {
            x.s = n.s;
            x.e = n.e;
            x.c = n.c.slice();
        } else {
            // 边界处理
            if (typeof n !== 'string') {
                if (Big.strict === true && typeof n !== 'bigint') {
                    throw TypeError(INVALID + 'value');
                }
                // Minus zero?
                n = n === 0 && 1 / n < 0 ? '-0' : String(n);
            }
            parse(x, n);
        }
        x.constructor = Big;
    }
    ...
    return Big;
}
复制代码


```

可以发现，一开始的时候，构造函数进行了 **边界处理** 以及 **入参检查** ，随后通过 **`parse`** 函数处理，最后修正构造函数的指向。

我们先将 `this` 对象添加进 watches 里，接着 `parse` 函数后的位置打个断点然后刷新。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtJuZgAF9l5DLglZyLxPKF21ic9PicPO9RX1X60JicI4rFaEKeOZaISLjGw/640?wx_fmt=other)微信截图_20220930233011.png

看看经过 `parse` 函数生成的数据：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtVDClEFHQWNP1DdugMeM3eeDwLLv4OzxslYuIgPMyz4xDa1EBZDcRjA/640?wx_fmt=other)微信截图_20221009164515.png

其中，`c` 是去除首尾的 `0` 之后的所有数字组成的数组，`e` 表示用科学计数法表示 `parse` 函数的入参 `x` 时 **幂的值** ，`s` 表示正负（1 表示正数，-1 表示负数）。

我们分析一下 `new Big(120)` ：去除首尾 0 后，`c` 属性的值为 `[1, 2]`；入参 `x = 120`，用科学计数法表示就是 `1.2 * 10²`；`e` 的值就是对应的 **幂** ，也就是 `2`；`120` 为正，即 `s = 1`。同理，`new Big(1.2)` 对应的值就是 `c = [1, 2], e = 0（1.2 * 10º）, s = 1`。

显然，`parse` 函数用来处理数据，为后续的运算做准备。

对细节感兴趣的小伙伴可以通过 **Ctrl + F** 快捷搜索研究一下。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtFQMjh9NHHju6ib6PkeDmzrpNIZP65jSr7ptgtuSCTpcMy5Dvic9c1QIg/640?wx_fmt=other)微信截图_20220930225016.png

到此为止，我们已经窥得 `Big` 构造函数的全貌，接下来我们看看 `plus/add` 方法做了什么吧。

抽丝剥茧 —— P.plus 源码分析
===================

老方法，**Ctrl+F** 搜索 **P.plus** 后回车，跳转到该方法在文件中所在的位置。

完整源码
----

```
P.plus = P.add = function (y) {
    // 1. 用 x 和 Big 两个变量分别保存 this(调用者) 和 Big 构造函数
    var e, k, t,
        x = this,
        Big = x.constructor;
    // 2. 将入参转化为 Big 对象
    y = new Big(y);

    // 3. 判断是否符号不同，如果不同则直接调用 minus 做减法（1 + （-1）=== 1 - 1）
    if (x.s != y.s) {
        y.s = -y.s;
        return x.minus(y);
    }
    
    // 4. 分别存储 x 和 y 各自的小数点位置以及 number 数组
    var xe = x.e,
        xc = x.c,
        ye = y.e,
        yc = y.c;

    // 5. Either zero?
    if (!xc[0] || !yc[0]) {
        if (!yc[0]) {
            if (xc[0]) {
                y = new Big(x);
            } else {
                y.s = x.s;
            }
        }
        return y;
    }
    
    // 6. copy xc 数组
    xc = xc.slice();
    
    // 7. 补 0（对齐 x 和 y 的长度）
    // Prepend zeros to equalise exponents.
    // Note: reverse faster than unshifts.
    if (e = xe - ye) {
        if (e > 0) {
            ye = xe;
            t = yc;
        } else {
            e = -e;
            t = xc;
        }

        t.reverse();
        for (; e--;) t.push(0);
        t.reverse();
    }
    
    // 8. 如果 xc 长度大于 yc，则交换它们
    // Point xc to the longer array.
    if (xc.length - yc.length < 0) {
        t = yc;
        yc = xc;
        xc = t;
    }
    e = yc.length;
    
    // 9. 相加
    // Only start adding at yc.length - 1 as the further digits of xc can be left as they are.
    for (k = 0; e; xc[e] %= 10) k = (xc[--e] = xc[e] + yc[e] + k) / 10 | 0;
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    if (k) {
        xc.unshift(k);
        ++ye;
    }

    // Remove trailing zeros.
    for (e = xc.length; xc[--e] === 0;) xc.pop();

    y.c = xc;
    y.e = ye;

    return y;
};
复制代码


```

步骤 1 —— 变量定义
------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xt99gr5BhFw9hLfERgl7wvNZB6wMCHaDBrR9IOGd1PXfdKnKcEhyjb8Q/640?wx_fmt=other)微信截图_20221009164908.png

步骤 1 中使用 `x` 和 `Big` 两个变量分别保存 `this`(调用者) 和 `Big` 构造函数。

步骤 2 —— 处理入参
------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xt1XUybua5UIFNT42YEr6MicyuQZuIhms4z32ma4h7I6DS7T2AwkuuJVg/640?wx_fmt=other)微信截图_20221009165036.png

步骤 2 中将入参 `y` 转为 `Big` 实例。

步骤 3 —— 判断符号
------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtQx697N0Y16NEJEVibsHLDl3lHH7BaQ7KsDeCoQqWpbcnkASzFqrsGicg/640?wx_fmt=other)微信截图_20221009165115.png

步骤 3 中对判断 `x` 和 `y` 的符号是否不同，如果不同的话，会先将 `y` 取反，调用 `minus` 方法处理，因为 **一个数加上一个负数相当于减去这个负数取反**（就是 1+(-1)===1-1 的道理）。

这里显然符号相同（s 均为 1），因此继续走下去。

步骤 4 —— 保存属性
------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtMGMSpzJ3c4OPBmvxTiaPXSxl3WqAEs7VWABhjO34ALUgcnxZiaUm1Miag/640?wx_fmt=other)微信截图_20221009165201.png

步骤 4 中将 `x` 和 `y` 的数字数组和符号位置都保存起来，至于作用是啥我也不知道，我也才调试到这呢，继续往下看。

步骤 5 —— 处理值为 0 的情况
------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtZnNoOZGcJSlAOxjlVTpzmyYJP2f5OI82BjAjyTgqcaPibtVzp3chGqA/640?wx_fmt=other)微信截图_20221009165239.png

步骤 5 的 `if` 看来是进不去了，我们自己分析一下吧。

`if` 的判断条件是 `!xc[0] || !yc[0]`，诶，这就用到了步骤 4 的变量了。`xc` 就是 `x` 的数字数组（就是 `big` 实例的 `c` 属性），`yc` 同理。**这里大家注意一下，经过构造函数调用 parse 解析之后，实际上是已经移除首尾的 0 了**，那么 `!xc[0]` 和 `!yc[0]` 怎么可能为 `true` ？那肯定是有段逻辑让它变成了 `0` 咯，直接看源码，果然被我揪到了。

```
function parse(x, n) {
    ...
    // Determine leading zeros.
    for (i = 0; i < nl && n.charAt(i) == '0';) ++i;

    if (i == nl) {
      // Zero.
      x.c = [x.e = 0];
    } else {
      // Determine trailing zeros.
      for (; nl > 0 && n.charAt(--nl) == '0';);
      x.e = e - i - 1;
      x.c = [];

      // Convert string to array of digits without leading/trailing zeros.
      for (e = 0; i <= nl;) x.c[e++] = +n.charAt(i++);
    }
    ...
}
复制代码


```

很明显的，它都给出注释了，**当实例化时入参 `x` 判定为 0 的时候，x.c 和 x.e 都会被置为 0** 。那步骤 5 很显然就是个 **提前返回操作** ，直接返回和 `0` 相加的结果。

步骤 6 —— 拷贝 xc 防止数据污染
--------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtrrXlA0YOISkK2Gd7SNKiabKcgCicG5IkmSbqhEsaibteWSBkqlkoFh7zw/640?wx_fmt=other)微信截图_20221001120834.png

步骤 6 中拷贝了一份 `xc` 数组，防止数据污染。

步骤 7 —— 补 0
-----------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtrsp3L9njlibhAkgU29rram0YGXoQUScoSoBNoVd0MurIvJFeA38VI4A/640?wx_fmt=other)微信截图_20221009165529.png

这段代码的作用是 **补 0** 。从调试信息中我们可以知道此时 `xe \- ye < 0` ，意味着 `e = \-e = 2` ，且 `t = xc = [1, 2]` ，经过 **reverse + push + reverse** 后，`t = xc = [0, 0, 1, 2]`。

我们先看看此时各个参数的值是什么样：

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtqmx3L3ZmhfBfJwn5S3n5sQE3qPN27qg1IiahLY8Ed6BaFANbfbmktibQ/640?wx_fmt=other)微信截图_20221009165940.png

那么这一步的作用是什么呢？我们继续往下看先。

步骤 8 —— 比较 xc 和 yc 的长短
----------------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtzSck13GkpbJvV7PBtDFhYJtTOdnyvgwSosuaJp9CG3fTKGoFVtTg1g/640?wx_fmt=other)微信截图_20221009170216.png

步骤 8 中，将 `xc` 指向长度较长的数组，`yc` 指向较短的数组，且将较短的 `yc.length` 用 `e` 存储起来。由于 `xc.length > yc.length`，因此这步没进去。

步骤 9 —— plus 操作
---------------

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xticJ3gXr3hxmGbyd27uia7XJKA1S4O8Y7UUU5MQ2IBshjw65zmBLQhDjA/640?wx_fmt=other)微信截图_20221009170437.png

步骤 9 就是正戏了，到这里真正开始了 `plus` 操作。

这里有点大整数相加的意思，为了让大家理解，我饭都不吃肝了个动图。

![](https://mmbiz.qpic.cn/sz_mmbiz/H8M5QJDxMHqhGMGQLHsj5nLsInp6e3xtEOzjfClGCClcZibb9zmWkianvwgJZTic1KXjYLVKAda5G9ZQzwZFhH8sQ/640?wx_fmt=other)1_.gif

这下大家知道为什么要将 `xc` 指向较长的数组，而将 `yc` 指向较短的数组了吧。

因为较长的数组前面几位都是要和较短的数组进行计算的，而后面的几位和较短的数组根本不沾边（大家可以把 [0, 9, 1, 2] 与 [1, 2] 的计算想象成 [0, 9, 1, 2] 与 [1, 2, 0, 0] 的计算，[1, 2, 0, 0] 后面两个 0 没必要参与计算的，直接 **从较短数组最后一位开始计算** 就好了）。

至此，我们的 `P.plus` 的源码就分析结束了。

终章
==

本文就到此结束了，总览这个解析过程，我们可以发现 big.js 的加法操作，就是 **将小数全部变成整数，然后进行相加** 。你不是小数运算会丢失精度吗，那我都变成整数不就好了，计算完我再变回小数，诶，就是玩儿。

源码分析也是我的第一次尝试，同时我也学到了很多东西，也希望大家有所收获。

关于本文  

作者：CatWaterm

https://juejin.cn/post/7149735186509332510

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```