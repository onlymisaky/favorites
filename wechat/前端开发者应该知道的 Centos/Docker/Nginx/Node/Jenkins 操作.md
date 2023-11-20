> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6GYD0l3FH6kC7nfwX-x7ow)

点击上方 前端瓶子君，关注公众号  

回复算法，加入前端编程面试算法每日一题群

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGfH7m6f5haVeM0sicNEFjHia9xz5dxSz7DHyW9cOhQLLsFOI6GWsWicn1Q/640?wx_fmt=jpeg)

来源：ask_the_sky
==============

https://juejin.cn/post/6951684431597797389

服务器作为开发的一环，并且现在非常多的商业公司部署在生产环境上的服务器都是`CentOS`系统! 让我们了解了解也在情理之中！

作为前端开发者，我们应该跳出自己的一亩三分地，跳出舒适区。扩大自己的技术广度和深度，只有这样! 我们才能 "做大做强，再创辉煌"

本篇文章旨在介绍在 Centos 上的一些常见环境配置技巧，为 "前端小白" 们在`CentOS`的道路上更进一步！

Centos
------

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGSs79GI8icW78Wxe2tGI9PKtElUkQ8hECZqEDMWYuCHFiaeXdDian4O2Ew/640?wx_fmt=png)logo_centos

Centos 是一个基于 Linux 的开源免费操作系统，下面列出一些常用操作

```
# 本地拷贝文件到远程服务器scp output.txt root@47.93.242.155:/data/复制代码
```

*   `output.txt`: 本地文件
    
*   `root`: 登录远程服务器的账号
    
*   `47.93.242.155`: 远程服务器的 IP
    
*   `/data/`: 远程服务器的目录
    

```
# 拷贝D盘https目录下的所有文件到 远程的 /data 目录scp D:/https/* root@47.93.242.155:/data复制代码
```

### 本地链接远程 Centos 服务器

`ssh \-p 端口 用户名@服务器IP`

例子:

```
ssh -p  22  root@47.93.242.155# 输入登录密码# 成功复制代码
```

### yum 切换为阿里源

```
cd /etc/yum.repos.d/curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-8.repo# 重新生成缓存--查看执行结果，如果有aliyun 字样就算成功yum makecache复制代码
```

### 其他

```
# 创建 /data/test 目录mkdir /data/test# 创建 /data/newtest 目录mkdir /data/newtest# 创建 /data/test/index.html 文件touch /data/test/index.html# 编辑文件vi /data/test/index.html# 查看文件内容cat /data/www/index.html# 将 `test`目录下的所有文件复制到 `newtest`目录 下cp –r /data/test/*  /data/newtest# 删除 /data/newtest/index.html 文件rm -rf /data/newtest/index.html# 将 `test`目录下的所有文件移动到新目录 `newtest`目录 下mv /data/test/*  /data/newtest复制代码
```

```
# 查看当前目录的路径pwd复制代码
```

```
# 检查端口被哪个进程占用netstat -lnp|grep 88   #88请换为你需要的端口，如：80复制代码
```

执行`netstat \-lnp|grep 端口号`之后会打印出被占用的进程及其编号

```
# 杀掉编号为1777的进程（请根据实际情况输入）kill -9 1777复制代码
```

查看当前 `Centos` 操作系统发行版信息

```
cat /etc/redhat-release
复制代码
```

Nginx 服务器搭建
-----------

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGCR7uvnaabf1fkFYbePnT6Rcg9Cdr5d0WMlMPoOummH27dsuQtQzA1A/640?wx_fmt=png)nginx-logo

Nginx 是一个高性能的 HTTP 和反向代理 web 服务器，使用 nginx 网站有：百度、京东、新浪、网易、腾讯、淘宝...。

### Centos 下安装 Nginx 服务器

这里我们使用 `yum` 安装 Nginx 服务器。

```
yum install -y nginx
复制代码
```

### 启动 Nginx 服务器

安装后的 Nginx 没有启动，先启动 Nginx 服务器。

```
nginx
复制代码
```

此时，访问 `http://<您的域名或IP>` 可以看到 Nginx 的测试页面

> 如果无法访问，请重试用 `nginx \-s reload` 命令重启 Nginx

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGWpTsjKRicjEprqoPcaLpadArH8RCibdGrpSVbDnPNJbbTE0YsIGvr2Bw/640?wx_fmt=png)nginx-index

### 配置静态服务器访问路径

外网用户访问服务器的 Web 服务由 `Nginx` 提供，`Nginx` 需要配置静态资源的路径信息才能通过 `url` 正确访问到服务器上的静态资源。

打开 `Nginx` 的默认配置文件 `/etc/nginx/nginx.conf` ，修改 Nginx 配置

```
vi /etc/nginx/nginx.conf
复制代码
```

将默认的 `/usr/share/nginx/html`; 修改为: `/data/www`;，如下：

示例代码：`/etc/nginx/nginx.conf`

```
user nginx;worker_processes auto;error_log /var/log/nginx/error.log;pid /run/nginx.pid;include /usr/share/nginx/modules/*.conf;events {    worker_connections 1024;}http {    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '                      '$status $body_bytes_sent "$http_referer" '                      '"$http_user_agent" "$http_x_forwarded_for"';    access_log  /var/log/nginx/access.log  main;    sendfile            on;    tcp_nopush          on;    tcp_nodelay         on;    keepalive_timeout   65;    types_hash_max_size 2048;    include             /etc/nginx/mime.types;    default_type        application/octet-stream;    include /etc/nginx/conf.d/*.conf;    server {        listen       80 default_server;        listen       [::]:80 default_server;        server_name  _;        # 修改为以下路径        root         /data/www;        include /etc/nginx/default.d/*.conf;        location / {        }        error_page 404 /404.html;            location = /40x.html {        }        error_page 500 502 503 504 /50x.html;            location = /50x.html {        }    }}复制代码
```

配置文件将 `/data/www/static` 作为所有静态资源请求的根路径，如访问: `http://<您的域名或IP>/static/index.js`，将会去 `/data/www/static/` 目录下去查找 `index.js/index.html`。现在我们需要重启 Nginx 让新的配置生效，如：

```
nginx -s reload
复制代码
```

### 创建第一个静态文件

现在让我们新建一个静态文件，查看服务是否运行正常。

首先让我们在 `/data` 目录 下创建 `www` 目录，如：

```
mkdir -p /data/www
复制代码
```

在 `/data/www` 目录下创建我们的第一个静态文件 `index.html`

```
touch /data/www/index.html

vi /data/www/index.html
复制代码
```

示例代码：`/data/www/index.html`

```
<!DOCTYPE html><html lang="zh">  <head>    <meta charset="UTF-8" />    <title>第一个静态文件</title>  </head>  <body>    <h1>Hello world！</h1>  </body></html>复制代码
```

现在访问 `http://<您的域名或IP>/index.html` 应该可以看到页面输出 `Hello world!`

到此，一个基于 Nginx 的静态服务器就搭建完成了，现在所有放在 `/data/www` 目录下的的静态资源都可以直接通过域名 / IP 访问。

> 如果无显示，请刷新浏览器页面

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGBXXheQe4CVKlkpibrfnhpHb6ZL3iaNictA91rmALqeSt33eZ8gIkVACLA/640?wx_fmt=png) indexHTML

### Nginx 配置 SSL 泛域名证书

这里使用的是阿里云的免费证书，期限为 1 年

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGYQqQxO5MD8GZ2u677dibySBy5b334jOJvSAT0YNm1MyibCxk0VV3cXzw/640?wx_fmt=png)aliyun-free-cert

购买成功后进入`ssl证书控制台` 下载证书

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGq72MJaDXno2wCgibhPjLczNXD8oX0kM8f0v2FvuhJ5Nc3f7qcTKjx0Q/640?wx_fmt=png)aliyun-download-cert

下载申请好的 ssl 证书文件压缩包到本地并解压放到自己喜欢的目录, 如`D:/https/`。(这里是用的 pem 与 key 文件，文件名可以更改)。

在连接服务器的窗口中创建 `/data/cert` 目录用来存放证书文件

```
mkdir /data/cert
复制代码
```

使用 `scp` 命令上传文件到远程服务器 (这里需要新开一个终端，不要使用连接服务器的窗口):

```
scp D:/https/* root@47.93.242.155:/data/cert
复制代码
```

上面的意思是拷贝`D:/https/`目录下的所有文件到远程服务器的 `/data/cert`目录中

*   `D:/https/`: 本地文件的绝对路径
    
*   `root`: 通过 root 用户登录到远程服务器
    
*   `47.93.242.155`: 远程服务器的 ip 地址
    
*   `/data/cert`: 远程服务器上的路径
    

#### 开启 443 监听

Nginx 启动后默认只监听 80 端口。

这里我们把 443 端口的监听也一并开启。

编辑全局配置文件

```
vi /etc/nginx/nginx.conf
复制代码
```

示例代码：`/etc/nginx/nginx.conf`, **说明都在注释中**

```
# For more information on configuration, see:#   * Official English Documentation: http://nginx.org/en/docs/#   * Official Russian Documentation: http://nginx.org/ru/docs/user nginx;worker_processes auto;error_log /var/log/nginx/error.log;pid /run/nginx.pid;# Load dynamic modules. See /usr/share/nginx/README.dynamic.include /usr/share/nginx/modules/*.conf;events {    worker_connections 1024;}http {    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '                      '$status $body_bytes_sent "$http_referer" '                      '"$http_user_agent" "$http_x_forwarded_for"';    access_log  /var/log/nginx/access.log  main;    sendfile            on;    tcp_nopush          on;    tcp_nodelay         on;    keepalive_timeout   65;    types_hash_max_size 2048;    include             /etc/nginx/mime.types;    default_type        application/octet-stream;    # Load modular configuration files from the /etc/nginx/conf.d directory.    # See http://nginx.org/en/docs/ngx_core_module.html#include    # for more information.    include /etc/nginx/conf.d/*.conf;    server {        listen       80;        # 修改域名        server_name  nsuedu.cn;        # 如果是HTTP请求则重定向到HTTPS        rewrite ^(.*) https://$host$1 permanent;    }# Settings for a TLS enabled server.    server {         # 服务器端口使用443，开启ssl        listen       443 ssl http2 default_server;        listen       [::]:443 ssl http2 default_server;        # 输入你的域名        server_name  nsuedu.cn;        # 修改静态文件的路径        root         /data/www;        # ssl证书配置        # 修改证书路径一        ssl_certificate "/data/cert/4726867_www.nsuedu.cn.pem";        # 修改证书路径二        ssl_certificate_key "/data/cert/4726867_www.nsuedu.cn.key";        ssl_session_cache shared:SSL:1m;        ssl_session_timeout  10m;  #缓存有效期        ssl_ciphers HIGH:!aNULL:!MD5;  #加密算法        ssl_prefer_server_ciphers on;  #使用服务器端的首选算法        # Load configuration files for the default server block.        include /etc/nginx/default.d/*.conf;        location / {        }        error_page 404 /404.html;            location = /40x.html {        }        error_page 500 502 503 504 /50x.html;            location = /50x.html {        }    }}复制代码
```

重启 nginx

```
nginx -s reload
复制代码
```

在浏览器中访问`http://nsuedu.cn/`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGYTu3EN1F2Bm4MhbDjtkvMchUJLBNTp7duXMP9301VaAAH5C3Jnic1FQ/640?wx_fmt=png)https-success

### 配置 Nginx 反向代理

客户端对代理服务器是无感知的，客户端不需要做任何配置，用户只请求反向代理服务器，反向代理服务器选择目标服务器，获取数据后再返回给客户端。

反向代理服务器和目标服务器对外而言就是一个服务器，只是暴露的是代理服务器地址，而隐藏了真实服务器的 IP 地址。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGv1xwDFy6JptO1Runf7tgibibAHX4KbW1BfVvnowzfE6tRTqicdhdia6KjA/640?wx_fmt=png)20210416165016

> 参考从原理到实战，彻底搞懂 Nginx！

访问路径:`/api/getUser`

1.  ```
    当 nginx 配置文件 `proxy_pass` 的 **url 末尾 带`/`时**:
    ```
    

```
server {
        listen       80;
        server_name  www.123.com;

        location /api/ {
        proxy_pass http://127.0.0.1:18081/;
        }
    }
复制代码
```

代理到后端的路径为：`http://127.0.0.1:18081/getUser`，省略了匹配到的`/api/`路径；

2.  ```
    当 nginx 配置文件 `proxy_pass` 的 **url 末尾 不带`/`时**：
    ```
    

```
server {
        listen       80;
        server_name  www.123.com;

        location /api/ {
        proxy_pass http://127.0.0.1:18081;
        }
    }
复制代码
```

代理到后端的路径为：`http://127.0.0.1:18081/api/getUser`，连同匹配到的`/api/`路径，一起进行反向代理；

Centos 下搭建 Node.js 环境
---------------------

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG1VK71fM0lL0lMAQuVhPxEx4S0NPJ3vhYib6FNVoxHcM81miapAicg3Eqw/640?wx_fmt=jpeg)node-logo

`Node.js` 是运行在服务端的 `JavaScript`, 是基于 `Chrome JavaScript V8` 引擎建立的平台。

安装 Node.js 的几种方式

1.  方法一：从`EPEL库`安装`Node.js`--`yum install nodejs`，**不足**: 安装的`node/npm`版本较低, 需要手动切换版本
    
2.  方法二: 使用官方编译过的二进制数据包安装, **不足**: 安装步骤繁杂
    
3.  方法三: 通过`NVM`安装, 方便快捷**不足**: 安装时国外的网不好 🥶
    
4.  方法四: 源码下载后编译安装, 版本是最新的
    

### yum install nodejs 方式安装

查看当前系统自带了哪些`nodejs`的版本

```
sudo dnf module list nodejs
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGmLolh1xWmUjAjGKNx3hxDsq8rkY8vUaOBr9ibedPia1evwdcrzYXGbyg/640?wx_fmt=jpeg)centos-node-list

可以看到有三个版本的 `Node`:`10`,`12`,`14`. 在版本 10 上有个`[d]`符号, 它代表系统将会默认安装的版本。如果你想要切换默认安装的版本，可以执行下面的命令

```
sudo dnf module enable nodejs:14
复制代码
```

安装 Node

```
sudo dnf install nodejs
复制代码
```

查看 node 版本，可以发现是`Node14`的版本

```
node --v
复制代码
```

### NVM 方式安装

我们可能同时在进行 2 个项目，而 2 个不同的项目所使用的 node 版本又是不一样的，对于维护多个版本的`node`将会是一件非常麻烦的事情，而`nvm`就是为解决这个问题而产生的，它可以方便的**在同一台设备上进行多个`node`版本之间切换**

> 注: 使用此方式，在后面的 Jenkins 脚本使用 npm/yarn 会提示找不到命令，我也不知道咋解决，求大佬科普 🤪

下面是 (2021/04) 的最新稳定版: 可以在去 NVM 官网看一下，替换成最新的链接

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | cp
复制代码
```

还需要运行下面的命令，以确认上一条命令的更改结果

```
source ~/.bash_profile
复制代码
```

查看 Node 版本列表

```
nvm list-remote
复制代码
```

安装一个长期支持的版本

```
nvm install 14.16.1
复制代码
```

确认是否安装成功

```
nvm current

node -v

npm -v
复制代码
```

通过 环境变量`echo $PATH` 查看安装的位置

```
echo $PATH# 打印出的结果中，需要取出 `/root/.nvm/versions/node/v14.16.1/bin`复制代码
```

### 使用官方编译过的二进制数据包的方式安装

> 注: 使用此方式，在后面的 Jenkins 脚本使用 npm/yarn 能够正常运行

下面是 (2021/04) 的最新稳定版: 可以在去 Node.js 官网看一下，替换成最新的链接

下载 `14.16.0` 到`/data` 目录

```
cd /data

wget https://nodejs.org/dist/v14.16.0/node-v14.16.0-linux-x64.tar.xz
复制代码
```

下载完成后, 将其解压

```
tar xvJf node-v14.16.0-linux-x64.tar.xz
复制代码
```

将解压的 `Node.js` 目录移动到 `/usr/local` 目录下

```
mv node-v14.16.0-linux-x64 /usr/local/node-v14
复制代码
```

配置 `node` 软链接到 `/bin` 目录

```
ln -s /usr/local/node-v14/bin/node /bin/node
复制代码
```

### 配置和使用 npm

`npm` 是 `Node.js` 的包管理和分发工具。它可以让 `Node.js` 开发者能够更加轻松的共享代码和共用代码片段

下载 `node` 的压缩包中已经包含了 `npm` , 我们只需要将其软链接到 `bin` 目录下即可

```
ln -s /usr/local/node-v14/bin/npm /bin/npm
复制代码
```

### 配置环境变量

将 `/usr/local/node-v14/bin` 目录添加到 `$PATH` 环境变量中可以方便地使用通过 `npm` 全局安装的第三方工具

```
echo 'export PATH=/usr/local/node-v14/bin:$PATH' >> /etc/profile
复制代码
```

使环境变量生效

```
source /etc/profile
复制代码
```

### 使用 npm

通过 `npm` 配置淘宝源

```
npm config set registry https://registry.npm.taobao.org

npm get registry
复制代码
```

全局安装`yarn`并配置淘宝源

```
npm install yarn -g

yarn config set registry http://registry.npm.taobao.org/

yarn config get registry
复制代码
```

在 Centos 上安装 Docker
-------------------

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGhaEpSoeG8DAraaodeSPCohzP2chwQMiaN2WoL6kSVWHmKakRGznjQ4A/640?wx_fmt=jpeg)Logo-Docker

Docker 是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的镜像中，然后发布到任何流行的 Linux 或 Windows 机器上

### Docker 与虚拟机的区别

*   Docker 是一个容器，它基于 Linux 内核实现
    
*   Docker 体积更小: 容器运行的是不完整的操作系统（尽管它们可以），虚拟机必须运行完整的操作系统
    
*   Docker 启动速度更快: 虚拟机启动需要数分钟，而 Docker 容器可以在数毫秒内启动
    
*   用途 / 作用
    

*   虚拟机更擅长于**彻底隔离整个运行环境**, 虚拟机更擅长于彻底隔离整个运行环境。例如，云服务提供商通常采用虚拟机技术隔离不同的用户。
    
*   Docker 通常用于**隔离不同的应用**，例如前端，后端以及数据库。
    

*   比喻
    

*   拥有完全独立（隔离）的空间;
    
*   属于不同的客户 (虚拟机所有者);
    
*   每个仓库有各自的库管人员（当前虚拟机的操作系统内核），无法管理其它仓库。不存在信息共享的情况
    
*   Docker 比作集装箱：各种货物的打包 (将各种应用程序和他们所依赖的运行环境打包成标准的容器, 容器之间隔离)
    
*   服务器虚拟化就好比在码头上（物理主机及虚拟化层），建立了**多个独立的 “小码头”—仓库（虚拟机）**
    

### 安装与配置 Docker

在开始安装之前，需要安装 `device-mapper-persistent-data` 和 `lvm2` 两个依赖。

*   `device-mapper-persistent-data` 是 `Linux` 下的一个存储驱动， `Linux` 上的高级存储技术。
    
*   `Lvm`的作用则是创建逻辑磁盘分区。这里我们使用 `CentOS` 的 `Yum` 包管理器安装两个依赖：
    

```
yum install -y yum-utils device-mapper-persistent-data lvm2
复制代码
```

依赖安装完毕后，我们将阿里云的 `Docker` 镜像源添加进去。可以加速 `Docker` 的安装。

```
sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
复制代码
```

```
yum install docker-ce -y
复制代码
```

安装完毕，我们就可以使用 `systemctl` 启动来启动 `Docker` 了。`systemctl` 是 `Linux`的进程管理服务命令，他可以帮助我们启动 `docker`

```
systemctl start docker

systemctl enable docker
复制代码
```

接着执行一下 `docker \-v`，这条命令可以用来查看 `Docker` 安装的版本信息。当然也可以帮助我们查看 `docker` 安装状态。如果正常展示版本信息，代表 `Docker` 已经安装成功。

```
docker -v
复制代码
```

设置开机启动

```
chkconfig docker on
复制代码
```

### 其他

显示所有容器

```
docker ps
复制代码
```

显示本地镜像列表

```
docker images
复制代码
```

删除本地一个或多个镜像

```
docker rmi imageID
复制代码
```

容器的启动 / 关闭 / 重启

```
docker stop containerID

docker start containerID

docker restart  containerID
复制代码
```

删除一个或多个容器

```
docker rm containerID
复制代码
```

### 配置阿里云镜像源

在 `Docker` 安装完毕后，之后我们去拉取 `docker` 镜像时，一般默认会去 `docker` 官方源拉取镜像。但是国内出海网速实在是太慢，所以选择我们更换为阿里云镜像仓库源进行镜像下载加速。

登录阿里云官网，打开 阿里云容器镜像服务。点击左侧菜单最下面的`镜像加速器` ，选择 `CentOS` （如下图）。按照官网的提示执行命令，即可更换 `docker` 镜像源地址。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGs8wCVyrrMZFT15ZojsnPN1gibmcea57knlbBDodeVCSNJpzGnau3ZSg/640?wx_fmt=png)ea464ab9fe1941bba822a6131dd631c8_tplv-k3u1fbpfcp-zoom-1

### Docker 内配置 Nginx 方式一 (推荐)

参考 Nginx 容器教程

```
docker container run -d -p 4030:80 --rm --name mynginx nginx
复制代码
```

上面命令的各个参数含义如下。

*   `-d`：在后台运行
    
*   `-p` ：容器的 80 端口映射到 127.0.0.1:4030
    
*   `--rm`：容器停止运行后，自动删除容器文件
    
*   `--name`：容器的名字为 mynginx
    
*   末尾的`nginx`：表示根据 nginx 镜像运行容器。
    

如果没有报错，就可以打开浏览器访问 `IP:4030` 了。正常情况下，显示 Nginx 的欢迎页。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG1kfAYUwdk9WnqicAxeVLKr5mpkFqllY5MJiccfN91H7okDREokTTib8wA/640?wx_fmt=png)docker-nginx-4030

然后，把这个容器终止，由于`--rm`参数的作用，容器文件会自动删除。

```
docker container stop mynginx
复制代码
```

### Docker 内配置 Nginx 方式二

下载一个官方的 `Nginx` 镜像到本地

```
docker pull nginx
复制代码
```

下载好的镜像就会出现在镜像列表里

```
docker images
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGykwwK1Tibxdly8aKSH8aeKicAJIRWB50m0gOJOCmWWtBG1kAhfmF8hLw/640?wx_fmt=png)docker-images

**运行容器**

```
docker run --name=nginx -d -p 4030:80 nginx
复制代码
```

上面命令的解释如下：

1.  `--name`：设置容器的名称;
    
2.  `-d`：表示在后台运行容器;
    
3.  `-p`：指定端口映射。`4030`是宿主机的端口，`80`是 Nginx 容器内部的端口;
    
4.  末尾的`nginx`：表示根据 nginx 镜像运行容器。
    

如图所示

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGG3aOcYChMp9YNxVVDrGC90MK51joL85p1pMRhvTViccBRFEzzOSjQNw/640?wx_fmt=png)docker-nginx-started

然后在浏览器里面访问 `http://47.93.242.155:4030/`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG1kfAYUwdk9WnqicAxeVLKr5mpkFqllY5MJiccfN91H7okDREokTTib8wA/640?wx_fmt=png)docker-nginx-4030

#### 给 Docker 内的 Nginx 配置反向代理

要修改 Nginx 的配置文件，首先需要进入 Nginx 容器里面，使用下面的命令**进入容器里面**

```
docker exec -it nginx /bin/bash
复制代码
```

上面命令的解释说明：

*   `-it`：表示分配一个伪终端。
    
*   `nginx`：表示容器的名称，这里也可以使用容器 ID。
    
*   `/bin/bash`：表示对容器执行 bash 操作。
    

我们使用`ls`查看一下文件结构，发现里面其实就是一个 `Linux` 操作系统。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGJ8AJO2r1wc8mZovsBqLHhA7WwrLYcog8NFmyGCfCrgl8PGPL3icrhdQ/640?wx_fmt=png)20210415235729

再查看一下详细的操作系统发行版信息

```
cat /etc/issue
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGT1klia231xo2EiaibvkKdlibqqWFibIKP7oME9oOmmSapLIk8Licso8F8FZQ/640?wx_fmt=png)cat-etc-issue

可以发现是一个`Debian`系统

### `Debian`系统

顺便介绍一些 `Debian`系统的基本操作

```
# 首先需要更新一下apt-get update# 安装vimapt-get install vim复制代码
```

#### 修改为清华源镜像

参考 Debian 镜像使用帮助

如果遇到无法拉取 https 源的情况，请先使用 http 源并安装：

```
sudo apt install apt-transport-https ca-certificates
复制代码
```

查看 Debian 版本, 以便选择对应的镜像源

Debian 版本简介:

*   下一代 Debian 正式发行版的代号为 `buster`
    
*   Debian 9（`stretch`） — 被淘汰的稳定版
    
*   Debian 8（`jessie`） — 被淘汰的稳定版
    
*   Debian 7（`wheezy`） — 被淘汰的稳定版
    
*   Debian 6.0（`squeeze`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 5.0（`lenny`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 4.0（`etch`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 3.1（`sarge`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 3.0（`woody`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 2.2（`potato`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 2.1（`slink`） — 被淘汰的稳定版
    
*   Debian GNU/Linux 2.0（`hamm`） — 被淘汰的稳定版
    

查看版本当前操作系统发行版信息。这个命令就可以清楚的知道到底是 RedHat 的、还是别的发行版，还有具体的版本号，比如 3.4 还是 5.4 等等

```
cat /etc/os-release
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGTIcj8b1ZTwg8pAHDOwVnF2ATPPiavVJTRCIrATicusuVhicibGKfDYiaqDw/640?wx_fmt=png)cat-etc.-os

修改镜像文件

```
vi /etc/apt/sources.list
复制代码
```

修改内容如下

```
# 默认注释了源码镜像以提高 apt update 速度，如有需要可自行取消注释deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-freedeb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-freedeb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-freedeb https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free# deb-src https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free复制代码
```

* * *

Nginx 默认会安装在 `etc` 目录下面, 查看 Nginx 的配置文件的内容

```
cat /etc/nginx/nginx.conf
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGtLGGqhvEOSSiaI7GCvNKf0NqbnMeH9SiaPnwN4tSS95EGUHCGcNA0ic7g/640?wx_fmt=png)20210415235137

我们看最后红框里面的内容，表示使用的是`/etc/nginx/conf.d/default.conf`文件进行配置。

那么我们编辑`/etc/nginx/conf.d/default.conf`文件即可。

```
vi /etc/nginx/conf.d/default.conf
复制代码
```

**配置方式与前文的 nginx 配置一样**，不过我们需要把必要的文件 (静态文件, SSL 证书) 传递给 Docker 容器

创建存放资源的目录

```
mkdir /data/cert

mkdir /data/www
复制代码
```

**退出 `docker` 容器**，到服务器界面

```
exit
复制代码
```

**查看所有的容器信息**，能获取容器的 `id`, 如下图

```
docker ps -a
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGdwNI7nsgiaF0ggKZUGhwCUZZaNqP0k5uqbwibVBODl86kF0QCqISJfqg/640?wx_fmt=png)docker-ps-a

在服务器终端把资源文件传递给 `docker`下的`nginx`容器

```
docker cp /data/cert 6ba3901beac9:/data/cert
复制代码
```

**保存容器**

然后执行如下命令，保存镜像：

```
docker commit -m="备注" 你的CONTAINER_ID 你的IMAGE
复制代码
```

> 请自行将 -m 后面的信息改成自己的容器的信息

大功告成！

恭喜你结束了 Docker 的教程并学会了 Docker 的一些基本操作

Centos 下安装 Jenkins
------------------

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGcTk3yfzFRiatWlhksNtpf1yIaCE7WJVQGVQn6ZMdvV59bicf2QFBmcXw/640?wx_fmt=png)jenkins-logo

`Jenkins` 是一个基于 `Java` 语言开发的持续构建工具平台，主要用于持续、自动的构建 / 测试你的软件和项目。它可以执行你预先设定好的设置和构建脚本，也可以和 `Git` 代码库做集成，实现自动触发和定时触发构建。

这部分内容大多内容是对从 0 到 1 实现一套 CI/CD 流程 掘金小册的搬运，更详细的内容可以学习这本小册

### 安装 OpenJDK

因为 `Jenkins` 是 `Java` 编写的持续构建平台，所以安装 `Java` 必不可少。

在这里，我们选择安装开源的 `openjdk` 。在这我们直接使用 `yum` 包管理器安装 `openjdk` 即可。

```
yum install -y java
复制代码
```

### 使用国内镜像加速安装 Jenkins

官方教程 安装速度太慢。因此我们选择国内镜像安装

下面是 (2021/04) 的 jenkins LTS 版本: 可以在去 清华大学镜像站 看一下，替换成最新的链接

下载 `Jenkins` 到`/data` 目录

```
cd  /data

wget https://mirrors.tuna.tsinghua.edu.cn/jenkins/redhat-stable/jenkins-2.277.2-1.1.noarch.rpm

sudo yum install jenkins-2.277.2-1.1.noarch.rpm
复制代码
```

### 启动 Jenkins

`Jenkins` 安装后，会将启动命令注册到系统 `Service` 命令中。所以我们直接使用系统 `service` 命令启动 `Jenkins` 即可。

在这里，有三个命令可以使用，分别对应 启动 / 重启 / 停止 三个命令。

在这里，我们直接调用 `service jenkins start` 启动 `Jenkins` 即可

```
service jenkins start# service jenkins restart restart 重启 Jenkins# service jenkins restart stop 停止 Jenkins复制代码
```

服务启动后，访问 `IP:8080` 。如果能够看到以下界面，代表正在启动。`Jenkins` 第一次的启动时间一般比较长（视服务器性能而看）

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGM5icXS25XQuYiadFB1QmCFNQ8S6SMiaXhA2SJAP6sYUr8tlib5KGBhmjmw/640?wx_fmt=png)20210414231359

### 初始化 Jenkins 配置

#### 解锁 Jenkins

在 `Jenkins` 启动完成后，会自动跳转至这个界面（下方二图）。这是 `Jenkins` 的解锁界面，你需要输入存放在服务器的初始解锁密码才能进行下一步操作。

`Jenkins` 启动后，会生成一个初始密码。该密码在服务器的文件内存放，我们可以进入服务器查看密码内容，将密码填写在 `Jenkins` 的管理员密码输入框内：

```
cat /var/lib/jenkins/secrets/initialAdminPassword
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGehh12YGwlncUkicib3h848acQAhDJxrkFlb2qlpN00EYx9Fc1ia9ia6aCA/640?wx_fmt=png)20210414231503![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGN2FDdnbRNHC47zHcLsLRDKFepgP6VmJcO6icnSGrhWM2I4GnJZeXlew/640?wx_fmt=png)20210414231520

点击 继续 按钮，解锁 Jenkins。

### 下载插件

解锁后就来到了插件下载页面，这一步要下载一些 `Jenkins` 的功能插件。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG4tKWQoJRfrvyS34j6RNsIePGa7jqK791mjYGch3un80q3cWicP0piauQ/640?wx_fmt=png)20210414231547

因为 `Jenkins` 插件服务器在国外，所以速度不太理想。我们需要更换为清华大学的 `Jenkins` 插件源后，再安装插件，所以先不要点安装插件。

更换方法很简单。进入服务器，将 `/var/lib/jenkins/updates/default.json` 内的插件源地址替换成清华大学的源地址，将 `google` 替换为 `baidu` 即可。

```
sed -i 's/http:\/\/updates.jenkins-ci.org\/download/https:\/\/mirrors.tuna.tsinghua.edu.cn\/jenkins/g' /var/lib/jenkins/updates/default.json && sed -i 's/http:\/\/www.google.com/https:\/\/www.baidu.com/g' /var/lib/jenkins/updates/default.json
复制代码
```

接着点击 安装推荐的插件 即可。稍等一会插件安装完毕

### 完成安装

插件安装完毕后，接着是注册管理员账号。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG8dL8w6D6rAdz8vjVEMxdxTHW5b9HC0ZnXj8hdVvk4OzMicmMUktOribg/640?wx_fmt=png)jenkis-welcome

按照提示一路配置后，直到看到以下界面代表安装成功

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGvGaMfA1fwW6JDuCuakicia49RQq4EaWSKkvszKVXxW7bBeQjWUuJCH4Q/640?wx_fmt=png)20210414231814

### 测试安装

到这里，我们的 `Jenkins` 算是启动成功了。但是，我们还需要对 `Jenkins` 做一点点简单的配置，才可以让它可以构建 `docker` 镜像。

我们点击 `Jenkins 首页` -> `左侧导航` -> `新建任务` -> `Freestyle project(构建一个自由风格的软件项目)`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGgb9EicicyV26tlbj9cbMPoLG1FQ1WlFkxBvAzPUSYXYyZgsxe0H6zlXw/640?wx_fmt=png)20210414232035

新建完毕后，找到 构建 一项，选择 增加构建步骤，选择 执行 `shell` ，输入以下命令

```
docker -v
docker pull node:latest
复制代码
```

该命令会去拉取一个 `nodejs` 稳定版的镜像，我们可以来测试 `Docker` 的可用性

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGCvWrkh2bJqlIXlga6PRXiaukcI1lF02b1YHtwe8lOoIGq1bGEJ23icNw/640?wx_fmt=png)20210414232101

保存后，我们点击左侧菜单的立即构建， `Jenkins` 就会开始构建。选择左侧历史记录第一项（最新的一项），点击控制台输出，查看构建日志。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGdfpOIAD75EYlRDXnKEXFuj0Mib4aiasxJwlFHzJ4ayoicIbSAch1p0cdg/640?wx_fmt=png)20210414232116

执行后，我们发现提示无访问权限。这又是什么情况呢？这里就不得不提到 Linux 下的 `Unix Socket` 权限问题了

在 `Linux` 中， `Unix socket` 属于 `root` 用户，因此需要 `root` 权限才能访问

但是在 `docker` 中， `docker` 提供了一个 用户组 的概念。我们可以将执行 `Shell` 的用户添加到名称为 `docker` 的用户组，则可以正常执行 `docker` 命令。

而在 `Jenkins` 中执行的终端用户做 `jenkins` ，所以我们只需要将 `jenkins` 加入到 `docker` 用户组即可：

```
sudo groupadd docker          #新增docker用户组
sudo gpasswd -a jenkins docker  #将当前用户添加至docker用户组
newgrp docker                 #更新docker用户组
复制代码
```

加入后，重启 `Jenkins` ：

```
sudo service jenkins restart
复制代码
```

重启 `Jenkins` 后，再次执行脚本。此时执行成功：

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGNhSQKue7trge1X9g6ZlicaXRnrTTqb7EJPl8tFQRsib2nibr6nabYqonw/640?wx_fmt=png)20210414232608

### 回过头来查看 docker 镜像

```
docker images
复制代码
```

会发现多了一个`docker`的`node`镜像, 这就是我们通过`Jenkins` 自动安装的

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGIHzvwPXXZcUe4EKKEZW4gIJRKgQLW2sa5QyE5xBic8J2NfReIs86NWQ/640?wx_fmt=png)node-in-docker

进入此`docker`镜像

```
docker run -it node /bin/bash
复制代码
```

做一些配置 (如何做参考前文的说明)

*   `npm` 配置淘宝源
    
*   全局安装 `yarn` 并配置配置淘宝源
    

```
npm config set registry https://registry.npm.taobao.orgnpm get registry# 可能提示已安装，就不用再安装了npm install yarn -gyarn config set registry http://registry.npm.taobao.org/yarn config get registryexit复制代码
```

### 使用 SSH 协议集成 Git 仓库源

这一步，我们使用 `Jenkins` 集成外部 `Git` 仓库，实现对真实代码的拉取和构建。在这里，我们选用 `Gitee`(Github 太慢了 🤧) 作为我们的代码源。这里准备一个 UmiJS 项目来演示构建。

### 生成公钥私钥

首先，我们先来配置公钥和私钥。这是 `Jenkins` 访问 `Git` 私有库的常用认证方式。我们可以使用 `ssh-keygen` 命令即可生成公钥私钥。在本地机器执行生成即可。这里的邮箱可以换成你自己的邮箱：

```
ssh-keygen -t rsa -C "642178633@qq.com"
复制代码
```

执行后，会遇到第一步骤：`Enter file in which to save the key` 。

这一步是询问你要将公钥私钥文件放在哪里。默认是放在 `~/.ssh/id_rsa` 下，当然也可以选择输入你自己的路径。一路回车即可。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGJMicfvicG39koqsiajxxTKSMhe8UHEtspgN5aTQ6icLjUofD3btHCpN1dQ/640?wx_fmt=png)20210414234455

结束后，你会得到两个文件。分别是 `id_rsa` 和 `id_rsa.pub`。

其中，`id_rsa` 是私钥文件，`id_rsa.pub` 是对应的公钥文件。

我们需要在 Git 端配置公钥，在 Jenkins 端使用私钥与 Git 进行身份校验。

#### 在 Gitee 配置公钥

在 `Gitee` 中，如果你要配置公钥有 2 种方式：仓库公钥 和 个人公钥。其中，如果配置了仓库公钥，则该公钥只能对配置的仓库进行访问。如果配置了个人公钥，则账号下所有私有仓库都可以访问。

这里我们就以配置个人公钥为例子。首先打开右上角的设置 ，点击下面的 `设置` => `SSH 公钥`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGJGkQ07eDFb4meiaSz1MicfMGRehTib36mp6odvHLebCIWrMtRBiaJicgqPg/640?wx_fmt=png)gitee-ssh-first![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGzLJMLbic7eWvuiaTGdawjs1Q60njGcwUEUlWHlAlic2y3DryUf6Yib1qSA/640?wx_fmt=png)gitee-ssh-second

在下方有个添加公钥，填入信息即可。

其中的标题为公钥标题，这里可以自定义标题；公钥则为刚才生成的 `id_rsa.pub` 文件。使用 `cat` 命令查看下文件内容，将内容填入输入框并保存。接着去 `Jenkins` 端配置私钥

```
cat ~/.ssh/id_rsa.pub
复制代码
```

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGialseNPdibSMbsQyiaxKRgxjd7DbjLe5Ip4QP5pkia6xvqVHeC74ODg8GQ/640?wx_fmt=png)20210414235532

#### 在 Jenkins 配置私钥

回到 `Jenkins`。在 `Jenkins` 中，私钥 / 密码 等认证信息都是以 凭证 的方式管理的，所以可以做到全局都通用。我们可以在配置任务时，来添加一个自己的凭证。点击项目的 配置，依次找到 `源码管理` => `Git` => `Repositories`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGOCkFdPLw5Wg0nleCN5xHFUZaWgAIHnLsTNM0gB7qbBENpS3libCSwibA/640?wx_fmt=png)20210414235620![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGbMHialFWZ066DI2mFd5oIMEicN5BC4rkOicNOic8gmwOHE77HrdSk6GYJg/640?wx_fmt=png)20210414235631

这里的 `Repository URL` 则是我们的仓库地址， SSH 地址格式为 `git@gitee.com:xxx/xxx.git` 。可以从仓库首页中的 `克隆/下载` => `SSH` 中看到

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG2AScZzm2guBMh9mowsrqDhnKFJtTvPxnpFdK3xJhZwtoqkCQZZ49Xw/640?wx_fmt=png)20210414235645

重点是 `Credentials` 这一项，这里则是我们选择认证凭证的地方。我们可以点击右侧 `添加` => `Jenkins` 按钮添加一条新的凭证认证信息。

点击后会打开一个弹窗，这是 Jenkins 添加凭证的弹窗。选择类型中的 `SSH Username with private key` 这一项。接着填写信息即可：

*   `ID`：这条认证凭证在 Jenkins 中的名称是什么
    
*   `描述`：描述信息
    
*   `Username`：用户名（邮箱）
    
*   `Private Key`：这里则是我们填写私钥的地方。
    

在命令行窗口，查看私钥文件内容，并复制它

```
cat ~/.ssh/id_rsa
复制代码
```

点击 `Add` 按钮，将 `xxx 私钥文件`内所有文件内容全部复制过去（包含开头的 BEGIN OPENSSH PRIVATE KEY 和结尾的 END OPENSSH PRIVATE KEY）

接着点击添加按钮，保存凭证。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGQy184ode9tTbUloTW0zxtCsLDxqbAKzgS8aa87c7Kj3Dvg7UxEeVEA/640?wx_fmt=png)20210414235711

保存后，在 `Credentials` 下拉列表中选择你添加的凭证。

如果没有出现红色无权限提示，则代表身份校验成功，可以正常访问。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGMLTicKZkPwm0Nb6ICKPM3wXEPnEO9SibLJ7WY04ezKhZNT0Cm1HAb4ibg/640?wx_fmt=png)20210414235729

如果出现下图的问题，则说明服务器上没有安装 `Git`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGkEQfWmpwdUBOuv1moqJGqk008IK4fqENAJ4gXody0rHTVvV9JAicszw/640?wx_fmt=png)no-git

安装结束后，刷新界面就正常了

```
yum -y install git
复制代码
```

#### 构建镜像

在我们将环境准备就绪后，就可以开始构建镜像了。不过，我们需要先准备个 `DockerFile` 才可以构建镜像。那什么是 `DockerFile` 呢？

#### 编写 Dockerfile

什么是 `Dockerfile`

`Dockerfile` 是一个 `Docker` 镜像的基础描述文件，里面描述了生成一个镜像所需要的执行步骤。我们也可以自定义一份 `Dockerfile` 来创建一个自己的镜像。

例如下面的步骤，使用 `Dockerfile` 可描述为：

1.  ```
    基于 `nginx:1.15` 镜像做底座。
    ```
    
2.  ```
    拷贝本地 `html` 文件夹内的文件，到镜像内 `/etc/nginx/html` 文件夹。
    ```
    
3.  ```
    拷贝本地 `conf` 文件夹内的文件，到镜像内 `/etc/nginx/` 文件夹。
    ```
    

```
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
复制代码
```

编写完成后，怎么生成镜像呢？我们只需要使用 `docker build` 命令就可以构建一个镜像了：

```
docker build -t imagename:version .
复制代码
```

`-t`: 声明要打一个镜像的 Tag 标签，紧跟着的后面就是标签。

标签格式为 `镜像名:版本 .` ：声明要寻找`dockerfile`文件的路径. `.`代表当前路径下寻找。默认文件名为 `Dockerfile`。

关于更多 `DockerFile` 的语法，详细可以看这里

因为我们的镜像只包含一个 `nginx`，所以 `dockerfile` 内容比较简单。我们只需要在代码根目录下新建一个名为 `Dockerfile` 的文件，输入以下内容，并将其提交到代码库即可。

```
vi Dockerfile
FROM nginx:1.15-alpine
COPY html /etc/nginx/html
COPY conf /etc/nginx/
WORKDIR /etc/nginx/html
复制代码
```

```
git add ./Dockerfile
git commit -m "chore: add dockerfile"
git push
复制代码
```

#### Jenkins 端配置

在代码源和 `DockerFile` 准备就绪后。在服务器的`/data`目录下新建一个`jenkins-shll.sh` 脚本文件

```
touch /data/jenkins-shll.sh

vi /data/jenkins-shll.sh
复制代码
```

并加入如下内容

```
#!/bin/sh -lyarnyarn run builddocker build -t jenkins-test .复制代码
```

这里脚本很简单，主要是作用是`安装依赖` => `构建文件` => `构建镜像`。

`#!/bin/sh \-l`的作用是:

如果在服务器中的`shell`命令可以执行，但到了`jenkins`中却无法执行，这是因为`jenkins`没有加载服务器中的全局变量`/etc/profile`导致的

* * *

最后只需在 `Jenkins` 端配置下要执行的 `Shell` 脚本即可。找到项目的配置，依次找到`构建` => `Execute shell`。输入以下脚本：

```
sh /data/jenkins-shll.sh
复制代码
```

#### 手动执行任务

保存后我们去手动触发执行下任务。当未抛出错误时，代表任务执行成功

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGAbQDCjIYaUMYnib3qrTghCqgs15icS5qIUEI8LqACyYAIspjHKLX2diaw/640?wx_fmt=png)20210415000307

#### 回过头来查看 docker

```
docker images
复制代码
```

可以发现，又多了一个名叫`jenkins-test` 的 docker 镜像

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGVZAIA3bj5gmLHUjdicw36UBoJDiaMPhNTiaTnjtCcM0AoP0riabzzgFXVQ/640?wx_fmt=png)laest-docker-images

### 自动执行任务

#### 安装插件

安装 `Generic Webhook Trigger Plugin` 插件（`系统管理`-`插件管理`-`可用插件`- 搜索 `Generic Webhook`）

选中并点击`Install without restart`

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGqXrygoRz5DCXsmKFic0IrJp67o0GrWZI6Pd8HAbOgv4P9MVicmPiaYJyQ/640?wx_fmt=jpeg)Generic-Webhook

如果可选插件列表为空，点击高级标签页，替换升级站点的 URL 为：`http://mirror.xmission.com/jenkins/updates/update-center.json`并且点击提交和立即获取。

#### 添加触发器

`Generic Webhook Trigger Plugin` 插件功能很强大，可以根据不同的触发参数触发不同的构建操作，比如我向远程仓库提交的是 `master` 分支的代码，就执行代码部署工作，我向远程仓库提交的是某个 `feature`分支，就执行单元测试，单元测试通过后合并至 `dev` 分支。

灵活性很高，可以自定义配置适合自己公司的方案，这里方便演示我们不做任何条件判断，只要有`push`就触发。

在任务配置 ->`触发构建起`-> 里勾选 `Generic Webhook Trigger` ，然后保存即可

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGDJuib1cbEO38adT7XaS67yib2vgQhwKia0CTeUR3ibc6ibqiafmBucnS2Lmg/640?wx_fmt=png)20210415001710

#### Git 仓库配置钩子

此处以码云为例，github 的配置基本一致，进入码云项目主页后，点击`管理`-`webhooks`-`添加`，会跳出一个这样的框来。

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGVv2jyhCGicF1sicRXUMCqgiaxEnGeEZv4TiaOufuSWUSa8OibwMKyASrhMA/640?wx_fmt=jpeg)webhooks1

上图中的 URL 格式为 `http://<User ID>:<API Token>@<Jenkins IP 地址>:端口/generic-webhook-trigger/invoke`

下面的几个选项是你在仓库执行什么操作的时候触发钩子，这里默认用 `push`。

*   获取`User ID`
    

进入 jenkin 的`系统管理`->`管理用户` 界面, 可以看到一个用户列表。在此列表中就找到`User ID`.

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGEgDSvsEHo6icmyVx6cawtmX2iakRrtpRZ5MrVQfOtwIFxKtfWSSg32bw/640?wx_fmt=jpeg)Jenkins-user-list

*   获取`API Token`
    

接下来点击`工具图标` 进入详情界面后找到`API Token`->`添加新Token`->`生成`-> 找个你喜欢的地方将此 token 保存好

*   获取端口
    

`Jenkins IP 地址`和端口是你部署 jenkins 服务器的 ip 地址，端口号没改过的话就是 `8080`。

*   获取密码
    

`密码`就是你登录 jenkins 的密码

点击提交完成配置。我们还需要测试一下钩子是否生效

![](https://mmbiz.qpic.cn/mmbiz_jpg/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGWgHlUnVNNo7MkxArhOhLKuyHbayUpkTfsbUIzA8d8C0NPiaicZibPYicBg/640?wx_fmt=jpeg)test-webhooks

点击`测试`，如果配置是成功的，你的 `Jenkins` 左侧栏构建执行状态里将会出现一个任务。

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDG9WJZmCSH5LIGFX2ISGy7kLYKDzxrIogxFFZIvl4iaFWxiaCMTqRvhgbQ/640?wx_fmt=png)20210415001854

### 实现邮件提醒 - todo

### 批量删除构建历史

进入`系统配置`->`脚本命令运行`

![](https://mmbiz.qpic.cn/mmbiz_png/pfCCZhlbMQREv6Sia05dgCP8895uibVXDGicS6iaN9XhKQ8jqpywCU1IVAqLrOMpXaibibiccibeH1UgOLS3orRlaYFjWQ/640?wx_fmt=png)jenkins-script-delete-history

输入脚本

```
# "test"是项目名称，100是指（0~·100）全删除，就是构建历史前面的IDdef jobName = "test"def maxNumber = 100Jenkins.instance.getItemByFullName(jobName).builds.findAll {it.number <= maxNumber}.each { it.delete() }复制代码
```

点击`运行`

* * *

最后
--

在日常工作中你还使用哪些`Centos配置`呢？欢迎在评论区留下的你的见解！

觉得有收获的朋友欢迎点赞，关注一波!

往期好文
----

1.  2021 年前端开发者需要知道的 JS/React 规范
    
2.  你有一份 ECMAScript 特性速查表, 请查收
    
3.  作为前端，你应该了解的分辨率 / 逻辑像素 / 物理像素 / retina 屏知识 🧐
    

参考文档
----

1.  How To Install Node.js on CentOS 8
    
2.  How to Set Up SSH Keys on CentOS 8
    
3.  How to configure build tools (Gradle, Yarn) in Jenkins and use them in Jenkinsfile 🛠
    
4.  搭建 Docker 环境
    
5.  搭建 Nginx 静态网站
    
6.  搭建 Node.js 环境
    
7.  实战笔记：Jenkins 打造强大的前端自动化工作流
    
8.  从 0 到 1 实现一套 CI/CD 流程
    
9.  CentOS8 安装 MySQL8
    

最后
--

欢迎关注【前端瓶子君】✿✿ヽ (°▽°) ノ✿  

回复「算法」，加入前端编程源码算法群，每日一道面试题（工作日），第二天瓶子君都会很认真的解答哟！  

回复「交流」，吹吹水、聊聊技术、吐吐槽！

回复「阅读」，每日刷刷高质量好文！

如果这篇文章对你有帮助，「在看」是最大的支持  

》》面试官也在看的算法资料《《  

“在看和转发” 就是最大的支持