> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/zX_dJRMrKtjOZASgSSPKXA)

![](https://mmbiz.qpic.cn/mmbiz_gif/AAQtmjCc74DW3EV9lZbcCmcmUHy72cZMS6742RRB7vTEt72pPiaRILoPRQ0zguzFTvXSTBbQO1YZ2ZFLiaAyw8qg/640?wx_fmt=gif)

**目录**

一、背景

二、技术选型

三、页面性能优化

    1. 自定义文档行为

    2. 打包优化

    3. 首屏资源动态化

    4. 图片资源优化

    5. Http2.0 下更优雅的拆包

    6. 第三方包体积优化

四、上线前的准备

五、页面级别的灰度 AB

六、全量的灰度收益

    1. 性能前后对比  

    2. 业务前后对比  

七、灰度方案

八、ES

九、灰度节奏

十、灰度时间安排

十一、稳定性

十二、总结

**一**

**背景**

目前软广自营 + 商投渠道，每个季度的消耗都不少，并且在不停地铺开多媒体平台，软广的重要性不言而喻。运营人员对于编辑器的编辑概念已经弱化（软广运营创建会场的频率不高），目前都是通过固定几个外投链接，然后通过在投放链接拼接上增长算法侧的捞月 ID 参数，来创建很多的外投广告计划。
===========================================================================================================================================

所以针对业务的变化，运营侧迫切希望目前**软广外投的页面打开速度得到优化，以及解决****会场****失效**等一些高频问题，同时**与现有的投放广告系统做充分的融合，减少中间无意义的 Gap**。

**项目收益**

这里我们选取技术指标 FCP_Rate FCP 的数值小于 1 秒内的数值占总 PV 的比例，用于衡量我们这次新版落地页的性能收益。  

---------------------------------------------------------------------

**Lighthouse** **跑分对比：**慢速的情况下**从之前的 56 分提高到 79 分，**网速较快的情况下，**从之前的 87 分 提高到 98 分。**

**真实数据收益：**老版的 FCP_Rate 平均在 35% 左右，新版上线以来，FCP_Rate 平均在 80% 左右。**提高了 45****pp** **左右。**

**二**

**技术选型**

在做技术选型之前，我们仔细分析了目前现有外投软广的 C 端页面，其中流量 top3 就是九宫格、单品图、商品流（如下图所示）。整个外投软广的流量高峰期能够达到 **100 多万 PV** **以上**，而这 3 个模板的流量**几乎占据了 90% 以上**，所以对高频软广页面优化的业务价值非常大。  

========================================================================================================================================================

![图片](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6JA2Q2D4ibtEJF9DcslByPrOYticAyIXSeq98OGkmJGaSEiafiauLiaSR6CA/640?wx_fmt=png&from=appmsg)

![图片](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6RrwU09k6XicJahCmJg0MM8wvV5j9JnNR6074vF3wwAiaGzt6pAcPT4hQ/640?wx_fmt=png&from=appmsg)

![图片](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6IwZmyNCsjlibkuQtw9hEaPm9kk0Vn9qic7cWSnhQOwPmoekEeqA46N6g/640?wx_fmt=png&from=appmsg)

左右滑动查看外投软广的 C 端页面

目前外投模板都是采用 SSR 去做服务端渲染的，但是 SSR 渲染的整个流程如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6yvNLAnoiafOJdfVSUXPibVJYVl4lEDhDu6Ata2NiaUV6eQkWu3y6vv5mA/640?wx_fmt=png&from=appmsg)

SSR 把数据拉取放到了服务端，因为离数据源比较近，数据拉取的速度会快一点。但这也不是完全没有副作用，因为需要在服务端等待数据就绪，`TTFB(Time to First Byte)` 相比 CSR 会长一点。

SSR 只是给我们准备好了初始的数据和 HTML，实际上和 CSR 一样，我们还是需要加载完整的`客户端程序`，然后在浏览器端重新渲染一遍 (更专业的说是 `Hydration 水合/注水`)，才能让 DOM 有交互能力。

**也就是说，`FCP(First Contentful Paint)` 相比 CSR 提前了，但是 `TTI(Time to Interactive)` 并没有太多差别。只是用户可以更快地看到内容了。**

我们生成环境 SSR  生成的 HTML 资源会被 CDN 缓存，也就是说当 CDN 有缓存的，上述图片中的流程是不会再走一遍的。

### **为什么选择 SSG 作为得物外投渲染的技术方案？**

通过分析了目前得物外投的 C 端页面，有下列几点：

*   重玩法和体验，而且本身就是投在短视频平台上的广告，大部分都是拉新，所以对于站外新用户可能就点击一次，后续再也不会点了，所以优化第一次的秒开体验还是很有必要的。
    
*   运营对于模板配置的改动频率较低，不是高频操作。如果模板是高频改动，那么 SSG 的技术方案可能就不是特别适合。因为模板需要一直重新构建，这时候不如采用 SSR，保持新鲜度。
    
*   外投页面对于接口请求的依赖十分弱。
    

根据这三点判断外投软广十分符合 SSG 的技术体系，可以节约**第一次服务端拉取数据的时间**，其实这部分的时间，反正也是生成 HTML，返回给客户端。其实在运营投出广告之前，模板已经构建完成了，而在构建的时候就直接生成好了所谓的**静态外投模板页面。这种方式其实就做 SSG (静态生成)。**

看下面这张图或许你就能明白 SSG 和 SSR 的区别：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6X6JWEEmcA279d4YsAa7mNHQvjsvRyzlybKCsacWMcMgjYFB0b8E2Pg/640?wx_fmt=png&from=appmsg)

从图中能明显看出来 **HTML** **是在构建的时候生成的，而不是在访问这个 HTML，服务器在****动态****生成**。这就是两者之间的差距。所以对于第一次访问的，可以看下面这张图：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62bE9dvC1jslhqZ6TibqHnfPK2rEg0bYibFsgy5Wz4ZiaQIYVmU6hKjDKGQ/640?wx_fmt=png&from=appmsg)

SSG 等待服务响应的时间是明显低于 SSR 的。看下面视频就可以明显感觉到差距。

[视频详情](javascript:;)

### **SSG 和 SPA 预渲染骨架的区别在哪里？**

### SPA 预渲染骨架：是指在服务端对 CSR 页面进行预先渲染，在页面启动时直接返回已经渲染好的 HTML 文件给客户端，避免了客户端一开始加载页面就要进行 JavaScript 的解析和运行，这样能够提升页面的访问速度和用户体验。预渲染技术使用工具（如 Puppeteer）对 CSR 网页进行自动化爬取、渲染、生成 HTML 文件的操作。

从生成的内容来说都是 HTML，这一点没什么区别。但是从投放的业务来说，我们要静态化的页面较多，所以我们需要一个专门的服务帮我们根据模板 ID 生成各种静态 HTML。

**在静态资源更新上**，假设这么一个场景，线上预渲染的 HTML 有问题我们需要更新，如果 1-2 个页面没啥问题，我们可以重新构建一下，更新 HTML 缓存，如果有几千或者是上万个，SPA 预渲染估计也不太适合。而且频繁的发版、构建对于线上的稳定性也是一个不小的挑战。

**在增量更新上**，SPA 预渲染骨架是没法支持的，目前社区的一些插件实现原理都类似，都是根据特定 SPA 指定的路由通过 WebPack 或者是 Vite 去进行预构建然后生成对应的 HTML，还需要在 nginx 上配置特定路由转发， 不然走 index.html 不够纯粹，这一点也 pass 掉。

基于上面的一些原因，选择了 Next 去做 SSG 框架支持。生态完善又可以持续更新，可以简化一部分开发工作。

### **那么 SSG 就没有什么缺点吗？**

优点的话不用多说，相比 SSR，因为不需要服务端运行时进行数据拉取，TTFB/FCP 等都会提前。

在实际过程中还遇到下面几个问题：

*   针对模板更新的时候，如何去进行静态页面缓存更新？
    
*   对于没有静态生成的页面，我们还能访问吗？
    

针对上述问题**我们在****技术方案****里引入** **ISR** **(增量静态生成)。**

如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6uC4mIytRYG9jR0YM9rxAo7NgPMKtOlpSuo1aWWicAqNFga9lKicM6aibw/640?wx_fmt=png&from=appmsg)

ISR 是 SSG 的升级版，解决 SSG 内容变更的问题。

ISR 依旧会在构建时预渲染页面，但是这里多出了一个`服务端运行时`，运行时会按照一定的过期 / 刷新策略 (通常会使用 **stale-while-revalidate** ) 来重新生成页面。

关于这部分内容，本篇文章不做详细介绍，只是引出关键概念，看到这里如果觉得写的不错的，可以给作者点个赞哟！

**三**

**页面性能优化**

其实光做 SSG 在页面体感上其实已经可以达到比之前的快了，但是光做这个是不够的。因为在 CDN 有缓存的情况下，SSG 和 SSR 的 HTML 都缓存在 CDN 上，这里的话其实两者区别不是特别大。  

========================================================================================================

关于性能优化市面上有很多文章，这里不做过多叙述，**本篇文章只针对得物外投广告业务，探索符合外投广告优化的性能最佳实践。**

**自定义文档行为**

自定义文档行为，主要是修改 next.js 默认的文档行为，只需要在页面新增一个_document.tsx  _app.tsx 如下图所示：  

-------------------------------------------------------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6icPBK36njIMJqMicia8WUicDb1yMvKYLBtReGwHzuhiaoGs5yeCxS1vV6qA/640?wx_fmt=png&from=appmsg)

**CSS 内联**

这里我们做的第一个行为就是 CSS 内联  通过继承 Head 组件，重对应的子方法。

```
class InlineStylesHead extends Head {
  getScripts(files: any) {
    return null
  }

  getPolyfillScripts(): JSX.Element[] {
    return this.context.buildManifest.polyfillFiles.map((file) => {
      return <script defer={true} noModule src={`${ASSETPREFIX[SENV]}/_next/${encodeURI(file)}`}></script>
    })
  }

  getCssLinks(files: any) {
    const cssFiles = files.allFiles.filter((f) => f.endsWith('.css'))
    return this.__getInlineStyles(cssFiles)
  }
  __getInlineStyles(files: string[]) {
    const { assetPrefix } = this.context
    if (!files || files.length === 0) return null
    return files
      .filter((file) => /\.css$/.test(file))
      .map((file) => (
        <style
          key={file}
          data-href={`${assetPrefix}/_next/${file}`}
          dangerouslySetInnerHTML={{
            __html: readFileSync(join(process.cwd(), '.next', file), 'utf-8'),
          }}
        />
      ))
  }
}
#因为doucment 文件是在 node 侧执行的， 所以当生成静态的html 的时候， 这个时候静态资源 webpack 打包已经生成好了， 我可以通过读写文件名，找到对应的文件内容。如图所示：build 的时候，这里的值会内联首屏需要的css，不在首屏的css 不会内联进去。
```

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62NXM0nEt8N7N2s7C3XPaNmI2CDETsDzYwenEOF21heiaDbhe8ACsULhw/640?wx_fmt=png&from=appmsg)

**背景大图优化**

这里的话由于背景图是默认静态生成的时候已经是内联了，这时候是没有 Webp 的，如果通过 React State 去控制背景图的 Webp 展示的话，会导致页面闪一下，用户体验不好，但我们又想优化背景图的体积，于是我们在自定义 Doucument 里面加了一个原生 Dom 操作如图所示，支持 Webp 的优化成 Webp，不支持的优化成 jpeg 格式。

```
<script
          dangerouslySetInnerHTML={{
            __html: `
          var el = document.getElementById('nineRoot');
          if(el) {
            if(window.isSupportWebp) {
              el.style.backgroundImage = 'url(${global.nineImg || defaultUrl}?x-oss-process=image/format,webp)';
            } else {
              el.style.backgroundImage = 'url(${global.nineImg || defaultUrl}?x-oss-process=image/format,jpeg)';
            }
          }
        `,
          }}
        />
```

```
[{"libraryName": "antd","libraryDirectory": "lib",   // default: lib"style": true},{"libraryName": "antd-mobile"},]
```

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6U3k9wUDhj1IvRUz38YPj4R21qNvTgGw5mIMyVWJhic40fNdD2rubClg/640?wx_fmt=png&from=appmsg)

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia67TuRc00TyKvrYqVX83mtXaXicINhoO7XkkUkZibnMz1eNnby3EUXlsTA/640?wx_fmt=png&from=appmsg)

足足差了 100KB 左右。

**打包优化**

**SWC**

Nezha 是采用 Next 12 版本系列，我们新的轻量级落地页采用 Next 13，有一个很重要的特点使用了 SWC 而不是 Babel。

我们选择使用 SWC 进行开发有以下几个原因：

*   可扩展性：使用 SWC 可以作为 Next.js 中的 Crate，而不必分叉库或绕过设计限制。
    
*   性能：通过切换到 SWC，我们在 Next.js 中实现了大约 3 倍更快的快速刷新和 5 倍更快的构建速度，还有更多的优化空间正在进行中。
    
*   WebAssembly：Rust 对 WASM 的支持对于支持所有可能的平台并将 Next.js 开发带到任何地方至关重要。
    
*   社区：Rust 的社区和生态系统是惊人的，而且还在不断壮大。
    
*   这里还有一个很重要的原因就是后续我们会新增 ISR，也就是服务端不存在的静态模板 ID 资源的时候，我们通过接口触发 Node 层进行构建，构建的速度越快，用户等待的时间也越少。所以更换语法转换还是有很有必要的，对于后期 ISR 是非常有必要的。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6rZ2GQlnZl7fjVkLYw4bukB1trhBtnAEK22082DUgYJK2SNDz5GwkOg/640?wx_fmt=png&from=appmsg)

具体了解 SWC 可以看这个网站：https://swc.rs/

**组件库按需加载**

Babel 情况下的按需构建我们都是通过安装 babel-plugin-import 通过如下配置：

```
transpilePackages: ['antd-mobile'],
  modularizeImports: {
    'antd-mobile': {
      transform: 'antd-mobile/es/{{ lowerCase member}}',
    },
  },
```

但是新版本已经内置了这种能力。

可以在 next.config.js 中这样配置，具体的详细配置可以看这个链接：https://nextjs.org/docs/architecture/nextjs-compiler#modularize-imports

```
import dynamic from 'next/dynamic'

const DynamicDetainmentPopup = dynamic(() => import('./detainmentPopup'), {
  loading: () => <div></div>,
  ssr: false,
})
const DynamicToufangBanner = dynamic(() => import('./toufangBanner'), {
  loading: () => <div></div>,
  ssr: false,
})
#next/dynamic 是 React.lazy() 和 Suspense 的组合， 其实就是组件懒加载， ssr 为true 表示是服务端渲染  为false 的话表示是客户端渲染， 打包后的路径区别在于  服务端渲染的话也就是ssr 为true 打包生成的chunks 会在 server  目录下，客户端渲染的 打包后的chunk 在 static 目录下  。
```

**首屏资源动态化**

```
config.output.publicPath = CDN_MAP[process.env.APP_ENV] ||  '//h5static.dewu.com/h5-launch-ssr/'
```

*   抽取外投模板通用的组件，比如投放 Banner 五要素、唤端组件。
    
*   不在首屏资源的组件，延迟加载。
    

抽取了动态组件，Webpack 打包的时候，对于动态组件相关的资源会打包到一起，不会打包到主 JS 里面，可以很好地提高 CDN 缓存利用率，防止因为一些简单的改动，影响整个 JS 的 Hash。

这里用到了 **next/dynamic ，具体的链接可以看这个：** **https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#nextdynamic**

```
"@dw/postcss-webp": "0.1.2"
```

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6ibty8YogicvicO6OvFenvicQa22WgAebfg5zvaVPWx2B8mWLhx6kebgCbQ/640?wx_fmt=png&from=appmsg)

但是无论是那种方式，我们线上最终访问的资源都是在 OSS 上的。

所以我们需要在 Webpack 配置下 PublicPath：

```
config.optimization.splitChunks.cacheGroups.dw =  {
          name: `@dw`,
          test: testPackageName('@dw'),
          priority: 500,
          enforce: true, 
        }
        config.optimization.splitChunks.cacheGroups.du =  {
          name: `@du`,
          test: testPackageName('@du'),
          priority: 500,
          enforce: true, 
        }
        config.optimization.splitChunks.cacheGroups.growth =  {
          name: `@growth`,
          test: testPackageName('@growth'),
          priority: 400,
          enforce: true, 
        }

        config.optimization.splitChunks.cacheGroups.className =  {
          name: `classnames`,
          test: testPackageName('classnames'),
          priority: 400,
          enforce: true, 
        }
      }
```

通过上面这个步骤首屏资源**减少几十 KB。**

**图片资源优化**

重写 Postcss-Webp 插件，重写的背景原因是由于之前的 OSS 域名改造，静态资源都会更新成 H5static.dewucdn.com。  

----------------------------------------------------------------------------

造成部分图片资源没有应用到 Webp 所以这里重新梳理了这块逻辑，重新封装了。

```
// 如果神策实例 已经加载了 call-app 这里不需要加载
  if (window.sensorsDataAnalytic201505) {
    sensors = window.sensorsDataAnalytic201505;
    return;
  }
```

**Http2.0 下更优雅的拆包**

https://webpack.docschina.org/plugins/split-chunks-plugin/  

-------------------------------------------------------------

*   针对 `node_modules` 资源：
    

*   可以将 `node_modules` 模块打包成单独文件 (通过 `cacheGroups` 实现)，防止业务代码的变更影响 NPM 包缓存，同时建议通过 `maxSize` 设定阈值，防止 Vendor 包体过大。
    
*   由于我们的资源有专门的静态加速域名且支持 Http2.0，这里将每一个 NPM 包都打包成单独文件。
    

*   针对业务代码：
    

*   设置 `common` 分组，通过 `minChunks` 配置项将使用率较高的资源合并为 Common 资源。
    
*   首屏用不上的代码，尽量以异步方式引入，这里上面 Dynamic 已经做了拆包。
    
*   设置 `optimization.runtimeChunk` 为 `T``rue`，将运行时代码拆分为独立资源，这里 Next 也已经内置了。
    

所以我们的一个优化策略就是将 @du @growth 的 NPM 包进行拆分。

```
config.optimization.splitChunks.cacheGroups.dw =  {
          name: `@dw`,
          test: testPackageName('@dw'),
          priority: 500,
          enforce: true, 
        }
        config.optimization.splitChunks.cacheGroups.du =  {
          name: `@du`,
          test: testPackageName('@du'),
          priority: 500,
          enforce: true, 
        }
        config.optimization.splitChunks.cacheGroups.growth =  {
          name: `@growth`,
          test: testPackageName('@growth'),
          priority: 400,
          enforce: true, 
        }
        config.optimization.splitChunks.cacheGroups.className =  {
          name: `classnames`,
          test: testPackageName('classnames'),
          priority: 400,
          enforce: true, 
        }
      }
```

**第三方包体积优化**

```
神策埋点优化：神策实例包体积重复加载优化，减少神策包加载体积 25KB+。
```

由于唤端 App 和落地页都会进行埋点上报，原有的逻辑是 Call-App 内部也会再去加载神策埋点 JS，但是在外投落地页展示的时候其实已经加载过，导致神策包体积重复加载。

代码如下：

*   统一请求库：统一去掉 Axios 统一用 Fetch 去做请求，减少了 JS 体积 20KB+。保持项目请求库技术栈统一，这里不需要担心 Fetch 的兼容性问题，Next 13 默认做了 Fecth 的 JS 垫片。
    

**四**

**上线前的准备**

新版落地页上线前，我们做了一轮产品内测，一个是开发视角，以表单问卷的方式进行了做了内测问题收集。  

===================================================

一共收集了如下几个问题：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62R9DDASmgCzXdNoVhNVMGoJsLbIkBXFWeKIrseE09avk17nuAojYyXA/640?wx_fmt=png&from=appmsg)

其中运营侧有一个很强烈的需求，就是强烈要求新版落地转盘速度变快，觉得用户的耐心值比较低，本身就是广告了，点进去运转的慢的话，用户会直接流失。

[视频详情](javascript:;)

**五**

**得物页面级别的灰度 AB**

轻量版本的落地页做出来了，贸然去投外投广告本身是不合适的。所以这里针对同一个外投软广链接，去做 AB 测试，**排除用户的群体、包括投放的策略、以及****达人****的量级等等这些外在因素的影响，去分析 AB 情况下的新版和老版的性能指标。我们验证了新的轻量落地页，无论是在业务还是性能上都有显著提升，那么我们肯定需要大规模灰度，对于线上已经投放的广告，如何进行无缝灰度？针对这一点，运营对我们****前端****提出的要求很简单，由于线上已经创建了大量的广告计划，运营不可能手动一个个去改链接，工作量很大。所以核心点就是在不改线上链接的前提下，线上用户访问的是我们的新的落地页资源。**

**六**

**全量的灰度收益**

通过 ES 灰度验证后，实验效果显著。推全后优化软广外投页面九宫格模板日均 xx 万 PV (占据整个外投的 xx% 的流量)，提高外投模板性能 40pp 左右，提高广告转化率 2pp 左右。
================================================================================================

**性能前后对比**

推全之前的外投性能 FCP 平均在 30%，推全之后稳定在 70%，提高了 40pp 左右。  

-------------------------------------------------

**业务前后对比**

推全之前近一个月的数据平均值，九宫格的 CVR 在 50+**，**辅助参考指标：**真实唤端成功率平均值在 19+。**  

----------------------------------------------------------------

推全之后的数据：CVR 和真实唤端成功率**均显著正向，预计提高 CVR 转换 2pp 左右。**

**七**

**灰度方案**

在谈技术方案之前先普及以下概念。  

===================

**条件源站**

默认的话 CDN 回源只有一个源站，比如 CND-A.com 当回源的时候会直接回源到 A.com。如果你想 CDN-A.com 要回源到 B.com ，那就需要在 CDN 域名管理的 控制配置如下图所示：  

----------------------------------------------------------------------------------------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6zqZTLqaZU5Ns91IpVR0U7VxrR2ZE2n4ZeFcLBuYr7Oib7zyHXsDNb1w/640?wx_fmt=png&from=appmsg)

结合具体的规则引擎配置比如我们配置的是参数中含有 _launch_ 就会回源到 B.dewu.com。

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62SOQwHU0Ja77Ze7ice2GicHVcujbZodNCclbEXiar0czgNBpfjUwF8icQKg/640?wx_fmt=png&from=appmsg)

**八**

**ES**

目前条件源站配置好了，线上的所有 CDN-A.com 的链接如何**自动的大批量都加上 _launch_ 参数呢**？那就需要 ES 登场了。

边缘脚本（EdgeScript，简称 ES）。CDN 节点网关会根据你在控制台上设置的标准配置、边缘脚本规则对请求进行处理。ES 规则的执行位置可以是请求处理开始或者请求处理结尾。所以 ES 的执行配置，可以在请求前，也可以在请求后。这里的配置顺讯会决定条件源站和 ES 的应用顺讯。如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6m9tEgLNceXIMjq08QhDYqNknTHvibffpa9DhYHYcpCMK7eeW3vhnmFw/640?wx_fmt=png&from=appmsg)

结合上面的图，整体的流程已经很明显了，客户端请求先回到 ES ，ES 里面我们会写下灰度匹配脚本。

代码这里就不放了，感兴趣的可以去阿里云 ES 脚本去学习一下。

大体的意思就是匹配 URL 含有某些会场 ID，匹配上了加上 **&_launch_=1&esab=1 这两个参数。**

然后在经过条件源站，就可以回源到我们新的轻量落地页了。这里解释一下参数上加 Esab 其实主要是一个锁，防止请求在 ES 死循环。

**rand_hit(20)** 是 ES 语法提供的随机函数，可以进行站外简单的 AB 分流，也就是线上的链接是有概率进入 ES 并且触发条件源站回源。 这里做的比较简单，其实还可以配上 Cooike，达到命中过灰度了，就一直是灰度的链接。站外软广这里不存在登录态，和产品们讨论，问题不是很大。

**架构图**

普及前面的概念，直接捋一下灰度的流程图如下：  

-------------------------

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BbeVaX7Ap6et4dk5pOeNia6PKxXTA1MqQn7Qx43KeicFeOwt9TOskM1HNoqicHy4QVPK4p5qSwdsqeg/640?wx_fmt=png&from=appmsg)

流程图上有一块兜底的考虑：万一有配错的会场，回源到 B.com ，我们会进行反向代理，会直接代理到 A.com 确保会场的正确显示。

**九**

**灰度节奏**

*   白名单生产测试，ES 脚本匹配 ID 符合上面 7 个模板 ID，然后再加一个**白名单测试参数，**先真实广告测试唤端对应的场景是否正确。
    
*   白名单测试完毕之后，去掉白名单测试参数之后 **ES** **分设备进行****灰度****，**先 iOS 后再安卓（iOS 的流量比安卓的小 ）还是先预发验证，预发验证结束在应用生产正式的 ES。
    
*   这里灰度的会场 ID 还是逐步灰度观察数据，每一次灰度的会场 ID 都是先 iOS 再安卓进行测试，避免小流量发现不了问题。
    

**十**

**灰度时间安排**

测试完毕后：  

=========

*   **DAY1 上午 10** 点 **i****OS** **灰度百分比 50%。DAY2 早上灰度当前模板，****安卓** **10 点。**
    
*   DAY4 上午 10 点 **i****OS** **灰度 10% ，观察 2 小时有问题随时切走。 DAY4 晚上 9 点灰度 30% 。**DAY5 上午 10 点灰度安卓 10%，晚上 9 点灰度 30%。
    
*   Day 6 上午 10 点 iOS 灰度 10%，**观察 2 小时有问题随时切走。**DAY6 晚上 9 点灰度 30%。DAY7 上午 10 点灰度安卓 10%，晚上 9 点 **灰度安卓 30%。**
    

推全的灰度安排就是上面所有会场 ID 不分渠道进行灰度按照 10% 20% 50%  65% 80% 100% 逐渐切入。

**十一**

**稳定性**

敬畏生产。对于一个比较大的技术项目，稳定性的监控十分重要。我们业务的核心指标：**唤端成功率，拉****新激活****率，JS** **异常。**
=========================================================================

我们做了下面这几件事：

*   SLS 监控告警监控实时唤端成功率，有没有出现同比大幅度下跌。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62uaG35ianAYBnhibebibNnS2gUAVicShiaOxkhcyLuibubH307ccFClmsbziaQ/640?wx_fmt=png&from=appmsg)

*   代理失败兜底监控。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62pHglhYsMxL1qV0mVxuO6Np1gicmsjygjOBIicwiaCDqNoibKY9xe0EwCGQ/640?wx_fmt=png&from=appmsg)

*   拉新大盘监控。
    
*   Error 监控报错。
    

![](https://mmbiz.qpic.cn/mmbiz_png/AAQtmjCc74BjatpQbZE7iaWkpc9KrIib62cSttXxxAlicC9RQpLcKv69cujtXQb8QWBDzjJ3S9xlULicibJcseSNRwQ/640?wx_fmt=png&from=appmsg)

**十二**

**总结**

本篇文章详细介绍了得物外投业务前端侧应用的一些技术实践，我们还在持续不断地迭代和优化，后续有机会给大家分享商品流外投页面的优化策略，以及软广编辑器相关技术方案。欢迎大家关注得物技术公众号。  

=================================================================================================

**往期回顾**

[1. 订单视角看支付｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247517571&idx=1&sn=f0a08b64dd74a5a63e7ba1d6d5538828&chksm=c161d0dcf61659ca800f81309265890395360171e9bd252cc24d21a8ef3a2a4654ba7ed0a1ca&scene=21#wechat_redirect)  
[2. 大语言模型系列—预训练数据集及其清洗框架｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247516888&idx=1&sn=0791c8ddd5a52eb80621be51f2fcb597&chksm=c161d787f6165e91c482917ea834312df9c5623cc38ce544966c718c4ad85cdc45b54dec2353&scene=21#wechat_redirect)  
[3. 得物云原生容器技术探索与落地实践](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247515433&idx=1&sn=4fde2df9567b2960f5188f393bdee986&chksm=c161e876f6166160447bd76f194e88d9e9d9e06749e77160624dc4755bc3913696aa10874842&scene=21#wechat_redirect)  
[4. Jedis 连接池究竟是何物｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247515332&idx=1&sn=47cc21c6f438506675f6f3e8570435d3&chksm=c161e99bf616608d60c2509fa1b3cd7f4556583fafee5e4c7639b1345e47cc008aafdf29f850&scene=21#wechat_redirect)  
[5. 粗排优化探讨｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247515205&idx=1&sn=50366473591f18a4dc1add1f0f65330d&chksm=c161e91af616600cd6ce0b1417cab478e5ad34f7117a07d933e9c775d664b27c9a4006152804&scene=21#wechat_redirect)  
[6. 一口气看完 43 个关于 ElasticSearch 的使用建议｜得物技术](http://mp.weixin.qq.com/s?__biz=MzkxNTE3ODU0NA==&mid=2247514795&idx=1&sn=efcb63beff870b954ff954af9b4a7af3&chksm=c161eff4f61666e208e77ec6f2ebf69c81d6800cf3a04015a3fc0c1c6ccbe004e4906372486d&scene=21#wechat_redirect)  

* 文 / Fly

关注得物技术，每周一、三、五更新技术干货  
要是觉得文章对你有帮助的话，欢迎评论转发点赞~  
未经得物技术许可严禁转载，否则依法追究法律责任。

“

**扫码添加小助手微信**

如有任何疑问，或想要了解更多技术资讯，请添加小助手微信：

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/AAQtmjCc74CAGS6PldJufoMwZe4UZ1IwmaXQ5n9mkpElaPtrunYoYgbIB7sib5m1qD2jfErd5MZ449jicmLWqTZg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)