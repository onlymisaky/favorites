> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [mp.weixin.qq.com](https://mp.weixin.qq.com/s/kl8Dwo_jFGRU2VwE3Vn62g)

Tailwind 是流行的原子化 css 框架。

有多流行呢？

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIqCImux7WdzibhOc6ASAIbF0e7icLvfE8fTI5UZBVkGfex7lSMibXLNgXA/640?wx_fmt=png)

它现在有 68k star 了，要知道 express 才 60k：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIqb34SBzfhcYH4KWzV2M749KtsgG1FCB18c4oWds1BrhJkEffX7bjicA/640?wx_fmt=png)

那什么是原子化 css？

我们平时写 css 是这样的：

```
<div class="aaa"></div>
```

```
.aaa {    font-size: 16px;    border: 1px solid #000;    padding: 4px;}
```

在 html 里指定 class，然后在 css 里定义这个 class 的样式。

也就是 class 里包含多个样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIib1L9okHpiaCUBc3SE9m9EGaNibTADnyNX4vLicb9TBGFbaZibmVoWuicI2Q/640?wx_fmt=png)

而原子化 css 是这样的写法：

```
<div class="text-base p-1 border border-black border-solid"></div>
```

```
.text-base {    font-size: 16px;}.p-1 {    padding: 4px;}.border {    border-width: 1px;}.border-black {    border-color: black;}.border-solid {    border-style: solid;}
```

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI90gTRllymRRggpxwVNhII8KRfz4Udiahyn42Qe2ic8z24jf9icLqhn9XA/640?wx_fmt=png)

定义一些细粒度的 class，叫做原子 class，然后在 html 里直接引入这些原子化的 class。

这个原子化 css 的概念还是很好理解的，但它到底有啥好处呢? 它解决了什么问题？

口说无凭，我们试下 tailwind 就知道了，它就是一个提供了很多原子 class 的 css 框架。

我们通过 crerate-react-app 创建一个 react 项目：

```
npx create-react-app tailwind-test
```

然后进入 tailwind-test 目录，执行

```
npm install -D tailwindcss
npx tailwindcss init
```

安装 tailwindcss 依赖，创建 tailwindcss 配置文件。

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI5PVyCc63ItP9NbTBDVyA45UEHFELrnVyyFHO1FIBmnsxt7taOfSQmQ/640?wx_fmt=png)

tailwind 实际上是一个 postcss 插件，因为 cra 内部已经做了 postcss 集成 tailwind 插件的配置，这一步就不用做了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIiaR0GhUtBwKG1dnXpB3GJz5z0NgWia7xcVBXfJoh0b7O2yjhcTs4Xv6Q/640?wx_fmt=png)

然后在入口 css 里加上这三行代码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIBXJSiaH13fk5ibibKkkHzIuX5n7UzePoU2Z28icOZOGsrWdQQocPcw2vaA/640?wx_fmt=png)

这三行分别是引入 tailwind 的基础样式、组件样式、工具样式的。

之后就可以在组件里用 tailwind 提供的 class 了：

```
import './App.css';function App() {  return (    <div className='text-base p-1 border border-black border-solid'>guang</div>  );}export default App;
```

我们执行 npm run start 把开发服务跑起来。

可以看到，它正确的加上了样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIG4NiczuzRqr4Z7oW4c0fxmgVsGZq8OEibYjf3oykhG08cMkicn5T8AAJQ/640?wx_fmt=png)

用到的这些原子 class 就是 tailwind 提供的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIBm1LxkL5AWeJUp9Yk4lAibmjOAqAmCSYLjRhqParo6iadib7T1IoiaduDA/640?wx_fmt=png)

这里的 p-1 是 padding:0.25rem，你也可以在配置文件里修改它的值：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIqiafgOjJLIfKDPn1mMecicNvTCvRib38xSoR9kGfMwplO5LnCeF8048Bw/640?wx_fmt=png)

在 tailwind.config.js 的 theme.extend 修改 p-1 的值，设置为 30px。

刷新页面，就可以看到 p-1 的样式变了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI92fFNEYf3Qq7F5QqVTuFrLdKvHXMHVibaIIVsKujcmqDKe82UsH3wsg/640?wx_fmt=png)

.text-base 是 font-size、line-height 两个样式，这种通过数组配置：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIdmuibJnTEyWp5lxOCNeO3jliapia4avv8BcZdumkmeoHgf1UiaRkAI0qvQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIytpAECXXzQDkV8ANNmB30m1KrMj74kA6RcKTFLzYP2MvJBSobPxm8g/640?wx_fmt=png)

也就是说所有 tailwind 提供的所有内置原子 class 都可以配置。

但这些都是全局的更改，有的时候你想临时设置一些值，可以用 [] 语法。

比如 text-[14px]，它就会生成 font-size:14px 的样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIUvOglAmNlicMMy2ibDRUzeclObfqLOA1DyLgokmZefEb6hyib9Ne1xOWQ/640?wx_fmt=png)

比如 aspect-[4/3]，就是这样的样式：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIbeJTJPItNiaBmELoQTyHG5ia5Bq9F7BZlsB7fBZrYoPOmcB5YHSCmGdQ/640?wx_fmt=png)

我们平时经常指定 hover 时的样式，在 tailwind 里怎么指定呢？

很简单，这样写：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIZYZQicHt0BwOWUOM2mxX3tDR1cgMB9BV4w7iccBgbhmiaMIvvzIfmTKnA/640?wx_fmt=png)

生成的就是带状态的 class：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIp1biaGl7x8o8FVKuUhofx64ic9jO2f3jV904zU1zlyPw5L3ibiceL6pd3g/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI8nG4hHNWTja1ym55kOH6IvcHrtBictlMUkK4OcZr9IApceSI12Mh1icQ/640?wx_fmt=gif)

此外，写响应式的页面的时候，我们要指定什么宽度的时候用什么样式，这个用 tailwind 怎么写呢？

也是一样的写法：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIhgbFxcbBmibTicnPeafMmDhY45EUsO20icZ8m79qsRF0zFcNcRx5qLCKQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI2mKqorzeOoUGAxnXCpapedPHud0803hXTH0uQeTd8jx7rIrhXSonwQ/640?wx_fmt=gif)

生成的是这样的代码：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIaHhc4eqLibmEjppxATGPT9lRHvpCQbRWMy19nZLTdYs9TB4cjNWbBcQ/640?wx_fmt=png)

这个断点位置自然也是可以配置的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIw50Ijdald60Lb0Nw3qVFCzYjcXPRZDUDfMIOER8RTSQibJibaflNCzFQ/640?wx_fmt=png)

可以看到 md 断点对应的宽度变了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddILzXoss3HB5FRWuFGCLyajvodzBrJ6e4hnnnAIs1w24hqmib3fdAl73A/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIbfxnwy6u0L8Qs6JzZtt6H7jDicXLRWZh8NmrFfiaf80NVaRRg6q83HQw/640?wx_fmt=gif)

光这些就很方便了。

之前要这么写：

```
<div class="aaa"></div>
```

```
.aaa {    background: red;    font-size: 16px;}.aaa:hover {    font-size: 30px;}@media(min-width:768px) {    .aaa {        background: blue;    }}
```

现在只需要这样：

```
<div class="text-[14px] bg-red-500 hover:text-[30px] md:bg-blue-500"></div>
```

省去了很多样板代码，还省掉了 class 的命名。

并且这些 class 都可以通过配置来统一修改。

感受到原子化 css 的好处了么？

tailwind 文档提到了 3 个好处：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIn0rvliayNHtfR8FEmISGhH9zJJrQJvZjbNPTicALQvUxhPRWycib6carQ/640?wx_fmt=png)

不用起 class 名字，这点简直太爽了，我就经常被起 class 名字折磨。

css 不会一直增长，因为如果你用之前的写法可能是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIfbu0ubpLjNFH9ibHIFmXJu8UbdbhwSeINeibtibgW4YQ4yU8BDxQibiaybg/640?wx_fmt=png)

多个 class 里都包含了类似的样式，但你需要写多次，而如果用了原子 class，就只需要定义一次就好了。

css 没有模块作用域，所以可能你在这里加了一个样式，结果别的地方样式错乱了。

而用原子 class 就没这种问题，因为样式是只是作用在某个 html 标签的。

我觉得光这三点好处就能够说服我用它了，特别是不用起 class 名字这点。

当然，社区也有一些反对的声音，我们来看看他们是怎么说的：

**一堆 class，可读性、可维护性太差了**

真的么？

这种把 css 写在 html 里的方式应该是更高效才对。

想想为啥 vue 要创造个单文件组件的语法，把 js、css、template 放在一个文件里写，不就是为了紧凑么？

之前你要在 css、js 文件里反复跳来跳去的，查找某个 class 的样式是啥，现在不用这么跳了，直接在 html 里写原子样式，它不香么？

而且 tailwindcss 就前面提到的那么几个语法，没啥学习成本，很容易看懂才对。

**但是还要每次去查文档哪些 class 对应什么样式呀**

这个可以用 tailwind css 提供的 vscode 插件来解决：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIWuxyFL9vw3fIMXicQYGg1nVaPOdqGUibzQMN4Jls4O4bHgOxzDC88ZaA/640?wx_fmt=png)

安装这个 Tailwind CSS IntelliSense 之后的体验是这样的：

![](https://mmbiz.qpic.cn/mmbiz_gif/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddILa9pykhAeI0yrVk3tU8M4u4cvHdxfbThiaCC4xcSiaNOibic993jAAcdvA/640?wx_fmt=gif)

有智能提示，可以查看它对应的样式。

不需要记。

**难以调试**

在 chrome devtools 里可以直接看到有啥样式，而且样式之间基本没有交叉，很容易调试：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIQALz4J0S5kGqUK58P26ddHVXwL410Lib1VVuFbwsia7DSwo1btzORCjw/640?wx_fmt=png)

相反，我倒是觉得之前那种写法容易多个 class 的样式相互覆盖，还要确定优先级和顺序，那个更难调试才对：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIJRjCp3jVmcdsVgx1sR7G2iatJ38gF7Cj6Dfib18ppkle8dxngXaZjicvA/640?wx_fmt=png)

**类型太长了而且重复多次**

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIbFBM683YUnzLialrYvZr5qaA51iaicVk0ju6GYRicbmicvuv7oHz0grGHRQ/640?wx_fmt=png)

这种问题可以用 @layer @apply 指令来扩展：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIe3xRGMgI8xTmc6ofRZhK2CgolvYow3ua42AhBFjQejPnFedQ8laeNQ/640?wx_fmt=png)

前面讲过 @tailwind 是引入不同的样式的，而 @layer 就是在某一层样式做修改和扩充，里面可以用 @apply 应用其他样式。

效果是这样的：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddINwLk3YOyXoh8l7LhCJic5Izf2ZO9VLCyK5NckUzezj0cZp1ZpRWxX0w/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI5aiaicwAq7ZRuBnwzYgHqvrTIh7icAXRgGCc2Sw1p0Su20GwXfDGwRDWQ/640?wx_fmt=png)

**内置 class 不能满足我的需求**

其实上面那个 @layer 和 @apply 就能扩展内置原子 class。

但如果你想跨项目复用，那可以开发个 tailwind 插件

```
const plugin = require('tailwindcss/plugin');module.exports = plugin(function({ addUtilities }) {    addUtilities({        '.guang': {            background: 'blue',            color: 'yellow'        },        '.guangguang': {            'font-size': '70px'        }    })})
```

在 tailwind.config.js 里引入：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIqibuVD0Dolp0UWjiaicicOw8sWn5K0wfbReGlvXEVGwZ8Lx7RANX0zyrmQ/640?wx_fmt=png)

这样就可以用这个新加的原子 class 了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIuVia0oib7GdZ84nsrHA8X5sR2bV4gZdiaib0ng7jcGzGPRcYVyGhEbzgGA/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddImy9JuFibIkvTtVpvmUH6Q533GqyD4TFA398Us3Z6owzdypKbxVn7evA/640?wx_fmt=png)

插件的方式或者 @layer 的方式都可以扩展。

**tailwind 的 class 名和我已有的 class 冲突了咋办？**

比如我本来有个 border 的 class：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIngMicVgpuziahTSCGjjiblcU0ibtjSm7ghws3bPZJVVmaPZBzN6IxAHDjw/640?wx_fmt=png)

而 tailwind 也有，不就冲突了么？

这个可以通过加 prefix 解决：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI5tOz2HwVnXtlSqKuqBKYbEiaur7J21Oga0X6MwewJN3JDjfdibzFzpRg/640?wx_fmt=png)

不过这样所有的原子 class 都得加 prefix 了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIzQh22SOkyTh2S9DoglZsU0PWXQGLZQFnKXru8QxokXRZhFf7YQAZmQ/640?wx_fmt=png)![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIiaY01o8Qb9ibCbANKGpZ6icMRPX5vHZXbZsyAzXGrHHe3ZRhNpfNye9FA/640?wx_fmt=png)

知道了什么是原子 css 以及 tailwind 的用法之后，我们再来看看它的实现原理。

tailwind 可以单独跑，也可以作为 postcss 插件来跑。这是因为如果单独跑的话，它也会跑起 postcss，然后应用 tailwind 的插件：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIUJz3GCdialP6aALSPic2Kv5rwLwN3iccw86jhQrXKee1ntXTkSRiaIEOCQ/640?wx_fmt=png)

所以说，**tailwind 本质上就是个 postcss 插件**。

postcss 是一个 css 编译器，它是 parse、transform、generate 的流程。

在 astexplorer.net 可以看到 postcss 的 AST：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddI4vxKjC2Qx6zOzBCOJgOUg2P1mmnyCwtYUpZibemicDEBe520dLhIrbwQ/640?wx_fmt=png)

而 postcss 就是通过 AST 来拿到 @tailwind、@layer、@apply 这些它扩展的指令，分别作相应的处理，也就是对 AST 的增删改查。

那它是怎么扫描到 js、html 中的 className 的呢？

这是因为它有个 extractor 的东西，用来通过正则匹配文本中的 class，之后添加到 AST 中，最终生成代码。

extractor 的功能看下测试用例就明白了：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIQXltAFVMNMuvulD6OxlWIxIDLs0oLXJB5YuooGMbt3xcua5wpFhZlg/640?wx_fmt=png)

所以说，**tailwind 就是基于 postcss 的 AST 实现的 css 代码生成工具，并且做了通过 extractor 提取 js、html 中 class 的功能。**

tailwind 还有种叫 JIT 的编译方式，这个原理也容易理解，本来是全部引入原子 css 然后过滤掉没有用到的，而 JIT 的话就是根据提取到的 class 来动态引入原子 css，更高效一点。

最后，为啥这个 css 框架叫 tailwind 呢？

因为作者喜欢叫做 kiteboarding 风筝冲浪的运动。

就是这样的，一个风筝，一个冲浪板：

![](https://mmbiz.qpic.cn/mmbiz_png/YprkEU0TtGia5gGicgUU1ZLiastY1KZ4ddIVsDeBCiargAVTvG3iaMjsQYKhCHqdYicPXxeSxsaf7agBqiay1kZHwSfww/640?wx_fmt=png)

这种运动在顺风 tailwind 和逆风 headwind 下有不同的技巧。而 tailwind 的时候明显更加省力。

所以就给这个 css 框架起名叫 tailwind 了。

确实，我也觉得用这种方式来写 css 更加省力、高效，不用写 class 名字了，代码更简洁了，还不容易样式冲突了。

总结
--

tailwind 是一个流行的原子化 css 框架。

传统 css 写法是定义 class，然后在 class 内部写样式，而原子化 css 是预定义一些细粒度 class，通过组合 class 的方式完成样式编写。

tailwind 用起来很简单：

所有预定义的 class 都可以通过配置文件修改值，也可以通过 aaa-[14px] 的方式定义任意值的 class。

所有 class 都可以通过 hover:xxx、md:xxx 的方式来添加某个状态下的样式，响应式的样式，相比传统的写法简洁太多了。

它的优点有很多，我个人最喜欢的就是不用起 class 的名字了，而且避免了同样的样式在多个 class 里定义多次导致代码重复，并且局部作用于某个标签，避免了全局污染。

它可以通过 @layer、@apply 或者插件的方式扩展原子 class，支持 prefix 来避免 class 名字冲突。

tailwind 本质上就是一个 postcss 插件，通过 AST 来分析 css 代码，对 css 做增删改，并且可以通过 extractor 提取 js、html 中的 class，之后基于这些来生成最终的 css 代码。

是否感受到了 tailwind 的简洁高效，易于扩展？就是这些原因让它成为了最流行的原子化 css 框架。