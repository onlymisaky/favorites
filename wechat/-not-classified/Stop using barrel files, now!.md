> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/I1i-dhgFgmBsfNrpPW-akQ)

我是范文杰，一个专注于工程化领域的前端工程师，**近期有不少 HC，感兴趣的同学可联系我内推！**欢迎关注：

* * *

这是一个很纠结的问题：**是否应该使用 Barrel Files 管理不同目录的导出结构？** 我个人曾经非常推崇这种编码模式，毕竟这确实是一种简单但非常便于管理模块之间依赖关系的方法，但经过长久实践后，发现潜在的弊端远远大于收益，因此强烈建议大家从此刻开始，**停止使用 Barrel File**，具体原因且听我娓娓道来。

Barrel File 是什么
---------------

**模块化**是一种非常重要且有用的技术，早期的 ECMAScript 规范一直被诟病缺乏模块化能力，所有变量和函数都是全局的，这非常容易导致名称冲突、代码污染等问题，导致这时候的 Javascript 语言根本无法支撑起大规模项目开发，为此开源社区及 ECMA 组织前后产出 CMD、UMD、ESM 等模块化方案。模块化能力使得开发能够基于模块粒度做好耦合度与内聚性管理，模块之间划定好交互与边界，彼此独立互不侵扰。某种程度上，这使得 Javascript 从简单的脚本语言晋升为具备大规模开发能力的现代化编程语言。

**但是**，随项目规模增长新的问题接踵而至，模块数量增长容易导致模块之间的依赖关系变得复杂，特别在大型项目中，可能需要横跨多层目录结构后才能引用到目标模块，例如在下面的项目结构中：

```
src/<br style="visibility: visible;">├── components/<br style="visibility: visible;">│   ├── Button/<br style="visibility: visible;">│   │   ├── Button.ts<br style="visibility: visible;">│   │   └── index.ts<br style="visibility: visible;">│   ├── Input/<br style="visibility: visible;">│   │   ├── Input.ts<br style="visibility: visible;">│   │   └── index.ts<br style="visibility: visible;">│   └── Modal/<br style="visibility: visible;">│       ├── Modal.ts<br style="visibility: visible;">│       └── index.ts<br style="visibility: visible;">├── utils/<br style="visibility: visible;">│   ├── format.ts
│   └── validate.ts
└── services/
    ├── api/
    │   ├── userApi.ts
    │   └── index.ts
    └── auth/
        ├── authService.ts
        └── index.ts
```

假设 `src/components/Button/Button.ts` 模块需要使用 `src/services/api/auth/authService.ts` 模块，则相关导入语句：

```
// src/components/Button/Button.tsimport { authService } from '../../services/auth/authService';
```

这种方式存在许多缺点：

1.  **可读性差**：随着目录层级的增加，引用路径会变得越来越长和复杂，这不仅降低了代码的可读性，还增加了理解代码结构的难度；
    
2.  **强耦合**：`Button` 强依赖于 `authService` 文件所在的相对路径，目录层级间边界模糊不清；
    
3.  **维护成本高**：在大型项目中，随着模块和文件数量的增加，维护相对路径变得更加困难，任何一次目录结构的调整都可能需要大量的路径更新工作。
    

所幸这个问题并不难解决，常见解题思路有 `alias` 与 `Barrel Files`：

*   `alias`：使用构建工具 —— 如 Typescript 的 `alias` 指定路径别名：
    
    ```
    // tsconfig.json{"compilerOptions": {  "paths": {    "@services/*": ["src/services/*"]  }}}
    ```
    

之后即可简化引用方式为：

```
import { authService } from '@services/auth/authService';
```

*   `Barrel Files`：设置 `Barrel Files` 统一导出模块，如：
    
    ```
    // services/index.tsexport { authService } from './auth/authService';
    ```
    

之后即可简化引用方式为：

```
import { authService } from '../../services';
```

> PS：`alias` 模式也同样存在许多影响工程可维护性的细微问题，此处先按下不表。

结合上面的示例，**Barrel files** 本质上就是一种聚合多个模块并统一导出的编码模式，我们可以代码文件夹中创建一个 Barrel File，通过该文件统一导出可用模块，外部模块在消费时只需引用到 Barrel 文件即可，无需关心代码文件夹内部细节，这会带来一些好处：

1.  引用方无需感知依赖模块的具体文件结构，达到简化导入语句，在大型工程中这有利于提升开发效率；
    
2.  Barrel Files 有助于管理模块的可见性，对外屏蔽不必要的细节，从而降低模块间耦合；
    
3.  模块之间通过 Barrel Files 解耦后，后续更容易做重构，例如重命名、移动文件等，都只需要修改 barrel files 即可；
    
4.  使用 Barrel Files 可以统一模块的导出方式, 使代码的结构和导入方式更加一致和规范，便于团队协作。
    

如果严格遵循这种模式，只要确保 Barrel File 文件对外暴露内容的稳定性，文件夹内部无论怎么腾挪转移，上层甚至无需同步做出重构。

**这听着很美好，那么问题在哪呢？**

问题：
---

### 1.  Tree-Shaking 失效

这是 Barrel Files 模式最严重的问题：**使用 Barrel Files 容易导致 Tree-shaking 失败**。

Tree-shaking 是前端构建工具提供的非常基础而实用的性能优化特性，其底层依赖于 ESM 模块规范的静态特性，在构建过程中通过追踪分析各模块导入导出结构，删除无用模块，达到性能优化效果。

> 更多实现细节，可参考：《[Webpack 原理系列九：Tree-Shaking 实现原理](https://mp.weixin.qq.com/s?__biz=Mzg3OTYwMjcxMA==&mid=2247484579&idx=1&sn=f687adfc6a7ea155c0fdf504defb65b5&scene=21#wechat_redirect)》一文。

但是，在使用 Barrel Files 模式时，情况发生了变化，举例来说，假设项目结构如下：

```
src/├── components/│   ├── Button.js│   ├── Input.js│   └── index.js  // Barrel file└── index.js
```

对应核心代码：

```
// src/components/Button.jsexport const Button = () => {  console.log("Buttond");};// src/components/Input.jsclass SingleTon { // 这里是重点  constructor() {    console.log("SingleTon");  }}export const instance = new SingleTon();export const Input = () => {  console.log("input");};// src/components/index.jsexport { Button } from "./Button";export { Input } from "./Input";// src/index.jsimport { Button } from "./components";Button();
```

结果来看，entry 文件 `src/index.js` 仅消费了 `Button` 函数，但构建结果却是：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOib3lnLFia2aRg7n0B0bgDwRcYrkkKX1CoicPaY7Rnw6AaEgibgAWRhC5TA/640?wx_fmt=png&from=appmsg)

原因很简单，构建工具认为 `SingleTon` 是一段有 sideEffects 的代码，出于安全考虑不予删除。在 Barrel Files 模式下，这意味着下游模块所有被判定为带有 sideEffects 的代码都会被保留下来，导致最终产物可能被打入许多无用代码。注意，有许多代码模式会被判定为具有 sideEffects，包括：

*   顶层函数调用，如：`console.log('a')`；
    
*   修改全局状态或对象，如：`document.title = 'new Title'`；
    
*   IIFE 函数；
    
*   动态导入语句，如：`import('./mod')`；
    
*   原型链污染，如：`Array.prototype.xxx = function (){xxx}`；
    
*   非 JS 资源：Tree-shaking 能力仅对 ESM 代码生效，一旦引用非 JS 资源则无法树摇；
    
*   等等；
    

这些都是非常常见的编码模式，特别是非 JS 资源，在前端项目中通过 `import/require` 引用样式、多媒体文件是非常常见的，但在 Barrel File 模式下却容易打入不必要代码。例如扩展上述示例，引入 Less 文件：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOEtHlanoHPMbpKtpMxoeqdfic299HPyj5fnnvG8Wx6zFOVIAicwPXibLcw/640?wx_fmt=png&from=appmsg)

> 即使 `s` 并未被消费，产物中依然带有 `input.module.less` 代码，以及对应 CSS module 运行时代码。

严格来说，并不单纯是 Barrel Files 模式导致 tree-shaking 失效，而是 Barrel Files 叠加 sideEffects 的判定逻辑导致部分场景下树摇失败。那么相对的，假如放弃 Barrel Files 模式 (虽然这会给损害 DX)，直接引用具体模块代码，必然也就不会带入其他无用模块的 sideEffects。

### 2.  循环引用

循环引用是指两个或多个模块相互依赖，形成一个闭环，例如，模块 A 引用了模块 B，而模块 B 又引用了模块 A。而 Barrel Files 模式又非常容易导致循环引用结构，例如对于下面的项目结构：

```
src/├── components/│   ├── Button.ts│   ├── Input.ts│   └── index.ts  // Barrel 文件└── index.ts
```

```
// Button.tsimport { Input } from './index';export function Button() {  Input();  }
```

```
// Input.tsimport { Button } from './index';export function Input() {  Button();  }
```

这里面，Barrel File 模式看似隐蔽了 `Button` 与 `Input` 模块的实现细节，降低两者耦合，但依赖关系并没有消失而是发生转移，两者的循环依赖从直接变成间接，以人类的认知能力而言变得相对隐晦而难以察觉，这只是一个简单示例，当项目规模增长十倍、百倍时，循环依赖的概率也会相应大幅增长。

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOb9EklSicNDW3p6SopkdJCeyO04TgBvZ4fqPnQq9O0rKQJ0xcEM8ZTWA/640?wx_fmt=png&from=appmsg)

这种依赖结构是非常脆弱不健康的，容易进一步引发许多工程问题：

1.  **模块未定义问题**：当出现循环引用时，某些模块可能会在未完全定义之前被使用，导致 `undefined` 错误。例如：
    

```
// Button.tsimport { Input } from './index';console.log(Input);  // 可能是 undefined
```

2.  **程序崩溃或行为异常**：循环引用会导致模块加载顺序问题，验证时可能引发程序崩溃或行为异常。例如：
    

```
// Button.tsimport { Input } from './index';export function Button() {  Input();  }// Input.tsimport { Button } from './index';export function Input() {  Button();  // Button 与 Input 递归调用，导致程序死循环}
```

3.  **构建困难**：“如何构建循环依赖” 是一个非常复杂的问题，业界并没有对此形成统一规范，各家构建工具的处理逻辑都有所不同，致使某些代码在当下看似可用，但换一个构建环境可能出现各种细微问题；
    
4.  **调试困难**：循环引用导致的问题往往隐蔽且难以调试。开发者需要深入理解模块加载顺序，才能找到并修复问题。
    

幸运的是，这类问题相对容易检测，社区有不少工具可用于辅助检测循环依赖，常见如 `eslint-plugin-import` 的 `no-cycle` 规则，接入成本低，但其内部实现需要向下遍历被依赖模块，IO 与 CPU 都比较密集，有较高性能成本，官方文档也警告过需要关注性能问题：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOhkFgxacu1nWIofibjHPDm80gySK0GaJ9ErLGP06HM7oSACf7cDn5oOA/640?wx_fmt=png&from=appmsg)

其次，更推荐使用 `oxlint` 的 `import/no-cycle` 规则，由于底层是 rust 实现的，执行性能要比 `eslint-plugin-import` 插件高出不少，使用方法：

```
npm i -g oxlint@latestecho '{"rules": {"import/no-cycle": "error"}}' > .oxlintrc.jsonoxlint -c .oxlintrc.json --quiet --import-plugin .
```

### 3.  影响部分工程化工具性能

这里有一个基础前提：**Barrel Files 模式容易引入无用代码**，无用是指代码被定义、导入却从未被业务系统消费，但这些无用代码却是实实在在影响着许多工程工具的执行性能，包括但不限于：Typescript、VS Code、Vitest、Webpack、RSPack、ESLint 等等。

以 VS Code 为例，不同导入风格最终需要处理的空间复杂度差异极大，以 `antd` 为例：

*   使用 Barrel Files 时：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOU9esViawpxSsNdibbMpf0G0EnDoTPGOiaIkMZNibsweBpvMPYwxVgYu5bA/640?wx_fmt=png&from=appmsg)

对应 TS Server 日志，需要处理许多无关模块：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOCIOj5tobaUIoYbktiaqfmRVQ17pNO9RsZnw2lRPHa6XloBiaibR2NiazPQ/640?wx_fmt=png&from=appmsg)

*   直接引用模块：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOfy4bYeQxzDEdFtNKw2RQcMyFhibR6jUw6QxibScAiaOsMtSQtuEiaT6gvg/640?wx_fmt=png&from=appmsg)

对应 TS Server 日志，只需处理 `affix` 模块即可：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOg9oxKGTWmDnq7iav7Wqq4uotu9Ie6icoLtfLgXS9qDd02JlGEiap9jo5A/640?wx_fmt=png&from=appmsg)

类似的，使用 Barrel Files 时，`tsc` 也需要消费更多的时间索引那些根本不会被消费的文件：

*   使用 Barrel Files 时：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOU9esViawpxSsNdibbMpf0G0EnDoTPGOiaIkMZNibsweBpvMPYwxVgYu5bA/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOUSfC9SKpjCqbicRyNmdlBW85GQtbNDg0Ticv2UqD2VW5iaCuvaicAaz53Q/640?wx_fmt=png&from=appmsg)

*   直接引用模块：
    

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOfy4bYeQxzDEdFtNKw2RQcMyFhibR6jUw6QxibScAiaOsMtSQtuEiaT6gvg/640?wx_fmt=png&from=appmsg)![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOtXFjtqNws9TQHjgjdnZuEtlr335gH22AOS3A7Gz4ghbj759Zb3icqibw/640?wx_fmt=png&from=appmsg)

从 540ms 到 141ms，两者相差接近 4 倍的性能开销，本质上，这是因为 Typescript 并没有智能到能够识别出 Barrel Files 导入的无用模块，`tsc` 或 `ts server` 会忠实的解析编译所有遇到的模块及子模块，结果，Barrel Files 模式使用的越多，越容易造成不必要的性能浪费。

类似的，这一问题在 Webpack/RSPack 等构建工具，或 bundle 中不使用 tree-shaking 时，或者 Vitest 等工具中同样存在，都会导致大量无效计算。

### 4. 模块间依赖关系变得更复杂

在使用 Barrel Files 后，对引用方而言确实无需关注具体模块文件路径，模块之间的依赖规则似乎变得更简单些，但事实是，复杂度不会消失，只是转嫁到 Barrel Files 上而已，凌乱的关系最终汇聚到 Barrel Files 上反而可能使得最终的模块关系图变得愈加复杂：

*   **依赖关系更隐蔽**：Barrel 文件会隐藏模块之间的直接依赖关系，使得依赖关系变得不透明。例如，在 `Home.ts` 文件中，我们通过 Barrel 文件导入了 `Button` 和 `Input` 组件，但实际上我们并不能直观理解这些组件具体来自哪里，而这会使得代码调试变得复杂晦涩；
    
*   **增加了不必要的依赖**：由于 Barrel Files 会导出所有包含的模块，有时明明不存在消费行为，但通过 Barrel Files 搭桥后，反而导致模块之间增加不必要的依赖关系；
    

举个实际例子，开源工具 mswjs 曾经做过一次重构，移除仓库内部分 Barrel Files，重构之前模块之间的依赖关系：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDORCyQiad6dCpicH7b9h7JhG8yPkRUeS49nNVSSBfZ4LnELTrKa3xOAibuw/640?wx_fmt=png&from=appmsg)

重构之后：

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOkiaj88AzOaiaM5SQUdhzNesF3t0eIicZFiacKz2BH6iaacsAwjxxIxGhRhw/640?wx_fmt=png&from=appmsg)

变得肉眼可见的清晰明了。复杂依赖关系会带来许多可读性问题，提高代码理解成本，即使借助编程工具如 VS Code，过度复杂的关系也会让人难以理解全貌。

最佳实践
----

综上，虽然 Barrel Files 确实能简化导入路径，降低模块耦合，提升开发体验，但代价却是牺牲了产物与工程环境性能，且长期来看反而会让整体模块依赖关系变得复杂难懂，我认为应该尽量克制使用 Barrel Files，使用其他方法替代，如：

1.  若项目文件结构比较简单，建议直接引用具体模块；若文件结构过于复杂，请重构，在 Monorepo 语境下做好拆包分解；
    
2.  如果你正在开发 NPM Package，可使用 `package.json` 的 `exports`、`typesVersion` 等字段声明导出内容，以此替代 Package 的 index 文件；
    

其次，应该设置一些 Lint 检测规则预防出现意料之外的 Barrel 文件，常用规则包括：

*   使用 `eslint-plugin-import` 或 oxlint 的 `no-cycle` 规避循环引用；
    
*   编写 ESLint 规则禁止 `export */import *` 一类代码，规避过度开放的 Barrel Files，不过社区似乎还没有想过实现，后续有机会再将我们内部实现的版本开源出去吧。
    

* * *

**近期有不少 HC，感兴趣的同学可联系我内推！****近期有不少 HC，感兴趣的同学可联系我内推！****近期有不少 HC，感兴趣的同学可联系我内推！**

![](https://mmbiz.qpic.cn/sz_mmbiz_png/3xDuJ3eicibll1cCtibhKkqUzNyrYc8MibDOFwziaS12ehTdz69Z1DdQW6APjvyb5ZR9MjKxmDW45IPxxJibdg4IfIkA/640?wx_fmt=png&from=appmsg)