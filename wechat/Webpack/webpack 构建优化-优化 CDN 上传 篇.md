> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/QJDuQQG5E5u71iCK-cm9Aw)

> 本文作者为 360 奇舞团前端开发工程师

在现代 Web 开发中，将静态资源上传到 CDN（内容分发网络）是一种常见的优化手段，可以显著提升资源加载速度。CDN 通过将资源分发到离用户更近的服务器，减少了网络延迟，从而提高了用户体验。然而，随着项目规模的扩大，静态资源的数量和体积也在不断增加，这使得每次构建时都需要上传所有静态资源变得非常耗时。为了解决这个问题，我们可以实现一个 Webpack 插件，边构建，边将产物上传至 cdn，并将 cdn 地址替换原有静态资源相对路径，最后利用缓存机制来优化上传过程。

基本思路
----

在每次构建时，如果所有静态资源都重新上传到 CDN，无疑会浪费大量时间和带宽。尤其是在大型项目中，构建时间可能会显著增加，影响开发效率。通过引入缓存机制，我们可以在上传之前检查本地是否已有缓存，如果有，就跳过上传操作，仅替换路径，从而优化整个过程。这不仅可以节省时间，还能减少对网络带宽的消耗。

实现步骤
----

### 1. 创建 Webpack 插件，自定义路径查找方案

创建一个名为 `webpack-upload-static-to-cdn` 的插件。在 Webpack 生成的代码中添加和使用一个自定义的资源查找功能, 并将 `__webpack_require__.p` 替换。

```
const ASSET_LOOKUP_DEF = `;(function () {  __webpack_require__.__webpack_asset_map__ = 1;  __webpack_require__.__asset__ = function (path, wR) {    return __webpack_require__.__webpack_asset_map__[path] || (wR.p + path);  };})()`; compiler.hooks.compilation.tap(pluginName, (compilation) => { // 在编译时的钩子      compilation.hooks.processAssets.tap(        {          name: pluginName,          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE, // 优化阶段        },        (assets) => {          // 往js里面插东西，处理 `__webpack_require__.p`          Object.entries(assets).forEach(([filename, source]) => { // 遍历资产            if (filename.endsWith('.js')) { // 如果是js文件              try {                const { source, map } = source.sourceAndMap(); // 获取源和映射                // replacePublicPath很关键，处理webpack中的路径__webpack_require__.p，替换为读取一个对象中cdn地址                const newSource = new SourceMapSource(replacePublicPath(source as string), filename, map); // 替换公共路径                compilation.updateAsset(filename, newSource); // 更新资产              } catch (e) {}            }          });        }      );    });;
```

其中 replacePublicPath 部分代码很关键，它将每个 asset 资源中的 `__webpack_require__.p` 进行处理，将自定义的查找方法赋值给 `__webpack_require__.p` ， 让源码中获取资源路径的代码 `(__webpack_require__.p + path)` ，变成以 `__webpack_require__.__asset__(path, __webpack_require__)` ，而 `__webpack_require__.__asset__(path, __webpack_require__)` 传入 path，就能获得 **urlMap ** 中的 cdn 地址。

```
// 在 Webpack 生成的代码中添加和使用一个自定义的资源查找功能
const ASSET_LOOKUP_DEF = `
;(function () {
  __webpack_require__.__webpack_asset_map__ = 1;
  __webpack_require__.__asset__ = function (path, wR) {
    return __webpack_require__.__webpack_asset_map__[path] || (wR.p + path);
  };
})();
`;

/**
 * 在 Webpack 生成的代码中添加和使用一个自定义的资源查找功能 __webpack_require__.__asset__
 * @param str 
 * @returns 
 */
export const replacePublicPath = function (str: string) {
  return (
    str
      // __webpack_require__.p 是 Webpack 用来设置公共路径（public path）的变量。在这里插入自定义的资源查找方法。
      .replace(
        /__webpack_require__\.p\s*\=\s*["']/g,
        (m) => `${ASSET_LOOKUP_DEF}\n${m}`
      )
      // 基于一个假设：本行后面没有其他多余内容
      // 匹配形如 (__webpack_require__.p + path) 的代码行,
      // 用 __webpack_require__.__asset__(path, __webpack_require__) 替换原来的路径拼接逻辑。
      .replace(
        /(?:\(__webpack_require__\.p\s*\+\s*)([^\n]+?)\)(;?)$/gm,
        (_, g1, g2) =>
          `__webpack_require__.__asset__(${g1}, __webpack_require__)${g2}`
      )
      .replace(
        /(?:__webpack_require__\.p\s*\+\s*)([^\n]+?)(;?)$/gm,
        (_, g1, g2) =>
          `__webpack_require__.__asset__(${g1}, __webpack_require__)${g2}`
      )
  );
};
```

### 2. 创建共享 urlMap

接下来，我们需要创建一个共享的 **urlMap**，用于存储所有静态资源上传到 CDN 后的地址。每次上传成功后，我们将更新这个 **urlMap** 对象，以便在后续的构建中使用。

### 3. 使用 cdn 地址更新 urlMap

每个静态资源上传成功后，都要更新 **urlMap**，其中 key 为原来的相对路径，value 为返回的 CDN 地址。这一步骤确保了我们在后续构建中能够快速找到已上传资源的 CDN 地址。

```
compiler.hooks.afterEmit.tapPromise(pluginName, async (compilation) => {    // ... 省略部分代码    // 创建URL映射，很关键，所有资源上传后，更新urlMap，    // 因为上一步一景使用一个自定义的资源查找功能了，这里urlMap被用来替换原来的相对路径。    const urlMap = new Map<string, string>();     const uploadFile = async ( // 上传文件的异步函数      name: string,      content: string | Buffer,      shouldOverwrite?: boolean // 是否覆盖的选项    ) => {      const fileLocation = stats.outputPath + '/' + name // 文件位置      const url = await uploadContent({ // 上传内容并获取URL        file: name,        fileLocation,        content,        extname: extname(name), // 获取文件扩展名      });      if (url && typeof url === 'string') { // 如果URL有效        urlMap.set(name, url); // 将URL添加到映射中      }    };    // 省略resource上传、替换 ...    // style上传、替换 ...    await Promise.all( // 并行上传样式文件      Array.from(styleNames).map((name) =>        uploadFile(          name,          replaceCSSUrls(name, assetMap.get(name) as string, urlMap), // 替换CSS URL并上传          true // 设置为覆盖        )      )    );    // 省略html 上传、替换    // ... 省略其他上传、替换代码  })
```

### 4. 加入缓存

为了进一步优化上传过程，我们需要创建一个 `cache.json` 文件，加入缓存机制。在上传每个静态资源前，判断 `cache.json` 中的 hash 是否与当前相同。如果相同，则不上传；否则进行上传。这一机制可以有效减少不必要的上传操作。

```
/** * compatible API for cdn when enable cache * @param {Cdn} cdn * @param {object=} option * @param {object=} option.passToCdn passToCdn needs to be saved * @param {string=} option.cacheLocation where to put cache file * @returns {Cdn} */const compatCache = (cdn, option = {}) => {  // init to save option  Cache.init(option)  const upload = async (files) => {    const { toUpload, pairFromCache, localHashMap } = files.reduce(      (last, file) => {        const fileContent = read(file)        // using relative location so cache could be shared among developers        const relativeLocation = path.relative(__dirname, file)        const locationHash = Cache.getHash(relativeLocation)        const hash = Cache.getHash(fileContent)        if (Cache.shouldUpload(hash, locationHash)) {          return Object.assign(last, {            toUpload: last.toUpload.concat(file),            localHashMap: Object.assign(last.localHashMap, {              [file]: locationHash + hash,            }),          })        }        return Object.assign(last, {          pairFromCache: Object.assign(last.pairFromCache, {            [file]: Cache.getUrl(locationHash + hash),          }),        })      },      {        localHashMap: {},        toUpload: [],        pairFromCache: {},      }    )    const res = toUpload.length      ? await cdn.upload(toUpload)      : await Promise.resolve({})    // new pair to cache    const newPair = Object.entries(res).reduce((_, [localPath, cdnUrl]) => {      const hash = localHashMap[localPath]      return Cache.update(hash, cdnUrl)    }, {})    // update cache    Cache.end(newPair)    sourceCount.cacheTotal += Object.keys(pairFromCache).length    sourceCount.filesTotal += files.length    return Object.assign(res, pairFromCache)  }  return {    upload,    getSourceCount,  }}
```

效果对比
----

我的项目比较大，打包后的产物有 309 个小文件，每个小文件基本在 5kB 左右，在没有加入缓存前，webpack 编译耗时达到 40 秒左右；当使用了缓存后，只需要 17 秒！！！

不使用缓存：  
![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDX5CN7jibkicpEYJQr93VQJZiaoaG5bpEO2yWceLztk06qfJvc7NJckhBRTB30n0qa2A42qbFrfw0ibA/640?wx_fmt=png&from=appmsg)  
使用了缓存：  
![](https://mmbiz.qpic.cn/sz_mmbiz_png/cAd6ObKOzEDX5CN7jibkicpEYJQr93VQJZgVk5l08QNUMfMlOkwwZkF7Y5Aqib3xbXI9ia2WTPOQsp30KZnR2MHrFQ/640?wx_fmt=png&from=appmsg)

总结
--

通过在 Webpack 中实现缓存机制，我们可以显著提高静态资源上传到 CDN 的效率。这不仅节省了构建时间，还减少了对网络带宽的消耗。随着项目的不断发展，优化构建过程将变得愈发重要。希望本文提供的思路和实现步骤能够帮助开发者在实际项目中更好地应用缓存机制，提高开发效率。

- END -

**如果您关注前端 + AI 相关领域可以扫码进群交流**

 ![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cAd6ObKOzEArGqlLlZmLVB61keywZ2APgWHNwTdK8OicE1utUcAJj1m5ZMFTL8iac51bGglnIeCR5KHicCBh5lh3A/640?wx_fmt=jpeg)

添加小编微信进群😊  

关于奇舞团
-----

奇舞团是 360 集团最大的大前端团队，非常重视人才培养，有工程师、讲师、翻译官、业务接口人、团队 Leader 等多种发展方向供员工选择，并辅以提供相应的技术力、专业力、通用力、领导力等培训课程。奇舞团以开放和求贤的心态欢迎各种优秀人才关注和加入奇舞团。  

![](https://mmbiz.qpic.cn/mmbiz_png/cAd6ObKOzEBLicibtcprJISN18FgTtg2N1ichPnMqRhicrP20VfwnC4vday7gtEoiaSynIH1bas4N5kgicliakrLdtT2Q/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)