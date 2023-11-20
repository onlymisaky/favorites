> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CLVLIavkcijd_IK8uZdHyQ)

最近也好久没输出文章了，原因很简单，最近巨忙，，，，![](https://mmbiz.qpic.cn/mmbiz_jpg/LNrWl4n5XIJ4hZbxUaDyUvfjxYVp0PsEWgg7mVmz0qiaPM9208WhGTe48b51KdUnf0XwIsicZjyiclXATCSiaOrgiaA/640?wx_fmt=jpeg)

讲真的，最近也很迷茫。关于技术、关于生活吧。也找了很多在大厂的朋友去聊，想需求一些后期发展的思路。这其中也聊到了面试，聊到了招聘中会给面试者出的一些题目。我正好也好久没面试了，就从中选了几道。最近也会陆续出一系列关于一些面试问题的解析。

今天这道是字节跳动的：

```
实现一个批量请求函数 multiRequest(urls, maxNum)，要求如下：<br style="visibility: visible;">• 要求最大并发数 maxNum<br style="visibility: visible;">• 每当有一个请求返回，就留下一个空位，可以增加新的请求<br style="visibility: visible;">• 所有请求完成后，结果按照 urls 里面的顺序依次打出<br style="visibility: visible;">
```

这道题目我想很多同学应该都或多或少的见过，下面我会依次从出现的场景、问题的分析到最终的实现，一步步力求深入浅出的给出这道题目的完整解析。

场景
--

假设现在有这么一种场景：现有 30 个异步请求需要发送，但由于某些原因，我们必须将同一时刻并发请求数量控制在 5 个以内，同时还要尽可能快速的拿到响应结果。

应该怎么做？

首先我们来了解一下 `Ajax`的串行和并行。

基于 Promise.all 实现 Ajax 的串行和并行
-----------------------------

我们平时都是基于`promise`来封装异步请求的，这里也主要是针对异步请求来展开。

*   串行：一个异步请求完了之后在进行下一个请求
    
*   并行：多个异步请求同时进行
    

通过定义一些`promise实例`来具体演示串行 / 并行。

### 串行

```
var p = function () {  return new Promise(function (resolve, reject) {    setTimeout(() => {      console.log('1000')      resolve()    }, 1000)  })}var p1 = function () {  return new Promise(function (resolve, reject) {    setTimeout(() => {      console.log('2000')      resolve()    }, 2000)  })}var p2 = function () {  return new Promise(function (resolve, reject) {    setTimeout(() => {      console.log('3000')      resolve()    }, 3000)  })}p().then(() => {  return p1()}).then(() => {  return p2()}).then(() => {  console.log('end')})
```

如示例，串行会从上到下依次执行对应接口请求。

### 并行

通常，我们在需要保证代码在多个异步处理之后执行，会用到：

```
Promise.all(promises: []).then(fun: function);
```

`Promise.all`可以保证，`promises`数组中所有`promise`对象都达到`resolve`状态，才执行`then`回调。

```
var promises = function () {  return [1000, 2000, 3000].map(current => {    return new Promise(function (resolve, reject) {      setTimeout(() => {        console.log(current)      }, current)    })  })}Promise.all(promises()).then(() => {  console.log('end')})
```

Promise.all 并发限制
----------------

这时候考虑一个场景：如果你的`promises`数组中每个对象都是`http请求`，而这样的对象有几十万个。

那么会出现的情况是，你在瞬间发出几十万个`http请求`，这样很有可能导致堆积了无数调用栈导致内存溢出。

这时候，我们就需要考虑对`Promise.all`做并发限制。

`Promise.all并发限制`指的是，每个时刻并发执行的`promise`数量是固定的，最终的执行结果还是保持与原来的`Promise.all`一致。

题目实现
----

### 思路分析

整体采用递归调用来实现：最初发送的请求数量上限为允许的最大值，并且这些请求中的每一个都应该在完成时继续递归发送，通过传入的索引来确定了`urls`里面具体是那个`URL`，保证最后输出的顺序不会乱，而是依次输出。

### 代码实现

```
function multiRequest(urls = [], maxNum) {  // 请求总数量  const len = urls.length;  // 根据请求数量创建一个数组来保存请求的结果  const result = new Array(len).fill(false);  // 当前完成的数量  let count = 0;  return new Promise((resolve, reject) => {    // 请求maxNum个    while (count < maxNum) {      next();    }    function next() {      let current = count++;      // 处理边界条件      if (current >= len) {        // 请求全部完成就将promise置为成功状态, 然后将result作为promise值返回        !result.includes(false) && resolve(result);        return;      }      const url = urls[current];      console.log(`开始 ${current}`, new Date().toLocaleString());      fetch(url)        .then((res) => {          // 保存请求结果          result[current] = res;          console.log(`完成 ${current}`, new Date().toLocaleString());          // 请求没有全部完成, 就递归          if (current < len) {            next();          }        })        .catch((err) => {          console.log(`结束 ${current}`, new Date().toLocaleString());          result[current] = err;          // 请求没有全部完成, 就递归          if (current < len) {            next();          }        });    }  });}
```