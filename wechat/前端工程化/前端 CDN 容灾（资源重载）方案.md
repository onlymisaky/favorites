> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/MAHkmYSrkI-6457vtus_fw)

1、背景
====

在日常对前端核心站点性能分析过程中，不免遇到各种核心静态资源异常导致的白屏异常，目前应该绝大部分产线静态资源均发布到 CDN。也就是，我们不免要经常跟各种 CDN 资源异常打交道，然而分析 CDN 异常，费时费力，还收效甚微。运维还需要我们提供各种节点信息，当然这些对于内嵌 APP 站点且用户分布全国的开发来讲，难度不是一星半点。

当然除此之外，SRE 同学对于 CDN 异常也通常无法解决以下几个问题：

*   **时效性**：当 CDN 出现问题时，SRE 会手动进行 CDN 切换，因为需要人为操作，响应时长就很难保证。另外，切换后故障恢复时间也无法准确保障。
    
*   **有效性**：切换至备份 CDN 后，备份 CDN 的可用性无法验证，另外因为 Local DNS 缓存，无法解决域名劫持和跨网访问等问题。
    
*   **精准性**：CDN 的切换都是大范围的变更，无法针对某一区域或者某一项目单独进行。
    
*   **风险性**：切换至备份 CDN 之后可能会导致回源，流量剧增拖垮源站，从而引发更大的风险。
    

因此，前端侧需要寻求更好的解决方案，CDN 容灾就能很好的解决以上问题，当前端 CDN 资源发生异常时，我们自动切换到备用 CDN 或者该用户切回源站。从而、解决由于核心资源异常，给用户带来的不好的用户体验，如白屏等。

2、目标
====

优化由于 JS、CSS 等资源异常，给用户造成的各种体验问题，如样式错乱，加载缓慢，白屏等等。需要做到以下几点：

*   **端侧 CDN 域名自动切换**：在 CDN 异常时，端侧第一时间感知并自动切换 CDN 域名进行加载重试，减少对人为操作的依赖。
    
*   **更精准有效的 CDN 监控**：建设更细粒度的 CDN 监控，能够按照项目维度实时监控 CDN 可用性，解决 SRE CDN 监控粒度不足，告警滞后等问题。并根据容灾监控对 CDN 容灾策略实施动态调整，减少 SRE 切换 CDN 的频率
    
*   **更完整的链路监控**：当核心链路阻断时，前端监控平台上报更完整的链路日志，供研发侧分析问题根因
    

3、方案设计
======

3.1、资源重载流程图
-----------

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pqcWLvSo2kiaXsBicPXpbEib88l2o9gx61OPwtMXk2GUlwGlPAcqJq2gFtzKTe8r1epcSBzEB7vlyM72WL8ujfMhw/640?wx_fmt=other&from=appmsg)

3.2、资源重载设计概述
------------

要进行资源重载，首先我们要了解在前端站点构建过程中，资源的加载方式，大概可以分为以下几种：

*   情况 1：同步 CDN 资源，如主文档中加载的 vue、vueRouter、vuex 等
    
*   情况 2：异步 chunk 资源，如路由的懒加载 `() => import('./xxx.vue')`
    
*   情况 3：动态加载的 CDN 资源，如动态创建 script 脚本，然后插入 dom 过程
    

对于以上三种资源加载方式，重载方案都不尽相同。

### 3.2.1、同步 CDN 资源

重载过程：

资源异常

触发该 dom 绑定 onerror 事件

通过 document.write 追加新 dom 标签

重载资源

这里我们就需要用到`document.write` 方法。他的特点是在文档流未关闭前，可以对文档流追加字符串。当浏览器一行一行加载`HTML`内的 js，直到某个 js 失败时， 触发`onerror`，在`onerror`事件中立即写入一个该资源的 CDN 新地址的 `<script>` 标签即可

以上，我们可以看出，对与同步资源重载，我们需要做到：

1.  解析 HTML 标签，绑定 onerror、onload（用于打点上报成功率等）事件
    
2.  HTML 注入资源重载方法的脚本。
    

对于手动绑定事件及注入重载脚本，较难维护和统一，应该考虑另外的方式自动绑定事件、注入脚本等。

### 3.2.2、异步 chunk 资源

**webpack 中，异步 chunk 资源加载，编译如下：**

```
js复制代码// 源码{ name: 'serviceCertificationList',path: '/serviceCertificationList',component: () => import('@/views/serviceCertification/serviceCertificationList.vue')}// webpack编译后{name: 'serviceCertificationList',path: '/serviceCertificationList',component: function component() { return Promise.all(/* import() */[__webpack_require__.e(0), __webpack_require__.e(3), __webpack_require__.e(12)]).then(__webpack_require__.bind(null, "0NEa"))}
```

由上可知，对于 webpack 打包的项目，如果需要对异步 chunk 资源进行重载，我们需要对`__webpack_require__.e`方法进行重写，将资源加载失败重试逻辑封装进去。因此，我们需要了解异步 chunk 资源 webpack 加载原理。稍后说明。

**然而，对于 vite 打包的项目，对于异步 chunk 资源是如何进行加载的呢？**

我们知道，vite 打包项目，构建目标是能支持 原生 ESM 语法的 script 标签、原生 ESM 动态导入 和 `import.meta` 的浏览器。  
因此，vite 加载 chunk 资源，是利用的原生 esm 天然支持的动态 import，如果我们需要加入 import() 失败重载的逻辑，那么必然，我们需要将项目所有动态 import 的脚步解析出来，然后用我们重载函数给包装下。  
所幸，vite 模块会默认配置预加载：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pqcWLvSo2kiaXsBicPXpbEib88l2o9gx61OicUzjkN9LDsHMoCTba03kicIJJl9ZxRorib3jkXm07ZT9aKesVMAf87Lg/640?wx_fmt=other&from=appmsg)

vite 内置插件 vite:build-import-analysis, 会对所有动态 imports 进行解析，然后给动态 import 拼接上 preload 方法：

```
js复制代码 const preloadCode = `const scriptRel = ${scriptRel};const assetsURL = ${assetsURL};const seen = {};export const ${preloadMethod} = ${preload.toString()}`;    return {        name: 'vite:build-import-analysis',        resolveId(id) {            if (id === preloadHelperId) {                return id;            }        },        load(id) {            if (id === preloadHelperId) {                return preloadCode;            }        },        async transform(source, importer) {            // ...提取imports            // ...遍历imports，拼接preload方法             for (let index = 0; index < imports.length; index++) {                            const { s: start, e: end, ss: expStart, se: expEnd, n: specifier, d: dynamicIndex, a: assertIndex } = imports[index];                            const isDynamicImport = dynamicIndex > -1;                            // strip import assertions as we can process them ourselves                            if (!isDynamicImport && assertIndex > -1) {                                str().remove(end + 1, expEnd);                            }                            if (isDynamicImport && insertPreload) {                                needPreloadHelper = true;                                str().prependLeft(expStart, `${preloadMethod}(() => `);                                str().appendRight(expEnd, `,${isModernFlag}?"${preloadMarker}":void 0${optimizeModulePreloadRelativePaths || customModulePreloadPaths                                    ? ',import.meta.url'                                    : ''})`);                            }                            // static import or valid string in dynamic import                            // If resolvable, let's resolve it                            // ...格式化import URL                        // 拼接 preload引入                        if (needPreloadHelper &&                            insertPreload &&                            !source.includes(`const ${preloadMethod} =`)) {                            str().prepend(`import { ${preloadMethod} } from "${preloadHelperId}";`);                        }            }    }
```

以上，主要功能就是给所有动态 import 拼接上 preload 方法，并在 import preload 函数时，返回合成好的代码。

对一个 vite 项目，关闭代码压缩后，我们可以观察最终 dist 产物，看看 vite:build-import-analysis 插件效果：

```
js复制代码{    path: "/battery/stepInstructions",    name: "stepInstructions",    component: () => __vitePreload(() => import("./stepInstructions.917cdf0e.js"), true ? ["assets/stepInstructions.917cdf0e.js","assets/stepInstructions.4c659577.css"] : void 0),    meta: {      title: "\u7535\u74F6\u4E0A\u95E8\u88C5\u6B65\u9AA4\u8BF4\u660E"    }  }
```

再看看`__vitePreload`函数：

```
js复制代码const __vitePreload = function preload(baseModule, deps, importerUrl) {  if (!deps || deps.length === 0) {    return baseModule();  }  const links = document.getElementsByTagName("link");  return Promise.all(deps.map((dep) => {    dep = assetsURL(dep);    if (dep in seen)      return;    seen[dep] = true;    const isCss = dep.endsWith(".css");    const cssSelector = isCss ? '[rel="stylesheet"]' : "";    const isBaseRelative = !!importerUrl;    if (isBaseRelative) {      for (let i2 = links.length - 1; i2 >= 0; i2--) {        const link2 = links[i2];        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {          return;        }      }    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {      return;    }    const link = document.createElement("link");    link.rel = isCss ? "stylesheet" : scriptRel;    if (!isCss) {      link.as = "script";      link.crossOrigin = "";    }    link.href = dep;    document.head.appendChild(link);    if (isCss) {      return new Promise((res, rej) => {        link.addEventListener("load", res);        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));      });    }  })).then(() => baseModule());};
```

由此，我们应该知道，如果对于 vite import() 资源异常进行重载，我们可以基于`__vitePreload`进行重写。 至此，webpack 异步 chunk 加载、vite 异步 chunk 加载思路应该有大概雏形。

### 3.2.3 动态加载的 CDN 资源

对于此类动态创建脚本添加的异步资源，一般有两种方式进行处理：

1.  用户自己在创建脚本时，添加重载逻辑
    
2.  html 中注入全局动态加载函数，覆盖重载逻辑，由业务方进行调用。 此类重载逻辑简单，不做赘述。
    

以上，对于三种资源加载类型的重载方案，也大概讲述完毕，下面我们看看详细代码设计。

3.3 详细设计
--------

资源重载方案，会对 webpack、vite 等内部方法进行一些重写，因此，我们需要设计相应插件，来涵盖以上功能，而且也相对统一，利于以后维护。

### 3.3.1、 webpack 插件设计

#### 同步 CDN 资源

主要目标如下：

> 1.  解析 HTML 标签，绑定 onerror、onload（用于打点上报成功率等）事件
>     
> 2.  HTML 注入资源重载方法的脚本。
>     

以上，均会对 html 进行解析或注入，`HtmlWebpackPlugin`插件目前提供了一系列钩子 API，eg。 `alterAssetTags`，`alterAssetTagGroups`，具体可参考官方文档，以下是各 API 触发时机：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/pqcWLvSo2kiaXsBicPXpbEib88l2o9gx61Ot9zxVoJytva01TFcR6f2WUWcG9quNrKQTEZaJPKDMAUQib26IN22h0Q/640?wx_fmt=other&from=appmsg)

webpack 插件开发规则，此处不赘述。对于以上两点目标，`HtmlWebpackPlugin`钩子 API 都能给我们很好解决：

```
js复制代码const pluginOptions = JSON.stringify(this.options);let coreJsContent = `(${this.injectScript()})(${pluginOptions})`;compiler.hooks.make.tapAsync(pluginName, async (compilation, callback) => {    // 处理html里注入静态资源，添加onerror属性    HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap(pluginName, (options) => {        const { scripts, styles } = options?.assetTags || {};        if (scripts?.length) {            scripts.map((js) => {                !js.attributes.onerror && (js.attributes.onerror = `${this.options.globalReloadName}(this, event)`);            })        }        if (styles?.length) {            styles.map((css) => {                !css.attributes.onerror && (css.attributes.onerror = `${this.options.globalReloadName}(this, event)`);            })        }        return options;    })    HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap(pluginName, (options) => {        const { headTags } = options;        // 在index.html注入脚本        headTags.unshift({            tagName: 'script',            innerHTML: coreJsContent,            attributes: {                type: 'text/javascript'            },            voidTag: false        });        return options;    })    callback();})
```

此处，我们通过`coreJsContent`向 html 注入重载脚本

```
js复制代码const load = (dom: HTMLElement, url: string, type: 'link' | 'js', retryTimes: number = 0) => {    if (retryTimes < options.maxRetryTimes) {        retryTimes++;        const newUrl = win.__reloadRule__(url);        if (type === 'link') {            const newLink: any = dom.cloneNode();            newLink.href = newUrl;            newLink.onerror = `${options.globalReloadName}(this, event, ${retryTimes})`;            newLink.onload = `${options.globalReloadName}(this, event, ${retryTimes})`;            dom.parentNode?.insertBefore(newLink, dom);        } else if (type === 'js') {            var scriptText = '<scr' + 'ipt type=\"text/javascript\" src=\"' + newUrl                + `\" onload=\"${options.globalReloadName}(this, event ` + ')\"'                + `\" onerror=\"${options.globalReloadName}(this, event, ` + retryTimes + ')\" ></scr' + 'ipt>';            document.write(scriptText);        }    }}win[options.globalReloadName] = (dom: HTMLElement, event: Event, retryTimes: number = 0) => {    const url = (dom as any).src || (dom as any).href;    if (event.type === 'load') {        // 触发重载onload        win.__report_reload__(url, 'success');        return;    }    if (retryTimes > 0) {        // 重载失败        win.__report_reload__(url, 'error');    }    const tag = dom.tagName.toLowerCase();    const type = tag === 'script' ? 'js' : tag === 'link' ? 'link' : '';    if (type) {        load(dom, url, type, retryTimes)    }}
```

逻辑较简单，同步 CDN 资源重载也大体结束了。

#### 异步 chunk 资源重载

入口文件中比较重要的 manifest 文件，他包含了 webpack 模块加载的一些公共函数及维护了 chunkid 到模块的一些映射。我们需要改写的`__webpack_require__.e`函数就位于此文件中。

我们先看看`() => import('xxx')`, `__webpack_require__.e`逻辑:

我们知道路由文件最终会被编译为如下：

```
js复制代码{  name: 'serviceCertificationList',  path: '/serviceCertificationList',  component: function component() {    return Promise.all(/* import() */[__webpack_require__.e(0), __webpack_require__.e(1), __webpack_require__.e(4), __webpack_require__.e(17)]).then(__webpack_require__.bind(null, "0NEa")).then(function (m) {      return m["default"] || m;    });  },  meta: {    title: '门店服务认证'  }}
```

当 vue-router 加载路由时，执行`component`函数，对返回的 promise 进行后续处理。 下面我们看看`__webpack_require.e`

```
js复制代码/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {/******/ 		var promises = [];/******//******//******/ 		// JSONP chunk loading for javascript/******//******/ 		var installedChunkData = installedChunks[chunkId];/******/ 		if(installedChunkData !== 0) { // 0 means "already installed"./******//******/ 			// a Promise means "currently loading"./******/ 			if(installedChunkData) {/******/ 				promises.push(installedChunkData[2]);/******/ 			} else {/******/ 				// setup Promise in chunk cache/******/ 				var promise = new Promise(function(resolve, reject) {/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];/******/ 				});/******/ 				promises.push(installedChunkData[2] = promise);/******//******/ 				// start chunk loading/******/ 				var script = document.createElement('script');/******/ 				var onScriptComplete;/******//******/ 				script.charset = 'utf-8';/******/ 				script.timeout = 120;/******/ 				if (__webpack_require__.nc) {/******/ 					script.setAttribute("nonce", __webpack_require__.nc);/******/ 				}/******/ 				script.src = jsonpScriptSrc(chunkId);/******/ 				if (script.src.indexOf(window.location.origin + '/') !== 0) {/******/ 					script.crossOrigin = "anonymous";/******/ 				}/******/ 				// create error before stack unwound to get useful stacktrace later/******/ 				var error = new Error();/******/ 				onScriptComplete = function (event) {/******/ 					// avoid mem leaks in IE./******/ 					script.onerror = script.onload = null;/******/ 					clearTimeout(timeout);/******/ 					var chunk = installedChunks[chunkId];/******/ 					if(chunk !== 0) {/******/ 						if(chunk) {/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);/******/ 							var realSrc = event && event.target && event.target.src;/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';/******/ 							error.name = 'ChunkLoadError';/******/ 							error.type = errorType;/******/ 							error.request = realSrc;/******/ 							chunk[1](error);/******/ 						}/******/ 						installedChunks[chunkId] = undefined;/******/ 					}/******/ 				};/******/ 				var timeout = setTimeout(function(){/******/ 					onScriptComplete({ type: 'timeout', target: script });/******/ 				}, 120000);/******/ 				script.onerror = script.onload = onScriptComplete;/******/ 				document.head.appendChild(script);/******/ 			}/******/ 		};/******/ 		return Promise.all(promises);/******/ 	};
```

简要概述，上述函数就是对 chunkID 对应的 css, js 资源进行动态脚本加载。返回一个 promise，脚本加载失败，promise 会 reject, 加载成功，此处设计很精妙，在成功加载的文件中，会直接 resolve 掉。 具体细节，大家可以查看加载的文件，以下面 27.js 文件为例：

```
js复制代码(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[27], {...})
```

此处调用了`window["webpackJsonp"].push方法`，在此方法内，会 resolve 掉`__webpack_require.e`的 promise.

要实现重载，此处我们对`__webpack_require.e`进行重写：

```
js复制代码 rewriteWepackE() {        return (webpackRequire: any, options: Options) => {            const oldWebpackE = webpackRequire.e;            const oldWebpackP: string = webpackRequire.p;            const newWepackE = (chunkId: string, retryTimes: number = 0) => {                let resolveFn: any = null;                let rejectFn: any = null;                const win = window as any;                const defer = new Promise((resolve, reject) => {                    resolveFn = resolve;                    rejectFn = reject;                })                const result = oldWebpackE(chunkId);                if (retryTimes < options.maxRetryTimes) {                    let hasError = false;                    result.catch((e: any) => {                        const newWebpackP = win.__reloadRule__(oldWebpackP);                        webpackRequire.p = newWebpackP;                        hasError = true;                        newWepackE(chunkId, ++retryTimes).then(() => {                            resolveFn();                            // 重载成功打点                            win.__report_reload__(`${webpackRequire.p}/${chunkId}`, 'success');                            webpackRequire.p = oldWebpackP;                        }, (e) => {                            rejectFn(e);                            // 重载失败打点                            win.__report_reload__(`${webpackRequire.p}/${chunkId}`, 'error');                            webpackRequire.p = oldWebpackP;                        });                    }).then(() => {                        if (!hasError) {                            resolveFn()                        }                    })                } else {                    result.then(() => {                        resolveFn()                    }, (e: any) => { rejectFn(e) })                }                return defer;            };            return newWepackE;        }    }
```

webpack 提供了`compilation.mainTemplate.hooks`，允许我们对 manifest 文件内容进行改写：

```
js复制代码compiler.hooks.compilation.tap(pluginName, (compilation, callback) => {    compilation.mainTemplate.hooks.requireExtensions.tap(pluginName, (chunk, name) => {        const webpackE = this.rewriteWepackE();        const code = `__webpack_require__.e = (${webpackE})(__webpack_require__, ${pluginOptions})`;        return `${chunk};\n${code}`;    })    compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, (chunk) => {        const promiseAll = this.rewritePromiseAll();        const code = `return (${promiseAll})(promises)`;        return `${chunk};\n${code}`;    })})
```

由于`__webpack_require.e`是返回的 promise.all，当一个资源异常时就返回异常，此处不符合我们重载逻辑，需要改写 promise.all，当资源加载均异常时，才返回异常，触发重载逻辑。

到此，webpack 异步 chunk 重载逻辑也解释完毕。

### 3.3.2、 vite 插件设计

#### 同步 CDN 资源

理念跟 webpack 一致，只是找对应 vite 钩子函数，vite 对 html 进行变更及插入脚本，可以利用`transformIndexHtml`钩子， 此处对 html 文本解析，用到了 cheerio 库进行分析。

```
js复制代码 transformIndexHtml(html: string) {            const pluginOptions = JSON.stringify(realOptions);            let coreJsContent = `(${injectScript})(${pluginOptions})`;            const $ = load(html);            const mapCheerio = (res: Array<any>, fn: any) => {                for (let i = 0; i < res.length ; i++) {                    if (res[i]) {                        fn($(res[i]))                    }                }            }            const scripts: any = $('head script');            mapCheerio(scripts, (cheerio: any) => {                if (cheerio.attr('src')) {                    cheerio.attr('onerror', `${realOptions.globalReloadName}(this, event)`)                }            })                    const links: any = $('head link[rel="stylesheet"]');            mapCheerio(links, (cheerio: any) => {                if (cheerio.attr('href')) {                    cheerio.attr('onerror', `${realOptions.globalReloadName}(this, event)`)                }            })                    const tags = [                {                    tag: 'script',                    attrs: {                        type: 'text/javascript'                    },                    children: coreJsContent,                    }            ]            return {                html: $.html(),                tags            };        },
```

#### 异步 chunk 资源重载

由概述，我们知道，异步 chunk 资源重载可以基于 preload 方法，因此，参考 webpack 重载逻辑，可在 transform 钩子中，改变 preload 内容，返回包含了重载逻辑的内容。

```
js复制代码transform(code: string, id: string) {    const preloadHelperId = '\0vite/preload-helper';    const pluginOptions = JSON.stringify(realOptions);    if (id === preloadHelperId) {        console.log(code);        const newPreload = `(${rewritePreload})(assetsURL, seen, scriptRel, ${pluginOptions})`;        const newCodeArr = code.split('const __vitePreload =');        const newCode = `${newCodeArr[0]}const __vitePreload =${newPreload}`;        return newCode    }},
```

4、结语
====

至此，基于`webpack`,`vite`的资源重载方案设计完毕，投入实际项目中，会发现很大效率提高了资源加载成功率。有兴趣的同学，不妨一试。