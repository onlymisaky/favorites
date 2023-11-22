> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/U8YnbRBt9dZnEbCTuSEcpg)

今天小编为大家带来的是社区作者 **xiangzhihong** 的文章，让我们一起来深度剖析 Vite 配置文件
---------------------------------------------------------

我们知道，Vite 构建环境分为开发环境和生产环境，不同环境会有不同的构建策略，但不管是哪种环境，Vite 都会首先解析用户配置。那接下来，我就与你分析配置解析过程中 Vite 到底做了什么？即 Vite 是如何加载配置文件的。

**流程梳理**

我们先来梳理整体的流程，Vite 中的配置解析由 resolveConfig 函数来实现，你可以对照源码一起学习。

### **加载配置文件**

进行一些必要的变量声明后，我们进入到解析配置逻辑中，配置文件的源码如下：

```
// 这里的 config 是命令行指定的配置，如 vite --configFile=xxxlet { configFile } = configif (configFile !== false) {  // 默认都会走到下面加载配置文件的逻辑，除非你手动指定 configFile 为 false  const loadResult = await loadConfigFromFile(    configEnv,    configFile,    config.root,    config.logLevel  )  if (loadResult) {    // 解析配置文件的内容后，和命令行配置合并    config = mergeConfig(loadResult.config, config)    configFile = loadResult.path    configFileDependencies = loadResult.dependencies  }}
```

第一步是解析配置文件的内容，然后与命令行配置合并。值得注意的是，后面有一个记录 configFileDependencies 的操作。因为配置文件代码可能会有第三方库的依赖，所以当第三方库依赖的代码更改时，Vite 可以通过 HMR 处理逻辑中记录的 configFileDependencies 检测到更改，再重启 DevServer ，来保证当前生效的配置永远是最新的。

### **解析用户插件**

第二个重点环节是 解析用户插件。首先，我们通过 apply 参数 过滤出需要生效的用户插件。为什么这么做呢？因为有些插件只在开发阶段生效，或者说只在生产环境生效，我们可以通过 apply: 'serve' 或'build' 来指定它们，同时也可以将 apply 配置为一个函数，来自定义插件生效的条件。解析代码如下：

```
// 这里的 config 是命令行指定的配置，如 vite --configFile=xxxlet { configFile } = configif (configFile !== false) {  // 默认都会走到下面加载配置文件的逻辑，除非你手动指定 configFile 为 false  const loadResult = await loadConfigFromFile(    configEnv,    configFile,    config.root,    config.logLevel  )  if (loadResult) {    // 解析配置文件的内容后，和命令行配置合并    config = mergeConfig(loadResult.config, config)    configFile = loadResult.path    configFileDependencies = loadResult.dependencies  }}
```

接着，Vite 会拿到这些过滤且排序完成的插件，依次调用插件 config 钩子，进行配置合并。

```
// resolve pluginsconst rawUserPlugins = (config.plugins || []).flat().filter((p) => {  if (!p) {    return false  } else if (!p.apply) {    return true  } else if (typeof p.apply === 'function') {     // apply 为一个函数的情况    return p.apply({ ...config, mode }, configEnv)  } else {    return p.apply === command  }}) as Plugin[]// 对用户插件进行排序const [prePlugins, normalPlugins, postPlugins] =  sortUserPlugins(rawUserPlugins)
```

然后，解析项目的根目录即 root 参数，默认取 process.cwd() 的结果。

```
// resolve pluginsconst rawUserPlugins = (config.plugins || []).flat().filter((p) => {  if (!p) {    return false  } else if (!p.apply) {    return true  } else if (typeof p.apply === 'function') {     // apply 为一个函数的情况    return p.apply({ ...config, mode }, configEnv)  } else {    return p.apply === command  }}) as Plugin[]// 对用户插件进行排序const [prePlugins, normalPlugins, postPlugins] =  sortUserPlugins(rawUserPlugins)
```

紧接着处理 alias ，这里需要加上一些内置的 alias 规则，如 @vite/env、@vite/client 这种直接重定向到 Vite 内部的模块。

```
// run config hooksconst userPlugins = [...prePlugins, ...normalPlugins, ...postPlugins]for (const p of userPlugins) {  if (p.config) {    const res = await p.config(config, configEnv)    if (res) {      // mergeConfig 为具体的配置合并函数，大家有兴趣可以阅读一下实现      config = mergeConfig(config, res)    }  }}
```

### **加载环境变量**

加载环境变量的实现代码如下:

```
// run config hooksconst userPlugins = [...prePlugins, ...normalPlugins, ...postPlugins]for (const p of userPlugins) {  if (p.config) {    const res = await p.config(config, configEnv)    if (res) {      // mergeConfig 为具体的配置合并函数，大家有兴趣可以阅读一下实现      config = mergeConfig(config, res)    }  }}
```

loadEnv 其实就是扫描 process.env 与 .env 文件，解析出 env 对象，值得注意的是，这个对象的属性最终会被挂载到 import.meta.env 这个全局对象上。解析 env 对象的实现思路如下:

*   遍历 process.env 的属性，拿到指定前缀开头的属性（默认指定为 VITE_），并挂载 env 对象上
    
*   遍历 .env 文件，解析文件，然后往 env 对象挂载那些以指定前缀开头的属性。遍历的文件先后顺序如下 (下面的 mode 开发阶段为 development，生产环境为 production)
    

特殊情况下，如果中途遇到 NODE_ENV 属性，则挂到  process.env.VITE_USER_NODE_ENV，Vite 会优先通过这个属性来决定是否走生产环境的构建。

接下来，是对资源公共路径即 base URL 的处理，逻辑集中在 resolveBaseUrl 函数当中：

```
// resolve root
const resolvedRoot = normalizePath(
  config.root ? path.resolve(config.root) : process.cwd()
)
```

resolveBaseUrl 里面有这些处理规则需要注意：

*   空字符或者 ./ 在开发阶段特殊处理，全部重写为 /
    
*   . 开头的路径，自动重写为 /
    
*   以 http(s):// 开头的路径，在开发环境下重写为对应的 pathname
    
*   确保路径开头和结尾都是 /
    

当然，还有对 cacheDir 的解析，这个路径相对于在 Vite 预编译时写入依赖产物的路径：

```
// resolve root
const resolvedRoot = normalizePath(
  config.root ? path.resolve(config.root) : process.cwd()
)
```

紧接着处理用户配置的 assetsInclude，将其转换为一个过滤器函数：

```
// resolve alias with internal client aliasconst resolvedAlias = mergeAlias(  clientAlias,  config.resolve?.alias || config.alias || [])const resolveOptions: ResolvedConfig['resolve'] = {  dedupe: config.dedupe,  ...config.resolve,  alias: resolvedAlias}
```

然后，Vite 后面会将用户传入的 assetsInclude 和内置的规则合并：

```
// resolve alias with internal client aliasconst resolvedAlias = mergeAlias(  clientAlias,  config.resolve?.alias || config.alias || [])const resolveOptions: ResolvedConfig['resolve'] = {  dedupe: config.dedupe,  ...config.resolve,  alias: resolvedAlias}
```

这个配置决定是否让 Vite 将对应的后缀名视为静态资源文件（asset）来处理。

### **路径解析器**

这里所说的路径解析器，是指调用插件容器进行路径解析的函数，代码结构如下所示:

```
// load .env filesconst envDir = config.envDir  ? normalizePath(path.resolve(resolvedRoot, config.envDir))  : resolvedRootconst userEnv =  inlineConfig.envFile !== false &&  loadEnv(mode, envDir, resolveEnvPrefix(config))
```

并且，这个解析器未来会在依赖预构建的时候用上，具体用法如下：

```
// load .env filesconst envDir = config.envDir  ? normalizePath(path.resolve(resolvedRoot, config.envDir))  : resolvedRootconst userEnv =  inlineConfig.envFile !== false &&  loadEnv(mode, envDir, resolveEnvPrefix(config))
```

这里有 aliasContainer 和 resolverContainer 两个工具对象，它们都含有 resolveId 这个专门解析路径的方法，可以被 Vite 调用来获取解析结果，本质都是 PluginContainer。

接着，会顺便处理一个 public 目录，也就是 Vite 作为静态资源服务的目录：

```
// 解析 base urlconst BASE_URL = resolveBaseUrl(config.base, command === 'build', logger)// 解析生产环境构建配置const resolvedBuildOptions = resolveBuildOptions(config.build)
```

至此，配置已经基本上解析完成，最后通过 resolved 对象来整理一下：

```
// 解析 base urlconst BASE_URL = resolveBaseUrl(config.base, command === 'build', logger)// 解析生产环境构建配置const resolvedBuildOptions = resolveBuildOptions(config.build)
```

### **生成插件流水线**

生成插件流水线的代码如下：

```
// resolve cache directoryconst pkgPath = lookupFile(resolvedRoot, [`package.json`], true /* pathOnly */)// 默认为 node_module/.viteconst cacheDir = config.cacheDir  ? path.resolve(resolvedRoot, config.cacheDir)  : pkgPath && path.join(path.dirname(pkgPath), `node_modules/.vite`)
```

先生成完整插件列表传给 resolve.plugins，而后调用每个插件的  configResolved 钩子函数。其中 resolvePlugins 内部细节比较多，插件数量比较庞大，我们暂时不去深究具体实现，编译流水线这一小节再来详细介绍。

至此，所有核心配置都生成完毕。不过，后面 Vite 还会处理一些边界情况，在用户配置不合理的时候，给用户对应的提示。比如：用户直接使用 alias 时，Vite 会提示使用 resolve.alias。

最后，resolveConfig 函数会返回 resolved 对象，也就是最后的配置集合，那么配置解析服务到底也就结束了。

**加载配置文件详解**

首先，我们来看一下加载配置文件 (loadConfigFromFile) 的实现：

```
// resolve cache directoryconst pkgPath = lookupFile(resolvedRoot, [`package.json`], true /* pathOnly */)// 默认为 node_module/.viteconst cacheDir = config.cacheDir  ? path.resolve(resolvedRoot, config.cacheDir)  : pkgPath && path.join(path.dirname(pkgPath), `node_modules/.vite`)
```

这里的逻辑稍微有点复杂，很难梳理清楚，所以我们不妨借助刚才梳理的配置解析流程，深入 loadConfigFromFile 的细节中，研究下 Vite 对于配置文件加载的实现思路。

接下来，我们来分析下需要处理的配置文件类型，根据文件后缀和模块格式可以分为下面这几类:

*   TS + ESM 格式
    
*   TS + CommonJS 格式
    
*   JS + ESM 格式
    
*   JS + CommonJS 格式
    

### **识别配置文件的类别**

首先，Vite 会检查项目的 package.json 文件，如果有 type: "module" 则打上 isESM 的标识：

```
const assetsFilter = config.assetsInclude  ? createFilter(config.assetsInclude)  : () => false
```

然后，Vite 会寻找配置文件路径，代码简化后如下：

```
const assetsFilter = config.assetsInclude  ? createFilter(config.assetsInclude)  : () => false
```

在寻找路径的同时， Vite 也会给当前配置文件打上 isESM 和 isTS 的标识，方便后续的解析。

### **根据类别解析配置**

#### **ESM 格式**

对于 ESM 格式配置的处理代码如下：

```
assetsInclude(file: string) {  return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file)}
```

可以看到，首先通过 Esbuild 将配置文件编译打包成 js 代码:

```
assetsInclude(file: string) {  return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file)}
```

对于 TS 配置文件来说，Vite 会将编译后的 js 代码写入临时文件，通过 Node 原生 ESM Import 来读取这个临时的内容，以获取到配置内容，再直接删掉临时文件：

```
const createResolver: ResolvedConfig['createResolver'] = (options) => {  let aliasContainer: PluginContainer | undefined  let resolverContainer: PluginContainer | undefined  // 返回的函数可以理解为一个解析器  return async (id, importer, aliasOnly, ssr) => {    let container: PluginContainer    if (aliasOnly) {      container =        aliasContainer ||        // 新建 aliasContainer    } else {      container =        resolverContainer ||        // 新建 resolveContainer    }    return (await container.resolveId(id, importer, undefined, ssr))?.id  }}
```

以上这种先编译配置文件，再将产物写入临时目录，最后加载临时目录产物的做法，也是 AOT (Ahead Of Time) 编译技术的一种具体实现。

而对于 JS 配置文件来说，Vite 会直接通过 Node 原生 ESM Import 来读取，也是使用 dynamicImport 函数的逻辑，dynamicImport 的实现如下:

```
const createResolver: ResolvedConfig['createResolver'] = (options) => {  let aliasContainer: PluginContainer | undefined  let resolverContainer: PluginContainer | undefined  // 返回的函数可以理解为一个解析器  return async (id, importer, aliasOnly, ssr) => {    let container: PluginContainer    if (aliasOnly) {      container =        aliasContainer ||        // 新建 aliasContainer    } else {      container =        resolverContainer ||        // 新建 resolveContainer    }    return (await container.resolveId(id, importer, undefined, ssr))?.id  }}
```

```
const resolve = config.createResolver()// 调用以拿到 react 路径rseolve('react', undefined, undefined, false)
```

你可能会问，为什么要用 new Function 包裹？这是为了避免打包工具处理这段代码，比如 Rollup 和 TSC，类似的手段还有 eval。你可能还会问，为什么 import 路径结果要加上时间戳 query？这其实是为了让 dev server 重启后仍然读取最新的配置，避免缓存。

**CommonJS 格式**  

对于 CommonJS 格式的配置文件，Vite 集中进行了解析：

```
const resolve = config.createResolver()// 调用以拿到 react 路径rseolve('react', undefined, undefined, false)
```

bundleConfigFile 函数的主要功能是通过 Esbuild 将配置文件打包，拿到打包后的 bundle 代码以及配置文件的依赖 (dependencies)。而接下来的事情就是考虑如何加载 bundle 代码了，这也是 loadConfigFromBundledFile 要做的事情。

```
const { publicDir } = configconst resolvedPublicDir =  publicDir !== false && publicDir !== ''    ? path.resolve(        resolvedRoot,        typeof publicDir === 'string' ? publicDir : 'public'      )    : ''
```

loadConfigFromBundledFile 大体完成的是通过拦截原生 require.extensions 的加载函数来实现对 bundle 后配置代码的加载，代码如下：

```
const { publicDir } = configconst resolvedPublicDir =  publicDir !== false && publicDir !== ''    ? path.resolve(        resolvedRoot,        typeof publicDir === 'string' ? publicDir : 'public'      )    : ''
```

而原生 require 对于 js 文件的加载代码如下所示。

```
const resolved: ResolvedConfig = {
  ...config,
  configFile: configFile ? normalizePath(configFile) : undefined,
  configFileDependencies,
  inlineConfig,
  root: resolvedRoot,
  base: BASE_URL
  ... //其他配置
}
```

事实上，Node.js 内部也是先读取文件内容，然后编译该模块。当代码中调用 module._compile 相当于手动编译一个模块，该方法在 Node 内部的实现如下：

```
const resolved: ResolvedConfig = {
  ...config,
  configFile: configFile ? normalizePath(configFile) : undefined,
  configFileDependencies,
  inlineConfig,
  root: resolvedRoot,
  base: BASE_URL
  ... //其他配置
}
```

在调用完 module._compile 编译完配置代码后，进行一次手动的 require，即可拿到配置对象：

```
;(resolved.plugins as Plugin[]) = await resolvePlugins(
  resolved,
  prePlugins,
  normalPlugins,
  postPlugins
)


// call configResolved hooks
await Promise.all(userPlugins.map((p) => p.configResolved?.(resolved)))
```

这种运行时加载 TS 配置的方式，也叫做 JIT (即时编译)，这种方式和 AOT 最大的区别在于不会将内存中计算出来的 js 代码写入磁盘再加载，而是通过拦截 Node.js 原生 require.extension 方法实现即时加载。

至此，配置文件的内容已经读取完成，等后处理完成再返回即可：

```
;(resolved.plugins as Plugin[]) = await resolvePlugins(
  resolved,
  prePlugins,
  normalPlugins,
  postPlugins
)


// call configResolved hooks
await Promise.all(userPlugins.map((p) => p.configResolved?.(resolved)))
```

**三、总结**

下面我们来总结一下 Vite 配置解析的整体流程和加载配置文件的方法：

首先，Vite 配置文件解析的逻辑由 resolveConfig 函数统一实现，其中经历了加载配置文件、解析用户插件、加载环境变量、创建路径解析器工厂和生成插件流水线这几个主要的流程。

其次，在加载配置文件的过程中，Vite 需要处理四种类型的配置文件，其中对于 ESM 和 CommonJS 两种格式的 TS 文件，分别采用了 AOT 和 JIT 两种编译技术实现了配置加载。

点击左下角阅读原文，到 **SegmentFault 思否社区** 和文章作者展开更多互动和交流，“**公众号后台** “回复 “ **入群** ” 即可加入我们的**技术交流群**，收获更多的技术文章~

**- END -**

  

**往期推荐**

  

[

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/aVp1YC8UV0fgz8ibkmWYr0kksZaVFD7dbNd8TpAIZsgFI2a8JRibtCkKEdmmskoCibvUMw3yDu3aPX37bLJia9ibZBg/640?wx_fmt=jpeg)

社区精选｜弄懂这几个概念之后，我对 webpack 有了新的理解







](https://mp.weixin.qq.com/s?__biz=MjM5NTEwMTAwNg==&mid=2650306445&idx=1&sn=4ec67967ba6352fb168b4cf68af1930d&chksm=bef177ac8986feba165cd9bc818747832c52bba9100f634f61cc7911027acef2ba18adce5ba2&scene=21#wechat_redirect)

  

[

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/aVp1YC8UV0fep5y5EkIl1d9cAeFzncrvcoQpNdkDoM2zen7iamxLOC4yzHtsAKEZKtlDyJ5UKKlv0yX54UI1icOQ/640?wx_fmt=jpeg)

社区精选｜React Server Component 从理念到原理







](https://mp.weixin.qq.com/s?__biz=MjM5NTEwMTAwNg==&mid=2650300363&idx=1&sn=bc8080cfb6ec591bc619e8d347bb8191&chksm=bef15fea8986d6fc5528624c9304ca6342dfb8d0e0c4b9f638bce3fde8d6d6c8c9756fa38342&scene=21#wechat_redirect)

  

[

![](https://mmbiz.qpic.cn/mmbiz_jpg/aVp1YC8UV0dXGMibFl2c7FH2Rm8lojqJHlY9mib2Ee96lzXwP3ftGK42bcXWzRvQbP8vHvp3aycOe4EdVoWBwouA/640?wx_fmt=jpeg)

社区精选｜Vue 3 中依赖注入与组件定义相关的那点事儿







](https://mp.weixin.qq.com/s?__biz=MjM5NTEwMTAwNg==&mid=2650298125&idx=1&sn=9d686de9ae497871b221c3cd00390f85&chksm=bef1572c8986de3a8fb9690b4108f66b797e4379e5344324137e1f0f1c660bad620c31c985b5&scene=21#wechat_redirect)