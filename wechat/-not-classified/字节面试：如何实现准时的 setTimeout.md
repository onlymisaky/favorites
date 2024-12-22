> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/v7YJAmMhzSAFzlJXY4mXTg)

最近有同学在面试的时候被问到了这个问题。所以我们利用这篇文章对这个问题进行下解答。

背景
--

setTimeout 是**不准**的。因为 setTimeout 是一个宏任务，它的指定时间指的是：**进入主线程的时间。**

```
setTimeout(callback, 进入主线程的时间)<br style="visibility: visible;">
```

所以什么时候可以执行 callback，需要看 **主线程前面还有多少任务待执行**。

由此，才有了这个问题。

我们可以通过这个场景来进行演示：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8YSEYhOEdU3uPAwSXicib83oNloV139F6uMbNXcCjbvwLlce3PNH4Rx1g/640?wx_fmt=gif)

运行代码如下，通过一个计数器来记录每一次 setTimeout 的调用，而设定的间隔 * 计数次数，就等于理想状态下的延迟，通过以下例子来查看我们计时器的准确性

```
function timer() {    var speed = 50, // 设定间隔    counter = 1,  // 计数    start = new Date().getTime();        function instance()    {     var ideal = (counter * speed),     real = (new Date().getTime() - start);          counter++;     form.ideal.value = ideal; // 记录理想值     form.real.value = real;   // 记录真实值      var diff = (real - ideal);     form.diff.value = diff;  // 差值      window.setTimeout(function() { instance(); }, speed);    };        window.setTimeout(function() { instance(); }, speed); } timer();
```

而我们如果在 setTimeout 还未执行期间加入一些额外的代码逻辑，再来看看这个差值。

```
... window.setTimeout(function() { instance(); }, speed); for(var x=1, i=0; i<10000000; i++) { x *= (i + 1); } } ...
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8jz6R3vjuAga8BZkHvzAuShrZO0WJrO1C32S4ibg85g9RmicNUm8cFicDw/640?wx_fmt=gif)

可以看出，这大大加剧了误差。

可以看到随着时间的推移， setTimeout 实际执行的时间和理想的时间差值会越来越大，这就不是我们预期的样子。类比真实的场景，对于一些倒计时以及动画来说都会造成时间的偏差都是不理想的。

这站图可以很好的描述以上问题：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8xf5ojYqucmcfKmPia56AezT9atM7L15vLdgfmsdsvr82rOsCp2s1vJQ/640?wx_fmt=png)

如何实现准时的 “setTimeout”
--------------------

### requestAnimationFrame

> window.requestAnimationFrame() 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。

该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行，回调函数执行次数通常是每秒 60 次，也就是每 16.7ms 执行一次，但是并不一定保证为 16.7 ms。

我们也可以尝试一下将它来模拟 setTimeout。

```
// 模拟代码 function setTimeout2 (cb, delay) {     let startTime = Date.now()     loop()        function loop () {       const now = Date.now()       if (now - startTime >= delay) {         cb();         return;       }       requestAnimationFrame(loop)     } }
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8mVOSFOOkrTnXAn1QG9CAvgNmaMv5D647RBVDTyT5u9vEfN92cUnExQ/640?wx_fmt=gif)

发现由于 16.7 ms 间隔执行，在使用间隔很小的定时器，很容易导致时间的不准确。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke82PxNJRrp4wGVPV0ibHpY1KMhnHgz03dTlKiaoZ6JTAcHuNH4hUHau0kQ/640?wx_fmt=png)

再看看额外代码的引入效果。

```
...  window.setInterval2(function () { instance(); }, speed); } for (var x = 1, i = 0; i < 10000000; i++) { x *= (i + 1); } ...
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8HkRKo601EMibwVadCQjb8LYMFtpGiaSh5LMia35dImMc5aJZPRqdpkL8w/640?wx_fmt=gif)

略微加剧了误差的增加，因此这种方案仍然不是一种好的方案。

### while

想得到准确的，我们第一反应就是如果我们能够主动去触发，获取到最开始的时间，以及不断去轮询当前时间，如果差值是预期的时间，那么这个定时器肯定是准确的，那么用 while 可以实现这个功能。

理解起来也很简单：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8FibSbh400UibooWLIX3WW5x8Byqicd67GQk0MQngLI0KsUGcw9jXicgVLg/640?wx_fmt=png)

代码如下：

```
function timer(time) {     const startTime = Date.now();     while(true) {         const now = Date.now();         if(now - startTime >= time) {             console.log('误差', now - startTime - time);             return;         }     } } timer(5000);
```

打印：误差 0

显然这样的方式很精确，但是我们知道 js 是单线程运行，使用这样的方式强行霸占线程会使得页面进入卡死状态，这样的结果显然是不合适的。

### setTimeout 系统时间补偿

这个方案是在 stackoverflow 看到的一个方案，我们来看看此方案和原方案的区别

原方案

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8MicY3c8w4U0yhJxUnFicxrpFBakIhc8FDiaiauJXXmyng45uMTdKTeapIA/640?wx_fmt=png)

setTimeout 系统时间补偿

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8ibicvZAH3uqo5yy5I0KfmvvrtY6YvjPSsGC6wQVBiaEO2cmzEWZnUKCiaw/640?wx_fmt=png)

当每一次定时器执行时后，都去获取系统的时间来进行修正，虽然每次运行可能会有误差，但是通过系统时间对每次运行的修复，能够让后面每一次时间都得到一个补偿。

```
function timer() {    var speed = 500,    counter = 1,     start = new Date().getTime();        function instance()    {     var real = (counter * speed),     ideal = (new Date().getTime() - start);          counter++;      var diff = (ideal - real);     form.diff.value = diff;      window.setTimeout(function() { instance(); }, (speed - diff)); // 通过系统时间进行修复     };        window.setTimeout(function() { instance(); }, speed); }
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke87npfnkpanibibO9yIRUrKYzIto48CUsAlJzeDpWINN4UlQEf25Ufia2rQ/640?wx_fmt=png)

再来看看加入额外的代码逻辑的情况。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke86YNKd18iaXZqtHxSYK1Qu8fnJBasv79vGk0Ln9alwiby7uMWILPicqODw/640?wx_fmt=png)

依旧非常的稳定，因此通过系统的时间补偿，能够让我们的 setTimeout 变得更加准时，至此我们完成了如何让 setTimeout 准时的探索。

好了我们最后来总结一下 4 种方案的优缺点

`while、Web Worker、requestAnimationFrame、setTimeout` 系统时间补偿

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Ptef09iaEWxyia0qky57TjZ1T0iaUushke8NlicRp8H4oiamhWZ45u8NGXlvMeEpSm4mDb4THvNwPvOFUecVYwr7ibQQ/640?wx_fmt=png)