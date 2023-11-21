> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/VGQWivxKZ5OD1nLxw8vudQ)

大厂技术  高级前端  Node 进阶  

======================

点击上方 程序员成长指北，关注公众号  

回复 1，加入高级 Node 交流群

> 原文链接: <https://juejin.cn/post/6981339862901194759?  
> 作者: 纸上的彩虹

技术栈简介
-----

*   微前端
    
*   qiankun
    
*   docker
    
*   gitlab-ci/cd
    
*   nginx
    

如果看完文章不是很理解，可以配合 [视频解说查看本文] 视频地址：https://www.bilibili.com/video/BV1Qg411u7C9

### 什么是微前端

微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

微前端架构具备以下几个核心价值：

*   技术栈无关 主框架不限制接入应用的技术栈，微应用具备完全自主权
    
*   独立开发、独立部署 微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新
    
*   增量升级
    
    在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略
    
*   独立运行时 每个微应用之间状态隔离，运行时状态不共享
    

### 什么是 qiankun

qiankun 是一个生产可用的微前端框架，它基于 single-spa，具备 js 沙箱、样式隔离、HTML Loader、预加载 等微前端系统所需的能力。qiankun 可以用于任意 js 框架，微应用接入像嵌入一个 iframe 系统一样简单。

### qiankun 的核心设计理念

引用地址：qiankun.umijs.org/zh/guide

*   简单
    
    由于主应用微应用都能做到技术栈无关，qiankun 对于用户而言只是一个类似 jQuery 的库，你需要调用几个 qiankun 的 API 即可完成应用的微前端改造。同时由于 qiankun 的 HTML entry 及沙箱的设计，使得微应用的接入像使用 iframe 一样简单。
    
*   解耦 / 技术栈无关
    
    微前端的核心目标是将巨石应用拆解成若干可以自治的松耦合微应用，而 qiankun 的诸多设计均是秉持这一原则，如 HTML entry、沙箱、应用间通信等。这样才能确保微应用真正具备 独立开发、独立运行 的能力。
    

### 为什么不用 Iframe

引用地址：www.yuque.com/kuitos/gky7…

_如果不考虑体验问题，iframe 几乎是最完美的微前端解决方案了。_

iframe 最大的特性就是提供了浏览器原生的硬隔离方案，不论是样式隔离、js 隔离这类问题统统都能被完美解决。但他的最大问题也在于他的隔离性无法被突破，导致应用间上下文无法被共享，随之带来的开发体验、产品体验的问题。

1.  url 不同步。浏览器刷新 iframe url 状态丢失、后退前进按钮无法使用。
    
2.  UI 不同步，DOM 结构不共享。想象一下屏幕右下角 1/4 的 iframe 里来一个带遮罩层的弹框，同时我们要求这个弹框要浏览器居中显示，还要浏览器 resize 时自动居中。
    
3.  全局上下文完全隔离，内存变量不共享。iframe 内外系统的通信、数据同步等需求，主应用的 cookie 要透传到根域名都不同的子应用中实现免登效果。
    
4.  慢。每次子应用进入都是一次浏览器上下文重建、资源重新加载的过程。
    

其中有的问题比较好解决 (问题 1)，有的问题我们可以睁一只眼闭一只眼(问题 4)，但有的问题我们则很难解决(问题 3) 甚至无法解决(问题 2)，而这些无法解决的问题恰恰又会给产品带来非常严重的体验问题， 最终导致我们舍弃了 iframe 方案。

### 微前端的核心价值

www.yuque.com/kuitos/gky7…

项目的构想
-----

在说具体技术实现前，我们先来看下我们想要实现个什么东西。

### 微前端示意图

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwv7s3sDib6THpZLAyicXpWTsjdVd3KGJjsicMz7dJMWb8s52fmDoaX1rSN9AjhnWfMibn0RTgz3ia2mFVw/640?wx_fmt=png)

子应用会根据主应用导航的点击而动态加载

### 部署逻辑

部署的思路有很多，我这里说说我尝试过的方式：

*   只使用一个 nginx 容器，通过监听不同端口，部署多个应用，再在主应用的端口里面添加对应路由代理到子应用
    
    这种方式最简单但是不适合 gitlab-ci/cd 的自动化部署，所以我只是最初测试一下 nginx 部署微前端的实现
    
*   使用多个 nginx 容器，每个容器暴露一个端口，再通过主应用添加对应路由代理到子应用
    
    这种方式可以实现，但是会在服务器暴露多个端口，安全性会降低，而且外部也可以通过端口直接访问子应用
    
*   使用多个 nginx 容器，只暴露主应用的端口，主应用去连通子应用，然后通过 nginx 代理访问
    
    这种方式最理想，只需要暴露一个端口，所有代理都在容器间，对外是无感的，下面是实现的图示
    

![](https://mmbiz.qpic.cn/mmbiz_png/YBFV3Da0Nwv7s3sDib6THpZLAyicXpWTsjUkibcFdJK9T1oiaPCjXS9gye3At5cGD0JI2ULNricYDkclzl6wAsyI41A/640?wx_fmt=png)

qiankun
-------

### 安装 qiankun

```
$ yarn add qiankun # 或者 npm i qiankun -S
```

### 在主应用中注册微应用

```
import { registerMicroApps, addGlobalUncaughtErrorHandler, start } from 'qiankun';const apps = [  {    name: 'ManageMicroApp',    entry: '/system/', // 本地开发的时候使用 //localhost:子应用端口    container: '#frame',    activeRule: '/manage',  },]/** * 注册微应用 * 第一个参数 - 微应用的注册信息 * 第二个参数 - 全局生命周期钩子 */registerMicroApps(apps,{  // qiankun 生命周期钩子 - 微应用加载前  beforeLoad: (app: any) => {    console.log("before load", app.name);    return Promise.resolve();  },  // qiankun 生命周期钩子 - 微应用挂载后  afterMount: (app: any) => {    console.log("after mount", app.name);    return Promise.resolve();  },});/** * 添加全局的未捕获异常处理器 */addGlobalUncaughtErrorHandler((event: Event | string) => {  console.error(event);  const { message: msg } = event as any;  // 加载失败时提示  if (msg && msg.includes("died in status LOADING_SOURCE_CODE")) {    console.error("微应用加载失败，请检查应用是否可运行");  }});start();
```

当微应用信息注册完之后，一旦浏览器的 url 发生变化，便会自动触发 qiankun 的匹配逻辑，所有 activeRule 规则匹配上的微应用就会被插入到指定的 container 中，同时依次调用微应用暴露出的生命周期钩子。

如果微应用不是直接跟路由关联的时候，你也可以选择手动加载微应用的方式：

```
import { loadMicroApp } from 'qiankun';loadMicroApp({  name: 'app',  entry: '//localhost:7100',  container: '#yourContainer',});
```

### 微应用

微应用不需要额外安装任何其他依赖即可接入 qiankun 主应用。

#### 1. 导出相应的生命周期钩子

微应用需要在自己的入口 js (通常就是你配置的 webpack 的 entry js) 导出 `bootstrap`、`mount`、`unmount` 三个生命周期钩子，以供主应用在适当的时机调用。

```
import Vue from 'vue';import VueRouter from 'vue-router';import './public-path';import App from './App.vue';import routes from './routes';import SharedModule from '@/shared'; Vue.config.productionTip = false;let instance = null;let router = null;// 如果子应用独立运行则直接执行renderif (!window.__POWERED_BY_QIANKUN__) {  render();}/** * 渲染函数 * 主应用生命周期钩子中运行/子应用单独启动时运行 */function render(props = {}) {  // SharedModule用于主应用于子应用的通讯  // 当传入的 shared 为空时，使用子应用自身的 shared  // 当传入的 shared 不为空时，主应用传入的 shared 将会重载子应用的 shared  const { shared = SharedModule.getShared() } = props;  SharedModule.overloadShared(shared);  router = new VueRouter({    base: window.__POWERED_BY_QIANKUN__ ? '/manage/' : '/',    mode: 'history',    routes  });  // 挂载应用  instance = new Vue({    router,    render: (h) => h(App)  }).$mount('#app');}/** * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。 */export async function bootstrap() {  console.log('vue app bootstraped');}/** * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法 */export async function mount(props) {  console.log('vue mount', props);  render(props);}/** * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例 */export async function unmount() {  console.log('vue unmount');  instance.$destroy();  instance = null;  router = null;}/** * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效 */export async function update(props) {  console.log('update props', props);}
```

上述代码中还引用了一个`public-path`的文件：

```
if (window.__POWERED_BY_QIANKUN__) {  // eslint-disable-next-line no-undef  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;}
```

这个主要解决的是微应用动态载入的 脚本、样式、图片 等地址不正确的问题。

#### 2. 配置微应用的打包工具

除了代码中暴露出相应的生命周期钩子之外，为了让主应用能正确识别微应用暴露出来的一些信息，微应用的打包工具需要增加如下配置：

**webpack：**

```
const packageName = require('./package.json').name;module.exports = {  publicPath: '/system/', //这里打包地址都要基于主应用的中注册的entry值  output: {    library: 'ManageMicroApp', // 库名，与主应用注册的微应用的name一致    libraryTarget: 'umd', // 这个选项会尝试把库暴露给前使用的模块定义系统，这使其和CommonJS、AMD兼容或者暴露为全局变量。    jsonpFunction: `webpackJsonp_${packageName}`,  },};
```

#### 关键点总结

*   主应用注册时的配置
    
    ```
    const apps = [  {    name: 'ManageMicroApp',    entry: '/system/',  // http://localhost/system/ 这里会通过nginx代理指向对应的子应用地址    container: '#frame',    activeRule: '/manage',  },]
    ```
    
    **主应用注册微应用时，`entry` 可以为相对路径，`activeRule` 不可以和 `entry` 一样（否则主应用页面刷新就变成微应用）**
    
*   vue 路由的 base
    
    ```
    router = new VueRouter({  base: window.__POWERED_BY_QIANKUN__ ? '/manage/' : '/',  mode: 'history',  routes});
    ```
    
    **如果是主应用调用的那么路由的 base 为`/manage/`**
    
*   webpack 打包配置
    
    ```
    module.exports = {  publicPath: '/system/',};
    ```
    
    **对于 `webpack` 构建的微应用，微应用的 `webpack` 打包的 `publicPath` 需要配置成 `/system/`，否则微应用的 `index.html` 能正确请求，但是微应用 `index.html` 里面的 `js/css` 路径不会带上 `/system/`。**
    

到这里我们把微前端的配置做好了，接下来就是 nginx 的配置。

生产环境 Nginx 配置
-------------

先把主应用的 nginx 配置挂一下

```
server {        listen       80;        listen       [::]:80 default_server;        server_name  localhost;        root         /usr/share/nginx/html;        location / {            try_files $uri $uri/ /index.html;            index index.html;        }				# 前面我们配置的子应用entry是/system/，所以会触发这里的代理，代理到对应的子应用        location /system/ {    				 # -e表示只要filename存在，则为真，不管filename是什么类型，当然这里加了!就取反             if (!-e $request_filename) {                proxy_pass http://192.168.1.2; # 这里的ip是子应用docker容器的ip             }    				 # -f filename 如果 filename为常规文件，则为真             if (!-f $request_filename) {                proxy_pass http://192.168.1.2;             }             # docker运行的nginx不识别localhost的 所以这种写法会报502             # proxy_pass  http://localhost:10200/;             proxy_set_header Host $host;         }        location /api/ {            proxy_pass http://后台地址IP/;            proxy_set_header Host $host;            proxy_set_header X-Real-IP $remote_addr;            proxy_set_header REMOTE-HOST $remote_addr;            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;        }        error_page 404 /404.html;            location = /40x.html {        }        error_page 500 502 503 504 /50x.html;            location = /50x.html {        }    }
```

再看一下子应用的

```
server {    listen       80;    listen       [::]:80 default_server;    server_name  _2;    root         /usr/share/nginx/html;    # 这里必须加上允许跨域，否则主应用无法访问    add_header Access-Control-Allow-Origin *;    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';    add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';    location / {        try_files $uri $uri/ /index.html;        index index.html;    }    location /api/ {        proxy_pass http://后台地址IP/;        proxy_set_header Host $host;        proxy_set_header X-Real-IP $remote_addr;        proxy_set_header REMOTE-HOST $remote_addr;        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;    }    error_page 404 /404.html;        location = /40x.html {    }    error_page 500 502 503 504 /50x.html;        location = /50x.html {    }}
```

dockerfile 配置
-------------

这里先看一下子应用的

```
# 直接使用nginx镜像FROM nginx# 把上面配置的conf文件替换一下默认的COPY nginx.conf /etc/nginx/nginx.conf# nginx默认目录下需要能看见index.html文件COPY dist/index.html /usr/share/nginx/html/index.html# 再回头看一下部署逻辑图和qiankun注意点，必须要把所有的资源文件放到system文件下index.html才能正确加载COPY dist /usr/share/nginx/html/system
```

再看一下主应用的

```
# 这里主应用没有直接使用nginx，因为nginx反向代理的/api/会出现404的问题，原因未知！FROM centos# 安装nginxRUN yum install -y nginx# 跳转到/etc/nginxWORKDIR /etc/nginx# 替换配置文件COPY nginx.conf nginx.conf# 跳转到/usr/share/nginx/htmlWORKDIR /usr/share/nginx/html# 主应用正常打包，所以直接把包放进去就行COPY dist .# 暴露80端口EXPOSE 80# 运行nginxCMD nginx -g "daemon off;"
```

gitlab-ci/cd 配置
---------------

先看一下子应用的，**只说重点的**

```
image: nodestages:  - install  - build  - deploy  - clearcache:  key: modules-cache  paths:    - node_modules    - dist安装环境:  stage: install  tags:    - vue  script:    - npm install yarn    - yarn install打包项目:  stage: build  tags:    - vue  script:    - yarn build部署项目:  stage: deploy  image: docker  tags:    - vue  script:  	# 通过dockerfile构建项目的镜像    - docker build -t rainbow-system .    # 如果存在之前创建的容器先删除    - if [ $(docker ps -aq --filter name=rainbow-admin-system) ];then docker rm -f rainbow-admin-system;fi    # 通过刚刚的镜像创建一个容器 给容器指定一个网卡rainbow-net，这个网卡是我们自定义，创建方式后面会说，然后给定一个ip    - docker run -d --net rainbow-net --ip 192.168.1.2 --name rainbow-admin-system rainbow-system清理docker:  stage: clear  image: docker  tags:    - vue  script:    - if [ $(docker ps -aq | grep "Exited" | awk '{print $1 }') ]; then docker stop $(docker ps -a | grep "Exited" | awk '{print $1 }');fi    - if [ $(docker ps -aq | grep "Exited" | awk '{print $1 }') ]; then docker rm $(docker ps -a | grep "Exited" | awk '{print $1 }');fi    - if [ $(docker images | grep "none" | awk '{print $3}') ]; then docker rmi $(docker images | grep "none" | awk '{print $3}');fi
```

再看一下主应用的，省略重复的，直接看重点

```
部署项目:  stage: deploy  image: docker  tags:    - vue3  script:    - docker build -t rainbow-admin .    - if [ $(docker ps -aq --filter name=rainbow-admin-main) ];then docker rm -f rainbow-admin-main;fi    # 给容器指定一个网卡rainbow-net，然后给定一个ip，然后通过--link与之前创建的子应用连通，重点！    - docker run -d -p 80:80 --net rainbow-net --ip 192.168.1.1 --link 192.168.1.2 --name rainbow-admin-main rainbow-admin
```

上面说到了 docker 的自定义网卡，生成的命令如下：

```
$ docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 rainbow-net
```

总结
--

到这里我们已经实现了 qiankun+docker 配合 gitlab-ci/cd 的自动化部署，中间遇到很多坑，然后走出了一条相对合理的解决方案，有问题欢迎讨论。

```
Node 社群








我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：


1. 点个「在看」，让更多人也能看到这篇文章
2. 订阅官方博客 www.inode.club 让我们一起成长



点赞和在看就是最大的支持❤️

```