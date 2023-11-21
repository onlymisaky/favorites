> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QtlViS4uV0iUfO7f6F9Myw)

TS 强类型非常好用，但在实际运用中，免不了遇到一些难以描述，反复看官方文档也解决不了的问题，至今为止也没有任何一篇文档，或者一套教材可以解决所有犄角旮旯的类型问题。为什么会这样呢？因为 TS 并不是简单的注释器，而是一门图灵完备的语言，所以很多问题的解决方法藏在基础能力里，但你学会了基础能力又不一定能想到这么用。

解决该问题的最好办法就是多练，通过实际案例不断刺激你的大脑，让你养成 TS 思维习惯。所以话不多说，我们今天从 type-challenges 的 Easy 难度题目开始吧。

精读
--

### Pick

手动实现内置 `Pick<T, K>` 函数，返回一个新的类型，从对象 T 中抽取类型 K：

```
interface Todo {  title: string  description: string  completed: boolean}type TodoPreview = MyPick<Todo, 'title' | 'completed'>const todo: TodoPreview = {    title: 'Clean room',    completed: false,}
```

结合例子更容易看明白，也就是 `K` 是一个字符串，我们需要返回一个新类型，仅保留 `K` 定义的 Key。

第一个难点在如何限制 `K` 的取值，比如传入 `T` 中不存在的值就要报错。这个考察的是硬知识，只要你知道 `A extends keyof B` 这个语法就能联想到。

第二个难点在于如何生成一个仅包含 `K` 定义 Key 的类型，你首先要知道有 `{ [A in keyof B]: B[A] }` 这个硬知识，这样可以重新组合一个对象：

```
// 代码 1type Foo<T> = {  [P in keyof T]: T[P]}
```

只懂这个语法不一定能想出思路，原因是你要打破对 TS 的刻板理解，`[K in keyof T]` 不是一个固定模板，其中 `keyof T` 只是一个指代变量，它可以被换掉，如果你换掉成另一个范围的变量，那么这个对象的 Key 值范围就变了，这正好契合本题的 `K`：

```
// 代码 2（本题答案）type MyPick<T, K in keyof T> = {  [P in K]: T[P]}
```

这个题目别看知道答案后简单，回顾下还是有收获的。对比上面两个代码例子，你会发现，只不过是把代码 1 的 `keyof T` 从对象描述中提到了泛型定义里而已，所以功能上没有任何变化，但因为泛型可以由用户传入，所以代码 1 的 `P in keyof T` 因为没有泛型支撑，这里推导出来的就是 `T` 的所有 Keys，而代码 2 虽然把代码挪到了泛型，但因为用的是 `extends` 描述，所以表示 `P` 的类型被约束到了 `T` 的 Keys，至于具体是什么，得看用户代码怎么传。

所以其实放到泛型里的 `K` 是没有默认值的，而写到对象里作为推导值就有了默认值。泛型里给默认值的方式如下：

```
// 代码 3type MyPick<T, K extends keyof T = keyof T> = {  [P in K]: T[P]}
```

也就是说，这样 `MyPick<Todo>` 就也可以正确工作并原封不动返回 `Todo` 类型，也就是说，代码 3 在不传第二个参数时，与代码 1 的功能完全一样。仔细琢磨一下共同点与区别，为什么代码 3 可以做到和代码 1 功能一样，又有更强的拓展性，你对 TS 泛型的实战理解就上了一个台阶。

### Readonly

手动实现内置 `Readonly<T>` 函数，将对象所有属性设置为只读：

```
interface Todo {  title: string  description: string}const todo: MyReadonly<Todo> = {  title: "Hey",  description: "foobar"}todo.title = "Hello" // Error: cannot reassign a readonly propertytodo.description = "barFoo" // Error: cannot reassign a readonly property
```

这道题反而比第一题简单，只要我们用 `{ [A in keyof B]: B[A] }` 重新声明对象，并在每个 Key 前面加上 `readonly` 修饰即可：

```
// 本题答案type MyReadonly<T> = {  readonly [K in keyof T]: T[K]}
```

根据这个特性我们可以做很多延伸改造，比如将对象所有 Key 都设定为可选：

```
type Optional<T> = {  [K in keyof T]?: T[K]}
```

`{ [A in keyof B]: B[A] }` 给了我们描述每一个 Key 属性细节的机会，限制我们发挥的只有想象力。

### First Of Array

实现类型 `First<T>`，取到数组第一项的类型：

```
type arr1 = ['a', 'b', 'c']type arr2 = [3, 2, 1]type head1 = First<arr1> // expected to be 'a'type head2 = First<arr2> // expected to be 3
```

这题比较简单，很容易想到的答案：

```
// 本题答案type First<T extends any[]> = T[0]
```

但在写这个答案时，有 10% 脑细胞提醒我没有判断边界情况，果然看了下答案，有空数组的情况要考虑，空数组时返回类型 `never` 而不是 `undefined` 会更好，下面几种写法都是答案：

```
type First<T extends any[]> = T extends [] ? never : T[0]type First<T extends any[]> = T['length'] extends 0 ? never : T[0]type First<T> = T extends [infer P, ...infer Rest] ? P : never
```

第一种写法通过 `extends []` 判断 `T` 是否为空数组，是的话返回 `never`。

第二种写法通过长度为 0 判断空数组，此时需要理解两点：1. 可以通过 `T['length']` 让 TS 访问到值长度（类型的），2. `extends 0` 表示是否匹配 0，即 `extends` 除了匹配类型，还能直接匹配值。

第三种写法是最省心的，但也使用了 `infer` 关键字，即使你充分知道 `infer` 怎么用（精读《Typescript infer 关键字》），也很难想到它。用 `infer` 的理由是：该场景存在边界情况，最便于理解的写法是 “如果 T 形如 `<P, ...>`” 那我就返回类型 `P`，否则返回 `never`”，这句话用 TS 描述就是：`T extends [infer P, ...infer Rest] ? P : never`。

### Length of Tuple

实现类型 `Length<T>` 获取元组长度:

```
type tesla = ['tesla', 'model 3', 'model X', 'model Y']type spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT']type teslaLength = Length<tesla>  // expected 4type spaceXLength = Length<spaceX> // expected 5
```

经过上一题的学习，很容易想到这个答案：

```
type Length<T extends any[]> = T['length']
```

对 TS 来说，元组和数组都是数组，但元组对 TS 来说可以观测其长度，`T['length']` 对元组来说返回的是具体值，而对数组来说返回的是 `number`。

### Exclude

实现类型 `Exclude<T, U>`，返回 `T` 中不存在于 `U` 的部分。该功能主要用在联合类型场景，所以我们直接用 `extends` 判断就行了：

```
// 本题答案type Exclude<T, U> = T extends U ? never : T
```

实际运行效果：

```
type C = Exclude<'a' | 'b', 'a' | 'c'> // 'b'
```

看上去有点不那么好理解，这是因为 TS 对联合类型的执行是分配率的，即：

```
Exclude<'a' | 'b', 'a' | 'c'>// 等价于Exclude<'a', 'a' | 'c'> | Exclude<'b', 'a' | 'c'>
```

### Awaited

实现类型 `Awaited`，比如从 `Promise<ExampleType>` 拿到 `ExampleType`。

首先 TS 永远不会执行代码，所以脑子里不要有 “await 得等一下才知道结果” 的念头。该题关键就是从 `Promise<T>` 中抽取类型 `T`，很适合用 `infer` 做：

```
type MyAwaited<T> = T extends Promise<infer U> ? U : never
```

然而这个答案还不够标准，标准答案考虑了嵌套 `Promise` 的场景：

```
// 该题答案type MyAwaited<T extends Promise<unknown>> = T extends Promise<infer P>  ? P extends Promise<unknown> ? MyAwaited<P> : P  : never
```

如果 `Promise<P>` 取到的 `P` 还形如 `Promise<unknown>`，就递归调用自己 `MyAwaited<P>`。这里提到了递归，也就是 TS 类型处理可以是递归的，所以才有了后面版本做尾递归优化。

### If

实现类型 `If<Condition, True, False>`，当 `C` 为 `true` 时返回 `T`，否则返回 `F`：

```
type A = If<true, 'a', 'b'>  // expected to be 'a'type B = If<false, 'a', 'b'> // expected to be 'b'
```

之前有提过，`extends` 还可以用来判定值，所以果断用 `extends true` 判断是否命中了 `true` 即可：

```
// 本题答案type If<C, T, F> = C extends true ? T : F
```

### Concat

用类型系统实现 `Concat<P, Q>`，将两个数组类型连起来：

```
type Result = Concat<[1], [2]> // expected to be [1, 2]
```

由于 TS 支持数组解构语法，所以可以大胆的尝试这么写：

```
type Concat<P extends any[], Q extends any[]> = [...P, ...Q]
```

考虑到 `Concat` 函数应该也能接收非数组类型，所以做一个判断，为了方便书写，把 `extends` 从泛型定义位置挪到 TS 类型推断的运行时：

```
// 本题答案type Concat<P, Q> = [  ...P extends any[] ? P : [P],  ...Q extends any[] ? Q : [Q],]
```

解决这题需要信念，相信 TS 可以像 JS 一样写逻辑。这些能力都是版本升级时渐进式提供的，所以需要不断阅读最新 TS 特性，快速将其理解为固化知识，其实还是有一定难度的。

### Includes

用类型系统实现 `Includes<T, K>` 函数：

```
type isPillarMen = Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'> // expected to be `false`
```

由于之前的经验，很容易做下面的联想：

```
// 如果题目要求是这样type isPillarMen = Includes<'Kars' | 'Esidisi' | 'Wamuu' | 'Santana', 'Dio'>// 那我就能用 extends 轻松解决了type Includes<T, K> = K extends T ? true : false
```

可惜第一个输入是数组类型，`extends` 可不支持判定 “数组包含” 逻辑，此时要了解一个新知识点，即 TS 判断中的 `[number]` 下标。不仅这道题，以后很多困难题都需要它作为基础知识。

`[number]` 下标表示任意一项，而 `extends T[number]` 就可以实现数组包含的判定，因此下面的解法是有效的：

```
type Includes<T extends any[], K> = K extends T[number] ? true : false
```

但翻答案后发现这并不是标准答案，还真找到一个反例：

```
type Includes<T extends any[], K> = K extends T[number] ? true : falsetype isPillarMen = Includes<[boolean], false> // true
```

原因很简单，`true`、`false` 都继承自 `boolean`，所以 `extends` 判断的界限太宽了，题目要求的是精确值匹配，故上面的答案理论上是错的。

标准答案是每次判断数组第一项，并递归（讲真觉得这不是 easy 题），分别有两个难点。

第一如何写 Equal 函数？比较流行的方案是这个：

```
type Equal<X, Y> =  (<T>() => T extends X ? 1 : 2) extends  (<T>() => T extends Y ? 1 : 2) ? true : false
```

关于如何写 Equal 函数还引发了一次 小讨论，上面的代码构造了两个函数，这两个函数内的 `T` 属于 deferred（延迟）判断的类型，该类型判断依赖于内部 `isTypeIdenticalTo` 函数完成判断。

有了 `Equal` 后就简单了，我们用解构 + `infer` + 递归的方式做就可以了：

```
// 本题答案type Includes<T extends any[], K> =  T extends [infer F, ...infer Rest] ?    Equal<F, K> extends true ?      true      : Includes<Rest, K>    : false
```

每次取数组第一个值判断 `Equal`，如果不匹配则拿剩余项递归判断。这个函数组合了不少 TS 知识，比如：

*   递归
    
*   解构
    
*   `infer`
    
*   `extends true`
    

可以发现，就为了解决 `true extends boolean` 为 `true` 的问题，我们绕了一大圈使用了更复杂的方式来实现，这在 TS 体操中也算是常态，解决问题需要耐心。

### Push

实现 `Push<T, K>` 函数：

```
type Result = Push<[1, 2], '3'> // [1, 2, '3']
```

这道题真的很简单，用解构就行了：

```
// 本题答案type Push<T extends any[], K> = [...T, K]
```

可见，想要轻松解决一个 TS 简单问题，首先你需要能解决一些困难问题 😁。

### Unshift

实现 `Unshift<T, K>` 函数：

```
type Result = Unshift<[1, 2], 0> // [0, 1, 2,]
```

在 `Push` 基础上改下顺序就行了：

```
// 本题答案type Unshift<T extends any[], K> = [K, ...T]
```

### Parameters

实现内置函数 `Parameters`：

`Parameters` 可以拿到函数的参数类型，直接用 `infer` 实现即可，也比较简单：

```
type Parameters<T> = T extends (...args: infer P) => any ? P : []
```

`infer` 可以很方便从任何具体的位置取值，属于典型难懂易用的语法。

总结
--

学会 TS 基础语法后，活用才是关键。

> 讨论地址是：精读《type challenges - easy》· Issue #422 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）