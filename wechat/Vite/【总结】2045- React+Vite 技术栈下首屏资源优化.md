> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/jTlNjwxdr2OMW8cGyoEBwQ?poc_token=HAXqRGaj-jLwN9CzFZat553f0Tj4kPw-qocv7C0s)

文章转载于稀土掘金技术社区——码云之上

前言
==

最近小组做的 H5 应用需要通过 iframe 嵌入到第三方站点里（第三方站点也是 H5 应用，目的是利用第三方应用的流量）。对方老板希望我们站点打开速度能快一点，不要影响到他们的用户体验。为此，专门做了一轮首屏优化。  
谈到 H5 应用的首屏优化，首屏资源体积优化是重中之重。我们的 H5 应用采用的技术栈是 Vite[1] + React[2] + React-Router[3] + Arco-Design[4]，接下来我将详细介绍如何实现首屏资源体积减少这一目标。

问题现状
====

当初为了快速开发，采用的是 Vite 下的 react-ts[5] 模板

```
pnpm create vite h5-app --template react-ts<br style="visibility: visible;">
```

该模板下默认是没有任何优化措施的：

```
import { defineConfig } from 'vite'import react from '@vitejs/plugin-react'// https://vitejs.dev/config/export default defineConfig({  plugins: [react()],})
```

因此构建出来的 js、css 产物都会集中在两个文件中：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUiabbhTicUAE5JsrdJE1xpLbgcUATQKlfkfqBKQRvbrEWXMsZkUtpYEOA/640?wx_fmt=other&from=appmsg)

  

通过 rollup-plugin-visualizer[6] 插件可以直观查看到依赖包所占的体积：

```
import { defineConfig } from 'vite'import react from '@vitejs/plugin-react'import visualizer from 'rollup-plugin-visualizer';// https://vitejs.dev/config/export default defineConfig({  plugins: [react(), visualizer()],})
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUOT0AdtpXfbNM0qLQ6Lq71DcznYTqibNLdrfu6XPz3dx1mm5MBSH8UQQ/640?wx_fmt=other&from=appmsg)

通过图可以看到 `lodash`，`echarts`，`vconsole`，`arco-design`这些依赖包的打包体积占比很大。

> 当然`vconsole`是不需要关注的，因为生产环境打包不会囊括进去，上图体现的是测试环境构建产物体积盒图。

优化措施
====

通过上面的分析，可以发现当前构建包存在部分依赖产物体积过大、首屏资源没有懒加载的问题。接下来就是针对这两个问题进行优化。

构建产物按需加载
--------

按需加载是为了减少依赖产物体积过大的问题，典型的如 `lodash`、`echarts`、`arco-design`，整个包存在很多方法、组件，而在项目实际使用到的其实只有一部分。在构建时进行按需加载，可以有效减小最终产物体积。

> echarts 的按需加载官方提供了解决方案，本文直接采用了官方推荐的方法 [7]
> 
> ```
> // 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。import * as echarts from 'echarts/core';// 引入柱状图图表，图表后缀都为 Chartimport { BarChart } from 'echarts/charts';// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Componentimport { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent} from 'echarts/components';// 标签自动布局、全局过渡动画等特性import { LabelLayout, UniversalTransition } from 'echarts/features';// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步import { CanvasRenderer } from 'echarts/renderers';// 注册必须的组件echarts.use([ TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, BarChart, LabelLayout, UniversalTransition, CanvasRenderer]);export default echarts;
> ```

对于`lodash`、`arco-design`库，需要借助一个`vite`插件 vite-plugin-imp[8]。该插件的原理是在构建阶段将如：

```
import { forEach } from 'lodash'
```

的导入写法改为：

```
import forEach from 'lodash/forEach'
```

如此就能实现依赖的按需加载。这个插件目前支持了主流的工具库和组件库：

> *   antd-mobile[9]
>     
> *   antd[10]
>     
> *   ant-design-vue[11]
>     
> *   @arco-design/web-react[12]
>     
> *   @arco-design/web-vue[13]
>     
> *   element-plus[14]
>     
> *   element-ui[15]
>     
> *   lodash[16]
>     
> *   underscore[17]
>     
> *   vant[18]
>     
> *   view ui[19]
>     
> *   vuetify[20]
>     

### @arco-design/mobile-react 的按需加载

通过查看`vite-plugin-imp`的文档，结合`@arco-design/mobile-react`库的目录结构，可以得到如下配置：

```
{   libName: '@arco-design/mobile-react',// npm包的名称   libDirectory: 'esm',// 组件所在目录   // 一些文档引入的是less样式文件，其实arco-design也提供了css样式文件，可以省去安装less的步骤   style: name => [      `@arco-design/mobile-react/esm/${name}/style/css/index.css`,   ],},
```

上面的配置里，`libName`是包名，`libDirectory`则需要去`node_modules`里查看包的目录结构，确定具体组件所在的包名，`style`是组件的样式文件，需要一并引入，这里也需要结合组件的目录来配置：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUp7SEtQ5Hdv70U7n7JQibfZxFTGXYDWKbDLMM0onA8Ekce36zxOrINqQ/640?wx_fmt=other&from=appmsg)

  

### lodash 的按需加载

同样的，参考对`@arco-design/mobile-react`的配置，可以得到`lodash`的按需加载配置：

```
{    libName: 'lodash',    libDirectory: '',    camel2DashComponentName: false,},
```

因为`lodash`下的二级文件直接放在根目录下，所以`libDirectory`设置为`''`，表示无需增加二级路径。  
`lodash`下的工具函数采用的是 low camelcase[21] 命名法，因此`camel2DashComponentName`设置为`false`。

通过上述按需加载措施，构建产物里的`@arco-design/mobile-react`和`lodash`体积减少了很多：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUufxE8qzfwXe70evnQcp3JD87arFnJn6GS3iaLmibMOibEr2fgicM7COhibw/640?wx_fmt=other&from=appmsg)vite - 按需加载后体积盒图. png

具体的包体积数据如下表：

<table><thead><tr><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">依赖包</th><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">按需加载前</th><th data-style="line-height: 1.5em; letter-spacing: 0em; text-align: left; background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(240, 240, 240); width: auto; height: auto; border-top-width: 1px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px; min-width: 85px;">按需加载后</th></tr></thead><tbody><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(255, 255, 255); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;"><code>@arco-design/mobile-react</code></td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">543.7KB</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;"><strong data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: auto; height: auto; border-style: none; border-width: 3px; border-color: rgba(0, 0, 0, 0.4); border-radius: 0px;">160.78KB</strong></td></tr><tr data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgb(248, 248, 248); width: auto; height: auto;"><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;"><code>lodash</code></td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;">547.05KB</td><td data-style="min-width: 85px; border-color: rgba(204, 204, 204, 0.4); border-radius: 0px;"><strong data-style="background: none 0% 0% / auto no-repeat scroll padding-box border-box rgba(0, 0, 0, 0); width: auto; height: auto; border-style: none; border-width: 3px; border-color: rgba(0, 0, 0, 0.4); border-radius: 0px;">78.23KB</strong></td></tr></tbody></table>

构建出来的`js`产物体积也降低了不少：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUcqzicOJc5woFJRvl30Ywalrt0icrJS7IDh72SvicicpGib80SIUzGkA147Q/640?wx_fmt=other&from=appmsg)

  

路由懒加载
-----

经过按需加载优化，总的包体积下降了一些，但是因为所有产物集中在一个包里，等于访问首屏就需要加载全量的 js、css 脚本，这是没有必要的。完全可以按照路由对产物进行分割，以此减少首屏体积。  
对于`React`框架实现路由懒加载的方式有很多，本文借助了 @loadable/component[22] 这个库。

```
// 之前的代码（示例）// import Page1 from '@/pages/page1';// import Page2 from '@/pages/page2';// import Page3 from '@/pages/page3';// import Page4 from '@/pages/page4';// import Page5 from '@/pages/page5';// 采用路由懒加载后的代码import loadable from '@loadable/component';const Page1 = loadable(() => import('@/pages/page1'));const Page2 = loadable(() => import('@/pages/page2'));const Page3 = loadable(() => import('@/pages/page3'));const Page4 = loadable(() => import('@/pages/page4'));const Page5 = loadable(() => import('@/pages/page5'));
```

看一下路由懒加载后构建产物吧：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUcqzicOJc5woFJRvl30Ywalrt0icrJS7IDh72SvicicpGib80SIUzGkA147Q/640?wx_fmt=other&from=appmsg)

  

可以发现之前整体的`index-[hash].js`、`index-[hash].css`被拆分成了很多小文件，这便是路由懒加载的能力，将产物按路由进行分割。

代码二次分割
------

你以为这样就结束了吗？  
no!!!  
还可以继续分割。分析一下，既然路由做了懒加载，那么那些在非首页才用到的依赖是不是可以单独分割为一个`chunk`呢，这样的话可以进一步减少`index-[hash].js`的体积。说干就干，翻阅`Vite`官方文档，看到这样一段描述：

> 你可以通过配置 `build.rollupOptions.output.manualChunks` 来自定义 chunk 分割策略（查看 Rollup 相应文档 [23]）。

再看看 Rollup 的文档，找到关于 chunk 分割的配置 output.manualChunks[24]：

> `{ [chunkAlias: string]: string[] } | ((id: string, {getModuleInfo, getModuleIds}) => string | void)`
> 
> 该选项允许你创建自定义的公共 chunk。当值为对象形式时，每个属性代表一个 chunk，其中包含列出的模块及其所有依赖，除非他们已经在其他 chunk 中，否则将会是模块图（module graph）的一部分。chunk 的名称由对象属性的键决定。

结合项目自身的特性，决定对`echarts`、`react-markdown`进行单独拆分（因为这样依赖在首页没有用到）。`vite.config.ts`中的配置如下：

```
build: {  outDir: 'build',  target: 'chrome87',  cssTarget: 'chrome61',  chunkSizeWarningLimit: 650,  rollupOptions: {    output: {      manualChunks: {        echarts: ['echarts'],        markdown: ['react-markdown', 'remark-gfm'],      },      experimentalMinChunkSize: 100 * 1024,    },  },},
```

再来看看构建产物：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUwXCJTSzUibGmN8oTuMfVQQguPZzbCsx61x7NLoD1KUqPIpVy7efQBww/640?wx_fmt=other&from=appmsg)

  

可以发现独立出来了`markdown-[hash].js`,`echarts-[hash].js`两个独立的 chunk。

优化效果
====

做了这么多的优化，最终效果如何呢？  
先看下未优化前的首屏资源体积及加载耗时：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNU9gOWdU0I6leG4xm0lkv4DpU5Ubbx2Hmh76qCicrpFz6OFpCPmTSrLzg/640?wx_fmt=other&from=appmsg)

优化之后的加载耗时：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/IlE1Y2rl1uZhibPtGj481FIqRgiaVUlkNUMgFPqvNNWy1db2j9kAxjDoklKHV52TIKEr07o8E5T6VIqZ6ibDt1crw/640?wx_fmt=other&from=appmsg)

总加载资源体积减少约 **50%** ，加载速度提升约 **40%** 。  
嗯嗯，效果基本达预期 ^_^。

小结
==

1.  首屏资源优化应该先分析问题所在，识别出哪些包体积过大；
    
2.  代码分割需要配合路由懒加载才能达到效果，否则即使代码进行了分割，但加载首屏还是会因为路由提前注册的原因，使得浏览器加载所有资源。
    
3.  优化也有成本，比如文本中虽然通过代码分割 + 路由懒加载减少了首屏资源体积，但随之也带来了资源请求数增加的问题，对浏览器的并发请求带来了压力。
    

附录
==

完整的`vite.config.ts`配置代码:

```
import { defineConfig } from 'vite';import react from '@vitejs/plugin-react';import visualizer from 'rollup-plugin-visualizer';import vitePluginImp from 'vite-plugin-imp';// https://vitejs.dev/config/export default defineConfig({  base: '/',  build: {    outDir: 'build',    target: 'chrome87',    cssTarget: 'chrome61',    chunkSizeWarningLimit: 650,    rollupOptions: {       output: {         manualChunks: {           echarts: ['echarts'],           markdown: ['react-markdown', 'remark-gfm'],         },       },     },  },  plugins: [    react(),    visualizer(),    vitePluginImp({       libList: [         {           libName: '@arco-design/mobile-react',           libDirectory: 'esm',           style: name => [             `@arco-design/mobile-react/esm/${name}/style/css/index.css`,           ],         },         {           libName: 'lodash',           libDirectory: '',           camel2DashComponentName: false,         },       ],     }),  ],})
```