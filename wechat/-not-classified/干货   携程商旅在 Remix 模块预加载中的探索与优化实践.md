> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/viEuEA9ew9xImEa5bWYWxw)

**作者简介**

19 组清风，携程资深前端开发工程师，负责商旅前端公共基础平台建设，关注 NodeJs、研究效能领域。

**团队热招岗位：[高级 / 资深前端开发工程师](https://careers.ctrip.com/index.html#/job-detail/MJ023723?empCode=63B2DCE68D1F209CFE62273781D7B52B)**  

本文总结了携程商旅大前端团队在将框架从 Remix 1.0 升级至 Remix 2.0 过程中遇到的问题和解决方案，特别是针对 Vite 在动态模块加载优化中引发的资源加载问题。文章详细探讨了 Vite 优化 DynamicImport 的机制，并介绍了团队为解决动态引入导致 404 问题所做的定制化处理。

*   一、引言  
    
*   二、模块懒加载
    
*   三、Vite 中如何处理懒加载模块
    
*   3.1 表象
    
*   3.2 机制
    
*   3.3 原理
    
*   四、商旅对于 DynamicImport 的内部改造
    
*   五、结尾
    

**一、引言**

去年，商旅大前端团队成功尝试将部分框架从 Next.js 迁移至 Remix，并显著提升了用户体验。由于 Remix 2.0 版本在构建工具和新功能方面进行了大量升级，我们最近决定将 Remix 1.0 版本同步升级至 Remix 2.0。

目前，商旅内部所有 Remix 项目在浏览器中均已使用 ESModule 进行资源加载。

在 Remix 1.0 版本中，我们通过在服务端渲染生成静态资源模板时，为所有静态资源动态添加 CDN 前缀来处理资源加载。简单来说，原始的 HTML 模板如下：

```
<script type="module">
  import init from 'assets/contact-GID3121.js';
  init();
  // ...
</script>
```

在每次生成模板时，我们会动态地为所有生成的 <script> 标签注入一个变量：

```
<script type="module">
  import init from 'https://aw-s.tripcdn.com/assets/contact-GID3121.js';
  init();
  // ...
</script>
```

在 Remix 1.0 下，这种工作机制完全满足我们的需求，并且运行良好。然而，在商旅从 Remix 1.0 升级到 2.0 后，我们发现某些 CSS 资源以及 modulePreload 的 JavaScript 资源仍然会出现 404 响应。

经过排查，我们发现这些 404 响应的静态资源实际上是由于在 1.0 中动态注入的 Host 变量未能生效。实际上，这是由于 Remix 升级过程中，Vite 对懒加载模块（DynamicImport）进行了优化，以提升页面性能。然而，这些优化手段在我们的应用中使用动态加载的静态资源时引发了新的问题。

这篇文章总结了我们在 Vite Preload 改造过程中的经验和心得。接下来，我们将从表象、实现和源码三个层面详细探讨 Vite 如何优化 DynamicImport，并进一步介绍携程商旅在 Remix 升级过程中对 Vite DynamicImport 所进行的定制化处理。

**二、模块懒加载**

懒加载（Lazy Load）是前端开发中的一种优化技术，旨在提高页面加载性能和用户体验。

懒加载的核心思想是在用户需要时才加载某些资源，而不是在页面初始加载时就加载所有资源。

除了常见的**图像懒加载、路由懒加载**外还有一种**模块懒加载**。

广义上路由懒加载可以看作是模块懒加载的子集。

所谓的模块懒加载表示页面中某些模块通过动态导入（dynamic import），在需要时才加载某些 JavaScript 模块。

目前绝大多数前端构建工具中会将通过动态导入的模块进行 [split chunk（代码拆分）](https://webpack.js.org/plugins/split-chunks-plugin/)，只有在需要时才加载这些模块的 JavaScript、Css 等静态资源内容。

我们以 React 来看一个简单的例子：

```
import React, { Suspense, useState } from 'react';

// 出行人组件，立即加载
const Travelers = () => {
  return <div>出行人组件内容</div>;
};

// 联系人组件，使用 React.lazy 进行懒加载
const Contact = React.lazy(() => import('./Contact'));

const App = () => {
  const [showContact, setShowContact] = useState(false);

  const handleAddContactClick = () => {
    setShowContact(true);
  };

  return (
    <div>
      <h1>页面标题</h1>

      {/* 出行人组件立即展示 */}
      <Travelers />

      {/* 添加按钮 */}
      <button onClick={handleAddContactClick}>添加联系人</button>

      {/* 懒加载的联系人组件 */}
      {showContact && (
        <Suspense fallback={<div>加载中...</div>}>
          <Contact />
        </Suspense>
      )}
    </div>
  );
};

export default App;
```

在这个示例中：

1）Travelers 组件是立即加载并显示的。

2）Contact 组件使用 React.lazy 以及 DynamicImport 进行懒加载，只有在用户点击 “添加联系人” 按钮后才会加载并显示。

3）Suspense 组件用于在懒加载的组件尚未加载完成时显示一个回退内容（例如 “加载中...”）。

这样，当用户点击 “添加联系人” 按钮时，Contact 组件才会被动态加载并显示在页面上。

所以上边的 Contact 联系人组件就可以认为是被当前页面懒加载。

**三、Vite 中如何处理懒加载模块**

**3.1 表象**

首先，我们先来通过 npm create vite@latest react -- --template react 创建一个基于 Vite 的 React 项目。

无论是 React、Vue 还是源生 JavaScript ，LazyLoad 并不局限于任何框架。这里为了方便演示我就使用 React 来举例。

想跳过简单 Demo 编写环节的小伙伴可以直接在这里 [Clone Demo 仓库](https://github.com/19Qingfeng/vite-preload-demo)。

首先我们通过 vite 命令行初始化一个代码仓库，之后我们对新建的代码稍做修改：

```
// app.tsx
import React, { Suspense } from 'react';

// 联系人组件，使用 React.lazy 进行懒加载
const Contact = React.lazy(() => import('./components/Contact'));

// 这里的手机号组件、姓名组件可以忽略
// 实际上特意这么写是为了利用 dynamicImport 的 splitChunk 特性
// vite 在构建时对于 dynamicImport 的模块是会进行 splitChunk 的
// 自然 Phone、Name 模块在构建时会被拆分为两个 chunk 文件
const Phone = () => import('./components/Phone');
const Name = () => import('./components/Name');
// 防止被 sharking 
console.log(Phone,'Phone')
console.log(Name,'Name')

const App = () => {

  return (
    <div>
      <h1>页面标题</h1>
      {/* 懒加载的联系人组件 */}
       (
        <Suspense fallback={<div>加载中...</div>}>
          <Contact />
        </Suspense>
      )
    </div>
  );
};

export default App;
```

```
// components/Contact.tsx
import React from 'react';
import Phone from './Phone';
import Name from './Name';

const Contact = () => {
  return <div>
    <h3>联系人组件</h3>
    {/* 联系人组件依赖的手机号以及姓名组件 */}
    <Phone></Phone>
    <Name></Name>
  </div>;
};

export default Contact;
```

```
// components/Phone.tsx
import React from 'react';

const Phone = () => {
  return <div>手机号组件</div>;
};

export default Phone;
```

```
// components/Name.tsx
import React from 'react';

const Name = () => {
  return <div>姓名组件</div>;
};

export default Name;
```

上边的 Demo 中，我们在 App.tsx 中编写了一个简单的页面。

页面中使用 dynamicImport 引入了三个模块，分别为：

*   Contact 联系人模块
    
*   Phone 手机模块
    
*   Name 姓名模块
    

对于 App.tsx 中动态引入的 Phone 和 Name 模块，我们仅仅是利用动态引入实现在构建时的代码拆分。所以这里在 App.tsx 中完全可以忽略这两个模块。

简单来说 vite 中对于使用 dynamicImport 的模块会在构建时单独拆分成为一个 chunk （通常情况下一个 chunk 就代表构建后的一个单独 javascript 文件）。

重点在于 App.tsx 中动态引入的联系人模块，我们在 App.tsx 中使用 dynamicImport 引入了 Contact 模块。

同时，在 Contact 模块中我们又引入了 Phone、Name 两个模块。

由于在 App.tsx 中我们已经使用 dynamicImport 将 Phone 和 Name 强制拆分为两个独立的 chunk，自然 Contact 在构建时相当于依赖了 Phone 和 Name 这两个模块的独立 chunk。

此时，让我们直接直接运行 npm run build && npm run start 启动应用（只有在生产构建模式下才会开启对于 dynamicImport 的优化）。

打开浏览器后我们会发现，在 head 标签中多出了 3 个 moduleprealod 的标签：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kEeDgfCVf1eJyNTrrVpeUJzPLribdsibGvGPDaa3a4BTDQedMSlDjibib8N6CKX8ZNuOlQVIiagowVQBkHBc56mibCjw/640?wx_fmt=jpeg&from=appmsg)

简单来说，这便是 vite 对于使用 dynamicImport 异步引入模块的优化方式，**默认情况下 Vite 会对于使用 dynamicImport 的模块收集当前模块的依赖进行 modulepreload 进行预加载。**

当然，对于 dynamicImport，Vite 内部不仅对 JS 模块进行了依赖模块的 modulePreload 处理，同时也对 dynamicImport 依赖的 CSS 模块进行了处理。

不过，让我们先聚焦于 dynamicImport 的 JavaScript 优化上吧。

**3.2 机制**

在探讨源码实现之前，我们先从编译后的 JavaScript 代码角度来分析 Vite 对 DynamicImport 模块的优化方式。

首先，我们先查看浏览器 head 标签中的 modulePreload 标签可以发现，声明 modulePreload 的资源分别为 Contact 联系人模块、Phone 手机模块以及 Name 姓名模块。

从表现上来说，简单来说可以用这段话来描述 Vite 内部对于动态模块加载的优化：

项目在构建时，首次访问页面会加载 App.tsx 对应生成的 chunk 代码。App.tsx 对应的页面在渲染时会依赖 dynamicImport 的 Contact 联系人模块。

此时，Vite 内部会对使用 dynamicImport 的 Contact 进行模块分析，发现联系人模块内部又依赖了 Phone 以及 Name 两个 chunk。

简单来讲我们网页的 JS 加载顺序可以用下面的草图来表达：

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kEeDgfCVf1cYMxDsCym4U0h3ezrVOG43w6az7z46G6nDL8hGB67FjYicVX6LdnlGo9PkjfaAbhFL6AxY0Y6Hibmg/640?wx_fmt=jpeg)

App.tsx 构建后生成的 Js Assets 会使用 dynamicImport 加载 Contact.tsx 对应的 assets。

而 Contact.tsx 中则依赖了 name-[hash].jsx 和 phone-[hash].js 这两个 assets。

Vite 对于 App.tsx 进行静态扫描时，会发现内部存在使用 dynamicImport 语句。此时会将所有的 dynamicImport 语句进行优化处理，简单来说会将

```
const Contact = React.lazy(() => import('./components/Contact'))
```

转化为

```
const Contact = React.lazy(() =>
    __vitePreload(() => import('./Contact-BGa5hZNp.js'), __vite__mapDeps([0, 1, 2])))
```

*   __vitePreload 是构建时 Vite 对于使用 dynamicImport 插入的动态加载的优化方法。
    
*   __vite__mapDeps([0, 1, 2]) 则是传递给 __vitePreload 的第二个参数，它表示当前动态引入的 dynamicImport 包含的所有依赖 chunk，也就是 Contact(自身)、Phone、Name 三个 chunk。
    

简单来说 __vitePreload 方法首先会将 __vite__mapDeps 中所有依赖的模块使用 document.head.appendChild 插入所有 modulePreload 标签之后返回真实的 import('./Contact-BGa5hZNp.js')。

最终，Vite 通过该方式就会对于动态模块内部引入的所有依赖模块实现对于**动态加载模块的深层 chunk 使用 modulePreload 进行动态加载优化。**

**3.3 原理**

在了解了 Vite 内部对 modulePreload 的基本原理和机制后，接下来我们将深入探讨 Vite 的构建过程，详细分析其动态模块加载优化的实现方式。

Vite 在构建过程中对 dynamicImport 的优化主要体现在 [vite:build-import-analysis](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/importAnalysisBuild.ts) 插件中。

接下来，我们将通过分析 build-import-analysis 插件的源代码，深入探讨 Vite 是如何实现 modulePreload 优化的。

**3.3.1 扫描 / 替换模块代码 - transform**

首先，build-import-analysis 中存在 [transform hook](https://rollupjs.org/plugin-development/#transform)。

简单来说，transform 钩子用于在每个模块被加载和解析之后，**对模块的代码进行转换**。这个钩子允许我们对模块的内容进行修改或替换，比如进行代码转换、编译、优化等操作。

上边我们讲过，vite 在构建时扫描源代码中的所有 dynamicImport 语句同时会将所有 dynamicImport 语句增加 __vitePreload 的 polyfill 优化方法。

所谓的 transform Hook 就是扫描每一个模块，对于模块内部的所有 dynamicImport 使用 __vitePreload 进行包裹。

```
export const isModernFlag = `__VITE_IS_MODERN__`
export const preloadMethod = `__vitePreload`
export const preloadMarker = `__VITE_PRELOAD__`
export const preloadBaseMarker = `__VITE_PRELOAD_BASE__`

//...

  // transform hook 会在每一个 module 上执行
    async transform(source, importer) {
    
      // 如果当前模块是在 node_modules 中，且代码中没有任何动态导入语法，则直接返回。不进行任何处理
      if (isInNodeModules(importer) && !dynamicImportPrefixRE.test(source)) {
        return
      }
      
      // 初始化 es-module-lexer
      await init

      let imports: readonly ImportSpecifier[] = []
      try {
        // 调用 es-module-lexer 的 parse 方法，解析 source 中所有的 import 语法
        imports = parseImports(source)[0]
      } catch (_e: unknown) {
        const e = _e as EsModuleLexerParseError
        const { message, showCodeFrame } = createParseErrorInfo(
          importer,
          source,
        )
        this.error(message, showCodeFrame ? e.idx : undefined)
      }

      if (!imports.length) {
        return null
      }

      // environment.config.consumer === 'client'  && !config.isWorker && !config.build.lib
      // 客户端构建时（非 worker 非 lib 模式下）为 true
      const insertPreload = getInsertPreload(this.environment)
      // when wrapping dynamic imports with a preload helper, Rollup is unable to analyze the
      // accessed variables for treeshaking. This below tries to match common accessed syntax
      // to "copy" it over to the dynamic import wrapped by the preload helper.
      
      // 当使用预加载助手(__vite_preload 方法)包括 dynamicImport 时
      // Rollup 无法分析访问的变量是否存在 TreeShaking
      // 下面的代码主要作用为试图匹配常见的访问语法，以将其“复制”到由预加载帮助程序包装的动态导入中
      // 例如：`const {foo} = await import('foo')` 会被转换为 `const {foo} = await __vitePreload(async () => { const {foo} = await import('foo');return {foo}}, ...)` 简单说就是防止直接使用 __vitePreload 包裹后的模块无法被 TreeShaking
      const dynamicImports: Record<
        number,
        { declaration?: string; names?: string }
      > = {}

      if (insertPreload) {
        let match
        while ((match = dynamicImportTreeshakenRE.exec(source))) {
          /* handle `const {foo} = await import('foo')`
           *
           * match[1]: `const {foo} = await import('foo')`
           * match[2]: `{foo}`
           * import end: `const {foo} = await import('foo')_`
           *                                               ^
           */
          if (match[1]) {
            dynamicImports[dynamicImportTreeshakenRE.lastIndex] = {
              declaration: `const ${match[2]}`,
              names: match[2]?.trim(),
            }
            continue
          }
          
          /* handle `(await import('foo')).foo`
           *
           * match[3]: `(await import('foo')).foo`
           * match[4]: `.foo`
           * import end: `(await import('foo'))`
           *                                  ^
           */
          if (match[3]) {
            let names = /\.([^.?]+)/.exec(match[4])?.[1] || ''
            // avoid `default` keyword error
            if (names === 'default') {
              names = 'default: __vite_default__'
            }
            dynamicImports[
              dynamicImportTreeshakenRE.lastIndex - match[4]?.length - 1
            ] = { declaration: `const {${names}}`, names: `{ ${names} }` }
            continue
          }
          
          /* handle `import('foo').then(({foo})=>{})`
           *
           * match[5]: `.then(({foo})`
           * match[6]: `foo`
           * import end: `import('foo').`
           *                           ^
           */
          const names = match[6]?.trim()
          dynamicImports[
            dynamicImportTreeshakenRE.lastIndex - match[5]?.length
          ] = { declaration: `const {${names}}`, names: `{ ${names} }` }
        }
      }

      let s: MagicString | undefined
      const str = () => s || (s = new MagicString(source))
      let needPreloadHelper = false

      // 遍历当前模块中的所有 import 引入语句
      for (let index = 0; index < imports.length; index++) {
        const {
          s: start,
          e: end,
          ss: expStart,
          se: expEnd,
          d: dynamicIndex,
          a: attributeIndex,
        } = imports[index]
        
        // 判断是否为 dynamicImport 
        const isDynamicImport = dynamicIndex > -1
        
        // 删除 import 语句的属性导入
        // import { someFunction } from './module.js' with { type: 'json' };
        // => import { someFunction } from './module.js';
        if (!isDynamicImport && attributeIndex > -1) {
          str().remove(end + 1, expEnd)
        }
        
        // 如果当前 import 语句为 dynamicImport 且需要插入预加载助手
        if (
          isDynamicImport &&
          insertPreload &&
          // Only preload static urls
          (source[start] === '"' ||
            source[start] === "'" ||
            source[start] === '`')
        ) {
          needPreloadHelper = true
          // 获取本次遍历到的 dynamic 的 declaration 和 names
          const { declaration, names } = dynamicImports[expEnd] || {}

          // 之后的逻辑就是纯字符串拼接，将 __vitePreload(preloadMethod) 变量进行拼接
          // import ('./Phone.tsx')
          // __vitePreload(
          //   async () => {
          //     const { Phone } = await import('./Phone.tsx')
          //     return { Phone }
          //   },
          //   __VITE_IS_MODERN__ ? __VITE_PRELOAD__ : void 0,
          // )
          
          if (names) {
            /* transform `const {foo} = await import('foo')`
             * to `const {foo} = await __vitePreload(async () => { const {foo} = await import('foo');return {foo}}, ...)`
             *
             * transform `import('foo').then(({foo})=>{})`
             * to `__vitePreload(async () => { const {foo} = await import('foo');return { foo }},...).then(({foo})=>{})`
             *
             * transform `(await import('foo')).foo`
             * to `__vitePreload(async () => { const {foo} = (await import('foo')).foo; return { foo }},...)).foo`
             */
            str().prependLeft(
              expStart,
              `${preloadMethod}(async () => { ${declaration} = await `,
            )
            str().appendRight(expEnd, `;return ${names}}`)
          } else {
            str().prependLeft(expStart, `${preloadMethod}(() => `)
          }

          str().appendRight(
            expEnd,
            // renderBuiltUrl 和 isRelativeBase 可以参考 vite base 配置以及 renderBuildUrl 配置
            `,${isModernFlag}?${preloadMarker}:void 0${
              renderBuiltUrl || isRelativeBase ? ',import.meta.url' : ''
            })`,
          )
        }
      }

      // 如果该模块标记饿了 needPreloadHelper 并且当前执行环境 insertPreload 为 true，同时该模块代码中不存在 preloadMethod 的引入，则在该模块的顶部引入 preloadMethod
      if (
        needPreloadHelper &&
        insertPreload &&
        !source.includes(`const ${preloadMethod} =`)
      ) {
        str().prepend(`import { ${preloadMethod} } from "${preloadHelperId}";`)
      }

      if (s) {
        return {
          code: s.toString(),
          map: this.environment.config.build.sourcemap
            ? s.generateMap({ hires: 'boundary' })
            : null,
        }
      }
    },
```

上面的代码展示了 build-import-analysis 插件中 transform 钩子的全部内容，并在关键环节添加了相应的注释说明。简而言之，transform 钩子的作用可以归纳为以下几点：

**1）扫描动态导入语句**：在每个模块中使用 es-module-lexer 扫描所有的 dynamicImport 语句。例如，对于 app.tsx 文件，会扫描到 import ('./Contact.tsx') 这样的动态导入语句。

**2）注入预加载 Polyfill**：对于所有的动态导入语句，使用 magic-string 克隆一份源代码，然后结合第一步扫描出的 dynamicImport 语句进行字符串拼接，注入预加载 Polyfill。例如，import ('./Contact.tsx') 经过 transform 钩子处理后会被转换为：

```
__vitePreload(
            async () => {
              const { Contact } = await import('./Contact.tsx')
              return { Contact }
            },
            __VITE_IS_MODERN__ ? __VITE_PRELOAD__ : void 0,
            ''
          )
```

其中，__VITE_IS_MODERN__ 和 __VITE_PRELOAD__ 是 Vite 内部的固定字符串占位符，在 transform 钩子中不会处理这两个字符串变量，目前仅用作占位。而 __vitePreload 则是外层包裹的 Polyfill 方法。

3）**引入预加载方法**：transform 钩子会检查该模块中是否引入了 preloadMethod (__vitePreload)，如果未引入，则会在模块顶部添加对 preloadMethod 的引入。例如：

```
import { ${preloadMethod} } from "${preloadHelperId}"
// ...
```

经过 vite:build-import-analysis 插件的 transform 钩子处理后，动态导入的优化机制已经初具雏形。

**3.3.2 增加 preload 辅助语句 - resolveId/load**

接下来，我们将针对 transform 钩子中添加的 import {${preloadMethod} } from "${preloadHelperId}" 语句进行分析。

当转换后的模块中不存在 preloadMethod 声明时，Vite 会在构建过程中自动插入 preloadMethod 的引入语句。当模块内部引入 preloadHelperId 时，Vite 会在解析该模块（例如 App.tsx）的过程中，通过 moduleParse 钩子逐步分析 App.tsx 中的依赖关系。

由于我们在 App.tsx 顶部插入了 import {${preloadMethod} } from "${preloadHelperId}" 语句，因此在 App.tsx 的 moduleParse 阶段，Vite 会递归分析 App.tsx 中引入的 preloadHelperId 模块。

关于 Rollup Plugin 执行顺序不了解的同学，可以参考下面这张图。

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kEeDgfCVf1eJyNTrrVpeUJzPLribdsibGvscvkKT3niaibLKFVc2x9qxrVfO1biahPTt9T2iacxFjWaGGDaDkyfAMxwg/640?wx_fmt=jpeg&from=appmsg)

此时 vite:build-import-analysis 插件的 resolveId 和 load hook 就会派上用场：

```
// ...

    resolveId(id) {
      if (id === preloadHelperId) {
        return id
      }
    },

    load(id) {
      // 当检测到引入的模块路径为 ${preloadHelperId} 时
      if (id === preloadHelperId) {
      
        // 判断是否开启了 modulePreload 配置
        const { modulePreload } = this.environment.config.build
        
        // 判断是否需要 polyfill
        const scriptRel =
          modulePreload && modulePreload.polyfill
            ? `'modulepreload'`
            : `/* @__PURE__ */ (${detectScriptRel.toString()})()`

        // 声明对于 dynamicImport 模块深层依赖的路径处理方式
        // 比如对于使用了 dynamicImport 引入的 Contact 模块，模块内部又依赖了 Phone 和 Name 模块 

        // 这里 assetsURL 方法就是在执行对于 Phone 和 Name 模块 preload 时是否需要其他特殊处理

        // 关于 renderBuiltUrl 可以参考 Vite 文档说明 https://vite.dev/guide/build.html#advanced-base-options

        // 我们暂时忽略 renderBuiltUrl ，因为我们构建时并未传入该配置
        
        // 自然 assetsURL = `function(dep) { return ${JSON.stringify(config.base)}+dep }`
        const assetsURL =
          renderBuiltUrl || isRelativeBase
            ? // If `experimental.renderBuiltUrl` is used, the dependencies might be relative to the current chunk.
              // If relative base is used, the dependencies are relative to the current chunk.
              // The importerUrl is passed as third parameter to __vitePreload in this case
              `function(dep, importerUrl) { return new URL(dep, importerUrl).href }`
            : // If the base isn't relative, then the deps are relative to the projects `outDir` and the base
              // is appended inside __vitePreload too.
              `function(dep) { return ${JSON.stringify(config.base)}+dep }`
        
        // 声明 assetsURL 方法，声明 preloadMethod 方法
        const preloadCode = `const scriptRel = ${scriptRel};const assetsURL = ${assetsURL};const seen = {};export const ${preloadMethod} = ${preload.toString()}`
        return { code: preloadCode, moduleSideEffects: false }
      }
    },

 
// ...
function detectScriptRel() {
  const relList =
    typeof document !== 'undefined' && document.createElement('link').relList
  return relList && relList.supports && relList.supports('modulepreload')
    ? 'modulepreload'
    : 'preload'
}

declare const scriptRel: string
declare const seen: Record<string, boolean>
function preload(
  baseModule: () => Promise<unknown>,
  deps?: string[],
  importerUrl?: string,
) {
  let promise: Promise<PromiseSettledResult<unknown>[] | void> =
    Promise.resolve()
  // @ts-expect-error __VITE_IS_MODERN__ will be replaced with boolean later
  if (__VITE_IS_MODERN__ && deps && deps.length > 0) {
    const links = document.getElementsByTagName('link')
    const cspNonceMeta = document.querySelector<HTMLMetaElement>(
      'meta[property=csp-nonce]',
    )
    // `.nonce` should be used to get along with nonce hiding (https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce#accessing_nonces_and_nonce_hiding)
    // Firefox 67-74 uses modern chunks and supports CSP nonce, but does not support `.nonce`
    // in that case fallback to getAttribute
    const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute('nonce')

    promise = Promise.allSettled(
      deps.map((dep) => {
        // @ts-expect-error assetsURL is declared before preload.toString()
        dep = assetsURL(dep, importerUrl)
        if (dep in seen) return
        seen[dep] = true
        const isCss = dep.endsWith('.css')
        const cssSelector = isCss ? '[rel="stylesheet"]' : ''
        const isBaseRelative = !!importerUrl
        
        // check if the file is already preloaded by SSR markup
        if (isBaseRelative) {
          // When isBaseRelative is true then we have `importerUrl` and `dep` is
          // already converted to an absolute URL by the `assetsURL` function
          for (let i = links.length - 1; i >= 0; i--) {
            const link = links[i]
            // The `links[i].href` is an absolute URL thanks to browser doing the work
            // for us. See https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes:idl-domstring-5
            if (link.href === dep && (!isCss || link.rel === 'stylesheet')) {
              return
            }
          }
        } else if (
          document.querySelector(`link[href="${dep}"]${cssSelector}`)
        ) {
          return
        }

        const link = document.createElement('link')
        link.rel = isCss ? 'stylesheet' : scriptRel
        if (!isCss) {
          link.as = 'script'
        }
        link.crossOrigin = ''
        link.href = dep
        if (cspNonce) {
          link.setAttribute('nonce', cspNonce)
        }
        document.head.appendChild(link)
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener('load', res)
            link.addEventListener('error', () =>
              rej(new Error(`Unable to preload CSS for ${dep}`)),
            )
          })
        }
      }),
    )
  }

  function handlePreloadError(err: Error) {
    const e = new Event('vite:preloadError', {
      cancelable: true,
    }) as VitePreloadErrorEvent
    e.payload = err
    window.dispatchEvent(e)
    if (!e.defaultPrevented) {
      throw err
    }
  }

  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== 'rejected') continue
      handlePreloadError(item.reason)
    }
    return baseModule().catch(handlePreloadError)
  })
}
```

对于引入 preloadHelperId 的模块，build-import-analysis 会在 resolveId 和 load 阶段识别并添加 preload 方法的静态声明。preload 方法支持三个参数：

1）第一个参数是原始的模块引入语句，例如 import('./Phone')。

2）第二个参数是被 dynamicImport 加载的模块的所有依赖，这些依赖需要被添加为 modulepreload。

3）第三个参数是 import.meta.url（生成的资源的 JavaScript 路径）或空字符串，这取决于 renderBuiltUrl 或 isRelativeBase 的值。在这里，我们并没有传入 renderBuiltUrl 或 isRelativeBase。

也就说，在 vite:build-import-analysis 的 resolveId 以及 load 阶段为会存在 __vite_preload 的模块添加对于 preloadMethod 的声明。

**3.3.3 开启预加载优化 - renderChunk**

经过了 resolveId、load 以及 transform 阶段的分析，build-import-analysis 插件已经可以为使用了 dynamicImport 的模块中包裹 __vitePreload 的方法调用以及在模块内部引入 __vitePreload 的声明。

renderChunk 是 Rollup（Vite） 插件钩子之一，用于在生成每个代码块（chunk）时进行自定义处理。它的主要功能是在代码块被转换为最终输出格式之前，对其进行进一步的操作或修改。

build-import-analysis 会在渲染每一个 chunk 时，通过 renderChunk hook 来最终确定是否需要开启 modulePrealod 。

```
// ...

    renderChunk(code, _, { format }) {
      // make sure we only perform the preload logic in modern builds.
      if (code.indexOf(isModernFlag) > -1) {
        const re = new RegExp(isModernFlag, 'g')
        const isModern = String(format === 'es')
        if (this.environment.config.build.sourcemap) {
          const s = new MagicString(code)
          let match: RegExpExecArray | null
          while ((match = re.exec(code))) {
            s.update(match.index, match.index + isModernFlag.length, isModern)
          }
          return {
            code: s.toString(),
            map: s.generateMap({ hires: 'boundary' }),
          }
        } else {
          return code.replace(re, isModern)
        }
      }
      return null
    },
```

简单来说，在渲染每一个时会判断源代码中是否存在 isModernFlag （code.indexOf(isModernFlag) > -1 ）：

*   如果存在，则会判断生成的 chunk 是否为 esm 格式。如果是的话，则会将 isModernFlag 全部替换为 true，否则会全部替换为 false。
    
*   如果不存在则不会进行任何处理。
    

isModernFlag 这个标记位，在上边的 transform hook 中我们已经生成了：

```
// transform 后对于 dynamicImport 的处理
__vitePreload(
  async () => {
    const { Contact } = await import('./Contact.tsx')
    return { Contact }
  },
  __VITE_IS_MODERN__ ? __VITE_PRELOAD__ : void 0,
)
```

此时，经过 renderChunk 的处理会变为：

```
__vitePreload(
  async () => {
    const { Contact } = await import('./Contact.tsx')
    return { Contact }
  },
  true ? __VITE_PRELOAD__ : void 0,
  ''
)
```

**3.3.4 寻找 / 加载需要预加载模块 - generateBundle**

经过上述各个阶段的处理，vite 内部会将 import ('Contact.tsx') 转化为：

```
__vitePreload(
  async () => {
    const { Contact } = await import('./Contact.tsx')
    return { Contact }
  },
  __VITE_PRELOAD__,
  ''
)
```

对于 __vitePreload 方法，唯一尚未解决的变量是 __VITE_PRELOAD__。  

如前所述，Vite 内部对动态导入（dynamicImport）的优化会对被动态加载模块的所有依赖进行 modulePreload。在 __vitePreload 方法中，第一个参数是原始被动态加载的 baseModule，第二个参数目前是占位符 __VITE_PRELOAD__，第三个参数是对引入资源路径的额外处理参数，在当前配置下为空字符串。

结合 preload 方法的定义，可以推测接下来的步骤是将 __VITE_PRELOAD__ 转化为每个 dynamicImport 的深层依赖，从而使 preload 方法在加载 baseModule 时能够对所有依赖进行 modulePreload。

generateBundle 是 Rollup(Vite) 插件钩子之一，用于在生成最终输出文件之前对整个构建结果进行处理。

它的主要作用是在所有代码块（chunks）和资产（assets）都生成之后，对这些输出进行进一步的操作或修改。

这里 build-import-analysis 插件中的 generateBundle 钩子正是用于实现对于最终生成的 assets 中的内容进行修改，寻找当前生成的 assets 中所有 dynamicImport 的深层依赖文件从而替换 __VITE_PRELOAD__ 变量。

```
generateBundle({ format }, bundle) {

      // 检查生成模块规范如果不为 es 则直接返回
      if (format !== 'es') {
        return
      }


      // 如果当前环境并为开启 modulePreload 的优化
      // if (!getInsertPreload(this.environment)) 中的主要目的是在预加载功能未启用的情况下，移除对纯 CSS 文件的无效 dynamicImport 导入，以确保生成的包（bundle）中没有无效的导入语句，从而避免运行时错误。

      // 在 Vite 中，纯 CSS 文件可能会被单独处理，并从最终的 JavaScript 包中移除。这是因为 CSS 通常会被提取到单独的 CSS 文件中，以便浏览器可以并行加载 CSS 和 JavaScript 文件，从而提高加载性能。
      // 当纯 CSS 文件被移除后，任何对这些 CSS 文件的导入语句将变成无效的导入。如果不移除这些无效的导入语句，运行时会出现错误，因为这些 CSS 文件已经不存在于生成的包中。
      
      // 默认情况下，modulePreload 都是开启的。同时，我们的 Demo 中并不涉及 CSS 文件的处理，所以这里的逻辑并不会执行。
      if (!getInsertPreload(this.environment)) {
        const removedPureCssFiles = removedPureCssFilesCache.get(config)
        if (removedPureCssFiles && removedPureCssFiles.size > 0) {
          for (const file in bundle) {
            const chunk = bundle[file]
            if (chunk.type === 'chunk' && chunk.code.includes('import')) {
              const code = chunk.code
              let imports!: ImportSpecifier[]
              try {
                imports = parseImports(code)[0].filter((i) => i.d > -1)
              } catch (e: any) {
                const loc = numberToPos(code, e.idx)
                this.error({
                  name: e.name,
                  message: e.message,
                  stack: e.stack,
                  cause: e.cause,
                  pos: e.idx,
                  loc: { ...loc, file: chunk.fileName },
                  frame: generateCodeFrame(code, loc),
                })
              }

              for (const imp of imports) {
                const {
                  n: name,
                  s: start,
                  e: end,
                  ss: expStart,
                  se: expEnd,
                } = imp
                let url = name
                if (!url) {
                  const rawUrl = code.slice(start, end)
                  if (rawUrl[0] === `"` && rawUrl[rawUrl.length - 1] === `"`)
                    url = rawUrl.slice(1, -1)
                }
                if (!url) continue

                const normalizedFile = path.posix.join(
                  path.posix.dirname(chunk.fileName),
                  url,
                )
                if (removedPureCssFiles.has(normalizedFile)) {
                  // remove with Promise.resolve({}) while preserving source map location
                  chunk.code =
                    chunk.code.slice(0, expStart) +
                    `Promise.resolve({${''.padEnd(expEnd - expStart - 19, ' ')}})` +
                    chunk.code.slice(expEnd)
                }
              }
            }
          }
        }
        return
      }
      const buildSourcemap = this.environment.config.build.sourcemap
      const { modulePreload } = this.environment.config.build

      // 遍历 bundle 中的所有 assets 
      for (const file in bundle) {
        const chunk = bundle[file]
        // 如果生成的文件类型为 chunk 同时源文件内容中包含 preloadMarker
        if (chunk.type === 'chunk' && chunk.code.indexOf(preloadMarker) > -1) {
          const code = chunk.code
          let imports!: ImportSpecifier[]
          try {
            // 获取模块中所有的动态 dynamicImport 语句
            imports = parseImports(code)[0].filter((i) => i.d > -1)
          } catch (e: any) {
            const loc = numberToPos(code, e.idx)
            this.error({
              name: e.name,
              message: e.message,
              stack: e.stack,
              cause: e.cause,
              pos: e.idx,
              loc: { ...loc, file: chunk.fileName },
              frame: generateCodeFrame(code, loc),
            })
          }

          const s = new MagicString(code)
          const rewroteMarkerStartPos = new Set() // position of the leading double quote

          const fileDeps: FileDep[] = []
          const addFileDep = (
            url: string,
            runtime: boolean = false,
          ): number => {
            const index = fileDeps.findIndex((dep) => dep.url === url)
            if (index === -1) {
              return fileDeps.push({ url, runtime }) - 1
            } else {
              return index
            }
          }

          if (imports.length) {
            // 遍历当前模块中所有的 dynamicImport 语句
            for (let index = 0; index < imports.length; index++) {
              const {
                n: name,
                s: start,
                e: end,
                ss: expStart,
                se: expEnd,
              } = imports[index]
              // check the chunk being imported
              let url = name
              if (!url) {
                const rawUrl = code.slice(start, end)
                if (rawUrl[0] === `"` && rawUrl[rawUrl.length - 1] === `"`)
                  url = rawUrl.slice(1, -1)
              }
              const deps = new Set<string>()
              let hasRemovedPureCssChunk = false

              let normalizedFile: string | undefined = undefined

              if (url) {
                // 获取当前动态导入 dynamicImport 的模块路径（相较于应用根目录而言）
                normalizedFile = path.posix.join(
                  path.posix.dirname(chunk.fileName),
                  url,
                )

                const ownerFilename = chunk.fileName
                // literal import - trace direct imports and add to deps
                const analyzed: Set<string> = new Set<string>()
                const addDeps = (filename: string) => {
                  if (filename === ownerFilename) return
                  if (analyzed.has(filename)) return
                  analyzed.add(filename)
                  const chunk = bundle[filename]
                  if (chunk) {
                    // 将依赖添加到 deps 中 
                    deps.add(chunk.fileName)

                    // 递归当前依赖 chunk 的所有 import 静态依赖
                    if (chunk.type === 'chunk') {
                      // 对于所有 chunk.imports 进行递归 addDeps 加入到 deps 中
                      chunk.imports.forEach(addDeps)

                      // 遍历当前代码块导入的 CSS 文件
                      // 确保当前代码块导入的 CSS 在其依赖项之后加载。
                      // 这样可以防止当前代码块的样式被意外覆盖。
                      chunk.viteMetadata!.importedCss.forEach((file) => {
                        deps.add(file)
                      })
                    }
                  } else {
                    // 如果当前依赖的 chunk 并没有被生成，检查当前 chunk 是否为纯 CSS 文件的 dynamicImport 

                    const removedPureCssFiles =
                      removedPureCssFilesCache.get(config)!
                    const chunk = removedPureCssFiles.get(filename)

                    // 如果是的话，则会将 css 文件加入到依赖中
                    // 同时更新 dynamicImport 的 css 为 promise.resolve({}) 防止找不到 css 文件导致的运行时错误
                    if (chunk) {
                      if (chunk.viteMetadata!.importedCss.size) {
                        chunk.viteMetadata!.importedCss.forEach((file) => {
                          deps.add(file)
                        })
                        hasRemovedPureCssChunk = true
                      }

                      s.update(expStart, expEnd, 'Promise.resolve({})')
                    }
                  }
                }


                // 将当前 dynamicImport 的模块路径添加到 deps 中
                // 比如 import('./Contact.tsx') 会将 [root]/assets/Contact.tsx 添加到 deps 中
                addDeps(normalizedFile)
              }

              // 寻找当前 dynamicImport 语句中的 preloadMarker 的位置
              let markerStartPos = indexOfMatchInSlice(
                code,
                preloadMarkerRE,
                end,
              )

              // 边界 case 处理，我们可以忽略这个判断。找不到的清咖滚具体参考相关 issue #3051
              if (markerStartPos === -1 && imports.length === 1) {
                markerStartPos = indexOfMatchInSlice(code, preloadMarkerRE)
              }


              // 如果找到了 preloadMarker
              // 判断 vite 构建时是否开启了 modulePreload
              // 如果开启则将当前 dynamicImport 的所有依赖项添加到 deps 中
              // 否则仅会添加对应 css 文件
              if (markerStartPos > 0) {
                // the dep list includes the main chunk, so only need to reload when there are actual other deps.
                let depsArray =
                  deps.size > 1 ||
                  // main chunk is removed
                  (hasRemovedPureCssChunk && deps.size > 0)
                    ? modulePreload === false
                      ? 
                        // 在 Vite 中，CSS 依赖项的处理机制与模块预加载（module preloads）的机制是相同的。
                        // 所以，及时没有开启 dynamicImport 的 modulePreload 优化，仍然需要通过 vite_preload 处理 dynamicImport 的 CSS 依赖项。
                        [...deps].filter((d) => d.endsWith('.css'))
                      : [...deps]
                    : []

                 // 具体可以参考 https://vite.dev/config/build-options.html#build-modulepreload
                 // resolveDependencies 是一个函数，用于确定给定模块的依赖关系。在 Vite 的构建过程中，Vite 会调用这个函数来获取每个模块的依赖项，并生成相应的预加载指令。

                 // 在 vite 构建过程中我们可以通过 resolveDependencies 函数来自定义修改模块的依赖关系从而响应 preload 的声明

                 // 我们这里并没有开启，所以为 undefined
                const resolveDependencies = modulePreload
                  ? modulePreload.resolveDependencies
                  : undefined
                if (resolveDependencies && normalizedFile) {
                  // We can't let the user remove css deps as these aren't really preloads, they are just using
                  // the same mechanism as module preloads for this chunk
                  const cssDeps: string[] = []
                  const otherDeps: string[] = []
                  for (const dep of depsArray) {
                    ;(dep.endsWith('.css') ? cssDeps : otherDeps).push(dep)
                  }
                  depsArray = [
                    ...resolveDependencies(normalizedFile, otherDeps, {
                      hostId: file,
                      hostType: 'js',
                    }),
                    ...cssDeps,
                  ]
                }

                let renderedDeps: number[]
                // renderBuiltUrl 可以参考 Vite 文档说明
                // 这里我们也没有开启 renderBuiltUrl 选项
                // 简单来说 renderBuiltUrl 用于在构建过程中自定义处理资源 URL 的生成
                if (renderBuiltUrl) {
                  renderedDeps = depsArray.map((dep) => {
                    const replacement = toOutputFilePathInJS(
                      this.environment,
                      dep,
                      'asset',
                      chunk.fileName,
                      'js',
                      toRelativePath,
                    )

                    if (typeof replacement === 'string') {
                      return addFileDep(replacement)
                    }

                    return addFileDep(replacement.runtime, true)
                  })
                } else {

                  // 最终，我们的 Demo 中对于 depsArray 会走到这个的逻辑处理
                  // 首先会根据 isRelativeBase 判断构建时的 basename 是否为相对路径

                  // 如果为相对路径，调用 toRelativePath 将每个依赖想相较于 basename 的地址进行转换之后调用 addFileDep

                  // 否则，直接将依赖地址调用 addFileDep
                  renderedDeps = depsArray.map((d) =>
                    // Don't include the assets dir if the default asset file names
                    // are used, the path will be reconstructed by the import preload helper
                    isRelativeBase
                      ? addFileDep(toRelativePath(d, file))
                      : addFileDep(d),
                  )
                }

                // 最终这里会将当前 import 语句中的 __VITE_PRELOAD__ 替换为 __vite__mapDeps([${renderedDeps.join(',')}])
                // renderedDeps 则为当前 dynamicImport 模块所有需要被优化的依赖项的 FileDep 类型对象
                s.update(
                  markerStartPos,
                  markerStartPos + preloadMarker.length,
                  renderedDeps.length > 0
                    ? `__vite__mapDeps([${renderedDeps.join(',')}])`
                    : `[]`,
                )
                rewroteMarkerStartPos.add(markerStartPos)
              }
            }
          }

          // 这里的逻辑主要用于生成 __vite__mapDeps 方法
          if (fileDeps.length > 0) {

            // 将 fileDeps 对象转化为字符串
            const fileDepsCode = `[${fileDeps
              .map((fileDep) =>
                // 检查是否存在 runtime 
                // 关于 runtime 的逻辑，可以参考 vite 文档 https://vite.dev/config/build-options.html#build-modulepreload
                // Demo 中并没有定义任何 runtime 逻辑，所以这里的 runtime 为 false

                // 如果存在，则直接使用 fileDep.url 的字符串
                // 否则使用  fileDep.url 的 JSON 字符串
                fileDep.runtime ? fileDep.url : JSON.stringify(fileDep.url),
              )
              .join(',')}]`

            const mapDepsCode = `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=${fileDepsCode})))=>i.map(i=>d[i]);\n`

            // 将生成的 __vite__mapDeps 声明插入到生成的文件顶部
            if (code.startsWith('#!')) {
              s.prependLeft(code.indexOf('\n') + 1, mapDepsCode)
            } else {
              s.prepend(mapDepsCode)
            }
          }


          // 看上去像是为了确保所有的预加载标记都被正确移除。
          // 不过上述的 case 理论上来说已经处理了所有的 dynamicImport ，这里具体为什么在检查一遍，我也不是很清楚
          // But it's not important! 😊 这并不妨碍我们理解 preload 优化的原理，我们可以将它标记为兜底的异常边界处理
          let markerStartPos = indexOfMatchInSlice(code, preloadMarkerRE)
          while (markerStartPos >= 0) {
            if (!rewroteMarkerStartPos.has(markerStartPos)) {
              s.update(
                markerStartPos,
                markerStartPos + preloadMarker.length,
                'void 0',
              )
            }
            markerStartPos = indexOfMatchInSlice(
              code,
              preloadMarkerRE,
              markerStartPos + preloadMarker.length,
            )
          }

          // 修改最终生成的文件内容
          if (s.hasChanged()) {
            chunk.code = s.toString()
            if (buildSourcemap && chunk.map) {
              const nextMap = s.generateMap({
                source: chunk.fileName,
                hires: 'boundary',
              })
              const map = combineSourcemaps(chunk.fileName, [
                nextMap as RawSourceMap,
                chunk.map as RawSourceMap,
              ]) as SourceMap
              map.toUrl = () => genSourceMapUrl(map)
              chunk.map = map

              if (buildSourcemap === 'inline') {
                chunk.code = chunk.code.replace(
                  convertSourceMap.mapFileCommentRegex,
                  '',
                )
                chunk.code += `\n//# sourceMappingURL=${genSourceMapUrl(map)}`
              } else if (buildSourcemap) {
                const mapAsset = bundle[chunk.fileName + '.map']
                if (mapAsset && mapAsset.type === 'asset') {
                  mapAsset.source = map.toString()
                }
              }
            }
          }
        }
      }
    },
```

上边的代码中，我对于 generateBundle hook 每一行都进行了详细的注释。

在 generateBundle hook 中，简单来说就是遍历每一个生成的 chunk ，通过检查每个 chunk 中的 js assets 中是否包含 preloadMarker 标记来检查生成的资源中是否需要被处理。

如果当前文件存在 preloadMarker 标记的话，此时会解析出生成的 js 文件中所有的 dynamicImport 语句，遍历每一个 dynamicImport 语句。

同时将 dynamicImport 的模块以及依赖的模块全部通过 addDeps 方法加入到 deps 的 Set 中。

也就说，每个 chunk 中的每个 asset 的每一个 dynamicImport 都存在一个名为 deps 的 Set ，它会收集到当前 dynamicImport 模块的所有依赖（从被动态导入的自身模块开始递归寻找）。

比如 import('./Contact.tsx') 模块就会寻找到 Contact、Phone、Name 这三个 chunk 对应的 js asset 文件路径。

之后，会将上述生成的

```
__vitePreload(
  async () => {
    const { Contact } = await import('./Contact.tsx')
    return { Contact }
  },
  __VITE_PRELOAD__,
  ''
)
```

中的 __VITE_PRELOAD__ 替换成为

```
__vitePreload(
  async () => {
    const { Contact } = await import('./Contact.tsx')
    return { Contact }
  },
  __vite__mapDeps([${renderedDeps.join(',')}],
  ''
)
```

对于我们 Demo 中的 Contact 模块，renderedDeps 则是 Contact、Phone 以及 Name 对应构建后生成的 js 资源路径。

之后，又会在生成的 js 文件中插入这样一段代码：

```
const __vite__mapDeps = (i, m = __vite__mapDeps, d = m.f || (m.f = ${fileDepsCode})) =>
  i.map((i) => d[i])
```

在我们的 Demo 中 fileDepsCode 即为 fileDeps 中每一项依赖的静态资源地址 (也就是执行 dynamicImport Contact 时需要依赖的 js 模块) 转化为 JSON 字符串之后的路径。

Tips: fileDeps 是 asset (资源文件) 纬度的，也就是一个 JS 资源中所有 dynamicImport 的资源都会被加入到 fileDeps 数组中，而 deps 是每个 dynamicImport 语句维护的。最终在调用 preload 时，每个 preload 语句的 deps 是一个索引的数组，我们会通过 deps 中的索引去 fileDeps 中寻找对应下标的资源路径。

最终，代码中的 await import('./Contact.tsx') 经过 vite 的构建后会变为：

```
const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/Contact-BGa5hZNp.js',
      'assets/Phone-CqabSd3V.js',
      'assets/Name-Blg-G5Um.js',
    ]),
) => i.map((i) => d[i])

const Contact = React.lazy(() =>
  __vitePreload(
    () => import('./Contact-BGa5hZNp.js'),
    __vite__mapDeps([0, 1, 2]),
  ),
)
```

至此，我们已经详细讲解了 Vite 内部 modulePreload 预加载的全部源码实现。  

**四、商旅对于 DynamicImport 的内部改造**

目前，商旅内部对 Remix 2.0 的升级优化工作已接近尾声。相比于 Remix 1.0 的运行方式，2.0 中如果仅在服务端模板生成时为所有 ES 模块动态添加 AresHost，对于某些动态导入（DynamicImport）的模块，构建后代码发布时可能会出现 modulePreload 标签和 CSS 资源加载 404 的问题。这些 404 资源问题正是由于 Vite 中 build-import-analysis 对 DynamicImport 的优化所导致的。

为了解决这一问题，我们不仅对 Remix 进行了改造，还对 Vite 中处理 DynamicImport 的逻辑进行了优化，以支持在 modulePreload 开启时以及 DynamicImport 模块中的静态资源实现 Ares 的运行时 CDN Host 注入。

实际上，Vite 中存在一个实验性属性 experimental.renderBuiltUrl，也支持为静态资源添加动态 Host。然而，renderBuiltUrl 的局限性在于它无法获取服务端的运行变量。由于我们的前端应用在服务端运行时将 AresHost 挂载在每次请求的 request 中，而 renderBuiltUrl 属性无法访问每次请求的 request。

我们期望不仅在客户端运行时，还能在服务端 SSR 应用模板生成时通过 request 获取动态的 Ares 前缀并挂载在静态资源上，显然 renderBuiltUrl 无法满足这一需求。

简单来说，对于修改后的 Remix 框架，我们将所有携程相关的通用框架属性集成到 RemixContext 中，并通过传统 SSR 应用服务端和客户端传递数据的方式（script 脚本）在 window 上挂载 __remixContext.aresHost 属性。

之后，我们在 Vite 内部的 build-import-analysis 插件中的 preload 函数中增加了一段代码，为所有链接添加 window.__remixContext.aresHost 属性，从而确保 dynamicImport 模块中依赖的 CSS 和 modulePreload 脚本能够正确携带当前应用的 AresHost。

**五、结尾**

商旅大前端团队在携程内部是较早采用 Streaming 和 ESModule 技术的。相比集团的 NFES（携程内部一款基于 React 18 + Next.js 13.1.5 + Webpack 5 的前端框架），Remix 在开发友好度和服务端 Streaming 处理方面具有独特优势。目前，Remix 已在商旅的大流量页面中得到了验证，并取得了良好效果。

本文主要从 preload 细节入手，分享我们在这方面遇到的问题和心得。后续我们将继续分享更多关于 Remix 的技术细节，并为大家介绍更多商旅对 Remix 的改造。

**【推荐阅读】**  

*   [代码复用率 99%，携程市场洞察平台 Donut 跨多端高性能技术实践](https://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697276427&idx=1&sn=7aa1842a09c5063e0f9f583314783852&scene=21#wechat_redirect)
    ==========================================================================================================================================================================
    
*   [能效变革，携程酒店前端 BFF 实践](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697276238&idx=1&sn=3e61ec17c08d6ac75aec9c641ec499cb&chksm=8376d47ab4015d6cac97d086e5e35af9ed2c06be329fbeec394768d9bd32dacf45880164c0fc&scene=21#wechat_redirect)
    
*   [携程前端自动化任务平台 TaskHub 开发实践](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697276193&idx=1&sn=f78c1f10f48a33878dd37e2cc7a4398a&chksm=8376d415b4015d033572dfeddf27964c1233c88d293e6179fb68863b73640bb3634ccf49ca9b&scene=21#wechat_redirect)
    =================================================================================================================================================================================================================================================
    
*   [携程商旅在 Atomic Css 下的探索](http://mp.weixin.qq.com/s?__biz=MjM5MDI3MjA5MQ==&mid=2697275700&idx=1&sn=9c4f9b4da5f58c733162fead52799ce6&chksm=8376d600b4015f166563f05506ff4e2a3d46e9f572f3f9320ca1c8efb2e2c45e52423b864769&scene=21#wechat_redirect)
    ==============================================================================================================================================================================================================================================
    

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/kEeDgfCVf1cYMxDsCym4U0h3ezrVOG43ItcfrZ4pPgPDc7icvYNPMia4eC2f3cX44sEADn1uOdI8Cx5LPJ5UhgWQ/640?wx_fmt=jpeg&from=appmsg)

 **“携程技术” 公众号**

 **分享，交流，成长**