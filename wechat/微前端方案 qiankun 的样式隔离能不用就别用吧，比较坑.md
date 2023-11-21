> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/p0JkJiv0huDGOj41h5BiGA)

qiankun 是主流的微前端方案，其他的还有京东的 micro-app、腾讯的 wujie 等。

微前端就是可以一个页面跑多个 vue、react 甚至 jquery 等不同项目，它之间的 JS、CSS 相互隔离运行，不会相互影响，但也有通信机制可以通信。

那微前端怎么实现呢？

其实也简单，一句话就可以说明白：**当路由切换的时候，去下载对应应用的代码，然后跑在容器里。**

比如 single-spa，它做的就是监听路由变化，路由切换的时候加载、卸载注册的应用的代码。

只不过 single-spa 的入口是一个 js 文件，需要代码里手动指定要加载啥 js、css 等，不方便维护。

qiankun 只是对 single-spa 的升级。

它升级了啥东西呢？

第一个就是入口，改为了 html 作为入口，解析 html，从中分析 js、css，然后再加载，这个是 import-html-entry 这个包实现的。

所以你在 qiankun 的 package.json 里可以看到 single-spa 和 import-html-entry 这俩依赖。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEP3icNaCroFUaLzZSB5pLl3KNnF5mGYGf6QqkIjpH99iaE6xPL6GaTE7Q/640?wx_fmt=png)

加载之后呢？

自然是放容器里运行呀。

这个容器 single-spa 也没做，qiankun 做了。

它是把 js 代码包裹了一层 function，然后再把内部的 window 用 Proxy 包一层，这样内部的代码就被完全隔离了，这样就实现了一个 JS 沙箱。

这部分代码在 import-html-entry 里，也就是加载后的 js 就被包裹了一层：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE98ARY4chyBmicqN9Ey348pukfItMicj50rVPiaibvnBWuLjXA9zGnacpcw/640?wx_fmt=png)

原理很容易理解，就是 function 包裹了一层，所以代码放在了单独作用域跑，又用 with 修改了 window，所以 window 也被隔离了。

这是 qiankun 的 JS 沙箱实现方案，其他的微前端方式实现沙箱可能用 iframe、web components 等方式。

微前端方案的功能就那一句话：当路由切换的时候，去下载对应应用的代码，然后跑在容器里。只不过这个容器的实现方案有差异。

此外，还要设计一套通信机制，这个倒是很容易。

除了 JS 隔离，还有 CSS 的隔离，不得不说，qiankun 的样式隔离是真的坑，也是我这主要想吐槽的点。

哪里坑呢？

跑一下就知道了。

把 qiankun 代码 clone 下来，它有 examples，我们用这个来测：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEJO0ibpI7ekDXGIDDQ9FiafFHDmYqomQ23ibaO9JlLB4iaLynfESpy8OPqg/640?wx_fmt=png)

安装依赖，然后执行 examples:install 和 examples:start-multiple 这俩 npm scripts。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEtRK5OgK1lsdWJWq9A1ol7XFv1Jn4cvognX7BNzLxIqqewwLSgc0KoA/640?wx_fmt=png)

跑起来是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEeExyvibibxKdfKjUM2aQGtwsPQR0BF3h8A5pG7TplW3ohhD9StlOb68w/640?wx_fmt=gif)

在 react15 项目下引入 button 和 modal 这俩 antd 组件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEzawpORCiciaTLut3SmLqWvxDcnwNnBibovfmae1cVV9ib5pqxqjHss0I4A/640?wx_fmt=png)

然后再跑一下：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE0uLfLiaibtWmw6xX5sS4AM8TlTxWqRc8eyw17alicPQxmlibYjPibvIpGzw/640?wx_fmt=gif)

大家可能会说，这很对呀，有什么问题？

那是因为现在是没启用 css 隔离的, 所有的 css 都在全局：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEBVZnMYrL0dib9G4eIDAPIHgdnmM2UC6whYNnia0Qz5KALw1deRBBUJHg/640?wx_fmt=png)

这样各应用的样式会相互影响，比如主应用和子应用。

比如，我们在主应用 main 里加一个样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEpL8MHODrUicQicgRHXgv54HzbKBKCyFJ2iaVXfkdldPgVKlPfxtHgZLZw/640?wx_fmt=png)

子应用会受到影响：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEyA7LOFoPmgr7FYxpBRqibb7wicl7eTs3CxkK2xjv6clLjhjkpnkZyHgg/640?wx_fmt=png)

在子应用 react15 加一个样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEs70kZc0yFIPP19Z46dWVynlScgZib0rRn14C2pIU3evFQibjwZqQFa7Q/640?wx_fmt=png)

其他应用也会受到影响：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEcia0BbiaS5KCLazPBTILec5ycJdzrKIiaKYPKy1DDQG1pqp6utRMxlRxg/640?wx_fmt=png)

这样的微前端项目那还了得？各个应用样式都会相互影响。

除非命名给错开，通过 bem 等命名方案。

但这不靠谱，还是得通过框架层面解决。

qiankun 提供了两种样式隔离方案：shadow dom 和自己实现的 scoped。

shadow dom 是 web components 技术的一部分，其实就一个 attachShadow 的 api：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE4nYIcqFric4ibv4FNmJ31BgxpOCnGYDiavY7TxcW779ogkLH0ib7cul2LA/640?wx_fmt=png)

web components 添加内容的时候，不直接 appendChild，而是先 attach 个 shadow，然后再在下面 appendChild。

效果就是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEN6AvkZcRvTiaHjEicYSeg9wCpomMYosc2Dw8ulvzupZzCPqJ8mfpfl3A/640?wx_fmt=png)

qiankun 要在加载子应用的时候指定 strictStyleIsolation 才会开启这种样式隔离：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE97IO44rCpWEAcibuHBn9eRz5BBffaKEZPopncGrRozTwTho3huDjxzQ/640?wx_fmt=png)

那加了一层 shadow dom 有什么用呢？

试下就知道了：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE8e4CEJwAcLNHeTLMudxOyq4hiatdVMlWkhibiaHjQPv647fYj1rndwcRA/640?wx_fmt=gif)

还是一样的代码，但是运行结果不一样了。

首先，父应用设置的那个绿色背景样式没有生效：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEyJYDwztkSyuwooNV2BbMatibomNd60XZuTveILZ5pZzibVNwbrUDbTPA/640?wx_fmt=png)

说明有了一层 shadow dom 以后，外界影响不了 shadow dom 内的样式。

然后，外面这些按钮也没有变红了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLErQmBKUVsMhyTHlqUCmMOLYxMk045DtWOnAjhLIrGoWS2NfZMVWcXDQ/640?wx_fmt=png)

说明 shadow dom 内的样式也影响不了外界。

那为啥弹窗会变成这样呢？样式全没了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLERAgrBFeKpcDyDaW7IP0iaKjBEPHpSLoDK0LaL0sVSfeJwzzxRibQKEDA/640?wx_fmt=png)

因为弹窗默认是挂在 body 上的，也就不在 shadow dom 里了，那 shadow dom 里给它加的样式自然就不生效了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEJvpF0AEcSCSydTz3caeHpCl8icMia2OtddKyUUOyDUqicvyKu3tG73ATA/640?wx_fmt=png)

为啥弹窗要挂在 body 下，这个是为了避免被父元素的样式影响，比如父元素设置了 display:none，那这个弹窗是不是就死活弹不出来了？

还有样式也会被父元素继承过来的样式影响。

所以干脆独立出来，放到 body 下。

问题找到了，是 shadow dom 导致的，**shadow dom 样式影响不了外界，外界样式也影响不了 shadow dom 内的元素。**

也不能说是 shadow dom 有问题，人家本来就是这么设计的，只不过用来做微前端样式隔离还是不够的。

弹窗的样式问题怎么解决？

是通过通信机制把弹窗样式传过去么？那是不是改造成本又增加了？

所以 qiankun 的 shadow dom 的样式隔离方案是有问题的。

再来看另一种，这种是实验性的，所以叫 experimentalStyleIsolation：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE3G7Od0YtV7yY8SGEia3mX6VHvaPB9VAYRY1LxeWVztbZZQRgAMu7IBw/640?wx_fmt=png)

它是怎么做的样式隔离呢？

借鉴了 scoped css 的思路。

也就是对所有样式加了一层 data-qiankun=“应用名” 的选择器来隔离：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEhqReXLnjZTJYe1qMPBNeqxoeXicIM4gV6RaHxx03Rg5scx6UcKPl5Hw/640?wx_fmt=png)

这样其他应用的样式能影响子应用了，但是子应用的样式还是影响不了父应用，看上面的弹窗就知道了。

为什么呢？

因为所有的样式都加了 data-qiankun 的限制，那就影响不了子应用外部了，所以挂在 body 的弹窗还是加不了样式。

有同学说，那支持声明 global 样式不就行了？

问题就在这，qiankun 并没有实现这个功能。

而且如果要在 qiankun 里实现全部的 scoped css 功能，那为啥不直接用 scoped css 或者类似的 css modules 呢？

scoped css 是 vue loader 实现的组件级样式隔离方案，用起来只要给单文件组件的 style 加一个 scoped 属性：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEtXbCmD4RybL52sI13Hibqgv4Smm8qDqrRMLiafkGBrknXm1fXuiaQnuNw/640?wx_fmt=png)

css 选择器就会加上 data-xx 的修饰，这样就限制了样式只会在组件范围内生效。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE8L6s8hgQtECsMUr5pch39yEJb6Lef5xmibXQDX2OYDUYPI3BfMCELvg/640?wx_fmt=png)

只会在最后一个选择器加 data-xxx，因为这样足够了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEKfk8myeXibFlIdqSaEZB5GEk27nON6PYJMysDG18gC3ic5HJc94u4bZA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEEDP7Oxzjx7Fls5nH8UCLmicnYjkY6H5py03Av32vTdZfAQQXUSkukuQ/640?wx_fmt=png)

此外它还支持 /deep/ 给子元素传样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEdpNiagPazKJpLZL9Ho2Diaicp300zp8y5zAk7lEfEhjVV93qFcRz2icBaw/640?wx_fmt=png)

这样 deep 后面的样式是不带 data-xx 的，可以影响子组件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEsmyk48aFBXDuqjzXvTktJeJj3NOyyZpgv7FNWxFwWyib7liavU1Vkfbw/640?wx_fmt=png)

此外，也可以再开一个 style 标签写全局的样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEwyJwyNiaic0iaicraHibVlL8bXs66gQgTTIU8SSXsNgGicHQEiagibTf7k5HmQ/640?wx_fmt=png)

综上，**scoped css 支持组件级别样式隔离，还能传样式给子组件、设置全局样式等。**

功能上比 qiankun 的那个应用级样式隔离完善多了。

有了 scoped css，还需要 qiankun 的样式隔离么？

完全不用。

再来看 css modules，react 项目基本都用这个。

css modules 是 css-loader 实现的功能，开启也是相当简单：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE65ZQjObK7LhJPxfcFrz1YiaU5AqQh5n5tZXRrowGyhbJ77ibicnIw07NQ/640?wx_fmt=png)

比如这样的样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE9nFUv4RHnoWff8MO1dKbru1vD6brwqgIXxOVJibmrl7hnWT9Ys6KmWQ/640?wx_fmt=png)

开启后就会变成这样：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLESt8OV5g77NZV0zEmtksquCBXXUq2dG3KUEWAVETic7ib1JhFia8BUlErQ/640?wx_fmt=png)

在选择器名字上加了 hash。

那么问题来了，scoped css 是多了一个属性选择器而已，本身的 class name 没变：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEp9MV1VTIdtwdMU5I4icSv0sdxutxTUc8yRMlz7XB2LUIjCtxNqMzP4A/640?wx_fmt=png)

所以 class name 该怎么设怎么设，不受影响。

但是 css modules 是改变 class name 本身，加上了 hash：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEZiazWvl7QFAjeMazL8x3dyiaQTjLV2vSKYYiciaAmicUFCrf6OscIKFkIEQ/640?wx_fmt=png)

这时候还按照原来的方式写 class name 可以么？

不可以了。

因为最终的 class name 是编译后才生成的，所以要改成这样的方式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE7CcR5nPYhic55YIHUwN4Os629QZNibYPbwEqK22bWHwc2Qc9CcQ1wupA/640?wx_fmt=png)

动态引入 className，这样编译生成最终的 className 时就会替换这里。

你还可以加个 :global() 把某个选择器变为全局的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEeHSKic0NVibiaPRV5W56sPaYWUhaRcQOrzhdRJF2yQ2hq7fmxTZbGrz3A/640?wx_fmt=png)

这样就相当于 scoped css 的 /deep/ 和全局样式功能了。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE5ZniaibeGTjI6icvWLsr5PZvrkVdeobtc6BcPrWTjwjGWf0Yib6HrYMDbg/640?wx_fmt=png)

一般都这样用：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLE19hfCDhfcg2gD7n3mxWOib7dxEtYpFG1yhbvGLPJRuYAMicribgaXp6hg/640?wx_fmt=png)

顶层 class name 用 css modules 加上 hash，内部的 class name 该怎么用怎么用：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLESYGObNLYFtfbTF3ia9micdX281zdqHpg63e89icj9DHLhHzzUk0FpjQzg/640?wx_fmt=png)

生成的 css 是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj09OJM5kvOJqP9M0a3TmLEJ11VSveSEyIxAhdFCC5LBjgCgicJ40C1Iblrl8o1ibjMbUSFvCyOwkibA/640?wx_fmt=png)

既达到了组件样式隔离的目的，写起来还简单。

综上，**css modules 和 scoped css 差不多，都能实现组件级别样式隔离，能设置子组件和全局样式。只是实现方式不同，导致了使用起来也有差异。**

不管是 css modules 还是 scoped css 都比 qiankun 自带的样式隔离方案好用的多，那为什么微前端框架还要实现样式隔离呢？直接让应用自己去用 css modules 或者 scoped css 不就行了？

那是因为还有一些别的项目，比如 jquery 项目，你怎么用 css modules？就算用，是不是要改造，改造成本又上去了。

所以微前端框架还是要做样式隔离的。

只是现在的应用，不管是 vue 还是 react 基本都开启了组件级别样式隔离，qiankun 自带的样式隔离问题太多了，不如不用。

总结
--

微前端就是在路由变化的时候，加载对应应用的代码，并在容器内跑起来。

qiankun、wujie、micro-app 的区别主要还是实现容器（或者叫沙箱）上有区别，比如 qiankun 是 function + proxy + with，micro-app 是 web components，而 wujie 是 web components 和 iframe。

流程都是差不多的。

qiankun 做了样式隔离，有 shadow dom 和 scoped 两种方案，但都有问题：

*   shadow dom 自带样式隔离，但是 shadow dom 内的样式和外界互不影响，导致挂在弹窗的样式会加不上。父应用也没法设置子应用的样式。
    
*   scoped 的方案是给选择器加了一个 data-qiankun='应用名' 的选择器，这样父应用能设置子应用样式，这样能隔离样式，但是同样有挂在 body 的弹窗样式设置不上的问题，因为 qiankun 的 scoped 不支持全局样式
    

而 react 和 vue 项目本身都会用 scoped css 或者 css modules 的组件级别样式隔离方案，这俩方案都支持传递样式给子元素、设置全局样式等，只是实现和使用方式不同。

现在的 vue、react 项目基本都做了组件样式隔离了，有点全局样式也是可控的，真没必要用 qiankun 的那个。

qiankun 的样式隔离方案比较坑，能不用就别用吧。