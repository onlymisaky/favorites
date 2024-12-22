> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/8Ik1d1egKlMrYa4ddbn_Vw)

在性能优化中有一种手段叫做预加载，从字面意思理解就是提前加载页面所依赖的资源，在网络请求中，我们在使用到某些资源如：图片，JS，CSS 等，在执行前总需要等待资源的下载，若我们能做到预先加载资源，则在资源执行的时候就不必等待网络的开销，从而可以达到加快渲染的效果。而预加载常用的属性主要有两个：**「preload」**、**「prefetch」**

****如果这篇文章有帮助到你，❤️关注 + 点赞❤️鼓励一下作者，文章公众号首发，关注 `前端南玖` 第一时间获取最新文章～****

preload 提前加载
------------

> ❝
> 
> Preload 主要是让浏览器提前加载资源（加载后并不会立即执行），然后会在需要执行的时候执行。并且 `onload` 事件必须等页面所有资源都加载完成才触发，而当给某个资源加上 `preload` 后，该资源将不会阻塞 `onload`。
> 
> ❞

### 如何使用

*   通过 link 标签创建
    

```
<!-- 使用 link 标签静态标记需要预加载的资源 --><link rel="preload" href="style.css" as="style"><!-- 或使用脚本动态创建一个 link 标签 --><script>const link = document.createElement('link');link.rel = 'preload';link.as = 'style';link.href = 'style.css';document.head.appendChild(link);</script>
```

*   在 HTTP 响应头中加上 preload 字段
    

```
Link: <https://xxx.com/static/styles.css>; rel=preload; as=style
```

### 体验

比如页面同时加载了两个 JS 文件

```
<script src="./js/a.js"></script><script src="./js/b.js"></script>
```

正常来讲它们的加载顺讯应该与书写顺序一致。

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia4xv7PSyHhmwlCH9szIibgsoic9eeBg8a2RZT3jKcAHDfkeeouHV63ZI7I5IXZm7hicjubXIAzLWWv5g/640?wx_fmt=png)

我们给`b.js`配置预加载

```
<link rel="preload" as="script" href="./js/b.js" />
```

再来看一下它俩的加载顺序：

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia4xv7PSyHhmwlCH9szIibgsoPDTibfpBKwh4pDOtp9CYsjBAVnbfIiajmkibKt7upRlTrjWO2iczmlMeGA/640?wx_fmt=png)

此时`b.js`已经在`a.js`之前进行加载了。

### 加载资源类型

`preload` 除了能够预加载脚本之外，还可以通过 `as` 指定别的资源类型，比如：

*   `style` 样式表
    
*   `font`：字体文件
    
*   `image`：图片文件
    
*   `audio`：音频文件
    
*   `video`：视频文件
    
*   `document`：文档
    

### 应用

**「预加载字体」**

preload 比较常见的使用场景是用于字体文件的预加载，开发过程中处于对设计的高度还原，我们可能会使用自定义字体。但在使用过程中我们往往会遇到下面这种现象，页面首次加载时文字会出现短暂的字体样式闪动（FOUT，Flash of Unstyled Text），在网络情况较差时更加明显。主要原因是字体文件由 css 引入，在 css 解析后才会进行加载，加载完成之前浏览器只能使用降级字体。也就是说，字体文件加载的时机太迟，需要告诉浏览器提前进行加载，这恰恰是 preload 的用武之地。

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia4xv7PSyHhmwlCH9szIibgso5hPdAxRGgzePiaNEWuhCIAqjuxAhrLx7rQyOibAhghXeQicbic0awUKv4w/640?wx_fmt=gif)

当我们为字体文件加上预加载后再来看看效果

```
<link rel="preload" as="font" crossorigin href="https://xxx/229c49c5.6rzn36.ttf">
```

再次刷新页面，我们可以看到页面没有出现文字样式闪动了，并且我们在 network 面板中可以看到字体文件的加载时机提前了，在浏览器请求 html 后很快就开始加载字体文件了。

![](https://mmbiz.qpic.cn/mmbiz_gif/aw5KtMic7pia4xv7PSyHhmwlCH9szIibgsouVVGqmT0cjnH8wUCGQuOOUej7W07CQ7FmKzUgoPEqK5MYC1RIGMF7Q/640?wx_fmt=gif)

### 兼容性判断

```
const isPreloadSupported = () => {  const link = document.createElement('link');  const relList = link.relList;  if (!relList || !relList.supports) {    return false;  }  return relList.supports('preload');};
```

prefetch 预判加载
-------------

> ❝
> 
> `preload` 用于提前加载用于当前页面的资源，而 `prefetch` 则是用于加载未来（比如下一个页面）会用到的资源，并且告诉浏览器在空闲的时候去下载，它会将下载资源的优先级降到最低。
> 
> ❞

### 如何使用

*   通过 link 标签创建
    

```
<!-- 使用 link 标签静态标记需要预加载的资源 --><link rel="prefetch" href="style.css" as="style"><!-- 或使用脚本动态创建一个 link 标签 --><script>const link = document.createElement('link');link.rel = 'prefetch';link.as = 'style';link.href = 'style.css';document.head.appendChild(link);</script>
```

*   在 HTTP 响应头中加上 preload 字段
    

```
Link: <https://xxx.com/static/styles.css>; rel=prefetch; as=style
```

### 体验

还是上面这个例子

```
<script src="./js/a.js"></script><script src="./js/b.js"></script>
```

正常来讲它们的加载顺讯应该与书写顺序一致。

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia4xv7PSyHhmwlCH9szIibgsoic9eeBg8a2RZT3jKcAHDfkeeouHV63ZI7I5IXZm7hicjubXIAzLWWv5g/640?wx_fmt=png)

我们给`a.js`配置 prefetch

```
<link rel="prefetch" as="script" href="./js/b.js" />
```

再来看一下它俩的加载顺序：

![](https://mmbiz.qpic.cn/mmbiz_png/aw5KtMic7pia4xv7PSyHhmwlCH9szIibgsoWrBSrvbU2ps1n4I1yylCMTaV9EmJ2cOEDlleqPCTaCgnMk3XdhuiaicQ/640?wx_fmt=png)

此时我们会发现`a.js`的加载优先级已经降到最低了，当资源被下载完成后，会被存到浏览器缓存中，当从首页跳转到页面 A 的时候，假如页面 A 中引入了该脚本，那么浏览器会直接从 `prefetch cache` 中读取该资源，从而实现资源加载优化。

总结
--

*   preload  是告诉浏览器页面**「必定」**需要的资源，浏览器**「一定会」**加载这些资源
    
*   prefetch 是告诉浏览器页面**「可能」**需要的资源，浏览器**「不一定会」**加载这些资源
    
*   preload 与 prefetch 都仅仅是加载资源，并不会执行
    
*   preload 比 prefetch 优先级更高，prefetch 比 preload 的兼容性更好
    
*   preload 与 prefetch 都不会阻塞页面的 onload
    
*   preload 的字体资源必须设置 crossorigin 属性，否则会导致重复加载