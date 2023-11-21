> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/HMc3Niz8Ep7yBudcQ4ekPg)

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN9yr8Tq8Td56CIUAibXWmfQTprW4icNR1k2TWuaLKuWZN3tDEQ7ltPgb9xLwPQHdlia5JLmII3c9c7TA/640?wx_fmt=png)

**TypeScript** 是一种静态类型检查的编程语言，它内置了许多基本数据类型，如字符串、数字和布尔型等。除了基本数据类型，当某种类型对于大多数代码来说都非常有用时，它们就会被添加到 **TypeScript** 中并且被大家使用而无需担心它们的可用性。这些内置在 TS 中的类型我们称之为工具类型，这些工具类型位于 TS 安装目录 typescript/lib/lib.es5.d.ts，熟悉这些工具类型，可以帮助我们提高开发效率。

#### Partial<T>、Required<T> 与 Readonly<T>

该组工具类型为**改操作**的工具类型，具体为将类型 T 的所有属性都改为可选、必选或只读。

**定义**：

```
/** * Make all properties in T optional */type Partial<T> = {    [P in keyof T]?: T[P];};/** * Make all properties in T required */type Required<T> = {    [P in keyof T]-?: T[P];};/** * Make all properties in T readonly */type Readonly<T> = {    readonly [P in keyof T]: T[P];};
```

**知识点**：

**in**：关键字，用来实现遍历;

**keyof**：关键字，索引类型查询，用来获取类型的所有键，返回的类型是联合类型;

?：修饰符，表示可选属性;

**readonly**：修饰符，表示只读属性;

-：修饰符，添加在 “?” 或 "readonly" 修饰符之前，表示移除 “?” 或 "readonly" 修饰符。

**作用**：

Partial，将 T 类型中的所有属性变为可选属性; Required，将 T 类型中的所有属性变为必选属性; Readonly，将 T 类型中的所有属性变为只读属性。

**应用**：

```
interface Text {  size: number  color: string}type T = Partial<Text>type R = Required<Text>type O = Readonly<Text>
```

新定义的 T 类型中的属性均为 Text 类型属性，且均为可选；新定义的 R 类型中的属性均为 Text 类型属性，且均为必选；新定义的 O 类型中的属性均为 Text 类型属性，且均为只读。

#### Record<K,T>

该类型可视作**增操作**相关的工具类型，根据我们指定的键值类型，新增一个对象类型。

**定义**：

```
/** * Construct a type with a set of properties K of type T */type Record<K extends keyof any, T> = {    [P in K]: T;};
```

**知识点**：

**keyof any**：上面介绍过 keyof（关键字，用来获取类型的所有键，返回的类型是联合类型），当对 any 使用 keyof 索引类型查询时，结果类型为固定的联合类型 “string | number | symbol”；

**K extends keyof any**：泛型约束，定义了类型 K 的最大范围为联合类型 “string | number | symbol”。

**作用**：

根据给定的属性名类型和属性类型创建一个新的对象类型。

**应用**：

```
type K = 'size'|'color'type T = numbertype R = Record<K, T>
```

新定义的 R 类型，包括属性 size 和 color，且类型均为 number。

#### Exclude<T,U> 与 Extract<T,U>

该组类型可以视作**查操作**相关的工具类型，查出 T 类型中与 U 类型无关的属性或相关的属性。

**定义**：

```
/** * Exclude from T those types that are assignable to U */type Exclude<T, U> = T extends U ? never : T;/** * Extract from T those types that are assignable to U */type Extract<T, U> = T extends U ? T : never;
```

**知识点**：

**T extends U ? X : Y**：条件类型，extends 是关键字，若类型 T 能够赋值给类型 U，则条件类型的结果为类型 X，否则为类型 Y。

**作用**：

根据条件类型的定义，Exclude 类型中若 T 类型中的属性存在于 U 类型，则返回 never，也就是从类型 T 中剔除所有类型 U 的属性。Extract 则恰恰和 Exclude 相反，返回类型 T 和类型 U 的交集。

**应用**：

```
interface Text {  size: number  color: string}interface Img {  width: number  color: string}type T = Exclude<Text,Img>type R = Extract<Text,Img>
```

新定义的 T 类型，只有 size 属性；新定义的 R 类型，只包含 color 属性。

#### Pick<T,K>、Omit<T,K > 与 NonNullable

该组工具类型为**删操作**相关的工具类型，包括剔除与指定键相关、无关或 null、undefined 类型操作的工具类型。

**定义**：

```
/** * From T, pick a set of properties whose keys are in the union K */type Pick<T, K extends keyof T> = {    [P in K]: T[P];};/** * Construct a type with the properties of T except for those in type K. */type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;/** * Exclude null and undefined from T */type NonNullable<T> = T extends null | undefined ? never : T;
```

**作用**：

Pick 类型从已有对象类型 T 中选取选定的属性及其类型 K 创建新的类型。Omit 与 Pick 类型相反，从已有对象类型 T 中剔除选定的属性及其类型 K 创建新的类型。NonNullable 与 Omit 相似，返回的结果为从 T 类型中剔除 null and undefined 类型。

**应用**：

```
interface Text {  size: number  color: string}type T = Pick<Text,'size'>type R = Omit<Text,'size'>type N = NonNullable<Text|null|undefinde>
```

新定义的 T 类型，只包括 Text 类型中的属性 size 及其类型；新定义的 T 类型，只包括 Text 类型中的属性 color 及其类型；新定义的 N 类型，只包括 Text 类型。

#### Parameters、ConstructorParameters、ReturnType 与 InstanceType

该组工具类型为与**函数相关**的工具类型，包括获取普通函数参数和返回值的工具类型和获取构造函数参数和返回值的构造类型。

**定义**：

```
/** * Obtain the parameters of a function type in a tuple */type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;/** * Obtain the parameters of a constructor function type in a tuple */type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;/** * Obtain the return type of a function type */type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;/** * Obtain the return type of a constructor function type */type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
```

**知识点**：

**infer**：关键字，在 extends 条件类型语句（T extends U ？X : Y）中，允许在类型 U 的位置上使用关键字 infer 定义可推断的类型变量，可推断的类型变量只允许在类型 X 的位置上使用。简单应用如下，取出数组中的类型：

```
type ExtractArrayItemType<T> = T extends (infer U)[] ? U : T;// 条件判断为 true，返回 Utype T = ExtractArrayItemType<string[]>; // string
```

**作用**：

Parameters 工具类型能够获取函数类型的参数类型，并使用参数类型构造一个元组类型; ConstructorParameters 工具类型可以把构造函数的参数类型作为一个元组类型返回；ReturnType 工具类型可以获取函数的返回值类型; InstanceType 工具类型可以获取构造函数的返回类型；

**应用**：

```
type Fn = (a: string, b: number) => string;type FnParamTypes = Parameters(Fn);  // [string, number]type FnReturnType = ReturnType(Fn); // stringinterface FunctionConstructor {  new(...args: string[]): Function;  (...args: string[]): Function;  readonly prototype: Function;}type ConstructorParamTypes = ConstructorParameters(FunctionConstructor) // string[]type ConstructorInstanceType = InstanceType(FunctionConstructor) // Function
```

#### ThisParameterType、OmitThisParameter 与 ThisType

该组类型均为与 **this** 相关的工具类型。

**定义**：

```
/** * Extracts the type of the 'this' parameter of a function type, or 'unknown' if the function type has no 'this' parameter. */type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;/** * Removes the 'this' parameter from a function type. */type OmitThisParameter<T> = unknown extends ThisParameterType<T> ? T : T extends (...args: infer A) => infer R ? (...args: A) => R : T;/** * Marker for contextual 'this' type */interface ThisType<T> { }
```

**知识点**：

**unknown**：顶端类型，TypeScript 中仅有 any 和 unknown 两种顶端类型，所有其他类型都可以赋值给两者，但 unknown 只能赋值给 any 类型和 unknown 类型。TypeScript 中只有一个尾端类型 never，是其他所有类型的子类型。

**作用** ThisParameterType 类型可以获取函数参数中 this 参数的类型；OmitThisParameter 类型可以剔除函数参数中 this 参数的类型；ThisType 类型可以对象字面量中 this 的类型。

**应用**

```
interface Foo {    x: number};function fn(this: Foo) {}type Test = ThisParameterType<typeof fn>; // Footype Fn = (this: Foo) => voidtype NonReturnFn = OmitThisParameter<Fn>; // () => voidlet obj: ThisType<{x: number, getX: () => number}>obj = {  x: 100,  getX(){    return this.x  }}
```

以上简单介绍了 TypeScript 中的自带工具类型，TypeScript 与 JavaScript 有相通之处，但又有更多的不同和背景知识，只有内化了这些知识同时不断地练习才能有效掌握这一门语言。

  

想了解更多转转公司的业务实践，点击关注下方的公众号吧！