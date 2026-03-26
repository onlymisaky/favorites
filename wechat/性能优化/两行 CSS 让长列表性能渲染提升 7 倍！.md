> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/gpzQG4uJrqw4Gnkhp0vcPw)

```
点击下方“前端开发爱好者”，选择“设为星标”
第一时间关注技术干货！

```

今天咱们来看两个可以 **直接提升渲染性能的 CSS 属性**。

*   content-visibility
    
*   contain-intrinsic-size
    

这两个 CSS 属性，主要针对 **长列表渲染**。有长列表渲染需求的同学，可一定不能错过咯~

**content-visibility**

> content-visibility 是 CSS 新增的属性，主要用来提高页面渲染性能，它可以控制一个元素是否渲染其内容，并且允许浏览器跳过这些元素的布局与渲染。

*   `visible：`默认值，没有效果。元素的内容被正常布局和呈现。
    
*   `hidden：`元素跳过它的内容。跳过的内容不能被用户代理功能访问，例如在页面中查找、标签顺序导航等，也不能被选择或聚焦。这类似于给内容设置 display: none。
    
*   `auto：`该元素打开布局包含、样式包含和绘制包含。如果该元素与用户不相关，它也会跳过其内容。与 hidden 不同，跳过的内容必须仍可正常用于用户代理功能，例如在页面中查找、tab 顺序导航等，并且必须正常可聚焦和可选择。
    

### content-visibility: hidden 手动管理可见性

上面说到 content-visibility: hidden 的效果与 display: none 类似，但其实两者还是有比较大的区别的：

*   content-visibility: hidden 只是隐藏了子元素，自身不会被隐藏
    
*   content-visibility: hidden 隐藏内容的渲染状态会被缓存，所以当它被移除或者设为可见时，浏览器不会重新渲染，而是会应用缓存，所以对于需要频繁切换显示隐藏的元素，这个属性能够极大地提高渲染性能。
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKo6GWb1OfgF0VP5cYHLw3NKGnqSONvV7l6Yn72Wz5eOHxEEZncz92PicFtc79XC8Miao6vWo9sRGL7g/640?wx_fmt=jpeg)

### **content-visibility: auto 跳过渲染工作**

我们仔细想想，页面上虽然会有很多元素，但是它们会同时呈现在用户眼前吗？很显然是不会的。

用户每次能够真实看到就只有设备可见区那些内容，对于非可见区的内容只要页面不发生滚动，用户就永远看不到。虽然用户看不到，但浏览器却会实实在在的去渲染，以至于浪费大量的性能。所以我们得想办法让浏览器不渲染非可视区的内容就能够达到提高页面渲染性能的效果。

此时就可以直接使用 `content-visibility: auto` 它可以用来跳过屏幕外的内容渲染，对于这种有大量离屏内容的长列表，可以大大减少页面渲染时间。

首先是没有添加 content-visibility: auto 的效果，无论这些元素是否在可视区，都会被渲染

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKo6GWb1OfgF0VP5cYHLw3NKFzlicpic8kcxjHVA7xr2kn0UicU0b85Fa0LlGISFW6Ug49pjWoibqZtgqA/640?wx_fmt=png&from=appmsg)

然后，我们为每一个列表项加上 `content-visibility: auto`:

```
.card_item {
  content-visibility: auto;
}


```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/kzFgl6ibibNKo6GWb1OfgF0VP5cYHLw3NKHh4k11MLpqmupDSmwXBQhoyx8kB8JvHyeGcD2lZmYNyRIIne5udjgQ/640?wx_fmt=png&from=appmsg)

从第 10 个开始，这些没在可视区的元素就没有被渲染，这可比上面那种全部元素都渲染好太多了。

但是如果浏览器不渲染页面内的一些元素，滚动将是一场噩梦，因为无法正确计算页面高度。这是因为，content-visibility 会将分配给它的元素的高度（height）视为 0，浏览器在渲染之前会将这个元素的高度变为 0，从而使我们的页面高度和滚动变得混乱。

**contain-intrinsic-size 救场**

页面在滚动过程中滚动条一直抖动，这是一个不能接受的体验问题，为了更好地实现 content-visibility，浏览器需要应用 size containment 以确保内容的渲染结果不会以任何方式影响元素的大小。这意味着该元素将像空的一样布局。如果元素没有在常规块布局中指定的高度，那么它将是 0 高度。

这个时候我们可以使用 contain-intrinsic-size 来指定的元素自然大小，确保我们未渲染子元素的 div 仍然占据空间，同时也保留延迟渲染的好处。

我们只需要给添加了 content-visibility: auto 的元素添加上 contain-intrinsic-size 就能够解决滚动条抖动的问题，当然，这个高度约接近真实渲染的高度，效果会越好，如果实在无法知道准确的高度，我们也可以给一个大概的值，也会使滚动条的问题相对减少。

```
.card_item {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}


```

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Ptef09iaEWxxsRSk0Y2DGHCSLaGPqYkDHL0XhDjpiaZNn2NmfdL9Zl1ql51tCcFeBsibuTbDRMNrGke8sAPNNrDAA/640?wx_fmt=gif)

  
**性能对比**

上面说了这么多，content-visibility 是否真的能够提高页面的渲染性能呢，我们来实际对比看看：

*   首先是没有 content-visibility 的页面渲染
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKo6GWb1OfgF0VP5cYHLw3NKjy3CsvNzZVaI6ovm3tc142dolsntTC1cFaq6I8dKRQziaIiaaOdFogSA/640?wx_fmt=jpeg)

*   然后是有 content-visibility 的页面渲染
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKo6GWb1OfgF0VP5cYHLw3NKttl4okH6uSJBCBmQicvmpn2Mao1oDjrN2ftNw5AbVj6Lcdpve9GNNZA/640?wx_fmt=jpeg)

上面是用 1000 个列表元素进行测试的，有 content-visibility 的页面渲染花费时间大概是 37ms，而没有 content-visibility 的页面渲染花费时间大概是 269ms，提升了足足有 7 倍之多！！！

**写在最后**

> `公众号`：`前端开发爱好者` 专注分享 `web` 前端相关`技术文章`、`视频教程`资源、热点资讯等，如果喜欢我的分享，给 🐟🐟 点一个`赞` 👍 或者 ➕`关注` 都是对我最大的支持。

欢迎`长按图片加好友`，我会第一时间和你分享`前端行业趋势`，`面试资源`，`学习途径`等等。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kzFgl6ibibNKr8ckoWTYdS81X393vR6fHS2TKBK4pFnrgNlVaSDxSYRQ5WhtXmw5iaMRicU15ksV8XeCOR5lBobRcQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

添加好友备注【**进阶学习**】拉你进技术交流群

关注公众号后，在首页：

*   回复`面试题`，获取最新大厂面试资料。
    
*   回复`简历`，获取 3200 套 简历模板。
    
*   回复`React实战`，获取 React 最新实战教程。
    
*   回复`Vue实战`，获取 Vue 最新实战教程。
    
*   回复`ts`，获取 TypeScript 精讲课程。
    
*   回复`vite`，获取 Vite 精讲课程。
    
*   回复`uniapp`，获取 uniapp 精讲课程。
    
*   回复`js书籍`，获取 js 进阶 必看书籍。
    
*   回复`Node`，获取 Nodejs+koa2 实战教程。
    
*   回复`数据结构算法`，获取数据结构算法教程。
    
*   回复`架构师`，获取 架构师学习资源教程。
    
*   更多教程资源应有尽有，欢迎`关注获取`