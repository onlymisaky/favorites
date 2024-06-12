> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/rkyK6lIXOneHGNZncIAUKQ)

> 本文作者系 360 奇舞团前端开发工程师

淘宝 NPM 镜像站切换新域名时，放了一张知乎博主 · 天猪 · 的图片，如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArUG8gPicgAkCZiaO2HF0Xicy8BRJAO0yeMAcibmKgPvTDK8Yiar941d6npLEjciaIs72dMqrLzLdDH9mA/640?wx_fmt=other&from=appmsg)

_图片来源：https://zhuanlan.zhihu.com/p/432578145

看着逐年增长的访问量，不禁让人感慨，npm 的出现，对 JavaScript 生态产生了深远影响。npm 包下载量的变迁，也是 JavaScript 生态体系发展的一个缩影，同时也是国内公司前端领域发展的一个缩影。

npm 的出现，让我们可以轻松使用第三方模块，也让我们可以轻松发布自己的模块。

随着企业的发展，公司内部对私有的 npm 源的需求越来越多，下面就来介绍一下，企业级 npm 私有仓库部署方案。

一、 为什么需要 npm 私有仓库
-----------------

我们从基本要求和扩展需求两个方面来分析。

1.  基本要求
    

*   安装速度快
    
*   内网访问
    
*   对接公司内部登录权限系统
    
*   支持私有包
    
*   避免公网 npm 服务不稳定
    

3.  扩展需求
    

*   安全审计，追踪依赖，及时发现安全问题
    
*   使用 AI 相关技术，自动产出项目老旧依赖升级建议
    
*   支持内部 npm cli 工具扩展更多功能
    
*   前端工程数字化建设，定制化数据统计分析功能
    

基本要求，是搭建企业级 npm 私有仓库的核心诉求；扩展需求，则是企业数字安全和团队工程化的诉求。当然，不同的团队有不同的需求，本质上就是为了安全和稳定，能依托 npm 服务做定制化服务。

二、开源项目方案
--------

既然要搭建企业级 npm 私有仓库，那么首先就要考虑开源项目。

有 nexus-public、verdaccio(sinopia 已停止更新)、cnpmcore(cnpmjs 已废弃) 等，其中 nexus-public 是 java 项目，其他都是 nodejs 项目。另外有收费的有 JFrog Artifactory，是通用通用存储库管理器，支持许多流行仓库包括 npm。

基本上，能做到私有化部署 npm 服务 + 对接公司内部权限系统，就能满足基本要求。

*   nexus-public 是 java 项目，能满足基本要求，如果公司有同步管理 maven、docker 等需求，可以考虑。
    
*   verdaccio 界面简洁，功能齐全，社区活跃，拥有 15k 的 star 数，是一个不错的选择。verdaccio 非常轻量，安装和配置都非常简单，可以通过插件，定制化包括身份验证、存储和通知等功能。
    
*   cnpmcore 是淘宝 NPM 镜像站服务 `npmmirror.com` 背后的核心，是基于 eggjs 开发的。
    

三、选择 cnpmcore
-------------

企业服务，要求数据和服务分离，既要保证数据的安全和可靠性，又要保证服务的持续升级迭代。

既然是内网私有化部署，不用面对公网的流量，更多的关注点在于，除了满足内网 npm 基本服务要求，更多的是企业定制化需求。

综合考虑各方需求后，我认为 cnpmcore 对于企业级 npm 私有仓库部署方案来说，是一个不错的解决方案。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEArUG8gPicgAkCZiaO2HF0Xicy2TTE0ZGN6yUtyJX3bYnt0LtUaZg4DjHNJaQfGv9fq7CNDVPN41fswA/640?wx_fmt=png&from=appmsg)

_图片来源: https://juejin.cn/post/7132723239813382151_

相比于前身 cnpmjs，cnpmcore 进行了重大的重构，cnpmcore 对我来说，看中的就是它的二次研发能力。

cnpmcore 部署比较简单，文档介绍的已经很详细了，主要步骤简单描述：

1.  依赖服务准备，MySQL 数据服务、Redis 缓存服务，包存储默认是本地文件系统，推荐使用对象存储服务
    
2.  源码下载，安装依赖，修改配置文件，启动服务
    

比起直接源码部署，我更推荐创建 `tegg` 项目，集成 cnpmcore 使用, cnpmcore 官方有提供详细的 `tegg` 集成示例。当前有个前提，你对于 `eggjs` 和 `tegg` 有一定的了解。

### 了解 cnpmcore 项目架构

首先放一下 cnpmcore 文档里的**架构分层依赖图**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEArUG8gPicgAkCZiaO2HF0XicyaSPX2Q7ZlJicRRbREAeSicquz3Jjibo7qQ1P9bIrqmHdFY0KMZFLv6YcA/640?wx_fmt=png&from=appmsg)

简单总结一下文档内容：

*   项目结构：项目按照功能进行了分层，包括 common（通用工具和服务调用）、core（核心业务逻辑）、repository（数据存储和查询）、port（HTTP 控制器）、infra（基于 PaaS 的基础设置实现）等。
    
*   Controller：主要处理 HTTP 请求，继承自 AbstractController 和 MiddlewareController。AbstractController 封装了一些基础的数据 Entity 访问方法，MiddlewareController 主要负责编排中间件的加载顺序。
    
*   请求合法性校验：请求合法性校验包括请求参数校验、用户认证和资源操作权限校验。请求参数校验使用 egg-typebox-validate，用户认证和资源操作权限校验通过 UserRoleManager 进行。
    
*   Service：依赖 Repository，然后被 Controller 依赖。PackageManagerService 管理所有包以及版本信息。
    
*   Repository：依赖 Model，然后被 Service 和 Controller 依赖。Repository 类方法命名规则包括 findSomething（查询一个模型数据）、saveSomething（保存一个模型数据）、removeSomething（移除一个模型数据）和 listSomethings（查询一批模型数据）。
    

由于 tegg 的存在，后续在定制化开发中，我们可以按需导出所需要的模块，然后进行二次开发。

四、定制化开发
-------

> 如何在 tegg 中集成 cnpmcore 是官方提供的集成示例，完整代码可以参考 这里。

### 准备工作

依赖的外部服务这里不多做赘述，既然是企业级，可以自行对接公司内部的 MySQL、Redis 服务。另外，准备对象存储服务 s3, 用于存储包文件。

**注意**: cnpmcore 是渐进式开发，mysql 数据结构会随着版本发生变动，升级 cnpmcore 时，一定要注意这里 https://github.com/cnpm/cnpmcore/tree/master/sql, 提前做好数据库表结构变更准备。

### 项目初始化

```
$ mkdir tegg-cnpm$ cd tegg-cnpm$ npm init egg --type=ts
```

初始化后的项目，是一个 tegg 项目，集成了 eggjs 和 tegg，这里先更新一下依赖。

然后，我们需要安装 cnpmcore 依赖，以及需要的一些依赖，如 @eggjs/tegg-orm-plugin、egg-typebox-validate、s3-cnpmcore 等。

### 配置文件

1.  修改 config/config.default.ts 配置文件，添加 cnpmcore 配置。
    

```
config.cnpmcore = {    name: 'mynpm',    sourceRegistry: 'https://registry.npmmirror.com',    ...    // sync mode    //  - none: don't sync npm package, just redirect it to sourceRegistry    //  - all: sync all npm packages    //  - exist: only sync exist packages, effected when `enableCheckRecentlyUpdated` or `enableChangesStream` is enabled    syncMode: SyncMode.admin,    syncDeleteMode: SyncDeleteMode.delete,    ...    registry: process.env.CNPMCORE_CONFIG_REGISTRY || 'http://localhost:7001', // 填写自己的域名    // white scope list    allowScopes: [      '@myscope', // 这里添加自己的 scope    ],    ...    // 默认的系统管理员    admins: {       // name: email      xxx: 'xxx@my.cn',    },    ...  };
```

2.  添加 nfs 配置，用于存储包文件
    

```
import S3Client from 's3-cnpmcore';...// 默认是本地文件系统config.nfs = {  client: null,  dir: join(config.dataDir, 'nfs'),};// 这里使用 s3 对象存储, s3-cnpmcore 是 cnpmcore 官方提供的 s3 对象存储实现, 当然可以不用这个，自己实现也可以config.nfs.client = new S3Client({    region: 'xx',    endpoint: 'http://xxx.com',    credentials: {      accessKeyId: '',      secretAccessKey: '',    },    bucket: 'cnpmcore',    forcePathStyle: false,    disableURL: false,  });
```

3.  修改 config/plugin.ts 配置文件，开启我们需要的插件，如下：
    

```
teggOrm: {    enable: true,    package: '@eggjs/tegg-orm-plugin',  },  typeboxValidate: {    enable: true,    package: 'egg-typebox-validate',  },
```

4.  添加 module.json
    

```
[  {    "path": "../app/service"  },  {    "path": "../app/infra"  },  {    "package": "cnpmcore/common"  },  {    "package": "cnpmcore/core"  },  {    "package": "cnpmcore/port"  },  {    "package": "cnpmcore/repository"  }]
```

其中 package 可以导出 cnpmcore 的模块，也可以用 path 导出自己的本地模块，具体参考 tegg 文档。

5.  写业务代码
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEArUG8gPicgAkCZiaO2HF0XicysUgtD7rR6xI0PtwMtbpOPXpMdGKzznpQhq6jiac0cMvA1ROQPjvicQYQ/640?wx_fmt=png&from=appmsg)文件结构

如图所示，在 infra 中，我们可以实现自己的 adapter，如 nfs 为例，这里实现了自己的 nfs adapter，用于存储包文件。如果在默认配置里，没有配置 nfs.client，那么就会使用默认的本地文件系统存储包文件。

以 AuthAdapter 为例，这里实现了自己的 AuthAdapter，用于对接公司内部的登录权限系统。

```
import { AccessLevel, EggContext, SingletonProto } from '@eggjs/tegg';import { AuthAdapter } from 'cnpmcore/infra/AuthAdapter';import { randomUUID } from 'crypto';import { AuthUrlResult, userResult } from 'node_modules/cnpmcore/dist/app/common/typing';const ONE_DAY = 3600 * 24;@SingletonProto({  name: 'authAdapter',  accessLevel: AccessLevel.PUBLIC,})export class MyAuthAdapter extends AuthAdapter {  async getAuthUrl(ctx: EggContext): Promise<AuthUrlResult> {    const sessionId = randomUUID();    await this.redis.setex(sessionId, ONE_DAY, '');    const registry = ctx.app.config.cnpmcore.registry;    const ssoLoginUrl = ctx.app.config.ssoLoginUrl;    const ref = encodeURIComponent(`${registry}/cli/login/sso/${sessionId}`);    return {      loginUrl: `${ssoLoginUrl}?ref=${ref}`,      doneUrl: `${registry}/-/v1/login/done/session/${sessionId}`,    };  }  async ensureCurrentUser(): Promise<userResult | null> {    if (this.user) {      return this.user;    }    return null;  }}
```

添加登录验证 Controller

```
import {  HTTPController,  HTTPMethod,  HTTPMethodEnum,  Context,  EggContext,  HTTPParam,  HTTPQuery,  HTTPBody,  Middleware,  Inject,} from '@eggjs/tegg';import { EggLogger, EggAppConfig } from 'egg';import { traceMethod } from '../middleware/trace_method';import { LoginService } from '../service/LoginService';import { CacheAdapter } from 'cnpmcore/common/adapter/CacheAdapter';import { UserService } from 'cnpmcore/core/service/UserService';@HTTPController()@Middleware(traceMethod)export class LoginController {  @Inject()  private readonly loginService: LoginService;  @Inject()  protected userService: UserService;  @Inject()  private cacheAdapter: CacheAdapter;  @Inject()  protected config: EggAppConfig;  @Inject()  private readonly logger: EggLogger;  @HTTPMethod({    method: HTTPMethodEnum.GET,    path: '/cli/login/sso/:sessionId',  })  async cliLogin(@Context() ctx: EggContext, @HTTPParam() sessionId: string, @HTTPQuery() sid: string) {        if (!sessionId) {      return { success: false, data: { message: 'need sessionId' } };    }      // 验证 sessionId 是否有效    const sessionData = await this.cacheAdapter.get(sessionId);    if (sessionData !== '') {      return { success: false, data: { message: 'invalid sessionId' } };    }    // 通过自己实现的 loginService 获取用户信息    const user = await this.loginService.getUser(ctx, sid);    if (!user?.name || !user?.email) {      return { success: false, data: { message: 'invalid user info' } };    }    // 通过 cnpmcore UserService 保存 token    const { token } = await this.userService.ensureTokenByUser({ name: user.name, email: user.email, ip: ctx.ip });    await this.cacheAdapter.set(sessionId, token!.token!);    // return { success: true, data: { message: 'login success' } };    // 跳转到登录成功页    ctx.redirect(`${this.config.cnpmcore.registry}/-/v1/login/request/success`);    return;  }}
```

### 前端部分

上面讲了服务端定制化开发，对于前端部分，cnpm 提供了 https://github.com/cnpm/cnpmweb，可以直接下载源码使用，也可以根据自己的需求进行二次开发，这里就不多做赘述了。

五、总结
----

cnpmcore 对于企业级 npm 私有仓库部署方案来说，是一个不错的选择。通过在 tegg 中集成 cnpmcore，我们可以很方便的进行 npm 服务的二次开发，扩展自己的业务代码，满足企业定制化需求。

### 参考资料

1.  https://juejin.cn/post/7132723239813382151
    
2.  https://github.com/cnpm/cnpmcore
    
3.  https://github.com/cnpm/cnpmcore/blob/master/INTEGRATE.md
    
4.  https://github.com/verdaccio/verdaccio
    

- END -

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，代表集团参与 W3C 和 ECMA 会员（TC39）工作。奇舞团非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)