> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gLvhCJxYIJu_tEd00RA2bw)

### Challenge

在本次挑战中，你需要定义一个 `Chainable` 接口，它包含 `option(key, value)` 和 `get` 两个方法。在 `option` 方法中，你需要使用给定的 `key` 和 `value` 扩展当前 `config` 对象的类型，通过 `get` 方法来获取最终结果。

> 假设 `key` 仅接受字符串，而 `value` 可以是任何值。

```
interface Chainable = {}declare const config: Chainableconst result = config    .option('name', 'semlinker')    .option('age', 30)    .option('email', { value: 'semlinker@gmail.com' })    .get()// expect the type of result to be:interface Result {    name: string    age: number    email: {        value: string    }}
```

### Solution

首先我们根据类型挑战的要求，来定义一个基础的 `Chainable` 接口。`option` 方法返回 `Chainable` 类型以支持链式调用。

```
interface Chainable {    option(key: string, value: any): Chainable    get(): Chainable }
```

有了上述的接口之后，TypeScript 编译器会推断出 `result` 的类型是 `Chainable` 类型。很明显这并不符合要求。其实，`result` 的最终类型，是由用户的使用方式来决定的，所以我们也无法明确 `result` 的类型。这时，我们可以定义一个泛型变量 `T` 来表示 `get` 方法返回的类型。

```
interface Chainable<T> {    option(key: string, value: any): Chainable<T>    get(): T }
```

因为 `get` 方法最终返回的是对象类型，因此我们使用 TypeScript 泛型约束来约束泛型变量的类型，同时为该泛型变量设置一个默认值：

```
interface Chainable<T extends object = {}> {    option(key: string, value: any): Chainable<T>    get(): T}
```

如果你对泛型变量还不熟悉的话，可以阅读[**这篇**](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247499518&idx=1&sn=aaf8c309d3739d5732ed45eb80c4854d&chksm=ea445fa6dd33d6b0099ab5ce96f0d28e7a881fa01073098a1e8932607d4896d6e5ba2cb5b4ef&scene=21#wechat_redirect)文章。使用了新的 `Chainable` 接口之后，`result` 的类型返回的是 `{}` 类型，还不满足类型挑战的要求。接下来，我们从简单的代码入手，来分析如何继续完善 `Chainable` 接口的代码：

```
declare const config: Chainableconst result = config    .option('name', 'semlinker')    .get()
```

对于以上代码，我们希望 TypeScript 编译器能推断出 `result` 的类型是 `{ name: string }` 类型。因此，我们需要获取 `option` 方法中 `key` 和 `value` 的类型。因为 `option` 方法中的 `key` 和 `value` 是由用户动态设置的，我们也无法提前知道它们的类型，所以我们再次定义两个泛型变量 `Key` 和 `Value` 来表示它们的类型。因为类型挑战中，要求 `key` 的类型是字符串类型，所以我们使用泛型约束来约束泛型变量 `Key` 的类型。

```
interface Chainable<T extends object = {}> {    option<Key extends string, Value>(key: Key, value: Value): Chainable<T>    get(): T}
```

定义了 `Key` 和 `Value` 泛型变量之后，我们就可以更新 `option` 方法的返回值类型：

```
interface Chainable<T extends object = {}> {   option<Key extends string, Value>(key: Key, value: Value):      Chainable<T & { Key: Value }>   get(): T}
```

更新完 `Chainable` 接口后，你会发现 TypeScript 编译器推断出 `result` 的类型如下：

```
const result: {    Key: string;}
```

很明显这还是不能满足类型挑战的要求，那么如何解决上述的问题呢？这时，你可以利用 TypeScript 映射类型。如果你对 TypeScript 映射类型不熟悉的话，可以阅读[**这篇**](http://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247499712&idx=1&sn=bf2f565ad712d4c43bf80edddaba3dea&chksm=ea445e98dd33d78e16ca3077183f59e60e67fd0baa31ec921acdece2bd36c79128146731e65c&scene=21#wechat_redirect)文章。

```
interface Chainable<T extends object = {}> {    option<Key extends string, Value>(key: Key, value: Value):       Chainable<T & { [P in Key]: Value }>    get(): T}
```

之后，TypeScript 编译器就能正常推断出 `result` 对象的类型了：

```
const result: {    name: string;}
```

当然，你也可以使用 TypeScript 内置的 `Record` 工具类型来实现同样的功能：

```
interface Chainable<T extends object = {}> {    option<Key extends string, Value>(key: Key, value: Value):       Chainable<T & Record<Key, Value>>    get(): T}
```