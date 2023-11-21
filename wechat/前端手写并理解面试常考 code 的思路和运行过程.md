> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Z9tiY0bbpwmEqLEtKmDWOg)

> 前言

> 关于技术，只有不停重复学习，方能如扎如稳的前行。

```
大厂技术  高级前端  Node进阶


点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群
```

1. 函数柯里化
--------

函数柯里化的是一个为多参函数实现递归降解的方式。其实现的核心是:

1.  要思考如何缓存每一次传入的参数
    
2.  传入的参数和目标函数的入参做比较
    

这里通过闭包的方式缓存参数，实现如下：

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1I8DyuibDYotAreBFfZh7AJnqRP5libFzPsNMCtrzleFicekd6mYyYyqmQ/640?wx_fmt=png)

使用方式如下：![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD11NqFMBHNTwBKicVcTW4XXRwyl0X0rgwHG6Xy8fGficRjFu2JmufstnwA/640?wx_fmt=png)

> 函数柯里化仅仅只是上面求和的这种运用吗？？

👆这个问题，有必要去🤔一下。其实利用函数柯里化这种思想，我们可以更好的实现函数的封装。

就比如有监听某一事件那么就会有移除该事件的操作，那么就可以利用柯里化的思想去封装代码了。

或者说一个输入 A 有唯一并且对应的输出 B，那么从更大的角度去思想这样的工程项目是更安全，独立的。也便于去维护。

2. 关于数组
-------

### 手写 map 方法

map() 方法根据回调函数映射一个新数组

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1M3xqMndvZJaQBGFdRuSnxWNjdmoribUJK9fzLtXVdeyFjBKAr5aGztw/640?wx_fmt=png)

### 手写 filter 方法

filter() 方法返回一个数组，返回的每一项是在回调函数中执行结果 true。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1U7yuPUgNia1JDXyW6eWZIEOqoUF7ZibBVkG8ZRuX9Y05gqgYuNS0qhyg/640?wx_fmt=png)

> filter 和 map 的区别：filter 是映射出条件为 true 的 item，map 是映射每一个 item。

### 手写 reduce 方法

reduce() 方法循环迭代，回调函数的结果都会作为下一次的形参的第一个参数。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1gic7iaN4ucQicGOFX77bMDjQJI5NWvuvARgbC25kZvVK3BbzP6FTIod9A/640?wx_fmt=png)

### 手写 every 方法

every() 方法测试一个数组内的所有元素是否都能通过某个指定函数的测试。它返回一个布尔值。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1QD6BsTRLSVotZ9p3SeGKw2fq4wA5kpK4iaAnyKXa3JTtCfUelAuQiasg/640?wx_fmt=png)

### 手写 some 方法

some() 方法测试数组中是不是至少有 1 个元素通过了被提供的函数测试。它返回的是一个 Boolean 类型的值。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD16a0Ft39emRpG0E4faZH46icAcC98uSCCaYJ72bFnwYK5nhZc5RLE7nQ/640?wx_fmt=png)

### 手写 find 方法

find() 方法返回数组中满足提供的测试函数的第一个元素的值。否则返回 undefined。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1iboEM6XWqgK4K7k9j3Xzcj30jKp3nlPRdfxWyCRUzxicRaWuAPBqDGibw/640?wx_fmt=png)

### 拉平数组

将嵌套的数组扁平化，在处理业务数据场景中是频率出现比较高的。那如何实现呢？

*   利用 ES6 语法 flat(num) 方法将数组拉平。
    

该方法不传参数默认只会拉平一层，如果想拉平多层嵌套的数组，需要传入一个整数，表示要拉平的层级。该返回返回一个新的数组，对原数组没有影响。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1RhNOlG5Dt2mJJibuJWAyj5fv6srGru0lzbXnshtxPCRFF6FMKI3Uib1A/640?wx_fmt=png)

*   利用 reduce() 方法将数组拉平。
    

利用 reduce 进行迭代，核心的思想是递归实现。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1Z6aTIwTmjsm9QeFfAryede7Dy0lDwWXyaHromthLibcR7bya9BSUxXQ/640?wx_fmt=png)

*   模拟栈实现数组拉平
    

该方法是模拟栈，在性能上相对最优解。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD14PZF9MXYIrc4SIhvNibJvGicers7rN1qN4TcmVAzRpuMCXELyt1gOKlg/640?wx_fmt=png)

3. 图片懒加载 & 惰性函数
---------------

实现图片懒加载其核心的思想就是将 img 的 src 属性先使用一张本地占位符，或者为空。然后真实的图片路径再定义一个 data-set 属性存起来，待达到一定条件的时将 data-img 的属性值赋给 src。

如下是通过`scroll`滚动事件监听来实现的图片懒加载，当图片都加载完毕移除事件监听，并且将移除 html 标签。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1a4U95DD28gx3jlbI4axsYD0a7QD8K3QIJkXNp26rqh6YKBaQSkpfLw/640?wx_fmt=png)

`scroll`滚动事件容易造成性能问题。那可以通过 `IntersectionObserver` 自动观察 img 标签是否进入可视区域。

实例化 IntersectionObserver 实例，接受两个参数：callback 是可见性变化时的回调函数，option 是配置对象（该参数可选）。

当 img 标签进入可视区域时会执行实例化时的回调，同时给回调传入一个 entries 参数，保存着实例观察的所有元素的一些状态，比如每个元素的边界信息，当前元素对应的 DOM 节点，当前元素进入可视区域的比率，每当一个元素进入可视区域，将真正的图片赋值给当前 img 标签，同时解除对其的观察。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1wBGo7ccPbLVjuG5UaYztcnfPlTOlf7ArxSGuicRJGCEmiaGrTTPMibia3A/640?wx_fmt=png)

如上是懒加载图片的实现方式。

> 值得思考的是，懒加载和惰性函数有什么不一样嘛？

我所理解的懒加载顾名思义就是需要了才去加载，懒加载正是惰性的一种，但惰性函数不仅仅是懒加载，它还可以包含另外一种方向。

惰性函数的另一种方向是在重写函数，每一次调用函数的时候无需在做一些条件的判断，判断条件在初始化的时候执行一次就好了，即下次在同样的条件语句不需要再次判断了，比如在事件监听上的兼容。

4. 预加载
------

预加载顾名思义就是提前加载，比如提前加载图片。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD14S65BXcYcicf240wEW0LLiaMyAPD3Fpaukq6BkPicSHTRYFiauHEacOtcA/640?wx_fmt=png)

当用户需要查看时，可直接从本地缓存中取。预加载的优点在于如果一张图片过大，那么请求加载图片一定会慢，页面会出现空白的现象，用户体验感就变差了，为了提高用户体验，先提前加载图片到本地缓存，当用户一打开页面时就会看到图片。

5. 节流 & 防抖
----------

针对高频的触发的函数，我们一般都会思考通过节流或者防抖去实现性能上的优化。

节流实现原理是通过定时器以和时间差做判断。定时器有延迟的能力，事件一开始不会立即执行，事件结束后还会再执行一次；而时间差事件一开始就立即执行，时间结束之后也会立即停止。

结合两者的特性封装节流函数：

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1iaKiarEsMQIkfxpPTaY3jrJTyv5ic2hPsiaxE3dOuB4eqpOJN130aQtCiaw/640?wx_fmt=png)

函数节流不管事件触发有多频繁，都会保证在规定时间内一定会执行一次真正的事件处理函数。

防抖实现原理是通过定时器，如果在规定时间内再次触发事件会将上次的定时器清除，即不会执行函数并重新设置一个新的定时器，直到超过规定时间自动触发定时器中的函数。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD16oicZRq8US4boED57BU5WF06pp3WlraOeyI69YkesMPnYkJA9EQqHEg/640?wx_fmt=png)

6. 实现 new 关键字
-------------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1p2Bu3rIatz2kpEFBSPnKa9ibYfOWDkmtVvzyEZzP5M8tIKicqUicQNqcw/640?wx_fmt=png)

7. 实现 instanceof
----------------

instanceof 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1p3CAtMicP4oiaicXPCjoQ6X6kiasAjZeXI4AiawFaiboDTyQv4X4xJW7xrJQ/640?wx_fmt=png)

8. 实现 call，apply，bind
---------------------

*   call
    

call 函数实现的原理是借用方法，关键在于隐式改变`this`的指向。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1ticcl9dMicHM0XH7mUVM1A6lo1I7pWo6mEzw9TRparDyw57nicxxh0omg/640?wx_fmt=png)

*   apply
    

apply 函数实现的原理和 call 是相同的，关键在于参数的处理和判断。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1u6Tiazy3sjLR7hU0gg7sfbHLmBatASY7xHBwTlJCerc2AtJEb8N0CJQ/640?wx_fmt=png)

> call() 方法的作用和 apply() 方法类似，区别就是 call() 方法接受的是参数列表，而 apply() 方法接受的是一个参数数组。

*   bind
    

bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。

实现的关键思路：

1.  拷贝保存原函数，新函数和原函数原型链接
    
2.  生成新的函数，在新函数里调用原函数
    

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1tcI9bfVbvpKo2WezSicdNL5VadUvTVvqCtnRBJibyJboEO31PuzVSdicw/640?wx_fmt=png)

9. 封装数据类型函数
-----------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1YK687hTXU0RZopIDnT5ibyawibj94HcCcPUHw4qfbuDgTlQd9V4nAUkg/640?wx_fmt=png)

10. 自记忆函数
---------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD11dZ8Vy75sqWsouAGELVUKBNavyJibgkjuJFusZz6pZ9YRxa1l8ahic7w/640?wx_fmt=png)

11. 是否存在循环引用
------------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1biaAWIKLpPCKUe6pD7R7APMUk8IQYaDuXibhQLCDhLZuYLjwpib5s18SQ/640?wx_fmt=png)

12. 拷贝函数
--------

拷贝数据一直是业务开发中绕不开的技巧，对于深浅拷贝数据之前写过一篇文章来讲述聊聊深拷贝浅拷贝。

*   通过深度优先思维拷贝数据（DFS）
    

深度优先是通过纵向的维度去思考问题，在处理过程中也考虑到对象环的问题。

解决对象环的核心思路是先存再拷贝。一开始先通过一个容器用来储存原来的对象再进行拷贝，在每一次拷贝之前去查找容器里是否已存在该对象。这样就切断了原来的对象和拷贝对象的联系。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1ua8R50QicQ5kGKdsC5csxUib6e7fzFfkmibHPsEr3Hel5Ll78vaty1jMw/640?wx_fmt=png)

*   通过广度优先思维拷贝数据（BFS）
    

广度优先是通过横向的维度去思考问题，通过创造源队列和拷贝数组队列之间的关系实现拷贝。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD105aiavtWiarZ3UicOpCqTFzmWLS3adfxvI31twxibUyTXPnusQul83vQaQ/640?wx_fmt=png)

13.Promise 系列
-------------

之前写过一篇关于 Promise 的学习分享。

### Promsie.all

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1KXWlrNibrE27PHBbqotlw69dXvVJJTu7gNr7PHzTWQzltP8F3tds9Qg/640?wx_fmt=png)

### Promsie.race

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1laJ6NTnNjmZwpaKB0vibJEcaP1vS4tHjHBnCkibwD7TLkbmIReiazxWjw/640?wx_fmt=png)

### Promsie.finally

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1qE9rLEFIibb0ePyhRiaEWEgNfPn3w8ypV9Acr7Ggd5ZgLUzhJAV12hYA/640?wx_fmt=png)

14. 实现 async-await
------------------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1Lh4fkkoZP26hXUjVqjiajbMn9U4FZ3arl4FTqEea9Nibwvht8iaiaXYnLA/640?wx_fmt=png)

15. 实现简易订阅 - 发布
---------------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1mTOWqEpjXdNByvcFRNfE7ET6cK3ycGCKbIkibPvRQYPlETlq3B8rUTA/640?wx_fmt=png)

16. 单例模式
--------

单例模式：保证一个类仅有一个实例，并提供一个访问它的全局访问点。实现方法一般是先判断实例是否存在，如果存在直接返回，如果不存在就先创建再返回。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1HvbzpeykViatzCl4Q0rdSFSYMGqpmkrUD5bMMZZy1ziahggPQoRbTYNg/640?wx_fmt=png)

17. 实现 Object.create
--------------------

Object.create() 方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1a8c27hSYxol8ZiaPJVSZpajVZITBB0RKG9zv1hLNXiaD97SFQpAgsNkg/640?wx_fmt=png)

该方法是实现了已有对象和新建对象的原型是一个浅拷贝的过程。

18. 实现 ES6 的 class 语法
---------------------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1PApXW1HMPEibqsoulcnDDZ7xmoXK4oc6GqBqibmP9mEdqWq43SGe3chg/640?wx_fmt=png)

使用 Object.create() 方法将子类的实例对象继承与父类的原型对象，通过 Object.setPrototypeOf() 能够实现从父类中继承静态方法和静态属性。

19. 实现一个 compose 函数
-------------------

compose 函数是用来组合合并函数，最后输出值的思想。在 redux 源码中用于中间件的处理。

*   使用 while 循环实现
    

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD12OticjaUEnV8ubctoULr0Gbge45KN1KnDt0sIW8YHWPu3Eicia86zgUrA/640?wx_fmt=png)

*   使用 reduce 迭代实现
    

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD10Tu7bG2DAHUw8oAZz2g3P8M9vy71ytxpWG4diczv8icVPAdLrKhZicSeg/640?wx_fmt=png)

20. 实现异步并行函数
------------

fn 是一个返回 Promise 的函数才可使用下面的函数：

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1RLKictWov80Tgka3KFpp943Qf6AJeiaHb0gmop0HfueuWT5hoghgOhGg/640?wx_fmt=png)

fn 不是一个返回 Promsie 的话那就包一层：

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1CV6AG22Rq2XB7xqJIrmTuTKJySXIDsnGot8LZEMnhu2EJEzsuZvKAA/640?wx_fmt=png)

21. 实现异步串行函数
------------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1ytN7nFUCUualslUGMBYMxPOlIsFbOBwvXXUJTPrfKX9FW9c1IjibNzw/640?wx_fmt=png)

22. 私有变量的实现
-----------

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1AljN9mHbNfOI6oxRqcQtKql3A3riaVMmlNj2m59lY2picibjepYHoaFBQ/640?wx_fmt=png)

以上是 es5 实现的私有变量的封装，通过使用 WeakMap 可以扩展每个实例所对应的私有属性，私有属性在外部无法被访问，而且随 this 对象的销毁和消失。

这里有个小细节值得一提, 请看如下的代码：

![](https://mmbiz.qpic.cn/mmbiz_png/5Xv0xlEBe9ibEn1a1HPrJOicys03qwnrD1ibGWZeRBaKIcQcpjDlzW44vCMLjavYADgJJ09SribWaGtC5WLRtMaM7g/640?wx_fmt=png)

如上是挂在到原型上的方法和每个实例独有的方法不同写法。它们有什么区别呢？（ps: 可以手动打印）

调用原型上的方法那么私有变量的值是与最近一个实例调用原型方法的值。其上一个实例的值也是随之改变的，那么就出现问题了...

而使用 WeakMap 可以解决如上的问题：做到将方法挂在到原型，且不同时期同一个实例调用所产生的结果是一致的。

我一直认为有输入就得有输出，那总结就是最好的输出方式了。因此有了一篇这样的文章，希望读者能静下来去手写并理解 code 的思路和运行过程，我想也会对 js 有更深入的理解。

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍
```