> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ye4p-5dYHWdH5fKX9Cjd1A)

一、前言
----

在前端开发中，用户身份认证通常通过 Token 来实现。然而，Token 的有效期是有限的，过期后用户需要重新登录，这会影响用户体验。为了解决这个问题，**「Token 无感刷新」** 成为了一种常见的优化方案。本文将详细介绍如何实现 Token 无感刷新，并探讨其在高并发场景下的优化策略。

二、Token 基础与有效期痛点
----------------

### 1、Token 工作原理详解

（1）Token 身份认证：Token 是一种用于证明用户身份和授权的令牌，通常在用户登录成功后由服务器生成并返回给客户端。客户端在后续的请求中，会将 Token 携带在请求头或请求参数中发送给服务器，服务器通过验证 Token 的有效性来确认用户身份，并决定是否授权用户访问受保护的资源。

（2） 常见的 Token 类型有 JSON Web Token（JWT）和 OAuth 2.0 中的 Access Token 等。

（3） JWT 由三部分组成：Header（头部）、Payload（负载）和 Signature（签名）。Header 包含了令牌的类型和使用的签名算法；Payload 则携带了用户的相关信息，如用户 ID、用户名、权限等；Signature 用于验证 Token 的完整性和真实性。OAuth 2.0 的 Access Token 则是用于授权第三方应用访问资源服务器上的受保护资源。

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtibPlYTEbIQnic4lkl0kncRvNozhich26wAO5T4g7wYcYlChghknWTNojlqRtfvzq7J4NiausmNI6WdQ/640?wx_fmt=other&from=appmsg)

### 2、传统有效期设置弊端

<table><thead><tr><th><strong>「问题分类」</strong></th><th><strong>「具体问题」</strong></th><th><strong>「示例场景」</strong></th></tr></thead><tbody><tr><td><strong>「用户体验差」</strong></td><td><section>频繁重新登录：Token 有效期过短（如 15 分钟），用户需要频繁重新登录，影响体验。</section></td><td><section>用户正在填写一个长表单，Token 突然过期，提交失败，数据丢失。</section></td></tr><tr><td><section><br></section></td><td><section>突然中断：用户在操作过程中 Token 突然过期，导致请求失败，操作中断。</section></td><td><section><br></section></td></tr><tr><td><strong>「安全性问题」</strong></td><td><section>长期有效的 Token：Token 有效期过长（如 7 天），一旦泄露，攻击者可长期冒充用户 。</section></td><td><section>用户 Token 易被窃取，攻击者在 7 天内可以随意访问用户数据。</section></td></tr><tr><td><section><br></section></td><td><section>静态有效期：固定过期时间无法根据用户行为动态调整，增加安全风险。</section></td><td><section><br></section></td></tr><tr><td><strong>「高并发性能问题」</strong></td><td><section>集中过期：大量用户的 Token 在同一时间过期，导致服务端瞬间压力激增。</section></td><td><section>系统设置 Token 有效期为 1 小时，大量用户在整点时间 Token 过期，导致服务端刷新接口被挤爆。</section></td></tr><tr><td><section><br></section></td><td><section>重复刷新：多个并发请求同时检测到 Token 过期，可能触发多次刷新操作，浪费资源。</section></td><td><section><br></section></td></tr><tr><td><strong>「动态适配」</strong></td><td><section>固定有效期：无法根据用户行为（如活跃度、风险等级）动态调整 Token 有效期。</section></td><td><section>高风险操作（如支付）需要更短的 Token 有效期，而普通操作（如浏览）可以适当延长。</section></td></tr><tr><td><section><br></section></td><td><section>一刀切策略：所有用户使用相同的有效期设置，无法满足个性化需求。</section></td><td><section><br></section></td></tr></tbody></table>

三、什么是 Token 无感刷新？
-----------------

Token 无感刷新是指：当用户的 Access Token 过期时，系统能够自动刷新 Token，用户无需感知或手动操作。其核心目标是：

1.  **「提升用户体验」**：用户无需频繁登录。
    
2.  **「保障安全性」**：通过合理的 Token 管理，防止 Token 泄露或滥用。
    
3.  **「性能优化」**：无感刷新 token 能按需更新，使服务器可适时释放旧会话资源， 释放服务器性能，减轻服务器压力，提高稳定性。
    

#### 应用场景

适合那些需要长时间保持用户会话的应用程序：

1.  Web 应用程序 - 在单页应用（SPA）中，如使用 Vue.js、React 或 Angular 构建的应用，用户可能会在一个页面上停留很长时间而不进行任何操作，导致 token 过期。
    
2.  移动应用程序 - 移动应用通常长时间运行于后台，期间用户的 token 可能会过期。如果每次过期都需要用户重新登录，会影响用户体验。
    
3.  多设备同步 - 当用户在多个设备上登录同一账户时，若其中一个设备上的 token 过期，其他设备也可能会受到影响。
    
4.  实时通信应用（如聊天应用或在线协作工具）需要持续与服务器保持连接，以保证消息的即时传递。
    

四、Token 无感刷新技术实现
----------------

### **「1. 双 Token 机制（Access Token + Refresh Token）」**

这是最常见的无感刷新方案，通过两个 Token 实现：

1.  **「获得双 token」**：
    

*   用户登录，服务端返回 Access Token 和 Refresh Token，访问接口时则携带 access_token 访问
    
*   Access Token 访问令牌：短期有效（如 15 分钟），用于业务请求。
    
*   Refresh Token 刷新令牌：长期有效（如 7 天），用于刷新 Access Token。
    
*   核心价值：通过分离 Token 的生命周期，减少 Access Token 的刷新频率，同时提高安全性。
    

3.  **「Access Token 过期」**：
    

*   客户端检测到 Access Token 过期（如接口返回 401 错误）。
    
*   使用 refresh_token 请求新的 Access Token，客户端更新本地存储。
    

5.  **「重新请求」**：
    

*   使用新获取的 access_token 重新发起之前的请求
    

#### `注意点：`

*   Access Token 存储在客户端（如 `localStorage` 或内存）。
    
*   Refresh Token 存储在安全位置（如 **「HttpOnly Cookie」**），可有效防御 XSS 攻击（跨站脚本攻击）。
    

### 流程图

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtibPlYTEbIQnic4lkl0kncRvElvUPnc6fKplINlliaFJzuicNc6vh3ZVR1nicXrGNIHGDQrYHTjlomAYw/640?wx_fmt=other&from=appmsg)

### 代码实现

```
import axios from 'axios' const service = axios.create({baseURL: 'https://api.example.com', timeout: 10000 })// 请求拦截器：自动添加 Access Tokenservice.interceptors.request.use(config => {  const accessToken = localStorage.getItem('access_token');  if (accessToken) {    config.headers.Authorization = `Bearer ${accessToken}`;  }  return config;});// 响应拦截器：处理 Token 过期service.interceptors.response.use(  response => response,  async error => {    const originalRequest = error.config;    if (error.response?.status === 401 && !originalRequest._retry) {      originalRequest._retry = true;      try {        // 使用 Refresh Token 刷新 access Token        const accessToken = await refreshToken();        localStorage.setItem('access_token', accessToken);        // 更新请求头并重试原始请求        originalRequest.headers.Authorization = `Bearer ${accessToken}`;        return service(originalRequest);      } catch (refreshError) {        // 刷新失败，跳转登录      router.push('/login')      }    }    return Promise.reject(error);  });//刷新token函数async function refreshToken() {  try {    const response = await service.get('/refresh', {      params: {        token: getRefreshTokenFromCookie(); // 从 HttpOnly Cookie 获取 Refresh Token      },      timeout: 30000, // 单独设置超时时间    });    return response.data.accessToken; // 返回新的 access_token  } catch (error) {    // 清除本地存储的 token    localStorage.removeItem('access_token');    localStorage.removeItem('refresh_token');    throw error; // 抛出错误  }}export default service;
```

### 2. 前端定时刷新

在 Access Token 过期前主动刷新 Token，避免用户请求时突然过期。

1.  **「设置 Token 有效期」**：
    

*   Access Token 有效期 15 分钟。
    
*   在 Token 过期前 1 分钟主动刷新。
    

3.  **「定时刷新」**：
    

*   客户端定时检查 Token 的剩余有效期。
    
*   如果剩余时间小于阈值（如 1 分钟），则主动刷新 Token。
    

### 流程图

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtibPlYTEbIQnic4lkl0kncRvnWOzD90BuIG7XYmgmzEh5ac7zxVNLHmam56kWZqP63l1euoQbMWBHA/640?wx_fmt=other&from=appmsg)

### 代码实现

```
let refreshTimeout;// 检查并刷新 Token 的函数function checkAndRefreshToken() {  const accessToken = localStorage.getItem('accessToken');  if (accessToken) {    const expiresIn = getTokenExpiresIn(accessToken); // 获取 Token 剩余时间    if (expiresIn < 60) { // 剩余时间小于 60 秒      refreshAccessToken().then(newAccessToken => {        localStorage.setItem('accessToken', newAccessToken);        // 重新设置定时器        refreshTimeout = setTimeout(checkAndRefreshToken, (getTokenExpiresIn(newAccessToken) - 60) * 1000);      });    } else {      // 设置定时器，在过期前 1 分钟刷新      refreshTimeout = setTimeout(checkAndRefreshToken, (expiresIn - 60) * 1000);    }  }}// 初始化时启动检查checkAndRefreshToken();
```

### 3. 服务端主动刷新

服务端可以在每次请求时检查 Token 的剩余有效期，并在接近过期时返回新的 Token。

1.  **「服务端检查」**：
    

*   每次请求时，服务端轮询 Token 的剩余有效期。
    
*   判断，如果剩余时间小于阈值（如 1 分钟），返回新的 Access Token。
    

3.  **「客户端更新」**：
    

*   客户端检测到响应中包含新的 Token，更新本地存储。
    

### 流程图

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtibPlYTEbIQnic4lkl0kncRvvIqianFJInP0MWr7AZIgbyW7KL5eBPUTM7HMsNZnOZpD2Iu3U4JIVoQ/640?wx_fmt=other&from=appmsg)

### 代码实现

```
// 服务端逻辑app.use((req, res, next) => {  const accessToken = req.headers.authorization?.split(' ')[1];  if (accessToken) {    const expiresIn = getTokenExpiresIn(accessToken);    if (expiresIn < 60) { // 剩余时间小于 60 秒      const newAccessToken = generateAccessToken(req.user);      res.set('New-Access-Token', newAccessToken);    }  }  next();});// 客户端逻辑service.interceptors.response.use(response => {  const newAccessToken = response.headers['new-access-token'];  if (newAccessToken) {    localStorage.setItem('accessToken', newAccessToken);  }  return response;});
```

### 4. 双 token + 并发请求锁机制

**「1. 用户登录 & 获取双 Token」**

*   客户端：发送登录请求（账号密码 / 验证码等）
    
*   服务端：
    

*   验证身份后生成 `Access Token（短效）`  和 `Refresh Token（长效）`。
    
*   Access Token：返回给客户端存储（如 `localStorage`）。
    
*   Refresh Token：通过 `HttpOnly Cookie` 返回（防 XSS）。
    

**「2. 请求拦截器：设置请求头 token」**

*   配置请求头添加 token，判断请求 url, 设置不同 token
    

```
// 添加请求拦截器 service.interceptors.request.use(config => { if (config.url !== '/login') {   const accessToken = localStorage.getItem('access_token')   config.headers["Authorization"] = `Bearer ${accessToken}` } //判断是否是获取新token  if (config.url === '/refresh_token') {   const refreshToken = localStorage.getItem('refresh_token')   config.headers["Authorization"] = `Bearer ${refreshToken}` } return config},error => { return Promise.reject(error)})
```

**「3. 响应拦截器：检测 Token 过期（401 错误）处理」**

1.  判断返回 的 401，不是重新获取 token 的 401
    
2.  判断锁变量 `isRefreshing`：标记是否正在刷新 Token，则进行 token 刷新，处理高并发请求。
    
3.  请求队列 `processQueue`：存储等待刷新的请求。
    
4.  使用 refreshToken 请求新 accessToken
    
5.  处理队列中的其他请求，以及重新发起失败的请求
    
6.  释放锁
    

```
// 添加响应拦截器service.interceptors.response.use(  response => response, // 成功的响应直接返回  async error => {    const originalRequest = error.config;    //originalRequest._retry 是一个自定义属性，用于标记请求是否已经重试过。    //1、判断是不是token过期    if (error.response.status === 401 && !originalRequest._retry) {      originalRequest._retry = true; // 显式标记请求为重试      //2、并且不是重新获取token的401，则进行token刷新      if (!isRefreshing) {        isRefreshing = true;        // 重新请求access_token        try {          const accessToken = await refreshToken()          // 更新localstorage中的access_token          localStorage.setItem('access_token', accessToken);          //配置请求头          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;          // 处理队列中的其他请求          processQueue(null, accessToken);          // 重新发起失败的请求          return service(originalRequest)        } catch (err) {          // 处理队列中的请求          processQueue(err, null);          console.log("刷新token失败，跳转登录界面", err)          // 重定向到登录页          router.push('/login')        } finally {          isRefreshing = false;  //isRefreshing设置为false        }      }      else {        //如果正在刷新token,则将请求加入队列        return new Promise((resolve, reject) => {          failedQueue.push({ resolve, reject });        })      }    }    // 如果不是401错误，则直接抛出错误    return Promise.reject(error);  });
```

### 流程图

![](https://mmbiz.qpic.cn/mmbiz_jpg/lCQLg02gtibtibPlYTEbIQnic4lkl0kncRv1HiarSNneU3l38vPF7KNIoR7SQJjTVa4pnQP1WT0mS1kFQbm2jYfEfg/640?wx_fmt=other&from=appmsg)

### 代码实现

```
import axios from 'axios'const service = axios.create({  baseURL: 'https://api.example.com',  timeout: 10000})//是否正在刷新tokenlet isRefreshing = false;// 定义一个队列，用于存储失败的请求let failedQueue = [];// 处理队列中的请求const processQueue = (error, token = null) => {  failedQueue.forEach(prom => {    if (error) {      prom.reject(error); // 拒绝请求    } else {      prom.resolve(token);// 使用新的 token 重新发起请求    }  });  if (!error) {    failedQueue = []; // 只有在成功刷新 token 时才清空队列  }};//刷新token函数async function refreshToken() {  try {    const response = await service.get('/refresh', {      params: {        token: localStorage.getItem('refresh_token'),      },      timeout: 30000, // 单独设置超时时间    });    return response.data.accessToken; // 返回新的 access_token  } catch (error) {    // 清除本地存储的 token    localStorage.removeItem('access_token');    localStorage.removeItem('refresh_token');    throw error; // 抛出错误  }}// 添加请求拦截器 service.interceptors.request.use(  config => {    if (config.url !== '/login') {      const accessToken = localStorage.getItem('access_token')      config.headers["Authorization"] = `Bearer ${accessToken}`    }    //判断是否是获取新token    if (config.url === '/refresh_token') {      const refreshToken = localStorage.getItem('refresh_token')      config.headers["Authorization"] = `Bearer ${refreshToken}`    }    return config  },  error => {    return Promise.reject(error)  })// 添加响应拦截器service.interceptors.response.use(  response => response, // 成功的响应直接返回  async error => {    const originalRequest = error.config;    //originalRequest._retry 是一个自定义属性，用于标记请求是否已经重试过。    //1、判断是不是token过期    if (error.response.status === 401 && !originalRequest._retry) {      originalRequest._retry = true; // 显式标记请求为重试      //2、并且不是重新获取token的401，则进行token刷新      if (!isRefreshing) {        isRefreshing = true;        // 重新请求access_token        try {          const accessToken = await refreshToken()          // 更新localstorage中的access_token          localStorage.setItem('access_token', accessToken);          //配置请求头          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;          // 处理队列中的其他请求          processQueue(null, accessToken);          // 重新发起失败的请求          return service(originalRequest)        } catch (err) {          // 处理队列中的请求          processQueue(err, null);          console.log("刷新token失败，跳转登录界面", err)          // 重定向到登录页          router.push('/login')        } finally {          isRefreshing = false;  //isRefreshing设置为false        }      }      else {        //如果正在刷新token,则将请求加入队列        return new Promise((resolve, reject) => {          failedQueue.push({ resolve, reject });        })      }    }    // 如果不是401错误，则直接抛出错误    return Promise.reject(error);  });export default service;
```

总结
--

Token 无感刷新是一种提升用户体验和保障应用安全的有效技术, 有多种技术都能实现，但是各有优缺如下图:

<table><thead><tr><th><section>方法</section></th><th><section>适用场景</section></th><th><section>优点</section></th><th><section>缺点</section></th></tr></thead><tbody><tr><td><section>双 Token 机制</section></td><td><section>通用场景</section></td><td><section>安全性高，刷新频率低</section></td><td><section>需要服务端支持双 Token</section></td></tr><tr><td><section>前端定时刷新</section></td><td><section>高活跃用户</section></td><td><section>避免请求时突然过期</section></td><td><section>需要定时器管理</section></td></tr><tr><td><section>双 token + 并发请求锁机制</section></td><td><section>高并发场景</section></td><td><section>解决并发刷新问题</section></td><td><section>实现较复杂</section></td></tr><tr><td><section>服务端主动刷新</section></td><td><section>服务端可控性强的场景</section></td><td><section>客户端无需额外逻辑</section></td><td><section>服务端压力较大</section></td></tr></tbody></table>