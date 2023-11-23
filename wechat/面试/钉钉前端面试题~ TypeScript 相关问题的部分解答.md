> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6awTRmh6mFBdny9UDa8enQ)

点击上方 高级前端进阶，回复 “加群”  

加入我们一起学习，天天进步

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpZ8lSdtDDF1kw3NL6ibgxJuicylWcQ9Dkdl8WesPdUpfRCsbte6zia6PV76f963ePxXg02pI3twq4pg/640?wx_fmt=png)

给出一大些面试题，然后不给答案。前端本来就卷，一些面试官看了文章后可能在自己都不知道答案的情况下，就跑去问面试者。我其实挺反感的这类文章的。

ts 基础知识复习
---------

juejin.cn/post/684490…[1]

😊 ts 中的访问修饰符
-------------

*   public，任何地方
    
*   private，只能在类的内部访问
    
*   protected，能在类的内部访问和子类中访问
    
*   readonly，属性设置为只读
    

😊 const 和 readonly 的区别
-----------------------

1.  const 用于变量，readonly 用于属性
    
2.  const 在运行时检查，readonly 在编译时检查
    
3.  使用 const 变量保存的数组，可以使用 push，pop 等方法。但是如果使用`ReadonlyArray<number>`声明的数组不能使用 push，pop 等方法。
    

😊 枚举和常量枚举（const 枚举）的区别
-----------------------

1.  ```
    枚举会被编译时会编译成一个对象，可以被当作对象使用
    ```
    
2.  ```
    const枚举会在ts编译期间被删除，避免额外的性能开销
    ```
    

```
// 普通枚举enum Witcher {  Ciri = 'Queen',  Geralt = 'Geralt of Rivia'}function getGeraltMessage(arg: {[key: string]: string}): string {  return arg.Geralt}getGeraltMessage(Witcher) // Geralt of Rivia复制代码
```

```
// const枚举const enum Witcher {  Ciri = 'Queen',  Geralt = 'Geralt of Rivia'}const witchers: Witcher[] = [Witcher.Ciri, Witcher.Geralt]// 编译后// const witchers = ['Queen', 'Geralt of Rivia'复制代码
```

😊 ts 中 interface 可以给 Function/Array/Class 做声明吗？
------------------------------------------------

```
// 函数类型interface SearchFunc {  (source: string, subString: string): boolean;}let mySearch: SearchFunc;mySearch = function(source: string, subString: string) {  let result = source.search(subString);  return result > -1;}复制代码
```

```
// Arrayinterface StringArray {  [index: number]: string;}let myArray: StringArray;myArray = ["Bob", "Fred"];复制代码
```

```
// Class, constructor存在于类的静态部分，所以不会检查interface ClockInterface {    currentTime: Date;    setTime(d: Date);}class Clock implements ClockInterface {    currentTime: Date;    setTime(d: Date) {        this.currentTime = d;    }    constructor(h: number, m: number) { }}复制代码
```

ts 中的 this 和 js 中的 this 有什么差异？
------------------------------

不了解

😊 ts 中如何枚举联合类型的 key?
---------------------

```
type Name = { name: string }type Age = { age: number }type Union = Name | Agetype UnionKey<P> = P extends infer P ? keyof P : nevertype T = UnionKey<Union>复制代码
```

😊 ts 中 ?.、??、!.、_、** 等符号的含义？
-----------------------------

*   ?. 可选链
    
*   ?? ?? 类似与短路或，?? 避免了一些意外情况 0，NaN 以及 "",false 被视为 false 值。只有 undefind,null 被视为 false 值。
    
*   !. 在变量名后添加!，可以断言排除 undefined 和 null 类型
    
*   _ , 声明该函数将被传递一个参数，但您并不关心它
    
*   ** 求幂
    
*   !:，待会分配这个变量，ts 不要担心
    

```
// ??let x = foo ?? bar();// 等价于let x = foo !== null && foo !== undefined ? foo : bar();// !.let a: string | null | undefineda.length // errora!.length // ok复制代码
```

😊 什么是抗变、双变、协变和逆变？
------------------

*   Covariant 协变，TS 对象兼容性是协变，父类 <= 子类，是可以的。子类 <= 父类，错误。
    
*   Contravariant 逆变，禁用`strictFunctionTypes`编译，函数参数类型是逆变的，父类 <= 子类，是错误。子类 <= 父类，是可以的。
    
*   Bivariant 双向协变，函数参数的类型默认是双向协变的。父类 <= 子类，是可以的。子类 <= 父类，是可以的。
    

😊 ts 中同名的 interface 或者同名的 interface 和 class 可以合并吗？
---------------------------------------------------

1.  interface 会合并
    
2.  class 不可以合并
    

😊 如何使 ts 项目引入并识别编译为 js 的 npm 库包？
---------------------------------

1.  `npm install @types/xxxx`
    
2.  自己添加描述文件
    

😊 ts 如何自动生成库包的声明文件？
--------------------

可以配置`tsconfig.json`文件中的`declaration`和`outDir`

1.  declaration: true, 将会自动生成声明文件
    
2.  outDir: '', 指定目录
    

😊 什么是泛型
--------

泛型用来来创建可重用的组件，一个组件可以支持多种类型的数据。这样用户就可以以自己的数据类型来使用组件。**简单的说，“泛型就是把类型当成参数”。**

😊 -?，-readonly 是什么含义
---------------------

用于删除修饰符

```
type A = {    a: string;    b: number;}type B = {    [K in keyof A]?: A[K]}type C = {    [K in keyof B]-?: B[K]}type D = {    readonly [K in keyof A]: A[K]}type E = {    -readonly [K in keyof A]: A[K]}复制代码
```

😊 TS 是基于结构类型兼容
---------------

typescript 的类型兼容是基于结构的，不是基于名义的。下面的代码在 ts 中是完全可以的，但在 java 等基于名义的语言则会抛错。

```
interface Named { name: string }class Person {  name: string}let p: Named// okp = new Person()复制代码
```

😊 const 断言
-----------

const 断言，typescript 会为变量添加一个自身的字面量类型

1.  ```
    对象字面量的属性，获得readonly的属性，成为只读属性
    ```
    
2.  ```
    数组字面量成为readonly tuple只读元组
    ```
    
3.  ```
    字面量类型不能被扩展（比如从hello类型到string类型）
    ```
    

```
// type '"hello"'let x = "hello" as const// type 'readonly [10, 20]'let y = [10, 20] as const// type '{ readonly text: "hello" }'let z = { text: "hello" } as const复制代码
```

😊 type 和 interface 的区别
-----------------------

1.  类型别名可以为任何类型引入名称。例如基本类型，联合类型等
    
2.  类型别名不支持继承
    
3.  类型别名不会创建一个真正的名字
    
4.  类型别名无法被实现 (implements)，而接口可以被派生类实现
    
5.  类型别名重名时编译器会抛出错误，接口重名时会产生合并
    

😊 implements 与 extends 的区别
---------------------------

*   extends, 子类会继承父类的所有属性和方法。
    
*   implements，使用 implements 关键字的类将需要实现需要实现的类的所有属性和方法。
    

😊 枚举和 object 的区别
-----------------

1.  枚举可以通过枚举的名称，获取枚举的值。也可以通过枚举的值获取枚举的名称。
    
2.  object 只能通过 key 获取 value
    
3.  数字枚举在不指定初始值的情况下，枚举值会从 0 开始递增。
    
4.  虽然在运行时，枚举是一个真实存在的对象。但是使用 keyof 时的行为却和普通对象不一致。必须使用 keyof typeof 才可以获取枚举所有属性名。
    

😊 never, void 的区别
------------------

*   never，never 表示永远不存在的类型。比如一个函数总是抛出错误，而没有返回值。或者一个函数内部有死循环，永远不会有返回值。函数的返回值就是 never 类型。
    
*   void, 没有显示的返回值的函数返回值为 void 类型。如果一个变量为 void 类型，只能赋予 undefined 或者 null。
    

unknown, any 的区别
----------------

unknown 类型和 any 类型类似。与 any 类型不同的是。unknown 类型可以接受任意类型赋值，但是 unknown 类型赋值给其他类型前，必须被断言

😊 如何在 window 扩展类型
------------------

```
declare global {  interface Window {    myCustomFn: () => void;  }}复制代码
```

复杂的类型推导题目
---------

### 🤔 implement UnionToIntersection

```
type A = UnionToIntersection<{a: string} | {b: string} | {c: string}> // {a: string} & {b: string} & {c: string}// 实现UnionToIntersection<T>type UnionToIntersection<U> =   (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type// https://jkchao.github.io/typescript-book-chinese/tips/infer.html#%E4%B8%80%E4%BA%9B%E7%94%A8%E4%BE%8B复制代码
```

### 😊 implement ToNumber

```
type A = ToNumber<'1'> // 1type B = ToNumber<'40'> // 40type C = ToNumber<'0'> // 0// 实现ToNumbertype ToNumber<T extends string, R extends any[] = []> =    T extends `${R['length']}` ? R['length'] : ToNumber<T, [1, ...R]>;复制代码
```

### 😊 implement Add<A, B>

```
type A = Add<1, 2> // 3type B = Add<0, 0> // 0// 实现ADDtype NumberToArray<T, R extends any[]> = T extends R['length'] ? R : NumberToArray<T, [1, ...R]>type Add<T, R> = [...NumberToArray<T, []>, ...NumberToArray<R, []>]['length']复制代码
```

### 😊 implement SmallerThan<A, B>

```
type A = SmallerThan<0, 1> // truetype B = SmallerThan<1, 0> // falsetype C = SmallerThan<10, 9> // false// 实现SmallerThantype SmallerThan<N extends number, M extends number, L extends any[] = [], R extends any[] = []> =     N extends L['length'] ?         M extends R['length'] ? false : true        :        M extends R['length'] ? false : SmallerThan<N, M, [1, ...L], [1, ...R]>;复制代码
```

### 😊 implement LargerThan<A, B>

```
type A = LargerThan<0, 1> // falsetype B = LargerThan<1, 0> // truetype C = LargerThan<10, 9> // true// 实现LargerThantype LargerThan<N extends number, M extends number, L extends any[] = [], R extends any[] = []> =    N extends L['length'] ?        false : M extends R['length'] ?            true : LargerThan<N, M, [1, ...L], [1, ...R]>;复制代码
```

### 😊 implement IsAny

```
type A = IsAny<string> // falsetype B = IsAny<any> // truetype C = IsAny<unknown> // falsetype D = IsAny<never> // false// 实现IsAnytype IsAny<T> = true extends (T extends never ? true : false) ?                  false extends (T extends never ? true : false) ?                    true                    :                    false                  :                  false;// 更简单的实现type IsAny<T> = 0 extends (T & 1) ? true : false;复制代码
```

### 😊 implement Filter<T, A>

```
type A = Filter<[1,'BFE', 2, true, 'dev'], number> // [1, 2]type B = Filter<[1,'BFE', 2, true, 'dev'], string> // ['BFE', 'dev']type C = Filter<[1,'BFE', 2, any, 'dev'], string> // ['BFE', any, 'dev']// 实现Filtertype Filter<T extends any[], A, N extends any[] = []> =    T extends [infer P, ...infer Q] ?        0 extends (P & 1) ? Filter<Q, A, [...N, P]> :         P extends A ? Filter<Q, A, [...N, P]> : Filter<Q, A, N>        : N;复制代码
```

### 😊 implement TupleToString

```
type A = TupleToString<['a']> // 'a'type B = TupleToString<['B', 'F', 'E']> // 'BFE'type C = TupleToString<[]> // ''// 实现TupleToStringtype TupleToString<T extends any[], S extends string = '', A extends any[] = []> =    A['length'] extends T['length'] ? S : TupleToString<T, `${S}${T[A['length']]}`, [1, ...A]>复制代码
```

### 😊 implement RepeatString<T, C>

```
type A = RepeatString<'a', 3> // 'aaa'type B = RepeatString<'a', 0> // ''// 实现RepeatStringtype RepeatString<T extends string, C extends number, S extends string = '', A extends any[] = []> =    A['length'] extends C ? S : RepeatString<T, C, `${T}${S}`, [1, ...A]>复制代码
```

### 😊 implement Push<T, I>

```
type A = Push<[1,2,3], 4> // [1,2,3,4]type B = Push<[1], 2> // [1, 2]type C = Push<[], string> // [string]// 实现Pushtype Push<T extends any[], I> = T extends [...infer P] ? [...P, I] : [I]复制代码
```

### 😊 implement Flat

```
type A = Flat<[1,2,3]> // [1,2,3]type B = Flat<[1,[2,3], [4,[5,[6]]]]> // [1,2,3,4,5,6]type C = Flat<[]> // []// 实现Flattype Flat<T extends any[]> =    T extends [infer P, ...infer Q] ?        P extends any[] ? [...Flat<P>, ...Flat<Q>] : [P, ...Flat<Q>]        : [];复制代码
```

### 😊 implement Shift

```
type A = Shift<[1,2,3]> // [2,3]type B = Shift<[1]> // []type C = Shift<[]> // []// 实现Shifttype Shift<T extends any[]> = T extends [infer P, ...infer Q] ? [...Q] : [];复制代码
```

### 😊 implement Repeat<T, C>

```
type A = Repeat<number, 3> // [number, number, number]type B = Repeat<string, 2> // [string, string]type C = Repeat<1, 1> // [1, 1]type D = Repeat<0, 0> // []// 实现Repeattype Repeat<T, C, R extends any[] = []> =     R['length'] extends C ? R : Repeat<T, C, [...R, T]>复制代码
```

### 😊 implement ReverseTuple

```
type A = ReverseTuple<[string, number, boolean]> // [boolean, number, string]type B = ReverseTuple<[1,2,3]> // [3,2,1]type C = ReverseTuple<[]> // []// 实现ReverseTupletype ReverseTuple<T extends any[], A extends any[] = []> =    T extends [...infer Q, infer P] ?         A['length'] extends T['length'] ? A : ReverseTuple<Q, [...A, P]>        : A;复制代码
```

### 😊 implement UnwrapPromise

```
type A = UnwrapPromise<Promise<string>> // stringtype B = UnwrapPromise<Promise<null>> // nulltype C = UnwrapPromise<null> // Error// 实现UnwrapPromisetype UnwrapPromise<T> = T extends Promise<infer P> ? P : Error;复制代码
```

### 😊 implement LengthOfString

```
type A = LengthOfString<'BFE.dev'> // 7type B = LengthOfString<''> // 0// 实现LengthOfStringtype LengthOfString<T extends string, A extends any[] = []> =    T extends `${infer P}${infer Q}` ? LengthOfString<Q, [1, ...A]> : A['length']复制代码
```

### 😊 implement StringToTuple

```
type A = StringToTuple<'BFE.dev'> // ['B', 'F', 'E', '.', 'd', 'e','v']type B = StringToTuple<''> // []// 实现type StringToTuple<T extends string, A extends any[] = []> =    T extends `${infer K}${infer P}` ? StringToTuple<P, [...A, K]> : A;复制代码
```

### 😊 implement LengthOfTuple

```
type A = LengthOfTuple<['B', 'F', 'E']> // 3type B = LengthOfTuple<[]> // 0// 实现type LengthOfTuple<T extends any[], R extends any[] = []> =    R['length'] extends T['length'] ? R['length'] : LengthOfTuple<T, [...R, 1]>复制代码
```

### 😊 implement LastItem

```
type A = LastItem<[string, number, boolean]> // booleantype B = LastItem<['B', 'F', 'E']> // 'E'type C = LastItem<[]> // never// 实现LastItemtype LastItem<T> = T extends [...infer P, infer Q] ? Q : never;复制代码
```

### 😊 implement FirstItem

```
type A = FirstItem<[string, number, boolean]> // stringtype B = FirstItem<['B', 'F', 'E']> // 'B'// 实现FirstItemtype FirstItem<T> = T extends [infer P, ...infer Q] ? P : never;复制代码
```

### 😊 implement FirstChar

```
type A = FirstChar<'BFE'> // 'B'type B = FirstChar<'dev'> // 'd'type C = FirstChar<''> // never// 实现FirstChartype FirstChar<T> = T extends `${infer P}${infer Q}` ? P : never;复制代码
```

### 😊 implement Pick<T, K>

```
type Foo = {  a: string  b: number  c: boolean}type A = MyPick<Foo, 'a' | 'b'> // {a: string, b: number}type B = MyPick<Foo, 'c'> // {c: boolean}type C = MyPick<Foo, 'd'> // Error// 实现MyPick<T, K>type MyPick<T, K extends keyof T> = {    [Key in K]: T[Key]}复制代码
```

### 😊 implement Readonly

```
type Foo = {  a: string}const a:Foo = {  a: 'BFE.dev',}a.a = 'bigfrontend.dev'// OKconst b:MyReadonly<Foo> = {  a: 'BFE.dev'}b.a = 'bigfrontend.dev'// Error// 实现MyReadonlytype MyReadonly<T> = {    readonly [K in keyof T]: T[K]}复制代码
```

### 😊 implement Record<K, V>

```
type Key = 'a' | 'b' | 'c'const a: Record<Key, string> = {  a: 'BFE.dev',  b: 'BFE.dev',  c: 'BFE.dev'}a.a = 'bigfrontend.dev' // OKa.b = 123 // Errora.d = 'BFE.dev' // Errortype Foo = MyRecord<{a: string}, string> // Error// 实现MyRecordtype MyRecord<K extends number | string | symbol, V> = {    [Key in K]: V}复制代码
```

### 🤔️ implement Exclude

```
type Foo = 'a' | 'b' | 'c'type A = MyExclude<Foo, 'a'> // 'b' | 'c'type B = MyExclude<Foo, 'c'> // 'a' | 'btype C = MyExclude<Foo, 'c' | 'd'>  // 'a' | 'b'type D = MyExclude<Foo, 'a' | 'b' | 'c'>  // never// 实现 MyExclude<T, K>type MyExclude<T, K> = T extends K ? never : T;复制代码
```

### 🤔️ implement Extract<T, U>

```
type Foo = 'a' | 'b' | 'c'type A = MyExtract<Foo, 'a'> // 'a'type B = MyExtract<Foo, 'a' | 'b'> // 'a' | 'b'type C = MyExtract<Foo, 'b' | 'c' | 'd' | 'e'>  // 'b' | 'c'type D = MyExtract<Foo, never>  // never// 实现MyExtract<T, U>type MyExtract<T, U> = T extends U ? T : never复制代码
```

### 😊 implement Omit<T, K>

```
type Foo = {  a: string  b: number  c: boolean}type A = MyOmit<Foo, 'a' | 'b'> // {c: boolean}type B = MyOmit<Foo, 'c'> // {a: string, b: number}type C = MyOmit<Foo, 'c' | 'd'> // {a: string, b: number}// 实现MyOmittype MyOmit<T, K extends number | string | symbol> = {    [Key in Exclude<keyof T, K>]: T[Key]}type MyOmit<T, K extends number | string | symbol> = Pick<T, Exclude<keyof T, K>>复制代码
```

### 😊 implement NonNullable

```
type Foo = 'a' | 'b' | null | undefinedtype A = MyNonNullable<Foo> // 'a' | 'b'// 实现NonNullabletype MyNonNullable<T> = T extends null | undefined ? never : T;复制代码
```

### 😊 implement Parameters

```
type Foo = (a: string, b: number, c: boolean) => stringtype A = MyParameters<Foo> // [a:string, b: number, c:boolean]type B = A[0] // stringtype C = MyParameters<{a: string}> // Error// 实现MyParameters<T>type MyParameters<T extends (...params: any[]) => any> =    T extends (...params: [...infer P]) => any ? P : never复制代码
```

### 😊 implement ConstructorParameters

```
class Foo {  constructor (a: string, b: number, c: boolean) {}}type C = MyConstructorParameters<typeof Foo> // [a: string, b: number, c: boolean]// 实现MyConstructorParameters<T>type MyConstructorParameters<T extends new (...params: any[]) => any> =    T extends new (...params: [...infer P]) => any ? P : never复制代码
```

### 😊 implement ReturnType

```
type Foo = () => {a: string}type A = MyReturnType<Foo> // {a: string}// 实现MyReturnType<T>type MyReturnType<T extends (...params: any[]) => any> =    T extends (...params: any[]) => infer P ? P : never;复制代码
```

### 😊 implement InstanceType

```
class Foo {}type A = MyInstanceType<typeof Foo> // Footype B = MyInstanceType<() => string> // Error// 实现MyInstanceType<T>type MyInstanceType<T extends new (...params: any[]) => any> =    T extends new (...params: any[]) => infer P ? P : never;复制代码
```

### 😊 implement ThisParameterType

```
function Foo(this: {a: string}) {}function Bar() {}type A = MyThisParameterType<typeof Foo> // {a: string}type B = MyThisParameterType<typeof Bar> // unknown// 实现MyThisParameterType<T>type MyThisParameterType<T extends (this: any, ...params: any[]) => any> =    T extends (this: infer P, ...params: any[]) => any ? P : unknown;复制代码
```

### 😊 implement TupleToUnion

```
type Foo = [string, number, boolean]type Bar = TupleToUnion<Foo> // string | number | boolean// 实现TupleToUnion<T>type TupleToUnion<T extends any[], R = T[0]> =    T extends [infer P, ...infer Q] ? TupleToUnion<Q, R | P> : R;// 其他回答type TupleToUnion<T extends any[]> = T[number]复制代码
```

### 😊 implement Partial

```
type Foo = {  a: string  b: number  c: boolean}// below are all validconst a: MyPartial<Foo> = {}const b: MyPartial<Foo> = {  a: 'BFE.dev'}const c: MyPartial<Foo> = {  b: 123}const d: MyPartial<Foo> = {  b: 123,  c: true}const e: MyPartial<Foo> = {  a: 'BFE.dev',  b: 123,  c: true}// 实现MyPartial<T>type MyPartial<T> = {    [K in keyof T]?: T[K]}复制代码
```

### 😊 Required

```
// all properties are optionaltype Foo = {  a?: string  b?: number  c?: boolean}const a: MyRequired<Foo> = {}// Errorconst b: MyRequired<Foo> = {  a: 'BFE.dev'}// Errorconst c: MyRequired<Foo> = {  b: 123}// Errorconst d: MyRequired<Foo> = {  b: 123,  c: true}// Errorconst e: MyRequired<Foo> = {  a: 'BFE.dev',  b: 123,  c: true}// valid// 实现MyRequired<T>type MyRequired<T> = {    [K in keyof T]-?: T[K]}复制代码
```

### 😊 implement LastChar

```
type A = LastChar<'BFE'> // 'E'type B = LastChar<'dev'> // 'v'type C = LastChar<''> // never// 实现FirstChar<T>type LastChar<T extends string, A extends string[] = []> =    T extends `${infer P}${infer Q}` ?  LastChar<Q, [...A, P]> :        A extends [...infer L, infer R] ? R : never;复制代码
```

### 😊 implement IsNever

```
// https://stackoverflow.com/questions/53984650/typescript-never-type-inconsistently-matched-in-conditional-type// https://www.typescriptlang.org/docs/handbook/advanced-types.html#vtype A = IsNever<never> // truetype B = IsNever<string> // falsetype C = IsNever<undefined> // false// 实现IsNever<T>type IsNever<T> = [T] extends [never] ? true : false;复制代码
```

### 😊 implement KeysToUnion

```
type A = KeyToUnion<{  a: string;  b: number;  c: symbol;}>// 'a' | 'b' | 'c'// 实现KeyToUniontype KeyToUnion<T> = {  [K in keyof T]: K;}[keyof T]复制代码
```

### 😊 implement ValuesToUnion

```
type A = ValuesToUnion<{  a: string;  b: number;  c: symbol;}>// string | number | symbol// ValuesToUniontype ValuesToUnion<T> = T[keyof T]复制代码
```

### FindIndex<T, E>

> bigfrontend.dev/zh/typescri…[2]

```
type IsAny<T> = 0 extends (T & 1) ? true : false;type IsNever<T> = [T] extends [never] ? true : false;type TwoAny<A, B> = IsAny<A> extends IsAny<B> ? IsAny<A> : false;type TwoNever<A, B> = IsNever<A> extends IsNever<B> ? IsNever<A> : false;type SingleAny<A, B> = IsAny<A> extends true ? true : IsAny<B>type SingleNever<A, B> = IsNever<A> extends true ? true : IsNever<B>type FindIndex<T extends any[], E, A extends any[] = []> =    T extends [infer P, ...infer Q] ?        TwoAny<P, E> extends true ?             A['length']            :            TwoNever<P, E> extends true ?                A['length']                :                SingleAny<P, E> extends true ?                    FindIndex<Q, E, [1, ...A]>                    :                    SingleNever<P, E> extends true ?                        FindIndex<Q, E, [1, ...A]>                        :                        P extends E ? A['length'] : FindIndex<Q, E, [1, ...A]>        :         never复制代码
```

### implement Trim

```
type A = Trim<'    BFE.dev'> // 'BFE'type B = Trim<' BFE. dev  '> // 'BFE. dev'type C = Trim<'  BFE .   dev  '> // 'BFE .   dev'type StringToTuple<T extends string, A extends any[] = []> =    T extends `${infer K}${infer P}` ? StringToTuple<P, [...A, K]> : A;type TupleToString<T extends any[], S extends string = '', A extends any[] = []> =    A['length'] extends T['length'] ? S : TupleToString<T, `${S}${T[A['length']]}`, [1, ...A]>type Trim<T extends string, A extends any[] = StringToTuple<T>> =    A extends [infer P, ...infer Q] ?        P extends ' ' ?            Trim<T, Q>            :            A extends [...infer M, infer N] ?                 N extends ' ' ?                    Trim<T, M>                    :                    TupleToString<A>                :                ''        :        '';复制代码
```

还有更多 `UnionToTuple`, `IntersectionToUnion` ?

关于本文  

作者：dyhtps
=========

https://juejin.cn/post/6988763249982308382

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 **「在看」**，让更多的人也能看到这篇内容

2、关注官网 **https://muyiy.cn**，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 **「加群」** ，加入我们一起学习并送你精心整理的高级前端面试题。

》》面试官都在用的题库，快来看看《《

```
“在看”吗？在看就点一下吧

```