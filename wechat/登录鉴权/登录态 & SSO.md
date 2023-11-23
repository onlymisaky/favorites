> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_B_4YbKEsjNUd_hGDGHFAA)

大厂技术  坚持周更  精选好文
================

1 背景  

-------

前一段时间，参与了老项目的迁移工作，配合后端接口迁移时，由于两个项目采取了不一样的登陆方案，所以遇到了跨域登录态无法共享的问题。经过各方协调，最终老项目将迁移页面部署在新项目的指定网关下，并且使用新项目的 SSO 登录方案。由迁移中遇到的登陆态共享问题，引发了我对 SSO 的思考与学习。如果发现文章中有什么错误之处，请及时指正～🙈

2 登录态维护方式
---------

### 2.1 JWT（Json Web Token）

#### 2.1.1 是什么？

JWT 是一个开放的 JSON 格式 token 存储标准。它定义了一种安全、紧凑的方式来保存数据，通过签名的方式来校验 token 的合法性，主要支持的签名算法如 HMAC、RSA、ECDSA。

通常使用它来保存登录信息，相比传统的 session 方案，它的优点在于服务端无需维护登录态，不再需要依赖第三方存储（如 redis、memcached），所以说 JWT 是无状态的。

但它也存在缺点。由于它只在客户端维护，因此服务端无法方便的清除登录态，相比传统的 session 方案，只需要将 session 清除即可。你可能会说，可以直接将这个 token 删除就算退出登录了。但实际上这只是一种假注销，若该用户再次拿到相同的 token 还是会被认为是登录的。

#### 2.1.2 数据结构

实际上 JWT 是由`header（头部）`、`payload（负载）`、`signature（签名）`这三个部分组成的，中间用`.`来分隔开，写成一行就是这个样子的：`Header.Payload.Signature`。

*   Header: 该部分是一个 JSON 对象，描述 JWT 的元数据，通常是下面的样子。
    

```
{  "alg": "HS256",  // 表示签名的算法（algorithm），默认是 HMAC SHA256（写成 HS256）  "typ": "JWT"     // 表示这个令牌（token）的类型（type），JWT 令牌默认统一写为 JWT}
```

*   Playload：该部分也是一个 JSON 对象，用来存放实际需要传递的数据。JWT 规定了 7 个官方字段，供选用。除了官方的字段，还可以自定义一些其他字段。
    

```
iss (issuer)：签发人

exp (expiration time)：过期时间

sub (subject)：主题

aud (audience)：受众

nbf (Not Before)：生效时间

iat (Issued At)：签发时间

jti (JWT ID)：编号
```

⚠️ JWT 默认是不加密的，任何人都可以读到，所以不要把秘密信息放在这个部分。这个 JSON 对象也要使用 Base64URL 算法转成字符串。

*   Signature ：该部分是对前两部分的签名，防止数据篡改。首先，需要指定一个密钥（secret）。这个密钥只有服务器才知道，不能泄露给用户。然后，使用 Header 里面指定的签名算法（默认是 HMAC SHA256），按照下面的公式产生签名。服务器收到 JWT 后通过对比签名来确定 Token 是否被修改。
    

```
HMACSHA256(  base64UrlEncode(header) + "." +  base64UrlEncode(payload),  secret)
```

*   Base64Url：这个算法跟 Base64 算法基本类似，但有一些小的不同。JWT 作为一个令牌，有些场合可能会放到 URL（比如 api.example.com/?token=xxx）。Base64 有三个字符`+`、`/`和`=`，在 URL 里面有特殊含义，所以要被替换掉：`=`被省略、`+`替换成`-`，`/`替换成`_` 。这就是 Base64URL 算法。
    

#### 2.1.3 特点

1.  JWT 默认是不加密，但也是可以加密的。JWT 不加密的情况下，不能将敏感数据写入 JWT。但是，生成原始 Token 以后，可以用密钥再加密一次。
    
2.  JWT 不仅可以用于认证，也可以用于交换信息。有效使用 JWT，可以降低服务器查询数据库的次数。
    
3.  JWT 的最大缺点是，由于服务器不保存 session 状态，因此无法在使用过程中废止某个 token，或者更改 token 的权限。也就是说，一旦 JWT 签发了，在到期之前就会始终有效，除非服务器部署额外的逻辑。
    
4.  JWT 本身包含了认证信息，一旦泄露，任何人都可以获得该令牌的所有权限。为了减少盗用，JWT 的有效期应该设置得比较短，并且 JWT 不应该使用 HTTP 协议明码传输，要使用 HTTPS 协议传输。对于一些比较重要的权限，使用时应该再次对用户进行认证。
    

### 2.2 Session & Cookie

#### 2.2.1 是什么？

**（1） Cookie**

Cookie 是服务器发送到用户浏览器并保存在本地的一小块数据，它会在浏览器下次向同一服务器再发起请求时被携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器，如保持用户的登录状态。Cookie 使基于无状态的 HTTP 协议记录稳定的状态信息成为了可能。

有两种类型的 Cookie，一种是 Session Cookie(会话期 Cookie)，一种是 Persistent Cookie(持久性 Cookie)，如果 Cookie 不包含到期日期，则将其视为会话 Cookie。会话 Cookie 存储在内存中，永远不会写入磁盘，当浏览器关闭时，此后 Cookie 将永久丢失。如果 Cookie 包含`有效期` ，则将其视为持久性 Cookie，到期后，Cookie 将从磁盘中删除。

主要用途：

*   会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
    

*   个性化设置（如用户自定义设置、主题等）
    

*   浏览器行为跟踪（如跟踪分析用户行为等）
    

**（2）Session**

Session 代表着服务器和客户端一次会话的过程。Session 对象存储特定用户会话所需的属性及配置信息。这样，当用户在应用程序的 Web 页之间跳转时，存储在 Session 对象中的变量将不会丢失，而是在整个用户会话中一直存在下去。

常见误区：Session 不是关闭浏览器就消失了。对 Session 来说，除非程序通知服务器删除一个 Session，否则服务器会在 Session 失效前一直保留。大多数情况下浏览器是不会在关闭网页之前通知服务器的，所以服务器根本不知道浏览器已经关闭。之所以会有这种错觉，是大部分 session 机制都使用会话 cookie 来保存 session id，而关闭浏览器后这个 session id 就消失了，再次连接服务器时也就无法找到原来的 session。如果服务器设置的 cookie 被保存在硬盘上，或者使用某种手段改写浏览器发出的 HTTP 请求头，把原来的 session id 发送给服务器，则再次打开浏览器仍然能够打开原来的 session。

#### 2.2.2 session 和 cookie 关系

**（1）关系**

![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIpOUhph76icjYLsgdBZajdrLsIklTEWoDibKfyGZvqIVNxC1HJXGSLHDvrvT9obVtW2JqVic1Bhna2dg/640?wx_fmt=jpeg)

服务器第一次接收到请求时，开辟了一块 Session 空间（创建了 Session 对象），同时生成一个 session id ，并通过响应头的`Set-Cookie：JSESSIONID=XXXXXXX` 命令，向客户端发送要求设置 Cookie 的响应；客户端收到响应后，在本机客户端设置了一个`JSESSIONID=XXXXXXX`的 Cookie 信息，该 Cookie 的过期时间为浏览器会话结束。接下来客户端每次向同一个网站发送请求时，请求头都会带上该 Cookie 信息（包含 sessionId ）， 然后服务器通过读取请求头中的 Cookie 信息，获取名称为 JSESSIONID 的值，得到此次请求的 session id。  

**（2）区别**

1.  **安全性：** 由于 Session 是存储在服务器端的，Cookie 是存储在客户端的，所以 Cookie 被盗用的可能性相较于 Session 会更高一些。
    
2.  **存取值的类型不同**：Cookie 只支持存字符串数据，想要设置其他类型的数据，需要将其转换成字符串，Session 可以存任意数据类型。
    
3.  **存储大小不同：** 单个 Cookie 保存的数据不能超过 4K，Session 可存储数据远高于 Cookie，但是当访问量过多，会占用过多的服务器资源。
    

#### 2.2.3 Session id 的携带方式

*   Cookie：保存 session id 的方式可以采用 cookie，这样在交互过程中浏览器可以自动的按照规则把这个标识发送给服务器。
    
*   URL 重写：由于 cookie 可以被人为的禁用，必须有其它的机制以便在 cookie 被禁用时仍然能够把 session id 传递回服务器，经常采用的一种技术叫做 URL 重写，就是把 session id 附加在 URL 路径的后面，附加的方式也有两种，一种是作为 URL 路径的附加信息，另一种是作为 query 字符串附加在 URL 后面。网络在整个交互过程中始终保持状态，就必须在每个客户端可能请求的路径后面都包含这个 session id。
    

3 单点登录 (SSO)
------------

### 3.1 SSO 是什么

SSO（Single sign-on）即单点登录，一种对于许多相互关联，但是又是各自独立的软件系统，提供访问控制的方法。

单点登录 (SSO) 发生在用户登录到一个应用程序，然后自动登录到其他应用程序时，无论用户使用何种平台、技术或域。例如，如果你登录 Gmail 等 Google 服务，会自动通过 YouTube、AdSense、Google Analytics 和其他 Google 应用程序的身份验证。同样，如果退出 Gmail 或其他 Google 应用程序，将自动退出所有应用程序；这称为单点注销 (SLO)。

### 3.2 CAS

#### 3.2.1 是什么？

CAS(Central Authentication Service)， 集中式认证服务， 是 Yale 大学发起的一个企业级的、开源的项目，旨在为 Web 应用系统提供一种可靠的单点登录解决方法 (属于 Web SSO)。下图来自维基百科。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M7855FFM5WlzwLyOCYsibczialibd588aqqmUOs4KFw1DjA8v1ibpmtPq3TYw/640?wx_fmt=png)

**SSO** **体系中的角色**：  

*   User：使用平台的用户
    

*   Web 应用：接入 CAS SSO 服务的平台
    

*   SSO 认证中心 (cas service)：提供 CAS SSO 服务的平台
    

#### 3.2.2 易混淆概念

*   **TGT：Ticket Grangting Ticket**
    

TGT 是 CAS 为用户签发的登录票据，拥有了 TGT，用户就可以证明自己在 CAS 成功登录过。TGT 封装了 Cookie 值以及此 Cookie 值对应的用户信息。当 HTTP 请求到来时，CAS 以此 Cookie 值（TGC）为 key 查询缓存中有无 TGT ，如果有的话，则相信用户已登录过。

*   **TGC：Ticket Granting Cookie**
    

CAS Server 生成 TGT 放入自己的 Session 中，而 TGC 就是这个 Session 的唯一标识（SessionId），以 Cookie 形式放到浏览器端，是 CAS Server 用来明确用户身份的凭证。

*   **ST** **：Service Ticket**
    

ST 是 CAS 为用户签发的访问某一 service 的票据。用户访问 service 时，service 发现用户没有 ST，则要求用户去 CAS 获取 ST。用户向 CAS 发出获取 ST 的请求，CAS 发现用户有 TGT，则签发一个 ST，返回给用户。用户拿着 ST 去访问 service，service 拿 ST 去 CAS 验证，验证通过后，允许用户访问资源。ST 只能使用一次就会失效，这与 OAuth 中的 access_token 不同。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpOUhph76icjYLsgdBZajdrLoeWI34F1xhsnlu2bUxvI2xEeapyQQUMad6LoLg4C7acajB03e2k2vQ/640?wx_fmt=png)

👇**PGTIOU, PGT,** **PT** **是** **CAS** **2.0 的 代理模式 中的内容** **，感兴趣的同学可以自行了解。**

*   **PGT：Proxy Granting Ticket**
    

Proxy Service 的代理凭据。用户通过 CAS 生成一个 PGT 对象，缓存在 PGTIOU。

*   **PGTIOU：Proxy Granting Ticket I Owe You**
    

是 CAS 的 serviceValidate 接口验证 ST 成功后，CAS 会生成验证 ST 成功的 xml 消息，返回给 Proxy Service，xml 消息中含有 PGTIOU，proxy service 收到 Xml 消息后，会从中解析出 PGTIOU 的值，然后以其为 key，在 map 中找出 PGT 的值，赋值给代表用户信息的 Assertion 对象的 pgtId，同时在 map 中将其删除。

*   **PT** **：Proxy Ticket**
    

是用户访问 Target Service（back-end service）的票据。如果用户访问的是一个 Web 应用，则 Web 应用会要求浏览器提供 ST，浏览器就会用 cookie 去 CAS 获取 ST，而是通过访问 proxy service 的接口，凭借 proxy service 的 PGT 去获取一个 PT，然后才能访问到此应用。

#### 3.2.3 单点登录 (SSO) & 单点登出 (SLO)

##### 3.2.3.1 登陆流程

下图是 CAS 官网的登录时序图，可以更好地帮助我们理解，建议细看一下～

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78uciaZAxWtWhvl99NQe99H84sbUb1lzPt1fPthbqqWGO8P74a4libHpDw/640?wx_fmt=png)

##### 3.2.3.2 单点登出  

CAS 除了提供 SSO 功能，还提供了 SLO（单点登出）功能，由于 CAS Service 和 Client Service 各维护了一个登陆态，所以两者之间的登录态是割裂的，那我们应该怎么实现 SLO 呢？

由于官方没有给出一个详细的流程图，所以我就根据自己的理解画了一个，供大家参考一下～

![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78pTlCfMuzvUs2DC41VTSWb14V7EKWIbWV8JkFaIRnk7Hyt0PpLnkibEQ/640?wx_fmt=jpeg)

主要流程：  

1.  在某一个平台请求退出登录后，先在 query 携带 service 字段重定向到 CAS 退出登录的页面；
    
2.  携带 service query 字段和 TGC 发送请求到 CAS Server；
    
3.  CAS Server 通过 TGC 查询到登录信息，然后遍历请求各个接入平台的`/logout`接口；
    
4.  当所有业务的登录态都清除后，就成功单点登出了。
    

### 3.3 OAUTH

#### 3.3.1 是什么？

在 OAuth 中 “O” 是 Open 的简称，表示 “开放” 的意思。Auth 表示 “授权” 的意思，所以连起来 OAuth 表示 “开放授权” 的意思，它是一个关于授权（authorization）的开放网络标准。OAuth 允许用户授权第三方应用访问他存储在另外服务商里的各种信息数据，而这种授权不需要提供用户名和密码提供给第三方应用。比较直接的例子就是第三方 App 使用微信或 QQ 来登录，这些授权登录采用的就是 OAuth。

#### 3.3.2 名词定义

*   **Third-party application**：第三方应用客户端，就相当于当前需要授权的 App
    
*   **HTTP service**: 服务提供商，指的是微信、QQ
    
*   **Resource Owner**：用户 / 资源拥有者，本文指的是在微信中注册的用户
    
*   **Authorization server**: 认证服务器，在资源拥有者授权后，向客户端授权 (颁发 access token) 的服务器
    
*   **Resource server**: 资源服务器，服务提供商存放用户生成的资源的服务器。它与认证服务器，可以是同一台服务器，也可以是不同的服务器。
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpOUhph76icjYLsgdBZajdrLRU19f3kRNO7Q97c9UOGtFttpLJW3yNamjtIjy9c65KJaMWb2DFaNXg/640?wx_fmt=png)

#### 3.3.3 四种授权模式

本部分只展示一下相关的时序图，就不做文档的搬运工了🐶，想了解更多的同学，可以看最后的推荐阅读部分～

1.  授权码模式
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpOUhph76icjYLsgdBZajdrL2ZsZYEFECvU2icCCC6GyicKKLb6UQFyw71YSq5Sa1ECOwrtzXHwiczs9g/640?wx_fmt=png)

这种方式是最常用的流程，安全性也最高，它适用于那些有后端的 Web 应用。授权码通过前端传送，令牌则是储存在后端，而且所有与资源服务器的通信都在后端完成。这样的前后端分离，可以避免令牌泄漏。

2.  简化模式
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpOUhph76icjYLsgdBZajdrLEazsENIt368hL0IRjMY0AuLbhCiavxQ8GicJICsItq9jrUCmf3MYVSUw/640?wx_fmt=png)

第四步，直接返回 access_token 时，有被劫持的风险，所以 OAuth 采用如下的方式传递 token

`https://a.com/callback#token=ACCESS_TOKEN`

上面这个 URL，`token`参数就是令牌，客户端在前端拿到令牌。注意，令牌的位置是 URL 锚点（fragment），而不是查询字符串（querystring），这是因为 OAuth 允许跳转网址是 HTTP 协议，因此存在 "中间人攻击" 的风险，而浏览器跳转时，锚点不会发到服务器，就减少了泄漏令牌的风险。

这种方式把令牌直接传给前端，是很不安全的。因此，只能用于一些安全要求不高的场景，并且令牌的有效期必须非常短，通常就是会话期间（session）有效，浏览器关掉，令牌就失效了。

3.  密码模式
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpOUhph76icjYLsgdBZajdrLPSqic5LQk7sLm96SiaG3aKwOoKroTiaQ6AfEm9FWEaSAVTw5uDDYyrwLA/640?wx_fmt=png)

采用这种方式不需要跳转，而是把令牌放在 JSON 数据里面，作为 HTTP 响应，客户端拿到令牌。这种方式需要用户给出自己的用户名 / 密码，显然风险很大，因此只适用于其他授权方式都无法采用的情况，而且必须是用户高度信任的应用。

4.  凭证模式、客户端模式（**client credentials**）
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpOUhph76icjYLsgdBZajdrLq2qpBNSzU9RHuaSH1Kq5SiaqMgXgOpgIZagPLUViadQLkKib8P8YoXIDA/640?wx_fmt=png)

适用于没有前端的命令行应用，即在命令行下请求令牌。这种方式给出的令牌，是针对第三方应用的，而不是针对用户的，即有可能多个用户共享同一个令牌。

#### 3.3.4 令牌的种类与更新

每个发到 API 的请求，都必须带有令牌。具体做法是在请求的头信息，加上一个

`Authorization`字段，令牌就放在这个字段里面。

服务提供商平台颁发令牌的时候，一次性颁发两个令牌，一个用于获取数据的 access_token，另一个用于获取新的令牌 refresh_token。access_token 的过期时间较短，refresh_token 的过期时间较长，当 access_token 过期了，就会使用 refresh_token 来请求新的 access_token。

**通过 refresh_token 请求 access_token 的 url 示例**：

`https://server.example.com/oauth/token?`

`grant_type``=refresh_token&`

`client_id``=CLIENT_ID&`

`client_secret``=CLIENT_SECRET&`

`refresh_token``=REFRESH_TOKEN`

**参数解释**：

*   **grant_type**: 参数为 refresh_token 表示要求更新令牌;
    

*   **client_id**：客户端 id，第三方应用在服务提供者平台注册的，用于身份认证；
    

*   **client_secret**：授权服务器的秘钥，第三方应用在服务提供者平台注册的，用于身份认证；
    

*   **refresh_token**: 参数就是用于更新令牌的令牌
    

### 3.4 CAS 对比 OAUTH

1.  **设计初衷**
    

*   **CAS** 专门为中心化鉴权（**authentication**）而生，即 SSO，并且 3.5 版本后也支持通过 OAuth 协议进行登录鉴权
    

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78sFMHxXxBK3dicPB3OX3luibHvIdfYXC69a1RA98OoUa1ibHyGBCX2OALA/640?wx_fmt=png)

*   **OAuth** 是用来处理授权（**authorization**）而生，实现 SSO 并不是它的初衷，它只关注如何让第三方通过让用户无需登录的方式获得私有资源
    

*   只不过它也定义了完整的鉴权流程，如果你把用户信息当做私有资源，你也可以使用它定义的规范来实现 SSO，但相比 CAS，它是没有 **SLO** **（single logout）** 功能的。例如 **github**、**微信** 的第三方登录都是基于 OAuth 实现
    

2.  **安全性**
    

*   CAS
    

*   **Service** **ticket** **只能使用一次**，并且有效期越短越好，而 OAuth 的 access_token 是有有效期的，有效期内可以使用多次
    

*   ticket 生成需要足够随机，如果被攻击者猜出规律，则可以计算出下一个 ticket 值
    
*   OAuth
    

*   通过 state 参数 (放在 query 中) 可以有效防止 csrf 攻击
    

*   对于 web 应用，access_token 通过后端方式接口获取和接口使用，secret 不会展示在前端，暴露可能性低
    

*   对于前端应用，可以通过 PKCE extension 有效防止授权码拦截攻击
    

*   提供了 scope 机制来限制获取到的资源范围
    

3.  **资源存储**
    

*   CAS：Client 端 (应用系统) 是资源存储端，用户是资源消费者(应用使用者)。
    

*   OAuth2：Client 端 (第三方服务) 是资源消费端，通过用户授权，允许用户不提供自己账号密码的情况下，使 Client 端有权访问用户资源(如个人信息、通讯录等)。
    

*   简单来说：需要统一的账号密码进行身份认证，用 CAS；需要授权第三方服务使用我方资源，使用 OAuth。
    

4 实现一个简单的 SSO
-------------

### 流程图

#### 首次登陆

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78D23KQDxqxXibN0NGyPXWGKhN7v5YW4SONibPQ9UL1Ktru1Ip3yicbqg1A/640?wx_fmt=png)

#### 非首次登陆  

![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78oX8x0j140ib2onO8n0Fia0zm8PqC1q6mTia20zFtmMl6fs86ToRsThNQg/640?wx_fmt=jpeg)

#### 退出登录  

![](https://mmbiz.qpic.cn/mmbiz_jpg/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78S516X74Kkh8pyueU2yopJlaAKOMXUffrFrQkJv65rvCNafW9HAoKjw/640?wx_fmt=jpeg)

### 模块  

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">模块</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">FE - 平台 A</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">客户端 A</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">BE - 平台 A</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">Server 端 A，为客户端 A 提供接口服务</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">FE - 平台 B</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">客户端 B</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">BE - 平台 B</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">Server 端 B，为客户端 B 提供接口服务</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">FE - 统一登录平台</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">SSO 登陆前端页面</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">BE - 统一登录平台</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">SSO 登陆 Server 服务</td></tr></tbody></table>

### 接口

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">模块</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">接口</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">BE - 平台 ABE - 平台 B</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">面向前端<br>• authentication：查询用户登陆状态<br>• userLogout：用户退出当前系统登陆<br>面向 SSO<br>• ssoLogout：用于 SSO 清除当前系统 Token<br>• sendToken：用于接收 SSO-BE 发送过来的 Token</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">BE - 统一登录平台</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">面向前端<br>• login<br>• sendToken：验证存在 cookie，请求发送 token<br>面向 Server<br>• searchLoginState:：查询当前用户的登陆状态<br>• logout：用于退出登陆状态</td></tr></tbody></table>

#### 用户平台接口

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">接口</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">type</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">请求参数</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">返回参数</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">所属平台</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/authentication</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">get</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">成功：状态码 200<br>失败：状态码：1001</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">平台 A、B</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/userLogout</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">post</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">平台 A、B</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/ssoLogout</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">post</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">平台 A、B</td></tr></tbody></table>

#### SSO 平台接口

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">接口</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">type</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">请求参数</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">返回参数</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">所属平台</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/login</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">post</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">account<br>password</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">登陆成功：<br>• 状态码 200<br>• token<br>登录失败：<br>• 状态码 1002</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">SSO 平台</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/sendToken</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">post</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">token</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">SSO 平台</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/searchLoginState</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">get</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">token?: string</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">登陆态合法：<br>• 状态码 200<br>• token<br>登陆态不合法：<br>• 状态码 1001</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">SSO 平台</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">/logout</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">post</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">token</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;"><br></td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">SSO 平台</td></tr></tbody></table>

### 页面

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">模块</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); background-color: rgb(240, 240, 240); text-align: justify; min-width: 85px;">页面</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">FE - 平台 AFE - 平台 B</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">主页面<br>• 显示当前系统用户登录成功了<br>• 退出登录按钮</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">FE - 统一登录平台</td><td data-style="border-color: rgb(204, 204, 204); text-align: justify; min-width: 85px;">登录页面</td></tr></tbody></table>

### 其他实现方案

#### 前后端框架

本 demo 采用 eden monorepo 来组织共六个子项目，分别为三个 React 前端子项目和三个 Node 后端子项目，后端采用的是公司内部封装的 gulu 框架。

#### Token 持久化

由于 Node 后端需要记录当前已登陆系统的用户 token，所以本 Demo 采用 JSON 文件来暂时存储已登录用户的 Token，使用 fs 来对 json 文件进行读写操作，模拟存储和删除 token 的过程。

#### 本地端口

本次 demo 仅在本地运行展示，所有使用的均为本地 localhost[1] 端口，端口对应如下

*   FE - 统一登录平台：3000
    

*   FE - 统一登录平台: 4000
    

*   FE - 平台 A: 3001
    

*   BE - 平台 A: 4001
    

*   FE - 平台 B: 3002
    

*   BE - 平台 B: 4002
    

#### 前后端分离跨域问题

由于只是 demo 演示项目，所以采用的是 config 文件中的代理来暂时解决。

```
devServer: {      proxy: {        '/api': {          target: 'http://localhost:400x',          changeOrigin: true,          pathRewrite: { '^/api': '' },        },      },    },
```

5 问题讨论
------

Q ：JWT 如何注销登录？

A ：由于 JWT 是无状态的，服务端不存储它，目前为止还没有了解到有什么能够不涉及到服务端存储的注销方式。

Q ：业务方接入 SSO 系统，但是没有实现维护登录态的服务，会出现什么问题？

A ：SSO 系统，本质上仍然是 “授权” 服务， 即提供了集中式的授权管理， 但是 “鉴权” 应当业务方自己实现。例如：server 通过 token 获取到了用户的授权信息（user_id 之类的），如果业务方不把这个 “授权信息（登录态）” 维护起来（session/JWT），那么每次访问都需要再走到 SSO Server，走一次完整流程。那么就会导致以下两个问题：1、对 SSO server 而言流量、请求会被放大；2、对用户而言流程变长、响应时间变慢。

6 补充内容
------

### 6.1 加密算法

有兴趣的可以看一下这篇文章：浅谈常见的七种加密算法及实现 [2]

加密算法分对称加密和非对称加密，其中对称加密算法的加密与解密密钥相同，非对称加密算法的加密密钥与解密密钥不同，此外，还有一类不需要密钥的散列算法。常见的对称加密算法主要有 `DES`、`3DES`、`AES`等，常见的 非对称算法 主要有`RSA`、`DSA`等，散列算法 主要有`SHA-1`、`MD5`等。

![](https://mmbiz.qpic.cn/mmbiz_png/ndgH50E7pIpKWDmLvWy7Cl52nWDF1M78gz5bLAvWKtktuXtVTI6PlkxqxSkkgJK1RbORPeBQStwupOR4JT4f0A/640?wx_fmt=png)

哈希算法的特点：  

*   正像快速：原始数据可以快速计算出哈希值；
    
*   逆向困难：通过哈希值基本不可能推导出原始数据；
    
*   输入敏感：原始数据只要有一点变动，得到的哈希值差别很大；
    
*   冲突避免：很难找到不同的原始数据得到相同的哈希值，宇宙中原子数大约在 10 的 60 次方到 80 次方之间，所以 2 的 256 次方有足够的空间容纳所有的可能；
    

推荐阅读

傻傻分不清之 Cookie、Session、Token、JWT[3]

前端需要了解的 SSO 与 CAS 知识 [4]

OAuth.0 原理浅析 [5]

理解 OAuth 2.0[6]

OAuth 2.0 的四种方式 [7]

### 参考资料

[1]

localhost: _http://localhost_

[2]

浅谈常见的七种加密算法及实现: _https://juejin.cn/post/6844903638117122056_

[3]

傻傻分不清之 Cookie、Session、Token、JWT: _https://juejin.cn/post/6844904034181070861#heading-17_

[4]

前端需要了解的 SSO 与 CAS 知识: _https://juejin.cn/post/6844903509272297480_

[5]

OAuth.0 原理浅析: _https://juejin.cn/post/7010636081305485319_

[6]

理解 OAuth 2.0: _https://www.ruanyifeng.com/blog/2014/05/oauth_2_0.html_

[7]

OAuth 2.0 的四种方式: _https://www.ruanyifeng.com/blog/2019/04/oauth-grant-types.html_

❤️ 谢谢支持  

----------

以上便是本次分享的全部内容，希望对你有所帮助 ^_^

喜欢的话别忘了 **分享、点赞、收藏** 三连哦~。

欢迎关注公众号 **ELab 团队** 收货大厂一手好文章~

> 我们来自字节跳动，是旗下大力教育前端部门，负责字节跳动教育全线产品前端开发工作。
> 
> 我们围绕产品品质提升、开发效率、创意与前沿技术等方向沉淀与传播专业知识及案例，为业界贡献经验价值。包括但不限于性能监控、组件库、多端技术、Serverless、可视化搭建、音视频、人工智能、产品设计与营销等内容。

字节跳动校 / 社招内推码: 5JEEG2Q 

投递链接: https://job.toutiao.com/s/8R7N4c6