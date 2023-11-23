> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/U1SoAwNRnj8f5mBNYZBLgg)

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bewkvG2cthnU8al0FNibnYrmD9ia5k1ibAADNbPCdH8jbYuN7pRXP1ToAlJCeEJ6JSzgHNibnUjkibFTTA/640?wx_fmt=gif)

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bewkvG2cthnU8al0FNibnYrmYu6YpAEJd6jk6BJ3bY7UNEr8LNgBgUByMgLx7NwllicJibHNtXDU8L6Q/640?wx_fmt=png)

总字数：10,018 | 阅读时间：36 分钟　

  

本文是 Docker 的第三篇文章，我们将之前 Docker 中遗漏的一些问题进行深入的探讨，比如设置容器的环境变量、镜像的导入导出等一些常用的功能；然后我们会搭建一个私有的 Registry 仓库，上传和拉取我们自己的镜像；以及最重要的部分，容器的编排，这次我们不再是单打独斗地操作一个容器了，我要一次打十个容器！开个玩笑，笔者又不是叶问。

最后笔者会分享一些常用的有趣又实用镜像，比如私有网盘、爬虫、图床、私有笔记、私有媒体库以及下载工具等等，可以提升我们的日常工作效率，记得看完哦；本文依旧干货满满，新来的小伙伴记得点赞关注，养成好的习惯。

容器的环境变量
=======

我们在启动 docker 容器的时候，经常需要向容器传递一些参数，以便容器进行一些特殊的配置，比如给 mysql 传入`MYSQL_ROOT_PASSWORD`的 root 用户密码，或者我们想在自己的容器中传入一些数据库的配置等等。

第一种方式也最简单的，也是最常见的，在 run 容器时使用`--env`，也就是我们在各个文档中经常见到的简写`-e`：

```
$ docker run -itd -e MYSQL_USER=root -e MYSQL_PASS=pass xxx:latest
```

我们在 js 代码中可以通过环境变量`process.env`来获取

```
const { MYSQL_USER, MYSQL_PASS } = process.env;
```

在 python 代码中调用`os.getenv`获取：

```
MYSQL_USER = os.getenv("MYSQL_USER", "")MYSQL_PASS = os.getenv("MYSQL_PASS", "")
```

第二种方式，也是我们在 Docker 进阶部署中介绍的，通过 Dockerfile 文件的`ENV指令`：

```
ENV MYSQL_USER root
ENV MYSQL_PASS pass
```

第三种方式，run 容器时，通过`--env-file`指令加载 env 文件，首先我们把配置信息放在文件 env.list 中：

```
$ cat env.list
MYSQL_USER=root3
MYSQL_PASS=pass3
```

启动容器时传入文件，这样我们就不用传入一大堆的 - e 命令了：

```
$ docker run -itd --env-file env.list xxx:latest
```

经过测试，三种方式的优先级如下：

> ❝
> 
> -e 指令 `大于>` --env-file `大于>` ENV 指令
> 
> ❞

我们查看容器的环境变量也很简单，通过`inspect`命令，也可以加上 grep 过滤想要的字段：

```
$ docker inspect XXX 
$ docker inspect XXX | grep MYSQL_USER
```

也可以解析一下返回内容：

```
$ docker inspect -f '{{range $index, $value := .Config.Env}}{{println $value}}{{end}}' XXX
```

镜像与容器的导入导出
==========

有时候我们部署 docker 容器会遇到问题，比如服务器在内网，不能连接外网的情况（一些具有较高保密性的企业），或者网络下载慢，不通畅；我们就可以编译、导出镜像后在内网服务器导入，就可以实现内网部署。

镜像 save 和 load
--------------

镜像的导入我们通常使用`docker save`和 ``docker load` 命令，save 命令将镜像打包成 tar 文件：

```
$ docker save img:latest > img.tar# 或者$ docker save -o img.tar img:latest
```

> ❝
> 
> 导出镜像尽量使用`镜像名:标签`的形式，使用镜像 id 容易出现导入后镜像名出现`<none>`的情况。
> 
> ❞

我们还可以将多个镜像打包到一个文件进行导出：

```
$ docker save img1:latest img2:latest > img.tar
```

使用 load 命令就可以将导出的镜像包加载进来：

```
$ docker load < img.tar
```

save 和 load 的应用场景，就是我们上面说的内网部署的情况；同时如果我们的应用还是使用 docker compose 编排的多个镜像组合，就可以使用 save 将用到的多个镜像打包，然后拷贝到客户服务器上使用 load 载入。

容器 export 和 import
------------------

首先我们查看本机的所有容器，使用`export命令`将容器 ID 导出成文件：

```
$ docker export 3e877a80b319 > server.tar
```

导出到文件后，我们在本地目录可以看到该 tar 包文件，我们再使用`import命令`将镜像文件导入进来：

```
$ docker import server.tar my-server:latest
```

导入后的容器文件会成为一个镜像，我们可以为它指定新的名称，如果存在同名镜像，原有的名称会被剥夺，赋给新的镜像。

export 和 import 的应用场景主是要用来制作基础镜像，比如我们从一个 ubuntu 镜像启动一个容器，然后安装一些软件和进行一些设置后，使用 docker export 保存为一个基础镜像。然后把这个镜像分发给其他人使用，比如作为基础的开发环境。

总结一下 docker save 和 docker export 的区别：

*   docker save 保存的是镜像（image），docker export 保存的是容器（container）；
    
*   docker load 用来载入镜像包，docker import 用来载入容器包，但两者都会恢复为镜像；
    
*   docker load 不能对载入的镜像重命名，而 docker import 可以为镜像指定新名称。
    

私有仓库
====

在 Docker 中，我们执行`pull XXX`某个镜像的时候，实际上它是从`registry.hub.docker.com`官方的镜像仓库去拉取的；在实际工作中，我们不会把企业的项目 push 到公有仓库中管理；所以为了更好的管理，Docker 不仅提供了公有仓库，也允许我们搭建私有仓库。

Docker Registry 是一个无状态，高度可扩展的服务器端应用程序，它存储并允许您分发 Docker 映像；我们通过 run 命令启动：

```
$ docker run -d -p 5000:5000 -v $PWD:/var/lib/registry --restart=always --name registry registry:2
```

Registry 服务默认将上传的镜像保存在容器的`/var/lib/registry`，我们可以将服务器本地的文件夹挂载到该目录，即可实现保存镜像；通过以下 curl 我们可以查看服务器是否启动，以及服务器上的镜像。

```
$ curl http://192.168.0.1:5000/v2/_catalog# 返回数据：{"repositories":[]}
```

正常情况下，服务器推送镜像到仓库默认使用的是 https，但是我们在企业内部使用，这里就不加 https；需要在客户端配置可信的仓库地址为 http，否则 push 时会报如下错误：

```
The push refers to repository [192.168.0.1:5000/server]Get "https://192.168.0.1:5000/v2/": http: server gave HTTP response to HTTPS client
```

在 windows 的 Docker 客户端，我们可以直接修改 Desktop 的配置，在 Setting 中选择`Docker Engine`，添加 insecure-registries 字段，完成后点击`Apply & Restart`重启即可：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3Wn7pAnC4hkgy8yhxic4MgPRuncftuMKzVEpfY8AhgyYYRH7sqtfGaWxg/640?wx_fmt=png)添加 http 仓库地址

在 linux 客户端，我们修改`/etc/docker/daemon.json`文件，我们同样也是加入`insecure-registries`，然后执行命令`sudo service docker restart`重启 docker：

```
{  "insecure-registries": [    "192.168.0.1:5000"  ],}
```

> ❝
> 
> 修改该文件必须符合 JSON 文件规范，否则会启动失败
> 
> ❞

Registry 服务启动后，我们来看下如何推送镜像到仓库中；我们从 Docker Hub 下载一个`ubuntu:18.04`镜像，然后将它推送到私有仓库；首先给这个镜像重新打上服务器的标签：

```
$ docker tag ubuntu:18.04 192.168.0.1:5000/my-ubuntu:latest
```

使用`push命令`推送镜像：

```
$ docker push 192.168.0.1:5000/my-ubuntu:latest
```

我们可以在另外一台机器上拉取这个镜像，也可以将本地的`192.168.0.1:5000/my-ubuntu:latest`和`ubuntu:18.04`镜像删除后，再次拉取：

```
$ docker pull 192.168.0.1:5000/my-ubuntu:latest
```

再次 curl 查看服务器，我们就能看到该镜像已经在服务器生效了

```
$ curl http://192.168.0.1:5000/v2/_catalog# 返回数据：{"repositories":["my-ubuntu"]}
```

开启认证
----

我们上面仓库搭建后，所有客户端都可以 push、pull，这是我们不希望看到的，我们想要认证的用户才能够访问；将原有容器删除，创建一个保存账号密码的文件：

```
$ mkdir -p ~/auth && cd ~/auth$ docker run --rm  --entrypoint htpasswd httpd:alpine -Bbn username password > ./htpasswd
```

将上面的 username 和 password 替换成自己的账号密码，运行容器时我们绑定 auth 文件夹：

```
$ docker run -d -p 5000:5000    -v $PWD:/var/lib/registry \     -v ~/auth:/auth \    -e "REGISTRY_AUTH=htpasswd" \    -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \    -e  REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \    --restart always --name registry registry:2
```

服务器开启认证后客户端再 pull、push 会提示`no basic auth credentials`，我们需要先进行登录操作：

```
# 登录$ docker login 192.168.0.1:5000# 退出登录$ docker logout 192.168.0.1:5000# windows客户端运行添加winpty$ winpty docker login 192.168.0.1:5000
```

Compose
=======

`Docker Compose`是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排。在前两篇 Docker 中，我们都是介绍了单个容器的构建和使用方式；在日常开发中我们经常会遇到需要多个容器相互配合使用的情况，比如除了 web 项目本身，还要数据库支持，nginx 负载均衡等等；如果所有容器都通过命令行的方式构建、启动、删除等操作会十分繁琐；就好像你每天下班回到家里，都需要进行开灯、关闭窗帘、打开电视、煮饭等等一系列简单且重复的操作。

Compose 的出现就解决了这个问题，它通过定义一个模板文件`docker-compose.yml`来管理一组相关联的容器，所有容器的配置、环境等都记录到文件中，通过一个命令就可以控制所有的容器；Compose 就像智能家居的管家，我们只需要将开灯、关闭窗帘、打开电视、煮饭等操作在 App 中进行定义，我们下班回到家里只要对着它发出指令：`回家啦！`，它就会自动帮你把所有的事情做了。

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WEiasYQC58tibSIzQXQ6t6wBHaSdaaN17bAicvMgJVtwFCfe7KjVS3obhA/640?wx_fmt=jpeg)回家啦

安装卸载
----

Docker Compose 支持 Windows、macOS 和 Linux 平台，在 Windows 和 macOS 平台我们直接下载安装包安装后自带 Compose，直接可以使用，我们通过`version`查看安装情况：

```
$ docker-compose --version
docker-compose version 1.29.2, build 5becea4c
```

Linux 的安装也很简单，直接从官网下载编译好的二进制文件并赋予执行权限即可：

```
$ sudo curl -L https://github.com/docker/compose/releases/download/1.27.4/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose# 国内用户可以使用以下方式加快下载$ sudo curl -L https://download.fastgit.org/docker/compose/releases/download/1.27.4/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose$ sudo chmod +x /usr/local/bin/docker-compose
```

nodejs 和 redis 使用
-----------------

常见的项目就是 web 网站，包括 web 应用和数据库（mysql、mongodb 或 redis），我们尝试一个能够简单记录页面访问次数的 web 应用。新建一个 express 项目，编写`app.js`文件：

```
const express = require("express");const { createClient } = require("redis");const app = express();const client = createClient({  url: "redis://redis:6379",});app.get("/", async (req, res) => {  let counter = await client.incr("counter");  res.send(`Hello World! 该页面已被访问 ${counter} 次`);});app.listen(8000, async () => {  await client.connect();});
```

这里我们连接 redis 的时候使用了容器名称，而不是 ip，下面我们会使用容器名称和静态两种连接方式。再编写我们的`Dockerfile`，构建镜像：

```
FROM node:14.19-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --registry https://registry.npm.taobao.org
COPY . .
EXPOSE 8000
CMD npm run start
```

编写`docker-compose.yml`文件，这是 Compose 的模板文件，我们用到 2 个服务：

```
version: '3'services:  web:    build: ./    depends_on:      - redis    ports:      - "8000:8000"    restart: always  redis:    image: "redis:alpine"    restart: always
```

在项目中允许`docker-compose up -d`就在后台启动了 Compose 项目，访问 8000 端口，每次刷新页面，计数就会加 1。

命令说明
----

### ps

ps 命令，列出所有的容器，以及运行状态和所有端口：

```
$ docker-compose ps
   Name               Command                 State           Ports
------------------------------------------------------------------------------
demo_redis_1   docker-entrypoint.sh redis ...   Up      6379/tcp
demo_web_1     docker-entrypoint.sh /bin/ ...   Up      0.0.0.0:8080->8080/tcp
```

如果要查看某个服务的信息，ps 命令带上某个服务的名称：

```
$ docker-compose ps [service name]
```

### logs

logs 命令查看服务容器的输出。

```
$ docker-compose logs

$ docker-compose logs [service name]
```

### start

启动已经存在的服务容器。

```
$ docker-compose start [service name]
```

### stop

停止已经处于运行状态的容器，但不删除它。通过`start`可以再次启动这些容器。

```
$ docker-compose stop [service name]
```

### images

列出 Compose 文件中包含的镜像。

```
$ docker-compose images
```

### scale

弹性设置服务运行的容器个数，通过`service=num`；需要去掉在 yaml 文件指定的端口号，否则会导致端口占用问题

```
$ docker-compose scale web=2 db=3
```

### build

构建（重新构建）项目中的服务容器。

```
$ docker-compose build
```

或者单独构建某个服务的容器。

```
$ docker-compose build [service name]
```

### down

此命令将会停止 up 命令所启动的容器，并移除网络。

```
$ docker-compose down
```

### up

此命令将自动完成包括构建镜像，（重新）创建服务，启动服务，并关联服务相关容器的一系列操作；可以直接通过该命令来启动一个项目。

```
$ docker-compose up
```

默认情况下，启动的容器都在前台运行，使用`-d`参数，将会在后台启动并运行所有的容器，一般在生产环境使用。

```
$ docker-compose up -d
```

Compose 模板文件
------------

Compose 通过配置文件`docker-compose.yml`来管理多个 Docker 容器，模板文件主要分为 3 个部分：

*   service（服务）: 在它下面可以定义应用需要的一些服务，每个服务都有自己的名字、使用的镜像、挂载的数据卷、所属的网络、依赖哪些其他服务等等。
    
*   volumes（数据卷）：定义数据卷，然后挂载到不同的服务使用。
    
*   networks （应用网络）：定义应用名字，使用的网络类型。
    

下面介绍一些主要指令的使用。

### version

yarm 文件一般开头就是 version 字段，version 指定了版本信息，关乎 docker 的兼容性，Compose 文件格式有 3 个版本，分别为 1，2.x 和 3.x。两者的版本要求如下表：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">compose 文件格式版本</th><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">docker 版本</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">3.4</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">17.09.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">3.3</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">17.06.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">3.2</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">17.04.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">3.1</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.13.1+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">3.0</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.13.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">2.3</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">17.06.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">2.2</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.13.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">2.1</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.12.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">2.0</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.10.0+</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.0</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1.9.1.+</td></tr></tbody></table>

### image

从指定的镜像中启动容器，可以是存储仓库、标签以及镜像 ID。

### build

指定`Dockerfile`所在文件夹的路径，可以是绝对路径，也可以是相对 docker-compose.yml 文件的路径

```
version: '3'services:  web:    build: /path/to/build/dir
```

如果 dockerfile 文件名不是默认名，需要指定：

```
version: '3'services:  web:    build:      context: ./      dockerfile: Dockerfile-alternate      args:        var1: 1        var2: c
```

使用 arg 指令指定构建镜像时的变量，这里的`var1`和`var2`将被发送到构建环境。

> ❝
> 
> 注意：任何 environment 与 args 变量同名的 env 变量（使用块指定）将覆盖该变量。
> 
> ❞

### command

覆盖容器启动后默认执行的命令。

```
version: '3'services:  web:    build: ./    command: echo "hello world"
```

### links

将指定容器连接到当前连接，可以设置别名，避免 ip 方式导致的容器重启动态改变的无法连接情况。

```
version: '3'services:  web:    build: ./    links:      - redis:rd  redis:    image: "redis:alpine"
```

我们在 web 容器中使用`rd`就能访问 redis，而不用 ip。

### external_links

链接到`docker-compose.yml`外部的容器，甚至并非 Compose 管理的外部容器。

```
external_links: - redis_1 - project_db_1:mysql - project_db_1:postgresql
```

### depends_on

解决容器的依赖、启动先后的问题。以下例子中会先启动 redis 和 db 再启动 web。

```
version: '3'services:  web:    build: .    depends_on:      - db      - redis  redis:    image: redis  db:    image: postgres
```

> ❝
> 
> 注意：web 服务不会等待 redis db「完全启动」之后才启动。
> 
> ❞

### networks

默认情况下，Compose 会为我们的应用设置一个网络，服务的每个容器都加入默认网络，并且可以被该网络上的其他容器访问。

Compose 创建的网络名称基于我们所在项目的`目录名称`，比如我们项目在 myapp 目录下，那 Compose 会创建一个`myapp_default`网络。

有些场景下，默认的网络配置不能满足我们的需求，我们可以通过`networks`指令配置网络，通过`default`对默认的网络进行配置：

```
version: '3'services:  web:    build: .networks:  default:    driver: bridge
```

我们还可以自定义网络：

```
version: '3'services:  web:    build: .    networks:      - front      - back  redis:    image: "redis:alpine"    networks:      - front  db:    image: postgres    networks:      - backnetworks:  front:    driver: bridge  back:    driver: bridge    driver_opts:      foo: "1"      bar: "2"
```

我们这里定义了 front 和 back 两个网络，web 应用同时在两个网络中均能访问 redis 和 db，而 redis 和 db 实现了隔离。`driver_opts`将选项列表指定为键值对以传递给此网络的驱动程序。

我们有时候不需要创建新的网络，只需要加入已有网络，可以使用`external`选项，指定一个已经存在的网络名称：

```
version: '3'services:  web:    build: .    networks:      - outsidenetworks:  outside:    external:      name: 'my-existing-network'
```

加入网络时，我们可以指定容器的`静态ip地址`，这样我们在进行数据库连接时，可以不用容器服务名称，而直接使用 ip 地址：

```
version: '3'services:  web:    build: .    networks:      mynet:         ipv4_address: 172.19.0.3  redis:    image: "redis:alpine"    networks:      mynet:        ipv4_address: 172.19.0.4networks:  mynet:    ipam:      driver: default      config:        - subnet: 172.19.0.0/16
```

### network_mode

设置网络模式。使用和 docker run 的 --network 参数一样的值。

```
network_mode: "bridge"network_mode: "host"network_mode: "none"network_mode: "service:[service name]"network_mode: "container:[container name/id]"
```

### environment

在容器中设置环境变量，等同于`docker run -e VARIABLE=VALUE ...`

```
version: '3'services:  web:    build: .    environment:      MODE: development      SHOW: 'true'    # 等同于    environment:      - MODE=development      - SHOW='true'
```

### env_file

从文件中获取环境变量，等同于`docker run --env-file ...`。

```
env_file: .envenv_file:  - ./common.env  - ./apps/web.env  - /opt/secrets.env
```

环境变量文件中每一行必须符合格式，支持`#`开头的注释行。

```
# common.env: Set development environmentPROG_ENV=development
```

> ❝
> 
> 如果有变量名称与 environment 指令冲突，以 environment 指令为准。
> 
> ❞

### volumes

volumes 可以设置数据卷所挂载路径，它有两种方式，一种方式是设置宿主机路径（HOST:CONTAINER），通过`[SOURCE:]TARGET[:MODE]`格式，最后的 ro 用于只读，rw 用于读写（默认）：

```
version: '3'services:  web:    build: .    volumes:      - /app/configs # 随机数据卷      - ./configs:/app/configs:ro      - /path/to/logs:/app/logs
```

另一种方式直接设置数据卷的名称，需要在文件中配置数据卷：

```
version: '3'services:  web:    build: ./    volumes:      - config_data:/app/configsvolumes:  config_data:
```

### ports

端口暴露给宿主机，如果仅仅指定容器端口，宿主机将会随机选择端口。

```
ports: - "3000" # 绑定容器的3000端口到主机任意端口 - "8000:8000" - "12222:22"
```

### expose

暴露端口，和 ports 的区别是，expose 不映射到宿主机，只被连接的服务访问。

```
expose: - "3000" - "8000"
```

### dns

自定义 DNS 服务器。可以是一个值，也可以是一个列表。

```
dns: 8.8.8.8dns:  - 8.8.8.8  - 114.114.114.114
```

### restart

指定容器退出后的重启策略为始终重启。该命令对保持服务始终运行十分有效，在生产环境中推荐配置为`always`或者 `unless-stopped`。

```
version: '3'services:  web:    build: ./    restart: always
```

docker 镜像推荐
===========

下面推荐一些笔者常用的镜像。

gitbucket
---------

如果我们自己想要一个私有的 git 开发仓库，或者公司小团队使用，gitbucket 是一个不错的选择；相比于 gitlab 动辄就占用内存 3G，gitbucket 几百 mb 的大小已经是很小巧迷你了，再配上直男般的蓝黑色，让人简直。。。。不过好在一般我们都是敲的 git 命令，所以不用在意他的界面。

```
$ docker run --name git -itd -v $PWD:/var/gitbucket -p 8080:8080 -p 29418:29418 gitbucket/gitbucket
```

`8080`端口是它的界面的地址，`29418`端口是给 git 通过 SSH 去链接仓库的，建议开启。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WQMu0L1wTNshyiaQ2QbTjpKY8hjKq8xdfFfIB3FrShqaqPEbVGgdiaAgg/640?wx_fmt=png)gitbucket

filebrowser
-----------

如果你受够了某网盘几十 KB 的小水管速度，那么`filebrowser`是你搭建一个轻量级的私有云盘不错的选择。另一款网盘工具 nextcloud 也十分的不错，功能丰富且强大，带有 app 功能，不过需要结合数据库使用，配置略微繁琐，喜欢折腾的小伙伴可以自己尝试。

filebrowser 使用了 go 语言编写，可以通过浏览器对服务器上的文件进行管理。可以是修改文件，或者是添加删除文件，甚至可以分享文件，是一个很棒的文件管理器，使用非常简单方便，功能很强大。

使用 docker 安装也很方便，我们可以只映射 / srv 目录下的文件：

```
$ docker run -d --restart=always -v $PWD:/srv -p 8080:80 filebrowser/filebrowser
```

再通过 nginx 转发 8080 端口，这样我们就能在外网访问了；nginx 配置文件中还需要修改上传文件的大小限制，这里我们改到 2GB，大部分的文件都能上传了：

```
http{
    client_max_body_size 2000M;
    client_body_timeout  20m;
}
```

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WlH2icRkcbO2TOWEz6EL09MicoRLOKD6CNWZnicz9icibKdUzNMOMTHUSRgA/640?wx_fmt=gif)filebrowser

scrapyd
-------

我们身边有很多的爬虫应用案例，比如百度、Google、必应等搜索引擎都有自己的爬虫，会定时来抓取你的网站；再比如过年回家需要抢火车票，我们经常能够看到很多的抢票软件等，也都是爬虫的应用；不过我们在网络上肆意使用爬虫的时候也要注意相关法律法规，毕竟俗话说得好：

> ❝
> 
> 爬虫写得好，牢饭吃得饱
> 
> ❞

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WVibQN2nJJoK0g1jhE5rzLDWlz5qxaBbh8HibKRwlm8Em5w8TczTzAUEA/640?wx_fmt=jpeg)不是说问题不大么

Scrapy 是由 Python 语言开发的一个快速、高层次的屏幕抓取和 web 抓取框架，用于抓取 web 站点并从页面中提取结构化的数据，只需要实现少量的代码，就能够快速的抓取。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3W9ZyumAxwPExnQeTjekJoDXKe97iaW1B6a1awiavCcFehAQ6iaia3UN5JXg/640?wx_fmt=png)Scrapy 爬虫流程

Scrapy 爬虫部署需要使用 scrapyd 和 scrapydweb，scrapyd 是由 scrapy 开发者开发的、通过简单的 JSON API 来管理多个项目的应用；通过 docker 我们可以很轻松的启动一个 scrapyd 服务器：

```
$ docker run -d -p 6800:6800 germey/scrapyd
```

它的界面比较简单，我们需要通过繁琐的 API 接口来上传项目、启动或者停止项目：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WCp6wTOziaEmQFicMNrhz0BmiaXQjpkzSV4EOnnC1NulDBZ34j3ObFicpVQ/640?wx_fmt=png)Scrapyd 界面

因此 Scrapy 开发还提供了一个可视化管理爬虫的 web 应用，同时支持 Scrapy 日志分析和可视化。

```
$ docker run --name scrapydweb -e USERNAME admin \
    -e PASSWORD admin \
    -e SCRAPYD_SERVERS 127.0.0.1:6800 \
    -v /etc/timezone:/etc/timezone \
    -d scrapydweb:latest
```

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3Wb0b7Yq9w30o2cnicsMparqFNWiciaka0Y5uicIZNpuicOloicsfLnyibibVhdg/640?wx_fmt=png)Scrapydweb 可视化界面

我们在 web 界面上就可以清楚的看到每个服务器运行爬虫的状态和数量，以及定时启动爬虫。

Scrapy 是一个非常好用的爬虫框架，如果本文的阅读量突破一千或点赞超过二位数，后面笔者可以聊一下爬虫的使用。

chevereto
---------

Chevereto 是目前最好的图床之一了。功能也非常强大。其免费版和收费版的区别，在于收费版多了硬盘扩展，社交分享功能和技术支持，免费版的功能也够用了；Chevereto 依赖的环境如下：

*   PHP 5.5+
    
*   MySQL 5.0+
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3W5NsHtWYGYTlhHwzeLRLquwMsB2KalicYBdIugTFicKeeh3bHp96kleLA/640?wx_fmt=jpeg)Chevereto 界面

使用 docker 安装的话 PHP 的环境我们就可以省去安装步骤了，需要安装一个 MySQL 的环境，然后通过 run 命令设置 MYSQL 的环境变量：

```
$ docker run -it -d --name chevereto --restart=always -p 8080:80 \    -v $PWD:/var/www/html/images \    -e "CHEVERETO_DB_HOST=127.0.0.1" \    -e "CHEVERETO_DB_PORT=3306" \    -e "CHEVERETO_DB_USER \    -e "CHEVERETO_DB_PASSWORD=admin" \    -e "CHEVERETO_DB_ \    -e "CHEVERETO_DB_PREFIX=chv_"  nmtan/chevereto
```

Chevereto 运行起来后我们初始化设置管理员账号密码，然后在设置中修改界面为中文：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WrWibfQPEEjckKz8jDBKicHZ6lHczkSA1G1ibbPxZdiaJYXQA7Wz0zOyRtw/640?wx_fmt=png)Chevereto 修改中文

PHP 默认限制上传大小为 2MB，我们需要修改容器中的文件解除此限制；首先使用`cp命令`把容器中的`.htaccess`文件拷贝出来：

```
$ docker cp XXXX:/var/www/html/.htaccess ./
```

然后编辑文件. htaccess，设置最大上传大小为大一点的数值，比如这里设为 128MB，数值可以根据自己需要调整：

```
php_value post_max_size 128M
php_value upload_max_filesize 128M
```

我们把文件拷贝回容器的原处即可：

```
$ docker cp ./.htaccess XXXX:/var/www/html/
```

最后一步我们在设置中修改上传限制，进入 Chevereto，单击用户名弹出下拉菜单，选择【仪表盘】，然后点【设置】，弹出页面中选择【图片上传】，找到【最大上传文件大小】选项，修改不超过 128 的数值即可：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WhKUamlqlk0P3yqFsL8q43dyic1DyFODLjA3fOwWU70a7VUOtf44G0bQ/640?wx_fmt=png)修改上传大小

> ❝
> 
> 如果没有修改. htaccess 文件，最后一个步骤的设置调整是不能超过 2MB 的。
> 
> ❞

这样我们的图床就搭建以及配置完毕了，其他个性化需要可以在设置中自行配置；我们去首页就能随意上传和查看图片了；通过 nginx 代理转发我们还可以暴露到外网，将你的美照分享给好友（前提是有公网 IP 或云服务器）。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WOxvbq1TkgRB6b6zMjtNsnYNG6ZRtbJOxzGzPlrPm4CZOpzjz5LqalQ/640?wx_fmt=png)Chevereto 首页

portainer
---------

Portainer 是一个可视化的 Docker 操作界面，提供状态显示面板、应用模板快速部署、容器镜像网络数据卷的基本操作（包括上传下载镜像，创建容器等操作）、事件日志显示、容器控制台操作、Swarm 集群和服务等集中管理和操作、登录用户管理和控制等功能。功能十分全面，基本能满足中小型单位对容器管理的全部需求。

通过一个 run 命令我们就可以启动 portainer，`/var/run/docker.sock`是绑定宿主机的 docker 文件，在容器内部直接与 docker 守护进程通信进行接口调用：

```
$ docker run --name portainer -d -p 9000:9000 --restart=always \        -v $PWD:/data        -v /var/run/docker.sock:/var/run/docker.sock \        portainer/portainer-ce
```

容器启动后，设置管理员账号密码，进入 Portainer 后台管理界面，点击 Local 环境就能够使用了：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WRNLibBh5nmWUiaNr9JnHd1VFtbF1iaib7Oia0Ac1qCUZrMdd9gibMFY96LTA/640?wx_fmt=png)Portainer

容器和镜像的管理也很方便，在管理界面直接增删镜像或容器即可；创建容器也直接可视化了，我们打开【Container】=>【Add container】，然后设置容器运行所需要的参数，我们这里以 mysql 为例：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WXGCwXe5dEo90usoG7oP9QaicicWp0nps6Na3JnF6d5oupIfV7X0dvsRw/640?wx_fmt=png)Portainer 创建容器

`Restart policy`建议选择 Always，相当于设置`--restart=always`，保证了容器在服务器重启后总会自动重新启动。

webssh
------

Webssh 是指通过浏览器以网页的形式通过 SSH 协议远程访问任何开启了 SSH 服务的设备；webssh 工作的原理也很简单，大致如下：

```
+---------+     http     +--------+    ssh    +-----------+
| browser | <==========> | webssh | <=======> | ssh server|
+---------+   websocket  +--------+    ssh    +-----------+
```

在后台启动一个 webssh 的后端服务器（python 程序或其他语言开发的），前端浏览器通过 websocket 和服务器进行通信，将一些命令发送到 webssh 服务器，webssh 服务器再将接收命令发送给需要通信且开启了 ssh 功能的服务器。

使用 Webssh 的好处是：在存在堡垒机（即跳板机）的环境下，如果堡垒机本身有开启 web 服务的话，那可以在堡垒机上部署 webssh，这时不用通过 SSH 或者 RDP 访问堡垒机，直接打开浏览器就能以 web 形式通过堡垒机来 SSH 远程访问网络设备，这在一些内网防火墙不允许 SSH，但是允许 HTTP 和 HTTPS 的环境中很实用。而且免去了安装 putty、secureCRT 等 SSH client 软件的必要。

通过 docker 运行 webssh 服务器也很简单：

```
$ docker run -itd --name webssh --restart=always -p 8888:8888 webssh
```

然后通过浏览器访问 webssh 服务器 IP+8888 端口号就可以进入它的界面了，它的界面也很简洁，甚至有着一丝丝的简陋，不过部署到堡垒机能用就行，还要啥自行车啊。通过填写堡垒机的 hostname、端口等参数就能连接堡垒机 ssh 了：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3Wexx0wMTP6HvI5NcUAFk1XdzVYnnghhIFbia2guiaOfGbfFWR4MPteQ6w/640?wx_fmt=png)webssh 界面

wizserver
---------

为知笔记是一款老牌笔记应用了，支持 markdown、网页笔记、网页剪藏和分享等多功能，最近推出了 docker 私有化部署的功能，同时支持 5 个用户，适合小团队使用。

我们新建一个 wiznote 目录，用于保存笔记的内容，然后 run 启动服务：

```
$ docker run --name wiz \    --restart=always -itd \    -v $PWD/wiznote:/wiz/storage \    -p 8080:80 \    -p 9269:9269/udp \    wiznote/wizserver
```

稍等几分钟就能看到服务启动了，在本地打开 localhost:8080 打开主界面，默认管理员账号：admin@wiz.cn 和密码 123456。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3W669sjOIXTUzl2iba92muzP5BJ5cxUdibiajeSWIXMbDvuVicibbDdOg1TMA/640?wx_fmt=png)为知笔记

为知笔记支持多平台客户端和移动端客户端，我们在客户端界面点击【切换服务器】，选择【企业私有服务器】，输入服务器的 ip 地址及端口号就能登录私有服务器：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WDV6icgDIve0TDgspLSt2GVw6HglXdRdGFEYZ9iaEWnk5iaLbl8dx0FMyw/640?wx_fmt=png)私有服务器

jellyfin
--------

Jellyfin 是一个自由的软件媒体系统，用于管理媒体和提供媒体服务，展示你自己的电影、电视剧、音乐等多媒体数据，并提供多平台访问播放服务。通过 docker，我们可以很方便的启动它的服务；在本地创建 media 和 config 文件夹，media 文件夹是媒体文件夹，我们可以根据需求继续创建 media/movie、media/music 等文件夹存放不同媒体资源：

```
docker run -d --name jellyfin \  -p 8096:8096 \  -v $PWD/media:/media \  -v $PWD/config:/config \  --restart=always \  jellyfin/jellyfin
```

绑定不同端口说明如下：

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">端口</th><th data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-weight: bold; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">说明</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">8096</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">WebUI 访问端口</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">7359/udp</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">（可选）允许本地网络的客户端发现 Jellyfin</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">1900/udp</td><td data-style="border-width: 1px; border-style: solid; border-color: rgb(204, 204, 204); padding: 5px 10px; text-align: left; font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">（可选）DLNA 服务</td></tr></tbody></table>

容器创建后，我们打开 localhost:8096 就能打开安装向导页面，它的界面还是：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WamYsORia1iaFKQDvyKElxMD9JDBDxfq7dxHOaF7EBQYhDLvxtoFoTCrg/640?wx_fmt=png)jellyfin 安装

选择一系列的语言、国家（国家选择`People's Republic of China`）以及配置账号密码后我们就进入它的首页了；我们选择【添加媒体库】，选择你 media 文件夹下的子文件夹，就能看到其下面的媒体文件了：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3W840oFeEyXyUbSUJftnZydCF0eleMZQLO4Mf8UzjkBkrw6FBtRlqjGw/640?wx_fmt=png)添加媒体库

aria2
-----

Aria2 是一款开源下载工具，可帮助简化不同设备和服务器之间的下载过程。它支持磁力链接、BT 种子、http 等类型的文件下载，与迅雷及 QQ 旋风相比，Aria2 有着优秀的性能及较低的资源占用，架构本身非常轻巧，通常只需要 4 兆字节（HTTP 下载）到 9 兆字节（用于 BitTorrent 交互）之间。

另外，aria2 由于它的开源特性，因此也用在很多离线下载的场景，比如很多路由器都支持 aria2 离线下载功能，我们在路由器的插件市场中安装 aria2 后，在路由器挂载 u 盘，上班的时候想要下载的电影、视频等链接丢给它，回到家就可以直接观看了；顺带提一下，chrome 浏览器配合油猴插件直接愉快的离线下载百度网盘的文件。

我们通过 docker 来安装 aria2 十分方便，新建一个`aria2-downloads`文件夹映射下载的目录，`aria2-config`文件夹映射配置的目录。这里的`p3terx/aria2-pro`镜像就是我们 aria2 下载的主程序，它是一个命令行的程序，因此搭配`p3terx/ariang`镜像作为它的可视化管理界面。用到了多个镜像，我们就可以通过 docker compose 来进行构建：

```
version: "3"services:  aria2-pro:    container_name: aria2-pro    image: p3terx/aria2-pro    environment:      # uid，这里默认是nobody      - PUID=65534      # gid，这里默认是nobody      - PGID=65534      # 权限掩码      - UMASK_SET=022      # rpc密钥token      - RPC_SECRET=123456      # rpc端口      - RPC_PORT=6800      # BT监听端口      - LISTEN_PORT=6888      # 缓存      - DISK_CACHE=64M      - IPV6_MODE=false      # 自动更新tracker      - UPDATE_TRACKERS=true      - CUSTOM_TRACKER_URL=      - TZ=Asia/Shanghai    network_mode: bridge    volumes:      # 映射配置目录，默认为当前目录的aria2-confg      - ${PWD}/aria2-config:/config      # 映射下载目录，默认为当前目录的aria2-downloads      - ${PWD}/aria2-downloads:/downloads    ports:      - 6800:6800      - 6888:6888      - 6888:6888/udp    restart: unless-stopped    logging:      driver: json-file      options:        max-size: 1m  ariang:    container_name: ariang    image: p3terx/ariang    network_mode: bridge    ports:      # 端口映射，默认6880，后面通过此端口访问页面      - 6880:6880    restart: unless-stopped    logging:      driver: json-file      options:        max-size: 1m
```

项目启动后，我们打开 AriaNg 的管理界面，在设置中配置 yarml 文件中的 RPC 端口（默认 6800）和 RPC 密钥。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3W2kDI8qsobvquHBgCPPY7PoXwtt7XzibiascPP97WhW015ejc4zwsbO2A/640?wx_fmt=png)aria2 配置

配置完成后，点击【新建】，输入你的下载链接就可以愉快地等待了。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beRA7MRq1jyjv2qpj6ic4A3WGLtMDbn1iarf4vMH287HI7eMNDJst3cJ81s3QKgssaEV2tYKQ6fdQNw/640?wx_fmt=png)aria2 下载

下载速度和你的实际带宽以及资源情况等都有关系，上图仅做展示。

聊了这么多有趣的 Docker 镜像，你学会如何使用 Docker Compose 来搭建服务了吗？关注前端壹读，更新会更快哦。

![](https://mmbiz.qpic.cn/mmbiz_jpg/VsDWOHv25bdaxicBlRMxNtxMjHib4IZTQygclqnysV77ic7jRicekWrccxabFZTve9atAJ5ERQHk8lVqpg51wOuKfw/640?wx_fmt=jpeg)

  

此处按一下又不会怀孕  
还能经常普及一些好玩的前端知识

  

看都看完了，还不点这里试试

![](https://mmbiz.qpic.cn/mmbiz_gif/VsDWOHv25bdaxicBlRMxNtxMjHib4IZTQyia4V8icC7UdVtdFTbssJvcHKwvkl5VHehicxibLeEzaBGAiarkpsN2t48ZA/640?wx_fmt=gif)