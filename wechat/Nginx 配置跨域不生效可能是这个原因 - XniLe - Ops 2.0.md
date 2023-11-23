> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.dianduidian.com](https://blog.dianduidian.com/post/nginx%E9%85%8D%E7%BD%AE%E8%B7%A8%E5%9F%9F%E4%B8%8D%E7%94%9F%E6%95%88%E6%9C%89%E5%8F%AF%E8%83%BD%E6%98%AF%E8%BF%99%E4%B8%AA%E5%8E%9F%E5%9B%A0/)

> 今天 debug 一跨域问题，本来觉得就一很简单的问题，结果被无情打脸，费了老大劲了，有必要复盘下。 同样的接口 Get 好使而 POST 就是不行，前端

今天 debug 一跨域问题，本来觉得就一很简单的问题，结果被无情打脸，费了老大劲了，有必要复盘下。

同样的接口`Get`好使而`POST`就是不行，前端那里一直报跨域请求失败。

但我明明`Nginx`已经加上相关配置上了，没道理啊。

```
No 'Access-Control-Allow-Origin' header is present on the requested resource
```

再三确认配置是没问题后只能求助 GG，结果还真有发现，原来`add_header`不是所有返回都会追加，只限特定状态码的返回才有效，如果想所有返回都生效需要加上`always`选项参数。具体来看下官方的解释:

> Adds the specified field to a response header provided that the response code equals 200, 201 (1.3.10), 204, 206, 301, 302, 303, 304, 307 (1.1.16, 1.0.13), or 308 (1.13.0).

于是修改配置加上`always`

```
add_header 'Access-Control-Allow-Origin' $http_origin;
add_header 'Access-Control-Request-Method' 'GET,POST,OPTIONS,DELETE,PUT';
add_header 'Access-Control-Allow-Credentials' 'true';
add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
```

重启`Nginx`，刷新页面，wow，跨域报错消失了，但是接口`Post`报 500 了错误。

此时已经完全明白过来了，正是由于这个接口`GET`请求返回正常，所以返回的`header`中会添加上`Access-Control-Allow-Origin`，而`POST`时接口返回 500`add_header`不起作用，`Access-Control-Allow-Origin`添加不上所以才有了一直不生效的错觉，好坑~~~。不过还是怪自己没有完全掌握参数的用法，还是要多读文档。

**参考**

[https://stackoverflow.com/questions/35946006/nginx-cors-doesnt-work-for-post](https://stackoverflow.com/questions/35946006/nginx-cors-doesnt-work-for-post)

[http://nginx.org/en/docs/http/ngx_http_headers_module.html](http://nginx.org/en/docs/http/ngx_http_headers_module.html)

文章作者 XniLe

上次更新 2023-10-10