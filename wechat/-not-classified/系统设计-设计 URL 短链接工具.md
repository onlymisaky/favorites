> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ruBT0MxASW4nCFvfa0MB5Q) ![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3ZKDNnovBVRhPoR5XNpJJ25DgZSXIIFnkAEagT7GEXAv65Qy4xfWZzQ/640?wx_fmt=png&from=appmsg) 1*xOHz3T_iSShM2rRIT2bljA.png

这是一个系统设计问题，要求从头开始设计一个类似于 TinyURL 或 Bitly 的 URL 短链接工具。我们将涵盖从设计需求、架构和组件设计到高性能扩展和安全最佳实践的各个方面。

### **定义范围：功能性和非功能性需求**

首先，我们需要定义该系统的功能性和非功能性需求。

我们有两个功能性需求：

1. 给定一个长 URL 时，我们必须创建一个短 URL2. 给定一个短 URL 时，我们必须将用户重定向到长 URL。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3bv2tyabPEqasUWTYye527XQ2m28BgSWRkMUy56Alqq2ib2InfAhBGEQ/640?wx_fmt=png&from=appmsg)1*jAM1f_jvXWxmPVRjiweF0g.png

该服务的非功能性需求是优先考虑**低延迟**（快速响应）和**高可用性**（始终在线）。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3c1zl1bEyobeNyd0Z4x4TicDlt0O1cCMFY0A5EoNoJoLIrhjwicgwjWlA/640?wx_fmt=png&from=appmsg)1*jNP-rIMTYsFG6wq8Hu4cnA.png

### 明确业务问题

以下是一些我们可能需要明确的问题，以确保我们对系统的规模有一致的理解：

• **使用情况**：估计我们每秒需要创建多少个 URL（假设是 1000 个）。• **字符**：我们可以使用数字和字母（字母数字）还是其他符号？（我们假设使用字母数字字符）。• **唯一性**：每次生成的短 URL 是否唯一，即使多个用户提交相同的长 URL？（在这个设计中，我们假设是唯一的）。

### 估算：数据计算

有了这些信息，我们需要计算**缩短后的 URL 应该有多长**。当然，我们希望它尽可能短，但我们需要考虑到每年的 URL 创建数量。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3JxObFILgc5NUHT7MFTicNdXvWhEbIJEFxoJlBFWt2pFibPSCvUFSQYJw/640?wx_fmt=png&from=appmsg)1*KSImBkGNZ7RzwWQRZ22uNA.png

首先，让我们估算一个显著时期内所需的唯一 URL 数量。常见的方法是计划至少几年的运营。为了简化计算，我们假设计算 10 年的数据。

• **一年中的秒数**：每分钟 60 秒 × 每小时 60 分钟 × 每天 24 小时 × 每年 365 天 = 31.536 百万秒 •**10 年中的总秒数**：31.536 百万 × 10 = 315.36 百万秒 •**10 年中的总 URL 数**：1000 × 315.36 百万 = 315.36 十亿个唯一 URL

这意味着我们的数据库每秒需要处理 1000 次写入，每年将生成 **1000** × **60** × **60** × **24** × **365 = 31.5B 个 URL**。如果我们假设读取次数通常是写入次数的 10 倍，这意味着我们每秒将获得超过 **10** × **1000 = 10000 次读取**。

现在，我们需要弄清楚多少个字符能为我们未来十年的量提供足够的唯一短 URL。考虑到字符集大小为 62，可以按如下计算 URL 标识符的长度：

•62¹ = 62 个唯一 URL（1 个字符）•62² = 3844 个唯一 URL（2 个字符）•… 等等。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3S8NKXBoFAxRyUibcjxJgIh3k0EbuoHnqb1B6cIbZogFKZMg4tREt1kA/640?wx_fmt=png&from=appmsg)1*v92u6EyCjrSdC2G9dfdkzQ.png

继续这种计算，我们看到 62⁷（大约 3.5 万亿）是第一个大于我们预计的 3150 亿 URL 所需的值。

因此，为了支持我们未来十年的预期增长，我们的缩短 URL 需要至少 7 个字符。

### **高层次架构**

我们的系统将有以下关键组件：

**用户**：用户发送他们的长 URL 以生成短 URL，或发送短 URL，我们需要将他们重定向到长 URL。

**负载均衡器**：所有这些请求通过负载均衡器，它将流量分配到多个 Web 服务器实例，以确保高可用性和负载均衡。

**Web 服务器**：这些服务器副本负责处理传入的 HTTP 请求。

**URL 短链接服务**：我们还需要一个包含生成短 URL、存储 URL 映射和检索原始 URL 以进行重定向的核心逻辑的 URL 短链接服务。

**数据库**：存储短 URL 及其长 URL 之间的连接。在设计数据库之前，我们需要考虑缩短 URL 的潜在存储需求。

每个 URL 将包括唯一标识符（大约 7 个字节）、长 URL（最多 100 个字节）和用户元数据（估计为 500 个字节）。这意味着我们每个 URL 需要最多 1000 个字节。根据我们的预期量，这相当于大约 315TB 的数据。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3mb0oA6n2jF6B7Sm8uyOqQmFfSFu9dOaVPhMrHSgQtmbtcQqMVoQjLA/640?wx_fmt=png&from=appmsg)1*mMbzPSeZtYyVyjcmi2rqVw.png

在继续之前，让我们先考虑一下单个 Web 服务器的 API 设计。

### API 设计

让我们定义服务的基本 API 操作。根据我们的功能需求，我们将使用 REST API，并需要两个端点。

**1. 创建短 URL (POST** `**/urls**`**)**

输入：包含长 URL 的 JSON 负载 `{“longUrl”: “[https://example.com/very-long-url](https://example.com/very-long-url)"}`

输出：带有短 URL 的 JSON 负载 `{“shortUrl”: “[https://tiny.url/3ad32p9](https://tiny.url/3ad32p9)"}` 和 `201 Created` 状态码。

如果请求无效或格式错误，我们将返回 `400 Bad Request` 响应，如果请求的 URL 已经存在于系统中，我们将返回 `409 Conflict`。

**2. 重定向到长 URL (GET** `**/urls/{shortUrlId}**`**)**

输入：`shortUrlId` 路径参数

输出：带有 `301 Moved Permanently` 的响应，响应体中包含新创建的短 URL 作为 JSON `{ "shortUrl": "https://tiny.url/3ad32p9" }`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3lhGd6EIj86Vojvf9nZSz1sMyPt6GeZRwBvy1gadpCmqSuZIiahPiapdg/640?wx_fmt=png&from=appmsg)1*wNufw9wtsv-tV0G20eDuAA.png

301 状态码指示浏览器缓存信息，这意味着下次用户输入短 URL 时，浏览器会自动重定向到长 URL 而不需要再次访问服务器。

然而，如果你想跟踪每个请求的分析并确保它通过你的系统，可以使用 302 状态码。

### 数据库：存储短 URL

下一部分是数据库层。该层存储短 URL 和长 URL 之间的映射。它应该针对快速读写操作进行优化。

模式可以很简单：短 URL id 的主键，以及长 URL 和可能的创建元数据字段。

```
{
  "shortUrlId": "3ad32p9",
  "longUrl": "https://example.com/very-long-url",
  "creationDate": "2024-03-08T12:00:00Z",
  "userId": "user123",
  "clicks": 1023,
  "metadata": {
    "title": "Example Web Page",
    "tags": ["example", "web", "url shortener"],
    "expireDate": "2025-03-08T12:00:00Z"
  },
  "isActive": true
}
```

在这里，我们主要需要考虑数据库的读取次数。如果我们通常每秒有 1000 次写入，那么我们可以假设至少每秒有 10 到 100000 次读取。

在这种情况下，我们需要使用支持快速读取和写入的高性能数据库。这意味着我们需要使用 NoSQL 数据库（如 MongoDB 这样的文档存储、Cassandra 这样的宽列存储或 DynamoDB 这样的键值存储），因为它们专门设计用于处理大量的扩展。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3krebTiaD21a8qGeWnzwx4HBVV3CJZtyo5miaDoVBiaEL6BqXmev1uxZ2w/640?wx_fmt=png&from=appmsg)1*qDll9-tFr2I2OxhWO3wSHg.png

它不会是 ACID 兼容的，但我们不关心这一点，因为我们不会进行大量的 JOIN 或复杂的查询，我们不需要那些 ACID 规则和原子事务。

### URL 短链接服务

该系统的核心部分之一是 URL 短链接服务。该服务生成短 URL，且不会在不同的长 URL 指向相同的短 URL 时引入冲突。

有多种方法可以实现这个服务；以下是其中一些：

• 哈希：生成长 URL 的哈希，并使用其中的一部分作为标识符。然而，哈希可能导致冲突。• 自增 ID：使用数据库的自增 ID 并将其编码为一个短字符串。这确保了唯一性，但可能是可预测的。• 自定义算法：设计一个自定义算法，用字符的混合来生成唯一 ID，以确保唯一性和不可预测性。

例如，为了避免冲突，有一个非常简单的方法——我们可以生成

所有可能的 7 字符键，并将它们存储在数据库中作为键，其中键是生成的 URL，值是布尔值；如果为 true，则表示该 URL 已被使用，如果为 false，则可以使用该 URL 创建新映射。

因此，每当用户请求生成一个键时，我们可以从这个数据库中找到一个当前未使用的 URL，并将其映射到请求体中的长 URL。

你认为我们在这种情况下会使用 SQL 还是 NoSQL 数据库？考虑一种场景：两个用户请求缩短他们的长 URL，并且他们都被映射到这个数据库中的同一个键。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3RHdq1YPEwgiaic39eVF5HBbclfXCaI1YFj5a1RicICww0iaU6OK98g7C1Q/640?wx_fmt=png&from=appmsg)1*b0c8CnuESVxCE2-Ux7QPqA.png

在这种情况下，URL 将被映射到其中一个请求，另一个将被破坏。所以，我们将使用 SQL，因为它具有 ACID 属性。我们可以为这里的每个会话创建一个事务，以在隔离中执行这些步骤，在这种情况下我们不会有这种问题。

### 高可用性和低延迟

我们的当前系统显然无法处理每秒 1000 个 URL 的流量。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe36oNibrMcy33Soe6MGgAlzDKAO9Vj13F47CJGu0OSeG7iblnqzUKmGVVw/640?wx_fmt=png&from=appmsg)1*eN5OY1eSi9SnGHqgVgF9bg.png

### 缓存

为了使其更具可扩展性，我们首先需要一个缓存层（例如 Redis）来缓存流行的 URL，以便在内存中快速检索。

鉴于某些 URL 可能比其他 URL 访问频率更高，我们需要一种优先考虑频繁访问项的逐出策略。两种适合此场景的缓存逐出策略是：

•**LRU 逐出策略**：首先删除最近最少访问的项目。对于 URL 短链接服务，这种策略非常有效，因为它确保缓存保持最新和最频繁访问的 URL，这可以显著减少流行链接的访问时间。• 或者基于 TTL 的逐出策略：为每个缓存条目分配一个固定的生存时间（TTL）。一旦条目的 TTL 过期，它将从缓存中移除。对于只在短时间内流行的 URL，TTL 策略对 URL 短链接服务很有用。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3gvHtT8X99BTBtLIbX9TSib3ic8picIMr4XibWMSFJmibTyv8xwByTEQyedA/640?wx_fmt=png&from=appmsg)1*oDV7pndeZqmTmRrthz5a3Q.png

TTL 还可以帮助我们自动刷新缓存内容，并可以与其他策略（如 LRU）结合使用，以更有效地管理缓存。

### 数据库扩展：结合复制和分片

我们需要实现复制和分片策略，以确保数据库支持高可用性、容错性和可扩展性。

考虑到我们的 7 字符集有 3.5T 个唯一 URL，我们可以使用基于键的分片将 URL 记录均匀分布在多个分片上。

假设我们将其分布在 3 个分片上，每个分片将存储大约 1.16T 个 URL。这确保了随着 URL 数量的增长系统的可扩展性。

我们还可以在每个分片内实现主从复制，以确保高可用性和容错性。这种设置允许在节点故障时快速故障转移和恢复。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3CAOxzSvMmynBtrmicwYT3RdWtpqARniclLBWJibXLQSJSonJHtbeIbuMw/640?wx_fmt=png&from=appmsg)1*68H1bEHS3eYotv9dBy9hmg.png

另外，如果服务面向全球用户，我们可以考虑地理分片和复制，以最小化延迟并改善不同地区的用户体验。

这种组合允许服务处理大量 URL 缩短和重定向，并且几乎没有停机时间和快速响应时间。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/b8r1Kxg2cLJhr6ibyK3iaxWmrqv9Qtfhe3R6hUMecLVFVypaBDLlPWObdnvkOMAuAnpSe7LQ8Rg4RHhA46f1SciaA/640?wx_fmt=png&from=appmsg)1*XHmu-wQLQwyKAHztn3zIeA.png

### 安全考虑

以下是我们服务的一些安全考虑：

• **输入验证**：我们必须对用户提交的每个 URL 进行消毒。我们必须检查有效的协议（HTTP、HTTPS 等）并确保 URL 格式正确。这有助于防止注入攻击。• **速率限制**：我们可以通过限制单个源的请求次数来保护我们的服务免受 DDoS 攻击。可以考虑使用令牌桶算法。• **监控和日志记录**：需要一个强大的日志记录系统（如 ELK 堆栈）。它允许我们分析日志以查找瓶颈和可疑活动，并确保整体系统健康。• **混淆**：我们不希望轻易预测的短 URL。为了阻止攻击者猜测有效链接，我们可以在生成算法中添加随机性。• **链接到期**：可选地，我们可以考虑允许用户为他们的短 URL 设置到期日期。这可以限制潜在恶意链接的生命周期。