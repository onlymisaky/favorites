> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/X-LuqCpxcZIP_VsW2omTrQ)

集合操作方法的介绍
---------

JavaScript 的 `Set` 对象自从 ES6 引入以来，主要用于确保列表中没有重复的元素。然而，随着即将推出的 7 种内置 `Set` 方法，我们可能会发现自己更频繁地使用它们。

注意，这些新功能并不是所有浏览器都支持。

### 1. `union()`

新的 `Set union()` 方法为我们提供了两个集合中所有的唯一项。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG335ux0Yr0GJib5yVRg0IkicGrmhk4uCY4UMEfAQG2BCpeVr7Cib3s1LeOw/640?wx_fmt=png&from=appmsg)union

由于它是不可变的并且返回一个对象副本，你可以无限地调用

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3o8nvFuLhD1urT7hkEwQGiaGSDJCAZtnbFnBdeRpMSIkOFlJAcibyGO8w/640?wx_fmt=png&from=appmsg)chain union

### 2. `intersection()`

两个集合中都存在的元素是什么？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3aWYwL9DQ6gyyoM4I2O3ia48o7YPUoGNQ6suRDKHYZnYYlT1CsNTKhyA/640?wx_fmt=png&from=appmsg)intersection

### 3. `difference()`

`difference()` 方法执行 A - B 操作，返回集合 A 中不在集合 B 中的所有元素：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3T2Ry1OVLHfLpn4XqkJIrTF3lU4AxgVEHzoOrX75icic5Y4r1qKWdJia1A/640?wx_fmt=png&from=appmsg)difference

### 4. `symmetricDifference()`

这个方法双向获取集合差异，即 (A — B) U (B — A)。返回只在集合 A 或集合 B 中的元素：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG31KEStVKjGwBwolP3Xb5l4icavPvsyAVxEcE2nv1n8icpAibe5sD2mDIBw/640?wx_fmt=png&from=appmsg)symmetricDifference

### 5. `isSubsetOf()`

检查一个集合的所有元素是否都在另一个集合中。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3B8YvK5libIyMAocIH0qPk9JubUXn0p1bzbR6drYnbmleXXC4gx6po4Q/640?wx_fmt=png&from=appmsg)isSubsetOf

### 6. `isSupersetOf()`

检查一个集合是否包含另一个集合中的所有元素

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3Hy0KNDDVicvABCVD4wE0NgWoCExnmFgjGPNCEI7PSKlSevRbBOhe0uA/640?wx_fmt=png&from=appmsg)isSupersetOf

### 7. `isDisjointFrom()`

这两个集合是否没有任何共同的元素

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3K8zHlokg5Yqc8Ub39wHSqrNOnJKSBtzW95q7MpYrxaymlUg0IDnWiaA/640?wx_fmt=png&from=appmsg)isDisjointFrom

如何立即使用它们
--------

通过使用 `core`-js  polyfills:

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3N4iaon2bA2pPdsyTPaUHrXUWFjJ7wXIwA8uhdNU2iaq9G765BzRbKxdw/640?wx_fmt=png&from=appmsg)core-js polyfills![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3xQ6TPvVUUCYTOWdl0frrK7X7ibry6wFkTCtt2JdFvSVJE5GxQQ7GqIQ/640?wx_fmt=png&from=appmsg)core-js polyfills 2

否则，你会从 TypeScript 和 Node.js 收到错误提示 —— 它们尚未成为官方 JavaScript 标准的一部分。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3qNLJMboUibib2yql7Kf6Jk1hK8CEp8u1e8t8NmwGpPsh7Jze0a6JtmhA/640?wx_fmt=png&from=appmsg)TypeScript & Node.js errors![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3QH5XSP37nhhGyZf6GnyeRnl248s5tQ2ZJBr5IAlPOozuFLlSzgh0cQ/640?wx_fmt=png&from=appmsg)TypeScript & Node.js errors 2

总结
--

这就是我们的 7 种新的 `Set` 方法 —— 再也不需要像 `_.intersection()` (Lodash!) 这样的第三方库了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpL95NiaiaWPGrHt8QDcuXnG3F0ylafbHqgMTw46b2SGduZPQshYibicHdWOyS8C2ia0icfRsbvKAP74jGw/640?wx_fmt=png&from=appmsg)no more third parties

> 翻译自 https://medium.com/coding-beauty/new-javascript-set-methods-8332e379c7e5