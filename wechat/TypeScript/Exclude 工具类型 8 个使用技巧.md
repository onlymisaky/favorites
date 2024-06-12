> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/0Fq8a13Nq_0iRTNFyZfVRA)

`Exclude` 是 TypeScript 中内置的工具类型，它用于从一个联合类型中排除掉你不希望包含的类型，生成一个新的类型。这个工具类型在日常开发中非常有用，它能够帮助我们编写类型安全的代码和更好地实现代码复用。

```
/** * Exclude from T those types that are assignable to U. * typescript/lib/lib.es5.d.ts */type Exclude<T, U> = T extends U ? never : T;type T0 = Exclude<"a" | "b" | "c", "a" | "b">// type T0 = "c"
```

[视频详情](javascript:;)

本文我将介绍 `Exclude` 工具类型的 8 个使用技巧，掌握这些技巧之后，在工作中你就能更好地利用 `Exclude` 工具类型来满足不同的使用场景。

### 1. 排除指定的基本数据类型

```
type MyTypes = string | number | boolean;type StringOrNumber = Exclude<MyTypes, boolean>;let uid: StringOrNumber = "semlinker" // Okuid = 2024 // Okuid = false // Error// Type 'boolean' is not assignable to type 'StringOrNumber'.
```

### 2. 排除 string 或 number 类型的子类型

```
type Status = "success" | "error" | 200 | 500;type StringStatus = Exclude<Status, number>; // type StringStatus = "success" | "error"type NumberStatus = Exclude<Status, string>// type NumberStatus = 200 | 500
```

### 3. 排除两个联合类型的共有成员

```
type TaskStatus = "Todo" | "InProgress" | "Done" | "Archived";type ModuleHandledStatus = "Todo" | "Done" | "OnHold";type TaskOnlyStatus = Exclude<TaskStatus, ModuleHandledStatus>;// type TaskOnlyStatus = "InProgress" | "Archived"
```

### 4. 排除含有特定属性的子类型

`Animal` 联合类型，包含了多种动物的描述对象，我们想从中排除含有 `"legs"` 属性的子类型。

```
type Animal =    | { type: 'dog', legs: number }    | { type: 'cat', legs: number }    | { type: 'fish', fins: number };type AnimalsWithFins = Exclude<Animal, { legs: number }>;const fish: AnimalsWithFins = { type: 'fish', fins: 6 }; // Okconst dog: AnimalsWithFins = { type: 'dog', legs: 4 }; // Error// Type '"dog"' is not assignable to type '"fish"'.
```

### 5. 排除同个属性不同类型的子类型

除了可以使用 `Exclude<Animal, { legs: number }>` 来创建 `AnimalsWithFins` 类型，该类型还可以通过 `Exclude<Animal, { type: 'dog' | 'cat' }>` 这种方式来创建。

```
type Animal =    | { type: 'dog', legs: number }    | { type: 'cat', legs: number }    | { type: 'fish', fins: number };type AnimalsWithFins = Exclude<Animal, { type: 'dog' | 'cat' }>;const fish: AnimalsWithFins = { type: 'fish', fins: 6 }; // Okconst dog: AnimalsWithFins = { type: 'dog', legs: 4 }; // Error// Type '"dog"' is not assignable to type '"fish"'.
```

### 6. 排除枚举类型的某些成员

利用 `Exclude` 工具类型可以排除枚举中的某些成员，从而得到一个新的类型。

```
enum Status { New, InProgress, Done, Cancelled }type ActiveStatus = Exclude<Status, Status.Done | Status.Cancelled>;// type ActiveStatus = Status.New | Status.InProgress
```

### 7. 排除指定前缀的字符串字面量类型

利用 `Exclude` 工具类型和模板字面量类型，我们可以实现从字符串字面量联合类型中，排除指定前缀或后缀的字符串字面量。

```
type LogEvent =    | "userLogin"    | "userLogout"    | "systemException"    | "systemCrash"    | "performanceLoadTime"    | "performanceApiResponse";type SystemAndPerformanceEvents = Exclude<LogEvent, `user${string}`>;// type SystemAndPerformanceEvents = "systemException" | "systemCrash" | "performanceLoadTime" | "performanceApiResponse"
```

### 8. 排除不同格式的字符串字面量类型

```
type LogEvent =    | "userLogin"    | "userLogout"    | "UserLogin" // New    | "UserLogout" // New    | "systemException"    | "systemCrash"    | "performanceLoadTime"    | "performanceApiResponse";type SystemAndPerformanceEvents = Exclude<LogEvent, `${"user" | "User"}${string}`>;// type SystemAndPerformanceEvents = "systemException" | "systemCrash" | "performanceLoadTime" | "performanceApiResponse"
```