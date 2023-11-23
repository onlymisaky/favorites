> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CUimLvIZbQ-O7h0nEaX9vg)

实现的结果
-----

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9MK81RbPHhG0LFSWNokscWGibvMtNLc1o3vzMhF6yn1jAibJJBJwU2qokltcaBAibcsUQfE9sHTJicXQ/640?wx_fmt=png)

如何实现
----

网上有很多实现 TS 加法的奇淫技巧，但是都有很多限制，没法实现太大的数字计算，如何实现一种高效的大数加法呢？

### String -> Number[]

```
type DigitRangeMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];type Digit = DigitRangeMap[number];type ToDigit<T extends string> =  T extends keyof DigitRangeMap    ? DigitRangeMap[T]    : never;type ToDigitList<T, R extends any[] = []>  =  T extends `${infer First}${infer Rest}`    ? ToDigitList<Rest, [ToDigit<First>, ...R]>    : R;// debugtype test = ToDigitList<"1234">; // [4, 3, 2, 1]
```

首先我会把 String 转为 Number 数组，ToDigitList 就是做这个事的，考虑到后面方便逐位相加，所以结果处理成倒序。

### 一位数相加

```
type AdditionMap = [  [0,1,2,3,4,5,6,7,8,9],  [1,2,3,4,5,6,7,8,9,10],  [2,3,4,5,6,7,8,9,10,11],  [3,4,5,6,7,8,9,10,11,12],  [4,5,6,7,8,9,10,11,12,13],  [5,6,7,8,9,10,11,12,13,14],  [6,7,8,9,10,11,12,13,14,15],  [7,8,9,10,11,12,13,14,15,16],  [8,9,10,11,12,13,14,15,16,17],  [9,10,11,12,13,14,15,16,17,18]];type AddOneDigit<A extends Digit, B extends Digit> = AdditionMap[A][B];// debugtype test = AddOneDigit<9,8>; // 17
```

一位数相加，总共也就只有 100 种情况，为了提高性能，我选择了打表。因为 AdditionMap[x][y] == AdditionMap[y][x]，所以再给 A, B 再排一下序，使 A > B，那么表的体积还能再缩小一半。

### 处理进位

```
type RoundMap = {  10:0; 11:1; 12:2; 13:3; 14:4; 15:5; 16:6; 17:7; 18:8; 19:9};type Carry<T extends number, R extends number[] = []> =  T extends keyof RoundMap    ? [1, [RoundMap[T], ...R]]    : [0, [T, ...R]];// debugtype test = Carry<15, [3, 2, 1]>; // [1, [5, 3, 2, 1]]
```

Carry 的第一个参数 T 是上一步一位数加法 AddOneDigit 返回的结果，结果范围 0 ~ 19，为什么不是 0 ~ 18 呢？因为还可能有进位 1。因为情况较少，所以还是使用打表计算。第二个参数 R 是前面 N 位计算的结果，类型是 Digit[]。

返回的结果是一个 Array，第一个值是进位 0 | 1，第二个值是新增了一位后的结果，类型是 Digit []。

### 多位数相加

```
type IncMap = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];type Shift<T extends any[]> =  T extends [infer First, ...infer Rest]    ? Rest    : never;type AddDigitList<  A extends any[],  B extends any[],  ACC extends [0|1, number[]] = [0, []]> =  A['length'] extends 0    ? B['length'] extends 0      // A为空, B为空      ? ACC[0] extends 1 ? AddDigitList<[1], [], [0, ACC[1]]> : ACC[1]      // A为空, B非空      : AddDigitList<A, Shift<B>, Carry<AddOneDigit<B[0], ACC[0]>, ACC[1]>>    : B['length'] extends 0       // A非空, B为空      ? AddDigitList<Shift<A>, B, Carry<AddOneDigit<A[0], ACC[0]>, ACC[1]>>       // A非空, B非空      : AddDigitList<          Shift<A>, Shift<B>, Carry<            ACC[0] extends 0              ? AddOneDigit<A[0], B[0]>              : IncMap[AddOneDigit<A[0], B[0]>],            ACC[1]          >        >;// debugtype test = AddDigitList<[2,5], [1,5]>; // [1,0,3]
```

重点来了，AddDigitList 接受两个 Digit[] 类型，返回同样是 Digit[] 类型加法的结果。我用参数 ACC 承载上一步 Carry 的返回作为累加的结果，我用伪代码描述一下这部分逻辑：

```
function fn(a: number[], b: number[], acc = [0, []]) {  if (a.length === 0) {    if (b.length === 0) {      return acc[0] == 1        ? fn([1], [], [0, acc[1]])        : acc[1];    } else {      return fn(        a, b.slice(1),        carry(add(b[0], acc[0]), acc[0])      )    }  } else {    if (b.length === 0) {      return fn(        a.slice(1), b,        carry(add(a[0], acc[0]), acc[0])      )    } else {      return fn(        a.slice(1), b.slice(1),        carry(add(add(a[0], b[0]), acc[0]), acc[0])      )    }  }}
```

### Number[] -> String

```
type StrDigitRangeMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];type DigitListToString<T extends any[], R extends string = ''> =  T extends [infer First, ...infer Rest]    ? DigitListToString<        Rest,        `${R}${First extends number ? StrDigitRangeMap[First] : 'n' }`      >    : R;type Add<A extends string, B extends string> =  DigitListToString<AddDigitList<ToDigitList<A>, ToDigitList<B>>>;// debugtype result = Add<  "1248859103109591728912488591031095917289",  "32481239839485789343248123983948578934">;
```

最后的处理，将 Digit[] 转为 String，看到结果顺滑的显示在我的 VSCode 提示框中，我不禁

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9MK81RbPHhG0LFSWNokscWUPbwOqK2ibicPdfEgz6EjrNhz1Aw76ubIxDhlBlZ0EbtAkKrWabzgaiaQ/640?wx_fmt=png)

最后贴上完整代码
--------

```
type DigitRangeMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];type StrDigitRangeMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];type RoundMap = { 10:0; 11:1; 12:2; 13:3; 14:4; 15:5; 16:6; 17:7; 18:8; 19:9 };type AdditionMap = [  [0,1,2,3,4,5,6,7,8,9],  [1,2,3,4,5,6,7,8,9,10],  [2,3,4,5,6,7,8,9,10,11],  [3,4,5,6,7,8,9,10,11,12],  [4,5,6,7,8,9,10,11,12,13],  [5,6,7,8,9,10,11,12,13,14],  [6,7,8,9,10,11,12,13,14,15],  [7,8,9,10,11,12,13,14,15,16],  [8,9,10,11,12,13,14,15,16,17],  [9,10,11,12,13,14,15,16,17,18]];type IncMap = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];type Digit = DigitRangeMap[number];type ToDigit<T extends string> =  T extends keyof DigitRangeMap    ? DigitRangeMap[T]    : never;type ToDigitList<T, R extends any[] = []>  =  T extends `${infer First}${infer Rest}`    ? ToDigitList<Rest, [ToDigit<First>, ...R]>    : R;type Shift<T extends any[]> =  T extends [infer First, ...infer Rest]    ? Rest    : never;type Carry<T extends number, R extends number[] = []> =  T extends keyof RoundMap    ? [1, [RoundMap[T], ...R]]    : [0, [T, ...R]];type AddOneDigit<A extends Digit, B extends Digit> = AdditionMap[A][B];type AddDigitList<  A extends any[],  B extends any[],  ACC extends [0|1, number[]] = [0, []]> =  A['length'] extends 0    ? B['length'] extends 0      ? ACC[0] extends 1 ? AddDigitList<[1], [], [0, ACC[1]]> : ACC[1]      : AddDigitList<A, Shift<B>, Carry<AddOneDigit<B[0], ACC[0]>, ACC[1]>>    : B['length'] extends 0      ? AddDigitList<Shift<A>, B, Carry<AddOneDigit<A[0], ACC[0]>, ACC[1]>>      : AddDigitList<          Shift<A>, Shift<B>, Carry<            ACC[0] extends 0              ? AddOneDigit<A[0], B[0]>              : IncMap[AddOneDigit<A[0], B[0]>],            ACC[1]          >        >;type DigitListToString<T extends any[], R extends string = ''> =  T extends [infer First, ...infer Rest]    ? DigitListToString<        Rest,        `${R}${First extends number ? StrDigitRangeMap[First] : 'n' }`      >    : R;type Add<A extends string, B extends string> =  DigitListToString<AddDigitList<ToDigitList<A>, ToDigitList<B>>>;
```

![](https://mmbiz.qpic.cn/mmbiz_gif/5Q3ZxrD2qNAwfITg4YV29uSdjzeu5TianfNF4GxRloxGjYnDmsXeLeaiaxc3JplwWTTlaDU8tr50srgXqHe3Gr4Q/640?wx_fmt=gif)

**彦祖，点个****「在看」**吧