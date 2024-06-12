> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ejkfARh6hlOAUnw5Eadb6Q)

vite 是新兴的构建工具，它相比 webpack 最大的特点就是快。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67co81WJMoHEeySp2kam1dPoPaXibODWM7PvoCvuYJR9gUPxSJ5wnKb0nw/640?wx_fmt=png&from=appmsg)

那它是如何做到这么快的呢？

因为 vite 在开发环境并不做打包。

我们创建个 vite 项目：

```
npx create-vite<br style="visibility: visible;">
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cIj1G2pU3UgFua2Qu87c2nTfTzfZLDziaqLO9bicV8Qnq4skAc1CPKmLw/640?wx_fmt=png&from=appmsg)

安装依赖，然后把服务跑起来：

```
npm install
npm run dev
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cYJmImI7mKMAU3OP3FvaicGS6xOob0icPu9Efkndc9tbVLTwyBhChicwDA/640?wx_fmt=png&from=appmsg)

浏览器访问下：

本地是 main.tsx 引入了 App.tsx，并且还有 react 和 react-dom/client 的依赖：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cHSNfIJMUCFLsvKDhCsibjDVJvKXzJkDDWtwBd4UKjq2wP5ZskoG3RTg/640?wx_fmt=png&from=appmsg)

用 devtools 看下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cblBUPiaGAyk3NHrxdKrOwbibOcJhF7kOXLTFAfMOZS0MEyCgbLiblZD4w/640?wx_fmt=png&from=appmsg)

可以看到，main.tsx、App.tsx 还有 react 和 react-dom/client 的依赖都是直接引入的，做了编译，但是并没有打包。

这是基于浏览器的 type 为 module 的 script 实现的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cibFMoxWX6Ss3iaswhLYibTwJnaZl70nowGzwoicD9DO2Bicx5icGbOIOJWtQ/640?wx_fmt=png&from=appmsg)

我们加一个 index2.html：

```
<!doctype html><html lang="en">  <head>    <meta charset="UTF-8" />    <link rel="icon" type="image/svg+xml" href="/vite.svg" />    <meta ></script>  </body></html>
```

然后添加 aaa.js

```
import { add } from './bbb.js'console.log(add(1, 2));
```

bbb.js

```
export function add(a, b) {    return a + b;}
```

起个静态服务访问下：

```
npx http-server
```

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cpdqibNDaJscgcXsQY1ickZQL86ytaacRiaOOoT4wcQEvQ7icgUFxjgC5eQ/640?wx_fmt=png&from=appmsg)

浏览器访问下 http://localhost:8080/index2.html

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67ciciapAgbDPqIzW4k9KMSIkXwGQdqTvL3TRMyRU7MqSyuLxicSqXI8ukLA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cPOAlRkAghor47vD60gyRSicwDFlzWyKpDDcgjm196unUL4CeNlmShfw/640?wx_fmt=png&from=appmsg)

可以看到，aaa 和 bbb 模块都被下载并执行了。

当然，我们没有做编译，如果有 ts 或者 jsx 的语法，需要做一次编译。

那我们是不是可以起个服务器，请求的时候根据 url 找到对应的文件，编译之后返回呢？

没错，如果你这样想了，那你也可以写一个 vite。

vite 在开发环境下就是起了一个做编译的服务器，根据请求的 URL 找到对应的模块做编译之后返回。

当你执行 npm run dev 的时候：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cXRhblQrHPYbkbKONTXd0VBaDdlHLibSY4iaaj2omgZ7pria8p2nqItcfQ/640?wx_fmt=png&from=appmsg)

vite 会跑一个开发服务：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cDhh8UYsNMvmgFAajaWFjAlrsTJ3K9AJjHZfZFrNA7qyHfDDicxIKPWg/640?wx_fmt=png&from=appmsg)

这个开发服务是基于 connect 实现的，vite 给它加了很多中间件来处理请求：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cbaaib25UZrrWKOcnV9gb3yVbFibgXQX7FNuMmtZpAnwZCFTQrDQ5wPibQ/640?wx_fmt=png&from=appmsg)

当你请求 index.html 的时候，它会通过 ast 遍历，找到其中所有的 script：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cqtJ2iaquHKhtwgLRXQ4MOH6HUfE3lGCrV2GuQv9nh7kMZZwNMVFEgkw/640?wx_fmt=png&from=appmsg)

然后提前对这些文件做编译：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cZvoSicDzaicCZqic5Ha0aUCXtR51nZTS3efEMcd4pUmX29b7WYktvYPYg/640?wx_fmt=png&from=appmsg)

编译是通过不同插件完成的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cKoViasdXTanVziaibrQqYicE3gA1ZyDxnN9wTEUQyVUj76WfNQXRmqTXNg/640?wx_fmt=png&from=appmsg)

插件就是一个对象，它导出了 transform 方法的话，就会在 transform 的时候被调用。

比如图中有 css 插件来编译 css、esbuild 插件来编译 ts/js 等。

每个插件都会判断下，只处理对应的资源：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cNMWds9QsMP6af3r62AO8QwNIwruYxuC4kibCtyXZjzUvHXyGzRq4mxw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67csknATmQCrQtoFibcVMyVsGzL0ShAzRQlA3GzaXDHDxekEFncS15JBkQ/640?wx_fmt=png&from=appmsg)

比如 vite:esbuild 插件，就是对 js/ts 做编译，然后返回编译后的 code 和 sourcemap：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67c40ktvXQt2scOyBh6PoTib9jGYhmbvmTxUEGOZhFw7xEgqFhSiaVQ55QQ/640?wx_fmt=png&from=appmsg)

还有个 import-anlysis 插件，在 esbuild 完成编译之后，分析模块依赖，继续处理其它模块的 transform：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cGicQuN8nt28N3SzPh3K4m0CibVpXB4qYlzNJRlxzYXPfpC5GR68p6Lhg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cdARt0ia0zpgnp56Pgy8NCl7y3ADcc68kDOgicRKia3n2gGb5dibTDia8R6Q/640?wx_fmt=png&from=appmsg)

这样，浏览器只要访问了 index.html，那么你依赖的所有的 js 模块，就都给你编译了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cCdtcfXicNonVcvqiaA0CtxWibCkHa62E9niaicSukaTGf9spoRL8tP5K3Aw/640?wx_fmt=png&from=appmsg)

这就是 vite 为什么叫 no bundle 方案，它只是基于浏览器的 module import，在请求的时候对模块做下编译。

但不知道大家有没有想过一个问题：

浏览器支持 es module 的 import，那如果 node_modules 下的依赖有用 commonjs 模块规范的代码呢？

是不是就不行了。

这种就需要提前做一些转换，把 commonjs 转成 esm。

还有一个问题，如果每个模块都是请求时编译，那向 lodash-es 这种包，它可是有几百个模块的 import 呢：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67chYmeXUibU29RsuZxibCicsuA2Zb8Z8EwnZOZMdia8Kib2qZS6ZXauHricaxw/640?wx_fmt=png&from=appmsg)

这样跑起来，一个 node_modules 下的包就有几百个请求，依赖多了以后，很容易就几千个请求。

这谁受的了？

所以我们要提前处理下，不但要把 node_modules 下代码的 commonjs 提前转成 es module，还有提前对这些包做一次打包，变成一个 es module 模块。

所以，vite 加了一个预构建功能 pre bunle。

在启动完开发服务器的时候，就马上对 node_modules 下的代码做打包，这个也叫 deps optimize，依赖优化。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67c66fMJsH7ENp9D1ticlL0omovOD4CnQXAo3zOeZKjPCGFwIDJAJWaTZA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67c2sW4zut9BBVdCt9JUDeBTk8sBiaUSibLAmoj6uxc0CATU3JP4WiaVMLNA/640?wx_fmt=png&from=appmsg)

如何优化呢？

首先，扫描出所有的依赖来：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cv7xpLASLu2vI4h1su0QAiahYWhYDlID2DhWya8eSHL5VUvsKSW2bkAQ/640?wx_fmt=png&from=appmsg)

这一步是用 esbuild 做的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cblweS2NZDVzGDZp1icY8c4ibUCRJB9eSoqcY1yyZJMvGh1z4wibUonOGQ/640?wx_fmt=png&from=appmsg)

esbuild.context 和 esbuild.build 差不多的功能。

可以看到，用 esbuild 对入口 index.html 开始做打包，输出格式为 esm，但是 write 为 false，不写入磁盘。

有同学说，esbuild 支持 import html 么？

这里用到了一个 esbuild scan plugin：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cMu4Hg2muVIc1YjVzbSh3ic7vfibpWmYtX7Hriclm1n8OKyoyDykjcft4g/640?wx_fmt=png&from=appmsg)

vite 实现的，用来记录依赖的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cuWjGLkPDhzsKaWx7AuXsAJyicp1MHXUIqTX0vqxf9mCAiaMftGaiaSdtQ/640?wx_fmt=png&from=appmsg)

它会在每种模块路径解析的时候做处理，其中支持了 html 的处理。

这样用 esbuild 处理完一遍，是不是就知道预打包哪些包了？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cRS385UbeApDXxaTTkSqiajhZmlOMrddvfTN0aicxC96ic5iaia1ibyiaYmoyw/640?wx_fmt=png&from=appmsg)

我们在项目里引入下 dayjs 和 lodash-es 再试下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67chVKIMDGnP8WZw6Ij1WR8dIBsfDc1CWvfCkibzUNMuOibHibr8IXZribjpQ/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67c7QK4DFnH8mO2ib1LxWnJHCicSVlibGBdBumU825ONqjShAvQzs6K6tEOw/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cpVpIichmID3cAE06br1Edgy2K2a1H2TCv0MYnBRu5bAzcFFDQ2FssPg/640?wx_fmt=png&from=appmsg)

依然给你一个不少的给分析了出来：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cNHEjrAMz8aSmDOBwXerCqoWlSezZeJicQoPMKzlLVz5Jib8vdSf8icG6g/640?wx_fmt=png&from=appmsg)

接下来调用 esbuild 打包就行。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67ciblfelrG7b5icnnlJvFOlswy5hEQMdLUCiaydxHJgb9aib3gkFQM0UftGw/640?wx_fmt=png&from=appmsg)

但打包之前呢，还会对路径做扁平化，比如 react-dom/client 变成 react-dom_client

效果就是打包之后文件是平级的。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cxm9k9YP7rDQmTAzo7xSP7p43cFwgJZ1EcrXTJYQP3JbmnO26nAbkLw/640?wx_fmt=png&from=appmsg)

从每个依赖包作为入口打包，输出 esm 格式的模块到 node_modules/.vite 下。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67c0slFWEj8wNSO7j69WsJ0v7eRjL5RaoFCU0uDuKLAftQ4Dp88vNib4fg/640?wx_fmt=png&from=appmsg)

之后还会生成一个 _metadata.json 文件写入 node_modules/.vite 下：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cONsaQ3S2BGfeByp4q4hDjsXdHiajwXxcseia4lVyWOmyicCeWQ1YxEwZw/640?wx_fmt=png&from=appmsg)

这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cfxt3ibpeDtFgsgian3Kf0x5iaPPw9NyGKWZicSjcOl3km0D7krPbhic11sA/640?wx_fmt=png&from=appmsg)

这个 metadata.json 是干啥的呢？

看到这几个 hash 了么

vite 会在这些预打包的模块后加一个 query 字符串带上 hash，然后用 max-age 强缓存：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67c26JxUS3GH1yWLC7kfym8kgunAfd9icVGJKp2PB1ARrsQ1XicNVia5z9mg/640?wx_fmt=png&from=appmsg)

因为这些依赖一般不会变，不用每次都请求，强缓存就行。

但是在 lock 文件变化或者 config 有一些变化的时候也需要重新 build：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cIPRmmeVG0OOKevnuunszPCIwxCG1iaWEO3EytF7qdddsibnccXy0sljA/640?wx_fmt=png&from=appmsg)

重新预编译，然后在资源请求时带上新的 query，这样就让强缓存失效了。

这里强缓存的用法很典型，面试官们可以记一下作为考点。

这样，vite 的开发服务的请求时编译，再就是预构建就都完成了。

有的同学可能会问，为啥预构建要用 esbuild 呢？

原因就是快：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cibbFp8ttlAWVBfotpP5GOibHf4tSnsmGG1oFVic5Wej09zuq1iazXYibicdA/640?wx_fmt=png&from=appmsg)

vite 在 dev 时的核心原理我们理清了，但是在 build 的时候总要打包的吧。

那肯定，在 build 的时候 vite 会用 rollup 做打包。

那不会导致开发时的代码和生产环境不一致么？

不会。

能做到这一点也很巧妙。

看下 build 时的 rollup 插件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cwcjek2LLyyodicxiafJMMXYgicmYxRMUSYzpguTPJM2SiaWf75HH7Hvxhg/640?wx_fmt=png&from=appmsg)

是不是似曾相识？

对比下 dev 时跑的 vite 插件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cLMTapZK2IzBy8lHsUmcJBa36C1kkk2ShZs42BzLC8qFQQEQVo8ng3Q/640?wx_fmt=png&from=appmsg)

没错，vite 插件时兼容 rollup 插件的，这样在开发的时候，在生产环境打包的时候，都可以用同样的插件对代码做 transform 等处理。

处理用的插件都一样，又怎么会开发和生产不一致呢？

这也是 vite 的巧妙之处。

在 dev 的时候，它实现了一个 PluginContainer，用和 rollup 插件同样的参数来调用 vite 插件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cekHfnIosRuqaYzKiaXyoSwpjQZbvqEwjcY13WR7DjSSJRib38hWWCQwA/640?wx_fmt=png&from=appmsg)

然后 build 的时候，可以把这些插件直接作为 rollup 插件用。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cOan3LVebmQYI20l07OK7HVibZjicLTQ05nAfoW1BE9K8KMIDFE1KksRQ/640?wx_fmt=png&from=appmsg)

对了，vite 在 dev 的时候还支持热更新，也就是本地改了代码能够自动同步到浏览器。

这个就是基于 chokidar 监听了本地文件变动：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cG6I7PgsyymODZiasz1uMfxBuCwBwTLs0bzlQm5Tm8u8Ohz0mAHH6DWw/640?wx_fmt=png&from=appmsg)

然后在模块变动的时候通过 websocket 通知浏览器端：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67chkCGn87HXMricgaibqmYibicmJ6snpFCSGtdZvwwlY5iaMt0HpCTfGia3gPw/640?wx_fmt=png&from=appmsg)

浏览器端接受之后做相应处理就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cjOMrE9b0LOvVAonkzKGpEz98T7EZNiahlzAfCR9hdkGQDfISgyYQKSg/640?wx_fmt=png&from=appmsg)

我们改下 Aaa.tsx，可以看到浏览器端收到了 update 的 ws 消息：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cXbPasFib4yEL5FvB3piaUemvbG9fJcthTDjU0l6d39XQlicxwuVaWdurA/640?wx_fmt=png&from=appmsg)

收到消息之后，把模块换成这个新的，加上 timestamp 重新请求就好了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGjick7BZ3kkozyJK38Plib67cfFZKaFWAibzuvVIoxHH31mK99NYzaa4baqxiaIL065fc2jsZEAHA7TxA/640?wx_fmt=png&from=appmsg)

总结
--

今天我们分析了下 vite 的实现原理。

它是基于浏览器的 type 为 module 的 script 可以直接下载 es module 模块实现的。

做了一个开发服务，根据请求的 url 来对模块做编译，调用 vite 插件来做不同模块的 transform。

但是 node_modules 下的文件有的包是 commonjs 的，并且可能有很多个模块，这时 vite 做了预构建也叫 deps optimize。

它用 esbuild 分析依赖，然后用 esbuild 打包成 esm 的包之后输出到 node_modules/.vite 下，并生成了一个 metadata.json 来记录 hash。

浏览器里用 max-age 强缓存这些预打包的模块，但是带了 hash 的 query。这样当重新 build 的时候，可以通过修改 query 来触发更新。

在开发时通过 connect 起了一个服务器，调用 vite 插件来做 transform，并且对 node_modules 下的模块做了预构建，用 esbuild 打包。

在生产环境用 rollup 来打包，因为 vite 插件兼容了 rollup 插件，所以也是用同样的插件来处理，这样能保证开发和生产环境代码一致。

此外，vite 还基于 chokidar 和 websocket 来实现了模块热更新。

这就是 vite 的实现原理。

回想下，不管是基于浏览器 es module import 实现的编译服务，基于 esbuild 做的依赖预构建，基于 hash query 做的强缓存和缓存更新，还是兼容 rollup 的 vite 插件可以在开发服务和 rollup 里同时跑，这些功能实现都挺巧妙的。