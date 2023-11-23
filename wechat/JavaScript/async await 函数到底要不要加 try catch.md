> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/PTOBhV75TrITyW0hhEikkg)

↓推荐关注↓

> 作者：Ethan_Zhou
> 
> https://juejin.cn/post/7213362932423376933

前言
--

写异步函数的时候，promise 和 async 两种方案都非常常见，甚至同一个项目里，不同的开发人员都使用不同的习惯, 不过关于两者的比较不是本文关注的重点，只总结为一句话：“async 是异步编程的终极解决方案”。

当使用 async 函数的时候，很多文章都说建议用 `try catch` 来捕获异常, 可是实际上我看了很多项目的代码，遵循的并不是严谨，很多都没有用，甚至 catch 函数都没写，这是为什么呢？

我们先看下使用 try catch 情况下的代码示例：

示例 1 ：使用 try catch
------------------

```
function getUserInfo () {    return new Promise((resolve, reject) => {        setTimeout(() => {                reject('请求异常')        }, 1000)    })}async function logined () {    try {        let userInfo = await getUserInfo()        // 执行中断        let pageInfo = await getPageInfo(userInfo?.userId)    } catch(e) {        console.warn(e)    }}logined()
```

执行后会在 catch 里捕获 `请求异常`，然后 getUserInfo 函数中断执行，这是符合逻辑的，对于有依赖关系的接口，中断执行可以避免程序崩溃，这里唯一的问题是 try catch 貌似占据了太多行数，如果每个接口都写的话看起来略显冗余。

示例 2：直接 catch
-------------

鉴于正常情况下，`await` 命令后面是一个 Promise 对象, 所以上面代码可以很自然的想到优化方案：

```
function getUserInfo () {    return new Promise((resolve, reject) => {        setTimeout(() => {                reject('请求异常')        }, 1000)    })}async function logined () {    let userInfo = await getUserInfo().catch(e => console.warn(e))    // 执行没有中断，userInfo 为 undefined    if (!userInfo) return // 需要做非空校验    let pageInfo = await getPageInfo(userInfo?.userId)}logined()
```

执行后 catch 可以正常捕获异常，但是程序没有中断，返回值 `userInfo` 为 `undefined`, 所以如果这样写的话，就需要对返回值进行非空校验, `if (!userInfo) return` 我觉得这样有点反逻辑，异常时就应该中断执行才对；

示例 3：在 catch 里 reject
---------------------

可以继续优化，在 catch 里面加一行 `return Promise.reject(e)`, 可以使 await 中断执行；

完整代码：

```
function getUserInfo () {    return new Promise((resolve, reject) => {        setTimeout(() => {            reject('请求异常')        }, 1000)    })}async function logined () {    let userInfo = await getUserInfo().catch(e => {        console.warn(e)        return Promise.reject(e) // 会导致控制台出现 uncaught (in promise) 报错信息    })    // 执行中断    let pageInfo = await getPageInfo(userInfo?.userId)}logined()
```

一般我们在项目里都是用 axios 或者 fetch 之类发送请求，会对其进行一个封装，也可以在里面进行 catch 操作，对错误信息先一步处理，至于是否需要 reject，就看你是否想要在 await 命令异常时候中断了；不使用 reject 则不会中断，但是需要每个接口拿到 response 后先 非空校验， 使用 reject 则会在异常处中断，并且会在控制台暴露 `uncaught (in promise)` 报错信息。

![](https://mmbiz.qpic.cn/mmbiz_jpg/mshqAkialV7GRWsYnwM0CEyN2x6OQ6KWoYicpeMPGjumWkABj8lpBeibfCruuicVx2wg5k84WscUKy4aRKGUp1oKfw/640?wx_fmt=jpeg)  

建议
--

不需要在 await 处异常时中断，可以这样写，需要做非空校验，控制台不会有报错信息

```
let userInfo = await getUserInfo().catch(e => console.warn(e))if (!userInfo) return
```

需要在 await 处异常时中断，并且在意控制台报错，可以这样写

```
try {    let userInfo = await getUserInfo()    // 执行中断    let pageInfo = await getPageInfo(userInfo?.userId)} catch(e) {    console.warn(e)}
```

需要在 await 处异常时中断，但是不在意控制台报错，则可以这样写

```
let userInfo = await getUserInfo().catch(e => {    console.warn(e)    return Promise.reject(e) // 会导致控制台出现 uncaught (in promise) 报错信息})// 执行中断let pageInfo = await getPageInfo(userInfo?.userId)
```

总结
--

几种写法，初看可能觉得第三种 catch 这种写法是最好的，但是细想下，从用户体验上来看，我觉得 try catch 是最好的，逻辑直观、符合同步编程思维，控制台不会暴露 `uncaught (in promise)` 报错信息；

而链式调用的 catch (里面再 reject)，是传统 promise 的回调写法，既然已经用 async await 这种同步编程写法了，再用 catch 链式写法，感觉没必要。

- EOF -

推荐阅读  点击标题可跳转

1、[Google 有一个函数，20000 个变量……](http://mp.weixin.qq.com/s?__biz=MjM5OTA1MDUyMA==&mid=2655483076&idx=1&sn=44f3ff6dedca9cda638a9be7c36b4890&chksm=bd72b8b38a0531a5ee0f40c670fdf549d518c1292507c0305cd040347b7aa3711d1dc862cbe9&scene=21#wechat_redirect)  

2、[员工每天 “带薪如厕”3~6 小时被开，官司一直打到高院](http://mp.weixin.qq.com/s?__biz=MjM5OTA1MDUyMA==&mid=2655482878&idx=1&sn=04c5424f7b3908680cbab5c46abf05ba&chksm=bd72bf898a05369f1d740ec4fc90b4a2a9f1da80fe9d38900d4d5c0118114b05342f53e407ce&scene=21#wechat_redirect)

3、[已刑拘！人大毕业生盗取学生信息建 “颜值打分” 网站](http://mp.weixin.qq.com/s?__biz=MjM5OTA1MDUyMA==&mid=2655483160&idx=1&sn=39045cba067e35ef1c3e262117b3d216&chksm=bd72b96f8a0530792e112a5ba412e45ec381a0bf2e84d2a6f76f8241cdf9ba7948cda4c03213&scene=21#wechat_redirect)

关注「程序员的那些事」加星标，不错过圈内事  

点赞和在看就是最大的支持❤️