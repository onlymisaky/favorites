> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/vxSACpxkHqXFmHBNefut9g)

作为一名前端开发，我们通常会用像 Webpack 这样的构建工具来打包我们的代码。Webpack 功能强大，提供了所有必要的特性。但是，如果有一个替代品能够执行类似的工作，但构建时间更快呢？

最近，我花了一些时间阅读 Rspack 的官方文档。它的低设置成本、对 Webpack 用户的用户友好界面以及更快的构建时间都非常吸引我。

利用一个相对空闲的工作期，我将 Rspack 应用到我们公司的项目中，结果相当令人印象深刻。在这篇文章中，我想分享我们项目的前端架构，并比较 Rspack 和 Webpack 之间的构建速度，希望这篇文章对某人有所帮助。

太长不看（TL;DR）：如果你正在使用带有自定义配置的 Webpack，你应该尝试用 Rspack 替换它，这会节省你大量的等待时间。

### 我的工作项目的 Webpack 配置

在我们比较 Rspack 和 Webpack 之间的性能之前，让我先展示一下我们如何配置 Webpack 来构建 CSS 和 JavaScript 文件。

这是我们项目的 `webpack.config.js`：

```
const path = require("path");const glob = require("glob");const toObject = require("./scripts/toObject");const { VueLoaderPlugin } = require("vue-loader");const MiniCssExtractPlugin = require("mini-css-extract-plugin");const { CleanWebpackPlugin } = require("clean-webpack-plugin");const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");module.exports = (env, options) => {  const jsSetting = {    mode: "production",    entry: {      index: path.resolve(__dirname, "src/js/entry/index.js"),    },    output: {      path: path.resolve(__dirname, "apps/statics/dist/"),      filename: "js/[name].js",    },    target: ["web", "es5"],    module: {      rules: [        {          test: /.m?js$/,          include: path.resolve(__dirname, "src"),          exclude: /(node_modules|bower_components)/,          use: [            {              loader: "babel-loader",              options: {                plugins: ["@babel/plugin-transform-runtime"],              },            },          ],        },        {          test: /.vue$/,          use: ["vue-loader"],        },        {          test: /.s?css$/i,          use: ["vue-style-loader", "css-loader", "sass-loader"],        },        {          test: /\.(png|jpe?g|gif|svg)$/i,          use: [            {              loader: "url-loader",              options: {                name: "[path][name].[ext]",                context: "src",                fallback: require.resolve("file-loader"),                limit: 8192,              },            },          ],        },        {          test: /\.(woff|woff2|eot|ttf|otf|)$/,          use: [            {              loader: "file-loader",              options: {                name: "[path][name].[ext]",                context: "src",              },            },          ],        },      ],    },    plugins: [      new VueLoaderPlugin(),      new MiniCssExtractPlugin({        filename: "style/[name].css",      }),      new CleanWebpackPlugin({ verbose: true }),    ],    resolve: {      alias: {        src: path.resolve(__dirname, "src/"),        apps: path.resolve(__dirname, "apps/"),      },    },    externals: {      vue: "Vue",      axios: "axios",      jquery: "jQuery",    },  },  const cssSetting = {    mode: "production",    entry: {      ...toObject(glob.sync("apps/statics/scss/*/.scss")),    },    output: {      path: path.resolve(__dirname, ""),    },    module: {      rules: [        {          test: /.s?css$/i,          use: [            MiniCssExtractPlugin.loader,            {              loader: "css-loader",              options: { url: false },            },            "postcss-loader",            {              loader: "sass-loader",              options: {                implementation: require("sass"),                sassOptions: {                  outputStyle: "expanded",                },              },            },          ],        },      ],    },    plugins: [new FixStyleOnlyEntriesPlugin(), new MiniCssExtractPlugin({})],    resolve: {      alias: {        src: path.resolve(__dirname, "src/"),        apps: path.resolve(__dirname, "apps/"),      },    },  },  if (options.mode == "development") {    jsSetting.devtool = "eval-source-map";  }  return [cssSetting, jsSetting];};
```

为了简化内容，我已经移除了大部分的 entry 文件，并仅保留了说明所需的必要部分。

在我们的项目中，我们首先构建 CSS，然后是 JavaScript。对于 css 文件，我们使用了一个名为 glob 的库来检测所有的. scss 文件。toObject 是一个自定义函数，用于生成如下的键值对：

```
{  "apps/statics/scss/index": "apps/statics/scss/index.scss",  // ...}
```

所以基本上，这些就是我们项目所需的内容：

*   构建 Vue SFC 文件
    
*   从 SCSS 文件构建 CSS 文件
    
*   构建 JavaScript 文件
    

让我们看看我们如何配置 Rspack 设置。

### 我的 Rspack 设置

这是我的 `rspack.config.js`：

```
const path = require("path");const glob = require("glob");const toObject = require("./scripts/toObject");const { VueLoaderPlugin } = require("vue-loader");const { CleanWebpackPlugin } = require("clean-webpack-plugin");const PreventOutputJSPlugin = require("./scripts/PreventOutputJSPlugin");module.exports = (env, options) => {  const isProd = options.mode === "production";  const cssSetting = {    mode: "development",    context: __dirname,    devtool: false,    entry: {      ...toObject(glob.sync("apps/statics/scss/**/*.scss")),    },    output: {      path: path.resolve(__dirname, ""),    },    module: {      rules: [        {          test: /\\.scss$/,          use: ["postcss-loader", "sass-loader"],          type: "css",        },      ],    },    plugins: [new PreventOutputJSPlugin()],    resolve: {      alias: {        src: path.resolve(__dirname, "src/"),        apps: path.resolve(__dirname, "apps/"),      },    },    optimization: {      minimize: false,    },  };  const jsSetting = {    context: __dirname,    devtool: false,    entry: {      index: path.resolve(__dirname, "src/js/entry/index.js"),    },    output: {      path: path.resolve(__dirname, "apps/statics/dist/"),      filename: "js/[name].js",    },    target: ["web", "es5"],    module: {      rules: [        {          test: /\\.vue$/,          loader: "vue-loader",          options: {            experimentalInlineMatchResource: true,          },        },        {          test: /\\.scss$/,          use: [            {              loader: "style-loader",              options: { esModule: false },            },            "css-loader",            "postcss-loader",            "sass-loader",          ],          type: "javascript/auto",        },        {          test: /\\.css$/,          use: [            {              loader: "style-loader",              options: { esModule: false },            },            "css-loader",          ],          type: "javascript/auto",        },        {          test: /\\.(png|jpe?g|gif|svg)$/i,          type: "asset/inline",        },        {          test: /\\.(woff|woff2|eot|ttf|otf|)$/,          type: "asset/resource",        },      ],    },    plugins: [new VueLoaderPlugin()],    resolve: {      alias: {        src: path.resolve(__dirname, "src/"),        apps: path.resolve(__dirname, "apps/"),        node_modules: path.resolve(__dirname, "node_modules/"),      },    },    externals: {      vue: "Vue",      axios: "axios",      jquery: "jQuery",    },    optimization: {      minimize: isProd,    },  };  if (isProd) {    jsSetting.plugins.push(new CleanWebpackPlugin({ verbose: true }));  }  return [cssSetting, jsSetting];};
```

对于 CSS 文件，我们不需要 css-loader 或 MiniCssExtractPlugin 来构建. scss。

对于 JavaScript 文件，大多数配置与之前相同。

我们的项目大约有 40 个 JavaScript 文件和 90 个 CSS 文件需要构建，让我们看看构建性能：

**Webpack**

*   开始开发服务器：35 秒
    
*   生产构建：42 秒
    
*   开发服务器热构建时间：约 300 毫秒
    

**Rspack**

*   开始开发服务器：15 秒
    
*   生产构建：15 秒
    
*   开发服务器热构建时间：约 170 毫秒
    

如你所见，Rspack 在各种场景下的表现都优于 Webpack。

### 我是否已经用 Rspack 替换了 Webpack？

我真的很想退役 Webpack 以节省我宝贵的时间。然而，在我们的项目中，我们会配置我们的 css-loader 不解析我们 .scss 文件中的 urls：

```
{  loader: 'css-loader',  options: { url: false }}
```

而当前版本的 Rspack（v0.2.9）还不支持这一点。尽管它的构建速度仍然比 Webpack 快得多，但它也会在我们的终端上留下大量错误信息。在与我的团队成员讨论后，我们决定现在不替换它。我已经将其作为功能请求报告给 Rspack 的 Github 问题，并希望这个功能能尽快实现。

结论
--

正如我在开头提到的，与 Webpack 相比，Rspack 在构建 CSS 和 JavaScript 文件方面确实做得很好，而且从 Webpack 迁移过来不会花费太多时间。所以，如果你想减少构建时间，不要犹豫，冲它！

参考来源：https://uu9924079.medium.com/i-tried-replacing-webpack-with-rspack-and-heres-what-i-ve-found-c15579c6e823

* * *

*   我是 ssh，工作 6 年 +，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
    
*   欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2023 陪你一起度过！
    

*   ![](https://mmbiz.qpic.cn/mmbiz_png/iagNW4Zy9CyYB7lXXMibCMPY61fjkytpQrer2wkVcwzAZicenwnLibkfPZfxuWmn0bNTbicadZFXzcOvOFom7h9zeJQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)
    
*     
    

关注公众号，发送消息：

指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。

简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。

面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！