> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4zuFZ6mh0d2rHSgltF1sFw)

首先，什么是打字机效果呢？打字机效果即为文字逐个输出，实际上就是一种 Web 动画。一图胜千言，诸君请看：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zOkdLBryLtPZhjYmweTekOQqCYafCuBubPpicHpia9enC9kdNggKOoHuQ/640?wx_fmt=gif)Typed.js

在 Web 应用中，实现动画效果的方法比较多，JavaScript 中可以通过定时器 setTimeout 来实现，css3 可以使用 transition 和 animation 来实现，html5 中的 canvas 也可以实现。除此之外，html5 还提供一个专门用于请求动画的 API，即 requestAnimationFrame（rAF），顾名思义就是 “请求动画帧”。接下来，我们一起来看看 打字机效果 的几种实现。为了便于理解，我会尽量使用简洁的方式进行实现，有兴趣的话，你也可以把这些实现改造的更有逼格、更具艺术气息一点，因为编程，本来就是一门艺术。

打字机效果的 N 种实现
------------

### 实现一：setTimeout()

setTimeout 版本的实现很简单，只需**把要展示的文本进行切割，使用定时器不断向 DOM 元素里追加文字**即可，同时，使用`::after伪元素`在 DOM 元素后面产生光标闪烁的效果。代码和效果图如下：

```
<!-- 样式 --><style type="text/css">  /* 设置容器样式 */  #content {    height: 400px;    padding: 10px;    font-size: 28px;    border-radius: 20px;    background-color: antiquewhite;  }  /* 产生光标闪烁的效果 */  #content::after{      content: '|';      color:darkgray;      animation: blink 1s infinite;  }  @keyframes blink{      from{          opacity: 0;      }      to{          opacity: 1;      }  }</style><body>  <div id='content'></div>  <script>    (function () {    // 获取容器    const container = document.getElementById('content')    // 把需要展示的全部文字进行切割    const data = '最简单的打字机效果实现'.split('')    // 需要追加到容器中的文字下标    let index = 0    function writing() {      if (index < data.length) {        // 追加文字        container.innerHTML += data[index ++]        let timer = setTimeout(writing, 200)        console.log(timer) // 这里会依次打印 1 2 3 4 5 6 7 8 9 10      }    }    writing()  })();  </script></body>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zomnbPTAzfUCpfEhkHUKPrrCYibUfb9mjLwlqJYzRRSGzxmicfibsf8QLg/640?wx_fmt=gif)Typed1

setTimeout() 方法的返回值是一个唯一的数值（ID），上面的代码中，我们也做了 setTimeout() 返回值的打印，那么，这个数值有什么用呢？  
  如果你想要终止 setTimeout()方法的执行，那就必须使用 clearTimeout()方法来终止，而使用这个方法的时候，系统必须知道你到底要终止的是哪一个 setTimeout()方法 (因为你可能同时调用了好几个 setTimeout() 方法)，这样 clearTimeout()方法就需要一个参数，这个参数就是 setTimeout()方法的返回值 (数值)，用这个数值来唯一确定结束哪一个 setTimeout() 方法。

### 实现二：setInterval()

setInterval 实现的打字机效果，其实在 MDN window.setInterval 案例三中已经有一个了，而且还实现了播放、暂停以及终止的控制，效果可点击这里查看，在此只进行 setInterval 打字机效果的一个最简单实现，其实代码和前文 setTimeout 的实现类似，效果也一致。

```
(function () {  // 获取容器  const container = document.getElementById('content')  // 把需要展示的全部文字进行切割  const data = '最简单的打字机效果实现'.split('')  // 需要追加到容器中的文字下标  let index = 0  let timer = null  function writing() {    if (index < data.length) {      // 追加文字      container.innerHTML += data[index ++]      // 没错，也可以通过，clearTimeout取消setInterval的执行      // index === 4 && clearTimeout(timer)    } else {      clearInterval(timer)    }    console.log(timer) // 这里会打印出 1 1 1 1 1 ...  }  // 使用 setInterval 时，结束后不要忘记进行 clearInterval  timer = setInterval(writing, 200)})();
```

和 setTimeout 一样，setInterval 也会返回一个 ID（数字），可以**将这个 ID 传递给 clearInterval() 或者 clearTimeout() 以取消定时器的执行**。

在此有必要强调一点：** 定时器指定的时间间隔，表示的是何时将定时器的代码添加到消息队列，而不是何时执行代码。** 所以真正何时执行代码的时间是不能保证的，取决于何时被主线程的事件循环取到，并执行。

### 实现三：requestAnimationFrame()

在动画的实现上，requestAnimationFrame 比起 setTimeout 和 setInterval 来无疑更具优势。我们先看看打字机效果的 requestAnimationFrame 实现：

```
(function () {    const container = document.getElementById('content')    const data = '与 setTimeout 相比，requestAnimationFrame 最大的优势是 由系统来决定回调函数的执行时机。具体一点讲就是，系统每次绘制之前会主动调用 requestAnimationFrame 中的回调函数，如果系统绘制率是 60Hz，那么回调函数就每16.7ms 被执行一次，如果绘制频率是75Hz，那么这个间隔时间就变成了 1000/75=13.3ms。换句话说就是，requestAnimationFrame 的执行步伐跟着系统的绘制频率走。它能保证回调函数在屏幕每一次的绘制间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。'.split('')    let index = 0    function writing() {      if (index < data.length) {        container.innerHTML += data[index ++]        requestAnimationFrame(writing)      }    }    writing()  })();
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zP3Tia7SasBNqWHPzw35bD8QRpAib9DuZQRryR0wicjP1HYupdsTHeWqog/640?wx_fmt=gif)Typed2

与 setTimeout 相比，requestAnimationFrame 最大的优势是**由系统来决定回调函数的执行时机**。具体一点讲，如果屏幕刷新率是 60Hz, 那么回调函数就每 16.7ms 被执行一次，如果刷新率是 75Hz，那么这个时间间隔就变成了 1000/75=13.3ms，换句话说就是，requestAnimationFrame 的步伐跟着系统的刷新步伐走。**它能保证回调函数在屏幕每一次的刷新间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题**。

### 实现四：CSS3

除了以上三种 JS 方法之外，其实只用 CSS 我们也可以实现打字机效果。大概思路是借助 CSS3 的`@keyframes`来不断改变包含文字的容器的宽度，超出容器部分的文字隐藏不展示。

```
<style>  div {    font-size: 20px;    /* 初始宽度为0 */    width: 0;    height: 30px;    border-right: 1px solid darkgray;    /*    Steps(<number_of_steps>，<direction>)    steps接收两个参数：第一个参数指定动画分割的段数；第二个参数可选，接受 start和 end两个值，指定在每个间隔的起点或是终点发生阶跃变化，默认为 end。    */    animation: write 4s steps(14) forwards,      blink 0.5s steps(1) infinite;      overflow: hidden;  }  @keyframes write {    0% {      width: 0;    }    100% {      width: 280px;    }  }  @keyframes blink {    50% {      /* transparent是全透明黑色(black)的速记法，即一个类似rgba(0,0,0,0)这样的值。 */      border-color: transparent; /* #00000000 */    }  }</style><body>  <div>    大江东去浪淘尽，千古风流人物  </div></body>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zG8TSAdMwASrNu1XbibXjxFQdJrQ2JMKJUicOONZGOBibdFCCsReykR7aw/640?wx_fmt=gif)Typed3

以上 CSS 打字机效果的原理一目了然：

*   初始文字是全部在页面上的，只是容器的宽度为 0，设置文字超出部分隐藏，然后不断改变容器的宽度；
    
*   设置`border-right`，并在关键帧上改变 `border-color` 为`transparent`，右边框就像闪烁的光标了。
    

### 实现五：Typed.js

> Typed.js is a library that types. Enter in any string, and watch it type at the speed you've set, backspace what it's typed, and begin a new sentence for however many strings you've set.

Typed.js 是一个轻量级的打字动画库, 只需要几行代码，就可以在项目中实现炫酷的打字机效果（本文第一张动图即为 Typed.js 实现）。源码也相对比较简单，有兴趣的话，可以到 GitHub 进行研读。

```
<!DOCTYPE html><html lang="en"><head>  <meta charset="UTF-8">  <meta https://cdn.jsdelivr.net/npm/typed.js@2.0.11"></script></head><body>  <div id="typed-strings">    <p>Typed.js is a <strong>JavaScript</strong> library.</p>    <p>It <em>types</em> out sentences.</p>  </div>  <span id="typed"></span></body><script>  var typed = new Typed('#typed', {    stringsElement: '#typed-strings',    typeSpeed: 60  });</script></html>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zEZ0ibgR4ibhdcaNM9HeaKfj3oicO9bVkRPYg5q9Ic3CGBlqo9QFp7aXyA/640?wx_fmt=gif)Typed4

使用 Typed.js，我们也可以很容易的实现对动画开始、暂停等的控制：

```
<body>  <input type="text" class="content" >重置</button></body><script>const startBtn = document.querySelector('.start');const stopBtn = document.querySelector('.stop');const toggleBtn = document.querySelector('.toggle');const resetBtn = document.querySelector('.reset');const typed = new Typed('.content',{  strings: ['雨过白鹭州，留恋铜雀楼，斜阳染幽草，几度飞红，摇曳了江上远帆，回望灯如花，未语人先羞。'],  typeSpeed: 200,  startDelay: 100,  loop: true,  loopCount: Infinity,  bindInputFocusEvents:true});startBtn.onclick = function () {  typed.start();}stopBtn.onclick = function () {  typed.stop();}toggleBtn.onclick = function () {  typed.toggle();}resetBtn.onclick = function () {  typed.reset();}</script>
```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zYKh3KVic2hwbJY3LFzB7SyibyTnltmlCNH3fzr2HR6PX89VWkYsVia2UA/640?wx_fmt=gif)Typed5

> 参考资料：Typed.js 官网 | Typed.js GitHub 地址

当然，打字机效果的实现方式，也不仅仅局限于上面所说的几种方法，本文的目的，也不在于搜罗所有打字机效果的实现，如果那样将毫无意义，接下来，我们将会对 CSS3 动画和 JS 动画进行一些比较，并对 setTimeout、setInterval 和 requestAnimationFrame 的一些细节进行总结。

CSS3 动画和 JS 动画的比较
-----------------

关于 CSS 动画和 JS 动画，**有一种说法是 CSS 动画比 JS 流畅，其实这种流畅是有前提的**。借此机会，我们对 CSS3 动画和 JS 动画进行一个简单对比。

### JS 动画

*   优点：
    

*   JS 动画控制能力强，可以在动画播放过程中对动画进行精细控制，如开始、暂停、终止、取消等；
    
*   JS 动画效果比 CSS3 动画丰富，功能涵盖面广，比如可以实现曲线运动、冲击闪烁、视差滚动等 CSS 难以实现的效果；
    
*   JS 动画大多数情况下没有兼容性问题，而 CSS3 动画有兼容性问题；
    

*   缺点：
    

*   JS 在浏览器的主线程中运行，而主线程中还有其它需要运行的 JS 脚本、样式计算、布局、绘制任务等，对其干扰可能导致线程出现阻塞，从而造成丢帧的情况；
    
*   对于帧速表现不好的低版本浏览器，CSS3 可以做到自然降级，而 JS 则需要撰写额外代码；
    
*   JS 动画往往需要频繁操作 DOM 的 css 属性来实现视觉上的动画效果，这个时候浏览器要不停地执行重绘和重排，这对于性能的消耗是很大的，尤其是在分配给浏览器的内存没那么宽裕的移动端。
    

### CSS3 动画

*   优点：
    

*   在 Chromium 基础上的浏览器中
    
*   同时 CSS 动画不触发 layout 或 paint，在 CSS 动画或 JS 动画触发了 paint 或 layout 时，需要 main thread 进行 Layer 树的重计算，这时 CSS 动画或 JS 动画都会阻塞后续操作。
    
*   部分情况下浏览器可以对动画进行优化（比如专门新建一个图层用来跑动画），为什么说部分情况下呢，因为是有条件的：
    
*   部分效果可以强制使用硬件加速 （通过 GPU 来提高动画性能）
    

*   缺点：
    

*   代码冗长。CSS 实现稍微复杂一点动画，CSS 代码可能都会变得非常笨重；
    
*   运行过程控制较弱。css3 动画只能在某些场景下控制动画的暂停与继续，不能在特定的位置添加回调函数。
    

### main thread(主线程) 和 compositor thread(合成器线程)

*   ** 渲染线程分为 main thread(主线程) 和 compositor thread(合成器线程)。** 主线程中维护了一棵 Layer 树（LayerTreeHost），管理了 TiledLayer，在 compositor thread，维护了同样一颗 LayerTreeHostImpl，管理了 LayerImpl，这两棵树的内容是拷贝关系。因此可以彼此不干扰，当 Javascript 在 main thread 操作 LayerTreeHost 的同时，compositor thread 可以用 LayerTreeHostImpl 做渲染。当 Javascript 繁忙导致主线程卡住时，合成到屏幕的过程也是流畅的。
    
*   为了实现防假死，鼠标键盘消息会被首先分发到 compositor thread，然后再到 main thread。这样，当 main thread 繁忙时，compositor thread 还是能够响应一部分消息，例如，鼠标滚动时，如果 main thread 繁忙，compositor thread 也会处理滚动消息，滚动已经被提交的页面部分（未被提交的部分将被刷白）。
    

### CSS 动画比 JS 动画流畅的前提

*   CSS 动画比较少或者不触发 pain 和 layout，即重绘和重排时。例如通过改变如下属性生成的 css 动画，这时整个 CSS 动画得以在 compositor thread 完成（而 JS 动画则会在 main thread 执行，然后触发 compositor 进行下一步操作）：
    

*   backface-visibility：该属性指定当元素背面朝向观察者时是否可见（3D，实验中的功能）；
    
*   opacity：设置 div 元素的不透明级别；
    
*   perspective 设置元素视图，该属性只影响 3D 转换元素；
    
*   perspective-origin：该属性允许您改变 3D 元素的底部位置；
    
*   transform：该属性应用于元素的 2D 或 3D 转换。这个属性允许你将元素旋转，缩放，移动，倾斜等。
    

*   JS 在执行一些昂贵的任务时，main thread 繁忙，CSS 动画由于使用了 compositor thread 可以保持流畅；
    
*   部分属性能够启动 3D 加速和 GPU 硬件加速，例如使用 transform 的 translateZ 进行 3D 变换时；
    
*   通过设置 `will-change` 属性，浏览器就可以提前知道哪些元素的属性将会改变，提前做好准备。待需要改变元素的时机到来时，就可以立刻实现它们，从而避免卡顿等问题。
    

*   不要将 `will-change` 应用到太多元素上，如果过度使用的话，可能导致页面响应缓慢或者消耗非常多的资源。
    
*   例如下面的代码就是提前告诉渲染引擎 box 元素将要做几何变换和透明度变换操作，这时候**渲染引擎会将该元素单独实现一帧**，等这些变换发生时，渲染引擎会通过合成线程直接去处理变换，这些变换并没有涉及到主线程，这样就大大提升了渲染的效率。
    
    ```
    .box {will-change: transform, opacity;}
    ```
    

setTimeout、setInterval 和 requestAnimationFrame 的一些细节
----------------------------------------------------

### setTimeout 和 setInterval

*   setTimeout 的执行时间并不是确定的。在 JavaScript 中，setTimeout 任务被放进了异步队列中，**只有当主线程上的任务执行完以后，才会去检查该队列里的任务是否需要开始执行**，所以 setTimeout 的实际执行时机一般要比其设定的时间晚一些。
    
*   刷新频率受 屏幕分辨率 和 屏幕尺寸 的影响，不同设备的屏幕绘制频率可能会不同，而 setTimeout 只能设置一个固定的时间间隔，这个时间不一定和屏幕的刷新时间相同。
    
*   **setTimeout 的执行只是在内存中对元素属性进行改变，这个变化必须要等到屏幕下次绘制时才会被更新到屏幕上。如果两者的步调不一致，就可能会导致中间某一帧的操作被跨越过去，而直接更新下一帧的元素。** 假设屏幕每隔 16.7ms 刷新一次，而 setTimeout 每隔 10ms 设置图像向左移动 1px， 就会出现如下绘制过程：
    

*   第 0 ms：屏幕未绘制，等待中，setTimeout 也未执行，等待中；
    
*   第 10 ms：屏幕未绘制，等待中，setTimeout 开始执行并设置元素属性 left=1px；
    
*   第 16.7 ms：屏幕开始绘制，屏幕上的元素向左移动了 1px， setTimeout 未执行，继续等待中；
    
*   第 20 ms：屏幕未绘制，等待中，setTimeout 开始执行并设置 left=2px;
    
*   第 30 ms：屏幕未绘制，等待中，setTimeout 开始执行并设置 left=3px;
    
*   第 33.4 ms：屏幕开始绘制，屏幕上的元素向左移动了 3px， setTimeout 未执行，继续等待中；
    
*   ...
    

从上面的绘制过程中可以看出，屏幕没有更新 left=2px 的那一帧画面，元素直接从 left=1px 的位置跳到了 left=3px 的的位置，这就是**丢帧现象**，这种现象就会引起动画卡顿。

*   setInterval 的回调函数调用之间的实际延迟小于代码中设置的延迟，因为回调函数执行所需的时间 “消耗” 了间隔的一部分，**如果回调函数执行时间长、执行次数多的话，误差也会越来越大**：
    

```
// repeat with the interval of 2 secondslet timerId = setInterval(() => console.log('tick', timerId), 2000);// after 50 seconds stopsetTimeout(() => {  clearInterval(timerId);  console.log('stop', timerId);}, 50000);
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHreGg897Tia9KOKfS0RtB01zmRBhqiaQQ0e24DqUHBYZu96Q2iaJk5by0q54j68osHvmJSDOM7QLW36w/640?wx_fmt=png)setInterval

*   嵌套的 setTimeout 可以保证固定的延迟：
    

```
let timerId = setTimeout(function tick() {  console.log('tick', timerId);  timerId = setTimeout(tick, 2000); // (*)}, 2000);
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHreGg897Tia9KOKfS0RtB01z91zt0ZD9MldibXQmFbfLPOtkwpVJTkNqOJw0H61EjTGz5b3A8pjoldw/640?wx_fmt=png)setTimeout

### requestAnimationFrame

除了上文提到的 requestAnimationFrame 的优势外，requestAnimationFrame 还有以下两个优势：

*   CPU 节能：使用 setTimeout 实现的动画，当页面被隐藏或最小化时，setTimeout 仍然在后台执行动画任务，由于此时页面处于不可见或不可用状态，刷新动画是没有意义的，完全是浪费 CPU 资源。而 requestAnimationFrame 则完全不同，**当页面处于未激活的状态下，该页面的屏幕刷新任务也会被系统暂停，因此跟着系统步伐走的 requestAnimationFrame 也会停止渲染**，当页面被激活时，动画就从上次停留的地方继续执行，有效节省了 CPU 开销。
    
*   函数节流：在高频率事件 (resize,scroll 等) 中，为了防止在一个刷新间隔内发生多次函数执行，使用 requestAnimationFrame 可**保证每个刷新间隔内，函数只被执行一次**，这样既能保证流畅性，也能更好的节省函数执行的开销。一个刷新间隔内函数执行多次是没有意义的，因为显示器每 16.7ms 刷新一次，多次绘制并不会在屏幕上体现出来。
    

### 关于最小时间间隔

*   2011 年的标准中是这么规定的：
    

*   setTimeout：如果当前正在运行的任务是由 setTimeout（）方法创建的任务，并且时间间隔小于 4ms，则将时间间隔增加到 4ms；
    
*   setInterval：如果时间间隔小于 10ms，则将时间间隔增加到 10ms。
    

*   在最新标准中：如果时间间隔小于 0，则将时间间隔设置为 0。如果**嵌套级别大于 5，并且时间间隔小于 4ms，则将时间间隔设置为 4ms。**
    

### 定时器的清除

*   由于 clearTimeout（）和 clearInterval（）清除的是同一列表（活动计时器列表）中的条目，因此可以使用这两种方法清除 setTimeout（）或 setInterval（）创建的计时器。
    

参考资料
----

*   HTML — 8.6 Timers
    
*   requestAnimationFrame
    
*   CSS3 动画和 JS 动画的比较
    
*   Scheduling: setTimeout and setInterval
    

本文首发于个人博客，欢迎指正和 star。

> 作者：独钓寒江雪
> 
> https://segmentfault.com/a/1190000038915675

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 **「在看」**，让更多的人也能看到这篇内容

2、关注官网 **https://muyiy.cn**，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 **「加群」** ，加入我们一起学习并送你精心整理的高级前端面试题。![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)》》面试官都在用的题库，快来看看《《

```
“在看”吗？在看就点一下吧

```