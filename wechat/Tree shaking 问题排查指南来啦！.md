> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/P3mzw_vmOR6K_Mj-963o3g)

**点点关注, 精彩内容不错过**👆

  
背景
-----

在自研打包工具的过程中，发现有时会碰到不同的编译工具处理相同的代码，其大小差距可能很大，追查下来大部分是和不同工具对代码优化的处理方式不同所致。目前大部分 js 打包工具都支持的一种优化即 tree shaking，但是不幸的是 tree shaking 没有比较标准的定义，各个打包工具的 tree shaking 实现又不尽相同。

术语
--

Tree shaking 在不同工具里的意义不太统一，为了统一后续讨论，我们规范各个术语。

*   minify：编译优化手段，指在不影响代码语义的情况下，尽可能的减小程序的体积，常见的 minify 工具如 terser、uglify，swc 和 esbuid 也自带 minify 功能。
    
*   Dead code elimination(DCE)：即死代码优化，一种编译器优化手段，用于移除不影响程序结果的代码，实现 DCE 的手段有很多种，如 const folding(常量折叠)、Control flow analysis、也包括下面的 LTO。
    
*   Link Time Optimization：指 link 期优化的手段，可以进行跨模块的分析优化，如可以分析模块之间的引用关系，删掉其他模块未使用的导出变量，也可以进行跨模块对符号进行 mangle。
    
    http://johanengelen.github.io/ldc/2016/11/10/Link-Time-Optimization-LDC.html
    
*   Tree shaking：一种在 Javascript 社区流行的一个术语，是一种死代码优化手段，其依赖于 ES2015 的模块语法，由 rollup 引入。这里的 tree shaking 通常指的是基于 module 的跨模块死代码删除技术，即基于 LTO 的 DCE，其区别于一般的 DCE 在于，其只进行 top-level 和跨模块引用分析，并不会去尝试优化如函数里的实现的 DCE。
    

> _Tree shaking_ is a term commonly used in the JavaScript context for dead-code elimination. It relies on the static structure of ES2015 module syntax, i.e. `import` and `export`. The name and concept have been popularized by the ES2015 module bundler rollup.   
> 
> https://webpack.js.org/guides/tree-shaking/

*   mangle：即符号压缩，将变量名以更短的变量名进行替换。
    
*   副作用：对程序状态造成影响，死代码优化一般不能删除副作用代码，即使副作用代码的结果在其他地方没用到。
    
*   模块内部副作用：副作用影响范围仅限于当前模块，如果外部模块不依赖当前模块，那么该副作用代码可以跟随当前模块一起被删除，如果外部模块依赖了当前模块，则该副作用代码不能被删除。
    

如以下代码，`import './button.css'`  本身是具有副作用的，因此即使在 button.tsx 里没有使用其导出值，其仍然不能简单的删除，而需要包含其副作用 (emit css)，但是如果外部不使用 button 这个组件，那么可以不触发 button.css 的副作用，所以说`import './button.css'`具有内部副作用。

```
// components/button.tsximport style from './button.css';export const Button = () => {   return <div class="button">button</div>}// components/button.css.button {  color: red;}// app.tsximport { Tab, Button } from './components';console.log('Button', Button);
```

*   **top-level: 顶层的语句**
    

```
function top_level(){ // this is top_level function declartion   function inner(){  // this is not top_level   }   let b = 20; // this is not top_level}let a = 10; // this is top_level variable declartion
```

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjuC5Hf0GSUnCibImcNW28zolia1mAAsQnoph6yfqv69FuLCb8eWATtWqA/640?wx_fmt=png)

  

> 因此我们的后续讨论，所说的 tree shaking 均是指基于 LTO 的 DCE，而 DCE 指的是不包含 tree shaking 的其他 DCE 部分。

简单来说即是，tree shaking 负责移除未引用的 top-level 语句，而 DCE 删除无用的语句。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjcJrk530ZXNg4EIfbV1NIcYqsjWvOodC57cFoGAdc9vdSkUywqav0PQ/640?wx_fmt=png)

安全 VS 优化级别
----------

日常经常听到各种功能的比较，什么 rollup 的 tree shaking 效果比 webpack 好，terser 的压缩比 esbuild 的压缩比更高，事实上 tree shaking 算法其实算得上比较固定的算法，各个工具如果 tree shaking 实现应该不存在较多的差异，而 DCE 其实不同的优化工具，压缩的方式却各有不同，这通常涉及到压缩安全性和压缩比例的取舍。

比如，如下一段代码，rollup 和 esbuild 却产出两种结果：

```
const obj = {};obj.name ='obj';export const answer =42;
```

*   rollup
    

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETj8PzzZ8Fs0Fw3D41qUpGibZLtHT2icc8yynUUgSfGuCJv4iabwvkzd912A/640?wx_fmt=png)

*   esbuild
    

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjDUfqZJXe7ZTj3PnL699qtSVS3dcSu7T66evj7ANAibAtHVo76XIkiaCQ/640?wx_fmt=png)

rollup 成功的删除掉了没有导出的 obj，此时你可能会说 esbuild 真辣鸡啊，这么简单的代码都删除不掉，但是实际上 rollup 的这个优化并不安全，如果该代码运行在如下的环境下，rollup 的优化则可能导致出错。

```
function render(val){  console.log('render',val)}Object.defineProperty(Object.prototype, 'name', {  set(val){    render(val);  }})
```

本来代码的意思是每次设置一个变量属性的时候，都要触发一次 render，结果由于`obj.name`代码被删除，导致 render 没被触发，这明显改变了语义。

https://github.com/evanw/esbuild/issues/2010

因此我们评估一个工具的压缩效果是否好的时候，不能简单的评估压缩比。

tree shaking 相比 DCE 的优势
-----------------------

既然 tree shaking 是 DCE 的一个子集，为什么我们还要单独支持 tree shaking，而不是直接依赖 DCE 去做 tree shaking 呢？

*   tree shaking 可以省略一些模块的处理开销：如果我们确定某些模块的所有导出变量都未被引用，我们可以直接跳过这些模块的 parse、loader 开销。
    
*   tree shaking 有更多的局部性信息，我们可以约定某个模块是否包含内部副作用 (即使该模块的代码内部实现有副作用)，这样我们可以利用内部副作用性质对整个模块进行删除，否则如果在 DCE 阶段在进行删除，那么这些模块内部副作用会对全局进行污染，很难进行删除了。
    
*   tree shaking 可以关联模块的副作用信息，考察如下一段代码：
    

```
import jojo from './jojo.png'console.log('jojo:',jojo);
```

这段代码本身有两层含义：

*   触发 file-loader：将 jojo.png 生成到 assets 里，可能还会伴随着图片压缩等操作。
    
*   将生成 assets 的地址赋值给 jojo 变量，作为变量给后续使用。
    

如果没有 tree shaking 支持，在 DCE 阶段难以处理和 file-loader 的关系，因为在 DCE 阶段，jojo 已经只是个变量了，没有信息（或者很难有信息) 来判断其是否要删除 file-loader 的结果了。

tree shaking 算法
---------------

我们首先来看看 tree shaking，相比于一般的 DCE 手段，tree shaking 的算法比较固定，不同的 bundler 的行为比较一致。tree shaking 的目标非常明确, 就是删除掉最终 bundle 中，永远不会使用 top-level 代码，我们来一步步看如何实现完整的 tree shaking 算法。

### Without sideEffect

#### 保留引用的导出语句

*   lib.js
    

```
const secret = 10; // stmt1export const answer = 42; // stmt2
```

这里只有 answer 被导出，我们只需要保留 answer 即可，结果即为：

```
export const answer = 42
```

#### 跨模块分析引用的已导出语句

*   index.js
    

```
import { answer } from './lib';export { answer };
```

*   lib.js
    

```
export const answer = 42;export const secret = 10;
```

这里虽然在 lib 里导出了 secret，但是并未在 index.js 里使用，因此可以删除，结果仍然为：

```
export const answer = 42;
```

#### 深度分析引用的已导出语句

*   index.js
    

```
import { answer } from './lib';export { answer };
```

*   lib.js
    

```
export * from './internal';
```

*   internal.js
    

```
export const answer = 42;export const secret = 10;
```

这里的 lib 虽然本身没导出，但是对 internal 进行了重导出，我们深度分析，查找出 answer 最终定义的地方。

```
export const answer = 42;
```

#### 符号关联

*   index.js
    

```
import { answer } from './lib';export { answer }
```

*   lib.js
    

```
export let secret = 10export const answer = secret + 32;export * from './reexport';
```

*   reexport.js
    

```
export const internal = 100;console.log('sideEffect');
```

此时，虽然在 index.js 没有直接依赖 secret，但是 getAnswer 的内部实现依赖了 secret，所以 secret 也被连带导出。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjKgkGbibMLy4VfjvphaMv307Vzibstl3C3Yv4DvSd3MSk4WcevibAhoFPA/640?wx_fmt=png)

因此我们可以看出 tree shaking 分析，本身就是基于符号引用的可达性分析，其根据入口的使用符号，根据符号引用和模块引用，递归的进行模块和引用分析，然后包括所有可达模块的的可达符号的语句，然而现实情况要复杂很多，这是因为我们始终没考虑一个因素就是**副作用，**副作用可以说是优化的最大阻碍，当考虑副作用，情况就变得复杂的多了。

### sideEffects

副作用从两个层面影响着 tree shaking 算法：

*   分析的入口不仅仅是导出语句，还包括副作用语句 (不包含副作用的语句不会触发分析）。如下的 console.log('secret',secret) 因为包含副作用，因此：
    

```
import { answer, secret } from './lib';export { answer }; //  导出语句secret; // 不会触发secret的分析console.log('secret', secret); // 触发secret的分析
```

由于 Javascript 灵活的特性，一个语句是不是包含副作用其实是很难界定的，往往和当时的宿主执行相关，如简单的`answer+1`会被 rollup 判定为不包含副作用，但被 esbuild 判定为包含副作用，所以一般编译器可以通过 pure annoation(/* #**PURE** */) 来强行指定一个语句是否包含副作用。

*   模块的导出变量即使未被使用，也需要递归的对模块进行分析。
    

因为导入的模块可能包含副作用，即使改导出模块导出变量均未使用，我们也不能直接删除该模块，而应该仍然进行递归分析检查是否存在其他副作用语句。实际上我们直接把 import 语句视为副作用语句即可。即当考虑副作用的情况下，可达性不仅仅要考虑符号引用，也要考虑副作用引用。

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjQwc7UZ9dm7ic4gW2t1MFGEcnicialNVhAJcxib7A3b8NbSwPuu8W5TuYPQ/640?wx_fmt=png)

这里实线是副作用引用，虚线是符号引用。

包含了副作用引用后，我们的生成代码就可以包含所有的副作用代码了。

### 副作用引用优化

在考虑了副作用引用后，tree shaking 的全部功能算支持了，但是仍然存在很多待优化的地方受限于`JavaScript`的特性，用户的很多代码，本意并不是想引入副作用，但是仍然可能被编译视为副作用 (倾向安全的保守设计)， 这导致了最终的结果包含了很多不需要的代码。虽然可以通过`pure annotation`来对各个语句进行标记，但显得过于麻烦，且对代码侵入较强 (如三方代码难以修改)，因此 webpack 引入了一个机制来对整个模块进行副作用标记。

#### 模块内部副作用

webpack 的`sideEffects`的命名其实存在一定误导性, 其意义并非是说该模块不存在副作用，而是说该模块存在的副作用是内部副作用，即该副作用只对自身模块产生影响，并不对其他没有使用该模块导出变量的模块造成影响，或者说，如果你不包含该模块的导出变量那么也不应该包含该模块的副作用，如果依赖了该模块的导出变量，才应该依赖该模块的副作用。这一点非常类似 C++|Rust 的内部可变性，这点也是最容易遭受误解的地方。

我们以 vue 为例，虽然 vue 的源码里充斥了各种副作用，但是如果你并没使用 vue 导出的变量，那么仍然应该可以安全删除整个 vue 模块。

https://github.com/vuejs/vue/pull/8099

```
import Vue from 'vue';
import { answer, secret } from './lib'
export { secret }
```

#### sideEffects field

webpack 通过 sideEffects 字段来标记某个模块具有模块内部副作用。

*   index.js
    

```
import { answer } from './lib';
```

*   lib.js
    

```
export const answer = 42;export const secret = 10;console.log('lib');export * from './reexport';
```

*   reexport.js
    

```
console.log('internal');export const internal = 100;
```

上述代码在没配置 sideEffects 的情况下，编译结果如下：

```
// src/reexport.jsconsole.log("internal");// src/lib.jsvar answer = 42;console.log("lib");// src/index.jsconsole.log("answer:", answer);
```

各个模块的副作用代码都得到保留，这符合预期。在配置下`sideEffects:false`看下结果：

```
// src/lib.jsvar answer = 42;console.log("lib");// src/index.jsconsole.log("answer:", answer);
```

对比发现，src/reexports 里的副作用代码已经被删掉了，这是因为我们已经标记了该模块是模块内部副作用且外部模块并没有引入该模块的导出变量，因此可以安全的将该模块代码删除。另外 src/lib.js 的副作用代码并没被删除，因为 index.js 依赖了 src/lib 导出的 answer 变量，这导致其副作用分析完全交给了 webpack，webpack 成功的识别出其包含的副作用代码，包含在最后的 bundle 内。

#### reexport 机制

webpack 的 sideEffects 里有个很 trick 的优化，就是关于 reexport，首先简单的定义下 reexports, 如果某个模块的导出来自另一个模块的导出，那么就称该导出为 reexport。

如下所示这里的 internal 就是 b 的 reexport。

*   index.js
    

```
// index.jsimport { internal } from './lib';console.log(internal);
```

*   lib.js
    

```
export const answer = 42;export const secret = 10;console.log('lib');export * from './reexport';
```

*   reexport.js
    

```
console.log('internal');export const internal = 100;
```

如果都标记的 sideEffects:false，那么即使 index 从 lib 里引入了 internal，但是因为 internal 来自`rexports.js`, 而 index.js 里没引入`lib.js`本身的任何变量，所以 lib 本身的副作用会被全部跳过。

结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjsQsrqW8icia518tW2ibyfV99IwoxYLfewA5SIy1w3IUGjOibbaflDaQgsA/640?wx_fmt=png)

  

如果 index.js 里引入了 lib.js 自身定义的导出如：

```
import { internal, answer } from './lib';

console.log(internal, answer);
```

那么结果会包含 lib.js 的副作用代码：

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjYSHU4nmtWv7ezet2kmUTpfCDkr8ibwNNEHmnE7KwultcnUWEuBCYyNw/640?wx_fmt=png)

  

不同的工具对 reexport 的判定存在差异，如 esbuild 只会将 export * from 'xxx'识别为 reexport，并不识别 export {internal} from './reexport'识别为 reexport，但是 webpack 会将 export { internal} from './reexport'识别为 reexport。

tree shaking 与 DCE
------------------

大部分工具的 tree shaking 和 DCE 是工作在不同的阶段，一般的 tree shaking 发生在 module link 的阶段，而 DCE 发生在 bundle 的 print 阶段，所以很多工具是不支持 tree shaking 结果依赖 DCE 结果的。

总结
--

生产环境通常通过 minify 进行代码压缩，minfy 的一个场景手段就是 DCE，在 Javascript 社区中一个场景的 DCE 手段就是 tree shaking，即基于符号分析和模块引用的 DCE 机制，tree shaking 过程中通常不可避免的碰到副作用，因为 Javascript 自身灵活的动态性质，编译工具很难直接为`Javascript`做很好的优化, 为了优化副作用的处理，引入了 pure annotation 和 sideEffects 字段，`pure annotation`用于辅助工具识别非副作用代码，而 sideEffects 则标记了一个模块具有内部副作用，这样可以提高编译工具副作用分析的效率和准确性 (贴近业务)。

tree shaking 的常见误区
------------------

*   包含副作用的代码，不能配置 sideEffects：sideEffects 实际和代码里是否具有副作用无关，而是该副作用设计是作用在模块内还是模块外，如 vue 代码，虽然有副作用，但是这些副作用是给 vue 的内部实现使用的，而非给外部用的。
    
*   为 css 配置 sideEffects:false: 为了实现 css 的 tree shaking，想通过配置 css 的 sideEffects 来实现 css 的 tree shaking, 结果导致业务直接 import css 的 css 没有打包进来，css 的 tree shaking 应该跟着相关组件走，如果改组件配置了 sideEffects:false, 当没引入改组件的时候，其 css 会自动跟随 tree shaking 掉。
    

tree shaking 问题排查方式
-------------------

*   step1：确定是 DCE 问题还是 tree shaking 问题。
    

*   根据代码出现在 top-level 还是非 top-level，我们能比较容易的区分是 tree shaking 失效还是 DCE 失效，如果是函数内的优化失败那么肯定是 DCE，如果是 top-level 的优化失效，则大概率是 tree shaking 失效 (也可能是 DCE 失效，如 top level 的 constant folding)
    

*   step2：如果是 DCE 失效，那么很可能是 terser|esbuild 的优化级别过低，或者 terser 没有开启某些优化，请检查 terser 相关配置参数, 适当的调整 terser 的 passes 级别。
    
    https://github.com/terser/terser#compress-options
    
*   step3：如果是 tree shaking 失败, 先确认失效模块的路径信息，很多编译工具编译中会保留模块信息 (通常需要先关闭 minify, 因为 minify 有时会删除掉模块信息)，如 esbuild。
    

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFyV3rwHBTbMAQbqIjUAlETjTJQmG4la3jicXLTtQW6icH5gFqiaYf2Bvd0EAEwicy0qic83lcKOEfrMsKQ/640?wx_fmt=png)

  

*   step4：确认了模块路径信息，进一步确认该模块是否具有副作用以及是否 esModule，有时候是否具有副作用难以判定，可以尝试配置该模块的路径的 sideEffects:false，然后对比配置前后的产物大小是否具有差异。
    

不是所有的模块都应该配置 sideEffects，请先确保改模块是否具有模块内部副作用性质，避免影响了程序的正确性。

*   step5：如果配置了 sideEffects:false，大小仍然没有明显改变，此时存在两种可能：
    

*   该模块本身就不能 tree shaking，在其他地方存在着对该模块变量的引用，导致了该模块没被 shaking 掉，这一般通过编辑器的 go to reference 或者自己字符串搜索能查到引用的地方。
    
*   编译工具存在 bug，如不支持 sideEffects，或者 sideEffects 计算错误，请联系编译工具的开发进行协助排查。
    

- END -

![](https://mmbiz.qpic.cn/mmbiz_png/FuxFc4JogFw9hSnCXwIr7DCopHODicFbDPQ6OvKCxvNtclYUxCrqDBAFQdQDh4Vm4KsqAa0nlbYIkz4P7kiaicibkA/640?wx_fmt=png)