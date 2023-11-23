> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/ALPNWOqiPAPcJJ73SsZwqg)

提到打包工具，可能你会首先想到 webpack。

那没有 webpack 之前，都是怎么打包的呢？

webpack 都有哪些功能？为什么这么设计呢？

这篇文章我们就来一起探究一下。

其实之前都不打包的，就是 js、css 分别用对应的工具编译下，然后在 html 里引入。

比如 js 用 babel 编译，再用 terser 压缩、css 用 sass 或者 less 编译，再用 postcss 做添加兼容性前缀等处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqljNhYISLqZBg0fUWgqvbAztZDGCwjJt1RDmdTWQTibSSpVU4CHvGaLAg/640?wx_fmt=png)

当然，现在也有很多场景是不打包的，比如 node 环境，就只需要编译：

这是一个 nest 应用：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlMs4goCYVYgYic3vwb9Hd4eticJEqBTUU0Y2SYPu4CUibu9NWjfUN9AGKw/640?wx_fmt=png)

执行 build 之后的产物是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlRNCVicBjVPT5AxDG9nY7aFE3kHJWibJfK3ufFADUT2S4VINvSZ1mUdsw/640?wx_fmt=png)

对每个 ts 文件用 tsc 做了编译，然后产生了 dts 和 sourcemap。

它并没有包含 node_modules，也没有打包，只是对 src 下的做了语法的编译：

之前是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql38PFqkicRWAV5GhZdJo94ib7hibnLETAh7XBx9Cp2IQ20PUUXcX9BYKYg/640?wx_fmt=png)

现在变成了这样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlJueoUiaGDyqCgYLjN3LpFhWcZM7icPxfruAuK6eVcBA6jM4303suQbcg/640?wx_fmt=png)

那运行时用到的依赖咋办呢？

手动安装一遍啊。

比如这个 nest 应用的 dockerfile 是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlHm8EntOXcruLM1vGHtzOg1Pdu7RqgwR9ibWoLmXRmo7sakDYicMYYHgw/640?wx_fmt=png)

把 package.json 复制到 docker 容器内，然后执行 npm install，之后把其他文件复制过去，执行 npm run build。

这样编译后的代码和对应的依赖都有了，通过 node 跑起来就行。

也就是说 node 场景下，只编译不打包。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlmwmR0cbd1HGBS1bM8ScvyTGFHMt6hVynz5978uVaFMXrrzvfGhia3nQ/640?wx_fmt=png)

当然，nest 也是支持 webpack 打包的，切换下模式就行：

我把根目录 nest-cli.json 里改为了用 webpack 编译：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql1aKUTGiciaJ0bib96ePGiaRouP85qQTmibicSychCsvsfWkibJ6pJyxkALxbg/640?wx_fmt=png)

再次 build 就只会产生一个文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlLSWsTszUZSxHddEHuBPicMtybj5peXSnopZEDAQADllwrYgdH636iaug/640?wx_fmt=png)

把模块打包到了一起：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlXNluyWLstL5bibr81Moft50hn6fiab8H4QgXrkFoxXhdDTJ7wqf8leBg/640?wx_fmt=png)

node 执行这个文件也是一样的效果。

node 环境下可以不打包，打包只是为了提升一些加载速度。

但是浏览器环境就是必须要打包的了。

因为会有很多的模块，如果不打包，运行时需要一个个加载，会很慢。

前面讲到了手动编译各种资源，然后引入 html：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlKvnwQSLzmOXa7g0y8Enq05sKm0BBia0gBvcegQhRviaV66y3kbTicIS9w/640?wx_fmt=png)

后来出现了 gulp 这种任务运行器，可以自动化执行一系列任务：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlBLysTrQGEhShxCT2wTxG9zbB9sia1FLWJemE8CSibsm4MicmkZDZILU5w/640?wx_fmt=png)

也就是监听文件变动，自动编译。

gulp 只是负责组织任务，自动化执行的工具，本身不做编译、打包等事情。

这个时代也有打包工具，叫做 browserify。

它会多个模块打包成一个 bundle 的，而且也支持 bundle 拆分。

比如你有两个模块，依赖了一个公共模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqld3MBy3qIpZnTQkcohBtoKeJhxib9eMhicDyKV1ufiaPJIf3ACickcg8SBg/640?wx_fmt=png)

可以这样来指定分成 3 个 bundle：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql6u7xbcRt3ePV2eFaXxPBuXMaKZ3JXAogYoq8buXt1BUz36YUH2cpiaw/640?wx_fmt=png)

运行时就有 3 个 js 文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlL7w5ky1uGVnrTnVbgicjo7vebOMJvyhCXCXlv1KGp001jEBIqfTibCHg/640?wx_fmt=png)

那个时代就是用 gulp 组织编译任务，用 browserify 来做 js 的打包。

后来 webpack 就出现了，它的核心就是把所有 web 资源一起打包：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlfSYLlkK0vrS5bjCz0fZwMUD6ybFftqn0w9icwZdEVMWo6WPyLSOLQvw/640?wx_fmt=png)

想想在大家都用 gulp 组织编译任务，然后用 browserify 打包 js 的时候，突然出现了一个工具能把所有的资源一起打包，这种概念是很新颖的。

至此，你才可以在 js 文件里引入 css 文件等：

```
import aa from 'aa';import './index.css';export default function() {}
```

webpack 实现这种打包的原理是基于 loader 处理各种资源：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlxH4uMbicuJBh2zSE4qzxHa239WChSIswJkQqsbJ01lEX9QOIW2XcYPQ/640?wx_fmt=png)

所有的 loader 都要把资源转成 js 模块的形式，不然没法引入：

比如 file-loader 会把图片复制到 output 目录下，然后 js 模块导出一个路径：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql1PhMvzovU69UXEiaTXYfpiaRibdZCJoOiaBRkN4Zic9Cia3U87vYBpcse2Pw/640?wx_fmt=png)

url-loader 则是当图片小于一定的范围，就变成 base64 的方式内嵌，否则用 file-loader 处理：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlDrfwH6K19RgfowtlpkJC2thur6TTzPIet2V27mrzRtYbwV9KdmwINg/640?wx_fmt=png)

原本的 css 是这样的：

```
.aaa {
    background: blue;
}
```

css-loader 会把它变为 js 模块的形式：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlWP5bKwA6xXBh2Fjq3uY3K6AQajAp6nyHGSiatib0hayvDoBLN7TrzPLA/640?wx_fmt=png)

然后 style-loader 把它作为 style 标签插入到 html 中。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlJwWtBHgQ4ibmDRCO12x7QBTzicgI1UQLuH0yibvKiafwN9kX12hYD5MZQA/640?wx_fmt=png)

至于 less-loader、scss-loader、postcss-loader、ts-loader、babel-loader，这些 loader 只是对模块内容做编译，没有做什么额外的事情。

有的同学可能会问，只不过是把原来用 gulp 的 task 组织的编译流程变成用 webpack 的 loader 来组织了，有啥很大的区别么？

当然，有这样几个明显的区别：

之前用 gulp + browserify 的时候，编译是编译、打包是打包，两者是分离开的。

现在用 webpack，会在打包的过程中去做编译，两者紧密结合。

之前 css 和 js 是分离开的，两者各自编译，然后 js 做打包，最后在 html 里引入两者的产物。

现在 css 和 js 有了关联关系，可以基于这个实现 css 的模块化。

比如 css modules：

源码中在 js 模块中引入 css：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlOs0EnvH0sl2AMTKO3FzyoqWtxzibmYZoPuRSV5jv7kET5DibQejIkBbw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlM5LDX5gniaE95egoJ5oVz5uEicwscfoGGVKYpp8Ik29JOh5J7m2hTFXQ/640?wx_fmt=png)

编译后会给 css 和在 js 里用的 className 上加上 hash：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql2CRfF8N0rN8xibSYTHLpsZE0hqwZPcib8kdAOmhMF1foCTUNCppic7Qog/640?wx_fmt=png)

这样自然就做到了 css 的局部化，这就是 css modules。

这个功能是 css-loader 实现的，开启很简单，加上一个 modules 标识就行：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlyvd81OlZNPdq2eMAgbG8Fu2F9NpuEf454fxKzVmXkEwCNx4W3VRwyQ/640?wx_fmt=png)

在 vue 里用的是 scoped css 的方案，也是差不多的，那个是由 vue-loader 实现的。

这种功能的实现，就是基于在 js 里引入了 css 实现的。

不然都不知道两者的关联关系，怎么做 css 模块化？

当然，用命名空间来隔离 css 的方式做模块化也可以，比如 bem 命名规范。不过手动维护模块化不靠谱。

webpack 和 gulp + browserify 的区别，除了编译和打包紧密结合、js 和 css 相互关联外，还有不少：

比如 code spliting、dev server、hot module replacement、tree shaking 等 webpack 的功能。

我们分别来看一下：

首先是 code spliting：

比如我有这样一个模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql0bQrvSfHxNXicnfL8M98vatZQXMiauqAC1XyUq6iaXd3VicZnzkXPmcSbw/640?wx_fmt=png)

我直接引入它来计算是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql9RX4ZBZEJmJ5UCo5dUyobYGx7ZWzDiaUuvEZ7QPKbzquEtFHCHyFXkw/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlv27TCkHCkor3GduEHiau6tpAIXEWerzG6oTglJl9cNB2k40zRDRKL1w/640?wx_fmt=png)

这时候只会加载一个 js 文件，因为所有模块都打包到一起了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlbhJr6MxpdfrKhYIurUia2ibaodgv1FCfLDHsEoRC2cYG7TqD7vX9iahVg/640?wx_fmt=png)

但如果这个文件特别大，比如有 10M 这么大，但是它又不是马上要用到，所以我们想把它延后加载，不然会拖慢页面打开速度。

这就要用到 webpack 的 code spliting 功能了：

改成这种方式，使用 import 的 api 加载：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqltwrFYVWfegEXS5rJCCKfEiaWOVBLvoqoucCbkHXs1VClqnXmvVic5ntg/640?wx_fmt=png)

这时候代码运行依然是正常的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqljw6GHMfGyNcnefdYUFPK10iaZtVCHaWEvRoEibUBf0FCSB9HbfyvPbCA/640?wx_fmt=png)

但这时候有了两个 js 文件，第二个 js 文件是异步加载的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlicFn9SJqjEhqCJy6UVgWjKVf27XeenNXLXMoouRLjF8TiaXKeOYF1IlQ/640?wx_fmt=png)

这样可能还不够明显，我们加个 setTimeout，3 秒后再执行这段逻辑：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql7ibkxibnXNibjVzTeiaSibTNyggnSgtqB7Sb08BhouLXZOcQGzSph9NnA2g/640?wx_fmt=png)

可以看到，这个模块是 3 秒后才加载的：

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqloycA3kLeibcmKr9PXmIpmqWXlBuc9kyUj7gMmVEvOk6IicvrOQDYIIPQ/640?wx_fmt=gif)

也就是说 code spliting 可以让模块用到的时候再加载。

webpack 打包的时候会把它分离出去。

这里就涉及到了 chunk 拆分的概念。

webpack 的编译流程是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlyC0wEr7sRXL3dqxZIg24r5dTVCxTBmZ5A4xA6tXPHIlVbvUwMFygZg/640?wx_fmt=png)

从入口模块开始解析依赖，分别用对应的 loader 来做模块的编译，然后生成模块依赖图 ModuleGraph，这个阶段叫做 make。

这些 module 要按照不同的规则来分组，也就是分到不同的 chunk 里，这样 ModuleGraph 就变成了 ChunkGraph，这个阶段叫做 seal。

最后，不同类型的 chunk 用不同的模版打印成对应的代码，然后输出为 js 就好了，这个阶段叫做 emit。

code splitting 的功能，其实就是在 chunk 拆分阶段做的。

也就是给异步加载的模块分到单独的 chunk 里，然后输出到对应的 js。

当然，这个 chunk 拆分的逻辑是可以自定义的，也就是 optimization.splitChunks 的配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlJVffIbIFiaOkibGHiasaWk2tTPI9LHicMmTBTXuXRtINCWtPbtHGJ0hUFA/640?wx_fmt=png)

其实也很简单，就是两个维度的拆分逻辑：

一个维度是定义每个 chunk 要有多大，初始加载最多能加载个文件等维度，webpack 会根据这些来调整 chunk 的拆分。

另一个维度就是在 cacheGroup 里指定符合什么规则的模块拆到什么 chunk 里。

基于这些就可以调整什么模块放到什么 chunk 里。

当然，如果你觉得这些 chunk 配置还不够灵活，可以自己写插件来拆分 chunk，比如我之前写过 chunk 拆分插件的文章：[写插件控制 Webpack 的 Chunk 划分，想怎么分就怎么分](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247493292&idx=1&sn=dfc933d14b9d331fba19e6042ba84a05&chksm=cf032997f874a0818f4f28a79252b30b9ba6a258c3858ac2979ef27417f83757ac1b70fc18aa&token=143237976&lang=zh_CN&scene=21#wechat_redirect)

总之，webpack 的什么模块分到什么 chunk 里是可以自己控制的，code spliting 的模块默认会分到单独的 chunk 里。

然后是 dev server 功能，这个就是 webpack 在开发时会启用一个静态服务器，这个静态服务器除了提供静态资源的访问外，还支持代理等功能：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlc2RXraezhsvp8VIWT6DPOnE64jyicSofzMpuQ2MGQC5ic7opRY6H97jA/640?wx_fmt=png)

也就是这样：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlkgCDAAEdNzjHpOCXXeIokr8LcY8DOkhOsbryaoFpuicxI2JaEwGGFYg/640?wx_fmt=png)

dev server 会 watch 工作区的文件变动，自动重新 build，提供静态资源访问。

并且还会 proxy，也就是转发请求到真实的服务器。

这个代理功能还是挺常用的。

再就是 webpack 的 tree shaking：

如果你 mode 是 production，那 tree shkaing 就默认开启了。

效果是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlmO6roiclsVXTKIMtYPVwpr2JNKup4iaPQC50PpKfWq9GdNtyBNaTkGrQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqljPybgzJXFFbbqsIRYpPFKvm3fCia6ibvMXCEf81rrxrRFe3c7KIo2D8A/640?wx_fmt=png)

模块导出了 add 和 minus 两个函数，只用了其中一个。

然后执行 build，产物是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlricOXckdc38o5AaXsr98PVxaFQt0Vll00NFzxSSfdqVu9ZVnGbhicFKA/640?wx_fmt=png)

可以看到，add 变成了内联的方式，而 minus 呢？

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlYIic3iatMR895ZeKv1SibBQzbqUMmYwe3bgYBw7icfACcXj9ZrKCTQgF3A/640?wx_fmt=png)

已经被删掉了。

这就是 tree shaking。

对于我们来说它可能是隐形的功能，因为它不像 code spliting 一样，需要手动 import 才启用，这个是默认启用的。

它的原理也很简单，就是对 exports 打个标记，如果别的模块没用到的话，会把它标记为 unused exports，然后会在压缩的时候删掉。

再就是 hot module replacement，也就是 hmr

我有这样一个组件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlbUxIMzib8gjpLEapBxyN8qIpq9x3V1Uiaa0zwUdPuhibKAA3F3nuOvU2Q/640?wx_fmt=png)

渲染出来是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlDGuzsnMOaz1LeUMghV2JKxQgsphbeltkWh2Hmsgfs4LWzu9KT3qM1w/640?wx_fmt=png)

我在 devtools 手动打印了 111、222、333。

然后在 vscode 里把组件改了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlOm2tbFibK70pNr6O0fWzBfeLBbibW7OF5pvohjZjcgicDFwicXsWqjbodQ/640?wx_fmt=png)

这时候页面中显示的内容也改了，但是没刷新：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlqSbQQrrjwHYBviboiaA5Cz6X9TNFRia4zRaVQ6f8KpW50lYX5vOvxmsiaQ/640?wx_fmt=png)

因为如果刷新就这样了，会把 console 里的东西清空：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlXloTKlmTqpQPvZNM98icCiac4dvj7BqkdVUTiag3O4Dgye4ffMYdjFPkw/640?wx_fmt=png)

这就是 hmr，模块热替换。

它是怎么实现的呢？

看下 network 就明白了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql2QTRtltEmdKeeZ0iazQ6znh9ox9BOurMbnKzictF1icDBH5nFsvdm0P1Q/640?wx_fmt=png)

有这样一个 ws 的 websocket 请求，messges 里是它发送的消息。

然后我在 vscode 里把组件内容改为 333

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqleKJJQBb7YccpVT9usTqiarBBibPSaB3Ciaia5k3OLmOeBnMZesBNbibHq8g/640?wx_fmt=png)

你会看到 ws 收到了 type 为 hash 的消息，带着最新的 hash。

并且发送了 xxx.hot-update.json  和 xxx.hot-update.js 的请求。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqleRpsu3nkVntmKxIDgZy7aR5sfaXcVVBuDGiaRfd1bO73EiannSN5BfibQ/640?wx_fmt=png)

hot-update.json 是一个 manifest 清单文件，包含了这次更新了哪些东西：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqliarW7xVqZfrmAd0ZcYPjOibicuHoQsbibGTdkrTjMUyH4dybmwdGEjfTHg/640?wx_fmt=png)

不用细究 c、r、m 的具体含义，只要知道它代表了这次更新涉及到的 chunk 就好了。

然后 hot-update.js 里就是涉及到的模块的最新代码：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqllKC5vdzauKPIEAUB7uSjmYKgQUIwVhzFYME2Ujt8EtO1uFLNTXBBhA/640?wx_fmt=png)

当然，只是有了最新代码还不行，你还得知道怎么应用这段最新代码，也就是要定义个 module.hot.accept 来接受。

比如我们在组件里引入了 index.css

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlfsvBP7ZuO3ZOC1LWic6IgopqWsKyllE9HZSgKVTqQL251j0DHhNMic4g/640?wx_fmt=png)![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlNvPXq0hBKteTpdictHKpOG1kot6tFZxCUpXCCgsUdA3I7AGdqZJ18kA/640?wx_fmt=png)

页面是这样的：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlaKDzHhAicQib2xUJItRMAbHEJLI6wZZvAEbGJqhCsAQ1CMD9wicnKEcyw/640?wx_fmt=png)

这里的 style 是 sytle-loader 注入到 html 里的，前面讲过。

然后我在 vscode 里改下样式：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlQsRkHClhVRLj8QZ3rrRqk9aINiciatKoyDXsFlcUETFIlqaVgw51BlyQ/640?wx_fmt=png)

可以看到收到了 hmr 的更新：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql9OjqoEMTicXreIulGnSzMbox2Zw8xFibt5RiaUs539vRdXEHzpH0NUrSg/640?wx_fmt=png)

这时候页面里的 style 也跟着改了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqldBjA9ibemXOK3Lr6f5l1YXj6ApB1Eb8GOSbv6Ovj8AsexfpKsNzclng/640?wx_fmt=png)

原理可以在 style-loader 的源码里看到：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlDO1cosV2KCh3mrRj7UCNay1jXsIHpLCJ5clD5yTFl40ps6cnQdKPlQ/640?wx_fmt=png)

style-loader 会在产物里注入 hmr 代码，定义 module.hot.accept 方法，如果收到更新之后，会调用 update。

而 update 里做了 style 的更新

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlibRVY7jPul4ibnsjicl4fTF1dM5twricFMNsp1T98Grwy3SUtnT91V6zfQ/640?wx_fmt=png)

这就是 hmr 的全流程。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlgXs3viboCj0oXMhnfgyNpicFQn2cHLy7GLuaViclVyZGRayNtcFtlXGsw/640?wx_fmt=png)

dev server 会和浏览器建立 websocket 链接，用来推送文件变动的消息。

浏览器的 webpack runtime 收到变动消息之后，会下载对应的 xxx.hot-update.json 和 xxx.hot-update.js 文件

然后怎么应用这些新代码在 module.hot.accept 里定义。

这些 hmr 代码一般都是在 loader 里实现的，开发者不需要关心。

此外，webpack 还有个 module federation 模块联邦功能：

也就是在一个 webpack 应用里定义导出的模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlhz7VqYSnZE3bpBcCXVDZ86yllU5OicicVONfpGbcmQYRZPwIfibNgFx4g/640?wx_fmt=png)

另一个 webpack 应用引用这个文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlqhubMjMqvnpYAep8OzjibG7iaoshreicIV0S7NrmiaqvI505aMl3qdMxKg/640?wx_fmt=png)

然后就可以用里面的模块了：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAqlMft3YUtYM73Ulh242JvibibA9icvn2iaP0bneSMBmibM6sUcYEncXF8QQsw/640?wx_fmt=png)

总之，module federation 是在多个 webpack 应用之间共享模块的机制，所以叫做模块联邦。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/YprkEU0TtGiaA2v2r1ClhKkMho9AKzAql0e4LpZcia5c6YK1hB9XubriccFc1dZmEKdFAicxaSRHJYib71o12ZZnm0w/640?wx_fmt=png)

如图所示，应用 B 里引用了应用 A 里的一个文件，就可以使用它的 aaa 和 bbb 模块了。

这样就实现了应用之间的模块共享。

更多关于 module federation 的讲解可以看[这篇](https://mp.weixin.qq.com/s?__biz=Mzg3OTYzMDkzMg==&mid=2247495171&idx=1&sn=9ecd8ae72d31f359c47573506ed1704c&chksm=cf032138f874a82e305b6276034f0b3bb3c613d02ed18bba9a2f35e834e90d06065bdf9cc5ab&token=143237976&lang=zh_CN&scene=21#wechat_redirect)。

回过头来，我们还是在对比 webpack 和之前的 gulp + browserify 的方案。

还用对比么？

webpack 完爆之前的方案。

总结
--

之前 web 应用并不会做打包，只是对不同资源用不同的编译工具编译下，然后引入 html 里使用。这和 node 里只编译不打包差不多。

后来出现了 gulp，通过 task 来组织这个编译流程，并且出现了 browserify 来对 js 做打包。

再后来，webpack 横空出世，它支持在 js 里引入所有的资源，比如 png、css 等，然后通过 loader 来对它们做处理。

*   file-loader：把文件复制到 output 目录下，并在 js 模块导出路径。
    
*   url-loader：小于一定大小的文件用 base64 内嵌，否则用 file-loader。
    
*   css-loader：把 css 文件的内容变为 js 的变量导出
    
*   style-loader：把 css 设置到 html 的 style 标签
    

这些 loader 在转换代码之外做了一些额外的事情，其余的  ts-loader、babel-loader、postcss-loader 就是纯粹转换代码了。

webpack 的编译流程分为 3 个阶段：make、seal、emit。

从入口模块开始构建依赖图 ModuleGraph，对每个模块用对应的 loader 处理，这个阶段叫做 make。

对 ModuleGraph 做 chunk 拆分，按照 splitChunks 的逻辑或者其他拆分逻辑，拆分后就生成了 ChunkGraph，这个阶段叫做 seal。

之后生成代码，对不同 Chunk 用不同的模版打印成最终代码，这个阶段叫做 emit。

我们对比了 gulp + browserify 和 webpack 的功能：

*   编译和打包融为一体，不再是之前 gulp 的时候编译时编译、打包是打包了。
    
*   js 和 css 紧密关联，出现了 css modules 这种根据 js 模块和 css 关联关系做的 css 模块化方案。
    
*   实现了很多功能：code spliting、tree shaking、dev server、hmr、module federation 等。
    

我们分别过了一遍 webpck 这些功能，

code spliting 是暂时用不到的模块，可以通过  import 的 api 异步引入，webpack 打包时会把它分到单独的 chunk 里。

tree shaking 是 mode 为 production 时默认开启动的，会在用不到的 export 上打标记，然后删掉。

dev server 是静态资源服务，同时支持对接口做转发的 proxy 功能。

hmr 是基于 dev server 的 ws 服务，文件变动后通过 ws 告诉浏览器有更新，浏览器去下载对应的 xxx.hot-update.json 和 xxx.hot-update.js 文件，然后通过 module.hot.accept 应用更新。

这个 module.hot.accept 代码一般是在 loader 里注入的。

module federation 是多个 webpack 应用之间共享模块的方式，一个应用里声明文件名和导出的模块，另一个应用里远程加载这个文件，就可以用里面的模块了。

这篇文章我们串了串 webpack 出现之前的历史和 webpack 的核心功能。

不得不说，webpack 确实是极大的推动了打包工具的变革。