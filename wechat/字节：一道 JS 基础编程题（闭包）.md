> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/qjvWoiZu6KQwTmwqRSjBhg)

面试官也在看的前端面试资料

题目：

```
var foo = function(...args) {     // 要求实现函数体}var f1 = foo(1,2,3); f1.getValue(); // 6 输出是参数的和var f2 = foo(1)(2,3); f2.getValue(); // 6var f3 = foo(1)(2)(3)(4); f3.getValue(); // 10
```

解答：(@Ishmael-Yoko)

```
function foo(...args) {  const target = (...arg1s) => foo(...[...args, ...arg1s])  target.getValue = () => args.reduce((p, n) => p+ n, 0)  return target}
```

来自：https://github.com/Advanced-Frontend/Daily-Interview-Question

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法题（第二天解答），助力你成为更优秀的前端开发！

![](https://mmbiz.qpic.cn/mmbiz_gif/bwG40XYiaOKmibEL4rxRMd1XEbhsGicGUHAkkLAic8NcbuXRibfqgHian9Ckl9dbRPzP72SoHTe9qDqzhWYRSJT2DQUg/640?wx_fmt=gif)

》》面试官也在看的前端面试资料《《

“在看和转发” 就是最大的支持