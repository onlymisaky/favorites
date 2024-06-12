> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/6MEnHHlsaztp-K5l63xmHA)

![](https://mmbiz.qpic.cn/sz_mmbiz_png/udZl15qqib0MPBrTibNF6cgrYHpibiaOSmd8VfkE1mU22owOEJtOwKB31ZyCO3OA2fVpKmQCvjF6lpGNYtUYd1hA3w/640?wx_fmt=png&from=appmsg)

前言
--

> ❝
> 
> Nealyang/blog0

使用 ts 已多年，但是貌似对于 tsconfig 总是记忆不清，每次都是 cv 历史项目，所以写了这篇备忘录，希望能帮助到大家。

本文总结整理自 Matt Pocock 的一篇文章 3，加以个人理解，并做了一些修改。

配置清单
----

```
{  "compilerOptions": {    /* 基础选项: */    "esModuleInterop": true,    "skipLibCheck": true,    "target": "es2022",    "allowJs": true,    "resolveJsonModule": true,    "moduleResolution": "node",    "isolatedModules": true,    "noUnusedLocals": true,    /* 严格模式 */    "strict": true,    "noUncheckedIndexedAccess": true,    "noImplicitOverride": true,    /* 使用 tsc 编译: */    "module": "NodeNext",    "outDir": "dist",    "sourceMap": true,    /* 需要构建成库: */    "declaration": true,    /* 需要在 monorepo 中构建成库: */    "composite": true,    "declarationMap": true,    /* 如果不适用 tsc 编译: */    "module": "preserve",    "noEmit": true,    /*  如果需要再浏览器中运行你的代码: */    "lib": ["es2022", "dom", "dom.iterable"],    /* 如果你不需要再浏览器中运行你的代码，比如 node: */    "lib": ["es2022"]  }}
```

完整的配置说明
-------

### 基础配置

```
{  "compilerOptions": {    "esModuleInterop": true,    "skipLibCheck": true,    "target": "es2022",    "allowJs": true,    "resolveJsonModule": true,    "moduleResolution": "node",    "isolatedModules": true,    "noUnusedLocals": true  }}
```

*   `esModuleInterop` ：解决 ES Module 和 CommonJS 之间的兼容性问题
    

比如我们在 ts 中引入 `import React from 'react'`, 我们会看到如下报错

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0MPBrTibNF6cgrYHpibiaOSmd8yRorAqY4GW14bIibOYePPkvicV0ibktibHnicUcU6Q4RUiaqwGX4tBfHOQ2Q/640?wx_fmt=other&from=appmsg)alt text

核心是因为 `esm` 有 `default` 这个概念，而 `cjs` 没有。任何导出的变量在 `cjs` 看来都是 `module.exports` 这个对象上的属性，`esm` 的 `default` 导出也只是 `cjs` 上的 `module.exports.default` 属性而已，而且目前已有的大量的第三方库大多都是用 `UMD` / `cjs` 写的（或者说，使用的是他们编译之后的产物，而编译之后的产物一般都为 `cjs` ），但现在前端代码基本上都是用 `esm` 来写，所以 `esm` 与 `cjs` 需要一套规则来兼容。

> ❝
> 
> 详细解释可参见：_esModuleInterop 到底做了什么？_1

*   `skipLibCheck`：默认情况下，TypeScript 会对加载的类型声明文件进行检查，包括内置的`lib.d.ts`和各种`@type/*`，可以使用 skipLibCheck 跳过对这些类型声明文件的检查，这也能进一步加快编译速度。
    
*   `target`：指定 ECMAScript 目标版本，可选值：es3、es5、es2015、es2016、es2017、es2018、es2019、es2020、es2021、esnext。如果没有特殊需要，推荐将 target 设置为 "es2018"，一个对常用语法支持较为全面的版本。需要注意的是，**更改 target 配置也会同时影响你的 lib 配置默认值**
    
*   `allowJs` 和 `resolveJsonModule`：允许导入 js 和 json
    
*   `moduleResolution` : 指定模块的解析规则，其实就是 node 如何去查找模块的规则，可选值：node、classic、none。详细解释：_moduleResolution 总结_2
    
*   `isolatedModules`：确保每一个文件都被视为独立模块（可被独立编译）
    
*   `noUnusedLocals`：当设置为 true，编译器会报告文件中未使用的局部变量
    

严格模式
----

```
{  "compilerOptions": {    "strict": true,    "noUncheckedIndexedAccess": true,    "noImplicitOverride": true  }}
```

*   `strict` : 开启严格模式，具体来说启动了以下选项：
    

*   `noImplicitAny`: 不允许隐式的 any 类型
    
*   `noImplicitThis`: 不允许对 this 表达式的隐式 any 类型。
    
*   `alwaysStrict`: 以严格模式（strict mode）解析并为每个源文件生成 "use strict"。
    
*   `strictBindCallApply`: 更严格地检查 bind、call 和 apply 的参数是否与原函数匹配。
    
*   `strictNullChecks`: 在严格空检查模式下工作，null 和 undefined 值不包含在任何类型中，只允许对他们执行任何操作。
    
*   strictFunctionTypes: 禁止函数参数双向协变检查
    
*   strictPropertyInitialization: 确保类的每个实例属性都被明确赋值。
    

*   noUncheckedIndexedAccess ：启用后，可对索引签名进行更加严格的检查，使得访问如对象或数组等带索引签名类型的元素时，返回的类型会自动包含 undefined。这让开发人员更像在严格 null 检查的环境中工作时一样意识到可能未定义的值。
    

```
const array: number[] = [];const value: number | undefined = array[0]; // noUncheckedIndexedAccess -> value有类型number | undefined
```

*   `noImplicitOverride` : 当一个子类的方法重写了基类的方法时，需要用 `override` 关键字显式地标记这个行为。这确保了当基类的方法被重命名或移除的时候，派生类也相应地更新，防止意外的覆盖或者运行时错误。
    

```
class Base {  greet() {}}class Derived extends Base {  greet() {} // Error! 方法应该有override关键字来标记重写  override greet() {} // Correct}
```

使用 tsc 编译
---------

```
{  "compilerOptions": {    "module": "NodeNext",    "outDir": "dist"  }}
```

*   `module`：指定生成哪种模块系统代码，可选值：None、CommonJS、AMD、System、UMD、ES6、ES2015、ESNext。
    
*   `outDir`：指定输出目录
    

### 为库构建

```
{  "compilerOptions": {    "declaration": true  }}
```

*   `declaration`：生成相应的 `.d.ts` 文件，对于 JavaScript 库来说非常有用，你懂的
    

### 对于构建 monorepo 的类库 (大型复杂项目同样适用)

```
{  "compilerOptions": {    "declaration": true,    "composite": true,    "sourceMap": true,    "declarationMap": true  }}
```

*   `composite` ：在 `Project References` 的被引用子项目 tsconfig.json 中必须为启用状态，它通过一系列额外的配置项，确保你的子项目能被 `Project References` 引用，而在子项目中必须启用 `declaration` ，必须通过 `files` 或 `includes` 声明子项目内需要包含的文件等。
    

这是 TypeScript3.0 新增的配置，核心是提供的`Project Reference`能力，当然，这个不仅仅适用于构建 `monorepo` 的类库，对于构建单个项目的类库也同样适用。

*   `sourceMap` ：启用这个选项后，编译过程会生成 .js.map 文件，这些文件是原始源文件（.ts）和生成的 JavaScript 文件（.js）之间的映射信息。有了 source map，你可以在调试时看到原始的 TypeScript 源码而不是编译后的 JavaScript 代码，这极大地简化了调试过程
    
*   `declarationMap` : 当这个选项和 declaration 一起启用时，编译器不仅会为 .ts 文件生成 .d.ts 声明文件，还会创建 .d.ts.map 文件。这些 map 文件包含了. ts 源文件和. d.ts 声明文件之间的映射信息，允许在使用类型定义文件时进行源码映射。这使得在使用 IDE 或调试器时，开发者可以直接从使用库的代码跳转到相应的类型定义中，即便这些定义来自第三方库。
    

不适用 tsc 编译
----------

```
{  "compilerOptions": {    "module": "preserve",    "noEmit": true  }}
```

*   `module`: 指定生成哪种模块系统代码, 设置为 "`preserve`"，这告诉 TypeScript 编译器在处理模块语法时不要转换 ES6 模块语句（如 `import` 和 `export）`
    
*   `noEmit`: 不生成输出, 只用 `ts` 来做类型检查，这也是现在的很多 CI 环境中常用的方式。实际的 `js` 代码由 Babel 去编译生成
    

在 DOM 中运行
---------

```
{  "compilerOptions": {    "lib": ["es2022", "dom", "dom.iterable"]  }}
```

*   lib 选项通常用于模拟特定的运行环境，告诉 TypeScript 编译器那些 api 是内置的，可以直接使用的
    

*   es2022：这个库包含了 ECMAScript 2022（或者说是 ES12）标准规定的所有特性的类型声明
    
*   dom: 这个库提供了所有与 Web 浏览器的文档对象模型（DOM）相关的类型声明
    
*   dom.iterable：这个库提供了关于 DOM 中可迭代对象（如 NodeList 或 HTMLCollection）的类型声明
    

**如果不是在 DOM 中运行，那么可以将 lib 选项改为 `["es2022"]`即可**

常用配置
----

其他常用配置这里就不说了，包括 `include`、`exclude`、`files`、`baseUrl`、`rootDir`等

关于上述基本配置，可以从 tsconfig.guide4 中 copy 出来

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/udZl15qqib0MPBrTibNF6cgrYHpibiaOSmd8wSD3WPeThW8YyKvAgza98dKH9u6bJE28PqjtI5bAMyw7qr3Gib8Jk1A/640?wx_fmt=other&from=appmsg)

参考文章
----

*   Nealyang/PersonalBlog https://github.com/Nealyang/PersonalBlog/issues/136
    
*   esModuleInterop 到底做了什么？ https://zhuanlan.zhihu.com/p/148081795
    
*   moduleResolution 总结 https://zhuanlan.zhihu.com/p/621795173
    
*   tsconfig-cheat-sheet https://www.totaltypescript.com/tsconfig-cheat-sheet
    
*   tsconfig.guide https://tsconfig.guide/