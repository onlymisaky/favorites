> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Q_Y0er6MYgn7SjI5e73MEg)

分享一个 `CSS` 小技巧

在平时开发中，经常会遇到这样一种问题：当打开一个弹窗时，后面的页面是可以滚动的，演示如下

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtL74sXHAH8YhUO0yI89ylBAamktuHic7WuNYA0nqqcnZo9gMwLROo2GYyHftjZafiaXtkxDOa1bROicA/640?wx_fmt=gif&from=appmsg)

那么，该如何锁定页面的滚动呢？

一、传统的实现方式
---------

传统的方式其实也不复杂，就是在打开弹窗时阻止滚动就行了，通常是改变`overflow`属性

```
const openModal = () => {  document.body.style.overflow = 'hidden'}const closeModal = () => {  document.body.style.overflow = 'auto'}
```

如果是在现代框架里，比如`vue`，可以用监听弹窗状态来实现

```
watch(  () => show.value,  (val) => {    if (val) {      document.body.style.overflow = 'hidden'    } else {      document.body.style.overflow = 'auto'    }  },)
```

这样就能锁定滚动了

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtL74sXHAH8YhUO0yI89ylBAd3PiaWDnyynicQyicyjtpTBqOKaMVP38xqbNk1SAH1B47ZIsWbZ6T6Pfg/640?wx_fmt=gif&from=appmsg)

二、传统方式的局限
---------

虽然上面的实现看似完美，其实还有潜在问题的。比如有多个弹窗，弹窗覆盖的情况下，这个时候锁定就会出问题了。

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtL74sXHAH8YhUO0yI89ylBATrgwaZBEyAibUfGag3SagD7koG9ta7CzQaYdx6fOz8Ynmr8sBhDCSKQ/640?wx_fmt=gif&from=appmsg)

因为在关闭第二个弹窗的时候，页面已经解除锁定了，所以在第一个弹窗还在的时候，页面已经可以滚动了

如果想要优化这个问题，还需要做进一步的判断

三、借助 CSS has 实现
---------------

现在有了`CSS :has`伪类，一切就好办了，无需过多的判断，直接一个选择器搞定

```
body:has(dialog[open]){  overflow: hidden}
```

这行选择器表示，只要有属性为`open`的弹窗，`body`就自动锁定，无论有多少层弹窗

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtL74sXHAH8YhUO0yI89ylBAaibG3puKaa5paGEeV7y3UHWGAo4Hw6Nb8LnSLyTAMJBIiaIgY3iabP4nw/640?wx_fmt=gif&from=appmsg)

是不是非常简单？

完整代码可以查看：CSS has lock scroll (juejin.cn)[1]

四、has 已经全兼容了
------------

提一下兼容性，目前现代浏览器都支持了，如下

![](https://mmbiz.qpic.cn/mmbiz_png/xvBbEKrVNtL74sXHAH8YhUO0yI89ylBAvPBicQxMDpU89MZdkPXtK9HMAzSBGnDCIU4rfEEbibkIEqPKJ4pvF85w/640?wx_fmt=png&from=appmsg)

最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发 ❤❤❤

![](https://mmbiz.qpic.cn/mmbiz_jpg/xvBbEKrVNtIQU4sjVF2flyxuQypSVkBlHDoUReEpkRJvXAibEskibiaRZAaj7nsbrLQllUBqxfXTAUfQ2HQX1Bz0Q/640?wx_fmt=jpeg)

[1]CSS has lock scroll (juejin.cn)： _https://code.juejin.cn/pen/7357637625827573800_