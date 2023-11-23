> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/id-d8Cq_RW0HXc9DTVjAVA)

scope hoisting 是 webpack 3 就已经实现的功能了，它能优化生成代码的性能，还能实现部分 tree shaking。

那什么是 scope hoisting，它又是怎么实现的呢？

我们一起来看一下：

这样一个 example.js 的入口模块，它引用了 a 模块：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamennibaLvHmxOxN3IezB9WuiasyuHlR7IFR8m72eQdMYPhicJqVxfWCe76SQ/640?wx_fmt=png)

a 模块导出了一个 a 变量，又引入了 x 模块：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenE3ibsnKicSpZRKWAvnvGADVUZGnFiaTGPZhyeg0P0PWtbH03Bdx4Y9nfQ/640?wx_fmt=png)

x 模块导出了 x 变量，引入了 y 模块：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen32MXhgClmTdlPjv8GiaoXZCIIh6BHsoTL0lF3eXjqvdnZMOjA8kMMpA/640?wx_fmt=png)

y 模块导出了 y 变量：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenWnAf8cseY9RC2AMepvL8aJNYsWyE3mnxSsyBwpS84hIIAwicHL1VdVg/640?wx_fmt=png)

就是一个模块的引用链条，比较容易搞懂：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen9DQZZYKrvPOcH0ABw7RmlFNG0f7HEAjhAhMfja7IKU78twKVt30rzw/640?wx_fmt=png)

有这样一个 webpack 配置文件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamensicd8n1SlvZhIXc6cTsksIIL2RuJOmwbBRvclCpNpxMbwZ5ya9LrsYg/640?wx_fmt=png)

开发模式，不生成 sourcemap，入口是 example.js。

生成的代码是这样的：

a、x、y 都被一个函数包裹：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenrtZeFXCDfYXjWgT1vKmUm08nzZK4d3vffpuTX3uqm1hx6SQv6ogcqQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamennH548W5Ln3wZoltNqFoBiaR0A9jia8EK35DHKIicQtOmClnr90hWIsEqQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenUEhauaWib7iae3ftfrN5uUT1kMnsydN1iaicYhgp6GKbpiaZDfSQTBxzoNQ/640?wx_fmt=png)

然后在入口模块引入：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen4wu03vI5Uypp9SjicYnv031n7JAS3chWWATme3A47afHuzoiclIPDxvQ/640?wx_fmt=png)

这个很正常，因为浏览器里实现模块就是用函数的方式嘛。

这是没有开启 scope hositing 的时候。

我们接下来开启 scope hositing 看看会发生什么。

开启的话加一个 optimization.concatenateModules 为 true 的配置就好了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenoZ9btAybHrnWI3IlRx9poC2h4TqpgPdFNaTtJLbkkE8QcOOcmKMHUg/640?wx_fmt=png)

concatenateModules 是连接模块的意思。

重新执行 webpack，这时候生成的代码是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenU68OJJrmMTsibrDsK0l9ibvSZWcUYuwym7kic7Qsul8TicdspdgUx9gPibw/640?wx_fmt=png)

a、x、y 模块的代码被合并到了一个函数作用域里。

这就是 scope hoisting 的功能。

有的同学说，这样合并有问题的吧，如果有同名变量怎么办？

我们试一下：

在 a 模块定义了一个 aa 变量：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenS2ibIpcEVASKFp51264h419q562PdwHary20O86mFH4jibfgk7RmzAicA/640?wx_fmt=png)

在 x 模块也定义了一个 aa 变量：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamensxDMVcbsRGSEWianq8RNklOz2kiajyE5pVWO2UO8kXFJbUvxBQPWY59A/640?wx_fmt=png)

重新跑下 webpack，生成的代码是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenCnHSDTLzkVPriaokWFFKJqS4v39JwC2iaib8VzyDoW2oaTC3v4DvYCfHw/640?wx_fmt=png)

可以看到同名的变量被加上文件名的前缀（上面一张图重复了忘删了）：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen57WkCkD5d3saRYrQuMjPWmOlJQGBqQEIxw2xAk6JmDPXhuZMZj3VVg/640?wx_fmt=png)

这样同名变量经过重命名后，就不再会冲突了。

那 scope hoisting 有什么好处呢？

很容易想到的是性能的提升，本来要创建好几个函数的闭包，因为被别的函数作用域引用嘛，现在只需要创建一个了，占据的内存会更小。

再就天然能实现 tree shaking。

比如 x 模块里导出了一个 x2 变量，这个变量没有被使用：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenTDl6bgvnc5BmxFdAfYkpTWpXg34LuYEuibIgh5mVO4nl0oRCLIV2ibJw/640?wx_fmt=png)

不开启 scope hositing 的时候，生成的代码是这样的，它会被导出，只是没被使用：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenrexWHAiaEa1uq4N6kzEpLFmsF5Qnz8Tvem88HARt8KiaxXAZW2P5Bobg/640?wx_fmt=png)

这时候如果你要删掉它，你需要分析模块之间的依赖关系，导出的变量哪些被使用了，哪些没被使用。

还要保证这段代码没有副作用，才能把它删除掉。

也就是 tree shaking 掉。

但如果 scope hositing 了之后呢？

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamensfn5CIuFy1jw0xQnweLNdauqIo95nWAbGlmO1Qiaicb2rMVWLf5y4vcA/640?wx_fmt=png)

这时你能很容易的分析出变量引用关系，然后把它删掉。

这个都不用 webpack 做，直接用 TerserWebpackPlugin 这种压缩的插件来做就行。

所以说，当实现了 scope hositing 之后，天然就支持了部分模块的 tree shaking。

为什么说是部分呢？

因为 scope hositing 也是有限制条件的。

可以在文档里看到这些，叫做 optimization bailouts，优化的退出条件，意思就是这些情况下不会做 scope hositing：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenjvX5r0xDZVNvzUuepevicShWzhMLE4wyv3iciaCFA5pAsa2VhBEJaYARA/640?wx_fmt=png)

一个个来看：

**Non ES6 Module 不会做 scope hoisting。**

这个很容易理解，只有 es module 的依赖关系才是能被分析的，都不是 es module 怎么正确分析依赖关系，怎么 hositing 呢？

**export * from "cjs-module" 不会做 scope hositing**

这个同上，一旦模块引入了 cjs module，那就不可以分析依赖关系了，所以也就不能 hoisting。

**use eval() 不会做 scope hositing**

这个也容易理解，eval 的代码你不能保证有啥东西，去掉 scope，合在一起很容易出问题。

**using module 或者用了 ProvidePlugin 的变量，不会被 scope hositing。**

用到了 module 变量之后，你合并成了一个模块，那这个 module 不就没了么？

所以用了 module 变量不会被 hositing。

用了 ProvidePlugin 注入的变量也差不多。

**In Multiple Chunks 不会被 scope hositing。**

要是被多个 chunk 用到了，那 hositing 之后，代码不就重复了多次么？

所以只有被一个 chunk 用到的模块才会被 hositing 优化。

这些不会触发 scope hositing 的情况倒是都挺容易理解的。

我们挑几个来试一下：

比如我在 y 模块用一个 eval：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenWcBic0j8RcFaD2wCEyVCU4EOZtpSbA3WfbXI5DOEzxLEXqy0ExJU1iaw/640?wx_fmt=png)

跑下 webpack，这时生成的代码是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkameniagbKeTr6VQh3zJMic5P5lBniarRmcHanTjicBOAOtwBTrbnBMKZBwiaoew/640?wx_fmt=png)

其他 3 个模块都被 scope hositing 了，就是这个 y 变成了从别的模块引入的方式。

可以看到在上面单独定义了 y 模块：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenRQuDejKmTib5kwDMe27h4lULR9PWIoS7m7folvm9KECNHZYcg8Vy60g/640?wx_fmt=png)

这就是规则里说的，有 eval 的模块不会触发 scope hositing。

我们再来看看被多 chunk 引入的情况：

添加这样一个 lazy 模块，引入 x 模块：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenTgshOnotmyTiavTSPMNsW92h5KI8GPOXasib3HcDN7a2Eeg5zzGTICEA/640?wx_fmt=png)

然后在 example 里异步引入它：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenyKsGAY7ZgtSL8Feyx5Nv7mwPTNa0qO7AZMicRYKia0q8e5OWUM3vN3UQ/640?wx_fmt=png)

异步引入的模块是会被分到单独的 chunk 的。

我们重新跑下 webpack 试试。

确实，lazy 的模块单独分了一个 chunk：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenRwOIgKwyrJd9YD5Xt2OXnvSHopiaRG3wgtqcrTypMYCa7kCOw3GWykg/640?wx_fmt=png)

因为 x 被 lazy 引用了，而 y 被 x 引用。

所以 scope hositing 是这样做的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenibeqKePNSjPHVN1Eagf2Pj6LQ7ibXiacG6YYDNCN0bM2DT6v7Tvc2CbPQ/640?wx_fmt=png)

example 和 a 被 hositing 到一个模块了，而 x 单独引入的。

而这个 x 模块里把 x、y 给 hosting 成一个模块了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenc4yiavXU2sOBU0dupuFmjaPuoMnpupB6J8dZDYb4l0T1pZN71IaqDmQ/640?wx_fmt=png)

这就是模块在多个 chunk 时，会把它单独摘出来，不会被 scope hositing。

知道了什么是 scope hositing，什么时候会触发 scope hositing，哪些情况不会。

我们再来看看它的实现原理。

其实这个 optimization.concatenateModules 的配置不用自己开启：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenjULkGI6g76zjXlB8e58DyRU7bk2uSh0yLm1kia2mVibqqb5Ly9ECjSUw/640?wx_fmt=png)

当你把 mode 设置为 production 的时候，默认就会开启这个选项。

而开启这个选项的时候，内部会应用 ModuleConcatenationPlugin 这个插件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen0rK7vDyPx5GsibYiaCEYHbcn1BtEwIX7kvNEPJKOqNHIpmnGYmrFxPmw/640?wx_fmt=png)

也就是说 scope hositing 的功能就是 ModuleConcatenationPlugin 这个插件实现的。

webpack 的流程分为 3 步：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenLA0WHb2PE2elLgawcH660iaw5UPWsSanFzyvHYiaGxgv7jxDTNHuhVuQ/640?wx_fmt=png)

make 是从入口模块开启，递归解析依赖，生成模块依赖图 ModuleGraph。

seal 阶段是把 module 分到不同的 chunk，也就是分组，生成 ChunkGraph。

emit 阶段把每个 chunk 使用模版打印出来，生成代码，也就是 assets。

之后把 assets 写入磁盘就好了。

ModuleConcatenationPlugin 这个插件在 optimizeChunkModules 这个 hook 生效，

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenfVFXGV4vabPu9qBvQEG45PvSDrsKRQl2L0YjS7BSSYrzw4vGU8n17A/640?wx_fmt=png)

这是 seal 阶段的一个 hook：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen1sQSicb0Dv7AzINqMzXibxDxZH8XJcB5bM1IT5bIjfhNQRQBdTGWxWcw/640?wx_fmt=png)

这时候 moduleGraph、chunkGraph 都有了，可以从 compilation 对象里拿到。

这个插件逻辑还是比较复杂的，我们理一下主流程好了：

这个插件会遍历所有模块，把不适合 scope hositing 的模块过滤掉，同时记录下不合适的原因。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenQslkUFSguABIpJJibJOibEErAfviczvLlmtG0lsfCQFoozriccm7gSR0jQ/640?wx_fmt=png)

最后剩下的有的是入口模块，有的是其他的可以被 scope hositing 的模块，分别放到两个集合中：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenFc6e44kG6c7rL21m5FlMpbJiaADFhWg7yeRQ8X8knVicj8h8LMia9v5JQ/640?wx_fmt=png)

然后从每个入口模块开始，递归分析 import，把可以被 scope hositing 的模块都放到这个 ConcatConfiguration 对象里：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenIDicRN0lRicmULVqGKKZ6F9xpl7sls8CKV6SPicGQC4KgVS3KhaOOqTSg/640?wx_fmt=png)

这个对象的作用就是记录根模块和子模块：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenyQ7uC2nOY4dDrSDgia78a3rUkjnQVcspFJ3EfwWZrthiccCo64d3TP3w/640?wx_fmt=png)

这是一个可以被 scope hositing 的单位。

然后它会遍历这些配置对象来创建一个个新的 module 对象：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenwic8Y1VEroEDfkns36V2u8okQy1O98fzglzG03wLTISOtq88foiccZlQ/640?wx_fmt=png)

这些新的 module 对象包含的子 module 都是可以被一起 scope hositing 的。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen5SclbEAAJic3zXPhoWWVT5aaGv0Jb2DY8icibKvVjXYqKItjamTbicrSvg/640?wx_fmt=png)

这是一个继承了 webpack 的 Module 类的特殊的 Module 类。

然后把这个 module 包含的子 module 从之前的 chunk 里删掉，

之后把这个 module 替换成新的 module。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenoQGdH0HCdrhONbw0ibibesHavGSceuxtXjfdZiaugfRBKxhaa3rTAxR6w/640?wx_fmt=png)

替换成 ConcatenatedModule 类型的新 module 对象有什么用呢？

作用在代码生成阶段。

代码生成的时候会调用每个 module 对象的 codeGeneration 方法：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenNhnDOe5pIuM1LhJ3sk102icsHiaHH4wOqlPDP9LdATcJg8gEIznvVdNA/640?wx_fmt=png)

而这个 module 对象是我们前面替换的 ConcatenatedModule 类型的，它重写了 codeGeneration 方法

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenUsYl566p7uP9wCF5DnM75lLBXbMuZOTqzibOYrF4Wic9QmoCaywYswmg/640?wx_fmt=png)

会遍历模块，根据类型分别打上 concatenated 和 external 的标记：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenBo90UXibCVR4PxBFeBGFBDxT7RFGiaUcJibRdpzsdSt4MDID7Xmg6mZOQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenZc7ib9S9seC5Q6wu9mm8RfA451qYIy7gia1aomdxXYAqtvRTOUupsiblA/640?wx_fmt=png)

也就是是单独一个模块，还是合并到一起。

之后拼接代码字符串的时候就会根据不同的类型做不同的处理。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamendhZ0IWtzAAgibTkuCyrplJPYX8Nf0Qic9viaYQbk77F37DgeO4Ip9zzgg/640?wx_fmt=png)

对 concatenated 类型的模块，还会对每个顶层的变量通过 AST 查找是否有同名变量，有的话就重命名。

拼接代码的时候也是用不同的模版：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamen7y2Y15vm0nVZ7b0y5RhmcrcDHu35hDFWCPpWYzBqy9HDRcibDfLdqfQ/640?wx_fmt=png)

上面这段字符串是不是觉得眼熟？

没错，这部分就是在拼接最终生成的这种代码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenpiaBN5HRC1jqGt5DZ6dnRnLM8rWUSG20lRia5f9rSBScXibHcHhA0wiaHg/640?wx_fmt=png)

可以对比下：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGj8Na6HKpIzk4WoicAjkamenWn6VGRicBrqibzbQY9tZvcWsBxicRlyky1icNxqzXIUmuS7YHSt9pkTLrw/640?wx_fmt=png)

这样我们就走完了这个插件的逻辑还有最终代码生成的逻辑。

这就是 scope hoisting 的实现原理。

总结
--

scope hosiitng 可以把一些模块的代码合并成一个模块作用域里，这样性能会更高，而且配合压缩插件就可以实现 tree shaking。

同名的变量也不用担心，scope hositing 的时候会做重命名。

当然，也不是所有的模块都可以 scope hositing，有一些模块不可以，主要是被多个 chunk 包含的模块、有 cjs 代码的模块、有 eval 的模块、用到了 module 变量的模块。

这些类型的模块不能被 scope hoisting 的原因也很容易理解，比如 cjs、eval 的代码不能被分析、被多个 chunk 包含的模块如果 hositing 会重复等等。

scope hositing 的功能需要开启 optimization.concatenateModules 的配置项，或者设置 mode 为 production，它的底层就是 ModuleConcatenationPlugin 这个插件。

webpack 分为 make、seal、emit 3 个阶段，这个插件在 seal 阶段的 optimizeChunkModules 的 hook 生效。

它会遍历模块，根据规则过滤出可以被 scope hositing 的入口模块和其他模块，放到一个 ConcatConfiguration 对象里。

然后遍历这个对象，生成 ConcatenatedModule 类型的 module 替换之前的 module。

这样当代码生成阶段，就会调用 ConcatenatedModule 的 codeGeneration 方法，这里做了模块类型的区分，同名变量的重命名，以及最终模块代码的拼接。

这样生成的代码就是 scope hositing 的代码了。

这就是 scope hositing 的实现原理，它是 webpack 的基础功能之一，而且也实现了部分 tree shaking。