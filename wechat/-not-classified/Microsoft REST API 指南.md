> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/4Efn1Y9W2yxRrW2ItBkxAA)

    经过 3 个月的碎片时间的翻译和校验，由长沙. NET 技术社区翻译的英文原文文档《Microsoft REST API 指南 》已经翻译完成，现刊载前十一章如下，欢迎大家点击 “查看原文” 按钮，查看指南的完整内容。

    PS：内容很长，全文读完大概需要耗时 100 分钟。  

Microsoft REST API 指南工作组
------------------------

<table width="5619"><thead data-style="box-sizing: inherit; background-color: rgb(250, 250, 250);"><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Name</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Name</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Name</th></tr></thead><tbody><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Dave Campbell (CTO C+E)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Rick Rashid (CTO ASG)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">John Shewchuk (Technical Fellow, TED HQ)</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Mark Russinovich (CTO Azure)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Steve Lucco (Technical Fellow, DevDiv)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Murali Krishnaprasad (Azure App Plat)</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Rob Howard (ASG)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Peter Torr (OSG)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Chris Mullins (ASG)</td></tr></tbody></table>

Document editors: John Gossman (C+E), Chris Mullins (ASG), Gareth Jones (ASG), Rob Dolin (C+E), Mark Stafford (C+E)  

感谢. NET 长沙社区提供的翻译，感谢译者李文强，译者周尹   
本文首发 .NET 社区公众号，欢迎关注, 搜索 MoreDotNetCore , 里面有最新的原创性资讯，获得第一手的资料。

Microsoft REST API 指南
=====================

摘要
--

Microsoft REST API 指南作为一种设计原则，鼓励应用程序开发人员通过 RESTful HTTP 接口访问资源。

文档原则认为 REST API 应该遵循一致的设计指导原则，能为开发人员提供最流畅的体验，令使用它们变得简单和直观。

本文档建立了 Microsoft REST API 应该遵循的指导原则，以便统一一致的开发 RESTful 接口。

2. 目录
-----

*   Microsoft REST API Guidelines Working Group
    
*   1. 摘要
    
*   2. 目录
    
*   3. 介绍
    

*   3.1. 推荐阅读
    

*   4. 解读指导
    

*   4.1. 应用指导
    
*   4.2. 现有服务指南和服务版本化
    
*   4.3. 要求的语言
    
*   4.4. 许可证
    

*   5. 分类
    

*   5.1. 错误
    
*   5.2. 故障
    
*   5.3. 潜在因素
    
*   5.4. 完成时间
    
*   5.5. 长期运行的 API 故障
    

*   6. 客户端指导
    

*   6.1. 忽略规则
    
*   6.2. 变量排序规则
    
*   6.3. 无声失效规则
    

*   7. 一致性基础
    

*   7.10.1. Clients-specified response format
    
*   7.10.2. Error condition responses
    
*   7.4.1. POST
    
*   7.4.2. PATCH
    
*   7.4.3. Creating resources via PATCH (UPSERT semantics)
    
*   7.4.4. Options and link headers
    
*   7.1. 网址结构
    
*   7.2. 网址长度
    
*   7.3. 标准标识符
    
*   7.4. 支持方法
    
*   7.5. 标准请求请求头
    
*   7.6. 响应请求头
    
*   7.7. 自定义请求头
    
*   7.8. 指定头部为查询参数
    
*   7.9. PII 参数
    
*   7.10. 响应格式
    
*   7.11. HTTP 状态码
    
*   7.12. 可选的客户端库
    

*   8. CORS 跨域
    

*   8.1.1. 预检
    
*   8.1. 客户端指导
    
*   8.2. 服务端指导
    

*   9. 集合
    

*   9.8.1. Server-driven paging
    
*   9.8.2. Client-driven paging
    
*   9.8.3. Additional considerations
    
*   9.7.1. Filter operations
    
*   9.7.2. Operator examples
    
*   9.7.3. Operator precedence
    
*   9.6.1. Interpreting a sorting expression
    
*   9.3.1. Nested collections and properties
    
*   9.1. 项的 key
    
*   9.2. 序列化
    
*   9.3. 集合 URL 模式
    
*   9.4. 大集合
    
*   9.5. 修改集合
    
*   9.6. 集合排序
    
*   9.7. 过滤
    
*   9.8. 分页
    
*   9.9. 复合集合操作
    

*   10. 增量查询
    

*   10.1. 增量链接
    
*   10.2. 实体表示
    
*   10.3. 获得增量链接
    
*   10.4. 增量链接响应内容
    
*   10.5. 使用增量链接
    

*   11. JSON 标准化
    

*   11.3.1. The `DateLiteral` format
    
*   11.3.2. Commentary on date formatting
    
*   11.2.1. Producing dates
    
*   11.2.2. Consuming dates
    
*   11.2.3. Compatibility
    
*   11.1. 主要类型的 JSON 格式化标准化
    
*   11.2. 日期和时间指南
    
*   11.3. 日期和时间的 JSON 序列化
    
*   11.4. 持续时间
    
*   11.5. 间隔
    
*   11.6. 重复间隔
    

*   12. 版本
    

*   12.1.1. Group versioning
    
*   12.1. 版本格式
    
*   12.2. 版本的时间
    
*   12.3. 非延续性更改的定义
    

*   13. 长时间运行的操作
    

*   13.2.1. PUT
    
*   13.2.2. POST
    
*   13.2.3. POST, hybrid model
    
*   13.2.4. Operations resource
    
*   13.2.5. Operation resource
    
*   13.2.6. Operation tombstones
    
*   13.2.7. The typical flow, polling
    
*   13.2.8. The typical flow, push notifications
    
*   13.2.9. Retry-After
    
*   13.1. 基于资源的长时间运行 (RELO)
    
*   13.2. 分步运行的长时间操作
    
*   13.3. 操作结果保留策略
    

*   14. Throttling, Quotas, and Limits
    

*   14.4.1. Responsiveness
    
*   14.4.2. Rate Limits and Quotas
    
*   14.4.3. Overloaded services
    
*   14.4.4. Example Response
    
*   14.1. Principles
    
*   14.2. Return Codes (429 vs 503)
    
*   14.3. Retry-After and RateLimit Headers
    
*   14.4. Service Guidance
    
*   14.5. Caller Guidance
    
*   14.6. Handling callers that ignore Retry-After headers
    

*   15. 通过 webhooks 推送通知
    

*   15.7.1. Creating subscriptions
    
*   15.7.2. Updating subscriptions
    
*   15.7.3. Deleting subscriptions
    
*   15.7.4. Enumerating subscriptions
    
*   15.6.1. Notification payload
    
*   15.1. 范围
    
*   15.2. 原则
    
*   15.3. 订阅类型
    
*   15.4. 调用序列
    
*   15.5. 验证订阅
    
*   15.6. 接收通知
    
*   15.7. programmatically 订阅管理
    
*   15.8. 安全性
    

*   16. 不支持的请求
    

*   16.2.1. Error response
    
*   16.1. 基本指导
    
*   16.2. 特征允许列表
    

*   17. 命名准则
    

*   17.1. 途径
    
*   17.2. 框架
    
*   17.3. 避免的命名
    
*   17.4. 规范的复合词
    
*   17.5. 标识属性
    
*   17.6. 日期和时间属性
    
*   17.7. 属性名
    
*   17.8. 集合和计数
    
*   17.9. 共同属性命名
    

*   18. 附录
    

*   18.1.1. Push notifications, per user flow
    
*   18.1.2. Push notifications, firehose flow
    
*   18.1. 时序图注释
    

3. 引言
-----

开发人员通常通过 HTTP 接口访问大多数微软云平台资源。虽然每个服务通常提供特定于语言框架来包装其 API，但它们的所有操作最终都归结为 HTTP 请求。微软必须支持广泛的客户端和服务，不能依赖于每个开发环境都有丰富的框架。因此，本指导原则的目标是确保 Microsoft REST API 能够被任何具有基本 HTTP 支持的客户端轻松且一致地使用。  
[*] 译者注：本指南不限于微软技术和平台，广泛适应于各种语言和平台。

为了给开发人员提供最流畅的体验，让这些 API 遵循统一的设计准则是很重要的，从而使其简单易用，符合人们的直觉反应。本文档建立了 Microsoft REST API 开发人员应该遵循的指南, 以便统一一致地开发 API。

一致性的好处在于可以不断地积累合理的规范; 一致性使团队拥有统一的代码、模式、文档风格和设计策略。

这些准则旨在达成如下目标：

*   为 Microsoft 技术平台所有 API 端点定义一致的实现和体验。
    
*   尽可能地遵循行业普遍接受的 REST/HTTP 最佳实践。
    
*   让所有应用开发者都可以轻松的通过 REST 接口访问 Micosoft 服务。
    
*   允许 Service 开发者利用其他 Service 的基础上来开发一致的 REST API 端点。
    
*   允许合作伙伴 (例如, 非 Micosoft 团队) 使用这些准则来设计自己的 REST API。  
    [*] 注：本指南旨在构建符合 REST 架构风格的服务，但不涉及或要求构建遵循 REST 约束的服务。  
    本文档中使用的 “REST” 术语代指具有 RESTful 风格的服务，而不是仅仅遵循 REST。
    

### 3.1 推荐阅读

了解 REST 架构风格背后的理念，更有助于开发优秀的基于 HTTP 的服务。  
如果您对 RESTful 设计不熟悉，请参阅以下优秀资源：

*   REST on Wikipedia — 维基百科上关于 REST 的核心概念与思想的介绍。
    
*   REST 论文—— Roy Fielding 网络架构论文中关于 REST 的章节，“架构风格与基于网络的软件体系结构设计”
    
*   RFC 7231—— 定义 HTTP/1.1 语义规范的权威资源。
    
*   REST 实践—— 关于 REST 的基础知识的入门书。
    

[*] 译者注：上一篇说了，REST 指的是一组架构约束条件和原则。那么满足这些约束条件和原则的应用程序或设计就是 RESTful。

4. 解读指导
-------

### 4.1 应用指南

这些准则适用于 Microsoft 或任何合作伙伴服务公开的任何 REST API。私有或内部 API 也应该尝试遵循这些准则，因为内部服务最终可能会被公开。保证一致性不仅对外部客户有价值，对内部服务使用者也很有价值，而这些准则为对任何服务都提供了最佳实践。  
有合理理由可不遵循这些准则。如：实现或必须与某些外部定义的 REST API 互操作的 REST 服务必须与哪些外部的 API 兼容，而无法遵循这些准则。而还有一些服务也可能具有需要特殊性能需求，必须采用其他格式，例如二进制协议。

### 4.2 现有服务和服务版本控制的指南

我们不建议仅仅为了遵从指南而对这些指南之前的旧服务进行重大更改。无论如何，当兼容性被破坏时，该服务应该尝试在下一版本发布时变得合规。  
当一个服务添加一个新的 API 时，该 API 应该与同一版本的其他 API 保持一致。  
因此，如果服务是针对 1.0 版本的指南编写的，那么增量添加到服务的新 API 也应该遵循 1.0 版本指南。然后该服务在下一次主要版本更新时，再去遵循最新版指南。

### 4.3 要求语言

本文档中的”MUST”（必须）, “MUST NOT”（禁止）, “REQUIRED”（需要）, “SHALL”（将要）, “SHALL NOT”（最好不要）, “SHOULD”（应该）, “SHOULD NOT”（不应该）, “RECOMMENDED”（推荐）, “MAY”（可能）, 和 “OPTIONAL”（可选） 等关键字的详细解释见 RFC 2119。

### 4.4 许可证

本作品根据知识共享署名 4.0 国际许可协议授权。如需查看本授权的副本，请访问 http://creativecommons.org/licenses/by/4.0/ 或致函 PO Box 1866, Mountain View, CA 94042, USA.

[*] 译者注：署名 4.0 国际，也就是允许在任何媒介以任何形式复制、发行本作品，允许修改、转换或以本作品为基础进行创作。允许任何用途，甚至商业目的。

5. 分类
-----

作为 Microsoft REST API 指南的一部分，服务必须符合下面定义的分类法。

### 5.1 错误

错误，或者更具体地说是服务错误，定义为因客户端向服务传递错误数据，导致服务端拒绝该请求。示例包括无效凭证、错误的参数、未知的版本 ID 等。客户端传递错误的或者不合法的数据的情况通常返回 “4XX” 的 HTTP 错误代码。

错误不会影响 API 的整体可用性。

[*]译者注：错误可以理解成客户端参数错误，通常返回 “4XX” 状态码，并不影响整体的 API 使用。

### 5.2 故障

故障（缺陷），或者更具体地说是服务故障，定义为服务无法正确返回数据以响应有效的客户端请求。通常会返回 “5xx”HTTP 错误代码。

故障会影响整体 API 的可用性。  
由于速率限制（限流）或配额故障而失败的调用不能算作故障。由于服务快速失败 (fast-failing) 请求 (通常是为了保护自己) 而失败的调用会被视为故障。

[*] 译者注：故障意味着服务端代码出现故障，可能会影响整体的 API 使用。比如数据库连接超时。  
fast-failing 快速失败  
safe-failing 安全失败

### 5.3 延迟

延迟定义为特定的 API 调用完成所需的时间 (尽可能使用客户端调用进行测量)。此测量方法同样适用于同步和异步的 API。对于长时间运行(long running calls) 的调用，延迟定义为第一次调用它所需的时长，而不是整个操作)完成所需的时间。

[*] 译者注：Latency（延迟）是衡量软件系统的最常见的指标之一，不仅仅和系统、架构的性能相关，还和网络传输和延迟有关系。

### 5.4 完成时间

暴露长时间操作的服务必须跟踪这些操作的 “完成时间” 指标。

### 5.5 长期运行 API 故障

对于长期运行的 API，很可能出现第一次请求成功，且后续每次去获取结果时 API 也处于正常运行（每次都回传 200）中，但其底层操作已经失败了的情况。长期运行故障必须作为故障汇总到总体可用性指标中。

6. 客户端指导
--------

为确保客户端更好的接入 REST 服务，客户端应遵循以下最佳实践:

### 6.1 忽略规则

对于松散耦合的客户端调用，在调用之前不知道数据的确切定义和格式，如果服务器没用返回客户端预期的内容，客户端必须安全地忽略它。

在服务迭代的过程中，有些服务（接口）可能在不更改版本号的情况下向响应添加字段。此类服务必须在其文档中注明，客户端必须忽略这些未知字段。

[*] 译者注：一个已发布的在线接口服务，如果不修改版本而增加字段，那么一定不能影响已有的客户端调用。

### 6.2 变量排序规则

客户端处理响应数据时一定不能依赖服务端 JSON 响应数据字段的顺序。例如，例如，当服务器返回的 JSON 对象中的字段顺序发生变化，客户端应当能够正确进行解析处理。  
当服务端支持时，客户端可以请求以特定的顺序返回数据。例如，服务端可能支持使用 $orderBy querystring 参数来指定 JSON 数组中元素的顺序。  
服务端也可以在协议中显式说明指定某些元素按特定方式进行排序。例如，服务端可以每次返回 JSON 对象时都把 JSON 对象的类型信息作为第一个字段返回，进而简化客户端解析返回数据格式的难度。客户端处理数据时可以依赖于服务端明确指定了的排序行为。

### 6.3 无声失效规则

当客户端请求带可选功能参数的服务时（例如带可选的头部信息），必须对服务端的返回格式有一定兼容性，可以忽略某些特定功能。

[*] 译者注：例如分页数、排序等自定义参数的支持和返回格式的兼容。

7. 基础原则
-------

### 7.1 URL 结构

URL 必须保证友好的可读性与可构造性，人类应该能够轻松地读取和构造 url。:)  
这有助于用户发现并简化接口的调用，即使平台没有良好的客户端 SDK 支持。  
[*] 译者注：API URL 路径结构应该是友好的易于理解的。甚至用户无需通过阅读 API 文档能够猜出相关结构和路径。

结构良好的 URL 的一个例子是:  
https://api.contoso.com/v1.0/people/jdoe@contoso.com/inbox  
[*] 译者注：通过以上 URL 我们可以获知 API 的版本、people 资源、用户标识（邮箱）、收件箱，而且很容易获知——这是 jdoe 的收件箱的 API。

一个不友好的示例 URL 是:  
https://api.contoso.com/EWS/OData/Users('jdoe@microsoft.com')/Folders('AAMkADdiYzI1MjUzLTk4MjQtNDQ1Yy05YjJkLWNlMzMzYmIzNTY0MwAuAAAAAACzMsPHYH6HQoSwfdpDx-2bAQCXhUk6PC1dS7AERFluCgBfAAABo58UAAA=')  
[*] 译者注：这是 ODATA 的 API，不过目录标识不易于理解，没什么意义。

出现的常见模式是使用 URL 作为值（参数）。服务可以使用 URL 作为值。  
例如，以下内容是可以接受的 (URL 中，url 参数传递了花式的鞋子这个资源):  
https://api.contoso.com/v1.0/items?url=https://resources.contoso.com/shoes/fancy  
[*] 译者注：Token 第三方认证中把登陆前来源地址返回给客户端。

### 7.2 URL 长度

HTTP 1.1 消息格式 (在第 3.1.1 节的 RFC 7230 中定义) 对请求没有长度限制，其中包括目标 URL。RFC 的:

> HTTP 没有对请求行长度设置预定义的限制。[… 如果服务器接收到的请求目标比它希望解析的任何 URI 都长，那么它必须使用 414 (URI 太长) 状态代码进行响应。

服务如果能够生成超过 2,083 个字符的 url，必须考虑兼容它支持的客户端。不同客户端支持的最长 URL 长度参见以下资料：

*   http://stackoverflow.com/a/417184
    
*   https://blogs.msdn.microsoft.com/ieinternals/2014/08/13/url-length-limits/
    

还请注意，一些技术栈有强制的的 URL 限定，所以在设计服务时要记住这一点。

### 7.3 规范标识符

除了提供友好的 URL 之外，能够移动或重命名的资源必须包含唯一稳定的标识符。  
在与 服务 进行交互时可能需要通过友好的名称来获取资源固定的 URL，就像某些服务使用的 “/my” 快捷方式一样。  
指南不强制要求 固定标识符使用 GUID。  
包含规范标识符的 URL 的一个例子是（标识符比较友好):  
https://api.contoso.com/v1.0/people/7011042402/inbox

[_] 译者注：一般是暴露主键字段，也可以是其他唯一的易于理解的字段，比如姓名、标题、邮箱等等。  
[_] 译者注：GUID 太长而且不易于理解和阅读，如果不是必须，尽量少用此字段。

### 7.4 支持方法

客户端必须尽可能使用正确的 HTTP 动词来执行操作，并且必须考虑是否支持此操作的幂等性。HTTP 方法通常称为 HTTP 动词。

在此上下文中，术语是同义词，但是 HTTP 规范使用术语方法。

下面是 Microsoft REST 服务应该支持的方法列表。并不是所有资源都支持所有方法，但是使用以下方法的所有资源必须符合它们的用法。

| Method | Description | Is Idempotent  
|:–|:–|  
| GET | 返回对象的当前值 | True  
| PUT | 在适用时替换对象，或创建命名对象 | True  
| DELETE | 删除对象 | True  
| POST | 根据提供的数据创建一个新对象，或者提交一个操作 | False  
| HEAD | 返回 GET 响应的对象的元数据。支持 GET 方法的资源也可能支持 HEAD 方法 | True  
| PATCH | 更新对象部分应用 | False  
| OPTIONS | 获取关于请求的信息; 详见下文。| True

#### 7.4.1 POST

POST 操作应该支持重定向响应标头（Location），以便通过重定向标头返回创建好的资源的链接。

例如，假设一个服务允许创建并命名托管服务器:

> POST http://api.contoso.com/account1/servers  
> 响应应该是这样的:

> 201 Created  
> Location:http://api.contoso.com/account1/servers/server321

其中 “server321” 是服务分配的服务器名。

服务还可以在响应中返回已创建项的完整元数据。

#### 7.4.2. PATCH

PATCH 已被 IETF 标准化为用于增量更新现有对象的方法（参见 RFC 5789）。符合 Microsoft REST API 准则的 API 应该支持 PATCH。

#### 7.4.3. Creating resources via PATCH (UPSERT semantics) 通过 PATCH 创建资源（UPSERT 定义）

允许客户端在创建资源的时候只指定部分键值（key）数据的必须支持 UPSET 语义，该服务必须支持以 PATCH 动词来创建资源。

鉴于 PUT 被定义为内容的完全替换，所以客户端使用 PUT 修改数据是危险的。

当试图更新资源时，不理解 (并因此忽略) 资源的某些属性的客户端，很可能在 PUT 上忽视这些属性，导致提交后这些属性可能在不经意间被删除。

所以，如果选择支持 PUT 来更新现有资源，则必须是完整替换 (即，PUT 之后，资源的属性必须匹配请求中提供的内容，包括删除没有提供的任何服务端的属性)。

在 UPSERT 语义下，对不存在资源的 PATCH 调用，由服务器作为 “创建” 处理，对已存在的资源的 PATCH 调用作为 “更新” 处理。  
为了确保更新请求不被视为创建（反之亦然），客户端可以在请求中指定预先定义的 HTTP 请求头。

*   如果 PATCH 请求包含 if-match 标头，则服务不能将其视为插入; 如果 PATCH 请求包含值为 “*” 的 if-none-match 头，则服务不能将其视为更新。
    

如果服务不支持 UPSERT，则针对不存在的资源的 PATCH 调用必须导致 HTTP “409 Conflict” 错误。

#### 7.4.4 Options 标头 和 link headers 标签

OPTIONS 允许客户端查询某个资源的元信息，并至少可以通过返回支持该资源的有效方法（支持的动词类别）的 Allow 标头。  
[*] 译者注：当发起跨域请求时，浏览器会自动发起 OPTIONS 请求进行检查。

此外，建议服务返回应该包括一个指向有关资源的稳定链接（Link header）(见 RFC 5988):

```
Link: <{help}>; rel="help"

```

其中 {help} 是指向文档资源的 URL。

有关选项使用的示例，请参见完善 CORS 跨域调用。

### 7.5 标准的请求标头

下面的请求标头表 应该遵循 Microsoft REST API 指南服务使用。使用这些标题不是强制性的，但如果使用它们则必须始终一致地使用。

所有标头值都必须遵循规范中规定的标头字段所规定的语法规则。许多 HTTP 标头在 RFC7231 中定义，但是在 IANA 标头注册表中可以找到完整的已批准头列表。

<table width="5619"><thead data-style="box-sizing: inherit; background-color: rgb(250, 250, 250);"><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><th align="left" data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Header 标头</th><th align="left" data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Type 类型</th><th align="left" data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Description 描述</th></tr></thead><tbody><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Authorization</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">String</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">请求的授权标头</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Date</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Date</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">请求的时间戳，基于客户端的时钟，采用 RFC 5322 日期和时间格式。服务器不应该对客户端时钟的准确性做任何假设。此标头可以包含在请求中，但在提供时必须采用此格式。当提供此报头时，必须使用格林尼治平均时间 (GMT) 作为时区参考。例如：Wed, 24 Aug 2016 18:41:30 GMT. 请注意，GMT 正好等于 UTC（协调世界时）。</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Accept</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Content type</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">响应请求的内容类型，如:</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">- application/xml</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">- text/xml</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">- application/json</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">- text/javascript (for JSONP)</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">根据 HTTP 准则，这只是一个提示，响应可能有不同的内容类型，例如 blob fetch，其中成功的响应将只是 blob 流作为有效负载。对于遵循 OData 的服务，应该遵循 OData 中指定的首选项顺序。</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Accept-Encoding</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Gzip, deflate</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">如果适用，REST 端点应该支持 GZIP 和 DEFLATE 编码。对于非常大的资源，服务可能会忽略并返回未压缩的数据。</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Accept-Language</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">“en”, “es”, etc.</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">指定响应的首选语言。不需要服务来支持这一点，但是如果一个服务支持本地化，那么它必须通过 Accept-Language 头来支持本地化。</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Accept-Charset</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Charset type like “UTF-8”</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">默认值是 UTF-8，但服务应该能够处理 ISO-8859-1</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Content-Type</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Content type</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Mime type of request body (PUT/POST/PATCH)</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Prefer</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">return=minimal, return=representation</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">如果指定了 return = minimal 首选项，则服务应该返回一个空主体（empty body）以响应一次成功插入或更新。如果指定了 return = representation，则服务应该在响应中返回创建或更新的资源。如果服务的场景中客户端有时会从响应中获益，但有时响应会对带宽造成太大的影响，那么它们应该支持这个报头。</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">If-Match, If-None-Match, If-Range</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">String</td><td align="left" data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">使用乐观并发控制支持资源更新的服务必须支持 If-Match 标头。服务也可以使用其他与 ETag 相关的头，只要它们遵循 HTTP 规范。</td></tr></tbody></table>

7.6 标准响应标头
----------

服务应该返回以下响应标头，除非在 “required” 列中注明。

| Response Header | Required | Description |  
| 响应报头 | 必填 | 描述 |  
|:–|:–|:–|  
| Date | All responses | 根据服务器的时钟，以 RFC 5322 日期和时间格式处理响应。这个头必须包含在响应中。此报头必须使用格林尼治平均时间 (GMT) 作为时区参考。例如: Wed, 24 Aug 2016 18:41:30 GMT. 请注意，GMT 正好等于协调世界时(UTC)。|  
| Content-Type | All responses| 内容类型 |  
| Content-Encoding | All responses | GZIP 或 DEFLATE，视情况而定 |  
| Preference-Applied | 在请求中指定时 | 是否应用了首选项请求头中指示的首选项 |  
| ETag | 当请求的资源具有实体标记时 | ETag 响应头字段为请求的变量提供实体标记的当前值。与 If-Match、If-None-Match 和 If-Range 一起使用，实现乐观并发控制。|

7.7. 自定义标头
----------

基本的 API 操作不应该支持自定义标头。

本文档中的一些准则规定了非标准 HTTP 标头的使用。此外，某些服务可能需要添加额外的功能，这些功能通过 HTTP 标头文件公开。以下准则有助于在使用自定义标头时保持一致性。

非标准 HTTP 标头必须具有以下两种格式之一:

1.  使用 IANA（RFC 3864）注册为 “临时” 的标头的通用格式
    
2.  为注册使用过特定的头文件的范围格式  
    这两种格式如下所述。
    

7.8. 以查询参数方式提交自定义请求头
--------------------

有些标头对某些场景 (如 AJAX 客户端) 不兼容，特别是在不支持添加标头的跨域调用时。因此，除了常见的标头信息外，一些标头信息可以允许被作为查询参数传递给服务端，其命名与请求头中的名称保持一致:

并不是所有的标头都可以用作查询参数，包括大多数标准 HTTP 标头。  
考虑何时接受标头作为参数的标准如下:

1.  任何自定义标头也必须作为参数接受。
    
2.  请求的标准标头也可以作为参数接受。
    
3.  具有安全敏感性的必需标头 (例如，授权标头 Authorization) 可能不适合作为参数; 服务所有者应该具体情况具体分析。
    

此规则的一个例外是 Accept 头。使用具有简单名称的方案，而不是使用 HTTP 规范中描述的用于 Accept 的完整功能，这是一种常见的实践。

7.9. PII 个人身份信息参数
-----------------

与普遍的隐私政策一致，客户端不应该在 URL 中传输个人身份信息 (PII) 参数(作为路径或查询参数)，因为这些信息可能通过客户端、网络和服务器日志和其他机制无意暴露出来。

因此，服务应该接受 PII 参数作为标头传输。

然而在实践中，由于客户端或软件的限制，在许多情况下无法遵循上述建议。为了解决这些限制，服务也应该接受这些 PII 参数作为 URL 的一部分，与本指导原则的其余部分保持一致。

接受 PII 参数 (无论是在 URL 中还是作为标头) 的服务 应该符合其组织的隐私保护原则。通常建议包括：客户端使用标头进行加密传输，并且实现要遵循特殊的预防措施，以确保日志和其他服务数据收集得到正确的处理。

[*] 译者注：PII——个人可标识信息。比如家庭地址，身份证信息。

7.10. Response formats 响应格式
---------------------------

一个成功的平台，往往提供可读性较好并且一致的响应结果，并允许开发人员使用公共 Http 代码处理响应。

基于 Web 的通信，特别是当涉及移动端或其他低带宽客户端时，我们推荐使用 JSON 作为传输格式。主要是由于其更轻量以及易于与 JavaScript 交互。

JSON 属性名应该采用 camelCasedE 驼峰命名规范。

服务应该提供 JSON 作为默认输出格式。

### 7.10.1 Clients-specified 客户端指定响应格式

在 HTTP 中，客户端应该使用 Accept 头请求响应格式。服务端可以选择性的忽略，如客户端发送多个 Accept 标头，服务可以选择其中一个格式进行响应。

默认的响应格式 (没有提供 Accept 头) 应该是 application/json，并且所有服务必须支持 application/json。

| Accept Header | Response type | Notes |  
| 接受标头 | 响应类型 | 备注 |  
|:–|:–|:–|  
| application/json | 必须是返回 json 格式 | 同样接受 JSONP 请求的 text/JavaScript |

```
Accept: application/json

```

### 7.10.2 错误的条件响应

对于调用不成功的情况，开发人员应该能够用相同的代码库一致地处理错误。这允许构建简单可靠的基础架构来处理异常，将异常作为成功响应的独立处理流程来处理。下面的代码基于 OData v4 JSON 规范。但是，它非常通用，不需要特定的 OData 构造。即使 api 没有使用其他 OData 结构，也应该使用这种格式。

错误响应必须是单个 JSON 对象。该对象必须有一个名为 “error” 的 名称 / 值（name/value） 对。该值必须是 JSON 对象。

这个对象必须包含名称 “code” 和“message”的 键值对，并且它建议包含譬如 “target”、“details” 和 “innererror” 的键值对。

“code”键值对的值 是一个与语言无关的字符串。它的值是该服端务定义的错误代码，应该简单可读。与响应中指定的 HTTP 错误代码相比，此代码用作错误的更具体的指示。服务应该具有相对较少的 “code” 数量(别超过 20 个)，并且所有客户端必须能够处理所有这些错误信息。  
大多数服务将需要更大数量的更具体的错误代码以满足所有的客户端请求。这些错误代码应该在 “innererror” 键值对中公开，如下所述。为现有客户端可见的“代码” 引入新值是一个破坏性的更改，需要增加版本。服务可以通过向 “innererror” 添加新的错误代码来避免中断服务更改。

“message” 键值对的值 必须是错误提示消息，必须是可读且易于理解。它旨在是帮助开发人员，不适合暴露给最终用户。想要为最终用户公开合适消息的服务必须通过 annotation 注释或其他自定义属性来公开。服务不应该为最终用户本地化 “message”，因为这样对于开发者变得非常不友好并且难以处理。

“target” 键值对的值 是指向错误的具体的目标 (例如，错误中属性的名称)。

“details”键值对的值 必须是 JSON 对象数组，其中必须包含 “code” 和“message”的键值对，还可能包含 “target” 的键值对，如上所述。“details”数组中的对象通常表示请求期间发生的不同的、相关的错误。请参见下面的例子。

“innererror”键值对的值 必须是一个对象。这个对象的内容是服务端定义的。想要返回比根级别代码更具体的错误的服务，必须包含 “code” 的键值对和嵌套的 “innererror”。每个嵌套的“innererror” 对象表示比其父对象更高层次的细节。在评估错误时，客户端必须遍历所有嵌套的 “内部错误”，并选择他们能够理解的最深的一个。这个方案允许服务在层次结构的任何地方引入新的错误代码，而不破坏向后兼容性，只要旧的错误代码仍然出现。服务可以向不同的调用者返回不同级别的深度和细节。例如，在开发环境中，最深的“innererror” 可能包含有助于调试服务的内部信息。为了防范信息公开带来的潜在安全问题，服务应注意不要无意中暴露过多的细节。错误对象还可以包括特定于代码的自定义服务器定义的键值对。带有自定义服务器定义属性的错误类型应该在服务的元数据文档中声明。请参见下面的例子。

错误响应返回的的任何 JSON 对象中都可能包含注释。

我们建议，对于任何可能重试的临时错误，服务应该包含一个 Retry-After HTTP 头，告诉客户端在再次尝试操作之前应该等待的最小秒数。

##### ErrorResponse : Object

<table width="5619"><thead data-style="box-sizing: inherit; background-color: rgb(250, 250, 250);"><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Property</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Type</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Required</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Description</th></tr></thead><tbody><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">error</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Error</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">✔</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">The error object.</td></tr></tbody></table>

##### Error : Object

<table width="5619"><thead data-style="box-sizing: inherit; background-color: rgb(250, 250, 250);"><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Property</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Type</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Required</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Description</th></tr></thead><tbody><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">code</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">String (enumerated)</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">✔</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">服务器定义的错误代码集之一。<code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">message</code></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">target</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">String</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">The target of the error.</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">details</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Error[]</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">An array of details about specific errors that led to this reported error.</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">innererror</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">InnerError</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">An object containing more specific information than the current object about the error.</td></tr></tbody></table>

##### InnerError : Object

<table width="5619"><thead data-style="box-sizing: inherit; background-color: rgb(250, 250, 250);"><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Property</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Type</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Required</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Description</th></tr></thead><tbody><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">code</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">String</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">A more specific error code than was provided by the containing error.</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><code data-style="box-sizing: inherit; font-family: Inconsolata, Monaco, Consolas, &quot;Courier New&quot;, Courier, monospace; font-size: 0.91rem; padding: 1px 5px; color: rgb(233, 105, 0); background-color: rgb(248, 248, 248); border-radius: 2px;">innererror</code></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">InnerError</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">An object containing more specific information than the current object about the error.</td></tr></tbody></table>

##### Examples

内部错误的例子:

```
{
  "error": {
    "code": "BadArgument",
    "message": "Previous passwords may not be reused",
    "target": "password",
    "innererror": {
      "code": "PasswordError",
      "innererror": {
        "code": "PasswordDoesNotMeetPolicy",
        "minLength": "6",
        "maxLength": "64",
        "characterTypes": ["lowerCase","upperCase","number","symbol"],
        "minDistinctCharacterTypes": "2",
        "innererror": {
          "code": "PasswordReuseNotAllowed"
        }
      }
    }
  }
}

```

在本例中，基本的错误代码是 “BadArgument”，但是对于感兴趣的客户端，“innererror” 中提供了更具体的错误代码。  
“passwordreusenotal” 代码可能是在之后的迭代中由该服务添加的，之前只返回 “passwordnotmeetpolicy”。  
这种增量型的添加方式并不会破坏老的客户端的处理过程，而又可以给开发者一些更详细的信息。  
“PasswordDoesNotMeetPolicy” 错误还包括额外的键值对，这些键值对 允许客户机确定服务器的配置、以编程方式验证用户的输入，或者在客户机自己的本地化消息传递中向用户显示服务器的约束。

详细的例子 “details”:

```
{
  "error": {
    "code": "BadArgument",
    "message": "Multiple errors in ContactInfo data",
    "target": "ContactInfo",
    "details": [
      {
        "code": "NullValue",
        "target": "PhoneNumber",
        "message": "Phone number must not be null"
      },
      {
        "code": "NullValue",
        "target": "LastName",
        "message": "Last name must not be null"
      },
      {
        "code": "MalformedValue",
        "target": "Address",
        "message": "Address is not valid"
      }
    ]
  }
}

```

在本例中，请求存在多处问题，每个错误都列在 “details” 字段中进行返回了。

### 7.11 HTTP 状态代码 HTTP Status Codes

应使用标准 HTTP 状态码作为响应状态码; 更多信息，请参见 HTTP 状态代码定义。

### 7.12. 客户端库可选 Client library optional

开发人员必须能够在各种平台和语言上进行开发，比如 Windows、macOS、Linux、c#、Python 和 Node.js 或是 Ruby。

服务应该能够让简单的 HTTP 工具 (如 curl) 进行访问，而不需要做太多的工作。

该服务提供给开发人员的网站应该提供相当于 “获得开发者令牌(Get developer Token) 的功能，以帮助开发人员测试并应提供 curl 支持。

8. CORS 跨域
----------

符合 Microsoft REST API 准则的服务必须支持 CORS(跨源资源共享)。  
服务应该支持 CORS * 的允许起源，并通过有效的 OAuth 令牌强制授权。  
服务不应该支持带有源验证的用户凭据。  
特殊情况可例外。

### 8.1. 客户端指导

Web 开发人员通常不需要做任何特殊处理来利用 CORS。  
作为标准 XMLHttpRequest 调用的一部分，所有握手步骤都是不可见的。

许多其他平台（如. NET）已集成了对 CORS 的支持。

#### 8.1.1. 避免额外的预检查

由于 CORS 协议会触发向服务器添加额外往返的预检请求，因此，注重性能的应用程序可能会有意避免这些请求。  
CORS 背后的精神是避免对旧的不支持 CORS 功能的浏览器能够做出的任何简单的跨域请求进行预检。  
所有其他请求都需要预检。

请求是 “简单类型请求 “，如果其方法是 GET，HEAD 或 POST，并且除了 Accept，Accept-Language 和 Content-Language 之外它不包含任何请求标头，则可以免去预检。

对于 POST 请求，也允许使用 Content-Type 标头，但前提是其值为 “application/x-www-form-urlencoded”，“multipart/form-data” 或“text/plain”。  
对于任何其他标头或值，将发生预检请求。

### 8.2. 服务指南

服务必须至少：

*   了解浏览器在跨域请求上发送的 Origin 请求标头，以及他们在检查访问权限的预检 OPTIONS 请求上发送的 Access-Control-Request-Method 请求标头。
    
*   如果请求中存在 Origin 标头：
    

*   添加一个 Access-Control-Allow-Headers 响应标头，其中包含允许客户端使用的请求标头名称列表。这个列表只需要包含不在 [简单请求头][rs-simple-headers] (Accept、Accept- language、Content-Language) 集合中的头。如果服务接受的报头没有限制，则服务可以简单地返回与客户机发送的访问 - 控制 - 请求 - 报头报头相同的值。
    
*   添加一个 Access-Control-Allow-Methods 响应头，其中包含允许调用方使用的 HTTP 方法列表。
    
*   如果请求使用 OPTIONS 方法并包含 Access-Control-Request-Method 标头，则它是一个预检请求，用于在实际请求之前探测访问。否则，这是一个实际的请求。对于预检请求，除了执行以下步骤添加标头之外，服务必须不执行任何额外处理，并且必须返回 200 OK。对于非预检请求，除了请求的常规处理之外，还会添加以下标头。
    
*   服务向响应添加 Access-Control-Allow-Origin 标头，其中包含与 Origin 请求标头相同的值。请注意，这需要服务来动态生成标头值。不需要 cookie 或任何其他形式的 [用户凭证] cors-user-credentials 的资源可以使用通配符星号（*）进行响应。请注意，通配符仅在此处可接受，而不适用于下面描述的任何其他标头。
    
*   如果调用者需要访问不属于 [简单响应头] cors-simple-headers 集合中的响应头（Cache-Control，Content-Language，Content-Type，Expires，Last-Modified，Pragma），同时添加一个 Access-Control-Expose-Headers 标头，其中包含客户端应有权访问的其他响应标头名称列表。  
    [*] 译者注：在跨域请求时，响应中的大部分 header，需要服务端同意才能拿到，客户端跨域增加 Access-Control-Expose-Headers: content-type, cache …… 等标头来告知服务器。
    
*   如果请求需要 cookie，则添加一个 Access-Control-Allow-Credentials 头，并将其设置为 “true”。
    
*   如果请求是预检请求 (见第一个项目符号)，则服务必须满足:
    

添加一个 Access-Control-Max-Age pref

响应头，其中包含此预检前响应有效的秒数 (因此可以在后续实际请求之前避免)。注意，虽然习惯上使用较大的值，比如 2592000(30 天)，但是许多浏览器会自动设置一个更低的限制 (例如，5 分钟)。

众所周知，由于浏览器预检响应缓存很弱，因此预检响应的额外往返会损害性能。  
[*] 译者注：获取预检 OPTIONS 调用会造成很大开销，而且也浏览器的缓存能力也很赢弱，而且部分浏览器也不会理会 access-control-max-age 的设置值，如 Chrome/Blink 就硬编码为 10 分钟（600 秒）。详见 [https://chromium.googlesource.com/chromium/blink/+/master/Source/core/loader/CrossOriginPreflightResultCache.cpp#40]

注重性能端的交互式 Web 客户端使用的服务端应该避免使用导致预检的请求。

*   对于 GET 和 HEAD 调用，请避免要求不属于上述简单集的请求标头。最好是允许将它们作为查询参数提供。
    

*   Authorization 标头不是简单集的一部分，因此对于需要验证的资源，必须通过 “access_token” 查询参数发送验证令牌。请注意，不建议在 URL 中传递身份验证令牌，因为它可能导致令牌记录在服务器日志中，并暴露给有权访问这些日志的任何人。通过 URL 接受身份验证令牌的服务必须采取措施来降低安全风险，例如使用短期身份验证令牌，禁止记录身份验证令牌以及控制对服务器日志的访问。
    

*   避免要求 cookie。如果设置了 “withCredentials” 属性，XmlHttpRequest 将仅在跨域请求上发送 cookie; 这也会导致预检请求。
    

*   需要基于 cookie 的身份验证的服务必须使用 “动态验证码（dynamic canary）” [*] 译者注：服务器生成某种验证码，客户端获取后，服务器再进行验证的操作。来保护所有接受 cookie 的 API。
    

*   对于 POST 调用，在适用的情况下，选择简单的内容类型 (“application/x-www-form-urlencoded”、“multipart/form-data”、“text/plain”)。其他任何内容类型都会引发预检请求。
    

*   服务不得以避免 CORS 预检请求的名义违反其他 API 指南。由于内容类型的原因，大多数 POST 请求实际上需要预检请求。
    
*   如果非要取消预检工作，那么服务支持的其他的替代数据传输机制必须遵循本指南。
    

此外，当适当的服务可以支持 JSONP 模式时，只需简单的 GET 跨域访问。  
在 JSONP 中，服务采用指示格式的参数 (_$format=json_) 和表示回调的参数 (_$callback=someFunc_)，并返回一个 text/javascript 文档，其中包含用指定名称封装在函数调用中的 JSON 响应。  
更多关于 JSONP 的信息，请访问 Wikipedia: JSONP。

9. 集合 Collections
-----------------

### 9.1. Item keys

服务可以支持集合中每个项的持久标识符 (主键)，该标识符应用 JSON 表示为”id” , 这些持久标识符通常用作项目的 key。

支持持久标识符 (主键) 的集合可以支持增量查询。

### 9.2. 序列化 Serialization

集合使用标准数组表示法以 JSON 表示。

### 9.3. Collection URL patterns 集合的 URL 匹配

集合在顶级时直接位于服务的根目录下，或者作用于该资源时作为另一个资源下的段。

例如:

```
GET https://api.contoso.com/v1.0/people

```

服务必须尽可能支持 “/” 匹配。  
例如:

```
GET https://{serviceRoot}/{collection}/{id}

```

Where:

*   {serviceRoot} – 站点 URL (site URL) + 服务的根路径的组合
    
*   {collection} – 集合的名称，未缩写，复数
    
*   {id} – 唯一 id 属性的值. 当使用 “/“ 匹配必须属于 string/number/guid value 不带引号，转义正确以适应 URL。
    

#### 9.3.1. 嵌套集合和属性 Nested collections and properties

集合项可以包含其他集合。  
例如，用户集合可能包含多个地址的用户资源:

```
GET https://api.contoso.com/v1.0/people/123/addresses

```

```
{
  "value": [
    { "street": "1st Avenue", "city": "Seattle" },
    { "street": "124th Ave NE", "city": "Redmond" }
  ]
}

```

### 9.4. 大集合 Big collections

随着数据的增长，集合也在增长。所以计划采用分页对所有服务都很重要。  
因此，当数据包含多页时，序列化有效负载 (payload) 必须适当地包含下一页的不透明 URL。  
有关详细信息，请参阅分页指南。

客户端必须能够恰当的处理请求返回的任何给定的分页或非分页集合数据。

```
{
  "value":[
    { "id": "Item 1","price": 99.95,"sizes": null},
    { … },
    { … },
    { "id": "Item 99","price": 59.99,"sizes": null}
  ],
  "@nextLink": "{opaqueUrl}"
}

```

### 9.5. Changing collections

POST 请求不是幂等的。  
这意味着发送到具有完全相同的有效负载 (payload) 的集合资源的两次 POST 请求可能导致在该集合中创建多个项。  
[*] 译者注：相同的数据两次 POST 操作，可能导致该集合创建多次。  
例如，对于具有服务器端生成的 id 的项的插入操作，通常就是这种情况。

例如，以下请求:

```
POST https://api.contoso.com/v1.0/people

```

会导致响应，指示新集合项的位置：

```
201 Created
Location: https://api.contoso.com/v1.0/people/123

```

一旦再次执行，可能会导致创建另一个资源：

```
201 Created
Location: https://api.contoso.com/v1.0/people/124

```

而 PUT 请求则需要使用相应的键来指示集合项:

```
PUT https://api.contoso.com/v1.0/people/123

```

### 9.6. Sorting collections

可以基于属性值对集合查询的结果进行排序。  
该属性由_$orderBy_查询参数的值确定。

_$orderBy_ 参数的值包含用于对项目进行排序表达式列表，用逗号分隔的。  
这种表达式的特殊情况是属性路径终止于基本属性。

表达式可以包含升序的后缀 “asc” 或降序的后缀“desc”，它们与属性名之间用一个或多个空格分隔。  
如果没有指定 “asc” 或“desc”，则服务必须按照指定的属性以升序排序。

空值 (NULL) 必须排序为 “小于” 非空值。

必须根据第一个表达式的结果值对项进行排序，然后根据第二个表达式的结果值对第一个表达式具有相同值的项进行排序，以此类推。  
排序顺序是属性类型的固有顺序。

例如：

```
GET https://api.contoso.com/v1.0/people?$orderBy=name

```

将返回按 name 进行升序排序的所有人员。

```
GET https://api.contoso.com/v1.0/people?$orderBy=name desc

```

将返回按 name 进行降序排序的所有人。

可以通过逗号分隔的属性名称列表以及可选方向限定符来指定子排序。

例如：

```
GET https://api.contoso.com/v1.0/people?$orderBy=name desc,hireDate

```

将返回按姓名降序排列的所有人员，并按雇佣日期降序排列的次要排序。

排序必须与筛选相结合，如下:

```
GET https://api.contoso.com/v1.0/people?$filter=name eq 'david'&$orderBy=hireDate

```

将返回所有名称为 David 的人，按雇佣日期按升序排列。

#### 9.6.1. Interpreting a sorting expression

跨页面的排序参数必须一致，因为客户端和服务器端分页都依赖该排序该参数进行排序。

如果服务不支持按_$orderBy_表达式中命名的属性排序，则服务必须按照 “响应不支持的请求” 部分中定义的错误消息进行响应。

### 9.7. Filtering

$filter_querystring 参数允许客户端通过 URL 过滤集合。  
使用_$filter_指定的表达式将为集合中的每个资源求值，只有表达式求值为 true 的项才包含在响应中。  
表达式计算为 false 或 null 的资源，或由于权限而不可用的引用属性，将从响应中省略。

例如: 返回所有产品的价格低于 10.00 美元

```
GET https://api.contoso.com/v1.0/products?$filter=price lt 10.00

```

$filter_选项的值是 一个布尔表达式 表示 price less than 10.00。

#### 9.7.1. Filter operations

支持_$filter_的服务应该支持以下最小操作集。

<table width="5619"><thead data-style="box-sizing: inherit; background-color: rgb(250, 250, 250);"><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Operator</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Description</th><th data-style="box-sizing: inherit; border-top-width: 1px; border-color: rgb(223, 226, 229); padding: 12px 13px; text-align: left; vertical-align: middle; border-radius: 2px; background-color: rgb(242, 242, 242); min-width: 80px;">Example</th></tr></thead><tbody><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Comparison Operators</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">eq</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Equal</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">city eq ‘Redmond’</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">ne</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Not equal</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">city ne ‘London’</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">gt</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Greater than</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">price gt 20</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">ge</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Greater than or equal</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">price ge 10</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">lt</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Less than</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">price lt 20</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">le</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Less than or equal</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">price le 100</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Logical Operators</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">and</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Logical and</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">price le 200 and price gt 3.5</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">or</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Logical or</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">price le 3.5 or price gt 200</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">not</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Logical negation</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">not price le 3.5</td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12); background-color: rgb(250, 250, 250);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Grouping Operators</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;"><br></td></tr><tr data-style="box-sizing: inherit; border-bottom: 1px solid rgba(0, 0, 0, 0.12);"><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">( )</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">Precedence grouping</td><td data-style="box-sizing: inherit; border-color: rgb(223, 226, 229); padding: 12px 13px; vertical-align: middle; border-radius: 2px; min-width: 80px;">(priority eq 1 or city eq ‘Redmond’) and price gt 100</td></tr></tbody></table>

#### 9.7.2. Operator examples

下面的示例说明了每个逻辑操作符的用法和语义。

示例: 所有名称等于 “Milk” 的产品

```
GET https://api.contoso.com/v1.0/products?$filter=name eq 'Milk'

```

示例: 所有名称不等于 “Milk” 的产品

```
GET https://api.contoso.com/v1.0/products?$filter=name ne 'Milk'

```

示例: 所有标有 “Milk” 的产品价格都低于 2.55:

```
GET https://api.contoso.com/v1.0/products?$filter=name eq 'Milk' and price lt 2.55

```

示例: 所有标有 “Milk” 字样或价格低于 2.55 美元的产品:

```
GET https://api.contoso.com/v1.0/products?$filter=name eq 'Milk' or price lt 2.55

```

示例: 所有名称为 “牛奶” 或“鸡蛋”且价格低于 2.55 的产品:

```
GET https://api.contoso.com/v1.0/products?$filter=(name eq 'Milk' or name eq 'Eggs') and price lt 2.55

```

#### 9.7.3. Operator precedence

在计算_$filter_表达式时，服务使用以下操作符优先级。  
操作符按类别按优先级从高到低排列。  
同一类别的运算符具有同等优先级:  
| Group | Operator | Description |  
|:—————-|:———|:———————-|  
| Grouping | ( ) | Precedence grouping |  
| Unary | not | Logical Negation |  
| Relational | gt | Greater Than |  
| | ge | Greater than or Equal |  
| | lt | Less Than |  
| | le | Less than or Equal |  
| Equality | eq | Equal |  
| | ne | Not Equal |  
| Conditional AND | and | Logical And |  
| Conditional OR | or | Logical Or |

### 9.8. Pagination

返回集合的 RESTful API 可能返回部分集。  
这些服务的消费者清楚将获得部分结果集，并能正确地翻页以检索整个结果集。

RESTful API 可能支持两种形式的分页。  
服务器驱动的分页：通过在多个响应有效载荷上强制分页请求来减轻拒绝服务攻击。  
客户端驱动的分页：允许客户机只请求它在给定时间可以使用的资源数量。

跨页面的排序和筛选参数必须一致，因为客户端和服务器端分页都完全兼容于筛选和排序。

#### 9.8.1. Server-driven paging

分页响应必须通过在响应中包含延续分页标记来告诉客户端这是部分结果。  
没有延续分页标记意味着没有下一页了。

客户端必须将延续 URL 视为不透明的，这意味着在迭代一组部分结果时，查询选项可能不会更改。

例如:

```
GET http://api.contoso.com/v1.0/people HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  ...,
  "value": [...],
  "@nextLink": "{opaqueUrl}"
}

```

#### 9.8.2. Client-driven paging

客户端可以使用 _$top_和_ $skip_查询参数来指定返回的结果数量和跳过的集合数量。

服务器应遵守客户端指定的参数; 但是，客户端必须做好准备处理包含不同页面大小的响应或包含延续分页标记的响应。

当客户端同时提供 _$top_和_ $skip_时，服务器应该首先应用 _$skip_，然后对集合应用_ $top_。

注意: 如果服务器不能执行 _$top_和 / 或_ $skip_，服务器必须返回一个错误给客户端，告知它，而不是忽略该查询参数。  
这将避免客户端对返回的数据做出假设的风险。

实例:

```
GET http://api.contoso.com/v1.0/people?$top=5&$skip=2 HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  ...,
  "value": [...]
}

```

#### 9.8.3. Additional considerations

**固定的顺序先决条件:** 两种分页形式都依赖于具有固定顺序的项的集合。  
服务器必须使用额外的排序 (通常是按键排序) 来补充任何指定的顺序标准，以确保项目始终保持一致的顺序。

**缺失 / 重复结果：**即使服务器强制执行一致的排序顺序，结果也可能会因创建或删除其他资源而导致丢失或重复。  
客户端必须准备好处理这些差异。  
服务器应该总是编码最后读取记录的记录 ID，帮助客户端管理重复 / 丢失的结果。

**结合客户端和服务驱动的分页：**请注意，客户端驱动的分页不排除服务器驱动的分页。  
如果客户端请求的页面大小大于服务器支持的默认页面大小，则预期响应将是客户端指定的结果数，否则按服务端分页设置的指定分页。

**页面大小：**客户端可以通过指定_$maxpagesize_首选项来请求具有特定页面大小的服务端驱动的分页。  
如果指定的页面大小小于服务端的默认页面大小，服务器应该遵循此首选项。

**分页嵌入式集合：**客户端驱动的分页和服务端驱动的分页都可以应用于嵌入式集合。  
如果服务端对嵌入式集合进行分页，则必须包含其他适当的延续分页标记。

**记录集计数：**想要知道所有页面中的完整记录数的开发人员可以包含查询参数_$ count=true_，以告知服务端包含响应中的记录数。

### 9.9. Compound collection operations

筛选、排序和分页操作都可以针对给定的集合执行。  
当这些操作一起执行时，评估顺序必须是:

1.  **筛选**。这包括作为 AND 操作执行的所有范围表达式。
    
2.  **排序**。可能已过滤的列表根据排序条件进行排序。
    
3.  **分页**。经过筛选和排序的列表上显示了实现分页视图。这适用于服务器驱动的分页和客户端驱动的分页。
    

10. 增量查询 Delta queries
----------------------

服务可以选择支持 Delta 查询。  
[*] 译者注：增量查询可以使客户端能够发现新创建、更新或者删除的实体，无需使用每个请求对目标资源执行完全读取。这让客户端的调用更加高效。

### 10.1. 增量链接 Delta links

增量 (Delta) 链接是不透明的、由服务生成的链接，客户端使用这些链接查询对结果的后续更改。

在概念层面上，delta 链接基于一个定义查询，该查询描述正在跟踪更改的一组结果集。  
delta 链接编码并跟踪这些更改的实体集合，以及跟踪更改的起点。

如果查询包含筛选器，则响应必须只包含对匹配指定条件的实体的更改。  
Delta 查询的主要原则是:

*   集合中的每个项目必须具有持久标识符（永久不变的主键）。该标识符应该表示为 “id”。此标识符由服务定义，客户端可以使用该字符串跨调用跟踪对象。
    
*   delta 必须包含每个与指定条件新匹配的实体的条目，并且必须为每个不再符合条件的实体包含 “@removed” 条目。
    
*   重新调用查询并将其与原始结果集进行比较; 必须将当前集合中惟一的每个条目作为”add”操作返回，并且必须将原始集合中惟一的每个条目作为 “remove” 操作返回。。
    
*   以前与标准不匹配但现在匹配的每个实体必须作为”add”返回; 相反，先前与查询匹配但不再必须返回的每个实体必须作为 “@removed” 条目返回。
    
*   已更改的实体必须使用其标准表示形式包含在集合中。
    
*   服务可以向 “@remove” 节点添加额外的元数据，例如删除的原因或 “removed at” 时间戳。我们建议团队与 Microsoft REST API 指导原则工作组协调，以帮助维护一致性。
    

Delta 链接不能编码任何客户端 top 或 skip 值。

### 10.2. Entity representation

添加和更新的实体使用其标准表示在实体集中表示。  
从集合的角度来看，添加或更新的实体之间没有区别。

删除的实体仅使用其 “id” 和“@removed”节点表示。  
“@removed” 节点的存在必须表示从集合中删除条目。

### 10.3. Obtaining a delta link

通过查询集合或实体并附加 $delta 查询字符串参数来获得 Delta 链接。

例如：

```
GET https://api.contoso.com/v1.0/people?$delta
HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "value":[
    { "id": "1", "name": "Matt"},
    { "id": "2", "name": "Mark"},
    { "id": "3", "name": "John"}
  ],
  "@deltaLink": "{opaqueUrl}"
}

```

注意: 如果集合分页，deltaLink 将只出现在最后一页，但必须反映对所有页面返回的数据的任何更改。

### 10.4. Contents of a delta link response

添加 / 更新的条目必须以常规 JSON 对象的形式出现，并带有常规项目属性。  
在常规表示中返回添加 / 修改的项，允许客户端使用基于 “id” 字段的标准合并概念将它们合并到现有的 “缓存” 中。

从定义的集合中删除的条目必须包含在响应中。  
从集合中删除的项必须仅使用它们的 “id” 和“@remove”节点表示。

### 10.5. Using a delta link

客户端通过调用 delta 链接上的 GET 方法请求更改。  
客户端必须按原样使用 delta URL——换句话说，客户端不能以任何方式修改 URL(例如，解析 URL 并添加额外的查询字符串参数)。

在这个例子中:

```
GET https://{opaqueUrl} HTTP/1.1
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "value":[
    { "id": "1", "name": "Mat"},
    { "id": "2", "name": "Marc"},
    { "id": "3", "@removed": {} },
    { "id": "4", "name": "Luc"}
  ],
  "@deltaLink": "{opaqueUrl}"
}

```

针对 delta 链接的请求的结果可以跨多个页面，但是必须由服务跨所有页面进行排序，以便在应用到包含 delta 链接的响应时确保得到确定的结果。

如果没有发生任何更改，则响应是一个空集合，其中包含一个 delta 链接，用于根据请求进行后续更改。  
这个 delta 链接可能与 delta 链接相同，从而导致更改的空集合。

如果 delta 链接不再有效，则服务必须使用_410 Gone_响应。响应应该包含一个 Location 头，客户端可以使用它来检索新的基线结果集。

如果喜欢作者的文章，请关注 “DotNET 技术圈” 订阅号以便第一时间获得最新内容。本文版权归作者和长沙. NET 技术社区共有，欢迎转载，但未经作者同意必须保留此段声明，且在文章页面明显位置给出原文连接，否则保留追究法律责任的权利。 

![](https://mmbiz.qpic.cn/mmbiz_jpg/tWsuRibwLhGUuQK5ySfWl7MmiaFt2DsRCmua1DPc0icgz9lJ0tLybDXHxR02fT0MGEzkUVUvos8bGYkc8boFncjUQ/640?wx_fmt=jpeg)

本文版权归作者和长沙. NET 技术社区共有，欢迎转载，但未经作者同意必须保留此段声明，且在文章页面明显位置给出原文连接，否则保留追究法律责任的权利。