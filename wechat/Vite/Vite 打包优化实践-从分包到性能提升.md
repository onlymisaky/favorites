> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/TBAAIWnl4lTdLzBgtwIjQg)

```
前言随着前端应用功能的增加，项目的打包体积也会不断膨胀，影响加载速度和用户体验。本文介绍了几种常见的打包优化策略，通过Vite和相关插件，帮助减少项目体积、提升性能，优化加载速度。rollup-plugin-visualizerrollup-plugin-visualizer插件，是一个可视化工具，以图表的形式，展示打包结果的模块构成与体积分布。安装：pnpm add rollup-plugin-visualizer -D用法：// vite.config.tsimport { visualizer } from "rollup-plugin-visualizer";module.exports = {  plugins: [visualizer()],};pnpm build 一下, 打开生成的stats.html文件。
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrwZY9S2Mcde696lPoYU6Xlpt3gFr910wjK26pzp5xjAq9Adpia23G43wOJyrxibkcGdgBfJezs7Bzg/640?wx_fmt=other&from=appmsg#imgIndex=0)

`xlsx` 、`html2canvas`、`jspdf`，这 3 个第三方库占了主要部分。

分包策略
----

在项目中，`xlsx`、`html2canvas`、`jspdf`，只在对应功能模块中使用，可以单独打包出来，用户使用对应功能，才会下载对应 js 脚本。

在`rollupOptions`选项的 `manualChunks`函数中控制分包逻辑，并配合 `experimentalMinChunkSize` 属性，阀值设置为 20 KB，模块大小，大于 20kb 的才会单独打包成 chunk。

```
pnpm add rollup-plugin-visualizer -D
```

build 一下，查看控制台信息。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrwZY9S2Mcde696lPoYU6Xl0lTWHErSgpeKANXjFsPBjJgDT6sT9bX1rbBybsG2PFslKY4CV3hgEw/640?wx_fmt=other&from=appmsg#imgIndex=2)

成功的将这 3 个第三方库单独打包成

`chunk`，`vite`默认会把所有静态资源都打包到`assets`文件夹，配置`chunkFileNames`、`entryFileNames`、`assetFileNames`将静态资源分类。

```
// vite.config.tsimport { visualizer } from "rollup-plugin-visualizer";module.exports = {  plugins: [visualizer()],};
```

build 一下，打包后到结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrwZY9S2Mcde696lPoYU6XlsoVVAG3jMvdR7LqotFpCMTmx2kqbjY2dZmxHNwWksPDpQV1PaP5GFw/640?wx_fmt=other&from=appmsg#imgIndex=3)

减少包体积
-----

### vite-plugin-remove-console 移除 consele

**安装：**

```
rollupOptions: {  experimentalLogSideEffects: true,output: {    experimentalMinChunkSize: 20 * 1024,    manualChunks: (id: string) => {      if (id.includes('html2canvas')) {        return'html2canvas';      }      if (id.includes('jspdf')) {        return'jspdf';      }      if (id.includes('xlsx')) {        return'xlsx';      }    }  }}
```

**用法:**

```
chunkFileNames: 'static/js/[name]-[hash].js', // 代码分割后文件名 entryFileNames: 'static/js/[name]-[hash:6].js', // 入口文件名  assetFileNames: 'static/[ext]/[name]-[hash].[ext]' // 静态资源文件名
```

### vite-plugin-compression 压缩代码

`vite-plugin-compression`插件压缩代码成`gzip`格式或者`br`格式，ngixn 开启 gizp，http 缓存策略。

**安装:**

```
pnpm add vite-plugin-remove-console -D
```

**配置说明**

<table><caption><section><br></section></caption><thead><tr><th><section>参数</section></th><th><section>类型</section></th><th><section>默认值</section></th><th><section>说明</section></th></tr></thead><tbody><tr><td><section>verbose</section></td><td><code>boolean</code></td><td><code>true</code></td><td><section>是否在控制台输出压缩结果</section></td></tr><tr><td><section>filter</section></td><td><code>RegExp or (file: string) =&gt; boolean</code></td><td><code>DefaultFilter</code></td><td><section>指定哪些资源不压缩</section></td></tr><tr><td><section>disable</section></td><td><code>boolean</code></td><td><code>false</code></td><td><section>是否禁用</section></td></tr><tr><td><section>threshold</section></td><td><code>number</code></td><td><section>-</section></td><td><section>体积大于 threshold 才会被压缩, 单位 b</section></td></tr><tr><td><section>algorithm</section></td><td><code>string</code></td><td><code>gzip</code></td><td><section>压缩算法, 可选 ['gzip' , 'brotliCompress' ,'deflate' , 'deflateRaw']</section></td></tr><tr><td><section>ext</section></td><td><code>string</code></td><td><code>.gz</code></td><td><section>生成的压缩包后缀</section></td></tr><tr><td><section>compressionOptions</section></td><td><code>object</code></td><td><section>-</section></td><td><section>对应的压缩算法的参数</section></td></tr><tr><td><section>deleteOriginFile</section></td><td><code>boolean</code></td><td><section>-</section></td><td><section>压缩后是否删除源文件</section></td></tr></tbody></table>

**用法:**

```
// vite.config.tsimport { defineConfig } from "vite";import vue from "@vitejs/plugin-vue";import removeConsole from "vite-plugin-remove-console";// https://vitejs.dev/config/export default defineConfig({  plugins: [vue(), removeConsole()]});
```

build 一下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrwZY9S2Mcde696lPoYU6XlZjAwUtDmkjwwZcVFbWCiaMXIIo8ibQZy6EacAGTnE29IQAzrRSYzU5Bg/640?wx_fmt=other&from=appmsg#imgIndex=4)

修改压缩算法，打包成 br 格式：

```
pnpm add vite-plugin-compression -D
```

打包结果：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/H8M5QJDxMHrwZY9S2Mcde696lPoYU6Xl8elGyr0eXBCiaW9OO5YdBP3ZnHNOS2WZQ6waqdpuiayfCs75qJafbD6A/640?wx_fmt=other&from=appmsg#imgIndex=6)

  

br 格式，明显比 gzip 格式还小。

### 外链 CDN

如果条件允许外链接 CDN，那么使用`rollup-plugin-external-globals` 插件将外部依赖映射为全局变量，避免将其打包进最终文件，减小文件体积。配合`vite-plugin-html` 自动注入代码到 HTML 文件中。

**安装：**

```
import viteCompression from 'vite-plugin-compression';export default () => {  return {    plugins: [       viteCompression({        threshold: 1024 * 20,         algorithm: 'gzip',        ext: '.gz'      })]  };};
```

**用法**：

```
import viteCompression from 'vite-plugin-compression';export default () => {  return {    plugins: [       viteCompression({        threshold: 1024 * 20,         algorithm: 'brotliCompress',        ext: '.br'      })]  };};
```

在`index.html`中使用 CDN 脚本：

```
pnpm add vite-plugin-html rollup-plugin-external-globals -D
```

**对比效果：**

优化前：1.7MB

优化后：899KB

总结
--

1.  **可视化分析**：使用 `rollup-plugin-visualizer` 直观查看打包后的模块大小，找出大体积模块进行优化。
    
2.  **分包策略**：通过 `manualChunks` 将大依赖库分离到单独的 chunk，减少首屏加载资源。
    
3.  **去除无用 console**：利用 `vite-plugin-remove-console` 删除开发环境中的 console，减少打包体积。
    
4.  **代码压缩**：通过 `vite-plugin-compression` 压缩代码为 `gzip` 或 `brotli` 格式，减小文件大小。
    
5.  **外链 CDN**：使用 `rollup-plugin-external-globals` 和 `vite-plugin-html` 将常用库通过 CDN 加载，避免将它们打包到最终文件。
    

这些优化策略成功将打包体积从 1.7MB 减少到 899KB，提升了应用性能。

作者：code_leon
------------

https://juejin.cn/post/7480534286514749459