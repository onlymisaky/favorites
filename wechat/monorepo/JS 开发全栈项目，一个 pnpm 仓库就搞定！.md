> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QTOTZC8E2PpNOfkd6RIrpw)

> 本项目代码已开源，具体见：fullstack-blog[1]
> 
> 数据库初始化脚本：关注公众号，回复关键字 “博客数据库脚本”，即可获取。

前言
--

当前，这个全栈博客项目已经改为了 pnpm monorepo 架构，前端和后端代码都在同一个代码仓中，无论是否使用 docker compose 都可以做到一键启动，一键 build 等，开发体验较好。当然，这只是 monorepo 的其中一个优点。

我们采用的是前后端分离架构，在未改用 pnpm monorepo 架构之前，前后端代码是独立的工程。在开发环境下，我们在后端工程 [2] 目录下通过命令`npm start`启动 PM2 开发服务，在前端工程目录 [3] 下通过命令`yarn serve`启动 Vue CLI 开发服务，开发服务中有 devServer 类的配置，其中有 proxy 将接口请求路径反向代理到后端服务，然后就可以开发联调了。

然而，这种体验仍然是割裂的。我们虽然推崇在技术架构上将前后端做一个分离解耦，但这并不是说它们不是一个整体。特别是在采用容器化部署时，各个环境变量，端口关系都要作为一个整体来看待，避免由于配置分散导致的不一致问题。

不过，仅仅从文字上描述还是过于生硬，具体还是得从实践中去感受和发现问题。

具体改造
----

### 项目初始化

使用`pnpm init`就可以创建一个初始项目，接着我们要新建一个`pnpm-workspace.yaml`以搭建起 monorepo 的雏形。这里主要是声明`packages`，用于表明工作空间的哪些目录下存放着我们的包。一个包可以理解为一个子项目工程，也可以理解为一个 library。按照惯例，可以将所有的包的放在 packages 目录下。如果你希望将项目和 library 区分开，通常可以设置 app 和 packages 两个目录，app 下放置各个子项目，packages 下放置各个库。

```
packages:  - "packages/*"  - "app/*"
```

接着我们把原来独立的前后端工程分别迁入到 app 目录下，其中 frontend 是前端工程，backend 是后端工程。

```
├─app│  ├─frontend│  ├─backend
```

当然，命名是比较随意的，你完全可以按照自己的喜好来命名。以本项目为例，由于项目中会采用 vue, react 等不同技术实现前端，我会以技术栈的特征来命名。

```
├─app│  ├─webpack-vue3│  ├─vite-vue3│  ├─cra-react18│  ├─express-server
```

其中前三个都是前端的实现，采用了不同的前端框架。第四个就是后端的实现，目前仅仅实现了 express.js 版本。

### lock 文件的变化

采用 pnpm monorepo 架构后，一个显著的特点是 lock 文件的变化。使用独立仓库时，各个项目仓库都有自己的 lock 文件；而现在，依赖版本信息都统一由工程根目录下的 pnpm-lock.yaml 来管理。

### workspace 协议

pnpm 有着完善的 workspace 协议支持，你可以通过`workspace:`来引用`pnpm-workspace.yaml`文件下囊括的各个包。

以本项目为例，我们将公共的一些 eslint 配置提取到了`packages/eslint-config`这个目录下，包名定义为`@fullstack-blog/eslint-config`。接着在各个子项目下都可以引用这个包，不用特意去声明这个包的版本号。举例如下：

```
"@fullstack-blog/eslint-config": "workspace:^"
```

这仅仅是以 eslint 公共配置为例进行说明，如果你的项目中各个子项目下有很多重复的逻辑，可以提取出 utils, hooks 之类的子包进行复用。

### 更便捷的脚本

在使用前后端独立工程开发时，我们需要分别在前端和后端的工程下去运行开发脚本，然后进行开发。使用 pnpm monorepo 后，我们可以在前后端项目提供 dev 或者 serve 命令作为开发脚本，然后在根目录下的 packages.json 中定义一键启动前后端服务的脚本，比如：

```
"fullstack:dev": "pnpm --filter vite-vue3 --filter express-server dev"
```

这个脚本通过 pnpm 的 --filter 选项筛选出要执行 dev 命令的前后端工程，批量启动对应的开发服务。

### 容器化的考量

在前面的章节里，我们学会了怎么使用 Docker 运行前后端项目，具体可以参考下面这些文章。

*   [前端不懂 Docker ？先用它换掉常规的 Vue 项目部署方式](https://mp.weixin.qq.com/s?__biz=MzUzMTQ0NzA0OQ==&mid=2247487280&idx=1&sn=08692e6becbeaf0e63f33a9b4355b74d&scene=21#wechat_redirect)
    
*   [在 CI/CD 中怎么使用 Docker 部署前端项目？](https://mp.weixin.qq.com/s?__biz=MzUzMTQ0NzA0OQ==&mid=2247487345&idx=1&sn=91ecec5de8ed2ba26cafc45018d76e99&scene=21#wechat_redirect)
    
*   [轻松学会生产环境 Docker 部署 Nodejs Express 项目](https://mp.weixin.qq.com/s?__biz=MzUzMTQ0NzA0OQ==&mid=2247487372&idx=1&sn=b0ce7a99c27c429b6931db2cf3284a37&scene=21#wechat_redirect)
    
*   [使用 Docker 搭建 NodeJS 开发环境是一种什么体验？](https://mp.weixin.qq.com/s?__biz=MzUzMTQ0NzA0OQ==&mid=2247487393&idx=1&sn=00bd800757f1594fcee742891262bd32&scene=21#wechat_redirect)
    
*   [在 Docker 容器中运行 Vite 开发环境，有这两个问题要注意](https://mp.weixin.qq.com/s?__biz=MzUzMTQ0NzA0OQ==&mid=2247487406&idx=1&sn=890add31da99488c44be9f1ca2b62059&scene=21#wechat_redirect)
    

结合以上文章综合来看，前后端的 Docker 操作还是独立的，联系不够紧密，并且对于使用 docker compose 来说也是不太友好的。针对容器化这部分，我们后面单独开一篇文章来详细介绍。

*   开源地址：fullstack-blog[1]
    
*   专栏导航：Vue3+TS+Node 打造个人博客（总览篇）[4]
    

参考资料

[1] 

fullstack-blog: _https://github.com/cumt-robin/fullstack-blog_

[2] 

后端工程: _https://github.com/cumt-robin/express-blog-backend_

[3] 

前端工程目录: _https://github.com/cumt-robin/fullstack-blog/tree/v2_

[4] 

Vue3+TS+Node 打造个人博客（总览篇）: _https://juejin.cn/post/7066966456638013477_

  

_END_

  

![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXzzPpciaorRnwicnXYBiaSzdB4Hh2ueW2a09xqAztoX9iayLyibTyoicltC7g/640?wx_fmt=png)

  

**如果觉得这篇文章还不错**

**点击下面卡片关注我**

**来个【分享、点赞、在看】三连支持一下吧![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCX9Ju1LZ2bTXSO8ia8EFp2r5cTPywudM2bibmpQgfuEWxtJILEVlWeN9ibg/640?wx_fmt=png)**

   **“分享、点赞、在看” 支持一波** ![](https://mmbiz.qpic.cn/mmbiz_png/lolOWBY1tkwzw3lDgVHOcuEv7IVq2gCXN5rPlfruYGicNRAP8M5fbZZk7VHjtM8Yv1XVjLFxXnrCQKicmser8veQ/640?wx_fmt=png)