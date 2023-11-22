> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/U_DOprD0CcVvtgghHBWIFA)

Docker 概念
---------

`Docker`是一个开源的应用容器引擎，它是基于`Go`语言并遵从`Apache2.0`协议开源。`Docker`可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的`linux`机器上，也可以实现虚拟化。通过容器可以实现方便快速并且与平台解耦的自动化部署方式，无论你部署时的环境如何，容器中的应用程序都会运行在同一种环境下。并且它是完全使用沙箱机制，相互之间是隔离的，更重要的是容器性能开销极低。

Docker 作为轻量级虚拟化技术，拥有持续集成、版本控制、可移植性、隔离性和安全性等优势。

`Docker`从`17.03`版本之后分为**「CE（Community Edition：社区版）」**和**「EE（Enterprise Edition：企业版）」**

**「docker 是一种容器技术，它主要是用来解决软件跨环境迁移的问题」**

安装 Docker
---------

`Docker`可以运行在`Mac`, `Windows`, `linux`等操作系统上

以`Mac`为例

### 使用 Homebrew 安装

```
brew install --cask docker<br style="visibility: visible;">
```

### 桌面版安装

除了使用终端外，它还可以使用桌面版，操作更方便

如果需要手动下载，请点击以下 链接 下载 Docker Desktop for Mac。

检测是否安装成功

```
docker -v
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdN0Fm6OPMBdFO4540FKHNJny8PcLNn1Lfdvd5kXGPJ8wZ1Vfeg5dnSw/640?wx_fmt=png)

### 尝试运行一个`Nginx服务器`

```
docker run -d -p 80:80 --name webserver nginx
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1Mvdj8L0T1CTgib93TksxtsUGqjM14EB3osgnYZibuA0yp9hKw6llVZygEPg/640?wx_fmt=png)

当本地没找到 nginx 镜像时，它会去远程仓库中拉取，服务运行后，就可以通过`localhost`来访问了

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdGQpendlXf7dHANVUZlJ5Rp7AsKknv65HlOwYt0KJINJGl1EeYB41zg/640?wx_fmt=png)

### 镜像加速

如果在使用过程中发现拉取镜像十分缓慢，那是因为`docker`服务器是在国外的，但我们可以通过配置`docker`国内镜像来进行加速

<table><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">镜像加速器</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">镜像加速器地址</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">Docker 中国官方镜像</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://registry.docker-cn.com</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">DaoCloud 镜像站</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">http://f1361db2.m.daocloud.io</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">Azure 中国镜像</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://dockerhub.azk8s.cn</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">科大镜像站</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://docker.mirrors.ustc.edu.cn</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">阿里云</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://ud6340vz.mirror.aliyuncs.com</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">七牛云</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://reg-mirror.qiniu.com</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">网易云</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://hub-mirror.c.163.com</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">腾讯云</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px; color: rgb(89, 89, 89); min-width: 85px;">https://mirror.ccs.tencentyun.com</td></tr></tbody></table>

在任务栏点击 `Docker Desktop` 应用图标 -> `Settings...`，在左侧导航菜单选择 `Docker Engine`，在右侧像下边一样编辑 json 文件。

```
{  "registry-mirrors": [    "https://registry.docker-cn.com",    "https://hub-mirror.c.163.com"  ]}
```

修改完成之后，点击 `Apply & restart` 按钮，Docker 就会重启并应用配置的镜像地址了。

配置完可以执行`docker info`检查加速器是否生效

```
docker info
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdHDaHVaJHZNtIF3icyt0myvnXdfQCrmzVg85VqYeNr1IzockfDIuwaWQ/640?wx_fmt=png)

Docker 三要素
----------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdOAaKB9CDenk9cBmrpKIRBrGibqqRwYbiaYvC026LIib7qmHapZL1Wtwibg/640?wx_fmt=png)

### 镜像 (image)

**「Docker 镜像」** 是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外，还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）。镜像 **「不包含」** 任何动态数据，其内容在构建之后也不会被改变。

### 容器 (container)

镜像（`Image`）和容器（`Container`）的关系，就像是面向对象程序设计中的 `类` 和 `实例` 一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。

简单理解就是**「容器是镜像的一个运行实例。当我们运行一个镜像，就创建了一个容器。」**

### 仓库 (repository)

镜像构建完成后，可以很容易的在当前宿主机上运行，但是，如果需要在其它服务器上使用这个镜像，我们就需要一个集中的存储、分发镜像的服务，`Docker Registry` 就是这样的服务。

使用镜像
----

### 拉取镜像

在 Docker Hub 上有大量的高质量的镜像可以用，我们可以使用`docker pull`从镜像仓库中拉取对应的镜像。

格式为：

```
docker pull [选项] [docker Registry 地址[:端口号]/]仓库名[:标签]
```

具体的选项可以通过 `docker pull --help` 命令看到，这里我们说一下镜像名称的格式。

*   Docker 镜像仓库地址：地址的格式一般是 `<域名/IP>[:端口号]`。默认地址是 Docker Hub(`docker.io`)。
    
*   仓库名：这里的仓库名是两段式名称，即 `<用户名>/<软件名>`。对于 Docker Hub，如果不给出用户名，则默认为 `library`，也就是官方镜像。
    

比如拉取一个 node 镜像：

```
docker pull node:18-alpine
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdvrwH68zawpqVTCd1vVZscGibzhSkGOWtEAriaG65ibygCveZdx6VL9Zww/640?wx_fmt=png)

这里我们拉取镜像的时候只是给出了镜像名称（仓库名 + 标签）也就是`node:18-alpine`，并没有给出`Docker`镜像的仓库地址，所以它会从默认地址`docker.io`拉取镜像

从上图我们可以看到`docker pull` 命令的输出结果给出了镜像的完整名称，即：`docker.io/library/node:18-alpine`。

### 查看镜像

如果想要查看本地已经下载的镜像，可以使用`docker image ls`命令

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdyibfHnBQia6wG3gdicdtReHWDGKv5iaTNroLb1gjM6iaVSvW7jp6XgIbaMQ/640?wx_fmt=png)

列表包含了 `仓库名`、`标签`、`镜像 ID`、`创建时间` 以及 `所占用的空间`。

当然也可以在`docker`桌面端中直接查看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdxShAOxSDvuVyGbWslWPrwJWaCdorUxDsVofNtCCA0ZrP9pXwkobU8g/640?wx_fmt=png)

### 删除镜像

如果想要删除本地镜像，可以使用`docker image rm`命令

格式为：

```
docker image rm [选项] <镜像1> [<镜像2>...]
```

其中，`<镜像>` 可以是 `镜像短 ID`、`镜像长 ID`、`镜像名` 或者 `镜像摘要`。

比如删除我们刚拉取的 node 镜像

```
docker image rm node:18-alpine   
```

如果想批量删除镜像可以使用`docker image ls -q`来配合使用`docker image rm`

比如，我们需要删除所有仓库名为 `redis` 的镜像：

```
docker image rm $(docker image ls -q redis)
```

或者删除所有在 `mongo:3.2` 之前的镜像：

```
docker image rm $(docker image ls -q -f before=mongo:3.2)
```

更多指令可通过`docker image --help`查看

操作容器
----

### 查看容器

查看正在运行的容器:

```
docker ps
```

查看所有容器

```
docker ps -a
```

### 启动容器

启动容器一般有两种情况：

*   基于镜像新建一个容器并启动
    
*   将已有的终止状态（exited）的容器重新启动
    

#### 新建并启动

使用的命令是`docker run`

```
docker run -it node
```

参数说明：

*   `-i`：交互式操作
    
*   `-t`：终端
    
*   `node`：node 镜像
    

#### 启动终止状态的容器

首先查看所有的容器

```
docker ps -a
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1Mvdw5ZfpRQzLJ7aXXWONRpfRzEPr0IUZ5uL7v58TLmDUOyLYIdz5crDgQ/640?wx_fmt=png)

然后可以使用`docker start`启动一个停止的容器

```
docker start 7e7ff4af478f
```

#### 重启容器

```
docker restart a03b0445b82d
```

### 后台运行

大部分情况下，我们都希望`docker`是在后台运行的，这里可以通过`-d`指定容器的运行模式

```
docker run -d node:latest
```

### 停止容器

停止容器命令如下

```
docker stop <容器 id>
```

先查看所有容器

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1Mvde1Ta3mibIqIoo2UqGofluH6EXMYMEZFabq1DFBzOBs7icsbNEAEiaEp7Q/640?wx_fmt=png)

再停止容器

```
docker stop 3c275da2f36d
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdVj81JYkhniaKGyxR0gp6UUbEpKv1GDs43LYnevb3Hvh76T3ZUlia1kzg/640?wx_fmt=png)

### 进入容器

当我们使用`-d`参数时，容器启动会进入后台，此时想要进入容器可以通过以下指令：

**「exec」**（推荐使用）

```
docker exec -it a03b0445b82d /bin/bash
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdRmrOeZRWGNtrXNGMFQPciaevduXN5NNE2giays7vJ3o39eibI8lGDcia5g/640?wx_fmt=png)

**「注意：」** 如果从这个容器退出，容器不会停止，这就是为什么推荐大家使用 **「docker exec」** 的原因。

**「attach」**（不推荐使用）

```
docker attach a03b0445b82d
```

**「注意：」** 如果从这个容器退出，会导致容器的停止。

### 删除容器

删除容器可以使用`docker rm`命令

```
docker rm a03b0445b82d
```

如果想要删除所有终止状态的容器可以使用以下指令：

```
docker container prune
```

小试牛刀（部署一个前端项目）
--------------

首先准备一个 vue 项目，在项目根路径下添加`Dockerfile`文件

### 编写 Dockerfile

```
# 指定node镜像FROM node:16-alpine as builder# 指定工作目录WORKDIR /code# 代码复制到容器中ADD . /code# 安装依赖RUN npm install --registry=https://registry.npm.taobao.org# 打包RUN npm run build# RUN ls# 指定nginx镜像FROM nginx:latest# 复制打包后的代码到nginx容器中COPY --from=builder /code/dist /usr/share/nginx/html# 暴露端口EXPOSE 80
```

### 打包镜像

```
 docker build -t web-nanjiu .
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdfI33yzHZWLic9bvia3gVD1nlHyzah3LO4e4FyYOElvHZep0gCMTdPYWQ/640?wx_fmt=png)

### 启动容器

在镜像打包完成之后，我们可以使用该镜像来启动一个容器

```
docker run -itd -p 0.0.0.0:9090:80 web-nanjiu
```

这里的`-p`表示将容器的端口映射到宿主机的端口，这里的宿主机也就是我们本地了

前面的`0.0.0.0:9090`表示宿主机端口

后面的`80`表示容器的端口

启动完我们直接使用`http://localhost:9090/`进行访问

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1MvdkUPjv1U7WnCFV5qFcXXSTaXQpmFDWAjIbpkHBKDZ5JLXDRDZKXRJicA/640?wx_fmt=png)

当看到这个页面时就代表`docker`部署成功了

当然你也可以使用`docker ps`查看此时正在运行的容器

![](https://mmbiz.qpic.cn/sz_mmbiz_png/aw5KtMic7pia4xxWN14wwfrYiajtHEic1Mvd3CPXCq3Bdra8thtox1jBKiabSVGvib4qFklgC7GVuVVQamDvIQ6SFBAQ/640?wx_fmt=png)