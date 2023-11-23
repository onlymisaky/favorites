> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/VXe_eE0fsnl7mxbrQnjd2A)

解决 TS 问题的最好办法就是多练，这次解读 type-challenges Medium 难度 41~48 题。

精读
--

### ObjectEntries

实现 TS 版本的 `Object.entries`：

```
interface Model {  name: string;  age: number;  locations: string[] | null;}type modelEntries = ObjectEntries<Model> // ['name', string] | ['age', number] | ['locations', string[] | null];
```

经过前面的铺垫，大家应该熟悉了 TS 思维思考问题，这道题看到后第一个念头应该是：如何先把对象转换为联合类型？这个问题不解决，就无从下手。

对象或数组转联合类型的思路都是类似的，一个数组转联合类型用 `[number]` 作为下标：

```
['1', '2', '3']['number'] // '1' | '2' | '3'
```

对象的方式则是 `[keyof T]` 作为下标：

```
type ObjectToUnion<T> = T[keyof T]
```

再观察这道题，联合类型每一项都是数组，分别是 Key 与 Value，这样就比较好写了，我们只要构造一个 Value 是符合结构的对象即可：

```
type ObjectEntries<T> = {  [K in keyof T]: [K, T[K]]}[keyof T]
```

为了通过单测 `ObjectEntries<{ key?: undefined }>`，让 Key 位置不出现 `undefined`，需要强制把对象描述为非可选 Key：

```
type ObjectEntries<T> = {  [K in keyof T]-?: [K, T[K]]}[keyof T]
```

为了通过单测 `ObjectEntries<Partial<Model>>`，得将 Value 中 `undefined` 移除：

```
// 本题答案type RemoveUndefined<T> = [T] extends [undefined] ? T : Exclude<T, undefined>type ObjectEntries<T> = {  [K in keyof T]-?: [K, RemoveUndefined<T[K]>]}[keyof T]
```

### Shift

实现 TS 版 `Array.shift`：

```
type Result = Shift<[3, 2, 1]> // [2, 1]
```

这道题应该是简单难度的，只要把第一项抛弃即可，利用 `infer` 轻松实现：

```
// 本题答案type Shift<T> = T extends [infer First, ...infer Rest] ? Rest : never
```

### Tuple to Nested Object

实现 `TupleToNestedObject<T, P>`，其中 `T` 仅接收字符串数组，`P` 是任意类型，生成一个递归对象结构，满足如下结果：

```
type a = TupleToNestedObject<['a'], string> // {a: string}type b = TupleToNestedObject<['a', 'b'], number> // {a: {b: number}}type c = TupleToNestedObject<[], boolean> // boolean. if the tuple is empty, just return the U type
```

这道题用到了 5 个知识点：递归、辅助类型、`infer`、如何指定对象 Key、`PropertyKey`，你得全部知道并组合起来才能解决该题。

首先因为返回值是个递归对象，递归过程中必定不断修改它，因此给泛型添加第三个参数 `R` 存储这个对象，并且在递归数组时从最后一个开始，这样从最内层对象开始一点点把它 “包起来”：

```
type TupleToNestedObject<T, U, R = U> = /** 伪代码  T extends [...infer Rest, infer Last]*/
```

下一步是如何描述一个对象 Key？之前 `Chainable Options` 例子我们学到的 `K in Q`，但需要注意直接这么写会报错，因为必须申明 `Q extends PropertyKey`。最后再处理一下递归结束条件，即 `T` 变成空数组时直接返回 `R`：

```
// 本题答案type TupleToNestedObject<T, U, R = U> = T extends [] ? R : (  T extends [...infer Rest, infer Last extends PropertyKey] ? (    TupleToNestedObject<Rest, U, {      [P in Last]: R    }>  ) : never)
```

### Reverse

实现 TS 版 `Array.reverse`：

```
type a = Reverse<['a', 'b']> // ['b', 'a']type b = Reverse<['a', 'b', 'c']> // ['c', 'b', 'a']
```

这道题比上一题简单，只需要用一个递归即可：

```
// 本题答案type Reverse<T extends any[]> = T extends [...infer Rest, infer End] ? [End, ...Reverse<Rest>] : T
```

### Flip Arguments

实现 `FlipArguments<T>` 将函数 `T` 的参数反转：

```
type Flipped = FlipArguments<(arg0: string, arg1: number, arg2: boolean) => void> // (arg0: boolean, arg1: number, arg2: string) => void
```

本题与上题类似，只是反转内容从数组变成了函数的参数，只要用 `infer` 定义出函数的参数，利用 `Reverse` 函数反转一下即可：

```
// 本题答案type Reverse<T extends any[]> = T extends [...infer Rest, infer End] ? [End, ...Reverse<Rest>] : Ttype FlipArguments<T> =  T extends (...args: infer Args) => infer Result ? (...args: Reverse<Args>) => Result : never
```

### FlattenDepth

实现指定深度的 Flatten：

```
type a = FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2> // [1, 2, 3, 4, [5]]. flattern 2 timestype b = FlattenDepth<[1, 2, [3, 4], [[[5]]]]> // [1, 2, 3, 4, [[5]]]. Depth defaults to be 1
```

这道题比之前的 `Flatten` 更棘手一些，因为需要控制打平的次数。

基本想法就是，打平 `Deep` 次，所以需要实现打平一次的函数，再根据 `Deep` 值递归对应次：

```
type FlattenOnce<T extends any[], U extends any[] = []> = T extends [infer X, ...infer Y] ? (  X extends any[] ? FlattenOnce<Y, [...U, ...X]> : FlattenOnce<Y, [...U, X]>) : U
```

然后再实现主函数 `FlattenDepth`，因为 TS 无法实现 +、- 号运算，我们必须用数组长度判断与操作数组来辅助实现：

```
// FlattenOncetype FlattenDepth<  T extends any[],  U extends number = 1,  P extends any[] = []> = P['length'] extends U ? T : (  FlattenDepth<FlattenOnce<T>, U, [...P, any]>)
```

当递归没有达到深度 `U` 时，就用 `[...P, any]` 的方式给数组塞一个元素，下次如果能匹配上 `P['length'] extends U` 说明递归深度已达到。

但考虑到测试用例 `FlattenDepth<[1, [2, [3, [4, [5]]]]], 19260817>` 会引发超长次数递归，需要提前终止，即如果打平后已经是平的，就不用再继续递归了，此时可以用 `FlattenOnce<T> extends T` 判断：

```
// 本题答案// FlattenOncetype FlattenDepth<  T extends any[],  U extends number = 1,  P extends any[] = []> = P['length'] extends U ? T : (  FlattenOnce<T> extends T ? T : (    FlattenDepth<FlattenOnce<T>, U, [...P, any]>  ))
```

### BEM style string

实现 `BEM` 函数完成其规则拼接：

```
Expect<Equal<BEM<'btn', [], ['small', 'medium', 'large']>, 'btn--small' | 'btn--medium' | 'btn--large' >>,
```

之前我们了解了通过下标将数组或对象转成联合类型，这里还有一个特殊情况，即字符串中通过这种方式申明每一项，会自动笛卡尔积为新的联合类型：

```
type BEM<B extends string, E extends string[], M extends string[]> =   `${B}__${E[number]}--${M[number]}`
```

这是最简单的写法，但没有考虑项不存在的情况。不如创建一个 `SafeUnion` 函数，当传入值不存在时返回空字符串，保证安全的跳过：

```
type IsNever<TValue> = TValue[] extends never[] ? true : false;type SafeUnion<TUnion> = IsNever<TUnion> extends true ? "" : TUnion;
```

最终代码：

```
// 本题答案// IsNever, SafeUniontype BEM<B extends string, E extends string[], M extends string[]> =   `${B}${SafeUnion<`__${E[number]}`>}${SafeUnion<`--${M[number]}`>}`
```

### InorderTraversal

实现 TS 版二叉树中序遍历：

```
const tree1 = {  val: 1,  left: null,  right: {    val: 2,    left: {      val: 3,      left: null,      right: null,    },    right: null,  },} as consttype A = InorderTraversal<typeof tree1> // [1, 3, 2]
```

首先回忆一下二叉树中序遍历 JS 版的实现：

```
function inorderTraversal(tree) {  if (!tree) return []  return [    ...inorderTraversal(tree.left),    res.push(val),    ...inorderTraversal(tree.right)  ]}
```

对 TS 来说，实现递归的方式有一点点不同，即通过 `extends TreeNode` 来判定它不是 Null 从而递归：

```
// 本题答案interface TreeNode {  val: number  left: TreeNode | null  right: TreeNode | null}type InorderTraversal<T extends TreeNode | null> = [T] extends [TreeNode] ? (  [    ...InorderTraversal<T['left']>,    T['val'],    ...InorderTraversal<T['right']>  ] ): []
```

你可能会问，问什么不能像 JS 一样，用 `null` 做判断呢？

```
type InorderTraversal<T extends TreeNode | null> = [T] extends [null] ? [] : (  [ // error    ...InorderTraversal<T['left']>,    T['val'],    ...InorderTraversal<T['right']>  ] )
```

如果这么写会发现 TS 抛出了异常，因为 TS 不能确定 `T` 此时符合 `TreeNode` 类型，所以要执行操作时一般采用正向判断。

总结
--

这些类型挑战题目需要灵活组合 TS 的基础知识点才能破解，常用的包括：

*   如何操作对象，增减 Key、只读、合并为一个对象等。
    
*   递归，以及辅助类型。
    
*   `infer` 知识点。
    
*   联合类型，如何从对象或数组生成联合类型，字符串模板与联合类型的关系。
    

> 讨论地址是：精读《ObjectEntries, Shift, Reverse...》· Issue #431 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

![](https://mmbiz.qpic.cn/mmbiz_jpg/x0iannhWUodkhog6Uf0uY4ALZ0wkw8I5w1Mx6uF9zJSRNqRicafhatzpTRa5bOAqgffYM2Ria6NUv4sAxKR7zrGBg/640?wx_fmt=jpeg)

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）