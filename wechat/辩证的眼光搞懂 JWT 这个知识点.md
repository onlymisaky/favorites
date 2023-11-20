> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/fGm8hEMfmBfOIzeB64v6HA)

什么是 JWT
-------

### 概念

JSON Web Token（简称 JWT）是目前最流行的跨域认证解决方案。

JWT 原理
------

### JWT 组成

JWT 由三部分组成: Header，Payload，Signature 三个部分组成，并且最后由. 拼接而成。

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0NwtVafRMxmBqLogEjzicQmndicWmLicdIQLyCsSjDoFw2DDtXqMtCTUgAfH8BobqvxnX6LjeOovKvgU6Q/640?wx_fmt=png)

#### Header

Header 部分是一个 JSON 对象，描述 JWT 的元数据，通常是下面的样子。

```
{  "alg": "HS256",  "typ": "JWT"}
```

上面代码中，alg 属性表示签名的算法（algorithm），默认是 HMAC SHA256（写成 HS256）；typ 属性表示这个令牌（token）的类型（type），JWT 令牌统一写为 JWT。

最后将上面的 JSON 对象使用 Base64URL 算法转成字符串。

#### Payload

Payload 中由 Registered Claim 以及需要通信的数据组成。它也是 JSON 格式，另外这些数据字段也叫 Claim。JWT 规定了 7 个官方字段如下

```
iss (issuer)：签发人
exp (expiration time)：过期时间
sub (subject)：主题
aud (audience)：受众
nbf (Not Before)：生效时间
iat (Issued At)：签发时间
jti (JWT ID)：编号
```

除了官方的字段外你也可以自定义一些字段，比如 user_id，name 等

Registered Claim 中比较重要的是 "exp" Claim 表示过期时间，在用户登录时会设置过期时间，用于后面过期校验。

```
const payload = {  // 表示 jwt 创建时间  iat: 1532135735,  // 表示 jwt 过期时间  exp: 1532136735,  // 用户 id，用以通信  user_id: 123456}
```

#### Signature

Signature 部分是对前两部分的签名，防止数据篡改。

首先，需要指定一个密钥（secret）。这个密钥只有服务器才知道，不能泄露给用户。然后，使用 Header 里面指定的签名算法（默认是 HMAC SHA256），按照下面的公式产生签名。

```
// 由 HMACSHA256 算法进行签名，secret 不能外泄const sign = HMACSHA256(base64.encode(header) + '.' + base64.encode(payload), secret)// jwt 由三部分拼接而成const jwt = base64.encode(header) + '.' + base64.encode(payload) + '.' + sign
```

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0NwtVafRMxmBqLogEjzicQmndicGHNE1wYmyg36gvcoSobziaO6ju9dYSaUZgINFGp7btQtv1CPJN6wVnw/640?wx_fmt=png)

算出签名以后，把 Header、Payload、Signature 三个部分拼成一个字符串，每个部分之间用 " **点** "（.）分隔，。

### JWT 校验原理

图片总是更清晰:

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwtVafRMxmBqLogEjzicQmndicKJoe34MUYoRjTdMhtJWAWTvEAxRZEXiaPDDy3amMgqRfXDf0lLFosFA/640?wx_fmt=jpeg)通过前面讲解的 jwt 生成规则，jwt 前两部分是对 header 以及 payload 的 base64 编码。 当服务器收到客户端的 token 后，解析前两部分得到 header 以及 payload，并使用 header 中的算法与 服务端本地私有 secret 进行签名，判断与 jwt 中携带的签名是否一致。

### 编码扩展知识

*   base64
    
    由于 ASCII 码成为了国际标准，所以我们要把其它字符转成 ASCII 就要用到 base64。
    
    ```
    utf-8 -> base64(编码) -> ASCII
    
    ASCII -> base64(解码) -> utf-8
    ```
    
    这样就可以让只支持 ASCII 的计算机支持 utf-8 了。
    
    base64 几个特点 :2 进制的；要比源数据多 33%；常用于邮件； = 号的个数是由 /3 的余数来决定的，最多能有 2 个 = 号；
    
    主要用于初步的加密（非明文可见）和安全的网络传输。
    
*   UrlEncode
    
    例子：www.baidu.com?a=nihao
    
    上面的例子可以看出 a 的值是你好
    
    如果要把 a 的值换成 “=” 字符呢？这样吗：www.baidu.com?a== ，肯定不行啦，“=” 是特殊字符
    
    所以把 “=” UrlEncode 后 “%3d”
    
    www.baidu.com?a=%3d
    
    服务器拿到 a 解码得到 “=”
    
    所以说 url 是限制性编码
    

看完这两个编码应该明白为什么上面`base64.encode`这种格式转换。JWT  作为一个令牌（token），有些场合可能会放到 URL（比如 www.inode.club/?token=xxx)

JWT 与 Session 对比
----------------

### 有无状态对比

*   Session
    
    Session 是一种记录服务器和客户端会话状态的机制，需要在数据库或者 Redis 中保存用户信息和 token 信息，所以它是有状态的。
    
*   JWT 看完了前面的 JWT 结构和 JWT 校验原理，在后端并不需要存储数据，直接通过私有密钥验证就可以了。
    

当有这样的一个需求，一家公司下同时关联了多个业务，A 业务网站，B 业务网站，但是现在要求用户在 A 网站登陆过，再访问 B 网站的时候能够自动登陆，JWT 就可以很快的实现这个需求，把 JWT 直接存储在前端，后端只要校验 JWT 就可以了。

> 注: 这个需求用 session 也是可以实现的，只是会存储状态，查询存储，没有 JWT 方便而已。

### 适用场景对比

#### 邮箱验证

很多网站在注册成功后添加了邮箱验证功能，功能实现：用户注册成功后，完善邮箱，服务端会给用户邮箱发一个链接，用户点开链接校验成功，这个功能使用 JWT 是个不错的选择。

```
// 把邮箱以及用户id绑定在一起，设置生效时间const code = jwt.sign({ email, userId }, secret, { expiresIn: 60 * 30 })// 在此链接校验验证码const link = `https://www.inode.club/code=${code}`
```

#### 做那些短期的验证需求 (强烈推荐的场景)

比如在 **BFF** 层，用 JWT 去验证传递一些数据还是不错的选择，可以把有效时间设置的短一些，过期了就需要重新去请求，我这么直接表述你可能还不太懂，举个现实生活中的例子。

> 我们上学的时候，有**班主任**和**学科老师**这两个概念，有一天你想请假，你需要先去找班主任开一个请假条，然后拿去给你的班主任签完字之后，你会将请假条交给你的学科课教师，学科教师确认签字无误后，把请假条收了，并在请假记录表中作出了相应记录。

上面的例子中，“请假申请单” 就是 JWT 中的 payload，领导签字就是 base64 后的数字签名，领导是 issuer，“学科教师的老王” 即为 JWT 的 audience，audience 需要验证班主任签名是否合法，验证合法后根据 payload 中请求的资源给予相应的权限，同时将 JWT 收回。

放到一些系统集成的应用场景中，例如我前面说的 **BFF** 中其实 JWT 更适合一次性操作的认证：

> 服务 B 你好, 服务 A 告诉我，我可以操作 <JWT 内容>, 这是我的凭证（即 JWT ）

在这里，服务 A 负责认证用户身份（类似于上例班主任批准请假），并颁布一个很短过期时间的 JWT 给浏览器（相当于上例的请假单），浏览器（相当于上例请假的我们）在向服务 B 的请求中带上该 JWT，则服务 B（相当于上例的任课教师）可以通过验证该 JWT 来判断用户是否有权限执行该操作。通过这样，服务 B 就成为一个安全的无状态的服务。

个人还是认为 JWT 更适合做一些**一次性的安全认证**，好多其他场景考虑多了之后又做回了 session，传统的 cookie-session 机制工作得更好，但是对于一次性的安全认证，颁发一个有效期极短的 JWT，即使暴露了危险也很小。上面的邮箱验证其实也是一次性的安全认证。

#### 跨域认证

因为 JWT 并不使用 Cookie ，所以你可以使用任何域名提供你的 API 服务而不需要担心跨域资源共享问题（CORS）。JWT 确实是跨域认证的一个解决方案，但是对于跨域场景时要注意一点。 客户端收到服务器返回的 JWT，可以储存在 Cookie 里面，也可以储存在 localStorage。

此后，客户端每次与服务器通信，都要带上这个 JWT。你可以把它放在 Cookie 里面自动发送，但是这样**不能跨域**，所以更好的做法是放在 HTTP 请求的头信息 Authorization 字段里面。

Authorization: Bearer 另一种做法是，跨域的时候，JWT 就放在 POST 请求的数据体里面。

##### 跨域知识扩展

跨域这两个字就像一块**狗皮膏药**一样黏在每一个开发者身上，无论你在工作上或者面试中无可避免会遇到这个问题。为了应付面试，我们每次都随便背几个方案。**但是如果突然问你为什么会有跨域这个问题出现？** ... 停顿几秒，这里只是普及一下，知道的可以忽略掉。

推荐一篇很棒的跨域文章：https://segmentfault.com/a/1190000015597029

#### 登陆验证

登陆验证: 不需要控制登录设备数量以及注销登陆情况，无状态的 jwt 是一个不错的选择。具体实现流程，可以看上文中的校验原理，校验原理使用的登陆验证例子。

当需求中出现控制登陆设备数量，或者可以注销掉用户时，可以考虑使用原有的 session 模式，因为针对这种登陆需求，需要进行的状态存储对 jwt 添加额外的状态支持，增加了认证的复杂度，此时选用 session 是一个不错的选择。 针对上面的特殊需求，可能也有小伙伴仍喜欢使用 jwt ，补充一下特殊案例

##### 注销登陆

用户注销时候要考虑 token 的过期时间。

*   session: 只需要把 user_id 对应的 token 清掉即可 ;
    
*   jwt: 使用 redis，需要维护一张黑名单，用户注销时把该 token 加入黑名单，过期时间与 jwt 的过期时间保持一致。
    

##### 用户登陆设备控制

*   session: 使用 sql 类数据库，维护一个用户验证 token 表，每次登陆重置表中 token 字段，每次请求需要权限接口时，根据 token 查找 user_id(也可以使用 redis 维护 token 数据的存储)
    
*   jwt: 假使使用 sql 类数据库，维护一个用户验证 token 表，表中添加 token 字段，每次登陆重置 token 字段，每次请求需要权限接口时，根据 jwt 获取 user_id，根据 user_id 查用户表获取 token 判断 token 是否一致。(也可以使用 redis 维护 token 数据的存储)
    

适合做那些事来讲的，其实也就是针对 JWT 的优势来说的，还有一些辩证性的理解。接下来说说 JWT 的缺点。

JWT 注意事项 (缺点)
-------------

1.  更多的空间占用。如果将原存在服务端 session 中的信息都放在 JWT 中保存, 会造成 JWT 占用的空间变大，需要考虑客户端 cookie 的空间限制等因素，如果放在 Local Storage，则可能会受到 XSS 攻击。
    
2.  无法作废已颁布的令牌。JWT 使用时由于服务器不需要存储 Session 状态，因此使用过程中无法废弃某个 Token 或者更改 Token 的权限。也就是说一旦 JWT 签发了，到期之前就会始终有效，除非服务器部署额外的逻辑。
    
3.  用户信息安全。通过 J WT 的组成结构可以看出，Payload 存储的一些用户信息，它是通过 Base64 加密的，可以直接解密，不能将秘密数据写入 JWT，如果使用需要对 JWT 进行二次加密。
    

缺点与优势都知道了，我想怎么选就看你自己了。

总结
--

本文对 JWT 进行的一个辩证的讲解，优势和缺点，以及个人认为合适的适用场景，JWT 并不是银弹，是否采用 JWT，一定要多考虑一下业务场景。希望本文让小伙伴们对 JWT 认识的更好些。

❤️ 看完三件事  

大家好，我是 koala，如果你觉得这篇内容对你挺有启发，我想邀请你帮我三个小忙：  

*   点个【在看】，或者分享转发，让更多的人也能看到这篇内容
    
*   关注公众号【**程序员成长指北**】，不定期分享原创 & 精品技术文章。
    
*   添加微信【 **coder_qi** 】。加入程序员成长指北公众号交流群。
    

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0NwtPCRb4XCz4KW4tqjSzD3xhYMPUkWl31YgricxEQxHkjbOuUiavia9rNmxibfnwj0KzD58SNBE8EKL2Jw/640?wx_fmt=png)

**“在看转发” 是最大的支持**