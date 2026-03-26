> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AJkXLf5rogdRmJMg8NjTOg)

```
点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

 一、容器部署的发展
----------------------------------------------------------

今天我们来说说容器部署。我们知道容器部署的发展大致分三个阶段，下面来介绍一下不同阶段的部署方式的优缺点

### 物理机部署

*   优点是可以提供更高的性能、资源控制，也可以提供更好的数据隔离和安全性，因为不同的应用程序运行在独立的物理服务器上，拥有彼此之间的资源和数据都相互隔离等优点。
    
*   缺点是采用物理机部署这种方式通常不能充分的利用好硬件资源，如果应用程序的负载较轻，会浪费一定的资源。但是如果我们要将多个应用进程、数据库和缓存进程等都部署在同一台机器上，这样虽然达到了高效利用物理机的资源的目的，但是也会发生一个很重要的问题就是进程之间发生资源抢占的问题，最终导致其他进程无法提供正常服务。并且应用程序与硬件设备是绑定的，所以我们扩展起来就不太容易。
    

### 虚拟机部署

*   优点就是通过虚拟化技术将物理机分割成多台虚拟机，每个虚拟机在物理机上预先分配了一定的计算机资源（比如：CPU、内存、磁盘空间等），多个虚拟机可以在同一台物理服务器上运行，共享硬件资源，提高了资源利用率。虚拟机部署也可以快速创建、复制和迁移虚拟机实例，为我们的扩展提供了便捷等等。
    
*   缺点就是如果在大规模集群部署的情况下，虚拟机技术可能导致软件的版本和配置文件有碎片化问题。不同虚拟机中的软件版本和配置文件可能不同，这或许会使问题排查变得困难。
    

### 容器化部署

为了解决以上部署方式的痛点，容器技术就应运而生了，而 Docker 就是一种常见的容器化平台。

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwMgQcyB6Srtdfb0NXpoxDpyhdrgfuqzz3ia5D63aYr2ibGjwQtnkALr7g/640?wx_fmt=png&from=appmsg)docker 与虚拟机对比图

二、Docker
--------

### 1. Docker 简介

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwX3o0YCjSVvkic1h8hnoaRs8UQWIbp62bSDWibaRSvedJbbjdRevbAPEg/640?wx_fmt=png&from=appmsg)

1. 什么是 Docker

Docker 是一个开源的应用容器引擎，可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上。

2.Docker 部署的优势

通过使用 Docker 等容器技术，可以将应用程序及其依赖项打包成`轻量级`的容器，这个容器中包含了应用程序所需的所有运行环境和配置。这样一来，无论在测试还是生产环境中，都可以保证应用程序运行的`一致性`，并且`易于部署`、`扩展和管理`。容器化技术使得应用程序在不同环境之间的迁移更加简单，并且可以`高效地利用资源`。

### 2. Docker 核心组件

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwr2ksThLSlux37SX3NqHXePAR6vsxqTgpOY9cdxJ1vpiawMPGudib72Eg/640?wx_fmt=png&from=appmsg)docker 基础架构图

从上图中我们可以看出，Docker 在运行时分为 Docker 引擎和客户端工具。我们使用 docker 命令时，就是在使用客户端工具与 Docker 引擎进行交互。客户端工具 我们可以从官网下载安装，我们主要来说上图中的  `Images(镜像)`、`Containers(容器)`、 `Registry(仓库)` 这三个核心组件。

#### 镜像

1.  可以把镜像文件理解成一个进程运行所需软件的集装箱，在部署时我们每台机器都会拉取相同版本的镜像文件，进行安装生成对应的容器。所有机器使用的镜像文件全部相同，容器的软件版本也一致。即使我们修改了容器的软件版本，但要是销毁容器，软件的改动也会消失。如果需要再次部署，我们只需要使用现有的镜像文件即可，生成的容器也与之前保持一致。即使需要升级软件版本，只需要修改镜像文件，这样集群内的所有机器都会重新拉取更新后的镜像，实现软件的统一升级，解决了软件版本混乱的问题。
    
2.  镜像相关常用命令
    

```
docker search 镜像名称 # 从网络上查找需要的镜像
docker pull 镜像名称 # 从Docker的仓库下载镜像到本地，镜像名称格式为名称:版本号。例如：docker pull ubuntu:latest
docker images # 查看本地镜像 ， -a: 查看本地所有镜像， -q: 查看本地镜像的id
docker rmi [-f] 镜像id[镜像名称] # 删除镜像 -f表示强制删除
docker rmi -f $(docker images -qa) # 删除所有镜像， 一次性删除，且删除后无法恢复
docker build -t your-image-name . # 根据Dockerfile创建一个镜像
docker tag your-image-name your-registry/your-repository:tag  # 给镜像添加一个标签
...


```

#### 容器

1.  容器是基于 Docker 镜像创建的可运行实例。容器具有`轻量级`、`独立性`、`可移植`、`灵活性`的重要特性。每个容器都是一个独立的运行环境并且是相互隔离的，且都拥有自己的文件系统、网络空间和进程空间，避免出现应用程序间的干扰，容器是镜像运行时的实体，容器可以被创建、启动、停止、删除、暂停等。
    
2.  容器相关常用命令
    

```
docker ps # 查看正在执行的容器
docker ps # 查看所有正在运行的容器， -a: 包括运行中和已停止的 
docker run 参数
#参数说明：
#-i：保持容器运行。通过和-t同时使用。加入-it这两个参数以后，容器创建后会自动进入容器中，退出容器后，容器会自动关闭。
#-t：为容器重新分配一个伪输入终端，通常和-i同时使用。
#-d：以守护（后台）模式运行容器。创建一个容器在后台运行，需要使用docker exec 进入容器。
#-it：创建的容器一般称为交互式容器。
#-id：创建的容器一般称为守护式容器、
#--name：威创建的容器命名。
#-p：映射端口 外部端口:容器内部暴露的端口
docker exec -it 容器id[容器名称] /bin/bash # 进入容器
docker rm 容器id[容器名称] # 删除容器
docker kill 容器id[容器名称] # 强制停止容器
...


```

#### 仓库

1.  Docker 仓库主要是用来存储和共享 Docker 镜像的地方。我们可以从仓库中获取镜像，并将本地构建的镜像推送到仓库中进行存储。
    
2.  仓库相关常用命令
    

```
docker login you-registry.com # 登录docker仓库
docker logout you-registry.com # 从Docker仓库注销


```

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwx0zw6eLNNqYgSUzqaQHuvxOxQyQap7l610OSKpBc6b2GviabmERk9hw/640?wx_fmt=png&from=appmsg)

### 3. Docker 部署案例

在执行以下命令前，请确保已经安装 Docker 环境了

下边三个案例分别采用：替换 dist、采用 Dockerfile 方式、采用 Dockerfile+docker-compose 的方式进行部署并运行项目，您可以自行选择自己想要部署的项目进行操作。

1. 部署 nginx

*   控制台输入如下命令，docker run 通过 nginx:alpine 镜像创建一个新的容器并运行，容器名称为 nginx_demo，容器设置成自动重启，映射容器 80、443 端口到主机 80、443，绑定 nginx 相关配置等卷挂载路径。
    

```
docker run -d \
--name nginx_demo --restart always \
-p 80:80 \
-e "TZ=Asia/Shanghai" \
-v /Users/xxx/nginx/home/nginx/nginx.conf:/etc/nginx/nginx.conf \
-v /Users/xxx/nginx/home/nginx/logs:/var/log/nginx \
-v /Users/xxx/nginx/home/nginx/html:/usr/share/nginx/html \
nginx:alpine


```

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwCeFlczchdCiaRncVNagibo9EJntuTjUzjV0iauDIWn4GfbTw6lph85yibg/640?wx_fmt=png&from=appmsg)nginx 目录![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwrpMSRzs0dkaEUSylAWqUrQkbt33zKgBV1MP4lSwcyMrC3GJlB5ZbaA/640?wx_fmt=png&from=appmsg)

`7fdd2f5f7e0874e619914632f819b0dfa5aa594fe3d2056bbd22b99da3e3d1be` 就是我们的容器 Id

*   容器运行后修改 nginx.conf 配置文件，配置文件如下：
    

```
user nginx;
worker_processes 1;

error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections  1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';
  sendfile on;

  keepalive_timeout 65;
  
  server
    {
      listen 80;
      server_name host.docker.internal;
      index index.html;

      root  /usr/share/nginx/html/dist;  #dist上传的路径
      # 避免访问出现 404 错误
      location / {
        try_files $uri $uri/ @router;
        index  index.html;
      }

      location @router {
        rewrite ^.*$ /index.html last;
      }
    }
}


```

*   构建打包 -> 部署
    

在前端项目中，安装依赖，执行打包命令生成 dist 文件夹，将打包好的 dist 文件夹拷贝到 nginx 目录下

```
npm install
npm run build
cp -r dist/* /Users/xxxx/home/nginx/html


```

*   运行结果
    

执行完以上操作，我们可以直接访问本地 http://127.0.0.1:80 来查看结果

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwxic0v8AqkB1ibicl3RVy7RD7WjFiat4ebbuNFbQLSntExBSSSa8wtpZyeg/640?wx_fmt=png&from=appmsg)运行结果

2.  采用 Dockerfile 方式部署前端项目
    

*   项目中新增 Docker 文件夹
    

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwC4nFWjpvBnRXYEGoMpMXBsV9bpdxCfMod8VsMZXiakib2kFW1lD6zqxg/640?wx_fmt=png&from=appmsg)项目目录

*   Dockerfile 文件
    

Dockerfile 分为四部分：基础镜像信息、维护者信息、镜像操作指令和容器启动时执行指令。

```
# 拉取nginx基础镜像
FROM nginx:1.21.1

# 维护者信息
MAINTAINER xxxx

# 将dist文件中的内容复制到 `/usr/share/nginx/html/dist` 这个目录下面
COPY dist  /usr/share/nginx/html/dist
# 用本地配置文件来替换nginx镜像里的默认配置
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# 对外暴露的端口号
EXPOSE 80

# 启动nginx容器
CMD ["nginx", "-g", "daemon off;"]


```

*   修改 nginx.conf 文件与上方 `案例1` 中的 nginx.conf 配置文件保持一致即可
    
*   构建打包 - 部署
    

在前端项目中，安装依赖，打包生成 dist 文件夹，将 dist 文件夹复制到 Docker 文件夹中，进行 docker build 命令打包 docker 镜像，最后运行起来。

```
npm install
npm run build
cp -r dist Docker/
cd Docker
docker build -f Dockerfile -t [镜像名称] . --no-cache
docker run -d -p 80:80 --restart=always --name [容器名称] [镜像名称]


```

`d839a08958cdbf47747870f737da4e6e3b76668913781cd517a0f03d799973b6` 就是我们的容器 Id

![](https://mmbiz.qpic.cn/mmbiz_jpg/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwA40OZeG8qtBlic2f2860FocC3AV2gCk1V9gXkJampwqWTbiaUpvs9K5w/640?wx_fmt=jpeg&from=appmsg)

*   运行结果
    

执行完以上操作，我们可以直接访问本地 http://127.0.0.1:80 来查看结果

![](https://mmbiz.qpic.cn/mmbiz_png/T81bAV0NNNicH6d2PoVXicciaxCqYyW5ibnwxic0v8AqkB1ibicl3RVy7RD7WjFiat4ebbuNFbQLSntExBSSSa8wtpZyeg/640?wx_fmt=png&from=appmsg)运行结果

3.  采用 DockerFile+DockerCompose 方式部署项目
    

Compose 定位是 “defining and running complex applications with Docker”，前身是 Fig，兼容 Fig 的模板文件。Dockerfile 可以让用户管理一个单独的应用容器；而 Compose 则允许用户在一个模板（YAML 格式）中定义一组相关联的应用容器（被称为一个 project，即项目）。

*   修改构建脚本
    

将这条命令

```
docker run -d -p 80:80 --restart=always --name my_proect_container my_project:dev


```

替换成:

```
docker-compose up -d


```

*   项目中新增 docker-compose.yml 文件
    

```
services:
    my_project:
        ports:
            - 80:80
        restart: always
        container_name: my_proect_container
        image: my_project:dev


```

*   运行结果：
    

执行完以上操作，我们同样可以直接访问本地 http://127.0.0.1:80 来查看结果

三、结束
----

使用 Docker 部署应用带来了很多好处。开发人员可以在测试环境中构建 Docker 容器，测试通过后就可以将 Docker 容器轻松地部署到沙箱环境、生产环境中，而无需担心测试、沙箱环境和生产环境之间的配置差异问题。在这种情况下，应用程序在任何运行环境中都能保持一致，无需重新部署整个环境，减少了出错的可能性。同样 Docker 这种一致性和可移植性，也使得开发团队能够更加专注于应用本身的开发和优化，不需要花费大量时间来处理环境配置和兼容性问题。此外，Docker 的轻量级特性意味着它可以更高效地利用系统资源，提供快速的启动时间和部署过程，从而加速开发周期并实现持续集成和持续部署等等。

总之，使用 Docker 部署应用可以简化开发流程、提高部署效率，并确保应用在不同环境中的一致性，为开发团队带来了极大的便利和效益。

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```