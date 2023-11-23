> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/-RFYdIXbDfsSW5b8IplV1A)

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/dy9CXeZLlCUFFopBAEClLBZUCnoTj5dibLb5t3ffKf9Cb8pj5OUjibEpCKJpZMUcPicqejMzyrl94FQL60NTAx9iaQ/640?wx_fmt=jpeg)

前言

最近在使用 `Vite4.0` 构建一个中型前端项目的过程中，遇到了一些坑，也做了一些项目在构建生产环境时的优化，在这里做一个记录，以便后期查阅。(完整配置在后面)

项目优化前
-----

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrk2ToXCxiabgSvnibvMcx31BTTfTaWnnbZibQMbpVEvZhTpFIW5woaKhKteea3ynZUHYOLFIECMtsZPA/640?wx_fmt=jpeg)image.png

上面是 dist 文件夹的截图，里面的内容已经有 30mb 了，是时候该做点什么了。

分析
--

想要实现优化，首先我得先知道，是什么占了这么大的空间。是图片？是库？还是其他静态资源？

1.  将文件分门别类，js，css 这些资源目录分别打包到对应的文件夹下
    
    ```
    js复制代码build: {    rollupOptions: {      output: {        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称        assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等      }    }}
    ```
    
2.  查看项目的依赖，找出大块头
    

> rollup-plugin-visualizer 是一个打包体积分析插件，对应 webpack 中的`webpack-bundle-analyzer`。配置好后运行构建命令会生成一个`stats.html`。

```
bash复制代码npm i rollup-plugin-visualizer -Djs复制代码import { visualizer } from 'rollup-plugin-visualizer'js复制代码plugins: [    visualizer({open: true})]arduino复制代码npm run build // 打包结束后会出现下图
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrk2ToXCxiabgSvnibvMcx31BTaxf5rIhOHCZLylqOicgKb531Bhw8AkCr1VpPd4B1VT3ZcS2XeMv8OhQ/640?wx_fmt=jpeg)image.png

从体积能看到，这里已经达到了 7MB 大小了，是时候该做点什么了。

优化
--

### 拆分包

> 这里有一个自己的个人见解：如果不同模块使用的插件基本相同那就尽可能打包在同一个文件中，减少 http 请求，如果不同模块使用不同插件明显，那就分成不同模块打包。这是一个矛盾体。这里使用的是最小化拆分包。如果是前者可以直接选择返回'vendor'。

```
scss
复制代码rollupOptions: {
  output: {
    manualChunks(id) {
      if (id.includes("node_modules")) {
        // 让每个插件都打包成独立的文件
        return id .toString() .split("node_modules/")[1] .split("/")[0] .toString(); 
      }
    }
  }
}
```

### 去除 debugger

```
bash复制代码npm i terser -Djs复制代码terserOptions: {  compress: {    drop_console: true,    drop_debugger: true  }}
```

### CDN 加速

内容分发网络（Content Delivery Network，简称 CDN）就是让用户从最近的服务器请求资源，提升网络请求的响应速度。同时减少应用打包出来的包体积，利用浏览器缓存，不会变动的文件长期缓存。(不建议使用第三方 cdn，这里做学习讨论使用)

```
bash复制代码npm i rollup-plugin-external-globals -Dnpm i vite-plugin-html -Dhtml复制代码<head>    <%- vuescript %></head>css复制代码import { createHtmlPlugin } from 'vite-plugin-html'rollupOptions: {  // 告诉打包工具 在external配置的 都是外部依赖项  不需要打包  external: ['vue'],  plugins: [    externalGlobals({      // "在项目中引入的变量名称"："CDN包导出的名称，一般在CDN包中都是可见的"      vue: 'Vue'    })  ]}plugins: [    createHtmlPlugin({      minify: true,      inject: {        data: {          vuescript: '<script src="https://cdn.jsdelivr.net/npm/vue@3.2.37"></script>'        }      }    })]
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrk2ToXCxiabgSvnibvMcx31BTVne7D6XBP81o7YFWSibZVVdqibjz5rUdUJNreJaXyLWqaDrHHtSU2lHA/640?wx_fmt=jpeg)image.png

### 按需导入

仔细看上面那张图右下部分的模块，不知道你会不会感觉到奇怪，明明是同一个包，为什么既出现了 lodash 又出现了 lodash-es。其实 lodash-es 是 lodash 的 es modules 版本 ，是着具备 ES6 模块化的版本，体积小，而 lodash 是 common.js 版本。lodash 最大的缺陷就是无法按需导入。

```
js复制代码import _ from 'lodash-es'; // 你将会把整个lodash的库引入到项目import { cloneDeep } from 'lodash-es'; // 你将会把引入cloneDeep引入到项目
```

项目中用到 lodash 的地方也不多，经过手动修改一下，看现在已经看不到 lodash 的库了。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrk2ToXCxiabgSvnibvMcx31BT7EYu4rN67zskA77WvO81SfuzeIXNbg8X8hl32uaibKhUfzvGnKqlomg/640?wx_fmt=jpeg)image.png

### 文件压缩

```
复制代码npm install vite-plugin-compression -Djs复制代码// build.rollupOptions.plugins[]viteCompression({  verbose: true, // 是否在控制台中输出压缩结果  disable: false,  threshold: 10240, // 如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反  algorithm: 'gzip', // 压缩算法，可选['gzip'，' brotliccompress '，'deflate '，'deflateRaw']  ext: '.gz',  deleteOriginFile: true // 源文件压缩后是否删除(我为了看压缩后的效果，先选择了true)})
```

当请求静态资源时，服务端发现请求资源为 gzip 的格式时，应该设置响应头 `content-encoding: gzip` 。因为浏览器解压也需要时间，所以代码体积不是很大的话不建议使用 `gzip` 压缩。

### 图片压缩

```
bash
复制代码yarn add vite-plugin-imagemin -D
```

or

```
bash复制代码npm i vite-plugin-imagemin -Djs复制代码import viteImagemin from 'vite-plugin-imagemin'plugin: [    viteImagemin({      gifsicle: {        optimizationLevel: 7,        interlaced: false      },      optipng: {        optimizationLevel: 7      },      mozjpeg: {        quality: 20      },      pngquant: {        quality: [0.8, 0.9],        speed: 4      },      svgo: {        plugins: [          {            name: 'removeViewBox'          },          {            name: 'removeEmptyAttrs',            active: false          }        ]      }    })]
```

`viteImagemin`在国内比较难安装，容易出现报错，可以尝试一下下面几种解决方案。

#### viteImagemin 报错

1.  使用 yarn 在 package.json 内配置 (推荐) "resolutions": { "bin-wrapper": "npm:bin-wrapper-china" }
    
2.  使用 npm, 在电脑 host 文件加上如下配置即可 199.232.4.133 raw.githubusercontent.com
    
3.  使用 cnpm 安装 (不推荐)
    

填坑
--

### 坑 1

在优化过程中发现有什么 rollupOption 不生效，请检查 vite 版本。上述配置在 vite4.0 版本生效，如需升级，请前往官方迁移文档。

### 坑 2

> Uncaught TypeError: Failed to resolve module specifier "Vue". Relative references must start with either "/", "./", or "../".![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrk2ToXCxiabgSvnibvMcx31BT1ojlkWpFuG7wwDKgtu5aibFmV0x3MdUpWZsicfsvORr8Wkicg1QmJ5RSA/640?wx_fmt=jpeg)

这里有可能是 `vue-demi` 引入了 `vue`，然而 `rollup-plugin-external-globals` 插件配置全局变量时不会处理 `node_modules` 下的依赖项，导致 `vue-demi` 还是通过 `import` 的方式与 `node_modules` 下的 `vue` 进行关联，而没有使用全局变量下的 `vue`，打包后 `vue` 已变成外部依赖项，`vue-demi` 自然无法找到 `vue`，所以就报错了。

而`vue-demi`是哪里来的呢，我的项目是由于`element-plus`引用了`vue-demi`，所以此时解决方案就是将`vue-demi`也用 cdn 引入。

### 总结

到了这一步，整个文件夹已经完全瘦身了。从一开始的 30MB 到现在的 11.8MB 了。我们在项目里面放置了许多 json 数据 (因为业务原因不能上传到服务器)，json 数据已经占了差不多 5、6mb 的原因，所以是一个单纯的项目并没有这么大。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/3JxC1BeqGrk2ToXCxiabgSvnibvMcx31BTswqhjrCApicvuuTEbwicgX14JK38rhOmyPHhZhRP3a3xibjvFZ4H561PA/640?wx_fmt=jpeg)image.png

#### 配置

```
js复制代码// vite.config.jsimport { defineConfig } from 'vite'import { createHtmlPlugin } from 'vite-plugin-html'import viteImagemin from 'vite-plugin-imagemin'import externalGlobals from 'rollup-plugin-external-globals'import { visualizer } from 'rollup-plugin-visualizer'import viteCompression from 'vite-plugin-compression'// https://vitejs.dev/config/export default defineConfig({  plugins: [    visualizer({ open: true }),    // 将下面的添加到plugin下    createHtmlPlugin({      minify: true,      inject: {        data: {          vuescript: '<script src="https://cdn.jsdelivr.net/npm/vue@3.2.25"></script>',          demiScript: '<script src="//cdn.jsdelivr.net/npm/vue-demi@0.13.7"></script>',          elementPlusScript: `            <link href="https://cdn.jsdelivr.net/npm/element-plus@2.2.22/dist/index.min.css" rel="stylesheet">            <script src="https://cdn.jsdelivr.net/npm/element-plus@2.2.22/dist/index.full.min.js"></script>          `,          echartsSciprt: '<script src="https://cdn.jsdelivr.net/npm/echarts@5.0.2/dist/echarts.min.js"></script>'        }      }    }),    viteImagemin({      gifsicle: {        optimizationLevel: 7,        interlaced: false      },      optipng: {        optimizationLevel: 7      },      mozjpeg: {        quality: 20      },      pngquant: {        quality: [0.8, 0.9],        speed: 4      },      svgo: {        plugins: [          {            name: 'removeViewBox'          },          {            name: 'removeEmptyAttrs',            active: false          }        ]      }    })  ],  build: {    target: 'es2020',    minify: 'terser',    // rollup 配置    rollupOptions: {      output: {        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称        assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等        manualChunks(id) {          if (id.includes('node_modules')) {            return 'vendor'          }        }      },      //  告诉打包工具 在external配置的 都是外部依赖项  不需要打包      external: ['vue', 'element-plus', 'echarts'],      plugins: [        externalGlobals({          vue: 'Vue',          'element-plus': 'ElementPlus',          echarts: 'echarts',          'vue-demi': 'VueDemi'        }),        viteCompression({          verbose: true, // 是否在控制台中输出压缩结果          disable: false,          threshold: 10240, // 如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反          algorithm: 'gzip', // 压缩算法，可选['gzip'，' brotliccompress '，'deflate '，'deflateRaw']          ext: '.gz',          deleteOriginFile: false // 源文件压缩后是否删除        })      ]    },    terserOptions: {      compress: {        // 生产环境时移除console        drop_console: true,        drop_debugger: true      }    }  }})
```

> 作者：simple_lau
> 
> 链接：https://juejin.cn/post/7232688124416458789