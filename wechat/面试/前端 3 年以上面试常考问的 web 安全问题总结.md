> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/nggTmZXxEDV--3EZ1nByeA)

大厂技术  高级前端  Node 进阶  

======================

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

大家好，今天给大家介绍一下，Web 安全领域常见的一些安全问题。  

1、SQL 注入
--------

SQL 注入攻击的核心在于让 Web 服务器执行攻击者期望的 SQL 语句，以便得到数据库中的感兴趣的数据或对数据库进行读取、修改、删除、插入等操作，达到其邪恶的目的。

而如何让 Web 服务器执行攻击者的 SQL 语句呢？SQL 注入的常规套路在于将 SQL 语句放置于 Form 表单或请求参数之中提交到后端服务器，后端服务器如果未做输入安全校验，直接将变量取出进行数据库查询，则极易中招。

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNBpibekvnbU45JOkH4icDyeCfEY5Gro0NIcE8sxm6kVW1Nbtib6Nrzic0og/640?wx_fmt=png)

举例如下：

对于一个根据用户 ID 获取用户信息的接口，后端的 SQL 语句一般是这样：

```
select name,[...] from t_user whereid=$id
```

其中，$id 就是前端提交的用户 id，而如果前端的请求是这样：

```
GET xx/userinfo?id=1%20or%201=1
```

其中请求参数 id 转义后就是 1 or 1=1，如果后端不做安全过滤直接提交数据库查询，SQL 语句就变成了：

```
select name,[...] from t_user whereid=1or1=1
```

其结果是把用户表中的所有数据全部查出，达到了黑客泄露数据的目的。

以上只是一个极简单的示例，在真实的 SQL 注入攻击中参数构造和 SQL 语句远比这复杂得多，不过原理是一致的。

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNDhdZaCFSicvHa9v3nW1GFnFI2uzfrcalXMv2bnHNRCLcbmOHlUSMYBw/640?wx_fmt=png)

2、XSS 攻击
--------

XSS 全称跨站脚本攻击（Cross Site Scripting），为了与重叠样式表 CSS 区分，换了另一个缩写 XSS。

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNEBB19AJt6VkdKQrx74wic4bF9mQeVJvcc3jDq7ia9MJ2C4dydeOnKH6A/640?wx_fmt=png)

XSS 攻击的核心是将可执行的前端脚本代码（一般为 JavaScript）植入到网页中，听起来比较拗口，用大白话说就是攻击者想让你的浏览器执行他写的 JS 代码。那如何办到呢？一般 XSS 分为两种：

###### 反射型

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNMGJ2DBag1yics48KEXx87rEOwA1Qv5wGAea3fMu1rAQFH0AVY0DLibrw/640?wx_fmt=png)

*   1、攻击者将 JS 代码作为请求参数放置 URL 中，诱导用户点击
    

示例：

```
http://localhost:8080/test?you are under attack!")</script>
```

*   2、用户点击后，该 JS 作为请求参数传给 Web 服务器后端
    
*   3、后端服务器没有检查过滤，简单处理后放入网页正文中返回给浏览器
    
*   4、浏览器解析返回的网页，中招！
    

###### 存储型

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNOibu8Dgmeibshmb85J0cOtrSYsrgJw2ibz4YLbXDLTM10kueTWiahTg4UA/640?wx_fmt=png)

上述方式攻击脚本直接经服务器转手后返回浏览器触发执行，存储型与之的区别在于能够将攻击脚本入库存储，在后面进行查询时，再将攻击脚本渲染进网页，返回给浏览器触发执行。常见的套路举例如下：

*   1、攻击者网页回帖，帖子中包含 JS 脚本
    
*   2、回帖提交服务器后，存储至数据库
    
*   3、其他网友查看帖子，后台查询该帖子的回帖内容，构建完整网页，返回浏览器
    
*   4、该网友浏览器渲染返回的网页，中招！
    

3、CSRF 攻击
---------

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNP5UKtFF5rGDKHmo9FXuHILsAqqQYyVx8oOSfLWomrckafxthOFPQWA/640?wx_fmt=png)

CSRF，跨站请求伪造，其核心思想在于，在打开 A 网站的情况下，另开 Tab 页面打开恶意网站 B，此时在 B 页面的 “唆使” 下，浏览器发起一个对网站 A 的 HTTP 请求。这个过程的危害在于 2 点：

*   1、这个 HTTP 请求不是用户主动意图，而是 B“唆使的”，如果是一个危害较大的请求操作（发邮件？删数据？等等）那就麻烦了
    
*   2、因为之前 A 网站已经打开了，浏览器存有 A 下发的 Cookie 或其他用于身份认证的信息，这一次被 “唆使” 的请求，将会自动带上这些信息，A 网站后端分不清楚这是否是用户真实的意愿
    

4、DDoS 攻击
---------

DDoS 全称 Distributed Denial of Service：分布式拒绝服务攻击 (在这个文章里也有介绍：)。是拒绝服务攻击的升级版。拒绝攻击服务顾名思义，让服务不可用。常用于攻击对外提供服务的服务器，像常见的：

*   Web 服务
    
*   邮件服务
    
*   DNS 服务
    
*   即时通讯服务
    
*   ......
    

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNRFAjszdNGDTjiaDsVeuxZLFgugUzhPo1BlwfibtqvianNkl6hOP9E9mPQ/640?wx_fmt=png)

攻击者不断地提出服务请求，让合法用户的请求无法及时处理，这就是 DoS 攻击。

攻击者使用多台计算机或者计算机集群进行 DoS 攻击，就是 DDoS 攻击。

在早期互联网技术还没有那么发达的时候，发起 DoS 攻击是一件很容易的事情：一台性能强劲的计算机，写个程序多线程不断向服务器进行请求，服务器应接不暇，最终无法处理正常的请求，对别的正常用户来说，看上去网站貌似无法访问，拒绝服务就是这么个意思。

后来随着技术对发展，现在的服务器早已不是一台服务器那么简单，你访问一个 www.baidu.com 的域名，背后是数不清的 CDN 节点，数不清的 Web 服务器。

这种情况下，还想靠单台计算机去试图让一个网络服务满载，无异于鸡蛋碰石头，对方没趴下，自己先趴下了。

技术从来都是一柄双刃剑，分布式技术既可以用来提供高可用的服务，也能够被攻击方用来进行大规模杀伤性攻击。攻击者不再局限于单台计算机的攻击能力，转而通过成规模的网络集群发起拒绝服务攻击。

5、DNS 劫持
--------

当今互联网流量中，以 HTTP／HTTPS 为主的 Web 服务产生的流量占据了绝大部分。Web 服务发展的如火如荼，这背后离不开一个默默无闻的大功臣就是域名解析系统：

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicN5YV73YDyzLibiakJBCJ0Q7bPQ8icbAejbI2RAHj4W9zKUqtDMBL4DH8rA/640?wx_fmt=png)

如果没有 DNS，我们上网需要记忆每个网站的 IP 地址而不是他们的域名，这简直是灾难，好在 DNS 默默在背后做了这一切，我们只需要记住一个域名，剩下的交给 DNS 来完成吧。

也正是因为其重要性，别有用心的人自然是不会放过它，DNS 劫持技术被发明了出来。

DNS 提供服务用来将域名转换成 IP 地址，然而在早期协议的设计中并没有太多考虑其安全性，对于查询方来说：

*   我去请求的真的是一个 DNS 服务器吗？是不是别人冒充的？
    
*   查询的结果有没有被人篡改过？这个 IP 真是这个网站的吗？
    

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNibeBElbAqx9X06OjuPdLD2SjxJ9DqdLWmzMZIrGjpRZTvI2Pc02laFg/640?wx_fmt=png)

DNS 协议中没有机制去保证能回答这些问题，因此 DNS 劫持现象非常泛滥，从用户在地址栏输入一个域名的那一刻起，一路上的凶险防不胜防：

*   本地计算机中的木马修改 hosts 文件
    
*   本地计算机中的木马修改 DNS 数据包中的应答
    
*   网络中的节点（如路由器）修改 DNS 数据包中的应答
    
*   网络中的节点（如运营商）修改 DNS 数据包中的应答
    
*   ......
    

![](https://mmbiz.qpic.cn/mmbiz_png/tuSaKc6SfPqYRNXg1QunqbaNCBRleyicNrgA9nwdq30DR4vOia21nUFZ73hCRwica3GS5XOTiaVotxGQ8Cmmmq02qA/640?wx_fmt=png)

后来，为了在客户端对收到对 DNS 应答进行校验，出现了 DNSSEC 技术，一定程度上可以解决上面的部分问题。但限于一些方面的原因，这项技术并没有大规模用起来，尤其在国内，鲜有部署应用。

再后来，以阿里、腾讯等头部互联网厂商开始推出了 httpDNS 服务，来了一招釜底抽薪，虽然这项技术的名字中还有 DNS 三个字母，但实现上和原来但 DNS 已经是天差地别，通过这项技术让 DNS 变成了在 http 协议之上的一个应用服务。

6、JSON 劫持
---------

JSON 是一种轻量级的数据交换格式，而劫持就是对数据进行窃取（或者应该称为打劫、拦截比较合适。恶意攻击者通过某些特定的手段，将本应该返回给用户的 JSON 数据进行拦截，转而将数据发送回给恶意攻击者，这就是 JSON 劫持的大概含义。一般来说进行劫持的 JSON 数据都是包含敏感信息或者有价值的数据。

7、暴力破解
------

这个一般针对密码而言，弱密码（Weak Password）很容易被别人（对你很了解的人等）猜到或被破解工具暴力破解。

解决方案 密码复杂度要足够大，也要足够隐蔽 限制尝试次数

8.、HTTP 报头追踪漏洞
--------------

HTTP/1.1（RFC2616）规范定义了 HTTP TRACE 方法，主要是用于客户端通过向 Web 服务器提交 TRACE 请求来进行测试或获得诊断信息。

当 Web 服务器启用 TRACE 时，提交的请求头会在服务器响应的内容（Body）中完整的返回，其中 HTTP 头很可能包括 Session Token、Cookies 或其它认证信息。攻击者可以利用此漏洞来欺骗合法用户并得到他们的私人信息。

###### 解决方案:

禁用 HTTP TRACE 方法。

9、信息泄露
------

由于 Web 服务器或应用程序没有正确处理一些特殊请求，泄露 Web 服务器的一些敏感信息，如用户名、密码、源代码、服务器信息、配置信息等。

所以一般需注意：

应用程序报错时，不对外产生调试信息 过滤用户提交的数据与特殊字符 保证源代码、服务器配置的安全

10、目录遍历漏洞
---------

攻击者向 Web 服务器发送请求，通过在 URL 中或在有特殊意义的目录中附加 ../、或者附加 ../ 的一些变形（如 .. 或 ..// 甚至其编码），导致攻击者能够访问未授权的目录，以及在 Web 服务器的根目录以外执行命令。

11、命令执行漏洞
---------

命令执行漏洞是通过 URL 发起请求，在 Web 服务器端执行未授权的命令，获取系统信息、篡改系统配置、控制整个系统、使系统瘫痪等。

12、文件上传漏洞
---------

如果对文件上传路径变量过滤不严，并且对用户上传的文件后缀以及文件类型限制不严，攻击者可通过 Web 访问的目录上传任意文件，包括网站后门文件（webshell），进而远程控制网站服务器。

所以一般需注意：

在开发网站及应用程序过程中，需严格限制和校验上传的文件，禁止上传恶意代码的文件 限制相关目录的执行权限，防范 webshell 攻击

13、其他漏洞
-------

*   SSLStrip 攻击
    
*   OpenSSL Heartbleed 安全漏洞
    
*   CCS 注入漏洞
    
*   证书有效性验证漏洞
    

14、业务漏洞
-------

一般业务漏洞是跟具体的应用程序相关，比如参数篡改（连续编号 ID / 订单、1 元支付）、重放攻击（伪装支付）、权限控制（越权操作）等。

15、框架或应用漏洞
----------

*   WordPress 4.7 / 4.7.1：REST API 内容注入漏洞
    
*   Drupal Module RESTWS 7.x：Remote PHP Code Execution
    
*   SugarCRM 6.5.23：REST PHP Object Injection Exploit
    
*   Apache Struts：REST Plugin With Dynamic Method Invocation Remote Code Execution
    
*   Oracle GlassFish Server：REST CSRF
    
*   QQ Browser 9.6：API 权限控制问题导致泄露隐私模式
    
*   Hacking Docker：Registry API 未授权访问
    

> _作者：senntyou_
> 
> _segmentfault.com/a/1190000018004657_

```
Node 社群





我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。




   “分享、点赞、在看” 支持一波👍

```