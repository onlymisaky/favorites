> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/s4nDeYfZRO6eE5weXJ43LA)

> 该文章是实践了这篇文章 juejin.cn/post/7141308011921801223 之后想写的。原文已经讲得很详细了，内容也详实，我只是想分享一下对我而言最简单好用的
> 
> **同时再讲一下为什么这样配置能够生效**。

**前言**
======

一般情况下，前端在开发本地项目的时候大都用不到 https，但有些特殊情况不同，比如你需要使用 service worker，又或者需要使用 cookie 而后端又设置了 secure。

nextjs 本身提供了直接通过 https 启动项目的方法，所以假如『https://localhost:port 』 这种域名就能满足需求的话，建议直接按照 nextjs 官方提供的方法进行配置即可。

API Reference: Next.js CLI | Next.js

另外 ngrok 也是非常流行的解决方案，注册个账号之后几乎就是点点鼠标的事，非常好用。

但由于我们项目的 cookie 除了设置了 secure，还设置了 domain，localhost/127.0.0.1 是拿不到这个 cookie 的，所以我必须要在本地成功使用 https://*.example.com 指向本地项目才行。

不管你是用 Vite 或者和我们一样用 Next，跟着下面操作，你最后都能跑起来的！

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/yphVQAwjncvvfplmxicnhibgtxpA96FzL3PEHUxpT49GG1X4BOd5GFE5R8baDkXK6AptWNzuibnvYeMrv7icoEDCag/640?wx_fmt=jpeg&from=appmsg)

**实际操作**
========

我在这个过程中所用到的环境和依赖如下

*   macos(windows 下建议使用 wsl，命令行很好用！
    
*   nginx
    
*   mkcert
    

下面我们以一个 nextjs 的项目为例，默认运行在 3000 端口上

**线上域名假设为 example.com**

**1. 修改 hosts 文件**
------------------

在 macos 中，默认 hosts 文件是存放在 / etc 文件夹下的，可以用下面的命令编辑 hosts

```
bash复制代码sudo vim /etc/hosts
```

然后可以在里面添加上对应的本地 url 和线上 url。我们的项目中 cookie 的 domain 设置为 `.example.com` ，这意味着所有子域名都是通用的，所以我选择添加一个乱写的子域名，假设是 **loft**.example.com。如下修改 hosts 文件

```
复制代码127.0.0.1 loft.example.com
```

**2. 安装需要的依赖**
--------------

如果你还没有安装 homebrew 的话是用不了 `brew install` 的，记得要先去安装一下 brew.sh/

如果你使用得是 windows 且用的是 powershell 而不是 wsl，那么你可以使用 Chocolatey 的`choco install` 安装下面的依赖或者自行寻找别的方法。

接下来安装我们需要的两个东西，nginx 就不用介绍了，**而 mkcert，是拿来解决我们的刚需——制作 ssl 证书**的。

```
bash复制代码brew install nginx 
brew install mkcert
```

**3. 新建证书**
-----------

在刚才安装好 mkcert 之后，现在再运行下面的命令

```
bash复制代码mkcert loft.example.com
```

**4. 配置并启用 nginx**
------------------

当你按照默认流程安装完毕之后，可以按照下面的流程操作创建一个 nginx 配置

```
bash复制代码# 检查下nginx配置的路径并确定nginx安装成功nginx -t# 这是默认的nginx安装路径，先去到这里cd /usr/local/etc/nginx# 检查下是否有 servers 文件夹ll -a# 如果没有servers文件夹再使用下面的命令创建# mkdir servers# 进入servers文件夹cd servers# 创建一个nginx配置touch custom.conf# 修改该配置sudo vim custom.conf
```

然后我们将下面的配置写进去

```
bash复制代码upstream loft.example.com {  # 你本地项目跑在什么端口这里就写什么端口，next默认3000，vite默认5173  server 127.0.0.1:3000;}server {    listen 80;    listen 443 ssl;    server_name loft.example.com;        ssl_certificate     /Users/username/loft.example.com.pem;    ssl_certificate_key /Users/username/loft.example.com-key.pem;    ssl_protocols       TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;    ssl_ciphers         HIGH:!aNULL:!MD5;    location / {        proxy_pass http://loft.example.com;        proxy_http_version 1.1;        proxy_set_header Upgrade $http_upgrade;        proxy_set_header Connection "upgrade";    }}
```

ssl_* 那部分就是你的 https 证书配置了。mkcert 会默认把生成的证书文件放到 `/Users/你的用户名/`文件夹下面

保存之后退出，然后在控制台输入 `nginx`启动服务

```
bash复制代码nginx
```

如果之前已经启动了，可以输入 `nginx -s reload`

```
bash复制代码nginx -s reload 
```

之后我们本地运行好前端项目，确保项目此时跑在 nginx 配置的 URL 里（在上面的例子中是 127.0.0.1:3000）。

然后打开浏览器，输入 `https://loft.example.com` ，就会看到此时打开的就是你的前端项目了。

> 注意：要确保你配置的域名没有经过代理，否则可能配置不生效。

**4.1 Vite 项目可能要使用 --host**
---------------------------

针对 vite 项目，你可能需要将项目暴露出来，否则会提示 `502 Bad Gateway`

暴露的方法也很简单，`npm run dev`的时候加个`--host`就行

```
bash复制代码npm run dev --host
```

实际上 vite 项目运行后也有提示的![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrkolC6v7wgDnyrzcokWpISHtJgVHYmibxh99dWxsKsxqAUXprXF9ngYtYTVPuYeryxbhIlDvibcuN6Q/640?wx_fmt=jpeg&from=appmsg)

**为什么能使用 https**
================

**简单解释**
--------

我们成功地通过以上步骤在本地实现了使用 HTTPS 的效果，你可能也会好奇为什么这一切会生效。

让我们来简要解释一下。

首先，我们修改了本地的 hosts 文件，将一个虚拟的子域名指向了本地的 IP 地址。这样做的目的是为了让本地的服务能够在浏览器中被访问到，并且能够与线上环境中的设置保持一致。

接着，我们使用了 mkcert 工具生成了一个自签名的 SSL 证书，这个证书包含了我们刚刚设置的虚拟子域名。这样，浏览器在访问我们的本地服务时就会信任这个证书，从而成功建立安全连接。

最后，我们通过配置 Nginx，将本地服务暴露在了 443 端口，并且使用了我们生成的 SSL 证书来进行 HTTPS 通信。这样一来，当浏览器访问 loft.example.com 时，Nginx 就会将请求转发到本地的服务上，而由于使用了 SSL 证书，通信就变得安全可靠。

配合修改本地 hosts 文件使得 loft.example.com 解析到本地（127.0.0.1），你可以在本地访问这个域名，并且 Nginx 将会把请求代理到本地的服务。HTTPS 配置使得这个代理过程是安全的。

综上所述，通过修改 hosts 文件、生成 SSL 证书以及配置 Nginx，我们成功地在本地实现了 HTTPS 连接，从而使得我们的前端项目能够在本地环境中顺利运行。

**nginx 配置详解**
--------------

可能 nginx 的配置那块儿还是会比较困惑，我们来看一下每一个部分分别代表什么：

1.  `upstream loft.example.com { ... }`: 这定义了一个名为 "loft.example.com" 的 upstream 块，指定了后端服务器的地址和端口。在这种情况下，后端服务器位于本地，监听地址为 127.0.0.1，端口为 3000。这个块允许 Nginx 将请求转发给指定的后端服务器。
    
2.  `server { ... }`: 这是一个虚拟主机配置块，指定了服务器监听的端口和协议，以及对应的域名。在这里，服务器监听了 80 端口（HTTP）和 443 端口（HTTPS），并且将 loft.example.com 作为服务器名。因此，这个配置块将处理针对 loft.example.com 的所有请求。
    
3.  SSL/TLS 配置:
    

*   `ssl_certificate` 和 `ssl_certificate_key` 指令指定了 SSL 证书和私钥的路径，用于启用 HTTPS。
    
*   `ssl_protocols` 指定了支持的 SSL/TLS 协议版本。
    
*   `ssl_ciphers` 指定了允许使用的密码套件。
    

5.  `location / { ... }`: 这里定义了请求处理的位置。当收到来自客户端的请求时，如果请求路径匹配 `/`，Nginx 将会执行以下代理配置：
    

*   `proxy_pass http://loft.example.com;`: 将请求代理到名为 "loft.example.com" 的 upstream 块所定义的后端服务器。
    
*   `proxy_http_version 1.1;`: 指定使用 HTTP 1.1 协议进行代理传输。
    
*   `proxy_set_header Upgrade $http_upgrade;` 和 `proxy_set_header Connection "upgrade";`: 这两行指定了在进行 WebSocket 通信时更新请求头以支持升级连接。
    

当然，hosts 也至关重要，否则请求根本不会来到本地😂

**尾言**
======

如果本篇文章对你有一点点帮助，还希望你能给我点一个免费的赞，这会给我进行创作带来莫大的鼓励，谢谢你！

如果你觉得我写得哪里有问题，也请你在评论区指出，我们可以友好讨论😄

> 作者：evanryuu
> 
> 链接：https://juejin.cn/post/7341207809357103119