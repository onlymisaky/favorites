> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/HPOUy8K8qnWpfSJzxDl6_w)

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 进阶交流群

作者: 静观流叶

原文地址：https://mp.weixin.qq.com/s/PTSaytcf3xgOp6C9l3Pvjw

简答题
---

### 1、什么是防抖和节流？有什么区别？如何实现？

```
参考答案<br style="visibility: visible;">
```

**防抖**

> 触发高频事件后 n 秒内函数只会执行一次，如果 n 秒内高频事件再次被触发，则重新计算时间

*   思路：
    

> 每次触发事件时都取消之前的延时调用方法

```
function debounce(fn) {      let timeout = null; // 创建一个标记用来存放定时器的返回值      return function () {        clearTimeout(timeout); // 每当用户输入的时候把前一个 setTimeout clear 掉        timeout = setTimeout(() => { // 然后又创建一个新的 setTimeout, 这样就能保证输入字符后的 interval 间隔内如果还有字符输入的话，就不会执行 fn 函数          fn.apply(this, arguments);        }, 500);      };    }    function sayHi() {      console.log('防抖成功');    }    var inp = document.getElementById('inp');    inp.addEventListener('input', debounce(sayHi)); // 防抖
```

**节流**

> 高频事件触发，但在 n 秒内只会执行一次，所以节流会稀释函数的执行频率

*   思路：
    

> 每次触发事件时都判断当前是否有等待执行的延时函数

```
function throttle(fn) {      let canRun = true; // 通过闭包保存一个标记      return function () {        if (!canRun) return; // 在函数开头判断标记是否为true，不为true则return        canRun = false; // 立即设置为false        setTimeout(() => { // 将外部传入的函数的执行放在setTimeout中          fn.apply(this, arguments);          // 最后在setTimeout执行完毕后再把标记设置为true(关键)表示可以执行下一次循环了。当定时器没有执行的时候标记永远是false，在开头被return掉          canRun = true;        }, 500);      };    }    function sayHi(e) {      console.log(e.target.innerWidth, e.target.innerHeight);    }    window.addEventListener('resize', throttle(sayHi));
```

### 2、 get 请求传参长度的误区、get 和 post 请求在缓存方面的区别

**误区：我们经常说 get 请求参数的大小存在限制，而 post 请求的参数大小是无限制的。**

```
参考答案
```

实际上 HTTP 协议从未规定 GET/POST 的请求长度限制是多少。对 get 请求参数的限制是来源与浏览器或 web 服务器，浏览器或 web 服务器限制了 url 的长度。为了明确这个概念，我们必须再次强调下面几点:

*   HTTP 协议 未规定 GET 和 POST 的长度限制
    
*   GET 的最大长度显示是因为 浏览器和 web 服务器限制了 URI 的长度
    
*   不同的浏览器和 WEB 服务器，限制的最大长度不一样
    
*   要支持 IE，则最大长度为 2083byte，若只支持 Chrome，则最大长度 8182byte
    

补充补充一个 get 和 post 在缓存方面的区别：

*   get 请求类似于查找的过程，用户获取数据，可以不用每次都与数据库连接，所以可以使用缓存。
    
*   post 不同，post 做的一般是修改和删除的工作，所以必须与数据库交互，所以不能使用缓存。因此 get 请求适合于请求缓存。
    

### 3、模块化发展历程

可从 IIFE、AMD、CMD、CommonJS、UMD、webpack(require.ensure)、ES Module、`<script type="module">` 这几个角度考虑。

```
参考答案
```

模块化主要是用来抽离公共代码，隔离作用域，避免变量冲突等。

**IIFE**：使用自执行函数来编写模块化，特点：**在一个单独的函数作用域中执行代码，避免变量冲突**。

```
(function(){  return {    data:[]  }})()
```

**AMD**：使用 requireJS 来编写模块化，特点：**依赖必须提前声明好**。

```
define('./index.js',function(code){    // code 就是index.js 返回的内容})
```

**CMD**：使用 seaJS 来编写模块化，特点：**支持动态引入依赖文件**。

```
define(function(require, exports, module) {    var indexCode = require('./index.js');})
```

**CommonJS**：nodejs 中自带的模块化。

```
var fs = require('fs');
```

**UMD**：兼容 AMD，CommonJS 模块化语法。

**webpack(require.ensure)**：webpack 2.x 版本中的代码分割。

**ES Modules**：ES6 引入的模块化，支持 import 来引入另一个 js 。

```
import a from 'a';
```

### 4、npm 模块安装机制，为什么输入 npm install 就可以自动安装对应的模块？

```
参考答案
```

#### 1. npm 模块安装机制：

*   发出`npm install`命令
    
*   查询 node_modules 目录之中是否已经存在指定模块
    

*   npm 向 registry 查询模块压缩包的网址
    
*   下载压缩包，存放在根目录下的`.npm`目录里
    
*   解压压缩包到当前项目的`node_modules`目录
    
*   若存在，不再重新安装
    
*   若不存在
    

#### 2. npm 实现原理

输入 npm install 命令并敲下回车后，会经历如下几个阶段（以 npm 5.5.1 为例）：

1.  执行工程自身 preinstall
    
    当前 npm 工程如果定义了 preinstall 钩子此时会被执行。
    
2.  确定首层依赖模块
    
    首先需要做的是确定工程中的首层依赖，也就是 dependencies 和 devDependencies 属性中直接指定的模块（假设此时没有添加 npm install 参数）。
    
    工程本身是整棵依赖树的根节点，每个首层依赖模块都是根节点下面的一棵子树，npm 会开启多进程从每个首层依赖模块开始逐步寻找更深层级的节点。
    
3.  **获取模块**
    
    获取模块是一个递归的过程，分为以下几步：
    

*   获取模块信息。在下载一个模块之前，首先要确定其版本，这是因为 package.json 中往往是 semantic version（semver，语义化版本）。此时如果版本描述文件（npm-shrinkwrap.json 或 package-lock.json）中有该模块信息直接拿即可，如果没有则从仓库获取。如 packaeg.json 中某个包的版本是 ^1.1.0，npm 就会去仓库中获取符合 1.x.x 形式的最新版本。
    
*   获取模块实体。上一步会获取到模块的压缩包地址（resolved 字段），npm 会用此地址检查本地缓存，缓存中有就直接拿，如果没有则从仓库下载。
    
*   查找该模块依赖，如果有依赖则回到第 1 步，如果没有则停止。
    

5.  模块扁平化（dedupe）
    
    上一步获取到的是一棵完整的依赖树，其中可能包含大量重复模块。比如 A 模块依赖于 loadsh，B 模块同样依赖于 lodash。在 npm3 以前会严格按照依赖树的结构进行安装，因此会造成模块冗余。
    
    从 npm3 开始默认加入了一个 dedupe 的过程。它会遍历所有节点，逐个将模块放在根节点下面，也就是 node-modules 的第一层。当发现有**重复模块**时，则将其丢弃。
    
    这里需要对**重复模块**进行一个定义，它指的是**模块名相同**且 **semver 兼容。每个 semver 都对应一段版本允许范围，如果两个模块的版本允许范围存在交集，那么就可以得到一个兼容**版本，而不必版本号完全一致，这可以使更多冗余模块在 dedupe 过程中被去掉。
    
    比如 node-modules 下 foo 模块依赖 lodash@^1.0.0，bar 模块依赖 lodash@^1.1.0，则 **^1.1.0** 为兼容版本。
    
    而当 foo 依赖 lodash@^2.0.0，bar 依赖 lodash@^1.1.0，则依据 semver 的规则，二者不存在兼容版本。会将一个版本放在 node_modules 中，另一个仍保留在依赖树里。
    
    举个例子，假设一个依赖树原本是这样：
    
    node_modules -- foo ---- lodash@version1
    
    -- bar ---- lodash@version2
    
    假设 version1 和 version2 是兼容版本，则经过 dedupe 会成为下面的形式：
    
    node_modules -- foo
    
    -- bar
    
    -- lodash（保留的版本为兼容版本）
    
    假设 version1 和 version2 为非兼容版本，则后面的版本保留在依赖树中：
    
    node_modules -- foo -- lodash@version1
    
    -- bar ---- lodash@version2
    
6.  安装模块
    
    这一步将会更新工程中的 node_modules，并执行模块中的生命周期函数（按照 preinstall、install、postinstall 的顺序）。
    
7.  执行工程自身生命周期
    
    当前 npm 工程如果定义了钩子此时会被执行（按照 install、postinstall、prepublish、prepare 的顺序）。
    
    最后一步是生成或更新版本描述文件，npm install 过程完成。
    

### 5、ES5 的继承和 ES6 的继承有什么区别？

```
参考答案
```

ES5 的继承时通过 prototype 或构造函数机制来实现。**ES5 的继承实质上是先创建子类的实例对象，然后再将父类的方法添加到 this 上**（Parent.apply(this)）。

ES6 的继承机制完全不同，**实质上是先创建父类的实例对象 this（所以必须先调用父类的 super() 方法），然后再用子类的构造函数修改 this**。

具体的：ES6 通过 class 关键字定义类，里面有构造方法，类之间通过 extends 关键字实现继承。子类必须在 constructor 方法中调用 super 方法，否则新建实例报错。因为子类没有自己的 this 对象，而是继承了父类的 this 对象，然后对其进行加工。如果不调用 super 方法，子类得不到 this 对象。

ps：super 关键字指代父类的实例，即父类的 this 对象。在子类构造函数中，调用 super 后，才可使用 this 关键字，否则报错。

### 6、setTimeout、Promise、Async/Await 的区别

参考答案

### 7、定时器的执行顺序或机制？

```
参考答案
```

** 因为 js 是单线程的，浏览器遇到 setTimeout 或者 setInterval 会先执行完当前的代码块，在此之前会把定时器推入浏览器的待执行事件队列里面，等到浏览器执行完当前代码之后会看一下事件队列里面有没有任务，有的话才执行定时器的代码。** 所以即使把定时器的时间设置为 0 还是会先执行当前的一些代码。

```
function test(){    var aa = 0;    var testSet = setInterval(function(){        aa++;        console.log(123);        if(aa<10){            clearInterval(testSet);        }    },20);  var testSet1 = setTimeout(function(){    console.log(321)  },1000);  for(var i=0;i<10;i++){    console.log('test');  }}test()
```

输出结果：

```
test //10次undefined123321
```

### 8、['1','2','3'].map(parseInt) 输出什么, 为什么?

```
参考答案
```

输出：**[1, NaN, NaN]**

*   首先让我们回顾一下，map 函数的第一个参数 callback：
    

`var new_array = arr.map(function callback(currentValue[, index[, array]]) { // Return element for new_array }[, thisArg])`这个 callback 一共可以接收三个参数，其中第一个参数代表当前被处理的元素，而第二个参数代表该元素的索引。

*   而 parseInt 则是用来解析字符串的，使字符串成为指定基数的整数。`parseInt(string, radix)`接收两个参数，第一个表示被处理的值（字符串），第二个表示为解析时的基数。
    
*   了解这两个函数后，我们可以模拟一下运行情况
    

1.  parseInt('1', 0) //radix 为 0 时，且 string 参数不以 “0x” 和“0”开头时，按照 10 为基数处理。这个时候返回 1
    
2.  parseInt('2', 1) // 基数为 1（1 进制）表示的数中，最大值小于 2，所以无法解析，返回 NaN
    
3.  parseInt('3', 2) // 基数为 2（2 进制）表示的数中，最大值小于 3，所以无法解析，返回 NaN
    

*   map 函数返回的是一个数组，所以最后结果为 [1, NaN, NaN]
    

### 9、Doctype 作用? 严格模式与混杂模式如何区分？它们有何意义?

```
参考答案
```

Doctype 声明于文档最前面，告诉浏览器以何种方式来渲染页面，这里有两种模式，严格模式和混杂模式。

*   严格模式的排版和 JS 运作模式是 以该浏览器支持的最高标准运行。
    
*   混杂模式，向后兼容，模拟老式浏览器，防止浏览器无法兼容页面。
    

### 10、fetch 发送 2 次请求的原因

```
参考答案
```

**fetch 发送 post 请求的时候，总是发送 2 次，第一次状态码是 204，第二次才成功？**

原因很简单，因为你用 fetch 的 post 请求的时候，导致 fetch 第一次发送了一个 Options 请求，询问服务器是否支持修改的请求头，如果服务器支持，则在第二次中发送真正的请求。

http、浏览器对象
----------

### 1、HTTPS 握手过程中，客户端如何验证证书的合法性

```
参考答案
```

*   首先什么是 HTTP 协议?
    
    http 协议是超文本传输协议，位于 tcp/ip 四层模型中的应用层；通过请求 / 响应的方式在客户端和服务器之间进行通信；但是缺少安全性，http 协议信息传输是通过明文的方式传输，不做任何加密，相当于在网络上裸奔；容易被中间人恶意篡改，这种行为叫做中间人攻击；
    
*   加密通信：
    
    为了安全性，双方可以使用对称加密的方式 key 进行信息交流，但是这种方式对称加密秘钥也会被拦截，也不够安全，进而还是存在被中间人攻击风险；于是人们又想出来另外一种方式，使用非对称加密的方式；使用公钥 / 私钥加解密；通信方 A 发起通信并携带自己的公钥，接收方 B 通过公钥来加密对称秘钥；然后发送给发起方 A；A 通过私钥解密；双发接下来通过对称秘钥来进行加密通信；但是这种方式还是会存在一种安全性；中间人虽然不知道发起方 A 的私钥，但是可以做到偷天换日，将拦截发起方的公钥 key; 并将自己生成的一对公 / 私钥的公钥发送给 B；接收方 B 并不知道公钥已经被偷偷换过；按照之前的流程，B 通过公钥加密自己生成的对称加密秘钥 key2; 发送给 A；这次通信再次被中间人拦截，尽管后面的通信，两者还是用 key2 通信，但是中间人已经掌握了 Key2; 可以进行轻松的加解密；还是存在被中间人攻击风险；
    
*   解决困境：权威的证书颁发机构 CA 来解决；
    

*   制作证书：作为服务端的 A，首先把自己的公钥 key1 发给证书颁发机构，向证书颁发机构进行申请证书；证书颁发机构有一套自己的公私钥，CA 通过自己的私钥来加密 key1, 并且通过服务端网址等信息生成一个证书签名，证书签名同样使用机构的私钥进行加密；制作完成后，机构将证书发给 A；
    
*   校验证书真伪：当 B 向服务端 A 发起请求通信的时候，A 不再直接返回自己的公钥，而是返回一个证书；
    

说明：各大浏览器和操作系统已经维护了所有的权威证书机构的名称和公钥。B 只需要知道是哪个权威机构发的证书，使用对应的机构公钥，就可以解密出证书签名；接下来，B 使用同样的规则，生成自己的证书签名，如果两个签名是一致的，说明证书是有效的；签名验证成功后，B 就可以再次利用机构的公钥，解密出 A 的公钥 key1; 接下来的操作，就是和之前一样的流程了；

*   中间人是否会拦截发送假证书到 B 呢？
    

因为证书的签名是由服务器端网址等信息生成的，并且通过第三方机构的私钥加密中间人无法篡改；所以最关键的问题是证书签名的真伪；

*   https 主要的思想是在 http 基础上增加了 ssl 安全层，即以上认证过程；
    

### 2、TCP 三次握手和四次挥手

```
参考答案
```

三次握手之所以是三次是保证 client 和 server 均让对方知道自己的接收和发送能力没问题而保证的最小次数。

第一次 client => server 只能 server 判断出 client 具备发送能力 第二次 server => client client 就可以判断出 server 具备发送和接受能力。此时 client 还需让 server 知道自己接收能力没问题于是就有了第三次 第三次 client => server 双方均保证了自己的接收和发送能力没有问题

其中，为了保证后续的握手是为了应答上一个握手，每次握手都会带一个标识 seq，后续的 ACK 都会对这个 seq 进行加一来进行确认。

### 3、**img iframe script 来发送跨域请求有什么优缺点？**

```
参考答案
```

*   iframe
    

优点：跨域完毕之后 DOM 操作和互相之间的 JavaScript 调用都是没有问题的

缺点：1. 若结果要以 URL 参数传递，这就意味着在结果数据量很大的时候需要分割传递，巨烦。2. 还有一个是 iframe 本身带来的，母页面和 iframe 本身的交互本身就有安全性限制。

*   script
    

优点：可以直接返回 json 格式的数据，方便处理

缺点：只接受 GET 请求方式

*   图片 ping
    

优点：可以访问任何 url，一般用来进行点击追踪，做页面分析常用的方法

缺点：不能访问响应文本，只能监听是否响应

### 4、http 和 https 的区别？

```
参考答案
```

http 传输的数据都是未加密的，也就是明文的，网景公司设置了 SSL 协议来对 http 协议传输的数据进行加密处理，简单来说 https 协议是由 http 和 ssl 协议构建的可进行加密传输和身份认证的网络协议，比 http 协议的安全性更高。主要的区别如下：

*   Https 协议需要 ca 证书，费用较高。
    
*   http 是超文本传输协议，信息是明文传输，https 则是具有安全性的 ssl 加密传输协议。
    
*   使用不同的链接方式，端口也不同，一般而言，http 协议的端口为 80，https 的端口为 443
    
*   http 的连接很简单，是无状态的；HTTPS 协议是由 SSL+HTTP 协议构建的可进行加密传输、身份认证的网络协议，比 http 协议安全。
    

### 5、什么是 Bom？有哪些常用的 Bom 属性？

```
参考答案
```

Bom 是浏览器对象

**location 对象**

*   location.href-- 返回或设置当前文档的 URL
    
*   location.search -- 返回 URL 中的查询字符串部分。例如 http://www.dreamdu.com/dreamd... 返回包括 (?) 后面的内容? id=5&name=dreamdu
    
*   location.hash -- 返回 URL# 后面的内容，如果没有 #，返回空 location.host -- 返回 URL 中的域名部分，例如 www.dreamdu.com
    
*   location.hostname -- 返回 URL 中的主域名部分，例如 dreamdu.com
    
*   location.pathname -- 返回 URL 的域名后的部分。例如 http://www.dreamdu.com/xhtml/ 返回 / xhtml/
    
*   location.port -- 返回 URL 中的端口部分。例如 http://www.dreamdu.com:8080/xhtml/ 返回 8080
    
*   location.protocol -- 返回 URL 中的协议部分。例如 http://www.dreamdu.com:8080/xhtml/ 返回 (//) 前面的内容 http:
    
*   location.assign -- 设置当前文档的 URL
    
*   location.replace() -- 设置当前文档的 URL，并且在 history 对象的地址列表中移除这个 URL location.replace(url);
    
*   location.reload() -- 重载当前页面
    

**history 对象**

*   history.go() -- 前进或后退指定的页面数
    
*   history.go(num); history.back() -- 后退一页
    
*   history.forward() -- 前进一页
    

**Navigator 对象**

*   navigator.userAgent -- 返回用户代理头的字符串表示 (就是包括浏览器版本信息等的字符串)
    
*   navigator.cookieEnabled -- 返回浏览器是否支持 (启用)cookie
    

### 6、Cookie、sessionStorage、localStorage 的区别

```
参考答案
```

共同点：都是保存在浏览器端，并且是同源的

*   Cookie：cookie 数据始终在同源的 http 请求中携带（即使不需要），即 cookie 在浏览器和服务器间来回传递。而 sessionStorage 和 localStorage 不会自动把数据发给服务器，仅在本地保存。cookie 数据还有路径（path）的概念，可以限制 cookie 只属于某个路径下, 存储的大小很小只有 4K 左右。（key：可以在浏览器和服务器端来回传递，存储容量小，只有大约 4K 左右）
    
*   sessionStorage：仅在当前浏览器窗口关闭前有效，自然也就不可能持久保持，localStorage：始终有效，窗口或浏览器关闭也一直保存，因此用作持久数据；cookie 只在设置的 cookie 过期时间之前一直有效，即使窗口或浏览器关闭。（key：本身就是一个回话过程，关闭浏览器后消失，session 为一个回话，当页面不同即使是同一页面打开两次，也被视为同一次回话）
    
*   localStorage：localStorage 在所有同源窗口中都是共享的；cookie 也是在所有同源窗口中都是共享的。（key：同源窗口都会共享，并且不会失效，不管窗口或者浏览器关闭与否都会始终生效）
    

补充说明一下 cookie 的作用：

*   保存用户登录状态。例如将用户 id 存储于一个 cookie 内，这样当用户下次访问该页面时就不需要重新登录了，现在很多论坛和社区都提供这样的功能。cookie 还可以设置过期时间，当超过时间期限后，cookie 就会自动消失。因此，系统往往可以提示用户保持登录状态的时间：常见选项有一个月、三个 月、一年等。
    
*   跟踪用户行为。例如一个天气预报网站，能够根据用户选择的地区显示当地的天气情况。如果每次都需要选择所在地是烦琐的，当利用了 cookie 后就会显得很人性化了，系统能够记住上一次访问的地区，当下次再打开该页面时，它就会自动显示上次用户所在地区的天气情况。因为一切都是在后 台完成，所以这样的页面就像为某个用户所定制的一样，使用起来非常方便
    
*   定制页面。如果网站提供了换肤或更换布局的功能，那么可以使用 cookie 来记录用户的选项，例如：背景色、分辨率等。当用户下次访问时，仍然可以保存上一次访问的界面风格。
    

### 7、Cookie 如何防范 XSS 攻击

```
参考答案
```

XSS（跨站脚本攻击）是指攻击者在返回的 HTML 中嵌入 javascript 脚本，为了减轻这些攻击，需要在 HTTP 头部配上，set-cookie：

*   httponly - 这个属性可以防止 XSS, 它会禁止 javascript 脚本来访问 cookie。
    
*   secure - 这个属性告诉浏览器仅在请求为 https 的时候发送 cookie。
    

结果应该是这样的：Set-Cookie=.....

### 8、浏览器和 Node 事件循环的区别？

```
参考答案
```

其中一个主要的区别在于浏览器的 event loop 和 nodejs 的 event loop 在处理异步事件的顺序是不同的, nodejs 中有 micro event; 其中 Promise 属于 micro event 该异步事件的处理顺序就和浏览器不同. nodejs V11.0 以上 这两者之间的顺序就相同了.

```
function test () {   console.log('start')    setTimeout(() => {        console.log('children2')        Promise.resolve().then(() => {console.log('children2-1')})    }, 0)    setTimeout(() => {        console.log('children3')        Promise.resolve().then(() => {console.log('children3-1')})    }, 0)    Promise.resolve().then(() => {console.log('children1')})    console.log('end') }test()// 以上代码在node11以下版本的执行结果(先执行所有的宏任务，再执行微任务)// start// end// children1// children2// children3// children2-1// children3-1// 以上代码在node11及浏览器的执行结果(顺序执行宏任务和微任务)// start// end// children1// children2// children2-1// children3// children3-1
```

### 9、简述 HTTPS 中间人攻击

```
参考答案
```

https 协议由 http + ssl 协议构成，具体的链接过程可参考 SSL 或 TLS 握手的概述

中间人攻击过程如下：

1.  服务器向客户端发送公钥。
    
2.  攻击者截获公钥，保留在自己手上。
    
3.  然后攻击者自己生成一个【伪造的】公钥，发给客户端。
    
4.  客户端收到伪造的公钥后，生成加密 hash 值发给服务器。
    
5.  攻击者获得加密 hash 值，用自己的私钥解密获得真秘钥。
    
6.  同时生成假的加密 hash 值，发给服务器。
    
7.  服务器用私钥解密获得假秘钥。
    
8.  服务器用加秘钥加密传输信息
    

防范方法：

1.  服务端在发送浏览器的公钥中加入 CA 证书，浏览器可以验证 CA 证书的有效性
    

### 10、说几条 web 前端优化策略

```
参考答案
```

(1). 减少 HTTP 请求数

这条策略基本上所有前端人都知道，而且也是最重要最有效的。都说要减少 HTTP 请求，那请求多了到底会怎么样呢？首先，每个请求都是有成本的，既包 含时间成本也包含资源成本。一个完整的请求都需要经过 DNS 寻址、与服务器建立连接、发送数据、等待服务器响应、接收数据这样一个 “漫长” 而复杂的过程。时间成本就是用户需要看到或者 “感受” 到这个资源是必须要等待这个过程结束的，资源上由于每个请求都需要携带数据，因此每个请求都需要占用带宽。

另外，由于浏览器进行并发请求的请求数是有上限的，因此请求数多了以后，浏览器需要分批进行请求，因此会增加用户的等待时间，会给 用户造成站点速度慢这样一个印象，即使可能用户能看到的第一屏的资源都已经请求完了，但是浏览器的进度条会一直存在。减少 HTTP 请求数的主要途径包括：

(2). 从设计实现层面简化页面

如果你的页面像百度首页一样简单，那么接下来的规则基本上都用不着了。保持页面简洁、减少资源的使用时最直接的。如果不是这样，你的页面需要华丽的皮肤，则继续阅读下面的内容。

(3). 合理设置 HTTP 缓存

缓存的力量是强大的，恰当的缓存设置可以大大的减少 HTTP 请求。以有啊首页为例，当浏览器没有缓存的时候访问一共会发出 78 个请求，共 600 多 K 数据（如图 1.1），而当第二次访问即浏览器已缓存之后访问则仅有 10 个请求，共 20 多 K 数据（如图 1.2）。（这里需要说明的是，如果直接 F5 刷新页面 的话效果是不一样的，这种情况下请求数还是一样，不过被缓存资源的请求服务器是 304 响应，只有 Header 没有 Body，可以节省带宽）

怎样才算合理设置？原则很简单，能缓存越多越好，能缓存越久越好。例如，很少变化的图片资源可以直接通过 HTTP Header 中的 Expires 设置一个很长的过期头；变化不频繁而又可能会变的资源可以使用 Last-Modifed 来做请求验证。尽可能的让资源能够 在缓存中待得更久。

(4). 资源合并与压缩

如果可以的话，尽可能的将外部的脚本、样式进行合并，多个合为一个。另外，CSS、Javascript、Image 都可以用相应的工具进行压缩，压缩后往往能省下不少空间。

(5). CSS Sprites

合并 CSS 图片，减少请求数的又一个好办法。

(6). Inline Images

使用 data: URL scheme 的方式将图片嵌入到页面或 CSS 中，如果不考虑资源管理上的问题的话，不失为一个好办法。如果是嵌入页面的话换来的是增大了页面的体积，而且无法利用浏览器缓存。使用在 CSS 中的图片则更为理想一些。

(7). Lazy Load Images

这条策略实际上并不一定能减少 HTTP 请求数，但是却能在某些条件下或者页面刚加载时减少 HTTP 请求数。对于图片而言，在页面刚加载的时候可以只 加载第一屏，当用户继续往后滚屏的时候才加载后续的图片。这样一来，假如用户只对第一屏的内容感兴趣时，那剩余的图片请求就都节省了。有啊首页曾经的做法 是在加载的时候把第一屏之后的图片地址缓存在 Textarea 标签中，待用户往下滚屏的时候才 “惰性” 加载。

### 11、你了解的浏览器的重绘和回流导致的性能问题

```
参考答案
```

**重绘（Repaint）和回流（Reflow）**

重绘和回流是渲染步骤中的一小节，但是这两个步骤对于性能影响很大。

*   重绘是当节点需要更改外观而不会影响布局的，比如改变 `color`就叫称为重绘
    
*   回流是布局或者几何属性需要改变就称为回流。
    

回流必定会发生重绘，重绘不一定会引发回流。回流所需的成本比重绘高的多，改变深层次的节点很可能导致父节点的一系列回流。

所以以下几个动作可能会导致性能问题：

*   改变 window 大小
    
*   改变字体
    
*   添加或删除样式
    
*   文字改变
    
*   定位或者浮动
    
*   盒模型
    

很多人不知道的是，重绘和回流其实和 Event loop 有关。

1.  当 Event loop 执行完 Microtasks 后，会判断 document 是否需要更新。因为浏览器是 60Hz 的刷新率，每 16ms 才会更新一次。
    
2.  然后判断是否有 `resize`或者 `scroll`，有的话会去触发事件，所以 `resize`和 `scroll`事件也是至少 16ms 才会触发一次，并且自带节流功能。
    
3.  判断是否触发了 media query
    
4.  更新动画并且发送事件
    
5.  判断是否有全屏操作事件
    
6.  执行 `requestAnimationFrame`回调
    
7.  执行 `IntersectionObserver`回调，该方法用于判断元素是否可见，可以用于懒加载上，但是兼容性不好
    
8.  更新界面
    
9.  以上就是一帧中可能会做的事情。如果在一帧中有空闲时间，就会去执行 `requestIdleCallback`回调。
    

**减少重绘和回流**

*   使用 `translate` 替代 `top`
    
    ```
    <div class="test"></div><style>    .test {        position: absolute;        top: 10px;        width: 100px;        height: 100px;        background: red;    }</style><script>    setTimeout(() => {        // 引起回流        document.querySelector('.test').style.top = '100px'    }, 1000)</script>
    ```
    
*   使用 `visibility`替换 `display: none`，因为前者只会引起重绘，后者会引发回流（改变了布局）
    
    把 DOM 离线后修改，比如：先把 DOM 给 `display:none`(有一次 Reflow)，然后你修改 100 次，然后再把它显示出来
    
    不要把 DOM 结点的属性值放在一个循环里当成循环里的变量
    
    ```
    for(let i = 0; i < 1000; i++) {    // 获取 offsetTop 会导致回流，因为需要去获取正确的值    console.log(document.querySelector('.test').style.offsetTop)}
    ```
    
*   不要使用 table 布局，可能很小的一个小改动会造成整个 table 的重新布局
    
*   动画实现的速度的选择，动画速度越快，回流次数越多，也可以选择使用 `requestAnimationFrame`
    
*   CSS 选择符从右往左匹配查找，避免 DOM 深度过深
    
*   将频繁运行的动画变为图层，图层能够阻止该节点回流影响别的元素。比如对于 `video`标签，浏览器会自动将该节点变为图层。
    

react、Vue
---------

### 1、写 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？

```
参考答案
```

vue 和 react 都是采用 diff 算法来对比新旧虚拟节点，从而更新节点。在 vue 的 diff 函数中（建议先了解一下 diff 算法过程）。在交叉对比中，当新节点跟旧节点`头尾交叉对比`没有结果时，会根据新节点的 key 去对比旧节点数组中的 key，从而找到相应旧节点（这里对应的是一个 key => index 的 map 映射）。如果没找到就认为是一个新增节点。而如果没有 key，那么就会采用遍历查找的方式去找到对应的旧节点。一种一个 map 映射，另一种是遍历查找。相比而言。map 映射的速度更快。vue 部分源码如下：

```
// vue项目  src/core/vdom/patch.js  -488行// 以下是为了阅读性进行格式化后的代码// oldCh 是一个旧虚拟节点数组if (isUndef(oldKeyToIdx)) {  oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)}if(isDef(newStartVnode.key)) {  // map 方式获取  idxInOld = oldKeyToIdx[newStartVnode.key]} else {  // 遍历方式获取  idxInOld = findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)}
```

创建 map 函数

```
function createKeyToOldIdx (children, beginIdx, endIdx) {  let i, key  const map = {}  for (i = beginIdx; i <= endIdx; ++i) {    key = children[i].key    if (isDef(key)) map[key] = i  }  return map}
```

遍历寻找

```
// sameVnode 是对比新旧节点是否相同的函数 function findIdxInOld (node, oldCh, start, end) {    for (let i = start; i < end; i++) {      const c = oldCh[i]            if (isDef(c) && sameVnode(node, c)) return i    }  }
```

### 2、React 中 setState 什么时候是同步的，什么时候是异步的？

```
参考答案
```

在 React 中，**如果是由 React 引发的事件处理（比如通过 onClick 引发的事件处理），调用 setState 不会同步更新 this.state，除此之外的 setState 调用会同步执行 this.state**。所谓 “除此之外”，指的是绕过 React 通过 addEventListener 直接添加的事件处理函数，还有通过 setTimeout/setInterval 产生的异步调用。

** 原因：** 在 React 的 setState 函数实现中，会根据一个变量 isBatchingUpdates 判断是直接更新 this.state 还是放到队列中回头再说，而 isBatchingUpdates 默认是 false，也就表示 setState 会同步更新 this.state，但是，**有一个函数 batchedUpdates，这个函数会把 isBatchingUpdates 修改为 true，而当 React 在调用事件处理函数之前就会调用这个 batchedUpdates，造成的后果，就是由 React 控制的事件处理过程 setState 不会同步更新 this.state**。

### 3、下面输出什么

```
class Example extends React.Component {  constructor() {    super();    this.state = {      val: 0    };  }    componentDidMount() {    this.setState({val: this.state.val + 1});    console.log(this.state.val);    // 第 1 次 log    this.setState({val: this.state.val + 1});    console.log(this.state.val);    // 第 2 次 log    setTimeout(() => {      this.setState({val: this.state.val + 1});      console.log(this.state.val);  // 第 3 次 log      this.setState({val: this.state.val + 1});      console.log(this.state.val);  // 第 4 次 log    }, 0);  }  render() {    return null;  }};1、第一次和第二次都是在 react 自身生命周期内，触发时 isBatchingUpdates 为 true，所以并不会直接执行更新 state，而是加入了 dirtyComponents，所以打印时获取的都是更新前的状态 0。2、两次 setState 时，获取到 this.state.val 都是 0，所以执行时都是将 0 设置成 1，在 react 内部会被合并掉，只执行一次。设置完成后 state.val 值为 1。3、setTimeout 中的代码，触发时 isBatchingUpdates 为 false，所以能够直接进行更新，所以连着输出 2，3。输出： 0 0 2 3
```

### 4、为什么虚拟 dom 会提高性能?

```
参考答案
```

虚拟 dom 相当于在 js 和真实 dom 中间加了一个缓存，利用 dom diff 算法避免了没有必要的 dom 操作，从而提高性能。

具体实现步骤如下：

用 JavaScript 对象结构表示 DOM 树的结构；然后用这个树构建一个真正的 DOM 树，插到文档当中

当状态变更的时候，重新构造一棵新的对象树。然后用新的树和旧的树进行比较，记录两棵树差异

把 2 所记录的差异应用到步骤 1 所构建的真正的 DOM 树上，视图就更新了。

css
---

### 1、分析比较 opacity: 0、visibility: hidden、display: none 优劣和适用场景

```
参考答案
```

结构：display:none: 会让元素完全从渲染树中消失，渲染的时候不占据任何空间, 不能点击， visibility: hidden: 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，不能点击 opacity: 0: 不会让元素从渲染树消失，渲染元素继续占据空间，只是内容不可见，可以点击

继承：display: none：是非继承属性，子孙节点消失由于元素从渲染树消失造成，通过修改子孙节点属性无法显示。visibility: hidden：是继承属性，子孙节点消失由于继承了 hidden，通过设置 visibility: visible; 可以让子孙节点显式。

性能：displaynone : 修改元素会造成文档回流, 读屏器不会读取 display: none 元素内容，性能消耗较大 visibility:hidden: 修改元素只会造成本元素的重绘, 性能消耗较少读屏器读取 visibility: hidden 元素内容 opacity: 0 ：修改元素会造成重绘，性能消耗较少

联系：它们都能让元素不可见

### 2、清除浮动的方式有哪些? 比较好的是哪一种?

```
参考答案
```

常用的一般为三种`.clearfix`, `clear:both`,`overflow:hidden`;

比较好是 `.clearfix`, 伪元素万金油版本, 后两者有局限性.

```
.clearfix:after {  visibility: hidden;  display: block;  font-size: 0;  content: " ";  clear: both;  height: 0;}<!--为毛没有 zoom ,_height 这些,IE6,7这类需要 csshack 不再我们考虑之内了.clearfix 还有另外一种写法,-->.clearfix:before, .clearfix:after {    content:"";    display:table;}.clearfix:after{    clear:both;    overflow:hidden;}.clearfix{    zoom:1;}<!--用display:table 是为了避免外边距margin重叠导致的margin塌陷,内部元素默认会成为 table-cell 单元格的形式-->
```

`clear:both`: 若是用在同一个容器内相邻元素上, 那是贼好的, 有时候在容器外就有些问题了, 比如相邻容器的包裹层元素塌陷

`overflow:hidden`: 这种若是用在同个容器内, 可以形成 `BFC`避免浮动造成的元素塌陷

### 4、css sprite 是什么, 有什么优缺点

```
参考答案
```

概念：将多个小图片拼接到一个图片中。通过 background-position 和元素尺寸调节需要显示的背景图案。

优点：

1.  减少 HTTP 请求数，极大地提高页面加载速度
    
2.  增加图片信息重复度，提高压缩比，减少图片大小
    
3.  更换风格方便，只需在一张或几张图片上修改颜色或样式即可实现
    

缺点：

1.  图片合并麻烦
    
2.  维护麻烦，修改一个图片可能需要重新布局整个图片，样式
    

### 5、`link`与`@import`的区别

```
参考答案
```

1.  `link`是 HTML 方式， `@import`是 CSS 方式
    
2.  `link`最大限度支持并行下载，`@import`过多嵌套导致串行下载，出现 FOUC
    
3.  `link`可以通过`rel="alternate stylesheet"`指定候选样式
    
4.  浏览器对`link`支持早于`@import`，可以使用`@import`对老浏览器隐藏样式
    
5.  `@import`必须在样式规则之前，可以在 css 文件中引用其他文件
    
6.  总体来说：**link 优于 @import**
    

### 6、`display: block;`和`display: inline;`的区别

```
参考答案
```

`block`元素特点：

1. 处于常规流中时，如果`width`没有设置，会自动填充满父容器 2. 可以应用`margin/padding` 3. 在没有设置高度的情况下会扩展高度以包含常规流中的子元素 4. 处于常规流中时布局时在前后元素位置之间（独占一个水平空间） 5. 忽略`vertical-align`

`inline`元素特点

1. 水平方向上根据`direction`依次布局

2. 不会在元素前后进行换行

3. 受`white-space`控制

4.`margin/padding`在竖直方向上无效，水平方向上有效

5.`width/height`属性对非替换行内元素无效，宽度由元素内容决定

6. 非替换行内元素的行框高由`line-height`确定，替换行内元素的行框高由`height`,`margin`,`padding`,`border`决定 7. 浮动或绝对定位时会转换为`block`8.`vertical-align`属性生效

### 7、容器包含若干浮动元素时如何清理浮动

```
参考答案
```

1.  容器元素闭合标签前添加额外元素并设置`clear: both`
    
2.  父元素触发块级格式化上下文 (见块级可视化上下文部分)
    
3.  设置容器元素伪元素进行清理推荐的清理浮动方法
    

```
/*** 在标准浏览器下使用* 1 content内容为空格用于修复opera下文档中出现*   contenteditable属性时在清理浮动元素上下的空白* 2 使用display使用table而不是block：可以防止容器和*   子元素top-margin折叠,这样能使清理效果与BFC，IE6/7*   zoom: 1;一致**/.clearfix:before,.clearfix:after {    content: " "; /* 1 */    display: table; /* 2 */}.clearfix:after {    clear: both;}/*** IE 6/7下使用* 通过触发hasLayout实现包含浮动**/.clearfix {    *zoom: 1;}
```

### 8、PNG,GIF,JPG 的区别及如何选

```
参考答案
```

**GIF**:

1.  8 位像素，256 色
    
2.  无损压缩
    
3.  支持简单动画
    
4.  支持 boolean 透明
    
5.  适合简单动画
    

**JPEG**：

1.  颜色限于 256
    
2.  有损压缩
    
3.  可控制压缩质量
    
4.  不支持透明
    
5.  适合照片
    

**PNG**：

1.  有 PNG8 和 truecolor PNG
    
2.  PNG8 类似 GIF 颜色上限为 256，文件小，支持 alpha 透明度，无动画
    
3.  适合图标、背景、按钮
    

### 9、display,float,position 的关系

```
参考答案
```

1.  如果`display`为 none，那么 position 和 float 都不起作用，这种情况下元素不产生框
    
2.  否则，如果 position 值为 absolute 或者 fixed，框就是绝对定位的，float 的计算值为 none，display 根据下面的表格进行调整。
    
3.  否则，如果 float 不是 none，框是浮动的，display 根据下表进行调整
    
4.  否则，如果元素是根元素，display 根据下表进行调整
    
5.  其他情况下 display 的值为指定值 总结起来：**绝对定位、浮动、根元素都需要调整 display**
    

### 10、如何水平居中一个元素

```
参考答案
```

*   如果需要居中的元素为**常规流中 inline 元素**，为父元素设置`text-align: center;`即可实现
    
*   如果需要居中的元素为**常规流中 block 元素**，1）为元素设置宽度，2）设置左右 margin 为 auto。3）IE6 下需在父元素上设置`text-align: center;`, 再给子元素恢复需要的值
    
*   ```
    <body>    <div class="content">    aaaaaa aaaaaa a a a a a a a a    </div></body><style>    body {        background: #DDD;        text-align: center; /* 3 */    }    .content {        width: 500px;      /* 1 */        text-align: left;  /* 3 */        margin: 0 auto;    /* 2 */        background: purple;    }</style>
    ```
    
*   如果需要居中的元素为**浮动元素**，1）为元素设置宽度，2）`position: relative;`，3）浮动方向偏移量（left 或者 right）设置为 50%，4）浮动方向上的 margin 设置为元素宽度一半乘以 - 1
    
    ```
    <body>    <div class="content">    aaaaaa aaaaaa a a a a a a a a    </div></body><style>    body {        background: #DDD;    }    .content {        width: 500px;         /* 1 */        float: left;        position: relative;   /* 2 */        left: 50%;            /* 3 */        margin-left: -250px;  /* 4 */        background-color: purple;    }</style>
    ```
    
*   如果需要居中的元素为**绝对定位元素**，1）为元素设置宽度，2）偏移量设置为 50%，3）偏移方向外边距设置为元素宽度一半乘以 - 1
    
    ```
    <body>    <div class="content">    aaaaaa aaaaaa a a a a a a a a    </div></body><style>    body {        background: #DDD;        position: relative;    }    .content {        width: 800px;        position: absolute;        left: 50%;        margin-left: -400px;        background-color: purple;    }</style>
    ```
    
*   如果需要居中的元素为**绝对定位元素**，1）为元素设置宽度，2）设置左右偏移量都为 0,3）设置左右外边距都为 auto
    
    ```
    <body>    <div class="content">    aaaaaa aaaaaa a a a a a a a a    </div></body><style>    body {        background: #DDD;        position: relative;    }    .content {        width: 800px;        position: absolute;        margin: 0 auto;        left: 0;        right: 0;        background-color: purple;    }</style>
    ```
    

JavaScript
----------

### 1、JS 有几种数据类型, 其中基本数据类型有哪些?

```
参考答案
```

**七种数据类型**

*   Boolean
    
*   Null
    
*   Undefined
    
*   Number
    
*   String
    
*   Symbol (ECMAScript 6 新定义)
    
*   Object
    

(ES6 之前) 其中 5 种为基本类型:`string`,`number`,`boolean`,`null`,`undefined`,

ES6 出来的`Symbol`也是原始数据类型 ，表示独一无二的值

`Object`为引用类型 (范围挺大), 也包括数组、函数,

### 2、Promise 构造函数是同步执行还是异步执行，那么 then 方法呢？

```
参考答案
const promise = new Promise((resolve, reject) => {
  console.log(1)
  resolve()
  console.log(2)
})

promise.then(() => {
  console.log(3)
})

console.log(4)
```

输出结果是：

```
1243promise构造函数是同步执行的，then方法是异步执行的Promise new的时候会立即执行里面的代码 then是微任务 会在本次任务执行完的时候执行 setTimeout是宏任务 会在下次任务执行的时候执行
```

### 3、JS 的四种设计模式

```
参考答案
```

**工厂模式**

简单的工厂模式可以理解为解决多个相似的问题;

```
function CreatePerson(name,age,sex) {    var obj = new Object();    obj.name = name;    obj.age = age;    obj.sex = sex;    obj.sayName = function(){        return this.name;    }    return obj;}var p1 = new CreatePerson("longen",'28','男');var p2 = new CreatePerson("tugenhua",'27','女');console.log(p1.name); // longenconsole.log(p1.age);  // 28console.log(p1.sex);  // 男console.log(p1.sayName()); // longenconsole.log(p2.name);  // tugenhuaconsole.log(p2.age);   // 27console.log(p2.sex);   // 女console.log(p2.sayName()); // tugenhua
```

**单例模式**

只能被实例化 (构造函数给实例添加属性与方法) 一次

```
// 单体模式var Singleton = function(name){    this.name = name;};Singleton.prototype.getName = function(){    return this.name;}// 获取实例对象var getInstance = (function() {    var instance = null;    return function(name) {        if(!instance) {//相当于一个一次性阀门,只能实例化一次            instance = new Singleton(name);        }        return instance;    }})();// 测试单体模式的实例,所以a===bvar a = getInstance("aa");var b = getInstance("bb");
```

**沙箱模式**

将一些函数放到自执行函数里面, 但要用闭包暴露接口, 用变量接收暴露的接口, 再调用里面的值, 否则无法使用里面的值

```
let sandboxModel=(function(){    function sayName(){};    function sayAge(){};    return{        sayName:sayName,        sayAge:sayAge    }})()
```

**发布者订阅模式**

就例如如我们关注了某一个公众号, 然后他对应的有新的消息就会给你推送,

```
//发布者与订阅模式    var shoeObj = {}; // 定义发布者    shoeObj.list = []; // 缓存列表 存放订阅者回调函数    // 增加订阅者    shoeObj.listen = function(fn) {        shoeObj.list.push(fn); // 订阅消息添加到缓存列表    }    // 发布消息    shoeObj.trigger = function() {            for (var i = 0, fn; fn = this.list[i++];) {                fn.apply(this, arguments);//第一个参数只是改变fn的this,            }        }     // 小红订阅如下消息    shoeObj.listen(function(color, size) {        console.log("颜色是：" + color);        console.log("尺码是：" + size);    });    // 小花订阅如下消息    shoeObj.listen(function(color, size) {        console.log("再次打印颜色是：" + color);        console.log("再次打印尺码是：" + size);    });    shoeObj.trigger("红色", 40);    shoeObj.trigger("黑色", 42);
```

代码实现逻辑是用数组存贮订阅者, 发布者回调函数里面通知的方式是遍历订阅者数组, 并将发布者内容传入订阅者数组

### 4、列举出集中创建实例的方法

```
参考答案
```

1. 字面量

```
let obj={'name':'张三'}
```

2.Object 构造函数创建

```
let Obj=new Object()Obj.name='张三'
```

3. 使用工厂模式创建对象

```
function createPerson(name){ var o = new Object(); o.name = name; }; return o; }var person1 = createPerson('张三');
```

4. 使用构造函数创建对象

```
function Person(name){ this.name = name;}var person1 = new Person('张三');
```

### 5、简述一下前端事件流

```
参考答案
```

HTML 中与 javascript 交互是通过事件驱动来实现的，例如鼠标点击事件 onclick、页面的滚动事件 onscroll 等等，可以向文档或者文档中的元素添加事件侦听器来预订事件。想要知道这些事件是在什么时候进行调用的，就需要了解一下 “事件流” 的概念。

什么是事件流：事件流描述的是从页面中接收事件的顺序, DOM2 级事件流包括下面几个阶段。

*   事件捕获阶段
    
*   处于目标阶段
    
*   事件冒泡阶段
    

**addEventListener**：**addEventListener** 是 DOM2 级事件新增的指定事件处理程序的操作，这个方法接收 3 个参数：要处理的事件名、作为事件处理程序的函数和一个布尔值。最后这个布尔值参数如果是 true，表示在捕获阶段调用事件处理程序；如果是 false，表示在冒泡阶段调用事件处理程序。

**IE 只支持事件冒泡**。

### 6、`Function._proto_(getPrototypeOf)是什么？`

```
参考答案
```

获取一个对象的原型，在 chrome 中可以通过__proto__的形式，或者在 ES6 中可以通过 Object.getPrototypeOf 的形式。

那么 Function.proto 是什么么？也就是说 Function 由什么对象继承而来，我们来做如下判别。

```
Function.__proto__==Object.prototype //falseFunction.__proto__==Function.prototype//true
```

我们发现 Function 的原型也是 Function。

我们用图可以来明确这个关系：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/zHYsKHjf0nia6aibfMM6uibOQlicmWHhGpWq1eibXb14ukuG65iblmPtQBcTHz1z875IoCdE7hk8j14nSoxK4PYRlBvg/640?wx_fmt=png)

### 7、简述一下原型 / 构造函数 / 实例

```
参考答案
```

*   原型`(prototype)`: 一个简单的对象，用于实现对象的 **属性继承**。可以简单的理解成对象的爹。在 Firefox 和 Chrome 中，每个`JavaScript`对象中都包含一个`__proto__`(非标准) 的属性指向它爹 (该对象的原型)，可`obj.__proto__`进行访问。
    
*   构造函数: 可以通过`new`来 **新建一个对象**的函数。
    
*   实例: 通过构造函数和`new`创建出来的对象，便是实例。**实例通过__proto__指向原型，通过 constructor 指向构造函数**。
    

这里来举个栗子，以`Object`为例，我们常用的`Object`便是一个构造函数，因此我们可以通过它构建实例。

```
// 实例
const instance = new Object()
```

则此时， **实例为 instance**, **构造函数为 Object**，我们知道，构造函数拥有一个`prototype`的属性指向原型，因此原型为:

```
// 原型
const prototype = Object.prototype
```

这里我们可以来看出三者的关系:

```
实例.__proto__ === 原型原型.constructor === 构造函数构造函数.prototype === 原型// 这条线其实是是基于原型进行获取的，可以理解成一条基于原型的映射线// 例如: // const o = new Object()// o.constructor === Object   --> true// o.__proto__ = null;// o.constructor === Object   --> false实例.constructor === 构造函数
```

### 8、简述一下 JS 继承，并举例

```
参考答案
```

在 JS 中，继承通常指的便是 **原型链继承**，也就是通过指定原型，并可以通过原型链继承原型上的属性或者方法。

*   最优化: **圣杯模式**
    
    ```
    var inherit = (function(c,p){    var F = function(){};    return function(c,p){        F.prototype = p.prototype;        c.prototype = new F();        c.uber = p.prototype;        c.prototype.constructor = c;    }})();
    ```
    
*   使用 ES6 的语法糖 `class / extends`
    

### 9、函数柯里化

```
参考答案
```

在函数式编程中，函数是一等公民。那么函数柯里化是怎样的呢？

函数柯里化指的是将能够接收多个参数的函数转化为接收单一参数的函数，并且返回接收余下参数且返回结果的新函数的技术。

函数柯里化的主要作用和特点就是参数复用、提前返回和延迟执行。

在一个函数中，首先填充几个参数，然后再返回一个新的函数的技术，称为函数的柯里化。通常可用于在不侵入函数的前提下，为函数 **预置通用参数**，供多次重复调用。

```
const add = function add(x) {    return function (y) {        return x + y    }}const add1 = add(1)add1(2) === 3add1(20) === 21
```

### 10、说说 bind、call、apply 区别？

```
参考答案
```

`call` 和 `apply` 都是为了解决改变 `this` 的指向。作用都是相同的，只是传参的方式不同。

除了第一个参数外，`call` 可以接收一个参数列表，`apply` 只接受一个参数数组。

```
let a = {    value: 1}function getValue(name, age) {    console.log(name)    console.log(age)    console.log(this.value)}getValue.call(a, 'yck', '24')getValue.apply(a, ['yck', '24'])
```

`bind`和其他两个方法作用也是一致的，只是该方法会返回一个函数。并且我们可以通过 `bind`实现柯里化。

```
（下面是对这三个方法的扩展介绍）
```

**如何实现一个 bind 函数**

对于实现以下几个函数，可以从几个方面思考

*   不传入第一个参数，那么默认为 `window`
    
*   改变了 this 指向，让新的对象可以执行该函数。那么思路是否可以变成给新的对象添加一个函数，然后在执行完以后删除？
    

```
Function.prototype.myBind = function (context) {  if (typeof this !== 'function') {    throw new TypeError('Error')  }  var _this = this  var args = [...arguments].slice(1)  // 返回一个函数  return function F() {    // 因为返回了一个函数，我们可以 new F()，所以需要判断    if (this instanceof F) {      return new _this(...args, ...arguments)    }    return _this.apply(context, args.concat(...arguments))  }}
```

**如何实现一个 call 函数**

```
Function.prototype.myCall = function (context) {  var context = context || window  // 给 context 添加一个属性  // getValue.call(a, 'yck', '24') => a.fn = getValue  context.fn = this  // 将 context 后面的参数取出来  var args = [...arguments].slice(1)  // getValue.call(a, 'yck', '24') => a.fn('yck', '24')  var result = context.fn(...args)  // 删除 fn  delete context.fn  return result}
```

**如何实现一个 apply 函数**

```
Function.prototype.myApply = function (context) {  var context = context || window  context.fn = this  var result  // 需要判断是否存储第二个参数  // 如果存在，就将第二个参数展开  if (arguments[1]) {    result = context.fn(...arguments[1])  } else {    result = context.fn()  }  delete context.fn  return result}
```

### 11、箭头函数的特点

```
参考答案function a() {    return () => {        return () => {            console.log(this)        }    }}console.log(a()()())
```

箭头函数其实是没有 `this`的，这个函数中的 `this`只取决于他外面的第一个不是箭头函数的函数的 `this`。在这个例子中，因为调用 `a`符合前面代码中的第一个情况，所以 `this`是 `window`。并且 `this`一旦绑定了上下文，就不会被任何代码改变。

程序阅读题
-----

### 1、下面程序输出的结果是什么？

```
function sayHi() {  console.log(name);  console.log(age);  var name = "Lydia";  let age = 21;}sayHi();
```

*   A: `Lydia` 和 `undefined`
    
*   B: `Lydia` 和 `ReferenceError`
    
*   C: `ReferenceError` 和 `21`
    
*   D: `undefined` 和 `ReferenceError`
    

```
参考答案
```

在函数中，我们首先使用`var`关键字声明了`name`变量。这意味着变量在创建阶段会被提升（`JavaScript`会在创建变量创建阶段为其分配内存空间），默认值为`undefined`，直到我们实际执行到使用该变量的行。我们还没有为`name`变量赋值，所以它仍然保持`undefined`的值。

使用`let`关键字（和`const`）声明的变量也会存在变量提升，但与`var`不同，初始化没有被提升。在我们声明（初始化）它们之前，它们是不可访问的。这被称为 “暂时死区”。当我们在声明变量之前尝试访问变量时，`JavaScript`会抛出一个`ReferenceError`。

关于`let`的是否存在变量提升，我们何以用下面的例子来验证：

```
let name = 'ConardLi'{  console.log(name) // Uncaught ReferenceError: name is not defined  let name = 'code秘密花园'}
```

`let`变量如果不存在变量提升，`console.log(name)`就会输出`ConardLi`，结果却抛出了`ReferenceError`，那么这很好的说明了，`let`也存在变量提升，但是它存在一个 “暂时死区”，在变量未初始化或赋值前不允许访问。

变量的赋值可以分为三个阶段：

*   创建变量，在内存中开辟空间
    
*   初始化变量，将变量初始化为`undefined`
    
*   真正赋值
    

关于`let`、`var`和`function`：

*   `let`的「创建」过程被提升了，但是初始化没有提升。
    
*   `var`的「创建」和「初始化」都被提升了。
    
*   `function`的「创建」「初始化」和「赋值」都被提升了。
    

### 2、下面代码输出什么

```
var a = 10;(function () {    console.log(a)    a = 5    console.log(window.a)    var a = 20;    console.log(a)})()
```

依次输出：undefined -> 10 -> 20

```
在立即执行函数中，var a = 20; 语句定义了一个局部变量 a，由于js的变量声明提升机制，局部变量a的声明会被提升至立即执行函数的函数体最上方，且由于这样的提升并不包括赋值，因此第一条打印语句会打印undefined，最后一条语句会打印20。

由于变量声明提升，a = 5; 这条语句执行时，局部的变量a已经声明，因此它产生的效果是对局部的变量a赋值，此时window.a 依旧是最开始赋值的10，
```

### 3、下面的输出结果是什么？

```
class Chameleon {  static colorChange(newColor) {    this.newColor = newColor;  }  constructor({ newColor = "green" } = {}) {    this.newColor = newColor;  }}const freddie = new Chameleon({ newColor: "purple" });freddie.colorChange("orange");
```

*   A: `orange`
    
*   B: `purple`
    
*   C: `green`
    
*   D: `TypeError`
    

答案: D

`colorChange`方法是静态的。静态方法仅在创建它们的构造函数中存在，并且不能传递给任何子级。由于`freddie`是一个子级对象，函数不会传递，所以在`freddie`实例上不存在`freddie`方法：抛出`TypeError`。

### 4、下面代码中什么时候会输出 1？

```
var a = ?;if(a == 1 && a == 2 && a == 3){     conso.log(1);}参考答案
```

> 因为 == 会进行隐式类型转换 所以我们重写 toString 方法就可以了

```
var a = {  i: 1,  toString() {    return a.i++;  }}if( a == 1 && a == 2 && a == 3 ) {  console.log(1);}
```

#### 5、下面的输出结果是什么？

```
var obj = {    '2': 3,    '3': 4,    'length': 2,    'splice': Array.prototype.splice,    'push': Array.prototype.push}obj.push(1)obj.push(2)console.log(obj)参考答案
```

1. 使用第一次 push，obj 对象的 push 方法设置 `obj[2]=1;obj.length+=1`2. 使用第二次 push，obj 对象的 push 方法设置 `obj[3]=2;obj.length+=1`3. 使用 console.log 输出的时候，因为 obj 具有 length 属性和 splice 方法，故将其作为数组进行打印 4. 打印时因为数组未设置下标为 0 1 处的值，故打印为 empty，主动 obj[0] 获取为 undefined

![](https://mmbiz.qpic.cn/sz_mmbiz_png/zHYsKHjf0nia6aibfMM6uibOQlicmWHhGpWqEia8c7ehMfcYCtt7FGnbv2iaMJ8CviaiadtaCc39ianspCfhenvQDPhNFmw/640?wx_fmt=png)

### 6、下面代码输出的结果是什么？

```
var a = {n: 1};
var b = a;
a.x = a = {n: 2};

console.log(a.x)     
console.log(b.x)
参考答案
```

undefined {n:2}

首先，a 和 b 同时引用了 {n:2} 对象，接着执行到 a.x = a = {n：2}语句，尽管赋值是从右到左的没错，但是. 的优先级比 = 要高，所以这里首先执行 a.x，相当于为 a（或者 b）所指向的 {n:1} 对象新增了一个属性 x，即此时对象将变为 {n:1;x:undefined}。之后按正常情况，从右到左进行赋值，此时执行 a ={n:2} 的时候，a 的引用改变，指向了新对象 {n：2}, 而 b 依然指向的是旧对象。之后执行 a.x = {n：2} 的时候，并不会重新解析一遍 a，而是沿用最初解析 a.x 时候的 a，也即旧对象，故此时旧对象的 x 的值为{n：2}，旧对象为 {n:1;x:{n：2}}，它被 b 引用着。后面输出 a.x 的时候，又要解析 a 了，此时的 a 是指向新对象的 a，而这个新对象是没有 x 属性的，故访问时输出 undefined；而访问 b.x 的时候，将输出旧对象的 x 的值，即{n:2}。

### 7、下面代码的输出是什么?

```
function checkAge(data) {  if (data === { age: 18 }) {    console.log("You are an adult!");  } else if (data == { age: 18 }) {    console.log("You are still an adult.");  } else {    console.log(`Hmm.. You don't have an age I guess`);  }}checkAge({ age: 18 });参考答案
```

> Hmm.. You don't have an age I guess

在比较相等性，原始类型通过它们的值进行比较，而对象通过它们的引用进行比较。`JavaScript`检查对象是否具有对内存中相同位置的引用。

我们作为参数传递的对象和我们用于检查相等性的对象在内存中位于不同位置，所以它们的引用是不同的。

这就是为什么`{ age: 18 } === { age: 18 }`和 `{ age: 18 } == { age: 18 }`返回 `false`的原因。

### 8、下面代码的输出是什么?

```
const obj = { 1: "a", 2: "b", 3: "c" };const set = new Set([1, 2, 3, 4, 5]);obj.hasOwnProperty("1");obj.hasOwnProperty(1);set.has("1");set.has(1);参考答案
```

> ```
> true` `true` `false` `true
> ```

所有对象键（不包括`Symbols`）都会被存储为字符串，即使你没有给定字符串类型的键。这就是为什么`obj.hasOwnProperty（'1'）`也返回`true`。

上面的说法不适用于`Set`。在我们的`Set`中没有`“1”`：`set.has（'1'）`返回`false`。它有数字类型`1`，`set.has（1）`返回`true`。

### 9、下面代码的输出是什么?

```
// example 1var a={}, b='123', c=123;  a[b]='b';a[c]='c';  console.log(a[b]);---------------------// example 2var a={}, b=Symbol('123'), c=Symbol('123');  a[b]='b';a[c]='c';  console.log(a[b]);---------------------// example 3var a={}, b={key:'123'}, c={key:'456'};  a[b]='b';a[c]='c';  console.log(a[b]);参考答案
```

这题考察的是对象的键名的转换。

*   对象的键名只能是字符串和 Symbol 类型。
    
*   其他类型的键名会被转换成字符串类型。
    
*   对象转字符串默认会调用 toString 方法。
    

```
// example 1var a={}, b='123', c=123;a[b]='b';// c 的键名会被转换成字符串'123'，这里会把 b 覆盖掉。a[c]='c';  // 输出 cconsole.log(a[b]);// example 2var a={}, b=Symbol('123'), c=Symbol('123');  // b 是 Symbol 类型，不需要转换。a[b]='b';// c 是 Symbol 类型，不需要转换。任何一个 Symbol 类型的值都是不相等的，所以不会覆盖掉 b。a[c]='c';// 输出 bconsole.log(a[b]);// example 3var a={}, b={key:'123'}, c={key:'456'};  // b 不是字符串也不是 Symbol 类型，需要转换成字符串。// 对象类型会调用 toString 方法转换成字符串 [object Object]。a[b]='b';// c 不是字符串也不是 Symbol 类型，需要转换成字符串。// 对象类型会调用 toString 方法转换成字符串 [object Object]。这里会把 b 覆盖掉。a[c]='c';  // 输出 cconsole.log(a[b]);
```

### 10、下面代码的输出是什么?

```
(() => {  let x, y;  try {    throw new Error();  } catch (x) {    (x = 1), (y = 2);    console.log(x);  }  console.log(x);  console.log(y);})();参考答案
```

> ```
> 1` `undefined` `2
> ```

`catch`块接收参数`x`。当我们传递参数时，这与变量的`x`不同。这个变量`x`是属于`catch`作用域的。

之后，我们将这个块级作用域的变量设置为`1`，并设置变量`y`的值。现在，我们打印块级作用域的变量`x`，它等于`1`。

在`catch`块之外，`x`仍然是`undefined`，而`y`是`2`。当我们想在`catch`块之外的`console.log(x)`时，它返回`undefined`，而`y`返回`2`。

### 11、下面代码的输出结果是什么？

```
function Foo() {    Foo.a = function() {        console.log(1)    }    this.a = function() {        console.log(2)    }}Foo.prototype.a = function() {    console.log(3)}Foo.a = function() {    console.log(4)}Foo.a();let obj = new Foo();obj.a();Foo.a();参考答案
```

> 输出顺序是 4 2 1

```
function Foo() {    Foo.a = function() {        console.log(1)    }    this.a = function() {        console.log(2)    }}// 以上只是 Foo 的构建方法，没有产生实例，此刻也没有执行Foo.prototype.a = function() {    console.log(3)}// 现在在 Foo 上挂载了原型方法 a ，方法输出值为 3Foo.a = function() {    console.log(4)}// 现在在 Foo 上挂载了直接方法 a ，输出值为 4Foo.a();// 立刻执行了 Foo 上的 a 方法，也就是刚刚定义的，所以// # 输出 4let obj = new Foo();/* 这里调用了 Foo 的构建方法。Foo 的构建方法主要做了两件事：1. 将全局的 Foo 上的直接方法 a 替换为一个输出 1 的方法。2. 在新对象上挂载直接方法 a ，输出值为 2。*/obj.a();// 因为有直接方法 a ，不需要去访问原型链，所以使用的是构建方法里所定义的 this.a，// # 输出 2Foo.a();// 构建方法里已经替换了全局 Foo 上的 a 方法，所以// # 输出 1
```

end

最后

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwsicQDIDxzNjf7l5letSvniaMFeqkIQ8maDMubVSicdtaKIRRNra3EggM4PYXQMXWI95uOm0YBgpICdA/640?wx_fmt=jpeg)

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)