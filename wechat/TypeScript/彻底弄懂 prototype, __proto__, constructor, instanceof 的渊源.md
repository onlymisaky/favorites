> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/5Pc7tuAyUGeMn7-ws0wBcA)

关注「前端问问」，扫码入群，不懂就问👆        

说起 JavaScript 的原型链，有一张上古神图

![](https://mmbiz.qpic.cn/mmbiz_jpg/hM5HtkzgLYbASU7muh558u7Sd9ziau8sSfVFnP3TPaLZ7YCx4qWbWibmFplR7AspKPKVbLEIpvHndJFnve5ljcgw/640?wx_fmt=jpeg)

（上图来自 JavaScript Object Layout）

从图中的关系说起
--------

函数两组、对象三组再加上衍生的两组，图中一共 7 组关系

先看函数：

```
/**
 * 函数的两组关系
 */
function Cat() {}
// 第零组关系
// 实例的constructor 是 构造函数
new Cat().constructor === Cat
// 构造函数的constructor 是 创建构造函数的东西
Cat.constructor === Function

// 第一组关系：实例的__proto__ 指向 构造函数的prototype
// 这组很容易记住，想想原型链继承的关键操作
new Cat().__proto__ === Cat.prototype
// 第二组关系：构造函数的prototype的constructor 还是自身
Cat.prototype.constructor === Cat
```

接着看对象：

```
/**
 * 对象的三组关系
 */
// 第一组关系仍然成立
new Object().__proto__ === Object.prototype
// 第二组关系仍然成立
Object.prototype.constructor === Object
// 第三组关系：Object的prototype的__proto__ 是 null
Object.prototype.__proto__ === null
```

最后是衍生的：

```
/**
 * 衍生的两组关系
 */
// 第四组关系：构造函数是new Function得到的
// 所以 构造函数的__proto__ 指向 Function的prototype
Cat.__proto__ === Function.prototype
// 同上
Object.__proto__ === Function.prototype
// 第五组关系：本来也应该同上，太变态了单独拿出来
// Function也是new Function得到的！！
// Function.constructor === Function 也就是说Function的构造函数是它自己，所以
// Function的__proto__ 指向 Function的prototype
Function.__proto__ === Function.prototype
// 第六组关系：Function的prototype的__proto__ 是 Object的prototype
Function.prototype.__proto__ === Object.prototype
```

怎么理解 prototype、__proto__、constructor 的三角关系？
-------------------------------------------

这么理解：

*   构造函数是创建实例的机器
    
*   **实例在创建过程中能获得什么属性，取决于机器藏了哪些属性**
    
*   这坨属性藏在构造函数的`prototype`属性上（称之为原型对象）
    
*   在`new`实例的时候，给实例挂上`__proto__`让实例能顺藤摸瓜找到这坨属性
    

特殊的：

*   构造函数与其`prototype`有双向关系，反向指回来的属性叫`constructor`
    

怎么区分 prototype 和__proto__？
--------------------------

本质上，**关键区别只有一点：给谁用**

*   `prototype`是给实例用的原型对象，只有构造函数有`prototype`
    
*   `__proto__`是指向自己原型对象的属性，所有对象都有`__proto__`
    
*   `x.prototype` 与 `x.__proto__` 的区别是 前者是给实例用的（不`new x`它就没啥用），后者是自己要用的
    

二者都是跟原型打交道，那名字怎么区分呢？

*   `prototype`是藏了一坨给（子类）实例用的属性，称之为**原型对象**
    
*   `__proto__`串起来了原型链，姑且称之为**原型**
    

instanceof 是怎么判别实例与类（构造函数）的关系的？
-------------------------------

**MDN 有句话特别准确地说清楚了`instanceof`**：

> The instanceof operator tests to see if the prototype property of a constructor appears anywhere in the prototype chain of an object.

（摘自 instanceof）

不翻译了，改一个字都显得多余。按这句话，我们就能自己实现一个`instanceof`了：

```
function insOf(obj, Ctor) {
  let proto = obj;

  // while (proto = obj.__proro__) {
  while (proto = Object.getPrototypeOf(proto)) {
    if (Ctor.prototype === proto) {
      return true;
    }
  }
  return false;
}

// Case 1
class A {}
insOf(new A(), A)
// Case 2
function Cat() {}
insOf(new Cat(), Cat)
insOf(new Cat(), Object)
```

稍微深究一下 constructor 和继承
----------------------

第零组关系中，我们知道实例的`constructor` 是 构造函数：

```
// 实例的constructor 是 构造函数
new Cat().constructor === Cat
```

**那实例的`constructor`属性是从哪来的？**

没错，是在`new Cat()`创建实例的时候，从构造函数的原型对象上抄过来的：

```
new Cat().constructor === Cat.prototype.constructor
```

所以，在经典的 ES5 继承里：

```
function extend(Sub, Super) {
  // 1.把Super.prototype包进一个匿名对象的原型，返回这个匿名对象
  var proto = Object.create(Super.prototype);
  // 2.修正constructor属性
  proto.constructor = Sub;
  // 3.让子类实例获得匿名对象原型属性的访问权
  Sub.prototype = proto;
}
```

**改不改`constructor`指向，并不影响`instanceof`操作符的判断结果，改过来只是为了让`constructor`属性值变正确**：

```
// 如果不改constructor，子类实例的constructor仍然是A，而不是B
function Sub() {}
function Super() {}
var proto = Object.create(Super.prototype);
Sub.prototype = proto;
// 这就会显得很奇怪（实例的constructor不是构造函数了）
new Sub().constructor !== Sub;
// 所以，改过来
proto.constructor = Sub;
// 正常了
new Sub().constructor === Sub;
```

一些冷知识
-----

### 1. 箭头函数没有原型对象（所以箭头函数不能用做构造函数）

```
(() => 1).prototype === undefined
```

### 2. 原生对象的原型就不要深究了，不太确定

```
Math.__proto__ === Object.prototype
Math.max.__proto__ === Function.prototype
Window.__proto__ === EventTarget
console.__proto__ === ?
```

### 3. 比较函数的`prototype`有什么作用？

npm 下载量很高的`is`模块中，有一行上古代码：

```
if (type === '[object Function]') {
  return value.prototype === other.prototype;
}
```

你没有看错，他比较了两个函数的`prototype`，以此为据判函数的相等性，随便一想也知道不太靠谱，比如：

```
(x => x).prototype === (x => x + 1).prototype === undefined
```

所以呢我就问库作者了，几个回合下来，发现比较`prototype`能用来判构造函数 / Class 是否相同（但注意`prototype`是可篡改的）：

```
class Dog {}
class Cat {}
function Button() {}
function Panel() {}
Dog.prototype !== Cat.prototype
Button.prototype !== Panel.prototype
```

如果函数不是构造函数或 Class，比较`prototype`就毫无意义，类库里比较函数的`prototype`在 OOP 不怎么盛行的 JS 里作用十分有限

支持原创      

点👍 + 在看👀是对原创最大的支持（对文中内容感兴趣，可直接微信联系作者 ayqywx ）