> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/NVSDKZ2Ui2_jkYCzjncQeQ)

> 授权转载自：linong
> 
> https://segmentfault.com/a/1190000038295923

**获取某个月的天数**，这个题一般都是在学 `switch(){}` 一章的案例。

我们一直解题的方案是根据一个顺口溜：**一三五七八十腊，31 天永不差，四六九十一，每月 30 天，惟有二月二十八，闰年要把日加一**。（_我搜的，具体怎么背我忘了_）

这里面还有个闰年的计算规则：**四年一闰，百年不闰，四百年再闰。可以被 4 整除，但是不能被 100 整除，除非可以被 400 整除**。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEeyCuxp4icCo4mHqqaxVXleCyK4sAQZgA2Uib4WAy27edDLicJiaKHCTxZjw/640?wx_fmt=png)

是不是被上面的魔性概念征服了？接来下我们来实现一下

面试题：JS 获取某月的天数
--------------

### 先上测试用例

```
function getMonthCountDay(year, month){    // year 为年份，month 为月份}[[2000,2],[2000,1],[2000,3],[2000,4],[2100,2],[2100,1],[2100,3],[2100,4],[2104,2],[2104,1],[2104,3],[2104,4],[2105,2],[2105,1],[2105,3],[2105,4],].map(v=>`${v} => ${getMonthCountDay.apply(null,v)}天`)
```

### 基础版本

根据我们的顺口溜我们来写一下

```
function getMonthCountDay (year, month) {  switch (month){    case 1:    case 3:    case 5:    case 7:    case 8:    case 10:    case 12:        return 31    case 4:    case 6:    case 9:    case 11:        return 30    case 2:        return year%400==0?(29):(year%4!=0||year%100==0?28:29)  }}
```

很好写完了，除了代码看上去多了点，没别的毛病。

#### 测试截图

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEew7hJdHwnlmBM2ia0jic6OU7gWjdae8mIRF2DRn7Q0icrqV1vdOCtonq3g/640?wx_fmt=png)

### 借助 `Date` API 处理日期溢出特性（进位）

接下来就**开始骚了**。

```
function getMonthCountDay (year, month) {  return 32 - new Date(year, month-1, 32).getDate()}
```

是不是想不到，这种方法写的一下就很少了。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEefFCWdgVbsMPrU0tCIAX9vBQz3gZiaHdtQzRYwice2dMXGevhiaibLAPzdA/640?wx_fmt=png)

#### 测试截图

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEeu09MKjEbqg0LpDDRU1ZZIkYxFpib3mSnjMrmhTMj1X5C8N99Oru1DUQ/640?wx_fmt=png)

#### 方案原理

js 中 Date 在处理时间的时候**会做进位退位操作**。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEeBhhKuX5wyV6Ums4zosK3dicmP9PWWgKKsuhj95sF6ECq5DTEnZrh8ibw/640?wx_fmt=png)

### 借助 `Date` API 处理日期溢出特性（退位方案）

刚才是用的进位，然后减去多余的。现在我们改用退位

```
function getMonthCountDay (year, month) {  return new Date(year, month, 0).getDate()}
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEeOuxVKibhicA0WQCibEMPKHP2xnD1F8nZNLvxDicsSRrrzUwBaIjM9f3giaA/640?wx_fmt=png)

#### 测试截图

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEePCibnmiaIVkv5X6bwsjaQjYJK4kENXAVFQ5tRDeEkqWnQwFjyqx5aL3w/640?wx_fmt=png)

#### 方案原理

js 中 Date 在处理时间的时候**会做进位退位操作**。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEeBw1nApv6qvqDcEvpmqD420X3F6wCSFrMe25SGY3fxe3qPPP3wDZvsg/640?wx_fmt=png)

利用这个特性还可以做什么？
-------------

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEeM8PP9WTgsR1Cv3tjHv0TO4DjQp9vk0DAhsTcnPmfnydZ1kVALzpHyQ/640?wx_fmt=png)

### 获取月初是周几

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEe2HlhchBk9Q9toXhvntutAnLn3qeagZJV01yEz2nQoflLeEn92cXPdw/640?wx_fmt=png)

### 获取月末是周几

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQS9OmUa1xRSwxXwl3z4vIEenYOfcSJwhgl68E5sx82kf7KGjVmBs9LJSLicOBdUWN9MwnibGUju57bg/640?wx_fmt=png)

最后
--

欢迎关注「前端瓶子君」，回复「交流」加入前端交流群！  

欢迎关注「前端瓶子君」，回复「算法」自动加入，从 0 到 1 构建完整的数据结构与算法体系！

另外，每周还有手写源码题，瓶子君也会解答哟！

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQQYTquARVybx8MjPHdibmMQ3icWt2hR5uqZiaZs5KPpGiaeiaDAM8bb6fuawMD4QUcc8rFEMrTvEIy04cw/640?wx_fmt=png)

》》面试官也在看的算法资料《《

“在看和转发” 就是最大的支持