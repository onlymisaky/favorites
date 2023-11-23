> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [nowtime.cc](https://nowtime.cc/nginx/1360.html)

> 背景因同事用 Hyperf 搭建的接口，然后用 Vue.js 写的前端去调用，出现跨域问题无效原因 Nginx add_header 只对 200,201,204,206,301,302,303,...

背景
--

因同事用 Hyperf 搭建的接口，然后用 Vue.js 写的前端去调用，出现跨域问题

无效原因
----

> Nginx `add_header` 只对 `200,201,204,206,301,302,303,304,307` 这些状态码生效，对于 401 405 403 这些状态码是不生效的。

恰好我测试的时候就随便访问了个链接，返回的状态码是 **404** 的，结果一直刷新都不出来添加的 `header`

解决办法
----

在末尾加一个 `always` 即可，即：

```
add_header Access-Control-Allow-Origin * always;
```

此外还引出一个问题，就是如果你将 **Access-Control-Allow-Origin** 头的值设置为 `*`，那么前端进行请求时，不出意外的话浏览器控制台就会提示这个错误：

![](https://cdn.nowtime.cc/2021/04/30/1343951322.png)

> Access to XMLHttpRequest at ‘[http://api.xxxxxxx.com/v1/userinfo](http://api.xxxxxxx.com/v1/userinfo) from origin ‘[http://localhost:8080](http://localhost:8080/)‘ has been blocked by CORS policy: Response to preflight request doesn’t pass access control check: The value of the ‘Access-Control-Allow-Origin’ header in the response must not be the wildcard ‘*’ when the request’s credentials mode is ‘include’. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
> 
> **机翻成中文：**
> 
> 通过 CORS 策略已阻止从来源 “[http://localhost:8080”](http://localhost:8080”) 访问 “[http://api.xxxxxxx.com/v1/userinfo”](http://api.xxxxxxx.com/v1/userinfo%E2%80%9D) 处的 XMLHttpRequest：对预检请求的响应未通过访问 控制检查：当请求的凭据模式为 “包括” 时，响应中 “访问控制允许 - 来源” 标头的值不得为通配符“ *”。 XMLHttpRequest 发起的请求的凭据模式由 withCredentials 属性控制。
> 
> 相关链接：[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)

### 原因是：当前端 (如 axios) 配置 `withCredentials=true` 时, 后端配置 `Access-Control-Allow-Origin` 不能为 `*`, 必须是相应地址

### axios 设置 withCredentials 为 false

```
// axios配置
axios.defaults.withCredentials = false; // 携带cookie
```

* * *

更多相关跨于问题，这篇文章可以作参考：[https://juejin.cn/post/6844903748288905224](https://juejin.cn/post/6844903748288905224)

以下是从上述链接渣摘抄

### 问题 1

> 解决方案：当前端配置 withCredentials=true 时, 后端配置 Access-Control-Allow-Origin 不能为 *, 必须是相应地址

```
Access to XMLHttpRequest at 'http://127.0.0.1:8081/getInfo?t=1545900042823' from origin 'http://localhost:8080' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
```

### 问题 2

> 解决方案：当配置 withCredentials=true 时, 后端需配置 Access-Control-Allow-Credentials

```
Access to XMLHttpRequest at 'http://127.0.0.1:8081/getInfo?t=1545899934853' from origin 'http://localhost:8080' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'. The credentials mode of requests initiated by the XMLHttpRequest is controlled by the withCredentials attribute.
```

### 问题 3

> 解决方案：当前端配置请求头时, 后端需要配置 Access-Control-Allow-Headers 为对应的请求头集合

```
Access to XMLHttpRequest at 'http://127.0.0.1:8081/getInfo?t=1545898876243' from origin 'http://localhost:8080' has been blocked by CORS policy: Request header field x-requested-with is not allowed by Access-Control-Allow-Headers in preflight response.
```