> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/lkksxeaQxip4m5-FDkiZPA)

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25bewkvG2cthnU8al0FNibnYrmYu6YpAEJd6jk6BJ3bY7UNEr8LNgBgUByMgLx7NwllicJibHNtXDU8L6Q/640?wx_fmt=png)

总字数：2,730 | 阅读时间：12 分钟　

在公司项目开发中，我们经常会有相同的业务逻辑或者组件可以复用；但是这些由于安全性，我们又希望将这些代码在内部项目中使用，并不希望公开访问；verdaccio 提供了一个搭建 npm 私有服务器的方式，我们来看下如何搭建以及上传我们自己的依赖包。

介绍及安装
=====

Verdaccio 是什么？

> ❝
> 
> `Verdaccio`是一个 Node.js 创建的轻量的私有 npm 代理注册源（proxy registry）
> 
> ❞

通过 Verdaccio 搭建私有 npm 服务器有着以下优势：

1.  零配置：无需安装数据库，基于 nodejs，安装及运行。
    
2.  使用方便：将内部高复用的代码进行提取，方便在多个项目中引用。
    
3.  安全性：仓库搭建在局域网内部，只针对内部人员使用。
    
4.  权限管理：对发布和下载 npm 包配置权限管理。
    
5.  加速包下载：将下载过的依赖包进行缓存，再次下载加快下载速度。
    

Verdaccio 是 sinopia 开源框架的一个 fork，由于 sinopia 作者两年前就已经停止更新，坑比较多，因此 Verdaccio 是目前最好的选择；首先进行全局安装：

```
# 全局安装npm install -g verdaccio# 启动服务器verdaccio
```

安装后直接输入命令即可运行：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiaMr6NGgrcTem2VpH1MpnASqBdms9iaYoicibG63cR1bOKwFicicylEkR15F3icficib9vKAiaeiawD44bofmg/640?wx_fmt=png)运行服务器

`config.yaml`是配置文件的路径，我们可以进行权限等配置；4873 是 Verdaccio 启动的默认端口，支持在配置文件中进行修改；我们再浏览器中打开 localhost:4873 就能看到他的管理界面了：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiaMr6NGgrcTem2VpH1MpnA3SgwWPdkV2QcyN6FkkPqu42UHV24dJBl34qnbiaIl0CdhXDSn5dUqtg/640?wx_fmt=png)Verdaccio 首页

通过命令行启动的话，如果终端停止了，那我们的服务器也就停止了，因此一般我们通过 pm2 启动守护进程。

```
npm install -g pm2
pm2 start verdaccio
pm2 list
```

这样 verdaccio 就在后台运行了。

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiaMr6NGgrcTem2VpH1MpnAWiaHCNIoGDElkb1FwqT6EBq3qfEiakrAicb0IhsoWA6rq2hiakocnzUrZA/640?wx_fmt=png)pm2 守护进程

除此之外，我们还可以通过 docker 来进行安装

```
docker run --name verdaccio -itd -v ~/docker/verdaccio:/verdaccio -p 4873:4873 verdaccio/verdaccio
```

nrm 管理镜像源地址
===========

Verdaccio 安装好后，我们可以更改 npm 源为本地地址：

```
# 设置npm使用的源为本地私服npm set registry http://localhost:4873/
```

或者针对某个依赖安装时选用自己的源地址：

```
npm install lodash --registry http://localhost:4873
```

但是如果我们想再次切换到淘宝或者其他的镜像地址，就不那么方便了；我们可以通过`nrm`这个工具来管理我们的源地址，可以查看和切换地址；首先还是进行安装：

```
npm install -g nrm
```

安装后我们可以通过`nrm add [name] [address]`这个命令来新增一个源地址：

```
nrm add localnpm http://localhost:4873/
```

使用`nrm ls`可以查看我们使用的所有源地址，带`*`是正在使用的地址；通过`nrm use [name]`来切换地址：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiaMr6NGgrcTem2VpH1MpnAYUuMyJlcx7fdB7f1wRzTRRgDVYhUQRW7f2Uj67XB3oibuUPbwiacHwDg/640?wx_fmt=png)nrm 管理源地址

配置文件
====

通过配置文件，我们可以对 Verdaccio 进行更多的自定义设置，默认的配置文件如下：

```
# 依赖缓存地址
storage: ./storage
# 插件地址
plugins: ./plugins

web:
  title: Verdaccio

# 认证信息
auth:
  # 用户账号存储文件
  htpasswd:
    file: ./htpasswd

# 上游链接
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

# 包管理
packages:
  '@*/*':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs
  '**':
    access: $all
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs

server:
  keepAliveTimeout: 60

# 插件开启
middlewares:
  audit:
    enabled: true

# 日志管理
logs:
  - { type: stdout, format: pretty, level: http }
```

Verdaccio 默认只能本机访问，我们可以在配置文件最后加入监听的端口，让局域网访问：

```
# 监听的端口，不配置这个，只能本机能访问
listen: 0.0.0.0:4873
# 界面默认设为中文
i18n:
  web: zh-CN
```

所有的账号密码都会保存在`htpasswd`这个文件中，我们可以通过在线 htpasswd 生成器生成加密的密码文件，或者通过命令行的形式来添加用户

```
# 新增用户npm adduser --registry http://localhost:4873/
```

uplinks
-------

上游链接`uplinks`表示如果在本地找不到依赖包，去上游哪个地址获取包；我们可以配置多个地址，每个地址都有一个唯一的 key 值：

```
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    timeout: 10s
  yarn:
    url: https://registry.yarnpkg.com/
    timeout: 10s
  taobao:
    url: https://registry.npm.taobao.org/
    timeout: 10s

packages:
  '@*/*':
    proxy: taobao yarn
  '**':
    proxy: taobao
```

官方的地址会比较慢，一般建议配置淘宝的地址：配置好上游链接后我们就可以将包的代理指向链接，支持多个链接地址，请求失败时会向后面的链接进行尝试。

令牌
--

从`verdaccio@4.0.0`开始支持配置自定义令牌签名，要启用 JWT 签名，我们需要将 jwt 添加到 api 部分：

```
security:
  api:
    jwt:
      sign:
        expiresIn: 15d
        notBefore: 0
  web:
    sign:
      expiresIn: 7d
```

packages 包管理
------------

在`packages`字段中，我们可以对每个域下面的包进行管理，在 verdaccio 中有三种身份：所有人、匿名用户、认证 (登陆) 用户（即 "anonymous","$authenticated"），默认情况下所有人都有访问的权限（access），认证的用户才有包的发布权限（publish）和撤回权限（unpublish）。

除此之外，我们可以对包进行更进一步的划分，比如公司的包和个人的包，通过`@scope`的方式进行访问控制：

```
packages:
  '@company/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs
  '@my/*':
    access: $authenticated
    publish: $authenticated
    unpublish: $authenticated
    proxy: npmjs
```

默认情况下，任何用户都可以通过`npm adduser`来向我们的服务器注册用户；如果我们的 npm 服务器部署在外网的话是不利的，我们还可以通过 max_users 为 - 1 来禁止注册用户，如果在内网的话，可以设置某个具体的值来限制用户的数量：

```
auth:
  htpasswd:
    file: ./htpasswd
  max_users: -1
```

依赖包创建和发布
========

搭建好了 npm 私服，我们就可以上传 npm 包了，我们创建一个 utils 项目，放一些自己的工具等，首先通过`npm init`初始化 package.json，然后我们可以对包的信息进行一些修改：

```
{  "name": "@demo/utils",  "version": "1.0.0",  "description": "my own utils",  "main": "index.js",  "scripts": {    "test": "echo \"Error: no test specified\" && exit 1"  },  "author": "corner",  "license": "ISC"}
```

我们就可以在入口文件`index.js`中写代码了，比如这里我们定义了判断环境的几个变量：

```
export const UA = window.navigator.userAgent.toLowerCase();export const isAndroid = UA && UA.indexOf("android") > 0;export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);export const isWeixin = UA && /micromessenger/i.test(UA);
```

然后我们登录上面注册的用户，输入用户名、密码以及邮箱等：

```
# 登录账号npm login
```

也可以通过`npm logout`退出登录，以及`npm who am i`查看当前登录的用户名；登录成功后就可以将我们的包进行发布了：

```
# 发布依赖包npm publish
```

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiaMr6NGgrcTem2VpH1MpnA51oOf7ia8PS8AQxrnuFtHBfEPoTg1SCk4MP1pwSh50dGXy04tR46eibw/640?wx_fmt=png)npm 发包

在首页我们登录后就能成功看到刚刚发布的第一个包了，也能给其他同事使用：

![](https://mmbiz.qpic.cn/mmbiz_png/VsDWOHv25beiaMr6NGgrcTem2VpH1MpnAKK1yibfnibCnSjS4BGRJXW62kfJyn7U2PNXKiaZfLEnpyUxOgiazR6AY4g/640?wx_fmt=png)查看依赖包

我们注意到整个包的入口是`main`字段指定的 index.js，这是一个 es module 模块规范的包，但是在 commonjs 规范的项目中就不能使用了，因此我们可以通过打包工具对其进行打包优化。

我们在深入对比 Webpack、Parcel、Rollup 打包工具的不同介绍过 Rollup 比较适合用来打包一个类库，因此这里就选用 Rollup 进行打包，我们在项目下新建`rollup.config.js`：

```
export default {  input: "./index.js",  output: [    {      format: "cjs",      file: "dist/index.commonjs.js",    },    {      format: "es",      file: "dist/index.esm.js",    },    {      format: "iife",      file: "dist/index.bundle.js",      name: 'DemoUtils'    },  ],};
```

通过 rollup 将入口文件`index.js`打包成 commonjs、es module 和 iife 三种规范，然后就在`package.json`中分别定义三种规范的文件路径：

```
{  "name": "@demo/utils",  "version": "1.0.2",  "description": "my own utils",  // 指向 CommonJS 模块规范的代码入口文件  "main": "dist/index.commonjs.js",   // 指向 ES Module 模块规范的代码入口文件  "module": "dist/index.esm.js",   // 指向 ES Module 模块规范的代码入口文件  "jsnext:main": "dist/index.esm.js",  "unpkg": "dist/index.bundle.js",  "jsdelivr": "dist/index.bundle.js",  "scripts": {    "test": "echo \"Error: no test specified\" && exit 1",    "build": "rollup --config"  },  "author": "corner",  "license": "ISC",  "devDependencies": {    "rollup": "^2.54.0"  }}
```

如果还想对我们的包有详细的使用说明等，可以在项目中新建一个 README.md 文档；build 打包后，再次 publish 发包就能更新线上的依赖包了。

  

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