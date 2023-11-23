> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Mg2aDU0FNY0a16leSjQX4Q)

**作者：李白不吃茶 v  原文：https://juejin.im/post/6873215243804213262**

基本上，所有 JS 数据类型都拥有这两个方法，null 除外。它们俩是位于原型链上的方法，也是为了解决 javascript 值运算与显示的问题。

`valueOf` 和 `toString` 几乎都是在出现操作符`(+-*/==><)`时被调用（隐式转换）。

toString
--------

> 返回一个表示该对象的字符串，当对象表示为文本值或以期望的字符串方式被引用时，toString 方法被自动调用。

### 1. 手动调用看看什么效果

嗯，跟介绍的一样，没骗人，全部都转成了字符串。

比较特殊的地方就是，表示对象的时候，变成`[object Object]`，表示数组的时候，就变成数组内容以逗号连接的字符串，相当于`Array.join(',')`。

```
let a = {}let b = [1, 2, 3]let c = '123'let d = function(){ console.log('fn') }console.log(a.toString())   // '[object Object]'console.log(b.toString())   // '1,2,3'console.log(c.toString())   // '123'console.log(d.toString())   // 'function(){ console.log('fn') }'
```

### 2. 最精准的类型判断

这种属于更精确的判断方式，在某种场合会比使用 `typeof` & `instanceof` 来的更高效和准确些。

```
toString.call(()=>{})       // [object Function]toString.call({})           // [object Object]toString.call([])           // [object Array]toString.call('')           // [object String]toString.call(22)           // [object Number]toString.call(undefined)    // [object undefined]toString.call(null)         // [object null]toString.call(new Date)     // [object Date]toString.call(Math)         // [object Math]toString.call(window)       // [object Window]
```

### 3. 什么时候会自动调用呢

使用操作符的时候，如果其中一边为对象，则会先调用`toSting`方法，也就是`隐式转换`，然后再进行操作。

```
let c = [1, 2, 3]let d = {a:2}Object.prototype.toString = function(){    console.log('Object')}Array.prototype.toString = function(){    console.log('Array')    return this.join(',')   // 返回toString的默认值（下面测试）}Number.prototype.toString = function(){    console.log('Number')}String.prototype.toString = function(){    console.log('String')}console.log(2 + 1)  // 3console.log('s')    // 's'console.log('s'+2)  // 's2'console.log(c < 2)  // false        (一次 => 'Array')console.log(c + c)  // "1,2,31,2,3" (两次 => 'Array')console.log(d > d)  // false        (两次 => 'Object')
```

### 4. 重写`toString`方法

既然知道了有 `toString` 这个默认方法，那我们也可以来重写这个方法

```
class A {    constructor(count) {        this.count = count    }    toString() {        return '我有这么多钱：' + this.count    }}let a = new A(100)console.log(a)              // A {count: 100}console.log(a.toString())   // 我有这么多钱：100console.log(a + 1)          // 我有这么多钱：1001
```

Nice.

valueOf
-------

> 返回当前对象的原始值。

具体功能与`toString`大同小异，同样具有以上的自动调用和重写方法。

这里就没什么好说的了，主要为两者间的区别，有请继续往下看🙊🙊

```
let c = [1, 2, 3]let d = {a:2}console.log(c.valueOf())    // [1, 2, 3]console.log(d.valueOf())    // {a:2}
```

两者区别
----

*   共同点：在输出对象时会自动调用。
    
*   不同点：**默认返回值不同，且存在优先级关系**。
    

二者并存的情况下，在**数值**运算中，优先调用了`valueOf`，**字符串**运算中，优先调用了`toString`。

看代码方可知晓：

```
class A {    valueOf() {        return 2    }    toString() {        return '哈哈哈'    }}let a = new A()console.log(String(a))  // '哈哈哈'   => (toString)console.log(Number(a))  // 2         => (valueOf)console.log(a + '22')   // '222'     => (valueOf)console.log(a == 2)     // true      => (valueOf)console.log(a === 2)    // false     => (严格等于不会触发隐式转换)
```

结果给人的感觉是，如果转换为字符串时调用`toString`方法，如果是转换为数值时则调用`valueOf`方法。

但其中的 `a + '22'` 很不和谐，字符串合拼应该是调用`toString`方法。为了追究真相，我们需要更严谨的实验。

*   暂且先把 `valueOf` 方法去掉
    

```
class A {    toString() {        return '哈哈哈'    }}let a = new A()console.log(String(a))  // '哈哈哈'     => (toString)console.log(Number(a))  // NaN         => (toString)console.log(a + '22')   // '哈哈哈22'   => (toString)console.log(a == 2)     // false       => (toString)
```

*   去掉 `toString` 方法看看
    

```
class A {    valueOf() {        return 2    }}let a = new A()console.log(String(a))  // '[object Object]'    => (toString)console.log(Number(a))  // 2                    => (valueOf)console.log(a + '22')   // '222'                => (valueOf)console.log(a == 2)     // true                 => (valueOf)
```

发现有点不同吧？！它没有像上面 `toString` 那样统一规整。对于那个 `[object Object]`，我估计是从 `Object` 那里继承过来的，我们再去掉它看看。

```
class A {    valueOf() {        return 2    }}let a = new A()Object.prototype.toString = null; console.log(String(a))  // 2        => (valueOf)console.log(Number(a))  // 2        => (valueOf)console.log(a + '22')   // '222'    => (valueOf)console.log(a == 2)     // true     => (valueOf)
```

总结：`valueOf`偏向于运算，`toString`偏向于显示。

1.  在进行对象转换时，将优先调用`toString`方法，如若没有重写 `toString`，将调用 `valueOf` 方法；如果两个方法都没有重写，则按`Object`的`toString`输出。
    
2.  在进行**强转字符串类型**时，将优先调用 `toString` 方法，强转为数字时优先调用 `valueOf`。
    
3.  使用运算操作符的情况下，`valueOf`的优先级高于`toString`。
    

[Symbol.toPrimitive]
--------------------

> MDN：Symbol.toPrimitive 是一个内置的 Symbol 值，它是作为对象的函数值属性存在的，当一个对象转换为对应的原始值时，会调用此函数。

是不是有点懵？？？把它当做一个函数就行了~~

*   作用：同`valueOf()`和`toString()`一样，但是**优先级要高于这两者**；
    
*   该函数被调用时，会被传递一个字符串参数
    
    ```
    hint
    ```
    
    ，表示当前运算的模式，一共有三种模式：
    

*   string：字符串类型
    
*   number：数字类型
    
*   default：默认
    

下面来看看实现吧：

```
class A {    constructor(count) {        this.count = count    }    valueOf() {        return 2    }    toString() {        return '哈哈哈'    }    // 我在这里    [Symbol.toPrimitive](hint) {        if (hint == "number") {            return 10;        }        if (hint == "string") {            return "Hello Libai";        }        return true;    }}const a = new A(10)console.log(`${a}`)     // 'Hello Libai' => (hint == "string")console.log(String(a))  // 'Hello Libai' => (hint == "string")console.log(+a)         // 10            => (hint == "number")console.log(a * 20)     // 200           => (hint == "number")console.log(a / 20)     // 0.5           => (hint == "number")console.log(Number(a))  // 10            => (hint == "number")console.log(a + '22')   // 'true22'      => (hint == "default")console.log(a == 10)     // false        => (hint == "default")
```

比较特殊的是 (+) 拼接符，这个属于`default`的模式。

**划重点：此方法不兼容 IE，尴尬到我不想写出来了~~**

面试题分析
-----

以下几道大厂必考的面试题，完美呈现出 `toString` 与 `valueOf` 的作用。

### 1. a===1&&a===2&&a===3 为 true

双等号 (==)：会触发`隐式类型转换`，所以可以使用 `valueOf` 或者 `toString` 来实现。

每次判断都会触发`valueOf`方法，同时让`value+1`，才能使得下次判断成立。

```
class A {    constructor(value) {        this.value = value;    }    valueOf() {        return this.value++;    }}const a = new A(1);if (a == 1 && a == 2 && a == 3) {    console.log("Hi Libai!");}
```

全等 (===)：严格等于不会进行`隐式转换`，这里使用 `Object.defineProperty` 数据劫持的方法来实现

```
let value = 1;Object.defineProperty(window, 'a', {    get() {        return value++    }})if (a === 1 && a === 2 && a === 3) {    console.log("Hi Libai!")}
```

上面我们就是劫持全局`window`上面的`a`，当`a`每一次做判断的时候都会触发`get`属性获取值，并且每一次获取值都会触发一次函数实行一次自增，判断三次就自增三次，所以最后会让公式成立。

*   注：`defineProperty` 可参考这篇文章学习，点我进入传送门
    
*   自：大厂面试题分享：如何让 (a===1&&a===2&&a===3) 的值为 true?
    

### 2. 实现一个无限累加函数

问题：用 JS 实现一个无限累加的函数 `add`，示例如下：

```
add(1); // 1add(1)(2);  // 3add(1)(2)(3)； // 6add(1)(2)(3)(4)； // 10 // 以此类推function add(a) {    function sum(b) { // 使用闭包        a = b ? a + b : a; // 累加        return sum;    }    sum.toString = function() { // 只在最后一次调用        return a;    }    return sum; // 返回一个函数}add(1)              // 1add(1)(2)           // 3add(1)(2)(3)        // 6add(1)(2)(3)(4)     // 10
```

*   `add`函数内部定义`sum`函数并返回，实现连续调用
    
*   `sum`函数形成了一个闭包，每次调用进行累加值，再返回当前函数`sum`
    
*   `add()`每次都会返回一个函数`sum`，直到最后一个没被调用，默认会触发`toString`方法，所以我们这里重写`toString`方法，并返回累计的最终值`a`
    

这样说才能理解:

`add(10)`: 执行函数`add(10)`，返回了`sum`函数，注意这一次没有调用`sum`，默认执行`sum.toString`方法。所以输出`10`；

`add(10)(20)`: 执行函数`add(10)`，返回 sum(此时 a 为 10)，再执行`sum(20)`，此时`a为30`，返回`sum`，最后调用`sum.toString()`输出`30`。add(10)(20)...(n) 依次类推。

### 3. 柯里化实现多参累加

这里是上面累加的升级版，实现多参数传递累加。

```
add(1)(3,4)(3,5)    // 16add(2)(2)(3,5)      // 12function add(){    // 1 把所有参数转换成数组    let args = Array.prototype.slice.call(arguments)    // 2 再次调用add函数，传递合并当前与之前的参数    let fn = function() {        let arg_fn = Array.prototype.slice.call(arguments)        return add.apply(null, args.concat(arg_fn))    }    // 3 最后默认调用，返回合并的值    fn.toString = function() {        return args.reduce(function(a, b) {            return a + b        })    }    return fn}// ES6写法function add () {    let args = [...arguments];    let fn = function(){        return add.apply(null, args.concat([...arguments]))    }     fn.toString = () => args.reduce((a, b) => a + b)    return fn;}
```

总结
--

小白写文，如写得不好，还请给个建议~~ 如果对你有帮助的话，还请点个赞~~

点赞、在看、转发 支持作者❤️