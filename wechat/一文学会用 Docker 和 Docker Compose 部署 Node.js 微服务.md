> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/v3hskC0YEzNiNf4U1FI0Mw)

后端业务逻辑一般比较复杂，全堆在一个 http 服务里不太现实，所以基本都会用微服务架构来开发了。

比如这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkGfRjd9OcNicdarcznibNovxVlD6sRJ6RynLcsahJsechDfSNAHK8SHicw/640?wx_fmt=png)

把不同模块的业务逻辑拆分到不同微服务里，然后它们和主服务通过 tcp 通信，最终由主服务返回 http 响应。

比如我用 nest 开发的一个微服务项目（具体开发过程见[上篇文章](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247494957&idx=1&sn=0f98fa73d9752b28b3593c6808796b83&chksm=cf032216f874ab0013f179f22a3d89c81bbab39f5faa297b2aab83e10dcf97f3cada9e0358ff&token=2079794489&lang=zh_CN&scene=21#wechat_redirect)）：

两个微服务分别监听了 8888 端口和 9999 端口：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTknzxxLrbMrLGUbwY7v3sVd0WYKMCQGFpYwdGUgSbicHy3DVUsbaamXVQ/640?wx_fmt=png)

用 yarn start 把它们跑起来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkNwfcp6KEEdAq4j1rOPwQClkzic6N1iaxNZQxVlKN31Bj1iabhcoHzaTCQ/640?wx_fmt=png)

主服务里注册了这两个微服务：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkxZn5b6icic0dz7spnhkQNjrBhngtWoSmfUUtBO5RWzz5XGOXsxkMAY0w/640?wx_fmt=png)

它监听了 3000 端口，同样用 yarn start 把它跑起来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkqPkHkwd4ib4IBYTIXOo3eQ7UY2X1ibHngyxeREiaUvrVH3l9uYoCX2SxA/640?wx_fmt=png)

计算的微服务里有一个求和的逻辑：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTktHZPl4Ab3Lr5PEBiccPc0tUND2JBrPA27qA17MTnXcsJIUEEKr8KYDQ/640?wx_fmt=png)

日志的微服务里有一个打印日志的逻辑：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkvQbe2RUTmurblJBwWfia1QGZxMWrjFvQlm235SyiblaciaqKtnALScKNQ/640?wx_fmt=png)

主服务里接受参数，然后把它传给两个微服务：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkvYm4zDIVELzFreHFs6xqE2gk6edKvPDHIIbB9RPv7vy3iaviaiaAoDHog/640?wx_fmt=png)

跑起来效果是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTk9BbFe5vI1AdtJjQrOvdUtbrH6icBzxNoBD39hyfom8800ghdKTsUvVw/640?wx_fmt=png)

返回的是求和的结果，并且日志微服务做了打印：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTk6Adpqwk1RvRvicO5ub2Lpdc6zzjzWhCkLUvWvKAr4UoqQ7HdEnnsWBA/640?wx_fmt=png)

这说明微服务和 http 服务开发成功了。

那问题来了，开发完以后怎么部署到线上呢？

其实部署过程说起来也简单，就是执行 npm run build，然后把产物 dist 目录放到服务器上。

比如这个：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkeA3Fem3M2mLqwhAEIcibCEclqkbZGWf7TMTiaLMpaKcXSoM2Gds37yicw/640?wx_fmt=png)

然后用 node 跑起来：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkPIZnicqibscplMcywe0b1hibc7GVMNFJqqaSWjC6f2cf47yVicwj1tyQCg/640?wx_fmt=png)

但一般我们不会直接这么搞，而是会使用 docker 来做，因为这样手动搞的话每个服务都要这样来一次，太麻烦了，而且容易出错。

docker 可以通过 Dockerfile 把构建和运行流程封装起来，还可以把运行环境也封装到镜像里，这样每次部署只需要重新构建镜像，然后服务器把镜像拉下来跑就行。

比如 main 服务的 Dockerfile 我们会这么写：

```
FROM node:alpine as developmentWORKDIR /usr/appCOPY package.json ./RUN npm installCOPY . .RUN npm run buildFROM node:alpine as productionWORKDIR /usr/appCOPY package.json ./RUN npm install --only=productionCOPY . .COPY --from=development /usr/app/dist ./distCMD ["node", "dist/main.js"]
```

一行行来看：

```
FROM node:alpine as development
```

这一行是继承 node 基础镜像的意思，as 后面是给它起个名字。

```
WORKDIR /usr/app
```

把容器内的当前目录设置为 /user/app

```
COPY package.json ./
```

把宿主机的 package.json 复制到容器当前目录，也就是 /user/app 下。

```
RUN npm install
```

package.json 复制过去了，自然就可以在容器内安装依赖了。

```
COPY . .
```

然后再把其余的内容都复制过去。

这里可以加个 .dockerignore 文件来排除 node_modules 的复制

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkoHIsYIneO4skjiaDn0M8xuggkKLSR7KCRaToB2r9jkFibia4IkcscicMFw/640?wx_fmt=png)

```
RUN npm run build
```

复制完之后执行 npm run build，就在容器内生成了 dist 目录。

```
FROM node:alpine as production
```

为啥用重新创建了个镜像呢？

这是因为 build 完之后我们就只需要 dist 目录了，其余的源码啥的都不需要，自然可以在一个新容器里，然后把上个容器的 dist 目录复制过去。

```
WORKDIR /usr/app

COPY package.json ./

RUN npm install --only=production

COPY . .
```

然后同样是设置当前目录，复制 package.json，执行 npm install，然后复制其它文件。

这里 npm install 加个 --only=production 可以只安装 dependecies 下的包。

怎么复制呢？还记得我们 as 后面指定了一个名字么，就通过那个来指定从上个容器复制：

```
COPY --from=development /usr/app/dist ./dist
```

其实这种叫做分阶段构建，不然你要写两个 Dockerfile 才行。

最后指定容器运行起来的时候执行的命令，也就是 node dist/main.js 把这个服务跑起来：

```
CMD ["node", "dist/main.js"]
```

有了这个 Dockerfile 就可以通过 docker build 命令生成 docker 镜像了：

```
docker build -t main-app .
```

这行命令的意思就是从 . 目录下的 Dockerfile 来构建一个 docker 镜像，名字是 main-app。

它会一层层构建，我们刚好 14 行命令：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkrWwvFj7nQZYsj8gwPAHqfg4BG7j1Vf6UnibxsRgJTcm9YeDRRibNXZsA/640?wx_fmt=png)

构建完可以看到这个镜像的 hash。

当然，在 docker desktop 里也可以看到：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkGvQ2nLonU13lVK1V887EjT9OgKibw0yfeL7aoyaZN7APwaQzEIujunA/640?wx_fmt=png)

这里用到的 docker desktop 从官网下载就行：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkLCq4VG5SfmFMnsgh0yCZz7Z7fZ3tE6D61T0FMLsXORhmODCAreEwQw/640?wx_fmt=png)

它除了会安装 docker 桌面端以外，也会同时安装 docker 和 docker-compose。

然后把它跑起来：

```
docker run -p 3000:3000 main-app
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkEIzt7HT0iaLVXibwQyKAdnmQ11ianrsebKzVgU35G6lpmWSs9HTlyAR0g/640?wx_fmt=png)

-p 是端口映射的意思，也就是把宿主机的 3000 端口映射到容器的 3000 端口，这样宿主机就可以访问 3000 端口的 http 服务了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkk9cDibINzGtF8CKIrHgnaecnvPRjjmxvRTkjouicLVfbcUwZJzWyibK6Q/640?wx_fmt=png)

确实可以访问，只不过报了 500，因为两个微服务还没起嘛。

然后我们写下 log 微服务的 DockerFile：

```
FROM node:alpine As developmentWORKDIR /usr/appCOPY package.json ./RUN npm installCOPY . .RUN npm run buildFROM node:alpine as productionWORKDIR /usr/appCOPY package.json ./RUN npm install --only=productionCOPY . .COPY --from=development /usr/app/dist ./distCMD ["node", "dist/main.js"]
```

一毛一样，就不解释了。

然后执行

```
docker build -t ms-log .
```

同样，是用当前目录的 Dockerfile 构建一个名字为 ms-log 的镜像：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkicjplzBSVVT6jj9Tptc3A8RZqFEu1FRhgKWibYicWqQn7sibv6glxWwxVg/640?wx_fmt=png)

然后用

```
docker run -p 9999:9999 ms-log
```

把这个容器跑起来，映射容器内的 9999 端口到宿主机的 9999 端口。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkxiba5ibIynibeLLSQC6AKicMxsBpZNp4qfJkthu7qgksnkfgyCibPEl9USw/640?wx_fmt=png)

还有一个计算微服务，我们同样这么搞，就不展开了。

这时候你就可以在 docker desktop 里面看到这三个 image（镜像）：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkTyQMibkZLPfr4xO761EtdCkP3PUibceUAZ6mWtlY8FdRtbPy1mGrGfvw/640?wx_fmt=png)

还有它们仨跑起来的 container（容器）：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkjoB5BrnpGyiaYCE1G5ibgqrsHLsRLoKd2BDbLvQxKDXyZDLcCPHn6JdQ/640?wx_fmt=png)

这时候你浏览器访问一下 locahost:3000

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkhZDdrdAib8ahOLrsFcX6MpTQAnujzKAbyic2LHsNtLwGzr2y1HpR4Q0Q/640?wx_fmt=png)

你就会发现返回了计算的结果，日志微服务容器内也打印了日志：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTk6j0uszAL4MuMvqia68lG9ljib18GYmPuWZQj3icgyuMSzKicufql8eA46w/640?wx_fmt=png)

在 docker desktop 里看更方便一些：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkuVqbiaKIp5e4Dh5h8ztW2F1p2gd6VKPTl2Yic3iaMFDVLUQuVSs37KSVA/640?wx_fmt=gif)

至此，我们 docker 部署 node 微服务就成功了！

其实有一点比较重要的我前面没说，这里提一下：

两个微服务要起服务的时候要指定 0.0.0.0 这个 ip：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkRyshnleOmgib3IvIhwpTtq6sWt3sY30mAhEKVPJCNeuIPwQnZbyONnA/640?wx_fmt=png)

这涉及到 0.0.0.0 和 127.0.0.1 的区别：

127.0.0.1 和 localhost 一样，都是只本机地址。

0.0.0.0 不是一个 ip 地址，它指代的是本地所有网卡的 ip。

这里如果用默认的 localhost，那服务只在容器内生效，要指定 0.0.0.0 才行。

再就是主服务里访问这两个微服务的时候要用宿主机 ip 地址访问：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTklXBwJ0SvRP8ESP0FwmV0GQCawnp8c7cdA6pPF8GXUYYIsESkpGDIew/640?wx_fmt=png)

同样是因为访问的是宿主机的 ip 的那个服务。

有的同学可能会问，跑三个就执行三次 docker build 和 docker run，也太麻烦了吧，要是我有 10 个微服务，之间还有先后顺序的要求呢？

没错，这样确实比较麻烦，所以有了 docker compose。

这个也是 docker 自带的工具。

我们在根目录写这样一个 docker-compose.yml 的文件：

```
services:  main-app:    build:      context: ./main-app      dockerfile: ./Dockerfile    depends_on:      - ms-calc      - ms-log      - rabbitmq    ports:      - '3000:3000'  ms-calc:    build:      context: ./micro-service-calc      dockerfile: ./Dockerfile    ports:      - '8888:8888'  ms-log:    build:      context: ./micro-service-log      dockerfile: ./Dockerfile    ports:      - '9999:9999'  rabbitmq:    image: rabbitmq    ports:      - '5672:5672'
```

这个还是比较容易看懂的。

分别指定了 main-app、ms-calc、ms-log、rabbitmq 的 dockerfile 的地址以及端口映射。

而且通过 depends 指定了先后顺序。

这样只要跑一次 docker-compose up 就可以把它们全部跑起来。

（rabbitmq 那个只是用来测试的，其实没用到）

特别要注意 context 的配置，这个是指定路径的基础目录的，比如这个 package.json：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkOL9NMkbmtyZ108HVpibbND3BmJXpknUHefsqPMUr98ZvmziaaC6DXKWA/640?wx_fmt=png)

加上 context: ./micro-service-log 那就是 ./micro-service-log/package.json。

不加找不到路径。

我们把那 3 个容器停掉：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkvnVFZUamu1dtsJTHCBcQLudPicibs6k127NfZL3c0gDgQFyamKaKvumg/640?wx_fmt=png)

执行

```
docker-compose up
```

跑起来是这样的：![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkP47qktH6y2iajlmGMbUK8YNx1m61pRcib7ghzh86fzHFT69th4jh1ticQ/640?wx_fmt=png)

上面都是 rabbitmq 这个容器的日志。

我们访问下 localhost:3000

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkFdtTZ0SicxKgicuxibv6ArGJ0njU10J306eOXr1CZicseCLYnrHIwMZeCQ/640?wx_fmt=png)

可以看到 main-app 和 ms-log 的日志：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTknHb6RpO6sbXwM3IKd5QdqNrDdR4bUR1KwzNsIPbW7yoczTYTvsBHibw/640?wx_fmt=png)

这是因为 docker-compose 把终端合并了，加了个前缀来区分。

在 docker desktop 也可以看到新跑起来的 4 个容器：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGgBBmGVoPS4PPS5DYFApfTkibr1SOeSLricJwGiazkwbDianKY5Vkic27cGMsveVicsnP4G1pz5eKgbiadaA/640?wx_fmt=png)

这样 3 个 node 服务就都跑起来了。感受到 docker compose 的好处了么？

它可以批量创建一批容器，并且指定顺序、参数之类的，也就是容器编排。

总结
--

我们分别用 docker 和 docker compose 实现了 Node.js 的微服务部署。

dockerfile 里指定宿主机文件到容器内的复制，npm install 以及把 node 服务跑起来的逻辑。

可以使用分阶段构建功能来优化，也就是 from 的时候通过 as 指定一个名字，然后之后再一个 from 重新创建镜像，这时可以从上个镜像里复制文件。

之后执行 docker build 根据 Dockerfile 构建镜像，通过 docker run -p 宿主机端口: 容器内端口 把镜像跑起来。

可以通过 docker desktop 来管理，更方便一些。

这里涉及到的 ip 要指定 0.0.0.0 或者具体的宿主机 ip 才行，要注意一下。

但这样三个服务就要跑 3 次 docker 镜像，比较麻烦。

可以用 docker-compose 来做容器编排，指定容器的 dockerfile、启动顺序等等。

这就是用 Docker 或者 Docker Compose 部署 node 微服务的方式，你学会了么？