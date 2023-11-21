> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_sCJyRycojV6daZgOCk4uw)

Infer 关键字用于条件中的类型推导。

Typescript 官网也拿 `ReturnType` 这一经典例子说明它的作用：

```
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

理解为：如果 `T` 继承了 `extends (...args: any[]) => any` 类型，则返回类型 `R`，否则返回 `any`。其中 `R` 是什么呢？`R` 被定义在 `extends (...args: any[]) => infer R` 中，即 R 是从传入参数类型中推导出来的。

精读
--

我们可以从两个视角来理解 `infer`，分别是需求角度与设计角度。

### 需求角度理解 infer

实现 `infer` 这个关键字一定是背后存在需求，这个需求是普通 Typescript 能力无法满足的。

设想这样一个场景：实现一个函数，接收一个数组，返回第一项。

我们无法用泛型来描述这种类型推导，因为泛型类型是一个整体，而我们想要返回的是入参其中某一项，我们并不能通过类似 `T[0]` 的写法拿到第一项类型：

```
function xxx<T>(...args: T[]): T[0]
```

而实际上不支持这种写法也是合理的，因为这次是获取第一项类型，如果 `T` 是一个对象，我们想返回其中 `onChange` 这个 Key 的返回值类型，就不知道如何书写了。所以此时必须用一种新的语法实现，就是 `infer`。

### 设计角度理解 infer

从类型推导功能来看，泛型功能非常强大，我们可以用泛型描述调用时才传入的类型，并提前将它描述在类型表达式中：

```
function xxx<T>(value: T): { result: T }
```

但我们发现 `T` 这个泛型太整体化了，我们还不具备从中 Pick 子类型的能力。也就是对于 `xxx<{label: string}>` 这个场景，`T = {label: string}`，但我们无法将 `R` 定义为 `{label: R}` 这个位置，因为泛型是一个不可拆分的整体。

而且实际上为了类型安全，我们也不能允许用户描述任意的类型位置，**万一传入的类型结构不是 `{label: xxx}` 而是一个回调 `() => void`，那子类型推导岂不是建立在了错误的环境中。** 所以考虑到想要拿到 `{label: infer R}`，首先参数必须具备 `{label: xxx}` 的结构，所以正好可以将 `infer` 与条件判断 `T extends ? A : B` 结合起来用，即：

```
type GetLabelTypeFromObject<T> = T extends ? { label: infer R } ? R : nevertype Result = GetLabelTypeFromObject<{ label: string }>;// type Result = string
```

即如果 `T` 遵循 `{ label: any }` 这样一个结构，那么我可以将这个结构中任何变量位置替换为 `infer xxx`，如果传入类型满足这个结构（TS 静态解析环节判断），则可以基于这个结构体继续推导，所以在推导过程中我们就可以使用 `infer xxx` 推断的变量类型。

回过头来看第一个需求，拿到第一个参数类型就可以用 `infer` 实现了：

```
type GetFirstParamType<T> = T extends ? (...args: infer R) => any ? R[0] : never
```

可以理解为，如果此时 `T` 满足 `(...args: any) => any` 这个结构，同时我们用 `infer R` 表示 `R` 这个临时变量指代第一个 `any` 运行时类型，那么整个函数返回的类型就是 `R`。如果 `T` 都不满足 `(...args: any) => any` 这个结构，比如 `GetFirstParamType<number>`，那这种推导根本无从谈起，直接返回 `never` 类型兜底，当然也可以自定义比如 `any` 之类的任何类型。

概述
--

我们理解了 `infer` 含义后，再结合 conditional infer 这篇文章理解里面的例子，有助于加深记忆。

```
type ArrayElementType<T> = T extends (infer E)[] ? E : T;// type of item1 is `number`type item1 = ArrayElementType<number[]>;// type of item1 is `{name: string}`type item2 = ArrayElementType<{ name: string }>;
```

可以看到，`ArrayElementType` 利用了条件推断与 `infer`，表示了这样一个逻辑：如果 `T` 类型是一个数组，且我们将数组的每一项定义为 `E` 类型，那么返回类型就为 `E`，否则为 `T` 整体类型本身。

所以对于 `item1` 是满足结构的，所以返回 `number`，而 `item2` 不满足结构，所以返回其类型本身。

特别补充一点，对于下面的例子返回什么呢？

```
type item3 = ArrayElementType<[number, string]>;
```

答案是 `number | string`，原因是我们用多个 `infer E`（`(infer E)[]` 相当于 `[infer E, infer E]...` 不就是多个变量指向同一个类型代词 `E` 嘛）同时接收到了 `number` 和 `string`，所以可以理解为 `E` 时而为 `number` 时而为 `string`，所以是或关系，这就是协变。

那如果是函数参数呢？

```
type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void }  ? U : nevertype T21 = Bar<{ a: (x: string) => void; b: (x: number) => void }>; // string & number
```

发现结果是 `string & number`，也就是逆变。但这个例子也是同一个 `U` 时而为 `string` 时而为 `number` 呀，为什么是且的关系，而不是或呢？

其实协变或逆变与 `infer` 参数位置有关。在 TypeScript 中，对象、类、数组和函数的返回值类型都是协变关系，而函数的参数类型是逆变关系，所以 `infer` 位置如果在函数参数上，就会遵循逆变原则。

> 逆变与协变：
> 
> *   协变 (co-variant)：类型收敛。
>     
> *   逆变 (contra-variant)：类型发散。
>     

关于逆变与协变更深入的话题可以再开一篇文章了，这里就不细讲了，对于 `infer` 理解到这里就够啦。

总结
--

`infer` 关键字让我们拥有深入展开泛型的结构，并 Pick 出其中任何位置的类型，并作为临时变量用于最终返回类型的能力。

对于 Typescript 类型编程，最大的问题莫过于希望实现一个效果却不知道用什么语法，`infer` 作为一个强大的类型推导关键字，势必会在大部分复杂类型推导场景下派上用场，所以在遇到困难时，可以想想是不是能用 `infer` 解决问题。

> 讨论地址是：精读《Typescript infer 关键字》· Issue #346 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 关注 **前端精读微信公众号**

![](https://mmbiz.qpic.cn/mmbiz_jpg/x0iannhWUodkMzkjnvOt6yDQSHgWmWxIZMGvuFYlQxLpnNekH8XLMUbkw936sZxxKp88oCtFLrFGPamqtMHcP8Q/640?wx_fmt=jpeg)

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）