> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vRVy8OhwMr9YgjacliGpow)

在 TypeScript 中，`as const` 是一种类型断言，它将变量标记为 “常量”。使用 `as const` 可以告诉 TypeScript 编译器，某个对象的所有属性都是只读的，并且它们的类型是字面量类型，而不是更通用的类型，比如 `string` 或 `number` 类型。接下来，我将介绍 TypeScript 中 `as const` 类型断言的 5 个使用技巧。

### 1. 确保对象的属性不可变

在下面代码中，虽然你使用 `const` 关键字来定义 DEFAULT_SERVER_CONFIG 常量。但你仍然可以修改该对象的属性。

```
const DEFAULT_SERVER_CONFIG = {    host: "localhost",    port: 8080}DEFAULT_SERVER_CONFIG.port = 9090console.log(`Server Host: ${DEFAULT_SERVER_CONFIG.port}`)// "Server Host: 9090"
```

如果你希望该对象的属性，是只读的不允许修改，那么你可以使用 `as const` 类型断言。

```
const DEFAULT_SERVER_CONFIG = {    host: "localhost",    port: 8080} as const
```

之后，当你尝试修改 `port` 属性时，TypeScript 编译器就会提示以下错误信息：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V0NwD98PqibMjbaRq1SVDv9U6ZHZkxIM0ADZDnzsnavjNLlAZ54MlKiaiao1DC7ymJAFLDIiby5IYcMBw/640?wx_fmt=png&from=appmsg)

`as const` 类型断言，除了支持普通对象之外，还支持嵌套对象：

```
const DEFAULT_CONFIG = {    server: {        host: "localhost",        port: 8080    },    database: {        user: "root",        password: "root"    }} as const
```

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V0NwD98PqibMjbaRq1SVDv9UYCwGBQgcXP3Sk0cib7w5G2DJgGbrx12SOZF47RZpnBfAd1cvzmfbjog/640?wx_fmt=png&from=appmsg)

### 2. 确保数组或元组不可变

在工作中，数组是一种常见的数组结构。使用 `as const` 类型断言，我们可以让数组变成只读。

```
const RGB_COLORS = ["red", "green", "blue"] as const
```

使用了 `as const` 类型断言之后，RGB_COLORS 常量的类型被推断为 `readonly ["red", "green", "blue"]` 类型。之后，当你往 RGB_COLORS 数组添加新的颜色时，TypeScript 编译器就会提示以下错误信息：

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V0NwD98PqibMjbaRq1SVDv9UTnaZ3vFQ7rurbdbyjibS3KfoMnKC4DOkCBZEnGyeTgHr0qGVbfEsAfw/640?wx_fmt=png&from=appmsg)

除了数组之外，你也可以在元组上使用 `as const` 类型断言：

```
const person = ['kakuqo', 30, true] as const;person[0] = 'semlinker' // Error// Cannot assign to '0' because it is a read-only property.(2540)
```

### 3. 常量枚举的替代方案

在下面代码中，我们使用 `enum` 关键字定义了 `Colors` 枚举类型。

```
const enum Colors {  Red = 'RED',  Green = 'GREEN',  Blue = 'BLUE',}let color: Colors = Colors.Red; // Okcolor = Colors.Green // Ok
```

除了使用枚举类型之外，利用 `as const` 类型断言，你也可以实现类似的功能：

```
const Colors = {  Red: 'RED',  Green: 'GREEN',  Blue: 'BLUE',} as const;type ColorKeys = keyof typeof Colors;type ColorValues = typeof Colors[ColorKeys]let color: ColorValues = 'RED'; // Okcolor = 'GREEN'; // Ok
```

### 4. 让类型推断更精准

在下面代码中，`red` 变量的类型被推断为 `string` 类型。

```
const RGB_COLORS = ["red", "green", "blue"];let red = RGB_COLORS[0] // string
```

在某些场合中，你可能希望获取更精确的类型，比如对应的字面量类型，这时你就可以使用 `as const` 类型断言：

```
const RGB_COLORS = ["red", "green", "blue"] as const;let red = RGB_COLORS[0] // "red"
```

### 5. 赋值时缩窄变量的类型

在下面代码中，使用 `const` 关键字定义的常量，它的类型会被推断为更精确的类型。

```
let color1 = "Red" // let color1: stringconst color2 = "Red" // const color2: "Red"
```

利用 `as const` 类型断言，我们也可以让 `let` 关键字定义的变量对应的类型更精准：

```
let color3 = "Red" as const // let color3: "Red"
```

当然，在实际工作中，如果明确定义常量，那么推荐直接使用 `const` 关键字来定义。