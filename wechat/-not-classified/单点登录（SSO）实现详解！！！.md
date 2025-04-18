> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_8s_4hmfafv6MFypeE97TA)

### 普通登录

提到单点登录，首先可以想到传统登录，通过登录页面根据用户名查询用户信息，判断密码是否正确，正确则将用户信息写到session，访问的时候通过从session中获取用户信息，判断是否已登录，登录则允许访问。

### 普通登录的缺点

由于session不能共享，服务越来越多，并且还服务还搭建集群，导致每访问另外一个服务都需要重新登录。

**单点登录**

单点登录有个简称是sso，它是一个功能可以控制多个有联系的系统操作，简单地理解为通过单点登录可以让用户只需要登录一次软件或者系统，那么同系统下的平台都可以免去再次注册、验证、访问权限的麻烦程序，通俗易懂的理解为一次性登录也可以一次性下线。

**前端需要知道的单点登录概述：**

1、一个系统登录流程：用户进入系统——未登录——跳转登录界面——用户名和密码发送——服务器端验证后，设置一个cookie发送到浏览器，设置一个session存放在服务器——用户再次请求（带上cookie）——服务器验证cookie和session匹配后，就可以进行业务了。

2、多个系统登录：如果一个大公司有很多系统，a.seafile.com, b.seafile.com,c.seafile.com。这些系统都需要登录，如果用户在不同系统间登录需要多次输入密码，用户体验很不好。所以使用 SSO (single sign on) 单点登录实现。

3、相同域名，不同子域名下的单点登录：在浏览器端，根据同源策略，不同子域名的cookie不能共享。所以设置SSO的域名为根域名。SSO登录验证后，子域名可以访问根域名的 cookie，即可完成校验。在服务器端，可以设置多个子域名session共享（Spring-session）

4、不同域名下的单点登录：CAS流程：用户登录子系统时未登录，跳转到 SSO 登录界面，成功登录后，SSO 生成一个 ST （service ticket ）。用户登录不同的域名时，都会跳转到 SSO，然后 SSO 带着 ST 返回到不同的子域名，子域名中发出请求验证 ST 的正确性（防止篡改请求）。验证通过后即可完成不同的业务。

单点登录需求
------

在项目初期，公司中使用的系统很少，通常一个或者两个，每个系统都有自己的登录系统，用户用自己的账号登录，很方便。

但随着公司的不断发展，用到的系统随之增多，用户在操作不同的系统时，需要多次登录，而且每个系统的账号都不一样，这对于用户来说，是很不好的体验。于是，就想到是不是可以在一个系统登录，其他系统就不用登录了呢？这就是单点登录要解决的问题。

单点登录英文全称Single Sign On，简称就是SSO。它的解释是：在多个应用系统中，只需要登录一次，就可以访问其他相互信任的应用系统。

单点登录（Single Sign On），简称为 SSO，是比较流行的企业业务整合的解决方案之一。SSO的定义是在多个应用系统中，用户只需要登录一次就可以访问所有相互信任的应用系统。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E) 如图所示，图中有4个系统，分别是Application1、Application2、Application3、和SSO。Application1、Application2、Application3没有登录模块，而SSO只有登录模块，没有其他的业务模块，当Application1、Application2、Application3需要登录时，将跳到SSO系统，SSO系统完成登录，其他的应用系统也就随之登录了。这完全符合我们对单点登录（SSO）的定义。

### SSO 机制实现流程

用户首次访问时，需要在认证中心登录：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

1.  用户访问网站 a.com 下的 pageA 页面。
    
2.  由于没有登录，则会重定向到认证中心，并带上回调地址 （http://www.sso.com?return_uri=a.com/pageA%EF%BC%8C%E4%BB%A5%E4%BE%BF%E7%99%BB%E5%BD%95%E5%90%8E%E7%9B%B4%E6%8E%A5%E8%BF%9B%E5%85%A5%E5%AF%B9%E5%BA%94%E9%A1%B5%E9%9D%A2%E3%80%82 ）
    
3.  用户在认证中心输入账号密码，提交登录。
    
4.  认证中心验证账号密码有效，然后重定向 a.com?ticket=123 带上授权码 ticket，并将认证中心 sso.com 的登录态写入 Cookie。
    
5.  在 a.com 服务器中，拿着 ticket 向认证中心确认，授权码 ticket 真实有效。
    
6.  验证成功后，服务器将登录信息写入 Cookie（此时客户端有 2 个 Cookie 分别存有 a.com 和 sso.com 的登录台）。
    

认证中心登录完成之后，继续访问 `a.com` 下的其他页面：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

这个时候，由于 `a.com` 存在已登录的 `Cookie` 信息，所以服务器端直接认证成功。

##### 如果认证中心登录完成之后，访问 `b.com` 下的页面：

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

这个时候，由于认证中心存在之前登录过的 `Cookie`，所以也不用再次输入账号密码，直接返回第 4 步，下发 `ticket` 给 `b.com` 即可。

### SSO 机制实现方式

单点登录主要有三种实现方式：

1.  父域 Cookie
    
2.  认证中心
    
3.  LocalStorage 跨域
    

一般情况下，用户的登录状态是记录在 Session 中的，要实现共享登录状态，就要先共享 Session，但是由于不同的应用系统有着不同的域名，尽管 Session 共享了，但是由于 SessionId 是往往保存在浏览器 Cookie 中的，因此存在作用域的限制，无法跨域名传递，也就是说当用户在 a.com 中登录后，Session Id 仅在浏览器访问 a.com 时才会自动在请求头中携带，而当浏览器访问 b.com 时，Session Id 是不会被带过去的。实现单点登录的关键在于，如何让 Session Id（或 Token）在多个域中共享。

**1. 父域 Cookie**

Cookie 的作用域由 domain 属性和 path 属性共同决定。domain 属性的有效值为当前域或其父域的域名/IP地址，在 Tomcat 中，domain 属性默认为当前域的域名/IP地址。path 属性的有效值是以“/”开头的路径，在 Tomcat 中，path 属性默认为当前 Web 应用的上下文路径。

如果将 Cookie 的 domain 属性设置为当前域的父域，那么就认为它是父域 Cookie。Cookie 有一个特点，即父域中的 Cookie 被子域所共享，也就是说，子域会自动继承父域中的 Cookie。

利用 Cookie 的这个特点，可以将 Session Id（或 Token）保存到父域中就可以了。我们只需要将 Cookie 的 domain 属性设置为父域的域名（主域名），同时将 Cookie 的 path 属性设置为根路径，这样所有的子域应用就都可以访问到这个 Cookie 了。不过这要求应用系统的域名需建立在一个共同的主域名之下，如 tieba.baidu.com 和 map.baidu.com，它们都建立在 baidu.com 这个主域名之下，那么它们就可以通过这种方式来实现单点登录。

**总结：此种实现方式比较简单，但不支持跨主域名。**

**2. 认证中心**

我们可以部署一个认证中心，认证中心就是一个专门负责处理登录请求的独立的 Web 服务。

用户统一在认证中心进行登录，登录成功后，认证中心记录用户的登录状态，并将 Token 写入 Cookie。（注意这个 Cookie 是认证中心的，应用系统是访问不到的）

应用系统检查当前请求有没有 Token，如果没有，说明用户在当前系统中尚未登录，那么就将页面跳转至认证中心进行登录。由于这个操作会将认证中心的 Cookie 自动带过去，因此，认证中心能够根据 Cookie 知道用户是否已经登录过了。如果认证中心发现用户尚未登录，则返回登录页面，等待用户登录，如果发现用户已经登录过了，就不会让用户再次登录了，而是会跳转回目标 URL ，并在跳转前生成一个 Token，拼接在目标 URL 的后面，回传给目标应用系统。

应用系统拿到 Token 之后，还需要向认证中心确认下 Token 的合法性，防止用户伪造。确认无误后，应用系统记录用户的登录状态，并将 Token 写入 Cookie，然后给本次访问放行。（这个 Cookie 是当前应用系统的，其他应用系统是访问不到的）当用户再次访问当前应用系统时，就会自动带上这个 Token，应用系统验证 Token 发现用户已登录，于是就不会有认证中心什么事了。

**总结：此种实现方式相对复杂，支持跨域，扩展性好，是单点登录的标准做法。**

**3. LocalStorage 跨域**

单点登录的关键在于，如何让 Session Id（或 Token）在多个域中共享。但是 Cookie 是不支持跨主域名的，而且浏览器对 Cookie 的跨域限制越来越严格。

在前后端分离的情况下，完全可以不使用 Cookie，我们可以选择将 Session Id （或 Token ）保存到浏览器的 LocalStorage 中，让前端在每次向后端发送请求时，主动将 LocalStorage 的数据传递给服务端。这些都是由前端来控制的，后端需要做的仅仅是在用户登录成功后，将 Session Id （或 Token ）放在响应体中传递给前端。

在这样的场景下，单点登录完全可以在前端实现。前端拿到 Session Id （或 Token ）后，除了将它写入自己的 LocalStorage 中之外，还可以通过特殊手段将它写入多个其他域下的 LocalStorage 中。

**总结：此种实现方式完全由前端控制，几乎不需要后端参与，同样支持跨域**。

SSO 单点登录退出
----------

目前我们已经完成了单点登录，在同一套认证中心的管理下，多个产品可以共享登录态。现在我们需要考虑退出了，即：在一个产品中退出了登录，怎么让其他的产品也都退出登录？

原理其实不难，可以在每一个产品在向认证中心验证 ticket(token) 时，其实可以顺带将自己的退出登录 api 发送到认证中心。

**当某个产品 c.com 退出登录时：**

清空 c.com 中的登录态 Cookie。请求认证中心 sso.com 中的退出 api。认证中心遍历下发过 ticket(token) 的所有产品，并调用对应的退出 api，完成退出。

> 作者：爱吃橘子的程序猿  https://juejin.cn/post/7282692430117748755