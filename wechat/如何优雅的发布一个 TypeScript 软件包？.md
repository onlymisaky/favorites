> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/GYOGscTNxujOPe_pUYAkSg)

向 NPM 发布软件包本身并不是一个特别困难的挑战。但是，配置你的 TypeScript 项目以取得成功可能是一个挑战。你的软件包能在大多数项目上运行吗？用户能否使用类型提示和自动完成功能？它能与 ES Modules (ESM) 和 CommonJS (CJS) 风格的导入一起使用吗？

阅读完本篇文章后，你将了解如何使你的 TypeScript 包在任何（或大多数）JavaScript 和 TypeScript 项目中更易于访问和使用，包括浏览器支持！

创建 TypeScript 项目
----------------

如果你正在阅读本文，那么你很可能已经建立了一个 TypeScript 项目。如果这样做，你可能想跳到后续步骤或留下来检查是否存在差异。

让我们首先创建基本 Node.js 项目并添加 TypeScript 作为开发依赖项：

```
npm init -y<br style="visibility: visible;">npm install typescript --save-dev<br style="visibility: visible;">
```

你可能希望在 `src` 文件夹中构建代码。因此，让我们在其中创建包的入口点：

```
mkdir src<br style="visibility: visible;">touch src/index.ts<br style="visibility: visible;">
```

现在，Node.js 和浏览器不理解 TypeScript，因此我们需要设置 tsc （TypeScript 编译器）将 TypeScript 代码编译为 JavaScript。让我们通过运行以下命令将 `tsconfig.json` 文件添加到我们的项目中：

```
npx tsc --init<br style="visibility: visible;">
```

如果我们现在运行 `npx tsc`，它会扫描我们的文件夹并在与 `.ts` 文件相同的目录中创建 `.js` 文件（这是不可取的）。让我们在运行之前添加更好的配置，以免造成混乱。

将以下行添加到 `tsconfig.json`：

```
{    "compilerOptions": {        // ... Other options        "rootDir": "./src", // Where to look for our code        "outDir": "./dist", // Where to place the compiled JavaScript}
```

我们还向 `package.json` 添加一个 “build” 脚本：

```
{    "scripts": {        "build": "tsc"    }}
```

如果我们现在运行 `npm run build` ，一个新的 `dist` 文件夹将出现，其中包含已编译的 JavaScript。如果你使用的是 Git，请确保将 dist 文件夹添加到 `.gitignore` 中。

设置 tsc 以获得最佳开发者体验
-----------------

我们已经可以将 TypeScript 编译为 JavaScript。但是，如果你按原样将其发布到 npm，则只能在其他 JavaScript 项目中无缝使用它。此外，默认目标配置是 “es2016”，而现代浏览器最多仅支持 “es2015”。那么让我们解决这个问题吧！

首先，让我们将目标 (target[1]) 更改为 `es2015` （或 `es6` ，因为它们是相同的）。esModuleInterop[2] 默认为 `true`。让我们保持原样，因为它通过允许 ESM 样式导入来提高兼容性。

我们使用 TypeScript 都有一个原因：类型！但是，如果你现在就构建并发布你的软件包，那么它将不会发布任何类型。让我们通过将 declaration[3] 设置为 `true` 来解决这个问题。这将与 `.js` 文件一起生成声明文件（`.d.ts`）。仅凭这一点，你的软件包就能在 TypeScript 项目中使用，甚至在 JavaScript 项目中也能提供类型提示。

声明文件在改善支持和开发人员体验方面已经发挥了很大作用。然而，我们可以通过添加 declarationMap[4] 来更进一步。这样，将生成源映射 (`.d.ts.map`)，以将我们的声明文件 (`.d.ts`) 映射到我们的原始 TypeScript 源代码 (`.ts`)。这意味着代码编辑器在使用 “转到定义” 时可以转到原始 TypeScript 代码，而不是编译后的 JavaScript 文件。

当我们这样做时，sourceMap 将添加源映射文件 (`.js.map`)，这些文件允许调试器和其他工具在实际处理发出的 JavaScript 文件时显示原始 TypeScript 源代码。

> 使用 declarationMap 或 sourceMap 意味着我们还需要将源代码与软件包一起发布到 npm。

综上所述，这是我们最终的 `tsconfig.json` 文件：

```
{    "compilerOptions": {        "target": "es2015",        "module": "commonjs",        "strict": true,        "esModuleInterop": true,        "rootDir": "./src",        "outDir": "./dist",        "sourceMap": true,        "declaration": true,        "declarationMap": true,    }}
```

package.json
------------

这里的事情要简单得多。当用户导入包时，我们需要指定包的入口点。因此，让我们将 `main` 设置为 `dist/index.js` 。

除了入口点之外，我们还需要指定主要类型声明文件。在这种情况下，这将是 `dist/index.d.ts` 。

我们还需要指定随包一起提供哪些文件。当然，我们需要发送构建的 JavaScript 文件，但由于我们使用的是 `sourceMap` 和 `declarationMap` ，所以我们还需要发送 `src` 。

这是包含所有内容的参考 `package.json` ：

```
{  "name": "the-greatest-sdk", // Your package name  "version": "1.0.3", // Your package version  "main": "dist/index.js",  "types": "dist/index.d.ts",  "scripts": {    "build": "tsc"  },  "keywords": [], // Add related keywords  "author": "liblab", // Add yourself here  "license": "ISC",  "files": ["dist", "src"],  "devDependencies": {    "ts-node": "^10.9.1",    "typescript": "^5.0.4"  }}
```

发布到 NPM
-------

发布到 NPM 并不困难。我强烈建议你查看官方说明，但以下是一般步骤：

1.  确保你的 `package.json` 设置正确。
    
2.  构建项目（如果你遵循指南，则使用 `npm run build` ）。
    
3.  如果你还没有登录，请使用 `npm login` 向 npm 进行身份验证（你需要一个 npm 帐户）。
    
4.  运行 `npm publish` 。
    

请记住，如果你更新软件包，则需要在再次发布之前增加 `package.json` 中的 `version` 选项。

有更复杂的（和推荐的）方法来进行发布，例如使用 GitHub Action 和 releases，特别是对于开源包，但这超出了本文的范围。

* * *

原文：https://blog.liblab.com/typescript-npm-packages-done-right/

[![](https://mmbiz.qpic.cn/mmbiz_jpg/WYoaOn5t0AO6K2frZjDiboISN1jK29SxEbTw73daFebc0WzC3NvF8UZVTiaUSiboMtT2riayI6vmhvM4LNZ7YEtwSQ/640?wx_fmt=jpeg)](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499693&idx=1&sn=a2f307eca80b4c4ebcccd8dbcca2169c&chksm=f362ef0ec41566188a724ac7bf676faf386cf5281e1a3a2112c268b60c237a993e401cc1af28&scene=21#wechat_redirect)

### 参考

[1]

target: https://www.typescriptlang.org/tsconfig#target

[2]

esModuleInterop: https://www.typescriptlang.org/tsconfig#esModuleInterop

[3]

declaration: https://www.typescriptlang.org/tsconfig#declaration

[4]

declarationMap: https://www.typescriptlang.org/tsconfig#declarationMap

最近文章  

-------

*   [好物推荐 | 羽博二拖三快充数据线，买过的觉得好才推荐](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499597&idx=1&sn=97167b1f36bc5f7ff8d5c9653b1263e7&chksm=f362ef6ec4156678d532f96340658a4f96fc6f7b245b936da5945678f8f7fba67ea44eb9c7ff&scene=21#wechat_redirect)  
    
*   [ChatGPT vs AutoGPT：比较顶级语言模型](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499599&idx=1&sn=3df418f56d7b292e7f703cd7af650b9f&chksm=f362ef6cc415667a66a24a153f287c8ddb3d5646182de81289a319f80b3d2ca942b8e2bdb4ce&scene=21#wechat_redirect)  
    
*   [分享几条推文微博 9：不要赋予自己工作太多意义 / 价值](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499574&idx=1&sn=1513346e09eb81c44e58965cf6937639&chksm=f362ef95c4156683d597a9cf8e41d9786be0e9b76b1ff9128587fa2e8fc3902b2ac0af622867&scene=21#wechat_redirect)  
    
*   [干货 | 在 Flutter 中实现最佳 UX 性能的 12 个图像技巧和最佳实践](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499495&idx=1&sn=1f43bec146c05413783540e0af0171bc&chksm=f362efc4c41566d2fc0dece960f78b32cfbc0f8ce1130da1152f3b5ecdd32ff2f142865c44c4&scene=21#wechat_redirect)
    
*   [有道灵动翻译浏览器扩展，免费用大模型翻译，不要错过](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499529&idx=1&sn=d476e41e2e108ab06858303086fddc2e&chksm=f362efaac41566bc4a2426c7a083176762016869b13c1744f3478348a91aa41a4c645056fc27&scene=21#wechat_redirect)  
    
*   [有完美的 React 框架吗？三巨头之战：Remix、Next.js 和 Gatsby](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499413&idx=1&sn=f138ad574c83561f0e711600caca345b&chksm=f362e836c415612012b996c18e329f4b94635b61ded6454daa6f5c94488dc0d89bf9baae5687&scene=21#wechat_redirect)  
    
*   [Berryjam：开源 Vue.js 组件分析](http://mp.weixin.qq.com/s?__biz=MzI0MDIwNTQ1Mg==&mid=2676499388&idx=1&sn=f64ffa5e97fa9d5d99aa26656890880a&chksm=f362e85fc415614946d1fc66d517c19136407d0d39f2f146ed834abad3eaa4b40a6301715a02&scene=21#wechat_redirect)