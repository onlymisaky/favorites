> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/oLQePab5tuvOm8qQdpK7XA)

在现代 Web 应用中，用户认证是保障系统安全的核心环节。随着前后端分离架构的普及，传统的 Session 认证方式逐渐被 Token 认证取代。其中，**「双 Token（Access Token + Refresh Token）机制」**凭借其在安全性与用户体验之间的出色平衡，成为主流的认证方案。本文将结合完整的 Express 后端与 Vue 前端代码，详细解析双 Token 机制的实现原理与实践细节。

双 Token 机制的核心原理
---------------

双 Token 机制通过两种不同特性的令牌协同工作，解决了 "安全性" 与 "用户体验" 之间的矛盾。其核心设计思想是：

*   **「Access Token（访问令牌）」** ：短期有效，用于直接访问受保护资源，有效期通常设置为几分钟（示例中为 12 秒，仅用于演示）
    

*   **「Refresh Token（刷新令牌）」** ：长期有效，仅用于获取新的 Access Token，有效期可设置为几天甚至几周（示例中为 7 天）
    

这种设计的优势在于：当 Access Token 被盗取时，攻击者仅有很短的时间窗口可以利用；而 Refresh Token 虽然长期有效，但通常存储在更安全的环境中，且一旦发现异常可立即吊销。

后端实现：Express 框架下的双 Token 系统
---------------------------

后端作为 Token 的签发者和验证者，承担着整个认证系统的核心逻辑。以下从初始化配置、核心工具函数、认证中间件到具体接口，逐步解析实现过程。

### 基础配置与依赖

```
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:5174', 
        'http://localhost:5175', 'http://localhost:5176'
    ],
    credentials: true // 允许跨域请求携带Cookie
}));
app.use(express.json());
app.use(cookieParser());
```

这段代码完成了三件关键工作：

1.  引入 Express 框架及必要中间件（cors 处理跨域，cookie-parser 解析 Cookie）
    

2.  配置跨域规则，允许指定前端域名访问并支持跨域携带 Cookie
    

3.  启用 JSON 请求体解析和 Cookie 解析功能，为后续处理打好基础
    

### 令牌存储与核心工具函数

```
// 内存存储（生产环境应使用Redis或数据库）
const accessTokens = new Map();
const refreshTokens = new Map();
// 获取当前时间戳（秒）
function now() {
    return Math.floor(Date.now() / 1000);
}
// 生成带前缀的随机令牌
function getRandom(prefix) {
    return `${prefix}-${Math.random().toString(26).slice(2)}${Date.now()}`;
}
```

为模拟令牌存储，示例使用 Map 对象临时存储令牌信息。在生产环境中，应替换为 Redis 等分布式存储系统，以支持多实例部署和令牌过期自动清理。

#### 令牌签发函数

```
function getAccessToken(userId, ttlSec = 12) {
    const at = getRandom('AccessToken');
    accessTokens.set(at, { userId, expiresIn: now() + ttlSec });
    return at;
}
function getRefreshToken(userId, ttlSec = 3600 * 24 * 7) {
    const rt = getRandom('RefreshToken');
    refreshTokens.set(rt, { 
        userId, 
        expiresIn: now() + ttlSec, 
        revoked: false 
    });
    return rt;
}
```

这两个函数分别负责生成 Access Token 和 Refresh Token：

*   为令牌添加前缀便于区分类型
    

*   记录令牌关联的用户 ID 和过期时间
    

*   为 Refresh Token 额外添加 "revoked" 状态，支持主动吊销
    

#### 令牌验证与吊销函数

```
function verifyAccessToken(at) {
    const result = accessTokens.get(at);
    if (!result || result.expiresIn <= now()) return null;
    return result.userId;
}
function verifyRefreshToken(rt) {
    const result = refreshTokens.get(rt);
    if (!result || result.revoked || result.expiresIn <= now()) return null;
    return result.userId;
}
function revokeRefreshToken(rt) {
    const result = refreshTokens.get(rt);
    if (result) result.revoked = true;
}
```

验证函数通过检查令牌是否存在、是否过期、是否被吊销等状态，决定是否返回有效的用户 ID。这种设计确保了只有符合条件的令牌才能通过验证。

### 认证中间件：请求的第一道防线

```
app.use((req, res, next) => {
    // 登录、刷新、登出接口跳过验证
    if (['/auth/login', '/auth/refresh', '/auth/logout', '/login'].includes(req.path)) {
        return next();
    }
    // 从请求头获取AT
    const token = req.headers.token || '';
    const userId = verifyAccessToken(token);
    if (userId) {
        req.userId = userId; // 挂载用户ID到请求对象
        return next();
    }
    // 验证失败
    res.send({ status: 401, msg: "未登录或令牌过期" });
});
```

这个中间件实现了 "守门人" 功能：

*   对登录、刷新、登出等特殊接口直接放行
    

*   对其他所有请求验证 Access Token 的有效性
    

*   验证通过则将用户 ID 挂载到请求对象，供后续接口使用
    

*   验证失败则返回 401 错误，提示客户端进行处理
    

### 核心接口实现

#### 登录接口：令牌的初始发放

```
app.post('/auth/login', (req, res) => {
    const { username } = req.body || {};
    const userId = username || 'demoUser';
    const at = getAccessToken(userId, 12);
    const rt = getRefreshToken(userId);
    // 将RT存入httpOnly Cookie
    res.cookie('rt', rt, {
        httpOnly: true, // 禁止前端JS访问，防XSS攻击
        sameSite: 'lax', // 限制跨站请求携带，防CSRF攻击
        secure: false, // 本地开发为false，生产需设为true
        path: '/',
        maxAge: 7 * 24 * 3600 * 1000
    });
    res.send({ status: 200, data: at });
});
```

登录接口是用户获取初始令牌的入口：

1.  接收用户身份信息（示例简化为用户名）
    

2.  生成 Access Token 和 Refresh Token
    

3.  将 Access Token 直接返回给前端（通常存储在 localStorage）
    

4.  将 Refresh Token 存入 httpOnly Cookie，提升安全性
    

特别注意 Cookie 的配置：httpOnly: true 防止前端 JavaScript 访问，有效抵御 XSS 攻击；sameSite: 'lax'限制跨站请求携带 Cookie，降低 CSRF 攻击风险。

#### 令牌刷新接口：无感续期的关键

```
app.post('/auth/refresh', (req, res) => {
    const rt = req.cookies.rt; // 从Cookie获取RT
    if (!rt) return res.send({ status: 401, msg: '无刷新令牌' });
    const userId = verifyRefreshToken(rt);
    if (!userId) return res.send({ status: 401, msg: '刷新令牌失效' });
    // 令牌旋转：吊销旧RT，生成新RT和新AT
    revokeRefreshToken(rt);
    const newRt = getRefreshToken(userId);
    const newAt = getAccessToken(userId);
    // 写入新RT到Cookie，返回新AT
    res.cookie('rt', newRt, { ... });
    res.send({ status: 200, data: newAt });
});
```

刷新接口实现了 Token 的无感续期：

1.  从 Cookie 中获取 Refresh Token 并验证其有效性
    

2.  采用 "令牌旋转" 机制：吊销旧的 Refresh Token，生成新的一对令牌
    

3.  将新的 Refresh Token 存入 Cookie，新的 Access Token 返回给前端
    

令牌旋转机制大幅提升了安全性，即使 Refresh Token 被盗取，攻击者也只能使用一次。

#### 登出接口：安全终止会话

```
app.post('/auth/logout', (req, res) => {
    const rt = req.cookies.rt;
    if (rt) revokeRefreshToken(rt); // 吊销RT
    res.clearCookie('rt', { path: '/' }); // 清除Cookie中的RT
    res.send({ status: 200, msg: '已登出' });
});
```

登出接口通过吊销 Refresh Token 并清除 Cookie，确保用户会话被安全终止，防止后续被恶意使用。

前端实现：Vue 中的令牌管理
---------------

前端作为令牌的持有者和使用方，需要妥善处理令牌的存储、传递和刷新逻辑。以下从路由守卫、请求拦截器到页面组件，解析前端实现细节。

### 路由守卫：控制页面访问权限

```
router.beforeEach((to, from, next) => {
    // 处理URL中的token参数
    const token = to.query.token;
    if (token) {
        localStorage.setItem("token", token);
        next({ path: to.path, query: {} });
        return;
    }
    // 检查是否需要认证
    if (to.meta.requiresAuth) {
        const currentToken = localStorage.getItem('token');
        if (!isValidToken(currentToken)) {
            // 没有有效token，跳转到登录中心
            window.open(`http://localhost:5174/login?resource=${window.location.origin}${to.path}`);
            return;
        }
    }
    next();
})
```

路由守卫实现了页面级别的访问控制：

*   处理 URL 中携带的 token 参数，存储到 localStorage
    

*   对标记为需要认证的路由（如 / about），检查 token 有效性
    

*   没有有效 token 时，引导用户到登录页面
    

### Axios 拦截器：自动处理令牌

```
// 请求拦截器：添加token到请求头
request.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers || {}
    if (isValidToken(token)){
        config.headers.token = token;
    }else{
        localStorage.removeItem('token');
    }
    return config;
})
// 响应拦截器：处理token过期
request.interceptors.response.use(async (res) => {
    if (res.data && res.data.status === 401) {
        const original = res.config || {}
        if (original._retried) {
            // 已重试过仍失败，跳登录中心
            window.open(`http://localhost:5174/login?resource=${window.location.origin}`)
            return res;
        }
        original._retried = true
        if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = request.post('/auth/refresh', {})
                .then(r => {
                    if (r.data && r.data.status === 200) {
                        const newToken = r.data.data
                        localStorage.setItem('token', newToken)
                        return newToken
                    }
                    throw new Error('refresh failed')
                })
                .catch(() => {
                    localStorage.removeItem('token')
                    throw new Error('refresh failed')
                })
                .finally(() => {
                    isRefreshing = false
                })
        }
        try {
            const newToken = await refreshPromise
            original.headers.token = newToken
            return request(original)
        } catch (e) {
            window.open(`http://localhost:5174/login?resource=${window.location.origin}`)
            return res
        }
    }
    return res;
})
```

拦截器是实现 "无感刷新" 的核心：

*   请求拦截器自动为每个请求添加 Access Token
    

*   响应拦截器在收到 401 错误时，自动尝试刷新令牌
    

*   使用 isRefreshing 和 refreshPromise 避免并发刷新请求
    

*   刷新成功则用新令牌重试原请求，失败则引导用户重新登录
    

### 登录页面组件：处理身份验证

```
<script setup>
import request from "../server/request";
import { useRoute } from "vue-router";
import { watch, ref } from "vue";
const route = useRoute();
const resource = ref("");
const token = localStorage.getItem("token");
function windowPostMessage(token, resource) {
  if (window.opener) {
    window.opener.postMessage({ token }, resource.value)
  }
}
watch(
  () => route.query.resource,
  (val) => {
    resource.value = val ? decodeURIComponent(val) : "";
    if (token) {
      windowPostMessage(token, resource.value)
    }
  },
  { immediate: true }
);
function login() {
  request.get("/auth/login").then((res) => {
    const apitoken = res.data.data;
    localStorage.setItem("token", apitoken);
    windowPostMessage(apitoken, resource.value)
    window.location.href = `${resource.value}?token=${apitoken}`;
    window.close()
  });
}
</script>
```

登录页面处理用户身份验证流程：

*   通过 URL 参数接收跳转来源（resource）
    

*   登录成功后，通过 postMessage 通知父窗口
    

*   将新令牌通过 URL 参数传递给来源页面
    

*   关闭登录窗口，完成登录流程
    

### 双 Token 机制操作流程演示

为了更直观地理解双 Token 机制的实际运行过程，以下是一个 GIF 演示，展示了从用户登录到令牌刷新、访问资源以及登出的完整操作流程：

![](https://mmbiz.qpic.cn/mmbiz_gif/lCQLg02gtibsS4FMuaGtMKMyslBlrdnPMPH0NrazWic6HRbDGOkKSrupwyakhk2a0GaW1hJm8WgPMTjicX6M20qfA/640?wx_fmt=gif&from=appmsg#imgIndex=0)

演示内容说明：

1.  用户未登录时在 Home 页面跳转登录页面后输入信息并登录，前端获取 Access Token 并存储，Refresh Token 通过 Cookie 存储
    

2.  登录后访问受保护资源 / api1，请求头携带 Access Token，成功获取资源
    

3.  等待 Access Token 过期后再次访问 / api1，前端拦截 401 错误，自动调用刷新接口获取新令牌
    

4.  使用新的 Access Token 重新请求 / api1，成功获取资源，用户无感知
    

5.  点击登出按钮，前端清除本地存储的 Access Token，后端吊销 Refresh Token 并清除 Cookie
    

通过这个演示可以清晰看到，整个过程中用户无需多次输入账号密码，在 Access Token 过期时实现了无感续期，既保证了安全性又提升了用户体验。

双 Token 机制的安全性考量
----------------

双 Token 机制的安全性建立在多个层面的防护措施上：

1.  **「令牌存储安全」**：
    

*   Access Token 存储在 localStorage，便于前端管理但存在 XSS 风险
    

*   Refresh Token 存储在 httpOnly Cookie，防止前端 JS 访问，抵御 XSS 攻击
    

2.  **「通信安全」**：
    

*   生产环境应启用 HTTPS，防止令牌在传输过程中被窃听
    

*   合理设置 Cookie 的 secure 属性，确保仅通过 HTTPS 传输
    

3.  **「令牌生命周期」**：
    

*   Access Token 短期有效，减少被盗用后的风险窗口
    

*   Refresh Token 长期有效但支持主动吊销，平衡安全性与用户体验
    

4.  **「防御机制」**：
    

*   令牌旋转机制确保 Refresh Token 只能使用一次
    

*   sameSite Cookie 属性降低 CSRF 攻击风险
    

*   严格的令牌验证逻辑防止无效令牌被使用
    

总结与扩展
-----

双 Token 机制通过 Access Token 和 Refresh Token 的协同工作，在安全性和用户体验之间取得了出色的平衡。本文提供的完整代码实现了从令牌签发、验证、刷新到登出的全流程，包含了前端和后端的关键处理逻辑。

在实际应用中，还可以进一步扩展：

*   使用 Redis 等分布式存储替换内存存储，支持集群部署
    

*   实现令牌黑名单机制，处理已吊销但未过期的令牌
    

*   添加令牌撤销通知，在用户修改密码等场景立即失效所有令牌
    

*   结合 JWT（JSON Web Token）实现无状态令牌验证，减轻服务器负担
    

通过理解和实践双 Token 机制，开发者可以为 Web 应用构建更加安全、可靠的认证系统，为用户提供流畅的使用体验同时保障系统安全