> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/W9agTBmm9s0EQNusaib01Q)

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bewkvG2cthnU8al0FNibnYrmD9ia5k1ibAADNbPCdH8jbYuN7pRXP1ToAlJCeEJ6JSzgHNibnUjkibFTTA/640?wx_fmt=gif)

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bewkvG2cthnU8al0FNibnYrmYu6YpAEJd6jk6BJ3bY7UNEr8LNgBgUByMgLx7NwllicJibHNtXDU8L6Q/640?wx_fmt=png)

总字数：7,218 | 阅读时间：27 分钟　

  

在上一篇文章中我们对容器、镜像等概念做了详细的介绍，本文介绍一些容器的网络连接，以及我们如何通过 Dockerfile 来构建镜像使用，同时我们如何在前端项目中使用 docker 来进行容器部署。

网络
==

我们部署的容器中很多应用都是需要让外部通过网络端口来进行访问的，比如比如 mysql 的 3306 端口，mongodb 的 27017 端口和 redis 的 6379 端口等等；不仅是外部访问，不同的容器之间可能还需要进行通信，比如我们的 web 应用容器需要来连接 mysql 或者 mongodb 容器，都涉及到了网络通信。

端口映射
----

容器要想让外部访问应用，可以通过`-P`或者`-p`参数来指定需要对外暴露的端口：

```
$ docker run -d -P nginx
9226326c42067d282f80dbc18a8a36bf54335b61a84b191a29a5f59d25c9fbc3
```

使用`-P`会在主机绑定一个`随机端口`，映射到容器内部的端口；我们查看刚刚创建的容器，可以看到随机端口 49154 映射到了容器内部的 80 端口：

```
$ docker ps -l
CONTAINER ID   IMAGE    CREATED              STATUS              PORTS                                    
9226326c4206   nginx    About a minute ago   Up About a minute   0.0.0.0:49154->80/tcp, :::49154->80/tcp   
```

使用`logs`命令我们可以看到 nginx 的访问日志：

```
$ docker logs 9226326c420610.197.92.41 - - [16/Mar/2022:01:40:32 +0000] "GET / HTTP/1.1" 304 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36" "-"
```

`docker port`可以快捷地让我们查看容器端口的绑定情况：

```
$ docker port 9226326c4206
80/tcp -> 0.0.0.0:49154
```

使用`-p`参数可以指定一个端口进行映射：

```
$ docker run -d -p 3000:80 nginx
```

也可以使用`ip:hostPort:containerPort`格式指定映射一个特定的 ip：

```
$ docker run -d -p 127.0.0.1:3000:80 nginx
```

省略 hostPort 参数本地主机会自动分配一个端口，类似`-P`参数的作用：

```
$ docker run -d -p 127.0.0.1::80 nginx
```

还可以使用`udp`来指定映射到 udp 端口：

```
$ docker run -d -p 3000:80/udp nginx
```

有时候我们想要映射容器的多个端口，可以使用多个 - p 参数：

```
$ docker run -d 
            -p 8000:8000 \
            -p 8010:8010\
            nginx
```

或者映射某个范围内的端口列表：

```
$ docker run -d -p 8080-8090:8080-8090 nginx
```

docker 网络模式
-----------

我们想要将多个容器进行互联互通，为了避免不同容器之间互相干扰，可以给多个容器建立不同的局域网，让局域网络内的网络彼此联通。

要理解 docker 的网络模式，我们首先来看下 docker 有哪些网络；我们安装 docker 后，它会自动创建三个网络 none、host 和 brdge，我们使用`network ls`命令查看：

```
$ docker network lsNETWORK ID     NAME      DRIVER    SCOPEc64d7d519c22   bridge    bridge    local6306a0b1d150   host      host      locald058571d4197   none      null      local
```

我们分别来看下这几个网络的用途；首先是`none`，none 顾名思义，就是什么都没有，该网络关闭了容器的网络功能，我们使用`--network=none`指定使用 none 网络：

```
$ docker run -itd --name=busybox-none --network=none busybox49f88dd75ae774bea817b27c647506eda5ad581403bfbad0877e8333376ae3b0docker exec 49f88dd75ae7  ip a1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00    inet 127.0.0.1/8 scope host lo       valid_lft forever preferred_lft forever2: tunl0@NONE: <NOARP> mtu 1480 qdisc noop qlen 1000    link/ipip 0.0.0.0 brd 0.0.0.03: ip6tnl0@NONE: <NOARP> mtu 1452 qdisc noop qlen 1000    link/tunnel6 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00 brd 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
```

我们这里使用了 busybox 镜像，可能有的童鞋对它不了解，这是一个集成压缩了三百多个常用 linux 命令和工具的软件，它被称为 Linux 工具里的`瑞士军刀`，我们这里主要用它的 ip 命令查看容器的网络详细情况。

我们看到这个容器除了 lo 本地环回网卡，没有其他的网卡信息；不仅不能接收信息，也不能对外发送信息，我们用 ping 命令测试网络情况：

```
$ docker exec 49f88dd75ae7 ping xieyufei.comping: bad address 'xieyufei.com'
```

这个网络相当于一个封闭的孤岛，那我们不禁会想，这样 “自闭” 的网络有什么用呢？

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25beSoeqbOTiajfYgsD5mnMddTicdylgJbdA73vKvRf6YzRrQicsOzY7ZQeHiblHwVjZpadI5lVd2MYc2Bg/640?wx_fmt=gif)自闭了

封闭意味着隔离，一些对安全性要求高并且不需要联网的应用可以使用 none 网络。比如某个容器的唯一用途是生成随机密码，就可以放到 none 网络中避免密码被窃取。

其次是`bridge网络模式`，docker 安装时会在宿主机上虚拟一个名为`docker0`的网桥，如果不指定 --network，创建的容器默认都会挂载到`docker0`上，我们通过命令查看宿主机下所有的网桥：

```
$ brctl show
bridge name     bridge id               STP enabled     interfaces
docker0         8000.02426b8674a4       no         
```

这里的网桥我们可以把它理解为一个路由器，它把两个相似的网络连接起来，并对网络中的数据进行管理，同时也隔离外界对网桥内部的访问；同一个网桥下的容器之间可以相互通信；我们还是通过 busybox 查看容器的网络情况

```
$ docker run -itd --name=busybox-bridge --network=bridge busyboxf45e26e5bb6f94f50061f22937abb132fb9de968fdd59fe7ad524bd81eb2f1b0$ docker exec f45e26e5bb6f ip a181: eth0@if182: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue     link/ether 02:42:ac:11:00:06 brd ff:ff:ff:ff:ff:ff    inet 172.17.0.6/16 brd 172.17.255.255 scope global eth0       valid_lft forever preferred_lft forever
```

我们看到这里容器多了一个 eth0 的网卡，它的 ip 是`172.17.0.6`。

最后是`host网络模式`，这种模式禁用了 Docker 的网络隔离，容器共享了宿主机的网络，我们还是通过`busybox`来查看容器的网络情况：

```
$ docker run -itd --name=busybox-host --network=host busybox2d1f6d7a01f1afe1e725cf53423de1d79d261a3b775f6f97f9e2a62de8f6bb74$ docker exec 2d1f6d7a01f1 ip a2: enp4s0f2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000    link/ether 74:d0:2b:ec:96:8a brd ff:ff:ff:ff:ff:ff    inet 192.168.0.100/24 brd 192.168.0.255 scope global dynamic noprefixroute enp4s0f2       valid_lft 37533sec preferred_lft 37533sec
```

我们发现这里容器的 ip 地址是 192.168.0.100，和我宿主机的 ip 地址是一样的；host 模式其实类似于 Vmware 的`桥接模式`，容器没有独立的 ip、端口，而是使用宿主机的 ip、端口。

需要注意的是 host 模式下，不需要添加 - p 参数，因为它使用的就是主机的 IP 和端口，添加 - p 参数后，反而会出现以下警告：

```
WARNING: Published ports are discarded when using host network mode
```

host 模式由于和宿主机共享网络，因此它的网络模型是最简单最低延迟的模式，容器进程直接与主机网络接口通信，与物理机性能一致。不过 host 模式也不利于网络自定义配置和管理，所有容器使用相同的 ip，不利于主机资源的利用，一些对网络性能要求比较高的容器，可以使用该模式。

容器互联
----

我们通过容器互联来测试两个容器在同一个网桥下面是如何进行连接互通的；首先我们自定义一个网桥：

```
$ docker network create -d bridge my-net
```

如果对网桥不满意，可以通过`rm`命令删除它：

```
$ docker network rm my-net
```

我们新建两个容器，并且把它们连接到`my-net`的网络中：

```
$ docker run -itd --name busybox1 --network my-net busybox
$ docker run -itd --name busybox2 --network my-net busybox
```

我们让两个容器之间互相 ping，发现他们之间能够 ping 通：

```
$ docker exec  busybox1 ping busybox2PING busybox2 (172.23.0.3): 56 data bytes64 bytes from 172.23.0.3: seq=0 ttl=64 time=0.139 ms64 bytes from 172.23.0.3: seq=1 ttl=64 time=0.215 ms$ docker exec  busybox2 ping busybox1PING busybox1 (172.23.0.2): 56 data bytes64 bytes from 172.23.0.2: seq=0 ttl=64 time=0.090 ms64 bytes from 172.23.0.2: seq=1 ttl=64 time=0.224 ms
```

Dockerfile
==========

我们在前一篇文章中简单提到了 Dockerfile 的两个命令 FROM 和 RUN，其实它还提供了其他功能强大的命令，我们对它的命令深入讲解；首先我们知道 Dockerfile 是一个用来构建镜像的文本文件，文本内容包含了一条条构建镜像所需的指令和说明；在 docker build 命令中我们使用`-f`参数来指向文件中任意位置的 Dockerfile：

```
$ docker build -f /path/to/Dockerfile
```

FROM 指令
-------

`FROM指令`用来指定一个基础镜像，它决定了 Dockerfile 构建出的镜像为何物以及怎样的环境；大多数的 Dockerfile，都是以 FROM 指令开始；它的语法如下：

```
FROM <image> [AS <name>]
FROM <image>:<tag> [AS <name>]
```

Dockerfile 必须以 FROM 指令开始，不过它支持在 FROM 之前由 ARG 指令定义一个变量：

```
ARG NG_VERSION=1.19.3FROM nginx:${NG_VERSION}CMD /bin/bash
```

### 多阶段构建

我们在构建镜像时通常会有多个阶段的镜像需要来进行构建，比如 vue 项目构建镜像时，我们需要在`编译阶段`打包出 dist 文件，还需要在`生产运行阶段`使用 dist 文件作为静态资源；如果不使用多阶段构建，我们通常需要两个 Dockerfile 文件，构建出两个镜像，这样有一个镜像肯定是浪费的。

Docker 从 17.05 开始，支持多阶段构建，就是我们在 Dockerfile 中可以使用多个`FROM指令`，每个 FROM 指令都可以使用不同的基础镜像，并且每条指令都会开始新阶段的构建；在多阶段构建中，我们可以将资源从一个阶段复制到另一个阶段，在最终镜像中只保留我们所需要的内容。

```
FROM node# ...一些操作FROM nginx# ...一些操作COPY --from=0 . .
```

第二个 FROM 指令开始一个新的构建阶段，`COPY --from=0`代表从上一个阶段（即第一阶段）拷贝文件；默认情况下，构建阶段没有命名，可以使用从 0 开始的整数编号引用它；我们可以给 FROM 指令加上一个`as <Name>`作为构建阶段的命名。

```
FROM node as compile

FROM nginx as serve

COPY --from=compile . .
```

在后面的例子中，我们会来演示如何使用多阶段构建优化我们的构建过程。

### 基础镜像选择

由于基础镜像决定着构建出镜像产物的大小，因此选择一个合适的基础镜像显得十分重要了。如果我们去 hub.docker.com 查看 node 的标签，我们会发现除了版本号之外，后面还会带着一些看不懂的单词，什么 alpine，什么 slime 了，这些版本号都代表着什么含义呢？我们简单的了解一下。

> ❝
> 
> docker 镜像之间的区别在于底层的操作系统
> 
> ❞

首先如果什么都不带，默认 latest，那就是完整的镜像版本，如果你还是一个小白，对其他版本没有什么了解的话，那么选它是肯定不会出错的。

其次是`slim版本`，slim 表示最小安装包，仅包含需要运行指定容器的特定工具集。通过省去较少使用的工具，镜像会更小。如果我们服务器有空间限制且不需要完整版本，就可以使用此镜像。不过使用这个版本时，要进行彻底得测试。

然后是我们经常会看到的`alpine版本`，alipine 镜像基于`alpine linux`项目，这是一个社区开发的面向安全应用的轻量级 Linux 发行版。它的优点就是基于的 linux 操作系统非常轻量，因此构建出来的镜像也非常的轻量；它的缺点也十分的明显，就是不包含一些有可能会用到的包，并且使用的 glibc 包等都是阉割版；因此如果我们使用这个版本，也需要进行彻底的测试。

我们 ls 看下这三个版本，也能发现它们的大小存在着差异：

```
$ docker image ls node
REPOSITORY   TAG       IMAGE ID       CREATED        SIZE
node         slim      ffedf4f28439   5 days ago     241MB
node         alpine    d2b383edbff9   3 months ago   170MB
node         latest    a283f62cb84b   3 months ago   993MB
```

其次是一些 Debian 的发行版，Debian 是一个自由的，稳定得无与伦比操作系统；带有下面一些标签的镜像对应 Debian 发行版本号。

*   bullseye：Debian 11
    
*   buster：Debian 10
    
*   stretch：Debian 9
    
*   jessie：Debian 8
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25beSoeqbOTiajfYgsD5mnMddTxicJTRjeOuadqqDlK7HxibXqgJr47KiaG6WzR51VjbTXiaEoxdFIpDMogg/640?wx_fmt=jpeg) 稳定

RUN 指令
------

`RUN指令`用于在镜像容器中执行命令，其有以下两种执行方式：

```
# shell 执行RUN <command># exec 格式RUN ["可执行文件", "参数1", "参数2"]
```

RUN 指令常见的用法就是安装包用`apt-get`，假设我们需要在镜像安装 curl：

```
FROM ubuntu:18.04

RUN apt-get update

RUN apt-get install -y curl
```

我们知道 Dockerfile 的指令是分层构建的，每一层都有缓存，假设我们下次添加了一个包 wget：

```
FROM ubuntu:18.04

RUN apt-get update

RUN apt-get install -y curl wget
```

如果我们下次再次构建时，`apt-get update`指令也不会执行，使用之前缓存的镜像；而 install 由于 update 指令没有执行，可能安装过时的 curl 和 wget 版本。

因此我们通常会把 update 和 install 写在一条指令，确保我们的 Dockerfiles 每次安装的都是包的最新的版本；同时也可以减少镜像层数，减少包的体积：

```
RUN apt-get update && apt-get install -y curl wget
```

WORKDIR 工作目录
------------

`WORKDIR指令`可以用来指定工作目录，以后各层的当前目录就被改为指定的工作目录；如果该目录不存在，WORKDIR 会自动创建目录。

很多童鞋把`Dockerfile`当成 Shell 脚本来写，因此可能会导致下面的错误：

```
FROM node:10.15.3-alpineRUN mkdir /app && cd /appRUN echo "hello" > world.txt
```

这里 echo 的作用是将字符串 hell 重定向写入到 world.txt 中；如果我们把这个 Dockerfile 构建镜像运行后，会发现找不到`/app/world.txt`；由于在 Shell 脚本中两次连续运行的命令是同一个进程执行环境，前一行命令运行影响后一个命令；而由于 Dockerfile 分层构建的原因，两个 RUN 命令执行的环境是两个完全不同的容器。

因此如果我们需要改变以后每层的工作目录的位置，可以使用`WORKDIR`指令，建议在 WORKDIR 指令中使用绝对路径：

```
FROM node:10.15.3-alpineWORKDIR /appRUN echo "hello" > world.txt
```

这样生成的 world.txt 就在 / app 目录下面了。

COPY 复制
-------

`COPY指令`用于从构建上下文目录中复制文件到镜像内的目标路径中，类似 linux 的 cp 命令，它的语法格式如下：

```
COPY [--chown=<user>:<group>] <源路径>... <目标路径>COPY [--chown=<user>:<group>] ["<源路径1>",... "<目标路径>"]
```

复制的文件可以是一个文件、多个文件或者通配符匹配的文件：

```
COPY package.json /app

COPY package.json app.js /app

COPY src/*.js /app
```

但需要注意的是，COPY 指令只能复制文件夹下的文件，而不能复制文件夹本身，和 linux 的 cp 命令有区别；比如下面复制 src 文件夹：

```
COPY src /app
```

运行后我们发现 src 文件夹下面的文件都拷贝到 / app 目录下了，没有拷贝 src 文件夹本身，因此我们需要这样来写：

```
COPY src /app/src
```

CMD 指令
------

`CMD指令`用于执行目标镜像中包含的软件，可以指定参数，它也有两种语法格式：

```
CMD <命令>CMD ["可执行文件", "参数1", "参数2"...]
```

我们发现 CMD 和 RUN 都可以用来执行命令的，很相似，那他们两者有什么区别么？首先我们发现 RUN 是用来执行 docker build 构建镜像过程中要执行的命令，比如创建文件夹 mkdir、安装程序 apt-get 等等。

而 CMD 指令在 docker run 时运行而非 docker build，也就是启动容器的时候，它的首要目的在于为启动的容器指定默认要运行的程序，程序运行结束，容器也就结束。

而容器在 run 的时候只能创建一次，因此一个 Dockerf 中也只能有一个 CMD 指令；比如我们的容器运行 node 程序，最后需要启动程序：

```
CMD ["node", "app.js"]# 或者CMD npm run start
```

ENTRYPOINT 入口点
--------------

`ENTRYPOINT指令`的作用和 CMD 一样，也是在指定容器启动程序和参数；一个 Dockerfile 同样也只能有一个 ENTRYPOINT 指令；当指定了 ENTRYPOINT 后，CMD 指令的含义发生了改变，不再是直接的运行其命令，而是将 CMD 的内容作为参数传给 ENTRYPOINT 指令，相当于：

```
<ENTRYPOINT> "<CMD>"
```

那么这样的好处是啥呢？我们看一个使用的例子，我们在 Docker 中使用 curl 命令来获取公网的 IP 地址：

```
FROM ubuntu:18.04# 切换ubuntu源RUN  sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.listRUN  apt-get cleanRUN apt-get update \    && apt-get install -y curl \    && rm -rf /var/lib/apt/lists/*    CMD [ "curl", "-s", "http://myip.ipip.net" ]
```

然后使用`docker build -t myip .`来构建 myip 的镜像；当我们想要查询 ip 的时候，只需要执行如下命令：

```
$ docker run --rm myip
当前 IP：218.4.251.37  来自于：中国 江苏 苏州  电信
```

这样我们就实现了把镜像当成命令使用，不过如果我们想要同时显示 HTTP 头信息，就需要加上`-i`参数：

```
$ docker run --rm myip -idocker: Error response from daemon: failed to create shim: OCI runtime create failed: container_linux.go:380: starting container process caused: exec: "-i": executable file not found in $PATH: unknown.
```

但是这个`-i`参数加上后并不会传给`CMD指令`，而是传给了 docker run，但是 docker run 并没有 - t 参数，因此报错；如果我们想要加入 - i，就需要重新完整的输入这个命令；而使用 ENTRYPOINT 指令就可以解决这个问题：

```
FROM ubuntu:18.04RUN  sed -i s@/archive.ubuntu.com/@/mirrors.aliyun.com/@g /etc/apt/sources.listRUN  apt-get cleanRUN apt-get update \    && apt-get install -y curl \    && rm -rf /var/lib/apt/lists/*    ENTRYPOINT  [ "curl", "-s", "http://myip.ipip.net" ]
```

我们重新尝试加入`-i`参数：

```
$ docker run --rm myip -i
HTTP/1.1 200 OK
Date: Fri, 01 Apr 2022 07:24:21 GMT
Content-Type: text/plain; charset=utf-8
Content-Length: 67
Connection: keep-alive
X-Via-JSL: fdc330b,-
Set-Cookie: __jsluid_h=9f0775bbcb4cc97b161093b4c66dd766; max-age=31536000; path=/; HttpOnly
X-Cache: bypass

当前 IP：218.4.251.37  来自于：中国 江苏 苏州  电信
```

就可以发现 http 的头部信息也展示出来了。

VOLUME 数据卷
----------

`VOLUME指令`用于暴露任何数据库存储文件，配置文件，或容器创建的文件和目录；其语法格式如下：

```
VOLUME ["<路径1>", "<路径2>"...]VOLUME <路径>
```

我们可以事先指定某些目录挂载为匿名卷，这样在运行时如果用户不指定挂载，其应用也可以正常运行，不会向容器存储层写入大量数据，比如：

```
VOLUME /data
```

这里的 / data 目录就会在容器运行时自动挂载为匿名卷，任何向 / data 中写入的信息都不会记录进容器存储层，从而保证了容器存储层的无状态化。

```
$ docker run -d -v mydata:/data xxxx
```

我们运行容器时可以本地目录覆盖挂载的匿名卷；**「需要注意」**的是，在 Windows 下挂载目录和 Linux 环境（以及 Macos）挂载目录有一些区别，在 Linux 环境下由于是树状目录结构，我们挂载时直接找到目录即可，如果目录不存在，docker 还会自动帮你创建：

```
$ docker run -d -v /home/root/docker-data:/data xxxx
```

windows 环境下则需要对应盘符下的目录：

```
$ docker run -d -v d:/docker-data:/data xxxx
```

EXPOSE 端口
---------

`EXPOSE指令`是声明容器运行时提供服务的端口，这只是一个声明，在容器运行时并不会因为这个声明应用就会开启这个端口的服务；其语法如下：

```
EXPOSE <端口1> [<端口2>...]
```

在 Dockerfile 中写入这样的声明有两个好处，一个是帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射；另一个好处则是在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口。

ENV 指令
------

`ENV指令`用于设置环境变量，其语法有两种，支持多种变量的设置：

```
ENV <key> <value>
ENV <key1>=<value1> <key2>=<value2>...
```

这里的环境变量无论是后面的指令，如`RUN`指令，还是`运行时`的应用，都可以直接使用环境变量：

```
ENV NODE_VERSION 7.2.0RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc"
```

这里定义了环境变量`NODE_VERSION`，后面的 RUN 指令中可以多次使用变量进行操作；因此如果我们后续想要升级 node 版本，只需要更新`7.2.0`即可

ARG 指令
------

`ARG指令`和 ENV 一样，也是设置环境变量的，所不同的是，ARG 设置的是构建环境的环境变量，在以后容器运行时是不会存在的。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beSoeqbOTiajfYgsD5mnMddTia94hjpbIc6pBA8DxD3KTeDSdWwWdf3t93doIqots0BYnWS7rRkZY1g/640?wx_fmt=png)通俗解释指令的意义

部署前端项目
======

vue 项目
------

当我们在本地开发完一个前端项目后，肯定要部署在服务器上让别人来进行访问页面的，一般都是让运维在服务器上配置 nginx 来将我们的项目打包后作为静态资源；在深入 Nginx 一文中，我们介绍了使用 nginx 如何来做静态服务器，这里我们自己配置 nginx 文件，结合 docker 来部署我们的项目。

首先在我们项目目录创建 nginx 的配置文件`default.conf`：

```
server {
    listen 80;
    server_name _;
    location / {
        root /usr/share/nginx/html;
        index index.html inde.htm;
        try_files $uri $uri/ /index.html =404;
    }
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

该配置文件定义了我们打包后静态资源的目录为`/usr/share/nginx/html`，因此我们需要将 dist 文件夹拷贝到该目录；同时使用了`try_files`来匹配 vue 的 history 路由模式。

在项目目录再创建一个 Dockerfile 文件，写入以下内容：

```
FROM nginx:latest

COPY default.conf /etc/nginx/conf.d/

COPY dist/ /usr/share/nginx/html/

EXPOSE 80
```

我们在项目打包生成 dist 文件后就可以构建镜像了：

```
$ docker build -t vue-proj .
```

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beSoeqbOTiajfYgsD5mnMddTuibxFd08gibxJDtpoJWOo77QgpSrKbh7McX6dhJs9OicCuBfkCM3SvMsA/640?wx_fmt=png)构建镜像

接下来基于该镜像启动我们的服务器：

```
$ docker run -itd -p 8080:80 vue-proj
```

这样我们的程序就起来了，访问`http://localhost:8080`端口就可以看到我们部署的网站了。

express 项目
----------

我们还有一些 node 项目，比如 expree、eggjs 或者 nuxt，也可以使用 docker 进行部署，不过我们需要把所有的项目文件都拷贝到镜像中去。

首先我们模拟一个简单的 express 的入口文件 app.js

```
const express = require("express");const app = express();const PORT = 8080;app.get("/", (req, res) => {  res.send("hello express");});app.listen(PORT, () => {  console.log(`listen on port:${PORT}`);});
```

由于下面需要拷贝整个项目的文件，因此我们可以通过`.dockerignore`文件来忽略某些文件：

```
.git
node_modules
```

然后编写我们的`Dockerfile`：

```
FROM node:10.15.3-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --registry https://registry.npm.taobao.org

COPY . .

EXPOSE 8080

CMD npm run start
```

我们看到上面的流程是先拷贝 package*.json 文件，安装依赖后再拷贝整个项目，那么为什么这么做呢？聪明的童鞋大概已经猜到了，大概率又双叒叕是跟 docker 的分层构建和缓存有关。

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25beSoeqbOTiajfYgsD5mnMddTtfOcSvIdp8ibwdhXLkVeOGXyHo7e8l8gLVAb4EVKATFUjacY4rIpSVQ/640?wx_fmt=jpeg)斗图

不错，如果我们把 package*.json 和代码程序一起拷贝，如果我们只更改了代码而没有新增依赖，但 docker 仍然会安装依赖；但是我们如果把它单独拿出来的话，就能够提高缓存的命中率。后面的构建镜像和启动容器也就不再赘述了。

vue 项目多阶段构建
-----------

上面我们在 vue 项目中`手动打包`生成了 dist 文件，然后再通过 docker 进行部署；在 FROM 指令中我们也提到了多阶段构建，那么来看下如果使用多阶段构建如何来进行优化。

我们还是在项目中准备好 nginx 的配置文件`default.conf`，但是这次我们不再手动生成 dist 文件，而是将构建的过程放到 Dockerfile 中：

```
FROM node:12 as compile

WORKDIR /app

COPY package.json ./

RUN npm i --registry=https://registry.npm.taobao.org

COPY . .

RUN npm run build

FROM nginx:latest as serve

COPY default.conf /etc/nginx/conf.d/

COPY --from=compile /app/dist /usr/share/nginx/html/

EXPOSE 80
```

我们看到在上面第一个`compile`阶段，我们通过 npm run build 命令生成了 dist 文件；而第二个阶段中再把 dist 文件拷贝到 nginx 的文件夹中即可；最后构建的产物依然是最后 FROM 指令的 nginx 服务器。

多阶段构建用到的命令比较多，很多童鞋会想最后的镜像会不会很大；我们通过`ls命令`查看构建后的镜像：

```
$ docker images
REPOSITORY            TAG                  IMAGE ID       CREATED          SIZE
multi-compile         latest               a37e4d71562b   11 seconds ago   157MB
```

可以看到它的大小和单独用 nginx 构建差不多。

聊了这么多 Docker 的知识你学会如何构建自己的 Docker 镜像了吗？关注前端壹读，更新会更快哦。

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25bdaxicBlRMxNtxMjHib4IZTQygclqnysV77ic7jRicekWrccxabFZTve9atAJ5ERQHk8lVqpg51wOuKfw/640?wx_fmt=jpeg)

  

此处按一下又不会怀孕  
还能经常普及一些好玩的前端知识

  

看都看完了，还不点这里试试

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bdaxicBlRMxNtxMjHib4IZTQyia4V8icC7UdVtdFTbssJvcHKwvkl5VHehicxibLeEzaBGAiarkpsN2t48ZA/640?wx_fmt=gif)