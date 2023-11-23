> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/j_jo_SahGH99gbkJYqtkgA)

解决 TS 问题的最好办法就是多练，这次解读 type-challenges Medium 难度 1~8 题。

精读
--

### Get Return Type

实现非常经典的 `ReturnType<T>`：

```
const fn = (v: boolean) => {  if (v)    return 1  else    return 2}type a = MyReturnType<typeof fn> // should be "1 | 2"
```

首先不要被例子吓到了，觉得必须执行完代码才知道返回类型，其实 TS 已经帮我们推导好了返回类型，所以上面的函数 `fn` 的类型已经是这样了：

```
const fn = (v: boolean): 1 | 2 => { ... }
```

我们要做的就是把函数返回值从内部抽出来，这非常适合用 `infer` 实现：

```
// 本题答案type MyReturnType<T> = T extends (...args: any[]) => infer P ? P : never
```

`infer` 配合 `extends` 是解构复杂类型的神器，如果对上面代码不能一眼理解，说明对 `infer` 熟悉度还是不够，需要多看。

### Omit

实现 `Omit<T, K>`，作用恰好与 `Pick<T, K>` 相反，排除对象 `T` 中的 `K` key：

```
interface Todo {  title: string  description: string  completed: boolean}type TodoPreview = MyOmit<Todo, 'description' | 'title'>const todo: TodoPreview = {  completed: false,}
```

这道题比较容易尝试的方案是：

```
type MyOmit<T, K extends keyof T> = {  [P in keyof T]: P extends K ? never : T[P]}
```

其实仍然包含了 `description`、`title` 这两个 Key，只是这两个 Key 类型为 `never`，不符合要求。

所以只要 `P in keyof T` 写出来了，后面怎么写都无法将这个 Key 抹去，我们应该从 Key 下手：

```
type MyOmit<T, K extends keyof T> = {  [P in (keyof T extends K ? never : keyof T)]: T[P]}
```

但这样写仍然不对，我们思路正确，即把 `keyof T` 中归属于 `K` 的排除，但因为前后 `keyof T` 并没有关联，所以需要借助 `Exclude` 告诉 TS，前后 `keyof T` 是同一个指代（上一讲实现过 `Exclude`）：

```
// 本题答案type MyOmit<T, K extends keyof T> = {  [P in Exclude<keyof T, K>]: T[P]}type Exclude<T, U> = T extends U ? never : T
```

这样就正确了，掌握该题的核心是：

1.  三元判断还可以写在 Key 位置。
    
2.  JS 抽不抽函数效果都一样，但 TS 需要推断，很多时候抽一个函数出来就是为了告诉 TS “是同一指代”。
    

当然既然都用上了 `Exclude`，我们不如再结合 `Pick`，写出更优雅的 `Omit` 实现：

```
// 本题优雅答案type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
```

### Readonly 2

实现 `MyReadonly2<T, K>`，让指定的 Key `K` 成为 ReadOnly：

```
interface Todo {  title: string  description: string  completed: boolean}const todo: MyReadonly2<Todo, 'title' | 'description'> = {  title: "Hey",  description: "foobar",  completed: false,}todo.title = "Hello" // Error: cannot reassign a readonly propertytodo.description = "barFoo" // Error: cannot reassign a readonly propertytodo.completed = true // OK
```

该题乍一看蛮难的，因为 `readonly` 必须定义在 Key 位置，但我们又没法在这个位置做三元判断。其实利用之前我们自己做的 `Pick`、`Omit` 以及内置的 `Readonly` 组合一下就出来了：

```
// 本题答案type MyReadonly2<T, K extends keyof T> = Readonly<Pick<T, K>> & Omit<T, K>
```

即我们可以将对象一分为二，先 `Pick` 出 `K` Key 部分设置为 Readonly，再用 `&` 合并上剩下的 Key，正好用到上一题的函数 `Omit`，完美。

### Deep Readonly

实现 `DeepReadonly<T>` 递归所有子元素：

```
type X = {   x: {     a: 1    b: 'hi'  }  y: 'hey'}type Expected = {   readonly x: {     readonly a: 1    readonly b: 'hi'  }  readonly y: 'hey' }type Todo = DeepReadonly<X> // should be same as `Expected`
```

这肯定需要用类型递归实现了，既然要递归，肯定不能依赖内置 `Readonly` 函数，我们需要将函数展开手写：

```
// 本题答案type DeepReadonly<T> = {  readonly [K in keyof T]: T[K] extends Object> ? DeepReadonly<T[K]> : T[K]}
```

这里 `Object` 也可以用 `Record<string, any>` 代替。

### Tuple to Union

实现 `TupleToUnion<T>` 返回元组所有值的集合：

```
type Arr = ['1', '2', '3']type Test = TupleToUnion<Arr> // expected to be '1' | '2' | '3'
```

该题将元组类型转换为其所有值的可能集合，也就是我们希望用所有下标访问这个数组，在 TS 里用 `[number]` 作为下标即可：

```
// 本题答案type TupleToUnion<T extends any[]> = T[number]
```

### Chainable Options

直接看例子比较好懂：

```
declare const config: Chainableconst result = config  .option('foo', 123)  .option('name', 'type-challenges')  .option('bar', { value: 'Hello World' })  .get()// expect the type of result to be:interface Result {  foo: number  name: string  bar: {    value: string  }}
```

也就是我们实现一个相对复杂的 `Chainable` 类型，拥有该类型的对象可以 `.option(key, value)` 一直链式调用下去，直到使用 `get()` 后拿到聚合了所有 `option` 的对象。

如果我们用 JS 实现该函数，肯定需要在当前闭包存储 Object 的值，然后提供 `get` 直接返回，或 `option` 递归并传入新的值。我们不妨用 Class 来实现：

```
class Chain {  constructor(previous = {}) {    this.obj = { ...previous }  }    obj: Object  get () {    return this.obj  }  option(key: string, value: any) {    return new Chain({      ...this.obj,      [key]: value    })  }}const config = new Chain()
```

而本地要求用 TS 实现，这就比较有趣了，正好对比一下 JS 与 TS 的思维。先打个岔，该题用上面 JS 方式写出来后，其实类型也就出来了，但用 TS 完整实现类型也另有其用，特别在一些复杂函数场景，需要用 TS 系统描述类型，JS 真正实现时拿到 any 类型做纯运行时处理，将类型与运行时分离开。

好我们回到题目，我们先把 `Chainable` 的框架写出来：

```
type Chainable = {  option: (key: string, value: any) => any  get: () => any}
```

问题来了，如何用类型描述 `option` 后还可以接 `option` 或 `get` 呢？还有更麻烦的，如何一步一步将类型传导下去，让 `get` 知道我此时拿的类型是什么呢？

`Chainable` 必须接收一个泛型，这个泛型默认值是个空对象，所以 `config.get()` 返回一个空对象也是合理的：

```
type Chainable<Result = {}> = {  option: (key: string, value: any) => any  get: () => Result}
```

上面的代码对于第一层是完全没问题的，直接调用 `get` 返回的就是空对象。

第二步解决递归问题：

```
// 本题答案type Chainable<Result = {}> = {  option: <K extends string, V>(key: K, value: V) => Chainable<Result & {    [P in K]: V  }>  get: () => Result}
```

递归思维大家都懂就不赘述了。这里有个看似不值得一提，但确实容易坑人的地方，就是如何描述一个对象仅包含一个 Key 值，这个值为泛型 `K` 呢？

```
// 这是错的，因为描述了一大堆类型{  [K] : V}// 这也是错的，这个 K 就是字面量 K，而非你希望的类型指代{  K: V}
```

所以必须使用 TS “习惯法” 的 `[K in keyof T]` 的套路描述，即便我们知道 `T` 只有一个固定的类型。可见 JS 与 TS 完全是两套思维方式，所以精通 JS 不必然精通 TS，TS 还是要大量刷题培养思维的。

### Last of Array

实现 `Last<T>` 获取元组最后一项的类型：

```
type arr1 = ['a', 'b', 'c']type arr2 = [3, 2, 1]type tail1 = Last<arr1> // expected to be 'c'type tail2 = Last<arr2> // expected to be 1
```

我们之前实现过 `First`，类似的，这里无非是解构时把最后一个描述成 `infer`：

```
// 本题答案type Last<T> = T extends [...infer Q, infer P] ? P : never
```

这里要注意，`infer Q` 有人第一次可能会写成：

```
type Last<T> = T extends [...Others, infer P] ? P : never
```

发现报错，因为 TS 里不可能随便使用一个未定义的泛型，而如果把 Others 放在 `Last<T, Others>` 里，你又会面临一个 TS 大难题：

```
type Last<T, Others extends any[]> = T extends [...Others, infer P] ? P : never// 必然报错Last<arr2>
```

因为 `Last<arr2>` 仅传入了一个参数，必然报错，但第一个参数是用户给的，第二个参数是我们推导出来的，这里既不能用默认值，又不能不写，无解了。

如果真的硬着头皮要这么写，必须借助 TS 还未通过的一项特性：部分类型参数推断，举个例子，很可能以后的语法是：

```
type Last<T, Others extends any[] = infer> = T extends [...Others, infer P] ? P : never
```

这样首先传参只需要一个了，而且还申明了第二个参数是一个推断类型。不过该提案还未支持，而且本质上和把 `infer` 写到表达式里面含义和效果也都一样，所以对这道题来说就不用折腾了。

### Pop

实现 `Pop<T>`，返回去掉元组最后一项之后的类型：

```
type arr1 = ['a', 'b', 'c', 'd']type arr2 = [3, 2, 1]type re1 = Pop<arr1> // expected to be ['a', 'b', 'c']type re2 = Pop<arr2> // expected to be [3, 2]
```

这道题和 `Last` 几乎完全一样，返回第一个解构值就行了：

```
// 本题答案type Pop<T> = T extends [...infer Q, infer P] ? Q : never
```

总结
--

从题目中很明显能看出 TS 思维与 JS 思维有很大差异，想要真正掌握 TS，大量刷题是必须的。

> 讨论地址是：精读《Get return type, Omit, ReadOnly...》· Issue #422 · dt-fe/weekly

**如果你想参与讨论，请 点击这里，每周都有新的主题，周末或周一发布。前端精读 - 帮你筛选靠谱的内容。**

> 版权声明：自由转载 - 非商用 - 非衍生 - 保持署名（创意共享 3.0 许可证）