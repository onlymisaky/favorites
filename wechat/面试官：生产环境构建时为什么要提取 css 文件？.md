> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/Bq_qIKjMP6qaWwN2Ca2mwA)

```
module.exports = {
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          }
        ]
      },
    ]
  }
}
```

**前言**
======

面试官: `webpack`生产环境构建时为什么要将`css`文件提取成单独的文件？

> 我：基于性能考虑，如可以进行缓存控制

面试官：还有吗？

> 我：基于可读性考虑，独立的`css`文件更方便代码的阅读与调试

面试官：那你有了解过`css`是怎么提取成单独文件的吗？

> 我：嗯...?

看完本篇之后，希望小伙伴面试的时候碰到这个问题时你的回答是这样的

面试官: `webpack`生产环境构建时为什么要将`css`文件提取成单独的文件？

> 你会这么回答
> 
> *   更好的缓存，当 CSS 和 JS 分开时，浏览器可以缓存 CSS 文件并重复使用，而不必重新加载，也不用因为 js 内容的变化，导致 css 缓存失效
>     
> *   更快的渲染速度，浏览器是同时可以并行加载多个静态资源，当我们将 css 从 js 中抽离出来时，能够加快 js 的加载与解析速度，最终加快页面的渲染速度
>     
> *   更好的代码可读性，独立的`css`文件更方便代码的阅读与调试
>     

面试官: 那你有了解过`css`是怎么提取成单独文件的吗？

> 你会这么回答
> 
> *   有了解过，提取`css`的时候，我们一般会使用`mini-css-extract-plugin`这个库提供的`loader`与`plugin`结合使用，达到提取`css`文件的目的
>     
> *   而`mini-css-extract-plugin`这个插件的原理是
>     
> 
> *   `MiniCssExtractPlugin`插件会先注册`CssModuleFactory`与`CssDependency`
>     
> *   然后在`MiniCssExtractPlugin.loader`使用`child compiler`(`webpack`5.33.2 之后默认使用 importModule 方法) 以`css`文件为入口进行子编译，子编译流程跑完之后，最终会得到`CssDependency`
>     
> *   然后`webpack`会根据模块是否有`dependencies`，继续解析子依赖，当碰到`CssDenpendcy`的时候会先找到`CssModuleFactory`，然后通过`CssModuleFactory.create`创建一个`css module`
>     
> *   当所有模块都处理完之后，会根据`MiniCssExtractPlugin`插件内注册的`renderManifest` `hook` `callback`，将当前`chunk`内所有的`css module`合并到一起，然后`webpack`会根据`manifest`创建`assets`
>     
> *   最终`webpack`会根据`assets`在生成最终的文件
>     

本篇的主要目的不仅是为了面试的时候不被难倒，更是为了通过抽离`css`这个事，来了解`webpack`的构建流程，帮助我们对`webpack`有更深的了解，成为一个更好的`webpack`配置工程师

本篇的主要内容包括

*   `webpack`中样式处理方式
    
*   `webpack`构建流程
    
*   `css`文件提取原理
    

看完之后，你可以学到

*   `webpack`基础的构建流程
    
*   `pitch` `loader`与行内`loader`的使用
    
*   `webpack`插件的编写
    
*   了解`webpack` `child compiler`
    

**如何处理 css**
============

**开发环境**
--------

```
module.exports = {
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          {
-            loader: 'style-loader',
+            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
          }
        ]
      },
    ],
  },
  plugins: [
+    new MiniCssExtractPlugin(
+      {
+        filename: 'css/[name].[contenthash].css',
+        chunkFilename: 'css/[name].[contenthash].css',
+        experimentalUseImportModule: false
+      }
+    )
  ]
}
```

样式先经过`postcss-loader`处理，然后在经过`css-loader`处理，最后在通过`style-loader`处理，以`style`标签的形式插入到`html`中

**生产环境**
--------

```
.wrap {
  color: red;
}
```

将开发环境使用`style-loader`替换成`MinicssExtractPlugin.loader`，并且添加`MinicssExtractPlugin`插件，最终`webpack`构建的结果会包含单独的`css`文件，这是为什么？继续往下看

**css-loader 原理**
=================

在看`mini-css-extract-plugin`插件的作用之前，先简单看下`css-loader`的原理 首先`webpack`是无法处理`css`文件的，只有添加了对应的`loader`比如，`css-loader`。`css`文件经过`loader`处理之后，将`css`转化为`webpack`能够解析的`javascript`才不会报错 比如

```
// 最终css-loader处理后返回的内容
// Imports
import ___CSS_LOADER_API_SOURCEMAP_IMPORT___ from "../node_modules/.pnpm/css-loader@6.7.3_webpack@5.79.0/node_modules/css-loader/dist/runtime/sourceMaps.js";
import ___CSS_LOADER_API_IMPORT___ from "../node_modules/.pnpm/css-loader@6.7.3_webpack@5.79.0/node_modules/css-loader/dist/runtime/api.js";
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(___CSS_LOADER_API_SOURCEMAP_IMPORT___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".wrap {\n  color: red;\n}\n", "",{"version":3,"sources":["webpack://./src/app.css"],"names":[],"mappings":"AAAA;EACE,UAAU;AACZ","sourcesContent":[".wrap {\n  color: red;\n}\n"],"sourceRoot":""}]);
// Exports
export default ___CSS_LOADER_EXPORT___;
```

经过`css-loader`处理后

```
/******/ (function() { // webpackBootstrap
/******/   "use strict";
/******/   var __webpack_modules__ = ({

/***/ 410:
/***/ (function(module, __unused_webpack___webpack_exports__, __webpack_require__) {

/* harmony import */ var _node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(912);
/* harmony import */ var _node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(568);
/* harmony import */ var _node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_pnpm_css_loader_6_7_3_webpack_5_79_0_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".wrap {\n  color: red;\n}\n", "",{"version":3,"sources":["webpack://./src/app.css"],"names":[],"mappings":"AAAA;EACE,UAAU;AACZ","sourcesContent":[".wrap {\n  color: red;\n}\n"],"sourceRoot":""}]);
// Exports
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (___CSS_LOADER_EXPORT___)));
/***/ }),

/***/ 568:
/***/ (function(module) {

module.exports = function (cssWithMappingToString) {};

/***/ }),

/***/ 912:
/***/ (function(module) {
module.exports = function (item) {};

/***/ })

/******/   });

var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/* harmony import */ var _app_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(410);

document.write(1111);
}();
/******/ })()
;
//# sourceMappingURL=app.014afe2d9ceb7dcded8a.js.map
```

从产物我们可以看到

*   `css-loader`会将`css`处理成字符串
    
*   `css`模块经过`css-loader`处理之后，返回的内容变成了一个`js`模块
    

最终`webpack`输出的产物（关闭压缩与 scope hosting）

```
import { foo} from './foo'
```

从上面生成的代码可以看到只经过`css-loader`处理，在生成环境是无法正常加载样式的，因为没有用`style`处理，也没有被提取成单独的`css`文件

**webpack 构建流程**
================

在了解`webpack`提取`css`样式文件的原理前，我们需要先对`webpack`构建流程有一个初步的了解，只有了解了`webpack`构建流程，才能掌握`webpack`提取`css`的原理

**示例代码**

```
document.write(foo)
export const foo = 1
```

```
const { entry, options, context } = this;
const dep = EntryPlugin.createDependency(entry, options);

compiler.hooks.make.tapAsync("EntryPlugin", (compilation, callback) => {
  compilation.addEntry(context, dep, options, err => {
    callback(err);
  });
});

addEntry从entry开始解析，然后会调用addModuleTree开始构建依赖数

addModuleTree({ context, dependency, contextInfo }, callback) {
  const Dep = dependency.constructor;
  // dependencyFactories会根据保存创建依赖模块的构造函数
  // 比如EntryDependency=>normalModuleFactory
  // 比如HarmonyImportSideEffectDependency => normalModuleFactory
  // 比如HarmonyImportSpecifierDependency => normalModuleFactory
  const moduleFactory = this.dependencyFactories.get(Dep);

  // 通过模块工厂函数创建module实例
  moduleFactory.create()

  // 通过loader处理，将所有的资源转化成js
  runLoaders()

  // loader处理完之后，在通过parse成ast
  NormalModule.parser.parse()

  // 最后遍历ast，找到import require这样的dependency
  parser.hooks.import.tap(
  "HarmonyImportDependencyParserPlugin",
  (statement, source) => {
    const sideEffectDep = new HarmonyImportSideEffectDependency(
      source,
      parser.state.lastHarmonyImportOrder,
      assertions
    );
    parser.state.module.addDependency(sideEffectDep);
  }

  // 最后在遍历模块的依赖，又回到前面的根据依赖找模块工厂函数，然后开始创建模块，解析模块，一直到所有模块解析完
  processModuleDependencies()

  // 当所有的模块解析结束之后，就要生成模块内容
  codeGeneration()

  // 生成模块内容的时候，最终又会通过依赖，来找依赖模版构造函数
  const constructor = dependency.constructor;
  // 比如 HarmonyImportSideEffectDependency => HarmonyImportSideEffectDependencyTemplate
  // 比如 HarmonyImportSpecifierDependency => HarmonyImportSpecifierDependencyTemplate
  const template = generateContext.dependencyTemplates.get(constructor);
  
  // 最后创建assets，根据assets生成最终的文件
  createChunkAssets()
}
```

我们看下`webpack`是怎么解析 js 文件，从`entry`(这里是 index.js) 到所有依赖的模块解析完成的过程，以`normalModule`为例，如下图所示 ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsBjicRDWs7I6tCicKVnnDJarUo9dG8YOLFMgz4msRgAEcPmX0jJ87gjcQ/640?wx_fmt=jpeg)

**详细流程图**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsufhv4ChicNeA4jczwiaIDtt9ckcciceIr8vlRwQE5UvYYru31pgsljAOA/640?wx_fmt=jpeg)

**伪代码如下所示**

```
.wrap {
  color: red
}
```

**`import`语句解析成`ast`之后的数据** ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsr4P7upEX8IdNlxcme4aQqPCQfJVFsNOwWOLv6MTYgiby8aun6EZYP7Q/640?wx_fmt=jpeg)

**根据`ast`， 解析`dependency`** 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsaXgfiamOsLibvkXP2D0A142dL4ticUiaHvpHDE79n84QbboicgZonuo4hLg/640?wx_fmt=jpeg)

**index.js 模块的`depedencies`** 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsOywNMD1zHuI2Lh5a1f44N4dwdib0ujWUAKbYzxAmKricQyt3vur5KUFw/640?wx_fmt=jpeg)

**foo.js 模块的`depedencies`** 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxs88IfVJnngE7zM0C6Z7ialIWlia6gnyvygJKpt8f4icmr4n1ktzx6K0Agg/640?wx_fmt=jpeg) 从上

面的伪代码我们可以知道`webpack`内部是怎么创建模块，解析模块并最终生成模块代码的，简单来说就是`import` or `require`的文件当成一个依赖，而根据这个依赖会生成一个对应的`module`实例，最后在生成模块代码的时候，又会根据依赖模版构造函数生成模块内容，所以`dependency`、`moduleFactory`、`DependencyTemplate`都是密切关联的

**css 提取原理**
============

了解了`webpack`的基本构建流程之后，我们现在来看`mini-css-extract-plugin`插件是如何将所有的`css`文件提取出来，并根据`chunk`来进行合并`css`内容

**案例代码**

```
import './index.css'

document.wirte(111)
```

```
{
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'js/[name].[chunkhash].js',
    chunkFilename: 'chunk/[name].[chunkhash].js',
    publicPath: './'
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
          },
        ]
      },
    ]
  },
  optimization: {
    minimize: false,
    concatenateModules: false,
  },
  entry: {
    app: path.join(__dirname, '../src/index')
  },
  plugins: [
    new MiniCssExtractPlugin(
      {
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[name].[contenthash].css',
        experimentalUseImportModule: false
      }
    )
  ]
}
```

```
// mini-css-extract-plugin处理逻辑

// 定义CssModule、CssDependency、CssModuleFactory、CssDependencyTemplate
// CssModule 用于生产css module实例
// CssDependency 用于构建css dependency

class CssModule {}

class CssDependency{}

class CssModuleFactory {
  create({
    dependencies: [dependency]
  }, callback) {
    callback(
    undefined, new CssModule( /** @type {CssDependency} */dependency));
  }
}
compilation.dependencyFactories.set(CssDependency, new CssModuleFactory());
class CssDependencyTemplate {
  apply() {}
}
compilation.dependencyTemplates.set(CssDependency, new CssDependencyTemplate());
```

`css`提取原理是 (以上面的案例为例，且不考虑`importModule`场景)

*   通过`mini-css-extract-plugin`的`picth loader`先匹配到 index.css 文件，然后创建一个`child compiler`，`child compiler`指定 index.css 文件为`entry`文件
    
*   父`compiler`陷入异步等待过程，子编译器根据`css` `entry`开始编译，匹配到`css-loader`(entry `css`使用了行内`loader`并禁用了 rules 内的`loader`匹配)，经过`css-loader`处理之后，继续进行编译，一直到`child compiler`编译流程结束
    
*   进入子编译器执行成功之后的`callback`，根据子编译流程的结果构造`cssDependency`，然后通过`this._module.addDependency(new cssDependency())` api 将`cssDependency`添加到 index.css 模块的`dependency`中，然后调用 callback(null, `export {};`); 阻断后续`loader`执行也就是`css-loader`执行
    
*   继续父`compiler`编译流程，index.css 编译结束，有一个`cssDependency`依赖，然后根据`cssDependency`依赖找到`cssModuleFactory`，然后通过`cssModuleFactory`创建`css module`实例，调用`css module`上的 build 方法构建`css module`，最终`css module`没有`dependencies`，所有模块解析完成
    
*   进入`createAssets`流程，会触发`renderManifest` `hook`，通过`mini-css-extract-plugin`插件注册的`renderManifest` `hook` `callback`会创建一个包含当前`chunk`内所有`css module`的`render`方法
    
*   最终通过遍历`manifest`，生成一个`css asset`，一个`js asset`
    

**提取流程如下图所示** ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsWPthDS0SDib8AHVsqduDZwYxlpz6rhEJJxArFaicvoodJicn9hsDPAuOw/640?wx_fmt=jpeg)

下面是`css module`创建，及`css asset`创建的伪代码过程

**创建 css module**
-----------------

**伪代码如下所示**

```
// index.css匹配到.css相关的loader，也就是先进入mini-css-extract-plugin.loader
// 跳过importModule处理模块的方式

// 创建子编译器，子编译器，会继承父compiler的大部分hook及插件，然后在子编译器依赖树构建完成之后，会将assets赋值到父compiler的assets上，才能最终输出文件
const childCompiler = this._compilation.createChildCompiler(`${MiniCssExtractPlugin.pluginName} ${request}`, outputOptions);

// 指定css文件为entry，注意路径带有!!前缀，禁止匹配rules中的loader
EntryOptionPlugin.applyEntryOption(childCompiler, this.context, {
  child: {
    library: {
      type: "commonjs2"
    },
    // request /node_modules/css-loader/dist/cjs.js!/Users/wangks/Documents/f/github-project/webpack-time-consuming/src/index.css
    import: [`!!${request}`]
  }
});

childCompiler.hooks.compilation.tap(MiniCssExtractPlugin.pluginName,
  compilation => {
    compilation.hooks.processAssets.tap(MiniCssExtractPlugin.pluginName, () => {
      source = compilation.assets[childFilename] && compilation.assets[childFilename].source();

      // 主动删除子编译器产生的assets,避免子编译器编译结束之后，进行assets赋值
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          compilation.deleteAsset(file);
        });
      });
    });
  });

// 对css文件作为entry的子编译器开始进行编译
childCompiler.runAsChild((error, entries, compilation) => {
  // 子编译流程结束，依赖树构建完成

  // 创建CssDependency
  const CssDependency = MiniCssExtractPlugin.getCssDependency(webpack);

  // 并赋值给当前模块的dependencies中，便于解析出css module
  this._module.addDependency(lastDep = new CssDependency( /** @type {Dependency} */
        dependency, /** @type {Dependency} */
        dependency.context, count))

  // 返回空对象，阻断后续loader执行
  callback(null, `export {};`);
})
```

```
// 最后创建assets，根据assets生成最终的文件
createChunkAssets()

// 进入mini-plugin renderManifest逻辑
compilation.hooks.renderManifest.tap(pluginName,
  (result, {
    chunk
  }) => {
    // 过滤css module
    const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(module => module.type === MODULE_TYPE);

    // 如果chunk中包含呢css module，则向数组中push一个对象
    result.push({
      // 根据manifest生成asset的时候，会调用render方法，决定asset的内容
      render: () => renderContentAsset(compiler, compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener, filenameTemplate, {
        contentHashType: MODULE_TYPE,
        chunk
      })
    });

    renderContentAsset(compiler, compilation, chunk, modules, requestShortener, filenameTemplate, pathData) {
      const usedModules = this.sortModules(compilation, chunk, modules, requestShortener);
      const {
        ConcatSource,
        SourceMapSource,
        RawSource
      } = compiler.webpack.sources;
      const source = new ConcatSource();
      const externalsSource = new ConcatSource();
      // 合并module内容
      for (const module of usedModules) {
        let content = module.content.toString();
        content = content.replace(new RegExp(ABSOLUTE_PUBLIC_PATH, "g"), "");
        content = content.replace(new RegExp(BASE_URI, "g"), baseUriReplacement);
        if (module.sourceMap) {
          source.add(new SourceMapSource(content, readableIdentifier, module.sourceMap.toString()));
        } else {
          source.add(new RawSource(content));
        }
      }
      return new ConcatSource(externalsSource, source);
    }
}


// 进入javascriptModulePlugin的renderManifest callback内
compilation.hooks.renderManifest.tap(PLUGIN_NAME, (result, options) => {
  result.push({
    render: () =>
      this.renderMain(
        {
          hash,
          chunk,
          dependencyTemplates,
          runtimeTemplate,
          moduleGraph,
          chunkGraph,
          codeGenerationResults,
          strictMode: runtimeTemplate.isModule()
        },
        hooks,
        compilation
      )
  });

  renderMain() {
    const allModules = Array.from(
      chunkGraph.getOrderedChunkModulesIterableBySourceType(
        chunk,
        "javascript",
        compareModulesByIdentifier
      ) || []
    );
    ...
    return iife ? new ConcatSource(finalSource, ";") : finalSource;
  }
})                                     

const manifest = this.hooks.renderManifest.call([], options)

// 遍历manifest，也就是之前hook callback内传入的result,根据manifest生成最终的asset
asyncLib.forEach(
  // 两个manifest，一个是包含css module的asset，一个是包含js module的asset
  manifest,
  (fileManifest, callback) => {
    source = fileManifest.render();
    this.emitAsset(file, source, assetInfo);
  })
```

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsgSBBjzuBsLKYhR4KCh5Pl63x9LzjcBwS93kLeWPbqibquHhhLeMcTbQ/640?wx_fmt=jpeg) 

**注意点：**

*   子编译器是以`css`文件作为 entry 进行编译
    
*   子编译处理入口`css`的时候，因为带来!! 前缀，所以不会在匹配到自身的`loader`处理逻辑
    
*   `mini-css-extract-plugin.loader`是一个`pitch loader`，当子编译结束之后，将`cssDependency`添加到`_module.addDependency`，调用 callback 阻断后续`loader`处理流程
    

简单理解就是当父`compiler`解析 js 文件的时候，js 中发现有引用`css`文件，那么会先将`css`文件当成普通的`nomarlModule`, 然后经过`mini-css-extract-plugin.loader`处理后，这个`nomarlNodule`会得到`cssDependency`，然后在根据`cssDependency`继续在父`compiler`创建出`css module`实例

主`compiler`处理完之后的`modules`合集，如下图所示 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsUibq6KBly7kIoTELtKzlkdrMNGSJEjXU3QCVKkpd0GjBl2tdQDIwwRg/640?wx_fmt=jpeg)

第一个`module`实例是 index.js 对应的`normalmodule`实例 第二个`module`实例是 index.css 对应的`normalmodule`实例，但是内容为空 第三个`module`实例是 index.css 对应的`css module`实例，内容就是`css`文件的内容 这样经过`mini-css-extract-plugin`插件处理之后，`css`样式就被单独提取出来了，且最后的 index.css 对应的`normalmodule`实例因为内容为空，会被干掉

那么`mini-css-extract-plugin`是怎么处理，将 index.css 对应的`normalmodule`实例变为空，且创建出新的`css module`实例的

这是`css module`创建的过程，那么最终所有的`css module`是怎么生成到一个文件的，以本篇的例子为例继续分析源码

**创建 css asset**
----------------

```
// 最后创建assets，根据assets生成最终的文件
createChunkAssets()
// 进入mini-plugin renderManifest逻辑
compilation.hooks.renderManifest.tap(pluginName,
  (result, {
    chunk
  }) => {
    // 过滤css module
    const renderedModules = Array.from(this.getChunkModules(chunk, chunkGraph)).filter(module => module.type === MODULE_TYPE);
    // 如果chunk中包含呢css module，则向数组中push一个对象
    result.push({
      // 根据manifest生成asset的时候，会调用render方法，决定asset的内容
      render: () => renderContentAsset(compiler, compilation, chunk, renderedModules, compilation.runtimeTemplate.requestShortener, filenameTemplate, {
        contentHashType: MODULE_TYPE,
        chunk
      })
    });
    renderContentAsset(compiler, compilation, chunk, modules, requestShortener, filenameTemplate, pathData) {
      const usedModules = this.sortModules(compilation, chunk, modules, requestShortener);
      const {
        ConcatSource,
        SourceMapSource,
        RawSource
      } = compiler.webpack.sources;
      const source = new ConcatSource();
      const externalsSource = new ConcatSource();
      // 合并module内容
      for (const module of usedModules) {
        let content = module.content.toString();
        content = content.replace(new RegExp(ABSOLUTE_PUBLIC_PATH, "g"), "");
        content = content.replace(new RegExp(BASE_URI, "g"), baseUriReplacement);
        if (module.sourceMap) {
          source.add(new SourceMapSource(content, readableIdentifier, module.sourceMap.toString()));
        } else {
          source.add(new RawSource(content));
        }
      }
      return new ConcatSource(externalsSource, source);
    }
}
// 进入javascriptModulePlugin的renderManifest callback内
compilation.hooks.renderManifest.tap(PLUGIN_NAME, (result, options) => {
  result.push({
    render: () =>
      this.renderMain(
        {
          hash,
          chunk,
          dependencyTemplates,
          runtimeTemplate,
          moduleGraph,
          chunkGraph,
          codeGenerationResults,
          strictMode: runtimeTemplate.isModule()
        },
        hooks,
        compilation
      )
  });
  renderMain() {
    const allModules = Array.from(
      chunkGraph.getOrderedChunkModulesIterableBySourceType(
        chunk,
        "javascript",
        compareModulesByIdentifier
      ) || []
    );
    ...
    return iife ? new ConcatSource(finalSource, ";") : finalSource;
  }
})                                     
const manifest = this.hooks.renderManifest.call([], options)
// 遍历manifest，也就是之前hook callback内传入的result,根据manifest生成最终的asset
asyncLib.forEach(
  // 两个manifest，一个是包含css module的asset，一个是包含js module的asset
  manifest,
  (fileManifest, callback) => {
    source = fileManifest.render();
    this.emitAsset(file, source, assetInfo);
  })
```

总结起来

*   根据`chunk`生成 manifest，然后在根据 manifest 生成`asset`
    
*   `mini-css-extract-plugin`就是利用`renderManifest` `hook`来从`chunk`中剥离`css module`生成最终的`css asset`
    
*   `webpack`最终在输出文件的时候，是以`assets`来生成文件
    

注意点：

*   `chunk`与`asset`不一定是一对一的关系
    

遍历`chunk`从下图看到，本例只有一个`chunk`，这一个`chunk`包含 2 个`module`实例，一个是`normalmodule`，一个是`css module` 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsxjgn70Y03cEXapS2icrLqztHicEIFJqparsgCeeRsXEbCJOuC2ugxV0g/640?wx_fmt=jpeg)

本例中可以看到`renderManifest` `hook`执行完之后，获得的 result 包含两个值，一个是生成`css asset`，一个是生成 js `asset` 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsdBNlsAjUoCnjibVcehsxvIENLM3JW3TJzic5JZKEoicHIxBRDI87XDDOg/640?wx_fmt=jpeg)

下图中可以看到，生成 js `asset`的时候，`css module`被过滤了 

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/p3q0CDzmjJPjIBd7v0CZXVicZ5GFibHMxsa9XQrV33UacJF7CvzdxS6iaOiaWzEWbCkd89ZYlFD41iaynYgcT1OBR1w/640?wx_fmt=jpeg)

**总结**
======

使用 `webpack`提取 `css` 是一种优化 web 应用程序性能的有效方式。当我们使用许多 `css` 库和框架时，这些库和框架通常会包含大量的 `css` 代码，导致页面加载速度变慢。通过使用 `webpack` 将 `css` 打包成一个单独的文件，我们可以减少页面加载时间，并提高用户体验。

本篇不仅讲述了`webpack`提取`css`的原理，其实也讲到了最基础的`webpack`的通用构建流程，`pitch loader`的运用，`webpack plugin`的运用，所以弄懂`mini-css-extract-plugin`插件相关的原理能够帮助我们更深的了解`webpack`原理同时也可以让我们在面试的过程中能够答出面试官满意的答案

> 作者：wks  
> 链接：https://juejin.cn/post/7241364419359801405  

Node 社群  

==========

### 

```
我组建了一个氛围特别好的 Node.js 社群，里面有很多 Node.js小伙伴，如果你对Node.js学习感兴趣的话（后续有计划也可以），我们可以一起进行Node.js相关的交流、学习、共建。下方加 考拉 好友回复「Node」即可。

   “分享、点赞、在看” 支持一下
```