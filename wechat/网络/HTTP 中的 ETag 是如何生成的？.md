> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/CyfDErD8u2CNZwkV7NdxIw)

[深入理解浏览器的缓存机制](https://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247491394&idx=1&sn=177aad55a55a93afa9f951b8aac21b6a&scene=21#wechat_redirect) 这篇文章详细介绍了浏览器缓存相关的内容，本文阿宝哥将介绍如何利用 ETag 和 If-None-Match 来实现缓存控制。此外，阿宝哥还将介绍 HTTP 中的 ETag 是如何生成的。不过在此之前，我们得先来简单介绍一下 ETag。  

### 一、ETag 简介

#### 1.1 ETag 是什么

ETag（Entity Tag）是万维网协议 HTTP 的一部分。它是 HTTP 协议提供的若干机制中的一种 Web 缓存验证机制，并且允许客户端进行缓存协商。这使得缓存变得更加高效，而且节省带宽。如果资源的内容没有发生改变，Web 服务器就不需要发送一个完整的响应。

#### 1.2 ETag 的作用

ETag 是一个不透明的标识符，由 Web 服务器根据 URL 上的资源的特定版本而指定。如果 URL 上的资源内容改变，一个新的不一样的 ETag 就会被生成。**ETag 可以看成是资源的指纹，它们能够被快速地比较，以确定两个版本的资源是否相同**。

需要注意的是 ETag 的比较只对同一个 URL 有意义 —— 不同 URL 上资源的 ETag 值可能相同也可能不同。

#### 1.3 ETag 的语法

```
ETag: W/"<etag_value>"ETag: "<etag_value>"
```

*   `W/(可选)`：'W/'（大小写敏感） 表示使用弱验证器。弱验证器很容易生成，但不利于比较。强验证器是比较的理想选择，但很难有效地生成。相同资源的两个弱 Etag 值可能语义等同，但不是每个字节都相同。
    
*   `"<etag_value>"`：实体标签唯一地表示所请求的资源。它们是位于双引号之间的 ASCII 字符串（如 “2c-1799c10ab70” ）。没有明确指定生成 ETag 值的方法。通常是使用内容的散列、最后修改时间戳的哈希值或简单地使用版本号。比如，MDN 使用 wiki 内容的十六进制数字的哈希值。
    

#### 1.4 ETag 的使用

在大多数场景下，当一个 URL 被请求，Web 服务器会返回资源和其相应的 ETag 值，它会被放置在 HTTP 响应头的 `ETag` 字段中：

```
HTTP/1.1 200 OK
Content-Length: 44
Cache-Control: max-age=10
Content-Type: application/javascript; charset=utf-8
ETag: W/"2c-1799c10ab70"
```

然后，客户端可以决定是否缓存这个资源和它的 ETag。以后，如果客户端想再次请求相同的 URL，将会发送一个包含已保存的 `ETag` 和 `If-None-Match` 字段的请求。

```
GET /index.js HTTP/1.1
Host: localhost:3000
Connection: keep-alive
If-None-Match: W/"2c-1799c10ab70"
```

客户端请求之后，服务器可能会比较客户端的 ETag 和当前版本资源的 ETag。如果 ETag 值匹配，这就意味着资源没有改变，服务器便会发送回一个极短的响应，包含 HTTP “304 未修改” 的状态。304 状态码告诉客户端，它的缓存版本是最新的，可以直接使用它。

```
HTTP/1.1 304 Not Modified
Cache-Control: max-age=10
ETag: W/"2c-1799c10ab70"
Connection: keep-alive
```

### 二、ETag 实战

#### 2.1 创建 Koa 服务器

了解完 ETag 相关知识后，阿宝哥将基于 `koa`、`koa-conditional-get`、`koa-etag` 和 `koa-static` 这些库来介绍一下，在实际项目中如何利用 `ETag` 响应头和 `If-None-Match` 请求头实现资源的缓存控制。

```
// server.jsconst Koa = require("koa");const path = require("path");const serve = require("koa-static");const etag = require("koa-etag");const conditional = require("koa-conditional-get");const app = new Koa();app.use(conditional()); // 使用条件请求中间件app.use(etag()); // 使用etag中间件app.use( // 使用静态资源中间件  serve(path.join(__dirname, "/public"), {    maxage: 10 * 1000, // 设置缓存存储的最大周期，单位为秒  }));app.listen(3000, () => {  console.log("app starting at port 3000");});
```

在以上代码中，我们使用了 `koa-static` 中间件来处理静态资源，这些资源被保存在 `public` 目录下。在该目录下，阿宝哥创建了 `index.html` 和 `index.js` 两个资源文件，文件中的内容分别如下所示：

##### 2.1.1 public/index.html

```
<!DOCTYPE html><html lang="zh-cn"><head>    <meta charset="UTF-8">    <meta http-equiv="X-UA-Compatible" content="IE=edge">    <meta ></script></head><body>    <h3>ETag 使用示例</h3></body></html>
```

##### 2.1.2 public/index.js

```
console.log("大家好，我是阿宝哥");
```

在启动完服务器之后，我们打开 Chrome 开发者工具并切换到 Network 标签栏，然后在浏览器地址栏输入 `http://localhost:3000/` 地址，接着多次访问该地址（地址栏多次回车）。下图是阿宝哥多次访问的结果：

![](https://mmbiz.qpic.cn/mmbiz_jpg/jQmwTIFl1V2IrZIianw4GzxBia8ibUlhb50As6ZEMeicCqXTvFF2Brglm5x1YOpLSUyHLrgiaj5AxmlbAWNwTo8Qdqg/640?wx_fmt=jpeg)

#### 2.2 ETag 和 If-None-Match

下面阿宝哥将以 `index.js` 为例，来分析上图中与之对应的 HTTP 报文。对于 `index.html` 文件，感兴趣的小伙伴可以自行分析一下。接下来我们先来分析首次请求 `index.js` 文件的报文：

##### 2.2.1 首次请求 — 请求报文

```
GET /index.js HTTP/1.1
Host: localhost:3000
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
...
```

##### 2.2.2 首次请求 — 响应报文

```
HTTP/1.1 200 OK
Content-Length: 44
Cache-Control: max-age=10
ETag: W/"2c-1799c10ab70"
...
```

在使用了 koa-static 和 koa-etag 中间件之后，`index.js` 文件首次请求的响应报文中会包含 `Cache-Control` 和 `ETag` 的字段信息。

> `Cache-Control` 描述的是一个相对时间，在进行缓存命中的时候，都是利用客户端时间进行判断，所以相比较 `Expires`，`Cache-Control` 的缓存管理更有效，安全一些。

* * *

##### 2.2.3 10s 内 — 请求报文

```
GET /index.js HTTP/1.1
Host: localhost:3000
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
...
```

##### 2.2.4 10s 内 — 响应信息（General）

```
Request URL: http://localhost:3000/index.js
Request Method: GET
Status Code: 200 OK (from memory cache)
Remote Address: [::1]:3000
Referrer Policy: strict-origin-when-cross-origin
```

##### 2.2.5 10s 内 — 响应信息（Response Headers）

```
Cache-Control: max-age=10
Connection: keep-alive
Content-Length: 44
ETag: W/"2c-1799c10ab70"
```

由于我们设置了 `index.js` 资源文件的最大缓存时间为 `10s`，所以在 `10s` 内浏览器会直接从缓存中读取文件的内容。需要注意的是，此时的状态码为：`Status Code: 200 OK (from memory cache)`。

* * *

##### 2.2.6 10s 后 — 请求报文

```
GET /index.js HTTP/1.1
Host: localhost:3000
Connection: keep-alive
If-None-Match: W/"2c-1799c10ab70"
Referer: http://localhost:3000/
...
```

因为 10s 之后，缓存已经过期了，而且在 `index.js` 文件首次请求的响应报文中也返回了 `ETag` 字段。所以此时浏览器会发起 `If-None-Match` 条件请求。这类请求可以用来验证缓存的有效性，省去不必要的控制手段。

##### 2.2.7 10s 后 — 响应报文

```
HTTP/1.1 304 Not Modified
Cache-Control: max-age=10
ETag: W/"2c-1799c10ab70"
Connection: keep-alive
...
```

因为文件的内容未发生改变，所以 10s 后的响应报文的状态码为 304 Not Modified。此外，响应报文中也返回了 `ETag` 字段。看到这里，有一些小伙伴可能会有疑惑 —— ETag 到底是如何生成的？接下来，阿宝哥将带大家一起来揭开 `koa-etag` 中间件背后的秘密。

### 三、如何生成 ETag

在前面的示例中，我们使用了 `koa-etag` 中间件来实现资源的缓存控制。其实该中间件的实现并不复杂，具体如下所示：

```
// https://github.com/koajs/etag/blob/master/index.jsconst calculate = require('etag');// 省略部分代码module.exports = function etag (options) {  return async function etag (ctx, next) {    await next()    const entity = await getResponseEntity(ctx)    setEtag(ctx, entity, options)  }}
```

由以上代码可知，在 `koa-etag` 中间件内部会先通过 `getResponseEntity` 函数来获取响应实体对象，然后再调用 `setETag` 函数来生成 ETag。而 `setETag` 函数的实现很简单，在 `setETag` 函数内部，会通过 etag 这个第三方库来生成 ETag。

```
// https://github.com/koajs/etag/blob/master/index.jsfunction setEtag (ctx, entity, options) {  if (!entity) return  ctx.response.etag = calculate(entity, options)}
```

etag 这个库对外提供了一个 `etag` 函数来创建 ETag，该函数的签名如下：

```
etag(entity, [options])
```

*   entity：用于生成 ETag 的实体，类型支持 Strings，Buffers 和 fs.Stats。除了 `fs.Stats` 对象之外，默认将生成 strong ETag。
    
*   options：配置对象，支持通过 `options.weak` 属性来配置生成 weak ETag。
    

了解完 `etag` 函数的参数之后，我们来看一下该函数的具体实现：

```
function etag (entity, options) {  if (entity == null) {    throw new TypeError('argument entity is required')  }  // 支持fs.Stats对象  // isstats 函数的判断规则：当前对象是否包含ctime、mtime、ino和size这些属性  var isStats = isstats(entity)  var weak = options && typeof options.weak === 'boolean'    ? options.weak    : isStats  // 参数校验  if (!isStats && typeof entity !== 'string' && !Buffer.isBuffer(entity)) {    throw new TypeError('argument entity must be string, Buffer, or fs.Stats')  }  // 生成ETag标签  var tag = isStats    ? stattag(entity) // 处理fs.Stats对象    : entitytag(entity)  return weak    ? 'W/' + tag    : tag}
```

在 `etag` 函数内部会根据 `entity` 的类型，执行不同的生成逻辑。如果 `entity` 是 `fs.Stats` 对象，则会调用 `stattag` 函数来创建 ETag。

```
function stattag (stat) {  // mtime：Modified Time，是在写入文件时随文件内容的更改而更改，是指文件内容最后一次被修改的时间。  var mtime = stat.mtime.getTime().toString(16)  var size = stat.size.toString(16)  return '"' + size + '-' + mtime + '"'}
```

而如果 `entity` 参数非 `fs.Stats` 对象，则会调用 `entitytag` 函数来生成 ETag。其中 `entitytag` 函数的具体实现如下：

```
function entitytag (entity) {  if (entity.length === 0) {    return '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'  }  // 计算实体对象的哈希值  var hash = crypto    .createHash('sha1')    .update(entity, 'utf8')    .digest('base64')    .substring(0, 27)  // 计算实体对象的长度  var len = typeof entity === 'string'    ? Buffer.byteLength(entity, 'utf8')    : entity.length  return '"' + len.toString(16) + '-' + hash + '"'}
```

对于非 `fs.Stats` 对象来说，在 `entitytag` 函数内部会使用 `sha1` 消息摘要算法来生成 `hash` 值并以 `base64` 格式输出，而实际的生成的 `hash` 值会取前 27 个字符。此外，由以上代码可知，最终的 ETag 将由实体的长度和哈希值两部分组成。

需要注意的是，生成 ETag 的算法并不是固定的， 通常是使用内容的散列、最后修改时间戳的哈希值或简单地使用版本号。

### 四、ETag vs Last-Modified

其实除了 `ETag` 字段之外，大多数情况下，响应头中还会包含 `Last-Modified` 字段。它们之间的区别如下：

*   精确度上，Etag 要优于 Last-Modified。Last-Modified 的时间单位是秒，如果某个文件在 1 秒内被改变多次，那么它们的 Last-Modified 并没有体现出来修改，但是 Etag 每次都会改变，从而确保了精度；此外，如果是负载均衡的服务器，各个服务器生成的 Last-Modified 也有可能不一致。
    
*   性能上，Etag 要逊于 Last-Modified，毕竟 Last-Modified 只需要记录时间，而 ETag 需要服务器通过消息摘要算法来计算出一个 hash 值。
    
*   优先级上，在资源新鲜度校验时，服务器会优先考虑 Etag。即如果条件请求的请求头同时携带 `If-Modified-Since` 和 `If-None-Match` 字段，则会优先判断资源的 ETag 值是否发生变化。
    

### 五、总结

本文阿宝哥首先介绍了 ETag 的相关基础知识，然后以 Koa 为例详细介绍了 ETag 和 If-None-Match 是如何实现缓存控制的。此外，阿宝哥还分析了 `koa-etag` 中间件内部依赖的 `etag` 第三方库是如何为指定的实体生成 ETag 对象。最后，阿宝哥列举了 ETag 与 Last-Modified 之间的主要区别。

如果你还想进一步了解浏览器的缓存机制，你可以阅读 [深入理解浏览器的缓存机制](https://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247491394&idx=1&sn=177aad55a55a93afa9f951b8aac21b6a&scene=21#wechat_redirect) 这篇文章。在后续的文章中，阿宝哥将介绍如何实现资源的新鲜度检测，感兴趣的小伙伴不要错过哟。

### 六、参考资源

*   MDN - ETag
    
*   维基百科 - HTTP ETag
    
*   MDN - HTTP 条件请求
    
*   [深入理解浏览器的缓存机制](https://mp.weixin.qq.com/s?__biz=MzI2MjcxNTQ0Nw==&mid=2247491394&idx=1&sn=177aad55a55a93afa9f951b8aac21b6a&scene=21#wechat_redirect)
    

![](https://mmbiz.qpic.cn/mmbiz_png/jQmwTIFl1V2mwZjG8T1LDomW0BIojAlLLzicDRktticyGHQwG0SoxC2vTtleOCIPBFrUia681Mnr8EmHpRxZH0aPg/640?wx_fmt=png)