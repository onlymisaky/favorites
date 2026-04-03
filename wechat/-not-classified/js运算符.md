> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/j3FdG-t-64b920n1iwV1pA)

 文章转载于稀土掘金——valan_微澜  

前言
==

大家好，今天我们来学习一下`JavaScript`中的几个容易混淆的运算符，它们分别为`|`、`||`、`?`、`??`运算符，并通过一些例子和场景说明他们的用法，避免在项目开发中混淆它们的用法。

位运算符或（`|`）
==========

**按位或**（ **`|`** ）运算符在其中一个或两个操作数对应的二进制位为 `1` 时，该位的结果值为 `1`。

**例子：**

```
const a = 3; // 11const b = 5; // 101console.log(a | b); // 111
```

在以上例子中，十进制`3`的二进制值为`11`，十进制`5`的二进制值为`101`，那么对`a`和`b`使用`|`运算符计算的结果为`111`。简单来说，其实有点像是在对应二进制位为`1`的并集。

```
11101// 保持位数一致，合并1111
```

**使用场景——合并权限：**

```
const PERMISSION_READ = 1; //    0001const PERMISSION_WRITE = 2; //   0010const PERMISSION_EXECUTE = 4; // 0100const PERMISSION_ADMIN = 8; //   1000// 将READ和WRITE权限合并const readAndWritePermissions = PERMISSION_READ | PERMISSION_WRITE;console.log(readAndWritePermissions); // 输出：3 (0011)
```

权限合并如何判断是否具备合并后的权限？首先还得了解一下`&`运算符。

前面我们说了`|`像是求对应二进制位为`1`的并集，那么`&`想必大家也能猜到一点，那就是求对应位数为`1`的交集，只有两个都为`1`时，对应位才为`1`，否则为`0`。

下面开始接着判断前面合并的权限：

```
// 按规律设置权限值const PERMISSION_READ = 1; //    0001const PERMISSION_WRITE = 2; //   0010const PERMISSION_EXECUTE = 4; // 0100const PERMISSION_ADMIN = 8; //   1000// 将READ和WRITE权限合并const readAndWritePermissions = PERMISSION_READ | PERMISSION_WRITE;console.log(readAndWritePermissions); // 输出：3 (0011)// 判断readAndWritePermissions是否有可读权限consoloe.log(readAndWritePermissions & PERMISSION_READ)  // 0001 = PERMISSION_READ// 计算过程readAndWritePermissions：0011PERMISSION_READ：        0001result：                 0001// 以上缩进为了让大家便于阅读计算交集consoloe.log(readAndWritePermissions & PERMISSION_WRITE)  // 0010 = PERMISSION_WRITE// 计算过程readAndWritePermissions：0011PERMISSION_WRITE：       0010result：                 0010
```

**如何一句话记住 | 和 & 的用法：** 求对应二进制位数为`1`的**并集**和**交集**。

逻辑或运算符（`||`）
============

在`JavaScript`中，认为一个值不属于真值的有以下情况：

*   `false`
    
*   `0`
    
*   `''`（空字符串）
    
*   `null`
    
*   `undefined`
    
*   `NaN`
    

逻辑或运算符`||`，用于判断至少一个操作值是否为真。如果左侧操作值为真，则返回它。如果为假，则计算并返回右侧操作值。

**测试例子：**

```
// 由于没有真值，所以a返回0var a = false || 0  // a = 0var b = '' || 0 || 1  // b = 1var c = 1 || 2  // c = 1
```

**场景例子：**

```
let mobile = "152****5086";let nickname = null;let name = nickname || mobile;  // "152****5086"
```

由于`nickname`用户昵称为`null`,j 即为假值，因此`name`的计算结果为`mobile`的值`"152****5086"`。

三元运算符（`?`）
==========

**三元条件运算符**是`JavaScript`中唯一使用三个操作数的运算符。一个条件后跟一个问号（`?`），如果条件为真值则执行冒号（`:`）前的表达式；若条件为假值，则执行最后的表达式。该运算符经常当作`if...else`语句的简捷形式来使用。

**基本用法：**

```
const age = 20;const persion = age >= 18 ? "成年人" : "未成年人";console.log(persion); // 输出：成年人
```

**进阶用法：**

```
const num = -1;const result = num > 0 ? "正数" : num < 0 ? "负数" : "零";console.log(result); // 输出：负数
```

在以上例子中，首先判断`num`是否大于零，条件不满足，继续执行冒号`:`右边的表达式判断`num < 0`，发现满足条件，直接返回结果`负数`。

空值合并运算符（`??`）
=============

空合并运算符 (`??`) 也是一个逻辑运算符，当其左侧操作值为`null`或者`undefined`时，它返回其右侧操作值，否则返回其左侧操作值。它与`||`运算符不同，它不会将其他虚假值（`false`、`0`、`''`、`NaN`）视为触发回退。

**例子 1：**

```
const name = null;const name2 = 'vilan';const result = name ?? name2;console.log(result); // 输出：vilan
```

在这个例子中，由于`name`的值为`null`，所以打印结果为`vilan`。

**例子 2：**

```
const age = 0;const age2 = 18;const result = age ?? age2;console.log(result); // 输出：0
```

在这个例子中，即使`age`是`0`（被认为是假的），`??`操作符也不会将其视为回退的触发器，因为`0`不是`null`或`undefined`。因此，`result`结果年龄的值为`0`。

总结
==

逻辑或运算符 (`||`) 和空合并运算符 (`??`) 这两个运算符经常会被混淆或误解，所以我们在使用时要特别注意它们的内部原理及用法，避免出现意料之外的错误。
