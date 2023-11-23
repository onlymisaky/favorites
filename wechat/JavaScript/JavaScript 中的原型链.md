> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/SoCVCPq1UraAES_iIarC4Q)

> 本文作者为奇舞团前端开发工程师

概述
--

JavaScript 是 Web 的编程语言，简单易学，功能强大，但由于过于灵活设计理念，导致初学者经常一脸懵，本文要谈的是 JavaScript 中难点之一原型链。

原型链的前世
------

### JavaScript 的诞生

要理解 Javascript 的原型链的设计思想，必须从它的诞生说起。

1994 年，网景公司（Netscape）发布了 Navigator 浏览器 0.9 版。这是历史上第一个比较成熟的网络浏览器，当时轰动一时。但是这个版本的浏览器只能用来浏览，不具备与访问者互动的能力。比如，如果网页上有一栏 "用户名" 要求填写，浏览器就无法判断访问者是否真的填写了，只能让客户端将网页全部传回服务端，让服务器端判断是否填写。如果没有填写，服务器端就返回错误，要求用户重新填写，这太浪费时间和服务器资源了。

因此，网景公司急需一种网页脚本语言，使得浏览器可以与网页互动。工程师 Brendan Eich 负责开发这种新语言。他觉得，没必要设计得很复杂，这种语言只要能够完成一些简单操作就够了，比如判断用户有没有填写表单。

1994 年正是面向对象编程（object-oriented programming）最兴盛的时期，C++ 是当时最流行的语言，而 Java 语言的 1.0 版即将于第二年推出，Sun 公司正在大肆造势。

Brendan Eich 无疑受到了影响，**Javascript 里面所有的数据类型都是对象（object）** ，这一点与 Java 非常相似。但是，他随即就遇到了一个难题，到底要不要设计 "继承" 机制呢？

JavaScript 是一门脚本语言，是为了操作网页的，如果只将其作为简易的脚本语言，其实不需要有 "继承" 机制。但是 Javascript 里面都是对象，必须有一种机制，可以将对象之间关联起来。所以 Brendan Eich 最后还是设计了 "继承"。

但是他不打算引入 "类"（class）的概念，因为一旦有了 "类"，Javascript 就是一种完整的面向对象编程语言了，这好像有点太正式了，Brendan Eich 考虑到 C++ 和 Java 语言都使用 new 命令生成实例。

C++ 的写法是：

```
ClassName *object = new ClassName();
```

Java 的写法是：

```
ClassName object = new ClassName();
```

因此，他把 new 命令引入了 Javascript，用来从类（JavaScript 中叫原型对象）生成一个实例对象。但是 Javascript 没有 "类"，怎么来表示类（原型对象）呢？

这时，他想到 C++ 和 Java 使用 new 命令时，都会调用 "类" 的构造函数（constructor）。他就做了一个简化的设计，在 Javascript 语言中，new 命令后面跟的不是类，而是构造函数。

举例来说，现在有一个叫做 Person 的构造函数，表示人对象的原型（可以理解成 java 中的类）。

```
Object.prototype.__proto__ === null;
Array.prototype.__proto__ === Object.prototype;
```

对这个构造函数使用 new，就会生成一个人对象的实例。

```
var pA = new Person('老王');

alert(pA.name); // 老王
```

注意构造函数中的 _**this 关键字**_，它就代表了新创建的实例对象。

### prototype 属性的由来

对于面向对象编程语言比如 java 或者 c++ 来说，用构造函数生成实例对象是无法共享属性和方法，都有其独立的内存区域，互不影响。

比如，在 Person 对象的构造函数中，设置一个实例对象的共有属性 race。

```
function Person(name){

    this.name = name;

     this.race = '汉族';

}
```

然后，生成两个实例对象：

```
var pA = new Person('老王');
var pB = new Person('老张');
```

这两个对象的 race 属性是独立的，修改其中一个，不会影响到另一个。

```
pA.species = '苗族';
alert(pB.species); // 显示"汉族"，不受pA的影响
```

每一个实例对象，都有自己的属性和方法的副本。

按前面 new 运算符所述，每一个实例对象，都有自己的属性和方法的副本。但此时如果我们想在同类但不同对象间共享数据（继承）怎么办呢，解决此问题的方法就是 prototype。

考虑到共享数据的问题，Brendan Eich 决定为 JavaScript 的构造函数设置一个 prototype 属性。

这个属性包含一个对象（以下简称 "prototype 对象"），所有实例对象需要共享的属性和方法，都放在这个对象里面；那些不需要共享的属性和方法，就放在构造函数里面。这里 prototype 对象有点像 C++ 基类。

实例对象一旦创建，将自动引用 prototype 对象的属性和方法。也就是说，实例对象的属性和方法，分成两种，一种是本地的，另一种是引用的。

还是以 Person 构造函数为例，现在用 prototype 属性进行改写：

```
function Person(name){

  this.name = name;

}

Person.prototype = { race : '汉族' };


var pA = new Person('老王');

var pB = new Person('老张');


alert(pA.race); // 汉族

alert(pB.race); // 汉族
```

现在，race 属性放在 prototype 对象里，是两个实例对象共享的。只要修改了 prototype 对象，就会同时影响到两个实例对象。

```
Person.prototype.race = '苗族';
alert(pA.race); // 苗族
alert(pB.race); // 苗族
```

综上所述，由于所有的实例对象共享同一个 prototype 对象，那么从外界看起来，而实例对象则好像 "继承" 了 prototype 对象一样。

这就是 Javascript 继承机制的设计思想。

### 重写 prototype 属性、方法

用过 java、c++ 类语言的都知道，既然有继承，必然有重写。举例说明 JavaScript 的重写

```
Person.prototype.hairColor = 'black';
Person.prototype.eat = function(){
    console.log('Person eat')
}
console.log(pA)
console.log(pB)
```

控制台输出：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLKaSvlnpnTn5TqdBC5AxPFtTicPib02hmv3mDFbVlL5cM08FT9eGQNheoDjFzdCukvP5cyzibOK9qA/640?wx_fmt=png)

此时我们打印 pA、pB，我们惊喜的发现，他们有了属性 hairColor 和 eat 方法；实例动态的获得了 Person 构造函数之后添加的属性、方法，这就是原型意义所在！**可以动态获取，这样可以节省内存。**

另外我们还要注意：如果 pA 将头发染成了黄色，那么 hairColor 会是什么呢？

```
pA.hairColor = 'yellow'；
console.log(pA)
console.log(pB)
```

控制台输出：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLKaSvlnpnTn5TqdBC5AxPAIIYVpZQFBNjtWaC7J7QXJ55WshH5icHQHQZeRzkZYnkcXAvPWf7tEg/640?wx_fmt=png)

可以看到，pA 的 hairColor = 'yellow'， 而 pB 的 hairColor = 'black'；实例对象重写原型上继承的属性、方法，相当于 **“属性覆盖、属性屏蔽”** ，这一操作不会改变原型上的属性、方法，自然也不会改变由统一构造函数创建的其他实例，只有修改原型对象上的属性、方法，才能改变其他实例通过原型链获得的属性、方法。

继承与原型链
------

JavaScript 中一切皆对象。每个实例对象都有一个私有属性，称之为 **proto**，指向它的构造函数的原型对象（**prototype**）。该原型对象也有一个自己的原型对象（**proto**），层层向上直到一个对象的原型对象为 null。根据定义，null 没有原型，并作为这个**原型链**中的最后一个环节。

*   原型链的经典图：
    

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLKaSvlnpnTn5TqdBC5AxPjYlZP7jolNjjRvwE4JjbPL3fQSq1sIEaGqqQPdC58E7URvJicdVZKhA/640?wx_fmt=png)

这张图详细的描述了构造函数 Function，Object 以及它们实例之间的原型关系。

**首先得记住并理解几个概念**

1.  属性__proto__是一个对象，它有两个属性，constructor 和__proto__；
    
2.  原型对象 prototype 有一个默认的 constructor 属性，用于记录实例是由哪个构造函数创建；
    
3.  除了 Object 的原型对象（Object.prototype）的__proto__指向 null，其他内置函数的原型对象和自定义构造函数的原型对象的 __proto__都指向 Object.prototype
    
      
    

```
Object.prototype.__proto__ === null;
Array.prototype.__proto__ === Object.prototype;
```

  
  

结合一张 pB 对象的结构图看就更容易理解了：

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEDLKaSvlnpnTn5TqdBC5AxPTYfjmvhPqtmiaAsEAADKNNWjzqNEvZJg5eXVOCdX0hpDgsibAm98UAhA/640?wx_fmt=png)

创建对象的方法
-------

### 使用语法结构创建

```
var p = {name: "老三"};

// p 这个对象继承了 Object.prototype 上面的所有属性
// Object.prototype 的原型为 null
// 此对象原型链如下：
// p ---> Object.prototype ---> null

var arr = [1,2,3,4,5];
// 数组都继承于 Array.prototype
// 原型链如下：
// arr ---> Array.prototype ---> Object.prototype ---> null
```

### 使用构造器创建

在 JavaScript 中，构造器其实就是一个普通的函数。当使用 new 操作符 来作用这个函数时，它就可以被称为构造方法（构造函数）。

```
function Animal(name,age) {
  this.name = name;
  this.age = age;
}

Animal.prototype.eat = function(){
    console.log('Animal eat')
};

var a = new Animal("cat",1);
// a 是生成的对象，他的自身属性有 'name' 和 'age'。
// 在 a 被实例化时，a.__proto__ 指向了 Animal.prototype。
```

### 使用 Object.create 创建

ECMAScript 5 中引入了一个新方法：Object.create()。可以调用这个方法来创建一个新对象。新对象的原型就是调用 create 方法时传入的第一个参数：

```
var a = {name: "老三"};
// a ---> Object.prototype ---> null
var b = Object.create(p);
// b ---> p ---> Object.prototype ---> null
console.log(b.name); // 老三 (继承而来)

var c = Object.create(b);
// c ---> b ---> a ---> Object.prototype ---> null

var d = Object.create(null);
// d ---> null
console.log(d.hasOwnProperty); // undefined，因为 d 没有继承 Object.prototype
```

class 关键字
---------

ECMAScript6 引入了一套新的关键字用来实现 class。使用 java、swift 等面向对象的语言的开发人员会对这些结构感到熟悉，但它们是不同的。JavaScript 仍然基于原型。这些新的关键字包括 class, constructor，static，extends 和 super。

```
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Person extends Animal {
  constructor(name,sex) {
    super(name);
    this.sex = sex;
    this.arrs = [1,2,3,4];
  }
  
}

var pC = new Person("老王","男");
```

注意：类的本质还是一个函数，类就是构造函数的另一种写法，JavaScript 中并没有一个真正的 class 原始类型， class 、extends 仅仅只是对原型对象运用语法糖，这样便于程序员理解。

```
function Person(){}
console.log(typeof Person); //function

class Person extends Animal {
  constructor(name,sex) {
    super(name);
    this.sex = sex;
  }
  get mysex() {
    return this.sex;
  }
  set mysex(sex) {
    this.sex = sex;
  }
}

console.log(typeof Person); //function
```

参考
--

轻松理解 JS 原型原型链 https://juejin.cn/post/6844903989088092174

Javascript 继承机制的设计思想 https://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html

继承与原型链 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png)