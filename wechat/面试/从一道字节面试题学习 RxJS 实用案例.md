> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/weampC3KT2n-KVfV0RbdTQ)

点击上方 前端瓶子君，关注公众号  

回复算法，加入前端编程面试算法每日一题群

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQS0XMu3Uk9Y82TpB7esvica9kLlicG95ib3VYM91l2A9eRBVSrexWweSaGsT2GNlnAculyw8rDM0NTew/640?wx_fmt=jpeg)

### 前言：

我搜集了网络和自己实践中的一些案例，让大家感受一下 rxjs 处理异步时的优势。

本文主要目的：

1、让一些同学对 rxjs 对稍微复杂异步的简洁处理感兴趣（不需要懂 api，仅仅感受 rxjs 的优势）

2、让一些缺乏实战案例的同学练手（网上多讲 api 的，跟业务相关的案例较少，这跟 rxjs 本身流行程度并不高有关）

3、自己初步学习后的总结

### 从一个字节面试题开始：控制最大并发数

题目如下：

```
实现一个批量请求函数 multiRequest(urls, maxNum)，要求如下：
• 要求最大并发数 maxNum
• 每当有一个请求返回，就留下一个空位，可以增加新的请求
• 所有请求完成后，结果按照 urls 里面的顺序依次打出
复制代码
```

你可以先想想如果不用 rxjs，你会怎么做，我们先看用 rxjs 有多简单

```
// 假设这是你的http请求函数function httpGet(url) {  return new Promise(resolve => setTimeout(() => resolve(`Result: ${url}`), 2000));}复制代码
```

使用 rxjs 只需要 1 行代码就可以解决这个面试题，后面会写一版不用 rxjs，可以看看 promise 实现有多么麻烦。

```
const array = [  'https://httpbin.org/ip',   'https://httpbin.org/user-agent',  'https://httpbin.org/delay/3',];// mergeMap是专门用来处理并发处理的rxjs操作符// mergeMap第二个参数2的意思是，from(array)每次并发量是2，只有promise执行结束才接着取array里面的数据// mergeMap第一个参数httpGet的意思是每次并发，从from(array)中取的数据如何包装，这里是作为httpGet的参数const source = from(array).pipe(mergeMap(httpGet, 2)).subscribe(val => console.log(val));复制代码
```

在线代码预览：stackblitz.com/edit/rxjs-q…[1] （注意控制台打印顺序）

以下是 promise 的版本，代码多而且是面向过程的面条代码（如果不用 rxjs 的化，一般场景建议使用 ramda 库，用 “流” 或者函数组合的方式来编写函数，让你的功能模块远离面条代码（面条代码 = 难以维护的面向过程的代码）），文章最后闲聊会讲业务不复杂的场景，怎么使用 ramda。

以下是用 promise 解决上述面试题的思路，可以看到大量的临时变量，while 函数，if 语句，让代码变得难以维护（并不是拒绝这种代码，毕竟优雅的接口后面很可能是 “龌龊的实现”), 但如果有工具帮助你直接使用优雅的接口，降低了复杂度，何乐而不用呢

```
function multiRequest(urls = [], maxNum) {  // 请求总数量  const len = urls.length;  // 根据请求数量创建一个数组来保存请求的结果  const result = new Array(len).fill(false);  // 当前完成的数量  let count = 0;   return new Promise((resolve, reject) => {    // 请求maxNum个    while (count < maxNum) {      next();    }    function next() {      let current = count++;      // 处理边界条件      if (current >= len) {        // 请求全部完成就将promise置为成功状态, 然后将result作为promise值返回        !result.includes(false) && resolve(result);        return;      }      const url = urls[current];      console.log(`开始 ${current}`, new Date().toLocaleString());      fetch(url)        .then((res) => {          // 保存请求结果          result[current] = res;          console.log(`完成 ${current}`, new Date().toLocaleString());          // 请求没有全部完成, 就递归          if (current < len) {            next();          }        })        .catch((err) => {          console.log(`结束 ${current}`, new Date().toLocaleString());          result[current] = err;          // 请求没有全部完成, 就递归          if (current < len) {            next();          }        });    }  });}复制代码
```

我们再来一个面试题，这是我自己面腾讯的时候自己遇到的关于 ajax 请求并发的问题，当时刚转前端回答的不是很好。题目如下：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS0XMu3Uk9Y82TpB7esvica9cTHaZNaL1w1icY9yPLJZgCBEpXH18LXYQLkkqMib76BZcmqKGhCk1vDw/640?wx_fmt=png) 再进一步说明问题

按钮 A 按了之后，ajax 请求的数据显示在 input type=text 框里，B 按钮也是。

问题就是如果先按 A，此时 ajax 发出去了，但是数据还没返回来, 我们等不及了，马上按 B 按钮，结果此时 A 按钮请求的数据先回来，这就尴尬了，按的 B 按钮，结果先显示 A 按钮返回的数据，怎么解决？

这个问题可以在在 A 按钮按了之后，再按 B 按钮的时候，取消 a 按钮发出的请求，这个 ajax 和 fetch 都是有方法实现的，ajax 原生自带 cancel 方法，fetch 的话要自己写一下，大概思路如下（如何取消 fetch）

```
function abortableFetch(request, opts) {  const controller = new AbortController();  const signal = controller.signal;  return {    abort: () => controller.abort(),    ready: fetch(request, { ...opts, signal })  };}复制代码
```

别看上面封装的挺不错的，但是用起来还是有点麻烦，而且耦合性有点高，因为我要在 B 按钮的 onClick 事件里面去调用 A 按钮的 abort 方法。

好了，我们基于 rxjs 来写一个通用的处理方案（要说函数间的解耦，发布订阅模式有点万能的感觉，rxjs 的 new Subject 也是一样的思想）

```
import { Subject } from 'rxjs';import { switchMap } from 'rxjs/operators';// 假设这是你的http请求函数function httpGet(url: any): any {  return new Promise(resolve =>    setTimeout(() => resolve(`Result: ${url}`), 2000)  );}class abortableFetch {  search: Subject<any>;  constructor() {    this.search = new Subject();    this.init();  }  init() {    this.search      .pipe((switchMap as any)((value: any): any => httpGet(value)))      .subscribe(val => console.log(val));  }  trigger(value) {    this.search.next(value);  }}// 使用方式，非常简单，就一个trigger方法就可以了const switchFetch = new abortableFetch();switchFetch.trigger(123);setTimeout(() => {  switchFetch.trigger(456);}, 1000);复制代码
```

请注意此案例控制台输出的是 456 而不是 123，因为 456 后输出把之前的 123 覆盖了，相当于取消了之前的请求

在线预览此案例：stackblitz.com/edit/rxjs-z…[2]

好了，上面两个例子可以看出 rxjs 最大的优点：

1、函数式编程在写一些小功能的时候，解耦非常简单，天然满足高内聚、低耦合

2、rxjs 在处理异步（比如网络 IO 和 UI 交互）时，写一些小功能时，代码量较少，语义性很强

但是问题也很突出，就是掌握好 rxjs，真的不容易，都不说 rxjs 了，用 ramda 库或函数式变成的库的前端在我经历里都很少。

接下来，下面就是基于 rxjs 的一些案例。

#### 1、buffer 相关操作符案例

bufferTime：比如你写一个基于 websocket 的在线聊天室，不可能每次 ws 收到新消息，都立刻渲染出来，这样在很多人同时说话的时候，一般会有渲染性能问题。。

所以你需要收集一段时间的消息，然后把它们一起渲染出来，例如每一秒批量渲染一次。用原生 JS 写的话，你需要维护一个队列池，和一个定时器，收到消息，先放进队列池，然后定时器负责把消息渲染出来，类似：

```
let messagePool = []ws.on('message', (message) => {    messagePool.push(message)})setInterval(() => {    render(messagePool)    messagePool = []}, 1000)复制代码
```

这里已经是最简化的代码了，但逻辑依然很破碎，并且还要考虑清理定时器的问题。如果用 RxJS，代码就好看了很多

```
import { fromEvent } from 'rxjs';import { switchMap } from 'rxjs/operators'; fromEvent(ws, 'message')     .pipe(bufferTime(1000))    .subscribe(messages => render(messages))复制代码
```

记录鼠标两秒能点击多少次

```
fromEvent(document,'click').pipe(    bufferTime(2000),    map(array=>array.length)).subscribe(count => {    console.log("两秒内点击次数", count);  });复制代码
```

bufferCount: 另外一个例子，比如我们在写一个游戏，当用户连续输入 "上上下下左右左右 BABA" 的时候，就弹出隐藏的彩蛋，用原生 JS 的话也是需要维护一个队列，队列中放入最近 12 次用户的输入。然后每次按键的时候，都识别是否触发了彩蛋。RxJS 的话就简化了很多，主要是少了维护队列的逻辑：

```
const code = [   "ArrowUp",   "ArrowUp",   "ArrowDown",   "ArrowDown",   "ArrowLeft",   "ArrowRight",   "ArrowLeft",   "ArrowRight",   "KeyB",   "KeyA",   "KeyB",   "KeyA"]fromEvent(document, 'keyup').pipe(   map(e => e.code),   bufferCount(12, 1)).subscribe(last12key => {        if (_.isEqual(last12key, code)) {            console.log('隐藏的彩蛋 \(^o^)/~')        }    })复制代码
```

当然 RxJS 还可以复杂得多的逻辑，比如要求只有在两秒内连续输入秘籍，才能触发彩蛋，这里该怎么写

```
import { fromEvent } from 'rxjs';import { bufferCount, map, auditTime } from 'rxjs/operators';const code = ['KeyA', 'KeyB', 'KeyA'];fromEvent(document, 'keyup')  .pipe(    map(e => (e as any).code),    bufferCount(3, 1),    auditTime(2000)  )  .subscribe(last3key => {    if (_.isEqual(last3key, code)) {        console.log('隐藏的彩蛋 \(^o^)/~')    }  });复制代码
```

#### 2、简易拖拉

实现内容如下：

1、首先页面上有一個元素 (#drag)

2、当鼠标在元素 (#drag) 上按下左键 (mousedown) 时，开始监听鼠标移动 (mousemove) 的位置

3、当鼠标左键释放（mouseup）时，结束监听鼠标的移动

4、当鼠标移动被监听时，跟着修改原件的样式属性

```
import { of, fromEvent} from 'rxjs'; import { map, concatMap, takeUntil, withLatestFrom } from 'rxjs/operators'; // 样式省略是绝对定位const dragEle = document.getElementById('drag')const mouseDown = fromEvent(dragEle, 'mousedown')const mouseUp = fromEvent(document, 'mouseup')const mouseMove = fromEvent(document, 'mousemove')mouseDown.pipe(  concatMap(e => mouseMove.pipe(takeUntil(mouseUp))),  withLatestFrom(mouseDown, (move: MouseEvent, down: MouseEvent) => {        return {            x: move.clientX - down.offsetX,            y: move.clientY - down.offsetY        }  })).subscribe(pos => {        dragEle.style.top = pos.y + 'px';        dragEle.style.left = pos.x + 'px';})复制代码
```

在线预览：stackblitz.com/edit/rxjs-s…[3]

### 3、简易 autoComponent 功能

实现内容如下：

1、准备 input#search 以及 ul#suggest-list 的 HTML 与 CSS

2、在 input#search 输入文字时，等待 100 毫秒后若无输入，就发送 HTTP Request

3、当 Response 还没回来时，使用者又输入了下一哥文字就舍弃前一次的，并再发送一次新的 Request

4、接受到 Response 之后显示下拉选项

5、鼠标左键选中对应的下拉响，取代 input#search 的文字

```
import { fromEvent } from "rxjs";import { map, debounceTime, switchMap } from "rxjs/operators";const url = 'https://zh.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&origin=*';const getSuggestList = (keyword) => fetch(url + '&search=' + keyword, { method: 'GET', mode: 'cors' })                                    .then(res => res.json())const searchInput = document.getElementById('search');const suggestList = document.getElementById('suggest-list');const keyword = fromEvent(searchInput, 'input');const selectItem = fromEvent(suggestList, 'click');const render = (suggestArr = []) => suggestList.innerHTML = suggestArr.map(item => '<li>'+ item +'</li>').join('')keyword.pipe(  debounceTime(100),  switchMap(    (e: any) => getSuggestList(e.target.value),    (e, res) => res[1]  )).subscribe(list => render(list))   selectItem.pipe(  map(e => e.target.innerText)).subscribe(text => {       searchInput.value = text;      render();  })复制代码
```

在线预览：stackblitz.com/edit/rxjs-x…[4]

好了，介绍到这里，我个人的感觉是 rxjs 在处理网络层和 ui 层的逻辑时，在某些特定场景会非常简单。我在此推荐两个非常好的教程，我看到网上居然没人推荐这两个 rxjs 学习的教程（上面有个别案例就是从此来的）。

打通 rxjs 任督二脉：ithelp.ithome.com.tw/users/20020…[5]

30 天精通 rxjs：ithelp.ithome.com.tw/articles/10…[6]

文章最后，安利另一个函数式编程的库 ramdajs，rxjs 属于最近才学的，还没用到项目中

ramdajs 是自己用了大概 3 个月了，有一些心得，确实写了之后代码的可维护性变的高很多，原因就是你必须遵守设计模式里的单一职责原则，所有功能能复用的函数都会提取出来（用函数式编程会强行让你养成这个习惯）

附一段我自己项目里 ramdajs 的代码，完毕。

```
// 这个函数的意思是，在函数链里面，如果其中一个函数返回是null或者undefined就终止函数链const pipeWhileNotNil = R.pipeWith((f, res) =>  R.isNil(res) ? res : f(res),);pipeWhileNotNil([  // checkData用表单校验用的，如果不通过返回null，这个函数链条就终止，不会往下走  // R__是占位符，被R.curry函数柯里化之后，就可以用R.__充当你函数参数的占位符  // 数组里的参数不用管，是业务上需要自定义的  checkData(R.__, ['sdExchangeRate', 'sdEffectDate']),  // 此函数用来筛选,相当于数组的find方法，format2YYYYMMDD是dayjs用来格式化日期的  R.find(      (v) =>        v?.effectDate === format2YYYYMMDD(sdEffectDate),  ),  // pipeP是promise函数流的方法，第一个参数必须是promise函数，后面的函数相当于promise里的then里面的函数  R.pipeP(    // 上一个函数执行结果会传给existEqualEffectDate    // promiseModal是一个弹框组件，询问是否要继续某个操作    async (existEqualEffectDate) => {      if (existEqualEffectDate) {        return await promiseModal({          title: `生效日期已存在，是否直接修改汇率？`,        });      } else {        return await promiseModal({          title: `保存后生效日期不可修改，确定保存？`,        });      }    },    // 最后根据上一个返回的结果是ture还是false进行最后的操作，R.pipe是同步函数链方法，dispatch是redux里的dispatch    (isGo) => isGo ? R.pipe(R.tail, saveData(dispatch))(data) : dispatch({      type: 'currencyAndExchange/getExchangePairList',    });  ),])(record);复制代码
```

关于本文

来源：孟祥_成都
========

https://juejin.cn/post/6976071705584205855

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

 》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持