> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/n2cOo6CJ_0gWaB4odEhImw)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmMaUkQr7lufFlzwW0e7Nricrvtsibql0Fk5icIxmlor1bEng7O25Z7vq2yQ/640?wx_fmt=other&from=appmsg&randomid=xwja2hxh#imgIndex=0)

*   google 控制台的网络 network 去看首次加载资源请求是否有重复加载的情况
    
*   google 控制台的 performance 来录制首屏加载过程的文件时长以及阻塞情况, 避免一些首次加载无须展示的组件的优化
    
*   * 打包 size 优化,@next/bundle-analyzer 可视化的检查页面和打包的资源大小, 然后针对性去优化
    

```
// next.config.jsconst withBundleAnalyzer = require('@next/bundle-analyzer')({  enabled: process.env.ANALYZE === 'true',})module.exports = withBundleAnalyzer(nextConfig)// .env.development.local 下添加ANALYZE="true"// 运行npm run build 会生成可视化资源大小页面
```

*   选择性能指标检测工具我用的 pagespeed.web.dev/[1] 更好的了解真实用户的体验
    

以上是对性能可视化和测试的工具, 方便针对性优化

#### 首先对图片, css 进行优化

*   提供大小合适的图片可节省移动数据网络流量并缩短加载用时
    
*   图片压缩 squoosh.app/[2] 转化为 webp 格式减小体积
    
*   可以使用 nextui 提供的 Image, 它提供对图片进行不同屏幕的适配尺寸, 以及懒加载功能
    

```
<Image  src={props.mainImage}  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 540px"  width={540}  height={512}  alt={`Feature - ${props.title}`}  quality={IMAGE_QUALITY}/>
```

*   css 使用的 tailwind.css 库内部对 css 做了处理优化, 进行不使用 style 些内嵌样式, 提高编译速度 (首屏不需要的组件可使用 lazy-load 包来做懒加载处理 加快渲染速度)
    
*   减少重排和重绘, 避免布局偏移例如: 动态设置 css 导致的布局偏移, 可以使用占位符来解决或者固定
    

#### 组件进行懒加载

*   按需加载 nextjs 提供了 dynamic 它包含了 React.lazy 和 susponse, 是需要时再去加载 而不是可视区内在加载，适合对子组件进行使用
    

```
import dynamic from "next/dynamic";const FedeInSection = dynamic(() => import('@/components/FedeInSection'));
```

优化例:

通过 @next/bundle-analyzer 观察当前首屏 page 加载的资源

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmMcydIeQE3YEn3VaicOfGWmg5kQSwGd2icDrgcYGguZ06X5AeLONUlB5KA/640?wx_fmt=other&from=appmsg&randomid=motlxfov#imgIndex=2)

通过左侧可以发现当前页面资源总大小为 9.55MB, 对它进行优化

看右侧 Component 组件发现 我首屏一些不需要加载的组件被加载了 settubgs/asset 人声 list 用户登录 formModal

需要通过触发事件加载的组件被加载了, 代码角度去优化它

用户点击 Log In 时再去加载对应展示的组件 就可以避免 从 9.55mb 优化到 6.79mb

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmMXxmnuRy0PKwX1VIdxgxV2MYDBZunGEvvEy3N1IQNyzwll7s0A5Zf7w/640?wx_fmt=other&from=appmsg&randomid=npxrtisn#imgIndex=4)

#### 第三方库包大小的优化

在项目中有对日期时间转换处理的场景用到了 moment 处理 发现它的体积不是我想要的大

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmM3iaiaNVcut2Lpk0oEAc5rXEDjzibDkl0tmW2bM5WClO7McGUdcxV4H0mg/640?wx_fmt=other&from=appmsg&randomid=dj50ciqp#imgIndex=6)

选用轻量级平替的包 dayjs 来处理做优化 代码修改后 将 moment 包删除

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmMTA96CYZfaibWibiaD8UIibmpVl756kHNFhvImJNzlhGxtMEQ6QHeaOwaRw/640?wx_fmt=other&from=appmsg&randomid=6sgqxpb2#imgIndex=8)

结果也是非常可观发现减小特别多的资源

及 loash 第三方库按需引入使用 import pull from "lodash/pull" 避免每次使用将整个库加载

Next.js 提供的 `experimental`可以帮我们对比较大的第三方库进行打包优化

在 next.config.js 下对体积大的

```
module.exports = {  experimental: {  optimizePackageImports: [  'lodash', '@nextui-org/react', 'jszip', 'aws-sdk'],   },};
```

这个选项用来指定应优化导入的包。Next.js 会尝试优化这些包的导入，以减少最终的包大小和提升性能。

#### 组件拆分精量化

将首屏的组件模块进行拆分复用在通过 dynamic 函数加载

#### 第三方脚本工具 script 优化

在性能中检测时发现渲染期间加载了 ffmpeg-core/ffmpeg-core.wasm 脚本

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmMK8AbqGfgwbXia2T5q8mYV7feVJA3eW5k6QzqtfiaNQWUo5YIdagaac8g/640?wx_fmt=other&from=appmsg&randomid=5dykly3h#imgIndex=10)

 发现它的耗时较长, 并且首屏不需要使用 FFmpeg 来处理文件等.... 优化它

在根文件加载脚本时 如果当前时外部页面则不需要此 wasm 不加载它 避免没必要的加载 来优化首次加载速度

```
<head> {!isFrontPage && <link rel ="prefetch"  href="/lib/ffmpeg-core/ffmpeg-core.wasm"  as="fetch"  crossOrigin="anonymous"/>}</head>
```

........... 中间的优化 大多还是针对性对 资源大小 加载时机 进行处理 最终分数 平均在 93 最高一次达到 98 跟网络也有一定关系 欣赏结果把

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHoODHN9gY8X4hia7YLIxJtmMhNRicuTd6bAMUUnZHZJZg3wTJJuhqwiaWCcNibEic8UiaAe70gTdov3qWsw/640?wx_fmt=other&from=appmsg&randomid=5lbubs2h#imgIndex=12)

  

---

作者：先飞的笨鸟
--------

https://juejin.cn/post/7377208894550802441
------------------------------------------