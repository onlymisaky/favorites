> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MGTZWgLMTF3Cwp_XXVV0iQ)

1. 第三方授权登录
==========

1.1 简介
------

**第三方授权登录**作为一种用户认证方式，允许用户通过已有的第三方账户（微信、QQ、新浪等）进行登录，无需在新的应用中手动注册新的账户。这种方式简化了用户注册和登录的流程，提高了用户体验和登录转化率。

以微信授权登录为例，用户能够直接授权其他应用获取其微信账号的相关信息，例如头像、昵称等，从而迅速完成注册和登录操作。

第三方授权登录具备以下优点：

*   对于用户：操作简便、快捷，无需记忆账号密码，规避了繁杂的注册流程；
    
*   对于应用开发商：借助第三方账户登录，能够迅速获取用户的部分个人信息，有利于为用户提供个性化体验和精准推荐；
    

1.2 微信授权登录
----------

从用户的视角来看，使用微信授权登录的流程极为简便。以转转 App 使用微信登录为例，用户在登录页面点击微信登录后，会跳转至微信 App。用户需要登录自己的微信账号，并授权转转 App 访问自身的基本信息（如昵称、头像等），随后页面会跳转回转转 App，并提示登录成功，如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHJgicASstwnXpk3yxgSKTwcK2ugQQnPJEmjzGtIdGWxnNtDNjb5Laziag/640?wx_fmt=png&from=appmsg)

当用户在微信中对转转 App 首次进行授权时，微信会记录授权状态。因此，用户在转转 App 中退出登录后，再次点击微信登录，跳转至微信 App 时，无需用户再次点击按钮进行授权。

1.3 取消微信授权
----------

我们可以在微信 App 的**设置 -> 个人信息与权限 -> 授权管理**中查看所有已授权的应用，并且可以对某个应用解除授权，如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHghMxK68bNQwsgcheAiatHzhs54dd8DevXsTvJtOpwzG4D897haasCkw/640?wx_fmt=png&from=appmsg)

对于已解除授权的应用，再次使用微信授权登录时，就需要用户手动点击按钮进行确认授权了。

微信开放平台提供了**移动应用微信登录开发指南**，尽管该文档旨在引导开发者更顺利地接入微信登录功能，但我们可以将其作为指导，去深入了解微信授权登录的完整流程。

2. OAuth2.0 协议标准
================

**移动应用微信登录开发指南**中开篇便介绍：移动应用微信登录是基于 **OAuth2.0 协议标准**构建的**微信 OAuth2.0 授权登录系统**，那么 **OAuth2.0 协议标准**究竟是怎样的呢？

2.1 简介
------

OAuth 是 **Open Authorization（开放授权）**的缩写，它是一项业界标准的授权协议，主要用于授权第三方应用访问其他应用的资源，同时避免用户将自身的凭据（用户名和密码）直接提供给第三方应用。

OAuth2.0 是 OAuth 协议的延续版本，相比于 OAuth1.0 采用了更简单和更安全的授权流程，同时引入了一些新的安全特性。如果向前兼容 OAuth1.0，难以确保整个授权体系的安全性，所以 OAuth2.0 不向前兼容 OAuth1.0。

2.2 主要角色
--------

OAuth2.0 中定义了以下四个主要角色：

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">角色</th><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">作用</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">资源所有者<br>Resource Owner</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">拥有资源的主体（通常指用户），有权对客户端进行授权</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">资源服务器<br>Resource Server</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">存储受保护资源的服务器，客户端凭借访问令牌可发起请求并访问资源</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">客户端<br>Client</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">期望访问资源所有者在资源服务器中受保护资源的应用程序（移动应用、桌面应用、网页应用等）。如果一个应用通过其服务端与授权服务器进行交互以获取访问令牌，然后再将访问令牌提供给应用使用，那么服务端也属于<code>客户端</code>这个角色的一部分</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">授权服务器<br>Authorization Server</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">负责身份认证，并向客户端颁发访问令牌</td></tr></tbody></table>

此外，还涉及一些关键名词：

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">名词</th><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">介绍</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">访问令牌<br>Access Token</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">授权服务器发放给客户端的凭证，代表客户端有权访问资源所有者的资源</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">授权端点<br>Authorization Endpoint</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">授权端点是客户端引导资源所有者进行授权的入口，资源所有者可以查看客户端请求的权限范围，并决定是否授予访问权限。</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">令牌端点<br>Token Endpoint</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">令牌端点是客户端用来获取访问令牌的接口，一旦资源所有者在授权端点授予了访问权限，客户端就可以使用授权码或其他凭证向令牌端点请求访问令牌</td></tr></tbody></table>

2.3 工作流程概览
----------

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHWEngLCS6q3dlxIILdibZCaic8YCQcFHElDvkTO8iaDvia4R9icXtsZPNgHQ/640?wx_fmt=png&from=appmsg)

**上图展示了四个角色之间的交互，整个过程相对简洁：**

1.  客户端（Client）向资源所有者（Resource Owner），请求资源授权；
    
2.  资源所有者（Resource Owner）确认并授权，通常是会返回一个凭据（`这里有多种授权方式，在2.4章节中会详细介绍`）；
    
3.  客户端（Client）通过携带凭据的授权请求向授权服务器（Authorization Server）发起身份认证，获取访问令牌（Access Token）；
    
4.  授权服务器（Authorization Server）进行身份验证，通过后颁发访问令牌（Access Token）；
    
5.  客户端（Client）访问资源服务器（Resource Server），并使用令牌（Access Token）进行身份验证；
    
6.  资源服务器（Resource Server）验证令牌（Access Token）通过后，则返回受保护的资源；
    

* * *

**举个🌰例子：**

我们通过一个常见的例子来解释 OAuth2.0 的这种授权机制：假设我们要去客户公司拜访，客户公司内分布着不同的门禁。我们需要在前台获取访客卡，然后才能进入客户公司，并且这张访客卡存在区域限制，仅能访问特定的办公区域，并且当我们离开客户公司时还需归还访客卡。

在这个例子中：

1.  我们在客户公司前台填写访客信息，相当于 “获取授权”；
    
2.  客户公司前台审核访客信息无误后，进行 “确认授权”；
    
3.  同时会给予一张访客卡，访客卡就相当于 “访问令牌”；
    
4.  我们能够凭借访客卡进入客户公司，但仅能访问部分区域，有 “权限范围”；
    
5.  这张访客卡具有有效期，离开时必须要进行归还；
    

2.4 授权模式
--------

在上述的环节中，在资源所有者进行授权后获取访问令牌的环节至关重要。OAuth2.0 定义了四种授权模式，适用于不同场景：

*   **密码模式（Resource Owner Password Credentials Grant）**
    
*   **客户端凭证模式（Client Credentials Grant）**
    
*   **隐式授权模式（Implicit Grant）**
    
*   **授权码模式（Authorization Code Grant）**
    

无论采用哪种方式，客户端在申请令牌前，都必须先进行备案，表明自身身份，随后将获得两个身份识别码：**客户端 ID（client_id）**和**客户端密钥（client_secret）**。这是为了防止令牌被滥用，未备案的第三方应用无法获取令牌。

> 例如，在我们的 App 接入微信授权登录时，需要先在微信开放平台创建对应的应用，此时会生成一个 AppId（客户端 ID）和 App Secret（客户端密钥），用于在整个授权流程中明确请求的来源是特定的已备案应用，防止未经授权的应用冒用微信授权登录接口。

在了解授权模式之前，我们需要先了解下在 OAuth2.0 授权过程中的几个重要参数：

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">参数名</th><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">作用</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">grant_type</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">指定使用的授权类型，例如 authorization_code（授权码模式）、password（密码模式）、client_credentials（客户端凭证模式）、implicit（隐式授权模式）、refresh_token（刷新令牌模式）等</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">client_id</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">客户端的标识符，用于标识客户端的身份</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">client_secret</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">客户端的密钥，用于对客户端进行身份验证（并非在所有模式中都需要）</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">redirect_uri</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">客户端提供的重定向 URI，对于 Web 应用，授权服务器在完成授权流程后会将用户重定向到该地址</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">response_type</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">授权类型，比如：code 表示要求返回授权码，token 表示直接返回令牌</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">scope</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">表示权限范围，如读取用户资料、修改用户数据等不同的权限级别，不同的服务提供商可能会定义自己独特的 <code>scope</code> 名称和含义，以满足其特定的业务需求和安全策略</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">state</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">应用程序传递的随机数，用于防范 CSRF<code>（Cross-Site Request Forgery，跨站请求伪造）</code>攻击，客户端在发起请求时生成并携带，授权服务器在重定向时原样返回，客户端通过验证该值是否一致来确保请求的合法性</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">token_type</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">用于指定所获取的令牌的类型，例如常用的 Bearer token（不记名令牌，只要持有这个令牌，就被认为有权访问相应的资源，而无需进一步的身份验证）</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">expires_in</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">令牌有效时长（秒）</td></tr></tbody></table>

### 2.4.1 密码模式（Resource Owner Password Credentials Grant）

密码模式很好理解，客户端让用户输入用户名和密码，然后客户端会使用这些凭据向授权服务器发送请求，获取访问令牌。

流程相对简单直接，不需要复杂的重定向和交互步骤，但是因为客户端可能不可信或者存在安全漏洞，所以会存在密码泄露的风险。因此，一般情况下尽量避免使用这种模式，只有在其他授权方式不可用且**客户端是用户高度信任**的情况下才考虑使用。

#### 2.4.1.1 时序图

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHricCaVV5EoI4ms9A57icqySPh0Q9yhiakyqWAczQ6LrxnL0WfX43KEK3A/640?wx_fmt=png&from=appmsg)密码模式

#### 2.4.1.2 举例

假如一家公司开发了一个内部的项目管理工具，员工需要访问公司特定的资源来完成工作任务。由于该工具是公司自主开发并且在公司的安全管控范围内，员工需要使用其公司的用户名和密码通过密码模式获取访问令牌，以访问相关的项目数据和资源：

1.  用户在项目管理工具的客户端中输入自己公司的用户名和密码；
    
2.  项目管理工具的客户端会向公司的授权服务器发送请求，示例如下：
    

```
// 令牌端点地址
POST https://api.serviceprovider.com/auth/token 

// 参数
grant_type=password
username=USERNAME
password=PASSWORD
client_id=CLIENT_ID
client_secret=CLIENT_SECRET // (可选，取决于授权服务器的要求)
```

3.  公司的授权服务器验证用户提供的用户名和密码。如果验证通过，它会向项目管理工具客户端返回访问令牌，示例如下：
    

```
{    "access_token": ACCESS_TOKEN}
```

4.  项目管理工具客户端使用获取到的访问令牌向公司的资源服务器发送请求，以获取或操作公司特定的资源来完成工作任务；
    

### 2.4.2 客户端凭证模式（Client Credentials Grant）

客户端凭证模式模式**不需要资源所有者（用户）参与**，适用于客户端代表自己访问受保护资源，而不是代表资源所有者（用户）的场景。客户端向授权服务器直接进行身份验证，提供其客户端 ID 和客户端密钥，不需要资源所有者（用户）的授权。

这种模式适用于不同的后端服务或系统之间进行安全的资源访问，这种方式给出的令牌，是针对客户端的，而不是针对用户的，即有可能多个用户共享同一个令牌。

#### 2.4.2.1 时序图

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHVbRLTxFYH03aq3VyQnzjl7VJbPxAiagaaMRn7CazRjsmxqpyMiaLkNZQ/640?wx_fmt=png&from=appmsg)客户端凭证模式

#### 2.4.2.2 举例

例如，在一个企业的内部系统中，有一个数据处理服务需要定期从数据存储服务中获取数据进行分析。这两个服务都在企业的安全控制范围内，并且数据处理服务不需要代表任何特定用户操作，此时可以使用客户端凭证模式，让数据处理服务通过提供其客户端凭证来获取访问令牌，从而访问所需的数据：

1.  客户端直接使用客户端 ID 和客户端密钥向授权服务器发送请求，示例如下：
    

```
// 示例的令牌端点地址
POST https://api.serviceprovider.com/auth/token 

// 参数
grant_type=client_credentials
client_id=CLIENT_ID
client_secret=CLIENT_SECRET // (可选，取决于授权服务器的要求)
```

2.  授权服务器接收到请求后，会验证客户端 ID 和客户端密钥的有效性，验证通过，授权服务器会生成一个访问令牌，示例如下：
    

```
{   "access_token": ACCESS_TOKEN}
```

3.  数据处理服务收到访问令牌后，将其存储在安全的位置，之后数据处理服务可以携带访问令牌向数据存储服务发送请求获取数据；
    

### 2.4.3 隐式授权模式（Implicit Grant）

隐式授权模式主要适用于基于浏览器的应用程序，特别是那些没有后端服务器的纯前端应用。这种模式相比于下面要介绍的授权码模式，少了获取授权码这一环节，所以称为隐式授权模式。

#### 2.4.3.1 时序图

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHmAw0Wtv6geRubG6HiaBfNweK9vFWpN7PBzROfAOpI0Qg4C1eF1cYppw/640?wx_fmt=png&from=appmsg)隐式授权模式

#### 2.4.3.2 举例

例如，一个在线图片查看的单页应用（SPA），想要获取用户在图片存储服务中的访问权限来展示用户的图片。它可以使用隐式授权模式，将用户重定向到图片存储服务的授权页面，用户同意后直接获取访问令牌并在前端使用该令牌获取图片数据：

1.  用户打开这个在线图片查看的单页应用，在加载时，就会准备好与图片存储服务进行授权交互所需的参数；
    
2.  单页应用将浏览器重定向到授权服务器的授权端点，示例如下：
    

```
// 在隐式授权模式中，通常不需要 `client_secret` 。这是因为隐式授权模式直接将访问令牌返回给单页应用，并且整个过程都在浏览器中进行。如果包含 `client_secret` ，会增加其暴露的风险。
https://image-storage-service.com/auth
?response_type=token
&client_id=CLIENT_ID
&scope=read_user_images
&redirect_uri=https://your-picture-viewing-app.com/callback
```

3.  用户在授权服务器上通过身份验证后，会看到一个授权页面，上面会列出请求的权限，比如 “读取用户的图片”。如果用户同意授权，授权服务器将用户的浏览器重定向到单页应用指定的`redirect_uri`，并在锚点部分拼上访问令牌：
    

```
https://your-picture-viewing-app.com/callback#access_token=ACCESS_TOKEN
```

4.  单页应用通过 JavaScript 代码监听 URL 的变化，当检测到重定向回来的 URL 时，从中提取出访问令牌；
    
5.  接下来，单页应用使用提取到的访问令牌向图片存储服务的资源端点发送请求，图片存储服务接收到带有访问令牌的请求后，验证令牌的有效性和权限。如果一切正常，就会向单页应用返回用户授权范围内的图片数据；
    

> 注意：上面的示例中，返回访问令牌的位置是在 URL 的锚点（# 携带参数），不是查询参数部分。是因为 OAuth2.0 允许跳转网址是 HTTP 协议，存在 “中间人攻击” 风险，而浏览器跳转时，锚点并不会发送到浏览器，减少了令牌泄露的风险。

### 2.4.4 授权码模式（Authorization Code Grant）

授权码方式是指客户端首先需要申请一个**授权码**，随后**凭借该授权码来获取访问令牌**。此模式适用于拥有后端的应用。在这一过程中，授权码由应用端进行传递，而访问令牌则存储于服务端，并且所有与资源服务器的通信操作均在后端完成。这种前后端分离的架构，可以有效地防止令牌的泄漏。

**该模式主要特点如下：**

1.  安全性高：通过分离授权码和访问令牌的获取过程，减少了令牌泄露的风险；
    
2.  支持后端交互：适用于有后端服务器的客户端应用，后端可以安全地处理和存储敏感信息；
    
3.  被广泛应用：常用于需要较高安全性和复杂权限管理的应用，如大型 Web 应用、移动应用等；
    
4.  灵活的权限控制：可以精确控制请求的权限范围；
    

### 2.4.4.1 时序图

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdH3iaTOlOOcHYJwEq1bXE4VTHbaib42luASdOLiaSictodlicVZsoAGTs8ICg/640?wx_fmt=png&from=appmsg)授权码模式

**目前微信 OAuth2.0 授权登录所支持的正是这种模式。所以，我们直接以移动应用 / 网页应用微信登录为例，结合微信提供的开发指南，理解下授权码模式的整个交互流程。**

#### 2.4.4.2 移动应用微信授权流程说明

在 App 接入微信登录的时候，我们需要先在微信开放平台上注册应用，获取应用的 AppId（应用 ID）和 AppSecret（应用密钥）：

*   AppId 作为应用的唯一标识，在整个授权流程中用于明确请求的来源是特定的已备案应用；
    
*   App Secret 作为一种安全凭证，与 AppId 配合使用，确保应用在与微信开放平台进行交互时的合法性和安全性；
    

**第一步：请求用户授权**（上面时序图中的第 1-3 步）

在集成微信 SDK 并拥有相关授权域权限之后，需要调用微信 SDK 的方法拉起微信 App 进行授权登录，代码示例如下：

```
/*appid: 应用唯一标识，在微信开放平台提交应用审核通过后获得；scope: 应用授权作用域，获取用户个人信息则填写 snsapi_userinfo；state: 用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止 CSRF 攻击（跨站请求伪造攻击）；*/// iOS平台应用{ //构造SendAuthReq结构体 SendAuthReq *req = [[SendAuthReq alloc] init]; req.scope = @"snsapi_userinfo"; // 只能填 snsapi_userinfo req.state = @"wechat_sdk_demo_test";         //第三方向微信终端发送一个SendAuthReq消息结构 [WXApi sendReq:req];}// Android 平台应用{ // send oauth request Final SendAuth.Req req = new SendAuth.Req(); req.scope = "snsapi_userinfo"; // 只能填 snsapi_userinfo req.state = "wechat_sdk_demo_test"; api.sendReq(req);}
```

上面的代码会拉起微信 App，并打开用户授权页面（也就是我们文章最上面，以转转 App 使用微信授权登录的例子中的页面）。

**第二步：授权并返回授权码**（上面时序图中的第 4-5 步）

用户需要在微信登录后才能进行授权。当用户点击允许授权之后，微信 SDK 会通过 SendAuth 的 Resp 返回数据给调用方 App，返回的数据结构如下：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHs3gjTGx6HaNvGMaicts73fPEmquEJkRLzicEobOeuPB9GgfFHeKTybwA/640?wx_fmt=png&from=appmsg)微信授权返回数据

如果用户同意授权，在微信回调的数据中就可以获取到授权码（code），可以继续进行之后的授权流程了。

**第三步：通过授权码获取访问令牌**（上面时序图中的第 6-9 步）

App 端在获得授权码之后，需要传递给服务端，服务端需要访问微信的令牌端点来获取 access_token:

```
https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
```

返回的数据示例如下：

```
{  "access_token": ACCESS_TOKEN,  "expires_in": 7200,  "refresh_token": REFRESH_TOKEN,  "openid": OPENID,  "scope": "snsapi_userinfo",  "unionid": UNIONID}
```

**第四步：通过访问令牌获取用户信息**（上面时序图中的第 10-12 步） 拿到访问令牌之后，服务端就可以访问用户在微信中的资源了，微信提供了如下几个接口：

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNN8PVkLmJXK2TsoicjNKtrFdHkQ2UprCwCBEYGHVoTCvy1dQQlwj1PpC0ibXlCbRYaDcqeYCwhnM8cmA/640?wx_fmt=png&from=appmsg)微信相关接口

#### 2.4.1.3 网站应用微信授权流程说明

网站应用微信授权流程和移动应用微信授权流程大体相同，只是在获取授权码的方式上有所不同：移动应用需要集成微信 SDK，网站应用则需要访问微信授权服务提供的授权端点，获取授权码，如下所示：

```
https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect
```

当用户允许授权后，会重定向到 redirect_uri 的网址上，并且也会带上授权码（code）和 state 参数：

```
redirect_uri?code=CODE&state=STATE
```

之后的流程就和移动应用微信授权流程相同了，到现在我们已经了解了微信授权登录的整个授权流程了，那第三方授权登录最后的登录步骤是如何实现的呢？

3. 登录流程
=======

每个用户在资源服务器中都会有一个唯一的 ID，服务端可以将这个唯一的 ID 作为用户表的字段存储起来。

我们还以微信登录为例，通过授权码获取访问令牌时，返回的数据如下：

```
{   "access_token": "ACCESS_TOKEN", // 访问令牌  "expires_in": 7200, // 访问令牌超时时间  "refresh_token": "REFRESH_TOKEN", // 用于刷新 access_token  "openid": "OPENID", // 授权用户唯一标识  "scope": "snsapi_userinfo", // 用户授权的作用域  "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL" // 用户统一标识。针对一个微信开放平台账号下的应用，同一用户的 unionid 是唯一的}
```

我们需要关注下面👇的两个 id：

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">名称</th><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">描述</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">openid</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">每个用户针对每个微信公众号或小程序、应用都会有一个唯一的 openid，同一个人使用不同的小程序、应用，就会有不同的 openid；</td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">unionid</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">针对一个微信开放平台账号下的所有应用的同一个用户的统一标识，可以通过 unionid 实现不同应用、小程序之间的数据互通；</td></tr></tbody></table>

当用户使用微信授权登录时，服务端可以根据公司的业务场景，选择 openid 或者 unionid 对用户的注册和登录行为进行处理：

*   **如果是新用户首次使用微信登录：**
    

*   检查数据库中是否已存在该 openid 或 unionid；
    
*   若不存在，将获取到的 openid 或 unionid 以及用户可能补充的其他信息（如用户名、邮箱等）插入到用户表中，完成注册；
    

*   **如果用户之前已注册过（通过微信登录）：**
    

*   通过 openid 或 unionid 获取用户的相关信息，完成登录；
    

4. 刷新令牌
=======

我们可以看到上面微信返回的数据示例中，除了访问令牌（access_token）之外，还有一个刷新令牌（refresh_token，授权服务器可选返回）。

刷新令牌（refresh token）具有以下作用：

1.  **延长访问权限**：当访问令牌（access token）过期时，客户端可以使用刷新令牌向授权服务器请求新的访问令牌，而无需用户再次进行授权操作。这对于需要持续访问受保护资源的应用非常重要，避免了因频繁要求用户重新登录而带来的不良用户体验；
    
2.  **提高安全性**：限制令牌有效期。访问令牌通常具有较短的有效期，而刷新令牌的有效期相对较长。这种设计可以在一定程度上降低令牌被滥用的风险。即使访问令牌被窃取，其有效期较短，攻击者能够利用的时间窗口较小。而刷新令牌存储在更安全的位置，并且只有在满足一定的安全条件下才能使用；
    
3.  **增强应用的可管理性**：对于拥有多个客户端或复杂系统架构的应用，授权服务器可以通过管理刷新令牌来集中控制对资源的访问。例如，可以撤销特定的刷新令牌，从而立即停止对相应资源的访问；
    

刷新令牌的存在使得客户端可以在用户不参与的情况下，获取新的访问令牌，从而无缝地访问受保护的资源。这种方法提高了用户体验，同时也保证了令牌的安全性和新鲜度。

然而，如果刷新令牌被泄露或盗用，攻击者可以持续获取新的访问令牌，所以对于有后端服务器的应用来说，将刷新令牌存储在服务端的加密数据库中是一种较为安全的选择，当应用检测到当前的访问令牌已过期或者即将过期时，可以向服务端发起一个请求，获取新的访问令牌。

5. 总结
=====

本文以应用接入微信授权登录为切入点，结合微信所提供的移动应用微信登录开发指南，通过对微信文档中的授权步骤进行对比和分析，讲解了 OAuth2.0 的授权流程，期望大家皆能有所收获。

总结如下：

1.  OAuth2.0 是一个业界标准的授权协议，用于授权第三方应用安全访问另一个系统的资源；
    
2.  移动应用 \ 网页应用微信登录都是基于 OAuth2.0 协议标准构建的微信 OAuth2.0 授权登录系统；
    
3.  OAuth2.0 提供了四种授权方式，微信 OAuth2.0 授权登录目前支持授权码模式：客户端首先需申请一个授权码，随后凭借该授权码来获取访问令牌；
    
4.  访问令牌（Access Token）用于获取受保护的资源，刷新令牌（Refresh Token）用于获取新的访问令牌；
    

  

想了解更多转转公司的业务实践，点击关注下方的公众号吧！