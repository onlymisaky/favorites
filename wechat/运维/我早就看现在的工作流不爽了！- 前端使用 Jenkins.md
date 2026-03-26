> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/epQ4rMDlzgvnI1jKqji8UQ)

背景
--

目前笔者所在的小公司的前端项目还是推送到 git 仓库后由另一名后端拉取代码到他电脑上再 build，然后再手动同步到服务器上，比较麻烦，而且出现一个 bug 就要立即修复，笔者一天要说 100 次 “哥，代码更新了，打包上传下吧，球球了”，终于我实在受不了了（上传代码的这位哥也受不了了），于是想通过 Jenkins 实现简单的前端项目自动打包部署。

通过 docker 安装 Jenkins
--------------------

通过 ssh 连接上局域网服务器 192.168.36.2，在 home 目录下新建了一个 Jenkins 文件夹，后续我们的配置文件就放在其中。

```
 cd<br style="visibility: visible;"> # 将 Jenkins 相关的文件都放在这里<br style="visibility: visible;"> mkdir jenkins<br style="visibility: visible;"> cd jenkins<br style="visibility: visible;"> <br style="visibility: visible;"> # 创建 Jenkins 配置文件存放的地址，并赋予权限<br style="visibility: visible;"> mkdir jenkins_home<br style="visibility: visible;"> chmod -R 777 jenkins_home<br style="visibility: visible;"> 
 pwd
 # /root/jenkins
```

创建`docker-compose.yml`：

```
 touch docker-compose.yml
 vim docker-compose.yml
```

```
 version: '3'
 services:
   jenkins:
     image: jenkins/jenkins:latest
     container_name: 'jenkins'
     restart: always
     ports:
       - "8999:8080"
     volumes:
       - /root/jenkins/jenkins_home:/var/jenkins_home
```

Jenkins 启动后会挂在`8080`端口上，本文笔者将其映射到`8999`端口，读者可以自行更改。

关键在于将容器中的`/var/jenkins_home`目录映射到宿主机的`/root/jenkins/jenkins_home`目录，这一步相当于将 Jenkins 的所有配置都存放在宿主机而不是容器中，这样做的好处在于，后续容器升级、删除、崩溃等情况下，不需要再重新配置 Jenkins。

使用`:wq`保存后可以开始构建了：

```
 docker compose up -d
```

这一步会构建容器并启动，看到如下信息就说明成功了：

```
 [+] Running 1/1
  ✔ Container  Jenkins   Started           1.3s
```

查看一下容器是否在运行：

```
 docker ps
```

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmvR9XSQB8xCZiaKGV5bic4DVJx2icRfEKFB9DPLw3If8cd45hfmMvHqSfg/640?wx_fmt=png&from=appmsg)image-20240403133238265

这个时候通过`http://192.168.36.2:8999`就可以访问 Jenkins 了。

Jenkins 初次配置向导
--------------

#### 解锁

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmzn6w41ODlHBib56OyeLK5Pws7Kzib7a5GYRORJviaGN75TOqCm8qW94Sw/640?wx_fmt=png&from=appmsg)image-20240403133538015

第一次打开会出现向导，需要填入管理员密码，获取密码有三种方式：

0.  通过宿主机
    
    ```
     cat /root/jenkins/jenkins_home/secrets/initialAdminPassword
     
     # 2bf4ca040f624716befd5ea137b70560
    ```
    
1.  通过 docker 进入容器
    
    ```
     docker exec -it jenkins /bin/bash
     
     #进入了docker
     jenkins@1c151dfc2482:/$ cat /var/jenkins_home/secrets/initialAdminPassword
     
     # 2bf4ca040f624716befd5ea137b70560
    ```
    
    与方法一类似，因为目录映射，这两个目录其实是同一个。
    
2.  通过查看 docker log
    
    ```
     docker logs jenkins
    ```
    
    会出现一大串，最后能找到密码：
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmC330sM3406Yia7uKOqpcfGicy53hXl6asAUqlPwszibtzqOeWQa48xFoA/640?wx_fmt=png&from=appmsg)image-20240403134001532
    

填入密码，点击继续。

#### 安装插件

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm47r2B0Iu4l6a1zjxIFHEQbuCGlVGgHuYNqdbWdOqTtuYrQgTUMVA8g/640?wx_fmt=png&from=appmsg)image-20240403134122512

选择安装推荐插件即可。

安装插件可能会非常慢，可以选择换源。

#### 更换 Jenkins 插件源（可选）

有两种方法：

0.  直接输入地址：
    
    `http://192.168.36.2:8999/manage/pluginManager/advanced`，在`Update Site`中填入清华源地址：
    
    ```
     https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json
    ```
    
    点击`Submit`提交保存，并重启容器。
    
1.  直接更改配置文件：
    
    宿主机中操作：
    
    ```
     cd /root/jenkins/jenkins_home
     vim hudson.model.UpdateCenter.xml
    ```
    
    替换其中的地址，然后重启容器即可。
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmo332hGU1xe1lx2fV1huDLF4zwSLwZNrMcMibvFOLdytJyxfj44cmuCQ/640?wx_fmt=png&from=appmsg)image-20240403135010339
    

#### 创建用户

这一步建议用户名不为 admin ，不然会出现奇怪的问题，比如密码登录不上，需要用上一部的初始密码（2bf4ca040f624716befd5ea137b70560）才能登录。

我这里创建了一个 root 用户（只是名字叫 root，防止用户名太多记不住而已）。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmicB934JXmicbmIlXv8w1oxAPfB7By79ratpZNiawZlMsFG0Edia0mKUyDg/640?wx_fmt=png&from=appmsg)image-20240403135909136

点击保存并完成。

实例配置按需调整即可，直接下一步，Jenkins 就准备就绪了。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmnI7J7YtkHRsmooyED3t8CKfC5zEiaGNN9f9g7Ewfhg5zS1fgoAOFkeQ/640?wx_fmt=png&from=appmsg)image-20240403140101678

至此 Jenkins 安装就算完成了。

安装插件
----

笔者是一名前端，因此以前端项目为例。

前端项目的打包需要 node 环境，打包完成后通过 ssh 部署到服务器上，并且构建结果通过钉钉机器人推送到群里，因此需要三个插件。

0.  NodeJS
    
1.  Publish Over SSH
    
2.  DingTalk（可选）
    

在 系统管理 -> 插件管理 -> Available plugins 中搜索并安装。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmEjm9en3YLZkfH8voafCbCzHQ2k87siatfchYdPEmTL8sMddPqr2MInQ/640?wx_fmt=png&from=appmsg)image-20240403140852383![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm4ZFvtzRlbTia46IicGyNLtZDEjrhUG8DC5MibsEO1OGwqiauianh4XLo9JA/640?wx_fmt=png&from=appmsg)image-20240403140907525

勾选安装后重启，让插件生效。

插件配置
----

我们安装了三个插件，分别进行配置。

### NodeJS

这个插件可以在不同的项目中使用不同的 node 环境，例如 A 项目 使用 node14，B 项目 使用 node20 这样。

进入 系统管理 -> 全局工具配置 -> NodeJS 安装 （在最下面）

点击新增：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmurPF0hPz8ibIgl9XeeedBJ4ocpPhQEEY5pK7DA2D9TESoWdI7BxyO8w/640?wx_fmt=png&from=appmsg)image-20240403142305544

默认的这个使用的是 nodejs.org 的官方源，虽然现在 nodejs.org 的官方源国内访问也还可以，但为了保险起见，笔者还是换成阿里巴巴源。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmlLWAyLPBG49TibJqDiabgaSZgmmHOCe2lRD4Jeic0BllWluO6mVcmzdxA/640?wx_fmt=png&from=appmsg)image-20240403142424488

点击红框里的 X 删除当前安装，在点击新增安装，选择 `Install from nodejs.org mirror`。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmsuQYwA5GALEHGIpKZzDKicWCoYucNoU9IH78JJSDcokeIJh2rXgaYQg/640?wx_fmt=png&from=appmsg)image-20240403142605321

镜像地址填入`https://mirrors.aliyun.com/nodejs-release/`，版本按需选择，笔者这里选择的是 node20-lts，并且安装了包管理工具 pnpm，如果读者的项目需要别的全局安装的包，也可以写在 `Global npm packages to install` ，比如 `yarn`、`cnpm` 之类的。

记得起一个别名：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmxVY839w7CpicAU3wmZ3D1Fu8Q4agZes7dlNicRplmUaFz84G0bwaZIgQ/640?wx_fmt=png&from=appmsg)image-20240403153355639

配置好后点击保存。

一般来说，在使用 npm 时，需要更改 npm 的源，同样在 Jenkins 中也是可以的。

安装完 NodeJS 插件后，系统设置中会多一项 `Managed files`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmH6Cgm5ZAUSibq4wuHnFm5ThB2Fb9tIhyIc11TRa000Idj5jP7lo6siaw/640?wx_fmt=png&from=appmsg)image-20240403143048480

进入后选择左侧的`Add a new Config`，然后选择 `Npm config file`，然后点击 `Next`。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmTmLibR4iaN2zpNjMOamCXFlMJuJkL1zqSQsbggaKF3dRjhWW4ZkVXZIg/640?wx_fmt=png&from=appmsg)image-20240403143327739![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmnTqC0RP1wh69TtOo6M27FfoprovgAGhbGT0LzakkD1jCS3nprrMiaLw/640?wx_fmt=png&from=appmsg)image-20240403143449389

新增一个 `NPM Registry`，填入阿里巴巴镜像源：`http://registry.npmmirror.com`。

至此 NodeJS 相关的配置就完成了。

### SSH Server

打包后需要通过 SSH 部署到服务器上，因此需要先配置好 SSH 服务器。

打开 系统管理 -> 系统配置 -> Publish over SSH （在最下面）:

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmTeEuTMf3o2Zf4OUU0M8BqOEhytGKejtqH5y804qMEsnawicNvkibECUQ/640?wx_fmt=png&from=appmsg)image-20240403143805027

然后根据实际情况进行填写：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm0GG4m7BtvpEe5ZuemFGkkpGwhSPkPonfhPQ6HGsMPEpKbL1lKr1Aibw/640?wx_fmt=png&from=appmsg)image-20240403144201158<table data-tool="markdown.com.cn编辑器"><thead><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px;">字段</th><th data-style="border-top-width: 1px; border-color: rgb(204, 204, 204); text-align: left; background-color: rgb(240, 240, 240); font-size: 14px;">解释</th></tr></thead><tbody><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">Name</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">显示在 Jenkins 中的名称，可随意填写</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">Hostname</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">服务器地址，ip 或 域名</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: white;"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">Username</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">SSH 登录的用户名</td></tr><tr data-style="border-width: 1px 0px 0px; border-right-style: initial; border-bottom-style: initial; border-left-style: initial; border-right-color: initial; border-bottom-color: initial; border-left-color: initial; border-top-style: solid; border-top-color: rgb(204, 204, 204); background-color: rgb(248, 248, 248);"><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">Remote Directory</td><td data-style="border-color: rgb(204, 204, 204); font-size: 14px;">SSH 登录后进入的目录，必须是服务器中已经存在的目录，设置好之后所有通过 SSH 上传的文件只能放在这个目录下</td></tr></tbody></table>

这里笔者使用用户名 - 密码的方式登录 SSH，如果要通过 SSH Key 的方式的话，需要在字段 `Path to key` 填入 key 文件的地址，或者直接将 key 的内容填入 `Key` 字段中:

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNman1HRZrCcZe5u5Ioryq2Nwa7C75BH2nuuCxbQTnuwWDqpD3rIXr5eg/640?wx_fmt=png&from=appmsg)image-20240403144737759

设置好可以通过`Test Configuration`，测试 SSH 连通性：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmOmyhCZJuPfZkA6X1lpsT6NKRWRU8tb2TGianliazYM0H7vN6QrkmibduQ/640?wx_fmt=png&from=appmsg)image-20240403144822057

出现 `Success` 代表 SSH 配置成功。

### 钉钉通知（可选）

如果不需要通过钉钉通知，可以不装 DingTalk 插件，并跳过本节内容。

#### 钉钉部分设置

该功能需要一个钉钉群，并打开钉钉群机器人：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm54ahKQbalENWgk1iauuXkyJwkQViacjSUFUlpicfh3KBiagOsqrAVA7rlQ/640?wx_fmt=png&from=appmsg)image-20240403145500789

点击添加机器人，选择自定义：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmPtIRAicDiaKdFAeicvnictJ8aL4NKBm7J2AOdAdHbHVUY7WN0rpBuicuc1g/640?wx_fmt=png&from=appmsg)image-20240403145604092

这里笔者的安全设置选择了加签：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmLiboia94lxEQrDP3qsJ5cul9YCTB6iblRBnia6lic4mbTKuMY1QTDsguXLA/640?wx_fmt=png&from=appmsg)image-20240403145717147

将签名保存下来备用。

点击完成后，出现了钉钉机器人的 Webhook 地址。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm4zaiaBq4mw8A6XQvTianxwYVzapvHibFtPlACicQolickOaibGD79cDiblBcw/640?wx_fmt=png&from=appmsg)image-20240403145823192

将地址保存下来备用。

至此钉钉部分的设置就结束了。

#### Jenkins 部分

打开 系统设置 -> 钉钉 （在最下面的未分类中）:

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmKDv5NaHOsLSIic1VAJiaBRTibkPibzyYfpz67jjvba3Qx6HCGXicffhtlNA/640?wx_fmt=png&from=appmsg)image-20240403145150439

根据需要配置通知时机：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmwwwrv6zac7seXkqVhRySOWKA3icuNRIhDcm1aKcJITQ2PCRIDmH9oIA/640?wx_fmt=png&from=appmsg)image-20240403145231249

然后点击机器人 - 新增：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmTtLvot6wbSpaDuCThjS7NUGgKrleaU1TGqJOouLjMHCoOvEbUiaGwaw/640?wx_fmt=png&from=appmsg)image-20240403145303034

将刚刚的钉钉机器人的签名和 Webhook 地址填入对应的地方，并点击测试：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmpRSZCzlo1TbjibI1EA3aibuPicg3zK3rv0PkPjCvV8hQDibooUu8y1FIyg/640?wx_fmt=png&from=appmsg)image-20240403150049799

此时钉钉机器人也在群中发了消息：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmax8UL2wXEXibjibkV9PBiaUlvyO59WHlI4WVz2ZwZLl1xkicyTCRe7TlTg/640?wx_fmt=png&from=appmsg)image-20240403150138516

至此钉钉机器人配置完毕。

创建任务（job）
---------

本文中，笔者将以存储在 Git 仓库中的项目为例。

### Github 项目

**「注意，如果想让 Github 项目全自动构建的话，需要你的 Jenkins 能被公网访问到，例如部署在云服务器上，像笔者这样部署在本地局域网中，是无法实现 “提交代码 -> 自动构建 -> 自动部署” 的，只能实现“提交代码 -> 手动点击开始构建 -> 自动部署”」**

如果在 Jenkins 新手向导里选择了 安装推荐插件，那么现在就不需要额外安装 Github 相关的插件了，否则的话需要手动安装 Github 相关的插件：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmrklQLvlsKia3SzJ6FIbBjwVm3Pyv3vK7yOibjWCQjPtRAibqZicUF5c6Mg/640?wx_fmt=png&from=appmsg)image-20240403151242880

#### 创建项目

选择 Dashboard -> 新建任务：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmnHmLMbSmMmDlDsNsOuno4aDicpWKPUlX3dDDLIDwCjdTmvialDxV73HA/640?wx_fmt=png&from=appmsg)image-20240403151424735

选择`构建一个自由风格的软件项目`，点击确定。

#### General

这部分可以添加钉钉机器人：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmiaQ4t91emib6B55Y7iabhtGibSp1WjtCZtqROhrT5D8bfBJhfNRZ51C3rg/640?wx_fmt=png&from=appmsg)image-20240403151545166

#### 源码管理

这里选择 Git：

输入仓库地址：`https://github.com/baIder/homepage.git`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmqyiadUKDdl4Rx2pROUn0lF7kLOzPvKIaiaxgdGjXrEtAo9zVUsB127yg/640?wx_fmt=png&from=appmsg)image-20240403151822101

由于笔者这是一个私有仓库，因此会报错。

在下面的`Credentials`中，添加一个。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmh4vXGFRKpicCAT1EibgBPZica1IkgEE6dMibQzSBLuzZk02WiaWyjt9LK9Q/640?wx_fmt=png&from=appmsg)image-20240403151941812![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmMrlhNQbxJHPj3YdebYzwbUIO9hNImhpS90qN2tWJlNfmicE2NOIP7LA/640?wx_fmt=png&from=appmsg)image-20240403152135370

**「注意，这里的用户名是 Github 用户名，但是密码不是你的 Github 密码，而是你的 Github Access Token！！！」**

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmggGu4P7EnYia5RNJc77lYxjU4Nm9PdNANuZE0xn6fQKMGQwSWNm9ZEQ/640?wx_fmt=png&from=appmsg)image-20240403152324115![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm9ACYmeNywO4ibNiaI6eib73Bicxo6TGFMvT1WJsG5AzNeCVG42VGunDycQ/640?wx_fmt=png&from=appmsg)image-20240403152429183

可以在这里创建 Token，需要勾选 `admin:repo_hook` 、`repo` 权限。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmJjZTglmucTIbeWSTdDgGOiaeYtsOSXIIbOMM6MFOHZTnwhOhzazZFkQ/640?wx_fmt=png&from=appmsg)image-20240403152535951![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmgtYQzia0EYlP3YLL9hXvOGMp7RC54NQcvgZZKZctAoicl75RXnLgkicicg/640?wx_fmt=png&from=appmsg)image-20240403152729685

这里的报错是网络问题，连接 Github 懂得都懂。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmAt3RNWRbQmiclR4ldT5yzYuGjXSribbaBjwQ3zdYsEgECQBAsWV2vOcg/640?wx_fmt=png&from=appmsg)image-20240403152824725

分支可以根据实际情况选择。

#### 构建触发器

勾选`GitHub hook trigger for GITScm polling`，这样在 Git 仓库产生提交时，就会触发构建，属于是真正的核心。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmyXMopc06U8dZDHTIrtS938sqO3yYlWzHIZAGf3MbY9T304nEGPO2zw/640?wx_fmt=png&from=appmsg)image-20240403153134664

#### 构建环境

勾选 `Provide Node & npm bin/ folder to Path`

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm1mkoot9FlUXydXx9nVEBgegzKRcSo5bVrLJJua5SECSYMaOKn7dNibQ/640?wx_fmt=png&from=appmsg)image-20240403153444910

#### Build Steps

到这里，可以理解为 Jenkins 已经将仓库克隆到本地，并且已经安装好了`node`、`npm`、`pnpm`，接下来就是执行命令：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmu4qjruJZnfhGeNwJPm0sLqejx7DsUykTvic1UYNZicTNKchCY69F2fLg/640?wx_fmt=png&from=appmsg)image-20240403153625159

我们需要执行命令：

```
 node -v
 pnpm -v
 
 rm -rf node_modules
 rm -rf dist
 
 pnpm install
 pnpm build
```

这里的`pnpm build`需要按情况更换为`package.json`中设定的命令。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmUD2kLJT8SxQWnSk3IXcPic4hClN2MTNxauARu3mMK9LvRP5BerOR7fQ/640?wx_fmt=png&from=appmsg)image-20240403153850007![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmOnRVb7mZLMeJQhQVsC3RDowpHttYmuNVPgAVFrLcz5xfmIIGOeJ3Ew/640?wx_fmt=png&from=appmsg)image-20240403153750787

#### 构建后操作

经过所有的流程到这里，项目应该已经打包在`dist`目录下了。现在可以通过 SSH 将打包好的产物上传到服务器上了：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmlkJ7siaRmzJcUsOcAkh0r4C0coviaNTbbu6JqGSHNicNCI68YPibPR1DGA/640?wx_fmt=png&from=appmsg)image-20240403154044658![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmE7YWobQibv9hIjsHdF5aUTUUGiar07DcNlOzjvyLLyictG2YGYumJJbDQ/640?wx_fmt=png&from=appmsg)image-20240403155757484

这里的 `Source files` 字段一定要写成`dist/**/**`，如果写成`dist/*`，则只会将第一层的文件上传。

`Remove prefix` 需要填写，否则会将`dist`这个目录也上传到服务器上。

`Remote directory` 是相对于配置 SSH Server 时的 `Remote directory` 的，本例中就是 `/data/sites/homepage` 。

`Exec command` 是文件上传后执行的命令，可以是任何命令，可以是让 nginx 有权限访问这些数据，重启 nginx 等等，根据服务器实际情况更改。

> ❝
> 
> 当然也可以在 `Build Steps` 中 build 完成后将 dist 目录打包，然后在通过 SSH 将压缩包上传到服务器，然后在 `Exec command` 中解压。
> 
> ❞

至此所有的配置已经完成，保存。

#### 测试

点击左侧的 立即构建：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmfmpXUYkdrebJmDWm1tIYjzB58Z0eRBj14K6gApBwfOVqvjTl4EkRsw/640?wx_fmt=png&from=appmsg)image-20240403154858929![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmqSOSCB4R4MdekG8GicTwToT9pKOlkYKicW9fqjzqicfAFCLJ0Pe58qSNQ/640?wx_fmt=png&from=appmsg)image-20240403154950197

第一次构建会比较慢，因为需要下载 node，安装依赖等等，可以从控制台看到，命令都如期执行了：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmicF0sxCaaibyzkiawpttAPib98ZYL02ibWrfyheTn9KlGoBZb7dpFzBmJCQ/640?wx_fmt=png&from=appmsg)image-20240403155359524

构建成功，钉钉机器人也提示了（因为 Github 访问失败的原因，多试了几次）：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmSgssbGNZWD7lsvAzp43b1WRs0He4rLPv3mjkhSlPuH4cevgZStcnbQ/640?wx_fmt=png&from=appmsg)image-20240403155855959

笔者已经配置好了 nginx，因此可以直接访问网页，查看效果：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm3pRc4kN1AhYK8NOSiaB861IN9htiaIh2PWOd5KZW1Km1gaJF43pgNLzw/640?wx_fmt=png&from=appmsg)image-20240403160008179

#### 通过 Git 提交触发构建

目前虽然构建成功了，但是需要手动点击构建，接下来实现如何将代码提交 Git 后自动触发构建。

打开仓库设置 -> Webhooks 添加一个：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmCic1RG2EAethgYxLYdYW6Ssa7yy6ibWPIfEVG9E372E0qVbqbu0HAaibA/640?wx_fmt=png&from=appmsg)image-20240403160353025

这里的 `Payload URL` 就是 Jenkins 地址 + `/github-webhook`，例如笔者的就如图所示。

但是由于笔者的 Jenkins 部署在本地局域网，因此是不行的，Github 肯定是无法访问到笔者的局域网的，有公网地址的读者可以试试，在笔者的阿里云服务器上是没有问题的。所以目前如果是 Github 项目的话，笔者需要提交代码后手动点击 立即构建：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmqpsGbwQnJRQfrgnOBZZfKmVeib4tnwdBUa9W3v8ZiaEw0ubd5ibTPaXtg/640?wx_fmt=png&from=appmsg)image-20240403161026497

### Gitlab 项目

实际上笔者所在公司是在局域网中部署了 Gitlab 的，因此针对 Gitlab 项目的自动化才是核心。

安装 Gitlab 插件：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmJVMRp1UCeo8W5mTD5JQUiaq726PtycVNq3C9oJY1XqnGmYxNRVgughA/640?wx_fmt=png&from=appmsg)image-20240403161442736

安装完毕后重启 Jenkins。

#### 获取 Gitlab token

与 Github 的流程类似，也需要在 Gitlab 中创建一个 token：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmQ5cNx1d5JauoBX5bjNHXG1iamPkFPpE2BF6IkulYYm5Icvg924jA1Ow/640?wx_fmt=png&from=appmsg)image-20240403161807711

创建好之后保存 token 备用。

#### 在 Jenkins 中配置 Gitlab

打开 Jenkins -> 系统管理 -> 系统配置 -> Gitlab

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmdGFIKq1M1YR2YTywWuTXpl7MRaKHcOGwMEXiaVqTe85rAVrt9Qeo4bg/640?wx_fmt=png&from=appmsg)image-20240403162301361

这里需要新建一个`Credentials`，点击下方的添加：

类型选择`GitLab API token`，将刚刚保存的 token 填入到 `API token` 字段中。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmV5en7uy8x91vyFxHvxqiaXaA4g5oDdwN2W24TJsZs2zgmicib7vb4JyvQ/640?wx_fmt=png&from=appmsg)image-20240403162144399

点击`Test Connection`：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm4RE5c7A7mgwPa25HYvcibeibb3ibcn7tRpmiacEMzAIMibDTWqTfVYTemvA/640?wx_fmt=png&from=appmsg)image-20240403162651637

出现`Success`说明配置成功。

#### 创建项目

大多数过程与 Github 项目雷同。

##### General

会多出一个选项，选择刚刚添加的：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmxBg9Qiaiah7EvgxvwnbZfmBbSnabG2TjmZ1X2EqBGLrQX5WNS5naaUHQ/640?wx_fmt=png&from=appmsg)image-20240403163406501

##### 源码管理

Git 仓库地址填 Gitlab 仓库地址，同样会报错，添加一个`Credentials`便可解决：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmmb2kYf6XDYURah24ibuSurbHKLYUMNUZk85GqGicme6Xa7UM6iabNOFqQ/640?wx_fmt=png&from=appmsg)image-20240403163538105

用户名密码填登录 Gitlab 的用户名密码即可。

##### 构建触发器

按需选择触发条件，这里笔者仅选择了提交代码：

这里红框中的 url 需要记下，后面要用。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmtc2M0FJeBiaKY5QMxKhL1u2cJ2gbSdLNcw0fc9JS4NEX7EyAbaKCc7g/640?wx_fmt=png&from=appmsg)image-20240403164252265

#### 其他配置

与 Github 项目相同。

#### 测试构建

点击立即构建，查看是否能构建成功：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmG67ZQjfm6QQZaQ6wchSdSjSDk3ic9AHfwKRgjFxsnpekKibfvD1M01PQ/640?wx_fmt=png&from=appmsg)image-20240403163945821

构建成功：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmfR6icf4njajEhnkQavRu1bY07ibUicgTiaXlFgnNop9ibWTu8t9AJHtS98w/640?wx_fmt=png&from=appmsg)image-20240403164002293

#### 提交代码自动构建

进入 Gitlab 仓库 -> 设置 -> 集成：

这里的 url 填入刚刚 Jenkins 构建触发器 中红框内的 url 地址。

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmcTc3mQf2jFGFibFQzZgMbRLHwPaic9TEgu5h6SwNeJMd3Mbb6a76MQpA/640?wx_fmt=png&from=appmsg)image-20240403164203308

看情况是否开启 SSL verification。

点击 Add webhook：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmjAa8gI6PMmvHBqQD6mqDzkWs6Lqz8V7aWqROHWKma4QxXmCibfqrohA/640?wx_fmt=png&from=appmsg)image-20240403164449921

测试一下：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmaDxmw02rIMQLBBL83kzV48UibokibN1oAJhx8kO4cpEAMsmVWceVzouA/640?wx_fmt=png&from=appmsg)image-20240403164513668

可以看到 Jenkins 那边已经开始构建了：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNm1p1KujD3cNH5mviadVZcbCXQqb5OibobpSNtJicxkzboFWtTicWviacXiasg/640?wx_fmt=png&from=appmsg)image-20240403164551282

构建成功：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmiaoQfMeN3Ayg9F9kv7wDmGZp6rhndpOJ7H3w0uTicqelag8obujicYsbg/640?wx_fmt=png&from=appmsg)image-20240403164606737

#### 测试 Git 提交触发构建

目前页面：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmoXK8bCUpHIzQgyuKgDe1uravDpM0x9ZC5CtAZkGOK58kHgq7LzliaPg/640?wx_fmt=png&from=appmsg)image-20240403164712339

我们将`v2.0-f`改成`v2.0-g`：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmbKakVz3NOibicwzwneSVUtKnibia3pbDFXAvo1q0lXEomeXt9L19E2jf6w/640?wx_fmt=png&from=appmsg)image-20240403164817371

提交代码，Jenkins 开始了自动构建：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmaCx4yIsFa860n78liccX79Yyf3SM9iae8teR74uicujbuicTRpGZ6gD1PA/640?wx_fmt=png&from=appmsg)image-20240403164852625

构建成功，页面也发生了变化：

![](https://mmbiz.qpic.cn/mmbiz_png/lCQLg02gtibvLDmEeH4xUJKIB13zTUiaNmKXwrp4D1lnfI2CQbkx0XLtVZT5wRepXmJkiaDmujZWatxpjzbichgEiaQ/640?wx_fmt=png&from=appmsg)image-20240403164912343

至此，Gitlab 提交代码后自动打包并部署至服务器的流水线就完成了。

后记
--

本文实现了从提交代码到部署上线的自动化工作流，适合小公司的小型项目或自己的演示项目，大公司一定会有更规范更细节的流程，笔者也是从实际需求出发，希望本文能帮助到各位，由于笔者也是第一次使用 Jenkins，如有不足或错误之处，请读者批评指正。