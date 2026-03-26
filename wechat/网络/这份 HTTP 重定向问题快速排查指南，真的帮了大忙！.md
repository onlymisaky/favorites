> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/_Ie--y0m7Dst7Vk6CHm_SA)

🎯 前言

作为前端开发，你可能遇到过这些诡异问题：

*   "POST 请求数据莫名消失，后端说根本没收到"
    
*   "本地开发突然全部跳转 HTTPS，localhost 都访问不了"
    
*   "生产环境加载巨慢，Network 里全是红色的重定向"
    
*   "新上线的测试域名所有浏览器都打不开，显示连接被拒绝"
    

本文通过真实踩坑案例，教你快速定位和解决重定向问题。

* * *

### 💥 案例一：POST 请求数据神秘消失

#### 💀 问题症状

```
// 前端代码fetch('http://api.example.com/login', {    method: 'POST',    headers: { 'Content-Type': 'application/json' },    body: JSON.stringify({        username: 'admin',        password: '123456'    })}).then(res => res.json()).then(data => console.log(data))
```

**现象：**

*   ❌ 接口返回 `400 Bad Request: Missing credentials`
    
*   ❌ 后端日志显示收到的是 **GET 请求**，body 为空
    
*   ❌ 前端明明发的是 POST，怎么就变成 GET 了？
    
*   ❌ 本地测试正常，部署到生产就出问题
    

**用户影响：**

*   所有登录、注册、提交表单操作全部失败
    
*   用户反馈 "一直提示参数错误"
    
*   错误率突然飙升到 100%
    

#### 🔍 快速定位

**1. 打开 Chrome DevTools → Network**

```
Name: loginStatus:301MovedPermanently←第一个请求Request Method:POSTName:loginStatus:400BadRequest        ←第二个请求Request Method:GET             ←变了！
```

**2. 点击第一个请求查看 Response Headers**

```
HTTP/1.1 301 Moved PermanentlyLocation: https://api.example.com/login
```

**3. 确认问题：301 重定向导致 POST 变 GET**

#### ⚡ 解决方案

**去哪看：**

*   检查 Nginx/Apache 配置文件中的 `return 301` 或 `redirect 301`
    
*   找运维确认 HTTP → HTTPS 重定向配置
    

**去哪改：**

```
# ❌ 错误配置（导致 POST 变 GET）server {    listen 80;    return 301 https://$server_name$request_uri;}# ✅ 正确配置（保持 POST）server {    listen 80;    return 307 https://$server_name$request_uri;  # 改这里}
```

**或者前端直接改用 HTTPS：**

```
fetch('https://api.example.com/login', {  // 加 s    method: 'POST',    // ...})
```

### 💥 案例二：本地开发突然无法访问

#### 💀 问题症状

```
// 本地启动项目npm run dev// ✅ Server running at http://localhost:8080
```

**访问 `http://localhost:8080` 时：**

**现象：**

*   ❌ 浏览器自动跳转到 `https://localhost:8080`
    
*   ❌ 页面显示 "无法访问此网站" 或 "连接被拒绝"
    
*   ❌ Network 面板显示 `307 Internal Redirect`
    
*   ❌ 状态栏显示 `Non-Authoritative-Reason: HSTS`
    
*   ❌ 昨天还能访问，今天突然就不行了
    
*   ❌ 同事的电脑能正常访问，只有你的电脑有问题
    

**关键线索：**

```
Status: 307 Internal RedirectNon-Authoritative-Reason: HSTS  ← 关键！
```

#### 🔍 快速定位

**1. 确认是 HSTS 问题**

打开 `chrome://net-internals/[#hsts](javascript:;)`，输入 `localhost`

如图：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwvYcn9jI2V1nEoxxn26REAz5mbTHsW4Wrh23ZwUZLt5FcJxukZrkJMBjxURv8m18RuXpff2pnuJhg/640?wx_fmt=other&from=appmsg#imgIndex=0)操作如下：

```
Query HSTS/PKP domai 输入当前域名搜索// 如果有内容说明是HSTS相关
```

**2. 回忆最近操作**

*   是否访问过生产环境 `https://example.com`？
    
*   生产环境是否设置了 `includeSubDomains`？
    
*   是否在 `localhost` 上测试过 HTTPS？
    

* * *

#### ⚡ 解决方案

**临时方案（1 分钟）：清除 HSTS**

如图：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/YBFV3Da0NwvYcn9jI2V1nEoxxn26REAzkXictJwZ4XIRLXX9bGoxRWibDibbgU2MeJCIwnwO9nkWOE2AhibmhkcSyA/640?wx_fmt=other&from=appmsg#imgIndex=1)image.png

```
1. chrome://net-internals/#hsts2. Delete domain security policies3. 输入: localhost4. 点击 Delete5. 刷新页面
```

**永久方案（5 分钟）：本地启用 HTTPS**

```
# 安装 mkcertbrew install mkcert  # Macchoco install mkcert # Windows# 生成证书mkcert -installmkcert localhost 127.0.0.1
```

```
// vite.config.jsimport fs from 'fs'export default {    server: {        https: {            key: fs.readFileSync('./localhost-key.pem'),            cert: fs.readFileSync('./localhost.pem')        }    }}
```

**快速测试方案（0 分钟）：**

*   用隐身模式 `Ctrl+Shift+N`
    
*   或换个端口 `port: 3000`
    

### 💥 案例三：网站加载巨慢，重定向循环

#### 💀 问题症状

**用户投诉：**

*   "网站加载要等 10 秒才出来"
    
*   "页面一直在转圈"
    

**Network 面板显示：**

```
app.js - 301 Moved Permanently - 2.3sapp.js - 301 Moved Permanently - 2.1s  app.js - 301 Moved Permanently - 1.8sapp.js - 200 OK - 0.5s
```

**现象：**

*   ❌ 同一个资源重定向 3-5 次
    
*   ❌ 每次重定向耗时 2 秒左右
    
*   ❌ 最终能加载成功，但体验极差
    
*   ❌ 清除浏览器缓存后第一次访问更慢
    

**关键特征：**

*   路径越来越长：`/static/app.js` → `/assets/static/app.js` → `/assets/assets/static/app.js`
    
*   每次重定向都命中 CDN 缓存（`X-Cache: HIT`）
    

* * *

#### 🔍 快速定位

**1. 追踪重定向链**

```
curl -L -v https://cdn.example.com/static/app.js 2>&1 | grep -E "HTTP|Location"# 输出> GET /static/app.js< HTTP/2 301< Location: /assets/static/app.js> GET /assets/static/app.js< HTTP/2 301< Location: /assets/assets/static/app.js  ← 路径重复了！
```

**2. 绕过 CDN 测试源站**

```
curl -I https://origin.example.com/static/app.js# 输出Location: /assets/static/app.js  ← Nginx 配置错误
```

**3. 确认问题：重定向规则路径拼接错误**

#### ⚡ 解决方案

**去哪看：**

*   检查 Nginx 的 `location` 和 `rewrite` 规则
    
*   特别注意 `$uri` 变量的使用
    

**去哪改：**

```
# ❌ 错误（$uri 包含完整路径）location /static/ {    return 301 /assets/$uri;  # /static/app.js → /assets/static/app.js}# ✅ 正确（用正则提取文件名）location ~ ^/static/(.*)$ {    return 301 /assets/$1;    # /static/app.js → /assets/app.js}
```

**改完后立即清除 CDN 缓存：**

```
# Cloudflarecurl -X POST "https://api.cloudflare.com/.../purge_cache" \  --data '{"files":["https://cdn.example.com/static/*"]}'
```

### 💥 案例四：新测试域名完全无法访问

#### 💀 问题症状

**背景：**

*   新上线测试环境 `test.example.com`
    
*   只配置了 HTTP（80 端口），没配 HTTPS
    

**现象：**

*   ❌ 所有浏览器都显示 "无法访问此网站"
    
*   ❌ curl 能访问成功，但浏览器不行
    
*   ❌ 错误信息：`ERR_SSL_PROTOCOL_ERROR` 或 `连接被重置`
    
*   ❌ Network 面板显示 `(failed) net::ERR_CONNECTION_REFUSED`
    
*   ❌ 同事新装的浏览器也访问不了（排除缓存问题）
    

**关键线索：**

*   主域名 `example.com` 几个月前加入了 HSTS Preload
    
*   当时设置了 `includeSubDomains`
    

* * *

#### 🔍 快速定位

**1. 检查 Preload 状态**

访问 `https://hstspreload.org/?domain=example.com`

```
{  "status": "preloaded",  "includeSubDomains": true  ← 问题根源！}
```

**2. 确认浏览器行为**

```
chrome://net-internals/#hsts输入: test.example.comStatic STS domain: yes        ← 在浏览器内置列表中Static upgrade mode: FORCE_HTTPSStatic STS include subdomains: yes
```

**3. 确认问题：Preload 强制所有子域名用 HTTPS**

#### ⚡ 解决方案

**去哪看：**

*   检查主域名是否在 HSTS Preload List
    
*   确认 `Strict-Transport-Security` 响应头是否有 `includeSubDomains`
    

**只有两个选择：**

**方案 1：为测试域名配置 HTTPS（推荐，30 分钟）**

```
# 申请通配符证书certbot certonly --dns-cloudflare -d *.example.com
```

```
server {    listen 443 ssl;    server_name test.example.com;    ssl_certificate /path/to/cert.pem;    ssl_certificate_key /path/to/key.pem;}
```

**方案 2：换独立域名（推荐，5 分钟）**

```
# 不用 example.com 的子域名server {    listen 80;    server_name test-env.otherdomain.com;  # 完全独立的域名}
```

**不推荐：从 Preload 移除**

*   需要几个月才能生效
    
*   几乎不可逆
    
*   影响所有用户
    

* * *

### 💥 案例五：HTTPS 页面资源加载失败

#### 💀 问题症状

```
<!-- HTTPS 页面 --><script src="http://cdn.example.com/jquery.js"></script>
```

**现象：**

*   ❌ 控制台报错：`Mixed Content: ... blocked`
    
*   ❌ 页面功能异常（依赖的 JS 没加载）
    
*   ❌ 部分用户能正常访问，部分不行（诡异！）
    
*   ❌ 无痕模式能访问，正常模式不行
    

**关键线索：**

```
Mixed Content: The page at 'https://www.example.com/' was loaded over HTTPS,but requested an insecure resource 'http://cdn.example.com/jquery.js'.This request has been blocked.
```

#### 🔍 快速定位

**1. 检查是否是 HSTS 导致的差异**

```
# 测试 CDN 是否有 HSTScurl -I https://cdn.example.comStrict-Transport-Security: max-age=31536000  ← 有 HSTS
```

**2. 理解问题原因**

*   访问过 CDN 的用户：浏览器自动升级 HTTP → HTTPS（能加载）
    
*   没访问过的用户：浏览器阻止混合内容（加载失败）
    

#### ⚡ 解决方案

**去哪改：**

*   全局搜索代码中的 `http://`
    
*   检查 HTML、JS、CSS 中的资源引用
    

**改什么：**

```
<!-- ❌ 错误 --><script src="http://cdn.example.com/jquery.js"></script><!-- ✅ 方案 1：协议相对 URL --><script src="//cdn.example.com/jquery.js"></script><!-- ✅ 方案 2：明确 HTTPS --><script src="https://cdn.example.com/jquery.js"></script>
```

**快速修复：CSP 自动升级**

```
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

### 🛠️ 快速排查工具

#### Chrome DevTools

```
// 检查重定向次数performance.getEntriesByType('navigation')[0].redirectCount// 检查 HSTS// 直接访问：chrome://net-internals/#hsts
```

#### 命令行

```
# 查看重定向链curl -sI -L http://example.com | grep -E "HTTP|Location"# 检查 HSTS 头curl -I https://example.com | grep -i strict# 跟随重定向并显示详情curl -L -v http://example.com 2>&1 | less
```

#### 在线工具

*   **Redirect Checker**: httpstatus.io/[1]
    
*   **HSTS Preload**: hstspreload.org/[2]
    
*   **SSL Labs**: www.ssllabs.com/ssltest/[3]
    

* * *

### 📋 问题决策树

```
遇到重定向问题    ↓是否看到 "307 Internal Redirect"？    ├─ 是 → HSTS 问题    │      → chrome://net-internals/#hsts 查看并清除    └─ 否 → 继续POST 请求是否失败？    ├─ 是 → 检查状态码    │      ├─ 301/302 → Nginx 改用 307    │      └─ 其他 → 检查服务器日志    └─ 否 → 继续是否有多次重定向？    ├─ 是 → 检查 Nginx 重写规则    │      → 清除 CDN 缓存    └─ 否 → 继续子域名无法访问？    └─ 检查主域名 HSTS Preload 状态       → 为子域名配置 HTTPS 或换独立域名
```

### 🎯 核心记忆点

#### 状态码选择

<table><thead><tr><th><section>场景</section></th><th><section>使用</section></th><th><section>避免使用</section></th></tr></thead><tbody><tr><td><section>API 重定向</section></td><td><section>307/308</section></td><td><section>301/302</section></td></tr><tr><td><section>页面跳转</section></td><td><section>301</section></td><td><section>307</section></td></tr><tr><td><section>HTTP → HTTPS</section></td><td><section>307（首次）+ HSTS（后续）</section></td><td><section>301</section></td></tr></tbody></table>

#### HSTS 配置原则

```
# ✅ 逐步启用（推荐）add_header Strict-Transport-Security "max-age=86400";  # 1天测试# 没问题后add_header Strict-Transport-Security "max-age=31536000";  # 1年# 确认所有子域名都支持 HTTPS 后add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";# 极度确定后才 Preloadadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
```

#### 排查优先级

1.  **先看 Network 面板** - 90% 的问题这里能发现
    
2.  **检查 HSTS 缓存** - `chrome://net-internals/[#hsts](javascript:;)`
    
3.  **用 curl 验证** - 排除浏览器缓存干扰
    
4.  **查服务器配置** - Nginx/Apache 配置文件
    

* * *

记住：**遇到重定向问题，先看 Network，再查 HSTS，最后改配置**。

> 作者：wenps
> 
> 链接：https://juejin.cn/post/7567700298006757376