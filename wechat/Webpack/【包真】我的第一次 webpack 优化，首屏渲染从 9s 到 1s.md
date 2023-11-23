> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/tTIW2yr-ZBOZRjvjT_NFuQ)

大厂技术  高级前端  Node 进阶  

======================

点击上方 全栈前端精选，关注公众号  

回复 1，加入高级前端交流群

本文基于`vue2(虽然vue3已出，但是本文也很实用)`

谈到 webpack 优化大部分人可能都看腻了，无非就那几招嘛，我之前也是看过许多类似的文章，但都没有自己真正上手过，下面是我用公司的项目真实操练下来的，首屏加载速度提升很大（刷刷的），希望能帮到你。

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8EN9FsIcZuicKscSfjqxXZ1sxhJpy6Ny5wCPo1DAN8JrtpA9bjk5bhGA/640?wx_fmt=jpeg)

废话不多说，先看看对比成果！

<table data-style="color: rgb(63, 63, 63);"><thead><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><th data-style="padding: 6px 13px; border-top-width: 1px; border-color: rgb(223, 226, 229); font-size: 14px;">类型</th><th data-style="padding: 6px 13px; border-top-width: 1px; border-color: rgb(223, 226, 229); font-size: 14px;">优化前</th><th width="40" data-style="padding: 6px 13px; border-top-width: 1px; border-color: rgb(223, 226, 229); font-size: 14px;">优化后</th></tr></thead><tbody><tr data-style="border-top: 1px solid rgb(198, 203, 209);"><td data-style="padding: 6px 13px; border-color: rgb(223, 226, 229); font-size: 14px;">js 文件大小</td><td data-style="padding: 6px 13px; border-color: rgb(223, 226, 229); font-size: 14px;">24MB</td><td width="89.33333333333333" data-style="padding: 6px 13px; border-color: rgb(223, 226, 229); font-size: 14px;">3MB</td></tr><tr data-style="border-top: 1px solid rgb(198, 203, 209); background-color: rgb(246, 248, 250);"><td data-style="padding: 6px 13px; border-color: rgb(223, 226, 229); font-size: 14px;">主页首屏显示</td><td data-style="padding: 6px 13px; border-color: rgb(223, 226, 229); font-size: 14px;">9s</td><td width="40" data-style="padding: 6px 13px; border-color: rgb(223, 226, 229); font-size: 14px;">1s</td></tr></tbody></table>

这简直太夸张了，提升了 8 倍？可以想象以前是多慢，要等半天啊。**蛮王**这个真男人都开大 2 次了~

可以看到，优化前后首屏加载速度有质的提升，之前一直想优化我们项目的首屏加载时间，有缓存还好，没有缓存屏幕白屏都要等待 7、8s。特别是有的客户第一次打开这个系统，那 7、8 秒犹如过了一个世纪，非常尴尬。那么我做了哪些常规操作呢?

### 1. 生产环境关闭`productionSourceMap`、`css sourceMap`

众所周知，`SourceMap`就是当页面出现某些错误，能够定位到具体的某一行代码，`SourceMap`就是帮你建立这个映射关系的，方便代码调试。在生产环境中我们完全没必要开启这个功能（**谁在生产环境调试代码？不会是你吧**）  
如下配置：

```
const isProduction = process.env.NODE_ENV === 'production' // 判断是否是生产环境 module.exports = {       productionSourceMap: !isProduction, //关闭生产环境下的SourceMap映射文件   css: {             sourceMap: !isProduction, // css sourceMap 配置     loaderOptions: {                 ...其它代码            }       },       ...其它代码 }
```

此时再`npm run build` 打包，就会发现速度快了很多，体积瞬间只有几兆了！

### 2. 分析大文件，找出内鬼

安装 `npm install webpack-bundle-analyzer -D` 插件，打包后会生产一个本地服务，清楚的展示打包文件的包含关系和大小。

`vue.config.js` 配置：

```
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin  module.exports = {        ...其它        configureWebpack: [            plugins: [                   new BundleAnalyzerPlugin() // 分析打包大小使用默认配置            ]      },   ...其它 }
```

自动弹出一个服务，清晰的展示打包后 js 的文件大小：

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8AkiaFqbrtrS5AKFMe2jkIYckf9j27RlEL4DLcL6yA6kY6TpFwwgpoOg/640?wx_fmt=jpeg)

通过图中可以发现：

1.  element-ui 和 ant-design 占了近 1/4 的大小：`1.53MB`。
    
2.  exceljs 也是个大东西有：`1.3MB`
    
3.  echarts.js 文件也接近`1MB`
    
4.  moment.js 也有`700KB`
    

打包后 js 文件一共就 5MB，这五个哥们就占了 4M 左右。不分析好还，一分析吓得够呛~  
不要虚！找到刺了，一个一个来拔掉就好了。相信我拔掉的过程是很爽的。

### 一个一个解决，拔刺

把必须要用的第三方 js 通过 cdn 的方式引用  
分析发现，`elementui、echarts`是必须使用的，打包又耗时且页面加载也较慢得很。可以通过`cdn`直接引入，方便且速度快。  
`element-ui`是我们项目用的主要框架，所以这个肯定是少不了，但是项目里面`ant-design`为什么会存在呢，原来是发现有个页面使用了`antd`的进度条组件，因为`elementui`的进度条不太好看。但是没想到这样把整个`antd`都导进来了。  
方案：

1.  舍弃`antd`组件，自己去找一个类似的`vue`插件或者干脆自己实现一个。（这个方法短时间无法完成，且不想去动以前代码，暂不考虑）
    
2.  使用`antd`部分加载。只加载想要的进度条组件，可以减少文件体积（这个方法简单粗暴，就是牺牲一些文件大小）。
    

我们使用方案 **2**，根据 antd 官方的文档配置部分组件的引入。

安装 `npm install babel-plugin-import -D`

1. `main.js`导入需要的组件 `Step`

```
import { Steps } from 'ant-design-vue'; 
Vue.component(Steps.name, Steps); 
Vue.component(Steps.Step.name, Steps.Step);
```

2. `babel.config.js` 加上配置：

```
module.exports = {  
    presets: [  '@vue/cli-plugin-babel/preset'   ],   
    //以下是按需加载的配置++++ 
    plugins: [     
     [       
      "import",       
      {         
          libraryName: "ant-design-vue",        
          libraryDirectory: "es",         
          style: true       
      }     
     ]   
    ] 
}
```

此时再分析，`antd`已经小了很多。

### 2. 使用 cdn 加载第三方 js。

我们项目里面第三方`js`很多，有些打包下来会很大，而且加载速度较慢。我们把这些 js 分离出来，通过`cdn`的方式在`html`中的`script`标签中直接使用，一方面减少打包体积，一方面提高了加载速度。

这里推荐一个免费的`cdn`: **BootCDN**。也可以使用自己购买的付费`cdn`服务，我们到网站搜索自己项目需要的`js`。例如：`vue`

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8MmsptXgFKFBCr20kaf3rYsDiazJ6LYTXR6AaAcpS6RfRickxicssEnKQg/640?wx_fmt=jpeg)

注意，一定要选择自己项目对应的版本，否则会出现各种奇怪的问题

我的项目使用的是 `"vue": "^2.6.12",` **（package.json）**

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC82v5PjKrrSZLuCHeP143I79ogIT9tibZf6Siaibn9VOOFBR4sXia1zsZhlg/640?wx_fmt=jpeg)

**第一步：配置`vue.config.js`，让`webpack`不打包这些 js，而是通过`script`标签加入。**

```
const isProduction = process.env.NODE_ENV === 'production' // 判断是否是生产环境
//正式环境不打包公共js
let externals = {}
//储存cdn的文件
let cdn = {
    css: [
        'https://cdn.bootcdn.net/ajax/libs/element-ui/2.15.0/theme-chalk/index.min.css' // element-ui css 样式表
    ],
    js: []
}
//正式环境才需要
if (isProduction) {
    externals = { //排除打包的js
        vue: 'Vue',
        'element-ui': 'ELEMENT',
        echarts: 'echarts',
    }
    cdn.js = [
        'https://cdn.bootcdn.net/ajax/libs/vue/2.6.11/vue.min.js', // vuejs
        'https://cdn.bootcdn.net/ajax/libs/element-ui/2.6.0/index.js', // element-ui js
        'https://cdn.bootcdn.net/ajax/libs/element-ui/2.6.0/locale/zh-CN.min.js',
        'https://cdn.bootcdn.net/ajax/libs/echarts/5.1.2/echarts.min.js',
    ]
}
module.exports = {
//...其它配置
configureWebpack: {
        //常用的公共js 排除掉，不打包 而是在index添加cdn，
        externals, 
        //...其它配置
    },
chainWebpack: config => {
        //...其它配置  
        // 注入cdn变量 (打包时会执行)
        config.plugin('html').tap(args => {
            args[0].cdn = cdn // 配置cdn给插件
            return args
        })
    }
//...其它配置     
}
```

**第二步：html 模板中加入定义好的 cdn 变量使用的代码**

```
<!DOCTYPE html><html lang=""><head><meta charset="utf-8">    <meta http-equiv="X-UA-Compatible" content="IE=edge">    <meta >    <!-- 引入样式 -->    <% for(var css of htmlWebpackPlugin.options.cdn.css) { %>       <link rel="stylesheet" href="<%=css%>" >    <% } %>    <!-- 引入JS -->    <% for(var js of htmlWebpackPlugin.options.cdn.js) { %>       <script src="<%=js%>"></script>    <% } %></head><body style="font-size:14px">    <section id="app"></section></body></html>
```

可以发现`cdn.js`中，我把`vue、echarts、element-ui`这三个大头加入了。在`externals`对象中左侧是`npm`包的名称，右侧是在代码中暴露的全局变量。注意`element-ui`对应的是 `ELEMENT`。

没有`ant-design-vue`是因为我们上面使用了部分加载的方式，如果使用`cdn`这种方式是加载全部的代码，有点浪费。

没有使用`exclejs`，是因为`exceljs`在我的业务代码中不是直接引用的，而是一个叫`table2excel`间接依赖的。所以就算我通过上面的方法排除掉它，在打包的时候还是会通过`table2excel`的依赖找到它并打包。  
那这种不可避免的情况，该如何优化，让加载速度不受影响呢？

答案是通过**懒加载**的方式：

*   1.script 标签中注释掉 import Table2Excel from "table2excel.js";
    
*   2. 下载的方法中：download(){
    

```
1.script标签中注释掉 import Table2Excel from "table2excel.js";2.下载的方法中：download(){    //使用import().then()方式    import("table2excel.js").then((Table2Excel) => {        new Table2Excel.default("#table").export('filename') //多了一层default     })}
```

这样在进入系统时，不会加载`Table2Excel` 和`exceljs`，当需要时才会去加载，第一次会慢一点，后面就不需要加载了，会变快。

*   3 moment.js 的优化
    

我们发现`monentjs`在项目中有使用来对时间格式化，但是使用频率并不高，完全可以自己实现一个`format`方法，或者使用只有`6kb`的`day.js`.

但这里我们暂不替换，把`moment`变得瘦小一些即可，**删除掉除中文以外的语言包**。  
第一步：`**vue.config.js**`

```
...其它配置 chainWebpack: config => {     config.plugin('ignore')        //忽略/moment/locale下的所有文件     .use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)) }...其它配置
```

第二步：`main.js`

```
import moment from 'moment' //手动引入所需要的语言包 import 'moment/locale/zh-cn'; // 指定使用的语言 moment.locale('zh-cn');
```

这次我们看看`moment`打包后多大：

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC87m7wQpsLFy5JzfpscPHue6yNWM8yZickm41J7DIWc5ofSIbJZRy6eRg/640?wx_fmt=jpeg)

只有`174kb`了。不过，有一说一还是`day.js`香~  
做完上面这些动作我们的 js 文件总大小：`3.04MB` ，其中包含 `1.3MB`的懒加载 js，剩下的`1.7MB`左右的 js 基本上不会对页面造成很大的卡顿。

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8SkW6H9Iru9nicF5EicDwNtUa0SaCDhPM4OQAmBXJlu7gzcicAAr9ulTWA/640?wx_fmt=jpeg)

还有进步空间？  
1. 通过 `compression-webpack-plugin` 插件把代码压缩为 gzip。**但是！需要服务器支持**  
`webpack`端 `vue.config.js`配置如下：

```
//打包压缩静态文件插件const CompressionPlugin = require("compression-webpack-plugin")//...其它配置module.exports = {    //...其它配置    chainWebpack: config => {        //生产环境开启js\css压缩        if (isProduction) {            config.plugin('compressionPlugin').use(new CompressionPlugin({                test: /\.(js)$/, // 匹配文件名                threshold: 10240, // 对超过10k的数据压缩                minRatio: 0.8,                deleteOriginalAssets: true // 删除源文件            }))        }    }    //...其它配置}
```

打包大小由`3MB`到`860KB`，感觉起飞了~

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8q8ACBBaDayQ5IllR7DxiakNEBRBcich9ByOhTIzSmvUvFhTGpOH4BUeQ/640?wx_fmt=jpeg)

服务器端配置这里就不详细说明了可以谷百：**nginx 开启静态压缩** 找到答案。  
最后贴上优化前后的无缓存下的首屏加载时间对比（chrome 浏览器），绝对包真：  
**优化前项目网站首屏加载数据：9.17s**

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8rI9sH1byZa0zib8tXMKYVND3BedqyezMdcYDkWXXSHqWXa7G1oUKxHQ/640?wx_fmt=jpeg)

**优化后项目网站首屏加载数据：1.24s**

![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8cVEgqmibmvIILvz8oI0ookaKI45bK7gVNBCd0bOiaanFzZbyiaBZWFyRQ/640?wx_fmt=jpeg)![](https://mmbiz.qpic.cn/mmbiz_jpg/YBFV3Da0NwvZS8RZqF1iaF7aiaa7kvxhC8RWDC202MXORXX5dw7SbZz68oIWsShzIqUT8NibK7EtpN1szu82fZTxQ/640?wx_fmt=jpeg)

这些都是在工作之余，自己抽时间去查阅各位大佬的帖子，虽然都是些耍烂了的技术，但是真的要在自己项目中实施还是需要一些时间和精力，大多数都是为了完成功能快速迭代而忽略掉了做程序原本的目的，就是要让用户有一个良好的使用体验。

作者：猫小白

原文：https://zhuanlan.zhihu.com/p/476712416

```
前端 社群








下方加 Nealyang 好友回复「 加群」即可。







如果你觉得这篇内容对你有帮助，我想请你帮我2个小忙：


1. 点个「在看」，让更多人也能看到这篇文章



点赞和在看就是最大的支持

```