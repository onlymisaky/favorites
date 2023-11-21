> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-jv43F9qoBHpBb_eRh-FxQ)

HTTP 缓存是前端面试必问的知识点，大多数前端也都能答出强缓存和协商缓存来，但如果换个问法呢？

比如问浏览器的强制刷新实现原理是什么？

你还能答出来么？

其实这也是考察缓存相关的知识点，看完这篇文章你就有答案了。

现在网站设置缓存都是通过 Cache-Control 这个 header，他有很多指令（directive）。

比如 max-age 是指定强缓存的时间，no-cache 是会用本地的缓存但每次都会协商，no-store 是禁用掉缓存。

当然还有其他的指令，这里就不展开了，感兴趣可以看[这篇文章](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247490336&idx=1&sn=fc9a3fcd2e0263308577127cb1820590&scene=21#wechat_redirect)。

网站的缓存设置一般是这样的：**入口设置 no-cache 其他资源设置 max-age，这样入口文件会缓存但是每次都协商，保证能及时更新，而其他资源不发请求，减轻服务端压力。**

你随便找个网站看看都是这样的，比如 https://www.bilibili.com/

![](https://mmbiz.qpic.cn/mmbiz_jpg/YprkEU0TtGg3aGbII4P31z2JYaBib7UhY8icaIYD6aENT2BORO97gXe0g7ESbU5o89laKGj61mHcyFkxqfeRA3Gw/640?wx_fmt=jpeg)

可以看到入口请求，也就是 html 的请求设置了 no-cache，其他所有的后续的资源都设置了强缓存 max-age。

这样第一次访问把资源下载下来之后，再次访问就只有 html 会发请求了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhY6Ztz5RiaMvZHECvaxw9mKWASnvicibYjNibsVqszfT8AWp8y77p9x5ANGg/640?wx_fmt=png)

这里 memory cache 和 disk cache 不用做啥区分，只是刚开始是存在内存里的，关闭浏览器再打开就变成从磁盘加载的了。

可以通过 is 过滤器来过滤 from-cache 的请求，也就是所有直接拿了强缓存的请求：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYhyaVwpb5BzFOnhj5kib4ULiaOadg0UApNNISS7Y50xVUrpqFk9Ef8zgw/640?wx_fmt=png)

那问题来了，这些资源都做了强缓存，那万一资源有更新怎么办呢？

这种只要更新入口 html 就好了，业务资源文件名字里是有 hash 的，新的 html 引用不同 hash 的资源即可：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYTlHicibqpRHcRgS72Eee2VJg3TvX2QlePGfp4BvTuYT5S3IX7pqcVxYQ/640?wx_fmt=png)

注意，**入口 html 文件是绝对不能强缓存的，不然就更新不了了**。

这种入口 html 文件设置 no-cache，其他资源文件设置 max-age 的缓存方式算是最佳实践了，你随便找一个网站看看都是这种方式。

那我们开发的时候，这些强缓存的文件想更新怎么办呢？

一般我们都会用强制刷新，也就是 command + shift + R。

为什么这样就可以拿到最新的资源了呢？为啥不走强缓存了呢？

探究这个的原理就要抓包来看了：

比如 zhihu 的网站里用到了 react-dom.production.min.js 这个文件，它被缓存了，所以普通刷新直接拿的本地强缓存：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYALPpFNgDKzjZo89h4DLhR2H3ucGTNAEQZicDuxko708W2U22xqtOQMg/640?wx_fmt=png)

但如果你强制刷新，这里的 Cache-Control 的 header 还是一样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhY5yM4d6cOkYibcno8EVcscfGaHiaUXibfRVuxUq7dAf8jjMvfSk8Vpffhg/640?wx_fmt=png)

明明缓存设置没有变，怎么缓存就失效了呢？

这个用 Chrome DevTools 是看不到的，它给隐藏了，我们要用别的抓包工具来看，比如 charles。

如何用 charles 抓 https 网页的请求，在[之前一篇文章里](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247492108&idx=1&sn=525ad9bf283055d39d3c528ab1c94419&chksm=cf032d37f874a421d64bcc10e70393c8a90f97a26e4b9c4e71fd0311748e49032c6494f9bad5&token=965494574&lang=zh_CN&scene=21#wechat_redirect)写过。

再次强制刷新，你会在 charles 里看到这个请求：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYbxn0rm2libyzNGPXzJ6HBKWpvS8BB901HcCuv7t0THd9d6RIWGfNiabg/640?wx_fmt=png)

**你会发现这个请求的 Cache-Control 变成了 no-cache，也就是和服务端协商是否要更新本地缓存，这就是强制刷新的实现原理！**

但你现在在 Chrome DevTools 里看到的依然是之前的 Cache-Control：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhY2fansHrmdtDIVV2Hrrbyr1y5nNyqG57dEbpstPAQeP6nPHz0a6VVGA/640?wx_fmt=png)

说明 Chrome DevTools 隐藏了这个行为，就像它隐藏了 sourcemap 文件的请求一样。

sourcemap 文件的请求也可以在 charles 里看到：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYzAURpic28UaMvkoPqYyRiczvCct6LwFLYic8fNqiaoMbmeVtLHH0xGOzcw/640?wx_fmt=png)

Chrome DevTools 还有个禁用缓存的功能，也是通过设置 Cache-Control 为 no-cache 实现的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYsOEuel9wydVianvSdQZ3PFDUtR9CdBiabZicSKmajwxGA5X7m1lYWDADA/640?wx_fmt=png)

有的同学可能问了，浏览器除了强制刷新，还有一个清空缓存并强制刷新呀，那个是啥意思？

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGg3aGbII4P31z2JYaBib7UhYJ71sFHTBj5eGVxia7dnrInHfTNuUt9gAKk5UtEP3s6UpNIAJjF0WlkA/640?wx_fmt=png)

其实很容易理解，强制刷新是设置 no-cache，也就是和服务端协商决定用本地的缓存还是下载新的，但有的时候你想更新本地的缓存结果服务端让你用本地的缓存呢？

这时候就可以清空本地强缓存再刷新了，也就是这个选项的意思。

总结
--

网站的缓存设置的最佳实践是入口 html 文件 Cache-Control 设置 no-cache，其他文件 max-age，这样入口文件会用本地缓存但每次都协商，能及时更新，而其他资源不会发请求，能减少服务端压力。

如果要更新的话，html 文件协商后发现有更新会下载新 html，这时候关联了其他 hash 的文件，浏览器会下载新的，不会走到之前文件的缓存。

而强制刷新的实现原理就是设置了 Cache-Control 为 no-cache，这个行为被 Chrome DevTools 隐藏了，用 Charles 抓包就能看到。

还有个清空缓存并强制刷新的功能，那个是清掉本地的缓存再去协商，能保证一定是拿到最新的资源。

能答出网站缓存设置的最佳实践，也知道强制刷新的实现原理，就算是理论结合实践，真正搞懂 http 缓存了。