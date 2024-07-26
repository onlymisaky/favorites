> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/KfeFKR1WuA-Y6SkpKP3ShQ)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOwz6LRiahnvNWY6CjRGAWF4tOWGyWu1LnUE6n5ia5wdibtqae4gnzPD4Ng/640?wx_fmt=png&from=appmsg)

经过多番交流才知道，没搞过项目部署的前端这么多，实在是有点超出预期。就借助这个案例，先简单初步尝试一下如何部署项目到 github pages 上吧。其中有一些概念可以扩展开来自行理解和消化。有需要的就收藏起来，读不读就无所谓了。

本文主要分享基于 vite 创建的前端项目如何部署到 github pages 上。你也可以参考其中的内容部署别的前端静态项目。

> ✓
> 
> **注意：**本文介绍的是如何通过非 github actions 的方式部署代码

### 方式一：简单部署

**1、**先使用 vite 创建一个项目，并编写好自己的逻辑。我这里准备的项目是使用 vue-vine 创建的项目。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOSrIQaOJwzIibWx9iaFMLrIvZAddhrTojicEVCm7cHYXG66IuJ976wKLzA/640?wx_fmt=png&from=appmsg)

**2、打包**

```
npm run build
```

在 github 的仓库中，找到如下页面。

> ✓
> 
> github repo -> Settings -> Pages

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOHE7NKLyOicWSfsBppHGZDQfqd7HeNMzBYUDbRu78ibhCg7tWKNqrueKA/640?wx_fmt=png&from=appmsg)

**3、Deoply from a branch**

这里的 **Source** 面板提供了两种部署方式，一种是通过 github actions 来部署，另外一种是通过分支代码来部署，我们这里选择第二种。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOIB7iarRJlyicF8UIdCuzcQ0PBBc8gRbWLnurxhgPnjJXQM69shKCaWibw/640?wx_fmt=png&from=appmsg)

**4、选择分支与目录**

这一步需要特别注意的是，不同的选择需要对打包结果进行不同的调整。这是许多人在部署 github pages 时会失败的主要原因。

第一种，main 分支的根目录。此时需要我们将打包之后的 `index.html` 文件放到打包之后的根目录下。并且相对应的静态资源都需要做调整。因此这种方式通常情况下我们都是不使用的。

第二种，main 分支的 `docs` 目录下。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhO6J6XMJuYGlaosMPYF1icTDt955XKsS6NazlsM89Ygo0TVnNxno0tNBw/640?wx_fmt=png&from=appmsg)

选择此项之后，我们需要把存放打包结果的目录，从默认的 `dist` 修改为 `docs`，在 `vite.config.js` 中添加如下配置即可

```
export default defineConfig({  plugins: [    VineVitePlugin(),    tailwindcss()  ],+ build: {+   outDir: 'docs'+ }})
```

> i
> 
> > > 需要特别注意的是，打包之后，生成的 docs 文件夹不能添加到 `.gitignore`，将其推送到远程分支，即可部署成功

剩下的事情就比较简单，你只需要将在 main 分支打包之后的代码推送到远程分支，过一会儿就部署成功了。

注意记得在配置时，要点击 `Save` 按钮，

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOgpPpsJ1lHmH960euHjQcLdrz5gss6aqljwswYm4VdVjtntjXLBJSZA/640?wx_fmt=png&from=appmsg)

等待一会儿之后，会出现该项目的访问地址。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOOurzMlam1icD5Tk4uS7mM68xQmFEo6j8d6FDzI3g0ibogXpPlDhW2B5Q/640?wx_fmt=png&from=appmsg)

**5、按需调整**

如果不出意外的话，到这里就部署成功了。但是意外就产生了。这里要注意区 github pages 给你分配的项目路径，到底是域名根目录，还是根目录下面的其中一个路径。

每个 github 用户，都有一个域名，例如我的域名是

```
yangbo5207.github.io
```

但是该域名只能针对其中一个项目生效，剩下的项目，就是会分配到根目录下的其中一个路径下，该项目的访问地址，会结合域名与项目名称组成

例如，我当前这个项目的访问路径为，`vuevinedemo` 是我的项目名称

```
https://yangbo5207.github.io/vuevinedemo
```

在这种情况之下，我们发现，vite 项目中的静态资源，默认访问路径是从根目录开始访问的 `/assets/...`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOeQMcjteIZsNYpTP4c8FNRLLDZKHBZ1BCBUXho7MJGniaagTqhXxUoGA/640?wx_fmt=png&from=appmsg)

因此，这个时候直接访问就会报错 404

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOQmMNxEibTWOJJIK4YlByKDzw2XllpslhnicNELbctqTQiaTtgf7UTxnibQ/640?wx_fmt=png&from=appmsg)

因此，我们要在打包时，把静态资源的绝对路径，修改为相对路径。继续修改 `vite.config.js` 如下

```
export default defineConfig({  plugins: [    VineVitePlugin(),    tailwindcss()  ],  build: {    outDir: 'docs'  },+ base: './'})
```

打包结果

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOBhMaxr800Ywe1HFQiarWib5wXZGVYeUR4tNl4jtVzqSuicibzh4BSmYJIw/640?wx_fmt=png&from=appmsg)

然后推送代码到远程分支，就可以正常访问了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhO1gdDfe9v7ibEtEb10DhGD7OYy5CQyiahhQkFWqaVHVmbhjxFFwmKn18A/640?wx_fmt=png&from=appmsg)

**6、理解路由**

如果你在本地开发中使用了 history 路由相关的方案，那么这里可能还会出问题。

> ✓
> 
> 一定要特别注意如何区分客户端路由与服务端路由，如果你目前还不具备准确区分 pathname 在客户端和服务端都不同表现的话，项目中建议优先使用 hash 路由，这样可以避免许多问题

这里列举几个使用 history 路由时，可能会遇到的问题。

```
const router = createRouter({  history: createWebHistory(),  routes: routers,  linkActiveClass: 'text-red-500'})
```

当你的部署之后，项目根目录不是 `/` 而是 `/vuevinedemo` 或者其他名称时，我们必须要同步修改在项目中的路由设置

例如，我的代码为

```
let base = '/vuevinedemo'const routers = [  {    path: base,    component: HomeView  },  {    path: `${base}/tutorial`,    component: Dashboard  },  {    path: `${base}/component`,    component: Component  },  {    path: `${base}/blog`,    component: Blog  }]
```

此时我们需要特别注意，一定要把 `/vuevinedemo` 当成你整个项目的根目录，否则就直接跑到 域名的根目录下去了

正常的表现如下，注意看路由的变化

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOtLVaicaRjcsiaBibfGbTHHltcfNhCSKoV4srUFiaKvmQqOz30YbUT2cVQg/640?wx_fmt=gif&from=appmsg)

此时的路由都是客户端路由，但是 github pages 的服务端目前只处理了 `/vuevinedemo`，因此，此时当我们在其他的路由刷新页面时，会直接 `404`

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOYlliaLkylDmxVnDpPoO3tCYjXULuIrS0Fz6RJp7UWahibyjahYWQBgbw/640?wx_fmt=gif&from=appmsg)

这个时候，我们可以把 打包文件中的 index.html 复制一份，重命名为 404.html 就可以了。

build 指令修改如下

```
"build": "vite build  && cp docs/index.html docs/404.html",
```

> ✓
> 
> 这样处理之后，我们就会发现一个问题，那就是本地开发环境需要的内容与部署之后的内容不一样，因此，为了解决这个问题，你可以把 base 提取出来，然后通过区分环境变量的方式给 base 赋予不同的值。

我们也可以重新自定义一个域名，来表示解决上诉遇到的根目录问题。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOP2QeNZhUF3ibTF7KexjnoDCAfFbBTQCBgm5pRFmtV7Zzp0QmRPjFQsQ/640?wx_fmt=png&from=appmsg)

此时，我重新解析出来一个新的域名，这个新的域名需要你通过其他的方式获得。输入到这里，等待几秒钟，等到他 DNS 解析成功之后，就可以正常访问了。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOy93R5bc95M8fjb5AcGR9BiaGzSVv4ZpBCSUrSdHbf8FiclTeibnicr1rqw/640?wx_fmt=png&from=appmsg)

**此时，我们要在项目中把刚才的代码调整回来**。这个时候我们就通过 `vine.usehook.cn` 来访问该项目，而不是通过 `yangbo5207.github.io/vuevinedemo` 来访问。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOSNmkGNpdibDcMcdqxehsJLE8X2LsSomPgicAVdSpOX4tqFxs8piaVsabQ/640?wx_fmt=png&from=appmsg)

### 方式二：gh-pages

刚才这种方式确实比较简单，但是每次都需要把打包文件提交到 `main` 分支，有点不太优雅，如果你不太能接受这种情况的话，我们可以使用另外的方式，把打包之后的代码放到另外的分支上。这个分支通常为 `gh-pages`

在项目中添加如下依赖

```
yarn add gh-pages -D
```

然后创建一个新分支，命名为 `gh-pages` 并推送到远程分支

```
git branch gh-pages
git checkout gh-pages
git push
```

确保在远程的 github 仓库中能看到这个分支。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOlJbvJo83IsfwIQA48cUtTqZvV4jSJb5QgsRxeK4jVwiagicCErqjtZicA/640?wx_fmt=png&from=appmsg)

然后在 Pages 配置页面选择 `gh-pages` 分支，并选中根目录

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOZzwLTISKRjoZXcufc6ylVrKNiczA7gpWsgiaS0cCIyTOD9vn83ZKHUug/640?wx_fmt=png&from=appmsg)

确保你的远程分支名为 `origin`

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOIe7mromRKv6tRtPHy2S2p2P5wWPAgMD5m9eD34Bm8IukMlA1HQQNYw/640?wx_fmt=png&from=appmsg)

然后执行我们定义好的打包指令。

```
"build": "vite build  && cp docs/index.html docs/404.html",
```

```
npm run build
```

然后再自定义一个发布指令

```
"deploy": "gh-pages -d docs"
```

`docs` 表示打包的目录，你可以根据需要改成 `dist`

然后执行如下执行发布代码

```
npm run deploy
```

接下来只需要等待部署，一会儿就成功了。

由于此时你的自定义域名的 `CNAME` 文件可能已经被覆盖了，因此你需要重新添加一个 `CNAME` 文件。你可以在打包时写个简单的脚本自己创建一个这个文件

```
// CNAMEvine.usehook.cn
```

也可以每次部署之后，手动去刚才的配置中添加

![](https://mmbiz.qpic.cn/sz_mmbiz_png/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOoWPtIrf6OOHgNaYErMBibbiaiapxicR3YQhHEuWzp1TvGZkia5y4vy9ibbTw/640?wx_fmt=png&from=appmsg)

部署成功之后的完整演示效果如下

![](https://mmbiz.qpic.cn/sz_mmbiz_gif/Kn1wMOibzLcHFTvicZSnzklggZmrAodwhOyibCISq3OwOkpyvKH2Xut26UkYvEqibCDV1MV5eUD62JxAN8vnEQJQicQ/640?wx_fmt=gif&from=appmsg)

大家可以通过访问 `vine.usehook.cn` 感受效果。

* * *

### 总结

这里面有一些比较重要的东西会在面试中经常出现，比如分支操作相关的知识，路由相关的知识。**特别是涉及到服务端路由与客户端路由的区别与使用**是高频出现的基础题目。

成为 React 高手，推荐阅读 [`React 哲学`](http://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649867007&idx=1&sn=6443ff970cd077bbb50de74ce84afa06&chksm=f3e5936cc4921a7aba3fbf748b2f5a40369d8be7b6b2acf618f0701f477abea48b00e953165e&scene=21#wechat_redirect)