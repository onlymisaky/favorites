> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/JSlJn_LzbkAOy6LNyY5_jQ)

大家好，我是年年。如果被问到 “CommonJS 和 ES Module 的差异”，大概每个前端都都背出几条：一个是导出值的拷贝，一个是导出值的引用；一个是运行时加载，一个是静态编译...

这篇文章会聚焦于遇到 “循环引入” 时，两者的处理方式有什么不同，这篇文章会讲清：

1.  CommonJS 和 ES Module 对于循环引用的解决原理是什么？
    
2.  CommonJS 的 module.exports 和 exports 有什么不同？
    
3.  引入模块时的路径解析规则是什么。
    

JavaScript 的模块化
===============

首先说说为什么会有两种模块化规范。众所周知，早期的 JavaScript 是没有模块的概念，引用第三方包时都是把变量直接绑定在全局环境下。

以 axios 为例，以 script 标签引入时，实际是在 window 对象上绑定了一个 axios 属性。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHDGPrm4icqwLkd7EsAZMbrDboBM9VzcZ9lRJk6TaKDIxCET5VaKqc6kA/640?wx_fmt=png)

这种全局引入的方式会导致两个问题，变量污染和依赖混乱。

1.  变量污染：所有脚本都在全局上下文中绑定变量，如果出现重名时，后面的变量就会覆盖前面的
    
2.  依赖混乱：当多个脚本有相互依赖时，彼此之间的关系不明朗
    

所以需要使用 “模块化” 来对不同代码进行隔离。其实模块化规范远不止这两种，JavaScript 官方迟迟没有给出解法，所以社区实现了很多不同的模块化规范，按照出现的时间前后有 CommonJS、AMD、CMD、UMD。最后才是 JavaScript 官方在 ES6 提出的 ES Module。

听着很多，但其实只用重点了解 CommonJS 和 ES Module，一是面试基本只会问这两个，二是实际使用时用得多的也就是这两个。

CommonJS
========

CommonJS 的发明者希望它能让服务端和客户端通用（Common）。但如果一直从事纯前端开发，应该对它不太熟悉，因为它原本是叫 ServerJS，它主要被应用于 Node 服务端。

该规范把每一个文件看作一个模块，首先看它的基本使用：

```
// index.js 导入const a = require("./a.js")console.log('运行入口模块')console.log(a)// a.js 导出exports.a = 'a模块'console.log('运行a模块');
```

我们使用`require`函数作模块的引入，使用`exports`对象来做模块的导出，这里的`require` `exports`正是 CommmonJS 规范提供给我们的，使用断点调试，可以看到这几个核心变量：

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHpcd86ZfyjjCcPPNd8MCtCWXkXiagicTicVU137B3zM7YzBO7uWz7BC7MQ/640?wx_fmt=png)

1.  exports 记录当前模块导出的变量
    
2.  module 记录当前模块的详细信息
    
3.  require 进行模块的导入
    

exports 导出
----------

首先来看 exports 导出，面试经常会问的一个题目是 exports 和 module.exports 区别是什么。两者指向同一块内存，但是使用并不是完全等价的。

1.  当绑定一个属性时，两者相同
    

```
exports.propA = 'A';module.exports.propB = 'B';
```

2.  不能直接赋值给 exports，也就是不能直接使用 exports={} 这种语法
    

```
// 失败exports = {propA:'A'};// 成功module.exports = {propB:'B'};
```

虽然两者指向同一块内存，但最后被导出的是 module.exports，所以不能直接赋值给 exports。

同样的道理，只要最后直接给 module.exports 赋值了，之前绑定的属性都会被覆盖掉。

```
exports.propA = 'A';module.exports.propB = 'B';module.exports = {propC:'C'};
```

用上面的例子所示，先是绑定了两个属性 propA 和 propB，接着给 module.exports 赋值，最后能成功导出的只有 propC。

require 导入
----------

CommonJS 的引入特点是值的拷贝，简单来说就是把导出值复制一份，放到一块新的内存中。

### 循环引入

接下来进入正题，CommonJS 如何处理循环引入。

首先来看一个例子：入口文件引用了 a 模块，a 模块引用了 b 模块，b 模块却又引用了 a 模块。可以思考一下会输出什么.

```
//index.jsvar a = require('./a')console.log('入口模块引用a模块：',a)// a.jsexports.a = '原始值-a模块内变量'var b = require('./b')console.log('a模块引用b模块：',b)exports.a = '修改值-a模块内变量'// b.jsexports.b ='原始值-b模块内变量'var a = require('./a')console.log('b模块引用a模块',a)exports.b = '修改值-b模块内变量'
```

输出结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHT8cmhOWsfIpiazGic1NfNYmntrVLtRiakAluMjdzpy6ibIAib09u28BXxUg/640?wx_fmt=png)

这种 AB 模块间的互相引用，本应是个死循环，但是实际并没有，因为 CommonJS 做了特殊处理——模块缓存。

依旧使用断点调试，可以看到变量 require 上有一个属性`cache`，这就是模块缓存

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxH6e2Mv5aHaRCjtGZCqbIUAGIytxaosBxSQLC77JeJ4kA0BricUyqSMyA/640?wx_fmt=png)

一行行来看执行过程，

1.  【入口模块】开始执行，把入口模块加入缓存，
    
2.  var a = require('./a') 执行 将 a 模块加入缓存，进入 a 模块，
    
3.  【a 模块】exports.a = '原始值 - a 模块内变量'执行，a 模块的缓存中给变量 a 初始化，为原始值，
    
4.  执行 var b = require('./b')，将 b 模块加入缓存，进入 b 模块
    
5.  【b 模块】exports.b ='原始值 - b 模块内变量'，b 模块的缓存中给变量 b 初始化，为原始值，
    
6.  var a = require('./a')，尝试导入 a 模块，发现已有 a 模块的缓存，所以不会进入执行，而是直接取 a 模块的缓存，此时打印`{ a: '原始值-a模块内变量' }`,
    
7.  exports.b = '修改值 - b 模块内变量 执行，将 b 模块的缓存中变量 b 替换成修改值，
    
8.  【a 模块】console.log('a 模块引用 b 模块：',b) 执行，取缓存中的值，打印`{ b: '修改值-b模块内变量' }`
    
9.  exports.a = '修改值 - a 模块内变量' 执行，将 a 模块缓存中的变量 a 替换成修改值，
    
10.  【入口模块】console.log('入口模块引用 a 模块：',a) 执行，取缓存中的值，打印`{ a: '修改值-a模块内变量' }`
    

上面就是对循环引用的处理过程，循环引用无非是要解决两个问题，怎么避免死循环以及输出的值是什么。CommonJS 通过模块缓存来解决：每一个模块都先加入缓存再执行，每次遇到 require 都先检查缓存，这样就不会出现死循环；借助缓存，输出的值也很简单就能找到了。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHiaJuBsEKaf5r0uibXKtRIAYFtGTLd8rSb5dAboLRMfjYkp3yg62msymQ/640?wx_fmt=png)

### 多次引入

同样由于缓存，一个模块不会被多次执行，来看下面这个例子：入口模块引用了 a、b 两个模块，a、b 这两个模块又分别引用了 c 模块，此时并不存在循环引用，但是 c 模块被引用了两次。

```
//index.jsvar a = require('./a')var b= require('./b')// a.jsmodule.exports.a = '原始值-a模块内变量'console.log('a模块执行')var c = require('./c')// b.jsmodule.exports.b = '原始值-b模块内变量'console.log('b模块执行')var c = require('./c')// c.jsmodule.exports.c = '原始值-c模块内变量'console.log('c模块执行')
```

执行结果如下：

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHAHmsHT2TaHIAXKezpp20XBAGPrTahtEZx8W0QdVc2piacARuMt5EY3g/640?wx_fmt=png)

可以看到，c 模块只被执行了一次，当第二次引用 c 模块时，发现已经有缓存，则直接读取，而不会再去执行一次。

### 路径解析规则

路径解析规则也是面试常考的一个点，或者说，为什么我们导入时直接简单写一个'react'就正确找到包的位置。

仔细观察 module 这个变量，可以看到还有一个属性`paths`

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHicBMic5Q57ZPxBMibxMCt9Dvicx8jta7vYMOt7jicCuHVOcZMlmtLTfwbIg/640?wx_fmt=png)

首先把路径作一个简单分类：内置的核心模块、本地的文件模块和第三方模块。

1.  对于核心模块，node 将其已经编译成二进制代码，直接书写标识符 fs、http 就可以
    
2.  对于自己写的文件模块，需要用‘./’'../'开头，require 会将这种相对路径转化为真实路径，找到模块
    
3.  对于第三方模块，也就是使用 npm 下载的包，就会用到`paths`这个变量，会依次查找当前路径下的 node_modules 文件夹，如果没有，则在父级目录查找 no_modules，一直到根目录下，找到为止。
    

在 node_modules 下找到对应包后，会以 package.json 文件下的 main 字段为准，找到包的入口，如果没有 main 字段，则查找 index.js/index.json/index.node

ES Module
=========

尽管名为 CommonJS，但并不 Comomn（通用），它的影响范围还是仅仅在于服务端。前端开发更常用的是 ES Module。

ES Module 使用 import 命令来做导入，使用 export 来做导出，语法相对比较复杂，熟悉可以先跳过这一部分

1.  普通导入、导出
    

```
// index.mjsimport {propA, propB,propC, propD} from './a.mjs'// a.mjsconst propA = 'a';let propB = () => {console.log('b')};var propC = 'c';export { propA, propB, propC };export const propD = 'd'
```

使用 export 导出可以写成一个对象合集，也可以是一个单独的变量，需要和 import 导入的变量名字一一对应

2.  默认导入、导出
    

```
// 导入函数import anyName from './a.mjs'export default function () {    console.log(123)}// 导入对象import anyName from './a.mjs'export default {  name:'niannian';  location:'guangdong'}// 导入常量import anyName from './a.mjs'export default 1
```

使用 export default 语法可以实现默认导出，可以是一个函数、一个对象，或者仅一个常量。默认的意思是，使用 import 导入时可以使用任意名称，

3.  混合导入、导出
    

```
// index.mjsimport anyName, { propA, propB, propC, propD } from './a.mjs'console.log(anyName,propA,propB,propC,propD)// a.mjsconst propA = 'a';let propB = () => {console.log('b')};var propC = 'c';// 普通导出export { propA, propB, propC };export const propD = 'd'// 默认导出export default function sayHello() {    console.log('hello')}
```

4.  全部导入
    

```
// index.mjsimport * as resName from './a.mjs'console.log(resName)// a.mjsconst propA = 'a';let propB = () => {console.log('b')};var propC = 'c';// 普通导出export { propA, propB, propC };export const propD = 'd'// 默认导出export default function sayHello() {    console.log('hello')}
```

结果如下

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHdI6sC9v1ZYzZcBz3UItgmwiaaNa0JCYRCm2lFybG4EicZf7OKHRULS0Q/640?wx_fmt=png)

5.  重命名导入
    

```
// index.mjsimport {  propA  as renameA,   propB as renameB, propC as renameC , propD as renameD } from './a.mjs'const propA = 'a';let propB = () => {console.log('b')};var propC = 'c';// a.mjsexport { propA, propB, propC };export const propD = 'd'
```

6.  重定向导出
    

```
export * from './a.mjs' // 第一种export { propA, propB, propC } from './a.mjs' // 第二种export { propA as renameA, propB as renameB, propC as renameC } from './a.mjs' //第三种
```

*   第一种方式：重定向导出所有导出属性， 但是不包括模块的默认导出。
    
*   第二种方式：以相同的属性名再次导出。
    
*   第三种方式：从模块中导入 propA，重命名为 renameA 导出
    

7.  只运行模块
    

```
import './a.mjs'
```

export 导出
---------

ES Module 导出的是一份值的引用，CommonJS 则是一份值的拷贝。也就是说，CommonJS 是把暴露的对象拷贝一份，放在新的一块内存中，每次直接在新的内存中取值，所以对变量修改没有办法同步；而 ES Module 则是指向同一块内存，模块实际导出的是这块内存的地址，每当用到时根据地址找到对应的内存空间，这样就实现了所谓的 “动态绑定”。

可以看下面这个例子，使用 ES Module 导出一个变量 1 和一个给变量加 1 的方法

```
// b.mjsexport let count = 1;export function add() {  count++;}export function get() {  return count;}// a.mjsimport { count, add, get } from './b.mjs';console.log(count);    // 1add();console.log(count);    // 2console.log(get());    // 2
```

可以看到，调用 add 后，导出的数字同步增加了。

但使用 CommonJS 实现这个逻辑：

```
// a.jslet count = 1;module.exports = {  count,  add() {    count++;  },  get() {    return count;  }};// index.jsconst { count, add, get } = require('./a.js');console.log(count);    // 1add();console.log(count);    // 1console.log(get());    // 2
```

可以看到，在调用 add 对变量 count 增加后，导出 count 没有改变，因为 CommonJS 基于缓存实现，入口模块中拿到的是放在新内存中的一份拷贝，调用 add 修改的是模块 a 中这块内存，新内存没有被修改到，所以还是原始值，只有将其改写成方法才能获取最新值。

import 导入
---------

ES module 会根据 import 关系构建一棵依赖树，遍历到树的叶子模块后，然后根据依赖关系，反向找到父模块，将 export/import 指向同一地址。

### 循环引入

和 CommonJS 一样，发生循环引用时并不会导致死循环，但两者的处理方式大有不同。如果阅读了上文，应该还记得 CommonJS 对循环引用的处理基于他的缓存，即：将导出值拷贝一份，放在一块新的内存，用到的时候直接读取这块内存。

但 ES module 导出的是一个索引——内存地址，没有办法这样处理。它依赖的是 “模块地图” 和“模块记录”，模块地图在下面会解释，而模块记录是好比每个模块的“身份证”，记录着一些关键信息——这个模块导出值的的内存地址，加载状态，在其他模块导入时，会做一个“连接”——根据模块记录，把导入的变量指向同一块内存，这样就是实现了动态绑定，

来看下面这个例子，和之前的 demo 逻辑一样：入口模块引用 a 模块，a 模块引用 b 模块，b 模块又引用 a 模块，这种 ab 模块相互引用就形成了循环

```
// index.mjsimport * as a from './a.mjs'console.log('入口模块引用a模块：',a)// a.mjslet a = "原始值-a模块内变量"export { a }import * as b from "./b.mjs"console.log("a模块引用b模块：", b)a = "修改值-a模块内变量"// b.mjslet b = "原始值-b模块内变量"export { b }import * as a from "./a.mjs"console.log("b模块引用a模块：", a)b = "修改值-b模块内变量"
```

运行代码，结果如下。

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHwEK5Rn2gtzQ2hiajW3cWtsZ6YSdzddvHpB2p65eSzzKoqfybiaWHic0KA/640?wx_fmt=png)

值得一提的是，import 语句有提升的效果，实际执行可以看作这样：

```
// index.mjsimport * as a from './a.mjs'console.log('入口模块引用a模块：',a)// a.mjsimport * as b from "./b.mjs"let a = "原始值-a模块内变量"export { a }console.log("a模块引用b模块：", b)a = "修改值-a模块内变量"// b.mjsimport * as a from "./a.mjs"let b = "原始值-b模块内变量"export { b }console.log("b模块引用a模块：", a)b = "修改值-b模块内变量"
```

可以看到，在 b 模块中引用 a 模块时，得到的值是 uninitialized，接下来一步步分析代码的执行。

在代码执行前，首先要进行预处理，这一步会根据 import 和 export 来构建模块地图（Module Map），它类似于一颗树，树中的每一个 “节点” 就是一个模块记录，这个记录上会标注导出变量的内存地址，将导入的变量和导出的变量连接，即把他们指向同一块内存地址。不过此时这些内存都是空的，也就是看到的 uninitialized。

接下来就是代码的一行行执行，import 和 export 语句都是只能放在代码的顶层，也就是说不能写在函数或者 if 代码块中。

1.  【入口模块】首先进入入口模块，在模块地图中把入口模块的模块记录标记为 “获取中”（Fetching），表示已经进入，但没执行完毕，
    
2.  import * as a from './a.mjs' 执行，进入 a 模块，此时模块地图中 a 的模块记录标记为 “获取中”
    
3.  【a 模块】import * as b from './b.mjs' 执行，进入 b 模块，此时模块地图中 b 的模块记录标记为 “获取中”，
    
4.  【b 模块】import * as a from './a.mjs' 执行，检查模块地图，模块 a 已经是 Fetching 态，不再进去，
    
5.  let b = '原始值 - b 模块内变量' 模块记录中，存储 b 的内存块初始化，
    
6.  console.log('b 模块引用 a 模块：', a) 根据模块记录到指向的内存中取值，是 { a:}
    
7.  b = '修改值 - b 模块内变量' 模块记录中，存储 b 的内存块值修改
    
8.  【a 模块】let a = '原始值 - a 模块内变量' 模块记录中，存储 a 的内存块初始化，
    
9.  console.log('a 模块引用 b 模块：', b) 根据模块记录到指向的内存中取值，是 { b: '修改值 - b 模块内变量' }
    
10.  a = '修改值 - a 模块内变量' 模块记录中，存储 a 的内存块值修改
    
11.  【入口模块】console.log('入口模块引用 a 模块：',a) 根据模块记录，到指向的内存中取值，是 { a: '修改值 - a 模块内变量' }
    

总结一下：和上面一样，循环引用要解决的无非是两个问题，保证不进入死循环以及输出什么值。ES Module 来处理循环使用一张模块间的依赖地图来解决死循环问题，标记进入过的模块为 “获取中”，所以循环引用时不会再次进入；使用模块记录，标注要去哪块内存中取值，将导入导出做连接，解决了要输出什么值。

结语
==

回到开头的三个问题，答案在文中不难找到：

1.  CommonJS 和 ES Module 都对循环引入做了处理，不会进入死循环，但方式不同：
    

*   CommonJS 借助模块缓存，遇到 require 函数会先检查是否有缓存，已经有的则不会进入执行，在模块缓存中还记录着导出的变量的拷贝值；
    
*   ES Module 借助模块地图，已经进入过的模块标注为获取中，遇到 import 语句会去检查这个地图，已经标注为获取中的则不会进入，地图中的每一个节点是一个模块记录，上面有导出变量的内存地址，导入时会做一个连接——即指向同一块内存。
    

3.  CommonJS 的 export 和 module.export 指向同一块内存，但由于最后导出的是 module.export，所以不能直接给 export 赋值，会导致指向丢失。
    
4.  查找模块时，核心模块和文件模块的查找都比较简单，对于 react/vue 这种第三方模块，会从当前目录下的 node_module 文件下开始，递归往上查找，找到该包后，根据 package.json 的 main 字段找到入口文件。
    

福利抽奖时间（包邮送书！）
=============

**《Vue.js 从入门到项目实战 (升级版)》**

![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHwmIeJSSYkPnOdjJLdNp5YBpwNicq4PgLGt3My9gXwexSrhgL1gKIOoA/640?wx_fmt=png)

参与方式
----

1.  扫码添加年年的微信，备注 “抽奖”，拉你进抽奖群
    
2.  开奖日期以及方式：2022 年 07 月 01 日 23:00 群内拼手气红包抽奖，抽取 2 位幸运观众
    
      
    
    ![](https://mmbiz.qpic.cn/mmbiz_png/cpWiaicnZTauZyNibViayh0lqUsQFhibMibwxHZXcWKYlJQtLkjoXohCRPv9HWNjApYrt2Sw2hoRlNKrC9zk6CkJXRGg/640?wx_fmt=png)
    

如果觉得这篇文章对你有帮助，给我点个赞和在看吧～这对我很重要

你的支持是我创作的最大动力！❤️