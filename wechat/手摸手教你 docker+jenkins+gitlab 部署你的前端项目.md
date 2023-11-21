> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MF041YTTgvRSx1015PVr7w)

大厂技术  高级前端  Node 进阶  

======================

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

> 作者：作曲家种太阳
> 
> 原文：https://juejin.cn/post/6950280074876682276

学习了一周的 CICD, 踩了很多坑, 都是泪, 特此记录一下整个过程, 本次项目产出效果是, git push 的时候自动化直接部署到服务器上, 以下是整个大致流程:

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUXPTJ5cpc2zphb6aUdhEuicnNVbe7JIjHnngOTz7epTvxBmvennZ8xUA/640?wx_fmt=other)

1. 本地代码 push 到 gitlab 2.gitlab 通过 webhook 通知到 jenkins 3.jenkins 拉取 gitlab 仓库代码, 并执行 shell 脚本 4.shell 脚本执行 docker 命令, 打包项目 5. 安装 nginx, 并把打包好的 dist 目录映射到 nginx 代理目录下 6. 部署成功, 访问服务器 ip + 端口号访问你的项目

你所需要准备的:

1.  docker 最基本的知识, 并安装 docker 和 docker-compose
    
2.  linux 最基本命令, 知道私钥公钥生成
    
3.  使用过 git 工具
    
4.  你的前端项目 npm run build 成功
    
5.  你需要一台 ram>1G 的 linux 服务器
    
6.  基本应变能力, 排查 bug 能力
    

1. 使用 docker 安装 jenkins
-----------------------

(1). 创建一个 docker-compose.yml 文件, 放到 / home/work / 文件夹下 (可自定义, 注意逻辑

```
version: '2.0'services:  jenkins:    container_name: 'jenkins'  # 容器名称    image: jenkins/jenkins:lts     #镜像名称    restart: always     #是否重启    user: jenkins:994   #备注1    ports:              #映射端口号      - "10050:8080"      - "50001:50000"      - "10051:10051"    volumes:      - /home/jenkins/data:/var/jenkins_home      - /usr/bin/docker:/usr/bin/docker      - /var/run/docker.sock:/var/run/docker.sock
```

备注 1: 使用 cat /etc/group | grep docker, 我得到的

```
docker:x:994:
```

docker 组名是 994, 所以 user 这里写 jenkins:994 (2).cd /home//work/ 并且 使用 docker-compose up -d 来加载 docker-compose.yml 这时候会生成一个 docker 的容器, 使用 docker logs jenkins 查看 jenkins 容器的日志

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUAUccbuD0PUmufaG8Pkib7pa6F90B4bawYdd3gJQaNC6LpvB6O3oPnNQ/640?wx_fmt=other)

找到这一段代码, 复制出来, 这是等会儿使用 jenkins 的秘钥

ps: 这时候你有可能会见到日志是权限不允许

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUgpFkaQm0yt5piaXxcsUDMiboETV6ic9LHtZJwblOTn3uqjLJ4whD8fgSQ/640?wx_fmt=other)

给宿主机的 / home/jenkins/data 目录一个 777 的权限

输入命令 chmod 777 -R /home/jenkins/data

然后重新执行 docker-compose up -d 并重启 jenkins 容器 (docker restart jenkins)

(3). 开启 jenkins, 浏览器访问 服务器 IP 地址: 10050 第一次访问, 会让你输入刚才 logs 里面的秘钥

2. 配置 gitlab
------------

前提: 你得有一个 ssh 生成的私钥 (id_rsa) 和公钥(id_rsa.pub), 自行百度怎讲么生成 (1).gitlab.com/[1] 上面注册一个账户 (2). 点击右上角设置

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUgGr7MuYa8YVywiam7EMj1LlT8uerqbWv9Ef2gWgia2zy1R0ReM5ljwhA/640?wx_fmt=other)

(3). 找到 ssh 秘钥, 并把公钥粘贴到里面 (一定是公钥)

(4). 创建一个项目, 点击进入项目中, 点击 webhooks

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUrFf45jOvUa8dTibS1q0vMLTt1iah2LoaIQnl12O0WksCsBzSpPb5Oicmw/640?wx_fmt=other) 这里是让输入 jenkins 的 ip 地址 和 加密钥匙, 先不着急输入, 我们马上配置

3. 配置 jenkins
-------------

前提: 你需要自行安装 jenkins 插件 (ssh,gitlab,build parms 插件)

(1). 新建一个 item (2). 进入到项目的配置页面

(3). 填写 shell 自定义变量, 照着上面的填写, 后面填写 shell 脚本时候会用到

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QU1ds80gKDOHze26SqGvGXqFOuksBvg0sIK7F2MwiaiajjbIAR92xXhBKw/640?wx_fmt=other)

(5). 跟着步骤来

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUEQv8ARU68uGBV1pHHcwU3xo4odmBicDYxvoibpKOajf97DfVDmCV95Tw/640?wx_fmt=other)

(6). 第五步点击高级设置按钮后

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUv6WOMLY4nsCTKvoE53dPpJTByORwDibe1F20SKcgIhnVVZy8WskF3Iw/640?wx_fmt=other) ps: 配置页面先不要关闭, 还没有配置 shell 脚本哦

(7) 还记得配置 gitlab 的时候么, 还有 url 和秘钥没有配置, 现在把刚才 copy 的 url 和秘钥复制到 webhooks 当中

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUTMs2HX8uQVjARFmKVpDGXOUIJYnzX72UGyTqIhV18MhAg8H3tfibPJg/640?wx_fmt=other) 这时候下方就会多出来一个 webhooks 的任务, 页面别关, 留着, 继续跟着走 ps: 记得把 ssl 验证给取消

好了, 到这时候, 就打通了 gitlab 到 jenkins 的过程, 进度完成了一大半了, 加油~~~~

4. 创建你的 vue 项目
--------------

前提: 请准备好你的 vue 项目, 并且能确保 npm run build 成功 (1) 在当前目录下面创建 Dockerfile 和. dockerignore 文件

```
# build stageFROM node:10 as build-stageLABEL maintainer="291410026@qq.com"WORKDIR /appCOPY . .RUN npm installRUN npm run build# production stageFROM nginx:stable-alpine as production-stageCOPY --from=build-stage /app/dist /usr/share/nginx/htmlEXPOSE 80CMD ["nginx", "-g", "daemon off;"]
```

大概意思是把文件 copy 到 app 文件目录下, 执行 npm install 和 npm run build, 并且吧生成的 dist 文件移动到 nginx 的代理目录下面, 端口是 80

(2).dockerignore

```
# Dependency directory# https://www.npmjs.org/doc/misc/npm-faq.html#should-i-check-my-node_modules-folder-into-gitnode_modules.DS_Storedist# node-waf configuration.lock-wscript# Compiled binary addons (http://nodejs.org/api/addons.html)build/Release.dockerignoreDockerfile*docker-compose*# Logslogs*.log# Runtime data.idea.vscode*.suo*.ntvs**.njsproj*.sln*.sw*pids*.pid*.seed.git.hg.svn
```

(3). 此时的目录结构是

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUNFmIerDO0icXBD4PkVz9UVv3BEqcvDslj5tM9Xokia0RpeSgpMzTsJ7g/640?wx_fmt=other)

(4). 提交到 gitlab 远程仓库 1. git init 2. git remote add origin ssh 地址 #git 添加远程仓库 3. git add . #代码添加到暂存区 4.git commit -m "testjenins" #提交代码 5. git push origin master #推送代码到远程 master 分支 ps: 可能会有这样的 git 报错

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUCVY0Tnyn80wcZWhFG2TwLx0p5ZUqwnZkYFedZ5GC2JJBfKRMamibX4w/640?wx_fmt=other)

解决方法:segmentfault.com/q/101000000…[2]

ps: 这是一系列 git 操作, 目的是远程推送到创建的 gitlab 仓库当中, 中间遇到的 git 报错需要自己去排查, 实在不行, 你可以借助 gitlab 项目中的 webide 这个功能模拟推送到 master 分支上

5. 配置 shell 脚本
--------------

前言: 这时候我们已经打通了本地代码 ->gitlab-jenkins 的这个环节了, 然后我们编写 shell 脚本执行 docker 语句构建容器并且执行就 OK 了 (1). 在 jenkins 中配置 shell 脚本

```
#!/bin/bashCONTAINER=${container_name}PORT=${port}# build docker imagedocker build --no-cache -t ${image_name}:${tag} .checkDocker() {  RUNNING=$(docker inspect --format="{{ .State.Running }}" $CONTAINER 2>/dev/null)  if [ -z $RUNNING ]; then    echo "$CONTAINER does not exist."    return 1  fi  if [ "$RUNNING" == "false" ]; then    matching=$(docker ps -a --filter=" -q | xargs)    if [ -n $matching ]; then      docker rm $matching    fi    return 2  else    echo "$CONTAINER is running."    matchingStarted=$(docker ps --filter=" -q | xargs)    if [ -n $matchingStarted ]; then      docker stop $matchingStarted      docker rm ${container_name}    fi  fi}checkDocker# run docker imagedocker run -itd --name $CONTAINER -p $PORT:80 ${image_name}:${tag}
```

大概意思是构建 docker 容器, checkDocker 是判断同名的 docker 容器是否存在, 存在就删除. 最后执行 docker 容器并且映射到 port 变量

ps: 还记得我们之前在 jenkins 配置的 shell 变量么, 别忘了一一对应哦

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUMbbiafOdUW2w1FA8JRiaj0LRjVkYVveSF3MhFavRKjCctLw8Aa0syunQ/640?wx_fmt=other)

(2). 保存 jenkins 任务的配置

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUJhKUdIpuyI3vb4uAiaQzicRZPhVuYzGkOvxFuwucIUcRNraiahdZgFcWA/640?wx_fmt=other)

欣赏成果
----

(1). 把本地代码改动后继续推送到远程 gitlab 仓库上 (2). 查看 jenkins 任务的终端输出

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUD33icsX3Fey16QNK2fOw8ZKw88skiatNy770bxkReDz08ZTyDUVEs4mw/640?wx_fmt=other) (4). 看到终端输出 success 后, 浏览器打开项目部署的 url(服务器 IP:port)

![](https://mmbiz.qpic.cn/mmbiz/XP4dRIhZqqWzvnDOQcZwAqia277cGQ7QUhhXZMVCicpprBnv44S6bL2EmLr0iawnBHqicKgbs5cx2TiakzZiabDIia3ZA/640?wx_fmt=other)

项目打开啦, 说明之前我们的辛苦没有白费~

可以继续优化的点
--------

1.  jenkins 构建后发送邮件通知
    
2.  shell 脚本判断端口是否被占用, 如果占用可以随机分配端口并且通知到用户
    
3.  shell 脚本中的 npm install 换成淘宝源可以速度快一些
    

一点点感悟
-----

CICD 这个流程难在比较繁琐, 每个细节都得注意, 当我们学会 docker,shell,linux,jenkins,ssh 公钥私钥配置这方面的知识后, 剩下来的就是把这些串起来, 排故的时候需要耐心, 先跑通整个流程

### 参考资料

[1]

https://gitlab.com/: _https://link.juejin.cn?target=https%3A%2F%2Fgitlab.com%2F_

[2]

https://segmentfault.com/q/1010000002736986: _https://link.juejin.cn?target=https%3A%2F%2Fsegmentfault.com%2Fq%2F1010000002736986_

```
Node 社群








我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：


1. 点个「在看」，让更多人也能看到这篇文章
2. 订阅官方博客 www.inode.club 让我们一起成长



点赞和在看就是最大的支持❤️

```