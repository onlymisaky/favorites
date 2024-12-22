> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QK9GNjmzQ_ZNZh0N3RhC6g)

开启 HTTP 缓存是前端性能优化中提高资源加载效率的重要手段。以下是几个关键点：

1.  **减少重复请求**：通过缓存机制，浏览器可以存储已请求过的资源，减少对服务器的重复请求。
    
2.  **设置缓存头**：在服务器端设置合适的`Cache-Control`、`Expires`或`ETag`响应头，告诉浏览器如何缓存资源。
    
3.  **区分静态和动态资源**：静态资源（如图片、CSS、JS 文件）可以设置较长的缓存时间，而动态内容则需要更短的缓存时间或使用验证缓存。
    
4.  **利用浏览器缓存**：合理配置服务端缓存策略，让浏览器自动处理缓存，减少不必要的网络请求。
    
5.  **更新缓存策略**：当资源更新时，确保使用新的缓存策略，如改变文件名或使用`Last-Modified`和`ETag`头来验证缓存。
    
6.  **监控缓存效果**：使用浏览器的开发者工具监控资源的缓存情况，确保缓存策略按预期工作。
    

通过开启 HTTP 缓存，可以显著减少页面加载时间，提升用户体验。

以下是正文：

* * *

### 导读

**开启 HTTP 缓存**是前端性能优化手段中最常见的方法之一。开启 HTTP 缓存后，当浏览器请求资源时，提供资源的服务器可以告知浏览器应该临时存储或**缓存**该资源多长时间。

只要资源的缓存没有过期，对于针对该资源的任何后续请求，浏览器将使用其本地副本，而不是从网络获取。也就有效的**减少了 HTTP 请求**，可以显著地缩短重复访问的网页加载时间。

### NGINX 服务器端配置 HTTP 缓存

与启用 Gzip 压缩实现手段类似，开启 HTTP 缓存的操作也是在服务器端配置实现。本文还是以 NGINX 服务器为例，介绍如何在 NGINX 服务器配置 HTTP 缓存。

开启 HTTP 缓存的实际操作配置就是配置 Expires 头，并且**尽量设置一个长久的 Expires**。用 lighthouse 官方文档的说法是：**采用高效的缓存政策提供静态资源。** 来看看 NGINX 服务器的配置吧：

#### cache_expiration.conf

与配置 gzip 时一样，缓存的配置信息，也建议单独保存到独立的配置文件。然后使用 `include` 在 nginx.conf 文件中引用配置。

```
http {
  # 其它配置
  
  # Specify file cache expiration.
  include web_performance/cache_expiration.conf;
}


```

在 nginx.conf 的 http 模块中引入 cache_expiration.conf 文件的缓存配置，这样只要是通过当前 NGINX 服务配置的 Web 站点也就都开启了 HTTP 缓存了。

cache_expiration.conf 配置信息如下：

```
map $sent_http_content_type $expires {
  default                                 1M;

  # No content
  ''                                      off;

  # CSS
  ~*text/css                              1y;

  # Data interchange
  ~*application/atom\+xml                 1h;
  ~*application/rdf\+xml                  1h;
  ~*application/rss\+xml                  1h;

  ~*application/json                      0;
  ~*application/ld\+json                  0;
  ~*application/schema\+json              0;
  ~*application/geo\+json                 0;
  ~*application/xml                       0;
  ~*text/calendar                         0;
  ~*text/xml                              0;

  # Favicon (cannot be renamed!) and cursor images
  ~*image/vnd.microsoft.icon              1w;
  ~*image/x-icon                          1w;

  # HTML
  ~*text/html                             0;

  # JavaScript
  ~*application/javascript                1y;
  ~*application/x-javascript              1y;
  ~*text/javascript                       1y;

  # Manifest files
  ~*application/manifest\+json            1w;
  ~*application/x-web-app-manifest\+json  0;
  ~*text/cache-manifest                   0;

  # Markdown
  ~*text/markdown                         0;

  # Media files
  ~*audio/                                1M;
  ~*image/                                1M;
  ~*video/                                1M;

  # WebAssembly
  ~*application/wasm                      1y;

  # Web fonts
  ~*font/                                 1M;
  ~*application/vnd.ms-fontobject         1M;
  ~*application/x-font-ttf                1M;
  ~*application/x-font-woff               1M;
  ~*application/font-woff                 1M;
  ~*application/font-woff2                1M;

  # Other
  ~*text/x-cross-domain-policy            1w;
}

# 时间根据变量 $expires 的配置匹配
expires $expires;


```

#### 缓存哪些资源，缓存多久？

这个 cache_expiration.conf 文件的配置可能要比大家通常看到的配置要复杂一些，不过应该也是很容易看懂的。**其主要策略就是针对不会经常调整的文件类型，尽量给一个长久的 Expires。**

另外，通过 cache_expiration.conf 配置文件的内容，也可以明确的发现，**缓存的基本上都是静态资源**，并且不同的静态资源缓存的时长是不一样的。

例如 .css 和 .js 文件，这里的配置就给了 1y（一年），字体和图片资源也设置了 1M（一个月），而经常请求的 json 数据则没有缓存。$expires 变量会根据不同的资源类型，定义不同的合适的缓存时间。

##### Lighthouse 的缓存策略

再看看前端性能分析工具 Lighthouse。如果满足以下所有条件，则 Lighthouse 会认为资源可缓存：

*   资源可以是字体、图片、媒体文件、脚本或样式表。
    
*   资源具有 `200`、`203` 或 `206` HTTP 状态代码 [1]。
    
*   资源没有明确的无缓存政策。
    

#### cache-control.conf

除了配置 Expires 头的配置，另外一个重要配置就是 `cache-control.conf` 文件。`cache-control.conf` 文件中就是针对 **Cache-Control** 首部字段的配置：

```
map $sent_http_content_type $cache_control {
    default                           'public, immutable, stale-while-revalidate';

    # No content
    ''                                'no-store';

    # Manifest files
    ~*application/manifest\+json      'public';
    ~*text/cache-manifest             ''; # `no-cache` (*)

    # Assets
    ~*image/svg\+xml                  'public, immutable, stale-while-revalidate';

    # Data interchange
    ~*application/(atom|rdf|rss)\+xml 'public, stale-while-revalidate';

    # Documents
    ~*text/html                       'private, must-revalidate';
    ~*text/markdown                   'private, must-revalidate';
    ~*text/calendar                   'private, must-revalidate';

    # Data
    ~*json                            ''; # `no-cache` (*)
    ~*xml                             ''; # `no-cache` (*)
}


```

也是在 `nginx.conf` 的 http 模块中引入：

```
http {
    # 省略其它配置...
    
    # Add Cache-Control.
    include web_performance/cache-control.conf;
}


```

跟 Expires 的配置类似，`$cache_control` 变量在此 NGINX 配置的所有 Web 站点就都可以访问该变量了。Cache-Control 中可用的指令在稍后的介绍 Cache-Control 首部字段章节会详细介绍。

### 与缓存相关的 HTTP 首部字段

HTTP 缓存配置完毕后，在我们请求的静态资源的服务器响应头中就可以看到 Expires 首部字段信息了：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEXgLUB3gRFibqQftNlQ8BouJgHR0OWXM1FDb4SPDXg8vYhcgJczpGX6Q/640?wx_fmt=jpeg)expires.png

大家可以根据自己的情况调整这里的配置，确定不怎么变动的资源，还是尽量给一个长久的 Expires。需要说明一下，HTML 页面通常视作动态资源，建议是不要设置 Expires 头的（稍后的章节中有示例会给出针对 HTML 页面的配置细节）。

因为如果 HTML 文件缓存了，缓存期间不更新，那么我们在指定时间内永远没法取到更新后的 js 和 css 或者其它静态资源。所以，HTML 缓存另一个策略是：**不缓存 html**

```
  # HTML
  ~*text/html                             0;


```

另外，如果不希望配置一个全局的静态资源的 Expires 头，可以去掉`cache_expiration.conf`文件最底部的配置：

```
# expires $expires


```

调整后，在 nginx.conf 配置文件中引入的就只是针对不同静态文件过期时间变量 `$expires` 的配置。这样就不会出现 NGINX 服务器上所有配置的所有 Web 站点都使用相同的 Expires 头的缓存配置，但又都可以访问 $expires 变量了。

到这里，关于在 NGINX 服务配置 HTTP 缓存的操作内容就结束了。是不是很容易？

#### Cache-Control 和 Expires 首部字段

在解释缓存如何很好的优化静态资源传输速度前，需要跟大家聊聊 2 个 HTTP 首部字段 - **Cache-Control** 和 **Expires**。

##### Expires 首部字段

由于 Expires 头使用一个特定时间：

```
Wed, 23 Jul 2025 12:37:27 GMT


```

这使得 Expires 头有一定的局限性，因为 Expires 头要求服务器和客户端的时间要严格同步。如果本地电脑调整了时间，超过了 Exipres 头设置的时间，也会使缓存过期。

另外，Exipres 头会经常检测过期时间，并且一旦过期了，又需要再服务器中配置提供一个新的日期。所以会有 Exipres 头设置的时间尽量长的策略。

##### Cache-Control 首部字段

为解决 Exipres 头的这些不足，HTTP 1.1 协议中引入了 **Cache-Control** 首部字段。Cache-Control 使用 `max-age` 指令指定组件被缓存多久。它以秒为单位定义更新时间。如果从资源被请求开始过去的秒数小于 max-age，浏览器就会使用缓存版本。它可以消除 Expires 头对于服务器和客户端的时间必须同步的限制。对于不支持 Cache-Control 首部字段的浏览器，我们仍然需要 Expires 头，因此一般都会同时设置 Cache-Control 和 Expires 首部字段。在支持 Cache-Control 头的浏览器，max-age 指定将重写 Expires 头。这也是为什么前文的截图中同时出现了 Cache-Control 和 Expires 首部字段的响应信息。

max-age 指定的设置策略也和 Expires 头一致，尽量设置一个较长的时间。最大可以设置 10 年，一般都设置至少 30 天以上。

**注意：** 缓存持续时间过长的一个风险就是您的用户不会看到静态文件的更新。若要避免此问题，可以将构建工具配置为在静态资源文件名中嵌入一个哈希，以使每个版本都是唯一的，从而提示浏览器从服务器提取新版本。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEOicZgGDM9a7suks4rKAESibcDdOxshWy01xTic2ONHicWk50LaAsfvP02w/640?wx_fmt=jpeg)expires-1.png

###### Cache-Control 首部字段常用指令

除 max-age 指定外，其它常用的指令还有：

*   **public**：表明响应可以被任何对象（包括：发送请求的客户端，代理服务器，等等）缓存。表示相应会被缓存，并且在多用户间共享。默认是 public。
    
*   **private**：表明响应只能被单个用户缓存，不能作为共享缓存（即代理服务器不能缓存它）, 可以缓存响应内容。响应只作为私有的缓存，不能在用户间共享。如果要求 HTTP 认证，响应会自动设置为 private。
    
*   **no-cache**：在释放缓存副本之前，强制高速缓存将请求提交给原始服务器进行验证。指定不缓存响应，表明资源不进行缓存。但是设置了 no-cache 之后并不代表浏览器不缓存，而是在缓存前要向服务器确认资源是否被更改。因此有的时候只设置 no-cache 防止缓存还是不够保险，还可以加上 private 指令，将过期时间设为过去的时间。
    
*   **only-if-cached**：表明客户端只接受已缓存的响应，并且不要向原始服务器检查是否有更新的拷贝.
    
*   **no-store**：缓存不应存储有关客户端请求或服务器响应的任何内容。表示绝对禁止缓存!
    
*   **no-transform**：不得对资源进行转换或转变。Content-Encoding, Content-Range, Content-Type 等 HTTP 头不能由代理修改。例如，非透明代理可以对图像格式进行转换，以便节省缓存空间或者减少缓慢链路上的流量。no-transform 指令不允许这样做。
    

例如我本地的测试站点，针对 HTML 页面的配置就使用了 no-cache：

```
location / {
    proxy_pass http://yao;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # 省略其它配置...

    # 不缓存 index.html
    expires -1;
    add_header Cache-Control no-store;

    # fix history router model in VUE
    try_files $uri $uri/ /index.html;
    error_page 404 /index.html;
}


```

说明一下，一直在介绍设置 Expires 头，却没有介绍如何配置 Cache-Control 头，直到示例中才展示的设置 no-store。这是因为在 NGINX 服务器中配置了 Expires 头，在配置反向代理指定了 HTTP1.1 协议后：

```
proxy_http_version 1.1;


```

NGINX 服务器会使用 Cache-Control 头重写 Expires 头，过期时间就是 Expires 头配置的时间。因此如果不是像 HTML 文件这样需要禁止缓存，没有额外的 Cache-Control 头配置。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibExr8swh5YeQavHe4wgjYokp9jajTxsR3pic1LblsIWDFuRPWQSTQ9H3Q/640?wx_fmt=jpeg)expires.png

再以前文的截图为例，这里获取到的 js 文件的 max-age 指令的时长就和 Expires 头的过期时间一致。

如果资源变化和新鲜度很重要，但仍想获得缓存的一些速度优势，请使用 `no-cache`。**浏览器仍会缓存设置为 `no-cache` 的资源，但会先向服务器进行检查，以确保该资源仍为最新资源。**

前文介绍了 Cache-Control 头允许使用的许多不同的指令，它们可用于自定义浏览器如何缓存不同资源，请根据需要选择选择合适的 Cache-Control 头指令。

最后要特别说明，虽然介绍的 Expires 头和 Cache-Control 头的 max-age 指令中推荐的策略是尽可能长，但缓存时间不一定是越长越好。最终还是应该根据实际使用情况来决定资源的最佳缓存时长。

#### Last-Modified Date 和 ETag

Cache-Control 和 Expires 两个 HTTP 首部字段是用来指定资源的缓存时长的。而服务器在检测缓存的资源是否和原始服务器上的资源匹配，则使用的是另外 2 种方式：

*   比较**最新修改日期**（Last-Modified Date）
    
*   比较**实体标签**（ETag）
    

##### 最新修改时间（Last-Modified Date）

原始服务器通过 `Last-Modified` 响应头来返回组件的最新修改日期：

```
Last-Modified: Tue, 25 Jun 2024 20:20:53 GMT


```

设置了 Expires 头后，浏览器会缓存资源和它的最新修改日期。再次请求同一资源时，浏览器会使用 `If-Modified-Since` 头将最新修改日期回传到原始服务器进行比较。如果匹配则返回 304 响应，而不会重新下载组件。

##### 实体标签（ETag）

实体标签 ETag 是 Web 服务器和浏览器用于确认缓存资源的有效性的一种机制。ETag 在 HTTP 1.1 引入，它是表示组件的特定版本的唯一性的字符串。例如：

```
Etag: 'b886a62d3dc7da1:0'


```

它是提供了另一种方式检测缓存的资源是否与原始服务器上的资源是否匹配。ETag 的检测机制要比最新修改时间更加灵活。例如，如果实体依据 User-Agent 或者 Accept-Language 头而改变，实体的状态可以反应在 ETag 中。也就是说 ETag 的唯一字符串的值会发生改变。

ETag 的验证机制是在次访问同一资源的时候，它会使用 `If-None-Match` 头将 ETag 传回原服务器。如果匹配则返回 304 响应，而不会重新下载资源。

###### ETag 的问题

通常的 Web 服务器的架构设计都是做了高可用的配置的，是由多台服务器组成的集群构建而成。例如我本地的测试站点的负载均衡的配置：

```
upstream yao {
  server 127.0.0.1:18080;
  server 127.0.0.1:18081;
  server 127.0.0.1:18082;
}


```

ETag 有个问题，当浏览器分别从两台不同的后端集群服务器中请求同一资源的时候，两台不同的服务器的 ETag 是不会一致的。

当然，我们可以通过在负载平衡的配置中添加 `keepalive` 或者设置服务器的 `weight` 权重，让同一客户端尽量从同一服务器获取资源，但还是无法保证会切换服务器请求资源。

### NGINX 配置反向代理缓存

既然提到了服务器组成的集群，除了使用普通的静态资源的 HTTP 缓存外，我们还可以将服务器集群中的原始资源缓存到代理服务器上，也就是配置**反向代理缓存**，将资源都缓存到 NGINX 服务器所在的代理服务器上。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEqfEZrTYfBht7zObCtET6ic5oP8u0bpOD3lZ2005wMrTUfhmFU1A8jBw/640?wx_fmt=jpeg)bypass-cache-purge-nginx.png

如图所示，用户第一次请求资源，NGINX 服务器会向集群中的服务器请求资源，然后缓存下来。用户再次请求数据的时候，如果 NGINX 服务器已经缓存了，NGINX 服务器就会直接响应，而不用再向上游的服务器集群的服务器请求资源了。这样就进一步优化了请求的响应速度，也更进一步的优化了前端性能。

#### 配置反向代理缓存

要配置反向代理缓存，需要在 NGINX 服务器上配置一个缓存区域，指定缓存路径，目录层级，共享内存的大小等信息。废话不多说，直接上配置文件。

##### proxy_cache_path 指令

`proxy_cache_path` 是 Nginx 中用于配置反向代理缓存的指令。它定义了缓存存储的位置、缓存大小、缓存的各种参数等。反向代理缓存可以极大地提高性能，减少对后端服务器的负载。

还是老规矩，使用独立的 **proxy_cache.conf** 文件保存 `proxy_cache_path` 配置，然后在需要的地方 include 配置；

```
proxy_cache_path  ./cache
                  levels=1:2
                  keys_zone=cache_static:100m  
                  inactive=1h  
                  max_size=300m  
                  use_temp_path=off;


```

*   **proxy_temp_path=./cache：** 缓存临时目录路径；
    
*   **levels=1:2：** 缓存目录地层级，默认所有缓存文件都放在同一个目录下，从而影响缓存的性能，大部分场景推荐使用 2 级目录来存储缓存文件；
    
*   **keys_zone=cache_static:100m：** 在共享内存中设置一块存储区域来存放缓存的 key 和 metadata（类似使用次数），这样 nginx 可以快速判断一个 request 是否命中或者未命中缓存，1m 可以存储 8000 个 key，100m 可以存储 800000 个 key；
    
*   **max_size=300m：** 最大 cache 空间，如果不指定，会使用掉所有磁盘空间（disk space），当达到配额后，会删除最少使用的 cache 文件；
    
*   **inactive=1d：** 未被访问文件在缓存中保留时间，本配置中如果 60 分钟未被访问则不论状态是否为 expired，缓存控制程序会删掉文件，默认为 10 分钟；需要注意的是，inactive 和 expired 配置项的含义是不同的，expired 只是缓存过期，但不会被删除，inactive 是删除指定时间内未被访问的缓存文件；
    
*   **use_temp_path=off：** 如果为 off，则 nginx 会将缓存文件直接写入指定的 cache 文件中，而不是使用 temp_path 存储，official 建议为 off，避免文件在不同文件系统中不必要的拷贝；
    

##### nginx.conf 引用代理缓存配置

proxy_cache_path 是一个全局性的配置，通常会在 nginx.conf 配置文件中使用 include 方式引入配置：

```
http {
  # 省略其它配置...
  
  # 代理缓存配置
  include web_performance/proxy_cache.conf;
}


```

这样只要是此 NGINX 服务配置的 Web 站点，就都可以引用 proxy_cache.conf 的代理缓存配置了。

##### 为 Web 站点的静态资源配置反向代理缓存

通常我们都是缓存静态资源，所以这里就以我本地的测试站点的静态资源的配置作为示例：

```
# 上游的服务器负载均衡配置
include upstreams/www.yao.com.conf;

server {
    listen [::]:80;
    listen 80;
    server_name www.yao.com;

    # 将 http 请求访问，跳转到相应的 https 访问路径
    return 301 https://$host$request_uri;
}

server {
    # 下次介绍配置 HTTPS 和 HTTP2
    # listen [::]:443 ssl http2;
    listen 443 ssl http2;

    server_name www.yao.com;

    # 配置证书信息
    include ssl/ssl_engine.conf;
    include ssl/default_certificate_files.conf;
    include ssl/policy_intermediate.conf;
    
    # 针对首页的配置
    location / {
        proxy_pass http://yao;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_intercept_errors on;

        proxy_next_upstream error timeout invalid_header http_500;
        proxy_connect_timeout 2;

        add_header X-Upstream $upstream_addr;
        proxy_pass_header Authorization;

        client_body_in_file_only clean;
        client_body_buffer_size 32K;
        client_max_body_size 150M;

        # 不缓存 index.html
        expires -1;
        add_header Cache-Control no-store;

        # fix history router model in VUE
        try_files $uri $uri/ /index.html;
        error_page 404 /index.html;
    }
    
    # 访问前端站点的静态文件的代理配置
    # 根据自己的需要添加静态资源的后缀名
    location ~* \.(js|css)$ {
        proxy_pass http://yao;
        
        # 通用的一些反向代理配置
        proxy_http_version  1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # 设置资源缓存的 zone，使用之前配置的 cache_static
        proxy_cache cache_static;
        # 设置缓存的 key
        proxy_cache_key $host$uri$is_args$args;
        # 设置状态码为 200 和 304 的响应可以进行缓存，并且缓存时间为 10 分钟
        # 根据自己的站点情况配置时长，时间台长 cache_static 空间很快会消耗完
        proxy_cache_valid 200 304 10m;
         
        # 调整原服务器的缓存配置
        proxy_ignore_headers Expires Set-Cookie Cache-Control;
        proxy_hide_header Cache-Control;
        proxy_hide_header Set-Cookie;
        # 调整原服务器的 Accept-Encoding
        proxy_set_header Accept-Encoding 'gzip';
        
        # 被多次用到的资源才缓存，只用一次的无需代理缓存
        proxy_cache_min_uses 2;
        # 配置自定义头 X-Cache 显示代理缓存命中状态
        add_header X-Cache $upstream_cache_status;

        # 根据之前的 $expires 匹配的资源文件类型设置过期时间
        # 当然，你也可以自己根据需要，直接设置一个合适的过期时间
        expires $expires;
        add_header Cache-Control 'public, no-transform';
    }       
}


```

##### $upstream_cache_status 变量监测代理缓存状态

NGINX 提供了 `$upstream_cache_status` 这个变量来显示缓存的状态. 在这里的配置中添加了一个自定义的 X-Cache 头，使用 `$upstream_cache_status` 监测代理缓存的状态。以下是 `$upstream_cache_status` 的可能值：

*   **MISS** - 在缓存中找不到响应，因此从原始服务器获取。然后可以缓存响应；
    
*   **BYPASS** - 响应是从原始服务器获取的，而不是从缓存中提供的，因为请求与 proxy_cache_bypass 指令匹配（请参阅下面的 “我可以通过我的缓存打孔吗？”）然后可以缓存响应；
    
*   **EXPIRED** - 缓存中的条目已过期。响应包含来自源服务器的新内容；
    
*   **STALE** - 内容过时，因为原始服务器未正确响应，并且已配置 proxy_cache_use_stale；
    
*   **UPDATING**- 内容过时，因为当前正在更新条目以响应先前的请求，并且配置了 proxy_cache_use_stale 更新；
    
*   **REVALIDATED** - 启用了 proxy_cache_revalidate 指令，NGINX 验证当前缓存的内容仍然有效（If-Modified-Since 或 If-None-Match）；
    
*   **HIT** - 响应包含直接来自缓存的有效新鲜内容；
    

默认情况下，NGINX 尊重源服务器的 Cache-Control 头。它不会缓存响应，缓存控制设置为 Private，No-Cache 或 No-Store 或响应头中的 Set-Cookie。NGINX 仅缓存 GET 和 HEAD 客户端请求。

```
# 调整原服务器的缓存配置
proxy_ignore_headers Expires Set-Cookie Cache-Control;
proxy_hide_header Cache-Control;
proxy_hide_header Set-Cookie;


```

前文中的这段配置就是为了启用代理缓存，用以忽略源服务器的 Cache-Control 头。

另外，还特别添加了 NGINX 服务器自己的 Cache-Control 头的配置：

```
add_header Cache-Control 'public, no-transform';


```

表示允许响应被被缓存，并且在多用户间共享。不得对资源进行转换或转变。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibE4kBEoMVj31PIwYvJTxuBHgvGic0bBCAgVhlgbHZO3DG0Dk9vkPnoKdA/640?wx_fmt=jpeg)屏幕截图 2024-07-28 093746.png

再看看 X-Cache 头，也就是 `$upstream_cache_status` 的值已经是 **HIT** 状态，表示该静态资源已经被代理缓存命中了。

OK，现在让我们来看看反向代理缓存都存了些什么：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibE06oia3zT50mj0ArJDPbL2ibxgECaqT4hQUnPSNfjPia1s41ALMr4qf0ow/640?wx_fmt=jpeg&from=appmsg)proxy-cache.png

从截图我们可以看到，配置的 2 级缓存已经启用了。缓存的文件是二进制的内容，我截取一段用文本编辑器打开的数据来看看：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEwib8kIbPj1IRYktdHYlvcOhBCGWDxBL6P3Esl4o6mftnOAicgZ1YfMjg/640?wx_fmt=jpeg)proxy-cache-content.png

这里的 KEY:

```
KEY: www.yao.com/js/909.86428264.js


```

正是我们配置的反向代理缓存的中 `proxy_cache_key` 配置的数据格式：

```
# 设置缓存的 key
proxy_cache_key $host$uri$is_args$args;


```

#### proxy_cache_purge 清除反向代理缓存

若要手动清除缓存，可以使用 `proxy_cache_purge` 模块。配置代码如下：

```
# 用于清除缓存，假设一个URL为: https://www.yao.com/#/default
# 访问 https://www.yao.com/#/purge/defaut 就可清除该URL的缓存
location ~ /purge(/.*) {
    # 设置只允许指定的IP或IP段才可以清除URL缓存。
    allow 127.0.0.1;
    deny all;
    proxy_cache_purge cache_static $host$uri$is_args$args;
}


```

这个清理缓存的路径应该只有特定（运维）人员有权限访问，清理缓存。

##### 编译安装 Nginx 并且添加 ngx_cache_purge 模块

另外，`proxy_cache_purge` 不是 NGINX 服务器自带的指令模块，需要手动下载编译安装。

###### 第 1 步：获取 nginx

在 `/etc/nginx/source` 下执行，具体是在那个目录，可以自行决定：

```
wget http://nginx.org/download/nginx-1.21.0.tar.gz
tar -zxvf nginx-1.12.2.tar.gz


```

###### 第 2 步：获取 ngx_cache_purge

在 `/etc/nginx/source` 下执行，具体是在那个目录，可以自行决定，这里建议与下载的 nginx 目录一致：

```
wget https://github.com/FRiCKLE/ngx_cache_purge/archive/2.3.tar.gz
tar -zxvf 2.3.tar.gz


```

###### 第 3 步：修改 nginx 安装配置

```
./configure --prefix=/etc/nginx  \
--with-http_stub_status_module  \
--with-http_ssl_module --with-stream  \
--with-http_gzip_static_module  \
--with-http_sub_module \
--with-pcre  \
--add-module=../ngx_cache_purge


```

`--add-module=../ngx_cache_purge` 这是新增的，如果要查看以前的 configure 参数，可以使用以下命令查看，然后复制后再后边加入需要添加的配置即可。

```
nginx -V


```

###### 第 4 步：编译安装

如果以前未安装过：

```
make && make install


```

编译安装完成后，配置 nginx。

如果以前已经安装了 nginx 服务器，需要先停止 nginx 服务：

```
# 默认 nginx 已经配置为系统服务
service nginx stop


```

重新编译，在 `/etc/nginx/source` 下执行

```
make


```

将编译好的 nginx 文件覆盖到`/etc/nginx/sbin/nginx`：

```
cp objs/nginx /etc/nginx/sbin/nginx


```

安装编译完成，然后按前文到需要的模块配置 `proxy_cache_purge`, 然后检测配置文件是否正确：

```
nginx -t/T


```

如果配置检测通过，就可以重启 nginx 服务：

```
service nginx start


```

另外，NGINX 服务器的商业版 Nginx Plus 中自带了清理缓存的指令，有兴趣的同学可以自己查阅一下相关资料，本文仅介绍 NGINX 服务器免费版的配置。

本文到此为止我们已经介绍了如何 NGINX 服务器配置 HTTP 缓存、与换窜相关的 HTTP 首部字段、如何在 NGIN 服务器配置反向代理缓存以及如何清理反向代理缓存。所有于开启 HTTP 缓存相关的配置就都已经介绍完毕了。

### 开启 HTTP 缓存后的性能对比

最后，还是一起再看看开启 HTTP 缓存后的性能提升对比吧：

#### 未开启 HTTP 缓存

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibErhH7y8XmyCkQBSresQZa2n75PNvic8qVPk9LZ8QibHKgU2co926gIy5A/640?wx_fmt=jpeg&from=appmsg)no-cache.png

*   完成时间：1.79 秒
    
*   DOMContentLoaded：442 毫秒
    
*   加载时间：1.72 秒
    

#### 开启 HTTP 缓存

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEMQicFp1HKIicWt67SHefuK07ia8gvYswKFEXNia9IS0rdYHPXMdrzJnV9A/640?wx_fmt=jpeg&from=appmsg)cache.png

*   完成时间：677 毫秒
    
*   DOMContentLoaded：190 毫秒
    
*   加载时间：625 秒
    

效果还是很明显的，特别是像我测试站点这种 SPA 页面，一切都要等 js 资源加载完成了才绘制界面，加载速度至关重要！资源加载的越快，意味着用户看到 UI 界面就越快，用户体验也就越好。

### 总结

本文的标题是介绍前端性能优化，但基本都是在介绍如何配置 NGINX 服务器。所以要求前端开发工程师需要掌握必要的 NGINX 服务器相关的知识。起码是跟前端开发或者性能优化相关的知识点。

然后就是对于 HTTP 协议基础支持的了解，需要知道常用的 HTTP 首部字段的含有，以便于我们分析一些网络问题。

> 原文地址：https://juejin.cn/post/7406143794000019506
> 
> 作者: 自由的巨浪