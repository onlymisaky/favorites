> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/D3xQrdA4C9GFe14vwzLKKg)

前言
--

平时我们在打游戏的时候，都会接触到 `帧数` 这个名词，也就是 `fps`，帧数越高，说明画面的显示更加流畅。

背景
--

刚好最近公司的某个项目，需要实时展示网页的帧数，所以也涉及到了如何去计算帧数这个问题。

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaMCY5gvThCCC9NXkPDDQ8Iwq4q48amG3XcXvthuIQM1vcszfV1e6ib1Siaz9PznAqfbgUdAPTaibKLA/640?wx_fmt=png&from=appmsg)

如何计算？
-----

什么是帧数呢？就是**一秒内有多少帧**，所以想要计算帧数的话，我们需要算出**一秒内有多少帧。**

想要算**帧**，大家可以想一下用哪个 API 跟帧有关系的？

是的，那就是 `requestAnimationFrame`，每跑完一次`requestAnimationFrame`，就说明跑完一帧了，所以我们只需要计算出：一秒内跑了多少次 `requestAnimationFrame` 就行~

use-fps
-------

下面是一个初级的版本，可以实时计算出帧数。

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaMCY5gvThCCC9NXkPDDQ8Iia5iabwiaZhYtbnVTCCaiahhVIdkIpqBXzs4HdOdREVAg70kpNCIO14ARQ/640?wx_fmt=png&from=appmsg)

可以看看页面上的效果。

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaMCY5gvThCCC9NXkPDDQ8IHfs1jVF54gclOlDUpvqsb4DfibibNVKG6xDVjzvt9iaZD0lvGflN2dqng/640?wx_fmt=png&from=appmsg)

可以看到变的非常的快，这也对于用户体验不太好，所以我们需要优化一下。

![](https://mmbiz.qpic.cn/mmbiz_gif/TZL4BdZpLdiaMCY5gvThCCC9NXkPDDQ8InvNaFSGsIkUbRBq4LRdTb7VBDwKZoDmS5brTd93ERtBZXW6QqhZ9rg/640?wx_fmt=gif&from=appmsg)

间隔优化
----

现状是每过一帧就实时计算一下，我们可以优化一下，隔几帧再计算一次帧数，这样就不会更新得太频繁了~

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaMCY5gvThCCC9NXkPDDQ8IfIkhAl3HZSM6FzrFSyWEDy8fktMDmIicGNC9x053NYQLEgdQjqcuRTQ/640?wx_fmt=png&from=appmsg)

现在就比较稳定了，没那么频繁了~

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaMCY5gvThCCC9NXkPDDQ8IfrlJsqQ0EgHdGwOL8sQypbpSZ2Pw2TuxMrKgSPu18NrMrUV01z9osg/640?wx_fmt=png&from=appmsg)

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)