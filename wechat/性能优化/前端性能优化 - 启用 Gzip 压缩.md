> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ois8jtLBBCjOFzNOyShwyA)

前端性能优化是提升网站加载速度和用户体验的重要手段。启用 Gzip 压缩是其中一种常见的优化技术。Gzip 是一种广泛使用的压缩算法，它可以显著减少传输到客户端的数据量。今天分享这篇文章来详细谈谈如何开启 Gzip 压缩来优化前端性能。

以下是正文：

* * *

启用 gzip 压缩可大幅缩减所传输的资源文件响应的大小（最多可缩减 90%），服务器将向客户端发送较小的资源，从而显著缩短下载相应资源所需的时间、减少客户端的流量消耗并加快网页的首次呈现速度。因此，它是前端性能优化的一个重要手段。今天就来介绍一下如何启用 gzip 压缩？

虽然今天的标题里有前端两个字，但实际的启用 gzip 配置操作都在后端。主要介绍的如何在 nginx 服务器端启用 gzip 压缩。

nginx 是一款性能强大的服务器，它提供了很多对优化 Web 性能有帮助的功能配置。包括我们今天的主题，对静态资源提供 gzip 压缩的能力。

需要压缩的资源类型
---------

在具体介绍 nginx 服务器如何开启 gzip 压缩前，我们需要知道需要压缩哪些类型的资源文件？使用 gzip 压缩的最大错误之一是压缩每个页面可用的每个资源对象。首先需要知道，**gzip 压缩主要对文本类型的资源压缩效果最好**，例如常用见的文本资源：

*   HTML 文件：text/html（nginx 服务器默认就会压缩）、application/xhtml+xml
    
*   CSS 文件：text/css
    
*   JS 文件：application/x-javascript、application/javascript、text/javascript
    
*   JSON 文件（或者 API 请求结果）：application/json、application/geo+json、application/ld+json application/manifest+json、application/x-web-app-manifest+json
    
*   XML 文件：application/xml、application/atom+xml、application/rdf+xml、application/rss+xml
    
*   SVG 文件：image/svg+xml;
    

除了常用的文本文件，gzip 也支持压缩以下 MIME 类型的文件：

*   application/vnd.ms-fontobject
    
*   application/wasm
    
*   font/eot
    
*   font/otf
    
*   font/ttf
    
*   image/bmp
    
*   text/cache-manifest
    
*   text/calendar
    
*   text/markdown
    
*   text/plain
    
*   text/vcard
    
*   text/vnd.rim.location.xloc
    
*   text/vtt
    
*   text/x-component
    
*   text/x-cross-domain-policy
    

需要说明的是，图片本身就是压缩格式的数据，要压缩图片需要使用针对图片资源的专门优化方式，本文就不多介绍了。

确定 Nginx 服务器是否支持 GZip
---------------------

如果你是使用 CentOS （本文以 CentOS 为例）或者使用其它 linux 服务器，通过包管理工具（yum、apt-get、dnf 等）安装的 nginx，默认就开启了对 gzip 模块的支持。

```
# Nginx 默认不在 CentOS 的 yum 包安装源仓库中，需要添加 CentOS 7 EPEL 仓库
sudo yum install -y epel-release

# 使用 yum 安装 nginx
sudo yum install -y nginx


```

nginx 中的 gzip 处理模块是：**ngx_http_gzip_module**。可以使用：**nginx -V** 命令，查看 nginx 服务器是否开启了对 gzip 的支持模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEngnRAV2g09rc7VNDZn1Gfqr3JWoWxVN0ojYAVSLV3VDdZ82Zmxiajsg/640?wx_fmt=jpeg&from=appmsg)gzip-1.png

如果显示如上图所示的：**–with-http_gzip_static_module**，就说明你的 nginx 服务器已经支持 gzip 了，可以开始配置 gzip 压缩了。

源码编译安装 Nginx
------------

如果使用的 nginx 没有开启 ngx_http_gzip_module 模块，那么就需要使用源码方式重新编译安装 nginx，并配置开启 ngx_http_gzip_module 模块。

### 第 1 步：安装编译 nginx 的依赖包

源码编译安装 nginx 需要先安装按章编译相关的依赖包，命令如下：

```
sudo yum install gcc libpcre3 libpcre3-dev openssl libssl-dev libssl0.9.8 perl libperl-dev


```

### 第 2 步：下载 nginx

根据你的需要下载相应的 nginx 版本，命令如下：

```
wget http://nginx.org/download/nginx-1.11.2.tar.gz


```

### 第 3 步：进行编译安装前的配置

解压下载的文件，根据自己的情况解压到指定目录：

```
# 解压要 /usr/src，根据实际情况调整路径 
tar -xzvf nginx-1.11.2.tar.gz -C /usr/src


```

然后跳转到解压后的目录

```
cd /usr/src/nginx-1.11.2


```

接着配置生成 makefile，如果需要添加第三方模块，使用 –add-module=/path/module1 的方法编译，安装地址是 /usr/local/nginx，这个要根据你的实际情况配置：

```
# 根据实际情况配置，这里只写出了启用 gzip 的配置 
./configure --prefix=/usr/local/nginx --with-http_gzip_static_module


```

最后就是是编译安装了：

```
# make 是生成在objs目录中，make install 则安装到 prefix 所示的目录中 
make && make install


```

没有错误出现的话，就可以进入指定的存放 nginx 配置文件的目录 (/usr/local/nginx) 进行配置了。当然，手动安装完成后，还是可以使用 nginx -V 命令查看以下，确定已经正确开始 nginx 服务器的 gzip 压缩支持模块。

配置 GZip 压缩
----------

在确定支持 gzip 后，就可以进行 gzip 压缩相关的配置了。使用 vim 编辑器打开 nginx.conf 配置文件：

```
sudo vim /usr/local/nginx/nginx.conf


```

打开文件后，按 i 键进入编辑模式，在 http 块中输入以下配置信息：

```
#  gzip 可以在 http, server, location 中和配置，这里配置到 http 下是全局配置，
#  只要是使用当前 nginx 服务器的站点都会开启 gzip
http {
  gzip on;
  gzip_comp_level 5;
  gzip_min_length 1k;
  gzip_buffers 4 16k;
  gzip_proxied any;
  gzip_vary on;
  gzip_types
    application/javascript
    application/x-javascript
    text/javascript
    text/css
    text/xml
    application/xhtml+xml
    application/xml
    application/atom+xml
    application/rdf+xml
    application/rss+xml
    application/geo+json
    application/json
    application/ld+json
    application/manifest+json
    application/x-web-app-manifest+json
    image/svg+xml
    text/x-cross-domain-policy;
  gzip_static on;  
  gzip_disable "MSIE [1-6]\.";  
}


```

不知道这些配置都代表什么意思？现在来逐一解释每项配置的意思：

*   gzip on;：开启 gzip，Default: off
    
*   gzip_comp_level 5;：压缩级别：1-9。**5 是推荐的压缩级别，即可保证压缩的效果（对大多 ASCII 编码的文件可以达到 75% 的压缩比），同时对 CPU 资源的损耗也比较低。** 实测 6-9 的压缩比压缩的效果与 5 相比效果并不明显，而且对 CPU 资源的消耗会比较大，所以推荐压缩等级设置为 5。Default: 1
    
*   gzip_min_length 1k;：gzip 压缩文件体积的最小值。如果文件已经足够小了，就不需要压缩了，因为即便压缩了，效果也不明显，而且会占用 CPU 资源。Default: 20
    
*   gzip_buffers 4 16k;：设置用于压缩响应的 number 和 size 的缓冲区。默认情况下，缓冲区大小等于一个内存页。根据平台的不同，它也可以是 4K 或 8K。
    
*   gzip_proxied any;：是否开启对代理资源的压缩。很多时候，nginx 会作为反向代理服务器，实际的静态资源在上有服务器上，只有开启了 gzip_proxied 才会对代理的资源进行压缩。Default: off
    
*   gzip_vary on;：每当客户端的 Accept-Encoding-capabilities 头发生变化时，告诉代理缓存 gzip 和常规版本的资源。避免了不支持 gzip 的客户端（这在今天极为罕见）在代理给它们 gzip 版本时显示乱码的问题。Default: off
    
*   gzip_types：压缩文件的 MIME 类型。`text/html` 默认就会开启 gzip 压缩，所以不用特别显示配置 `text/html` 的 MIME 类型。Default: text/html
    
*   gzip_static on;：服务器开启对静态文件（ CSS, JS, HTML, SVG, ICS, and JSON）的压缩。但是，要使此部分与之相关，需要在 gzip_types 设置 MIME 类型，，仅仅设置 gzip_static 为 on 是不会自动压缩静态文件的。
    
*   gzip_disable “MSIE [1-6].”;：IE6 以下的浏览器禁用 gzip 压缩。
    

现在应该对各个配置项的意义有了更一步的了解了。其实在 nginx 中调用 gzip 配置方式也有更好处理方式。更加推荐的一种做法是将 gzip 的配置保存到独立的配置文件中，例如：gzip.conf。然后在需要启用 gzip 压缩的地方，例如上面的代码在 nginx.conf 文件中引用 gzip.conf 文件：

```
http {
  # 引用 gzip 配置，本例是在 http 模块中调用，表示所有通过此 nginx 服务器配置的站点
  # 将全部都开启 gzip 压缩 
  include path/to/gzip.conf;
}


```

这种处理方式的好处是以后仅需在 gzip.conf 文件中调整配置就可以了，并且调整配置后，所有调用 gzip.conf 配置的地方就一次性全部都调整了。

好了，在完成 gzip 的配置以后，按冒号 “:” 键，输入 wq，保存配置并退出 vim 编辑器。然后输入重启 nginx 命令：

```
# 或者 sudo service nginx restart 
sudo service nginx reload


```

当然，如果你不放心 gzip 相关的配置是否编写正确，也可以使用 nginx -t 检测 nginx.conf 配置是否正确。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEC23KWcuolsIaHAScHfDojibtRSb5zhodbJq520C21LORB5GWO70qyicQ/640?wx_fmt=jpeg)gzip-2.png

如图所示，表示 nginx.conf 配置正确无误。

验证 GZip 压缩效果
------------

我们打开 Chrome 浏览器的开发者工具，然后查看 Network 面板查看我们的配置是否生效:

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEIAetBKZw6kkr88dTPsjafoich0eoluMXUEC5AialmMwvpw3QowlOJLicw/640?wx_fmt=jpeg)gzip-3.png

上图是测试站点 index.html 文件的服务端响应头信息，重点查看以下几个响应头信息：

*   content-type: text/html; charset=utf-8：表示返回的数据的 MIME 类型是 text/html；
    
*   content-encoding: gzip：该文件采用了 gzip 压缩编码；
    
*   vary: Accept-Encoding：（配置说明中提到的）当客户端的 Accept-Encoding-capabilities 头发生变化时，告诉代理缓存 gzip 和常规版本的资源。
    

看到有 **vary: Accept-Encoding** 头信息，表明在 gzip.conf 文件配置的 gzip_proxied any; 和 gzip_vary on; 也起作用了。因为示例中的测试站点确实使用 nginx 的反向代理配置，需要访问上游服务器集群，其配置如下。

```
# 站点的配置
location / {
    # 代理到名为 blog 的负载均衡集群
    proxy_pass http://blog;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}


```

当客户端的 Accept-Encoding-capabilities 头发生变化时，会告诉 nginx 服务器代理缓存 gzip 和常规版本的资源。现在对 vary: Accept-Encoding 的解释是不是已经很清楚了？

启用 GZip 的压缩效果
-------------

示例站点的 index.html 页面原始大小为 81.6 KB，压缩后的大小为 30.4KB, 压缩后体积减小了 63%。启用 gzip 压缩后的效果还是很明显。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/U0WXqkJLdLSDdDhw69ic0RKeN1ctdvsibEBj4fZX5vL6NPehzqQNfc3WyYdHOdzlqePZoDLmiaWfzHDJr8If1FSIg/640?wx_fmt=jpeg)gzip-4.png

（在服务器端 nginx 服务器中）启用 gzip 压缩，对于目前流行的单页面应用而言，起到的前端性能优化作用的意义就更大了。因为单页面应用的界面完全是由 JavaScript 动态绘制出来的，启用 gzip 压缩后会更快速的加载资源文件，特别是加速对 .js 文件的资源下载速度。这样就能尽快地执行 JavaScript 绘制显示 UI 界面，从而提升用户体验。

总结
--

虽然今天的主题聊的是前端性能优化，不过可以看出，作为前端工程师，现在的要求是越来越高了。不仅仅需要掌握前端相关的技术，还需要掌握一些后端相关的技能。在做前端性能优化时，很多时候还需要了解一些 nginx 服务器配置相关的知识，才能更加系统的优化前端性能的。

例如前端性能优化的另外一个重要手段；启用浏览器缓存，就要求需要了解如何在服务端配置启动用缓存。还有为了提高服务器的 HTTP 响应速度，需要在服务端开启 HTTP/2。这都要求前端工程师掌握一定的后端的服务器配置能力。

> 原文地址：https://juejin.cn/post/7388347353407143973
> 
> 作者：自由的巨浪