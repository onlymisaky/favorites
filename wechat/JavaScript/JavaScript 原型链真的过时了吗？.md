> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8-3LC2Sfqn6n1v37dkXCjQ)

争论不一

主要两种声音：

某大佬 x: 没必要再考原型链了，说这种原型链问题实际在开发中很少遇到，目前大多使用 `ES6` 中的类，没有必要再问了

某大佬 y: 认为仍然有必要，原型链是 `js` 最基础的内容，必须掌握。

我觉得争论这些不重要，就用下面一道我常考面试者的经典面试题你就知道原型链到底要掌握到什么程度？

给你一个 `class` 类用函数实现一下。我觉得如果你既然说了大家现在都在使用 `ES6` 中的类，但是类中的基本概念一定得清楚吧，以及它和函数之间的关系也得清楚。下面开始做这道题

初级版本题目
------

```
class Student{   constructor(name,age,grade){    this.name = name;    this.age = age;    this.grade = grade;   }       displayInfo(){    console.log(`Name: ${this.name}, Age: ${this.age}, Grade: ${this.grade}`);   }   // 静态方法适用于与实例无关的功能   static compareAge(student1,student2){    if (student1.age > student2.age) {        console.log(`${student1.name} is older than ${student2.name}.`);      } else if (student1.age < student2.age) {        console.log(`${student1.name} is younger than ${student2.name}.`);      } else {        console.log(`${student1.name} and ${student2.name} are of the same age.`);      }   }}
```

基于上面的 `class` 我们要实现对应的函数需要清楚的知识点

1.  `class` 类构造函数中声明的属性，是在 `Student` 实例中的 ---- `function` 实现时也需在实例上
    
2.  类中的实例函数 `display（Instance Method）` 是定义在类的原型上，并且是不可枚举的 ---- `function` 实现时也需要在原型上
    
3.  类中的静态方法 `(Static Method)` 是定义在类本身上的方法，而不是在类实例上的 ---- `function` 实现时应在函数本身, 并且注意类中静态函数也是不可枚举的。
    

代码实现

```
function Student(name,age,grade){  // 实例属性  this.name = name;  this.age = age;  this.grade = grade;}Object.defineProperty(Student.prototype,'displayInfo',{  value:function(){    console.log(`Name: ${this.name}, Age: ${this.age}, Grade: ${this.grade}`);  },  enumerable:false,// 类中的函数是不可枚举的})Object.defineProperty(Student,  'compareAge',function(student1,student2){     if (student1.age > student2.age) {        console.log(`${student1.name} is older than ${student2.name}.`);      } else if (student1.age < student2.age) {        console.log(`${student1.name} is younger than ${student2.name}.`);      } else {        console.log(`${student1.name} and ${student2.name} are of the same age.`);      }  })
```

考虑一个问题，如果我在 `function Student` 上增加一个非函数属性, 类中可以有对应的实现吗？

```
function Student(){}Student.prototype.name = '123'
```

在类中是没有对应实现的，即使写在构造函数中的实例属性也不是等价的。因为在原型链模式下，原型上的属性是所有实例共享的，而将属性写在类的构造函数中会使每个实例拥有自己的属性副本，这改变了属性的共享方式。

类中实现不了，但是可以给类的原型链增加非函数属性，手动修改 `class`的原型

```
class Student {}Student.prototype.name = '123'; // 所有实例共享
```

题目升级，增加父之继承关系
-------------

升级题目，子类 `Student` 继承 `Person`, 除了类到函数转换，还需考虑处理继承（包括父类的构造函数调用）

```
class Person{  constructor(sex){    this.sex = sex;  }  getSex(){    console.log('获取性别',this.sex);    return this.sex;  }}class Student extends Person{   constructor(name,age,grade,sex){    super(sex);// 调用父类的 constructor    this.name = name;    this.age = age;    this.grade = grade;   }       displayInfo(){    console.log(`Name: ${this.name}, Age: ${this.age}, Grade: ${this.grade}`);   }   // 静态方法适用于与实例无关的功能   static compareAge(student1,student2){    if (student1.age > student2.age) {        console.log(`${student1.name} is older than ${student2.name}.`);      } else if (student1.age < student2.age) {        console.log(`${student1.name} is younger than ${student2.name}.`);      } else {        console.log(`${student1.name} and ${student2.name} are of the same age.`);      }   }}
```

除了前面类转换函数的知识点外，还需清楚点知识点

1.  初级版题目知识点不再重复
    
2.  构造函数定义：`Person` 和 `Student`都作为构造函数定义，其中 Student 构造函数内部首先调用 `Person.call(this, sex)`来确保父类的构造函数被正确执行，并设置了 `sex` 属性。
    
3.  设置原型和构造器：通过 `Object.create(Person.prototype)` 创建了一个新对象，这个对象的原型指向 `Person.prototype`，然后将这个对象赋值给 `Student.prototype`以建立原型链继承。接着，将 `Student.prototype.constructor`设置为 `Student`，以保证实例的 `constructor` 属性正确指向`Student`。
    

代码实现：

```
// 定义Person构造函数function Person(sex){  this.sex = sex;}// 定义Person的getSex实例方法Object.defineProperty(Person.prototype,'getSex',{  value:function(){    console.log('获取性别',this.sex);    return this.sex;  },  enumerable:false})// 定义Student构造函数function Student(name,age,grade,sex){  // 显式调用父类的构造函数  Person.call(this,sex);  this.name = name;  this.age = age;  this.grade = grade;}// 建立继承关系，设置Student的原型为Person的prototypeStudent.prototype = Object.create(Person.prototype);// 设置构造器指向，确保 intanceof 运算符能正确识别实例Student.prototype.constructor = Student;Object.defineProperty(Student.prototype,'displayInfo',{  value:function(){    console.log(`Name: ${this.name}, Age: ${this.age}, Grade: ${this.grade}`);  },  enumerable:false,// 类中的函数是不可枚举的})Object.defineProperty(Student,  'compareAge',function(student1,student2){     if (student1.age > student2.age) {        console.log(`${student1.name} is older than ${student2.name}.`);      } else if (student1.age < student2.age) {        console.log(`${student1.name} is younger than ${student2.name}.`);      } else {        console.log(`${student1.name} and ${student2.name} are of the same age.`);      }  })
```

再考虑一个问题：

实现继承关系时，`Student.prototype = Object.create(Person.prototype);` `Object.create` 的为什么是`Person.prototype` 而不是 `Person`。原因在于 `JavaScript` 的原型继承机制。`Object.create()` 方法创建一个新对象，使用现有的对象来提供新创建的对象的 `__proto__`（即原型）。这意味着你想要一个新对象继承自 `Person` 类的行为（即`Person` 的方法），而这些行为是定义在 `Person.prototype` 上的，而不是 `Shape` 这个构造函数对象本身。

![](https://mmbiz.qpic.cn/mmbiz_png/MDPRplBm9ZWsTna3K2Xs2WI1zUMzqSO18BqDCI5TkJBZUeNr1FGnPsXyySU09qOVMgaJf8Hw4249wNyf2hXQLA/640?wx_fmt=png&from=appmsg)hhhh.png

前面这段逻辑有点绕，看一张图就理解了，- 总结来说：**直接实例与其构造函数原型的关系**：每个`Person`实例的`__proto__`指向`Person.prototype`，每个`Student`实例的`__proto__`指向`Student.prototype`。

*   **继承关系中的原型链**：`Student.prototype`的`__proto__`指向`Person.prototype`，使得`Student`实例可以访问`Person`原型上定义的方法。
    

总结
--

如果以上两道题我觉得能理解并正确做出来，再问一些复杂刁钻的原型链问题我觉得没必要了，学习原型链结合 `class` 一方面为了理解面向对象编程`（OOP）`，还有就是理解继承和对象创建机制以及它在一些现代 `JavaScript` 框架中的应用，更好的理解这些框架的内部工作原理。