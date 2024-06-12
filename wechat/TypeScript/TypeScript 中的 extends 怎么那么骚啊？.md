> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/WOlSNmwbddKPC8hO-Hi1uw)

> 原创第 151 篇

在学习和使用 ts 的时候，有一个语法会大量的出现，他就是 `extends`。但是这个语法放到 ts 里，就显得非常怪异，因为好多时候跟我们常规的理解看上去好像不太一样，不就是一个**继承**吗，咋到处都在乱用啊？

实际上，之所以怪，是因为在 ts 中，`extends` 不只是要表达继承的意思，他还有一些延展含义

在 JS 核心进阶中，我们在学习设计模式的时候，曾经提高过一个原则：**里氏替换原则**，该原则针对的是父类与子类之间的替换关系：任何使用父类实例的地方，都能够使用子类实例完美替换。

```
class Person {  constructor(name) {    this.name = name  }  run(t) {    console.log(`${this.name} 跑了 ${t} 公里`);  }}class Student extends Person {  constructor(name, grade) {    super(name)    this.grade = grade  }}const p1 = new Person('Tom')p1.run(20)const s1 = new Student('Tom')s1.run(20)
```

这个案例中，我们能够使用 `s1` 去替换 `p1`。而不会出现什么问题。

在 ts 的类型兼容性里，也符合这个原则。基于这个逻辑，我们就可以把 **extends** 作为一个判断条件，来验证你是否合理运用了里氏替换原则，从而衍生出它新的用法

0
-

**继承**

继承的运用非常的常规。在面向对象的运用中，我们可以继承一个父类

```
class Parent {}class Children extends Parent {}
```

我们也可以在 `interface` 的类型声明中，使用继承

```
interface Animal {  kind: string}interface Dog extends Animal {  bark(): void}
```

它等价于

```
interface Dog {  kind: string  bark(): void}
```

1
-

**泛型约束**

我们先简单来看一下这个东西是如何在泛型中使用的，然后再来结合里氏替换原则来分析它的逻辑。

```
interface Dispatch<T extends { type: string }> {  (action: T): T}
```

我们在定义 `Dispatch` 时需要传入一个泛型，传入的泛型类型必须与 `{type: string}` 符合里氏替换原则。意思就是说，要传入该类型的子类型。

因此，我们可以传入

```
var action = {  type: 'get/list',  playload: 10}
```

也可以传入

```
var action = {  type: 'merge'}
```

```
var action = {  type: 'add',  value: { a: 1, b: 2 }}
```

从结论上来看，父类型的约束力度更小，子类型的约束力度更大。

2
-

**条件判断**

我们可以可以继续衍生，当子类型与父类型符合正常的继承关系时，判断结果为 true，否则为 false。

这里的继承关系，表达的是一种替换关系，或者说是约束力度的缩小。

```
type C = A extends B ? string : number
```

这里表达的含义是，当 A 能够替换 B 时，判断结果为 true，否则，判断结果为 false。

```
interface Person {  name: string}interface Yung extends Person {  gender: string}interface Student extends Yung {  age: string}
```

也就是说，当 A 作为 B 的子类型时，判断结果为 true

```
// 此时判断结果为truetype C = Yung extends Person ? number : string // number
```

```
// 此时判断结果为falsetype C = Yung extends Student ? number : string // string
```

也可以结合泛型使用

```
type P<T> = T extends string ? string : numbertype Z = P<string> // string
```

当我们在使用泛型的时候，会出现一些问题，看一下这个例子

```
type A = number | string extends string ? string : number // number
```

因为 string 的约束力度，比 `number | string` 更大，因此这里的条件判断为 false，但是当我们通过泛型来做到同样的事情时，情况就发生了变化

```
type P<T> = T extends string ? string : numbertype A = P<number | string> // string | number
```

当我们用泛型传递时候，跟预想中的不太一样，这里会把泛型传入的 number 和 string 拆分之后在去运行 extends 判断。因此最后的结果是 `string | number`

> 联合类型在泛型中的表现是分配之后再传入

在实践中一定要警惕这个小小的差异。我们可以使用如下的方式避免这种先分配再传入的规则

```
type P<T> = [T] extends [string] ? string : numbertype A = P<number | string> // number
```

`never` 表示所有类型的子类型，因此也被看成是一个联合类型，当我们在泛型中传入 `never` 时也会同理出现同样的问题

```
type P<T> = T extends string ? string : number// 没有类型可分配，直接返回 nevertype A = P<never> // never
```

注意他们的不同

```
type P<T> = [T] extends [string] ? string : numbertype A = P<never> // string
```

3
-

**定义一个 pick**

现有一个对象 A 有很多个属性，我希望重新定义一个新的对象 B，该对象的属性是从 A 里挑选出来的，那么 B 的类型应该怎么定义呢

```
interface A {  name: string;  age: number;  gender: number;  class: string}
```

当然，我们可以用常规的方式来定义，不过有的时候这样会比较麻烦

```
interface B {  name: string,  age: number}
```

我们也可以利用泛型和 extends，定义一个 Pick 类型

```
type Pick<T, K extends keyof T> = {  [P in K]: T[P]}type B = Pick<A, 'name' | 'age'>
```

当我们在 Pick 中传入 A 时， keyof A 的结果为 `name | age | gender | class`，因此 `'name' | 'age'` 是 keyof A 的子类型。

此时的 B 得到与上面写法一样的结果

4
-

**定义一个 Exclude**

现在我有一个联合类型

```
type a = 'name' | 'age' | 'gender' | 'class'
```

我希望排除其中一个 `name`，得到一个新的联合类型

```
type b = 'age' | 'gender' | 'class'
```

此时我们可以定一个排除的泛型类型来做到这个事情

```
type b = Exclude<a, 'name'>
```

这个 Exclude 是如何实现的呢？非常的简单

```
type Exclude<T, U> = T extends U ? never : Ttype b = Exclude<a, 'name'>
```

我们来分析一下，首先刚才我们已经知道，当传入的泛型为联合类型时，会先分配再传入

因此，此时传入的联合类型 `a` 会被拆分传入。

也就是说，`T exnteds U` 的比较会变成

```
// never'name' extends 'name' ? never : 'name'// age'age' extends 'name' ? never : 'age'// gender'gender' extends 'name' ? never : 'gender'// class'class' extends 'name' ? never : 'class'
```

所以通过这种方式，我们可以做到从联合类型中排除指定的类型

5
-

**定义一个 Omit**

Omit 是 Pick 的取反，表示挑选剩余的属性组成新的对象。理解了 `Pick` 和 `Exclude`，这个理解起来非常容易

```
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
```

使用

```
interface A {  name: string,  age: number,  gender: number,  class: string}type B = Omit<A, 'name'>
```

等价于

```
interface A {  age: number,  gender: number,  class: string}
```

大家可以自己分析一下 Omit 的实现原理，应该是没有任何难度的

6
-

**最后**

最后来个骚的，大家分析一下这玩意儿有什么用

```
type TypeString<T> =    T extends string ? "string" :    T extends number ? "number" :    T extends boolean ? "boolean" :    T extends undefined ? "undefined" :    T extends Function ? "function" :    "object";
```