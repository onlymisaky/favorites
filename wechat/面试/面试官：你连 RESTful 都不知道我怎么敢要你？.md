> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ic-q-avp_B3jEIKg5p5DsA)

点击上方 “dotNET 全栈开发”，“[设为星标](http://mp.weixin.qq.com/s?__biz=MzU0MzQ5MDA0Mw==&mid=2247484785&idx=1&sn=adfe86f12ffd8ab255e635cac5db67f5&chksm=fb0befe5cc7c66f3a7c5e132f6005135f530d1dbc1788da00382307b1c325ac3fa600ce8f9d8&scene=21#wechat_redirect)”

加个 “星标****★****”，每天 11.50，好文必达

全文约 **4000** 字，预计阅读时间 **8** 分钟

面试官：了解 RESTful 吗？  
我：听说过。  
面试官：那什么是 RESTful？  
我：就是用起来很规范，挺好的  
面试官：是 RESTful 挺好的，还是自我感觉挺好的  
我：都挺好的。  
面试官：... 把门关上。  
我：.... 要干嘛？先关上再说。  
面试官：我说出去把门关上。  
我：what ？，夺门而去  

![](https://mmbiz.qpic.cn/mmbiz_jpg/WUodTDPB6EIMw4re1QAzsdRzNHyo0BR1S6PxPwXmZkyOWZL8vRkiawpmbSYq7gSvicJk38iadCphgwSCeMqCdrBow/640?wx_fmt=jpeg)

01 前言
=====

回归正题，看过很多 RESTful 相关的文章总结，参齐不齐，结合工作中的使用，非常有必要归纳一下关于 RESTful 架构方式了，RESTful 只是一种架构方式的约束，给出一种约定的标准，完全严格遵守 RESTful 标准并不是很多，也没有必要。但是在实际运用中，有 RESTful 标准可以参考，是十分有必要的。

实际上在工作中对 api 接口规范、命名规则、返回值、授权验证等进行一定的约束，一般的项目 api 只要易测试、足够安全、风格一致可读性强、没有歧义调用方便我觉得已经足够了，接口是给开发人员看的，也不是给普通用户去调用。

02 RESTful 的来源
==============

REST：Representational State Transfer（表象层状态转变），如果没听说过 REST，你一定以为是 rest 这个单词，刚开始我也是这样认为的，后来发现是这三个单词的缩写，即使知道了这三个单词理解起来仍然非常晦涩难懂。如何理解 RESTful 架构，最好的办法就是深刻理解消化 Representational State Transfer 这三个单词到底意味着什么。

1. 每一个 URI 代表一种资源；  
2. 客户端和服务器之间，传递这种资源的某种表现层；  
3. 客户端通过四个 HTTP 动词（get、post、put、delete），对服务器端资源进行操作，实现” 表现层状态转化”。  

是由美国计算机科学家 Roy Fielding（百度百科没有介绍，真是尴尬了）。Adobe 首席科学家、Http 协议的首要作者之一、Apache 项目联合创始人。

03 RESTful6 大原则
===============

REST 之父 Roy Fielding 在论文中阐述 REST 架构的 6 大原则。

1. C-S 架构
---------

数据的存储在 Server 端，Client 端只需使用就行。两端彻底分离的好处使 client 端代码的可移植性变强，Server 端的拓展性变强。两端单独开发，互不干扰。

2. 无状态
------

http 请求本身就是无状态的，基于 C-S 架构，客户端的每一次请求带有充分的信息能够让服务端识别。请求所需的一些信息都包含在 URL 的查询参数、header、body，服务端能够根据请求的各种参数，无需保存客户端的状态，将响应正确返回给客户端。无状态的特征大大提高的服务端的健壮性和可拓展性。

当然这总无状态性的约束也是有缺点的，客户端的每一次请求都必须带上相同重复的信息确定自己的身份和状态（这也是必须的），造成传输数据的冗余性，但这种确定对于性能和使用来说，几乎是忽略不计的。

3. 统一的接口
--------

这个才是 REST 架构的核心，统一的接口对于 RESTful 服务非常重要。客户端只需要关注实现接口就可以，接口的可读性加强，使用人员方便调用。

4. 一致的数据格式
----------

服务端返回的数据格式要么是 XML，要么是 Json（获取数据），或者直接返回状态码，有兴趣的可以看看博客园的开放平台的操作数据的 api，post、put、patch 都是返回的一个状态码 。

自我描述的信息，每项数据应该是可以自我描述的，方便代码去处理和解析其中的内容。比如通过 HTTP 返回的数据里面有 [MIME type] 信息，我们从 MIME type 里面可以知道数据的具体格式，是图片，视频还是 JSON，客户端通过 body 内容、查询串参数、请求头和 URI（资源名称）来传送状态。服务端通过 body 内容，响应码和响应头传送状态给客户端。这项技术被称为超媒体（或超文本链接）。

除了上述内容外，HATEOS 也意味着，必要的时候链接也可被包含在返回的 body（或头部）中，以提供 URI 来检索对象本身或关联对象。下文将对此进行更详细的阐述。

如请求一条微博信息，服务端响应信息应该包含这条微博相关的其他 URL，客户端可以进一步利用这些 URL 发起请求获取感兴趣的信息，再如分页可以从第一页的返回数据中获取下一页的 URT 也是基于这个原理。

4. 系统分层
-------

客户端通常无法表明自己是直接还是间接与端服务器进行连接，分层时同样要考虑安全策略。

5. 可缓存
------

在万维网上，客户端可以缓存页面的响应内容。因此响应都应隐式或显式的定义为可缓存的，若不可缓存则要避免客户端在多次请求后用旧数据或脏数据来响应。管理得当的缓存会部分地或完全地除去客户端和服务端之间的交互，进一步改善性能和延展性。

6. 按需编码、可定制代码（可选）
-----------------

服务端可选择临时给客户端下发一些功能代码让客户端来执行，从而定制和扩展客户端的某些功能。比如服务端可以返回一些 Javascript 代码让客户端执行，去实现某些特定的功能。提示：REST 架构中的设计准则中，只有按需编码为可选项。如果某个服务违反了其他任意一项准则，严格意思上不能称之为 RESTful 风格。

03 RESTful 的 7 个最佳实践
====================

1. 版本
-----

如 github 开放平台 https://developer.github.com/v3/  
就是将版本放在 url，简洁明了，这个只有用了才知道，一般的项目加版本 v1，v2，v3? 好吧，这个加版本估计只有大公司大项目才会去使用，说出来不怕尴尬，我真没用过。有的会将版本号放在 header 里面，但是不如 url 直接了当。

```
https://example.com/api/v1/
```

2. 参数命名规范
---------

query parameter 可以采用驼峰命名法，也可以采用下划线命名的方式，推荐采用下划线命名的方式，据说后者比前者的识别度要高，可能是用的人多了吧，因人而异，因团队规范而异吧

```
https://example.com/api/users/today_login 获取今天登陆的用户https://example.com/api/users/today_login&sort=login_desc 获取今天登陆的用户、登陆时间降序排列
```

3.url 命名规范
----------

API 命名应该采用约定俗成的方式，保持简洁明了。在 RESTful 架构中，每个 url 代表一种资源所以 url 中不能有动词，只能有名词，并且名词中也应该使用复数。实现者应使用相应的 Http 动词 GET、POST、PUT、PATCH、DELETE、HEAD 来操作这些资源即可

不规范的的 url，冗余没有意义，形式不固定，不同的开发者还需要了解文档才能调用。

```
https://example.com/api/getallUsers GET 获取所有用户https://example.com/api/getuser/1 GET 获取标识为1用户信息https://example.com/api/user/delete/1 GET/POST 删除标识为1用户信息https://example.com/api/updateUser/1 POST 更新标识为1用户信息https://example.com/api/User/add POST 添加新的用户
```

规范后的 RESTful 风格的 url，形式固定，可读性强，根据 users 名词和 http 动词就可以操作这些资源

```
https://example.com/api/users GET 获取所有用户信息https://example.com/api/users/1 GET 获取标识为1用户信息https://example.com/api/users/1 DELETE 删除标识为1用户信息https://example.com/api/users/1 Patch 更新标识为1用户部分信息,包含在body中https://example.com/api/users POST 添加新的用户
```

4. 统一返回数据格式
-----------

对于合法的请求应该统一返回数据格式，这里演示的是 json

*   code——包含一个整数类型的 HTTP 响应状态码。
    
*   status——包含文本：”success”，”fail” 或”error”。HTTP 状态响应码在 500-599 之间为”fail”，在 400-499 之间为”error”，其它均为”success”（例如：响应状态码为 1XX、2XX 和 3XX）。这个根据实际情况其实是可要可不要的。
    
*   message——当状态值为”fail” 和”error” 时有效，用于显示错误信息。参照国际化（il8n）标准，它可以包含信息号或者编码，可以只包含其中一个，或者同时包含并用分隔符隔开。
    
*   data——包含响应的 body。当状态值为”fail” 或”error” 时，data 仅包含错误原因或异常名称、或者 null 也是可以的
    

返回成功的响应 json 格式

```
{  "code": 200,  "message": "success",  "data": {    "userName": "123456",    "age": 16,    "address": "beijing"  }}
```

返回失败的响应 json 格式

```
{  "code": 401,  "message": "error  message",  "data": null}
```

下面这个 ApiResult 的泛型类是在项目中用到的，拓展性强，使用方便。返回值使用统一的 ApiResult 或 ApiResult 错误返回 使用 ApiResult.Error 进行返回；成功返回，要求使用 ApiResult.Ok 进行返回

```
public class ApiResult: ApiResult    {        public new static ApiResult<T> Error(string message)        {            return new ApiResult<T>            {                Code = 1,                Message = message,            };        }        [JsonProperty("data")]        public T Data { get; set; }    }    public class ApiResult    {        public static ApiResult Error(string message)        {            return new ApiResult            {                Code = 1,                Message = message,            };        }        public static ApiResult<T> Ok<T>(T data)        {            return new ApiResult<T>()            {                Code = 0,                Message = "",                Data = data            };        }        /// <summary>        /// 0 是 正常 1 是有错误        /// </summary>        [JsonProperty("code")]        public int Code { get; set; }        [JsonProperty("msg")]        public string Message { get; set; }        [JsonIgnore]        public bool IsSuccess => Code == 0;    }
```

5. http 状态码
-----------

在之前开发的 xamarin android 博客园客户端的时候，patch、delete、post 操作时 body 响应里面没有任何信息，仅仅只有 http status code。HTTP 状态码本身就有足够的含义，根据 http status code 就可以知道删除、添加、修改等是否成功。(ps: 有点 linux 设计的味道哦，没有返回消息就是最好的消息，表示已经成功了) 服务段向用户返回这些状态码并不是一个强制性的约束。简单点说你可以指定这些状态，但是不是强制的。常用 HTTP 状态码对照表 HTTP 状态码也是有规律的

*   1** 请求未成功
    
*   2** 请求成功、表示成功处理了请求的状态代码。
    
*   3** 请求被重定向、表示要完成请求，需要进一步操作。通常，这些状态代码用来重定向。
    
*   4** 请求错误这些状态代码表示请求可能出错，妨碍了服务器的处理。
    
*   5**（服务器错误）这些状态代码表示服务器在尝试处理请求时发生内部错误。这些错误可能是服务器本身的错误，而不是请求出错。
    

6. 合理使用 query parameter
-----------------------

在请求数据时，客户端经常会对数据进行过滤和分页等要求，而这些参数推荐采用 HTTP Query Parameter 的方式实现

```
比如设计一个最近登陆的所有用户https://example.com/api/users?recently_login_day=3
```

```
搜索用户，并按照注册时间降序https://example.com/api/users?recently_login_day=3
```

```
搜索用户，并按照注册时间升序、活跃度降序https://example.com/api/users?q=key&sort=create_title_asc,liveness_desc
```

```
关于分页，看看博客园开放平台分页获取精华区博文列表https://api.cnblogs.com/api/blogposts/@picked?pageIndex={pageIndex}&pageSize={pageSize}返回示例：[ {“Id”: 1,“Title”: “sample string 2”,“Url”: “sample string 3”,“Description”: “sample string 4”,“Author”: “sample string 5”,“BlogApp”: “sample string 6”,“Avatar”: “sample string 7”,“PostDate”: “2017-06-25T20:13:38.892135+08:00”,“ViewCount”: 9,“CommentCount”: 10,“DiggCount”: 11},{“Id”: 1,“Title”: “sample string 2”,“Url”: “sample string 3”,“Description”: “sample string 4”,“Author”: “sample string 5”,“BlogApp”: “sample string 6”,“Avatar”: “sample string 7”,“PostDate”: “2017-06-25T20:13:38.892135+08:00”,“ViewCount”: 9,“CommentCount”: 10,“DiggCount”: 11}]
```

7. 多表、多参数连接查询如何设计 URL
---------------------

这是一个比较头痛的问题，在做单个实体的查询比较容易和规范操作，但是在实际的 API 并不是这么简单而已，这其中常常会设计到多表连接、多条件筛选、排序等。比如我想查询一个获取在 6 月份的订单中大于 500 元的且用户地址是北京，用户年龄在 22 岁到 40 岁、购买金额降序排列的订单列表

```
https://example.com/api/orders?order_month=6&order_amount_greater=500&address_city=北京&sort=order_amount_desc&age_min=22&age_max=40
```

从这个 URL 上看，参数众多、调用起来还得一个一个仔细对着，而且 API 本身非常不容易维护，命名看起来不是很容易，不能太长，也不能太随意。

在. net WebAPI 总我们可以使用属性路由，属性路由就是讲路由附加到特定的控制器或操作方法上装饰 Controll 及其使用 [Route] 属性定义路由的方法称为属性路由。

这种好处就是可以精准地控制 URL，而不是基于约定的路由，简直就是为这种多表查询量身定制似的的。从 webapi 2 开发，现在是 RESTful API 开发中最推荐的路由类型。我们可以在 Controll 中标记 Route

```
[Route(“api/orders/{address}/{month}”)]
```

Action 中的查询参数就只有金额、排序、年龄。减少了查询参数、API 的可读性和可维护行增强了。

```
https://example.com/api/orders/beijing/6?order_amount_greater=500&sort=order_amount_desc&age_min=22&age_max=40
```

这种属性路由比如在博客园开放的 API 也有这方面的应用，如获取个人博客随笔列表

```
请求方式：GET请求地址：https://api.cnblogs.com/api/blogs/{blogApp}/posts?pageIndex={pageIndex}(ps:blogApp：博客名)
```

![](https://mmbiz.qpic.cn/mmbiz_gif/bCceG1Whd3AxFT6SypAHrlibxVnosY0aIVKoSeuk7qO7cGU5pzQXQlTSNKD9xb5PsV0C70ZuDvjbASiaADiaicZcqQ/640?wx_fmt=gif)

![](https://mmbiz.qpic.cn/mmbiz_jpg/gak2lhVxV6Ll3Rjypick8DKRBSUpPIgFyCxeb5deosVPTBP2DJO7FENibZQVoweibm12hN3icfjxz4TVrPoZCpUVWA/640?wx_fmt=jpeg)