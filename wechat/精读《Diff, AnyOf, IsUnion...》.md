> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/11B6kLuz9TxykGU6_Hh8ug)

解决 TS 问题的最好办法就是多练，这次解读 type-challenges Medium 难度 25~32 题。

精读
--

### Diff

实现 `Diff<A, B>`，返回一个新对象，类型为两个对象类型的 Diff：

```
type Foo = {  name: string  age: string}type Bar = {  name: string  age: string  gender: number}Equal<Diff<Foo, Bar> // { gender: number }
```

首先要思考 Diff 的计算方式，A 与 B 的 Diff 是找到 A 存在 B 不存在，与 B 存在 A 不存在的值，那么正好可以利用 `Exclude<X, Y>` 函数，它可以得到存在于 `X` 不存在于 `Y` 的值，我们只要用 `keyof A`、`keyof B` 代替 `X` 与 `Y`，并交替 A、B 位置就能得到 Diff：

```
// 本题答案type Diff<A, B> = {  [K in Exclude<keyof A, keyof B> | Exclude<keyof B, keyof A>]:    K extends keyof A ? A[K] : (      K extends keyof B ? B[K]: never    )}
```

Value 部分的小技巧我们之前也提到过，即需要用两套三元运算符保证访问的下标在对象中存在，即 `extends keyof` 的语法技巧。

### AnyOf

实现 `AnyOf` 函数，任意项为真则返回 `true`，否则返回 `false`，空数组返回 `false`：

```
type Sample1 = AnyOf<[1, '', false, [], {}]> // expected to be true.type Sample2 = AnyOf<[0, '', false, [], {}]> // expected to be false.
```

本题有几个问题要思考：

第一是用何种判定思路？像这种判断数组内任意元素是否满足某个条件的题目，都可以用递归的方式解决，具体是先判断数组第一项，如果满足则继续递归判断剩余项，否则终止判断。这样能做但比较麻烦，还有种取巧的办法是利用 `extends Array<>` 的方式，让 TS 自动帮你遍历。

第二个是如何判断任意项为真？为真的情况很多，我们尝试枚举为假的 Case：`0` `undefined` `''` `undefined` `null` `never` `[]`。

结合上面两个思考，本题作如下解答不难想到：

```
type Falsy = '' | never | undefined | null | 0 | false | []type AnyOf<T extends readonly any[]> = T extends Falsy[] ? false : true
```

但会遇到这个测试用例没通过：

```
AnyOf<[0, '', false, [], {}]>
```

如果此时把 `{}` 补在 `Falsy` 里，会发现除了这个 case 外，其他判断都挂了，原因是 `{ a: 1 } extends {}` 结果为真，因为 `{}` 并不表示空对象，而是表示所有对象类型，所以我们要把它换成 `Record<PropertyKey, never>`，以锁定空对象：

```
// 本题答案type Falsy = '' | never | undefined | null | 0 | false | [] | Record<PropertyKey, never>type AnyOf<T extends readonly any[]> = T extends Falsy[] ? false : true
```

### IsNever

实现 `IsNever` 判断值类型是否为 `never`：

```
type A = IsNever<never>  // expected to be truetype B = IsNever<undefined> // expected to be falsetype C = IsNever<null> // expected to be falsetype D = IsNever<[]> // expected to be falsetype E = IsNever<number> // expected to be false
```

首先我们可以毫不犹豫的写下一个错误答案：

```
type IsNever<T> = T extends never ? true :false
```

这个错误答案离正确答案肯定是比较近的，但错在无法判断 `never` 上。在 `Permutation` 全排列题中我们就认识到了 `never` 在泛型中的特殊性，它不会触发 `extends` 判断，而是直接终结，致使判断无效。

而解法也很简单，只要绕过 `never` 这个特性即可，包一个数组：

```
// 本题答案type IsNever<T> = [T] extends [never] ? true :false
```

### IsUnion

实现 `IsUnion` 判断是否为联合类型：

```
type case1 = IsUnion<string>  // falsetype case2 = IsUnion<string|number>  // truetype case3 = IsUnion<[string|number]>  // false
```

这道题完全是脑筋急转弯了，因为 TS 肯定知道传入类型是否为联合类型，并且会对联合类型进行特殊处理，但并没有暴露联合类型的判断语法，所以我们只能对传入类型进行测试，推断是否为联合类型。

我们到现在能想到联合类型的特征只有两个：

1.  在 TS 处理泛型为联合类型时进行分发处理，即将联合类型拆解为独立项一一进行判定，最后再用 `|` 连接。
    
2.  用 `[]` 包裹联合类型可以规避分发的特性。
    

所以怎么判定传入泛型是联合类型呢？如果泛型进行了分发，就可以反推出它是联合类型。

难点就转移到了：如何判断泛型被分发了？首先分析一下，分发的效果是什么样：

```
A extends A// 如果 A 是 1 | 2，分发结果是：(1 extends 1 | 2) | (2 extends 1 | 2)
```

也就是这个表达式会被执行两次，第一个 `A` 在两次值分别为 `1` 与 `2`，而第二个 `A` 在两次执行中每次都是 `1 | 2`，但这两个表达式都是 `true`，无法体现分发的特殊性。

此时要利用包裹 `[]` 不分发的特性，即在分发后，由于在每次执行过程中，第一个 `A` 都是联合类型的某一项，因此用 `[]` 包裹后必然与原始值不相等，所以我们在 `extends` 分发过程中，再用 `[]` 包裹 `extends` 一次，如果此时匹配不上，说明产生了分发：

```
type IsUnion<A> = A extends A ? (  [A] extends [A] ? false : true) : false
```

但这段代码依然不正确，因为在第一个三元表达式括号内，`A` 已经被分发，所以 `[A] extends [A]` 即便对联合类型也是判定为真的，此时需要用原始值代替 `extends` 后面的 `[A]`，骚操作出现了：

```
type IsUnion<A, B = A> = A extends A ? (  [B] extends [A] ? false : true) : false
```

虽然我们申明了 `B = A`，但过程中因为 `A` 被分发了，所以运行时 `B` 是不等于 `A` 的，才使得我们达成目的。`[B]` 放 `extends` 前面是因为，`B` 是未被分发的，不可能被分发后的结果包含，所以分发时此条件必定为假。

最后因为测试用例有一个 `never` 情况，我们用刚才的 `IsNever` 函数提前判否即可：

```
// 本题答案type IsUnion<A, B = A> = IsNever<A> extends true ? false : (  A extends A ? (    [B] extends [A] ? false : true  ) : false)
```

从该题我们可以深刻体会到 TS 的怪异之处，即 `type X<T> = T extends ...` 中 `extends` 前面的 `T` 不一定是你看到传入的 `T`，如果是联合类型的话，会分发为单个类型分别处理。

### ReplaceKeys

实现 `ReplaceKeys<Obj, Keys, Targets>` 将 `Obj` 中每个对象的 `Keys` Key 类型转化为符合 `Targets` 对象对应 Key 描述的类型，如果无法匹配到 `Targets` 则类型置为 `never`：

```
type NodeA = {  type: 'A'  name: string  flag: number}type NodeB = {  type: 'B'  id: number  flag: number}type NodeC = {  type: 'C'  name: string  flag: number}type Nodes = NodeA | NodeB | NodeCtype ReplacedNodes = ReplaceKeys<Nodes, 'name' | 'flag', {name: number, flag: string}> // {type: 'A', name: number, flag: string} | {type: 'B', id: number, flag: string} | {type: 'C', name: number, flag: string} // would replace name from string to number, replace flag from number to string.type ReplacedNotExistKeys = ReplaceKeys<Nodes, 'name', {aa: number}> // {type: 'A', name: never, flag: number} | NodeB | {type: 'C', name: never, flag: number} // would replace name to never
```

本题别看描述很吓人，其实非常简单，思路：用 `K in keyof Obj` 遍历原始对象所有 Key，如果这个 Key 在描述的 `Keys` 中，且又在 `Targets` 中存在，则返回类型 `Targets[K]` 否则返回 `never`，如果不在描述的 `Keys` 中则用在对象里本来的类型：

```
// 本题答案type ReplaceKeys<Obj, Keys, Targets> = {  [K in keyof Obj] : K extends Keys ? (    K extends keyof Targets ? Targets[K] : never  ) : Obj[K]}
```

### Remove Index Signature

实现 `RemoveIndexSignature<T>` 把对象 `<T>` 中 Index 下标移除：

```
type Foo = {  [key: string]: any;  foo(): void;}type A = RemoveIndexSignature<Foo>  // expected { foo(): void }
```

该题思考的重点是如何将对象字符串 Key 识别出来，可以用 `${infer P}` 是否能识别到 `P` 来判断当前是否命中了字符串 Key：

```
// 本题答案type RemoveIndexSignature<T> = {  [K in keyof T as K extends `${infer P}` ? P : never]: T[K]}
```

### Percentage Parser

实现 `PercentageParser<T>`，解析出百分比字符串的符号位与数字：

```
type PString1 = ''type PString2 = '+85%'type PString3 = '-85%'type PString4 = '85%'type PString5 = '85'type R1 = PercentageParser<PString1> // expected ['', '', '']type R2 = PercentageParser<PString2> // expected ["+", "85", "%"]type R3 = PercentageParser<PString3> // expected ["-", "85", "%"]type R4 = PercentageParser<PString4> // expected ["", "85", "%"]type R5 = PercentageParser<PString5> // expected ["", "85", ""]
```

这道题充分说明了 TS 没有正则能力，尽量还是不要做正则的事情 ^_^。

回到正题，如果非要用 TS 实现，我们只能枚举各种场景：

```
// 本题答案type PercentageParser<A extends string> =   // +/-xxx%  A extends `${infer X extends '+' | '-'}${infer Y}%`? [X, Y, '%'] : (    // +/-xxx    A extends `${infer X extends '+' | '-'}${infer Y}` ? [X, Y, ''] : (      // xxx%      A extends `${infer X}%` ? ['', X, '%'] : (        // xxx 包括 ['100', '%', ''] 这三种情况        A extends `${infer X}` ? ['', X, '']: never      )    )  )
```

这道题运用了 `infer` 可以无限进行分支判断的知识。

### Drop Char

实现 `DropChar` 从字符串中移除指定字符：

```
type Butterfly = DropChar<' b u t t e r f l y ! ', ' '> // 'butterfly!'
```

这道题和 `Replace` 很像，只要用递归不断把 `C` 排除掉即可：

```
// 本题答案type DropChar<S, C extends string> = S extends `${infer A}${C}${infer B}` ?   `${A}${DropChar<B, C>}` : S
```

总结
--

写到这，越发觉得 TS 虽然具备图灵完备性，但在逻辑处理上还是不如 JS 方便，很多设计计算逻辑的题目的解法都不是很优雅。

但是解决这类题目有助于强化对 TS 基础能力组合的理解与综合运用，在解决实际类型问题时又是必不可少的。

> 讨论地址是：精读《Diff, AnyOf, IsUnion...》· Issue #429 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

![](https://mmbiz.qpic.cn/mmbiz_jpg/x0iannhWUodkRbb4Pum3vviamW0haFCWhjgNk2amIibLOtaxc6qyPymj7tz6N9gDb2k3iag0Dzp9Q4Biaue4t8Yz8zw/640?wx_fmt=jpeg)

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）