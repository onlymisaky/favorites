> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/S8eFeKaRKT6LxfIMtN9L5g)

‍  

前言
==

微前端（Micro-Frontends）是一种类似于微服务的架构，它将微服务的理念应用于浏览器端，即将 Web 应用由单一的单体应用转变为多个小型前端应用聚合为一的应用。

微前端并不是前端领域的新概念。早期希望前端工程能够像后台的微服务一样，项目分开自治，核心的诉求是：

1、兼容不同技术栈

2、将项目看作页面、组件，能够复用到不同的系统中

早期比较成熟的 single-spa，从早期 React 的现代框架组件生命周期中获得灵感，将生命周期应用于这个应用程序，即将整个页面作为组件。

后来蚂蚁金融团队孵化了基于 single-spa 的 qiankun 架构，将微前端进一步的深耕，目标直指巨石应用业务难题，旨在解决单体应用在一个相对长的时间跨度下，由于参与的人员、团队的增多、变迁，从一个普通应用演变成一个巨石应用 (Frontend Monolith) 后，随之而来的应用不可维护的问题。这类问题在企业级 Web 应用中尤其常见。

本人在深入实践微前端之后，深感 qiankun 受制于前端架构的定位，无法使用 Nodejs 等能力快速解决快速发布，构建，管理的困境，因此在此基础上做了一定程度的 APAAS 探索，将本文的项目作为 APAAS 应用快速集成到其他业务系统。

qiankun 介绍
==========

首先基于作者自己的思考，给大家梳理下 qiankun 微前端的渲染流程，方便不了解微前端的同学有个大体的认识。

假如你不了解微前端的话，对于这个新事物的学习和探索，一般是按照 5Ws 的学习规律来学习：

1.  Who is it about?
    
2.  What happened?
    
3.  When did it take place?
    
4.  Where did it take place?
    
5.  Why did it happen?
    

本文也按照类似的方式一个具体的案例去梳理 qiankun 的核心概念。

本文有一个业务系统 A，希望集成业务系统 B 的_**欢迎卡片配置**_功能页面。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qJETRZczMuooVWUGiaWfMLQ8KicXK0ibBZKG9JkXRicDJFKG8G1aTNice6lw/640?wx_fmt=png)

那么 who 包含 qiankun 客户端、主应用 A、微应用 B 三部分，三者协作完成了微前端的设计。从产品使用的角度来看，第一步则是注册路由，确定微前端启动的时机和启动渲染的内容（when 和 where）。

```
import { registerMicroApps, start } from'qiankun';registerMicroApps([  {    name: 'smart-contact-cms-index', // app name registered    entry: '//localhost:7100',    container: '#yourContainer',    activeRule: '/yourActiveRule',  },]);start();
```

上面的实例十分简单，通过 name 来作为微应用 B 的唯一标识， entry 作为微应用 B 的资源加载地址。当路由映射到 '/yourActiveRule' 时，则请求微应用 B 的页面资源地址，解析其中的 JS 和 CSS 资源，将微应用 B 的页面渲染到 id 为 #yourContainer 的 DOM 节点。

```
const packageName = require('./package.json').name;module.exports = {  output: {    library: `${packageName}-[name]`,    libraryTarget: 'umd',    jsonpFunction: `webpackJsonp_${packageName}`,  },};
```

上面是一段微应用 webpack 的配置，library 就是注册路由时的唯一标识 name 了。这里也十分好理解为啥 qiankun 要在构建资源时给 js 增加标识。

qiankun 客户端 entry 配置的 HTML 页面资源的地址，拉取到页面资源之后劫持 HTML 解析，自行构建 Http 请求去加载 JS 文件。很明显页面中肯定不止一段 JS 代码，就需要标识来标识那一段的入口 JS 代码了。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qFCdvVT3AQiaicfCkc5ShmXymcWwo6w7P7qJwqRjPDWYfxmAOEjfaCicEw/640?wx_fmt=png)

下面截取了 index.js 头部代码

```
!function(e,t){  "object"==typeofexports&&"object"==typeofmodule?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeofexports?exports["smart-contact-cms-index"]=t():e["smart-contact-cms-index"]=t()}
```

仅仅修改微应用 B 的 webpack 是远远不够的，常规前端页面工程会在 index.js 文件中直接调用类似 ReactDOM.render API，直接去渲染到特定节点。那 qiankun 根本无法干预渲染过程，因此需要将渲染的实际交给 qiankun 客户端来控制，qiankun 受前端组件化的影响，也希望将页面做成一个暴露生命周期的组件，导出相关的生命周期钩子。

```
// 单独 App 运行if (!isMicroApp) {  // 非微前端渲染  renderApp({});}// 导出 qiankun 生命周期export const bootstrap = async () => {  console.log('[smart-contact-cms] bootstrap');};export const mount = async (props: any) => {  console.log('[smart-contact-cms] mount', props);  normalizeObject(props.mainAppState);  // 作为微应用运行  renderApp(props);};export const unmount = async (props: any) => {  const { container } = props;  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));};
```

细心的同学会发现有个 isMicroApp 的变量可以控制启动微前端渲染还是独立 APP 渲染，这个实际是 qiankun 客户端启动后，会在 window 上挂在 _**__POWERED_BY_QIANKUN__**_ 变量标识运行时环境。

这里还有个小细节就是微应用的 JS CSS 文件请求是属于 **Ftech/XHR** 类型，说明 js 文件的请求是 qiankun 客户端自行构造的。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5q9VGFJR3ZJpy4EmVMKxhWU2wDje2VVhSJH1ib2vg1th5bOwD3Km124bQ/640?wx_fmt=png)

至于为何要这么做？我的理解是为了实现微前端的沙箱功能。

qiankun 客户端干预 script 标签和 link 标签的加载过程的难度，和上面的方式相比明显是更简单的，但是这种方式很明显是缺乏安全性，特别是在面临第三方 SDK 加载的时候，例如微信 web SDK 的引入，就无法通过其安全校验，具体可以详细看下 **FAQ 1** 的案例介绍。

一句话总结上述过程：

在 qiankun 的框架下，一个页面集成到另外一个页面系统中，最关键的核心点就是将微应用封装成具有生命周期的页面组件，使得 qiankun 可以调用 React 或者 Vue 的 render 能力，将页面渲染到对应的 DOM 节点。

APAAS 架构介绍
==========

本文由于篇幅限制，只介绍 Client 端、Server 端的接口协议代理、微应用改造，其他部分更多是偏向于自动工程化和项目管理的方面，之后有时间给大家详细介绍下。![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qSHz0kBAWNZichLLvokBKLVTQZySZ2JVq1whoqeonetQN2bnnHHGlojA/640?wx_fmt=png)

Client 端
--------

Client 端是经过业务封装后的 qiankun SDK，内部集成了经过 qiankun 改造的各自子应用系统，对外暴露以下接口：

### 1、initial(appInfo)

appInfo 参数

```
{    "app_id": "xxx",    "prefetch": true,    "signUrl": "remote-url"}
```

这个接口主要是为了初始化部分信息，包括微应用的鉴权配置、是否启动预加载、微应用的标识。其中鉴权配置可能会让大家感到疑惑。

在介绍 qiankun 的渲染过程中提到

这里还有个小细节就是微应用的 JS CSS 文件请求是属于 **Ftech/XHR** 类型，说明 js 文件的请求是 qiankun 客户端自行构造的。

这里必然要涉及前端的跨域问题，尤其是当主应用和微应用的域名不一致时，qiankun 客户端如何能够在跨域的限制之下获取到微应用的页面资源？本文的解决方案是主应用提供一个鉴权秘钥下发的接口 signUrl，这个接口由微应用提供也可以，将秘钥信息下发到 cookie 中，通过配置 qiankin 自定义 fetch 方法，带上这些鉴权信息。

本文只是其中一个解决方案，官方也提供了一些通用方案以供参考《微应用静态资源一定要支持跨域吗》。

### 2、load (FloadConfig) 接口

动态加载微应用，其 FloadConfig 参数如下：

```
interface FLoadConfig {  container: string;  pageId: string;  props?: FMicroProps; // 传入对应微应用所需要的参数}interface FMicroProps {  loginUrl?: string, // 登录的重定向地址  baseApiUrl?: string,  dispatch?: (value: { type: string; data: any }) =>void,  pageInfo?: FPageConfig,  useNativeRoute?: number;  extra?: any,}
```

loginUrl 是鉴权失败跳转的登录地址；baseApiUrl 是后台请求的地址；useNativeRoute 决定微前端采用何种路由方式加载。

本文在这个阶段主要做两方面的突破：

1.  解决了后台请求的跨域和鉴权
    
2.  解决了主应用和子应用的 path 冲突问题
    

baseApiUrl 这里默认提供了基于腾讯云的鉴权下发能力，各个业务系统只需要按照规范去对接腾讯云 API 即可，比较远离前端，在这里不做过多解读。

在实际的业务场景中，主应用和微应用互相无法感知到对方，因此其路由有可能会互相冲突，这里通过 useNativeRoute 参数来控制微应用的路由模式。

1、useNativeRoute = 0 采用配置端数据返回的路由路径  
2、useNativeRoute = 1 采用当前页面 hash 前缀 + 配置端数据返回的路由路径作为新路由  
3、useNativeRoute = 3 采用当前的页面路由不做任何改动， 默认 0

底层的实现逻辑则是在 **renderApp** 传入主应用的路由前缀，改造相对比较简单，但是很实用。

```
exportconst mount = async (props: any) => {  console.log('[smart-contact-cms] mount', props);  // 删除不能序列化的内容  normalizeObject(props.mainAppState);  // 作为微应用运行  renderApp(props);};
```

返回 MicroApp 实例：

*   mount(): Promise;
    
*   unmount(): Promise;
    
*   update(customProps: object): Promise;
    
*   getStatus(): | "NOT_LOADED" | "LOADING_SOURCE_CODE" | "NOT_BOOTSTRAPPED" | "BOOTSTRAPPING" | "NOT_MOUNTED" | "MOUNTING" | "MOUNTED" | "UPDATING" | "UNMOUNTING" | "UNLOADING" | "SKIP_BECAUSE_BROKEN" | "LOAD_ERROR";
    
*   loadPromise: Promise;
    
*   bootstrapPromise: Promise;
    
*   mountPromise: Promise;
    
*   unmountPromise: Promise;
    

详情参考参考 qiankun 官方文档。

### 3、subscribe(callback: (value: FMicroEvent) => void): Unsubscribe

监听主子应用的事件和数据，callback 函数 ({type: string; data: any}) => { _处理程序_ }，目前通用返回加载完成事件 type: load，其他自定义事件由主子应用自行定义。

返回值：返回取消订阅的句柄。

其他接口在这里不做赘述了。

Server 端的接口协议代理
---------------

实现页面低成本接入是微前端的重要愿景之一，也是吸引大家持续探索的核心原因。  
理想业务场景下，一个被微应用改造之后的微应用集成到其他业务系统，应该无需关心后台接口，开箱即用。但是后台业务系统具有各自独立的鉴权、账户、业务逻辑，相互之间差异性极大，完全无法做到开箱即用。

传统的方式是主应用去主动接入微应用的后台系统，缺点很明显，主应用要了解微应用系统的后台逻辑，且每接入一个系统就要重复上述的工作，成本高且低效。

微前端脱胎于微应用，我们也希望微应用自己也实现微服务级别的逻辑自治，依托于腾讯云 API 托管，对外提供微应用自身的服务。这样的好处是主应用只需要要对接腾讯云生态，即可实现鉴权、账号转化、监控等能力。主应用和子应用只需要做一次，无需重复，缺点就是必须要依托于腾讯云生态。假如你的业务本身就是依托于微信、企业微信、腾讯云发展起来的，上述方式值得引入。

微应用改造
-----

一个业务系统并不是一开始就有被集成的价值的，往往是在业务发展到一定程度，经过市场验证其价值之后，大家才会明确这个业务系统具有微应用改造的价值，这就导致一个窘迫的境地：你需要改造已经成型的项目，使其成为可快速接入的微应用。

qiankun 的微应用改造相对比较简单，一般在开启严格沙箱模式之后，微应用和主应用之间建立比较好的环境隔离，你并不需要太多的工作。

首先样式隔离，参考下面 **FAQ 2、css 隔离** 章节的介绍。其核心的麻烦在于 qiankun 启动严格沙箱木事之后，会导致 dialog、Modal 等组件无法找到 body 节点，进而无法挂在到 DOM 中。

其次 JS 作用域隔离，这里主要是一些第三方库会在 window 上挂在单例实例，导致主应用和微应用之间单例配置相互覆盖，常见于日志上报、微信 SDK、QQ SDK 等第三方应用。解决方案分为两个方向:

1.  假如主应用存在则沿用主应用的配置  
    这种方式对主应用比较有利。以日志上报的配置为例，微应用的日志会上报到主应用空间下，那么主应用的日志监控会很完整。缺点则是微应用本身失去了这些监控信息。
    
2.  微应用对自身使用的单例进行隔离  
    这种方式对微应用比较有利。以 Axios 的配置为例，子应用可以实现类似中台应用的效果，可以探知到微应用在不同的主应用中的实际使用场景和数据统计。
    

本文采用的是第二种方式，假如主应用需要进行数据共享或者配置共享，可以通过主应用和微应用之间的参数和数据传递的方式来实现共享，微应用提供丰富的监听 hooks。

FAQ
===

1、如何解决 第三方 SDK JS 文件加载失败问题
--------------------------

微信和企业微信的 SDK 是不可以自行构建 Http 请求加载的，这是由于其安全策略导致的，且每次返回的内容有安全限制的改动，无法复用。  
因此必须要在 html 的 header 中引入，但 qiankun 会对 html header 所有 script link 资源构造请求链接，进而导致获取第三方 SD K 的请求报错，整个 qiankun 客户端加载微应用进程报错，无法加载出对应页面。![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qHdOpAOV1icMaAt8hGt7A5g1SlViafRBQZ7T3xrQFWdLZ1RGnQDZw7Y6A/640?wx_fmt=png)

官网在常见问题给了三个解决方案：

1.  使用 getTemolate 过滤异常脚本；
    
2.  使用自定义 fetch 阻断 script 脚本；
    
3.  终极方案 - 修改 html 的 content-type；
    

前两种方案需要在乾坤渲染函数中增加一个对应的参数，这里面有个坑点，则是 **prefetchApps** 不支持这些参数，因此一旦启用预加载函数，则会导致渲染函数的传入配置失效，因此需要关闭使用预加载函数。

2、css 隔离
--------

微前端核心理念：解耦 / 技术栈无关，简单来说就是希望微应用之间，基站应用和微应用之间的技术栈可以互相隔离，从而各种定制自己的技术体系来实现开发效率和产品质量的最优化配置，这也是微前端的核心价值体现。

然而理想是丰满的，现实是骨感的。主流的沙箱模式是通过创建一个独立的作用域隔离作用域链，同时克隆全局变量来实现的，但是这种隔离 + 克隆方案并不完美，在复杂运行场景中，无论性能还是安全性都是难以保证的，特别是 CSS 的隔离。

本文基于乾坤的微前端架构，在此基础上做了一些查漏补缺的补充。

首先是基础页面的 CSS，采用的是成熟的 CSS module 方案，简单来说就是将 CSS 变成局部生效，每个 class 生成一个独一无二的名字。从最早的 Less、SASS，到后来的 PostCSS，再到最近的 CSS in JS，都是为了解决 CSS 全局生效带来的副作用。

```
css: {  loaderOptions: {    less: {      javascriptEnabled: true,      modifyVars: {        '@ant-prefix': 'industryAnt', // 前缀        'primary-color': '#0052d9',        'link-color': '#0052d9',        'btn-primary-color': '#ffffff',        'btn-danger-bg': '#e34d59',        'disabled-color': 'rgba(15, 24, 41, .3);',        'btn-disable-bg': '#eaedf2',        'text-color': '#0F1829',      },      module: true,    },    postcss: {      plugins: [        AddAntClass({ prefix: 'industryAnt' })      ],    }  },}
```

参考上面的配置，直接开启即可。

在前端开发过程中，我不可避免的会使用到各种前端的组件库，例如 antd、echarts，且都支持自定义主题配置，假如基站应用和微应用之间主题配置冲突了，就需要我们采用类似 CSS module 的方案，将各自应用的 CSS 应用范围控制在各自的组件控件内。

细心的同学已经发现，我上面的代码就包含了 antd 的类名定制的配置 - **'@ant-prefix': 'xxxAnt'** ，给所有 antd 组件增加类名前缀。

你以为到这里就完美解决了吗？不，这才刚开始。回到我们的业务场景中去，很多页面的复用并不是一开始就设计好的，往往是产品中后期发现业务体系之间存在高度的复用性，你需要对老的项目进行改造使它支持微应用架构模式。经验丰富的你发现已有项目中，存在很多全局 class 样式，甚至全局地方类库的组件 class 样式，如果手动去调整，那绝对 boom 。

这里给大家提供一些工程化的方法。第三方类库的样式类名往往都是有通用类名前缀，这是我们能够解决这个问题的基本前提条件，我们在在 CSS 构建阶段对 css class 进行替换和调整。有兴趣的同学可以看下 less、 postcss 提供的插件机制，以下代码仅供参考。

```
const postcss = require('postcss');module.exports = postcss.plugin('postcss-add-css-prefix', function(opts = {}) {  const {    prefix = 'xxxAnt'  } = opts  // 接收两个参数，第一个是每个css文件的ast，第二个参数中可获取转换结果相关信息(包括当前css文件相关信息)  function plugin(css, result) {    if (!prefix) return; // 没传入prefix，不执行下面的逻辑    css.walkRules(rule => { // 遍历当前ast所有rule节点      const {        selector      } = rule;      // 只有当节点是ast根节点直属子节点时才添加前缀      // 简单做了容错处理，只要带有根选择器的都不添加前缀，本身带有前缀了也不添加      // 加了个flag，防止节点更新后重复执行该逻辑进入死循环      if (rule.parent.type === 'root' && selector.indexOf('.ant-') >= 0 && selector.indexOf(`${prefix}-`) < 0 && !rule.flag) {        rule.flag = true        const clone = rule.clone();        clone.selector = selector.split(' ').map(item => item.replace('.ant-', `.${prefix}-`)).join(' ');        rule.replaceWith(clone)      }    })  }  return plugin})
```

经过以上调整，样式终于隔离成功，微前端接入后展示完美，此时测试的反馈打破了你的幻想：confirm 的弹窗提示不显示了。经过排查发现 ant-prefix + css 插件的方案，无法对动态生成的组件样式进行调整，因此它的样式会丢失。  
最终在 Ant Design of React 官方的 FAQ 中找到了线索，

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qJb8Z05zrt4VDWdEv01Smrh4Oc2l2B7h34pjF1HibdAXOrxylVhKyq2Q/640?wx_fmt=png)

但是这个方案并不适用于本文使用 antdv 1.x 版本的微应用项目，不支持这些 API。在 3.x 版本 FAQ 中给了一个推荐方案。  
![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qgxelBjBbGibNXICLQsnXwVuBH2ofgaCIJdG7fGKmNXiaFzS3UiapeckpA/640?wx_fmt=png)  
这种方案是适用于 vue 3.x，对于 vue 2.x 的项目则需要使用 "@vue/composition-api" 来兼容 getCurrentInstance 等 API。经过实践发现本文的项目的 antv 的版本是 1.x 的，无法支持 appContext 参数，最终探索了最终的解决方案。

```
this.$confirm({  prefixCls: `${ANT_PREFIX}-modal`,  title: '正在上传，确定要停止吗？',  cancelText: '取消',  cancelButtonProps: {    props: {      prefixCls: `${ANT_PREFIX}-btn`,    },  },  okText: '停止',  centered: true,  okButtonProps: {    props: {      type: 'danger',      prefixCls: `${ANT_PREFIX}-btn`,    },  } asany,  onOk: () => {  },} asany)
```

confirm 类型定义中并不包含 prefixCls，因此需要使用 as any 忽略其类型校验，实际会透传到底层 rc-dialog 组件中。

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCt8pDve5VGBXX2z9X1nYX5qic0P08x1JHRRpMutDh8tIVVibhNXPmeWzS7aoxT839jEbmib3G5cOx5fA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)

紧追技术前沿，深挖专业领域

扫码关注我们吧！

![](https://mmbiz.qpic.cn/mmbiz_png/xsw6Lt5pDCtjXyYJCxLFFZuQmlqElQ3zEdNyg6AoqpFS9b6afTu4v9ibSZ9NYnkxwhv0ECBAicicwvTSpQJ75jy2w/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_gif/7QRTvkK2qC6D2OhibHUMz1XiaC7v0RcUA1thKEXck4AzcEnKnOXEHJibw1OEpzrL0n2O4FNrfgNaAZRcDyzDkKqiaw/640?wx_fmt=gif)