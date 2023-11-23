> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/DAIbd01AlHWnAna7WFMjig)

Nginx 是流行的服务器，一般用它对静态资源做托管、对动态资源做反向代理。

Docker 是流行的容器技术，里面可以跑任何服务。

那 Docker + Nginx 如何结合使用呢？

我们来试一下：

首先要下载 Docker，直接安装 Docker Desktop 就行：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2AmPCvb0pUgQVH9I40pQchNYiaCLWjV1G9Fsxl5E1cl0g9znKR9zbL1w/640?wx_fmt=png)

它是用来管理容器和镜像的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Gx06YKnlAcSCJOaYdg5CBLykk0vJ91BTpHqgk0I0yqibjcAico6k9kKw/640?wx_fmt=png)

安装它之后，docker 命令也就可用了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw25vicfhMzqBBxsIH4Ao6ic3HLSXLdPicnp5ibyoI2WiabvYu9hYiaJMxcVibsA/640?wx_fmt=png)

然后我们来跑下 nginx 的镜像。

搜索 nginx（这一步需要科学上网，因为要访问 hub.docker.com 这个网站），点击 run：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2AAMiaUGw9DhmZDnBhmicPOZkWuDUXgh51M9VdywqDg4YxlKyMZdQlicjg/640?wx_fmt=png)

输入容器名和要映射的端口：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2ar76XnTmFThx4jZKKwsR8psgSrhGpnmue0RNOvJCYpiaKL7niazpQy4A/640?wx_fmt=png)

这里把宿主机的 81 端口映射到容器内的 80 端口，点击 run。

这时候就可以看到 docker 容器跑起来了，并且打印了日志：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2pK16Wtxf5WzibcJPk3YFENvwTyty8xIs22o7HKVjkLD8icia8TETGyBQw/640?wx_fmt=png)

浏览器访问下 http://localhost:81 可以看到 nginx 欢迎页面：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2ymSKsrVF7po68UiaW8nO4vYb9JY0nTL8FFx7KQtgtdHRT8y6hcUR5icg/640?wx_fmt=png)

这很明显是容器里跑的服务。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2TFYk5etoYvFibbOE2771Y68rC9H3bn2n2tJndDsQ2wEBVLJz83ez0Kw/640?wx_fmt=png)

但是现在的页面是默认的，我想用 nginx 来托管我的一些静态 html 页面怎么做呢？

首先我们要知道现在的配置文件和页面都存在哪里。

在 files 面板可以看到容器内的文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw28wyH1UKs9M1b8rbq3caibpbHmQiaqiccBvslicB8OeP3hfxXje8OQ0EKOQ/640?wx_fmt=png)

里面的 /usr/share/nginx/html/ 目录下面就是所有的静态文件。

双击点开 index.html 看看：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2eAJAWZCfbnOGXI2CaamkTibLBKEVukt8ibxL68axNUtibKFuibBg5XnXRw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw26xtNP0gfT4UsmQTjllcoLv1xelnWlwpWQj3Ny4I44YEXQCpiaXmYArQ/640?wx_fmt=png)

和我们浏览器看到的页面一毛一样。

也就是说，这个目录就是保存静态文件的目录。

那我们在这个目录下放我们自己的 html 不就行了？

我们先把这个目录复制出来：

```
docker cp  nginx1:/usr/share/nginx/html ~/nginx-html
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2H5clvJRGbw9PMagvsVnD67RStUWvNH7nul5EW467emciblz2lJkdg1g/640?wx_fmt=png)

docker cp 这个命令就是用于在宿主机和容器之间复制文件和目录的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw28tKfIgV0eps6rLctAHqkXvaSdzlr79MRqGdINHOjibUSZrCWEOj27zQ/640?wx_fmt=png)

比如我们把这个目录再复制到容器里：

```
docker cp  ~/nginx-html nginx1:/usr/share/nginx/html-xxx
```

可以看到容器内就多了这个目录：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2KVTsLib7CVDqeNibtMr7FYIedFRCGOd00Cl8Ar7MTtnevJ5mlwwR9hxw/640?wx_fmt=png)

然后我们在这个目录下添加两个 html 来试试看：

```
echo aaa > aaa.htmlecho bbb > bbb.htmldocker cp  ~/nginx-html nginx1:/usr/share/nginx/html
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2sUticVKYJA03Nbc6UdMgW44fnd9PNJ9Nniaev90V1qo83o13va4ZVIFQ/640?wx_fmt=png)

但当目标目录存在的时候，docker 会把他复制到目标目录下面：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2NZB9j4ARWlKNUFMZwooT6GB039EJESpy79mIcVwpbXZwYpcIFhibHIQ/640?wx_fmt=png)

我们需要先删除容器的这个目录，再复制：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2ia0AlEMfiamkCZLsDLiaKGIdSQd1ooHfkhRqPfJDWLOmK5xp8wjS2HyGQ/640?wx_fmt=png)

```
docker cp  ~/nginx-html nginx1:/usr/share/nginx/html
```

这样就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw23yOywWpjZZ1ia32bUmFoicYPKm0UHEngxy2lWDBsq9ia99QNYlIaLaIxA/640?wx_fmt=png)

然后浏览器访问下试试：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw25WxBS5h5Im7zXxmpPc5jJibxmtantibUBc1o7DkVbQIgyR4FBe5R2nJw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2ndZmZbQQrEcViaMAFIbPR2E4gE3OgkQx0iccox4SJOgRdCYMVBX2QJ4Q/640?wx_fmt=png)

现在就可以访问容器内的这些目录了。

也就是说只要放到 /usr/share/nginx/html 下的文件，都可以通过被访问到。

可是为什么呢？

这是因为 nginx 的默认配置。

我们看下 nginx 配置文件，也就是 /etc/nginx/nginx.conf。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw27iaWx51Gjdm0dqTiaEem8ZJKlvd5libNXVa7TSibPWMuoJBDZOnUXvDwTw/640?wx_fmt=png)

复制出来看看：

```
docker cp  nginx1:/etc/nginx/nginx.conf ~/nginx-html
```

这是就是 nginx 的默认配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2xOfVNnvtDPq7qlXRwFUqZwV7XsRIy8gROR9BEnPaTZmzQCcSaub7nw/640?wx_fmt=png)

其实这个 nginx.conf 叫做主配置文件，里面一般做一些全局的配置，比如错误日志的目录等等。

可以看到 http 下面有个 include 引入了 /etc/nginx/conf.d/*.conf 的配置。

一般具体的路由配置都是在这些子配置文件里。

目录 conf.d 是 configuration directory 的意思。

我们把这个目录也复制出来看看：

```
docker cp  nginx1:/etc/nginx/conf.d ~/nginx-html
```

这里面就配置了 localhost:80 的虚拟主机下的所有路由。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2nkFQTticZ3CtnX5a8QSWFLMFIwWwtjLibEibAutuYhG1GtrylbU09Pmdg/640?wx_fmt=png)

虚拟主机是什么呢？

就是可以用一台 nginx 服务器来为多个域名和端口的提供服务。

只要多加几个 server 配置就可以。

这里我们就配置 localhost:80 这一个虚拟主机。

下面的 location 就是路由配置。

比如这个配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw25dWiblrZqFibuXYlYtOtHKjpTBz3dicnZwfZHhBF6ibpPia7SiaJxeXowMicA/640?wx_fmt=png)

它就配置了 / 下的所有路由，都是在 root 指定的目录查找。

所以 http://localhost/aaa.html 就是从 /usr/share/nginx/html/aaa.html 找的。

location 支持的语法有好几个，我们分别试一下：

```
location = /111/ {
    default_type text/plain;
    return 200 "111 success";
}

location /222 {
    default_type text/plain;
    return 200 $uri;
}

location ~ ^/333/bbb.*\.html$ {
    default_type text/plain;
    return 200 $uri;
}

location ~* ^/444/AAA.*\.html$ {
    default_type text/plain;
    return 200 $uri;
}
```

把之前的 location / 删掉，添加这样几个路由配置。

具体这些配置都是什么意思待会再说。

把这个文件复制到容器内：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

然后在容器内的 terminal 执行：

```
nginx -s reload
```

重新加载配置文件。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2yfVqbokN3BFjvz7gtInQcicB7qOBjy49H224VmCibibsia7lM0bgzWBpKQ/640?wx_fmt=png)

然后来看第一条路由：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2beQ6FJDnCiaRPibTxC3qhAsaWgK9ygY1WbbdvzwZ3LKNQ3tk7PZibcEpQ/640?wx_fmt=png)

location 和路径之间加了个 =，代表精准匹配，也就是只有完全相同的 url 才会匹配这个路由。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2veEbWHV7mSWY9Ps5P5dlqbRe6ofjES19vKulNdibMic8VjNVlCxFmWeQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw24cql7v2GXYYKfqNH96uibLPEwS6u18W7HSSbWtqOKF7f3VWtcrOibNew/640?wx_fmt=png)

不带 = 代表根据前缀匹配，后面可以是任意路径。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw209u6zCNuPXqFEMufOcCNxYfFD0DTLRCfaAXffiaz8R9bybYkdgFiaUKw/640?wx_fmt=png)

这里的 $uri 是取当前路径。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2yJI04KBf4ekrtQDiatMia2GWkl6ibVcsvfibSzwvvLtMZ9tqetSvKelaSg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2qZftr3abJ6VZVWf1Bxqrw8ajWLo6LnvdU2fBWwOFlwI0TonceRbE6Q/640?wx_fmt=png)

然后如果想支持正则，就可以加个 ~。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Ofgl0JK7a0iacMXl0rVGu7icAh8HYABibDicRKNAucDB99UPiaBQ3ajFePA/640?wx_fmt=png)

这里的正则语法不难看懂，就是 /aaaa/bbb 开头，然后中间是任意字符，最后 .html 结尾的 url。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2RDqxgeeCI0iaCnWxUzYwonLibRNqJgKCDq69rbHZZISIaGcsDnXHVyLA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2SPuL5NZF7uTNJauVQfTIqeMQq88Gdb6h7QpVia5T5Eh20wAlferGAbA/640?wx_fmt=png)

但是它是区分大小写的，比如这样就不行了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2PoiaFE1iaIXLEwRnkL4sQbMsGw508ZJADST0pKBDPxd82NawwCcp9s0Q/640?wx_fmt=png)

换成小写就可以：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2XHmKB8c4KBmtiaMGTiaBkQjmBkvjFpwbvJ11xxNHribRZRY6FXFTsoBBg/640?wx_fmt=png)

如果想让正则不区分大小写，可以再加个 *

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2ibicDia5AS7bHKAVcQJSZHDjYav5LBdvcshVcqV1pibSPEB4FO9SibNEuQA/640?wx_fmt=png)

试一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw207JvSib6D30udF6GhoaOTe32ODiaGTgZHOalWZKvLC4Udr8Id3K8sJ2g/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2o9rKoicjq2ToQfJxy5MYRFeT4DWIfy2WOkyCn5U45XQicrZMcvkejrLw/640?wx_fmt=png)

任意的大小写都是可以的。

此外，还有一种语法：

在配置文件加上这个配置：

```
location /444 {    default_type text/plain;    return 200 'xxxx';}
```

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2UicHPYyUYayrJABnwib2hOC4XgG5bA4IFN6iaDmrZdM9uSKSw2ajrDUbw/640?wx_fmt=png)

这时候就有两个 /444 的路由了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2DAAibB7RicTXeshH3wIyxbY6cnyKibHJAWicF4EV8nOxia4wk8pqQEKGySw/640?wx_fmt=png)

这时候浏览器访问，还是匹配上面的那个路由：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw254joRqXZSfddXyd9bFicy6CvJHicqXwZZDOOS0ad62ldIlTgPAYvQicLg/640?wx_fmt=png)

如果想提高优先级，可以使用 ^~

改成这样：

```
location ^~ /444 {    default_type text/plain;    return 200 'xxxx';}
```

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

这时候同一个 url，匹配的就是下面的路由了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2xdS6I3kQJqRDM0uHKCmEERm2Vc49bgqQr4RicMica9BGE1QfsanRJIpw/640?wx_fmt=png)

也就是说 ^~ 能够提高前缀匹配的优先级。

总结一下，一共 4 个 location 语法：

location = /aaa 是精确匹配 /aaa 的路由。

location /bbb 是前缀匹配 /bbb 的路由。

location ~ /ccc.*.html 是正则匹配。可以再加个 * 表示不区分大小写 location ~* /ccc.*.html

location ^~ /ddd 是前缀匹配，但是优先级更高。

这 4 种语法的优先级是这样的：

**精确匹配（=） > 高优先级前缀匹配（^~） > 正则匹配（～ ~*） > 普通前缀匹配**

我们现在是直接用 return 返回的内容，其实应该返回 html 文件。

可以这样改：

```
location /222 {    alias /usr/share/nginx/html;}location ~ ^/333/bbb.*\.html$ {    alias /usr/share/nginx/html/bbb.html;}
```

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

都是能正确返回对应的 html 的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw27KwK6bR7NygpjCxHUG2VrdlzbJ27hdIPLkiaXdQomhJUwmqG5yhgHvg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2fmHia4zVc7JcxY9xPOXjDs2fkl7mHYgzHlkga1Fvicn7VVMFoVTibwBIg/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2T5rEe7aQNVQicgEaeIjLejTRAcwq1ibo68VXMyNkdGILyu7icY99QM5SQ/640?wx_fmt=png)

前面用过 root：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2HMhl4eQynsMLc1Z7dd9B1uNnwjTEKXT3z5NjpfQiafxNNN5cm1sziazA/640?wx_fmt=png)

root 和 alias 有什么区别呢？

比如这样的两个配置：

```
location /222 {    alias /dddd;}location /222 {    root /dddd;}
```

同样是 /222/xxx/yyy.html，如果是用 root 的配置，会把整个 uri 作为路径拼接在后面。

也就是会查找 /dddd/222/xxx/yyy.html 文件。

如果是 alias 配置，它会把去掉 /222 之后的部分路径拼接在后面。

也就是会查找 /dddd/xxx/yyy.html 文件。

也就是 我们 **root 和 alias 的区别就是拼接路径时是否包含匹配条件的路径。**

这就是 nginx 的第一个功能：静态文件托管。

主配置文件在 /etc/nginx/nginx.conf，而子配置文件在 /etc/nginx/conf.d 目录下。

默认的 html 路径是 /usr/share/nginx/html。

然后来看下 nginx 的第二大功能：动态资源的反向代理。

什么是正向、什么是反向呢？

从用户的角度看，方向一致的就是正向，反过来就是反向。

比如这样两个代理：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2T8vRvS1YXXW0RhBoGt7nEI7yG113hdDpcfbgpubFZOIdXoNGg2ZYtw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2XanacnVaAtYq0QC8xaL9lLxz0aC0bpPiceB7mPV8k4crgcDyILvMicxQ/640?wx_fmt=png)

第一个是正向代理，第二个是反向代理。

第一个代理是代理的用户请求，和用户请求方向一致，叫做正向代理。

第二个代理是代理服务器处理用户请求，和用户请求方向相反，叫做反向代理。

测试 nginx 做反向代理服务器之前，我们先创建个 nest 服务。

```
npx nest new nest-app -p npm
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2goCcVnGNrDgNDzI25xtWVXEviaLUia32Lfac0LMUJF46Sahj67k2NKhQ/640?wx_fmt=png)

把服务跑起来：

```
npm run start:dev
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2PRDiaW8JbpvjGmzB4Qjh7CL980Fe7a6eicctwVrylYKXPvL8R3dIulbw/640?wx_fmt=png)

浏览器就访问 http://localhost:3000 看到 hello world 就代表 nest 服务跑成功了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2OicNDS01e8lAlIuyic8CMcN4rC9gRUALgM2jhbXRJmjh1PFx2AicUzVUw/640?wx_fmt=png)

添加一个全局的前缀 /api

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw242ykoyRmzkyGmA1hkcEsR114QvdRgLcPo3Cia9hrqm5cSRHJGtzIX1w/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw20UVaHbmjWiaZBpavt7jY6qD4AHb3WHCs2sHJXWdNmoSbKEJrBkjxcYg/640?wx_fmt=png)

改下 nginx 配置，添加个路由：

```
location ^~ /api {
    proxy_pass http://192.168.1.6:3000;
}
```

这个路由是根据前缀匹配 /api 开头的 url， ^~ 是提高优先级用的。

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

然后你访问 http://localhost:81/api 就可以看到 nest 服务返回的响应了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2WdhIPZJU0frhkdyNX1no471g6tzDQOIGy2gDxx5f2o1DtcuxPnTyVA/640?wx_fmt=png)

也就是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2PBFq7cbILjLgwfHeB0ibtcTO8IRtrqvo0t1wmQviaRjibLuSLAaBiaHXpw/640?wx_fmt=png)

为什么要多 nginx 这一层代理呢？

自然是可以在这一层做很多事情的。

比如修改 header：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Tiaibb52LmtWzia4RYtz2etsjt6VbdicwAZjHPeCA6OTIjDYy5O8XmgicLw/640?wx_fmt=png)

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

在 nest 服务的 handler 里注入 headers，打印一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2k5FvYrJBnz2ZaCEcShfn3G4ZNAs0MrODnQBv2D68xibpjxyvLG5FWag/640?wx_fmt=png)

然后浏览器访问下。

直接访问 nest 服务的话，是没有这个 header 的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2H3MiaRzjrib12DXw0Ms1VXPicqYurIp6vrfNhgUI8bw8tWaiaxzhicWh3jQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2SJ5fIicjQicISQa6qz9jN14cO8ibb4bUMjY0MTC8NlSibmVV6L9TD5vDrA/640?wx_fmt=png)

访问 nginx 的反向代理服务器，做一次中转：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2U2hM8goMhvcwVRSMdNxrfSRianucgEIueHDWrommGc0MR6zibTianQ3ew/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2lqNyvic1Q7fu24uFPxcPc620Xjqr4GFfa9PuP3qxNnbw0BEoqjtVNSA/640?wx_fmt=png)

这就是反向代理服务器的作用，可以透明的修改请求、响应。

而且，还可以用它实现负载均衡。

在 controlller 里打印下访问日志：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2IqXBoYCicV4pE2R8XnYkbuPRFXFBcpqtib2MdoACUEnskG89Rsia3ic38w/640?wx_fmt=png)

把 nest 服务停掉，然后重新 npm run start

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2KianFUNsL7w4DTKuwZNeYmccLIiahibYcpfKyC7PVZWibUoToN1zIeVmkg/640?wx_fmt=png)

3001 和 3002 端口各跑一个：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2koYP2aAicXTNDAPIib2PNmRwEpW9ibx84IWtXBbttHzWDA4cNSflRibpZw/640?wx_fmt=png)

浏览器访问下，都是正常的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2J14ibyibka6HTWiarB8yowAKczZbLicdupoyXOV45LibH44t0Hsut5ibSuwQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2FfoTaHraugWI3embDYic3UicNFVbJ0xLnZ5cibqNeHvKMtPw6uZAfOVOA/640?wx_fmt=png)

控制台也打印了访问日志：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2hibYCl7FUITlffpp4tj8tEfvP4lM58wT5hFEWAZwjrVibvZCqxbOfxUA/640?wx_fmt=png)

问题来了，现在有一个 nginx 服务器，两个 nest 服务器了，nginx 该如何应对呢？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2iaAqAGhIrbVYgoAMvfKicoX4zNsqjX6P9DqcAHSvLYIZLvheL6ch5jFQ/640?wx_fmt=png)

nginx 的解决方式就是负载均衡，把请求按照一定的规则分到不同的服务器。

改下 nginx 配置文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2e6z3ypFxAbML3RkVc6d6kHa7ib7NWFtVqUmjxMxXt7fPjibJmM4iaoPYQ/640?wx_fmt=png)

在 upstream 里配置它代理的目标服务器的所有实例。

下面 proxy_pass 通过 upstream 的名字来指定。

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

这时候我访问 http://localhost:81/api 刷新 5 次页面：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2g78ib3dcPZePb6uQ2NxEFdszXAls6HLNxedDTN32fDhuFyfYbbqicdUQ/640?wx_fmt=png)

可以看到两个 nest 服务，一个 3 次，一个 2 次。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2H3B5Uveia3YZnFJeV2pZdDVqwzD0D3PMId62QOrQmdcUVgP2xpJrfog/640?wx_fmt=png)

因为默认是轮询的方式。

一共有 4 种负载均衡策略：

*   轮询：默认方式。
    
*   weight：在轮询基础上增加权重，也就是轮询到的几率不同。
    
*   ip_hash：按照 ip 的 hash 分配，保证每个访客的请求固定访问一个服务器，解决 session 问题。
    
*   fair：按照响应时间来分配，这个需要安装 nginx-upstream-fair 插件。
    

我们测试下 weight 和 ip_hash 的方式。

添加一个 weight=2，默认是 1，这样两个服务器轮询到的几率是 2 比 1。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2yT5dNnUG4rwbziaMdd7WEmCmMWHHIHRxR3rWUsgyfZz2fnuIqicGMTicg/640?wx_fmt=png)

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

按 command + k，把 nest 服务的控制台日志清空下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2biaVA3FMia4jvdPBdTv12D2EOy2pnictdD0CKicvu5ibMYIxgAniaWT3ibsYQ/640?wx_fmt=png)

然后我访问了 8 次 http://localhost:81/api

看打印的日志来看，差不多就是 2:1 的轮询几率。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2AYjZAD9vb6BD50Bs1ibyLeo1P9U3vq4m2sXwp1Rza1qfjehSSAapejg/640?wx_fmt=png)

这就是带权重的轮询。

我们再试下 ip_hash 的方式；

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Zto6ZJMIiafkPpZicRrVVfhjt3DmLdwyAVSfbS5PVsOsl89CTukqAXog/640?wx_fmt=png)

然后复制到容器里，并 reload：

```
docker cp ~/nginx-html/conf.d/default.conf nginx1:/etc/nginx/conf.d/default.conf
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2Jb8Xv5gdFPxZ4fVcT1XuPXiaHvmaawozicWMG6BKGh035CFzPibFwKNqw/640?wx_fmt=png)

按 command + k，把 nest 服务的控制台日志清空下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2biaVA3FMia4jvdPBdTv12D2EOy2pnictdD0CKicvu5ibMYIxgAniaWT3ibsYQ/640?wx_fmt=png)

再次访问了 http://localhost:81/api

可以看到一直请求到了一台服务器：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGhmsSagK3EicSbzXoEXp0hw2cJYYcr0mFCWrHptxWD7lc7zteAicA2Q9s6sEEfEicAIcOVIzQ4aWFnibw/640?wx_fmt=png)

这就是 Nginx 的负载均衡的策略。

总结
--

我们通过 docker 跑了 nginx 服务器，并使用了它的静态资源托管功能，还有动态资源的反向代理功能。

nginx 的配置文件在 /etc/nginx/nginx.conf 里，它默认还引入了 /etc/nginx/conf.d 下的子配置文件。

默认 html 都放在 /usr/share/nginx/html 下。

我们可以通过 docker cp 来把容器内文件复制到宿主机来修改。

修改 nginx 配置，在 server 里配置路由，根据不同的 url 返回不同的静态文件。

有 4 种 location 语法：

*   location /aaa 根据前缀匹配
    
*   location ^~ /aaa 根据前缀匹配，优先级更高
    
*   location = /aaa 精准匹配
    
*   location ~ /aaa/.*html 正则匹配
    
*   location ~* /aaa/.*html 正则匹配，而且不区分大小写
    

优先级是 精确匹配（=） > 高优先级前缀匹配（^~） > 正则匹配（～ ~*） > 普通前缀匹配

除了静态资源托管外，nginx 还可以对动态资源做反向代理。

也就是请求发给 nginx，由它转发给应用服务器，这一层也可以叫做网关。

nginx 反向代理可以修改请求、响应信息，比如设置 header。

当有多台应用服务器的时候，可以通过 upstream 配置负载均衡，有 4 种策略：轮询、带权重的轮询、ip_hash、fair。

掌握了静态资源托管、动态资源的反向代理 + 负载均衡，就算是掌握了 Nginx 的核心用法了