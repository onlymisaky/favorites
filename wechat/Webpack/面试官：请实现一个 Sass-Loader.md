> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/xx2SeZtga1-8nZ_TLcO52g)

什么是 Loader
----------

一个`loader`可以看做是一个`node`模块，也可以看做一个`loader`就是一个函数 (loader 会导出一个函数)，众所周知`webpack`只能识别`js`文件，`loader`在`webpack`中担任的角色就是翻译工作，它可以让其它非`js`的资源（source）可以在`webpack`中通过`loader`顺利加载。

Loader 的方式

*   单一职责，一个 loader 只做一件事
    
*   调用方式，loader 是从右向左执行，链式调用
    
*   统一原则，loader 输入和输出都字符串
    

来看一下案例

```
module.exports = () => {    return 343}
```

上面这种会报错，我们上面说过`laoder`的方式了，统一原则，输出输入必须是字符串。而我们上面代码则输出是数字，则报错。

> “
> 
> loader 导出尽量别使用箭头函数，loader 内部属性都是靠 this 来获取的，如 this.callback，this.sync
> 
> ”

Webpack 手写 Loader
-----------------

为什么要手写`loader`呢，假如有一些`loader`插件不满足我们的需求时，我们会采用手写`loader`来定制化我们功能。

### 开始

首先新建一个`js`文件

```
module.exports = function(source) {    }
```

*   第一个参数：是当前要处理的内容
    

#### loader 内置的方法

函数里面暴露了一些方法，`this.query`获取`loader`传过来的参数

```
module.exports = function(source) {    console.log(this.query)}
```

当然里面还可以引入一个库，来处理参数，该情况用于有时候我们传给`loader`的参数不是一个对象，可能是一个字符串。

```
module: {    rules: [        {            test: /\.css/,            use: [{                loader: "testLoader",                query: "前端娱乐圈"            }]        }    ]}
```

```
const loaderUtils = require('loader-utils')module.exports = function(source) {    console.log(loaderUtils.getOptions(this))}
```

webpack.config.js

```
module: {    rules: [        {            test: /\.css/,            use: [                "testLoader?            ]        }    ]}
```

可以使用上面`loaderUtils`内置库获取`loader`的参数。

webpack.config.js

```
module: {    rules: [        {            test: /\.css/,            use: [{             loader: "testLoader?,             options: {              name: "前端娱乐圈"             }                          // or                          query: {              name: "前端娱乐圈"             }            }]        }    ]}
```

上面这两种传参形式，如果`options`存在，行内参数拼接则无效。上面还写了一种传参形式，`query`也是可以传参的，那`options`和`query`有什么区别的。这俩没啥区别就是，`query`是`webpack`老版本之前的 (2.5)，`options`是最新支持的方式

#### loader 异步

loader 异步处理，假如说 loader 里面需要处理一些逻辑操作，但这个操作是异步的，那么 loader 就会编译失败，必须使用异步执行方法，来等待结果返回后，loader 则才会执行成功

```
module.exports = function(source) {    setTimeout(() => {        this.callback(1, source)    }, 3000)}
```

官方解释：this.callback 参数

```
this.callback(
  err: Error | null, // 错误信息
  content: string | Buffer, // 最终生成的源码
  sourceMap?: SourceMap, // 对应的sourcemap
  meta?: any // 其他额外的信息
);
```

还有一种方法是 this.async，async 返回值也是一个 callback 所以这俩个是一样的

```
module.exports = function(source) {    const callback = this.async()    setTimeout(() => {        callback(1, source)    }, 3000)}
```

#### Loader 起别名

##### resolveLoader - modules

我们现在手写的 loader 都还是写绝对路径引入进来，那么怎么直接写 loader 名呢，有两种方法，我们来看一下

```
module.exports = {    resolveLoader: {        modules: ["node_modules", "./loaders"]    },    module: {        rules: [            {                test: /\.js/                use: {                 loader: "per-loader"             }            }        ]    }}
```

我们可以看到上面，我们直接写的`per-loader`，我们是配置了解析`loader`路径，会先去`node_modules`里面查找，如果`node_modules`里面没有则会去`loaders`目录下查找。然后我们下面写`loader: per-loader`，注意：这里的`per-loader`就是当前`loader`的文件名

##### resolveLoader - alias

这种方法直接起别名，把路径引入过来就 ok

```
module.exports = {    resolveLoader: {        "per-loader": path.resolve(__dirname, "./loaders/per-loader.js")    },    module: {        rules: [            {                test: /\.js/                use: {                 loader: "per-loader"             }            }        ]    }}
```

#### 实现一个 sass-loader && style-loader

##### sass-loader

首先安装一下`node-sass`插件，用于识别`scss`语法并编译为`css`

```
npm i node-sass
```

新建`sassLoader.js`文件，并引入`node-sass`插件

```
const nodeSass = require("node-sass");const path = require("path")let result = nodeSass.renderSync({    file: path.resolve(__dirname, "../src/scss/index.scss"),    outputStyle: 'expanded',});module.exports = function() {    return result.css.toString()}
```

上面采用`node-sass`官方配置，如异步解析`.scss`文件，上面对象中，`file`为当前要解析的文件地址，`outputStyle`为输出风格包含：`nested`(嵌套)、`expanded`(展开)、`compact`(紧凑，不换行)、`compressed`(压缩)。

导出`result.css.toString`, 这里为什么要`toString`，如果不`toString`的话返回的是一个`Buffer`数据。因为这里的返回值提供给下一个`loader`使用，为了下一个`loader`(style-loader) 更好的使用我们这里直接处理一下。

> “
> 
> 更多 Api 用法请参考 node-sass
> 
> ”

##### style-loader

新建`styleLoader.js`文件

```
module.exports = function(source) {    const style = `        let style = document.createElement("style");        style.innerHTML = ${JSON.stringify(source)};        document.head.appendChild(style) `    return style}
```

上面导出的函数第一参数 (`source`) 就是我们`sassLoader`的返回值，然后在字符串里面写上创建 style 元素逻辑代码，并最终返回。注意这里返回值必须是`字符串`上，刚开始我们就说过了，输入输出都必须是字符串。

##### 完整配置

index.js

```
console.log("前端娱乐圈")import "./scss/index.scss"
```

webpack.config.js

```
const path = require("path");module.exports = {    mode: 'development',    entry: {        main: './src/index.js'    },    output: {        path: path.resolve(__dirname, 'dist'),        filename: '[name].js'    },    resolveLoader: {       alias: {           "sassLoader": path.resolve(__dirname, "./loaders/sassLoader.js"),           "styleLoader": path.resolve(__dirname, "./loaders/styleLoader.js")       }    },    module: {        rules: [            {                test: /\.scss/,                use: ["styleLoader", "sassLoader"]            }        ]    }}
```

上面配置中我们用到了解析`loader`路径配置 (起别名)，loader 是从右到左，从下到上解析执行。先是把`.scss`文件处理成`css`语法，然后在传递给`styleLoader`配置即可。以上一个简单完整的`loader`已实现完毕。如有帮助欢迎点赞 + 分享哦

感谢

谢谢你读完本篇文章，有帮助的话请**❤️关注 + 点赞 + 收藏 + 评论 + 转发❤️**  

*   关注后回复**加我好友**免费领取视频教程
    
      
    
*   欢迎关注`前端巅峰`，更多**「前端开发技巧」**只在公众号推送