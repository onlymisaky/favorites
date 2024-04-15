> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/IyGnceMl-vmQ_cGUxy7isw)

![](https://mmbiz.qpic.cn/mmbiz_gif/AAQtmjCc74DZeqm2Rc4qc7ocVLZVd8FOASKicbMfKsaziasqIDXGPt8yR8anxPO3NCF4a4DkYCACam4oNAOBmSbA/640?wx_fmt=gif)

**目录**

一、背景

二、大仓下组件共享方式

    1. 源码引入组件

    2. MF 远程组件

三、最佳实践

    1. 业务权限控制

    2. 埋点上报

    3. 降级方式

四、源码依赖结合 MF 模式

    1. 先源码引入后 MF

    2. 先 MF 后源码引入

五、未来 & 总结

    1. 未来  

    2. 总结  

**一**

**背景**

在 Monorepo 大仓模式中，我们把组件放在共享目录下，就能通过源码引入的方式实现组件共享。越来越多的应用愿意走进大仓，正是为了享受这种组件复用模式带来的开发便利。这种方式可以满足大部分代码复用的诉求，但对于**复杂业务组件而言，无论是功能的完整性，还是质量的稳定性都有着更高的要求。**源码引入的组件提供方一旦发生变更，其所有使用方都需要重新拉取 master 代码，然后构建发布才能使用新功能，这一特性对物料组件、工具组件以及那些对新功能敏感度较低的业务组件来说是可以接受的，但**对于新功能敏感度高的复杂业务组件来说，功能更新的不及时会直接面临着资损风险。**这类复杂组件也往往面临着频繁且快速的迭代发布，这样一来对于组件使用方而言不光需要订阅组件更新，而且需要做到及时发布升级才能规避风险，因此只用源码引入的方式来共享复杂业务组件是耗费精力且不合适的。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np22uZN7gEL4VyfCY21SA0NzAPQVexFviakRz4vwkVjrE3CKVRDblzb39g/640?wx_fmt=png&from=appmsg)

Webpack5 的 MF（Module Federation，模块联邦）有着动态集成多个构建的特性能够规避上述更新的问题。但同样也是把双刃剑，一旦远程组件提供方发挂了，其所有使用方也就不能正常使用，问题所造成的影响面也会被进一步放大。**从分布式风险转化为集中式风险后，权限管控、依赖关系、****业务埋点****各方面都需要考虑清楚，对组件的能力要求更高****。**而且 MF 远程组件本地开发代理复杂，无插件情况下本地至少要启两个服务进行调试，对电脑配置有一定要求，总的来说有一定上手成本。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2DIbib9rE0HibrHDjrpichu8oq8jaPD19up8h5yicLs04Kcfia2tpcTB19hQ/640?wx_fmt=png&from=appmsg)

那么，有没有一种共享方式能够保留两者的优点，又能对缺点进行规避。本文就基于这个目的从以下两点展开讨论：

*   对于共享复杂业务组件，如何做好权限控制、数据埋点以及平稳降级。
    
*   如何规避 MF 远程组件的稳定性风险、解决组件源码依赖发布更新等问题，保证稳定性的同时，降低本地开发门槛。
    

**二**

**大仓下组件共享方式**

Monorepo 大仓模式下跨应用共享组件的方式有很多，常用的是源码引入、模块联邦两种方式。本文不对这两种方式的原理展开介绍和讨论，先简单介绍下这两种方式在大仓下的使用方法。

**源码引入组件**

### 这种方式能解决大仓下大部分组件复用的需求，代码复用的便利性也是大家愿意走进大仓的原因之一。  

**组件提供**

#### 为了区分其他组件，可以在 / 业务域 /_share/remote-components 目录下开发远程组件。dx 是内部大仓的 CLI，cc 命令可以快速生成一个组件模板。

```
// 区分普通组件，新增一个remote-components组件目录
cd remote-components && dx cc order-detail
```

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np28Qq33bB2s4P6f7botJlaG5iaUFsy1odcHeZ3Z1VAmMoBkiareiaH2IEXg/640?wx_fmt=png&from=appmsg)

同样是 Monorepo，大仓组件的创建方式和 Lerna 新建物料组件类似。借助脚手架根据填写的内容就能生成模版，可以编写单测去自测组件变更，能一定程度的保证组件的健壮性，避免出现破坏性升级的问题。生成之后的模板目录结构如下图。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CDEcFGkCTAICUzqAdX5xjIEvIlicJricTq2XAdp7m1rxkW8ZuUPkhU1FibxicFQkoNtXribXAOBSSP5VA/640?wx_fmt=png&from=appmsg)

**组件使用**

#### **依赖注入、源码引用**

*   package.json 引入依赖，配置 `workspace:*`，构建时动态去取`_share/`目录下最新版本的组件资源。若从稳定性考虑，也可以固定版本号。
    

```
/** package.json */
"@demo/order-detail": "workspace:*"

/** 业务组件 */
import OrderDetail from '@demo/order-detail'

<OrderDetail {...props} />
```

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2eezRc8cEOvSRfFoynYK5Yl8R5Sr5VAfkMqficQU2t0iaoictDQJUbW8iaA/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2kf6pjYF0yMxxzbHiaaqAxj5e5VEicpPTktt231jRc3rlwNDFhkmDPiaug/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2VfZulVkwCGxkJ5Xj815UchqWb9PQgq1APeurTKzlsZkj7zY1SEpD4Q/640?wx_fmt=png&from=appmsg)

**总结**

**优点**：

*   开发便捷，本地只需启一个应用就能开发，调试方便。
    
*   若组件迭代发挂了，只会影响当前发布的应用，不影响其他使用方，能正常使用该组件，对普通组件和一些对新功能不敏感的业务组件来说是合适的。
    

**缺点**：

*   对新功能敏感度较高的复杂业务组件而言，使用方如果要更新版本需要重新拉代码构建部署，信息同步、发布投入成本较高。
    
*   由于大仓特性，代码变更权限很难做到管控，非组件提供方也能修改代码，组件 Owner 需要严格 CR 变更。
    

**MF 远程组件**

### **umi 4.0.48 +** 支持在 umi config 使用 MF 配置来使用 MF 的功能。umi4 可以直接从`@umijs/max`导出`defineConfig`，也可以使用`@umijs/plugins/dist/mf`插件去支持配置 MF 属性，本质也是对 WebPack Plugin 的封装，属性是类似的。不一样的点在于 **H****ost 不再需要通过配置 Exposes 将组件一个个的暴露出去，而是约定暴露 Exposes 目录下的组件**，十分方便。  

需要注意的是，该特性用到了 ES2021 的 Top-Level await，所以浏览器必须支持该特性。比如谷歌 Chrome 浏览器要在 89 版本以上。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np29a3aeYWRue8RsHDuU07NE5yTlytBMVHNr4uI2UCLO2mVs4GNInDMKQ/640?wx_fmt=png&from=appmsg)

```
/** 方法一：使用umijs/max导出的defineConfig */
import { defineConfig } from '@umijs/max';

export default defineConfig({
  // 已经内置 Module Federation 插件, 直接开启配置即可
  mf: {
    remotes: [
      {
        name: `remote${MFCode}`,
        aliasName: 'APP_A',
        entry: 'xxx/remote.js',
      },
    ],

    // 配置 MF 共享的模块
    shared,
  },
});
```

**组件提供**

用了该插件后，可在正常目录结构（/pages）下开发代码，**约定**在 Exposes 目录下新建对应组件引用，然后将其暴露出去。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2IUW2FpPnOl3IMFf9Z3rUxfa2ibRsZ4r2SXwHkxretzExaZQicILwAhew/640?wx_fmt=png&from=appmsg)

**之前**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2SwgG0YZm6vbqdKdMibUsic0sZHVKTChvgO0tnzoSpIVsmKibOSk8aSM7Q/640?wx_fmt=png&from=appmsg)

**现在**

**组件使用**

使用方也在 Config 配置 MF，可配置多个 Host，自己也能当 Host。然后使用`umijs/max`的`safeRemoteComponent` 异步注册组件。

```
/** 方法二：使用umijs/plugins/dist/mf的插件 */
import { defineConfig } from 'umi';

export default defineConfig({
  plugins: ['@umijs/plugins/dist/mf'], // 引入插件
  mf: {
    remotes: [
      {
        name: `remote${MFCode}`,
        aliasName: 'APP_A',
        entry: 'xxx/remote.js',
      },
    ],

    // 配置 MF 共享的模块
    shared,
  },
});
```

*   在 moduleSpecifier 配置使用的远程组件，规则为 Guest Remotes 配置的 `${aliasName}`和 Host Exposes 目录下的组件名。
    
*   在 FallbackComponent 配置远程组件加载失败的兜底。
    
*   在 LoadingElement 配置加载远程组件的过度状态。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2ibGCgLgCjYXOHglWOABOjX0HuW1ibcUPjMtF0Ls7d69BefKic81E2YwCg/640?wx_fmt=png&from=appmsg)

**总结**

**优点**：

*   非源码依赖，Host 组件更新，所有使用者都能马上同步新版本使用到新功能，节省了订阅发布的投入。
    
*   权限隔离，有 Host 应用权限才能开发组件。
    

**缺点**：

*   虽然 umi 已经能够集成代理了，需要注意资源跨域问题，但开发仍需要至少本地启两个项目。
    
*   如果 Host 发挂了，所有使用者的对应功能都受影响了。
    

**三**

**最佳实践**

简单介绍完两种大仓组件共享方式，进入本文的正题。

*   **权限管控**：复杂业务组件有着完整的功能，内部往往会请求很多接口，接口就伴随着权限分配的问题，如何不申请组件主系统权限就能将组件集成到自己的系统中。
    
*   **埋点上报**：前端 APM 平台能够记录用户行为进行上报，用于数据分析。不做任何处理会上报到组件主系统的应用中，组件使用方无法在自己的应用监控中接受这部分埋点数据。
    
*   **平稳降级**：质量问题是重中之重，作为复杂业务组件的使用方不关注组件具体业务逻辑的，但是需要考虑系统的整体稳定性不受引入的组件所影响。
    

**业务权限控制**

### 首先要确认系统权限的结构，大部分系统只用了系统权限校验，不过一些系统还有服务端的权限校验。  

**系统权限原理（401）**

通过系统**唯一编码去匹配接口 Header 头中的系统码字段**的方式去绑定权限组。如下图所示，左图是用来配置系统菜单和分配角色的平台，右图是没有匹配权限的接口就会报 401 状态码。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CDEcFGkCTAICUzqAdX5xjIfX37fnd2WxaqNdOqyp6LKu0UG26o9Spcny8LkOGvVR5LRIXpsuuSug/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CDEcFGkCTAICUzqAdX5xjIjicEAGt5FvLvhjCHOITFTPGcz3Db0Zacv4cw7svyXcFM0TlDYPAxF4g/640?wx_fmt=png&from=appmsg)

同样的，也是根据系统码去请求菜单，渲染菜单，这些逻辑大部分都是 umi 样板间 (plugin-proRoute/service/menu) 里实现了，可以在 src/.umi 下看到具体实现逻辑，注入 Backstagecode 的逻辑还是需要自己在 Request 配置里实现。

**业务权限原理（432）**

一些系统除了系统权限外还保留业务权限校验，**此校验通过 Redis 匹配用户登陆态进行鉴权**。没有匹配权限就会报 432 状态码。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CDEcFGkCTAICUzqAdX5xjIIIcoBCqib1b9mgUm02tk9ZvC2zbeOnqUbvE2KPvZH0sZibqdX3jFricbA/640?wx_fmt=png&from=appmsg)

其原理图如下，可通过 getTicketAuth 接口将登陆态写入 Redis，第一张图为 B 平台，依赖 A 系统登陆。第二张图为改造后，不再依赖 A 系统登陆，原理还是比较好理解的，就不展开了。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np23HkAWmFx5lIZNan6z9u0gTOOgqbjTkegYCldASwBtBGzPmWriccwrKQ/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2n1OUibb2Ch1a23FcRniaibcRfOdFQ2b2Qa0JyHql5dP2CDIHZO02L6FZQ/640?wx_fmt=png&from=appmsg)

**Request 方案**

根据权限原理可以知道， **权限管控问题的核心就是去考虑清楚什么时候该用什么系统码**，而我们塞系统码的任务都是由 Request 来做的。所以接下来我们先了解下常用的 Request 方案，如果组件双方的 Request 方式不一致怎么解决。

*   **proRequest**，通过内部 @xx/umi-request 引入。
    

已经停止维护了，但是一些早期迁移的应用都还在使用 proRequest。

App 入口或者 umi config 中配置 proRequest 属性。

```
//config.ts
 const APP_A_ENTRIES = {
  PROD: 'https://prod-a-env.com/xxxx/remote.js',
  DEV: 'https://dev-a-env.com/xxxx/remote.js',
  PRE: 'https://pre-a-env.com/xxxx/remote.js',
  TEST: 'https://test-a-env.com/xxxx/remote.js',
}

 const APP_B_ENTRIES = {
  PROD: 'https://prod-b-env.com/xxxx/remote.js',
  DEV: 'https://dev-b-env.com/xxxx/remote.js',
  PRE: 'https://pre-b-env.com/xxxx/remote.js',
  TEST: 'https://test-b-env.com/xxxx/remote.js',
}

 mf: {
    name: `remote${DemoCode}`,
    library: { type: 'window', name: `remote${DemoCode}` },
    remotes: [
      {
        /** app-A远程组件 */
        name: `remote${aMFCode}`,
        aliasName: 'appA',
        keyResolver: getEnv(),
        entries: ORDER_ENTRIES,
      },
      /** app-B远程组件 */
      {
        name: `remote${bMFCode}`,
        aliasName: 'appB',
        keyResolver: getEnv(),
        entries: IM_ENTRIES,
      },
    ],
    shared
  },
```

*   **Request** 、**基于 Request 的 crud 库**，通过 @umijs/Max 引入。
    

目前比较常用的 Request，有 crud 的方法，新迁移的应用都使用这个 Request，后续新应用也优先使用这个方法。

通过 Curd API 为 umi 的 Request 提供能力。

```
//config.ts
  export default defineConfig({
      // 其他配置
      proRequest: {},
  })

  //app.tsx
export const proRequest = {
  prefix: proxyFix,
  envConfig: {},
  headers: {
    backstageCode,
  },
  successCodes: [200, '200'],
};
```

通过请求配置拦截器去配置 Headers。

```
//utils

import { AxiosRequestConfig, request } from '@umijs/max';
import initCrudApiClass from '@/utils/api';

const CrudService = initCrudApiClass<AxiosRequestConfig>(({ url, ...config }) =>
  request(url as string, config).then((res) => res.data),
);

CrudService.registerApiOptions('default', {
  mapping: {
    paramsType: {
      read: 'data',
      remove: 'data',
      queryList: 'data',
      queryPage: 'data',
    },
  },
});
```

*   **Axios** 、**基于 Axios 的** **crud 库**，源码依赖。
    

原生支持，可以自适应 Request 配置。

功能集成在 utils 包中，需要单独源码引入。

```
// app.tsx

export const request: RequestRuntimeConfig = {
  baseURL: proxyFix,

  // 请求拦截器
  requestInterceptors: [
    (c: RequestConfig) => {
       /** 一些配置 */
      Object.assign(c.headers, {
         /** 其他配置 */
        backstageCode,
      });
      return c;
    },
  ],
  //响应拦截器
  responseInterceptors: [
    (res) => {
      /** 一些配置 */
      return res;
    },
  ],
  // 错误配置
  errorConfig: {
    errorHandler: (error) => {
      return errorhandlerCallback(error as ResponseError);
    },
  },
};
```

```
"@xxx/utils": "workspace:*"
通过请求配置拦截器去新增headers，会自动获取backstageCode，支持传递去修改
// src/app.tsx

import { RuntimeConfig } from '@umijs/max';

/**
 * @param instance - axios 实例，采用原生方式进行配置即可
 * @param setOptions - 配置函数
 */
export const configRequest: RuntimeConfig['configRequest'] = (instance, setOptions) => {
  instance.interceptors.request.use((c) => {
    // 默认携带了两个请求头：accessToken、backstageCode
    Object.assign(c.headers as object, {
      backstageCode，
    });

    return c;
  });

  setOptions({
    errorResponseHandler(error) {
      return undefined;
    },
  });
};
```

**组件双方的 Request 不一致怎么解决**

#### 系统 A 的 Reuqest 用的是 umijs/max 的，系统 B 的 Request 用的是 ProRequest。

#### 上面 2 个原理搞清楚了，这个问题也就迎刃而解。

*   首先，在业务组件中动态初始化 Request 配置，不能用 app.tsx 的配置，**接收组件使用方传过来的系统码动态注册 Request 实例。**
    

```
// 可以通过动态注册的方式初始化request，使用UmiRequest.requestInit方法。

 //被用作远程组件时，从远端拿到系统码，通过api改写headers配置

 enum BackstageCode {
     APP_A: 'CODE_A',
     APP_B: 'CODE_B',
     APP_C: 'CODE_C'
 }


 UmiRequest.requestInit({
    prefix: proxyFix,
    headers: {
      backstageCode: BackstageCode[props.code],
    },
  });
```

*   然后在提供远程组件时把依赖提供出去，使用方也不需要去安装其他版本的 Request。
    

```
// config.ts
 mf: {
    name: `remote${mfName}`,
    library: { type: "window", name: `remote${mfName}` },
    shared: {
      /** 其他依赖 */
      '@du/umi-request': {
        singleton: true,
        eager: true,
      }
    }
 }
```

```
import { safeRemoteComponent } from '@umijs/max';
import { Spin } from 'poizon-design';
import { SharedOrderDetail } from '@xxx/order-detail'
import React from 'react';

const MFOrderDetail = safeRemoteComponent<React.FC<Props>>({
  moduleSpecifier: 'Demo/OrderDetail',
  /** 将源码依赖的组件 */
 fallbackComponent: <SharedOrderDetail {...props} />,
  loadingElement: <Spin></Spin>,
});

const OrderDetailModule: React.FC<Props> = (props) => <MFOrderDetail key={props.name} {...props} />

export default OrderDetailModule;
```

  

**权限管控最佳实践**

下面的方案都是在跑的方案，都能正常使用，各有优劣，按需使用。

**方案一：****权限管控在组件提供方。**

组件使用方不需要关心页面权限，但访问页面的人需要申请 Host 系统的权限。

**对组件提供者很友好，对页面使用者很不友好，需要申请多个系统权限。**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CDEcFGkCTAICUzqAdX5xjIbsLqibMmN8z9FLug1wGq2icIruBARpm2ACY5iauncqtcxcBicHUvuPdCcA/640?wx_fmt=png&from=appmsg)

*   方案二：**权限管控在组件使用方**，将接口配置在自己的天网子系统下，改写系统码，需要注意资源跨域问题。
    

访问页面的人对权限无感知，但对开发者无论是组件使用方还是提供方都要做更多的处理。

使用者需要关心页面权限，并及时配置，**组件提供方要感知是哪个系统在用组件，并把 Request 配置及时修改，不然就走到组件主系统的权限里去了。**总结一句就是所有工作量都来到了组件维护者这边，不过不用担心，掌握上面说到的几点原理就能游刃有余地处理权限问题。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CDEcFGkCTAICUzqAdX5xjIjiclz4fNiat3cqruRkKiaRKKhTLQ4ZEYlYataj5UuZBNDTYLyqib5ImCrQ/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2VVpgRGGa19xXVfFHOgt4WqYYGkLny59mBAUaicPicSCs4av6ADZqkdvQ/640?wx_fmt=png&from=appmsg)

**埋点上报**

### 数据上报 SDK 也都支持系统码作为上报应用，同理可在 monitor.monitorInit 注册实例时传递系统码作为参数。  

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2HLJEg6k2iajSpxMOzk8IrwlZ2WrE3Y1CQuzK1Ol1oC678KCagFPm98w/640?wx_fmt=png&from=appmsg)

*   支持使用方通过传递 Source 或者上报配置给组件。
    

*   Host 根据 Source 帮助 Guest 维护上报配置，配置维护在 Host。
    
*   Host 根据 Guest 的传递的自定义配置，直接集成配置进行上报。
    

*   也可通过接口调用维度去分析数据。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2etImiaJESJ7c3IwibgZJRbTibQjcne3Ag6JNXvKNYqdQ42FRicRibw9o7CQ/640?wx_fmt=png&from=appmsg)

**降级方式**

*   #### **对于发挂的应用做到自动降级。**
    

*   #### **FallbackComponent**
    

前面说到 umi 支持配置远程组件降级方案，将源码依赖的组件传给 SafeRemoteComponent 的 FallbackComponent 属性，当远程组件挂载失败可以直接加载本地组件用作降级。

```
import FWIns from '@/config/fw-config';

const fw = FWIns.init({
  branchName: 'feature-base-main-xxx-xxx',
});

await fw.feature(
  async () => {
      /** 新逻辑，使用MF*/
     <MFComponent />
  },
  async () => {
      /** 老逻辑，使用源码依赖*/
    <SharedComponent />
  },
);
```

*   **开关**
    

对于远程组件挂载成功，但是功能不能正常使用的可用下面的方法。

*   #### **对于新功能未达到业务要求需要支持手动回退版本的降级。**
    

使用前端配置平台开关，开关开启走 MF 组件，开关关闭走源码引入组件，**后续可用主干研发模式替代**，也可通过监控告警阈值去做到自动降级。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np29n6Y9NpnBmK9d4pIqqSAMRfY9lekhQS6ia46njuAKV1sRehv8gf6sRQ/640?wx_fmt=png&from=appmsg)

**四**

**源码依赖结合 MF 模式**

**先源码引入后 MF**

### 在 _share/remote-components 目录下进行业务组件开发， 之后在子应用 Expose 目录下通过源码引入的方式使用组件，再暴露出去。用源码依赖的方式注入 MF 暴露的组件中，可以适配自动降级方案，代码片段如下。  

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2PS5ibeqUBl7zkmmX6ocbiccG3PUD9XXEVXtf5eCYL5QwGdhh0P4Ye9XA/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2pZKHdJ6fs8MHd9Hyh000odMj5WekwpwDG4PaSpWWr3ichKF4UubkCrA/640?wx_fmt=png&from=appmsg)

**先 MF 后源码引入**

### 在子应用编写组件，通过 Expose 方式提供远程组件，使用 Webpack Plugin 复制文件或者 Pre-Commit Hooks 的方式将组件代码同步至 Share 目录下，这样能够**利用源码依赖不会自动更新版本的特性用作降级**，优先使用实时更新的 MF 远程组件，降级使用源码引入的大仓组件，而且这个方法也能够管控开发权限。  

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74DQYRqcHQW6rs8Eymyia8np2wWQicDpSFCia70K54TibzQWhIHpXTNHngicv1L1icSY6BVay8oxu4C04q9A/640?wx_fmt=png&from=appmsg)

**五**

**未来 & 总结**

**未来**

**结合主干研发模式**

新逻辑使用 MF，老逻辑使用源码依赖。

  

**需要开发一些插件**

*   为了提升开发效率，需要一个将子应用的业务代码同步至是 Share 目录下的 WebPack 插件或者 Git Hooks。
    
*   目前接入 MF 不管是 Host 还是 Guest 都需要在 umi config 配置一些东西，这些配置大部分是重复的，可以通过插件方式注入，降低接入成本。
    
*   源码依赖大文件对构建速度有影响，需进一步比对构建产物进行优化。
    

**总结**

### 本文首先介绍了两种大仓下常用的共享组件方式，进行优劣势的分析，并对其大仓内外的用法进行比对。

*   **源码引入**：开发便捷，调试方便，组件稳定性较高；但对于复杂业务组件代码成本较高，开发权限管控较难。
    
*   **Module Federation**：动态集成，节省订阅发布成本，权限隔离；过于依赖组件 Host 稳定性，调试较复杂。
    

然后对于共享复杂业务组件的一些注意事项提出解决方案。

*   **权限管控**：组件权限可以管控在使用方也可以管控在提供方。如果管控在使用方，可以通过系统码去动态初始化 Request 实例，对于组件双方 Request 方式不一致，可通过 MF Shared 依赖的方式解决。
    
*   **埋点上报**：同样的，通过接收系统码去实例化监控 SDK，不做任何处理就上报到组件得主系统的应用中。
    
*   **平稳降级**：可以使用 FallbackComponent 对加载远程组件失败的情况做到自动降级，对于远程组件加载成功，功能发挂了或者新功能未达到业务要求的支持手动回退版本的降级。可利用源码依赖不会自动更新版本的特性用作开关**，**也可使用主干研发模式的能力去做降级。
    

最后聊了如何在大仓下基于源码依赖结合模块联邦的方式实现共享组件。

*   **先源码引入后 MF**：在 Share 目录下开发业务代码，在子应用 Expose 目录下通过源码引入使用组件，再暴露出去供使用者使用。
    
*   **先 MF 后源码引入**：在子应用正常目录下开发组件，通过 Expose 方式提供远程组件，编译时将业务代码同步至 Share 目录下。组件使用者可编写开关优先使用 MF 组件，再利用源码依赖不会自动更新版本的特性将源码依赖版本用作降级。
    

**往期回顾**

[1. 前端 monorepo 大仓权限设计的思考与实现｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247514194&idx=1&sn=c08cab11ec70f284dec66d3f69cd23d1&chksm=c161ed0df616641b8ce48932fadcaffc406343891a8eb5fcf1b43d05fed3e68d3c36f840c960&scene=21#wechat_redirect)  
[2. JVM STW 和 Dubbo 线程池耗尽的相关性｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247522085&idx=1&sn=2dbde65692a51ade7f942ae7f6035c99&chksm=c161c27af6164b6c59076fcc121e0816212e2fc6936a27f2b1b07e87734ff0f146ceb7b0880c&scene=21#wechat_redirect)  
[3. 大模型在产品原型生成中的应用实践｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247521456&idx=1&sn=0ecc393d411d03bc768011544d6b1f5c&chksm=c161c1eff61648f9f53bbf793e3b5af19b3c8d3662a47bf2ee28ccf1606d436bfc10912ef1ec&scene=21#wechat_redirect)  
[4. DartVM GC 深度剖析｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247521401&idx=1&sn=24c10848eccceecf76e5032ca57142c6&chksm=c161c126f61648301923866575a904b90665067f79dc58338810b361974b3401dd07039011dd&scene=21#wechat_redirect)  
[5. 互动游戏团队如何将性能体验优化做到 TOP 级别｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247521212&idx=1&sn=7fcb6ef435ea83905dc4f9eac5c3d8e1&chksm=c161c6e3f6164ff51f20256e3da661c53a7daffde2cb0347c1e1de2931997f0b8e00f25e30cd&scene=21#wechat_redirect)  
[6. 得物自动化平台执行器设计与实现](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247520208&idx=1&sn=82edddb58bb4fda7b2180eccd5569411&chksm=c161da8ff6165399ac1bb10d76225762f5f75e6cdd0155f6ec00ba764d07d731d339b35b4267&scene=21#wechat_redirect)  

* 文 / 昌禾

关注得物技术，每周一、三、五更新技术干货  
要是觉得文章对你有帮助的话，欢迎评论转发点赞~  
未经得物技术许可严禁转载，否则依法追究法律责任。

“

**扫码添加小助手微信**

如有任何疑问，或想要了解更多技术资讯，请添加小助手微信：

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CAGS6PldJufoMwZe4UZ1IwmaXQ5n9mkpElaPtrunYoYgbIB7sib5m1qD2jfErd5MZ449jicmLWqTZg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**线下活动推荐**

主题：得物技术沙龙 - 稳定生产专场

时间：2024 年 3 月 10 日（周日）14:00-18:00

地点：上海 · 杨浦区黄兴路 221 号互联宝地 C2 栋 5 楼培训教室（宁国路地铁站 1 号口）

活动亮点：本次得物技术沙龙 - 稳定生产专场主题为**全景应急保障 & 可观测性系统建设**，将在上海（线上同步直播）为你带来五个令人期待的演讲话题：

得物 NOC 团队负责人 - 夏玉好 -《得物全景应急保障体系建设》

得物可观测性平台产品负责人 - 袁国华 -《得物全景可观测性产品建设》

货拉拉监控组架构师 - 朱秋烨 -《货拉拉指标及报警系统经验分享》

云杉网络研发 VP - 向阳 -《eBPF 零侵扰分布式追踪的进展和探索》

云观秋毫 CEO - 苌程 -《打开程序执行盲区，构建故障根因推导》

希望通过以上话题的分享，以及得物技术沙龙 - 稳定生产专场这个交流平台，能够促进不同领域的同好者们知识和经验的共享，对内提升个人专业素养和技能水平，为职业发展打下良好基础，对外促进行业内的合作与交流，推动行业的发展和创新。

**快快点击下面图片报名吧~**

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74CU7S9201ewQqaCdPpoL0IYAjSoW4ZhqfCib2xFZ4DSXH4MmBdwXQGePwiccaSwNMUEgHxCyqRP9v1Q/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)