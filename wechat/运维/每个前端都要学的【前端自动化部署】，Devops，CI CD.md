> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/SrM3kBlte1jXkjyRAZef7w)

```
大厂技术  高级前端  Node进阶


点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

DevOps
------

提到 Jenkins，想到的第一个概念就是 CI/CD 在这之前应该再了解一个概念。

DevOps `Development` 和 `Operations` 的组合，是一种方法论，并不特指某种技术或者工具。DevOps 是一种重视 `Dev` 开发人员和 `Ops` 运维人员之间沟通、协作的流程。通过自动化的软件交付，使软件的构建，测试，发布更加的快捷、稳定、可靠。

CI
--

CI 的英文名称是`Continuous Integration`，中文翻译为：持续集成。

试想软件在开发过程中，需要不断的提交，合并进行单元测试和发布测试版本等等，这一过程是痛苦的。**持续集成`CI`是在源代码变更后自动检测、拉取、构建的过程。**

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjUgWoaX19iaGXPicL1Weby6FJ61MpXQu7QIelLx1fLQTK5ube3hxQcQ6A/640?wx_fmt=other)ci.png

CD
--

CD 对应两个概念 持续交付`Continuous Delivery` 持续部署`Continuous Deployment`

### 持续交付

提交交付顾名思义是要拿出点东西的。在 CI 的自动化流程阶段后，运维团队可以快速、轻松地将应用部署到生产环境中或发布给最终使用的用户。

从前端的角度考虑，在某些情况下肯定是不能直接通过自动化的方式将最终的 build 结果直接扔到生产机的。持续交互就是可持续性交付供生产使用的的最终 build。最后通过运维或者后端小伙伴进行部署。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWj1dxmQ3ibicC9JNrSZ9ZghUdpS70B5jp15WVs0pjqErtLFdHDUc9kpXhw/640?wx_fmt=other)cd1.png

### 持续部署

作为持续交付的延伸，持续部署可以自动将应用发布到生产环境。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjZX2rVZLDH53Im9ibjC0CYnweia4kaQke8r3ibmd1PVFke6jNdowRbhB9g/640?wx_fmt=other)cd2.png

Jenkins 安装
----------

> 示例服务器为 阿里云 CentOS 服务器。**安全组中增加 8080 端口 Jenkins 默认占用**

> Jenkins 安装大体分两种方式，一种使用 Docker 另一种则是直接安装，示例选择后者。**不管使用哪种方式安装，最终使用层面都是一样的。** Linux 安装 [1]， Docker 安装 [2]

点击查看 Linux 安装过程

```
# 下载 Jenkins 资源sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat/jenkins.repo# 获取并导入信任 的包制作者的秘钥sudo rpm --import https://pkg.jenkins.io/redhat/jenkins.io.key# 升级 yum 源中的所有包sudo yum upgrade# Jenkins 依赖于 java 所以需要安装 JDKsudo yum install java-11-openjdk# 安装 Jenkinssudo yum install jenkins复制代码

```

如果最终 `Jenkins` 没有找到包而导致没有安装成功，检查第一步和第二部执行结果并重新执行。

可以使用 `systemctl` 命令管理 Jenkins 服务 systemctl[3]

```
# 启动 Jenkins 服务systemctl start jenkins# 重启 Jenkins 服务systemctl restart jenkins# 停止 Jenkins 服务systemctl stop jenkins# 查看 Jenkins 服务状态systemctl status jenkins复制代码

```

启动服务后访问服务器地址 + 8080 端口，Jenkins 默认为 8080 端口。

Jenkins 使用及 Freestyle 任务构建
--------------------------

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjtA7LoPgMwYjia9MPb8vXGnHib4TDBwYHfmu9cKGBia6kST1TJwlqRgmlQ/640?wx_fmt=other)jenkins1.jpg

首次进入使用 `cat /var/lib/jenkins/secrets/initialAdminPassword` 查看密码。

随后进入插件安装页面，暂时安装系统推荐插件即可。

然后创建用户

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjbxXRMHYNSBHFKZkwxaia6EKcE2a2L2Oe9btoCibtdVbfZ8yq2EPDialJg/640?wx_fmt=other)jenkins2.jpg

### 构建目标：拉取 github 代码

点击 **新建 Item** 创建一个 `Freestyle Project`

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjL4JcxCKkO625uMlIGH0jC5APCOMK5F1h7hOibLcpPnQqLpYJoLg433A/640?wx_fmt=other)jenkins3.jpg

在 **源码管理** 处选择 git ，输入仓库地址，点击添加。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjaeiccCLOOq00As1TJhrMs2RE48QbAkzSia9ljtUMsHZdhZ3AmmvEd1RA/640?wx_fmt=other)jenkins4.jpg

输入 github 账号和密码，这里的密码有时候可能会出现问题，可以使用 `token` github 如何生成 token ？[4]

配置只是一方面，同时服务器也要具备 git 环境。 `yum install git`

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjrJkN5yJeEUa9dibbvtOGzxvpheLGQgiaMxqEEicf36jUvQvPhjUcCGiaIg/640?wx_fmt=other)jenkins5.jpg

### 构建目标：部署到本机

部署前端项目肯定是离不开 `nginx` 的。 `yum install nginx`。

安装完成后同样可以使用 `systemctl` 命令管理 `nginx` 服务。

`nginx` 具体配置这里就不说了。本示例项目中，静态文件托管目录为 `/usr/share/nginx/html/dist`。

接着来到 `Jenkins` 这里。想要部署前端项目还需要依赖一个 `Node` 环境，需要在 **Manage Jenkins -> Manage Plugins** 在可选插件中搜索 `nodejs` 选择对应插件进行安装，安装完成后需要重启才会生效。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWj9c1aiagEVZDa3MSQVfEMeYSrMtNJy02495jKicC4Za3TcP1XH03QeIwg/640?wx_fmt=other)jenkins6.jpg

然后到 **系统管理 -> 全局工具配置** 中配置 `Node` (吐槽：没有安装任何插件时系统管理以及其子页面全是英文，安装完插件后又变成了中文。这国际化不知道是系统原因还是它的原因 😂)。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWj9xQ9cVtPfm2vdd6wGqiauqyRMibmSnemtEAp4d8KaFzvxK7sagbI6K3g/640?wx_fmt=other)jenkins7.jpg

随后去修改刚才创建的任务。在 **构建环境** 中会多出一个选项 `Provide Node & npm bin/ folder to PATH` 勾选即可。然后在 **构建** 中选择 **增加构建步骤 -> 执行 shell** 输入打包发布相关的命令。`Jenkins` 会逐行执行。

```
npm install yarn -gyarn installyarn build# 打包 build 后的文件tar -zcvf dist.tar.gz dist/# 删除 build 后的文件rm -rf dist/# 移动 build 后的压缩包到 nginx 托管目录下。sudo mv dist.tar.gz /usr/share/nginx/html# 进入托管目录下cd /usr/share/nginx/html# 解压sudo tar -zxcf dist.tar.gz# 删除压缩包sudo rm -rf dist.tar.gz复制代码

```

*   由于项目构建时是在 `Jenkins` 的工作目录下执行脚本，会出现权限问题。导致即使使用了 `sudo` 还会出现类似以下错误。
    

```
We trust you have received the usual lecture from the local SystemAdministrator. It usually boils down to these three things:    #1) Respect the privacy of others.    #2) Think before you type.    #3) With great power comes great responsibility.复制代码

```

解决方案：在 `/etc/sudoers` 文件中增加 `jenkins ALL=(ALL) NOPASSWD:ALL` 表示在执行 sudo 时不需要输入密码。

*   如果不使用 `sudo` 则会出现以下错误。
    

```
xxxxxxx: Permission denied复制代码

```

解决方案：修改 `/lib/systemed/system/jenkins.service` 文件。将 `User=jenkins` 修改为 `User=root`，表示给 `Jenkins` 赋权限。修改配置文件后记得重启服务。

*   构建的过程中还可能出现以下错误
    

```
ERROR: Error fetching remote repo 'origin'复制代码

```

解决方案：由于需要构建的代码在 `github` 上面，这种错误表示拉取代码失败了，重试几次就可以了。

#### 工作目录

上面提到一个很重要的概念就是 **工作目录** 在上面的 `shell` 默认就是在这里执行的。工作目录是由两部分组成。

*   `/var/lib/jenkins/workspace/` 类似于前缀吧。
    
*   `web-deploy` 这个其实是上面构建任务的名字。
    

总结：`Jenkins` 的执行目录是 `/var/lib/jenkins/workspace/web-deploy`。也就是说输入的每一条命令都是在这里面执行的。（搞清楚定位能避免好多问题，特别是前端的部署，就是打包，移动，解压很容易搞错路径。）

### 构建目标：侦听 git 提交到指定分支进行构建

*   来到 `Jenkins` 中选择 **系统管理 -> 系统配置** 找到 `Jenkins URL` 将其复制。
    
*   随后在尾部添加 `github-webhook/` 尾部斜杠一定不要丢。整体结构大致为 `http://192.168.0.1:8080/github-webhook/`
    
*   登录 `github` 需要集成的项目中添加 `webhook`。在 `Payload URL` 中将上述内容填入。
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjngDR2RHQjj8ypibrS9uxdkF4rtTseKxG2D2hzK98icGmxRrtIRsWiaKTQ/640?wx_fmt=other)jenkins8.jpg

*   然后修改 `Jenkins` 任务配置 **构建触发器中选择 GitHub hook trigger for GITScm polling**
    

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjbvPop2rYbBJUvea6IZ36AVwwTTe3HSRubfCMAptrvZocDibytzw01Cg/640?wx_fmt=other)jenkins9.jpg

由于在上面的**源码管理**中已经指定了`main`分支，此时如果这个分支的代码有改动就会触发自动构建。

### 构建目标：部署到目标主机

> 在真实的开发场景中，`Jenkins` 几乎不会和前端资源放到一个服务器。大多数情况下 `Jenkins` 所处的服务器环境就是一个工具用的服务器，放置了一些公司中常用的工具。因此构建到指定的服务器也至关重要。

1，**系统管理 -> 插件管理** 搜索 `Publish Over SSH` 进行安装。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWj69k5X4dxBRKVcXiaHRv6pia3lELvS6PvDJOUFNmDTkKTQfILhvlJmaEA/640?wx_fmt=other)jenkins10.jpg

2，然后在**系统管理 -> 系统配置**中找到 `Publish over SSH` 点击新增，再点击高级，然后选中 `Use password authentication, or use a different key`

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjN49atwlA71H5ibOKf2AicxWsVEwLHhXhBdlUObaFqia7UdvE6za84pKbw/640?wx_fmt=other)jenkins11.jpg

完成后可点击右下角 `Test Confirguration` 进行测试。

3，继续修改构建任务。先修改原有的构建脚本。因为要发布到远程，所以原有的发布命令要进行去除。

```
npm install yarn -gyarn installyarn build# 只打包，然后删除文件夹。tar -zcvf dist.tar.gz dist/rm -rf dist/复制代码

```

4，选择**构建后操作 -> Send build artifacts over SSH**

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWj5IlyhepmMTpKz8WbHNkpo66e0KzxrgcOZbJ0SxiaLIXvialoaohojXBw/640?wx_fmt=other)jenkins12.jpg

*   `Rransfer Set Source files`：要上传到目标服务器的文件。**它是一个相对路径，相对于 Jenkins 的工作目录** 由于上面的 shell 执行之后在工作目录中只有一个压缩包，so 直接写一个文件名即可。
    
*   `Remove prefix`：去前缀。假设此时打包文件在 `/var/lib/jenkins/workspace/web-deploy/assets/dist.tar.gz`，那么 `Rransfer Set Source files` 则应该为 `assets/dist.tar.gz`，此时 `Remove prefix` 配置为 `assets/` 则可以去除这个前缀，否则会在目标服务中创建 `assets` 。
    
*   `Remote directory`：远程的静态资源托管目录。由于配置服务器默认为 `/`，所以 `usr/share/nginx/html/` 不用以 `/` 开头。
    
*   `Exec command`：远程机执行 `shell`，由于配置服务器默认为 `/`， 所以 **工作目录也是以 `/` 开始**。
    

执行成功后查看执行日志会有类似以下结果：

```
SSH: Connecting from host [iZuf6dwyzch3wm3imzxgqfZ]SSH: Connecting with configuration [aliyun-dev] ...SSH: EXEC: completed after 202 msSSH: Disconnecting configuration [aliyun-dev] ...# 如果 Transferred 0 file 则需要查看配置的路径是否正确。表示文件并没有被移动到远程主机中。SSH: Transferred 1 file(s)Finished: SUCCESS复制代码

```

### 构建目标：钉钉机器人通知

1，**系统管理 -> 插件管理** 搜索 `DingTalk` 进行安装。文档 [5]

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjC2O0cdNjxibB0uxx7p3CiaOvIVtr0Ir1aOdMicL0MDEHwCnIGjuWEGicibQ/640?wx_fmt=other)jenkins13.jpg

2，钉钉群创建机器人。**钉钉群 -> 只能群助手 -> 添加机器人 -> 自定义**

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWj429ehdRB9EH9bnKUseiatEN7RU9cOLn0Jq4qF4DfEPGxaTJ9IOaEF7w/640?wx_fmt=other)ding1.jpg

3，定义机器人名字和关键字，创建完成后先将 `webhook` 中的内容复制。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjAXeSvbFVllYq07kMfvdbsB3jgQtjeToTcP5xYe3Vhyv4BI2ffUh9iaQ/640?wx_fmt=other)ding2.jpg

4，`Jenkins` 中 **系统管理 -> 系统配置 -> 钉钉 -> 新增** 配置完成后可点击右下角进行测试。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjfLdceKqv0EjibdII5MhP7aF0LSVVozcV5aKYd9TChPAiaG5UcKibW9X4Q/640?wx_fmt=other)jenkins14.jpg

5，修改构建任务配置。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjlibH33b4VvCb9qewA6jq3lvJ3YshTnvD4E5bQic5DoDGhTdmCaK5XicbQ/640?wx_fmt=other)jenkins15.jpg

*   通知人：atAll 勾选后 `@` 不到准确的人。😂。输入框内可填写需要被 `@` 人的手机号，多个换行。
    
*   自定义内容：支持 `markdown` 写法，可以使用一些环境变量。`192.168.0.1:8080/env-vars.html/`
    
*   实现默认 `@` 执行人 [6]
    

6，构建成功

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjcqdxz4oOgkibXJO3ERvQKK9uUPqLfhgRNn9OaMtckdBdn9ic0jq3y7eg/640?wx_fmt=other)ding3.jpg

Pipline 构建
----------

上一章节中着重介绍了如何构建 `freestyle` 的任务，但是 `Jenkins` 远不止于此。在本章开始之前强烈建议阅读文档 [7]，重点关注流水线相关内容。

**新建任务 -> 选择流水线** 其他内容可以都不用管，只关注**流水线** 有两种选择，演示就选择第一种。

直接在 `Jenkins` 中书写配置。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjVE0BmaJlArp1IqYGE29sAI99rjk9cia8uLX48chuzZkAicL6QnCHHUkw/640?wx_fmt=other)pipline1.jpg

在项目的 `Jenkinsfile` 配置文件中写配置。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjjuACufZfqAiak9kDhaDyd5SOMDt7KGPQ36PNmdsRunbzY0KQyKCFS8g/640?wx_fmt=other)pipline2.jpg

在正式开始之前应该了解 `Jenkins Pipline` 的基础概念。

```
pipeline {    agent any // 在任何可用的代理上，执行流水线或它的任何阶段。    stages {        stage('Build') { // 定义 "Build" 阶段。            steps {                // 执行与 "Build" 阶段相关的步骤。            }        }        stage('Deploy') { // 定义 "Deploy" 阶段。            steps {                // 执行与 "Deploy" 阶段相关的步骤。            }        }    }}复制代码

```

*   `pipline`：定义流水线整个结构，可以看做是根节点
    
*   `agent`：指示 `Jenkins` 为整个流水线分配一个执行器，比如可以配置 `Docker`
    
*   `stages`：对整个 `CI` 流的包裹，个人认为没多大用，还必须得有。
    
*   `stage`：可以理解为是对某一个环节的描述。注意：参数就是描述内容，可以是任何内容。不要想歪了只能传递 `Build` `Deploy` 这些。
    
*   `steps`：描述了 `stage` 中的步骤，可以存在多个。
    

了解到这里还是不够的。流水线入门 [8] 流水线语法参考 [9]

### Pipline 复刻 Freestyle

这里先直接把配置贴出来。后续结合内容在进行分析。

点击查看完整配置

```
// 自定义 钉钉插件 的 错误信息和成功信息def successText = [    """ ### 新的构建信息，请注意查收""",    """ ${env.JOB_BASE_NAME}任务构建<font color=green>成功</font> ，点击查看[构建任务 #${env.BUILD_NUMBER}](http://106.14.185.47:8080/job/${env.JOB_BASE_NAME}/${env.BUILD_NUMBER}/)"""]def failureText = [    """ ### 新的构建信息，请注意查收""",    """ ${env.JOB_BASE_NAME}任务构建<font color=red>失败</font> ，点击查看[构建任务 #${env.BUILD_NUMBER}](http://106.14.185.47:8080/job/${env.JOB_BASE_NAME}/${env.BUILD_NUMBER}/)"""]// 1，侦听 github push 事件properties([pipelineTriggers([githubPush()])])pipeline {    agent any    // 环境变量定义。    environment {        GIT_REPO = 'http://github.com/vue-ts-vite-temp.git'    }    stages {        // 2，拉取 github 代码，通过 GitSCM 侦听 push 事件。        stage('Pull code') {            steps {                checkout(                    [                        $class: 'GitSCM',                        branches: [[name: '*/main']],                        extensions: [],                        userRemoteConfigs: [                            [                                credentialsId: '381325e4-0f9c-41ea-b5f6-02f8ea2a475a',                                url: env.GIT_REPO                            ]                        ],                        changelog: true,                        poll: true,                    ]                )            }        }        stage('Install and build') {            steps {                // 3，前面安装过的 nodejs 插件使用                nodejs('v14.19.0') {                    sh 'npm install yarn -g'                    sh 'yarn install'                    sh 'yarn build'                }            }        }        stage('Pack') {            steps {                sh 'tar -zcvf dist.tar.gz dist/'                sh 'rm -rf dist/'            }        }        stage('Deploy') {            steps {                // 4，前面下载的 Publish Over SSH 插件的使用                sshPublisher(                    publishers: [                        sshPublisherDesc(                            configName: 'aliyun-dev',                            transfers: [                                sshTransfer(                                    cleanRemote: false,                                    excludes: '',                                    execCommand: '''                                        cd /usr/share/nginx/html/                                        tar -zxvf dist.tar.gz                                        rm -rf dist.tar.gz                                    ''',                                    execTimeout: 120000,                                    flatten: false,                                    makeEmptyDirs: false,                                    noDefaultExcludes: false,                                    patternSeparator: '[, ]+',                                    remoteDirectory: '/usr/share/nginx/html/',                                    remoteDirectorySDF: false,                                    removePrefix: '',                                    sourceFiles: 'dist.tar.gz'                                )                            ],                            usePromotionTimestamp: false,                            useWorkspaceInPromotion: false,                            verbose: false                        )                    ]                )            }        }    }    post {        success {            // 5，DingTalk 插件的使用。            dingtalk (                robot: '1314',                type: 'ACTION_CARD',                title: 'Jenkins构建提醒',                text: successText,                btns: [                    [                        title: '控制台',                        actionUrl: 'http://106.14.185.11:8080/'                    ],                    [                        title: '项目预览',                        actionUrl: 'http://github.com/'                    ],                ],                at: []            )        }        failure {            dingtalk(                robot: '1314',                type: 'ACTION_CARD',                title: 'Jenkins构建提醒',                text: failureText,                btns: [                    [                        title: '控制台',                        actionUrl: 'http://106.14.185.11:8080/'                    ],                    [                        title: '项目预览',                        actionUrl: 'http://github.com/'                    ],                ],                at: []// 这里是手机号多个之间,隔开            )        }    }}复制代码

```

这么多内容手写无疑是很难受的，好在 `Jenkins` 提供了一些帮助工具。访问地址为：`Jenkins`地址 + `/job` + 当前任务 + `/pipeline-syntax/`，例如：`http://localhost:8080/job/dev-deploy/pipeline-syntax/`，或者进入任务构建页面，点击**流水线语法**进入

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjdhYCKwGIpcgYRSVumFibKyibicvpNlejpyWRmUFjSFbwD4m1Do5kiaXlsQ/640?wx_fmt=other)pipline3.jpg

进入该页面后请熟读并背诵以下三项。重点放到第一项。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjggJ59Qlv1Zu5jkibFaqv94XEQDP5bHXwEkN19N6gpx56T9Ilb4Ob5eA/640?wx_fmt=other)pipline4.jpg

回头看上面的脚本注释都带有序号。根据注释序号开始解释。

1，在片段生成器中选择 `properties: Set job properties` 生成代码片段。由于只是使用了 `git hook trigger` 所以要对生成的片段稍作修改。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjvwZZYXJ6XXlKrcE4d40JW9YjvWy9TDh03Ul7Ev8W5FRFcbWkNGbAag/640?wx_fmt=other)pipline5.jpg

2，如果不是为了侦听 `github push` 选择 `git: Git` 即可，但现在应该选择 `checkout: Check out from version control`，随后填写信息生成代码即可。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjHhF6ePYvTQmNbL8m4fjPyUBUORX6a8T6gWTm7wx29hJbibia1T3JQDQQ/640?wx_fmt=other)pipline6.jpg

3，选择 `nodejs: Provide Node & npm bin/folder to Path`

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjQeQ7HJWpv3X1ibOr30PeSkVSicEgNDypOj9W0BiblPPSw0iaM4GwRbHgfQ/640?wx_fmt=other)pipline7.jpg

4，选择 `sshPublisher: Send build artifacts over SSH`，像上面流水线一样配置之后直接生成代码即可。

![](https://mmbiz.qpic.cn/mmbiz_jpg/TZL4BdZpLdiadsl9foUicJul7DI66QMXWjfjMNFcshsicUGhSLrs4HcADUEInUqm1HicCQuFJefP4pwM7ibmUcXemoA/640?wx_fmt=other)pipline8.jpg

5，`DingTalk` 文档

**总结：** 通过插件生成的代码，稍作组合就成为了完整的配置。但整体难度还是要略高于 `Freestyle` 任务。毕竟生成的代码有部分也不是拿来即用的，并且 **Pipline 基本语法一定要有所掌握**。不然生成的代码都不晓得放到哪里合适。

> 作者：65 岁退休 Coder
> 
> 链接：https://juejin.cn/post/7102360505313918983
> 
> 来源：稀土掘金

结语
--

```
Node 社群




我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一波👍

```