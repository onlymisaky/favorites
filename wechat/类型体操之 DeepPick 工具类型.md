> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/XE98_4kTJh2l9V84DS2_nA)

### Challenge

在本次挑战中，你需要实现一个 `DeepPick` 工具类型，它扩展了 TypeScript 内置工具类型 `Pick` 的能力。

```
type Obj = {  a: number  b: string  c: boolean  obj: {    d: number    e: string    f: boolean    obj2: {      g: number      h: string      i: boolean    }  }  obj3: {    j: number    k: string    l: boolean  }}type DeepPick<T, K> = {}type cases = [  Expect<Equal<DeepPick<Obj, ''>, unknown>>,  Expect<Equal<DeepPick<Obj, 'a'>, { a: number }>>,  Expect<Equal<DeepPick<Obj, 'a' | 'b'>, { a: number } & { b: string }>>,  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e'>, { a: number } & { obj: { e: string } }>>,  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e' | 'obj.obj2.i'>,    { a: number } & { obj: { e: string } } & { obj: { obj2: { i: boolean } } }>>,]
```

在以上代码中，我们用到了 `Expect` 和 `Equal` 这两个工具类型，它们的实现代码如下：

```
type Expect<T extends true> = Ttype Equal<X, Y> =  (<T>() => T extends X ? 1 : 2) extends  (<T>() => T extends Y ? 1 : 2) ? true : false
```

### Solution

在开始实现 `DeepPick` 工具类型前，我们先来简单回顾一下 TypeScript 内置的 `Pick` 工具类型。

```
type Pick<T, K extends keyof T> = {   [P in K]: T[P];}
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V0icianhDIH6zFpSqFzfu3Xk3z1xGbwlnb71GlXrc3DFqRZ7ZWRPe502fVP71pauqa8ZWcHneUVaD3Q/640?wx_fmt=jpeg&from=appmsg)

由上图可知，""和"email" 字符串字面量类型不满足 `keyof User` 约束，所以 TypeScript 编译器会提示相应的错误信息。此外，`Pick` 工具类型还支持传入字符串字面量类型组合成的联合类型，比如 "name" | "age"。

下面我们先来分析 `DeepPick` 工具类型的前三个测试用例：

```
type Obj = {  a: number  b: string  c: boolean  // ...}type DeepPick<T, K> = {}type cases = [  Expect<Equal<DeepPick<Obj, ''>, unknown>>,  Expect<Equal<DeepPick<Obj, 'a'>, { a: number }>>,  Expect<Equal<DeepPick<Obj, 'a' | 'b'>, { a: number } & { b: string }>>]
```

由以上测试用例可知，`DeepPick` 工具类型，不需要约束泛型变量 `K` 的类型。当传入 '' 字符串字面量类型时，只需返回 `unknown` 类型。而当传入的字符串字面量类型是 `keyof T` 类型的子类型时，则跟 `Pick` 工具类型的效果一样。所以，我们可以先实现一个简单的 `DeepPick` 来满足前面两个测试用例：

```
type DeepPick<T, K> = K extends keyof T ? Pick<T, K> : unknown
```

然而，第三个测试用例，需要生成 `{ a: number } & { b: string }` 交叉类型。但我们目前返回的是 `{ a: number } | { b: string }` 联合类型。

```
Pick<Obj, "a"> | Pick<Obj, "b">// { a: number } | { b: string }
```

那么如何把联合类型转换成交叉类型呢？这时我们需要用到 `UnionToIntersection` 工具类型。

```
type UnionToIntersection<U> =  (U extends any ? (k: U) => void : never) extends (    k: infer R,  ) => void  ? R  : nevertype DeepPick<T, K> = UnionToIntersection<K extends keyof T ? Pick<T, K> : unknown>
```

使用了 `UnionToIntersection` 工具类型之后，`DeepPick<Obj, 'a' | 'b'>` 表达式就会输出以下结果：

```
Pick<Obj, "a"> & Pick<Obj, "b">
```

目前，我们实现的 `DeepPick` 工具类型已经可以满足前面三个测试用例。接下来，我们来分析剩下的两个测试用例。

```
type Obj = {  a: number  obj: {    d: number    e: string    f: boolean    obj2: {      g: number      h: string      i: boolean    }  }  // ...}type cases = [  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e'>, { a: number } & { obj: { e: string } }>>,  Expect<Equal<DeepPick<Obj, 'a' | 'obj.e' | 'obj.obj2.i'>,    { a: number } & { obj: { e: string } } & { obj: { obj2: { i: boolean } } }>>,]
```

由以上的测试用例可知，我们的 `DeepPick` 工具类型需要支持 "obj.e" 或 "obj.obj2.i" 属性路径的形式。对于属性路径来说，我们需要提取每一层级的属性，然后判断该属性是否是当前层级对象的属性。要提取每一层的属性，我们就需要利用到 TypeScript [条件类型](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247499995&idx=1&sn=da2d91a35cfd2e8de26fece7aea7b8cf&chksm=ea446183dd33e89531e0b34e6f174691672ccfe70dfa5bcbfedc6a7e38fa108785f1288bd69b&scene=21#wechat_redirect)、[模板字面量类型](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247500186&idx=1&sn=a0b388dfdff36278b5944acc54c98836&chksm=ea4460c2dd33e9d442a4741fccbf08f8539ae5bed2691fa7ab1a0244405927d8b193595f3c44&scene=21#wechat_redirect)和 `infer` 类型推断。

```
type GetLastProperty<S extends string> = S extends `${infer U}.${infer R}` ? R : Stype P0 = GetLastProperty<"obj.e"> // "e"type P1= GetLastProperty<"obj.obj2.i"> // "obj2.i"
```

在以上代码中，`GetLastProperty` 工具类型用于获取属性路径的最后一级的属性名。但它还不能正确处理 "obj.obj2.i" 路径。要解决这个问题，我们需要用到 TypeScript 的递归类型。

```
type GetLastProperty<S extends string> = S extends `${infer U}.${infer R}` ? GetLastProperty<R> : Stype P0 = GetLastProperty<"obj.e"> // "e"type P1= GetLastProperty<"obj.obj2.i"> // "i"
```

现在我们已经知道如何处理 "obj.e" 或 "obj.obj2.i" 属性路径，接下来我们来更新 `DeepPick` 工具类型。

```
type DeepPick<T, K extends string> = UnionToIntersection<PickByPath<T, K>>type PickByPath<Obj, Path> =    Path extends keyof Obj    ? Pick<Obj, Path> :    Path extends `${infer Head}.${infer Tail}`    ? Head extends keyof Obj ? { [P in Head]: PickByPath<Obj[Head], Tail> } : unknown    : nevertype UnionToIntersection<U> =    (U extends any ? (k: U) => void : never) extends (        k: infer R,    ) => void    ? R    : never
```

为了让代码更清晰一些，我们定义了一个新的 `PickByPath` 工具类型。在该工具类型中，我们用到了前面介绍过的 TypeScript 条件类型、模板字面量类型、infer 类型推断和递归类型。