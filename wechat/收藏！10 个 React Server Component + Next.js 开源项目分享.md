> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Ht5vA1a9ZnwHV9xt8cFLqA)

Next.js 13 版本中引入了一些新功能，变化比较大的一个点是 React Server Component（简称 RSC）的支持，并且在 Next.js App Router 模式下做为一种默认的组件类型。  

RSC 也给我们带来了一些好处，例如，减少了客户端的包大小提高能程序的性能、可以利用服务器的一些基础设施，当在 Node.js 运行时环境下，Node.js 可以用的资源在 RSC 组件中也都可以使用。当然，也不是什么都支持的，当需要 UI 交互的场景，RSC 就不行了，此时需要编写 Client Component 与 Server Component 做混合渲染。这块的内容很多可以参考这篇文章 [React Server Component：在服务端写 React 组件是什么体验？](https://mp.weixin.qq.com/s?__biz=MzU3NTg5MjU1Mw==&mid=2247485150&idx=1&sn=3de5017d9fe2f9a10ef0bcc343f6b9dc&scene=21#wechat_redirect)

RSC 还是比较新的一个东西，学习资料也不是很多，并且当前阶段必须在一些构建工具或框架中才可以使用。以下推荐一些 RSC + Next.js App Router 相结合的开源项目示例，希望能为您的学习带来一些帮助。

1. Netflix Clone
----------------

*   源码：https://github.com/sadmann7/netflx-web
    
*   预览：https://netflx-web.vercel.app/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpOZzXiaicVQ8KE94j6lPQgic8AyEVd8GtPjUkJs28JIialM12OtTYKqiaLYA/640?wx_fmt=png)

2. Movies
---------

*   源码：https://github.com/transitive-bullshit/next-movie
    
*   预览：https://next-movie.transitivebullsh.it
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpicr1cKGoJ3AhPaIFcicmtboIuRRu1QL2def3KyClf223QpdicjtHIic17A/640?wx_fmt=png)

3. Commerce
-----------

*   源码：https://github.com/vercel/commerce
    
*   预览：https://demo.vercel.store/search
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lptMKa6vV4g4esxh1ibdtxs7SKibJU0OS6dCLftS0CmfL7mImwl7nlHNxA/640?wx_fmt=png)

4. Hacker News
--------------

*   源码：https://github.com/vercel/next-react-server-components
    
*   预览：https://next-rsc-hn.vercel.app
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpjoduIA9Nvw2FhNsMl1cOWzZJ8PY2KOt51QiagyUlxG5q5Fh0qr1kS2g/640?wx_fmt=png)

5. AirBnB Clone
---------------

*   源码：https://github.com/SashenJayathilaka/Airbnb-Build
    
*   预览：https://abproject-sclone.vercel.app/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpdeZpiayoOQibib4FrZByFOnicJiahR0Yg6VAf3fZB67DzMBY5TXIWZApnzQ/640?wx_fmt=png)

6. Drift
--------

*   源码：https://github.com/MaxLeiter/Drift
    
*   预览：https://drift.lol/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpIWbQ2rnU9NA0DhVibiaIFprSicXpyMtxJdlicBp5cJF2CgUPwc14tOYpfA/640?wx_fmt=png)

7. Taxonomy
-----------

*   源码：https://github.com/shadcn/taxonomy
    
*   预览：https://tx.shadcn.com/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpOvBdIBicDRM5EWtINgcI2MhDrKEHbB4hQllNsvWiaCMRH2Mo5D8mtsDw/640?wx_fmt=png)

8. Blog
-------

*   源码：https://github.com/maxleiter/maxleiter.com
    
*   预览：https://maxleiter.com/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpZRSwhKR9gLOoPn76en1aHlK48gicibpe2Ye3XS9icVibN2IhWbN2BZmxIg/640?wx_fmt=png)

9. Street photography
---------------------

*   源码：https://github.com/amannn/street-photography-viewer
    
*   预览：https://street-photography-viewer.vercel.app/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lpHNJbnzkWkNffEvu5ib5zgibmwvxF9Sia48ugmU1A63ibDic3EvzhH7renTw/640?wx_fmt=png)

10. A multi-step form
---------------------

*   源码：https://github.com/FesoQue/Advance-Multi-Step-Form
    
*   预览：https://steppers-form.vercel.app/
    

![](https://mmbiz.qpic.cn/mmbiz_png/wnIMIiaEIIrgMhxYstDnPVltZ6IFPr9lp0z4ic81tskUGT0jbFQwpWOTNnibPSoPrUauzNAnb2jTVjdq5BNvmNCNg/640?wx_fmt=png)