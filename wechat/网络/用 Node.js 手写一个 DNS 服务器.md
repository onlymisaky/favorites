> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Gl94ISY5N4BYyYmVT9-QFQ)

DNS 是实现域名到 IP 转换的网络协议，当访问网页的时候，浏览器首先会通过 DNS 协议把域名转换为 IP，然后再向这个 IP 发送 HTTP 请求。

DNS 是我们整天在用的协议，不知道大家是否了解它的实现原理呢？

这篇文章我们就来深入下 DNS 的原理，并且用 Node.js 手写一个 DNS 服务器吧。

DNS 的原理
-------

不知道大家有没有考虑过，为什么要有域名？

我们知道，标识计算机是使用 IP 地址，IPv4 有 32 位，IPv6 有 128 位。

IPv4 一般用十进制表示：

```
192.10.128.240<br style="visibility: visible;">
```

IPv6 太长了，一般是用十六进制表示：

```
3C0B:0000:2667:BC2F:0000:0000:4669:AB4D<br style="visibility: visible;">
```

不管是 IPv4 还是 IPv6，这串数字都太难记了，如果访问网页要输入这样一串数字也太麻烦了。

而且 IP 也不是固定的，万一机房做了迁移之类的，那 IP 也会变。

怎么通过一种既好记又不限制为固定 IP 的方式来访问目标服务器呢？

可以起一个名字，客户端不通过 IP，而是通过这个名字来访问目标机器。

名字和 IP 的绑定关系是可以变的，每次访问都要经历一次解析名字对应的 IP 的过程。

这个名字就叫做域名。

那怎么维护这个域名和 IP 的映射关系呢？

最简单的方式就是在一个文件里记录下所有的域名和 IP 的对应关系，每次解析域名的时候都到这个文件里查一下。

最开始确实是这么设计的，这样的文件叫做 hosts 文件，记录了世界上所有的主机（host）。

那时候全世界也没多少机器，所以这样的方式是可行的。

当然，这个 hosts 的配置是统一维护的，当新的主机需要联网的话就到这里注册一下自己的域名和 IP。其他机器拉取下最新的配置就能访问到这台主机了。

但是随着机器的增多，这种方式就不太行了，有两个突出的问题：

*   全世界都从某一台机器来同步配置，这台机器压力会太大。
    
*   当域名多了以后，命名上很容易冲突。
    

所以域名服务器得是分布式的，通过多台服务器来提供服务，并且最好还能通过命名空间来划分，减少命名冲突。

因此才产生了域名，例如 baidu.com 这个 com 就是一个域，叫顶级域，baidu 就是 com 域的二级域。

这样如果再有一个 baidu.xyz 也是可以的，因为 xyz 和 com 是不同的域，之下有独立的命名空间。

这样就减少了命名冲突。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQWkvCqeeOy4GtXz5KQGQVJ73eKUOkmAI0sur4GUePAgmOicwGOw4bxDQ/640?wx_fmt=png)

分布式的话就要划分什么域名让什么服务器来处理，把请求的压力分散开。

很容易想到的是顶级域、二级域、三级域分别放到不同的服务器来解析。

所有的顶级域服务器也有个目录，叫做根域名服务器。

这样查询某个域名的 IP 时就先向根域名服务器查一下顶级域的地址，然后有二级域的话再查下对应服务器的地址，一层层查，直到查到最终的 IP。

当然，之前的 hosts 的方式也没有完全废弃，还是会先查一下 hosts，如果查不到的话再去请求域名服务器。

也就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQib2oFPxFIVGSjtfTR6jGzbJ7IeDy4p2usYHRIKlr4TRqGG90iahMFibYg/640?wx_fmt=png)

比如查 www.baidu.com 这个域名的 IP，就先查本地 hosts，没有查到的话就向根域名服务器查 com 域的通用顶级域名服务器的地址，之后再向这个顶级域名服务器查询 baidu.com 二级域名服务器的地址，这样一层层查，直到查到最终的 IP。

这样就通过分布式的方式来分散了服务器的压力。

但是这样设计还是有问题的，每一级域一个服务器，如果域名的层次过多，那么就要往返查询好多次，效率也不高。

所以 DNS（Domain Name System）只分了三级域名服务器：

*   根域名服务器：记录着所有顶级域名服务器的地址，是域名解析的入口
    
*   顶级域名服务器：记录着各个二级域名对应的服务器的地址
    
*   权威域名服务器：该域下二级、三级甚至更多级的域名都在这里解析
    

其实就是把二、三、四、五甚至更多级的域名都合并在一个服务器解析了，叫做权威域名服务器（Authoritative Domain Name Server）。

这样既通过分布式减轻了服务器的压力，又避免了层数过多导致的解析慢。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQcia6jhDy3qMvFskw7EDoeW9oTHVLOYAOeRoqUOSiaYlJNjicxz7TI2vnA/640?wx_fmt=png)

当然，每次查询还是比较耗时的，查询完之后要把结果缓存下来，并且设置一个过期时间，域名解析记录在 DNS 服务器上的缓存时间叫做 TTL（Time-To-Live）。

但现在只是在某一台机器上缓存了这个解析结果，可能某个区域的其他机器在访问的时候还是需要解析的。

所以 DNS 设计了一层本地域名服务器，由它来负责完成域名的解析，并且把结果缓存下来。

这样某台具体的机器只要向这个本地域名服务器发请求就可以了，而且解析结果其他机器也可以直接用。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQ5Af4xqPzxVkicEfGmrPnsWLRzRhaib2XIHTmOIGekOkv7CL10oHS1iaaw/640?wx_fmt=png)

这样的本地域名服务器是移动、联通等 ISP（因特网服务提供商）提供的，一般在每个城市都有一个。某台机器访问了某个域名，解析之后会把结果缓存下来，其他机器访问这个域名就不用再次解析了。

这个本地域名服务器的地址是可以修改的，在 mac 里可以打开系统偏好设置 --> 网络 --> 高级 --> DNS 来查看和修改本地域名服务器的地址。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQRhLKTch0hXxepccTWM9wXJxc2icdW2iatria5dKpw0CnSOGcLP3aSwZibA/640?wx_fmt=png)

这就是 DNS 的原理。

不知道大家看到本地域名服务器的配置可以修改的时候，是否有自己实现一个 DNS 服务器的冲动。

确实，这个 DNS 服务器完全可以自己实现，接下来我们就用 Node.js 实现一下。

我们先来分析下思路：

DNS 服务器实现思路分析
-------------

DNS 是应用层的协议，协议内容的传输还是要通过传输层的 UDP 或者 TCP。

我们知道，TCP 会先三次握手建立连接，之后再发送数据包，并且丢失了会重传，确保数据按顺序送达。

它适合一些需要进行多次请求、响应的通信，因为这种通信需要保证处理顺序，典型的就是 HTTP。

但这样的可靠性保障也牺牲了一定的性能，效率比较低。

而 UDP 是不建立连接，直接发送数据报给对方，效率比较高。适合一些不需要保证顺序的场景。

显然，DNS 的每次查询请求都是独立的，没有啥顺序的要求，比较适合 UDP。

所以我们需要用 Node.js 起一个 UDP 的服务来接收客户端的 DNS 数据报，自己实现域名的解析，或者转发给其他域名服务器来处理。之后发送解析的结果给客户端。

创建 UDP 服务和发送数据使用 Node.js 的 dgram 这个包。

类似这样：

```
const dgram = require('dgram');const server = dgram.createSocket('udp4')server.on('message', (msg, rinfo) => {    // 处理 DNS 协议的消息})server.on('error', (err) => {    // 处理错误})  server.on('listening', () => {    // 当接收方地址确定时});server.bind(53);
```

具体代码后面再细讲，这里知道接收 DNS 协议数据需要启 UDP 服务就行。

DNS 服务器上存储着域名和 IP 对应关系的记录，这些记录有 4 种类型：

*   A：域名对应的 IP
    
*   CNAME：域名对应的别名
    
*   MX：邮件名后缀对应的域名或者 IP
    
*   NS：域名需要去另一个 DNS 服务器解析
    
*   PTR：IP 对应的域名
    

其实还是很容易理解的：

类型 A 就是查询到了域名对应的 IP，可以直接告诉客户端。

类型 NS 是需要去另一台 DNS 服务器做解析，比如顶级域名服务器需要进一步去权威域名服务器解析。

CNAME 是给当前域名起个别名，两个域名会解析到同样的 IP。

PTR 是由 IP 查询域名用的，DNS 是支持反向解析的

而 MX 是邮箱对应的域名或者 IP，用于类似 @xxx.com 的邮件地址的解析。

当 DNS 服务器接收到 DNS 协议数据就会去这个记录表里查找对应的记录，然后通过 DNS 协议的格式返回。

那 DNS 协议格式是怎么样的呢？

大概是这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQDxoz0iaK0vKwOLZ1DQhRc2ibcHQZ1hgrI0pr143wia2uf1wZAXFYBFwiaw/640?wx_fmt=png)

内容还是挺多的，我们挑几个重点来看一下：

Transction ID 是关联请求和响应用的。

Flags 是一些标志位：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQX9l7TdrQdQKYTeibCMpice3VP2r1DiaZE58JSZFcCzAWIAB1Peeg4SNuA/640?wx_fmt=png)

比如 QR 是标识是请求还是响应。OPCODE 是标识是正向查询，也就是域名到 IP，还是反向查询，也就是 IP 到域名。

再后面分别是问题的数量、回答的数量、授权的数量、附加信息的数量。

之后是问题、回答等的具体内容。

问题部分的格式是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQxZiafUFiaEsmI5R7D7SpHlxSrPwB7tjFPcVWkGqeykicxQafSbCLFXbzw/640?wx_fmt=png)

首先是查询的名字，比如 baidu.com，然后是查询的类型，就是上面说的那些 A、NS、CNAME、PTR 等类型。最后一个查询类一般都是 1，表示 internet 数据。

回答的格式是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQ5yeASVLlzk4RWCP7lqf8r8rb1161Lic4P5fQ7FF0YKGxPqJ4qI1Px6A/640?wx_fmt=png)

Name 也是查询的域名，Type 是 A、NS、CNAME、PTR 等，Class 也是和问题部分一样，都是 1。

然后还要指定 Time to live，也就是这条解析记录要缓存多长时间。DNS 就是通过这个来控制客户端、本地 DNS 服务器的缓存过期时间的。

最后就是数据的长度和内容了。

这就是 DNS 协议的格式。

我们知道了如何启 UDP 的服务，知道了接收到的 DNS 协议数据是什么格式的，那么就可以动手实现 DNS 服务器了。解析出问题部分的域名，然后自己实现解析，并返回对应的响应数据。

大概理清了原理，我们来写下代码：

手写 DNS 服务器
----------

首先，我们创建 UDP 的服务，监听 53 号端口，这是 DNS 协议的默认端口。

```
const dgram = require('dgram')const server = dgram.createSocket('udp4')server.on('message', (msg, rinfo) => {    console.log(msg)});server.on('error', (err) => {    console.log(`server error:\n${err.stack}`)    server.close()})  server.on('listening', () => {    const address = server.address()    console.log(`server listening ${address.address}:${address.port}`)})  server.bind(53)
```

通过 dgram 模块创建 UDP 服务，启动在 53 端口，处理开始监听的事件，打印服务器地址和端口，处理错误的事件，打印错误堆栈。收到消息时直接打印。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQG56uIcBvgZS5iaYSXGvxGAUSSX4gK7ulMG2EeL0Awhr0vKbNYVn88Zg/640?wx_fmt=png)

修改系统偏好设置的本地 DNS 服务器地址指向本机：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQeKWIrO8iaFEPyw3L7d5GszzZbUkjjm80NI7ck4IBL603uIlrtrFJpAA/640?wx_fmt=png)

这样再访问网页的时候，我们的服务控制台就会打印收到的消息了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQt5UTjHafTV2SpdaZsJc1thxLHWxzalqHcsiagSmXjbWAkUxqjsby0yA/640?wx_fmt=png)

一堆 Buffer 数据，这就是 DNS 协议的消息。

我们从中把查询的域名解析出来打印下，也就是这部分：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQyI1NWwG5daSj7QanPCM7rxbYD9ZOMib7ZacLIdKN91FcCiaFmmNCEjhw/640?wx_fmt=png)

问题前面的部分有 12 个字节，所以我们截取一下再 parse：

```
server.on('message', (msg, rinfo) => {  const host = parseHost(msg.subarray(12))  console.log(`query: ${host}`)})
```

msg 是 Buffer 类型，是 Uint8Array 的子类型，也就是无符号整型。（整型存储的时候可以带符号也可以不带符号，不带符号的话可以存储的数字会大一倍。）

调用它的 subarray 方法，截取掉前面 12 个字节。

然后解析问题部分：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQqM0BMcCJlCWp9wr2ibh51V4nG4dPIvc1VevxL0p89I3SoQicH4pjxSuQ/640?wx_fmt=png)

问题的最开始就是域名，我们只要把域名解析出来就行。

我们表示域名是通过 . 来区分，但是存储的时候不是，是通过

当前域长度 + 当前域内容 + 当前域长度 + 当前域内容 + 当前域长度 + 当前域内容 + 0

这样的格式，以 0 作为域名的结束。

所以解析逻辑是这样的：

```
function parseHost(msg) {  let num = msg.readUInt8(0);  let offset = 1;  let host = "";  while (num !== 0) {    host += msg.subarray(offset, offset + num).toString();    offset += num;    num = msg.readUInt8(offset);    offset += 1;    if (num !== 0) {      host += '.'    }  }  return host}
```

通过 Buffer 的 readUInt8 方法来读取一个无符号整数，通过 Buffer 的 subarray 方法来截取某一段内容。

这两个方法都要指定 offet，也就是从哪里开始。

我们先读取一个数字，也就是当前域的长度，然后读这段长度的内容，然后继续读下一段，直到读到 0，代表域名结束。

把中间的这些域通过 . 连接起来。比如 3 www 5 baidu 3 com 处理之后就是 www.baidu.com。

之后我们重启下服务器测试下效果：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQaCIFCdLPOlVdticlibdkLm1rgrw3NHiccBJDia1pibTuQ4ea09HIibLXpXpg/640?wx_fmt=png)

我们成功的从 DNS 协议数据中把 query 的域名解析了出来！

解析 query 部分只是第一步，接下来还要返回对应的响应。

这里我们只自己处理一部分域名，其余的域名还是交给别的本地 DNS 服务器处理：

```
server.on('message', (msg, rinfo) => {    const host = parseHost(msg.subarray(12))    console.log(`query: ${host}`);    if (/guangguangguang/.test(host)) {        resolve(msg, rinfo)    } else {        forward(msg, rinfo)    }});
```

解析出的域名如果包含 guangguangguang，那就自己处理，构造对应的 DNS 协议消息返回。

否则就转发到别的本地 DNS 服务器处理，把结果返回给客户端。

先实现 forward 部分：

转发到别的 DNS 服务器，那就是创建一个 UDP 的客户端，把收到的消息传给它，收到消息后再转给客户端。

也就是这样的：

```
function forward(msg, rinfo) {    const client = dgram.createSocket('udp4');    client.on('error', (err) => {      console.log(`client error:\n${err.stack}`);      client.close();    });    client.on('message', (fbMsg, fbRinfo) => {      server.send(fbMsg, rinfo.port, rinfo.address, (err) => {        err && console.log(err)      })      client.close();    });    client.send(msg, 53, '192.168.199.1', (err) => {      if (err) {        console.log(err)        client.close()      }    });}
```

通过 dgram.createSocket 创建一个 UDP 客户端，参数的 udp4 代表是 IPv4 的地址。

处理错误、监听消息，把 msg 转发给目标 DNS 服务器（这里的 DNS 服务器地址大家可以换成别的）。

收到返回的消息之后传递给客户端。

客户端的 ip 和端口是通过参数传进来的。

这样就实现了 DNS 协议的中转，我们先测试下现在的效果。

使用 nslookup 命令来查询某个域名的地址：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQfqRJgUkNbz7Wia7LqCicK8Xk05zFSic18PdkK0JGtjjObNGRBdqZKNSbw/640?wx_fmt=png)

可以看到，查询 baidu.com 是能拿到对应的 IP 地址的，在浏览器里也就可以访问。

而 guangguangguang.ddd.com 没有查找到对应的 IP。

接下来实现 resolve 方法，自己构造一个 DNS 协议的消息返回 。

还是这样的格式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQWlVAakHMuK0Lm4x9yKfm09wS2sC0gVC7FguAITicwIseibPyibuxrtRkQ/640?wx_fmt=png)

大概这样构造：

会话 ID 从传过来的 msg 取，flags 也设置下，问题数回答数都是 1，授权数、附加数都是 0。

问题区域和回答区域按照对应的格式来设置：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQqM0BMcCJlCWp9wr2ibh51V4nG4dPIvc1VevxL0p89I3SoQicH4pjxSuQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQfjbnG85cic6USxHpUBzjtOx9G6rQrqj37icOdDQRbCPpI7qUVKLcO4bA/640?wx_fmt=png)

需要用 Buffer.alloc 创建一个 buffer 对象。

过程中还会用到 buffer.writeUInt16BE 来写一些无符号的双字节整数。

这里的 BE 是 Big Endian，大端序，也就是高位放在右边的、低位放在左边，

比如 00000000 00000001 是大端序的双字节无符号整数 1。而小端序的 1 则是 00000001 00000000，也就是高位放在左边。

拼装 DNS 协议的消息还是挺麻烦的，大家简单看一下就行：

```
function copyBuffer(src, offset, dst) {    for (let i = 0; i < src.length; ++i) {      dst.writeUInt8(src.readUInt8(i), offset + i)    }  }function resolve(msg, rinfo) {    const queryInfo = msg.subarray(12)    const response = Buffer.alloc(28 + queryInfo.length)    let offset = 0    // Transaction ID    const id  = msg.subarray(0, 2)    copyBuffer(id, 0, response)      offset += id.length        // Flags    response.writeUInt16BE(0x8180, offset)      offset += 2    // Questions    response.writeUInt16BE(1, offset)      offset += 2    // Answer RRs    response.writeUInt16BE(1, offset)      offset += 2    // Authority RRs & Additional RRs    response.writeUInt32BE(0, offset)      offset += 4    copyBuffer(queryInfo, offset, response)    offset += queryInfo.length     // offset to domain name    response.writeUInt16BE(0xC00C, offset)     offset += 2    const typeAndClass = msg.subarray(msg.length - 4)    copyBuffer(typeAndClass, offset, response)    offset += typeAndClass.length    // TTL, in seconds    response.writeUInt32BE(600, offset)      offset += 4    // Length of IP    response.writeUInt16BE(4, offset)      offset += 2    '11.22.33.44'.split('.').forEach(value => {      response.writeUInt8(parseInt(value), offset)      offset += 1    })    server.send(response, rinfo.port, rinfo.address, (err) => {      if (err) {        console.log(err)        server.close()      }    })}
```

最后把拼接好的 DNS 协议的消息发送给对方。

这样，就实现了 guangguangguang 的域名的解析。

上面代码里我把它解析到了 11.22.33.44 的 IP。

我们用 nslookup 测试下：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQQCOGZiaJVap6p2XujBDcZ9x4MQQSGwSI7ia6OB7OvWe58eFDO2VvBZ0g/640?wx_fmt=png)

可以看到，对应的域名解析成功了！

这样我们就通过 Node.js 实现了 DNS 服务器。

贴一份完整代码，大家可以自己跑起来，然后把电脑的本地 DNS 服务器指向它试试：

```
const dgram = require('dgram')const server = dgram.createSocket('udp4')function parseHost(msg) {    let num = msg.readUInt8(0);    let offset = 1;    let host = "";    while (num !== 0) {      host += msg.subarray(offset, offset + num).toString();      offset += num;        num = msg.readUInt8(offset);      offset += 1;        if (num !== 0) {        host += '.'      }    }    return host}function copyBuffer(src, offset, dst) {    for (let i = 0; i < src.length; ++i) {      dst.writeUInt8(src.readUInt8(i), offset + i)    }  }function resolve(msg, rinfo) {    const queryInfo = msg.subarray(12)    const response = Buffer.alloc(28 + queryInfo.length)    let offset = 0    // Transaction ID    const id  = msg.subarray(0, 2)    copyBuffer(id, 0, response)      offset += id.length        // Flags    response.writeUInt16BE(0x8180, offset)      offset += 2    // Questions    response.writeUInt16BE(1, offset)      offset += 2    // Answer RRs    response.writeUInt16BE(1, offset)      offset += 2    // Authority RRs & Additional RRs    response.writeUInt32BE(0, offset)      offset += 4    copyBuffer(queryInfo, offset, response)    offset += queryInfo.length     // offset to domain name    response.writeUInt16BE(0xC00C, offset)     offset += 2    const typeAndClass = msg.subarray(msg.length - 4)    copyBuffer(typeAndClass, offset, response)    offset += typeAndClass.length    // TTL, in seconds    response.writeUInt32BE(600, offset)      offset += 4    // Length of IP    response.writeUInt16BE(4, offset)      offset += 2    '11.22.33.44'.split('.').forEach(value => {      response.writeUInt8(parseInt(value), offset)      offset += 1    })    server.send(response, rinfo.port, rinfo.address, (err) => {      if (err) {        console.log(err)        server.close()      }    })}function forward(msg, rinfo) {    const client = dgram.createSocket('udp4')    client.on('error', (err) => {      console.log(`client error:\n${err.stack}`)      client.close()    })    client.on('message', (fbMsg, fbRinfo) => {      server.send(fbMsg, rinfo.port, rinfo.address, (err) => {        err && console.log(err)      })      client.close()    })    client.send(msg, 53, '192.168.199.1', (err) => {      if (err) {        console.log(err)        client.close()      }    })}server.on('message', (msg, rinfo) => {    const host = parseHost(msg.subarray(12))    console.log(`query: ${host}`);    if (/guangguangguang/.test(host)) {        resolve(msg, rinfo)    } else {        forward(msg, rinfo)    }});  server.on('error', (err) => {    console.log(`server error:\n${err.stack}`)    server.close()})  server.on('listening', () => {    const address = server.address()    console.log(`server listening ${address.address}:${address.port}`)})  server.bind(53)
```

总结
--

本文我们学习了 DNS 的原理，并且用 Node.js 自己实现了一个本地 DNS 服务器。

域名解析的时候会先查询 hosts 文件，如果没查到就会请求本地域名服务器，这个是 ISP 提供的，一般每个城市都有一个。

本地域名服务器负责去解析域名对应的 IP，它会依次请求根域名服务器、顶级域名服务器、权威域名服务器，来拿到最终的 IP 返回给客户端。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj1M43QIpUDHVfIyyxzCHbQ4Wz3GvfGRyHv3YghiaZZcGPTBYroibBgaKiaw2xKVIa9ib1y8EETdRDPWA/640?wx_fmt=png)

电脑可以设置本地域名服务器的地址，我们把它指向了用 Node.js 实现的本地域名服务器。

DNS 协议是基于 UDP 传输的，所以我们通过 dgram 模块启动了 UDP 服务在 53 端口。

然后根据 DNS 协议的格式，解析出域名，对目标域名自己做处理，构造出 DNS 协议的消息返回。其他域名则是转发给另一台本地 DNS 服务器做解析，把它返回的消息传给客户端。

这样，我们就用 Node.js 实现了本地 DNS 服务器。