> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/W5Wq-v0giBd_XTSzrcj0Eg)

介绍了在线上使用 SourceMap 进行调试的方法和常见问题。常见的使用姿势是通过浏览器的开发者工具进行本地调试，而在线上使用 SourceMap 则需要手动添加 SourceMap 地址。针对线上无法自动加载 SourceMap 的问题，可以尝试使用浏览器插件、Charles 进行转发或者私有静态服务托管 SourceMap。

正文从这开始～～

#### 1. 前言

##### 1.1 常见调试手段

平日开发过程中，大家是如何调试线上问题的呢？采样后的众生相如下：

*   酷酷派 ：我没什么线上问题！！
    
*   投机派 ：通过报错的特殊标识在源码中定位
    
*   学院派 ：使用 XSwitch 等代理工具将资源转发到本地
    
*   硬核派 ：直接看混淆后的代码一把梭
    
*   ... 等等等
    

等一下，还有没有人在用 SourceMap 调试啊？通过 SourceMap，我们可以在浏览器内，直接看到源码，而不是编译、压缩、混淆后的部署产物。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecgCaNBKiaIiajML1bqsmicxBMXN7ibjSaibKrUhe0dVPMX7zFZKY0kCTgd0Q/640?wx_fmt=other&from=appmsg)

##### 1.2 SourceMap 的常规用法

为了保证后续内容的理解，这里简单阐述下常见的使用姿势。

1.2.1 本地调试

本地启动项目后，可以在 Source 标签页看到三块面板：

*   File Navigator Pane：文件导航面板
    
*   Code Editor Pane：代码编辑面板
    
*   JavaScript Debugging Pane：JS 调试面板
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecydpiaHgblD8jBdxNdTliciaUjJppFkuZm3QnX0PwcoNfnibN0UOvxIiaCwg/640?wx_fmt=other&from=appmsg)

通过这些面板，我们可以直接找到希望调试的源码文件，打断点单步调试，查看上下文信息等。如果你是纯粹的 debugger 选手或 console.log 选手，只好表示 understand & respect。

[【第 3020 期】解读 SourceMap](http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651264485&idx=1&sn=a39ad26d77918a5e94b963866f43e5cb&chksm=bd48cc618a3f4577719ccb8fc7995e3c0c0aa1d8a2f9f0f1e96dc1e9455aa42ef37046ec320c&scene=21#wechat_redirect)  

1.2.2 线上排查

线上使用 SourceMap 则困难不少。通常我们的使用方式是：

1\ 发现控制台中报异常，根据 Chrome 提供的堆栈定位到报错文件

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecUMCCwmyWnef9491SjWBusyFUV0khic8zxvke7JAFTZZj9aKIYVJ2dZw/640?wx_fmt=other&from=appmsg)

2\ 在代码编辑面板中，右键 - Reveal in sidebar，在文件树中定位到部署文件

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDec4ZONKGo0Pa95dNmiaHqhJa0P2EW5TjsFj7feldEMr0rXR1lrtJicuo2w/640?wx_fmt=other&from=appmsg)

3\ 右键部署文件，点击 Copy link address，在控制台中查看资源的地址

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDect8yIQGXEOAYYo3QRQ1jWW6QfVDcRMAWls8elrDVRznictCiaZDjOfP9w/640?wx_fmt=other&from=appmsg)

4\ 确定构建产物对应的 SourceMap 资源地址（以下为内部发布平台示意）

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDeciaiadAK84cEoG0CWnbqIuCSHpnWsAoOLpPNRibwHJsNWuDx6iawIZ1eETA/640?wx_fmt=other&from=appmsg)

5\ 在代码编辑面板，右键 - Add source map，添加 SourceMap 地址

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDec46jhWmr1Ox3qjicbDeZNMibXZrRCOkZic0DYGsZzISnfpficf4YU4XWLHQ/640?wx_fmt=other&from=appmsg)

6\ 从已经映射到源码的堆栈信息再次进入，即可看到报错在源码中的位置

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecNG3AlRBBqOlDA3F7VicyfAhTD3NYPqabaxAbtsO4mNUIlaYiaHOeiaqag/640?wx_fmt=other&from=appmsg)

从上面的说明我们可以感受到：

*   Chrome DevTools 很强大
    
*   手动添加 SourceMap 很麻烦
    

#### 2. 问题探索

我们需要先将以下问题研究清楚：

*   浏览器是如何识别并加载 SourceMap 的？
    
*   为什么本地可以自动加载而线上不可以？
    
*   如何感知浏览器确实加载了 SourceMap？
    

##### 2.1 浏览器是如何识别并加载 SourceMap 的？

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecVIibVpJmic21OyQia2EFuibWDzDLiaofQIktpAKngiaguKPsO5OIUqCkZZ0w/640?wx_fmt=other&from=appmsg)

如果我们让构建工具开启了 SourceMap，例如 Webpack 的 devtools，源码经过构建过程（编译、混淆、压缩等）生成的部署代码会在底部增加一行注释，如下图所示：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecgOuiaGq6Ld0BS0vLJAicFsEG3ZrrJ5xpP9ia1qZbibER1VIR7kBXpgcwzA/640?wx_fmt=other&from=appmsg)

sourceMappingURL 告诉我们，当前资源文件 ConsoleSiteList.57ca29c2.chunk.js 对应的 SourceMap 文件的路径是 ConsoleSiteList.57ca29c2.chunk.js.map。这是相对路径的写法，也就是说，在本地启用的服务中，构建后的 chunk 和对应的 SourceMap 文件的地址分别为：

*   构建后的 chunk 地址：http://localhost:3000/ConsoleSiteList.57ca29c2.chunk.js
    
*   对应 SourceMap 地址：http://localhost:3000/ConsoleSiteList.57ca29c2.chunk.js.map
    

这样一来，浏览器就可以根据 sourceMappingURL 去自动加载 SourceMap，而不用苦哈哈的手动添加。

##### 2.2 为什么本地可以自动加载而线上不可以？

一般来讲，线上产物中会把 SourceMap 去除，除了为了加速构建过程，更重要的是避免有开发经验的人直接在浏览器中「阅读源码」。除了直接去除，企业内也常常利用内部的存储能力，将构建好的 SourceMap 资源转存到其他地方，这样一来，构建产物中的 sourceMappingURL 将无法正确指向 SourceMap 的资源地址，从而实现与直接去除接近的效果。

这样一来，在生产环境下 Chrome 根据 sourceMappingURL 相对路径的写法就只能寻址到不存在的 404，浏览器会加载不到需要的资源。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDeciab4hKicF0sFOFia85k6NUFx5yIgIfkYqzicHZiasN014e7hJSVlYf9hMpw/640?wx_fmt=other&from=appmsg)

##### 2.3 如何感知浏览器确实加载了 SourceMap？

我们可以打开 DevTools Network 标签页，使用过滤器过滤 .map 文件，我们发现什么都没有：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDeciben13uQibNDBACx8SMRD3QejoiaRxJ5CiauCzRlrsQCIC6G1GHboVygmw/640?wx_fmt=other&from=appmsg)

难道是 Chrome 加载 SourceMap 不需要通过网络请求？这显然不会，如果你有兴趣可以查看 issue，这其实是有意为之。不过我们仍然有其他手段看到 `.map` 文件的请求，打开 Charles 抓一把（涉及证书安装等操作本文不再赘述），就可以看到一堆迷途的请求：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecfTVH76NA7L6ic9mkLjlODnnLBP6V7qyY5AoAFuCxxJicNaDZfgBicKXUg/640?wx_fmt=other&from=appmsg)

你可能会困惑，既然 Chrome 实际发出了请求，Chrome 本身没提供可以查看的入口吗？打开 Developer Resources 标签页过滤出 SourceMap 相关的请求即可（也可以使用 net-internals）：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecN1C2gX45NNA7HPTnUIdPKcCKIDCRP1meOp2nKYDIA1m6baicm7aZ9jw/640?wx_fmt=other&from=appmsg)

##### 2.4 总结

浏览器根据构建产物中的注释 sourceMappingURL 尝试加载 SourceMap 文件，但线上构建时往往会将 SourceMap 删除（或上传到了其他地方），因此我们无法直接在线上使用 SourceMap。

#### 3. 解决方案

我们本质论一把：在线上加载到正确的 SourceMap 资源地址。

##### 3.1 尝试一：基于浏览器插件 Redirect

我们可以尝试使用 XSwitch 等工具重定向一把。假设我们的 SourceMap 资源转存到了 http://sourcemap.def.alibaba-inc.com 下，规则可以书写如下：

```
{   "proxy": [     [       "https://g.alicdn.com/(.*).map",       "https://sourcemap.def.alibaba-inc.com/sourcemap/$1.map",     ]   ], }
```

很快我们就会发现没有任何卵用。为了验证，笔者自行实现了基于 Manifest V3 的浏览器插件（使用 chrome.declarativeNetRequestAPI）和基于 Manifest V2 的浏览器插件（使用 chrome.webRequestAPI），也同样没有卵用。无论是 Charles 还是 Developer Resources 都会告诉你 SourceMap 的加载是 404，不过如果我们转发 Network 标签页中可见的请求是可以生效的。

> 补充：关于为什么如此，目前猜测是因为 Chrome Extension 无法感知浏览器级别的活动（可感知方式）。
> 
> 很遗憾暂时没有确凿的结论（笔者目前还没有阅读 Chromium 源码的功力 ）。能够确定的是：
> 
> *   只有在 DevTools 打开时才会加载 SourceMap（性能优化 & 用户并不需要）
>     
> *   DevTools 也是一种扩展，而扩展是无法拦截另一个扩展的请求的（安全性问题）
>     
> *   SourceMap 的加载不能从 Network 中看到而要从 Developer Resources 看到（这也是故意的设计）
>     
> 
> 基于以上信息，可以理解为 Chrome Extension 主要还是用于折腾 content 区域，而不是希望你 hack 浏览器。

总之很遗憾，我们不能通过 XSwitch 这样的插件，把 SourceMap 文件的请求地址转发到正确的位置。

##### 3.2 尝试二：基于 Charles Map Remote

因为 Chrome 检测到 sourceMappingURL 后会实际发起请求，所以使用 Charles 进行转发是肯定可行的。

系统菜单 - Tools - Map Remote：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDec1htLf6xmYOOHyI9U6Amibz3Q7cnsmjiars1GcZQdzOC2qlB7mvTuKCAA/640?wx_fmt=other&from=appmsg)

配置如下（映射逻辑，支持通配）：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecoDNzWovmD0xCZoGKIJXeDYt6fWoKBNrLzzB4XKXZ8IdqkvYPuDXTdQ/640?wx_fmt=other&from=appmsg)

重新刷新页面，从日志中可以看到转发生效了。请求的资源首先是 http://g.alicdn.com，然后按 Map Remote 的配置转发到了 http://sourcemap.def.alibaba-inc.com（这实际是个中间服务），然后再转发到 SourceMap 资源在 OSS 上的地址。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecHGOicMJwnV49jqDbicV4dxHLGt75X41SZibZPTSxEw48KQE5evrkVYjBA/640?wx_fmt=other&from=appmsg)

此时，我们打开 Source 面板，可以在左侧文件树中直接浏览源码。成了！

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecHiamrFj5VjQUljDahnDFiaKWbSshfsbLKEaSmxWWZicib5mYg786ZSWytw/640?wx_fmt=other&from=appmsg)

##### 3.3 尝试三：私有静态服务托管 SourceMap

在构建时将 SourceMap 上传至某个私有的地址（如 CDN 或 OSS），然后利用 Webpack 插件将 sourceMappingURL 改为该私有地址。这样开发人员在打开 DevTools 时，Chrome 将根据 sourceMappingURL 直接加载实际的 SourceMap 地址，而外部用户则完全被隔离。原理展示如下：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDec5wJ0whJmFzWU82rf4mFtHjrCfalC2KzlWZWAQgmpzI6yVNKsX9dyLA/640?wx_fmt=other&from=appmsg)

这种方式也是可行的。

##### 3.4 尝试四：从标准中寻找答案

尽管尝试二可以低成本走通，但毕竟是工具型方案，不是产品化方案。为了寻找更多可行的方案，笔者开始查找 SourceMap 的标准，不出所料，没有新鲜事。

我们可以看到以下约定：

*   SourceMap 文件在命名上与源文件保持一致，仅额外多出 .map 后缀
    
*   添加 Http Header：sourcemap，浏览器将识别并加载 SourceMap 文件
    
*   sourceMappingURL 注释的优先级比 HttpHeader sourcemap 的优先级高
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDec6pZpribz9mx2ZjcQEiccZokpmj0BURKggblrnItuX8uKRf7xEz6n83yA/640?wx_fmt=other&from=appmsg)

说试就试，我们以 Manifest V2 为例实现如下。可以看到，逻辑上就是匹配资源地址，转换成资源实际的地址，设置为 Header sourcemap 的值并返回。

```
const REGEX = /^.*g\.alicdn\.com\/(马上到！|aimake|muyang-test)\/(.*)\.js.*/; const TARGET_TPL = 'https://sourcemap.def.alibaba-inc.com/sourcemap/$1/$2.js.map?enableCatchAll=true'; chrome.webRequest.onHeadersReceived.addListener(   function(details) {     if (details.url.match(REGEX)) {       const targetUrl = details.url.replace(REGEX, TARGET_TPL);       const headerSourcemap = { name: "sourcemap", value: targetUrl }       const responseHeaders = details.responseHeaders.concat(headerSourcemap);       return { responseHeaders };     }     return { responseHeaders: details.responseHeaders };   },   // filters   {     urls: ['<all_urls>'],   },   // extraInfoSpec   ['blocking', 'responseHeaders', 'extraHeaders'] );
```

为了测试效果，我们直接加载已解压的扩展程序：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecGAZE2XIqFFFIyIicTtx9ibXrKGg8msibWyXmJCm003MMUibjptkx9v7ibWA/640?wx_fmt=other&from=appmsg)

然后写一个简单的测试资源，这里我们使用 Rollup 直接打个包。需要说明的是，sourcemap 需指定为 hidden，其效果等同 Webpack 的 hidden-source-map，此时会构建出 SourceMap 但不会有 sourceMappingURL 的注释。这样我们就可以保证只有 Http Header sourcemap 生效。

```
import nodeResolve from '@rollup/plugin-node-resolve'; // convert CommonJS modules to ES6 import commonjs from '@rollup/plugin-commonjs'; import nodePolyfills from 'rollup-plugin-node-polyfills'; import { babel } from '@rollup/plugin-babel'; import { terser } from 'rollup-plugin-terser'; export default [   {     input: 'src/index.js',     output: [       {         file: 'lib/bundle.js',         name: 'MyBundle',         format: 'umd',         sourcemap: 'hidden',         compact: true, // 开启压缩       },     ],     plugins: [       nodePolyfills(),       nodeResolve(),       commonjs(),       babel({         babelHelpers: 'runtime',         exclude: '**/node_modules/**',       }),       terser(),     ],   }, ];
```

构建测试资源，可以看到在线上生成了 SourceMap 文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecoBicfH8JENth5RevGm3wtAYN9JZHbay2TEHqVK01S4D1OS6vicHxQUqw/640?wx_fmt=other&from=appmsg)

构建测试页面，引用上述测试资源，开启测试插件后，刷新页面：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecLqkDiaib99f4k53p1vMVfyVdJCoLVpyjhL1DPK1WVrBZUlZt6Vj0u41w/640?wx_fmt=other&from=appmsg)

我们先来看我们实际加载的的资源的代码，是编译后的产物：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDec1HlsKN41C0fQ5gDxn1oBK7JEGryuxTic0E44loqvvCon9ELWHzVJMicg/640?wx_fmt=other&from=appmsg)

然后我们前往 Source 标签页，可以看到简单的几行源码，非常舒适：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/meG6Vo0Mevhiaakue7eKETP2VHRBtXDecl7S3erGHsgg542xAfaEsS1Riblo17VnqXWCdbpqtDERLeeHuyUbYibCA/640?wx_fmt=other&from=appmsg)

#### 4. 总结

如果希望使用 SourceMap 的方式调试线上，建议做如下改动：

*   Webpack devtools 配置使用 hidden-source-map，去除 sourceMappingURL 注释
    
*   开发浏览器插件，支持基于 Header SourceMap 的转发功能
    

这样，我们就能在线上使用 SourceMap 了。

关于本文  
作者：@落风  
原文：https://zhuanlan.zhihu.com/p/674981525

来源：前端早读课