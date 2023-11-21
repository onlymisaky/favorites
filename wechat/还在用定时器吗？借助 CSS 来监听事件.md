> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/84eYQjIWk8W0hEgQ8daeSg)

平时工作中很多场合都要用到定时器，比如延迟加载、定时查询等等，但定时器的控制有时候会有些许麻烦，比如鼠标移入停止、移出再重新开始。这次介绍几个借助 CSS 来更好的控制定时器的方法，一起了解一下吧，相信可以带来不一样的体验

一、hover 延时触发
------------

有这样一个场景，在鼠标停留在一个元素上`1s`后才触发事件，不满`1s`就不会触发，这样的好处是，可以避免鼠标在快速划过时，频繁的触发事件。如果是用`js`来实现，可能会这样

```
var timer = nullel.addEventListener('mouseover', () => {  timer && clearTimeout(timer)  timer = setTimeout(() => {    // 具体逻辑  }, 1000)})
```

是不是这样？等等，这样还没完，这样只做到了延时，鼠标离开以后还是会触发，还需要在鼠标离开时取消定时器

```
el.addEventListener('mouseout', () => {  timer && clearTimeout(timer)})
```

另外，**在使用`mouseout`时还需要考虑 `dom` 嵌套结构**，因为这些事件在`父级 -> 子级`的过程中仍然会触发，总之，细节会非常多，很容易误触发。

现在转折来了，如果借用 CSS 就可以有效地避免上述问题，如下，先给需要触发的元素加一个有延时的`transition`

```
button:hover{  opacity: 0.999; /*无关紧要的样式*/  transition: 0s 1s opacity; /*延时 1s */}
```

这里只需一个无关紧要的样式就行，如果`opacity`已经使用过了，可以使用其他的，比如`transform:translateZ(.1px)`，也是可行的。然后添加监听`transitionend`方法

> GlobalEventHandlers.ontransitionend - Web API 接口参考 | MDN (mozilla.org)[1]

```
el.addEventListener('transitionend', () => {  // 具体逻辑})
```

这就结束了。无需定时器，也无需取消，更无需考虑 `dom` 结构，完美实现。

下面是一个小实例，在`hover`一段时间后触发`alert`

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJcXh7SYHYRQCXTrcSA6Hr9ynyAgenOu2yjO3EH33JITzNQPhObAZnkLgf7icx4IakRsPkMmmZzjmg/640?wx_fmt=gif)Kapture 2022-09-11 at 15.56.37

原理和上面一致，完整代码可以查看线上 demo：hover_alert (codepen.io)[2] 或者 hover_alert(runjs.work)[3]

> 🤔以后再碰到这样的需要可以停下来思考一番，很多和`mouseover`有关的交互都可以用这种方式来实现

二、长按触发事件
--------

长按也是一个比较常见的需求，它可以很好的和点击事件区分开来，从而赋予更多的交互能力。

但是原生`js`中却没有这样一个事件，如果要实现长按事件，通常需要借助定时器和鼠标按下事件，如下

```
el.onmousedown = function(){    this.timer && clearTimeout(this.timer);    this.timer = settimeout(function(){        //业务代码    },1000)}el.onmouseup = function(){    this.timer && clearTimeout(this.timer);}
```

又是定时器和取消定时器的场景，和前面一个例子有些类似，也可以借助 CSS 来实现，由于是鼠标按下，可以联想到`:active`，因此可以这样来实现

```
button:hover:active{  opacity: .999; /*无关紧要的样式*/  transition: opacity 1s; /*延时 1s */}
```

然后再监听`transitionend`方法

```
el.addEventListener('transitionend', () => {  // 具体逻辑})
```

是不是非常方便呢？下面是以前做过的一个小案例，实现了长按触发元素选中

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJcXh7SYHYRQCXTrcSA6Hr9qXXviaaxicIQr7ZQJcXjQ9wsBAthjr4vcn2qiakRrkLopgOpRwpw5Nsvw/640?wx_fmt=gif)

Kapture 2022-09-13 at 10.37.01

完整代码可以查看线上 demo：长按框选 (codepen.io)[4] 或者长按框选 (runjs.work)[5]

三、轮播和暂停
-------

再来看一个比较有意思的例子，轮播图。

通常轮播图都会自动播放，然后鼠标`hover`时会暂停轮播图，通常的做法是这样的

```
function autoPlay(){  timer && clearInterval(timer)  timer = setInterval(function(){    // 轮播逻辑  }, 1000)}autoPlay()view.onmouseover = function(){    timer && clearInterval(timer)}el.onmouseout = function(){    autoPlay()}
```

又是定时器的取消和设置，要绑定一堆事件，太烦人了，可以换种方式吗？当然可以了，借助 CSS 动画，一切都好办了。

和前面不太相同的是，这里是`setInterval`，可以重复触发，那 CSS 中有什么可以重复触发的呢？没错，就是 **CSS 动画**！当 CSS 动画设置次数为`infinite`就可以无限循环了，和这个定时器效果非常类似，而且可以直接通过`:hover`暂停和播放动画。监听每次动画的触发可以用`animationiteration`这个方法，表示每个动画轮回就触发一次

> GlobalEventHandlers.onanimationiteration - Web API 接口参考 | MDN (mozilla.org)[6]

所以用这种思路实现就是

```
.view {  animation: scroll 1s infinite; /*每1s动画，无限循环*/}.view:hover{  animation-play-state: paused; /*hover暂停*/}@keyframes scroll {  to {    transform: translateZ(.1px); /*无关紧要的样式*/  }}
```

然后再监听`animationiteration`事件

```
view.addEventListener("animationiteration", () => {  // 轮播逻辑})
```

是不是省去了大半的`js`代码？而且也更好理解，控制也更为方便。

下面是一个通过`animationiteration`来代替`setInterval`实现的轮播图

![](https://mmbiz.qpic.cn/mmbiz_gif/xvBbEKrVNtJcXh7SYHYRQCXTrcSA6Hr9ErceIO9ejOiaqdhfdfzcy7u3YH7ABbot9YVoFIvqtwHKmyy84oUobFQ/640?wx_fmt=gif)Kapture 2022-09-11 at 16.43.49

完整代码可以查看线上 demo：CSS banner(codepen.io)[7] 或者 css_banner(runjs.work)[8]

四、总结一下
------

以上就是你可能不需要定时器的几个替代方案，相比定时器而言，CSS 在控制定时器的开启和暂停上更有优势，下面总结一下

1.  `:hover`配合`transition`延时、`transitionend`监听可以实现鼠标经过延时触发效果
    
2.  `:active`配合`transition`延时、`transitionend`监听可以实现长按触发效果
    
3.  CSS 动画设置`infinite`后配合`animationiteration`监听可以实现周期性触发效果
    
4.  可以直接通过`:hover`来控制台动画的暂停和播放
    

当然，可以利用的不仅仅是以上几个案例，任何和 CSS 交互（`:hover`、`:active`）有类似功能的都可以朝这个方向去思考，是不是可以实现地更加优雅？🤔

最后，如果觉得还不错，对你有帮助的话，欢迎点赞、收藏、转发❤❤❤

### 参考资料

[1]

**GlobalEventHandlers.ontransitionend - Web API 接口参考 | MDN (mozilla.org):** _https://developer.mozilla.org/zh-CN/docs/Web/API/Element/transitionend_event_

[2]

**hover_alert (codepen.io):** _https://codepen.io/xboxyan/pen/ExLgXrw_

[3]

**hover_alert(runjs.work):** _https://runjs.work/projects/db0bdceb7cd343f9_

[4]

**长按框选 (codepen.io):** _https://codepen.io/xboxyan/pen/gJdzoN_

[5]

**长按框选 (runjs.work):** _https://runjs.work/projects/a98c3826a6a646fe_

[6]

**GlobalEventHandlers.onanimationiteration - Web API 接口参考 | MDN (mozilla.org):** _https://developer.mozilla.org/zh-CN/docs/Web/API/Element/animationiteration_event_

[7]

**CSS banner(codepen.io):** _https://codepen.io/xboxyan/pen/jOxMwXW_

[8]

**css_banner(runjs.work):** _https://runjs.work/projects/b92fc709ee5e4594_

![](https://mmbiz.qpic.cn/mmbiz_png/SMw0rcHsoNLAKEL00pOAy3DCthdVEybxIyEB5d9819WpqDIVaKIib5QC57tITUiaWqibLShibbYW3OGPyHODjMicJ0w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

如果觉得还不错，欢迎**点赞、收藏、转发**❤❤❤