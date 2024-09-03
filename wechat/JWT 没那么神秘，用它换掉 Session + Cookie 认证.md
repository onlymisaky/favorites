> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/oi-48cfZ9N6Giq06YazkfA)

> 本项目代码已开源，具体见 fullstack-blog[1]。
> 
> 数据库初始化脚本：关注公众号，回复关键词 “博客数据库脚本”，即可获取。

背景引入
----

在《[前端轻松拿捏！最简全栈登录认证和权限设计！](http://mp.weixin.qq.com/s?__biz=MzUzMTQ0NzA0OQ==&mid=2247487157&idx=1&sn=6ba6494b6addfbf04d4ff562fbb8a23c&chksm=fa4322d3cd34abc5a8389a148bc0028cbc67e7fc58d60276d7f721e50eb44e91f20f19ae9714&scene=21#wechat_redirect)》一文中，我们掌握了如何基于 Session + Cookie 实现一个基本的登录认证功能，这是一个经得起时间考验的方案。

基于 Session + Cookie 的认证，在用户登录认证时，简单做法是将 Session ID 作为 Token，接着将这个 Token 放到 Cookie 中，后续客户端发送请求时，服务端就可以从 Cookie 中取出 Token，验证用户身份。

实现上，我们可以将这个 Token 直接作为 user 表中的一个字段，在用户登录后直接写入数据库，后续验证都是根据 Session ID 查 user 表验明身份。

总的来说，Session + Cookie 的方案相当于是对每个 Token 都做了登记，每个 Token 都有对应的内存或存储系统来维护，有时还会考虑将 Token 写入到数据库中，这就是一种有状态的认证机制。当我们验证 Token 时，就需要从 Cookie 中取出口令，再去校验这个 Token 的有效性。

Session + Cookie 实现登录认证的方案，它易于实现、安全性较强，但是由于它的实现机制，也会受到一些制约。

比如 Cookie 的一些问题：

*   Cookie 受同源策略限制，在跨域应用场景下使用会遇到一些困难。
    
*   依赖于客户端对 Cookie 的支持，如果用户禁用 Cookie，这套体系将无法正常工作。
    
*   Cookie 还有有名的 CSRF 钓鱼链接问题，不过现在浏览器对 Cookie 也有了一些安全措施应对。
    

Session 也会有一些问题存在：

*   每个用户的 Session 数据都需要存储在服务器上，当用户量大时会占用大量服务器内存，增加服务器负载。当然很多 Session 的库实现也支持外部存储，比如提供 Redis 连接，但是都对内存提出了更高要求。
    
*   分布式场景下，要考虑引入较为复杂的分布式 Session 方案，可扩展性一般。
    

那么有没有备选的认证方案呢？我们不妨来看一看 JWT[2]。

认识 JWT
------

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkzoDExeGzNGu95iahOMlZgIiajvZ5O7IdJRaxZdhUwxDh2f9dMGRYhWKx2Qqib2REeZHgM31ibM3OR4gA/640?wx_fmt=png&from=appmsg)image-20240715172203552

JWT 全名是 JSON Web Tokens。

> JSON Web Token (JWT) is an open standard (RFC 7519[3]) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret (with the **HMAC** algorithm) or a public/private key pair using **RSA** or **ECDSA**.

JWT 有一个很重要的特点是 self-contained，也就是说它不依赖于外部系统就能正常工作，生成 Token 和验签的过程都基于自身的算法完成。

### JWT 格式解释

JWT 的格式是这样的，也就是由头部、载荷、签名三部分组成：

```
Header.Payload.Signature
```

其中头部包含标准的两个字段：

*   typ: 其实是 type 的简写，代表 Token 的类型，一般固定为`JWT`
    
*   alg: 采用的签名算法，通常有`HMAC SHA256`, `RSA`。
    

```
{  "alg": "HS256",  "typ": "JWT"}
```

HMAC SHA256 采用对称密钥，RSA 则采用非对称加密，这也说明了 JWT 并不强制采用对称加密或者非对称加密。

在实际使用场景中，RSA 适合分布式系统，可以在认证服务中使用私钥签名和下发 JWT，其他各个微服务可以使用公钥验签，这既保证了签发 Token 的安全性，也避免了各个微服务对认证服务的过度调用。

头部 json 进行 **Base64Url** 编码后，作为`Header.Payload.Signature`中的 Header 部分。

而 Payload 则是由三类声明组成，分别是 Registered claims, Public claims, Private claims。

其中 Registered claims 是可选的标准化的，具体参考 RFC7519#Registered Claim Names[4]。

Public claims[5] 是公开的一些字段，建议大家使用时尽量往这上面凑，满足通用性和 interoperable。

Private claims 就是完全自定义的，意思就是在上面两大类 claims 中实在是找不到适合自己业务的，你就自己起个名字自己用。

整理好 Payload 字段后，也是进行 **Base64Url** 编码。

Signature 就很好理解了，签名嘛，假设采用 HMACSHA256 算法，就可以参考这个公式：

```
HMACSHA256(  base64UrlEncode(header) + "." +  base64UrlEncode(payload),  secret)
```

相当于把前面两个 Base64Url 编码的内容用英文点号连接起来，使用密钥进行签名，签名的结果再进行 **Base64Url** 编码。

这样一来，我们就得到了三个 **Base64Url** 编码的结果，把这三个结果用点号连接起来就是一个标准的 JWT。下方就是一个示例。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0IjoiZnVsbHN0YWNrLWJsb2ciLCJhdXRob3IiOiLnmb3lvawiLCJzdWIiOiJkZW1vIiwiaWF0IjoxNzIxMDM0ODMyLCJuYmYiOjE3MjEwMzQ4MzIsImV4cCI6MTcyMTEyMTIzMn0.g1rUb1rWBtV6mzbUtFxk4dBRfLFYQmwHP_eQtKyVfIw
```

### 寻找合适的库实现

理解了上面的数据结构后，就可以找具体的语言库来应用了，这个大家可以在 JWT 官方推荐的 Libraries[6] 中找到，并且各个语言的实现都有。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkzoDExeGzNGu95iahOMlZgIiabbUVtzaicCYlNqgc9lDWnnmuZv26QxTa16fyOEnfTf4QsJVxMcm1icCg/640?wx_fmt=png&from=appmsg)image-20240715172050893

代码实现改造
------

接下来就是代码的改造了，主要考虑两处，一个是认证下发 Token 的地方，一个是验证 Token 的地方。

### 下发 Token

在本博客项目中，认证下发 Token 也就是在登录的实现里。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkzoDExeGzNGu95iahOMlZgIiasTEOtqVvsEQjx9icR03b1ZsXTAXWUkOc8cnqBd7zs9SDg5DEBpHMmicQ/640?wx_fmt=png&from=appmsg)image-20240715173144715

在使用 Session 认证时，我们的思路是：验证了用户名和密码后，就将 Session ID 更新到 user 表中的 token 字段，同时把这个 token 设置到 Cookie 中。

而采用 JWT 时，我们的做法是：验证了用户名和密码后，采用`jwt.sign`签发 Token，并将 Token 返回给前端。

前端则将登录接口返回的 token 存起来，后续接口请求中在`Authorization`头部中携带 token。

### 验证 Token

权限验证我们是放在 BaseController 实现的，并且我们仅会对 authMap 中标识过的接口进行权限验证。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkzoDExeGzNGu95iahOMlZgIiasyv2WEeQichWILws85T1GSkOLvCnHEWuEEt6S6hKKvSGunBBDC9hrkQ/640?wx_fmt=png&from=appmsg)image-20240715174034070

对于需要验证权限的接口请求，在使用 Session 认证时，我们是判断请求 Cookie 中是否携带了 token，如果没有，直接返回 “未授权”，如果携带了 token，再去查 user 表验证身份。

改为 JWT 后，我们的做法是：取出请求中的`Authorization`头部字段，进行 JWT 验签，如果通过，继续验证角色是否符合。

注意事项
----

以上实现仅供参考，如用于业务项目生产环境使用，应该还做更多考虑。

JWT 不应该存储经常变化的信息，假设你在一个管理系统中使用 JWT，通常来说，用户的权限信息可能随时会变化，我们不应该把权限信息放在 JWT 中。

如果你实在需要在 JWT 中放置一些可能会变化的信息，那么也不能放关键信息，并且尽量让 JWT 的有效期短一点。

JWT 也不应该存储敏感信息，你不应该把一些密码之类的信息放在 JWT 中。

*   开源地址：fullstack-blog[1]
    
*   专栏导航：Vue3+TS+Node 打造个人博客（总览篇）[7]
    

参考资料

[1]

fullstack-blog: https://github.com/cumt-robin/fullstack-blog

[2]

JWT: https://jwt.io/

[3]

RFC 7519: https://tools.ietf.org/html/rfc7519

[4]

RFC7519#Registered Claim Names: https://datatracker.ietf.org/doc/html/rfc7519#section-4.1

[5]

Public claims: https://www.iana.org/assignments/jwt/jwt.xhtml

[6]

Libraries: https://jwt.io/libraries?language=Node.js

[7]

Vue3+TS+Node 打造个人博客（总览篇）: https://juejin.cn/post/7066966456638013477

  

_END_

  

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXzzPpciaorRnwicnXYBiaSzdB4Hh2ueW2a09xqAztoX9iayLyibTyoicltC7g/640?wx_fmt=png)

  

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)