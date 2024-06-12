> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/BnmvY2QEAyHau9f6TMJAZA)

前言
--

```
大厂技术  高级前端  Node进阶

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

```

刚做完公司项目的新架构，决定使用 TS 来解决项目中的类型问题，但是在写接口类型的时候，发现了一个问题，就是接口类型的定义，如果是一个复杂的类型，那么就会变得非常的麻烦。

每个接口的 request,response 不能说一点不相同，只能说完全不相同。甚至写类型的时间比写逻辑的时间都长。往往写到一半 TS 变成了 AS。回过头来又对自己写 AS 的行为感到羞愧。

后来聪明的我想，Java 他还能不写 VO 类吗？他写了我能不能直接用？

然后就有了这篇文章。

前言
--

如何能获取到 Java 的 VO 类呢？作为前端开发，我们能获取到的数据只有接口文档，那么我们能不能通过接口文档来生成 VO 类呢？

答案是肯定的。

获取到接口文档后，一开始甚至想自己写套转换工具。写着写着发现，这个工具的难度比写接口类型还大。于是放弃了。

然后，swagger-typescript-api 出现了。

swagger-typescript-api
----------------------

swagger-typescript-api[1];

*   通过 swagger 方案生成 api。
    
*   支持 OA 3.0、2.0、JSON、yaml
    
*   生成的 api 模块使用 Fetch Api 或 Axios 发出请求。
    

开始
--

官方提供了两种使用方式。使用 npx 或者使用 node 的方式进行；个人建议还是使用 node 的方式，可以按照个人或公司的实际需求进行。该插件核心是通过解析 swagger 文档，通过模板生成 TS 类型甚至连 ajax 请求都替我们写好了。

支持 ajax 和 fetch 两种请求方式。

模板
--

通过源码的阅读，在 / templates 下内置了 3 套模板

*   base
    
*   default
    
*   modular
    

> default 生成单个 api 文件，modular 可以根据指定的命名空间生成多个 api 文件，base 既可以生成单个 api 文件可以生成多个 api 文件；

举个简单的例子：接口文档有 User，Book 两个 controller

*   default 会将 User 和 Book 生成在同一个 api 文件中
    

```
// api.ts
UserApi,
BookApi


```

*   modular 会将 User 和 Book 分别生成在不同的 api 文件中
    

```
// user.ts
UserApi


```

```
// book.ts
BookApi


```

我们通常使用 base 模板中的 modular 模式来使用。没有人会想不同模板的接口放在一个页面中维护吧。为什选择 base 模板，因为 base 模板提供了更全面的配置模板。

模板配置详解
------

base 模板中的模板文件如下

*   api.ejs- （生成文件） Api 类模块
    
*   data-contracts.ejs- （生成文件）来自 swagger 模式的所有类型
    
*   http-client.ejs- （生成文件） HttpClient 类模块
    
*   procedure-call.ejs- （子模板） Api 类中的路由
    
*   route-docs.ejs- （生成文件） Api 类中的路由文档
    
*   route-name.ejs- （子模板） Api 类中的路由名称
    
*   route-type.ejs- （--route-types 选项） （子模板）
    
*   route-types.ejs- (--route-types 选项) (子模板)
    
*   data-contract-jsdoc.ejs- (子模板) 为数据合约生成 JSDOC
    

我们常用的有着重讲解

*   base/route-docs.ejs
    
*   api.ejs
    
*   procedure-call.ejs
    
*   axios-http-client.ejs
    
*   http-client.ejs
    
*   route-type.ejs
    

讲解开始前来一段 swagger 的文档, 结合着看

```
{
  "swagger": "",
  "info": "",
  "host": "",
  "basePath": "",
  "tags": [
    {
      "name": "通用接口",
      "x-order": "2147483647"
    }
  ],
  "paths": {
    "post": {
      "tags": [
        "通用接口"
      ],
      "summary": "获取活动列表",
      "operationId": "getActivityPageListUsingPOST",
      "consumes": [
        "application/json"
      ],
      "produces": [
        "*/*"
      ],
      "parameters": [
        {
          "in": "body",
          "name": "request",
          "description": "request",
          "required": true,
          "schema": {
            "originalRef": "CommonActivityPageRequest",
            "$ref": "#/definitions/CommonActivityPageRequest"
          }
        }
      ],
      "responses": {
        "200": {
          "description": "OK",
          "schema": {
            "originalRef": "IPage«CommonActivityPageResponse»",
            "$ref": "#/definitions/IPage«CommonActivityPageResponse»"
          }
        },
        "201": {
          "description": "Created"
        },
        "401": {
          "description": "Unauthorized"
        },
        "403": {
          "description": "Forbidden"
        },
        "404": {
          "description": "Not Found"
        }
      },
      "x-order": "2147483647"
    }
  },
  "definitions": {
    "CommonActivityPageResponse": {
      "type": "object",
      "properties": {
        "activityName": {
          "type": "string",
          "description": "活动名称"
        },
        "activityType": {
          "type": "integer",
          "format": "int32",
          "description": "活动类型"
        },
        "title": "CommonActivityPageResponse"
      }
    }
  }
}


```

其中主要部分包含 tags, path，definitions，根据其中信息，使用插件生成后的代码如下

*   type.ts
    

```
// type.ts
/** CommonActivityPageRequest */
export interface CommonActivityPageRequest {
  /** 活动名称，支持模糊查询 */
  activityName?: string;
  /** 活动类型，支持多选 */
  activityType?: number[];
}


```

*   http-client.ts （部分代码）
    

```
// http-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, HeadersDefaults, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}
export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

...sth

export const httpRequest = new HttpClient();


```

*   common.ts
    

```
// commion.ts
/**
 * @tags 通用接口
 * @summary 获取活动列表
 * @request POST:/common/getActivityPageList
 */
export const getActivityPageList = (request: CommonActivityPageRequest): Promise<IPageCommonActivityPageResponse> => {
  return httpRequest({
    url: '/common/getActivityPageList',
    method: 'post',
    data: request,
  });
};


```

### route-docs.ejs

该模板是用于生成 API 接口文档的 JSDoc 注释的。它会解析 Raw API 规范数据, 并生成符合 JSDoc 标准的注释文档。

主要逻辑如下:

1.  从 Raw API 规范数据中提取出描述信息, 生成 @description 注释。
    
2.  提取 tags、summary 等信息, 生成对应注释。
    
3.  生成 @request 注释, 标注请求方法和路径。
    
4.  如果有响应信息, 遍历生成 @response 注释, 包含状态码、响应类型等信息。
    
5.  使用模板字符串拼接所有信息, 组成完整的 JSDoc 注释块。
    
6.  返回包含 description 和 lines(注释细节) 两个字段的对象。
    

上方解析结果中的注释部分由该文件控制。

### api.ejs

用来生成 API 服务接口的 TypeScript client 代码的。通用与 procedure-call.ejs 一起使用，主要包含以下几个方面

1.  导入必要的类型, 包括 HttpClient、响应类型等。
    
2.  如果使用了数据合约 (Data Contracts), 导入生成的数据合约类型。
    
3.  遍历所有 API 路由, 为每个路由生成一个方法, 调用 HttpClient 发送请求。
    
4.  使用 ejs 模板引擎, 渲染 procedure-call 模板, 生成每个方法的具体代码。
    
5.  procedure-call 模板会包含方法名、请求配置、响应类型解析等代码。
    
6.  最终生成的 TypeScript 代码可以直接用于前端调用后端 API。
    
7.  只需要导入这个生成的模块, 就可以轻松调用各个接口, 不需要再手写重复的请求代码。
    

### procedure-call.ejs

api.ejs 中所需的生成模板内容，它通过模板引擎, 根据 API 路由配置自动生成发起请求的函数。主要功能包括:

1.  引入 httpRequest 方法, 用于发起请求。
    
2.  根据路由配置, 渲染方法签名、请求参数等。
    
3.  插入由其他模板生成的 JSDoc 注释, 作为方法注释。
    
4.  构造 httpRequest 配置, 包含方法、URL、查询参数、请求体等。
    
5.  根据响应类型, 设置返回 Promise 的泛型类型。
    
6.  如果有安全性配置, 生成安全验证参数。
    
7.  支持从请求参数中提取查询参数、路径参数等。
    
8.  设置请求体和响应体的内容类型 / 格式。
    
9.  支持测试环境配置不同的实例。
    

### axios-http-client.ejs

生成 http 客户端的模板。主要用途如下:

1.  定义了各种请求和响应相关的类型, 如请求参数、响应格式等接口。
    
2.  实现了 HttpClient 类, 封装了 axios 的实例, 并定义了请求拦截、安全校验等逻辑。
    
3.  提供了请求方法 request, 根据传入的请求参数, 构造 axios 请求配置, 发送请求。
    
4.  支持处理不同的请求数据格式, 如 JSON、文本、FormData 等。
    
5.  支持响应格式化, 和安全性校验。
    
6.  请求方法返回 Promise, 并根据配置处理响应结果。
    
7.  默认导出一个 HttpClient 实例供外部使用。
    
8.  根据配置生成目标代码, 开发者只需导入使用这个 HTTP 客户端即可, 简化了 HTTP 请求逻辑的编码。
    

### http-client.ejs

生成 http 客户端的入口文件在此可在初始化时选择使用 fetch or axios；

### route-type.ejs

生成接口的 request 和 response 类型，主要是通过 definitions 中的数据生成的。

1.  导入数据合约 (Data Contracts) 类型, 如果配置了按模块分割数据合约的话。
    
2.  使用模块名生成接口命名空间, 如 UserApi。
    
3.  遍历所有模块下的路由配置。
    
4.  对每个路由, 调用 route-type.ejs 模板, 渲染接口类型定义。
    
5.  route-type.ejs 模板会生成每个接口的类型签名, 包含请求参数、响应类型等。
    
6.  最终会组织成一个命名空间, 导出所有接口类型。
    
7.  开发者可以直接导入这个生成的类型模块, 在代码中使用接口类型, 带来良好的代码提示、检查等支持。
    
8.  不需要手写或者维护接口类型定义, 可以通过接口定义直接生成。
    

初始化
---

此时的目录结构应该如下：

```
｜- templates
｜ - | - base 
｜ - | - | - route-docs.ejs
｜ - | - api.ejs
｜ - | - procedure-call.ejs
｜ - | - axios-http-client.ejs
｜ - | - http-client.ejs
｜ - | - route-type.ejs
｜ - generator.js


```

我们通常在 generator 进行初始化。具体配置参照官方文档

我的配置文件

```
const options = {
  url: openApiUrl,     //openapi接口url
  output: outputDir,   //输出目录
  templates: path.resolve(__dirname, 'templates'), //模板目录
  modular: true,                // 为客户端、数据类型和路由生成单独的文件
  cleanOutput: false,            //清除输出目录
  enumNamesAsValues: false,
  moduleNameFirstTag: false,
  generateUnionEnums: false,
  extractRequestBody: true,     // 生成请求体类型
  extractRequestParams: true,   //提取请求参数,将路径参数和查询参数合并到一个对象中
  unwrapResponseData: true,     // 从响应中展开数据项 res 或 res.data
  httpClientType: 'axios',      // 可选 'fetch'     //http客户端类型
  defaultResponseAsSuccess: false,
  generateClient: true,        //生成http客户端
  generateRouteTypes: false,   //生成路由器类型
  generateResponses: false,     //生成响应类型
  defaultResponseType: 'void',
  typePrefix: '',              // 类型前缀
  typeSuffix: '',              // 类型后缀
  enumKeyPrefix: '',           // 枚举key前缀
  enumKeySuffix: '',           // 枚举key后缀
  addReadonly: false,          // 设置只读
  /** 允许根据这些额外模板生成额外文件,请参阅下文 */
  extraTemplates: [],
  anotherArrayType: false,
  fixInvalidTypeNamePrefix: 'Type',   //修复无效类型名称前缀
  fixInvalidEnumKeyPrefix: 'Value',   //修复无效枚举键前缀
  hooks: {
    onPrepareConfig: (currentConfiguration) => {
      const config = currentConfiguration.config
      config.fileNames.httpClient = 'httpClient'   //http客户端文件名
      config.fileNames.dataContracts = 'types'     //类型文件名
      return {...currentConfiguration, config}
    },
    onFormatRouteName: (routeInfo, templateRouteName) => {
      if (routeInfo.method === 'get') {
        return `Get${lodash.upperFirst(routeInfo.moduleName)}Request`;
      }
      return templateRouteName;
    },
    onPreParseSchema: (originalSchema, typeName, schemaType) => {
      if (originalSchema.type === 'integer' && originalSchema.format === 'int64') {
        originalSchema.type = 'string';
        originalSchema.format = 'string';
      }
    },
  }
};

generateApi(options)


```

其中 generateApi 方法是官方提供的方法，用于生成 api 文件。该方法返回 promise，可以在其生成后在进行其他额外的配置。

比如将首字母大写，将文件名改为 index.ts 等等。

```
generateApi(options).then(({files, configuration}) => {
  // do something
})


```

最后
--

我们只要在接口文档更新后，每次使用 node 执行 generator.js 文件即可每次更新。使用也只需要在需要的地方导入接口即可。

一个字真他妈爽！

注意
--

该插件已经投入生产环境使用，也遇到了一些问题。

对后端代码来说，注释规范要求极高。否则生成的接口文档会出现问题。

1.  vo 类不能出现非英文字符，否则会报错。
    
2.  接口如果存在使用 query 接受动态参数也会容易出错，前端解析后会出现 $ 字符导致解析失败。
    
3.  下载类接口返回流，无法生成 responseType: 'blob', 导致流解析失败。即使手动修改下载生成也会被覆盖。暂时解决 方案为约定末尾均为 export 字段在模板中加入。修改 axios-http-client.ejs 文件，在发起请求前加入。
    

> 作者：IAmor  
> 链接：https://juejin.cn/post/7295343805020274698  
> 来源：稀土掘金

结语
--

Node 社群

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下

```