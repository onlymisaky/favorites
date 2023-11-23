> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GT_PIn1_cksolLRZ4slwPw)

![](https://mmbiz.qpic.cn/mmbiz_jpg/dy9CXeZLlCXoBoqN4H2SiacXEOeLxDLRX70a7GAPmjRlT3PPsTB768R8dP91mibZb4zXJMTsbKnbpUfLdE7hfjibg/640?wx_fmt=jpeg)

今天主要介绍一个 Footer 元素如何粘住底部，使其无论内容多或者少，Footer 元素始终紧靠在浏览器的底部。  

我们知道，当内容足够多可以撑开底部到达浏览器的底部，如果内容不够多，不足以撑开元素到达浏览器的底部时，下面要讲的布局就是解决如何使元素粘住浏览器底部。

### **方法一：全局增加一个负值下边距等于底部高度**

有一个全局的元素包含除了底部之外的所有内容。它有一个负值下边距等于底部的高度。 

html 代码：

```
<body>
  <div class="wrapper">

      content

    <div class="push"></div>
  </div>
  <footer class="footer"></footer>
</body>

```

css 代码：

```
html, body {
  height: 100%;
  margin: 0;
}
.wrapper {
  min-height: 100%;

  /* Equal to height of footer */
  /* But also accounting for potential margin-bottom of last child */
  margin-bottom: -50px;
}
.footer,
.push {
  height: 50px;
}

```

这个代码需要一个额外的元素. push 等于底部的高度，来防止内容覆盖到底部的元素。这个 push 元素是智能的，它并没有占用到底部的利用，而是通过全局加了一个负边距来填充。

### **方法二：底部元素增加负值上边距**

虽然这个代码减少了一个. push 的元素，但还是需要增加多一层的元素包裹内容，并给他一个内边距使其等于底部的高度，防止内容覆盖到底部的内容。 

HTML 代码：

```
<body>
  <div class="content">
    <div class="content-inside">
      content
    </div>
  </div>
  <footer class="footer"></footer>
</body>

```

CSS：

```
html, body {
  height: 100%;
  margin: 0;
}
.content {
  min-height: 100%;
}
.content-inside {
  padding: 20px;
  padding-bottom: 50px;
}
.footer {
  height: 50px;
  margin-top: -50px;
}

```

### **方法三：使用 calc() 计算内容的高度**

HTML

```
<body>
  <div class="content">
    content
  </div>
  <footer class="footer"></footer>
</body>

```

CSS:

```
.content {
  min-height: calc(100vh - 70px);
}
.footer {
  height: 50px;
}

```

给 70px 而不是 50px 是为了为了跟底部隔开 20px，防止紧靠在一起。

### **方法四：使用 flexbox**

HTML:

```
<body>
  <div class="content">
    content
  </div>
  <footer class="footer"></footer>
</body>

```

CSS:

```
html {
  height: 100%;
}
body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
}

```

### **方法五：使用 grid 布局**

HTML：

```
<body>
  <div class="content">
    content
  </div>
  <footer class="footer"></footer>
</body>

```

CSS：

```
html {
  height: 100%;
}
body {
  min-height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
}
.footer {
  grid-row-start: 2;
  grid-row-end: 3;
}

```

grid 早于 flexbox 出现，但并没有 flexbox 被广泛支持，你可能在 chrome  Canary 或者 Firefox 开发版上才可以看见效果。

![](https://mmbiz.qpic.cn/mmbiz_gif/usyTZ86MDicgqjLq0USF6icibfWiaLSV8bz17cBjvXylU7dz9mIMP7lUF50OE2gFrlZDQlIyWvGcUiaprq92fq8tgXg/640?wx_fmt=gif)

[1. JavaScript 重温系列（22 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453187&idx=1&sn=a69b4d7d991867a07a933f86e66b9f55&chksm=b1c224ea86b5adfc10c3aa1841be3879b9360d671e98cc73391c2490246f1348857b9821d32c&scene=21#wechat_redirect)  

[2. ECMAScript 重温系列（10 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453193&idx=1&sn=e5392cb77bc17c9e94b6c826b5f52a83&chksm=b1c224e086b5adf6dad41a0d36b77a9bfb4bc9f0d29a816266b3e28c892e54274967dbce380b&scene=21#wechat_redirect)  

[3. JavaScript 设计模式 重温系列（9 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453194&idx=1&sn=e7f0734b04484bee5e10a85a7cbb85c1&chksm=b1c224e386b5adf554ab928cdeaf7ee16dbb2d895be17f2a12a59054a75b913470ca7649bbc7&scene=21#wechat_redirect)

4. [正则 / 框架 / 算法等 重温系列（16 篇全）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453195&idx=1&sn=1e0c8b7ea8ddc207b523ec0a636a5254&chksm=b1c224e286b5adf432850f82db18cc8647d639836798cf16b478d9a6f7c81df87c6da5257684&scene=21#wechat_redirect)

5. [Webpack4 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453302&idx=1&sn=904e40a421024ea0d394e9850b674012&chksm=b1c2251f86b5ac09dbbbb7c8e1d80c6cbd793a523cdfa690f8734def57812e616b9906aeec79&scene=21#wechat_redirect)|| [Webpack4 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453303&idx=1&sn=422f2b5e22c3b0e91a8353ee7e53fed9&chksm=b1c2251e86b5ac08464872cd880811423e0d1bbcebbe11dcac9d99fa38c5332c089c06d65d95&scene=21#wechat_redirect)

6. [MobX 入门（上）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453605&idx=1&sn=0a506769d5eeb7953f676e93fb4d18eb&chksm=b1c2264c86b5af5aa7300a04d55efead6223e310d68e10222cd3577a25c783d3429f00767960&scene=21#wechat_redirect) ||  [MobX 入门（下）](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453609&idx=1&sn=f0c22e82f2537204d9b173161bae6b82&chksm=b1c2264086b5af5611524eedb0d409afe86d859dce6ceff1c17ddab49d353c385e45611a73fa&scene=21#wechat_redirect)

7. 120[+ 篇原创系列汇总](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458453236&idx=2&sn=daf00392f960c115463c5aaf980620b4&chksm=b1c224dd86b5adcbd98189315e60de6a0106993690b69927cc1c1f19fd8f591fefce4e3db51f&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCV6wPNEuicaKGdia24OVNBZxUyfVhbEBnxdxfwKuJwLovlZicn7ccq5GbhNFwtk6libKiaxTLO4v2C5LRQ/640?wx_fmt=gif)

回复 “**加群**” 与大佬们一起交流学习~

点击 “**阅读原文**” 查看 120+ 篇原创文章