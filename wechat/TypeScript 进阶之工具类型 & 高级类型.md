> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/aSo8kcyRgRAfPtVLvMHhFA)

什么是工具类型
-------

用 JavaScript 编写中大型程序是离不开 `lodash` 工具的，而用 TypeScript 编程同样离不开工具类型的帮助，工具类型就是类型版的 `lodash` 。简单的来说，就是把已有的类型经过类型转换构造一个新的类型。工具类型本身也是类型，得益于泛型的帮助，使其能够对类型进行抽象的处理。工具类型主要目的是简化类型编程的过程，提高生产力。

使用工具类型的好处
---------

先来看看一个场景，体会下工具类型带来什么好处。

```
// 一个用户接口interface User {  name: string  avatar: string  country：string  friend：{    name: string    sex: string  }}
```

现在业务要求 `User` 接口里的成员都变为可选，你会怎么做？再定义一个接口，为成员都加上可选修饰符吗？这种方法确实可行，但接口里有几十个成员呢？此时，工具类型就可以派上用场。

```
type Partial<T> = {[K in keyof T]?: T[K]}type PartialUser = Partial<User>// 此时PartialUser等同于type PartialUser = {  name?: string | undefined;  avatar?: string | undefined;  country?: string | undefined;  friend?: {    name: string;    sex: string;  } | undefined;}
```

通过工具类型的处理，我们得到一个新的类型。即使成员有成千上百个，我们也只需要一行代码。由于 `friend` 成员是对象，上面的 `Partial` 处理只对第一层添加可选修饰符，假如需要将对象成员内的成员也添加可选修饰符，可以使用 `Partial` 递归来解决。

```
type partial<T> = {  [K in keyof T]?: T[K] extends object ? partial<T[K]> : T[K]}
```

如果你是第一次看到以上的写法，可能会很懵逼，不知道发生了什么操作。不慌，且往下看，或许当你看完这篇文章再回过头来看时，会发现原来是这么一回事。

关键字
---

TypeScript 中的一些关键字对于编写工具类型必不可缺

### keyof

语法：**「keyof T」** 。返回联合类型，为 `T` 的所有 `key`

```
interface User{  name: string  age: number}type Man = {   name:string,   height: 180}type ManKeys = keyof Man // "name" | "height"type UserKeys = keyof User // "name" | "age"
```

### typeof

语法：**「typeof T」** 。返回 `T` 的成员的类型

```
let arr = ['apple', 'banana', 100]let man = {  name: 'Jeo',  age: 20,  height: 180}type Arr = typeof arr // (string | number)[]type Man = typeof man // {name: string; age: number; height: number;}
```

### infer

相比上面两个关键字， `infer` 的使用可能会有点难理解。在有条件类型的 `extends` 子语句中，允许出现 `infer` 声明，它会引入一个待推断的类型变量。这个推断的类型变量可以在有条件类型的 `true` 分支中被引用。

简单来说，它可以把类型处理过程的某个部分抽离出来当做类型变量。以下例子需要结合高级类型，如果不能理解，可以选择跳转这部分，把高级类型看完后再回来。

下面代码会提取函数类型的返回值类型：

```
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
```

`(...args: any[]) => infer R` 和 `Function` 类型的作用是差不多的，这样写只是为了能够在过程中拿到函数的返回值类型。`infer` 在这里相当于把返回值类型声明成一个类型变量，提供给后面的过程使用。

有条件类型可以嵌套来构成一系列的匹配模式，按顺序进行求值：

```
type Unpacked<T> =  T extends (infer U)[] ? U :  T extends (...args: any[]) => infer U ? U :  T extends Promise<infer U> ? U :  T;type T0 = Unpacked<string>;  // stringtype T1 = Unpacked<string[]>;  // stringtype T2 = Unpacked<() => string>;  // stringtype T3 = Unpacked<Promise<string>>;  // stringtype T4 = Unpacked<Promise<string>[]>;  // Promise<string>type T5 = Unpacked<Unpacked<Promise<string>[]>>;  // string
```

高级类型
----

### 交叉类型

语法：**「A & B」** ，交叉类型可以把多个类型合并成一个新类型，新类型将拥有所有类型的成员。

```
interface Shape {  size: string  color: string}interface Brand {  name: string  price: number}let clothes: Shape&Brand = {  name: 'Uniqlo',  color: 'blue',  size: 'XL',  price: 200}
```

### 联合类型

语法：**「typeA | typeB」** ，联合类型是包含多种类型的类型，被绑定联合类型的成员只需满足其中一种类型。

```
function pushItem(item:string|number){  let array:Array<string|number> = ['apple','banana','cherry']  array.push(item)}pushItem(10) // okpushItem('durian') // ok
```

通常，删除用户信息需要提供 `id` ，创建用户则不需要 `id` 。这种类型应该如何定义？如果选择为 `id` 字段提供添加可选修饰符的话，那就太不明智了。因为在删除用户时，即使不填写 `id` 属性也不会报错，这不是我们想要的结果。

可辨识联合类型能帮助我们解决这个问题：

```
type UserAction = {  action: 'create'}|{  id:number  action: 'delete'}let userAction:UserAction = {  id: 1,  action: 'delete'}
```

### 字面量类型

字⾯量类型主要分为 真值字⾯量类型，数字字⾯量类型，枚举字⾯量类型，⼤整数字⾯量类型、字符串字⾯量类型。

```
const a: 2333 = 2333 // okconst b: 0b10 = 2 // okconst c: 0x514 = 0x514 // okconst d: 'apple' = 'apple' // okconst e: true = true // okconst f: 'apple' = 'banana' // 不能将类型“"banana"”分配给类型“"apple"”
```

下面以字符串字面量类型作为例子:

字符串字面量类型允许指定的字符串作为类型。如果使用 JavaScript 的模式中看下面的例子，会把 `level` 当成一个值。但在 TypeScript 中，千万不要用这种思维去看待， `level` 表示的就是一个字符串 `coder` 的类型，被绑定这个类型的变量，它的值只能是 `coder` 。

```
type Level = 'coder'let level:Level = 'coder' // oklet level2:Level = 'programmer' // 不能将类型“"programmer"”分配给类型“"coder"”
```

字符串和联合类型搭配，可以实现类似枚举类型的字符串

```
type Level = 'coder' | 'leader' | 'boss'function getWork(level: Level){  if(level === 'coder'){    console.log('打代码、摸鱼')  }else if(level === 'leader'){    console.log('造轮子、架构')  }else if(level === 'boss'){    console.log('喝茶、谈生意')  }}getWork('coder')getWork('user') // 类型“"user"”的参数不能赋给类型“Level”的参数
```

### 索引类型

语法：**「T[K]」** ，使用索引类型，编译器就能够检查使用动态属性名的代码。在 JavaScript 中，对象可以用属性名获取值，而在 TypeScript 中，这一切被抽象化，变成通过索引获取类型。就像 `person[name]` 被抽象成类型 `Person[name]` ，在以下例子中代表的就是 `string` 类型。

```
interface Person {  name: string;  age: number;}let person: Person = {  name: 'Jeo',  age: 20}let name = person['name'] // 'Jeo'type str = Person['name'] // string
```

我们可以在普通的上下文里使用 `T[K]` ，只要确保类型变量 `K` 为 `T` 的索引即可

```
function getProperty<T, K extends keyof T>(o: T, name: K): T[K] {  return o[name]; // o[name] is of type T[K]}
```

`getProperty` 里的 `o: T` 和 `name: K` ，意味着 `o[name]: T[K]`

```
let name: string = getProperty(person, 'name');let age: number = getProperty(person, 'age');let unknown = getProperty(person, 'unknown'); // 类型“"unknown"”的参数不能赋给类型“"name" | "age"”的参数
```

`K` 不仅可以传成员，成员的字符串联合类型也是有效的

```
type Union = Person[keyof Person] // "string" | "number"
```

### 映射类型

语法：**「[K in Keys]」** 。TypeScript 提供了从旧类型中创建新类型的一种方式 。在映射类型里，新类型以相同的形式去转换旧类型里每个属性。根据 `Keys` 来创建类型， `Keys` 有效值为 string | number | symbol 或 联合类型。

```
type Keys = 'name'|10type User = {  [K in Keys]: string}
```

该语法可以理解为内部使用了循环

*   K: 依次绑定到每个属性，相当于 Keys 的项
    
*   Keys: 包含要迭代的属性名的集合
    

因此以上的例子等同于：

```
type User = {  name: string;  10: string;}
```

需要注意的是这个语法描述的是类型而非成员。若想添加额外的成员，需使用交叉类型：

```
// 这样使用type ReadonlyWithNewMember<T> = {  readonly [P in keyof T]: T[P];} & { newMember: boolean }// 不要这样使用// 这会报错！type ReadonlyWithNewMember<T> = {  readonly [P in keyof T]: T[P];  newMember: boolean;}
```

在真正应用中，映射类型结合索引访问类型是一个很好的搭配。因为转换过程会基于一些已存在的类型，且按照一定的方式转换字段。你可以把这过程理解为 JavaScript 中数组的 `map` 方法，在原本的基础上扩展元素（ TypeScript 中指类型），当然这种理解过程可能有点粗糙。

文章开头的 `Partial` 工具类型正是使用这种搭配，为原有的类型添加可选修饰符。

### 条件类型

语法：**「T extends U ? X : Y」** ，若 `T` 能够赋值给 `U` ，那么类型是 `X` ，否则为 `Y` 。条件类型以条件表达式推断类型关系，选择其中一个分支。相对上面的类型，条件类型很好理解，类似 JavaScript 中的三目运算符。

再来看看文章开头递归的操作，你就会发现能看懂这段处理过程。过程：使用映射类型遍历，判断 `T[K]` 属于 `object` 类型，则把 `T[K]` 传入 `partial` 递归，否则返回类型 `T[K]` 。

```
type partial<T> = {  [K in keyof T]?: T[K] extends object ? partial<T[K]> : T[K]}
```

### 小结

关于一些常用的高级类型相信大家都了解得差不多，下面将应用这些类型来编写一个工具类型。

该工具类型实现的功能为筛选出两个 `interface` 的公共成员：

```
interface PersonA{  name: string  age: number  boyfriend: string  car: {    type: 'Benz'  }}interface PersonB{  name: string  age: string  girlfriend: string  car: {    type: 'bicycle'  }}type Filter<T,U> = T extends U ? T : nevertype Common<A, B> = {  [K in Filter<keyof A, keyof B>]: A[K] extends B[K] ? A[K] : A[K]|B[K]}
```

通过 `Filter` 筛选出公共的成员联合类型 `"name"|"age"` 作为映射类型的集合，公共部分可能会存在类型不同的情况，因此要为成员保留两者的类型。

```
type CommonMember = Common<PersonA, PersonB>// 等同于type CommonMember = {  name: string;  age: string | number;  car: {    type: "Benz";  } | {    type: "bicycle";  };}
```

内置工具类型
------

为了满足常见的类型转换需求， TypeScript 也提供一些内置工具类型，这些类型是全局可见的。

### Partial

构造类型 `T` ，并将它所有的属性设置为可选的。它的返回类型表示输入类型的所有子类型。

```
interface Todo {  title: string;  description: string;}function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {  return { ...todo, ...fieldsToUpdate };}const todo1 = {  title: 'organize desk',  description: 'clear clutter',};const todo2 = updateTodo(todo1, {  description: 'throw out trash',});
```

### Readonly

构造类型 T，并将它所有的属性设置为 readonly，也就是说构造出的类型的属性不能被再次赋值。

```
interface Todo {  title: string;}const todo: Readonly<Todo> = {  title: 'Delete inactive users',};todo.title = 'Hello'; // Error: cannot reassign a readonly property
```

### Record<K, T>

构造一个类型，其属性名的类型为 K，属性值的类型为 T。这个工具可用来将某个类型的属性映射到另一个类型上。

```
interface PageInfo {  title: string;}type Page = 'home' | 'about' | 'contact';const x: Record<Page, PageInfo> = {  about: { title: 'about' },  contact: { title: 'contact' },  home: { title: 'home' },};
```

### Pick<T, K>

从类型 T 中挑选部分属性 K 来构造类型。

```
interface Todo {  title: string;  description: string;  completed: boolean;}type TodoPreview = Pick<Todo, 'title' | 'completed'>;const todo: TodoPreview = {  title: 'Clean room',  completed: false,};
```

### Omit<T, K>

从类型 T 中剔除部分属性 K 来构造类型，与 Pick 相反。

```
interface Todo {  title: string;  description: string;  completed: boolean;}type TodoPreview = Omit<Todo, 'title' | 'completed'>;const todo: TodoPreview = {  description: 'I am description'};
```

### Exclude<T, U>

从类型 T 中剔除所有可以赋值给 U 的属性，然后构造一个类型。

```
type T0 = Exclude<"a" | "b" | "c", "a">;  // "b" | "c"type T1 = Exclude<"a" | "b" | "c", "a" | "b">;  // "c"type T2 = Exclude<string | number | (() => void), Function>;  // string | number
```

### Extract<T, U>

从类型 T 中提取所有可以赋值给 U 的类型，然后构造一个类型。

```
type T0 = Extract<"a" | "b" | "c", "a" | "f">;  // "a"type T1 = Extract<string | number | (() => void), Function>;  // () => void
```

### NonNullable

从类型 T 中剔除 null 和 undefined，然后构造一个类型。

```
type T0 = NonNullable<string | number | undefined>;  // string | numbertype T1 = NonNullable<string[] | null | undefined>;  // string[]
```

### ReturnType

由函数类型 T 的返回值类型构造一个类型。

```
type T0 = ReturnType<() => string>;  // stringtype T1 = ReturnType<(s: string) => void>;  // voidtype T2 = ReturnType<(<T>() => T)>;  // {}type T3 = ReturnType<(<T extends U, U extends number[]>() => T)>;  // number[]type T5 = ReturnType<any>;  // anytype T6 = ReturnType<never>;  // anytype T7 = ReturnType<string>;  // Errortype T8 = ReturnType<Function>;  // Error
```

### InstanceType

由构造函数类型 T 的实例类型构造一个类型。

```
class C {  x = 0;  y = 0;}type T0 = InstanceType<typeof C>;  // Ctype T1 = InstanceType<any>;  // anytype T2 = InstanceType<never>;  // anytype T3 = InstanceType<string>;  // Errortype T4 = InstanceType<Function>;  // Errorlet t0:T0 = {  x: 10,  y: 2}
```

### Required

构造一个类型，使类型 T 的所有属性为 required。

```
interface Props {  a?: number;  b?: string;};const obj: Props = { a: 5 }; // OKconst obj2: Required<Props> = { a: 5 }; // Error: property 'b' missing
```

写在最后
----

除了介绍编写工具类型所需要具备的一些知识点，以及 TypeScript 内置的工具类型。更重要的是抽象思维能力，不难发现上面的例子大部分没有具体的值运算，都是使用类型在编程。想要理解这些知识，必须要进入到抽象逻辑里思考。还有高级类型的搭配和类型转换的处理，也要通过大量的实践才能玩好。说实话，自己学习这些知识时，真正感受到 TypeScript 的深不可测，也了解到自身的不足之处。突然想起在某篇文章的一句话：技术是无止尽的，接触的越多，越能感到自己的渺小。

参考资料
----

Typescript Hankbook（中文版）