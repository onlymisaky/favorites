> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/32jIfyuMeQx0nt2-I2dWDA)

> 作者：onaug6th
> 
> 来源：https://segmentfault.com/a/1190000038525808

背景
--

目前公司测试环境前端项目部署，是由测试人员负责手动操作。当需要更新测试环境版本时，测试同事需要手动操作以下过程。

1.  连接打包服务器
    
2.  打开 svn 管理工具，找到目标 svn 版本号并拉取项目
    
3.  拉取项目后，打开命令行，下载依赖。
    
4.  等待依赖下载结束后。敲下打包命令
    
5.  等待构建结束，并将资源文件压缩成压缩包复制到桌面
    
6.  链接部署服务器
    
7.  找到需要部署的站点文件夹
    
8.  粘贴至目标文件夹并解压
    

在项目多的时候，重复操作极大的浪费时间。如果遇到同一时间不同项目组打包项目，打包和部署服务器就要排队使用，测试人员只能在等待中浪费时间。为了解决这些问题，选择寻找合适的持续集成方案。来自动化完成重复的步骤。

我尝试过轻量的自动部署方案（walle，spug）。但由于两者对于 Windows 系统和 svn 支持太低。最后还是选择了老牌稳健的 Jenkins。

我们利用 Jenkins 来自动化处理上述问题。（拉取代码，打包构建，将资源送往目标服务器）。让测试同事不再需要关心打包环节，并从这一繁琐的过程中解放出来，回到本应专注的测试程序工作环节上。

下载 docker 与 Jenkins 镜像
----------------------

借助 docker 这个搭环境的神器来搭建 Jenkins，首先安装 docker

```
# 安装dockeryum install docker
```

```
# 启动dockersystemctl start docker
```

```
# 设置镜像源，加速下载镜像vim etc/docker/daemon.json{"registry-mirrors": ["http://hub-mirror.c.163.com"]}# 服务重启systemctl restart docker.service
```

```
# 安装docker Jenkinsdocker pull jenkins/jenkins# 建立Jenkins数据存储文件夹mkdir /usr/jenkins# 设置权限chown -R 1000:1000 /usr/jenkins# 启动Jenkins，映射到 9527 端口docker run -itd --name jenkins -p 50000:50000 -p 9527:8080   --privileged=true -v   /usr/jenkins:/var/jenkins jenkins/jenkins
```

Jenkins 初始化
-----------

成功启动容器后，访问 Jenkins 服务器 IP 地址加端口号，进行 Jenkins 初始化，初始化的管理员密码从日志中可以获取。

```
#查看容器IDdocker ps -a#查看容器日志docker logs 容器ID
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uHNUd7wy9iaJElfLKVFlbPcOrRxPu3ykKGibyX7VE2p05VNquiaaQ5Nduw/640?wx_fmt=png)

选择推荐安装，等待安装后即可。

安装 Jenkins 插件
-------------

初始化完后。使用刚刚创建的账号登录 Jenkins 进入界面，需要安装几个插件来支持我们的业务。

在系统管理——插件管理中，安装以下三个插件。

1.  Subversion Plug-in（svn 支持）
    
2.  Publish Over SSH（远程连接）
    
3.  NodeJS Plugin（前端资源构建）
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uN6iamQHbLACsRiaLyNFJNiciaeicmLeD05v2OFfAA1ibias2yzQMvib94ZeCNQ/640?wx_fmt=png)

插件配置
----

插件安装完后，需要对插件进行配置。

**ssh 插件配置**

在系统管理——系统设置中，找到 `publish over SSH`。点击新增按钮，添加需要发布的远程机配置。

比如需要发布到开发环境的远程机，添加以下信息。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8u7TpqKvQ90mMD80IYoqK0J0mLdSvhMLTuPtBSBicPetWBCeHmmCbPsBA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uC4G0V4OSEmpAqa0vsJ60ib6YGh0eKaC7ozKl9hPqOg0LU4JGZO3MRJQ/640?wx_fmt=png)

部署机器操作系统为 windows，需要给部署机器安装 ssh 并开启服务，以支持 ssh 链接。

windows 安装 ssh

部分机器可能设置了防火墙，需要在防火墙给 22 端口添加出站入站规则。允许 ssh 连接。

**node.js 插件配置**

在系统管理 - 全局工具配置中，找到 `NodeJS`。

需要注意的是 Node.js 版本避免过高，选择开发稳定版本，能避免不少版本过高导致部署过程出现一些奇怪的问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uZdLzpJKOk2c5kg6zv0eYq5ib0T1QaXtxUu8Psxj5jZPlyeqoC4dQSEA/640?wx_fmt=png)

插件配置完毕后，就能够新建构建任务了。

新建构建任务
------

任务类型选择自由风格软件项目。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uN2iaSU6PZh5OnC0wxLiaiazZDPjOG3XCfuvEIq5O8tkoL6PK6gypu9exg/640?wx_fmt=png)

### 任务信息

添加参数化构建过程，用于处理不同情况处理的构建。这边需要关注两个参数 `env`, `svnUrl`，对应着：构建及发布环境、构建的 svn 版本号。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uvrjlTJ1gJnXH4ZIhLILp4D4njufILxib8pOXicsibNGwVeIY0HgvB5c8g/640?wx_fmt=png)

`env` 在前端项目构建时，会当作变量传入。用于动态修改构建的项目环境类型。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8ueviaCMo3pp4qaKobUgfHKrZnWgAiaVtpMLOKbX9EgmINRju32Qd4zdEA/640?wx_fmt=png)

`svnUrl` 为每次项目构建时，拉取代码的 SVN 地址。

### svn 仓库配置

由于是代码版本控制工具是 SVN，需要选择 `Subversion` 选项，在 `Repository URL` 中填入变量 `$svnUrl`。代表构建时使用传入的地址参数。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uzunC7KvF8loia6IGcVukjoYaWZDmxrwdvWMzRrAlU1z0e8WjIrLbF9Q/640?wx_fmt=png)

同时还需要提供一个 svn 账号凭证，用于拉取 SVN 代码。

### 配置 node.js 打包前端项目

选择 node.js 进行构建。

在构建中，能够借助命令行给 node.js 环境来安装某些源工具，比如 yarn、cnpm、nrm。后续可将安装源工具的命令去掉，直接执行安装依赖命令。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8ukEmAialxUE9cbnIAZT9nUQiclBQwYibwwSL7E5OtsD9t6PDsmfAyibhrIg/640?wx_fmt=png)

此处的命令负责打印常见信息，并执行构建命令。在构建结束后将 `dist` 文件夹的内容压缩成压缩包："dist.tar.gz"

### 配置构建后操作

在前端资源打包完成后，我们需要将文件送到目标服务器。此处添加送往的目标服务器。

点击`Add Server`添加构建后需要将文件传送的目标服务器，并指定传送的文件名称`dist.tar.gz`，并编写传送后需要执行的命令。

`Exec command` 中的命令在不同的操作系统中是不一样的，当系统为 unix 系统时，执行的为 unix 命令。当为 windows 系统时，执行的为批处理命令。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uWhlC50IB6Y6bVEGSWMLO9qwOdoPicTAu3Eibq1IwgLibHomCnN1zYELyQ/640?wx_fmt=png)

`Exec command` 中的 `superDeploy.bat` 为目标服务器预留的批处理文件，负责将文件解压缩，送往部署目录的处理。

完成以上配置后，保存此任务。

在远程机器添加批处理文件
------------

当配置的目标机器为 windows 系统时，文件会被送到配置远程链接的账户所属用户文件夹下。在传输完毕后，预留的 `superDeploy.bat` 文件会被执行。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uialbibrv1GfUicYkA7GDrib4egTBFMwjwmViavAlQJjjZZWHsYNuLI5EibVQ/640?wx_fmt=png)

`superDeploy.bat` 接收两个参数，当前构建的环境，和构建后文件传送的路径。

批处理文件负责复制压缩包到目标文件夹，在目标文件夹解压缩等操作。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uckYTIPpYic3rvDOTBk8KMjku3ibCGrjTBpJzFMiaqScqtgf22y08REXXA/640?wx_fmt=png)

这里通过命令行来调用 `7z` 的解压缩功能，需要给部署机安装 `7z`解压软件。也能更换为其他解压缩软件。

7z 官方中文站

开始第一次构建
-------

完成配置后，点击 `Build with Parameters` 开始构建，构建前需要填写构建参数。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uHXz6sGibo1KLTPQUdpmeUPsktlibWkyjSbGIvE20jLeJesrbR0SkBn2g/640?wx_fmt=png)

此时会按照 SVN 项目地址拉取代码，构建前端资源时，会执行`npm run build:${传入的环境参数}` 命令。对应的为前端项目 `package.json` 中各环境的打包命令。

```
{    "scripts": {        "build:dev": "vue-cli-service build --mode=dev",        "build:test": "vue-cli-service build --mode=test",        "build:prod": "vue-cli-service build --mode=prod"    }}
```

此处利用了 `vue-cli3.0` 提供的构建命令和环境变量文件，来提供各环境的打包命令。前端项目需要配置多种打包命令，来支持 Jenkins 的动态环境构建。

前端项目添加多环境打包命令

一切就绪，点击开始构建。Jenkins 就会按照 SVN 地址拉取代码，并且执行构建命令，在构建完成后将 dist 文件夹压缩成压缩包，送到目标服务器并且执行预留在目标服务器的批处理文件。批处理文件将压缩包移动到执行的目标目录，处理解压缩的动作。一个自动构建和部署的过程就完成了。

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uex6hmSx8dTOSzbbJbhqh3CpcuNQllJibuKJLCfCe3QwTrdCibEybyutA/640?wx_fmt=gif)

实际构建时间需要 40 秒~ 70 秒，但对于手工操作来说要强太多了。

踩过的坑
----

1.  文件传送的用户目录名称不一样
    

在某些电脑上出现，登录的用户名为 `user`，但实际传输到目标的文件夹为 `user.iZjenfhextasd` 这样的文件夹。需要注意脚本的正确存放位置。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8uMZwjsoAbDpJPFQFcv80sN5fiaQtic41pWtdjepyHS3hy8581EdnHXkGw/640?wx_fmt=png)

1.  cnpm 安装依赖偶尔超时
    

需要修改 Jenkins 镜像中安装的 cnpm 源码文件的超时时间配置。

```
docker cp jenkins:/var/jenkins_home/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/Node_JS_12.18.4/lib/node_modules/cnpm/node_modules/urllib/lib/urllib.js /usr/jenkins/#修改文件中的内容docker cp /usr/jenkins/urllib.js jenkins:/tmp/docker exec -u root -it jenkins /bin/bashmv /tmp/urllib.js /var/jenkins_home/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation/Node_JS_12.18.4/lib/node_modules/cnpm/node_modules/urllib/lib/urllib.js
```

或者能更换为其他依赖下载命令，比如 yarn。

1.  部署机网络或性能问题，偶尔无法连接
    

保证部署机能够正常运行，不爆满内存与 CPU 使用。

1.  ssh 连接失败
    

检查 openSSH 服务是否启用，或者防火墙是否禁用了 22 端口的出入。

1.  依赖更新问题
    

Jenkins 首次安装依赖会根据项目中锁定版本号的文件进行依赖版本安装（package-lock.json，yarn-lock），安装过后 `node_modules` 文件夹会存留。如需要更新特定依赖版本，需要手动修改 `package.json` 中的版本号并重新提交构建，或者选择任务中的 “清空工作区选项”。

写在最后的碎碎念
--------

在公司没有运维的情况下。一开始只是抱着尝试的心理来探索持续集成的方案，在尝试了 walle/spug 这样的轻量部署方案均失败后曾打算放弃。但听到测试同事的一句吐槽：“自动部署说了三年了，都没有做出来”。于是下定决心一定要将这个目标完成。

我始终坚信着，如果某件事情迟迟完成不了，那它应该是在等待某个人来完成。我就要尝试来成为这个人。

于是开始不断收集资料，查阅文档，从零开始搭建。windows 与 svn 总有大量奇奇怪怪的问题，在搭建的过程频频受阻。好不容易搭建好了，依赖却安装不了了，障碍一个接一个。

在连续失败了 95 次之后，第 96 次终于成功将所有的流程走通。成功的喜悦无以言表，差点就激动得在座位上跳了起来。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8upLCJ12vq0WTicRVQ6RhkB4TjcOT9XmDT7nF5hnlExWDpXofKj4w8XBw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHrv0UMV1icg4bCxq9CFV6w8unAp8rt2rzSD8AibL8h33smick4rsgLut5ggibToyZ4bOnvOkYtzL4YG5Q/640?wx_fmt=png)

就这样，测试同事的生产力得到了解放。不再需要为打包的事情苦恼，一切都变得这么简单。

感谢 TL 一直的信任和支持，在我提出有这样的想法时，不断的帮我争取借用到各个生产服务器环境的权限。也让我领悟到，只有不断跳出固定领域。不断挑战自己不熟悉的内容，自身的能力才有更大的提升。

希望这篇文章能够帮到你，have a nice day :)

The End

如果你觉得这篇内容对你挺有启发，我想请你帮我三个小忙：

1、点个 **「在看」**，让更多的人也能看到这篇内容

2、关注官网 **https://muyiy.cn**，让我们成为长期关系

3、关注公众号「高级前端进阶」，公众号后台回复 **「加群」** ，加入我们一起学习并送你精心整理的高级前端面试题。![](https://mmbiz.qpic.cn/sz_mmbiz_png/H8M5QJDxMHpfug7eo0bpXVYicId4V9tZIGGOB0zO9klU12D6iap0ib0IwAAKZ6vyJKuiaIwN4yibqxPPcP8b9e84vKA/640?wx_fmt=jpeg)》》面试官都在用的题库，快来看看《《

```
“在看”吗？在看就点一下吧

```