> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/h-oZm_4o_2RcEy99UsdYKg)

大家好，我是 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect)。  

天天推送各种框架和库的，看起来也挺累的。。。今天放松一下，做几道 `JavaScript` 基础题找找自信吧！

可以先投票做题，然后翻到后面看答案。

第 1 题 — 原型
----------

```
function Animal(){   this.type = "animal"}   function Dog(){   this.name = "dog"} Dog.prototype = new Animal() var PavlovPet = new Dog();  console.log(PavlovPet.__proto__ === Dog.prototype)console.log(Dog.prototype.__proto__ === Animal.prototype)
```

`console.log` 打印出的值是？

第 2 题 — 小心 “排序”
---------------

```
var arr = [5, 22, 14, 9];console.log(arr.sort());
```

`console.log` 打印出的值是？

第 3 题 — 异步循环
------------

```
for (let i = 0; i < 3; i++) {  const log = () => {    console.log(i)  }  setTimeout(log, 100)}
```

`console.log` 打印出的值是？

第 4 题 — numbers 里面有啥？
---------------------

```
const length = 4const numbers = []for (var i = 0; i < length; i++);{  numbers.push(i + 1)} console.log(numbers)
```

`console.log` 打印出的值是？

第 5 题 — 长度为 0
-------------

```
const clothes = ['shirt', 'socks', 'jacket', 'pants', 'hat']clothes.length = 0 console.log(clothes[3])
```

`console.log` 打印出的值是？

第 6 题 — 变量定义
------------

```
var a = 1function output () {    console.log(a)    var a = 2    console.log(a)}console.log(a)output()console.log(a)
```

`console.log` 打印出的值是？

第 7 题 — 找到值了吗
-------------

```
function foo() {    let a = b = 0    a++    return a} foo()console.log(typeof a)console.log(typeof b)
```

`console.log` 打印出的值是？

第 8 题 — 类型转换
------------

```
console.log(+true)console.log(!"ConardLi")
```

`console.log` 打印出的值是？

第 9 题 — ESM
-----------

```
// module.js export default () => "Hello world"export const name = "c"// index.js import * as data from "./module"console.log(data)
```

`console.log` 打印出的值是？

第 10 题 — 对象做 key
----------------

```
const a = {};const b = { key: "b" };const c = { key: "c" };a[b] = 123;a[c] = 456;console.log(a[b]);
```

`console.log` 打印出的值是？

答题投票
----

答案 - 第 1 题
----------

把原型的基础知识记清楚这道题就错不了：

> 所有的对象都有 `[[prototype]]` 属性（通过 `_proto_` 访问），该属性对应对象的原型；所有的函数对象都有 `prototype` 属性，该属性的值会被赋值给该函数创建的对象的 `_proto_` 属性。

答案是：

```
truetrue
```

答案 - 第 2 题
----------

抱歉，答案不是 `[5, 9, 14, 22]` 。如果不传入排序函数，`sort` 函数会将每个元素转换成字符串，然后根据它们的 `UTF-16` 值排序。

答案是：

```
[14, 22, 5, 9]
```

答案 - 第 3 题
----------

这题我会，因为：

定时器是异步执行，浏览器会优先执行同步任务，在遇到定时器时会先把它们暂存在一个宏任务队列中，待当前宏任务队列的所有任务执行完毕后才会去执行队列中的任务，此时循环已执行完毕，i 已经是 3。

所以答案是：

哎不对？答案为啥不是 `3、3、3` ？

因为循环里的 `i` 是用 `let` 声明的，而不是用 `var` 声明的！

`let` 声明的变量拥有块级作用域。即在 `for` 循环或 `if` 中用 `let` 定义变量，在外面是访问不到的。

形如 `for (let i...)` 的循环在每次迭代时都为 i 创建一个新变量，并以之前迭代中同名变量的值将其初始化，所以上面的代码实际上相当于：

```
for (let i = 0) {  const log = () => {    console.log(i)  }  setTimeout(log, 100)}for (let i = 1) {  const log = () => {    console.log(i)  }  setTimeout(log, 100)}for (let i = 2) {  const log = () => {    console.log(i)  }  setTimeout(log, 100)}
```

答案 - 第 4 题
----------

要看仔细啊，看到小括号和大括号之间有个`；`吗？

答案是：

```
[5]
```

答案 - 第 5 题
----------

将数组的长度赋值为 `0` 就相当于从数组中删除所有元素。

答案是：

```
undefined
```

答案 - 第 6 题
----------

*   第一个输出：全局的 `var a`
    
*   第二个输出：`output` 函数中声明的 `var a`变量提升，还未赋值
    
*   第三个输出：`output` 函数局部作用域的 a 已赋值
    
*   第四输出：全局的 `var a` 没有变
    

答案是：

```
1undefined21
```

答案 - 第 7 题
----------

`let a` 是一个局部变量。`typeof a` 检查的是未声明的变量。

`b` 是个全局变量，它在 `foo` 函数中被赋值。

答案是：

```
undefinednumber
```

答案 - 第 8 题
----------

`+` 运算符首先会尝试将 `boolean` 类型转换为数字类型，`true` 被转换为 `1`，`false` 被转换为 `0`。

字符串 `'ConardLi'` 是一个真值，所以 `!'ConardLi'` 为 false。

答案是：

```
1false
```

答案 - 第 9 题
----------

考察下你对 `ES Module` 的认识

答案是：

```
{ default: function default(), name: "c" }
```

答案 - 第 10 题
-----------

对象能做对象的 key 吗？当然不能，两次赋值实际上是：

```
a["Object object"] = 123;a["Object object"] = 456;
```

答案是：

怎么样，找到自信了吗？💯💯💯 **全对的来这里集合！！！**

> 如果你想加入高质量前端交流群，或者你有任何其他事情想和我交流也可以添加我的个人微信 [ConardLi](https://mp.weixin.qq.com/s?__biz=Mzk0MDMwMzQyOA==&mid=2247493407&idx=1&sn=41b8782a3bdc75b211206b06e1929a58&chksm=c2e11234f5969b22a0d7fd50ec32be9df13e2caeef186b30b5d653836b0725def8ccd58a56cf&scene=21#wechat_redirect) 。

如果你有任何想法，欢迎在留言区和我留言，如果这篇文章帮助到了你，欢迎点赞和关注。

`点赞`和`在看`是最大的支持⬇️❤️⬇️