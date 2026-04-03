> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [www.zhihu.com](https://www.zhihu.com/question/350961609/answer/3559626500)

比较奇怪五年过去了这个问题下边的回答还是讲得不太明白。

要搞明白这个问题，首先要大致懂一些 TS 的模块机制，要不然会云里雾里，不知道为什么有些回答提的方案可以工作。

目前我们通常使用的都是现代化的模块机制，要么是 ESM 要么是 CommonJS，它们的特点是每个文件都是一个模块，都是相对独立的。你要在一个模块中用另一个模块的东西，肯定要导入进来才能用——实际上大多数现代编程语言也是这么做的，像是 Java 也是用 package 做隔离的，只是做了一些特殊处理，位于 `java.lang` 包下面的东西可以在全局直接使用，不需要手动导入，这也是为啥你可以在 Java 里直接用 `String` 而不需要导入它。

所以我们有**第一种思路**——你说像 Java 这样的其他编程语言提供了特殊机制能搞一个 “全局模块”（虽然 Java 里这个实际上叫 package，module 是另一个东西），那么 TS 有没有提供这种东西呢？

有！但是首先，让我们看一下 TS 提供的一个叫做[声明合并（Declaration Merging）](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)的功能，你可以修改一个已经存在的 interface，给它添加属性：

```
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

const box: Box = { height: 5, width: 6, scale: 10 };
```

你可以看到，TS 允许你重复定义同一个 interface，最终 TS 会把这些声明合并到一块。

这东西光看本身好像没什么用——但是如果你想修改其他模块里的 interface，你也可以使用声明合并功能添加属性。比如说 Vue 2 常用的组件库 Element UI，它会往 `this` 上挂一些 `this.$notify` 或 `this.$message` 之类的 “全局方法” 来方便使用，那么它是怎么给这些方法做 TS 支持的呢？

```
declare module "vue/types/vue" {
  interface Vue {
    /** Used to show feedback after an activity. The difference with Notification is that the latter is often used to show a system level passive notification. */
    $message: ElMessage
  }
}
```

现在你看到了这种语法——在普通的 interface 的声明合并外头套一层 `declare module ... { ... }`，表示你需要修改的是一个特定模块的导出，比如这里就给 `Vue` 实例加了一个 `$message` 方法。这个在文档里叫做 [Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation).

TS 文档中没提的是，Module Augmentation 不止支持你给 interface 做声明合并，也支持创建新类型。比如说你想给 express 搞个新类型，以便之后直接从 express 导入：

```
// 这个文件随便放在什么地方都行，TS 会自动识别
declare module "express" {
  type MyUser = {
    username: string;
    password: string;
  };
}

// 在另一个文件里
import type { MyUser } from "express";
```

聪明的你大概想到了，TS 应该也提供了一个 “全局模块”，允许你这么干。它的语法稍微有些特别：

```
// 某个文件里
declare global {
  type MyType = string;
}
export {};

// 另一个文件里
type A = MyType; // 可以直接用了
```

_注意，这里的 `export {}` 是为了确保 TS 将该文件视为模块——实际上，只要该文件中出现了任何 import 或 export 语句，TS 就会将一个文件视为模块，这里是为了以防万一。你现在可能对此感到困惑，在下面的 “第二种方案” 里头我会详细描述这里的原理。_

和 Module Augmentation 类似，这个叫做 Global Augmentation，语法几乎是一样的，只是从 `declare module "..."` 改成了 `declare global`.

那么这个 Augmentation 该放在哪个文件里呢？答案是随便放在哪个文件里，只要被 `tsconfig.json` 的 `"include"` 属性包含了就行。聪明的 TS 会自动检索文件目录，把它应用到全局。

不过 TS 也不是总那么聪明——假如你故意把这个 Augmentation 放到 `node_modules` 之类的地方，TS 当然不会帮你检索出来。所以有时为了以防万一，你可以手动导入一下该模块——比如，假设你把所有这种 Augmentation 放到了一个 `global-augmentation.ts` 文件中：

```
import "../types/global-augmentation";

type A = MyType;
```

这可能看上去还是有点烦，但已经比之前好很多了——现在你只需要为保险起见在每个文件开头写一行这样的导入，而不用对每个常用的类型做单独导入。当然，实际上你在绝大多数情况下不需要写这一行，这只是为了保险。

不过，即使为了保险起见，你还是觉得每个文件顶上加一行导入很麻烦。有没有更好的办法？也有，那就是修改 `tsconfig.json`，你可以把该文件所在目录放到 `typeRoots` 里头，这样能确保 TS 会去检索该目录中的类型定义：

```
{
  "compilerOptions": {
    "typeRoots": ["./types"]
  }
}
```

有时安装一些库时也会提示你在 typeRoots 中加一些东西，这基本说明该库要么在全局增加了一些类型定义，要么是修改了另一个库的类型定义——比如 Element UI 这样的库，你需要修改 typeRoots 使 TS 识别出 Vue Instance 上现在有了 `this.$notify` 和 `this.$message` 这样的属性，否则 TS 遇到这些属性会报错。

上面介绍的第一种方法（也就是 `declare global`）是我比较推荐的方案。还有另一种常说的方法即 `declare namespace` 的做法实际上利用了某种 Hacking，就是我将要的说的**第二种方法**。我不推荐使用这种做法，但也可以解释一下原理。

我在开头提到，现在我们常用的 ESM 和 CommonJS 都是 module 方案——但是在更早的时候呢？很长一段时间以来，很多跑在浏览器中的 JS 代码都不用任何真正的模块方案，你项目里的各个 JS 文件虽然貌似是分开来的，但它们其实在同一个全局作用域里工作，通过 `<script>` 标签一个个引入，按引入顺序依次执行——以至于你在前面引入的文件中定义个某个变量或函数，在后引入的文件中可以直接访问到，压根不需要模块导入。

在那时，一个比较凑合的所谓 “模块方案” 实际上就是把模块里的所有东西放在一个全局的对象里，以防止函数名冲突。Lodash（非 `lodash-es`）就是这么干的：

```
var _ = {
  debounce: /* ... */,
  get: /* ... */,
  /* ... */
};
```

题外话：如果你想写得保险一点，确保在 module 中这个对象还是全局的，可以把它挂在 `window`（浏览器中）或 `globalThis` 下边：

```
window._ = {
  debounce: /* ... */,
  get: /* ... */,
  /* ... */
};
```

这方案至今其实仍然存在着并被广泛使用——不知道很多人有没有注意到许多库都会提供 `xxx.umd.js/xxx.esm.js/xxx.cjs.js` 这几个可供你引入的 Minified JS 文件，其中的 `xxx.umd.js` 就会提供一个这样的 “全局对象”（当然，UMD 本身还提供了对其他模块规范的兼容，不要混淆），这就是为了方便浏览器直接引入这样的情况的。

如果大家通过 CDN 之类的方案导入过 Lodash 之类的东西，也就是用一个 `<script src="https://.../lodash.min.js"></script>` 导入，大概会发现你好像可以直接在代码里用 `_.xxx` 而不需要 import 什么东西，就是这个原理。我估摸着在如今很多非前后端分离的（比如用后端模板引擎生成的）Web 项目中还是会有很多这样的用法。

扯了这么多废话是为了引出一个问题——那么 TS 支不支持这东西呢？当然是支持的。这个叫做 [Ambient Modules](https://www.typescriptlang.org/docs/handbook/modules/reference.html#ambient-modules)——我们也知道，由于诸多的历史遗留问题，JS 至少有五种甚至四种相互竞争的模块方案，直到今天还有 ESM 和 CJS 纠缠不休。那么 TS 作为一个自 2012 年出现的编程语言，中间这些年肯定为各种模块方案做过支持，详细可以看 [TS 文档中的这块 Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html).

如果你不愿意完整读完这个 Reference，可以看看我的简单解释。

首先不知道大家是否思考过一个问题：TS 怎么知道某个文件是个 module？毕竟浏览器同时提供了旧式的 `<script>` 导入和 `<script type="module">` 导入。实际上，TS 通过判断一个文件里有没有出现任何 Top-level 的 import/export 语句来判断它是不是个 module：

```
// 这不是 module
const add = (n: number, m: number) => n + m;

// 这是 module
const add = (n: number, m: number) => n + m;
export { add };

// 这是 module
export const add = (n: number, m: number) => n + m;

// 这是 module
import { somethingElse } from "some-other-module";
const add = (n: number, m: number) => n + m;

// 这也是 module
export {};
const add = (n: number, m: number) => n + m;
```

所以你会看到很多项目里会有一个看上去没啥用的 `export {}` 来确保 TS 认为该文件是个 module，包括 tsc 输出类型定义时也会保护性地加一行 `export {}`.

那么假如你故意不加任何 import/export 语句让 TS 认为某个文件不是个 module 呢？答案显而易见，它会被视为一个全局可用的 script，其中定义的任何变量、类型都会全局可用：

```
// 是的，这个文件里就只有以下这一行
type MyType = string;

// 另一个文件里，可以看到即使我们加了一个 export {} 使该文件作为 module，也能访问到 MyType
type A = MyType;
export {};
```

你看，你只要确保某个文件里边没有 import/export，TS 自动就会把它变得全局可用了。

…… 但是等等，这好像不太实用吧？假如我需要定义某个全局可用的类型就依赖于其他 module 里的类型呢？

答案还是你不准用 import/export 语句，但你可以用一个变种，有点类似于 dynamic import：

```
// 这个文件里还是不能出现 import/export 语句

// 你可以用 `import("...").` 使用其他 module 里的类型
type MyType = import("node:path").ParsedPath;

// 当然，你也可以结合 `typeof` 获取其他 module 里变量或函数的类型
declare const normalize: typeof import("node:path").normalize;
```

你可能感觉这好像很麻烦，怎么每次使用其他 module 里的类型都要拖一个前缀，有没有好办法解决这个问题——答案是的确没有办法解决这个问题，谁叫你一定要用 Ambient Module 这种旧时代方案，`declare global` 不好吗？

与之前说的 `declare global` 类似的，尽管 TS 通常可以 “自动” 检索到这些全局定义，但不保证 TS 会不会抽风，所以也有一种“保险方案”：

```
// 用下面这个三斜杠开头的语法确保 Ambient Module 被加载

/// <reference path="../types/global.ts" />

type A = MyType;
export {};
```

为啥这里变成了一个奇怪的三斜杠（Triple Slash）语法而不是直接 import 呢？想想就知道因为你定义的那个 Ambient Module 文件压根就不是个 module，没办法被 import，只能用 TS 提供的 Triple Slash 特殊语法加载。话说回来，你可能会注意到 Vite 项目生成的 `vite-env.d.ts` 中也有这个写法，现在你应该搞明白是为啥了。

另一种方案是直接写到 `typeRoots` 里，和之前讲 `declare global` 时一样。

然后你还会看到有人叫你用 `declare namespace`，其实他们也云里雾里的，压根不知道这为什么起效：

```
// 某个不包含任何 import/export 语句的文件里
declare namespace MyTypes {
  type MyType = string;
}

// 另外某个文件里
type A = MyTypes.MyType;
export {};
```

这么一看就知道为啥这个 namespace 奏效了——其实和 namespace 一点关系没有，只是因为该文件不包含任何 import/export 语句，被 TS 认为是个全局可用的 Script 而非 Module 而已。

同理，你也可以定义声明全局可用的某个变量，都是一个原理：

```
// 某个不包含任何 import/export 语句的文件里
declare const myVar: string;

// 另外某个文件里
console.log(myVar); // 不报错
```

鉴于现代前端开发已经迈入全 Module 化了，并且在 Ambient Module 里边引入啥类型都要拖个 `import("...").` 的前缀很麻烦，我完全不建议任何人再使用 Ambient Module，而是使用现代化的 `declare global`.