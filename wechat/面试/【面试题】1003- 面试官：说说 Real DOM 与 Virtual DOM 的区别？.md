> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/e7IW9DqxjMIk_YXxmkNsWw)

![](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQJxwib7BzC5KAqBOP9eibM8l2JmUHyyhns54bK2cLwO7jmC9lB98BB8y0pchlcZJaJzpJoE1AsPUtw/640?wx_fmt=png)

  
一、是什么
--------

Real DOM，真实`DOM`， 意思为文档对象模型，是一个结构化文本的抽象，在页面渲染出的每一个结点都是一个真实`DOM`结构，如下：

![](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQJxwib7BzC5KAqBOP9eibM8lm2lypCiaR3iabMbMS9dia3uAfPjXEpl4GP4wW89zZ6LLdyja0etrFWL2g/640?wx_fmt=png)

`Virtual Dom`，本质上是以 `JavaScript` 对象形式存在的对 `DOM` 的描述

创建虚拟`DOM`目的就是为了更好将虚拟的节点渲染到页面视图中，虚拟`DOM`对象的节点与真实`DOM`的属性一一照应

在`React`中，`JSX`是其一大特性，可以让你在`JS`中通过使用`XML`的方式去直接声明界面的`DOM`结构

```
const vDom = <h1>Hello World</h1> // 创建h1标签，右边千万不能加引号const root = document.getElementById('root') // 找到<div id="root"></div>节点ReactDOM.render(vDom, root) // 把创建的h1标签渲染到root节点上
```

上述中，`ReactDOM.render()`用于将你创建好的虚拟`DOM`节点插入到某个真实节点上，并渲染到页面上

`JSX`实际是一种语法糖，在使用过程中会被`babel`进行编译转化成`JS`代码，上述`VDOM`转化为如下：

```
const vDom = React.createElement(  'h1'，   { className: 'hClass', id: 'hId' },  'hello world')
```

可以看到，`JSX`就是为了简化直接调用`React.createElement()` 方法：

*   第一个参数是标签名，例如 h1、span、table...
    
*   第二个参数是个对象，里面存着标签的一些属性，例如 id、class 等
    
    第三个参数是节点中的文本
    

通过`console.log(VDOM)`，则能够得到虚拟`VDOM`消息

![](https://mmbiz.qpic.cn/mmbiz_png/gH31uF9VIibQJxwib7BzC5KAqBOP9eibM8lcg7APC2jEot64RVfueTDic3fVzHqJMpicO499YaW8uM4ZWTdqBJPGjAg/640?wx_fmt=png)

所以可以得到，`JSX`通过`babel`的方式转化成`React.createElement`执行，返回值是一个对象，也就是虚拟`DOM`

二、区别
----

两者的区别如下：

*   虚拟 DOM 不会进行排版与重绘操作，而真实 DOM 会频繁重排与重绘
    
*   虚拟 DOM 的总损耗是 “虚拟 DOM 增删改 + 真实 DOM 差异增删改 + 排版与重绘”，真实 DOM 的总损耗是 “真实 DOM 完全增删改 + 排版与重绘”
    

拿[之前文章](https://mp.weixin.qq.com/s?__biz=MzU1OTgxNDQ1Nw==&mid=2247484516&idx=1&sn=965a4ce32bf93adb9ed112922c5cb8f5&chksm=fc10c632cb674f2484fdf914d76fba55afcefca3b5adcbe6cf4b0c7fd36e29d0292e8cefceb5&scene=21&cur_album_id=1711105826272116736#wechat_redirect)举过的例子：

传统的原生`api`或`jQuery`去操作`DOM`时，浏览器会从构建`DOM`树开始从头到尾执行一遍流程

当你在一次操作时，需要更新 10 个`DOM`节点，浏览器没这么智能，收到第一个更新`DOM`请求后，并不知道后续还有 9 次更新操作，因此会马上执行流程，最终执行 10 次流程

而通过`VNode`，同样更新 10 个`DOM`节点，虚拟`DOM`不会立即操作`DOM`，而是将这 10 次更新的`diff`内容保存到本地的一个`js`对象中，最终将这个`js`对象一次性`attach`到`DOM`树上，避免大量的无谓计算

三、优缺点
-----

真实`DOM`的优势：

*   易用
    

缺点：

*   效率低，解析速度慢，内存占用量过高
    
*   性能差：频繁操作真实 DOM，易于导致重绘与回流
    

使用虚拟`DOM`的优势如下：

*   简单方便：如果使用手动操作真实`DOM`来完成页面，繁琐又容易出错，在大规模应用下维护起来也很困难
    
*   性能方面：使用 Virtual DOM，能够有效避免真实 DOM 数频繁更新，减少多次引起重绘与回流，提高性能
    
*   跨平台：React 借助虚拟 DOM， 带来了跨平台的能力，一套代码多端运行
    

缺点：

*   在一些性能要求极高的应用中虚拟 DOM 无法进行针对性的极致优化
    
*   首次渲染大量 DOM 时，由于多了一层虚拟 DOM 的计算，速度比正常稍慢
    

参考文献
----

*   https://juejin.cn/post/6844904052971536391
    
*   https://www.html.cn/qa/other/22832.html
    

  

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