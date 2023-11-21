> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/RKtlyxs0EeyLfAH9Q3r6nQ)

网页开发中我们经常要处理用户交互，我们会用 addEventListener 添加事件监听器来监听各种用户操作，比如 click、mousedown、mousemove、input 等，这些都是由用户直接触发的事件。

那么对于一些不是由用户直接触发的事件呢？比如元素从不可见到可见、元素大小的改变、元素的属性和子节点的修改等，这类事件如何监听呢？

浏览器提供了 5 种 Observer 来监听这些变动：MutationObserver、IntersectionObserver、PerformanceObserver、ResizeObserver、ReportingObserver。

我们分别来看一下：

IntersectionObserver
--------------------

一个元素从不可见到可见，从可见到不可见，这种变化如何监听呢？

用 IntersectionObserver。

**IntersectionObserver 可以监听一个元素和可视区域相交部分的比例，然后在可视比例达到某个阈值的时候触发回调。**

我们准备两个元素：

```
<div id="box1">BOX111</div><div id="box2">BOX222</div>
```

加上样式：

```
#box1,#box2 {    width: 100px;    height: 100px;    background: blue;    color: #fff;    position: relative;}#box1 {    top: 500px;}#box2 {    top: 800px;}
```

这两个元素分别在 500  和 800 px 的高度，我们监听它们的可见性的改变。

```
const intersectionObserver = new IntersectionObserver(    function (entries) {        console.log('info:');        entries.forEach(item => {            console.log(item.target, item.intersectionRatio)        })    }, {    threshold: [0.5, 1]});intersectionObserver.observe( document.querySelector('#box1'));intersectionObserver.observe( document.querySelector('#box2'));
```

创建一个 IntersectionObserver 对象，监听 box1 和 box2 两个元素，当可见比例达到 0.5 和 1 的时候触发回调。

浏览器跑一下：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMbbjk6HIHpE08gvyQ5dQNDcM4f1Ya7shEFAeL5mibuWGqkl9icAIicw9yA/640?wx_fmt=gif)

可以看到元素 box1 和 box2 在可视范围达到一半（0.5）和全部（1）的时候分别触发了回调。

这有啥用？

这太有用了。我们在做一些数据采集的时候，希望知道某个元素是否是可见的，什么时候可见的，就可以用这个 api 来监听，还有做图片的懒加载的时候，可以当可视比例达到某个比例再触发加载。

除了可以监听元素可见性，还可以监听元素的属性和子节点的改变：

MutationObserver
----------------

监听一个普通 JS 对象的变化，我们会用 Object.defineProperty 或者 Proxy：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMVgo2eJIjRMEEZzsZgfTKlic15AxvcCtPe8erqicqJsuBWH3hqV5emfgw/640?wx_fmt=png)

而监听元素的属性和子节点的变化，我们可以用 MutationObserver：

**MutationObserver 可以监听对元素的属性的修改、对它的子节点的增删改。**

我们准备这样一个盒子：

```
<div id="box"><button>光</button></div>
```

加上样式：

```
#box {    width: 100px;    height: 100px;    background: blue;    position: relative;}
```

就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMz1OXKJDAyzNs789d21xCOAibtpLAqyUSs2oTQPFQTvnkD3lFbLDtugg/640?wx_fmt=png)

我们定时对它做下修改：

```
setTimeout(() => {    box.style.background = 'red';},2000);setTimeout(() => {    const dom = document.createElement('button');    dom.textContent = '东东东';    box.appendChild(dom);},3000);setTimeout(() => {   document.querySelectorAll('button')[0].remove();},5000);
```

2s 的时候修改背景颜色为红色，3s 的时候添加一个 button 的子元素，5s 的时候删除第一个 button。

然后监听它的变化：

```
const mutationObserver = new MutationObserver((mutationsList) => {    console.log(mutationsList)});mutationObserver.observe(box, {    attributes: true,    childList: true});
```

创建一个 MutationObserver 对象，监听这个盒子的属性和子节点的变化。

浏览器跑一下：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMpviaMo2HRWclicrWSCzxJxF63Wh3JYhCnnKibJDw6B10ltDtqicTicPNPfQ/640?wx_fmt=gif)

可以看到在三次变化的时候都监听到了并打印了一些信息：

第一次改变的是 attributes，属性是 style：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMSbwAZvMadRRbuIf8Y6EicKIEc4UlM2QtYlCiatH4LN7XGicPevRk9aGtA/640?wx_fmt=png)

第二次改变的是 childList，添加了一个节点：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TM53liarypeu9ib7RgCMQ6ic74vyyo0uoWiceZxjvWChRbP5CsWWzXkyTX7Q/640?wx_fmt=png)

第三次也是改变的 childList，删除了一个节点：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TM1lpibic1E1gpkX6qgGNbl0L4tJBq8Vvu9iciapT64ZBOff52j3QnNqicwJw/640?wx_fmt=png)

都监听到了！

这个可以用来做什么呢？比如文章水印被人通过 devtools 去掉了，那么就可以通过 MutationObserver 监听这个变化，然后重新加上，让水印去不掉。

当然，还有很多别的用途，这里只是介绍功能。

除了监听元素的可见性、属性和子节点的变化，还可以监听大小变化：

ResizeObserver
--------------

窗口我们可以用 addEventListener 监听 resize 事件，那元素呢？

**元素可以用 ResizeObserver 监听大小的改变，当 width、height 被修改时会触发回调。**

我们准备这样一个元素：

```
<div id="box"></div>
```

添加样式：

```
#box {    width: 100px;    height: 100px;    background: blue;}
```

在 2s 的时候修改它的高度：

```
const box = document.querySelector('#box');setTimeout(() => {    box.style.width = '200px';}, 3000);
```

然后我们用 ResizeObserver 监听它的变化：

```
const resizeObserver = new ResizeObserver(entries => {    console.log('当前大小', entries)});resizeObserver.observe(box);
```

在浏览器跑一下：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMhWOVc20o5h2aaXQ5PTbdVaiciaZk8mbezTwZYMibia0icDZmvNoWTzOP5Lg/640?wx_fmt=gif)

大小变化被监听到了，看下打印的信息：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TM0LLG9Oh6U44NqsepXAKmFKgawmgJZI086fpiblzwcNam1ptJFIYq1gQ/640?wx_fmt=png)

可以拿到元素和它的位置、尺寸。

这样我们就实现了对元素的 resize 的监听。

除了元素的大小、可见性、属性子节点等变化的监听外，还支持对 performance 录制行为的监听：

PerformanceObserver
-------------------

浏览器提供了 performance 的 api 用于记录一些时间点、某个时间段、资源加载的耗时等。

我们希望记录了 performance 那就马上上报，可是怎么知道啥时候会记录 performance 数据呢？

用 PeformanceObserver。

**PerformanceObserver 用于监听记录 performance 数据的行为，一旦记录了就会触发回调，这样我们就可以在回调里把这些数据上报。**

比如 performance 可以用 mark 方法记录某个时间点：

```
performance.mark('registered-observer');
```

用 measure 方法记录某个时间段：

```
performance.measure('button clicked', 'from', 'to');
```

后两个参数是时间点，不传代表从开始到现在。

我们可以用 PerformanceObserver 监听它们：

```
<html><body>  <button onclick="measureClick()">Measure</button>  <img src="https://p9-passport.byteacctimg.com/img/user-avatar/4e9e751e2b32fb8afbbf559a296ccbf2~300x300.image" />  <script>    const performanceObserver = new PerformanceObserver(list => {      list.getEntries().forEach(entry => {        console.log(entry);// 上报      })    });    performanceObserver.observe({entryTypes: ['resource', 'mark', 'measure']});    performance.mark('registered-observer');    function measureClick() {      performance.measure('button clicked');    }  </script></body></html>
```

创建 PerformanceObserver 对象，监听 mark（时间点）、measure（时间段）、resource（资源加载耗时） 这三种记录时间的行为。

然后我们用 mark 记录了某个时间点，点击 button 的时候用 measure 记录了某个时间段的数据，还加载了一个图片。

当这些记录行为发生的时候，希望能触发回调，在里面可以上报。

我们在浏览器跑一下试试：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMJxicxDEJN5QHMl08ll0WckxMiaG7nlZVb2YdTuOpsLawcrx8tWDEjRBw/640?wx_fmt=gif)

可以看到 mark 的时间点记录、资源加载的耗时、点击按钮的 measure 时间段记录都监听到了。

分别打印了这三种记录行为的数据：

mark：![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMPn1uicadiaicicjuBicuMwlIm0w89MUEPbb99bPtVk5o8I0DAaR7vphOH6g/640?wx_fmt=png)

图片加载：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMIOg5aSv8bOatT5ygyJhe5mC4jxLQGWfKEn7bPuR2qd95pibgFGOaDrQ/640?wx_fmt=png)

measure：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMOZ2GlqfYsKvAsLiaVvlJ4fFXzrkbLxbNWK8PaEOIfibocPLjxbjKRzsw/640?wx_fmt=png)

有了这些数据，就可以上报上去做性能分析了。

除了元素、performance 外，浏览器还有一个 reporting 的监听：

ReportingObserver
-----------------

当浏览器运行到过时（deprecation）的 api 的时候，会在控制台打印一个过时的报告:

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMg9QLgMI0T32DVfLibNicaNAu1pw8ogbHIibQytkYG3q4uxdKOUnEfNUTg/640?wx_fmt=png)

浏览器还会在一些情况下对网页行为做一些干预（intervention），比如会把占用 cpu 太多的广告的 iframe 删掉：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMFqfqLIib7JMtESToY8jxznpxFV75GGStMhvZY6tj0ic17z13yXsO3LLQ/640?wx_fmt=png)

会在网络比较慢的时候把图片替换为占位图片，点击才会加载：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMhQ97aNbbKJadDiaX0a5tS8eDtSfPU2jwjLbz8WqlIyicY358DrelvLKQ/640?wx_fmt=png)

这些干预都是浏览器做的，会在控制台打印一个报告：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGiaianmXXKO8uMgMMfOHtic5TMQhI5UvVVYiczJbFtKTYdUWXjHxGiaoEARKcGRLYqAla6G5mfnd4A8SzQ/640?wx_fmt=png)

这些干预或者过时的 api 并不是报错，所以不能用错误监听的方式来拿到，但这些情况对网页 app 来说可能也是很重要的：

比如我这个网页就是为了展示广告的，但浏览器一干预给我把广告删掉了，我却不知道。如果我知道的话或许可以优化下 iframe。

比如我这个网页的图片很重要，结果浏览器一干预给我换成占位图了，我却不知道。如果我知道的话可能会优化下图片大小。

所以自然也要监听，所以浏览器提供了 ReportingObserver 的 api 用来监听这些报告的打印，我们可以拿到这些报告然后上传。

```
const reportingObserver = new ReportingObserver((reports, observer) => {    for (const report of reports) {        console.log(report.body);//上报    }}, {types: ['intervention', 'deprecation']});reportingObserver.observe();
```

**ReportingObserver 可以监听过时的 api、浏览器干预等报告等的打印，在回调里上报，这些是错误监听无法监听到但对了解网页运行情况很有用的数据。**

文中的代码上传到了 github：https://github.com/QuarkGluonPlasma/browser-api-exercize

总结
--

监听用户的交互行为，我们会用 addEventListener 来监听 click、mousedown、keydown、input 等事件，但对于元素的变化、performance 的记录、浏览器干预行为这些不是用户交互的事件就要用 XxxObserver 的 api 了。

浏览器提供了这 5 种 Observer：

*   IntersectionObserver：监听元素可见性变化，常用来做元素显示的数据采集、图片的懒加载
    
*   MutationObserver：监听元素属性和子节点变化，比如可以用来做去不掉的水印
    
*   ResizeObserver：监听元素大小变化
    

还有两个与元素无关的：

*   PerformanceObserver：监听 performance 记录的行为，来上报数据
    
*   ReportingObserver：监听过时的 api、浏览器的一些干预行为的报告，可以让我们更全面的了解网页 app 的运行情况
    

这些 api 相比 addEventListener 添加的交互事件来说用的比较少，但是在特定场景下都是很有用的。

浏览器的 5 种 Observer，你用过几种呢？在什么情况下用到过呢？不妨来讨论下。

- END -

[![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib44VcWJtWJHE1rbIx4WLwG6Wicxpy9V4SCLxLHqW2SVoibogZU9FTyiaTkZgTCwQVsk1iao7Vot4yibZjQ/640?wx_fmt=png)](http://mp.weixin.qq.com/s?__biz=Mzg4MTYwMzY1Mw==&mid=2247496626&idx=1&sn=699dc2b117d43674b9e80a616199d5b6&chksm=cf61d698f8165f8e2b7f6cf4a638347c3b55b035e6c2095e477b217723cce34acbbe943ad537&scene=21#wechat_redirect)

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzECqoVbtplgn1lGUicQXib1OKicq8iaxkE3PtFkU0vKvjPRn87LrAgYXw6wJfxiaSQgXiaE3DWSBRDJG39bA/640?wx_fmt=png)