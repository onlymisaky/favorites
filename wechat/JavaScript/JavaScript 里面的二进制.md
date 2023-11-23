> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/2M_8K47I_fON9ba8nZODNw)

概述
--

最近在做 IOT 设备配网开发的时候，处理了很多跟二进制、字节相关的事情，总结了一下 JavaScript 中有关二进制方面的一些知识点。

二进制和字节
------

首先，现代计算机是基于二进制的，从现代计算机电路来说，只有高电平 / 低电平两种状态，即为 0/1 状态，计算机中所有的数据按照具体的编码格式以二进制的形式存储在设备中。

计算机通信和存储的时候都是以 0101 这样的二进制数据为基础来做处理的，这儿的一个 0 和 1 占的地方就叫 bit(位)，即一个二进制位。可以看出位（bit)是长度单位。8 位组成一个字节，所以字节 (Byte) 也是长度单位。

位和字节的换算关系如下：

1Byte=8bit

1KB=1024B

1MB=1024KB(2 的十次方)

二进制的计算
------

二进制数据的计算指的是位数据的计算，也就是位运算。

位运算分为以下几种操作：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">符号</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">描述</th><th data-style="font-size: 16px; border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">运算规则</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">&amp;</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">与</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">两个位都为 1 时，结果才为 1</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;"><br></td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">或</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">^</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">异或</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">两个位相同为 0，相异为 1</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">~</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">取反</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">0 变 1，1 变 0</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">&lt;&lt;</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">左移</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">各二进位全部左移若干位，高位丢弃，低位补 0</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">&gt;&gt;</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">右移</td><td data-style="font-size: 16px; border-color: rgb(204, 204, 204); min-width: 85px;">各二进位全部右移若干位，正数左补 0，负数左补 1，右边丢弃。</td></tr></tbody></table>

**注意：负数按补码形式参加按位与运算。**

```
原码：用最高位表示符号位，其余位表示数值位的编码称为原码。其中，正数的符号位为 0，负数的符号位为 1。

正数的原码、反码、补码均相同。

负数的反码：原码的符号位保持不变，其余位逐位取反，即可得原码的反码。
负数的补码：在反码的基础上加 1 即得该原码的补码。


例如：
+11 的原码为: 0000 1011
+11 的反码为: 0000 1011
+11 的补码为: 0000 1011

-7 的原码为：1000 0111
-7 的反码为：1111 1000
-7 的补码为：1111 1001
```

位运算的应用很多，这里讲一个经典的，交换两个数。

通常交换两个数的做法如下，比如交换 a 和 b：

```
let temp = a;a = b;b = temp;
```

如果我们用位运算来做

```
a ^= b;
b ^= a;
a ^= b;
```

使用位运算可以少定义一个变量 temp，节省一个点内存空间；

字节顺序
====

字节顺序涉及到二进制数据在内存中怎么存储和网络数据的传输，假设我们定义一个变量 let value = 0x12345678，它在内存中是怎么存储的？

前面我们说过计算机里存储数据都是以二进制的形式存储的，假设一个整型占 4 个字节，那么先将它转成二进制：

```
parseInt(12).toString(2)

00010010 00110100 01010110 01111000。
```

按照正常阅读习惯，我们认为它在计算机内部的存储格式为：

```
低地址
buf[0] (0x12) -- 高位字节
buf[1] (0x34)
buf[2] (0x56)
buf[3] (0x78) -- 低位字节
高地址
```

这种存储模式叫大端模式。相对的还有小端模式

### 大端和小端

*   大端模式，是指数据的高字节保存在内存的低地址中，而数据的低字节保存在内存的高地址中，这样的存储模式有点儿类似于把数据当作字符串顺序处理：地址由小向大增加，而数据从高位往低位放；这和我们的阅读习惯一致。
    
*   小端模式，是指数据的高字节保存在内存的高地址中，而数据的低字节保存在内存的低地址中，这种存储模式将地址的高低和数据位权有效地结合起来，高地址部分权值高，低地址部分权值低。
    

Little-Endian: 低地址存放低位，如下：

```
低地址
buf[0] (0x78) -- 低位字节
buf[1] (0x56)
buf[2] (0x34)
buf[3] (0x12) -- 高位字节
高地址
```

网络传输一般采用大端序，也被称之为**网络字节序。**

计算机内部的字节存储序列叫本机序，不同 CPU 会有不同，摘自维基百科上的一段说明：

```
x86、MOS Technology 6502、Z80、VAX、PDP-11等处理器为小端序；
Motorola 6800、Motorola 68000、PowerPC 970、System/370、SPARC（除V9外）等处理器为大端序；
ARM、PowerPC（除PowerPC 970外）、DEC Alpha、SPARC V9、MIPS、PA-RISC及IA64的字节序是可配置的。
```

总结：采用大端方式进行数据存放符合人类的正常思维，而采用小端方式进行数据存放利于计算机处理。到目前为止，采用大端或者小端进行数据存放，其孰优孰劣也没有定论。

*   以上都是二进制相关的基础知识，下面讲下 JavaScript 中的二进制处理
    

创建二进制数据
-------

**基本的二进制对象是 ArrayBuffer —— 对固定长度的连续内存空间的引用。**

```
let buffer = new ArrayBuffer(16); // 创建一个长度为 16 的 bufferconsole.log(buffer.byteLength); // 16
```

它会分配一个 16 字节的连续内存空间，并用 0 进行预填充

注意：`ArrayBuffer` 不是某种东西的数组 让我们先澄清一个可能的误区。`ArrayBuffer` 与 `Array` 没有任何共同之处：

*   它的长度是固定的，我们无法增加或减少它的长度。
    
*   要访问单个字节，需要另一个 “视图” 对象（TypedArray，下面讲），而不是 `buffer[index]`。
    

`ArrayBuffer` 是一个内存区域。它里面存储了什么？无从判断。只是一个原始的字节序列。**如要操作 `ArrayBuffer`，我们需要使用 “视图” 对象。**

视图对象
----

视图对象本身并不存储任何东西。它是一副 “眼镜”，透过它来读写存储在 `ArrayBuffer` 中的字节。

例如：

*   **`Uint8Array`** —— 将 `ArrayBuffer` 中的每个字节视为 0 到 255 之间的单个数字（每个字节是 8 位，2 的 8 次方是 256，因此只能容纳那么多）。这称为 “8 位无符号整数”。
    
*   **`Uint16Array`** —— 将每 2 个字节视为一个 0 到 65535 之间的整数。这称为 “16 位无符号整数”。
    
*   **`Uint32Array`** —— 将每 4 个字节视为一个 0 到 4294967295 之间的整数。这称为 “32 位无符号整数”。
    
*   **`Float64Array`** —— 将每 8 个字节视为一个 `5.0x10-324` 到 `1.8x10308` 之间的浮点数。
    

因此，一个 16 字节 ArrayBuffer 中的二进制数据可以解释为 16 个 “小数字”，或 8 个更大的数字（每个数字 2 个字节），或 4 个更大的数字（每个数字 4 个字节），或 2 个高精度的浮点数（每个数字 8 个字节）。

### 使用视图操作二进制数据

`ArrayBuffer` 是原始的二进制数据。

但是，如果我们要操作它，我们必须使用视图（view），例如：

```
let buffer = new ArrayBuffer(16); // 创建一个长度为 16 的 bufferlet view = new Uint32Array(buffer); // 将 buffer 视为一个 32 位整数的序列console.log(Uint32Array.BYTES_PER_ELEMENT); // 每个整数 4 个字节console.log(view.length); // 4，它存储了 4 个整数console.log(view.byteLength); // 16，字节中的大小// 让我们写入一个值view[0] = 123456;// 遍历值for(let num of view) {  console.log(num); // 123456，然后 0，0，0（一共 4 个值）}
```

TypedArray
----------

所有这些视图（`Uint8Array`，`Uint32Array` 等）的通用术语是 TypedArray。它们共享同一方法和属性集。

请注意，没有名为 `TypedArray` 的构造器，它只是表示 `ArrayBuffer` 上的视图的通用总称术语，包`Int8Array`，`Uint8Array` 等

当你看到 `new TypedArray` 之类的内容时，它表示 `new Int8Array`、`new Uint8Array` 等。

TypedArray 的行为类似于常规数组：具有索引，并且是可迭代的。

一个 TypedArray 的构造器（无论是 `Int8Array` 或 `Float64Array`），其行为各不相同，并且取决于参数类型。

参数有 5 种变体：

```
new TypedArray(buffer, [byteOffset], [length]);
new TypedArray(object);
new TypedArray(typedArray);
new TypedArray(length);
new TypedArray();`
```

0.  如果给定的是 `ArrayBuffer` 参数，则会在其上创建视图。前面我们已经用过该语法了。
    

*   **`buffer`** —— 底层的 `ArrayBuffer`。
    
*   **`byteOffset`** —— 视图的起始字节位置（默认为 0）也就是要暴露的第一个字节的索引。
    
*   **`byteLength`** —— 视图的字节长度（默认至 `buffer` 的末尾）要暴露的字节数。**默认值:** `arrayBuffer.byteLength - byteOffset`。
    

2.  如果给定的是 `Array`或任何类数组对象，则会创建一个相同长度的类型化数组，并复制其内容。
    
    我们可以使用它来预填充数组的数据：
    
    ```
    let arr = new Uint8Array([0, 1, 2, 3]);console.log( arr.length ); // 4，创建了相同长度的二进制数组console.log( arr[1] ); // 1，用给定值填充了 4 个字节（无符号 8 位整数）`
    ```
    
3.  如果给定的是另一个 `TypedArray`，也是如此：创建一个相同长度的类型化数组，并复制其内容。如果需要的话，数据在此过程中会被转换为新的类型。
    
    ```
    let arr16 = new Uint16Array([1, 1000]); let arr8 = new Uint8Array(arr16); console.log( arr8[0] ); // 1 console.log( arr8[1] ); // 232，试图复制 1000，但无法将 1000 放进 8 位字节中（详述见下文）。
    ```
    
4.  对于数字参数 `length` —— 创建类型化数组以包含这么多元素。它的字节长度将是 `length` 乘以单个 `TypedArray.BYTES_PER_ELEMENT` 中的字节数：
    
    `let arr = new Uint16Array(4); // 为 4 个整数创建类型化数组 console.log( Uint16Array.BYTES_PER_ELEMENT ); // 每个整数 2 个字节 console.log( arr.byteLength ); // 8（字节中的大小）`
    
5.  不带参数的情况下，创建长度为零的类型化数组。
    

我们可以直接创建一个 `TypedArray`，而无需提及 `ArrayBuffer`。但是，视图离不开底层的 `ArrayBuffer`，因此，除第一种情况（已提供 `ArrayBuffer`）外，其他所有情况都会自动创建 `ArrayBuffer`。

如要访问底层的 `ArrayBuffer`，那么在 `TypedArray` 中有如下的属性：

*   `arr.buffer` —— 引用 `ArrayBuffer`。
    
*   `arr.byteLength` —— `ArrayBuffer` 的长度。
    

因此，我们总是可以从一个视图转到另一个视图：

```
let arr8 = new Uint8Array([0, 1, 2, 3]);// 同一数据的另一个视图let arr16 = new Uint16Array(arr8.buffer);
```

下面是类型化数组的列表：

*   `Uint8Array`，`Uint16Array`，`Uint32Array` —— 用于 8、16 和 32 位的整数。
    
*   `Uint8ClampedArray` —— 用于 8 位整数，在赋值时便 “固定 “其值（见下文）。
    
*   `Int8Array`，`Int16Array`，`Int32Array` —— 用于有符号整数（可以为负数）。
    
*   `Float32Array`，`Float64Array` —— 用于 32 位和 64 位的有符号浮点数。
    

### 越界行为

如果我们尝试将越界值写入类型化数组会出现什么情况？不会报错。但是多余的位被切除。

例如，我们尝试将 256 放入 `Uint8Array`。256 的二进制格式是 `100000000`（9 位），但 `Uint8Array` 每个值只有 8 位，因此可用范围为 0 到 255。

对于更大的数字，仅存储最右边的（低位有效）8 位，其余部分被切除：

因此结果是 0。

257 的二进制格式是 `100000001`（9 位），最右边的 8 位会被存储，因此数组中会有 `1`：

换句话说，该数字对 28 取模的结果被保存了下来。示例如下

```
let uint8array = new Uint8Array(16);let num = 256;alert(num.toString(2)); // 100000000（二进制表示）uint8array[0] = 256;uint8array[1] = 257;console.log(uint8array[0]); // 0console.log(uint8array[1]); // 1
```

`Uint8ClampedArray` 在这方面比较特殊，它的表现不太一样。对于大于 255 的任何数字，它将保存为 255，对于任何负数，它将保存为 0。此行为对于图像处理很有用。

DataView
--------

**`DataView`** 视图是一个可以从`ArrayBuffer`对象中读写多种数值类型的底层接口，在读写时不用考虑平台字节序问题。

*   对于类型化的数组，构造器决定了其格式。整个数组应该是统一的。第 i 个数字是 `arr[i]`。
    
*   通过 `DataView`，我们可以使用 `.getUint8(i)` 或 `.getUint16(i)` 之类的方法访问数据。我们在调用方法时选择格式，而不是在构造的时候。
    

语法：

```
new DataView(buffer, [byteOffset], [byteLength])
```

*   **`buffer`** —— 底层的 `ArrayBuffer`。与类型化数组不同，`DataView` 不会自行创建缓冲区（buffer）。我们需要事先准备好。
    
*   **`byteOffset`** —— 视图的起始字节位置（默认为 0）也就是要暴露的第一个字节的索引。
    
*   **`byteLength`** —— 视图的字节长度（默认至 `buffer` 的末尾）要暴露的字节数。**默认值:** `arrayBuffer.byteLength - byteOffset`。
    

例如，这里我们从同一个 buffer 中提取不同格式的数字：

```
// 4 个字节的二进制数组，每个都是最大值 255let buffer = new Uint8Array([1, 2, 3, 4]).buffer;let dataView = new DataView(buffer);// 在偏移量为 0 处获取 8 位数字alert( dataView.getUint8(0) ); // 1// 现在在偏移量为 0 处获取 16 位数字，它由 2 个字节组成，一起解析为 65535alert( dataView.getUint16(0) ); // 258（最大的 16 位无符号整数）// 在偏移量为 0 处获取 32 位数字alert( dataView.getUint32(0) ); // 16909060（最大的 32 位无符号整数）dataView.setUint32(0, 0); // 将 4 个字节的数字设为 0，即将所有字节都设为 0
```

当我们将混合格式的数据存储在同一缓冲区（buffer）中时，`DataView` 非常有用。例如，当我们存储一个成对序列（16 位整数，32 位浮点数）时，用 `DataView` 可以轻松访问它们。

2. 总结
-----

`ArrayBuffer` 是核心对象，是对固定长度的连续内存区域的引用。

几乎任何对 `ArrayBuffer` 的操作，都需要一个视图。

0.  它可以是 `TypedArray`：
    

*   `Uint8Array`，`Uint16Array`，`Uint32Array` —— 用于 8 位、16 位和 32 位无符号整数。
    
*   `Int8Array`，`Int16Array`，`Int32Array` —— 用于有符号整数（可以为负数）。
    
*   `Float32Array`，`Float64Array` —— 用于 32 位和 64 位的有符号浮点数。
    

2.  `DataView` —— 使用方法来指定格式的视图，例如，`getUint8(offset)`。
    

在大多数情况下，我们直接对类型化数组进行创建和操作，而将 `ArrayBuffer` 作为 “共同之处（common denominator）” 隐藏起来。我们可以通过 `.buffer` 来访问它，并在需要时创建另一个视图。

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)