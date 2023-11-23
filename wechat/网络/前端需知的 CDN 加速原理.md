> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BDw_8rkTMb2DATiQ91oWZw)

一、什么是 CDN  

> CDN 的全称是 (Content Delivery Network)，即内容分发网络。其目的是通过在现有的 Internet 中增加一层新的 CACHE(缓存) 层，将网站的内容发布到最接近用户的网络”边缘“的节点，使用户可以就近取得所需的内容，提高用户访问网站的响应速度。从技术上全面解决由于网络带宽小、用户访问量大、网点分布不均等原因，提高用户访问网站的响应速度。  
> 简单的说，CDN 的工作原理就是将您源站的资源缓存到位于全球各地的 CDN 节点上，用户请求资源时，就近返回节点上缓存的资源，而不需要每个用户的请求都回您的源站获取，避免网络拥塞、缓解源站压力，保证用户访问资源的速度和体验

![](https://mmbiz.qpic.cn/mmbiz/1NOXMW586ut7gkN7yRApcCcicIIE1uGNwsNt5wzNMbQo2afoX9kAWK5YJB86bltF30hFNuFTw8OQpWMG4EXzfZA/640?wx_fmt=other)

CDN 节点

#### CDN 对网络的优化作用主要体现在如下几个方面

*   解决服务器端的 “第一公里” 问题
    
*   缓解甚至消除了不同运营商之间互联的瓶颈造成的影响
    
*   减轻了各省的出口带宽压力
    
*   缓解了骨干网的压力
    
*   优化了网上热点内容的分布
    

二、CDN 工作原理
==========

### 传统访问过程

![](https://mmbiz.qpic.cn/mmbiz/1NOXMW586ut7gkN7yRApcCcicIIE1uGNwYRNwmppl5I0rI7Lkee8NfoSKN20xHKQdyYcArHodJmWyIhybQnlWtg/640?wx_fmt=other)

传统访问过程

**由上图可见，用户访问未使用 CDN 缓存网站的过程为:**

> 1. 用户输入访问的域名, 操作系统向 LocalDns 查询域名的 ip 地址.  
> 2.LocalDns 向 ROOT DNS 查询域名的授权服务器 (这里假设 LocalDns 缓存过期)  
> 3.ROOT DNS 将域名授权 dns 记录回应给 LocalDns  
> 4.LocalDns 得到域名的授权 dns 记录后, 继续向域名授权 dns 查询域名的 ip 地址  
> 5. 域名授权 dns 查询域名记录后，回应给 LocalDns  
> 6.LocalDns 将得到的域名 ip 地址，回应给 用户端  
> 7. 用户得到域名 ip 地址后，访问站点服务器  
> 8. 站点服务器应答请求，将内容返回给客户端.

### CDN 访问过程

![](https://mmbiz.qpic.cn/mmbiz/1NOXMW586ut7gkN7yRApcCcicIIE1uGNwWMmKQRhKnBOe7HibMS1odCp9Pq6ibRj2TRFb9AGJbVhQIfKNjFH7vaDg/640?wx_fmt=other)

CDN 访问过程

**通过上图，我们可以了解到，使用了 CDN 缓存后的网站的访问过程变为：**

> 1. 用户输入访问的域名, 操作系统向 LocalDns 查询域名的 ip 地址.  
> 2.LocalDns 向 ROOT DNS 查询域名的授权服务器 (这里假设 LocalDns 缓存过期)  
> 3.ROOT DNS 将域名授权 dns 记录回应给 LocalDns  
> 4.LocalDns 得到域名的授权 dns 记录后, 继续向域名授权 dns 查询域名的 ip 地址  
> 5. 域名授权 dns 查询域名记录后 (一般是 CNAME)，回应给 LocalDns  
> 6.LocalDns 得到域名记录后, 向智能调度 DNS 查询域名的 ip 地址  
> 7. 智能调度 DNS 根据一定的算法和策略 (比如静态拓扑，容量等), 将最适合的 CDN 节点 ip 地址回应给 LocalDns  
> 8.LocalDns 将得到的域名 ip 地址，回应给 用户端  
> 9. 用户得到域名 ip 地址后，访问站点服务器  
> 10.CDN 节点服务器应答请求，将内容返回给客户端.(缓存服务器一方面在本地进行保存，以备以后使用，二方面把获取的数据返回给客户端，完成数据服务过程)

通过以上的分析我们可以得到，为了实现对普通用户透明 (使用缓存后用户客户端无需进行任何设置) 访问，需要使用 DNS(域名解析)来引导用户来访问 Cache 服务器，以实现透明的加速服务. 由于用户访问网站的第一步就是域名解析, 所以通过修改 dns 来引导用户访问是最简单有效的方式.

### CDN 网络的组成要素

对于普通的 Internet 用户，每个 CDN 节点就相当于一个放置在它周围的网站服务器. 通过对 dns 的接管，用户的请求被透明地指向离他最近的节点，节点中 CDN 服务器会像网站的原始服务器一样，响应用户的请求. 由于它离用户更近，因而响应时间必然更快.

从上面图中 虚线圈起来的那块，就是 CDN 层, 这层是位于 用户端 和 站点服务器 之间.

*   智能调度 DNS(比如 f5 的 3DNS)  
    智能调度 DNS 是 CDN 服务中的关键系统. 当用户访问加入 CDN 服务的网站时，域名解析请求将最终由 “智能调度 DNS” 负责处理。它通过一组预先定义好的策略，将当时最接近用户的节点地址提供给用户，使用户可以得到快速的服务。同时它需要与分布在各地的 CDN 节点保持通信，跟踪各节点的健康状态、容量等信息，确保将用户的请求分配到就近可用的节点上.
    
*   缓存功能服务  
    负载均衡设备 (如 lvs,F5 的 BIG/IP)  
    内容 Cache 服务器 (如 squid）  
    共享存储
    

三、名词解释
======

### CNAME 记录（CNAME record）

CNAME 即别名 (Canonical Name)；可以用来把一个域名解析到另一个域名，当 DNS 系统在查询 CNAME 左面的名称的时候，都会转向 CNAME 右面的名称再进行查询，一直追踪到最后的 PTR 或 A 名称，成功查询后才会做出回应，否则失败。  
例如，你有一台服务器上存放了很多资料，你使用`docs.example.com`去访问这些资源，但又希望通过`documents.example.com`也能访问到这些资源，那么你就可以在您的 DNS 解析服务商添加一条 CNAME 记录，将`documents.example.com`指向`docs.example.com`，添加该条 CNAME 记录后，所有访问`documents.example.com`的请求都会被转到`docs.example.com`，获得相同的内容。

### CNAME 域名

接入 CDN 时，在 CDN 提供商控制台添加完加速域名后，您会得到一个 CDN 给您分配的 CNAME 域名， 您需要在您的 DNS 解析服务商添加 CNAME 记录，将自己的加速域名指向这个 CNAME 域名，这样该域名所有的请求才会都将转向 CDN 的节点，达到加速效果。

### DNS

DNS 即 Domain Name System，是域名解析服务的意思。它在互联网的作用是：把域名转换成为网络可以识别的 ip 地址。人们习惯记忆域名，但机器间互相只认 IP 地址，域名与 IP 地址之间是一一对应的，它们之间的转换工作称为域名解析，域名解析需要由专门的域名解析服务器来完成，整个过程是自动进行的。比如：上网时输入的`www.baidu.com`会自动转换成为`220.181.112.143`。  
常见的 DNS 解析服务商有：阿里云解析，万网解析，DNSPod，新网解析，Route53（AWS），Dyn，Cloudflare 等。

### 回源 host

回源 host：回源 host 决定回源请求访问到源站上的具体某个站点。

> 例子 1：源站是域名源站为`www.a.com`, 回源 host 为`www.b.com`, 那么实际回源是请求到`www.a.com`解析到的 IP, 对应的主机上的站点`www.b.com`
> 
> 例子 2：源站是 IP 源站为`1.1.1.1`, 回源 host 为`www.b.com`, 那么实际回源的是`1.1.1.1`对应的主机上的站点`www.b.com`

### 协议回源

指回源时使用的协议和客户端访问资源时的协议保持一致，即如果客户端使用 HTTPS 方式请求资源，当 CDN 节点上未缓存该资源时，节点会使用相同的 HTTPS 方式回源获取资源；同理如果客户端使用 HTTP 协议的请求，CDN 节点回源时也使用 HTTP 协议。

*   本文作者：Kandy
    
*   本文链接：https://www.jianshu.com/p/1dae6e1680ff
    

最后
--

欢迎关注「三分钟学前端」，回复「交流」自动加入前端三分钟进阶群，每日一道编程算法面试题（含解答），助力你成为更优秀的前端开发！

![](https://mmbiz.qpic.cn/mmbiz_gif/bwG40XYiaOKmibEL4rxRMd1XEbhsGicGUHAkkLAic8NcbuXRibfqgHian9Ckl9dbRPzP72SoHTe9qDqzhWYRSJT2DQUg/640?wx_fmt=gif)

》》面试官也在看的前端面试资料《《

“在看和转发” 就是最大的支持