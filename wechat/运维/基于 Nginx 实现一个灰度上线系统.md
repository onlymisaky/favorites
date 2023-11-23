> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/36g51pc-qeO3GDfywiHjMQ)

软件开发一般不会上来就是最终版本，而是会一个版本一个版本的迭代。

新版本上线前都会经过测试，但就算这样，也不能保证上线了不出问题。

所以，在公司里上线新版本代码一般都是通过灰度系统。

灰度系统可以把流量划分成多份，一份走新版本代码，一份走老版本代码。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976I3Z7A9GribbAv9TEDfLrMUDJUO8dNiciadgpZa8Tk8xszjhdLZFNicZkzA/640?wx_fmt=png)

而且灰度系统支持设置流量的比例，比如可以把走新版本代码的流量设置为 5%，没啥问题再放到 10%，50%，最后放到 100% 全量。

这样可以把出现问题的影响降到最低。

不然一上来就全量，万一出了线上问题，那就是大事故。

而且灰度系统不止这一个用途，比如产品不确定某些改动是不是有效的，就要做 AB 实验，也就是要把流量分成两份，一份走 A 版本代码，一份走 B 版本代码。

那这样的灰度系统是怎么实现的呢？

其实很多都是用 nginx 实现的。

nginx 是一个反向代理的服务，用户请求发给它，由它转发给具体的应用服务器。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976SxIr6dibrxibqSBriaZaVB4bQ2Jq12dTubLcriasafE1ApsgnI7w62Oqtw/640?wx_fmt=png)

这一层也叫做网关层。

由它负责转发请求给应用服务器，那自然就可以在这里控制流量的分配，哪些流量走版本 A，哪些流量走版本 B。

下面我们实现一下：

首先，我们准备两个版本的代码。

这里创建个 nest 项目：

```
npx nest new gray_test -p npm
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976qR2Nqe1AYumAYuUJ0OqaL3DJibUpdq8JJ1BZOJlPwns9cer7Kae0OZg/640?wx_fmt=png)

把 nest 服务跑起来：

```
npm run start
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976ib3T5GcNictsBPABvU7r7mowWlE5hr9Kpicxa0f1v2zdWxamXwn61rdDw/640?wx_fmt=png)

浏览器访问下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes9766PYFZSwWS4Eh7t4K5LuhYGpsLRFcMFlicwU32ibngnvibHYRLwuia8nHPA/640?wx_fmt=png)

看到 hello world 代表 nest 服务跑起来了。

然后改下 AppService：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes9764rr9uziahXXOp1FBfRt3sczh8eRWovQnbsNVHUbLdx7tiaJJ2KjzXVdA/640?wx_fmt=png)

修改下端口：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes9765vCYAU3Q5rbpxZMWx7duCv3NE4Zp47jVYC4ic7YEibGDiauPJfW4iboUvQ/640?wx_fmt=png)

然后再 npm run start：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976GnHeq6RhMKrlADRyHOqgCy5AwGeNMnlyEZV8HoI3PwB9Yr7Iia42Cwg/640?wx_fmt=png)

浏览器访问下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976X1KAKy1uWFAI4GMk6OycYjxmPVtR8Pv5Wy3U8gMU3KGyc2ks5NkYOQ/640?wx_fmt=png)

现在我们就有了两个版本的 nest 代码。

接下来的问题是，如何用 nginx 实现灰度，让一部分请求走一个版本的代码，一部分请求走另一个版本呢？

我们先跑一个 nginx 服务。

docker desktop 搜索 nginx 镜像（这步需要科学上网），点击 run：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976y2P6ngXSttC6sygDz2q7toPI4HZy9BRuvAptQicrDsWiaV2iamyibbsNRg/640?wx_fmt=png)

设置容器名为 gray1，端口映射宿主机的 82 到容器内的 80

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976ksNE4uKD1q1IakIO6mDOYWN0wXczWNJOmYckAFcbJxF0gRHBShib5MQ/640?wx_fmt=png)

现在访问 http://localhost:82 就可以看到 nginx 页面了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976unib8icMGPlJcl0fLfYSkxVJFsLSclibPVaZfn68uibM9KQRvy0TmJ747Q/640?wx_fmt=png)

我们要修改下配置文件，把它复制出来：

```
docker cp gray1:/etc/nginx/conf.d ~/nginx-config
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976duKwicN9wPGMGOKwqib1ic0fRTqASnYZiaxPaAicg6BYFZLIIKzNVKWOd4Q/640?wx_fmt=png)

然后编辑下这个 default.conf

添加这么一行配置：

```
location ^~ /api {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://192.168.1.6:3001;
}
```

这行就是加了一个路由，把 /api/ 开头的请求转发给 http:// 宿主机 IP:3001 这个服务。

用 rewrite 把 url 重写了，比如 /api/xxx 变成了 /xxx。

然后我们重新跑个 nginx 容器：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976BuWve2jtNqjnxmaDBemEx49j11aBHyMibSOvQRwOnrWuRmYC1xZDQQQ/640?wx_fmt=png)

容器名为 gray2，端口映射 83 到容器内的 80。

指定数据卷，挂载本地的 ～/nginx-config 目录到容器内的 /etc/nginx/conf.d 目录。

点击 run。

然后看下 files 部分：

可以看到容器内的 /etc/nginx/conf.d 目录标识为了 mounted。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976nVONc1oib09Nlzp2thDovsZYNar87WARRD1T7CCM8fibAI6RtSueibajQ/640?wx_fmt=png)

点开看看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976DkBy2mkrGsE51UE4j7lU96IME7RxvNxicDfEIoPjL1Ceibw8ARiav1giaA/640?wx_fmt=png)

这就是本地的那个文件。

我们在本地改一下试试：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976FNqpW5zeNvoxbdSCNaNTSTXnBjeKqqSR5icm6Mic2mdlzWDWxImr0Bug/640?wx_fmt=png)

容器内也同样修改了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976icsB7E2yEtqQXpbkhn4Fof4nusXF4QHBSwd2mcMr99VdfxRMN17zEZQ/640?wx_fmt=png)

在容器内修改这个文件，本地同样也会修改。

也就是说挂载数据卷之后，容器内的这个目录就是本地目录，是同一份。

然后我们访问下 http://localhost:83/api/ 看看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes9769gklm9CCIoSKELJuuXaEcqvXlhHpVxQtJuDMVbm0npt8Hu1mspfK7g/640?wx_fmt=png)

nest 服务访问成功了。

现在我们不是直接访问 nest 服务了，而是经历了一层 nginx 反向代理或者说网关层。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976GbmgMy4hl7tibUIXoAOMnibF4Yu5dhgDyY1x70jYwnJe3l6tz3AibRicXQ/640?wx_fmt=png)

自然，我们可以在这一层实现流量控制的功能。

前面我们讲负载均衡的时候，是这么配的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976P0xm58j7MXFZ7yyiaaZ6wRVz61L2mibatzicQKaXE99TKXpHlo3EzFk2Q/640?wx_fmt=png)

默认会轮询把请求发给 upstream 下的 server。

现在需要有多组 upstream：

```
upstream version1.0_server {
    server 192.168.1.6:3000;
}
 
upstream version2.0_server {
    server 192.168.1.6:3001;
}

upstream default {
    server 192.168.1.6:3000;
}
```

有版本 1.0 的、版本 2.0 的，默认的 server 列表。

然后需要根据某个条件来区分转发给哪个服务。

我们这里根据 cookie 来区分：

```
set $group "default";
if ($http_cookie ~* "version=1.0"){
    set $group version1.0_server;
}

if ($http_cookie ~* "version=2.0"){
    set $group version2.0_server;
}

location ^~ /api {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://$group;
}
```

如果包含 version=1.0 的 cookie，那就走 version1.0_server 的服务，有 version=2.0 的 cookie 就走 version2.0_server 的服务，否则，走默认的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976ZCXE8Hic5ODfwQjiaC7Tyh3IbUO0GuJofsnrX9jhEE5ZiaMKMQ5ico1KkA/640?wx_fmt=png)

这样就实现了流量的划分，也就是灰度的功能。

然后我们重新跑下容器：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976spjPicUUHFDJMypLTYiaCpibJk66ObgngxdxLYfyoOC5znuzS87fYyrgw/640?wx_fmt=png)

这时候，你访问 http://localhost:83/api/ 走到的就是默认的版本。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes9761AjwLdkh0aBZQn9oglExakib0Gs8GLROa6z9oMEDyWLEyvgKsRxgcqg/640?wx_fmt=png)

然后带上 version=2.0 的 cookie，走到的就是另一个版本的代码：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976mnlP0vLN5B7yj9gFv7PMG5eJQCzceSoGaB87Paib9dM7QVKfHR4eZUg/640?wx_fmt=png)

这样，我们就实现了灰度的功能。

但现在还有一个问题：

什么时候设置的这个 cookie 呢？

比如我想实现 80% 的流量走版本 1.0，20% 的流量走版本 2.0

其实公司内部一般都有灰度配置系统，可以配置不同的版本的比例，然后流量经过这个系统之后，就会返回 Set-Cookie 的 header，里面按照比例来分别设置不同的 cookie。

比如随机数载 0 到 0.2 之间，就设置 version=2.0 的 cookie，否则，设置 version=1.0 的 cookie。

这也叫做流量染色。

完整的灰度流程是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaQOPV7hSOk9VskgORes976rhVCB0PwV7DiaJicq7MHAlLdicB8Y8z2p390t63e27oWpnNz7BgeyVibAA/640?wx_fmt=png)

第一次请求的时候，会按照设定的比例随机对流量染色，也就是设置不同 cookie。

再次访问的时候会根据 cookie 来走到不同版本的代码。

这就实现了灰度功能，可以用来做 5% 10% 50% 100% 这样逐步上线的灰度上线机制。

也可以用来做产品的 AB 实验。

公司里都会用这样的灰度系统。

总结
--

新版本代码的上线基本都会用灰度系统，可以逐步放量的方式来保证上线过程不会出大问题，也可以用来做产品 AB 实验。

我们可以用 nginx 实现这样的功能。

nginx 有反向代理的功能，可以转发请求到应用服务器，也叫做网关层。

我们可以在这一层根据 cookie 里的 version 字段来决定转发请求到哪个服务。

在这之前，还需要按照比例来给流量染色，也就是返回不同的 cookie。

不管灰度系统做的有多复杂，底层也就是流量染色、根据标记转发流量这两部分，我们完全可以自己实现一个。