> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/uxSoXkmi5KIGNPsyd5cXrA)

大厂技术  坚持周更  精选好文
================

前言
--

随着 web 的发展与普及，前端页面不仅只加载在浏览器上，也慢慢流行于各种 app 的 webview 里。尤其在如今设备性能越来越好的条件下，前端页面更是开始在 app 中担任重要的角色。如此一来，前端页面的停留时间变得更长，我们理应越发重视前端的内存管理，防止内存泄露，提高页面的性能。

想要打造高性能前端应用，防止崩溃，就必须得搞清楚 JS 的内存机制，其实就是弄清楚 JS 内存的分配与回收。

JS 数据存储机制
---------

### 内存空间

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LCQjPmxlCwElxBB6ZApcU2G5icCFH9zkJZJeNU5B8HHXiaLu5QWEicnkgQ/640?wx_fmt=png)

从图中可以看出， 在 JavaScript 的执行过程中， 主要有三种类型内存空间，分别是代码空间、栈空间和堆空间。

**代码空间**：用来存放可执行代码

**栈空间**：一块连续的内存区域，容量较小，读取速度快，被设计成先进后出结构

**堆空间**：不连续的内存区域，容量较大，用于储存大数据，读取速度慢

### 数据类型

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LZ7PNmCeIRpZlPicUyBHGp7ibxibQ7kyhFJY6rQm54qFyKPuvMgww2YD1Q/640?wx_fmt=png)

JavaScript 发展至今总共有八种数据类型，其中 Object 类型称为引用类型，其余七种称为基本类型，Object 是由其余七种基本类型组成的 kv 结构数据。

### 栈空间和堆空间

栈空间其实就是 JavaScript 中的调用栈，是用来储存执行上下文，以及存储执行上下文中的一些基本类型中的小数据，如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lxicic7WeCoI5KrHa9l88CJkx3FT5iagibAtiaRjkkq9MJ2q1xlEQrZawiavA/640?wx_fmt=png)image.png

**变量环境：** 存放 var 声明与函数声明的变量空间，编译时就能确定，不受块级作用域影响

**词法环境：** 存放 let 与 const 声明的变量空间，编译时不能完全确定，受块级作用域影响

而堆空间，则是用来储存大数据如引用类型，然后把他们的引用地址保存到栈空间的变量中，所以多了这一道中转，JavaScript 对堆空间数据的读取自然会比栈空间数据的要慢，可以用下图表示两者关系：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7La9vWAicxicSvaNaD13zRVUuP7jYKl65ZUcbFiaGOpFicY0nNKjtiaqYEfeA/640?wx_fmt=png)通常情况下，栈空间都不会设置太大，这是因为 JavaScript 引擎需要用栈来维护程序执行期间上下文的状态，如果栈空间大了的话，所有的数据都存放在栈空间里面，那么会影响到上下文切换的效率，进而又影响到整个程序的执行效率。

### 闭包

> 内部函数总是可以访问其外部函数中声明的变量，当通过调用一个外部函数返回一个内部函数后，即使该外部函数已经执行结束了，但是内部函数引用外部函数的变量依然保存在内存中，我们就把这些变量的集合称为闭包

闭包中的数据会组成一个对象，然后保存在堆空间中，如：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lo6AcvMiasLPNKgUXH90bfJEVUdADMIC9qVSkpAz7PPMXUibcP3q0uiavg/640?wx_fmt=png)

可以利用开发者工具查看闭包情况，其中括号中的名称就是产生闭包的函数名。一般我们会认为闭包是返回的内部函数引用的变量集合，但闭包有一个较为迷惑的情况，如下：

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LWObO6UMNRZbcIfjFIbicOHncULRMX0SX5sKCic4REbcOJak7oXibKqr2g/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Ldj8ibl11wo5lEef6EBYHgXibJpMFAPXib9kia7VV6nnzcWNvJkSvfpjxEQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LrGZSic35Y1z4ibvicn3zotKfZG6ZicP7StU0KluzK1dtX3ibOwt7ibMoechg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lh3R3pDsSb5VHgz5ySibe3estj7kLjic4SvT7Vq5dgCNhLWB2mtk3SW0g/640?wx_fmt=png)

可以理解为，如果函数存在闭包，其所有内部函数都会拥有一个指向这个闭包的引用，即所有内部函数会共享同一个闭包，只要任意内部函数有引用外部函数中声明的变量，这个变量都会被纳入闭包内，而且最内部的函数会持有所有外部的闭包。

### 堆栈存放的数据类型

原始类型的数据是存放在栈中，引用类型的数据是存放在堆中？

上面这句话是用来描述栈中数据的存储情况，调用栈中的引用类型存放在堆中，相信大家都没有问题，但是原始类型真的都存放在栈中吗？

**数字**

V8 把数字分成两种类型：smi 和 heapNumber

smi 是范围为 ：-2³¹ 到 2³¹-1 的整数，在栈中直接存值；除了 smi，其余数字类型都是 heapNumber，需要另外开辟堆空间进行储存，变量保存其引用。

```
var times = 50000;var smi_in_stack = 1;var heap_number = 1.1;// about 1.5~1.6ms, fastconsole.time('smi_in_stack');for (let i = 0; i < times; i++) {  smi_in_stack++;}console.timeEnd('smi_in_stack');// about 2.1~2.5ms, slowconsole.time('heap_number');for (let i = 0; i < times; i++) {  heap_number++;}console.timeEnd('heap_number');
```

同时我们可以通过 heap snapshots 观察到 heap_number 的存在，所以验证了栈中的 heapNumber 值是存在堆中，smi 值是直接存在栈中。

**更基本的基本类型**

V8 定义了一种 oddball[1] 类型，属于 oddball 类型的有 null、undefined、true 和 false

```
function BasicType() {  this.oddBall1 = true;  this.oddBall2 = false;  this.oddBall3 = undefined;  this.oddBall4 = null;  this.oddBall5 = '';}const obj1 = new BasicType();const obj2 = new BasicType();
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lym1huycKl8FTDbyBhwnvI4xBr9nsgjXb7cWrBngBTJB4wdgBM3dkfw/640?wx_fmt=png)

这里可以看到 oddball 类型以及空字符串的堆引用全部都是一个固定值，代表在 V8 跑起来的第一时间，不管我们有没有声明这些基本类型，他们都已经在堆中被创建完毕了。由此猜想栈中这些类型使用的也是堆中的地址。

```
function Obj() {  this.string = 'str';  this.num1 = 1;  this.num2 = 1.1;  this.bigInt = BigInt('1');  this.symbol = Symbol('1');}const obj = new Obj();debugger;obj.string = 'other str';obj.num1 = 2;obj.num2 = 1;obj.bigInt = BigInt('2');obj.symbol = Symbol('2');
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LzibjlA6zS0PIOGAiazt26QlzsKKOtJvBQXq0EJgqTib7ibDIdFqXHTqPIw/640?wx_fmt=png)

**debugger 后内存快照**

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LwrUlTwhPszMib6MneQ6UWpAthLcY3SUtkHKmib2S3xBnEANULc5ZYlEw/640?wx_fmt=png)

其中 bigInt、string、symbol 的内存地址都进行了更换，由此可以猜想是因为这三种类型占用的内存大小不是一个固定值，需要根据其值进行动态分配，所以内存地址会进行更换；而 heapNumber 的内存地址并没有发生变化，这个更换值的操作还是在原来的内存空间中进行。因为栈是一块连续的内存空间，不希望运行中会产生内存碎片，由此可以得出 bigInt、string、symbol 这些内存大小不固定的类型在栈中也是保存其堆内存的引用。同时我们在栈中可以声明很大的 string，如果 string 存放在栈中明显也不合理

**故栈空间中的基本类型储存位置如下：**

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">类型</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); min-width: 85px;">储存位置</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Number</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">smi 储存栈中，heapNumber 储存堆中</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">String</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">堆</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Boolean</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">堆</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Null</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">堆</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">undefined</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">堆</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">BigInit</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">堆</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">Symbol</td><td data-style="border-color: rgb(204, 204, 204); min-width: 85px;">堆</td></tr></tbody></table>

上述结论主要是从 heap snapshots 和栈的特性中得出，毕竟最正确的答案是在源码中获得，如有不当，请指正。

JS 内存回收
-------

### 栈内存回收

```
function fn1() {  //....  function fn2() {    //...  }  fn2();}fn1();
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LNHiau8EAU2KSDEvaPicnhvHXgw8yGKm8F2ltNOGzmtTMiaJdyy32ic3T3A/640?wx_fmt=png)调用栈中有一个记录当前执行状态的指针（称为 ESP），随着函数的执行，函数执行上下文被压入调用栈中，执行上下文中的数据会按照前面说的 JS 数据存储机制被分配到堆栈中，ESP 会指向最后压栈的执行上下文，如左图所示的 fn2 函数。当 fn2 函数调用完毕，JS 会把 ESP 指针下移至 fn1 函数，这个指针下移的操作就是销毁 fn1 函数执行上下文的过程。最后 fn1 函数执行上下文所占用的区域会变成无效区域，下一个函数执行上下文压入调用栈的时候会直接覆盖其内存空间。简而言之，只要函数调用结束，该栈内存就会自动被回收，不需要我们操心。刚刚我们也聊到闭包，如果出现闭包的情况，闭包的数据就会组成一个对象保存在堆空间里。

### 堆内存回收

内存垃圾回收领域中有个重要术语：**代际假说**，其有以下两个特点：

1.  大部分对象在内存中存在的时间很短，简单来说，就是很多对象一经分配内存，很快就变得不可访问；
    

2.  不死的对象，会活得更久。
    

基于代际假说，JS 把堆空间分成新生代和老生代两个区域，新生代中存放的是生存时间短的对象，通常只支持 1～8M 的容量；老生代中存放的生存时间长的对象，一些大的数据也会被直接分配到老生区中。而针对这两个区域，JS 存在两个垃圾回收器：主垃圾处理器和副垃圾处理器。这里先说说垃圾回收一般都有相同的执行流程：

1.  标记空间中活动对象和非活动对象
    

2.  回收非活动对象所占据的内存
    

3.  内存整理，这步是可选的，因为有的垃圾回收器工作过程会产生内存碎片，这时就需要内存整理防止不够连续空间分配给大数据
    

#### 副垃圾回收器

副垃圾回收器主要是采用 Scavenge 算法进行新生区的垃圾回收，它把新生区划分为两个区域：对象区域和空闲区域，新加入的对象都会存放到对象区域，当对象区域快被写满时，会对对象区域进行垃圾标记，把存活对象复制并有序排列至空闲区域，完成后让这两个区域角色互转，由此便能无限循环进行垃圾回收。同时存在对象晋升策略，也就是经过两次垃圾回收依然还存活的对象，会被移动到老生区中。

#### 主垃圾回收器

由于老生区空间大，数据大，所以不适用 Scavenge 算法，主要是采用标记 - 整理算法，其工作流程是从一组根元素开始，递归遍历这组根元素，在这个遍历过程中，能到达的元素称为活动对象，没有到达的元素就可以判断为垃圾数据。接着让所有存活的对象都向一端移动，然后直接清理掉端边界以外的内存。垃圾回收工作是需要占用主线程的，必须暂停 JS 脚本执行等待垃圾回收完成后恢复，这种行为称为**全停顿。** 由于老生代内存大，全停顿对性能的影响非常大，所以出现了增量标记的策略进行老生区的垃圾回收。

JS 内存泄漏
-------

由于栈内存会随着函数调用结束而被释放 (覆盖)，所以 JS 中的内存泄漏一般发生在堆中。之前有同学分享过一篇关于内存泄漏的文章 ，里面讲到一些常见内存泄漏的原因和监测手段，这里我就不赘述，但是可以根据最近的 IM 工作讲一些实践：

### 确认是否有内存泄漏的情况

1.  本地打包一个去掉压缩、拥有 sourcemap 及没有任何 console 的生产版本（console 会保留对象引用，阻碍销毁；去掉压缩和保留 sourcemap 有利于定位源码）
    

2.  启动本地服务器，使 cef 访问本地项目
    

3.  不断操作和记录 heap snapshots，观察 snapshots 和 timeline 情况
    

4.  最终内存从 22.5m 上升至 34.6m，conversation 实例从 443 上升至 1117，message 实例从 443 上升至 1287，而该用户实际只有 221 个会话
    

5.  不断在会话间切换，通过 timeline 看到有内存没被释放，而且生成 detached dom
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lmwno1vdANcfy0yhSwcALSDUYJlsb2LPuZFBJ7qTeHIFsc33WGLGC2Q/640?wx_fmt=png)

通过上述观测，可以判断为有内存泄漏情况。

### 确定内存泄漏排查方式

IM 页分为：会话列表，会话顶栏，消息列表，输入框四部分。使用逐一排查法缩小排查范围，排查各个部分内存情况。如：先保留会话列表，注释其余三个部分，操作会话列表并使用 timeline 和 heap snapshots 进行内存排查。按照这一方法逐步排查四个部分组件，并针对各个组件进行优化。可以简单归纳成一个通用步骤：

1.  使用 timeline 进行录制，观察是否像上面那样有不被释放的内存区域
    

2.  选择不被释放的区域进行查看，先找自己项目中的锚点物：像我们 IM 数据都是用 conversation 和 messsage 对象进行储存，所以可以先进行这两个对象的搜索查看
    

3.  如果没有好的锚点物也没关系，接着查看 detached dom（毕竟很多事件绑定在 dom 中，事件中引用着数据，造成无法被释放）和 string
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7L97JP2rIUhulGlGcovM90bsPQEJ2hR52TxnqRHP1KMeAGrfnL8vBP6g/640?wx_fmt=png)

有些 detached dom 可能是 react 虚拟 dom 的数据，但像上面的 Detached HTMLAudioElement 会随着操作一直增加，所以这个是不正常的。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LibefrAbAp8BGSuyvuXLiabCSVGv59IPOfchDhCeFdRgoRMl4tVLTGTtw/640?wx_fmt=png)

像这里 string 的重复，经排查是有相同 conversation 和 message 对象引起

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LObOuNaK3gg0y5NJ4gVogY9Ww23JoDNEdamXHIBYsloRBaPLSnIFKMA/640?wx_fmt=png)

堆快照里包含太多运行时、上下文等信息，实在太难从中找到有用的信息，所以会把目标放在锚点物、detached dom 和 string 上

4.  利用 heap snapshot 的 comparison 模式过滤出操作阶段内存变更情况，更有利于查找影响位置
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7L8YIUvcMhDX9puz8rwXn7F0C28BlZj1MmiboRVd0Y5AaHw1wdKbpsZ3A/640?wx_fmt=png)

上面是个人进行内存泄露排查整理的方法，如果你有更好的方法，欢迎交流∠(° ゝ °)

### React 中一个需要注意的内存泄漏问题

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LDx86OyG348GBdMHl6ic6JOdX4HIYx7oKaAPPexoqiciaSQMRnbmDZyP1w/640?wx_fmt=png)

**现象：** 当组件被销毁后，仍有一些异步事件调用组件中 setState 方法

**原理：** 组件销毁后，再调用 setstate 方法会保留相关引用，造成内存泄漏

```
// 测试代码const [test, setTest] = useState(null);useEffect(() => {  (async () => {    // 这里表达一个异步操作如：xhr、fetch、promise等等    await sleep(3000);    const obj = new TestObj();    setTest(obj);  })();}, []);
```

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LlnxqbjE6Bk2P7ibfEkjGduibib2qpZ94xL4xZ2AjkuML4hHuXGiaBREccw/640?wx_fmt=png)

如果把代码改成这样，就不会造成内存泄漏：

```
const [test, setTest] = useState(null);useEffect(() => {  let unMounted = false;  (async () => {    await sleep(3000);    if (unMounted) return;    const obj = new TestObj();    setTest(obj);  })();  return () => {    unMounted = true;  };}, []);
```

这是在开发环境测试的，翻看源码发现 react 只会在开发模式保留这些引用，然后抛出 warning 来提醒开发者这里可能有内存泄漏的问题（如这些 setState 是注册在全局事件里或者 setInterval 里的调用），生产环境是不会对其进行引用，所以不需要额外进行处理也不会造成内存泄漏

![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Lq6a5Ln65vNa904P5rNEupUAva7aqiaANicRmkiakc3A5sQJrEW4NvaILQ/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7Llp154fFTLPib8LG8VbJcqnaKr0xvNibnichcdOhAAYgiaQDWsHicWDCjnxg/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LJOA5a9icehmEyH6z2EBurhXYN80YwPPO5EmicIQibrorOe8WpOPdQa9cQ/640?wx_fmt=jpeg)

react18 更是直接把这个报错给干掉，以免误导开发者使用刚刚说的类似手段来进行避免报错，这里有做解释：https://github.com/facebook/react/pull/22114

![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIqc5lpEFSQQfQkdUeFEjH7LRlkLvhZ1AsQxnYwZzqwH2LUIWITwsN16ibspFA3Dm81icibfcunRK49nA/640?wx_fmt=jpeg)

总结
--

本文先是讲述 js 类型在内存空间的储存位置，接着探讨堆栈中的内存是如何进行回收，最后描述内存泄漏确定和排查的方法，也补充一个 react 中有关 setState 造成 “内存泄漏” 的例子。内存泄漏在复杂应用中是难以避免的，个人排查也只能是解决一些比较明显的内存泄漏现象。所以为了更好地解决这个应用内内存泄漏问题，必须做好线上监控，利用广大用户操作数据，发现内存泄漏问题，进而不断改善应用的性能。

参考资料
----

1.  https://developer.chrome.com/docs/devtools/memory-problems/memory-101/
    

2.  https://www.cnblogs.com/goloving/p/15352261.html
    

3.  https://hashnode.com/post/does-javascript-use-stack-or-heap-for-memory-allocation-or-both-cj5jl90xl01nh1twuv8ug0bjk
    

4.  https://www.ditdot.hr/en/causes-of-memory-leaks-in-javascript-and-how-to-avoid-them
    

### 参考资料

[1]

oddball: _https://github.com/v8/v8/blob/c736a452575f406c9a05a8c202b0708cb60d43e5/src/objects.h#L9368_

- END -

❤️ 谢谢支持
=======

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 **分享、点赞、收藏** 三连哦~。

欢迎关注公众号 **ELab 团队** 收获大厂一手好文章~

> 我们来自字节跳动，是旗下大力教育前端部门，负责字节跳动教育全线产品前端开发工作。
> 
> 我们围绕产品品质提升、开发效率、创意与前沿技术等方向沉淀与传播专业知识及案例，为业界贡献经验价值。包括但不限于性能监控、组件库、多端技术、Serverless、可视化搭建、音视频、人工智能、产品设计与营销等内容。

字节跳动校 / 社招内推码: T1NC3ZW 

投递链接: https://job.toutiao.com/s/NcQnqc4