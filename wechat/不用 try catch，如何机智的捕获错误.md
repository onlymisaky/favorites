> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/bJY6NIhwHZ9wshf-R6mT4w)

这是多个`feature`组合使用后实现的神奇效果，在`React`源码中被广泛使用。

当我读源码看到这里时，心情经历了：

懵逼 -- 困惑 -- 沉思 -- 查文档 -- 豁然开朗

看完此文，相信你也会发出感叹：

**还能这么玩？**

起源
--

我们知道，`React`中有个特性`Error Boundary`，帮助我们在`组件`发生错误时显示 “错误状态” 的 UI。

为了实现这个特性，就一定需要捕获到错误。

所以在`React`源码中，所有`用户代码`都被包裹在一个方法中执行。

类似如下：

```
function wrapper(func) {  try {    func();  } catch(e) {    // ...处理错误  }}
```

比如触发`componentDidMount`时：

```
wrapper(componentDidMount);
```

本来一切都很完美，但是`React`作为世界级前端框架，受众广泛，凡事都讲究做到极致。

这不，有人提 issue：

> 你们这样在`try catch`中执行`用户代码`会让浏览器调试工具的`Pause on exceptions`失效。

Pause on exceptions 失效的来龙去脉
---------------------------

`Pause on exceptions`是什么？

他是浏览器调试工具`source`面板的一个功能。

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SRYwnficOJKVYLRw7yIsqhfdtYRvc5ly9uXWF3NnLtpibib8fDnibBYQo9O4lycPVDorOaPLyWN0A4pFg/640?wx_fmt=png)

开启该功能后，在运行时遇到会抛出错误的代码，代码的执行会自动停在该行，就像在该行打了断点一样。

比如，执行如下代码，并开启该功能：

```
let a = c;
```

代码的执行会在该行暂停。

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SRYwnficOJKVYLRw7yIsqhfd1X9PHy6AZNLAZjGeblrb1mwt7La5b0QFn1iadn3ia9cXwjwCoH78ib0gA/640?wx_fmt=png)

这个功能可以很方便的帮我们发现`未捕获的错误`发生的位置。

但是，当`React`将`用户代码`包裹在`try catch`后，即使代码抛出错误，也会被`catch`。

`Pause on exceptions`无法在抛出错误的`用户代码`处暂停，因为`error`已经被`React` `catch`了。

除非我们进一步开启`Pause on caught exceptions`。

![](https://mmbiz.qpic.cn/mmbiz_png/QibeeJCUD7SRYwnficOJKVYLRw7yIsqhfdibOflAiaBAR9OtAw7kPSWNDVKzqWyWYVnmBlGRQUOwmQr66Dv4nvAiaBQ/640?wx_fmt=png)

开启该功能，使代码在`捕获的错误`发生的位置暂停。

如何解决
----

对用户来说，我写在`componentDidMount`中的代码明明未捕获错误，可是错误发生时`Pause on exceptions`却失效了，确实有些让人困惑。

所以，在生产环境，`React`继续使用`try catch`实现`wrapper`。

而在开发环境，为了更好的调试体验，需要重新实现一套`try catch`机制，包含如下功能：

*   捕获`用户代码`抛出的错误，使`Error Boundary`功能正常运行
    
*   不捕获`用户代码`抛出的错误，使`Pause on exceptions`不失效
    

这看似矛盾的功能，`React`如何机智的实现呢？

如何 “捕获” 错误
----------

让我们先实现第一点：捕获`用户代码`抛出的错误。

但是不能使用`try catch`，因为这会让`Pause on exceptions`失效。

解决办法是：监听`window`的`error`事件。

根据 GlobalEventHandlers.onerror MDN[1]，该事件可以监听到两类错误：

*   js 运行时错误（包括语法错误）。`window`会触发`ErrorEvent`接口的`error`事件
    
*   资源（如`<img>`或`<script>`）加载失败错误。加载资源的元素会触发`Event`接口的`error`事件，可以在`window`上捕获该错误
    

实现开发环境使用的`wrapperDev`：

```
// 开发环境wrapperfunction wrapperDev(func) {  function handleWindowError(error) {    // 收集错误交给Error Boundary处理  }  window.addEventListener('error', handleWindowError);  func();  window.removeEventListener('error', handleWindowError);}
```

当`func`执行时抛出错误，会被`handleWindowError`处理。

但是，对比生产环境`wrapperPrd`内`func`抛出的错误会被`catch`，不会影响后续代码执行。

```
function wrapperPrd(func) {  try {    func();  } catch(e) {    // ...处理错误  }}
```

开发环境`func`内如果抛出错误，代码的执行会中断。

比如执行如下代码，`finish`会被打印。

```
wrapperPrd(() => {throw Error(123)})console.log('finish');
```

但是执行如下代码，代码执行中断，`finish`不会被打印。

```
wrapperDev(() => {throw Error(123)})console.log('finish');
```

如何在不捕获`用户代码`抛出错误的前提下，又能让后续代码的执行不中断呢？

如何让代码执行不中断
----------

答案是：通过`dispatchEvent`触发`事件回调`，在`回调`中调用`用户代码`。

根据 EventTarget.dispatchEvent MDN[2]：

不同于`DOM`节点触发的事件（比如`click`事件）回调是由`event loop`异步触发。

通过`dispatchEvent`触发的事件是同步触发，并且在事件回调中抛出的`错误`不会影响`dispatchEvent`的调用者（caller）。

让我们继续改造`wrapperDev`。

首先创建虚构的`DOM`节点、事件对象、虚构的事件类型：

```
// 创建虚构的DOM节点const fakeNode = document.createElement('fake');// 创建eventconst event = document.createEvent('Event');// 创建虚构的event类型const evtType = 'fake-event';
```

初始化事件对象，监听事件。在事件回调中调用`用户代码`。触发事件：

```
function callCallback() {  fakeNode.removeEventListener(evtType, callCallback, false);   func();}// 监听虚构的事件类型fakeNode.addEventListener(evtType, callCallback, false);// 初始化事件event.initEvent(evtType, false, false);// 触发事件fakeNode.dispatchEvent(event);
```

完整流程如下：

```
function wrapperDev(func) {  function handleWindowError(error) {    // 收集错误交给Error Boundary处理  }    function callCallback() {    fakeNode.removeEventListener(evtType, callCallback, false);     func();  }    const event = document.createEvent('Event');  const fakeNode = document.createElement('fake');  const evtType = 'fake-event';  window.addEventListener('error', handleWindowError);  fakeNode.addEventListener(evtType, callCallback, false);  event.initEvent(evtType, false, false);    fakeNode.dispatchEvent(event);    window.removeEventListener('error', handleWindowError);}
```

当我们调用：

```
wrapperDev(() => {throw Error(123)})
```

会依次执行：

1.  `dispatchEvent`触发事件回调`callCallback`
    
2.  在`callCallback`内执行到`throw Error(123)`，抛出错误
    
3.  `callCallback`执行中断，但调用他的函数会继续执行。
    
4.  `Error(123)`被`window error handler`捕获用于`Error Boundary`
    

其中步骤 2 使`Pause on exceptions`不会失效。

步骤 3、4 使得错误被捕获，且不会阻止后续代码执行，模拟了`try catch`的效果。

总结
--

不得不说，`React`这波操作真细啊。

我们实现的迷你`wrapper`还有很多不足，比如：

*   没有针对不同浏览器的兼容
    
*   没有考虑其他代码也触发`window error handler`
    

`React`源码的完整版`wrapper`，见这里 [3]

### 参考资料

[1]

GlobalEventHandlers.onerror MDN: _https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalEventHandlers/onerror_

[2]

EventTarget.dispatchEvent MDN: _https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/dispatchEvent_

[3]

这里: _https://github.com/facebook/react/blob/master/packages/shared/invokeGuardedCallbackImpl.js#L63-L237_

关于奇舞周刊
------

《奇舞周刊》是 360 公司专业前端团队「奇舞团」运营的前端技术社区。关注公众号后，直接发送链接到后台即可给我们投稿。

![](https://mmbiz.qpic.cn/mmbiz_png/MpGQUHiaib4ib6j9X9s2kibfaicBLmIm6dUBqymVmiaKqGFEPn0G3VyVnqQjvognHq4cMibayW2400j4OyEtdz5fkMbmA/640?wx_fmt=jpeg)