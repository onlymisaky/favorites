> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/AU_Qu_naIO46H_qTp_iSBw)

#### 

大厂技术  高级前端  Node 进阶

点击上方 程序员成长指北，关注公众号

回复 1，加入高级 Node 交流群

前言  

大家设想一下，如果有一个超级大的表单页面，用户好不容易填完了，然后点击提交，这个时候请求接口居然返回 401，然后跳转到登录页。。。那用户心里肯定是一万个草泥马~~~

所以项目里实现`token无感知刷新`是很有必要的~

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKml1v96eXVrOdPVQ8uOS5ds4TbwYrrRDvIiaLicG5YBYq0z4O0usticCJA/640?wx_fmt=png)

这几天在项目中实践了一套`token无感知刷新`的方案，其实也有看了一下网上那些解决方案，也知道这类的方案已经烂大街了，但是感觉不太符合我想要的效果，主要体现在以下几个方面：

*   逻辑都写拦截器里，耦合性高，不太好
    
*   接口重试的机制做的，不太好
    
*   接口并发时的逻辑处理做的，不太好
    

我为什么不想要让这套逻辑耦合在拦截器里呢？一方面是因为，我想要写一套代码，在很多的项目里面可以用，把代码侵入性降到最低

另一方面，因为我觉得`token无感知刷新`涉及到了`接口重发`，我理解是接口维度的，不应该把这套逻辑放在响应拦截器里去做。。我理解重发之后就是一个独立的新接口请求了，不想让两个独立的接口请求相互有交集~

所以我还是决定自己写一套方案，并分享给大家，希望大家可以提提意见啥的，共同进步~

> 温馨提示：需要有一些`Promise`基础

思路
--

其实大体思路是一样的，只不过实现可能有差别~ 就是需要有两个 token

*   **accessToken**：普通 token，时效短
    
*   **refreshToken**：刷新 token，时效长
    

**accessToken** 用来充当接口请求的令牌，当 **accessToken** 过期时效的时候，会使用 **refreshToken** 去请求后端，重新获取一个有效的 **accessToken**，然后让接口重新发起请求，从而达到用户无感知 token 刷新的效果

具体分为几步：

*   1、登录时，拿到 **accessToken** 和 **refreshToken**，并存起来
    
*   2、请求接口时，带着 **accessToken** 去请求
    
*   3、如果 **accessToken** 过期失效了，后端会返回 401
    
*   4、401 时，前端会使用 **refreshToken** 去请求后端再给一个有效的 **accessToken**
    
*   5、重新拿到有效的 **accessToken** 后，将刚刚的请求重新发起
    
*   6、重复 1/2/3/4/5
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKdoMMgVlCKia8hicTjJxO1yuWw80xpk1sSTuDIu07OmyFoqowouE4WSMQ/640?wx_fmt=png)

有人会问：那如果 **refreshToken** 也过期了呢？

好问题，如果 **refreshToken** 也过期了，那就真的过期了，就只能乖乖跳转到登录页了~

Nodejs 模拟 token
---------------

为了方便给大家演示，我用 express 模拟了后端的 token 缓存与获取，代码如下图（文末有完整代码）由于这里只是演示作用，所以我设置了

*   **accessToken**：10 秒失效
    
*   **refreshToken**：30 秒失效
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKvM6F5VvHice4q13xI1liaGa4zkn63RDAhqfDhMJdqGtGq0fqmeFvsr4A/640?wx_fmt=png)

前端模拟请求
------

先创建一个`constants.ts`来储存一些常量（文末有完整源码)

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKWHPalehq46Z1bicZuzeaxNiasEvksASwLLnnvujhjaY5iaetU1TPlVfyg/640?wx_fmt=png)

接着我们需要对`axios`进行简单封装，并且模拟：

*   模拟登录之后获取双 token 并存储
    
*   模拟 10s 后 accessToken 失效了
    
*   模拟 30s 后 refreshToken 失效了
    

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfK91s7ueSHXDLicLmyT6QFtPtFyVomPA7BsQ9PtQvAOCcPsMxYCrJeLUA/640?wx_fmt=png)

理想状态下，用户无感知的话，那么控制台应该会打印

```
test-1test-2test-3test-4
```

打印`test-1、test-2`比较好理解

打印`test-3、test-4`是因为虽然`accessToken`失效了，但我用`refreshToken`去重新获取有效的`accessToken`，然后重新发起`3、4`的请求，所以会照常打印`test-3、test-4`

不会打印`test-5、test-6`是因为此时`refreshToken`已经过期了，所以这个时候双 token 都过期了，任何请求都不会成功了~

但是我们看到现状是，只打印了`test-1、test-2`

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKiaAdYRtEVibrfUlF9Yu6KGwcC2XHbPHTKm8ibEh75L593LQgibQCibJjfEQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKhXzQPiasnpsZRib47XaSIwcp5kyb6qmjWsMq5xaBsBjVjGlQZtwYNyIw/640?wx_fmt=png)

不急，我们接下来就实现 **token 无感知刷新**这个功能~

实现
--

我的期望是封装一个`class`，这个类提供了以下几个功能：

*   1、能带着`refreshToken`去获取新`accessToken`
    
*   2、不跟`axios`的`拦截器`耦合
    
*   3、当获取到新`accessToken`时，可以重新发起刚刚失败了的请求，无缝衔接，达到无感知的效果
    
*   4、当有多个请求并发时，要做好拦截，不要让多次去获取 accessToken
    

针对这几点我做了以下这些事情：

*   1、类提供一个方法，可以发起请求，带着`refreshToken`去获取新`accessToken`
    
*   2、提供一个 wrapper 高阶函数，对每一个请求进行额外处理
    
*   3/4、维护一个 promise，这个 promise 只有在请求到新`accessToken`时才会 fulfilled
    

并且这个类还需要支持配置化，能传入以下参数：

*   **baseUrl**：基础 url
    
*   **url**：请求新 accessToken 的 url
    
*   **getRefreshToken**：获取 refreshToken 的函数
    
*   **unauthorizedCode**：无权限的状态码，默认 401
    
*   **onSuccess**：获取新`accessToken`成功后的回调
    
*   **onError**：获取新`accessToken`失败后的回调
    

以下是代码（文末有完整源码）

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKg8sjt5mGwVicp5EQzc3zoGa4icktQjOzv7ygYO75Jn4M9trD9gFqmWqg/640?wx_fmt=png)

使用示例如下

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKN2Yk8FvzfmdeiaA6dOdiceFlfmVA4dfo48lvO2sDF56HEuHTWajYsCZw/640?wx_fmt=png)

最后实现了最终效果，打印出了这四个文本

![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKypLMkaLmN6WCicmqVl8fpFficV0XUWOJ3GE5tSOCZAxZ831ic6M8iaZ87g/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/TZL4BdZpLdiaKBjnwq2Cj7pgzgqGXFnfKrhPQIpd0H1KlYFiagP8xibQyoRDn9ibMFQm5vmcscS87nhg5brOCzb66A/640?wx_fmt=png)

完整代码
----

### constants.ts

```
// constants.ts// localStorage 存储的 keyexport const LOCAL_ACCESS_KEY = 'access_token';export const LOCAL_REFRESH_KEY = 'refresh_token';// 请求的baseUrlexport const BASE_URL = 'http://localhost:8888';// 路径export const LOGIN_URL = '/login';export const TEST_URL = '/test';export const FETCH_TOKEN_URL = '/token';
```

### retry.ts

```
// retry.tsimport { Axios } from 'axios';export class AxiosRetry {  // 维护一个promise  private fetchNewTokenPromise: Promise<any> | null = null;  // 一些必须的配置  private baseUrl: string;  private url: string;  private getRefreshToken: () => string | null;  private unauthorizedCode: string | number;  private onSuccess: (res: any) => any;  private onError: () => any;  constructor({    baseUrl,    url,    getRefreshToken,    unauthorizedCode = 401,    onSuccess,    onError,  }: {    baseUrl: string;    url: string;    getRefreshToken: () => string | null;    unauthorizedCode?: number | string;    onSuccess: (res: any) => any;    onError: () => any;  }) {    this.baseUrl = baseUrl;    this.url = url;    this.getRefreshToken = getRefreshToken;    this.unauthorizedCode = unauthorizedCode;    this.onSuccess = onSuccess;    this.onError = onError;  }  requestWrapper<T>(request: () => Promise<T>): Promise<T> {    return new Promise((resolve, reject) => {      // 先把请求函数保存下来      const requestFn = request;      return request()        .then(resolve)        .catch(err => {          if (err?.status === this.unauthorizedCode && !(err?.config?.url === this.url)) {            if (!this.fetchNewTokenPromise) {              this.fetchNewTokenPromise = this.fetchNewToken();            }            this.fetchNewTokenPromise              .then(() => {                // 获取token成功后，重新执行请求                requestFn().then(resolve).catch(reject);              })              .finally(() => {                // 置空                this.fetchNewTokenPromise = null;              });          } else {            reject(err);          }        });    });  }  // 获取token的函数  fetchNewToken() {    return new Axios({      baseURL: this.baseUrl,    })      .get(this.url, {        headers: {          Authorization: this.getRefreshToken(),        },      })      .then(this.onSuccess)      .catch(() => {        this.onError();        return Promise.reject();      });  }}
```

### index.ts

```
import { Axios } from 'axios';import {  LOCAL_ACCESS_KEY,  LOCAL_REFRESH_KEY,  BASE_URL,  LOGIN_URL,  TEST_URL,  FETCH_TOKEN_URL,} from './constants';import { AxiosRetry } from './retry';const axios = new Axios({  baseURL: 'http://localhost:8888',});axios.interceptors.request.use(config => {  const url = config.url;  if (url !== 'login') {    config.headers.Authorization = localStorage.getItem(LOCAL_ACCESS_KEY);  }  return config;});axios.interceptors.response.use(res => {  if (res.status !== 200) {    return Promise.reject(res);  }  return JSON.parse(res.data);});const axiosRetry = new AxiosRetry({  baseUrl: BASE_URL,  url: FETCH_TOKEN_URL,  unauthorizedCode: 401,  getRefreshToken: () => localStorage.getItem(LOCAL_REFRESH_KEY),  onSuccess: res => {    const accessToken = JSON.parse(res.data).accessToken;    localStorage.setItem(LOCAL_ACCESS_KEY, accessToken);  },  onError: () => {    console.log('refreshToken 过期了，乖乖去登录页');  },});const get = (url, options?) => {  return axiosRetry.requestWrapper(() => axios.get(url, options));};const post = (url, options?) => {  return axiosRetry.requestWrapper(() => axios.post(url, options));};const login = (): any => {  return post(LOGIN_URL);};const test = (): any => {  return get(TEST_URL);};// 模拟页面函数const doing = async () => {  // 模拟登录  const loginRes = await login();  localStorage.setItem(LOCAL_ACCESS_KEY, loginRes.accessToken);  localStorage.setItem(LOCAL_REFRESH_KEY, loginRes.refreshToken);  // 模拟10s内请求  test().then(res => console.log(`${res.name}-1`));  test().then(res => console.log(`${res.name}-2`));  // 模拟10s后请求，accessToken失效  setTimeout(() => {    test().then(res => console.log(`${res.name}-3`));    test().then(res => console.log(`${res.name}-4`));  }, 10000);  // 模拟30s后请求，refreshToken失效  setTimeout(() => {    test().then(res => console.log(`${res.name}-5`));    test().then(res => console.log(`${res.name}-6`));  }, 30000);};// 执行函数doing();
```

结语
--

### 

Node 社群  

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

```