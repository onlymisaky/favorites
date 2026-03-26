> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AMdG7KUjy7HtiuiIrAhOYA)

前言
--

作为前端开发者，我们每天都在操作 DOM，但 DOM API 中隐藏着许多鲜为人知却极其实用的方法。本文将介绍一些「冷门但能显著提升开发效率」的 DOM 操作技巧

1. Element.checkVisibility()
----------------------------

检测元素是否**真正可见**（包括 CSS 遮挡、滚动隐藏、透明度为 0 等场景）

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ3KwHVKmicEsg3WrIunFdpB1OoobKrDsUjfaqHNT2mTs1SbKqibibcERlJQ/640?wx_fmt=png&from=appmsg)

**适用场景**：表单验证可见性、广告曝光统计、动态内容懒加载检查

2. TreeWalker API
-----------------

高性能遍历 DOM 树的「迭代器模式」

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ3B8V4L5ayFjr9iaQOQg7rAzXHf5MPJmSnHkQftoY14nzFbBxpWKVSsFg/640?wx_fmt=png&from=appmsg)

**优势**：比 `querySelectorAll` 更节省内存，尤其适合超大型 DOM 树遍历

3. Node.compareDocumentPosition()
---------------------------------

精确判断两个节点的**位置关系**

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ30LAFwZWu9VOrDYvvKWxEicwc2xvTS2vjQ2ISUtibNV2RsufHYtrRHbnA/640?wx_fmt=png&from=appmsg)

位掩码常量：

*   DOCUMENT_POSITION_PRECEDING : 节点 A 在 B 之前
    
*   DOCUMENT_POSITION_FOLLOWING : 节点 A 在 B 之后
    
*   DOCUMENT_POSITION_CONTAINS : A 是 B 的祖先
    

4. scrollIntoViewIfNeeded()
---------------------------

智能滚动（元素不在视口时自动滚动到可视区域）

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ3f6Uky5DvsW2gpjS2FTUDiaD2jae5QxiatZNLmCGQgfgpjnEAbhlXQphw/640?wx_fmt=png&from=appmsg)

**对比传统方案**：比 scrollIntoView() 更智能，避免过度滚动

5. insertAdjacentElement()
--------------------------

精准控制插入位置的增强版 `appendChild`

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ3eMdM18FfPGPfp6aLcKJaicCLrK82VAkcAtvXxL71HUZU4aNL76NhBMw/640?wx_fmt=png&from=appmsg)

位置参数：

*   beforebegin : 元素前插入
    
*   afterbegin : 元素内部开头
    
*   beforeend : 元素内部末尾
    
*   afterend : 元素后插入
    

6. Range.surroundContents()
---------------------------

选区操作神器：包裹文本选区

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ3XOWR76tCgVY817icLTSwbPCoSke44V88kvh7OM5q23jf031O3eJjFZw/640?wx_fmt=png&from=appmsg)

**应用场景：** 富文本编辑器、文本高亮批注功能。

7. Node.isEqualNode()
---------------------

深度比较两个节点是否「结构相同」

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ30FB67Mibg2FrOQHzZrHwD774MKicUld11haJNfyCVrWH4k2lMFib0ibcyw/640?wx_fmt=png&from=appmsg)

注意：只比较结构和属性，不比较内容变化（如动态绑定的点击事件）

8. document.createExpression()
------------------------------

XPath 表达式预编译（性能优化利器）

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdjia4vHBvYWC9WnZkdTGkJJ3hCU8vib3yBsdQEljKZLiaDgb8DLpCsficTFVwJI2d1oqrDZEicYpte3oHg/640?wx_fmt=png&from=appmsg)

适用场景：大数据量表格的快速筛选查询。

小结
--

注意事项：

*   部分 API（如 checkVisibility）需 Chrome 106 + 支持
    
*   生产环境使用前请检查浏览器兼容性
    
*   冷门 API 的合理使用能让代码更优雅，但切忌过度炫技
    

这些 API 虽然冷门，但在特定场景下能大幅简化代码逻辑。建议收藏本文作为 DOM 操作的「瑞士军刀手册」。如果你发现其他有趣的冷门 API，欢迎在评论区分享！

结语
--

*   我是 ssh，工作 6 年 +，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
    
*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    
*   关注公众号，发送消息：
    
    指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。
    
    简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。
    
    面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰
    

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！