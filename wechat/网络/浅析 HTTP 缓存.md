> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/dt1_TrjgAwRxz73vqeACiw)

[视频详情](javascript:;)

1. 为什么需要缓存
----------

*   通过缓存机制，可以在相应场景下复用以前获取的资源。
    
*   显著提高网站的性能和响应速度
    
*   减少网络流量和等待渲染时间
    
*   降低服务器压力
    

2. HTTP 缓存类型
------------

*   强缓存
    
*   协商缓存
    

3. 强缓存
------

对于强缓存，服务器返回的静态资源响应头会设置一个强制缓存的时间，在缓存时间内，如刷新浏览器请求相同资源，在缓存时间未过期的情况下，则直接使用已缓存资源。如缓存资源已过期，执行协商缓存策略。

*   以下为与强缓存相关的 HTTP 头部字段
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9feXo8txcmiaLiaibtVMoUcWfBkMJJibe2FyDfc1gWjDibJsq3hz4baaTx5zytJQcErGBlxmiaqlibcDNfg/640?wx_fmt=png)

### 3.1 Expires

*   响应头`Expires`字段包含强缓存资源的过期时间
    
*   值为 0 表示资源已过期或非强缓存
    

### 3.2 Cache-Control

通用消息头字段，通过指令来实现缓存机制。说明一下容易弄混的两个字段，其他指令参考指令大全 [1]。

*   `no-cache`
    

在发布缓存副本之前，强制要求缓存把请求提交给原始服务器进行验证 (协商缓存验证)。

*   `no-store`
    

缓存不应存储有关客户端请求或服务器响应的任何内容，即不使用任何缓存。

### 3.3 Expires 和 Cache-Control 的区别

*   时间区别
    

*   `Expires` 过期时间为绝对时间，指未来某个时间点缓存过期。
    
*   `Cache-Control` 为相对时间，相对于当前时间，如 60s 后缓存过期
    

*   优先级
    

*   `Expires` 的优先级低于 `Cache-Control` 字段
    
*   同时存在 `Cache-Control` 和 `Expires`时，以 `Cache-Control` 指令为准
    

*   HTTP 版本
    

*   `Expires` 是 HTTP/1.0 提出的，其浏览器兼容性更好
    
*   `Cache-Control` 是 HTTP/1.1 提出的，浏览器兼容性不佳，所以 `Expires` 和 `Cache-Control` 可以同时存在，在不支持 `Cache-Control`的浏览器则以`Expires`为准
    

4. 协商缓存
-------

*   协商缓存即和服务器协商是否使用缓存，通过判断后决定重新加载资源 or HTTP StatusCode 304
    
*   以下字段决定是否使用协商缓存，而非强缓存：
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9feXo8txcmiaLiaibtVMoUcWfCrsAbFwQz8A2fjOoGgXe6R7tKJCC0cAxQ7FpcKRHDEObPVB3NDmeHA/640?wx_fmt=png)

### 4.1 Pragma

*   `Pragma`是一个 HTTP1.0 中规定的通用首部，如果`Cache-Control`不存在的话，它的行为与`Cache-Control: no-cache`一致。强制要求缓存服务器在返回缓存的版本之前将请求提交到源头服务器进行协商验证。
    
*   `Pragma` 的值就只有一个，`no-cache`，并且它的优先级比 `Cache-Control` 高。
    

### 4.2 Cache-Control

*   上文介绍过`Cache-Control`，它的指令既可以用于强缓存又可应用于协商缓存策略中
    
*   其中`Cache-Control: no-cache` 和 `Cache-Control: max-age=0` 的作用一样，强制要求发起请求给服务器进行验证 (协商资源验证)。
    

5. 协商策略
-------

当出现`Pragma`字段或者`Cache-Control:no-cache`时，就需要使用协商策略，常见的两对协商缓存字段如下

*   `ETag/If-None-Match`
    
*   `Last-Modified/If-Modfied-Since`
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9feXo8txcmiaLiaibtVMoUcWfy63IWYLkxZ66KInQna4fXlDayCyDI0AH0BHuEPEIQVy7CicxsCcI7NA/640?wx_fmt=png)

### 优缺点

*   如果服务端修改了一段代码，然后又改回去了。
    

*   此时资源文件的修改时间变了
    
*   实际上文件没有发生改变
    
*   这样缓存就失效了，产生了不必要的传输
    

*   而 ETag 可以根据内容生成的 hash 来比较的，只要资源文件内容不变，就会应用客户端的缓存，减少不必要的传输。
    
*   所以 ETag 比 Last-Modified 缓存更精确、高效和节省带宽。
    

6. ETag
-------

### 6.1 什么是 ETag？

Etag 是 Entity tag 的缩写，可以理解为 “**被请求资源的摘要标识**”，Etag 是服务端的一个资源的标识，在 HTTP 响应头中将其传送到客户端，类似这样，**ETag:W/"50b1c1d4f775c61:df3"**

### 6.2 ETag 格式

*   `ETag:W/"xxxxxxxx"`
    
*   `ETag:"xxxxxxx"`
    

#### 强类型验证

*   比对资源每个字节都要一样。
    

#### W / 前缀代表使用弱类型验证

*   不需要每个字节都一样，例如页脚的时间 or 展示的广告不一样，都可以认为是一样的。构建应用于弱验证类型的标签（etag）体系可能会比较复杂，因为这会涉及到对页面上不同的元素的重要性进行排序，但是会对缓存性能优化相当有帮助。
    

### 6.3 ETag 生成需要满足什么条件？

1.  当文件更改时，ETag 值必须改变
    
2.  尽量便于计算，不会特别耗 CPU。
    
3.  利用摘要算法生成（MD5, SHA128, SHA256）需慎重考虑，这些为 CPU 密集型运算。
    
4.  不是不能用。没有最好的算法，只有适合对应场景的算法。
    
5.  必须横向扩展，分布式部署时多个服务器节点上生成的 ETag 值保持一致。
    

### 6.4 ETag 是怎么生成的（Nginx）

Nginx[2] 的源码中 ETag 由 last_modified 和 content_length 拼接而成

```
etag->value.len = ngx_sprintf(etag->value.data, "\"%xT-%xO\"",                                  r->headers_out.last_modified_time,                                  r->headers_out.content_length_n)                      - etag->value.data;
```

*   翻译为以下伪代码
    

```
etag = header.last_modified + "-" + header.content_lenth
```

*   总结：Nginx 中 ETag 由响应头的`Last-Modified`和`Content-Length`表示为十六进制组合而成。
    

**Lodash 网站请求检验**

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9feXo8txcmiaLiaibtVMoUcWfDZuTpsNLLbzUSsVNg9mRKFeSrQtibLUCUv16yh5rT6MUtABZOElvtRQ/640?wx_fmt=png)

```
const LAST_MODIFIED = new Date(parseInt('5fc4907d', 16) * 1000).toJSON()const CONTENT_LENGTH = parseInt('f48', 16)console.log(LAST_MODIFIED) // 2020-11-30T06:26:05.000Zconsole.log(CONTENT_LENGTH) // 3912
```

*   输出结果
    

![](https://mmbiz.qpic.cn/mmbiz_png/lP9iauFI73z9feXo8txcmiaLiaibtVMoUcWfbzJDYRpy20TR5pzSNicbomRej1WbclyvCCXyRBhwGMP5eNrF1qdkNrg/640?wx_fmt=png)

*   既然在`nginx`中`ETag`由`Last-Modified`和`Content-Length`组成，那它便算是一个加强版的`Last-Modified`了，那加强在什么地方呢？
    
*   `Last-Modified`只能作用于秒级的改变，而 `nginx` 中的 `ETag` 添加了文件大小的附加条件，不仅和修改时间有关，也和内容有关，使之更加精确。
    

### 6.5 Last-Modified 是怎么生成的

在 linux 中

*   `mtime`：`modified time`指文件内容改变的时间戳
    
*   `ctime`：`change time`指文件属性改变的时间戳，属性包括`mtime`。而在 `windows` 上，它表示的是`creation time`
    
*   而 HTTP 服务选择`Last-Modified`时一般会选择`mtime`，表示文件内容修改的时间，来兼容 Windows 和 Linux。
    
*   以下为 nginx 源码 [3]
    

```
r->headers_out.status = NGX_HTTP_OK;    r->headers_out.content_length_n = of.size;    r->headers_out.last_modified_time = of.mtime;
```

### 6.6 如果 http 响应头中 ETag 值改变了，是否意味着文件内容一定已经更改？

*   不一定
    
*   文件在一秒内发生了改变而且文件大小不变
    
*   这种情况非常极端，概率很低
    
*   因此在正常情况下可以容忍一个不太完美但是高效的算法。
    

### 参考资料

[1]

_https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control_

[2]

_https://github.com/nginx/nginx/blob/6c3838f9ed45f5c2aa6a971a0da3cb6ffe45b61e/src/http/ngx_http_core_module.c#L1582_

[3]

_https://github.com/nginx/nginx/blob/4bf4650f2f10f7bbacfe7a33da744f18951d416d/src/http/modules/ngx_http_static_module.c#L217_