> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/7qe0HKrFGeMDahbNJXipwg)

当面试官问出这个题后，大部分人听到都是内心窃喜：早就背下这篇八股文。

但是稍等，下面几个问题你能答出来吗：

1.  浏览器对 URL 为什么要解析？URL 参数用的是什么字符编码？那 encodeURI 和 encodeURIComponent 有什么区别？
    
2.  浏览器缓存的 disk cache 和 memory cache 是什么？
    
3.  预加载 prefetch、preload 有什么差别？
    
4.  JS 脚本的 async 和 defer 有什么区别？
    
5.  TCP 握手为什么要三次，挥手为什么要四次？
    
6.  HTTPS 的握手有了解过吗？
    

同样的问题，可以拿来招聘 P5 也可以是 P7，只是深度不同。所以我重新整理了一遍整个流程，本文较长，建议先收藏。

概述
==

在进入正题之前，先简单了解一下浏览器的架构作为前置知识。浏览器是多进程的工作的，“从 URL 输入到渲染” 会主要涉及到的，是浏览器进程、网络进程和渲染进程这三个：

1.  浏览器进程负责处理、响应用户交互，比如点击、滚动；
    
2.  网络进程负责处理数据的请求，提供下载功能；
    
3.  渲染进程负责将获取到的 HTML、CSS、JS 处理成可以看见、可以交互的页面；
    

“从 URL 输入到页面渲染” 整个过程可以分成网络请求和浏览器渲染两个部分，分别由网络进程和渲染进程去处理。

网络请求
====

网络请求部分进行了这几项工作：

1.  URL 的解析
    
2.  检查资源缓存
    
3.  DNS 解析
    
4.  建立 TCP 连接
    
5.  TLS 协商密钥
    
6.  发送请求 & 接收响应
    
7.  关闭 TCP 连接
    

接下来会一一展开。

URL 解析
------

浏览器首先会判断输入的内容是一个 URL 还是搜索关键字。

如果是 URL，会把不完整的 URL 合成完整的 URL。一个完整的 URL 应该是：`协议+主机+端口+路径[+参数][+锚点]`。比如我们在地址栏输入`www.baidu.com`，浏览器最终会将其拼接成`https://www.baidu.com/`, 默认使用 443 端口。

如果是搜索关键字，会将其拼接到默认搜索引擎的参数部分去搜索。这个流程需要对输入的不安全字符编码进行转义（安全字符指的是数字、英文和少数符号）。因为 URL 的参数是不能有中文的，也不能有一些特殊字符，比如`= ? &`，否则当我搜索`1+1=2`，假如不加以转义，url 会是`/search?q=1+1=2&source=chrome`，和 URL 本身的分隔符`=`产生了歧义。

URL 对非安全字符转义时，使用的编码叫百分号编码，因为它使用百分号加上两位的 16 进制数表示。这两位 16 进制数来自 UTF-8 编码，将每一个中文转换成 3 个字节，比如我在 google 地址栏输入 “中文”，url 会变成`/search?q=%E4%B8%AD%E6%96%87`，一共 6 个字节。

我们在写代码时经常会用的`encodeURI`和 `encodeURIComponent`正是起这个作用的，它们的规则基本一样，只是`= ? & ; /`这类 URI 组成符号，这些在`encodeURI`中不会被编码，但在`encodeURIComponent`中统统会。因为`encodeURI`是编码整个 URL，而`encodeURIComponent`编码的是参数部分，需要更加严格把关。

检查缓存
----

检查缓存一定是在发起真正的请求之前进行的，只有这样缓存的机制才会生效。如果发现有对应的缓存资源，则去检查缓存的有效期。

1.  在有效期内的缓存资源直接使用，称之为强缓存，从 chrome 网络面板看到这类请求直接返回 200，size 是`memory cache`或者`disk cache`。`memory cache`是指从资源从内存中被取出，`disk cache`是指从磁盘中被取出；从内存中读取比从磁盘中快很多，但资源能不能分配到内存要取决于当下的系统状态。通常来说，刷新页面会使用内存缓存，关闭后重新打开会使用磁盘缓存。
    
2.  超过有效期的，则携带缓存的资源标识向服务端发起请求，校验是否能继续使用，如果服务端告诉我们，可以继续使用本地存储，则返回 304，并且不携带数据；如果服务端告诉我们需要用更新的资源，则返回 200，并且携带更新后的资源和资源标识缓存到本地，方便下一次使用。
    

DNS 解析
------

如果没有成功使用本地缓存，则需要发起网络请求了。首先要做的是 DNS 解析。

会依次搜索:

1.  浏览器的 DNS 缓存；
    
2.  操作系统的 DNS 缓存;
    
3.  路由器的 DNS 缓存；
    
4.  向服务商的 DNS 服务器查询；
    
5.  向全球 13 台根域名服务器查询；
    

为了节省时间，可以在 HTML 头部去做 DNS 的预解析：

```
<link rel="dns-prefetch" href="http://www.baidu.com" />
```

> 为了保证响应的及时，DNS 解析使用的是 UDP 协议

建立 TCP 连接
---------

我们发送的请求是基于 TCP 协议的，所以要先进行连接建立。建立连接的通信是打电话，双方都在线；无连接的通信是发短信，发送方不管接收方，自己说自己的。

这个确认接收方在线的过程就是通过 TCP 的三次握手完成的。

1.  客户端发送建立连接请求；
    
2.  服务端发送建立连接确认，此时服务端为该 TCP 连接分配资源；
    
3.  客户端发送建立连接确认的确认，此时客户端为该 TCP 连接分配资源；
    

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKTcP21bODH81HFSneibE4Lr2hrnA3zgTECiceiaSptkPHicP35lcA91XHdQ/640?wx_fmt=png)

### 为什么要三次握手才算建立连接完成？

可以先假设建立连接只要两次会发生什么。把上面的状态图稍加修改，看起来一切正常。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKMWaXYc6bMphToeOxIzTWI4uy0libhNZvEyeOcoVD2vMlSLIQk1QK5Rw/640?wx_fmt=png)但假如这时服务端收到一个失效的建立连接请求，我们会发现服务端的资源被浪费了——此时客户端并没有想给它传送数据，但它却准备好了内存等资源一直等待着。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFK2QJicUJO9icdejXjKKdZvtM8Kch0XHoL6MqnicFkRKUpHUhJ7mCyBbtEA/640?wx_fmt=png)

所以说，三次握手是为了保证客户端存活, 防止服务端在收到失效的超时请求造成资源浪费。

协商加密密钥——TLS 握手
--------------

为了保障通信的安全，我们使用的是 HTTPS 协议，其中的 S 指的就是 TLS。TLS 使用的是一种非对称 + 对称的方式进行加密。

对称加密就是两边拥有相同的秘钥，两边都知道如何将密文加密解密。这种加密方式速度很快，但是问题在于如何让双方知道秘钥。因为 传输数据都是走的网络，如果将秘钥通过网络的方式传递的话，秘钥被截获，就失去了加密的意义。

非对称加密，每个人都有一把公钥和私钥，公钥所有人都可以知道，私钥只有自己知道，将数据用公钥加密，解密必须使用私钥。这种加密方式就可以完美解决对称加密存在的问题，缺点是速度很慢。

我们采取非对称加密的方式协商出一个对称密钥，这个密钥只有发送方和接收方知道的密钥，流程如下：

1.  客户端发送一个随机值以及需要的协议和加密方式；
    
2.  服务端收到客户端的随机值，发送自己的数字证书，附加上自己产生一个随机值，并根据客户端需求的协议和加密方式使用对应的方式；
    
3.  客户端收到服务端的证书并验证是否有效，验证通过会再生成一个随机值，通过服务端证书的公钥去加密这个随机值并发送给服务端；
    
4.  服务端收到加密过的随机值并使用私钥解密获得第三个随机值，这时候两端都拥有了三个随机值，可以通过这三个随机值按照之前约定的加密方式生成密钥，接下来的通信就可以通过该对称密钥来加密解密；
    

通过以上步骤可知，在 TLS 握手阶段，两端使用非对称加密的方式来通信，但是因为非对称加密损耗的性能比对称加密大，所以在正式传输数据时，两端使用对称加密的方式。

发送请求 & 接收响应
-----------

HTTP 的默认端口是 80，HTTPS 的默认端口是 443。

请求的基本组成是`请求行+请求头+请求体`

```
POST /hello HTTP/1.1
User-Agent: curl/7.16.3 libcurl/7.16.3 OpenSSL/0.9.7l zlib/1.2.3
Host: www.example.com
Accept-Language: en, mi

name=niannian
```

响应的基本组成是`响应行+响应头+响应体`

```
HTTP/1.1 200 OKContent-Type:application/jsonServer:apache{password:'123'}
```

关闭 TCP 连接
---------

等数据传输完毕，就要关闭 TCP 连接了。关闭连接的主动方可以是客户端，也可以是服务端，这里以客户端为例，整个过程有四次握手：

1.  客户端请求释放连接，仅表示客户端不再发送数据了；
    
2.  服务端确认连接释放，但这时可能还有数据需要处理和发送；
    
3.  服务端请求释放连接，服务端这时不再需要发送数据时；
    
4.  客户端确认连接释放;
    

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKNUub21nmtk5KZNkpFvkBXTz4Dxk39RfZZzfmYBHfkLMKSNGCiagIlTQ/640?wx_fmt=png)

### 为什么要有四次挥手

TCP 是可以双向传输数据的，每个方向都需要一个请求和一个确认。因为在第二次握手结束后，服务端还有数据传输，所以没有办法把第二次确认和第三次合并。

### 主动方为什么会等待 2MSL

客户端在发送完第四次的确认报文段后会等待 2MSL 才正真关闭连接，MSL 是指数据包在网络中最大的生存时间。目的是确保服务端收到了这个确认报文段，

假设服务端没有收到第四次握手的报文，试想一下会发生什么？在客户端发送第四次握手的数据包后，服务端首先会等待，在 1 个 MSL 后，它发现超过了网络中数据包的最大生存时间，但是自己还没有收到数据包，于是服务端认为这个数据包已经丢失了，它决定把第三次握手的数据包重新给客户端发送一次，这个数据包最多花费一个 MSL 会到达客户端。

一来一去，一共是 2MSL，所以客户端在发送完第四次握手数据包后，等待 2MSL 是一种兜底机制，**如果在 2MSL 内没有收到其他报文段，客户端则认为服务端已经成功接受到第四次挥手，连接正式关闭。**

浏览器渲染
=====

上面讲完了网络请求部分，现在浏览器拿到了数据，剩下需要渲染进程工作了。浏览器渲染主要完成了一下几个工作：

1.  构建 DOM 树；
    
2.  样式计算；
    
3.  布局定位；
    
4.  图层分层；
    
5.  图层绘制；
    
6.  显示；
    

构建 DOM 树
--------

HTML 文件的结构没法被浏览器理解，所以先要把 HTML 中的标签变成一个可以给 JS 使用的结构。

在控制台可以尝试打印 document，这就是解析出来的 DOM 树。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKboAK8ibZVfTiafWa0Pk6lPEqjpQWY7Q0EJAbrLRGpcdFKcSS89jVpZXA/640?wx_fmt=png)

样式计算
----

CSS 文件一样没法被浏览器直接理解，所以首先把 CSS 解析成样式表。这三类样式都会被解析：

*   通过 link 引用的外部 CSS 文件
    
*   `<style>`标签内的样式
    
*   元素的 style 属性内嵌的 CSS
    

在控制台打印`document.styleSheets`，这就是解析出的样式表。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKHlGY1wMXYiaD86ibPyTNtRviamqDRSCicvQHVHWSZZJaibVqIclNNpHGrbA/640?wx_fmt=png)

利用这份样式表，我们可以计算出 DOM 树中每个节点的样式。之所以叫计算，是因为每个元素要继承其父元素的属性。

```
<style>    span {        color: red    }    div {        font-size: 30px    }</style><div>    <span>年年</span></div>
```

比如上面的`年年`，不仅要接受 span 设定的样式，还要继承 div 设置的。

DOM 树中的节点有了样式，现在被叫做渲染树。

### 为什么要把 CSS 放在头部，js 放在 body 的尾部

在解析 HTML 的过程中，遇到需要加载的资源特点如下：

*   CSS 资源异步下载，下载和解析都不会阻塞构建 dom 树`<link href='./style.css' rel='stylesheet'/>`
    
*   JS 资源同步下载，下载和执行都会阻塞构建 dom 树`<script src='./index.js'/>`
    

因为这样的特性，往往推荐将 CSS 样式表放在 head 头部，js 文件放在 body 尾部，使得渲染能尽早开始。

### CSS 会阻塞 HTML 解析吗

上文提到页面渲染是渲染进程的任务，这个渲染进程中又细分为 GUI 渲染线程和 JS 线程。

解析 HTML 生成 DOM 树，解析 CSS 生成样式表以及后面去生成布局树、图层树都是由 GUI 渲染线程去完成的，这个线程可以一边解析 HTML，一边解析 CSS，这两个是不会冲突的，所以也提倡把 CSS 在头部引入。

但是在 JS 线程执行时，GUI 渲染线程没有办法去解析 HTML，这是因为 JS 可以操作 DOM，如果两者同时进行可能引起冲突。如果这时 JS 去修改了样式，那此时 CSS 的解析和 JS 的执行也没法同时进行了，会先等 CSS 解析完成，再去执行 JS，最后再去解析 HTML。![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKDyppzfgrUBpibAXrJD2dxx3IKc5nkfp88eEmulyy6ibUMOJ2uXktl1JQ/640?wx_fmt=png)

从这个角度来看，CSS 有可能阻塞 HTML 的解析。

### 预加载扫描器是什么

上面提到的外链资源，不论是同步加载 JS 还是异步加载 CSS、图片等，都要到 HTML 解析到这个标签才能开始，这似乎不是一种很好的方式。实际上，从 2008 年开始，浏览器开始逐步实现了预加载扫描器：在拿到 HTML 文档的时候，先扫描整个文档，把 CSS、JS、图片和 web 字体等提前下载。

### js 脚本引入时 async 和 defer 有什么差别

预加载扫描器解决了 JS 同步加载阻塞 HTML 解析的问题，但是我们还没有解决 JS 执行阻塞 HTML 解析的问题。所有有了 async 和 defer 属性。

*   没有 defer 或 async，浏览器会立即加载并执行指定的脚本
    
*   async 属性表示异步执行引入的 JavaScript，经加载好，就会开始执行
    
*   defer 属性表示延迟到 DOM 解析完成，再执行引入的 JS
    

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKPvJdxgtGzEYl9REDvGnpG0Jh7vV6thiaK9Z9IKqQMDygts74pl0DJyA/640?wx_fmt=png)

> 在加载多个 JS 脚本的时候，async 是无顺序的执行，而 defer 是有顺序的执行

### preload、prefetch 有什么区别

之前提到过预加载扫描器，它能提前加载页面需要的资源，但这一功能只对特定写法的外链生效，并且我们没有办法按照自己的想法给重要的资源一个更高的优先级，所以有了 preload 和 prefetch。

1.  preload：以高优先级为当前页面加载资源；
    
2.  prefetch：以低优先级为后面的页面加载未来需要的资源，只会在空闲时才去加载；
    

无论是 preload 还是 prefetch，都只会加载，不会执行，如果预加载的资源被服务器设置了可以缓存`cache-control`那么会进入磁盘，反之只会被保存在内存中。

具体使用如下：

```
<head>    <!-- 文件加载 -->    <link rel="preload" href="main.js" as="script">    <link rel="prefetch" href="news.js" as="script"></head><body>    <h1>hello world!</h1>    <!-- 文件文件执行 -->    <script src="main.js" defer></script></body>
```

为了保证资源正确被预加载，使用时需要注意：

1.  preload 的资源应该在当前页面立即使用，如果不加上 script 标签执行预加载的资源，控制台中会显示警告，提示预加载的资源在当前页面没有被引用；
    
2.  prefetch 的目的是取未来会使用的资源，所以当用户从 A 页面跳转到 B 页面时，进行中的 preload 的资源会被中断，而 prefetch 不会；
    
3.  使用 preload 时，应配合 as 属性，表示该资源的优先级，使用 `as="style"` 属性将获得最高的优先级，`as ="script"`将获得低优先级或中优先级，其他可以取的值有`font/image/audio/video`；
    
4.  preload 字体时要加上`crossorigin`属性，即使没有跨域，否则会重复加载：
    

```
<link rel="preload href="font.woff" as="font" crossorigin>
```

此外，这两种预加载资源不仅可以通过 HTML 标签设置，还可以通过 js 设置

```
var res = document.createElement("link"); res.rel = "preload"; res.as = "style"; res.href = "css/mystyles.css"; document.head.appendChild(res);
```

以及 HTTP 响应头：

```
Link: </uploads/images/pic.png>; rel=prefetch
```

布局定位
----

上面详细的讲述了 HTML 和 CSS 加载、解析过程，现在我们的渲染树中的节点有了样式，但是不知道要画在哪个位置。所以还需要另外一颗布局树确定元素的几何定位。

布局树只取渲染树中的可见元素，意味着 head 标签，`display:none`的元素不会被添加。

图层分层
----

现在我们有了布局树，但依旧不能直接开始绘制，在此之前需要分层，生成一棵对应的图层树。浏览器的页面实际上被分成了很多图层，这些图层叠加后合成了最终的页面。

因为页面中有很多复杂的效果，如一些复杂的 3D 变换、页面滚动，或者使用 z-index 做 z 轴排序等，我们希望能更加方便地实现这些效果。

并不是布局树的每个节点都能生成一个图层，如果一个节点没有自己的层，那么这个节点就从属于父节点的图层

通常满足下面两点中任意一点的元素就可以被提升为单独的一个图层。

1、拥有层叠上下文属性的元素会被提升为单独的一层：明确定位属性`position`的元素、定义透明属性`opacity`的元素、使用 CSS 滤镜`filter`的元素等，都拥有层叠上下文属性。

2、需要剪裁（clip）的地方也会被创建为图层`overflow`

在 chrome 的开发者工具：`更多选项-更多工具-Layers`可以看到图层的分层情况。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKbmibf5u5y80HtdAK033FjjuZvMticf4gjFaNOxJs3otajK2DgfyCBTvA/640?wx_fmt=png)

图层绘制
----

在完成图层树的构建之后，接下来终于到对每个图层进行绘制。首先会把图层拆解成一个一个的绘制指令，排布成一个绘制列表，在上文提到的开发者工具的 Layers 面板中，点击 detail 中的 profiler 可以看到绘制列表。

至此，渲染进程中的主线程——GUI 渲染线程已经完成了它所有任务，接下来交给渲染进程中的合成现成。

合成线程接下来会把视口拆分成图快，把图块转换成位图。

至此，渲染进程的工作全部完成，接下来会把生成的位图还给浏览器进程，最后在页面上显示。

性能优化，还可以做些什么
============

本篇不专讲性能优化，只是在这个命题下补充一些常见手段。

预解析、预渲染
-------

除了上文提到的使用 preload、prefetch 去提前加载，还可以使用`DNS Prefetch`、`Prerender`、`Preconnect`

1.  DNS Prefetch:DNS 预解析；
    

```
<link rel="dns-prefetch" href="//fonts.googleapis.com">
```

2.  preconnect：在一个 HTTP 请求正式发给服务器前预先执行一些操作，这包括 DNS 解析，TLS 协商，TCP 握手；
    

```
<link href="https://cdn.domain.com" rel="preconnect" crossorigin>
```

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZYOfvPpTQO5uDC2LGF7QFKlQeuhGEtXkuLXGYjqdLGhUg1tAH6OooYqPEtDL8o8mRejibwxicjnvZw/640?wx_fmt=png)3. Prerender: 获取下个页面所有的资源，在空闲时渲染整个页面；

```
<link rel="prerender" href="https://www.keycdn.com">
```

减少回流和重绘
-------

回流是指浏览器需要重新计算样式、布局定位、分层和绘制，回流又被叫重排；

触发回流的操作：

*   添加或删除可见的 DOM 元素
    
*   元素的位置发生变化
    
*   元素的尺寸发生变化
    
*   浏览器的窗口尺寸变化
    

重绘是只重新像素绘制，当元素样式的改变不影响布局时触发。

回流 = 计算样式 + 布局 + 分层 + 绘制；重绘 = 绘制。故回流对性能的影响更大

所以应该尽量避免回流和重绘。比如利用 GPU 加速来实现样式修改，`transform/opacity/filters`这些属性的修改都不是在主线程完成的，不会重绘，更不会回流。

结语
==

把 “URL 输入到渲染” 整个过程讲完，回到开头几个比较刁钻的问题，在文中都不难找到答案：

1.  浏览器将输入内容解析后，拼接成完整的 URL，其中的参数使用的是 UTF-8 编码，也就是我们开发时会常用的 encodeURI 和 encodeURIComponent 两个函数，其中 encodeURI 是对完整 URL 编码，encodeURIComponent 是对 URL 参数部分编码，要求会更严格；
    
2.  浏览器缓存的 disk cache 和 memory cache 分别是从磁盘读取和从内存中读取，通常刷新页面会直接从内存读，而关闭 tab 后重新打开是从磁盘读；
    
3.  预加载 prefetch 是在空闲时间，以低优先级加载后续页面用到的资源；而 preload 是以高优先级提前加载当前页面需要的资源；
    
4.  脚本的 async 是指异步加载，完成加载立刻执行，defer 是异步加载，完成 HTML 解析后再执行；
    
5.  TCP 握手需要三次的三次是为了保证客户端的存活，防止服务端资源的浪费，挥手要四次是因为 TCP 是双工通信，每一个方向的连接释放、应答各需要一次；
    
6.  HTTPS 的握手是为了协商出一个对称密钥，双方一共发送三个随机数，利用这三个随机数计算出只有双方知道的密钥，正式通信的内容都是用这个密钥进行加密的；
    

如果这篇文章对你有帮助，帮我点个赞呗～这对我很重要

（点个在看更好！）