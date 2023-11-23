> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/OmPEIbEVm5CpSzwjk_WC-Q)

最近在帮女朋友复习 JS 相关的基础知识，遇到不会的问题，她就会来问我。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/gibGQibkduDnBTzTz0xPSOgfbdvBpicMXcDhc514ibAWQaxvxNibor6avzVGJ7QdIhfCWSlgtAjEmMBbiajSfxhxaWQw/640?wx_fmt=png)  

这不是很简单？三下五除二，分分钟解决。

```
function bind(fn, obj, ...arr) { return fn.apply(obj, arr)}
```

于是我就将这段代码发了过去

![](https://mmbiz.qpic.cn/sz_mmbiz_png/gibGQibkduDnBTzTz0xPSOgfbdvBpicMXcD9zgdveCZctoE3SUPoBIt0lJNeyyiaRXM33B9Io73fnRdazDTVXFZw2g/640?wx_fmt=png)  

这时候立马被女朋友进行了一连串的灵魂拷问。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/gibGQibkduDnBTzTz0xPSOgfbdvBpicMXcDFwLmicKicFcjLlL9WAWNZIe9CQrh4YaWIyZictHtyYLI55qnrhj6Alp9Q/640?wx_fmt=png)  

这个时候，我马老师就坐不住了，我不服气，我就去复习了一下 bind，发现太久不写基础代码，还是会需要一点时间复习，这一次我得写一个有深度的 bind，深得马老师的真传，给他分成了五层速记法。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/gibGQibkduDnBTzTz0xPSOgfbdvBpicMXcD9OanO7qftApAhExF1ia2ajibHTEyHkqSkTb7WbfKDo8tGO9HrAACCibuw/640?wx_fmt=jpeg)  

第一层 - 绑定在原型上的方法
---------------

这一层非常的简单，得益于 JS 原型链的特性。由于 function xxx 的原型链 指向的是 `Function.prototype` , 因此我们在调用 xxx.bind 的时候，调用的是  Function.prototype 上的方法。

```
Function.prototype._bind = function() {}
```

这样，我们就可以在一个构造函数上直接调用我们的 bind 方法啦~ 例如像这样。

```
funciton myfun(){}
myfun._bind();
```

想要详细理解这方面的可以看这张图和这篇文章（https://github.com/mqyqingfeng/blog/issues/2）

![](https://mmbiz.qpic.cn/sz_mmbiz_png/gibGQibkduDnBTzTz0xPSOgfbdvBpicMXcDFjdpncJoco73RtbcIcbmwCNx4r0TZKBAmaZJgeU8DMiaHI4wXoDyNkA/640?wx_fmt=png)  

第二层 - 改变 this 的指向
-----------------

这可以说是 bind 最核心的特性了，就是改变 this 的指向，并且返回一个函数。而改变 this , 我们可以通过已知的  apply 和 call 来实现，这里我们就暂且使用 apply 来进行模拟。首先通过 `self` 来保存当前 this，也就是传入的函数。因为我们知道 this 具有 `隐式绑定`的规则（**摘自 《你不知道的 JavaScript(上)》2.2.2** ），

```
function foo() {console.log(this.a)}var obj = {a: 2, foo};obj.foo(); // 2
```

通过以上特性，我们就可以来写我们的 _bind 函数。

```
Function.prototype._bind = function(thisObj) { const self = this; return function () {    self.apply(thisObj);  }}
```

```
var obj = {a:1}function myname() {console.log(this.a)}myname._bind(obj)(); // 1
```

可能很多朋友都止步于此了，因为在一般的面试中，特别是一些校招面试中，可能你只需要知道前面两个就差不多了。但是想要在面试中惊艳所有人，仍然是不够的，接下来我们继续我们的探索与研究。

第三层 - 支持柯里化
-----------

函数柯里化是一个老生常谈的话题，在这里再复习一下。

```
function fn(x) { return function (y) {  return x + y; }}var fn1 = fn(1);fn1(2) // 3
```

不难发现，柯里化使用了闭包，当我们执行 fn1 的时候，函数内使用了外层函数的 x， 从而形成了闭包。

而我们的 bind 函数也是类似，我们通过获取当前外部函数的  `arguments` ，并且去除了绑定的对象，保存成变量 `args`，最后 `return` 的方法，再一次获取当前函数的  `arguments`, 最终用 `finalArgs` 进行了一次合并。

```
Function.prototype._bind = function(thisObj) { const self = this;  const args = [...arguments].slice(1) return function () {    const finalArgs = [...args, ...arguments]    self.apply(thisObj, finalArgs);  }}
```

通过以上代码，让我们 bind 方法，越来越健壮了。

```
var obj = { i: 1}function myFun(a, b, c) {  console.log(this.i + a + b + c);}var myFun1 = myFun._bind(obj, 1, 2);myFun1(3); // 7
```

一般到了这层，可以说非常棒了，但是再坚持一下下，就变成了完美的答卷。

第四层 - 考虑 new 的调用
----------------

要知道，我们的方法，通过 bind 绑定之后，依然是可以通过 new 来进行实例化的， `new` 的优先级会高于 `bind`（**摘自 《你不知道的 JavaScript(上)》2.3 优先级**）。

这一点我们通过原生  bind 和我们第四层的 _bind 来进行验证对比。

```
// 原生var obj = { i: 1}function myFun(a, b, c) {  // 此处用new方法，this指向的是当前函数 myFun   console.log(this.i + a + b + c);}var myFun1 = myFun.bind(obj, 1, 2);new myFun1(3); // NAN// 第四层的 bindvar obj = { i: 1}function myFun(a, b, c) {  console.log(this.i + a + b + c);}var myFun1 = myFun._bind(obj, 1, 2);new myFun1(3); // 7
```

**注意，这里使用的是 `bind`方法**

因此我们需要在 bind 内部，对 new 的进行处理。而 `new.target` 属性，正好是用来检测构造方法是否是通过 `new` 运算符来被调用的。

接下来我们还需要自己实现一个 new ，

> 而根据 `MDN`，**`new`** 关键字会进行如下的操作：
> 
> 1. 创建一个空的简单 JavaScript 对象（即`{}`）；
> 
> 2. 链接该对象（设置该对象的 **constructor**）到另一个对象 ；
> 
> 3. 将步骤 1 新创建的对象作为`this`的上下文 ；
> 
> 4. 如果该函数没有返回对象，则返回`this`。

```
Function.prototype._bind = function(thisObj) { const self = this;  const args = [...arguments].slice(1); return function () {    const finalArgs = [...args, ...arguments];  // new.target 用来检测是否是被 new 调用    if(new.target !== undefined) {      // this 指向的为构造函数本身      var result = self.apply(this, finalArgs);      // 判断改函数是否返回对象      if(result instanceof Object) {        return reuslt;      }      // 没有返回对象就返回 this      return this;    } else {      // 如果不是 new 就原来的逻辑      return self.apply(thisArg, finalArgs);    }  }}
```

看到这里，你的造诣已经如火纯青了，但是最后还有一个小细节。

第五层 - 保留函数原型
------------

以上的方法在大部分的场景下都没有什么问题了，但是，当我们的构造函数有 prototype 属性的时候，就出问题啦。因此我们需要给 prototype 补上，还有就是调用对象必须为函数。

```
Function.prototype._bind = function (thisObj) {  // 判断是否为函数调用  if (typeof target !== 'function' || Object.prototype.toString.call(target) !== '[object Function]') {    throw new TypeError(this + ' must be a function');  }  const self = this;  const args = [...arguments].slice(1);  var bound = function () {    var finalArgs = [...args, ...arguments];    // new.target 用来检测是否是被 new 调用    if (new.target !== undefined) {      // 说明是用new来调用的      var result = self.apply(this, finalArgs);      if (result instanceof Object) {        return result;      }      return this;    } else {      return self.apply(thisArg, finalArgs);    }  };  if (self.prototype) {    // 为什么使用了 Object.create? 因为我们要防止，bound.prototype 的修改而导致self.prototype 被修改。不要写成 bound.prototype = self.prototype; 这样可能会导致原函数的原型被修改。    bound.prototype = Object.create(self.prototype);    bound.prototype.constructor = self;  }  return bound;};
```

以上就是一个比较完整的 bind 实现了，如果你想了解更多细节的实践，可以查看。（也是 MDN 推荐的）

https://github.com/Raynos/function-bind

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=MzA5NzkwNDk3MQ==&mid=2650596986&idx=1&sn=3e2b70e4a516f313d3dc0a60922eb8e8&chksm=8891f65ebfe67f48fd731f105053a589e02ddf1fbfa949f5e51ac3004cb531670f1dcfffc585&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib7CaF3RtAQ9LZVCQoBVJcib6QuKBADtIicEu8gRNg6goj3o52KbV7e5x5XoQDq6icqBjZsWRrhWsTcvg/640?wx_fmt=png)