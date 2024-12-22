> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/eWqZAbCD_HLUwf7fYdtcAQ)

> 本项目代码已开源，具体见：
> 
> 前端工程：vue3-ts-blog-frontend[1]
> 
> 后端工程：express-blog-backend[2]
> 
> 数据库初始化脚本：关注公众号，回复关键字 “博客数据库脚本”，即可获取。

为什么需要容器化
--------

当一个项目越来越复杂时，或者部署的环境越来越复杂时，你可能会考虑使用容器化部署来交付项目。因为你必须要考虑这样一些问题：

*   为什么这个项目在我本地是正常的，部署到生产环境就不正常了？
    
*   生产服务器要部署两个 nodejs 项目，但是这两个项目依赖的 nodejs 版本不一样，怎么办？
    
*   买了一台新的云服务器，把项目从旧服务器迁移过去就跑不起来了......
    
*   服务器部署了两个项目，但是其中一个项目误修改了另一个项目的一些关联文件，导致程序崩溃......
    

这些都是生产实践中会发生的问题，容器化的出现就是为了解决这些问题。

前端开发不懂容器化很正常，因为我们平时工作很难接触到这些。没关系，我们要创造机会让自己学会它，至少要让自己了解它。

简单认识 Docker
-----------

学习容器化肯定离不开 Docker，我们首先要对 Docker 的基础概念有所认识，这些可以去看 Docker 官方文档 [3] 学习，我也花了挺多时间去看文档，这是了解第一手信息最好的方式。

> 我一直推崇通过官方文档学习，因为这几乎就是最权威的资料。有了这些信息，再翻到一些文章或博客时，对一些观点也能有自己的判断力。

*   Image
    
*   Container
    
*   Network
    
*   Volume
    

Image 就是镜像，相当于一个类，或者说是一个模板，Image 是通过 Dockerfile 定义和构建的，Dockerfile 描述了制作 Image 的过程。

Container 是容器，它是基于镜像实例化得到的。容器是天然隔离的，容器包含了运行应用程序所需的所有东西，比如代码、依赖库、环境变量等。

Network 是网络，允许容器之间以及容器与宿主机之间进行通信。

Volume 是数据卷，用于挂载文件，解决容器中文件持久化的问题。

Docker 采用经典的 CS 架构。我们用 Docker Desktop 也好，用命令行也好，都是相当于一个客户端，我们给出的指令，首先会被 Docker daemon 接收，daemon 就是一个监视器进程，相当于一个守门员，所有的指令都要经过它的调度才能被处理，比如镜像操作、容器操作、网络操作、卷操作等等。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrib3DRickDhbdfngKCkeeqjnyZ0VC8rrGKuROwmvlAEyEUKNz09wKwE0Q/640?wx_fmt=png&from=appmsg)image.png

将 Vue 项目做成 Docker 镜像
--------------------

我们在前端上手全栈自动化部署，让你看起来像个 “高手”[4] 这篇文章中提到过，整个项目的部署架构是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrQHnkNicxwNB99eRCUc0RXJtQ5iaqJjuvTEEEllPndBbajoYcXTA0IrfQ/640?wx_fmt=png&from=appmsg)image.png

在我们使用容器化改造全栈博客项目时，可以循序渐进，不必整个前后端全部都容器化，可以先把 Vue 前端部分换掉，也不会影响整个系统架构。我们来试着做一下。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrtkic2pAnic0AIKMib5cib4VgGtruGibxJahEzgw5Gfyia8upsia9NLC1nRHoA/640?wx_fmt=png&from=appmsg)image.png

前端项目一般都会用到框架，需要打包后才能交给服务器部署，所以第一步是打包，打包需要一个 NodeJS 环境。下面就是打包相关的 Dockerfile 配置。

```
# 使用官方Node.js作为基础镜像FROM node:16 as builder# 设置工作目录WORKDIR /app# 首先复制项目的依赖配置文件COPY package.json yarn.lock ./# 安装项目依赖，这一步会生成一个独立的层，并且只有在package.json或yarn.lock变化时才会重新执行RUN yarn install# 接着复制项目所有文件，这一步会生成一个新的层COPY . .# 构建项目，这一步也会生成一个新的层RUN yarn build
```

前端打包后就会得到一堆静态文件，包括 html, js, css, 图片、音频、视频等。

那么怎么让用户访问到网站的这些前端资源呢？这就需要一个 Web 服务器。

Nginx 就可以充当这个 Web 服务器，最后需要把端口暴露出去，并且安全组要放行该端口，不然是没法通过网络访问的。

```
# 使用Nginx镜像来运行构建好的项目FROM nginx:latest# 将构建好的项目复制到Nginx镜像的/usr/share/nginx/html目录下COPY --from=builder /app/dist/ /usr/share/nginx/html# 暴露端口EXPOSE 80
```

整合上面的 Dockerfile 后，我们就可以执行打镜像的命令了。

```
docker build -t vue3-ts-blog-frontend .
```

最后的`.`号代表上下文路径，Docker 会在这个路径下寻找 Dockerfile 及其他文件，根据 Dockerfile 配置打镜像。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrohC5kvSHwSlae9sCqZ8E3kP6yDUwBZM9INJFTO9XO7Dia5iczkuDZ8PA/640?wx_fmt=png&from=appmsg)image.png

打镜像成功后，可以在本地运行一下这个镜像进行验证。

```
docker run -dp 3000:80 vue3-ts-blog-frontend
```

`3000:80`代表把宿主机的 3000 端口转发到容器的 80 端口，`vue3-ts-blog-frontend`则是我们刚才打出的镜像的名字。

接着我们打开`http://localhost:3000`访问，发现前端界面显示出来了，但是接口访问是 404。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrsKMf5vsYC6tLYDbl5QwK3ia64Fic0zmjdsX8OiaOIS1kpMl2ecGdyr1gw/640?wx_fmt=png&from=appmsg)image.png

而且可以看到，接口的访问路径是这样的：

```
http://localhost:3000/article/page?pageNo=1&pageSize=6
```

按道理应该有`/api`前缀的，因为我们用环境变量配置了 axios 的 baseURL。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrrpMqwXtHHnlsz1ooz3fOJaAzHT0c6d4NTh4dRJzepMXBV2ZqasFhfA/640?wx_fmt=png&from=appmsg)image.png

我们知道，webpack 在打包阶段会将`process.env.VUE_APP_BASE_API`的值替换成对应的字符串。本地 yarn build 会得到这样的结果。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrichpMUmQUzib9aaibLwPt1ZtxZwwQoQY12HsHW30icJPuS128f97uoK33Q/640?wx_fmt=png&from=appmsg)image.png

这说明是镜像构建的时候出了问题，导致`VUE_APP_BASE_API`没生效。我看了一下容器运行时的文件，找到了对应的 js 文件，发现这个对象里压根没有`VUE_APP_BASE_API`。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrDgaTtYB9JBiaicHlQvw9cybotXKV0IQSqyvuWpjQCaXCFxbZ3E6Iicicbw/640?wx_fmt=png&from=appmsg)image.png

最后费了老大劲发现是 docker 默认模板生成的 .dockerignore 文件把我给坑了，它忽略了 .env，这就导致了打包时找不到 VUE_APP_BASE_API 这个环境变量，真是服了！

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrA1ic8AqnftzV9sQ3t2T4HJxWAgvpEl6VhBaCD1BGyTJeKMWL4iau2NdQ/640?wx_fmt=png&from=appmsg)image.png

修改 .dockerignore 之后重新打镜像，运行容器，/api 的访问路径也正常了。虽然 /api 访问得到的结果是 404 Not Found，但是路径已经对了。后端服务是 404 可以先不管，后面用 nginx 转发一下就行。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrcyN5gXjmQ965zrDyoJ3Pwk4m4XqVPdmULUtFiamuLuRpiasz7evmVXAw/640?wx_fmt=png&from=appmsg)image.png

此时我们还要做一点事情，那就是 404 的 fallback 处理，这个需要通过 nginx 的 try_files 配置实现。

如果不做任何处理，随便输入一个不存在的路由会被 nginx 返回 404，这是 nginx 默认的 404 页面。但是我们通常希望如果用户随便输入一个路由，应该给一个友好的 404 界面，这个工作可以由 nginx 承接，我们可以修改 nginx 默认的 404 页面；这个工作也可以由前端来承接，将流量转发到前端即可，再由前端路由到 /404。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrpAsSJLMxgKjicYAp5GKg61ehJ2mhhkEhDWVg9xBdjyicdey5O9p2TAxg/640?wx_fmt=png&from=appmsg)image.png

想要让 /not-found-route 这种找不到的路由最终能被前端处理，就需要一个 try_files 配置。

如果要给 nginx 配置 try_files，就需要覆盖 nginx 镜像的 /etc/nginx/conf.d/default.conf 文件，我们给 Dockerfile 新增一条 COPY 指令。

```
# 复制自定义的Nginx配置到镜像中，覆盖默认配置COPY nginx/default.conf /etc/nginx/conf.d/default.conf
```

接着我们在项目中新建一个 `nginx/default.conf` 文件，配置内容也很简单。

```
server {    listen 80;    root /usr/share/nginx/html;    index index.html;    location / {        try_files $uri $uri/ /index.html;    }}
```

有了 try_files 配置后，无法匹配 nginx 路由的请求就会被转到 index.html，这个 index.html 自然就是 Vue 项目的入口。如果项目中 vue-router 配置了`pathMatch`，就能将未被定义的路由重定向到 /404 路由。

```
// 匹配任意路径const FALLBACK_ROUTE = {    name: "Fallback",    path: "/:pathMatch(.*)*",    redirect: "/404",}
```

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrc6fl1LT1Gq16qjD5pDwWT7Wdk13NdCDRDuic3VTRnP3Rumc1gzuO0AQ/640?wx_fmt=png&from=appmsg)image.png

此时这个镜像的准备工作就算是完成了，可以重新打包镜像。

```
docker build -t vue3-ts-blog-frontend .
```

此时可能有朋友脑子里还记得接口访问 404 的问题，没关系，这个会在镜像部署到服务器后解决。我们先接着往下看，不着急。

私有镜像仓库的使用
---------

镜像打好了之后，总得有个地方把它存起来，然后服务器上才能去拉取这个镜像进行部署，这就是镜像仓库做的事情。

镜像仓库有私有的，也有公开的，对于个人项目，我们通常希望使用私有镜像仓库。但是 DockerHub 官方对于未付费用户进行了限制，对单账号只提供一个私有仓库名额，这显然是不够用的。

DockerHub 上有一个 registry 镜像，就是用来搭建镜像仓库的。后续抽空单独出一篇文章分享一下如何用这个 registry 镜像搭建一个私有 Docker Registry。

既然先不着急搭建私有镜像仓库，我们就寻找一个免费的可靠的私有镜像仓库提供商，aliyun 就提供了这个能力。

我们打开 aliyun 控制台，在容器 - 容器服务这里有个容器镜像服务 ACR，我们打开它。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicr7TnLWw1TDJXOx7z7EnAzNhYja3a3SSZ2DaqwsxoSiaygjE2MVibyeqWg/640?wx_fmt=png&from=appmsg)image.png

目前，aliyun 对个人用户提供了 300 个仓库的免费额度，这完全是够用的，我们用它来搭建自己的私有镜像仓库完全足够！

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrJqWMKLHf45eNjgMxMfJskvDibYFdTm7iae6Nf3ibvJWbcSH4uaUkRzJWA/640?wx_fmt=png&from=appmsg)image.png

我们按照指引创建命名空间和仓库后，就可以进入仓库查看了，这里提供了登录 registry、推拉镜像的所有命令示例，操作起来非常简单。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrytNaviaYATnFfnIjnpy9vv1gWriaH65OwRT2wGfickrGqI2c1ZyOKS9hw/640?wx_fmt=png&from=appmsg)image.png

私有镜像仓库都是要先登录才能使用的，我们先用 docker login 登录 aliyun registry。

```
docker login --username=itaobao8023 registry.cn-hangzhou.aliyuncs.com
Password: 
Login Succeeded
```

然后使用 docker tag 给前端项目打一个 aliyun registry 专属的 tag。

```
docker tag vue3-ts-blog-frontend registry.cn-hangzhou.aliyuncs.com/tusi_personal/blog:2.0.4
```

接着就可以使用 docker push 推送镜像了。

```
docker push registry.cn-hangzhou.aliyuncs.com/tusi_personal/blog:2.0.4
```

服务器部署改造
-------

接着我们来到服务器，在服务器上拉取这个镜像。当然在服务器上也要先登录，才能 pull 镜像，我们先执行上面的 docker login 操作。

接着进行 pull 操作拉取镜像。

```
docker pull registry.cn-hangzhou.aliyuncs.com/tusi_personal/blog:2.0.4
```

镜像拉取成功后，通过 docker run 把容器跑起来。

```
docker run -dp 3000:80 registry.cn-hangzhou.aliyuncs.com/tusi_personal/blog:2.0.4
```

容器的 80 端口映射到了宿主机器的 3000 端口，此时可以通过 curl 测试一下可访问性。

```
curl localhost:3000
```

如果能看到下面的结果，说明容器运行没有异常。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrk6mRJElmIb8UhHhPvKnyjJ8SMxEVL3mg8aGejQgLnSRBhhpAFDut3Q/640?wx_fmt=png&from=appmsg)image.png

不过此时仅仅是把 Vue 项目的 nginx 容器跑起来了，整个博客项目的部署架构还没有调整呢。我们再回顾一下这张部署架构图，然后思考一下怎么改造它。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrQHnkNicxwNB99eRCUc0RXJtQ5iaqJjuvTEEEllPndBbajoYcXTA0IrfQ/640?wx_fmt=png&from=appmsg)image.png

我们知道，整个博客是通过 nginx 接入的，/api 和 /socket.io 前缀的流量会转发到 express backend 服务，其余流量会到 /usr/share/nginx/html/vue3-ts-blog-frontend 这个目录下，也就是访问前端的静态资源文件。我们要改变这个行为，让除 /api 和 /socket.io 之外的流量全部转发到我们的前端容器中，这个容器目前是通过 3000 端口访问的。

> /api 是用来访问后端 API 接口的，/socket.io 开头的请求是 Socket.IO 相关的。这些都不是前端的范畴，所以要转发到后端。

按照这个部署逻辑，我们修改一下 nginx 配置文件。

```
server {    listen 80 default_server;    server_name _;    return 403;}server {    listen       80;    server_name  blog.wbjiang.cn;    rewrite ^(.*)$ https://$server_name$1 permanent;}#博客httpsserver {    listen 443 ssl http2;    server_name blog.wbjiang.cn;    ssl_certificate  /etc/nginx/cert/blog.wbjiang.cn.pem;    ssl_certificate_key  /etc/nginx/cert/blog.wbjiang.cn.key;    ssl_session_timeout 5m;    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;    ssl_prefer_server_ciphers on;    location / {        proxy_pass http://localhost:3000;        proxy_set_header Host $host;        proxy_set_header X-Real-IP $remote_addr;        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;        proxy_set_header X-Forwarded-Proto $scheme;    }    #api转发    location /api {        proxy_pass http://blog_pool;        proxy_http_version 1.1;        proxy_set_header Host $host;        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;        rewrite ^/api/(.*)$ /$1 break;    }    #websocket转发    location /socket.io {        proxy_pass http://blog_pool;        proxy_http_version 1.1;        proxy_set_header Host $host;        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;        proxy_set_header Upgrade $http_upgrade;        proxy_set_header Connection "upgrade";    }}
```

注意上面的 location / 规则，它就是把默认流量转发到了 localhost:3000，也就是我们用 docker 运行的前端 nginx 容器。这样一来，整个系统的部署架构就变成了下面这样。

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicron8t6zpTJlADGxFKJ2hIZpNBt6icjxIChPLjmdpk5evbyzMI5Lbh7iaA/640?wx_fmt=png&from=appmsg)image.png

最后只需要重启 nginx 服务即可。

```
nginx -s reload
```

小结
--

我们希望在本项目中学习 docker 的使用，但是又不希望破坏整个系统的部署架构，因此做了这样的设计，只针对 vue 前端部分采用了 docker 部署方式。通过实践，我们学会了如何使用 docker 制作镜像、运行容器、上传镜像，也学会了怎么使用私有镜像仓库，最终在完全兼容的前提下成功改造了系统的部署方式。不过，我们还仅仅是跑通了部署流程，未曾修改 CI/CD 配置，这个后续再做分享。

![](https://mmbiz.qpic.cn/mmbiz/lolOWBY1tkwGx9LrcpgdbPjr3vn48gicrzBrMCHJc2CKO5r9EoqRodl6WIgDN919EslWmRUmSuX2wicMLCZjQ6BA/640?wx_fmt=other&from=appmsg)

*   开源地址：vue3-ts-blog-frontend[1]
    
*   专栏导航：Vue3+TS+Node 打造个人博客（总览篇）[5]
    

参考资料

[1]

vue3-ts-blog-frontend: https://github.com/cumt-robin/vue3-ts-blog-frontend

[2]

express-blog-backend: https://github.com/cumt-robin/express-blog-backend

[3]

Docker 官方文档: https://docs.docker.com/

[4]

前端上手全栈自动化部署，让你看起来像个 “高手”: https://juejin.cn/post/7373488886461431860

[5]

Vue3+TS+Node 打造个人博客（总览篇）: https://juejin.cn/post/7066966456638013477

  

_END_

  

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXzzPpciaorRnwicnXYBiaSzdB4Hh2ueW2a09xqAztoX9iayLyibTyoicltC7g/640?wx_fmt=png)

  

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)