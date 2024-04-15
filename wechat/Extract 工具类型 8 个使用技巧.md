> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/UEqqChrK_jNnN7M3wlUByw)

`Extract` 是 TypeScript 中内置的工具类型，它用于从联合类型中提取出符合某个条件的类型，生成一个新的类型。这个工具类型在日常开发中非常有用，它能够帮助我们编写类型安全的代码和更好地实现代码复用。

```
/** * Extract from T those types that are assignable to U. * typescript/lib/lib.es5.d.ts */type Extract<T, U> = T extends U ? T : never;type T0 = Extract<"a" | "b" | "c", "a" | "f">// type T0 = "a"
```

[视频详情](javascript:;)

本文我将介绍 `Extract` 工具类型的 8 个使用技巧，掌握这些技巧之后，在工作中你就能更好地利用 `Extract` 工具类型来满足不同的使用场景。

### 1. 提取指定的基本数据类型

```
type MyTypes = string | number | boolean;type StringOrNumber = Extract<MyTypes, string | number>;let uid: StringOrNumber = "semlinker" // Okuid = 2024 // Okuid = false // Error// Type 'boolean' is not assignable to type 'StringOrNumber'.
```

### 2. 提取指定的字符串字面量类型

```
type Color = 'red' | 'green' | 'blue' | 'yellow';type PrimaryColors = Extract<Color, 'red' | 'green' | 'blue'>;const primaryColor: PrimaryColors = 'blue'; // Okconst secondaryColor: PrimaryColors = 'yellow'; // Error// Type '"yellow"' is not assignable to type 'PrimaryColors'.
```

### 3. 提取可调用的函数类型

```
type Value = string | number | (() => void);type CallableFn = Extract<Value, Function>;const fn1: CallableFn = () => console.log('semlinker'); // Okconst fn2: CallableFn = 'semlinker'; // Error// Type 'string' is not assignable to type '() => void'.
```

### 4. 提取两个联合类型的共有成员

```
type TaskStatus = "Todo" | "InProgress" | "Done" | "Archived";type ModuleHandledStatus = "Todo" | "Done" | "OnHold";type ModuleSpecificStatus = Extract<TaskStatus, ModuleHandledStatus>;// type ModuleSpecificStatus = "Todo" | "Done"
```

### 5. 提取含有特定属性的子类型

### `Animal` 联合类型，包含了多种动物的描述对象，我们想从中提取出含有 "legs" 属性的子类型。

```
type Animal =    | { type: 'dog', legs: number }    | { type: 'cat', legs: number }    | { type: 'fish', fins: number };type AnimalsWithLegs = Extract<Animal, { legs: number }>;const dog: AnimalsWithLegs = { type: 'dog', legs: 4 }; // Okconst cat: AnimalsWithLegs = { type: 'cat', legs: 4 }; // Okconst fish: AnimalsWithLegs = { type: 'fish', fins: 6 }; // Error// Type '"fish"' is not assignable to type '"dog" | "cat"'.
```

### 6. 提取特定的事件类型

```
type EventTypes = MouseEvent | KeyboardEvent | TouchEvent;type OnlyMouseEvents = Extract<EventTypes, MouseEvent>;function handleMouseEvent(event: OnlyMouseEvents) {    console.log('Handling mouse event:', event.clientX, event.clientY);}document.addEventListener('click', (event) => {    handleMouseEvent(event); // OK});document.addEventListener('keydown', (event) => {    handleMouseEvent(event); // Error    // Argument of type 'KeyboardEvent' is not assignable to parameter of type 'MouseEvent'.});
```

### 7. 在类型守卫中使用 Extract

使用 `Extract` 可以在类型守卫中精确地过滤类型，使得在条件分支中可以安全地使用过滤后的类型。

```
type Pet = { type: 'dog', bark: () => void } | { type: 'cat', meow: () => void };function isDog(pet: Pet): pet is Extract<Pet, { type: 'dog' }> {    return pet.type === 'dog';}const pet1: Pet = { type: 'dog', bark: () => console.log('Woof!') }const pet2: Pet = { type: "cat", meow: () => console.log("Meow!") }console.log(`pet1 is dog: ${isDog(pet1)}`) // "pet1 is dog: true" console.log(`pet2 is dog: ${isDog(pet2)}`) // "pet2 is dog: false"
```

### 8. 在函数重载中使用 Extract

在处理 API 请求的场景中，我们需要根据不同的请求类型（如 GET、POST、DELETE）处理不同类型的数据。为了增强类型安全和确保每种请求类型都正确地处理其数据，我们可以利用 TypeScript 的函数重载和 `Extract` 工具类型。

```
type RequestType = 'GET' | 'POST' | 'DELETE';type RequestData = {    GET: undefined;    POST: { body: string };    DELETE: { resourceId: number };};// Function overloading, based on the request type, accepts matching data typesfunction sendRequest<T extends RequestType>(type: 'GET', data: Extract<RequestData[T], undefined>): void;function sendRequest<T extends RequestType>(type: 'POST', data: Extract<RequestData[T], { body: string }>): void;function sendRequest<T extends RequestType>(type: 'DELETE', data: Extract<RequestData[T], { resourceId: number }>): void;function sendRequest<T extends RequestType>(type: T, data: RequestData[T]): void {    console.log(`Sending ${type} request with data:`, data);}sendRequest('GET', undefined); // OksendRequest('POST', { body: "semlinker" }); // OksendRequest('DELETE', { resourceId: 2024 }); // OksendRequest('POST', { body: 2024 }); // Error// Type 'number' is not assignable to type 'string'.sendRequest('DELETE', undefined); // Error// Argument of type 'undefined' is not assignable to parameter of type '{ resourceId: number; }'.
```