> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/3eNMBlc3Q74Zs-cUKNpy2Q)

🚀 Docker 简介
------------

Docker 是一种开源的容器化平台，用于构建、运行、分享应用程序

使用 Docker 的好处包括：

*   **「便携性」**：容器化的应用程序可以在不同的环境中运行，无论是开发、测试还是生产环境，从而提供了更高的可移植性和一致性。
    
*   **「隔离性」**：Docker 容器提供了隔离的运行环境，使应用程序之间相互隔离，避免了潜在的冲突和依赖关系问题。
    
*   **「资源利用率」**：Docker 的轻量级容器共享主机操作系统的内核，因此可以更高效地利用系统资源。
    
*   **「快速部署」**：Docker 可以快速地创建、运行和销毁容器，使应用程序的部署过程更加简化和高效。
    
*   **「可扩展性」**：Docker 允许水平扩展应用程序，通过在多个容器实例之间分发负载来提高性能和可靠性。
    

> ❝
> 
> 说到隔离性，你可能会想到虚拟机，在这个方面，他们的确很像，但是不同的是，Docker 的多个镜像之间是共用宿主机的操作系统和硬件的，而每个虚拟机都有属于自己的操作系统。
> 
> ❞

![](https://mmbiz.qpic.cn/sz_mmbiz_png/CtsaVVKdWEqWYQlXwAF88HV2lk0hTNib7bNqIrgAU7G6UfnYgbK11jAUd4z9xINWD1cPVFRHgDD4dQ4ZFeRSKMw/640?wx_fmt=png)

🚀 Docker 安装
------------

在官网下载对应的安装包：https://www.docker.com/

安装之后会重启电脑，如果你是 window 平台，那么你还需要安装 wsl

管理员身份运行 cmd ，然后运行 `wsl --install`

如果启动之后仍报错，那么需要运行 `wsl --update`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/CtsaVVKdWEqWYQlXwAF88HV2lk0hTNib7uatVh46jY0EBUicQBM55wZ1hNO7wPBJbP8T4ma18TI2FEg6HqPfHDwQ/640?wx_fmt=png)

如果这时报错如下问题，你可以在命令行运行：`netsh winsock reset`

```
An unexpected error was encountered while executing a WSLcommand. Common causes include access rights issues, which occurafter waking the computer or not being connected to your domain/active directory.Please try shutting WSL down (wsl --shutdown) and/or rebooting yourcomputer. If not sufficient, WSL may need to be reinstalled fully. As alast resort, try to uninstall/reinstall Docker Desktop.lf the issue persistsplease collect diagnostics and submit an issue ([Overview](https://link.zhihu.com/?target=https%3A//docs.docker.com/desktop/troubleshoot/overview/%23diagnose-from-theterminal)). Error details:2 errors occurred:
```

如果报错: `'netsh' 不是内部或外部命令，也不是可运行的程序 或批处理文件。`

你需要在控制台进入`netsh`目录：

```
进入：C:\Windows\System32\netsh# 运行winsock reset
```

```
C:\Program Files\Docker\Docker>C:\Windows\System32\netsh
netsh>netsh winsock reset
找不到下列命令: netsh winsock reset。
netsh>winsock reset

成功地重置 Winsock 目录。
你必须重新启动计算机才能完成重置。

netsh>
```

🚀 Docker 的一些概念
---------------

![](https://mmbiz.qpic.cn/sz_mmbiz_png/CtsaVVKdWEqWYQlXwAF88HV2lk0hTNib7Rfe39yxualwGibYDKorypLJ7MWaYeQ6JM9YzZuN1W9CeE6V1RLrncFQ/640?wx_fmt=png)

### 🎉 1. 镜像

镜像是容器的构建模板。它包含了一个完整的文件系统，以及运行应用程序所需的所有设置、依赖项和代码。镜像是只读的，可以用来创建多个容器实例。

### 🎉 2. 容器

Docker 使用容器来打包应用程序及其所有依赖项，包括操作系统、库、工具和运行时环境。容器是一个独立、轻量级的可执行单元，可以在任何地方运行。

### 🎉 3. 镜像仓库

镜像仓库是用于存储和分发 Docker 镜像的中央存储库。Docker Hub 是一个公共的镜像仓库，你可以在其中找到许多官方和社区创建的镜像。此外，你还可以搭建私有的镜像仓库来存储和分享自己创建的镜像。

### 🎉 4. 数据卷

数据卷是一种用于在 Docker 容器和主机之间持久化存储数据的机制。数据卷可以独立于容器存在，并且在容器被删除后数据仍然保留。

### 🎉 5. Docker 引擎

Docker 引擎是 Docker 的核心组件，负责构建、运行和管理容器。它使用容器化技术来隔离不同的应用程序和进程，使它们可以在同一台主机上独立运行。

🚀 Docker 的一些操作
---------------

### 🎉 1. 镜像的一些操作

#### 查看镜像

安装成功后，运行`docker images`: 仅展示运行中的镜像

```
C:\Users\98480>docker images
REPOSITORY   TAG       IMAGE ID   CREATED   SIZE

C:\Users\98480>
```

#### 构建镜像

镜像的获取方法有两种，一种是通过 `docker build` 构建，

另一种是从镜像仓库中拉取。

##### 使用 `Dockerfile` 构建自己镜像

`Dockerfile` 是一种文本文件，用于定义 Docker 镜像的构建过程。你可以在 `Dockerfile` 中编写一系列指令，用于指定基础镜像、安装软件包、复制文件等操作。然后使用 `docker build` 命令根据 `Dockerfile` 构建镜像。以下是构建镜像的基本步骤：

1.  创建 `Dockerfile` 文件
    

```
FROM node:14.4-alpine3.12.1COPY package.json  ./RUN npm installCOPY ./ .RUN npm run build
```

2.  使用 `docker build`
    

```
# 命令格式如下：
# docker build -tag <镜像名称>:<标签>
docker build -t myImage:0.0.1
```

##### 拉取镜像

从 `Docker Hub` 或其他 `Docker Registry` 拉取镜像

```
docker pull registry_url/repository:tag
```

#### 删除镜像

如果你想删除镜像可以使用

```
docker rmi ubuntu:latest
# 强制删除一个镜像
docker rmi -f ubuntu:latest
```

正常情况下，如果要删除的镜像正在被一个或多个容器使用，或者有基于它的其他镜像存在，`docker rmi` 命令会拒绝删除。

使用 `-f` 标志可以强制删除镜像，即使它有相关的容器或其他镜像。

请注意，这可能导致正在运行的容器出现问题，因为它们可能无法找到所需的镜像。

#### 导出和导入镜像

使用 `docker save` 命令可以将镜像保存为 tar 归档文件，使用 `docker load` 命令可以从 tar 归档文件中加载镜像

```
# 到处镜像 -o为 --outputdocker save -o myimage.tar myimage:tag# 导入镜像 -i为 --inputdocker load -i myimage.tar
```

#### 上传镜像

```
# 登录dockerdocker login# 标记镜像docker tag local_image:tag registry_url/repository:tag# 上传镜像docker push registry_url/repository:tag
```

### 🎉 2. 容器的一些操作

#### 创建容器

使用 `docker create` 命令可以创建一个新的容器，但不会自动启动它

```
docker create --name mycontainer myimage:tag
```

#### 创建并运行容器

使用 `docker run` 命令可以基于镜像创建和运行容器

```
# 该命令会在前台打印信息
docker run --name mycontainer myimage:tag
# -d为后台运行，不会打印运行信息
docker run -d --name mycontainer myimage:tag
```

#### 启动容器

使用 `docker start` 命令可以启动一个已创建但未运行的容器

```
docker start mycontainer
```

#### 停止容器

使用 `docker stop` 命令可以停止正在运行的容器

```
docker stop mycontainer
```

#### 重启容器

使用 `docker restart` 命令可以重启一个正在运行的容器

```
docker restart mycontainer
```

#### 列出容器

使用 `docker ps` 命令可以列出当前正在运行的容器

```
docker ps
```

#### 列出所有容器

使用 `docker ps -a` 命令可以列出所有的容器，包括运行中和已停止的容器

```
docker ps -a
```

#### 进入容器

使用 `docker exec` 命令可以在运行中的容器内执行命令

```
docker exec -it mycontainer bash
```

#### 删除容器

使用 `docker rm` 命令可以删除指定的容器

```
docker rm mycontainer
```

#### 查看容器日志

使用 `docker logs` 命令可以查看容器的日志输出

```
docker logs mycontainer
```

### 🎉 3 数据卷的操作

#### 创建数据卷

可以使用 `-v` 或 `--volume` 参数来创建数据卷并将其挂载到容器中

```
docker run -v /path/on/host:/path/in/container myimage
```

#### 列出数据卷

可以使用 `docker volume ls` 命令列出所有的数据卷

```
docker volume ls
```

#### 查看数据卷信息

可以使用 `docker volume inspect` 命令查看特定数据卷的详细信息

```
docker volume inspect myvolume
```

#### 删除数据卷

可以使用 `docker volume rm` 命令删除指定的数据卷

```
docker volume rm myvolume
```

#### 挂载数据卷到容器

可以使用 `docker run` 命令的 `-v` 或 `--volume` 参数将数据卷挂载到容器中

```
docker run -v myvolume:/path/in/container myimage
```

6.  备份和恢复数据卷：可以使用工具或命令行将数据卷的内容备份到本地文件系统，然后在需要时进行恢复。
    

```
# 备份
docker run --rm -v myvolume:/data -v /path/to/backup:/backup busybox tar cvf /backup/backup.tar /data

# 恢复
docker run --rm -v myvolume:/data -v /path/to/backup:/backup busybox tar xvf /backup/backup.tar -C /data
```

7.  共享数据卷：可以将同一个数据卷同时挂载到多个容器，实现容器之间的数据共享。
    

```
docker run -v myvolume:/path/in/container1 myimage1
docker run -v myvolume:/path/in/container2 myimage2
```

> ❝
> 
> 数据卷是以独立于容器的方式存在的，因此即使删除容器，数据卷的内容仍然保留。这使得数据卷非常适合用于持久化存储和与容器无关的数据。
> 
> ❞

🚀 最后
-----

好了，今天我们就分享到这了，本篇分享的是一些基础操作，下篇文章，将会详细介绍一些高级功能，敬请期待！！！

  

往期回顾

  

#

[如何使用 TypeScript 开发 React 函数式组件？](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468369&idx=1&sn=710836a0f836c1591b4953ecf09bb9bb&chksm=b1c2603886b5e92ec64f82419d9fd8142060ee99fd48b8c3a8905ee6840f31e33d423c34c60b&scene=21#wechat_redirect)

#

[11 个需要避免的 React 错误用法](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458468180&idx=1&sn=63da1eb9e4d8ba00510bf344eb408e49&chksm=b1c21f7d86b5966b160bf65b193b62c46bc47bf0b3965ff909a34d19d3dc9f16c86598792501&scene=21#wechat_redirect)

#

[6 个 Vue3 开发必备的 VSCode 插件](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467984&idx=1&sn=f9f71530f15124fe44cd22eff3170981&chksm=b1c21eb986b597af806837a37b87b1e8bc06b26b16af578deddd8bb503a768f78f5a7acdb909&scene=21#wechat_redirect)

#

[3 款非常实用的 Node.js 版本管理工具](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467880&idx=1&sn=ca7e12574d88a6b36ccfd47d9ddc7a4f&chksm=b1c21e0186b5971758792950721938b4a4efbc3024b0b01965c25a4ea73ec838767783ade6ea&scene=21#wechat_redirect)

#

[6 个你必须明白 Vue3 的 ref 和 reactive 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467756&idx=1&sn=902e85685a50ba7cdc75e410e10b9718&chksm=b1c21d8586b5949326c8836132b20dc4294af449473b6db4592cbfd00788345534a07d77fa6d&scene=21#wechat_redirect)

#

[6 个意想不到的 JavaScript 问题](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467612&idx=1&sn=44ea5238a6500f44a47ea316c634bcf6&chksm=b1c21d3586b594237333a306f00353fba450514076e54ac32df7485ae358d0cefb25a6c1f329&scene=21#wechat_redirect)

#

[试着换个角度理解低代码平台设计的本质](http://mp.weixin.qq.com/s?__biz=MjM5MDc4MzgxNA==&mid=2458467471&idx=2&sn=7990678e19544372ff43b5a84f491337&chksm=b1c21ca686b595b07b097c764f9304887282d737b4dd0a2634c47b25c8f223c785a6c8714382&scene=21#wechat_redirect)

![](https://mmbiz.qpic.cn/mmbiz_gif/dy9CXeZLlCXukR16d8fyyeJ4icloLCW0cvbCvibfaBxbY22lN51mYaLeKictjOeobKmxCVfb3AwIZ3t6eKicIicTtow/640?wx_fmt=gif)

回复 “**加群**”，一起学习进步